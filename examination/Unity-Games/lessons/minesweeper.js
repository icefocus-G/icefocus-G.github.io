/* =============================================================================
 * Minesweeper · 扫雷
 * -----------------------------------------------------------------------------
 * 本文件三部分：
 *   1) create(api) —— 浏览器里可玩的 Canvas 复刻版（与 Unity 版逻辑一一对应）
 *   2) notes       —— 逐句讲解：「为什么这么写」
 *   3) think       —— 开发思维与步骤拆解
 *
 * 对照源码的四个 C# 文件：
 *   Game.cs     —— 总控：输入（鼠标三键）→ 翻开/插旗/和弦 → 输赢判定
 *   CellGrid.cs —— 数据层：二维数组 + 布雷 + 算数字 + 边界/相邻工具
 *   Board.cs    —— 显示层：根据 Cell 状态选 Tile，SetTile 到 Tilemap
 *   Cell.cs     —— 一个格子的数据：type（枚举）+ 4 个状态机 bool
 * ========================================================================== */

UG_LESSON('minesweeper', {

  /* ---------------- 元数据 ---------------- */

  name: '扫雷 Minesweeper',
  ico: '💥',
  difficulty: 3,
  tags: ['状态机', 'Flood Fill', '鼠标三键', 'Tilemap'],
  controls: '鼠标左键翻开格子（点已翻开的数字格 = 和弦快速展开）；按 F 或点右上角「插旗模式」按钮切换为插旗模式，再点左键插旗 / 取消旗。方向键移动光标，空格 / 回车 = 对光标处执行当前模式的操作。R 重新开局。',
  oneLiner: '16×16 格子里藏着 32 颗雷。点开一个空格，水波一样扩散出一片安全区 —— 这个「扩散」就是 Flood Fill。用最少的代码量，把「格子状态机 + 递归展开 + 首点安全」三件事讲透。',

  /* ---------------- 逐句讲解：文件名 → 行号 → 讲解 ---------------- */

  notes: {

    'Game.cs': {
      26: 'generated 标志是「首点布雷」的开关：雷区一开始是空的，第一次左键才真正布雷。为什么不一开始就布？因为随机布雷有可能刚好布在玩家第一下点的格子上，第一下就踩雷是最糟糕的体验。留到首点再布，就可以把首点及其 8 邻格全部排除，保证第一下必定踩在空格上、立刻触发 Flood Fill 展开一片。',
      51: 'StopAllCoroutines() 是防止「上一局的动画还在跑」的经典防御。Flood 是用协程做的逐格展开动画，如果玩家在展开过程中按 R 重开，旧协程还会继续翻格子，和新局的雷区数据搅在一起，产生莫名其妙的格子。开新局前先全部停掉，是最省事也最可靠的做法。',
      84: '这是「鼠标三键」的读法，一行一个键：GetMouseButtonDown(0)=左键刚按下→翻开；GetMouseButtonDown(1)=右键刚按下→插旗；GetMouseButton(2)=中键持续按住→和弦高亮预览；GetMouseButtonUp(2)=中键抬起→执行和弦。注意 Down 只在按下那一帧为 true（单击），不带 Down 的 GetMouseButton 在按住期间每帧都为 true（持续）。用 else if 串起来，保证一帧只处理一种输入。',
      99: '第一次翻开时才布雷：GenerateMines 避开首点及其 8 邻格，GenerateNumbers 再把每格周围的雷数算出来。注意这两步有严格顺序 —— 必须先布完雷，数字才算得准；如果反过来，先算数字时雷还没放上去，所有格子都会算成 0。',
      121: 'switch (cell.type) 就是整个游戏的状态机分流点。格子只有三种「本质」：Empty（空格，要连锁展开）、Mine（雷，爆炸游戏结束）、Number（数字格，只翻自己）。用枚举 switch 而不是 if 链，好处是新增类型时编译器会提示漏了分支；而且这里的「行为差异」完全由类型决定，读起来一目了然。',
      152: '★ Flood Fill 最关键的一行：if (cell.revealed) yield break;。为什么必须有？因为 Flood 会向上下左右四个邻居各起一个新协程，而邻居的邻居里又包含「来时那一格」。一旦允许已翻开的格子再走一遍，就会 A→B→A→B…无限递归，协程数量指数级爆炸，直接卡死。所以「标记已访问」不是优化，是正确性的必要条件 —— 每个格子一旦翻开就立刻置 revealed=true，这个赋值本身就是「已访问」标记。',
      266: '和弦（Chord）的判定：某个已翻开的数字格周围插旗数 >= 它自己的数字，说明雷已经被标齐了，剩下没翻的邻格必定安全，可以一次性全部翻开。这是扫雷高手最常用的提速技巧 —— 不用一格格点，插够旗后中键一按清一大片。注意要用 <= 的反向思维：< 数字说明旗还没插够，此时展开可能会踩雷，必须拦住。'
    },

    'CellGrid.cs': {
      50: 'GenerateMines(startingCell, amount) 的参数设计就藏着「首点安全」这件事：把玩家第一下点的格子传进来，布雷时才能绕开它。如果不传这个参数，函数内部无从知道该避开哪一格 —— 这就是「把约束显式地写进函数签名」的好处，调用方一眼就能看出「布雷和首点有关」。',
      66: 'while 循环是「拒绝采样」的兜底：随机选到的格子如果已经是雷，或者与首点相邻（IsAdjacent，8 邻域），就沿行→列的顺序往后扫，直到找到一个合格位置。为什么用扫描而不是重新 random？因为雷越布越多时，纯随机重试的失败率会飙升（最后是「雷比空格还多」的死循环），线性扫描保证一定能找到空位。',
      110: '一行完成「数字 → 类型」的归类：number > 0 就变成 Number（翻开展示数字），number == 0 就保持 Empty（翻开后触发 Flood Fill）。这行决定了后面 Flood 会不会连锁 —— 数字格是「水波」停下来的边界，空格才是水能流过的地方。所以这行其实是给 Flood Fill 划定地形的。',
      182: 'Try 风格的安全访问：在界内就通过 out 参数返回格子并返回 true，越界返回 false。角落格子的 8 邻域有一半是越界的，如果每个调用点都手写 x >= 0 && x < Width 会写得又长又容易漏；集中到一个方法里，调用方 if (grid.TryGetCell(...)) 就同时完成了「越界检查 + 取值」两件事。'
    },

    'Board.cs': {
      66: 'GetTile 就是「格子状态机」的显示侧：它不是一堆 if (a && !b) 的布尔组合，而是一条有优先级的 if-else 链 —— revealed（已翻开）> flagged（已插旗）> chorded（和弦高亮）> unknown（未翻开）。为什么必须用优先级链而不是独立布尔？因为 revealed 与 flagged 在规则上是互斥的（插旗的格子不会被翻开，见 Game.cs:119），用链可以从结构上保证「已翻开优先显示内容」，不会出现同时为真时不知道画哪个的歧义。已翻开之后再按 type 分流：空格 → tileEmpty，雷 → 看 exploded 决定用 tileExploded 还是 tileMine（爆炸单独一张红底贴图，让玩家一眼看到死在哪一颗上），数字 → 按 number 选 1~8。'
    },

    'Cell.cs': {
      12: '枚举 Type（Empty / Mine / Number）表达的是格子「不可改变的本质」，三选一、互斥，所以用枚举而不是三个 bool。反过来，revealed / flagged / exploded / chorded 表达的是格子「会随游戏进程改变的状态」，可以叠加、有优先级，所以用 bool。把这两类信息分开，是这个数据结构的精髓：枚举管「它是什么」，布尔管「玩家看到它到哪一步了」。如果全部用 bool（isMine / isNumber / isEmpty…），就会出现「既是雷又是空格」这种逻辑上不可能、编译器却拦不住的非法状态。',
      33: 'flagged 与 revealed 在设计上是互斥的：插旗的格子不会被翻开（Game.Reveal 开头的 if (cell.flagged) return），已翻开的格子不能插旗（Game.Flag 开头的 if (cell.revealed) return）。两个方向都挡住，玩家怎么点都不会出现「又翻开了又插着旗」的非法状态 —— 这就是状态机比散装布尔值可靠的地方：非法转移在两个入口处就被拒绝了。'
    }
  },

  /* ---------------- 开发思维与步骤 ---------------- */

  think: {
    core: [
      '扫雷的核心思维是「把不可变属性和可变状态分开」。一个格子是什么（空格 / 雷 / 数字）从布雷那一刻就定了，永远不变；而玩家看到它到哪一步（未翻开 / 已翻开 / 插旗 / 爆炸）是随操作变化的。Cell 里用「一个枚举 + 四个布尔」精确表达了这个区分，Board.GetTile 再用一条优先级链把状态翻译成画面。先想清楚「哪些东西会变、哪些不会」，数据结构自然就长成这样了。',
      '第二条是递归 / 扩散思维，而且是带「已访问标记」的扩散。Flood Fill 看起来是「翻开一片空格」，本质是图上的遍历：每个格子是节点，四邻是边，遇到数字格就停。所有图遍历都必须在进入节点的第一时间打上已访问标记，否则在有环的图（这里四邻互相可达，环无处不在）里必然无限递归。这条规则在后面的炸弹人链式爆炸、2048 连锁合并里会原样再遇到一次。',
      '第三条是「把随机性推迟到最后一刻」。布雷是随机的，但不在开局布，而在玩家第一次点击时布，并且把首点周围排除掉。同一个随机算法，换个时机用，体验天差地别。做游戏时多问一句「这个随机能再晚一点决定吗」，往往就能白捡一次体验提升。'
    ],

    steps: [
      { t: '① 定规则：一句话说清游戏',
        d: '16×16 的雷区里有 32 颗雷。左键翻开格子：翻到雷立刻输；翻到数字只显示这一格；翻到空格则自动把连成一片的空格和数字边界全部展开。把所有非雷格都翻开即通关。插旗只是辅助标记，不参与胜负判定（但源码里通关后会自动把所有雷插上旗作为彩蛋）。' },
      { t: '② 搭世界：用整数网格而不是像素',
        d: '整个雷区是一个 16×16 的整数坐标系。玩家的鼠标坐标要经历「屏幕像素 → 世界坐标 → 整数格子坐标」两步换算（Game.TryGetCellAtMousePosition：ScreenToWorldPoint + tilemap.WorldToCell）。先把「点哪儿」这件事做对，后面所有操作才有落脚点。' },
      { t: '③ 造角色：一个格子就是一个状态机',
        d: 'Cell 只有 7 个字段：position（我在哪）+ type（我是什么）+ number（周围几颗雷）+ revealed / flagged / exploded / chorded（玩家看我到哪一步）。没有方法、不继承 MonoBehaviour，纯粹的数据容器。状态越少、越纯，后面出 bug 的概率就越低。' },
      { t: '④ 建循环：Update 只做「读输入 + 分流」',
        d: 'Update 每帧只干一件事 —— 看有没有键鼠输入，然后分派给 Reveal / Flag / Chord / Unchord 四个方法之一。所有规则都在这四个方法里，Update 本身不写任何规则。这样「什么时候触发」和「触发后干什么」彻底分离，想加个触屏或手柄支持只改 Update 一处。' },
      { t: '⑤ 定交互：三键各管一件事',
        d: '左键 = 翻开（Reveal），右键 = 插旗（Flag），中键 = 和弦（按住预览 Chord / 松开执行 Unchord）。三个键对应三种意图，互不重叠。浏览器里没有中键信息，本课时把和弦改成「左键点已翻开的数字格」，逻辑完全一样（都是 CountAdjacentFlags >= number 才放行）。' },
      { t: '⑥ 攻难点：Flood Fill 的防重复与动画',
        d: '扩散用协程实现：翻当前格 → yield return null 让出一帧 → 若仍是空格再向四邻各自递归。yield 让出了「逐格展开」的水波动画；开头的 if (cell.revealed) yield break 挡住了回头路。这一行是整个算法成败的关键，删掉它游戏会在第一次点空格时直接卡死。' },
      { t: '⑦ 做流程：布雷时机、输赢与重开',
        d: '首点布雷保证开局安全；踩雷时 Explode 把所有雷翻开亮给玩家看；CheckWinCondition 遍历全图，只要还有一个非雷格没翻开就 return（没赢）。重开走 NewGame，先 StopAllCoroutines 清掉可能还在跑的展开动画，再重建整个网格。' }
    ],

    transfer: [
      '「枚举管本质 + 布尔管状态」的数据建模 → 2048 的 Tile 状态（生成 / 移动 / 合并）、炸弹人的格子（空 / 墙 / 砖 / 炸弹）都是同一套思路。',
      '「带已访问标记的 Flood Fill」→ 炸弹人的链式爆炸判定、扫雷的和弦展开、任何「点一下扩散一片」的效果，本质都是同一个图遍历。',
      '「把随机性推迟到需要时再决定」→ 俄罗斯方块的 7-bag 随机袋、太空侵略者的随机开火时机，都是为了让随机结果更公平、更可控。'
    ]
  },

  /* =========================================================================
   * create(api) —— 可玩的浏览器复刻版
   *
   * 刻意与 Unity 版保持结构一致：
   *   Update 读输入 → Reveal / Flag / Chord 分流 → Flood 协程扩散 → board.Draw 重绘
   * 变量名也对应（grid / board / cell.revealed / generated / gameover），
   * 方便对照源码阅读。
   * ======================================================================= */

  create: function (api) {

    /* ---------- 画布尺寸（逻辑坐标，与显示分辨率无关） ---------- */

    var W = 640, H = 420;

    /* ---------- 雷区参数：对应 Game.width / height / mineCount ---------- */

    var COLS = 16, ROWS = 16, MINES = 32;
    var CELL = 22;                                  // 每格边长（含 1px 缝隙）
    var BX = Math.round((W - COLS * CELL) / 2);     // 雷区左上角 x = 144
    var BY = 56;                                    // 雷区左上角 y

    /* ---------- 格子类型：对应 Cell.Type 枚举 ---------- */

    var T_EMPTY = 0, T_MINE = 1, T_NUM = 2;

    /* ---------- HUD 上的可点区域（右上角两个按钮） ---------- */

    var BTN_MODE = { x: 372, y: 10, w: 148, h: 32 };
    var BTN_RESET = { x: 530, y: 10, w: 94, h: 32 };

    var FLOOD_STEP = 0.035;                         // 每展开一层的间隔（秒）

    /* ---------- 状态 ---------- */

    var grid = null;                                // 二维格子数组（对应 CellGrid）
    var generated = false;                          // 地雷是否已生成（Game.cs:26）
    var gameover = false;                           // 是否已结束
    var won = false;                                // 是否通关
    var flagMode = false;                           // false=翻开模式，true=插旗模式
    var elapsed = 0;                                // 已用时间（秒）

    var floodQ = [];                                // Flood 待展开队列（对应协程池）
    var floodT = 0;                                 // 展开计时器，模拟 yield return null
    var floodDepth = 0;                             // 递归 / BFS 层数
    var floodOpened = 0;                            // 本次连锁展开了几个格子
    var floodPending = false;                       // 本次连锁还没检查过输赢

    var hoverX = -1, hoverY = -1;                   // 鼠标悬停的格子
    var curX = 0, curY = 0;                         // 键盘光标
    var redraws = 0;                                // board.Draw 次数
    var varTick = 0;

    /* =====================================================================
     * 一、数据层：对应 CellGrid.cs
     * =================================================================== */

    /* 新建逻辑网格：对应 CellGrid 构造函数（CellGrid.cs:27） */
    function newCellGrid(w, h) {
      var cells = new Array(w);
      for (var x = 0; x < w; x++) {
        cells[x] = new Array(h);
        for (var y = 0; y < h; y++) {
          // 初始全部当作空格，真正布雷、算数字之后再覆盖 type
          cells[x][y] = {
            position: { x: x, y: y, z: 0 },
            type: T_EMPTY,
            number: 0,
            revealed: false,
            flagged: false,
            exploded: false,
            chorded: false,
            floodDepth: -1
          };
        }
      }
      return {
        cells: cells,
        width: w,
        height: h
      };
    }

    /* 边界判断：对应 CellGrid.InBounds（CellGrid.cs:189） */
    function inBounds(x, y) {
      return x >= 0 && x < grid.width && y >= 0 && y < grid.height;
    }

    /* 安全取格：越界返回 null —— 对应 TryGetCell（CellGrid.cs:182） */
    function tryGetCell(x, y) {
      return inBounds(x, y) ? grid.cells[x][y] : null;
    }

    /* 八邻域判断：对应 IsAdjacent（CellGrid.cs:196） */
    function isAdjacent(a, b) {
      return Math.abs(a.position.x - b.position.x) <= 1 &&
             Math.abs(a.position.y - b.position.y) <= 1;
    }

    /* 遍历 8 邻域的工具（源码里是两层 for + continue 跳过自己） */
    function forEachNeighbor8(cell, fn) {
      for (var dx = -1; dx <= 1; dx++) {
        for (var dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          var n = tryGetCell(cell.position.x + dx, cell.position.y + dy);
          if (n) fn(n);
        }
      }
    }

    /* 统计周围 8 格的地雷数：对应 CountAdjacentMines（CellGrid.cs:116） */
    function countAdjacentMines(cell) {
      var count = 0;
      forEachNeighbor8(cell, function (n) {
        if (n.type === T_MINE) count++;
      });
      return count;
    }

    /* 统计周围 8 格「已插旗且未翻开」的数量：对应 CountAdjacentFlags（CellGrid.cs:145） */
    function countAdjacentFlags(cell) {
      var count = 0;
      forEachNeighbor8(cell, function (n) {
        if (!n.revealed && n.flagged) count++;
      });
      return count;
    }

    /* 首点布雷：对应 GenerateMines（CellGrid.cs:50） */
    function generateMines(startingCell, amount) {
      var w = grid.width, h = grid.height;

      for (var i = 0; i < amount; i++) {
        var x = Math.floor(Math.random() * w);
        var y = Math.floor(Math.random() * h);
        var cell = grid.cells[x][y];

        // 与源码一致：已是雷 / 与首点相邻 → 沿行→列往后扫，直到找到合格位置
        var attempts = 0;
        while (cell.type === T_MINE || isAdjacent(startingCell, cell)) {
          x++;
          if (x >= w) { x = 0; y++; if (y >= h) y = 0; }   // 环形扫描兜底
          cell = grid.cells[x][y];
          // 源码靠「雷不会占满全图」保证循环结束；浏览器里死循环会卡死标签页，
          // 所以额外加一个尝试上限作为保险（雷数被调得过大时会看到这条警告）。
          attempts++;
          if (attempts > w * h * 4) {
            api.log('布雷中止：可用格子不足，请调小雷数', 'err');
            return;
          }
        }

        cell.type = T_MINE;
      }

      api.hit('CellGrid.cs', 66);
    }

    /* 计算每格数字并归类类型：对应 GenerateNumbers（CellGrid.cs:93） */
    function generateNumbers() {
      for (var x = 0; x < grid.width; x++) {
        for (var y = 0; y < grid.height; y++) {
          var cell = grid.cells[x][y];
          if (cell.type === T_MINE) continue;                 // 雷格不算数字

          cell.number = countAdjacentMines(cell);
          // 这行决定了 Flood Fill 的地形：数字格是水波停下的边界
          cell.type = cell.number > 0 ? T_NUM : T_EMPTY;
        }
      }
      api.hit('CellGrid.cs', 110);
    }

    /* =====================================================================
     * 二、显示层：对应 Board.cs
     * =================================================================== */

    /* 整张雷区重绘：对应 Board.Draw(grid)（Board.cs:44） */
    function boardDraw() {
      redraws++;
      // 只有不在连锁展开过程中才照亮这一行，避免每帧滚动代码区
      if (!floodQ.length) api.hit('Board.cs', 56);
    }

    /* =====================================================================
     * 三、总控：对应 Game.cs
     * =================================================================== */

    /* 开新局：对应 Game.NewGame()（Game.cs:48） */
    function newGame() {
      // 停掉上一局可能还在跑的 Flood（对应 StopAllCoroutines）
      floodQ.length = 0;
      floodT = 0;
      floodDepth = 0;
      floodOpened = 0;
      floodPending = false;
      api.hit('Game.cs', 51);

      gameover = false;
      won = false;
      generated = false;
      elapsed = 0;

      grid = newCellGrid(COLS, ROWS);
      boardDraw();

      api.log('新的一局：' + COLS + ' × ' + ROWS + '，共 ' + MINES + ' 颗雷。左键翻开，按 F 切插旗模式。', 'sys');
    }

    /* 屏幕坐标 → 格子：对应 TryGetCellAtMousePosition（Game.cs:337） */
    function cellAtMouse(px, py) {
      var cx = Math.floor((px - BX) / CELL);
      var cy = Math.floor((py - BY) / CELL);
      return tryGetCell(cx, cy);          // 越界返回 null
    }

    /* 左键点击入口：对应 Game.Reveal()（Game.cs:94） */
    function revealAtMouse(px, py) {
      api.hit('Game.cs', 339);            // ScreenToWorldPoint：屏幕像素 → 世界坐标
      api.hit('Game.cs', 340);            // WorldToCell：世界坐标 → 整数格子坐标

      var cell = cellAtMouse(px, py);
      if (!cell) return;

      // 已翻开的数字格 → 走和弦（源码里是中键）
      if (cell.revealed && cell.type === T_NUM) {
        doChord(cell);
        return;
      }

      revealFromMouse(cell);
    }

    function revealFromMouse(cell) {
      // 首点布雷：第一次翻开才生成地雷，并把首点周围排除（保证首点安全）
      if (!generated) {
        api.hit('Game.cs', 99);
        generateMines(cell, MINES);
        generateNumbers();
        generated = true;
        api.log('首点布雷完成 —— 首点 (' + cell.position.x + ',' + cell.position.y +
                ') 及其 8 邻格已排除，第一下必定安全', 'ok');
      }

      reveal(cell);
    }

    /* 翻开的统一入口，状态机分流：对应 Game.Reveal(Cell)（Game.cs:116） */
    function reveal(cell) {
      if (cell.revealed) return;          // 已翻开 → 忽略
      if (cell.flagged) return;           // 已插旗 → 不会被误翻

      api.hit('Game.cs', 121);

      if (cell.type === T_MINE) {
        api.hit('Game.cs', 125);
        explode(cell);
      } else if (cell.type === T_EMPTY) {
        api.hit('Game.cs', 130);
        startFlood(cell);                 // 空格 → 启动连锁展开
        checkWinCondition();
      } else {
        api.hit('Game.cs', 136);
        cell.revealed = true;             // 数字格 → 只翻自己
        checkWinCondition();
      }

      boardDraw();
    }

    /* Flood Fill 启动：对应 StartCoroutine(Flood(cell))（Game.cs:148） */
    function startFlood(cell) {
      floodQ.length = 0;
      floodQ.push({ x: cell.position.x, y: cell.position.y, d: 0 });
      floodT = FLOOD_STEP;                // 第一层立刻展开
      floodDepth = 0;
      floodOpened = 0;
      floodPending = true;
      api.hit('Game.cs', 148);
      api.log('Flood Fill 启动：从 (' + cell.position.x + ',' + cell.position.y + ') 开始扩散', 'info');
    }

    /* 展开一层（对应协程每次 yield return null 后的下一次执行） */
    function floodWave() {
      var wave = floodQ;
      floodQ = [];

      for (var i = 0; i < wave.length; i++) {
        var it = wave[i];
        var cell = tryGetCell(it.x, it.y);
        if (!cell) continue;                    // 越界

        // ★★ 防重复 / 防死循环的核心（对应 Game.cs:152）
        // 一个格子会被上下左右四个邻居各推一次，如果不判断 revealed，
        // 就会 A→B→A→B… 无限扩散。revealed = true 就是「已访问」标记。
        if (cell.revealed) continue;
        if (cell.flagged) continue;
        if (cell.type === T_MINE) continue;

        cell.revealed = true;
        cell.floodDepth = it.d;
        floodOpened++;
        if (it.d > floodDepth) floodDepth = it.d;

        // 只有空格才继续向外扩散，数字格到此为止（对应 Game.cs:163）
        if (cell.type === T_EMPTY) {
          pushFlood(it.x - 1, it.y, it.d + 1);   // left
          pushFlood(it.x + 1, it.y, it.d + 1);   // right
          pushFlood(it.x, it.y - 1, it.d + 1);   // down
          pushFlood(it.x, it.y + 1, it.d + 1);   // up
        }
      }
    }

    /* 入队：入队前先排掉已访问 / 已插旗的格子，避免队列膨胀 */
    function pushFlood(x, y, d) {
      var c = tryGetCell(x, y);
      if (!c) return;                            // 越界（InBounds）
      if (c.revealed || c.flagged) return;       // 已访问 → 不再入队
      floodQ.push({ x: x, y: y, d: d });
    }

    /* 插旗 / 取消旗：对应 Game.Flag()（Game.cs:181） */
    function flag(cell) {
      if (!cell) return;
      if (cell.revealed) return;                 // 已翻开 → 不能插旗

      cell.flagged = !cell.flagged;              // 取反：没旗→插旗，有旗→取消
      api.hit('Game.cs', 187);
      api.log('(' + cell.position.x + ',' + cell.position.y + ') ' +
              (cell.flagged ? '已插旗' : '取消插旗') +
              '，剩余雷数 ' + (MINES - countFlags()), 'info');

      // 插旗也可能直接达成胜利：插旗数 == 雷数且全部插在真雷上
      // （Unity 源码只在 Reveal 里判赢，这里补上，让「标完雷就算赢」这条规则生效）
      checkWinCondition();

      boardDraw();
    }

    /* 和弦：对应 Game.Unchord(Cell)（Game.cs:245） */
    function doChord(cell) {
      var flags = countAdjacentFlags(cell);
      api.hit('Game.cs', 266);

      if (flags < cell.number) {
        api.log('和弦失败：(' + cell.position.x + ',' + cell.position.y +
                ') 周围插旗 ' + flags + ' < 数字 ' + cell.number + '，先插够旗再展开', 'warn');
        return;
      }

      var list = [];
      forEachNeighbor8(cell, function (n) {
        if (!n.revealed && !n.flagged) list.push(n);
      });

      api.log('和弦展开：数字 ' + cell.number + ' 周围旗已插够 → 一次翻开 ' + list.length + ' 格', 'ok');
      for (var i = 0; i < list.length && !gameover; i++) {
        reveal(list[i]);
      }
    }

    /* 踩雷：对应 Game.Explode()（Game.cs:278） */
    function explode(cell) {
      gameover = true;
      won = false;

      cell.exploded = true;                       // 标出是哪一颗炸的
      cell.revealed = true;

      // 把所有雷都翻开，亮给玩家看全图
      for (var x = 0; x < grid.width; x++) {
        for (var y = 0; y < grid.height; y++) {
          var c = grid.cells[x][y];
          if (c.type === T_MINE) c.revealed = true;
        }
      }

      api.log('💥 踩雷！(' + cell.position.x + ',' + cell.position.y + ') —— 游戏结束，所有雷已揭晓。按 R 重开', 'err');
      boardDraw();
    }

    /* 通关判定：对应 Game.CheckWinCondition()（Game.cs:302） */
    function checkWinCondition() {
      // 口径一（源码）：所有非雷格都已翻开
      var allRevealed = true;
      for (var x = 0; x < grid.width && allRevealed; x++) {
        for (var y = 0; y < grid.height; y++) {
          var cell = grid.cells[x][y];
          if (cell.type !== T_MINE && !cell.revealed) { allRevealed = false; break; }
        }
      }

      // 口径二（等价说法）：插旗数 == 雷数，且每一面旗都插在真雷上
      var flags = countFlags();
      var flagsAllRight = (flags === MINES) && allFlagsOnMines();

      if (!allRevealed && !flagsAllRight) return false;   // no win

      gameover = true;
      won = true;

      // 胜利彩蛋：把所有雷自动插上旗（与源码一致）
      for (var i = 0; i < grid.width; i++) {
        for (var j = 0; j < grid.height; j++) {
          var c = grid.cells[i][j];
          if (c.type === T_MINE) c.flagged = true;
        }
      }

      api.hit('Game.cs', 302);
      api.log('🎉 通关！' + (flagsAllRight ? '插旗 ' + flags + ' 面且全部正确' : '所有安全格已翻开') +
              '，用时 ' + fmtTime(elapsed) + '。按 R 再来一局', 'ok');
      return true;
    }

    /* ---------- 小工具 ---------- */

    function countFlags() {
      var n = 0;
      eachCell(function (c) { if (c.flagged) n++; });
      return n;
    }

    function allFlagsOnMines() {
      var ok = true;
      eachCell(function (c) {
        if (c.flagged && c.type !== T_MINE) ok = false;
      });
      return ok;
    }

    function countRevealed() {
      var n = 0;
      eachCell(function (c) { if (c.revealed) n++; });
      return n;
    }

    function eachCell(fn) {
      for (var x = 0; x < grid.width; x++) {
        for (var y = 0; y < grid.height; y++) fn(grid.cells[x][y]);
      }
    }

    function fmtTime(s) {
      var m = Math.floor(s / 60), ss = Math.floor(s % 60);
      return (m < 10 ? '0' : '') + m + ':' + (ss < 10 ? '0' : '') + ss;
    }

    /* 和弦预览高亮：对应 Game.Chord()（Game.cs:193） */
    function refreshChordPreview() {
      eachCell(function (c) { c.chorded = false; });

      if (gameover || flagMode) return;
      if (hoverX < 0) return;

      var cell = tryGetCell(hoverX, hoverY);
      if (!cell || !cell.revealed || cell.type !== T_NUM) return;
      if (countAdjacentFlags(cell) < cell.number) return;      // 旗不够就不预览

      forEachNeighbor8(cell, function (n) {
        n.chorded = !n.revealed && !n.flagged;
      });
    }

    function toggleMode() {
      flagMode = !flagMode;
      refreshChordPreview();
      api.hit('Game.cs', 84);
      api.log('切换到「' + (flagMode ? '🚩 插旗' : '⛏ 翻开') + '」模式' +
              (flagMode ? '（左键 = 插旗）' : '（左键 = 翻开；点已翻开的数字格 = 和弦）'), 'sys');
    }

    /* ---------- 命中测试：HUD 按钮 ---------- */

    function inRect(r, x, y) {
      return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
    }

    /* =====================================================================
     * 每帧更新：对应 Game.Update()
     * =================================================================== */

    function update(dt, keys, api) {

      /* 计时：第一次点击（布雷）之后才开始走表 */
      if (generated && !gameover) elapsed += dt;

      /* Flood Fill 逐层展开（模拟协程的 yield return null） */
      if (floodQ.length) {
        floodT += dt;
        var guard = 0;
        while (floodQ.length && floodT >= FLOOD_STEP && guard < 64) {
          floodT -= FLOOD_STEP;
          floodWave();
          guard++;
        }
        api.hit('Game.cs', 152);

        if (!floodQ.length && floodPending) {                 // 连锁刚结束
          floodPending = false;
          api.log('Flood Fill 结束：本次连锁展开 ' + floodOpened +
                  ' 格，最大递归层数 ' + floodDepth, 'ok');
          checkWinCondition();
        }
      }

      publish();
    }

    /* ---------- 把关键状态推给底部面板（约 10Hz，别每帧刷 DOM） ---------- */

    function publish() {
      varTick++;
      // 第一帧立刻推一次（别让关键状态面板空着），之后降到约 10Hz
      if (varTick > 1 && varTick % 6) return;

      var total = COLS * ROWS;
      var flags = countFlags();
      var revealed = countRevealed();

      api.vars({
        'grid.width': COLS,
        'grid.height': ROWS,
        'mineCount': MINES,
        'flagsUsed': flags,
        'minesLeft': MINES - flags,
        'revealed': revealed,
        'safeLeft': total - MINES - revealed,
        'generated': generated ? 'true' : 'false',
        'time': fmtTime(elapsed),
        'mode': flagMode ? '插旗' : '翻开',
        'flood.queued': floodQ.length,
        'flood.opened': floodOpened,
        'flood.depth': floodDepth,
        'state': gameover ? (won ? '通关' : '踩雷') : '进行中',
        'board.Draw 次数': redraws
      });
    }

    /* =====================================================================
     * 渲染
     * =================================================================== */

    /* 数字 1~8 的经典配色 */
    var NUM_COLORS = [
      '#60a5fa', '#34d399', '#f87171', '#a78bfa',
      '#fbbf24', '#22d3ee', '#f472b6', '#94a3b8'
    ];

    /* 未翻开的凸起方块 */
    function tileRaised(ctx, px, py, s) {
      ctx.fillStyle = '#37456b';
      ctx.fillRect(px, py, s, s);
      ctx.fillStyle = 'rgba(255,255,255,.20)';
      ctx.fillRect(px, py, s, 2);
      ctx.fillRect(px, py, 2, s);
      ctx.fillStyle = 'rgba(0,0,0,.32)';
      ctx.fillRect(px, py + s - 2, s, 2);
      ctx.fillRect(px + s - 2, py, 2, s);
    }

    /* 已翻开的凹陷方块 */
    function tileSunken(ctx, px, py, s, tint) {
      ctx.fillStyle = tint || '#151c30';
      ctx.fillRect(px, py, s, s);
      ctx.strokeStyle = 'rgba(255,255,255,.07)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
    }

    /* 小旗 */
    function drawFlag(ctx, cx, cy) {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy + 6);
      ctx.lineTo(cx - 3, cy - 7);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy - 7);
      ctx.lineTo(cx + 6, cy - 3.5);
      ctx.lineTo(cx - 3, cy);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#64748b';
      ctx.fillRect(cx - 6, cy + 6, 13, 2);
      ctx.fillRect(cx - 4, cy + 4, 9, 2);
    }

    /* 地雷 */
    function drawMineGlyph(ctx, cx, cy, r) {
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.3;
      for (var i = 0; i < 8; i++) {
        var a = i * Math.PI / 4;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r * 0.5, cy + Math.sin(a) * r * 0.5);
        ctx.lineTo(cx + Math.cos(a) * r * 1.3, cy + Math.sin(a) * r * 1.3);
        ctx.stroke();
      }
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0b1020';
      ctx.beginPath();
      ctx.arc(cx - r * 0.24, cy - r * 0.24, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    /* 单个格子：对应 Board.GetTile(cell) 的状态机分流 */
    function drawCell(ctx, cell) {
      var px = BX + cell.position.x * CELL;
      var py = BY + cell.position.y * CELL;
      var s = CELL - 1;
      var cx = px + s / 2, cy = py + s / 2;

      if (cell.revealed) {
        /* ---- 已翻开：看 type ---- */
        if (cell.type === T_MINE) {
          // exploded → 红底高亮；否则普通雷
          ctx.fillStyle = cell.exploded ? '#7f1d1d' : '#1b2338';
          ctx.fillRect(px, py, s, s);
          if (cell.exploded) {
            ctx.strokeStyle = '#fca5a5';
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 1, py + 1, s - 2, s - 2);
          }
          drawMineGlyph(ctx, cx, cy, 6);
          return;
        }

        if (cell.type === T_NUM) {
          tileSunken(ctx, px, py, s, '#151c30');
          ctx.fillStyle = NUM_COLORS[Math.min(cell.number, 8) - 1] || '#e2e8f0';
          ctx.font = '700 13px "SF Mono", Menlo, Consolas, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(cell.number), cx, cy + 0.5);
          return;
        }

        // Empty：按 floodDepth 染色，直观看到 BFS 的第几层
        var d = cell.floodDepth;
        var a = d >= 0 ? Math.min(0.20, 0.05 + d * 0.025) : 0;
        tileSunken(ctx, px, py, s, 'rgba(56,189,248,' + a.toFixed(3) + ')');
        if (d >= 0 && CELL >= 20) {
          ctx.fillStyle = 'rgba(148,163,184,.35)';
          ctx.font = '9px "SF Mono", Menlo, Consolas, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(d), cx, cy + 0.5);
        }
        return;
      }

      /* ---- 未翻开：flagged > chorded > unknown ---- */
      if (cell.flagged) {
        tileRaised(ctx, px, py, s);
        drawFlag(ctx, cx, cy);
        return;
      }

      if (cell.chorded) {
        // 和弦预览：临时画成空格（对应 Board.cs:73 return tileEmpty）
        tileSunken(ctx, px, py, s, 'rgba(34,211,238,.16)');
        ctx.strokeStyle = 'rgba(34,211,238,.55)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, s - 1, s - 1);
        return;
      }

      tileRaised(ctx, px, py, s);
    }

    /* HUD 面板 */
    function panel(ctx, x, y, w, h) {
      ctx.fillStyle = 'rgba(255,255,255,.05)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,.10)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    }

    function button(ctx, r, label, active) {
      ctx.fillStyle = active ? 'rgba(56,189,248,.22)' : 'rgba(255,255,255,.06)';
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = active ? '#38bdf8' : 'rgba(255,255,255,.16)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(r.x + 0.75, r.y + 0.75, r.w - 1.5, r.h - 1.5);
      ctx.fillStyle = active ? '#7dd3fc' : '#cbd5e1';
      ctx.font = '600 13px -apple-system, "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, r.x + r.w / 2, r.y + r.h / 2 + 0.5);
    }

    function draw(ctx, api) {

      /* 背景 */
      ctx.fillStyle = '#0b1020';
      ctx.fillRect(0, 0, W, H);

      /* ---------- HUD ---------- */
      panel(ctx, 16, 10, 118, 32);
      ctx.fillStyle = '#fca5a5';
      ctx.font = '600 16px "SF Mono", Menlo, Consolas, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('💣 ' + (MINES - countFlags()), 28, 27);

      panel(ctx, 146, 10, 104, 32);
      ctx.fillStyle = '#7dd3fc';
      ctx.textAlign = 'left';
      ctx.fillText('⏱ ' + fmtTime(elapsed), 158, 27);

      /* 连锁信息 */
      ctx.textAlign = 'left';
      ctx.font = '12px -apple-system, "PingFang SC", sans-serif';
      if (floodQ.length) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('Flood 扩散中…', 262, 20);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('已展开 ' + floodOpened + ' 格 / ' + floodDepth + ' 层', 262, 36);
      } else if (generated && !gameover) {
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('上次连锁：', 262, 20);
        ctx.fillText(floodOpened + ' 格 · 最深 ' + floodDepth + ' 层', 262, 36);
      } else if (!generated) {
        ctx.fillStyle = '#64748b';
        ctx.fillText('等待第一次点击…', 262, 27);
      } else {
        ctx.fillStyle = '#64748b';
        ctx.fillText('本局已结束', 262, 27);
      }

      button(ctx, BTN_MODE,
        flagMode ? '🚩 插旗模式' : '⛏ 翻开模式', flagMode);
      button(ctx, BTN_RESET, '↻ 重开', false);

      /* ---------- 雷区 ---------- */
      for (var x = 0; x < COLS; x++) {
        for (var y = 0; y < ROWS; y++) {
          drawCell(ctx, grid.cells[x][y]);
        }
      }

      /* ---------- 悬停 / 键盘光标高亮 ---------- */
      var hx = hoverX, hy = hoverY;
      if (hx < 0) { hx = curX; hy = curY; }
      ctx.strokeStyle = 'rgba(56,189,248,.85)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(BX + hx * CELL - 0.5, BY + hy * CELL - 0.5, CELL, CELL);

      /* ---------- 底部提示 ---------- */
      ctx.fillStyle = 'rgba(148,163,184,.55)';
      ctx.font = '11px -apple-system, "PingFang SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('左键 = 当前模式 · 按 F 切换插旗 · 点已翻开的数字格 = 和弦 · R 重开', W / 2, H - 2);

      /* ---------- 结束横幅 ---------- */
      if (gameover) {
        ctx.fillStyle = 'rgba(11,16,32,.78)';
        ctx.fillRect(BX - 8, BY + CELL * 5.2, COLS * CELL + 16, 74);
        ctx.strokeStyle = won ? 'rgba(110,231,183,.6)' : 'rgba(252,165,165,.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(BX - 7.5, BY + CELL * 5.2 + 1, COLS * CELL + 15, 72);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '700 26px -apple-system, "PingFang SC", sans-serif';
        ctx.fillStyle = won ? '#6ee7b7' : '#fca5a5';
        ctx.fillText(won ? '🎉 通关！' : '💥 踩雷了', W / 2, BY + CELL * 5.2 + 30);

        ctx.font = '13px -apple-system, "PingFang SC", sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('用时 ' + fmtTime(elapsed) + ' · 插旗 ' + countFlags() + '/' + MINES +
                     ' · 按 R 或点「重开」再来一局', W / 2, BY + CELL * 5.2 + 56);
      }
    }

    /* =====================================================================
     * 输入
     * =================================================================== */

    /* 左键按下：先判 HUD 按钮，再判雷区 */
    function onPointer(x, y, down, api) {
      if (!down) return;

      if (inRect(BTN_MODE, x, y)) { toggleMode(); return; }
      if (inRect(BTN_RESET, x, y)) { newGame(); return; }

      if (gameover) return;

      var cell = cellAtMouse(x, y);
      if (!cell) return;

      hoverX = cell.position.x;
      hoverY = cell.position.y;
      curX = hoverX;
      curY = hoverY;

      if (flagMode) flag(cell);
      else revealAtMouse(x, y);

      refreshChordPreview();
    }

    /* 鼠标移动：更新悬停格 + 和弦预览高亮（对应按住中键的 Chord 预览） */
    function onPointerMove(x, y, api) {
      var cell = cellAtMouse(x, y);
      if (!cell) { hoverX = -1; hoverY = -1; }
      else { hoverX = cell.position.x; hoverY = cell.position.y; }
      refreshChordPreview();
    }

    /* 键盘：方向键移动光标，fire（空格/回车）对光标处执行当前模式 */
    function onKey(k, down, api) {
      if (!down) return;
      if (gameover && k !== 'fire') return;

      if (k === 'up')    { curY = Math.max(0, curY - 1); hoverX = -1; return; }
      if (k === 'down')  { curY = Math.min(ROWS - 1, curY + 1); hoverX = -1; return; }
      if (k === 'left')  { curX = Math.max(0, curX - 1); hoverX = -1; return; }
      if (k === 'right') { curX = Math.min(COLS - 1, curX + 1); hoverX = -1; return; }

      if (k === 'fire') {
        var cell = tryGetCell(curX, curY);
        if (!cell || gameover) { newGame(); return; }
        if (flagMode) { flag(cell); refreshChordPreview(); }
        else if (cell.revealed && cell.type === T_NUM) { doChord(cell); refreshChordPreview(); }
        else { revealFromMouse(cell); refreshChordPreview(); }
      }
    }

    /* F 键切换插旗模式 —— 引擎的按键表只映射方向键与 fire，
       所以这里自己在 document 上挂一个轻量监听，卸载时用 destroy 摘掉。 */
    function onDocKey(e) {
      var tag = e.target && e.target.tagName;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
      if (e.code === 'KeyF' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleMode();
      }
    }
    document.addEventListener('keydown', onDocKey);

    /* =====================================================================
     * 对外接口
     * =================================================================== */

    newGame();

    return {
      w: W, h: H,
      reset: function () { newGame(); },
      update: update,
      draw: draw,
      onKey: onKey,
      onPointer: onPointer,
      onPointerMove: onPointerMove,
      destroy: function () {
        document.removeEventListener('keydown', onDocKey);
      }
    };
  }
});
