/* ================= 交互图形引擎 v2 =================
   mind 思维导图 / flow 流程图 / vec 向量画布 / curve 曲线
   trig 三角曲线 / tbl 表格 / axes3d 三维坐标轴 / calc 叉乘公式
   所有图：节点可拖、画布可平移、滚轮可缩放，并可切回原图
*/
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var FONT = 12.5, LH = 17, PADX = 9, PADY = 6, GAPX = 46, GAPY = 11;

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function div(cls, parent) {
    var d = document.createElement('div');
    d.className = cls;
    if (parent) parent.appendChild(d);
    return d;
  }
  function measureS(s, fs) {
    var w = 0, k = fs / FONT;
    for (var i = 0; i < s.length; i++) w += (s.charCodeAt(i) > 255 ? 1 : 0.56);
    return w * FONT * k;
  }
  function measure(s) { return measureS(s, FONT); }
  function wrapS(text, maxW, fs) {
    var lines = [], cur = '', w = 0, u = FONT * (fs / FONT);
    text = String(text == null ? '' : text);
    for (var i = 0; i < text.length; i++) {
      var ch = text[i], cw = (ch.charCodeAt(0) > 255 ? 1 : 0.56) * u;
      if (w + cw > maxW && cur.length) { lines.push(cur); cur = ch; w = cw; }
      else { cur += ch; w += cw; }
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [''];
  }
  function wrap(text, maxW) {
    var lines = [], cur = '', w = 0;
    text = String(text == null ? '' : text);
    for (var i = 0; i < text.length; i++) {
      var ch = text[i], cw = (ch.charCodeAt(0) > 255 ? 1 : 0.55) * FONT;
      if (w + cw > maxW && cur.length) { lines.push(cur); cur = ch; w = cw; }
      else { cur += ch; w += cw; }
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [''];
  }
  /* p = 该刻度是 π/2 的多少倍，用于画 π 刻度标签 */
  function pifrac(p) {
    if (!p) return '0';
    var sign = p < 0 ? '−' : '', a = Math.abs(p);
    if (a % 2 === 0) { var k = a / 2; return sign + (k === 1 ? '' : k) + 'π'; }
    return sign + (a === 1 ? '' : a) + 'π/2';
  }
  function tx(parent, s, attrs) {
    var t = el('text', attrs || {}, parent);
    t.textContent = s;
    return t;
  }

  /* ============ 通用：平移缩放外壳 ============ */
  function Shell(svg, gRoot, st, onMove) {
    var ptr = null, moved = false;
    svg.addEventListener('pointerdown', function (e) {
      if (e.target.closest && e.target.closest('.dg-node')) return;
      ptr = { x: e.clientX, y: e.clientY, tx: st.tx, ty: st.ty };
      moved = false;
    });
    window.addEventListener('pointermove', function (e) {
      if (!ptr) return;
      var dx = e.clientX - ptr.x, dy = e.clientY - ptr.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
      st.tx = ptr.tx + dx; st.ty = ptr.ty + dy;
      apply();
    });
    window.addEventListener('pointerup', function () { ptr = null; });
    function apply() {
      gRoot.setAttribute('transform', 'translate(' + st.tx + ',' + st.ty + ') scale(' + st.scale + ')');
    }
    svg.addEventListener('wheel', function (e) {
      e.preventDefault();
      var r = svg.getBoundingClientRect();
      var mx = (e.clientX - r.left) * ((svg.viewBox.baseVal.width || r.width) / r.width);
      var my = (e.clientY - r.top) * ((svg.viewBox.baseVal.height || r.height) / r.height);
      var k = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      var ns = Math.min(3, Math.max(0.3, st.scale * k));
      st.tx = mx - (mx - st.tx) * (ns / st.scale);
      st.ty = my - (my - st.ty) * (ns / st.scale);
      st.scale = ns;
      apply();
    }, { passive: false });
    return { apply: apply };
  }

  /* 通用拖动：把 move/up 挂到 window，
     这样即使拖动过程中重绘（替换 DOM）也不会丢失后续事件 */
  function dragify(target, onStart, onMove, onEnd) {
    target.addEventListener('pointerdown', function (e) {
      var st = onStart(e);
      if (st === false) return;
      e.preventDefault();
      e.stopPropagation();
      function mv(ev) { onMove(ev, st); }
      function up(ev) {
        window.removeEventListener('pointermove', mv);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        if (onEnd) onEnd(ev, st);
      }
      window.addEventListener('pointermove', mv);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    });
  }

  /* ============ 思维导图 ============ */
  function Mind(root, data, opt) {
    opt = opt || {};
    var maxW = opt.maxW || 150, H = opt.h || 480, W = opt.w || 760;
    var svg = el('svg', { class: 'dg-svg', viewBox: '0 0 ' + W + ' ' + H, height: H });
    root.appendChild(svg);
    var gRoot = el('g', {}, svg);
    var st = { scale: 1, tx: 0, ty: 0 }, dragNode = null;

    function prep(n, depth) {
      var fs = depth === 0 ? 13.5 : 12.5;
      n._lines = wrapS(n.t || '', depth === 0 ? maxW + 46 : maxW, fs);
      n._w = Math.max.apply(null, n._lines.map(function (l) { return measureS(l, fs); })) + PADX * 2 + 4;
      n._h = n._lines.length * LH + PADY * 2;
      n._d = depth;
      n.ox = n.ox || 0; n.oy = n.oy || 0;
      (n.c || []).forEach(function (k) { prep(k, depth + 1); });
    }

    function sub(n) {
      if (n.collapsed || !(n.c || []).length) { n._sub = n._h; return n._h; }
      var t = 0;
      n.c.forEach(function (k) { t += sub(k) + GAPY; });
      n._sub = Math.max(t - GAPY, n._h);
      return n._sub;
    }

    /* 子节点跟随父节点偏移，拖动父节点时整枝一起走 */
    function place(n, x, yTop) {
      n._x = x + n.ox;
      var kids = n.c || [];
      if (n.collapsed || !kids.length) { n._y = yTop + n.oy; n._sub = n._h; return; }
      var yy = yTop + n.oy, tot = 0;
      kids.forEach(function (k) {
        place(k, n._x + n._w + GAPX, yy);
        yy += k._sub + GAPY; tot += k._sub + GAPY;
      });
      tot -= GAPY;
      n._sub = Math.max(tot, n._h);
      n._y = yTop + (tot - n._h) / 2 + n.oy;
    }

    function draw() {
      while (gRoot.firstChild) gRoot.removeChild(gRoot.firstChild);
      shell.apply();

      (function links(n) {
        if (n.collapsed) return;
        (n.c || []).forEach(function (k) {
          var x1 = n._x + n._w, y1 = n._y + n._h / 2;
          var x2 = k._x, y2 = k._y + k._h / 2, mx = (x1 + x2) / 2;
          el('path', {
            d: 'M' + x1 + ',' + y1 + ' C' + mx + ',' + y1 + ' ' + mx + ',' + y2 + ' ' + x2 + ',' + y2,
            fill: 'none', stroke: k._d === 1 ? '#b9cdf0' : '#d5e0f2',
            'stroke-width': k._d === 1 ? 1.7 : 1.2
          }, gRoot);
          links(k);
        });
      })(data);

      (function nodes(n) {
        var g = el('g', { class: 'dg-node' + (dragNode === n ? ' dragging' : ''), 'data-d': n._d }, gRoot);
        var fill = n._d === 0 ? '#2b6cf6' : n._d === 1 ? '#eaf1ff' : '#ffffff';
        var stroke = n._d === 0 ? '#2b6cf6' : n._d === 1 ? '#c3d7f8' : '#e0e7f1';
        var color = n._d === 0 ? '#fff' : n._d === 1 ? '#1d3f7d' : '#3a465a';
        el('rect', { x: n._x, y: n._y, width: n._w, height: n._h, rx: 7, fill: fill, stroke: stroke, 'stroke-width': 1 }, g);
        n._lines.forEach(function (ln, i) {
          tx(g, ln, {
            x: n._x + PADX, y: n._y + PADY + LH * (i + 0.78),
            'font-size': n._d === 0 ? 13.5 : 12.5, fill: color, 'font-weight': n._d <= 1 ? 600 : 400
          });
        });
        if (n.c && n.c.length) {
          var cc = el('circle', {
            cx: n._x + n._w, cy: n._y + n._h / 2, r: 6.5, fill: '#fff',
            stroke: n.collapsed ? '#2b6cf6' : '#9fb4d4', 'stroke-width': 1.4, class: 'dg-toggle'
          }, g);
          tx(g, n.collapsed ? '+' : '−', {
            x: n._x + n._w, y: n._y + n._h / 2 + 3.6, 'text-anchor': 'middle',
            'font-size': 10, fill: n.collapsed ? '#2b6cf6' : '#7b879c', 'pointer-events': 'none'
          });
          cc.addEventListener('click', function (e) {
            e.stopPropagation();
            n.collapsed = !n.collapsed;
            relayout();
          });
        }
        if (n.n) tx(g, n.n, { x: n._x + PADX, y: n._y + n._h + 12.5, 'font-size': 10.5, fill: '#8b98ad' });

        dragify(g, function (e) {
          if (e.target.classList && e.target.classList.contains('dg-toggle')) return false;
          dragNode = n;
          return { x: e.clientX, y: e.clientY, ox: n.ox, oy: n.oy };
        }, function (e, d) {
          n.ox = d.ox + (e.clientX - d.x) / st.scale;
          n.oy = d.oy + (e.clientY - d.y) / st.scale;
          relayout(true);
        }, function () { dragNode = null; relayout(true); });

        if (!n.collapsed) (n.c || []).forEach(nodes);
      })(data);
    }

    function bbox() {
      var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      (function walk(n) {
        x0 = Math.min(x0, n._x); y0 = Math.min(y0, n._y);
        x1 = Math.max(x1, n._x + n._w); y1 = Math.max(y1, n._y + n._h);
        if (!n.collapsed) (n.c || []).forEach(walk);
      })(data);
      return { x0: x0, y0: y0, x1: x1, y1: y1 };
    }

    var W = 760;
    function fit() {
      var b = bbox();
      var needW = Math.ceil(b.x1 - b.x0) + 46, needH = Math.ceil(b.y1 - b.y0) + 40;
      /* 内容更大时把画布也放大，避免被压成蚂蚁字 */
      if (needW > W) W = Math.min(needW, 1500);
      if (needH > H) H = Math.min(needH, 980);
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('height', H);
      var s = Math.min((W - 26) / Math.max(1, b.x1 - b.x0), (H - 26) / Math.max(1, b.y1 - b.y0), 1.12);
      st.scale = Math.max(0.26, s);
      st.tx = (W - (b.x1 - b.x0) * st.scale) / 2 - b.x0 * st.scale;
      st.ty = (H - (b.y1 - b.y0) * st.scale) / 2 - b.y0 * st.scale;
      draw();
    }

    var shell = Shell(svg, gRoot, st);
    function relayout(light) {
      sub(data); place(data, 0, 0);
      if (light) draw(); else { draw(); fit(); }
    }
    prep(data, 0);
    relayout();

    return {
      fit: fit,
      expandAll: function () { (function w(n) { n.collapsed = false; (n.c || []).forEach(w); })(data); relayout(); },
      collapseTo: function (d) {
        (function w(n) { n.collapsed = n._d >= d && !!(n.c && n.c.length); (n.c || []).forEach(w); })(data);
        relayout();
      },
      resetDrag: function () { (function w(n) { n.ox = 0; n.oy = 0; (n.c || []).forEach(w); })(data); relayout(); }
    };
  }

  /* ============ 流程图 ============ */
  function Flow(root, data, opt) {
    opt = opt || {};
    var map = {}, nodes = [], H = opt.h || 440, W = 760;

    (function prepare() {
      nodes = data.nodes.map(function (n) {
        n._lines = wrap(n.t, 128);
        n._w = Math.max.apply(null, n._lines.map(measure)) + PADX * 2 + 8;
        n._h = n._lines.length * LH + PADY * 2 + 6;
        n._ox = n._ox || 0; n._oy = n._oy || 0;
        map[n.id] = n;
        return n;
      });
      var lvMax = 0, hMax = 0;
      nodes.forEach(function (n) { lvMax = Math.max(lvMax, n.lv); hMax = Math.max(hMax, n._h); });
      var gap = 72;
      var byLv = {};
      nodes.forEach(function (n) { (byLv[n.lv] = byLv[n.lv] || []).push(n); });
      var lvs = Object.keys(byLv).map(Number).sort(function (a, b) { return a - b; });
      var totals = lvs.map(function (lv) {
        var row = byLv[lv];
        return row.reduce(function (s, n) { return s + n._w; }, 0) + (row.length - 1) * 26;
      });
      W = Math.max(opt.w || 430, Math.max.apply(null, totals) + 176);
      lvs.forEach(function (lv, i) {
        var row = byLv[lv], x = (W - totals[i]) / 2;
        row.forEach(function (n) { n._x0 = x; n._y0 = 30 + lv * gap; x += n._w + 26; });
      });
      H = Math.max(opt.h || 0, 30 + lvMax * gap + hMax + 46);
    })();

    var svg = el('svg', { class: 'dg-svg', viewBox: '0 0 ' + W + ' ' + H, height: H });
    if (W < 700) svg.style.maxWidth = Math.round(W * 1.15) + 'px';
    root.appendChild(svg);
    var gRoot = el('g', {}, svg);
    var st = { scale: 1, tx: 0, ty: 0 };

    var defs = el('defs', {}, svg);
    var mk = el('marker', { id: 'dg-arrow', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: '#b9cdf0' }, mk);

    function draw() {
      while (gRoot.firstChild) gRoot.removeChild(gRoot.firstChild);
      shell.apply();
      nodes.forEach(function (n) { n._x = n._x0 + n._ox; n._y = n._y0 + n._oy; });

      (data.edges || []).forEach(function (e) {
        var a = map[e[0]], b = map[e[1]];
        if (!a || !b) return;
        var back = e[3] || b.lv <= a.lv, d, lx, ly;
        if (back) {
          var ax = a._x + a._w, ay = a._y + a._h / 2;
          var bx = b._x + b._w, by = b._y + b._h / 2;
          var rx = Math.max(ax, bx) + (e[4] || 40);
          d = 'M' + ax + ',' + ay + ' C' + rx + ',' + ay + ' ' + rx + ',' + by + ' ' + bx + ',' + by;
          lx = 0.125 * ax + 0.75 * rx + 0.125 * bx + 7;
          ly = 0.5 * ay + 0.5 * by + 4;
        } else {
          var x1 = a._x + a._w / 2, y1 = a._y + a._h, x2 = b._x + b._w / 2, y2 = b._y;
          var my = (y1 + y2) / 2;
          d = 'M' + x1 + ',' + y1 + ' C' + x1 + ',' + my + ' ' + x2 + ',' + my + ' ' + x2 + ',' + y2;
          lx = (x1 + x2) / 2 + 6; ly = my + 4;
        }
        el('path', {
          d: d, fill: 'none', stroke: back ? '#9fc0e8' : '#c2d3ee',
          'stroke-width': 1.6, 'marker-end': 'url(#dg-arrow)'
        }, gRoot);
        if (e[2]) tx(gRoot, e[2], { x: lx, y: ly, 'font-size': 10.5, fill: '#6b7788', stroke: '#fff', 'stroke-width': 3.2, 'paint-order': 'stroke' });
      });

      nodes.forEach(function (n) {
        var g = el('g', { class: 'dg-node', 'data-id': n.id }, gRoot);
        var k = n.k || 'step';
        var fill = k === 'start' ? '#e8f7f0' : k === 'end' ? '#fdeeee' : k === 'dec' ? '#fff8e8' : '#f5f8ff';
        var stroke = k === 'start' ? '#8fd4b6' : k === 'end' ? '#f0b4b4' : k === 'dec' ? '#e9cf92' : '#cfdcf2';
        el('rect', { x: n._x, y: n._y, width: n._w, height: n._h, rx: k === 'dec' ? 3 : 8, fill: fill, stroke: stroke, 'stroke-width': 1.2 }, g);
        n._lines.forEach(function (ln, i) {
          tx(g, ln, {
            x: n._x + n._w / 2, y: n._y + PADY + LH * (i + 0.85),
            'font-size': 12.5, 'text-anchor': 'middle', fill: '#2b3648', 'font-weight': 600
          });
        });
        dragify(g, function (e) {
          return { x: e.clientX, y: e.clientY, ox: n._ox, oy: n._oy };
        }, function (e, d) {
          n._ox = d.ox + (e.clientX - d.x) / st.scale;
          n._oy = d.oy + (e.clientY - d.y) / st.scale;
          draw();
        });
      });
    }

    var shell = Shell(svg, gRoot, st);
    draw();
    return {
      fit: function () { st.tx = 0; st.ty = 0; st.scale = 1; draw(); },
      expandAll: function () { }, collapseTo: function () { },
      resetDrag: function () { nodes.forEach(function (n) { n._ox = 0; n._oy = 0; }); draw(); }
    };
  }

  /* ============ 二维向量画布 ============ */
  function Vec(root, data, opt) {
    opt = opt || {};
    var W = 760, H = opt.h || 420;
    var svg = el('svg', { class: 'dg-svg', viewBox: '0 0 ' + W + ' ' + H, height: H });
    root.appendChild(svg);
    var info = div('dg-vecinfo', root);
    var g = el('g', {}, svg);
    var defs = el('defs', {}, svg);
    var PAL = ['#2b6cf6', '#e8663d', '#17a673', '#a855f7', '#8b98ad'];

    ['X', 'Y', 'Z'].forEach(function (ax, i) {
      var m = el('marker', { id: 'va' + i, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6.5, markerHeight: 6.5, orient: 'auto-start-reverse' }, defs);
      el('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: PAL[i] }, m);
    });

    var items = (data.items || []).map(function (o, i) {
      return Object.assign({}, o, { c: o.c || PAL[i % PAL.length] });
    });

    /* 世界 → 屏幕（原点可指定） */
    /* 按内容范围自动定标尺，避免图形缩在角落 */
    var mx = 1, my = 1;
    items.forEach(function (it) {
      var xs = it.k === 'seg' ? [it.from[0], it.to[0]] : [it.x];
      var ys = it.k === 'seg' ? [it.from[1], it.to[1]] : [it.y];
      xs.forEach(function (v) { mx = Math.max(mx, Math.abs(v)); });
      ys.forEach(function (v) { my = Math.max(my, Math.abs(v)); });
    });
    var unit = opt.unit || Math.max(22, Math.min(72, Math.min((W * 0.42) / mx, (H * 0.4) / my)));
    var ox = data.origin ? data.origin[0] : (opt.cx || W / 2);
    var oy = data.origin ? data.origin[1] : (H / 2);
    function S(x, y) { return [ox + x * unit, oy - y * unit]; }

    function vecOf(it) { return it.k === 'vec'; }
    function tip(it) {
      if (it.k === 'vec') return [it.x, it.y];
      return it.to;
    }

    function draw() {
      while (g.firstChild) g.removeChild(g.firstChild);
      for (var i = -9; i <= 9; i++) {
        var a = S(i, -8), b = S(i, 8);
        el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: i === 0 ? '#c6d0de' : '#eff2f7', 'stroke-width': i === 0 ? 1.3 : 1 }, g);
        var c2 = S(-9, i), d2 = S(9, i);
        el('line', { x1: c2[0], y1: c2[1], x2: d2[0], y2: d2[1], stroke: i === 0 ? '#c6d0de' : '#eff2f7', 'stroke-width': i === 0 ? 1.3 : 1 }, g);
      }

      items.forEach(function (it, idx) {
        var mk = 'url(#va' + (idx % 3) + ')';
        if (it.k === 'vec') {
          var p = S(it.x, it.y);
          el('line', { x1: ox, y1: oy, x2: p[0], y2: p[1], stroke: it.c, 'stroke-width': 2.6, 'stroke-dasharray': it.dash ? '6 4' : '', 'marker-end': it.dash ? '' : mk }, g);
          tx(g, it.n, { x: p[0] + 8, y: p[1] - 7, 'font-size': 12, fill: it.c, 'font-weight': 700 });
          handle(p, it);
        } else if (it.k === 'pt') {
          var q = S(it.x, it.y);
          el('circle', { cx: q[0], cy: q[1], r: 4.5, fill: it.c, stroke: '#fff', 'stroke-width': 1.5 }, g);
          tx(g, it.n, { x: q[0] - 4, y: q[1] + 17, 'font-size': 11.5, fill: '#5c687c', 'font-weight': 600 });
          handle(q, it);
        } else if (it.k === 'seg') {
          var s0 = S(it.from[0], it.from[1]), s1 = S(it.to[0], it.to[1]);
          el('line', { x1: s0[0], y1: s0[1], x2: s1[0], y2: s1[1], stroke: it.c, 'stroke-width': 2.6, 'marker-end': it.dash ? '' : mk }, g);
          tx(g, it.n, { x: (s0[0] + s1[0]) / 2 + 6, y: (s0[1] + s1[1]) / 2 - 6, 'font-size': 11.5, fill: it.c, 'font-weight': 700 });
        }
      });
      metrics();
    }

    function handle(p, it) {
      var h = el('circle', { cx: p[0], cy: p[1], r: 7.5, fill: '#fff', stroke: it.c, 'stroke-width': 2, class: 'dg-handle' }, g);
      dragify(h, function () { return 1; }, function (e) {
        var r = svg.getBoundingClientRect();
        var sx = (e.clientX - r.left) * (W / r.width), sy = (e.clientY - r.top) * (H / r.height);
        var wx = Math.round(((sx - ox) / unit) * 4) / 4;
        var wy = Math.round(((oy - sy) / unit) * 4) / 4;
        if (it.k === 'vec' || it.k === 'pt') { it.x = wx; it.y = wy; }
        else { it.to = [wx, wy]; }
        draw();
      });
    }

    function find(n) {
      for (var i = 0; i < items.length; i++) if (items[i].n === n) return items[i];
      return null;
    }

    function metrics() {
      var rows = [];
      var A = find('A') || find('a'), B = find('B') || find('b');
      function xy(o) { return o && o.k === 'vec' ? [o.x, o.y] : o ? [o.x, o.y] : null; }
      var pa = xy(A), pb = xy(B);
      items.forEach(function (it) {
        if (it.k === 'vec') rows.push('<span class="k">' + it.n + '</span>(' + it.x + ', ' + it.y + ')　<span class="k">|' + it.n + '|</span>=' + Math.hypot(it.x, it.y).toFixed(2));
      });
      if (pa && pb) {
        var isVec = A && A.k === 'vec' && B && B.k === 'vec';
        if (isVec) {
          var dot = pa[0] * pb[0] + pa[1] * pb[1];
          var la = Math.hypot(pa[0], pa[1]), lb = Math.hypot(pb[0], pb[1]);
          var deg = la && lb ? Math.acos(Math.max(-1, Math.min(1, dot / (la * lb)))) * 180 / Math.PI : 0;
          rows.push('<span class="k">A·B</span>=' + dot.toFixed(2) + '　<span class="k">夹角</span>=' + deg.toFixed(1) + '°');
          rows.push('<span class="k">A+B</span>=(' + (pa[0] + pb[0]).toFixed(2) + ', ' + (pa[1] + pb[1]).toFixed(2) + ')　<span class="k">A−B</span>=(' + (pa[0] - pb[0]).toFixed(2) + ', ' + (pa[1] - pb[1]).toFixed(2) + ')');
          var cz = pa[0] * pb[1] - pa[1] * pb[0];
          rows.push('<span class="k">A×B</span> z=' + cz.toFixed(2) + '（' + (cz > 0 ? 'B 在 A 左侧' : cz < 0 ? 'B 在 A 右侧' : '共线') + '）');
        } else {
          var dx = pb[0] - pa[0], dy = pb[1] - pa[1];
          rows.push('<span class="k">两点距离</span>=' + Math.hypot(dx, dy).toFixed(2) +
            '　<span class="k">B−A</span>=(' + dx.toFixed(2) + ', ' + dy.toFixed(2) + ')');
        }
      }
      if (data.note) rows.push('<span class="dg-note">' + data.note + '</span>');
      info.innerHTML = rows.join('');
    }

    var st = { scale: 1, tx: 0, ty: 0 };
    draw();
    return { fit: draw, expandAll: function () { }, collapseTo: function () { }, resetDrag: draw };
  }

  /* ============ 曲线（缓动 / 三角） ============ */
  function Curve(root, data, opt) {
    opt = opt || {};
    var W = 760, H = opt.h || 380;
    var box = div('dg-curve', root);
    var ctl = div('dg-ctl', box);
    var svg = el('svg', { class: 'dg-svg', viewBox: '0 0 ' + W + ' ' + H, height: H });
    box.appendChild(svg);

    var vals = {};
    (data.params || []).forEach(function (p) {
      vals[p.k] = p.v;
      var lb = document.createElement('label');
      lb.className = 'dg-slider';
      var nm = document.createElement('span'); nm.textContent = p.t;
      var inp = document.createElement('input');
      inp.type = 'range'; inp.min = p.min; inp.max = p.max; inp.step = p.step || 0.01; inp.value = p.v;
      var out = document.createElement('b'); out.textContent = (+p.v).toFixed(2);
      inp.addEventListener('input', function () {
        vals[p.k] = +inp.value; out.textContent = (+inp.value).toFixed(2); draw();
      });
      lb.appendChild(nm); lb.appendChild(inp); lb.appendChild(out);
      ctl.appendChild(lb);
    });

    var padL = 56, padR = 26, padT = 22, padB = 38;
    var px0 = padL, px1 = W - padR, py0 = H - padB, py1 = padT;
    var dom = data.piDomain ? [-Math.PI * data.piDomain[0], Math.PI * data.piDomain[1]] : [0, 1];
    var yr = data.yRange || [0, 1];

    function fv(t) {
      var A = vals.A == null ? 1 : vals.A, w = vals.w == null ? 1 : vals.w, ph = vals.ph == null ? 0 : vals.ph;
      var k = vals.k == null ? 3 : vals.k;
      switch (data.fn) {
        case 'sin': return A * Math.sin(w * t + ph);
        case 'cos': return A * Math.cos(w * t + ph);
        case 'lerp': return t;
        case 'approach': return 1 - Math.exp(-k * t);
        case 'smooth': return t * t * (3 - 2 * t);
        case 'easein': return Math.pow(t, k);
        case 'easeout': return 1 - Math.pow(1 - t, k);
        default: return t;
      }
    }
    function MX(t) { return px0 + (px1 - px0) * (t - dom[0]) / (dom[1] - dom[0]); }
    function MY(v) { return py0 - (py0 - py1) * ((v - yr[0]) / (yr[1] - yr[0])); }

    function draw() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      var yTicks = data.yTicks || [0, 0.2, 0.4, 0.6, 0.8, 1];
      yTicks.forEach(function (v) {
        var y = MY(v);
        el('line', { x1: px0, y1: y, x2: px1, y2: y, stroke: Math.abs(v) < 1e-9 ? '#c6d0de' : '#eff2f7' }, svg);
        tx(svg, String(+v.toFixed(2)), { x: px0 - 12, y: y + 4, 'font-size': 10.5, fill: '#8b98ad', 'text-anchor': 'end' });
      });
      var xTicks = data.xTicks;
      if (!xTicks) {
        xTicks = [0, 0.2, 0.4, 0.6, 0.8, 1].map(function (t) { return { x: t, l: t.toFixed(1) }; });
      }
      xTicks.forEach(function (tk) {
        var x = MX(tk.x);
        el('line', { x1: x, y1: py0, x2: x, y2: py1, stroke: Math.abs(tk.x) < 1e-9 ? '#c6d0de' : '#f6f8fb' }, svg);
        tx(svg, tk.l, { x: x, y: py0 + 17, 'font-size': 10.5, fill: '#8b98ad', 'text-anchor': 'middle' });
      });
      el('line', { x1: px0, y1: py0, x2: px1, y2: py0, stroke: '#bcc8d8', 'stroke-width': 1.3 }, svg);
      el('line', { x1: px0, y1: py0, x2: px0, y2: py1, stroke: '#bcc8d8', 'stroke-width': 1.3 }, svg);
      tx(svg, data.xLabel || 't', { x: px1 - 4, y: py0 - 8, 'font-size': 11, fill: '#7b879c', 'text-anchor': 'end' });
      if (data.yLabel) tx(svg, data.yLabel, { x: px0 + 6, y: py1 - 4, 'font-size': 11, fill: '#7b879c' });

      if (data.guides) {
        data.guides.forEach(function (gv) {
          el('line', { x1: px0, y1: MY(gv), x2: px1, y2: MY(gv), stroke: '#e8663d', 'stroke-width': 1.2, 'stroke-dasharray': '5 5' }, svg);
        });
      }

      var d = '', N = 420;
      for (var i = 0; i <= N; i++) {
        var t = dom[0] + (dom[1] - dom[0]) * i / N;
        d += (i ? ' L' : 'M') + MX(t) + ',' + MY(fv(t));
      }
      el('path', { d: d, fill: 'none', stroke: '#2b6cf6', 'stroke-width': 2.6, 'stroke-linecap': 'round' }, svg);

      if (data.fn === 'lerp') {
        el('line', { x1: px0, y1: py0, x2: px1, y2: py1, stroke: '#cbd5e4', 'stroke-width': 1.2, 'stroke-dasharray': '5 4' }, svg);
      }
      (data.tags || []).forEach(function (tg) {
        tx(svg, tg[0], { x: MX(tg[1]) + (tg[3] || 0), y: MY(tg[2]) + (tg[4] || 0), 'font-size': 11, fill: tg[5] || '#7b879c' });
      });
      if (data.note) tx(svg, data.note, { x: px0 + 4, y: py1 - 5, 'font-size': 11.5, fill: '#5c687c' });
    }
    draw();
    return { fit: draw, expandAll: function () { }, collapseTo: function () { }, resetDrag: draw };
  }

  /* ============ 三角曲线（sin / cos） ============ */
  function Trig(root, data, opt) {
    data.params = data.params || [
      { t: '振幅 A', k: 'A', v: 1, min: 0, max: 2, step: 0.1 },
      { t: '角频率 ω', k: 'w', v: 1, min: 0.25, max: 3, step: 0.05 },
      { t: '相位 φ', k: 'ph', v: 0, min: -3.14, max: 3.14, step: 0.05 }
    ];
    var ticks = [];
    for (var h = -8; h <= 8; h += 1) {
      ticks.push({ x: h * Math.PI / 2, l: pifrac(h) });
    }
    data.piDomain = [4, 4];
    data.yRange = [-1.6, 1.6];
    data.yTicks = [-1, -0.5, 0, 0.5, 1];
    data.xTicks = ticks;
    data.xLabel = 'x';
    return Curve(root, data, opt);
  }

  /* ============ 三维坐标轴（可拖动旋转） ============ */
  function Axes3d(root, data, opt) {
    opt = opt || {};
    var W = 760, H = opt.h || 420;
    var svg = el('svg', { class: 'dg-svg', viewBox: '0 0 ' + W + ' ' + H, height: H });
    root.appendChild(svg);
    var hint = div('dg-vecinfo', root);
    var g = el('g', {}, svg);
    var cut = data.cube !== false;
    var yaw = -0.62, pit = 0.42;

    function P(x, y, z) {
      var cy = Math.cos(yaw), sy = Math.sin(yaw);
      var X = x * cy - z * sy, Z = x * sy + z * cy;
      var cp = Math.cos(pit), sp = Math.sin(pit);
      var Y = y * cp - Z * sp, Z2 = y * sp + Z * cp;
      var k = 118;
      return [W / 2 + X * k, H / 2 + 40 - Y * k + Z2 * 0];
    }

    var AX = [
      { n: 'X', v: [1, 0, 0], c: '#e8663d' },
      { n: 'Y', v: [0, 1, 0], c: '#17a673' },
      { n: 'Z', v: [0, 0, 1], c: '#2b6cf6' }
    ];

    function draw() {
      while (g.firstChild) g.removeChild(g.firstChild);
      var o = P(0, 0, 0);
      if (cut) {
        var v = [[-0.55, -0.55, -0.55], [0.55, -0.55, -0.55], [0.55, -0.55, 0.55], [-0.55, -0.55, 0.55],
        [-0.55, 0.55, -0.55], [0.55, 0.55, -0.55], [0.55, 0.55, 0.55], [-0.55, 0.55, 0.55]];
        var E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
        E.forEach(function (e) {
          var a = P.apply(null, v[e[0]]), b = P.apply(null, v[e[1]]);
          el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: '#dfe5ee', 'stroke-width': 1.1 }, g);
        });
      }
      /* 三轴负半轴淡线 */
      AX.forEach(function (a) {
        var neg = P(-a.v[0] * 1.25, -a.v[1] * 1.25, -a.v[2] * 1.25);
        el('line', { x1: o[0], y1: o[1], x2: neg[0], y2: neg[1], stroke: '#e8edf4', 'stroke-width': 1, 'stroke-dasharray': '4 4' }, g);
      });
      AX.forEach(function (a, i) {
        var p = P(a.v[0] * 1.35, a.v[1] * 1.35, a.v[2] * 1.35);
        el('line', { x1: o[0], y1: o[1], x2: p[0], y2: p[1], stroke: a.c, 'stroke-width': 2.6 }, g);
        var ang = Math.atan2(p[1] - o[1], p[0] - o[0]);
        var s = 9;
        el('path', {
          d: 'M' + p[0] + ',' + p[1] + ' L' + (p[0] - s * Math.cos(ang - 0.4)) + ',' + (p[1] - s * Math.sin(ang - 0.4)) +
            ' L' + (p[0] - s * Math.cos(ang + 0.4)) + ',' + (p[1] - s * Math.sin(ang + 0.4)) + ' z', fill: a.c
        }, g);
        tx(g, a.n, { x: p[0] + (p[0] > o[0] ? 9 : -16), y: p[1] + (p[1] > o[1] ? 14 : -8), 'font-size': 13, fill: a.c, 'font-weight': 700 });
      });
      el('circle', { cx: o[0], cy: o[1], r: 3.5, fill: '#5c687c' }, g);
      if (data.labels) data.labels.forEach(function (lb) {
        var p = P(lb.p[0], lb.p[1], lb.p[2]);
        tx(g, lb.t, { x: p[0], y: p[1], 'font-size': 11.5, fill: '#5c687c', 'text-anchor': 'middle' });
      });
      hint.innerHTML = '<span class="k">左手坐标系</span> X 红 · Y 绿 · Z 蓝　<span class="dg-note">按住拖动可旋转视角，滚轮缩放画布</span>';
    }

    var dr = null;
    svg.addEventListener('pointerdown', function (e) { dr = { x: e.clientX, y: e.clientY, yaw: yaw, pit: pit }; });
    window.addEventListener('pointermove', function (e) {
      if (!dr) return;
      yaw = dr.yaw + (e.clientX - dr.x) * 0.008;
      pit = Math.max(-1.35, Math.min(1.35, dr.pit + (e.clientY - dr.y) * 0.006));
      draw();
    });
    window.addEventListener('pointerup', function () { dr = null; });
    draw();
    return { fit: draw, expandAll: function () { }, collapseTo: function () { }, resetDrag: draw };
  }

  /* ============ 表格（行列联动高亮） ============ */
  function Tbl(root, data) {
    var box = div('dg-tablewrap', root);
    var t = document.createElement('table');
    t.className = 'dg-table';
    box.appendChild(t);
    if (data.cols) {
      var thead = document.createElement('thead');
      var tr = document.createElement('tr');
      if (data.rowHead) { var th0 = document.createElement('th'); th0.className = 'rh'; tr.appendChild(th0); }
      data.cols.forEach(function (c, i) {
        var th = document.createElement('th');
        th.textContent = c;
        th.dataset.col = i;
        tr.appendChild(th);
      });
      thead.appendChild(tr); t.appendChild(thead);
    }
    var tb = document.createElement('tbody');
    t.appendChild(tb);
    (data.rows || []).forEach(function (row, ri) {
      var tr = document.createElement('tr');
      tr.dataset.row = ri;
      row.forEach(function (cell, ci) {
        var td = document.createElement('td');
        var isHead = data.rowHead && ci === 0;
        td.innerHTML = cell;
        if (isHead) { td.className = 'rh'; }
        td.dataset.col = ci;
        if (cell === '—' || cell === '') td.className += ' dim';
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    t.addEventListener('mouseover', function (e) {
      var c = e.target.closest('td,th'); if (!c) return;
      var tr = c.parentNode, ci = c.dataset.col;
      t.querySelectorAll('.hl-r').forEach(function (x) { x.classList.remove('hl-r'); });
      t.querySelectorAll('.hl-c').forEach(function (x) { x.classList.remove('hl-c'); });
      if (tr && tr.dataset.row != null) tr.classList.add('hl-r');
      t.querySelectorAll('[data-col="' + ci + '"]').forEach(function (x) { x.classList.add('hl-c'); });
    });
    t.addEventListener('mouseleave', function () {
      t.querySelectorAll('.hl-r,.hl-c').forEach(function (x) { x.classList.remove('hl-r'); x.classList.remove('hl-c'); });
    });
    if (data.note) {
      var p = div('dg-tablenote', box);
      p.textContent = data.note;
    }
    return { fit: function () { }, expandAll: function () { }, collapseTo: function () { }, resetDrag: function () { } };
  }

  /* ============ 叉乘公式（可代入数值） ============ */
  function Calc(root, data) {
    var box = div('dg-calc', root);
    var A = { x: data.a[0], y: data.a[1], z: data.a[2] };
    var B = { x: data.b[0], y: data.b[1], z: data.b[2] };
    var grid = div('dg-calc-in', box);
    [['A', A], ['B', B]].forEach(function (pr) {
      var g = div('dg-calc-row', grid);
      var lb = document.createElement('span'); lb.textContent = pr[0] + ' = '; g.appendChild(lb);
      ['x', 'y', 'z'].forEach(function (k) {
        var inp = document.createElement('input');
        inp.type = 'number'; inp.step = '0.5'; inp.value = pr[1][k];
        inp.dataset.k = k;
        inp.addEventListener('input', function () {
          pr[1][k] = +inp.value || 0; render();
        });
        g.appendChild(inp);
      });
    });
    var out = div('dg-calc-out', box);

    function render() {
      var X = A.y * B.z - A.z * B.y, Y = A.z * B.x - A.x * B.z, Z = A.x * B.y - A.y * B.x;
      out.innerHTML =
        '<div class="fx"><b>X</b> = Ya·Zb − Za·Yb = ' + A.y + '×' + B.z + ' − ' + A.z + '×' + B.y + ' = <em>' + X + '</em></div>' +
        '<div class="fx"><b>Y</b> = Za·Xb − Xa·Zb = ' + A.z + '×' + B.x + ' − ' + A.x + '×' + B.z + ' = <em>' + Y + '</em></div>' +
        '<div class="fx"><b>Z</b> = Xa·Yb − Ya·Xb = ' + A.x + '×' + B.y + ' − ' + A.y + '×' + B.x + ' = <em>' + Z + '</em></div>' +
        '<div class="res">A × B = (' + X + ', ' + Y + ', ' + Z + ')　|A×B| = ' + Math.hypot(X, Y, Z).toFixed(2) +
        '　A·B = ' + (A.x * B.x + A.y * B.y + A.z * B.z) + '</div>';
    }
    render();
    return { fit: function () { }, expandAll: function () { }, collapseTo: function () { }, resetDrag: function () { } };
  }


  /* ============ 截图文字还原（参数面板 / 层级树 / 代码） ============ */
  function OcrBox(root, data) {
    var wrap = div('dg-ocr', root);
    var bar = div('dg-ocr-bar', wrap);
    var inp = document.createElement('input');
    inp.type = 'search';
    inp.className = 'dg-ocr-s';
    inp.placeholder = data.kind === 'rows' ? '搜索参数…' : '搜索文字…';
    bar.appendChild(inp);
    var cnt = document.createElement('span');
    cnt.className = 'dg-ocr-n';
    bar.appendChild(cnt);
    var body = div('dg-ocr-body', wrap);

    var units = [];   /* 可搜索 / 可复制的最小单元 */

    function addUnit(node, text) {
      units.push({ n: node, t: text });
      node.classList.add('dg-oc-u');
      node.addEventListener('click', function () {
        var t = text;
        try {
          navigator.clipboard.writeText(t);
          node.classList.add('copied');
          setTimeout(function () { node.classList.remove('copied'); }, 700);
        } catch (e) { }
      });
    }

    function renderInto(host, d) {
      if (d.kind === 'cols') {
        var cols = d.cols || [];
        var grid = div('dg-ocr-cols', host);
        grid.style.gridTemplateColumns = 'repeat(' + Math.min(cols.length, 3) + ', minmax(0, 1fr))';
        cols.forEach(function (c, i) {
          var cell = div('dg-ocr-col', grid);
          var tag = div('dg-ocr-ct', cell);
          tag.textContent = c.title || ('区域 ' + (i + 1));
          renderInto(cell, c);
        });
        return;
      }
      if (d.kind === 'rows') {
        (d.groups || []).forEach(function (g) {
          if (g.h) {
            var h = div('dg-oc-h', host);
            h.textContent = g.h;
          }
          (g.rows || []).forEach(function (r) {
            var row = div('dg-oc-row', host);
            var lb = document.createElement('span');
            lb.className = 'lb';
            lb.textContent = r[0];
            var vl = document.createElement('span');
            vl.className = 'vl';
            vl.textContent = r[1] || '';
            row.appendChild(lb);
            row.appendChild(vl);
            addUnit(row, (r[0] + (r[1] ? ': ' + r[1] : '')).trim());
          });
        });
        return;
      }
      var pre = div('dg-oc-pre' + (d.kind === 'code' ? ' mono' : ''), host);
      (d.lines || []).forEach(function (l) {
        var ln = div('dg-oc-ln', pre);
        ln.style.paddingLeft = (l.i * 15) + 'px';
        ln.textContent = l.t;
        addUnit(ln, l.t);
      });
    }
    renderInto(body, data);

    function apply() {
      var q = (inp.value || '').trim().toLowerCase();
      var shown = 0;
      units.forEach(function (u) {
        var hit = !q || u.t.toLowerCase().indexOf(q) >= 0;
        u.n.style.display = hit ? '' : 'none';
        u.n.classList.toggle('hit', !!q && hit);
        if (hit) shown++;
      });
      body.querySelectorAll('.dg-oc-h').forEach(function (h) {
        var sib = h.nextElementSibling, any = false;
        while (sib && !sib.classList.contains('dg-oc-h')) {
          if (sib.classList.contains('dg-oc-u') && sib.style.display !== 'none') { any = true; break; }
          sib = sib.nextElementSibling;
        }
        h.style.display = any ? '' : 'none';
      });
      cnt.textContent = q ? shown + ' / ' + units.length + ' 条' : units.length + ' 条';
    }
    inp.addEventListener('input', apply);
    apply();

    return { fit: function () { }, expandAll: function () { }, collapseTo: function () { }, resetDrag: function () { } };
  }

  /* ============ 公式 fx ============
     原稿里的公式是 `<img src=".../__latex/xxx.svg">`（MathJax 排版结果）。
     这里把公式还原成真正的排版元素：\\frac 上下分层 + 分数线、\\sqrt 带横线、
     ^{} _{} 做上下标，变量自动排成斜体。纯 HTML/CSS，离线可用，可复制可选中。 */
  var FXC = {
    times: '×', cdot: '·', div: '÷', pm: '±', mp: '∓', le: '≤', leq: '≤', ge: '≥', geq: '≥',
    ne: '≠', neq: '≠', approx: '≈', equiv: '≡', propto: '∝', infty: '∞',
    pi: 'π', theta: 'θ', alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', Delta: 'Δ',
    lambda: 'λ', mu: 'μ', sigma: 'σ', phi: 'φ', varphi: 'φ', omega: 'ω', Omega: 'Ω',
    sum: '∑', prod: '∏', int: '∫', to: '→', rightarrow: '→', Rightarrow: '⇒', leftarrow: '←',
    wedge: '∧', land: '∧', vee: '∨', lor: '∨', neg: '¬', forall: '∀', exists: '∃', in: '∈',
    angle: '∠', perp: '⊥', parallel: '∥', circ: '°', degree: '°',
    ldots: '…', cdots: '⋯', quad: '\u2003', qquad: '\u2003\u2003',
    left: '', right: '', ',' : '\u2009', ';': '\u2005', ' ': ' ', '{': '{', '}': '}'
  };
  var FXLETTER = /^[a-zA-Z]$/;
  var FXOP = '=+−-×÷·±∓<>≤≥≠≈≡∨∧¬∈→⇒←';
  var FXBREAK = ',;、，：:';
  /* 函数名要正体（cos / sin / log…），不能跟变量一样排成斜体 */
  var FXFUNC = { cos: 'cos', sin: 'sin', tan: 'tan', cot: 'cot', sec: 'sec', csc: 'csc',
                 log: 'log', ln: 'ln', lg: 'lg', exp: 'exp', max: 'max', min: 'min',
                 abs: 'abs', mod: 'mod', det: 'det' };

  function Fx(root, data) {
    var box = div('dg-fx', root);
    if (data.note) {
      var nt = div('dg-fx-note', box);
      nt.textContent = data.note;
    }
    var lines = data.lines || (data.tex ? [data.tex] : []);
    var wrap = div('dg-fx-lines', box);

    function parse(txt) {
      var i = 0;
      function skip() { while (txt[i] === ' ' || txt[i] === '\t') i++; }
      function grp() {
        skip();
        if (txt[i] === '{') { i++; return seq('}'); }
        if (i >= txt.length) return [];
        return [atom()];
      }
      function seq(stop) {
        var out = [];
        while (i < txt.length) {
          var c = txt[i];
          if (c === ' ' || c === '\t') { i++; continue; }
          if (stop && c === stop) { i++; break; }
          if (c === '^' || c === '_') {
            i++;
            out.push({ t: c === '^' ? 'sup' : 'sub', c: grp() });
            continue;
          }
          if (c === '{') { i++; out.push({ t: 'grp', c: seq('}') }); continue; }
          if (c === '}') { i++; continue; }
          out.push(atom());
        }
        return out;
      }
      function atom() {
        var c = txt[i];
        if (c === '\\') {
          var m = /^\\([a-zA-Z]+|[\s\S])/.exec(txt.slice(i));
          var name = m[1];
          i += m[0].length;
          if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
            var a = grp(), b = grp();
            return { t: 'frac', a: a, b: b };
          }
          if (name === 'sqrt') return { t: 'sqrt', a: grp() };
          if (FXFUNC[name]) return { t: 'fn', v: FXFUNC[name] };
          var g = FXC[name];
          return { t: 'chr', v: g != null ? g : name };
        }
        i++;
        return { t: 'chr', v: c };
      }
      return seq('');
    }

    function emit(nodes, parent) {
      var prev = '';
      for (var k = 0; k < nodes.length; k++) {
        var n = nodes[k];
        if (n.t === 'frac') {
          var f = document.createElement('span'); f.className = 'dg-fx-frac';
          var nu = document.createElement('span'); nu.className = 'dg-fx-num'; emit(n.a, nu);
          var de = document.createElement('span'); de.className = 'dg-fx-den'; emit(n.b, de);
          f.appendChild(nu); f.appendChild(de); parent.appendChild(f);
          prev = 'x';
        } else if (n.t === 'sqrt') {
          var r = document.createElement('span'); r.className = 'dg-fx-sqrt';
          var sg = document.createElement('span'); sg.className = 'dg-fx-rad'; sg.textContent = '√';
          var ar = document.createElement('span'); ar.className = 'dg-fx-arg'; emit(n.a, ar);
          r.appendChild(sg); r.appendChild(ar); parent.appendChild(r);
          prev = 'x';
        } else if (n.t === 'sup' || n.t === 'sub') {
          var e = document.createElement(n.t === 'sup' ? 'sup' : 'sub');
          emit(n.c, e); parent.appendChild(e);
        } else if (n.t === 'fn') {
          var fn = document.createElement('span'); fn.className = 'dg-fx-fn'; fn.textContent = n.v;
          parent.appendChild(fn);
          prev = 'x';
        } else if (n.t === 'grp') {
          emit(n.c, parent);
        } else {
          var v = n.v;
          if (FXLETTER.test(v) || (v >= '\u0370' && v <= '\u03FF')) {
            var it = document.createElement('i'); it.textContent = v; parent.appendChild(it);
          } else if (FXOP.indexOf(v) >= 0) {
            var op = document.createElement('span');
            /* 一元正负号（在 ( 、, 、= 之后或行首）不占左侧空隙 */
            var unary = (v === '-' || v === '+' || v === '−') &&
                        (prev === '' || '(,=∈'.indexOf(prev) >= 0);
            op.className = 'dg-fx-op' + (unary ? ' dg-fx-un' : '');
            op.textContent = v;
            parent.appendChild(op);
          } else if (FXBREAK.indexOf(v) >= 0) {
            var br = document.createElement('span'); br.className = 'dg-fx-sep'; br.textContent = v;
            parent.appendChild(br);
          } else {
            parent.appendChild(document.createTextNode(v));
          }
          prev = v;
        }
      }
    }

    lines.forEach(function (ln) {
      var row = div('dg-fx-line', wrap);
      emit(parse(ln), row);
    });

    return { fit: function () { }, expandAll: function () { },
             collapseTo: function () { }, resetDrag: function () { } };
  }

  /* ============ 语义重绘 pic ============
     原图是引擎截图（3D 场景、碰撞器、UI 控件、图集示意…），OCR 只能拿到零散
     文字，拿到结构是不可能的。这里按「这张画面在讲什么」用基本图元重画：
     矩形 / 圆 / 多边形 / 弧 / 折线 / 箭头 / 文字 / 六边形 / 虚线框。
     坐标直接写 viewBox 单位，宽度由 CSS 自适应，不做拖拽以免和滚动冲突。 */
  function Pic(root, data) {
    var W = data.w || 640, H = data.h || 320;
    var fg = data.fg || '#243447';
    var svg = el('svg', { class: 'dg-svg dg-pic', viewBox: '0 0 ' + W + ' ' + H, height: H });
    root.appendChild(svg);
    var defs = el('defs', {}, svg);
    var g = el('g', {}, svg);
    var aid = 0;

    function makeArrow(color) {
      var id = 'pka' + (aid++);
      var m = el('marker', {
        id: id, viewBox: '0 0 10 10', refX: 9.5, refY: 5,
        markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse'
      }, defs);
      el('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: color }, m);
      return 'url(#' + id + ')';
    }

    if (data.bg) {
      el('rect', { x: 0, y: 0, width: W, height: H, fill: data.bg }, g);
    }
    if (data.grid) {
      var step = data.grid.step || 32, gc = data.grid.color || 'rgba(255,255,255,.07)';
      for (var gx = 0; gx <= W; gx += step) {
        el('line', { x1: gx, y1: 0, x2: gx, y2: H, stroke: gc, 'stroke-width': 1 }, g);
      }
      for (var gy = 0; gy <= H; gy += step) {
        el('line', { x1: 0, y1: gy, x2: W, y2: gy, stroke: gc, 'stroke-width': 1 }, g);
      }
    }

    (data.items || []).forEach(function (it) {
      var stroke = it.stroke || 'none';
      var sw = it.sw == null ? 1.4 : it.sw;
      var common = { stroke: stroke, 'stroke-width': sw, fill: it.fill || 'none' };
      if (it.op != null) common.opacity = it.op;
      if (it.dash) common['stroke-dasharray'] = it.dash;

      if (it.k === 'rect') {
        common.x = it.x; common.y = it.y; common.width = it.w; common.height = it.h;
        if (it.r) { common.rx = it.r; common.ry = it.r; }
        el('rect', common, g);
      } else if (it.k === 'circle') {
        common.cx = it.cx; common.cy = it.cy; common.r = it.r;
        el('circle', common, g);
      } else if (it.k === 'ellipse') {
        common.cx = it.cx; common.cy = it.cy; common.rx = it.rx; common.ry = it.ry;
        el('ellipse', common, g);
      } else if (it.k === 'poly' || it.k === 'line') {
        var pts = it.pts || [];
        var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join(' ');
        if (it.k === 'poly' && it.closed !== false) d += ' Z';
        common.d = d;
        if (it.k === 'line') {
          common.fill = 'none';
          common['stroke-linejoin'] = it.join || 'round';
          common['stroke-linecap'] = it.cap || 'round';
        }
        el('path', common, g);
      } else if (it.k === 'arrow') {
        var arr = makeArrow(it.stroke || fg);
        el('line', {
          x1: it.x1, y1: it.y1, x2: it.x2, y2: it.y2,
          stroke: it.stroke || fg, 'stroke-width': it.sw == null ? 2 : it.sw,
          'marker-end': arr, 'stroke-linecap': 'round',
          'stroke-dasharray': it.dash || ''
        }, g);
      } else if (it.k === 'arc') {
        var a0 = (it.a0 || 0) * Math.PI / 180, a1 = (it.a1 || 90) * Math.PI / 180;
        var large = Math.abs(it.a1 - it.a0) > 180 ? 1 : 0;
        var p0 = [it.cx + it.r * Math.cos(a0), it.cy - it.r * Math.sin(a0)];
        var p1 = [it.cx + it.r * Math.cos(a1), it.cy - it.r * Math.sin(a1)];
        var d2;
        if (it.mode === 'wedge') {
          d2 = 'M' + it.cx + ' ' + it.cy + ' L' + p0[0] + ' ' + p0[1] +
               ' A' + it.r + ' ' + it.r + ' 0 ' + large + ' 0 ' + p1[0] + ' ' + p1[1] + ' Z';
        } else {
          d2 = 'M' + p0[0] + ' ' + p0[1] +
               ' A' + it.r + ' ' + it.r + ' 0 ' + large + ' 0 ' + p1[0] + ' ' + p1[1];
        }
        common.d = d2;
        el('path', common, g);
      } else if (it.k === 'hex') {
        var flat = it.flat !== false;
        var hp = [];
        for (var i2 = 0; i2 < 6; i2++) {
          var ang = (flat ? 0 : 30) + i2 * 60;
          var rad = ang * Math.PI / 180;
          hp.push([it.cx + it.r * Math.cos(rad), it.cy + it.r * Math.sin(rad)]);
        }
        common.d = hp.map(function (p, i3) { return (i3 ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ') + ' Z';
        el('path', common, g);
      } else if (it.k === 'text') {
        var t = el('text', {
          x: it.x, y: it.y,
          fill: it.fill || fg,
          'font-size': it.size || 12,
          'font-weight': it.weight || 400,
          'text-anchor': it.anchor || 'start',
          'font-family': it.mono ? 'var(--mono)' : 'var(--sans)',
          'dominant-baseline': it.base || 'auto',
          'letter-spacing': it.ls || ''
        }, g);
        t.textContent = it.t;
      } else if (it.k === 'path') {
        common.d = it.d;
        if (!it.fill) common.fill = 'none';
        common['stroke-linecap'] = 'round';
        common['stroke-linejoin'] = 'round';
        el('path', common, g);
      }
    });

    return { fit: function () { }, expandAll: function () { },
             collapseTo: function () { }, resetDrag: function () { } };
  }

  /* ============ 挂载 ============ */
  var KINDS = { mind: Mind, flow: Flow, vec: Vec, curve: Curve, trig: Trig, tbl: Tbl,
                axes3d: Axes3d, calc: Calc, ocr: OcrBox, fx: Fx, pic: Pic };
  var NOBAR = { tbl: 1, calc: 1, curve: 1, trig: 1, axes3d: 1, ocr: 1, fx: 1, pic: 1 };

  function mount(container) {
    var key = container.getAttribute('data-diagram');
    var d = window.DIAGRAMS && window.DIAGRAMS[key];
    if (!d) { container.innerHTML = '<div class="dg-miss">缺少图形数据：' + key + '</div>'; return; }
    var K = KINDS[d.type];
    if (!K) { container.innerHTML = '<div class="dg-miss">未知图形类型：' + d.type + '</div>'; return; }

    var body = div('dg-body', container);
    var api;
    try { api = K(body, d.data, d.opt || {}); }
    catch (e) { body.innerHTML = '<div class="dg-miss">渲染失败：' + (e && e.message) + '</div>'; return; }

    if (!NOBAR[d.type]) {
      var bar = div('dg-tools', body);
      function btn(label, fn) {
        var b = document.createElement('button');
        b.className = 'dg-btn'; b.textContent = label;
        b.addEventListener('click', fn);
        bar.appendChild(b);
      }
      if (d.type === 'mind') {
        btn('展开全部', api.expandAll);
        btn('只留二级', function () { api.collapseTo(2); });
        btn('复位拖动', api.resetDrag);
      } else if (d.type === 'vec') {
        btn('复位', api.resetDrag);
      } else {
        btn('复位', api.resetDrag || api.fit);
      }
      btn('适应窗口', api.fit);
    }

    var img = container.getAttribute('data-img');
    if (img) {
      var pane = div('dg-orig', container);
      var im = document.createElement('img');
      im.src = img; im.alt = d.title || '';
      pane.appendChild(im);
      pane.style.display = 'none';
      var tab = container.querySelector('.dgm-tab');
      if (tab) {
        tab.addEventListener('click', function () {
          var on = pane.style.display === 'none';
          pane.style.display = on ? 'block' : 'none';
          body.style.display = on ? 'none' : '';
          tab.textContent = on ? '看交互图' : '看原图';
        });
      }
    }
  }

  window.__mountDiagrams = function () {
    document.querySelectorAll('[data-diagram]').forEach(function (c) {
      if (c.dataset.dgm) return;
      c.dataset.dgm = '1';
      mount(c);
    });
  };
})();
