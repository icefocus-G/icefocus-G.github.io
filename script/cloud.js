/* =========================================================================
 * 课程云同步引擎 v4 —— 全自动双向同步（多课程通用）
 *
 *  权威存储：GitHub 仓库里的 data/<COURSE>-sync.json
 *  本机：只是缓存，不需要点任何按钮
 *
 *  · 读：先取 raw.githubusercontent 上的仓库原文（永远是最新的），
 *        取不到才退回滚到同域静态文件。顺序不能反 —— 在 APK 里同域文件
 *        就是打包那一刻冻住的旧快照，排在前面会把手机上的新记录冲掉。
 *        同域静态文件降级为「只补本机没有的键」，永不允许覆盖本机。
 *  · 写：GitHub Contents API（Token 只在本机浏览器，一次性粘贴后永久免操作）
 *  · ★ 上传时机（v5）★
 *      只有在「学习数据真正被确定」时才上传，即页面主动调用
 *          IF_COURSE_SYNC.commit('理由')
 *      也就是：选择题选定了答案 / 其它题型确定了「答对·答错」/ 交卷 / 重做 / 标记掌握。
 *      滚动位置、阅读时长、页签、展开折叠这类浏览状态只写本机，不再触发上传。
 *      （想恢复成「任何改动都上传」，把 cfg.mode 设成 'global' 即可）
 *  · 每 20 秒自动拉取云端；切回标签页、窗口获得焦点时立即拉取（只读，不上传）
 *  · 关闭 / 切走页面时用 keepalive 请求补交一次，不会丢改动
 *  · 合并策略：本机改过的键优先，其余以云端为准（首次同步以云端为准）
 *  · 安全网：若本机存在 IF76::bak::<时间戳> 备份，把备份里本机当前缺失的
 *            学习记录补回来（只补不删），用于兜住「曾被旧快照覆盖」的情况
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
    if (s.indexOf('IF76::g::') === 0) return true;   /* 首页小游戏（贪吃蛇等）的进度 */
    if (s === 'IF::apk') return true;                /* 只是在标记「本机跑的是 App」 */
    return false;
  }

  /* 学习记录类键：这些是真正要跨设备同步的东西。
     从本机备份里找回数据时，只认这一类，避免把界面状态也一起翻出来。 */
  function isRecord(k) {
    var s = String(k);
    if (s.indexOf('if00076_exam_') === 0) return true;
    if (s.indexOf('if00076_') === 0) return true;
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
    autoPush: true,      // 允许自动上传
    /* 同步方式（用户在 ☁ 面板里二选一）：
         'answer' —— 只有选定答案 / 判定对错才上传（默认）
         'global' —— 任何改动都上传（含滚动位置、阅读时长） */
    mode: 'answer',
    pushOnChange: false, // 由 mode 推导，别手工设
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

    /* 同步方式：老配置里只有 pushOnChange，这里迁移成 mode */
    if (cfg.mode !== 'global' && cfg.mode !== 'answer') {
      cfg.mode = cfg.pushOnChange ? 'global' : 'answer';
    }
    cfg.pushOnChange = (cfg.mode === 'global');

    /* ★ 自动同步的三个开关一律强制打开。
       面板里早就没有这几个开关了（只剩「答题自动 / 全局自动」二选一），
       但老配置里可能残留 autoSync:false —— 一旦是 false，推送、离开补交、
       轮询补交会全部直接 return，表现为「怎么都不上传」，而且完全看不出原因。
       站点本身就是靠同步工作的，这里统一纠正回来。 */
    if (cfg.autoSync !== true || cfg.autoPull !== true || cfg.autoPush !== true) {
      var wasOff = (cfg.autoSync === false);
      cfg.autoSync = true;
      cfg.autoPull = true;
      cfg.autoPush = true;
      if (wasOff) cfg._autoSyncWasOff = true;
    }

    /* APK 里由打包脚本写入 script/gh-token.js，实现「装完就能同步」，无需手填 Token。
       网页端那个文件是空的（绝不能把 Token 放进公开仓库），走的仍是本机 localStorage。 */
    if (!cfg.token && typeof window.IF_GH_TOKEN === 'string' && window.IF_GH_TOKEN) {
      cfg.token = window.IF_GH_TOKEN;
      cfg.tokenBuiltIn = true;
    }
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
    var pending = changedKeys().length;
    var modeTxt = (cfg.mode === 'global') ? '全局自动' : '答题自动';
    var s = el('syncState');
    if (s) {
      var txt;
      if (!cfg.autoSync)      txt = '自动同步已关闭';
      else if (cfg.authFail)  txt = '同步凭据无效，请在下面重新填一次';
      else if (!cfg.token)    txt = '只读模式：云端数据照常读取，本机改动暂不上传（下面填一次 Token 即可全自动）';
      else if (cfg.lastError) txt = '上次同步失败：' + cfg.lastError;
      else if (pending)       txt = '待同步 ' + pending + ' 项 · ' + modeTxt;
      else                    txt = '已与云端一致 · ' + modeTxt + ' · ' + fmtIso(cfg.lastPushAt || cfg.lastPullAt);
      s.textContent = txt;
    }
    /* 只在「没有凭据 / 凭据失效」时才把 Token 输入框露出来 —— 平时完全看不见 */
    var tc = el('tokenCard');
    if (tc) tc.style.display = (cfg.token && !cfg.authFail) ? 'none' : 'block';
    var who = el('whoami'); if (who) who.textContent = '';
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
  /* 本机候选读取地址：GitHub 原文优先，同域静态文件只作兜底。
   *
   *   ⚠ 顺序不能反。同域文件在网页端确实是仓库最新内容，但在 APK 里它就是
   *     打包那一刻冻住的快照 —— 一旦排在前面，每次开 App 都会拿旧快照当
   *     「云端」，把手机上更新的做题记录冲掉（曾经真的把 77 条错题冲回 61 条）。 */
  function pullUrls() {
    var out = [];
    function add(u) { if (u && out.indexOf(u) < 0) out.push(u); }
    add('https://raw.githubusercontent.com/' + cfg.owner + '/' + cfg.repo + '/' +
        (cfg.branch || 'main') + '/' + String(cfg.path || DEF_PATH).replace(/^\/+/, ''));
    add(cfg.url);
    return out;
  }

  async function pull() {
    var urls = pullUrls(), lastErr = null, staticUrl = cfg.url;
    for (var i = 0; i < urls.length; i++) {
      var u = urls[i];
      try {
        var sep = u.indexOf('?') >= 0 ? '&' : '?';
        var r = await fetch(u + sep + '_t=' + Date.now(), { cache: 'no-store' });
        if (r.status === 404) { lastErr = new Error('HTTP 404 · ' + u); lastErr.nf = true; continue; }
        if (!r.ok) { lastErr = new Error('HTTP ' + r.status + ' · ' + u); continue; }
        var txt = await r.text();
        if (!txt || txt.trim().charAt(0) !== '{') { lastErr = new Error('云端文件不是有效的 JSON'); continue; }
        return {
          ok: true, content: txt, url: u,
          fromStatic: (u === staticUrl),   /* 静态快照：只允许填补空缺，不允许覆盖 */
          updatedAt: new Date().toISOString()
        };
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
    /* 只要本机还有「没同步出去的学习记录」就补交一次 —— 哪怕答题入口没调到
       commit()、或者你做完题直接关掉页面。quiet 键（滚动位置 / 阅读时长 /
       页签 / 小游戏）不计入 changedKeys()，所以不会「看一眼就上传」。 */
    if (!commitPending && !cfg.pushOnChange && !changedKeys().length) return;
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

  /* 帧是否正被用户看着。display:none 的元素 offsetWidth/Height 为 0。 */
  function isFrameVisible(f) {
    try {
      if (!f) return false;
      return (f.offsetWidth > 0 && f.offsetHeight > 0);
    } catch (e) { return true; }   /* 判断不了就当可见 —— 宁可不刷新，也不打扰 */
  }

  /* ★ 只刷新「当前看不见」的帧 ★
     正在看的那个一律不动：重载会闪白、滚动回跳，用户的感觉就是「跳页」。
     被隐藏的帧在后台悄悄重载，等用户切过去时已经是最新数据，全程无感。
     （壳页 study.html 用 .on 控制显示，隐藏帧的 offsetWidth 恒为 0。） */
  function reloadFrames() {
    var els = frameEls();
    for (var i = 0; i < els.length; i++) {
      (function (f, n) {
        try {
          if (isFrameVisible(f)) return;
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
    var fromStatic = !!(r && r.fromStatic);   /* 来源是包内 / 同域静态快照 */

    /* 本机从未同步过 + 本机**一条学习记录都没有** + 云端有数据 → 以云端为准。
       （新装的手机 / 清过缓存的浏览器，本机是空的，此时云端才是唯一有内容的一方。）
       ⚠ 两个前置条件缺一不可：
          · 来源必须是真云端，不能是同域静态快照（APK 里那份是旧快照）；
          · 本机必须确实没有学习记录。只要本机做过题（哪怕还没同步成功），
            也必须以本机为准 —— 否则用户在手机上做的题会被旧云端一次性冲掉。 */
    var localRecordCount = Object.keys(local).filter(isRecord).length;
    var remoteWins = !fromStatic && !cfg.syncedOnce && localRecordCount === 0 &&
                     !!(remote && Object.keys(remote).length);
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
    /* 静态快照只能用来「补齐本机没有的键」：本机已有的，一律以本机为准 */
    if (fromStatic) {
      Object.keys(local).forEach(function (k) { merged[k] = local[k]; });
    }
    if (remote) {
      Object.keys(merged).forEach(function (k) {
        if (remote[k] !== undefined && remote[k] !== local[k]) fromCloud.push(k);
      });
    }

    applyValues(merged);

    /* ====== 从本机备份里找回被覆盖的记录 ======
       「以云端为准」那一步会先把本机数据备份到 IF76::bak::<时间戳>。
       此处把备份里、本机当前完全没有的学习记录补回来。只补不删，可反复跑。 */
    var restored = [];
    try {
      var baks = [];
      for (var bi = 0; bi < localStorage.length; bi++) {
        var bk = localStorage.key(bi);
        if (bk && bk.indexOf('IF76::bak::') === 0) baks.push(bk);
      }
      baks.sort();
      for (var bj = 0; bj < baks.length; bj++) {
        var bo = null;
        try { bo = JSON.parse(localStorage.getItem(baks[bj]) || '{}'); } catch (e) { bo = null; }
        if (!bo) continue;
        var bks = Object.keys(bo);
        for (var bm = 0; bm < bks.length; bm++) {
          var bk2 = bks[bm];
          if (!isRecord(bk2) || isSkip(bk2)) continue;
          if (bk2 in merged) continue;
          merged[bk2] = bo[bk2];
          restored.push(bk2);
        }
      }
      if (restored.length) applyValues(merged);
    } catch (e) { /* ignore */ }

    if (restored.length) {
      commitPending = true;
      log('已从本机备份找回 ' + restored.length + ' 项学习记录');
      setBadge('warn', '找回 ' + restored.length + ' 项');
    }

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
    var wantPush = mine2 || fromCloud.length > 0 || notFound || restored.length > 0;
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

    /* 3) 兜底轮询：2 秒比对指纹。
          · 只要本机还有「没同步出去的学习记录」，就自动补推一次 ——
            这样即使某个入口忘了调 commit()、或者答题后你没再动页面，
            记录也不会一直留在本机传不上去。
          · 滚动位置、阅读时长、页签、小游戏进度这些都是 quiet 键，
            changedKeys() 压根不会把它们算作改动，所以不会「一动就同步」。 */
    setInterval(function () {
      if (!cfg.autoSync) return;
      var s = curSig();
      if (s === lastSig) return;
      lastSig = s;
      refreshState();
      if (!changedKeys().length) return;
      if (cfg.pushOnChange && cfg.autoPush) { markDirty(); return; }
      if (!cfg.autoPush || !cfg.token) return;
      commitPending = true;
      schedulePush(2500, '自动补交');
    }, 2000);

    /* 3.5) 每 60 秒做一次全量核对：页面开着但一直没操作、
           或者指纹没捕捉到的写入，靠这一道兜住，保证「所有记录都传得上去」。 */
    setInterval(function () {
      if (document.hidden) return;
      if (!cfg.autoSync || !cfg.autoPull || !cfg.autoPush || !cfg.token) return;
      if (syncing || pushTimer) return;
      if (!changedKeys().length) return;
      commitPending = true;
      schedulePush(500, '自动补交');
    }, 60000);

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

  /* 面板只剩「同步方式 + Token」，表单里没出现的字段一律保持原值，绝不清空配置 */
  function fillForm() {
    var r = document.querySelector('input[name="ifSyncMode"][value="' + cfg.mode + '"]');
    if (r) r.checked = true;
    if (el('ghToken')) el('ghToken').value = cfg.tokenBuiltIn ? '' : (cfg.token || '');
    if (el('ghToken')) el('ghToken').placeholder = cfg.tokenBuiltIn ? '已内置凭据（无需填写）' : 'github_pat_xxxxxxxx';
    var tc = el('tokenCard');
    if (tc) tc.style.display = (cfg.token && !cfg.authFail) ? 'none' : 'block';
    var who = el('whoami'); if (who) who.textContent = ghUser ? ('已登录：' + ghUser) : '';
  }

  function readForm() {
    var out = {};
    var t = el('ghToken');
    if (t && t.value.trim()) out.token = t.value.trim();
    var m = document.querySelector('input[name="ifSyncMode"]:checked');
    if (m) out.mode = (m.value === 'global') ? 'global' : 'answer';
    if (el('ghAuto')) out.autoSync = el('ghAuto').checked;
    if (el('ghAutoPull')) out.autoPull = el('ghAutoPull').checked;
    if (el('ghAutoPush')) out.autoPush = el('ghAutoPush').checked;
    return out;
  }

  function setMode(m) {
    cfg.mode = (m === 'global') ? 'global' : 'answer';
    cfg.pushOnChange = (cfg.mode === 'global');
    saveCfg();
    refreshState();
    log('同步方式：' + (cfg.mode === 'global' ? '全局自动（任何改动都上传）' : '答题自动（选定答案 / 判定对错后上传）'));
    if (cfg.pushOnChange) syncRound({ silent: true });
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

    /* 同步方式单选框：选完即生效，不用再点保存 */
    document.querySelectorAll('input[name="ifSyncMode"]').forEach(function (r) {
      r.addEventListener('change', function () { if (r.checked) setMode(r.value); });
    });

    if (el('btnSaveCfg')) el('btnSaveCfg').addEventListener('click', async function () {
      var before = cfg.token;
      cfg = Object.assign(cfg, readForm());
      cfg.pushOnChange = (cfg.mode === 'global');
      if (cfg.token !== before) cfg.authFail = false;   // 换了 Token 就重新试
      saveCfg();
      fillForm();
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

  /* ★ 换浏览器 / 换设备免手填 Token ★
     访问带 #t=<token>（或 ?t=<token>）的链接时，引擎自动收下这份凭据写进本机，
     随后立刻把地址栏里的 token 抹掉。
       · 用 #t= 时 fragment 根本不会发给服务器（Cloudflare / GitHub 都看不到）；
       · 抹除用 history.replaceState，不往浏览历史里压新记录。
     用法：把这样一条「登录链接」存成书签 —— 任何浏览器打开书签即自动登录，
     永远不用再粘贴 Token。Token 本身仍只存在本机 localStorage，绝不进公开仓库。 */
  function absorbUrlToken() {
    var s = String(location.hash || '') + '&' + String(location.search || '');
    var m = /[#?&]t=([^&#\s]+)/.exec(s);
    if (!m) return false;
    var tk = '';
    try { tk = decodeURIComponent(m[1]); } catch (e) { tk = m[1]; }
    tk = String(tk).trim();
    if (tk.length < 20) return false;
    try {
      var raw = localStorage.getItem(K_CFG);
      if (raw == null) raw = localStorage.getItem('IF76::ghcfg');
      var o = JSON.parse(raw || '{}');
      if (!o || typeof o !== 'object') o = {};
      o.token = tk;
      delete o.tokenBuiltIn;          /* 手动链接里的凭据算本机凭据 */
      localStorage.setItem(K_CFG, JSON.stringify(o));
    } catch (e) { return false; }
    /* 抹掉地址栏里的凭据 */
    try {
      var clean = location.href
        .replace(/([#?&])t=([^&#\s]+)/g, function (all, sep, val) {
          /* 只抹掉「长得像 token」的那个 —— 练习页壳子用 ?t=1 记页签，别误伤 */
          return (val && val.length >= 20) ? sep : all;
        })
        .replace(/[#?&]+$/, '');
      history.replaceState(null, '', clean);
    } catch (e) { /* ignore */ }
    return true;
  }

  function boot() {
    if (window.__IF_SYNC_BOOTED__ === CID) return;   // 同一页面重复引入时只跑一次
    window.__IF_SYNC_BOOTED__ = CID;
    var urlToken = absorbUrlToken();                 /* ★ 登录链接自动收下凭据 */
    loadCfg();
    if (urlToken) { log('已通过登录链接自动填入凭据，本机无需再手填 Token'); }
    fillForm();
    bind();
    lastSig = curSig();

    /* 「打开就是已同步」：本机若还有没传上去的答题记录，这次打开的同步就顺手带上去，
       不用等用户再答一道题。 */
    if (changedKeys().length) commitPending = true;

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
        autoPull: cfg.autoPull, autoPush: cfg.autoPush, mode: cfg.mode,
        syncedOnce: cfg.syncedOnce,
        lastPushAt: cfg.lastPushAt, lastPullAt: cfg.lastPullAt,
        pending: changedKeys().length, allPending: changedKeys(true).length,
        syncing: syncing, hasPushTimer: !!pushTimer,
        error: cfg.lastError, log: logBuf.slice()
      };
    }
  };
  window.openCloud = openCloud;
  window.closeCloud = closeCloud;

  boot();
})();
