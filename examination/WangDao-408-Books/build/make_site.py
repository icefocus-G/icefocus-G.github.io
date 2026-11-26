#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 408 教材中心单文件页面（四选卡 + 完整目录 + 按页阅读）。"""
import json

BASE = "/Volumes/02-program/WorkBuddyPlace/2026-11-24-16-13-41/408教材"
TOC = json.load(open(f"{BASE}/build/toc.json"))

ACCENT = {"ds": "#2f6df6", "cn": "#0ea5a5", "os": "#f0932b", "co": "#8b5cf6"}
ORDER = ["ds", "cn", "os", "co"]
OFF = 12          # 书内页码 = PDF 页序 - 12（四本书一致，由页眉 OCR 校准）


def conv(nodes):
    """压缩字段：t 标题 / p 起始页 / e 末页 / c 子节点"""
    out = []
    for n in nodes:
        o = {"t": n["t"], "p": n["p"], "e": n["end"]}
        if n.get("children"):
            o["c"] = conv(n["children"])
        out.append(o)
    return out


books = [{
    "k": k, "name": TOC[k]["name"], "code": TOC[k]["code"], "pages": TOC[k]["pages"],
    "off": OFF,
    "accent": ACCENT[k], "ch": conv(TOC[k]["chapters"]),
} for k in ORDER]

data = json.dumps(books, ensure_ascii=False, separators=(",", ":"))

