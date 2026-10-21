window.DEMOS = window.DEMOS || {};
/* ================= m01 能力路线图 ================= */
window.DEMOS.roadmap = function (root) {
  const box = root.querySelector('.demo-body');
  const STAGES = [
    { k: '① 语言补齐', mods: ['C# 补充', 'UniTask'], ok: '能独立写出事件中心，并用 async/await 串起「加载→初始化→进场景」', trap: '闭包捕获外部变量、事件忘记退订、LINQ 延迟执行导致重复计算' },
    { k: '② 引擎打底', mods: ['Unity 入门', 'Unity 基础', 'Unity 核心'], ok: '能说清一帧内的回调顺序，能解释为什么某个值在 Awake 里拿不到', trap: '脚本执行顺序、Update 与 FixedUpdate 混用、坐标系转换' },
    { k: '③ 表现与输入', mods: ['UGUI', 'TextMeshPro', 'InputSystem', '视频播放'], ok: '同一套 UI 在 16:9 / 4:3 / 19.5:9 下都不错位，输入不写两套', trap: 'CanvasScaler 的 Match 乱设、图集没规划、TMP 字体图集溢出' },
    { k: '④ 数据与网络', mods: ['ScriptableObject', 'PlayerPrefs', 'Newtonsoft.Json', 'MessagePack', '网络开发基础'], ok: '能设计一套存档结构 + 一套协议（含粘包处理与心跳）', trap: 'JsonUtility 不支持字典、协议无版本号、TCP 当消息流用' },
    { k: '⑤ 框架与热更', mods: ['程序框架', 'YooAsset', 'Addressables', 'HybridCLR'], ok: '能独立出资源热更包，并把新增业务逻辑以 DLL 形式下发', trap: '热更资源里挂了主包不存在的脚本类、AOT 泛型缺失' },
    { k: '⑥ 优化与上线', mods: ['性能优化', '背包 10 万道具', 'iOS 打包', 'Android 打包'], ok: '能把 DrawCall 压到目标值，并完成双端签名上架', trap: 'Overdraw、GC 峰值、Target API 不达标被拒、隐私清单缺失' }
  ];
  let cur = 0;
  box.innerHTML = `
    <div class="flow" id="rmFlow" style="margin:0 0 12px"></div>
    <div class="grid g2" style="margin:0">
      <div class="stat"><div class="k">当前阶段包含模块</div><div id="rmMods" style="font-size:13.2px;font-weight:500;line-height:1.7;margin-top:4px"></div></div>
      <div class="stat"><div class="k">验收标准（做不到就别往下走）</div><div id="rmOk" style="font-size:13px;font-weight:500;line-height:1.7;margin-top:4px"></div></div>
    </div>
    <div class="note warn" style="margin:10px 0 0"><span class="ni">!</span><div><b>本阶段最常见的翻车点：</b><span id="rmTrap"></span></div></div>`;

  const flow = box.querySelector('#rmFlow');
  STAGES.forEach((s, i) => {
    const d = document.createElement('div');
    d.className = 'step';
    d.style.cursor = 'pointer';
    d.innerHTML = `<b>${s.k}</b><span>${s.mods.length} 个模块</span>`;
    d.onclick = () => { cur = i; paint(); };
    flow.appendChild(d);
  });

  function paint() {
    [...flow.children].forEach((c, i) => {
      const on = i === cur;
      c.style.borderColor = on ? '#4f46e5' : 'var(--line)';
      c.style.background = on ? '#eef0ff' : '#fff';
      c.style.boxShadow = on ? '0 0 0 3px rgba(79,70,229,.10)' : 'none';
    });
    box.querySelector('#rmMods').textContent = STAGES[cur].mods.join(' · ');
    box.querySelector('#rmOk').textContent = STAGES[cur].ok;
    box.querySelector('#rmTrap').textContent = STAGES[cur].trap;
  }
  paint();
};

/* ================= m02 视频播放状态机 ================= */
window.DEMOS.video = function (root) {
  const box = root.querySelector('.demo-body');
  box.innerHTML = `
    <div class="row" style="margin-bottom:10px">
      <button class="btn run" id="vLoad">Prepare()</button>
      <button class="btn" id="vPlay">Play()</button>
      <button class="btn" id="vPause">Pause()</button>
      <button class="btn" id="vStop">Stop()</button>
      <label class="pill"><input type="checkbox" id="vLoop" style="margin-right:4px">isLooping</label>
      <span class="pill">状态：<b id="vState">Idle</b></span>
    </div>
    <div style="background:#0f1116;border-radius:9px;padding:10px 12px;font-family:var(--mono);font-size:12px;color:#9fb3c8">
      <div style="display:flex;justify-content:space-between"><span id="vTime">00:00</span><span id="vDur">00:12</span></div>
      <div style="height:5px;background:#232a35;border-radius:99px;margin:6px 0 8px;overflow:hidden"><i id="vBar" style="display:block;height:100%;width:0;background:linear-gradient(90deg,#4f46e5,#0d9488)"></i></div>
      <div id="vLog" style="height:88px;overflow:auto;white-space:pre-wrap;line-height:1.7"></div>
    </div>
    <p class="cap" style="margin:10px 0 0">要点：<code>Prepare()</code> 异步完成后才 <code>Play()</code>；未 Prepare 直接播放会黑屏 0.3–1 秒。<code>loopPointReached</code> 时若循环关闭应清空画面，避免残留最后一帧。</p>`;

  const DUR = 12;
  let state = 'Idle', t = 0, timer = null, prepared = false;
  const $ = (s) => box.querySelector(s);
  const log = (m) => { const l = $('#vLog'); l.textContent += m + '\n'; l.scrollTop = l.scrollHeight; };
  const draw = () => {
    $('#vState').textContent = state;
    $('#vBar').style.width = (t / DUR * 100) + '%';
    $('#vTime').textContent = '00:' + String(Math.floor(t)).padStart(2, '0');
    $('#vDur').textContent = '00:' + String(DUR);
  };
  const tick = () => {
    if (state !== 'Playing') return;
    t += 0.1;
    if (t >= DUR) {
      t = DUR; state = 'Ended'; clearInterval(timer); timer = null;
      log('loopPointReached（播完）');
      if ($('#vLoop').checked) { t = 0; state = 'Playing'; timer = setInterval(tick, 100); log('isLooping=true → 从头播放'); }
      else log('isLooping=false → 清空画面，避免残留末帧');
    }
    draw();
  };

  $('#vLoad').onclick = () => {
    if (prepared) { log('已 Prepare 过，无需重复'); return; }
    state = 'Preparing'; draw(); log('Prepare() 开始 —— 初始化解码器 + 预读首帧');
    setTimeout(() => { prepared = true; state = 'Prepared'; draw(); log('prepareCompleted → 可以安全 Play()'); }, 700);
  };
  $('#vPlay').onclick = () => {
    if (!prepared) { log('❌ 未 Prepare 直接 Play：低端机会黑屏卡顿'); }
    if (state === 'Playing') return;
    state = 'Playing'; draw(); log('Play()');
    if (!timer) timer = setInterval(tick, 100);
  };
  $('#vPause').onclick = () => { if (state !== 'Playing') return; state = 'Paused'; clearInterval(timer); timer = null; draw(); log('Pause()'); };
  $('#vStop').onclick = () => { state = 'Idle'; t = 0; clearInterval(timer); timer = null; draw(); log('Stop() → 释放 RT'); };
  draw();
};

/* ================= m03 委托链 ================= */
window.DEMOS.delegate = function (root) {
  const box = root.querySelector('.demo-body');
  const subs = [
    { name: 'UI 弹窗', on: true },
    { name: '音效播放', on: true, boom: true },
    { name: '成就统计', on: true },
    { name: '埋点上报', on: true }
  ];
  let isolated = true;
  box.innerHTML = `
    <div class="row" style="margin-bottom:10px">
      <label class="pill"><input type="checkbox" id="dIso" checked style="margin-right:4px">事件中心（逐订阅者 try/catch）</label>
      <button class="btn run" id="dFire">Fire(PlayerLevelUp)</button>
      <span class="pill">异常源：<b>音效播放</b></span>
    </div>
    <div id="dList" style="display:flex;flex-direction:column;gap:6px"></div>
    <div id="dOut" style="margin-top:10px;background:#0f1116;color:#c8f0d6;border-radius:9px;padding:10px 12px;font-family:var(--mono);font-size:12px;line-height:1.7;white-space:pre-wrap;min-height:76px"></div>`;

  const list = box.querySelector('#dList');
  const out = box.querySelector('#dOut');
  subs.forEach((s, i) => {
    const r = document.createElement('div');
    r.style.cssText = 'display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:8px;padding:6px 10px;background:#fff;font-size:13px';
    r.innerHTML = `<span style="color:var(--ink3);font-family:var(--mono);font-size:11px">#${i + 1}</span>
      <b style="font-weight:600">${s.name}</b>
      ${s.boom ? '<span class="pill" style="background:#fdecec;color:#b91c1c">会抛异常</span>' : ''}
      <label style="margin-left:auto;font-size:12px;color:var(--ink3)"><input type="checkbox" ${s.on ? 'checked' : ''} data-i="${i}" style="margin-right:4px">订阅</label>`;
    r.querySelector('input').onchange = (e) => { subs[i].on = e.target.checked; };
    list.appendChild(r);
  });

  box.querySelector('#dIso').onchange = (e) => { isolated = e.target.checked; };
  box.querySelector('#dFire').onclick = () => {
    out.textContent = '';
    const active = subs.filter(s => s.on);
    let i = 0;
    const step = () => {
      if (i >= active.length) { out.textContent += '\n—— 触发结束\n'; return; }
      const s = active[i];
      if (s.boom) {
        out.textContent += `  [${s.name}] 抛出异常\n`;
        if (isolated) out.textContent += `    → EventBus 捕获，继续调用后续订阅者\n`;
        else { out.textContent += `    → 普通多播中断，后面 ${active.length - i - 1} 个订阅者收不到事件（BUG）\n`; return; }
      } else {
        out.textContent += `  [${s.name}] 收到事件，处理完成\n`;
      }
      i++;
      setTimeout(step, 380);
    };
    step();
  };
};

