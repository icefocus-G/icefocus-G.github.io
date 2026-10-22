/* =============================================================================
 * Centipede · 蜈蚣
 * -----------------------------------------------------------------------------
 * 本文件三部分：
 *   1) create(api) —— 浏览器里可玩的 Canvas 复刻版（与 Unity 版逻辑一一对应）
 *   2) notes       —— 逐句讲解：「为什么这么写」
 *   3) think       —— 开发思维与步骤拆解
 * ========================================================================== */

UG_LESSON('centipede', {

  /* ---------------- 元数据 ---------------- */

  name: '蜈蚣 Centipede',
  ico: '🐛',
  difficulty: 3,
  tags: ['链表跟随', '网格生成', '转向下降', '射击'],
  controls: '← → 左右移动炮台，↑ ↓ 在底部区域上下微调；空格 / 鼠标点击发射飞镖（一次一发，命中或飞出场地后才复装）。鼠标移动可直接带动炮台。',
  oneLiner: '一条由链表串起来的蜈蚣按格横爬，撞墙或撞蘑菇就下降一行并反向；打中中间一节，它就断成两条各自爬行 —— 把「数据结构的操作」直接当成玩法。',

  /* ---------------- 逐句讲解：文件名 → 行号 → 讲解 ---------------- */

  notes: {

    'CentipedeSegment.cs': {
      22: '头部不是存一个 bool，而是靠结构推导出来的：isHead => ahead == null（没有前驱的就是头）。这样断链之后，后半段的第一节自动变成头，不需要任何一行"指定新头"的代码。凡是能算出来的状态都别另存一份 —— 否则每次断链都要记得同步标志位，迟早漏掉一次。',
      49: '只有头部、且已经到达目标格（距离 < 0.1）时才规划下一格。这叫"网格步进 AI"：决策只在格点上发生，而不是每帧做一次物理重叠检测，既省性能又让行为可预测、可调试。0.1 这个阈值是防浮点误差的 —— 写成 == 0 会因累积误差永远判不中，蜈蚣会直接卡死在原地。',
      82: '出发之前先用 OverlapBox 探测"下一格有没有东西"，撞上了再决定转向，而不是撞上去靠物理反弹。区别在于：反弹是事后补救，会出现抖动和卡角；先探测是提前决策，落点永远整齐对齐网格。第四个参数 collisionMask 决定"什么算障碍"（墙、蘑菇），改它就能改规则，不用动代码。',
      90: '核心设计：撞到障碍不是原地掉头，而是「水平反向 + 下降一行」。原地掉头会让蜈蚣在同一行无限来回，玩家站着不动就永远安全；下降一行则把压力持续推向玩家，本作"越拖越危险"的张力全来自这一行。注意垂直方向不做障碍检测（源码如此），所以下降时可能踩进蘑菇格 —— 那是原版特性，不是 bug。',
      96: '下降前先检查会不会越出 homeArea：会的话连垂直方向也一起反向，蜈蚣改向上爬。用 homeArea.bounds 读边界而不是写死数字，改场景布局时不用动代码；少了这个判断，蜈蚣会一路下降走出屏幕再也不回来，关卡直接卡住。',
      115: '身体节段不做任何寻路，只"站到前一段当前所在的格子"，并原样继承前一段的方向 —— 这就是"记录历史格子"的跟随：跟随天然连续、天然蛇形，单节成本 O(1)。如果让每节独立寻路，一是每帧 n 次重叠检测，二是没有任何机制保证队伍连续，一旦某节被卡住，整条蜈蚣就会断裂甚至穿墙。继承 direction 还有个隐藏好处：断链后新头立刻知道自己该往哪走。',
      145: '打中一节后立刻把子弹的碰撞体关掉。Unity 里同一个物理帧内，一颗子弹可能同时触发多个 OnCollisionEnter2D，不关就会"一发打穿三节"。这里用 collider.enabled 直接当"这颗子弹还没消失"的标志位，比另开一个 bool 更不容易忘记重置 —— 因为复装时必然要把它打开。'
    },

    'Centipede.cs': {
      73: '打中中间一节时：先把后一节的 ahead 置空（72 行），它就自动满足 isHead 的定义变成新头；紧接着立刻调用它的 UpdateHeadSegment() 让它当场规划路线，不用等到下一帧。于是"链表断开"这个纯数据结构的动作，直接变成了"一条蜈蚣裂成两条各自爬行"的玩法 —— 这是本作最妙的一处：把结构操作暴露成玩法，玩法几乎零成本。',
      81: '节段列表清空即过关，调用 GameManager.NextLevel()。注意判断必须放在移除之后（76 行移除、81 行判断），顺序写反的话列表永远不为 0，游戏会卡在"最后一节打不掉"。另外过关只提速 10%，是刻意留的余量：一次加太多会让下一关直接不可玩。'
    },

    'GameManager.cs': {
      88: '掉命之后调用的是 mushroomField.Heal()（回满血），而不是重新 Generate()。差别很关键：重建等于"送一条命就能刷新场地"，玩家可以靠故意送死把堵死的场地洗掉；回满血保留了场地的历史，惩罚才成立。同理 ResetRound 只扣命、不清分 —— 死亡有代价，但不是推倒重来。'
    },

    'MushroomField.cs': {
      31: '随机坐标取出后必须 Mathf.Round 对齐到整数格。因为蜈蚣按格移动、子弹按格判定，蘑菇若落在半格上，就会出现"看着能过实际过不去"的卡位，以及命中判定在格子边界上抖动。凡是网格游戏，随机生成的第一件事就是对齐网格。（源码不去重，浏览器版加了查重，免得两朵蘑菇叠在同格变成 8 血。）'
    },

    'Mushroom.cs': {
      21: '血量直接等于 states.Length —— 美术给了几张从完好到破损的图，蘑菇就能挨几下（经典配置 4 张 = 4 血）。这样"数值"和"外观"共用同一个数据源，永远不会出现"图已经打烂了却还能再挨两下"的经典不同步 bug。想知道蘑菇几下才消失，数一下 states 数组有几项就够了。'
    },

    'Dart.cs': {
      33: '用 rb.isKinematic 本身当"是否已发射"的状态机，不再额外存 bool：待发时是 Kinematic（不受重力、跟着父物体走），发射时 SetParent(null) 脱离玩家并转 Dynamic。命中后（54 行）又挂回父物体、复位到头顶、恢复 Kinematic，等于"复装"。全场只有这一发子弹，靠复用同一个对象换来零分配、连对象池都省了。'
    },

    'Blaster.cs': {
      36: '位移 = 速度 × 时间 × direction.normalized。归一化这一步不能省：斜向输入 (1,1) 的长度是 √2，不归一化的话斜着走会比直走快 1.41 倍，手感立刻崩掉。这是所有八向移动都必须做的一步。'
    }
  },

  /* ---------------- 开发思维与步骤 ---------------- */

  think: {
    core: [
      '第一条思维：结构的形状就是玩法的形状。蜈蚣用双向链表串起来，"断开一个节点"原本只是数据结构课上的一行操作，在这里直接变成"一条蜈蚣裂成两条、各自向你爬来"。想不出新玩法时，不妨反过来问一句：我手上的数据结构，还有哪个操作是玩家从没见过的？',
      '第二条思维：用约束制造压力，而不是靠数值堆难度。撞墙下降一行 + 水平反向，是一条纯几何规则，却让蜈蚣持续向玩家逼近；蘑菇既是掩体又是绊脚石（挡你的子弹，也逼蜈蚣提前下降）；打死一节就多一朵蘑菇，场地越打越堵。整局没有任何"难度参数"，可它自己会越来越难 —— 这就是设计优于调参的地方。',
      '第三条思维：状态由结构推导，绝不另存一份。isHead =（ahead == null）、health = states.Length、"是否已发射" = rb.isKinematic。凡是能算出来的都不存，于是断链、换图、复装这些瞬间永远不会出现"数据和表现不同步"的 bug —— 而这类 bug 恰恰是最难查的那一类。'
    ],

    steps: [
      { t: '① 定规则：一句话说清游戏',
        d: '蜈蚣从顶部按格横爬，撞墙或撞蘑菇就下降一行并水平反向；打中一节它变成蘑菇、蜈蚣从断点裂成两条；蜈蚣碰到玩家掉一条命，打光所有节段过关。这句话里的四个动词（爬 / 下降 / 裂开 / 掉命）就是四个要实现的功能点。' },
      { t: '② 搭世界：先把空间离散成网格',
        d: '640×424 画布，20px 一格共 32×20 格；顶部 24px 是信息条，中间 2~15 行撒蘑菇，底部 4 行是玩家区。所有碰撞都先换算成格号再判定，比拿浮点坐标硬判稳定得多，也为后面的"网格步进 AI"铺路。' },
      { t: '③ 造角色：链表蜈蚣 + 炮台 + 飞镖',
        d: '每一节都是独立对象，用 ahead / behind 双向指针串成链表：头负责导航，身体只跟随。Blaster 只管移动（斜向要归一化），Dart 平时挂在玩家头顶待发 —— 三个角色职责互不重叠，谁也不知道别人的存在。' },
      { t: '④ 建循环：到达格点才决策',
        d: '用 MoveTowards 匀速逼近目标格，到达（距离 < 0.1）才调用 UpdateHeadSegment 规划下一格。好处是决策频率等于移动频率而不是帧率，行为在任何机器上完全一致；调试时还能用 OnDrawGizmos 把目标格画成红框，一眼看出它在想什么。' },
      { t: '⑤ 定交互：碰撞即规则落地',
        d: '头撞障碍 → 反向 + 下降一行（越出家区则垂直也反向）；子弹撞节段 → 计分 + 原处生成蘑菇 + 断链；子弹撞蘑菇 → 掉一档血，四档打光才清除；节段撞玩家 → 扣命并重置回合。四条规则一一对应四段碰撞代码，非常好读。' },
      { t: '⑥ 调手感：用分值和场地引导行为',
        d: '打头 100 分、打身体 10 分 —— 十分之差就足够让玩家冒险去够最前面那节（而那里最危险）。过关只提速 10%，配合"每死一节多一朵蘑菇"，难度是自然长出来的，不是调出来的。' },
      { t: '⑦ 做流程：GameManager 统一收口',
        d: 'NewGame 清分 + 重生 + 重撒蘑菇；ResetRound 只扣命、保留分数、把蘑菇 Heal 回满（不是重撒，保住场地记忆）；命尽显示 Game Over，按任意键重开。所有"全局状态变化"只有一个入口，后面加音效、加存档都不会散落各处。' }
    ],

    transfer: [
      '「链表 = 可分裂的敌人」→ 贪吃蛇的身体增长、坦克/炸弹人的队列化敌人、蠕虫类 Boss 的分段破坏，本质都是同一招：让数据结构的操作被玩家看见。',
      '「网格步进 AI + 先探测后移动」→ 吃豆人的幽灵寻路、扫雷的邻格展开、俄罗斯方块的落点判定，都是"把连续空间离散成格，决策只在到达格点的那一刻发生"。',
      '「状态由结构推导，不另存一份」→ 2048 的合并标记、扫雷的翻开状态、打砖块用精灵数组下标表达砖块血量，都是避免"数据与表现不同步"的通用解法。'
    ]
  },

  /* =========================================================================
   * create(api) —— 可玩的浏览器复刻版
   *
   * 刻意与 Unity 版保持结构一致：
   *   网格对齐 → 头部到达格点才规划 → 身体跟随前一段 → 碰撞即规则
   * 变量名也对应源码，方便对照阅读。
   * ======================================================================= */

  create: function (api) {

    /* ---------- 世界：全部按网格离散 ---------- */
    var W = 640, CELL = 20, COLS = 32, ROWS = 20;
    var HUD = 24;                          // 顶部信息条高度
    var TOP = HUD;                         // 网格区起始 y
    var H = TOP + ROWS * CELL;             // 424
    var HOME_MIN = 0, HOME_MAX = ROWS - 1; // 蜈蚣家区（行）：对应 centipede.homeArea
    var FIELD_MIN = 2, FIELD_MAX = 15;     // 蘑菇场（行）：对应 MushroomField.area
    var PZ_TOP = TOP + 16 * CELL;          // 玩家活动区顶部 y

    /* ---------- 参数：与 Inspector 里的字段一一对应 ---------- */
    var MUSH_HP = 4;                       // Mushroom.states.Length（4 张破损图 = 4 血）
    var FIELD_AMOUNT = 50;                 // MushroomField.amount
    var BASE_SIZE = 12;                    // Centipede.size
    var BASE_SPEED = 70;                   // Centipede.speed（像素/秒）
    var PLAYER_SPEED = 175;                // Blaster.speed
    var DART_SPEED = 460;                  // Dart.speed
    var PTS_HEAD = 100, PTS_BODY = 10;     // Centipede.pointsHead / pointsBody

    /* ---------- 状态 ---------- */
    var segments = [];                     // 对应 Centipede.segments：所有节段（跨所有蜈蚣）
    var mushrooms = [];                    // 蘑菇列表
    var mushIdx = {};                      // 'col,row' → 蘑菇，用于 O(1) 查重/查找
    var px = W / 2, py = TOP + 19 * CELL + CELL / 2;   // 玩家（Blaster）位置
    var dartOn = false, dartX = 0, dartY = 0;          // 飞镖：dartOn 对应 "!rb.isKinematic"
    var fireCd = 0;                        // 连发冷却（浏览器版手感用）
    var score = 0, lives = 3, level = 1;
    var speed = BASE_SPEED, size = BASE_SIZE;
    var over = false;                      // Game Over
    var freezeT = 0, pendingDeath = false; // 被撞后的短暂停顿，让玩家看清发生了什么
    var descCd = 0;                        // 下降日志节流
    var varT = 0, booted = false;

    /* ---------- 网格换算 ---------- */
    function cx(c) { return c * CELL + CELL / 2; }
    function cy(r) { return TOP + r * CELL + CELL / 2; }
    function colOf(x) { return Math.floor(x / CELL); }
    function rowOf(y) { return Math.floor((y - TOP) / CELL); }
    function mkey(c, r) { return c + ',' + r; }

    /* ---------- api.hit 包装：初始化期间不打断代码区渲染 ---------- */
    function hit(file, line) { if (booted) api.hit(file, line); }

    /* ======================= 蘑菇场（MushroomField / Mushroom） ======================= */

    function findMush(c, r) { return mushIdx[mkey(c, r)] || null; }

    function addMush(c, r) {
      var m = { col: c, row: r, hp: MUSH_HP };
      mushrooms.push(m);
      mushIdx[mkey(c, r)] = m;
      return m;
    }

    function delMush(m) {
      delete mushIdx[mkey(m.col, m.row)];
      var i = mushrooms.indexOf(m);
      if (i >= 0) mushrooms.splice(i, 1);
    }

    // MushroomField.Generate()：在区域内随机撒蘑菇，坐标对齐网格
    function generateField() {
      mushrooms.length = 0;
      mushIdx = {};
      var made = 0, guard = 0;
      while (made < FIELD_AMOUNT && guard < 5000) {
        guard++;
        var c = Math.floor(Math.random() * COLS);
        var r = FIELD_MIN + Math.floor(Math.random() * (FIELD_MAX - FIELD_MIN + 1));
        if (findMush(c, r)) continue;      // 源码不去重；这里查重以免叠成一格 8 血
        addMush(c, r);
        made++;
      }
      hit('MushroomField.cs', 31);
    }

    function clearField() {               // MushroomField.Clear()
      mushrooms.length = 0;
      mushIdx = {};
      hit('MushroomField.cs', 42);
    }

    function healField() {                // MushroomField.Heal() → Mushroom.Heal()
      for (var i = 0; i < mushrooms.length; i++) mushrooms[i].hp = MUSH_HP;
      hit('MushroomField.cs', 54);
      hit('Mushroom.cs', 42);
    }

    // Mushroom.Damage(1)：掉一档血换一张更破损的图，血尽才清除
    function damageMush(m) {
      m.hp -= 1;
      if (m.hp > 0) {
        hit('Mushroom.cs', 32);
        api.log('蘑菇受损：剩余 ' + m.hp + '/' + MUSH_HP + '（还要 ' + m.hp + ' 发）', 'info');
      } else {
        score += 1;                       // Mushroom.points = 1
        delMush(m);
        hit('Mushroom.cs', 36);
        api.log('蘑菇被打碎 +1 分，场地通透了一点', 'ok');
      }
    }

    /* ======================= 蜈蚣（Centipede / CentipedeSegment） ======================= */

    function makeSeg(col, row) {
      return {
        x: cx(col), y: cy(row),           // 当前像素位置
        tx: cx(col), ty: cy(row),         // 目标格（targetPosition）
        dx: 1, dy: 1,                     // direction：右 + 下
        ahead: null, behind: null
      };
    }

    // Centipede.Respawn()：从头到尾生成，再统一建双向链表指针
    function respawnCentipede() {
      segments = [];
      var spawnCol = Math.min(size, COLS - 2);
      var prev = null;
      for (var i = 0; i < size; i++) {
        var s = makeSeg(spawnCol - i, 0); // 头部在 spawnCol，其余沿 -x 排开
        if (prev) { prev.behind = s; s.ahead = prev; }
        segments.push(s);
        prev = s;
      }
      hit('Centipede.cs', 101);
    }

    function blocked(c, r) {              // 对应 Physics2D.OverlapBox + collisionMask
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return true;
      return !!findMush(c, r);
    }

    // CentipedeSegment.UpdateBodySegment()：只站到前一段当前所在格，并继承它的方向
    function updateBody(b) {
      var g = { c: colOf(b.ahead.x), r: rowOf(b.ahead.y) };
      b.tx = cx(g.c);
      b.ty = cy(g.r);
      b.dx = b.ahead.dx;
      b.dy = b.ahead.dy;
      hit('CentipedeSegment.cs', 115);
      if (b.behind) updateBody(b.behind);
    }

    // CentipedeSegment.UpdateHeadSegment()：全蜈蚣唯一的"大脑"
    function updateHead(s) {
      var gc = colOf(s.x), gr = rowOf(s.y);
      var nc = gc + s.dx, nr = gr;        // 先尝试沿当前水平方向前进一格
      s.tx = cx(nc); s.ty = cy(nr);

      if (blocked(nc, nr)) {
        hit('CentipedeSegment.cs', 82);
        var why = (nc < 0 || nc >= COLS) ? '撞墙' : '撞蘑菇';
        s.dx = -s.dx;                     // 水平反向
        hit('CentipedeSegment.cs', 85);
        nc = gc; nr = gr + s.dy;          // 改为下降一行
        s.tx = cx(nc); s.ty = cy(nr);
        hit('CentipedeSegment.cs', 90);

        // 若下降会越出家区上下边界 → 垂直方向也反向（到底折返向上）
        if (nr > HOME_MAX || nr < HOME_MIN) {
          hit('CentipedeSegment.cs', 96);
          s.dy = -s.dy;
          nr = gr + s.dy;
          s.ty = cy(nr);
          hit('CentipedeSegment.cs', 99);
        }
        if (descCd <= 0) {
          api.log('头部' + why + '：水平反向，' + (s.dy > 0 ? '下降' : '上升') +
                  '一行 → 格 (' + nc + ',' + nr + ')', 'warn');
          descCd = 0.4;
        }
      }

      if (s.behind) updateBody(s.behind); // 头定完，身体依次跟随
    }

    // CentipedeSegment.Update()：MoveTowards 匀速逼近目标格
    function moveSegments(dt) {
      var step = speed * dt;
      for (var i = 0; i < segments.length; i++) {
        var s = segments[i];
        var vx = s.tx - s.x, vy = s.ty - s.y;
        var d = Math.sqrt(vx * vx + vy * vy);
        if (d <= step || d < 0.001) {
          s.x = s.tx; s.y = s.ty;         // MoveTowards 不会越过目标
          if (s.ahead === null) {         // 只有头、且到达格点才规划下一格
            hit('CentipedeSegment.cs', 49);
            hit('CentipedeSegment.cs', 57);
            updateHead(s);
          }
        } else {
          s.x += vx / d * step;
          s.y += vy / d * step;
        }
      }
    }

    // Centipede.Remove(segment)：计分 → 原处生成蘑菇 → 断链 → 清场过关
    function removeSegment(seg) {
      var isHead = (seg.ahead === null);
      var pts = isHead ? PTS_HEAD : PTS_BODY;
      score += pts;
      hit('Centipede.cs', 57);

      var c = colOf(seg.x), r = rowOf(seg.y);
      if (r >= 0 && r < ROWS && !findMush(c, r)) {
        addMush(c, r);                    // 打死一节 = 多一朵蘑菇：越打越堵
        hit('Centipede.cs', 62);
      }

      var front = seg.ahead, back = seg.behind;
      if (front) {
        front.behind = null;              // 前半段到此为止
        hit('Centipede.cs', 66);
      }
      if (back) {
        back.ahead = null;                // 后半段升为新头
        hit('Centipede.cs', 72);
        updateHead(back);                 // 立刻自主导航，不用等下一帧
        hit('Centipede.cs', 73);
      }

      var i = segments.indexOf(seg);
      if (i >= 0) segments.splice(i, 1);

      if (front && back) {
        api.log('打中' + (isHead ? '头部' : '身体第 ' + (indexInWorm(seg) + 1) + ' 节') +
                ' +' + pts + ' 分 → 原地长出蘑菇，蜈蚣断成两条！', 'ok');
      } else {
        api.log('打中' + (isHead ? '头部' : '尾巴') + ' +' + pts + ' 分 → 原地长出蘑菇', 'ok');
      }

      if (segments.length === 0) {        // 打光即过关
        hit('Centipede.cs', 81);
        nextLevel();
      }
    }

    // 只是给日志用：数一下该节段在它那条蜈蚣里排第几
    function indexInWorm(seg) {
      var n = 0, p = seg.ahead;
      while (p) { n++; p = p.ahead; }
      return n;
    }

    /* ======================= 玩家（Blaster / Dart） ======================= */

    function respawnPlayer() {            // Blaster.Respawn()
      px = W / 2;
      py = TOP + 19 * CELL + CELL / 2;
      dartOn = false;
      hit('Blaster.cs', 42);
    }

    // 玩家不能穿墙、也不能穿过蘑菇 —— 这是蘑菇"逼迫"玩家的另一面
    function playerBlocked(x, y) {
      if (x < 9 || x > W - 9) return true;
      if (y < PZ_TOP + 8 || y > H - 8) return true;
      for (var i = 0; i < mushrooms.length; i++) {
        var m = mushrooms[i];
        if (Math.abs(x - cx(m.col)) < 16 && Math.abs(y - cy(m.row)) < 15) return true;
      }
      return false;
    }

    function movePlayer(dt, keys) {
      var vx = 0, vy = 0;
      if (keys.left) vx -= 1;
      if (keys.right) vx += 1;
      if (keys.up) vy -= 1;
      if (keys.down) vy += 1;
      if (vx !== 0 && vy !== 0) { vx *= 0.7071; vy *= 0.7071; } // direction.normalized
      hit('Blaster.cs', 36);
      if (vx !== 0) {
        var nx = px + vx * PLAYER_SPEED * dt;
        if (!playerBlocked(nx, py)) px = nx;
      }
      if (vy !== 0) {
        var ny = py + vy * PLAYER_SPEED * dt;
        if (!playerBlocked(px, ny)) py = ny;
      }
    }

    function tryFire() {                  // Dart.Update()：只有"待发"状态才能发射
      if (over || freezeT > 0 || dartOn || fireCd > 0) return;
      dartOn = true;
      dartX = px;
      dartY = py - 10;
      fireCd = 0.16;
      hit('Dart.cs', 33);
      hit('Dart.cs', 37);
      api.log('发射飞镖 → 目标列 ' + colOf(dartX), 'info');
    }

    function reloadDart() {               // Dart.OnCollisionEnter2D()：归位复装
      dartOn = false;
      hit('Dart.cs', 54);
    }

    // Dart.FixedUpdate()：匀速上飞；分步推进防止高速穿模漏判
    function updateDart(dt) {
      if (!dartOn) {
        if (fireCd > 0) fireCd -= dt;
        return;
      }
      var steps = 4, sdt = dt / steps, v = DART_SPEED * sdt;
      for (var i = 0; i < steps; i++) {
        dartY -= v;
        hit('Dart.cs', 47);
        if (dartY < TOP) { reloadDart(); return; }

        var m = findMush(colOf(dartX), rowOf(dartY));
        if (m) { damageMush(m); reloadDart(); return; }

        for (var j = 0; j < segments.length; j++) {
          var s = segments[j];
          if (Math.abs(s.x - dartX) < CELL * 0.45 && Math.abs(s.y - dartY) < CELL * 0.45) {
            hit('CentipedeSegment.cs', 143);
            removeSegment(s);
            reloadDart();                 // 一发只消灭一节
            return;
          }
        }
      }
    }

    /* ======================= 流程（GameManager） ======================= */

    function newGame() {                  // GameManager.NewGame()
      score = 0; lives = 3; level = 1;
      speed = BASE_SPEED; size = BASE_SIZE;
      over = false; freezeT = 0; pendingDeath = false;
      respawnPlayer();
      clearField();
      generateField();
      respawnCentipede();
      hit('GameManager.cs', 65);
      hit('GameManager.cs', 73);
      api.log('新游戏：蜈蚣 ' + size + ' 节入场，场地 ' + mushrooms.length + ' 朵蘑菇', 'sys');
    }

    function resetRound() {               // GameManager.ResetRound()
      lives = Math.max(0, lives - 1);     // Mathf.Max(value, 0)
      hit('GameManager.cs', 80);
      hit('GameManager.cs', 120);
      if (lives <= 0) { gameOver(); return; }
      healField();                        // 回满血，而不是重新生成
      hit('GameManager.cs', 88);
      respawnCentipede();
      respawnPlayer();
      api.log('回合重置：剩 ' + lives + ' 命，蘑菇回满血，蜈蚣重新入场（分数保留 ' + score + '）', 'warn');
    }

    function nextLevel() {                // GameManager.NextLevel()
      level++;
      speed = speed * 1.1;                // 源码只提速 10%
      size += 2;                          // 浏览器版额外加长，让"更难"看得见
      hit('GameManager.cs', 108);
      respawnCentipede();
      api.log('过关！第 ' + level + ' 关：速度 ×1.1 = ' + speed.toFixed(0) +
              '，节段 ' + size + ' 节', 'ok');
    }

    function gameOver() {
      over = true;
      hit('GameManager.cs', 95);
      api.log('Game Over —— 最终得分 ' + score + '，到达第 ' + level + ' 关。按任意键重新开始', 'err');
    }

    function checkPlayerHit() {
      for (var i = 0; i < segments.length; i++) {
        var s = segments[i];
        if (Math.abs(s.x - px) < 12 && Math.abs(s.y - py) < 12) {
          hit('CentipedeSegment.cs', 139);
          freezeT = 0.9;
          pendingDeath = true;
          api.log('蜈蚣撞到炮台！', 'err');
          return;
        }
      }
    }

    /* ======================= 每帧更新 ======================= */

    function update(dt, keys, api) {
      if (descCd > 0) descCd -= dt;

      if (over) { publish(); return; }

      if (freezeT > 0) {                  // 被撞后的短暂停顿
        freezeT -= dt;
        if (freezeT <= 0 && pendingDeath) {
          pendingDeath = false;
          resetRound();
        }
        publish();
        return;
      }

      movePlayer(dt, keys);
      if (keys.fire) tryFire();           // 按住也能连发（有冷却）
      updateDart(dt);
      moveSegments(dt);
      checkPlayerHit();
      publish();
    }

    /* ---------- 关键变量推给底部面板（约 10Hz，别每帧刷 DOM） ---------- */
    function publish() {
      varT++;
      if (varT % 6) return;
      var heads = 0;
      for (var i = 0; i < segments.length; i++) if (segments[i].ahead === null) heads++;
      api.vars({
        'score': score,
        'lives': lives,
        'level': level,
        'centipede.size': size,
        'segments.alive': segments.length,
        'centipede.count': heads,
        'centipede.speed': speed.toFixed(1),
        'mushrooms': mushrooms.length,
        'dart': dartOn ? '飞行中' : '待发'
      });
    }

    /* ======================= 渲染 ======================= */

    var MUSH_COLORS = ['#4ade80', '#a3e635', '#facc15', '#fb923c']; // 完好 → 将毁

    function drawMushroom(ctx, m) {
      var x = cx(m.col), y = cy(m.row);
      var dmg = MUSH_HP - m.hp;                 // 0=完好 3=将毁
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x - 2.5, y - 3, 5, 9);       // 菌柄
      ctx.fillStyle = MUSH_COLORS[dmg] || MUSH_COLORS[3];
      var r = 8 - dmg * 1.3;                    // 越破损越小
      ctx.beginPath();
      ctx.arc(x, y - 3, r, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(x - r, y - 3, r * 2, 2.5);
    }

    function drawSegment(ctx, s) {
      var head = (s.ahead === null);            // 头部由链表结构决定
      var x = s.x, y = s.y, r = head ? 9 : 7.5;
      // 脚：朝移动方向两侧张开
      ctx.strokeStyle = 'rgba(0,0,0,.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - r * 0.7, y + r * 0.4); ctx.lineTo(x - r * 1.3, y + r * 1.3);
      ctx.moveTo(x + r * 0.7, y + r * 0.4); ctx.lineTo(x + r * 1.3, y + r * 1.3);
      ctx.stroke();
      ctx.fillStyle = head ? '#f472b6' : '#a3e635';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      if (head) {                               // 头：两只眼睛
        ctx.fillStyle = '#0b1020';
        ctx.beginPath();
        ctx.arc(x - 3, y - 2.5, 1.6, 0, Math.PI * 2);
        ctx.arc(x + 3, y - 2.5, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function draw(ctx, api) {
      /* 背景 */
      ctx.fillStyle = '#071016';
      ctx.fillRect(0, 0, W, H);

      /* 玩家活动区底色 */
      ctx.fillStyle = 'rgba(56,189,248,.05)';
      ctx.fillRect(0, PZ_TOP, W, H - PZ_TOP);
      ctx.strokeStyle = 'rgba(56,189,248,.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, PZ_TOP + 0.5);
      ctx.lineTo(W, PZ_TOP + 0.5);
      ctx.stroke();

      /* 网格（淡） */
      ctx.strokeStyle = 'rgba(255,255,255,.045)';
      ctx.beginPath();
      for (var c = 0; c <= COLS; c++) { ctx.moveTo(c * CELL, TOP); ctx.lineTo(c * CELL, H); }
      for (var r = 0; r <= ROWS; r++) { ctx.moveTo(0, TOP + r * CELL); ctx.lineTo(W, TOP + r * CELL); }
      ctx.stroke();

      /* 蘑菇 */
      for (var i = 0; i < mushrooms.length; i++) drawMushroom(ctx, mushrooms[i]);

      /* 蜈蚣节段 */
      for (var j = 0; j < segments.length; j++) drawSegment(ctx, segments[j]);

      /* 飞镖 */
      if (dartOn) {
        ctx.fillStyle = '#fde047';
        ctx.fillRect(dartX - 1.5, dartY - 7, 3, 14);
      }

      /* 玩家炮台 */
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(px, py - 9);
      ctx.lineTo(px - 9, py + 7);
      ctx.lineTo(px + 9, py + 7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      /* 顶部信息条 */
      ctx.fillStyle = '#0b131c';
      ctx.fillRect(0, 0, W, HUD);
      ctx.fillStyle = 'rgba(148,163,184,.92)';
      ctx.font = '600 12px -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      var heads = 0;
      for (var k = 0; k < segments.length; k++) if (segments[k].ahead === null) heads++;
      ctx.fillText('分数 ' + score, 10, HUD / 2);
      ctx.fillText('生命 ' + lives, 108, HUD / 2);
      ctx.fillText('第 ' + level + ' 关', 188, HUD / 2);
      ctx.fillText('剩余节段 ' + segments.length + '/' + size, 258, HUD / 2);
      ctx.fillText('蜈蚣 ' + heads + ' 条', 388, HUD / 2);
      ctx.fillText('蘑菇 ' + mushrooms.length, 470, HUD / 2);
      ctx.fillText('速度 ' + speed.toFixed(0), 560, HUD / 2);

      /* 提示 */
      ctx.textAlign = 'center';
      if (freezeT > 0) {
        ctx.fillStyle = '#fca5a5';
        ctx.font = '600 20px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('被蜈蚣撞到！', W / 2, H / 2 - 10);
      }
      if (over) {
        ctx.fillStyle = 'rgba(7,16,22,.72)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#fca5a5';
        ctx.font = '600 26px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 14);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '14px -apple-system, "PingFang SC", sans-serif';
        ctx.fillText('得分 ' + score + ' · 第 ' + level + ' 关 · 按任意键重新开始', W / 2, H / 2 + 18);
      }
      ctx.textAlign = 'left';
    }

    /* ======================= 输入 ======================= */

    function onKey(key, down, api) {
      if (over) {
        if (down) newGame();              // GameManager.Update()：命尽后任意键重开
        return;
      }
      if (key === 'fire' && down) tryFire();
    }

    function onPointer(x, y, down, api) {
      if (!down) return;
      if (over) { newGame(); return; }
      if (x > 9 && x < W - 9 && !playerBlocked(x, py)) px = x;   // 点击即对准
      tryFire();                                                  // 点击发射
    }

    function onPointerMove(x, y, api) {
      if (over || freezeT > 0) return;
      if (x > 9 && x < W - 9 && !playerBlocked(x, py)) px = x;
      var ty = y;
      if (ty < PZ_TOP + 8) ty = PZ_TOP + 8;
      if (ty > H - 8) ty = H - 8;
      if (!playerBlocked(px, ty)) py = ty;
    }

    /* ======================= 启动 ======================= */

    newGame();
    booted = true;                        // 之后才允许 api.hit 打断代码区

    return {
      w: W, h: H,
      reset: function () { newGame(); api.log('已重置 —— 回到第 1 关', 'sys'); },
      update: update,
      draw: draw,
      onKey: onKey,
      onPointer: onPointer,
      onPointerMove: onPointerMove
    };
  }
});
