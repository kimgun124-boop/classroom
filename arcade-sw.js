/* 🕹️ 우리반 오락실 앱 (홈 화면 아이콘) — 늘 최신 오락실을 먼저 받고, 인터넷이 끊겼을 때만 저장해 둔 것을 써요.
   arcade.html은 브라우저 저장본(캐시)을 건너뛰고 늘 서버에서 새로 받아요.
   손들고 말해요(index.html) 같은 다른 파일은 건드리지 않아요. */
const C = "arcade-app-v2";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  if (!/\/(arcade\.html|arcade\.webmanifest|arcade-version\.json|fonts\/|icons\/)/.test(u.pathname)) return;
  const html = /arcade\.(html|webmanifest)$/.test(u.pathname) || /arcade-version\.json$/.test(u.pathname);
  e.respondWith((html ? fetch(r.url, {cache: "no-store", credentials: "same-origin"}) : fetch(r)).then(res => { if (res.ok){ const c = res.clone(); caches.open(C).then(x => x.put(r, c)); } return res; })
    .catch(() => caches.match(r, {ignoreSearch: true}).then(m => m || Response.error())));
});
