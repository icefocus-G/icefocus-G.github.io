/* ================= C# 交互课件 · 图形演示运行时 =================
 * 每个演示：{ t: 标题, d: 说明, n: 结论, init(g) }
 * 由页面上 <div data-demo="id"></div> 自动挂载
 */
(function () {
  'use strict';

  var D = {};
  var NS = 'http://www.w3.org/2000/svg';

  function E(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function S(tag, at) {
    var e = document.createElementNS(NS, tag);
    if (at) for (var k in at) e.setAttribute(k, at[k]);
    return e;
  }
  function rint(n) { return Math.floor(Math.random() * n); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = rint(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pad(v, n) { var s = String(v); while (s.length < n) s = '0' + s; return s; }

  /* 固定步长循环：rAF 驱动，切后台不会堆积 */
  function ticker(ms, fn) {
    var acc = 0, last = 0, raf = 0, on = false;
    function loop(t) {
      if (!on) return;
      if (!last) last = t;
      acc += t - last;
      last = t;
      var guard = 0;
      while (acc >= ms && guard++ < 30) { acc -= ms; fn(); }
      if (on) raf = requestAnimationFrame(loop);
    }
    return {
      start: function () { if (on) return; on = true; last = 0; acc = 0; raf = requestAnimationFrame(loop); },
      stop: function () { on = false; if (raf) cancelAnimationFrame(raf); raf = 0; },
      isOn: function () { return on; }
    };
  }

  function tween(dur, fn) {
    var t0 = 0;
    function f(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      fn(k);
      if (k < 1) requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }

  function mount(host, id) {
    var cfg = D[id];
    if (!cfg) return null;
    var box = E('div', cfg.home ? 'dz home' : 'dz');
    var head = E('div', 'dz-h');
    head.innerHTML = '<span class="dz-kick">互动演示</span><h3>' + cfg.t + '</h3><p>' + cfg.d + '</p>';
    var st = E('div', 'dz-stage');
    var pl = E('div', 'dz-pills');
    var bar = E('div', 'dz-bar');
    var nt = E('div', 'dz-note');
    nt.innerHTML = cfg.n || '';
    box.appendChild(head); box.appendChild(st); box.appendChild(pl); box.appendChild(bar); box.appendChild(nt);
    host.appendChild(box);

    var g = {
      stage: st, bar: bar, note: nt, pills: pl, root: box, data: host.dataset,
      btn: function (label, fn, cls) {
        var b = E('button', 'dz-btn' + (cls ? ' ' + cls : ''));
        b.type = 'button'; b.textContent = label;
        b.addEventListener('click', fn);
        bar.appendChild(b);
        return b;
      },
      sep: function () { bar.appendChild(E('span', 'dz-sep')); },
      range: function (label, min, max, val, step, fn) {
        var w = E('span', 'dz-range');
        var lab = E('span', null, label); lab.style.fontSize = '12px';
        var r = E('input');
        r.type = 'range'; r.min = min; r.max = max; r.step = step || 1; r.value = val;
        r.addEventListener('input', function () { fn(+r.value); });
        w.appendChild(lab); w.appendChild(r); bar.appendChild(w);
        return r;
      },
      pill: function (label, v, cls) {
        var p = E('span', 'dz-pill' + (cls ? ' ' + cls : ''));
        p.innerHTML = '<i></i><b></b>';
        p.querySelector('i').textContent = label;
        p.querySelector('b').textContent = v;
        pl.appendChild(p);
        return { el: p, set: function (x) { p.querySelector('b').textContent = x; } };
      },
      say: function (h) { nt.innerHTML = h; },
      ticker: ticker
    };
    try { cfg.init(g, host); }
    catch (err) { st.innerHTML = '<div style="color:#c0392b;font-size:12px;padding:8px">演示加载失败：' + err.message + '</div>'; }
    return g;
  }

  /* =========================================================
   * 01 · 二进制点灯
   * =======================================================*/
  D.num = {
    t: '二进制点灯：8 个开关看懂进制',
    d: '点任意一位开关改变数字，十进制 / 二进制 / 八进制 / 十六进制同步刷新；「演示除法」看除 2 取余的逆序拼装过程。',
    n: '<b>记住权重：</b>从左到右是 128 64 32 16 8 4 2 1，哪一位亮就加上哪一位的权重。<b>除 2 取余要倒着读</b>——最后得到的余数是最高位，这就是「逆序拼装」。',
    init: function (g) {
      var val = 213;
      var grid = E('div', 'nz-grid');

      var left = E('div');
      left.style.cssText = 'min-width:0';
      var right = E('div');
      right.style.cssText = 'min-width:0';
      grid.appendChild(left); grid.appendChild(right);
      g.stage.appendChild(grid);

      var bitsRow = E('div', 'bits');
      var bitEls = [];
      for (var k = 7; k >= 0; k--) {
        (function (kk) {
          var b = E('div', 'bit');
          b.innerHTML = '<i>2<sup>' + kk + '</sup>=' + (1 << kk) + '</i><b>0</b>';
          b.addEventListener('click', function () {
            var nv = val ^ (1 << kk);
            val = nv;
            paint(); clearDiv();
          });
          bitsRow.appendChild(b);
          bitEls[kk] = b;
        })(k);
      }
      left.appendChild(bitsRow);

      var big = E('div');
      big.style.cssText = 'display:flex;align-items:baseline;justify-content:center;gap:10px;margin-top:18px';
      big.innerHTML = '<b style="font:700 36px/1 var(--mono);color:#2b6cf6;font-variant-numeric:tabular-nums">0</b>' +
        '<span style="font-size:12px;color:#8a96a8">十进制</span>';
      left.appendChild(big);

      var hx = E('div');
      hx.style.cssText = 'text-align:center;margin-top:6px;font:600 13px/1.6 var(--mono);color:#8a96a8';
      left.appendChild(hx);

      right.innerHTML = '<div style="font-size:11.5px;color:#8a96a8;margin-bottom:6px">除 2 取余</div>';
      var vd = E('div', 'vdiv');
      var vrows = E('div');
      vd.appendChild(vrows);
      right.appendChild(vd);
      var hint = E('div');
      hint.style.cssText = 'font-size:11px;color:#b3bdcb;margin-top:6px';
      hint.textContent = '点下面的按钮开始';
      right.appendChild(hint);

      var pDec = g.pill('十进制', '0');
      var pBin = g.pill('二进制', '00000000');
      var pHex = g.pill('十六进制', '0x00');
      var pOct = g.pill('八进制', '0o0');

      var timers = [];
      function clearDiv() {
        timers.forEach(clearTimeout); timers.length = 0;
        vrows.innerHTML = '';
        hint.textContent = '点「演示除 2 取余」开始';
      }

      function paint() {
        for (var k2 = 0; k2 < 8; k2++) {
          var on = (val >> k2) & 1;
          bitEls[k2].classList.toggle('on', !!on);
          bitEls[k2].querySelector('b').textContent = on;
        }
        big.querySelector('b').textContent = val;
        hx.innerHTML = '二进制 <span style="color:#24324a">' + pad(val.toString(2), 8) + '</span>';
        pDec.set(val);
        pBin.set(pad(val.toString(2), 8));
        pHex.set('0x' + pad(val.toString(16).toUpperCase(), 2));
        pOct.set('0o' + val.toString(8));
        hint.textContent = '';
      }

      function demoDiv() {
        clearDiv();
        var n = val, rows = [], i = 0;
        if (n === 0) rows.push([0, 0, 0]);
        while (n > 0) { var q = Math.floor(n / 2), r = n % 2; rows.push([n, q, r]); n = q; }
        rows.forEach(function (s, idx) {
          timers.push(setTimeout(function () {
            var r = E('div', 'r');
            r.innerHTML = '<span>' + s[0] + ' ÷ 2</span><em>= ' + s[1] + ' 余 ' + s[2] + '</em>';
            vrows.appendChild(r);
            requestAnimationFrame(function () { r.classList.add('in'); });
            if (idx === rows.length - 1) {
              hint.textContent = '把余数从下往上读 → ' + pad(val.toString(2), 8);
              hint.style.color = '#17a673';
            }
          }, idx * 240));
        });
      }

      g.btn('随机', function () { val = rint(256); paint(); clearDiv(); });
      g.btn('清零', function () { val = 0; paint(); clearDiv(); });
      g.btn('全 1', function () { val = 255; paint(); clearDiv(); });
      g.btn('演示除 2 取余', demoDiv, 'pri');
      g.sep();
      g.range('拖动改数', 0, 255, val, 1, function (v) { val = v; paint(); clearDiv(); });
      paint();
    }
  };

  /* =========================================================
   * 02 · for 循环单步执行
   * =======================================================*/
  D.flow = {
    t: 'for 循环是怎么跑的：单步执行',
    d: '点「单步」或「播放」，看程序在条件判断、循环体、自增之间来回跳，i 与 sum 同步变化，控制台逐行输出。',
    n: '<b>循环三件事：</b>初始化只做一次 → 判断条件 → 执行循环体 → 自增 → 回到判断。条件为 <code>false</code> 时立即跳出，循环体一次都不再执行。',
    init: function (g) {
      var CODE = [
        'int sum = 0;',
        'for (int i = 0; i < 5; i++)',
        '{',
        '    sum += i;',
        '    Console.WriteLine($"i={i} sum={sum}");',
        '}',
        'Console.WriteLine($"total={sum}");'
      ];

      var steps = [], sum = 0;
      steps.push({ l: 0, i: '—', sum: 0, cond: '—', out: null, act: '初始化：sum = 0' });
      for (var i = 0; i < 5; i++) {
        steps.push({ l: 1, i: i, sum: sum, cond: '?', act: '初始化/自增后 i = ' + i });
        steps.push({ l: 1, i: i, sum: sum, cond: 'true', act: '判断 i < 5 → 成立' });
        steps.push({ l: 3, i: i, sum: sum, cond: 'true', act: 'sum = ' + sum + ' + ' + i });
        sum += i;
        steps.push({ l: 4, i: i, sum: sum, cond: 'true', act: '输出一行', out: 'i=' + i + ' sum=' + sum });
        steps.push({ l: 1, i: i, sum: sum, cond: 'true', act: '自增：i++ → ' + (i + 1) });
      }
      steps.push({ l: 1, i: 5, sum: sum, cond: 'false', act: '判断 i < 5 → 不成立，跳出' });
      steps.push({ l: 6, i: 5, sum: sum, cond: 'false', act: '输出总和', out: 'total=' + sum });

      var wrap = E('div');
      wrap.style.cssText = 'display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start';
      var lc = E('div', 'trace');
      lc.style.cssText = 'flex:1 1 320px;min-width:260px';
      var rc = E('div');
      rc.style.cssText = 'flex:0 0 190px;min-width:160px';
      wrap.appendChild(lc); wrap.appendChild(rc);
      g.stage.appendChild(wrap);

      var lineEls = CODE.map(function (src, idx) {
        var d = E('div', 'ln');
        d.innerHTML = '<u>' + (idx + 1) + '</u><s></s>';
        d.querySelector('s').textContent = src;
        lc.appendChild(d);
        return d;
      });

      function stateBox(label, color) {
        var b = E('div');
        b.style.cssText = 'border:1px solid #dbe3f0;border-radius:10px;background:#fff;padding:7px 10px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center';
        b.innerHTML = '<span style="font-size:11.5px;color:#8a96a8">' + label + '</span>' +
          '<b style="font:700 16px/1 var(--mono);color:' + color + '">—</b>';
        rc.appendChild(b);
        return b.querySelector('b');
      }
      var bi = stateBox('变量 i', '#2b6cf6');
      var bs = stateBox('变量 sum', '#d9821b');
      var bc = stateBox('条件 i < 5', '#17a673');
      var actEl = E('div');
      actEl.style.cssText = 'font-size:11.5px;line-height:1.6;color:#5a6a83;margin:2px 0 8px';
      rc.appendChild(actEl);
      var cons = E('div', 'consolebox');
      cons.textContent = '// 控制台';
      rc.appendChild(cons);

      var ptr = 0, tk = g.ticker(760, function () { if (!step()) { tk.stop(); playBtn.textContent = '▶ 播放'; playBtn.classList.remove('on'); } });
      var playBtn;

      function render() {
        var s = steps[ptr];
        lineEls.forEach(function (el, idx) { el.classList.toggle('on', idx === s.l); });
        bi.textContent = s.i;
        bs.textContent = s.sum;
        bc.textContent = s.cond;
        bc.style.color = s.cond === 'true' ? '#17a673' : (s.cond === 'false' ? '#e5484d' : '#8a96a8');
        actEl.textContent = s.act;
      }

      function step() {
        if (ptr >= steps.length - 1) { render(); return false; }
        ptr++;
        var s = steps[ptr];
        render();
        if (s.out) {
          var old = cons.querySelector('.cur');
          if (old) old.classList.remove('cur');
          var ln = E('div', 'cur', s.out);
          cons.appendChild(ln);
          cons.scrollTop = cons.scrollHeight;
        }
        return true;
      }

      function reset() {
        ptr = 0; cons.innerHTML = '<div style="color:#4d6280">// 控制台</div>';
        render();
        tk.stop();
        if (playBtn) { playBtn.textContent = '▶ 播放'; playBtn.classList.remove('on'); }
      }

      playBtn = g.btn('▶ 播放', function () {
        if (tk.isOn()) { tk.stop(); playBtn.textContent = '▶ 播放'; playBtn.classList.remove('on'); }
        else { if (ptr >= steps.length - 1) reset(); tk.start(); playBtn.textContent = '⏸ 暂停'; playBtn.classList.add('on'); }
      }, 'pri');
      g.btn('单步 →', function () { tk.stop(); playBtn.textContent = '▶ 播放'; playBtn.classList.remove('on'); step(); });
      g.btn('重置', reset);
      reset();
    }
  };

  /* =========================================================
   * 03 · 值类型 vs 引用类型
   * =======================================================*/
  D.valueref = {
    t: '值类型 vs 引用类型：复制的是数据，还是地址',
    d: '左边 int 赋值会把数据复制一份，改 b 与 a 无关；右边 new 出来的对象在堆里只有一份，p2 = p1 复制的是地址，动谁都一样。',
    n: '<b>一句话区分：</b>值类型（int / float / bool / struct / enum）变量里装的就是数据本身；引用类型（class / 数组 / string / 委托）变量里装的是「堆上那个对象的门牌号」，赋值只复制门牌号。',
    init: function (g) {
      var svg = S('svg', { viewBox: '0 0 720 310' });
      g.stage.appendChild(svg);

      function panel(x, title, sub) {
        svg.appendChild(S('rect', { x: x, y: 6, width: 340, height: 296, rx: 14, fill: '#fbfcff', stroke: '#e4e8ef' }));
        var t = S('text', { x: x + 16, y: 32, fill: '#16243a', 'font-size': 13.5, 'font-weight': 700 });
        t.textContent = title; svg.appendChild(t);
        var s = S('text', { x: x + 16, y: 52, fill: '#8a96a8', 'font-size': 11 });
        s.textContent = sub; svg.appendChild(s);
      }
      panel(8, 'int · 值类型', '变量里直接装着数字');
      panel(372, 'Person · 引用类型', '变量里装着堆上的地址');

      function box(x, y, w, h, label, val, color) {
        var r = S('rect', { x: x, y: y, width: w, height: h, rx: 10, fill: '#fff', stroke: '#cfd9e8', 'stroke-width': 1.5 });
        var l = S('text', { x: x + 10, y: y + 16, fill: '#8a96a8', 'font-size': 10.5, 'font-family': 'monospace' });
        l.textContent = label;
        var v = S('text', { x: x + w / 2, y: y + h / 2 + 9, fill: color || '#24324a', 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle', 'font-family': 'monospace' });
        v.textContent = val;
        svg.appendChild(r); svg.appendChild(l); svg.appendChild(v);
        return { rect: r, txt: v };
      }

      // 左：值类型
      var A = box(40, 82, 120, 46, 'a', '1');
      var B = box(40, 190, 120, 46, 'b', '1');
      var cap1 = S('text', { x: 40, y: 268, fill: '#8a96a8', 'font-size': 11 });
      cap1.textContent = 'b = a 时，两份数据各存各的';
      svg.appendChild(cap1);
      var arr1 = S('path', { d: 'M 100 136 L 100 182', stroke: '#c3cbd8', 'stroke-width': 1.5, 'stroke-dasharray': '4 4', 'marker-end': '' });
      svg.appendChild(arr1);
      var copyNote = S('text', { x: 112, y: 165, fill: '#17a673', 'font-size': 10.5 });
      copyNote.textContent = '复制值';
      svg.appendChild(copyNote);

      // 右：引用类型
      var P1 = box(392, 82, 96, 46, 'p1', '●');
      var P2 = box(392, 190, 96, 46, 'p2', '●');
      var heapRect = S('rect', { x: 566, y: 118, width: 126, height: 80, rx: 10, fill: '#f2f6ff', stroke: '#9db9ec', 'stroke-width': 1.5 });
      svg.appendChild(heapRect);
      var heapLab = S('text', { x: 578, y: 138, fill: '#4e7cf6', 'font-size': 10, 'font-family': 'monospace' });
      heapLab.textContent = '堆上唯一对象';
      svg.appendChild(heapLab);
      var heapName = S('text', { x: 629, y: 172, fill: '#24324a', 'font-size': 15, 'font-weight': 700, 'text-anchor': 'middle' });
      heapName.textContent = '小明';
      svg.appendChild(heapName);
      var heapP = S('rect', { x: 566, y: 118, width: 126, height: 80, rx: 10, fill: 'none', stroke: '#e5484d', 'stroke-width': 2, opacity: 0 });
      svg.appendChild(heapP);

      function link(y1, y2) {
        var p = S('path', { d: 'M ' + 492 + ' ' + y1 + ' C 530 ' + y1 + ', 530 ' + y2 + ', 562 ' + y2, fill: 'none', stroke: '#9db9ec', 'stroke-width': 1.6 });
        svg.appendChild(p);
        return p;
      }
      var L1 = link(105, 142);
      var L2 = link(213, 172);

      var cap2 = S('text', { x: 392, y: 268, fill: '#8a96a8', 'font-size': 11 });
      cap2.textContent = 'p2 = p1 时，两个门牌指向同一个对象';
      svg.appendChild(cap2);

      var flashT = 0;
      function flash(list) {
        list.forEach(function (el) {
          el.setAttribute('stroke', '#e5484d');
          el.setAttribute('stroke-width', '2.4');
        });
        clearTimeout(flashT);
        flashT = setTimeout(function () {
          list.forEach(function (el) { el.setAttribute('stroke', '#cfd9e8'); el.setAttribute('stroke-width', '1.5'); });
          heapP.setAttribute('opacity', 0);
        }, 760);
      }

      function copyAnim() {
        var ghost = S('rect', { x: 40, y: 82, width: 120, height: 46, rx: 10, fill: '#17a673', opacity: .22 });
        svg.appendChild(ghost);
        tween(520, function (k) {
          ghost.setAttribute('y', 82 + 108 * k);
          ghost.setAttribute('opacity', 0.22 * (1 - k) + 0.02);
        });
        setTimeout(function () { ghost.remove(); }, 560);
      }

      g.btn('b = a（复制）', function () {
        copyAnim(); B.txt.textContent = '1';
        flash([A.rect, B.rect]);
        g.say('<b>值类型：</b>把 a 里的 1 复制进 b，之后 a 与 b 彻底独立。');
      });
      g.btn('b = 99', function () {
        B.txt.textContent = '99';
        flash([B.rect]);
        g.say('<b>改 b 不影响 a：</b>a 仍是 1 —— 两份独立的数据。');
      }, 'pri');
      g.btn('p2.Name = 小红', function () {
        heapName.textContent = '小红';
        flash([heapRect, heapP, P1.rect, P2.rect]);
        L1.setAttribute('stroke', '#e5484d');
        L2.setAttribute('stroke', '#e5484d');
        setTimeout(function () { L1.setAttribute('stroke', '#9db9ec'); L2.setAttribute('stroke', '#9db9ec'); }, 760);
        g.say('<b>引用类型：</b>p2 改的就是堆上那一个对象，p1 看到的当然也变了。');
      }, 'pri');
      g.btn('重置', function () {
        A.txt.textContent = '1'; B.txt.textContent = '1'; heapName.textContent = '小明';
        g.say('<b>一句话区分：</b>值类型变量里装数据本身；引用类型变量里装地址。');
      });
    }
  };

  /* =========================================================
   * 04 · 动态数组插入 / 删除
   * =======================================================*/
  D.coll = {
    t: '动态数组：插入一个元素，后面的人都要挪位置',
    d: 'List 内部就是一块连续内存。往中间插一个，后面的元素整体右移；删掉一个，后面的整体左移。装满了就申请一块两倍大的新内存。',
    n: '<b>复杂度来源：</b>按下标访问是 O(1)（算地址就行），但中间插入 / 删除是 O(n)（要挪动后面所有元素）。频繁在中间增删，就该换 <code>LinkedList</code> 或 <code>Dictionary</code>。',
    init: function (g) {
      var CAP0 = 4, W = 54;
      var arr = [3, 7, 1, 9], cap = CAP0;
      var wrap = E('div');
      wrap.style.cssText = 'padding:22px 4px 6px';
      var inner = E('div');
      inner.style.cssText = 'position:relative;overflow-x:auto;overflow-y:visible;height:96px';
      var track = E('div', 'arr');
      track.style.cssText = 'position:relative;height:76px;min-width:' + (12 * W + 10) + 'px';
      inner.appendChild(track);
      wrap.appendChild(inner);
      g.stage.appendChild(wrap);

      var capBar = E('div', 'cap');
      capBar.style.cssText = 'position:absolute;left:0;bottom:2px;height:3px;background:#e2e8f2;border-radius:2px;transition:width .3s';
      var capFill = E('div');
      capFill.style.cssText = 'position:absolute;left:0;bottom:2px;height:3px;background:#4e7cf6;border-radius:2px;transition:width .35s';
      track.appendChild(capBar); track.appendChild(capFill);

      var pCnt = g.pill('_count', arr.length);
      var pCap = g.pill('_capacity', cap);
      var pOp = g.pill('上一步', '—');

      var cellMap = [];
      function draw(hl) {
        track.querySelectorAll('.cell').forEach(function (c) { c.remove(); });
        arr.forEach(function (v, idx) {
          var c = E('div', 'cell');
          c.innerHTML = '<u>' + idx + '</u><span>' + v + '</span>';
          c.style.left = (idx * W) + 'px';
          if (hl && hl.idx === idx) c.classList.add(hl.cls);
          track.appendChild(c);
        });
        capBar.style.width = (cap * W - 4) + 'px';
        capFill.style.width = (arr.length * W - 4) + 'px';
        pCnt.set(arr.length); pCap.set(cap);
        if (hl) setTimeout(function () { draw(); }, 780);
      }

      function grow() {
        cap *= 2;
        pOp.set('扩容 ×2 → ' + cap);
        capFill.style.transition = 'width .5s';
        draw({ idx: -1, cls: '' });
      }

      g.btn('追加末尾', function () {
        if (arr.length === cap) { grow(); }
        arr.push(rint(9) + 1);
        pOp.set('Add → 末尾');
        draw({ idx: arr.length - 1, cls: 'new' });
      }, 'pri');
      g.btn('插入到中间', function () {
        var k = Math.max(1, Math.floor(arr.length / 2));
        if (arr.length === cap) grow();
        arr.splice(k, 0, rint(9) + 1);
        pOp.set('Insert(' + k + ')');
        draw({ idx: k, cls: 'new' });
      });
      g.btn('删除中间', function () {
        if (!arr.length) return;
        var k = Math.floor(arr.length / 2);
        arr.splice(k, 1);
        pOp.set('RemoveAt(' + k + ')');
        draw({ idx: k, cls: 'del' });
      });
      g.btn('删除末尾', function () {
        if (!arr.length) return;
        arr.pop();
        pOp.set('RemoveAt(末尾)');
        draw();
      });
      g.btn('重置', function () { arr = [3, 7, 1, 9]; cap = CAP0; pOp.set('—'); draw(); });
      g.sep();
      g.btn('随机装 12 个', function () {
        arr = []; cap = CAP0;
        for (var i = 0; i < 12; i++) {
          if (arr.length === cap) cap *= 2;
          arr.push(rint(9) + 1);
        }
        pOp.set('连续 Add ×12');
        draw();
      });
      draw();
    }
  };

  /* =========================================================
   * 05 · 多态：调用的是谁的方法
   * =======================================================*/
  D.poly = {
    t: '多态：同样一句 Speak()，跑的是谁的方法',
    d: '变量声明成父类 Animal，实际指向 Dog 或 Cat。调 Speak() 时不看变量类型，而是看堆上那个对象的真实类型，去它的方法表里找。',
    n: '<b>运行时决断：</b>编译期只保证 <code>Animal</code> 有 <code>Speak()</code>；真正执行哪个版本，由对象头里的<b>方法表指针</b>决定。这就是「一个接口，多种形态」。',
    init: function (g) {
      var svg = S('svg', { viewBox: '0 0 720 320' });
      g.stage.appendChild(svg);

      function node(x, y, w, h, title, sub, fill, stroke) {
        var gr = S('g', {});
        gr.appendChild(S('rect', { x: x, y: y, width: w, height: h, rx: 11, fill: fill, stroke: stroke, 'stroke-width': 1.6 }));
        var t = S('text', { x: x + w / 2, y: y + 22, fill: '#16243a', 'font-size': 13, 'font-weight': 700, 'text-anchor': 'middle' });
        t.textContent = title;
        var s = S('text', { x: x + w / 2, y: y + 40, fill: '#7b879c', 'font-size': 10.5, 'text-anchor': 'middle', 'font-family': 'monospace' });
        s.textContent = sub;
        gr.appendChild(t); gr.appendChild(s);
        svg.appendChild(gr);
        return { g: gr, rect: gr.firstChild, title: t, sub: s };
      }

      var base = node(280, 16, 160, 56, 'Animal', 'virtual Speak()', '#f5f8ff', '#9db9ec');
      var dog = node(150, 118, 150, 56, 'Dog : Animal', 'override Speak()', '#fff', '#cfd9e8');
      var cat = node(420, 118, 150, 56, 'Cat : Animal', 'override Speak()', '#fff', '#cfd9e8');

      // 继承线
      var l1 = S('path', { d: 'M 330 72 L 225 114', stroke: '#dbe3f0', 'stroke-width': 1.5, fill: 'none' });
      var l2 = S('path', { d: 'M 400 72 L 495 114', stroke: '#dbe3f0', 'stroke-width': 1.5, fill: 'none' });
      svg.appendChild(l1); svg.appendChild(l2);

      // 变量槽
      var slot = S('g', {});
      slot.appendChild(S('rect', { x: 30, y: 190, width: 190, height: 62, rx: 10, fill: '#fff', stroke: '#cfd9e8', 'stroke-width': 1.6 }));
      var slotLab = S('text', { x: 44, y: 210, fill: '#8a96a8', 'font-size': 10, 'font-family': 'monospace' });
      slotLab.textContent = '局部变量 a';
      var slotTxt = S('text', { x: 44, y: 234, fill: '#24324a', 'font-size': 12.5, 'font-weight': 700, 'font-family': 'monospace' });
      slotTxt.textContent = 'Animal a = null';
      slot.appendChild(slotLab); slot.appendChild(slotTxt);
      svg.appendChild(slot);

      // 调用按钮区（SVG 内做成可点节点）
      var callG = S('g', { cursor: 'pointer' });
      callG.appendChild(S('rect', { x: 300, y: 214, width: 130, height: 40, rx: 9, fill: '#1d2f4d' }));
      var callT = S('text', { x: 365, y: 239, fill: '#fff', 'font-size': 12.5, 'font-weight': 700, 'text-anchor': 'middle', 'font-family': 'monospace' });
      callT.textContent = 'a.Speak()';
      callG.appendChild(callT);
      svg.appendChild(callG);

      // 输出气泡
      var outG = S('g', { opacity: 0 });
      outG.appendChild(S('rect', { x: 560, y: 208, width: 130, height: 46, rx: 23, fill: '#f1fbf6', stroke: '#a9e3c9', 'stroke-width': 1.5 }));
      var outT = S('text', { x: 625, y: 236, fill: '#0f7a55', 'font-size': 14, 'font-weight': 700, 'text-anchor': 'middle' });
      outT.textContent = '汪汪！';
      outG.appendChild(outT);
      svg.appendChild(outG);

      var cur = null, busy = false;
      var pathL1 = S('path', { d: 'M 220 221 C 260 221, 250 146, 296 146', fill: 'none', stroke: '#e5484d', 'stroke-width': 2, opacity: 0 });
      var pathL2 = S('path', { d: 'M 220 221 C 300 221, 350 146, 416 146', fill: 'none', stroke: '#e5484d', 'stroke-width': 2, opacity: 0 });
      svg.appendChild(pathL1); svg.appendChild(pathL2);

      var dot = S('circle', { r: 5, fill: '#e5484d', opacity: 0 });
      svg.appendChild(dot);

      var pType = g.pill('运行时类型', '未创建');
      var pWhom = g.pill('实际执行', '—');

      function pick(which) {
        if (busy) return;
        cur = which;
        var isDog = which === 'dog';
        slotTxt.textContent = 'Animal a = new ' + (isDog ? 'Dog' : 'Cat') + '()';
        slotTxt.setAttribute('fill', '#2b6cf6');
        dog.rect.setAttribute('stroke', isDog ? '#4e7cf6' : '#cfd9e8');
        dog.rect.setAttribute('stroke-width', isDog ? 2.4 : 1.6);
        cat.rect.setAttribute('stroke', isDog ? '#cfd9e8' : '#4e7cf6');
        cat.rect.setAttribute('stroke-width', isDog ? 1.6 : 2.4);
        pType.set(isDog ? 'Dog' : 'Cat');
        pWhom.set('—');
        outG.setAttribute('opacity', 0);
        g.say('<b>变量类型没变</b>（还是 Animal），变的是它指向的<b>对象</b>。点 a.Speak() 看调用走到哪。');
      }

      function fly(path, dur, cb) {
        var len = path.getTotalLength();
        path.setAttribute('opacity', 1);
        path.setAttribute('stroke-dasharray', len);
        path.setAttribute('stroke-dashoffset', len);
        dot.setAttribute('opacity', 1);
        tween(dur, function (k) {
          path.setAttribute('stroke-dashoffset', len * (1 - k));
          var pt = path.getPointAtLength(len * k);
          dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
        });
        setTimeout(function () {
          dot.setAttribute('opacity', 0);
          path.setAttribute('opacity', 0);
          path.removeAttribute('stroke-dasharray');
          if (cb) cb();
        }, dur + 60);
      }

      function call() {
        if (busy || !cur) return;
        busy = true;
        outG.setAttribute('opacity', 0);
        fly(cur === 'dog' ? pathL1 : pathL2, 520, function () {
          outT.textContent = cur === 'dog' ? '汪汪！' : '喵～';
          outG.setAttribute('opacity', 1);
          pWhom.set(cur === 'dog' ? 'Dog.Speak' : 'Cat.Speak');
          g.say('<b>分派完成：</b>虽然写的是 <code>a.Speak()</code>，实际执行的是 <code>' + (cur === 'dog' ? 'Dog' : 'Cat') + '.Speak()</code>。加一个新子类，这句调用不用改。');
          busy = false;
        });
      }

      callG.addEventListener('click', call);
      callG.addEventListener('mouseenter', function () { callT.setAttribute('fill', '#ffd479'); });
      callG.addEventListener('mouseleave', function () { callT.setAttribute('fill', '#fff'); });

      g.btn('new Dog()', function () { pick('dog'); }, 'pri');
      g.btn('new Cat()', function () { pick('cat'); });
      g.btn('调用 a.Speak()', call);
      g.btn('重置', function () {
        cur = null; slotTxt.textContent = 'Animal a = null'; slotTxt.setAttribute('fill', '#24324a');
        pType.set('未创建'); pWhom.set('—'); outG.setAttribute('opacity', 0);
        dog.rect.setAttribute('stroke', '#cfd9e8'); cat.rect.setAttribute('stroke', '#cfd9e8');
      });
      pick('dog');
    }
  };

  /* =========================================================
   * 06 · 委托与事件广播
   * =======================================================*/
  D.dele = {
    t: '委托与事件：一次广播，按注册顺序逐个回调',
    d: '点右侧卡片可以订阅 / 退订，再点「触发事件」：脉冲沿着委托链依次点亮每个订阅者，谁先注册谁先执行。',
    n: '<b>委托就是方法列表：</b><code>+=</code> 挂上一个方法，<code>-=</code> 摘掉一个，<code>Invoke()</code> 按<b>注册顺序</b>依次调用。<code>event</code> 关键字只是把「外部不能直接 Invoke」这件事锁住。',
    init: function (g) {
      var svg = S('svg', { viewBox: '0 0 720 300' });
      g.stage.appendChild(svg);

      var src = S('g', {});
      src.appendChild(S('rect', { x: 24, y: 118, width: 150, height: 62, rx: 11, fill: '#1d2f4d' }));
      var t1 = S('text', { x: 99, y: 143, fill: '#fff', 'font-size': 12.5, 'font-weight': 700, 'text-anchor': 'middle' });
      t1.textContent = '事件源';
      var t2 = S('text', { x: 99, y: 162, fill: '#9fb4d4', 'font-size': 10, 'text-anchor': 'middle', 'font-family': 'monospace' });
      t2.textContent = 'OnGameOver';
      src.appendChild(t1); src.appendChild(t2);
      svg.appendChild(src);

      var subs = [
        { name: '保存进度', memo: 'SaveProgress()', y: 34 },
        { name: '弹出结算', memo: 'ShowResult()', y: 126 },
        { name: '上报统计', memo: 'ReportStats()', y: 218 }
      ];
      subs.forEach(function (s) {
        s.on = true;
        var gr = S('g', { cursor: 'pointer' });
        s.rect = S('rect', { x: 372, y: s.y, width: 300, height: 60, rx: 11, fill: '#fff', stroke: '#cfd9e8', 'stroke-width': 1.6 });
        gr.appendChild(s.rect);
        s.dotOn = S('circle', { cx: 392, cy: s.y + 30, r: 6, fill: '#17a673' });
        gr.appendChild(s.dotOn);
        s.nameT = S('text', { x: 410, y: s.y + 26, fill: '#16243a', 'font-size': 12.5, 'font-weight': 700 });
        s.nameT.textContent = s.name;
        s.memoT = S('text', { x: 410, y: s.y + 44, fill: '#8a96a8', 'font-size': 10, 'font-family': 'monospace' });
        s.memoT.textContent = s.memo;
        gr.appendChild(s.nameT); gr.appendChild(s.memoT);
        svg.appendChild(gr);
        s.g = gr;

        s.link = S('path', {
          d: 'M 174 149 C 260 149, 290 ' + (s.y + 30) + ', 372 ' + (s.y + 30),
          fill: 'none', stroke: '#e2e8f2', 'stroke-width': 1.8
        });
        svg.insertBefore(s.link, src);

        gr.addEventListener('click', function () {
          s.on = !s.on;
          s.rect.setAttribute('stroke', s.on ? '#cfd9e8' : '#eef1f6');
          s.g.setAttribute('opacity', s.on ? 1 : 0.45);
          s.dotOn.setAttribute('fill', s.on ? '#17a673' : '#c3cbd8');
          render();
        });
      });

      var dot = S('circle', { r: 5.5, fill: '#4e7cf6', opacity: 0 });
      svg.appendChild(dot);

      var pCnt = g.pill('订阅者', 3);
      var pOrder = g.pill('执行顺序', '—');
      var cons = E('div', 'consolebox');
      cons.style.marginTop = '10px';
      cons.innerHTML = '<div style="color:#4d6280">// 输出</div>';
      g.stage.appendChild(cons);

      function render() {
        var on = subs.filter(function (s) { return s.on; });
        pCnt.set(on.length);
        pOrder.set(on.length ? on.map(function (s) { return s.name; }).join(' → ') : '空');
      }

      var busy = false;
      function fire() {
        if (busy) return;
        var on = subs.filter(function (s) { return s.on; });
        if (!on.length) { g.say('<b>没有订阅者：</b>委托链为空，<code>Invoke()</code> 什么都不会发生（所以调用前要判空）。'); return; }
        busy = true;
        cons.innerHTML = '<div style="color:#4d6280">// 输出</div>';
        var i = 0;
        function next() {
          if (i >= on.length) {
            busy = false;
            g.say('<b>回调完成：</b>' + on.length + ' 个方法按注册顺序跑完。事件与触发方<b>互不认识</b>，加一个新订阅者不用改动事件源。');
            return;
          }
          var s = on[i++];
          var len = s.link.getTotalLength();
          s.link.setAttribute('stroke', '#4e7cf6');
          s.link.setAttribute('stroke-dasharray', len);
          s.link.setAttribute('stroke-dashoffset', len);
          dot.setAttribute('opacity', 1);
          tween(430, function (k) {
            s.link.setAttribute('stroke-dashoffset', len * (1 - k));
            var pt = s.link.getPointAtLength(len * k);
            dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
          });
          setTimeout(function () {
            dot.setAttribute('opacity', 0);
            s.rect.setAttribute('stroke', '#17a673');
            s.rect.setAttribute('fill', '#f1fbf6');
            var ln = E('div', null, s.memo + '  ✔');
            ln.style.color = '#7fe0b4';
            cons.appendChild(ln);
            cons.scrollTop = cons.scrollHeight;
            setTimeout(function () {
              s.rect.setAttribute('stroke', '#cfd9e8');
              s.rect.setAttribute('fill', '#fff');
            }, 420);
            setTimeout(next, 260);
          }, 450);
        }
        next();
      }

      g.btn('触发事件 Invoke()', fire, 'pri');
      g.btn('全部订阅', function () { subs.forEach(function (s) { if (!s.on) s.g.dispatchEvent(new Event('click')); }); });
      g.btn('全部退订', function () { subs.forEach(function (s) { if (s.on) s.g.dispatchEvent(new Event('click')); }); });
      render();
    }
  };

  /* =========================================================
   * 07 · 排序算法可视化（核心）
   * =======================================================*/
  function genBubble(a) {
    var o = [], n = a.length;
    for (var i = 0; i < n - 1; i++) {
      for (var j = 0; j < n - 1 - i; j++) {
        o.push({ t: 'cmp', i: j, j: j + 1 });
        if (a[j] > a[j + 1]) { var t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; o.push({ t: 'swap', i: j, j: j + 1 }); }
      }
      o.push({ t: 'done', i: n - 1 - i });
    }
    o.push({ t: 'done', i: 0 });
    return o;
  }
  function genSel(a) {
    var o = [], n = a.length;
    for (var i = 0; i < n - 1; i++) {
      var m = i;
      for (var j = i + 1; j < n; j++) {
        o.push({ t: 'cmp', i: j, j: m });
        if (a[j] < a[m]) m = j;
      }
      if (m !== i) { var t = a[i]; a[i] = a[m]; a[m] = t; o.push({ t: 'swap', i: i, j: m }); }
      o.push({ t: 'done', i: i });
    }
    o.push({ t: 'done', i: n - 1 });
    return o;
  }
  function genIns(a) {
    var o = [], n = a.length;
    for (var i = 1; i < n; i++) {
      var key = a[i], j = i - 1;
      while (j >= 0) {
        o.push({ t: 'cmp', i: j, j: j + 1 });
        if (a[j] > key) { a[j + 1] = a[j]; o.push({ t: 'set', i: j + 1, v: a[j] }); j--; }
        else break;
      }
      a[j + 1] = key;
      o.push({ t: 'set', i: j + 1, v: key });
    }
    for (var k = 0; k < n; k++) o.push({ t: 'done', i: k });
    return o;
  }
  function genShell(a) {
    var o = [], n = a.length;
    for (var gap = n >> 1; gap > 0; gap >>= 1) {
      for (var i = gap; i < n; i++) {
        var tmp = a[i], j = i;
        while (j >= gap) {
          o.push({ t: 'cmp', i: j - gap, j: j });
          if (a[j - gap] > tmp) { a[j] = a[j - gap]; o.push({ t: 'set', i: j, v: a[j] }); j -= gap; }
          else break;
        }
        a[j] = tmp;
        o.push({ t: 'set', i: j, v: tmp });
      }
    }
    for (var k = 0; k < n; k++) o.push({ t: 'done', i: k });
    return o;
  }
  function genQuick(a) {
    var o = [];
    function qs(lo, hi) {
      if (lo > hi) return;
      if (lo === hi) { o.push({ t: 'done', i: lo }); return; }
      var p = a[hi], i = lo;
      o.push({ t: 'pivot', i: hi });
      for (var j = lo; j < hi; j++) {
        o.push({ t: 'cmp', i: j, j: hi });
        if (a[j] < p) {
          if (i !== j) { var t = a[i]; a[i] = a[j]; a[j] = t; o.push({ t: 'swap', i: i, j: j }); }
          i++;
        }
      }
      if (i !== hi) { var t2 = a[i]; a[i] = a[hi]; a[hi] = t2; o.push({ t: 'swap', i: i, j: hi }); }
      o.push({ t: 'done', i: i });
      qs(lo, i - 1); qs(i + 1, hi);
    }
    qs(0, a.length - 1);
    return o;
  }
  function genMerge(a) {
    var o = [], n = a.length, aux = a.slice();
    function ms(lo, hi) {
      if (hi - lo < 1) return;
      var mid = (lo + hi) >> 1;
      ms(lo, mid); ms(mid + 1, hi);
      for (var k = lo; k <= hi; k++) aux[k] = a[k];
      var i = lo, j = mid + 1;
      for (var k2 = lo; k2 <= hi; k2++) {
        if (i > mid) a[k2] = aux[j++];
        else if (j > hi) a[k2] = aux[i++];
        else {
          o.push({ t: 'cmp', i: i, j: j });
          if (aux[j] < aux[i]) a[k2] = aux[j++];
          else a[k2] = aux[i++];
        }
        o.push({ t: 'set', i: k2, v: a[k2] });
      }
    }
    ms(0, n - 1);
    for (var q = 0; q < n; q++) o.push({ t: 'done', i: q });
    return o;
  }
  function genHeap(a) {
    var o = [], n = a.length;
    function sw(i, j) { var t = a[i]; a[i] = a[j]; a[j] = t; o.push({ t: 'swap', i: i, j: j }); }
    function sift(i, size) {
      for (;;) {
        var l = 2 * i + 1, r = l + 1, m = i;
        if (l < size) { o.push({ t: 'cmp', i: l, j: m }); if (a[l] > a[m]) m = l; }
        if (r < size) { o.push({ t: 'cmp', i: r, j: m }); if (a[r] > a[m]) m = r; }
        if (m === i) break;
        sw(i, m); i = m;
      }
    }
    for (var i = (n >> 1) - 1; i >= 0; i--) sift(i, n);
    for (var end = n - 1; end > 0; end--) { sw(0, end); o.push({ t: 'done', i: end }); sift(0, end); }
    o.push({ t: 'done', i: 0 });
    return o;
  }
  function genCount(a) {
    var o = [], n = a.length, cnt = new Array(101);
    for (var z = 0; z <= 100; z++) cnt[z] = 0;
    for (var i = 0; i < n; i++) { cnt[a[i]]++; o.push({ t: 'cmp', i: i, j: i }); }
    var k = 0;
    for (var v = 0; v <= 100; v++) {
      while (cnt[v] > 0) { cnt[v]--; a[k] = v; o.push({ t: 'set', i: k, v: v }); k++; }
    }
    for (var q = 0; q < n; q++) o.push({ t: 'done', i: q });
    return o;
  }

  var ALGOS = {
    bubble: { n: '冒泡', gen: genBubble, avg: 'O(n²)', space: 'O(1)', stable: '稳定', how: '相邻两两比较，大的往后冒，每一轮把最大值送到末尾。' },
    sel: { n: '选择', gen: genSel, avg: 'O(n²)', space: 'O(1)', stable: '不稳定', how: '每轮扫一遍找最小值，和当前位交换，交换次数最少（n-1 次）。' },
    ins: { n: '插入', gen: genIns, avg: 'O(n²)', space: 'O(1)', stable: '稳定', how: '像整理扑克牌：把新牌插进前面已排好的序列里。接近有序时几乎线性。' },
    shell: { n: '希尔', gen: genShell, avg: 'O(n^1.3)', space: 'O(1)', stable: '不稳定', how: '插入排序的加强版：先用大间隔把数组变「大致有序」，再缩到 1。' },
    quick: { n: '快速', gen: genQuick, avg: 'O(n log n)', space: 'O(log n)', stable: '不稳定', how: '选基准值，小于它的放左边、大于的放右边，再对两半递归。紫色是当前基准。' },
    merge: { n: '归并', gen: genMerge, avg: 'O(n log n)', space: 'O(n)', stable: '稳定', how: '先拆到只剩一个，再两两合并成有序段。稳定但要额外空间。' },
    heap: { n: '堆排', gen: genHeap, avg: 'O(n log n)', space: 'O(1)', stable: '不稳定', how: '先建成大顶堆，再反复把堆顶（最大值）换到末尾并向下调整。' },
    count: { n: '计数', gen: genCount, avg: 'O(n+k)', space: 'O(k)', stable: '稳定', how: '不比较大小，直接统计每个值出现几次，再按下标倒回数组。适合范围小的整数。' }
  };

  D.sort = {
    t: '排序算法 · 一步一步看它怎么动',
    d: '选算法 → 点播放。黄色是正在比较的两个数，红色是正在交换 / 写入，绿色是已经落位的部分，紫色是快排的基准值。',
    n: '<b>怎么看快慢：</b>把规模从 12 调到 48，看「比较次数」涨了多少 —— O(n²) 会涨约 16 倍，O(n log n) 只涨约 5 倍。这就是为什么数据一大，冒泡就废了。',
    init: function (g) {
      var W = 760, H = 300;
      var info = E('div', 'sort-info');
      var left = E('span', 'algo', '冒泡排序');
      var right = E('span', 'act', '就绪');
      info.appendChild(left); info.appendChild(right);

      var cv = E('canvas');
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = '100%'; cv.style.height = 'auto'; cv.style.display = 'block';
      var ctx = cv.getContext('2d');
      ctx.scale(dpr, dpr);

      g.stage.appendChild(info);
      g.stage.appendChild(cv);

      var cur = 'bubble', N = 24, arr = [], ops = [], ptr = 0, cmp = 0, swp = 0;
      var sortedSet = {}, hi = null, pivot = -1, swapFlash = false, playing = false;
      var raf = 0, last = 0, acc = 0, sps = 14;

      var pCmp = g.pill('比较', 0);
      var pSwp = g.pill('交换/写入', 0);
      var pProg = g.pill('进度', '0 / 0');
      var pCx = g.pill('平均复杂度', ALGOS[cur].avg, 'warm');

      function makeArr() {
        var pool = [];
        for (var i = 0; i < N; i++) pool.push(10 + Math.round(i * 82 / Math.max(1, N - 1)));
        arr = shuffle(pool);
        if (N > 10) { for (var k = 0; k < N; k++) arr[k] = Math.max(8, Math.min(99, arr[k] + rint(9) - 4)); }
      }

      function reset(keepN) {
        stop();
        if (!keepN) makeArr();
        var work = arr.slice();
        ops = ALGOS[cur].gen(work);
        ptr = 0; cmp = 0; swp = 0; sortedSet = {}; hi = null; pivot = -1; swapFlash = false;
        left.textContent = ALGOS[cur].n + '排序';
        right.textContent = '就绪 · 共 ' + ops.length + ' 步';
        pCmp.set(0); pSwp.set(0); pProg.set('0 / ' + ops.length); pCx.set(ALGOS[cur].avg);
        g.say('<b>' + ALGOS[cur].n + '排序怎么走：</b>' + ALGOS[cur].how + ' 平均 <code>' + ALGOS[cur].avg +
          '</code>，空间 <code>' + ALGOS[cur].space + '</code>，' + ALGOS[cur].stable + '。');
        draw();
      }

      function applyOp() {
        if (ptr >= ops.length) return false;
        var op = ops[ptr++];
        if (op.t === 'cmp') { hi = [op.i, op.j]; swapFlash = false; cmp++; right.textContent = '比较 a[' + op.i + '] 与 a[' + op.j + ']'; }
        else if (op.t === 'swap') {
          var t = arr[op.i]; arr[op.i] = arr[op.j]; arr[op.j] = t;
          hi = [op.i, op.j]; swapFlash = true; swp++;
          right.textContent = '交换 a[' + op.i + '] ↔ a[' + op.j + ']';
        }
        else if (op.t === 'set') { arr[op.i] = op.v; hi = [op.i, op.i]; swapFlash = true; swp++; right.textContent = '写入 a[' + op.i + '] = ' + op.v; }
        else if (op.t === 'done') { sortedSet[op.i] = true; hi = null; right.textContent = 'a[' + op.i + '] 已落位'; }
        else if (op.t === 'pivot') { pivot = op.i; right.textContent = '选基准 a[' + op.i + '] = ' + arr[op.i]; }
        pCmp.set(cmp); pSwp.set(swp); pProg.set(ptr + ' / ' + ops.length);
        return true;
      }

      function draw() {
        ctx.clearRect(0, 0, W, H);
        var n = arr.length;
        var gap = n > 32 ? 2 : (n > 20 ? 4 : 6);
        var bw = Math.max(2, (W - 30 - gap * (n - 1)) / n);
        var baseY = H - 22;
        var maxV = 100;

        ctx.strokeStyle = '#e4e8ef';
        ctx.beginPath(); ctx.moveTo(10, baseY + 0.5); ctx.lineTo(W - 12, baseY + 0.5); ctx.stroke();

        for (var i = 0; i < n; i++) {
          var h = Math.max(3, (arr[i] / maxV) * (baseY - 18));
          var x = 12 + i * (bw + gap);
          var y = baseY - h;
          var col = '#a9c3ee';
          if (arr[i] > 66) col = '#7fa5e0';
          if (pivot === i) col = '#7c5cff';
          if (sortedSet[i]) col = '#17a673';
          if (hi && (hi[0] === i || hi[1] === i)) col = swapFlash ? '#e5484d' : '#f6a02b';
          ctx.fillStyle = col;
          var r = Math.min(4, bw / 2);
          ctx.beginPath();
          if (ctx.roundRect) { ctx.roundRect(x, y, bw, h, [r, r, 0, 0]); }
          else { ctx.rect(x, y, bw, h); }
          ctx.fill();

          if (n <= 24 && bw > 12) {
            ctx.fillStyle = '#8a96a8';
            ctx.font = '9px "SF Mono",Consolas,monospace';
            ctx.textAlign = 'center';
            ctx.fillText(String(arr[i]), x + bw / 2, baseY + 13);
          }
        }
        if (hi && !swapFlash) {
          ctx.fillStyle = 'rgba(246,160,43,.10)';
          ctx.fillRect(0, 0, W, H);
        }
      }

      function loop(t) {
        if (!playing) return;
        if (!last) last = t;
        acc += (t - last) * sps / 1000;
        last = t;
        var guard = 0;
        while (acc >= 1 && guard++ < 400) {
          acc -= 1;
          if (!applyOp()) { playing = false; break; }
        }
        draw();
        if (playing) raf = requestAnimationFrame(loop);
        else finish();
      }

      function finish() {
        var allDone = true;
        for (var i = 0; i < arr.length; i++) if (!sortedSet[i]) allDone = false;
        right.textContent = allDone ? '✔ 已排好 · ' + cmp + ' 次比较 / ' + swp + ' 次移动' : '已暂停';
        playBtn.textContent = '▶ 播放'; playBtn.classList.remove('on');
        if (allDone) g.say('<b>' + ALGOS[cur].n + '排序跑完：</b>比较 ' + cmp + ' 次、移动写入 ' + swp + ' 次，共 ' + ptr + ' 步。换成 48 个数再跑一次，感受一下复杂度的差距。');
      }

      function start() {
        if (ptr >= ops.length) reset(true);
        playing = true; last = 0; acc = 0;
        playBtn.textContent = '⏸ 暂停'; playBtn.classList.add('on');
        raf = requestAnimationFrame(loop);
      }
      function stop() {
        playing = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        if (playBtn) { playBtn.textContent = '▶ 播放'; playBtn.classList.remove('on'); }
      }

      var chips = {};
      Object.keys(ALGOS).forEach(function (k) {
        var b = g.btn(ALGOS[k].n, function () {
          cur = k;
          Object.keys(chips).forEach(function (x) { chips[x].classList.toggle('on', x === k); });
          reset();
        });
        chips[k] = b;
      });
      chips.bubble.classList.add('on');
      g.sep();

      var playBtn = g.btn('▶ 播放', function () {
        if (playing) { stop(); right.textContent = '已暂停'; }
        else start();
      }, 'pri');
      g.btn('单步', function () {
        stop(); applyOp(); draw();
        if (ptr >= ops.length) finish();
      });
      g.btn('重新打乱', function () { reset(); }, 'pri');
      g.sep();
      var sizeBtns = {};
      [12, 24, 48].forEach(function (v) {
        var b = g.btn(v + ' 个', function () {
          N = v;
          Object.keys(sizeBtns).forEach(function (k) { sizeBtns[k].classList.toggle('on', +k === v); });
          reset();
        });
        sizeBtns[v] = b;
        if (v === 24) b.classList.add('on');
      });
      g.range('速度', 2, 220, sps, 1, function (v) { sps = v; });

      reset();
    }
  };

  /* =========================================================
   * 08 · 贪吃蛇（可玩）
   * =======================================================*/
  D.game = {
    t: '可玩：控制台里的贪吃蛇',
    d: '方向键 / WASD 控制，手机用下面的方向按钮。吃到一个加 10 分，撞墙或咬到自己就结束——这就是 while 循环 + 帧更新的最小模型。',
    n: '<b>游戏循环的本质：</b>每帧读输入 → 更新状态 → 重绘，三段循环。用 rAF 而不是 <code>Thread.Sleep</code>，画面才不卡；速度就是「每多少毫秒推进一格」。',
    init: function (g) {
      var CELL = 20, COLS = 26, ROWS = 17;
      var W = COLS * CELL, H = ROWS * CELL;

      var hud = E('div', 'game-hud');
      hud.innerHTML = '<span>分数 <b class="sc">0</b></span><span>最高 <b class="bs">0</b></span><span>长度 <b class="ln">3</b></span>';
      var wrap = E('div', 'game-wrap');
      var cv = E('canvas');
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = '100%'; cv.style.height = 'auto';
      var ctx = cv.getContext('2d');
      ctx.scale(dpr, dpr);

      var mask = E('div', 'game-mask');
      mask.innerHTML = '<b>点击开始</b><span>方向键 / WASD 移动</span>';
      var cvWrap = E('div');
      cvWrap.style.cssText = 'position:relative';
      cvWrap.appendChild(cv); cvWrap.appendChild(mask);
      wrap.appendChild(hud); wrap.appendChild(cvWrap);

      var dpad = E('div', 'dpad');
      dpad.innerHTML = '<button class="dz-btn up" data-d="U">↑</button>' +
        '<button class="dz-btn lf" data-d="L">←</button>' +
        '<button class="dz-btn dn" data-d="D">↓</button>' +
        '<button class="dz-btn rt" data-d="R">→</button>';
      wrap.appendChild(dpad);
      g.stage.appendChild(wrap);

      var snake, dir, nextDir, food, score, best = 0, dead, running, raf = 0, last = 0, acc = 0, speed = 132;

      function spawnFood() {
        var free = [];
        for (var y = 0; y < ROWS; y++) for (var x = 0; x < COLS; x++) {
          var hit = false;
          for (var i = 0; i < snake.length; i++) if (snake[i].x === x && snake[i].y === y) hit = true;
          if (!hit) free.push({ x: x, y: y });
        }
        food = free.length ? free[rint(free.length)] : { x: 1, y: 1 };
      }

      function reset() {
        snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }];
        dir = { x: 1, y: 0 }; nextDir = dir;
        score = 0; dead = false; running = false;
        spawnFood(); syncHud(); draw();
      }

      function syncHud() {
        hud.querySelector('.sc').textContent = score;
        hud.querySelector('.bs').textContent = best;
        hud.querySelector('.ln').textContent = snake.length;
      }

      function draw() {
        ctx.fillStyle = '#0d1a2b';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(255,255,255,.045)';
        ctx.lineWidth = 1;
        for (var x = 1; x < COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke(); }
        for (var y = 1; y < ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke(); }

        // 食物
        var fr = 5 + Math.sin(Date.now() / 260) * 1.6;
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, fr, 0, Math.PI * 2);
        ctx.fill();

        // 蛇
        for (var i = snake.length - 1; i >= 0; i--) {
          var s = snake[i];
          ctx.fillStyle = i === 0 ? '#7fe0b4' : (i % 2 ? '#3ddc97' : '#33c98a');
          var pad = i === 0 ? 2 : 2.6;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(s.x * CELL + pad, s.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, 5);
          else ctx.rect(s.x * CELL + pad, s.y * CELL + pad, CELL - pad * 2, CELL - pad * 2);
          ctx.fill();
        }
        // 眼睛
        var hd = snake[0];
        ctx.fillStyle = '#0d1a2b';
        var ex = hd.x * CELL + CELL / 2 + dir.x * 3, ey = hd.y * CELL + CELL / 2 + dir.y * 3;
        ctx.beginPath(); ctx.arc(ex - dir.y * 3, ey - dir.x * 3, 1.6, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(ex + dir.y * 3, ey + dir.x * 3, 1.6, 0, 7); ctx.fill();
      }

      function tick() {
        dir = nextDir;
        var h = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
        if (h.x < 0 || h.y < 0 || h.x >= COLS || h.y >= ROWS) return die();
        for (var i = 0; i < snake.length - 1; i++) if (snake[i].x === h.x && snake[i].y === h.y) return die();
        snake.unshift(h);
        if (h.x === food.x && h.y === food.y) {
          score += 10;
          if (score > best) best = score;
          spawnFood();
        } else snake.pop();
        syncHud();
        draw();
      }

      function die() {
        running = false;
        dead = true;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        mask.querySelector('b').textContent = '游戏结束 · ' + score + ' 分';
        mask.querySelector('span').textContent = '点击重来（长度 ' + snake.length + '）';
        mask.classList.remove('hide');
      }

      function loop(t) {
        if (!running) return;
        if (!last) last = t;
        acc += t - last; last = t;
        var guard = 0;
        while (acc >= speed && guard++ < 4) { acc -= speed; if (running) tick(); }
        if (!running) return;
        draw();
        raf = requestAnimationFrame(loop);
      }

      function go() {
        if (dead) reset();
        if (running) return;
        running = true;
        mask.classList.add('hide');
        last = 0; acc = 0;
        raf = requestAnimationFrame(loop);
      }

      function turn(d) {
        var map = { U: { x: 0, y: -1 }, D: { x: 0, y: 1 }, L: { x: -1, y: 0 }, R: { x: 1, y: 0 } };
        var v = map[d];
        if (!v) return;
        if (v.x === -dir.x && v.y === -dir.y) return;
        nextDir = v;
      }

      mask.addEventListener('click', go);
      dpad.addEventListener('click', function (e) {
        var b = e.target.closest('[data-d]');
        if (b) { turn(b.getAttribute('data-d')); go(); }
      });

      function onKey(e) {
        var k = e.key.toLowerCase();
        var map = { arrowup: 'U', w: 'U', arrowdown: 'D', s: 'D', arrowleft: 'L', a: 'L', arrowright: 'R', d: 'R' };
        if (map[k]) {
          if (running || dead) e.preventDefault();
          turn(map[k]);
          if (!running && !dead) go();
        } else if (k === ' ' && !running) { e.preventDefault(); go(); }
      }
      window.addEventListener('keydown', onKey);

      g.btn('开始 / 重来', function () { reset(); go(); }, 'pri');
      g.btn('暂停', function () {
        if (!running) return;
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        mask.querySelector('b').textContent = '已暂停';
        mask.querySelector('span').textContent = '点击继续';
        mask.classList.remove('hide');
        mask.onclick = function () { mask.onclick = null; mask.classList.add('hide'); go(); };
      });
      g.range('速度', 70, 240, speed, 10, function (v) { speed = 260 - v + 40; });
      reset();
    }
  };

  /* =========================================================
   * 09 · 单一职责拆分 / 开闭原则
   * =======================================================*/
  D.solid = {
    t: '把「上帝类」拆开：单一职责与开闭原则',
    d: '左边那一坨什么都干的 Player 类，改一个功能就得动全身。点「按职责拆分」，看它被拆成三个各管一件事的类；再点「加新功能」。',
    n: '<b>SRP：</b>一个类只该有一个引起它变化的原因。<b>OCP：</b>加新功能时应该「新增代码」而不是「修改旧代码」—— 拆开之后，加武器只需要新写一个类，原来的三个一个字都不用改。',
    init: function (g) {
      var stage = E('div');
      stage.style.cssText = 'position:relative;height:212px;font-family:var(--sans)';
      g.stage.appendChild(stage);

      var chips = [
        { k: '读键盘输入', g: 0 }, { k: '计算移动', g: 1 }, { k: '播放动画', g: 1 },
        { k: '存读档', g: 2 }, { k: '计分', g: 2 }, { k: '联网同步', g: 2 }
      ];
      var groups = [
        { name: 'PlayerInput', sub: '只管输入', x: 6, y: 26, w: 220, h: 96, color: '#eef4ff', line: '#9db9ec' },
        { name: 'PlayerMotor', sub: '只管移动表现', x: 246, y: 26, w: 220, h: 96, color: '#f6fbf8', line: '#a9e3c9' },
        { name: 'PlayerSave', sub: '只管存档数据', x: 486, y: 26, w: 228, h: 96, color: '#fffaf0', line: '#f0d9a8' }
      ];
      var big = E('div');
      big.style.cssText = 'position:absolute;left:0;top:0;width:330px;height:200px;border:1.5px solid #e5484d;border-radius:14px;background:#fff7f7;transition:.45s';
      big.innerHTML = '<div style="padding:9px 12px;font:700 12.5px/1 var(--mono);color:#b4232a">Player（600 行）</div>';
      stage.appendChild(big);

      var gEls = groups.map(function (gr) {
        var d = E('div');
        d.style.cssText = 'position:absolute;left:' + gr.x + 'px;top:' + gr.y + 'px;width:' + gr.w + 'px;height:' + gr.h +
          'px;border:1.5px solid ' + gr.line + ';border-radius:12px;background:' + gr.color +
          ';opacity:0;transform:scale(.94);transition:.42s';
        d.innerHTML = '<div style="padding:8px 11px;font:700 12px/1.5 var(--mono);color:#24324a">' + gr.name +
          '<div style="font:400 10.5px/1.4 var(--sans);color:#8a96a8">' + gr.sub + '</div></div>';
        stage.appendChild(d);
        return d;
      });

      var chipEls = chips.map(function (c, i) {
        var d = E('div');
        d.textContent = c.k;
        d.style.cssText = 'position:absolute;padding:4px 8px;border-radius:7px;background:#fff;border:1px solid #e4c9c9;' +
          'font-size:11px;color:#5a3a3a;white-space:nowrap;transition:left .45s cubic-bezier(.3,.9,.3,1),top .45s cubic-bezier(.3,.9,.3,1),border-color .4s,background .4s';
        stage.appendChild(d);
        return d;
      });

      var split = false;

      function layout() {
        if (!split) {
          big.style.opacity = 1;
          big.style.transform = 'none';
          gEls.forEach(function (el) { el.style.opacity = 0; el.style.transform = 'scale(.94)'; });
          chips.forEach(function (c, i) {
            var col = i % 2, row = Math.floor(i / 2);
            chipEls[i].style.left = (12 + col * 152) + 'px';
            chipEls[i].style.top = (40 + row * 40) + 'px';
            chipEls[i].style.borderColor = '#e4c9c9';
            chipEls[i].style.background = '#fff';
          });
        } else {
          big.style.opacity = 0;
          big.style.transform = 'scale(.97)';
          gEls.forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; });
          var cnt = [0, 0, 0];
          chips.forEach(function (c, i) {
            var gr = groups[c.g];
            var idx = cnt[c.g]++;
            chipEls[i].style.left = (gr.x + 12 + (idx % 2) * 100) + 'px';
            chipEls[i].style.top = (gr.y + 44 + Math.floor(idx / 2) * 30) + 'px';
            chipEls[i].style.borderColor = gr.line;
            chipEls[i].style.background = '#fff';
          });
        }
      }

      function addFeature() {
        if (!split) { g.say('<b>先拆分再谈扩展：</b>没拆之前，加一个武器功能要改 Player 那 600 行，还可能碰坏存档逻辑。'); return; }
        var d = E('div');
        d.style.cssText = 'position:absolute;left:246px;top:140px;width:220px;height:52px;border:1.5px dashed #7c5cff;' +
          'border-radius:12px;background:#f7f4ff;opacity:0;transform:translateY(-8px);transition:.4s';
        d.innerHTML = '<div style="padding:8px 11px;font:700 12px/1.5 var(--mono);color:#5b3ec9">Weapon（新类）' +
          '<div style="font:400 10.5px/1.4 var(--sans);color:#8a96a8">只加代码，不改旧类</div></div>';
        stage.appendChild(d);
        requestAnimationFrame(function () { d.style.opacity = 1; d.style.transform = 'none'; });
        gEls.forEach(function (el) {
          el.style.boxShadow = '0 0 0 3px rgba(23,166,115,.16)';
          setTimeout(function () { el.style.boxShadow = 'none'; }, 1100);
        });
        g.say('<b>开闭原则达成：</b>新功能 = 新类 <code>Weapon</code>，旧的三个类一行没改。修改旧代码的风险（碰坏别的功能）被彻底绕开了。');
      }

      g.btn('按职责拆分', function () {
        split = !split;
        layout();
        g.say(split ? '<b>拆完了：</b>输入、移动表现、存档数据各成一个类。以后改跳跃手感只动 PlayerMotor，不会碰到存档。'
          : '<b>回到拆分前：</b>一个类承担 6 个职责，任何改动都可能波及其他功能 —— 这就是典型的「上帝类」。');
      }, 'pri');
      g.btn('加个武器功能', addFeature, 'pri');
      g.btn('重置', function () {
        split = false; layout();
        stage.querySelectorAll('div[style*="dashed"]').forEach(function (x) { x.remove(); });
        g.say('<b>SRP：</b>一个类只该有一个引起它变化的原因。');
      });
      layout();
    }
  };

  /* =========================================================
   * 10 · 二分查找
   * =======================================================*/
  D.bs = {
    t: '二分查找：每一步砍掉一半',
    d: '点任意一个数当目标，然后单步或播放。区间每轮缩小一半，灰色是被排除掉的部分，橙色箭头是当前的 mid。',
    n: '<b>前提是「有序」：</b>只有排好序才能用大小关系一次排除一半。100 万条数据最多找 20 次（log₂1000000 ≈ 20），而顺序查找最坏要 100 万次。',
    init: function (g) {
      var arr = [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59];
      var target = arr[10];
      var steps = [], si = 0, tk = null;

      var box = E('div');
      box.style.cssText = 'position:relative;padding:34px 0 10px';
      var row = E('div');
      row.style.cssText = 'display:flex;gap:5px;justify-content:center;flex-wrap:nowrap';
      var cells = arr.map(function (v, i) {
        var c = E('div');
        c.innerHTML = '<u style="display:block;font:500 9px/1.6 var(--mono);color:#a7b2c4;text-align:center;text-decoration:none">' + i + '</u>' +
          '<span style="display:block;text-align:center;font:700 12.5px/2 var(--mono)">' + v + '</span>';
        c.style.cssText = 'flex:0 0 auto;width:42px;border:1px solid #cfd9e8;border-radius:8px;background:#fff;' +
          'transition:.3s;cursor:pointer';
        c.addEventListener('click', function () { target = v; reset(); });
        row.appendChild(c);
        return c;
      });
      box.appendChild(row);

      var rangeBar = E('div');
      rangeBar.style.cssText = 'position:absolute;left:0;top:26px;height:3px;background:#4e7cf6;border-radius:2px;transition:.35s;opacity:.9';
      box.appendChild(rangeBar);
      var arrow = E('div');
      arrow.style.cssText = 'position:absolute;top:-2px;font:700 11px/1 var(--mono);color:#f6a02b;transition:.35s;transform:translateX(-50%)';
      arrow.textContent = '▼';
      box.appendChild(arrow);
      g.stage.appendChild(box);

      var pT = g.pill('目标值', target);
      var pS = g.pill('步数', '0 / 0');
      var pC = g.pill('比较次数', 0);
      var pR = g.pill('当前区间', '0 ~ 14');

      function build() {
        steps = [];
        var lo = 0, hi = arr.length - 1, c = 0;
        while (lo <= hi) {
          var mid = (lo + hi) >> 1;
          c++;
          steps.push({ lo: lo, hi: hi, mid: mid, kind: 'mid', cmp: c, msg: 'mid = (' + lo + ' + ' + hi + ') / 2 = ' + mid + '，比较 a[' + mid + '] = ' + arr[mid] });
          if (arr[mid] === target) {
            steps.push({ lo: lo, hi: hi, mid: mid, kind: 'hit', cmp: c, msg: 'a[' + mid + '] = ' + target + '，命中！共比较 ' + c + ' 次' });
            return;
          }
          if (arr[mid] < target) {
            steps.push({ lo: lo, hi: hi, mid: mid, kind: 'right', cmp: c, msg: arr[mid] + ' < ' + target + '，目标在右半 → lo = ' + (mid + 1) });
            lo = mid + 1;
          } else {
            steps.push({ lo: lo, hi: hi, mid: mid, kind: 'left', cmp: c, msg: arr[mid] + ' > ' + target + '，目标在左半 → hi = ' + (mid - 1) });
            hi = mid - 1;
          }
          steps.push({ lo: lo, hi: hi, mid: -1, kind: 'range', cmp: c, msg: '新区间 [' + lo + ', ' + hi + ']' });
        }
        steps.push({ lo: lo, hi: hi, mid: -1, kind: 'fail', cmp: c, msg: '区间为空，未找到' });
      }

      function paint() {
        var s = steps[si];
        cells.forEach(function (c, i) {
          var inRange = i >= s.lo && i <= s.hi;
          c.style.opacity = inRange ? 1 : 0.32;
          c.style.borderColor = i === s.mid ? '#f6a02b' : (arr[i] === target ? '#4e7cf6' : '#cfd9e8');
          c.style.background = i === s.mid ? '#fff8ec' : (s.kind === 'hit' && i === s.mid ? '#f1fbf6' : '#fff');
          c.style.transform = i === s.mid ? 'translateY(-5px)' : 'none';
          c.style.boxShadow = i === s.mid ? '0 6px 14px -6px rgba(246,160,43,.6)' : 'none';
        });
        var last = arr.length - 1;
        var a1 = cells[Math.max(0, Math.min(last, s.lo))];
        var a2 = cells[Math.max(0, Math.min(last, s.hi))];
        rangeBar.style.left = a1.offsetLeft + 'px';
        rangeBar.style.width = Math.max(0, (a2.offsetLeft + a2.offsetWidth) - a1.offsetLeft) + 'px';
        rangeBar.style.opacity = s.hi >= s.lo ? 0.9 : 0;
        var mc = (s.mid >= 0 && s.mid <= last) ? cells[s.mid] : null;
        arrow.style.left = (mc ? (mc.offsetLeft + mc.offsetWidth / 2) : -100) + 'px';
        pS.set((si) + ' / ' + (steps.length - 1));
        pC.set(s.cmp);
        pR.set(s.hi >= s.lo ? s.lo + ' ~ ' + s.hi : '空');
        g.say('<b>第 ' + s.cmp + ' 次比较：</b>' + s.msg);
      }

      function reset() {
        if (tk) tk.stop();
        build(); si = 0;
        pT.set(target);
        paint();
      }

      tk = g.ticker(820, function () {
        if (si >= steps.length - 1) {
          tk.stop();
          playBtn.textContent = '▶ 播放'; playBtn.classList.remove('on');
          return;
        }
        si++; paint();
      });

      var playBtn = g.btn('▶ 播放', function () {
        if (tk.isOn()) { tk.stop(); playBtn.textContent = '▶ 播放'; playBtn.classList.remove('on'); }
        else {
          if (si >= steps.length - 1) reset();
          tk.start(); playBtn.textContent = '⏸ 暂停'; playBtn.classList.add('on');
        }
      }, 'pri');
      g.btn('单步 →', function () {
        tk.stop(); playBtn.textContent = '▶ 播放'; playBtn.classList.remove('on');
        if (si < steps.length - 1) { si++; paint(); }
      });
      g.btn('换个目标', function () { target = arr[rint(arr.length)]; reset(); });
      g.btn('重置', reset);
      reset();
    }
  };

  /* =========================================================
   * 11 · 递归调用栈
   * =======================================================*/
  D.recurse = {
    t: '递归：调用栈是怎么一层层堆起来又弹回来的',
    d: '计算 n! 时，每深入一层就压一个栈帧，直到 base case 才开始返回；返回值一路乘回来，栈帧逐个弹出。',
    n: '<b>两个必备条件：</b>① 有终止条件（<code>n == 1</code> 直接返回），② 每次递归都向终止条件靠近（<code>n - 1</code>）。缺一个就是无限递归 → <code>StackOverflowException</code>（栈溢出）。',
    init: function (g) {
      var n = 5, steps = [], si = 0, tk = null;

      var wrap = E('div');
      wrap.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start';
      var lc = E('div');
      lc.style.cssText = 'flex:1 1 300px;min-width:240px';
      var rc = E('div');
      rc.style.cssText = 'flex:0 0 200px;min-width:170px';
      wrap.appendChild(lc); wrap.appendChild(rc);
      g.stage.appendChild(wrap);

      var lab = E('div');
      lab.style.cssText = 'font-size:11px;color:#8a96a8;margin-bottom:6px';
      lab.textContent = '调用栈（越往上越深）';
      lc.appendChild(lab);
      var stack = E('div', 'frames');
      lc.appendChild(stack);

      var outLab = E('div');
      outLab.style.cssText = 'font-size:11px;color:#8a96a8;margin-bottom:6px';
      outLab.textContent = '当前返回';
      rc.appendChild(outLab);
      var outBox = E('div');
      outBox.style.cssText = 'border:1px solid #a9e3c9;background:#f4fdf9;border-radius:11px;padding:12px;text-align:center;' +
        'font:700 20px/1.4 var(--mono);color:#0f7a55;min-height:20px';
      outBox.textContent = '—';
      rc.appendChild(outBox);
      var expr = E('div');
      expr.style.cssText = 'margin-top:10px;font:500 11.5px/1.7 var(--mono);color:#6b7a92;word-break:break-all';
      rc.appendChild(expr);

      var pD = g.pill('栈深', 0);
      var pV = g.pill('返回值', '—', 'ok');
      var pS = g.pill('步', '0 / 0');

      function build() {
        steps = [];
        for (var i = n; i >= 2; i--) steps.push({ t: 'push', v: i });
        steps.push({ t: 'base', v: 1 });
        var acc = 1;
        for (var j = 2; j <= n; j++) { acc *= j; steps.push({ t: 'pop', v: j, acc: acc }); }
      }

      function paint() {
        var s = steps[si];
        var depth = 0;
        for (var k = 0; k <= si; k++) {
          if (steps[k].t === 'push' || steps[k].t === 'base') depth++;
          if (steps[k].t === 'pop') depth--;
        }
        stack.innerHTML = '';
        for (var d = 0; d < depth; d++) {
          var val = n - d;
          var f = E('div', 'frame' + (d === 0 ? '' : ''));
          f.innerHTML = 'fact(' + val + ')' + (val > 1 ? '<span style="color:#8a96a8;font-weight:400"> → 等 fact(' + (val - 1) + ')</span>' : '<span style="color:#17a673"> → return 1</span>');
          stack.appendChild(f);
        }
        if (s.t === 'base') {
          outBox.textContent = 'fact(1) = 1';
          pV.set('1');
          g.say('<b>触底：</b>n = 1 时不再往下调，直接返回 1。这一层是递归的「终止条件」，没有它会一直压栈直到溢出。');
        } else if (s.t === 'pop') {
          outBox.textContent = 'fact(' + s.v + ') = ' + s.acc;
          pV.set(s.acc);
          g.say('<b>弹栈相乘：</b>fact(' + s.v + ') = ' + s.v + ' × fact(' + (s.v - 1) + ') = ' + s.acc + '，返回给上一层。');
        } else {
          outBox.textContent = 'fact(' + s.v + ') 等待…';
          g.say('<b>压栈：</b>要算 fact(' + s.v + ')，必须先算 fact(' + (s.v - 1) + ')，于是把这一层挂起压进栈，继续往下。');
        }
        var chain = [];
        for (var q = n; q >= 1; q--) chain.push(q);
        expr.textContent = n + '! = ' + chain.join(' × ') + (s.t === 'pop' || s.t === 'base' ? ' = ' + (s.acc || 1) : '');
        pD.set(depth);
        pS.set(si + ' / ' + (steps.length - 1));
      }

      function reset() {
        if (tk) tk.stop();
        build(); si = 0;
        paint();
        playBtn.textContent = '▶ 播放'; playBtn.classList.remove('on');
      }

      tk = g.ticker(760, function () {
        if (si >= steps.length - 1) { tk.stop(); playBtn.textContent = '▶ 播放'; playBtn.classList.remove('on'); return; }
        si++; paint();
      });

      var playBtn = g.btn('▶ 播放', function () {
        if (tk.isOn()) { tk.stop(); playBtn.textContent = '▶ 播放'; playBtn.classList.remove('on'); }
        else { if (si >= steps.length - 1) reset(); tk.start(); playBtn.textContent = '⏸ 暂停'; playBtn.classList.add('on'); }
      }, 'pri');
      g.btn('单步 →', function () { tk.stop(); playBtn.textContent = '▶ 播放'; playBtn.classList.remove('on'); if (si < steps.length - 1) { si++; paint(); } });
      g.btn('n −', function () { if (n > 3) { n--; reset(); } });
      g.btn('n ＋', function () { if (n < 8) { n++; reset(); } });
      g.btn('重置', reset);
      reset();
    }
  };

  /* =========================================================
   * 12 · 关键字记忆卡
   * =======================================================*/
  D.vocab = {
    t: '关键字记忆卡：翻一张记一张',
    d: '点卡片翻到中文释义，再点一次翻回来。先自己猜，再翻——比直接读一遍记得牢。',
    n: '<b>为什么这些词重要：</b>关键字不是要背，是要在看到 <code>sealed</code>、<code>virtual</code>、<code>override</code> 时立刻想到它们之间的关系（密封 / 可重写 / 重写），这样读别人的代码才不用逐行查。',
    init: function (g, host) {
      var pairs = [];
      try { pairs = JSON.parse(host.getAttribute('data-pairs') || '[]'); } catch (e) { pairs = []; }
      if (!pairs.length) { g.stage.textContent = '无词条'; return; }

      var grid = E('div');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:8px';
      g.stage.appendChild(grid);

      var flipped = {};
      var cards = pairs.map(function (p, i) {
        var c = E('div');
        c.style.cssText = 'cursor:pointer;border:1px solid #dbe3f0;border-radius:10px;background:#fff;padding:9px 10px;' +
          'min-height:56px;display:flex;flex-direction:column;justify-content:center;transition:.22s;user-select:none';
        c.innerHTML = '<b style="font:700 12.5px/1.4 var(--mono);color:#2b6cf6">' + p[0] + '</b>' +
          '<span style="font-size:11px;color:#b3bdcb;margin-top:2px">点开看释义</span>';
        c.addEventListener('click', function () {
          flipped[i] = !flipped[i];
          if (flipped[i]) {
            c.style.background = '#f5f9ff';
            c.style.borderColor = '#9db9ec';
            c.innerHTML = '<b style="font:700 12.5px/1.4 var(--mono);color:#8a96a8">' + p[0] + '</b>' +
              '<span style="font-size:12px;color:#1b2430;margin-top:3px">' + p[1] + '</span>';
          } else {
            c.style.background = '#fff';
            c.style.borderColor = '#dbe3f0';
            c.innerHTML = '<b style="font:700 12.5px/1.4 var(--mono);color:#2b6cf6">' + p[0] + '</b>' +
              '<span style="font-size:11px;color:#b3bdcb;margin-top:2px">点开看释义</span>';
          }
          var k = 0;
          for (var x in flipped) if (flipped[x]) k++;
          pF.set(k + ' / ' + pairs.length);
        });
        grid.appendChild(c);
        return c;
      });

      var pF = g.pill('已翻', '0 / ' + pairs.length);
      g.btn('全部翻开', function () { cards.forEach(function (c, i) { if (!flipped[i]) c.click(); }); });
      g.btn('全部合上', function () { cards.forEach(function (c, i) { if (flipped[i]) c.click(); }); });
      g.btn('随机抽查', function () {
        var i = rint(pairs.length);
        cards.forEach(function (c, k) { if (flipped[k]) c.click(); });
        g.say('<b>考考你：</b><code>' + pairs[i][0] + '</code> 是什么意思？想好了再往下翻卡片。');
        cards[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }, 'pri');
      g.btn('打乱顺序', function () {
        var order = shuffle(pairs.map(function (_, i) { return i; }));
        for (var i = 0; i < order.length; i++) grid.appendChild(cards[order[i]]);
      });
    }
  };

  /* =========================================================
   * 13 · 完整写法 ↔ 语法糖
   * =======================================================*/
  D.short = {
    t: '语法糖拆解：一行写法背后的完整代码',
    d: '点「切到简写」看 C# 允许的省略形式；看不懂某一行时，切回完整写法人就明白了。',
    n: '<b>语法糖不是魔法：</b>表达式体 <code>=></code>、自动属性、<code>?.</code>、<code>??</code> 都只是编译器帮你补全的写法，编译后与完整写法等价（自动属性会生成隐藏的私有字段）。',
    init: function (g) {
      var CASES = [
        { t: '表达式体方法', full: 'public int Sum(int a, int b)\n{\n    return a + b;\n}', short: 'public int Sum(int a, int b) => a + b;' },
        { t: '只读属性', full: 'public int Instance\n{\n    get { return instance; }\n}', short: 'public static T Instance => instance;' },
        { t: '可读写属性（自动）', full: 'private int hp;\npublic int Hp\n{\n    get { return hp; }\n    set { hp = value; }\n}', short: 'public int Hp { get; set; }' },
        { t: '空判断', full: 'if (obj != null)\n    obj.DoSomething();', short: 'obj?.DoSomething();' },
        { t: '默认值兜底', full: 'string s = name;\nif (s == null) s = "无名";', short: 'string s = name ?? "无名";' }
      ];
      var mode = 'both';

      var list = E('div');
      list.style.cssText = 'display:flex;flex-direction:column;gap:10px';
      g.stage.appendChild(list);

      var nodes = CASES.map(function (c) {
        var row = E('div');
        row.style.cssText = 'display:flex;gap:10px;align-items:stretch;flex-wrap:wrap';
        var a = E('pre');
        a.style.cssText = 'flex:1 1 240px;margin:0;background:#0f1826;color:#d7e2f1;border-radius:9px;padding:9px 11px;' +
          'font:500 11.5px/1.7 var(--mono);overflow:auto;white-space:pre';
        a.textContent = c.full;
        var mid = E('div');
        mid.style.cssText = 'flex:0 0 auto;display:flex;align-items:center;font-size:16px;color:#9db9ec';
        mid.textContent = '➜';
        var b = E('pre');
        b.style.cssText = 'flex:1 1 200px;margin:0;background:#101a12;color:#b5e8a0;border:1px solid #1f3a26;border-radius:9px;' +
          'padding:9px 11px;font:500 11.5px/1.7 var(--mono);overflow:auto;white-space:pre';
        b.textContent = c.short;
        var tag = E('div');
        tag.textContent = c.t;
        tag.style.cssText = 'flex:0 0 100%;font-size:11px;color:#8a96a8;margin-bottom:-4px';
        row.appendChild(tag); row.appendChild(a); row.appendChild(mid); row.appendChild(b);
        list.appendChild(row);
        return { a: a, mid: mid, b: b };
      });

      function apply() {
        nodes.forEach(function (nd) {
          nd.a.style.display = mode === 'short' ? 'none' : 'block';
          nd.mid.style.display = mode === 'both' ? 'block' : 'none';
          nd.b.style.flex = mode === 'short' ? '1 1 100%' : '1 1 200px';
        });
      }

      g.btn('完整 + 简写对照', function () { mode = 'both'; apply(); }, 'pri on');
      g.btn('只看简写', function () { mode = 'short'; apply(); });
      g.sep();
      g.btn('展开全部完整写法', function () { mode = 'both'; apply(); });
      apply();
    }
  };



  function boot() {
    var nodes = document.querySelectorAll('[data-demo]');
    for (var i = 0; i < nodes.length; i++) {
      mount(nodes[i], nodes[i].getAttribute('data-demo'));
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.CSDEMO = { mount: mount, list: D };
})();
