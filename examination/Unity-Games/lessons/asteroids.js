/* =============================================================================
 * Asteroids · 小行星
 * -----------------------------------------------------------------------------
 * 本文件三部分：
 *   1) create(api) —— 浏览器里可玩的 Canvas 复刻版（与 Unity 版逻辑一一对应）
 *   2) notes       —— 逐句讲解：「为什么这么写」
 *   3) think       —— 开发思维与步骤拆解
 * ========================================================================== */

UG_LESSON('asteroids', {

  /* ---------------- 元数据 ---------------- */

  name: '小行星 Asteroids',
  ico: '🪨',
  difficulty: 3,
  tags: ['刚体推力', '屏幕环绕', '分裂生成', '关卡递增'],
  controls: 'A / ← 左转，D / → 右转，W / ↑ 推进（有惯性，松手会继续漂），空格或鼠标左键发射（有射速冷却）。P 暂停，R 重开。',
  oneLiner: '一架没有刹车的飞船、一堆会越打越碎的石头。用「推力 + 惯性 + 屏幕环绕 + 递归分裂」四件事，把 1979 年街机的手感和 Unity 2D 物理的坑一次讲透。',

  /* ---------------- 逐句讲解：文件名 → 行号 → 讲解 ---------------- */

  notes: {

    'Player.cs': {
      74: '屏幕环绕的坐标基准。这里不写死 ±10 之类的数字，而是用 Camera.main.ScreenToWorldPoint 把「屏幕像素」换算成「世界坐标」：先塞左下角 (0,0)，再塞右上角 (Screen.width, Screen.height)，Bounds.Encapsulate 自动算出包围盒。为什么必须换算？世界坐标的可视范围取决于摄像机的 orthographicSize 和屏幕宽高比——换个分辨率、改一下相机缩放，写死的边界立刻失效，飞船会在屏幕正中间就被传送，而你在 Inspector 里怎么调数值都对不上。相机不动的话在 Start 里算一次就够，放进 Update 每帧算是白浪费。',
      87: '复活无敌的核心一行。OnEnable 里先关碰撞，再用 Invoke 预约「respawnInvulnerability 秒后恢复碰撞」。为什么非要这段无敌时间？因为 Respawn 把飞船放回世界原点，而原点很可能正压着一颗小行星——不做保护就会出现「复活 → 立刻撞死 → 再复活 → 再撞死」的死循环，三条命一秒钟掉光，玩家根本不知道发生了什么。用 Invoke 而不是协程，是因为这是一次性、不需要中途取消的延时；用 nameof(TurnOnCollisions) 而不是字符串，方法改名时编译器直接报错，而不是运行时静默失效。',
      116: '这一行是整课的灵魂：为什么用 AddForce 而不是直接改 transform.position？AddForce 改的是「速度」，速度再被物理引擎积分成位置——松开推进键后速度仍然保留，飞船会继续惯性滑行，这才是太空该有的漂移感。直接改 position 得到的是「按一次走一格」，松手就停，像在棋盘上挪棋子，完全没有惯性可言。另外三个细节：① 力乘的是 transform.up（飞船自身上方），它随旋转改变，所以转向后推力方向自动跟着变，不用你手动算三角函数；② AddForce 默认 ForceMode2D.Force（力），实际 Δv = F·Δt/m，所以必须按住持续施力才有加速感；③ 正因为它要按物理步长积分，必须放在 FixedUpdate 里——放 Update 的话高刷屏和低帧率机器会得到不同的加速度，手感对不上。',
      121: '转向同样用「施加扭矩」而不是直接写 transform.eulerAngles。AddTorque 改的是角速度，角速度再积分成角度：按住左键角速度逐渐累加，松开后飞船还会继续转一点才停——这就是惯性的另一半。直接设角度的话，松手瞬间就定住，飞船像被钉在转盘上，非常生硬。代价是手感必须调：rotationSpeed 太小转不动，太大又因为没有角阻尼会越转越快停不下来，所以浏览器复刻版里补了一个很小的角阻尼，让它最终稳定在一个角速度上。',
      135: '环绕判据里那个 + 0.5f 是很多人会踩的坑。如果用严格边界（刚出界就算越界），物体被传送到对侧边缘的瞬间，它的坐标刚好又落在「越界」判定里，会导致来回抖动、甚至每帧反复传送，看上去像卡在边缘抽搐。多留 0.5 个单位的容差——先让它完全飞出屏幕一点，再传送到对侧屏幕外一点——视觉上才是干净的「从另一边钻出来」。还要注意整段是 else if 链：一帧只处理一个方向的越界，避免斜着飞出角落时被传送两次（那会直接飞到对角去）。',
      178: '为什么用 CompareTag 而不是 gameObject.tag == "Asteroid"？后者每次比较都要从原生层取回字符串并产生一次托管堆分配，碰撞密集时就是持续的 GC 垃圾，移动端会看到周期性卡顿；CompareTag 在原生层比较，零分配。另一个要点是「必须过滤」：子弹打到飞船、飞船蹭到子弹都不该触发死亡流程，所以这里只认 Asteroid；对称地，Asteroid 那边只认 Bullet。两边各自只处理自己该管的那一类，职责不交叉，加新物体时也不会互相误伤。'
    },

    'GameManager.cs': {
      129: '按尺寸分级给分：小的 100、中的 50、大的 25。这是一条纯设计取舍而非技术要求——它把「风险」和「收益」绑在一起：越小的碎片越难打中，分就该越高，玩家才会主动去追碎片而不是只会轰大块，一局的操作密度立刻不一样。实现上放在 GameManager 而不是 Asteroid 里，是因为「计分规则」属于游戏状态；Asteroid 只负责喊一句「我被销毁了」，它连自己值多少分都不知道。这种分工让你改计分规则时只动一个文件。',
      157: '延迟复活。命还没掉光时不是立刻 SetActive(true)，而是 Invoke(respawnDelay 秒后 Respawn)。这缓冲的几秒给了玩家「看清楚自己是怎么死的」的时间，也避开了死亡瞬间还留在原地的小行星碎片——否则复活即撞击，前面做的无敌时间也救不回来。同样用 nameof(Respawn) 保证改名安全。真实项目里更推荐协程或 UniTask：Invoke 基于方法名反射，不能传参、也无法中途查询「还剩多久」，想显示复活倒计时就只能自己另起一个计时器。'
    },

    'Asteroid.cs': {
      37: 'minSize 是防止「无限分裂」的闸门。不设下限的话，每颗小行星被击中都会变成两颗更小的，而更小的又继续分裂——尺寸可以无限趋近 0，场上物体数量指数爆炸（一颗大行星连续分裂 10 次就是 1024 个物体），物理开销和 Draw Call 会直接把帧率打穿。设成 0.35 之后，1.5 → 0.75 → 0.375 → 停止，正好三档，一颗大行星最多变出 7 个可击毁目标，难度曲线完全可控。「递归必须有明确终止条件」这条思路，和扫雷的连锁展开、2048 的连锁合并是同一类问题。',
      80: '小行星只在生成瞬间推一次力，之后再也不施力。前提是它的 Rigidbody2D 把 drag 设为 0——没有阻力就没有减速，一次 AddForce 给到的速度会一直保持，形成匀速直线漂移，这正是太空里石头该有的样子。如果 drag 不是 0（很多人会从别处拷来带阻尼的刚体），小行星就会慢慢停在屏幕中间变成活靶子，整个游戏难度塌掉。反过来说，想让碎片「炸开后逐渐减速」，正确做法是给它一点 drag，而不是每帧反向施力去模拟摩擦。',
      92: '分裂条件写的是 (size * 0.5f) >= minSize——判断的是「分裂之后的那两块」是否达标，而不是「当前这块」够不够大。这个区别很关键：若写成 size >= minSize，一块 0.4 的碎片（已经很接近最小）仍会被允许分裂成两块 0.2，而 0.2 早已小于 minSize，等于闸门形同虚设，场上照样出现比最小值还小的碎屑。先算出分裂后的尺寸再判定，才能保证「场上永远不会出现小于 minSize 的物体」这条不变式。',
      122: '用 Instantiate(this, ...) 克隆「自己」而不是克隆预制体，是很省事的写法：新小行星自动带上同样的贴图数组、刚体参数、碰撞体和脚本，只需覆盖 size 和 trajectory 两件事。两个细节：① 生成点加了 Random.insideUnitCircle * 0.5f 的随机偏移，否则两颗新小行星完全重叠，物理引擎会在同一帧把它们猛地弹开，看上去像炸开一样；② 尺寸减半后质量也要跟着变（见 Start 里的 rb.mass = size），否则小碎块仍带着大块的质量，撞上飞船会把飞船弹飞，手感非常怪。'
    },

    'AsteroidSpawner.cs': {
      70: '让小行星「朝屏幕里飞」的关键一行。spawnDirection 是从生成器指向生成点的向量（朝外），取负号才是朝中心；再乘上前面随机出来的旋转四元数，就得到带角度扰动的最终轨迹。为什么要扰动？如果所有小行星都笔直穿过屏幕中心，玩家躲在角落就能苟活，路线也完全可预测，几分钟就腻了。而 trajectoryVariance 被 [Range(0f, 45f)] 限制在 45° 以内——再大就会出现「生成在外侧、却飞向外侧」的小行星，永远进不了屏幕，玩家只能一脸问号地等它出现。用 [Range] 而不是注释，是因为它能直接在 Inspector 里拖出滑杆，改数值的人和写脚本的人想法不容易跑偏。'
    },

    'Bullet.cs': {
      43: '子弹和小行星是同一套思路：无阻力，只在发射瞬间 AddForce 一次，之后匀速飞行，不需要每帧施力。这里要特别警惕 ForceMode2D：默认是 Force（力），Δv = F·Δt/m；如果你想要「立刻达到某个速度」，应该用 ForceMode2D.Impulse（冲量），Δv = F/m，两者在默认 0.02s 的物理步长下差了整整 50 倍——很多人调不动子弹速度，就是因为选错了模式却在一个巨大的数值上来回打转。另外 speed = 500 是「力」而不是「速度」，别拿它当像素/秒来估。'
    }
  },

  /* ---------------- 开发思维与步骤 ---------------- */

  think: {
    core: [
      '第一条思维是「力 vs 位置」：让物体动起来有两种写法——直接改位置，或者施加力去改变速度。这一课全部用后者。区别在于直接改位置是「位移」，松手即停；施力改的是速度，松手后速度还在，物体会继续滑行。这个「停不下来」不是 bug，正是太空题材要的手感。想通这一点，你就明白了为什么物理代码要分成「Update 读输入 / FixedUpdate 施力」两层——输入跟渲染帧、受力跟物理帧，混在一起的话帧率一变手感就变。',
      '第二条是「递归生成必须有闸门」。小行星被击中分裂成两块更小的，更小的还能再分裂——这是一个天然的递归结构，而递归最危险的就是没有终止条件：少一行 minSize 判断，场上物体就会指数爆炸，从卡顿到崩溃只是几秒钟的事。写任何「A 会生成更多 A」的逻辑时（碎片、连锁爆炸、粒子裂变、扫雷展开），先问一句：它最深能到第几层？最坏情况会有多少个？把这个数字算出来，再决定闸门设在哪。',
      '第三条是「状态机式的生命周期保护」。飞船有 存活 / 死亡等待 / 复活无敌 三种状态，很多新手写出来的版本会「一出生就撞死」——因为复活的瞬间飞船正好压在小行星上。解法不是把飞船挪到一个"安全点"（场上处处都可能不安全），而是给一段无敌时间，用状态而不是位置来解决问题。凡是「刚生成的东西」，都该先问一句：它生成时会不会立刻触发自己的销毁条件？'
    ],

    steps: [
      { t: '① 定规则：一句话说清游戏',
        d: '开着一架没有刹车的飞船，把场上所有小行星打碎；大石头会裂成两块中石头、中石头再裂成两块小石头，小石头一击即碎；撞上任何一块掉一条命，三条命用完结束；清空全场进下一关，石头更多。写不出这句话就别动手——Asteroids 的规则看似简单，但"没有刹车"和"会分裂"这两个设定决定了整个手感走向。' },
      { t: '② 搭世界：先定边界，再谈内容',
        d: '一个 640×360 的无边界太空——没有墙，飞出去从另一边回来。关键决定是边界怎么算：不能写死数字，要用摄像机把屏幕像素换算成世界坐标（Player.cs:74），这样换分辨率、改相机缩放都不用动代码。Unity 版还留了 screenWrapping 开关，关掉就启用 Boundary 边界墙，两种玩法一套代码。' },
      { t: '③ 造角色：飞船 / 小行星 / 子弹 三件套',
        d: '飞船有位置、速度、朝向、角速度四个状态，靠 AddForce 与 AddTorque 驱动；小行星有尺寸（决定缩放、质量、分值）与随机多边形外观；子弹最简单，一次性初速度加一个存活倒计时。三者的共同点是 drag 全为 0——推一次就一直飞，这是太空感的物理基础。' },
      { t: '④ 建循环：输入与物理分离',
        d: 'Update 里只做三件事：读推进键、读转向键、检测开火（GetKeyDown 保证按一次只发一发）。FixedUpdate 里施力、施扭矩、做屏幕环绕。这个分离是 Unity 物理移动的标准姿势，本课的浏览器复刻版严格照抄了这个结构，你可以对照着读。' },
      { t: '⑤ 定交互：谁碰谁、碰了怎么样',
        d: '三条碰撞规则：子弹碰小行星 → 小行星分裂或销毁、子弹销毁；飞船碰小行星 → 掉命、延迟复活、复活后无敌；任何物体越界 → 从对侧出现。注意两边都用 CompareTag 过滤，Asteroid 只认 Bullet、Player 只认 Asteroid，互不越界。' },
      { t: '⑥ 调手感：推力、转向与射速三个数',
        d: 'thrustSpeed 决定加速度（太小推不动、太大一碰就飞出屏）；rotationSpeed 是扭矩，配合角阻尼才停得下来；射速靠冷却时间而不是靠手速。这三个数没有标准答案，Unity 的做法是把它们做成 public / [SerializeField] 字段——这一课的浏览器版也保留了同样的常量名，建议你一个个改着试，感受每个数对"好不好玩"的影响有多大。' },
      { t: '⑦ 做流程：关卡递增与 Game Over',
        d: '场上石头清零 → 关卡 +1 → 生成更多石头（数量随关卡递增）。掉命后不立刻复活，而是延迟 respawnDelay 秒，复活时走 OnEnable 自动获得无敌时间。生命归零显示 Game Over 面板，按回车重开——重开时必须先销毁场上残留的所有小行星（FindObjectsOfType），否则新旧石头会叠在一起。' }
    ],

    transfer: [
      '「施力而非改位置 + 无阻力漂移」的速度模型 → 太空侵略者的飞船、打砖块的球（方向 × 速率）、乒乓的球速控制，本质上都是「把速度当成一个独立状态来管理」的变体。',
      '「递归生成必须有闸门」→ 炸弹人的链式爆炸、扫雷的连锁展开、2048 的连锁合并、粒子系统的分裂特效，全都是同一条：先算最坏情况下的层数与数量，再决定在哪一层截断。',
      '「刚生成就给无敌时间」→ 平台跳跃的复活保护帧、弹幕游戏的出生保护、Roguelike 的入场无敌，解决的是同一个问题：不要用"挪到安全位置"去回避碰撞，而要用状态去屏蔽它。'
    ]
  },

  /* =========================================================================
   * create(api) —— 可玩的浏览器复刻版
   *
   * 刻意与 Unity 版保持结构一致：
   *   Update 读输入 → FixedUpdate 施力/施扭矩 → 屏幕环绕 → 碰撞判定 → draw
   * 常量名也对应源码字段，方便对照阅读。
   * ======================================================================= */

  create: function (api) {

    /* ---------- 世界尺寸（逻辑坐标，与显示分辨率无关） ---------- */
    var W = 640, H = 360;

    /* ---------- 飞船参数（对应 Player.cs 的公开字段） ---------- */
    var THRUST = 170;        // 推进加速度 px/s²（对应 thrustSpeed，放大到像素量级）
    var TURN_ACC = 16;       // 转向角加速度 rad/s²（对应 rotationSpeed 的扭矩）
    var DRAG = 0.5;          // 极小线性阻尼；Unity 版 drag=0，这里为了可玩性补了一点
    var ANG_DRAG = 6.0;      // 角阻尼，让转向最终稳定在一个角速度上，不会越转越快
    var MAX_SP = 340;        // 限速（对应 FixedUpdate 里钳速度的思路）
    var SHIP_R = 11;         // 飞船碰撞半径

    /* ---------- 子弹参数（对应 Bullet.cs） ---------- */
    var FIRE_CD = 0.18;      // 射速冷却：Unity 版靠 GetKeyDown，浏览器里显式做冷却
    var BULLET_SPEED = 420;  // 对应 Bullet.speed
    var BULLET_LIFE = 1.1;   // 对应 Bullet.maxLifetime
    var BULLET_R = 2.5;

    /* ---------- 小行星参数（对应 Asteroid.cs） ---------- */
    var SIZE_L = 1.5, SIZE_M = 0.75, SIZE_S = 0.375;   // 三档尺寸
    var MIN_SIZE = 0.35;     // 对应 Asteroid.minSize —— 分裂的终止闸门
    var RAD_K = 20;          // 半径 = RAD_K × size
    var ROCK_LIFE = 40;      // 对应 Asteroid.maxLifetime

    /* ---------- 流程参数（对应 GameManager / Player） ---------- */
    var RESPAWN_DELAY = 2.0;  // 对应 Player.respawnDelay
    var INVULN = 2.0;         // 对应 Player.respawnInvulnerability

    /* ---------- 状态 ---------- */
    var ship = { x: W / 2, y: H / 2, vx: 0, vy: 0, ang: 0, angVel: 0,
                 alive: true, inv: 0, thrusting: false };
    var bullets = [];         // 对应场景里的 Bullet 实例
    var rocks = [];           // 对应场景里的 Asteroid 实例
    var parts = [];           // 爆炸粒子（对应 ParticleSystem）
    var score = 0, lives = 3, level = 1;
    var fireCd = 0;           // 射击冷却计时
    var respawnT = 0;         // 复活倒计时（对应 Invoke(nameof(Respawn), delay)）
    var over = false;
    var levelFlash = 0;       // 「第 N 关」横幅剩余时间
    var hintT = 6;            // 开局操作提示剩余时间
    var varT = 0, logGap = 0; // 变量/日志节流
    var ptrHold = false, ptrAim = null;

    /* ---------- 背景星空（纯装饰） ---------- */
    var stars = [];
    (function initStars() {
      for (var i = 0; i < 70; i++) {
        stars.push({ x: Math.random() * W, y: Math.random() * H,
                     b: 0.12 + Math.random() * 0.5, s: Math.random() < 0.2 ? 2 : 1 });
      }
    })();

    /* ================= 小工具 ================= */

    function rnd(a, b) { return a + Math.random() * (b - a); }

    // 飞船朝向：Unity 的 transform.up 在旋转 ang（逆时针为正）后是 (-sin, -cos)（换成 y 轴向下的画布坐标）
    function fwdX(a) { return -Math.sin(a); }
    function fwdY(a) { return -Math.cos(a); }

    /* ---------- 屏幕环绕：对应 Player.ScreenWrap ---------- */
    // armed=false 的物体（刚生成在屏幕外的小行星）先不参与环绕，等它真正进入屏幕再启用，
    // 否则刚生成在屏幕外就会被立刻传送到对侧。
    function wrapObj(o, m) {
      if (!o.armed) {
        if (o.x >= 0 && o.x <= W && o.y >= 0 && o.y <= H) o.armed = true;
        return false;
      }
      var wrapped = false;
      if (o.x > W + m) { o.x = -m; wrapped = true; }
      else if (o.x < -m) { o.x = W + m; wrapped = true; }
      if (o.y > H + m) { o.y = -m; wrapped = true; }
      else if (o.y < -m) { o.y = H + m; wrapped = true; }
      return wrapped;
    }

    /* ---------- 造一颗小行星：对应 Asteroid.Start 的随机外观 ---------- */
    function makeRock(x, y, size) {
      var n = 9 + Math.floor(Math.random() * 4);
      var verts = [];
      for (var i = 0; i < n; i++) verts.push(0.72 + Math.random() * 0.56);
      return {
        x: x, y: y, r: RAD_K * size, size: size,
        vx: 0, vy: 0,
        ang: Math.random() * Math.PI * 2,
        spin: rnd(-0.9, 0.9),
        verts: verts,
        life: ROCK_LIFE,
        armed: true
      };
    }

    /* ---------- 分裂：对应 Asteroid.CreateSplit ---------- */
    function spawnSplit(parent, size) {
      // 随机小偏移（对应 Random.insideUnitCircle * 0.5f），否则两块完全重叠会被物理弹开
      var a = Math.random() * Math.PI * 2;
      var off = Math.random() * 0.5 * parent.r;
      var rk = makeRock(parent.x + Math.cos(a) * off,
                        parent.y + Math.sin(a) * off, size);
      // 随机方向的新轨迹（对应 Random.insideUnitCircle.normalized）
      var ta = Math.random() * Math.PI * 2;
      var sp = rnd(38, 78);
      rk.vx = parent.vx + Math.cos(ta) * sp;
      rk.vy = parent.vy + Math.sin(ta) * sp;
      rocks.push(rk);
    }

    /* ---------- 生成一波：对应 AsteroidSpawner.Spawn ---------- */
    function spawnWave(n) {
      for (var i = 0; i < n; i++) {
        var side = Math.floor(Math.random() * 4);
        var m = 40;                       // 生成在屏幕外一点
        var x, y;
        if (side === 0)      { x = Math.random() * W; y = -m; }
        else if (side === 1) { x = Math.random() * W; y = H + m; }
        else if (side === 2) { x = -m; y = Math.random() * H; }
        else                 { x = W + m; y = Math.random() * H; }

        var t = Math.random();
        var size = t < 0.55 ? SIZE_L : (t < 0.9 ? SIZE_M : SIZE_S);
        var rk = makeRock(x, y, size);
        rk.armed = false;                 // 还没进屏幕，先不启用环绕

        // 朝屏幕中心飞 + ±15° 扰动（对应 trajectoryVariance）
        var ta = Math.atan2(H / 2 - y, W / 2 - x) + rnd(-15, 15) * Math.PI / 180;
        var sp = 32 + Math.random() * 24 + level * 2;
        rk.vx = Math.cos(ta) * sp;
        rk.vy = Math.sin(ta) * sp;
        rocks.push(rk);
      }
    }

    /* ---------- 爆炸粒子（对应 GameManager 的 explosionEffect） ---------- */
    function burst(x, y, n, color) {
      for (var i = 0; i < n && parts.length < 220; i++) {
        var a = Math.random() * Math.PI * 2;
        var s = rnd(40, 180);
        parts.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
                     life: rnd(0.35, 0.9), max: 0.9, c: color });
      }
    }

    /* ================= 流程 ================= */

    /* ---------- 开局：对应 GameManager.NewGame ---------- */
    function newGame(quiet) {
      rocks.length = 0;
      bullets.length = 0;
      parts.length = 0;
      score = 0; lives = 3; level = 1;
      over = false;
      respawnT = 0;
      fireCd = 0;
      levelFlash = 1.4;
      if (!quiet) hintT = 6;
      respawnShip(true);
      spawnWave(3);                       // 第 1 关 3 颗（2 + level）
      publish();
      if (!quiet) api.log('新一局开始：3 条命，第 1 关 ' + rocks.length + ' 颗小行星', 'sys');
    }

    /* ---------- 复活：对应 GameManager.Respawn + Player.OnEnable ---------- */
    function respawnShip(silent) {
      ship.x = W / 2; ship.y = H / 2;
      ship.vx = 0; ship.vy = 0;
      ship.angVel = 0; ship.ang = 0;
      ship.alive = true;
      ship.inv = INVULN;                  // 对应 OnEnable 里关碰撞 + Invoke 恢复
      if (!silent) {
        api.hit('GameManager.cs', 157);
        api.log('复活：回到原点，先关碰撞 ' + INVULN + 's（无敌保护）', 'ok');
      }
    }

    /* ---------- 发射：对应 Player.Shoot ---------- */
    function fire() {
      if (over || !ship.alive || fireCd > 0) return;
      fireCd = FIRE_CD;
      var fx = fwdX(ship.ang), fy = fwdY(ship.ang);
      bullets.push({
        x: ship.x + fx * (SHIP_R + 3),
        y: ship.y + fy * (SHIP_R + 3),
        vx: fx * BULLET_SPEED,
        vy: fy * BULLET_SPEED,
        life: BULLET_LIFE,
        armed: true
      });
      // 射击日志节流，避免按住空格把控制台刷爆
      if (logGap <= 0) {
        logGap = 0.35;
        api.hit('Player.cs', 157);
        api.log('发射子弹 · 方向 (' + fx.toFixed(2) + ', ' + fy.toFixed(2) +
                ') · 存活 ' + BULLET_LIFE + 's', 'ok');
      }
    }

    /* ---------- 击毁一颗小行星：对应 Asteroid.OnCollisionEnter2D ---------- */
    function destroyRock(idx) {
      var r = rocks[idx];
      rocks.splice(idx, 1);
      burst(r.x, r.y, 8 + Math.round(r.size * 6), '#fbbf24');

      // 加分：对应 GameManager.OnAsteroidDestroyed 的尺寸分级
      var pts = r.size < 0.7 ? 100 : (r.size < 1.4 ? 50 : 25);
      score += pts;

      var half = r.size * 0.5;
      if (half >= MIN_SIZE) {
        spawnSplit(r, half);
        spawnSplit(r, half);
        api.hit('Asteroid.cs', 92);
        api.log('命中 size ' + r.size.toFixed(2) + ' → 分裂成 2 块 ' + half.toFixed(2) +
                '，+' + pts + ' 分', 'ok');
      } else {
        api.hit('Asteroid.cs', 37);
        api.log('击毁最小档 size ' + r.size.toFixed(2) + '（半尺寸 ' + half.toFixed(3) +
                ' < minSize ' + MIN_SIZE + '，不再分裂），+' + pts + ' 分', 'warn');
      }
    }

    /* ---------- 飞船被撞：对应 Player.OnCollisionEnter2D → GameManager.OnPlayerDeath ---------- */
    function killShip() {
      ship.alive = false;
      ship.vx = 0; ship.vy = 0; ship.angVel = 0;   // 对应 Player.cs:181 清零速度
      burst(ship.x, ship.y, 18, '#fca5a5');
      api.hit('Player.cs', 178);
      api.log('飞船撞上小行星 → 速度清零，进入死亡流程', 'err');

      lives--;
      if (lives <= 0) {
        over = true;
        api.hit('GameManager.cs', 153);
        api.log('生命耗尽 —— GAME OVER（按 R 重开）最终得分 ' + score, 'err');
      } else {
        respawnT = RESPAWN_DELAY;
        api.hit('GameManager.cs', 157);
        api.log('剩余生命 ' + lives + '，' + RESPAWN_DELAY + 's 后复活', 'warn');
      }
    }

    /* ================= 每帧更新（对应 Update + FixedUpdate） ================= */

    function update(dt, keys, api) {

      logGap -= dt;
      hintT -= dt;
      levelFlash -= dt;

      /* 粒子始终推进，这样 Game Over 时死亡爆炸也能播完 */
      var pi;
      for (pi = parts.length - 1; pi >= 0; pi--) {
        var p = parts[pi];
        p.life -= dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vx -= p.vx * 1.6 * dt; p.vy -= p.vy * 1.6 * dt;
        if (p.life <= 0) parts.splice(pi, 1);
      }

      if (over) return;

      if (fireCd > 0) fireCd -= dt;

      /* --- 复活倒计时：对应 Invoke(nameof(Respawn), respawnDelay) --- */
      if (respawnT > 0) {
        respawnT -= dt;
        if (respawnT <= 0) respawnShip(false);
      }

      /* --- 无敌倒计时：对应 Invoke(nameof(TurnOnCollisions), respawnInvulnerability) --- */
      if (ship.inv > 0) {
        ship.inv -= dt;
        if (ship.inv <= 0) {
          api.hit('Player.cs', 171);
          api.log('无敌结束 → 飞船回到 Player 层，碰撞恢复', 'info');
        }
      }

      /* --- 输入：对应 Player.Update --- */
      var thrusting = !!keys.up || ptrHold;
      var turnDir = 0;
      if (keys.left) turnDir = 1;
      else if (keys.right) turnDir = -1;
      if (keys.fire) fire();

      if (ship.alive) {
        /* --- 物理：对应 Player.FixedUpdate --- */
        if (thrusting) {
          ship.vx += fwdX(ship.ang) * THRUST * dt;   // 对应 rb.AddForce(transform.up * thrustSpeed)
          ship.vy += fwdY(ship.ang) * THRUST * dt;
        }
        ship.thrusting = thrusting;

        if (turnDir !== 0) {
          ship.angVel += turnDir * TURN_ACC * dt;    // 对应 rb.AddTorque(rotationSpeed * turnDirection)
        } else if (ptrAim && !keys.left && !keys.right) {
          // 触屏/鼠标：朝指针方向转向（简易 PD，保留扭矩的手感）
          var d = ptrAim - ship.ang;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          ship.angVel += (d * 6 - ship.angVel) * Math.min(1, dt * 8);
        }
        ship.angVel -= ship.angVel * ANG_DRAG * dt;  // 角阻尼：不让转向无限加速
        ship.ang += ship.angVel * dt;

        ship.vx -= ship.vx * DRAG * dt;              // 极小线性阻尼，保留惯性但可收住
        ship.vy -= ship.vy * DRAG * dt;

        var sp = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
        if (sp > MAX_SP) {
          ship.vx = ship.vx / sp * MAX_SP;
          ship.vy = ship.vy / sp * MAX_SP;
        }

        ship.x += ship.vx * dt;
        ship.y += ship.vy * dt;
        if (wrapObj(ship, SHIP_R + 4)) {             // 对应 ScreenWrap
          api.hit('Player.cs', 135);
          api.log('飞船屏幕环绕 → 从对侧出现', 'info');
        }
      } else {
        ship.thrusting = false;
      }

      /* --- 子弹：对应 Bullet.Shoot 后的一次性初速度 + maxLifetime --- */
      var i;
      for (i = bullets.length - 1; i >= 0; i--) {
        var b = bullets[i];
        b.x += b.vx * dt; b.y += b.vy * dt;
        b.life -= dt;
        wrapObj(b, BULLET_R + 2);
        if (b.life <= 0) bullets.splice(i, 1);
      }

      /* --- 小行星：匀速漂移（drag=0，只推一次力） --- */
      for (i = rocks.length - 1; i >= 0; i--) {
        var rk = rocks[i];
        rk.x += rk.vx * dt; rk.y += rk.vy * dt;
        rk.ang += rk.spin * dt;
        rk.life -= dt;
        wrapObj(rk, rk.r + 4);
        if (rk.life <= 0) {
          rocks.splice(i, 1);
          api.log('小行星存活超过 maxLifetime(' + ROCK_LIFE + 's) 自动销毁，补充一颗', 'info');
          spawnWave(1);
        }
      }

      /* --- 碰撞：子弹 × 小行星（对应 Asteroid.OnCollisionEnter2D 只认 Bullet） --- */
      for (i = bullets.length - 1; i >= 0; i--) {
        var bl = bullets[i];
        var hitIdx = -1;
        for (var j = 0; j < rocks.length; j++) {
          var rr = rocks[j];
          var dx = bl.x - rr.x, dy = bl.y - rr.y;
          if (dx * dx + dy * dy <= (rr.r + BULLET_R) * (rr.r + BULLET_R)) { hitIdx = j; break; }
        }
        if (hitIdx >= 0) {
          bullets.splice(i, 1);          // 对应 Bullet.OnCollisionEnter2D：一碰即毁
          destroyRock(hitIdx);
        }
      }

      /* --- 碰撞：飞船 × 小行星（无敌期与死亡期直接跳过） --- */
      if (ship.alive && ship.inv <= 0) {
        for (i = 0; i < rocks.length; i++) {
          var r2 = rocks[i];
          var ddx = ship.x - r2.x, ddy = ship.y - r2.y;
          var rad = r2.r + 9;
          if (ddx * ddx + ddy * ddy <= rad * rad) { killShip(); break; }
        }
      }

      /* --- 过关：清空全场 → 关卡 +1 → 生成更多（对应 AsteroidSpawner） --- */
      if (!over && rocks.length === 0) {
        level++;
        var n = Math.min(2 + level, 7);
        spawnWave(n);
        levelFlash = 1.4;
        api.hit('AsteroidSpawner.cs', 70);
        api.log('清空小行星 → 第 ' + level + ' 关，刷新 ' + n + ' 颗（数量随关卡递增）', 'sys');
      }

      /* --- 关键状态推给底部面板（约 7Hz，别每帧刷 DOM） --- */
      varT += dt;
      if (varT >= 0.14) { varT = 0; publish(); }
    }

    function publish() {
      var sp = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
      var deg = ((ship.ang * 180 / Math.PI) % 360 + 360) % 360;
      api.vars({
        'score': score,
        'lives': lives,
        'level': level,
        'asteroids': rocks.length,
        'bullets': bullets.length,
        'ship.speed': sp.toFixed(0),
        'ship.angle': deg.toFixed(0) + '°',
        'ship.thrusting': ship.thrusting ? 'yes' : 'no',
        'ship.inv': ship.inv > 0 ? ship.inv.toFixed(1) + 's' : '—',
        'ship.state': ship.alive ? 'alive' : (over ? 'gameover' : 'dead')
      });
    }

    /* ================= 渲染 ================= */

    function draw(ctx, api) {

      /* 背景 + 星空 */
      ctx.fillStyle = '#070b16';
      ctx.fillRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i];
        ctx.fillStyle = 'rgba(226,232,240,' + st.b.toFixed(2) + ')';
        ctx.fillRect(st.x, st.y, st.s, st.s);
      }

      /* 小行星 */
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      for (var k = 0; k < rocks.length; k++) {
        var r = rocks[k];
        var n = r.verts.length;
        ctx.beginPath();
        for (var v = 0; v < n; v++) {
          var a = r.ang + v / n * Math.PI * 2;
          var rr = r.r * r.verts[v];
          var px = r.x + Math.cos(a) * rr;
          var py = r.y + Math.sin(a) * rr;
          if (v === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(30,41,59,.85)';
        ctx.fill();
        ctx.strokeStyle = r.size > 1.2 ? '#cbd5e1' : (r.size > 0.6 ? '#94a3b8' : '#64748b');
        ctx.stroke();
      }

      /* 子弹 */
      for (var b = 0; b < bullets.length; b++) {
        var bu = bullets[b];
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(bu.x, bu.y, BULLET_R, 0, Math.PI * 2);
        ctx.fill();
      }

      /* 爆炸粒子 */
      for (var p = 0; p < parts.length; p++) {
        var pt = parts[p];
        ctx.globalAlpha = Math.max(0, pt.life / pt.max);
        ctx.fillStyle = pt.c;
        ctx.fillRect(pt.x - 1.5, pt.y - 1.5, 3, 3);
      }
      ctx.globalAlpha = 1;

      /* 飞船（无敌时闪烁提示） */
      if (ship.alive) {
        var blink = ship.inv > 0 && (Math.floor(ship.inv * 10) % 2 === 0);
        if (!blink) {
          ctx.save();
          ctx.translate(ship.x, ship.y);
          ctx.rotate(-ship.ang);          // 画布 y 轴向下，所以取负号才对齐 Unity 的逆时针为正
          ctx.beginPath();
          ctx.moveTo(0, -SHIP_R);
          ctx.lineTo(SHIP_R * 0.72, SHIP_R * 0.8);
          ctx.lineTo(0, SHIP_R * 0.42);
          ctx.lineTo(-SHIP_R * 0.72, SHIP_R * 0.8);
          ctx.closePath();
          ctx.fillStyle = ship.inv > 0 ? 'rgba(110,231,183,.9)' : '#38bdf8';
          ctx.fill();
          if (ship.thrusting) {           // 尾焰：推进时才画
            ctx.beginPath();
            ctx.moveTo(-SHIP_R * 0.45, SHIP_R * 0.8);
            ctx.lineTo(0, SHIP_R * 1.5 + Math.random() * 7);
            ctx.lineTo(SHIP_R * 0.45, SHIP_R * 0.8);
            ctx.closePath();
            ctx.fillStyle = '#fb923c';
            ctx.fill();
          }
          ctx.restore();
        }
      }

      /* ---------- HUD ---------- */
      ctx.font = '600 14px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.textBaseline = 'alphabetic';

      ctx.textAlign = 'left';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('分数 ' + score, 14, 24);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('第 ' + level + ' 关', W / 2, 24);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('生命', W - 14 - lives * 16, 24);
      for (var L = 0; L < lives; L++) {   // 用小飞船图标表示剩余生命
        var lx = W - 16 - L * 16, ly = 19;
        ctx.beginPath();
        ctx.moveTo(lx, ly - 6);
        ctx.lineTo(lx + 4.5, ly + 5);
        ctx.lineTo(lx - 4.5, ly + 5);
        ctx.closePath();
        ctx.fillStyle = '#f87171';
        ctx.fill();
      }

      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(148,163,184,.7)';
      ctx.font = '12px -apple-system, "PingFang SC", sans-serif';
      ctx.fillText('剩余小行星 ' + rocks.length, 14, H - 12);

      /* ---------- 提示 / 横幅 ---------- */
      ctx.textAlign = 'center';
      if (hintT > 0 && !over) {
        ctx.globalAlpha = Math.min(1, hintT / 2);
        ctx.fillStyle = '#64748b';
        ctx.font = '13px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('↑ 推进（松手会继续漂）  ←→ 转向  空格 / 点击 发射', W / 2, H - 14);
        ctx.globalAlpha = 1;
      }

      if (levelFlash > 0 && !over) {
        ctx.fillStyle = '#6ee7b7';
        ctx.font = '600 26px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('第 ' + level + ' 关', W / 2, H / 2 - 30);
      }

      if (ship.inv > 0 && !over) {
        ctx.fillStyle = '#6ee7b7';
        ctx.font = '13px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('无敌 ' + ship.inv.toFixed(1) + 's', W / 2, H / 2 + 4);
      }

      if (!ship.alive && respawnT > 0 && !over) {
        ctx.fillStyle = '#fca5a5';
        ctx.font = '600 16px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('被击毁 · ' + respawnT.toFixed(1) + 's 后复活', W / 2, H / 2);
      }

      if (over) {
        ctx.fillStyle = 'rgba(7,11,22,.72)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fca5a5';
        ctx.font = '600 30px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 8);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('得分 ' + score + ' · 第 ' + level + ' 关 · 按 R 重开', W / 2, H / 2 + 22);
      }
    }

    /* ================= 指针 / 触屏 ================= */

    function aimAt(x, y) {
      // 目标朝向：让 forward = (-sin, -cos) 指向指针
      ptrAim = Math.atan2(-(x - ship.x), -(y - ship.y));
    }

    /* ================= 对外接口 ================= */

    newGame(true);            // 载入即开局（静默，不往控制台写）

    return {
      w: W, h: H,
      reset: function () {
        newGame(false);
        api.log('已重置 —— 分数归零，生命恢复 3，回到第 1 关', 'sys');
      },
      update: update,
      draw: draw,
      /* 鼠标左键 / 触摸 = 发射（对应 Input.GetMouseButtonDown(0)）；按住同时推进，方便触屏玩 */
      onPointer: function (x, y, down, api) {
        if (down) { ptrHold = true; aimAt(x, y); fire(); }
      },
      onPointerMove: function (x, y, api) { aimAt(x, y); },
      onPointerUp: function (api) { ptrHold = false; },
      onKey: function (k, down, api) {
        if (k === 'fire' && down) {
          if (over) api.log('游戏已结束 —— 按 R 重开', 'warn');
          else fire();
        }
      }
    };
  }
});