/* ================= m04 粘包拆包 ================= */
window.DEMOS.packet = function (root) {
  const box = root.querySelector('.demo-body');
  const enc = new TextEncoder();
  const pack = (cmd, body) => {
    const b = enc.encode(body);
    const buf = new Uint8Array(6 + b.length);
    const dv = new DataView(buf.buffer);
    dv.setInt32(0, buf.length, true);
    dv.setUint16(4, cmd, true);
    buf.set(b, 6);
    return buf;
  };
  const p1 = pack(1001, 'login:icefocus');
  const p2 = pack(1002, 'chat:hello');
  const p3 = pack(1003, 'move:12,8');
  const all = new Uint8Array(p1.length + p2.length + p3.length);
  all.set(p1, 0); all.set(p2, p1.length); all.set(p3, p1.length + p2.length);

  box.innerHTML = `
    <div class="row" style="margin-bottom:8px">
      <div class="field"><span>每批字节数</span><input type="range" id="pSize" min="1" max="60" value="7" style="width:150px"></div>
      <span class="pill">已喂入 <b id="pFed">0</b> / ${all.length} B</span>
      <button class="btn run" id="pStep">喂入一批</button>
      <button class="btn" id="pAll">全部喂入</button>
      <button class="btn" id="pReset">重置</button>
    </div>
    <div class="grid g2" style="margin:8px 0">
      <div class="stat"><div class="k">接收缓冲区（未成包）</div><div class="hexbox" id="pBuf" style="margin-top:6px"></div></div>
      <div class="stat"><div class="k">已解出的完整包</div><div id="pOut" style="font-size:12.4px;margin-top:6px;font-family:var(--mono);line-height:1.8"></div></div>
    </div>
    <p class="cap" style="margin:0">把「每批字节数」拖到 1，就是最坏情况：一个包被拆成十几个批次到达，处理器必须一直等，直到凑够 Length 声明的字节数。</p>`;

  let fed = 0, buf = [], outCount = 0;
  const $ = (s) => box.querySelector(s);
  const hex = (arr) => arr.length ? arr.slice(0, 24).map(b => b.toString(16).padStart(2, '0')).join(' ') + (arr.length > 24 ? ' …' : '') : '（空）';

  function split() {
    while (true) {
      if (buf.length < 4) break;
      const dv = new DataView(new Uint8Array(buf).buffer);
      const len = dv.getInt32(0, true);
      if (buf.length < len) break;
      const cmd = dv.getUint16(4, true);
      const body = new TextDecoder().decode(new Uint8Array(buf.slice(6, len)));
      buf = buf.slice(len);
      outCount++;
      $('#pOut').innerHTML += `<div>#${outCount} cmd=${cmd} body=<span style="color:#0d9488">${body}</span> <span style="color:#7b8397">(${len}B)</span></div>`;
    }
  }
  function paint() {
    $('#pFed').textContent = fed;
    const el = $('#pBuf');
    el.innerHTML = buf.length
      ? new Uint8Array(buf).slice(0, 20).map(b => `<span>${b.toString(16).padStart(2, '0')}</span>`).join('')
      : '<span style="background:none;color:#7b8397;font-family:var(--sans)">（空，等待下一批）</span>';
  }
  function feed(n) {
    const chunk = all.slice(fed, fed + n);
    for (const b of chunk) buf.push(b);
    fed += chunk.length;
    split(); paint();
  }
  $('#pStep').onclick = () => feed(+$('#pSize').value);
  $('#pAll').onclick = () => { while (fed < all.length) feed(+$('#pSize').value); };
  $('#pReset').onclick = () => { fed = 0; buf = []; outCount = 0; $('#pOut').innerHTML = ''; paint(); };
  $('#pSize').oninput = () => {};
  paint();
};

/* ================= m05 框架启动时序 ================= */
window.DEMOS.framework = function (root) {
  const box = root.querySelector('.demo-body');
  const steps = [
    { layer: 0, t: 'GameRoot.Awake', d: '检测 Instance 重复 → DontDestroyOnLoad' },
    { layer: 1, t: 'Services.Register<IAudio>', d: '注册服务：顺序即初始化顺序' },
    { layer: 1, t: 'Services.Register<INet>', d: '网络服务就绪' },
    { layer: 1, t: 'Services.Register<ISave>', d: '存档服务就绪' },
    { layer: 2, t: 'Procedure.Change(Launch)', d: '进入启动流程：检查资源版本' },
    { layer: 2, t: 'Procedure.Change(Login)', d: '版本通过 → 进登录' },
    { layer: 3, t: 'UIStack.Push(LoginPanel)', d: '登录界面入栈（只认 INet 接口）' },
    { layer: 3, t: 'EventBus.Fire(LoginSuccess)', d: '登录成功事件 → 大厅订阅者响应' }
  ];
  const layers = ['入口层', '服务层', '流程层', '表现层'];
  box.innerHTML = `
    <div class="row" style="margin-bottom:10px">
      <button class="btn run" id="fRun">启动</button>
      <button class="btn" id="fReset">重置</button>
      <span class="pill">依赖方向：入口 → 服务 → 流程 → 表现（单向）</span>
    </div>
    <div class="grid g2" style="margin:0">
      <div>
        <div id="fLayers" style="display:flex;flex-direction:column;gap:6px"></div>
      </div>
      <div id="fLog" style="background:#0f1116;color:#c8f0d6;border-radius:9px;padding:10px 12px;font-family:var(--mono);font-size:11.8px;line-height:1.8;height:190px;overflow:auto;white-space:pre-wrap"></div>
    </div>`;
  const layerEls = layers.map((l, i) => {
    const d = document.createElement('div');
    d.style.cssText = 'border:1px solid var(--line);border-radius:9px;padding:8px 12px;background:#fff;font-size:12.6px;color:var(--ink3);transition:.2s';
    d.innerHTML = `<b style="color:var(--ink);font-size:12.8px">${l}</b><div style="font-size:11.5px">${['GameRoot', 'IAudio / INet / ISave', 'Launch → Login → Lobby', 'UI 栈 + 事件订阅'][i]}</div>`;
    box.querySelector('#fLayers').appendChild(d);
    return d;
  });
  const log = box.querySelector('#fLog');
  box.querySelector('#fRun').onclick = () => {
    layerEls.forEach(e => { e.style.borderColor = 'var(--line)'; e.style.background = '#fff'; });
    log.textContent = '';
    let i = 0;
    const step = () => {
      if (i >= steps.length) { log.textContent += '\n—— 启动完成\n'; return; }
      const s = steps[i];
      layerEls.forEach((e, j) => {
        e.style.borderColor = j === s.layer ? '#4f46e5' : 'var(--line)';
        e.style.background = j === s.layer ? '#eef0ff' : '#fff';
      });
      log.textContent += `> ${s.t}\n  ${s.d}\n`;
      log.scrollTop = log.scrollHeight;
      i++; setTimeout(step, 520);
    };
    step();
  };
  box.querySelector('#fReset').onclick = () => {
    log.textContent = ''; layerEls.forEach(e => { e.style.borderColor = 'var(--line)'; e.style.background = '#fff'; });
  };
};

/* ================= m06 生命周期 ================= */
window.DEMOS.lifecycle = function (root) {
  const box = root.querySelector('.demo-body');
  const seq = ['Awake', 'OnEnable', 'Start', 'FixedUpdate', 'Update', 'LateUpdate', 'OnDisable', 'OnDestroy'];
  const desc = {
    Awake: '实例化时一次，脚本未启用也调用 → 取引用、初始化自身',
    OnEnable: '每次启用都调用（可多次）→ 注册事件',
    Start: '第一帧 Update 前一次 → 依赖他人的初始化放这里',
    FixedUpdate: '固定 0.02s，物理计算 → 操作 Rigidbody',
    Update: '每帧一次 → 输入、计时',
    LateUpdate: '所有 Update 之后 → 相机跟随',
    OnDisable: '禁用时 → 退订事件',
    OnDestroy: '销毁时 → 释放资源'
  };
  box.innerHTML = `
    <div class="row" style="margin-bottom:8px">
      <button class="btn run" id="lcAuto">模拟一次完整生命周期</button>
      <button class="btn" id="lcFrame">走一帧（Update→LateUpdate）</button>
      <button class="btn" id="lcReset">重置</button>
    </div>
    <div id="lcOut" style="background:#0f1116;color:#c8f0d6;border-radius:9px;padding:10px 12px;font-family:var(--mono);font-size:12px;line-height:1.85;min-height:120px;white-space:pre-wrap"></div>`;
  const out = box.querySelector('#lcOut');
  let frame = 1, i = 0;
  const line = (n) => {
    out.textContent += `[F${String(frame).padStart(2, '0')}] ${n.padEnd(12, ' ')} ${desc[n]}\n`;
    out.scrollTop = out.scrollHeight;
  };
  box.querySelector('#lcAuto').onclick = () => {
    out.textContent = ''; frame = 1; i = 0;
    const order = ['Awake', 'OnEnable', 'Start', 'FixedUpdate', 'Update', 'LateUpdate'];
    const step = () => {
      if (i >= order.length) { out.textContent += '\n—— 运行中（每帧 Update / LateUpdate，每 0.02s FixedUpdate）\n'; return; }
      line(order[i]); i++; setTimeout(step, 420);
    };
    step();
  };
  box.querySelector('#lcFrame').onclick = () => { frame++; line('Update'); line('LateUpdate'); };
  box.querySelector('#lcReset').onclick = () => {
    out.textContent = '[F01] Awake        实例化时一次……\n[F01] OnEnable     每次启用都调用……\n[F01] Start        第一帧 Update 前一次……\n\n提示：Awake 的调用顺序在多个对象之间是未定义的。\n';
  };
  out.textContent = '[F01] Awake        实例化时一次……\n[F01] OnEnable     每次启用都调用……\n[F01] Start        第一帧 Update 前一次……\n\n提示：Awake 的调用顺序在多个对象之间是未定义的。\n';
};

/* ================= m07 里程碑 ================= */
window.DEMOS.milestone = function (root) {
  const box = root.querySelector('.demo-body');
  const items = [
    { k: 'proj', t: '工程与目录搭好，能进场景', d: 'Git 已初始化，Assets 分层（Scripts/Prefabs/Art/Scenes）' },
    { k: 'player', t: '玩家可控，能发射/受击', d: '输入 → 位移 → 碰撞 → 扣血' },
    { k: 'spawn', t: '敌机刷新生效', d: '定时生成 + 难度随时间上升' },
    { k: 'score', t: '计分与 UI 刷新', d: '事件驱动，UI 不反查逻辑' },
    { k: 'pool', t: '对象池替换 Instantiate', d: '子弹/敌机/特效全部走池' },
    { k: 'save', t: '最高分跨启动保留', d: 'PlayerPrefs.Save() 在关键节点调用' },
    { k: 'result', t: '结算与重开闭环', d: '死亡 → 结算 → 重开，无需重启编辑器' },
    { k: 'perf', t: 'Profiler 无持续 GC', d: '连续玩 60 秒，GC Alloc 曲线平稳' }
  ];
  const KEY = 'unity_course_milestone';
  let done = JSON.parse(localStorage.getItem(KEY) || '[]');
  box.innerHTML = `<div style="display:flex;flex-direction:column;gap:6px" id="msList"></div>
    <div class="row" style="margin-top:10px"><div class="progress" style="flex:1;height:7px"><i id="msBar" style="display:block;height:100%;width:0;background:linear-gradient(90deg,#4f46e5,#0d9488)"></i></div><span class="pill"><b id="msNum">0/8</b></span></div>`;
  const list = box.querySelector('#msList');
  items.forEach((it) => {
    const row = document.createElement('label');
    row.style.cssText = 'display:flex;gap:9px;align-items:flex-start;border:1px solid var(--line);border-radius:9px;padding:8px 11px;background:#fff;cursor:pointer';
    row.innerHTML = `<input type="checkbox" ${done.includes(it.k) ? 'checked' : ''} style="margin-top:4px">
      <span><b style="font-size:13px">${it.t}</b><span style="display:block;font-size:11.8px;color:var(--ink3);line-height:1.6">${it.d}</span></span>`;
    const cb = row.querySelector('input');
    cb.onchange = () => {
      done = cb.checked ? [...new Set([...done, it.k])] : done.filter(x => x !== it.k);
      localStorage.setItem(KEY, JSON.stringify(done));
      paint();
    };
    list.appendChild(row);
  });
  function paint() {
    box.querySelector('#msBar').style.width = (done.length / items.length * 100) + '%';
    box.querySelector('#msNum').textContent = done.length + '/' + items.length;
  }
  paint();
};

