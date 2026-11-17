/* =====================================================================
   🐾 동물 랜덤 디펜스 — 동물 친구를 뽑고, 같은 친구 3마리를 합쳐 더 센 동물로!
   - 빙글빙글 도는 길을 따라 오는 몬스터를 동물들이 막아요. 몬스터가 너무 많이 쌓이면 끝!
   - 1000단계 (100단계마다 🌀 차원 · 10단계마다 맵이 바뀌고 👑 보스, 5단계마다 😈 중간 보스)
   - 등급 5개: ⚪ 일반 → 🔵 희귀 → 🟣 영웅 → 🟡 전설 → 🌈 신화 · 동물 18종
   - 함께하기: 한 기기에서 둘이 / 🌐 온라인 방 각자 기기 최대 4명 (같은 길을 함께 지켜요)
   ⚡ 렉 줄이기: 판(길·칸·꾸미기)은 한 장으로 미리 그려 두고, 동물·몬스터·총알은 한 번 그린 그림을 붙여요.
      친구 기기는 손가락(뽑기·합치기…)만 보내고, 공격 모습은 자기 기기에서 그려요.
   ===================================================================== */
const RD_G = [
  {n: "일반", c: "#adb5bd", c2: "#e9ecef", sell: 8},
  {n: "희귀", c: "#4dabf7", c2: "#d0ebff", sell: 25},
  {n: "영웅", c: "#9775fa", c2: "#e5dbff", sell: 70},
  {n: "전설", c: "#fcc419", c2: "#fff3bf", sell: 180},
  {n: "신화", c: "#ff6b9a", c2: "#ffe3ec", sell: 450},
  {n: "초월", c: "#22d3ee", c2: "#cffafe", sell: 1100},
  {n: "불멸", c: "#f97316", c2: "#ffedd5", sell: 2600},
  {n: "태초", c: "#fde047", c2: "#fefce8", sell: 6000}
];
const RD_MAXG = RD_G.length - 1;
const RD_TT = [null,
  {e: "🛡️", t: "🛡️ 단단한 몬스터 등장!", s: "원거리 공격은 절반만 · 근거리 동물이 +20% 더 세게 때려요"},
  {e: "🦇", t: "🦇 날개 달린 몬스터 등장!", s: "근거리 동물은 못 때려요 → 원거리·지원 동물을 꼭 섞어요"},
  {e: "👻", t: "👻 유령 몬스터 등장!", s: "근거리·원거리는 약하게 · ✨ 지원 동물이 아주 세게 때려요"},
  {e: "🔰", t: "🔰 방패 몬스터 등장!", s: "처음 몇 번은 막아요 → 빠르게 여러 번 때리는 동물이 좋아요"},
  {e: "💚", t: "💚 재생 몬스터 등장!", s: "체력이 다시 차요 → 🔥 불태우기 동물이 있으면 회복을 막아요"},
  {e: "💨", t: "💨 질주 몬스터 등장!", s: "엄청 빨라요 → 🐸🐧🐋 느리게·얼리는 동물을 길목에 두어요"}];   // 🌈 신화 위로 💠 초월 → 🔥 불멸 → 🌟 태초 (같은 등급 3마리 합치기)
/* 동물: 등급 · 공격력 · 쉬는 시간(장면) · 거리(칸) · 특기 */
const RD_A = {
  mouse:   {e: "🐭", n: "쥐",       g: 0, d: 7,    cd: 28, r: 2.1, t: "빠른 공격"},
  rabbit:  {e: "🐰", n: "토끼",     g: 0, d: 16,   cd: 56, r: 2.4, cr: .12, t: "가끔 세게"},
  chick:   {e: "🐥", n: "병아리",   g: 0, d: 9,    cd: 58, r: 2.0, sp: .8, t: "여러 마리"},
  frog:    {e: "🐸", n: "개구리",   g: 0, d: 6,    cd: 48, r: 2.2, sl: .3, t: "느리게"},
  dog:     {e: "🐶", n: "강아지",   g: 1, d: 28,   cd: 28, r: 2.3, t: "빠른 공격"},
  cat:     {e: "🐱", n: "고양이",   g: 1, d: 50,   cd: 54, r: 2.4, cr: .25, t: "치명타 냥!"},
  penguin: {e: "🐧", n: "펭귄",     g: 1, d: 20,   cd: 50, r: 2.3, sp: .7, sl: .45, t: "얼음 느리게"},
  hedgehog:{e: "🦔", n: "고슴도치", g: 1, d: 26,   cd: 54, r: 2.0, sp: 1.0, t: "가시 펑"},
  fox:     {e: "🦊", n: "여우",     g: 2, d: 72,   cd: 40, r: 2.6, mt: 3, t: "3마리 동시"},
  panda:   {e: "🐼", n: "판다",     g: 2, d: 150,  cd: 70, r: 2.2, sp: .9, st: .2, t: "기절 쿵"},
  owl:     {e: "🦉", n: "부엉이",   g: 2, d: 125,  cd: 50, r: 3.8, cr: .15, t: "멀리 쏘기"},
  croc:    {e: "🐊", n: "악어",     g: 2, d: 95,   cd: 46, r: 2.2, sp: 1.1, t: "꽉 물기"},
  lion:    {e: "🦁", n: "사자",     g: 3, d: 380,  cd: 56, r: 2.8, sp: 1.4, t: "우렁찬 포효"},
  tiger:   {e: "🐯", n: "호랑이",   g: 3, d: 250,  cd: 28, r: 2.6, cr: .3, t: "번개 할퀴기"},
  whale:   {e: "🐳", n: "고래",     g: 3, d: 210,  cd: 60, r: 3.0, sp: 1.6, sl: .5, t: "물대포"},
  eagle:   {e: "🦅", n: "독수리",   g: 3, d: 300,  cd: 40, r: 5.2, mt: 2, t: "하늘에서 콕"},
  dragon:  {e: "🐲", n: "용",       g: 4, d: 1400, cd: 50, r: 3.3, sp: 1.9, t: "불꽃 숨결"},
  unicorn: {e: "🦄", n: "유니콘",   g: 4, d: 900,  cd: 34, r: 3.0, mt: 4, bf: .25, t: "옆 친구 힘 UP"},
  trex:    {e: "🦖", n: "티라노",   g: 4, d: 2600, cd: 80, r: 2.5, sp: 1.3, st: .15, t: "쿵쿵 짓밟기"},
  /* 💠 초월 */
  phoenix: {e: "🐦", n: "불사조",       g: 5, d: 5200,  cd: 44, r: 3.6, sp: 1.6, burn: .25, t: "불꽃 날개 · 불태우기"},
  kirin:   {e: "🦌", n: "기린 신수",    g: 5, d: 2800,  cd: 30, r: 3.2, mt: 5, bf: .4, t: "옆 친구 힘 +40%"},
  levi:    {e: "🐋", n: "리바이어던",   g: 5, d: 4200,  cd: 58, r: 3.4, sp: 2.0, sl: .55, t: "대해일"},
  /* 🔥 불멸 */
  bdragon: {e: "🐉", n: "흑룡",         g: 6, d: 16000, cd: 50, r: 3.8, sp: 2.2, t: "흑염 · 맵 전체"},
  wtiger:  {e: "🐅", n: "백호",         g: 6, d: 11000, cd: 22, r: 2.8, cr: .35, chain: 3, t: "번개가 튕겨요"},
  nine:    {e: "🦊", n: "구미호",       g: 6, d: 9000,  cd: 34, r: 3.6, mt: 9, t: "구슬 9개"},
  /* 🌟 태초 */
  gdragon: {e: "🌟", n: "황룡",         g: 7, d: 52000, cd: 52, r: 4.2, sp: 2.4, burn: .3, t: "천지개벽"},
  pegasus: {e: "🦄", n: "천마",         g: 7, d: 20000, cd: 26, r: 3.6, mt: 6, bf: .6, t: "모두에게 축복"},
  titan:   {e: "🦕", n: "거신 티라노",  g: 7, d: 70000, cd: 70, r: 2.8, sp: 1.8, st: .25, t: "대지 분쇄"}
};
const RD_K = Object.keys(RD_A), RD_BY = RD_G.map((_, g) => RD_K.filter(k => RD_A[k].g === g));
/* 맵 10곳 (10단계마다) */
const RD_TH = [
  {n: "🌼 꽃밭",     sky: "linear-gradient(#74c0fc,#c5f6fa 60%,#d3f9d8)", gr: ["#8ce99a", "#69db7c"], pa: ["#f2d398", "#d9b072"], sl: ["#69db7c", "#2b8a3e"], ey: "#1b1233", deco: "🌼🌷🌸🦋"},
  {n: "🍄 버섯 숲",  sky: "linear-gradient(#2f9e44,#94d82d 70%,#d8f5a2)", gr: ["#74b816", "#5c940d"], pa: ["#c9a46b", "#a07c44"], sl: ["#ff8787", "#c92a2a"], ey: "#1b1233", deco: "🍄🌲🌿🍀"},
  {n: "🏖️ 바닷가",   sky: "linear-gradient(#339af0,#74c0fc 55%,#fff3bf)", gr: ["#ffec99", "#ffe066"], pa: ["#74c0fc", "#4dabf7"], sl: ["#ff922b", "#d9480f"], ey: "#1b1233", deco: "🐚🌴⛱️🦀"},
  {n: "🏜️ 사막",     sky: "linear-gradient(#ff922b,#ffd8a8 60%,#fff4e6)", gr: ["#ffd8a8", "#ffc078"], pa: ["#e8a33d", "#c98a2f"], sl: ["#be4bdb", "#862e9c"], ey: "#fff", deco: "🌵🏺🐫☀️"},
  {n: "🌋 화산",     sky: "linear-gradient(#1a0505,#5c1a0b 60%,#d9480f)", gr: ["#5c3a3a", "#3d2626"], pa: ["#ff922b", "#e8590c"], sl: ["#495057", "#1b1b1b"], ey: "#ffa94d", deco: "🔥🌋🪨💥"},
  {n: "❄️ 빙하",     sky: "linear-gradient(#1c3d8f,#74c0fc 60%,#e7f5ff)", gr: ["#e7f5ff", "#d0ebff"], pa: ["#91a7ff", "#748ffc"], sl: ["#66d9e8", "#0c8599"], ey: "#1b1233", deco: "⛄❄️🧊🌨️"},
  {n: "🌙 밤의 숲",   sky: "linear-gradient(#0b0b2b,#2b2f77 65%,#5f3dc4)", gr: ["#364fc7", "#2b3a8f"], pa: ["#7048e8", "#5f3dc4"], sl: ["#f1f3f5", "#adb5bd"], ey: "#1b1233", deco: "🌙🕯️🌲⭐"},
  {n: "🍭 과자 나라", sky: "linear-gradient(#f783ac,#ffdeeb 60%,#fff0f6)", gr: ["#ffdeeb", "#fcc2d7"], pa: ["#ffec99", "#ffd43b"], sl: ["#cc5de8", "#862e9c"], ey: "#fff", deco: "🍭🍩🧁🍬"},
  {n: "🌌 우주",     sky: "radial-gradient(circle at 70% 20%,#7048e8,#1c1d52 55%,#05051a)", gr: ["#1c1d52", "#25286b"], pa: ["#4c6ef5", "#364fc7"], sl: ["#8ce99a", "#2b8a3e"], ey: "#1b1233", deco: "🪐⭐🛸☄️"},
  {n: "👑 마왕성",   sky: "linear-gradient(#120208,#3b0a1a 60%,#862e9c)", gr: ["#2b2b33", "#1f1f26"], pa: ["#862e9c", "#5f3dc4"], sl: ["#e03131", "#7d1010"], ey: "#ffe066", deco: "🕯️👑🗝️🦇"}
];
const RD_MC = document.createElement("canvas").getContext("2d");
const rdMeasure = (p, fs) => { RD_MC.font = `${fs}px "Jua",sans-serif`; return RD_MC.measureText(p).width + Math.max(4, fs*.18); };
const RD_BG = {url: null};
const RD_PC = ["#ff922b", "#4dabf7", "#51cf66", "#f783ac", "#fcc419", "#9775fa"];
/* 큰 수는 만·억·조·경·해로 줄여서 보여 줘요 (1000단계까지 가면 숫자가 아주 커져요) */
const rdN = v => { v = Math.floor(v || 0); if (v < 1e5) return String(v); for (const [d, u] of [[1e20, "해"], [1e16, "경"], [1e12, "조"], [1e8, "억"], [1e4, "만"]]) if (v >= d){ const q = v/d; return (q >= 100 ? Math.floor(q) : (Math.floor(q*10)/10)) + u; } return String(v); };
const RD_END = 1000;   // 🏆 1000단계 보스를 잡으면 정복!

const RD_EMO = ["👍", "😂", "😍", "😱", "🔥", "👏", "❤️", "😭", "🙏", "🎉", "여기 도와줘!", "보스 온다!", "고마워!", "합치자!", "잘했어!", "조심해!", "내가 막을게!", "금 모으자!"];
(() => { const st = document.createElement("style"); st.textContent = `
.rd-emo{position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:460;width:min(560px,94vw);background:rgba(20,14,48,.96);border:1px solid rgba(255,255,255,.14);border-radius:20px;padding:10px 10px 12px;box-shadow:0 12px 40px rgba(0,0,0,.5);font-family:"Jua",sans-serif;color:#fff;animation:rdEmoIn .18s ease-out}
.rd-emo[hidden]{display:none}
@keyframes rdEmoIn{from{transform:translate(-50%,16px);opacity:0}to{transform:translateX(-50%);opacity:1}}
.rd-emo .h{display:flex;align-items:center;gap:8px;font-size:16px;padding:0 4px 8px}
.rd-emo .h small{flex:1;font:12px "Gowun Dodum",sans-serif;color:#b9b0dd}
.rd-emo .h button{width:32px;height:32px;border-radius:50%;border:0;background:rgba(255,255,255,.1);color:#fff;font-size:15px;cursor:pointer}
.rd-emo .l{display:flex;flex-wrap:wrap;gap:6px}
.rd-emo .l button{font:15px "Jua",sans-serif;color:#2b1d5c;background:#fff;border:0;border-radius:999px;padding:8px 13px;cursor:pointer;box-shadow:0 3px 0 rgba(0,0,0,.25)}
.rd-emo .l button.e{font-size:24px;padding:4px 9px;background:rgba(255,255,255,.12);box-shadow:none}
.rd-emo .l button:active{transform:scale(.92)}`; document.head.appendChild(st); })();

