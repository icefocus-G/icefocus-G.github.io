/* =============================================================================
 * Pong · 乒乓
 * -----------------------------------------------------------------------------
 * 本文件三部分：
 *   1) create(api) —— 浏览器里可玩的 Canvas 复刻版（与 Unity 版逻辑一一对应）
 *   2) notes       —— 逐句讲解：「为什么这么写」
 *   3) think       —— 开发思维与步骤拆解
 * ========================================================================== */

UG_LESSON('pong', {

  /* ---------------- 元数据 ---------------- */

  name: '乒乓 Pong',
  ico: '🏓',
  difficulty: 1,
  tags: ['2D 物理', 'Rigidbody2D', '碰撞回调', '类继承'],
  controls: 'W / S 或 ↑ / ↓ 控制左侧球拍。P 暂停，R 重开，先到 5 分获胜。',
  oneLiner: '两个球拍各守一边，球从谁那边出界谁丢分。用最少的代码量，把「物理移动 + 碰撞回调 + 回合流程」三件事讲透。',

  /* ---------------- 逐句讲解：文件名 → 行号 → 讲解 ---------------- */

  notes: {

    'GameManager.cs': {
      23: '让本脚本比其它脚本更早初始化。因为 GameManager 的 Start 要调用 ball / paddle 的方法，如果它们还没 Awake，就会拿到空引用。这是 Unity 里处理「脚本初始化顺序依赖」的标准手段。',
      27: '用 [SerializeField] 而不是 public：既能在 Inspector 里拖拽赋值，又不把字段暴露给别的脚本，避免外部随意改动内部引用。',
      38: 'Start 只做一件事 —— 开局。不要在 Start 里写一堆初始化，拆成 NewGame / NewRound 之后，重开一局就只是再调一次 NewGame。',
      46: '把「重开」绑在一个明确的输入上，调试时非常省事。真实项目里会做成暂停菜单按钮，但开发期保留快捷键效率更高。',
      56: 'NewGame 与 NewRound 分开是关键设计：NewGame 清分数（一整局），NewRound 只复位不记分（一个回合）。很多 bug 就出在把这两件事混在一起。',
      64: '复位顺序有讲究：先复位球拍再复位球。虽然这里看不出差别，但在有「球吸附在拍上」这类机制时顺序就致命了。',
      67: 'CancelInvoke 很容易被忽略。不取消的话，连续得分会排队出多个发球计时器，导致一次得分后连续发好几个球。',
      69: '用 nameof(StartRound) 而不是字符串 "StartRound"：方法改名时编译器会直接报错，而字符串只会在运行时静默失效。',
      82: '得分后立刻 NewRound 开启下一回合。这里没有「胜利检测」，因为胜负判断放在 SetPlayerScore 里更合适 —— 分数变化的唯一入口。'
    },

    'Paddle.cs': {
      23: '[RequireComponent] 是防御性写法：挂脚本时 Unity 自动补上 Rigidbody2D，避免忘记加组件导致运行时空引用。',
      24: '声明为 abstract，因为「球拍」本身是抽象概念，不该被直接实例化。它的价值是让 PlayerPaddle / ComputerPaddle 共享复位与反弹逻辑。',
      27: '用 protected 而不是 private —— 子类要访问 rb。用 public 则会破坏封装。这是继承里最常见的访问级别选择。',
      33: '把「动态反弹」做成开关而不是写死，等于把手感调节权交给策划。教学上也能让你关掉它，对比两种手感差异。',
      36: '在 Awake 而不是 Start 里拿引用：Awake 先于所有 Start 执行，保证子类 Start 用到 rb 时它已经有值了。',
      44: '先清速度再改位置。顺序反了的话，某些物理引擎会在下一帧用旧速度把物体再推走一点。',
      45: '只重置 y，x 保持不变 —— 球拍的左右位置是「身份」（属于哪一边），不该被复位。',
      52: '用 CompareTag 而不是 gameObject.tag == "Ball"：前者不会分配临时字符串，后者每次比较都会产生 GC 垃圾。',
      56: 'collision.otherCollider 是「本脚本所挂物体」的碰撞体，collision.collider 是「对方」的。命名容易搞混，这里用的是 otherCollider（自己）。',
      61: '偏移量是「球的位置 - 拍子中心」。注意用的是 bounds.center（碰撞体包围盒中心），不是 transform.position —— 两者在锚点不在中心时不相等。',
      68: '75° 是经验值。太小则打不出角度变化，太大会出现近乎垂直的球，导致回合僵持。',
      70: '除以拍子高度得到归一化比例 [-1,1]，再乘最大角，实现「越靠边越陡」。',
      72: '四元数旋转是 3D 空间旋转，但这里的旋转轴由 up 与法线叉乘得到，恰好落在能让二维平面内方向改变的轴上。',
      76: '关键一行：只改方向不改速率（乘以原 magnitude）。如果这里直接用新方向乘固定速度，球速就会被拍子位置影响，手感失控。'
    },

    'Ball.cs': {
      23: '球是纯物理对象，必须有 Rigidbody2D。',
      30: '把初始速度做成可配置字段而不是常量，方便在 Inspector 里试不同数值 —— 这是调手感的入口。',
      32: '默认 Infinity 表示不封顶。注意它和 currentSpeed 是两套机制：maxSpeed 是硬上限，currentSpeed 是当前值。',
      34: '用自动属性 { get; set; } 而不是字段：语法上是字段，但未来可以加校验逻辑而不改调用方。',
      54: '随机决定发球方向，保证公平（不会总是发向某一方）。',
      61: 'y 限制在 ±0.5~1：避免接近纯水平的球。纯水平的球会变成"贴边来回"的无聊局面，这是 Pong 类游戏的经典陷阱。',
      65: '归一化后乘速率 —— 方向与时度分离。这是所有速度控制的标准写法。',
      67: 'ForceMode2D.Impulse = 瞬间冲量，一次性改变速度，适合发球。用 Force 则会持续加速，不适合。',
      72: '限速放在 FixedUpdate：物理步长固定，结果才可复现。放在 Update 里会因帧率不同得到不同结果。',
      78: 'Mathf.Min 钳制速率上限。',
      80: '「方向 × 速率」重新赋值：这是整段的核心 —— 把速度当成"方向 + 大小"两个独立量来管理，后面的加速/减速都只需要改其中一个。'
    },

    'PlayerPaddle.cs': {
      18: '继承 Paddle，自动获得 rb / speed / ResetPosition / 动态反弹，这里只写"怎么动"。',
      27: '同时支持 WASD 与方向键：成本几乎为零，但照顾了不同习惯的玩家。',
      41: 'sqrMagnitude 代替 magnitude 判断非零：省一次开方运算。虽然微优化，但在每帧执行的代码里是公认的好习惯。'
    },

    'ComputerPaddle.cs': {
      23: 'AI 只需要球的刚体引用。注意是 Rigidbody2D 而不是 Transform —— 因为要读 velocity 判断球的方向。',
      31: '用 velocity.x 的符号判断球「朝不朝自己来」，这是整个 AI 的核心判断，一行就够。',
      35: '只比较 y 坐标决定上/下 —— 最朴素的追踪 AI。它不会预判落点，所以会输给会拉角度的玩家。',
      47: '球不在自己这侧时回中线待命，减少无意义的移动，也让 AI 看起来"有准备"。'
    },

    'BouncySurface.cs': {
      25: '用枚举而不是布尔或字符串：加第三种模式时不用改调用方，IDE 还能自动补全。',
      42: 'TryGetComponent 把「判断类型」和「取引用」合成一步，比先 GetComponent 再判空更简洁高效。',
      48: '加性模式：固定增量，前期加速明显、后期不明显。',
      52: '乘性模式：按比例缩放（如 1.05），越到后期加速越猛，适合制造紧张感。两种模式手感完全不同，值得都试一遍。'
    },

    'ScoringZone.cs': {
      27: 'UnityEvent 让「谁来处理进球」变成 Inspector 里的拖拽连线，得分区脚本完全不需要知道 GameManager 的存在。这就是解耦的意义。',
      33: '用弃元 out Ball _ 表示「我只关心它是不是球，不关心是哪个球」，避免声明无用变量。',
      35: '只 Invoke，不判断加谁的分 —— 职责单一，这个脚本复用到任何一侧都行。'
    }
  },

  /* ---------------- 开发思维与步骤 ---------------- */

  think: {
    core: [
      'Pong 的价值在于「足够小但五脏俱全」：整个游戏只有 球 + 两个拍 + 上下边界 + 左右得分区 五样东西，却包含了所有游戏都有的骨架 —— 输入、物理、碰撞判定、计分、回合重置。',
      '最重要的一条思维：游戏对象不要自己记分。注意 ScoringZone 只负责「喊一声进球了」，具体给谁加分由 GameManager 决定。这种「只广播、不决策」的写法叫解耦，是后面 12 个游戏反复出现的模式。',
      '第二条是本作特有的手感设计：球打在球拍不同高度会有不同的反弹角（Paddle.useDynamicBounce）。游戏规则一个字没改，可玩性却完全不同 —— 这就是开发流程里「调手感」那一步的力量，值得你亲自关掉开关对比一下。'
    ],

    steps: [
      { t: '① 定规则：一句话说清游戏',
        d: '球从左边出界 → 电脑得分；从右边出界 → 玩家得分；先到 5 分结束。写不出这句话，就说明设计没想清楚，别急着写代码。' },
      { t: '② 搭世界：确定坐标系与边界',
        d: 'Unity 里用世界坐标，屏幕大概 -4.25~4.25 × -2.5~2.5。上下是实体墙（BouncySurface），左右是触发器（ScoringZone）。先定好边界，后面所有碰撞判定才有依据。' },
      { t: '③ 造角色：球 + 球拍',
        d: '球有位置、速度、速率三个状态；球拍有位置和移动速度。注意 Paddle 被设计成抽象基类 —— 因为玩家拍和电脑拍的「复位」和「反弹」完全一样，只有「怎么移动」不同。' },
      { t: '④ 建循环：输入与物理分离',
        d: 'Update 里读键盘（跟渲染帧），FixedUpdate 里 AddForce（跟物理帧）。这是 Unity 物理移动的标准做法，不分离的话高帧率机器和低帧率机器手感会不一致。' },
      { t: '⑤ 定交互：碰撞即规则落地',
        d: '撞拍 → 反向 + 按命中位置偏转；撞上下墙 → 反向 + 小幅加速；进得分区 → 触发记分事件。三条规则对应三个 OnCollisionEnter2D，一一对应，非常好读。' },
      { t: '⑥ 调手感：动态反弹与限速',
        d: 'useDynamicBounce 让击球点决定角度（最大 75°）；Ball 的 FixedUpdate 用「方向 × 速率」把速度钳住，保证球不会因为反复碰撞越飞越快直到穿模。' },
      { t: '⑦ 做流程：回合与重开',
        d: 'NewRound 复位所有对象后，用 Invoke 延迟 1 秒发球，给玩家喘息时间。记得先 CancelInvoke，否则连续得分会堆积出多个发球计时器。' }
    ],

    transfer: [
      '「只广播不决策」的事件模式 → 2048 的合并回调、扫雷的连锁展开、炸弹人的链式爆炸，本质都是同一招。',
      '「Update 读输入 / FixedUpdate 施力」的分离 → 炸弹人的 MovementController、蜈蚣的 Blaster 全都沿用。',
      '「方向 × 速率」的速度管理 → 小行星的推力与阻力、太空侵略者的子弹、打砖块的球速控制，都是这个模型的变体。'
    ]
  },

  /* =========================================================================
   * create(api) —— 可玩的浏览器复刻版
   *
   * 刻意与 Unity 版保持结构一致：
   *   Update 读输入 → FixedUpdate 移动 → 碰撞判定 → draw 渲染
   * 变量名也对应，方便对照源码阅读。
   * ======================================================================= */

  create: function (api) {

    /* ---------- 世界尺寸（逻辑坐标，与显示分辨率无关） ---------- */
    var W = 640, H = 360;

    /* ---------- 球拍参数 ---------- */
    var PW = 12, PH = 74;                 // 宽、高
    var PX = 26, CX = W - 26 - PW;        // 玩家 x、电脑 x
    var SPEED = 330;                      // 移动速度（像素/秒）

    /* ---------- 球参数 ---------- */
    var R = 8;                            // 半径
    var BASE = 250;                       // 初速（对应 Unity 的 baseSpeed）
    var MAXSP = 620;                      // 上限（对应 maxSpeed）
    var WIN = 5;                          // 获胜分数

    /* ---------- 状态 ---------- */
    var playerY = H / 2;                  // 玩家拍中心 y
    var comY = H / 2;                     // 电脑拍中心 y
    var ballX = W / 2, ballY = H / 2;     // 球位置
    var ballVX = 0, ballVY = 0;           // 球速度矢量
    var speed = BASE;                     // 当前速率（对应 currentSpeed）
    var pScore = 0, cScore = 0;
    var rally = 0;                        // 本回合来回次数
    var waitT = 0;                        // 发球倒计时
    var over = false;
    var bounceMode = 'Additive';          // 'Additive' | 'Multiplicative'
    var varT = 0;

    /* ---------- 复位：对应 Paddle.ResetPosition / Ball.ResetPosition ---------- */
    function resetAll() {
      pScore = 0; cScore = 0; over = false;
      newRound();
    }

    function newRound() {
      playerY = H / 2;
      comY = H / 2;
      ballX = W / 2; ballY = H / 2;
      ballVX = 0; ballVY = 0;
      speed = BASE;
      rally = 0;
      waitT = 1.0;                        // 对应 Invoke(nameof(StartRound), 1f)
      api.hit('GameManager.cs', 60);
    }

    /* ---------- 发球：对应 Ball.AddStartingForce ---------- */
    function serve() {
      var x = Math.random() < 0.5 ? -1 : 1;
      // y 取 ±0.5~1，避免接近纯水平的球（源码里专门注释过这个坑）
      var y = Math.random() < 0.5
        ? -(0.5 + Math.random() * 0.5)
        :  (0.5 + Math.random() * 0.5);
      var len = Math.sqrt(x * x + y * y);
      ballVX = x / len * speed;
      ballVY = y / len * speed;
      api.hit('Ball.cs', 50);
      api.log('发球：方向 (' + (x / len).toFixed(2) + ', ' + (y / len).toFixed(2) +
              ')，速率 ' + speed.toFixed(0), 'ok');
    }

    /* ---------- 击拍：对应 Paddle.OnCollisionEnter2D 的动态反弹 ---------- */
    function bounceOffPaddle(padX, padTopY, isRight) {
      // 只有球朝着拍子飞时才判定，避免一次接触反复触发
      if (isRight ? ballVX <= 0 : ballVX >= 0) return false;

      var lo = padTopY, hi = padTopY + PH;
      if (ballY + R < lo || ballY - R > hi) return false;
      if (isRight ? (ballX + R < padX) : (ballX - R > padX + PW)) return false;

      // 命中点相对拍子中心的归一化偏移 [-1, 1]
      var offset = (ballY - (padTopY + PH / 2)) / (PH / 2);
      if (offset > 1) offset = 1;
      if (offset < -1) offset = -1;

      var maxBounceAngle = 75 * Math.PI / 180;      // 源码里的 75f
      var ang = offset * maxBounceAngle;

      // 加性模式：每次撞击固定提速；乘性模式按比例缩放
      if (bounceMode === 'Multiplicative') speed = Math.min(MAXSP, speed * 1.05);
      else speed = Math.min(MAXSP, speed + 8);

      var dir = isRight ? -1 : 1;                     // 反弹后水平方向
      ballVX = Math.cos(ang) * dir * speed;
      ballVY = Math.sin(ang) * speed;

      // 推出去一点，防止下一帧还判定为碰撞
      ballX = isRight ? padX - R - 0.5 : padX + PW + R + 0.5;

      rally++;
      api.hit('Paddle.cs', 70);
      api.log('击拍 #' + rally + '：偏移 ' + offset.toFixed(2) +
              ' → 反弹角 ' + (ang * 180 / Math.PI).toFixed(1) + '°' +
              '，速率 ' + speed.toFixed(0), 'info');
      return true;
    }

    /* ---------- 每帧更新（对应 Update + FixedUpdate） ---------- */
    function update(dt, keys, api) {

      if (over) return;

      /* --- 输入：对应 PlayerPaddle.Update --- */
      if (keys.up)   playerY -= SPEED * dt;
      if (keys.down) playerY += SPEED * dt;
      if (playerY < PH / 2) playerY = PH / 2;
      if (playerY > H - PH / 2) playerY = H - PH / 2;

      /* --- AI：对应 ComputerPaddle.FixedUpdate --- */
      var comSpeed = SPEED * 0.82;                 // 略慢于玩家，保证可赢
      if (ballVX > 0) {                            // 球朝电脑飞来 → 追球
        if (ballY > comY + 4)      comY += comSpeed * dt;
        else if (ballY < comY - 4) comY -= comSpeed * dt;
      } else {                                     // 否则回中线待命
        if (comY > H / 2 + 4)      comY -= comSpeed * dt;
        else if (comY < H / 2 - 4) comY += comSpeed * dt;
      }
      if (comY < PH / 2) comY = PH / 2;
      if (comY > H - PH / 2) comY = H - PH / 2;

      /* --- 发球倒计时：对应 GameManager 的 Invoke --- */
      if (waitT > 0) {
        waitT -= dt;
        if (waitT <= 0) serve();
        publish();
        return;
      }

      /* --- 球移动（分步推进，防止高速穿模） --- */
      var steps = 4, sdt = dt / steps;
      for (var s = 0; s < steps; s++) {
        ballX += ballVX * sdt;
        ballY += ballVY * sdt;

        /* 上下边界：对应 BouncySurface.OnCollisionEnter2D */
        if (ballY - R < 0) {
          ballY = R; ballVY = -ballVY;
          if (bounceMode === 'Multiplicative') speed = Math.min(MAXSP, speed * 1.05);
          else speed = Math.min(MAXSP, speed + 8);
          var l1 = Math.sqrt(ballVX * ballVX + ballVY * ballVY) || 1;
          ballVX = ballVX / l1 * speed; ballVY = ballVY / l1 * speed;
          api.hit('BouncySurface.cs', 38);
          api.log('撞上边界 → 反向，速率提升至 ' + speed.toFixed(0), 'info');
        } else if (ballY + R > H) {
          ballY = H - R; ballVY = -ballVY;
          if (bounceMode === 'Multiplicative') speed = Math.min(MAXSP, speed * 1.05);
          else speed = Math.min(MAXSP, speed + 8);
          var l2 = Math.sqrt(ballVX * ballVX + ballVY * ballVY) || 1;
          ballVX = ballVX / l2 * speed; ballVY = ballVY / l2 * speed;
          api.hit('BouncySurface.cs', 38);
          api.log('撞下边界 → 反向，速率提升至 ' + speed.toFixed(0), 'info');
        }

        /* 球拍碰撞 */
        if (bounceOffPaddle(PX, playerY - PH / 2, false)) break;
        if (bounceOffPaddle(CX, comY - PH / 2, true)) break;
      }

      /* --- 得分区：对应 ScoringZone.OnCollisionEnter2D --- */
      if (!over && ballX < -R) {
        cScore++;
        api.hit('ScoringZone.cs', 30);
        api.log('球出左边界 → 电脑得分 ' + pScore + ' : ' + cScore, 'warn');
        checkWin('电脑');
        if (!over) newRound();
      } else if (!over && ballX > W + R) {
        pScore++;
        api.hit('ScoringZone.cs', 30);
        api.log('球出右边界 → 玩家得分 ' + pScore + ' : ' + cScore, 'ok');
        checkWin('玩家');
        if (!over) newRound();
      }

      publish();
    }

    function checkWin(who) {
      if (pScore >= WIN || cScore >= WIN) {
        over = true;
        api.log('游戏结束 —— ' + (pScore >= WIN ? '玩家' : '电脑') + '获胜！按 R 重开', 'err');
      }
    }

    /* ---------- 把关键状态推给底部面板（约 10Hz，别每帧刷 DOM） ---------- */
    function publish() {
      varT += 1;
      if (varT % 6) return;
      api.vars({
        'playerScore': pScore,
        'computerScore': cScore,
        'ball.speed': speed.toFixed(0),
        'ball.vx': ballVX.toFixed(0),
        'ball.vy': ballVY.toFixed(0),
        'rally': rally,
        'bounceMode': bounceMode
      });
    }

    /* ---------- 渲染 ---------- */
    function draw(ctx, api) {
      /* 背景 */
      ctx.fillStyle = '#0b1020';
      ctx.fillRect(0, 0, W, H);

      /* 中线（虚线） */
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.moveTo(W / 2, 6);
      ctx.lineTo(W / 2, H - 6);
      ctx.stroke();
      ctx.setLineDash([]);

      /* 分数 */
      ctx.fillStyle = 'rgba(255,255,255,.22)';
      ctx.font = '600 46px "SF Mono", Menlo, Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(String(pScore), W / 2 - 54, 56);
      ctx.fillText(String(cScore), W / 2 + 54, 56);

      /* 球拍 */
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(PX, playerY - PH / 2, PW, PH);
      ctx.fillStyle = '#a78bfa';
      ctx.fillRect(CX, comY - PH / 2, PW, PH);

      /* 球 */
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(ballX, ballY, R, 0, Math.PI * 2);
      ctx.fill();

      /* 发球提示 */
      if (waitT > 0 && !over) {
        ctx.fillStyle = 'rgba(255,255,255,.5)';
        ctx.font = '13px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('准备发球… ' + waitT.toFixed(1) + 's', W / 2, H / 2 + 54);
      }
      if (over) {
        ctx.fillStyle = (pScore >= WIN) ? '#6ee7b7' : '#fca5a5';
        ctx.font = '600 22px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText((pScore >= WIN ? '玩家获胜' : '电脑获胜') + ' · 按 R 重开', W / 2, H / 2 - 52);
      }
    }

    /* ---------- 鼠标 / 触屏：直接拖动球拍 ---------- */
    function onPointer(x, y, down, api) {
      if (down) {
        playerY = y;
        if (playerY < PH / 2) playerY = PH / 2;
        if (playerY > H - PH / 2) playerY = H - PH / 2;
      }
    }
    function onPointerMove(x, y, api) {
      playerY = y;
      if (playerY < PH / 2) playerY = PH / 2;
      if (playerY > H - PH / 2) playerY = H - PH / 2;
    }

    /* ---------- 对外接口 ---------- */
    return {
      w: W, h: H,
      reset: function () { resetAll(); api.log('已重置比分', 'sys'); },
      update: update,
      draw: draw,
      onPointer: onPointer,
      onPointerMove: onPointerMove,
      onKey: function (k, down, api) {
        if (k === 'fire' && down) api.log('提示：Pong 不用开火键，用 ↑/↓ 移动球拍', 'info');
      }
    };
  }
});