/* ================= m08 向量 ================= */
window.DEMOS.vector = function (root) {
  const box = root.querySelector('.demo-body');
  box.innerHTML = `
    <canvas id="vecCv" style="width:100%;height:250px;background:#fff;border:1px solid var(--line);border-radius:10px;cursor:crosshair"></canvas>
    <div class="row" style="margin-top:8px" id="vecStats"></div>
    <p class="cap" style="margin:8px 0 0">拖动两个端点：A 为起点，B 为终点。绿色是 a+b，橙色虚线是 B 在 A 方向上的投影（点积的几何意义）。</p>`;
  const cv = box.querySelector('#vecCv');
  const ctx = cv.getContext('2d');
  const st = box.querySelector('#vecStats');
  const W = 600, H = 250;
  let A = { x: 150, y: 180 }, B = { x: 440, y: 70 }, drag = -1;

  const dpr = window.devicePixelRatio || 1;
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.scale(dpr, dpr);

  function pos(e) {
    const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
  }
  cv.onmousedown = (e) => {
    const p = pos(e);
    drag = Math.hypot(p.x - A.x, p.y - A.y) < Math.hypot(p.x - B.x, p.y - B.y) ? 0 : 1;
    cv.onmousemove = (ev) => { const q = pos(ev); (drag === 0 ? A : B).x = q.x; (drag === 0 ? A : B).y = q.y; draw(); };
  };
  window.addEventListener('mouseup', () => { cv.onmousemove = null; });

  function arrow(x1, y1, x2, y2, color, dash) {
    ctx.save(); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 2;
    if (dash) ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
    const ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 9 * Math.cos(ang - 0.4), y2 - 9 * Math.sin(ang - 0.4));
    ctx.lineTo(x2 - 9 * Math.cos(ang + 0.4), y2 - 9 * Math.sin(ang + 0.4));
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = '#eef1f7'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // y 轴翻转：屏幕向下为正
    const ax = B.x - A.x, ay = -(B.y - A.y);
    const len = Math.hypot(ax, ay);
    const dot = ax * ax + ay * ay;                     // 以 a 与 b 同心时退化，这里直接用 |b|²
    const ang = Math.atan2(ay, ax) * 180 / Math.PI;

    arrow(A.x, A.y, B.x, B.y, '#4f46e5');
    // 单位方向延长（归一化演示）
    const ux = ax / (len || 1), uy = ay / (len || 1);
    arrow(A.x, A.y, A.x + ux * 70, A.y - uy * 70, '#0d9488');

    ctx.fillStyle = '#4f46e5'; ctx.beginPath(); ctx.arc(A.x, A.y, 6, 0, 7); ctx.fill();
    ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(B.x, B.y, 6, 0, 7); ctx.fill();
    ctx.font = '12px var(--mono), monospace'; ctx.fillStyle = '#4b5263';
    ctx.fillText('A', A.x + 9, A.y + 4); ctx.fillText('B', B.x + 9, B.y + 4);

    st.innerHTML = `
      <div class="stat"><div class="k">b - a（指向目标）</div><div class="v" style="font-size:13px">(${ax.toFixed(1)}, ${ay.toFixed(1)})</div></div>
      <div class="stat"><div class="k">长度 distance</div><div class="v">${len.toFixed(1)}</div></div>
      <div class="stat"><div class="k">归一化方向</div><div class="v" style="font-size:13px">(${ux.toFixed(2)}, ${uy.toFixed(2)})</div></div>
      <div class="stat"><div class="k">与世界 X 轴夹角</div><div class="v">${ang.toFixed(0)}°</div></div>`;
  }
  draw();
  window.addEventListener('resize', draw);
};

