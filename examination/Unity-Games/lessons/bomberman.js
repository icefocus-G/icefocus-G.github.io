/* =============================================================================
 * Bomberman · 炸弹人
 * -----------------------------------------------------------------------------
 * 本文件三部分：
 *   1) create(api) —— 浏览器里可玩的 Canvas 复刻版（与 Unity 版逻辑一一对应）
 *   2) notes       —— 逐句讲解：「为什么这么写」
 *   3) think       —— 开发思维与步骤拆解
 * ========================================================================== */

UG_LESSON('bomberman', {

  /* ---------------- 元数据 ---------------- */

  name: '炸弹人 Bomberman',
  ico: '💣',
  difficulty: 3,
  tags: ['Tilemap', '协程延时', '递归爆炸', '帧动画'],
  controls: '↑↓←→ / WASD 网格移动，空格放炸弹；也可以点（或拖）地图上的任意格子，角色会自己寻路走过去。P 暂停，R 重开。',
  oneLiner: '在一张 Tilemap 网格里放炸弹：引线烧完，火焰沿四个方向逐格递归蔓延，能连锁引爆、炸开砖块、烧掉敌人。用「协程延时 + 递归蔓延 + 格子世界」三件事讲透。',

  /* ---------------- 逐句讲解：文件名 → 行号 → 讲解 ---------------- */

  notes: {

    'BombController.cs': {
      56: '为什么放炸弹要用协程？因为 PlaceBomb 是一条会「中途暂停」的流程：放下炸弹 → 等 3 秒 → 引爆 → 返还额度。用 StartCoroutine 把它写成一段顺序代码，yield 处挂起后控制权交还 Unity，游戏照常跑，玩家还能接着放第二颗。反面做法是在 Update 里给每颗炸弹挂一个 timer 字段再遍历递减——那样「一颗炸弹的生命周期」就被拆散成「对象上的数据」+「帧循环里的逻辑」两半，等你要加链式引爆时，得同时改计时器、改状态、改删除时机，很快就失控。另外注意一个 Unity 的坑：enabled = false 只关掉 Update（也就是关掉再放炸弹的入口），已经跑起来的协程并不会因此停止，只有 GameObject 被 SetActive(false) 或 Destroy 才会终止——所以玩家死亡后地上那颗炸弹照样会炸，这正是想要的效果。',
      64: '炸弹必须落在格点正中心。Tilemap 的世界坐标原点与每格大小是固定的，只有整数格点才和瓦片一一对应；玩家在两格之间移动时 transform.position.x 可能是 3.47，直接拿去 Instantiate 会得到一颗压在格子交界处的炸弹，后面的 OverlapBox / WorldToCell 就会判定到隔壁格，表现成「明明贴着砖块却炸不掉」。另外注意 Vector2 是值类型：transform.position 返回的是副本，这里改 position 完全不会移动玩家本体，只是借它算出一个坐标——这个「副本语义」在 Unity 里既是坑也是便利。',
      72: '整课最核心的一行。WaitForSeconds 让协程在这里挂起 bombFuseTime 秒，然后从下一行继续——「延时三秒再爆炸」这件需求被写成了一句话，而不是一个计时器变量。三个必须知道的细节：① 它用的是缩放时间，游戏暂停（Time.timeScale = 0）时引线自动跟着停，想要不受暂停影响得换成 WaitForSecondsRealtime；② 每次 yield 都会 new 一个 WaitForSeconds 对象，高频调用（比如每颗子弹都用）会产生 GC 垃圾，应缓存成静态字段，这里一局最多几颗炸弹所以无所谓；③ 协程最大的短板是无法中途查询「还剩多久」、也不好取消（除非保存 Coroutine 句柄再 StopCoroutine），所以引线进度条、以及后面「链式引爆要提前点燃另一颗炸弹」这类需求，都不能靠操作协程本身完成，得另配状态位。',
      97: '递归的第一条铁律：先写出口。Explode 每次把自己调用一遍并把 length 减 1，没有这一行就会无限递归直到栈溢出、编辑器直接卡死。这一行同时也定义了玩法——length 就是爆炸半径，减到 0 表示这条火链走到尽头了。写任何递归时养成习惯：把出口写在函数最开头，并且确认每一条分支最终都能让参数朝出口方向变化（这里是 length 单调递减）。',
      105: '用物理查询而不是查数组，是因为「墙」和「可破坏砖块」在 Unity 里是场景中的碰撞体和瓦片，脚本不该自己维护一份重复的二维表，否则地图一改两边就对不上。OverlapBox 在该格中心用一个比整格略小的盒子（Vector2.one / 2f）做重叠检测：刻意小于整格，是为了避免贴着墙时把隔壁格的碰撞体也扫进来造成误判。LayerMask 是这里的关键——如果不过滤层，爆炸会被玩家自己、被另一颗炸弹挡住；所以 explosionLayerMask 只勾 Wall 和 Destructible。同一个坑的另一面：爆炸特效预制体本身绝不能放在这两个层里，否则它会挡住自己继续蔓延。',
      118: '递归推进：把「已经前进一格后的 position」和 length - 1 传给自己。它等价于一个沿方向逐格展开的 for 循环，但形状与玩法规矩（火焰沿四个方向各延伸 N 格、遇墙即止）逐字对应，读代码就等于读规则，这是选递归而不是选循环的唯一理由。真正容易翻车的是链式引爆必须防重复：两条火链从不同方向扫到同一颗炸弹时，如果引爆函数不加闸门，同一颗炸弹会被引爆两次——爆炸范围凭空翻倍、bombsRemaining 被返还两次（额度莫名 +1），更糟的是 A 点燃 B、B 又点燃 A 会形成死循环直接卡死主线程。所以引爆函数的第一行必须是「已引爆则立即返回」，这是不变式而不是优化。源码里每颗炸弹由协程独占一次引爆流程，浏览器复刻版把链式检测放在蔓延循环里，就必须自己补上这个闸门。',
      125: 'Tilemap 有两套坐标：世界坐标（浮点、连续）和格坐标 cell（整数、离散）。WorldToCell 是把「炸弹炸到了哪个位置」翻译成「这一格在瓦片地图里的下标」的唯一入口，前面 Mathf.Round 做格点对齐就是为了这一步能算准。GetTile 拿到的是 TileBase 引用，判空即可知道这格有没有砖；真正「炸掉」的是 SetTile(cell, null)——它只改数据，不会自动播放碎裂动画，所以才要在原地再 Instantiate 一个 Destructible 代理去演动画和掉道具。这就是「数据层（Tilemap 记状态）」与「表现层（GameObject 演效果）」分离的典型例子：瓦片本身不是 GameObject，既不能挂脚本也不能 Destroy，只能靠 SetTile 改数据。',
      147: '炸弹的经典手感处理，也是全课最容易漏掉的一行：刚放下时炸弹是触发器（isTrigger = true），玩家可以站在上面走出去；一旦玩家离开它的碰撞体，OnTriggerExit2D 就把它改回实心，从此它变成一堵墙，玩家再也回不去。为什么这么绕？如果一开始就是实心，玩家会被自己刚放下的炸弹卡在原地动弹不得；如果一直是触发器，玩家就能反复进出炸弹格、甚至站在炸弹上躲火焰，玩法立刻崩掉。这是一次性的状态切换，触发时机选在「离开时」而不是「放下后延时」，是因为不同玩家的走位速度不同，用固定延时总会有边界情况。另一个 Unity 前提：2D 触发器回调要求双方至少一方带 Rigidbody2D，且同一个物理步内切换 isTrigger 可能收不到回调，别指望它在同一帧生效。'
    },

    'MovementController.cs': {
      70: '位移 = 速度 × 固定步长 × 方向，三个量各司其职。用 Time.fixedDeltaTime（默认 0.02s，与帧率无关）而不是 deltaTime，是因为这段代码跑在 FixedUpdate 里：120Hz 的机器一秒执行 120 次 Update，但物理仍按 50 次推进，若在这里混用 deltaTime，同一个 speed 在不同帧率下的位移总量就不一样，手感对不齐。direction 是单位向量且无输入时为零向量，于是「松手即停」——炸弹人是在格子里精确走位的游戏，惯性会让角色滑过头、卡在墙角，所以这里刻意和 Asteroids 那种「施力保留速度」的做法相反。最后用 rb.MovePosition 而不是直接改 transform.position：前者会让物理引擎参与计算并把刚体推到合法位置，后者等于瞬移，会直接穿过碰撞体。',
      88: '把「有没有输入」翻译成「要不要播动画」。没有方向键时 direction 是零向量，activeSpriteRenderer.idle 被置为 true，动画就固定停在 idleSprite 那一帧——否则角色站着不动还在原地踏步，非常出戏。注意 idle 只是 AnimatedSpriteRenderer 上的一个开关：帧切换的定时器仍在跑，只是每次 NextFrame 被 idle 分支短路掉了（见 AnimatedSpriteRenderer.cs 的 NextFrame）。用布尔字段而不是 CancelInvoke / 重新 InvokeRepeating，是因为「走 / 停」是每帧都可能切换的状态，反复注册注销定时器更贵，还容易因时序错乱漏掉一次调用。'
    },

    'AnimatedSpriteRenderer.cs': {
      61: '帧动画的核心问题：为什么不能每帧切图？因为 Update 一秒跑 60~144 次，每帧换一张精灵就意味着动画速度跟着帧率走——高刷屏上角色像抽风，低端机上又慢吞吞，同一份资源在不同设备上完全是两种节奏。这里用 InvokeRepeating(nameof(NextFrame), animationTime, animationTime) 起一个固定间隔的定时器（默认 0.25s 一帧，也就是 4 FPS 的走路动画），把「动画时间」和「渲染帧率」彻底解绑。为什么不用 while(true) + yield return new WaitForSeconds 的协程？InvokeRepeating 一行搞定、不需要 IEnumerator、也不占用 Update；代价是它基于方法名调用，不能传参、不能中途查询剩余时间，所以要做受击闪白、定格这类复杂时间轴时还是得换协程或 Animator。用 nameof(NextFrame) 而不是字符串 "NextFrame"，方法改名时编译器直接报错，而不是运行时静默失效。另外要留意它是挂在 MonoBehaviour 上的定时器，生命周期跟对象走，所以本类用 OnEnable / OnDisable 成对同步 SpriteRenderer.enabled，让「切换动画实例」这件事和 Unity 的生命周期对齐。'
    },

    'Explosion.cs': {
      37: '末端特效为什么要整体旋转？因为 middle 段是左右对称的柱形火焰，转不转看不出来；end 段带一个收口造型，必须朝着蔓延方向才不穿帮。Atan2 由方向向量求弧度角，乘 Rad2Deg 换成角度，再绕 Vector3.forward（Z 轴，也就是 2D 里的屏幕法线）旋转——2D 中所有朝向变化都绕 Z。最经典的 Unity 2D 手滑就在这里：Atan2 的参数顺序是 (y, x) 而不是 (x, y)，写反会得到差 90° 的朝向，而且只在部分方向才看得出错，很难查。注意只给 end 设朝向：start 是中心十字、middle 是柱体，硬转反而乱。'
    },

    'Destructible.cs': {
      33: '掉落是两件独立的事：先用 Random.value（[0,1) 均匀分布）跟 itemSpawnChance 比一次决定「掉不掉」，再用 Random.Range 从 spawnableItems 里抽一个决定「掉哪个」。拆成两步而不是一次 Random.Range 到 len + 1，是因为掉落率和掉落种类是两个独立的策划参数，混在一起就没法单独调了。两个必踩的坑：① Random.Range 的整数重载是左闭右开 [0, len)，浮点重载才是两端都闭，很多人在这里越界；② 掉落写在 OnDestroy 里而不是 Start 的定时器后面，好处是「定时销毁」和「被别的逻辑提前销毁」两种情况都会掉，代价是退出播放模式、卸载场景时也会触发 OnDestroy，偶尔会看到退出瞬间凭空生成一堆道具——更稳的写法是另起一个 DestroyAndSpawn() 由各处显式调用。另外 [Range(0f, 1f)] 把这个概率在 Inspector 里变成滑杆，改数值的人不可能填出 3.5 这种非法值。'
    },

    'ItemPickup.cs': {
      41: '三种道具分别对三个不同的状态下手：ExtraBomb 调 BombController.AddBomb()（必须同时把上限 bombAmount 和剩余数 bombsRemaining 各 +1，只加一个就会出 bug，见 BombController.cs 的 AddBomb），BlastRadius 直接改 public 字段 explosionRadius，SpeedIncrease 直接改 MovementController.speed。为什么有的封装成方法、有的直接改字段？判断标准就一句话——「改一个字段够不够」。爆炸半径和速度加 1 就完事，直接改字段最省；炸弹数要同时维护两个状态，属于不变式，必须封装，否则哪天有人在别处只加了其中一个，就会出现「上限 2 颗但额度永远只有 1」这种诡异 bug，而且极难定位。还有一个细节：Destroy(gameObject) 放在 switch 之后统一执行一次（ItemPickup.cs 的第 50 行），保证三种道具都不会被重复拾取；如果每个 case 里各写一次 Destroy，将来加第四种道具时很容易漏掉。'
    }
  },

  /* ---------------- 开发思维与步骤 ---------------- */

  think: {
    core: [
      '第一条思维是「先决定什么东西必须是格子」。炸弹人把几乎所有东西都量化到格子上：炸弹落点用 Mathf.Round 对齐到整数、砖块是 Tilemap 的一个 cell、火焰一整格一整格地蔓延、道具藏在砖块那一格里。好处是所有判定都退化成整数比较——没有浮点误差、没有穿模、没有「差 0.01 像素没炸到」的玄学 bug；代价是角色想自由移动就得自己处理格点对齐。反过来想，如果一开始就用纯物理碰撞来做，光是「炸弹该算在哪一格」就够吵三天。拿到一个新玩法，先问哪些量必须离散、哪些可以连续，比先写角色控制器重要得多。',
      '第二条思维是「一次性的延时流程，要写成顺序代码而不是计时器」。放炸弹这件事的完整流程是：放下 → 等 3 秒 → 引爆 → 返还额度，四步有严格的先后与时间跨度，用协程写出来就是一段读得懂的话。反面做法是给每颗炸弹挂一个 timer 字段、在 Update 里遍历递减——状态被拆散到「对象的数据」和「帧循环的逻辑」两处，等到要加链式引爆（别的炸弹要能提前点燃它）时，你得同时改计时、改状态、改回收，很快就理不清。凡是「某件事将在 N 秒后发生」的需求，先想协程 / 事件，别先想计时器变量。当然也要记住代价：协程不好中途取消、没法查询剩余时间，需要显示引线进度条时还得另配状态位。',
      '第三条思维是「递归的形状应该和规则的字面意思一致，但递归必须自带两道保险」。Explode 的写法——向前推进一格、遇到阻挡就停、否则继续——和玩法规矩「火焰沿四个方向各延伸 N 格，遇墙即止」逐字对应，所以读代码就等于读规则，改玩法时改一个数就行。但任何「A 会触发更多 A」的结构都必须同时准备出口（length <= 0，保证一定停）和闸门（同一颗炸弹不许被引爆两次，保证不会重复、不会绕成环）。写之前先在纸上问两个问题：最坏情况会展开多少层？会不会绕回来？扫雷的连锁展开、2048 的连锁合并、小行星的分裂，本质上都是同一道题。'
    ],

    steps: [
      { t: '① 定规则：一句话说清游戏',
        d: '在网格迷宫里放炸弹，引线烧完向四方向喷火；火焰能连锁引爆别的炸弹、能炸开砖块、能烧死敌人和自己；炸开砖块会掉道具、可能露出出口；踩到出口过关，敌人越来越多。写不出这句话就说明设计没想清楚，别急着写代码。' },
      { t: '② 搭世界：先定 Tilemap 的格子，再谈别的',
        d: '15 × 13 的网格：外圈与内部偶数行列是炸不掉的硬墙，其余格子随机铺可破坏砖块，左上角留出 3 格出生安全区（否则一开局就被自己炸死）。出口藏在一块随机砖块下面。这一步先定死「格子」这个坐标系，后面所有判定——炸弹落哪里、火焰烧到哪、道具掉在哪——才有统一参照。' },
      { t: '③ 造角色：玩家、敌人、炸弹、火焰四类对象',
        d: '玩家和敌人都用「格点补间」移动：一次只走一格，走到才接下一格，这样永远不会卡在半格位置。炸弹是格子上的一个占位对象（引线计时 + 半径 + 是否已引爆）；火焰只是一串带存活时间的格子，不参与碰撞。注意炸弹对玩家「放下时可穿、走出后变墙」，这个状态切换是本作手感的命门。' },
      { t: '④ 建循环：输入、位移、引线三条时间线分开',
        d: '移动跟固定步长（与帧率无关）；引线用协程 / 延时队列，而不是在移动循环里塞计时器；火焰只是倒计时销毁的临时格子。三条时间线互不干扰，才能出现「我放下炸弹跑开、三秒后身后轰一声」这种节奏感。' },
      { t: '⑤ 定交互：把六条规则各自落到一处判定',
        d: '放弹（额度 > 0 且该格无炸弹）→ 引爆（引线到 0 或被火链扫到）→ 蔓延（四方向逐格，遇硬墙止、遇砖块摧毁后止、遇炸弹则递归引爆）→ 拾取（走到道具格）→ 死亡（自己踩到火焰或被敌人碰到）→ 通关（站上已露出的出口）。每条规则一个函数，命名和规则说法一致，改玩法时不用满文件找。' },
      { t: '⑥ 调手感：数值里藏着整个游戏',
        d: '引线 3 秒决定了「放完能跑多远」，火焰 0.5 秒决定了「敢不敢抢道具」，移动速度决定了「能不能躲开自己的炸弹」，复活无敌 1.5 秒决定了「复活会不会立刻再死」，砖块掉落率 30% 决定了「值不值得炸墙」。这几个数任取一个差一倍，游戏就变成另一个样子——调手感不是最后润色，它本身就是设计的一部分。' },
      { t: '⑦ 做流程：死亡序列与关卡推进',
        d: '死亡不是立刻消失：先进入 1.25 秒的死亡序列（停操作、播死亡动画），再掉一条命、回出生点并给无敌时间；命掉光才判定结束。通关则重载关卡：地图重铺、敌人变多、砖块更密，但已吃到的道具保留——保留成长感，是让人愿意打下一关的关键。' }
    ],

    transfer: [
      '「协程写一次性延时流程」→ 太空侵略者的复活延迟与生成器节奏、大金刚的桶生成间隔、蜈蚣的出场延迟，全是同一招：凡是需要「等 N 秒再做某件事」，先试协程，别先造计时器变量。',
      '「递归蔓延 + 出口 + 闸门」→ 扫雷的 Flood Fill 连锁展开、2048 的连锁合并、小行星的分裂生成，结构完全一样：先写出口，再算最坏展开层数，最后补一个「已处理过就不再处理」的闸门。',
      '「Tilemap 记数据、GameObject 演表现」→ 吃豆人的豆子网格、打砖块的砖块阵列、俄罗斯方块的锁定格，都是「整数网格存状态 + 精灵负责好看」。改数据时不要顺手 Destroy 表现对象，让它自己演完再销毁，动画才不会断。'
    ]
  },

  /* =========================================================================
   * create(api) —— 可玩的浏览器复刻版
   *
   * 刻意与 Unity 版保持结构一致：
   *   Update 读输入 → FixedUpdate 位移 → 协程管引线 → 递归 Explode → draw 渲染
   * 变量名也尽量对应，方便对照源码阅读。
   * ======================================================================= */

  create: function (api) {

    /* ---------- 世界：15 × 13 的格子（对应场景里的 Tilemap） ---------- */
    var TILE = 24, COLS = 15, ROWS = 13, HUD = 34;
    var W = COLS * TILE;                 // 360
    var H = ROWS * TILE + HUD;           // 346

    /* 四方向：上、下、左、右（与 Explode 的四次调用顺序一致） */
    var DX = [0, 0, -1, 1];
    var DY = [-1, 1, 0, 0];

    var EMPTY = 0, WALL = 1, BRICK = 2;  // grid：空格 / 硬墙 / 可破坏砖块
    var IT_NONE = 0, IT_BOMB = 1, IT_FIRE = 2, IT_SPEED = 3;   // items：道具层

    /* ---------- 手感参数（对应 Unity 里的 Inspector 字段） ---------- */
    var FUSE = 3.0;                      // bombFuseTime：引线 3 秒
    var FLAME_T = 0.5;                   // explosionDuration：火焰存活 0.5 秒
    var DEATH_T = 1.25;                  // MovementController.cs:113 —— 死亡序列 1.25 秒
    var INV_T = 1.5;                     // 复活无敌时间
    var BASE_SPEED = 4.0;                // MovementController.speed（格/秒）
    var DROP_CHANCE = 0.3;               // Destructible.itemSpawnChance（源码 0.2，这里调高一点更好玩）

    /* ---------- 状态 ---------- */
    var grid, items;                     // 数据层：地形 / 道具（都按格子存）
    var bombs, flames, enemies;          // 表现层对象
    var bricksLeft, exitC, exitR, exitOn;
    var level, lives, maxBombs, bombsLeft, radius, speed;
    var state = 'play';                  // 'play' | 'dead' | 'over'
    var deadT = 0, overMsg = '';
    var animT = 0, varT = 0, tipT = 0, tipText = '';
    var ptrDown = false, ptrTarget = null;

    /* ---------- 玩家：格点补间移动 ---------- */
    var P = {
      c: 1, r: 1,          // 当前所在格
      fx: 1, fy: 1,        // 连续坐标（单位：格），用于绘制与补间
      tc: 1, tr: 1,        // 目标格
      mv: false,           // 是否正在移动
      dir: 'down',         // 面朝方向（对应四个 AnimatedSpriteRenderer）
      invT: 0              // 无敌剩余时间
    };

    /* ======================= 地图（对应场景里的 Tilemap） ======================= */

    function genMap(lv) {
      grid = [];
      items = [];
      bricksLeft = 0;
      exitOn = false;

      for (var c = 0; c < COLS; c++) {
        grid[c] = [];
        items[c] = [];
        for (var r = 0; r < ROWS; r++) {
          /* 外圈 + 内部偶数行列 = 炸不掉的硬墙（经典炸弹人的柱子） */
          if (c === 0 || r === 0 || c === COLS - 1 || r === ROWS - 1) grid[c][r] = WALL;
          else if (c % 2 === 0 && r % 2 === 0) grid[c][r] = WALL;
          else grid[c][r] = EMPTY;
          items[c][r] = IT_NONE;
        }
      }

      /* 出生安全区：左上角 3 格必须空着，否则开局就被自己炸死 */
      var density = Math.min(0.85, 0.7 + lv * 0.02);
      for (var c2 = 1; c2 < COLS - 1; c2++) {
        for (var r2 = 1; r2 < ROWS - 1; r2++) {
          if (grid[c2][r2] !== EMPTY) continue;
          if ((c2 <= 2 && r2 <= 1) || (c2 <= 1 && r2 <= 2)) continue;   // 安全区
          if (Math.random() < density) { grid[c2][r2] = BRICK; bricksLeft++; }
        }
      }

      /* 出口藏在一块离出生点较远的砖块下面 */
      var pool = [];
      for (var c3 = 1; c3 < COLS - 1; c3++) {
        for (var r3 = 1; r3 < ROWS - 1; r3++) {
          if (grid[c3][r3] === BRICK && c3 + r3 > 7) pool.push(c3 * 100 + r3);
        }
      }
      if (!pool.length) pool.push(3 * 100 + 3);
      var pick = pool[(Math.random() * pool.length) | 0];
      exitC = Math.floor(pick / 100);
      exitR = pick % 100;
    }

    function spawnEnemies(lv) {
      enemies = [];
      var n = Math.min(8, 2 + lv);                 // 关卡越高敌人越多
      var sp = Math.min(3.4, 2.2 + lv * 0.15);     // 也越快
      var guard = 0;
      while (enemies.length < n && guard++ < 400) {
        var c = 1 + ((Math.random() * (COLS - 2)) | 0);
        var r = 1 + ((Math.random() * (ROWS - 2)) | 0);
        if (grid[c][r] !== EMPTY) continue;
        if (Math.abs(c - 1) + Math.abs(r - 1) < 7) continue;   // 别贴着出生点刷
        var dup = false;
        for (var i = 0; i < enemies.length; i++) if (enemies[i].c === c && enemies[i].r === r) dup = true;
        if (dup) continue;
        enemies.push({ c: c, r: r, fx: c, fy: r, tc: c, tr: r, mv: false, sp: sp, lastD: 1, ph: Math.random() * 6 });
      }
    }

    /* ======================= 格子查询（对应 Tilemap 的坐标换算） ======================= */

    function bombAt(c, r) {
      for (var i = 0; i < bombs.length; i++) {
        var b = bombs[i];
        if (!b.exploded && b.c === c && b.r === r) return b;
      }
      return null;
    }

    function flameAt(c, r) {
      for (var i = 0; i < flames.length; i++) {
        if (flames[i].c === c && flames[i].r === r) return true;
      }
      return false;
    }

    /* 能否走进这一格：地形 + 炸弹（炸弹对玩家有「走出去就变墙」的特殊规则） */
    function canWalk(c, r, isPlayer) {
      if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return false;
      if (grid[c][r] !== EMPTY) return false;
      var b = bombAt(c, r);
      if (b) {
        /* 只有当玩家此刻正站在这一格上时才允许通过（对应 isTrigger 的切换） */
        if (!(isPlayer && P.c === c && P.r === r)) return false;
      }
      return true;
    }

    /* ======================= 放炸弹 / 引爆 / 蔓延 ======================= */

    function placeBomb() {
      if (state !== 'play') return;

      if (bombsLeft <= 0) {
        api.log('没有炸弹额度了 —— 等它们引爆，或去炸砖块找 💣 道具', 'warn');
        return;
      }
      /* 落点对齐到格点：对应 BombController.cs:64 的 Mathf.Round */
      var c = Math.round(P.fx), r = Math.round(P.fy);
      if (bombAt(c, r)) return;

      bombs.push({ c: c, r: r, t: FUSE, radius: radius, exploded: false });
      bombsLeft--;                                   // 对应 BombController.cs:69
      api.hit('BombController.cs', 68);
      api.log('放置炸弹 @(' + c + ',' + r + ')　引线 ' + FUSE.toFixed(1) +
              's　额度 ' + bombsLeft + '/' + maxBombs, 'info');
    }

    /* 引爆：递归蔓延（对应 BombController.Explode 的四方向推进 + 链式检测） */
    function detonate(b, chained) {
      /* 闸门：同一颗炸弹绝不允许引爆两次（否则额度被返还两次、还可能 A→B→A 死循环） */
      if (b.exploded) return;
      b.exploded = true;

      bombsLeft++;                                   // 对应 BombController.cs:91 返还额度

      api.hit('BombController.cs', chained ? 118 : 80);
      if (chained) api.log('⚡ 链式引爆！火链扫到了 (' + b.c + ',' + b.r + ') 的炸弹', 'ok');

      var cells = 1, killedBrick = 0, chainCount = 0;
      addFlame(b.c, b.r);                            // 中心段（Explosion.start）

      for (var d = 0; d < 4; d++) {                  // 对应四次 Explode 调用
        for (var i = 1; i <= b.radius; i++) {
          var c = b.c + DX[d] * i, r = b.r + DY[d] * i;
          if (c < 0 || r < 0 || c >= COLS || r >= ROWS) break;      // 边界
          if (grid[c][r] === WALL) break;                            // 硬墙：该方向停止
          if (grid[c][r] === BRICK) {                                // 砖块：摧毁后停止
            destroyBrick(c, r);
            killedBrick++;
            break;
          }
          addFlame(c, r);
          cells++;
          var nb = bombAt(c, r);
          if (nb) {                                                  // 撞到另一颗炸弹 → 链式
            chainCount++;
            detonate(nb, true);
            break;
          }
        }
      }

      if (killedBrick > 0) api.hit('BombController.cs', 132);       // SetTile(cell, null)
      api.log('💥 引爆 @(' + b.c + ',' + b.r + ')　火焰 ' + cells + ' 格' +
              (killedBrick ? '，炸毁砖块 ' + killedBrick + ' 块' : '') +
              (chainCount ? '，连锁 ' + chainCount + ' 颗' : '') +
              '　额度回到 ' + bombsLeft, chained ? 'warn' : 'ok');
    }

    function addFlame(c, r) {
      for (var i = 0; i < flames.length; i++) {
        if (flames[i].c === c && flames[i].r === r) { flames[i].t = FLAME_T; return; }
      }
      flames.push({ c: c, r: r, t: FLAME_T });
    }

    /* 摧毁砖块：改数据 + 掉道具（对应 ClearDestructible + Destructible.OnDestroy） */
    function destroyBrick(c, r) {
      grid[c][r] = EMPTY;
      bricksLeft--;

      if (!exitOn && c === exitC && r === exitR) {
        exitOn = true;
        api.log('🚪 出口出现了！在 (' + c + ',' + r + ') —— 踩上去进入下一关', 'ok');
      }
      if (Math.random() < DROP_CHANCE) {
        var t = IT_BOMB + ((Math.random() * 3) | 0);
        items[c][r] = t;
        api.hit('Destructible.cs', 37);
        api.log('砖块掉落道具：' + itemName(t) + ' @(' + c + ',' + r + ')', 'ok');
      }
    }

    function itemName(t) {
      return t === IT_BOMB ? '💣 炸弹数 +1' : (t === IT_FIRE ? '🔥 火焰长度 +1' : '⚡ 移动速度 +1');
    }

    /* 拾取道具（对应 ItemPickup.OnItemPickup 的 switch） */
    function applyItem(t) {
      if (t === IT_BOMB) {
        maxBombs++; bombsLeft++;                     // 上限与剩余数必须同时 +1
        api.hit('ItemPickup.cs', 36);
        api.log('吃到 💣 —— 炸弹上限 ' + maxBombs + '，额度 ' + bombsLeft, 'ok');
      } else if (t === IT_FIRE) {
        radius++;
        api.hit('ItemPickup.cs', 41);
        api.log('吃到 🔥 —— 火焰长度（explosionRadius）= ' + radius, 'ok');
      } else {
        speed = Math.min(6.5, speed + 1);
        api.hit('ItemPickup.cs', 46);
        api.log('吃到 ⚡ —— 移动速度（MovementController.speed）= ' + speed.toFixed(1), 'ok');
      }
    }

    /* ======================= 移动（对应 Update 读输入 + FixedUpdate 位移） ======================= */

    function startMove(o, c, r) {
      o.tc = c; o.tr = r; o.mv = true;
    }

    /* 固定步长推进：位移 = 速度 × dt × 方向，方向由起止格决定 */
    function advance(o, dt, sp) {
      var dx = o.tc - o.fx, dy = o.tr - o.fy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var step = sp * dt;
      if (step >= dist || dist < 1e-6) {
        o.fx = o.tc; o.fy = o.tr; o.c = o.tc; o.r = o.tr; o.mv = false;
      } else {
        o.fx += dx / dist * step; o.fy += dy / dist * step;
      }
    }

    function movePlayer(dt, keys) {
      if (!P.mv) {
        var dc = 0, dr = 0;
        /* 优先级与 MovementController.Update 一致：上 → 下 → 左 → 右 */
        if (keys.up) dr = -1;
        else if (keys.down) dr = 1;
        else if (keys.left) dc = -1;
        else if (keys.right) dc = 1;

        if (dc || dr) {
          P.dir = (dc === -1) ? 'left' : (dc === 1) ? 'right' : (dr === -1) ? 'up' : 'down';
          if (canWalk(P.c + dc, P.r + dr, true)) startMove(P, P.c + dc, P.r + dr);
          else ptrTarget = null;                     // 撞墙就放弃触屏目标，避免卡住
        } else if (ptrTarget) {
          var nx = nextStep(P.c, P.r, ptrTarget.c, ptrTarget.r);
          if (nx) startMove(P, nx.c, nx.r);
          else ptrTarget = null;
        }
      }
      if (P.mv) advance(P, dt, speed);
    }

    /* 触屏/鼠标：BFS 找一步（网格只有 195 格，代价可忽略） */
    function nextStep(sc, sr, tc, tr) {
      if (sc === tc && sr === tr) return null;
      var start = sc * 100 + sr, goal = tc * 100 + tr;
      var seen = {}, prev = {}, q = [start], head = 0;
      seen[start] = 1;
      while (head < q.length) {
        var cur = q[head++];
        if (cur === goal) break;
        var cc = Math.floor(cur / 100), rr = cur % 100;
        for (var i = 0; i < 4; i++) {
          var nc = cc + DX[i], nr = rr + DY[i];
          if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue;
          var k = nc * 100 + nr;
          if (seen[k] || !canWalk(nc, nr, true)) continue;
          seen[k] = 1; prev[k] = cur; q.push(k);
        }
      }
      if (!seen[goal]) return null;
      var p = goal;
      while (prev[p] !== undefined && prev[p] !== start) p = prev[p];
      return { c: Math.floor(p / 100), r: p % 100 };
    }

    function moveEnemies(dt) {
      for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (!e.mv) {
          var dirs = [];
          for (var d = 0; d < 4; d++) {
            if (canWalk(e.c + DX[d], e.r + DY[d], false)) dirs.push(d);
          }
          if (!dirs.length) continue;

          var pick, toward = -1;
          /* 第 3 关起偶尔朝玩家靠拢，制造压力 */
          if (level >= 3 && Math.random() < 0.35) {
            var best = 1e9;
            for (var j = 0; j < dirs.length; j++) {
              var dd = Math.abs(e.c + DX[dirs[j]] - P.c) + Math.abs(e.r + DY[dirs[j]] - P.r);
              if (dd < best) { best = dd; toward = j; }
            }
          }
          if (toward >= 0) {
            pick = dirs[toward];
          } else {
            /* 尽量不立刻掉头，走位看起来更自然 */
            var fwd = [];
            for (var k = 0; k < dirs.length; k++) {
              if (!(DX[dirs[k]] === -DX[e.lastD] && DY[dirs[k]] === -DY[e.lastD])) fwd.push(dirs[k]);
            }
            var pool = fwd.length ? fwd : dirs;
            pick = pool[(Math.random() * pool.length) | 0];
          }
          e.lastD = pick;
          startMove(e, e.c + DX[pick], e.r + DY[pick]);
        }
        if (e.mv) advance(e, dt, e.sp);
      }
    }

    /* ======================= 危险判定与流程 ======================= */

    function checkHazards(dt) {
      if (P.invT > 0) P.invT -= dt;
      var pc = Math.round(P.fx), pr = Math.round(P.fy);

      /* 拾取道具（对应 ItemPickup.OnTriggerEnter2D） */
      var it = items[pc][pr];
      if (it) { items[pc][pr] = IT_NONE; applyItem(it); }

      /* 敌人被火焰烧到 */
      for (var i = enemies.length - 1; i >= 0; i--) {
        var e = enemies[i];
        var ec = Math.round(e.fx), er = Math.round(e.fy);
        if (flameAt(ec, er)) {
          enemies.splice(i, 1);
          api.log('🔥 敌人被烧掉了！剩余 ' + enemies.length, 'ok');
          continue;
        }
        /* 玩家撞到敌人 */
        if (ec === pc && er === pr) { die('撞上了敌人'); return; }
      }

      /* 玩家踩到火焰（对应 MovementController.OnTriggerEnter2D 的爆炸层判定） */
      if (P.invT <= 0 && flameAt(pc, pr)) { die('被自己（或别人）的火焰烧到'); return; }

      /* 站上出口 → 过关 */
      if (exitOn && pc === exitC && pr === exitR) nextLevel();
    }

    function die(reason) {
      if (state !== 'play') return;
      state = 'dead';
      deadT = DEATH_T;
      ptrTarget = null;
      api.hit('MovementController.cs', 95);
      api.log('💀 ' + reason + ' —— 进入死亡序列（' + DEATH_T + 's）', 'err');
    }

    function afterDeath() {
      lives--;
      if (lives <= 0) {
        state = 'over';
        overMsg = '游戏结束 · 通过 ' + (level - 1) + ' 关 · 按 R 重开';
        api.hit('GameManager.cs', 65);
        api.log(overMsg, 'err');
        return;
      }
      /* 复活：回出生点 + 无敌时间（对应 GameManager 重开一局的那 3 秒缓冲） */
      P.c = 1; P.r = 1; P.fx = 1; P.fy = 1; P.tc = 1; P.tr = 1; P.mv = false;
      P.invT = INV_T;
      state = 'play';
      api.hit('MovementController.cs', 113);
      api.log('复活：剩余生命 ' + lives + '，无敌 ' + INV_T + 's', 'warn');
    }

    function nextLevel() {
      level++;
      api.hit('GameManager.cs', 74);
      api.log('🎉 通关！进入第 ' + level + ' 关（敌人更多、砖块更密，道具保留）', 'ok');

      bombs = []; flames = [];
      bombsLeft = maxBombs;                          // 对应 OnEnable 里 bombsRemaining = bombAmount
      genMap(level);
      spawnEnemies(level);
      P.c = 1; P.r = 1; P.fx = 1; P.fy = 1; P.tc = 1; P.tr = 1; P.mv = false;
      P.invT = 1.0; ptrTarget = null;
      tipText = '第 ' + level + ' 关';
      tipT = 1.6;
    }

    /* ======================= 帧循环 ======================= */

    function update(dt, keys, api2) {
      animT += dt;
      varT += dt;
      if (varT >= 0.12) { varT = 0; publish(); }     // 约 8Hz，别每帧刷 DOM
      if (tipT > 0) tipT -= dt;

      /* 引线：对应协程里的 WaitForSeconds（玩家死后照常烧完） */
      for (var i = bombs.length - 1; i >= 0; i--) {
        var b = bombs[i];
        if (b.exploded) continue;
        b.t -= dt;
        if (b.t <= 0) {
          api.hit('BombController.cs', 72);
          detonate(b, false);
        }
      }
      /* 已引爆的炸弹移出列表，火焰倒计时 */
      var alive = [];
      for (var j = 0; j < bombs.length; j++) if (!bombs[j].exploded) alive.push(bombs[j]);
      bombs = alive;
      for (var k = flames.length - 1; k >= 0; k--) {
        flames[k].t -= dt;
        if (flames[k].t <= 0) flames.splice(k, 1);
      }

      if (state === 'over') return;
      if (state === 'dead') {
        deadT -= dt;
        if (deadT <= 0) afterDeath();
        return;
      }

      movePlayer(dt, keys);
      moveEnemies(dt);
      checkHazards(dt);
    }

    /* ---------- 关键状态推给底部面板 ---------- */
    function publish() {
      api.vars({
        'lives 生命': lives,
        'level 关卡': level,
        'bombsRemaining 额度': bombsLeft + ' / ' + maxBombs,
        'explosionRadius 火力': radius,
        'speed 速度': speed.toFixed(1),
        'bombs 场上炸弹': bombs.length,
        'flames 火焰格': flames.length,
        'enemies 剩余敌人': enemies.length,
        'bricks 剩余砖块': bricksLeft,
        'playerCell 玩家格': '(' + Math.round(P.fx) + ',' + Math.round(P.fy) + ')',
        'exit 出口': exitOn ? '已出现 (' + exitC + ',' + exitR + ')' : '未找到'
      });
    }

    /* ======================= 渲染 ======================= */

    function cx(c) { return c * TILE; }
    function cy(r) { return HUD + r * TILE; }

    /* 帧动画：固定 0.25s 一帧（对应 AnimatedSpriteRenderer.animationTime），与渲染帧率解绑 */
    function frameOf(phase) {
      return Math.floor((animT + phase) / 0.25) % 4;
    }

    function draw(ctx, api2) {
      /* 背景 */
      ctx.fillStyle = '#0b1020';
      ctx.fillRect(0, 0, W, H);

      /* ---------- HUD ---------- */
      ctx.fillStyle = '#111a2c';
      ctx.fillRect(0, 0, W, HUD);
      ctx.fillStyle = 'rgba(255,255,255,.10)';
      ctx.fillRect(0, HUD - 1, W, 1);
      ctx.font = '600 12px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      var hy = HUD / 2;
      ctx.fillStyle = '#fca5a5'; ctx.fillText('生命 ' + lives, 8, hy);
      ctx.fillStyle = '#93c5fd'; ctx.fillText('关卡 ' + level, 62, hy);
      ctx.fillStyle = '#e2e8f0'; ctx.fillText('炸弹 ' + bombsLeft + '/' + maxBombs, 112, hy);
      ctx.fillStyle = '#fdba74'; ctx.fillText('火力 ' + radius, 178, hy);
      ctx.fillStyle = '#c4b5fd'; ctx.fillText('敌人 ' + enemies.length, 224, hy);
      ctx.fillStyle = '#8fa0b8'; ctx.fillText('砖块 ' + bricksLeft, 272, hy);

      /* ---------- 地面 ---------- */
      for (var c = 0; c < COLS; c++) {
        for (var r = 0; r < ROWS; r++) {
          var x = cx(c), y = cy(r);
          ctx.fillStyle = ((c + r) % 2 === 0) ? '#182034' : '#1c253c';
          ctx.fillRect(x, y, TILE, TILE);

          if (grid[c][r] === WALL) {
            ctx.fillStyle = '#59698a'; ctx.fillRect(x, y, TILE, TILE);
            ctx.fillStyle = '#7d90b4'; ctx.fillRect(x + 2, y + 2, TILE - 4, 5);
            ctx.fillStyle = '#3f4c68'; ctx.fillRect(x + 2, y + TILE - 5, TILE - 4, 3);
          } else if (grid[c][r] === BRICK) {
            ctx.fillStyle = '#9c5c2c'; ctx.fillRect(x + 1, y + 1, TILE - 2, TILE - 2);
            ctx.fillStyle = '#c07d43'; ctx.fillRect(x + 1, y + 1, TILE - 2, 4);
            ctx.fillStyle = 'rgba(0,0,0,.28)';
            ctx.fillRect(x + 1, y + TILE / 2 - 1, TILE - 2, 2);
          }

          /* 道具层（藏在砖块下，砖块炸开才看得见） */
          var it = items[c][r];
          if (it && grid[c][r] === EMPTY) drawItem(ctx, it, x + TILE / 2, y + TILE / 2);
        }
      }

      /* ---------- 出口 ---------- */
      if (exitOn) {
        var ex = cx(exitC) + TILE / 2, ey = cy(exitR) + TILE / 2;
        var pulse = 0.5 + 0.5 * Math.sin(animT * 4);
        ctx.fillStyle = 'rgba(110,231,183,' + (0.25 + 0.35 * pulse) + ')';
        ctx.fillRect(cx(exitC) + 1, cy(exitR) + 1, TILE - 2, TILE - 2);
        ctx.strokeStyle = '#6ee7b7'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(ex, ey, 5 + 2 * pulse, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#6ee7b7';
        ctx.font = '600 9px -apple-system, "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('出口', ex, ey + 0.5);
      }

      /* ---------- 炸弹 ---------- */
      for (var i = 0; i < bombs.length; i++) {
        var b = bombs[i];
        var bx = cx(b.c) + TILE / 2, by = cy(b.r) + TILE / 2;
        var k = 1 - b.t / FUSE;                       // 引线进度 0→1
        var blink = (b.t < 1.0 && Math.floor(animT * 8) % 2 === 0);
        var rad = TILE * (0.30 + 0.06 * Math.sin(animT * (6 + 10 * k)));
        ctx.fillStyle = blink ? '#f87171' : '#1f2937';
        ctx.beginPath(); ctx.arc(bx, by, rad, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = blink ? '#fff1f2' : '#64748b';
        ctx.beginPath(); ctx.arc(bx - rad * 0.3, by - rad * 0.3, rad * 0.22, 0, Math.PI * 2); ctx.fill();
        /* 引线火花 */
        ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx + rad * 0.4, by - rad * 0.8);
        ctx.lineTo(bx + rad * 0.9, by - rad * 1.5);
        ctx.stroke();
      }

      /* ---------- 火焰（对应 Explosion 的 start / middle / end 三段） ---------- */
      for (var f = 0; f < flames.length; f++) {
        var fl = flames[f];
        var t = fl.t / FLAME_T;                        // 1 → 0
        var fx2 = cx(fl.c) + TILE / 2, fy2 = cy(fl.r) + TILE / 2;
        var s = TILE * (0.45 + 0.35 * t) + Math.sin((animT + f) * 22) * 1.2;
        ctx.fillStyle = 'rgba(249,115,22,' + (0.30 + 0.55 * t) + ')';
        ctx.fillRect(fx2 - s / 2, fy2 - s / 2, s, s);
        ctx.fillStyle = 'rgba(253,224,71,' + (0.35 + 0.5 * t) + ')';
        ctx.fillRect(fx2 - s / 4, fy2 - s / 4, s / 2, s / 2);
      }

      /* ---------- 敌人 ---------- */
      for (var e = 0; e < enemies.length; e++) {
        var en = enemies[e];
        var exx = en.fx * TILE + TILE / 2, eyy = HUD + en.fy * TILE + TILE / 2;
        var ef = frameOf(en.ph);
        var bob = (ef === 1 || ef === 3) ? -1.5 : 0;
        ctx.fillStyle = '#a855f7';
        ctx.beginPath(); ctx.arc(exx, eyy + bob, TILE * 0.32, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0b1020';
        ctx.beginPath(); ctx.arc(exx - 3, eyy + bob - 2, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(exx + 3, eyy + bob - 2, 1.8, 0, Math.PI * 2); ctx.fill();
      }

      /* ---------- 玩家 ---------- */
      if (state !== 'over') {
        var px = P.fx * TILE + TILE / 2, py = HUD + P.fy * TILE + TILE / 2;
        /* 走动时按 0.25s 一帧切换（idle 时固定第 0 帧 = idleSprite） */
        var moving = P.mv;
        var pf = moving ? frameOf(0) : 0;
        var pb = (pf === 1 || pf === 3) ? -1.5 : 0;
        var dying = (state === 'dead');

        ctx.globalAlpha = (P.invT > 0 && Math.floor(animT * 10) % 2 === 0) ? 0.4 : 1;
        if (dying) ctx.globalAlpha = 0.45 + 0.3 * Math.sin(animT * 20);

        ctx.fillStyle = dying ? '#94a3b8' : '#38bdf8';
        ctx.beginPath(); ctx.arc(px, py + pb, TILE * 0.34, 0, Math.PI * 2); ctx.fill();

        /* 面朝方向：用眼睛位置表示（对应四个方向的 AnimatedSpriteRenderer） */
        var ox = 0, oy = 0;
        if (P.dir === 'up') oy = -4;
        else if (P.dir === 'down') oy = 3;
        else if (P.dir === 'left') ox = -4;
        else ox = 4;
        ctx.fillStyle = '#0b1020';
        ctx.beginPath(); ctx.arc(px + ox - (oy !== 0 ? 3 : 0), py + pb + oy - 1, 1.7, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(px + ox + (oy !== 0 ? 3 : 0), py + pb + oy - 1, 1.7, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }

      /* ---------- 提示层 ---------- */
      ctx.textAlign = 'center';
      if (tipT > 0) {
        ctx.fillStyle = 'rgba(110,231,183,' + Math.min(1, tipT) + ')';
        ctx.font = '600 20px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText(tipText, W / 2, HUD + ROWS * TILE / 2 - 30);
      }
      if (state === 'over') {
        ctx.fillStyle = 'rgba(8,12,24,.72)';
        ctx.fillRect(0, HUD, W, ROWS * TILE);
        ctx.fillStyle = '#fca5a5';
        ctx.font = '600 20px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('游戏结束', W / 2, H / 2 - 12);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '13px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('通过了 ' + (level - 1) + ' 关 · 按 R 重开', W / 2, H / 2 + 14);
      } else if (state === 'dead') {
        ctx.fillStyle = '#fca5a5';
        ctx.font = '600 15px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('死亡中… ' + deadT.toFixed(2) + 's', W / 2, HUD + 14);
      }
    }

    function drawItem(ctx, it, x, y) {
      ctx.fillStyle = it === IT_BOMB ? '#1f2937' : (it === IT_FIRE ? '#f97316' : '#facc15');
      ctx.beginPath(); ctx.arc(x, y, TILE * 0.28, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0b1020';
      ctx.font = '600 11px -apple-system, "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(it === IT_BOMB ? 'B' : (it === IT_FIRE ? 'F' : 'S'), x, y + 0.5);
    }

    /* ======================= 重置（对应 GameManager.NewRound 重载场景） ======================= */

    function resetAll() {
      level = 1;
      lives = 3;
      /* 源码默认是 1 颗；这里给 2 颗，好让「链式引爆」一上来就能玩到 */
      maxBombs = 2;
      bombsLeft = 2;                                  // OnEnable：bombsRemaining = bombAmount
      radius = 1;                                     // explosionRadius
      speed = BASE_SPEED;                             // MovementController.speed
      bombs = [];
      flames = [];
      state = 'play';
      deadT = 0;
      P.c = 1; P.r = 1; P.fx = 1; P.fy = 1; P.tc = 1; P.tr = 1;
      P.mv = false; P.dir = 'down'; P.invT = 0;
      ptrTarget = null;
      genMap(level);
      spawnEnemies(level);
      tipText = '第 1 关 · 炸开砖块找出口';
      tipT = 2.2;
    }

    resetAll();
    api.log('炸弹人开跑：↑↓←→/WASD 移动，空格放炸弹，引线 3 秒', 'sys');
    api.log('初始给 2 颗炸弹额度，方便你马上试出「链式引爆」', 'sys');

    /* ---------- 鼠标 / 触屏：点格子自动寻路 ---------- */
    function cellOf(x, y) {
      var c = Math.floor(x / TILE);
      var r = Math.floor((y - HUD) / TILE);
      if (c < 0) c = 0; if (c >= COLS) c = COLS - 1;
      if (r < 0) r = 0; if (r >= ROWS) r = ROWS - 1;
      return { c: c, r: r };
    }

    /* ---------- 对外接口 ---------- */
    return {
      w: W, h: H,
      reset: function () { resetAll(); api.log('已重开 —— 第 1 关，3 条命', 'sys'); },
      update: update,
      draw: draw,
      onKey: function (k, down, api2) {
        if (k !== 'fire' || !down) return;
        if (state === 'play') placeBomb();
        else if (state === 'over') api.log('已经结束了 —— 按 R 重开', 'warn');
        else api.log('死亡序列中，无法放炸弹', 'warn');
      },
      onPointer: function (x, y, down, api2) {
        if (!down) return;
        ptrDown = true;
        var t = cellOf(x, y);
        if (grid[t.c][t.r] === EMPTY) ptrTarget = t;
      },
      onPointerMove: function (x, y, api2) {
        if (!ptrDown) return;
        var t = cellOf(x, y);
        if (grid[t.c][t.r] === EMPTY) ptrTarget = t;
      },
      onPointerUp: function (api2) { ptrDown = false; }
    };
  }
});
