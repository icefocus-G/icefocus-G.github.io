/* ============================================================================
   C# 语言图谱 · 交互层
   - 页签：精读 / 代码 / 图示
   - 代码面板自动从正文抽取，带来源小节名与复制
   - 图示面板自动抽取，点击放大
   - 左侧卡片栏搜索、阅读进度（localStorage）、上一模块 / 下一模块
   ========================================================================== */
(function () {
  'use strict';

  var MODS = window.BOOK_MODS || [];
  var KEY = 'csbook.done.v1';
  var CUR = document.body.getAttribute('data-mid') || '';

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------------- 阅读进度 ---------------- */
  function readDone() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }
  function writeDone(arr) {
    try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (e) {}
  }
  function isDone(id) { return readDone().indexOf(id) > -1; }
  function toggleDone(id) {
    var a = readDone(), i = a.indexOf(id);
    if (i > -1) a.splice(i, 1); else a.push(id);
    writeDone(a);
    paintProgress();
    return i === -1;
  }
  function paintProgress() {
    var done = readDone();
    var n = MODS.filter(function (m) { return done.indexOf(m.id) > -1; }).length;
    var pct = MODS.length ? Math.round(n / MODS.length * 100) : 0;
    $$('[data-prog]').forEach(function (el) { el.textContent = pct + '%'; });
    $$('[data-progbar]').forEach(function (el) { el.style.width = pct + '%'; });
    $$('.mcard').forEach(function (c) {
      var id = c.getAttribute('data-id');
      c.classList.toggle('done', done.indexOf(id) > -1);
      var b = $('.bar i', c);
      if (b) b.style.width = done.indexOf(id) > -1 ? '100%' : '0';
    });
    var mk = $('#markBtn');
    if (mk) {
      var ok = done.indexOf(CUR) > -1;
      mk.classList.toggle('done', ok);
      mk.textContent = ok ? '✓ 已读' : '标记已读';
    }
  }

  /* ---------------- 左侧搜索 ---------------- */
  function initSearch() {
    var q = $('#q');
    if (!q) return;
    q.addEventListener('input', function () {
      var kw = q.value.trim().toLowerCase();
      var groups = {};
      $$('.mcard').forEach(function (c) {
        var hit = !kw || (c.getAttribute('data-text') || '').toLowerCase().indexOf(kw) > -1;
        c.style.display = hit ? '' : 'none';
        var g = c.getAttribute('data-cat');
        if (hit && g) groups[g] = (groups[g] || 0) + 1;
      });
      $$('.catg').forEach(function (h) {
        h.style.display = (groups[h.getAttribute('data-cat')] || 0) ? '' : 'none';
      });
    });
    q.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var first = $$('.mcard').filter(function (c) { return c.style.display !== 'none'; })[0];
      if (first) location.href = first.getAttribute('href');
    });
  }

  /* ---------------- 页签 ---------------- */
  function initTabs() {
    var tabs = $$('#tabs button');
    if (!tabs.length) return;
    tabs.forEach(function (b) {
      b.addEventListener('click', function () {
        var p = b.getAttribute('data-p');
        tabs.forEach(function (x) { x.classList.toggle('on', x === b); });
        $$('#view > .panel').forEach(function (pn) {
          pn.classList.toggle('on', pn.getAttribute('data-p') === p);
        });
        try { history.replaceState(null, '', '#' + p); } catch (e) {}
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
    var h = (location.hash || '').replace('#', '');
    var hit = tabs.filter(function (b) { return b.getAttribute('data-p') === h; })[0];
    if (hit && h !== 'read') hit.click();
  }

  /* ---------------- 代码面板 ---------------- */
  function initCode() {
    var host = $('#codeList');
    if (!host) return;
    var doc = $('.doc');
    if (!doc) return;
    var list = [], label = '';
    $$('h2,h3,.cpair', doc).forEach(function (el) {
      if (el.tagName === 'H2' || el.tagName === 'H3') { label = el.textContent.trim(); return; }
      var code = $('pre.code code', el) || $('pre.code', el);
      if (!code) return;
      list.push({ label: label, lang: (code.parentNode.getAttribute('data-lang') || 'csharp'), text: code.textContent });
    });
    if (!list.length) { host.innerHTML = '<div class="empty">本模块没有代码段。</div>'; return; }
    host.innerHTML = list.map(function (c, i) {
      return '<div class="codeitem"><div class="ch"><span class="no">' + (i + 1) + '</span>' +
        '<span class="h">' + esc(c.label || '代码段') + '</span>' +
        '<button class="mini copy" data-i="' + i + '">复制</button></div>' +
        '<pre class="code" data-lang="' + esc(c.lang) + '"><code>' + esc(c.text) + '</code></pre></div>';
    }).join('');
    var cnt = $('#tabCodeN');
    if (cnt) cnt.textContent = list.length;
  }

  /* ---------------- 图示面板 ---------------- */
  function initFigs() {
    var host = $('#figGrid');
    if (!host) return;
    var figs = $$('.doc figure img, .doc img');
    if (!figs.length) { host.innerHTML = '<div class="empty">本模块没有配图。</div>'; return; }
    host.innerHTML = figs.map(function (img, i) {
      var cap = '';
      var fg = img.closest('figure');
      if (fg) { var fc = $('figcaption', fg); if (fc) cap = fc.textContent.trim(); }
      return '<div class="figcard" data-src="' + esc(img.getAttribute('src')) + '" data-cap="' + esc(cap) + '">' +
        '<img loading="lazy" src="' + esc(img.getAttribute('src')) + '" alt="' + esc(cap) + '">' +
        '<div class="cap">' + esc(cap || ('配图 ' + (i + 1))) + '</div></div>';
    }).join('');
    var cnt = $('#tabFigN');
    if (cnt) cnt.textContent = figs.length;
  }

  /* ---------------- 复制 / 灯箱 ---------------- */
  function initCopy() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest('.copy');
      if (!b) return;
      var box = b.closest('.cpair, .codeitem');
      var code = box && box.querySelector('pre.code');
      if (!code) return;
      var text = code.textContent;
      var done = function () { var o = b.textContent; b.textContent = '已复制'; setTimeout(function () { b.textContent = o; }, 1200); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done);
      else { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); done(); }
    });
  }

  function initLightbox() {
    var lb = document.createElement('div');
    lb.id = 'lb';
    lb.innerHTML = '<img alt="">';
    document.body.appendChild(lb);
    document.addEventListener('click', function (e) {
      var img = e.target.closest('.doc figure img, .doc img, .figcard');
      if (img) {
        var src = img.getAttribute('data-src') || img.getAttribute('src');
        if (src) { $('img', lb).src = src; lb.classList.add('on'); e.preventDefault(); return; }
      }
      if (e.target === lb || e.target.tagName === 'IMG' && e.target.parentNode === lb) lb.classList.remove('on');
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.classList.remove('on'); });
  }

  /* ---------------- 已读 ---------------- */
  function initMark() {
    var b = $('#markBtn');
    if (b) b.addEventListener('click', function () { toggleDone(CUR); });
    paintProgress();
  }

  /* ---------------- 首页 ---------------- */
  function initHome() {
    var fbs = $$('.fbtn');
    if (!fbs.length) return;
    var cards = $$('.mcard2');
    fbs.forEach(function (b) {
      b.addEventListener('click', function () {
        fbs.forEach(function (x) { x.classList.toggle('on', x === b); });
        var c = b.getAttribute('data-cat');
        cards.forEach(function (card) {
          var ok = (c === 'all') || (card.getAttribute('data-cat') === c);
          card.style.display = ok ? '' : 'none';
        });
      });
    });
    paintProgress();
  }

  /* ---------------- 移动端侧栏 ---------------- */
  function initDrawer() {
    var t = $('#railToggle'), rail = $('#rail');
    if (!t || !rail) return;
    t.addEventListener('click', function () { rail.classList.toggle('open'); });
    document.addEventListener('click', function (e) {
      if (!rail.classList.contains('open')) return;
      if (rail.contains(e.target) || t.contains(e.target)) return;
      rail.classList.remove('open');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSearch(); initTabs(); initCode(); initFigs();
    initCopy(); initLightbox(); initMark(); initHome(); initDrawer();
  });
})();