/* ================= m09 坐标转换 ================= */
window.DEMOS.coord = function (root) {
  const box = root.querySelector('.demo-body');
  box.innerHTML = `
    <canvas id="crdCv" style="width:100%;height:240px;background:#fff;border:1px solid var(--line);border-radius:10px;cursor:crosshair"></canvas>
    <div class="row" style="margin-top:8px">
      <div class="field"><span>相机 orthographicSize</span><input type="range" id="crdSize" min="2" max="12" value="5" style="width:130px"></div>
      <span class="pill">视口左下 = (0,0)，右上 = (1,1)</span>
    </div>
    <div class="row" style="margin-top:8px" id="crdStats"></div>`;
  const cv = box.querySelector('#crdCv');
  const ctx = cv.getContext('2d');
  const W = 600, H = 240, dpr = window.devicePixelRatio || 1;
  cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr);
  let pt = { x: 340, y: 90 };
  const stats = box.querySelector('#crdStats');
  const sizeInput = box.querySelector('#crdSize');

  function render() {
    const ortho = +sizeInput.value;
    const aspect = W / H;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = '#eef1f7';
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // 世界坐标轴（相机在中心）
    ctx.strokeStyle = '#cbd2e0'; ctx.beginPath();
    ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
    ctx.fillStyle = '#4f46e5'; ctx.beginPath(); ctx.arc(pt.x, pt.y, 6, 0, 7); ctx.fill();
    ctx.strokeStyle = '#4f46e5'; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(pt.x, 0); ctx.lineTo(pt.x, H); ctx.moveTo(0, pt.y); ctx.lineTo(W, pt.y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#7b8397'; ctx.font = '11px monospace';
    ctx.fillText(`视口 ${(pt.x / W).toFixed(3)} , ${(1 - pt.y / H).toFixed(3)}`, 8, 16);

    // 换算
    const vx = pt.x / W, vy = 1 - pt.y / H;
    const worldX = (vx - 0.5) * 2 * ortho * aspect;
    const worldY = (vy - 0.5) * 2 * ortho;
    const screenX = Math.round(pt.x / W * 1920), screenY = Math.round((1 - pt.y / H) * 1080);

    stats.innerHTML = `
      <div class="stat"><div class="k">Screen（1920×1080 像素）</div><div class="v" style="font-size:13px">(${screenX}, ${screenY})</div></div>
      <div class="stat"><div class="k">Viewport（0~1）</div><div class="v" style="font-size:13px">(${vx.toFixed(3)}, ${vy.toFixed(3)})</div></div>
      <div class="stat"><div class="k">World（正交相机）</div><div class="v" style="font-size:13px">(${worldX.toFixed(2)}, ${worldY.toFixed(2)})</div></div>`;
  }
  cv.onclick = (e) => {
    const r = cv.getBoundingClientRect();
    pt = { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
    render();
  };
  sizeInput.oninput = render;
  render();
};

/* ================= m10 UniTask 时间线 ================= */
window.DEMOS.unitask = function (root) {
  const box = root.querySelector('.demo-body');
  const STEPS = [
    { t: 'Awake/Start', w: 0.05, c: 'Awake → Start' },
    { t: 'yield null / UniTask.Yield', w: 0.12, c: '等 1 帧' },
    { t: 'WaitForSeconds 0.5s', w: 0.3, c: '等 0.5 秒' },
    { t: 'WaitUntil(anyKey)', w: 0.18, c: '等条件' },
    { t: 'WhenAll(配置,图集)', w: 0.25, c: '并行加载' },
    { t: '完成', w: 0.1, c: '收尾' }
  ];
  box.innerHTML = `
    <div class="row" style="margin-bottom:10px">
      <button class="btn run" id="utRun">播放</button>
      <button class="btn" id="utCancel">取消（CancellationToken）</button>
      <span class="pill" id="utState">Idle</span>
    </div>
    <div style="font-size:12px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="width:76px;color:var(--ink3)">协程</span><div style="flex:1;height:22px;background:#eef1f7;border-radius:6px;overflow:hidden;position:relative"><i id="utBar1" style="display:block;height:100%;width:0;background:#b9c0d4"></i></div></div>
      <div style="display:flex;align-items:center;gap:8px"><span style="width:76px;color:var(--ink3)">UniTask</span><div style="flex:1;height:22px;background:#eef1f7;border-radius:6px;overflow:hidden;position:relative"><i id="utBar2" style="display:block;height:100%;width:0;background:linear-gradient(90deg,#4f46e5,#0d9488)"></i></div></div>
    </div>
    <div id="utLog" style="margin-top:10px;background:#0f1116;color:#c8f0d6;border-radius:9px;padding:9px 12px;font-family:var(--mono);font-size:11.8px;line-height:1.8;height:104px;overflow:auto;white-space:pre-wrap"></div>`;
  const $ = (s) => box.querySelector(s);
  let timer = null, p = 0, cancelled = false;
  const log = (m) => { const l = $('#utLog'); l.textContent += m + '\n'; l.scrollTop = l.scrollHeight; };

  $('#utRun').onclick = () => {
    clearInterval(timer); p = 0; cancelled = false;
    $('#utBar1').style.width = '0'; $('#utBar2').style.width = '0';
    $('#utLog').textContent = ''; $('#utState').textContent = 'Running';
    let step = 0;
    log('▶ 同一段逻辑：等帧 → 等 0.5s → 等条件 → 并行加载');
    timer = setInterval(() => {
      p += 2.2;
      $('#utBar1').style.width = Math.min(p, 100) + '%';
      $('#utBar2').style.width = Math.min(p, 100) + '%';
      if (p > (step + 1) * 100 / STEPS.length && step < STEPS.length) {
        log('  ' + STEPS[step].t);
        step++;
      }
      if (p >= 100) {
        clearInterval(timer);
        $('#utState').textContent = 'Completed';
        log('✓ 完成：协程只能靠回调/字段传结果；UniTask 可直接 return 值');
      }
    }, 60);
  };
  $('#utCancel').onclick = () => {
    if (!timer) return;
    clearInterval(timer); timer = null;
    // 协程等价行为：StopCoroutine 只是不再推进，内部状态不清理
    $('#utBar1').style.width = $('#utBar1').style.width;
    // UniTask：异常沿 await 链传播，finally 一定执行
    $('#utBar2').style.width = $('#utBar2').style.width;
    $('#utBar2').style.background = '#cbd2e0';
    $('#utState').textContent = 'Cancelled';
    log('✕ 取消：UniTask 抛 OperationCanceledException，finally 正常执行');
    log('  协程：StopCoroutine 后既不回滚也不通知，容易留下半初始化状态');
  };
};

/* ================= m11 ScriptableObject ================= */
window.DEMOS.so = function (root) {
  const box = root.querySelector('.demo-body');
  const origin = { id: 'slime_01', hp: 100, speed: 2, dropRate: 0.3 };
  let asset = { ...origin };
  let runtime = null;
  let playing = false;
  box.innerHTML = `
    <div class="row" style="margin-bottom:8px">
      <button class="btn run" id="soPlay">进入播放模式</button>
      <button class="btn" id="soEdit">运行时改 hp +50</button>
      <button class="btn" id="soStop">退出播放模式</button>
    </div>
    <div class="row" id="soFields"></div>
    <div id="soOut" style="margin-top:10px;background:#0f1116;color:#c8f0d6;border-radius:9px;padding:9px 12px;font-family:var(--mono);font-size:11.8px;line-height:1.8;height:96px;overflow:auto;white-space:pre-wrap"></div>`;
  const $ = (s) => box.querySelector(s);
  const log = (m) => { const l = $('#soOut'); l.textContent += m + '\n'; l.scrollTop = l.scrollHeight; };

  $('#soFields').innerHTML = `
    <div class="stat"><div class="k">id（string）</div><div class="v" style="font-size:14px" id="soId">slime_01</div></div>
    <div class="stat"><div class="k">hp（int）</div><div class="v" id="soHp">100</div></div>
    <div class="stat"><div class="k">speed（float）</div><div class="v" id="soSp">2.0</div></div>
    <div class="stat"><div class="k">dropRate（0~1）</div><div class="v" id="soDr">0.30</div></div>`;
  const paint = () => {
    $('#soId').textContent = asset.id;
    $('#soHp').textContent = asset.hp;
    $('#soSp').textContent = asset.speed.toFixed(1);
    $('#soDr').textContent = asset.dropRate.toFixed(2);
  };
  $('#soPlay').onclick = () => {
    playing = true; runtime = { ...asset };
    log('▶ 进入播放：内存副本 runtime = clone(asset)，hp=' + runtime.hp);
  };
  $('#soEdit').onclick = () => {
    if (!playing) { asset.hp += 50; paint(); log('（未在播放中）改的是编辑器里的资产：hp=' + asset.hp + '，会保存'); return; }
    runtime.hp += 50; asset.hp += 50; paint();
    log('⚠ 播放中改 hp：asset.hp=' + asset.hp + '，runtime.hp=' + runtime.hp);
    log('  Editor 里看起来「改成功了」，但退出播放后会回滚');
  };
  $('#soStop').onclick = () => {
    if (!playing) return;
    playing = false;
    asset = { ...origin };      // 退出播放模式：还原
    paint();
    log('■ 退出播放：asset 回到初始值 hp=' + asset.hp + '（运行时改动全部丢失）');
    log('  结论：运行期数据必须写存档，不能写 SO');
  };
  paint();
};


/* ================= m12 PlayerPrefs 模拟器 ================= */
window.DEMOS.pp = function (root) {
  const box = root.querySelector('.demo-body');
  box.innerHTML = `
    <div class="row" style="margin-bottom:9px">
      <div class="field"><span>key</span><input id="ppK" value="Level" style="width:110px"></div>
      <div class="field"><span>类型</span><select id="ppT"><option>int</option><option>float</option><option>string</option></select></div>
      <div class="field"><span>value</span><input id="ppV" value="12" style="width:120px"></div>
      <button class="btn run" id="ppSet">Set + Save</button>
      <button class="btn" id="ppGet">Get</button>
      <button class="btn" id="ppDel">DeleteKey</button>
      <button class="btn" id="ppClr">DeleteAll</button>
    </div>
    <div class="grid g2" style="margin:0">
      <div class="stat"><div class="k">内存中的键值表</div><div id="ppTable" style="font-family:var(--mono);font-size:12px;line-height:1.9;margin-top:4px"></div></div>
      <div class="stat"><div class="k">落盘内容（plist / xml 结构模拟）</div><pre id="ppXml" style="margin:6px 0 0;font-family:var(--mono);font-size:11.4px;line-height:1.7;color:#4b5263;white-space:pre-wrap"></pre></div>
    </div>
    <p class="cap" style="margin:8px 0 0" id="ppLog">就绪。数据真实写入 localStorage，刷新页面后仍在。</p>`;
  const $ = (s) => box.querySelector(s);
  const KEY = 'unity_pp_demo';
  let db = JSON.parse(localStorage.getItem(KEY) || '{"Level":"12","Volume":"0.75","PlayerName":"icefocus"}');
  const save = () => localStorage.setItem(KEY, JSON.stringify(db));
  const render = () => {
    const keys = Object.keys(db);
    $('#ppTable').innerHTML = keys.length
      ? keys.map(k => `<div>${k} <span style="color:#7b8397">→</span> <span style="color:#0d9488">${db[k]}</span></div>`).join('')
      : '<span style="color:#7b8397">（空）</span>';
    $('#ppXml').textContent =
      '<?xml version="1.0" encoding="UTF-8"?>\n<plist version="1.0">\n<dict>\n' +
      keys.map(k => `  <key>${k}</key>\n  <string>${db[k]}</string>`).join('\n') +
      (keys.length ? '\n' : '') + '</dict>\n</plist>';
  };
  $('#ppSet').onclick = () => {
    const t = $('#ppT').value, v = $('#ppV').value, k = $('#ppK').value.trim();
    if (!k) return;
    db[k] = t === 'int' ? String(parseInt(v) || 0) : t === 'float' ? String((+v).toFixed(2)) : v;
    save(); render(); $('#ppLog').textContent = `Set${t === 'int' ? 'Int' : t === 'float' ? 'Float' : 'String'}("${k}") + Save()`;
  };
  $('#ppGet').onclick = () => {
    const k = $('#ppK').value.trim();
    $('#ppLog').textContent = k in db ? `Get → "${db[k]}"` : `Get("${k}", 默认值) → 键不存在，返回默认值`;
  };
  $('#ppDel').onclick = () => { delete db[$('#ppK').value.trim()]; save(); render(); $('#ppLog').textContent = 'DeleteKey → 已删除'; };
  $('#ppClr').onclick = () => { db = {}; save(); render(); $('#ppLog').textContent = 'DeleteAll → 全部清空（含音量等设置项）'; };
  render();

  // 同页第二个演示块：平台路径
  const c = document.getElementById('m01c'), pr = document.getElementById('m01p'),
        plat = document.getElementById('m01plat'), path = document.getElementById('m01path');
  if (c && pr && plat && path) {
    const paint = () => {
      const co = c.value || 'Company', pd = pr.value || 'Product';
      const p = plat.value;
      const map = {
        win: `HKEY_CURRENT_USER\\Software\\${co}\\${pd}`,
        mac: `~/Library/Preferences/unity.${co}.${pd}.plist`,
        ios: `<沙盒>/Library/Preferences/unity.${co}.${pd}.plist`,
        and: `/data/data/com.${co.toLowerCase()}.${pd.toLowerCase()}/shared_prefs/com.${co.toLowerCase()}.${pd.toLowerCase()}.v2.playerprefs.xml`,
        web: `IndexedDB → /idbfs/${co}_${pd}`
      };
      path.textContent = map[p];
    };
    [c, pr].forEach(el => el.oninput = paint);
    plat.onchange = paint;
    paint();
  }
};

/* ================= m13 JSON 映射 ================= */
window.DEMOS.json = function (root) {
  const box = root.querySelector('.demo-body');
  const data = {
    name: 'icefocus', level: 12,
    skills: ['火球', '闪现'],
    items: { '金币': 999, '宝石': 20 },
    weapon: { id: 1001, atk: 35 }
  };
  box.innerHTML = `
    <div class="row" style="margin-bottom:9px">
      <label class="pill"><input type="checkbox" id="jsIndent" checked style="margin-right:4px">Formatting.Indented</label>
      <label class="pill"><input type="checkbox" id="jsCamel" style="margin-right:4px">camelCase 命名</label>
      <label class="pill"><input type="checkbox" id="jsDict" style="margin-right:4px">把 items 换成 Dictionary</label>
    </div>
    <div class="grid g2" style="margin:0;align-items:start">
      <div class="stat" style="padding:8px 10px"><div class="k">C# 类结构（点击字段）</div><div id="jsTree" style="margin-top:6px;font-family:var(--mono);font-size:12px;line-height:1.9"></div></div>
      <div class="stat" style="padding:8px 10px"><div class="k">序列化结果</div><pre id="jsOut" style="margin:6px 0 0;font-family:var(--mono);font-size:11.8px;line-height:1.75;color:#2f3547;white-space:pre-wrap;max-height:250px;overflow:auto"></pre></div>
    </div>
    <p class="cap" style="margin:8px 0 0" id="jsNote">规则：类 / 字典 → {}，数组 / List → []，字段名 → key。</p>`;
  const $ = (s) => box.querySelector(s);

  function render() {
    const camel = $('#jsCamel').checked;
    const indent = $('#jsIndent').checked;
    const nm = (k) => camel ? k[0].toLowerCase() + k.slice(1) : k;
    const obj = {
      [nm('name')]: data.name, [nm('level')]: data.level,
      [nm('skills')]: data.skills,
      [nm('items')]: data.items,
      [nm('weapon')]: { [nm('id')]: data.weapon.id, [nm('atk')]: data.weapon.atk }
    };
    const out = indent ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
    $('#jsOut').textContent = out;
    $('#jsTree').innerHTML = `
      <div data-p="name">public string <b style="color:#4f46e5">name</b>;</div>
      <div data-p="level">public int <b style="color:#4f46e5">level</b>;</div>
      <div data-p="skills">public List&lt;string&gt; <b style="color:#4f46e5">skills</b>;</div>
      <div data-p="items">public Dictionary&lt;string,int&gt; <b style="color:#4f46e5">items</b>;</div>
      <div data-p="weapon">public Equip <b style="color:#4f46e5">weapon</b>;</div>
      <div style="padding-left:14px;color:#7b8397">└ data-p="weapon.id / weapon.atk"</div>`;
    const dict = $('#jsDict').checked;
    $('#jsNote').textContent = dict
      ? '⚠ JsonUtility 遇到 Dictionary 会输出 {} —— 数据静默丢失。这正是必须用 Newtonsoft 的原因。'
      : '规则：类 / 字典 → {}，数组 / List → []，字段名 → key。';
    $('#jsNote').style.color = dict ? '#b45309' : '';
  }
  ['jsIndent', 'jsCamel', 'jsDict'].forEach(id => $('#' + id).onchange = render);
  render();
};

/* ================= m14 MessagePack 体积 ================= */
window.DEMOS.msgpack = function (root) {
  const box = root.querySelector('.demo-body');
  const data = {
    name: 'icefocus', level: 12,
    skills: ['火球', '闪现', '治疗'],
    items: { '金币': 999, '宝石': 20, '钥匙': 3 }
  };
  // 极简 msgpack 编码（仅本演示用的类型）
  function encStr(s) {
    const b = new TextEncoder().encode(s);
    if (b.length < 32) return [0xa0 | b.length, ...b];
    return [0xd9, b.length, ...b];
  }
  function encInt(n) {
    if (n >= 0 && n < 128) return [n];
    if (n >= 0 && n < 256) return [0xcc, n];
    if (n >= 0 && n < 65536) return [0xcd, n >> 8, n & 255];
    return [0xce, (n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  }
  function enc(v) {
    if (typeof v === 'number') return encInt(v);
    if (typeof v === 'string') return encStr(v);
    if (Array.isArray(v)) return [0x90 | v.length, ...v.flatMap(enc)];
    if (typeof v === 'object') return [0x80 | Object.keys(v).length, ...Object.keys(v).flatMap(k => [...encStr(k), ...enc(v[k])])];
    return [];
  }
  const bytes = enc(data);
  const jsonText = JSON.stringify(data);
  const jsonBytes = new TextEncoder().encode(jsonText).length;

  box.innerHTML = `
    <div class="row" style="margin-bottom:10px">
      <div class="stat"><div class="k">JSON（UTF-8）</div><div class="v">${jsonBytes} <small>B</small></div></div>
      <div class="stat"><div class="k">MessagePack</div><div class="v" style="color:#0d9488">${bytes.length} <small>B</small></div></div>
      <div class="stat"><div class="k">缩减</div><div class="v" style="color:#b45309">${(100 - bytes.length / jsonBytes * 100).toFixed(1)}<small>%</small></div></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:8px"><span style="width:74px;font-size:11.5px;color:var(--ink3)">JSON</span><div style="flex:1;height:18px;background:#eef1f7;border-radius:5px;overflow:hidden"><i style="display:block;height:100%;width:100%;background:#c0c6d6"></i></div><span style="font-family:var(--mono);font-size:11.5px">${jsonBytes}B</span></div>
      <div style="display:flex;align-items:center;gap:8px"><span style="width:74px;font-size:11.5px;color:var(--ink3)">MsgPack</span><div style="flex:1;height:18px;background:#eef1f7;border-radius:5px;overflow:hidden"><i style="display:block;height:100%;width:${bytes.length / jsonBytes * 100}%;background:linear-gradient(90deg,#0d9488,#4f46e5)"></i></div><span style="font-family:var(--mono);font-size:11.5px">${bytes.length}B</span></div>
    </div>
    <div class="stat"><div class="k">编码后的字节（十六进制）</div><div class="hexbox" style="margin-top:6px">${bytes.map(b => `<span>${b.toString(16).padStart(2, '0')}</span>`).join('')}</div></div>
    <p class="cap" style="margin:8px 0 0">键名仍然占用字节 —— 字段名越短、数据条数越多，省得越多。这也是 <code>[Key(0)]</code> 用序号代替名字的原因。</p>`;
};

/* ================= m15 CanvasScaler ================= */
window.DEMOS.scaler = function (root) {
  const box = root.querySelector('.demo-body');
  box.innerHTML = `
    <div class="row" style="margin-bottom:8px">
      <div class="field"><span>设备分辨率</span>
        <select id="scDev">
          <option value="1920x1080">1920 × 1080（16:9 横）</option>
          <option value="2340x1080">2340 × 1080（19.5:9 刘海）</option>
          <option value="2732x2048">2732 × 2048（4:3 iPad）</option>
          <option value="1080x1920">1080 × 1920（9:16 竖）</option>
        </select>
      </div>
      <div class="field"><span>参考分辨率</span><input id="scRef" value="1920x1080" style="width:110px"></div>
      <div class="field"><span>Match</span><input type="range" id="scMatch" min="0" max="1" step="0.05" value="0.5" style="width:130px"></div>
      <span class="pill" id="scMode">ScaleWithScreenSize</span>
    </div>
    <canvas id="scCv" style="width:100%;height:180px;background:#fff;border:1px solid var(--line);border-radius:10px"></canvas>
    <div class="row" style="margin-top:8px" id="scStats"></div>`;
  const cv = box.querySelector('#scCv'), ctx = cv.getContext('2d');
  const W = 600, H = 180, dpr = window.devicePixelRatio || 1;
  cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr);

  function calc() {
    const [sw, sh] = box.querySelector('#scDev').value.split('x').map(Number);
    const [rw, rh] = box.querySelector('#scRef').value.split('x').map(Number);
    const match = +box.querySelector('#scMatch').value;
    const lw = Math.log2(sw / rw), lh = Math.log2(sh / rh);
    const scale = Math.pow(2, lw * (1 - match) + lh * match);
    return { sw, sh, rw, rh, match, scale, cw: sw / scale, ch: sh / scale };
  }
  function draw() {
    const r = calc();
    ctx.clearRect(0, 0, W, H);
    // 屏幕外框：等比放进画布
    const maxW = W - 60, maxH = H - 40;
    let boxW = maxW, boxH = boxW * r.sh / r.sw;
    if (boxH > maxH) { boxH = maxH; boxW = boxH * r.sw / r.sh; }
    const x0 = (W - boxW) / 2, y0 = (H - boxH) / 2;
    ctx.strokeStyle = '#cbd2e0'; ctx.lineWidth = 2; ctx.strokeRect(x0, y0, boxW, boxH);
    // 600×200 的 UI 元素缩放后的真实像素 → 映射到画布
    const pxW = 600 * r.scale * (boxW / r.sw);
    const pxH = 200 * r.scale * (boxH / r.sh);
    ctx.fillStyle = 'rgba(79,70,229,.14)'; ctx.strokeStyle = '#4f46e5'; ctx.lineWidth = 1.5;
    ctx.fillRect(x0 + 10, y0 + 10, pxW, pxH);
    ctx.strokeRect(x0 + 10, y0 + 10, pxW, pxH);
    ctx.fillStyle = '#312e94'; ctx.font = '11px monospace';
    ctx.fillText('600×200 (参考单位)', x0 + 16, y0 + 26);
    // 超出提示
    if (pxH > boxH - 20) {
      ctx.fillStyle = '#b45309'; ctx.fillText('↑ 元素超出屏幕高度', x0 + 16, y0 + boxH - 8);
    }
    box.querySelector('#scStats').innerHTML = `
      <div class="stat"><div class="k">scaleFactor</div><div class="v">${r.scale.toFixed(3)}</div></div>
      <div class="stat"><div class="k">画布逻辑尺寸（UI 单位）</div><div class="v" style="font-size:13px">${r.cw.toFixed(0)} × ${r.ch.toFixed(0)}</div></div>
      <div class="stat"><div class="k">600×200 元素的真实像素</div><div class="v" style="font-size:13px">${(600 * r.scale).toFixed(0)} × ${(200 * r.scale).toFixed(0)}</div></div>`;
  }
  ['scDev', 'scMatch'].forEach(id => box.querySelector('#' + id).oninput = draw);
  box.querySelector('#scRef').oninput = draw;
  draw();
};

/* ================= m16 TMP 富文本 ================= */
window.DEMOS.tmp = function (root) {
  const box = root.querySelector('.demo-body');
  box.innerHTML = `
    <div class="row" style="margin-bottom:8px">
      <span class="pill" data-tag="&lt;b&gt;粗体&lt;/b&gt;">b</span>
      <span class="pill" data-tag="&lt;i&gt;斜体&lt;/i&gt;">i</span>
      <span class="pill" data-tag="&lt;color=#4f46e5&gt;紫色&lt;/color&gt;">color</span>
      <span class="pill" data-tag="&lt;size=36&gt;大字&lt;/size&gt;">size</span>
      <span class="pill" data-tag="&lt;mark=#ffff00aa&gt;高亮&lt;/mark&gt;">mark</span>
      <span class="pill" data-tag="&lt;align=center&gt;居中行&lt;/align&gt;">align</span>
      <span class="pill" data-tag="&lt;sprite=3&gt;">sprite</span>
    </div>
    <textarea id="tmpIn" style="width:100%;height:64px;border:1px solid var(--line);border-radius:9px;padding:8px 10px;font-family:var(--mono);font-size:12.5px;resize:vertical">暴击 &lt;color=#4f46e5&gt;&lt;b&gt;-12&lt;/b&gt;&lt;/color&gt; &lt;size=70%&gt;HP&lt;/size&gt;  &lt;mark=#ffe9a8&gt;连击 ×3&lt;/mark&gt;</textarea>
    <div id="tmpOut" style="margin-top:8px;background:#fff;border:1px dashed var(--line);border-radius:9px;padding:14px 16px;min-height:60px;font-size:20px;line-height:1.6"></div>
    <p class="cap" style="margin:8px 0 0">输入 TMP 标签，实时看渲染效果（sprite 标签在本演示中显示为图标占位）。</p>`;
  const inp = box.querySelector('#tmpIn'), out = box.querySelector('#tmpOut');
  function render() {
    let h = inp.value
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/g, '<b>$1</b>')
      .replace(/&lt;i&gt;(.*?)&lt;\/i&gt;/g, '<i>$1</i>')
      .replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/g, '<u>$1</u>')
      .replace(/&lt;color=([^&]+?)&gt;(.*?)&lt;\/color&gt;/g, '<span style="color:$1">$2</span>')
      .replace(/&lt;size=(\d+)&gt;(.*?)&lt;\/size&gt;/g, '<span style="font-size:$1px">$2</span>')
      .replace(/&lt;size=(\d+)%&gt;(.*?)&lt;\/size&gt;/g, '<span style="font-size:0.7em">$2</span>')
      .replace(/&lt;mark=([^&]+?)&gt;(.*?)&lt;\/mark&gt;/g, '<span style="background:$1;border-radius:3px;padding:0 3px">$2</span>')
      .replace(/&lt;align=center&gt;(.*?)&lt;\/align&gt;/g, '<div style="text-align:center">$1</div>')
      .replace(/&lt;sprite=\d+&gt;/g, '<span style="display:inline-block;width:18px;height:18px;background:#fde68a;border-radius:3px;vertical-align:-3px"></span>')
      .replace(/\n/g, '<br>');
    out.innerHTML = h;
  }
  box.querySelectorAll('[data-tag]').forEach(el => {
    el.style.cursor = 'pointer';
    el.onclick = () => { inp.value += el.dataset.tag; render(); };
  });
  inp.oninput = render;
  render();
};

