#!/usr/bin/env node
/* =========================================================================
 * 根路径短链生成器
 *
 *   作用：把深层目录里的页面，映射成域名根下一层的短地址：
 *          https://icefocus.cn/jinrong        → 国际金融 · 学习助手
 *          https://icefocus.cn/jinrong-bank   → 国际金融 · 历年真题库
 *
 *        生成的产物：
 *          · <短名>.html  —— 根目录下的跳板页（真实文件，优先生效）
 *          · links.html   —— 一页式收藏导航，短链一览 + 点击直达 + 一键复制
 *
 *   用法：
 *          node script/make-shortlinks.js
 *
 *   为什么用「跳板页」而不是改 index.html 做路由：
 *     根路径访问在任何托管配置下都会先命中真实文件，不依赖
 *     Cloudflare 那层「未命中路径回落到首页」的兜底规则；
 *     将来兜底规则被移除，这些短链依然有效。
 *
 *   注意：短链地址不带 .html（GitHub Pages 会把 /x.html 308 到 /x，
 *        真实文件 x.html 用 /x 访问是 200 直出，不会多一跳）。
 * ========================================================================= */
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ORIGIN = 'https://icefocus.cn';

/* ---------------------------------------------------------------------
 * 短链表：唯一需要手工维护的地方
 *   alias  根路径短名（不要带 .html）
 *   url    目标页（相对站点根，含空格时用 %20）
 *   title  显示名
 *   group  导航页分组
 * ------------------------------------------------------------------- */
const SHORTCUTS = [
  /* ---- 学习 ---- */
  { alias: 'exam',            url: '/examination/',                                    title: '学习总入口',            group: '学习', note: '自动发现全部课程' },
  { alias: 'jinrong',         url: '/examination/International%20Finance/study',       title: '国际金融 · 学习助手',    group: '学习' },
  { alias: 'jinrong-bank',    url: '/examination/International%20Finance/bank',        title: '国际金融 · 历年真题库',  group: '学习' },
  { alias: 'jinrong-outline', url: '/examination/International%20Finance/outline',     title: '国际金融 · 0基础到精通', group: '学习' },
  { alias: 'xifang',          url: '/examination/Western%20Economics/study',           title: '西方经济学 · 学习助手',  group: '学习' },
  { alias: 'xifang-bank',     url: '/examination/Western%20Economics/bank',            title: '西方经济学 · 历年真题库', group: '学习' },
  { alias: 'xifang-outline',  url: '/examination/Western%20Economics/outline',         title: '西方经济学 · 0基础到精通', group: '学习' },
  { alias: 'unity',           url: '/examination/Unity/',                          title: 'Unity 引擎基础 · 交互课件', group: '学习', note: '27 模块 · 320 张图' },
  { alias: 'caiwu',           url: '/examination/Financial%20Management/',          title: '财务管理学 · 公式手册',  group: '学习', note: '8 章 · 152 条 LaTeX 公式' },
  { alias: 'unity-book',      url: '/examination/Unity-Book/',                     title: 'Unity 基础小框架 · 图解教科书', group: '学习', note: '75 课时 · 章节式阅读' },
  { alias: 'csharp-map',      url: '/examination/CSharp-Map/',                     title: 'C# 知识体系 · 交互思维导图', group: '学习', note: '总览 + 20 张分册' },
  { alias: 'csharp-book',     url: '/examination/CSharp-Book/',                    title: 'C# 语言基础 · 交互课件', group: '学习', note: '8 模块 · 292 代码框' },
  { alias: 'linalg',          url: '/examination/Linear-Algebra-Strang/',           title: '线性代数 · Strang 第6版', group: '学习', note: '438 页原书页 + 34 个交互实验' },
  { alias: 'linalg-ty',       url: '/examination/Linear-Algebra-Strang/retype/%E9%98%85%E8%AF%BB.html', title: '线性代数 · 文字重排版', group: '学习', note: '原书文字重排 · 不用扫描图' },
  { alias: 'linalg-tu',       url: '/examination/Linear-Algebra-Strang/%E5%9B%BE%E8%A7%A3%E7%89%88', title: '线性代数 · 图解精讲', group: '学习', note: '186 个知识点 · 可全文搜索' },

  /* ---- 工具 ---- */
  { alias: 'task',            url: '/tasksync/',                                       title: '任务同步站',            group: '工具' },
  { alias: 'tools',           url: '/tool/',                                           title: '工具箱',                group: '工具', note: '工具汇总入口' },
  { alias: 'imgcut',          url: '/tool/img-cut/',                                   title: 'AI 图片切图',           group: '工具', note: '去背景 + 自动分块导出' },
  { alias: 'psd',             url: '/tool/psd-rename/',                                title: '投放图 PSD 生成',       group: '工具' },
  { alias: 'num',             url: '/tool/number-gen/',                                title: '数值随机生成器',        group: '工具', note: '六档 8 组 · 位数固定' },

  /* ---- 皮肤 ---- */
  { alias: 'skin0',           url: '/ThemedSkin/default',                              title: '首页皮肤 · 默认',       group: '皮肤' },
  { alias: 'skin1',           url: '/ThemedSkin/ThemedSkin01',                         title: '首页皮肤 · 游戏视觉',   group: '皮肤' },
  { alias: 'skin2',           url: '/ThemedSkin/ThemedSkin02',                         title: '首页皮肤 · 设计印刷',   group: '皮肤' }
];

