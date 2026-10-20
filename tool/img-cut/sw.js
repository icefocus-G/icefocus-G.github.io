/* 这个 Service Worker 只做一件事：让页面满足「可安装」条件。
 *
 * 为什么需要：Chrome 122 起，File System Access 的目录授权是三选一
 * （仅允许这次 / 每次访问时允许 / 不允许），而「已安装的应用」会自动获得持久授权，
 * 连这个选择框都不再出现 —— 这正是"刷新后不用再点确认"的唯一官方途径。
 *
 * 刻意不做任何缓存：页面是单文件 + 少量共享脚本，缓存只会让人拿到旧代码。
 * （fetch 监听器不调用 respondWith，等于完全透传网络。）
 */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) { event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function () { /* 透传，不缓存 */ });