TPL = r"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>408 教材中心 · 王道 2027 四本复习指导</title>
<style>
:root{
  --bg:#f4f7fb; --panel:#fff; --panel2:#fbfcfe; --ink:#0f172a; --ink2:#44506b;
  --ink3:#8a94a8; --line:#e5eaf3; --line2:#eef1f7; --accent:#2f6df6;
  --shadow:0 1px 2px rgba(16,24,40,.04),0 8px 24px -12px rgba(16,24,40,.16);
  --side:322px; --rbar:56px;
}
html[data-theme="dark"]{
  --bg:#0d1117; --panel:#151a21; --panel2:#11161d; --ink:#e7eef8; --ink2:#a8b4c7;
  --ink3:#6b7787; --line:#232a34; --line2:#1b222b;
  --shadow:0 1px 2px rgba(0,0,0,.4),0 10px 30px -14px rgba(0,0,0,.7);
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;height:100%}
body{
  background:var(--bg);color:var(--ink);
  font:15px/1.65 -apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
  -webkit-font-smoothing:antialiased;
}
::selection{background:#ffe9a8}

.top{position:sticky;top:0;z-index:60;background:var(--panel);border-bottom:1px solid var(--line)}
.top-in{display:flex;align-items:center;gap:18px;padding:10px 20px;max-width:1560px;margin:0 auto}
.brand{display:flex;align-items:center;gap:11px;flex:none}
.logo{
  width:38px;height:38px;border-radius:11px;display:grid;place-items:center;color:#fff;font-weight:800;
  font-size:14px;letter-spacing:-.5px;background:linear-gradient(135deg,#2f6df6,#8b5cf6);
  box-shadow:0 6px 14px -6px rgba(47,109,246,.7)
}
.brand h1{margin:0;font-size:15.5px;font-weight:700;letter-spacing:.2px}
.brand p{margin:0;font-size:11.5px;color:var(--ink3);letter-spacing:.3px}

.tabs{display:flex;gap:6px;flex:1;overflow-x:auto;scrollbar-width:none;padding:2px}
.tabs::-webkit-scrollbar{display:none}
.tab{
  display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:11px;border:1px solid transparent;
  background:transparent;color:var(--ink2);font:inherit;font-size:14px;font-weight:600;cursor:pointer;
  white-space:nowrap;transition:.18s
}
.tab .dot{width:8px;height:8px;border-radius:50%;background:var(--c);opacity:.4;transition:.18s;flex:none}
.tab .n{font-size:11px;font-weight:600;color:var(--ink3);letter-spacing:.3px}
.tab:hover{background:var(--line2);color:var(--ink)}
.tab[aria-selected="true"]{background:color-mix(in srgb,var(--c) 10%,transparent);
  border-color:color-mix(in srgb,var(--c) 26%,transparent);color:var(--c)}
.tab[aria-selected="true"] .dot{opacity:1;box-shadow:0 0 0 4px color-mix(in srgb,var(--c) 16%,transparent)}
.tab[aria-selected="true"] .n{color:color-mix(in srgb,var(--c) 62%,var(--ink3))}

.tools{display:flex;gap:6px;flex:none}
.icb{
  width:34px;height:34px;border-radius:10px;border:1px solid var(--line);background:var(--panel);
  color:var(--ink2);cursor:pointer;display:grid;place-items:center;font-size:15px;transition:.15s
}
.icb:hover{background:var(--line2);color:var(--ink)}
.icb.only-m{display:none}

.layout{display:flex;max-width:1560px;margin:0 auto;height:calc(100vh - 59px)}
.side{
  width:var(--side);flex:none;border-right:1px solid var(--line);background:var(--panel);
  display:flex;flex-direction:column;min-height:0
}
.side-h{padding:12px 14px 8px;border-bottom:1px solid var(--line2)}
.seg{display:flex;background:var(--line2);border-radius:9px;padding:2px;margin-bottom:9px}
.seg button{
  flex:1;border:0;background:transparent;font:inherit;font-size:12.5px;font-weight:600;color:var(--ink3);
  padding:5px 0;border-radius:7px;cursor:pointer;transition:.15s
}
.seg button.on{background:var(--panel);color:var(--ink);box-shadow:0 1px 2px rgba(16,24,40,.08)}
.qbox{position:relative}
.qbox input{
  width:100%;padding:8px 30px 8px 11px;border:1px solid var(--line);border-radius:9px;background:var(--panel2);
  font:inherit;font-size:13.5px;color:var(--ink);outline:none;transition:.15s
}
.qbox input:focus{border-color:color-mix(in srgb,var(--accent) 50%,var(--line));background:var(--panel);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 12%,transparent)}
.qbox .clr{
  position:absolute;right:6px;top:50%;transform:translateY(-50%);width:20px;height:20px;border:0;
  border-radius:6px;background:transparent;color:var(--ink3);cursor:pointer;font-size:12px;display:none
}
.qbox.has .clr{display:block}
.meta{display:flex;gap:12px;font-size:11.5px;color:var(--ink3);padding:8px 2px 2px;letter-spacing:.2px}
.meta b{color:var(--ink2);font-weight:650}

.tree{flex:1;overflow-y:auto;padding:6px 8px 60px;overscroll-behavior:contain}
.tree::-webkit-scrollbar{width:9px}
.tree::-webkit-scrollbar-thumb{background:var(--line);border-radius:9px;border:2px solid var(--panel)}

details{margin:0}
summary{list-style:none;cursor:pointer}
summary::-webkit-details-marker{display:none}
.row{
  display:flex;align-items:center;gap:6px;padding:5px 8px 5px 4px;border-radius:8px;font-size:13px;
  color:var(--ink2);cursor:pointer;transition:background .13s;text-decoration:none
}
.row:hover{background:var(--line2);color:var(--ink)}
.row .tt{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.row .pg2{font-size:10.5px;color:var(--ink3);font-variant-numeric:tabular-nums;flex:none}
.row.active{background:color-mix(in srgb,var(--accent) 13%,transparent);color:var(--accent);font-weight:650}
.row.active .pg2{color:color-mix(in srgb,var(--accent) 65%,var(--ink3))}
.row.d0{font-weight:700;font-size:13.5px;color:var(--ink);margin-top:2px}
.row.d1{font-weight:600;padding-left:8px}
.row.d2{padding-left:20px;font-size:12.5px}
.row.d3{padding-left:34px;font-size:12px;color:var(--ink3)}
.caret{width:16px;height:16px;flex:none;display:grid;place-items:center;color:var(--ink3);font-size:8px;
  transition:transform .18s;border-radius:4px}
.caret:hover{background:var(--line);color:var(--ink2)}
.caret::before{content:"▶"}
details[open]>.row>.caret{transform:rotate(90deg)}
.leaf .caret{visibility:hidden}
.hit{list-style:none;padding:0;margin:0}
.sres{font-size:11.5px;color:var(--ink3);padding:10px 9px 4px;letter-spacing:.2px}
.ghd{display:flex;align-items:center;gap:7px;font-size:12px;font-weight:700;padding:12px 9px 4px;
  letter-spacing:.3px;position:sticky;top:0;background:var(--panel);z-index:2}
.ghd .gdot{width:6px;height:6px;border-radius:50%;flex:none}
.ghd em{font-style:normal;font-weight:500;color:var(--ink3);font-size:11px;margin-left:auto}
.hit li{padding:8px 9px;border-radius:9px;cursor:pointer;border:1px solid transparent}
.hit li:hover{background:var(--line2);border-color:var(--line)}
.hit .h-b{font-size:10.5px;color:var(--ink3);letter-spacing:.3px;font-variant-numeric:tabular-nums}
.hit .h-t{font-size:13px;color:var(--ink);margin:1px 0 2px;font-weight:600}
.hit .h-s{font-size:12px;color:var(--ink2);line-height:1.5}
mark{background:#ffe08a;color:#111;border-radius:3px;padding:0 1px}
.empty{padding:26px 12px;text-align:center;color:var(--ink3);font-size:12.5px;line-height:1.8}

.reader{flex:1;min-width:0;display:flex;flex-direction:column;position:relative;background:var(--bg)}
.rbar{
  position:sticky;top:0;z-index:20;height:var(--rbar);display:flex;align-items:center;gap:14px;
  padding:0 22px;background:var(--bg);border-bottom:1px solid var(--line)
}
.crumb{flex:1;min-width:0;display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--ink3);overflow:hidden}
.crumb span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:280px}
.crumb b{color:var(--ink);font-weight:650}
.crumb i{font-style:normal;opacity:.45}
.rn{display:flex;align-items:center;gap:7px;flex:none;font-size:12.5px;color:var(--ink2)}
.rn input{
  width:52px;padding:4px 6px;text-align:center;border:1px solid var(--line);border-radius:7px;
  background:var(--panel);font:inherit;font-size:12.5px;color:var(--ink);outline:none;font-variant-numeric:tabular-nums
}
.rn input:focus{border-color:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 12%,transparent)}
.nb{
  border:1px solid var(--line);background:var(--panel);color:var(--ink2);border-radius:8px;padding:5px 10px;
  font:inherit;font-size:12.5px;cursor:pointer;transition:.15s;white-space:nowrap
}
.nb:hover:not(:disabled){background:var(--line2);color:var(--ink)}
.nb:disabled{opacity:.4;cursor:default}