NG.defs.rd = () => {
  const O = NG.opt || {}, SIDS = NG.sids.slice(0, 6), N = SIDS.length;
  const party = O.party || null, myIdx = party === "guest" ? O.idx : 0;
  const local = party === "guest" ? [O.idx] : (O.local || [0]).slice(0, 2);
  const remote = i => party === "host" && O.remote && O.remote[i] != null;
  const ZS = 18, LIMIT0 = 100 + 40*(N - 1);
  let LIMIT = LIMIT0;   // 🛡️ 수호 방패 · 💥 유리 대포 유물로 바뀌어요
  let W = 1280, H = 720, land = true, C = 90, BX = 0, BY = 0, COLS = 8, ROWS = 5, GC = 1, TOPH = 70, BOTH = 120, ZO = [], LN = [], CELL = new Map(), MAPI = -1, lastSW = 1280, lastSH = 720, layer = null, layerKey = "", SH = null;   // SH: 🤝 같이 하기 공동 맵
  let Z, PS, E, PR, FX, MS, wave, waveT, spawnLeft, spawnT, state, overT, score, kills, bossK, eid, gv, speed, banner, sel, drag, ptr, panel, NQ, outbox, aseq, lastAct, sndT, ended, seed, bossTimer, frame;
  const R = (() => { let s = 1; return {seed(v){ s = (v >>> 0) || 1; }, get(){ return s; }, f(){ s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s/4294967296; }}; })();
  const th = () => RD_TH[Math.floor((Math.max(1, wave) - 1)/10) % 10];
  const dimOf = w => Math.floor((Math.max(1, w) - 1)/100) + 1;   // 🌀 100단계마다 한 차원씩 (10차원 = 1000단계)
  /* 30단계부터는 조금 덜 가파르게 (예전엔 40단계에서 다 막혔어요) — 대신 🎁 유물·🎒 아이템으로 강해져요 */
  /* 🏔️ 1000단계까지: 처음엔 가파르게, 갈수록 완만하게 — 대신 💰 금도 단계마다 늘고 ⬆️ 강화는 끝없이 올라가요 */
  const hpAt = w => 15*Math.pow(1.19, Math.min(w, 30) - 1)*Math.pow(1.16, Math.min(30, Math.max(0, w - 30)))*Math.pow(1.09, Math.min(90, Math.max(0, w - 60)))
    *Math.pow(1.045, Math.min(150, Math.max(0, w - 150)))*Math.pow(1.02, Math.max(0, w - 300))*(SH ? 1 + .25*(N - 1) : 1);
  const gmul = () => Math.pow(1.025, Math.max(0, wave - 60));
  /* 🎁 유물 · 🎒 아이템 */
  const RL = (z, k) => (Z[z] && Z[z].rel && Z[z].rel[k]) || 0;
  /* 🔬 동물 연구소(코인으로 영원히 키우는 능력) — 판마다 지갑에서 읽어 두고 써요 */
  const PK = z => (Z[z] && Z[z].pk) || RDP.perk(SIDS[z]);
  const bagN = z => 3 + 2*RL(z, "bag") + (PK(z).bag || 0);
  const slowAll = () => Math.min(.3, Z.reduce((a, p) => a + ((p.rel && p.rel.slow) || 0), 0)*.1);
  const relMul = (z, A, e) => (1 + .04*(PK(z).atk || 0))*(1 + .3*RL(z, "atk"))*(A.g < 2 ? 1 + .6*RL(z, "low") : 1)*(A.g >= 3 ? 1 + .4*RL(z, "top") : 1)*(A.g >= 4 ? 1 + .6*RL(z, "myth") : 1)*(Z[z].fev > 0 ? 2 : 1)*(e && (e.kind === 1 || e.kind === 2) ? 1 + .6*RL(z, "boss") : 1)
    *(A.ro === "m" ? 1 + .5*RL(z, "melee") : A.ro === "r" ? 1 + .5*RL(z, "ranged") : 1 + .8*RL(z, "support"))*(1 + .7*RL(z, "glass"))
    *(e && e.tt === 1 ? (A.ro === "r" ? .5 : 1.2) : 1)*(e && e.tt === 3 ? (A.ro === "s" ? 1.8 : .6) : 1);   // 🛡️ 단단한 몬스터는 원거리 반감·근거리 +20% · 👻 유령은 지원 동물이 잘 잡아요
  const rndItem = () => RD_IK[Math.floor(R.f()*RD_IK.length)];
  function giveItem(z, k){ const p = Z[z]; if (!p) return false; if (p.it.length >= bagN(z)){ toastZ(z, `🎒 가방이 꽉 차서 ${RD_IT[k].e}${RD_IT[k].n}을(를) 못 담았어요`); return false; } p.it.push(k); gv++; return true; }
  function relPick(){ const L = RD_RK.slice(), out = []; while (out.length < 3 && L.length){ out.push(L.splice(Math.floor(R.f()*L.length), 1)[0]); } return out; }
  function offerRel(z){ const p = Z[z]; if (p.pick) takeRel(z, 0, true); const L = relPick().filter(k => !RD_REL[k].max || RL(z, k) < RD_REL[k].max); while (L.length < 3){ const k = RD_RK[Math.floor(R.f()*RD_RK.length)]; if (!RD_REL[k].max) L.push(k); } p.pick = L.slice(0, 3); gv++; }
  function takeRel(z, j, quiet){ const p = Z[z]; if (!p.pick) return; const k = p.pick[j] || p.pick[0]; p.pick = null; p.rel[k] = (p.rel[k] || 0) + 1;
    if (k === "bag"){ giveItem(z, rndItem()); giveItem(z, rndItem()); }
    calcLimit();
    if (!quiet){ sfx("big", z); toastZ(z, `${RD_REL[k].e} ${RD_REL[k].n} Lv.${p.rel[k]}! ${RD_REL[k].d}`); } gv++; }
  const isMine = z => local.includes(z);
  function calcLimit(){ let gu = 0, gl = 0; Z.forEach((p, z) => { gu += RL(z, "guard"); gl += RL(z, "glass"); }); LIMIT = Math.max(40, LIMIT0 + 25*gu - 15*gl); }
  const sp = (k, w, h, fn) => G2.spr("rd" + k, w, h, fn);

  /* ---------- 소리 ---------- */
  function playS(k){
    if (k === "sum") { tone(520, 880, .09, "triangle", .08); tone(880, 1320, .08, "sine", .06, .06); }
    else if (k === "merge") [523, 659, 784, 1046].forEach((f, i) => tone(f, f*1.01, .1, "triangle", .09, i*.06));
    else if (k === "big") { [392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f, .14, "square", .07, i*.07)); }
    else if (k === "sell") tone(900, 500, .1, "square", .05);
    else if (k === "up") tone(600, 1200, .16, "sawtooth", .05);
    else if (k === "no") tone(220, 160, .14, "square", .06);
    else if (k === "wave") [660, 880].forEach((f, i) => tone(f, f, .1, "triangle", .08, i*.1));
    else if (k === "boss") [0, .3, .6].forEach(d => tone(220, 160, .25, "sawtooth", .08, d));
    else if (k === "kboss") SFX.rec();
    else if (k === "fail") tone(300, 120, .3, "triangle", .08);
    else if (k === "warn") tone(880, 880, .06, "square", .05);
  }
  const sfx = (k, z) => { if (z == null || isMine(z)) playS(k); if (party === "host") NQ.push(["s", k, z == null ? -1 : z]); };

  /* ---------- 판 배치 (가로·세로 · 사람 수) ---------- */
  function layout(sw, sh){
    land = sw/Math.max(1, sh) >= 1.05;
    const two = local.length >= 2;
    if (land){ W = 1280; H = 720; TOPH = 62; BOTH = 112; GC = N === 1 ? 1 : 2; }
    else { W = 720; H = Math.round(Math.max(1120, Math.min(1500, W*sh/Math.max(1, sw)))); TOPH = 70; BOTH = two ? 250 : 220; GC = 1; }
    if (window.VK_ON) BOTH = two && !land ? 120 : 64;   // ⌨️ 화면 키보드가 있으면 아래 단추 대신 금·보석만
    /* 🗺️ 맵: 혼자면 길 한 바퀴와 동물 자리 18칸(10단계마다 모양이 바뀌어요) · 같이 하면 🌀 문 하나 · 큰 길 하나를 친구마다 자기 자리(18칸)에서 함께 지켜요 */
    lastSW = sw; lastSH = sh;
    const ti = Math.floor((Math.max(1, wave || 1) - 1)/10) % 10; MAPI = ti;
    if (N >= 2){   // 🤝 같이 하기: 한 길 · 한 문, 친구마다 자기 자리
      const CM = N >= 5 ? RD_CO6S : N >= 3 ? RD_CO4S : RD_CO2S, TP = rdParseCo(CM[ti % CM.length], !land, N); GC = 1;   /* 10단계마다 맵 모양도 바뀌어요 */ COLS = TP.w; ROWS = TP.h;
      const aw = W - 16, ah = H - TOPH - BOTH - 44;
      C = Math.floor(Math.min(112, aw/COLS, ah/ROWS)); BX = Math.round((W - COLS*C)/2); BY = Math.round(TOPH + 34 + (ah - ROWS*C)/2);
      const path = TP.path.map(([x, y]) => [x + .5, y + .5]);
      SH = {ox: 0, oy: 0, w: TP.w, h: TP.h, map: TP, path, front: TP.front};
      LN = []; CELL = new Map(); ZO = [];
      TP.zones.forEach((Zn, z) => { const [x0, y0, x1, y1] = Zn.box; ZO.push([x0, y0]);
        const L = {ox: x0, oy: y0, w: x1 - x0, h: y1 - y0, map: TP, path, slots: Zn.slots.map(([x, y]) => [x + .5, y + .5]), front: Zn.front};
        L.slots.forEach(([x, y], s) => CELL.set(Math.floor(x) + "," + Math.floor(y), {z, i: s})); LN.push(L); });
      layerKey = ""; panel = null; return;
    }
    SH = null;
    const M = N >= 3 ? RD_RING8 : RD_MAPS[ti % RD_MAPS.length], TP = rdParse(M, !land && N === 1);
    if (N >= 3) GC = 2; else if (N === 2) GC = land ? 2 : 1;
    const GR = Math.ceil(N/GC); COLS = GC*TP.w; ROWS = GR*TP.h;
    const aw = W - 16, ah = H - TOPH - BOTH - 44;   // 위쪽 미션 줄 자리를 비워요
    C = Math.floor(Math.min(112, aw/COLS, ah/ROWS)); BX = Math.round((W - COLS*C)/2); BY = Math.round(TOPH + 34 + (ah - ROWS*C)/2);
    LN = []; CELL = new Map(); ZO = [];
    for (let z = 0; z < N; z++){ const ox = (z % GC)*TP.w, oy = Math.floor(z/GC)*TP.h; ZO.push([ox, oy]);
      const L = {ox, oy, w: TP.w, h: TP.h, map: TP, path: TP.path.map(([x, y]) => [ox + x + .5, oy + y + .5]), slots: TP.slots.map(([x, y]) => [ox + x + .5, oy + y + .5]), front: TP.front};
      L.slots.forEach(([x, y], s) => CELL.set(Math.floor(x) + "," + Math.floor(y), {z, i: s})); LN.push(L); }
    layerKey = ""; panel = null;
  }
  const plOf = l => (LN[l] || LN[0]).path.length;
  function posAt(d, l){ const P = (LN[l || 0] || LN[0]).path, n = P.length; d = ((d % n) + n) % n; const i = Math.floor(d), f = d - i, a = P[i], b = P[(i + 1) % n]; return [a[0] + (b[0] - a[0])*f, a[1] + (b[1] - a[1])*f]; }
  /* 맵이 바뀌면(10단계마다) 길·자리를 다시 만들어요 */
  function remap(){ const ti = Math.min(9, Math.floor((Math.max(1, wave) - 1)/10)); if (ti !== MAPI) layout(lastSW, lastSH); }
  const cx = c => BX + c*C, cy = r => BY + r*C;
  const slotXY = (z, s) => LN[z] ? LN[z].slots[s] : [0, 0];
  const isFront = (z, s) => LN[z] ? LN[z].front[s] : true;
  const UOFF = [[[0, -.04]], [[-.21, 0], [.21, 0]], [[0, -.2], [-.22, .13], [.22, .13]]];

  /* ---------- 그림 ---------- */
  function buildLayer(){
    const key = `${th().n}|${W}|${H}|${C}|${N}|${MAPI}`; if (key === layerKey && layer) return; layerKey = key;
    const k = NG.k || 1; layer = layer || document.createElement("canvas"); layer.width = Math.ceil(COLS*C*k); layer.height = Math.ceil(ROWS*C*k);
    const t = layer.getContext("2d"); t.setTransform(k, 0, 0, k, 0, 0); t.clearRect(0, 0, layer.width, layer.height);
    const T = th(), ti = Math.min(9, Math.floor((Math.max(1, wave) - 1)/10)), TP = RD_TOP[ti], rr = BSA.rng(7 + ti*13), dep = C*.26;
    (SH ? [SH] : LN).forEach((L, z) => {
      const x0 = L.ox*C + 3, y0 = L.oy*C + 3, ww = L.w*C - 6, hh = L.h*C - 6 - dep*.6, col = RD_PC[z], cell = (x, y) => [(L.ox + x)*C, (L.oy + y)*C];
      /* 🏔️ 섬 덩어리 (그림자 → 절벽 옆면 → 윗면) */
      t.fillStyle = "rgba(0,0,0,.3)"; rrect(t, x0 + 6, y0 + dep + 10, ww, hh, C*.4); t.fill();
      t.fillStyle = BSA.lg(t, 0, y0 + hh - C*.2, 0, y0 + hh + dep, [[0, TP.side[0]], [1, TP.side[1]]]); rrect(t, x0, y0 + dep, ww, hh, C*.4); t.fill();
      t.save(); rrect(t, x0, y0 + dep, ww, hh, C*.4); t.clip();
      for (let x = x0; x < x0 + ww; x += C*.42){ t.fillStyle = "rgba(0,0,0,.13)"; t.fillRect(x, y0 + hh - 4, C*.16, dep + 8); t.fillStyle = "rgba(255,255,255,.08)"; t.fillRect(x + C*.2, y0 + hh + dep*.35, C*.12, dep*.3); }
      t.restore();
      t.fillStyle = BSA.lg(t, 0, y0, 0, y0 + hh, [[0, TP.top[0]], [1, TP.top[1]]]); rrect(t, x0, y0, ww, hh, C*.4); t.fill();
      // 윗면 빛 얼룩 · 풀 무늬
      t.save(); rrect(t, x0, y0, ww, hh, C*.4); t.clip();
      for (let i = 0; i < L.w*L.h*.8; i++){ const x = x0 + rr()*ww, y = y0 + rr()*hh, r = C*(.4 + rr()*.7); t.fillStyle = rr() < .5 ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.05)"; t.beginPath(); t.ellipse(x, y, r, r*.6, 0, 0, 7); t.fill(); }
      for (let i = 0; i < L.w*L.h*5; i++){ const x = x0 + rr()*ww, y = y0 + rr()*hh, s2 = C*(.05 + rr()*.05);
        if (rr() < .16){ t.fillStyle = TP.dot[Math.floor(rr()*TP.dot.length)]; t.globalAlpha = .8; t.beginPath(); t.arc(x, y, s2*.45, 0, 7); t.fill(); t.globalAlpha = 1; continue; }
        t.strokeStyle = TP.tuft; t.lineWidth = 2; t.lineCap = "round"; t.beginPath(); t.moveTo(x - s2*.6, y - s2*.9); t.lineTo(x, y); t.lineTo(x + s2*.6, y - s2*.9); t.moveTo(x, y); t.lineTo(x, y - s2*1.1); t.stroke(); }
      t.restore();
      t.strokeStyle = "rgba(255,255,255,.5)"; t.lineWidth = 3; t.beginPath(); t.moveTo(x0 + C*.4, y0 + 2); t.lineTo(x0 + ww - C*.4, y0 + 2); t.stroke();
      if (N > 1 && !SH){ t.strokeStyle = col; t.lineWidth = 4; t.globalAlpha = .85; rrect(t, x0, y0, ww, hh, C*.4); t.stroke(); t.globalAlpha = 1; }
      /* 🧱 몬스터 길: 두꺼운 테두리 → 길 바닥 → 돌판 */
      const P = L.path.map(([x, y]) => [x*C, y*C]), loop = g2 => { g2.beginPath(); P.forEach(([x, y], i) => i ? g2.lineTo(x, y) : g2.moveTo(x, y)); g2.closePath(); };
      t.lineJoin = "round"; t.lineCap = "round";
      t.save(); t.translate(0, C*.07); loop(t); t.strokeStyle = "rgba(0,0,0,.28)"; t.lineWidth = C*.98; t.stroke(); t.restore();
      loop(t); t.strokeStyle = TP.side[0]; t.lineWidth = C*.98; t.stroke();
      loop(t); t.strokeStyle = T.pa[1]; t.lineWidth = C*.86; t.stroke();
      loop(t); t.strokeStyle = T.pa[0]; t.lineWidth = C*.72; t.stroke();
      L.path.forEach(([px, py], d) => { const x = px*C, y = py*C;
        for (let q = 0; q < 3; q++){ const a = rr()*6.28, r = C*(.12 + rr()*.16), ex = x + Math.cos(a)*r, ey = y + Math.sin(a)*r, s2 = C*(.1 + rr()*.07);
          t.fillStyle = "rgba(0,0,0,.12)"; t.beginPath(); t.ellipse(ex, ey + 2, s2, s2*.7, 0, 0, 7); t.fill();
          t.fillStyle = "rgba(255,255,255,.3)"; t.beginPath(); t.ellipse(ex, ey, s2, s2*.7, 0, 0, 7); t.fill(); } });
      // 길 화살표 (몬스터가 가는 쪽)
      t.fillStyle = "rgba(255,255,255,.55)";
      for (let d = 1; d < P.length; d += 3){ const a = P[d], b = P[(d + 1) % P.length], an = Math.atan2(b[1] - a[1], b[0] - a[0]);
        t.save(); t.translate((a[0] + b[0])/2, (a[1] + b[1])/2); t.rotate(an); t.beginPath(); t.moveTo(C*.13, 0); t.lineTo(-C*.07, -C*.11); t.lineTo(-C*.07, C*.11); t.closePath(); t.fill(); t.restore(); }
      /* 🌳 꾸미기 칸 (나무·바위·꽃) */
      L.map.deco.forEach(([dx, dy], i) => { const [x, y] = cell(dx, dy), r = rr(); if (L.map.house && L.map.house[0] === dx && L.map.house[1] === dy) return;
        if (r < .42) RDA.prop(t, ti, x + C*.5, y + C*.62, C*(.68 + rr()*.18), i + z);
        else if (r < .7){ t.fillStyle = "rgba(0,0,0,.18)"; t.beginPath(); t.ellipse(x + C*.5, y + C*.72, C*.26, C*.08, 0, 0, 7); t.fill();
          t.fillStyle = BSA.lg(t, 0, y + C*.4, 0, y + C*.75, [[0, "#ced4da"], [1, "#868e96"]]); t.beginPath(); t.ellipse(x + C*.5, y + C*.6, C*.24, C*.16, 0, 0, 7); t.fill(); RDA.ol(t, 2);
          t.fillStyle = "rgba(255,255,255,.5)"; t.beginPath(); t.ellipse(x + C*.43, y + C*.53, C*.08, C*.04, -.4, 0, 7); t.fill(); }
        else for (let f = 0; f < 4; f++){ const fx = x + C*(.2 + rr()*.6), fy = y + C*(.3 + rr()*.5); t.fillStyle = TP.dot[f % TP.dot.length]; for (let pe = 0; pe < 5; pe++){ t.beginPath(); t.arc(fx + Math.cos(pe*1.26)*C*.045, fy + Math.sin(pe*1.26)*C*.045, C*.035, 0, 7); t.fill(); } t.fillStyle = "#fff3bf"; t.beginPath(); t.arc(fx, fy, C*.025, 0, 7); t.fill(); } });
      /* 🤝 친구마다 자기 자리: 색깔 마당 */
      if (SH) LN.forEach((Lz, zz) => { const c = RD_PC[zz], x = Lz.ox*C + C*.05, y = Lz.oy*C + C*.05, w = Lz.w*C - C*.1, h = Lz.h*C - C*.1;
        t.globalAlpha = .22; t.fillStyle = c; rrect(t, x, y, w, h, C*.3); t.fill(); t.globalAlpha = .9; t.strokeStyle = c; t.lineWidth = 3.5; t.setLineDash([C*.18, C*.1]); t.stroke(); t.setLineDash([]); t.globalAlpha = 1; });
      /* 🪨 동물 자리: 입체 받침돌 (앞줄 ⚔️ 따뜻한 테두리 · 뒷줄 🏹 시원한 테두리) */
      L.map.slots.forEach(([sx, sy], s) => { const [x, y] = cell(sx, sy), fr = L.front[s];
        t.fillStyle = "rgba(0,0,0,.22)"; rrect(t, x + C*.08, y + C*.2, C*.86, C*.8, C*.22); t.fill();
        t.fillStyle = TP.slot[2]; rrect(t, x + C*.06, y + C*.14, C*.88, C*.8, C*.22); t.fill();
        t.fillStyle = BSA.lg(t, 0, y + C*.03, 0, y + C*.83, [[0, TP.slot[0]], [1, TP.slot[1]]]); rrect(t, x + C*.06, y + C*.03, C*.88, C*.8, C*.22); t.fill();
        t.strokeStyle = fr ? "rgba(255,135,135,.85)" : "rgba(116,192,252,.85)"; t.lineWidth = 2.5; rrect(t, x + C*.08, y + C*.05, C*.84, C*.76, C*.2); t.stroke();
        t.strokeStyle = "rgba(255,255,255,.6)"; t.lineWidth = 2; t.beginPath(); t.moveTo(x + C*.24, y + C*.07); t.lineTo(x + C*.76, y + C*.07); t.stroke();
        t.globalAlpha = .28; G2.emo(t, fr ? "⚔️" : "🏹", x + C*.5, y + C*.45, C*.34); t.globalAlpha = 1; });
      /* 🏡 지켜야 하는 동물 마을 · 👾 몬스터 문 */
      if (L.map.house){ const [x, y] = cell(L.map.house[0], L.map.house[1]); RDA.house(t, x + C*.5, y + C*.55, C*1.0, ti); }
      RDA.portal(t, P[0][0], P[0][1], C*.8);
    });
  }
  const unitSpr = (k, s) => RDA.unitSpr(k, s);   // 🎨 직접 그린 동물 (rdart.js)
  function slimeSpr(kind, f){ const T = th(), ti = Math.min(9, Math.floor((Math.max(1, wave) - 1)/10)), s = Math.round(kind === 2 ? C*1.3 : kind === 1 ? C*.88 : kind === 4 ? C*.86 : kind === 3 ? C*.66 : C*.62);   // 그릴 크기 그대로 (늘이기 없이)
    return sp(`sl2${ti}${kind}${f}${s}`, s, s, t => kind === 3 ? RDA.gold(t, s, f) : kind === 4 ? RDA.chest(t, s, f) : RDA.slime(t, s, kind, f, T, ti)); }
  const novaSpr = c => sp("nova" + c, 160, 160, t => { const g2 = t.createRadialGradient(80, 80, 6, 80, 80, 78); g2.addColorStop(0, "rgba(255,255,255,.95)"); g2.addColorStop(.35, c); g2.addColorStop(.7, c + "55"); g2.addColorStop(1, "rgba(0,0,0,0)");
    t.fillStyle = g2; t.beginPath(); t.arc(80, 80, 78, 0, 7); t.fill(); t.strokeStyle = "rgba(255,255,255,.9)"; t.lineWidth = 4; t.beginPath(); t.arc(80, 80, 70, 0, 7); t.stroke();
    t.fillStyle = "#fff"; for (let k = 0; k < 8; k++){ const a = k*Math.PI/4; t.beginPath(); t.moveTo(80 + Math.cos(a)*76, 80 + Math.sin(a)*76); t.lineTo(80 + Math.cos(a + .12)*30, 80 + Math.sin(a + .12)*30); t.lineTo(80 + Math.cos(a - .12)*30, 80 + Math.sin(a - .12)*30); t.fill(); } });
  const ttSpr = k => sp("tt" + k, 44, 44, t => { t.font = `34px ${EMOJI}`; t.textAlign = "center"; t.textBaseline = "middle"; t.fillText(k === 9 ? "🔥" : k === 8 ? "🔗" : RD_TT[k].e, 22, 24); });
  const iceSpr = () => sp("rdice", 70, 80, t => { t.fillStyle = "rgba(165,216,255,.75)"; t.strokeStyle = "#fff"; t.lineWidth = 2; [[35, 4, 12], [18, 24, 9], [52, 22, 9]].forEach(([x, y, w]) => { t.beginPath(); t.moveTo(x, y); t.lineTo(x + w, y + 34); t.lineTo(x, y + 60); t.lineTo(x - w, y + 34); t.closePath(); t.fill(); t.stroke(); }); });
  const orbSpr = g => { const s = 2*(10 + g*3); return sp("orb" + g + s, s, s, t => { const c = RD_G[g].c, m = s/2; t.fillStyle = BSA.rg(t, m, m, 1, m, [[0, "#fff"], [.4, c], [1, "rgba(255,255,255,0)"]]); t.fillRect(0, 0, s, s); }); };
  const ringSpr = c => sp("ring" + c, 96, 96, t => { t.strokeStyle = c; t.lineWidth = 5; t.beginPath(); t.arc(48, 48, 44, 0, 7); t.stroke(); t.globalAlpha = .25; t.fillStyle = c; t.fill(); });
  /* 그림 글자 + 숫자를 한 장으로 (테두리 글씨에 그림 글자가 섞이면 숫자가 깨지는 기기가 있어요) */
  function lbl(parts, fs, col = "#fff"){ const key = parts.join("¦") + fs + col; const ws = parts.map(p => /^\p{Extended_Pictographic}/u.test(p) ? fs*1.2 : rdMeasure(p, fs) + 6), w = ws.reduce((a, b) => a + b, 0) + 6, h = fs + 12;
    return sp("lb" + key, w, h, t => { let x = 3; parts.forEach((p, i) => { if (/^\p{Extended_Pictographic}/u.test(p)) G2.emo(t, p, x + fs*.6, h/2, fs); else outlinedRaw(t, p, x + 3, h/2 + 1, fs, col, undefined, "left"); x += ws[i]; }); }); }
  function btnSpr(w, h, c1, c2, parts, fs, off){ return sp(`bt${w}${h}${c1}${parts.join("¦")}${fs}${off ? 1 : 0}`, w, h + 6, t => {
    t.fillStyle = "rgba(0,0,0,.35)"; rrect(t, 0, 6, w, h, 16); t.fill();
    t.fillStyle = off ? "#495057" : BSA.lg(t, 0, 0, 0, h, [[0, c1], [1, c2]]); rrect(t, 0, 0, w, h, 16); t.fill();
    t.strokeStyle = "rgba(255,255,255,.55)"; t.lineWidth = 3; t.stroke(); t.fillStyle = "rgba(255,255,255,.22)"; rrect(t, 6, 4, w - 12, h*.32, 10); t.fill();
    const l = lbl(parts, fs); t.globalAlpha = off ? .6 : 1; t.drawImage(l, w/2 - l.w/2, h/2 - l.h/2, l.w, l.h); }); }

  /* ---------- 시작 · 단계 ---------- */
  function mkZone(){ return {s: Array.from({length: ZS}, () => ({k: null, n: 0, cd: [0, 0, 0], hit: 0})), gold: 140, gems: 0, up: [0, 0, 0], sum: 0, ack: 0, rel: {}, it: ["bomb"], pick: null, clv: 0, fev: 0}; }
  /* 🎯 단계 미션: 보스가 아닌 단계마다 하나 */
  function newMission(){
    if (wave % 10 === 0){ MS = null; return; }
    const pool = ["keep", "gold", "chest", "merge", "sum", "kill"].filter(k => !(k === "merge" && wave < 3));
    const k = pool[Math.floor(R.f()*pool.length)];
    const n = k === "keep" ? Math.max(12, Math.round(LIMIT*.25)) : k === "merge" ? 1 + (wave > 25 ? 1 : 0) : k === "sum" ? 4 + Math.floor(R.f()*3) : k === "kill" ? Math.round(25*(1 + .6*(N - 1))) : 1;
    MS = {k, n, p: 0, st: 0};   // st: 0 진행 · 1 성공 · 2 실패
    if (k === "gold") spawn(3, wave % N); if (k === "chest") spawn(4, wave % N);
  }
  function msWin(quiet){ if (!MS || MS.st) return; MS.st = 1; const its = Z.map((p, z) => { const it = rndItem(); giveItem(z, it); return it; }); if (quiet){ sfx("big"); return; }
    banner = {t: "🎯 미션 성공!", s: `🎒 ${local.map(z => RD_IT[its[z]].e + RD_IT[its[z]].n).join(" · ")} 받았어요`, k: 110, c: "#69db7c"}; sfx("big");
    if (party === "host") NQ.push(["b", banner.t, "🎒 아이템을 받았어요!", banner.k, banner.c]); }
  function msFail(why){ if (!MS || MS.st) return; MS.st = 2; if (why){ banner = {t: why, s: "괜찮아요, 다음 미션!", k: 90, c: "#ffa94d"}; if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]); } }
  const msTick = k => { if (MS && !MS.st && MS.k === k){ MS.p++; if (MS.p >= MS.n) msWin(); } };
  function startWave(){
    let msOk = false; if (MS && !MS.st){ if (MS.k === "keep" && E.length <= MS.n){ msWin(true); msOk = true; } else msFail(); }
    wave++; const boss = wave % 10 === 0, mini = !boss && wave % 5 === 0;
    waveT = boss ? 60*60 : 20*60; spawnLeft = boss ? 0 : Math.round((30 + Math.min(14, wave*.3))*(1 + .6*(N - 1))); spawnT = 0; spawnI = N === 1 ? 28 : Math.max(6, Math.floor(waveT*.8/Math.max(1, spawnLeft)));
    if (wave > 1) Z.forEach((p, z) => { p.gold += (10 + Math.floor(wave*1.5))*gmul(); const b = RL(z, "bank"); if (b) p.gold += 30*b + Math.min(60*b, Math.floor(p.gold*.05*b)); });
    if (boss){ spawn(2); bossTimer = waveT; banner = wave === RD_END ? {t: "🏆 1000단계 마지막 보스!", s: "모두 힘을 모아요! 잡으면 정복!", k: 200, c: "#fde047"} : wave % 100 === 0 ? {t: `🌀 ${dimOf(wave)}차원 대왕 보스!`, s: "아주 튼튼해요 · 잡으면 💎 보석 듬뿍!", k: 170, c: "#e599f7"} : {t: `👑 ${wave}단계 보스!`, s: "60초 안에 꼭 잡아요!", k: 150, c: "#ff6b6b"}; sfx("boss"); }
    else { if (mini) spawn(1); banner = {t: `🏁 ${wave}단계`, s: wave % 100 === 1 && wave > 1 ? `🌀 ${dimOf(wave)}차원 돌입! 몬스터가 더 세져요` : wave % 10 === 1 ? th().n + "에 왔어요!" : mini ? "😈 중간 보스가 섞여 있어요" : "", k: wave % 100 === 1 && wave > 1 ? 170 : 110, c: wave % 100 === 1 && wave > 1 ? "#e599f7" : undefined}; sfx("wave"); }
    remap(); if (wave % 10 === 1){ layerKey = ""; setSky(); }
    newMission(); if (MS && !banner.s) banner.s = `${RD_MS[MS.k].e} 미션: ${RD_MS[MS.k].t(MS.n)}`;
    if (msOk) banner.s = "🎯 지난 미션 성공! 🎒 아이템을 받았어요";
    if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c || ""]);
  }
  /* 몬스터: 0 슬라임 · 1 😈 중간 보스 · 2 👑 보스 · 3 🟡 황금 슬라임(빨라요, 놓치면 도망) · 4 🎁 보물상자(느리고 단단) */
  const KSPD = kind => (kind === 2 ? 1.15 : kind === 1 ? 1.55 : kind === 3 ? 3.4 : kind === 4 ? .9 : 2.05 + Math.min(.6, wave*.012))/60;
  /* 같이 하기(SH)는 문 하나에서 모두 나와요 (보스는 한 마리, 대신 사람 수만큼 튼튼) */
  let laneRR = 0, spawnI = 28;
  function spawn(kind, l){ let one = 1;
    if (SH){ l = 0; if (kind === 1 || kind === 2) one = N; }   // 🤝 같이 하기: 문 하나에서 나오고, 보스는 한 마리(대신 다 같이 튼튼)
    else if (l == null){ if (kind === 1 || kind === 2){ for (let q = 0; q < N; q++) spawn(kind, q); return; } l = laneRR++ % N; }
    const h = one*hpAt(wave)*(kind === 2 ? 20*(1 + .5*(N - 1))/N*(wave === RD_END ? 5 : wave % 100 === 0 ? 2.5 : 1) : kind === 1 ? 10*(1 + .3*(N - 1))/N : kind === 3 ? 5 : kind === 4 ? 16 : 1)/(SH && kind ? 1 + .25*(N - 1) : 1);
    /* 몬스터 특성 (단계가 오를수록): 🛡️ 단단함(원거리 반감) · 🦇 날개(근거리 못 닿음) · 👻 유령(지원이 잘 잡음) · 🔰 방패(처음 몇 번 막음) → 역할을 섞어 배치해야 해요 */
    let tt = 0; if (kind === 0 && wave >= 12){ const r = R.f(); tt = r < .16 ? 1 : wave >= 20 && r < .3 ? 2 : wave >= 35 && r < .4 ? 3 : wave >= 50 && r < .47 ? 4 : wave >= 100 && r < .55 ? 5 : wave >= 150 && r < .62 ? 6 : 0;
      if (tt && !TTS.has(tt)){ TTS.add(tt); banner = {t: RD_TT[tt].t, s: RD_TT[tt].s, k: 200, c: "#ffd43b"}; if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]); } }
    const p0 = posAt(0, l); E.push({id: ++eid, kind, l, d: 0, tr: 0, hp: h*(tt === 1 ? 1.3 : tt === 6 ? .75 : 1), mhp: h*(tt === 1 ? 1.3 : tt === 6 ? .75 : 1), spd: KSPD(kind)*(tt === 2 ? 1.25 : tt === 6 ? 1.7 : 1), slT: 0, slF: 0, stT: 0, x: p0[0], y: p0[1], f: R.f()*60|0, tt, sh: tt === 4 ? 3 + Math.floor(wave/25) : 0}); }
  const TTS = new Set();
  function setSky(){ const cv = $("#ngCanvas"); cv.style.backgroundImage = (bgURL ? `url(${bgURL}),` : "") + th().sky; cv.style.backgroundColor = "#1c1d52";
    if (bgURL){ cv.style.backgroundSize = `${COLS*C/W*100}% ${ROWS*C/H*100}%, 100% 100%`; cv.style.backgroundPosition = `${W > COLS*C ? BX/(W - COLS*C)*100 : 0}% ${H > ROWS*C ? BY/(H - ROWS*C)*100 : 0}%, 0 0`; cv.style.backgroundRepeat = "no-repeat"; } else { cv.style.backgroundSize = ""; cv.style.backgroundPosition = ""; } }
  /* ⚡ 판 그림은 CSS 배경으로 (매 장면 붙이지 않아요) — 준비되기 전에는 캔버스에 붙여요 */
  let bgURL = null, bgKey = "";
  function boardBG(){ if (bgKey === layerKey) return; bgKey = layerKey; const key = layerKey; bgURL = null; setSky();
    try { layer.toBlob(bl => { if (!bl || key !== layerKey || NG.cur !== self) return; if (RD_BG.url) URL.revokeObjectURL(RD_BG.url); RD_BG.url = bgURL = URL.createObjectURL(bl); setSky(); }, "image/png"); } catch(e) {} }

  /* ---------- 동물 뽑기 · 합치기 · 팔기 · 옮기기 · 강화 · 행운 ---------- */
  function placeK(z, k, pref){ const S = Z[z].s; let i = S.findIndex(q => q.k === k && q.n < 3); if (i < 0 && pref != null && !S[pref].k) i = pref; if (i < 0) i = S.findIndex(q => !q.k); if (i < 0) return -1;
    const q = S[i]; if (isMine(z)) RDB.see(k); if (!q.k){ q.k = k; q.n = 0; } q.cd[q.n] = 10 + q.n*7; q.n++; q.hit = 12; gv++; return i; }
  const sumCost = z => 20 + Math.min(50, Math.floor(Z[z].sum/2));   // 뽑을수록 조금씩 비싸지다가 70에서 멈춰요 (뒤 단계에서 금이 바닥나지 않게)
  function rollG(z){ const r = R.f(), d = z == null ? 0 : RL(z, "dice"), lk = z == null ? 0 : (PK(z).luck || 0);
    let g = r < .015*(1 + d)*(1 + .1*lk) ? 2 : r < .15*(1 + .5*d)*(1 + .06*lk) ? 1 : 0;
    if (z != null && Z[z].minG) g = Math.max(g, Z[z].minG);   // 👑 희귀 이상 소환권
    if (z != null && Z[z].clv > 0){ Z[z].clv--; g = Math.max(1, g); } return g; }
  function pick(g){ const L = RD_BY[g]; return L[Math.floor(R.f()*L.length)]; }
  function doAct(z, a){
    const p = Z[z]; if (!p) return;
    if (a[0] === "emo"){ emote(z, a[1] | 0, a[2]/100, a[3]/100); return; }
    if (a[0] === "spd"){ speed = speed === 1 ? 2 : speed === 2 ? 4 : 1;
      if (N > 1){ banner = {t: `⏩ 속도 ×${speed}`, s: `${nameOf(noOf_(SIDS[z]))}${speed === 1 ? "이(가) 보통 빠르기로" : "이(가) 빠르게"} 바꿨어요`, k: 60, c: speed === 4 ? "#ff8787" : "#ffd43b"}; if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]); }
      return; }
    if (state !== "play") return;
    const S = p.s, ty = a[0];
    if (ty === "sum"){ const c = sumCost(z); if (p.gold < c){ toastZ(z, "💰 금이 모자라요"); return; }
      if (!S.some(q => !q.k) && !S.some(q => q.k && q.n < 3)){ toastZ(z, "🈵 자리가 꽉 찼어요! 합치거나 팔아요"); return; }
      const g = rollG(z), k = pick(g), i = placeK(z, k); if (i < 0){ toastZ(z, "🈵 자리가 꽉 찼어요! 합치거나 팔아요"); return; }
      p.gold -= c; p.sum++; msTick("sum"); sfx(g >= 2 ? "big" : "sum", z); popAt(z, i, `${RD_A[k].e} ${RD_A[k].n}${g ? "!" : ""}`, RD_G[g].c); }
    else if (ty === "mrg"){ const i = a[1], q = S[i]; if (!q || q.n < 3 || RD_A[q.k].g >= RD_MAXG) return; mergeAt(z, i); }
    else if (ty === "all"){ let n = 0; for (let loop = 0; loop < 40; loop++){ const i = S.findIndex(q => q.k && q.n >= 3 && RD_A[q.k].g < RD_MAXG); if (i < 0) break; mergeAt(z, i, true); n++; }
      if (!n) toastZ(z, "🔀 3마리 모인 동물이 없어요"); else sfx("merge", z); }
    else if (ty === "sel"){ const i = a[1], q = S[i]; if (!q || !q.k) return; const v = RD_G[RD_A[q.k].g].sell; q.n--; if (!q.n) q.k = null; p.gold += v; gv++; sfx("sell", z); popAt(z, i, `+${v}💰`, "#ffe066"); }
    else if (ty === "mov"){ const i = a[1], j = a[2]; if (i === j || !S[i] || !S[j]) return; const t = S[i]; S[i] = S[j]; S[j] = t; gv++; }
    else if (ty === "up"){ const g = a[1], c = upCost(z, g); if (p.gold < c){ toastZ(z, "💰 금이 모자라요"); return; } p.gold -= c; p.up[g]++; sfx("up", z); toastZ(z, `⬆️ ${["일반·희귀", "영웅·전설", "신화 이상"][g]} 공격력 Lv.${p.up[g]}!`); gv++; }
    else if (ty === "rel"){ if (p.pick) takeRel(z, a[1] | 0); }
    else if (ty === "it"){ const i = a[1] | 0, k = p.it[i]; if (!k) return; p.it.splice(i, 1); gv++; useItem(z, k); }
    else if (ty === "luck"){ const big = a[1] === 1, c = big ? 4 : 1; if (p.gems < c){ toastZ(z, "💎 보석이 모자라요 (보스를 잡으면 생겨요)"); return; }
      const r = R.f(), g = big ? (r < .35 ? 4 : 3) : (r < .15 ? 3 : r < .7 ? 2 : -1);
      if (g < 0){ p.gems -= c; sfx("fail", z); toastZ(z, "😅 꽝! 다음엔 꼭!"); return; }
      const k = pick(g), i = placeK(z, k); if (i < 0){ toastZ(z, "🈵 자리가 꽉 찼어요"); return; } p.gems -= c; sfx("big", z); popAt(z, i, `✨ ${RD_A[k].e} ${RD_A[k].n}!`, RD_G[g].c); }
  }
  function useItem(z, k){
    const T = RD_IT[k]; sfx("big", z);
    if (k === "bomb"){ E.forEach(e => { e.hp -= e.mhp*(e.kind === 2 ? .06 : e.kind === 1 ? .15 : .3); }); E.slice(0, 40).forEach(e => boom(e.x, e.y, 0)); }
    else if (k === "ice") E.forEach(e => { e.stT = Math.max(e.stT, e.kind === 2 ? 120 : 300); });
    else if (k === "clover") Z[z].clv += 3;
    else if (k === "gold") Z[z].gold += (40 + wave*5)*gmul();
    else if (k === "time") waveT += 15*60;
    else if (k === "fever") Z[z].fev = 15*60;
    banner = {t: `${T.e} ${T.n}!`, s: T.d, k: 80, c: "#ffe066"}; if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]);
  }
  function mergeAt(z, i, quiet){ const S = Z[z].s, q = S[i]; let g = RD_A[q.k].g; q.k = null; q.n = 0; gv++; msTick("merge");
    if (g + 2 <= Math.min(5, RD_MAXG) && RL(z, "merge") && R.f() < .15*RL(z, "merge")){ g++; toastZ(z, "🔀 합치기 달인! 두 등급 껑충!"); }
    if (RL(z, "lucky") && R.f() < .25){ Z[z].gold += (60 + wave*3)*gmul(); toastZ(z, "🍀 행운의 합치기! 금 보너스"); }
    const k = pick(g + 1), j = placeK(z, k, i); if (!quiet) sfx(g + 1 >= 3 ? "big" : "merge", z); else if (g + 1 >= 3) sfx("big", z);
    popAt(z, j, `${RD_A[k].e} ${RD_A[k].n}${g + 1 >= 3 ? "!!" : "!"}`, RD_G[g + 1].c); fxRing(z, j, RD_G[g + 1].c);
    if (g + 1 >= 5){ banner = {t: `${RD_G[g + 1].n} 등급 탄생!`, s: `${RD_A[k].e} ${RD_A[k].n} — ${RD_A[k].sk ? RD_A[k].sk.n : RD_A[k].t}`, k: 120, c: RD_G[g + 1].c}; if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]); const [x, y] = slotXY(z, j); FX.push({nova: 1, x, y, t: 50, c: RD_G[g + 1].c}); } }
  /* ⬆️ 강화는 끝이 없어요: Lv25까지는 차근차근, 그 뒤로는 한 번 올릴 때마다 ×1.075 (값도 ×1.07씩) */
  const upCost = (z, g) => { const L = Z[z].up[g]; return Math.round([30, 90, 250][g]*(L < 25 ? L + 1 : 26*Math.pow(1.07, L - 25))*(1 - .25*RL(z, "cheap"))); };
  const upMul = (z, g) => { const L = Z[z].up[g < 2 ? 0 : g < 4 ? 1 : 2]; return (1 + .3*Math.min(25, L)*(g >= 5 ? 1.3 : 1))*Math.pow(1.075, Math.max(0, L - 25)); };
  function toastZ(z, s){ if (isMine(z)){ for (let i = FX.length - 1; i >= 0; i--) if (FX[i].ui && FX[i].z === z) FX.splice(i, 1); } if (isMine(z)) FX.push({tx: s, x: W/2, y: H - BOTH - 26, t: 90, c: "#fff", ui: 1, z}); else if (party === "host" && remote(z)) NQ.push(["t", z, s]); }
  function popAt(z, i, s, c, nb){ if (i < 0) return; const [x, y] = slotXY(z, i); FX.push({tx: s, x, y: y - .4, t: nb ? 50 : 70, c, cell: 1, nb}); if (party === "host") NQ.push(["p", z, i, s, c, nb ? 1 : 0]); }
  function fxRing(z, i, c){ if (i < 0) return; const [x, y] = slotXY(z, i); FX.push({ring: 1, x, y, t: 26, c}); if (party === "host") NQ.push(["r", +x.toFixed(2), +y.toFixed(2), c]); }

  /* ---------- 싸움 (방장 기기) ---------- */
  /* 🤝 배치 시너지: 바로 옆(대각선 포함) 친구에 따라 힘이 달라져요
     - 같은 동물끼리 붙어 있으면 한 마리당 +12% (최대 +36%, '찰떡 친구' 유물이면 2배)
     - ⚔️·🏹·✨ 세 역할이 한 동물 곁에 모두 있으면 '삼각 진형' +25%
     - 같은 등급끼리 3마리 이상 이웃이면 '등급 연합' +15%
     - ✨ 지원 동물(유니콘·기린·천마)은 주변 친구 힘 UP (지원 유물이면 더 세게) */
  function nbOf(z, i){ const [x, y] = slotXY(z, i), L = []; Z[z].s.forEach((q, j) => { if (j === i || !q.k) return; const [x2, y2] = slotXY(z, j); if ((x2 - x)**2 + (y2 - y)**2 < 2.1) L.push(q); }); return L; }
  const buffMap = () => { const B = Z.map(p => p.s.map(() => 1)), SY = Z.map(p => p.s.map(() => ""));
    Z.forEach((p, z) => p.s.forEach((q, i) => { if (!q.k) return; const A = RD_A[q.k], nb = nbOf(z, i);
      const same = nb.filter(o => o.k === q.k).length, roles = new Set(nb.map(o => RD_A[o.k].ro).concat([A.ro])), grade = nb.filter(o => RD_A[o.k].g === A.g).length;
      let m = 1 + Math.min(3, same)*.12*(1 + RL(z, "sync")), tag = same ? "🤝" : "";
      if (roles.size === 3){ m *= 1.25; tag += "🔺"; } if (grade >= 3){ m *= 1.15; tag += "🎖️"; }
      B[z][i] *= m; SY[z][i] = tag; }));
    /* ✨ 지원 동물은 길 건너 친구 자리까지 응원해요 (💞 친구 응원) — 친구와 자리 경계에 지원을 두면 둘 다 세져요 */
    Z.forEach((p, z) => p.s.forEach((q, i) => { if (!q.k || !RD_A[q.k].bf) return; const [x, y] = slotXY(z, i), bf = RD_A[q.k].bf*(1 + .5*RL(z, "support"));
      Z.forEach((p2, z2) => p2.s.forEach((q2, j) => { if (!q2.k) return; const [x2, y2] = slotXY(z2, j), d2 = (x2 - x)**2 + (y2 - y)**2; if (z2 === z ? d2 < 1.7*1.7 : d2 < 2.8*2.8){ B[z2][j] *= 1 + bf; if (z2 !== z && !SY[z2][j].includes("💞")) SY[z2][j] += "💞"; } })); }));
    /* 🎌 역할 분담 (3명 이상): 친구마다 주력(가장 많은 역할)이 달라 ⚔️🏹✨ 셋이 다 있으면 모두 +20%, 5명 이상이 역할마다 2명씩 맡으면 +40% */
    TEAM = 1; if (N >= 3){ const cnt = {m: 0, r: 0, s: 0}; Z.forEach(p => { const c = {m: 0, r: 0, s: 0}; p.s.forEach(q => { if (q.k) c[RD_A[q.k].ro] += q.n; }); const top = Object.keys(c).sort((a, b) => c[b] - c[a])[0]; if (c[top] > 0) cnt[top]++; });
      if (cnt.m && cnt.r && cnt.s) TEAM = N >= 5 && cnt.m >= 2 && cnt.r >= 2 && cnt.s >= 2 ? 1.4 : 1.2; if (TEAM > 1) B.forEach(r => r.forEach((v, i) => r[i] = v*TEAM)); }
    SYN = SY; return B; };
  let TEAM = 1;
  let SYN = null;
  let BUF = null, bufV = -1;
  const fxN = {t: 0, r: 0};   // ⚡ 한꺼번에 너무 많은 반짝이를 그리지 않게 세어요
  function attack(viz){
    fxN.t = FX.reduce((a, f) => a + (f.sm ? 1 : 0), 0); fxN.r = FX.reduce((a, f) => a + (f.k ? 1 : 0), 0);
    if (bufV !== gv){ BUF = buffMap(); bufV = gv; }
    for (let z = 0; z < Z.length; z++){ const p = Z[z];
      const pk = PK(z), rB = .5*RL(z, "rng"), crB = .1*RL(z, "crit") + .015*(pk.crit || 0), cdM0 = 1/((1 + .15*RL(z, "spd"))*(1 + .03*(pk.spd || 0)));
      for (let i = 0; i < ZS; i++){ const q = p.s[i]; if (!q.k) continue; const A = RD_A[q.k], [sx, sy] = slotXY(z, i), r2 = (A.r + rB)*(A.r + rB);
        const tb = tbAt(z, sx, sy), cdM = cdM0/tb.s, pm = (A.ro === "r" && !isFront(z, i) ? 1.25 : 1)*tb.a;   // 🏹 원거리는 뒷줄에서 +25% · 🦁🦄 스킬 응원
        for (let u = 0; u < q.n; u++){ if (--q.cd[u] > 0) continue;
          // 가장 앞서가는 몬스터부터
          let tg = [], best = -1; const mt = A.mt || 1;
          for (const e of E){ const dx = e.x - sx, dy = e.y - sy; if (dx*dx + dy*dy > r2) continue; if (e.tt === 2 && A.ro === "m") continue;   // 🦇 나는 몬스터는 근거리가 못 닿아요
            if (mt === 1){ if (e.tr > best){ best = e.tr; tg[0] = e; } } else tg.push(e); }
          if (!tg.length){ q.cd[u] = 6; continue; }
          if (mt > 1) tg = tg.sort((a, b) => b.tr - a.tr).slice(0, mt);
          q.cd[u] = Math.max(6, Math.round(A.cd*cdM)); q.hit = 8;
          if (!viz && A.sk){ q.mp = (q.mp || 0) + 1 + .3*RL(z, "skill"); if (q.mp >= A.sk.mp){ q.mp = 0; cast(z, i, A, sx, sy, pm); } }
          const ox = sx + UOFF[q.n - 1][u][0], oy = sy + UOFF[q.n - 1][u][1];
          tg.forEach(e => { PR.push({x0: ox, y0: oy, e, x1: e.x, y1: e.y, t: 0, T: 8, g: A.g, k: q.k}); if (viz) return;
            const cc = (A.cr || 0) + crB, cr = cc > 0 && R.f() < cc, dm = A.d*upMul(z, A.g)*(BUF ? BUF[z][i] : 1)*(cr ? 3 : 1)*relMul(z, A, e)*pm;
            hitE(e, dm, A, z); if (cr && fxN.t < 6){ fxN.t++; FX.push({tx: "치명타!", x: e.x, y: e.y - .35, t: 34, c: "#ff6b6b", cell: 1, sm: 1}); }
            if (A.sp){ for (const o of E){ if (o !== e && (o.x - e.x)**2 + (o.y - e.y)**2 < A.sp*A.sp) hitE(o, dm*.6, A, z); } }
            const ch = (A.chain || 0) + RL(z, "chain"); if (ch){ let from = e; const hitS = new Set([e]); for (let c = 0; c < ch; c++){ const nx = E.find(o => !hitS.has(o) && (o.x - from.x)**2 + (o.y - from.y)**2 < 2.2); if (!nx) break; hitS.add(nx); hitE(nx, dm*.6, A, z); if (fxN.r < 14){ fxN.r++; FX.push({bolt: 1, x: from.x, y: from.y, x2: nx.x, y2: nx.y, t: 10, c: "#a5d8ff"}); } from = nx; } } });
          if (A.sp && fxN.r < 14){ fxN.r++; const e = tg[0]; FX.push({ring: 1, x: e.x, y: e.y, t: 16, c: RD_G[A.g].c, r: A.sp, k: 1}); }
        } } }
  }
  /* 🌟 스킬: 공격할 때마다 기력이 차서, 꽉 차면 저절로 펑! */
  let TB = [];   // 🦁 포효 · 🦄 무지개 축복 (잠깐 동안 옆 친구들 응원)
  function tbAt(z, x, y){ const o = {a: 1, s: 1}; for (const b of TB){ if (b.ty === "bless"){ o.a = Math.max(o.a, 2); o.s = 2; continue; } if (b.z !== z || (b.x - x)**2 + (b.y - y)**2 > 2.3*2.3) continue; if (b.ty === "buffA") o.a = Math.max(o.a, 1.5); else if (b.ty === "buffA2") o.a = Math.max(o.a, 2); else o.s = 2; } return o; }
  /* ✨ 스킬 이펙트 (스킬마다 다른 모양) */
  /* ⚡ 큰 스킬 그림(폭발·번쩍·기둥·광선)은 한꺼번에 5개까지만 → 동물이 많아도 화면이 버벅이지 않아요 */
  const bigFx = f => f.nova || f.flash || f.pillar || f.beam || f.ice;
  const fxOK = f => FX.length < 200 && (!bigFx(f) || FX.reduce((a, o) => a + (bigFx(o) ? 1 : 0), 0) < 5);
  function skillFx(S, A, sx, sy, R0, inR, front){ const c = RD_G[A.g].c, add = f => { if (!fxOK(f)) return; FX.push(f); if (party === "host" && NQ.length < 40) NQ.push(["x", JSON.stringify(f)]); };
    const ty = S.ty;
    if (ty === "all" || ty === "burn" || ty === "stun") add({nova: 1, x: sx, y: sy, t: 34, c: ty === "burn" ? "#ff922b" : c, r: R0});
    else if (ty === "freeze") { add({nova: 1, x: sx, y: sy, t: 34, c: "#a5d8ff", r: R0}); inR.slice(0, 10).forEach(e => add({ice: 1, x: e.x, y: e.y, t: 40})); }
    else if (ty === "nova" || ty === "quake" || ty === "tsunami"){ add({flash: 1, t: 18, c: ty === "quake" ? "#d9480f" : ty === "tsunami" ? "#4dabf7" : c}); add({nova: 1, x: sx, y: sy, t: 50, c, r: 6}); }
    else if (ty === "buffA" || ty === "buffA2" || ty === "buffS" || ty === "bless") add({pillar: 1, x: sx, y: sy, t: 50, c: ty === "bless" ? "#fde047" : "#ff8787"});
    else if (ty === "snipe" || ty === "big" || ty === "exec") { if (front) add({beam: 1, x: sx, y: sy, x2: front.x, y2: front.y, t: 16, c}); }
    else if (ty === "storm" || ty === "pick") inR.slice(0, 9).forEach(e => add({nova: 1, x: e.x, y: e.y, t: 22, c, r: .6}));
    else if (ty === "push") add({nova: 1, x: sx, y: sy, t: 34, c: "#4dabf7", r: R0});
  }
  function cast(z, i, A, sx, sy, pm){
    const S = A.sk, p = Z[z], base = A.d*upMul(z, A.g)*(BUF ? BUF[z][i] : 1)*pm, R0 = A.r + .5*RL(z, "rng") + .4;
    const near = e => (e.x - sx)**2 + (e.y - sy)**2 <= R0*R0, hit = (e, m) => { hitE(e, base*m*relMul(z, A, e), A); },
      inR = E.filter(near), front = inR.reduce((b, e) => !b || e.tr > b.tr ? e : b, null);
    let did = true;
    switch (S.ty){
      case "gold": { const v = 4 + Math.floor(wave*.6); p.gold += v; break; }
      case "multi": if (front) for (let k = 0; k < S.v; k++) hit(front, 1); else did = false; break;
      case "big": if (front) hit(front, S.v); else did = false; break;
      case "all": inR.forEach(e => hit(e, S.v)); did = inR.length > 0; break;
      case "slow": inR.forEach(e => { e.slT = 180; e.slF = Math.max(e.slF, S.v); }); did = inR.length > 0; break;
      case "freeze": inR.forEach(e => { e.stT = Math.max(e.stT, e.kind === 2 ? 30 : S.v); hit(e, 1); }); did = inR.length > 0; break;
      case "stun": inR.forEach(e => { e.stT = Math.max(e.stT, e.kind === 2 ? 20 : 60); hit(e, S.v); }); did = inR.length > 0; break;
      case "pick": inR.sort((a, b) => b.tr - a.tr).slice(0, S.n2).forEach(e => hit(e, S.v)); did = inR.length > 0; break;
      case "snipe": { const t = E.reduce((b, e) => !b || e.hp > b.hp ? e : b, null); if (t){ hit(t, S.v); PR.push({x0: sx, y0: sy, e: t, x1: t.x, y1: t.y, t: 0, T: 6, g: A.g, k: "owl"}); } else did = false; break; }
      case "exec": { const t = inR.reduce((b, e) => !b || e.hp/e.mhp < b.hp/b.mhp ? e : b, null); if (!t){ did = false; break; } if (t.kind !== 2 && t.kind !== 1 && t.hp/t.mhp < .4) t.hp = 0; else hit(t, S.v); break; }
      case "buffA": case "buffS": TB.push({z, x: sx, y: sy, ty: S.ty, t: 360}); break;
      case "push": inR.forEach(e => { const b = e.kind === 2 ? .8 : 2.5; e.d = Math.max(0, e.d - b); e.tr = Math.max(0, e.tr - b); }); did = inR.length > 0; break;
      case "storm": { const L = E.slice().sort(() => R.f() - .5).slice(0, 6); L.forEach(e => { hit(e, S.v); if (fxN.r < 14){ fxN.r++; FX.push({ring: 1, x: e.x, y: e.y, t: 16, c: "#a5d8ff", r: .7, k: 1}); } }); did = L.length > 0; break; }
      case "burn": inR.forEach(e => { hit(e, S.v); e.bnT = 240; e.bnD = Math.max(e.bnD || 0, base*.04); }); did = inR.length > 0; break;
      case "buffA2": TB.push({z, x: sx, y: sy, ty: "buffA2", t: 480}); break;
      case "bless": TB.push({z, x: sx, y: sy, ty: "bless", t: 360}); break;
      case "tsunami": E.forEach(e => { if (N > 1 && !SH && e.l !== z) return; const b = e.kind === 2 ? 1 : 3; e.d = Math.max(0, e.d - b); e.tr = Math.max(0, e.tr - b); hit(e, S.v); }); break;
      case "nova": E.forEach(e => { if (N > 1 && !SH && e.l !== z) return; hit(e, S.v); if (S.stn) e.stT = Math.max(e.stT, e.kind === 2 ? 30 : 90); }); break;
      case "chain": { let from = front; const hs = new Set(); for (let c = 0; c < (S.n2 || 8) && from; c++){ hs.add(from); hit(from, S.v); const nx = E.filter(o => !hs.has(o)).sort((a, b) => ((a.x - from.x)**2 + (a.y - from.y)**2) - ((b.x - from.x)**2 + (b.y - from.y)**2))[0];
        if (nx && fxN.r < 18){ fxN.r++; FX.push({bolt: 1, x: from.x, y: from.y, x2: nx.x, y2: nx.y, t: 14, c: "#e5dbff"}); } from = nx; } did = hs.size > 0; break; }
      case "quake": E.forEach(e => { if (SH ? (e.x - sx)**2 + (e.y - sy)**2 > 9 : N > 1 && e.l !== z) return; e.stT = Math.max(e.stT, e.kind === 2 ? 25 : 70); hit(e, S.v); }); break;
    }
    if (!did) return;
    popAt(z, i, `${S.e} ${S.n}!`, RD_ROLE[A.ro].c, 1);
    skillFx(S, A, sx, sy, R0, inR, front);
    if (fxN.r < 14){ fxN.r++; FX.push({ring: 1, x: sx, y: sy, t: 26, c: RD_ROLE[A.ro].c, r: S.ty === "buffA" || S.ty === "buffS" ? 2.3 : R0, k: 1}); if (party === "host") NQ.push(["r", +sx.toFixed(2), +sy.toFixed(2), RD_ROLE[A.ro].c]); }
    if (A.g >= 3) sfx("merge", z);
  }
  function hitE(e, dm, A, z){ if (e.tt === 4 && e.sh > 0){ e.sh--; return; }   // 🔰 방패 몬스터: 처음 몇 번은 막아요
    /* 🔗 협동 표식: 다른 친구 자리의 동물에게 번갈아 맞을수록 +10%씩 더 아파요 (최대 +50%) → 길을 따라 친구들과 나눠서 지켜요 */
    if (N > 1 && z != null){ if (e.lz !== z){ if (e.lz != null) e.co = Math.min(5, (e.co || 0) + 1); e.lz = z; } if (e.co) dm *= 1 + .1*e.co; }
    e.hp -= dm; if (A.sl){ e.slT = 90; e.slF = Math.max(e.slF, A.sl); } if (A.st && R.f() < A.st) e.stT = 40;
    const bn = (A.burn || 0) + (z != null ? .15*RL(z, "burn") : 0); if (bn){ e.bnT = 180; e.bnD = Math.max(e.bnD || 0, dm*bn/60); }
    if (z != null && RL(z, "frost") && R.f() < .08*RL(z, "frost") && e.kind !== 2) e.stT = Math.max(e.stT, 50); }
  function sim(){
    frame++;
    if (state !== "play") return;
    if (--waveT <= 0){ if (E.some(e => e.kind === 2)){ lose("👑 보스를 시간 안에 못 잡았어요"); return; } startWave(); }
    if (spawnLeft > 0 && --spawnT <= 0){ spawn(0); spawnLeft--; spawnT = spawnI; }
    const slw = 1 - slowAll(); Z.forEach(p => { if (p.fev > 0) p.fev--; }); if (TB.length) TB = TB.filter(b => --b.t > 0);
    for (let i = E.length - 1; i >= 0; i--){ const e = E[i]; if (e.kind === 3 && e.tr > plOf(e.l)*(SH ? 1 : 1.5)){ E.splice(i, 1); msFail("🟡 황금 슬라임이 도망갔어요!"); } }
    for (const e of E){ if (e.bnT > 0){ e.bnT--; e.hp -= e.bnD; } else if (e.tt === 5 && e.hp < e.mhp) e.hp = Math.min(e.mhp, e.hp + e.mhp*.0006); if (e.stT > 0){ e.stT--; } else { const v = e.spd*(e.slT > 0 ? 1 - e.slF : 1)*slw; e.d += v; e.tr += v; } if (e.slT > 0 && --e.slT === 0) e.slF = 0; const pp = posAt(e.d, e.l); e.x = pp[0]; e.y = pp[1]; e.f++; }
    attack(false);
    for (let i = E.length - 1; i >= 0; i--){ const e = E[i]; if (e.hp > 0) continue; E.splice(i, 1); kills++; msTick("kill");
      const gd = Math.floor((e.kind === 2 ? 120 : e.kind === 1 ? 35 : e.kind === 3 ? 60 + wave*3 : e.kind === 4 ? 40 : 2 + Math.floor(wave/10))*gmul()); Z.forEach((p, z) => p.gold += gd*(1 + RL(z, "greed")));
      if (e.kind === 3 || e.kind === 4){ boom(e.x, e.y, 1); if (MS && !MS.st && MS.k === (e.kind === 3 ? "gold" : "chest")) msWin(); else { Z.forEach((p, z) => giveItem(z, rndItem())); } continue; }
      if (e.kind){ const gm = e.kind === 2 ? 2 : 1, more = E.some(o => o.kind === e.kind); if (!more) Z.forEach(p => p.gems += gm); bossK += e.kind === 2 && !more ? 1 : 0; sfx("kboss"); banner = {t: e.kind === 2 ? "🎉 보스 처치!" : "😈 중간 보스 처치!", s: `💎 보석 +${gm} · 💰 +${gd}`, k: 120, c: "#ffe066"};
        if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]); boom(e.x, e.y, 1);
        const lastBoss = e.kind === 2 && !E.some(o => o.kind === 2);
        if (lastBoss && waveT > 180) waveT = 180;
        if (lastBoss && wave % 100 === 0){ Z.forEach(p => p.gems += 5); banner = {t: wave === RD_END ? "🏆 1000단계 정복!!" : `🌀 ${dimOf(wave)}차원 돌파!`, s: wave === RD_END ? "전설의 동물 마을 수호대!" : `💎 보석 +5 · 🎁 유물 상자 · 다음은 ${dimOf(wave) + 1}차원!`, k: 220, c: "#fde047"}; if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]); sfx("big");
          if (wave >= RD_END){ score += 500000; state = "over"; overT = 260; if (party === "host") NQ.push(["b", banner.t, banner.s, 999, banner.c]); return; } }
        Z.forEach((p, z) => { if (e.kind === 1 && N > 1 && E.some(o => o.kind === 1)) return; p.gems += RL(z, "gem")*(e.kind === 2 ? 2 : 1); if (e.kind === 2){ if (lastBoss) offerRel(z); } else giveItem(z, rndItem()); });
        if (more) banner = {t: e.kind === 2 ? "👑 보스 하나 처치!" : "😈 중간 보스 하나 처치!", s: "다른 길의 보스도 잡아요!", k: 80, c: "#ffe066"};
        if (e.kind === 2 && !more){ banner.s = "🎁 유물 상자! 하나를 골라요"; if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]); } }
      else if (FX.length < 200) boom(e.x, e.y, 0); }
    const n = E.length; if (n >= LIMIT){ lose("👾 몬스터가 동물 마을을 덮쳤어요!"); return; }
    if (n >= LIMIT*.8 && frame % 30 === 0) sfx("warn");
    score = Math.max(score, (wave - 1)*1000 + kills*5 + bossK*800);
  }
  function boom(x, y, big){ FX.push({ring: 1, x, y, t: big ? 30 : 14, c: big ? "#ffe066" : "#fff", r: big ? 1.6 : .45}); if (party === "host" && big) NQ.push(["r", +x.toFixed(2), +y.toFixed(2), "#ffe066"]); }
  function lose(why){ state = "over"; overT = 150; banner = {t: "GAME OVER", s: why, k: 999, c: "#ff6b6b"}; sfx("fail"); if (party === "host") NQ.push(["b", banner.t, banner.s, 999, banner.c]); }
  function finish(){
    if (ended) return; ended = true; if (party === "guest") return;
    local.forEach(i => { if (i > 0 && SIDS[i]){ const me0 = ARC.me; ARC.me = noOf_(SIDS[i]); try { saveRec("rd", SIDS[i], score); } finally { ARC.me = me0; } } });
    if (party === "host") PARTY.sendAll({t: "end", w: 0, wins: [], score, wave, kills});
    const team = SIDS.map(s => esc(nameOf(noOf_(s))));
    NG.over(score, `<div>🐾 <b>${wave}단계</b>까지 · 👾 몬스터 ${kills}마리 · 👑 보스 ${bossK}마리</div>${N > 1 ? `<div>👥 함께 지킨 친구: ${team.join(", ")} <small>(모두 같은 점수로 기록돼요)</small></div>` : ""}`);
  }

  /* ---------- 🌐 친구 기기 ---------- */
  function gridMsg(){ return {t: "grid", gv, z: Z.map(p => p.s.map(q => q.k ? RD_K.indexOf(q.k)*4 + q.n : -1))}; }
  function snap(){ return {sp: speed, w: wave, wt: waveT, st: state, sc: score, kl: kills, bk: bossK, gv, lm: LIMIT,
    P: Z.map(p => [Math.floor(p.gold), p.gems, p.up[0], p.up[1], p.up[2], p.sum, p.ack, Object.entries(p.rel).map(a => a.join(":")).join(","), p.it.join(","), p.pick ? p.pick.join(",") : "", p.clv, p.fev]),
    M: MS ? [MS.k, MS.n, MS.p, MS.st] : null,
    E: E.map(e => [e.id, e.kind, Math.round(e.d*100), Math.max(1, Math.round(e.hp/e.mhp*100)), (e.slT > 0 ? 1 : 0) | (e.stT > 0 ? 2 : 0) | (e.bnT > 0 ? 4 : 0) | ((e.co || 0) >= 3 ? 8 : 0), e.l || 0, e.tt || 0, e.sh || 0])}; }
  function apply(d){
    if (d.grid){ if (!Z) return; d.grid.z.forEach((arr, z) => arr.forEach((v, i) => { const q = Z[z].s[i]; if (v < 0){ q.k = null; q.n = 0; } else { const k = RD_K[v >> 2], n = v & 3; if (q.k !== k || q.n !== n) q.hit = 10; q.k = k; q.n = n; } })); gv = d.grid.gv; return; }
    if (d.ev){ d.ev.forEach(e => { const k = e[0];
      if (k === "s"){ if (e[2] < 0 || isMine(e[2])) playS(e[1]); }
      else if (k === "b") banner = {t: e[1], s: e[2], k: e[3], c: e[4] || undefined};
      else if (k === "t"){ if (isMine(e[1])) FX.push({tx: e[2], x: W/2, y: H - BOTH - 26, t: 90, c: "#fff", ui: 1}); }
      else if (k === "p"){ const [x, y] = slotXY(e[1], e[2]); FX.push({tx: e[3], x, y: y - .4, t: e[5] ? 50 : 70, c: e[4], cell: 1, nb: e[5]}); }
      else if (k === "r") FX.push({ring: 1, x: e[1], y: e[2], t: 26, c: e[3], r: 1.4});
      else if (k === "x"){ try { const f = JSON.parse(e[1]); if (fxOK(f)) FX.push(f); } catch(er){} }
      else if (k === "e"){ if (!isMine(e[1])) emShow(e[1], e[2], e[3], e[4]); } }); return; }
    const s = d.s; if (!s) return;
    if (s.w !== wave){ const nt = Math.floor((s.w - 1)/10) !== Math.floor((Math.max(1, wave) - 1)/10); wave = s.w; if (nt){ remap(); layerKey = ""; setSky(); } }
    speed = s.sp || 1; waveT = s.wt; state = s.st; score = s.sc; kills = s.kl; bossK = s.bk; if (s.lm) LIMIT = s.lm;
    MS = s.M ? {k: s.M[0], n: s.M[1], p: s.M[2], st: s.M[3]} : null;
    s.P.forEach((a, z) => { const p = Z[z]; if (!p) return; p.gold = a[0]; p.gems = a[1]; p.up = [a[2], a[3], a[4]]; p.sum = a[5];
      if (a[7] != null){ p.rel = {}; String(a[7]).split(",").filter(Boolean).forEach(x => { const [k, v] = x.split(":"); p.rel[k] = +v; }); p.it = String(a[8] || "").split(",").filter(Boolean); p.pick = a[9] ? String(a[9]).split(",") : null; p.clv = a[10] || 0; p.fev = a[11] || 0; } if (z === myIdx){ const ack = a[6]; outbox = outbox.filter(o => o[0] > ack); } });
    const old = new Map(E.map(e => [e.id, e]));
    E = s.E.map(a => { const o = old.get(a[0]), d0 = a[2]/100, kind = a[1];
      const e = o || {id: a[0], kind, l: a[5] || 0, d: d0, tr: d0, spd: KSPD(kind), f: a[0]*7, x: 0, y: 0};
      if (o){ let dd = d0 - o.d; if (Math.abs(dd) > 2) o.d = d0; else o.d += dd*.5; } e.hpR = a[3]/100; e.sl = a[4] & 1; e.stn = a[4] & 2; e.bn = a[4] & 4; e.cm = a[4] & 8; e.tt = a[6] || 0; e.sh = a[7] || 0; return e; });
    if (s.gv !== gv) PARTY.needGrid();
  }
  function guestStep(){
    frame++;
    for (const e of E){ if (!e.stn){ const v = e.spd*(e.sl ? .6 : 1)*speed; e.d += v; e.tr = (e.tr || 0) + v; } const pp = posAt(e.d, e.l); e.x = pp[0]; e.y = pp[1]; e.f++; }
    attack(true); emStep();
    if (outbox.length && frame % 6 === 0) PARTY.sendIn({sd: seed, a: outbox}, true);
  }
  function act(z, a){ if (party === "guest"){ outbox.push([++aseq, ...a]); if (frame % 6 !== 0) PARTY.sendIn({sd: seed, a: outbox}, true); if (a[0] === "sum") playS("sum"); return; } doAct(z, a); }

  /* ---------- 💬 이모티콘 · 말풍선 (같이 할 때: 빈 땅을 누르면 골라서 그 자리에 붙여요 → 친구 화면에도 떠요) ---------- */
  let EM = [], emPick = null;   // emPick: {x, y} 붙일 자리 (판 칸 단위)
  function emote(z, i, x, y){ emShow(z, i, x, y); if (party === "host") NQ.push(["e", z, i, +(+x).toFixed(2), +(+y).toFixed(2)]); }
  function emShow(z, i, x, y){ const t = RD_EMO[i]; if (!t) return; for (let k = EM.length - 1; k >= 0; k--) if (EM[k].z === z) EM.splice(k, 1);
    EM.push({z, t, x: +x, y: +y, k: 150}); if (!isMine(z)) tone(880, 1180, .07, "sine", .05); }
  function emStep(){ for (let k = EM.length - 1; k >= 0; k--) if (--EM[k].k <= 0) EM.splice(k, 1); }
  function emDraw(g, fr){
    if (emPick){ const x = cx(emPick.x), y = cy(emPick.y), r = 10 + Math.sin(fr*.25)*4; g.strokeStyle = RD_PC[local[0]] || "#fff"; g.lineWidth = 4; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); g.fillStyle = "#fff"; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
    for (const m of EM){ const big = /^\p{Extended_Pictographic}/u.test(m.t) && m.t.length <= 3, l = lbl(splitE(m.t), big ? 34 : 19, "#2b1d5c"),
        bw = l.w + 44, bh = Math.max(l.h, 30) + 10, x = Math.max(6, Math.min(W - bw - 6, cx(m.x) - bw/2)), lift = Math.min(1, (150 - m.k)/10), y = cy(m.y) - bh - 18 - lift*6;
      g.globalAlpha = Math.min(1, m.k/20, lift*1.5);
      g.fillStyle = "rgba(0,0,0,.25)"; rrect(g, x + 2, y + 4, bw, bh, 16); g.fill();
      g.fillStyle = "#fff"; rrect(g, x, y, bw, bh, 16); g.fill(); g.strokeStyle = RD_PC[m.z]; g.lineWidth = 3; g.stroke();
      const tx = Math.max(x + 14, Math.min(x + bw - 14, cx(m.x))); g.fillStyle = "#fff"; g.beginPath(); g.moveTo(tx - 9, y + bh - 1); g.lineTo(tx, y + bh + 12); g.lineTo(tx + 9, y + bh - 1); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = "#fff"; g.fillRect(tx - 7, y + bh - 3, 14, 4);
      faceAt(g, SIDS[m.z], x + 20, y + bh/2, 13, RD_PC[m.z]);
      G2.put(g, l, x + 36, y + (bh - l.h)/2); g.globalAlpha = 1; }
  }
  function emOpen(x, y){ emPick = {x, y}; const D = $("#ngDom"); let el = $("#rdEmo");
    if (!el){ el = document.createElement("div"); el.id = "rdEmo"; el.className = "rd-emo"; D.appendChild(el);
      el.innerHTML = `<div class="h">💬 친구들에게 보내기 <small>누른 자리에 떠요</small><button data-x>✕</button></div><div class="l">${RD_EMO.map((t, i) => `<button data-i="${i}"${/^\p{Extended_Pictographic}/u.test(t) && t.length <= 3 ? " class=e" : ""}>${t}</button>`).join("")}</div>`;
      const stop = e => e.stopPropagation(); ["pointerdown", "pointerup", "touchstart", "mousedown"].forEach(ev => el.addEventListener(ev, stop));
      el.onclick = e => { const b = e.target.closest("button"); if (!b) return; if (b.dataset.i != null && emPick){ act(local[0], ["emo", +b.dataset.i, Math.round(emPick.x*100), Math.round(emPick.y*100)]); if (party === "guest") emShow(local[0], +b.dataset.i, emPick.x, emPick.y); } emClose(); }; }
    el.hidden = false; }
  function emClose(){ emPick = null; const el = $("#rdEmo"); if (el) el.hidden = true; }

  /* ---------- 아래 단추 (사람마다) ---------- */
  function bars(){
    const L = []; const two = local.length >= 2;
    if (window.VK_ON){ local.forEach((z, si) => { const w = two && land ? W/2 : W, x0 = two && land ? si*W/2 : 0, y0 = two && !land ? H - BOTH + si*BOTH/2 : H - BOTH, h = two && !land ? BOTH/2 : BOTH; L.push({id: "info", z, x: x0 + 10, y: y0 + 6, w: w - 20, h: h - 12, info: 1, wide: 1}); });
      L.push({id: "spd", z: -1, x: W - 92, y: 8, w: 84, h: TOPH - 18}); L.push({id: "book", z: -1, x: W - 184, y: 8, w: 84, h: TOPH - 18}); return L; }
    local.forEach((z, si) => {
      const x0 = two ? (land ? si*W/2 : 0) : 0, w = two && land ? W/2 : W, y0 = two && !land ? H - BOTH + si*BOTH/2 : H - BOTH, h = two && !land ? BOTH/2 : BOTH;
      const pad = 10, rows = !land && !two ? 2 : 1;
      if (rows === 1){ const bw = (w - pad*2 - 8*6)/7, bh = h - 30;
        let x = x0 + pad; const yy = y0 + 22;
        const add = (id, ww, extra) => { L.push(Object.assign({id, z, x, y: yy, w: ww, h: bh}, extra || {})); x += ww + 8; };
        add("sum", bw*1.6); add("all", bw*.95); add("up", bw*.95); add("luck", bw*.95); add("bag", bw*1.45, {info: 1, bag: 1}); add("info", bw*1.1, {info: 1}); }
      else { const bh = (h - 44)/2, bw = (w - pad*2 - 16)/3;
        L.push({id: "sum", z, x: x0 + pad, y: y0 + 30, w: bw*1.25, h: bh}); L.push({id: "all", z, x: x0 + pad + bw*1.25 + 8, y: y0 + 30, w: bw*.85, h: bh}); L.push({id: "bag", z, x: x0 + pad + bw*2.1 + 16, y: y0 + 30, w: bw*.9, h: bh, info: 1, bag: 1});
        L.push({id: "up", z, x: x0 + pad, y: y0 + 38 + bh, w: bw, h: bh}); L.push({id: "luck", z, x: x0 + pad + bw + 8, y: y0 + 38 + bh, w: bw, h: bh}); L.push({id: "info", z, x: x0 + pad + 2*bw + 16, y: y0 + 38 + bh, w: bw, h: bh, info: 1}); }
    });
    L.push({id: "spd", z: -1, x: W - 92, y: 8, w: 84, h: TOPH - 18});   // ⏩ 속도: 같이 할 때도 누구나 (×1 → ×2 → ×4)
    L.push({id: "book", z: -1, x: W - 184, y: 8, w: 84, h: TOPH - 18});
    return L;
  }
  let BARS = [];
  function panelBtns(){ if (!panel) return []; const b = BARS.find(q => q.id === panel.id && q.z === panel.z); if (!b) return [];
    const n = panel.id === "up" ? 3 : 2, w = Math.min(330, W - 20), h = 64, x = Math.max(10, Math.min(W - w - 10, b.x + b.w/2 - w/2)), y0 = b.y - 14 - n*(h + 8);
    return Array.from({length: n}, (_, i) => ({id: panel.id, i, z: panel.z, x, y: y0 + i*(h + 8), w, h})); }
  function selBtns(){ if (!sel) return []; const q = Z[sel.z].s[sel.i]; if (!q.k) return []; const [x, y] = slotXY(sel.z, sel.i), px = cx(x), py = cy(y) - C*.62;
    const w = 112, h = 50, L = []; const can = q.n >= 3 && RD_A[q.k].g < RD_MAXG;
    L.push({id: "smrg", x: px - w - 4, y: py - h - 40, w, h, off: !can}); L.push({id: "ssel", x: px + 4, y: py - h - 40, w, h});
    L.forEach(b => { b.x = Math.max(6, Math.min(W - b.w - 6, b.x)); b.y = Math.max(TOPH + 4, b.y); }); return L; }
  const inR = (b, x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h + 6;
  function slotAt(x, y){ const c = Math.floor((x - BX)/C), r = Math.floor((y - BY)/C), h = CELL.get(c + "," + r); return h ? {z: h.z, i: h.i} : null; }
  function press(b){
    if (b.id === "sum") act(b.z, ["sum"]);
    else if (b.id === "all") act(b.z, ["all"]);
    else if (b.id === "up" || b.id === "luck"){ if (b.i != null){ act(b.z, b.id === "up" ? ["up", b.i] : ["luck", b.i]); } else panel = panel && panel.id === b.id && panel.z === b.z ? null : {id: b.id, z: b.z}; }
    else if (b.id === "book"){ if (RDB.isOpen) RDB.close(); else { const q = sel && Z[sel.z].s[sel.i]; RDB.open(q && q.k); } playS("warn"); }
    else if (b.id === "spd"){ act(local[0], ["spd"]); playS("warn"); }
    else if (b.id === "smrg"){ if (!b.off){ act(sel.z, ["mrg", sel.i]); sel = null; } }
    else if (b.id === "ssel"){ act(sel.z, ["sel", sel.i]); const q = Z[sel.z].s[sel.i]; if (!q.k || q.n <= 1) sel = null; }
  }

  /* ---------- 그리기 ---------- */
  let bookDrawn = false;   // 📖 도감 보는 동안(혼자·둘이)은 멈춘 화면을 한 번만 그리고 쉬어요
  function draw(g){
    if (RDB.isOpen && !party){ if (bookDrawn) return; bookDrawn = true; } else bookDrawn = false;
    g.clearRect(0, 0, W, H);
    const k = NG.k || 1; buildLayer(); boardBG();
    g.setTransform(1, 0, 0, 1, 0, 0); if (!bgURL) g.drawImage(layer, Math.round(BX*k), Math.round(BY*k));
    unitsLayer(k); g.drawImage(uL, Math.round(BX*k), Math.round(BY*k)); g.setTransform(k, 0, 0, k, 0, 0);
    const fr = NG.frame, us = Math.round(C*.62);
    // 3마리 모인 칸: 반짝이는 🔀 표시 (동물 그림은 위 한 장에 들어 있어요)
    for (let z = 0; z < N; z++){ if (!isMine(z)) continue; Z[z].s.forEach((q, i) => { if (!q.k || q.n < 3 || RD_A[q.k].g >= RD_MAXG) return; const [x, y] = slotXY(z, i); g.globalAlpha = .55 + Math.sin(fr*.15)*.4; G2.put(g, lbl(["🔀"], 20), cx(x - .5) + 1, cy(y - .5) - 2); g.globalAlpha = 1; }); }
    // 🌟 스킬 기력 막대 (꽉 차면 스킬!)
    for (let z = 0; z < N; z++){ if (!isMine(z)) continue; Z[z].s.forEach((q, i) => { if (!q.k || q.mp == null) return; const A = RD_A[q.k], r = Math.min(1, q.mp/A.sk.mp), [x, y] = slotXY(z, i), bw = C*.62, bx = cx(x) - bw/2, by = cy(y) + C*.4;
      g.fillStyle = "rgba(0,0,0,.5)"; g.fillRect(bx, by, bw, 5); g.fillStyle = r > .85 ? (fr % 12 < 6 ? "#fff3bf" : "#fcc419") : "#4dabf7"; g.fillRect(bx, by, bw*r, 5); }); }
    // 끌어서 옮길 때: 이 동물에게 좋은 자리 반짝
    if (drag && drag.on){ const q0 = Z[drag.z].s[drag.i]; if (q0.k){ const ro = RD_A[q0.k].ro; LN[drag.z].slots.forEach(([x, y], s) => { const good = ro === "m" ? isFront(drag.z, s) : ro === "r" ? !isFront(drag.z, s) : true;
      if (!good) return; g.globalAlpha = .4 + Math.sin(fr*.2)*.15; g.fillStyle = RD_ROLE[ro].c; rrect(g, cx(x - .45), cy(y - .45), C*.9, C*.9, C*.2); g.fill(); g.globalAlpha = 1; }); } }
    if (sel){ const [x, y] = slotXY(sel.z, sel.i), q = Z[sel.z].s[sel.i]; g.strokeStyle = "#fff"; g.lineWidth = 4; rrect(g, cx(x - .47), cy(y - .47), C*.94, C*.94, C*.18); g.stroke();
      if (q.k){ g.globalAlpha = .14; g.fillStyle = "#fff"; g.beginPath(); g.arc(cx(x), cy(y), (RD_A[q.k].r + .5*RL(sel.z, "rng"))*C, 0, 7); g.fill(); g.globalAlpha = .6; g.strokeStyle = "#fff"; g.lineWidth = 2; g.stroke(); g.globalAlpha = 1; } }
    // 몬스터
    const slS = [0, 1, 2, 3, 4].map(kd => [slimeSpr(kd, 0), slimeSpr(kd, 1)]);
    for (const e of E){ const s = slS[e.kind][(e.f >> 4) & 1], sz = s.w, x = cx(e.x), y = cy(e.y);
      if (e.tt === 3) g.globalAlpha = .55; if (e.tt === 2){ const wy = y - sz*.35 + Math.sin(e.f*.3)*3; g.drawImage(ttSpr(2), x - sz*.62, wy - 12, 24, 24); g.drawImage(ttSpr(2), x + sz*.38, wy - 12, 24, 24); }
      G2.put(g, s, x - sz/2, y - sz*.7 - (e.tt === 2 ? 8 : 0)); g.globalAlpha = 1;
      const hr = e.hpR != null ? e.hpR : e.hp/e.mhp; if (hr < .999){ const bw = sz*.7; g.fillStyle = "rgba(0,0,0,.55)"; g.fillRect(x - bw/2, y - sz*.72, bw, 5); g.fillStyle = hr > .5 ? "#51cf66" : hr > .25 ? "#fcc419" : "#ff6b6b"; g.fillRect(x - bw/2, y - sz*.72, bw*hr, 5); }
      if (e.tt){ const b = ttSpr(e.tt); g.drawImage(b, x + sz*.18, y - sz*.95, 22, 22); if (e.tt === 4 && e.sh > 0){ g.fillStyle = "#fff"; g.font = `bold 12px sans-serif`; g.fillText(e.sh, x + sz*.18 + 24, y - sz*.95 + 16); } }
      if ((e.co || 0) >= 3 || e.cm) g.drawImage(ttSpr(8), x - sz*.5 - 6, y - sz*.95, 20, 20);
      if (e.bnT > 0 || e.bn){ g.globalAlpha = .7 + Math.sin(e.f*.4)*.3; g.drawImage(ttSpr(9), x - 10, y - sz*.4, 20, 20); g.globalAlpha = 1; }
      if (e.stT > 0 || e.stn) outlined(g, "💫", x, y - sz*.8, 16, "#fff");
      if (e.slT > 0 || e.sl){ g.fillStyle = "rgba(116,192,252,.35)"; g.beginPath(); g.ellipse(x, y + sz*.18, sz*.4, sz*.12, 0, 0, 7); g.fill(); } }
    // 총알
    if (PR.length > 90) PR.splice(0, PR.length - 90);
    for (let i = PR.length - 1; i >= 0; i--){ const p = PR[i]; p.t++; const a = p.t/p.T, tx = p.e && E.includes(p.e) ? p.e.x : p.x1, ty = p.e && E.includes(p.e) ? p.e.y : p.y1; p.x1 = tx; p.y1 = ty;
      const x = cx(p.x0 + (tx - p.x0)*a), y = cy(p.y0 + (ty - p.y0)*a) - Math.sin(a*Math.PI)*C*.22, sh = RDA.shotSpr(p.k, p.g);
      if (p.t > 1){ const a0 = (p.t - 2)/p.T, x0 = cx(p.x0 + (tx - p.x0)*a0), y0 = cy(p.y0 + (ty - p.y0)*a0) - Math.sin(a0*Math.PI)*C*.22; g.globalAlpha = .35; g.drawImage(sh, x0 - sh.w*.35, y0 - sh.h*.35, sh.w*.7, sh.h*.7); g.globalAlpha = 1; }
      G2.put(g, sh, x - sh.w/2, y - sh.h/2);
      if (p.t >= p.T) PR.splice(i, 1); }
    // 효과
    for (let i = FX.length - 1; i >= 0; i--){ const f = FX[i]; f.t--; if (f.t <= 0){ FX.splice(i, 1); continue; }
      if (f.ring){ const T = 26, a = 1 - f.t/T, rr = (f.r || 1)*C*(.3 + a*.7); g.globalAlpha = Math.min(1, f.t/10)*.8; g.drawImage(ringSpr(f.c), cx(f.x) - rr, cy(f.y) - rr, rr*2, rr*2); g.globalAlpha = 1; continue; }
      if (f.nova){ f.T = f.T || f.t + 1; const a = 1 - f.t/f.T, rr = (f.r || 2)*C*(.2 + a*.9), x = cx(f.x), y = cy(f.y); g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = Math.min(1, f.t/12)*.85;
        g.drawImage(novaSpr(f.c), x - rr, y - rr, rr*2, rr*2); g.restore(); continue; }
      if (f.flash){ f.T = f.T || f.t + 1; g.globalAlpha = f.t/f.T*.35; g.fillStyle = f.c; g.fillRect(0, 0, W, H); g.globalAlpha = 1; continue; }
      if (f.bolt || f.beam){ g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = Math.min(1, f.t/8); g.strokeStyle = f.c; g.shadowColor = f.c; g.shadowBlur = 12; g.lineWidth = f.beam ? 10 : 5; g.lineCap = "round";
        const x1 = cx(f.x), y1 = cy(f.y), x2 = cx(f.x2), y2 = cy(f.y2); g.beginPath(); g.moveTo(x1, y1);
        if (f.bolt){ for (let k = 1; k < 5; k++){ const u = k/5; g.lineTo(x1 + (x2 - x1)*u + ((k*37 + f.t*11) % 22) - 11, y1 + (y2 - y1)*u + ((k*53 + f.t*7) % 22) - 11); } }
        g.lineTo(x2, y2); g.stroke(); g.lineWidth = f.beam ? 3 : 2; g.strokeStyle = "#fff"; g.stroke(); g.restore(); continue; }
      if (f.ice){ g.globalAlpha = Math.min(1, f.t/10); G2.put(g, iceSpr(), cx(f.x) - C*.35, cy(f.y) - C*.55); g.globalAlpha = 1; continue; }
      if (f.pillar){ f.T = f.T || f.t + 1; const a = f.t/f.T, x = cx(f.x), y = cy(f.y), bw = C*1.4; g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = a*.8;
        g.fillStyle = BSA.lg(g, 0, y - C*3, 0, y + C*.4, [[0, "rgba(255,255,255,0)"], [.6, f.c], [1, "#fff"]]); g.fillRect(x - bw/2, y - C*3, bw, C*3.4); g.drawImage(novaSpr(f.c), x - C*2.3, y - C*2.3, C*4.6, C*4.6); g.restore(); continue; }
      if (f.tx && f.cell && !f.sm && !f.nb && f.t > 40 && !/^\+/.test(f.tx)){   // ✨ 뽑기·합치기: 칸 위로 빛기둥
        const a = (f.t - 40)/30, bx = cx(f.x), by0 = cy(f.y + .4), bw = C*.62*(.6 + a*.4);
        g.globalAlpha = a*.8; g.fillStyle = BSA.lg(g, 0, by0 - C*1.6, 0, by0, [[0, "rgba(255,255,255,0)"], [.7, f.c], [1, "#ffffff"]]); g.fillRect(bx - bw/2, by0 - C*1.6, bw, C*1.6);
        if (f.c === RD_G[3].c || f.c === RD_G[4].c){ g.globalAlpha = a*.35; g.fillStyle = f.c === RD_G[4].c ? "#ffd6f5" : "#fff3bf"; g.fillRect(0, 0, W, H); }
        g.globalAlpha = 1; }
      if (f.tx){ g.globalAlpha = Math.min(1, f.t/18); const x = f.cell ? cx(f.x) : f.x, y = (f.cell ? cy(f.y) : f.y) - (f.ui ? 0 : (70 - f.t)*.5); G2.put(g, lbl(splitE(f.tx), f.sm ? 14 : f.ui ? 22 : 18, f.c), x - lbl(splitE(f.tx), f.sm ? 14 : f.ui ? 22 : 18, f.c).w/2, y - 14); g.globalAlpha = 1; } }
    // 친구 이름표
    if (N > 1) for (let z = 0; z < N; z++){ const [ox, oy] = ZO[z]; faceAt(g, SIDS[z], cx(ox) + 14, cy(oy) + 14, 13, RD_PC[z]); }
    // 🔥 응원 깃발: 내 칸 테두리가 활활
    local.forEach(z => { if (Z[z].fev > 0 && LN[z]){ const L = LN[z]; g.globalAlpha = .55 + Math.sin(fr*.3)*.3; g.strokeStyle = "#ff922b"; g.lineWidth = 6; rrect(g, cx(L.ox) + 3, cy(L.oy) + 3, L.w*C - 6, L.h*C - 6, C*.4); g.stroke(); g.globalAlpha = 1; } });
    // 🚨 마을이 위험하면 화면 가장자리가 빨갛게
    { const r = E.length/LIMIT; if (r > .55){ const a = Math.min(1, (r - .55)/.35)*(.55 + Math.sin(fr*.18)*.25); g.globalAlpha = a; G2.put(g, sp(`vig${W}x${H}`, W, H, t => { const gr = t.createRadialGradient(W/2, H/2, Math.min(W, H)*.35, W/2, H/2, Math.max(W, H)*.65); gr.addColorStop(0, "rgba(255,0,40,0)"); gr.addColorStop(1, "rgba(255,0,40,.75)"); t.fillStyle = gr; t.fillRect(0, 0, W, H); }), 0, 0); g.globalAlpha = 1; } }
    emDraw(g, fr); drawTop(g, fr); drawBottom(g); bagDraw(g); drawMission(g, fr);
    if (party === "guest" && performance.now() - (PARTY.rxT || 0) > 2500){ g.fillStyle = "rgba(10,6,30,.55)"; g.fillRect(0, H/2 - 60, W, 120); outlined(g, "📡 방장 화면을 받고 있어요…", W/2, H/2 - 6, 38, "#ffe066"); outlined(g, PARTY.hp && PARTY.hp.relay ? "☁️ 다리(저장소)로 연결 중 · 잠깐만 기다려요" : "자동으로 다시 이어요 · 나가지 말고 기다려요", W/2, H/2 + 36, 22, "#fff"); }
    if (banner && banner.k > 0){ g.globalAlpha = Math.min(1, banner.k/18); outlined(g, banner.t, W/2, BY + ROWS*C*.42, land ? 60 : 50, banner.c || "#fff"); if (banner.s) outlined(g, banner.s, W/2, BY + ROWS*C*.42 + 52, 26, "#ffe066"); g.globalAlpha = 1; }
    pickDraw(g);
  }
  let uL = null, uV = "";
  function unitsLayer(k){
    const key = `${gv}|${layerKey}|${k}`; if (key === uV && uL) return; uV = key;
    uL = uL || document.createElement("canvas"); const w = Math.ceil(COLS*C*k), h = Math.ceil(ROWS*C*k); if (uL.width !== w || uL.height !== h){ uL.width = w; uL.height = h; }
    const t = uL.getContext("2d"); t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, w, h); t.setTransform(k, 0, 0, k, 0, 0);
    const us = Math.round(C*.62);
    for (let z = 0; z < N; z++) Z[z].s.forEach((q, i) => { if (!q.k) return; const [x, y] = slotXY(z, i), n = q.n, s = Math.round(C*(n === 1 ? .94 : n === 2 ? .7 : .62)), spr = unitSpr(q.k, s);
      if (n >= 3 && RD_A[q.k].g < RD_MAXG && isMine(z)){ t.globalAlpha = .5; t.fillStyle = RD_G[RD_A[q.k].g + 1].c; rrect(t, (x - .46)*C, (y - .46)*C, C*.92, C*.92, C*.18); t.fill(); t.globalAlpha = 1; }
      for (let u = 0; u < n; u++){ const o = UOFF[n - 1][u]; t.drawImage(spr, Math.round((x + o[0])*C - s/2), Math.round((y + o[1])*C - s/2), s, s); }
      if (n >= 2){ const l = lbl([`×${n}`], 13, n >= 3 ? "#ffe066" : "#fff"); t.drawImage(l, (x + .48)*C - 30, (y + .5)*C - 22, l.w, l.h); }
      const sy = SYN && SYN[z] && SYN[z][i]; if (sy){ const l = lbl([sy], 12, "#fff"); t.drawImage(l, (x - .48)*C, (y - .5)*C, l.w, l.h); }
      const A = RD_A[q.k], RO = RD_ROLE[A.ro || "r"], bs = Math.round(C*.26);   // ⚔️🏹✨ 역할 표시
      t.drawImage(sp(`rb${A.ro}${bs}`, bs, bs, b => { b.fillStyle = RO.c; b.beginPath(); b.arc(bs/2, bs/2, bs/2 - 1, 0, 7); b.fill(); b.strokeStyle = "#fff"; b.lineWidth = 2; b.stroke(); G2.emo(b, RO.e, bs/2, bs/2 + 1, bs*.62); }), (x - .47)*C, (y - .47)*C, bs, bs);
      if (A.ro === "m" && !isFront(z, i)){ const l = lbl(["⚠️", "길에서 멀어요"], 11, "#ffe066"); t.drawImage(l, x*C - l.w/2, (y + .2)*C, l.w, l.h); } });
  }
  /* 🎯 미션 · 내 유물 · 다음 보스 (위 막대 아래 한 줄) */
  function drawMission(g, fr){
    const y = TOPH + 2, parts = [];
    if (MS){ const D = RD_MS[MS.k], done = MS.st === 1, fail = MS.st === 2, prog = ["merge", "sum", "kill"].includes(MS.k) ? ` ${Math.min(MS.p, MS.n)}/${MS.n}` : MS.k === "keep" ? ` (지금 ${E.length})` : "";
      parts.push({l: lbl([done ? "✅" : fail ? "❌" : D.e, `미션: ${D.t(MS.n)}${prog}`, ...(done ? [] : ["→", "🎒"])], 15, done ? "#8ce99a" : fail ? "#ffa8a8" : "#fff"), c: done ? "rgba(43,138,62,.75)" : fail ? "rgba(120,30,30,.7)" : "rgba(15,10,40,.72)"}); }
    else if (wave % 10 === 0) parts.push({l: lbl(["👑", "보스를 잡으면 🎁 유물 상자!"], 15, "#ffe066"), c: "rgba(90,20,40,.78)"});
    if (wave % 10) parts.push({l: lbl(["👑", `보스까지 ${10 - wave % 10}단계`], 14, "#ffd8a8"), c: "rgba(15,10,40,.6)"});
    parts.push({l: lbl(["🌀", `${dimOf(wave)}차원`, `· ${wave}/${RD_END}`], 14, "#e5dbff"), c: "rgba(60,20,90,.7)"});
    if (N >= 3) parts.push({l: lbl(["🎌", TEAM > 1 ? `역할 분담 +${Math.round((TEAM - 1)*100)}%` : "역할 분담: 친구마다 ⚔️🏹✨ 주력을 나눠요"], 14, TEAM > 1 ? "#8ce99a" : "#ced4da"), c: "rgba(15,10,40,.6)"});
    const rel = Object.entries(Z[local[0]].rel || {}); if (rel.length) parts.push({l: lbl(rel.flatMap(([k, v]) => [RD_REL[k].e, v > 1 ? `${v}` : ""]).filter(Boolean), 14, "#ffe066"), c: "rgba(15,10,40,.6)"});
    let tw = parts.reduce((a, q) => a + q.l.w + 22, -8), x = W/2 - tw/2;
    parts.forEach(q => { g.fillStyle = q.c; rrect(g, x, y, q.l.w + 14, q.l.h + 2, 12); g.fill(); G2.put(g, q.l, x + 7, y + 1); x += q.l.w + 22; });
  }
  const splitE = s => s.split(/(\p{Extended_Pictographic}️?)/u).filter(Boolean).map(x => x.trim()).filter(Boolean);
  function drawTop(g, fr){
    g.fillStyle = "rgba(15,10,40,.62)"; rrect(g, 8, 6, W - 16, TOPH - 12, 16); g.fill();
    G2.put(g, lbl(["🏁", `${wave}단계`], 24, "#ffe066"), 18, 12);
    const n = E.length, r = Math.min(1, n/LIMIT), bw = Math.min(380, W*.36), bx = W/2 - bw/2, by = TOPH/2 - 10;
    g.fillStyle = "rgba(0,0,0,.4)"; rrect(g, bx, by, bw, 20, 10); g.fill(); g.fillStyle = r > .8 ? (fr % 20 < 10 ? "#ff6b6b" : "#c92a2a") : r > .55 ? "#fcc419" : "#51cf66"; rrect(g, bx, by, Math.max(20, bw*r), 20, 10); g.fill();
    G2.put(g, lbl(["👾", `${n} / ${LIMIT}`], 16), W/2 - lbl(["👾", `${n} / ${LIMIT}`], 16).w/2, by - 3);
    const boss = E.find(e => e.kind === 2), sec = Math.ceil(Math.max(0, waveT)/60);
    const tl = lbl([boss ? "⏰" : "⏱️", `${sec}초`], 20, boss && sec < 15 ? "#ff6b6b" : "#fff"); G2.put(g, tl, W - (party !== "guest" ? 192 : 100) - tl.w, 14);
    { const b = BARS.find(q => q.id === "book"); if (b) G2.put(g, btnSpr(b.w, b.h, "#63e6be", "#0ca678", ["📖", "도감"], 16), b.x, b.y); }
    if (land) G2.put(g, lbl([th().n.split(" ")[0], th().n.split(" ").slice(1).join(" ")], 16, "#d0bfff"), 140, 16);
    { const b = BARS.find(q => q.id === "spd"); if (b) G2.put(g, btnSpr(b.w, b.h, speed === 4 ? "#ff6b6b" : speed > 1 ? "#ff922b" : "#748ffc", speed === 4 ? "#c92a2a" : speed > 1 ? "#e8590c" : "#4c6ef5", ["⏩", `×${speed}`], 17), b.x, b.y); }
  }
  let bL = null, bV = "";
  function drawBottom(g){
    const k = NG.k || 1, sig = [k, W, H, BOTH, BARS.length, local.map(z => { const p = Z[z]; return [Math.floor(p.gold), p.gems, sumCost(z), p.up.join(""), p.s.some(q => q.k && q.n >= 3 && RD_A[q.k].g < RD_MAXG) ? 1 : 0, p.it.length, bagN(z)].join(","); }).join("|")].join("/");
    if (sig !== bV || !bL){ bV = sig; bL = bL || document.createElement("canvas"); const w = Math.ceil(W*k), h = Math.ceil(BOTH*k) + 2; if (bL.width !== w || bL.height !== h){ bL.width = w; bL.height = h; }
      const t = bL.getContext("2d"); t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, bL.width, bL.height); t.setTransform(k, 0, 0, k, 0, -(H - BOTH)*k); barsDraw(t); }
    g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(bL, 0, Math.round((H - BOTH)*k)); g.setTransform(k, 0, 0, k, 0, 0);
    popsDraw(g);
  }
  function barsDraw(g){
    g.fillStyle = "rgba(15,10,40,.78)"; g.fillRect(0, H - BOTH, W, BOTH); g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(0, H - BOTH, W, 2);
    BARS.forEach(b => { if (b.id === "spd") return; if (b.z < 0) return; const p = Z[b.z]; if (!p) return; const col = RD_PC[b.z];
      if (b.id === "sum"){ const c = sumCost(b.z), off = p.gold < c; G2.put(g, btnSpr(Math.round(b.w), Math.round(b.h), "#ffd43b", "#f08c00", ["🎲", "뽑기", "💰", rdN(c)], Math.min(land ? 27 : 28, Math.floor(b.w*.15)), off), b.x, b.y); }
      else if (b.id === "all"){ const can = p.s.some(q => q.k && q.n >= 3 && RD_A[q.k].g < RD_MAXG); G2.put(g, btnSpr(Math.round(b.w), Math.round(b.h), "#69db7c", "#2b8a3e", ["🔀", "합치기"], Math.min(24, Math.floor(b.w*.19)), !can), b.x, b.y); }
      else if (b.id === "up") G2.put(g, btnSpr(Math.round(b.w), Math.round(b.h), "#74c0fc", "#1971c2", ["⬆️", "강화"], Math.min(24, Math.floor(b.w*.22)), false), b.x, b.y);
      else if (b.id === "luck") G2.put(g, btnSpr(Math.round(b.w), Math.round(b.h), "#e599f7", "#9c36b5", ["💎", "행운"], Math.min(24, Math.floor(b.w*.22)), p.gems < 1), b.x, b.y);
      else if (b.id === "bag"){ g.fillStyle = "rgba(255,255,255,.06)"; rrect(g, b.x, b.y, b.w, b.h, 14); g.fill(); g.strokeStyle = "rgba(255,212,59,.6)"; g.lineWidth = 2; g.setLineDash([6, 5]); g.stroke(); g.setLineDash([]);
        G2.put(g, lbl(["🎒", `가방 ${p.it.length}/${bagN(b.z)}`], 13, "#ffe066"), b.x + 6, b.y - 18); }
      else if (b.id === "info"){ g.fillStyle = "rgba(255,255,255,.08)"; rrect(g, b.x, b.y, b.w, b.h, 14); g.fill(); g.strokeStyle = col; g.lineWidth = 3; g.stroke();
        if (b.wide){ const l1 = lbl(["💰", rdN(p.gold), "💎", String(p.gems), "🎲", `뽑기 ${rdN(sumCost(b.z))}`, "⬆️", `Lv ${p.up.join("·")}`], 22, "#ffe066"); G2.put(g, l1, b.x + 12, b.y + b.h/2 - l1.h/2); }
        else { const f1 = Math.min(26, Math.floor(b.w*.2)); G2.put(g, lbl(["💰", rdN(p.gold)], f1, "#ffe066"), b.x + 8, b.y + b.h*.5 - f1 - 10); G2.put(g, lbl(["💎", String(p.gems)], Math.min(22, f1), "#e5dbff"), b.x + 8, b.y + b.h*.5 + 2); }
        if (local.length >= 2 || N > 1) faceAt(g, SIDS[b.z], b.x + b.w - 4, b.y + 4, 14, col); } });
  }
  /* 🎒 가방 아이템 단추 (누르면 바로 써요) */
  function bagIcons(){ const L = []; BARS.forEach(b => { if (!b.bag) return; const p = Z[b.z], n = Math.max(1, p.it.length), s = Math.min(b.h - 12, (b.w - 10)/Math.min(n, 5) - 6);
    p.it.slice(0, 5).forEach((k, i) => L.push({id: "it", z: b.z, i, k, x: b.x + 6 + i*(s + 6), y: b.y + (b.h - s)/2, w: s, h: s})); }); return L; }
  function bagDraw(g){
    BARS.forEach(b => { if (b.bag && !Z[b.z].it.length) G2.put(g, lbl(["보스·미션에서 받아요"], 13, "#bfb3e8"), b.x + 8, b.y + b.h/2 - 12); });
    bagIcons().forEach(b => { const s = Math.round(b.w); G2.put(g, sp(`it${b.k}${s}`, s, s + 4, t => { t.fillStyle = "rgba(0,0,0,.3)"; rrect(t, 0, 4, s, s, s*.25); t.fill();
      t.fillStyle = BSA.lg(t, 0, 0, 0, s, [[0, "#fff6d6"], [1, "#ffc94d"]]); rrect(t, 0, 0, s, s, s*.25); t.fill(); t.strokeStyle = "#fff"; t.lineWidth = 2; t.stroke(); G2.emo(t, RD_IT[b.k].e, s/2, s/2, s*.6); }), b.x, b.y); });
    local.forEach(z => { const p = Z[z]; if (p.fev > 0 || p.clv > 0){ const b = BARS.find(q => q.bag && q.z === z); if (b) G2.put(g, lbl([...(p.fev > 0 ? ["🔥", `${Math.ceil(p.fev/60)}초`] : []), ...(p.clv > 0 ? ["🍀", `×${p.clv}`] : [])], 13, "#ffd8a8"), b.x + b.w - 92, b.y - 18); } });
  }
  /* 🎁 유물 고르기 카드 (보스를 잡으면) */
  function pickCards(){ const L = []; local.forEach((z, si) => { const p = Z[z]; if (!p.pick) return; const two = local.length >= 2;
    const ax = two && land ? si*W/2 : 0, aw = two && land ? W/2 : W, ay = two && !land ? TOPH + si*(H - TOPH - BOTH)/2 : TOPH, ah = two && !land ? (H - TOPH - BOTH)/2 : H - TOPH - BOTH;
    const cw = Math.min(230, (aw - 60)/3), ch = Math.min(ah - 110, cw*1.25), y = ay + (ah - ch)/2 + 22;
    p.pick.forEach((k, j) => L.push({id: "rel", z, i: j, k, x: ax + aw/2 + (j - 1)*(cw + 14) - cw/2, y, w: cw, h: ch, ax, aw, ay, ah})); }); return L; }
  function pickDraw(g){ const L = pickCards(); if (!L.length) return; const done = new Set();
    L.forEach(b => { if (!done.has(b.z)){ done.add(b.z); g.fillStyle = "rgba(10,5,30,.72)"; g.fillRect(b.ax, b.ay, b.aw, b.ah); outlined(g, "🎁 유물을 하나 골라요!", b.ax + b.aw/2, b.y - 30, land ? 34 : 30, "#ffe066"); }
      const R0 = RD_REL[b.k], lv = RL(b.z, b.k), s = Math.round(b.w), hh = Math.round(b.h);
      G2.put(g, sp(`rc${b.k}${s}x${hh}`, s, hh + 6, t => { t.fillStyle = "rgba(0,0,0,.35)"; rrect(t, 0, 6, s, hh, 18); t.fill();
        t.fillStyle = BSA.lg(t, 0, 0, 0, hh, [[0, "#5f3dc4"], [1, "#2b1d6b"]]); rrect(t, 0, 0, s, hh, 18); t.fill(); t.strokeStyle = "#ffd43b"; t.lineWidth = 4; t.stroke();
        t.fillStyle = BSA.rg(t, s/2, hh*.3, 2, s*.4, [[0, "rgba(255,230,140,.6)"], [1, "rgba(255,230,140,0)"]]); t.fillRect(0, 0, s, hh*.6);
        G2.emo(t, R0.e, s/2, hh*.3, Math.min(s, hh)*.32); outlinedRaw(t, R0.n, s/2, hh*.56, Math.min(24, s*.11), "#fff");
        t.fillStyle = "#e5dbff"; t.font = `${Math.min(16, s*.075)}px "Jua",sans-serif`; t.textAlign = "center"; t.textBaseline = "middle";
        const words = R0.d.split(" "), lines = []; let cur = ""; words.forEach(w0 => { const tt = cur ? cur + " " + w0 : w0; if (t.measureText(tt).width > s - 20){ lines.push(cur); cur = w0; } else cur = tt; }); if (cur) lines.push(cur);
        lines.slice(0, 3).forEach((l, i) => t.fillText(l, s/2, hh*.7 + i*Math.min(20, s*.09))); }), b.x, b.y);
      G2.put(g, lbl([lv ? `지금 Lv.${lv} → ${lv + 1}` : "새 유물!", local.length < 2 ? `[${b.i + 1}]` : ""].filter(Boolean), 14, "#ffe066"), b.x + 10, b.y + b.h - 26); });
  }
  function popsDraw(g){
    panelBtns().forEach(b => { const p = Z[b.z];
      if (b.id === "up"){ const nm = ["⚪🔵", "🟣🟡", "🌈"][b.i], c = upCost(b.z, b.i), lv = p.up[b.i];
        G2.put(g, btnSpr(Math.round(b.w), b.h, "#74c0fc", "#1864ab", [...splitE(nm), ["일반·희귀", "영웅·전설", "신화"][b.i], `Lv${lv}`, "💰", rdN(c)], 18, p.gold < c), b.x, b.y); }
      else { const c = b.i ? 4 : 1; G2.put(g, btnSpr(Math.round(b.w), b.h, "#e599f7", "#862e9c", b.i ? ["🌈", "신화 35%·전설", "💎", "4"] : ["🎁", "영웅 55%·전설 15%", "💎", "1"], 17, p.gems < c), b.x, b.y); } });
    selBtns().forEach(b => { const q = Z[sel.z].s[sel.i]; if (!q.k) return;
      if (b.id === "smrg") G2.put(g, btnSpr(b.w, b.h, "#69db7c", "#2b8a3e", ["🔀", "합치기"], 17, b.off), b.x, b.y);
      else G2.put(g, btnSpr(b.w, b.h, "#ff8787", "#c92a2a", ["💰", `팔기 +${RD_G[RD_A[q.k].g].sell}`], 16), b.x, b.y); });
    if (sel){ const q = Z[sel.z].s[sel.i]; if (q.k){ const A = RD_A[q.k], RO = RD_ROLE[A.ro], fr0 = isFront(sel.z, sel.i), [x, y] = slotXY(sel.z, sel.i);
      const tip = A.ro === "m" ? (fr0 ? "길 바로 옆이라 딱 좋아요!" : "길에서 멀어서 못 닿아요! 길 옆(⚔️ 칸)으로 옮겨요") : A.ro === "r" ? (fr0 ? "뒷줄(🏹 칸)에 두면 공격 +25%" : "뒷줄 명사수! 공격 +25%") : "옆 친구들을 도와요";
      const l = lbl([A.e, `${A.n}`, `(${RD_G[A.g].n})`, RO.e, RO.n, `공격 ${rdN(A.d*upMul(sel.z, A.g)*relMul(sel.z, A, null)*(A.ro === "r" && !fr0 ? 1.25 : 1))}`, "·", A.t], 15, RD_G[A.g].c2);
      const l2 = lbl(["🌟", `스킬 ${A.sk.e} ${A.sk.n}: ${A.sk.d}`], 14, "#ffe066"), l3 = lbl([A.ro === "m" && !fr0 ? "⚠️" : "💡", tip], 14, A.ro === "m" && !fr0 ? "#ffa8a8" : "#c5f6fa");
      const w0 = Math.max(l.w, l2.w, l3.w), px = Math.max(6, Math.min(W - w0 - 6, cx(x) - w0/2)), py0 = cy(y) - C*.62 - 76, py = py0 < TOPH + 40 ? cy(y) + C*.62 : py0;
      g.fillStyle = "rgba(15,10,40,.88)"; rrect(g, px - 8, py - 6, w0 + 16, l.h*3 + 10, 12); g.fill(); g.strokeStyle = RO.c; g.lineWidth = 2; g.stroke();
      G2.put(g, l, px, py); G2.put(g, l2, px, py + l.h); G2.put(g, l3, px, py + l.h*2); } }
    if (drag && drag.on){ const q = Z[drag.z].s[drag.i]; if (q.k){ const s = Math.round(C*.94); g.globalAlpha = .85; g.drawImage(unitSpr(q.k, s), drag.x - s/2, drag.y - s/2, s, s); g.globalAlpha = 1; } }
  }

  /* ---------- 손가락 ---------- */
  function down(x, y, id){
    getAC && getAC();
    const pc = pickCards(); if (pc.length){ for (const b of pc){ if (inR(b, x, y)){ act(b.z, ["rel", b.i]); playS("up"); return; } } if (pc.some(b => x >= b.ax && x <= b.ax + b.aw && y >= b.ay && y <= b.ay + b.ah)) return; }
    for (const b of bagIcons()){ if (inR(b, x, y)){ act(b.z, ["it", b.i]); return; } }
    for (const b of selBtns()){ if (inR(b, x, y)){ press(b); return; } }
    for (const b of panelBtns()){ if (inR(b, x, y)){ press(b); return; } }
    for (const b of BARS){ if (!b.info && inR(b, x, y)){ press(b); if (b.id !== "up" && b.id !== "luck") panel = null; return; } }
    panel = null;
    const s = slotAt(x, y);
    if (emPick && !s){ emClose(); }
    if (s && isMine(s.z)){ emClose(); ptr.set(id, {sx: x, sy: y}); drag = {z: s.z, i: s.i, x, y, on: false, id}; return; }
    // 💬 같이 할 때: 빈 땅을 누르면 이모티콘·말풍선 고르기
    if (N > 1 && !s && !sel && x > BX && x < BX + COLS*C && y > BY && y < BY + ROWS*C){ emOpen((x - BX)/C, (y - BY)/C); return; }
    sel = null;
  }
  function move(x, y, id){ if (!drag || drag.id !== id) return; drag.x = x; drag.y = y; const p = ptr.get(id); if (p && Math.hypot(x - p.sx, y - p.sy) > 14 && Z[drag.z].s[drag.i].k) drag.on = true; }
  function up(x, y, id){ if (!drag || drag.id !== id) return; const d = drag; drag = null; ptr.delete(id);
    if (d.on){ const s = slotAt(x, y); if (s && s.z === d.z && s.i !== d.i){ act(d.z, ["mov", d.i, s.i]); if (sel && sel.z === d.z) sel = {z: d.z, i: s.i}; playS("sell"); } return; }
    sel = sel && sel.z === d.z && sel.i === d.i ? null : (Z[d.z].s[d.i].k ? {z: d.z, i: d.i} : null); }

  /* 💾 자동 저장: 혼자·둘이 할 때 3초마다 + 나갈 때 저장 → 다음에 '이어하기'로 그대로 (도감 보러 나가도, 창이 닫혀도) */
  const SKEY = RDS.key(SIDS);
  /* 🏪 판 시작: 🔬 연구 적용(모두) + 🎒 준비물 꺼내기(혼자·둘이, 이 기기 사람만) */
  function applyKit(){
    const msg = [];
    Z.forEach((p, z) => {
      p.pk = RDP.perk(SIDS[z]);
      if (p.pk.gold) p.gold += 25*p.pk.gold;
      if (party || !local.includes(z)) return;
      const kit = RDP.takeKit(SIDS[z], Math.max(0, bagN(z) - p.it.length));
      if (kit.items.length) p.it = p.it.concat(kit.items).slice(0, bagN(z));
      if (kit.rare) p.minG = 1;
      if (kit.hero){ const k = pick(2), i = placeK(z, k); if (i >= 0) popAt(z, i, `🦸 ${RD_A[k].e} ${RD_A[k].n}!`, RD_G[2].c); }
      if (kit.legend){ const k = pick(3), i = placeK(z, k); if (i >= 0) popAt(z, i, `🌟 ${RD_A[k].e} ${RD_A[k].n}!`, RD_G[3].c); }
      const P = p.pk, bits = [];
      if (P.level > 1) bits.push(`🎓 Lv.${P.level}`);
      if (P.atk) bits.push(`💪+${P.atk*4}%`); if (P.spd) bits.push(`⚡+${P.spd*3}%`);
      if (kit.items.length) bits.push(`🎒 ${kit.items.map(k => RD_IT[k].e).join("")}`);
      if (kit.rare) bits.push("👑 희귀 이상 뽑기"); if (kit.hero) bits.push("🦸 영웅"); if (kit.legend) bits.push("🌟 전설");
      if (bits.length) msg.push((N > 1 ? nameOf(noOf_(SIDS[z])) + " " : "") + bits.join(" · "));
    });
    gv++;
    if (msg.length) banner = {t: "🏪 준비 완료!", s: msg.join("  /  ").slice(0, 90), k: 150, c: "#ffe066"};
  }
  function saveGame(){
    if (party || !Z || ended || state !== "play" || wave < 1) return;
    try { localStorage.setItem(SKEY, JSON.stringify({v: 1, at: Date.now(), sids: SIDS, local, seed, rs: R.get(), wave, waveT, spawnLeft, spawnT, score, kills, bossK, eid, speed, bossTimer, laneRR, MS, TB,
      Z: Z.map(p => Object.assign({}, p, {s: p.s.map(q => ({k: q.k, n: q.n, cd: [0, 0, 0], hit: 0}))})),
      E: E.map(e => ({id: e.id, kind: e.kind, l: e.l, d: e.d, tr: e.tr, hp: e.hp, mhp: e.mhp, spd: e.spd, slT: e.slT, slF: e.slF, stT: e.stT, f: e.f, tt: e.tt || 0, sh: e.sh || 0, bnT: e.bnT || 0, bnD: e.bnD || 0}))})); } catch(e){}
  }
  function loadGame(D){
    try {
      seed = D.seed; R.seed(D.rs); wave = D.wave; waveT = D.waveT; spawnLeft = D.spawnLeft; spawnT = D.spawnT; score = D.score; kills = D.kills; bossK = D.bossK; eid = D.eid; speed = D.speed || 1; bossTimer = D.bossTimer; laneRR = D.laneRR || 0; MS = D.MS || null; TB = D.TB || [];
      D.Z.forEach((p, z) => { if (Z[z]) Object.assign(Z[z], p); });
      remap(); layerKey = ""; setSky();
      E = D.E.map(e => { const p0 = posAt(e.d, e.l || 0); return Object.assign({}, e, {x: p0[0], y: p0[1]}); });
      calcLimit(); E.forEach(e => { if (e.tt) TTS.add(e.tt); }); for (let k = 1; k <= 6; k++) if (wave >= [0, 12, 20, 35, 50, 100, 150][k] + 3) TTS.add(k);
      gv++; banner = {t: `▶ ${wave}단계부터 이어하기!`, s: "저번에 하던 그대로예요", k: 120, c: "#69db7c"};
      return true;
    } catch(e){ console.error(e); return false; }
  }
  let saveT = 0; const onHide = () => { if (NG.cur === self) saveGame(); };
  const self = {
    get W(){ return W; }, get H(){ return H; }, maxPx: 1.5e6, layout, save: saveGame,
    get dbg(){ return {Z, E, wave, waveT, state, score, kills, BARS, N, LIMIT, gv, PR, FX}; },
    cheat(o){ if (o.rel){ Z.forEach(p => Object.assign(p.rel, o.rel)); gv++; } if (o.it) Z.forEach(p => { p.it = o.it.slice(); }); if (o.pick) Z.forEach((p, z) => offerRel(z)); if (o.gold != null) Z.forEach(p => p.gold = o.gold); if (o.gems != null) Z.forEach(p => p.gems = o.gems); if (o.wave != null){ wave = o.wave - 1; startWave(); } if (o.put){ placeK(o.z || 0, o.put); } if (o.clear) E = []; },
    init(){
      seed = O.seed || (Math.floor(Math.random()*1e9) + 1); R.seed(seed);
      Z = SIDS.map(() => mkZone()); E = []; PR = []; FX = []; TB = []; MS = null; wave = 0; waveT = 0; spawnLeft = 0; spawnT = 0; state = "play"; overT = 0; score = 0; kills = 0; bossK = 0; eid = 0; gv = 1; speed = 1; banner = null; sel = null; drag = null; ptr = new Map(); panel = null; EM = []; emPick = null; NQ = []; outbox = []; aseq = 0; lastAct = SIDS.map(() => 0); ended = false; frame = 0;
      setSky();
      const RES = !party && O.resume ? RDS.get(SIDS) : null;
      if (RES && loadGame(RES)){ /* 이어하기 */ }
      else if (party !== "guest"){ startWave(); [0, 1].forEach(() => Z.forEach((p, z) => { const k = pick(0); placeK(z, k); })); applyKit(); }
      else { wave = 1; }
      if (party) PARTY.attach(self, gridMsg);
      if (!party){ document.addEventListener("visibilitychange", onHide); window.addEventListener("pagehide", onHide); }
      const jobs = RD_K.map(k => () => { unitSpr(k, Math.round(C*.62)); unitSpr(k, Math.round(C*.62*.78)); });
      const run = dl => { if (NG.cur !== self) return; do { const j = jobs.shift(); if (!j) return; j(); } while (dl && dl.timeRemaining && dl.timeRemaining() > 6); (window.requestIdleCallback || setTimeout)(run, {timeout: 300}); };
      (window.requestIdleCallback || setTimeout)(run, {timeout: 300});
    },
    apply, dropIdx(i){ /* 나간 친구 자리의 동물은 그대로 싸워요 */ },
    end(w, ws, m){ if (party !== "guest" || ended) return; ended = true; if (m){ score = m.score; wave = m.wave; kills = m.kills; } RDM.guestOver(score, wave, kills); },
    step(){
      BARS = bars();
      if (banner && banner.k > 0 && banner.k < 900) banner.k--;
      if (party === "guest"){ guestStep(); return; }
      // 친구 기기에서 온 손가락
      if (party === "host") for (let z = 1; z < N; z++){ if (!remote(z)) continue; const r = PARTY.remoteIn(z); if (!r) continue; const m = r.m; if (m.sd !== seed || !m.a) continue;
        m.a.forEach(a => { if (a[0] > lastAct[z]){ lastAct[z] = a[0]; doAct(z, a.slice(1)); } }); Z[z].ack = lastAct[z]; }
      if (state === "over"){ RDS.del(SIDS); if (--overT <= 0) finish(); }
      else if (!(RDB.isOpen && !party)) for (let i = 0; i < speed; i++) sim();
      if (!party && state === "play" && ++saveT % 180 === 0) saveGame();
      emStep();   // 📖 도감 보는 동안 잠깐 멈춤 (혼자·둘이)
      if (party === "host" && frame % (N >= 4 || E.length > 120 ? 6 : 4) === 0) PARTY.sendSnap(snap(), NQ.splice(0), gv);   // 사람·몬스터가 많으면 조금 덜 자주(친구 기기가 알아서 부드럽게 이어 그려요)
    },
    draw, down, move, up,
    key(code, d, e){
      if (!d || (e && e.repeat)) return ["Space", "Enter", "KeyM", "KeyQ", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "KeyL", "KeyF", "KeyE", "KeyB"].includes(code);
      if (RDB.isOpen){ if (code === "KeyB" || code === "Escape") RDB.close(); return true; }
      const two = local.length >= 2, z1 = local[0], z2 = two ? local[1] : local[0];
      if (Z[z1].pick && /^Digit[123]$/.test(code)){ act(z1, ["rel", +code[5] - 1]); playS("up"); return true; }
      if (/^Digit[45678]$/.test(code)){ const i = +code[5] - 4; if (Z[z1].it[i]) act(z1, ["it", i]); return true; }
      const M = {Space: [z1, "sum"], KeyQ: [z1, "all"], KeyE: [z1, "luck0"], Digit1: [z1, "up0"], Digit2: [z1, "up1"], Digit3: [z1, "up2"],
                 Enter: [z2, "sum"], KeyM: [z2, "all"], KeyL: [z2, "luck0"], KeyF: [-1, "spd"], KeyB: [-1, "book"]};
      if (!two){ M.Enter = [z1, "sum"]; M.KeyM = [z1, "all"]; M.KeyL = [z1, "luck0"]; }
      const m = M[code]; if (!m) return false;
      const [z, a] = m;
      if (a === "book"){ RDB.isOpen ? RDB.close() : RDB.open(); return true; }
      if (a === "spd"){ act(local[0], ["spd"]); playS("warn"); }
      else if (a === "sum") act(z, ["sum"]); else if (a === "all") act(z, ["all"]); else if (a === "luck0") act(z, ["luck", 0]); else act(z, ["up", +a[2]]);
      return true;
    },
    hud(){ return `🐾 ${wave}단계 · ${th().n} · ${(score || 0).toLocaleString()}점${party ? " · 🌐 함께 지키기" : N > 1 ? " · 👫 둘이 지키기" : ""}`; }
  };
  return self;
};

