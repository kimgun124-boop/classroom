/* =====================================================================
   🎲 우리반 보드게임 — 로그인 · 저장(이 기기 / Firebase) · 홈 · 랭킹 · 선생님 화면
   ===================================================================== */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let toastTimer = 0;
function toast(msg){ $("#toastMsg").textContent = msg; $("#undoBtn").style.display = "none"; $("#toast").classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 3500); }
/* =====================================================================
   ⚡ 렉 줄이기 (반 전체 22명이 각자 태블릿·크롬북으로 해도 부드럽게)
   1) 캔버스 해상도 상한: 화면이 커져도 그리는 점(픽셀) 수가 넘치지 않게
   2) 이모지 얼굴 그림 기억: 같은 얼굴을 매 장면 글자로 다시 그리지 않고 한 번 그린 그림을 붙여요
   3) 느린 기기 자동 감지: 게임 중 화면이 버벅이면 반짝이(그림자 번짐)를 끄고 해상도를 낮춰요
   ===================================================================== */
const PERF = {
  lite: false, dprCap: 2, slowSec: 0, raf: 0,
  // 화면 크기 × 해상도²가 약 230만 점을 넘지 않게 (태블릿 레티나에서 4배로 그리던 걸 막아요)
  dpr(){
    const raw = Math.min(this.dprCap, window.devicePixelRatio || 1), area = Math.max(1, innerWidth*innerHeight);
    return Math.max(1, Math.min(raw, Math.sqrt(2.3e6/area)));
  },
  watch(on){
    cancelAnimationFrame(this.raf); if (!on) return;
    let last = 0, n = 0, sum = 0;
    const tick = now => {
      if (last){ const dt = now - last; if (dt < 250){ sum += dt; n++; } }   // 탭 전환 같은 긴 멈춤은 빼요
      last = now;
      if (n >= 90){                                       // 약 1.5초마다 평균 장면 시간 확인
        const avg = sum/n; n = 0; sum = 0;
        this.slowSec = avg > 24 ? this.slowSec + 1 : 0;   // 초당 42장보다 느리면 '버벅임'
        if (this.slowSec >= 2) this.down();
      }
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  },
  down(){
    this.slowSec = 0;
    if (!this.lite){ this.lite = true; document.body.classList.add("arc-lite"); }
    // (2026.11.13) 예전엔 해상도를 1배까지 내려서 태블릿에서 화면이 흐려졌어요 → 1.5배까지만 내려요
    // 해상도는 게임 중에 바꾸지 않아요(바꾸는 순간 멈칫하고 흐려져요) — 다음 게임부터 적용돼요
    else if (this.dprCap > 1.5 && (window.devicePixelRatio || 1) > 1.5){ this.dprCap = 1.5; }
    else return;
    try { localStorage.setItem(KEY_PERF, JSON.stringify({lite: this.lite, cap: this.dprCap})); } catch(e) {}
  }
};
const KEY_PERF = "arcade.v2.perf";   // v1(해상도 1배로 흐려진 기기 기억)은 버리고 새로 재요
try { const p = JSON.parse(localStorage.getItem(KEY_PERF)); if (p){ PERF.lite = !!p.lite; PERF.dprCap = Math.max(1.5, p.cap || 2); } } catch(e) {}
const ARCDPR = () => PERF.dpr();
(function(){
  const P = CanvasRenderingContext2D.prototype;
  // 반짝이(그림자 번짐)는 캔버스에서 가장 비싼 효과라, 느린 기기에서는 꺼요
  const sb = Object.getOwnPropertyDescriptor(P, "shadowBlur");
  if (sb && sb.set) Object.defineProperty(P, "shadowBlur", {configurable: true, get(){ return sb.get.call(this); }, set(v){ sb.set.call(this, PERF.lite ? 0 : v); }});
  // 이모지만 있는 글자(캐릭터 얼굴 등)는 한 번 그린 그림을 기억해 두고 붙여요 — 컬러 이모지 글자 그리기가 아주 느려요
  const fill = P.fillText, EMO = /^(?:\p{Extended_Pictographic}|\p{Emoji_Component}|‍|️|\s)+$/u, cache = new Map();
  P.fillText = function(text, x, y, maxW){
    const t = String(text);
    if (maxW !== undefined || t.length > 12 || !EMO.test(t) || /^[\d#*\s]+$/.test(t)) return fill.apply(this, arguments);
    const m = /(\d+(?:\.\d+)?)px/.exec(this.font), fs = m ? +m[1] : 0;
    if (!fs || fs > 400) return fill.apply(this, arguments);
    const tr = this.getTransform(), k0 = Math.hypot(tr.a, tr.b) || 1, flat = !tr.b && !tr.c;
    // 돌리지 않은 그림은 화면 배율 그대로 기억해서 1:1로 붙여요(늘이기 없음 → 늘 선명), 돌린 그림만 몇 단계로 나눠 기억해요
    const k = flat ? Math.round(k0*100)/100 : Math.pow(1.25, Math.ceil(Math.log(k0)/Math.log(1.25)));
    const col = typeof this.fillStyle === "string" ? this.fillStyle : "#000";
    const key = `${t}|${this.font}|${this.textAlign}|${this.textBaseline}|${this.direction}|${col}|${k.toFixed(3)}`;
    let c = cache.get(key);
    if (!c){
      if (cache.size > 400) cache.clear();
      const pad = Math.ceil(fs*1.6), side = pad*2;
      c = document.createElement("canvas"); c.width = c.height = Math.max(1, Math.ceil(side*k));
      const g = c.getContext("2d"); g.scale(k, k);
      g.font = this.font; g.textAlign = this.textAlign; g.textBaseline = this.textBaseline; g.direction = this.direction; g.fillStyle = col;
      fill.call(g, t, pad, pad);
      c.pad = pad; c.side = c.width/k; cache.set(key, c);
    }
    if (flat){
      // ⚡ 화면 점(픽셀)에 딱 맞춰 붙여요 — 반 칸씩 어긋나 움직이면 그림이 뚜렷했다 흐려졌다 해요
      const sx = tr.a < 0 ? -1 : 1, sy = tr.d < 0 ? -1 : 1, ax = Math.abs(tr.a), ay = Math.abs(tr.d);
      const dx = Math.round(tr.a*(x - c.pad) + tr.e), dy = Math.round(tr.d*(y - c.pad) + tr.f);
      this.save(); this.setTransform(sx, 0, 0, sy, 0, 0);
      this.drawImage(c, sx*dx - (sx < 0 ? c.width : 0), sy*dy - (sy < 0 ? c.height : 0), c.width*ax/k, c.height*ay/k);
      this.restore(); return;
    }
    this.drawImage(c, x - c.pad, y - c.pad, c.side, c.side);
  };
})();
/* 게임 화면을 꽉 차게: 브라우저 주소창·탭까지 숨겨요(크롬북·안드로이드·아이패드) */
const FULL = {
  on(){
    const d = document.documentElement, f = d.requestFullscreen || d.webkitRequestFullscreen;
    if (!f || document.fullscreenElement || document.webkitFullscreenElement) return;
    try { const r = f.call(d, {navigationUI: "hide"}); if (r && r.catch) r.catch(() => {}); } catch(e) {}
    try { screen.orientation && screen.orientation.lock && screen.orientation.lock("landscape").catch(() => {}); } catch(e) {}
  },
  off(){
    const x = document.exitFullscreen || document.webkitExitFullscreen;
    if (x && (document.fullscreenElement || document.webkitFullscreenElement)){ try { const r = x.call(document); if (r && r.catch) r.catch(() => {}); } catch(e) {} }
  }
};
["fullscreenchange", "webkitfullscreenchange"].forEach(t => document.addEventListener(t, () => setTimeout(() => window.dispatchEvent(new Event("resize")), 60)));

let ac = null;
function getAC(){ ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended") ac.resume(); return ac; }
/* 🔇 음소거: 모든 소리(효과음·리듬 게임 노래)가 이 큰 볼륨 손잡이를 지나가요. 기기마다 기억해요. */
const SND = {
  on: (() => { try { return localStorage.getItem("arcade.snd") !== "0"; } catch(e){ return true; } })(),
  out: null,
  set(v){ this.on = !!v; try { localStorage.setItem("arcade.snd", v ? "1" : "0"); } catch(e){}
    if (this.out) this.out.gain.value = v ? 1 : 0; this.paint(); },
  toggle(){ this.set(!this.on); toast(this.on ? "🔊 소리를 켰어요" : "🔇 소리를 껐어요"); },
  paint(){ document.querySelectorAll(".snd-btn").forEach(b => { b.classList.toggle("off", !this.on); const i = b.querySelector(".ic"); if (i) i.textContent = this.on ? "🔊" : "🔇";
    const l = b.querySelector(".lb"); if (l) l.textContent = this.on ? " 소리 켜짐" : " 소리 꺼짐"; b.title = this.on ? "소리 끄기" : "소리 켜기"; }); }
};
document.addEventListener("click", e => { if (e.target.closest(".snd-btn")){ e.stopPropagation(); SND.toggle(); } }, true);
setTimeout(() => SND.paint(), 0);
/* 💾 저장이 끝나기 전에 창을 닫으려 하면 한 번 물어봐요(산 아바타·코인이 사라지지 않게) */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const waitOnline = () => navigator.onLine === false ? new Promise(r => { const f = () => { window.removeEventListener("online", f); r(); }; window.addEventListener("online", f); setTimeout(f, 20000); }) : Promise.resolve();
window.addEventListener("beforeunload", e => { if (typeof Store !== "undefined" && Store.saving && Store.saving()){ e.preventDefault(); e.returnValue = "저장 중이에요"; return "저장 중이에요"; } });
function OUT(a){ if (!SND.out || SND.out.context !== a){ SND.out = a.createGain(); SND.out.gain.value = SND.on ? 1 : 0; SND.out.connect(a.destination); } return SND.out; }

/* ---- 손들고 말해요 게임들이 쓰는 것들 (사진 대신 캐릭터 얼굴) ---- */
const KEY = "arcade.v1";
const S = {students: [], vb: {}, fly: {rec: {}}, train: {rec: {}}, memo: {}, sound: true, className: ""};
try { S.vb = JSON.parse(localStorage.getItem(KEY + ".vb")) || {}; } catch(e) {}
function save(){ try { localStorage.setItem(KEY + ".vb", JSON.stringify(S.vb || {})); } catch(e) {} }
const sidOf = no => "n" + no;
const noOf_ = sid => +String(sid).slice(1);
const TEACHER = 0;   // 🧑‍🏫 선생님도 같이 하는 자리 (번호 0 · 비밀번호는 선생님 비밀번호)
const faceOf = sid => (Store.cls && Store.cls.faces && Store.cls.faces[noOf_(sid)]) || (noOf_(sid) === TEACHER ? "🧑‍🏫" : "🙂");
/* 게임·랭킹·대결에 나오는 사람: 학생 명단 + 선생님 */
const roster = () => { const r = (Store.cls && Store.cls.roster) || []; return Store.cls && Store.cls.noTeacher ? r : r.concat([{no: TEACHER, name: "선생님", t: 1}]); };
const photoOf = sid => (typeof avPhoto === "function" ? avPhoto(sid) : "");

const FACES = ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐤","🦄","🐲","🐙","🦖","🐳","🐬","🦋","🐞","🐝","🦉","🐢","🦈",
               "😀","😎","🤓","🤠","🥳","😺","👻","👽","🤖","🎃","🌞","⭐","🍀","🍓","🍩","⚽","🎸","🚀"];

/* ---- SHA-256 (비밀번호는 그대로 저장하지 않고 바꿔서 저장해요) ---- */
function sha256(str){
  const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const bytes = new TextEncoder().encode(str), l = bytes.length, n = ((l + 9 + 63) >> 6) << 6, m = new Uint8Array(n);
  m.set(bytes); m[l] = 0x80; const dv = new DataView(m.buffer); dv.setUint32(n - 4, l*8); dv.setUint32(n - 8, Math.floor(l/0x20000000));
  let H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]; const w = new Uint32Array(64);
  const r = (x, k) => (x >>> k) | (x << (32 - k));
  for (let o = 0; o < n; o += 64){
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i*4);
    for (let i = 16; i < 64; i++){ const s0 = r(w[i-15], 7) ^ r(w[i-15], 18) ^ (w[i-15] >>> 3), s1 = r(w[i-2], 17) ^ r(w[i-2], 19) ^ (w[i-2] >>> 10); w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0; }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++){ const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0, t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0; h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0; }
    H = H.map((v, i) => (v + [a, b, c, d, e, f, g, h][i]) | 0);
  }
  return H.map(v => (v >>> 0).toString(16).padStart(8, "0")).join("");
}
const pwHash = (no, pw) => sha256(`${Store.cls.cid}:${no}:${pw}`);
const rid = n => Array.from(crypto.getRandomValues(new Uint8Array(n)), b => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32]).join("");
const pin4 = () => String(1000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 9000));
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const b64e = o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64d = s => JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/")))));