.pages{flex:1;overflow-y:auto;padding:20px 22px 90px}
.pages::-webkit-scrollbar{width:11px}
.pages::-webkit-scrollbar-thumb{background:var(--line);border-radius:9px;border:3px solid var(--bg)}
.pgwrap{max-width:920px;margin:0 auto}
.pg{position:relative;background:#fff;border-radius:12px;overflow:hidden;margin:0 0 16px;
  box-shadow:var(--shadow);border:1px solid var(--line)}
.pg img{display:block;width:100%;height:auto}
.pg .pn{position:absolute;right:8px;bottom:8px;font-size:10.5px;color:#fff;background:rgba(15,23,42,.42);
  padding:1px 7px;border-radius:20px;font-variant-numeric:tabular-nums;opacity:0;transition:opacity .2s}
.pg:hover .pn{opacity:1}
.pend{max-width:920px;margin:4px auto 0;display:flex;gap:10px}
.pend button{flex:1;padding:13px;border-radius:11px;border:1px solid var(--line);background:var(--panel);
  color:var(--ink2);font:inherit;font-size:13.5px;font-weight:600;cursor:pointer;transition:.15s}
.pend button:hover:not(:disabled){border-color:var(--accent);color:var(--accent);
  background:color-mix(in srgb,var(--accent) 5%,var(--panel))}
.pend button:disabled{opacity:.35;cursor:default}
.progress{position:fixed;left:0;top:0;height:2px;background:var(--accent);z-index:100;width:0;transition:width .12s}

.totop{position:fixed;right:26px;bottom:26px;width:42px;height:42px;border-radius:50%;border:1px solid var(--line);
  background:var(--panel);color:var(--ink2);cursor:pointer;box-shadow:var(--shadow);font-size:16px;
  display:none;place-items:center;z-index:50}
.totop.on{display:grid}

@media (max-width:900px){
  .top-in{padding:9px 12px;gap:10px}
  .brand p{display:none}
  .brand h1{font-size:14px}
  .logo{width:34px;height:34px;border-radius:10px;font-size:13px}
  .tab .n{display:none}
  .tab{padding:7px 11px;font-size:13px}
  .icb.only-m{display:grid}
  .layout{height:calc(100vh - 53px)}
  .side{position:fixed;left:0;top:53px;bottom:0;width:86%;max-width:340px;z-index:70;
    transform:translateX(-102%);transition:transform .26s cubic-bezier(.4,0,.2,1);
    box-shadow:0 0 40px rgba(0,0,0,.18)}
  .side.open{transform:none}
  .scrim{position:fixed;inset:53px 0 0;background:rgba(9,12,20,.42);z-index:65;display:none}
  .scrim.on{display:block}
  .rbar{padding:0 12px;gap:8px}
  .crumb span{max-width:96px}
  .pages{padding:12px 10px 80px}
  .pg{border-radius:9px;margin-bottom:10px}
  .rn input{width:44px}
  .nb{padding:5px 8px}
}
</style>
</head>
<body>
<div class="progress" id="prog"></div>

<header class="top">
  <div class="top-in">
    <div class="brand">
      <div class="logo">408</div>
      <div>
        <h1>408 教材中心</h1>
        <p>王道 2027 · 四本复习指导 · 全文可检索</p>
      </div>
    </div>
    <nav class="tabs" id="tabs" role="tablist" aria-label="科目切换"></nav>
    <div class="tools">
      <button class="icb only-m" id="btnToc" title="目录">☰</button>
      <button class="icb" id="btnTheme" title="夜间模式">◐</button>
    </div>
  </div>
</header>

