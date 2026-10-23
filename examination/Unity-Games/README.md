# Unity 小游戏开发实战

13 个经典小游戏的 Unity C# 源码逐句拆解。每课四节：

```
① 可玩演示（浏览器 Canvas 复刻，直接上手）
② 源码逐句分析（原始 C# + 「为什么这么写」）
③ 运行结果（控制台输出 + 关键变量）
④ 闯关测验（选一个立刻看对错与解析）
```

左侧课时目录带序号与完成度，顶部/侧栏显示学习进度，「标记完成」与测验记录都存 localStorage，刷新不丢。

## 怎么打开

双击 `index.html` 进入课程首页（学习路径 / 七步法 / 13 课卡片）；
点课时卡进入 `outline.html?g=<id>`，例如 `outline.html?g=pong`。

> 纯静态：直接 `file://` 打开即可，无需服务器、无需安装 Unity。

## 目录结构

```
Unity-Games/
├── index.html          课程首页（学习路径 + 思维七步法 + 课时卡）
├── outline.html        课时页外壳（?g=<id>）
├── bank.html           练习题页（全量题库，可筛选）
├── assets/
│   ├── style.css       原有版式基础（令牌 + 演示/代码/日志组件）
│   ├── course.css      课程皮肤（顶栏进度、课时目录、分节卡片、测验、翻页）
│   ├── app.js          课程引擎：Canvas 挂载、源码高亮、逐句讲解、运行日志
│   ├── course.js       课程层：进度、测验、完成标记、上/下一课
│   └── quiz.js         题库（由 bank.html 的 QS 原样抽出，供课时页复用）
├── lessons/
│   ├── loader.js       课时顺序 UG_ORDER + 串行加载器
│   ├── <id>.js         可玩实现 + 教学文案 + 逐句注释映射（人工维护）
│   └── <id>.code.js    原始 C# 源码行数据（tools/build_code.py 自动生成）
└── course.json         课程中心配置（order 4，theme #7c3aed）
```

## 关键实现

| 关注点 | 位置 | 说明 |
|---|---|---|
| 课时顺序 | `lessons/loader.js` 的 `UG_ORDER` | 决定首页卡片、侧栏目录、上一课/下一课 |
| 逐句讲解 | `lessons/<id>.js` 的 `notes` | 键为文件名，值里 `行号 → 讲解` |
| 代码高亮 | `assets/app.js` 的 `hlLine` | 单遍扫描，注释/字符串/数字/关键字各包一层 span |
| 运行日志 | `api.log` / `api.vars` / `api.hit` | 游戏代码通过 `api` 向页面回报状态，`hit` 会点亮对应源码行 |
| 测验 | `assets/quiz.js` + `course.js` | 按题库 `c` 字段（如 `Pong · 物理`）匹配当前课时 |
| 进度 | `localStorage: ug.course.done.v1` | 标记完成 → 侧栏打勾 + 顶栏进度 |

## 新增一个游戏

1. 在 `lessons/` 放 `<id>.js`（`UG_LESSON('id', {...})`）与 `<id>.code.js`（`UG_CODEFILE('id', [...])`）；
2. 把 `id` 加进 `lessons/loader.js` 的 `UG_ORDER`；
3. 想带测验，就在 `bank.html` 的 `QS` 里加同前缀分类（如 `Tetris · 手感`），再同步到 `assets/quiz.js`。

首页卡片与侧栏目录会自动出现。
