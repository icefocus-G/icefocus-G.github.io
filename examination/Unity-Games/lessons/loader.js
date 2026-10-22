/* =============================================================================
 * loader.js —— 课时清单与加载器
 * -----------------------------------------------------------------------------
 * 每个游戏 = 一个 id，对应两个文件：
 *
 *   lessons/<id>.code.js  —— 原始 Unity C# 源码（按行切好的数据）
 *                            由 tools/build_code.py 从「源码/<游戏>/」自动生成
 *                            ⚠ 自动生成，不要手工编辑
 *
 *   lessons/<id>.js       —— 人工维护，包含三样东西：
 *                            1) create(api)：浏览器里可玩的 Canvas 复刻版
 *                            2) think / notes：教学文案与「为什么这么写」
 *                            3) 元数据：name / ico / difficulty / tags / controls
 *
 * 新增一个游戏：往下面的 UG_ORDER 加一个 id，再放上这两个文件即可，
 * 首页卡片和侧边目录都会自动出现。
 * ========================================================================== */

/* 课时顺序 = 推荐阅读顺序（由易到难）。
   这个顺序决定了：首页卡片顺序、侧边栏目录顺序、上一课 / 下一课。 */
window.UG_ORDER = [
  'pong',          // 1 星 · 2D 物理与碰撞回调
  'snake',         // 1 星 · 网格移动与队列
  'flappybird',    // 2 星 · 重力跳跃与视差滚动
  'brickbreaker',  // 2 星 · 反弹方向与关卡管理
  'donkeykong',    // 2 星 · 生成器与场景切换
  'asteroids',     // 3 星 · 刚体推力与屏幕环绕
  'spaceinvaders', // 3 星 · 方阵移动与协程
  'bomberman',     // 3 星 · Tilemap 与递归爆炸
  'centipede',     // 3 星 · 链表跟随与网格生成
  'minesweeper',   // 3 星 · 状态机与 Flood Fill
  'game2048',      // 4 星 · 网格索引与滑动合并
  'tetris',        // 4 星 · 旋转矩阵与踢墙表
  'pacman'         // 5 星 · 幽灵状态机与路径点图
];

/* -----------------------------------------------------------------------------
 * UG_LOAD(cb)：按 UG_ORDER 顺序依次注入 <script>，全部就绪后回调 cb。
 *
 * 为什么串行而不是并行：
 *   - 并行注入时脚本执行顺序不保证，UG_LESSONS 里的插入顺序会乱，
 *     侧边栏目录就会出现"随机排序"的诡异现象。
 *   - 串行虽然慢一点点（本地文件几乎无感），但顺序确定、调试容易。
 * -------------------------------------------------------------------------- */
window.UG_LOAD = function (cb) {
  var i = 0;
  var order = window.UG_ORDER || [];

  function inject(src, done) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = done;
    s.onerror = function () {
      console.error('[Unity-Games] 加载失败: ' + src);
      done();                       // 单个文件挂了不让整页死掉，跳过继续
    };
    document.head.appendChild(s);
  }

  function next() {
    if (i >= order.length) return cb();
    var id = order[i++];
    inject('lessons/' + id + '.code.js', function () {
      inject('lessons/' + id + '.js', next);
    });
  }

  next();
};
