/* =============================================================================
 * Tetris · 俄罗斯方块
 * -----------------------------------------------------------------------------
 * 本文件三部分：
 *   1) create(api) —— 浏览器里可玩的 Canvas 复刻版（与 Unity 版逻辑一一对应）
 *   2) notes       —— 逐句讲解：「为什么这么写」
 *   3) think       —— 开发思维与步骤拆解
 *
 * 与 Unity 版的对应关系：
 *   Data.cs        → 形状坐标 / 旋转矩阵 / SRS 踢墙表（原样搬过来）
 *   Tetromino.cs   → 方块种类 + 颜色（C# 里是 Tile，这里是色值）
 *   Board.cs       → 棋盘合法性检测、消行、生成
 *   Piece.cs       → 移动 / 旋转 / 硬降 / 锁定 与三个计时器
 *   Ghost.cs       → 幽灵落点预览
 * ========================================================================== */

UG_LESSON('tetris', {

  /* ---------------- 元数据 ---------------- */

  name: '俄罗斯方块 Tetris',
  ico: '🧩',
  difficulty: 4,
  tags: ['旋转矩阵', 'SRS踢墙', '行消除', 'Tilemap'],
  controls: '← → 左右移动；↑ 或 X 顺时针旋转；Z 逆时针；↓ 软降；空格 硬降。鼠标点/拖棋盘可直接平移，右侧按钮可旋转与硬降。P 暂停，R 重开。',
  oneLiner: '七种方块从顶部落下，玩家只能控制「平移、旋转、加速」，填满一行就消掉。它的难点不在规则而在三个细节：方块怎么转（旋转矩阵）、贴墙转不动怎么办（踢墙表）、消行后上方怎么落下来（从下往上搬移）。',

  /* ---------------- 逐句讲解：文件名 → 行号 → 讲解 ---------------- */

  notes: {

    'Piece.cs': {
      43: 'cells 数组只在第一次 Initialize 时 new 一次，之后重复复用。方块是「一个 GameObject 反复洗牌再用」的，一局几百个方块，如果每次都 new 一个数组，GC 压力全花在这种无意义的分配上。这是 Unity 里「复用对象」最常见的切入点。',
      102: '软降成功后立刻把 stepTime 往后推。不推的话会出现「自动下落和软降同一帧各走一格」的情况，玩家按住 ↓ 时会看到方块一次跳两格，手感非常跳。凡是「手动操作与自动逻辑作用于同一个量」，都要记得互相让路。',
      133: '硬降就是「循环下移直到失败」——Move 返回 false 就说明到底了。注意它复用了普通的 Move，而不是另写一套落点计算：能保证硬降与逐格下落的判定完全一致，不会出现「硬降能落进普通下落落不进去的地方」这种经典 bug。',
      178: '旋转状态只是一个 0~3 的索引，不是四组预先写好的坐标。这是本作最关键的取舍：手写四组坐标要维护 7 种方块 × 4 个朝向 = 28 组数据，改一个格子就得改四个地方；而「索引 + 矩阵」只需一份 0 状态坐标，四个朝向全靠同一次矩阵乘法算出来。Wrap 保证 3 + 1 回到 0，也保证 0 - 1 回到 3。',
      192: '矩阵不写在 Piece 里，而是从 Data 静态类统一取。好处是「旋转」这件事在整个工程里只有一个定义点：以后想改成逆时针为正、或者想加 180° 旋转，改 Data 一处即可，Piece / Ghost 全都跟着变。把常量集中，是防止「同一份知识散落在多处」最省事的办法。',
      208: 'I 和 O 要走特例：它们的旋转中心不在某个格子上，而在格点之间的缝里（I 是 4×4 的中心、O 是 2×2 的中心）。所以先减 0.5 把中心搬到原点，旋转完再 CeilToInt 取整拉回格点。这也是为什么 I 的坐标写成 (-1,1)(0,1)(1,1)(2,1) —— 它其实生活在 4×4 的框里，不是 3×3。',
      235: '踢墙表一行有 5 个偏移，这里按顺序逐个试：第 0 个是「不踢」（原地转），后面 4 个才是挪一格、两格的候选。为什么必须有这张表？因为方块贴着墙或贴着地形时，原地旋转必然撞墙；如果规则是「撞了就不转」，玩家在墙边就永远转不了，槽位一堵死游戏就废了。踢墙表就是「人肉帮玩家挪一格，让旋转成立」—— 它是把「能不能转」从几何判定变成「几何 + 一份妥协清单」。'
    },

    'Board.cs': {
      64: '「生成即判定」：新方块出生时先问一次 IsValidPosition，合法就画出来，不合法就说明棋盘已经堆到出生点了 —— 游戏结束。不做这个判定的话，方块会直接叠在已有格子上，游戏永远不会结束。用「放不下」当作失败条件，比额外维护一个「顶部是否被占」的标记要干净得多。',
      132: '消行必须从最底下那一行开始往上扫。原因在下面 138 行：一旦某行被消掉，它上面的所有行都会整体下落一格，也就是说「你刚刚检查过的行」内容已经变了。从下往上扫能保证每次处理时，下面已经处理干净、上面还没动，状态是单调收敛的。',
      138: '这一行的重点是 else 才 row++：如果当前行被消掉了，上方落下来填补了这一行，那么「这一行」又得重新检查一次（可能又满了，比如一次消四行）。边扫边删、扫一行就无条件 row++ 的话，下落填补过来的满行就会被跳过，出现「消不干净」的残行。这是消行逻辑里最经典的一个 off-by-one。',
      183: '搬运的做法是「取上一行的 Tile，写到当前行」，从被消的那一行一路复制到顶。注意它是整行复制引用，不是一格一格挪 —— Tilemap 的 SetTile 本身就是按格子写的，所以这里直接把上一行的格子内容读出来再写下去，等价于整行下落一格。最顶上那一行会被复制成「不存在的一行」（null），正好变成空行。'
    },

    'Ghost.cs': {
      69: '算落点之前先把主方块从棋盘上擦掉。因为落点检测用的是同一个 IsValidPosition，而它判定「该格是否已被占用」—— 如果不擦掉自己，方块往下挪一格永远会撞上自己原来的位置，落点就会算错成「原地」。凡是「用占用状态做自检测」，都要先把自己摘出去、算完再放回去（84 行恢复）。'
    },

    'Data.cs': {
      38: '踢墙表被做成「8 行 × 5 列」的二维数组：8 行 = 4 个旋转状态 × 2 个旋转方向，5 列 = 5 个候选偏移（第 0 个是不踢）。I 单独一张表，J/L/S/T/Z 共用一张 —— 因为 I 是 4×4 的框，挪动幅度是 ±2 格，和 3×3 的方块完全不是一个量级。把它做成数据表而不是 if-else，是为了让「手感」可以被单独调整：觉得墙边太难转就改这几个数字，逻辑一行都不用动。'
    },

    'Tetromino.cs': {
      42: '形状坐标不写死在结构体里，而是运行时从 Data.Cells 字典取。配合 30 行的 Tile（决定颜色/图案，在 Inspector 里拖），得到的效果是：美术改皮肤只动 Tile、策划改形状只动 Data，Piece / Board / Ghost 三个脚本完全不用碰。这就是「数据与逻辑分离」最直观的收益 —— 顺带一提，这里用的是 [System.Serializable] 结构体 + 静态 Data 类，严格说不是 ScriptableObject 资源文件，但解决的是同一个问题：把「长什么样」从「怎么运行」里摘出去。'
    }
  },

  /* ---------------- 开发思维与步骤 ---------------- */

  think: {
    core: [
      '第一条思维是「用变换代替枚举」。七个方块、四种朝向，最笨的写法是把 28 组坐标全列出来；本作只存一份 0 状态坐标，朝向由 rotationIndex（0~3）+ 一次 90° 旋转矩阵算出来。好处不只是少写数据：更重要的是「旋转」这件事变成了可复用的数学操作 —— 想加 180° 旋转、想做镜像关卡、想让幽灵块跟着一起转，全都自动成立，不需要再补一份坐标表。',
      '第二条思维是「规则集中在一个裁决函数里」。平移、旋转、硬降、生成新块，看起来是四件事，实际上它们都只做同一个动作：算出候选位置，然后问 IsValidPosition 一句「行不行」。合法性判定只有一处（越界 + 已占用），所以逻辑不会自相矛盾。你在浏览器版里随便试：不可能出现「硬降能进去、慢慢落进不去」的情况，因为它们走的是同一个函数。',
      '第三条是本作特有的手感哲学：规则允许失败，但要给失败一个「退路」。贴墙旋转在几何上必然非法，如果判非法就摆手不让转，玩家的槽位规划会被地形卡死；于是有了踢墙表 —— 先在原地试，不行就按顺序挪 1~2 格再试，全都不行才撤销。「撞了就不许动」和「撞了先想办法挪一下」，是两类完全不同的游戏体验，而后者只多了一张 8×5 的表。'
    ],

    steps: [
      { t: '① 定规则：一句话说清游戏',
        d: '方块从顶部落下，玩家只能左右平移、旋转、加速下落；落到底后锁定，填满一整行就消掉并计分；新方块放不下就结束。注意这句话里没有「胜负条件」之外的任何例外 —— 俄罗斯方块三十年不变，就是因为规则干净。' },
      { t: '② 搭世界：棋盘即数据，Tilemap 即画布',
        d: '10×20 的棋盘，原点在中心，所以 x ∈ [-5, 4]、y ∈ [-10, 9]（见 Board.cs 的 Bounds）。关键设计：Unity 版直接把 Tilemap 当成数据结构 —— 「这一格有没有 Tile」既是画面也是占用状态，所以不需要额外的二维数组。浏览器版为了简单用了一个 grid 数组，但判定逻辑一模一样。' },
      { t: '③ 造角色：Piece 只需要五个状态',
        d: '种类（data）、四个单元格（cells）、整体位置（position）、旋转索引（rotationIndex），外加三个计时器：stepDelay（自动下落）、moveDelay（长按移动节流）、lockDelay（落地后留给你微调的时间）。角色状态列清楚之后，剩下的代码就只是「谁改这些状态」。' },
      { t: '④ 建循环：先擦、再算、最后画',
        d: 'Piece.Update 的顺序是固定的：board.Clear 擦掉旧位置 → 累加 lockTime → 处理旋转/硬降/移动 → 到达 stepTime 就下落一格 → board.Set 画到新位置。这个「擦—算—画」的三段式在 Ghost 里也出现一次（Clear/Copy/Drop/Set），是本作最值得记住的骨架。' },
      { t: '⑤ 定交互：所有操作都归结为一次合法性检测',
        d: 'Move 先算候选位置再问 IsValidPosition，合法才采纳并重置 lockTime；Rotate 先转矩阵再跑踢墙表，5 个偏移全失败就整体撤销（还原索引 + 反向转矩阵）；HardDrop 循环 Move 到底再 Lock。三条交互、一个裁决函数，这就是第 ② 步说的「规则集中」。' },
      { t: '⑥ 调手感：三个计时器决定一切',
        d: 'stepDelay 控制难度曲线（每消 10 行升一级、间隔按 0.85 倍递减）；moveDelay 让长按左右不会瞬移（0.1 秒一格）；lockDelay 让方块落地后还有 0.5 秒可以微调 —— 没有它，玩家一旦落地就被锁死，贴地微调这整个玩法就消失了。改这三个数，游戏性格完全不同。' },
      { t: '⑦ 做流程：锁定 → 消行 → 生成 → 判定结束',
        d: 'Lock 三步走：Set 落定、ClearLines 消行、SpawnPiece 生成下一个。消行从底往上扫且消掉后不前进（等上方落下来再检查同一行）；生成时立刻做一次合法性检测，放不下就 GameOver。浏览器版额外把纯随机换成了 7-bag —— 保证每 7 个方块里每种恰好出现一次，不会出现「连来五个 S」的运气死局。' }
    ],

    transfer: [
      '「索引 + 变换」替代「枚举所有状态」→ 2048 的矩阵旋转与转置、pacman 的朝向与转向、打砖块里按角度生成反弹方向，都是同一招：存最少的状态，剩下的靠一个可复用的数学操作算出来。',
      '「规则集中在一个裁决函数」→ 2048 的能否滑动、扫雷的能否展开、炸弹人能不能走到某格，都适合收成一个 canXxx()，避免同一种判定在代码里出现三份、彼此打架。',
      '「先摘掉自己再做自检测」→ Ghost 算落点前先 Clear 自己；同理，扫雷展开要防止重复入队、炸弹人爆炸要防止连锁回头炸，做法都是「先把自己标记/摘出，算完再恢复」。'
    ]
  },

  /* =========================================================================
   * create(api) —— 可玩的浏览器复刻版
   *
   * 刻意与 Unity 版保持结构一致：
   *   Update：Clear 旧位置 → 累加计时 → 处理输入 → Set 新位置
   *   变量名也对应（cells / position / rotationIndex / stepDelay / lockDelay）
   * ======================================================================= */

  create: function (api) {

    /* ---------- 世界尺寸（逻辑坐标，与显示分辨率无关） ---------- */
    var W = 480, H = 420;

    /* ---------- 棋盘参数（对应 Board.boardSize = 10 × 20） ---------- */
    var COLS = 10, ROWS = 20;
    var CELL = 20;                          // 每格像素
    var BX = 36, BY = 10;                   // 棋盘左上角屏幕坐标
    var X_MIN = -5, X_MAX = 5;              // 局部坐标范围（对应 RectInt.Bounds）
    var Y_MIN = -10, Y_MAX = 10;
    var SPAWN_X = -1, SPAWN_Y = 8;          // 对应 Board.spawnPosition

    /* ---------- 计时器（对应 Piece 的三个字段） ---------- */
    var STEP_BASE = 0.9;                    // 1 级时的自动下落间隔
    var MOVE_DELAY = 0.1;                   // moveDelay：长按移动的节流
    var LOCK_DELAY = 0.5;                   // lockDelay：落地后可微调的时间

    /* ---------- 计分：1/2/3/4 行 = 100/300/500/800，再乘等级 ---------- */
    var SCORE_TABLE = [0, 100, 300, 500, 800];

    /* ---------- Data.cs：旋转矩阵（cos90=0, sin90=1） ---------- */
    var COS = Math.cos(Math.PI / 2);
    var SIN = Math.sin(Math.PI / 2);
    var ROT = [COS, SIN, -SIN, COS];        // 对应 Data.RotationMatrix

    /* ---------- Data.cs：七种方块 0 状态的单元格局部坐标 ---------- */
    var CELLS = {
      I: [[-1, 1], [0, 1], [1, 1], [2, 1]],
      J: [[-1, 1], [-1, 0], [0, 0], [1, 0]],
      L: [[1, 1], [-1, 0], [0, 0], [1, 0]],
      O: [[0, 1], [1, 1], [0, 0], [1, 0]],
      S: [[0, 1], [1, 1], [-1, 0], [0, 0]],
      T: [[0, 1], [-1, 0], [0, 0], [1, 0]],
      Z: [[-1, 1], [0, 1], [0, 0], [1, 0]]
    };

    /* ---------- Data.cs：I 专用踢墙表（8 行 × 5 列） ---------- */
    var KICKS_I = [
      [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
      [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
      [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
      [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
      [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
      [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
      [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
      [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]]
    ];

    /* ---------- Data.cs：J/L/O/S/T/Z 共用踢墙表 ---------- */
    var KICKS_JLOSTZ = [
      [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
      [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
      [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
      [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
      [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
      [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
      [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
      [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]]
    ];

    /* ---------- TetrominoData.tile：C# 里是 Tile 资源，这里是颜色 ---------- */
    var COLORS = {
      I: '#22d3ee', J: '#60a5fa', L: '#fb923c',
      O: '#facc15', S: '#4ade80', T: '#c084fc', Z: '#f87171'
    };
    var NAMES = { I: 'I 长条', J: 'J', L: 'L', O: 'O 方块', S: 'S', T: 'T', Z: 'Z' };

    /* ---------- 状态 ---------- */
    var grid;                 // 已锁定的格子：grid[row][col] = null | 'I'...
    var piece;                // 活动方块 { type, cells, x, y, rot }
    var nextType;             // 「下一个」预览
    var bag;                  // 7-bag 随机袋
    var now = 0;              // 内部时钟（对应 Time.time）
    var stepTime = 0, moveTime = 0;
    var lockTime = 0, stepDelay = STEP_BASE;
    var score = 0, lines = 0, level = 1;
    var over = false;
    var dragX = null;         // 鼠标拖动时的目标列（局部 x）
    var dragging = false;
    var varT = 0;

    /* ---------- 小工具 ---------- */

    // 局部 y → 行号（y = 9 是顶行 row0，y = -10 是底行 row19）
    function rowOf(y) { return (ROWS - 1) - (y - Y_MIN); }
    function colOf(x) { return x - X_MIN; }

    function newGrid() {
      grid = [];
      for (var r = 0; r < ROWS; r++) {
        var row = [];
        for (var c = 0; c < COLS; c++) row.push(null);
        grid.push(row);
      }
    }

    function copyCells(src) {
      var a = [];
      for (var i = 0; i < src.length; i++) a.push([src[i][0], src[i][1]]);
      return a;
    }

    // 对应 Piece.Wrap：支持负数的取模环绕
    function wrap(input, min, max) {
      if (input < min) return max - (min - input) % (max - min);
      return min + (input - min) % (max - min);
    }

    // 对应 Board.IsValidPosition：越界 或 已占用 → 非法
    function isValid(cells, px, py) {
      for (var i = 0; i < cells.length; i++) {
        var tx = px + cells[i][0];
        var ty = py + cells[i][1];
        if (tx < X_MIN || tx >= X_MAX || ty < Y_MIN || ty >= Y_MAX) return false;
        if (grid[rowOf(ty)][colOf(tx)]) return false;
      }
      return true;
    }

    // 对应 Piece.Move：合法才采纳，并刷新节流 + 重置锁定计时
    function movePiece(dx, dy) {
      if (!piece) return false;
      var nx = piece.x + dx, ny = piece.y + dy;
      if (!isValid(piece.cells, nx, ny)) return false;
      piece.x = nx;
      piece.y = ny;
      moveTime = now + MOVE_DELAY;
      lockTime = 0;
      return true;
    }

    /* ---------- 7-bag 随机：每 7 个里七种各出现一次 ---------- */
    function refillBag() {
      var t = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
      for (var i = t.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = t[i]; t[i] = t[j]; t[j] = tmp;
      }
      bag = bag.concat(t);
    }
    function takeType() {
      if (bag.length < 2) refillBag();
      return bag.shift();
    }

    /* ---------- 难度曲线：每升一级，下落间隔 × 0.85 ---------- */
    function delayOfLevel(lv) {
      var d = STEP_BASE * Math.pow(0.85, lv - 1);
      return d < 0.05 ? 0.05 : d;
    }

    /* ---------- 生成方块：对应 Board.SpawnPiece ---------- */
    function spawnPiece() {
      var type = nextType;
      nextType = takeType();

      // 对应 Piece.Initialize：cells 复用、rotationIndex 归零、计时器重置
      piece = { type: type, cells: copyCells(CELLS[type]), x: SPAWN_X, y: SPAWN_Y, rot: 0 };
      stepTime = now + stepDelay;
      moveTime = now + MOVE_DELAY;
      lockTime = 0;
      dragX = null;

      // 对应 Board.cs:64 —— 出生点放不下就是游戏结束
      if (!isValid(piece.cells, piece.x, piece.y)) {
        over = true;
        api.hit('Board.cs', 67);
        api.log('出生点已被占用 → 堆到顶了，游戏结束（按空格或点击重开）', 'err');
        return;
      }

      api.hit('Board.cs', 61);
      api.hit('Ghost.cs', 76);
      api.log('生成 ' + type + '（' + NAMES[type] + '），下一个：' + nextType, 'info');
    }

    /* ---------- 旋转：对应 Piece.Rotate ---------- */
    function applyRotationMatrix(dir) {
      for (var i = 0; i < piece.cells.length; i++) {
        var cx = piece.cells[i][0], cy = piece.cells[i][1];
        var nx, ny;
        if (piece.type === 'I' || piece.type === 'O') {
          // I/O 的旋转中心在格点之间：先平移 0.5，转完 Ceil 拉回格点
          cx -= 0.5; cy -= 0.5;
          nx = Math.ceil((cx * ROT[0] * dir) + (cy * ROT[1] * dir));
          ny = Math.ceil((cx * ROT[2] * dir) + (cy * ROT[3] * dir));
        } else {
          // 其余形状以格子中心旋转，Round 到整数格
          nx = Math.round((cx * ROT[0] * dir) + (cy * ROT[1] * dir));
          ny = Math.round((cx * ROT[2] * dir) + (cy * ROT[3] * dir));
        }
        piece.cells[i][0] = nx;
        piece.cells[i][1] = ny;
      }
    }

    function testWallKicks(rotIndex, dir) {
      var table = (piece.type === 'I') ? KICKS_I : KICKS_JLOSTZ;
      var idx = rotIndex * 2;
      if (dir < 0) idx--;
      idx = wrap(idx, 0, 8);

      for (var i = 0; i < 5; i++) {
        var t = table[idx][i];
        // 注意：踢墙表用的是旋转「之后」的索引，第 0 个偏移恒为 (0,0)（原地转）
        if (movePiece(t[0], t[1])) return t;
      }
      return null;
    }

    function doRotate(dir) {
      if (over || !piece) return;

      var orig = piece.rot;
      piece.rot = wrap(piece.rot + dir, 0, 4);
      applyRotationMatrix(dir);

      var kick = testWallKicks(piece.rot, dir);
      if (!kick) {
        // 5 个偏移全部非法 → 撤销：还原索引 + 反向再转一次矩阵
        piece.rot = orig;
        applyRotationMatrix(-dir);
        api.hit('Piece.cs', 185);
        api.log('旋转失败：5 个踢墙偏移全部非法 → 撤销旋转', 'warn');
        return;
      }

      api.hit('Piece.cs', 178);
      if (kick[0] !== 0 || kick[1] !== 0) {
        api.hit('Piece.cs', 235);
        api.log((dir > 0 ? '顺时针' : '逆时针') + '旋转 → 状态 ' + piece.rot +
                '，踢墙 (' + kick[0] + ', ' + kick[1] + ')', 'ok');
      } else {
        api.log((dir > 0 ? '顺时针' : '逆时针') + '旋转 → 状态 ' + piece.rot + '（原地成立）', 'info');
      }
    }

    /* ---------- 硬降：对应 Piece.HardDrop ---------- */
    function hardDrop() {
      if (over || !piece) return;
      var dist = 0;
      while (movePiece(0, -1)) dist++;
      api.hit('Piece.cs', 133);
      api.log('硬降 ' + dist + ' 格 → 锁定', 'info');
      lockPiece();
    }

    /* ---------- 锁定：对应 Piece.Lock ---------- */
    function lockPiece() {
      for (var i = 0; i < piece.cells.length; i++) {
        var tx = piece.x + piece.cells[i][0];
        var ty = piece.y + piece.cells[i][1];
        if (ty >= Y_MIN && ty < Y_MAX) grid[rowOf(ty)][colOf(tx)] = piece.type;
      }
      api.hit('Piece.cs', 143);

      var n = clearLines();
      spawnPiece();
    }

    /* ---------- 消行：对应 Board.ClearLines（从下往上） ---------- */
    function isLineFull(y) {
      var r = grid[rowOf(y)];
      for (var c = 0; c < COLS; c++) if (!r[c]) return false;
      return true;
    }

    function lineClear(y) {
      var ri = rowOf(y);
      // 被消行之上的每一行整体下落一格（复制上一行到本行）
      for (var r = ri; r >= 1; r--) {
        for (var c = 0; c < COLS; c++) grid[r][c] = grid[r - 1][c];
      }
      for (var c2 = 0; c2 < COLS; c2++) grid[0][c2] = null;
    }

    function clearLines() {
      var cleared = 0;
      var y = Y_MIN;
      while (y < Y_MAX) {
        if (isLineFull(y)) {
          lineClear(y);          // 消掉后不 y++：上方落下来了，同一行要重新检查
          cleared++;
        } else {
          y++;
        }
      }

      if (cleared > 0) {
        var gain = SCORE_TABLE[cleared] * level;
        score += gain;
        lines += cleared;

        var newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
          level = newLevel;
          stepDelay = delayOfLevel(level);
          api.log('升级 → 等级 ' + level + '，自动下落间隔 ' + stepDelay.toFixed(2) + 's', 'ok');
        }

        api.hit('Board.cs', 138);
        api.hit('Board.cs', 183);
        api.log('消除 ' + cleared + ' 行 → +' + gain + ' 分（' +
                SCORE_TABLE[cleared] + ' × 等级 ' + level + '）', 'ok');
      }
      return cleared;
    }

    /* ---------- 幽灵落点：对应 Ghost.Drop ---------- */
    function ghostY() {
      if (!piece) return 0;
      var y = piece.y;
      while (isValid(piece.cells, piece.x, y - 1)) y--;
      return y;
    }

    /* ---------- 每帧更新（对应 Piece.Update） ---------- */
    function update(dt, keys, api) {
      if (over) { publish(dt); return; }

      now += dt;
      lockTime += dt;                     // 源码：每帧累加，落地停留时间

      // 移动受 moveTime 节流，长按也不会瞬移（对应 Piece.cs:80）
      if (now > moveTime) {
        if (keys.left) movePiece(-1, 0);
        else if (keys.right) movePiece(1, 0);

        // 软降：成功下移则刷新 stepTime，避免和自动下落叠加跳两格（Piece.cs:102）
        if (keys.down) {
          if (movePiece(0, -1)) score += 1;
          stepTime = now + stepDelay;
        }

        // 鼠标拖动：向目标列逐步靠拢
        if (dragX !== null && piece) {
          if (piece.x !== dragX) movePiece(piece.x < dragX ? 1 : -1, 0);
          else dragX = null;
        }
      }

      // 自动下落一格（对应 Piece.Step）
      if (now > stepTime) {
        stepTime = now + stepDelay;
        movePiece(0, -1);
      }

      // 落地且停留够久 → 锁定
      if (piece && lockTime >= LOCK_DELAY && !isValid(piece.cells, piece.x, piece.y - 1)) {
        lockPiece();
      }

      publish(dt);
    }

    /* ---------- 关键变量推送（约 8Hz，别每帧刷 DOM） ---------- */
    function cellsText(cells) {
      var s = '';
      for (var i = 0; i < cells.length; i++) {
        s += '(' + cells[i][0] + ',' + cells[i][1] + ')';
      }
      return s;
    }

    function publish(dt) {
      varT += dt;
      if (varT < 0.125) return;
      varT = 0;

      api.vars({
        'piece.type': piece ? piece.type + ' · ' + NAMES[piece.type] : '—',
        'piece.rotationIndex': piece ? piece.rot + ' / 0~3' : '—',
        'piece.position': piece ? '(' + piece.x + ', ' + piece.y + ')' : '—',
        'piece.cells': piece ? cellsText(piece.cells) : '—',
        'ghost.落点y': piece ? ghostY() : '—',
        'stepDelay': stepDelay.toFixed(2) + ' s',
        'moveDelay': MOVE_DELAY + ' s',
        'lockTime': lockTime.toFixed(2) + ' / ' + LOCK_DELAY + ' s',
        'score': score,
        'level': level,
        'lines': lines,
        'next': nextType + ' · ' + NAMES[nextType],
        'bag 剩余': bag.length
      });
    }

    /* ---------- 渲染 ---------- */

    var PANEL_X = 256;                                  // 右侧信息栏
    var BTN_ROT = { x: 256, y: 344, w: 100, h: 36 };    // 「旋转」按钮
    var BTN_DROP = { x: 366, y: 344, w: 100, h: 36 };   // 「硬降」按钮

    function drawBlock(ctx, col, row, color) {
      var x = BX + col * CELL, y = BY + row * CELL;
      ctx.fillStyle = color;
      ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
      ctx.fillStyle = 'rgba(255,255,255,.22)';          // 顶部高光，让格子有立体感
      ctx.fillRect(x + 1, y + 1, CELL - 2, 3);
      ctx.fillStyle = 'rgba(0,0,0,.18)';
      ctx.fillRect(x + 1, y + CELL - 4, CELL - 2, 3);
    }

    function drawGhostBlock(ctx, col, row, color) {
      var x = BX + col * CELL, y = BY + row * CELL;
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 2.5, y + 2.5, CELL - 5, CELL - 5);
      ctx.globalAlpha = 1;
    }

    // 在 (cx, cy) 处居中画一个方块形状（用于 NEXT 预览）
    function drawShape(ctx, type, cx, cy, size) {
      var cs = CELLS[type], minX = 99, maxX = -99, minY = 99, maxY = -99, i;
      for (i = 0; i < cs.length; i++) {
        if (cs[i][0] < minX) minX = cs[i][0];
        if (cs[i][0] > maxX) maxX = cs[i][0];
        if (cs[i][1] < minY) minY = cs[i][1];
        if (cs[i][1] > maxY) maxY = cs[i][1];
      }
      var w = (maxX - minX + 1) * size, h = (maxY - minY + 1) * size;
      var ox = cx - w / 2, oy = cy + h / 2;             // y 向上为正
      for (i = 0; i < cs.length; i++) {
        var x = ox + (cs[i][0] - minX) * size;
        var y = oy - (cs[i][1] - minY + 1) * size;
        ctx.fillStyle = COLORS[type];
        ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
      }
    }

    function card(ctx, x, y, w, h, title) {
      ctx.fillStyle = 'rgba(255,255,255,.04)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(148,163,184,.18)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      if (title) {
        ctx.fillStyle = 'rgba(148,163,184,.75)';
        ctx.font = '11px -apple-system, "PingFang SC", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(title, x + 10, y + 16);
      }
    }

    function draw(ctx, api) {
      /* 背景 */
      ctx.fillStyle = '#0b1020';
      ctx.fillRect(0, 0, W, H);

      /* 棋盘底 */
      ctx.fillStyle = '#0e1628';
      ctx.fillRect(BX, BY, COLS * CELL, ROWS * CELL);

      /* 网格线 */
      ctx.strokeStyle = 'rgba(255,255,255,.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var c = 1; c < COLS; c++) {
        ctx.moveTo(BX + c * CELL + 0.5, BY);
        ctx.lineTo(BX + c * CELL + 0.5, BY + ROWS * CELL);
      }
      for (var r = 1; r < ROWS; r++) {
        ctx.moveTo(BX, BY + r * CELL + 0.5);
        ctx.lineTo(BX + COLS * CELL, BY + r * CELL + 0.5);
      }
      ctx.stroke();

      /* 已锁定的格子 */
      for (var rr = 0; rr < ROWS; rr++) {
        for (var cc = 0; cc < COLS; cc++) {
          if (grid[rr][cc]) drawBlock(ctx, cc, rr, COLORS[grid[rr][cc]]);
        }
      }

      /* 幽灵落点（对应 Ghost.cs） */
      if (piece && !over) {
        var gy = ghostY();
        for (var i = 0; i < piece.cells.length; i++) {
          var gx = piece.x + piece.cells[i][0], gyy = gy + piece.cells[i][1];
          if (gyy >= Y_MIN && gyy < Y_MAX && gyy !== piece.y + piece.cells[i][1]) {
            drawGhostBlock(ctx, colOf(gx), rowOf(gyy), COLORS[piece.type]);
          }
        }
      }

      /* 活动方块 */
      if (piece) {
        for (var k = 0; k < piece.cells.length; k++) {
          var px = piece.x + piece.cells[k][0], py = piece.y + piece.cells[k][1];
          if (py >= Y_MIN && py < Y_MAX) drawBlock(ctx, colOf(px), rowOf(py), COLORS[piece.type]);
        }
      }

      /* 棋盘边框 */
      ctx.strokeStyle = 'rgba(148,163,184,.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(BX + 0.5, BY + 0.5, COLS * CELL - 1, ROWS * CELL - 1);

      /* ---------- 右侧信息栏 ---------- */
      var PX = PANEL_X, PW = 214;

      /* HUD：分数 / 等级 / 消行 */
      card(ctx, PX, 10, PW, 84, null);
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(148,163,184,.8)';
      ctx.font = '12px -apple-system, "PingFang SC", sans-serif';
      ctx.fillText('分数', PX + 12, 34);
      ctx.fillText('等级', PX + 12, 58);
      ctx.fillText('消行', PX + 12, 82);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 16px "SF Mono", Menlo, Consolas, monospace';
      ctx.fillText(String(score), PX + PW - 12, 35);
      ctx.fillText(String(level), PX + PW - 12, 59);
      ctx.fillText(String(lines), PX + PW - 12, 83);

      /* NEXT 预览 */
      card(ctx, PX, 104, PW, 84, 'NEXT');
      if (nextType) drawShape(ctx, nextType, PX + PW / 2, 152, 16);

      /* 操作说明 */
      card(ctx, PX, 198, PW, 132, '操作');
      ctx.textAlign = 'left';
      ctx.font = '11.5px -apple-system, "PingFang SC", sans-serif';
      ctx.fillStyle = 'rgba(203,213,225,.85)';
      var tips = [
        '← →      左右移动',
        '↑ / X    顺时针旋转',
        'Z        逆时针旋转',
        '↓        软降（+1 分）',
        '空格     硬降',
        '点/拖棋盘  平移',
        'P 暂停 · R 重开'
      ];
      for (var t = 0; t < tips.length; t++) {
        ctx.fillText(tips[t], PX + 12, 222 + t * 16);
      }

      /* 两个触屏按钮 */
      ctx.fillStyle = 'rgba(56,189,248,.16)';
      ctx.fillRect(BTN_ROT.x, BTN_ROT.y, BTN_ROT.w, BTN_ROT.h);
      ctx.fillRect(BTN_DROP.x, BTN_DROP.y, BTN_DROP.w, BTN_DROP.h);
      ctx.strokeStyle = 'rgba(56,189,248,.45)';
      ctx.strokeRect(BTN_ROT.x + 0.5, BTN_ROT.y + 0.5, BTN_ROT.w - 1, BTN_ROT.h - 1);
      ctx.strokeRect(BTN_DROP.x + 0.5, BTN_DROP.y + 0.5, BTN_DROP.w - 1, BTN_DROP.h - 1);
      ctx.fillStyle = '#7dd3fc';
      ctx.font = '600 13px -apple-system, "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('旋转', BTN_ROT.x + BTN_ROT.w / 2, BTN_ROT.y + 23);
      ctx.fillText('硬降', BTN_DROP.x + BTN_DROP.w / 2, BTN_DROP.y + 23);

      /* 结束遮罩 */
      if (over) {
        ctx.fillStyle = 'rgba(11,16,32,.82)';
        ctx.fillRect(BX, BY, COLS * CELL, ROWS * CELL);
        ctx.fillStyle = '#fca5a5';
        ctx.font = '600 20px -apple-system, "PingFang SC", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束', BX + COLS * CELL / 2, BY + ROWS * CELL / 2 - 8);
        ctx.fillStyle = 'rgba(226,232,240,.8)';
        ctx.font = '13px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('得分 ' + score + ' · 按空格重开', BX + COLS * CELL / 2, BY + ROWS * CELL / 2 + 18);
      }
    }

    /* ---------- 重开 ---------- */
    function resetGame() {
      newGrid();
      bag = [];
      refillBag();
      nextType = takeType();
      now = 0; lockTime = 0;
      score = 0; lines = 0; level = 1;
      stepDelay = STEP_BASE;
      over = false;
      dragging = false;
      dragX = null;
      spawnPiece();
    }

    /* ---------- 鼠标 / 触屏 ---------- */
    function inRect(p, x, y, w, h) {
      return p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h;
    }

    function pointToTarget(x) {
      if (!piece) return;
      var col = Math.floor((x - BX) / CELL);
      if (col < 0) col = 0;
      if (col > COLS - 1) col = COLS - 1;
      // 让方块水平中心对齐点击的那一列
      var minX = 99, maxX = -99;
      for (var i = 0; i < piece.cells.length; i++) {
        if (piece.cells[i][0] < minX) minX = piece.cells[i][0];
        if (piece.cells[i][0] > maxX) maxX = piece.cells[i][0];
      }
      dragX = Math.round(col - 5 - (minX + maxX) / 2);
    }

    function onPointer(x, y, down, api) {
      if (down) {
        var p = { x: x, y: y };
        if (over) { api.reset(); return; }
        if (inRect(p, BTN_ROT.x, BTN_ROT.y, BTN_ROT.w, BTN_ROT.h)) { doRotate(1); return; }
        if (inRect(p, BTN_DROP.x, BTN_DROP.y, BTN_DROP.w, BTN_DROP.h)) { hardDrop(); return; }
        if (x >= BX && x <= BX + COLS * CELL && y >= BY && y <= BY + ROWS * CELL) {
          dragging = true;
          pointToTarget(x);
        }
      }
    }

    function onPointerMove(x, y, api) {
      if (!dragging) return;
      if (x >= BX && x <= BX + COLS * CELL) pointToTarget(x);
    }

    function onPointerUp(api) {
      dragging = false;
    }

    /* ---------- 键盘：X / Z 不在引擎按键表里，自己挂一个轻量监听 ---------- */
    function onDocKey(e) {
      var tag = e.target && e.target.tagName;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
      if (e.code === 'KeyX' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        doRotate(1);
      } else if (e.code === 'KeyZ' || e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        doRotate(-1);
      }
    }
    document.addEventListener('keydown', onDocKey);

    /* ---------- 对外接口 ---------- */
    resetGame();
    api.log('新一局开始：7-bag 随机（源码 Board.cs:57 用纯随机，这里升级为每 7 个一轮）', 'sys');

    return {
      w: W, h: H,
      reset: function () {
        resetGame();
        api.log('已重开：分数 / 等级 / 棋盘全部清零', 'sys');
      },
      update: update,
      draw: draw,
      onPointer: onPointer,
      onPointerMove: onPointerMove,
      onPointerUp: onPointerUp,
      onKey: function (k, down, api) {
        if (!down) return;

        if (over) {
          if (k === 'fire') api.reset();
          return;
        }

        if (k === 'up') doRotate(1);        // ↑ 顺时针（带踢墙）
        else if (k === 'fire') hardDrop();  // 空格 硬降
        else if (k === 'down') api.log('按住 ↓ 软降，每格 +1 分', 'info');
      },
      destroy: function () {
        document.removeEventListener('keydown', onDocKey);
      }
    };
  }
});
