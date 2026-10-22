/* =============================================================================
 * 2048 · 数字合并
 * -----------------------------------------------------------------------------
 * 本文件三部分：
 *   1) create(api) —— 浏览器里可玩的 Canvas 复刻版（与 Unity 版逻辑一一对应）
 *   2) notes       —— 逐句讲解：「为什么这么写」
 *   3) think       —— 开发思维与步骤拆解
 * ========================================================================== */

UG_LESSON('game2048', {

  /* ---------------- 元数据 ---------------- */

  name: '2048',
  ico: '🔢',
  difficulty: 4,
  tags: ['网格索引', '滑动合并', '协程动画', 'ScriptableObject'],
  controls: '↑↓←→ 或 W/A/S/D 滑动；也可以在棋盘上按住鼠标（或手指）划一下。空格 / 回车 或点击「重新开始」按钮重开，P 暂停。',
  oneLiner: '16 个格子里，两个相同数字撞在一起就翻倍。用「一维数组 + 方向向量」把四个方向的滑动统一成一份遍历逻辑，再靠 locked 标记保证一次移动里每个方块只合并一次。',

  /* ---------------- 逐句讲解：文件名 → 行号 → 讲解 ---------------- */

  notes: {

    'TileBoard.cs': {
      79: '向上滑动时，遍历从 y=1 开始、y 递增 —— 也就是「跳过贴着目标那一壁的第 0 行，从离壁第二近的那一行往外扫」。为什么必须这样：格子在内存里是行优先的一维数组（index = y*4 + x），先把靠目标壁最近的方块推到位，它后面的方块才有的地方可去；反过来扫会出现「一次移动跨多格」和「同一方块被合并两次」这两个 2048 最经典的 bug。',
      88: '向右滑动时，x 的步长变成 -1：从 x=Width-2 起往 x=0 递减，跳过最右列。四个方向共用同一个 Move 函数，不同的只是起点与步长 —— 这就是「把方向抽象成参数」的价值：一份遍历逻辑覆盖四种滑动，改一处就全改，也不用为四个方向各写一份几乎一样的代码。',
      103: '循环边界写成双向判断 x >= 0 && x < grid.Width，因为步长可能是 +1 也可能是 -1，只写一个方向就会直接漏掉半边棋盘。这是「步长可正可负」的循环最容易踩的坑。',
      147: '不是一格一格往前挪，而是先一路探到「最远的空格」再一次性 MoveTo。原因有两个：一是玩家的角度「能滑多远就滑多远」，逐格挪会产生多次不必要的动画；二是中途停下来的话，会在半路上和本不该相遇的方块做合并判定。先探路、后落子，判定才是干净的。',
      164: 'locked 是本作最容易漏掉的一个标记。看 [2,2,2,2] 向右滑：第 1 个 2 和第 2 个 2 合成 4，这个 4 是本回合刚产生的中间结果，它不能再被第 3 个 2 合并 —— 否则一次滑动就会直接合出 8。锁在合并瞬间打上（Tile.cs:89），等这一步的动画播完再统一解锁（TileBoard.cs:212）。凡是「一个回合内多次判定」的规则，都要问自己这句：本回合产生的中间结果，还能不能被同一回合再次消费？',
      183: '加分用的是 newState.number，也就是「合并之后的新数字」，而不是参与合并的任一方的原值 —— 所以 2+2 记 4 分，1024+1024 记 2048 分。更值得注意的是：TileBoard 从头到尾没有 score 字段，它只负责报告「发生了什么」，分数怎么累加、要不要刷新 UI、要不要写最高分，全交给 GameManager。棋盘与计分彻底解耦。',
      205: '用协程等 0.1 秒，而不是滑动完立刻结算。因为方块的位置在逻辑上瞬间就到位了，但画面上还在半路：如果不等动画播完就生成新方块，新方块会落进「它看起来还占着」的那个格子里，视觉上就是方块凭空重叠再弹开。0.1f 正好与 Tile.Animate 的 duration 对齐 —— 两个数字必须一致，否则要么动画被截断、要么输入被多锁一会儿。',
      216: '只有棋盘没满才生成新方块。用「存活方块数 == 格子总数」来判断满，比遍历 16 个格子找空格更省，也和 CheckForGameOver 的判据完全同源 —— 两处用同一个条件，就不会出现「明明满了却还在刷方块」或「还有空格却判负」的错位。'
    },

    'GameManager.cs': {
      20: '[DefaultExecutionOrder(-1)] 让本脚本的 Awake 先于所有其它脚本执行。因为 TileBoard 会在自己的逻辑里访问 GameManager.Instance（比如合并后加分），如果单例还没建立，拿到的就是 null。Unity 的脚本执行顺序默认是「不保证」的，凡是做单例/全局管理器的脚本都应该显式声明这个顺序，而不是靠运气。',
      149: 'PlayerPrefs.GetInt(key, 默认值) 是 Unity 最简单的本地持久化键值存储，第二个参数是键不存在时返回的兜底值。最高分这种「跨局保留、量又很小」的数据用它最合适；反过来，频繁读写或结构化的数据就不该放这里。'
    },

    'Tile.cs': {
      89: '合并时把目标方块的 locked 置为 true —— 这就是 TileBoard.CanMerge 里那个 !b.locked 的源头。锁的粒度很讲究：锁的是「留下来的那个方块」（它马上要升一级），而不是移动过来的那个（它马上就销毁了）。锁错对象的话，[4,2,2] 这类局面依然会出错。',
      108: 'Vector3.Lerp(from, to, elapsed / duration) 是补间动画的最小实现：起点和终点在循环外各记一次（from 是动画开始时的真实位置），循环里只做一次线性插值。为什么不直接 transform.position += 方向 * 速度？因为补间能保证「恰好在 duration 秒到达、恰好停在终点」，而增量累加会受帧率影响，最后还要额外纠正一次位置。玩家看的是「这个数字从哪儿来的」，可预期的落点比物理感更重要。'
    },

    'TileGrid.cs': {
      38: '整行代码就是本作的坐标基石：一维数组下标 i 换算成二维坐标 —— 列 = i % Width，行 = i / Width（整数除法自动按行分组）。反过来取格子时就是 index = y * Width + x。4×4 棋盘在内存里只是 0..15 的一段连续数组，「上下左右」四个方向则退化成 ±1 / ±Width 四个偏移量。把空间关系翻译成索引运算，是扫雷、炸弹人、俄罗斯方块、吃豆人所有网格游戏的同一套基本功。'
    },

    'TileState.cs': {
      16: '[CreateAssetMenu] 让「一种数字方块」能在 Project 视图里右键创建成 .asset 资产：2、4、8… 各自一个资产，颜色和数字在 Inspector 里填，代码一个字都不用改。这就是 ScriptableObject 的意义 —— 把「数据」从「代码」里拎出来。写在代码里当然也能跑，但那样每调一次配色都要改代码、重新编译，还无法让两个变体共存（比如做一套暗色皮肤）。判断标准很简单：会经常改、且非程序员也要改的东西，就该是资产而不是常量。'
    }
  },

  /* ---------------- 开发思维与步骤 ---------------- */

  think: {
    core: [
      '第一条思维：把二维棋盘压成一维数组。16 个格子在内存里就是 0..15，「上」是 -4、「下」是 +4、「左」是 -1、「右」是 +1。一旦完成这个翻译，四个方向的滑动就不再是四段代码，而是同一段遍历换四个参数（起点 + 步长）。网格类游戏（扫雷的展开、炸弹人的连锁爆炸、俄罗斯方块的碰撞检测）全都是这一个动作的变体。',
      '第二条思维：一次移动里每个方块只能合并一次，所以要有「回合内状态锁」。2048 最经典的 bug 不是合并规则写错，而是忘了给「本回合刚合成出来的方块」上锁，于是 [2,2,2,2] 一次滑动直接合出 8。推广出去：凡是「一个回合内会连续判定多次」的规则（连锁消除、连击计数、链式爆炸），都必须明确回答一句 —— 本回合产生的中间结果还能不能被再次消费？',
      '第三条思维：逻辑瞬间完成，表现延迟跟上。按下方向键的那一帧，棋盘数据在内存里已经是最终状态了；动画只是把这段变化「回放」给玩家看（Tile 里 0.1 秒的 Lerp 补间 + TileBoard 里 WaitForChanges 的协程等待）。数据与表现分离之后，逻辑可以脱离动画单独测试，动画也可以随便调时长而不影响规则 —— 这是所有带动画的回合制玩法都该有的结构。'
    ],

    steps: [
      { t: '① 定规则：一句话说清游戏',
        d: '4×4 棋盘，每次滑动所有方块朝该方向挤到底；相同数字相撞合并成两倍，得分 = 合并出来的数字之和；每步有效移动后随机空位生成一个新方块（90% 是 2、10% 是 4）；凑出 2048 算赢，棋盘满且四方向都合不动算输。规则里最关键的一句是「每次移动每个方块最多合并一次」，后面所有代码结构都是为它服务的。' },
      { t: '② 搭世界：一维数组 + 索引换算',
        d: 'TileGrid 用 GetComponentsInChildren 把 16 个格子收集成一维 cells 数组，再用 i % Width / i / Width 给每个格子写回坐标（TileGrid.cs:38）。格子的「上下左右」不是存成引用，而是运行时由坐标 ±方向向量算出来（GetAdjacentCell），越界返回 null —— 边界判断就这样被统一到一个地方。' },
      { t: '③ 造角色：Tile + TileCell + TileState',
        d: 'TileCell 是「位置」（只记坐标和上面的方块），Tile 是「内容」（数字、动画、所在格），TileState 是「外观资产」（数字 → 背景色/文字色）。三者分开后，格子不需要知道颜色，方块不需要知道自己在第几行第几列，配色改资产即可。' },
      { t: '④ 建循环：输入 → 遍历 → 结算',
        d: 'Update 里只做一件事：读方向键，然后把「方向向量 + 遍历起点 + 步长」五个参数交给 Move（TileBoard.cs:79~88）。Move 按起点与步长双重循环，对每个有方块的格子调用 MoveTile；MoveTile 先探到最远空格，路上遇到同数字且未锁定的方块就合并。注意遍历必须「从贴着目标壁的那一侧开始」，否则靠壁的方块还没让位，后面的方块就会跨格或重复合并。' },
      { t: '⑤ 定交互：一次移动 = 一趟结算',
        d: '任意方块发生变化才启动 WaitForChanges 协程：先屏蔽输入（waiting），等 0.1 秒动画播完，再解锁全部方块 → 生成新方块 → 判定结束。玩家的一次按键被完整地包成「一趟」，中途不接受第二次输入 —— 这正是回合制手感的核心。' },
      { t: '⑥ 调手感：动画时长与输入锁',
        d: 'Tile.Animate 的 duration = 0.1f 要和 WaitForChanges 的 WaitForSeconds(0.1f) 严格一致：短了动画会被截断，长了输入会被白白多锁一会儿。合并落地的方块换一套配色并弹一下（本复刻版里的 pop 缩放），让玩家一眼看出「这两个数是在哪儿合成的」。' },
      { t: '⑦ 做流程：开局、结束、重开',
        d: 'GameManager.Start → NewGame：分数清零、读最高分、隐藏结束遮罩、棋盘清空并生成两个方块。结束判定放在 TileBoard.CheckForGameOver（满且四方向都不可合并），再回调 GameManager.GameOver 淡入遮罩。因为 NewGame 把所有复位动作收在一处，重开一局就只是再调一次它。' }
    ],

    transfer: [
      '「一维数组 + 方向向量」的网格建模 → 扫雷的九宫格展开、炸弹人的 Tilemap 连锁爆炸、俄罗斯方块的落点检测、吃豆人的路径点图，底层都是同一个索引换算。',
      '「回合内状态锁」→ 消消乐的连锁计数、炸弹人的同一次爆炸不重复触发、蜈蚣的 Mushroom 一次只受一次伤害，本质都是「本回合产生的中间结果不能再被消费」。',
      '「逻辑瞬间完成 + 协程回放动画」→ 太空侵略者的方阵步进、打砖块的关卡切换、大金刚的场景淡入，凡是「规则与表现时长不一致」的地方都需要这一层等待。'
    ]
  },

  /* =========================================================================
   * create(api) —— 可玩的浏览器复刻版
   *
   * 刻意与 Unity 版保持结构一致：
   *   grid（一维 16 格）+ tiles（存活方块）+ ghosts（合并动画中的残影）
   *   Update 读输入 → Move 遍历 → MoveTile 探路 → Merge 加锁 → 协程等待结算
   * 变量名也对应，方便对照源码阅读。
   * ======================================================================= */

  create: function (api) {

    /* ---------- 世界尺寸（逻辑坐标，与显示分辨率无关） ---------- */
    var W = 640, H = 440;

    /* ---------- 棋盘几何：对应 TileGrid 的 4×4 ---------- */
    var N = 4;                                   // grid.Width / grid.Height
    var CELL = 92, GAP = 10, PAD = 10;           // 格子边长 / 间隙 / 内边距
    var BOARD = PAD * 2 + CELL * N + GAP * (N - 1);
    var BX = 16, BY = (H - BOARD) / 2;           // 棋盘左上角

    /* 右侧信息面板与「重新开始」按钮 */
    var PANX = BX + BOARD + 16;
    var PANW = W - PANX - 14;
    var BTN = { x: PANX, y: 296, w: PANW, h: 42 };

    /* ---------- TileState 的浏览器版：数字 → 背景色 / 文字色 ---------- */
    var COLORS = {
      2: '#eee4da|#776e65', 4: '#ede0c8|#776e65', 8: '#f2b179|#f9f6f2',
      16: '#f59563|#f9f6f2', 32: '#f67c5f|#f9f6f2', 64: '#f65e3b|#f9f6f2',
      128: '#edcf72|#f9f6f2', 256: '#edcc61|#f9f6f2', 512: '#edc850|#f9f6f2',
      1024: '#edc53f|#f9f6f2', 2048: '#edc22e|#f9f6f2'
    };
    var BIG = '#3c3a32|#f9f6f2';                 // 超过 2048 的统一配色

    function stateOf(n) {
      var v = COLORS[n] || BIG;
      var p = v.split('|');
      return { bg: p[0], fg: p[1] };
    }
    function fontFor(n) {
      var s = String(n).length;
      if (s <= 2) return 40;
      if (s === 3) return 32;
      if (s === 4) return 26;
      return 21;
    }

    /* ---------- 动画参数：对应 Tile.Animate 的 duration = 0.1f ---------- */
    var DUR = 0.13;      // 滑动补间时长
    var POPD = 0.16;     // 生成 / 合并的弹出时长

    /* ---------- 状态 ---------- */
    var grid;            // 16 个格子的方块引用（对应 TileCell.tile）
    var tiles;           // 存活方块（对应 TileBoard.tiles）
    var ghosts;          // 合并动画中的残影（对应已被 Remove 但还在播动画的 a）
    var score = 0, best = 0, moves = 0;
    var waiting = false; // 对应 TileBoard.waiting
    var over = false, won = false;
    var mMerged = 0, mGained = 0;   // 本次移动的合并数 / 得分
    var varT = 0;
    var booted = false;             // 首次开局不刷日志，避免打断初始界面

    /* ---------- 工具：索引换算 ---------- */
    function idx(x, y) { return y * N + x; }
    function inb(x, y) { return x >= 0 && x < N && y >= 0 && y < N; }
    function cellX(cx) { return BX + PAD + cx * (CELL + GAP); }
    function cellY(cy) { return BY + PAD + cy * (CELL + GAP); }

    /* ---------- 方块工厂 ---------- */
    function newTile(n, cx, cy) {
      return {
        n: n, cx: cx, cy: cy,        // 逻辑格坐标
        ax: cx, ay: cy,              // 绘制用的浮点格坐标（补间中的当前值）
        sx: cx, sy: cy, t: 1, moving: false,
        locked: false, pendingN: 0, pop: 0, popMode: ''
      };
    }

    /* ---------- 生成新方块：对应 TileBoard.CreateTile ---------- */
    function spawn() {
      var empties = [], i;
      for (i = 0; i < N * N; i++) if (!grid[i]) empties.push(i);
      if (!empties.length) return null;

      var k = empties[Math.floor(Math.random() * empties.length)];
      var x = k % N, y = (k / N) | 0;
      // 源码固定生成 tileStates[0]（即 2）；这里按经典规则给 10% 概率出 4。
      var n = Math.random() < 0.9 ? 2 : 4;

      var t = newTile(n, x, y);
      t.pop = 1; t.popMode = 'spawn';
      grid[k] = t;
      tiles.push(t);

      if (booted) {
        api.hit('TileBoard.cs', 64);
        api.log('生成新方块 ' + n + ' → 格子 (' + x + ',' + y + ')，剩余空位 ' + (empties.length - 1), 'info');
      }
      return t;
    }

    /* ---------- 开局：对应 GameManager.NewGame ---------- */
    function newGame() {
      var i;
      grid = [];
      for (i = 0; i < N * N; i++) grid.push(null);
      tiles = [];
      ghosts = [];
      score = 0; moves = 0;
      waiting = false; over = false; won = false;

      if (booted) api.hit('GameManager.cs', 79);
      spawn();
      spawn();
      if (booted) api.log('新一局开始：棋盘已清空，随机生成 2 个方块', 'sys');
    }

    /* ---------- 补间：对应 Tile.Animate ---------- */
    function startAnim(t) {
      t.sx = t.ax; t.sy = t.ay;
      t.t = 0; t.moving = true;
    }
    function stepAnim(t, dt) {
      if (!t.moving) return true;
      t.t += dt / DUR;
      if (t.t >= 1) { t.t = 1; t.ax = t.cx; t.ay = t.cy; t.moving = false; return true; }
      t.ax = t.sx + (t.cx - t.sx) * t.t;      // Vector3.Lerp(from, to, t)
      t.ay = t.sy + (t.cy - t.sy) * t.t;
      return false;
    }

    /* ---------- 移动 / 合并：对应 TileBoard.MoveTile / CanMerge / MergeTiles ---------- */

    // 能否合并：数字相同，且目标本回合未被锁定（防止一步内二次合并）
    function canMerge(a, b) { return a.n === b.n && !b.locked; }

    function moveTo(t, x, y) {
      grid[idx(t.cx, t.cy)] = null;
      t.cx = x; t.cy = y;
      grid[idx(x, y)] = t;
      startAnim(t);
    }

    function mergeTiles(a, b) {
      grid[idx(a.cx, a.cy)] = null;            // a 不再属于任何格子（随后销毁）
      a.cx = b.cx; a.cy = b.cy;                // 动画终点 = 目标方块所在格
      startAnim(a);
      ghosts.push(a);

      var k = tiles.indexOf(a);                // 对应 tiles.Remove(a)
      if (k >= 0) tiles.splice(k, 1);

      b.locked = true;                          // 对应 cell.tile.locked = true
      b.pendingN = b.n * 2;                     // 合并结果等动画播完再生效

      mMerged++;
      mGained += b.n * 2;
    }

    function moveTile(t, dx, dy) {
      var nx = -1, ny = -1;
      var ax = t.cx + dx, ay = t.cy + dy, other;

      // 沿方向一路向前探：空格就继续，撞到方块则尝试合并或被挡住
      while (inb(ax, ay)) {
        other = grid[idx(ax, ay)];
        if (other) {
          if (canMerge(t, other)) { mergeTiles(t, other); return true; }
          break;
        }
        nx = ax; ny = ay;
        ax += dx; ay += dy;
      }

      if (nx >= 0) { moveTo(t, nx, ny); return true; }
      return false;
    }

    /* ---------- 一次滑动：对应 TileBoard.Update + Move ---------- */
    function tryMove(dx, dy) {
      if (over || waiting) return;

      var startX, incX, startY, incY, line, dname;
      // 技巧：从「贴着目标方向那一壁的第二格」开始，朝远离该壁的方向推进
      if (dy === -1)      { startX = 0;     incX = 1;  startY = 1;     incY = 1;  line = 79; dname = '上'; }
      else if (dy === 1)  { startX = 0;     incX = 1;  startY = N - 2; incY = -1; line = 85; dname = '下'; }
      else if (dx === -1) { startX = 1;     incX = 1;  startY = 0;     incY = 1;  line = 82; dname = '左'; }
      else                { startX = N - 2; incX = -1; startY = 0;     incY = 1;  line = 88; dname = '右'; }

      mMerged = 0; mGained = 0;

      var changed = false, x, y, t;
      for (x = startX; x >= 0 && x < N; x += incX) {
        for (y = startY; y >= 0 && y < N; y += incY) {
          t = grid[idx(x, y)];
          if (t) { if (moveTile(t, dx, dy)) changed = true; }
        }
      }

      if (!changed) {
        api.hit('TileBoard.cs', line);
        api.log('向' + dname + '滑动：没有任何方块移动，不生成新方块', 'warn');
        return;
      }

      waiting = true;                            // 对应 StartCoroutine(WaitForChanges())
      moves++;

      if (mMerged > 0) {
        score += mGained;
        if (score > best) best = score;
        api.hit('TileBoard.cs', 183);
      }
      api.hit('TileBoard.cs', line);
      api.log('向' + dname + '滑动：' +
              (mMerged ? mMerged + ' 处合并，+' + mGained + ' 分' : '仅移动，无合并') +
              '，累计 ' + score + ' 分', mMerged ? 'ok' : 'info');
    }

    /* ---------- 结算：对应 WaitForChanges 协程的后半段 ---------- */
    function settle() {
      var i, t;
      for (i = 0; i < tiles.length; i++) {
        t = tiles[i];
        if (t.pendingN) {
          t.n = t.pendingN;
          if (!won && t.n >= 2048) {
            won = true;
            api.hit('TileBoard.cs', 177);
            api.log('达成 2048！可以继续玩下去冲更高分（tileStates 用 Clamp 兜底，再往上不会再升档）', 'ok');
          }
          t.pendingN = 0;
          t.pop = 1; t.popMode = 'merge';
        }
        t.locked = false;                        // 对应 tile.locked = false
      }

      waiting = false;

      if (tiles.length < N * N) spawn();         // 对应 if (tiles.Count != grid.Size)
      if (!canMove()) gameOver();                // 对应 CheckForGameOver
    }

    /* ---------- 结束判定：对应 TileBoard.CheckForGameOver ---------- */
    function canMove() {
      var x, y, t, o;
      if (tiles.length < N * N) return true;
      for (y = 0; y < N; y++) {
        for (x = 0; x < N; x++) {
          t = grid[idx(x, y)];
          if (!t) return true;
          if (x + 1 < N) { o = grid[idx(x + 1, y)]; if (o && o.n === t.n) return true; }
          if (x - 1 >= 0) { o = grid[idx(x - 1, y)]; if (o && o.n === t.n) return true; }
          if (y + 1 < N) { o = grid[idx(x, y + 1)]; if (o && o.n === t.n) return true; }
          if (y - 1 >= 0) { o = grid[idx(x, y - 1)]; if (o && o.n === t.n) return true; }
        }
      }
      return false;
    }

    function gameOver() {
      over = true;
      api.hit('TileBoard.cs', 221);
      api.log('棋盘已满且四方向都无法合并 —— 游戏结束，本局 ' + score + ' 分（最高 ' + best + '）', 'err');
    }

    /* ---------- 最大值 / 空位数 ---------- */
    function maxN() {
      var m = 0, i;
      for (i = 0; i < tiles.length; i++) if (tiles[i].n > m) m = tiles[i].n;
      return m;
    }

    /* ---------- 每帧更新（推进补间 + 结算） ---------- */
    function update(dt, keys, api) {
      var i, done;

      for (i = 0; i < tiles.length; i++) {
        stepAnim(tiles[i], dt);
        if (tiles[i].pop > 0) {
          tiles[i].pop -= dt / POPD;
          if (tiles[i].pop < 0) tiles[i].pop = 0;
        }
      }
      for (i = ghosts.length - 1; i >= 0; i--) {
        if (stepAnim(ghosts[i], dt)) ghosts.splice(i, 1);
      }

      if (waiting) {
        done = (ghosts.length === 0);
        for (i = 0; done && i < tiles.length; i++) if (tiles[i].moving) done = false;
        if (done) settle();
      }

      publish();
    }

    /* ---------- 把关键状态推给底部面板（约 10Hz，别每帧刷 DOM） ---------- */
    function publish() {
      varT += 1;
      if (varT % 6) return;
      api.vars({
        'score': score,
        'hiscore': best,
        'moves(步数)': moves,
        'tiles(方块数)': tiles ? tiles.length : 0,
        'empty(空位)': (N * N - (tiles ? tiles.length : 0)),
        'maxTile': maxN(),
        'waiting(输入锁)': waiting ? 'true' : 'false',
        'state': over ? 'GameOver' : (won ? '已达成 2048 · 继续中' : '进行中')
      });
    }

    /* ---------- 绘图小工具 ---------- */
    function rr(ctx, x, y, w, h, r) {
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

    function drawTile(ctx, n, px, py, scale) {
      var st = stateOf(n);
      var s = CELL * scale;
      var ox = px + (CELL - s) / 2, oy = py + (CELL - s) / 2;
      ctx.fillStyle = st.bg;
      rr(ctx, ox, oy, s, s, 8);
      ctx.fill();
      ctx.fillStyle = st.fg;
      ctx.font = '700 ' + Math.round(fontFor(n) * scale) + 'px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(n), px + CELL / 2, py + CELL / 2 + 1);
    }

    function tileScale(t) {
      if (!t.pop) return 1;
      return t.popMode === 'spawn' ? (1 - 0.45 * t.pop) : (1 + 0.28 * t.pop);
    }

    /* ---------- 渲染 ---------- */
    function draw(ctx, api) {
      var i, x, y, t;

      /* 背景 */
      ctx.fillStyle = '#0b1020';
      ctx.fillRect(0, 0, W, H);

      /* 棋盘底板 */
      ctx.fillStyle = '#1e293b';
      rr(ctx, BX, BY, BOARD, BOARD, 12);
      ctx.fill();

      /* 空格子 */
      ctx.fillStyle = '#172033';
      for (y = 0; y < N; y++) {
        for (x = 0; x < N; x++) {
          rr(ctx, cellX(x), cellY(y), CELL, CELL, 8);
          ctx.fill();
        }
      }

      /* 静止的方块先画，移动的 / 残影后画（盖在上面，视觉上就是"滑过去"） */
      for (i = 0; i < tiles.length; i++) {
        t = tiles[i];
        if (t.moving) continue;
        drawTile(ctx, t.n, cellX(t.ax), cellY(t.ay), tileScale(t));
      }
      for (i = 0; i < ghosts.length; i++) {
        t = ghosts[i];
        drawTile(ctx, t.n, cellX(t.ax), cellY(t.ay), 1);
      }
      for (i = 0; i < tiles.length; i++) {
        t = tiles[i];
        if (!t.moving) continue;
        drawTile(ctx, t.n, cellX(t.ax), cellY(t.ay), tileScale(t));
      }

      /* ---------- 右侧信息面板 ---------- */
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 34px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText('2048', PANX, 40);

      /* 分数 / 最高分 */
      var bw = (PANW - 8) / 2;
      ctx.fillStyle = '#1e293b';
      rr(ctx, PANX, 56, bw, 58, 8); ctx.fill();
      rr(ctx, PANX + bw + 8, 56, bw, 58, 8); ctx.fill();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 11px -apple-system, "PingFang SC", sans-serif';
      ctx.fillText('SCORE', PANX + bw / 2, 72);
      ctx.fillText('BEST', PANX + bw + 8 + bw / 2, 72);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 24px "SF Mono", Menlo, Consolas, monospace';
      ctx.fillText(String(score), PANX + bw / 2, 98);
      ctx.fillText(String(best), PANX + bw + 8 + bw / 2, 98);

      /* 状态行 */
      ctx.textAlign = 'left';
      ctx.font = '13px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('步数 ' + moves + '   空位 ' + (N * N - tiles.length), PANX, 142);
      ctx.fillText('最大方块 ' + maxN(), PANX, 164);
      ctx.fillStyle = won ? '#6ee7b7' : '#64748b';
      ctx.fillText(won ? '已达成 2048 · 可继续' : '目标：凑出 2048', PANX, 186);

      /* 操作提示 */
      ctx.fillStyle = '#64748b';
      ctx.font = '12px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText('↑↓←→ / WASD 滑动', PANX, 222);
      ctx.fillText('也可在棋盘上拖动', PANX, 240);
      ctx.fillText('R 重开 · P 暂停 · 空格重开', PANX, 258);

      /* 重新开始按钮 */
      ctx.fillStyle = '#334155';
      rr(ctx, BTN.x, BTN.y, BTN.w, BTN.h, 8);
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 15px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('重新开始', BTN.x + BTN.w / 2, BTN.y + 26);

      /* 结束遮罩 */
      if (over) {
        ctx.fillStyle = 'rgba(11,16,32,.82)';
        rr(ctx, BX, BY, BOARD, BOARD, 12);
        ctx.fill();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fca5a5';
        ctx.font = '700 34px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.fillText('游戏结束', BX + BOARD / 2, BY + BOARD / 2 - 8);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '14px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
        ctx.fillText('最终 ' + score + ' 分 · 最高 ' + best + ' 分', BX + BOARD / 2, BY + BOARD / 2 + 24);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('按 R 或点击「重新开始」再来一局', BX + BOARD / 2, BY + BOARD / 2 + 50);
      }
    }

    /* ---------- 鼠标 / 触屏：滑动手势 + 点击按钮 ---------- */
    var swiping = false, swiped = false, sx0 = 0, sy0 = 0;

    function inBtn(x, y) {
      return x >= BTN.x && x <= BTN.x + BTN.w && y >= BTN.y && y <= BTN.y + BTN.h;
    }

    function onPointer(x, y, down, api) {
      if (!down) return;
      if (inBtn(x, y)) {
        newGame();
        swiping = false;
        return;
      }
      swiping = true;
      swiped = false;
      sx0 = x; sy0 = y;
    }

    function onPointerMove(x, y, api) {
      if (!swiping || swiped) return;
      var dx = x - sx0, dy = y - sy0;
      var adx = dx < 0 ? -dx : dx, ady = dy < 0 ? -dy : dy;
      if (adx < 24 && ady < 24) return;          // 阈值：太短不算手势
      swiped = true;
      if (adx > ady) tryMove(dx > 0 ? 1 : -1, 0);
      else tryMove(0, dy > 0 ? 1 : -1);
    }

    function onPointerUp(api) {
      swiping = false;
      swiped = false;
    }

    /* ---------- 对外接口 ---------- */
    newGame();
    booted = true;

    return {
      w: W, h: H,
      reset: function () { newGame(); },
      update: update,
      draw: draw,
      onPointer: onPointer,
      onPointerMove: onPointerMove,
      onPointerUp: onPointerUp,
      onKey: function (k, down, api) {
        if (!down) return;
        if (k === 'up') tryMove(0, -1);
        else if (k === 'down') tryMove(0, 1);
        else if (k === 'left') tryMove(-1, 0);
        else if (k === 'right') tryMove(1, 0);
        else if (k === 'fire') newGame();
      }
    };
  }
});
