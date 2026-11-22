/* 不背文字 · 小学语文生字表
 * 复刻「不背单词」的记忆模式：卡片猜测 → 翻面字源讲解 → 三级标记 → 记忆曲线调度 → 组末测试
 * 与英文版不同的是：这里的记忆单位是「一个字」，靠部首、部件、字理来记形与义。
 */
(function () {
  'use strict';

  /* =========================================================
     0. 工具
     ========================================================= */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ymd = d => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  const TODAY = () => ymd(new Date());
  function dayShift(n) { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d); }
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* =========================================================
     1. 字库
     ========================================================= */
  const CHARS = window.__CHARS__ || {};
  const BOOKS = window.__ZI_BOOKS__ || [];
  const ZI = {};
  for (let g = 1; g <= 6; g++) {
    const d = window['__ZI_' + g + '__'];
    if (d && Array.isArray(d.list)) {
      d.list.forEach(it => { it.grade = g; });
      ZI[g] = d.list;
    }
  }
  const bookZi = g => ZI[g] || [];
  const zkey = it => it.grade + '|' + it.c;
  const cn = n => ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][n - 1] || n;

  /* =========================================================
     2. 状态
     ========================================================= */
  const KEY = 'buhanzi.v1';
  const DEF = () => ({
    bookId: 1,
    perGroup: 12,
    autoSpeak: true,
    showChars: true,
    coin: 0,
    streak: 0,
    streakLast: '',
    days: {},          // date -> {n,r,c,t}
    prog: {},          // g|字 -> {box,due,seen,ok,wrong,last}
    log: []            // [{d,k,m}]
  });
  let S = load();
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return DEF();
      const o = JSON.parse(raw);
      return Object.assign(DEF(), o);
    } catch (e) { return DEF(); }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { }
  }
  function day() {
    const t = TODAY();
    if (!S.days[t]) S.days[t] = { n: 0, r: 0, c: 0, t: 0 };
    return S.days[t];
  }
  function markStreak() {
    const t = TODAY();
    if (S.streakLast === t) return;
    S.streak = (S.streakLast === dayShift(-1)) ? (S.streak || 0) + 1 : 1;
    S.streakLast = t;
  }

  /* =========================================================
     3. 记忆曲线
     ========================================================= */
  const INTS = [0, 1, 2, 4, 7, 15, 30, 60, 120];
  function plan(it, m) {
    const k = zkey(it);
    const p = S.prog[k] || { box: 0, due: TODAY(), seen: 0, ok: 0, wrong: 0 };
    p.seen = (p.seen || 0) + 1;
    p.last = m;
    if (m === 'known') {
      p.box = clamp((p.box || 0) + 1, 1, INTS.length - 1);
      p.ok = (p.ok || 0) + 1;
      p.due = dayShift(INTS[p.box]);
    } else if (m === 'fuzzy') {
      p.box = clamp(p.box || 1, 1, 3);
      p.due = dayShift(1);
      p.wrong = (p.wrong || 0) + 1;
    } else {
      p.box = 1; p.due = dayShift(1);
      p.wrong = (p.wrong || 0) + 1;
    }
    S.prog[k] = p;
    S.log.unshift({ d: TODAY(), k: k, m: m });
    if (S.log.length > 400) S.log.length = 400;
  }
  const progOf = it => S.prog[zkey(it)];
  const isNew = it => !progOf(it);
  function dueList(g) {
    const t = TODAY();
    return bookZi(g).filter(it => { const p = progOf(it); return p && p.due <= t; })
      .sort((a, b) => (progOf(a).due < progOf(b).due ? -1 : 1));
  }
  function newList(g) { return bookZi(g).filter(it => isNew(it)); }
  function learnedCount(g) { return bookZi(g).filter(it => progOf(it)).length; }

  /* =========================================================
     4. 发音
     ========================================================= */
  let voiceCache = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return null;
    if (voiceCache) return voiceCache;
    const vs = speechSynthesis.getVoices() || [];
    voiceCache = vs.find(v => /zh[-_]CN/i.test(v.lang) && /(Xiaoxiao|Huihui|Ting|Yaoyao|Kangkang|Chinese)/i.test(v.name))
      || vs.find(v => /zh/i.test(v.lang)) || null;
    return voiceCache;
  }
  function speak(t, rate) {
    if (!('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(t);
      u.lang = 'zh-CN'; u.rate = rate || 0.8; u.pitch = 1.02;
      const v = pickVoice(); if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { }
  }
  if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => { voiceCache = null; pickVoice(); };

  /* =========================================================
     5. 壁纸（每日一换，纯 SVG 生成）
     ========================================================= */
  const WALLS = [
    `<path d="M0 620 L150 470 L250 540 L360 400 L470 520 L580 450 L680 560 L680 900 L0 900Z" fill="#c9c2ac" opacity=".30"/>
     <path d="M0 690 L120 590 L230 650 L330 560 L450 660 L560 600 L680 690 L680 900 L0 900Z" fill="#a8a08a" opacity=".26"/>
     <circle cx="520" cy="190" r="62" fill="#e0b38c" opacity=".30"/>`,
    `<g stroke="#7d8a6a" stroke-width="7" opacity=".22" fill="none" stroke-linecap="round">
      <path d="M150 900 C140 640 165 400 150 120"/><path d="M300 900 C315 660 290 430 305 200"/>
      <path d="M470 900 C455 700 480 480 465 300"/></g>
     <g stroke="#7d8a6a" stroke-width="2.4" opacity=".3" fill="none" stroke-linecap="round">
      <path d="M152 300 C210 280 250 300 285 270"/><path d="M155 430 C100 405 70 425 40 400"/>
      <path d="M303 380 C360 360 400 385 435 350"/><path d="M466 470 C520 450 560 470 600 440"/></g>`,
    `<circle cx="500" cy="170" r="72" fill="#d9b884" opacity=".28"/>
     <g stroke="#8f9aa3" fill="none" stroke-width="2" opacity=".28">
      <path d="M0 560 Q85 535 170 560 T340 560 T510 560 T680 560"/>
      <path d="M0 620 Q85 595 170 620 T340 620 T510 620 T680 620"/>
      <path d="M0 680 Q85 655 170 680 T340 680 T510 680 T680 680"/>
      <path d="M0 740 Q85 715 170 740 T340 740 T510 740 T680 740"/></g>`,
    `<g stroke="#a39472" stroke-width="3" opacity=".22" fill="none">
      <path d="M0 640 Q340 590 680 640"/><path d="M0 700 Q340 650 680 700"/>
      <path d="M0 760 Q340 710 680 760"/><path d="M0 820 Q340 770 680 820"/>
      <path d="M120 600 L60 900"/><path d="M300 600 L280 900"/><path d="M470 600 L510 900"/></g>
     <circle cx="160" cy="200" r="58" fill="#e2bb95" opacity=".26"/>`,
    `<g stroke="#8a7a6a" stroke-width="3" opacity=".26" fill="none" stroke-linecap="round">
      <path d="M680 560 C560 520 470 430 420 300"/><path d="M520 470 C480 430 470 380 460 340"/>
      <path d="M580 505 C610 460 650 440 680 425"/></g>
     <g fill="#c98b7d" opacity=".34">
      <circle cx="420" cy="300" r="13"/><circle cx="462" cy="338" r="10"/><circle cx="680" cy="425" r="11"/>
      <circle cx="505" cy="392" r="8"/><circle cx="560" cy="470" r="9"/></g>`,
    `<g fill="#8d8779" opacity=".30">
      <circle cx="90" cy="120" r="2.6"/><circle cx="210" cy="80" r="2"/><circle cx="330" cy="150" r="3"/>
      <circle cx="470" cy="90" r="2.2"/><circle cx="580" cy="160" r="2.6"/><circle cx="620" cy="60" r="1.8"/>
      <circle cx="150" cy="240" r="1.8"/><circle cx="390" cy="230" r="2.4"/><circle cx="520" cy="270" r="1.8"/>
      <circle cx="60" cy="330" r="2"/><circle cx="640" cy="330" r="2.2"/></g>
     <path d="M0 620 L680 560 L680 900 L0 900Z" fill="#b5ac96" opacity=".18"/>`
  ];
  function paintWall() {
    const d = new Date();
    const seed = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
    const svg = `<svg viewBox="0 0 680 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f7f1e3"/><stop offset=".55" stop-color="#f2ecdf"/><stop offset="1" stop-color="#e9e0cf"/>
      </linearGradient></defs>
      <rect width="680" height="900" fill="url(#g)"/>
      ${WALLS[seed % WALLS.length]}
      <rect width="680" height="900" fill="url(#g)" opacity=".18"/>
    </svg>`;
    $('#wall').innerHTML = svg;
  }

  /* =========================================================
     6. 路由
     ========================================================= */
  let view = 'home';
  const TITLE = { home: '不背文字', learn: '学字', test: '测字', books: '字书', me: '我的' };
  function go(v) {
    view = v;
    ['home', 'learn', 'test', 'books', 'me'].forEach(k => { $('#v-' + k).hidden = (k !== v); });
    $('#tbTitle').textContent = TITLE[v] || '';
    $('#btnBack').hidden = !(v === 'learn' || v === 'test');
    $$('#tabbar button').forEach(b => b.classList.toggle('on', b.dataset.go === v));
    $('#tabbar').style.display = (v === 'learn' || v === 'test') ? 'none' : 'flex';
    $('#app').classList.toggle('immersive', v === 'learn' || v === 'test');
    $('#v-' + v).scrollTop = 0;
    if (v === 'home') renderHome();
    if (v === 'books') renderBooks();
    if (v === 'me') renderMe();
  }

  /* =========================================================
     7. 主页
     ========================================================= */
  function renderHome() {
    const g = S.bookId, book = BOOKS.find(b => b.id === g) || BOOKS[0];
    const due = dueList(g), fresh = newList(g);
    const plan = Math.min(S.perGroup, fresh.length);
    const bookTotal = bookZi(g).length, done = learnedCount(g);
    const todayD = day();
    const ringPct = Math.round(done / bookTotal * 100);

    const hour = new Date().getHours();
    const greet = hour < 6 ? '夜深了' : hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';

    const html = `
    <div class="greet">
      <div class="h1">${greet}，今天认几个字？</div>
      <div class="sub">${esc(book.name)} · ${esc(book.ref)}</div>
    </div>

    <div class="card today">
      <div class="today-top">
        <div>
          <div class="today-label">今 日 任 务</div>
          <div class="task-row">
            <div class="task-num">${due.length + plan}<small>字</small></div>
            <div class="task-sub">复习 ${due.length} · 新字 ${plan}</div>
          </div>
        </div>
        <div class="ring">
          <svg width="64" height="64"><circle cx="32" cy="32" r="28" fill="none" stroke="rgba(36,31,26,.08)" stroke-width="3"/>
          <circle cx="32" cy="32" r="28" fill="none" stroke="#b8402e" stroke-width="3" stroke-linecap="round"
            stroke-dasharray="${(2 * Math.PI * 28).toFixed(1)}" stroke-dashoffset="${(2 * Math.PI * 28 * (1 - ringPct / 100)).toFixed(1)}"/></svg>
          <div class="ring-txt">${ringPct}%</div>
        </div>
      </div>
      ${due.length + plan > 0
        ? `<button class="btn-main" id="btnStart">${due.length ? '开始复习' : '开始学字'} · ${S.perGroup} 字一组</button>`
        : `<button class="btn-main ghost" disabled>这册生字表已经学完 🎉</button>`}
      <div class="quick">
        <button data-act="review"><b>${due.length}</b><span>待复习</span></button>
        <button data-act="new"><b>${plan}</b><span>待学新字</span></button>
        <button data-act="watch"><b>${todayD.n + todayD.r}</b><span>今日已学</span></button>
      </div>
    </div>

    <div class="card streak">
      <span class="dot"></span>
      <span class="txt">连续 <b>${S.streak || 0}</b> 天 · 记住 <b>${Object.keys(S.prog).length}</b> 字 · 星星 <b>${S.coin || 0}</b> 颗</span>
    </div>

    <div class="card pad0">
      <div class="sec-t" style="margin:16px 17px 10px">本 册 进 度</div>
      <div style="padding:0 17px 16px">
        <div class="book-bar"><i style="width:${ringPct}%"></i></div>
        <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--ink3);margin-top:8px;letter-spacing:.06em">
          <span>已学 ${done} / ${bookTotal}</span><span>待复习 ${due.length}</span>
        </div>
      </div>
      <div class="hr" style="margin:0"></div>
      <button class="row" style="width:100%" data-act="books">
        <span class="lbl">换一册生字表</span><span class="val">${esc(book.name)} ›</span>
      </button>
      <button class="row" style="width:100%" data-act="forget">
        <span class="lbl">生字本</span><span class="val">${wrongList().length} 字 ›</span>
      </button>
    </div>

    <div class="foot-note">部编版语文 1~6 年级生字表 · 共 ${BOOKS.reduce((n, b) => n + (ZI[b.id] || []).length, 0)} 字<br>看字 → 猜义 → 字源 → 标记 → 记忆曲线 → 组末测字</div>`;

    $('#v-home').innerHTML = html;
    const st = $('#btnStart'); if (st) st.onclick = () => startSession();
    $$('#v-home [data-act]').forEach(b => b.onclick = () => {
      const a = b.dataset.act;
      if (a === 'books') go('books');
      else if (a === 'forget') openSheet(sheetWords('生字本', wrongList()));
      else if (a === 'new') startSession('new');
      else if (a === 'review') startSession('review');
      else if (a === 'watch') go('me');
    });
  }

  function wrongList() {
    const out = [];
    BOOKS.forEach(b => bookZi(b.id).forEach(it => {
      const p = progOf(it);
      if (p && (p.wrong || 0) > 0 && (p.box || 0) < 4) out.push(it);
    }));
    return out.sort((a, b) => (progOf(b).wrong - progOf(a).wrong)).slice(0, 60);
  }

  /* =========================================================
     8. 学习会话
     ========================================================= */
  let SES = null;

  function startSession(only) {
    const g = S.bookId;
    let due = dueList(g);
    let fresh = newList(g);
    let q = [];

    if (only !== 'new') q = q.concat(due.slice(0, 40).map(it => ({ it, isNew: false })));
    if (only !== 'review') {
      const n = Math.min(S.perGroup, fresh.length);
      q = q.concat(fresh.slice(0, n).map(it => ({ it, isNew: true })));
    }
    if (!only && q.some(x => !x.isNew) && q.some(x => x.isNew)) {
      q.sort((a, b) => (a.isNew ? 1 : 0) - (b.isNew ? 1 : 0));
    }
    if (!q.length) { toast('这册生字表今天没有要学的内容了'); return; }

    SES = { q, i: 0, total: q.length, marks: [], learned: [], mode: only || 'all' };
    go('learn');
    showCard();
  }

  let CARD = null;

  function showCard() {
    if (!SES) return;
    if (SES.i >= SES.q.length) return finishSession();
    const cur = SES.q[SES.i];
    CARD = { it: cur.it, isNew: cur.isNew, revealed: false, marked: null, hinted: 0 };
    renderCard();
    if (S.autoSpeak) setTimeout(() => speak(CARD.it.c), 220);
  }

  function blankSentence(it) {
    const e = esc(it.e);
    const c = esc(it.c);
    return e.indexOf(c) > -1 ? e.replace(c, '<em>＿</em>') : e;
  }

  const infoOf = ch => CHARS[ch] || {};

  function renderCard() {
    const it = CARD.it, c = CARD, total = SES.total, idx = SES.i + 1;
    const ci = infoOf(it.c);
    const showBlank = !c.revealed;

    const hints = [];
    if (c.hinted >= 1) hints.push(`部首是「${ci.r || '—'}」，一共 ${ci.s ? ci.s + ' 画' : '几画'}`);
    if (c.hinted >= 2) {
      const gs = (it.g || []).slice(0, 3).map(w => w.split(it.c).join('＿')).join('　');
      hints.push(gs ? `它常出现在：${gs}` : `它常和别的字一起用，读作 ${it.p}`);
    }

    let ans = '';
    if (c.revealed) {
      ans = `
      <div class="answer">
        <div class="ans-def">${esc(it.d)}</div>
        ${S.showChars ? `
        <div class="sec-t">字 源 · 这 个 字 的 来 历</div>
        <div class="origin">
          <div class="or-h">
            <b>${esc(it.c)}</b>
            <i>${ci.r ? '部首 ' + esc(ci.r) : '部首 —'}${ci.s ? ' · ' + ci.s + ' 画' : ''}</i>
          </div>
          <div class="or-o">${esc(ci.o || '这个字暂时没有字源说明。')}
            ${ci.fam && ci.fam.length ? `<div class="ch-fam">${ci.fam.slice(0, 8).map(f => `<span>${esc(f)}</span>`).join('')}</div>` : ''}
          </div>
        </div>` : ''}
        <div class="sec-t">组 词 · 用 起 来</div>
        <div class="rel gwords">
          ${(it.g || []).map(w => `<span>${esc(w)}</span>`).join('')}
          <span class="say-one" data-say="${esc(it.c)}"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg>听一听</span>
        </div>
        <div class="sec-t">例 句</div>
        <div class="ex">${esc(it.e).split(esc(it.c)).join('<b>' + esc(it.c) + '</b>')}</div>
        ${it.t ? `<div class="sec-t">易 混</div><div class="tip">${esc(it.t)}</div>` : ''}
      </div>`;
    }

    $('#v-learn').innerHTML = `
    <div class="learn-wrap">
      <div class="progbar"><i style="width:${(idx - 1) / total * 100}%"></i></div>
      <div class="learn-body">
      <div class="learn-scroll">
      <div class="card flash ${c.revealed ? 'revealed' : ''}">
        <div class="flash-top">
          <span>${idx} / ${total}</span>
          <span class="flash-tag ${c.isNew ? '' : 'rev'}">${c.isNew ? '新 字' : '复 习'}</span>
        </div>
        <div class="word-box">
          <div class="word zi">${esc(it.c)}</div>
          <div class="py"><span>${esc(it.p)}</span><button class="sp" data-say="${esc(it.c)}" aria-label="朗读">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg></button></div>
        </div>
        ${showBlank ? `<div class="blank">${blankSentence(it)}</div>
          <div class="peek">
            ${c.hinted < 2 ? `<button class="hintbtn" id="hintBtn">${c.hinted ? '再给一点提示' : '给我一点提示'}</button>` : ''}
            ${hints.map(h => `<div class="hint">${esc(h)}</div>`).join('')}
            <button class="peekbtn" id="revealBtn">想不起来，看字义</button>
          </div>`
        : ''}
        ${ans}
      </div>
      </div>
      ${c.marked ? `<button class="btn-main nextbtn" id="nextBtn">下一个 →</button>`
        : `<div class="marks">
            <button data-mark="forget"><b>忘记了</b><i>明天再来</i></button>
            <button data-mark="fuzzy"><b>有点模糊</b><i>过一天再看</i></button>
            <button data-mark="known"><b>认识</b><i>记住了</i></button>
          </div>`}
      </div>
    </div>`;

    $$('#v-learn [data-say]').forEach(b => b.onclick = e => { e.stopPropagation(); speak(b.dataset.say); });
    const hb = $('#hintBtn'); if (hb) hb.onclick = () => {
      CARD.hinted = Math.min(2, CARD.hinted + 1); renderCard();
    };
    const rb = $('#revealBtn'); if (rb) rb.onclick = () => { CARD.revealed = true; renderCard(); };
    const nb = $('#nextBtn'); if (nb) nb.onclick = advance;
    $$('#v-learn [data-mark]').forEach(b => b.onclick = () => onMark(b.dataset.mark));
  }

  function onMark(m) {
    const it = CARD.it;
    if (CARD.marked) return;
    CARD.marked = m;
    plan(it, m);
    const d = day();
    if (CARD.isNew) d.n++; else d.r++;
    if (m === 'known') d.c++;
    d.t++;
    SES.learned.push({ it, m });
    markStreak();
    save();

    if (m === 'known' && !CARD.revealed) { advance(); return; }
    CARD.revealed = true;
    renderCard();
    if (S.autoSpeak) speak(it.c);
  }

  function advance() {
    SES.i++;
    if (SES.i >= SES.q.length) finishSession();
    else showCard();
  }

  function finishSession() {
    const learned = SES.learned.slice();
    if (learned.length >= 4) startTest(learned);
    else {
      SES = null;
      toast('这一组学完了 🌟');
      go('home');
    }
  }

  /* =========================================================
     9. 拼音归一化
     ========================================================= */
  function normPy(s) {
    return String(s || '').toLowerCase().trim()
      .replace(/[āáǎà]/g, 'a').replace(/[ēéěè]/g, 'e')
      .replace(/[īíǐì]/g, 'i').replace(/[ōóǒò]/g, 'o')
      .replace(/[ūúǔù]/g, 'u')
      .replace(/[ǖǘǚǜü]/g, 'v').replace(/[ńňǹ]/g, 'n')
      .replace(/[^a-z]/g, '');            // 声调、空格、撇号、误触一律不计
  }
  function pyEqual(a, b) {
    const x = normPy(a), y = normPy(b);
    return !!x && (x === y || x.replace(/v/g, 'u') === y.replace(/v/g, 'u'));
  }
  const onlyHan = s => String(s || '').replace(/[^\u4e00-\u9fa5]/g, '');
  /* 打字题判定：打拼音（不计声调）或直接打出这个字，都算对 */
  function answerOk(input, it) {
    const v = String(input || '').trim();
    if (!v) return false;
    if (onlyHan(v) === it.c) return true;
    return pyEqual(v, it.p);
  }

  /* =========================================================
     10. 组末测字
     ========================================================= */
  let TEST = null;
  const TYPES = ['zi2def', 'def2zi', 'py'];

  function startTest(learned) {
    const pool = shuffle(learned).slice(0, 12);
    const qs = pool.map((rec, i) => ({ it: rec.it, type: TYPES[i % 3] }));
    if (!qs.some(q => q.type === 'def2zi')) qs[qs.length - 1].type = 'def2zi';
    if (!qs.some(q => q.type === 'py')) qs[qs.length - 1].type = 'py';
    TEST = { qs, i: 0, ok: 0, wrong: [] };
    go('test');
    renderQ();
  }

  function buildOptions(q) {
    const it = q.it, g = S.bookId;
    if (q.type === 'zi2def') {
      const pool = bookZi(g).filter(x => x.c !== it.c && x.d !== it.d);
      let others = shuffle(pool).slice(0, 3);
      if (others.length < 3) {
        BOOKS.forEach(b => { if (b.id !== g) bookZi(b.id).forEach(x => { if (others.length < 3 && x.d !== it.d && !others.includes(x)) others.push(x); }); });
      }
      const opts = shuffle([{ t: it.d, ok: true }].concat(others.map(o => ({ t: o.d, ok: false }))));
      return { opts, prompt: '这个字是什么意思？' };
    }
    // def2zi：用形近 / 同音干扰字
    const xs = (it.x || []).slice(0, 3);
    const opts = shuffle([{ t: it.c, ok: true }].concat(xs.map(t => ({ t, ok: false }))));
    return { opts, prompt: '哪个字是这个意思？' };
  }

  function renderQ() {
    const q = TEST.qs[TEST.i];
    const it = q.it;
    const pct = Math.round(TEST.i / TEST.qs.length * 100);

    let body = '';
    if (q.type === 'py') {
      body = `
      <div class="q-card card">
        <div class="q-tag">看 字 · 打 字 或 拼 音</div>
        <div class="q-word">${esc(it.c)}</div>
        <div class="q-prompt">写拼音，或者直接打出这个字</div>
        <input class="py-input" id="pyIn" autocomplete="off" autocapitalize="off" spellcheck="false"
          placeholder="拼音或汉字，都行" />
        <div class="py-fb" id="pyFb">不用打声调</div>
        <button class="btn-main" id="pyGo">确定</button>
      </div>`;
    } else if (q.type === 'zi2def') {
      const { opts, prompt } = buildOptions(q);
      q.opts = opts;
      body = `
      <div class="q-card card">
        <div class="q-tag">看 字 · 选 字 义</div>
        <div class="q-word">${esc(it.c)}</div>
        <div class="py" style="text-align:center;display:flex;justify-content:center;margin-top:2px">
          <span>${esc(it.p)}</span>
          <button class="sp" data-say="${esc(it.c)}" aria-label="朗读">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg></button>
        </div>
        <div class="q-prompt">${prompt}</div>
        <div class="opts" id="opts">
          ${opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="k">${'ABCD'[i]}</span>${esc(o.t)}</button>`).join('')}
        </div>
      </div>`;
    } else {
      const { opts, prompt } = buildOptions(q);
      q.opts = opts;
      body = `
      <div class="q-card card">
        <div class="q-tag">看 字 义 · 选 字</div>
        <div class="q-desc">${esc(it.d)}</div>
        <div class="q-desc blank-q">${blankSentence(it)}</div>
        <div class="q-prompt">${prompt}</div>
        <div class="opts zi-grid" id="opts">
          ${opts.map((o, i) => `<button class="opt opt-zi" data-i="${i}">${esc(o.t)}</button>`).join('')}
        </div>
      </div>`;
    }

    $('#v-test').innerHTML = `
      <div class="test-head"><span>第 ${TEST.i + 1} / ${TEST.qs.length} 题</span><span>已对 ${TEST.ok}</span></div>
      <div class="progbar"><i style="width:${pct}%"></i></div>
      <div class="test-body">${body}</div>
      <div class="foot-note">答错的字会自动进生字本，明天还会再见到它</div>`;

    $$('#v-test [data-say]').forEach(b => b.onclick = () => speak(b.dataset.say));

    if (q.type === 'py') {
      const inp = $('#pyIn');
      const submit = () => {
        if (q.judged) return;
        const v = inp.value.trim();
        if (!v) return;
        const right = answerOk(v, it);
        const byHan = onlyHan(v) === it.c;
        q.judged = true;
        judge(right, inp, right
          ? (byHan ? `对，「${it.c}」读 ${it.p}` : `正确：${it.c} — ${it.p}`)
          : `应该是「${it.c}」，读 ${it.p}`);
      };
      $('#pyGo').onclick = submit;
      // 中文输入法里回车是「选字」，别把半截拼音提交了
      inp.onkeydown = e => { if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) submit(); };
      if (S.autoSpeak) setTimeout(() => speak(it.c), 260);
      setTimeout(() => inp.focus(), 120);
    } else {
      $$('#opts .opt').forEach(b => b.onclick = () => {
        if (q.judged) return;
        const o = q.opts[+b.dataset.i];
        q.judged = true;
        $$('#opts .opt').forEach((x, i) => {
          x.disabled = true;
          if (q.opts[i].ok) x.classList.add('right');
          else if (i === +b.dataset.i) x.classList.add('wrong');
        });
        judge(o.ok, null, o.ok ? '' : `正确的是「${it.c}」—— ${it.d}`);
      });
    }
  }

  function judge(right, inputEl, msg) {
    const q = TEST.qs[TEST.i];
    if (inputEl) inputEl.classList.add(right ? 'right' : 'wrong');
    const goBtn = $('#pyGo'); if (goBtn && inputEl) goBtn.style.display = 'none';
    if (right) {
      TEST.ok++;
      const d = day(); d.c++; d.t++;
    } else {
      TEST.wrong.push(q.it);
      const d = day(); d.t++;
      const p = S.prog[zkey(q.it)] || { box: 1, due: TODAY(), seen: 0, ok: 0, wrong: 0 };
      p.wrong = (p.wrong || 0) + 1; p.box = 1; p.due = dayShift(1); p.last = 'forget';
      S.prog[zkey(q.it)] = p;
    }
    S.coin = (S.coin || 0) + (right ? 1 : 0);
    save();

    const fb = $('#pyFb'); if (fb) fb.textContent = msg || '';
    const card = $('#v-test .q-card');
    if (card && !$('#nextQ')) {
      const btn = document.createElement('button');
      btn.className = 'btn-main'; btn.id = 'nextQ';
      btn.textContent = TEST.i + 1 >= TEST.qs.length ? '看结果 →' : '下一题 →';
      btn.onclick = () => { TEST.i++; if (TEST.i >= TEST.qs.length) renderResult(); else renderQ(); };
      card.appendChild(btn);
      if (right && S.autoSpeak) speak(q.it.c);
    }
  }

  function renderResult() {
    const n = TEST.qs.length, ok = TEST.ok;
    const rate = Math.round(ok / n * 100);
    const say = rate >= 90 ? '认得真牢！' : rate >= 70 ? '不错，再巩固一下' : rate >= 50 ? '一半记住了，明天再看' : '没关系，多看几遍就记住了';
    const wrong = TEST.wrong;
    $('#v-test').innerHTML = `
      <div class="test-body top"><div class="card result">
        <div class="big">${ok}<small>/${n}</small></div>
        <div class="rt">${say}</div>
        <div class="rs">正确率 ${rate}%　·　获得 ${ok} 颗小星星</div>
        ${wrong.length ? `<div class="wrong-list">
          ${wrong.map(w => `<div class="wl"><b>${esc(w.c)}</b><span class="muted" style="font-size:11.5px">${esc(w.p)}</span></div>`).join('')}
        </div>` : '<div class="rs" style="margin-top:18px">全对，一个都不错 ✨</div>'}
        ${wrong.length ? `<button class="btn-main" id="reWrong">只练这几个错字</button>` : ''}
        <button class="btn-main ghost" id="doneBtn">回首页</button>
      </div></div>`;
    const rw = $('#reWrong');
    if (rw) rw.onclick = () => {
      TEST = { qs: wrong.map(it => ({ it, type: Math.random() < .5 ? 'zi2def' : 'def2zi' })), i: 0, ok: 0, wrong: [] };
      renderQ();
    };
    $('#doneBtn').onclick = () => { TEST = null; SES = null; go('home'); };
  }

  /* =========================================================
     11. 字书
     ========================================================= */
  function renderBooks() {
    const total = BOOKS.reduce((n, b) => n + (ZI[b.id] || []).length, 0);
    const allDone = BOOKS.reduce((n, b) => n + learnedCount(b.id), 0);
    $('#v-books').innerHTML = `
      <div class="greet" style="padding-bottom:10px">
        <div class="h1">生字表</div>
        <div class="sub">部编版语文 · 6 册 · ${total} 字　已学 ${allDone}</div>
      </div>
      ${BOOKS.map((b, i) => {
        const list = ZI[b.id] || [], tot = list.length, dn = learnedCount(b.id);
        const due = dueList(b.id).length;
        return `<button class="card book ${b.id === S.bookId ? 'cur' : ''}" data-book="${b.id}">
          <div class="no">${String(i + 1).padStart(2, '0')}</div>
          <div class="info">
            <div class="nm">${esc(b.name)}<span class="ct">${dn}/${tot}</span></div>
            <div class="rf">${esc(b.ref)}</div>
            <div class="book-bar"><i style="width:${tot ? dn / tot * 100 : 0}%"></i></div>
            <div class="st">${due ? due + ' 字待复习' : (dn === tot ? '已全部学完' : '未开始或已学完今日份')}</div>
          </div>
        </button>`;
      }).join('')}
      <div class="foot-note">选一册就开始 · 换册不会丢进度<br>字表在 data/zi-N.json，可自己增删</div>`;
    $$('#v-books [data-book]').forEach(b => b.onclick = () => {
      S.bookId = +b.dataset.book; save();
      toast('已切换到' + (BOOKS.find(x => x.id === S.bookId) || {}).name);
      go('home');
    });
  }

  /* =========================================================
     12. 我的
     ========================================================= */
  function renderMe() {
    const total = Object.keys(S.prog).length;
    let c = 0, t = 0;
    Object.values(S.days).forEach(d => { c += d.c || 0; t += d.t || 0; });
    const acc = t ? Math.round(c / t * 100) : 0;

    const cells = [];
    for (let i = 27; i >= 0; i--) {
      const d = S.days[dayShift(-i)];
      const n = d ? (d.n || 0) + (d.r || 0) : 0;
      const lv = n === 0 ? '' : n < 6 ? ' l1' : n < 14 ? ' l2' : n < 24 ? ' l3' : ' l4';
      cells.push(`<i class="${lv.trim()}" title="${dayShift(-i)}"></i>`);
    }
    const wrong = wrongList();

    $('#v-me').innerHTML = `
      <div class="greet" style="padding-bottom:12px">
        <div class="h1">我的</div>
        <div class="sub">连续 ${S.streak || 0} 天 · 小星星 ${S.coin || 0} 颗</div>
      </div>
      <div class="stat-grid">
        <div><b>${total}</b><span>累 计 字 数</span></div>
        <div><b>${acc}<small style="font-size:12px">%</small></b><span>正 确 率</span></div>
        <div><b>${S.streak || 0}</b><span>连 续 天 数</span></div>
      </div>
      <div class="card pad0" style="margin-bottom:14px">
        <div class="sec-t" style="margin:16px 17px 0">近 四 周</div>
        <div class="heat">${cells.join('')}</div>
      </div>
      <div class="card pad0" style="margin-bottom:14px">
        <button class="row" style="width:100%" data-act="wrong">
          <span class="lbl">生字本</span><span class="val">${wrong.length} 字 ›</span></button>
        <button class="row" style="width:100%" data-act="set">
          <span class="lbl">设置</span><span class="val">每组 ${S.perGroup} 字 ›</span></button>
        <button class="row" style="width:100%" data-act="about">
          <span class="lbl">关于这套字表</span><span class="val">›</span></button>
      </div>
      <div class="foot-note">不背文字 · 用「不背单词」的方式记单字<br>数据存在本机浏览器，换设备不会同步</div>`;

    $$('#v-me [data-act]').forEach(b => b.onclick = () => {
      const a = b.dataset.act;
      if (a === 'wrong') openSheet(sheetWords('生字本', wrong));
      if (a === 'set') openSheet(sheetSettings());
      if (a === 'about') openSheet(sheetAbout());
    });
  }

  /* =========================================================
     13. 弹层
     ========================================================= */
  function openSheet(html) {
    const sh = $('#sheet');
    sh.innerHTML = `<div class="grab"></div>${html}`;
    sh.hidden = false; $('#mask').hidden = false;
    bindSheet();
  }
  function closeSheet() { $('#sheet').hidden = true; $('#mask').hidden = true; }

  function sheetWords(title, list) {
    if (!list.length) return `<h3>${title}</h3><div class="empty"><div class="ic">字</div><p>还没有字<br>答错的会自动进来</p></div>`;
    return `<h3>${title}</h3>
      <div class="hintline">共 ${list.length} 字 · 点一个看字源和例句</div>
      <div style="margin:0 -20px;max-height:56vh;overflow:auto">
        ${list.map(it => `<div class="wrow" data-w="${esc(zkey(it))}">
          <div class="w">${esc(it.c)}<small>${esc(it.p)}</small></div>
          <div class="d">${esc(it.d)}</div><div class="go">›</div></div>`).join('')}
      </div>`;
  }

  function sheetDetail(it) {
    const ci = infoOf(it.c);
    return `<h3>${esc(it.c)}</h3>
      <div class="hintline">${esc(it.p)} · ${cn(it.grade)}年级
        <button class="sp" style="margin-left:8px;vertical-align:middle" data-say="${esc(it.c)}"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg></button></div>
      <div class="ans-def">${esc(it.d)}</div>
      <div class="sec-t">字 源</div>
      <div class="origin">
        <div class="or-h"><b>${esc(it.c)}</b><i>${ci.r ? '部首 ' + esc(ci.r) : '部首 —'}${ci.s ? ' · ' + ci.s + ' 画' : ''}</i></div>
        <div class="or-o">${esc(ci.o || '暂无字源说明。')}
        ${ci.fam && ci.fam.length ? `<div class="ch-fam">${ci.fam.slice(0, 8).map(f => `<span>${esc(f)}</span>`).join('')}</div>` : ''}</div>
      </div>
      <div class="sec-t">组 词</div>
      <div class="rel gwords">${(it.g || []).map(w => `<span>${esc(w)}</span>`).join('')}</div>
      <div class="sec-t">例 句</div>
      <div class="ex">${esc(it.e).split(esc(it.c)).join('<b>' + esc(it.c) + '</b>')}</div>
      ${it.t ? `<div class="sec-t">易 混</div><div class="tip">${esc(it.t)}</div>` : ''}
      <button class="btn-main ghost" style="margin-top:18px" data-close="1">收起</button>`;
  }

  function findZi(k) {
    for (const b of BOOKS) { const f = bookZi(b.id).find(x => zkey(x) === k); if (f) return f; }
    return null;
  }

  function sheetSettings() {
    return `<h3>设置</h3>
      <div class="hintline">每组字量决定一次学多少</div>
      <div style="font-size:12px;color:var(--ink3);letter-spacing:.1em;margin-bottom:8px">每 组 字 量</div>
      <div class="chips" id="chipGroup">
        ${[8, 12, 16, 20].map(n => `<button data-n="${n}" class="${S.perGroup === n ? 'on' : ''}">${n} 字</button>`).join('')}
      </div>
      <div class="hr"></div>
      <div class="row" style="padding:12px 0"><span class="lbl">点开自动读音</span><span class="switch ${S.autoSpeak ? 'on' : ''}" data-sw="autoSpeak"></span></div>
      <div class="row" style="padding:12px 0"><span class="lbl">显示字源拆解</span><span class="switch ${S.showChars ? 'on' : ''}" data-sw="showChars"></span></div>
      <div class="hr"></div>
      <button class="btn-main ghost" id="resetBtn" style="color:var(--red);border-color:rgba(184,64,46,.25)">清空全部学习记录</button>
      <div class="hintline" style="text-align:center;margin:10px 0 0">清空后不可恢复，请想清楚</div>`;
  }

  function sheetAbout() {
    return `<h3>关于</h3>
      <div class="hintline" style="line-height:2">
        这套字表复刻「不背单词」的记忆方式，把英文单词换成汉字单字：<br>
        · 音标 → 拼音<br>· 词根词缀 → 部首、部件、字理<br>· 影视例句 → 教材语境与常用句<br>· 拼写测试 → 选字 + 打字／写拼音<br><br>
        字表：部编版语文 1~6 年级生字表（共 ${BOOKS.reduce((n, b) => n + (ZI[b.id] || []).length, 0)} 字），按课本先后排列<br>
        修改字条：编辑 data/zi-N.json，再运行 node tools/build-data.js
      </div>
      <button class="btn-main ghost" style="margin-top:16px" data-close="1">知道了</button>`;
  }

  function bindSheet() {
    $$('#sheet [data-say]').forEach(b => b.onclick = () => speak(b.dataset.say));
    $$('#sheet [data-close]').forEach(b => b.onclick = closeSheet);
    $$('#sheet [data-w]').forEach(b => b.onclick = () => {
      const w = findZi(b.dataset.w); if (w) openSheet(sheetDetail(w));
    });
    $$('#sheet .chips button[data-n]').forEach(b => b.onclick = () => {
      S.perGroup = +b.dataset.n; save();
      $$('#sheet .chips button[data-n]').forEach(x => x.classList.toggle('on', x === b));
      toast('每组 ' + S.perGroup + ' 字');
    });
    $$('#sheet [data-sw]').forEach(b => b.onclick = () => {
      S[b.dataset.sw] = !S[b.dataset.sw]; save();
      b.classList.toggle('on', S[b.dataset.sw]);
    });
    const rb = $('#resetBtn');
    if (rb) rb.onclick = () => {
      if (rb.dataset.armed) {
        S = DEF(); save(); closeSheet(); go('home'); toast('已清空');
      } else {
        rb.dataset.armed = '1'; rb.textContent = '真的清空？再点一次';
      }
    };
  }

  /* =========================================================
     14. toast + 启动
     ========================================================= */
  let toastT = null;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove('show'), 1900);
  }

  function boot() {
    paintWall();
    $$('#tabbar button').forEach(b => b.onclick = () => go(b.dataset.go));
    $('#btnBack').onclick = () => {
      if (view === 'test') { TEST = null; SES = null; go('home'); }
      else if (SES && SES.i > 0) { SES = null; go('home'); }
      else go('home');
    };
    $('#btnSet').onclick = () => openSheet(sheetSettings());
    $('#mask').onclick = closeSheet;
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeSheet();
      if (view === 'learn' && CARD) {
        if (e.key === '1') onMark('forget');
        if (e.key === '2') onMark('fuzzy');
        if (e.key === '3') onMark('known');
        if (e.key === 'Enter' && CARD.marked) advance();
        if (e.key === ' ' && !CARD.revealed) { CARD.revealed = true; renderCard(); }
      }
    });
    go('home');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
