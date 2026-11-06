/* 工具箱数据 —— 只改这个文件就能维护整页。
 *
 * 为什么用 .js 而不是 .json：直接双击打开 tool/index.html（file:// 协议）时
 * fetch 读本地 JSON 会被浏览器拦掉，用 <script> 载入则不受影响。
 *
 * 字段说明
 *   id      唯一标识，随意（英文数字短横线）
 *   name    名称
 *   desc    一句话说明
 *   href    链接；留空表示"待添加"
 *   tag     右上角小标签（可选，比如「在线」「Mac」）
 *   icon    一个字符或 emoji（可选，不填用名称首字）
 *   open    是否新标签页打开，默认 true
 *
 * 共预留 20 个位置。要启用某个空位，把 href 填上即可，页面会自动把
 * 「待添加」变成「可用」。
 */
window.WB_TOOLS = [
  {
    id: 'img-cut',
    name: 'AI 图片切图',
    desc: '去背景并按元素自动切块导出 PNG。首次用先设好本机「源文件目录」和「切图输出目录」，之后打开自动沿用；每台电脑各设一次。',
    href: 'img-cut/',
    tag: '本机目录',
    icon: '✂',
    open: true,
  },
  {
    id: 'psd-rename',
    name: '投放图 PSD 批量生成',
    desc: '按需求数据表批量建目录、复制并重命名模板 PSD（含视频用图）。需要先指定本机的表格目录、模板目录、输出目录，设置会被记住。',
    href: 'psd-rename/',
    tag: '本机目录',
    icon: '▤',
    open: true,
  },
  {
    id: 'number-gen',
    name: '数值随机生成器',
    desc: '六档奖级（GRAND 16 位 → MINI 7 位），每档 8 组号码。每次进入或刷新都重出一套，位数固定、千分位显示，可单档重摇、逐组复制。',
    href: 'number-gen/',
    tag: '在线',
    icon: '#',
    open: true,
  },
  {
    id: 'shizi',
    name: '识字卡片 · A4 打印',
    desc: '给小朋友识字用：识字表 A4 每行 8 字、共 11 行，多出的字自动顺延下一张；词组表按已有字搭配 2/3/4 字词组，可按字数直接定位。加字后词组自动重新搭配，每张都能导出 300dpi PNG 直接打印。',
    href: '../shizi/',
    tag: '在线',
    icon: '字',
    open: true,
  },
  { id: 'slot-08', name: '', desc: '', href: '', tag: '', icon: '' },
  { id: 'slot-09', name: '', desc: '', href: '', tag: '', icon: '' },
  { id: 'slot-10', name: '', desc: '', href: '', tag: '', icon: '' },
  { id: 'slot-11', name: '', desc: '', href: '', tag: '', icon: '' },
  { id: 'slot-12', name: '', desc: '', href: '', tag: '', icon: '' },
  { id: 'slot-13', name: '', desc: '', href: '', tag: '', icon: '' },
  { id: 'slot-14', name: '', desc: '', href: '', tag: '', icon: '' },
  { id: 'slot-15', name: '', desc: '', href: '', tag: '', icon: '' },
  { id: 'slot-16', name: '', desc: '', href: '', tag: '', icon: '' },
  { id: 'slot-17', name: '', desc: '', href: '', tag: '', icon: '' },
  { id: 'slot-18', name: '', desc: '', href: '', tag: '', icon: '' },
  { id: 'slot-19', name: '', desc: '', href: '', tag: '', icon: '' },
];
