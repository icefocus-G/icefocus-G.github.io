/* =============================================================================
 * Snake · 贪吃蛇
 * -----------------------------------------------------------------------------
 * 本文件三部分：
 *   1) create(api) —— 浏览器里可玩的 Canvas 复刻版（与 Unity 版逻辑一一对应）
 *   2) notes       —— 逐句讲解：「为什么这么写」
 *   3) think       —— 开发思维与步骤拆解
 *
 * 与 Unity 版的对应关系（照着源码读会很顺）：
 *   Snake.Update()        → onKey()/update() 里采集方向，只写缓冲不改朝向
 *   Snake.FixedUpdate()   → step()：一个节拍才执行一次「转向生效 + 身体跟随 + 头进一格」
 *   Snake.Grow()          → grow()
 *   Snake.ResetState()    → resetGame()
 *   Snake.Traverse()      → step() 里的穿墙分支
 *   Food.RandomizePosition() → randomizeFood()（含线性扫描兜底）
 *
 * 刻意保留的两处「浏览器版改良」，都在注释里标了原因：
 *   1) 输入缓冲用长度为 2 的队列，而源码只有一个 Vector2Int；
 *   2) 死亡后画面冻结并提示重开，而源码是立刻 ResetState()。
 * ========================================================================== */

UG_LESSON('snake', {

  /* ---------------- 元数据 ---------------- */

  name: '贪吃蛇 Snake',
  ico: '🐍',
  difficulty: 1,
  tags: ['网格移动', 'List 队列', '固定时间步', '输入缓冲'],
  controls: '↑ ↓ ← → 或 W A S D 转向（禁止 180° 直接掉头）。空格重开，R 重置。右上角两个按钮：切换「穿墙模式」与「移动速度」。鼠标 / 触屏可在画面里滑动转向。',
  oneLiner: '蛇头每拍只在整数网格上挪一格，身体是「蛇头过去几步留下的历史」。用一条 List、一个时间累加器和一个输入缓冲，把「网格移动 + 队列跟随 + 固定节拍」讲透。',

  /* ---------------- 逐句讲解：文件名 → 行号 → 讲解 ---------------- */

  notes: {

    'Snake.cs': {
      32: '方向用 Vector2Int 而不是 Vector2：网格坐标必须是整数。用浮点存方向，位置会被反复累加的小数误差污染，跑几十步后蛇就「半格」了，届时 RoundToInt 也救不回来（四舍五入可能突然跳一格）。顺便，默认值给 right 而不是 zero，省掉了「开局先判断有没有方向」的分支 —— 蛇一开始就在跑。',
      46: '输入缓冲字段：Update 只负责把玩家的意图写进来（input），真正生效在 FixedUpdate。为什么要多存一道？因为渲染帧（约 60Hz）比节拍（约 10Hz）快得多，直接在 Update 改 direction，一个节拍里可能被改好几次，最后一帧的值会覆盖前面所有按键；反过来在 FixedUpdate 里读 GetKeyDown 又会漏键（按键发生在两帧之间就丢了）。「高频采集、低频消费」是这类问题的通用解法。',
      63: '禁止 180° 掉头的防线放在这里 —— 判据是「当前沿 x 轴跑，就只接受 y 轴的输入」。注意是在读取输入的那一刻就挡掉，而不是等移动时再校验，越早拦掉越省心。不这么写的后果很直观：蛇头下一步就等于第二节的脖子，玩家一按反向立即自杀，而且越是在高速时越容易发生（一个渲染帧里按下反向正好被消费）。这条规则放在读输入的地方，而不是等到真正移动那一步再校验：前者从源头消灭了非法输入，后者要在移动逻辑里到处补判断。',
      90: '固定时间步的核心：到点才动，没到就整个返回。注意它用的不是「FixedUpdate 天然 50Hz」这个频率，而是拿 Time.time 跟自己算出来的 nextUpdate 比 —— 因为 Unity 的 FixedUpdate 间隔是全局常量（默认 0.02s），想做 20 格/秒这种自定义节拍只能自己计时。另外 Time.time 受 Time.timeScale 影响（默认值容易被忽略的好处：暂停时蛇自动停；坑：子弹时间里蛇也跟着变慢，想不受影响要改用 Time.unscaledTime）。',
      97: '为什么要判 input != zero 才赋值：零向量代表「本拍玩家没按键」，直接赋值会让 direction 变成 (0,0)，蛇当场停死。反过来看，input 被消费后并没有清零，所以同一个方向会在每个节拍重复生效 —— 这正是贪吃蛇要的行为（持续直行），所以作者不需要清零；如果你要做「松开按键就停」的移动（比如 Pac-Man），同样的写法就必须改成每拍清零。看清「为什么要清零 / 为什么不用清零」，比记住写法重要。',
      106: '整份源码最关键的一行。蛇身跟随必须倒序：每一节要去拿「前一节还没被更新过的旧位置」。正序遍历的话，等你处理第 i 节时，第 i-1 节已经被写成新位置了，于是整条蛇会在同一步里全部叠到蛇头原来的格子上，视觉上就是蛇突然缩成一个点。这不是小技巧，而是历史的搬运必须从最旧的一端开始的必然结果 —— 蜈蚣的体节、炸弹人的延迟爆炸、2048 的滑动位移，用的都是同一条倒序规则。配套的另一半在 Grow() 里：新实例化的一节必须先放在队尾那一节的位置，而不是原点 —— 否则它下一拍才被前一节拉过去，中间这一拍会孤零零地显示在 (0,0)。',
      114: '每走一步都先把当前位置 RoundToInt 再前进，而不是直接用 int 字段记录坐标。这是在选健壮性还是省内存：用 int 字段更省，但只要有任何一处代码（物理反弹、编辑器拖动、动画）碰了 transform.position，坐标就再也对不上了；这里是每拍自我纠偏，任何漂移都会在下一格被抹平。Unity 项目里这种「以 Transform 为唯一真相 + 每次使用前对齐」的写法很常见，代价只是两次取整运算。',
      121: '步长时间 = 1 / (speed × speedMultiplier)，单位换算要想清楚：speed 是「每秒多少格」，取倒数才是「每格多少秒」。把基础速度和倍率拆开，是为了让道具（加速 / 减速）只改倍率、结束后能干净地复原。还要留意两个坑：这里是「下一次 = now + 步长」，卡顿时丢掉的那点时间会被吞掉（蛇略慢于设定值，但绝不会一口气连补好几步把玩家送死）；如果 speed 被调成 0，这里会算出 Infinity，蛇将永远停在 Time.time < Infinity —— 公开 float 字段最好配 [Range(1, 60)] 兜底。',
      143: '循环从 i = 1 开始而不是 0 —— 索引 0 是蛇头，也就是挂脚本的这个 GameObject 自身。写成 i = 0 就会 Destroy(this.gameObject)，脚本连同宿主一起没了，整个游戏静默崩掉，而且 Unity 只会报一句「对象已被销毁」的运行时错误，很难定位。紧接着 Clear() 再 Add(transform) 而不是留着列表复用，是因为列表长度和场景里的物体数量必须同时被重建，半新半旧最容易出幽灵引用。另外 Destroy 是延迟到帧末真正执行的，所以紧跟着写的代码仍然能访问到那些已被「标记销毁」的物体。',
      161: '「某格是否被蛇占据」这个查询由 Snake 自己提供，而不是让 Food 去遍历别人的 transform —— 谁拥有数据，谁提供查询，Food 只管问。顺带一个值得你自己动手补的缺口：这份源码其实没有做「撞到自己」的判定，OnTriggerEnter2D 只认 Food / Obstacle / Wall 三个 Tag，所以早期版本的蛇是可以穿过自己身体的。有了 Occupies 这把刀，自撞判定只是「拿蛇头新坐标问一遍」而已 —— 浏览器版就补上了这段。',
      179: '碰撞分支用 CompareTag 而不是 GetComponent<Food>()：一是省一次组件查找与临时分配，二是「它是食物」只是个分类信息，你已经不需要它的数据了，没必要为此去拿组件。Tag 在 Unity 里承担的正是这种「给触发器分门别类」的角色，所以这里的 if/else if 链读起来就是一张规则表：食物 → 长身体，障碍 → 重开，墙 → 视开关而定。规则表和实现一一对应，改规则时不用动结构。还要留意：else 分支里的 ResetState() 意味着源码中「死亡」= 立刻重开一局，连 GameManager 都不需要 —— 代价是玩家来不及看清自己撞在哪，所以浏览器版改成了先冻结画面、打印原因、按空格再重开。两种取舍没有对错：一个是代码最少，一个是体验最好。',
      207: '穿墙那一行的负号是全场最「数学」的地方：-wall.position.x 直接把蛇头送到对面那一侧的对称位置（墙是成对摆放在 ±X 的），再 + direction.x 把它往里推一格，正好落在边界内侧第一列，而不是卡在墙里。注意 if / else if 只处理一个轴 —— 蛇永远只有一个轴在移动（direction 里必有一个分量为 0），同时翻两个轴就变成「传送到对角」，那就不是环绕了。',
    },

    'Food.cs': {
      41: 'FindObjectOfType 放在 Awake 而不是 Update：这个函数会遍历场景里所有对象，每帧调用等于给自己埋一个随场面复杂度线性增长的性能地雷；缓存成字段后，后续调用成本为零。放在 Awake 而不是 Start，是因为它只依赖「对象存在」，不依赖「别人的 Start 已经跑过」——Awake 全部早于所有 Start 执行，能把「依赖还没准备好」这类空引用挡在门外。它的坑也值得记住：只找得到已激活的对象，场景里存在多个 Snake 时拿到哪个是不确定的，正式项目里一般用单例或引用注入来替代。',
      68: '「随机到一个空格」最朴素的写法，但它藏着一个致命风险：如果蛇把整个网格占满了，这个 while 永远不会结束 —— Unity 主线程会直接卡死，连停止播放的按钮都点不动，只能强杀进程。凡是 while (重试) 的结构，都应该问一句「最坏情况下它会停下吗」。稳妥写法是限定重试次数，或者像下面那样退化成「遍历有限格子」的线性扫描（本课的浏览器版就是这么做的）。另一个隐含依赖：snake 必须已经 Awake 过，否则这里直接空引用。'
    }
  },

  /* ---------------- 开发思维与步骤 ---------------- */

  think: {
    core: [
      '第一条要建立的直觉是「离散世界，连续渲染」。贪吃蛇的世界是格子，时间是节拍：蛇的位置永远只能是整数格，决策永远只发生在节拍点上。画面上那些平滑的滑动只是插值出来的视觉效果，逻辑里从来没有「半个身子在两格之间」这种状态。接受了这个二分法，你会发现：所谓的转向延迟、穿墙、连锁跟随，全都不需要额外设计 —— 它们都是「每拍搬一格」的自然推论。以后遇到俄罗斯方块的落地、2048 的滑动、扫雷的连锁展开，先问一句「这个世界的最小单位是什么、决策发生在哪些时刻」，答案往往就出来了。',
      '第二条是「身体不是实体，是一条历史」。你脑子里那条蛇，其实只存在一个东西：蛇头当前的位置，外加一份长度为 N 的头的历史。身体第 i 节 = 蛇头 i 拍之前待过的地方。一旦这么看，倒序遍历就不是需要背诵的技巧，而是唯一的正确解 —— 你在搬运历史，必须从最旧的一端开始，否则新数据覆盖旧数据，历史就丢了。这个「历史队列」模型可以迁移到任何有拖尾、残影、回放需求的地方：赛车游戏的轨迹、炸弹人的连锁延迟、甚至是编辑器里的撤销栈。',
      '第三条是三个时钟的频率差：渲染帧（约 60Hz）、逻辑节拍（本作约 10Hz）、玩家按键（完全随机，还会连按）。所有 bug 都长在它们交汇的地方 —— 漏键、一个节拍里被转两次而绕出 180° 自杀、卡顿时一步跨两格。通用解法是「缓冲 + 单一消费点」：输入只往缓冲里写，节拍到来时在唯一一处统一消费，并在消费的同一时刻做合法性校验。把这三条时钟画在纸上标出频率，你就不会再写出「在 Update 里直接改状态」这种代码了。'
    ],

    steps: [
      { t: '① 定规则：一句话说清，外加唯一的硬约束',
        d: '蛇每拍前进一格，吃到食物 +1 分并长一节；撞墙、撞障碍、撞到自己就结束。规则之外还必须写死一条硬约束：不能 180° 掉头。因为这条约束不像其它规则那样「发生时才判断」，它必须在输入进入的那一刻就成立，所以要在设计阶段就标出来，不能等测试时发现会自杀再补。' },
      { t: '② 搭世界：先定格尺，再谈坐标',
        d: 'Unity 版一格 = 1 个世界单位，食物可生成范围由 gridArea 这个 Collider2D 的 bounds 直接给出 —— 用碰撞体当边界的好处是可以在 Scene 里拖着看，改尺寸即时生效。浏览器版把同样的格子映射成 COLS×ROWS 的整数索引再乘像素。重点不是用哪种，而是「坐标必须是整数」：所有位置都先 RoundToInt 再运算，半格坐标会让判定全部失灵。' },
      { t: '③ 造角色：蛇 = List<Transform>，食物 = 一个坐标',
        d: '蛇身用 List 而不是数组，因为它随时会变长（readonly 只锁引用不锁内容，这点要记住）。索引 0 是蛇头，其余是身体，每节身体身上甚至不需要挂脚本 —— 它们只是被本脚本管理的一个 Transform。食物更简单，全部状态就是一个 (x, y)。把角色的「状态」压到最薄，后面的复位就只是重建这两个东西。' },
      { t: '④ 建循环：Update 采集、FixedUpdate 执行',
        d: 'Update 只读键盘写进 input（不改 direction），FixedUpdate 先比对 nextUpdate 计时器，到点了才执行一次完整步进：应用缓冲方向 → 倒序搬运身体 → 蛇头按当前方向前进一格 → 重算 nextUpdate。这四步必须原子化地连在一起，中间不能被渲染打断，否则会出现身体摆好但头没动的中间帧。' },
      { t: '⑤ 定交互：碰撞按 Tag 分三类',
        d: '触发器回调里用 CompareTag 分成三支：Food → Grow() 增长，Obstacle → ResetState() 重开，Wall → 看 moveThroughWalls 走 Traverse 还是 ResetState()。同时还有一条反向调用：食物要刷在一个空格上，于是 Food 反过来问 Snake.Occupies(x, y)。注意查询能力放在数据拥有者身上，Food 不需要知道蛇有几节、怎么存。' },
      { t: '⑥ 调手感：把节拍做成可玩的参数',
        d: 'speed（每秒几格）与 speedMultiplier（道具倍率）拆开，前者是基调、后者是临时增益，结束就能干净复原。浏览器版右上角把它做成了可点的档位，建议你从 6 格/秒一路调到 24 格/秒 —— 慢速时你有时间规划路线，快速时靠的是预判，这是同一个规则下完全不同的两种游戏。另外别忘了两个边界：speed 被调成 0 时 nextUpdate 会算出 Infinity（蛇永久卡住），公开字段最好用 [Range] 限死下限；节拍计时器在卡顿时宁可丢掉积压时间，也不要一口气连补好几步把玩家送死。' },
      { t: '⑦ 做流程：复位、死亡与再来一局',
        d: 'ResetState 的顺序是：恢复朝向和位置 → 销毁除头以外的身体 → 清空列表并把蛇头加回去 → 按 initialSize 补齐。每一步都不能换序，尤其是「头必须留着」。死亡流程上源码选择了最省事的 ResetState()（直接重开），浏览器版改成冻结画面 + 打印原因 + 等玩家按空格，教学时能看清撞在哪 —— 你可以自己权衡哪个更好。' }
    ],

    transfer: [
      '「倒序搬运历史」的队列模型 → 蜈蚣的身体跟随、炸弹人的连锁爆炸延迟、2048 的一次滑动整体位移，本质都是同一句 for (i = n-1; i > 0; i--)。',
      '「Update 采集 / FixedUpdate 消费」的输入缓冲 → 任何有节拍感的游戏都适用：俄罗斯方块的旋转锁、Pac-Man 的转向预判、格斗游戏的输入缓冲区，写法几乎一模一样。',
      '「一格 = 一个整数单位、位置先对齐再运算」的网格思维 → 扫雷的格子状态、炸弹人的 Tilemap 坐标换算，以及任何需要在网格索引与屏幕像素之间来回换算的场景（背包格子、棋盘棋子、关卡编辑器）。'
    ]
  },

  /* =========================================================================
   * create(api) —— 可玩的浏览器复刻版
   *
   * 结构上刻意与 Unity 版一一对应：
   *   onKey/update 采集方向（Update） → step() 每拍执行一次（FixedUpdate）
   *   → 碰撞判定 → draw 渲染（含插值，逻辑仍是离散的）
   * 变量名也尽量对应，方便左右对照源码阅读。
   * ======================================================================= */

  create: function (api) {

    /* ---------- 世界：网格尺度（逻辑坐标，与显示分辨率无关） ---------- */
    var CELL = 24;                       // 一格边长（像素）
    var COLS = 25, ROWS = 19;            // 取奇数，才能以原点为中心左右对称
    var GRID_W = COLS * CELL;            // 600
    var GRID_H = ROWS * CELL;            // 456
    var HUD = 48;                        // 顶部信息条高度
    var W = GRID_W, H = HUD + GRID_H;    // 600 × 504

    /* 网格坐标沿用 Unity 习惯：右为 +x，上为 +y，原点在正中
       （渲染时才翻转 y，见 sy()） */
    var MIN_X = -12, MAX_X = 12;
    var MIN_Y = -9,  MAX_Y = 9;

    /* 网格 → 像素 */
    function sx(gx) { return (gx - MIN_X) * CELL; }
    function sy(gy) { return HUD + (MAX_Y - gy) * CELL; }

    /* ---------- 规则参数（对应 Snake.cs 的 public 字段） ---------- */
    var INITIAL_SIZE = 4;                // initialSize
    var SPEEDS = [6, 10, 16, 24];        // 可切换的 speed 档位（格/秒）
    var spIdx = 1;
    var speedMultiplier = 1;             // speedMultiplier
    var moveThroughWalls = false;        // moveThroughWalls
    var OBSTACLE_EVERY = 5;              // 每吃 5 个食物加一块障碍（对应 Obstacle 分支）
    var OBSTACLE_MAX = 8;

    /* ---------- 状态 ---------- */
    var segments = [];                   // 索引 0 = 蛇头；每节 {x, y, px, py}
    var dir = { x: 1, y: 0 };            // direction
    var buf = [];                        // 输入缓冲（源码是单个 input，这里扩成队列）
    var food = { x: 0, y: 0 };
    var obstacles = [];
    var score = 0, alive = true, deathWhy = '';
    var acc = 0;                         // 距下一个节拍点已累计的时间
    var alpha = 1;                       // 渲染插值系数：逻辑是离散的，画面是连续的
    var eaten = 0, turned = 0, stepped = 0, deaths = 0;
    var clock = 0, lastLogTip = -99, lastWrapTip = -99;

    /* ---------- 工具 ---------- */
    function stepDur() { return 1 / (SPEEDS[spIdx] * speedMultiplier); }

    function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

    /* api.hit 只在离散事件发生时调用，并且同一行的重复命中做冷却，
       避免玩家连按时代码区闪个不停 */
    var hitAt = {};
    function hitOnce(file, line, cd) {
      var k = file + '#' + line;
      if (hitAt[k] !== undefined && clock - hitAt[k] < (cd || 0.4)) return;
      hitAt[k] = clock;
      api.hit(file, line);
    }

    function randInt(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }

    function dirText(d) {
      if (d.x === 1) return 'right (1, 0)';
      if (d.x === -1) return 'left (-1, 0)';
      if (d.y === 1) return 'up (0, 1)';
      return 'down (0, -1)';
    }

    /* ---------- 格子是否可用：Occupies + 障碍 ---------- */
    function freeCell(gx, gy) {
      for (var i = 0; i < segments.length; i++) {
        if (segments[i].x === gx && segments[i].y === gy) return false;   // Occupies
      }
      for (var j = 0; j < obstacles.length; j++) {
        if (obstacles[j].x === gx && obstacles[j].y === gy) return false;
      }
      return true;
    }

    /* ---------- Food.RandomizePosition：随机 + 线性扫描兜底 ----------
       源码用的是「随机 → while 占用则 x++ 扫描」，最坏情况下蛇占满全图会死循环
       卡死主线程。这里改成：先随机试有限次，失败后退化为一次有界的线性扫描，
       最多遍历 COLS×ROWS 格，必定退出。 */
    function randomizeFood() {
      var tries = 0;
      do {
        food.x = randInt(MIN_X, MAX_X);
        food.y = randInt(MIN_Y, MAX_Y);
        tries++;
      } while (tries < 120 && !freeCell(food.x, food.y));

      if (!freeCell(food.x, food.y)) linearScanFood();   // 对应 Food.cs 第 68 行的扫描段
    }

    function linearScanFood() {
      var gx = food.x, gy = food.y;
      for (var n = 0; n < COLS * ROWS; n++) {
        if (freeCell(gx, gy)) {
          food.x = gx; food.y = gy;
          hitOnce('Food.cs', 68, 0.5);
          api.log('食物：随机多次未命中空格 → 改用线性扫描，落到 (' + gx + ', ' + gy + ')', 'warn');
          return;
        }
        gx++;                                  // Food.cs:70  x++
        if (gx > MAX_X) {                      // Food.cs:73  超出右边界
          gx = MIN_X; gy++;
          if (gy > MAX_Y) gy = MIN_Y;          // Food.cs:79  行也越界
        }
      }
    }

    /* ---------- Snake.Grow ---------- */
    function grow() {
      var tail = segments[segments.length - 1];
      // 新节必须生成在队尾的位置（源码第 130 行），否则它会先在别处露一帧
      segments.push({ x: tail.x, y: tail.y, px: tail.x, py: tail.y });
    }

    /* ---------- Snake.ResetState ---------- */
    function resetGame() {
      segments = [];
      // 索引 0 是蛇头（源码里就是脚本宿主自身），永远不能被销毁
      segments.push({ x: 0, y: 0, px: 0, py: 0 });
      for (var i = 0; i < INITIAL_SIZE - 1; i++) {
        grow();                                // 开局四节全部叠在原点，走几步自然拉开
      }
      dir = { x: 1, y: 0 };
      buf = [];
      obstacles = [];
      score = 0; eaten = 0; deaths = 0; stepped = 0; turned = 0;
      acc = 0; alpha = 1;
      alive = true; deathWhy = '';
      randomizeFood();
      hitOnce('Snake.cs', 135, 0.2);
      publish(true);
    }

    /* ---------- 输入：对应 Snake.Update ----------
       与源码一样，这里只往缓冲里写意图，绝不直接改 dir；
       并且在入口处就挡掉 180° 反向，避免快速连按造成「自己撞脖子」。 */
    function tryDir(nx, ny) {
      if (!alive) return;
      var cur = buf.length ? buf[buf.length - 1] : dir;
      if (nx === -cur.x && ny === -cur.y) {          // 反向：源码第 63 行的判据
        hitOnce('Snake.cs', 63, 0.6);
        if (clock - lastLogTip > 1.2) {
          lastLogTip = clock;
          api.log('已拦截 180° 掉头：当前 ' + dirText(cur) + '，不能立刻反向', 'warn');
        }
        return;
      }
      if (nx === cur.x && ny === cur.y) return;      // 同向，没必要进队
      if (buf.length >= 2) buf.shift();              // 缓冲最多留 2 个，防止囤积过期意图
      buf.push({ x: nx, y: ny });
    }

    /* ---------- 一个节拍：对应 Snake.FixedUpdate ---------- */
    function step() {

      /* ① 消费输入缓冲：一个节拍只吃一个方向（与源码 input 单值语义一致） */
      if (buf.length) {
        var d = buf.shift();
        if (d.x === -dir.x && d.y === -dir.y) {
          hitOnce('Snake.cs', 63, 0.6);             // 双保险，理论上入队时已被拦
        } else {
          dir = d;
          turned++;
          hitOnce('Snake.cs', 97, 0.5);            // direction = input;
        }
      }

      /* ② 蛇身跟随：从尾到头倒序搬运历史位置（源码第 106 行） */
      for (var i = segments.length - 1; i > 0; i--) {
        segments[i].px = segments[i].x;
        segments[i].py = segments[i].y;
        segments[i].x = segments[i - 1].x;
        segments[i].y = segments[i - 1].y;
      }

      /* ③ 蛇头前进一格：先对齐网格再运算（源码第 114 行） */
      var head = segments[0];
      head.px = head.x;
      head.py = head.y;
      var nx = Math.round(head.x) + dir.x;
      var ny = Math.round(head.y) + dir.y;

      /* ④ 墙：穿墙（Traverse）还是重开（ResetState） */
      if (nx > MAX_X || nx < MIN_X || ny > MAX_Y || ny < MIN_Y) {
        if (!moveThroughWalls) {
          die('撞墙', 'Snake.cs', 195);
          return;
        }
        // Traverse()：等价于 -wall.position.x + direction.x，落到对面内侧第一格
        if (nx > MAX_X) nx = MIN_X; else if (nx < MIN_X) nx = MAX_X;
        if (ny > MAX_Y) ny = MIN_Y; else if (ny < MIN_Y) ny = MAX_Y;
        hitOnce('Snake.cs', 207, 0.5);
        if (clock - lastWrapTip > 1.5) {          // 穿墙模式下绕圈会频繁触发，日志做个节流
          lastWrapTip = clock;
          api.log('穿墙：蛇头环绕到对面 ' + dirText(dir), 'info');
        }
      }

      head.x = nx;
      head.y = ny;
      stepped++;

      /* ⑤ 是否吃到（决定尾巴这一格会不会腾出来） */
      var ate = (nx === food.x && ny === food.y);

      /* ⑥ 障碍：Obstacle 分支 */
      for (var k = 0; k < obstacles.length; k++) {
        if (obstacles[k].x === nx && obstacles[k].y === ny) {
          die('撞到障碍', 'Snake.cs', 187);
          return;
        }
      }

      /* ⑦ 自撞：源码里没写这条判定，用 Occupies 的能力补上（源码第 161 行）
            从第 1 节开始比 —— 第 0 节就是蛇头本身，永远等于刚落地的位置。
            尾巴这一拍会挪走，所以吃到食物时不排除最后一节 */
      var limit = ate ? segments.length : segments.length - 1;
      for (var j = 1; j < limit; j++) {
        if (segments[j].x === nx && segments[j].y === ny) {
          die('咬到自己（第 ' + j + ' 节）', 'Snake.cs', 161);
          return;
        }
      }

      /* ⑧ 吃到食物：增长 + 加分 + 食物换位 */
      if (ate) {
        score++; eaten++;
        grow();                                    // Grow()
        hitOnce('Snake.cs', 179, 0.2);
        api.log('吃到食物 → Grow()：长度 ' + segments.length + '，得分 ' + score, 'ok');
        if (score % OBSTACLE_EVERY === 0 && obstacles.length < OBSTACLE_MAX) {
          if (spawnObstacle()) api.log('新障碍生成（第 ' + obstacles.length + ' 块）', 'warn');
        }
        randomizeFood();                           // Food.OnTriggerEnter2D → RandomizePosition
      }
    }

    function die(why, file, line) {
      alive = false;
      deathWhy = why;
      deaths++;
      alpha = 1;
      api.hit(file, line);
      api.log(why + ' —— 游戏结束。长度 ' + segments.length + '，得分 ' + score + '。按空格或 R 重开', 'err');
    }

    function spawnObstacle() {
      for (var t = 0; t < 60; t++) {
        var gx = randInt(MIN_X, MAX_X), gy = randInt(MIN_Y, MAX_Y);
        if (!freeCell(gx, gy)) continue;
        if (gx === food.x && gy === food.y) continue;
        // 别贴着蛇头正前方生成，否则玩家一步都反应不过来
        if (gx === segments[0].x + dir.x && gy === segments[0].y + dir.y) continue;
        obstacles.push({ x: gx, y: gy });
        return true;
      }
      return false;
    }

    /* ---------- 每帧更新（浏览器没有 Update / FixedUpdate 的区分，手动补上） ---------- */
    function update(dt, keys, a) {
      clock += dt;

      /* 按住不放也能持续转向：每帧尝试一次，tryDir 会过滤同向与反向 */
      if (alive) {
        if (keys.up)    tryDir(0, 1);
        else if (keys.down) tryDir(0, -1);
        else if (keys.left) tryDir(-1, 0);
        else if (keys.right) tryDir(1, 0);
      }

      if (alive) {
        acc += dt;
        var guard = 0;
        while (acc >= stepDur() && alive && guard < 4) {
          acc -= stepDur();
          guard++;
          step();
        }
        // 卡顿后积压的时间全部丢掉：宁可慢一拍，也不要一口气连补好几步把蛇送死
        if (acc > stepDur()) acc = 0;
        alpha = clamp(acc / stepDur(), 0, 1);
      } else {
        alpha = 1;
      }

      publish(false);
    }

    /* ---------- 关键状态：节流到约 7.5Hz，别每帧刷 DOM ---------- */
    var varN = 0;
    function publish(force) {
      varN++;
      if (!force && (varN % 8)) return;
      api.vars({
        'direction': dirText(dir),
        'segments.Count': segments.length,
        'score': score,
        'speed(格/秒)': SPEEDS[spIdx] * speedMultiplier,
        'stepDur(ms)': Math.round(stepDur() * 1000),
        'nextUpdate(ms)': Math.round((stepDur() - acc) * 1000),
        'input buffer': buf.length,
        'snake.head': '(' + segments[0].x + ', ' + segments[0].y + ')',
        'food': '(' + food.x + ', ' + food.y + ')',
        'obstacles': obstacles.length,
        'moveThroughWalls': moveThroughWalls ? 'true (穿墙)' : 'false (撞墙即死)',
        'steps / turns': stepped + ' / ' + turned
      });
    }

    /* ---------- 渲染 ---------- */
    function rrect(ctx, x, y, w, h, r) {
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    /* HUD 上的两个按钮（用鼠标点击切换规则参数） */
    var btnWall  = { x: W - 190, y: 10, w: 90, h: 28, label: 'wall' };
    var btnSpeed = { x: W - 92,  y: 10, w: 82, h: 28, label: 'spd' };
    function inBtn(b, x, y) {
      return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
    }

    function draw(ctx, a) {

      /* 背景 */
      ctx.fillStyle = '#070b14';
      ctx.fillRect(0, 0, W, H);

      /* 棋盘格 + 网格线：让「世界是离散的」这件事一眼可见 */
      for (var gy = MIN_Y; gy <= MAX_Y; gy++) {
        for (var gx = MIN_X; gx <= MAX_X; gx++) {
          if (((gx + gy) & 1) === 0) continue;
          ctx.fillStyle = 'rgba(255,255,255,.022)';
          ctx.fillRect(sx(gx), sy(gy), CELL, CELL);
        }
      }
      ctx.strokeStyle = 'rgba(255,255,255,.045)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var i = MIN_X; i <= MAX_X + 1; i++) {
        ctx.moveTo(sx(i), sy(MAX_Y)); ctx.lineTo(sx(i), sy(MIN_Y) + CELL);
      }
      for (var j = MIN_Y; j <= MAX_Y + 1; j++) {
        ctx.moveTo(sx(MIN_X), sy(j)); ctx.lineTo(sx(MAX_X) + CELL, sy(j));
      }
      ctx.stroke();

      /* 游戏区边框（就是那只 Wall） */
      ctx.strokeStyle = moveThroughWalls ? 'rgba(56,189,248,.55)' : 'rgba(248,113,113,.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx(MIN_X) - 1, sy(MAX_Y) - 1, GRID_W + 2, GRID_H + 2);

      /* 障碍：Obstacle */
      for (var k = 0; k < obstacles.length; k++) {
        var o = obstacles[k];
        ctx.fillStyle = '#475569';
        rrect(ctx, sx(o.x) + 2, sy(o.y) + 2, CELL - 4, CELL - 4, 5);
        ctx.fill();
        ctx.strokeStyle = 'rgba(148,163,184,.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      /* 食物：Food */
      var pulse = 0.82 + 0.18 * Math.sin(clock * 4);
      var fx = sx(food.x) + CELL / 2, fy = sy(food.y) + CELL / 2;
      ctx.fillStyle = 'rgba(251,191,36,.18)';
      ctx.beginPath(); ctx.arc(fx, fy, CELL * 0.5 * pulse + 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(fx, fy, CELL * 0.3 * pulse, 0, Math.PI * 2); ctx.fill();

      /* 蛇：segments —— 逻辑上是整数格，渲染时在上一步的老位置与本位置之间插值 */
      for (var s = segments.length - 1; s >= 0; s--) {
        var seg = segments[s];
        var dx = seg.x - seg.px, dy = seg.y - seg.py;
        // 穿墙那一帧位移会横跨整个地图，这种时候直接吸附，别让身体横穿屏幕
        var t = (Math.abs(dx) > 1 || Math.abs(dy) > 1) ? 1 : (alive ? alpha : 1);
        var ix = seg.px + dx * t, iy = seg.py + dy * t;
        var px = sx(ix), py = sy(iy);

        if (s === 0) {
          ctx.fillStyle = alive ? '#86efac' : '#fca5a5';
          rrect(ctx, px + 1, py + 1, CELL - 2, CELL - 2, 6);
          ctx.fill();
          /* 眼睛：顺着朝向画，一眼就能校验「蛇到底有没有真的转向」 */
          var cx = px + CELL / 2, cy = py + CELL / 2;
          var ox = dir.x * 4.5, oy = -dir.y * 4.5;
          var nx2 = -dir.y, ny2 = dir.x;                 // 垂直于朝向的偏移
          ctx.fillStyle = '#052e16';
          ctx.beginPath();
          ctx.arc(cx + ox + nx2 * 4, cy + oy + ny2 * 4, 2, 0, Math.PI * 2);
          ctx.arc(cx + ox - nx2 * 4, cy + oy - ny2 * 4, 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          var f = s / Math.max(1, segments.length - 1);
          ctx.fillStyle = 'rgb(' + Math.round(52 + 20 * (1 - f)) + ',' +
                                  Math.round(211 - 20 * (1 - f)) + ',' +
                                  Math.round(153 + 30 * (1 - f)) + ')';
          rrect(ctx, px + 2, py + 2, CELL - 4, CELL - 4, 5);
          ctx.fill();
        }
      }

      /* ---------- 顶部信息条 ---------- */
      ctx.fillStyle = '#0d1424';
      ctx.fillRect(0, 0, W, HUD);
      ctx.strokeStyle = 'rgba(255,255,255,.08)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, HUD); ctx.lineTo(W, HUD); ctx.stroke();

      ctx.textAlign = 'left';
      ctx.font = '600 15px -apple-system, "PingFang SC", sans-serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('🐍 得分 ' + score + '   长度 ' + segments.length +
                   '   ' + (SPEEDS[spIdx] * speedMultiplier) + ' 格/秒', 12, 30);

      /* 缓冲可视化：让玩家看见「高频采集、低频消费」 */
      ctx.font = '12px -apple-system, "PingFang SC", sans-serif';
      ctx.fillStyle = buf.length ? '#fbbf24' : 'rgba(226,232,240,.35)';
      ctx.fillText('input buffer ' + (buf.length ? '[↑' + buf.length + ' 待消费]' : '[空]') +
                   '   ' + dirText(dir), 250, 29);

      /* 按钮：穿墙 */
      ctx.fillStyle = moveThroughWalls ? 'rgba(56,189,248,.22)' : 'rgba(255,255,255,.06)';
      rrect(ctx, btnWall.x, btnWall.y, btnWall.w, btnWall.h, 8); ctx.fill();
      ctx.strokeStyle = moveThroughWalls ? '#38bdf8' : 'rgba(255,255,255,.16)';
      ctx.stroke();
      ctx.fillStyle = moveThroughWalls ? '#bae6fd' : '#94a3b8';
      ctx.font = '13px -apple-system, "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('穿墙 ' + (moveThroughWalls ? '开' : '关'),
                   btnWall.x + btnWall.w / 2, btnWall.y + 19);

      /* 按钮：速度 */
      ctx.fillStyle = 'rgba(255,255,255,.06)';
      rrect(ctx, btnSpeed.x, btnSpeed.y, btnSpeed.w, btnSpeed.h, 8); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.16)';
      ctx.stroke();
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('速度 ' + SPEEDS[spIdx], btnSpeed.x + btnSpeed.w / 2, btnSpeed.y + 19);

      /* ---------- 结束 / 提示浮层 ---------- */
      ctx.textAlign = 'center';
      if (!alive) {
        ctx.fillStyle = 'rgba(7,11,20,.72)';
        ctx.fillRect(sx(MIN_X), sy(MAX_Y), GRID_W, GRID_H);
        ctx.fillStyle = '#fca5a5';
        ctx.font = '600 26px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText(deathWhy, W / 2, H / 2 - 6);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '14px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('最终长度 ' + segments.length + ' · 得分 ' + score +
                     ' · 按空格或 R 重开', W / 2, H / 2 + 26);
      } else if (stepped === 0) {
        ctx.fillStyle = 'rgba(226,232,240,.55)';
        ctx.font = '14px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('↑↓←→ / WASD 转向 · 吃黄色食物长身体', W / 2, H / 2 + 60);
      }
    }

    /* ---------- 键盘 ---------- */
    function onKey(k, down, a) {
      if (!down) return;
      if (k === 'fire') {
        if (!alive) {
          api.log('重开一局 —— Snake.ResetState()', 'sys');
          resetGame();
        } else if (clock - lastLogTip > 4) {
          lastLogTip = clock;
          api.log('提示：空格用于重开；转向请用 ↑↓←→ / WASD（禁止 180° 直接掉头）', 'info');
        }
        return;
      }
      if (k === 'up')    tryDir(0, 1);
      if (k === 'down')  tryDir(0, -1);
      if (k === 'left')  tryDir(-1, 0);
      if (k === 'right') tryDir(1, 0);
    }

    /* ---------- 指针 / 触屏：滑动转向 + HUD 按钮 ---------- */
    var anchor = null;
    function onPointer(x, y, down, a) {
      if (y < HUD) {                                  // 点在信息条上：判定按钮
        if (inBtn(btnWall, x, y)) {
          moveThroughWalls = !moveThroughWalls;
          hitOnce('Snake.cs', 189, 0.2);
          api.log('moveThroughWalls = ' + moveThroughWalls +
                  '（' + (moveThroughWalls ? '穿墙环绕' : '撞墙即死') + '）', 'sys');
        } else if (inBtn(btnSpeed, x, y)) {
          spIdx = (spIdx + 1) % SPEEDS.length;
          hitOnce('Snake.cs', 121, 0.2);
          api.log('speed → ' + SPEEDS[spIdx] + ' 格/秒，步长时间 ' +
                  Math.round(stepDur() * 1000) + 'ms', 'sys');
        }
        anchor = null;
        return;
      }
      if (!alive) { api.log('重开一局 —— Snake.ResetState()', 'sys'); resetGame(); return; }
      anchor = { x: x, y: y };
    }

    function onPointerMove(x, y, a) {
      if (!anchor) return;
      var dx = x - anchor.x, dy = y - anchor.y;
      if (Math.abs(dx) < 14 && Math.abs(dy) < 14) return;
      if (Math.abs(dx) > Math.abs(dy)) tryDir(dx > 0 ? 1 : -1, 0);
      else                            tryDir(0, dy > 0 ? -1 : 1);   // 屏幕 y 向下
      anchor = { x: x, y: y };
    }

    /* ---------- 对外接口 ---------- */
    resetGame();

    return {
      w: W, h: H,
      reset: function () { resetGame(); },
      update: update,
      draw: draw,
      onKey: onKey,
      onPointer: onPointer,
      onPointerMove: onPointerMove
    };
  }
});