/* =====================================================================
   🐾 동물 랜덤 디펜스 — 시작 창 · 친구 기기 결과 · 온라인 방
   ===================================================================== */
/* 💾 저장된 게임 (기기마다 · 같이 한 친구 조합마다) */
const RDS = {
  key: sids => "rd.save." + sids.join("_"),
  get(sids){ try { const d = JSON.parse(localStorage.getItem(this.key(sids))); if (!d || d.v !== 1 || Date.now() - d.at > 3*864e5) return null; return d; } catch(e){ return null; } },
  del(sids){ try { localStorage.removeItem(this.key(sids)); } catch(e){} },
  ago(at){ const m = Math.round((Date.now() - at)/6e4); return m < 1 ? "방금" : m < 60 ? `${m}분 전` : `${Math.round(m/60)}시간 전`; }
};
const RDM = {
  menu(){
    const me = ARC.me, box = partyModal("rd"), body = $("#wbBody"); RDB.css();
    body.innerHTML = `<div class="rd-intro"><div class="rd-gs">${RD_G.map((g, i) => `<span style="--c:${g.c}"><b>${g.n}</b><em>${RD_BY[i].map(k => RD_A[k].e).join("")}</em></span>`).join("")}</div>
      <div class="rd-cards">
        <div><h4>🎲 뽑고 🔀 합치기</h4>같은 동물 3마리면 더 센 등급으로! 🌈 신화 위에 💠 초월 · 🔥 불멸 · 🌟 태초까지!</div>
        <div><h4>🤝 배치 시너지</h4>같은 동물끼리 붙이면 🤝, ⚔️🏹✨ 셋이 모이면 🔺 삼각 진형, 같은 등급 셋이면 🎖️ — 힘이 세져요</div>
        <div><h4>🏡 1000단계 도전</h4>👾 몬스터가 꽉 차면 끝. 10단계마다 👑 보스, 100단계마다 🌀 차원 대왕! ⬆️ 강화는 끝없이 올라가요</div>
        <div><h4>👥 최대 6명 협동</h4>🔗 여러 친구 동물에게 번갈아 맞으면 더 아파요 · 💞 지원은 길 건너 친구도 응원 · 🎌 친구마다 ⚔️🏹✨ 주력을 나누면 모두 세져요</div>
        <div><h4>🧩 끌어서 배치</h4>⚔️ 근거리는 길 바로 옆 · 🏹 원거리는 뒷줄(+25%) · ✨ 지원은 가운데. 🌟 스킬은 저절로!</div>
        <div><h4>🎯 미션 · 🎒 아이템 · 🎁 유물</h4>미션 성공 → 아이템, 보스 처치 → 유물 고르기. 맵은 10단계마다 바뀌어요.</div>
      </div>
      <button class="arc-btn rd-book-btn" id="rdBook">📖 동물 도감 보기 · 동물마다 힘·스킬·배치 요령</button>
      <button class="arc-btn rd-shop-btn" id="rdShop">🏪 코인 상점 · 🔬 동물 연구소 <small id="rdShopMe"></small></button></div>
      <div class="wb-sec"><h3>🧒 혼자 지키기 <small>최고 단계로 랭킹!</small></h3>${(sv => sv ? `<button class="arc-btn p rd-resume" id="rdResume">💾 이어하기 · ${sv.wave}단계 · ${(sv.score || 0).toLocaleString()}점 <small>(${RDS.ago(sv.at)})</small></button>` : "")(RDS.get([sidOf(me)]))}<button class="arc-btn ${RDS.get([sidOf(me)]) ? "" : "p"}" id="rdSolo">${RDS.get([sidOf(me)]) ? "🆕 새로 시작" : "▶ 시작!"}</button></div>
      <div class="wb-sec"><h3>👫 이 기기에서 둘이 <small>한 길을 둘이 자기 자리에서 함께 지켜요 · 같은 점수로 기록</small></h3><button class="arc-btn p" id="rdDuo">👫 친구 들어오기</button></div>
      <div class="wb-sec"><h3>🌐 온라인 함께 지키기 <small>각자 기기로 최대 6명 · 문 하나에서 나오는 몬스터를 다 같이 막아요 · ☁️ Firebase 반에서만</small></h3><div id="wbRooms"></div></div>`;
    $("#rdBook").onclick = () => RDB.open();
    const meLine = () => { const sid = sidOf(me), L = RDP.level(sid), iv = RDP.inv(sid), n = Object.values(iv).reduce((a, b) => a + (b || 0), 0);
      const el = $("#rdShopMe"); if (el) el.textContent = `· ${RDP.title(L)} Lv.${L} · 🪙 ${(walletOf(sid).coins || 0).toLocaleString()}${n ? ` · 🎒 준비물 ${n}개` : ""}`; };
    meLine(); RDP.css && RDP.css();
    $("#rdShop").onclick = () => { RDP.open(); const m = $("#mdRdShop"); if (m && !m._w){ m._w = 1; new MutationObserver(() => { if (m.hidden) meLine(); }).observe(m, {attributes: true, attributeFilter: ["hidden"]}); } };
    body.querySelectorAll(".rd-gs span").forEach((el, i) => { el.style.cursor = "pointer"; el.title = "도감에서 보기"; el.onclick = () => { RDB.f = "g" + i; RDB.cur = RD_BY[i][0]; RDB.open(); }; });
    $("#rdSolo").onclick = () => { if (RDS.get([sidOf(me)]) && !confirm("저장된 게임이 지워지고 새로 시작해요. 괜찮아요?")) return; RDS.del([sidOf(me)]); box.hidden = true; ARC.enter(); ARC.prep(); getAC(); NG.play("rd", [sidOf(me)]); };
    const rs = $("#rdResume"); if (rs) rs.onclick = () => { box.hidden = true; ARC.enter(); ARC.prep(); getAC(); NG.play("rd", [sidOf(me)], {resume: 1}); };
    $("#rdDuo").onclick = () => { box.hidden = true; ARC.pickRival("rd", opp => { const sids = [sidOf(me), sidOf(opp)], sv = RDS.get(sids), res = sv && confirm(`이 친구와 하던 게임(${sv.wave}단계)이 있어요. 이어할까요?\n(취소를 누르면 새로 시작해요)`);
      if (!res) RDS.del(sids); ARC.enter(); ARC.prep(); getAC(); NG.play("rd", sids, {local: [0, 1], resume: res ? 1 : 0}); }); };
    PARTY.renderRooms(); box.hidden = false;
  },
  guestOver(score, wave, kills){
    const sid = sidOf(ARC.me), res = saveRec("rd", sid, score || 0); (res.isNew ? SFX.rec : SFX.over)();
    $("#ngOver").innerHTML = `${res.isNew ? NG.conf(90) : ""}<div class="ng-box"><span class="avb">${avHTMLof(sid)}</span><h3>${res.isNew ? "🎉 새 기록!" : "🐾 함께 지키기 끝!"}</h3><div class="sc">${(score || 0).toLocaleString()}점</div>
      <div class="info"><div>🏁 <b>${wave}단계</b>까지 · 👾 몬스터 ${kills}마리 · 👥 팀 점수</div><div>내 최고 <b>${res.r.best}</b>점 · 🏆 우리 반 <b>${res.rank}</b>등 <small>/ ${res.n}명</small></div>
        <div class="ng-coin">${res.coins ? `🪙 +${res.coins} 코인!` : "🪙 오늘 코인은 다 모았어요"}</div></div>
      <div class="arc-row"><button class="arc-btn" data-rd="wait">⏳ 방장이 다시 시작하길 기다려요</button><button class="arc-btn" data-rd="home">🏠 홈으로</button></div></div>`;
    $("#ngOver").hidden = false; NG.ended = true;
    $("#ngOver").onclick = e => { const b = e.target.closest("[data-rd]"); if (!b) return; e.stopPropagation(); if (b.dataset.rd === "home"){ PARTY.leave(); NG.close(); } };
  }
};
(function(){
  const play = ARC.play;
  ARC.play = function(gid){
    if (gid !== "rd") return play.call(this, gid);
    if (!LOBBY.canPlay(gid)) return; getAC(); this.game = gid; this.lastRank = gid; RDM.menu();
  };
  /* 게임 창을 닫을 때(× · Esc · 홈) 먼저 저장 */
  const close = NG.close;
  NG.close = function(){ try { if (this.gid === "rd" && this.cur && this.cur.save) this.cur.save(); } catch(e){} if (typeof RDB !== "undefined" && RDB.isOpen) RDB.close(); return close.apply(this, arguments); };
  const again = NG.again;
  NG.again = function(){ if (this.gid === "rd"){ if (this.opt.party){ if (this.opt.party === "host") PARTY.again(); return; } RDS.del(this.sids); return this.play("rd", this.sids, Object.assign({}, this.opt, {seed: 0, resume: 0})); } return again.call(this); };
  PARTY.CFG.rd = {max: 6, bots: 0, min: 2, relay: 1};
  const start = PARTY.start;
  PARTY.start = function(again){
    if (this.gid !== "rd") return start.call(this, again);
    if (this.role !== "host") return;
    /* 🔌 아직 연결 중인 친구가 있으면 최대 10초 기다려요 (그 사이 다리로 이어질 수도 있어요) → 아무도 빠지지 않게 */
    const pend = () => [...this.peers.values()].filter(P => !P.open).length;
    if (!again && pend() && !this.waitT0){ this.waitT0 = Date.now(); toast(`🔌 연결 중인 친구 ${pend()}명을 기다렸다가 시작해요…`);
      const tick = () => { if (this.role !== "host" || this.started){ this.waitT0 = 0; return; } if (!pend() || Date.now() - this.waitT0 > 10000){ this.waitT0 = 0; this.waitT = 0; PARTY.start(); } else this.waitT = setTimeout(tick, 400); };
      this.waitT = setTimeout(tick, 400); return; }
    if (this.waitT0 && !again) return;
    const live = this.connected().map(p => p.no);
    this.members = [ARC.me].concat(this.members.filter(no => no !== ARC.me && live.includes(no))).slice(0, this.MAX);
    const M = this.members; if (M.length < 2){ toast("친구가 1명 이상 들어와야 시작할 수 있어요"); this.renderRooms(); return; }
    this.started = true; Store.fs.updateDoc(this.ref(this.pid), {st: "play", n: M.length}).catch(() => {});
    const sids = M.map(sidOf), seed = Math.floor(Math.random()*1e9) + 1, remote = {};
    this.startMsg = {t: "start", g: "rd", sids, seed};
    M.forEach((no, i) => { if (i){ const P = this.peers.get(no); if (P){ P.idx = i; P.inN = 0; P.last = {}; remote[i] = no; this.send(P, {t: "start", g: "rd", sids, idx: i, seed}); } } });
    /* 시작 쪽지를 놓친 친구가 없게 2초마다 3번 더 보내요 (이미 같은 판이면 친구 기기는 그대로 둬요) */
    [2000, 4000, 7000].forEach(ms => setTimeout(() => { if (this.role !== "host" || !this.startMsg || this.startMsg.seed !== seed) return; M.forEach((no, i) => { const P = i && this.peers.get(no); if (P) this.send(P, {t: "start", g: "rd", sids, idx: i, seed}); }); }, ms));
    this.seq = 0; this.lastGv = -1; const md = $("#mdWb"); if (md) md.hidden = true;
    if (!again){ ARC.game = "rd"; ARC.enter(); ARC.prep(); }
    getAC(); NG.play("rd", sids, {party: "host", local: [0], remote, seed});
  };
  if (typeof COOP !== "undefined" && !COOP.G.includes("rd")) COOP.G.unshift("rd");
  const css = document.createElement("style");
  css.textContent = `.in-room>.rd-intro{display:none}.rd-gs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px}
.rd-gs span{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px;border-radius:12px;border:2px solid var(--c);background:rgba(255,255,255,.06)}
.rd-resume{display:block;width:100%;margin-bottom:8px;font-size:20px !important}.rd-resume small{opacity:.8;font-size:13px}
.rd-gs b{font:15px "Jua",sans-serif;color:var(--c)}.rd-gs em{font-style:normal;font-size:18px;letter-spacing:-2px;white-space:nowrap}
@media (max-width:560px){.rd-gs em{font-size:14px}}
/* ⭐ 대표 게임: 홈에서 크게, 금빛 테두리 */
.arc-game.g-rd{background:linear-gradient(135deg,#ff9f43 0%,#ff6b9a 45%,#845ef7 100%) !important;border:3px solid #ffe066 !important;box-shadow:0 0 0 3px rgba(255,224,102,.25),0 10px 28px rgba(255,159,67,.35) !important}
.arc-game.g-rd .ag-tag{background:#ffe066 !important;color:#1b1233 !important;font-weight:700}
@media (min-width:760px){.arc-game.g-rd{grid-column:span 2}.arc-game.g-rd .ag-nm{font-size:30px}.arc-game.g-rd .ag-ic{font-size:52px}}`;
  document.head.appendChild(css);
})();

