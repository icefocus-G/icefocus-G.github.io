/* =========================================================
   ICEFOCUS — interactions
   ========================================================= */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   1. 程序化美术图生成（SVG → data URI）
   ========================================================= */
const PAL = [
  ['#6b2f5e', '#a04a86', '#ffc2e0', '#fff4fa'],
  ['#3f2a6b', '#6b4aa8', '#d8b3ff', '#fff2fb'],
  ['#7a2a55', '#b3427e', '#ffb3d4', '#fff0f6'],
  ['#2a4a7a', '#3f6bb0', '#a8d0ff', '#f6faff'],
  ['#5a2a6b', '#8a4aa8', '#e0b3ff', '#fff2fc'],
  ['#255a72', '#3f8aab', '#a8e6ff', '#f4fcff'],
  ['#7a4a2a', '#b3755a', '#ffd0b8', '#fff6f2'],
];

function rnd(seed) {
  let s = seed * 9301 + 49297;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

function wrap(p, inner, extra = '') {
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>
  <defs>
    <linearGradient id='bg' x1='0' y1='0' x2='.6' y2='1'>
      <stop offset='0' stop-color='${p[0]}'/><stop offset='1' stop-color='${p[1]}'/>
    </linearGradient>
    <radialGradient id='gl' cx='.5' cy='.38' r='.62'>
      <stop offset='0' stop-color='${p[2]}' stop-opacity='.75'/>
      <stop offset='1' stop-color='${p[2]}' stop-opacity='0'/>
    </radialGradient>
    <linearGradient id='vg' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#000' stop-opacity='.55'/>
      <stop offset='.45' stop-color='#000' stop-opacity='0'/>
      <stop offset='1' stop-color='#000' stop-opacity='.8'/>
    </linearGradient>
    <filter id='nf'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/>
      <feColorMatrix type='saturate' values='0'/></filter>
    <filter id='sf' x='-30%' y='-30%' width='160%' height='160%'>
      <feGaussianBlur stdDeviation='14'/></filter>
  </defs>
  <rect width='400' height='500' fill='url(#bg)'/>
  <rect width='400' height='500' fill='url(#gl)'/>
  ${inner}
  <rect width='400' height='500' fill='url(#vg)'/>
  <rect width='400' height='500' filter='url(#nf)' opacity='.10'/>
  <g opacity='.18' stroke='${p[2]}' stroke-width='.6'>
    ${Array.from({ length: 9 }, (_, i) => `<line x1='0' y1='${i * 56}' x2='400' y2='${i * 56}'/>`).join('')}
  </g>
  ${extra}
</svg>`;
}

const ART = {
  concept(p, r) {
    const cx = 130 + r() * 140, cy = 150 + r() * 90, R = 52 + r() * 46;
    let s = `<circle cx='${cx}' cy='${cy}' r='${R * 2.5}' fill='${p[2]}' opacity='.16' filter='url(#sf)'/>
      <circle cx='${cx}' cy='${cy}' r='${R}' fill='${p[3]}'/>
      <circle cx='${cx}' cy='${cy}' r='${R}' fill='none' stroke='${p[2]}' stroke-width='2' opacity='.7'/>`;
    for (let i = 0; i < 4; i++) {
      const w = 40 + r() * 90, x = r() * 400, h = 90 + r() * 190;
      s += `<path d='M${x} 500 L${x + w / 2} ${500 - h} L${x + w} 500 Z' fill='#000' opacity='${0.35 + i * 0.13}'/>`;
    }
    s += `<rect x='0' y='${330 + r() * 60}' width='400' height='2' fill='${p[2]}' opacity='.6'/>`;
    for (let i = 0; i < 7; i++)
      s += `<circle cx='${r() * 400}' cy='${60 + r() * 200}' r='${1 + r() * 2.2}' fill='#fff' opacity='.55'/>`;
    return wrap(p, s);
  },
  character(p, r) {
    const hue = Math.floor(r() * 360);
    let s = `<circle cx='200' cy='190' r='128' fill='none' stroke='${p[2]}' stroke-width='2' opacity='.5'/>
      <circle cx='200' cy='190' r='152' fill='none' stroke='${p[3]}' stroke-width='1' opacity='.35' stroke-dasharray='8 12'/>
      <ellipse cx='200' cy='470' rx='130' ry='20' fill='#000' opacity='.55'/>`;
    // 剪影
    s += `<g fill='#05050a'>
      <circle cx='200' cy='150' r='38'/>
      <path d='M148 210 q52 -30 104 0 l26 130 q-78 26 -156 0 Z'/>
      <path d='M150 222 L96 340 l30 22 44 -84 Z'/>
      <path d='M250 222 L306 340 l-30 22 -44 -84 Z'/>
      <path d='M176 344 l24 130 24 -130 Z'/>
    </g>
    <path d='M148 210 q52 -30 104 0' fill='none' stroke='${p[3]}' stroke-width='3'/>
    <circle cx='200' cy='150' r='38' fill='none' stroke='${p[2]}' stroke-width='2' opacity='.8'/>
    <circle cx='186' cy='146' r='4' fill='${p[3]}'/><circle cx='214' cy='146' r='4' fill='${p[3]}'/>`;
    for (let i = 0; i < 16; i++)
      s += `<circle cx='${60 + r() * 280}' cy='${90 + r() * 320}' r='${1 + r() * 2}' fill='${p[3]}' opacity='${.3 + r() * .5}'/>`;
    return wrap(p, s, `<rect width='400' height='500' fill='hsl(${hue},80%,60%)' opacity='.05'/>`);
  },
  scene(p, r) {
    const sy = 110 + r() * 70;
    let s = `<circle cx='${110 + r() * 180}' cy='${sy}' r='46' fill='${p[3]}' opacity='.95'/>
      <circle cx='${110 + r() * 180}' cy='${sy}' r='100' fill='${p[3]}' opacity='.22' filter='url(#sf)'/>`;
    const layers = 4;
    for (let i = 0; i < layers; i++) {
      const base = 300 + i * 46, amp = 78 - i * 14;
      let d = `M0 500 L0 ${base + r() * 30}`;
      for (let x = 0; x <= 400; x += 50)
        d += ` L${x} ${base - amp * (0.35 + r() * 0.85)}`;
      d += ` L400 500 Z`;
      s += `<path d='${d}' fill='${i % 2 ? p[0] : p[1]}' opacity='${0.55 + i * 0.12}'/>`;
      s += `<path d='${d}' fill='none' stroke='${p[2]}' stroke-width='1' opacity='${.25 - i * .04}'/>`;
    }
    s += `<rect x='0' y='${250 + r() * 40}' width='400' height='40' fill='${p[2]}' opacity='.13' filter='url(#sf)'/>`;
    return wrap(p, s);
  },
  ui(p, r) {
    let s = `<g opacity='.95'>
      <rect x='26' y='40' width='150' height='14' rx='7' fill='#000' opacity='.55'/>
      <rect x='28' y='42' width='${70 + r() * 70}' height='10' rx='5' fill='${p[2]}'/>
      <rect x='26' y='62' width='150' height='9' rx='4' fill='#000' opacity='.5'/>
      <rect x='28' y='64' width='${40 + r() * 60}' height='5' rx='2' fill='${p[3]}'/>
      <circle cx='46' cy='112' r='22' fill='#000' opacity='.5'/>
      <circle cx='46' cy='112' r='22' fill='none' stroke='${p[2]}' stroke-width='2'/>`;
    for (let i = 0; i < 4; i++)
      s += `<rect x='${28 + i * 40}' y='${170}' width='32' height='32' rx='7' fill='#000' opacity='.45'/>
            <rect x='${28 + i * 40}' y='170' width='32' height='32' rx='7' fill='none' stroke='${i === 1 ? p[3] : p[2]}' stroke-width='1.5' opacity='${i === 1 ? 1 : .6}'/>`;
    s += `<circle cx='200' cy='290' r='46' fill='none' stroke='${p[2]}' stroke-width='1.5' opacity='.55'/>
      <circle cx='200' cy='290' r='62' fill='none' stroke='${p[2]}' stroke-width='.8' opacity='.3' stroke-dasharray='6 10'/>
      <path d='M200 234 v22 M200 324 v22 M144 290 h22 M234 290 h22' stroke='${p[3]}' stroke-width='2'/>
      <rect x='26' y='396' width='348' height='76' rx='12' fill='#000' opacity='.42'/>
      <rect x='26' y='396' width='348' height='76' rx='12' fill='none' stroke='${p[2]}' stroke-width='1.5' opacity='.65'/>
      ${Array.from({ length: 6 }, (_, i) => `<rect x='${42 + i * 56}' y='416' width='40' height='36' rx='8' fill='${p[2]}' opacity='${.18 + r() * .3}'/>`).join('')}
    </g>`;
    return wrap(p, s);
  },
  pixel(p, r) {
    const grid = 16, cell = 400 / grid;
    const patterns = [
      '00111111111111110011111111111111101111111111111000111111111111000001111111110000000011110000000000000000000000000000000000000000000000000000000000000000000000000',
      '0000011110000000000011111100000000111111110000001111111111000011111111111100001111111111110000111111111111000011111111111100000111111111000000011111100000000001111000000000000111000000000000010000000000',
      '0010001000100000011001100011000001111110001110000111111000111000011111100011100001111111001110001111111100111001111111110011100111111110001110011111110000111001111111000011100111111100000110011111100000000001111110000000000011111000000000000111100000000000001100000000',
    ];
    const pat = patterns[Math.floor(r() * patterns.length)];
    let s = `<g>`;
    for (let i = 0; i < Math.min(pat.length, grid * grid); i++) {
      if (pat[i] === '1') {
        const x = (i % grid) * cell, y = Math.floor(i / grid) * cell;
        s += `<rect x='${x}' y='${y}' width='${cell}' height='${cell}' fill='${i % 7 === 0 ? p[3] : p[2]}' opacity='${.65 + r() * .35}'/>`;
      }
    }
    s += `</g>`;
    return wrap(p, s);
  },
  prop(p, r) {
    let s = `<g transform='translate(200 250) rotate(${-18 + r() * 36})'>
      <rect x='-9' y='-170' width='18' height='210' fill='${p[2]}' opacity='.9'/>
      <rect x='-9' y='-170' width='18' height='210' fill='none' stroke='#fff' stroke-width='1' opacity='.4'/>
      <path d='M-9 -170 L0 -205 L9 -170 Z' fill='${p[3]}'/>
      <rect x='-46' y='36' width='92' height='13' rx='4' fill='${p[3]}'/>
      <rect x='-11' y='49' width='22' height='70' rx='5' fill='#2a1a10'/>
      <circle cx='0' cy='10' r='22' fill='${p[3]}' opacity='.85'/>
    </g>
    <ellipse cx='200' cy='452' rx='110' ry='16' fill='#000' opacity='.5'/>`;
    for (let i = 0; i < 22; i++)
      s += `<circle cx='${r() * 400}' cy='${r() * 500}' r='${1 + r() * 2.4}' fill='${p[3]}' opacity='${.25 + r() * .5}'/>`;
    return wrap(p, s);
  },
};

function makeArt(kind, seed) {
  const p = PAL[seed % PAL.length];
  const gen = ART[kind] || ART.concept;
  const svg = gen(p, rnd(seed + 7));
  // 注意：encodeURIComponent 不转义单引号，而 SVG 内部大量使用单引号属性，
  // 若直接把带单引号的 data URI 写进 HTML 的 style="..." 属性会截断属性 → 图案不显示。
  // 因此统一用单引号包裹 url()，并把内容里的单引号转义为 %27，两种注入方式都安全。
  return `url('data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}')`;
}

/* =========================================================
   2. 数据
   ========================================================= */
const WORKS = [
  { t: '霓虹废墟 · 主视觉', c: 'scene',    cat: 'scene',     ar: '4/5', d: '赛博废墟城市的概念气氛图，用于项目开场 CG。' },
  { t: '星海游侠 · 角色设定', c: 'character', cat: 'character', ar: '1/1', d: '主角三视图与配色方案，强调剪影辨识度。' },
  { t: 'HUD 界面概念',      c: 'ui',       cat: 'ui',        ar: '3/4', d: '战斗 HUD 布局草稿，含血条、技能槽与小地图。' },
  { t: '像素道具集',        c: 'pixel',    cat: 'pixel',     ar: '4/5', d: '48 件可交互道具，16×16 网格，统一描边规范。' },
  { t: '失落神殿 · 场景',   c: 'concept',  cat: 'concept',   ar: '5/4', d: '副本入口概念设计，三光源测试与材质分区。' },
  { t: '烈焰之刃',          c: 'prop',     cat: 'concept',   ar: '3/4', d: '传说级武器设定稿，含三种进化形态。' },
  { t: '深潜者 · 怪物设定', c: 'character', cat: 'character', ar: '1/1', d: 'Boss 概念设计，融合了深海生物与机械结构。' },
  { t: '卡牌对战 UI',       c: 'ui',       cat: 'ui',        ar: '4/5', d: '二次元卡牌游戏主界面，含抽卡动效分镜。' },
  { t: '黄昏港口',          c: 'scene',    cat: 'scene',     ar: '3/4', d: '开放世界据点气氛图，暖冷对比与体积光。' },
  { t: '像素城市街景',      c: 'pixel',    cat: 'pixel',     ar: '1/1', d: '32×32 瓦片集，可无缝拼接的城镇地块。' },
  { t: '机械核心',          c: 'concept',  cat: 'concept',   ar: '4/3', d: '关卡核心装置概念，含可动结构拆解。' },
  { t: '治疗师 · 立绘',     c: 'character', cat: 'character', ar: '4/5', d: 'SR 角色立绘精修，负责服装与配饰设计。' },
];

const PROJECTS = [
  { t: 'Project: Neon', y: '2026', b: '主美术', k: 'concept', s: 0,
    d: '赛博都市 Roguelike，从视觉基调到全套 UI 组件规范。',
    tags: ['概念设定', 'UI 规范', '特效'] },
  { t: '拾光者', y: '2023', b: '独立开发', k: 'pixel', s: 3,
    d: '像素叙事解谜，独立完成全部美术资产与 300+ 帧动画。',
    tags: ['像素美术', '动画', 'Unity'] },
  { t: '星轨纪元', y: '2025', b: 'UI 设计', k: 'ui', s: 2,
    d: 'SLG 手游，重构主城界面与战斗结算流程，交互效率提升 40%。',
    tags: ['界面设计', '交互', '图标'] },
  { t: '深海回响', y: '2024', b: '概念美术', k: 'scene', s: 4,
    d: '海洋生存题材，产出 60+ 场景气氛图与生物设定。',
    tags: ['场景', '生物设计', '气氛图'] },
];

/* =========================================================
   3. 预加载
   ========================================================= */
function bootPreloader() {
  let n = 0;
  const bar = $('#preloader span'), num = $('#preNum'), pre = $('#preloader');
  const tick = setInterval(() => {
    n = Math.min(100, n + Math.floor(Math.random() * 18) + 6);
    bar.style.width = n + '%';
    num.textContent = n;
    if (n >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        pre.classList.add('done');
        if (window.CosmosIntro) {
          window.CosmosIntro.play();
          // 看门狗：开场动画若因异常未能落版，也保证文字一定出现
          setTimeout(showHero, 7000);
        } else setTimeout(showHero, 400);
      }, 260);
    }
  }, 90);
}
if (document.readyState === 'complete') bootPreloader();
else window.addEventListener('load', bootPreloader);

function startIntro() {
  $$('.title-layer').forEach((l, li) => {
    if (!l.dataset.split) return;
    [...l.children].forEach((ch, i) => {
      ch.style.animationDelay = (li * 0.05 + i * 0.055) + 's';
    });
    l.classList.add('in');
  });
  setTimeout(typeLoop, 700);
}

/* 开场动画结束 → 落版 ICEFOCUS 出场 */
let introDone = false;
function showHero() {
  if (introDone) return;
  introDone = true;
  const hc = $('#heroContent');
  if (hc) hc.classList.add('show');
  startIntro();
  const ctl = $('#introCtl');
  if (ctl) ctl.textContent = 'REPLAY ↻';
}
window.addEventListener('cosmos:title', showHero);
setTimeout(showHero, 12000); // 兜底
window.addEventListener('cosmos:replay', () => {
  introDone = false;
  const hc = $('#heroContent');
  if (hc) hc.classList.remove('show');
  $$('.title-layer').forEach(l => l.classList.remove('in'));
  const ctl = $('#introCtl');
  if (ctl) ctl.textContent = 'SKIP ⏭';
});

/* 跳过 / 重播 */
(() => {
  const ctl = $('#introCtl');
  if (!ctl) return;
  ctl.addEventListener('click', () => {
    if (!window.CosmosIntro) { showHero(); return; }
    if (ctl.textContent.indexOf('SKIP') === 0) window.CosmosIntro.skip();
    else window.CosmosIntro.replay();
  });
})();

/* =========================================================
   4. 标题拆字
   ========================================================= */
const TITLE = 'Icefocus';
$$('.title-layer').forEach(layer => {
  // 与加载页一致：前三个字母深梅，其余粉色
  layer.innerHTML = [...TITLE]
    .map((c, i) => `<span class="ch" style="color:${i < 3 ? '#3d2531' : '#f0699f'}">${c}</span>`)
    .join('');
  layer.dataset.split = '1';
});
$('.title-layer.g1').querySelectorAll('.ch').forEach(c => (c.style.color = '#f0699f'));
$('.title-layer.g2').querySelectorAll('.ch').forEach(c => (c.style.color = '#3d2531'));
$('.title-layer.outline').querySelectorAll('.ch').forEach(c => (c.style.color = 'transparent'));

/* =========================================================
   5. 自定义光标 + 磁吸
   ========================================================= */
const cur = $('#cursor'), dot = $('#cursorDot');
let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
if (!matchMedia('(hover:none)').matches) {
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function loop() {
    cx = lerp(cx, mx, 0.16); cy = lerp(cy, my, 0.16);
    cur.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
  const hot = 'a,button,.card,.proj,.filter,.soc,.tools span,.mail-copy';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hot)) cur.classList.add('grow');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hot)) cur.classList.remove('grow');
  });
}

$$('[data-magnetic]').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${x * 0.28}px,${y * 0.28}px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

/* =========================================================
   6. 星空背景（全站）
   ========================================================= */
(function bg() {
  const cv = $('#bgCanvas'), ctx = cv.getContext('2d');
  let W, H, ps = [], shots = [], nextShot = 1800, lastT = performance.now();
  const D = () => Math.min(devicePixelRatio || 1, 2);

  function size() {
    W = cv.width = innerWidth * D();
    H = cv.height = innerHeight * D();
    cv.style.width = innerWidth + 'px';
    cv.style.height = innerHeight + 'px';
    const n = Math.min(150, Math.floor(innerWidth / 11));
    ps = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: (Math.random() * 1.5 + 0.25) * D(),
      vx: (Math.random() - 0.5) * 0.06 * D(),
      vy: (Math.random() - 0.5) * 0.06 * D(),
      p: Math.random() * 6.283,
      sp: 0.6 + Math.random() * 2.4,
      c: Math.random() > 0.8 ? '240,105,159' : (Math.random() > 0.45 ? '178,152,215' : '188,160,178'),
    }));
  }
  size(); addEventListener('resize', size);

  function draw(now) {
    const dt = Math.min(50, now - lastT); lastT = now;
    ctx.clearRect(0, 0, W, H);

    // 星点
    for (const p of ps) {
      p.x += p.vx * dt * 0.06; p.y += p.vy * dt * 0.06;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      p.p += dt / (900 / p.sp);
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(p.p));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fillStyle = `rgba(${p.c},${0.28 + tw * 0.5})`;
      ctx.fill();
      if (p.r > 1.1 * D()) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 3.2, 0, 6.283);
        ctx.fillStyle = `rgba(${p.c},${tw * 0.14})`;
        ctx.fill();
      }
    }

    // 星座连线（粉色，极淡）
    const maxD = 130 * D();
    for (let i = 0; i < ps.length; i++)
      for (let j = i + 1; j < ps.length; j++) {
        const a = ps[i], b = ps[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < maxD * maxD) {
          const d = Math.sqrt(d2);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(240,105,159,${0.18 * (1 - d / maxD)})`;
          ctx.lineWidth = D() * 0.5;
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }

    // 流星
    if (!reduceMotion) {
      nextShot -= dt;
      if (nextShot <= 0) {
        nextShot = 2200 + Math.random() * 4200;
        const sp = 3.4 + Math.random() * 2.6;
        shots.push({ x: Math.random() * W, y: -20, vx: -sp * D(), vy: sp * 0.62 * D(), life: 1 });
      }
      for (let i = shots.length - 1; i >= 0; i--) {
        const s = shots[i];
        s.x += s.vx * dt * 0.06; s.y += s.vy * dt * 0.06; s.life -= dt / 1500;
        if (s.life <= 0 || s.y > H + 40) { shots.splice(i, 1); continue; }
        const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 26, s.y - s.vy * 26);
        g.addColorStop(0, `rgba(240,105,159,${s.life * 0.9})`);
        g.addColorStop(1, 'rgba(255,190,220,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.6 * D(); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 26, s.y - s.vy * 26); ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* =========================================================
   7. Hero 视差 + glitch
   ========================================================= */
(function hero() {
  const t = $('#bigTitle');
  if (matchMedia('(hover:none)').matches) return;
  let tx = 0, ty = 0, x = 0, y = 0;
  addEventListener('mousemove', e => {
    tx = (e.clientX / innerWidth - 0.5) * 26;
    ty = (e.clientY / innerHeight - 0.5) * 16;
  });
  (function loop() {
    x = lerp(x, tx, 0.07); y = lerp(y, ty, 0.07);
    t.style.transform = `rotateY(${x}deg) rotateX(${-y}deg) translateZ(0)`;
    requestAnimationFrame(loop);
  })();
  let gTimer;
  function glitch() {
    t.classList.add('glitching');
    clearTimeout(gTimer);
    gTimer = setTimeout(() => t.classList.remove('glitching'), 220);
  }
  t.addEventListener('mouseenter', glitch);
  setInterval(() => { if (Math.random() > 0.72) glitch(); }, 3200);
})();

/* =========================================================
   8. 打字机
   ========================================================= */
const LINES = [
  '把想法画成能玩的世界。',
  '概念设定 · 角色 · 场景 · UI · 像素',
  'Photoshop / Blender / Aseprite / Unity',
  '画面服务于玩法，风格服务于故事。',
];
let li = 0, ci = 0, del = false;
function typeLoop() {
  const el = $('#typewriter');
  if (!el) return;
  const s = LINES[li];
  el.textContent = del ? s.slice(0, --ci) : s.slice(0, ++ci);
  let d = del ? 34 : 66;
  if (!del && ci === s.length) { del = true; d = 1700; }
  else if (del && ci === 0) { del = false; li = (li + 1) % LINES.length; d = 320; }
  setTimeout(typeLoop, d);
}

/* =========================================================
   9. 渲染画廊
   ========================================================= */
const grid = $('#galleryGrid');
WORKS.forEach((w, i) => {
  const el = document.createElement('article');
  el.className = 'card';
  el.dataset.cat = w.cat;
  el.dataset.i = i;
  el.style.setProperty('--ar', w.ar);
  el.innerHTML = `
    <div class="card-art" style="background-image:${makeArt(w.c, i * 3 + 1)}"></div>
    <div class="card-zoom">↗</div>
    <div class="card-body">
      <span class="card-cat">${w.cat.toUpperCase()}</span>
      <h4 class="card-title">${w.t}</h4>
      <p class="card-desc">${w.d}</p>
    </div>`;
  el.addEventListener('click', () => openLB(i));
  grid.appendChild(el);
});

/* 过滤 */
$('#filters').addEventListener('click', e => {
  const b = e.target.closest('.filter');
  if (!b) return;
  $$('.filter').forEach(f => f.classList.remove('active'));
  b.classList.add('active');
  const f = b.dataset.f;
  $$('.card').forEach((c, i) => {
    const ok = f === 'all' || c.dataset.cat === f;
    c.classList.toggle('hide', !ok);
    if (ok) { c.classList.remove('in'); setTimeout(() => c.classList.add('in'), i * 40); }
  });
});

/* =========================================================
   10. 渲染项目 + 3D tilt
   ========================================================= */
const pw = $('#projects');
PROJECTS.forEach((p, i) => {
  const el = document.createElement('article');
  el.className = 'proj';
  el.innerHTML = `
    <div class="proj-top">
      <div class="pt-bg" style="background-image:${makeArt(p.k, p.s * 5 + 2)}"></div>
      <span class="proj-badge">${p.b}</span>
      <span class="proj-year">${p.y}</span>
    </div>
    <div class="proj-body">
      <h4>${p.t}</h4>
      <p>${p.d}</p>
      <div class="proj-tags">${p.tags.map(t => `<em>${t}</em>`).join('')}</div>
    </div>`;
  pw.appendChild(el);

  if (!matchMedia('(hover:none)').matches) {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) translateY(-6px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  }
});

/* =========================================================
   11. 灯箱
   ========================================================= */
const LB = $('#lightbox');
let lbIdx = 0, visible = [];
function openLB(i) {
  visible = $$('.card:not(.hide)');
  lbIdx = visible.findIndex(c => +c.dataset.i === i);
  if (lbIdx < 0) lbIdx = 0;
  paintLB();
  LB.classList.add('on');
  document.body.style.overflow = 'hidden';
}
function paintLB() {
  const c = visible[lbIdx]; if (!c) return;
  const w = WORKS[+c.dataset.i];
  $('#lbArt').style.backgroundImage = makeArt(w.c, (+c.dataset.i) * 3 + 1);
  $('#lbTitle').textContent = w.t;
  $('#lbDesc').textContent = w.d;
  $('#lbTags').innerHTML = [w.cat, '2026', 'ICEFOCUS']
    .map(t => `<em>#${t}</em>`).join('');
  $('#lbIdx').textContent = lbIdx + 1;
  $('#lbTotal').textContent = visible.length;
}
function navLB(d) {
  lbIdx = (lbIdx + d + visible.length) % visible.length;
  paintLB();
}
$('#lbClose').addEventListener('click', closeLB);
$('#lbNext').addEventListener('click', e => { e.stopPropagation(); navLB(1); });
$('#lbPrev').addEventListener('click', e => { e.stopPropagation(); navLB(-1); });
LB.addEventListener('click', e => { if (e.target === LB || e.target.closest('.lb-inner') === null) closeLB(); });
function closeLB() { LB.classList.remove('on'); document.body.style.overflow = ''; }
addEventListener('keydown', e => {
  if (!LB.classList.contains('on')) return;
  if (e.key === 'Escape') closeLB();
  if (e.key === 'ArrowRight') navLB(1);
  if (e.key === 'ArrowLeft') navLB(-1);
});

/* =========================================================
   12. 滚动相关：reveal / 进度 / 导航 / 计数 / 技能条
   ========================================================= */
const io = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.16 });
$$('[data-reveal]').forEach(el => io.observe(el));

$$('.card').forEach((c, i) => {
  const o = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => c.classList.add('in'), (i % 4) * 90);
        o.unobserve(c);
      }
    });
  }, { threshold: 0.12 });
  o.observe(c);
});

