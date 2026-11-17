/*!
 * voice.js — 英语语音朗读模块（柔美女声优先）
 * 站点：英语（专升本）13000
 * 用法：页面里 <script src="voice.js"></script>
 * 依赖：浏览器原生 SpeechSynthesis（无需联网、无需密钥、零成本）
 */
(function () {
  'use strict';
  if (window.__enTTS) return;

  /* ================= 0. 能力检测 ================= */
  var synth = window.speechSynthesis;
  var supported = !!(synth && window.SpeechSynthesisUtterance);

  /* ================= 1. 配置持久化 ================= */
  var LS_KEY = 'en13000_tts_v1';
  var PRESETS = {
    soft:  { label: '柔美', rate: 0.88, pitch: 1.08 },   // 默认：偏慢 + 略高音高，听感更柔和
    clear: { label: '清晰', rate: 0.96, pitch: 1.00 },
    slow:  { label: '跟读', rate: 0.72, pitch: 1.00 }
  };
  var cfg = { voiceURI: '', preset: 'soft', rate: PRESETS.soft.rate, pitch: PRESETS.soft.pitch };
  try {
    var saved = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      if (saved.voiceURI) cfg.voiceURI = saved.voiceURI;
      if (saved.preset && PRESETS[saved.preset]) cfg.preset = saved.preset;
      if (typeof saved.rate === 'number') cfg.rate = saved.rate;
      if (typeof saved.pitch === 'number') cfg.pitch = saved.pitch;
    }
  } catch (e) {}
  function persist() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(cfg)); } catch (e) {}
  }

  /* ================= 2. 女声优选 ================= */
  // 名字里出现这些的，优先当作「柔美女声」
  var PREF = ['samantha', 'ava', 'allison', 'susan', 'serena', 'karen', 'moira', 'tessa',
              'fiona', 'kate', 'stephanie', 'aria', 'jenny', 'zira', 'michelle', 'eva',
              'libby', 'sonia', 'clara', 'emily', 'olivia', 'female', 'google us english'];
  // 明确的男声，降权
  var MALE = /(daniel|alex|fred|tom|aaron|arthur|gordon|ralph|rishi|nathan|evan|david|mark|guy|davis|jason|eric|christopher|brian|male|james|george|oliver|liam|matthew|diego|jorge|juan|carlos)/i;

  function isEn(v) { return /^en(\b|[-_])/i.test(v.lang || ''); }

  function score(v) {
    if (!isEn(v)) return -1000;
    var n = (v.name || '').toLowerCase(), s = 100;
    for (var i = 0; i < PREF.length; i++) {
      if (n.indexOf(PREF[i]) > -1) { s += 80 - i * 3; break; }
    }
    if (MALE.test(n) && !/female/i.test(n)) s -= 220;
    if (/premium|enhanced|natural|neural/i.test(v.name)) s += 55;   // 系统高质量音色
    if (!v.localService) s += 8;                                    // 云端音色通常更自然
    if (/en[-_]us/i.test(v.lang)) s += 6;
    return s;
  }

  var voices = [];
  function loadVoices() {
    if (!supported) return [];
    var all = synth.getVoices() || [];
    voices = all.filter(isEn).map(function (v) { return { v: v, s: score(v) }; })
                 .sort(function (a, b) { return b.s - a.s; })
                 .map(function (o) { return o.v; });
    return voices;
  }
  function currentVoice() {
    if (!voices.length) loadVoices();
    if (cfg.voiceURI) {
      for (var i = 0; i < voices.length; i++) if (voices[i].voiceURI === cfg.voiceURI) return voices[i];
    }
    return voices[0] || null;
  }

  /* ================= 3. 文本处理 ================= */
  // 只保留英文：中文释义、全角标点会被剔除，避免「读中文」
  function enOnly(s) {
    if (!s) return '';
    var t = String(s);
    t = t.replace(/[（(][^）)]*[）)]/g, function (m) { return /[\u4e00-\u9fff]/.test(m) ? ' ' : m; });
    t = t.replace(/[\u4e00-\u9fff\u3400-\u4dbf]+/g, ' ');
    t = t.replace(/[，。、；：！？「」『』《》【】“”‘’·•…—]/g, ' ');
    t = t.replace(/\s*([,;])\s*(?=\1)/g, '$1');
    t = t.replace(/\s+/g, ' ').trim();
    t = t.replace(/^[\s,;:.\-\/]+|[\s,;:.\-\/]+$/g, '').trim();
    return t;
  }
  function hasLatin(t) { return /[a-zA-Z]{2,}/.test(t); }

  function textOf(el) {
    if (!el) return '';
    var c = el.cloneNode(true);
    Array.prototype.forEach.call(c.querySelectorAll('.tts-btn,.tts-bar,.tts-badge'), function (n) {
      n.parentNode && n.parentNode.removeChild(n);
    });
    return c.textContent || '';
  }

  // 长句按标点切分；过长的再按逗号切
  function splitSentences(t, max) {
    max = max || 160;
    t = String(t).replace(/\s+/g, ' ').trim();
    if (!t) return [];
    if (t.length <= max) return [t];
    var parts = t.match(/[^.!?;]+[.!?;]+["')\]]*\s*|[^.!?;]+$/g) || [t];
    var out = [], buf = '';
    parts.forEach(function (p) {
      buf += p;
      if (buf.trim().length >= 24) { out.push(buf.trim()); buf = ''; }
    });
    if (buf.trim()) out.push(buf.trim());
    var fin = [];
    out.forEach(function (p) {
      if (p.length <= max) { fin.push(p); return; }
      var segs = p.split(/(?<=,)\s+/), acc = '';
      segs.forEach(function (s) {
        if ((acc + s).length > max && acc) { fin.push(acc.trim()); acc = s + ' '; }
        else acc += s + ' ';
      });
      if (acc.trim()) fin.push(acc.trim());
    });
    return fin.filter(Boolean);
  }

  /* ================= 4. 播放引擎 ================= */
  var playing = false, queue = [], qIdx = 0, curEl = null, curUtt = null, retried = false;

  function markEl(el) {
    if (curEl && curEl !== el && curEl.classList) curEl.classList.remove('tts-on');
    curEl = el || null;
    if (curEl && curEl.classList) curEl.classList.add('tts-on');
  }
  function clearMark() {
    Array.prototype.forEach.call(document.querySelectorAll('.tts-on'), function (n) { n.classList.remove('tts-on'); });
    curEl = null;
  }

  function speakQueue(items, el) {
    if (!supported) { toast('当前浏览器不支持语音朗读'); return; }
    stop(true);
    queue = items.filter(function (t) { return t && hasLatin(t); });
    if (!queue.length) return;
    qIdx = 0; playing = true; retried = false;
    markEl(el);
    fabState(true);
    step();
  }

  function step() {
    if (!playing) return;
    if (qIdx >= queue.length) { finish(); return; }
    var text = queue[qIdx];
    var u = new SpeechSynthesisUtterance(text);
    var v = currentVoice();
    if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = 'en-US'; }
    u.rate = cfg.rate; u.pitch = cfg.pitch; u.volume = 1;

    var started = false;
    u.onstart = function () { started = true; subtitle(text); };
    u.onend = function () { if (!playing) return; qIdx++; subtitle(''); step(); };
    u.onerror = function (e) {
      var err = (e && e.error) || '';
      if (err === 'interrupted' || err === 'canceled') return;
      qIdx++; subtitle(''); step();
    };

    curUtt = u;
    try { synth.speak(u); } catch (e) { qIdx++; step(); return; }

    // Chrome 偶发不触发 onstart 的兜底
    setTimeout(function () {
      if (!started && playing && !synth.speaking && !retried) {
        retried = true;
        try { synth.cancel(); } catch (e) {}
        setTimeout(function () { if (playing) step(); }, 60);
      }
    }, 900);
  }

  function finish() {
    playing = false; queue = []; subtitle(''); clearMark(); fabState(false);
  }
  function stop(silent) {
    playing = false; queue = []; qIdx = 0; retried = false;
    if (supported) { try { synth.cancel(); } catch (e) {} }
    curUtt = null;
    subtitle(''); clearMark(); fabState(false);
  }

  /* ================= 5. 样式 ================= */
  var CSS = [
    '#ttsFab{position:fixed;right:16px;bottom:18px;z-index:214;width:46px;height:46px;border-radius:50%;',
    '  background:var(--card,#fffefb);border:1px solid var(--line,#e3ded2);color:var(--main,#b8452f);',
    '  display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;',
    '  box-shadow:0 6px 20px -8px rgba(21,23,27,.35);transition:.2s;}',
    '#ttsFab:hover{border-color:var(--main,#b8452f);transform:translateY(-1px)}',
    '#ttsFab svg{width:19px;height:19px;display:block}',
    '#ttsFab.on{background:var(--main,#b8452f);color:#fff;border-color:var(--main,#b8452f)}',
    '#ttsFab .eq{display:none;align-items:flex-end;gap:2px;height:13px}',
    '#ttsFab.on .eq{display:flex}#ttsFab.on .ic{display:none}',
    '#ttsFab .eq i{display:block;width:2.5px;background:currentColor;border-radius:2px;',
    '  animation:ttsEq .9s ease-in-out infinite}',
    '#ttsFab .eq i:nth-child(1){height:6px;animation-delay:0s}',
    '#ttsFab .eq i:nth-child(2){height:12px;animation-delay:.15s}',
    '#ttsFab .eq i:nth-child(3){height:8px;animation-delay:.3s}',
    '@keyframes ttsEq{0%,100%{transform:scaleY(.45)}50%{transform:scaleY(1)}}',
    '.tts-btn{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;',
    '  margin-left:6px;border-radius:6px;color:var(--main,#b8452f);cursor:pointer;vertical-align:-3px;',
    '  opacity:.55;transition:.16s;flex:0 0 auto;background:transparent;border:0;padding:0}',
    '.tts-btn:hover{opacity:1;background:var(--main-s,#f3e2dc)}',
    '.tts-btn svg{width:13px;height:13px;display:block}',
    '.tts-on{background:var(--main-s,#f3e2dc)!important;border-radius:6px;',
    '  box-shadow:inset 2px 0 0 var(--main,#b8452f)}',
    '.tts-bar{display:flex;align-items:center;gap:8px;margin:0 0 10px;',
    '  font-size:12.5px;color:var(--ink3,#75736e);flex-wrap:wrap}',
    '.tts-bar .k{border:1px solid var(--line,#e3ded2);border-radius:999px;padding:3px 11px;',
    '  background:var(--card,#fffefb);color:var(--main,#b8452f);cursor:pointer;font-family:inherit;',
    '  font-size:12.5px;line-height:1.6;transition:.16s;display:inline-flex;align-items:center;gap:5px}',
    '.tts-bar .k:hover{border-color:var(--main,#b8452f);background:var(--main-s,#f3e2dc)}',
    '.tts-bar .k svg{width:13px;height:13px;display:block;flex:0 0 auto}',
    '.tts-para-btn{position:absolute;right:-2px;top:2px;width:22px;height:22px;border-radius:6px;',
    '  display:flex;align-items:center;justify-content:center;color:var(--main,#b8452f);cursor:pointer;',
    '  opacity:.4;transition:.16s;background:transparent}',
    'p.fen{position:relative;padding-right:26px}',
    'p.fen:hover .tts-para-btn{opacity:1}',
    '.tts-para-btn:hover{opacity:1;background:var(--main-s,#f3e2dc)}',
    /* 控制面板 */
    '#ttsPanel{position:fixed;right:16px;bottom:74px;z-index:215;width:280px;max-width:calc(100vw - 32px);',
    '  background:var(--card,#fffefb);border:1px solid var(--line,#e3ded2);border-radius:16px;',
    '  box-shadow:0 20px 50px -22px rgba(21,23,27,.45),0 2px 6px rgba(21,23,27,.06);',
    '  padding:14px 15px 13px;font-size:13px;color:var(--ink,#15171b);display:none;',
    '  font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif}',
    '#ttsPanel.on{display:block;animation:ttsIn .18s ease-out}',
    '@keyframes ttsIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
    '#ttsPanel .hd{display:flex;align-items:center;gap:6px;margin:0 0 11px}',
    '#ttsPanel .hd b{font-size:13.5px;letter-spacing:.02em}',
    '#ttsPanel .hd em{font-style:normal;font-size:10px;font-family:var(--mono,ui-monospace,monospace);',
    '  letter-spacing:.14em;text-transform:uppercase;color:var(--main,#b8452f);opacity:.8}',
    '#ttsPanel .hd .x{margin-left:auto;border:0;background:transparent;color:var(--ink3,#75736e);',
    '  cursor:pointer;font-size:16px;line-height:1;padding:2px 4px;border-radius:6px}',
    '#ttsPanel .hd .x:hover{background:var(--paper2,#efece4);color:var(--ink,#15171b)}',
    '#ttsPanel .row{display:flex;align-items:center;gap:9px;margin-bottom:10px}',
    '#ttsPanel .row>span{flex:0 0 34px;color:var(--ink3,#75736e);font-size:12px}',
    '#ttsPanel select{flex:1 1 auto;min-width:0;font-family:inherit;font-size:12.5px;color:var(--ink,#15171b);',
    '  background:var(--card,#fffefb);border:1px solid var(--line,#e3ded2);border-radius:8px;padding:5px 8px;',
    '  cursor:pointer;text-overflow:ellipsis}',
    '#ttsPanel select:focus{outline:none;border-color:var(--main,#b8452f)}',
    '#ttsPanel .ps{display:flex;gap:6px;flex:1 1 auto}',
    '#ttsPanel .ps button{flex:1 1 0;font-family:inherit;font-size:12px;padding:5px 0;border-radius:999px;',
    '  border:1px solid var(--line,#e3ded2);background:transparent;color:var(--ink2,#3b3d42);cursor:pointer;transition:.16s}',
    '#ttsPanel .ps button.on{background:var(--main,#b8452f);border-color:var(--main,#b8452f);color:#fff;font-weight:600}',
    '#ttsPanel .ps button:not(.on):hover{border-color:var(--main,#b8452f);color:var(--main,#b8452f)}',
    '#ttsPanel input[type=range]{flex:1 1 auto;-webkit-appearance:none;appearance:none;height:3px;border-radius:3px;',
    '  background:var(--line,#e3ded2);outline:none;cursor:pointer}',
    '#ttsPanel input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;',
    '  background:var(--main,#b8452f);cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.2)}',
    '#ttsPanel .val{flex:0 0 30px;text-align:right;font-family:var(--mono,ui-monospace,monospace);',
    '  font-size:11.5px;color:var(--main,#b8452f)}',
    '#ttsPanel .acts{display:flex;gap:7px;margin-top:12px}',
    '#ttsPanel .acts button{flex:1 1 0;font-family:inherit;font-size:12.5px;padding:7px 0;border-radius:9px;cursor:pointer;transition:.16s;',
    '  border:1px solid var(--line,#e3ded2);background:var(--card,#fffefb);color:var(--ink2,#3b3d42)}',
    '#ttsPanel .acts button.pri{background:var(--main,#b8452f);border-color:var(--main,#b8452f);color:#fff;font-weight:600}',
    '#ttsPanel .acts button:hover{transform:translateY(-1px)}',
    '#ttsPanel .tip{margin:10px 0 0;font-size:11.5px;line-height:1.65;color:var(--ink3,#75736e)}',
    '#ttsPanel .tip b{color:var(--ink2,#3b3d42);font-weight:600}',
    /* 字幕条 */
    '#ttsSub{position:fixed;left:50%;bottom:20px;transform:translate(-50%,14px);z-index:213;',
    '  max-width:min(560px,calc(100vw - 96px));background:var(--card,#fffefb);',
    '  border:1px solid var(--line,#e3ded2);border-left:3px solid var(--main,#b8452f);border-radius:12px;',
    '  padding:8px 13px;font-size:13px;line-height:1.6;color:var(--ink2,#3b3d42);',
    '  font-family:Georgia,"Times New Roman",serif;font-style:italic;box-shadow:0 12px 30px -18px rgba(21,23,27,.4);',
    '  opacity:0;pointer-events:none;transition:.22s}',
    '#ttsSub.on{opacity:1;transform:translate(-50%,0)}',
    /* 划词小按钮 */
    '#ttsSel{position:fixed;z-index:216;display:none;align-items:center;gap:5px;',
    '  background:var(--main,#b8452f);color:#fff;border:0;border-radius:999px;padding:5px 11px;',
    '  font-size:12px;font-family:inherit;cursor:pointer;box-shadow:0 8px 20px -8px rgba(184,69,47,.7)}',
    '#ttsSel svg{width:12px;height:12px}',
    /* toast */
    '#ttsToast{position:fixed;left:50%;top:16px;transform:translate(-50%,-10px);z-index:217;',
    '  background:var(--ink,#15171b);color:#fff;font-size:12.5px;padding:7px 15px;border-radius:999px;',
    '  opacity:0;pointer-events:none;transition:.2s}',
    '#ttsToast.on{opacity:.92;transform:translate(-50%,0)}',
    '@media (max-width:520px){#ttsFab{right:12px;bottom:14px;width:42px;height:42px}',
    '  #ttsPanel{right:12px;bottom:66px}#ttsSub{bottom:64px;font-size:12.5px}}'
  ].join('\n');

  function injectCSS() {
    var st = document.createElement('style');
    st.id = 'ttsStyle';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ================= 6. UI 构建 ================= */
  var ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 6.15h2.15L8.15 3.5v9L5.35 9.85H3.2z" fill="currentColor"/><path d="M10.2 5.6a3.3 3.3 0 0 1 0 4.8M11.9 4.1a5.4 5.4 0 0 1 0 7.8" stroke="currentColor" stroke-width="1.05" fill="none" stroke-linecap="round"/></svg>';
  var fab, panel, sub, selBtn, toastEl, voiceSel, rateR, pitchR, rateV, pitchV, psBox;

  function buildUI() {
    fab = document.createElement('button');
    fab.id = 'ttsFab';
    fab.type = 'button';
    fab.title = '英语朗读设置';
    fab.setAttribute('aria-label', '英语朗读设置');
    fab.innerHTML = '<span class="ic">' + ICON + '</span><span class="eq"><i></i><i></i><i></i></span>';
    document.body.appendChild(fab);

    panel = document.createElement('div');
    panel.id = 'ttsPanel';
    panel.innerHTML =
      '<div class="hd"><b>英语朗读</b><em>Soft&nbsp;Female</em><button class="x" type="button" aria-label="收起">×</button></div>' +
      '<div class="row"><span>音色</span><select id="ttsVoice" aria-label="音色"></select></div>' +
      '<div class="row"><span>语气</span><div class="ps" id="ttsPs"></div></div>' +
      '<div class="row"><span>语速</span><input type="range" id="ttsRate" min="60" max="120" step="1"><i class="val" id="ttsRateV"></i></div>' +
      '<div class="row"><span>音调</span><input type="range" id="ttsPitch" min="80" max="130" step="1"><i class="val" id="ttsPitchV"></i></div>' +
      '<div class="acts"><button type="button" class="pri" id="ttsTry">试听</button><button type="button" id="ttsStop">停止</button></div>' +
      '<p class="tip">点英文句子旁的喇叭图标或英文单词即可朗读；选中任意英文会自动出现「读」按钮。</p>';
    document.body.appendChild(panel);

    sub = document.createElement('div');
    sub.id = 'ttsSub';
    document.body.appendChild(sub);

    selBtn = document.createElement('button');
    selBtn.id = 'ttsSel';
    selBtn.type = 'button';
    selBtn.innerHTML = ICON + '<span>读</span>';
    document.body.appendChild(selBtn);

    toastEl = document.createElement('div');
    toastEl.id = 'ttsToast';
    document.body.appendChild(toastEl);

    voiceSel = panel.querySelector('#ttsVoice');
    rateR = panel.querySelector('#ttsRate');
    pitchR = panel.querySelector('#ttsPitch');
    rateV = panel.querySelector('#ttsRateV');
    pitchV = panel.querySelector('#ttsPitchV');
    psBox = panel.querySelector('#ttsPs');

    // 语气预设
    Object.keys(PRESETS).forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button'; b.dataset.p = k; b.textContent = PRESETS[k].label;
      b.addEventListener('click', function () {
        cfg.preset = k; cfg.rate = PRESETS[k].rate; cfg.pitch = PRESETS[k].pitch;
        syncUI(); persist(); preview();
      });
      psBox.appendChild(b);
    });

    fab.addEventListener('click', function () { panel.classList.toggle('on'); });
    panel.querySelector('.x').addEventListener('click', function () { panel.classList.remove('on'); });
    panel.querySelector('#ttsStop').addEventListener('click', function () { stop(); });
    panel.querySelector('#ttsTry').addEventListener('click', preview);

    rateR.addEventListener('input', function () {
      cfg.rate = +rateR.value / 100; rateV.textContent = cfg.rate.toFixed(2); persist();
    });
    pitchR.addEventListener('input', function () {
      cfg.pitch = +pitchR.value / 100; pitchV.textContent = cfg.pitch.toFixed(2); persist();
    });
    voiceSel.addEventListener('change', function () {
      cfg.voiceURI = voiceSel.value; persist(); preview();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && playing) stop();
    });

    syncUI();
  }

  function syncUI() {
    if (!panel) return;
    // 音色列表
    if (!voices.length) loadVoices();
    var cur = currentVoice();
    voiceSel.innerHTML = voices.map(function (v) {
      var label = v.name.replace(/\s*\(.*?\)\s*/g, ' ').trim();
      var tag = /en[-_]us/i.test(v.lang) ? 'US' : /en[-_]gb/i.test(v.lang) ? 'UK'
              : /en[-_]au/i.test(v.lang) ? 'AU' : (v.lang || '').toUpperCase().replace('_', '-');
      if (MALE.test(v.name) && !/female/i.test(v.name)) label += ' · 男声';
      return '<option value="' + v.voiceURI + '"' + (cur && v.voiceURI === cur.voiceURI ? ' selected' : '') + '>' +
             label + '  [' + tag + ']</option>';
    }).join('') || '<option value="">未检测到英语音色</option>';

    rateR.value = Math.round(cfg.rate * 100); rateV.textContent = (+cfg.rate).toFixed(2);
    pitchR.value = Math.round(cfg.pitch * 100); pitchV.textContent = (+cfg.pitch).toFixed(2);
    Array.prototype.forEach.call(psBox.children, function (b) {
      b.classList.toggle('on', b.dataset.p === cfg.preset);
    });
  }

  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 1800);
  }
  function fabState(on) { if (fab) fab.classList.toggle('on', !!on); }
  function subtitle(t) {
    if (!sub) return;
    if (!t) { sub.classList.remove('on'); return; }
    sub.textContent = t;
    sub.classList.add('on');
  }
  function preview() {
    var v = currentVoice();
    speakQueue(['Reading is to the mind what exercise is to the body.'], null);
    if (!v) toast('系统里没有找到英语音色，已用默认语音');
  }

  /* ================= 7. 交互绑定 ================= */
  function speakText(txt, el) {
    var clean = enOnly(txt);
    if (!clean || !hasLatin(clean)) { toast('这段里没有可朗读的英文'); return; }
    var items = splitSentences(clean, /^.{0,40}$/.test(clean) ? 400 : 170);
    speakQueue(items, el);
  }

  function addBtn(el, opts) {
    if (!el || el.dataset.ttsDone === '1') return;
    el.dataset.ttsDone = '1';
    var b = document.createElement('span');
    b.className = 'tts-btn' + (opts && opts.para ? ' tts-para-btn' : '');
    b.setAttribute('role', 'button');
    b.setAttribute('tabindex', '0');
    b.setAttribute('aria-label', '朗读');
    b.innerHTML = ICON;
    if (opts && opts.para) { el.appendChild(b); } else { el.appendChild(b); }
    b.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      speakText(textOf(el), el);
    });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); speakText(textOf(el), el); }
    });
  }

  // 单词/短语：整块可点
  function makeClickable(el) {
    if (!el || el.dataset.ttsDone === '1') return;
    el.dataset.ttsDone = '1';
    el.classList.add('tts-hot');
    el.style.cursor = 'pointer';
    var b = document.createElement('span');
    b.className = 'tts-btn';
    b.setAttribute('aria-hidden', 'true');
    b.innerHTML = ICON;
    el.appendChild(b);
    el.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) return;
      speakText(textOf(el), el);
    });
  }

  function blockBar(host, before, itemsGetter) {
    if (!host) return;
    var key = 'ttsBarSet';
    if (host.dataset[key] === '1') return;
    host.dataset[key] = '1';
    var bar = document.createElement('div');
    bar.className = 'tts-bar';
    var k = document.createElement('button');
    k.type = 'button'; k.className = 'k';
    k.innerHTML = ICON + '<span>朗读全文</span>';
    bar.appendChild(k);
    var cnt = document.createElement('span');
    cnt.textContent = '';
    bar.appendChild(cnt);

    function run() {
      var items = itemsGetter();
      if (!items.length) return;
      k.querySelector('span').textContent = '正在朗读 · 点击停止';
      playList(items);
      var t = setInterval(function () {
        if (!playing) { clearInterval(t); k.querySelector('span').textContent = '朗读全文'; }
      }, 400);
    }
    k.addEventListener('click', function () {
      if (playing) { stop(); k.querySelector('span').textContent = '朗读全文'; return; }
      run();
    });
    if (before && before.parentNode) before.parentNode.insertBefore(bar, before);
    else host.appendChild(bar);
  }

  function playList(items) {
    var all = [];
    items.forEach(function (t) { all = all.concat(splitSentences(enOnly(t), 170)); });
    speakQueue(all, null);
  }

  /* ---------- 扫描页面 ---------- */
  var SEL_SENT = '.s-en';
  var SEL_WORD = '.w, .u2, .tx-en, .vrow .a, .vrow .b, .wf b, .eg-stem, .title-en, .stem';
  var SEL_PARA = '.fen';

  function enhance() {
    if (!document.body) return;
    Array.prototype.forEach.call(document.querySelectorAll(SEL_SENT), function (el) {
      addBtn(el);
    });
    Array.prototype.forEach.call(document.querySelectorAll(SEL_WORD), function (el) {
      var t = enOnly(textOf(el));
      if (!hasLatin(t) || t.length < 2 || t.length > 220) return;
      makeClickable(el);
    });
    Array.prototype.forEach.call(document.querySelectorAll(SEL_PARA), function (el) {
      if (!hasLatin(enOnly(textOf(el)))) return;
      addBtn(el, { para: true });
    });

    // 教材原文整篇
    Array.prototype.forEach.call(document.querySelectorAll('.ft-body'), function (body) {
      if (body.dataset.ttsAll === '1') return;
      body.dataset.ttsAll = '1';
      var bar = document.createElement('div');
      bar.className = 'tts-bar';
      var k = document.createElement('button');
      k.type = 'button'; k.className = 'k';
      k.innerHTML = ICON + '<span>朗读整篇原文</span>';
      k.addEventListener('click', function () {
        if (playing) { stop(); return; }
        var ps = body.querySelectorAll('p.fen');
        playList(Array.prototype.map.call(ps, function (p) { return textOf(p); }));
      });
      bar.appendChild(k);
      var n = body.querySelectorAll('p.fen').length;
      var s = document.createElement('span');
      s.textContent = '共 ' + n + ' 段';
      bar.appendChild(s);
      body.insertBefore(bar, body.firstChild);
    });

    // 题库长文 / 范文
    Array.prototype.forEach.call(document.querySelectorAll('.passage'), function (el) {
      if (el.dataset.ttsBar === '1') return;
      el.dataset.ttsBar = '1';
      blockBar(el, el, function () { return [textOf(el)]; });
    });
    Array.prototype.forEach.call(document.querySelectorAll('.wt-ex'), function (el) {
      if (el.dataset.ttsBar === '1') return;
      el.dataset.ttsBar = '1';
      blockBar(el, el, function () {
        return Array.prototype.map.call(el.querySelectorAll('p'), function (p) { return p.textContent; });
      });
    });
  }

  /* ---------- 划词朗读 ---------- */
  function setupSelection() {
    var raf = null;
    document.addEventListener('mouseup', function (e) {
      if (selBtn && e.target === selBtn) return;
      clearTimeout(raf);
      raf = setTimeout(function () {
        var s = window.getSelection();
        var txt = s ? String(s) : '';
        if (!txt || txt.length < 2 || !hasLatin(txt)) { hideSel(); return; }
        var r = s.getRangeAt(0).getBoundingClientRect();
        if (!r || (!r.width && !r.height)) { hideSel(); return; }
        selBtn.style.left = Math.min(Math.max(8, r.left + r.width / 2 - 28), window.innerWidth - 80) + 'px';
        selBtn.style.top = Math.max(8, r.top - 40) + 'px';
        selBtn.style.display = 'flex';
        selBtn.dataset.txt = txt;
      }, 10);
    });
    document.addEventListener('mousedown', function (e) {
      if (selBtn && e.target !== selBtn) hideSel();
    });
    selBtn.addEventListener('click', function () {
      var t = selBtn.dataset.txt || '';
      hideSel();
      speakText(t, null);
    });
    window.addEventListener('scroll', hideSel, { passive: true });
  }
  function hideSel() { if (selBtn) selBtn.style.display = 'none'; }

  /* ================= 8. 启动 ================= */
  function boot() {
    if (!document.body) { document.addEventListener('DOMContentLoaded', boot); return; }
    injectCSS();
    buildUI();
    if (supported) {
      loadVoices();
      if (typeof synth.onvoiceschanged !== 'undefined') {
        synth.onvoiceschanged = function () { loadVoices(); syncUI(); };
      }
      setTimeout(function () { loadVoices(); syncUI(); }, 350);
      setTimeout(function () { loadVoices(); syncUI(); }, 1200);
    } else {
      panel.querySelector('.tip').innerHTML = '当前浏览器不支持语音朗读，请换用 Chrome / Edge / Safari。';
    }
    enhance();
    setupSelection();

    // 页面动态渲染（题库换卷、展开原文）后自动挂载
    var mo = new MutationObserver(function () {
      clearTimeout(boot._t);
      boot._t = setTimeout(enhance, 220);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // 切标签 / 隐藏页面时停止，避免后台继续念
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
    });
    window.addEventListener('message', function (e) {
      var d = e.data;
      if (d === 'tts:stop' || (d && d.tts === 'stop')) stop();
    });
    // 点击正文空白处收起面板
    document.addEventListener('click', function (e) {
      if (!panel.classList.contains('on')) return;
      if (panel.contains(e.target) || fab.contains(e.target)) return;
      panel.classList.remove('on');
    });
  }

  window.__enTTS = { speak: speakText, stop: stop, enhance: enhance, preset: PRESETS };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
