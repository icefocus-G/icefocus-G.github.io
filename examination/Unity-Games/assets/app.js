/* =============================================================================
 * app.js —— 课程引擎
 *
 * 页面布局（严格三段式）：
 *   ① 图形化演示区  ← 上：Canvas 可玩复刻版，可直接操作
 *   ② 源码逐句分析  ← 中：原始 Unity C# 源码 + 逐句「为什么这么写」
 *   ③ 运行结果      ← 下：控制台输出 + 关键变量状态
 * ========================================================================== */

(function () {
  'use strict';

  /* ---------------- 课时注册表 ---------------- */

  window.UG_LESSONS = {};   // id -> 课时定义（含 create / think / notes）
  window.UG_CODE = {};      // id -> C# 源码文件数据

  window.UG_LESSON = function (id, def) { window.UG_LESSONS[id] = def; };
  window.UG_CODEFILE = function (id, files) { window.UG_CODE[id] = files; };

  /* ---------------- 小工具 ---------------- */

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function stars(n) { return new Array(n + 1).join('★') + new Array(6 - n).join('☆'); }
  function qs(key) {
    var m = new RegExp('[?&]' + key + '=([^&#]*)').exec(location.search);
    return m ? decodeURIComponent(m[1]) : '';
  }
  function pad2(n) { return n < 10 ? '0' + n : '' + n; }

  /* ---------------- C# 语法高亮（单遍扫描，安全） ----------------
   *
   * 关键点：必须「单遍」扫描原始文本并直接产出 HTML。
   * 如果先做关键字替换、再做字符串替换，第二遍就会扫到第一遍生成的
   * <span class="..."> —— 里面的 class 正好是 C# 关键字，会被再次替换，
   * 把标签打得粉碎。这里一次性把源码切成「注释 / 字符串 / 数字 / 标识符 /
   * 其它」几类 token，各自包一个 span 就结束，绝不回头再扫。
   * ------------------------------------------------------------------ */

  var KW = ('abstract as base bool break byte case catch char checked class const continue ' +
    'decimal default delegate do double else enum event explicit extern false finally fixed ' +
    'float for foreach get goto if implicit in int interface internal is lock long namespace ' +
    'new null object operator out override params private protected public readonly ref return ' +
    'sbyte sealed set short sizeof stackalloc static string struct switch this throw true try ' +
    'typeof uint ulong unchecked unsafe ushort using virtual void volatile while var nameof').split(' ');

  var TYP = ('MonoBehaviour ScriptableObject Rigidbody2D Collider2D Collision2D BoxCollider2D ' +
    'CircleCollider2D PolygonCollider2D Vector2 Vector3 Vector4 Quaternion Transform GameObject ' +
    'List Dictionary HashSet Coroutine IEnumerator IEnumerable WaitForSeconds WaitForEndOfFrame ' +
    'Time Input Mathf Random Color Color32 Sprite SpriteRenderer Tilemap TileBase AudioSource ' +
    'AudioClip Animator Text TMP_Text Button Image RectTransform Camera Physics2D LayerMask Bounds ' +
    'RaycastHit2D RaycastHit KeyCode ForceMode2D ForceMode UnityEvent Vector2Int Vector3Int').split(' ');

  var ATTR = ('SerializeField Tooltip Range Header Space RequireComponent DefaultExecutionOrder ' +
    'CreateAssetMenu ExecuteAlways HideInInspector MinMaxRange').split(' ');

  var KWSET = {}, TYPSET = {}, ATTRSET = {};
  KW.forEach(function (w) { KWSET[w] = 1; });
  TYP.forEach(function (w) { TYPSET[w] = 1; });
  ATTR.forEach(function (w) { ATTRSET[w] = 1; });

  /* 扫描一行；st = {inBlock:boolean} 跨行传递「是否在块注释里」的状态 */
  function hlLine(src, st) {
    var out = '', i = 0;

    function push(text, cls) {
      if (!text) return;
      out += cls ? '<span class="' + cls + '">' + esc(text) + '</span>' : esc(text);
    }

    while (i < src.length) {
      /* --- 还在块注释里：一路吃到结束标记 --- */
      if (st.inBlock) {
        var e = src.indexOf('*/', i);
        if (e < 0) { push(src.slice(i), 'c-cmt'); i = src.length; }
        else { push(src.slice(i, e + 2), 'c-cmt'); i = e + 2; st.inBlock = false; }
        continue;
      }

      var c = src[i];

      /* --- 行注释 // --- */
      if (c === '/' && src[i + 1] === '/') { push(src.slice(i), 'c-cmt'); break; }

      /* --- 块注释 /* --- */
      if (c === '/' && src[i + 1] === '*') {
        var e2 = src.indexOf('*/', i + 2);
        if (e2 < 0) { push(src.slice(i), 'c-cmt'); st.inBlock = true; break; }
        push(src.slice(i, e2 + 2), 'c-cmt'); i = e2 + 2; continue;
      }

      /* --- 字符串 --- */
      if (c === '"') {
        var j = i + 1;
        while (j < src.length) {
          if (src[j] === '\\') { j += 2; continue; }
          if (src[j] === '"') { j++; break; }
          j++;
        }
        push(src.slice(i, j), 'c-str'); i = j; continue;
      }

      /* --- 数字 --- */
      if (c >= '0' && c <= '9') {
        var m = /^[0-9][0-9a-zA-Z._]*/.exec(src.slice(i));
        push(m ? m[0] : c, 'c-num'); i += (m ? m[0].length : 1); continue;
      }

      /* --- 标识符 / 关键字 / 类型 / 特性 --- */
      if (/[A-Za-z_]/.test(c)) {
        var m2 = /^[A-Za-z_][A-Za-z0-9_]*/.exec(src.slice(i));
        var w = m2[0];
        if (KWSET[w]) push(w, 'c-kw');
        else if (TYPSET[w]) push(w, 'c-typ');
        else if (ATTRSET[w]) push(w, 'c-typ');
        else push(w, null);
        i += w.length; continue;
      }

      push(c, null); i++;
    }
    return out;
  }

  /* 一个文件的高亮：返回 HTML 行数组 */
  function hlFile(lines) {
    var st = { inBlock: false }, out = [];
    for (var i = 0; i < lines.length; i++) out.push(hlLine(lines[i], st));
    return out;
  }

  /* ---------------- 全局状态 ---------------- */

  var S = {
    id: null,          // 当前课时 id
    game: null,        // create() 返回的实例
    running: false,
    paused: false,
    raf: 0,
    last: 0,
    fps: 0,
    _fpsT: 0, _fpsN: 0,
    stageVisible: true,
    keys: { up: false, down: false, left: false, right: false, fire: false },
    files: [],
    curFile: 0,
    api: null
  };

  /* ---------------- ① 图形化演示区 ---------------- */

  function buildStage(lesson) {
    var stage = $('#gstage');
    var cv = $('#gcv');
    stage.style.setProperty('--ar', (lesson.w || 640) + ' / ' + (lesson.h || 400));

    var ctx = cv.getContext('2d');

    /* 画布按设备像素比放大，否则高分屏上会发虚 */
    function resize() {
      var dpr = window.devicePixelRatio || 1;
      var r = stage.getBoundingClientRect();
      if (!r.width) return;
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.width * dpr * ((lesson.h || 400) / (lesson.w || 640)));
      var sc = cv.width / (lesson.w || 640);
      ctx.setTransform(sc, 0, 0, sc, 0, 0);
      if (lesson.draw) lesson.draw(ctx, S.api);
    }
    S._resize = resize;
    window.addEventListener('resize', resize);
    setTimeout(resize, 30);

    /* 指针：换算成逻辑坐标后交给游戏 */
    function toLocal(ev) {
      var r = cv.getBoundingClientRect();
      var cx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
      var cy = (ev.touches ? ev.touches[0].clientY : ev.clientY) - r.top;
      return {
        x: cx / r.width * (lesson.w || 640),
        y: cy / r.height * (lesson.h || 400)
      };
    }
    function pdown(ev) {
      if (ev.cancelable) ev.preventDefault();
      var p = toLocal(ev);
      if (lesson.onPointer) lesson.onPointer(p.x, p.y, true, S.api);
      S.api.resume();                        // 首次交互自动开始，省得再点一次
    }
    function pmove(ev) {
      var p = toLocal(ev);
      if (lesson.onPointerMove) lesson.onPointerMove(p.x, p.y, S.api);
    }
    function pup() {
      if (lesson.onPointerUp) lesson.onPointerUp(S.api);
    }
    cv.addEventListener('mousedown', pdown);
    cv.addEventListener('mousemove', pmove);
    window.addEventListener('mouseup', pup);
    cv.addEventListener('touchstart', pdown, { passive: false });
    cv.addEventListener('touchmove', function (e) {
      if (e.cancelable) e.preventDefault();
      pmove(e);
    }, { passive: false });
    cv.addEventListener('touchend', pup);

    return { ctx: ctx, resize: resize };
  }

  /* ---------------- ② 源码逐句分析 ---------------- */

  function buildCode(lesson) {
    var files = S.files || [];
    var tabs = $('#ctabs');
    if (!tabs) return;
    tabs.innerHTML = '';

    files.forEach(function (f, i) {
      var b = document.createElement('button');
      b.className = 'ctab' + (i === S.curFile ? ' on' : '');
      b.textContent = f.file;
      b.onclick = function () { S.curFile = i; buildCode(lesson); };
      tabs.appendChild(b);
    });

    if (!files.length) {
      $('#ccode').innerHTML = '<div style="padding:20px;color:#8b98ab">该课时暂无源码数据。</div>';
      return;
    }

    var f = files[S.curFile];
    if (!f) return;
    var notes = (lesson && lesson.notes && lesson.notes[f.file]) || {};
    var hl = f._hl || (f._hl = hlFile(f.lines));

    $('#crole').innerHTML =
      (f.role ? '<b>职责：</b>' + esc(f.role) : '') +
      (f.mount ? ' &nbsp;·&nbsp; <b>挂载：</b>' + esc(f.mount) : '');

    var n = 0, rows = '';
    for (var i = 0; i < hl.length; i++) {
      var note = notes[i + 1];
      var has = !!note;
      if (has) n++;
      rows +=
        '<tr class="cl' + (has ? ' ann' : '') + '" data-l="' + (i + 1) + '">' +
          '<td class="ln">' + (i + 1) + '</td>' +
          '<td class="ct">' + (hl[i] || '&nbsp;') + '</td>' +
        '</tr>';
      if (has) {
        rows +=
          '<tr class="ca' + (S.allAnn ? ' on' : '') + '" data-l="' + (i + 1) + '">' +
            '<td colspan="2"><div><b>为什么这么写 · </b>' + esc(note) + '</div></td>' +
          '</tr>';
      }
    }
    $('#ccode').innerHTML = '<table>' + rows + '</table>';
    $('#ccount').textContent = n + ' 处讲解';

    /* 点行 → 展开/收起这一行的讲解 */
    Array.prototype.forEach.call($('#ccode').querySelectorAll('tr.cl'), function (tr) {
      tr.onclick = function () {
        var l = tr.getAttribute('data-l');
        var ca = $('#ccode').querySelector('tr.ca[data-l="' + l + '"]');
        if (ca) ca.classList.toggle('on');
      };
    });
    applyAnnMode();
  }

  function applyAnnMode() {
    var box = $('#ccode');
    if (!box) return;
    box.classList.toggle('all', !!S.allAnn);
    var b = $('#bAnn');
    if (b) b.textContent = S.allAnn ? '收起讲解' : '展开全部讲解';
  }

  /* api.hit(file, line)：运行时把正在执行的那一行照亮，并滚动到视野内 */
  function hitLine(file, line) {
    var files = S.files || [];
    var idx = -1;
    for (var i = 0; i < files.length; i++) if (files[i].file === file) { idx = i; break; }
    if (idx < 0) return;
    /* 注意：这里要的是「课时定义」（里面有 notes），不是「游戏实例」。
       两者别混用 —— create() 里同步调 api.hit() 时 S.game 还没赋值，
       拿 currentLesson()（= S.game）会取到 null 然后报错。 */
    if (idx !== S.curFile) { S.curFile = idx; buildCode(window.UG_LESSONS[S.id] || null); }
    var box = $('#ccode');
    if (!box) return;
    var tr = box.querySelector('tr.cl[data-l="' + line + '"]');
    if (!tr) return;
    Array.prototype.forEach.call(box.querySelectorAll('tr.cl.flash'), function (e) {
      e.classList.remove('flash');
    });
    tr.classList.add('flash');
    var bt = tr.offsetTop, bh = box.clientHeight;
    if (bt < box.scrollTop + 20 || bt > box.scrollTop + bh - 40) {
      box.scrollTop = Math.max(0, bt - bh / 2);
    }
  }

  /* ---------------- ③ 运行结果 ---------------- */

  var logN = 0;
  function pushLog(msg, kind) {
    var box = $('#olog');
    if (!box) return;
    kind = kind || 'info';
    var d = new Date();
    var t = pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
    var row = document.createElement('div');
    row.innerHTML =
      '<span class="t">' + t + '</span>' +
      '<span class="k-' + kind + '">' + esc(msg) + '</span>';
    box.appendChild(row);
    logN++;
    while (logN > 300 && box.firstChild) { box.removeChild(box.firstChild); logN--; }
    box.scrollTop = box.scrollHeight;
  }

  function setVars(obj) {
    var box = $('#ovars');
    if (!box) return;
    var h = '<h5>关键状态</h5>';
    var keys = Object.keys(obj || {});
    if (!keys.length) h += '<div class="kv"><span>—</span><span>等待运行</span></div>';
    keys.forEach(function (k) {
      h += '<div class="kv"><span>' + esc(k) + '</span><span>' + esc(obj[k]) + '</span></div>';
    });
    box.innerHTML = h;
  }

  function clearLog() { var b = $('#olog'); if (b) b.innerHTML = ''; logN = 0; }

  /* ---------------- 游戏主循环 ---------------- */

  function loop(ts) {
    S.raf = requestAnimationFrame(loop);
    var L = currentLesson();
    if (!L) return;

    var dt = (ts - S.last) / 1000;
    S.last = ts;
    if (!isFinite(dt) || dt < 0) dt = 0;
    if (dt > 0.05) dt = 0.05;              // 卡顿时钳住，避免一帧穿模

    /* FPS 每 0.5 秒统计一次 */
    S._fpsN++; S._fpsT += dt;
    if (S._fpsT >= 0.5) { S.fps = Math.round(S._fpsN / S._fpsT); S._fpsN = 0; S._fpsT = 0; }
    var f = $('#mFps'); if (f) f.textContent = S.fps + ' FPS';

    if (S.running && !S.paused && L.update) L.update(dt, S.keys, S.api);

    if (L.draw) {
      var cv = $('#gcv');
      if (cv) {
        var ctx = cv.getContext('2d');
        ctx.save();
        L.draw(ctx, S.api);
        ctx.restore();
      }
    }
  }

  function currentLesson() { return S.game; }

  function mount(id) {
    var lesson = window.UG_LESSONS[id];
    if (!lesson) return;

    unmount();

    /* api：游戏与页面之间唯一的沟通桥梁 */
    var api = {
      log: pushLog,
      vars: setVars,
      hit: hitLine,
      clear: clearLog,
      keys: S.keys,
      pause: function () { setPaused(true); },
      resume: function () {
        if (!S.running) { S.running = true; S.paused = false; setOverlay(false); }
        else if (S.paused) setPaused(false);
      },
      reset: function () { doReset(); },
      rand: Math.random
    };
    S.api = api;
    S.id = id;
    S.files = window.UG_CODE[id] || [];
    S.curFile = 0;
    S.running = true;
    S.paused = false;

    /* 生成可玩实例 */
    var g = lesson.create ? lesson.create(api) : {};
    g.w = g.w || 640; g.h = g.h || 400;
    S.game = g;

    renderHead(lesson);
    var st = buildStage(g);
    buildCode(lesson);
    clearLog();
    setVars({});
    setOverlay(false);
    renderSide();

    pushLog('【' + lesson.name + '】已载入，共 ' + S.files.length + ' 个脚本文件', 'sys');
    pushLog('提示：可直接用键盘或鼠标操作上方画面，代码区紫色左边线的行有逐句讲解。', 'sys');

    S.last = performance.now();
    if (!S.raf) S.raf = requestAnimationFrame(loop);
  }

  function unmount() {
    var g = S.game;
    if (g && typeof g.destroy === 'function') { try { g.destroy(); } catch (e) {} }
    S.game = null;
    S.running = false;
    if (S._resize) { window.removeEventListener('resize', S._resize); S._resize = null; }
    if (S.raf) { cancelAnimationFrame(S.raf); S.raf = 0; }
  }

  function doReset() {
    var g = S.game;
    if (g && g.reset) g.reset();
    clearLog();
    setVars({});
    S.paused = false;
    setOverlay(false);
    S.running = true;
    var L = window.UG_LESSONS[S.id];
    pushLog('已重置 —— ' + (L ? L.name : ''), 'sys');
  }

  function setPaused(p) {
    S.paused = p;
    setOverlay(p);
    var b = $('#bPause');
    if (b) b.textContent = p ? '继续' : '暂停';
  }

  function setOverlay(on) {
    var o = $('#govl');
    if (!o) return;
    o.classList.toggle('hide', !on);
  }

  /* ---------------- 渲染：课时头 ---------------- */

  function renderHead(lesson) {
    $('#gTitle').textContent = lesson.name;
    $('#gOne').textContent = lesson.oneLiner || '';

    var tags = (lesson.tags || []).map(function (t) {
      return '<span class="ug-tag">' + esc(t) + '</span>';
    }).join('');
    var diff = '<span class="ug-stars" title="难度">' + stars(lesson.difficulty || 1) + '</span>';
    $('#gTags').innerHTML = diff + tags;
    $('#gKeys').innerHTML = '<b>操作：</b>' + esc(lesson.controls || '');
  }

  /* ---------------- 渲染：侧边栏 ---------------- */

  function renderSide() {
    var box = $('#ugSideNav');
    if (!box) return;
    var order = window.UG_ORDER || [];
    var h = '';
    order.forEach(function (id, i) {
      var L = window.UG_LESSONS[id];
      if (!L) return;
      var on = id === S.id ? ' on' : '';
      h += '<a class="ug-item' + on + '" href="outline.html?g=' + encodeURIComponent(id) + '">' +
             '<span class="gi">' + (L.ico || '🎮') + '</span>' +
             '<span>' + esc(L.name) + '</span>' +
             '<span class="gno">' + (i + 1) + '</span>' +
           '</a>';
    });
    box.innerHTML = h;
  }

  /* ---------------- 渲染：教学文案（思维 / 步骤） ---------------- */

  function renderThink(lesson) {
    var box = $('#gThink');
    if (!box) return;
    var t = lesson.think || {};
    var h = '';

    if (t.core && t.core.length) {
      h += '<div class="think"><h4>🧠 这一课要建立的思维</h4>';
      t.core.forEach(function (p) { h += '<p>' + esc(p) + '</p>'; });
      h += '</div>';
    }
    if (t.steps && t.steps.length) {
      h += '<div class="ug-pane"><div class="ug-pane-h">' +
           '<span class="num">▸</span><h3>从零做出来的步骤</h3></div>' +
           '<div class="ug-pane-b"><ol class="steps">';
      t.steps.forEach(function (s, i) {
        h += '<li><span class="n">' + (i + 1) + '</span><b>' + esc(s.t) + '</b>' +
             '<span>' + esc(s.d) + '</span></li>';
      });
      h += '</ol></div></div>';
    }
    if (t.transfer && t.transfer.length) {
      h += '<div class="think"><h4>🚀 这套思路还能用在哪</h4>';
      t.transfer.forEach(function (p) { h += '<p>' + esc(p) + '</p>'; });
      h += '</div>';
    }
    box.innerHTML = h;
  }

  /* ---------------- 首页 ---------------- */

  function renderHome() {
    var order = window.UG_ORDER || [];
    var cards = '';
    order.forEach(function (id, i) {
      var L = window.UG_LESSONS[id];
      if (!L) return;
      var tags = (L.tags || []).slice(0, 3).map(function (t) {
        return '<span class="ug-tag gray">' + esc(t) + '</span>';
      }).join('');
      cards +=
        '<a class="card" href="outline.html?g=' + encodeURIComponent(id) + '">' +
          '<div class="ch"><span class="ci">' + (L.ico || '🎮') + '</span>' +
          '<span class="cn">' + esc(L.name) + '</span></div>' +
          '<p class="cd">' + esc(L.oneLiner || '') + '</p>' +
          '<div class="ct">' + tags + '<span class="ug-stars">' + stars(L.difficulty || 1) + '</span></div>' +
        '</a>';
    });
    var box = $('#homeCards');
    if (box) box.innerHTML = cards;

    var n = order.filter(function (id) { return !!window.UG_LESSONS[id]; }).length;
    var s = $('#homeStat');
    if (s) s.textContent = n + ' 个课时 · 可交互运行 · 源码逐句讲解';
  }

  /* ---------------- 键盘 ---------------- */

  var MAP = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right',
    Space: 'fire', Enter: 'fire'
  };

  function stageInView() {
    var el = $('#gstage');
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return r.bottom > 60 && r.top < window.innerHeight;
  }

  function onKeyDown(e) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;

    /* 全局快捷键（课程级） */
    if (e.code === 'KeyP') { setPaused(!S.paused); e.preventDefault(); return; }
    if (e.code === 'KeyR') { doReset(); e.preventDefault(); return; }
    if (e.code === 'BracketLeft') { var a = prevId(); if (a) location.href = 'outline.html?g=' + a; return; }
    if (e.code === 'BracketRight') { var b = nextId(); if (b) location.href = 'outline.html?g=' + b; return; }

    var k = MAP[e.code];
    if (!k) return;
    if (stageInView()) e.preventDefault();      // 只在游戏可见时拦截，否则不打扰翻页
    if (!S.keys[k]) {
      S.keys[k] = true;
      var g = S.game;
      if (g && g.onKey) g.onKey(k, true, S.api);
    }
  }

  function onKeyUp(e) {
    var k = MAP[e.code];
    if (!k) return;
    S.keys[k] = false;
    var g = S.game;
    if (g && g.onKey) g.onKey(k, false, S.api);
  }

  function prevId() {
    var o = window.UG_ORDER || [], i = o.indexOf(S.id);
    return i > 0 ? o[i - 1] : null;
  }
  function nextId() {
    var o = window.UG_LESSON_ORDER || window.UG_ORDER || [], i = o.indexOf(S.id);
    return (i >= 0 && i < o.length - 1) ? o[i + 1] : null;
  }

  /* ---------------- 启动 ---------------- */

  function boot() {
    var home = $('#ugHome');
    var lesson = $('#ugLesson');

    if (home) renderHome();
    if (lesson) {
      var id = qs('g') || (window.UG_ORDER || [])[0];
      document.addEventListener('keydown', onKeyDown);
      document.addEventListener('keyup', onKeyUp);

      var bp = $('#bPause'), br = $('#bReset'), bc = $('#bClear'), ba = $('#bAnn');
      if (bp) bp.onclick = function () { setPaused(!S.paused); };
      if (br) br.onclick = doReset;
      if (bc) bc.onclick = clearLog;
      if (ba) ba.onclick = function () { S.allAnn = !S.allAnn; applyAnnMode(); };

      var pv = $('#bPrev'), nx = $('#bNext');
      if (pv) { var p = prevId(); pv.disabled = !p; pv.onclick = function () { location.href = 'outline.html?g=' + p; }; }
      if (nx) { var n = nextId(); nx.disabled = !n; nx.onclick = function () { location.href = 'outline.html?g=' + n; }; }

      S.allAnn = true;                 // 默认展开讲解：这一页本来就是拿来读的
      mount(id);
      renderThink(window.UG_LESSONS[id]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.UG_LOAD(boot);
    });
  } else {
    window.UG_LOAD(boot);
  }
})();
