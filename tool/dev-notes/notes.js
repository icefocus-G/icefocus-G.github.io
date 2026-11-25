/* 开发经验 · 文章数据 —— 以后加文章只改这个文件。
 *
 * 为什么是 .js 不是 .json：直接双击打开 dev-notes/index.html（file:// 协议）时，
 * 浏览器会拦掉 fetch 读本地 JSON，用 <script> 载入就不受影响。
 *
 * 字段说明
 *   id        唯一标识（英文小写 + 短横线），同时建议作为文件夹名
 *   title     标题
 *   subtitle  副标题（可选，显示在标题下方）
 *   desc      两行以内的简介，卡片上显示
 *   href      文章入口，一般写 '文件夹名/'；留空则卡片显示「待添加」
 *   date      日期 YYYY-MM-DD
 *   tags      标签数组，页面顶部的筛选条会据此自动生成
 *   author    作者
 *   source    原文链接（可选）
 *   cover     封面图路径，相对本文件；建议 16:9 或更宽
 *   stats     卡片右下角的数字，键名任意，值会原样显示
 *   featured  true 时作为顶部大卡片展示（只建议留一篇）
 *
 * 新增一篇文章的标准动作：
 *   1) 把文章文件夹（含 assets）放进 dev-notes/ 下
 *   2) 在下面数组里复制一段、改字段
 *   3) 完事。空位会自动少一个，不需要动 index.html。
 */
window.DEV_NOTES = [
  {
    id: 'ai-game-postmortem',
    title: '0 代码基础，用 AI 做出 10 万人玩过的独立游戏',
    subtitle: '《群侠传：幸存者》全流程复盘 · 4 篇合集',
    desc: '从需求澄清、Vibe Coding，到 AI 美术与动画、音频配音，再到上架运营和玩家反馈 —— 把每个环节用的模型、工具、Prompt 和踩过的坑都写了下来。',
    href: 'ai-game-postmortem/',
    date: '2026-10-28',
    tags: ['游戏开发', 'AI 工作流', '整理转载'],
    author: 'Nenly（@Nenlyonis）',
    source: 'https://x.com/Nenlyonis/status/2115414690092253209',
    cover: 'ai-game-postmortem/assets/img/a1-img01.jpg',
    stats: { parts: '4 篇', words: '38,816 字', imgs: '82 图', vids: '20 视频' },
    featured: true,
  },
];

/* 预留多少个空位。已收录的文章会自动占位，剩下的显示「待添加」。 */
window.DEV_NOTES_SLOTS = 7;
