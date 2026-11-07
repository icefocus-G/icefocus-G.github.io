/* 工具箱应用壳的 Service Worker。
 *
 * 只负责 /app/ 这一层皮：壳本身、图标、清单。
 * 里面的 /tool/ 不在本 SW 的作用域内，照常走网络（工具中心有新内容立刻可见，
 * 不会被一份旧缓存卡住）。
 *
 * 缓存策略
 *   导航请求   network-first  → 断网时用缓存里的壳，仍然能打开、能看到「连不上」提示
 *   静态资源   cache-first
 */

const CACHE = "toolbox-shell-v2";

const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-1024.png",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL).catch(() => {}))
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
  /* 作用域外的请求（比如 /tool/）一律不碰 */
  if (!url.href.startsWith(self.registration.scope)) return;

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      });
    })
  );
});
