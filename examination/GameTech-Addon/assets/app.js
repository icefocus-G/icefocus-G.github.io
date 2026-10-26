(function () {
  var LS_DONE = 'gametech.done';
  var LS_POS = 'gametech.pos.';

  function loadDone() {
    try { return JSON.parse(localStorage.getItem(LS_DONE) || '[]'); } catch (e) { return []; }
  }
  function saveDone(a) { try { localStorage.setItem(LS_DONE, JSON.stringify(a)); } catch (e) {} }

  /* ---------- 代码复制 ---------- */
  document.querySelectorAll('.codewrap').forEach(function (w) {
    var btn = w.querySelector('.copy');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var code = w.querySelector('pre.code').innerText;
      var done = function () {
        btn.textContent = '已复制';
        btn.classList.add('ok');
        setTimeout(function () { btn.textContent = '复制'; btn.classList.remove('ok'); }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done).catch(function () { fallback(code, done); });
      } else { fallback(code, done); }
    });
  });
  function fallback(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- 自测题 ---------- */
  document.querySelectorAll('.qcard').forEach(function (card) {
    var ans = parseInt(card.dataset.a, 10);
    var why = card.dataset.why || '';
    var fb = card.querySelector('.qfb');
    var opts = card.querySelectorAll('.opt');
    opts.forEach(function (opt) {
      opt.addEventListener('click', function () {
        if (card.dataset.locked === '1') return;
        var pick = parseInt(opt.dataset.i, 10);
        var right = pick === ans;
        opts.forEach(function (o) {
          var i = parseInt(o.dataset.i, 10);
          if (i === ans) o.classList.add('right');
          else if (i === pick) o.classList.add('wrong');
          else o.classList.add('dim');
        });
        card.dataset.locked = '1';
        fb.className = 'qfb show ' + (right ? 'ok' : 'no');
        fb.innerHTML = '<b>' + (right ? '对。' : '不对，正确答案是 ' + 'ABCD'[ans] + '。') + '</b>' + why;
      });
    });
  });

  /* ---------- 侧栏搜索 ---------- */
  var q = document.getElementById('q');
  if (q) {
    q.addEventListener('input', function () {
      var kw = q.value.trim().toLowerCase();
      document.querySelectorAll('.mcard').forEach(function (c) {
        var hit = !kw || (c.dataset.text || '').toLowerCase().indexOf(kw) > -1;
        c.classList.toggle('hide', !hit);
      });
      document.querySelectorAll('.catg').forEach(function (g) {
        var n = 0, el = g.nextElementSibling;
        while (el && el.classList.contains('mcard')) {
          if (!el.classList.contains('hide')) n++;
          el = el.nextElementSibling;
        }
        g.classList.toggle('hide', n === 0);
      });
    });
  }

  /* ---------- 已读进度 ---------- */
  var mid = document.body.dataset.mid;
  var isIndex = document.body.classList.contains('is-index');
  var allIds = ['m01', 'm02', 'm03', 'm04', 'm05'];

  function paintRail() {
    var done = loadDone();
    document.querySelectorAll('.mcard').forEach(function (c) {
      c.classList.toggle('done', done.indexOf(c.dataset.id) > -1);
    });
    var pg = document.querySelector('.pg i');
    var txt = document.getElementById('pgtxt');
    if (pg) pg.style.width = (done.length / allIds.length * 100) + '%';
    if (txt) txt.textContent = done.length + ' / ' + allIds.length + ' 已读';
  }
  paintRail();

  if (mid && allIds.indexOf(mid) > -1) {
    // 记录滚动位置
    try {
      var y = localStorage.getItem(LS_POS + mid);
      if (y && parseInt(y, 10) > 200) window.scrollTo(0, parseInt(y, 10));
    } catch (e) {}
    var savePos = function () {
      try { localStorage.setItem(LS_POS + mid, String(Math.round(window.scrollY))); } catch (e) {}
    };
    window.addEventListener('scroll', function () { window.clearTimeout(window.__t); window.__t = window.setTimeout(savePos, 400); }, { passive: true });

    // 阅读到 75% 视为已读
    var markRead = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0) return;
      var pct = window.scrollY / h;
      var bar = document.querySelector('.mcard.on .bar i');
      if (bar) bar.style.width = Math.min(100, Math.round(pct * 100 / 0.75 * 100)) + '%';
      if (pct > 0.75) {
        var done = loadDone();
        if (done.indexOf(mid) === -1) { done.push(mid); saveDone(done); paintRail(); }
        var b = document.querySelector('.mcard.on .bar i');
        if (b) b.style.width = '100%';
      }
    };
    window.addEventListener('scroll', markRead, { passive: true });
    markRead();
  }

  /* ---------- 目录当前节高亮 ---------- */
  var links = document.querySelectorAll('.toc a');
  if (links.length) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.style.color = ''; a.style.background = ''; });
          var cur = map[e.target.id];
          if (cur) { cur.style.color = 'var(--accent)'; cur.style.background = 'var(--accent-soft)'; }
        }
      });
    }, { rootMargin: '-15% 0px -70% 0px' });
    document.querySelectorAll('article section[id]').forEach(function (s) { io.observe(s); });
  }
})();
