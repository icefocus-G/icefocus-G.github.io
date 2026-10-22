/* =============================================================================
 * FlappyBird · 像素鸟
 * -----------------------------------------------------------------------------
 * 本文件三部分：
 *   1) create(api) —— 浏览器里可玩的 Canvas 复刻版（与 Unity 版逻辑一一对应）
 *   2) notes       —— 逐句讲解：「为什么这么写」
 *   3) think       —— 开发思维与步骤拆解
 *
 * 与 Unity 版的对应约定（复刻版里所有数值都由它换算出来）：
 *   世界坐标 1 单位 ≈ 40 像素
 *   Player.gravity  -9.81 单位/s² → 约 392 px/s² 向下
 *   Player.strength  5    单位/s  → 约 200 px/s 向上
 *   Pipes.speed      5    单位/s  → 约 200 px/s 向左
 *   Spawner.gap      3    单位    → 约 130 px 上下间隙
 * 变量名刻意与 C# 保持一致（direction / gravity / strength / gap / leftEdge），
 * 方便左右对照源码阅读。
 * ========================================================================== */

UG_LESSON('flappybird', {

  /* ---------------- 元数据 ---------------- */

  name: '像素鸟 Flappy Bird',
  ico: '🐤',
  difficulty: 2,
  tags: ['重力跳跃', '触发器', '视差滚动', 'InvokeRepeating'],
  controls: '空格 / ↑ / W / 鼠标点击 / 触屏 = 拍翅膀（每次拍打把竖直速度直接设成向上的固定值）。R 重开，P 暂停。撞管道或落地即结束，穿过一对管道 +1 分。',
  oneLiner: '点一下上升、不点就掉下去，穿过管道加一分 —— 用不到 300 行把「手动重力积分 + 标签触发器 + 定时生成 + 视差滚动」四件事讲透。',

  /* ---------------- 逐句讲解：文件名 → 行号 → 讲解 ---------------- */

  notes: {

    'GameManager.cs': {
      19: '[DefaultExecutionOrder(-1)] 让本脚本的 Awake 早于其它所有脚本。必须这样做：Player.Start / Spawner 一上来就可能访问 GameManager.Instance，执行顺序不对就会拿到 null。相比在 Project Settings 的 Script Execution Order 面板里手动拖顺序，写在这里的好处是「跟着代码走」，拷到别的工程也不会漏配。',
      23: '单例写成 public static + private set：读的权限给所有人，写的权限只留给自己。Player 撞管子时直接 GameManager.Instance.GameOver() 反向回调，省掉了拖引用这一步。如果这里写成普通 public 字段，任何脚本都能把 Instance 改掉，调试时会出现极难排查的「单例被顶替」问题。',
      62: 'Time.timeScale = 0f 是 Unity 里最省事的暂停：所有乘 Time.deltaTime 的位移都会变成 0，Update 照跑但世界静止。注意它的边界 —— 只管「依赖 deltaTime 的东西」：UI 按钮要自己 SetActive（下一行就做），InvokeRepeating 的计时虽然也受 timeScale 影响，但更稳妥的做法是显式 CancelInvoke（Spawner.OnDisable 就是这么做的）。把 UI 控制和时间控制当成两件事，别指望一行 timeScale 解决全部。',
      82: '重玩前必须用 FindObjectsOfType<Pipes>() 把上一局残留的管道全部销毁。不做这一步，点「再来一次」时旧管道还停在屏幕中间，新鸟一出生就撞死，玩家会以为是 bug。这里用 FindObjectsOfType 而不是维护一个 List：管道是 Spawner 动态生成的，GameManager 不该去管生成器的内部账本，直接向场景查询最省心 —— 代价是这一次分配，但重玩一局只发生一次，完全可以接受。'
    },

    'Player.cs': {
      60: '整段最关键的取舍：跳跃是「赋值」而不是「累加」。direction = Vector3.up * strength 把竖直速度直接设成 5，所以连点两下不会叠成 10 —— 手速再快，单次跳跃高度也恒定。这就是 Flappy Bird 手感可控的根本原因。若写成 direction += Vector3.up * strength，连点会越飞越高，游戏直接崩坏。同理它也没有用 AddForce：力会被引擎按质量积分、还会受阻力影响，结果不可预测；这里要的是「一次输入 = 一次确定的速度」。',
      65: '重力每帧加在速度上（v += g·dt），这是最朴素的显式欧拉积分。注意是「加速度积分成速度」，乘 Time.deltaTime 保证不同帧率下下落快慢一致 —— 漏乘 dt 的话，120Hz 的机器会比 60Hz 的机器掉得快一倍。另外 gravity 用负数常量表示「向下」，配合 60 行的 +strength 表示「向上」，两个数符号相反、量纲相同，调手感时只需改这两个数。',
      67: '位移 = 速度 × 时间，第二次积分。这一行和上一行合起来就是完整的「手动物理」：没有 Rigidbody、没有 AddForce，小鸟的位置完全由自己的 direction 决定。好处是行为 100% 可预测、可复现（也意味着 Time.timeScale=0 时它自然停住）；代价是撞墙不会自动反弹 —— 但本作本来撞到就该死，正好不需要。',
      95: '用 CompareTag("Obstacle") 而不是 gameObject.tag == "Obstacle"：前者不分配临时字符串，后者每次比较都产生 GC 垃圾，在每帧可能触发的回调里是公认的坏写法；而且 tag 拼错时 CompareTag 会直接报 Unity 错误，字符串比较只会静默失效。这一行也体现了「标签即规则」：管道自己根本不知道撞到会怎样，只有 Player 知道 —— 规则集中在一处，改起来只改一个 if。'
    },

    'Spawner.cs': {
      33: 'InvokeRepeating(nameof(Spawn), spawnRate, spawnRate) 放在 OnEnable 而不是 Start：因为重玩时 GameManager.Play() 是靠「重新 enable 这个脚本」来重启生成器的，Start 一辈子只跑一次，放进 Start 第二局就再也生成不出管道了。nameof(Spawn) 而非字符串 "Spawn" —— 方法改名时编译器直接报错，字符串只会静默失效。',
      39: 'OnDisable 里 CancelInvoke 与 33 行的 InvokeRepeating 必须成对出现，这是本作最容易踩的坑。不取消的话，每次暂停/重玩都会再挂一个新的重复计时器，玩几局后屏幕上会同时冒出三四组管道 —— 而且因为 timeScale 有时为 0，故障表现得时快时慢，非常难查。凡是「定时 + 可暂停」，都要写成 OnEnable 开、OnDisable 关这一对。',
      47: '生成后立刻随机抬高：位置随机是难度来源，也是重玩价值的来源。注意它是在「生成点 transform.position」基础上加偏移，而不是直接写死一个绝对坐标 —— 这样把 Spawner 物体挪一挪，整条生产线就跟着走，调场景不用改代码。42 行的 Instantiate 与这行的位移分成两步，也是为了「先出生、再就位」，顺序反了就会出现在错误位置生成一帧的抖动。'
    },

    'Pipes.cs': {
      33: 'leftEdge 用 Camera.main.ScreenToWorldPoint(Vector3.zero) 求屏幕左边界的世界坐标，再减 1 留缓冲。为什么不写死 -10：不同分辨率、不同正交相机尺寸下屏幕宽度完全不同，写死会在某些设备上出现「管道还没出屏就被销毁」或「飞出去老远才销毁」。减 1 是因为管道有宽度，中心越过边界时右半截还在屏幕里，要等它彻底看不见再回收。这个值是 Start 里算一次缓存起来的 —— 每帧算要调相机变换，白白浪费。',
      42: '位移同样是「速度 × deltaTime」，方向用 Vector3.left 常量。管道是纯运动物体，不参与物理，所以用 Transform 直接平移而不是 Rigidbody —— 省掉物理开销，也不会因为碰撞把速度改掉。配合 timeScale=0 时 deltaTime 为 0，暂停就自动生效，一行代码都不用加。'
    },

    'Parallax.cs': {
      30: '整段视差的核心只有这一行：不停累加材质的 UV 偏移。原理是纹理的 Wrap Mode 设为 Repeat，UV 超出 [0,1] 会自动回绕，于是「偏移一直涨 + 采样自动回绕」就等价于无限长的背景 —— 你并没有移动物体，只是移动了贴图的取样窗口，代价几乎为零。乘 Time.deltaTime 是必须的，否则滚动速度会随帧率变化。这就是为什么背景要单独做成一层带 MeshRenderer 的平面：它不参与任何游戏逻辑，只负责「看起来在动」。'
    }
  },

  /* ---------------- 开发思维与步骤 ---------------- */

  think: {
    core: [
      '第一条思维：速度是一个「状态」，不是一个「动作」。Player 没有 Rigidbody、没有 AddForce，它自己维护一个 direction 向量 —— 跳跃时把它赋成向上的固定值（赋值！不是累加），每帧再把重力加上去，最后用「速度×时间」更新位置。这三步就是最朴素的手动物理积分。理解它，你就知道为什么连点不会飞更高，也知道为什么 Time.timeScale=0 能让整个世界瞬间冻住：因为一切都乘了 deltaTime。',
      '第二条思维：触发器是「规则」，不是「墙」。管道自己完全不知道撞到它会怎样，它只带了两个标签 —— Obstacle（撞到=结束）和 Scoring（穿过=加分），判定与后果全部写在 Player 的 OnTriggerEnter2D 里分流。这种「带标签的对象 + 集中在一处的规则表」的写法，让加一条新规则（比如吃到金币）只需要加一个 else if，管道代码一个字都不用动。',
      '第三条思维：分清「时间」与「开关」。暂停靠 Time.timeScale=0 一把抓所有 deltaTime 驱动的运动，但 UI 面板必须自己 SetActive，重复计时器必须自己 CancelInvoke —— 凡是「不走 deltaTime」的东西，timeScale 一律管不到。Spawner 的 OnEnable/OnDisable 之所以必须成对写，就是因为这是两套不同的机制，得各关各的。'
    ],

    steps: [
      { t: '① 定规则：一句话说清游戏',
        d: '点一下上升、不点就掉下去；撞管道或落地即结束；穿过一对管道 +1 分。规则短到能写进一行注释，才说明设计清楚了 —— 后面每个脚本都只对其中半句负责。' },
      { t: '② 搭世界：定坐标、边界与节奏',
        d: '先定世界高度（约 ±5 单位）和地面高度，再由「管速 × 生成间隔」推出管道间距。Pipes 还要用 ScreenToWorldPoint 算出左边界做回收线（Pipes.cs:33）。边界先定死，后面所有判定才有依据。' },
      { t: '③ 造角色：小鸟只有两个状态',
        d: '小鸟的状态就是 position.y 和 direction（速度）两个量，外加一个由速度算出来的倾斜角。刻意不用 Rigidbody —— 力的积分受质量与阻尼影响不可预测，而这里要的是「一次输入 = 一次确定的速度」。' },
      { t: '④ 建循环：Update 里四步走',
        d: '读输入 → 加重力 → 积分位移 → 算姿态，顺序固定（Player.cs:56-74）。注意先读输入再算重力意味着起跳当帧也会被扣一点速度，这是可接受的小误差；把它反过来写，手感会更「跟手」，可以自己试。' },
      { t: '⑤ 定交互：标签分流，计分单一入口',
        d: 'OnTriggerEnter2D 里用 CompareTag 分成 Obstacle / Scoring 两支；加分只走 GameManager.IncreaseScore 一个入口（GameManager.cs:101），这样以后想加连击、加倍、音效，都只改一处。' },
      { t: '⑥ 调手感：五个数定生死',
        d: 'strength（跳多高）、gravity（掉多快）、tilt（姿态夸张度）、spawnRate（多久一组）、gap（容错多大）。它们的比值决定难度，而不是绝对值 —— 先定 gravity，再调 strength 让一跳大约 50px，最后收 gap。' },
      { t: '⑦ 做流程：单例管三态，计时器成对开关',
        d: 'GameManager 用单例统一管理 开始/暂停/结束：开局先 Pause 等点击，Play() 里清完旧管道再恢复时间。Spawner 用 OnEnable 开 InvokeRepeating、OnDisable 关 CancelInvoke，保证重玩后计时器不会叠加。' }
    ],

    transfer: [
      '「自己维护速度向量 + 重力累加」的手动积分 → 平台跳跃的土狼时间与跳跃缓冲、打砖块的球速控制、小行星的推力与惯性，都是同一个模型换参数。',
      '「标签触发器 + 规则集中分流」→ 吃豆人的豆子与能量豆、炸弹人的爆炸链、蜈蚣的子弹命中判定，本质都是「对象只带标记，后果由一处裁判」。',
      '「OnEnable 开 / OnDisable 关」的成对计时器 → 太空侵略者的波次生成、打砖块的多球掉落、坦克大战的刷怪；凡是「定时生成 + 可暂停」，都要这么写。',
      '「材质 UV 偏移做无限滚动」→ 横版跑酷的多层背景、太空射击的星空卷轴、赛车游戏的路面条纹，原理都是「不动物体，只动取样窗口」。'
    ]
  },

  /* =========================================================================
   * create(api) —— 可玩的浏览器复刻版
   *
   * 刻意与 Unity 版保持结构一致：
   *   Player.Update（输入 → 重力 → 积分 → 姿态）
   *   Spawner（定时生成）→ Pipes.Update（左移 + 越界回收）
   *   Player.OnTriggerEnter2D（Obstacle / Scoring 分流）
   *   Parallax.Update（材质偏移 → 这里用「平铺 + 取模偏移」等价实现）
   * ======================================================================= */

  create: function (api) {

    /* ---------- 世界尺寸（逻辑坐标） ---------- */
    var W = 640, H = 420;

    /* ---------- 换算常数：1 世界单位 ≈ 40 像素 ---------- */
    var UNIT = 40;
    var GRAVITY = 9.81 * UNIT;        // ≈392 px/s²，对应 Player.gravity = -9.81
    var STRENGTH = 5 * UNIT;          // =200 px/s，对应 Player.strength = 5
    var PIPE_SPEED = 5 * UNIT;        // =200 px/s，对应 Pipes.speed = 5
    var GAP = 130;                    // 上下间隙，对应 Spawner.verticalGap ≈ 3（略放宽）
    var SPAWN_RATE = 1.5;             // 生成间隔，对应 Spawner.spawnRate（1f，略放宽）
    var TILT = 0.003;                 // 对应 Player.tilt = 5（换算到 px/s 上的系数）

    /* ---------- 场景元素 ---------- */
    var GROUND_Y = 348;               // 地面顶部（下面 72px 是地面带）
    var BIRD_X = 150;                 // 小鸟固定的水平位置（世界在动，鸟不动）
    var BIRD_R = 13;                  // 小鸟碰撞半径
    var PIPE_W = 62;                  // 管道宽
    var LEFT_EDGE = -PIPE_W - 8;      // 对应 Pipes.leftEdge：越过它就回收
    var HOVER_Y = 160;                // 待机时的悬停高度
    var CY_MIN = 112, CY_MAX = 252;   // 间隙中心随机范围，对应 Spawner.minHeight/maxHeight
    var GROUND_TILE = 40;             // 地面贴图宽度（用于演示材质偏移回绕）

    /* ---------- 状态 ---------- */
    var state = 'ready';              // 'ready' | 'play' | 'over' —— 三态
    var birdY = HOVER_Y, birdVY = 0;  // 对应 Player 的 transform.position.y 与 direction
    var birdAng = 0;                  // 对应 rotation.z = direction.y * tilt
    var pipes = [];                   // 场景里的管道，对应 FindObjectsOfType<Pipes>()
    var score = 0, best = 0;
    var spawnT = 0;                   // 生成倒计时，对应 InvokeRepeating
    var spawnN = 0, flapN = 0;
    var scroll = 0;                   // 世界滚动总距离，驱动三层视差
    var animT = 0, spriteIndex = 0;   // 对应 InvokeRepeating(AnimateSprite, 0.15, 0.15)
    var hoverT = 0, overT = 0;
    var varT = 0;                     // api.vars 节流计时

    /* ---------- 开始一局：对应 GameManager.Play() ---------- */
    function start() {
      var cleared = pipes.length;
      pipes.length = 0;                       // 对应 FindObjectsOfType<Pipes>() + Destroy
      score = 0;
      birdY = HOVER_Y; birdVY = 0; birdAng = 0;
      spawnT = 0.8;                           // 开局留一点喘息，别一上来就是管道
      spawnN = 0; flapN = 0;
      state = 'play';
      api.hit('GameManager.cs', 67);
      api.log('Play()：清掉 ' + cleared + ' 组旧管道，score=0，Time.timeScale=1 → 开始', 'ok');
    }

    /* ---------- 结束一局：对应 Player 撞 Obstacle → GameManager.GameOver() ---------- */
    function die(reason) {
      if (state !== 'play') return;
      state = 'over';
      overT = 0;
      if (score > best) best = score;
      api.hit('Player.cs', 95);               // CompareTag("Obstacle")
      api.hit('GameManager.cs', 95);          // GameOver() 里的 Pause()
      api.log('撞到' + reason + ' → GameOver()，Time.timeScale=0（管道与背景冻结）', 'err');
      api.log('本局得分 ' + score + '，最高 ' + best + '。点击 / 空格 重新开始', 'warn');
    }

    /* ---------- 拍翅膀：对应 Player.Update 里的输入分支 ---------- */
    function flap() {
      birdVY = -STRENGTH;                     // 赋值而非累加：连点也不会越飞越高
      birdAng = -0.45;
      flapN++;
      api.hit('Player.cs', 60);
      api.log('拍翅膀 #' + flapN + '：direction.y = +' + (STRENGTH / UNIT).toFixed(1) +
              '（= 向上 ' + STRENGTH.toFixed(0) + ' px/s）', 'info');
    }

    /* ---------- 生成一组管道：对应 Spawner.Spawn() ---------- */
    function spawn() {
      var cy = CY_MIN + Math.random() * (CY_MAX - CY_MIN);   // Random.Range(minHeight, maxHeight)
      pipes.push({ x: W + 24, cy: cy, scored: false });
      spawnN++;
      api.hit('Spawner.cs', 45);                             // Instantiate(prefab, ...)
      api.log('Spawn() #' + spawnN + '：x=' + (W + 24) +
              '，间隙中心 y=' + cy.toFixed(0) + '，gap=' + GAP, 'info');
    }

    /* ---------- 圆 vs 矩形：本机版的触发器判定 ---------- */
    function hitRect(cx, cy, r, rx, ry, rw, rh) {
      var nx = cx < rx ? rx : (cx > rx + rw ? rx + rw : cx);
      var ny = cy < ry ? ry : (cy > ry + rh ? ry + rh : cy);
      var dx = cx - nx, dy = cy - ny;
      return dx * dx + dy * dy <= r * r;
    }

    /* ---------- 扇翅动画：对应 InvokeRepeating(AnimateSprite, 0.15f, 0.15f) ---------- */
    function animTick(dt) {
      animT += dt;
      if (animT >= 0.15) {
        animT -= 0.15;
        spriteIndex++;
        if (spriteIndex >= 3) spriteIndex = 0;   // sprites.Length 回绕
      }
    }

    /* ---------- 关键状态推送（约 8Hz，别每帧刷 DOM） ---------- */
    function publish() {
      if (varT < 0.12) return;
      varT = 0;
      api.vars({
        '状态': state === 'ready' ? '待开始' : (state === 'play' ? '进行中' : '已结束'),
        'score（得分）': score,
        'bird.y': birdY.toFixed(0),
        'direction.y（世界单位）': (-birdVY / UNIT).toFixed(2),
        'pipes（管道组数）': pipes.length,
        'spawnTimer': spawnT.toFixed(2),
        'bg.offset（材质偏移）': ((scroll / GROUND_TILE) % 1).toFixed(2),
        'best（最高分）': best
      });
    }

    /* =====================================================================
     * update —— 对应 Player.Update + Pipes.Update + Parallax.Update
     * =================================================================== */
    function update(dt, keys, api) {
      varT += dt;

      /* ---- 待开始：对应 GameManager.Start() 里的 Pause()（timeScale=0） ---- */
      if (state === 'ready') {
        hoverT += dt;
        birdY = HOVER_Y + Math.sin(hoverT * 3) * 8;   // 悬停浮动（UI 式动画，不受 timeScale 影响）
        animTick(dt);                                  // 扇翅照常，对应 InvokeRepeating
        publish();
        return;
      }

      /* ---- 已结束：管道与背景冻结，只让小鸟坠落到地面（观感，Unity 里会全停） ---- */
      if (state === 'over') {
        overT += dt;
        if (birdY < GROUND_Y - BIRD_R) {
          birdVY += GRAVITY * dt;
          birdY += birdVY * dt;
          birdAng = Math.min(1.4, birdAng + 4 * dt);
          if (birdY >= GROUND_Y - BIRD_R) {
            birdY = GROUND_Y - BIRD_R; birdVY = 0; birdAng = 1.4;
          }
        }
        publish();
        return;
      }

      /* ---- 进行中 ---- */

      /* 1) 视差滚动：对应 Parallax.Update 的 mainTextureOffset 累加（三层速度不同） */
      scroll += PIPE_SPEED * dt;

      /* 2) 小鸟：重力 → 积分 → 姿态（Player.cs:65 / 67 / 72） */
      birdVY += GRAVITY * dt;
      birdY += birdVY * dt;
      var a = birdVY * TILT;                    // rotation.z = direction.y * tilt
      birdAng = a < -0.5 ? -0.5 : (a > 1.2 ? 1.2 : a);
      if (birdY < BIRD_R + 4) { birdY = BIRD_R + 4; if (birdVY < 0) birdVY = 0; }
      animTick(dt);

      /* 3) 生成管道：对应 InvokeRepeating(nameof(Spawn), spawnRate, spawnRate) */
      spawnT -= dt;
      if (spawnT <= 0) { spawnT += SPAWN_RATE; spawn(); }

      /* 4) 管道左移 + 越界回收：对应 Pipes.Update */
      for (var i = pipes.length - 1; i >= 0; i--) {
        var p = pipes[i];
        p.x -= PIPE_SPEED * dt;
        if (p.x < LEFT_EDGE) {
          pipes.splice(i, 1);                   // 对应 Destroy(gameObject)（Pipes.cs:46）
        }
      }

      /* 5) 计分触发器：鸟心越过管道中线 → 穿过 Scoring 区 */
      for (var j = 0; j < pipes.length; j++) {
        var q = pipes[j];
        if (!q.scored && BIRD_X > q.x + PIPE_W / 2) {
          q.scored = true;
          score++;
          api.hit('Player.cs', 97);             // CompareTag("Scoring")
          api.hit('GameManager.cs', 101);       // IncreaseScore()：加分的唯一入口
          api.log('穿过 Scoring 触发器 → IncreaseScore()，score=' + score, 'ok');
        }
      }

      /* 6) 障碍触发器：撞上管或落地 → GameOver */
      for (var k = 0; k < pipes.length; k++) {
        var r = pipes[k];
        var topH = r.cy - GAP / 2;
        var botY = r.cy + GAP / 2;
        if (hitRect(BIRD_X, birdY, BIRD_R * 0.9, r.x, 0, PIPE_W, topH) ||
            hitRect(BIRD_X, birdY, BIRD_R * 0.9, r.x, botY, PIPE_W, GROUND_Y - botY)) {
          die('管道');
          publish();
          return;
        }
      }
      if (birdY + BIRD_R >= GROUND_Y) {
        birdY = GROUND_Y - BIRD_R;
        die('地面');
        publish();
        return;
      }

      publish();
    }

    /* =====================================================================
     * draw —— 纯 Canvas 2D，直接用逻辑坐标
     * =================================================================== */

    /* 平铺绘制：off 是偏移量，等价于被不断累加的 mainTextureOffset（Repeat 自动回绕） */
    function drawStrip(ctx, off, y, tw, th, fn) {
      var m = off % tw;
      if (m < 0) m += tw;                       // 取模回绕 = 纹理的 Repeat 模式
      for (var x = -m - tw; x < W + tw; x += tw) fn(ctx, x, y, tw, th);
    }

    function drawCloud(ctx, x, y, w, h) {
      ctx.fillStyle = 'rgba(255,255,255,.62)';
      ctx.beginPath();
      ctx.arc(x + w * 0.32, y + h * 0.62, h * 0.34, 0, Math.PI * 2);
      ctx.arc(x + w * 0.52, y + h * 0.45, h * 0.46, 0, Math.PI * 2);
      ctx.arc(x + w * 0.72, y + h * 0.66, h * 0.30, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawBush(ctx, x, y, w, h) {
      ctx.fillStyle = 'rgba(46,125,79,.55)';
      ctx.beginPath();
      ctx.arc(x + w * 0.25, y + h, h * 0.55, Math.PI, 0);
      ctx.arc(x + w * 0.62, y + h, h * 0.75, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(x, y + h - 4, w, 8);
    }

    function drawPipeBody(ctx, x, y, w, h, capAtBottom) {
      if (h <= 0) return;
      var g = ctx.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, '#2f8f4e');
      g.addColorStop(0.35, '#7ddb8b');
      g.addColorStop(1, '#1d6b39');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y - 1, w - 2, h + 2);
      // 管口
      var capY = capAtBottom ? y + h - 26 : y;
      ctx.fillStyle = '#5fe08a';
      ctx.fillRect(x - 5, capY, w + 10, 26);
      ctx.strokeStyle = '#14532d';
      ctx.strokeRect(x - 4, capY + 1, w + 8, 24);
    }

    function drawBird(ctx) {
      ctx.save();
      ctx.translate(BIRD_X, birdY);
      ctx.rotate(birdAng);

      /* 身体（用 scale + arc 代替 ellipse，兼容性更好） */
      ctx.save();
      ctx.scale(1.2, 1);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#8a5a00';
      ctx.stroke();
      ctx.restore();

      /* 翅膀：三帧循环，对应 sprites[] 与 AnimateSprite */
      var wy = [-6, -1, 4][spriteIndex];
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-11, wy - 4);
      ctx.quadraticCurveTo(2, wy + 2, 8, wy - 2);
      ctx.quadraticCurveTo(0, wy + 8, -11, wy - 4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#8a5a00';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      /* 眼睛与喙 */
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(6, -5, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(7.4, -5, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.moveTo(12, -1);
      ctx.lineTo(22, 2);
      ctx.lineTo(12, 5);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    function draw(ctx, api) {
      /* --- 天空（不滚动，作为最远的底色） --- */
      var sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      sky.addColorStop(0, '#3fa9f5');
      sky.addColorStop(1, '#bfe9ff');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, GROUND_Y);

      /* --- 远景云（0.25 倍速，对应 Parallax.animationSpeed 较慢的那层） --- */
      drawStrip(ctx, scroll * 0.25, 40, 220, 70, drawCloud);

      /* --- 中景树丛（0.5 倍速） --- */
      drawStrip(ctx, scroll * 0.5, GROUND_Y - 96, 170, 60, drawBush);

      /* --- 管道 --- */
      for (var i = 0; i < pipes.length; i++) {
        var p = pipes[i];
        var topH = p.cy - GAP / 2;
        var botY = p.cy + GAP / 2;
        drawPipeBody(ctx, p.x, -10, PIPE_W, topH + 10, true);
        drawPipeBody(ctx, p.x, botY, PIPE_W, GROUND_Y - botY, false);
      }

      /* --- 地面（1 倍速，纹理偏移的主演示层） --- */
      ctx.fillStyle = '#ded894';
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      drawStrip(ctx, scroll, GROUND_Y, GROUND_TILE, H - GROUND_Y, function (ctx, x, y, tw, th) {
        ctx.fillStyle = '#d2cb84';
        ctx.fillRect(x, y, tw / 2, th);
      });
      ctx.fillStyle = '#5b8f3a';
      ctx.fillRect(0, GROUND_Y, W, 8);
      ctx.fillStyle = '#4a7a2f';
      ctx.fillRect(0, GROUND_Y + 8, W, 3);

      /* --- 小鸟 --- */
      drawBird(ctx);

      /* --- 分数 --- */
      ctx.textAlign = 'center';
      ctx.font = '700 44px "SF Mono", Menlo, Consolas, monospace';
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(15,23,42,.55)';
      ctx.strokeText(String(score), W / 2, 66);
      ctx.fillStyle = '#fff';
      ctx.fillText(String(score), W / 2, 66);

      ctx.font = '12px -apple-system, "PingFang SC", sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.fillText('最高 ' + best + ' · 管道 ' + pipes.length + ' 组', W / 2, 86);

      /* --- 三态提示面板 --- */
      if (state === 'ready' || state === 'over') {
        ctx.fillStyle = 'rgba(15,23,42,.55)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(255,255,255,.96)';
        ctx.fillRect(W / 2 - 150, H / 2 - 82, 300, 150);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(W / 2 - 150, H / 2 - 82, 300, 150);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#0f172a';
        ctx.font = '700 24px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText(state === 'ready' ? '像素鸟' : '游戏结束', W / 2, H / 2 - 44);

        ctx.font = '15px -apple-system, "PingFang SC", sans-serif';
        ctx.fillStyle = '#334155';
        if (state === 'ready') {
          ctx.fillText('点击画面 / 按空格 开始', W / 2, H / 2 - 12);
          ctx.fillText('每次点击 = 拍一次翅膀', W / 2, H / 2 + 14);
        } else {
          ctx.fillText('本局 ' + score + ' 分 · 最高 ' + best, W / 2, H / 2 - 12);
          ctx.fillText(overT > 0.6 ? '点击画面 / 按空格 重开' : '…', W / 2, H / 2 + 14);
        }
        ctx.font = '12px -apple-system, "PingFang SC", sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Pipes.speed 换算后在画布上是 ' + PIPE_SPEED + ' px/s', W / 2, H / 2 + 50);
      }
    }

    /* ---------- 输入：点击 / 空格 = 拍翅膀（或开始 / 重开） ---------- */
    function tap() {
      if (state === 'ready') start();
      else if (state === 'play') flap();
      else if (state === 'over' && overT > 0.6) start();
    }

    function onKey(k, down, api) {
      if (!down) return;
      if (k === 'fire' || k === 'up') tap();
    }

    function onPointer(x, y, down, api) {
      if (down) tap();
    }

    /* ---------- 对外接口 ---------- */
    return {
      w: W, h: H,
      reset: function () {
        state = 'ready';
        pipes.length = 0;
        score = 0; spawnN = 0; flapN = 0;
        birdY = HOVER_Y; birdVY = 0; birdAng = 0;
        hoverT = 0; overT = 0; spawnT = 0;
        api.log('已重置 —— 回到待开始状态（对应 GameManager.Start() 的 Pause）', 'sys');
        varT = 1;                       // 让下面这次 publish 一定推得出去
        publish();
      },
      update: update,
      draw: draw,
      onKey: onKey,
      onPointer: onPointer,
      onPointerMove: function (x, y, api) { /* 本作不需要拖拽，只响应点击 */ }
    };
  }
});