/* =====================================================================
   📖 동물 도감 — 동물마다 역할·힘·빠르기·거리·특기·스킬·배치 요령
   (메뉴의 📖 단추 · 게임 중 위쪽 📖 단추 · B 키 / 혼자·둘이 할 때는 보는 동안 잠깐 멈춰요)
   ===================================================================== */
const RDB = {
  isOpen: false, tab: "a", f: "all", cur: null,
  seen(){ try { return JSON.parse(localStorage.getItem("rd.seen") || "{}"); } catch(e){ return {}; } },
  see(k){ const s = this.seen(); if (s[k]) return; s[k] = 1; try { localStorage.setItem("rd.seen", JSON.stringify(s)); } catch(e) {} },
  /* ⚡ 동물 그림은 한 번에 한 마리씩, 쉬는 틈에 그려서 기억해 둬요 (열자마자 19마리를 한꺼번에 그리면 멈춰요) */
  _im: {}, _q: null,
  img(k){ const u = this._im[k]; if (!u) this.queue(k); return u ? `src="${u}"` : ""; },
  queue(k){ if (this._im[k] !== undefined) return; this._im[k] = null; (this._q = this._q || []).push(k); if (this._q.length === 1) this.pump(); },
  pump(){ const idle = window.requestIdleCallback || (f => setTimeout(f, 16));
    idle(() => { const k = this._q.shift(); if (!k) return;
      const done = u => { this._im[k] = u || ""; if (u) document.querySelectorAll(`#mdRdBook img[data-im="${k}"]`).forEach(el => { el.src = u; }); if (this._q.length) this.pump(); };
      try { const S = 96, c = RDA.unitSpr(k, S); G2.cache.delete(`rdu2${k}${S}`);   // 게임 그림 기억 칸은 비워 둬요 (꽉 차면 게임 그림이 전부 지워져 버벅여요)
        if (c.toBlob) c.toBlob(b => done(b ? URL.createObjectURL(b) : ""), "image/png"); else done(c.toDataURL()); } catch(e){ done(""); } }, {timeout: 200}); },
  tags(A){ const T = [];
    if (A.sp) T.push(["💥", "주변까지 펑 (범위 공격)"]); if (A.mt) T.push(["🔱", `${A.mt}마리 동시 공격`]); if (A.cr) T.push(["🎯", `치명타 ${Math.round(A.cr*100)}% (3배)`]);
    if (A.sl) T.push(["🐌", `맞으면 ${Math.round(A.sl*100)}% 느려져요`]); if (A.st) T.push(["💫", `${Math.round(A.st*100)}% 확률로 기절`]); if (A.bf) T.push(["💪", `옆 친구 공격 +${Math.round(A.bf*100)}%`]);
    if (!T.length) T.push(["⚡", A.t]); return T; },
  when(S){ return {gold: "🌱 초반에 금 모으기", multi: "👑 보스·센 몬스터 잡기", big: "👑 보스·센 몬스터 잡기", snipe: "👑 보스 잡기 (어디 있든 쏴요)", exec: "👑 약해진 몬스터 마무리",
    all: "👾 몬스터가 우르르 몰려올 때", storm: "👾 몬스터가 많을 때 (어디든)", pick: "👾 몬스터가 많을 때", slow: "🚨 몬스터가 쌓여서 위험할 때", freeze: "🚨 위험할 때 시간 벌기",
    stun: "🚨 위험할 때 시간 벌기", push: "🚨 마을이 위험할 때 밀어내기", quake: "🚨 위험할 때 + 보스", buffA: "🤝 센 친구들 한가운데", buffS: "🤝 센 친구들 한가운데"}[S.ty] || ""; },
  tip(A){ return A.ro === "m" ? "길 바로 옆(빨간 테두리 ⚔️ 칸)에 두어요. 길이 꺾이는 모퉁이 옆이면 길 두 줄에 닿아서 더 좋아요!"
    : A.ro === "r" ? "뒷줄(파란 테두리 🏹 칸)에 두면 공격 +25%! 거리가 길어서 길에서 조금 떨어져도 괜찮아요."
    : "근거리·원거리 친구들 가운데에 두면 여러 친구를 한꺼번에 도와줘요."; },
  css(){ if (this._css) return; this._css = 1; const s = document.createElement("style"); s.textContent = `
#mdRdBook{z-index:600;backdrop-filter:none;-webkit-backdrop-filter:none;background:rgba(8,5,25,.9)}
#mdRdBook .arc-card{max-width:980px;padding:18px 20px 20px;contain:layout paint}
.rdb-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;padding-right:52px}
.rdb-top h2{margin:0 auto 0 0}
.rdb-tabs,.rdb-fl{display:flex;gap:6px;flex-wrap:wrap}
.rdb-tabs button,.rdb-fl button{border:0;border-radius:999px;padding:7px 14px;font:inherit;font-size:16px;background:#3a3178;color:#e5dbff;cursor:pointer}
.rdb-tabs button.on{background:#ffd43b;color:#3b2a00}
.rdb-fl button.on{background:#fff;color:#2b1d6b}
.rdb-fl{margin:0 0 10px}
.rdb-wrap{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:14px;align-items:start}
.rdb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:8px;max-height:62vh;overflow:auto;padding:2px}
.rdb-c{position:relative;border:0;border-radius:16px;padding:8px 4px 10px;background:#2d2566;color:#fff;font:inherit;cursor:pointer;box-shadow:inset 0 -4px 0 rgba(0,0,0,.25);border-top:4px solid var(--c)}
.rdb-c.on{outline:3px solid #ffd43b;background:#3d3288}
.rdb-c img{width:64px;height:64px;display:block;margin:0 auto 2px;border-radius:50%;background:rgba(255,255,255,.06)}
.rdb-c b{display:block;font-size:15px}.rdb-c small{font-size:12px;color:#bfb3e8}
.rdb-c i{position:absolute;top:6px;left:6px;font-style:normal;font-size:13px;background:var(--rc);border-radius:999px;padding:1px 5px}
.rdb-c.new{padding-bottom:24px}.rdb-c.new img{opacity:.75}.rdb-c.new::after{content:"아직 못 만났어요";position:absolute;bottom:6px;left:0;right:0;font-size:11px;color:#ffa8a8}
.rdb-d{background:#211a52;border-radius:18px;padding:14px;border:2px solid var(--c);position:sticky;top:0}
.rdb-hd{display:flex;gap:10px;align-items:center}.rdb-hd img{width:92px;height:92px;background:radial-gradient(circle,rgba(255,255,255,.18),transparent 70%);border-radius:50%}
.rdb-hd h3{margin:0;font-size:24px;color:#fff}.rdb-chip{display:inline-block;border-radius:999px;padding:2px 9px;font-size:13px;margin:3px 3px 0 0;color:#1b1233;background:var(--c)}
.rdb-bar{display:grid;grid-template-columns:70px 1fr 58px;gap:6px;align-items:center;font-size:14px;margin:6px 0;color:#e5dbff}
.rdb-bar span{height:12px;border-radius:6px;background:rgba(255,255,255,.12);overflow:hidden}.rdb-bar span em{display:block;height:100%;border-radius:6px;background:var(--bc)}
.rdb-bar small{text-align:right;color:#fff}
.rdb-box{background:rgba(255,255,255,.07);border-radius:12px;padding:8px 10px;margin-top:8px;font-size:14px;line-height:1.5;color:#e5dbff}
.rdb-box h4{margin:0 0 3px;font-size:15px;color:#ffe066}
.rdb-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px;max-height:64vh;overflow:auto}
.rdb-it{display:flex;gap:10px;align-items:center;background:#2d2566;border-radius:14px;padding:10px 12px;color:#e5dbff;font-size:14px}
.rdb-it>span{font-size:34px}.rdb-it b{color:#fff;font-size:16px;display:block}
.rdb-guide{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:10px}
.rdb-guide div{background:#2d2566;border-radius:16px;padding:12px 14px;color:#e5dbff;font-size:15px;line-height:1.55}
.rdb-guide h4{margin:0 0 4px;color:#ffe066;font-size:18px}
@media (max-width:760px){.rdb-wrap{grid-template-columns:1fr}.rdb-d{position:static}.rdb-grid{max-height:40vh}}
.rd-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:10px 0}
.rd-cards div{background:rgba(255,255,255,.06);border-radius:14px;padding:9px 12px;font-size:14px;line-height:1.45;color:#e5dbff}
.rd-cards h4{margin:0 0 2px;font-size:16px;color:#ffe066}.rd-cards p{margin:0}
.rd-book-btn{width:100%;margin:2px 0 6px}
@media (max-width:560px){.rd-cards{grid-template-columns:1fr}}`; document.head.appendChild(s); },
  open(k){ this.css(); let m = $("#mdRdBook");
    if (!m){ m = document.createElement("div"); m.className = "arc-modal"; m.id = "mdRdBook"; m.hidden = true; m.innerHTML = `<div class="arc-card"><div id="rdbBody"></div><button class="arc-x" data-close>×</button></div>`; document.body.appendChild(m);
      m.querySelector("[data-close]").onclick = () => this.close();
      m.addEventListener("pointerdown", e => { if (e.target === m) this.close(); });
      m.addEventListener("click", e => { const b = e.target.closest("[data-t],[data-f],[data-k]"); if (!b) return; if (b.dataset.k && !b.dataset.t && !b.dataset.f){ this.pickK(b.dataset.k); return; } if (b.dataset.t) this.tab = b.dataset.t; if (b.dataset.f) this.f = b.dataset.f; this.render(); }); }
    if (k){ this.tab = "a"; this.cur = k; } this.isOpen = true; m.hidden = false; this.render(); },
  pickK(k){ if (!RD_A[k] || k === this.cur) return; this.cur = k; const m = $("#mdRdBook");
    m.querySelectorAll(".rdb-c.on").forEach(el => el.classList.remove("on")); const c = m.querySelector(`.rdb-c[data-k="${k}"]`); if (c) c.classList.add("on");
    const d = m.querySelector(".rdb-d"); if (d) d.outerHTML = this.detail(k); },
  close(){ const m = $("#mdRdBook"); if (m) m.hidden = true; this.isOpen = false; },
  render(){
    const seen = this.seen(), nSeen = RD_K.filter(k => seen[k]).length, T = this.tab;
    const tabs = [["a", "🐾 동물"], ["r", "🎁 유물"], ["i", "🎒 아이템"], ["g", "🧩 배치 요령"]].map(([id, n]) => `<button data-t="${id}" class="${T === id ? "on" : ""}">${n}</button>`).join("");
    let html = `<div class="rdb-top"><h2>📖 동물 도감</h2><div class="rdb-tabs">${tabs}</div></div>`;
    if (T === "a"){
      const F = [["all", `전체 ${nSeen}/${RD_K.length}`], ["m", "⚔️ 근거리"], ["r", "🏹 원거리"], ["s", "✨ 지원"], ...RD_G.map((g, i) => ["g" + i, g.n])];
      const list = RD_K.filter(k => { const A = RD_A[k]; return this.f === "all" || A.ro === this.f || this.f === "g" + A.g; });
      if (!this.cur || !RD_A[this.cur]) this.cur = list[0] || RD_K[0];
      html += `<div class="rdb-fl">${F.map(([id, n]) => `<button data-f="${id}" class="${this.f === id ? "on" : ""}">${n}</button>`).join("")}</div>
        <div class="rdb-wrap"><div class="rdb-grid">${list.map(k => { const A = RD_A[k], RO = RD_ROLE[A.ro];
          return `<button class="rdb-c ${this.cur === k ? "on" : ""} ${seen[k] ? "" : "new"}" data-k="${k}" style="--c:${RD_G[A.g].c};--rc:${RO.c}"><i>${RO.e}</i><img data-im="${k}" ${this.img(k)} alt=""><b>${A.n}</b><small>${RD_G[A.g].n}</small></button>`; }).join("")}</div>${this.detail(this.cur)}</div>`;
    } else if (T === "r"){
      html += `<p class="arc-small">👑 10단계마다 보스를 잡으면 3장 중 1장을 골라요. 같은 유물을 또 고르면 효과가 쌓여요!</p><div class="rdb-list">${RD_RK.map(k => { const R0 = RD_REL[k]; return `<div class="rdb-it"><span>${R0.e}</span><div><b>${R0.n}</b>${R0.d}</div></div>`; }).join("")}</div>`;
    } else if (T === "i"){
      html += `<p class="arc-small">🎯 미션 성공 · 😈 중간 보스 · 🎁 보물상자 몬스터에게서 받아요. 가방 아이콘을 누르면 바로 써요 (키보드 4~8번).</p><div class="rdb-list">${RD_IK.map(k => { const I = RD_IT[k]; return `<div class="rdb-it"><span>${I.e}</span><div><b>${I.n}</b>${I.d}</div></div>`; }).join("")}</div>`;
    } else {
      html += `<div class="rdb-guide">
        <div><h4>⚔️ 근거리는 길 바로 옆</h4>빨간 테두리 칸이 길에 붙어 있는 자리예요. 근거리 동물은 공격이 1.5배 세지만 거리가 짧아서 <b>길 옆에서만</b> 닿아요. 길이 꺾이는 <b>모퉁이 옆</b>이면 두 줄을 한꺼번에 때려요!</div>
        <div><h4>🏹 원거리는 뒷줄</h4>파란 테두리 칸은 길에서 먼 자리예요. 원거리 동물을 두면 <b>공격 +25%</b>! 부엉이·독수리처럼 거리가 아주 긴 친구는 어디서든 닿아요.</div>
        <div><h4>✨ 지원은 가운데</h4>개구리는 몬스터를 느리게, 유니콘은 옆 친구들의 힘을 올려 줘요. <b>센 친구들 사이</b>에 두면 효과가 커요.</div>
        <div><h4>🔀 합치기 전략</h4>같은 동물 3마리면 다음 등급으로! 3마리가 모인 칸은 반짝여요. 칸이 꽉 차면 약한 동물은 💰 팔아서 자리를 만들어요.</div>
        <div><h4>🌟 스킬 고르기</h4>👑 보스가 나오기 전엔 <b>한 마리를 세게</b> 때리는 스킬(저격·필살 냥펀치·연속 찌르기)을, 몬스터가 쌓이면 <b>여러 마리를 멈추는</b> 스킬(얼음 폭풍·지진 쿵·해일)을 가진 친구를 앞에 두어요.</div>
        <div><h4>🗺️ 맵이 바뀌면 다시 배치</h4>10단계마다 길 모양이 바뀌어요. 그때 근거리 친구가 "⚠️ 길에서 멀어요"가 되었는지 확인하고 끌어서 옮겨 주세요!</div></div>`;
    }
    $("#rdbBody").innerHTML = html;
  },
  detail(k){ const A = RD_A[k], RO = RD_ROLE[A.ro], G = RD_G[A.g], S = A.sk, dps = A.d*60/A.cd;
    const mx = Math.log10(RD_A.trex.d*60/RD_A.trex.cd), mn = Math.log10(RD_A.frog.d*60/RD_A.frog.cd), pw = Math.max(.06, (Math.log10(dps) - mn)/(mx - mn));
    const bar = (n, v, t, c) => `<div class="rdb-bar"><b>${n}</b><span><em style="width:${Math.round(Math.min(1, v)*100)}%;--bc:${c}"></em></span><small>${t}</small></div>`;
    const nx = A.g < RD_MAXG ? `${RD_G[A.g + 1].n} ${RD_BY[A.g + 1].map(q => RD_A[q].e).join("")}` : "가장 높은 등급!";
    return `<div class="rdb-d" style="--c:${G.c}"><div class="rdb-hd"><img data-im="${k}" ${this.img(k)} alt=""><div><h3>${A.e} ${A.n}</h3><span class="rdb-chip" style="--c:${G.c}">${G.n}</span><span class="rdb-chip" style="--c:${RO.c}">${RO.e} ${RO.n}</span></div></div>
      ${bar("💪 힘", pw, `${A.d}`, "#ff8787")}${bar("⚡ 빠르기", 28/A.cd, `${(60/A.cd).toFixed(1)}번/초`, "#ffd43b")}${bar("📏 거리", A.r/5.6, `${A.r}칸`, "#74c0fc")}
      <div class="rdb-box"><h4>✨ 특기</h4>${this.tags(A).map(([e, t]) => `${e} ${t}`).join("<br>")}</div>
      <div class="rdb-box"><h4>🌟 스킬: ${S.e} ${S.n}</h4>${S.d}<br><small>공격 ${S.mp}번마다 저절로 · 이럴 때 좋아요: ${this.when(S)}</small></div>
      <div class="rdb-box"><h4>🧩 어디에 둘까?</h4>${this.tip(A)}</div>
      <div class="rdb-box"><h4>🔀 3마리 합치면</h4>${nx}</div></div>`;
  }
};
