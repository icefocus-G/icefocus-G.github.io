/* =========================================================================
 * 课程云同步引擎 v4 —— 全自动双向同步（多课程通用）
 *
 *  权威存储：GitHub 仓库里的 data/<COURSE>-sync.json
 *  本机：只是缓存，不需要点任何按钮
 *
 *  · 读：fetch 仓库里的 data 文件；本地取不到时自动退回滚到 raw.githubusercontent
 *  · 写：GitHub Contents API（Token 只在本机浏览器，一次性粘贴后永久免操作）
 *  · ★ 上传时机（v5）★
 *      只有在「学习数据真正被确定」时才上传，即页面主动调用
 *          IF_COURSE_SYNC.commit('理由')
 *      也就是：选择题选定了答案 / 其它题型确定了「答对·答错」/ 交卷 / 重做 / 标记掌握。
 *      滚动位置、阅读时长、页签、展开折叠这类浏览状态只写本机，不再触发上传。
 *      （想恢复成「任何改动都上传」，把 cfg.pushOnChange 设成 true 即可）
 *  · 每 20 秒自动拉取云端；切回标签页、窗口获得焦点时立即拉取（只读，不上传）
 *  · 关闭 / 切走页面时用 keepalive 请求补交一次，不会丢改动
 *  · 合并策略：本机改过的键优先，其余以云端为准（首次同步以云端为准）
 *
 *  课程接入：加载本文件之前，在宿主页面里设置
 *      window.IF_SYNC_CFG = {
 *        id:    'IF00076',                              // 课程 id（决定 localStorage 键）
 *        url:   '../../data/IF00076-sync.json',         // 本机读取路径（相对「宿主页面」）
 *        path:  'data/IF00076-sync.json',               // GitHub 仓库里的文件路径
 *        owner: 'icefocus-G', repo: 'icefocus-G.github.io', branch: 'main'
 *      };
 *    什么都不设就是国际金融 00076 的默认配置。
 *
 *  依赖宿主页面提供的全局（都可以没有，会自动降级）：
 *        toast / setStatus / renderRecords / applyPayload
 * ========================================================================= */
