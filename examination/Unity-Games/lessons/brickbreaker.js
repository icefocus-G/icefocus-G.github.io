/* =============================================================================
 * Brick Breaker · 打砖块
 * -----------------------------------------------------------------------------
 * 本文件三部分：
 *   1) create(api) —— 浏览器里可玩的 Canvas 复刻版（与 Unity 版逻辑一一对应）
 *   2) notes       —— 逐句讲解：「为什么这么写」
 *   3) think       —— 开发思维与步骤拆解
 *
 * 源码对应关系（方便对照阅读）：
 *   GameManager.cs → 本文件的 score / lives / level / buildLevel / miss / clear
 *   Paddle.cs      → paddle 移动 + bounceOffPaddle()（偏移 → 角度 → 旋转方向）
 *   Ball.cs        → resetBall() / serve() / 每帧把速率钳回 speed
 *   Brick.cs       → bricks[] 的 health / unbreakable / 受击上报
 *   ResetZone.cs   → update() 里「球越过底边」那一次判定
 * ========================================================================== */

UG_LESSON('brickbreaker', {

  /* ---------------- 元数据 ---------------- */

  name: '打砖块 Brick Breaker',
  ico: '🧱',
  difficulty: 2,
  tags: ['反弹向量', '触发器', '关卡管理', '生命值'],
  controls: '← → 或 A / D 移动挡板；也可以直接把鼠标移到画面上，挡板会跟着走。空格 / 回车（或点一下画面）立即发球，游戏结束后用它重开。P 暂停，R 重开整局。',
  oneLiner: '一颗球、一块挡板、一墙砖：用 5 个脚本讲透「反弹方向怎么算」「球速为什么必须独立管理」「关卡与生命怎么联动」这三件事。',

  /* ---------------- 逐句讲解：文件名 → 行号 → 讲解 ---------------- */

  notes: {

    'GameManager.cs': {
      22: '单例的核心写法：static 保证全局唯一，private set 保证只有 GameManager 自己能改引用。Brick / ResetZone 用 GameManager.Instance 反向找它，就不用互相持有引用了 —— 这是 5 个脚本之间零耦合的前提。',
      49: 'DontDestroyOnLoad 让总管在关卡切换时不被销毁。因为分数和生命存在它身上：如果每换一关就重建一个 GameManager，玩家的 300 分和剩下的 2 条命就没了。这一行是「关卡」与「生命/分数」能联动的物理基础。',
      110: '生命值只有一个入口 —— 全世界唯一能改 lives 的地方。这样调试时只要在这里打断点，就能抓住所有扣命来源。反面教材：如果 Brick 里也写一行 lives--，很快就会出现「不知道命是怎么没的」。',
      159: '通关判定放在加分之后，而不是放在球的碰撞里。因为「有没有清完」是全局信息，只有 GameManager 持有 bricks[]，也只有它问得出 Cleared()。砖块不可能自己知道自己是不是最后一块。',
      170: '两个条件缺一不可：activeInHierarchy 排除已被 SetActive(false) 打碎的砖，!unbreakable 排除永远打不烂的钢砖。少了后者，关卡里只要放一块钢砖就永远无法通关 —— 这是这类游戏最经典的卡关 bug。'
    },

    'Paddle.cs': {
      87: '取的是「挡板中心 - 球心」的水平分量，带符号：球撞在左半边时结果为正，右半边为负。用 bounds.center（包围盒中心）而不是 transform.position，是因为锚点不一定在几何中心，用后者会让反弹左右不对称。',
      92: '整局手感的灵魂一行：把「撞击点相对中心的偏移」除以挡板宽度归一化，再乘最大反弹角，得到「该偏转多少度」。注意除以的是 size.x（全宽）而不是半宽，所以最边缘也只有 75°×0.5 = 37.5° —— 既打得出角度，又不会出现贴着挡板横飞、玩家永远接不到的死球。',
      94: '这里不写 if/else 去猜「该往左还是往右」，而是把偏转做成一个旋转算子，作用在球「当前」的方向上。好处是它与入射角无关：正着撞、斜着撞、贴边擦过，都用同一行处理。把几何判断换成旋转，是 2D 游戏里最划算的一次抽象。',
      98: '只改方向、不改大小：乘的是 ball.velocity.magnitude（原速率）。如果这里写成乘一个固定值，球速就会被挡板位置左右，撞几次之后快慢失控，关卡难度彻底不可控。'
    },

    'Ball.cs': {
      46: '延时 1 秒发球，给玩家把挡板挪到位的反应时间。用 nameof(SetRandomTrajectory) 而不是字符串，方法改名时编译器直接报错；写成字符串则只会静默失效，是最难查的一类 bug。',
      56: 'normalized * speed 再配 ForceMode2D.Impulse：先把方向变成单位向量，再乘速率，一次性把冲量打进去。方向与时度在这里是分开算的 —— 这正是后面 FixedUpdate 能只改速率的前提。用 Force 而不是 Impulse 会变成持续加速，不适合发球。',
      64: '每帧把速度重新归一化到 speed：方向 × 大小，一次写死。这样球撞挡板、撞砖、撞墙都只改变方向，快慢恒定。好处有两个：一是不会因反复碰撞越来越快直到穿模；二是「调难度」退化成改一个数 —— 换关加速只要改 speed，游戏行为完全可预期。'
    },

    'Brick.cs': {
      76: '砖块被击中后只做一件事：把自己（this）交给 GameManager。它不关心加多少分、也不关心是不是最后一块。这种「只上报、不决策」的写法让 Brick 可以复制到任意关卡、任意砖型，而规则逻辑始终只有一份。'
    },

    'ResetZone.cs': {
      17: '整个脚本的价值就是这一行：它不判断球速、不判断分数、不判断第几关，只负责「球进了我这块区域」这一件事，然后转发给总管。触发器（Is Trigger）在这里的意义是「只通知、不阻挡」—— 球要能穿过去掉出屏幕，而不是被弹回来。'
    }
  },

  /* ---------------- 开发思维与步骤 ---------------- */

  think: {
    core: [
      '打砖块是「状态集中管理」的最佳范例：球、挡板、砖块都不记分也不记命，所有跨对象的信息统一汇总到 GameManager 单例。Brick 只喊「我被打了」，ResetZone 只喊「球掉下来了」，至于加多少分、扣几条命、要不要换关，全由总管裁决。正因为如此，5 个脚本加起来不到 500 行，却没有任何一处循环依赖。',
      '反弹方向不是「算出来」的，而是「旋转出来」的：Paddle 根本不关心球从哪来，只取「撞击点相对挡板中心的水平偏移」，把它映射成一个角度，再把这个角度叠加到球现有的方向上。好处是它天然适配任意入射角 —— 你不需要为「正面撞」和「斜擦」写两套分支。把几何判断转成旋转算子，是 2D 游戏里最划算的一次抽象。',
      '速度的「方向」和「大小」必须分开管理：Ball 每帧把速度重新归一化成「方向 × speed」，于是碰撞只改方向、不改快慢。这样「调难度」就只是改一个数；反过来，如果放任物理引擎自由演算，几次碰撞之后球速就会失控，关卡难度曲线将完全无法设计。'
    ],

    steps: [
      { t: '① 定规则：一句话说清游戏',
        d: '打光本关所有「可破坏」的砖 → 进入下一关；球掉出底部 → 扣一条命；3 条命用完 → 整局重来。这句话里已经藏着三个判定主体（砖阵、底部区域、生命），后面正好对应三个脚本。写不出这句话就别急着写代码。' },
      { t: '② 搭世界：先定坐标系与分区',
        d: '顶部是砖阵，中间是空的球场，底部是挡板，挡板下方还有一条看不见的 ResetZone 触发器。先画好这条「死亡线」，后面所有碰撞判定才有依据 —— 这也是为什么 ResetZone 要单独做成 GameObject 而不是写死一个 y 阈值。' },
      { t: '③ 造角色：三个对象各管各的状态',
        d: 'Ball 有位置 / 速度 / 速率；Paddle 有位置 / 方向 / 推力；Brick 有血量 / 贴图状态 / 分值。注意三者都不持有分数 —— 分数在 GameManager 身上。这是本作分层的关键。' },
      { t: '④ 建循环：输入与物理分离',
        d: 'Paddle 在 Update 里只读键盘、把结果记进 direction；真正施力放到 FixedUpdate。Ball 也在 FixedUpdate 里把速率钳回 speed。输入跟渲染帧、物理跟固定步长，高帧率和低帧率机器上的手感才一致。' },
      { t: '⑤ 定交互：三个事件，三个入口',
        d: '撞挡板 → 按偏移旋转方向（Paddle.OnCollisionEnter2D）；撞砖 → health-- 并上报（Brick.Hit → GameManager.OnBrickHit）；越过底边 → 触发器通知扣命（ResetZone → OnBallMiss）。每条规则对应一个明确的回调，非常好读，也非常好改。' },
      { t: '⑥ 调手感：反弹角上限与速率归一',
        d: 'maxBounceAngle = 75° 决定「最斜能有多斜」；配合除以全宽，最边缘实际只偏 37.5°，不会出现玩家永远追不上的横飞球。再把球速做成独立字段、每帧归一化，难度曲线就完全可控 —— 换关加速只改这一个数。' },
      { t: '⑦ 做流程：关卡与生命在这里联动',
        d: '关卡用场景名 Level1 / Level2 表示，换场景后重新 FindObjectOfType 抓引用（因为新场景里的是新实例）；Cleared() 遍历 bricks[] 判通关，OnBallMiss() 扣命并决定「重置本关」还是「整局重来」。关卡进度与生命值这两条线，在 GameManager 里汇合。' }
    ],

    transfer: [
      '「只上报、不决策」的单例总管 → 炸弹人的爆炸结算、太空侵略者的波次管理、2048 的合并回调，都是同一招：叶子对象只喊事件，规则集中在一处。',
      '「偏移量 → 角度 → 旋转方向」的反弹模型 → 本系列第 1 课 Pong 用的是完全相同的思路，只是那里除以挡板半高、这里除以全宽；换成 3D 就是台球游戏里击球点决定旋转的那套算法。',
      '「方向 × 速率，每帧归一化」 → 小行星的推力与限速、蜈蚣的子弹速度、太空侵略者的敌机推进，本质都是这个两分量模型的变体。'
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
    var W = 640, H = 400;

    /* ---------- 分区（对应 Unity 场景里的摆放） ---------- */
    var HUD_H = 34;                       // 顶部信息栏高度
    var TOP = HUD_H;                      // 球能到达的最高处（上墙）

    /* ---------- 砖阵参数 ---------- */
    var COLS = 10;                        // 列数
    var BW = 56, BH = 20;                 // 单块砖宽、高
    var GAPX = 4, GAPY = 6;               // 砖间距
    var BX0 = (W - (COLS * BW + (COLS - 1) * GAPX)) / 2;   // 让砖阵水平居中
    var BY0 = 40;                         // 砖阵顶部 y

    /* ---------- 挡板参数（对应 Paddle） ---------- */
    var PW = 92, PH = 12;
    var PY = 356;                         // 挡板顶部 y
    var PADDLE_SPEED = 460;               // 键盘移动速度（像素/秒）
    var MAX_BOUNCE_ANGLE = 75;            // 源码里的 maxBounceAngle = 75f

    /* ---------- 球参数（对应 Ball） ---------- */
    var R = 7;                            // 半径
    var BASE_SPEED = 200;                 // 对应 Ball.speed
    var SPEED_PER_LEVEL = 34;             // 每过一关提速（教学版拓展）
    var MAX_SPEED = 420;

    /* ---------- 规则参数（对应 GameManager） ---------- */
    var NUM_LEVELS = 2;                   // 源码里的 NUM_LEVELS = 2
    var START_LIVES = 3;                  // 源码 lives = 3

    /* ---------- 状态 ---------- */
    var score = 0, lives = START_LIVES, level = 1;
    var speed = BASE_SPEED;               // 当前速率，对应 Ball.speed
    var bricks = [];                      // 对应 Brick[]
    var bricksLeft = 0;                   // 还剩多少块「可破坏」砖
    var paddleX = (W - PW) / 2;           // 挡板左上角 x
    var ballX = W / 2, ballY = 230;
    var ballVX = 0, ballVY = 0;
    var waitT = 0;                        // 发球倒计时，对应 Invoke(..., 1f)
    var phase = 'ready';                  // 'ready' | 'play' | 'over'
    var toast = '', toastT = 0;           // 居中提示（过关 / 通关）
    var varT = 0;

    var ROW_COLORS = ['#f472b6', '#fb7185', '#fb923c', '#facc15', '#4ade80', '#38bdf8'];

    /* =====================================================================
     * 关卡构建 —— 对应 LoadLevel() + 场景里摆好的砖阵
     * 第 2 关会放几块 unbreakable 的钢砖，用来演示 Cleared() 为什么要排除它们
     * =================================================================== */
    function buildLevel(lv) {
      bricks = [];
      bricksLeft = 0;

      var rows = (lv === 1) ? 5 : 6;

      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < COLS; c++) {
          var x = BX0 + c * (BW + GAPX);
          var y = BY0 + r * (BH + GAPY);

          // 第 2 关左右两侧和第 4、5 列放钢砖：永远打不碎，也不计入通关条件
          var unbreakable = (lv >= 2 && r === 2 && (c === 0 || c === 1 || c === 8 || c === 9));

          // 血量 = 贴图状态数（对应 Brick 里 health = states.Length）：越靠上越硬
          var hp = 1;
          if (!unbreakable) {
            if (lv === 1) hp = (r < 2) ? 2 : 1;
            else hp = (r < 2) ? 3 : (r < 4 ? 2 : 1);
          }

          var b = {
            x: x, y: y, w: BW, h: BH,
            health: hp, maxHealth: hp,
            unbreakable: unbreakable,
            points: (rows - r) * 100,     // 对应 Brick.points：上面的砖更值钱
            color: ROW_COLORS[r % ROW_COLORS.length],
            alive: true
          };
          bricks.push(b);
          if (!unbreakable) bricksLeft++;
        }
      }
    }

    /* ---------- 复位挡板：对应 Paddle.ResetPaddle() ---------- */
    function resetPaddle() {
      paddleX = (W - PW) / 2;             // 对应把 x 归 0（世界中心）
    }

    /* ---------- 复位球：对应 Ball.ResetBall() ---------- */
    function resetBall() {
      ballX = W / 2;
      ballY = 230;                        // 对应 transform.position = Vector2.zero（场景中心）
      ballVX = 0;
      ballVY = 0;
      waitT = 1.0;                        // 对应 Invoke(nameof(SetRandomTrajectory), 1f)
      phase = 'ready';
      api.hit('Ball.cs', 46);
    }

    /* ---------- 只重置本关：对应 GameManager.ResetLevel() ----------
       注意源码里只复位挡板与球，砖块维持被打的进度，分数也保留 */
    function resetLevel() {
      resetPaddle();
      resetBall();
    }

    /* ---------- 整局重来：对应 GameManager.NewGame() ---------- */
    function newGame() {
      score = 0;
      lives = START_LIVES;
      level = 1;
      speed = BASE_SPEED;
      buildLevel(level);
      resetPaddle();
      resetBall();
    }

    /* 带日志的重开：引擎载入时会清一次控制台，所以首次初始化走上面的静默版 */
    function restartGame() {
      newGame();
      api.log('新的一局：分数归零，生命恢复 ' + START_LIVES + '，从第 1 关开始', 'sys');
      api.log('本关共 ' + bricksLeft + ' 块可破坏砖（第 2 关会有打不碎的钢砖）', 'info');
    }

    /* ---------- 发球：对应 Ball.SetRandomTrajectory() ---------- */
    function serve() {
      // 源码：force = (Random.Range(-1,1), -1)，Unity 里 y=-1 是向下；
      // 画布 y 轴朝下，所以这里 y 取 +1，效果一致 —— 都是朝挡板方向发射
      var fx = Math.random() * 2 - 1;
      var fy = 1;
      var len = Math.sqrt(fx * fx + fy * fy) || 1;
      ballVX = fx / len * speed;
      ballVY = fy / len * speed;
      phase = 'play';
      api.hit('Ball.cs', 56);
      api.log('发球：方向 (' + (fx / len).toFixed(2) + ', ' + (fy / len).toFixed(2) +
              ')，速率 ' + speed.toFixed(0) + '（方向 × 速率，两个量分开管）', 'ok');
    }

    /* =====================================================================
     * 撞挡板 —— 对应 Paddle.OnCollisionEnter2D
     * 三步：偏移量 → 反弹角 → 把方向旋转过去，速率保持不变
     * =================================================================== */
    function bounceOffPaddle() {
      if (ballVY <= 0) return false;                       // 只在球往下落时判定
      if (ballY + R < PY || ballY - R > PY + PH) return false;
      if (ballX + R < paddleX || ballX - R > paddleX + PW) return false;

      // ① contactDistance.x = 挡板中心 - 球心（源码 Paddle.cs:87）
      var contactX = (paddleX + PW / 2) - ballX;

      // ② bounceAngle = 偏移 / 挡板全宽 × maxBounceAngle（源码 Paddle.cs:92）
      var ang = (contactX / PW) * MAX_BOUNCE_ANGLE * Math.PI / 180;

      // ③ 先让物理引擎把竖直方向弹回去（y 取负 = 向上），再叠加上面的旋转
      var l = Math.sqrt(ballVX * ballVX + ballVY * ballVY) || 1;
      var dx = ballVX / l;
      var dyr = -Math.abs(ballVY / l);
      var cs = Math.cos(ang), sn = Math.sin(ang);
      var nx = dx * cs + dyr * sn;
      var ny = -dx * sn + dyr * cs;

      // 兜底：保证球一定往上走，且不会贴着挡板横飞（源码靠 37.5° 上限规避）
      if (ny > -0.30) {
        ny = -0.30;
        var l2 = Math.sqrt(nx * nx + ny * ny) || 1;
        nx = nx / l2; ny = ny / l2;
      }

      ballVX = nx * speed;                // ④ 只改方向，速率仍是 speed
      ballVY = ny * speed;
      ballY = PY - R - 0.5;               // 推出去一点，防止下一帧重复判定

      api.hit('Paddle.cs', 92);
      api.log('撞挡板：偏移 ' + (contactX / PW).toFixed(2) +
              ' → 反弹角 ' + (ang * 180 / Math.PI).toFixed(1) + '°' +
              '，速率保持 ' + speed.toFixed(0), 'info');
      return true;
    }

    /* =====================================================================
     * 撞砖 —— 对应 Brick.OnCollisionEnter2D → Hit() → GameManager.OnBrickHit()
     * =================================================================== */
    function hitBrick(b) {
      if (b.unbreakable) {
        api.hit('Brick.cs', 60);
        api.log('撞到钢砖（unbreakable = true）：不扣血、不消失、不计入通关条件', 'warn');
        return;
      }

      b.health--;                                          // 源码 Brick.cs:65

      if (b.health <= 0) {
        b.alive = false;                                   // 源码 Brick.cs:69 SetActive(false)
        bricksLeft--;
        score += b.points;                                 // 源码 GameManager.cs:155
        api.hit('Brick.cs', 69);
        api.log('击碎一块砖 → +' + b.points + ' 分，当前 ' + score +
                ' 分，剩余 ' + bricksLeft + ' 块', 'ok');
      } else {
        api.hit('Brick.cs', 65);
        api.log('砖块受击：剩余血量 ' + b.health + '/' + b.maxHealth +
                '（血量 = 贴图状态数，血越少贴图越破）', 'info');
      }

      // 对应 Brick.cs:76 的上报 —— 砖块自己不判断是不是最后一块
      if (bricksLeft <= 0) levelCleared();
    }

    /* ---------- 通关：对应 GameManager.OnBrickHit 里的 Cleared() 判定 ---------- */
    function levelCleared() {
      api.hit('GameManager.cs', 159);

      if (level < NUM_LEVELS) {
        level++;
        speed = Math.min(MAX_SPEED, BASE_SPEED + (level - 1) * SPEED_PER_LEVEL);
        buildLevel(level);
        toast = '第 ' + (level - 1) + ' 关通过！进入第 ' + level + ' 关 · 球速 ' + speed.toFixed(0);
        api.log('本关可破坏砖已清空 → 进入第 ' + level + ' 关，球速提升到 ' + speed.toFixed(0), 'ok');
      } else {
        // 源码：level > NUM_LEVELS 时回到第 1 关循环（也可以改成加载"胜利"场景）
        level = 1;
        speed = Math.min(MAX_SPEED, speed + SPEED_PER_LEVEL);
        buildLevel(level);
        toast = '全部 ' + NUM_LEVELS + ' 关通关！回到第 1 关循环 · 球速 ' + speed.toFixed(0);
        api.log('全部关卡通关 → 按源码逻辑回到第 1 关循环，分数与生命保留', 'ok');
      }

      toastT = 2.2;
      resetPaddle();
      resetBall();
    }

    /* ---------- 漏球：对应 ResetZone.OnTriggerEnter2D → GameManager.OnBallMiss() ---------- */
    function onBallMiss() {
      api.hit('ResetZone.cs', 17);
      api.log('球越过底边 → 进入 ResetZone 触发器（只通知、不阻挡）', 'warn');

      lives--;                                             // 源码 GameManager.cs:110
      api.hit('GameManager.cs', 110);

      if (lives > 0) {
        // 源码 GameManager.cs:113-114：还有命 → 只重置本关，砖块进度与分数都保留
        api.log('剩余生命 ' + lives + ' → ResetLevel()：挡板与球归位，砖块进度和 ' +
                score + ' 分保留', 'info');
        resetLevel();
      } else {
        // 源码 GameManager.cs:117：命用光 → GameOver() → NewGame() 整局重来
        api.hit('GameManager.cs', 117);
        api.log('生命耗尽 → GameOver() → NewGame()：分数与生命全部重置（按空格重开）', 'err');
        phase = 'over';
        ballVX = 0; ballVY = 0;
      }
    }

    /* ---------- 球 × 砖 的圆-矩形碰撞：判定 + 求反射法线 ---------- */
    function collideBrick(b) {
      var bx2 = b.x + b.w, by2 = b.y + b.h;
      var cx = ballX < b.x ? b.x : (ballX > bx2 ? bx2 : ballX);
      var cy = ballY < b.y ? b.y : (ballY > by2 ? by2 : ballY);
      var dx = ballX - cx, dy = ballY - cy;
      if (dx * dx + dy * dy > R * R) return false;

      if (dx === 0 && dy === 0) {
        // 球心已陷进砖里：沿穿透最浅的那个轴弹出
        var dl = ballX - b.x, dr = bx2 - ballX;
        var dt = ballY - b.y, db = by2 - ballY;
        var mx = dl < dr ? dl : dr, my = dt < db ? dt : db;
        if (mx < my) {
          ballVX = -ballVX;
          ballX = (dl < dr) ? b.x - R - 0.5 : bx2 + R + 0.5;
        } else {
          ballVY = -ballVY;
          ballY = (dt < db) ? b.y - R - 0.5 : by2 + R + 0.5;
        }
      } else if (dx === 0) {
        // 上下撞：只翻竖直分量
        ballVY = -ballVY;
        ballY = (dy < 0) ? b.y - R - 0.5 : by2 + R + 0.5;
      } else if (dy === 0) {
        // 左右撞：只翻水平分量
        ballVX = -ballVX;
        ballX = (dx < 0) ? b.x - R - 0.5 : bx2 + R + 0.5;
      } else {
        // 撞在角上：沿圆心连线做真正的向量反射 v' = v - 2(v·n)n
        var nl = Math.sqrt(dx * dx + dy * dy) || 1;
        var nx = dx / nl, ny = dy / nl;
        var dot = ballVX * nx + ballVY * ny;
        ballVX = ballVX - 2 * dot * nx;
        ballVY = ballVY - 2 * dot * ny;
        ballX = cx + nx * (R + 0.5);
        ballY = cy + ny * (R + 0.5);
      }

      // 方向变了，但速率必须写回 speed —— 对应 Ball.FixedUpdate 的归一化
      var l = Math.sqrt(ballVX * ballVX + ballVY * ballVY) || 1;
      ballVX = ballVX / l * speed;
      ballVY = ballVY / l * speed;
      return true;
    }

    /* ---------- 每帧更新（对应 Update 读输入 + FixedUpdate 走物理） ---------- */
    function update(dt, keys, api) {

      if (toastT > 0) toastT -= dt;

      if (phase === 'over') { publish(); return; }

      /* --- 输入：对应 Paddle.Update（只记录方向，不碰物理） --- */
      if (keys.left)  paddleX -= PADDLE_SPEED * dt;
      if (keys.right) paddleX += PADDLE_SPEED * dt;
      clampPaddle();

      /* --- 发球倒计时：对应 Ball.ResetBall 里的 Invoke --- */
      if (waitT > 0) {
        waitT -= dt;
        if (waitT <= 0) serve();
        publish();
        return;
      }

      /* --- 球的移动：分步推进，防止高速穿砖 --- */
      var vlen = Math.sqrt(ballVX * ballVX + ballVY * ballVY);
      var steps = Math.ceil(vlen * dt / 4) || 1;
      if (steps > 8) steps = 8;
      var sdt = dt / steps;

      for (var s = 0; s < steps; s++) {
        ballX += ballVX * sdt;
        ballY += ballVY * sdt;

        /* 三面墙：撞上/左/右只翻对应分量，速率不变 */
        if (ballX - R < 0)      { ballX = R;     ballVX = -ballVX; }
        else if (ballX + R > W) { ballX = W - R; ballVX = -ballVX; }
        if (ballY - R < TOP)    { ballY = TOP + R; ballVY = -ballVY; }

        /* 挡板 */
        if (bounceOffPaddle()) break;

        /* 砖块：一帧最多处理一次，避免角落连撞导致方向乱跳 */
        for (var i = 0; i < bricks.length; i++) {
          var b = bricks[i];
          if (!b.alive) continue;
          if (collideBrick(b)) { hitBrick(b); break; }
        }
        if (phase !== 'play') break;          // 过关/结束后立即停手

        /* 掉出底部：对应 ResetZone —— 触发器不阻挡，球会一直掉出屏幕 */
        if (ballY - R > H) { onBallMiss(); break; }
      }

      publish();
    }

    function clampPaddle() {
      if (paddleX < 0) paddleX = 0;
      if (paddleX > W - PW) paddleX = W - PW;
    }

    /* ---------- 把关键状态推给底部面板（约 10Hz，别每帧刷 DOM） ---------- */
    function publish() {
      varT++;
      if (varT % 6) return;
      api.vars({
        'score': score,
        'lives': lives,
        'level': level + ' / ' + NUM_LEVELS,
        'bricksLeft': bricksLeft,
        'ball.speed': speed.toFixed(0),
        'ball.vx': ballVX.toFixed(0),
        'ball.vy': ballVY.toFixed(0),
        'paddle.x': paddleX.toFixed(0),
        'phase': phase
      });
    }

    /* ---------- 渲染 ---------- */
    function draw(ctx, api) {
      /* 背景 */
      ctx.fillStyle = '#0b1020';
      ctx.fillRect(0, 0, W, H);

      /* 顶部信息栏 */
      ctx.fillStyle = 'rgba(255,255,255,.06)';
      ctx.fillRect(0, 0, W, HUD_H);
      ctx.textAlign = 'left';
      ctx.font = '600 15px "SF Mono", Menlo, Consolas, monospace';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('SCORE ' + score, 14, 23);
      ctx.textAlign = 'center';
      ctx.fillText('LEVEL ' + level + ' / ' + NUM_LEVELS, W / 2, 23);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fca5a5';
      var hearts = '';
      for (var i = 0; i < lives; i++) hearts += '♥ ';
      ctx.fillText(hearts + '  砖 ' + bricksLeft, W - 14, 23);

      /* 上墙 */
      ctx.strokeStyle = 'rgba(255,255,255,.14)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, TOP);
      ctx.lineTo(W, TOP);
      ctx.stroke();

      /* 砖块 */
      for (var k = 0; k < bricks.length; k++) {
        var b = bricks[k];
        if (!b.alive) continue;

        if (b.unbreakable) {
          ctx.fillStyle = '#475569';
          ctx.fillRect(b.x, b.y, b.w, b.h);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
          ctx.beginPath();
          ctx.moveTo(b.x + 8, b.y + 5);  ctx.lineTo(b.x + b.w - 8, b.y + b.h - 5);
          ctx.moveTo(b.x + b.w - 8, b.y + 5); ctx.lineTo(b.x + 8, b.y + b.h - 5);
          ctx.stroke();
        } else {
          ctx.fillStyle = b.color;
          ctx.fillRect(b.x, b.y, b.w, b.h);
          // 血量越低，压一层黑，模拟 Brick 里"切换更破损的贴图"
          var t = b.maxHealth > 1 ? (b.health - 1) / (b.maxHealth - 1) : 1;
          ctx.fillStyle = 'rgba(0,0,0,' + ((1 - t) * 0.45).toFixed(3) + ')';
          ctx.fillRect(b.x, b.y, b.w, b.h);
          ctx.strokeStyle = 'rgba(0,0,0,.35)';
          ctx.lineWidth = 1;
          ctx.strokeRect(b.x + .5, b.y + .5, b.w - 1, b.h - 1);
        }
      }

      /* ResetZone：挡板下方那条"只通知、不阻挡"的触发器 */
      ctx.strokeStyle = 'rgba(248,113,113,.35)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, PY + PH + 20);
      ctx.lineTo(W, PY + PH + 20);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(248,113,113,.35)';
      ctx.font = '11px -apple-system, "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ResetZone（触发器：球进入即扣一条命）', W / 2, PY + PH + 38);

      /* 挡板 */
      ctx.fillStyle = '#38bdf8';
      roundRect(ctx, paddleX, PY, PW, PH, 6);
      ctx.fill();

      /* 球 */
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(ballX, ballY, R, 0, Math.PI * 2);
      ctx.fill();

      /* 发球倒计时 */
      if (phase === 'ready') {
        ctx.fillStyle = 'rgba(255,255,255,.55)';
        ctx.font = '13px -apple-system, "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('准备发球… ' + Math.max(0, waitT).toFixed(1) + 's（空格可立即发射）',
                     W / 2, ballY + 34);
      }

      /* 过关 / 通关提示 */
      if (toastT > 0) {
        ctx.fillStyle = '#6ee7b7';
        ctx.font = '600 20px -apple-system, "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(toast, W / 2, H / 2 + 40);
      }

      /* 游戏结束 */
      if (phase === 'over') {
        ctx.fillStyle = 'rgba(11,16,32,.78)';
        ctx.fillRect(0, H / 2 - 60, W, 110);
        ctx.fillStyle = '#fca5a5';
        ctx.font = '600 24px -apple-system, "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER · 得分 ' + score, W / 2, H / 2 - 18);
        ctx.fillStyle = 'rgba(255,255,255,.6)';
        ctx.font = '14px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('按 空格 / 回车 或点一下画面重开（对应 GameManager.NewGame）', W / 2, H / 2 + 16);
      }
    }

    /* 圆角矩形（ES5 手写，不依赖任何库） */
    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    /* ---------- 鼠标 / 触屏：挡板跟着指针走 ---------- */
    function movePaddleTo(x) {
      paddleX = x - PW / 2;
      clampPaddle();
    }

    function onPointer(x, y, down, api) {
      if (down) {
        movePaddleTo(x);
        if (phase === 'over') restartGame();         // 点一下重开
        else if (waitT > 0) { waitT = 0; serve(); }
      }
    }

    function onPointerMove(x, y, api) {
      if (phase !== 'over') movePaddleTo(x);
    }

    /* ---------- 对外接口 ---------- */
    newGame();

    return {
      w: W, h: H,
      reset: function () { restartGame(); api.log('已重置整局', 'sys'); },
      update: update,
      draw: draw,
      onPointer: onPointer,
      onPointerMove: onPointerMove,
      onKey: function (k, down, api) {
        if (!down) return;
        if (k === 'fire' || k === 'up') {
          if (phase === 'over') restartGame();
          else if (waitT > 0) { waitT = 0; serve(); }
          else api.log('提示：用 ← → / A D 或鼠标移动挡板接球', 'info');
        }
      }
    };
  }
});