<div class="layout">
  <aside class="side" id="side">
    <div class="side-h">
      <div class="seg" id="seg">
        <button data-mode="toc" class="on">目录</button>
        <button data-mode="full">全文</button>
      </div>
      <div class="qbox" id="qbox">
        <input id="q" type="search" placeholder="搜索章节…" autocomplete="off" spellcheck="false">
        <button class="clr" id="clr" title="清空">✕</button>
      </div>
      <div class="meta" id="meta"></div>
    </div>
    <div class="tree" id="tree"></div>
  </aside>
  <div class="scrim" id="scrim"></div>

  <main class="reader">
    <div class="rbar">
      <div class="crumb" id="crumb"></div>
      <div class="rn">
        <button class="nb" id="prevSec" title="上一节（[）">上一节</button>
        <input id="jump" inputmode="numeric" aria-label="跳转书内页码" title="输入书上印的页码，回车跳转">
        <span id="total">/ —</span>
        <button class="nb" id="nextSec" title="下一节（]）">下一节</button>
      </div>
    </div>
    <div class="pages" id="pages"></div>
    <button class="totop" id="totop" title="回到顶部">↑</button>
  </main>
</div>

<script>
const BOOKS = __BOOKS__;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LS = 's408.v1';

/* 展平目录：给每个节点分配全局序号、层级、祖先链 */
BOOKS.forEach(b => {
  const flat = [];
  (function walk(nodes, depth, path){
    for (const n of nodes){
      n._i = flat.length; n._d = depth; n._path = path;
      flat.push(n);
      if (n.c && n.c.length) walk(n.c, depth + 1, path.concat(n._i));
    }
  })(b.ch, 0, []);
  b.flat = flat;
  b.tops = b.ch;
  b.chCount = b.ch.filter(c => c.t.indexOf('第') === 0).length;
  b.secCount = flat.filter(n => n._d === 1).length;
});

const st = { b: 0, i: 0, page: 1, mode: 'toc' };

/* ---------------- 选卡 ---------------- */
function renderTabs(){
  $('#tabs').innerHTML = BOOKS.map((b, i) =>
    `<button class="tab" role="tab" data-b="${i}" aria-selected="${i === st.b}" style="--c:${b.accent}">
       <span class="dot"></span>${b.name}<span class="n">${b.chCount} 章 · ${b.pages - b.off} 页</span>
     </button>`).join('');
  $('#tabs').querySelectorAll('.tab').forEach(el => el.onclick = () => switchBook(+el.dataset.b));
}

/* ---------------- 目录树 ---------------- */
function nodeHTML(n, curTop){
  const kids = n.c && n.c.length;
  const label = `<span class="tt">${esc(n.t)}</span><span class="pg2">${bp(BOOKS[st.b], n.p)}</span>`;
  if (!kids){
    return `<a class="row leaf d${n._d}" data-i="${n._i}"><span class="caret"></span>${label}</a>`;
  }
  const open = (n._i === curTop) ? ' open' : '';
  return `<details${open} data-i="${n._i}">
      <summary class="row d${n._d}"><span class="caret"></span>${label}</summary>
      ${n.c.map(c => nodeHTML(c, curTop)).join('')}
    </details>`;
}
function curTopIndex(){
  const b = BOOKS[st.b];
  let k = 0;
  b.tops.forEach((t, idx) => { if (t._i <= st.i) k = idx; });
  return b.tops[k] ? b.tops[k]._i : 0;
}
function renderTree(){
  const b = BOOKS[st.b];
  const curTop = curTopIndex();
  $('#tree').innerHTML = b.ch.map(n => nodeHTML(n, curTop)).join('');
  $('#tree').querySelectorAll('summary').forEach(sm => {
    sm.addEventListener('click', e => {
      if (e.target.classList.contains('caret')) return;   // 点三角只展开/收起
      e.preventDefault();
      sm.parentElement.open = true;
      open(+sm.parentElement.dataset.i);
    });
  });
  $('#tree').querySelectorAll('a.row').forEach(a => a.onclick = () => open(+a.dataset.i));
  $('#meta').innerHTML = `<span><b>${b.chCount}</b> 章</span><span><b>${b.secCount}</b> 节</span><span><b>${b.flat.length}</b> 条目</span><span><b>${b.pages - b.off}</b> 页</span>`;
}