/* 短名合法性：只允许小写字母、数字、- 和 _，避免与现有文件冲突被覆盖 */
const SAFE = /^[a-z0-9][a-z0-9_-]*$/;

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* 目标页是否真实存在（含空格路径直接查文件系统） */
function targetExists(url) {
  const rel = decodeURIComponent(url.split('?')[0].split('#')[0]);
  const abs = path.join(ROOT, rel);
  if (fs.existsSync(abs)) return true;
  return fs.existsSync(abs + '.html');
}

/* ---------------- 跳板页 ---------------- */
function jumperPage(item) {
  const target = item.url;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,follow">
<title>正在进入 · ${esc(item.title)}</title>
<link rel="canonical" href="${ORIGIN}${esc(target)}">
<meta name="theme-color" content="#0b1020">
<script>
/* 短链跳板：由 script/make-shortlinks.js 生成，请勿手工编辑。
   icefocus.cn/${esc(item.alias)}  →  ${esc(target)}
   用 replace 而不是 href，避免在历史上留一层“跳转中”后退页。 */
(function () {
  'use strict';
  var t = ${JSON.stringify(target)};
  try {
    /* 保留 ?query 与 #hash：登录凭据走 #t=… 的链接靠这一步不丢 */
    location.replace(t + location.search + location.hash);
  } catch (e) {
    location.href = t;
  }
})();
</script>
<style>
  html,body{margin:0;height:100%;background:#0b1020;color:#8b9ec2}
  body{display:grid;place-items:center;
    font:14px/1.9 -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif}
  .b{text-align:center;padding:24px}
  .t{color:#e8eefb;font-size:15px;font-weight:600;letter-spacing:.02em;margin-bottom:6px}
  .bar{margin:14px auto 0;width:110px;height:2px;border-radius:2px;
    background:linear-gradient(90deg,#38bdf8,#a78bfa);animation:p 1.1s ease-in-out infinite}
  @keyframes p{0%{transform:scaleX(.25);opacity:.4}50%{transform:scaleX(1);opacity:1}100%{transform:scaleX(.25);opacity:.4}}
  a{color:#38bdf8;text-decoration:none}a:hover{text-decoration:underline}
</style>
</head>
<body>
  <div class="b">
    <div class="t">${esc(item.title)}</div>
    <div>正在进入 <a href="${esc(target)}">${esc(target)}</a></div>
    <div class="bar"></div>
  </div>
</body>
</html>
`;
}

/* ---------------- 收藏导航页 ---------------- */
function linksPage(items) {
  const groups = [];
  items.forEach(it => {
    let g = groups.find(x => x.name === it.group);
    if (!g) groups.push(g = { name: it.group, list: [] });
    g.list.push(it);
  });

  const cards = groups.map(g => {
    /* 卡片用「覆盖层链接」而不是外层 <a>：徽标本身也是 <a>，两个 <a> 嵌套会被
       HTML 解析器拆开，导致卡片布局塌掉。覆盖层还能保留中键新标签页打开。 */
    const rows = g.list.map(it => `
      <div class="card" data-alias="${esc(it.alias)}" data-real="${esc(it.url)}">
        <a class="hit" href="${esc(it.url)}" aria-label="${esc(it.title)}（进入对应页面）"></a>
        <span class="cn"><b>${esc(it.title)}</b>${it.note ? `<i>${esc(it.note)}</i>` : ''}</span>
        <span class="acts">
          <a class="cs" href="/${esc(it.alias)}" title="点击进入 /${esc(it.alias)}（按住 ⌘/Ctrl 再点是复制短链）">icefocus.cn/${esc(it.alias)}</a>
          <span class="cu" title="复制真实页面地址（建书签用这个）">
            <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true"><rect x="5.6" y="5.6" width="7.8" height="7.8" rx="1.7" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10.4 5.6V3.2A1.7 1.7 0 0 0 8.7 1.5H3.2A1.7 1.7 0 0 0 1.5 3.2v5.5a1.7 1.7 0 0 0 1.7 1.7h2.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          </span>
        </span>
      </div>`).join('');
    return `<section><h2>${esc(g.name)}</h2><div class="grid">${rows}\n      </div></section>`;
  }).join('\n    ');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0b1020">
<meta name="description" content="ICEFOCUS 短链导航：每个地址都可以单独收藏。">
<link rel="canonical" href="${ORIGIN}/links">
<title>短链导航 · ICEFOCUS</title>
<link rel="icon" href="assets/icon.svg">
<link rel="manifest" href="manifest.webmanifest">
<meta name="apple-mobile-web-app-capable" content="yes">
<style>
:root{--bg:#0b1020;--ink:#e8eefb;--dim:#8b9ec2;--dim2:#5c6d8f;
  --a1:#38bdf8;--a2:#a78bfa;--a3:#34d399;--line:rgba(140,170,220,.16);--card:rgba(19,26,46,.66)}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%}
body{background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;
  font:15px/1.6 -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei","Segoe UI",Inter,sans-serif;
  padding:0 0 64px}
.glow{position:fixed;inset:-20% -10%;z-index:0;pointer-events:none;
  background:radial-gradient(38% 42% at 18% 18%,rgba(56,189,248,.16),transparent 62%),
             radial-gradient(36% 40% at 84% 22%,rgba(167,139,250,.16),transparent 62%),
             radial-gradient(46% 44% at 50% 98%,rgba(52,211,153,.09),transparent 66%);
  filter:blur(22px)}
.wrap{position:relative;z-index:1;max-width:900px;margin:0 auto;padding:0 18px}
header{padding:44px 0 8px}
.k{font-size:11.5px;letter-spacing:.34em;color:var(--dim2);text-transform:uppercase}
h1{margin:8px 0 6px;font-size:26px;letter-spacing:.02em;font-weight:800}
.sub{color:var(--dim);font-size:13.5px}
.sub code{background:rgba(140,170,220,.12);color:#cfe0ff;padding:1px 6px;border-radius:5px;font-size:12.5px}
h2{margin:30px 0 10px;font-size:12px;letter-spacing:.22em;color:var(--dim2);font-weight:600}
.grid{display:grid;grid-template-columns:1fr;gap:8px}
@media(min-width:620px){.grid{grid-template-columns:1fr 1fr}}
.card{display:flex;align-items:center;justify-content:space-between;gap:12px;
  padding:12px 14px;border-radius:12px;text-decoration:none;color:inherit;
  background:var(--card);border:1px solid var(--line);transition:.16s;position:relative}
.card:hover{border-color:rgba(56,189,248,.45);transform:translateY(-1px);
  box-shadow:0 10px 26px -16px rgba(56,189,248,.6)}
/* 整卡可点的透明覆盖层：放在内容之下、按钮之上 */
.card .hit{position:absolute;inset:0;border-radius:inherit;z-index:1}
.card .hit:focus-visible{outline:2px solid var(--a1);outline-offset:2px}
.cn{display:flex;flex-direction:column;min-width:0}
.cn b{font-size:14px;font-weight:600;letter-spacing:.01em}
.cn i{font-style:normal;font-size:11.5px;color:var(--dim2);margin-top:1px}
.acts{display:flex;align-items:center;gap:6px;flex:none;position:relative;z-index:2}
.cs{flex:none;font-size:11.5px;color:var(--a1);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  background:rgba(56,189,248,.09);border:1px solid rgba(56,189,248,.22);
  padding:3px 8px;border-radius:999px;opacity:.9;white-space:nowrap;cursor:pointer;
  text-decoration:none;display:inline-block}
.cs:hover{background:rgba(56,189,248,.18);border-color:rgba(56,189,248,.5);opacity:1}
.cu{flex:none;width:24px;height:22px;display:grid;place-items:center;border-radius:6px;
  font-size:12px;color:var(--dim2);border:1px solid var(--line);cursor:pointer;transition:.16s}
.cu:hover{color:var(--a3);border-color:rgba(52,211,153,.45);background:rgba(52,211,153,.08)}
.cu.ok{color:var(--a3);border-color:rgba(52,211,153,.55)}
@media(max-width:560px){
  .card{flex-direction:column;align-items:stretch;gap:8px}
  .acts{justify-content:space-between}
  .cn b{font-size:13.5px}
}
/* 本页地址条 */
.addr{display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  margin-top:6px;padding:10px 12px;border-radius:12px;
  background:linear-gradient(90deg,rgba(56,189,248,.10),rgba(167,139,250,.07));
  border:1px solid rgba(56,189,248,.24)}
.addr .al{font-size:10.5px;letter-spacing:.2em;color:var(--dim2);text-transform:uppercase;flex:none}
.addr code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;color:#cfe0ff;
  background:rgba(11,16,32,.55);padding:4px 10px;border-radius:8px;
  border:1px solid rgba(140,170,220,.18);white-space:nowrap}
.addr .cp{margin-left:auto;font:inherit;font-size:12px;color:var(--a1);cursor:pointer;
  background:rgba(56,189,248,.12);border:1px solid rgba(56,189,248,.3);
  border-radius:999px;padding:5px 14px;transition:.16s;white-space:nowrap}
.addr .cp:hover{background:rgba(56,189,248,.2)}
.addr .cp.ok{color:var(--a3);border-color:rgba(52,211,153,.5);background:rgba(52,211,153,.12)}
.addr .alt{flex-basis:100%;font-size:11.5px;color:var(--dim2);line-height:1.9}
.addr .alt code{font-size:11.5px;padding:3px 8px}
@media(max-width:520px){
  .addr{gap:8px;padding:9px 10px}
  .addr code{font-size:11.5px}
  .addr .cp{margin-left:0;order:3;flex-basis:100%;text-align:center;padding:7px 14px}
}
footer{margin-top:34px;padding-top:16px;border-top:1px solid var(--line);
  color:var(--dim2);font-size:12px;line-height:2}
footer b{color:var(--dim);font-weight:600}
</style>
</head>
<body>
<div class="glow"></div>
<div class="wrap">
  <header>
    <div class="k">ICEFOCUS · SHORT LINKS</div>
    <h1>短链导航</h1>
    <div class="sub">点开即进入对应页面；每个 <code>icefocus.cn/短名</code> 都能单独收藏。</div>
    <div class="addr">
      <span class="al">本页地址</span>
      <code id="addrMain">${ORIGIN}/links</code>
      <button class="cp" id="cpMain" type="button">复制地址</button>
      <div class="alt" id="addrAlt" hidden></div>
    </div>
  </header>
    ${cards}
  <footer>
    <b>地址规则</b>：短名不带 <code>.html</code>；只有目录才能以 <code>/</code> 结尾。<br>
    <b>怎么用</b>：点卡片任意处，或点右侧短名徽标，都会进入对应页面；<br>
    短名徽标上按住 <code>⌘/Ctrl</code> 再点是复制短链，<code>⧉</code> 复制真实页面地址（建书签用这个）。<br>
    <b>双域名</b>：<code>icefocus.cn/短名</code> 与 <code>icefocus-G.github.io/短名</code> 等价，本页复制的是当前域名的地址。<br>
    <b>维护方式</b>：改 <code>script/make-shortlinks.js</code> 里的 <code>SHORTCUTS</code> 表，<br>
    然后运行 <code>node script/make-shortlinks.js</code> 重新生成短链页与本导航页。
  </footer>
</div>
<script>
/* 卡片交互：
   · 整卡由透明覆盖层 .hit 负责「进入对应页面」（可中键新标签打开）
   · 短名徽标本身是 <a href="/短名">，点一下直接进短链；按住 ⌘/Ctrl 再点才是复制短链
   · ⧉ 复制真实页面地址 */
function copyText(s, done) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(s).then(done, function () {});
  } else {
    var ta = document.createElement('textarea');
    ta.value = s; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (err) {}
    document.body.removeChild(ta);
  }
}

document.querySelectorAll('.card').forEach(function (card) {
  /* 跟随当前域名：icefocus.cn 显示/复制 cn 地址，github.io 显示/复制 github.io 地址 */
  var alias    = card.getAttribute('data-alias') || '';
  var shortUrl = location.origin + '/' + alias;
  var realUrl  = location.origin + (card.getAttribute('data-real') || '');

  var cs = card.querySelector('.cs');
  if (cs) {
    cs.textContent = location.host + '/' + alias;   // 静态文案只写了 cn，这里按实际域名纠正
    cs.addEventListener('click', function (e) {
      /* 不拦默认行为＝跳转；只有按住修饰键时才改成复制短链 */
      if (!(e.metaKey || e.ctrlKey || e.altKey)) return;
      e.preventDefault();
      copyText(shortUrl, function () {
        var old = cs.textContent;
        cs.textContent = '已复制 ✓';
        setTimeout(function () { cs.textContent = old; }, 1200);
      });
    });
  }

  var cu = card.querySelector('.cu');
  if (cu) {
    var html = cu.innerHTML;
    cu.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      copyText(realUrl, function () {
        cu.classList.add('ok');
        cu.textContent = '✓';
        setTimeout(function () { cu.classList.remove('ok'); cu.innerHTML = html; }, 1200);
      });
    });
  }
});

/* 本页地址条：主地址固定为正式域名，若当前在别的域名下打开，补一行等价地址 */
(function () {
  var CANON = ${JSON.stringify(ORIGIN + '/links')};
  var cp  = document.getElementById('cpMain');
  var alt = document.getElementById('addrAlt');
  if (!cp) return;

  if (location.host && location.host !== ${JSON.stringify(ORIGIN.replace(/^https?:\/\//, ''))}) {
    alt.hidden = false;
    alt.innerHTML = '当前域名等价地址：<code>' + location.origin + '/links</code>　（当前打开的是这个，收藏它也等效）';
  }

  cp.addEventListener('click', function () {
    copyText(CANON, function () {
      var old = cp.textContent;
      cp.classList.add('ok');
      cp.textContent = '已复制 ✓';
      setTimeout(function () { cp.classList.remove('ok'); cp.textContent = old; }, 1400);
    });
  });
})();
</script>
</body>
</html>
`;
}

/* ---------------- 主流程 ---------------- */
function main() {
  const problems = [];
  const seen = Object.create(null);
  const items = [];

  SHORTCUTS.forEach(it => {
    if (!SAFE.test(it.alias)) { problems.push('短名不合法：' + it.alias); return; }
    if (seen[it.alias]) { problems.push('短名重复：' + it.alias); return; }
    seen[it.alias] = 1;
    if (it.alias === 'links' || it.alias === 'index') {
      problems.push('短名与既有页面冲突：' + it.alias); return;
    }
    if (!targetExists(it.url)) { problems.push('目标不存在：' + it.alias + ' → ' + it.url); return; }
    items.push(it);
  });

  if (problems.length) {
    console.error('中止，先修正以下问题：');
    problems.forEach(p => console.error('  · ' + p));
    process.exit(1);
  }

  let written = 0;
  items.forEach(it => {
    const out = path.join(ROOT, it.alias + '.html');
    fs.writeFileSync(out, jumperPage(it), 'utf8');
    written++;
  });

  const linkOut = path.join(ROOT, 'links.html');
  fs.writeFileSync(linkOut, linksPage(items), 'utf8');

  console.log('已生成 ' + written + ' 个根路径短链：');
  items.forEach(it => console.log('  ' + (ORIGIN + '/' + it.alias).padEnd(46) + ' → ' + it.url));
  console.log('');
  console.log('已写入：links.html（短链导航页）');
  console.log('提示：' + (ORIGIN + '/links') + ' 可直达导航页');
}

main();
