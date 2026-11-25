# 开发经验 · DEV NOTES

工具箱里的一栏，专门放「做东西时真正管用的东西」：别人写透的复盘、自己踩过的坑、能照着走的流程。

- 页面入口：`tool/dev-notes/index.html`（站内地址 `/tool/dev-notes/`）
- 工具箱入口：`tool/tools.js` 里的 `dev-notes` 卡片

## 目录结构

```
tool/dev-notes/
├── index.html                  列表页（深色，跟工具箱同一套调子）
├── notes.js                    ★ 文章数据，加文章只改这里
├── README.md
└── ai-game-postmortem/         第 1 篇
    ├── index.html              阅读页（浅色，长文专用排版）
    └── assets/
        ├── img/                配图（截图类已转 webp，照片类保留 jpg）
        └── video/              动画 / 视频
```

## 新增一篇文章

1. 建文件夹，文件夹名用英文小写短横线，例如 `unity-shader-notes/`：

```
tool/dev-notes/unity-shader-notes/
├── index.html     文章正文页
└── assets/img/    配图
```

2. 在 `notes.js` 的 `window.DEV_NOTES` 数组里复制一段、改字段：

```js
{
  id: 'unity-shader-notes',
  title: '标题',
  subtitle: '副标题（可省）',
  desc: '卡片上的两行简介',
  href: 'unity-shader-notes/',
  date: '2026-12-01',
  tags: ['Unity', 'Shader'],     // 顶部筛选条自动生成
  author: 'ICEFOCUS',
  cover: 'unity-shader-notes/assets/img/cover.jpg',
  stats: { parts: '1 篇', words: '8,000 字' },
  // featured: true,             // 只有想放顶部大卡时才写，建议全站只留一篇
},
```

3. 保存刷新即可。`DEV_NOTES_SLOTS` 是预留位总数，空位会自动减少，**不用改 index.html**。

## 约定

- 封面建议 16:9 或更宽，最小宽度 960px，单张控制在 300KB 以内。
- 截图类图片用 webp（`cwebp -q 88 -sharp_yuv`），照片用 jpg（质量 82 左右）。
- 视频统一放 `assets/video/`，mp4（H.264 / AAC），单段尽量小于 3MB。
- 转载、整理他人文章时，页面里必须写清原作者与原文链接；版权归原作者。
