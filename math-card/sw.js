/* 离线缓存：装到手机主屏后断网也能用
   - 页面和题库走「网络优先」，改完数据刷新就是新的
   - 图标等静态资源走「缓存优先」
   - 语音 mp3 一律放行（原因见下） */
const CACHE = "math-cards-v1";
const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./data/books.json",
  "./data/books.js",
  "./data/types.json",
  "./data/types.js",
  "./data/know.json",
  "./data/know.js",
  "./data/apply.json",
  "./data/apply.js",
  "./data/tables.json",
  "./data/tables.js",
  "./data/audio/manifest.json",
  "./data/audio/manifest.js",
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

  /* ------------------------------------------------------------
     语音文件绝对不拦。
     ------------------------------------------------------------
     Safari（iPad / iPhone）播放 <audio> 时会先发 Range 请求，
     Service Worker 一旦响应，返回的是缓存里那份完整的 200，
     而不是 206 —— Safari 会判定「服务器不支持分段」然后不出声，
     桌面 Chrome 比较宽容所以看不出来。
     这里直接放行，让浏览器自己跟服务器协商 Range 和 HTTP 缓存。
     ------------------------------------------------------------ */
  const isVoiceFile = url.pathname.includes("/data/audio/") &&
                      !url.pathname.endsWith("manifest.json");
  if (isVoiceFile || req.headers.has("range")) return;

  const networkFirst =
    req.mode === "navigate" ||
    url.pathname.endsWith("/") ||
    url.pathname.endsWith("index.html") ||
    url.pathname.endsWith("books.json") ||
    url.pathname.endsWith("types.json") ||
    url.pathname.endsWith("know.json") ||
    url.pathname.endsWith("apply.json") ||
    url.pathname.endsWith("tables.json") ||
    url.pathname.endsWith("manifest.json");

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
  } else if (url.pathname.includes("/data/audio/")) {
    /* 走到这里只剩 manifest.json（上面已把 mp3 放行） */
    e.respondWith(
      caches.match(req).then(r => r || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }))
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
