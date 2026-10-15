# icefocus-G.github.io

ICEFOCUS 个人站 + 自考学习平台。网页 / 手机浏览器 / 安卓 APK 三端同一份代码，学习数据自动同步到 GitHub。

## 目录

```
index.html                   首页：随机抽取一套皮肤全屏展示（不是固定页面）
ThemedSkin/                  首页皮肤，文件名任意 —— 详见 ThemedSkin/README.md
  default.html               默认皮肤（原首页，暗色粒子 + ICEFOCUS 逐字）
manifest.json                皮肤清单（脚本自动生成）
examination/                 Learning Course 课程中心
  index.html                 课程列表（已上线 / 建设中）
  International Finance/     国际金融 00076：study.html 壳层 + outline.html 大纲 + bank.html 题库
  Western Economics/         西方经济学（占位，待建设）
script/
  cloud.js                   云同步引擎（多课程通用，靠 window.IF_SYNC_CFG 配置）
  skins.js                   皮肤清单（不存在也没有关系，会自动退回 manifest.json）
  rebuild-skins.js           扫描 ThemedSkin/ 重建清单
  rebuild-skins.command        双击版，同上
data/
  IF00076-sync.json          权威数据源（本机 localStorage 只是缓存）
apk/                         安卓打包工程 + 一键构建脚本
assets/                      站点图标
document/README.md           本文件
```

## 首页皮肤随机显示

根目录 `index.html` 是一个加载器：每次打开从 `ThemedSkin/` 里随机抽一套皮肤，
右下角胶囊可以「换一个」或「锁定」当前这套；`index.html?skin=xxx.html` 可直接指定。
新增皮肤只需把 HTML 丢进文件夹并双击 `script/rebuild-skins.command`。

## 学习数据同步到 GitHub

以 `data/IF00076-sync.json` 为权威存储，答题答案与判分结果确定后立即上传：

- **读**：本地文件优先，取不到时回退 `raw.githubusercontent.com`（离线也不影响做题）；
- **写**：GitHub Contents API，Token 只存在本机浏览器 / APK 的 WebView 里；
- **触发**：单选 / 多选判分 → 立即同步；交卷、自评、错题本、笔记、折叠滚动约 1 秒后合并上传；
- **合并**：本机改过的键优先，其余以云端为准，绝不整体覆盖。

每个浏览器（含 APK 里的 WebView）只需在课程页 ☁ 云同步面板粘贴一次 Token。

## 打包安卓 APK

```bash
cd apk && ./build.sh
```

详见 `apk/README.md`。成品：`LearningCourse-<日期>.apk`（minSdk 24，约 470KB）。
