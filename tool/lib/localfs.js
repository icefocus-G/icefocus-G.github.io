/* =============================================================================
 * localfs.js —— 「本地路径一次设置，之后自动记住」通用模块
 *
 * 用途：静态网页（GitHub Pages 上的工具页）也能让用户指定自己电脑上的目录 / 文件，
 *      并把选择结果记住：换台电脑各自设一次，同一台电脑下次打开直接沿用。
 *
 * 实现：File System Access API（Chrome / Edge 等 Chromium 内核）+ IndexedDB。
 *       · 目录 / 文件的「句柄」存进 IndexedDB，刷新、关机、重开浏览器都还在；
 *       · 句柄只属于当前浏览器 + 当前电脑，天然做到「不同电脑各自记各自的」；
 *       · 重新打开时先 queryPermission，还是 prompt 就显示一个「授权」按钮，
 *         点一下（用户手势）即恢复读写权限，不需要重新选目录。
 *
 * 用法：
 *   LocalFS.mountPanel({
 *     mount: '#paths',
 *     items: [{ key:'source', label:'源文件目录', kind:'dir' },
 *             { key:'output', label:'输出目录',   kind:'dir', write:true }],
 *     onChange: function(state){ ... }
 *   });
 *
 * 依赖：浏览器必须支持 showDirectoryPicker（https 或 localhost 下可用）。
 *       file:// 直接双击打开时不可用，页面会给出提示并退回「手动选择文件」。
 * ===========================================================================*/