(function () {
  'use strict';

  /* ======================= 常量 ======================= */

  var OPT = window.IF_SYNC_CFG || {};
  var CID = OPT.id || 'IF00076';

  var K_CFG  = 'IF::ghcfg::'    + CID;
  var K_SNAP = 'IF::cloudsnap::' + CID;
  var K_LOG  = 'IF::synclog::'  + CID;
  var K_OLD  = ['IF76::ghcfg', 'IF76::cloudsnap', 'IF76::synclog'];   // 旧版本单课程键

  function isMeta(k) {
    var s = String(k);
    if (s.indexOf('IF::ghcfg::')    === 0) return true;
    if (s.indexOf('IF::cloudsnap::')=== 0) return true;
    if (s.indexOf('IF::synclog::')  === 0) return true;
    if (s.indexOf('IF76::bak::')    === 0) return true;
    return false;
  }
  function isSkip(k) {
    return K_OLD.indexOf(k) >= 0 || isMeta(k) || String(k) === 'IF76::synchash' || String(k) === 'IF::skinPin';
  }

  /* 浏览状态键：滚动位置 / 阅读时长 / 当前页签 / 备份。
     它们照常写本机、照常随下一次上传一起带走，但：
       · 不会自己触发一次上传
       · 不计入状态栏里的「待同步 N 项」（免得滚动一下就显示几十项） */
  function isQuiet(k) {
    var s = String(k);
    if (s === 'IF76::stats' || s === 'IF76::tab') return true;
    if (s.indexOf('if00076_pos') === 0) return true;
    if (s.indexOf('IF76::bak::') === 0) return true;
    return false;
  }

  /* 本机候选读取地址：本地路径优先，失败再退回滚到 GitHub 原始文件 */
  var DEF_URL  = OPT.url  || ('../../data/' + CID + '-sync.json');
  var DEF_PATH = OPT.path || ('data/' + CID + '-sync.json');

  var DEF = {
    url: DEF_URL,
    owner: OPT.owner  || 'icefocus-G',
    repo: OPT.repo    || 'icefocus-G.github.io',
    branch: OPT.branch|| 'main',
    token: '',
    autoSync: true,      // 总开关
    autoPull: true,      // 自动拉取
    autoPush: true,      // 允许「答题 / 判分后自动上传」
    pushOnChange: false, // 任何本机改动都上传（默认关；开了就会滚动一下也同步）
    pullEvery: 20,       // 秒
    pushDelay: 1000,     // 毫秒（改动后延迟合并上传）
    syncedOnce: false,   // 本机是否已经成功同步过一次
    dismissHint: false,  // 用户关掉了顶部提示条
    authFail: false,     // Token 无效 / 权限不足（停止无谓重试）
    lastSha: '',
    updatedAt: '',
    lastPullAt: '',
    lastPushAt: '',
    lastError: ''
  };

  var cfg = {};
  Object.keys(DEF).forEach(function (k) { cfg[k] = DEF[k]; });

  var syncing = false, queued = false;
  var pushTimer = null, lastReload = 0, lastSig = '', ghUser = '';
  var commitPending = false;   // 页面调用过 commit() → 这一轮允许上传
  var logBuf = [];
  var mute = 0;          // >0 时忽略由同步引擎自身写入引发的变更通知
  var backedUp = false;  // 首次同步只做一次本地备份
  var lastLogMsg = '', lastLogAt = 0;

  function el(id) { return document.getElementById(id); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function quiet(fn) { mute++; try { return fn(); } finally { mute--; } }
  /* isSkip / isMeta 定义在文件顶部（v4 多课程版），这里不要重复定义 */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function hhmmss(d) {
    var p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }

  /* ======================= 配置 ======================= */

  /* 旧版本 / 老路径迁移：已存过的 Token 直接继承，不用重新粘贴 */
  function loadCfg() {
    try {
      var raw = localStorage.getItem(K_CFG);
      if (raw == null) raw = localStorage.getItem('IF76::ghcfg');      // v3 → v4
      var o = JSON.parse(raw || '{}');
      if (o && typeof o === 'object') Object.keys(o).forEach(function (k) { cfg[k] = o[k]; });
    } catch (e) { /* 用默认值 */ }
    // 数据文件从仓库根目录搬到了 data/ 下，旧路径自动纠正
    if (cfg.url === 'IF00076-sync.json' || cfg.path === 'IF00076-sync.json') {
      cfg.url = DEF_URL; cfg.path = DEF_PATH;
    }
    if (!cfg.url) cfg.url = DEF_URL;
    if (!cfg.path) cfg.path = DEF_PATH;
  }
  function saveCfg() {
    quiet(function () {
      try { localStorage.setItem(K_CFG, JSON.stringify(cfg)); } catch (e) { /* ignore */ }
    });
  }

  /* ======================= 宿主页面的可选回调 ======================= */

  function toast(msg) {
    try {
      if (typeof window.toast === 'function') window.toast(msg);
      else if (typeof window.setStatus === 'function') window.setStatus(msg);
    } catch (e) { /* ignore */ }
  }
  function setStatus(msg) {
    try { if (typeof window.setStatus === 'function') window.setStatus(msg); } catch (e) { /* ignore */ }
  }
  function renderRecords() {
    try { if (typeof window.renderRecords === 'function') window.renderRecords(); } catch (e) { /* ignore */ }
  }

  /* ======================= 快照 ======================= */

  function frameWins() {
    var out = [], fs = window.frames;
    try {
      for (var i = 0; i < fs.length; i++) {
        var f = fs[i];
        var w = (f && f.contentWindow) ? f.contentWindow : (f && f.document ? f : null);
        if (w) out.push(w);
      }
    } catch (e) { /* ignore */ }
    return out;
  }
  function frameEls() {
    var out = [], fs = window.frames;
    try {
      for (var i = 0; i < fs.length; i++) {
        var f = fs[i];
        var e = (f && f.contentWindow) ? f : (f && f.frameElement ? f.frameElement : null);
        if (e) out.push(e);
      }
    } catch (e2) { /* ignore */ }
    return out;
  }

  function take(ls, into) {
    if (!ls) return;
    try {
      for (var i = 0; i < ls.length; i++) {
        var k = ls.key(i);
        if (!k || isSkip(k)) continue;
        into[k] = ls.getItem(k);
      }
    } catch (e) { /* ignore */ }
  }

  /* 采集：宿主页 + 所有同源 iframe（同源，实际共用同一个 localStorage 区） */
  function snapshot() {
    var s = {};
    take(window.localStorage, s);
    var ws = frameWins();
    for (var i = 0; i < ws.length; i++) {
      try { take(ws[i].localStorage, s); } catch (e) { /* ignore */ }
    }
    return s;
  }

  /* 廉价指纹：只比键名 + 值长度，每 2 秒可跑，不产生大数据拷贝 */
  function sigOf(ls) {
    var n = 0, h = 5381;
    try {
      for (var i = 0; i < ls.length; i++) {
        var k = ls.key(i);
        if (!k || isSkip(k)) continue;
        var v = ls.getItem(k) || '';
        var t = k + ':' + v.length + ';';
        for (var j = 0; j < t.length; j++) h = ((h << 5) + h + t.charCodeAt(j)) | 0;
        n++;
      }
    } catch (e) { /* ignore */ }
    return n + '-' + (h >>> 0).toString(16);
  }
  function curSig() {
    var out = [sigOf(window.localStorage)];
    var ws = frameWins();
    for (var i = 0; i < ws.length; i++) {
      try { out.push(sigOf(ws[i].localStorage)); } catch (e) { out.push('x'); }
    }
    return out.join('|');
  }

  function loadSnap() {
    try { return JSON.parse(localStorage.getItem(K_SNAP) || '{}'); } catch (e) { return {}; }
  }
  function saveSnap(s) {
    quiet(function () {
      try { localStorage.setItem(K_SNAP, JSON.stringify(s)); } catch (e) { /* ignore */ }
    });
  }
  /* 与基线的差异键。all=true 时连浏览状态键也算进去（内部判定用） */
  function changedKeys(all) {
    var s = snapshot(), base = loadSnap(), out = [];
    Object.keys(s).forEach(function (k) {
      if (!all && isQuiet(k)) return;
      if (base[k] === undefined || base[k] !== s[k]) out.push(k);
    });
    return out;
  }

  /* 数据包（与页面导出格式一致；配置 / 快照 / 备份键都不会上传） */
  window.buildPayload = function () {
    return JSON.stringify({
      app: CID,
      ver: 4,
      device: deviceKind(),
      exportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: snapshot()
    }, null, 2);
  };

  function deviceKind() {
    var ua = '';
    try { ua = navigator.userAgent || ''; } catch (e) { /* ignore */ }
    if (/Android|iPhone|iPad|iPod|Mobile/i.test(ua)) return 'mobile';
    if (window.__IF_NATIVE__ === true) return 'apk';
    return 'web';
  }

  /* ======================= 日志 ======================= */

  function log(msg, cls) {
    var now = Date.now();
    // 同类消息 45 秒内不重复，避免定时同步刷屏
    if (msg === lastLogMsg && now - lastLogAt < 45000) return;
    lastLogMsg = msg; lastLogAt = now;
    logBuf.push({ t: new Date(), m: msg, c: cls || '' });
    if (logBuf.length > 15) logBuf.shift();
    renderLog();
    try { console.log('[' + CID + ' 云同步] ' + msg); } catch (e) { /* ignore */ }
  }
  function renderLog() {
    var box = el('syncLog');
    if (!box) return;
    if (!logBuf.length) { box.innerHTML = '<div class="empty">暂无同步记录</div>'; return; }
    var h = '';
    for (var i = logBuf.length - 1; i >= 0; i--) {
      h += '<div class="kv">' + hhmmss(logBuf[i].t) + '　' + esc(logBuf[i].m) + '</div>';
    }
    box.innerHTML = h;
  }

  /* ======================= 状态显示 ======================= */

  function setBadge(kind, text) {
    var b = el('btnCloud');
    if (!b) return;
    var map = {
      ok: '#0d9488', sync: '#2563eb', warn: '#d97706',
      err: '#dc2626', off: 'rgba(255,255,255,.28)'
    };
    b.style.background = map[kind] || map.off;
    b.textContent = '☁ ' + (text || '云同步');
    b.title = '云同步：' + (text || '');
  }
  function fmtIso(s) {
    if (!s) return '—';
    var d = new Date(s);
    if (isNaN(d.getTime())) return s;
    var p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }

  function autoStateText() {
    if (!cfg.autoSync) return '已关闭（手动模式）';
    if (cfg.authFail) return 'Token 无效，请重新填写';
    if (!cfg.token) return '只读（缺 Token，改动会保留、暂不上传）';
    if (!cfg.autoPush || !cfg.autoPull) return '部分自动';
    if (cfg.pushOnChange) return '任何改动后约 1 秒上传 · 每 ' + (cfg.pullEvery || 20) + ' 秒拉取';
    return '仅答题 / 判分后上传 · 每 ' + (cfg.pullEvery || 20) + ' 秒拉取';
  }

  function refreshState() {
    var dirty = changedKeys();
    var s = el('syncState');
    if (s) {
      s.innerHTML =
        '<div><span class="dot ' + (cfg.token ? 'ok' : 'off') + '"></span>自动同步：<b>' + autoStateText() + '</b></div>' +
        '<div>数据文件：<b>' + (cfg.url || '未配置') + '</b>　提交目标：<b>' +
          cfg.owner + '/' + cfg.repo + '</b> · ' + (cfg.branch || 'main') + '</div>' +
        '<div>Token：<b>' + (cfg.token ? ('已填写' + (ghUser ? ' · ' + ghUser : '')) : '未填写') + '</b>　' +
          '本机上次同步：<b>' + fmtIso(cfg.lastPushAt || cfg.lastPullAt) + '</b></div>' +
        '<div>本机待上传：<b>' + (dirty.length ? dirty.length + ' 项' : '无（与云端一致）') +
          '</b>　<span style="opacity:.65">（滚动 / 页签等浏览状态不计入）</span></div>' +
        (cfg.lastError ? '<div style="color:#dc2626">最近错误：' + esc(cfg.lastError) + '</div>' : '');
    }
    renderLog();
    updateHint();
  }

  /* 顶部「开启自动同步」提示条 */
  function updateHint() {
    var bar = el('autoBar');
    if (!bar) return;
    var need = !!(cfg.autoSync && !cfg.token && !cfg.dismissHint);
    bar.classList.toggle('on', need);
  }

  /* ======================= 网络：读 ======================= */

  /* 候选读取地址：① 本机 / GitHub Pages 上的相对路径 ② GitHub 原始文件（公开读）
     ② 让 APK / 本地打开 file:// 的情况也能拿到云端数据 */
  function pullUrls() {
    var out = [];
    function add(u) { if (u && out.indexOf(u) < 0) out.push(u); }
    add(cfg.url);
    add('https://raw.githubusercontent.com/' + cfg.owner + '/' + cfg.repo + '/' +
        (cfg.branch || 'main') + '/' + String(cfg.path || DEF_PATH).replace(/^\/+/, ''));
    return out;
  }

  async function pull() {
    var urls = pullUrls(), lastErr = null;
    for (var i = 0; i < urls.length; i++) {
      var u = urls[i];
      try {
        var sep = u.indexOf('?') >= 0 ? '&' : '?';
        var r = await fetch(u + sep + '_t=' + Date.now(), { cache: 'no-store' });
        if (r.status === 404) { lastErr = new Error('HTTP 404 · ' + u); lastErr.nf = true; continue; }
        if (!r.ok) { lastErr = new Error('HTTP ' + r.status + ' · ' + u); continue; }
        var txt = await r.text();
        if (!txt || txt.trim().charAt(0) !== '{') { lastErr = new Error('云端文件不是有效的 JSON'); continue; }
        return { ok: true, content: txt, url: u, updatedAt: new Date().toISOString() };
      } catch (e) {
        lastErr = e;
        lastErr.net = true;
      }
    }
    throw lastErr || new Error('无法读取云端数据');
  }

  /* ======================= 网络：写 ======================= */

  function b64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }
  function apiUrl() {
    return 'https://api.github.com/repos/' + cfg.owner + '/' + cfg.repo +
      '/contents/' + String(cfg.path || 'IF00076-sync.json')
        .split('/').map(encodeURIComponent).join('/');
  }
  function ghHeaders() {
    return {
      'Authorization': 'Bearer ' + cfg.token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
  }

  async function shaOf() {
    var g = await fetch(apiUrl() + '?ref=' + encodeURIComponent(cfg.branch || 'main') +
      '&_=' + Date.now(), { headers: ghHeaders(), cache: 'no-store' });
    if (g.ok) {
      var gj = await g.json();
      cfg.lastSha = gj.sha || '';
      return cfg.lastSha;
    }
    if (g.status === 404) return null;                 // 文件还不存在 → 新建
    var e = await g.json().catch(function () { return {}; });
    throw new Error('GitHub ' + g.status + '：' + (e.message || '读取失败'));
  }

  async function push(content) {
    if (!cfg.token) throw new Error('未填写 Token，无法自动上传');
    if (!cfg.owner || !cfg.repo) throw new Error('未配置仓库（owner/repo）');

    var sha = await shaOf();
    var body = {
      message: CID + ' 自动同步 ' + new Date().toISOString(),
      content: b64(content),
      branch: cfg.branch || 'main'
    };
    if (sha) body.sha = sha;

    var p = await fetch(apiUrl(), {
      method: 'PUT',
      headers: Object.assign({ 'Content-Type': 'application/json' }, ghHeaders()),
      body: JSON.stringify(body)
    });
    if (!p.ok) {
      var pj = await p.json().catch(function () { return {}; });
      throw new Error('GitHub ' + p.status + '：' + (pj.message || '提交失败'));
    }
    var ok = await p.json().catch(function () { return {}; });
    if (ok && ok.content && ok.content.sha) cfg.lastSha = ok.content.sha;
    return { ok: true, updatedAt: new Date().toISOString() };
  }

  async function pushRetry() {
    var lastErr = null;
    for (var i = 0; i < 3; i++) {
      try { return await push(window.buildPayload()); }
      catch (e) {
        lastErr = e;
        // 权限 / 认证类错误重试没意义
        if (/GitHub (401|403|404|422)/.test(e.message)) break;
        await sleep(700 * (i + 1));
      }
    }
    throw lastErr;
  }

  /* 关页面时补交一次（keepalive：请求不会被页面卸载中断） */
  function flushBeacon() {
    if (!cfg.autoSync || !cfg.autoPush || !cfg.token) return;
    if (!commitPending && !cfg.pushOnChange) return;   // 没答题就不必在离开时补交
    if (!changedKeys(true).length) return;
    var content = window.buildPayload();
    if (content.length > 40000) return;      // keepalive 有 64KB 上限，超了留给下次打开
    var body = {
      message: CID + ' 离开页面前同步 ' + new Date().toISOString(),
      content: b64(content),
      branch: cfg.branch || 'main'
    };
    if (cfg.lastSha) body.sha = cfg.lastSha;   // 用缓存的 sha，省掉一次往返
    try {
      fetch(apiUrl(), {
        method: 'PUT',
        keepalive: true,
        headers: Object.assign({ 'Content-Type': 'application/json' }, ghHeaders()),
        body: JSON.stringify(body)
      });
    } catch (e) { /* ignore */ }
  }

  /* ======================= 应用合并结果 ======================= */

  /* 把合并结果写进 localStorage（只写值，不动基线） */
  function applyValues(merged) {
    quiet(function () {
      try {
        Object.keys(merged).forEach(function (k) {
          if (isSkip(k)) return;
          if (localStorage.getItem(k) !== merged[k]) localStorage.setItem(k, merged[k]);
        });
      } catch (e) { /* ignore */ }
    });
    lastSig = curSig();
  }

  function reloadFrames() {
    var els = frameEls();
    for (var i = 0; i < els.length; i++) {
      (function (f, n) {
        try {
          f.dataset.loaded = '';
          f.contentWindow.location.reload();
        } catch (e) {
          try { f.src = (window.FILES ? FILES[n] : f.src) + '?t=' + Date.now(); } catch (e2) { }
        }
      })(els[i], i);
    }
  }

  /* ======================= 一轮完整同步 ======================= */

  async function doRound(opts) {
    var remote = null, pullAt = null, notFound = false;

    try {
      var r = await pull();
      var o = JSON.parse(r.content);
      remote = (o && o.data) ? o.data : o;
      if (!remote || typeof remote !== 'object') throw new Error('云端数据格式不正确');
      pullAt = r.updatedAt;
    } catch (e) {
      if (e.nf) {
        notFound = true;
        log(cfg.token ? '云端暂无数据文件，将自动创建' : '云端暂无数据文件（填 Token 后可自动创建）');
      } else {
        cfg.lastError = e.message;
        saveCfg();
        setBadge('err', '读取失败');
        log('拉取失败：' + e.message);
        if (!opts.silent) toast('云端读取失败：' + e.message);
        return null;
      }
    }

    var local = snapshot(), base = loadSnap();

    /* 本机从未同步过 + 云端有数据 → 以云端为准，避免新设备空状态覆盖云端 */
    var remoteWins = !cfg.syncedOnce && !!(remote && Object.keys(remote).length);
    if (remoteWins && !backedUp && Object.keys(local).length > 0) {
      backedUp = true;
      quiet(function () {
        try {
          localStorage.setItem('IF76::bak::' + Date.now(), JSON.stringify(local));
          log('首次同步：以云端为准，本机原数据已留一份本地备份');
        } catch (e) { /* ignore */ }
      });
    }

    var merged = {}, fromCloud = [];
    if (remote) Object.keys(remote).forEach(function (k) { merged[k] = remote[k]; });
    Object.keys(local).forEach(function (k) {
      if (!remote) { merged[k] = local[k]; return; }
      if (remoteWins) { merged[k] = (k in remote) ? remote[k] : local[k]; return; }
      var mine = (base[k] === undefined) || (base[k] !== local[k]);
      if (mine) merged[k] = local[k];
      else if (!(k in remote)) merged[k] = local[k];
      else merged[k] = remote[k];
    });
    if (remote) {
      Object.keys(merged).forEach(function (k) {
        if (remote[k] !== undefined && remote[k] !== local[k]) fromCloud.push(k);
      });
    }

    applyValues(merged);
    if (pullAt) cfg.updatedAt = pullAt;
    cfg.lastPullAt = new Date().toISOString();

    var mine2 = Object.keys(local).some(function (k) {
      return (base[k] === undefined) || (base[k] !== local[k]);
    });

    /* ====== 上传门控 ======
       默认只有页面主动调用过 commit()（选择题选定答案 / 其它题判定对错 / 交卷）
       才允许把数据推上云端。滚动位置、阅读时长这类浏览状态永远不单独触发上传。
       另外两种放行：① pushOnChange 打开（旧行为）；
                     ② 首次同步 + 云端还没有数据文件 + 本机确有数据（把文件建出来）。 */
    var firstCreate = !cfg.syncedOnce && notFound && !!(local && Object.keys(local).length);
    var wantPush = mine2 || fromCloud.length > 0 || notFound;
    var needPush = (commitPending || cfg.pushOnChange || firstCreate) ? wantPush : false;
    var pendingCount = changedKeys().length;

    /* ====== 安全闸：本机一个数据键都没有 → 绝不上传 ======
       这是最致命的一种数据丢失：新设备 / 刚清过缓存的浏览器第一次打开时，
       本机 localStorage 是空的，「云端文件不存在」又会被当成「需要创建」，
       于是空的 data 被推上去，把别人攒了几百道题的记录一次性清空。
       空数据上传没有任何收益，直接拦掉。 */
    if (needPush && !Object.keys(snapshot()).length) {
      needPush = false;
      saveSnap(merged);
      cfg.syncedOnce = true;
      setBadge('warn', '本机无数据');
      log('本机暂无学习数据，已跳过上传（不会动云端那份）');
    }

    /* 基线（快照）只在「改动确实已经到达云端」或「本来就没改动」时才推进。
       上传失败 / 没填 Token 时保留旧基线，改动继续算作待上传，下次自动补传。 */
    if (!needPush) {
      saveSnap(merged);
      cfg.syncedOnce = true;
      commitPending = false;
      setBadge('ok', '已同步');
      if (!opts.silent) toast('已是最新');
    } else if (!cfg.token) {
      if (remoteWins) {
        saveSnap(merged);              // 已采用云端数据，不必再回传
        cfg.syncedOnce = true;
        commitPending = false;
        setBadge('warn', '只读模式');
      } else {
        setBadge('warn', '未登录');
        log('本机有 ' + pendingCount + ' 项改动待上传 · 粘贴一次 Token 即可全自动');
      }
    } else if (cfg.authFail) {
      setBadge('err', 'Token 无效');
    } else if (!cfg.autoPush) {
      setBadge('warn', '自动上传已关');
    } else {
      try {
        await pushRetry();
        saveSnap(merged);              // 上传成功，基线跟上
        cfg.lastPushAt = new Date().toISOString();
        cfg.lastError = '';
        cfg.authFail = false;
        cfg.syncedOnce = true;
        commitPending = false;         // 本次「答题 / 判分」已经落地云端
        setBadge('ok', '已同步');
        log(notFound ? '已创建云端数据文件' : '已自动上传 ' + pendingCount + ' 项改动');
        if (!opts.silent) toast('已同步到 GitHub');
      } catch (e) {
        cfg.lastError = e.message;
        if (/GitHub (401|403)/.test(e.message)) {
          cfg.authFail = true;
          setBadge('err', 'Token 无效');
          log('Token 无效或权限不足 —— 改动已保留，换成有效 Token 后会自动补传');
        } else {
          setBadge('warn', '上传失败');
          log('上传失败：' + e.message + ' —— 改动已保留，稍后自动重试');
        }
        if (!opts.silent) toast('上传失败：' + e.message);
      }
    }
    saveCfg();

    if (fromCloud.length && Date.now() - lastReload > 60000) {
      lastReload = Date.now();
      renderRecords();
      reloadFrames();
      setStatus('已从云端合并 ' + fromCloud.length + ' 项更新');
      log('从云端合并 ' + fromCloud.length + ' 项');
    }
    renderRecords();
    return { merged: merged, fromCloud: fromCloud, notFound: notFound };
  }

  async function syncRound(opts) {
    opts = opts || {};
    if (syncing) { queued = true; return null; }
    syncing = true;
    setBadge('sync', '同步中…');
    var out = null;
    try {
      out = await doRound(opts);
    } catch (e) {
      cfg.lastError = e.message || String(e);
      setBadge('err', '同步失败');
      log('同步异常：' + cfg.lastError);
      if (!opts.silent) toast('同步失败：' + cfg.lastError);
    } finally {
      syncing = false;
      refreshState();
      if (queued) {
        queued = false;
        setTimeout(function () { syncRound({ silent: true }); }, 500);
      }
    }
    return out;
  }

  /* ======================= 自动调度 ======================= */

  /* 本机发生了改动 —— 默认只刷新显示，不上传。
     上传的开关在 commit()：只有「答案选定 / 判分确定」才真正推到云端。 */
  function markDirty() {
    if (mute) return;
    if (!cfg.autoSync) { setBadge('off', '自动同步已关'); updateHint(); return; }
    if (cfg.pushOnChange && cfg.autoPush) {
      if (!cfg.token) { setBadge('warn', '未登录'); updateHint(); return; }
      schedulePush(Math.max(300, cfg.pushDelay | 0 || 1000), '');
      return;
    }
    refreshState();
  }

  /* 答题 / 判分专用：答案与对错已经确定，立刻上传（防抖 600ms 合并连续作答）
     —— 这是默认模式下唯一会触发上传的入口。 */
  function commit(why) {
    if (mute) return;
    if (!cfg.autoSync || !cfg.autoPush) { markDirty(); return; }
    if (!cfg.token) { setBadge('warn', '未登录'); updateHint(); return; }
    commitPending = true;
    schedulePush(600, why || '判分');
  }

  function schedulePush(delay, why) {
    clearTimeout(pushTimer);
    setBadge('sync', '待同步…');
    if (why) { try { setStatus('已记录：' + why + ' · 正在同步'); } catch (e) { /* ignore */ } }
    pushTimer = setTimeout(function () {
      pushTimer = null;
      syncRound({ silent: true });
    }, delay);
  }

  /* 把某个 window 的 localStorage 写操作接上钩子（同源） */
  function hookStorage(store, cb) {
    try {
      var proto = Object.getPrototypeOf(store);
      if (!proto || proto.__if76) return;
      proto.__if76 = true;
      ['setItem', 'removeItem', 'clear'].forEach(function (m) {
        var orig = proto[m];
        if (typeof orig !== 'function') return;
        proto[m] = function () {
          var r = orig.apply(this, arguments);
          if (!mute) { try { cb(); } catch (e) { /* ignore */ } }
          return r;
        };
      });
    } catch (e) { /* 跨域或不可写 → 交给 storage 事件 / 轮询兜底 */ }
  }

  function startEngine() {
    /* 1) 本页面的写操作 —— 直接挂钩，零延迟 */
    hookStorage(window.localStorage, markDirty);

    /* 2) iframe 的写操作 —— storage 事件（同源互相可见），零延迟 */
    window.addEventListener('storage', function () { markDirty(); });

    /* 3) 兜底轮询：2 秒比对指纹。默认只用来刷新状态显示，
          只有在 pushOnChange 打开时才会据此上传。 */
    setInterval(function () {
      if (!cfg.autoSync) return;
      var s = curSig();
      if (s === lastSig) return;
      lastSig = s;
      if (cfg.pushOnChange && cfg.autoPush) {
        if (changedKeys().length) markDirty();
      } else {
        refreshState();
      }
    }, 2000);

    /* 4) 定时拉取云端（只在页面可见时） */
    setInterval(function () {
      if (document.hidden || syncing || pushTimer) return;
      if (!cfg.autoSync || !cfg.autoPull) return;
      syncRound({ silent: true });
    }, Math.max(5, cfg.pullEvery | 0 || 20) * 1000);

    /* 5) 切回页面 / 窗口聚焦 → 立刻同步一次 */
    window.addEventListener('focus', function () {
      if (cfg.autoSync && cfg.autoPull && !syncing && !pushTimer) syncRound({ silent: true });
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { flushBeacon(); return; }
      if (cfg.autoSync && cfg.autoPull && !syncing && !pushTimer) syncRound({ silent: true });
    });
    window.addEventListener('pagehide', flushBeacon);
    window.addEventListener('beforeunload', flushBeacon);

    /* 6) 首次拿到 iframe 时也给它们挂钩（同源才有效） */
    var els = frameEls();
    for (var i = 0; i < els.length; i++) {
      (function (f) {
        f.addEventListener('load', function () {
          try { hookStorage(f.contentWindow.localStorage, markDirty); } catch (e) { /* ignore */ }
        });
      })(els[i]);
    }
  }

  /* ======================= 面板 ======================= */

  function openCloud() { var m = el('ghMask'); if (m) m.classList.add('on'); refreshState(); }
  function closeCloud() { var m = el('ghMask'); if (m) m.classList.remove('on'); }

  function fillForm() {
    if (el('ghUrl')) el('ghUrl').value = cfg.url || '';
    if (el('ghToken')) el('ghToken').value = cfg.token || '';
    if (el('ghRepo')) el('ghRepo').value = (cfg.owner || '') && (cfg.repo || '') ? (cfg.owner + '/' + cfg.repo) : '';
    if (el('ghBranch')) el('ghBranch').value = cfg.branch || 'main';
    if (el('ghPath')) el('ghPath').value = cfg.path || 'IF00076-sync.json';
    if (el('ghAuto')) el('ghAuto').checked = cfg.autoSync !== false;
    if (el('ghAutoPull')) el('ghAutoPull').checked = cfg.autoPull !== false;
    if (el('ghAutoPush')) el('ghAutoPush').checked = cfg.autoPush !== false;
    if (el('ghPushOnChange')) el('ghPushOnChange').checked = cfg.pushOnChange === true;
    if (el('ghPullEvery')) el('ghPullEvery').value = String(cfg.pullEvery || 20);
    if (ghUser && el('whoami')) el('whoami').textContent = '已登录：' + ghUser;
  }

  function readForm() {
    var rp = ((el('ghRepo') && el('ghRepo').value) || '').trim().split('/');
    return {
      url: (el('ghUrl') && el('ghUrl').value.trim()) || 'IF00076-sync.json',
      token: ((el('ghToken') && el('ghToken').value) || '').trim(),
      owner: (rp[0] || '').trim(),
      repo: (rp[1] || '').trim(),
      branch: ((el('ghBranch') && el('ghBranch').value) || '').trim() || 'main',
      path: ((el('ghPath') && el('ghPath').value) || '').trim() || 'IF00076-sync.json',
      autoSync: el('ghAuto') ? el('ghAuto').checked : true,
      autoPull: el('ghAutoPull') ? el('ghAutoPull').checked : true,
      autoPush: el('ghAutoPush') ? el('ghAutoPush').checked : true,
      pushOnChange: el('ghPushOnChange') ? el('ghPushOnChange').checked : false,
      pullEvery: Math.max(5, parseInt((el('ghPullEvery') && el('ghPullEvery').value) || '20', 10) || 20)
    };
  }

  function bind() {
    if (el('btnCloud')) el('btnCloud').addEventListener('click', openCloud);
    if (el('ghClose')) el('ghClose').addEventListener('click', closeCloud);
    if (el('ghMask')) el('ghMask').addEventListener('click', function (e) {
      if (e.target === el('ghMask')) closeCloud();
    });

    if (el('autoBarGo')) el('autoBarGo').addEventListener('click', function () {
      openCloud();
      setTimeout(function () { if (el('ghToken')) el('ghToken').focus(); }, 120);
    });
    if (el('autoBarNo')) el('autoBarNo').addEventListener('click', function () {
      cfg.dismissHint = true; saveCfg(); updateHint();
    });

    if (el('btnTokenNew')) el('btnTokenNew').addEventListener('click', function () {
      window.open('https://github.com/settings/tokens/new?scopes=repo' +
        '&description=' + encodeURIComponent('IF00076 学习数据自动同步') +
        '&default_expires_at=none', '_blank');
    });

    if (el('btnWhoami')) el('btnWhoami').addEventListener('click', async function () {
      var t = (el('ghToken').value || '').trim();
      if (!t) { toast('请先粘贴 Token'); return; }
      el('whoami').textContent = '验证中…';
      try {
        var r = await fetch('https://api.github.com/user', {
          headers: { 'Authorization': 'Bearer ' + t, 'Accept': 'application/vnd.github+json' }
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        var j = await r.json();
        ghUser = j.login;
        el('whoami').textContent = '已登录：' + ghUser;
        toast('Token 有效：' + ghUser);
      } catch (e) {
        ghUser = '';
        el('whoami').textContent = '';
        toast('验证失败：' + e.message);
      }
      refreshState();
    });

    if (el('btnSaveCfg')) el('btnSaveCfg').addEventListener('click', async function () {
      var before = cfg.token;
      cfg = Object.assign(cfg, readForm());
      if (cfg.token !== before) cfg.authFail = false;   // 换了 Token 就重新试
      saveCfg();
      refreshState();
      toast(cfg.token ? '已保存，自动同步已开启' : '已保存（未填 Token：只读模式）');
      if (cfg.token && !before) log('已填写 Token，自动同步开启');
      syncRound({ silent: false });
    });

    if (el('btnInitFile')) el('btnInitFile').addEventListener('click', function () {
      if (typeof doExport === 'function') doExport();
      toast('已生成数据文件，可上传到 GitHub 仓库根目录');
    });

    if (el('btnPull')) el('btnPull').addEventListener('click', function () { forcePull(); });
    if (el('btnPull2')) el('btnPull2').addEventListener('click', function () { forcePull(); });
    if (el('btnPush')) el('btnPush').addEventListener('click', function () { forcePush(); });
    if (el('btnSyncNow')) el('btnSyncNow').addEventListener('click', function () { syncRound({ silent: false }); });
    if (el('btnGhOpen')) el('btnGhOpen').addEventListener('click', function () {
      window.open('https://github.com/' + cfg.owner + '/' + cfg.repo, '_blank');
    });
    if (el('btnLogClear')) el('btnLogClear').addEventListener('click', function () {
      logBuf = []; renderLog();
    });
  }

  async function forcePush() {
    if (!Object.keys(snapshot()).length) {          // 同上：空数据不允许覆盖云端
      setBadge('warn', '本机无数据');
      toast('本机没有任何学习数据，已取消上传（避免清空云端）');
      log('手动上传已取消：本机无数据');
      refreshState();
      return;
    }
    setBadge('sync', '上传中…');
    try {
      await pushRetry();
      cfg.lastPushAt = new Date().toISOString();
      cfg.syncedOnce = true;
      cfg.lastError = '';
      commitPending = false;
      saveCfg();
      saveSnap(snapshot());
      setBadge('ok', '已同步');
      toast('已上传到 GitHub');
      log('手动上传完成');
    } catch (e) {
      cfg.lastError = e.message; saveCfg();
      setBadge('err', '上传失败');
      toast('上传失败：' + e.message);
      log('上传失败：' + e.message);
    }
    refreshState();
  }

  async function forcePull() {
    setBadge('sync', '下载中…');
    try {
      var r = await pull();
      var o = JSON.parse(r.content);
      var d = (o && o.data) ? o.data : o;
      if (!d || typeof d !== 'object') throw new Error('文件格式不正确');
      quiet(function () {
        if (typeof applyPayload === 'function') {
          applyPayload(d, '已从 GitHub 恢复 · ' + fmtIso(r.updatedAt));
        } else {
          localStorage.clear();
          Object.keys(d).forEach(function (k) { if (!isSkip(k)) localStorage.setItem(k, d[k]); });
        }
      });
      saveSnap(d);
      cfg.updatedAt = r.updatedAt;
      cfg.lastPullAt = new Date().toISOString();
      cfg.syncedOnce = true;
      cfg.lastError = '';
      saveCfg();                      // 上面 clear 会带走本机配置，这里立刻写回
      lastSig = curSig();
      setBadge('ok', '已同步');
      toast('已从云端恢复');
      log('手动下载完成');
      closeCloud();
    } catch (e) {
      cfg.lastError = e.message; saveCfg();
      setBadge('err', '下载失败');
      toast('下载失败：' + e.message);
      log('下载失败：' + e.message);
    }
    refreshState();
  }

  /* 清空本机缓存但保留 Token，然后从云端重新拉一份 */
  async function resetLocal() {
    quiet(function () {
      var keep = localStorage.getItem(K_CFG);
      try { localStorage.clear(); } catch (e) { /* ignore */ }
      if (keep) { try { localStorage.setItem(K_CFG, keep); } catch (e2) { /* ignore */ } }
    });
    saveSnap({});
    lastSig = curSig();
    log('已清空本机缓存，正在从云端恢复…');
    await forcePull();
  }

  /* ======================= 启动 ======================= */

  function boot() {
    if (window.__IF_SYNC_BOOTED__ === CID) return;   // 同一页面重复引入时只跑一次
    window.__IF_SYNC_BOOTED__ = CID;
    loadCfg();
    fillForm();
    bind();
    lastSig = curSig();
    refreshState();
    startEngine();

    if (cfg.autoSync && cfg.autoPull) {
      setBadge('sync', '拉取中…');
      syncRound({ silent: true }).then(function (r) {
        if (!r) return;
        // 徽标交给 doRound 决定（可能是「未登录」「Token 无效」），这里只更新状态栏
        setStatus('已与 GitHub 同步 · ' + fmtIso(cfg.updatedAt));
      });
    } else {
      setBadge('off', '自动同步已关');
    }
  }

  window.IF_COURSE_SYNC = window.IF76Cloud = {
    id: CID,
    sync: function (o) { return syncRound(o || { silent: false }); },
    push: forcePush,
    pull: forcePull,
    reset: resetLocal,
    flush: flushBeacon,
    commit: commit,                       // 学习页：答案选定 / 判分完成后调用
    cfg: function () { return cfg; },
    state: function () {
      return {
        token: !!cfg.token, autoSync: cfg.autoSync,
        lastPushAt: cfg.lastPushAt, lastPullAt: cfg.lastPullAt,
        pending: changedKeys().length, error: cfg.lastError, log: logBuf.slice()
      };
    }
  };
  window.openCloud = openCloud;
  window.closeCloud = closeCloud;

  boot();
})();