$$('.skill').forEach(s => {
  const o = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) {
        s.style.setProperty('--w', s.dataset.val + '%');
        s.classList.add('in');
        o.unobserve(s);
      }
    });
  }, { threshold: 0.4 });
  o.observe(s);
});

$$('[data-count]').forEach(el => {
  const target = +el.dataset.count;
  const o = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      let n = 0;
      const step = Math.max(1, Math.ceil(target / 46));
      const t = setInterval(() => {
        n += step;
        if (n >= target) { n = target; clearInterval(t); }
        el.textContent = n;
      }, 28);
      o.unobserve(el);
    });
  }, { threshold: 0.5 });
  o.observe(el);
});

const nav = $('#nav'), bar = $('#scrollBar');
const secs = ['home', 'gallery', 'dev', 'contact'].map(id => document.getElementById(id));
const navItems = $$('.nav-item');
const ink = $('#navInk');
function moveInk(el) {
  if (!el || el.offsetParent === null) { ink.style.opacity = 0; return; }
  ink.style.opacity = 1;
  ink.style.width = el.offsetWidth + 'px';
  ink.style.transform = `translateX(${el.offsetLeft - navItems[0].offsetLeft}px)`;
}
addEventListener('scroll', () => {
  const y = scrollY;
  nav.classList.toggle('scrolled', y > 60);
  const h = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (y / h) * 100 + '%';
  let cur = 0;
  secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.42) cur = i; });
  navItems.forEach(n => n.classList.remove('active'));
  if (cur > 0) { navItems[cur - 1].classList.add('active'); moveInk(navItems[cur - 1]); }
  else moveInk(null);
}, { passive: true });
addEventListener('resize', () => moveInk($('.nav-item.active')));

