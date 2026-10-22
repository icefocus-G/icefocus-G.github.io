/* =============================================================================
 * Space Invaders · 太空侵略者
 * -----------------------------------------------------------------------------
 * 本文件三部分：
 *   1) create(api) —— 浏览器里可玩的 Canvas 复刻版（与 Unity 版逻辑一一对应）
 *   2) notes       —— 逐句讲解：「为什么这么写」
 *   3) think       —— 开发思维与步骤拆解
 *
 * 浏览器版与 Unity 版的对应关系：
 *   Invaders.cs    → 方阵容器 gridX/gridY（整体平移 + 触边下压）+ 定时开火
 *   Invader.cs     → aliens[] 里每个士兵（两帧动画 + 分值 + 被击落回调）
 *   Player.cs      → 玩家飞船（左右移动 + 一次只允许一发激光）
 *   Projectile.cs  → laser / missiles[]（匀速直飞 + 命中判定）
 *   Bunker.cs      → 4 个掩体，各自持有一张离屏「纹理」，按纹素擦除
 *   MysteryShip.cs → 定时从一侧飞过的加分目标
 *   GameManager.cs → 分数 / 生命 / 关卡 / 回合流程
 * ========================================================================== */

UG_LESSON('spaceinvaders', {

  /* ---------------- 元数据 ---------------- */

  name: '太空侵略者 Space Invaders',
  ico: '👾',
  difficulty: 3,
  tags: ['方阵移动', '协程', '像素级破坏', '掩体'],
  controls: '← → / A D 左右移动，空格（或鼠标点击）发射激光 —— 一次只允许一发在场。R 重开整局。',
  oneLiner: '55 个外星人不是 55 个 AI，而是一个整体：整群左右横扫、触边统一下压一行，越打越快；掩体不是血条，而是一张会被逐像素啃掉的贴图。',

  /* ---------------- 逐句讲解：文件名 → 行号 → 讲解 ---------------- */

  notes: {

    'Invaders.cs': {
      72: 'Instantiate 的第二个参数 transform = 把新生成的外星人挂成自己的子物体。这是「整群移动」能成立的根本：每个外星人的 localPosition 建好后再也不改，只要父物体（Invaders 空物体）平移，55 个子物体就整体跟着走。反过来想，如果给每个外星人写一个独立 AI 各自寻路，既费性能，队形还会走散，经典太空侵略者那种「整齐压迫感」就没了。',
      86: '用 InvokeRepeating 定时开火，而不是在 Update 里每帧 Random：每帧判随机会让发射频率跟帧率绑死（高帧率机器弹幕翻倍、低帧率几乎不开火），不同机器上完全是两种难度。定时调用把「开火节奏」从渲染帧里摘了出来 —— 这就是本作里最轻量的协程思路，不写 IEnumerator 也能拿到「每隔 N 秒做一次」的语义。',
      112: '概率取 1/存活数，是「波纹式开火」的关键。一次 MissileAttack 里逐个遍历存活外星人，每个以 1/N 的概率通过，命中即 break，所以每次最多只发一发：N 大时单个概率低、N 小时残兵更容易突然来一发，整体频率大致恒定但落点随机，看起来就像方阵在一圈一圈轮流开火。若写成固定概率，敌人越多弹幕越密，玩家会被瞬间秒掉。',
      131: '用 AnimationCurve 按「已击杀百分比」取速度，而不是写死常数：方阵被清空得越多，曲线给出的速度越高，越打越快。这是本作难度曲线的灵魂 —— 压力不是靠加敌人数量堆出来的，而是同一批敌人「变快」，成本极低、效果极好。做成曲线还能在 Inspector 里直接拖控制点调参，不用改代码。',
      132: '整群平移，一行搞定 55 个目标的移动：一次 transform.position += 就够，既省性能，又保证队形永远整齐（不会出现某个个体走快了突出队外）。direction 是整群共用的一个向量，所以「转向」也只是一个赋值就能全体生效 —— 这和上面第 72 行的父子结构是配套的。',
      170: '只翻转 direction.x、y 分量置 0：方阵只在水平方向折返，垂直方向永远只有「下压一行」这一个动作。这才形成经典的「左右横扫 + 触边下降」节奏，玩家能预判下一步走到哪。如果允许上下自由移动，就变成无法预判的乱飞，紧张感反而变成烦躁感。'
    },

    'Bunker.cs': {
      51: '每个掩体必须先复制一份独立纹理再改。Sprite 默认是共享 Texture2D 的：直接在原图上 GetPixel/SetPixel，场景里四个掩体会同时长出同一个弹坑，破坏「串味」。ResetBunker 每局都从 originalTexture 重新拷一份干净副本，所以新回合的掩体永远是完好的 —— 记住这条：凡是要「在源头改数据」，先确认这份数据是你独占的。',
      96: '命中点先过 CheckPoint：只有落在 alpha 非 0 的实体像素上才算命中。已经被打穿的空洞 alpha=0，此时返回 false，子弹不销毁、继续飞过去（配合 Projectile.cs 第 56 行的「或」逻辑）。少了这一步，打在空洞上子弹也会消失，掩体会变成一堵看不见的墙，玩家会觉得手感很怪。',
      126: '纹素级（per-texel）破坏的核心一行：把掩体纹素的 alpha 与弹坑贴图同位置纹素的 alpha 相乘。弹坑中心 alpha=0 → 掩体该点 alpha 被抹成 0（彻底打穿）；弹坑边缘 alpha 渐变 → 出现半透明的崩边。用「相乘」而不是「直接赋值 0」，是因为相乘天然保留掩体自身的形状轮廓，啃出来的缺口是跟着贴图走的，比拿圆形橡皮擦硬擦真实得多。',
      135: '改完像素必须 Apply()。GetPixel/SetPixel 只改 CPU 端的像素数组，不 Apply 就不会上传 GPU，屏幕上什么都不会变 —— 这是 Unity 纹理操作最常见的坑。代价是 Apply 有开销，所以整块 splat 双层循环结束后只调一次，绝不能每个像素调一次；这一点在浏览器版里对应「循环结束后 putImageData 一次」。'
    },

    'MysteryShip.cs': {
      112: 'Despawn 后用 Invoke 预约 cycleTime 秒再出现，而不是让它常驻场上、或用每帧计时器：常驻就变成一个固定靶子，玩家随时能刷分，「惊喜奖励」的意义全没了。定时 + 交替方向 + 飞出即离场，才形成「来了就得抓住机会」的节奏。注意它和 GameManager 的延迟重生、Invaders 的定时开火是同一招：把「等待」交给引擎的调度，而不是自己累加时间。'
    },

    'GameManager.cs': {
      160: '通关判定放在「击落回调」里，而不是每帧轮询存活数：只有击落事件才可能让存活数归零，所以在这个唯一入口检查 GetAliveCount()==0 最省事，也不会出现「清空后要等一帧才进下一关」的迟滞。这是「在状态变化的那一刻处理状态转移」的典型写法 —— 扫描雷区、2048 的合并检测都是同一个思路。'
    },

    'Player.cs': {
      52: 'laser == null 才允许发射：一次只允许一发在场，靠 Projectile 命中或飞出后自我销毁来把引用清空。这条限制是太空侵略者手感的灵魂 —— 允许连发的话，玩家能铺满屏幕，游戏立刻失去难度。另外注意用的是 GetKeyDown（按下的那一帧）而不是 GetKey，长按不会自动连发。'
    },

    'Projectile.cs': {
      56: '「对方不是掩体」或「打中掩体且确实啃掉了像素」才销毁自己。这个「或」是精心设计的：打中普通目标一律销毁；打中掩体时若落在已打穿的空洞（CheckCollision 返回 false），子弹不消失、继续飞过去。于是掩体会被一点点打穿，最后形成能穿行的通道 —— 掩体玩法的所有乐趣都来自这个「或」。'
    }
  },

  /* ---------------- 开发思维与步骤 ---------------- */

  think: {
    core: [
      '第一课要装进脑子的是「整体思维」：55 个外星人不是一个一个的敌人，而是一个整体。源码里它们全是 Invaders 容器的子物体，移动只改父物体的 position，转向只改一个共用 direction，开火由一个定时器统一调度。当你发现一群东西行为高度一致时，先问一句「能不能把它们当成一个对象」—— 一旦答案是能，代码量、性能开销和 bug 面都会同时塌下来。',
      '第二课是「把节奏从帧率里摘出来」。凡是「每隔一段时间做一次」（开火、神秘飞船出现）或「等一会儿再做」（死亡后 1 秒重生），都用 Invoke / InvokeRepeating 这类调度表达，而不是在 Update 里每帧 Random 或自己累加计时器。前者在任何机器上节奏一致，后者会让高帧率机器难度翻倍 —— 这是新手最容易踩、也最难自查的坑。',
      '第三课是「在数据源头改，让表现自己跟上」，外加「只广播、不决策」。掩体没有血条、没有 damage 字段，它直接改纹理的 alpha，画面自然就缺了一块；Invader / Player / MysteryShip 被撞到时只喊一声「我被打了」，分数、生命、回合切换全由 GameManager 一个地方决定。前者省掉了同步逻辑，后者让规则永远只有一份。'
    ],

    steps: [
      { t: '① 定规则：一句话说清输赢',
        d: '打光全部外星人进下一关（更快）；外星人下压到触底线、导弹或外星人撞到玩家 = 掉一条命；3 条命用完 = Game Over。掩体是消耗品，会被双方的子弹一点点啃穿。写不出这句话就先别动手。' },
      { t: '② 搭世界：先把边界换算出来',
        d: '源码里到处是 Camera.main.ViewportToWorldPoint(Vector3.zero/right)（Invaders.cs 137、Player.cs 42、MysteryShip.cs 41）—— 先把「屏幕左边缘 / 右边缘的世界坐标」算出来，触边下压、玩家夹取、神秘飞船进出口才有统一依据。浏览器版里就是固定的 16 ~ W-16 这两个数。' },
      { t: '③ 造角色：一个容器 + 三种个体',
        d: 'Invaders 空物体负责排 5×11 网格（间距 2 单位、居中偏移）；每个 Invader 只有三件事 —— 两帧走路动画、分值、被撞到时通知总控；Player 只有左右移动 + 一发激光。注意个体的 localPosition 建好后就不再改，移动全交给父物体。' },
      { t: '④ 建循环：整体平移 + 匀速直飞',
        d: 'Invaders.Update 每帧做三件事：算击杀百分比 → 用曲线取速度 → 整群平移 → 检查最边缘个体是否触边（触边就翻转 + 下压一行）。Projectile.Update 只沿 direction 匀速走。两者的速度都乘 Time.deltaTime，保证帧率无关。' },
      { t: '⑤ 定交互：用图层分派，掩体走特殊分支',
        d: 'Laser / Missile / Invader / Boundary 四个图层把碰撞分流（Invader.cs 59、Player.cs 57、MysteryShip.cs 115）。唯独掩体不是「撞到就消失」：Projectile.CheckCollision 把命中点交给 Bunker.CheckCollision，命中点 + 上下左右四个边缘点逐个做纹素检测，落在实体像素上才啃掉一块并销毁子弹。' },
      { t: '⑥ 调手感：三个旋钮决定难度曲线',
        d: '旋钮一：speed 曲线（杀得越多越快）；旋钮二：开火概率 1/存活数（保证弹幕密度恒定、落点随机）；旋钮三：splat 弹坑贴图的大小（决定掩体几发被打穿）。这三个值都不改任何规则，只改数值就能把游戏从「太简单」调到「太难」，调手感一定要留成可配置字段。' },
      { t: '⑦ 做流程：三层状态 + 唯一的规则入口',
        d: 'NewGame（清分数生命）→ NewRound（复位掩体 / 玩家，必要时复位方阵）→ Respawn（只把玩家挪回中间）。所有死亡、击落、通关都回调到 GameManager，由它决定是掉命、进下一关还是 Game Over；复活一律走 Invoke 延迟 1 秒。注意源码里 NewRound 会把方阵也一起复活（死一次就要重打整波），本演示版只在「触底 / 过关」时整波重置，方便连续观察清空 → 下一关。' }
    ],

    transfer: [
      '「父物体带动子物体」的整体移动 → 蜈蚣的整条蛇身、贪吃蛇的队列推进、俄罗斯方块的整块旋转，都是「改一个，其余自动跟随」。',
      '「Invoke / InvokeRepeating 把节奏从帧率里摘出来」→ 炸弹人的引信倒计时、打砖块的道具生成、任何「每隔 N 秒做一次」的需求，都该先想到调度而不是每帧轮询。',
      '「在源头改数据，表现自动跟上」→ 扫雷的格子状态、2048 的棋盘数组、像素游戏的破坏地形：先改数据，再让渲染读数据，永远比「边画边改」好维护。'
    ]
  },

  /* =========================================================================
   * create(api) —— 可玩的浏览器复刻版
   * ======================================================================= */

  create: function (api) {

    /* ---------- 世界尺寸（逻辑坐标，与显示分辨率无关） ---------- */
    var W = 640, H = 400;
    var HUD = 34;                     // 顶部 HUD 高度，以下是战斗区

    /* ---------- 方阵参数：5 行 × 11 列（与源码 rows/columns 一致） ---------- */
    var ROWS = 5, COLS = 11;
    var CW = 30, CH = 24;             // 每格宽高（对应源码的 2 单位间距）
    var IW = 22, IH = 16;             // 单个外星人的碰撞盒
    var GX0 = (W - COLS * CW) / 2;    // 方阵初始左上角 x（居中）
    var GY0 = 56;                     // 方阵初始左上角 y
    var STEP_DOWN = 14;               // 触边下压一行的距离（对应源码 y -= 1f）

    var MINSPD = 18, MAXSPD = 110;    // 方阵速度区间（对应 AnimationCurve 的取值）
    var LINE_Y = 346;                 // 触底线：外星人越过它就判失败

    /* ---------- 玩家 ---------- */
    var PY = 374, PW = 26, PH = 14;
    var PSPEED = 300;                 // 移动速度（像素/秒）

    /* ---------- 掩体（4 个，各自持有一张独立「纹理」） ---------- */
    var BW = 64, BH = 40, BY = 292;   // 纹素尺寸 = 逻辑尺寸，1 纹素 = 1 像素
    var BX = [48, 208, 368, 528];

    /* ---------- 子弹 ---------- */
    var LASER_SPD = 430;              // 玩家激光（向上）
    var MISSILE_SPD = 175;            // 外星人导弹（向下）
    var LW = 3, LH = 14, MW = 3, MH = 12;

    /* ---------- 外星人像素图案（11×8 的点阵，×2 放大成 22×16） ---------- */
    var SPR = {
      /* 顶排：鱿鱼 */
      squid: [
        ['....###....', '...#####...', '..#######..', '.##.###.##.',
         '###########', '..#.###.#..', '.#.......#.', '..#.....#..'],
        ['....###....', '...#####...', '..#######..', '.##.###.##.',
         '###########', '..#.###.#..', '..#.#.#.#..', '...#...#...']
      ],
      /* 中两排：螃蟹 */
      crab: [
        ['..#.....#..', '...#...#...', '..#######..', '.##.###.##.',
         '###########', '#.#######.#', '#.#.....#.#', '...##.##...'],
        ['..#.....#..', '#..#...#..#', '#.#######.#', '###.###.###',
         '###########', '.#########.', '..#.....#..', '.#.......#.']
      ],
      /* 底两排：章鱼 */
      oct: [
        ['....###....', '.#########.', '###########', '###..#..###',
         '###########', '..##...##..', '.##.....##.', '##.......##'],
        ['....###....', '.#########.', '###########', '###..#..###',
         '###########', '...##.##...', '..##...##..', '.##.....##.']
      ]
    };
    /* 每排的图案 / 颜色 / 分值（r=0 是最上面一排） */
    var ROW_SPR = [SPR.squid, SPR.crab, SPR.crab, SPR.oct, SPR.oct];
    var ROW_COL = ['#f9a8d4', '#fcd34d', '#86efac', '#7dd3fc', '#c4b5fd'];
    var ROW_SCORE = [30, 20, 20, 10, 10];

    /* ---------- 运行时状态 ---------- */
    var aliens = [];                  // {r,c,alive,spr,col,score}
    var gridX = GX0, gridY = GY0;     // 方阵容器位置（对应 Invaders 的 transform.position）
    var dir = 1;                      // 1 = 向右（Vector3.right），-1 = 向左
    var downSteps = 0;                // 已下压行数，用来额外加压
    var frame = 0, animT = 0;         // 两帧走路动画

    var missiles = [];                // 外星人导弹
    var laser = null;                 // 玩家激光（同时只允许一发）

    var bunkers = [];                 // 掩体数组

    var score = 0, lives = 3, level = 1;
    var playerX = W / 2, playerAlive = true;
    var respawnT = 0;                 // 死亡后 1 秒重生的倒计时
    var waveReset = true;             // 下一回合是否连外星人整波一起复位
    var over = false;

    var missileT = 0;                 // 开火定时器（对应 InvokeRepeating）
    var firePressed = false;          // 空格的「按下那一帧」边沿

    var mystery = { active: false, x: 0, y: 46, dir: -1, wait: 8, w: 44, h: 16 };

    var banner = '', bannerT = 0;
    var varT = 0, splatLogT = 0, holeLogT = 0;

    /* =====================================================================
     * 掩体：一张离屏「纹理」，按纹素读写（对应 Texture2D.GetPixel/SetPixel/Apply）
     * =================================================================== */

    function buildBunkerTex() {
      var cv = document.createElement('canvas');
      cv.width = BW; cv.height = BH;
      var c = cv.getContext('2d');
      var img = c.createImageData(BW, BH);
      var d = img.data, i = 0;

      for (var y = 0; y < BH; y++) {
        for (var x = 0; x < BW; x++) {
          var solid = 1;

          /* 顶部两个角切出斜边，做出经典掩体的梯形轮廓 */
          if (x < 14 && y < 14 - x) solid = 0;
          if (x > BW - 15 && y < 14 - (BW - 1 - x)) solid = 0;

          /* 底部中央挖一个拱门（椭圆），玩家可以从下面钻过去射击 */
          var dy = BH - 1 - y;
          if (dy < 16) {
            var dx = Math.abs(x - (BW - 1) / 2);
            var nx = dx / 15, ny = dy / 16;
            if (nx * nx + ny * ny < 1) solid = 0;
          }

          d[i] = 74; d[i + 1] = 222; d[i + 2] = 128;
          d[i + 3] = solid ? 255 : 0;         // alpha 就是「这里有没有掩体」
          i += 4;
        }
      }
      c.putImageData(img, 0, 0);
      return { cv: cv, ctx: c, data: img };   // data = 纹素数组（CPU 端）
    }

    /* ResetBunker：从原始纹理重新拷一份干净副本（Bunker.cs 46~55） */
    function resetBunkers() {
      bunkers = [];
      for (var i = 0; i < BX.length; i++) {
        var t = buildBunkerTex();
        bunkers.push({ x: BX[i], y: BY, w: BW, h: BH, active: true,
                       cv: t.cv, ctx: t.ctx, data: t.data });
      }
    }

    /* CheckPoint：把命中点换算成纹素坐标，并判断该纹素是不是实体（Bunker.cs 140~162） */
    function bunkerTexel(b, x, y, out) {
      out.px = Math.floor((x - b.x) / b.w * BW);
      out.py = Math.floor((y - b.y) / b.h * BH);
      if (out.px < 0 || out.py < 0 || out.px >= BW || out.py >= BH) return false;
      return b.data.data[(out.py * BW + out.px) * 4 + 3] !== 0;   // alpha != 0 → 实体
    }

    /* Splat：用一张圆形「弹坑」去乘掉掩体纹素的 alpha（Bunker.cs 92~138） */
    var _tp = { px: 0, py: 0 };
    function splat(b, px, py) {
      var d = b.data.data;
      var r = 6 + Math.random() * 2;                 // 弹坑半径，带点随机更有机
      var x0 = Math.max(0, Math.floor(px - r - 1)), x1 = Math.min(BW - 1, Math.ceil(px + r + 1));
      var y0 = Math.max(0, Math.floor(py - r - 1)), y1 = Math.min(BH - 1, Math.ceil(py + r + 1));

      for (var y = y0; y <= y1; y++) {
        for (var x = x0; x <= x1; x++) {
          var idx = (y * BW + x) * 4 + 3;
          var a = d[idx];
          if (!a) continue;                          // 已经是空洞，不用再啃
          var dx = x - px, dy = y - py;
          var dist = Math.sqrt(dx * dx + dy * dy);
          /* 弹坑中心 alpha=0（打穿），外圈 alpha=1（保留），中间渐变 */
          var f = dist <= r * 0.45 ? 0 : (dist >= r ? 1 : (dist - r * 0.45) / (r * 0.55));
          f += (Math.random() - 0.5) * 0.25;         // 抖动出锯齿边缘
          if (f < 0) f = 0;
          if (f > 1) f = 1;
          d[idx] = Math.round(a * f);                // alpha 相乘（核心那一行）
        }
      }
      b.ctx.putImageData(b.data, 0, 0);              // 对应 texture.Apply()
    }

    /* CheckCollision：命中点 + 上下左右四个边缘点，任一落在实体上就算命中（Bunker.cs 76~90） */
    function bunkerHit(b, hx, hy, ox, oy) {
      var pts = [
        [hx, hy],
        [hx, hy + oy], [hx, hy - oy],
        [hx - ox, hy], [hx + ox, hy]
      ];
      for (var i = 0; i < pts.length; i++) {
        if (bunkerTexel(b, pts[i][0], pts[i][1], _tp)) {
          splat(b, _tp.px, _tp.py);
          return true;
        }
      }
      return false;
    }

    /* =====================================================================
     * 方阵
     * =================================================================== */

    function buildAliens() {
      aliens = [];
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          aliens.push({
            r: r, c: c, alive: true,
            spr: ROW_SPR[r], col: ROW_COL[r], score: ROW_SCORE[r]
          });
        }
      }
    }

    function aX(a) { return gridX + a.c * CW + CW / 2; }
    function aY(a) { return gridY + a.r * CH + CH / 2; }

    function aliveCount() {
      var n = 0;
      for (var i = 0; i < aliens.length; i++) if (aliens[i].alive) n++;
      return n;
    }

    /* ResetInvaders：方向归右、位置回到开局点、全部复活（Invaders.cs 179~188） */
    function resetInvaders() {
      dir = 1;
      gridX = GX0; gridY = GY0;
      downSteps = 0;
      for (var i = 0; i < aliens.length; i++) aliens[i].alive = true;   // SetActive(true)
    }

    /* 当前方阵速度：曲线(击杀百分比) × 关卡系数 × 下压系数 */
    function gridSpeed() {
      var total = ROWS * COLS;
      var pk = (total - aliveCount()) / total;
      var mul = 1 + (level - 1) * 0.22;
      return (MINSPD + (MAXSPD - MINSPD) * pk) * mul * (1 + 0.05 * downSteps);
    }

    /* AdvanceRow：翻转方向 + 整群下压一行（Invaders.cs 166~177） */
    function advanceRow() {
      dir = -dir;
      gridY += STEP_DOWN;
      downSteps++;
      api.hit('Invaders.cs', 170);
      api.log('方阵触边 → 方向翻转为 ' + (dir > 0 ? '右' : '左') + '，整体下压一行（第 ' +
              downSteps + ' 次，速度 ×' + (1 + 0.05 * downSteps).toFixed(2) + '）', 'warn');
    }

    /* =====================================================================
     * 流程：NewGame / NewRound / Respawn / GameOver（GameManager.cs）
     * =================================================================== */

    function newGame() {
      score = 0; lives = 3; level = 1;
      over = false;
      waveReset = true;
      newRound();
      api.hit('GameManager.cs', 89);
      api.log('新的一局：分数归零，生命 3，第 1 关', 'sys');
    }

    /* NewRound：是否重开整波由 waveReset 决定（见 killPlayer） */
    function newRound() {
      if (waveReset) {
        resetInvaders();               // invaders.ResetInvaders()
        waveReset = false;
      }
      resetBunkers();                  // bunkers[i].ResetBunker()
      playerX = W / 2;
      playerAlive = true;
      missiles.length = 0;
      laser = null;
      respawnT = 0;
      missileT = 0;
      api.hit('GameManager.cs', 95);
      api.hit('Invaders.cs', 86);            // 重新起一遍定时开火
      api.hit('Bunker.cs', 51);              // 每个掩体复制一份干净纹理
    }

    function gameOver() {
      over = true;
      playerAlive = false;
      api.hit('GameManager.cs', 119);
      api.log('GAME OVER —— 最终得分 ' + pad4(score) + '，到达第 ' + level +
              ' 关。按 空格 / R 重开', 'err');
    }

    /* full = true 表示连整波外星人一起复位（触底 / 过关 / 新局） */
    function killPlayer(full) {
      if (over || respawnT > 0) return;
      lives = lives - 1;
      if (lives < 0) lives = 0;
      playerAlive = false;
      waveReset = !!full;
      missiles.length = 0;
      laser = null;
      api.hit('GameManager.cs', 140);
      api.log('玩家阵亡！剩余生命 ' + lives, 'err');
      if (lives <= 0) {
        gameOver();
      } else {
        respawnT = 1.0;                // Invoke(nameof(NewRound), 1f)
        api.hit('GameManager.cs', 146);
        api.log('1 秒后重生：掩体复原' + (full ? '，外星人整波复位' : '，外星人战况保留'), 'info');
      }
    }

    /* =====================================================================
     * 开火
     * =================================================================== */

    function tryFire() {
      if (over || !playerAlive || respawnT > 0) return;
      if (laser !== null) return;                       // Player.cs 52：一次一发
      laser = { x: playerX, y: PY - PH / 2 - LH / 2 };
      api.hit('Player.cs', 52);
      api.log('发射激光（场上只允许一发）', 'ok');
    }

    /* MissileAttack：定时遍历存活外星人，1/存活数 概率开火，命中即 break（Invaders.cs 89~118） */
    function missileAttack() {
      var alive = [];
      for (var i = 0; i < aliens.length; i++) if (aliens[i].alive) alive.push(i);
      if (!alive.length) return;                        // 全灭后不再发射

      var p = 1 / alive.length;
      for (var k = 0; k < alive.length; k++) {
        if (Math.random() < p) {
          var a = aliens[alive[k]];
          missiles.push({ x: aX(a), y: aY(a) + 8,
                          vy: MISSILE_SPD * (1 + (level - 1) * 0.06) });
          api.hit('Invaders.cs', 112);
          api.log('外星人开火（存活 ' + alive.length + '，单个概率 1/' + alive.length +
                  ' = ' + p.toFixed(3) + '）', 'info');
          break;                                        // 每次最多一发
        }
      }
    }

    function missileInterval() {
      var t = 1.05 / (1 + 0.16 * (level - 1));
      return t < 0.4 ? 0.4 : t;
    }

    /* =====================================================================
     * 神秘飞船
     * =================================================================== */

    function spawnMystery() {
      mystery.dir = -mystery.dir;                       // direction *= -1
      mystery.x = mystery.dir > 0 ? -30 : W + 30;
      mystery.active = true;
      api.hit('MysteryShip.cs', 97);
      api.log('神秘飞船出现（' + (mystery.dir > 0 ? '从左往右' : '从右往左') +
              '），击落 +300 分', 'warn');
    }

    function despawnMystery() {
      mystery.active = false;
      mystery.wait = 10 + Math.random() * 8;            // Invoke(nameof(Spawn), cycleTime)
      api.hit('MysteryShip.cs', 112);
    }

    /* =====================================================================
     * 命中处理
     * =================================================================== */

    function killInvader(a) {
      a.alive = false;
      score += a.score;
      api.hit('Invader.cs', 63);
      api.log('击落第 ' + (a.r + 1) + ' 排外星人 +' + a.score + ' 分，剩余 ' + aliveCount(), 'ok');

      if (aliveCount() === 0) {                         // GameManager.cs 160
        level++;
        api.hit('GameManager.cs', 160);
        api.log('全部清空 → 进入第 ' + level + ' 关（速度 ×' +
                (1 + (level - 1) * 0.22).toFixed(2) + '）', 'ok');
        banner = '第 ' + level + ' 关 · 敌人更快了';
        bannerT = 2.0;
        respawnT = 1.2;
        waveReset = true;              // 新一波从初始位置重新压下来
        playerAlive = false;
        missiles.length = 0;
        laser = null;
      }
    }

    function killMystery() {
      score += 300;
      mystery.active = false;
      mystery.wait = 10 + Math.random() * 8;
      api.hit('MysteryShip.cs', 121);
      api.log('击落神秘飞船！+300 分', 'ok');
    }

    /* =====================================================================
     * 每帧更新（对应 Update + FixedUpdate）
     * =================================================================== */

    function update(dt, keys, api) {

      if (over) { publish(dt); return; }

      /* --- 死亡 / 过关后的延迟重生（对应 Invoke(nameof(NewRound), 1f)） --- */
      if (respawnT > 0) {
        respawnT -= dt;
        if (respawnT <= 0) {
          var kept = !waveReset;       // 记下这一回合是否保留了战况
          newRound();
          api.log(kept ? '重生完成：玩家回到中央、掩体复原（外星人战况保留）'
                       : '重生完成：外星人整波复位、掩体复原、玩家回到中央', 'sys');
        }
        stepMystery(dt);
        stepAnim(dt);
        publish(dt);
        return;
      }

      /* --- 输入：玩家左右移动，并用 Clamp 夹在屏幕内（Player.cs 27~47） --- */
      if (keys.left)  playerX -= PSPEED * dt;
      if (keys.right) playerX += PSPEED * dt;
      if (playerX < PW / 2) playerX = PW / 2;
      if (playerX > W - PW / 2) playerX = W - PW / 2;

      if (firePressed) { firePressed = false; tryFire(); }

      /* --- 走路动画：两帧循环（Invader.cs 46~57） --- */
      stepAnim(dt);

      /* --- 神秘飞船 --- */
      stepMystery(dt);

      /* --- 方阵整体平移（Invaders.cs 120~164） --- */
      var spd = gridSpeed();
      gridX += dir * spd * dt;

      var minX = 1e9, maxX = -1e9, maxY = -1e9;
      var i, a, x, yb;
      for (i = 0; i < aliens.length; i++) {
        a = aliens[i];
        if (!a.alive) continue;
        x = aX(a);
        yb = aY(a) + IH / 2;
        if (x - IW / 2 < minX) minX = x - IW / 2;
        if (x + IW / 2 > maxX) maxX = x + IW / 2;
        if (yb > maxY) maxY = yb;
      }

      if (maxX > -1e8) {
        /* 只检查「最边缘的那个」，与源码一致 */
        if (dir === 1 && maxX >= W - 16) advanceRow();
        else if (dir === -1 && minX <= 16) advanceRow();

        /* 触底：Invader 碰到 Boundary → OnBoundaryReached（Invader.cs 66） */
        if (maxY >= LINE_Y) {
          api.hit('Invader.cs', 66);
          api.log('方阵越过触底线 → 整波重置并扣一条命', 'err');
          killPlayer(true);
          publish(dt);
          return;
        }
      }

      /* --- 开火定时（对应 InvokeRepeating） --- */
      missileT += dt;
      var iv = missileInterval();
      while (missileT >= iv) { missileT -= iv; missileAttack(); }

      /* --- 子弹推进（分步，避免高速穿过掩体） --- */
      var SUB = 4, sdt = dt / SUB;
      for (var s = 0; s < SUB; s++) {
        stepLaser(sdt);
        stepMissiles(sdt);
      }

      /* --- 外星人撞掩体 / 撞玩家 --- */
      checkInvaderCrash();

      publish(dt);
    }

    function stepAnim(dt) {
      animT += dt;
      if (animT >= 0.6) { animT = 0; frame = frame ? 0 : 1; }
    }

    function stepMystery(dt) {
      if (!mystery.active) {
        mystery.wait -= dt;
        if (mystery.wait <= 0) spawnMystery();
        return;
      }
      mystery.x += mystery.dir * 115 * dt;
      if (mystery.dir > 0 && mystery.x > W + 30) despawnMystery();
      else if (mystery.dir < 0 && mystery.x < -30) despawnMystery();
    }

    /* 打在已打穿的空洞上：CheckPoint 返回 false，子弹继续飞（Bunker.cs 96） */
    function noteHole() {
      if (holeLogT > 0) return;
      holeLogT = 0.9;
      api.hit('Bunker.cs', 96);
      api.log('打在已打穿的空洞上 → CheckPoint 返回 false，子弹继续飞过去', 'info');
    }

    function stepLaser(sdt) {
      if (!laser) return;
      laser.y -= LASER_SPD * sdt;

      /* 神秘飞船 */
      if (mystery.active &&
          Math.abs(laser.x - mystery.x) <= mystery.w / 2 + LW / 2 &&
          Math.abs(laser.y - mystery.y) <= mystery.h / 2 + LH / 2) {
        killMystery();
        laser = null;
        return;
      }

      /* 外星人 */
      for (var i = 0; i < aliens.length; i++) {
        var a = aliens[i];
        if (!a.alive) continue;
        if (Math.abs(laser.x - aX(a)) <= IW / 2 + LW / 2 &&
            Math.abs(laser.y - aY(a)) <= IH / 2 + LH / 2) {
          killInvader(a);
          laser = null;
          return;
        }
      }

      /* 掩体：命中点 + 四边缘点做纹素检测（Projectile.cs 49~59） */
      for (var b = 0; b < bunkers.length; b++) {
        var bk = bunkers[b];
        if (!bk.active) continue;
        if (laser.y + LH / 2 < bk.y || laser.y - LH / 2 > bk.y + bk.h) continue;
        if (laser.x + LW / 2 < bk.x || laser.x - LW / 2 > bk.x + bk.w) continue;
        if (bunkerHit(bk, laser.x, laser.y, LW / 2, LH / 2)) {
          api.hit('Projectile.cs', 56);
          if (splatLogT <= 0) {
            api.log('激光啃掉掩体一块（纹素级破坏 + Apply）', 'info');
            splatLogT = 0.5;
          }
          laser = null;
          return;
        }
        noteHole();
      }

      /* 飞出上边界 */
      if (laser.y + LH / 2 < HUD) laser = null;
    }

    function stepMissiles(sdt) {
      for (var i = missiles.length - 1; i >= 0; i--) {
        var m = missiles[i];
        m.y += m.vy * sdt;

        /* 撞玩家（Player.cs 57~64） */
        if (playerAlive &&
            Math.abs(m.x - playerX) <= PW / 2 + MW / 2 &&
            Math.abs(m.y - PY) <= PH / 2 + MH / 2) {
          missiles.splice(i, 1);
          api.hit('Player.cs', 60);
          killPlayer(false);           // 教学版：被导弹打中不清空已有战况
          return;
        }

        /* 撞掩体 */
        var eaten = false;
        for (var b = 0; b < bunkers.length; b++) {
          var bk = bunkers[b];
          if (!bk.active) continue;
          if (m.y + MH / 2 < bk.y || m.y - MH / 2 > bk.y + bk.h) continue;
          if (m.x + MW / 2 < bk.x || m.x - MW / 2 > bk.x + bk.w) continue;
          if (bunkerHit(bk, m.x, m.y, MW / 2, MH / 2)) {
            api.hit('Bunker.cs', 126);
            if (splatLogT <= 0) {
              api.log('导弹啃掉掩体一块（纹素级破坏 + Apply）', 'info');
              splatLogT = 0.5;
            }
            missiles.splice(i, 1);
            eaten = true;
            break;
          }
          noteHole();
        }
        if (eaten) continue;

        /* 飞出下边界 */
        if (m.y - MH / 2 > H) missiles.splice(i, 1);
      }
    }

    function checkInvaderCrash() {
      for (var i = 0; i < aliens.length; i++) {
        var a = aliens[i];
        if (!a.alive) continue;
        var x = aX(a), yb = aY(a) + IH / 2, yt = aY(a) - IH / 2;

        /* 撞掩体 → 整块掩体被摧毁（Bunker.cs 164~169） */
        for (var b = 0; b < bunkers.length; b++) {
          var bk = bunkers[b];
          if (!bk.active) continue;
          if (yb >= bk.y && yt <= bk.y + bk.h &&
              x + IW / 2 >= bk.x && x - IW / 2 <= bk.x + bk.w) {
            bk.active = false;
            api.hit('Bunker.cs', 168);
            api.log('外星人撞上掩体 → 该掩体整块被摧毁', 'warn');
          }
        }

        /* 撞玩家 */
        if (playerAlive &&
            yb >= PY - PH / 2 && yt <= PY + PH / 2 &&
            Math.abs(x - playerX) <= IW / 2 + PW / 2) {
          api.hit('Player.cs', 60);
          killPlayer(true);            // 被外星人撞上说明已经压到家门口，整波复位
          return;
        }
      }
    }

    /* ---------- 关键状态推给底部面板（约 8Hz，别每帧刷 DOM） ---------- */
    function publish(dt) {
      if (splatLogT > 0) splatLogT -= dt;
      if (holeLogT > 0) holeLogT -= dt;
      if (bannerT > 0) bannerT -= dt;
      varT += dt;
      if (varT < 0.13) return;
      varT = 0;
      var total = ROWS * COLS;
      api.vars({
        'score': pad4(score),
        'lives': lives,
        'level': level,
        'invaders.alive': aliveCount() + ' / ' + total,
        'invaders.speed': gridSpeed().toFixed(1),
        'invaders.dir': dir > 0 ? 'right' : 'left',
        'invaders.downSteps': downSteps,
        'killedPercent': ((total - aliveCount()) / total * 100).toFixed(0) + '%',
        'laser': laser ? '在场' : '空（可发射）',
        'missiles': missiles.length,
        'mysteryShip': mystery.active ? '在场上' : Math.ceil(mystery.wait) + 's 后出现'
      });
    }

    function pad4(n) {
      var s = String(n);
      while (s.length < 4) s = '0' + s;     // 对应 score.ToString().PadLeft(4,'0')
      return s;
    }

    /* =====================================================================
     * 渲染
     * =================================================================== */

    function drawSprite(ctx, pat, cx, cy, color) {
      ctx.fillStyle = color;
      var x0 = cx - 11, y0 = cy - 8;
      for (var r = 0; r < pat.length; r++) {
        var row = pat[r];
        for (var c = 0; c < row.length; c++) {
          if (row.charAt(c) === '#') ctx.fillRect(x0 + c * 2, y0 + r * 2, 2, 2);
        }
      }
    }

    function draw(ctx, api) {
      /* 背景 */
      ctx.fillStyle = '#050816';
      ctx.fillRect(0, 0, W, H);

      /* 触底线（越线即失败） */
      ctx.strokeStyle = 'rgba(248,113,113,.30)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(0, LINE_Y);
      ctx.lineTo(W, LINE_Y);
      ctx.stroke();
      ctx.setLineDash([]);

      /* ---------- HUD ---------- */
      ctx.fillStyle = 'rgba(255,255,255,.08)';
      ctx.fillRect(0, 0, W, HUD);
      ctx.font = '600 15px "SF Mono", Menlo, Consolas, monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('SCORE ' + pad4(score), 14, 23);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('LEVEL ' + level, 160, 23);

      /* 生命用小飞船图标表示 */
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('LIVES', W - 190, 23);
      for (var i = 0; i < lives; i++) {
        drawShip(ctx, W - 130 + i * 26, 22, 0.7, '#38bdf8');
      }

      /* ---------- 掩体（直接把那张被啃过的「纹理」画出来） ---------- */
      for (var b = 0; b < bunkers.length; b++) {
        if (bunkers[b].active) ctx.drawImage(bunkers[b].cv, bunkers[b].x, bunkers[b].y);
      }

      /* ---------- 外星人 ---------- */
      for (var k = 0; k < aliens.length; k++) {
        var a = aliens[k];
        if (!a.alive) continue;
        drawSprite(ctx, a.spr[frame], aX(a), aY(a), a.col);
      }

      /* ---------- 神秘飞船 ---------- */
      if (mystery.active) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(mystery.x - 22, mystery.y - 4, 44, 8);
        ctx.fillRect(mystery.x - 12, mystery.y - 8, 24, 16);
        ctx.fillStyle = 'rgba(0,0,0,.45)';
        ctx.fillRect(mystery.x - 6, mystery.y - 4, 4, 8);
        ctx.fillRect(mystery.x + 2, mystery.y - 4, 4, 8);
      }

      /* ---------- 子弹 ---------- */
      ctx.fillStyle = '#a3e635';
      for (var m = 0; m < missiles.length; m++) {
        ctx.fillRect(missiles[m].x - MW / 2, missiles[m].y - MH / 2, MW, MH);
      }
      if (laser) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(laser.x - LW / 2, laser.y - LH / 2, LW, LH);
      }

      /* ---------- 玩家 ---------- */
      if (playerAlive) drawShip(ctx, playerX, PY, 1, '#38bdf8');

      /* ---------- 提示层 ---------- */
      ctx.textAlign = 'center';
      if (respawnT > 0 && !over) {
        ctx.fillStyle = 'rgba(255,255,255,.55)';
        ctx.font = '13px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('准备中… ' + Math.max(0, respawnT).toFixed(1) + 's', W / 2, H / 2 + 30);
      }
      if (bannerT > 0 && banner) {
        ctx.fillStyle = '#86efac';
        ctx.font = '600 24px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText(banner, W / 2, H / 2);
      }
      if (over) {
        ctx.fillStyle = 'rgba(5,8,22,.72)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fca5a5';
        ctx.font = '600 34px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 12);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '16px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('得分 ' + pad4(score) + ' · 第 ' + level + ' 关 · 按 空格 / R 重开', W / 2, H / 2 + 24);
      }
    }

    function drawShip(ctx, cx, cy, s, color) {
      ctx.fillStyle = color;
      ctx.fillRect(cx - 13 * s, cy + 2 * s, 26 * s, 5 * s);      // 底座
      ctx.fillRect(cx - 2 * s, cy - 8 * s, 4 * s, 11 * s);       // 炮管
      ctx.fillRect(cx - 7 * s, cy - 3 * s, 14 * s, 5 * s);       // 舱体
    }

    /* =====================================================================
     * 输入
     * =================================================================== */

    function moveTo(x) {
      playerX = x;
      if (playerX < PW / 2) playerX = PW / 2;
      if (playerX > W - PW / 2) playerX = W - PW / 2;
    }

    /* ---------- 初始化 ---------- */
    buildAliens();
    resetBunkers();
    api.log('方阵就位：' + ROWS + ' 行 × ' + COLS + ' 列 = ' + (ROWS * COLS) + ' 个外星人', 'sys');
    api.log('掩体已生成：4 座，各持有一张独立纹理（改像素前必须先复制）', 'sys');
    api.log('说明：源码 NewRound 会连方阵一起复位；本演示版只在「触底 / 过关」时整波重置，' +
            '被导弹打中保留战况，方便连续观察清空 → 下一关。', 'sys');

    /* ---------- 对外接口 ---------- */
    return {
      w: W, h: H,
      reset: function () {
        newGame();
        api.log('已重置 —— 新的一局开始', 'sys');
      },
      update: update,
      draw: draw,
      onPointer: function (x, y, down, api) {
        moveTo(x);
        if (down) {
          if (over) this.reset();
          else firePressed = true;                 // Player.cs 52：鼠标左键也能发射
        }
      },
      onPointerMove: function (x, y, api) {
        if (!over) moveTo(x);
      },
      onKey: function (k, down, api) {
        if (!down) return;
        if (k === 'fire') {
          if (over) this.reset();
          else firePressed = true;
        } else if (k === 'up' && over) {
          this.reset();                            // 源码用 Enter 重开
        }
      }
    };
  }
});