/* ---------------- 阅读区 ---------------- */
const pageURL = (b, n) => `pages/${b.k}/${String(n).padStart(4, '0')}.webp`;
const bp = (b, p) => (p - b.off > 0 ? p - b.off : '—');   // PDF 页序 → 书内页码
// 卷首 12 页没有印刷页码，显示成「卷首」而不是「—」
const pgTxt = (b, p) => { const v = bp(b, p); return v === '—' ? '卷首 · PDF 第 ' + p + ' 页' : '第 ' + v + ' 页'; };
const pgAlt = (b, p) => { const v = bp(b, p); return v === '—' ? '卷首（PDF 第 ' + p + ' 页）' : '第 ' + v + ' 页'; };
const jumpVal = (b, p) => { const v = bp(b, p); return v === '—' ? '' : String(v); };
const rngTxt = (b, n) => {
  const a = bp(b, n.p), z = bp(b, n.e);
  if (a === '—') return '卷首 · PDF 第 ' + n.p + (n.e > n.p ? '–' + n.e : '') + ' 页';
  return '第 ' + a + ' 页' + (n.e > n.p ? ' – ' + z : '');
};

function renderPages(b, n, atPage){
  const box = $('#pages');
  let h = '<div class="pgwrap">';
  for (let p = n.p; p <= n.e; p++){
    h += `<figure class="pg" id="pg${p}" data-p="${p}">
        <img src="${pageURL(b, p)}" alt="${b.name} ${pgAlt(b, p)}" loading="lazy" decoding="async"
             width="992" height="1383" style="aspect-ratio:992/1383">
        <span class="pn">${pgTxt(b, p)}</span></figure>`;
  }
  h += '</div><div class="pend"><button id="pPrev">← 上一节</button><button id="pNext">下一节 →</button></div>';
  box.innerHTML = h;
  box.querySelector('#pPrev').onclick = () => step(-1);
  box.querySelector('#pNext').onclick = () => step(1);
  if (atPage && atPage !== n.p){
    const place = () => {
      const el = box.querySelector('#pg' + atPage);
      if (el) box.scrollTop = el.offsetTop - 10;
    };
    place();                                   // 同步定位：后台标签页也能生效
    requestAnimationFrame(place);              // 布局稳定后再校一次
    setTimeout(() => { place(); if (st.page) syncSection(st.page); }, 320);
  } else {
    box.scrollTop = 0;
  }
  $('#jump').value = jumpVal(b, st.page);
  $('#total').textContent = `/ ${b.pages - b.off}`;
}

function open(i, atPage){
  const b = BOOKS[st.b];
  const n = b.flat[i];
  if (!n) return;
  st.i = i;
  st.page = atPage || n.p;
  renderPages(b, n, atPage);
  expandPath(i);
  markActive(i);
  breadcrumb(n);
  $('#jump').value = jumpVal(b, st.page);
  updateProgress();
  save();
  if (innerWidth <= 900) closeSide();
}

/* 展开当前节点沿途的所有折叠层 */
function expandPath(i){
  const n = BOOKS[st.b].flat[i];
  if (!n) return;
  for (const pid of n._path){
    const d = $('#tree').querySelector(`details[data-i="${pid}"]`);
    if (d) d.open = true;
  }
}

function markActive(i){
  $('#tree').querySelectorAll('.row.active').forEach(e => e.classList.remove('active'));
  const target = $('#tree').querySelector(`[data-i="${i}"]`);
  if (!target) return;
  const row = target.matches('details') ? target.querySelector(':scope > summary') : target;
  if (row){
    row.classList.add('active');
    row.scrollIntoView({ block: 'nearest' });
  }
}

function breadcrumb(n){
  const b = BOOKS[st.b];
  const names = n._path.map(i => b.flat[i].t);
  if (n._d > 0 || n.c) names.push(n.t); else names.push(n.t);
  const head = `<b style="color:${b.accent}">${b.name}</b>`;
  const tail = names.slice(0, 3).map(t => `<i>/</i><span>${esc(t)}</span>`).join('');
  const last = names.length > 3 ? `<i>/</i><span>${esc(names[names.length - 1])}</span>` : '';
  $('#crumb').innerHTML = head + tail + last;
  document.title = `${n.t} · ${b.name}｜408 教材中心`;
}

/* 上一节 / 下一节：按一级节点（章）移动 */
function step(dir){
  const b = BOOKS[st.b];
  let k = 0;
  b.tops.forEach((t, idx) => { if (t._i <= st.i) k = idx; });
  const nxt = b.tops[k + dir];
  if (nxt) open(nxt._i);
}

/* ---------------- 跳页（输入的是书内页码） ---------------- */
function jumpTo(bookPage){
  const b = BOOKS[st.b];
  let p = parseInt(bookPage, 10);
  if (isNaN(p)) return;
  p = Math.max(1, Math.min(b.pages - b.off, p)) + b.off;   // 书内页 → PDF 页序
  const n = b.flat[st.i];
  if (n && p >= n.p && p <= n.e){
    const el = $('#pages').querySelector('#pg' + p);
    if (el){
      $('#pages').scrollTop = el.offsetTop - 10;
      st.page = p; $('#jump').value = jumpVal(b, p); updateProgress(); save();
      return;
    }
  }
  // 不在当前节点内：跳到包含该页的一级章节，再定位到页
  let top = b.tops[0];
  for (const t of b.tops) if (t.p <= p && p <= t.e) { top = t; break; }
  open(top._i, p);
}

