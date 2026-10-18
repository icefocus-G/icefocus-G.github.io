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
    id: 'task-sync',
    name: '任务同步站',
    desc: '把不同电脑上 WorkBuddy 的任务记录、会话产物汇总到一个看板，微信扫码登录。',
    href: 'https://wb-task-sync.app.workbuddy.host/',
    tag: '在线',
    icon: '↻',
    open: true,
  },
  {
    id: 'task-sync',
    name: '任务同步站',
    desc: '站内直接操作：不同电脑上 WorkBuddy 的任务记录、会话产物汇总到一个看板。首次使用先在新窗口登录一次。',
    href: 'tasksync.html',
    tag: '站内',
    icon: '↻',
    open: false,
  },
  {
    id: 'task-sync-window',
    name: '任务同步站 · 新窗口',
    desc: '独立窗口打开看板。首次登录、或站内嵌入页扫码没反应时用这个。',
    href: 'https://wb-task-sync.app.workbuddy.host/',
    tag: '在线',
    icon: '⇱',
    open: true,
  },
  {
    id: 'task-sync-install',
    name: '采集器安装脚本',
    desc: '新电脑装一次就开机自启，之后网页自动同步本机 WorkBuddy 任务。macOS/Linux 与 Windows 各一份。',
    href: 'https://github.com/icefocus-G/icefocus-G.github.io/tree/main/tasksync/collector',
    tag: '脚本',
    icon: '↓',
    open: true,
  },
  { id: 'slot-04', name: '', desc: '', href: '', tag: '', icon: '' },
  { id: 'slot-05', name: '', desc: '', href: '', tag: '', icon: '' },
  { id: 'slot-06', name: '', desc: '', href: '', tag: '', icon: '' },
  { id: 'slot-07', name: '', desc: '', href: '', tag: '', icon: '' },
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
  { id: 'slot-20', name: '', desc: '', href: '', tag: '', icon: '' },
];
