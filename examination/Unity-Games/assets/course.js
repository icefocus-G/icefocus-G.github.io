/* ============================================================================
   course.js —— 课程层（不动 app.js 的渲染，只在它之上加「课程感」）
     · 左侧目录：序号 / 已完成打勾
     · 顶栏进度条 + 侧栏百分比
     · 每课末尾「闯关测验」：从题库按游戏名筛选
     · 上一课 / 标记完成 / 下一课
   ========================================================================== */
(function () {
  'use strict';

  var DONE_KEY = 'ug.course.done.v1';
  var QUIZ_KEY = 'ug.course.quiz.v1';

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function ls(k, def) {
    try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(def)); } catch (e) { return def; }
  }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  /* 课时 id → 题库里的游戏前缀 */
  var QPREFIX = {
    pong: 'Pong', snake: 'Snake', flappybird: 'FlappyBird', brickbreaker: 'BrickBreaker',
    donkeykong: 'DonkeyKong', asteroids: 'Asteroids', spaceinvaders: 'SpaceInvaders',
    bomberman: 'Bomberman', centipede: 'Centipede', minesweeper: 'Minesweeper',
    game2048: '2048', tetris: 'Tetris', pacman: 'Pacman'
  };

  function done() { return ls(DONE_KEY, []); }
  function isDone(id) { return done().indexOf(id) > -1; }
  function setDone(id, on) {
    var a = done(), i = a.indexOf(id);
    if (on && i < 0) a.push(id);
    if (!on && i > -1) a.splice(i, 1);
    save(DONE_KEY, a);
    paint();
  }

  function pct() {
    var n = (window.UG_ORDER || []).filter(isDone).length;
    var t = (window.UG_ORDER || []).length || 1;
    return Math.round(n / t * 100);
  }

  function paint() {
    var p = pct();
    $$('[data-pct]').forEach(function (e) { e.textContent = p + '%'; });
    $$('[data-pbar]').forEach(function (e) { e.style.width = p + '%'; });
    $$('#ugSideNav .ug-item').forEach(function (a) {
      var m = /[?&]g=([^&]+)/.exec(a.getAttribute('href') || '');
      var id = m ? decodeURIComponent(m[1]) : '';
      a.classList.toggle('done', isDone(id));
    });
    $$('#homeCards .card').forEach(function (a) {
      var m = /[?&]g=([^&]+)/.exec(a.getAttribute('href') || '');
      var id = m ? decodeURIComponent(m[1]) : '';
      a.classList.toggle('done', isDone(id));
    });
    var b = $('#bMark');
    if (b) {
      var cur = curId();
      var on = isDone(cur);
      b.classList.toggle('done', on);
      b.textContent = on ? '✓ 已完成' : '标记完成';
    }
  }

  function curId() {
    var m = /[?&]g=([^&#]*)/.exec(location.search);
    if (m && m[1]) return decodeURIComponent(m[1]);
    return (window.UG_ORDER || [])[0];
  }

  /* ---------------- 测验 ---------------- */
  function renderQuiz(id) {
    var host = $('#quizWrap');
    if (!host) return;
    var pre = QPREFIX[id];
    var all = window.UG_QUIZ || [];
    var qs = all.filter(function (q) {
      return pre && String(q.c || '').toLowerCase().indexOf(pre.toLowerCase()) === 0;
    });
    if (!qs.length) { host.style.display = 'none'; return; }
    host.style.display = '';

    var answered = ls(QUIZ_KEY, {});
    var html = '<div class="quiz-h"><span class="num">4</span><h3>闯关测验</h3>' +
      '<span class="hint">选一个，立刻看对错与解析</span></div>';

    qs.forEach(function (q, qi) {
      var key = id + '#' + qi;
      var picked = answered[key];
      html += '<div class="cq" data-q="' + qi + '">' +
        '<div class="cq-q"><i>Q' + (qi + 1) + '</i><span>' + esc(q.q) + '</span></div>';
      q.o.forEach(function (op, oi) {
        var cls = 'cq-opt';
        if (picked != null) {
          if (oi === q.a) cls += ' ok';
          else if (oi === picked) cls += ' no';
        }
        html += '<button class="' + cls + '" data-o="' + oi + '">' +
          String.fromCharCode(65 + oi) + '. ' + esc(op) + '</button>';
      });
      html += '<div class="cq-exp' + (picked != null ? ' on' : '') + '"><b>解析 · </b>' +
        esc(q.e || '') + '</div></div>';
    });

    host.innerHTML = html;

    $$('.cq-opt', host).forEach(function (b) {
      b.addEventListener('click', function () {
        var box = b.closest('.cq');
        var qi = +box.getAttribute('data-q');
        var q = qs[qi];
        var key = id + '#' + qi;
        var ans = ls(QUIZ_KEY, {});
        if (ans[key] != null) return;            // 只记第一次
        ans[key] = +b.getAttribute('data-o');
        save(QUIZ_KEY, ans);
        $$('.cq-opt', box).forEach(function (x, i) {
          x.classList.remove('ok', 'no');
          if (i === q.a) x.classList.add('ok');
          else if (i === ans[key]) x.classList.add('no');
        });
        var exp = $('.cq-exp', box);
        if (exp) exp.classList.add('on');
      });
    });
  }

  /* ---------------- 课时头 / 翻页 ---------------- */
  function decorate(id) {
    var order = window.UG_ORDER || [];
    var i = order.indexOf(id);
    var kick = $('#gKick');
    if (kick) kick.textContent = '第 ' + (i + 1) + ' 课 / 共 ' + order.length + ' 课';

    var prev = i > 0 ? order[i - 1] : null;
    var next = (i > -1 && i < order.length - 1) ? order[i + 1] : null;
    var pv = $('#bPrev'), nx = $('#bNext');
    var Lp = prev ? window.UG_LESSONS[prev] : null;
    var Ln = next ? window.UG_LESSONS[next] : null;
    if (pv && Lp) pv.textContent = '← ' + (Lp.ico || '') + ' ' + Lp.name;
    if (nx && Ln) nx.textContent = (Ln.ico || '') + ' ' + Ln.name + ' →';
    paint();
  }

  /* ---------------- 等 app.js 渲染完再接管 ---------------- */
  function boot() {
    var isHome = !!$('#ugHome');
    if (isHome) {
      /* 首页：课时卡由 app.js 异步渲染，多补几次上色 */
      paint();
      [300, 900, 1800, 3200].forEach(function (t) { setTimeout(paint, t); });
      return;
    }

    var t0 = Date.now();
    var timer = setInterval(function () {
      var title = $('#gTitle');
      var ready = title && title.textContent && title.textContent.indexOf('载入中') < 0;
      if (ready || Date.now() - t0 > 8000) {
        clearInterval(timer);
        var id = curId();
        decorate(id);
        renderQuiz(id);
        if ($('#ugHome')) paint();

        var b = $('#bMark');
        if (b) b.addEventListener('click', function () { setDone(id, !isDone(id)); });

        /* 目录里的课时名可能被 app.js 重渲染，延迟补一次打勾 */
        setTimeout(paint, 400);
      }
    }, 120);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