/* ================= m17 输入可视化 ================= */
window.DEMOS.input = function (root) {
  const box = root.querySelector('.demo-body');
  const rows = [['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'], ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'], ['Z', 'X', 'C', 'V', 'B', 'N', 'M']];
  box.innerHTML = `
    <div class="grid g2" style="margin:0;align-items:start">
      <div>
        <div id="kb" style="display:flex;flex-direction:column;gap:4px"></div>
        <div id="inpLog" style="margin-top:8px;font-family:var(--mono);font-size:11.5px;color:var(--ink3)">点这里获取焦点，然后按键</div>
      </div>
      <div>
        <div class="stat" style="margin-bottom:6px"><div class="k">鼠标位置（相对画布）</div><div class="v" style="font-size:13px" id="msPos">(0, 0)</div></div>
        <div id="pad" style="height:110px;background:#fff;border:1px solid var(--line);border-radius:10px;position:relative;overflow:hidden;cursor:crosshair">
          <div id="padDot" style="position:absolute;width:12px;height:12px;border-radius:50%;background:#4f46e5;transform:translate(-50%,-50%);left:50%;top:50%"></div>
          <span style="position:absolute;left:8px;top:6px;font-size:11px;color:var(--ink3)">虚拟摇杆（拖动）</span>
        </div>
        <div class="row" style="margin-top:6px"><div class="stat"><div class="k">leftStick</div><div class="v" style="font-size:13px" id="stickV">(0.00, 0.00)</div></div></div>
      </div>
    </div>`;
  const kb = box.querySelector('#kb');
  const keys = {};
  rows.forEach(r => {
    const line = document.createElement('div');
    line.style.cssText = 'display:flex;gap:4px';
    r.forEach(k => {
      const d = document.createElement('div');
      d.textContent = k; d.dataset.k = k;
      d.style.cssText = 'flex:1;text-align:center;font-family:var(--mono);font-size:11.5px;padding:6px 0;border:1px solid var(--line);border-radius:6px;background:#fff;color:var(--ink2);transition:.08s';
      keys[k] = d; line.appendChild(d);
    });
    kb.appendChild(line);
  });
  const log = box.querySelector('#inpLog');
  const down = (e) => {
    const k = e.key.toUpperCase();
    if (keys[k]) { keys[k].style.background = '#eef0ff'; keys[k].style.borderColor = '#4f46e5'; keys[k].style.color = '#312e94'; }
    log.textContent = `kb.${k.toLowerCase()}Key.wasPressedThisFrame  →  "按下 ${e.key}"`;
  };
  const up = (e) => {
    const k = e.key.toUpperCase();
    if (keys[k]) { keys[k].style.background = '#fff'; keys[k].style.borderColor = 'var(--line)'; keys[k].style.color = 'var(--ink2)'; }
  };
  box.tabIndex = 0;
  box.addEventListener('keydown', down);
  box.addEventListener('keyup', up);
  box.style.outline = 'none';

  const pad = box.querySelector('#pad'), dot = box.querySelector('#padDot');
  let drag = false;
  const move = (e) => {
    const r = pad.getBoundingClientRect();
    const x = Math.max(0, Math.min(r.width, e.clientX - r.left));
    const y = Math.max(0, Math.min(r.height, e.clientY - r.top));
    dot.style.left = x + 'px'; dot.style.top = y + 'px';
    const nx = (x / r.width - 0.5) * 2, ny = -(y / r.height - 0.5) * 2;
    box.querySelector('#stickV').textContent = `(${nx.toFixed(2)}, ${ny.toFixed(2)})`;
    box.querySelector('#msPos').textContent = `(${Math.round(x)}, ${Math.round(y)})`;
  };
  pad.onpointerdown = (e) => { drag = true; move(e); };
  pad.onpointermove = (e) => { if (drag) move(e); };
  window.addEventListener('pointerup', () => { drag = false; });
};

/* ================= m18 YooAsset 流程 ================= */
window.DEMOS.yooasset = function (root) {
  const box = root.querySelector('.demo-body');
  const steps = [
    ['初始化 Package', 'HostPlayMode · 指定远程地址', 420],
    ['请求版本号', 'PackageVersion = 1.0.7（本地 1.0.5）', 380],
    ['更新清单', 'PackageManifest 下载完成，共 1,284 个资源', 460],
    ['下载补丁', '差异文件 23 个 / 8.4 MB', 1200],
    ['加载资源', 'LoadAssetAsync<GameObject>(LoginPanel)', 380]
  ];
  box.innerHTML = `
    <div class="row" style="margin-bottom:9px"><button class="btn run" id="yaRun">启动流程</button><span class="pill" id="yaState">Ready</span></div>
    <div id="yaList" style="display:flex;flex-direction:column;gap:6px"></div>
    <div class="stat" style="margin-top:8px"><div class="k">下载进度</div><div style="height:6px;background:#eef1f7;border-radius:99px;margin-top:6px;overflow:hidden"><i id="yaBar" style="display:block;height:100%;width:0;background:linear-gradient(90deg,#0d9488,#4f46e5);transition:width .2s"></i></div></div>`;
  const list = box.querySelector('#yaList');
  const rows = steps.map(([t, d]) => {
    const el = document.createElement('div');
    el.style.cssText = 'display:flex;gap:9px;align-items:center;border:1px solid var(--line);border-radius:8px;padding:7px 11px;background:#fff;font-size:12.5px;opacity:.5';
    el.innerHTML = `<span style="width:16px;height:16px;border-radius:50%;border:2px solid #cbd2e0;flex:0 0 16px"></span><b style="font-weight:600">${t}</b><span style="color:var(--ink3);font-size:11.6px">${d}</span>`;
    list.appendChild(el);
    return el;
  });
  box.querySelector('#yaRun').onclick = () => {
    rows.forEach(r => { r.style.opacity = .45; r.style.borderColor = 'var(--line)'; r.querySelector('span').style.background = 'transparent'; });
    box.querySelector('#yaBar').style.width = '0';
    box.querySelector('#yaState').textContent = 'Running';
    let i = 0;
    const next = () => {
      if (i >= steps.length) { box.querySelector('#yaState').textContent = 'Done'; return; }
      const r = rows[i];
      r.style.opacity = 1; r.style.borderColor = '#4f46e5';
      r.querySelector('span').style.background = '#4f46e5';
      if (i === 3) {
        let p = 0;
        const t = setInterval(() => {
          p += 7; box.querySelector('#yaBar').style.width = Math.min(p, 100) + '%';
          if (p >= 100) clearInterval(t);
        }, 80);
      }
      i++; setTimeout(next, steps[i - 1][2]);
    };
    next();
  };
};

/* ================= m19 Addressables 引用计数 ================= */
window.DEMOS.addr = function (root) {
  const box = root.querySelector('.demo-body');
  let ref = 0;
  const logs = [];
  box.innerHTML = `
    <div class="row" style="margin-bottom:9px">
      <button class="btn run" id="adLoad">LoadAssetAsync("coin")</button>
      <button class="btn" id="adRel">Release(handle)</button>
      <button class="btn" id="adUnload">UnloadUnusedAssets</button>
    </div>
    <div class="row" style="align-items:stretch">
      <div class="stat"><div class="k">引用计数</div><div class="v" id="adRef">0</div></div>
      <div class="stat"><div class="k">内存中是否常驻</div><div class="v" style="font-size:14px" id="adMem">未加载</div></div>
      <div class="stat"><div class="k">说明</div><div style="font-size:11.8px;color:var(--ink2);margin-top:4px" id="adTip">同一资源多次加载共享同一份内存</div></div>
    </div>
    <div id="adLog" style="margin-top:9px;background:#0f1116;color:#c8f0d6;border-radius:9px;padding:9px 12px;font-family:var(--mono);font-size:11.6px;line-height:1.8;height:92px;overflow:auto;white-space:pre-wrap"></div>`;
  const $ = (s) => box.querySelector(s);
  const paint = () => {
    $('#adRef').textContent = ref;
    $('#adRef').style.color = ref > 0 ? '#0d9488' : '#b45309';
    $('#adMem').textContent = ref > 0 ? '常驻（可复用）' : '可被卸载';
    $('#adMem').style.color = ref > 0 ? '#0d9488' : '#7b8397';
  };
  const log = (m) => { $('#adLog').textContent += m + '\n'; $('#adLog').scrollTop = 1e6; };
  $('#adLoad').onclick = () => { ref++; paint(); log(`LoadAssetAsync → 引用计数 ${ref}${ref > 1 ? '（复用已有内存，不重复加载）' : ''}`); };
  $('#adRel').onclick = () => {
    if (ref === 0) { log('⚠ 已经在 0，重复 Release 会抛异常或造成悬空'); return; }
    ref--; paint(); log(`Release → 引用计数 ${ref}${ref === 0 ? '，此时资源可被卸载' : '，内存仍然保留'}`);
  };
  $('#adUnload').onclick = () => {
    if (ref > 0) { log(`UnloadUnusedAssets：引用计数 ${ref} > 0，资源不会被卸载`); return; }
    log('UnloadUnusedAssets：引用计数为 0 → 内存已释放');
  };
  paint();
};

/* ================= m20 HybridCLR 流程 ================= */
window.DEMOS.hybridclr = function (root) {
  const box = root.querySelector('.demo-body');
  const nodes = [
    { id: 'aot', t: '主包 AOT', d: 'IL2CPP 编译，不可改' },
    { id: 'dll', t: '热更 DLL', d: 'Assembly.Load(bytes)' },
    { id: 'meta', t: '补充元数据', d: 'LoadMetadataForAOTAssembly' },
    { id: 'entry', t: '反射入口', d: 'HotUpdateEntry.Main()' }
  ];
  box.innerHTML = `
    <div class="row" style="margin-bottom:9px"><button class="btn run" id="hcRun">初始化</button><span class="pill" id="hcState">Idle</span></div>
    <div id="hcFlow" style="display:flex;gap:8px;flex-wrap:wrap"></div>
    <div id="hcLog" style="margin-top:9px;background:#0f1116;color:#c8f0d6;border-radius:9px;padding:9px 12px;font-family:var(--mono);font-size:11.6px;line-height:1.8;height:96px;overflow:auto;white-space:pre-wrap"></div>`;
  const flow = box.querySelector('#hcFlow');
  const els = nodes.map(n => {
    const d = document.createElement('div');
    d.style.cssText = 'flex:1;min-width:120px;border:1px solid var(--line);border-radius:9px;padding:9px 11px;background:#fff;opacity:.45;transition:.2s';
    d.innerHTML = `<b style="font-size:12.6px">${n.t}</b><span style="display:block;font-size:11.4px;color:var(--ink3);line-height:1.6">${n.d}</span>`;
    flow.appendChild(d);
    return d;
  });
  const log = box.querySelector('#hcLog');
  box.querySelector('#hcRun').onclick = () => {
    els.forEach(e => { e.style.opacity = .45; e.style.borderColor = 'var(--line)'; e.style.background = '#fff'; });
    log.textContent = ''; box.querySelector('#hcState').textContent = 'Loading';
    let i = 0;
    const step = () => {
      if (i >= nodes.length) {
        box.querySelector('#hcState').textContent = 'Running';
        log.textContent += '\n热更逻辑已在解释器中运行（性能约为 AOT 的 1/3 ~ 1/10）\n';
        return;
      }
      els[i].style.opacity = 1; els[i].style.borderColor = '#4f46e5'; els[i].style.background = '#eef0ff';
      log.textContent += '> ' + nodes[i].t + '  ' + nodes[i].d + '\n';
      log.scrollTop = 1e6;
      i++; setTimeout(step, 600);
    };
    step();
  };
};

/* ================= m21 合批模拟 ================= */
window.DEMOS.batching = function (root) {
  const box = root.querySelector('.demo-body');
  const atlas = ['A', 'B', 'C', '无'];
  const items = Array.from({ length: 12 }, (_, i) => ({ id: i, at: i % 4 }));
  let instancing = false;
  box.innerHTML = `
    <div class="row" style="margin-bottom:8px">
      <label class="pill"><input type="checkbox" id="btInst" style="margin-right:4px">开启 SRP Batcher / Instancing</label>
      <span class="pill">点方块切换图集</span>
    </div>
    <div id="btGrid" style="display:grid;grid-template-columns:repeat(12,1fr);gap:5px;margin-bottom:10px"></div>
    <div class="row" id="btStats"></div>`;
  const grid = box.querySelector('#btGrid');
  const colors = { A: '#4f46e5', B: '#0d9488', C: '#f97316', '无': '#cbd2e0' };
  const cells = items.map(it => {
    const d = document.createElement('div');
    d.style.cssText = 'aspect-ratio:1;border-radius:6px;display:grid;place-items:center;color:#fff;font-size:11px;font-family:var(--mono);cursor:pointer;transition:.15s';
    d.onclick = () => {
      it.at = (it.at + 1) % 4;
      // 改成“同图集但不同材质”的对比：这里用直接切换
      paint();
    };
    grid.appendChild(d);
    return d;
  });
  function paint() {
    cells.forEach((c, i) => {
      const it = items[i];
      const key = atlas[it.at];
      c.style.background = colors[key];
      c.textContent = key;
      c.style.opacity = key === '无' ? .5 : 1;
    });
    // 批次 = 不同图集分组数（无图集每项单独一批）
    let batches = 0;
    const groups = {};
    items.forEach(it => { const k = atlas[it.at]; if (k === '无') batches++; else groups[k] = 1; });
    batches += Object.keys(groups).length;
    const dc = instancing ? Math.max(1, Object.keys(groups).length) : batches;
    box.querySelector('#btStats').innerHTML = `
      <div class="stat"><div class="k">DrawCall</div><div class="v" style="color:${dc > 5 ? '#b91c1c' : '#0d9488'}">${dc}</div></div>
      <div class="stat"><div class="k">图集分组</div><div class="v" style="font-size:13px">${Object.keys(groups).join(' / ') || '—'}</div></div>
      <div class="stat"><div class="k">散图（无图集）</div><div class="v" style="font-size:13px">${items.filter(i => atlas[i.at] === '无').length} 个 = 各自一批</div></div>`;
  }
  box.querySelector('#btInst').onchange = (e) => { instancing = e.target.checked; paint(); };
  paint();
};

/* ================= m22 10 万数据实测 ================= */
window.DEMOS.inventory = function (root) {
  const box = root.querySelector('.demo-body');
  box.innerHTML = `
    <div class="row" style="margin-bottom:9px">
      <button class="btn run" id="ivBuild">生成 10 万条数据</button>
      <button class="btn" id="ivList">List 顺序查找 1000 次</button>
      <button class="btn" id="ivDict">Dictionary 查找 1000 次</button>
      <span class="pill" id="ivState">未生成</span>
    </div>
    <div class="row" id="ivStats"></div>
    <div id="ivOut" style="margin-top:9px;background:#0f1116;color:#c8f0d6;border-radius:9px;padding:9px 12px;font-family:var(--mono);font-size:11.6px;line-height:1.8;height:86px;overflow:auto;white-space:pre-wrap"></div>`;
  const $ = (s) => box.querySelector(s);
  let list = [], dict = new Map(), targets = [];
  const log = (m) => { $('#ivOut').textContent += m + '\n'; $('#ivOut').scrollTop = 1e6; };
  const paint = (r) => {
    $('#ivStats').innerHTML = `
      <div class="stat"><div class="k">数据量</div><div class="v">${list.length ? (list.length / 10000).toFixed(0) + ' 万' : '—'}</div></div>
      <div class="stat"><div class="k">List 耗时</div><div class="v" style="font-size:15px">${r && r.list != null ? r.list.toFixed(1) + ' ms' : '—'}</div></div>
      <div class="stat"><div class="k">Dictionary 耗时</div><div class="v" style="font-size:15px">${r && r.dict != null ? r.dict.toFixed(1) + ' ms' : '—'}</div></div>
      <div class="stat"><div class="k">倍数</div><div class="v" style="font-size:15px;color:#b45309">${r && r.list && r.dict ? (r.list / r.dict).toFixed(0) + '×' : '—'}</div></div>`;
  };
  $('#ivBuild').onclick = () => {
    list = new Array(100000);
    dict = new Map();
    for (let i = 0; i < 100000; i++) {
      const it = { id: i, name: 'item_' + i, count: (i * 7) % 99 };
      list[i] = it; dict.set(i, it);
    }
    targets = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 100000));
    $('#ivState').textContent = '已生成 100000 条';
    log('生成完成：List<Item> 100000 条 + Dictionary<long,Item> 100000 条');
    paint(null);
  };
  const time = (fn) => { const t0 = performance.now(); fn(); return performance.now() - t0; };
  let res = {};
  $('#ivList').onclick = () => {
    if (!list.length) { log('请先生成数据'); return; }
    const ms = time(() => {
      let hit = 0;
      for (const t of targets) {
        for (let i = 0; i < list.length; i++) if (list[i].id === t) { hit++; break; }
      }
      return hit;
    });
    res.list = ms; paint(res);
    log(`List 线性查找 1000 次：${ms.toFixed(1)} ms（平均每次约 ${(ms / 1000 * 1000).toFixed(0)} µs）`);
  };
  $('#ivDict').onclick = () => {
    if (!list.length) { log('请先生成数据'); return; }
    const ms = time(() => {
      let hit = 0;
      for (const t of targets) if (dict.has(t)) hit++;
      return hit;
    });
    res.dict = ms; paint(res);
    log(`Dictionary 查找 1000 次：${ms.toFixed(2)} ms（哈希定位，与数据量基本无关）`);
  };
  paint(null);
};