(function () {
  'use strict';

  var DB_NAME = 'if-localfs';
  var DB_VER = 1;
  var STORE = 'handles';
  var CFG_PREFIX = 'if-localfs:cfg:';

  /* ---------------- IndexedDB ---------------- */

  var dbPromise = null;
  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      var req;
      try { req = indexedDB.open(DB_NAME, DB_VER); } catch (e) { reject(e); return; }
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('IndexedDB 打开失败')); };
    });
    return dbPromise;
  }

  function idb(mode, fn) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, mode);
        var store = tx.objectStore(STORE);
        var req;
        try { req = fn(store); } catch (e) { reject(e); return; }
        tx.oncomplete = function () {
          /* 注意：读不到时 req.result 是 undefined，必须用 'result' in req 判断，
             否则会把 request 对象本身当成取回的句柄 */
          resolve(req && typeof req === 'object' && ('result' in req) ? req.result : undefined);
        };
        tx.onerror = function () { reject(tx.error); };
        tx.onabort = function () { reject(tx.error); };
      });
    });
  }

  function saveHandle(key, handle) {
    return idb('readwrite', function (store) { return store.put(handle, key); })
      .then(function () { rememberMeta(key, handle); return true; })
      .catch(function (error) {
        if (window.console) console.warn('[localfs] 记住路径失败（不影响本次使用）：', error);
        rememberMeta(key, handle);
        return false;
      });
  }

  function getHandle(key) {
    return idb('readonly', function (store) { return store.get(key); }).catch(function () { return null; });
  }

  function dropHandle(key) {
    forgetMeta(key);
    return idb('readwrite', function (store) { return store.delete(key); }).catch(function () { return null; });
  }

  /* 句柄拿不到时（别的浏览器 / 权限被拒）至少还能显示上次选过的名字 */
  function rememberMeta(key, handle) {
    try {
      var name = handle && (handle.name || '');
      var kind = handle && handle.kind ? handle.kind : '';
      localStorage.setItem(CFG_PREFIX + key, JSON.stringify({ name: name, kind: kind, at: Date.now() }));
    } catch (e) { /* 忽略 */ }
  }
  function readMeta(key) {
    try {
      var raw = localStorage.getItem(CFG_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function forgetMeta(key) {
    try { localStorage.removeItem(CFG_PREFIX + key); } catch (e) { /* 忽略 */ }
  }

  /* ---------------- 权限 ---------------- */

  /* 重要：FileSystemHandle.queryPermission / requestPermission 返回的是 Promise
     （Chrome 155 / Edge 实测），早期版本把它当同步字符串用，导致刷新后权限永远读不到、
     ready 恒为 false —— 表现为"刷新后选过的目录就没了"。这里统一按 Promise 处理。 */
  function queryPermission(handle, mode) {
    if (!handle || typeof handle.queryPermission !== 'function') return Promise.resolve('unsupported');
    try { return Promise.resolve(handle.queryPermission({ mode: mode || 'read' })); } catch (e) {
      return Promise.resolve('unsupported');
    }
  }
  function requestPermission(handle, mode) {
    if (!handle || typeof handle.requestPermission !== 'function') return Promise.resolve('unsupported');
    try { return Promise.resolve(handle.requestPermission({ mode: mode || 'read' })); } catch (e) {
      return Promise.resolve('denied');
    }
  }
  /* 能用就返回 granted；是 prompt 时只能在用户手势里补一次授权 */
  function ensurePermission(handle, mode) {
    return queryPermission(handle, mode).then(function (result) {
      if (result === 'granted') return 'granted';
      if (result === 'prompt') return requestPermission(handle, mode);
      return result;
    });
  }

  /* ---------------- 选择与读写 ---------------- */

  function supported() {
    return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function';
  }

  function pickDirectory(options) {
    options = options || {};
    if (!supported()) return Promise.reject(new Error('当前浏览器不支持选择本地目录'));
    return window.showDirectoryPicker({
      id: options.id,
      mode: options.mode || 'readwrite',
      startIn: options.startIn || undefined
    });
  }

  function pickFile(options) {
    options = options || {};
    if (typeof window.showOpenFilePicker !== 'function') {
      return Promise.reject(new Error('当前浏览器不支持选择本地文件'));
    }
    return window.showOpenFilePicker({
      id: options.id,
      multiple: !!options.multiple,
      types: options.types || undefined,
      excludeAcceptAllOption: !!options.types
    }).then(function (handles) {
      return options.multiple ? handles : (handles && handles[0]);
    });
  }

  /* 列出目录下的条目；exts 为小写扩展名数组（如 ['.png','.jpg']），留空表示全部 */
  function listEntries(dirHandle, options) {
    options = options || {};
    var out = [];
    if (!dirHandle || typeof dirHandle.values !== 'function') return Promise.resolve(out);
    var iterator = dirHandle.values();
    var exts = (options.exts || []).map(function (x) { return String(x).toLowerCase(); });

    function step() {
      return iterator.next().then(function (result) {
        if (result.done) return out;
        var entry = result.value;
        var isFile = entry.kind === 'file';
        if (options.want === 'file' && !isFile) return step();
        if (options.want === 'dir' && isFile) return step();
        if (isFile && exts.length) {
          var lower = String(entry.name || '').toLowerCase();
          var matched = exts.some(function (ext) { return lower.slice(-ext.length) === ext; });
          if (!matched) return step();
        }
        out.push(entry);
        return step();
      });
    }
    return Promise.resolve().then(step).then(function (list) {
      list.sort(function (a, b) { return String(a.name).localeCompare(String(b.name), 'zh-CN'); });
      return list;
    });
  }

  function getFile(fileHandle) {
    if (!fileHandle || typeof fileHandle.getFile !== 'function') {
      return Promise.reject(new Error('不是有效的文件句柄'));
    }
    return fileHandle.getFile();
  }

  function readFile(fileHandle) { return getFile(fileHandle); }

  function ensureDir(dirHandle, name) {
    return dirHandle.getDirectoryHandle(name, { create: true });
  }

  function writeBlob(dirHandle, name, blob) {
    return dirHandle.getFileHandle(name, { create: true }).then(function (fileHandle) {
      return fileHandle.createWritable().then(function (writable) {
        return writable.write(blob).then(function () { return writable.close(); });
      }).then(function () { return fileHandle; });
    });
  }

  /* 复制：读源文件 → 写到目标目录（跨目录只能用「读 + 写」模拟） */
  function copyFileTo(sourceFileHandle, dirHandle, targetName) {
    return getFile(sourceFileHandle)
      .then(function (file) { return writeBlob(dirHandle, targetName || file.name, file); });
  }

  function removeEntry(dirHandle, name, recursive) {
    return dirHandle.removeEntry(name, { recursive: !!recursive });
  }

  function clearDir(dirHandle) {
    return listEntries(dirHandle).then(function (list) {
      var chain = Promise.resolve();
      var counters = { files: 0, dirs: 0 };
      list.forEach(function (entry) {
        chain = chain.then(function () {
          return removeEntry(dirHandle, entry.name, entry.kind === 'directory').then(function () {
            if (entry.kind === 'directory') counters.dirs += 1; else counters.files += 1;
          }).catch(function () { /* 单个失败不中断 */ });
        });
      });
      return chain.then(function () { return counters; });
    });
  }

  /* 目录现状：子目录数、文件数、总体积 */
  function describeDir(dirHandle) {
    var result = { folders: [], fileCount: 0, dirCount: 0, bytes: 0 };
    if (!dirHandle) return Promise.resolve(result);
    return listEntries(dirHandle).then(function (list) {
      var chain = Promise.resolve();
      list.forEach(function (entry) {
        chain = chain.then(function () {
          if (entry.kind === 'directory') {
            result.dirCount += 1;
            var folder = { name: entry.name, count: 0, bytes: 0 };
            result.folders.push(folder);
            return listEntries(entry, { want: 'file' }).then(function (files) {
              var inner = Promise.resolve();
              files.forEach(function (file) {
                inner = inner.then(function () {
                  return getFile(file).then(function (f) {
                    folder.count += 1;
                    folder.bytes += f.size || 0;
                    result.fileCount += 1;
                    result.bytes += f.size || 0;
                  }).catch(function () { /* 忽略读不了的文件 */ });
                });
              });
              return inner;
            }).catch(function () { /* 忽略无权访问的目录 */ });
          }
          result.fileCount += 1;
          return getFile(entry).then(function (f) { result.bytes += f.size || 0; }).catch(function () { /* 忽略 */ });
        });
      });
      return chain.then(function () {
        result.folders.sort(function (a, b) { return String(b.name).localeCompare(String(a.name), 'zh-CN'); });
        return result;
      });
    });
  }

  /* ---------------- 普通配置项（非句柄） ---------------- */

  var cfg = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(CFG_PREFIX + 'opt:' + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(CFG_PREFIX + 'opt:' + key, JSON.stringify(value)); } catch (e) { /* 忽略 */ }
      return value;
    },
    del: function (key) {
      try { localStorage.removeItem(CFG_PREFIX + 'opt:' + key); } catch (e) { /* 忽略 */ }
    }
  };

  /* ---------------- 路径设置面板 ----------------
   * 一行一个路径：显示当前值、权限状态，提供「选择 / 改 / 清除」，
   * 句柄自动存 IndexedDB，页面重新打开时自动恢复。
   * ------------------------------------------------ */

  function mountPanel(options) {
    var mount = typeof options.mount === 'string' ? document.querySelector(options.mount) : options.mount;
    if (!mount) throw new Error('LocalFS.mountPanel：找不到挂载容器');

    var items = (options.items || []).slice();
    var state = {};
    var root = document.createElement('div');
    root.className = 'lfs-panel';

    var head = document.createElement('div');
    head.className = 'lfs-head';
    head.innerHTML = '<div class="lfs-title">' + (options.title || '本地路径设置') + '</div>' +
      '<div class="lfs-sub">' + (options.subtitle ||
        '每台电脑各自设置一次，之后打开本页自动沿用（只记在这台电脑的浏览器里，不上传任何文件）') + '</div>';
    root.appendChild(head);

    if (!supported()) {
      var warn = document.createElement('div');
      warn.className = 'lfs-warn';
      warn.innerHTML = '当前浏览器不支持直接读写本地目录（需要 Chrome / Edge 等 Chromium 内核，' +
        '并通过 https 或 localhost 打开）。可以只用文件选择按钮手动挑文件，' +
        '但结果无法自动写回本地目录。';
      root.appendChild(warn);
    }

    var rows = {};
    var idbState = 'unknown';   // 句柄能不能存下来，取决于浏览器是不是允许 IndexedDB
    var warnBox = null;
    items.forEach(function (item) {
      var row = document.createElement('div');
      row.className = 'lfs-row unset';
      root.appendChild(row);
      rows[item.key] = row;
    });

    function showWarn(text) {
      if (!warnBox) {
        warnBox = document.createElement('div');
        warnBox.className = 'lfs-warn';
        root.appendChild(warnBox);
      }
      warnBox.textContent = text;
    }

    function itemByKey(key) {
      for (var i = 0; i < items.length; i += 1) if (items[i].key === key) return items[i];
      return null;
    }

    function permOf(entry) {
      if (!entry || !entry.handle) return 'unset';
      // 兜底：万一拿到的是 Promise / 空值，不要把它当成状态字符串往外抛
      if (typeof entry.perm !== 'string') return 'unknown';
      if (entry.perm !== 'granted') return entry.perm || 'unknown';
      return 'granted';
    }

    function paintRow(key) {
      var row = rows[key];
      var entry = state[key] || {};
      var item = itemByKey(key) || {};
      var perm = permOf(entry);
      var name = entry.handle ? entry.handle.name : (entry.meta && entry.meta.name);
      row.className = 'lfs-row' + (perm === 'granted' ? ' ok' : (perm === 'unset' ? ' unset' : ' warn'));

      var status = '';
      if (perm === 'granted') status = '已连接';
      else if (perm === 'prompt') status = '已记住 · 需确认一次';
      else if (perm === 'denied') status = '权限被拒，请重选';
      else if (perm === 'unsupported') status = '浏览器不支持';
      else if (!entry.handle && name) status = '已记住：' + name + '（需重新选择）';
      else status = '未设置';

      row.innerHTML =
        '<div class="lfs-main">' +
          '<div class="lfs-label">' + escapeHtml(item.label || key) + '</div>' +
          '<div class="lfs-value">' + escapeHtml(name || '未设置') + '</div>' +
          (item.hint ? '<div class="lfs-hint">' + escapeHtml(item.hint) + '</div>' : '') +
        '</div>' +
        '<div class="lfs-side">' +
          '<span class="lfs-state">' + escapeHtml(status) + '</span>' +
          '<span class="lfs-btns"></span>' +
        '</div>';

      var btns = row.querySelector('.lfs-btns');
      // 已有句柄但待确认时，「恢复访问」是主按钮；其余情况「选择 / 重新选择」是主按钮
      var pickBtn = button(item.buttonText || (entry.handle ? '重新选择' : '选择…'),
        perm === 'prompt' ? 'lfs-btn' : 'lfs-btn primary');
      pickBtn.addEventListener('click', function () { choose(key); });
      btns.appendChild(pickBtn);

      if (perm === 'prompt') {
        var grantBtn = button('恢复访问', 'lfs-btn primary');
        grantBtn.title = '浏览器安全要求：每次重新打开页面对已记住的目录都要再确认一次，点这里即可';
        grantBtn.addEventListener('click', function () { grant(key); });
        btns.appendChild(grantBtn);
      }
      if (entry.handle || (entry.meta && entry.meta.name)) {
        var clearBtn = button('清除', 'lfs-btn ghost');
        clearBtn.addEventListener('click', function () { clear(key); });
        btns.appendChild(clearBtn);
      }
    }

    function button(text, className) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = className;
      b.textContent = text;
      return b;
    }

    function choose(key) {
      var item = itemByKey(key) || {};
      var mode = item.write ? 'readwrite' : 'read';
      var p = item.kind === 'file' ? pickFile(item.pick || {}) : pickDirectory({ id: item.pickId || key, mode: mode });
      p.then(function (handle) {
        if (!handle) return;
        state[key] = { handle: handle, meta: { name: handle.name, kind: handle.kind }, perm: 'granted' };
        return saveHandle(key, handle).then(function () {
          paintRow(key);
          fire();
        });
      }).catch(function (error) {
        if (error && error.name === 'AbortError') return;   // 用户取消
        window.alert('选择失败：' + (error && error.message ? error.message : error));
      });
    }

    function grant(key) {
      var entry = state[key];
      if (!entry || !entry.handle) { choose(key); return; }
      ensurePermission(entry.handle, (itemByKey(key) || {}).write ? 'readwrite' : 'read').then(function (perm) {
        entry.perm = perm;
        paintRow(key);
        fire();
      });
    }

    function clear(key) {
      dropHandle(key).then(function () {
        state[key] = {};
        paintRow(key);
        fire();
      });
    }

    function fire() {
      if (typeof options.onChange === 'function') options.onChange(api.all());
    }

    function paintAll() {
      items.forEach(function (item) { paintRow(item.key); });
    }

    /* 批量补授权：浏览器刷新后句柄还在，但权限会退回 prompt，
       必须在用户手势里 requestPermission 一次，这里把它做成一次点击恢复全部。
       注意并发：自动补授权（首次点击）和按钮点击可能同时触发，
       共用同一个 in-flight promise，避免浏览器连弹两个授权框。 */
    var granting = null;
    function grantAll(keys) {
      if (granting) return granting;
      var targets = (keys && keys.length ? keys : items.map(function (item) { return item.key; }))
        .filter(function (key) {
          var entry = state[key];
          return entry && entry.handle && entry.perm === 'prompt';
        });
      if (!targets.length) return Promise.resolve(true);
      granting = targets.reduce(function (chain, key) {
        return chain.then(function () {
          var entry = state[key];
          return ensurePermission(entry.handle, (itemByKey(key) || {}).write ? 'readwrite' : 'read')
            .then(function (perm) {
              entry.perm = typeof perm === 'string' ? perm : 'unknown';
              paintRow(key);
              fire();
            });
        });
      }, Promise.resolve()).then(function () {
        return targets.every(function (key) { return (state[key] || {}).perm === 'granted'; });
      });
      var reset = function () { granting = null; };
      granting.then(reset, reset);
      return granting;
    }

    function notReady(keys) {
      var all = api.all();
      return keys.filter(function (key) { return !(all[key] && all[key].ready); });
    }

    /* 执行前统一检查（异步版）：缺授权就趁这次点击顺手补上，补不到再提示 */
    function requireReady(keys, tip) {
      var missing = notReady(keys);
      if (!missing.length) return Promise.resolve(true);
      var grantable = missing.filter(function (key) {
        var entry = state[key];
        return entry && entry.handle && entry.perm === 'prompt';
      });
      return (grantable.length ? grantAll(grantable) : Promise.resolve(false)).then(function () {
        var left = notReady(keys);
        if (!left.length) return true;
        var all = api.all();
        window.alert((tip || '先把本地路径设置好再继续：') + '\n\n· ' +
          left.map(function (key) { return (all[key] && all[key].label) || key; }).join('\n· '));
        return false;
      });
    }

    /* 恢复：句柄从 IndexedDB 读回来，权限能查到 granted 就直接可用 */
    function restore() {
      return openDB().then(function () { return 'ok'; }, function () { return 'fail'; }).then(function (result) {
        idbState = result;
        if (idbState === 'fail') {
          showWarn('这个浏览器当前无法使用 IndexedDB（无痕模式 / 关闭了本地存储 / 存储被清理），' +
            '所以目录选完没法记住：每次打开都需要重新选一次。');
        }
        return Promise.all(items.map(function (item) {
          return getHandle(item.key).then(function (handle) {
            var meta = readMeta(item.key);
            if (!handle) {
              state[item.key] = meta ? { handle: null, meta: meta, perm: 'unset' } : {};
              return;
            }
            // 权限必须 await：拿到的是 Promise<PermissionState>，不是字符串
            return queryPermission(handle, item.write ? 'readwrite' : 'read').then(function (perm) {
              state[item.key] = {
                handle: handle,
                meta: { name: handle.name, kind: handle.kind },
                perm: typeof perm === 'string' ? perm : 'unknown'
              };
            });
          });
        }));
      }).then(function () {
        paintAll();
        fire();
        return api.all();
      }).catch(function (error) {
        if (window.console) console.warn('[localfs] 恢复已记住的目录失败：', error);
        paintAll();
        fire();
        return api.all();
      });
    }

    var api = {
      element: root,
      all: function () {
        var out = {};
        items.forEach(function (item) {
          var entry = state[item.key] || {};
          out[item.key] = {
            key: item.key,
            label: item.label,
            handle: entry.handle || null,
            name: (entry.handle && entry.handle.name) || (entry.meta && entry.meta.name) || '',
            permission: permOf(entry),
            ready: !!(entry.handle && entry.perm === 'granted')
          };
        });
        return out;
      },
      get: function (key) { return api.all()[key] || null; },
      /* 执行前统一检查：缺哪个就提示去设置，返回是否全部就绪 */
      require: function (keys, tip) {
        var missing = [];
        var all = api.all();
        keys.forEach(function (key) {
          var entry = all[key];
          if (!entry || !entry.ready) missing.push(entry ? entry.label : key);
        });
        if (missing.length) {
          window.alert((tip || '先把本地路径设置好再继续：') + '\n\n· ' + missing.join('\n· '));
          return false;
        }
        return true;
      },
      requireReady: requireReady,
      grantAll: grantAll,
      choose: choose,
      clear: clear,
      refresh: restore,
      /* 自检：句柄到底存没存下来，出问题时一眼能看出卡在哪一层 */
      diagnostics: function () {
        var all = api.all();
        return {
          supported: supported(),
          indexedDB: idbState,
          items: items.map(function (item) {
            var entry = all[item.key] || {};
            return {
              key: item.key,
              name: entry.name || '',
              hasHandle: !!entry.handle,
              permission: entry.permission || 'unset',
              ready: !!entry.ready
            };
          })
        };
      }
    };

    mount.appendChild(root);
    restore();
    return api;
  }

  function escapeHtml(text) {
    return String(text == null ? '' : text).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  window.LocalFS = {
    supported: supported,
    pickDirectory: pickDirectory,
    pickFile: pickFile,
    saveHandle: saveHandle,
    getHandle: getHandle,
    dropHandle: dropHandle,
    queryPermission: queryPermission,
    requestPermission: requestPermission,
    ensurePermission: ensurePermission,
    listEntries: listEntries,
    getFile: getFile,
    readFile: readFile,
    ensureDir: ensureDir,
    writeBlob: writeBlob,
    copyFileTo: copyFileTo,
    removeEntry: removeEntry,
    clearDir: clearDir,
    describeDir: describeDir,
    cfg: cfg,
    mountPanel: mountPanel
  };
})();