/* =====================================================================
   저장소: 이 기기(localStorage) 또는 Firebase(반 전체가 함께)
   ===================================================================== */
const FBV = "10.12.2";
/* 🪙 하루 코인 한도: 기본은 무제한 (선생님이 🛠️ 관리자 → 🪙 코인에서 400·800·1500개로 정할 수 있어요)
   🔥 열정 보너스: 오늘 많이 할수록 한 판 코인이 늘어요 (5판째부터 ×1.2 · 10판 ×1.5 · 20판 ×2 · 40판 ×2.5) */
const DAY_CAP = 0;
const HEAT = [[40, 2.5], [20, 2], [10, 1.5], [5, 1.2], [0, 1]];
const heatOf = n => HEAT.find(h => n >= h[0])[1];
const heatNext = n => { const L = HEAT.slice().reverse().find(h => h[0] > n); return L ? L : null; };
const Store = {
  mode: "none", cls: null, recs: {}, kids: {}, ok: true, err: "", subs: [], fb: null,
  // 친구 22명의 기록이 한꺼번에 들어와도 화면은 0.25초에 한 번만 다시 그려요
  emit(){ if (this._et) return; this._et = setTimeout(() => { this._et = 0; this.subs.forEach(f => { try { f(); } catch(e) { console.error(e); } }); }, 250); },
  local(){ try { return JSON.parse(localStorage.getItem(KEY + ".local")) || null; } catch(e) { return null; } },
  saveLocal(){ if (this.mode !== "local") return; try { localStorage.setItem(KEY + ".local", JSON.stringify({cls: this.cls, recs: this.recs, kids: this.kids})); } catch(e) { toast("이 기기에 저장할 자리가 부족해요"); } },
  join(){ try { return JSON.parse(localStorage.getItem(KEY + ".join")) || null; } catch(e) { return null; } },

  async init(){
    const j = this.join();
    if (j && j.c && j.i) return this.connect(j.c, j.i);
    const L = this.local();
    if (L && L.cls){ this.mode = "local"; this.cls = L.cls; this.recs = L.recs || {}; this.kids = L.kids || {}; return true; }
    this.mode = "none"; return false;
  },
  async lib(){
    if (this.fb) return this.fb;
    if (window.__FAKEFB) return this.fb = window.__FAKEFB;   // (시험용) 진짜 Firebase 대신
    const b = `https://www.gstatic.com/firebasejs/${FBV}/`;
    const [app, auth, fs] = await Promise.all([import(b + "firebase-app.js"), import(b + "firebase-auth.js"), import(b + "firebase-firestore.js")]);
    return this.fb = {app, auth, fs};
  },
  async connect(cfg, cid, create){
    const slow = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error("연결이 너무 오래 걸려요"), {code: "arc-slow"})), ms))]);
    const {app, auth, fs} = await slow(this.lib(), 20000);
    const name = "arc-" + cid, a = app.getApps().find(x => x.name === name) || app.initializeApp(cfg, name);
    /* ⏳ (2026.11.23) 화면 멈춤 막기: 다른 탭(백그라운드에서 잠든 보드게임 탭)이 기기 저장소를 붙잡고 있으면
       Firebase가 대답 없이 기다려서 빈 화면으로 멈출 수 있어요 → 10초 안에 반 정보가 안 오면 '기기 저장소 없이' 다시 열어요 */
    await slow(auth.signInAnonymously(auth.getAuth(a)), 12000);
    /* ⚡ 기기 안 저장소(IndexedDB)에 반 정보를 기억해 둬요 → 새로고침해도 바로 뜨고,
       30명이 동시에 들어와도 바뀐 것만 받아서 Firebase 사용량·버퍼링이 확 줄어요 */
    let db;
    const noCache = +localStorage.getItem(KEY + ".nocache") > Date.now();
    if (noCache) db = fs.getFirestore(a);
    else try { db = fs.initializeFirestore(a, fs.persistentLocalCache ? {localCache: fs.persistentLocalCache({tabManager: fs.persistentMultipleTabManager()})} : {}); }
    catch(e){ db = fs.getFirestore(a); }
    this.db = db; this.fs = fs; this.cid = cid;
    this.refCls = fs.doc(db, "arcade", cid);
    if (create){ await fs.setDoc(this.refCls, create); }
    const first = await slow(fs.getDoc(this.refCls), 10000);
    if (!first.exists()) throw new Error("반 정보를 찾지 못했어요. 반 입장 주소를 다시 확인해 주세요.");
    this.mode = "cloud"; this.cls = first.data();
    localStorage.setItem(KEY + ".join", JSON.stringify({c: cfg, i: cid}));
    fs.onSnapshot(this.refCls, s => { if (s.exists()){ this.cls = s.data(); this.ok = true; this.emit(); } }, e => { this.ok = false; this.err = e.message; this.emit(); });
    fs.onSnapshot(fs.collection(db, "arcade", cid, "kids"), qs => { const k = {}; qs.forEach(d => k[d.id] = d.data()); this._raw = JSON.parse(JSON.stringify(k)); this.kids = this.withPending(k); this.ok = true; this.emit(); if (!this._rp){ this._rp = 1; setTimeout(() => this.replayBackup(), 4000); } }, e => { this.ok = false; this.err = e.message; this.emit(); });
    fs.onSnapshot(fs.collection(db, "arcade", cid, "recs"), qs => { const r = {}; qs.forEach(d => r[d.id] = d.data()); this.recs = r; this.ok = true; this.emit(); }, e => { this.ok = false; this.err = e.message; this.emit(); });
    return true;
  },
  /* 반 정보 통째로 (선생님) */
  async putClass(cls){
    this.cls = cls; this.emit();
    if (this.mode === "local") return this.saveLocal();
    await this.fs.setDoc(this.refCls, cls);
  },
  /* 반 정보 일부만 (관리자: 채팅·공지·게임 끄기 등) — 다른 칸은 안 건드려요 */
  async patch(o){
    const mg = (a, b) => { for (const k in b){ if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k])){ a[k] = mg(a[k] && typeof a[k] === "object" ? Object.assign({}, a[k]) : {}, b[k]); } else a[k] = b[k]; } return a; };
    this.cls = mg(Object.assign({}, this.cls), o); this.emit();
    if (this.mode === "local") return this.saveLocal();
    await this.fs.setDoc(this.refCls, o, {merge: true});
  },
  /* 캐릭터 얼굴만 (여러 아이가 동시에 바꿔도 서로 안 지워지게) */
  async putFace(no, face){
    this.cls.faces = this.cls.faces || {}; this.cls.faces[no] = face; this.emit();
    if (this.mode === "local") return this.saveLocal();
    await this.fs.setDoc(this.refCls, {faces: {[no]: face}}, {merge: true});
  },
  /* 점수 게임 기록 (최고 기록은 더 큰 쪽을 남겨요) */
  async putScore(game, sid, rec){
    const merge = (cur, nw) => {
      if (!cur) return nw;
      const o = Object.assign({}, cur, nw);
      if ((cur.best || 0) > (nw.best || 0)){ o.best = cur.best; o.bestAt = cur.bestAt; }
      o.plays = Math.max(cur.plays || 0, nw.plays || 0);
      if (cur.day === nw.day && (cur.dayBest || 0) > (nw.dayBest || 0)){ o.dayBest = cur.dayBest; o.dayAt = cur.dayAt; }
      return o;
    };
    this.recs[game] = this.recs[game] || {};
    this.recs[game][sid] = merge(this.recs[game][sid], rec); this.emit();
    if (this.mode === "local") return this.saveLocal();
    // (렉 줄이기) 예전엔 '읽고-고치고-쓰기' 묶음(transaction)이라 22명이 같은 게임 기록을 동시에 올리면 서로 기다리다 실패했어요.
    // 내 칸(sid)만 합쳐 쓰면 다른 친구 칸은 안 건드려서 기다릴 일이 없어요. 최고 기록 비교는 실시간으로 받은 값으로 해요.
    const fs = this.fs, ref = fs.doc(this.db, "arcade", this.cid, "recs", game);
    try { await fs.setDoc(ref, {[sid]: this.recs[game][sid]}, {merge: true}); }
    catch(e){ toast("⚠️ 기록을 올리지 못했어요. 인터넷을 확인해 주세요."); console.error(e); }
  },
  /* 대결 결과: 이긴 친구 +1승, 진 친구 +1패 */
  async putDuel(game, w, l){
    const R = this.recs[game] = this.recs[game] || {}, now = Date.now();
    R[w] = Object.assign({w: 0, l: 0}, R[w]); R[w].w++; R[w].at = now;
    R[l] = Object.assign({w: 0, l: 0}, R[l]); R[l].l++; R[l].at = now;
    this.emit();
    if (this.mode === "local") return this.saveLocal();
    const fs = this.fs, inc = fs.increment(1);
    try { await fs.setDoc(fs.doc(this.db, "arcade", this.cid, "recs", game), {[w]: {w: inc, at: now}, [l]: {l: inc, at: now}}, {merge: true}); }
    catch(e){ toast("⚠️ 승리 기록을 올리지 못했어요. 인터넷을 확인해 주세요."); console.error(e); }
  },
  async resetGame(game){
    delete this.recs[game]; this.emit();
    if (this.mode === "local") return this.saveLocal();
    await this.fs.deleteDoc(this.fs.doc(this.db, "arcade", this.cid, "recs", game));
  },
  /* ---------- 🪙 학생 지갑: 코인 · 산 아이템 · 입은 아바타 (랭킹과 따로 저장 → 랭킹을 지우거나 앱을 고쳐도 그대로) ---------- */
  kidRef(sid){ return this.fs.doc(this.db, "arcade", this.cid, "kids", sid); },
  async kidTx(sid, fn){   // fn(지갑) → 바꾼 지갑 (못 하면 throw)
    const cur = Object.assign({coins: 0, total: 0, owned: {}}, JSON.parse(JSON.stringify(this.kids[sid] || {})));
    const nw = fn(cur); this.kids[sid] = nw; this.emit();
    if (this.mode === "local") return this.saveLocal();
    /* ⚡ 화면은 바로 바뀌고(위에서 이미 바꿨어요), 서버 저장은 뒤에서 차례대로 해요.
       예전엔 서버 저장(1~2초)을 기다린 뒤에야 단추가 반응했어요. 코인이 모자라면 위의 fn에서 바로 막혀요.
       서버에 저장하다 실패하면(인터넷·다른 기기와 겹침) 알려 주고 서버 값으로 되돌려요. */
    const fs = this.fs, ref = this.kidRef(sid), P = this._pend = this._pend || {}, job = {fn};
    (P[sid] = P[sid] || []).push(job);        // 저장이 끝나기 전에 서버 소식이 와도 산 것이 사라져 보이지 않게(아래 withPending)
    const done = () => { P[sid] = (P[sid] || []).filter(j => j !== job); if (!P[sid].length) delete P[sid]; this.paintSaving(); this.rebase(sid); };
    this.paintSaving();
    /* 🔁 절대 잃어버리지 않게: 인터넷이 끊기거나 다른 기기와 겹쳐도 포기하지 않고 다시 해요
       (끊겼으면 인터넷이 돌아올 때까지 기다렸다가 · 1→2→4→8…초 간격으로 최대 12번). 코인이 모자라는 것처럼 '규칙' 때문에 막힌 것만 바로 멈춰요 */
    const rule = e => e && !e.code && e.message && /[가-힣]/.test(e.message);   // fn 안에서 던진 한국어 오류 = 규칙(코인 부족 등)
    const attempt = () => fs.runTransaction(this.db, async t => { const d = await t.get(ref); const base = Object.assign({coins: 0, total: 0, owned: {}}, d.exists() ? d.data() : {}); t.set(ref, fn(JSON.parse(JSON.stringify(base)))); });
    const run = async () => { for (let k = 0; ; k++){
        try { await waitOnline(); await attempt(); return; }
        catch(e){ if (rule(e) || k >= 11){ throw e; } console.warn("💾 다시 저장해요", k + 1, e && e.code); if (k === 2) toast("💾 인터넷이 느려요… 저장을 다시 하고 있어요"); await sleep(Math.min(30000, 1000*2**k)); } } };
    const p = this._txq = (this._txq || Promise.resolve()).catch(() => {}).then(run)
      .then(done)
      .catch(async e => { console.error(e); done(); toast(rule(e) ? "⚠️ " + e.message : "⚠️ 저장하지 못했어요: " + (e.message || "인터넷을 확인해 주세요"));
        try { const d = await fs.getDoc(ref); this.kids[sid] = this.withPending({[sid]: d.exists() ? d.data() : {}})[sid]; this.emit(); } catch(_){} });
    p.catch(() => {});
  },
  /* 서버 소식(onSnapshot)이 와도 아직 저장 중인 내 변경은 그 위에 다시 얹어요 → 산 아바타·코인이 잠깐이라도 '초기화'돼 보이지 않게 */
  withPending(k){
    const P = this._pend || {};
    for (const sid in P){ let w = Object.assign({coins: 0, total: 0, owned: {}}, JSON.parse(JSON.stringify(k[sid] || {})));
      for (const j of P[sid]){ try { w = j.fn(w) || w; } catch(_){} } k[sid] = w; }
    return k;
  },
  saving(){ return Object.keys(this._pend || {}).length > 0 || (this._wn || 0) > 0; },
  /* 저장이 끝나면 마지막 서버 값 위에 '아직 남은' 변경만 다시 얹어요
     (서버 소식이 저장 완료보다 먼저 오면 같은 코인이 두 번 더해져 보이던 것 고침) */
  rebase(sid){ const R = this._raw; if (!R || !(sid in R)) return; this.kids[sid] = this.withPending({[sid]: JSON.parse(JSON.stringify(R[sid]))})[sid]; this.emit(); },
  async flush(){ try { await this._txq; } catch(_){} try { if (this.fs && this.fs.waitForPendingWrites && this.db) await Promise.race([this.fs.waitForPendingWrites(this.db), sleep(8000)]); } catch(_){} },
  paintSaving(){ const s = this.saving(); document.body && document.body.classList.toggle("arc-saving", s); },
  /* 🪙 코인 규칙: 하루 한도(0 = 무제한) · 이벤트 배율(×1~×3) */
  coinRule(){ const c = (this.cls || {}).coin || {}; return {cap: c.cap === undefined ? DAY_CAP : Math.max(0, +c.cap || 0), boost: Math.max(1, Math.min(3, +c.boost || 1))}; },
  dayOf(sid, w){ w = w || this.kids[sid] || {}; const td = today(), same = w.day === td; return {n: same ? (w.dayN || 0) : 0, c: same ? (w.dayCoins || 0) : 0}; },
  /* 이번 판에 실제로 받을 코인 (🔥 열정 보너스 × 🎉 이벤트, 한도가 있으면 한도까지) */
  coinCalc(sid, n, w){
    const d = this.dayOf(sid, w), R = this.coinRule();
    let g = Math.round(Math.max(0, n)*heatOf(d.n)*R.boost);
    if (R.cap > 0) g = Math.max(0, Math.min(g, R.cap - d.c));
    return g;
  },
  /* 코인 받기 — 바로 받을 수 있는 수를 돌려줘요 */
  /* 🪙 코인 받기 — 절대 안 사라지게 (2026.11.19)
     예전엔 '읽고-계산하고-쓰기' 묶음(transaction)이라 인터넷이 잠깐 끊기거나 판이 끝나자마자 앱을 닫으면 코인이 사라졌어요.
     이제는 '+N 더하기'(increment)로 써요 → Firebase가 기기 저장소(IndexedDB)에 먼저 적어 두고, 인터넷이 돌아오면(앱을 다시 켜도) 꼭 올려요.
     같은 판을 두 번 더하지 않게 판마다 번호(key)를 붙여 한 번만 줘요. */
  earn(sid, n, key){
    n = Math.max(0, Math.round(n)); if (!n) return 0;
    const td = today(), w0 = Object.assign({coins: 0, total: 0, owned: {}}, this.kids[sid] || {}), d = this.dayOf(sid, w0), g = this.coinCalc(sid, n, w0);
    key = key || (sid + ":" + Date.now() + ":" + Math.random().toString(36).slice(2, 7));
    this._earned = this._earned || new Set(); if (this._earned.has(key)) return 0; this._earned.add(key);
    const same = w0.day === td;
    this.kids[sid] = Object.assign(w0, {coins: (w0.coins || 0) + g, total: (w0.total || 0) + g, day: td, dayCoins: d.c + g, dayN: d.n + 1}); this.emit();
    if (this.mode === "local"){ this.saveLocal(); return g; }
    const fs = this.fs, inc = fs.increment;
    const upd = {coins: inc(g), total: inc(g), day: td, dayCoins: same ? inc(g) : g, dayN: same ? inc(1) : 1, lastEarn: Date.now()};
    this.kidWrite(sid, upd, g);
    return g;
  },
  /* 지갑에 '더하기' 쓰기: 실패해도 포기하지 않고 다시 (인터넷이 끊겨도 기기에 먼저 저장돼요) */
  kidWrite(sid, upd, g){
    const fs = this.fs, ref = this.kidRef(sid); this._wn = (this._wn || 0) + 1; this.paintSaving();
    let ok = false;
    const go = async () => { for (let k = 0; ; k++){
        try { await fs.setDoc(ref, upd, {merge: true}); ok = true; break; }
        catch(e){ console.warn("🪙 코인 저장 다시", k + 1, e && e.code); if (k >= 15){ toast("⚠️ 코인 저장이 늦어지고 있어요 · 앱을 켜 두면 다시 올려요"); this.backup(sid, g); break; } await sleep(Math.min(30000, 1000*2**k)); await waitOnline(); } }
      this._wn--; this.paintSaving(); return ok; };
    return go(); },
  /* 정말 마지막 안전장치: 계속 실패하면 기기에 적어 두었다가 다음에 켤 때 올려요 */
  backup(sid, g){ if (!(g > 0)) return; try { const k = "arcade.coinBackup." + this.cid, L = JSON.parse(localStorage.getItem(k) || "[]");
    L.push({sid, g, at: Date.now()}); localStorage.setItem(k, JSON.stringify(L.slice(-50))); } catch(_){} },
  replayBackup(){ if (this.mode === "local" || !this.cid) return; try { const k = "arcade.coinBackup." + this.cid, L = JSON.parse(localStorage.getItem(k) || "[]"); if (!L.length) return;
    localStorage.removeItem(k); const inc = this.fs.increment; L.forEach(x => { if (x.g > 0) this.kidWrite(x.sid, {coins: inc(x.g), total: inc(x.g)}, x.g); }); toast(`💾 저장 못 했던 코인 ${L.length}건을 올렸어요`); } catch(_){} },
  todayLeft(sid){ const R = this.coinRule(); return R.cap > 0 ? R.cap - this.dayOf(sid).c : Infinity; },
  /* 🎁 선생님 상: 코인 + 칭호·아바타 상을 한꺼번에 (선물함에 기록이 남아요) */
  /* 🪙 선생님이 주는 코인·상은 '+N 더하기'로 바로 써요 (2026.11.19)
     예전엔 '읽고-계산하고-쓰기' 묶음(transaction)이라, 아이가 게임하며 코인을 받는 순간과 겹치면 계속 실패하다가
     몇 분 뒤 포기해서 코인이 안 들어갔어요. 이제는 겹쳐도 서로 더해지고, 인터넷이 끊겨도 기기에 먼저 적어 두었다가 꼭 올려요.
     돌려주는 약속(Promise): 서버에 저장되면 true */
  award(sid, o){
    const n = Math.max(0, Math.round(+o.coins || 0)), now = CLOCK.now(), items = o.items || [];
    const g = {at: now, coins: n, items, why: String(o.why || "").slice(0, 40), r: Math.random().toString(36).slice(2, 7)};
    const w = Object.assign({coins: 0, total: 0, owned: {}}, this.kids[sid] || {});
    w.coins = (w.coins || 0) + n; w.total = (w.total || 0) + n; w.owned = Object.assign({}, w.owned); items.forEach(k => w.owned[k] = w.owned[k] || now);
    w.gifts = (Array.isArray(w.gifts) ? w.gifts : []).concat(g); this.kids[sid] = w; this.emit();
    if (this.mode === "local"){ this.saveLocal(); return Promise.resolve(true); }
    const inc = this.fs.increment, upd = {gifts: this.fs.arrayUnion(g)};
    if (n){ upd.coins = inc(n); upd.total = inc(n); }
    if (items.length){ upd.owned = {}; items.forEach(k => upd.owned[k] = now); }
    return this.kidWrite(sid, upd, n);
  },
  /* 아이템 사기: 코인이 모자라면 안 사져요 */
  async buy(sid, keys, cost, av){
    await this.kidTx(sid, w => { if ((w.coins || 0) < cost) throw new Error("코인이 모자라요");
      w.coins -= cost; w.owned = Object.assign({}, w.owned); keys.forEach(k => w.owned[k] = Date.now()); if (av) w.av = JSON.parse(JSON.stringify(av)); return w; });
  },
  /* 👕 아바타처럼 '내 것만 바꾸는 칸'은 트랜잭션 없이 바로 써요 (2026.11.19)
     → 인터넷이 잠깐 끊겨도 기기 안(IndexedDB)에 먼저 저장되고, 다시 연결되면 Firebase가 알아서 올려요(앱을 다시 켜도).
        예전엔 '읽고-쓰기' 묶음(트랜잭션)이라 학교 와이파이가 잠깐 끊기면 '저장하지 못했어요' + 되돌리기로 아바타가 사라졌어요.
     fields = {av: {...}} 처럼 칸 이름 → 값 (점 경로 'qd.look.kn' 도 돼요). 그 칸만 통째로 바꾸고 코인·산 물건은 건드리지 않아요.
     코인이 걸린 일(사기·강화)은 예전처럼 kidTx로 안전하게. */
  async putFields(sid, fields){
    fields = JSON.parse(JSON.stringify(fields, (k, v) => v === undefined ? null : v));
    const setPath = (w, path, v) => { const ks = path.split("."); let o = w; ks.slice(0, -1).forEach(k => { o[k] = Object.assign({}, o[k] || {}); o = o[k]; }); o[ks[ks.length - 1]] = v; return w; };
    const fn = w => { for (const k in fields) setPath(w, k, fields[k]); return w; };
    const cur = Object.assign({coins: 0, total: 0, owned: {}}, JSON.parse(JSON.stringify(this.kids[sid] || {})));
    this.kids[sid] = fn(cur); this.emit();
    if (this.mode === "local") return this.saveLocal();
    const fs = this.fs, ref = this.kidRef(sid), P = this._pend = this._pend || {}, job = {fn};
    (P[sid] = P[sid] || []).push(job); this.paintSaving();
    const done = () => { P[sid] = (P[sid] || []).filter(j => j !== job); if (!P[sid].length) delete P[sid]; this.paintSaving(); this.rebase(sid); };
    const doc = {}; for (const k in fields) setPath(doc, k, fields[k]);
    const go = async () => { for (let k = 0; ; k++){
        try { await fs.setDoc(ref, doc, {mergeFields: Object.keys(fields)}); return; }
        catch(e){ if (k >= 11 || /permission|invalid-argument/.test(String(e && e.code))) throw e; console.warn("👕 다시 저장해요", k + 1, e && e.code); await sleep(Math.min(30000, 1000*2**k)); await waitOnline(); } } };
    const w = go();
    w.then(done).catch(async e => { console.error(e); done(); toast("⚠️ 저장하지 못했어요: " + (e.message || "인터넷을 확인해 주세요"));
      try { const d = await fs.getDoc(ref); this.kids[sid] = this.withPending({[sid]: d.exists() ? d.data() : {}})[sid]; this.emit(); } catch(_){} });
    // 기기 안 저장은 바로 끝나요 → 서버 확인까지 기다리지 않고 돌아가요(오프라인이어도 화면이 멈추지 않게)
    return Promise.race([w.catch(() => {}), sleep(1200)]);
  },
  async putAv(sid, av){ return this.putFields(sid, {av}); },
  /* 선생님이 코인 주기·빼기 */
  give(sid, n){
    n = Math.round(+n || 0); const w = Object.assign({coins: 0, total: 0, owned: {}}, this.kids[sid] || {});
    if (n < 0) n = -Math.min(-n, w.coins || 0);          // 가진 것보다 많이 빼지는 않아요
    if (!n) return Promise.resolve(true);
    w.coins = (w.coins || 0) + n; if (n > 0) w.total = (w.total || 0) + n; this.kids[sid] = w; this.emit();
    if (this.mode === "local"){ this.saveLocal(); return Promise.resolve(true); }
    const inc = this.fs.increment, upd = {coins: inc(n)}; if (n > 0) upd.total = inc(n);
    return this.kidWrite(sid, upd, Math.max(0, n));
  },
  /* 이 기기 기록 → Firebase 로 옮기기 */
  async toCloud(cfg){
    const cls = Object.assign({}, this.cls), recs = this.recs; this.localKids = this.kids;
    await this.connect(cfg, cls.cid, cls);
    const fs = this.fs;
    for (const g in recs) await fs.setDoc(fs.doc(this.db, "arcade", cls.cid, "recs", g), recs[g]);
    const kids = this.localKids || {}; for (const s in kids) await fs.setDoc(fs.doc(this.db, "arcade", cls.cid, "kids", s), kids[s]);
    localStorage.removeItem(KEY + ".local");
  }
};
function parseCfg(t){
  const o = {}; let m; const re = /(\w+)\s*:\s*["'`]([^"'`]+)["'`]/g;
  while ((m = re.exec(t))) o[m[1]] = m[2];
  try { const j = JSON.parse(t); if (j && j.apiKey) return j; } catch(e) {}
  return o.apiKey && o.projectId ? o : null;
}

/* =====================================================================
   게임 목록
   ===================================================================== */
const GAMES = [
  {id: "rd", e: "🐾", n: "동물 랜덤 디펜스", kind: "score", tag: "⭐ 대표 게임 · 🤝 최대 6명 협동", d: "동물을 뽑고 3마리 합쳐 더 세게! 1000단계 · 차원 보스 · 친구와 함께 지켜요"},
  {id: "qd", e: "👹", n: "불가능한 보스 잡기", kind: "score", tag: "⭐ 대표 게임 · 👑 보스 100단계", d: "빨간 경고를 피해 무시무시한 보스 100단계에 도전! 🛒 장비·🐾펫·🎨 꾸미기 · 많이 이기면 ✨오로라"},
  {id: "fl", e: "🐤", n: "얼굴 날기",   kind: "score", d: "연필 사이를 날아요 · 아이템과 맵 6단계"},
  {id: "tr", e: "🚂", n: "얼굴 기차",   kind: "score", d: "친구들을 태워 기차를 길게!"},
  {id: "st", e: "🪜", n: "얼굴 계단",   kind: "score", d: "방향을 바꿔 가며 끝없이 올라가요"},
  {id: "wm", e: "🔨", n: "두더지 잡기", kind: "score", d: "40초 동안 튀어나오는 친구를 콩!"},
  {id: "bk", e: "🧱", n: "벽돌깨기",    kind: "score", d: "내 얼굴 공으로 벽돌을 와장창"},
  {id: "rn", e: "🏃", n: "점프 달리기", kind: "score", d: "맵 7곳 · 아이템 7개! 톡 눌러 점프"},
  {id: "tw", e: "🔢", n: "2048",        kind: "score", d: "밀어서 같은 숫자를 합쳐요"},
  {id: "cp", e: "🎨", n: "색칠 스피드", kind: "score", d: "숫자에 맞는 색으로 쓱쓱! 빨리 완성해요"},
  {id: "rh", e: "🎵", n: "리듬 스타",   kind: "score", d: "오리지널 62곡에 맞춰 톡톡! 5줄 리듬게임 · Lv.1~15 · 내 노래도"},
  {id: "vb", e: "🏐", n: "얼굴 배구",   kind: "duel",  d: "둘이서 배구 대결"},
  {id: "ah", e: "🏒", n: "얼굴 에어하키", kind: "duel", d: "둘이서 하키 대결"},
  {id: "kf", e: "🔥", n: "우리반 격투왕", kind: "duel", tag: "🆕 격투 대결 · 🤖 컴퓨터와도", d: "캐릭터 6명! 펀치·킥·기술·필살기로 3판 2선승 · 연타 콤보"},
  {id: "jj", e: "🥋", n: "주짓수 한판", kind: "duel", tag: "🆕 둘이서 · 🤖 컴퓨터와도", d: "넘기고·누르고·조르기! 기술이 걸리면 연타 대결 · 탭 받으면 승리"},
  {id: "pp", e: "🏓", n: "얼굴 탁구",   kind: "duel",  d: "둘이서 탁구 대결"},
  {id: "wb", e: "💦", n: "물풍선 대작전", kind: "duel", multi: 1, d: "미로에서 물풍선 펑! 최대 6명"},
  {id: "jg", e: "🀄", n: "장기",        kind: "duel",  tag: "🆕 둘이서 · 🤖 컴퓨터와도", d: "초와 한의 한판 승부! 장군 받고 외통수로 이겨요"},
  {id: "ch", e: "♟️", n: "체스",        kind: "duel",  tag: "🆕 둘이서 · 🤖 컴퓨터와도", d: "킹을 체크메이트! 캐슬링·앙파상까지 진짜 규칙"},
  {id: "om", e: "⚫", n: "오목",        kind: "duel",  tag: "🆕 둘이서 · 🤖 컴퓨터와도", d: "돌 다섯 개를 먼저 한 줄로! 두 번 톡톡 눌러 놓아요"},
  {id: "bl", e: "🎱", n: "당구",        kind: "duel",  tag: "🆕 둘이서 · 🤖 컴퓨터와도", d: "포켓볼 점수 대결! 넣으면 한 번 더 · ⭐9번 공은 3점"},
  {id: "bs", e: "🫧", n: "버블 특공대", kind: "score", d: "로봇을 거품에 가둬 날려 보내요"},
  {id: "sk", e: "🌥️", n: "하늘 무사단", kind: "score", tag: "🤝 최대 4명 · 협동 점수전", d: "구름 위 슈팅! 30단계 · 6가지 하늘 · 스킬 · 보스"},
  {id: "bp", e: "🧩", n: "블록 퍼즐",   kind: "score", d: "조각을 끌어 놓고 줄을 채우면 펑!"},
  {id: "fm", e: "🍑", n: "과일 합치기", kind: "score", d: "같은 과일끼리 합쳐 수박까지!"},
  {id: "jm", e: "💎", n: "보석 맞추기", kind: "score", d: "같은 보석 3개 한 줄로 · 90초"},
  {id: "ws", e: "🧪", n: "색깔 물 정렬", kind: "score", d: "병마다 한 색만 남게 옮겨 담아요"}
];
const GAME = Object.fromEntries(GAMES.map(g => [g.id, g]));
/* 점수 → 코인 (한 판 최대 50, 기본 2) */
const COIN_RATE = {rd: 1/400, qd: 1/600, rh: 1/22000, fl: 1, st: 1/3, tr: 2, wm: .8, bk: 1/40, rn: 1/6, tw: 1/80, bs: 1/250, sk: 1/1500, cp: 1/8, bp: 1/40, fm: 1/30, jm: 1/200, ws: 1/25};
const coinsFor = (gid, score) => Math.min(50, 2 + Math.floor((score || 0)*(COIN_RATE[gid] || 0)));
const WIN_COIN = 25, LOSE_COIN = 5, BEST_COIN = 10;

/* ---- 랭킹 계산 ---- */
function board(gid){
  const g = GAME[gid], R = Store.recs[gid] || {};
  const rows = roster().map(st => ({st, sid: sidOf(st.no), r: R[sidOf(st.no)]})).filter(x => x.r && (g.kind === "duel" ? (x.r.w || 0) + (x.r.l || 0) > 0 : (x.r.plays || 0) > 0 || (x.r.best || 0) > 0));
  if (g.kind === "duel") rows.sort((a, b) => (b.r.w || 0) - (a.r.w || 0) || (a.r.l || 0) - (b.r.l || 0) || (a.r.at || 0) - (b.r.at || 0));
  else rows.sort((a, b) => (b.r.best || 0) - (a.r.best || 0) || (a.r.bestAt || 0) - (b.r.bestAt || 0));
  let rank = 0, prev = null; rows.forEach((x, i) => { const v = g.kind === "duel" ? `${x.r.w || 0}/${x.r.l || 0}` : x.r.best || 0; if (v !== prev){ rank = i + 1; prev = v; } x.rank = rank; });
  return rows;
}
const valTxt = (g, r) => g.kind === "duel" ? `${r.w || 0}승 ${r.l || 0}패` : `${r.best || 0}점`;
const nameOf = no => { const s = roster().find(x => x.no == no); return s ? s.name : ""; };
const who = no => +no === TEACHER ? "🧑‍🏫 선생님" : `${no}번 ${nameOf(no)}`;

/* =====================================================================
   화면
   ===================================================================== */

/* =====================================================================
   📲 앱으로 설치 — 홈 화면 아이콘을 누르면 바로 우리 반 보드게임으로 들어와요
   ===================================================================== */
const joinUrl = () => { const j = Store.join(); return j ? `${location.origin}${location.pathname}?s=2#join=${b64e({c: j.c, i: j.i})}` : ""; };
const APP = {
  ev: null,
  standalone(){ return matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: fullscreen)").matches || navigator.standalone === true; },
  ios(){ return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); },
  init(){
    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) navigator.serviceWorker.register("arcade-sw.js").catch(e => console.warn(e));
    addEventListener("beforeinstallprompt", e => { e.preventDefault(); this.ev = e; this.paint(); });
    addEventListener("appinstalled", () => { this.ev = null; this.paint(); ARC.modal("#mdApp", false); toast("📲 설치했어요! 이제 홈 화면의 보드게임 아이콘으로 바로 들어와요"); });
    $$(".app-inst").forEach(b => b.onclick = () => this.go());
    this.paint();
  },
  can(){ return !this.standalone() && (!!this.ev || this.ios()); },
  paint(){ const c = this.can(); $$(".app-inst").forEach(b => b.hidden = !c); },
  async go(){
    if (this.ev){
      const e = this.ev; e.prompt();
      const r = await e.userChoice.catch(() => ({}));
      if (r.outcome === "accepted") this.ev = null; this.paint(); return;
    }
    this.how();
  },
  /* 설치 버튼이 안 뜨는 기기(아이패드 등)에서 하는 방법 */
  how(){
    const url = joinUrl(), ios = this.ios();
    $("#apHow").innerHTML = (ios ? `<ol class="ap-st"><li>사파리 아래(또는 위) <b>공유 버튼 <span class="k">⬆️</span></b>을 눌러요</li><li><b>홈 화면에 추가</b>를 누르고 <b>추가</b>를 눌러요</li><li>홈 화면의 <b>🎲 보드게임</b> 아이콘을 눌러요</li></ol>`
      : `<ol class="ap-st"><li>크롬 주소창 오른쪽 <b>설치 아이콘 <span class="k">⊕</span></b>을 누르거나, 메뉴 <b>⋮</b> → <b>앱 설치</b>(또는 <b>홈 화면에 추가</b>)를 눌러요</li><li>홈 화면·앱 목록의 <b>🎲 보드게임</b> 아이콘을 눌러요</li></ol>`)
      + (url ? `<p class="arc-small">아이콘으로 처음 열었는데 <b>“학생이에요?”</b> 화면이 나오면, 아래 <b>반 입장 주소</b>를 복사해 두었다가 붙여 넣어요 (아이패드는 앱이 따로 저장해서 한 번 필요해요).</p>
        <div class="arc-link"><input readonly value="${esc(url)}" id="apUrl"><button class="arc-btn p" id="apCopy">📋 복사</button></div>` : "");
    const c = $("#apCopy"); if (c) c.onclick = () => { const i = $("#apUrl"); i.select(); (navigator.clipboard ? navigator.clipboard.writeText(i.value) : Promise.reject()).catch(() => document.execCommand("copy")); toast("📋 반 입장 주소를 복사했어요"); };
    ARC.modal("#mdApp", true);
  }
};
/* QR (vendor/qrcode.js 는 선생님 화면에서만 불러와요) */
function qrSvg(text){
  const make = () => { const q = qrcode(0, "L"); q.addData(text); q.make(); return q.createSvgTag({cellSize: 4, margin: 2, scalable: true}); };
  if (window.qrcode) return Promise.resolve(make());
  return new Promise((res, rej) => { const s = document.createElement("script"); s.src = "vendor/qrcode.js"; s.onload = () => { try { res(make()); } catch(e){ rej(e); } }; s.onerror = rej; document.head.appendChild(s); });
}
/* 반 입장 주소를 붙여 넣어서 들어가기 */
function joinFrom(text){
  const sh = String(text || "").match(/school=([\w-]+)/);   // 🏫 반 고르기 주소를 붙여 넣었어요
  if (sh){ try { const o = b64d(sh[1]); if (!o.c || !Array.isArray(o.l)) throw 0; SCHOOL.pick(Object.assign(o, {entry: true})); } catch(e){ alert("반 고르기 주소가 잘못됐어요."); } return; }
  const m = String(text || "").match(/join=([\w-]+)/) || String(text || "").trim().match(/^([\w-]{40,})$/);
  if (!m) return alert("반 입장 주소를 찾지 못했어요. 선생님이 알려 준 주소를 통째로 붙여 넣어 주세요.");
  try { const j = b64d(m[1]); if (!j.c || !j.i) throw 0; localStorage.setItem(KEY + ".join", JSON.stringify({c: j.c, i: j.i})); location.reload(); }
  catch(e){ alert("반 입장 주소가 잘못됐어요. 선생님께 다시 받아 주세요."); }
}