/* ================= m23 iOS 检查清单 ================= */
window.DEMOS.ios = function (root) {
  const box = root.querySelector('.demo-body');
  const items = [
    ['Bundle Identifier 已填（com.company.product）', 1],
    ['Scripting Backend = IL2CPP', 1],
    ['Architecture = ARM64', 1],
    ['Target minimum iOS Version 不低于引擎要求', 1],
    ['签名字段 Team ID 已填', 0],
    ['相机/相册等权限文案已写（中文）', 0],
    ['ATS：已上 HTTPS 或已配置例外', 1],
    ['隐私清单 PrivacyInfo.xcprivacy 已包含', 0],
    ['真机 Release 包已自测完整流程', 0]
  ];
  box.innerHTML = `<div id="iosList" style="display:flex;flex-direction:column;gap:5px"></div>
    <div class="row" style="margin-top:9px"><button class="btn run" id="iosCheck">检查并构建</button><span class="pill" id="iosRes">待检查</span></div>`;
  const list = box.querySelector('#iosList');
  const cbs = items.map(([t, ok]) => {
    const l = document.createElement('label');
    l.style.cssText = 'display:flex;gap:8px;align-items:center;border:1px solid var(--line);border-radius:8px;padding:6px 10px;font-size:12.4px;background:#fff;cursor:pointer';
    l.innerHTML = `<input type="checkbox" ${ok ? 'checked' : ''}><span>${t}</span>`;
    list.appendChild(l);
    return l.querySelector('input');
  });
  box.querySelector('#iosCheck').onclick = () => {
    const miss = cbs.map((c, i) => c.checked ? null : items[i][0]).filter(Boolean);
    const r = box.querySelector('#iosRes');
    if (miss.length) { r.textContent = '缺 ' + miss.length + ' 项，构建会失败'; r.style.background = '#fdecec'; r.style.color = '#b91c1c'; }
    else { r.textContent = '可以 Archive 上传'; r.style.background = '#e6f7f5'; r.style.color = '#0b6b62'; }
  };
};

