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
      return '<div class="codeitem" data-key="' + CUR + '#' + i + '"><div class="ch"><span class="no">' + (i + 1) + '</span>' +
        '<span class="h">' + esc(c.label || '代码段') + '</span>' +
        '<button class="mini btn-run">▶ 运行</button>' +
        '<button class="mini copy" data-i="' + i + '">复制</button></div>' +
        '<pre class="code" data-lang="' + esc(c.lang) + '"><code>' + esc(c.text) + '</code></pre></div>';
    }).join('');
    var cnt = $('#tabCodeN');
    if (cnt) cnt.textContent = list.length;

    /* 给正文代码块与代码卡打上同一套 key，供「运行」查表 */
    var cp = $$('.doc .cpair');
    cp.forEach(function (el, i) {
      el.setAttribute('data-key', CUR + '#' + i);
      if (el.querySelector('.btn-run')) return;
      var head = el.querySelector('.chead');
      var copyBtn = el.querySelector('.mini.copy');
      var btn = document.createElement('button');
      btn.className = 'mini btn-run';
      btn.textContent = '▶ 运行';
      if (copyBtn) head.insertBefore(btn, copyBtn);
      else if (head) head.appendChild(btn);
    });
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

  /* ---------------- 运行（GitHub Actions 预跑结果回放） ------------------
     站点是纯静态托管，没有服务器能编译 C#。构建时用 GitHub Actions 把每段
     示例真跑一遍，结果落在 assets/run-output.json；这里的「运行」只是回放。
     原稿里有大量讲解文字混在代码块里（一维数组、string 是 char 的…），
     这些段编译不过，按钮降级成一个不可点的「片段」标记，不再挂红框吓人。
     ---------------------------------------------------------------------- */
  var RUNDATA = null, RUNP = null;

  function loadRun() {
    if (RUNP) return RUNP;
    RUNP = fetch('assets/run-output.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { RUNDATA = j; return j; })
      .catch(function () { RUNDATA = null; return null; });
    return RUNP;
  }

  function fmtOut(t) { return String(t || '').replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }

  /* 把编译错误码翻成人话，比直接甩 CS1002 有用 */
  function hintOf(err) {
    var e = String(err || '');
    if (/CS1001|CS1002|CS1003|CS1519|CS1525|CS1031/.test(e)) return '原稿这段混了讲解文字，不构成完整语句';
    if (/CS0103/.test(e)) return '用到了上文定义的变量或方法，单独一段跑不起来';
    if (/CS0246|CS0234/.test(e)) return '用到了别处定义的类型或命名空间';
    if (/CS1513|CS8124/.test(e)) return '括号或代码块不完整（原稿被截断）';
    if (/CS1056/.test(e)) return '含有编译器无法识别的字符';
    return '这段在原稿里不是可独立运行的程序';
  }

  /* 首屏就把按钮分好档，用户一眼能看出哪几段真能跑 */
  function markButtons() {
    if (!RUNDATA) return;
    $$('.btn-run').forEach(function (b) {
      var box = b.closest('.cpair, .codeitem');
      if (!box) return;
      var rec = RUNDATA.items[box.getAttribute('data-key')];
      if (!rec || rec.s !== 'fail') return;
      var tag = document.createElement('span');
      tag.className = 'seg-tag';
      tag.textContent = '片段';
      tag.title = hintOf(rec.e);
      b.parentNode.replaceChild(tag, b);
    });
  }

  function runPanel(box, key, codeLen) {
    var old = box.nextElementSibling;
    if (old && old.classList && old.classList.contains('runbox')) { old.remove(); return; }

    var d = RUNDATA;
    var head = '<div class="rb-h"><b>运行结果</b><span>' +
      (d && d.runtime ? fmtOut(d.runtime) + ' · ' + fmtOut(d.generated) : '—') +
      '</span><button class="mini rb-x">收起</button></div>';
    var body = '';

    if (!d) {
      body = '<pre class="rb-out rb-warn">拿不到 assets/run-output.json。\n本地 file:// 打开时浏览器会拦截读取，请用静态服务器或线上地址访问。</pre>';
    } else {
      var rec = d.items[key];
      if (!rec) {
        body = '<pre class="rb-out rb-warn">这段没有预跑数据。\n可能是新加的代码，等 GitHub Actions 跑完再试。</pre>';
      } else if (rec.n && Math.abs(rec.n - codeLen) > 12) {
        body = '<pre class="rb-out rb-warn">代码已更新（' + codeLen + ' 字符 / 预跑 ' + rec.n + ' 字符），这份输出可能过期。</pre>';
      } else if (rec.s === 'ok') {
        body = '<pre class="rb-out">' + (rec.o ? fmtOut(rec.o)
          : '（编译并运行成功，这段没有控制台输出 —— 原稿这里只做声明，没有打印）') + '</pre>';
      } else if (rec.s === 'lib') {
        body = '<pre class="rb-out rb-note">这段是类 / 方法定义，没有可以执行的入口 —— 已通过编译检查。</pre>';
      } else if (rec.s === 'runerr') {
        body = '<pre class="rb-out rb-err">运行时报错：\n' + fmtOut(rec.e || '（无错误信息）') + '</pre>';
      } else {
        body = '<pre class="rb-out rb-err">这段在原稿里不是可独立运行的程序：\n' + fmtOut(rec.e || '（无编译信息）') + '</pre>';
      }
    }

    var div = document.createElement('div');
    div.className = 'runbox';
    div.innerHTML = head + body;
    box.parentNode.insertBefore(div, box.nextSibling);
    var x = div.querySelector('.rb-x');
    if (x) x.onclick = function () { div.remove(); };
  }

  function initRun() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest('.btn-run');
      if (!b) return;
      var box = b.closest('.cpair, .codeitem');
      if (!box) return;
      var key = box.getAttribute('data-key');
      if (!key) return;
      var code = box.querySelector('pre.code');
      var pre = code || box.querySelector('pre');
      var len = pre ? pre.textContent.length : 0;
      if (RUNDATA) { runPanel(box, key, len); return; }
      b.disabled = true;
      b.classList.add('loading');
      b.textContent = '载入…';
      loadRun().then(function () {
        b.disabled = false;
        b.classList.remove('loading');
        b.textContent = '▶ 运行';
        runPanel(box, key, len);
      });
    });

    /* 数据到手后立刻分档；顺带在代码页顶部报一下本模块的可跑比例 */
    loadRun().then(function (d) {
      if (!d) return;
      markButtons();
      var run = 0;
      Object.keys(d.items).forEach(function (k) {
        if (k.indexOf(CUR + '#') !== 0) return;
        var s = d.items[k].s;
        if (s === 'ok' || s === 'lib') run++;
      });
      $$('[data-runcount]').forEach(function (el) { el.textContent = run; });
    });
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
    initCopy(); initLightbox(); initMark(); initHome(); initDrawer(); initRun();
  });
})();