// 按 PDF 页序直接定位（卷首页没有印刷页码，深链用这个）
function openPdf(p){
  const b = BOOKS[st.b];
  let best = null;
  for (const n of b.flat){
    if (n.p <= p && p <= n.e && (!best || n._d >= best._d)) best = n;
  }
  if (best) open(best._i, p); else open(firstChapter());
}

/* ---------------- 切书 ---------------- */
function switchBook(idx){
  if (idx === st.b) return;
  st.b = idx;
  document.documentElement.style.setProperty('--accent', BOOKS[idx].accent);
  renderTabs();
  const saved = load()[BOOKS[idx].k];
  renderTree();
  if (saved && BOOKS[idx].flat[saved.i]) open(saved.i, saved.p);
  else open(firstChapter());
  $('#prog').style.width = '0%';
}

function firstChapter(){
  const b = BOOKS[st.b];
  const t = b.tops.find(x => x.t.indexOf('第') === 0);
  return t ? t._i : 0;
}

/* ---------------- 存储 ---------------- */
function load(){ try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch(e){ return {}; } }
function save(){
  const all = load(), b = BOOKS[st.b];
  all[b.k] = { i: st.i, p: st.page };
  all.__last = b.k;
  try { localStorage.setItem(LS, JSON.stringify(all)); } catch(e){}
  writeHash();
}
function writeHash(){
  const q = ($('#q') && $('#q').value.trim());
  const b = BOOKS[st.b];
  const pn = bp(b, st.page);
  // 卷首页没有印刷页码，用 z 前缀存 PDF 页序，保证收藏后能回到原位
  const loc = pn === '—' ? `z${st.page}` : `${pn}`;
  const frag = (sMode === 'full' && q)
    ? `#q=${encodeURIComponent(q)}`
    : `#${b.k}/${loc}`;
  try { history.replaceState(null, '', frag); } catch(e){}
}
function readHash(){
  const m = (location.hash || '').match(/^#(ds|cn|os|co)\/(z?)(\d+)/);
  return m ? { k: m[1], p: +m[3], abs: m[2] === 'z' } : null;
}

/* ---------------- 搜索 ---------------- */
let sMode = 'toc';
$('#seg').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  sMode = btn.dataset.mode;
  $('#seg').querySelectorAll('button').forEach(b => b.classList.toggle('on', b === btn));
  $('#q').placeholder = sMode === 'toc' ? '搜索章节…' : '搜索正文（OCR 索引）…';
  const v = $('#q').value.trim();
  if (v) doSearch(v); else renderTree();
});

const txtCache = {};
function loadTxt(k){
  return new Promise(res => {
    if (txtCache[k]) return res(txtCache[k]);
    const s = document.createElement('script');
    s.src = `search/${k}.js`;
    s.onload = () => { txtCache[k] = window['__TXT_' + k] || []; res(txtCache[k]); };
    s.onerror = () => { txtCache[k] = []; res([]); };
    document.head.appendChild(s);
  });
}

let qTimer = null;
$('#q').addEventListener('input', e => {
  const v = e.target.value.trim();
  $('#qbox').classList.toggle('has', !!v);
  clearTimeout(qTimer);
  if (!v){ renderTree(); return; }
  qTimer = setTimeout(() => doSearch(v), sMode === 'full' ? 280 : 0);
});
$('#clr').onclick = () => { $('#q').value = ''; $('#qbox').classList.remove('has'); renderTree(); };

function doSearch(v){
  if (!v) return;
  sMode === 'toc' ? searchToc(v) : searchFull(v);
}

function searchToc(v){
  const b = BOOKS[st.b], low = v.toLowerCase();
  const hits = b.flat.filter(n => n.t.toLowerCase().includes(low)).slice(0, 300);
  if (!hits.length){
    $('#tree').innerHTML = `<div class="empty">目录里没有「${esc(v)}」<br>
      <span style="font-size:12px">切到「全文」可以搜索正文内容</span></div>`;
    return;
  }
  $('#tree').innerHTML = '<ul class="hit">' + hits.map(n => `
    <li data-i="${n._i}">
      <div class="h-b">${rngTxt(b, n)}</div>
      <div class="h-t">${esc(n.t)}</div>
      <div class="h-s">${n._path.map(i => esc(b.flat[i].t)).join(' › ') || b.name}</div>
    </li>`).join('') + '</ul>';
  $('#tree').querySelectorAll('li[data-i]').forEach(li => li.onclick = () => {
    const i = +li.dataset.i;
    clearSearch();
    open(i);
  });
}
function clearSearch(){
  $('#q').value = ''; $('#qbox').classList.remove('has'); renderTree();
}

