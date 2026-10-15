# Western Economics · 西方经济学（中级）

课程代码 **13135**（旧课码 **00139**，题型结构完全一致）。

## 文件

| 文件 | 作用 |
|---|---|
| `study.html` | 学习助手壳层（大纲精讲 / 历年真题库 双页签 + 云同步），课程中心入口 |
| `outline.html` | 大纲精讲 —— 交互式教程（16 章正文 + 15 章教材联动手册 + 附录公式/名词/必背结论，30+ 可拖动图形） |
| `bank.html` | 历年真题库 —— 13 套真题 + 名词解释 / 概述题 / 计算题 / 考前预测 / 大纲背诵库 |

## 内容来源

- **真题**：2020 年 8 月 — 2026 年 4 月，共 13 套、449 题（单选 20 + 多选 5 + 名词解释 5 + 简答 3 + 计算 2 + 论述 2）。
  2024 年 10 月起课程码由 00139 换为 13135，两套课码试卷结构一致。
  `2025 年 10 月` 全卷未公开，仅收录已披露的单选第 1—5 题。
- **大纲资料**：《西方经济学（中级）交互教程》，与历年真题官方评分参考合并重排，按教材 16 章归章。

## 云同步

- 课程 id：`WE13135`
- localStorage 前缀：`we13135_exam_`（题库作答）/ `we13135_tut_progress_v1`（大纲精讲进度）/ `WE13135::`（学习记录与笔记）
- 云端数据文件：`data/WE13135-sync.json`
- 同步引擎：`../../script/cloud.js`（与 `International Finance` 共用同一套，靠 `window.IF_SYNC_CFG.id` 区分课程）

首次使用：进入 `study.html` → 右上角「☁ 云同步」→ 粘贴一次 GitHub Token 即可全自动。

## 更新题库

1. 改 `build_we_db.py` 的数据源，重新生成 `WE13135-DB.json`；
2. 跑 `make_we_bank.py` 覆盖 `bank.html`。

DB 结构（`const DB = {...}`）与 `International Finance/bank.html` 完全一致：
`meta / papers / terms / overs / calcs / points / outline`。
