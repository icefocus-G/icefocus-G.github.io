/* =============================================================================
 * Donkey Kong · 大金刚
 * -----------------------------------------------------------------------------
 * 本文件三部分：
 *   1) create(api) —— 浏览器里可玩的 Canvas 复刻版（与 Unity 版逻辑一一对应）
 *   2) notes       —— 逐句讲解：「为什么这么写」
 *   3) think       —— 开发思维与步骤拆解
 *
 * 与 Unity 版的对应关系：
 *   girders[]      ← 场景里挂在 "Ground" 层的钢架（Barrel 靠它的 right 向量滚）
 *   ladders[]      ← "Ladder" 层的梯子（Player.CheckCollision 用 OverlapBox 检测）
 *   Spawner 定时器 ← Spawner.cs 的 Invoke 递归预约
 *   barrel.s       ← Barrel.cs 的 AddForce(transform.right * speed, Impulse)
 *   过场黑屏       ← GameManager.LoadLevel 里 camera.cullingMask = 0 + Invoke(1f)
 * ========================================================================== */

UG_LESSON('donkeykong', {

  /* ---------------- 元数据 ---------------- */

  name: '大金刚 Donkey Kong',
  ico: '🦍',
  difficulty: 2,
  tags: ['生成器', '斜面滚动', '碰撞层', '场景切换'],
  controls: '← → 左右移动，空格跳跃（可跃过木桶）。站到梯子上按 ↑ ↓ 上下爬。P 暂停，R 重开。触屏：点画面上半部跳跃，底部条带左右两侧移动、中间上爬。',
  oneLiner: '沿钢架爬到顶层救出公主，躲开大金刚不断抛下、会顺着斜面自己滚过来的木桶。用 29 行的木桶脚本，把「生成器 + 用物理表达规则 + 碰撞层筛选」三件事讲透。',

  /* ---------------- 逐句讲解：文件名 → 行号 → 讲解 ---------------- */

  notes: {

    'Player.cs': {
      67: '用 NonAlloc 版本而不是 OverlapBox：前者把结果写进预先分配好的 overlaps 数组（第 22 行，长度 4 足够），每帧检测不产生任何 GC 垃圾。返回值 amount 才是真实命中个数 —— 后面的循环必须只遍历 [0, amount)，绝不能遍历整个数组，因为下标超出 amount 的位置残留着上一帧的旧数据，照着处理就会「撞到空气」。另外注意这里没有传 LayerMask 参数，也就是不分敌我把周围全查出来，再在循环里用 layer 分流（第 73 / 81 行）。',
      73: '碰撞层判定。有意思的是 Barrel.cs 第 24 行用的是几乎同一句判断，但两者完全不冲突：玩家只关心「我脚下的盒子里有没有 Ground」，木桶只关心「我撞到的东西是不是 Ground」。这就是分层的意义 —— 物理引擎照常让所有东西互相碰撞，但「谁该对这次碰撞作出反应」由脚本自己用 layer 筛。补充一点工程习惯：NameToLayer 每次都要查表，标准做法是在 Awake 里缓存成 int 字段，写在循环里只是教学上更直观。',
      79: '单向平台的关键一行。平台在玩家脚下（grounded = true）就保持碰撞；不在脚下就临时忽略这一对碰撞体，于是玩家可以从下方跳穿钢架 —— 这正是大金刚钢架该有的手感，否则你想上二层就只能绕到平台端点。注释里那句 "Turn off collision on platforms the player is not grounded to" 说的就是这个。注意它是「修改物理引擎的碰撞关系」而不是移动物体，状态切换时一定要记得恢复，否则关系会残留到你不想忽略的时候。',
      114: '整个脚本唯一的位移语句。Update 只负责算出 direction，真正移动全部交给 FixedUpdate + MovePosition —— 这是「输入与物理分离」的标准分工：Update 跟渲染帧走，FixedUpdate 跟固定物理步长走，于是 144Hz 与 60Hz 的机器跳得一样高。用 MovePosition 而不是直接改 transform.position：前者会正确处理插值与碰撞回调，后者会让角色瞬移穿墙。还要和第 92 行连起来看：跳跃条件是 grounded && Input.GetButtonDown("Jump")，也就是「必须踩着地」，配合这一行才形成完整的跳跃闭环。',
      139: '过关判定用 Tag 而不是 Layer：Layer 是给物理引擎用的（第 73 行的 Ground 决定「能不能踩」），Tag 是给游戏逻辑用的（Objective / Obstacle 决定「赢还是输」），两者职责分开，各管一段。用 CompareTag 而不是 gameObject.tag == "Objective"：前者不分配临时字符串、不产生 GC 垃圾，而且标签拼错时 CompareTag 会直接报错，字符串比较只会静默失效 —— 后者是最难查的一类 bug。',
      144: '撞到木桶 = 失败。这里有两处值得照抄的写法：① 两个分支开头都先写 enabled = false（第 141 / 146 行），把自己的输入和移动先关掉，再去通知 GameManager —— 否则玩家会在过关/失败动画里还能左右走动；② 这个脚本自己不扣命、不切场景，只喊一声 LevelFailed()，具体扣几条命、要不要重开一局，是 GameManager 的事（GameManager.cs 第 89 行）。这就是「只广播、不决策」。'
    },

    'Spawner.cs': {
      18: '为什么不用 InvokeRepeating：InvokeRepeating 的间隔在注册那一刻就定死了，只能每 2 秒准时掉一个桶，节奏机械、玩家背两次就能预判。这里改成「每次生成完再预约下一次」（第 29 行），每次都能用 Random.Range(minTime, maxTime) 重新取一个区间，节奏就活了。这是游戏开发里很常见的一次升级：把「固定周期的定时器」换成「自递归的随机定时器」。同时注意 OnEnable / OnDisable 成对出现（第 21~24 行），Disable 时 CancelInvoke —— 不取消的话，关卡切换、物体销毁之后计时器还在跑，会往已经不存在的场景里生成物体。',
      28: '生成点挂在「大金刚手上的一个空物体」上，而不是把坐标写死在代码里 —— 这样在 Inspector 里拖一拖就能改抛桶位置，美术调整了动画也不需要改代码。Quaternion.identity 表示不旋转：木桶的滚动完全交给物理（见 Barrel.cs），生成时保持正立即可。另外要清醒地知道 Instantiate 每次都要付一次内存分配与初始化的代价；这里 2~4 秒一个桶，直接 Instantiate 完全够用，但换成子弹、粒子这种高频生成就必须上对象池了。',
      29: '递归预约下一次：生成完立刻排下一次，形成一个自驱动的循环，不需要任何外部驱动，也不用 Update 里计时判断。minTime / maxTime 是 public 字段（第 13~14 行），等于把「难度旋钮」交给了关卡设计 —— 后面的关卡只要把这两个值调小，木桶就来得更密，一行逻辑代码都不用改。这也是它比 InvokeRepeating 更适合做难度曲线的原因：InvokeRepeating 想改间隔必须先 CancelInvoke 再重新注册，很容易漏掉其中一步。'
    },

    'Barrel.cs': {
      24: '只认 Ground 层。木桶一路会撞到梯子、撞到玩家、甚至撞到别的木桶，但这些都不该给它加速 —— 用 layer 把「能踩的地面」筛出来，就不需要维护一长串 if 判断。这是碰撞层最典型的用法：物理引擎照常把所有碰撞都报给你，脚本自己挑「我关心的那一种」。好处是改动极其廉价 —— 想让木桶在梯子上也弹一下，只改这一行的判断，其它代码一行不动。',
      25: '整节课最巧的一行，也是「用物理表达规则」的范本。它没有写「木桶向左滚 / 向右滚」，而是取被撞平台自身的 right 向量（collision.transform.right）—— 平台是斜的，right 就沿着斜面指向下坡那一端。于是同一行代码在每一层钢架上都能让木桶自动朝正确方向滚：顶层向右、下一层向左，zigzag 全部成立，斜面越陡滚得越快（重力沿斜面的切向分量本来更大），全程不需要手写路径、也不需要记录「我现在在第几层」。ForceMode2D.Impulse 是瞬时冲量，只在 OnCollisionEnter2D 这一次接触时施加一次（落地那一下「推一把」），之后持续滚动靠重力维持。复制一层钢架、把它旋转 180°，木桶立刻朝反方向滚 —— 这就是把规则编码进世界，而不是写进脚本。'
    },

    'GameManager.cs': {
      13: '把 GameManager 的 Awake 排到所有普通脚本之前执行。因为 Player（第 142 / 147 行）随时可能访问 GameManager.Instance，如果单例还没建立就会拿到 null，报出那种「明明 Inspector 里拖了却说没引用」的诡异错误。同样的效果也可以在 Edit → Project Settings → Script Execution Order 里全局配置，但写在脚本上更直观，而且跟着预制体一起走、不会丢。注意它只保证 Awake / OnEnable 的顺序，不保证 Start 的顺序。',
      75: '延迟 1 秒再真正切场景。配合上面 67~73 行把 camera.cullingMask 设为 0（一个物体都不渲染），就白捡了一个黑屏过场：玩家看到画面先黑掉，1 秒后新关卡出现。这是「没有动画系统也能做过场」的经典取巧 —— 用渲染开关 + 计时器代替淡入淡出，零额外资源。另外注意 LoadScene 的方法体是用字符串插值拼出 $"Level{level}"（第 80 行）的，所以场景必须严格命名为 Level1 / Level2，且都加进 Build Settings，命名或顺序对不上就会加载失败 —— 这是纯字符串引用绕不过去的代价。',
      89: '失败流程：先扣一条命，再判断是「重载本关」还是「整局重来」。注意它和 LevelComplete（第 83 行）的对称性 —— 一个加 1000 分进下一关，一个扣一条命重载本关，两者最后都落到 LoadLevel。更值得学的是封装：所有状态变化都收在这两个 public 方法里，而 lives / score / level 的 set 访问器全是 private（第 21~23 行），外部只能读不能改。于是「生命数」永远不可能在两个地方被同时修改，调试时只要盯这一个文件就够了。'
    }
  },

  /* ---------------- 开发思维与步骤 ---------------- */

  think: {
    core: [
      '大金刚是这一批游戏里第一个「关卡制」的作品：世界不再是一屏打完，而是由 钢架 + 梯子 + 障碍 + 终点 拼出来的立体空间。核心思维是「几何即关卡」—— 钢架的位置和倾斜方向同时决定了两件事：玩家能走哪条路，以及木桶会滚向哪里。同一份坐标数据承担了两种职责，所以调关卡就是调几何，不用改一行逻辑代码。',
      '第二条思维是「用物理表达规则，而不是用代码描述动画」。Barrel.cs 全文 29 行，真正的行为只有一句 AddForce(collision.transform.right * speed)。它没有记录「木桶现在在第几层、该往哪走」，而是把方向这件事交给被撞平台自己的朝向。这类写法的威力在于：复制一层钢架、把它旋转 180°，木桶立刻朝反方向滚 —— 规则被编码进了世界，而不是写死在脚本里。',
      '第三条是「分层、分责」：Layer 给物理引擎用（Ground 决定谁能被踩），Tag 给游戏逻辑用（Objective / Obstacle 决定胜负）；Spawner 只管「生」，Barrel 只管「滚」，GameManager 只管「记」，Player 只管「动」并「上报」。没有任何一个脚本需要知道另一个脚本的内部实现。再加上 Unity 的「只广播不决策」（Player 撞到终点不自己切场景，只喊一声 LevelComplete），这一套解耦骨架后面 12 个游戏会反复复用。'
    ],

    steps: [
      { t: '① 定规则：一句话说清游戏',
        d: '从底部出发，沿钢架与梯子爬到顶层碰到公主 = 过关（+1000 分，进下一关）；被木桶碰到 = 掉一条命（重载本关）；3 条命用完 = 整局重来。写不出这句话就说明设计没想清楚，别急着写代码。' },
      { t: '② 搭世界：先摆几何，再谈代码',
        d: '5 层钢架 zigzag 排列，顶层大金刚所在那层向右下倾斜，下一层向左下倾斜，如此交替 —— 木桶因此自动走 Z 字滚到底层。地面那层刻意把两端反过来定义（从右指向左），于是 transform.right 朝左，木桶落地后会朝玩家滚过来。钢架之间用 4 架梯子连接，梯子端点严格落在上下两层钢架的表面上，这样「爬到顶 = 正好站在上一层」。' },
      { t: '③ 造角色：移动、爬梯、跳跃三选一',
        d: 'Player.SetDirection 用一条 if / else if / else 链把三种竖直状态互斥开：在梯子上 → 竖直方向交给 ↑ ↓；踩着地且按跳 → direction = up * jumpStrength；否则 → 累加重力。水平方向永远独立计算（第 98 行），所以你能在梯子上左右挪动、也能走着走着掉下去。' },
      { t: '④ 加敌人：生成器而不是硬编码',
        d: 'Spawner 挂在「大金刚手上」的空物体上，OnEnable 用 Invoke 排第一个桶，每次生成完再 Invoke 一个随机区间预约下一个（第 29 行）。minTime / maxTime 做成 public，难度旋钮就交给了关卡。木桶本身不带路径，落地时由 Barrel 沿平台 right 方向施加一次冲量，之后靠重力沿斜面自然加速。' },
      { t: '⑤ 定交互：用碰撞层与标签分流',
        d: '物理引擎会把所有碰撞都报给你，脚本得自己挑「我关心的那一种」：Ground 层 = 可以站、木桶会获得冲量（Player.cs 73 / Barrel.cs 24）；Ladder 层 = 进入攀爬状态（Player.cs 81）；Objective 标签 = 过关（139 行）；Obstacle 标签 = 失败（144 行）。四种判定四个入口，一一对应，非常好读。' },
      { t: '⑥ 调手感：单向平台与重力钳制',
        d: 'Physics2D.IgnoreCollision(platform, collider, !grounded)（79 行）让钢架变成单向的 —— 可以从下面跳穿上去，站上去后又变回实体。再配合 102 行 Mathf.Max(direction.y, -1f)：站在地上时把下坠速度钳住，防止重力一帧帧累积成巨大速度导致穿模。这两行都不改游戏规则，只决定「玩起来对不对」。' },
      { t: '⑦ 做流程：生命、关卡、场景切换',
        d: 'Player 撞到东西后先 enabled = false 冻住自己，再通知 GameManager。GameManager 收口所有状态：LevelComplete 加分进下一关，LevelFailed 扣命重载，命归零就 NewGame。切场景前把 camera.cullingMask 设为 0 黑屏，1 秒后 Invoke 真正 LoadScene —— 用渲染开关 + 计时器白捡一个过场。' }
    ],

    transfer: [
      '「自递归的随机定时器」（Spawner）→ 太空侵略者的编队生成、炸弹人的敌人波次、打砖块的多球生成，都是把 InvokeRepeating 换成随机间隔的同一招。',
      '「用被撞物体的朝向决定行为」（Barrel 的 transform.right）→ 蜈蚣沿网格转向、小行星的反弹、弹球沿法线反射，本质都是「把方向信息存在世界对象上，而不是写在脚本里」。',
      '「只广播不决策 + 状态集中管理」（Player → GameManager）→ 扫雷的胜负判定、2048 的结束检测、炸弹人的连锁爆炸，都是让触发者只喊一声、由唯一的管理者决定后果。'
    ]
  },

  /* =========================================================================
   * create(api) —— 可玩的浏览器复刻版
   *
   * 刻意与 Unity 版保持结构一致：
   *   Update（CheckCollision + SetDirection）→ FixedUpdate（MovePosition）
   *   → 碰撞判定 → draw 渲染
   * 变量名也尽量对应，方便对照源码阅读。
   * ======================================================================= */

  create: function (api) {

    /* ---------- 世界尺寸（逻辑坐标，与显示分辨率无关） ---------- */
    var W = 480, H = 400;

    /* ---------- 物理常量：与 Unity 版一一对应，只是放大到像素单位 ---------- */
    var GRAV = 900;               // Physics2D.gravity
    var MOVE_SPEED = 108;         // Player.moveSpeed = 3f
    var CLIMB_SPEED = 82;         // 爬梯速度
    var JUMP = 268;               // Player.jumpStrength = 4f
    var MAX_FALL_GROUNDED = 60;   // Mathf.Max(direction.y, -1f) 的像素版
    var FIXED = 1 / 120;          // Time.fixedDeltaTime
    var PW = 15, PH = 20;         // CapsuleCollider2D 的近似包围盒（宽 / 高）
    var BR = 8;                   // 木桶半径
    var BARREL_IMPULSE = 70;      // Barrel.speed = 1f 的落地冲量
    var ROLL_DRAG = 0.35;         // 滚动阻力（对应 Rigidbody2D 的 Linear Drag），防止越滚越快
    var LAND_KEEP = 0.25;         // 落地时保留的水平速度比例（撞击损耗）
    var SPAWN_MIN = 2, SPAWN_MAX = 4;   // Spawner.minTime / maxTime
    var NUM_LEVELS = 2;           // GameManager.NUM_LEVELS（打完回到第 1 关）
    var LADDER_HW = 11;           // 梯子的横向吸附半宽

    /* =====================================================================
     * 钢架（Girder）：等价于场景里挂在 "Ground" 层、带碰撞体的平台
     * rx / ry 就是平台自身的 right 向量 —— Barrel.cs 第 25 行取的就是它
     * =================================================================== */
    function Girder(x1, y1, x2, y2) {
      this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2;
      var dx = x2 - x1, dy = y2 - y1;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      this.rx = dx / len; this.ry = dy / len;      // 平台 right 向量（单位）
      this.lo = Math.min(x1, x2); this.hi = Math.max(x1, x2);
    }
    Girder.prototype.yAt = function (x) {
      if (x < this.lo) x = this.lo;
      if (x > this.hi) x = this.hi;
      var t = (x - this.x1) / (this.x2 - this.x1);
      return this.y1 + (this.y2 - this.y1) * t;
    };

    /* 从下往上编号。注意每一层都刻意把 x1 → x2 定义成「沿下坡方向」，
       也就是 rx / ry 始终指向低处 —— 这正是 Barrel.cs 第 25 行敢直接用
       transform.right 的前提：平台的 right 指向哪，木桶就往哪滚。
       倾斜方向逐层交替，木桶于是自动走 Z 字滚到底层；
       地面那层指向左，木桶落地后就朝玩家滚过来。 */
    var girders = [
      new Girder(480, 374, 0, 380),      // 0 地面（下坡朝左）
      new Girder(455, 282, 250, 300),    // 1 下坡朝左
      new Girder(0, 246, 380, 266),      // 2 下坡朝右
      new Girder(430, 172, 70, 192),     // 3 下坡朝左
      new Girder(70, 112, 340, 132)      // 4 下坡朝右（大金刚所在层）
    ];

    /* 梯子：端点严格落在上下两层钢架的表面上 */
    function Ladder(x, top, bot) { this.x = x; this.top = top; this.bot = bot; }
    var ladders = [
      new Ladder(370, girders[1].yAt(370), girders[0].yAt(370)),  // 地面 → 1 层
      new Ladder(270, girders[2].yAt(270), girders[1].yAt(270)),  // 1 → 2
      new Ladder(340, girders[3].yAt(340), girders[2].yAt(340)),  // 2 → 3
      new Ladder(150, girders[4].yAt(150), girders[3].yAt(150))   // 3 → 4
    ];

    /* 终点（Objective）与出生点：都直接由钢架几何算出来，改几何不用改这里 */
    var GOAL_X = 320;
    var GOAL_Y = girders[4].yAt(GOAL_X);          // 终点底部 = 顶层钢架表面
    var START_X = 84;

    /* 大金刚的位置（纯装饰，只用来画和当抛桶点） */
    var DK_X = 42, DK_Y = 92;

    /* ---------- 运行时状态 ---------- */
    var px, py, dirX, dirY, face;        // 玩家（px / py 是脚底中心）
    var grounded, climbing, walkPhase;
    var jumpReq, jumpBuf;
    var barrels, spawnT, barrelSeq, throwT;
    var level, lives, score, loopCount;
    var state, stateT, fadeMsg, pending;  // 'play' | 'fade'（对应过场黑屏）
    var acc, varT;
    var touchL = false, touchR = false, touchU = false, touchD = false;

    /* ---------- 难度：关卡越靠后、周目越多，抛桶越密、滚得越快 ---------- */
    function diff() { return (level - 1) + loopCount; }
    function spawnDelay() {
      var k = Math.pow(0.82, diff());
      return (SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN)) * k;
    }
    function impulse() { return BARREL_IMPULSE * (1 + diff() * 0.12); }

    /* ---------- 复位：对应 GameManager.NewGame / LoadLevel ---------- */
    function resetAll() {
      level = 1; lives = 3; score = 0; loopCount = 0;
      loadLevel(1);
    }

    function loadLevel(n) {
      level = n;
      px = START_X; py = girders[0].yAt(START_X);
      dirX = 0; dirY = 0; face = 1;
      grounded = true; climbing = false; walkPhase = 0;
      jumpReq = false; jumpBuf = 0;
      barrels = []; barrelSeq = 0; throwT = 0;
      spawnT = SPAWN_MIN * Math.pow(0.82, diff());  // 对应 Invoke(nameof(Spawn), minTime)
      acc = 0; varT = 0;
      state = 'play'; stateT = 0; fadeMsg = ''; pending = null;
    }

    /* ---------- 过场：对应 camera.cullingMask = 0 + Invoke(LoadScene, 1f) ---------- */
    function enterFade(msg, fn, dur) {
      state = 'fade';
      stateT = (dur === undefined) ? 1.0 : dur;
      fadeMsg = msg;
      pending = fn;
    }

    /* ---------- 抛桶：对应 Spawner.Spawn ---------- */
    function spawnBarrel() {
      barrelSeq++;
      barrels.push({
        x: DK_X + 44, y: DK_Y + 4,          // 生成在「大金刚手上」
        vx: 45, vy: 0,                       // 轻轻往右一抛，之后全靠物理
        landed: false, g: -1, last: -1,      // g = 当前所踩钢架；last = 刚离开的那层
        s: 0, spin: 0, hits: 0
      });
      throwT = 0.35;                         // 播放一下抛桶动作
      spawnT = spawnDelay();                 // 递归预约下一次（Spawner.cs 第 29 行）
      api.hit('Spawner.cs', 28);
      api.log('大金刚抛出第 ' + barrelSeq + ' 号木桶，下次抛桶 ' +
              spawnT.toFixed(2) + 's 后', 'info');
    }

    /* ---------- 过关：对应 Player 撞到 Objective → GameManager.LevelComplete ---------- */
    function onGoal() {
      score += 1000;
      api.hit('Player.cs', 139);
      api.log('撞到 Objective → 到达终点！+1000 分', 'ok');
      enterFade('过关！ +1000 分', function () {
        api.hit('GameManager.cs', 75);
        if (level + 1 > NUM_LEVELS) {
          loopCount++;
          api.log('已通关全部 ' + NUM_LEVELS + ' 关 → 回到第 1 关（第 ' +
                  (loopCount + 1) + ' 周目，木桶更密）', 'warn');
          loadLevel(1);
        } else {
          loadLevel(level + 1);
        }
        api.log('进入第 ' + level + ' 关 —— 生命 ' + lives + '，分数 ' + score, 'sys');
      });
    }

    /* ---------- 失败：对应 Player 撞到 Obstacle → GameManager.LevelFailed ---------- */
    function onHit() {
      api.hit('Player.cs', 144);
      api.log('撞到 Obstacle（木桶）→ LevelFailed，生命 -1', 'err');
      enterFade('被木桶撞到了！', function () {
        api.hit('GameManager.cs', 89);
        lives--;
        if (lives <= 0) {
          api.log('生命耗尽 → NewGame()：生命 3，分数 0，回到第 1 关', 'err');
          enterFade('游戏结束', function () {
            level = 1; lives = 3; score = 0; loopCount = 0;
            loadLevel(1);
          }, 1.4);
        } else {
          api.log('剩余生命 ' + lives + ' → 重新载入第 ' + level + ' 关', 'warn');
          loadLevel(level);
        }
      });
    }

    /* =====================================================================
     * 玩家：CheckCollision（检测 grounded / climbing）+ SetDirection（算方向）
     * =================================================================== */

    /* 找脚下的梯子：等价于 OverlapBox 命中 Ladder 层 */
    function findLadder() {
      for (var i = 0; i < ladders.length; i++) {
        var l = ladders[i];
        if (Math.abs(px - l.x) > LADDER_HW) continue;
        if (py > l.top + 2 && py - PH < l.bot - 2) return l;
      }
      return null;
    }

    /* 单向平台：只在下落时才吸附，上升时可以穿过去（Player.cs 第 79 行） */
    function findGround(prevY, vy) {
      if (vy < 0) return -1;
      var best = -1, bestY = 1e9;
      for (var i = 0; i < girders.length; i++) {
        var g = girders[i];
        if (px < g.lo || px > g.hi) continue;
        var sy = g.yAt(px);
        if (prevY <= sy + 1.5 && py >= sy && sy < bestY) { best = i; bestY = sy; }
      }
      return best;
    }

    /* 木桶是否碰到玩家（圆 vs AABB 的最近点判定） */
    function barrelHitsPlayer(b) {
      var nx = b.x < px - PW / 2 ? px - PW / 2 : (b.x > px + PW / 2 ? px + PW / 2 : b.x);
      var ny = b.y < py - PH ? py - PH : (b.y > py ? py : b.y);
      var dx = b.x - nx, dy = b.y - ny;
      return dx * dx + dy * dy <= BR * BR;
    }

    /* 是否碰到终点 */
    function reachGoal() {
      var gx0 = GOAL_X - 11, gx1 = GOAL_X + 11;
      var gy0 = GOAL_Y - 26, gy1 = GOAL_Y;
      return px + PW / 2 > gx0 && px - PW / 2 < gx1 && py > gy0 && py - PH < gy1;
    }

    /* =====================================================================
     * fixedStep：对应 FixedUpdate —— 唯一发生位移的地方
     * =================================================================== */
    function fixedStep(dt, inp) {

      /* --- ① CheckCollision：每帧重算 grounded / climbing --- */
      var lad = findLadder();
      climbing = !!lad;

      /* --- ② SetDirection --- */
      var horiz = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
      var vert = (inp.down ? 1 : 0) - (inp.up ? 1 : 0);

      if (climbing) {
        dirY = vert * CLIMB_SPEED;                 // 梯子上：竖直方向交给 ↑ ↓，不受重力
      } else if (grounded && jumpReq) {
        dirY = -JUMP;                              // 必须踩着地才能跳（Player.cs 第 92 行）
        jumpReq = false;
        api.log('起跳（jumpStrength = ' + JUMP + '）', 'info');
      } else {
        dirY += GRAV * dt;                         // 自由落体
      }

      dirX = horiz * MOVE_SPEED;

      // 站在地上时钳住下坠速度：防止重力无限累积导致下一帧穿模（Player.cs 第 102 行）
      if (grounded && !climbing) {
        if (dirY > MAX_FALL_GROUNDED) dirY = MAX_FALL_GROUNDED;
      }

      /* --- ③ FixedUpdate：MovePosition --- */
      px += dirX * dt;
      if (px < 10) px = 10;
      if (px > W - 10) px = W - 10;

      var prevY = py;
      py += dirY * dt;

      if (climbing) {
        // 夹在梯子两端之间：上端正好是上一层钢架表面
        if (py < lad.top) py = lad.top;
        if (py > lad.bot) py = lad.bot;
        grounded = false;
      } else {
        var gi = findGround(prevY, dirY);
        if (gi >= 0) {
          py = girders[gi].yAt(px);
          dirY = 0;
          grounded = true;
        } else {
          grounded = false;
        }
      }

      if (horiz !== 0) face = horiz;                 // 对应 eulerAngles 翻转朝向
      if (grounded && horiz !== 0) walkPhase += Math.abs(dirX) * dt / 22;

      /* --- ④ 终点判定 --- */
      if (reachGoal()) { onGoal(); return; }

      /* --- ⑤ Spawner：定时抛桶 --- */
      spawnT -= dt;
      if (spawnT <= 0) spawnBarrel();

      /* --- ⑥ 木桶物理 --- */
      for (var i = barrels.length - 1; i >= 0; i--) {
        var b = barrels[i];

        if (b.landed) {
          /* 沿斜面滚动：切向加速度 = GRAV * ry，再减去滚动阻力。
             这就是「靠物理自然滚」的全部秘密 —— 没有任何一行描述路径 */
          var g = girders[b.g];
          b.s += (GRAV * g.ry - b.s * ROLL_DRAG) * dt;
          b.x += g.rx * b.s * dt;
          b.y = g.yAt(b.x) - BR;
          b.spin += b.s * dt * 0.09;

          // 滚出端点 → 掉向下一层
          if (b.x < g.lo || b.x > g.hi) {
            b.landed = false;
            b.vx = g.rx * b.s;
            b.vy = Math.abs(g.ry * b.s) + 12;
            b.last = b.g;
          }
        } else {
          var y0 = b.y;
          b.vy += GRAV * dt;
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.spin += b.vx * dt * 0.09;

          /* 落地：只在下落时检测，跳过刚离开的那一层 */
          if (b.vy > 0) {
            var hit = -1, hitY = 1e9;
            for (var j = 0; j < girders.length; j++) {
              if (j === b.last) continue;
              var gg = girders[j];
              if (b.x < gg.lo || b.x > gg.hi) continue;
              var sy = gg.yAt(b.x) - BR;
              if (y0 <= sy && b.y >= sy && sy < hitY) { hit = j; hitY = sy; }
            }
            if (hit >= 0) {
              var gh = girders[hit];
              b.y = hitY;
              b.landed = true;
              b.g = hit;
              b.last = -1;
              // AddForce(collision.transform.right * speed, Impulse)
              // 撞击的垂直分量被平台法线吸收掉（完全非弹性），
              // 水平分量只保留一小部分（撞击损耗），再加上沿平台朝向的冲量
              b.s = b.vx * gh.rx * LAND_KEEP + impulse();
              b.rollDir = gh.rx > 0 ? '右' : '左';
              if (b.hits === 0) {
                api.hit('Barrel.cs', 25);
                api.log('第 ' + barrelSeq + ' 号木桶落到第 ' + hit +
                        ' 层钢架 → 沿平台 right 施加冲量，开始向' + b.rollDir + '滚', 'info');
              }
              b.hits++;
            }
          }
        }

        /* 撞到玩家 / 出界 */
        if (b.y > H + 40 || b.x < -30 || b.x > W + 30) {
          barrels.splice(i, 1);
        } else if (barrelHitsPlayer(b)) {
          barrels.splice(i, 1);
          onHit();
          return;
        }
      }
    }

    /* ---------- 每帧更新：驱动固定步长 ---------- */
    function update(dt, keys, api) {

      /* 过场黑屏：暂停一切物理（对应 Player 里的 enabled = false） */
      if (state === 'fade') {
        stateT -= dt;
        if (throwT > 0) throwT -= dt;
        if (stateT <= 0) {
          var f = pending;
          pending = null; state = 'play'; stateT = 0; fadeMsg = '';
          if (f) f();
        }
        publish(dt);
        return;
      }

      if (throwT > 0) throwT -= dt;

      /* 输入合并：键盘 + 触屏虚拟按键 */
      var inp = {
        left: !!(keys.left || touchL),
        right: !!(keys.right || touchR),
        up: !!(keys.up || touchU),
        down: !!(keys.down || touchD)
      };

      /* 跳跃缓冲：拿到「按下」这个边沿后留 0.12s，落地瞬间按下也算 */
      if (jumpBuf > 0) {
        jumpBuf -= dt;
        if (jumpBuf <= 0) jumpReq = false;
      }

      acc += dt;
      var guard = 0;
      while (acc >= FIXED && guard < 10) {
        acc -= FIXED;
        guard++;
        fixedStep(FIXED, inp);
        if (state !== 'play') break;      // 过关 / 失败后立刻停止推进
      }
      if (acc > 0.25) acc = 0.25;

      publish(dt);
    }

    /* ---------- 把关键状态推给底部面板（约 8Hz，别每帧刷 DOM） ---------- */
    function publish(dt) {
      varT += dt;
      if (varT < 0.125) return;
      varT = 0;
      api.vars({
        'level': level + ' / ' + NUM_LEVELS + (loopCount ? '（第 ' + (loopCount + 1) + ' 周目）' : ''),
        'lives': lives,
        'score': score,
        'player.grounded': grounded,
        'player.climbing': climbing,
        'player.dirY': dirY.toFixed(0),
        'barrels': barrels.length,
        'spawner.next': Math.max(0, spawnT).toFixed(2) + 's',
        'state': state === 'play' ? 'playing' : 'transition'
      });
    }

    /* =====================================================================
     * 渲染
     * =================================================================== */

    function drawGirder(ctx, g) {
      ctx.strokeStyle = '#e0455f';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(g.x1, g.y1);
      ctx.lineTo(g.x2, g.y2);
      ctx.stroke();
      // 铆钉
      ctx.fillStyle = 'rgba(255,255,255,.34)';
      var n = Math.max(3, Math.round(Math.abs(g.x2 - g.x1) / 24));
      for (var i = 0; i <= n; i++) {
        var t = i / n;
        var x = g.x1 + (g.x2 - g.x1) * t;
        var y = g.y1 + (g.y2 - g.y1) * t;
        ctx.beginPath();
        ctx.arc(x, y - 2, 1.4, 0, 6.2832);
        ctx.fill();
      }
    }

    function drawLadder(ctx, l) {
      ctx.strokeStyle = 'rgba(125,211,252,.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(l.x - 6, l.top); ctx.lineTo(l.x - 6, l.bot);
      ctx.moveTo(l.x + 6, l.top); ctx.lineTo(l.x + 6, l.bot);
      ctx.stroke();
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var y = l.top + 6; y < l.bot - 2; y += 11) {
        ctx.moveTo(l.x - 6, y); ctx.lineTo(l.x + 6, y);
      }
      ctx.stroke();
    }

    function drawBarrel(ctx, b) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.spin);
      ctx.fillStyle = '#c07a3a';
      ctx.beginPath(); ctx.arc(0, 0, BR, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = '#6b3f1a';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, BR - 1, 0, 6.2832); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-BR + 1, -3); ctx.lineTo(BR - 1, -3);
      ctx.moveTo(-BR + 1, 3); ctx.lineTo(BR - 1, 3);
      ctx.stroke();
      ctx.restore();
    }

    function drawDK(ctx) {
      var throwing = throwT > 0;
      ctx.save();
      ctx.translate(DK_X, DK_Y);
      // 身体
      ctx.fillStyle = '#6b4a2f';
      ctx.beginPath();
      ctx.ellipse(0, 4, 20, 22, 0, 0, 6.2832);
      ctx.fill();
      // 肚皮
      ctx.fillStyle = '#a8794d';
      ctx.beginPath();
      ctx.ellipse(0, 10, 11, 13, 0, 0, 6.2832);
      ctx.fill();
      // 头
      ctx.fillStyle = '#7a5535';
      ctx.beginPath();
      ctx.arc(0, -20, 13, 0, 6.2832);
      ctx.fill();
      // 脸
      ctx.fillStyle = '#d7a878';
      ctx.beginPath();
      ctx.ellipse(0, -17, 8, 6.5, 0, 0, 6.2832);
      ctx.fill();
      // 眼睛
      ctx.fillStyle = '#1b1b1b';
      ctx.beginPath(); ctx.arc(-3.5, -19, 1.7, 0, 6.2832); ctx.fill();
      ctx.beginPath(); ctx.arc(3.5, -19, 1.7, 0, 6.2832); ctx.fill();
      // 手臂：抛桶时抬起
      ctx.strokeStyle = '#6b4a2f';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-14, -4);
      ctx.lineTo(throwing ? -26 : -22, throwing ? -20 : -8);
      ctx.moveTo(14, -4);
      ctx.lineTo(throwing ? 26 : 22, throwing ? -22 : -8);
      ctx.stroke();
      ctx.restore();
    }

    function drawGoal(ctx) {
      var x = GOAL_X, y = GOAL_Y;
      // 公主
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.moveTo(x - 10, y);
      ctx.lineTo(x + 10, y);
      ctx.lineTo(x + 4, y - 18);
      ctx.lineTo(x - 4, y - 18);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fde3c4';
      ctx.beginPath(); ctx.arc(x, y - 22, 5, 0, 6.2832); ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(x - 6, y - 25); ctx.lineTo(x + 6, y - 25);
      ctx.lineTo(x, y - 31); ctx.closePath(); ctx.fill();
      // 提示文字
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.font = '10px -apple-system, "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('终点', x, y - 36);
    }

    function drawPlayer(ctx) {
      ctx.save();
      ctx.translate(px, py);
      if (face < 0) ctx.scale(-1, 1);
      var sw = (grounded && Math.abs(dirX) > 1) ? (Math.floor(walkPhase) % 2 ? 3 : -3) : 0;
      // 腿
      ctx.fillStyle = '#1e40af';
      ctx.fillRect(-5 + sw * 0.4, -5, 4, 5);
      ctx.fillRect(1 - sw * 0.4, -5, 4, 5);
      // 背带裤
      ctx.fillStyle = '#2f6fe0';
      ctx.fillRect(-6, -14, 12, 10);
      // 头
      ctx.fillStyle = '#f7c9a2';
      ctx.fillRect(-5, -20, 10, 7);
      // 帽子
      ctx.fillStyle = '#e03b3b';
      ctx.fillRect(-6, -22, 12, 4);
      ctx.fillRect(1, -20, 7, 2);
      ctx.restore();
    }

    function draw(ctx, api) {
      /* 背景 */
      ctx.fillStyle = '#0a0e1a';
      ctx.fillRect(0, 0, W, H);

      /* 背景网格，稍微有点空间感 */
      ctx.strokeStyle = 'rgba(255,255,255,.035)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var gx = 0; gx <= W; gx += 40) { ctx.moveTo(gx, 0); ctx.lineTo(gx, H); }
      for (var gy = 0; gy <= H; gy += 40) { ctx.moveTo(0, gy); ctx.lineTo(W, gy); }
      ctx.stroke();

      /* 大金刚脚下的装饰台 */
      ctx.fillStyle = '#1b2340';
      ctx.fillRect(10, 110, 66, 8);

      /* 梯子（画在钢架下面，视觉上是「穿过」钢架） */
      for (var i = 0; i < ladders.length; i++) drawLadder(ctx, ladders[i]);

      /* 钢架 */
      for (var k = 0; k < girders.length; k++) drawGirder(ctx, girders[k]);

      /* 终点 */
      drawGoal(ctx);

      /* 大金刚 */
      drawDK(ctx);

      /* 木桶 */
      for (var b = 0; b < barrels.length; b++) drawBarrel(ctx, barrels[b]);

      /* 玩家 */
      drawPlayer(ctx);

      /* ---------- HUD ---------- */
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fca5a5';
      ctx.font = '600 15px -apple-system, "PingFang SC", sans-serif';
      var hearts = '';
      for (var h = 0; h < Math.max(0, lives); h++) hearts += '♥ ';
      ctx.fillText(hearts || '—', 14, 22);

      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,.8)';
      ctx.fillText('LEVEL ' + level + (loopCount ? ' · 周目 ' + (loopCount + 1) : ''), W / 2, 22);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#fde68a';
      ctx.fillText('SCORE ' + score, W - 14, 22);

      /* ---------- 过场 / 结束覆盖层（对应 camera.cullingMask = 0 的黑屏） ---------- */
      if (state === 'fade') {
        ctx.fillStyle = 'rgba(6,9,18,.86)';
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#e2e8f5';
        ctx.font = '600 26px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText(fadeMsg, W / 2, H / 2 - 6);
        ctx.fillStyle = 'rgba(255,255,255,.5)';
        ctx.font = '13px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('载入中… ' + Math.max(0, stateT).toFixed(1) + 's', W / 2, H / 2 + 26);
      }
    }

    /* ---------- 初始化第一局（create 返回前必须把所有状态准备好） ---------- */
    resetAll();

    /* =====================================================================
     * 对外接口
     * =================================================================== */
    return {
      w: W, h: H,

      reset: function () {
        resetAll();
        api.log('已重置：生命 3，分数 0，回到第 1 关', 'sys');
      },

      update: update,
      draw: draw,

      /* 键盘：空格跳（边沿触发，对应 Input.GetButtonDown） */
      onKey: function (k, down, api) {
        if (k === 'fire' && down) { jumpReq = true; jumpBuf = 0.12; }
      },

      /* 触屏：上半屏 = 跳；底部条带 左 / 上 / 右 */
      onPointer: function (x, y, down, api) {
        if (!down) { touchL = touchR = touchU = touchD = false; return; }
        if (y < H - 76) { jumpReq = true; jumpBuf = 0.12; return; }
        touchL = touchR = touchU = touchD = false;
        if (x < W * 0.30) touchL = true;
        else if (x > W * 0.70) touchR = true;
        else touchU = true;
      },

      onPointerMove: function (x, y, api) {
        if (y < H - 76) return;
        touchL = touchR = touchU = touchD = false;
        if (x < W * 0.30) touchL = true;
        else if (x > W * 0.70) touchR = true;
        else touchU = true;
      },

      onPointerUp: function (api) {
        touchL = touchR = touchU = touchD = false;
      }
    };
  }
});