async function searchFull(v){
  $('#tree').innerHTML = `<div class="empty">正在检索四本教材…</div>`;
  const low = v.toLowerCase().replace(/\s+/g, '');
  const groups = [];
  let total = 0;
  for (const b of BOOKS){
    const arr = await loadTxt(b.k);
    const hits = [];
    for (let i = 0; i < arr.length; i++){
      const raw = arr[i] || '';
      if (!raw) continue;
      if (raw.toLowerCase().replace(/\s+/g, '').indexOf(low) < 0) continue;
      total++;
      if (hits.length < 60) hits.push({ p: i + 1, raw, idx: normIdx(raw, v) });
    }
    if (hits.length) groups.push({ b, hits });
  }
  if (!total){
    $('#tree').innerHTML = `<div class="empty">没有找到「${esc(v)}」<br>
      <span style="font-size:12px">OCR 索引可能有缺字，换个关键词或缩短词试试</span></div>`;
    return;
  }
  let h = `<div class="sres">共 ${total} 页命中 · ${groups.length} 本教材</div>`;
  for (const g of groups){
    h += `<div class="ghd" style="color:${g.b.accent}"><span class="gdot" style="background:${g.b.accent}"></span>${g.b.name}<em>${g.hits.length === 60 ? '60+' : g.hits.length} 页</em></div>`;
    h += '<ul class="hit">' + g.hits.map(r => {
      const at = r.idx >= 0 ? r.idx : 0;
      const snip = r.raw.slice(Math.max(0, at - 26), at + 58).replace(/\s+/g, ' ');
      return `<li data-k="${g.b.k}" data-p="${r.p}">
        <div class="h-b">${pgTxt(g.b, r.p)}</div>
        <div class="h-s">…${hl(snip, v)}…</div></li>`;
    }).join('') + '</ul>';
  }
  $('#tree').innerHTML = h;
  $('#tree').querySelectorAll('li[data-p]').forEach(li => li.onclick = () => {
    const bi = BOOKS.findIndex(b => b.k === li.dataset.k);
    const p = +li.dataset.p;
    clearSearch();
    if (bi !== st.b){
      st.b = bi;
      document.documentElement.style.setProperty('--accent', BOOKS[bi].accent);
      renderTabs();
      renderTree();
    }
    jumpTo(p - BOOKS[bi].off);
  });
}
/* 忽略空白的定位：检索用去空白文本匹配，摘要定位也必须用同一套规则，
   否则 OCR 把词拆开（如「二叉 树」）时摘要会截到页首 */
function normIdx(s, v){
  const lv = v.toLowerCase().replace(/\s+/g, '');
  if (!lv) return -1;
  let i = 0;
  while (i < s.length){
    if (/\s/.test(s[i])){ i++; continue; }
    let j = i, m = 0;
    while (j < s.length && m < lv.length){
      const ch = s[j];
      if (/\s/.test(ch)){ j++; continue; }
      if (ch.toLowerCase() !== lv[m]) break;
      j++; m++;
    }
    if (m === lv.length) return i;
    i++;
  }
  return -1;
}
function normEnd(s, i, v){
  const lv = v.toLowerCase().replace(/\s+/g, '');
  let j = i, m = 0;
  while (j < s.length && m < lv.length){
    if (/\s/.test(s[j])){ j++; continue; }
    j++; m++;
  }
  return j;
}
function hl(s, v){
  const i = normIdx(s, v);
  if (i < 0) return esc(s);
  const j = normEnd(s, i, v);
  return esc(s.slice(0, i)) + '<mark>' + esc(s.slice(i, j)) + '</mark>' + esc(s.slice(j));
}

/* ---------------- 事件 ---------------- */
$('#jump').addEventListener('change', e => jumpTo(e.target.value));
$('#jump').addEventListener('keydown', e => { if (e.key === 'Enter'){ jumpTo(e.target.value); e.target.blur(); } });
$('#prevSec').onclick = () => step(-1);
$('#nextSec').onclick = () => step(1);
$('#totop').onclick = () => $('#pages').scrollTo({ top: 0, behavior: 'smooth' });

$('#btnTheme').onclick = () => {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');
  try { localStorage.setItem('s408.theme', dark ? 'light' : 'dark'); } catch(e){}
};
$('#btnToc').onclick = () => { $('#side').classList.toggle('open'); $('#scrim').classList.toggle('on'); };
$('#scrim').onclick = closeSide;
function closeSide(){ $('#side').classList.remove('open'); $('#scrim').classList.remove('on'); }