const ARC = {
  me: null, busy: false, game: null,
  show(id){ $$(".arc-scr").forEach(s => s.hidden = s.id !== id); },
  modal(id, on){ const m = $(id); m.hidden = !on; },
  async boot(){
    // 반 입장 주소로 들어왔어요
    const h = location.hash.match(/join=([\w-]+)/);
    if (h){ try { const j = b64d(h[1]); localStorage.setItem(KEY + ".join", JSON.stringify({c: j.c, i: j.i})); } catch(e) { alert("반 입장 주소가 잘못됐어요."); } history.replaceState(null, "", location.pathname); }
    SCHOOL.fromHash();   // 🏫 반 고르기 주소로 들어왔어요
    $$("[data-close]").forEach(b => b.onclick = () => b.closest(".arc-modal").hidden = true);
    APP.init();
    // 가져온 게임의 '친구 고르기' 버튼은 보드게임에서는 홈으로 가요
    ["#flOther", "#trOther", "#vbToSel", "#ahToSel"].forEach(s => { const el = $(s); if (el) el.textContent = "🏠 보드게임 홈"; });
    $$(".arc-modal").forEach(m => m.addEventListener("pointerdown", e => { if (e.target === m && m.id !== "mdPw" && m.id !== "mdNet") m.hidden = true; }));
    Store.subs.push(() => this.refresh());
    let ok = false;
    const ld = document.createElement("div"); ld.id = "arcLoading"; ld.className = "arc-loading"; ld.innerHTML = `<div><b>🎲</b><p>우리 반 보드게임을 여는 중…</p></div>`;
    if (Store.join()) document.body.appendChild(ld);
    const ldT = setTimeout(() => { const p = ld.querySelector("p"); if (p) p.innerHTML = `연결이 조금 느려요…<br><small>잠시만 기다려 주세요</small>`; }, 5000);
    try { ok = await Store.init(); clearTimeout(ldT); ld.remove(); }
    catch(e){ clearTimeout(ldT); ld.remove(); console.error(e);
      if (e && e.code === "arc-slow" && !(+localStorage.getItem(KEY + ".nocache") > Date.now())){
        localStorage.setItem(KEY + ".nocache", Date.now() + 6*3600000); location.reload(); return; }   /* 기기 저장소 없이 한 번 더 (6시간) */
      this.syncMsg(`⚠️ 반 전체 기록에 연결하지 못했어요: ${e.message || e}`); $("#lgSync").innerHTML = `⚠️ 반 기록에 연결하지 못했어요. 인터넷을 확인하고 <button class="arc-btn" onclick="location.reload()">다시 연결</button>`; this.show("scrLogin"); return; }
    if (!ok) return this.setup();
    const meRaw = localStorage.getItem(KEY + ".me"), me = meRaw === null || meRaw === "" ? null : +meRaw;
    if (this.inRoster(me)){ this.me = me; this.home(); } else { this.login(); SCHOOL.entry(); }
  },
  inRoster(no){ return no !== null && no !== undefined && roster().some(s => s.no == no); },
  refresh(){
    if (!Store.cls) return;
    if (this.busy){ this.dirty = true; return; }   // 게임 중에는 뒤 화면을 다시 그리지 않아요(렉의 큰 원인) — 홈으로 오면 그려요
    S.className = Store.cls.name || "";
    if (this.me !== null && !this.inRoster(this.me)) { this.logout(); return; }
    if (LOBBY.guard()) return;
    if (!$("#scrHome").hidden) this.renderHome();
    if (!$("#scrLogin").hidden) this.renderLogin();
    if (!$("#mdTeach").hidden){ ADMIN.live(); if (this.tcTab === "coin" && this.coinPaint) this.coinPaint(); }
    if (!$("#mdRank").hidden) this.renderRank();
    this.syncMsg();
  },
  syncMsg(m){
    const t = m || (Store.mode === "cloud" ? (Store.ok ? "☁️ 반 전체 랭킹에 연결돼 있어요" : `⚠️ 연결이 끊겼어요 (${Store.err})`) : Store.mode === "local" ? "💻 이 기기에만 기록하고 있어요" : "");
    $("#lgSync").textContent = $("#hmSync").textContent = t;
  },

  /* ---------- 처음 설정 ---------- */
  setup(){
    this.show("scrSetup");
    $("#suJoinGo").onclick = () => joinFrom($("#suJoin").value);
    $("#suJoin").onkeydown = e => { if (e.key === "Enter") joinFrom($("#suJoin").value); };
    const help = {local: "이 기기(교실 컴퓨터 한 대)에서만 기록하고 랭킹을 봐요. 나중에 Firebase로 옮길 수 있어요.",
                  cloud: "아이들 각자 태블릿·크롬북에서 들어와도 반 전체 랭킹이 하나로 모여요. 구글 계정으로 무료 Firebase 프로젝트를 먼저 만들어야 해요 (아래에 만드는 방법이 있어요)."};
    let mode = "local";
    const paint = () => { $$("#suMode button").forEach(b => b.classList.toggle("on", b.dataset.v === mode)); $("#suModeHelp").textContent = help[mode]; $("#suCfgBox").hidden = mode !== "cloud"; $("#suHow").hidden = mode !== "cloud"; if (mode === "cloud" && !$("#suHow").innerHTML) $("#suHow").innerHTML = fbHow(true); };
    $("#suMode").onclick = e => { const b = e.target.closest("button"); if (b){ mode = b.dataset.v; paint(); } };
    paint();
    $("#suGo").onclick = async () => {
      const roster = parseRoster($("#suRoster").value), pin = $("#suPin").value.trim(), name = $("#suName").value.trim() || "우리 반";
      if (!roster.length) return alert("학생 명단을 한 줄에 한 명씩 \"번호 이름\"으로 적어 주세요.");
      if (!/^\d{4,8}$/.test(pin)) return alert("선생님 비밀번호는 숫자 4~8자리로 정해 주세요.");
      const cid = rid(20), cls = {v: 1, cid, name, roster, faces: {}, pw: {}, admin: ""};
      Store.cls = cls; const plain = {};
      roster.forEach(s => { plain[s.no] = pin4(); cls.pw[s.no] = pwHash(s.no, plain[s.no]); });
      cls.admin = sha256(`${cid}:teacher:${pin}`);
      roster.forEach((s, i) => cls.faces[s.no] = FACES[i % FACES.length]);
      savePlain(cid, plain);
      $("#suGo").disabled = true; $("#suGo").textContent = "만드는 중…";
      try {
        if (mode === "cloud"){
          const cfg = parseCfg($("#suCfg").value); if (!cfg) throw new Error("Firebase 설정을 찾지 못했어요. apiKey, projectId 가 들어 있는 설정을 붙여 넣어 주세요.");
          await Store.connect(cfg, cid, cls);
        } else { Store.mode = "local"; Store.cls = cls; Store.recs = {}; Store.saveLocal(); }
      } catch(e){ $("#suGo").disabled = false; $("#suGo").textContent = "🎮 보드게임 만들기"; return alert("만들지 못했어요: " + (e.message || e)); }
      this.login(); this.teacher("kids");
      toast("🎉 보드게임이 만들어졌어요! 아이들 비밀번호 쪽지를 인쇄해 나눠 주세요.");
    };
  },

  /* ---------- 로그인 ---------- */
  login(){ this.me = null; this.show("scrLogin"); LIVE.start(); LOBBY.sig = {}; this.renderLogin(); },
  renderLogin(){
    LOBBY.renderLogin(); SCHOOL.loginBtn();
    $("#lgNums").onclick = e => { const b = e.target.closest("[data-no]"); if (b) this.askPw(+b.dataset.no, no => { this.me = no; localStorage.setItem(KEY + ".me", no); localStorage.setItem(KEY + ".in", Date.now()); this.home(); if (!(Store.kids[sidOf(no)] || {}).av) setTimeout(() => SHOP.open(sidOf(no), true), 300); }); };
    $("#lgTeach").onclick = () => this.teacherGate();
  },
  /* 숫자 패드로 비밀번호 (4자리면 바로 확인) */
  pad(o){
    let v = "", fails = 0, lockUntil = 0;
    $("#pwPad").hidden = false; $("#pwDots").hidden = false;
    $("#pwWho").innerHTML = o.who || ""; $("#pwTitle").textContent = o.title || "비밀번호"; $("#pwMsg").textContent = o.msg || "";
    $("#pwExtra").innerHTML = o.extra || "";
    const dots = () => $("#pwDots").innerHTML = o.len ? Array.from({length: o.len}, (_, i) => `<i class="${i < v.length ? "on" : ""}"></i>`).join("") : `<span class="arc-pwv">${"●".repeat(v.length) || "&nbsp;"}</span>`;
    $("#pwPad").innerHTML = ["1","2","3","4","5","6","7","8","9","←","0","✓"].map(k => `<button data-k="${k}" class="${k === "✓" ? "ok" : ""}">${k}</button>`).join("");
    const go = async () => {
      if (Date.now() < lockUntil) return;
      const r = await o.check(v);
      if (r === true){ this.modal("#mdPw", false); return; }
      fails++; v = ""; dots(); $("#pwMsg").textContent = r || "비밀번호가 달라요"; $(".arc-pw").classList.remove("shake"); void $(".arc-pw").offsetWidth; $(".arc-pw").classList.add("shake");
      if (fails >= 5){ lockUntil = Date.now() + 15000; $("#pwMsg").textContent = "여러 번 틀렸어요. 15초 뒤에 다시 해요."; }
    };
    $("#pwPad").onclick = e => { const b = e.target.closest("[data-k]"); if (!b) return; const k = b.dataset.k;
      if (k === "←") v = v.slice(0, -1); else if (k === "✓") return go(); else if (v.length < 8) v += k;
      dots(); if (o.len && v.length === o.len) setTimeout(go, 120); };
    this._padKey = e => { if ($("#mdPw").hidden) return; if (/^\d$/.test(e.key)){ $(`#pwPad [data-k="${e.key}"]`).click(); } else if (e.key === "Backspace") $('#pwPad [data-k="←"]').click(); else if (e.key === "Enter") $('#pwPad [data-k="✓"]').click(); else if (e.key === "Escape") this.modal("#mdPw", false); };
    window.removeEventListener("keydown", this._padKeyOld || (() => {})); window.addEventListener("keydown", this._padKey); this._padKeyOld = this._padKey;
    dots(); $("#pwPick").hidden = true; this.modal("#mdPw", true);
  },
  askPw(no, ok, title){
    if (+no === TEACHER) return this.pad({who: `<span class="avf">${avHTMLof(sidOf(TEACHER), {still: true, face: true})}</span><b>선생님</b>`, title: title || "선생님 비밀번호",
      check: v => { if (sha256(`${Store.cls.cid}:teacher:${v}`) === Store.cls.admin){ ok(TEACHER); return true; } return "비밀번호가 달라요"; }});
    this.pad({who: `<span class="avf">${avHTMLof(sidOf(no), {still: true, face: true})}</span><b>${esc(who(no))}</b>`, title: title || "비밀번호 4자리", len: 4,
      check: v => { if (Store.cls.pw[no] && pwHash(no, v) === Store.cls.pw[no]){ ok(no); return true; } return Store.cls.pw[no] ? "비밀번호가 달라요" : "아직 비밀번호가 없어요. 선생님께 말해요."; }});
  },
  async logout(){ if (Store.saving()){ toast("💾 산 것을 저장하는 중이에요… 잠깐만요"); await Store.flush(); } ROOMS.leaveMine(); LIVE.ping("off"); NET.unlisten(); localStorage.removeItem(KEY + ".me"); this.me = null; this.login(); try { sessionStorage.removeItem(KEY + ".picked"); } catch(e){} SCHOOL.entry(); },

  /* ---------- 캐릭터 ---------- */
  pickFace(first){
    const mine = faceOf(sidOf(this.me)), used = new Set(Object.entries(Store.cls.faces || {}).filter(([n]) => n != this.me).map(([, f]) => f));
    $("#fcGrid").innerHTML = FACES.map(f => `<button data-f="${f}" class="${f === mine ? "on" : ""}${used.has(f) ? " used" : ""}" title="${used.has(f) ? "다른 친구도 쓰고 있어요" : ""}">${f}</button>`).join("");
    $("#mdFace h2").textContent = first ? "😀 처음 왔네요! 내 캐릭터를 골라요" : "😀 내 캐릭터 고르기";
    $("#fcGrid").onclick = async e => { const b = e.target.closest("[data-f]"); if (!b) return; this.modal("#mdFace", false);
      await Store.putFace(this.me, b.dataset.f);
      if (!(Store.cls.facePicked || {})[this.me]){ Store.cls.facePicked = Object.assign({}, Store.cls.facePicked, {[this.me]: 1}); if (Store.mode === "local") Store.saveLocal(); else Store.fs.setDoc(Store.refCls, {facePicked: {[this.me]: 1}}, {merge: true}); }
      toast(`${b.dataset.f} 캐릭터로 바꿨어요!`); };
    this.modal("#mdFace", true);
  },

  /* ---------- 홈 ---------- */
  home(){ this.show("scrHome"); LIVE.start(); LOBBY.sig = {}; this.renderHome(); NET.listen(this.me); LIVE.ping("home");
    $("#hmOut").onclick = () => this.logout(); $("#hmFace").onclick = () => SHOP.open(sidOf(this.me)); $("#hmRank").onclick = () => this.rank(this.lastRank || "fl");
    $("#hmAdmin").onclick = () => this.teacher("live"); LOBBY.bindHome(); },
  renderHome(){ LOBBY.renderHome(); },

  /* ---------- 게임 시작 ---------- */
  prep(){ S.students = roster().map(s => ({id: sidOf(s.no), name: s.name})); S.className = Store.cls.name; },
  /* 게임 들어갈 때: 화면 꽉 차게 + 뒤 화면 멈춤 + 버벅임 감시 */
  enter(){ FULL.on(); document.body.classList.add("arc-playing"); PERF.watch(true); ROOMS.leaveMine(); setTimeout(() => LIVE.ping("play", this.game), 0); },
  play(gid){
    const g = GAME[gid]; if (!LOBBY.canPlay(gid)) return; getAC(); this.game = gid; this.lastRank = gid;
    if (g.kind === "duel") return this.duelMenu(gid);
    this.enter(); this.prep(); const sid = sidOf(this.me);
    const recs = JSON.parse(JSON.stringify(Store.recs[gid] || {}));
    if (gid === "fl"){ S.fly = {rec: recs}; this.busy = false; window.__flOpen(); window.__flTest.begin(sid); this.busy = true; }
    else if (gid === "tr"){ S.train = {rec: recs}; this.busy = false; window.__trOpen(); window.__trTest.begin(sid); this.busy = true; }
    else NG.play(gid, [sid]);
  },
  duelMenu(gid){
    const g = GAME[gid], me = this.me; let lv = 1;
    $("#duTitle").textContent = `${g.e} ${g.n} 대결`;
    $("#duDuo").innerHTML = `<div class="p"><span class="avf">${avHTMLof(sidOf(me), {still: true, face: true})}</span><b>${esc(who(me))}</b></div><div class="vs">VS</div><div class="p q"><span class="f">❔</span><b>누구랑 할까요?</b></div>`;
    const BDH = {jg: "말을 톡 눌러 고르고, 초록 점을 눌러 옮겨요. 장군을 받으면 꼭 막아요!", ch: "말을 톡 눌러 고르고, 초록 점을 눌러 옮겨요. 폰이 끝까지 가면 퀸이 돼요!", om: "놓고 싶은 곳을 두 번 톡톡! 가로·세로·대각선 다섯 개를 먼저 만들면 승리", bl: "판을 끌어 방향을 정하고, 힘 막대를 당겼다 놓아 쳐요. 공을 넣으면 한 번 더!",
      jj: "⚡ 기술 · 🛡️ 탈출 · 🔒 조르기 단추를 눌러요. 기술이 걸리면 둘 다 빠르게 연타! (키보드: 1P F·G·H / 2P J·K·L)",
      kf: "👊 펀치 · 🦵 킥 · ✨ 기술 · 💥 필살! 뒤로 누르면 막기 (키보드: 1P W·A·S·D + F·G·H·T / 2P 방향키 + J·K·L·I)"};
    $("#duHelp").textContent = BDH[gid] ? BDH[gid] : gid === "vb" ? "태블릿에서는 화면 양쪽 아래 버튼으로 움직여요 (키보드: 1P W·A·D·F / 2P 방향키·Enter)" : gid === "ah" ? "자기 쪽 화면을 손가락으로 끌어서 말렛을 움직여요" : "자기 쪽 화면을 손가락으로 위아래로 끌어요 (키보드: 1P W·S / 2P ↑·↓)";
    $$("#duLv button").forEach(b => b.classList.toggle("on", +b.dataset.v === lv));
    $("#duLv").onclick = e => { const b = e.target.closest("button"); if (b){ lv = +b.dataset.v; $$("#duLv button").forEach(x => x.classList.toggle("on", x === b)); } };
    $("#duCpu").onclick = () => { this.modal("#mdDuel", false); const others = roster().filter(s => s.no != me && !s.t); const cpu = others.length ? others[Math.floor(Math.random()*others.length)].no : me; this.startDuel(gid, me, cpu, true, lv); };
    $("#duFriend").onclick = () => { this.modal("#mdDuel", false); this.pickRival(gid, opp => this.startDuel(gid, me, opp, false, lv)); };
    const nb = $("#duNet"), canNet = NET.ok();
    nb.disabled = !canNet; nb.querySelector("small").textContent = canNet ? "친구는 자기 태블릿·크롬북에서 수락만 누르면 돼요 · 이기면 랭킹 1승!" : "선생님이 ☁️ Firebase로 연결한 반에서만 할 수 있어요";
    nb.onclick = () => { if (!canNet) return; this.modal("#mdDuel", false); this.pickNet(gid, opp => NET.invite(gid, opp)); };
    this.modal("#mdDuel", true);
  },
  pickRival(gid, cb){
    const me = this.me;
    this.pad({who: `<b>⚔️ 대결할 친구가 들어와요</b>`, title: "친구 번호를 눌러요", extra: ""});
    $("#pwPad").hidden = true; $("#pwDots").hidden = true;
    $("#pwPick").hidden = false;
    $("#pwPick").innerHTML = roster().filter(s => s.no != me).map(s => `<button class="arc-num${s.t ? " tch" : ""}" data-no="${s.no}"><span class="avf">${avHTMLof(sidOf(s.no), {still: true, face: true})}</span><b>${s.t ? "선생님" : s.no}</b><small>${s.t ? "선생님" : esc(s.name)}</small></button>`).join("");
    $("#pwPick").onclick = e => { const b = e.target.closest("[data-no]"); if (!b) return; const no = +b.dataset.no;
      $("#pwPad").hidden = false; $("#pwDots").hidden = false; this.askPw(no, cb, `${who(no)} 비밀번호`); };
  },
  pickNet(gid, cb){
    const me = this.me;
    this.pad({who: `<b>🌐 다른 기기 친구와 대결</b>`, title: "누구에게 신청할까요?", extra: ""});
    $("#pwPad").hidden = true; $("#pwDots").hidden = true; $("#pwPick").hidden = false;
    $("#pwPick").innerHTML = roster().filter(s => s.no != me).map(s => `<button class="arc-num${s.t ? " tch" : ""}" data-no="${s.no}"><span class="avf">${avHTMLof(sidOf(s.no), {still: true, face: true})}</span><b>${s.t ? "선생님" : s.no}</b><small>${s.t ? "선생님" : esc(s.name)}</small></button>`).join("");
    $("#pwPick").onclick = e => { const b = e.target.closest("[data-no]"); if (!b) return; this.modal("#mdPw", false); $("#pwPad").hidden = false; $("#pwDots").hidden = false; cb(+b.dataset.no); };
  },
  /* 다른 기기 대결 시작 (role: host = 신청한 친구 · 왼쪽, guest = 수락한 친구 · 오른쪽) */
  netGo(role, gid, a, b, x){
    this.enter(); this.prep(); this.game = gid; this.lastRank = gid; getAC(); const A = sidOf(a), B = sidOf(b);
    $$(".arc-modal").forEach(m => m.hidden = true);
    if (gid === "vb" || gid === "ah"){
      const N = gid === "vb" ? window.__vbNet : window.__ahNet;
      if (!N.isOpen()){ this.busy = false; (gid === "vb" ? window.__vbOpen : window.__ahOpen)(); }
      const out = N.begin(role, A, B, x); this.busy = true;
      if (gid === "vb") vpadShow(true);
      return out;
    }
    NG.play(gid, [A, B], {net: role}); return null;
  },
  netQuit(){ if (window.__vbNet) window.__vbNet.close(); if (window.__ahNet) window.__ahNet.close(); if (NG.cur && !$("#ng").hidden) NG.close(); },
  startDuel(gid, a, b, cpu, lv){
    this.enter(); this.prep(); const A = sidOf(a), B = sidOf(b);
    if (gid === "vb" || gid === "ah"){
      const open = gid === "vb" ? window.__vbOpen : window.__ahOpen, T = gid === "vb" ? window.__vbTest : window.__ahTest;
      this.busy = false; open(); T.setMode(cpu ? "cpu" : "2p"); T.setLv(lv); T.setPick(A, B); T.start(); this.busy = true;
      if (gid === "vb") vpadShow(cpu);
    } else NG.play(gid, [A, B], {cpu, lv});
  },
  /* 게임이 끝나면 여기로 와요 */
  score(gid, sid, rec){
    if (sid !== sidOf(this.me)) return 0;
    const prev = ((Store.recs[gid] || {})[sid] || {}).best || 0, isNew = (rec.last || 0) > prev && (rec.last || 0) > 0;
    Store.putScore(gid, sid, JSON.parse(JSON.stringify(rec)));
    const got = Store.earn(sid, coinsFor(gid, rec.last) + (isNew ? BEST_COIN : 0));
    if (gid === "fl" || gid === "tr") setTimeout(() => toast(got ? `🪙 +${got} 코인!${isNew ? " (최고 기록 보너스 포함)" : ""}` : "🪙 오늘 모을 수 있는 코인을 다 모았어요!"), 700);
    return got;
  },
  duel(gid, w, l, cpu){
    if (cpu){ setTimeout(() => toast("🤖 컴퓨터와 연습한 판은 랭킹에 들어가지 않아요"), 400); return {w: 0, l: 0}; }
    if (NET.role){
      NET.title(gid === "vb" ? "#vbEnd h3" : gid === "ah" ? "#ahEnd h3" : "#ngOver h3", w);
      // 🌐 다른 기기 대결: 랭킹·코인은 신청한 친구 기기가 한 번만 올려요 (여기서는 보여 주기만)
      if (NET.role === "guest") return {w: Store.coinCalc(w, WIN_COIN), l: Store.coinCalc(l, LOSE_COIN)};
    }
    const cw = Store.earn(w, WIN_COIN), cl = Store.earn(l, LOSE_COIN);
    Store.putDuel(gid, w, l).then(() => { const r = (Store.recs[gid] || {})[w] || {}; toast(`🏆 ${who(noOf_(w))} 승리! 이제 ${r.w || 1}승 · 🪙 +${cw}`); });
    return {w: cw, l: cl};
  },
  back(){
    if (NET.role) NET.leave();
    this.busy = false; vpadShow(null); PERF.watch(false); FULL.off(); document.body.classList.remove("arc-playing");
    setTimeout(() => { if (this.me !== null){ this.dirty = false; LOBBY.sig = {}; this.refresh(); LIVE.ping("home"); } NET.showInvite(); }, 0);
  },

  /* ---------- 랭킹 ---------- */
  rank(gid){ this.rkG = gid; this.modal("#mdRank", true); this.renderRank(); },
  renderRank(){
    const gid = this.rkG || "fl", g = GAME[gid] || {}, B = gid === "coin" ? [] : board(gid), me = sidOf(this.me);
    $("#rkTabs").innerHTML = GAMES.map(x => `<button data-g="${x.id}" class="${x.id === gid ? "on" : ""}">${x.e} ${x.n}</button>`).join("") + `<button data-g="coin" class="${gid === "coin" ? "on" : ""}">🪙 코인왕</button>`;
    if (gid === "coin") return this.renderCoinRank();
    $("#rkTabs").onclick = e => { const b = e.target.closest("[data-g]"); if (b){ this.rkG = b.dataset.g; this.renderRank(); } };
    $("#rkList").innerHTML = `<div class="arc-rhead">${g.kind === "duel" ? "⚔️ 이긴 횟수가 많은 순서 (친구끼리 대결만 쳐요)" : "🏆 최고 점수 순서"}</div>` + (B.length ? B.map(x => `
      <div class="arc-rrow${x.sid === me ? " me" : ""}${x.rank <= 3 ? " t" + x.rank : ""}"><span class="rk">${x.rank <= 3 ? ["🥇","🥈","🥉"][x.rank - 1] : x.rank}</span><span class="avf">${avHTMLof(x.sid, {still: true, face: true})}</span><span class="nm">${esc(who(x.st.no))} ${titleHTML(x.sid)}</span>
      <span class="v">${valTxt(g, x.r)}${g.kind === "duel" ? ` <small>${Math.round((x.r.w || 0)/Math.max(1, (x.r.w || 0) + (x.r.l || 0))*100)}%</small>` : ` <small>${x.r.plays || 0}판</small>`}</span></div>`).join("") : `<p class="arc-empty">아직 아무도 기록이 없어요. 첫 번째 1등이 되어 보세요!</p>`);
  },

  renderCoinRank(){
    const me = sidOf(this.me), rows = roster().map(s => ({s, sid: sidOf(s.no), w: walletOf(sidOf(s.no))})).filter(x => x.w.total > 0).sort((a, b) => b.w.total - a.w.total);
    $("#rkTabs").onclick = e => { const b = e.target.closest("[data-g]"); if (b){ this.rkG = b.dataset.g; this.renderRank(); } };
    $("#rkList").innerHTML = `<div class="arc-rhead">🪙 지금까지 모은 코인 순서 (쓴 코인도 포함)</div>` + (rows.length ? rows.map((x, i) => `
      <div class="arc-rrow${x.sid === me ? " me" : ""}${i < 3 ? " t" + (i + 1) : ""}"><span class="rk">${i < 3 ? ["🥇","🥈","🥉"][i] : i + 1}</span><span class="avf">${avHTMLof(x.sid, {still: true, face: true})}</span><span class="nm">${esc(who(x.s.no))} ${titleHTML(x.sid)}</span>
      <span class="v">${x.w.total.toLocaleString()}코인 <small>지금 ${(x.w.coins || 0).toLocaleString()}</small></span></div>`).join("") : `<p class="arc-empty">아직 코인을 모은 친구가 없어요. 게임을 해서 모아 보세요!</p>`);
  },

  /* ---------- 선생님 ---------- */
  teacherGate(){
    this.pad({who: "<b>🛠️ 관리자 화면</b>", title: "선생님 비밀번호", check: v => { if (sha256(`${Store.cls.cid}:teacher:${v}`) === Store.cls.admin){ setTimeout(() => this.teacher("live"), 50); return true; } return "비밀번호가 달라요"; }});
  },
  teacher(tab){
    const same = (tab || this.tcTab) === this.tcTab && !$("#mdTeach").hidden;
    this.tcTab = tab || this.tcTab || "live"; this.modal("#mdTeach", true); LIVE.start();
    $$("#tcTabs button").forEach(b => b.classList.toggle("on", b.dataset.t === this.tcTab));
    { const sb = $('#tcTabs [data-t="school"]'); if (sb) sb.hidden = !SCHOOL.isOwner(); }
    $("#tcTabs").onclick = e => { const b = e.target.closest("[data-t]"); if (b) this.teacher(b.dataset.t); };
    const cls = Store.cls, plain = loadPlain(cls.cid), body = $("#tcBody");
    $("#tcCls").textContent = cls.name || ""; body.onclick = null; if (!same) body.parentNode.scrollTop = 0;   // 같은 탭을 다시 그릴 때는 보던 자리 그대로
    if (ADMIN.has(this.tcTab)) return ADMIN.render(this.tcTab, body);
    if (this.tcTab === "school") return SCHOOL.render(body);
    const H = {kids: "👧 학생 · 비밀번호", coin: "🪙 코인", rank: "🏆 랭킹 관리", link: "🔗 반 입장 주소", store: "☁️ 저장"};
    if (this.tcTab === "kids"){
      body.innerHTML = `<p class="arc-small">비밀번호는 숫자 4자리예요. 이 기기에서 정한 비밀번호만 여기에 보이고, 다른 기기에서는 <b>🎲 새로</b>로 다시 정할 수 있어요.</p>
        <div class="arc-kids"><div class="h"><span>번호</span><span>이름(별명)</span><span>캐릭터</span><span>비밀번호</span><span></span></div>
        ${cls.roster.map(s => `<div class="r" data-no="${s.no}"><span><input class="no" value="${s.no}" inputmode="numeric" maxlength="3"></span><span><input class="nm" value="${esc(s.name)}" maxlength="12"></span><span class="avf">${avHTMLof(sidOf(s.no), {still: true, face: true})}</span>
          <span><input class="pw" value="${plain[s.no] || ""}" placeholder="${cls.pw[s.no] ? "●●●● (정해져 있음)" : "없음"}" inputmode="numeric" maxlength="4"></span><span><button class="arc-btn sm" data-new>🎲 새로</button><button class="arc-btn sm" data-del title="빼기">✕</button></span></div>`).join("")}</div>
        <div class="arc-row"><button class="arc-btn" id="tkAdd">➕ 학생 추가</button><button class="arc-btn" id="tkAll">🎲 비밀번호 모두 새로</button><button class="arc-btn" id="tkPrint">🖨️ 비밀번호 쪽지 인쇄</button><button class="arc-btn p" id="tkSave">💾 저장</button></div>
        <label class="arc-f">반 이름 <input id="tkName" value="${esc(cls.name)}" maxlength="20"></label>
        <label class="arc-chk"><input type="checkbox" id="tkTeach" ${cls.noTeacher ? "" : "checked"}> 🧑‍🏫 <b>선생님도 같이 하기</b> <small>로그인 화면에 '선생님' 자리가 생겨요. 선생님 비밀번호로 들어가고, 랭킹·대결에도 나와요.</small></label>`;
      body.querySelector(".arc-kids").onclick = e => { const r = e.target.closest(".r"); if (!r) return;
        if (e.target.closest("[data-new]")) r.querySelector(".pw").value = pin4();
        if (e.target.closest("[data-del]") && confirm("이 학생을 명단에서 뺄까요? (저장을 눌러야 적용돼요)")) r.remove(); };
      $("#tkAdd").onclick = () => { const n = Math.max(0, ...$$("#tcBody .r .no").map(i => +i.value || 0)) + 1; body.querySelector(".arc-kids").insertAdjacentHTML("beforeend", `<div class="r" data-no=""><span><input class="no" value="${n}" inputmode="numeric" maxlength="3"></span><span><input class="nm" value="" maxlength="12"></span><span class="f">🙂</span><span><input class="pw" value="${pin4()}" inputmode="numeric" maxlength="4"></span><span><button class="arc-btn sm" data-new>🎲 새로</button><button class="arc-btn sm" data-del>✕</button></span></div>`); };
      $("#tkAll").onclick = () => { if (confirm("모든 학생의 비밀번호를 새로 만들까요? (저장을 눌러야 적용돼요)")) $$("#tcBody .r .pw").forEach(i => i.value = pin4()); };
      $("#tkPrint").onclick = () => printSlips();
      $("#tkSave").onclick = async () => {
        const rows = $$("#tcBody .r").map(r => ({old: r.dataset.no, no: +r.querySelector(".no").value, name: r.querySelector(".nm").value.trim(), pw: r.querySelector(".pw").value.trim()}));
        if (rows.some(r => !r.no)) return alert("번호를 모두 숫자로 적어 주세요.");
        if (new Set(rows.map(r => r.no)).size !== rows.length) return alert("같은 번호가 두 번 있어요.");
        if (rows.some(r => r.pw && !/^\d{4}$/.test(r.pw))) return alert("비밀번호는 숫자 4자리로 적어 주세요.");
        const nc = JSON.parse(JSON.stringify(cls)), np = {}; nc.name = $("#tkName").value.trim() || cls.name; nc.noTeacher = !$("#tkTeach").checked; nc.roster = []; nc.pw = {}; const faces = {};
        rows.sort((a, b) => a.no - b.no).forEach(r => { nc.roster.push({no: r.no, name: r.name || `${r.no}번`}); faces[r.no] = (cls.faces || {})[r.old] || FACES[(r.no - 1) % FACES.length];
          if (r.pw){ nc.pw[r.no] = sha256(`${cls.cid}:${r.no}:${r.pw}`); np[r.no] = r.pw; } else if (r.old && cls.pw[r.old] && +r.old === r.no) nc.pw[r.no] = cls.pw[r.old]; });
        if ((cls.faces || {})[TEACHER]) faces[TEACHER] = cls.faces[TEACHER];   // 선생님 캐릭터는 그대로
        nc.faces = faces; savePlain(cls.cid, np);
        try { await Store.putClass(nc); toast("💾 저장했어요"); this.teacher("kids"); } catch(e){ alert("저장하지 못했어요: " + e.message); }
      };
    } else if (this.tcTab === "link"){
      const url = Store.mode === "cloud" ? joinUrl() : "";
      body.innerHTML = Store.mode === "cloud" ? `<p>아이들 태블릿·크롬북에서 <b>이 주소(또는 QR)를 한 번만</b> 열면 우리 반 보드게임으로 들어와요. 그다음부터는 그냥 보드게임 주소로 열어도 돼요.</p>
        <div class="arc-link"><input readonly value="${esc(url)}" id="tlUrl"><button class="arc-btn p" id="tlCopy">📋 복사</button></div>
        <div class="tl-qrw"><div class="tl-qr" id="tlQr" title="누르면 크게 보여요">QR 만드는 중…</div>
          <div class="tl-app"><h4>📲 우리 반 보드게임 앱 만들기</h4>
            <ol><li>아이 기기에서 위 주소를 열거나 <b>QR을 찍어요</b> → 우리 반 로그인 화면이 떠요</li>
              <li>화면의 <b>📲 앱으로 설치</b>를 눌러요 (크롬: 주소창 오른쪽 설치 아이콘 · 아이패드: 공유 ⬆️ → 홈 화면에 추가)</li>
              <li>이제 홈 화면의 <b>🎲 보드게임</b> 아이콘을 누르면 <b>바로 ${esc(Store.cls.name || "우리 반")} 보드게임</b>로 들어와요</li></ol>
            <button class="arc-btn" id="tlBig">🔍 QR 크게 띄우기 (TV·칠판용)</button></div></div>
        <p class="arc-small">이 주소를 아는 사람은 우리 반 보드게임에 들어올 수 있어서 깃허브 같은 공개된 곳에는 넣지 않았어요. 클래스룸·학급 게시판처럼 반 안에서만 나눠 주세요.</p>`
        : `<p>지금은 <b>💻 이 기기에만</b> 기록하고 있어요. 이 기기에서 아이들이 돌아가며 들어오면 돼요.</p><p>아이들 각자 태블릿·크롬북에서 하려면 <b>☁️ 저장</b> 탭에서 Firebase를 연결해 주세요. 그러면 여기에 반 입장 주소가 생겨요.</p>`;
      const c = $("#tlCopy"); if (c) c.onclick = () => { $("#tlUrl").select(); navigator.clipboard.writeText($("#tlUrl").value).then(() => toast("📋 복사했어요"), () => document.execCommand("copy")); };
      if (url) qrSvg(url).then(svg => {
        const q = $("#tlQr"); if (!q) return; q.innerHTML = svg;
        const big = () => { const d = document.createElement("div"); d.className = "tl-qrbig"; d.innerHTML = `<div><h2>🎲 ${esc(Store.cls.name || "우리 반")} 보드게임</h2>${svg}<p>카메라로 찍으면 우리 반 보드게임으로 들어와요 · 누르면 닫혀요</p></div>`; d.onclick = () => d.remove(); document.body.appendChild(d); };
        q.onclick = big; $("#tlBig").onclick = big;
      }).catch(() => { const q = $("#tlQr"); if (q) q.textContent = "QR을 만들지 못했어요 (인터넷 확인)"; });
    } else if (this.tcTab === "coin"){
      const R = Store.coinRule();
      body.innerHTML = `<div class="ad-sec"><h4>⚙️ 코인 규칙</h4>
          <div class="arc-row" style="justify-content:flex-start"><span style="align-self:center;min-width:130px">📅 하루 게임 코인</span><div class="arc-seg" id="tcCap" style="margin:0">${[[0, "♾️ 무제한"], [400, "400개"], [800, "800개"], [1500, "1,500개"]].map(([v, t]) => `<button data-v="${v}" class="${R.cap === v ? "on" : ""}">${t}</button>`).join("")}</div></div>
          <div class="arc-row" style="justify-content:flex-start"><span style="align-self:center;min-width:130px">🎉 코인 이벤트</span><div class="arc-seg" id="tcBoost" style="margin:0">${[1, 2, 3].map(v => `<button data-v="${v}" class="${R.boost === v ? "on" : ""}">${v === 1 ? "보통 ×1" : `${v}배 이벤트 ×${v}`}</button>`).join("")}</div></div>
          <p class="arc-small">🔥 <b>열정 보너스</b>: 오늘 많이 할수록 한 판 코인이 늘어요 — 5판째부터 ×1.2 · 10판 ×1.5 · 20판 ×2 · 40판 ×2.5 (이벤트 배율과 곱해져요). 선생님이 주는 코인·상은 한도와 상관없어요.</p></div>
        <p class="arc-small">코인과 산 아이템은 랭킹과 따로 저장돼서, 랭킹을 지우거나 앱을 고쳐도 그대로 남아요. 수업 시간에 잘한 친구는 <b>🎁 칭찬 상 주기</b> 탭에서 코인과 선생님 전용 칭호·아바타 상을 한꺼번에 줄 수 있어요.</p>
        <div class="ad-sec cg-sec"><h4>🪙 코인 주기 <small style="font:13px 'Gowun Dodum',sans-serif;color:#b9b0dd">숫자를 정하고 친구 옆 ➕를 누르면 바로 들어가요</small></h4>
          <div class="cg-bar" id="cgBar">
            <label class="cg-amt">🪙<input id="cgN" type="number" inputmode="numeric" min="1" max="100000" step="1" value="${this.cgN || 10}"><span>개</span></label>
            <div class="cg-chips">${[5, 10, 30, 50, 100, 300, 500, 1000].map(v => `<button data-q="${v}" class="${(this.cgN || 10) === v ? "on" : ""}">${v.toLocaleString()}</button>`).join("")}</div>
            <button class="arc-btn p cg-all" id="cgAll">👥 모두에게 <b id="cgAllN">+${(this.cgN || 10).toLocaleString()}</b></button>
          </div>
          <div class="arc-coins">${cls.roster.map(s => { const sid = sidOf(s.no), w = walletOf(sid); return `<div class="r" data-sid="${sid}"><span class="avf">${avHTMLof(sid, {still: true, face: true})}</span><span class="nm">${esc(who(s.no))}</span>
            <span class="cc">🪙 <b class="cv">${(w.coins || 0).toLocaleString()}</b><i class="cg-fx"></i><small>모은 코인 ${(w.total || 0).toLocaleString()} · 아이템 ${Object.keys(w.owned || {}).length}개</small></span>
            <span class="bb"><button class="arc-btn sm cg-minus" data-g="-1" title="빼기">➖</button><button class="arc-btn sm p cg-plus" data-g="1">➕ <b class="cgL">${(this.cgN || 10).toLocaleString()}</b></button></span></div>`; }).join("")}</div></div>`;
      $("#tcCap").onclick = e => { const b = e.target.closest("[data-v]"); if (b) Store.patch({coin: {cap: +b.dataset.v}}).then(() => { toast(+b.dataset.v ? `📅 하루 ${(+b.dataset.v).toLocaleString()}개까지` : "♾️ 하루 코인 무제한"); this.teacher("coin"); }); };
      $("#tcBoost").onclick = e => { const b = e.target.closest("[data-v]"); if (b) Store.patch({coin: {boost: +b.dataset.v}}).then(() => { toast(+b.dataset.v > 1 ? `🎉 코인 ${b.dataset.v}배 이벤트 시작!` : "코인 이벤트를 끝냈어요"); this.teacher("coin"); }); };
      /* 🪙 화면을 다시 그리지 않고(스크롤 그대로) 그 줄 숫자만 바꿔요 */
      const amt = () => Math.max(0, Math.min(100000, Math.floor(+$("#cgN").value || 0)));
      const setN = n => { this.cgN = n; $$("#cgBar [data-q]").forEach(b => b.classList.toggle("on", +b.dataset.q === n)); $$(".arc-coins .cgL").forEach(x => x.textContent = n.toLocaleString()); $("#cgAllN").textContent = "+" + n.toLocaleString(); };
      $("#cgN").oninput = () => setN(amt());
      $("#cgN").onkeydown = e => { if (e.key === "Enter"){ e.preventDefault(); e.target.blur(); } };
      this.coinPaint = () => $$(".arc-coins .r[data-sid]").forEach(r => { const w = walletOf(r.dataset.sid), v = r.querySelector(".cv"); if (v) v.textContent = (w.coins || 0).toLocaleString(); const sm = r.querySelector(".cc small"); if (sm) sm.textContent = `모은 코인 ${(w.total || 0).toLocaleString()} · 아이템 ${Object.keys(w.owned || {}).length}개`; });
      const fx = (r, txt, cls) => { const f = r.querySelector(".cg-fx"); if (!f) return; f.textContent = txt; f.className = "cg-fx " + cls; void f.offsetWidth; f.classList.add("go"); };
      const giveRow = async (r, n) => {
        const sid = r.dataset.sid; r.classList.add("cg-busy");
        const p = Store.give(sid, n); this.coinPaint(); fx(r, (n > 0 ? "+" : "") + n.toLocaleString(), n > 0 ? "up" : "dn");
        const ok = await p; r.classList.remove("cg-busy");
        if (ok) { r.classList.add("cg-ok"); setTimeout(() => r.classList.remove("cg-ok"), 1200); } else toast(`⚠️ ${who(noOf_(sid))} 코인 저장이 늦어지고 있어요 · 화면을 켜 두면 다시 올려요`);
      };
      body.onclick = async e => {
        const q = e.target.closest("[data-q]"); if (q){ $("#cgN").value = q.dataset.q; setN(+q.dataset.q); return; }
        const b = e.target.closest("[data-g]");
        if (b){ const n = amt(); if (!n) return toast("🪙 몇 개 줄지 숫자를 적어 주세요");
          if (n >= 5000 && !confirm(`정말 ${n.toLocaleString()}개를 ${+b.dataset.g > 0 ? "줄까요" : "뺄까요"}?`)) return;
          return giveRow(b.closest("[data-sid]"), n*(+b.dataset.g)); }
        if (e.target.closest("#cgAll")){ const n = amt(); if (!n) return toast("🪙 몇 개 줄지 숫자를 적어 주세요");
          if (!confirm(`모든 학생에게 코인 ${n.toLocaleString()}개를 줄까요?`)) return;
          const R = $$(".arc-coins .r[data-sid]"); await Promise.all(R.map(r => giveRow(r, n))); toast(`🪙 모두 +${n.toLocaleString()} 저장했어요`); }
      };
    } else if (this.tcTab === "rank"){
      body.innerHTML = `<p class="arc-small">게임별로 랭킹을 지울 수 있어요. 지우면 되돌릴 수 없어요. <b>코인과 아이템은 지워지지 않아요.</b></p><div class="arc-rkm">${GAMES.map(g => `<div><span>${g.e} ${g.n}</span><small>${board(g.id).length}명 기록</small><button class="arc-btn sm" data-reset="${g.id}">🗑️ 지우기</button></div>`).join("")}</div>
        <div class="arc-row"><button class="arc-btn" id="trAllR">🗑️ 모든 게임 랭킹 지우기</button></div>`;
      body.onclick = async e => { const b = e.target.closest("[data-reset]"); if (b && confirm(`${GAME[b.dataset.reset].n} 랭킹을 모두 지울까요?`)){ await Store.resetGame(b.dataset.reset); this.teacher("rank"); } };
      $("#trAllR").onclick = async () => { if (!confirm("모든 게임의 랭킹을 지울까요? 되돌릴 수 없어요.")) return; for (const g of GAMES) await Store.resetGame(g.id); this.teacher("rank"); };
    } else if (this.tcTab === "store"){
      body.innerHTML = `<p>지금 저장 방법: <b>${Store.mode === "cloud" ? "☁️ 반 전체 함께 (Firebase)" : "💻 이 기기에만"}</b></p>
        ${Store.mode === "local" ? `${fbHow(true)}
          <label class="arc-f">Firebase 설정 <textarea id="tsCfg" rows="5" placeholder="const firebaseConfig = { apiKey: ... };"></textarea></label>
          <div class="arc-row"><button class="arc-btn p" id="tsGo">☁️ 연결하고 기록 옮기기</button></div>`
        : `<p class="arc-small">반 정보와 랭킹이 Firebase에 저장돼요. 아이들 비밀번호는 바꿔서(암호처럼) 저장하고, 사진은 올리지 않아요.</p><textarea readonly class="arc-rules" rows="9">${esc(RULES)}</textarea>`}
        <hr><div class="arc-row"><button class="arc-btn" id="tsPin">🔑 선생님 비밀번호 바꾸기</button><button class="arc-btn" id="tsLeave">🚪 이 기기에서 보드게임 빼기</button></div>`;
      const go = $("#tsGo"); if (go) go.onclick = async () => { const cfg = parseCfg($("#tsCfg").value); if (!cfg) return alert("Firebase 설정을 찾지 못했어요."); go.disabled = true; go.textContent = "연결하는 중…";
        try { await Store.toCloud(cfg); toast("☁️ 연결했어요! 🔗 반 입장 주소를 아이들에게 알려 주세요."); this.teacher("link"); } catch(e){ go.disabled = false; go.textContent = "☁️ 연결하고 기록 옮기기"; alert("연결하지 못했어요: " + (e.message || e) + "\n(익명 로그인을 켰는지, 규칙을 게시했는지 확인해 주세요)"); } };
      $("#tsPin").onclick = async () => { const p = prompt("새 선생님 비밀번호 (숫자 4~8자리)"); if (!p) return; if (!/^\d{4,8}$/.test(p)) return alert("숫자 4~8자리로 적어 주세요."); const nc = Object.assign({}, cls, {admin: sha256(`${cls.cid}:teacher:${p}`)}); await Store.putClass(nc); toast("🔑 바꿨어요"); };
      $("#tsLeave").onclick = () => { if (!confirm(Store.mode === "cloud" ? "이 기기에서만 보드게임 연결을 빼요. (Firebase의 기록은 그대로 남아요)" : "이 기기의 보드게임 반 정보와 기록을 모두 지울까요? 되돌릴 수 없어요.")) return; ["local","join","me"].forEach(k => localStorage.removeItem(KEY + "." + k)); location.reload(); };
    }
    if (H[this.tcTab]) body.insertAdjacentHTML("afterbegin", `<h3>${H[this.tcTab]}</h3>`);
  }
};
function fbHow(open){ return `<details class="arc-how"${open ? " open" : ""}><summary>☁️ Firebase 연결 방법 (처음 한 번, 10분쯤)</summary><ol>
          <li><a href="https://console.firebase.google.com/" target="_blank" rel="noopener">Firebase 콘솔</a>에 구글 계정으로 들어가 <b>프로젝트 만들기</b> (이름 예: 우리반보드게임, 애널리틱스는 꺼도 돼요)</li>
          <li>왼쪽 <b>빌드 → Authentication → 시작하기 → 로그인 방법</b>에서 <b>익명</b>을 켜요. 같은 화면 <b>설정 → 승인된 도메인</b>에 <code>${esc(location.hostname || "kimgun124-boop.github.io")}</code>을 추가해요</li>
          <li><b>빌드 → Firestore Database → 데이터베이스 만들기</b> (위치: asia-northeast3 서울, <b>프로덕션 모드</b>)</li>
          <li>Firestore의 <b>규칙</b> 탭에 아래 규칙을 붙여 넣고 <b>게시</b>해요</li>
          <li>프로젝트 설정(⚙️) → <b>내 앱 → 웹(&lt;/&gt;)</b> 앱 추가 → 나오는 <code>const firebaseConfig = {...}</code>를 복사해 아래 칸에 붙여 넣어요</li></ol>
          <textarea readonly class="arc-rules" rows="9">${esc(RULES)}</textarea>
          </details>`; }
const RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /arcade/{cid} {
      allow read, write: if request.auth != null;
      match /{rest=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
}`;
function parseRoster(t){
  const out = [], seen = new Set();
  t.split(/\n/).map(l => l.trim()).filter(Boolean).forEach((l, i) => {
    const m = l.match(/^(\d{1,3})[.)\s,번]*\s*(.*)$/); let no = m ? +m[1] : i + 1, name = (m ? m[2] : l).trim();
    while (seen.has(no)) no++; seen.add(no); out.push({no, name: name.slice(0, 12) || `${no}번`});
  });
  return out.sort((a, b) => a.no - b.no);
}
const PKEY = cid => `${KEY}.pw.${cid}`;
function loadPlain(cid){ try { return JSON.parse(localStorage.getItem(PKEY(cid))) || {}; } catch(e) { return {}; } }
function savePlain(cid, add){ const p = Object.assign(loadPlain(cid), add); try { localStorage.setItem(PKEY(cid), JSON.stringify(p)); } catch(e) {} }
function printSlips(){
  const cls = Store.cls, plain = loadPlain(cls.cid), miss = cls.roster.filter(s => !plain[s.no]);
  if (miss.length && !confirm(`${miss.map(s => s.no).join(", ")}번은 이 기기에 비밀번호가 없어서 쪽지에 빈칸으로 나와요. 그래도 인쇄할까요? (🎲 새로 → 저장 하면 채워져요)`)) return;
  const w = window.open("", "_blank"); if (!w) return alert("팝업이 막혀 있어요. 팝업을 허용해 주세요.");
  w.document.write(`<!doctype html><meta charset="utf-8"><title>보드게임 비밀번호 쪽지</title><style>body{font-family:sans-serif;margin:10mm}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:0}.s{border:1px dashed #999;padding:12px 10px;text-align:center;page-break-inside:avoid}.s b{font-size:20px}.s .p{font-size:28px;letter-spacing:6px;font-weight:bold;margin-top:4px}.s small{color:#666}</style>
    <div class="g">${cls.roster.map(s => `<div class="s"><small>🎲 ${esc(cls.name)} 보드게임</small><div><b>${s.no}번 ${esc(s.name)}</b></div><div class="p">${plain[s.no] || "____"}</div><small>친구에게 알려 주지 마세요!</small></div>`).join("")}</div><script>setTimeout(()=>print(),300)<\/script>`);
  w.document.close();
}

/* ---- 배구: 태블릿 버튼 → 키보드 누른 것처럼 ---- */
function vpadShow(cpu){
  const p = $("#vpad"); if (cpu === null || !matchMedia("(pointer:coarse)").matches){ p.hidden = true; return; }
  p.hidden = false; p.querySelector(".r").style.display = cpu ? "none" : "";
}
(function(){
  const held = new Map();
  const send = (type, code) => window.dispatchEvent(new KeyboardEvent(type, {code, key: code, bubbles: true}));
  const pad = $("#vpad");
  pad.addEventListener("pointerdown", e => { const b = e.target.closest("[data-k]"); if (!b) return; e.preventDefault(); held.set(e.pointerId, b); b.classList.add("on"); send("keydown", b.dataset.k); try { b.setPointerCapture(e.pointerId); } catch(er) {} });
  const up = e => { const b = held.get(e.pointerId); if (!b) return; held.delete(e.pointerId); b.classList.remove("on"); send("keyup", b.dataset.k); };
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(t => pad.addEventListener(t, up));
  pad.addEventListener("contextmenu", e => e.preventDefault());
})();
window.ARC = ARC;   // 가져온 게임들이 window.ARC 로 찾아요
