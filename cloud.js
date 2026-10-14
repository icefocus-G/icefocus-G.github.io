/* =========================================================================
 * GitHub 云同步（纯网页版）—— 权威数据在 GitHub，本机只是缓存
 *   · 读取：同目录的 IF00076-sync.json（GitHub Pages 上，无需 Token）
 *   · 写入：GitHub Contents API（需 Token，浏览器直连，GitHub 支持 CORS）
 *   · 打开页面自动拉取；本地一有改动约 20 秒后自动回传
 *   · 合并策略：本机改过的键优先，其余以云端为准，不会整体覆盖
 * 依赖 index.html 中的全局：frames / FILES / toast / setStatus / renderRecords / applyPayload / buildPayload / doExport
 * ========================================================================= */
(function () {
  'use strict';

  var K_CFG = 'IF76::ghcfg';       // 配置（含 Token，只存本机，绝不上传）
  var K_SNAP = 'IF76::cloudsnap';  // 上次同步快照
  var SKIP = [K_CFG, K_SNAP, 'IF76::synchash'];

  var cfg = {
    url: 'IF00076-sync.json',
    owner: 'icefocus-G', repo: 'icefocus-G.github.io',
    branch: 'main', path: 'IF00076-sync.json',
    token: '', autoPull: true, autoPush: true, heart: true,
    updatedAt: '', lastPullAt: '', lastPushAt: ''
  };

  var syncing = false, lastReload = 0, pushTimer = null, ghUser = '';

  function el(id) { return document.getElementById(id); }
  function isSkip(k) { return SKIP.indexOf(k) >= 0; }

  /* ---------------- 配置 ---------------- */

  function loadCfg() {
    try {
      var o = JSON.parse(localStorage.getItem(K_CFG) || '{}');
      cfg = Object.assign(cfg, o || {});
    } catch (e) { /* 用默认值 */ }
  }
  function saveCfg() {
    try { localStorage.setItem(K_CFG, JSON.stringify(cfg)); } catch (e) { /* ignore */ }
  }

  /* ---------------- 快照 ---------------- */

  function snapshot() {
    var s = {};
    function take(ls) {
      if (!ls) return;
      try {
        for (var i = 0; i < ls.length; i++) {
          var k = ls.key(i);
          if (isSkip(k)) continue;
          s[k] = ls.getItem(k);
        }
      } catch (e) { /* ignore */ }
    }
    take(window.localStorage);
    for (var f = 0; f < frames.length; f++) {
      try { take(frames[f].contentWindow.localStorage); } catch (e) { /* ignore */ }
    }
    return s;
  }
  function loadSnap() {
    try { return JSON.parse(localStorage.getItem(K_SNAP) || '{}'); } catch (e) { return {}; }
  }
  function saveSnap(s) {
    try { localStorage.setItem(K_SNAP, JSON.stringify(s)); } catch (e) { /* ignore */ }
  }
  function changedKeys() {
    var s = snapshot(), base = loadSnap(), out = [];
    Object.keys(s).forEach(function (k) {
      if (base[k] === undefined || base[k] !== s[k]) out.push(k);
    });
    return out;
  }

  /* 数据包：用完整快照（与 index.html 的 buildPayload 一致，但排除配置/快照键） */
  window.buildPayload = function () {
    return JSON.stringify({
      app: 'IF00076', ver: 2,
      device: 'web',
      updatedAt: new Date().toISOString(),
      data: snapshot()
    }, null, 2);
  };

  /* ---------------- 网络：读 ---------------- */

  async function pull() {
    var u = cfg.url || 'IF00076-sync.json';
    var sep = u.indexOf('?') >= 0 ? '&' : '?';
    var r;
    try {
      r = await fetch(u + sep + '_t=' + Date.now(), { cache: 'no-store' });
    } catch (e) {
      throw new Error('无法访问 ' + u + '（' + e.message + '）');
    }
    if (!r.ok) throw new Error('HTTP ' + r.status + ' · ' + u + '（文件可能还没上传）');
    var txt = await r.text();
    if (!txt || txt.trim().charAt(0) !== '{') throw new Error('云端文件不是有效的 JSON');
    return { ok: true, content: txt, url: u, updatedAt: new Date().toISOString() };
  }

  /* ---------------- 网络：写 ---------------- */

  function b64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  async function push(content) {
    if (!cfg.token) {
      throw new Error('未填写 Token，无法自动上传。可点「生成初始数据文件」导出后手动传到 GitHub。');
    }
    var api = 'https://api.github.com/repos/' + cfg.owner + '/' + cfg.repo +
      '/contents/' + String(cfg.path).split('/').map(encodeURIComponent).join('/');
    var h = {
      'Authorization': 'Bearer ' + cfg.token,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    var sha = null;
    var g = await fetch(api + '?ref=' + encodeURIComponent(cfg.branch || 'main'), { headers: h, cache: 'no-store' });
    if (g.ok) {
      var gj = await g.json();
      sha = gj.sha;
    } else if (g.status !== 404) {
      var gj2 = await g.json().catch(function () { return {}; });
      throw new Error('GitHub ' + g.status + '：' + (gj2.message || '读取失败'));
    }

    var body = {
      message: 'IF00076 学习数据同步 ' + new Date().toISOString(),
      content: b64(content),
      branch: cfg.branch || 'main'
    };
    if (sha) body.sha = sha;

    var p = await fetch(api, {
      method: 'PUT',
      headers: Object.assign({ 'Content-Type': 'application/json' }, h),
      body: JSON.stringify(body)
    });
    if (!p.ok) {
      var pj = await p.json().catch(function () { return {}; });
      throw new Error('GitHub ' + p.status + '：' + (pj.message || '提交失败'));
    }
    return { ok: true, updatedAt: new Date().toISOString() };
  }

  /* ---------------- 应用 ---------------- */

  function applySnapshot(merged) {
    try {
      Object.keys(merged).forEach(function (k) {
        if (localStorage.getItem(k) !== merged[k]) localStorage.setItem(k, merged[k]);
      });
    } catch (e) { /* ignore */ }
    saveSnap(merged);
  }

  function reloadFrames() {
    for (var i = 0; i < frames.length; i++) {
      (function (f, n) {
        f.dataset.loaded = '';
        try { f.contentWindow.location.reload(); }
        catch (e) { f.src = FILES[n] + '?t=' + Date.now(); }
      })(frames[i], i);
    }
  }

  /* ---------------- 状态 ---------------- */

  function setBadge(kind, text) {
    var b = el('btnCloud');
    if (!b) return;
    var map = { ok: '#0d9488', sync: '#2563eb', warn: '#d97706', err: '#dc2626', off: 'rgba(255,255,255,.28)' };
    b.style.background = map[kind] || map.off;
    b.textContent = '☁ ' + (text || '云同步');
  }
  function fmtIso(s) {
    if (!s) return '—';
    var d = new Date(s);
    if (isNaN(d.getTime())) return s;
    var p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }
  function refreshState() {
    var s = el('syncState');
    if (!s) return;
    var dirty = changedKeys();
    s.innerHTML =
      '<div><span class="dot ' + (cfg.url ? 'ok' : 'off') + '"></span>数据文件：<b>' + (cfg.url || '未配置') + '</b></div>' +
      '<div>提交目标：<b>' + cfg.owner + '/' + cfg.repo + '</b> · ' + (cfg.branch || 'main') + ' · ' + (cfg.path || '') + '</div>' +
      '<div>Token：<b>' + (cfg.token ? ('已填写' + (ghUser ? ' · ' + ghUser : '')) : '未填写（只读模式）') + '</b></div>' +
      '<div>本机最后拉取：<b>' + fmtIso(cfg.lastPullAt) + '</b>　最后上传：<b>' + fmtIso(cfg.lastPushAt) + '</b></div>' +
      '<div>本机状态：<b>' + (dirty.length ? ('有 ' + dirty.length + ' 项改动未上传') : '与云端一致') + '</b></div>';
  }

  /* ---------------- 双向合并同步 ---------------- */

  async function syncRound(opts) {
    opts = opts || {};
    if (syncing) return null;
    syncing = true;
    setBadge('sync', '同步中…');
    try {
      var r;
      try {
        r = await pull();
      } catch (e) {
        var notFound = /404|不是有效/.test(e.message);
        setBadge(notFound ? 'warn' : 'err', notFound ? '云端无文件' : '读取失败');
        if (notFound) setStatus('云端还没有数据文件，点「云同步 → 生成初始数据文件」导出后上传到仓库');
        if (!opts.silent) toast(notFound ? '云端还没有数据文件，请先生成并上传' : ('云端读取失败：' + e.message));
        return null;
      }

      var remote = {};
      try {
        var o = JSON.parse(r.content);
        remote = (o && o.data) ? o.data : o;
      } catch (e) {
        setBadge('err', '格式错误');
        if (!opts.silent) toast('云端文件不是有效的 JSON');
        return null;
      }

      var local = snapshot(), base = loadSnap();
      var merged = {}, fromCloud = [];
      Object.keys(remote).forEach(function (k) { merged[k] = remote[k]; });
      Object.keys(local).forEach(function (k) {
        var mine = (base[k] === undefined) || (base[k] !== local[k]);
        if (mine) merged[k] = local[k];
        else if (!(k in remote)) merged[k] = local[k];
        else merged[k] = remote[k];
      });
      Object.keys(merged).forEach(function (k) {
        if (remote[k] !== undefined && remote[k] !== local[k]) fromCloud.push(k);
      });

      applySnapshot(merged);
      cfg.updatedAt = r.updatedAt;
      cfg.lastPullAt = new Date().toISOString();

      var mine2 = Object.keys(local).some(function (k) {
        return (base[k] === undefined) || (base[k] !== local[k]);
      });

      if (cfg.token && cfg.autoPush && (mine2 || fromCloud.length)) {
        try {
          await push(window.buildPayload());
          cfg.lastPushAt = new Date().toISOString();
          saveCfg();
          setBadge('ok', '已同步');
          if (!opts.silent) toast('已同步到 GitHub');
        } catch (e) {
          setBadge('warn', '上传失败');
          if (!opts.silent) toast('上传失败：' + e.message);
        }
      } else if (!cfg.token && mine2) {
        setBadge('warn', '改动未上传');
        if (!opts.silent) toast('本机有 ' + changedKeys().length + ' 项改动，未填 Token 无法自动回传');
      } else {
        setBadge('ok', '已同步');
        if (!opts.silent) toast('已是最新');
      }
      saveCfg();

      if (fromCloud.length && Date.now() - lastReload > 60000) {
        lastReload = Date.now();
        renderRecords();
        reloadFrames();
        setStatus('已从云端合并 ' + fromCloud.length + ' 项更新');
      }
      renderRecords();
      return { merged: merged, fromCloud: fromCloud };
    } finally {
      syncing = false;
      refreshState();
    }
  }

  /* ---------------- 强制上传 / 下载 ---------------- */

  async function forcePush() {
    setBadge('sync', '上传中…');
    try {
      await push(window.buildPayload());
      cfg.lastPushAt = new Date().toISOString();
      saveSnap(snapshot());
      saveCfg();
      setBadge('ok', '已上传');
      toast('已上传到 GitHub');
      setStatus('已上传 · ' + fmtIso(cfg.lastPushAt));
    } catch (e) {
      setBadge('err', '上传失败');
      toast('上传失败：' + e.message);
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
      applyPayload(d, '已从 GitHub 恢复 · ' + fmtIso(r.updatedAt));
      cfg.updatedAt = r.updatedAt;
      cfg.lastPullAt = new Date().toISOString();
      saveCfg();
      setBadge('ok', '已下载');
      toast('已从云端恢复');
      closeCloud();
    } catch (e) {
      setBadge('err', '下载失败');
      toast('下载失败：' + e.message);
    }
    refreshState();
  }

  /* ---------------- 自动调度 ---------------- */

  function scheduleSync() {
    if (syncing) return;
    if (!cfg.token) { setBadge('warn', '改动未上传'); return; }
    clearTimeout(pushTimer);
    setBadge('sync', '待同步…');
    pushTimer = setTimeout(function () { syncRound({ silent: true }); }, 20000);
  }

  function startEngine() {
    setInterval(function () {
      if (syncing || document.hidden) return;
      if (changedKeys().length) scheduleSync();
    }, 8000);

    setInterval(function () {
      if (cfg.heart && !syncing && !document.hidden) syncRound({ silent: true });
    }, 300000);

    // 页面隐藏/关闭前尽力提交一次
    window.addEventListener('visibilitychange', function () {
      if (document.hidden && cfg.token && changedKeys().length) {
        try { push(window.buildPayload()); } catch (e) { /* ignore */ }
      }
    });
  }

  /* ---------------- 面板 ---------------- */

  function openCloud() { el('ghMask').classList.add('on'); refreshState(); }
  function closeCloud() { el('ghMask').classList.remove('on'); }

  function fillForm() {
    el('ghUrl').value = cfg.url || '';
    el('ghToken').value = cfg.token || '';
    el('ghRepo').value = (cfg.owner || '') && (cfg.repo || '') ? (cfg.owner + '/' + cfg.repo) : '';
    el('ghBranch').value = cfg.branch || 'main';
    el('ghPath').value = cfg.path || 'IF00076-sync.json';
    el('ghAutoPull').checked = cfg.autoPull !== false;
    el('ghAutoPush').checked = cfg.autoPush !== false;
    el('ghHeart').checked = cfg.heart !== false;
    if (ghUser) el('whoami').textContent = '已登录：' + ghUser;
  }

  function readForm() {
    var rp = (el('ghRepo').value || '').trim().split('/');
    return {
      url: el('ghUrl').value.trim() || 'IF00076-sync.json',
      token: el('ghToken').value.trim(),
      owner: (rp[0] || '').trim(),
      repo: (rp[1] || '').trim(),
      branch: el('ghBranch').value.trim() || 'main',
      path: el('ghPath').value.trim() || 'IF00076-sync.json',
      autoPull: el('ghAutoPull').checked,
      autoPush: el('ghAutoPush').checked,
      heart: el('ghHeart').checked
    };
  }

  async function doSaveCfg() {
    var f = readForm();
    cfg = Object.assign(cfg, f);
    saveCfg();
    refreshState();
  }

  function bind() {
    el('btnCloud').addEventListener('click', openCloud);
    el('ghClose').addEventListener('click', closeCloud);
    el('ghMask').addEventListener('click', function (e) { if (e.target === el('ghMask')) closeCloud(); });

    el('btnWhoami').addEventListener('click', async function () {
      var t = el('ghToken').value.trim();
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

    el('btnSaveCfg').addEventListener('click', async function () {
      await doSaveCfg();
      toast('配置已保存');
      syncRound({ silent: true });
    });

    el('btnInitFile').addEventListener('click', function () {
      doExport();
      toast('已生成 IF00076-sync.json，请上传到 GitHub 仓库根目录');
    });

    el('btnPull').addEventListener('click', forcePull);
    el('btnPull2').addEventListener('click', forcePull);
    el('btnPush').addEventListener('click', forcePush);
    el('btnSyncNow').addEventListener('click', function () { syncRound({ silent: false }); });
    el('btnGhOpen').addEventListener('click', function () {
      window.open('https://github.com/' + cfg.owner + '/' + cfg.repo, '_blank');
    });
  }

  /* ---------------- 启动 ---------------- */

  function boot() {
    loadCfg();
    fillForm();
    bind();
    refreshState();
    startEngine();
    if (cfg.autoPull !== false) {
      setBadge('sync', '拉取中…');
      syncRound({ silent: true }).then(function (r) {
        if (r) { setBadge('ok', '已同步'); setStatus('已与 GitHub 同步 · ' + fmtIso(cfg.updatedAt)); }
      });
    } else {
      setBadge('off', '云同步');
    }
  }

  window.IF76Cloud = { sync: syncRound, push: forcePush, pull: forcePull, cfg: function () { return cfg; } };
  window.openCloud = openCloud;
  window.closeCloud = closeCloud;
  boot();
})();