/* 汉堡菜单 */
const burger = $('#burger'), links = $('#navLinks');
burger.addEventListener('click', () => {
  burger.classList.toggle('on');
  links.classList.toggle('on');
});
$$('.nav-item').forEach(a => a.addEventListener('click', () => {
  burger.classList.remove('on'); links.classList.remove('on');
}));

/* =========================================================
   13. 表单 / 复制
   ========================================================= */
$('#contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#fName').value.trim();
  const mail = $('#fMail').value.trim();
  const msg  = $('#fMsg').value.trim();
  const note = $('#formNote');
  if (!name || !msg) { note.style.color = '#ff3d81'; note.textContent = '✕ 名字和留言不能为空'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) { note.style.color = '#ff3d81'; note.textContent = '✕ 邮箱格式不对哦'; return; }
  note.style.color = '#c8ff3c';
  note.textContent = '✓ 已收到！我会尽快回复（演示站点，未真实发送）';
  e.target.reset();
  setTimeout(() => (note.textContent = ''), 5000);
});

// 社交链接点击反馈（未填真实地址时给出提示）
$$('.soc').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href || href === '#') {
      e.preventDefault();
      const note = $('#formNote');
      if (note) {
        note.style.color = '#2ee6ff';
        note.textContent = 'ℹ 把这里换成你自己的主页链接即可（在 index.html 里改 href）';
        setTimeout(() => (note.textContent = ''), 3500);
      }
    }
  });
});

$('#year').textContent = new Date().getFullYear();

/* 首次进入直接显示 hero 内元素 */
setTimeout(() => {
  $$('.hero [data-reveal]').forEach((el, i) => setTimeout(() => el.classList.add('in'), i * 140));
}, 400);

})();