/* ================= m24 Android Manifest ================= */
window.DEMOS.android = function (root) {
  const box = root.querySelector('.demo-body');
  box.innerHTML = `
    <div class="row" style="margin-bottom:8px">
      <label class="pill"><input type="checkbox" id="anNet" checked style="margin-right:4px">INTERNET</label>
      <label class="pill"><input type="checkbox" id="anPay" checked style="margin-right:4px">com.android.vending（支付）</label>
      <label class="pill"><input type="checkbox" id="anClear" style="margin-right:4px">允许明文 HTTP</label>
      <label class="pill"><input type="checkbox" id="anLoc" style="margin-right:4px">定位权限（多为不必要）</label>
    </div>
    <div class="field" style="margin-bottom:8px"><span>Package Name</span><input id="anPkg" value="com.icefocus.unitycourse"></div>
    <pre id="anOut" style="margin:0;background:#0f1116;color:#c8f0d6;border-radius:9px;padding:11px 13px;font-family:var(--mono);font-size:11.5px;line-height:1.75;white-space:pre-wrap;max-height:250px;overflow:auto"></pre>`;
  const $ = (s) => box.querySelector(s);
  function render() {
    const pkg = $('#anPkg').value || 'com.company.product';
    const perms = [];
    if ($('#anNet').checked) perms.push('INTERNET');
    if ($('#anLoc').checked) perms.push('ACCESS_FINE_LOCATION');
    const out =
`<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${pkg}">
${perms.map(p => `    <uses-permission android:name="android.permission.${p}" />`).join('\n')}
${$('#anPay').checked ? `
    <queries>
        <package android:name="com.android.vending" />
    </queries>` : ''}

    <application
        android:label="@string/app_name"
        android:allowBackup="false"
        android:usesCleartextTraffic="${$('#anClear').checked}">
        <activity android:name="com.unity3d.player.UnityPlayerActivity"
            android:exported="true"
            android:screenOrientation="landscape">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
    $('#anOut').textContent = out;
  }
  box.querySelectorAll('input').forEach(i => i.oninput = render);
  render();
};

/* ================= m25 碰撞可视化 ================= */
window.DEMOS.math = function (root) {
  const box = root.querySelector('.demo-body');
  box.innerHTML = `
    <canvas id="mthCv" style="width:100%;height:250px;background:#fff;border:1px solid var(--line);border-radius:10px;cursor:grab"></canvas>
    <div class="row" style="margin-top:8px" id="mthStats"></div>
    <p class="cap" style="margin:8px 0 0">拖动两个圆心与三角形外的测试点：实时显示圆心距与 <code>R+r</code> 的比较、点是否在三角形内。</p>`;
  const cv = box.querySelector('#mthCv'), ctx = cv.getContext('2d');
  const W = 600, H = 250, dpr = window.devicePixelRatio || 1;
  cv.width = W * dpr; cv.height = H * dpr; ctx.scale(dpr, dpr);
  const A = { x: 170, y: 130, r: 52 }, B = { x: 330, y: 120, r: 40 };
  const T = [{ x: 420, y: 190 }, { x: 560, y: 190 }, { x: 500, y: 60 }];
  let P = { x: 300, y: 210 }, drag = null;

  const pos = (e) => {
    const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
  };
  cv.onpointerdown = (e) => {
    const p = pos(e);
    const d1 = Math.hypot(p.x - A.x, p.y - A.y), d2 = Math.hypot(p.x - B.x, p.y - B.y), d3 = Math.hypot(p.x - P.x, p.y - P.y);
    drag = Math.min(d1, d2, d3) === d1 ? A : Math.min(d1, d2, d3) === d2 ? B : P;
    cv.onpointermove = (ev) => { const q = pos(ev); drag.x = q.x; drag.y = q.y; draw(); };
  };
  window.addEventListener('pointerup', () => { cv.onpointermove = null; });

  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  function insideTri(p) {
    const d1 = cross(p, T[0], T[1]), d2 = cross(p, T[1], T[2]), d3 = cross(p, T[2], T[0]);
    const neg = d1 < 0 || d2 < 0 || d3 < 0, posv = d1 > 0 || d2 > 0 || d3 > 0;
    return !(neg && posv);
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    // 网格
    ctx.strokeStyle = '#f1f4fa';
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    [A, B].forEach((c, i) => {
      ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, 7);
      ctx.fillStyle = i === 0 ? 'rgba(79,70,229,.10)' : 'rgba(13,148,136,.10)';
      ctx.strokeStyle = i === 0 ? '#4f46e5' : '#0d9488'; ctx.lineWidth = 2;
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = i === 0 ? '#4f46e5' : '#0d9488';
      ctx.beginPath(); ctx.arc(c.x, c.y, 3.5, 0, 7); ctx.fill();
    });

    ctx.beginPath(); ctx.moveTo(T[0].x, T[0].y); ctx.lineTo(T[1].x, T[1].y); ctx.lineTo(T[2].x, T[2].y); ctx.closePath();
    ctx.fillStyle = 'rgba(249,115,22,.08)'; ctx.strokeStyle = '#f97316'; ctx.lineWidth = 2; ctx.fill(); ctx.stroke();

    ctx.beginPath(); ctx.arc(P.x, P.y, 5, 0, 7); ctx.fillStyle = '#b45309'; ctx.fill();

    const d = Math.hypot(A.x - B.x, A.y - B.y);
    ctx.strokeStyle = '#94a3b8'; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#64748b'; ctx.font = '11px monospace';
    ctx.fillText('d = ' + d.toFixed(1), (A.x + B.x) / 2 - 18, (A.y + B.y) / 2 - 6);

    const inTri = insideTri(P);
    box.querySelector('#mthStats').innerHTML = `
      <div class="stat"><div class="k">圆心距 d</div><div class="v" style="font-size:14px">${d.toFixed(1)}</div></div>
      <div class="stat"><div class="k">R + r</div><div class="v" style="font-size:14px">${(A.r + B.r).toFixed(0)}</div></div>
      <div class="stat"><div class="k">两圆是否相交</div><div class="v" style="font-size:14px;color:${d < A.r + B.r ? '#0d9488' : '#b45309'}">${d < A.r + B.r ? '相交' : '分离'}</div></div>
      <div class="stat"><div class="k">点在三角形内</div><div class="v" style="font-size:14px;color:${inTri ? '#0d9488' : '#b45309'}">${inTri ? '是' : '否'}</div></div>`;
  }
  draw();
};


/* ================= m26 二进制字节布局 ================= */
window.DEMOS.binio = function (root) {
  const box = root.querySelector('.demo-body');
  box.innerHTML = `
    <div class="row" style="gap:8px;flex-wrap:wrap;align-items:center">
      <select id="bioType" class="sel" style="padding:6px 8px;border:1px solid var(--line);border-radius:8px">
        <option value="int">int（4 字节）</option>
        <option value="short">short（2 字节）</option>
        <option value="float">float（4 字节）</option>
        <option value="bool">bool（1 字节）</option>
        <option value="string">string（UTF-8 变长）</option>
      </select>
      <input id="bioVal" value="1000" style="width:150px;padding:6px 9px;border:1px solid var(--line);border-radius:8px">
      <button class="mini" id="bioAdd">写入</button>
      <button class="mini" id="bioClear">清空</button>
      <label style="font-size:12.5px;color:var(--ink2);display:flex;gap:5px;align-items:center">
        <input type="checkbox" id="bioLE"> 小端序（BitConverter.IsLittleEndian）
      </label>
    </div>
    <div class="row" id="bioStats" style="margin-top:8px"></div>
    <div id="bioHex" style="margin-top:8px;font-family:var(--mono);font-size:12px;line-height:1.9"></div>
    <p class="cap" style="margin:8px 0 0">同一个数值在不同类型下占的字节数、以及大小端排布完全不同——这就是自定义协议必须约定「类型 + 顺序 + 字节序」的原因。</p>`;

  const T = box.querySelector('#bioType'), V = box.querySelector('#bioVal');
  const LE = box.querySelector('#bioLE'), HEX = box.querySelector('#bioHex');
  let fields = [];

  function bytesOf(type, raw, le) {
    const dv = new DataView(new ArrayBuffer(8));
    if (type === 'int') { dv.setInt32(0, parseInt(raw) || 0, le); return [...new Uint8Array(dv.buffer, 0, 4)]; }
    if (type === 'short') { dv.setInt16(0, parseInt(raw) || 0, le); return [...new Uint8Array(dv.buffer, 0, 2)]; }
    if (type === 'float') { dv.setFloat32(0, parseFloat(raw) || 0, le); return [...new Uint8Array(dv.buffer, 0, 4)]; }
    if (type === 'bool') { return [raw === 'true' || raw === '1' ? 1 : 0]; }
    const enc = new TextEncoder().encode(String(raw));
    return [...enc];
  }

  function paint() {
    let off = 0, cells = [];
    fields.forEach(f => {
      cells.push(`<div style="margin:2px 0"><span style="color:var(--ink3);display:inline-block;width:86px">@${off}</span>` +
        f.bytes.map((b, i) => `<span class="bx" data-f="${f.name}" data-i="${i}" style="display:inline-block;min-width:34px;text-align:center;margin-right:3px;padding:1px 4px;border-radius:5px;background:${f.bg};color:#0f1826">${b.toString(16).padStart(2, '0').toUpperCase()}</span>`).join('') +
        `<span style="color:var(--ink3);margin-left:8px">${f.name} = ${f.show}</span></div>`);
      off += f.bytes.length;
    });
    HEX.innerHTML = cells.join('') || '<span style="color:var(--ink3)">缓冲为空，点「写入」往里塞字段</span>';
    box.querySelector('#bioStats').innerHTML = `
      <div class="stat"><div class="k">字段数</div><div class="v" style="font-size:14px">${fields.length}</div></div>
      <div class="stat"><div class="k">总字节</div><div class="v" style="font-size:14px">${off}</div></div>
      <div class="stat"><div class="k">字节序</div><div class="v" style="font-size:14px">${LE.checked ? '小端' : '大端'}</div></div>`;
  }

  const PAL = ['#eaf1ff', '#e8f7f0', '#fff2e2', '#f3ecff', '#ffe9ee'];
  box.querySelector('#bioAdd').onclick = () => {
    const type = T.value, raw = V.value;
    fields.push({ name: type + ':' + raw, bytes: bytesOf(type, raw, LE.checked), show: raw, bg: PAL[fields.length % PAL.length] });
    if (fields.length > 8) fields.shift();
    paint();
  };
  box.querySelector('#bioClear').onclick = () => { fields = []; paint(); };
  LE.onchange = () => { fields = fields.map(f => ({ ...f, bytes: f.name.indexOf(':') > 0 ? bytesOf(f.name.split(':')[0], f.name.split(':').slice(1).join(':'), LE.checked) : f.bytes })); paint(); };
  paint();
};

/* ================= m27 IMGUI 控件与自动布局 ================= */
window.DEMOS.imgui = function (root) {
  const box = root.querySelector('.demo-body');
  box.innerHTML = `
    <div class="row" style="gap:14px;flex-wrap:wrap;align-items:center">
      <label style="font-size:12.5px;color:var(--ink2)">GUILayout.Width <b id="igWv">120</b>
        <input type="range" id="igW" min="60" max="240" value="120" style="vertical-align:middle"></label>
      <label style="font-size:12.5px;color:var(--ink2)">GUILayout.Height <b id="igHv">24</b>
        <input type="range" id="igH" min="18" max="44" value="24" style="vertical-align:middle"></label>
      <label style="font-size:12.5px;color:var(--ink2)">GUILayout.Space <b id="igSv">6</b>
        <input type="range" id="igS" min="0" max="24" value="6" style="vertical-align:middle"></label>
      <label style="font-size:12.5px;color:var(--ink2);display:flex;gap:5px;align-items:center">
        <input type="checkbox" id="igE" checked> ExpandWidth</label>
    </div>
    <div id="igStage" style="position:relative;margin-top:10px;height:190px;background:#2b2b2b;border-radius:10px;overflow:hidden"></div>
    <p class="cap" style="margin:8px 0 0">OnGUI 是「立即模式」：每帧按代码顺序重画，控件位置由 <code>GUILayout</code> 依次累加（高度 + Space）算出，不是靠 RectTransform 摆的。</p>`;

  const W = box.querySelector('#igW'), H = box.querySelector('#igH'), S = box.querySelector('#igS'), E = box.querySelector('#igE');
  const stage = box.querySelector('#igStage');
  const ITEMS = [
    { t: 'label', c: 'Life: 100 / 100' },
    { t: 'button', c: 'GUILayout.Button("开始游戏")' },
    { t: 'slider', c: 'GUILayout.HorizontalSlider(vol, 0, 1)' },
    { t: 'toggle', c: 'GUILayout.Toggle(mute, "静音")' },
    { t: 'button', c: 'GUILayout.Button("退出")' },
  ];

  function paint() {
    const w = +W.value, h = +H.value, sp = +S.value, exp = E.checked;
    box.querySelector('#igWv').textContent = w;
    box.querySelector('#igHv').textContent = h;
    box.querySelector('#igSv').textContent = sp;
    let y = 10, html = '';
    ITEMS.forEach((it, i) => {
      const ww = exp ? 'calc(100% - 20px)' : w + 'px';
      const base = 'position:absolute;left:10px;top:' + y + 'px;height:' + h + 'px;width:' + ww +
        ';border-radius:5px;font:12px/1 var(--sans);display:flex;align-items:center;justify-content:center;padding:0 10px';
      if (it.t === 'label') html += `<div style="${base};background:#3a3a3a;color:#d8d8d8;justify-content:flex-start">${it.c}</div>`;
      else if (it.t === 'button') html += `<div style="${base};background:#4a4a4a;color:#f0f0f0;border:1px solid #666;cursor:pointer">${it.c.replace(/"/g, '')}</div>`;
      else if (it.t === 'slider') html += `<div style="${base};background:#3a3a3a"><div style="height:6px;width:100%;background:#555;border-radius:3px;position:relative"><div style="position:absolute;left:0;top:0;height:6px;width:42%;background:#4f8cff;border-radius:3px"></div></div></div>`;
      else html += `<div style="${base};background:#3a3a3a;color:#d8d8d8;justify-content:flex-start;gap:8px"><span style="width:14px;height:14px;border:1px solid #888;border-radius:3px;display:inline-block;background:#4f8cff"></span>${it.c.replace(/"/g, '').replace('GUILayout.Toggle(mute, ', '').replace(')', '')}</div>`;
      y += h + sp;
    });
    html += `<div style="position:absolute;right:10px;bottom:8px;font:11px var(--mono);color:#9aa4b2">已用高度 ${y - sp}px / 画布 ${stage.clientHeight || 190}px${y - sp > (stage.clientHeight || 190) ? ' · 溢出被裁掉' : ''}</div>`;
    stage.innerHTML = html;
  }
  [W, H, S, E].forEach(el => el.oninput = paint);
  paint();
};
