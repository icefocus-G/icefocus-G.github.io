/* 离线缓存：装到手机主屏后断网也能用
   - 页面和词库走「网络优先」，改完数据刷新就是新的
   - 图标等静态资源走「缓存优先」 */
const CACHE = "shizi-cards-v1";
const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./data/dict.json",
  "./assets/icon-180.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CORE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  const networkFirst =
    req.mode === "navigate" ||
    url.pathname.endsWith("/") ||
    url.pathname.endsWith("index.html") ||
    url.pathname.endsWith("dict.json");

  if (networkFirst) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() =>
        caches.match(req).then(r => r || caches.match("./index.html"))
      )
    );
  } else {
    e.respondWith(
      caches.match(req).then(r => r || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }))
    );
  }
});
