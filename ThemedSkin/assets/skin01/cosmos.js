/* =========================================================
   ICEFOCUS — Cinematic Solar System Intro (Canvas 2D)
   亮白 / 淡粉 浅色太空
   星云 → 恒星点亮 → 行星轨道 → 彗星 → 光爆 → 落版 ICEFOCUS
   ========================================================= */
(() => {
  const cv = document.getElementById('cosmos');
  if (!cv) return;

  const ctx = cv.getContext('2d', { alpha: false });
  const VW = 1600, VH = 900;
  const CX = VW / 2, CY = VH * 0.5;

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const ease = x => 1 - Math.pow(1 - x, 3);
  const easeIO = x => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  const TAU = Math.PI * 2;

  function seeded(s) {
    let x = (s * 9301 + 49297) % 233280;
    return () => ((x = (x * 9301 + 49297) % 233280) / 233280);
  }
  const R = seeded(20260910);

  /* ---------- 天体数据 ---------- */
  const STARS = Array.from({ length: 300 }, () => ({
    x: R() * VW, y: R() * VH,
    r: R() * 1.7 + 0.4,
    p: R() * TAU,
    sp: 0.6 + R() * 2.2,
    c: R() > 0.8 ? '240,105,159' : (R() > 0.45 ? '178,152,215' : '188,160,178'),
  }));

  const NEBULAS = [
    { x: VW * 0.18, y: VH * 0.22, r: 540, c: '255,150,200', a: 0.26, p: 0 },
    { x: VW * 0.84, y: VH * 0.74, r: 620, c: '214,190,255', a: 0.22, p: 1.7 },
    { x: VW * 0.62, y: VH * 0.14, r: 440, c: '255,200,225', a: 0.20, p: 3.1 },
    { x: VW * 0.34, y: VH * 0.88, r: 480, c: '255,175,215', a: 0.20, p: 4.6 },
  ];

  // 银河：沿一条斜带分布的密集星点 + 柔雾
  const GAL_ANG = -0.30;
  const GALAXY = Array.from({ length: 640 }, () => ({
    t: (R() - 0.5) * 2.6,
    off: (R() + R() + R() - 1.5) * 0.36,
    r: R() * 1.5 + 0.35,
    a: 0.25 + R() * 0.7,
    p: R() * TAU,
    c: R() > 0.78 ? '240,105,159' : (R() > 0.4 ? '186,162,220' : '255,255,255'),
  }));
  const GAL_FOG = Array.from({ length: 16 }, (_, i) => ({
    t: (i / 15 - 0.5) * 2.2 + (R() - 0.5) * 0.12,
    off: (R() - 0.5) * 0.22,
    r: 240 + R() * 320,
    a: 0.05 + R() * 0.07,
    c: R() > 0.5 ? '255,190,222' : '204,182,255',
  }));

  /* ---------- 时间轴配置 ---------- */
  const T = { space: [0, 1200], boom: [3050, 4000], title: 4300 };

  /* ---------- 运行状态 ---------- */
  let t = 0;
  let phase = 'wait';            // wait → play → idle
  let start = 0;
  let idleT = 0;
  let meteors = [];
  let nextMeteor = 1500;
  let visible = true;
  let warned = false;
  function warnOnce(e) { if (!warned) { warned = true; console.warn('[cosmos] render error:', e); } }

  /* ---------- 画布尺寸（覆盖式缩放，不留边） ---------- */
  let sc = 1, dpr = 1, ox = 0, oy = 0;
  function resize() {
    const rect = cv.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width || window.innerWidth));
    const h = Math.max(1, Math.round(rect.height || window.innerHeight));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    sc = Math.max(w / VW, h / VH);
    ox = (w - VW * sc) / 2;
    oy = (h - VH * sc) / 2;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    // wait 阶段也先铺底色，避免首帧闪白/透底
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#FFFAFC';
    ctx.fillRect(0, 0, cv.width, cv.height);
  }
  window.addEventListener('resize', resize);
  if (window.ResizeObserver) new ResizeObserver(resize).observe(cv.parentElement || cv);
  resize();

  /* 离开首屏时暂停绘制 */
  const home = document.getElementById('home');
  if (home && 'IntersectionObserver' in window) {
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(home);
  }

  /* ---------- 绘制 ---------- */
  function drawSpace(p) {
    const g = ctx.createRadialGradient(CX, CY, 40, CX, CY, VW * 0.8);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.5, `rgb(255,${Math.round(252 - 5 * p)},${Math.round(253 - 3 * p)})`);
    g.addColorStop(1, `rgb(255,${Math.round(243 - 9 * p)},${Math.round(248 - 5 * p)})`);
    ctx.fillStyle = g;
    ctx.fillRect(-600, -400, VW + 1200, VH + 800);
  }

  function drawNebulas(p) {
    for (const n of NEBULAS) {
      const pulse = 1 + Math.sin(t / 3400 + n.p) * 0.09;
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * pulse);
      g.addColorStop(0, `rgba(${n.c},${n.a * p})`);
      g.addColorStop(0.45, `rgba(${n.c},${n.a * 0.45 * p})`);
      g.addColorStop(1, `rgba(${n.c},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r * pulse, 0, TAU); ctx.fill();
    }
  }

  function drawStars(p) {
    for (const s of STARS) {
      const tw = 0.4 + 0.6 * Math.sin(t / (420 / s.sp) + s.p);
      ctx.globalAlpha = clamp((0.22 + tw * 0.5) * p, 0, 1);
      ctx.fillStyle = `rgb(${s.c})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
      if (s.r > 1.3) {
        ctx.globalAlpha = clamp(tw * p * 0.16, 0, 1);
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 3.2, 0, TAU); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawGalaxy(p) {
    if (p <= 0) return;
    const c = Math.cos(GAL_ANG), s = Math.sin(GAL_ANG), L = VW * 0.62, FLAT = 0.6;
    const px = (tt, off) => [
      CX + tt * L * c - off * L * FLAT * s,
      CY + tt * L * s + off * L * FLAT * c,
    ];
    // 银河雾带
    for (const f of GAL_FOG) {
      const [x, y] = px(f.t, f.off);
      const g = ctx.createRadialGradient(x, y, 0, x, y, f.r);
      g.addColorStop(0, `rgba(${f.c},${f.a * p})`);
      g.addColorStop(1, `rgba(${f.c},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, f.r, f.r * 0.5, GAL_ANG, 0, TAU);
      ctx.fill();
    }
    // 银河星点
    for (const g of GALAXY) {
      const [x, y] = px(g.t, g.off);
      const tw = 0.45 + 0.55 * Math.sin(t / (520 / (0.7 + Math.abs(g.t))) + g.p);
      ctx.globalAlpha = clamp(g.a * tw * p, 0, 1) * 0.85;
      ctx.fillStyle = `rgb(${g.c})`;
      ctx.beginPath(); ctx.arc(x, y, g.r, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawComet() {
    const p = seg(t, 2450, 3800);
    if (p <= 0 || p >= 1) return;
    const e = easeIO(p);
    const x = 1520 - e * 1380, y = -80 + e * 900;
    const tail = 330 * Math.sin(Math.PI * clamp(p * 1.15, 0, 1));
    const g = ctx.createLinearGradient(x, y, x + tail * 0.72, y - tail * 0.47);
    g.addColorStop(0, 'rgba(240,105,159,.85)');
    g.addColorStop(0.5, 'rgba(255,170,205,.35)');
    g.addColorStop(1, 'rgba(255,200,225,0)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + tail * 0.72, y - tail * 0.47); ctx.stroke();
    ctx.fillStyle = '#f0699f';
    ctx.beginPath(); ctx.arc(x, y, 9, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(61,37,49,.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function drawBoom() {
    const p = seg(t, T.boom[0], T.boom[1]);
    if (p <= 0 || p >= 1) return;
    for (let k = 0; k < 3; k++) {
      const pp = clamp((p - k * 0.13) / (1 - k * 0.13), 0, 1);
      if (pp <= 0) continue;
      const rr = 60 + ease(pp) * (760 - k * 110);
      ctx.strokeStyle = `rgba(240,105,159,${(1 - pp) * (0.55 - k * 0.13)})`;
      ctx.lineWidth = 14 * (1 - pp) + 1.2;
      ctx.beginPath(); ctx.ellipse(CX, CY, rr, rr * 0.28, 0, 0, TAU); ctx.stroke();
    }
  }

  function drawMeteors(dt) {
    nextMeteor -= dt;
    if (nextMeteor <= 0 && meteors.length < 6) {
      nextMeteor = 900 + R() * 2600;
      meteors.push({ x: R() * VW * 1.1, y: -40 - R() * 120, vx: -(1.6 + R() * 1.4), vy: 2.2 + R() * 1.6, life: 1 });
    }
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx * dt * 0.06 * 8; m.y += m.vy * dt * 0.06 * 8; m.life -= dt / 2200;
      if (m.life <= 0 || m.y > VH + 60) { meteors.splice(i, 1); continue; }
      const a = clamp(m.life, 0, 1);
      const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 34, m.y - m.vy * 34);
      g.addColorStop(0, `rgba(240,105,159,${a * 0.85})`);
      g.addColorStop(1, 'rgba(255,190,220,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 34, m.y - m.vy * 34); ctx.stroke();
    }
  }

  function drawVignette() {
    const g = ctx.createRadialGradient(CX, CY, VH * 0.3, CX, CY, VH * 1.05);
    g.addColorStop(0, 'rgba(255,240,248,0)');
    g.addColorStop(1, 'rgba(255,240,247,.85)');
    ctx.fillStyle = g;
    ctx.fillRect(-600, -400, VW + 1200, VH + 800);
  }

  /* ---------- 主循环 ---------- */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(40, now - last); last = now;
    if (phase === 'wait') t = 0;
    else if (phase === 'play') t = now - start;
    else { idleT += dt; t = T.title + idleT; }

    if (phase === 'wait') {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#FFFAFC';
      ctx.fillRect(0, 0, cv.width, cv.height);
    } else if (!document.hidden && visible) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#FFFAFC';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.setTransform(sc * dpr, 0, 0, sc * dpr, ox * dpr, oy * dpr);

      try {
        // 相机
        const zp = ease(seg(t, 0, 3800));
        let z, rot;
        if (phase === 'play') { z = 1.34 - zp * 0.34; rot = -0.10 + zp * 0.02; }
        else { z = 1 + Math.sin(idleT / 6000) * 0.02; rot = -0.08 + Math.sin(idleT / 12000) * 0.012; }
        ctx.translate(CX, CY);
        ctx.rotate(rot);
        ctx.scale(z, z);
        ctx.translate(-CX, -CY + (phase === 'play' ? (1 - zp) * 40 : 0));

        const pSpace = ease(seg(t, T.space[0], T.space[1]));

        drawSpace(pSpace);
        drawNebulas(pSpace);
        drawGalaxy(pSpace);
        drawStars(0.3 + pSpace * 0.7);
        drawComet();
        drawBoom();
        drawMeteors(dt);
        drawVignette();
      } catch (e) {
        warnOnce(e);   // 单帧渲染异常不再中断时间轴
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    if (phase === 'play') {
      if (t >= 3000) document.body.classList.add('veiled');
      if (t >= T.title) {
        phase = 'idle'; idleT = 0;
        window.dispatchEvent(new Event('cosmos:title'));
      }
    }
    requestAnimationFrame(frame);
  }

  /* ---------- 控制 ---------- */
  function finish() { if (phase === 'play') { start = performance.now() - T.title; t = T.title; } }
  function replay() {
    meteors = []; nextMeteor = 1500;
    document.body.classList.remove('veiled');
    phase = 'play'; start = performance.now(); idleT = 0;
    window.dispatchEvent(new Event('cosmos:replay'));
  }
  function play() { if (phase === 'wait') { phase = 'play'; start = performance.now(); } }
  window.CosmosIntro = { skip: finish, replay, play };

  requestAnimationFrame(frame);
})();