let lastScrollSave = 0, hlTimer = null;
$('#pages').addEventListener('scroll', () => {
  const box = $('#pages');
  const top = box.scrollTop + 60;
  let cur = null;
  for (const f of box.querySelectorAll('.pg')){
    if (f.offsetTop <= top) cur = +f.dataset.p; else break;
  }
  if (cur && cur !== st.page){
    st.page = cur;
    $('#jump').value = jumpVal(BOOKS[st.b], cur);
    updateProgress();
    if (Date.now() - lastScrollSave > 900){ lastScrollSave = Date.now(); save(); }
    clearTimeout(hlTimer);
    hlTimer = setTimeout(() => syncSection(cur), 220);
  }
  $('#totop').classList.toggle('on', box.scrollTop > 600);
});

/* 滚动时把高亮同步到当前页所属的最深小节 */
function syncSection(p){
  const b = BOOKS[st.b];
  let start = 0, end = b.flat.length;
  b.tops.forEach((t, k) => {
    if (t._i <= st.i) start = t._i;
    if (t._i > st.i && end === b.flat.length) end = t._i;
  });
  let best = null;
  for (let i = start; i < end; i++){
    const n = b.flat[i];
    if (n.p <= p && p <= n.e && (!best || n._d >= best._d)) best = n;
  }
  if (best && best._i !== st.i){
    st.i = best._i;
    expandPath(best._i);
    markActive(best._i);
    breadcrumb(best);
    save();
  }
}

function updateProgress(){
  const b = BOOKS[st.b];
  $('#prog').style.width = (st.page / b.pages * 100).toFixed(2) + '%';
}

document.addEventListener('keydown', e => {
  if (e.target.matches('input,textarea')) return;
  const box = $('#pages');
  if (e.key === 'ArrowRight') box.scrollBy({ top: box.clientHeight * .86, behavior: 'smooth' });
  else if (e.key === 'ArrowLeft') box.scrollBy({ top: -box.clientHeight * .86, behavior: 'smooth' });
  else if (e.key === ']') step(1);
  else if (e.key === '[') step(-1);
  else if (e.key === '/'){ e.preventDefault(); $('#q').focus(); }
  else if (e.key === 'Escape'){ clearSearch(); closeSide(); }
});

/* ---------------- 启动 ---------------- */
// 解析地址栏深链：支持 #q=关键词、#ds/126（印刷页）、#ds/z5（PDF 页，卷首用）
function applyHash(all){
  const qm = (location.hash || '').match(/^#q=(.+)$/);
  if (qm){
    const kw = decodeURIComponent(qm[1]);
    sMode = 'full';
    $('#seg').querySelectorAll('button').forEach(x => x.classList.toggle('on', x.dataset.mode === 'full'));
    $('#q').value = kw; $('#qbox').classList.add('has');
    const s0 = all[BOOKS[st.b].k];
    if (s0 && BOOKS[st.b].flat[s0.i]) open(s0.i, s0.p); else open(firstChapter());
    doSearch(kw);
    return true;
  }
  const h = readHash();
  if (!h) return false;
  const bi = Math.max(0, BOOKS.findIndex(b => b.k === h.k));
  if (bi !== st.b){
    st.b = bi;
    document.documentElement.style.setProperty('--accent', BOOKS[bi].accent);
    renderTabs(); renderTree();
  }
  if (h.abs){
    openPdf(Math.max(1, Math.min(BOOKS[st.b].pages, h.p)));
  } else {
    const b = BOOKS[st.b];
    // 书内页码夹取到有效范围：越界时落到首/末页，而不是静默弹回卷首
    const pdf = Math.max(1, Math.min(b.pages, h.p + b.off));
    let top = b.tops[0];
    for (const t of b.tops) if (t.p <= pdf && pdf <= t.e) { top = t; break; }
    open(top._i, pdf);
  }
  return true;
}

(function init(){
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  try {
    if (localStorage.getItem('s408.theme') === 'dark')
      document.documentElement.setAttribute('data-theme', 'dark');
  } catch(e){}
  const all = load();
  const bi = Math.max(0, BOOKS.findIndex(b => b.k === (all.__last || 'ds')));
  st.b = bi;
  document.documentElement.style.setProperty('--accent', BOOKS[bi].accent);
  renderTabs();
  renderTree();
  if (applyHash(all)) {
    window.addEventListener('hashchange', () => applyHash(load()));
    return;
  }
  const s = all[BOOKS[bi].k];
  if (s && BOOKS[bi].flat[s.i]) open(s.i, s.p); else open(firstChapter());
  window.addEventListener('hashchange', () => applyHash(load()));
})();
</script>
</body>
</html>
"""

html = TPL.replace("__BOOKS__", data)
out = f"{BASE}/index.html"
open(out, "w").write(html)
total_nodes = sum(len([1 for _ in range(0)]) for _ in [])
print("写出", out, f"{len(html.encode()) / 1024:.0f}KB")
for b in books:
    print(f"  {b['name']}: {b['pages']} 页, 一级 {len(b['ch'])} 节点, JSON 字符 {len(json.dumps(b['ch'], ensure_ascii=False))}")
