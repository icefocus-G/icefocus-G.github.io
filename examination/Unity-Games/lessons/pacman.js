/* =============================================================================
 * Pacman · 吃豆人
 * -----------------------------------------------------------------------------
 * 本文件三部分：
 *   1) create(api) —— 浏览器里可玩的 Canvas 复刻版（迷宫、豆子与幽灵状态机）
 *   2) notes       —— 逐句讲解：「为什么这么写」
 *   3) think       —— 开发思维与步骤拆解
 * ========================================================================== */

UG_LESSON('pacman', {

  /* ---------------- 元数据 ---------------- */

  name: '吃豆人 Pacman',
  ico: '🟡',
  difficulty: 5,
  tags: ['状态机', '继承', '路径点图', '方向选择'],
  controls: '↑↓←→ / WASD 预输入转向；也可点击或拖动指向移动方向。吃光豆子进入下一关，空格可在游戏结束后重开。',
  oneLiner: '把迷宫变成路径点图，把幽灵 AI 变成可替换状态：同一套移动骨架就能承载追逐、散射、惊吓、眼睛返家和四种目标策略。',

  /* ---------------- 逐句讲解：文件名 → 行号 → 讲解 ---------------- */

  notes: {

    'GhostBehavior.cs': {
      18: '把行为基类声明为 abstract，是因为“行为”只规定启用、禁用和计时契约，本身不该单独运行。追逐、散射、惊吓各写成一个子类，而不是塞进巨大的 switch；以后增加一种行为只需再加一个类，已有类一行不动，修改风险被限制在新文件里。',
      38: 'Enable 不只把 enabled 打开，还统一预约到时 Disable。状态的生命周期由基类管理，子类只关心自己的选路和表现，避免每个行为各写一套计时器。',
      48: 'Disable 与 Enable 必须配对：关组件的同时取消旧 Invoke，才能保证旧计时器不会在新状态里突然触发。行为也不能“想切就切”，切换应由 Ghost 协调，否则两个行为可能同时在同一路口抢着改方向。'
    },

    'Ghost.cs': {
      56: '重置时先关闭 frightened、chase，再开启 scatter 和配置好的 initialBehavior。统一由 Ghost 调度这组互斥开关，比让各子类彼此随意跳转更容易保证“同一时刻只有一个决策者”。'
    },

    'Movement.cs': {
      61: 'nextDirection 是转向缓冲：玩家可以在路口前先按键，当前还不能走时先记住，到方向可用的那一刻自动转弯。没有它，玩家必须在一两帧的窗口里精准按键，手感会非常生硬。',
      80: '只有 forced 或 Occupied 判定前方无墙时才真正换方向。网格迷宫应当“到路口再决定方向”，而不是逐帧自由漂移；这样角色始终贴着通道中心，碰撞、吃豆和 AI 选路都能落在同一张路径点图上。'
    },

    'Node.cs': {
      21: '每个 Node 只保存可走方向，整座迷宫便从像素墙面抽象成路径点图。AI 不必理解美术形状，只遍历邻边；地图换皮或墙体重画时，决策代码仍可复用。'
    },

    'GhostChase.cs': {
      36: '追逐不是每帧求一条完整路线，而是在经过 Node 时试探每个邻方向，选下一格最接近 target 的一个。把“怎么生成目标点”和“怎么朝目标走”分离后，四只幽灵只需提供不同 target 就能形成不同性格。'
    },

    'GhostFrightened.cs': {
      58: '原 Unity 源码在幽灵被吃后直接放到 home.inside，再启用 GhostHome 完成复活；浏览器复刻为了让过程可见，改成眼睛沿预计算的路径点距离梯度飘回出生点。两种写法都把“返家”交给统一移动/回家状态，而不是塞进碰撞回调。',
      108: '源码这里遍历方向并选择离目标最远的一条，并非随机；关键原因是惊吓时绝不能继续追玩家，要主动制造逃脱窗口。本课可玩版按课程要求采用随机选路：策略细节不同，但都通过“打断追击 + 降速”让玩家能预期这段时间适合反攻。'
    },

    'GhostScatter.cs': {
      31: '散射状态随机抽一个可走方向，并在后面尽量排除立即掉头。随机负责打散队形，“不随便掉头”负责保持移动自然；若仍沿用追逐目标，所谓散射就只是换了名字。'
    },

    'GhostEyes.cs': {
      33: 'GhostEyes 只从父级 Movement 读取方向来换眼睛贴图，完全不重复寻路。也就是说“眼睛状态”是表现层；返家仍复用路径点移动，本课可玩版到达 home 节点后再触发复活。'
    },

    'GameManager.cs': {
      169: '是否过关只在“豆子被吃掉”这个唯一会改变剩余数量的入口检查，不必每帧遍历。把胜利判定贴着状态变化放置，既省计算，也不容易漏掉触发时机。',
      181: '能量豆由 GameManager 一次遍历全部幽灵并统一 Enable frightened。集中调度保证四只幽灵同帧切换、同一持续时间，避免各幽灵自己监听豆子后出现先后不一致。'
    }
  },

  /* ---------------- 开发思维与步骤 ---------------- */

  think: {
    core: [
      '先换抽象再写 AI：屏幕上的迷宫是墙和通道，代码里的迷宫应是“节点 + 可走方向”。玩家、追击幽灵、惊吓幽灵和返家眼睛都沿同一张图移动，区别只发生在路口如何选下一条边。',
      '把状态当作可替换的决策器，而不是一串 if/switch。GhostBehavior 统一生命周期，Ghost 统一调度，Chase / Scatter / Frightened / Home 各自只回答“这个状态下下一步往哪走”。新增行为等于新增类，不需要拆旧逻辑。',
      '幽灵个性来自目标函数，而不是四套移动代码：直追取玩家格，抄前方取玩家前方格，绕后取玩家身后格，随机型不使用目标。惊吓时再暂时替换为随机选路和低速，让规则变化清楚可读，也给玩家稳定的反攻窗口。'
    ],

    steps: [
      { t: '① 定规则：列出胜负与状态',
        d: '吃普通豆得分，吃能量豆让幽灵可被吃；正常碰幽灵掉命，生命归零结束；豆子清空进入下一关。先写清追逐、散射、惊吓、眼睛四种状态的进入与退出条件。' },
      { t: '② 搭世界：把迷宫建成路径点图',
        d: '用网格生成墙与通路，每个通路格就是节点，相邻可走格就是边；中央横道支持左右穿屏。豆子只依附通路格，所以移动、碰撞、计数和 AI 共用同一坐标系统。' },
      { t: '③ 造玩家：实现路口预输入',
        d: '玩家沿“当前格 → 下一格”的线段匀速前进。按键只更新 nextDirection，到达格心时先尝试缓冲方向，再尝试保持原方向；前方是墙才停下，从而得到经典吃豆人的贴格转弯手感。' },
      { t: '④ 建状态机：统一 Enable / Disable',
        d: '用全局计时让散射 7 秒与追逐 18 秒轮换；能量豆临时覆盖为惊吓，计时结束再回到底层模式。任何切换只在调度层发生，避免多个状态同时向 Movement 发方向。' },
      { t: '⑤ 做四种追逐：只替换目标点',
        d: '红色直接瞄准玩家；粉色瞄准玩家前方 4 格；青色瞄准玩家身后 4 格形成包抄；橙色在路口随机选择。前三者都复用“邻格到目标平方距离最小”的选择器。' },
      { t: '⑥ 完成交互：惊吓、返家与死亡',
        d: '惊吓时幽灵变蓝、减速并随机选路；被吃后只画眼睛，沿 home 距离梯度回出生点再复活。正常碰撞则扣命、短暂停顿并复位角色，但保留已经吃掉的豆子。' },
      { t: '⑦ 做流程与反馈：关卡越来越快',
        d: 'HUD 持续显示分数、生命、关卡、剩余豆子和当前模式；关键事件写日志并命中源码。清空豆子后重铺豆阵、关卡加一、幽灵提速，让同一套规则自然产生难度曲线。' }
    ],

    transfer: [
      '“节点图 + 到节点再决策”可直接迁移到塔防敌人、交通模拟、回合制棋盘和巡逻守卫。',
      '“抽象行为基类 + 互斥子类”可迁移到 Boss 阶段、角色动作状态、UI 页面流程；新增状态时优先新增类，而不是继续扩大 switch。',
      '“移动算法不变，只替换目标函数”可迁移到足球跑位、队友跟随、包抄敌人和 RTS 编队，是用少量代码制造角色差异的通用方法。'
    ]
  },

  /* =========================================================================
   * create(api) —— 可玩的浏览器复刻版
   *
   * 结构对应 Unity 版：
   *   输入写入 nextDirection → Movement 沿路径点移动 → 路口行为选方向
   *   → Pellet / Ghost 碰撞事件 → GameManager 推进生命、分数与关卡
   * ======================================================================= */

  create: function (api) {

    /* ---------- 世界尺寸与网格 ---------- */
    var CELL = 24;
    var COLS = 25;
    var ROWS = 23;
    var HUD = 48;
    var W = COLS * CELL;
    var H = HUD + ROWS * CELL;
    var TUNNEL_ROW = 11;
    var HOME_C = 12;
    var HOME_R = 11;

    var UP = { x: 0, y: -1, name: '上' };
    var DOWN = { x: 0, y: 1, name: '下' };
    var LEFT = { x: -1, y: 0, name: '左' };
    var RIGHT = { x: 1, y: 0, name: '右' };
    var STOP = { x: 0, y: 0, name: '停' };
    var DIRS = [UP, DOWN, LEFT, RIGHT];

    var map = [];
    var pellets = [];
    var homeDistance = [];
    var pelletsLeft = 0;

    /* ---------- 游戏状态 ---------- */
    var player = null;
    var ghosts = [];
    var score = 0;
    var lives = 3;
    var level = 1;
    var baseMode = 'scatter';
    var modeTime = 7;
    var frightenedTime = 0;
    var ghostMultiplier = 1;
    var deathTime = 0;
    var transitionTime = 0;
    var over = false;
    var animTime = 0;
    var varsTime = 0;
    var lastKeys = { up: false, down: false, left: false, right: false, fire: false };

    /* ---------- 基础工具 ---------- */
    function cloneDir(d) {
      return { x: d.x, y: d.y, name: d.name };
    }

    function sameDir(a, b) {
      return a && b && a.x === b.x && a.y === b.y;
    }

    function oppositeDir(a, b) {
      return a && b && a.x === -b.x && a.y === -b.y;
    }

    function cellKey(c, r) {
      return r * COLS + c;
    }

    function makeMaze() {
      map = [];
      for (var r = 0; r < ROWS; r++) {
        var row = [];
        for (var c = 0; c < COLS; c++) {
          var wall = c === 0 || c === COLS - 1 || r === 0 || r === ROWS - 1;

          if (!wall && r % 2 === 0) {
            wall = true;
            if (r % 4 === 2 && (c % 4 === 1 || c === COLS - 2)) wall = false;
            if (r % 4 === 0 && (c % 4 === 3 || c === 1)) wall = false;
          }

          /* 中央横道两端打开，形成 Passage 左右穿屏。 */
          if (r === TUNNEL_ROW && (c === 0 || c === COLS - 1)) wall = false;
          row.push(wall ? 1 : 0);
        }
        map.push(row);
      }

      homeDistance = buildDistanceField(HOME_C, HOME_R);
    }

    function makePellets() {
      pellets = [];
      pelletsLeft = 0;

      for (var r = 0; r < ROWS; r++) {
        var row = [];
        for (var c = 0; c < COLS; c++) {
          var kind = 0;
          if (map[r][c] === 0) {
            kind = 1;
            if ((r === 1 || r === ROWS - 2) && (c === 1 || c === COLS - 2)) {
              kind = 2;
            }

            /* 鬼屋、出生点及穿屏端点不放豆，避免复位时直接触发。 */
            if ((Math.abs(r - HOME_R) <= 1 && Math.abs(c - HOME_C) <= 2) ||
                (r === 17 && c === 12) ||
                (r === TUNNEL_ROW && (c === 0 || c === COLS - 1))) {
              kind = 0;
            }
          }
          row.push(kind);
          if (kind) pelletsLeft++;
        }
        pellets.push(row);
      }
    }

    function normalizeCell(c, r) {
      if (r === TUNNEL_ROW && c < 0) c = COLS - 1;
      if (r === TUNNEL_ROW && c >= COLS) c = 0;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
      return { c: c, r: r };
    }

    function neighbor(c, r, dir) {
      var p = normalizeCell(c + dir.x, r + dir.y);
      if (!p || map[p.r][p.c] !== 0) return null;
      return p;
    }

    function availableDirections(c, r) {
      var list = [];
      for (var i = 0; i < DIRS.length; i++) {
        if (neighbor(c, r, DIRS[i])) list.push(DIRS[i]);
      }
      return list;
    }

    /* 从鬼屋一次性计算整张图的距离梯度，眼睛返家时只需沿数值下降。 */
    function buildDistanceField(startC, startR) {
      var dist = [];
      var queue = [];
      var head = 0;
      var total = COLS * ROWS;
      for (var i = 0; i < total; i++) dist[i] = -1;
      dist[cellKey(startC, startR)] = 0;
      queue.push({ c: startC, r: startR });

      while (head < queue.length) {
        var cur = queue[head++];
        for (var d = 0; d < DIRS.length; d++) {
          var n = neighbor(cur.c, cur.r, DIRS[d]);
          if (n && dist[cellKey(n.c, n.r)] < 0) {
            dist[cellKey(n.c, n.r)] = dist[cellKey(cur.c, cur.r)] + 1;
            queue.push(n);
          }
        }
      }
      return dist;
    }

    function makeMover(c, r, dir) {
      return {
        c: c,
        r: r,
        toC: c,
        toR: r,
        dir: cloneDir(dir),
        progress: 0
      };
    }

    function moverPosition(mover) {
      return {
        x: mover.c * CELL + CELL / 2 + mover.dir.x * mover.progress,
        y: HUD + mover.r * CELL + CELL / 2 + mover.dir.y * mover.progress
      };
    }

    /* 一段一段走到格心；只有格心处才调用 decide，等价于进入 Node。 */
    function moveAlongGraph(mover, distance, decide, arrived) {
      var guard = 0;
      while (distance > 0.0001 && guard++ < 12) {
        if (mover.progress <= 0.0001) {
          mover.progress = 0;
          decide(mover);
          if (sameDir(mover.dir, STOP)) return;

          var n = neighbor(mover.c, mover.r, mover.dir);
          if (!n) {
            mover.dir = cloneDir(STOP);
            return;
          }
          mover.toC = n.c;
          mover.toR = n.r;
        }

        var remain = CELL - mover.progress;
        var step = distance < remain ? distance : remain;
        mover.progress += step;
        distance -= step;

        if (mover.progress >= CELL - 0.0001) {
          mover.c = mover.toC;
          mover.r = mover.toR;
          mover.progress = 0;
          if (arrived) arrived(mover);
        }
      }
    }

    /* ---------- 玩家 ---------- */
    function setPlayerIntent(dir) {
      if (!player) return;
      player.nextDirection = cloneDir(dir);
    }

    function decidePlayer(mover) {
      var wanted = mover.nextDirection;
      var old = mover.dir;

      if (wanted && neighbor(mover.c, mover.r, wanted)) {
        mover.dir = cloneDir(wanted);
      } else if (!neighbor(mover.c, mover.r, mover.dir)) {
        mover.dir = cloneDir(STOP);
      }

      if (!sameDir(old, mover.dir) && !sameDir(mover.dir, STOP)) {
        api.hit('Movement.cs', 80);
        api.log('路口转向：' + mover.dir.name + '（缓冲方向已生效）', 'info');
      }
    }

    function eatPelletAt(c, r) {
      var kind = pellets[r][c];
      if (!kind) return;

      pellets[r][c] = 0;
      pelletsLeft--;

      if (kind === 2) {
        score += 50;
        frightenedTime = Math.max(5, 8 - (level - 1) * 0.35);
        ghostMultiplier = 1;
        api.hit('GameManager.cs', 181);
        api.log('吃到能量豆：幽灵进入惊吓状态 ' + frightenedTime.toFixed(1) + ' 秒', 'ok');
      } else {
        score += 10;
        api.hit('Pellet.cs', 20);
        if (pelletsLeft % 12 === 0 || pelletsLeft < 6) {
          api.log('吃豆 +10，剩余 ' + pelletsLeft + ' 颗', 'info');
        }
      }

      if (pelletsLeft === 0) {
        transitionTime = 1.6;
        api.hit('GameManager.cs', 169);
        api.log('豆子全部吃光，关卡完成！下一关幽灵会更快', 'ok');
      }
    }

    /* ---------- 幽灵与方向策略 ---------- */
    function makeGhost(index, name, color, c, r, dir) {
      var g = makeMover(c, r, dir);
      g.index = index;
      g.name = name;
      g.color = color;
      g.state = 'normal';
      g.safeTime = 0;
      return g;
    }

    function removeReverse(list, dir) {
      if (list.length <= 1 || sameDir(dir, STOP)) return list;
      var filtered = [];
      for (var i = 0; i < list.length; i++) {
        if (!oppositeDir(list[i], dir)) filtered.push(list[i]);
      }
      return filtered.length ? filtered : list;
    }

    function randomDirection(list) {
      return list[Math.floor(Math.random() * list.length)];
    }

    function chaseTarget(g) {
      var pc = player.c;
      var pr = player.r;
      var dx = player.dir.x;
      var dy = player.dir.y;

      if (g.index === 0) return { c: pc, r: pr };                    // 直追
      if (g.index === 1) return { c: pc + dx * 4, r: pr + dy * 4 }; // 抄前方
      if (g.index === 2) return { c: pc - dx * 4, r: pr - dy * 4 }; // 绕后
      return null;                                                   // 随机型
    }

    function closestDirection(c, r, list, target) {
      var best = list[0];
      var bestDistance = Infinity;
      for (var i = 0; i < list.length; i++) {
        var n = neighbor(c, r, list[i]);
        if (!n) continue;
        var dx = n.c - target.c;
        var dy = n.r - target.r;
        var distance = dx * dx + dy * dy;
        if (distance < bestDistance || (distance === bestDistance && Math.random() < 0.35)) {
          bestDistance = distance;
          best = list[i];
        }
      }
      return best;
    }

    function homeDirection(c, r, list) {
      var best = list[0];
      var bestDistance = Infinity;
      for (var i = 0; i < list.length; i++) {
        var n = neighbor(c, r, list[i]);
        if (!n) continue;
        var distance = homeDistance[cellKey(n.c, n.r)];
        if (distance >= 0 && distance < bestDistance) {
          bestDistance = distance;
          best = list[i];
        }
      }
      return best;
    }

    function decideGhost(g) {
      var list = availableDirections(g.c, g.r);
      if (!list.length) {
        g.dir = cloneDir(STOP);
        return;
      }

      list = removeReverse(list, g.dir);

      if (g.state === 'eyes') {
        g.dir = cloneDir(homeDirection(g.c, g.r, list));
      } else if (frightenedTime > 0) {
        /* 惊吓状态按课程要求随机走，不再使用追击目标。 */
        g.dir = cloneDir(randomDirection(list));
      } else if (baseMode === 'scatter') {
        g.dir = cloneDir(randomDirection(list));
      } else {
        var target = chaseTarget(g);
        g.dir = cloneDir(target ? closestDirection(g.c, g.r, list, target) : randomDirection(list));
      }
    }

    function ghostArrived(g) {
      if (g.state === 'eyes' && g.c === HOME_C && g.r === HOME_R) {
        g.state = 'normal';
        g.safeTime = 1.25;
        g.dir = cloneDir(Math.random() < 0.5 ? LEFT : RIGHT);
        api.hit('GhostHome.cs', 77);
        api.log(g.name + ' 的眼睛回到出生点，幽灵复活', 'sys');
      }
    }

    function ghostSpeed(g) {
      if (g.state === 'eyes') return 150 + level * 4;
      if (frightenedTime > 0) return 54 + level * 2;
      return 76 + level * 5 + g.index * 1.5;
    }

    function eatGhost(g) {
      var points = 200 * ghostMultiplier;
      score += points;
      ghostMultiplier *= 2;
      g.state = 'eyes';
      g.safeTime = 0;
      api.hit('GhostFrightened.cs', 54);
      api.log('吃掉 ' + g.name + ' +' + points + '：只剩眼睛沿路径点返家', 'ok');
    }

    function catchPlayer(g) {
      if (deathTime > 0 || over || transitionTime > 0) return;
      lives--;
      deathTime = 1.5;
      api.hit('GameManager.cs', 132);
      api.log(g.name + ' 抓到了吃豆人，生命 -1', lives > 0 ? 'warn' : 'err');
    }

    function checkGhostCollisions() {
      var pp = moverPosition(player);
      for (var i = 0; i < ghosts.length; i++) {
        var g = ghosts[i];
        if (g.state === 'eyes' || g.safeTime > 0) continue;
        var gp = moverPosition(g);
        var dx = pp.x - gp.x;
        var dy = pp.y - gp.y;
        if (dx * dx + dy * dy < 13 * 13) {
          if (frightenedTime > 0) eatGhost(g);
          else catchPlayer(g);
          return;
        }
      }
    }

    /* ---------- 流程：复位、死亡、关卡 ---------- */
    function resetPositions() {
      player = makeMover(12, 17, LEFT);
      player.nextDirection = cloneDir(LEFT);

      ghosts = [
        makeGhost(0, 'Blinky 直追型', '#ef4444', 10, HOME_R, LEFT),
        makeGhost(1, 'Pinky 前方型', '#f9a8d4', 11, HOME_R, RIGHT),
        makeGhost(2, 'Inky 绕后型', '#22d3ee', 13, HOME_R, LEFT),
        makeGhost(3, 'Clyde 随机型', '#fb923c', 14, HOME_R, RIGHT)
      ];

      baseMode = 'scatter';
      modeTime = 7;
      frightenedTime = 0;
      ghostMultiplier = 1;
      deathTime = 0;
      lastKeys = { up: false, down: false, left: false, right: false, fire: false };
    }

    function resetGame(announce) {
      score = 0;
      lives = 3;
      level = 1;
      over = false;
      transitionTime = 0;
      makeMaze();
      makePellets();
      resetPositions();
      eatPelletAt(player.c, player.r);
      if (announce) api.log('新游戏：分数、生命、关卡与豆子已重置', 'sys');
    }

    function startNextLevel() {
      level++;
      transitionTime = 0;
      makePellets();
      resetPositions();
      eatPelletAt(player.c, player.r);
      api.hit('GameManager.cs', 173);
      api.log('进入第 ' + level + ' 关：幽灵基础速度提升', 'sys');
    }

    function finishDeath() {
      deathTime = 0;
      if (lives <= 0) {
        over = true;
        api.hit('GameManager.cs', 106);
        api.log('游戏结束，按空格或使用重置按钮再来一局', 'err');
      } else {
        resetPositions();
        api.hit('Pacman.cs', 54);
        api.log('吃豆人重生，已吃掉的豆子保持不变', 'sys');
      }
    }

    function switchMode() {
      if (baseMode === 'scatter') {
        baseMode = 'chase';
        modeTime = 18;
        api.hit('GhostScatter.cs', 17);
        api.log('状态切换：散射 → 追逐，四种目标策略开始工作', 'warn');
      } else {
        baseMode = 'scatter';
        modeTime = 7;
        api.hit('GhostChase.cs', 18);
        api.log('状态切换：追逐 → 散射，幽灵随机分散', 'info');
      }
    }

    /* ---------- 每帧更新 ---------- */
    function update(dt, keys, api) {
      if (dt > 0.05) dt = 0.05;
      animTime += dt;

      /* keys 只在按下沿写入方向，避免多个长按键互相覆盖。 */
      if (keys.up && !lastKeys.up) setPlayerIntent(UP);
      if (keys.down && !lastKeys.down) setPlayerIntent(DOWN);
      if (keys.left && !lastKeys.left) setPlayerIntent(LEFT);
      if (keys.right && !lastKeys.right) setPlayerIntent(RIGHT);
      if (keys.fire && !lastKeys.fire && over) resetGame(true);
      lastKeys.up = !!keys.up;
      lastKeys.down = !!keys.down;
      lastKeys.left = !!keys.left;
      lastKeys.right = !!keys.right;
      lastKeys.fire = !!keys.fire;

      if (over) {
        publish(dt);
        return;
      }

      if (transitionTime > 0) {
        transitionTime -= dt;
        if (transitionTime <= 0) startNextLevel();
        publish(dt);
        return;
      }

      if (deathTime > 0) {
        deathTime -= dt;
        if (deathTime <= 0) finishDeath();
        publish(dt);
        return;
      }

      if (frightenedTime > 0) {
        frightenedTime -= dt;
        if (frightenedTime <= 0) {
          frightenedTime = 0;
          ghostMultiplier = 1;
          api.hit('GhostFrightened.cs', 43);
          api.log('惊吓结束：幽灵恢复 ' + (baseMode === 'chase' ? '追逐' : '散射') + ' 状态', 'warn');
        }
      } else {
        modeTime -= dt;
        if (modeTime <= 0) switchMode();
      }

      moveAlongGraph(player, (106 + level * 1.5) * dt, decidePlayer, function (p) {
        eatPelletAt(p.c, p.r);
      });

      for (var i = 0; i < ghosts.length; i++) {
        var g = ghosts[i];
        if (g.safeTime > 0) g.safeTime -= dt;
        moveAlongGraph(g, ghostSpeed(g) * dt, decideGhost, ghostArrived);
      }

      checkGhostCollisions();
      publish(dt);
    }

    /* ---------- 底部关键变量：约 7Hz ---------- */
    function publish(dt) {
      varsTime += dt;
      if (varsTime < 0.14) return;
      varsTime = 0;

      var eyes = 0;
      for (var i = 0; i < ghosts.length; i++) {
        if (ghosts[i].state === 'eyes') eyes++;
      }

      api.vars({
        'score': score,
        'lives': lives,
        'level': level,
        'pellets.remaining': pelletsLeft,
        'ghost.mode': frightenedTime > 0 ? '惊吓 ' + frightenedTime.toFixed(1) + 's' : (baseMode === 'chase' ? '追逐' : '散射'),
        'ghost.eyes': eyes,
        'ghost.multiplier': 'x' + ghostMultiplier,
        'player.nextDirection': player ? player.nextDirection.name : '-'
      });
    }

    /* ---------- Canvas 绘制 ---------- */
    function drawWall(ctx, c, r) {
      var x = c * CELL;
      var y = HUD + r * CELL;
      ctx.fillStyle = '#172554';
      ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 3, y + 3, CELL - 6, CELL - 6);
    }

    function drawMaze(ctx) {
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          if (map[r][c] === 1) {
            drawWall(ctx, c, r);
          } else if (pellets[r][c] === 1) {
            ctx.fillStyle = '#fde68a';
            ctx.beginPath();
            ctx.arc(c * CELL + CELL / 2, HUD + r * CELL + CELL / 2, 2.2, 0, Math.PI * 2);
            ctx.fill();
          } else if (pellets[r][c] === 2) {
            var pulse = 4.6 + Math.sin(animTime * 7) * 1.2;
            ctx.fillStyle = '#fef3c7';
            ctx.beginPath();
            ctx.arc(c * CELL + CELL / 2, HUD + r * CELL + CELL / 2, pulse, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    function directionAngle(dir) {
      if (dir.x > 0) return 0;
      if (dir.x < 0) return Math.PI;
      if (dir.y > 0) return Math.PI / 2;
      if (dir.y < 0) return -Math.PI / 2;
      return 0;
    }

    function drawPlayer(ctx) {
      if (deathTime > 0 && Math.floor(deathTime * 10) % 2 === 0) return;
      var p = moverPosition(player);
      var angle = directionAngle(player.dir);
      var mouth = 0.17 + Math.abs(Math.sin(animTime * 10)) * 0.24;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(angle);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 9.5, mouth, Math.PI * 2 - mouth, false);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawEyes(ctx, dir) {
      var px = dir.x * 1.8;
      var py = dir.y * 1.8;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-3.6, -2.2, 3.1, 4.2, 0, 0, Math.PI * 2);
      ctx.ellipse(3.6, -2.2, 3.1, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.arc(-3.6 + px, -2.2 + py, 1.5, 0, Math.PI * 2);
      ctx.arc(3.6 + px, -2.2 + py, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawGhost(ctx, g) {
      var p = moverPosition(g);
      ctx.save();
      ctx.translate(p.x, p.y);

      if (g.state !== 'eyes') {
        var frightened = frightenedTime > 0;
        var flash = frightened && frightenedTime < 2 && Math.floor(animTime * 8) % 2 === 0;
        ctx.fillStyle = frightened ? (flash ? '#f8fafc' : '#2563eb') : g.color;
        ctx.beginPath();
        ctx.moveTo(-9, 8);
        ctx.lineTo(-9, 0);
        ctx.arc(0, 0, 9, Math.PI, 0, false);
        ctx.lineTo(9, 8);
        ctx.lineTo(6, 5);
        ctx.lineTo(3, 8);
        ctx.lineTo(0, 5);
        ctx.lineTo(-3, 8);
        ctx.lineTo(-6, 5);
        ctx.closePath();
        ctx.fill();

        if (frightened) {
          ctx.strokeStyle = flash ? '#2563eb' : '#ffffff';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(-5, 3);
          ctx.lineTo(-2, 1);
          ctx.lineTo(1, 3);
          ctx.lineTo(4, 1);
          ctx.stroke();
        } else {
          drawEyes(ctx, g.dir);
        }
      } else {
        drawEyes(ctx, g.dir);
      }

      ctx.restore();
    }

    function drawHud(ctx) {
      ctx.fillStyle = '#070b18';
      ctx.fillRect(0, 0, W, HUD);
      ctx.strokeStyle = 'rgba(96,165,250,.25)';
      ctx.beginPath();
      ctx.moveTo(0, HUD - 0.5);
      ctx.lineTo(W, HUD - 0.5);
      ctx.stroke();

      ctx.font = '600 14px -apple-system, "PingFang SC", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#facc15';
      ctx.fillText('分数 ' + score, 14, 20);
      ctx.fillStyle = '#f8fafc';
      ctx.fillText('生命 ' + lives, 14, 39);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#93c5fd';
      ctx.fillText('第 ' + level + ' 关', W / 2, 20);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('剩余豆子 ' + pelletsLeft, W / 2, 39);

      ctx.textAlign = 'right';
      var modeText = frightenedTime > 0 ? '惊吓 ' + frightenedTime.toFixed(1) + 's' : (baseMode === 'chase' ? '追逐 ' : '散射 ') + modeTime.toFixed(1) + 's';
      ctx.fillStyle = frightenedTime > 0 ? '#60a5fa' : (baseMode === 'chase' ? '#f87171' : '#86efac');
      ctx.fillText('幽灵：' + modeText, W - 14, 20);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('倍率 x' + ghostMultiplier, W - 14, 39);
    }

    function drawOverlay(ctx, title, subtitle, color) {
      ctx.fillStyle = 'rgba(2,6,23,.76)';
      ctx.fillRect(90, H / 2 - 54, W - 180, 108);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(90, H / 2 - 54, W - 180, 108);
      ctx.textAlign = 'center';
      ctx.fillStyle = color;
      ctx.font = '700 24px -apple-system, "PingFang SC", sans-serif';
      ctx.fillText(title, W / 2, H / 2 - 9);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '13px -apple-system, "PingFang SC", sans-serif';
      ctx.fillText(subtitle, W / 2, H / 2 + 22);
    }

    function draw(ctx, api) {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, W, H);
      drawHud(ctx);
      drawMaze(ctx);
      drawPlayer(ctx);
      for (var i = 0; i < ghosts.length; i++) drawGhost(ctx, ghosts[i]);

      if (transitionTime > 0) {
        drawOverlay(ctx, '关卡完成', '下一关幽灵速度提升', '#86efac');
      } else if (over) {
        drawOverlay(ctx, '游戏结束', '按空格或点击重置再来一局', '#f87171');
      } else if (deathTime > 0) {
        drawOverlay(ctx, lives > 0 ? '被抓到了' : '最后一条命', lives > 0 ? '准备从出生点重生' : '游戏即将结束', '#fbbf24');
      }
    }

    /* ---------- 键盘与指针 ---------- */
    function onKey(key, down, api) {
      if (!down) return;
      if (key === 'up') setPlayerIntent(UP);
      else if (key === 'down') setPlayerIntent(DOWN);
      else if (key === 'left') setPlayerIntent(LEFT);
      else if (key === 'right') setPlayerIntent(RIGHT);
      else if (key === 'fire' && over) resetGame(true);
    }

    function pointToward(x, y) {
      if (!player || over) return;
      var p = moverPosition(player);
      var dx = x - p.x;
      var dy = y - p.y;
      if (Math.abs(dx) > Math.abs(dy)) setPlayerIntent(dx < 0 ? LEFT : RIGHT);
      else setPlayerIntent(dy < 0 ? UP : DOWN);
    }

    function onPointer(x, y, down, api) {
      if (down) pointToward(x, y);
    }

    function onPointerMove(x, y, api) {
      pointToward(x, y);
    }

    /* ---------- 初始化与对外接口 ---------- */
    resetGame(false);
    api.log('Pacman 已就绪：方向键 / WASD 会把转向缓冲到下一个可走路口', 'sys');

    return {
      w: W,
      h: H,
      reset: function () { resetGame(true); },
      update: update,
      draw: draw,
      onKey: onKey,
      onPointer: onPointer,
      onPointerMove: onPointerMove
    };
  }
});
