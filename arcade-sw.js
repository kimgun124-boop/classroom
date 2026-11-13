/* 🕹️ 우리반 오락실 앱 (홈 화면 아이콘) — 늘 최신 오락실을 먼저 받고, 인터넷이 끊겼을 때만 저장해 둔 것을 써요.
   손들고 말해요(index.html) 같은 다른 파일은 건드리지 않아요. */
const C = "arcade-app-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  if (!/\/(arcade\.html|arcade\.webmanifest|fonts\/|icons\/)/.test(u.pathname)) return;
  e.respondWith(fetch(r).then(res => { if (res.ok){ const c = res.clone(); caches.open(C).then(x => x.put(r, c)); } return res; })
    .catch(() => caches.match(r, {ignoreSearch: true}).then(m => m || Response.error())));
});
