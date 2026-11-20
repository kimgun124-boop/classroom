/* =====================================================================
   🐾 동물 랜덤 디펜스 — 1초마다 오는 동물로 덱을 짜고(📥 대기 줄), 🌳🌊☁️ 자기 땅에 두고, 합치고 조합해서 더 센 동물로!
   - 빙글빙글 도는 길을 따라 오는 몬스터를 동물들이 막아요. 몬스터가 너무 많이 쌓이면 끝!
   - 1000단계 (100단계마다 🌀 차원 · 10단계마다 맵이 바뀌고 👑 보스, 5단계마다 😈 중간 보스)
   - 등급 5개: ⚪ 일반 → 🔵 희귀 → 🟣 영웅 → 🟡 전설 → 🌈 신화 · 동물 18종
   - 함께하기: 한 기기에서 둘이 / 🌐 온라인 방 각자 기기 최대 4명 (같은 길을 함께 지켜요)
   ⚡ 렉 줄이기: 판(길·칸·꾸미기)은 한 장으로 미리 그려 두고, 동물·몬스터·총알은 한 번 그린 그림을 붙여요.
      친구 기기는 손가락(뽑기·합치기…)만 보내고, 공격 모습은 자기 기기에서 그려요.
   ===================================================================== */
const RD_G = [
  {n: "일반", c: "#adb5bd", c2: "#e9ecef", sell: 2},     // 💰 (2026.11.18 대기 줄) 동물이 공짜로 오니까 팔아도 조금만
  {n: "희귀", c: "#4dabf7", c2: "#d0ebff", sell: 6},
  {n: "영웅", c: "#9775fa", c2: "#e5dbff", sell: 20},
  {n: "전설", c: "#fcc419", c2: "#fff3bf", sell: 60},
  {n: "신화", c: "#ff6b9a", c2: "#ffe3ec", sell: 160},
  {n: "초월", c: "#22d3ee", c2: "#cffafe", sell: 420},
  {n: "불멸", c: "#f97316", c2: "#ffedd5", sell: 1000},
  {n: "태초", c: "#fde047", c2: "#fefce8", sell: 2500},
  {n: "창세", c: "#c084fc", c2: "#f3e8ff", sell: 6000},   // 🆕 (2026.11.18) 태초 위 — 조합으로만
  {n: "영원", c: "#a3e635", c2: "#f7fee7", sell: 15000}
];
const RD_MAXG = RD_G.length - 1;
const RD_UPN = ["일반·희귀", "영웅·전설", "신화", "초월 이상"];   // ⬆️ 강화 4갈래
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
  parrot:  {e: "🦜", n: "앵무새",   g: 1, d: 22,   cd: 36, r: 2.4, mt: 2, t: "두 마리 콕콕"},
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
  shark:   {e: "🦈", n: "상어",     g: 4, d: 1700, cd: 42, r: 2.4, cr: .25, t: "피 냄새 · 한입"},
  /* 💠 초월 */
  phoenix: {e: "🐦", n: "불사조",       g: 5, d: 5200,  cd: 44, r: 3.6, sp: 1.6, burn: .25, t: "불꽃 날개 · 불태우기"},
  kirin:   {e: "🦌", n: "기린 신수",    g: 5, d: 2800,  cd: 30, r: 3.2, mt: 5, bf: .4, t: "옆 친구 힘 +40%"},
  levi:    {e: "🐋", n: "리바이어던",   g: 5, d: 4200,  cd: 58, r: 3.4, sp: 2.0, sl: .55, t: "대해일"},
  /* 🔥 불멸 */
  bdragon: {e: "🐉", n: "흑룡",         g: 6, d: 16000, cd: 50, r: 3.8, sp: 2.2, t: "흑염 · 맵 전체"},
  wtiger:  {e: "🐅", n: "백호",         g: 6, d: 11000, cd: 22, r: 2.8, cr: .35, chain: 3, t: "번개가 튕겨요"},
  nine:    {e: "🦊", n: "구미호",       g: 6, d: 9000,  cd: 34, r: 3.6, mt: 9, t: "구슬 9개"},
  squid:   {e: "🦑", n: "대왕 오징어",  g: 6, d: 10000, cd: 40, r: 3.6, mt: 4, sl: .45, t: "먹물 · 다리 넷"},
  /* 🌟 태초 */
  gdragon: {e: "🌟", n: "황룡",         g: 7, d: 52000, cd: 52, r: 4.2, sp: 2.4, burn: .3, t: "천지개벽"},
  pegasus: {e: "🦄", n: "천마",         g: 7, d: 20000, cd: 26, r: 3.6, mt: 6, bf: .6, t: "모두에게 축복"},
  titan:   {e: "🦕", n: "거신 티라노",  g: 7, d: 70000, cd: 70, r: 2.8, sp: 1.8, st: .25, t: "대지 분쇄"},
  kraken:  {e: "🐙", n: "크라켄",       g: 7, d: 60000, cd: 54, r: 2.8, sp: 1.9, sl: .5, t: "바다 괴물 · 휘감기"},
  /* 🌌 창세 (2026.11.18 · 태초 위) */
  cosmos:  {e: "🌌", n: "은하 고래",    g: 8, d: 170000, cd: 56, r: 4.4, sp: 2.6, sl: .5, t: "은하 물결 · 느리게"},
  suzaku:  {e: "🔥", n: "주작",         g: 8, d: 140000, cd: 30, r: 3.9, mt: 3, burn: .35, t: "불꽃 날개 3갈래"},
  genbu:   {e: "🐢", n: "현무",         g: 8, d: 90000,  cd: 58, r: 2.6, sp: 2.0, st: .3, t: "등껍질 방패 · 기절"},
  abyss:   {e: "🐙", n: "심연 크라켄",  g: 8, d: 130000, cd: 50, r: 2.9, sp: 2.2, sl: .55, t: "심연의 다리 8개 · 휘감기"},   // 🆕 (2026.11.18) 크라켄 2마리로
  /* ♾️ 영원 */
  eternal: {e: "🌠", n: "영원룡",       g: 9, d: 700000, cd: 50, r: 4.8, sp: 3.0, burn: .4, t: "별을 삼키는 용"},
  yggdra:  {e: "🌳", n: "세계수 사슴",  g: 9, d: 260000, cd: 28, r: 4.0, mt: 8, bf: 1.0, t: "옆 친구 힘 +100%"},
  seaking: {e: "🔱", n: "바다 용왕",    g: 9, d: 520000, cd: 46, r: 4.6, sp: 2.8, sl: .6, t: "바다를 다스리는 왕"},
  kgod:    {e: "🌀", n: "심해신 크라켄", g: 9, d: 600000, cd: 44, r: 4.6, mt: 4, sl: .6, t: "바다 끝의 신 · 소용돌이"},   // 🆕 (2026.11.18) 심연 크라켄 + 크라켄
  /* 🆕 (2026.11.19) 높은 등급 친구들이 더 많아졌어요 — 신화 1 · 초월 2 · 불멸 2 · 태초 2 · 창세 2 · 영원 2 */
  mammoth: {e: "🦣", n: "매머드",       g: 4, d: 2000,   cd: 62, r: 2.4, sp: 1.4, st: .15, t: "쿵쿵 돌진 · 기절"},
  griffin: {e: "🪽", n: "그리폰",       g: 5, d: 3800,   cd: 36, r: 4.4, mt: 3, t: "하늘 사자 · 세 갈래"},
  rhino:   {e: "🦏", n: "강철 코뿔소",  g: 5, d: 6000,   cd: 52, r: 2.4, cr: .3, t: "강철 뿔 · 한 방"},
  icewolf: {e: "🐺", n: "서리 늑대",    g: 6, d: 10000,  cd: 32, r: 2.8, sp: 1.2, sl: .5, t: "얼음 이빨 · 꽁꽁"},
  thunder: {e: "⚡", n: "천둥새",       g: 6, d: 12000,  cd: 30, r: 4.0, chain: 4, t: "번개가 튕겨요"},
  moonrab: {e: "🐇", n: "달토끼",       g: 7, d: 24000,  cd: 26, r: 3.6, mt: 5, bf: .7, t: "옆 친구 힘 +70%"},
  hydra:   {e: "🐍", n: "히드라",       g: 7, d: 56000,  cd: 40, r: 3.8, mt: 5, t: "머리 다섯 · 다섯 갈래"},
  sunbird: {e: "🌞", n: "태양 봉황",    g: 8, d: 160000, cd: 36, r: 4.2, mt: 3, burn: .4, t: "태양 불꽃 · 불태우기"},
  golem:   {e: "🗿", n: "대지 거인",    g: 8, d: 150000, cd: 64, r: 2.6, sp: 2.2, st: .3, t: "땅을 흔들어 기절"},
  chrono:  {e: "⏳", n: "시간룡",       g: 9, d: 650000, cd: 48, r: 4.8, sp: 2.8, sl: .6, t: "시간을 멈춰요"},
  gfox:    {e: "💫", n: "은하 구미호",  g: 9, d: 480000, cd: 30, r: 4.4, mt: 9, t: "별 구슬 아홉 개"}
};
const RD_K = Object.keys(RD_A), RD_BY = RD_G.map((_, g) => RD_K.filter(k => RD_A[k].g === g));
/* 🌍 사는 곳 (2026.11.18): 🌳 육지 · 🌊 바다 · ☁️ 하늘 — 자기 땅 칸에 두면 힘이 세지고, 같은 곳 친구가 모이면 무리 효과! */
const RD_HBI = {l: {e: "🌳", n: "육지", c: "#69db7c", c2: "#2b8a3e", t: "튼튼한 힘 — 공격력이 크게 올라요"}, s: {e: "🌊", n: "바다", c: "#4dabf7", c2: "#1864ab", t: "물결 — 때리면 몬스터가 느려져요"}, a: {e: "☁️", n: "하늘", c: "#e5dbff", c2: "#7048e8", t: "바람 — 공격이 빨라지고 멀리 닿아요"}};
const RD_HB = {};
"mouse rabbit dog cat hedgehog fox panda lion tiger unicorn trex kirin wtiger nine titan genbu yggdra mammoth rhino icewolf golem gfox".split(" ").forEach(k => RD_HB[k] = "l");
"frog penguin croc whale shark levi squid kraken cosmos abyss seaking kgod hydra".split(" ").forEach(k => RD_HB[k] = "s");
"chick parrot owl eagle dragon phoenix bdragon gdragon pegasus suzaku eternal griffin thunder moonrab sunbird chrono".split(" ").forEach(k => RD_HB[k] = "a");
RD_K.forEach(k => { RD_A[k].hb = RD_HB[k] || "l"; });
/* 🎚️ 무리 효과: 내 마당에서 '자기 땅 칸'에 선 같은 곳 동물이 3·6·9칸이면 */
const RD_SET = {l: {d: [1, 1.2, 1.45, 1.8]}, s: {d: [1, 1.1, 1.2, 1.35], sl: [0, .15, .25, .4]}, a: {s: [1, 1.15, 1.3, 1.5], r: [0, .3, .6, 1]}};
const rdSetT = n => n >= 9 ? 3 : n >= 6 ? 2 : n >= 3 ? 1 : 0;
/* 🗺️ 맵마다 힘이 센 곳 (10단계마다 바뀌어요) · 마왕성은 모두 조금씩 */
const RD_REG = ["a", "l", "s", "l", "a", "s", "a", "l", "s", "*"];
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
/* 📥 대기 줄 등급 무게 (단계 w · 행운 up): [일반, 희귀, 영웅, 전설, 신화, 초월, 불멸, 태초] — 창세·영원은 조합으로만 */
function rdTrayW(w, up = 1){ w = Math.max(1, w);
  return [Math.max(8, 100 - w*.9), Math.max(18, 10 + Math.min(w, 80)*.9 - Math.max(0, w - 200)*.12)*up, Math.min(60, Math.max(0, w - 3)*.6)*up, Math.min(45, Math.max(0, w - 10)*.3)*up,
    Math.min(30, Math.max(0, w - 25)*.1)*up, Math.min(20, Math.max(0, w - 50)*.04)*up, Math.min(12, Math.max(0, w - 90)*.02)*up, Math.min(6, Math.max(0, w - 150)*.01)*up]; }
const rdTrayP = (w, up) => { const W = rdTrayW(w, up), t = W.reduce((a, b) => a + b, 0); return W.map(v => v/t*100); };

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
.rd-emo .l button:active{transform:scale(.92)}
.rd-cr{position:fixed;left:50%;top:calc(50% - 30px);transform:translate(-50%,-50%);z-index:460;width:min(1000px,97vw);height:min(610px,82vh);display:flex;flex-direction:column;background:linear-gradient(170deg,#fff8fc 0%,#f6f1ff 55%,#eef8ff 100%);border:4px solid #fff;border-radius:28px;padding:12px 14px 14px;box-shadow:0 0 0 3px #d0bfff,0 18px 44px rgba(40,20,90,.45);color:#3b2a6b;font-family:"Jua",sans-serif;contain:layout paint}
.rd-cr[hidden]{display:none}
.rd-cr,.rd-emo{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.rd-cr img[data-im]:not([src]),#mdRdBook img[data-im]:not([src]),.rd-sel img[data-im]:not([src]){visibility:hidden}
/* 🐾 고른 동물 단추 줄 */
.rd-sel{position:fixed;z-index:456;transform:translateX(-50%);width:min(620px,96vw);background:rgba(20,14,48,.94);border:2px solid var(--g,#b197fc);border-radius:20px;padding:8px 10px 10px;color:#fff;font-family:"Jua",sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.45);touch-action:manipulation;-webkit-tap-highlight-color:transparent;animation:rdSelIn .14s ease-out}
.rd-sel[hidden]{display:none}
@keyframes rdSelIn{from{transform:translate(-50%,10px);opacity:0}to{transform:translateX(-50%);opacity:1}}
.rd-sel .rs-hd{display:flex;align-items:center;gap:9px;margin-bottom:7px}
.rd-sel .rs-hd img{width:46px;height:46px;flex:none;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.2),transparent 70%)}
.rd-sel .rs-tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.rd-sel .rs-tx b{font-weight:400;font-size:18px}.rd-sel .rs-tx b em{font-style:normal;color:#ffe066}
.rd-sel .rs-tx small{font:12.5px "Gowun Dodum",sans-serif;color:#d0bfff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rd-sel .rs-tx small i{font-style:normal;font-family:"Jua",sans-serif;color:#1b1233;background:var(--c);border-radius:999px;padding:0 7px}
.rd-sel .rs-tip{font-size:12.5px;color:#c5f6fa}.rd-sel .rs-tip.bad{color:#ffa8a8}
.rd-sel .rs-x{flex:none;align-self:flex-start;width:40px;height:40px;border:0;border-radius:50%;background:rgba(255,255,255,.12);color:#fff;font-size:17px;cursor:pointer;position:relative}
.rd-sel .rs-bt{display:flex;gap:7px}
.rd-sel .rs-bt button{flex:1;min-width:0;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border:0;border-radius:14px;padding:9px 4px;min-height:52px;font:16px "Jua",sans-serif;color:#2b1d5c;background:#e5dbff;box-shadow:0 4px 0 #9775fa;cursor:pointer;white-space:nowrap}
.rd-sel .rs-bt button small{font-size:11.5px;opacity:.85}
.rd-sel .rs-bt button:active{transform:translateY(3px);box-shadow:0 1px 0 #9775fa}
.rd-sel .rs-bt .rs-go{flex:1.4;background:linear-gradient(180deg,#8ce99a,#40c057);color:#0b3d17;box-shadow:0 4px 0 #2b8a3e}
.rd-sel .rs-bt .rs-go[disabled]{background:#495057;color:#adb5bd;box-shadow:0 4px 0 #343a40;cursor:default}
.rd-sel .rs-bt .rs-sell{background:linear-gradient(180deg,#ffe066,#fab005);color:#5c3d00;box-shadow:0 4px 0 #e67700}
.rd-sel .rs-bt .on{background:#ffd43b;box-shadow:0 4px 0 #f08c00}
.rd-sel kbd{position:absolute;top:-7px;right:-3px;font:11px "Jua",sans-serif;background:#ffd43b;color:#3b2a00;border-radius:6px;padding:0 5px;box-shadow:0 1px 0 rgba(0,0,0,.3)}
.rd-sel .rs-gv{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-top:7px;font-size:12.5px;color:#ffd8a8}
.rd-sel .rs-gv button{border:2px solid var(--c);border-radius:999px;background:rgba(255,255,255,.1);color:#fff;font:13px "Jua",sans-serif;padding:4px 10px;cursor:pointer}
.rd-sel .rs-gv button.fit{background:var(--c);color:#1b1233}.rd-sel .rs-gv button small{opacity:.8;font-size:11px}
.rd-sel.side{overflow:auto;scrollbar-width:none}.rd-sel.side .rs-bt{flex-direction:column;gap:6px}.rd-sel.side .rs-bt button{flex:none;min-height:42px;flex-direction:row;gap:6px;padding:7px 8px}
.rd-sel.side .rs-hd{flex-wrap:wrap}
@media (max-height:520px){.rd-sel.side{padding:6px}.rd-sel.side .rs-tx small{display:none}.rd-sel.side .rs-hd{margin-bottom:4px;gap:5px}.rd-sel.side .rs-hd img{width:28px;height:28px}.rd-sel.side .rs-tx b{font-size:14px}.rd-sel.side .rs-tip{font-size:10.5px}.rd-sel.side .rs-x{width:28px;height:28px;font-size:13px}
  .rd-sel.side .rs-bt{gap:4px}.rd-sel.side .rs-bt button{min-height:32px;padding:4px 6px;font-size:13px;box-shadow:0 3px 0 #9775fa}.rd-sel.side .rs-bt button small{font-size:10px}}.rd-sel.side .rs-tx small{white-space:normal}.rd-sel.side .rs-tip{font-size:11.5px}
@media (max-width:640px),(max-height:520px){.rd-sel{padding:6px 7px 8px;border-radius:16px}.rd-sel .rs-hd{margin-bottom:5px}.rd-sel .rs-hd img{width:36px;height:36px}.rd-sel .rs-tx b{font-size:15px}.rd-sel .rs-bt{gap:5px}.rd-sel .rs-bt button{font-size:13.5px;min-height:46px;padding:6px 2px}.rd-sel .rs-bt button small{font-size:10.5px}.rd-sel .rs-x{width:34px;height:34px}}

/* 🎛️ 빠른 행동 줄 (조합 창 · 도감) */
.rd-dock{flex:none;margin-top:8px;display:flex;flex-direction:column;gap:5px;font-family:"Jua",sans-serif}
.rd-dock:empty{display:none}
.rd-dock .dk-row,.rd-dock .dk-sub{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;align-items:stretch}
.rd-dock .dk-row::-webkit-scrollbar,.rd-dock .dk-sub::-webkit-scrollbar{display:none}
.rd-dock .dk-m{flex:none;display:flex;align-items:center;gap:6px;padding:0 12px;border-radius:14px;background:#2b1d5c;color:#ffe066;font-size:15px;white-space:nowrap}
.rd-dock .dk-m b{font-weight:400;font-size:17px}.rd-dock .dk-m em{font-style:normal;color:#e5dbff;font-size:13px}
.rd-dock .dk-b{flex:none;position:relative;border:0;border-radius:14px;padding:8px 12px;font:15px "Jua",sans-serif;background:#fff;color:#5f3dc4;box-shadow:0 3px 0 #d0bfff;cursor:pointer;white-space:nowrap;touch-action:manipulation}
.rd-dock .dk-b small{font-size:12px;opacity:.8}.rd-dock .dk-b b{font-weight:400;color:#e8590c}
.rd-dock .dk-b i{font-style:normal;font-size:11px;background:#ff6b6b;color:#fff;border-radius:999px;padding:0 6px;margin-left:3px;vertical-align:2px}
.rd-dock .dk-b:active{transform:translateY(2px);box-shadow:0 1px 0 #d0bfff}
.rd-dock .dk-sum{background:linear-gradient(180deg,#ffe066,#fab005);color:#5c3d00;box-shadow:0 3px 0 #e67700}
.rd-dock .dk-hot{background:#d3f9d8;color:#2b8a3e;box-shadow:0 3px 0 #8ce99a}
.rd-dock .dk-t.on{background:#7048e8;color:#fff;box-shadow:0 3px 0 #4c2fb0}.rd-dock .dk-car{font-size:11px;opacity:.7}
.rd-dock .dk-p.on{background:#ffd43b;color:#5c3d00}
.rd-dock .dk-off{opacity:.45;filter:grayscale(.5)}
.rd-dock .dk-sub{background:#f3f0ff;border-radius:14px;padding:6px}
.rd-dock .dk-sub .dk-b{box-shadow:0 2px 0 #d0bfff;padding:7px 11px;font-size:14px}
.rd-dock .dk-tip{flex:none;align-self:center;font:12px "Gowun Dodum",sans-serif;color:#7a6aa8;padding:0 4px}
.rd-cr .cx-pin{border:0;border-radius:999px;background:#f3f0ff;color:#7048e8;font:12px "Jua",sans-serif;padding:3px 9px;margin-left:6px;vertical-align:4px;cursor:pointer}
.rd-cr .cx-pin.on{background:#ffd43b;color:#5c3d00}
.rd-cr .cx-ms,.rd-cr .cx-pn{position:absolute;left:8px;top:-9px;font-weight:400;font-size:10.5px;background:#ff922b;color:#fff;border-radius:999px;padding:0 7px}
.rd-cr .cx-pn{left:auto;right:96px;background:#ffd43b;color:#5c3d00}
.rd-dock .dk-tk{box-shadow:0 3px 0 var(--g,#d0bfff),inset 0 0 0 2px var(--g,#d0bfff);color:#2b1d5c}.rd-dock .dk-tk small{margin-right:2px}.rd-dock .dk-tl{align-self:center;font-size:18px}
.rd-cr.cx-mb .rd-dock{margin-top:5px}.rd-cr.cx-mb .rd-dock small{display:inline}.rd-cr.cx-mb .rd-dock .dk-tip{display:none}.rd-cr.cx-mb .rd-dock .dk-b{padding:7px 10px;font-size:13.5px}.rd-cr.cx-mb .rd-dock .dk-m{font-size:13px;padding:0 9px}.rd-cr.cx-mb .rd-dock .dk-m b{font-size:15px}
/* 📌 목표 조합 (화면 아래 왼쪽) */
.rd-pin{position:fixed;z-index:455;display:flex;align-items:center;gap:5px;max-width:min(560px,92vw);border:0;border-radius:16px;padding:5px 10px;background:rgba(20,14,48,.86);color:#fff;font:14px "Jua",sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.35);cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.rd-pin[hidden]{display:none}
.rd-pin .pt{font-size:11px;background:#ffd43b;color:#5c3d00;border-radius:999px;padding:1px 7px}
.rd-pin .po{white-space:nowrap}.rd-pin .pq{color:#b197fc}
.rd-pin .pi{display:inline-flex;align-items:center;gap:1px;background:rgba(255,255,255,.1);border-radius:9px;padding:1px 5px}.rd-pin .pi small{font-size:11px;color:#ffa8a8}.rd-pin .pi.y small{color:#8ce99a}
.rd-pin .pg{color:#8ce99a;white-space:nowrap}
.rd-pin.can{box-shadow:0 0 0 3px #51cf66,0 4px 14px rgba(0,0,0,.35);animation:rdPinGlow 1.2s ease-in-out infinite alternate}
@keyframes rdPinGlow{to{box-shadow:0 0 0 3px #b2f2bb,0 4px 18px rgba(81,207,102,.5)}}
@media (max-width:640px),(max-height:520px){.rd-pin{font-size:12px;padding:4px 8px;gap:3px}.rd-pin .pg{display:none}}

.rd-cr .cx-h{display:flex;align-items:center;gap:10px;padding:0 2px 8px}
.rd-cr .cx-h b{font-size:23px;white-space:nowrap;background:linear-gradient(135deg,#ff8fb1,#b197fc);color:#fff;border-radius:999px;padding:4px 14px 4px 10px;box-shadow:0 3px 0 #9775fa}
.rd-cr .cx-h small{flex:1;font:13px "Gowun Dodum",sans-serif;color:#7a6aa8}
.rd-cr .cx-h button{border:0;border-radius:999px;background:#fff;color:#7048e8;font:15px "Jua",sans-serif;padding:7px 13px;cursor:pointer;box-shadow:0 2px 0 #d0bfff}
.rd-cr .cx-fl{display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;margin-bottom:8px;padding-bottom:2px}
.rd-cr .cx-fl::-webkit-scrollbar{display:none}
.rd-cr .cx-fl button{flex:none;border:2px solid #e5dbff;border-radius:999px;padding:5px 12px;font:14px "Jua",sans-serif;background:#fff;color:#6741d9;cursor:pointer}
.rd-cr .cx-fl button.cx-on{background:#7048e8;border-color:#7048e8;color:#fff;box-shadow:0 2px 0 #4c2fb0}
.rd-cr .cx-bd{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:12px}
.rd-cr .cx-ls{min-height:0;overflow:auto;display:flex;flex-direction:column;gap:9px;padding:9px 4px 2px 2px}
.rd-cr .cx-rw{position:relative;display:flex;align-items:center;gap:8px;border-radius:16px;padding:6px 9px;background:#fff;cursor:pointer;border:2px solid #eee6ff;user-select:none;-webkit-user-select:none;flex:none;box-shadow:0 2px 0 rgba(112,72,232,.08)}
.rd-cr .cx-rw::before{content:"";position:absolute;left:-2px;top:10px;bottom:10px;width:5px;border-radius:0 4px 4px 0;background:var(--g)}
.rd-cr .cx-rw.cx-ok{background:linear-gradient(90deg,#ebfbee,#fff);border-color:#8ce99a}
.rd-cr .cx-rw.cx-ok::after{content:"✨ 만들 수 있어요";position:absolute;right:8px;top:-9px;font-size:11px;background:#51cf66;color:#fff;border-radius:999px;padding:1px 7px}
.rd-cr .cx-rw.cx-on{border-color:#7048e8;box-shadow:0 0 0 3px rgba(112,72,232,.25)}
.rd-cr .cx-rw img{width:40px;height:40px;flex:none;border-radius:12px;background:radial-gradient(circle,var(--g2,#f3f0ff),transparent 70%)}
.rd-cr .cx-rw .cx-nm{flex:1;min-width:0;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#3b2a6b}
.rd-cr .cx-rw .cx-nm small{display:block;font:11.5px "Gowun Dodum",sans-serif;color:#8a7cb8}
.rd-cr .cx-rw .cx-nm small i{font-style:normal;color:#e8590c;font-family:"Jua",sans-serif}
.rd-cr .cx-rw .cx-ig{display:flex;gap:2px;font-size:15px;flex:none}
.rd-cr .cx-rw .cx-ig span{opacity:.3;filter:grayscale(.6)}.rd-cr .cx-rw .cx-ig span.cx-y{opacity:1;filter:none}
.rd-cr .cx-rw .cx-ig sub{font-size:10px;color:#7048e8}
.rd-cr .cx-rw .cx-k{flex:none;font-size:12px;background:#ffd43b;color:#5c3d00;border-radius:7px;padding:1px 6px}
.rd-cr .cx-dt{min-height:0;overflow:auto;background:#fff;border-radius:22px;padding:12px;border:3px dashed var(--g,#d0bfff);display:flex;flex-direction:column;gap:9px}
.rd-cr .cx-tp{display:flex;gap:10px;align-items:center}.rd-cr .cx-tp img{width:72px;height:72px;flex:none;background:radial-gradient(circle,#f3f0ff 30%,transparent 72%);border-radius:50%}
.rd-cr .cx-tp h3{margin:0;font-size:23px;color:#3b2a6b}.rd-cr .cx-tp i{display:inline-block;font-style:normal;font-size:12px;border-radius:999px;padding:1px 8px;margin:3px 3px 0 0;color:#fff;background:var(--q);text-shadow:0 1px 0 rgba(0,0,0,.2)}
.rd-cr .cx-sk{font:13px/1.45 "Gowun Dodum",sans-serif;color:#5f3dc4;background:#f8f5ff;border-radius:12px;padding:7px 10px}
.rd-cr .cx-gd{background:linear-gradient(135deg,#fff9db,#fff4e6);border:2px solid #ffe066;border-radius:16px;padding:8px 10px;display:flex;flex-direction:column;gap:5px}
.rd-cr .cx-gd>b{font-size:15px;color:#e67700}
.rd-cr .cx-gd .st{display:flex;align-items:flex-start;gap:7px;font:13px/1.45 "Gowun Dodum",sans-serif;color:#5c3d00}
.rd-cr .cx-gd .st>span:first-child{flex:none;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font:12px "Jua",sans-serif;background:#ffd43b;color:#5c3d00}
.rd-cr .cx-gd .st.ok>span:first-child{background:#51cf66;color:#fff}
.rd-cr .cx-gd .st b{font-family:"Jua",sans-serif;font-weight:400;color:#3b2a6b}
.rd-cr .cx-gd .st em{font-style:normal;color:#2b8a3e}.rd-cr .cx-gd .st u{text-decoration:none;color:#e03131}
.rd-cr .cx-gd .sub{display:inline-flex;gap:3px;flex-wrap:wrap;margin-left:2px}
.rd-cr .cx-gd .sub span{font-size:12px;border-radius:8px;padding:0 5px;background:#fff;border:1px solid #ffe8a1}
.rd-cr .cx-gd .sub span.y{background:#d3f9d8;border-color:#8ce99a}
.rd-cr .cx-nd{display:flex;flex-wrap:wrap;gap:5px}
.rd-cr .cx-nd span{font-size:14px;border-radius:12px;padding:3px 9px;background:#f1f3f5;color:#868e96;border:2px solid transparent}
.rd-cr .cx-nd span.cx-y{background:#d3f9d8;color:#2b8a3e;border-color:#8ce99a}
.rd-cr .cx-yd{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;max-width:260px;width:100%;align-self:center;background:#e6fcf5;border-radius:18px;padding:8px}
.rd-cr .cx-yd>div{position:relative;aspect-ratio:1;border-radius:14px;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;border:2px solid #c3fae8;user-select:none;-webkit-user-select:none;box-shadow:0 2px 0 rgba(0,0,0,.06)}
.rd-cr .cx-yd>div.cx-no{background:#f8f9fa;border-color:#f1f3f5;cursor:default}.rd-cr .cx-yd>div.cx-no img{opacity:.3;filter:grayscale(.7)}
.rd-cr .cx-yd>div.cx-use{border-color:#51cf66;background:#d3f9d8}
.rd-cr .cx-yd>div.cx-can{border-color:#ffd43b;border-style:dashed}
.rd-cr .cx-yd>div.cx-cur{outline:3px solid #7048e8;outline-offset:1px}
.rd-cr .cx-yd img{width:80%;height:80%}
.rd-cr .cx-yd b{position:absolute;right:4px;bottom:2px;font-size:12px;color:#5f3dc4}
.rd-cr .cx-yd em{position:absolute;left:3px;top:2px;font-style:normal;font-size:12px;background:#51cf66;color:#fff;border-radius:7px;padding:0 5px}
.rd-cr .cx-yd u{position:absolute;right:2px;top:0;text-decoration:none;font-size:16px}
.rd-cr .cx-yd>div.cx-dst{background:#fff9db;border-color:#fab005}
.rd-cr .cx-ac{display:flex;gap:6px;flex-wrap:wrap}
.rd-cr .cx-ac button{flex:1;min-width:110px;border:0;border-radius:14px;padding:9px 8px;font:15px "Jua",sans-serif;cursor:pointer;background:#f3f0ff;color:#5f3dc4;box-shadow:0 3px 0 #d0bfff}
.rd-cr .cx-ac button.cx-on{background:#ffd43b;color:#5c3d00;box-shadow:0 3px 0 #f08c00}
.rd-cr .cx-ac button.cx-go{background:linear-gradient(180deg,#ff8fb1,#f06595);color:#fff;font-size:17px;box-shadow:0 3px 0 #c2255c}.rd-cr .cx-ac button.cx-go[disabled]{background:#e9ecef;color:#adb5bd;box-shadow:none;cursor:default}
.rd-cr .cx-ac button small{opacity:.75;font-size:12px}
.rd-cr .cx-tip{font:12.5px/1.45 "Gowun Dodum",sans-serif;color:#7a6aa8;text-align:center}
.rd-cr .cx-h[data-drag]{cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}
.rd-cr.cx-mv{opacity:.92;box-shadow:0 0 0 3px #b197fc,0 26px 60px rgba(40,20,90,.55)}.rd-cr.cx-mv .cx-h{cursor:grabbing}
.rd-cr .cx-grip{flex:none;font-size:20px;color:#b197fc;letter-spacing:-2px}
.rd-cr .cx-h button.cx-mini{background:#f3f0ff}
.rd-cr.cx-sm{width:min(470px,96vw);height:min(560px,78vh)}
.rd-cr.cx-sm .cx-h small,.rd-cr.cx-sm .cx-ls{display:none}
.rd-cr.cx-sm .cx-bd{grid-template-columns:1fr;grid-template-rows:minmax(0,1fr)}
.rd-cr.cx-sm .cx-fl{display:none}
.rd-cr ::-webkit-scrollbar{width:8px}.rd-cr ::-webkit-scrollbar-thumb{background:#d0bfff;border-radius:4px}
@media (max-width:720px),(orientation:portrait){.rd-cr{height:min(860px,86vh)}.rd-cr .cx-bd{grid-template-columns:1fr;grid-template-rows:minmax(0,.8fr) minmax(0,1.6fr)}}
/* 🧩 조합 식 (모든 화면) */
.rd-cr .cx-dl,.rd-cr .cx-dr,.rd-cr .cx-inf{display:contents}
.rd-cr .cx-mr,.rd-cr .cx-yh{display:none}
.rd-cr .cx-rw .cx-ig i{font-style:normal;font-size:10px;color:#b197fc;align-self:center;margin:0 1px}
.rd-cr .cx-fm{display:flex;align-items:center;flex-wrap:wrap;gap:6px;background:linear-gradient(135deg,#f8f5ff,#eef8ff);border-radius:18px;padding:8px}
.rd-cr .fm-out{display:flex;flex-direction:column;align-items:center;min-width:58px}
.rd-cr .fm-out img{width:50px;height:50px;border-radius:50%;background:radial-gradient(circle,#fff 40%,transparent 72%)}
.rd-cr .fm-out b{font-size:13px;font-weight:400;color:#3b2a6b;white-space:nowrap}
.rd-cr .fm-eq,.rd-cr .fm-pl{font-style:normal;font-size:20px;color:#9775fa;line-height:1}
.rd-cr .fm-in{position:relative;display:flex;flex-direction:column;align-items:center;gap:1px;min-width:64px;padding:6px 6px 5px;border-radius:14px;background:#fff;border:2px dashed #ffc9c9;font-family:"Jua",sans-serif;color:#3b2a6b;cursor:default}
.rd-cr .fm-in[data-t]{cursor:pointer}
.rd-cr .fm-in.ok{border:2px solid #8ce99a;background:#f4fff6}
.rd-cr .fm-in.in{box-shadow:0 0 0 3px rgba(81,207,102,.3)}
.rd-cr .fm-in img{width:38px;height:38px}
.rd-cr .fm-in b{font-size:12px;font-weight:400;white-space:nowrap}
.rd-cr .fm-in em{font-style:normal;font-size:11px;color:#e8590c;white-space:nowrap}.rd-cr .fm-in.ok em{color:#2b8a3e}
.rd-cr .fm-c{position:absolute;right:-6px;top:-8px;min-width:22px;padding:1px 6px;border-radius:999px;background:#ff6b6b;color:#fff;font-size:13px;line-height:18px;box-shadow:0 2px 0 rgba(0,0,0,.12)}
.rd-cr .fm-c small{font-size:10px;opacity:.85}.rd-cr .fm-in.ok .fm-c{background:#40c057}
/* 📱 휴대폰: 화면 가득 · 조합 식 크게 · 마당과 만들기 단추는 한눈에 */
.rd-cr.cx-mb{left:0;top:0;transform:none!important;width:100vw;height:100vh;height:100dvh;border:0;border-radius:0;box-shadow:none;z-index:950;
  padding:max(6px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(6px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left))}
.rd-cr.cx-mb .cx-h{padding:0 0 5px;gap:6px;cursor:default}
.rd-cr.cx-mb .cx-h small,.rd-cr.cx-mb .cx-grip,.rd-cr.cx-mb .cx-mini,.rd-cr.cx-mb .cx-lg,.rd-cr.cx-mb button small,.rd-cr.cx-mb .cx-nd,.rd-cr.cx-mb .cx-k,.rd-cr.cx-mb .cx-kb{display:none}
.rd-cr.cx-mb .cx-h b{font-size:17px;padding:3px 12px 3px 9px;box-shadow:0 2px 0 #9775fa}
.rd-cr.cx-mb .cx-h .cx-x{margin-left:auto;font-size:17px;padding:5px 16px;background:#7048e8;color:#fff;box-shadow:0 2px 0 #4c2fb0}
.rd-cr.cx-mb .cx-fl{margin-bottom:5px;gap:5px}
.rd-cr.cx-mb .cx-fl button{font-size:12.5px;padding:4px 10px;border-width:1.5px}
.rd-cr.cx-mb .cx-bd{gap:8px}
.rd-cr.cx-mb .cx-ls{gap:7px;padding:8px 3px 2px 2px}
.rd-cr.cx-mb .cx-rw{padding:4px 7px;gap:6px;border-radius:13px}
.rd-cr.cx-mb .cx-rw img{width:30px;height:30px;border-radius:9px}
.rd-cr.cx-mb .cx-rw .cx-nm{font-size:13.5px}.rd-cr.cx-mb .cx-rw .cx-nm small{font-size:10.5px}
.rd-cr.cx-mb .cx-rw .cx-ig{font-size:13px}
.rd-cr.cx-mb .cx-rw.cx-ok::after{content:"✨ 가능";font-size:10px;top:-8px;padding:0 6px}
.rd-cr.cx-mb .cx-dt{padding:8px;border-width:2px;border-radius:18px;gap:7px}
.rd-cr.cx-mb .cx-tp{gap:7px}.rd-cr.cx-mb .cx-tp img{width:40px;height:40px}.rd-cr.cx-mb .cx-tp h3{font-size:17px}.rd-cr.cx-mb .cx-tp i{font-size:10.5px;padding:0 7px;margin:2px 2px 0 0}
.rd-cr.cx-mb .cx-fm{padding:9px 5px 6px;gap:3px;justify-content:center}
body.rd-cr-on #gcBtn,body.rd-cr-on #gcToast{display:none!important}
.rd-cr.cx-mb .fm-out{min-width:50px}.rd-cr.cx-mb .fm-out img{width:42px;height:42px}
.rd-cr.cx-mb .fm-in{min-width:52px;padding:5px 3px 4px}.rd-cr.cx-mb .fm-in b{font-size:11px}.rd-cr.cx-mb .fm-in em{font-size:10px}.rd-cr.cx-mb .fm-eq,.rd-cr.cx-mb .fm-pl{font-size:15px}.rd-cr.cx-mb .fm-in img{width:32px;height:32px}
.rd-cr.cx-mb .cx-mr{display:block;border:0;background:none;color:#7048e8;font:13px "Jua",sans-serif;padding:2px;cursor:pointer;text-align:center}
.rd-cr.cx-mb .cx-inf{display:none}.rd-cr.cx-mb .cx-more .cx-inf{display:flex;flex-direction:column;gap:7px}
.rd-cr.cx-mb .cx-yh{display:block;font-size:13px;color:#2b8a3e}.rd-cr.cx-mb .cx-yh small{font:11px "Gowun Dodum",sans-serif;color:#7a6aa8;margin-left:4px}
.rd-cr.cx-mb .cx-yd{gap:4px;padding:5px;border-radius:14px}
.rd-cr.cx-mb .cx-yd>div{border-radius:10px}.rd-cr.cx-mb .cx-yd em{font-size:9.5px;padding:0 3px;left:1px;top:1px}.rd-cr.cx-mb .cx-yd b{font-size:10px;right:2px;bottom:0}.rd-cr.cx-mb .cx-yd u{font-size:12px}
.rd-cr.cx-mb .cx-ac{gap:5px;flex-wrap:nowrap}
.rd-cr.cx-mb .cx-ac button{min-width:0;padding:9px 4px;font-size:13.5px;border-radius:12px;white-space:nowrap}
.rd-cr.cx-mb .cx-ac button.cx-go{flex:1.4;font-size:16px}
.rd-cr.cx-mb .cx-tip{font-size:11.5px;line-height:1.35}
@media (orientation:landscape){
  .rd-cr.cx-mb .cx-bd{grid-template-columns:minmax(170px,.85fr) minmax(0,2fr);grid-template-rows:minmax(0,1fr)}
  .rd-cr.cx-mb .cx-dt{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);overflow:hidden}
  .rd-cr.cx-mb .cx-dl,.rd-cr.cx-mb .cx-dr{display:flex;flex-direction:column;gap:6px;min-height:0;overflow:auto}
  .rd-cr.cx-mb .cx-yd{margin-top:auto}.rd-cr.cx-mb .cx-tip{margin-bottom:auto}
  .rd-cr.cx-mb .cx-yd{width:min(100%,calc(100vh - 262px));width:min(100%,calc(100dvh - 262px));min-width:96px;flex:none}
  .rd-cr.cx-mb .rd-dock .dk-b{padding:5px 9px}.rd-cr.cx-mb .rd-dock .dk-sub{padding:4px}
  .rd-cr.cx-mb .cx-yh{display:none}
  .rd-cr.cx-mb .cx-yh small{display:none}
  .rd-cr.cx-mb .cx-tip{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:none}
  .rd-cr.cx-mb .cx-fm{flex-wrap:nowrap}.rd-cr.cx-mb .fm-out{min-width:0;flex:none}.rd-cr.cx-mb .fm-out img{width:36px;height:36px}
  .rd-cr.cx-mb .fm-in{flex:1 1 0;min-width:0;max-width:66px}.rd-cr.cx-mb .fm-in img{width:28px;height:28px}.rd-cr.cx-mb .fm-in b,.rd-cr.cx-mb .fm-in em{max-width:100%;overflow:hidden;text-overflow:ellipsis}
  .rd-cr.cx-mb .fm-c{right:-4px;font-size:11px;line-height:16px;padding:0 5px}
}
@media (orientation:landscape) and (max-width:700px){
  .rd-cr.cx-mb .cx-bd{grid-template-columns:minmax(118px,.55fr) minmax(0,2fr)}
  .rd-cr.cx-mb .cx-rw .cx-ig,.rd-cr.cx-mb .cx-rw .cx-nm small{display:none}
  .rd-cr.cx-mb .cx-dt{grid-template-columns:minmax(0,1.2fr) minmax(0,1fr)}
  .rd-cr.cx-mb .cx-tp h3{font-size:15px}.rd-cr.cx-mb .cx-tp i{display:none}
  .rd-cr.cx-mb .cx-ac button{font-size:12.5px;white-space:nowrap;padding:8px 2px}.rd-cr.cx-mb .cx-ac button.cx-go{font-size:14px}
}
@media (orientation:portrait){
  .rd-cr.cx-mb .cx-bd{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr)}
  .rd-cr.cx-mb .cx-ls{flex-direction:row;overflow-x:auto;overflow-y:hidden;padding:9px 2px 4px;scrollbar-width:none}
  .rd-cr.cx-mb .cx-ls::-webkit-scrollbar{display:none}
  .rd-cr.cx-mb .cx-rw{flex-direction:column;width:104px;padding:6px 4px 5px;gap:2px;text-align:center}
  .rd-cr.cx-mb .cx-rw::before{left:12px;right:12px;top:-2px;bottom:auto;width:auto;height:4px;border-radius:0 0 4px 4px}
  .rd-cr.cx-mb .cx-rw .cx-nm{flex:none;width:100%}.rd-cr.cx-mb .cx-rw .cx-nm small{display:none}
  .rd-cr.cx-mb .cx-dt{overflow:auto;display:flex;flex-direction:column}
  .rd-cr.cx-mb .cx-dl,.rd-cr.cx-mb .cx-dr{display:contents}
  .rd-cr.cx-mb .cx-mr,.rd-cr.cx-mb .cx-inf{order:9}.rd-cr.cx-mb .cx-yh small{display:none}
  .rd-cr.cx-mb .cx-yd{width:min(100%,calc(100dvh - 650px),216px);min-width:150px;max-width:none;flex:none}
  .rd-cr.cx-mb .cx-yh{display:none}.rd-cr.cx-mb .cx-tp img{width:34px;height:34px}.rd-cr.cx-mb .cx-tp i{display:none}
  .rd-cr.cx-mb .cx-ls{align-items:flex-start;max-height:122px}
  .rd-cr.cx-mb .cx-fm{flex-wrap:nowrap}.rd-cr.cx-mb .fm-in{flex:1 1 0;min-width:0;max-width:84px}
}
`; document.head.appendChild(st); })();

NG.defs.rd = () => {
  const O = NG.opt || {}, SIDS = NG.sids.slice(0, 6), N = SIDS.length;
  const party = O.party || null, myIdx = party === "guest" ? O.idx : 0;
  /* 👀 관전 (2026.11.19): 판에 끼지 않고 보기만 — local[0]은 '지금 보는 친구'(눌러서 바꿔요), 행동은 하나도 안 보내요 */
  const SPEC = party === "guest" && !!O.spec;
  const local = SPEC ? [0] : party === "guest" ? [O.idx] : (O.local || [0]).slice(0, 2);
  const remote = i => party === "host" && O.remote && O.remote[i] != null;
  const ZS = 16, LIMIT0 = 130 + 45*(N - 1);
  let LIMIT = LIMIT0;   // 🛡️ 수호 방패 · 💥 유리 대포 유물로 바뀌어요
  let LPAD = 90, W = 1280, H = 720, land = true, C = 90, BX = 0, BY = 0, COLS = 8, ROWS = 5, GC = 1, TOPH = 70, BOTH = 120, ZO = [], LN = [], CELL = new Map(), MAPI = -1, lastSW = 1280, lastSH = 720, layer = null, layerKey = "", SH = null;   // SH: 🤝 같이 하기 공동 맵
  let Z, PS, E, PR, FX, MS, wave, waveT, spawnLeft, spawnT, state, overT, score, kills, bossK, eid, gv, speed, banner, sel, drag, ptr, panel, NQ, outbox, aseq, lastAct, sndT, ended, seed, bossTimer, frame;
  const R = (() => { let s = 1; return {seed(v){ s = (v >>> 0) || 1; }, get(){ return s; }, f(){ s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s/4294967296; }}; })();
  const th = () => RD_TH[Math.floor((Math.max(1, wave) - 1)/10) % 10];
  const dimOf = w => Math.floor((Math.max(1, w) - 1)/100) + 1;   // 🌀 100단계마다 한 차원씩 (10차원 = 1000단계)
  /* 30단계부터는 조금 덜 가파르게 (예전엔 40단계에서 다 막혔어요) — 대신 🎁 유물·🎒 아이템으로 강해져요 */
  /* 🏔️ 1000단계까지: 처음엔 가파르게, 갈수록 완만하게 — 대신 💰 금도 단계마다 늘고 ⬆️ 강화는 끝없이 올라가요 */
  /* 💪 (2026.11.18 난이도 ↑↑) 체력 ×18 · 보통 몬스터 ×3.5 더 · 1~40단계 단계마다 +3.5% · 같이 하면 사람마다 +80% — 시험 봇: 아무렇게나 두면 23~29단계에서 몬스터가 넘쳐 지고, 땅·무리·조합을 잘 짜면 30~50단계 */
  /* 😊 (2026.11.19 난이도 ↓) 아이들이 너무 어렵다고 해서: 체력 18→10 · 보통 몬스터 ×3.5→×2.4 · 같이 하면 사람마다 +80%→+50% · 몬스터 한도 +30 */
  let HPK = 10, NRM = 2.4, RMP = 1.035;   /* 😤 (2026.11.18 난이도 ↑) 보통 몬스터는 보스보다 더 많이 세졌어요(×3.5) — 보스만 벽이고 보통 단계는 너무 쉬웠어요 · 1~40단계는 단계마다 3.5%씩 더 (40단계 ×3.8) */
  const hpAt = w => HPK*15*Math.pow(RMP, Math.min(w, 40) - 1)*Math.pow(1.17, Math.min(w, 30) - 1)*Math.pow(1.15, Math.min(30, Math.max(0, w - 30)))*Math.pow(1.09, Math.min(90, Math.max(0, w - 60)))
    *Math.pow(1.05, Math.min(150, Math.max(0, w - 150)))*Math.pow(1.036, Math.min(200, Math.max(0, w - 300)))*Math.pow(1.042, Math.max(0, w - 500))*(1 + .5*(N - 1));   // 🤝 (2026.11.18) 같이 하면 모두가 모든 몬스터를 때리니까 사람마다 +80% (동물이 사람마다 1초에 한 마리씩 오니까)
  /* 💪 (2026.11.18) 150단계부터 몬스터가 훨씬 빨리 세져요 — 예전엔 300단계 뒤 ×1.02씩이라 금(×1.025)·강화가 더 빨라서 400단계부터 너무 쉬웠어요.
     이제 150~300 ×1.05 · 300~500 ×1.036 · 500~ ×1.042 → 태초만으로는 버티기 어렵고 🌌 창세 · ♾️ 영원 조합과 강화·유물을 잘 써야 해요 */
  const gmul = () => Math.pow(1.025, Math.max(0, wave - 60));
  /* 🎁 유물 · 🎒 아이템 */
  const RL = (z, k) => (Z[z] && Z[z].rel && Z[z].rel[k]) || 0;
  /* 🔬 동물 연구소(코인으로 영원히 키우는 능력) — 판마다 지갑에서 읽어 두고 써요 */
  const PK = z => (Z[z] && Z[z].pk) || RDP.perk(SIDS[z]);
  const bagN = z => 3 + 2*RL(z, "bag") + (PK(z).bag || 0);
  const slowAll = () => Math.min(.3, Z.reduce((a, p) => a + ((p.rel && p.rel.slow) || 0), 0)*.1);
  const relMul = (z, A, e) => (1 + .04*(PK(z).atk || 0))*(1 + .3*RL(z, "atk"))*(A.g < 2 ? 1 + .6*RL(z, "low") : 1)*(A.g >= 3 ? 1 + .4*RL(z, "top") : 1)*(A.g >= 4 ? 1 + .6*RL(z, "myth") : 1)*(Z[z].fev > 0 ? 2 : 1)*(e && (e.kind === 1 || e.kind === 2) ? 1 + .6*RL(z, "boss") : 1)
    *(A.ro === "m" ? 1 + .5*RL(z, "melee") : A.ro === "r" ? 1 + .5*RL(z, "ranged") : 1 + .8*RL(z, "support"))*(1 + .7*RL(z, "glass"))
    *(e && e.tt === 1 ? (A.ro === "r" ? .5 : 1.2) : 1)*(e && e.tt === 3 ? (A.ro === "s" ? 1.8 : .6) : 1)
    /* 🌍 땅마다 잘 잡는 몬스터: ☁️ 하늘 → 🦇 날개 ×1.5 · 🌳 육지 → 🛡️ 단단함 ×1.3 · 🌊 바다 → 💨 질주·💚 재생 ×1.5 */
    *(e && e.tt === 2 && A.hb === "a" ? 1.5 : 1)*(e && e.tt === 1 && A.hb === "l" ? 1.3 : 1)*(e && (e.tt === 6 || e.tt === 5) && A.hb === "s" ? 1.5 : 1);   // 🛡️ 단단한 몬스터는 원거리 반감·근거리 +20% · 👻 유령은 지원 동물이 잘 잡아요
  const rndItem = () => RD_IK[Math.floor(R.f()*RD_IK.length)];
  function giveItem(z, k){ const p = Z[z]; if (!p) return false; if (p.it.length >= bagN(z)){ toastZ(z, `🎒 가방이 꽉 차서 ${RD_IT[k].e}${RD_IT[k].n}을(를) 못 담았어요`); return false; } p.it.push(k); gv++; return true; }
  function relPick(z){ const L = RD_RK.filter(k => z == null || !RD_REL[k].max || RL(z, k) < RD_REL[k].max), out = [];   // 💫 등급이 높을수록 드물게
    while (out.length < 3 && L.length){ const tot = L.reduce((a, k) => a + RD_RR[RD_REL[k].r].w, 0); let r = R.f()*tot, j = 0; for (; j < L.length - 1; j++) if ((r -= RD_RR[RD_REL[L[j]].r].w) < 0) break; out.push(L.splice(j, 1)[0]); } return out; }
  function offerRel(z){ const p = Z[z]; if (p.pick) takeRel(z, 0, true); const L = relPick(z); while (L.length < 3){ const k = RD_RK[Math.floor(R.f()*RD_RK.length)]; if (!RD_REL[k].max) L.push(k); } p.pick = L.slice(0, 3); gv++; }
  function takeRel(z, j, quiet){ const p = Z[z]; if (!p.pick) return; const k = p.pick[j] || p.pick[0]; p.pick = null; p.rel[k] = (p.rel[k] || 0) + 1;
    if (k === "bag"){ giveItem(z, rndItem()); giveItem(z, rndItem()); }
    if (k === "star"){ p.gems += 5; if (p.tr) for (let i = 0; i < TRN; i++){ const W0 = trayW(z); let g = 2; for (let t = 0; t < 3; t++){ const gg = Math.min(RD_MAXG, 2 + Math.floor(R.f()*R.f()*4)); if (gg > g) g = gg; } p.tr[i] = {k: pick(Math.min(g, 4)), t: frame - TRN + i}; } p.trV = (p.trV || 0) + 1; }
    calcLimit();
    if (!quiet){ sfx("big", z); toastZ(z, `${RD_REL[k].e} ${RD_REL[k].n} Lv.${p.rel[k]}! ${RD_REL[k].d}`); } gv++; }
  const isMine = z => !SPEC && local.includes(z);
  function calcLimit(){ let gu = 0, gl = 0, sh = 0; Z.forEach((p, z) => { gu += RL(z, "guard"); gl += RL(z, "glass"); sh += RL(z, "shell"); }); const bs = E && E.some(e => e.kind === 2);
    LIMIT = Math.max(40, LIMIT0 + 25*gu - 15*gl + 10*sh + (bs ? 30*sh : 0) + (wallT > 0 ? 40 : 0)); }   // 🐢 거북 등껍질 · 🧱 돌담
  let wallT = 0, honT = 0, metT = 0;
  const sp = (k, w, h, fn) => G2.spr("rd" + k, w, h, fn);

  /* ---------- 소리 ---------- */
  const lastS = {};
  function playS(k){
    const nf = NG.frame || 0; if (lastS[k] != null && nf - lastS[k] >= 0 && nf - lastS[k] < 4) return; lastS[k] = nf;   // ⚡ 같은 소리가 한 화면에 겹치지 않게
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
    /* 📱 화면 꽉 채우기 (2026.11.17): 판 크기를 기기 화면 비율에 맞춰서 옆·위아래 빈 곳이 없게 */
    if (land){ H = 720; W = Math.round(Math.max(960, Math.min(1700, H*sw/Math.max(1, sh)))); TOPH = 62; BOTH = 112; GC = N === 1 ? 1 : 2; }
    else { W = 720; H = Math.round(Math.max(1000, Math.min(1700, W*sh/Math.max(1, sw)))); TOPH = 70; BOTH = two ? 250 : 220; GC = 1; }
    LPAD = Math.ceil(88/Math.max(.2, Math.min(sw/W, sh/H)));   // 왼쪽 위 🔊·✕ 단추 자리
    if (window.VK_ON) BOTH = two && !land ? 120 : 64;   // ⌨️ 화면 키보드가 있으면 아래 단추 대신 금·보석만
    if (SPEC) BOTH = land ? 100 : 150;   // 👀 관전: 아래엔 친구 고르기 줄만
    /* 🗺️ 맵: 친구마다 4×4(16칸) 마당 · 길 하나 · 🌀 문은 사람 수만큼(10단계마다 모양이 바뀌어요) · 함께 지켜요 */
    lastSW = sw; lastSH = sh;
    const ti = Math.floor((Math.max(1, wave || 1) - 1)/10) % 10; MAPI = ti;
    /* 🗺️ 4×4 마당 맵: 혼자든 같이든 길 하나 · 친구마다 16칸 마당 · 🌀 문은 사람 수만큼 (rdart.js rdGen) */
    { const TP = rdGen(N, ti, land); GC = 1; COLS = TP.w; ROWS = TP.h;
      const aw = W - 10, ah = H - TOPH - BOTH - 40;
      C = Math.floor(Math.min(130, aw/COLS, ah/ROWS)); BX = Math.round((W - COLS*C)/2); BY = Math.round(TOPH + 34 + (ah - ROWS*C)/2);
      /* 🔍 (2026.11.19) 같이 할 때 휴대폰·태블릿에서 맵이 너무 작으면 → '내 마당 크게 보기' (카메라)
         내 마당과 둘레 길이 화면을 채우게 크게 · 빈 땅을 끌면 맵을 움직여요 · 오른쪽 위 작은 지도로 전체를 보고 눌러서 이동 */
      const sc = Math.min(sw/W, sh/H), my = two ? -1 : (local[0] != null ? local[0] : 0), Zb = my >= 0 && TP.zones[my] ? TP.zones[my].box : null;
      CAM.can = N > 1 && !!Zb && C*sc < 62; CAM.fitC = C;
      if (CAM.can && CAM.on){ const m = 1.05, bw = Zb[2] - Zb[0] + m*2, bh = Zb[3] - Zb[1] + m*2, [qx0, qy0, qx1, qy1] = camArea(), aw2 = qx1 - qx0, ah2 = qy1 - qy0;
        C = Math.max(C, Math.floor(SPEC ? Math.min(aw2/bw, ah2/bh) : Math.min(84/sc, aw2/bw, ah2/bh)));
        if (CAM.fx == null || CAM.key !== N + "|" + ti + "|" + land + "|" + my){ CAM.key = N + "|" + ti + "|" + land + "|" + my; CAM.fx = (Zb[0] + Zb[2])/2; CAM.fy = (Zb[1] + Zb[3])/2; }
        camTo(CAM.fx, CAM.fy, true); }
      const path = TP.path.map(([x, y]) => [x + .5, y + .5]);
      SH = {ox: 0, oy: 0, w: TP.w, h: TP.h, map: TP, path, front: TP.front, doors: TP.doors};
      LN = []; CELL = new Map(); ZO = [];
      TP.zones.forEach((Zn, z) => { const [x0, y0, x1, y1] = Zn.box; ZO.push([x0, y0]);
        const L = {ox: x0, oy: y0, w: x1 - x0, h: y1 - y0, map: TP, path, slots: Zn.slots.map(([x, y]) => [x + .5, y + .5]), front: Zn.front};
        L.slots.forEach(([x, y], s) => CELL.set(Math.floor(x) + "," + Math.floor(y), {z, i: s})); LN.push(L); });
      calcTerr(); bufV = -1; layerKey = ""; panel = null; }
  }
  /* 🔍 카메라: 맵 칸(fx, fy)을 판 가운데로 · 판 밖으로 너무 나가지 않게 */
  /* 👀 관전은 처음엔 🗺️ 전체 보기(판 전체가 화면에 딱 맞게) · 관전용 설정은 따로 기억해요 */
  const CAMK = SPEC ? "arcade.rdcamS" : "arcade.rdcam";
  const CAM = {on: (() => { try { const v = localStorage.getItem(CAMK); return SPEC ? v === "1" : v !== "0"; } catch(e){ return !SPEC; } })(), can: false, fx: null, fy: null, key: "", fitC: 0};
  function camArea(){ const r = zoomed() && land ? W - mmRect().w - 26 : W - 5;
    /* 📱 (2026.11.20) 세로 화면 크게 보기: 오른쪽 위 작은 지도·전체 보기 단추 아래부터 맵을 보여 줘요 (예전엔 지도 밑에 빈 띠가 생기고 알림이 지도를 가렸어요) */
    const top = zoomed() && !land ? (b => b.y + b.h + 8)(camBtn()) : TOPH + 34;
    return [5, top, r, H - BOTH - 6]; }   // 가로 화면 크게 보기: 오른쪽 작은 지도 자리는 비워 둬요
  function camTo(fx, fy, quiet){ const [ax0, ay0, ax1, ay1] = camArea(), mw = COLS*C, mh = ROWS*C;
    let bx = (ax0 + ax1)/2 - fx*C, by = (ay0 + ay1)/2 - fy*C;
    const ox = zoomed() ? Math.max(0, (ax1 - ax0)/2 - 2*C) : 0, oy = zoomed() && land ? Math.max(0, (ay1 - ay0)/2 - 2*C) : 0;   /* 📱 세로 화면: 맵 위쪽에 빈 띠가 생기지 않게 (2026.11.20) */   // 🔍 가장자리 마당도 화면 가운데에 오게
    bx = mw <= ax1 - ax0 ? (ax0 + ax1 - mw)/2 : Math.min(ax0 + ox, Math.max(ax1 - mw - ox, bx)); by = mh <= ay1 - ay0 ? (ay0 + ay1 - mh)/2 : Math.min(ay0 + oy, Math.max(ay1 - mh - oy, by));
    BX = Math.round(bx); BY = Math.round(by); CAM.fx = ((ax0 + ax1)/2 - BX)/C; CAM.fy = ((ay0 + ay1)/2 - BY)/C; if (!quiet) setSky(); }
  function camToggle(){ CAM.on = !CAM.on; try { localStorage.setItem(CAMK, CAM.on ? "1" : "0"); } catch(e) {} CAM.fx = null; playS("warn"); NG.fit(); }
  const zoomed = () => CAM.can && CAM.on;
  /* 🗺️ 작은 지도 (오른쪽 위) · 그 아래 🔍/🗺️ 단추 */
  function mmRect(){ const w = Math.round(Math.min(land ? 200 : 120, W*.2)), h = Math.round(Math.min(w*ROWS/COLS, (H - TOPH - BOTH)*(land ? .34 : .2))), w2 = Math.round(h*COLS/ROWS); return {x: W - w2 - 10, y: TOPH + 40, w: w2, h}; }
  function camBtn(){ const m = zoomed() ? mmRect() : {x: W - 10, y: TOPH + 40 - 8, w: 0, h: 0}, bw = land ? 150 : 128, bh = land ? 46 : 42; return {x: m.x + m.w - bw, y: m.y + m.h + 8, w: bw, h: bh}; }
  function mmDraw(g, fr){ if (!CAM.can) return; const b = camBtn();
    if (zoomed()){ const m = mmRect(), sx = m.w/(COLS*C), sy = m.h/(ROWS*C);
      G2.put(g, sp(`mm${layerKey}${m.w}x${m.h}`, m.w + 8, m.h + 8, t => { t.fillStyle = "rgba(15,10,40,.78)"; rrect(t, 0, 0, m.w + 8, m.h + 8, 12); t.fill(); if (layer) t.drawImage(layer, 4, 4, m.w, m.h);
        LN.forEach((L, z) => { t.strokeStyle = RD_PC[z]; t.lineWidth = z === local[0] ? 3 : 1.5; t.strokeRect(4 + L.ox*C*sx, 4 + L.oy*C*sy, L.w*C*sx, L.h*C*sy); }); }), m.x - 4, m.y - 4);
      g.fillStyle = "#ff6b6b"; for (const e of E){ const r = e.kind ? 4 : 2; g.fillRect(m.x + e.x*C*sx - r, m.y + e.y*C*sy - r, r*2, r*2); }
      const [ax0, ay0, ax1, ay1] = camArea(); g.strokeStyle = "#fff"; g.lineWidth = 2; g.strokeRect(m.x + Math.max(0, (ax0 - BX)*sx), m.y + Math.max(0, (ay0 - BY)*sy), Math.min(m.w, (ax1 - ax0)*sx), Math.min(m.h, (ay1 - ay0)*sy)); }
    G2.put(g, btnSpr(b.w, b.h, zoomed() ? "#e7f5ff" : "#ffd43b", zoomed() ? "#74c0fc" : "#f08c00", zoomed() ? ["🗺️", "전체 보기"] : ["🔍", "크게 보기"], 17), b.x, b.y);
    if (kHint){ const l = lbl(["Z"], 12, "#fff"); g.fillStyle = "rgba(0,0,0,.55)"; rrect(g, b.x + 4, b.y + b.h - l.h - 4, l.w + 8, l.h + 2, 7); g.fill(); G2.put(g, l, b.x + 8, b.y + b.h - l.h - 3); } }
  let pan = null;
  const plOf = l => (LN[l] || LN[0]).path.length;
  function posAt(d, l){ const P = (LN[l || 0] || LN[0]).path, n = P.length; d = ((d % n) + n) % n; const i = Math.floor(d), f = d - i, a = P[i], b = P[(i + 1) % n]; return [a[0] + (b[0] - a[0])*f, a[1] + (b[1] - a[1])*f]; }
  /* 맵이 바뀌면(10단계마다) 길·자리를 다시 만들어요 */
  function remap(){ const ti = Math.min(9, Math.floor((Math.max(1, wave) - 1)/10)); if (ti !== MAPI) layout(lastSW, lastSH); }
  const cx = c => BX + c*C, cy = r => BY + r*C;
  const slotXY = (z, s) => LN[z] ? LN[z].slots[s] : [0, 0];
  const isFront = (z, s) => LN[z] ? LN[z].front[s] : true;
  const UOFF = [[[0, -.04]], [[-.21, 0], [.21, 0]], [[0, -.2], [-.22, .13], [.22, .13]]];

  /* ---------- 그림 ---------- */
  /* 🧠 크게 보기로 맵 그림이 너무 커지면(태블릿) 그림판 해상도를 줄여요 — 메모리·렉 방지 (최대 600만 점) */
  const LK = () => { const k = NG.k || 1, a = COLS*C*ROWS*C*k*k; return a > 6e6 ? k*Math.sqrt(6e6/a) : k; };
  function buildLayer(){
    const key = `${th().n}|${W}|${H}|${C}|${N}|${MAPI}`; if (key === layerKey && layer) return; layerKey = key;
    const k = LK(); layer = layer || document.createElement("canvas"); layer.width = Math.ceil(COLS*C*k); layer.height = Math.ceil(ROWS*C*k);
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
      /* 🏡 친구마다 4×4 마당: 그림자 → 잔디 판 → 나무 울타리 → 이름표 (같이 하면 친구 색) */
      LN.forEach((Lz, zz) => { const c = N > 1 ? RD_PC[zz] : "#ffd43b", x = Lz.ox*C - C*.04, y = Lz.oy*C - C*.04, w = Lz.w*C + C*.08, h = Lz.h*C + C*.08;
        t.fillStyle = "rgba(0,0,0,.25)"; rrect(t, x + 3, y + 7, w, h, C*.32); t.fill();
        t.fillStyle = BSA.lg(t, 0, y, 0, y + h, [[0, TP.top[0]], [1, TP.top[1]]]); rrect(t, x, y, w, h, C*.32); t.fill();
        t.globalAlpha = .2; t.fillStyle = c; rrect(t, x, y, w, h, C*.32); t.fill(); t.globalAlpha = 1;
        t.strokeStyle = "#7b4a1e"; t.lineWidth = Math.max(4, C*.09); rrect(t, x, y, w, h, C*.32); t.stroke();
        t.strokeStyle = "#c58b4a"; t.lineWidth = Math.max(2, C*.045); rrect(t, x, y, w, h, C*.32); t.stroke();
        for (let k = 0; k <= 4; k++) [[x + w*k/4, y], [x + w*k/4, y + h], [x, y + h*k/4], [x + w, y + h*k/4]].forEach(([px, py]) => { t.fillStyle = "#5c3612"; t.beginPath(); t.arc(px, py, C*.07, 0, 7); t.fill(); t.fillStyle = "#e0a96d"; t.beginPath(); t.arc(px - C*.015, py - C*.015, C*.035, 0, 7); t.fill(); });
        t.globalAlpha = .9; t.strokeStyle = c; t.lineWidth = 2.5; t.setLineDash([C*.16, C*.1]); rrect(t, x + C*.1, y + C*.1, w - C*.2, h - C*.2, C*.24); t.stroke(); t.setLineDash([]); t.globalAlpha = 1;
        if (N > 1){ const nm = `${zz + 1}P ${nameOf(noOf_(SIDS[zz]))}`, fs = Math.max(11, Math.round(C*.27)), tw = rdMeasure(nm, fs) + fs; t.font = `${fs}px "Jua",sans-serif`;
          const tx = x + w/2 - tw/2, ty = y - fs*.75; t.fillStyle = "rgba(0,0,0,.3)"; rrect(t, tx + 2, ty + 3, tw, fs*1.5, fs*.7); t.fill(); t.fillStyle = c; rrect(t, tx, ty, tw, fs*1.5, fs*.7); t.fill();
          t.strokeStyle = "rgba(255,255,255,.8)"; t.lineWidth = 2; t.stroke(); t.fillStyle = "#1a1b3a"; t.textAlign = "center"; t.textBaseline = "middle"; t.fillText(nm, x + w/2, ty + fs*.78); } });
      /* 🪨 동물 자리: 입체 받침돌 (앞줄 ⚔️ 따뜻한 테두리 · 뒷줄 🏹 시원한 테두리) */
      /* 🌍 (2026.11.18) 칸마다 땅 색: 🌳 육지 초록 · 🌊 바다 파랑 · ☁️ 하늘 보라 (테두리: ⚔️ 앞줄 빨강 · 🏹 뒷줄 흰색) */
      const TC = {l: ["#d3f9d8", "#69db7c", "#2b8a3e"], s: ["#d0ebff", "#4dabf7", "#1864ab"], a: ["#f8f0fc", "#d0bfff", "#7048e8"]};
      L.map.slots.forEach(([sx, sy], s) => { const [x, y] = cell(sx, sy), fr = L.front[s], tr = TERR(Math.floor(s/ZS), s % ZS), tc = TC[tr];
        t.fillStyle = "rgba(0,0,0,.22)"; rrect(t, x + C*.08, y + C*.2, C*.86, C*.8, C*.22); t.fill();
        t.fillStyle = tc[2]; rrect(t, x + C*.06, y + C*.14, C*.88, C*.8, C*.22); t.fill();
        t.fillStyle = BSA.lg(t, 0, y + C*.03, 0, y + C*.83, [[0, TP.slot[0]], [1, TP.slot[1]]]); rrect(t, x + C*.06, y + C*.03, C*.88, C*.8, C*.22); t.fill();
        t.globalAlpha = .72; t.fillStyle = BSA.lg(t, 0, y + C*.03, 0, y + C*.83, [[0, tc[0]], [1, tc[1]]]); rrect(t, x + C*.06, y + C*.03, C*.88, C*.8, C*.22); t.fill(); t.globalAlpha = 1;
        if (tr === "s"){ t.strokeStyle = "rgba(255,255,255,.45)"; t.lineWidth = 2; for (let w0 = 0; w0 < 2; w0++){ const yy = y + C*(.3 + w0*.28); t.beginPath(); for (let k0 = 0; k0 <= 6; k0++){ const xx = x + C*(.16 + k0*.115); k0 ? t.lineTo(xx, yy + (k0 % 2 ? -C*.04 : C*.04)) : t.moveTo(xx, yy); } t.stroke(); } }
        t.strokeStyle = fr ? "rgba(255,120,120,.95)" : "rgba(255,255,255,.85)"; t.lineWidth = fr ? 3 : 2.5; rrect(t, x + C*.08, y + C*.05, C*.84, C*.76, C*.2); t.stroke();
        t.strokeStyle = "rgba(255,255,255,.6)"; t.lineWidth = 2; t.beginPath(); t.moveTo(x + C*.24, y + C*.07); t.lineTo(x + C*.76, y + C*.07); t.stroke();
        t.globalAlpha = .42; G2.emo(t, RD_HBI[tr].e, x + C*.5, y + C*.45, C*.4); t.globalAlpha = .5; G2.emo(t, fr ? "⚔️" : "🏹", x + C*.2, y + C*.2, C*.18); t.globalAlpha = 1; });
      /* 🏡 지켜야 하는 동물 마을 · 👾 몬스터 문 */
      if (L.map.house){ const [x, y] = cell(L.map.house[0], L.map.house[1]); RDA.house(t, x + C*.5, y + C*.55, C*1.0, ti); }
      /* 🌀 몬스터 문: 친구 마당마다 하나씩 (같은 색 고리) */
      (SH.doors || [0]).slice(0, 1).forEach((di, zz) => { const a = P[di % P.length]; if (!a) return; if (N > 1){ t.globalAlpha = .85; t.strokeStyle = "#ff6b6b"; t.lineWidth = Math.max(3, C*.08); t.beginPath(); t.ellipse(a[0], a[1] + C*.22, C*.46, C*.2, 0, 0, 7); t.stroke(); t.globalAlpha = 1; } RDA.portal(t, a[0], a[1], C*.8); });
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
  const colSpr = (c, m) => sp("col" + c + m, 24, 128, t => { const gr = t.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(m, c); gr.addColorStop(1, "#fff"); t.fillStyle = gr; t.fillRect(0, 0, 24, 128); });
  const ringSpr = c => sp("ring" + c, 96, 96, t => { t.strokeStyle = c; t.lineWidth = 5; t.beginPath(); t.arc(48, 48, 44, 0, 7); t.stroke(); t.globalAlpha = .25; t.fillStyle = c; t.fill(); });
  /* 그림 글자 + 숫자를 한 장으로 (테두리 글씨에 그림 글자가 섞이면 숫자가 깨지는 기기가 있어요) */
  /* ⚡ (2026.11.18) 같은 글씨는 크기 재기부터 건너뛰어요 (예전엔 매 장면 40번씩 글자 폭을 쟀어요) */
  function lbl(parts, fs, col = "#fff"){ const key = parts.join("¦") + fs + col; { const c0 = G2.cache.get("rdlb" + key); if (c0 && (NG.k || 1) === G2.ck){ c0._u = NG.frame; return c0; } } const ws = parts.map(p => /^\p{Extended_Pictographic}/u.test(p) ? fs*1.2 : rdMeasure(p, fs) + 6), w = ws.reduce((a, b) => a + b, 0) + 6, h = fs + 12;
    return sp("lb" + key, w, h, t => { let x = 3; parts.forEach((p, i) => { if (/^\p{Extended_Pictographic}/u.test(p)) G2.emo(t, p, x + fs*.6, h/2, fs); else outlinedRaw(t, p, x + 3, h/2 + 1, fs, col, undefined, "left"); x += ws[i]; }); }); }
  /* ⚡ 조각 글씨 (2026.11.18): 👾 몬스터 수 · 💰 금 · 🤝 다 같이 · 미션 진행처럼 숫자가 쉴 새 없이 바뀌는 글씨는
     숫자 한 글자·글 조각을 한 번씩만 그려 두고 이어 붙여요 → 숫자가 바뀔 때마다 새 그림(글자 테두리)을 만들던 버벅임이 없어요
     (4배속에서 이런 그림이 1초에 수십 장 새로 만들어져서 태블릿에서 한 장에 10ms 넘게 멈칫했어요) */
  const DLW = new Map();
  const dlW = (p, fs) => { const k = p + "|" + fs; let w = DLW.get(k); if (w == null){ RD_MC.font = `${fs}px "Jua",sans-serif`; w = RD_MC.measureText(p).width; DLW.set(k, w); } return w; };
  function dlbl(parts, fs, col = "#fff", chars){ const h = fs + 12, pad = Math.max(4, fs*.18), items = []; let x = 3;
    parts.forEach(p => { if (!p) return;
      if (/^\p{Extended_Pictographic}/u.test(p)){ items.push([sp(`dle${p}${fs}`, fs*1.2, h, t => G2.emo(t, p, fs*.6, h/2, fs)), x]); x += fs*1.2; return; }
      x += 3; (chars ? Array.from(p) : p.split(/(\d)/)).filter(Boolean).forEach(ch => { if (ch === " "){ x += dlW(" ", fs); return; } const w = dlW(ch, fs); items.push([sp(`dlt${ch}${fs}${col}`, w + pad + 2, h, t => outlinedRaw(t, ch, pad/2 + 1, h/2 + 1, fs, col, undefined, "left")), x - pad/2 - 1]); x += w; }); x += 3; });
    return {dyn: 1, w: x + 3, h, draw(g, x0, y0){ const k = NG.k || 1; for (const [c, ox] of items) g.drawImage(c, Math.round((x0 + ox)*k)/k, Math.round(y0*k)/k, c.w, c.h); }}; }
  /* ⚡ 반짝 글씨(스킬 외침·뽑기·+금): 처음 보는 글씨는 이번 장면엔 글자 조각으로 이어 붙이고, 한 장짜리 그림은 쉴 때 만들어 둬요
     → 4배속에서 새 스킬 이름이 처음 뜰 때마다 멈칫하던 것(한 장에 5~10ms)을 없애요 */
  const FXQ = new Set();
  function lblFX(parts, fs, col){ const key = parts.join("¦") + fs + col, c0 = G2.cache.get("rdlb" + key); if (c0 && (NG.k || 1) === G2.ck){ c0._u = NG.frame; return c0; }
    if (!FXQ.has(key)){ FXQ.add(key); (window.requestIdleCallback || setTimeout)(() => { FXQ.delete(key); if (NG.cur === self) lbl(parts, fs, col); }, {timeout: 1500}); }
    return dlbl(parts, fs, col, true); }
  function btnSpr(w, h, c1, c2, parts, fs, off){ return sp(`bt${w}${h}${c1}${parts.join("¦")}${fs}${off ? 1 : 0}`, w, h + 6, t => {
    t.fillStyle = "rgba(0,0,0,.35)"; rrect(t, 0, 6, w, h, 16); t.fill();
    t.fillStyle = off ? "#495057" : BSA.lg(t, 0, 0, 0, h, [[0, c1], [1, c2]]); rrect(t, 0, 0, w, h, 16); t.fill();
    t.strokeStyle = "rgba(255,255,255,.55)"; t.lineWidth = 3; t.stroke(); t.fillStyle = "rgba(255,255,255,.22)"; rrect(t, 6, 4, w - 12, h*.32, 10); t.fill();
    const l = lbl(parts, fs); t.globalAlpha = off ? .6 : 1; t.drawImage(l, w/2 - l.w/2, h/2 - l.h/2, l.w, l.h); }); }

  /* ---------- 시작 · 단계 ---------- */
  function mkZone(){ return {s: Array.from({length: ZS}, () => ({k: null, n: 0, cd: [0, 0, 0], hit: 0})), gold: 60, gems: 0, up: [0, 0, 0, 0], sum: 0, ack: 0, rel: {}, it: ["bomb"], pick: null, clv: 0, fev: 0, tr: [], trT: 30, trV: 0, rrn: 0}; }
  /* 🎯 단계 미션: 보스가 아닌 단계마다 하나 */
  function newMission(){
    if (wave % 10 === 0){ MS = null; return; }
    const pool = ["keep", "gold", "chest", "merge", "sum", "kill", "mk", "mk"].filter(k => !(k === "merge" && wave < 3) && !(k === "mk" && wave < 4));
    const k = pool[Math.floor(R.f()*pool.length)];
    /* 🧪 (2026.11.18) 머리 쓰기 미션: 정해진 동물을 조합으로 만들기 — 단계가 오를수록 더 높은 등급 */
    if (k === "mk"){ const gm = wave < 15 ? 2 : wave < 60 ? 3 : wave < 150 ? 4 : wave < 300 ? 5 : 6, L = RD_RCK.filter(t => RD_A[t].g <= gm && RD_A[t].g >= Math.max(2, gm - 1));
      MS = {k, n: 1, p: 0, st: 0, x: L[Math.floor(R.f()*L.length)]}; return; }
    const n = k === "keep" ? Math.max(12, Math.round(LIMIT*.25)) : k === "merge" ? 1 + (wave > 25 ? 1 : 0) : k === "sum" ? 6 + Math.floor(R.f()*4) : k === "kill" ? Math.round(25*(1 + .6*(N - 1))) : 1;
    MS = {k, n, p: 0, st: 0};   // st: 0 진행 · 1 성공 · 2 실패
    if (k === "gold") spawn(3, wave % N); if (k === "chest") spawn(4, wave % N);
  }
  function msWin(quiet){ if (!MS || MS.st) return; MS.st = 1; const its = Z.map((p, z) => { const it = rndItem(); giveItem(z, it); return it; }); if (quiet){ sfx("big"); return; }
    banner = {t: "🎯 미션 성공!", s: `🎒 ${local.map(z => RD_IT[its[z]].e + RD_IT[its[z]].n).join(" · ")} 받았어요`, k: 110, c: "#69db7c"}; sfx("big");
    if (party === "host") NQ.push(["b", banner.t, "🎒 아이템을 받았어요!", banner.k, banner.c]); }
  function msFail(why){ if (!MS || MS.st) return; MS.st = 2; if (why){ banner = {t: why, s: "괜찮아요, 다음 미션!", k: 90, c: "#ffa94d"}; if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]); } }
  const msTick = k => { if (MS && !MS.st && MS.k === k){ MS.p++; if (MS.p >= MS.n) msWin(); } };
  let DMGZ = [], teamK = 0;
  function startWave(){ DMGZ = Z ? Z.map(() => 0) : []; teamK = 0;
    let msOk = false; if (MS && !MS.st){ if (MS.k === "keep" && E.length <= MS.n){ msWin(true); msOk = true; } else msFail(); }
    if (wave >= 1) Z.forEach((p, z) => { const sl = RL(z, "slot"); if (!sl) return;   // 🎰 행운 룰렛
      const r = R.f(); if (r < .35) { const v = Math.round((20 + wave*4)*gmul()*sl); p.gold += v; toastZ(z, `🎰 룰렛: 💰 +${rdN(v)}!`); } else if (r < .52){ p.gems += sl; toastZ(z, `🎰 룰렛: 💎 +${sl}!`); } else if (r < .8){ const it = rndItem(); if (giveItem(z, it)) toastZ(z, `🎰 룰렛: ${RD_IT[it].e} ${RD_IT[it].n}!`); } else toastZ(z, "🎰 룰렛: 꽝! 😅 다음엔 꼭"); });
    wave++; const boss = wave % 10 === 0, mini = !boss && wave % 5 === 0;
    Z.forEach((p, z) => { const d = RL(z, "drum"); if (d) p.s.forEach(q => { if (q.k && RD_A[q.k].sk) q.mp = Math.max(q.mp || 0, RD_A[q.k].sk.mp*Math.min(.9, .5*d)); });   // 🥁 기합 북
      const sn = RL(z, "snack"); if (sn && wave > 1 && (wave - 1) % (sn >= 2 ? 3 : 5) === 0){ const it = rndItem(); if (giveItem(z, it)) toastZ(z, `🍱 간식 도시락: ${RD_IT[it].e} ${RD_IT[it].n}!`); } });
    waveT = boss ? 75*60 : 20*60;   // 😊 (2026.11.19) 보스 시간 60→75초
    spawnLeft = boss ? 0 : Math.round((30 + Math.min(14, wave*.3))*(1 + .6*(N - 1))); spawnT = 0; spawnI = N === 1 ? 28 : Math.max(6, Math.floor(waveT*.8/Math.max(1, spawnLeft)));
    if (wave > 1) Z.forEach((p, z) => { p.gold += (8 + Math.floor(wave*1.2))*gmul(); const b = RL(z, "bank"); if (b) p.gold += 30*b + Math.min(60*b, Math.floor(p.gold*.05*b)); });
    if (boss){ waveT += 15*60*Z.reduce((a, p, z) => a + RL(z, "sand"), 0); spawn(2); bossTimer = waveT; calcLimit(); banner = wave === RD_END ? {t: "🏆 1000단계 마지막 보스!", s: "모두 힘을 모아요! 잡으면 정복!", k: 200, c: "#fde047"} : wave % 100 === 0 ? {t: `🌀 ${dimOf(wave)}차원 대왕 보스!`, s: "아주 튼튼해요 · 잡으면 💎 보석 듬뿍!", k: 170, c: "#e599f7"} : {t: `👑 ${wave}단계 보스!`, s: "60초 안에 꼭 잡아요!", k: 150, c: "#ff6b6b"}; sfx("boss"); }
    else { if (mini) spawn(1); banner = {t: `🏁 ${wave}단계`, s: wave % 100 === 1 && wave > 1 ? `🌀 ${dimOf(wave)}차원 돌입! 몬스터가 더 세져요` : wave % 10 === 1 ? `${th().n}에 왔어요! ${REG() === "*" ? "모든 동물 +15%" : `${RD_HBI[REG()].e} ${RD_HBI[REG()].n} 동물 +30%`}` : mini ? "😈 중간 보스가 섞여 있어요" : "", k: wave % 100 === 1 && wave > 1 ? 170 : 110, c: wave % 100 === 1 && wave > 1 ? "#e599f7" : undefined}; sfx("wave"); }
    remap(); if (wave % 10 === 1){ layerKey = ""; setSky(); }
    newMission(); if (MS && !banner.s) banner.s = `${RD_MS[MS.k].e} 미션: ${RD_MS[MS.k].t(MS.n, MS.x)}`;
    if (msOk) banner.s = "🎯 지난 미션 성공! 🎒 아이템을 받았어요";
    if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c || ""]);
  }
  /* 몬스터: 0 슬라임 · 1 😈 중간 보스 · 2 👑 보스 · 3 🟡 황금 슬라임(빨라요, 놓치면 도망) · 4 🎁 보물상자(느리고 단단) */
  const KSPD = kind => (kind === 2 ? 1.15 : kind === 1 ? 1.55 : kind === 3 ? 3.4 : kind === 4 ? .9 : 2.05 + Math.min(.6, wave*.012))/60;
  /* 같이 하기(SH)는 문 하나에서 모두 나와요 (보스는 한 마리, 대신 사람 수만큼 튼튼) */
  let laneRR = 0, bossRR = 0, netT = 0, spawnI = 28, crOpen = false, crF = "ok", crZ = 0, crR = "", crD = "", crSel = null, crPick = [], crDest = -1, crMode = "", crCur = 0, crMore = false, grab = null, kHint = (() => { try { return matchMedia("(pointer:fine)").matches; } catch(e){ return false; } })();
  function spawn(kind, l){ let one = 1;
    /* 🌀 문이 사람 수만큼: 몬스터는 친구마다 자기 마당 앞 문에서 번갈아 나와요 → 모두가 함께 때려요 · 보스는 한 마리(대신 다 같이 튼튼), 나오는 문은 돌아가며 */
    if (kind === 1 || kind === 2){ one = N; l = bossRR++ % N; } else if (l == null) l = laneRR++ % N;
    if (kind === 2 && wave >= 20 && !TTS.has(99)){ TTS.add(99); banner = {t: "🛡️ 단단한 보스 등장!", s: "받는 피해 -50% → 🛡️ 서포터가 먼저 때리면 💥 약점이 드러나 모두 +40%!", k: 220, c: "#63e6be"}; if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]); }
    const h = one*hpAt(wave)*(kind === 2 ? 14*(1 + .5*(N - 1))/N*(wave === RD_END ? 5 : wave % 100 === 0 ? 2.5 : 1) : kind === 1 ? 8*(1 + .3*(N - 1))/N : kind === 3 ? 5 : kind === 4 ? 16 : NRM)/(kind ? 1 + .25*(N - 1) : 1);
    /* 몬스터 특성 (단계가 오를수록): 🛡️ 단단함(원거리 반감) · 🦇 날개(근거리 못 닿음) · 👻 유령(지원이 잘 잡음) · 🔰 방패(처음 몇 번 막음) → 역할을 섞어 배치해야 해요 */
    let tt = 0; if (kind === 0 && wave >= 12){ const r = R.f(); tt = r < .16 ? 1 : wave >= 20 && r < .3 ? 2 : wave >= 35 && r < .4 ? 3 : wave >= 50 && r < .47 ? 4 : wave >= 100 && r < .55 ? 5 : wave >= 150 && r < .62 ? 6 : 0;
      if (tt && !TTS.has(tt)){ TTS.add(tt); banner = {t: RD_TT[tt].t, s: RD_TT[tt].s, k: 200, c: "#ffd43b"}; if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]); } }
    /* 🤝 (2026.11.17) 같이 할 때 몬스터 문은 하나! 모든 몬스터가 한 문에서 나와 친구들 마당을 차례로 지나가요 → 내 몬스터·친구 몬스터 없이 다 같이 잡아요 */
    const d0 = (SH && SH.doors && SH.doors[0]) || 0, p0 = posAt(d0, l); E.push({id: ++eid, kind, l, d: d0, tr: 0, hp: h*(tt === 1 ? 1.3 : tt === 6 ? .75 : 1), mhp: h*(tt === 1 ? 1.3 : tt === 6 ? .75 : 1), spd: KSPD(kind)*(tt === 2 ? 1.25 : tt === 6 ? 1.7 : 1), slT: 0, slF: 0, stT: 0, x: p0[0], y: p0[1], f: R.f()*60|0, tt, sh: tt === 4 ? 3 + Math.floor(wave/25) : 0}); }
  const TTS = new Set();
  function setSky(){ const cv = $("#ngCanvas"); skyB = BX + "," + BY + "," + C; cv.style.backgroundImage = (bgURL ? `url(${bgURL}),` : "") + th().sky; cv.style.backgroundColor = "#1c1d52";
    if (bgURL){ cv.style.backgroundSize = `${COLS*C/W*100}% ${ROWS*C/H*100}%, 100% 100%`; cv.style.backgroundPosition = `${Math.abs(W - COLS*C) > .5 ? BX/(W - COLS*C)*100 : 0}% ${Math.abs(H - ROWS*C) > .5 ? BY/(H - ROWS*C)*100 : 0}%, 0 0`; cv.style.backgroundRepeat = "no-repeat"; } else { cv.style.backgroundSize = ""; cv.style.backgroundPosition = ""; } }
  /* ⚡ 판 그림은 CSS 배경으로 (매 장면 붙이지 않아요) — 준비되기 전에는 캔버스에 붙여요 */
  let bgURL = null, bgKey = "", skyB = "";
  function boardBG(){ if (bgKey === layerKey) return; bgKey = layerKey; const key = layerKey; bgURL = null; setSky();
    try { layer.toBlob(bl => { if (!bl || key !== layerKey || NG.cur !== self) return; if (RD_BG.url) URL.revokeObjectURL(RD_BG.url); RD_BG.url = bgURL = URL.createObjectURL(bl); setSky(); }, "image/png"); } catch(e) {} }

  /* ---------- 동물 뽑기 · 합치기 · 팔기 · 옮기기 · 강화 · 행운 ---------- */
  function placeK(z, k, pref, force){ const S = Z[z].s; let i = force && pref != null && S[pref] && (!S[pref].k || (S[pref].k === k && S[pref].n < 3)) ? pref : S.findIndex(q => q.k === k && q.n < 3); if (i < 0 && pref != null && !S[pref].k) i = pref; if (i < 0) i = S.findIndex(q => !q.k); if (i < 0) return -1;
    const q = S[i]; if (isMine(z)) RDB.see(k); if (!q.k){ q.k = k; q.n = 0; } q.cd[q.n] = 10 + q.n*7; q.n++; q.hit = 12; gv++; return i; }
  function pick(g){ const L = RD_BY[g]; return L[Math.floor(R.f()*L.length)]; }
  /* 🔀 같은 곳 동물 3마리를 합치면 같은 곳(🌳🌊☁️) 동물이 나와요 */
  function pickH(g, h){ const L = RD_BY[g].filter(k => RD_A[k].hb === h); return L.length ? L[Math.floor(R.f()*L.length)] : pick(g); }
  /* =====================================================================
     📥 대기 줄 (2026.11.18) — 뽑기 대신! 1초마다 랜덤 동물이 한 마리씩 와요 (5칸 · 꽉 차면 가장 오래 기다린 동물이 떠나요)
     · 눌러서 데려오면 공짜 → 어떤 동물을 데려올지 '고르는' 게임 (덱 짜기)
     · 단계가 오를수록 높은 등급이 와요: 처음엔 ⚪ 일반 · 30단계쯤 🟡 전설 · 100단계쯤 🌈 신화 · 200단계쯤 💠 초월
     · 🔄 새 줄: 금을 내고 5마리를 모두 새로 (단계마다 조금씩 비싸져요)
     ===================================================================== */
  const TRN = 5, TRF = 60;
  function trayW(z, w){ const d = z == null ? 0 : RL(z, "dice"), lk = z == null ? 0 : (PK(z).luck || 0); return rdTrayW(w == null ? wave : w, (1 + .35*d)*(1 + .05*lk)); }
  function trayRoll(z){ const W0 = trayW(z), tot = W0.reduce((a, b) => a + b, 0); let r = R.f()*tot, g = 0; for (; g < W0.length - 1; g++) if ((r -= W0[g]) < 0) break;
    const p = Z[z]; if (p.minG && R.f() < .35) g = Math.max(g, p.minG); if (p.clv > 0){ p.clv--; g = Math.max(1, g); } return pick(g); }
  const trOld = p => { if (!p.tr || p.tr.length < TRN || p.tr.some(o => !o)) return -1; let j = 0; p.tr.forEach((o, i) => { if (o.t < p.tr[j].t) j = i; }); return j; };
  function trayTick(){ for (const p of Z){ if (!p.tr) p.tr = []; if (--p.trT > 0) continue; p.trT = TRF; const z = Z.indexOf(p);
    let j = -1; for (let i = 0; i < TRN; i++) if (!p.tr[i]){ j = i; break; } if (j < 0) j = trOld(p);
    p.tr[j] = {k: trayRoll(z), t: frame}; p.trV = (p.trV || 0) + 1; } }
  const trS = p => (p.tr || []).slice(0, TRN).map(o => o ? o.k : "").join(",");
  /* ⌨️ Space: 대기 줄에서 가장 좋은 동물 (높은 등급 → 내 땅에 맞는 동물 → 같은 동물이 있는 칸) */
  function bestTk(z){ const p = Z[z], S = p.s; let b = -1, bs = -1e9; (p.tr || []).forEach((o, i) => { if (!o) return; const A = RD_A[o.k];
    const sc = A.g*10 + (S.some((q, j) => !q.k && TERR(z, j) === A.hb) ? 4 : 0) + (S.some(q => q.k === o.k && q.n < 3) ? 3 : 0) - (o.t > -1e8 ? 0 : 0); if (sc > bs){ bs = sc; b = i; } }); return b; }
  const rrCost = z => Math.round((15 + Math.min(wave, 80)*2)*gmul()*(1 - .25*RL(z, "cheap"))*(1 - .35*RL(z, "rainbow")));
  /* 🌍 칸마다 땅 (🌳 육지 · 🌊 바다 · ☁️ 하늘)
     · 혼자: 안쪽(🏹 뒷줄) = ☁️ 하늘, 길 옆(⚔️ 앞줄)은 위쪽 🌳 육지 · 아래쪽 🌊 바다
     · 둘이: 1P 마당 = 🌳 육지 · 2P 마당 = 반은 ☁️ 하늘, 반은 🌊 바다
     · 셋 이상: 친구마다 마당 하나가 한 땅 (1P 🌳 · 2P 🌊 · 3P ☁️ …) → 서로 다른 동물이 필요해서 🎁 주고받으며 이야기해요 */
  let TE = [];
  function calcTerr(){ TE = LN.map((L, z) => { const n = L.slots.length;
    if (N === 1){ const fr = L.slots.map((_, i) => i).filter(i => L.front[i]), nl = Math.ceil(fr.length*.6); return L.slots.map((_, i) => !L.front[i] ? "a" : fr.indexOf(i) < nl ? "l" : "s"); }
    if (N === 2) return L.slots.map((_, i) => z === 0 ? "l" : i < n/2 ? "a" : "s");
    return L.slots.map(() => ["l", "s", "a"][z % 3]); }); }
  const TERR = (z, i) => (TE[z] && TE[z][i]) || "l";
  const yardH = z => [...new Set(TE[z] || [])];
  const thI = () => Math.floor((Math.max(1, wave) - 1)/10) % 10;
  const REG = () => RD_REG[thI()];
  /* 새 동물 자리: 같은 동물 칸(3마리 아래) → 자기 땅 빈칸(근거리는 길 옆, 원거리는 안쪽이면 더 좋아요) → 아무 빈칸 */
  function placeH(z, k){ const S = Z[z].s, A = RD_A[k]; let i = S.findIndex((q, j) => q.k === k && q.n < 3 && TERR(z, j) === A.hb); if (i < 0) i = S.findIndex(q => q.k === k && q.n < 3); if (i >= 0) return placeK(z, k, i, true);
    let best = -1, bs = -1; S.forEach((q, j) => { if (q.k) return; const sc = (TERR(z, j) === A.hb ? 4 : 0) + (A.ro === "m" ? (isFront(z, j) ? 2 : 0) : A.ro === "r" ? (isFront(z, j) ? 0 : 1) : 0); if (sc > bs){ bs = sc; best = j; } });
    return best < 0 ? -1 : placeK(z, k, best, true); }
  function doAct(z, a){
    const p = Z[z]; if (!p) return;
    if (a[0] === "emo"){ emote(z, a[1] | 0, a[2]/100, a[3]/100); return; }
    if (a[0] === "spd"){ speed = speed === 1 ? 2 : speed === 2 ? 4 : 1;
      if (N > 1){ banner = {t: `⏩ 속도 ×${speed}`, s: `${nameOf(noOf_(SIDS[z]))}${speed === 1 ? "이(가) 보통 빠르기로" : "이(가) 빠르게"} 바꿨어요`, k: 60, c: speed === 4 ? "#ff8787" : "#ffd43b"}; if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]); }
      return; }
    if (state !== "play") return;
    const S = p.s, ty = a[0];
    if (ty === "tk"){ let j = a[1] | 0; const want = a[2];   // 📥 대기 줄에서 데려오기 (보낸 동물 이름으로 확인 → 그 사이 줄이 바뀌어도 맞는 동물을)
      if (!p.tr || !p.tr[j] || (want && p.tr[j].k !== want)){ j = p.tr ? p.tr.findIndex(o => o && (!want || o.k === want)) : -1; if (j < 0){ toastZ(z, "💨 놓쳤어요! 다음 동물을 기다려요"); return; } }
      const k = p.tr[j].k, i = placeH(z, k); if (i < 0){ toastZ(z, N > 1 ? "🈵 자리가 꽉 찼어요! 합치기·팔기·🎁 친구에게" : "🈵 자리가 꽉 찼어요! 합치거나 팔아요"); return; }
      p.tr[j] = null; p.trV = (p.trV || 0) + 1; p.sum++; msTick("sum"); const g = RD_A[k].g; sfx(g >= 2 ? "big" : "sum", z); popAt(z, i, `${RD_A[k].e} ${RD_A[k].n}${g ? "!" : ""}`, RD_G[g].c);
      if (RL(z, "twin") && R.f() < .12*RL(z, "twin")){ const i2 = placeH(z, k); if (i2 >= 0){ popAt(z, i2, `👯 쌍둥이 ${RD_A[k].e}!`, "#ffd43b"); fxRing(z, i2, "#ffd43b"); sfx("big", z); } }
      if (RD_A[k].hb !== TERR(z, i)) toastZ(z, `${RD_HBI[RD_A[k].hb].e} ${RD_HBI[RD_A[k].hb].n} 동물이에요 → ${RD_HBI[RD_A[k].hb].e} 칸으로 옮기면 더 세져요${N > 1 && !yardH(z).includes(RD_A[k].hb) ? " · 🎁 친구에게 줘도 좋아요" : ""}`); }
    else if (ty === "rr"){ const c = rrCost(z); if (p.gold < c){ toastZ(z, `💰 금이 모자라요 (🔄 새 줄 ${rdN(c)})`); return; }
      p.gold -= c; p.rrn = (p.rrn || 0) + 1; for (let i = 0; i < TRN; i++) p.tr[i] = {k: trayRoll(z), t: frame - TRN + i}; p.trT = TRF; p.trV = (p.trV || 0) + 1; sfx("sum", z); }
    else if (ty === "give"){ const i = a[1] | 0, z2 = a[2] | 0, q = S[i]; if (!q || !q.k || z2 === z || !Z[z2]) return;   // 🎁 친구에게 한 마리 보내기
      const k = q.k, j = placeH(z2, k); if (j < 0){ toastZ(z, "🈵 친구 마당이 꽉 찼어요"); return; }
      q.n--; if (!q.n){ q.k = null; q.cd = [0, 0, 0]; q.mp = 0; } gv++; sfx("sum", z); sfx("big", z2); const nm = nameOf(noOf_(SIDS[z])), nm2 = nameOf(noOf_(SIDS[z2]));
      popAt(z2, j, `🎁 ${RD_A[k].e} ${RD_A[k].n}`, RD_PC[z]); toastZ(z2, `🎁 ${nm}이(가) ${RD_A[k].e} ${RD_A[k].n}을(를) 보냈어요!`); toastZ(z, `🎁 ${RD_A[k].e} ${RD_A[k].n} → ${nm2}에게 보냈어요`); }
    else if (ty === "mrg"){ const i = a[1], q = S[i]; if (!q || q.n < 3) return; if (RD_A[q.k].g >= RD_MG){ toastZ(z, "🧪 영웅부터는 조합으로 올려요! (C 키 · 🧪 조합)"); return; } mergeAt(z, i); }
    else if (ty === "all"){ let n = 0; for (let loop = 0; loop < 40; loop++){ const i = S.findIndex(q => q.k && q.n >= 3 && RD_A[q.k].g < RD_MG); if (i < 0) break; mergeAt(z, i, true); n++; }
      if (!n) toastZ(z, "🔀 3마리 모인 동물이 없어요"); else sfx("merge", z); }
    else if (ty === "sel"){ const i = a[1], q = S[i]; if (!q || !q.k) return; const v = RD_G[RD_A[q.k].g].sell; q.n--; if (!q.n) q.k = null; p.gold += v; gv++; sfx("sell", z); popAt(z, i, `+${v}💰`, "#ffe066"); }
    else if (ty === "sela"){ const i = a[1], q = S[i]; if (!q || !q.k) return; const n = q.n, v = RD_G[RD_A[q.k].g].sell*n; q.n = 0; q.k = null; q.cd = [0, 0, 0]; q.mp = 0; p.gold += v; gv++; sfx("sell", z); popAt(z, i, `+${v}💰`, "#ffe066"); }
    else if (ty === "cr") craft(z, a[1], a[2], a[3]);
    else if (ty === "mov"){ const i = a[1], j = a[2]; if (i === j || !S[i] || !S[j]) return; const t = S[i]; S[i] = S[j]; S[j] = t; gv++; }
    else if (ty === "up"){ const g = a[1] | 0; if (g < 0 || g > 3) return; while (p.up.length < 4) p.up.push(0); const c = upCost(z, g); if (p.gold < c){ toastZ(z, "💰 금이 모자라요"); return; } p.gold -= c; p.up[g]++; sfx("up", z); toastZ(z, `⬆️ ${RD_UPN[g]} 공격력 Lv.${p.up[g]}!`); gv++; }
    else if (ty === "rel"){ if (p.pick) takeRel(z, a[1] | 0); }
    else if (ty === "it"){ const i = a[1] | 0, k = p.it[i]; if (!k) return; p.it.splice(i, 1); gv++; useItem(z, k); }
    else if (ty === "luck"){ const big = a[1] === 1, c = big ? 4 : 1; if (p.gems < c){ toastZ(z, "💎 보석이 모자라요 (보스를 잡으면 생겨요)"); return; }
      const r = R.f(), g = big ? (r < .25 ? 4 : 3) : (r < .1 ? 3 : r < .62 ? 2 : -1);
      if (g < 0){ p.gems -= c; sfx("fail", z); toastZ(z, "😅 꽝! 다음엔 꼭!"); return; }
      const k = pick(g), i = placeH(z, k); if (i < 0){ toastZ(z, "🈵 자리가 꽉 찼어요"); return; } p.gems -= c; sfx("big", z); popAt(z, i, `✨ ${RD_A[k].e} ${RD_A[k].n}!`, RD_G[g].c); }
  }
  function useItem(z, k){
    const T = RD_IT[k]; sfx("big", z);
    if (k === "bomb"){ E.forEach(e => { e.hp -= e.mhp*(e.kind === 2 ? .06 : e.kind === 1 ? .15 : .3); }); E.slice(0, 40).forEach(e => boom(e.x, e.y, 0)); }
    else if (k === "ice") E.forEach(e => { e.stT = Math.max(e.stT, e.kind === 2 ? 120 : 300); });
    else if (k === "clover") Z[z].clv += 3;
    else if (k === "gold") Z[z].gold += (40 + wave*5)*gmul();
    else if (k === "time") waveT += 15*60;
    else if (k === "fever") Z[z].fev = 15*60;
    else if (k === "wall"){ wallT = 30*60; calcLimit(); }
    else if (k === "honey") honT = 8*60;
    else if (k === "candy") Z[z].s.forEach(q => { if (q.k && RD_A[q.k].sk) q.mp = RD_A[q.k].sk.mp - .5; });
    else if (k === "broom"){ E.filter(e => e.kind !== 2 && e.kind !== 1).sort((a, b) => a.hp - b.hp).slice(0, 10).forEach(e => { e.hp = 0; boom(e.x, e.y, 0); }); }
    else if (k === "gems") Z[z].gems += 2;
    banner = {t: `${T.e} ${T.n}!`, s: T.d, k: 80, c: "#ffe066"}; if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]);
  }
  function mergeAt(z, i, quiet){ const S = Z[z].s, q = S[i]; let g = RD_A[q.k].g; const hb = RD_A[q.k].hb; q.k = null; q.n = 0; gv++; msTick("merge");
    if (g + 2 <= RD_MG && RL(z, "merge") && R.f() < .15*RL(z, "merge")){ g++; toastZ(z, "🔀 합치기 달인! 두 등급 껑충!"); }
    if (RL(z, "lucky") && R.f() < .25){ Z[z].gold += (60 + wave*3)*gmul(); toastZ(z, "🍀 행운의 합치기! 금 보너스"); }
    const k = pickH(g + 1, hb), j = placeK(z, k, i); if (!quiet) sfx(g + 1 >= 3 ? "big" : "merge", z); else if (g + 1 >= 3) sfx("big", z);
    popAt(z, j, `${RD_A[k].e} ${RD_A[k].n}${g + 1 >= 3 ? "!!" : "!"}`, RD_G[g + 1].c); fxRing(z, j, RD_G[g + 1].c);
    if (g + 1 >= 5){ banner = {t: `${RD_G[g + 1].n} 등급 탄생!`, s: `${RD_A[k].e} ${RD_A[k].n} — ${RD_A[k].sk ? RD_A[k].sk.n : RD_A[k].t}`, k: 120, c: RD_G[g + 1].c}; if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]); const [x, y] = slotXY(z, j); FX.push({nova: 1, x, y, t: 50, c: RD_G[g + 1].c}); } }
  /* 🧪 조합: 정해진 재료 동물로 원하는 동물을 골라 만들어요 (rdart.js RD_RC) */
  function haveOf(z){ const H = {}; Z[z].s.forEach(q => { if (q.k) H[q.k] = (H[q.k] || 0) + q.n; }); return H; }
  function canCraft(z, t, H){ const R0 = RD_RC[t]; if (!R0) return false; H = H || haveOf(z); return R0.every(([k, c]) => (H[k] || 0) >= c); }
  const crList = z => { const H = haveOf(z); return RD_RCK.filter(t => canCraft(z, t, H)); };
  const crCache = {};
  const crN = z => { const c = crCache[z]; if (c && c.v === gv) return c.n; const n = crList(z).length; crCache[z] = {v: gv, n}; return n; };
  /* 재료 고르기: picks = 재료로 쓸 칸 번호 목록(한 칸에서 여러 마리면 그 번호가 여러 번) */
  function autoPick(z, t, keep, noFill){ const S = Z[z].s, R0 = RD_RC[t]; if (!R0) return [];
    const use = {}, out = []; (keep || []).forEach(i => { const q = S[i], need = q && q.k && (R0.find(r => r[0] === q.k) || [])[1]; if (!need) return;
      const k = q.k, inK = out.filter(j => S[j].k === k).length, inI = out.filter(j => j === i).length; if (inK < need && inI < q.n) out.push(i); });
    if (noFill) return out;
    R0.forEach(([k, c]) => { let left = c - out.filter(j => S[j].k === k).length; const idx = S.map((q, i) => i).filter(i => S[i].k === k).sort((a, b) => S[a].n - S[b].n);
      for (const i of idx){ while (left > 0 && out.filter(j => j === i).length < S[i].n){ out.push(i); left--; } if (!left) break; } });
    return out; }
  const pickOK = (z, t, picks) => { const S = Z[z].s, R0 = RD_RC[t]; if (!R0 || !Array.isArray(picks)) return false;
    for (const [k, c] of R0) if (picks.filter(i => S[i] && S[i].k === k).length !== c) return false;
    const per = {}; for (const i of picks){ if (!S[i] || !S[i].k || !R0.some(r => r[0] === S[i].k)) return false; per[i] = (per[i] || 0) + 1; if (per[i] > S[i].n) return false; } return true; };
  /* 새 동물이 생길 칸 (고른 자리가 없으면: 같은 동물 칸 → 가장 높은 등급 재료 칸 → 빈 칸) */
  function destOf(z, t, picks, dest){ const S = Z[z].s, left = S.map((q, i) => ({k: q.k, n: q.n - picks.filter(j => j === i).length}));
    const fits = i => left[i] && (left[i].n <= 0 || (left[i].k === t && left[i].n < 3));
    if (dest != null && dest >= 0 && fits(dest)) return dest;
    let i = left.findIndex(q => q.k === t && q.n > 0 && q.n < 3); if (i >= 0) return i;
    let best = -1, bg = -1; picks.forEach(j => { const g = RD_A[S[j].k].g; if (left[j].n <= 0 && g > bg){ bg = g; best = j; } }); if (best >= 0) return best;
    return left.findIndex(q => q.n <= 0); }
  function craft(z, t, picks, dest){ const R0 = RD_RC[t], p = Z[z]; if (!R0 || !RD_A[t]) return;
    if (!canCraft(z, t)){ toastZ(z, `🧪 재료가 모자라요: ${R0.map(([k, c]) => RD_A[k].e + "×" + c).join(" ")}`); sfx("no", z); return; }
    if (!pickOK(z, t, picks)) picks = autoPick(z, t);
    const S = p.s, at = destOf(z, t, picks, dest);
    const usedK = picks.map(i => S[i].k);
    picks.forEach(i => { const q = S[i]; q.n--; if (q.n <= 0){ q.n = 0; q.k = null; q.cd = [0, 0, 0]; q.mp = 0; } });
    if (RL(z, "alchemy") && R.f() < .25*RL(z, "alchemy")){ const kb = usedK.sort((a, b) => RD_A[a].g - RD_A[b].g)[0], ib = placeK(z, kb); if (ib >= 0) setTimeout(() => popAt(z, ib, `⚗️ ${RD_A[kb].e} 돌려받았어요!`, "#63e6be"), 0); }
    const j = placeK(z, t, at >= 0 ? at : null, true); gv++; msTick("merge"); if (MS && MS.k === "mk" && MS.x === t) msTick("mk");
    const G = RD_A[t].g; sfx(G >= 3 ? "big" : "merge", z); popAt(z, j, `🧪 ${RD_A[t].e} ${RD_A[t].n}${G >= 3 ? "!!" : "!"}`, RD_G[G].c); fxRing(z, j, RD_G[G].c);
    if (G >= 4){ banner = {t: `🧪 ${RD_G[G].n} 조합 성공!`, s: `${RD_A[t].e} ${RD_A[t].n} — ${RD_A[t].sk ? RD_A[t].sk.n : RD_A[t].t}`, k: 120, c: RD_G[G].c}; if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]); if (j >= 0){ const [x, y] = slotXY(z, j); FX.push({nova: 1, x, y, t: 50, c: RD_G[G].c}); } } }
  /* ⬆️ 강화는 끝이 없어요: Lv25까지는 차근차근, 그 뒤로는 한 번 올릴 때마다 ×1.075 (값도 ×1.07씩) */
  /* ⬆️ (2026.11.18 대기 줄) 강화는 '가끔' 쓰는 큰 결심: 값이 레벨마다 ×1.15씩 비싸져요 → 금은 🔄 새 줄과 강화 중에 골라 써요 */
  const upCost = (z, g) => { const L = Z[z].up[g] || 0; return Math.round([60, 180, 480, 1100][g]*(L + 1)*Math.pow(1.15, Math.min(L, 40))*Math.pow(1.06, Math.max(0, L - 40))*(1 - .25*RL(z, "cheap"))); };
  const upTier = g => g < 2 ? 0 : g < 4 ? 1 : g < 5 ? 2 : 3;   // ⬆️ 강화 4갈래: 일반·희귀 / 영웅·전설 / 신화 / 초월 이상(초월·불멸·태초·창세·영원)
  const upMul = (z, g) => { const L = Z[z].up[upTier(g)] || 0; return (1 + .3*Math.min(25, L)*(g >= 5 ? 1.3 : 1))*Math.pow(1.075, Math.max(0, L - 25)); };
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
    habMap(B); SYN = SY; return B; };
  /* 🌍 땅 효과: 자기 땅 칸 ×1.35 (다른 땅 ×0.8) · 🗺️ 이 맵에서 센 곳 ×1.3 · 같은 곳 무리 3·6·9칸 (🌳 공격 · 🌊 느리게 · ☁️ 빠르고 멀리) */
  let HBS = null, HBR = null, HBL = null, HBC = [];
  function habMap(B){ HBS = Z.map(p => p.s.map(() => 1)); HBR = Z.map(p => p.s.map(() => 0)); HBL = Z.map(p => p.s.map(() => 0)); HBC = Z.map(() => ({l: 0, s: 0, a: 0}));
    const reg = REG();
    Z.forEach((p, z) => p.s.forEach((q, i) => { if (q.k && RD_A[q.k].hb === TERR(z, i)) HBC[z][RD_A[q.k].hb]++; }));
    Z.forEach((p, z) => p.s.forEach((q, i) => { if (!q.k) return; const h = RD_A[q.k].hb, ok = h === TERR(z, i), T = ok ? rdSetT(HBC[z][h]) : 0, S = RD_SET[h];
      let m = (ok ? 1.35 : .8)*(reg === "*" ? 1.15 : reg === h ? 1.3 : 1); if (S.d) m *= S.d[T];
      B[z][i] *= m; if (S.s) HBS[z][i] = S.s[T]; if (S.r) HBR[z][i] = S.r[T]; if (S.sl) HBL[z][i] = S.sl[T]; })); }
  let TEAM = 1;
  let SYN = null;
  let BUF = null, bufV = -1;
  const fxN = {t: 0, r: 0};   // ⚡ 한꺼번에 너무 많은 반짝이를 그리지 않게 세어요
  function attack(viz){
    fxN.t = FX.reduce((a, f) => a + (f.sm ? 1 : 0), 0); fxN.r = FX.reduce((a, f) => a + (f.k ? 1 : 0), 0);
    const bk = gv*16 + thI(); if (bufV !== bk){ BUF = buffMap(); bufV = bk; }
    for (let z = 0; z < Z.length; z++){ const p = Z[z];
      const pk = PK(z), rB = .5*RL(z, "rng"), crB = .1*RL(z, "crit") + .015*(pk.crit || 0), cdM0 = 1/((1 + .15*RL(z, "spd"))*(1 + .03*(pk.spd || 0)));
      for (let i = 0; i < ZS; i++){ const q = p.s[i]; if (!q.k) continue; const A = RD_A[q.k], [sx, sy] = slotXY(z, i), rr0 = A.r + rB + HBR[z][i], r2 = rr0*rr0, hl = HBL[z][i];
        const tb = tbAt(z, sx, sy), cdM = cdM0/tb.s/HBS[z][i], pm = (A.ro === "r" && !isFront(z, i) ? 1.25 : 1)*tb.a;   // 🏹 원거리는 뒷줄에서 +25% · 🦁🦄 스킬 응원
        for (let u = 0; u < q.n; u++){ if (--q.cd[u] > 0) continue;
          // 가장 앞서가는 몬스터부터
          let tg = [], best = -1; const mt = A.mt || 1;
          for (const e of E){ const dx = e.x - sx, dy = e.y - sy; if (dx*dx + dy*dy > r2) continue; if (e.tt === 2 && A.ro === "m" && A.hb !== "a") continue;   // 🦇 나는 몬스터는 근거리가 못 닿아요
            if (mt === 1){ if (e.tr > best){ best = e.tr; tg[0] = e; } } else tg.push(e); }
          if (!tg.length){ q.cd[u] = 6; continue; }
          if (mt > 1) tg = tg.sort((a, b) => b.tr - a.tr).slice(0, mt);
          q.cd[u] = Math.max(6, Math.round(A.cd*cdM)); q.hit = 8;
          if (!viz && A.sk){ q.mp = (q.mp || 0) + 1 + .3*RL(z, "skill"); if (q.mp >= A.sk.mp){ q.mp = 0; cast(z, i, A, sx, sy, pm); if (RL(z, "echo") && R.f() < .2*RL(z, "echo")){ cast(z, i, A, sx, sy, pm); popAt(z, i, "🔔 메아리!", "#ffe066"); } } }
          const ox = sx + UOFF[q.n - 1][u][0], oy = sy + UOFF[q.n - 1][u][1];
          tg.forEach(e => { PR.push({x0: ox, y0: oy, e, x1: e.x, y1: e.y, t: 0, T: 8, g: A.g, k: q.k}); if (viz) return;
            const cc = (A.cr || 0) + crB, cr = cc > 0 && R.f() < cc, dm = A.d*upMul(z, A.g)*(BUF ? BUF[z][i] : 1)*(cr ? 3 : 1)*relMul(z, A, e)*pm;
            hitE(e, dm, A, z); if (hl && R.f() < hl){ e.slT = Math.max(e.slT, 60); e.slF = Math.max(e.slF, .35); }   // 🌊 바다 무리: 맞으면 느려져요
            if (cr && fxN.t < 6){ fxN.t++; FX.push({tx: "치명타!", x: e.x, y: e.y - .35, t: 34, c: "#ff6b6b", cell: 1, sm: 1}); }
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
    const S = A.sk, p = Z[z], base = A.d*upMul(z, A.g)*(BUF ? BUF[z][i] : 1)*pm, R0 = A.r + .5*RL(z, "rng") + .4 + (HBR ? HBR[z][i] : 0);
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
    /* 👑 단단한 보스: 20단계부터 받는 피해 -50% · 🛡️ 서포터가 때리면 4초 동안 💥 약점 → 모두 +40% */
    if (e.kind === 1 || e.kind === 2){ if (A.job === "s") e.exT = 240; dm *= e.exT > 0 ? 1.4 : wave >= 20 ? (e.kind === 2 ? .65 : .8) : 1; }
    if (z != null && dm > 0) DMGZ[z] = (DMGZ[z] || 0) + Math.min(dm, Math.max(0, e.hp));   // 🤝 누가 얼마나 함께 때렸는지
    e.hp -= dm; if (A.sl){ e.slT = 90; e.slF = Math.max(e.slF, A.sl); } if (A.st && R.f() < A.st) e.stT = 40;
    const bn = (A.burn || 0) + (z != null ? .15*RL(z, "burn") : 0); if (bn){ e.bnT = 180; e.bnD = Math.max(e.bnD || 0, dm*bn/60); }
    if (z != null && RL(z, "frost") && R.f() < .08*RL(z, "frost") && e.kind !== 2) e.stT = Math.max(e.stT, 50); }
  function sim(){
    frame++;
    if (state !== "play") return;
    if (--waveT <= 0){ if (E.some(e => e.kind === 2)){ if (revive(true)) waveT = 30*60; else { lose("👑 보스를 시간 안에 못 잡았어요"); return; } } else startWave(); }
    if (wallT > 0 && --wallT === 0) calcLimit(); if (honT > 0) honT--; if (frame % 30 === 0) calcLimit();
    if (++metT >= 360){ metT = 0; Z.forEach((p, z) => { const m = RL(z, "meteor"); if (!m || !E.length) return;   // ☄️ 별똥별 부적
      const e = E.reduce((a, b) => b.hp > a.hp ? b : a); e.hp -= e.mhp*(e.kind === 2 ? .02 : e.kind === 1 ? .04 : .08)*m; FX.push({bolt: 1, x: e.x - 2, y: e.y - 4, x2: e.x, y2: e.y, t: 18, c: "#ffd43b"}); FX.push({ring: 1, x: e.x, y: e.y, t: 26, c: "#ffa94d", r: 1.2}); if (party === "host") NQ.push(["r", +e.x.toFixed(2), +e.y.toFixed(2), "#ffa94d"]); }); }
    if (spawnLeft > 0 && --spawnT <= 0){ spawn(0); spawnLeft--; spawnT = spawnI; }
    trayTick();
    const slw = (1 - slowAll())*(honT > 0 ? .35 : 1), bsl = 1 - Math.min(.5, .2*Z.reduce((a, p, z) => a + RL(z, "icecrown"), 0)); Z.forEach(p => { if (p.fev > 0) p.fev--; }); if (TB.length) TB = TB.filter(b => --b.t > 0);
    for (let i = E.length - 1; i >= 0; i--){ const e = E[i]; if (e.kind === 3 && e.tr > plOf(e.l)*(N > 1 ? 1 : 1.5)){ E.splice(i, 1); msFail("🟡 황금 슬라임이 도망갔어요!"); } }
    for (const e of E){ if (e.exT > 0) e.exT--; if (e.bnT > 0){ e.bnT--; e.hp -= e.bnD; } else if (e.tt === 5 && e.hp < e.mhp) e.hp = Math.min(e.mhp, e.hp + e.mhp*.0006); if (e.stT > 0){ e.stT--; } else { const v = e.spd*(e.slT > 0 ? 1 - e.slF : 1)*slw*(e.kind === 1 || e.kind === 2 ? bsl : 1); e.d += v; e.tr += v; } if (e.slT > 0 && --e.slT === 0) e.slF = 0; const pp = posAt(e.d, e.l); e.x = pp[0]; e.y = pp[1]; e.f++; }
    attack(false);
    for (let i = E.length - 1; i >= 0; i--){ const e = E[i]; if (e.hp > 0) continue; E.splice(i, 1); kills++; teamK++; msTick("kill");
      const gd = Math.floor((e.kind === 2 ? 120 : e.kind === 1 ? 35 : e.kind === 3 ? 60 + wave*3 : e.kind === 4 ? 40 : 1 + Math.floor(wave/15))*gmul()); Z.forEach((p, z) => p.gold += gd*(1 + RL(z, "greed")));
      if (e.kind === 3 || e.kind === 4){ boom(e.x, e.y, 1); if (MS && !MS.st && MS.k === (e.kind === 3 ? "gold" : "chest")) msWin(); else { Z.forEach((p, z) => giveItem(z, rndItem())); } continue; }
      if (e.kind){ const gm = e.kind === 2 ? 1 : 0, more = E.some(o => o.kind === e.kind); if (!more) Z.forEach(p => p.gems += gm); bossK += e.kind === 2 && !more ? 1 : 0; sfx("kboss"); banner = {t: e.kind === 2 ? "🎉 보스 처치!" : "😈 중간 보스 처치!", s: `${gm ? `💎 보석 +${gm} · ` : ""}💰 +${gd}`, k: 120, c: "#ffe066"};
        if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]); boom(e.x, e.y, 1);
        const lastBoss = e.kind === 2 && !E.some(o => o.kind === 2);
        if (lastBoss && waveT > 180) waveT = 180;
        if (lastBoss && wave % 100 === 0){ Z.forEach(p => p.gems += 3); banner = {t: wave === RD_END ? "🏆 1000단계 정복!!" : `🌀 ${dimOf(wave)}차원 돌파!`, s: wave === RD_END ? "전설의 동물 마을 수호대!" : `💎 보석 +3 · 🎁 유물 상자 · 다음은 ${dimOf(wave) + 1}차원!`, k: 220, c: "#fde047"}; if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]); sfx("big");
          if (wave >= RD_END){ score += 500000; state = "over"; overT = 260; if (party === "host") NQ.push(["b", banner.t, banner.s, 999, banner.c]); return; } }
        Z.forEach((p, z) => { if (e.kind === 1 && N > 1 && E.some(o => o.kind === 1)) return; p.gems += RL(z, "gem")*(e.kind === 2 ? 2 : 1); if (e.kind === 2){ if (lastBoss) offerRel(z); } else giveItem(z, rndItem()); });
        if (more) banner = {t: e.kind === 2 ? "👑 보스 하나 처치!" : "😈 중간 보스 하나 처치!", s: "다른 길의 보스도 잡아요!", k: 80, c: "#ffe066"};
        if (e.kind === 2 && !more){ banner.s = "🎁 유물 상자! 하나를 골라요"; if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]); } }
      else if (FX.length < 200) boom(e.x, e.y, 0); }
    const n = E.length; if (n >= LIMIT){ if (!revive(false)){ lose("👾 몬스터가 동물 마을을 덮쳤어요!"); return; } }
    if (n >= LIMIT*.8 && frame % 30 === 0) sfx("warn");
    score = Math.max(score, (wave - 1)*1000 + kills*5 + bossK*800);
  }
  function boom(x, y, big){ FX.push({ring: 1, x, y, t: big ? 30 : 14, c: big ? "#ffe066" : "#fff", r: big ? 1.6 : .45}); if (party === "host" && big) NQ.push(["r", +x.toFixed(2), +y.toFixed(2), "#ffe066"]); }
  /* 🪶 불사조 깃털: 질 뻔하면 다시 일어나요 (몬스터 절반이 사라지고, 보스 시간이 다 되었으면 30초 더) */
  function revive(bossT){ const z = Z.findIndex((p, z) => RL(z, "phoenix") > (p.revU || 0)); if (z < 0) return false; Z[z].revU = (Z[z].revU || 0) + 1;
    if (!bossT){ const L = E.filter(e => e.kind !== 2); L.slice(0, Math.ceil(L.length/2)).forEach(e => { e.hp = 0; }); E = E.filter(e => e.hp > 0); }
    E.forEach(e => { e.stT = Math.max(e.stT, 120); }); FX.push({nova: 1, x: COLS/2, y: ROWS/2, t: 60, c: "#ff922b"});
    banner = {t: "🪶 불사조 깃털! 다시 일어났어요!", s: bossT ? "보스 잡을 시간 +30초 · 몬스터가 잠깐 멈췄어요" : "몬스터 절반이 사라졌어요 · 힘내요!", k: 200, c: "#ff922b"}; sfx("big"); if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]); gv++; return true; }
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
  function snap(){ return {sp: speed, w: wave, wt: waveT, st: state, sc: score, kl: kills, bk: bossK, gv, lm: LIMIT, dz: DMGZ.map(v => Math.round(v || 0)), tk: teamK,
    P: Z.map(p => [Math.floor(p.gold), p.gems, p.up[0], p.up[1], p.up[2], p.sum, p.ack, Object.entries(p.rel).map(a => a.join(":")).join(","), p.it.join(","), p.pick ? p.pick.join(",") : "", p.clv, p.fev, p.up[3] || 0, p.rrn || 0, 0, 0, trS(p), p.trT, trOld(p)]),
    M: MS ? [MS.k, MS.n, MS.p, MS.st, MS.x || ""] : null,
    E: encE()}; }
  /* 📦 몬스터 목록을 짧은 글자로 (2026.11.18): "번호차,종류,거리,체력%,상태,길,특성,방패;…" · 끝의 0은 빼요 → 예전보다 40%쯤 작아서 느린 와이파이에서도 덜 밀려요 */
  function encE(){ let pid = 0, out = "";
    for (const e of E){ const a = [e.id - pid, e.kind, Math.round(e.d*100), Math.max(1, Math.round(e.hp/e.mhp*100)), (e.slT > 0 ? 1 : 0) | (e.stT > 0 ? 2 : 0) | (e.bnT > 0 ? 4 : 0) | ((e.co || 0) >= 3 ? 8 : 0) | (e.exT > 0 ? 16 : 0), e.l || 0, e.tt || 0, e.sh || 0];
      pid = e.id; let n = a.length; while (n > 4 && !a[n - 1]) n--; out += (out ? ";" : "") + a.slice(0, n).join(","); }
    return out; }
  function decE(v){ if (Array.isArray(v)) return v; if (!v) return []; let pid = 0;
    return v.split(";").map(r => { const a = r.split(",").map(Number); while (a.length < 8) a.push(0); a[0] += pid; pid = a[0]; return a; }); }
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
    if (s.dz) DMGZ = s.dz; if (s.tk != null) teamK = s.tk;
    speed = s.sp || 1; waveT = s.wt; state = s.st; score = s.sc; kills = s.kl; bossK = s.bk; if (s.lm) LIMIT = s.lm;
    MS = s.M ? {k: s.M[0], n: s.M[1], p: s.M[2], st: s.M[3], x: s.M[4] || undefined} : null;
    s.P.forEach((a, z) => { const p = Z[z]; if (!p) return; p.gold = a[0]; p.gems = a[1]; p.up = [a[2], a[3], a[4], a[12] || 0]; p.sum = a[5];
      if (a[7] != null){ p.rel = {}; String(a[7]).split(",").filter(Boolean).forEach(x => { const [k, v] = x.split(":"); p.rel[k] = +v; }); p.it = String(a[8] || "").split(",").filter(Boolean); p.pick = a[9] ? String(a[9]).split(",") : null; p.clv = a[10] || 0; p.fev = a[11] || 0; } p.rrn = a[13] || 0;
      if (a[16] != null){ const ks = String(a[16]).split(","), od = a[18]; p.tr = ks.map((k, i) => RD_A[k] ? {k, t: i === od ? -1 : i} : null); p.trT = a[17] || 0; }   /* 📥 대기 줄 (od = 곧 떠날 동물) */ if (z === myIdx){ const ack = a[6]; if (aseq < ack){ outbox.forEach((o, j) => { o[0] = ack + 1 + j; }); aseq = ack + outbox.length; } outbox = outbox.filter(o => o[0] > ack); } });   /* 🔁 다시 들어오면 행동 번호를 방장이 받은 다음부터 이어요 (예전엔 첫 행동들이 무시됐어요) */
    const old = new Map(E.map(e => [e.id, e]));
    E = decE(s.E).map(a => { const o = old.get(a[0]), d0 = a[2]/100, kind = a[1];
      const e = o || {id: a[0], kind, l: a[5] || 0, d: d0, tr: d0, spd: KSPD(kind), f: a[0]*7, x: 0, y: 0};
      if (o){ let dd = d0 - o.d; if (Math.abs(dd) > 2) o.d = d0; else o.d += dd*.5; } e.hpR = a[3]/100; e.sl = a[4] & 1; e.stn = a[4] & 2; e.bn = a[4] & 4; e.cm = a[4] & 8; e.ex = a[4] & 16; e.tt = a[6] || 0; e.sh = a[7] || 0; return e; });
    if (s.gv !== gv) PARTY.needGrid();
  }
  function guestStep(){
    frame++;
    for (const e of E){ if (!e.stn){ const v = e.spd*(e.sl ? .6 : 1)*speed; e.d += v; e.tr = (e.tr || 0) + v; } const pp = posAt(e.d, e.l); e.x = pp[0]; e.y = pp[1]; e.f++; }
    if (state === "play") Z.forEach(p => { if (p.trT > 1) p.trT = Math.max(1, p.trT - speed); });
    attack(true); emStep();
    if (outbox.length && frame % 6 === 0) PARTY.sendIn({sd: seed, a: outbox}, true);
  }
  function act(z, a){ if (SPEC) return; if (party === "guest"){ outbox.push([++aseq, ...a]); if (frame % 6 !== 0) PARTY.sendIn({sd: seed, a: outbox}, true); if (a[0] === "tk"){ playS("sum"); const p = Z[z], j = a[1]; if (p.tr && p.tr[j] && p.tr[j].k === a[2]) p.tr[j] = null; } return; } doAct(z, a); }   // 친구 기기: 누른 카드는 바로 지워 보여요

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
      const stop = e => e.stopPropagation(); ["pointerdown", "pointerup", "touchstart", "touchend", "mousedown"].forEach(ev => el.addEventListener(ev, stop));   // touchend도 막아야 휴대폰에서 단추가 눌려요 (판의 touchend가 click을 막아요)
      el.onclick = e => { const b = e.target.closest("button"); if (!b) return; if (b.dataset.i != null && emPick){ act(local[0], ["emo", +b.dataset.i, Math.round(emPick.x*100), Math.round(emPick.y*100)]); if (party === "guest") emShow(local[0], +b.dataset.i, emPick.x, emPick.y); } emClose(); }; }
    el.hidden = false; }
  function emClose(){ emPick = null; const el = $("#rdEmo"); if (el) el.hidden = true; }

  /* ---------- 아래 단추 (사람마다) ---------- */
  /* 👀 관전 줄: [👀 관전 중] [1P 학생1 💰] [2P …] — 누르면 그 친구 마당으로 */
  function specBars(){ const L = [], lw = land ? 200 : W - 20, rows = land ? 1 : 2, y0 = H - BOTH + 10, bh = rows === 1 ? BOTH - 20 : (BOTH - 28)/2;
    L.push({id: "spl", z: -2, x: 10, y: y0, w: lw, h: rows === 1 ? bh : bh*.8, info: 1});
    const x0 = land ? 10 + lw + 8 : 10, w0 = W - x0 - 10, yy = rows === 1 ? y0 : y0 + bh*.8 + 8, cw = (w0 - 8*(N - 1))/N;
    for (let z = 0; z < N; z++) L.push({id: "fol", z, x: x0 + z*(cw + 8), y: yy, w: cw, h: rows === 1 ? bh : bh*1.2 - 8});
    L.push({id: "book", z: -1, x: W - 92, y: 8, w: 84, h: TOPH - 18}); return L; }
  function follow(z){ if (!SPEC || !Z[z]) return; local[0] = z; bV = ""; playS("warn"); if (zoomed()){ CAM.fx = null; NG.fit(); } }   // 그 친구 마당이 화면 가운데에 딱 맞게
  function bars(){
    if (SPEC) return specBars();
    const L = []; const two = local.length >= 2;
    if (window.VK_ON){ local.forEach((z, si) => { const w = two && land ? W/2 : W, x0 = two && land ? si*W/2 : 0, y0 = two && !land ? H - BOTH + si*BOTH/2 : H - BOTH, h = two && !land ? BOTH/2 : BOTH; L.push({id: "info", z, x: x0 + 10, y: y0 + 6, w: w - 20, h: h - 12, info: 1, wide: 1}); });
      L.push({id: "spd", z: -1, x: W - 92, y: 8, w: 84, h: TOPH - 18}); L.push({id: "book", z: -1, x: W - 184, y: 8, w: 84, h: TOPH - 18}); return L; }
    local.forEach((z, si) => {
      const x0 = two ? (land ? si*W/2 : 0) : 0, w = two && land ? W/2 : W, y0 = two && !land ? H - BOTH + si*BOTH/2 : H - BOTH, h = two && !land ? BOTH/2 : BOTH;
      const pad = 10, rows = !land && !two ? 2 : 1;
      /* 📥 대기 줄: 카드 5장 + 🔄 새 줄 (카드는 제자리 — 새 동물이 와도 다른 카드가 밀리지 않아요) */
      const tray = (x, y, tw, th) => { L.push({id: "trb", z, x, y, w: tw, h: th, info: 1}); const rw = Math.min(tw*.16, th*.95), cw = (tw - rw - 6*5 - 8)/TRN;
        for (let i = 0; i < TRN; i++) L.push({id: "tk", z, i, x: x + 4 + i*(cw + 6), y: y + 3, w: cw, h: th - 6});
        L.push({id: "rr", z, x: x + tw - rw - 4, y: y + 3, w: rw, h: th - 6}); };
      if (rows === 1){ const bw = (w - pad*2 - 8*6)/8, bh = h - 30;
        let x = x0 + pad; const yy = y0 + 22;
        const add = (id, ww, extra) => { L.push(Object.assign({id, z, x, y: yy, w: ww, h: bh}, extra || {})); x += ww + 8; };
        tray(x, yy, bw*(two && land ? 3.3 : 2.9), bh); x += bw*(two && land ? 3.3 : 2.9) + 8;
        add("all", bw*.8); add("cr", bw*.85); add("up", bw*.8); add("luck", bw*.7); add("bag", bw*(two && land ? .8 : 1.1), {info: 1, bag: 1}); add("info", bw*(two && land ? .75 : .85), {info: 1}); }
      else { const bh = (h - 44)/2;
        tray(x0 + pad, y0 + 30, w - pad*2, bh);
        const F = [["all", 1], ["cr", 1], ["up", 1], ["luck", .85], ["bag", 1.4, {info: 1, bag: 1}], ["info", 1.05, {info: 1}]], u = (w - pad*2 - 8*(F.length - 1))/F.reduce((a, f) => a + f[1], 0);
        let x = x0 + pad; F.forEach(([id, f, ex]) => { L.push(Object.assign({id, z, x, y: y0 + 38 + bh, w: u*f, h: bh}, ex || {})); x += u*f + 8; }); }
    });
    L.push({id: "spd", z: -1, x: W - 92, y: 8, w: 84, h: TOPH - 18});   // ⏩ 속도: 같이 할 때도 누구나 (×1 → ×2 → ×4)
    L.push({id: "book", z: -1, x: W - 184, y: 8, w: 84, h: TOPH - 18});
    return L;
  }
  let BARS = [];
  function panelBtns(){ if (!panel) return []; const b = BARS.find(q => q.id === panel.id && q.z === panel.z); if (!b) return [];
    const n = panel.id === "up" ? 4 : 2, w = Math.min(360, W - 20), h = 60, x = Math.max(10, Math.min(W - w - 10, b.x + b.w/2 - w/2)), y0 = Math.min(b.y, H - BOTH) - 10 - n*(h + 8);
    return Array.from({length: n}, (_, i) => ({id: panel.id, i, z: panel.z, x, y: y0 + i*(h + 8), w, h})); }
  function selBtns(){ return []; }   // (2026.11.18) 합치기·팔기는 화면 아래 '고른 동물' 단추 줄(DOM)로 옮겼어요 — 판 위에 떠서 다른 동물을 가리던 문제
  function selBtnsOld(){ if (!sel) return []; const q = Z[sel.z].s[sel.i]; if (!q.k) return []; const [x, y] = slotXY(sel.z, sel.i), px = cx(x), py = cy(y) - C*.62;
    const w = 112, h = 50, L = []; const can = q.n >= 3 && RD_A[q.k].g < RD_MG;
    L.push({id: "smrg", x: px - w - 4, y: py - h - 40, w, h, off: !can}); L.push({id: "ssel", x: px + 4, y: py - h - 40, w, h});
    L.forEach(b => { b.x = Math.max(6, Math.min(W - b.w - 6, b.x)); b.y = Math.max(TOPH + 4, b.y); }); return L; }
  const inR = (b, x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h + 6;
  function slotAt(x, y){ const c = Math.floor((x - BX)/C), r = Math.floor((y - BY)/C), h = CELL.get(c + "," + r); return h ? {z: h.z, i: h.i} : null; }
  function press(b){
    if (b.id === "fol"){ follow(b.z); return; }
    if (b.id === "tk"){ const o = Z[b.z].tr && Z[b.z].tr[b.i]; if (o) act(b.z, ["tk", b.i, o.k]); else playS("no"); }
    else if (b.id === "rr") act(b.z, ["rr"]);
    else if (b.id === "all") act(b.z, ["all"]);
    else if (b.id === "cr") crToggle(b.z);
    else if (b.id === "up" || b.id === "luck"){ if (b.i != null){ act(b.z, b.id === "up" ? ["up", b.i] : ["luck", b.i]); } else { panel = panel && panel.id === b.id && panel.z === b.z ? null : {id: b.id, z: b.z};
        if (panel){ ["#rdSel", "#rdPin"].forEach(q => { const e = $(q); if (e) e.hidden = true; }); } } }
    else if (b.id === "book"){ if (RDB.isOpen) RDB.close(); else { const q = sel && Z[sel.z].s[sel.i]; RDB.open(q && q.k); } playS("warn"); }
    else if (b.id === "spd"){ act(local[0], ["spd"]); playS("warn"); }
    else if (b.id === "smrg"){ const q = Z[sel.z].s[sel.i]; if (q.k && RD_A[q.k].g >= RD_MG){ crF = String(Math.min(RD_MAXG, RD_A[q.k].g + 1)); crToggle(sel.z); } else if (!b.off){ act(sel.z, ["mrg", sel.i]); sel = null; } }
    else if (b.id === "ssel"){ act(sel.z, ["sel", sel.i]); const q = Z[sel.z].s[sel.i]; if (!q.k || q.n <= 1) sel = null; }
  }

  /* ---------- 그리기 ---------- */
  let bookDrawn = false;
  const CRUIS = (() => { try { return JSON.parse(localStorage.getItem("arcade.rdcr")) || {}; } catch(e){ return {}; } })();   // 조합 창 위치·크기 기억   // 📖 도감 보는 동안(혼자·둘이)은 멈춘 화면을 한 번만 그리고 쉬어요
  /* ⚡ 4배속 렉 없애기: 화면을 크게 덮는 효과는 동시에 몇 개만 (게임 계산과는 상관없는 그림만 줄여요) */
  const FXCAP = {flash: 1, novaB: 2, novaS: 4, ringB: 4, ring: 14, line: 6, pillar: 2, col: 3, txs: 6, tx: 14, ice: 8};
  function fxArea(f, ty){
    if (ty === "flash") return W*H*.5;
    if (ty === "novaB" || ty === "novaS"){ const r = Math.min((f.r || 2)*C*1.1, C*4.5); return 4*r*r; }
    if (ty === "ringB"){ const r = Math.min((f.r || 1)*C, C*3.2); return 4*r*r; }
    if (ty === "pillar") return C*C*(4.6*4.6 + 1.4*3.4);
    if (ty === "col") return f.c === RD_G[3].c || f.c === RD_G[4].c ? W*H*.4 : 0;
    return 0; }
  let rdPx = (() => { try { return +localStorage.getItem("arcade.rdpx") || 1.5e6; } catch(e){ return 1.5e6; } })();
  /* 🎚️ 기기가 버거워하면(장면 사이가 길어지면) 큰 효과를 저절로 줄이고, 여유가 생기면 다시 늘려요 */
  let fxQ = 1, fxLast = 0, fxAvg = 16.7, slowF = 0;
  /* 🐢 (2026.11.18) 효과를 줄여도 계속 버거우면(3초 넘게 초당 40장 아래) 그리는 점 수를 30% 줄여요 — 한 번 멈칫하고 그 뒤로 부드럽게.
     이 기기에 기억해 두고 다음 판부터는 처음부터 가볍게 시작해요 (최소 60만 점까지) */
  function fxTune(){ const now = performance.now(), dt = now - fxLast; fxLast = now; if (dt <= 0 || dt > 200) return;
    fxAvg += (dt - fxAvg)*.1; if (fxAvg > 19.5) fxQ = Math.max(.08, fxQ*.92); else if (fxAvg < 17.5) fxQ = Math.min(1, fxQ*1.01 + .002);
    if (fxAvg > 25 && fxQ < .25){ slowF += dt; if (slowF > 3000 && rdPx > 6.1e5){ slowF = 0; rdPx = Math.max(6e5, Math.round(rdPx*.7)); try { localStorage.setItem("arcade.rdpx", String(rdPx)); } catch(e) {} NG.fit(); layerKey = ""; uV = ""; } } else slowF = Math.max(0, slowF - dt*2); }
  function trimFX(){
    if (FX.length < 3) return;
    const n = {}, keep = [], budget = W*H*1.1*fxQ*(speed >= 4 ? .45 : speed >= 2 ? .75 : 1)*(PERF.lite ? .5 : 1); let used = 0;
    for (let i = FX.length - 1; i >= 0; i--){ const f = FX[i];   // 새것부터 남겨요
      const ty = f.flash ? "flash" : f.nova ? ((f.r || 2) >= 1.5 ? "novaB" : "novaS") : f.ring ? ((f.r || 1) >= 1.5 ? "ringB" : "ring") : (f.bolt || f.beam) ? "line" : f.pillar ? "pillar" : f.ice ? "ice"
        : f.tx ? (f.ui ? "" : f.sm ? "txs" : (f.cell && !f.nb && f.t > 40 && !/^\+/.test(f.tx)) ? "col" : "tx") : "";
      if (ty){ n[ty] = (n[ty] || 0) + 1; if (n[ty] > FXCAP[ty]) continue; }
      // 화면을 칠하는 넓이가 너무 많아지면 (큰 효과가 겹치면) 오래된 것부터 빼요
      const ar = fxArea(f, ty); if (ar > 0){ if (used + ar > budget && ty !== "flash") continue; used += ar; }
      keep.push(f); }
    if (keep.length !== FX.length){ keep.reverse(); FX.length = 0; for (const f of keep) FX.push(f); }
  }
  function draw(g){
    fxTune(); trimFX();
    if (crOpen && NG.frame % 10 === 0) crRender();
    if (NG.frame % 8 === 0) dockTick(); if (NG.frame % 12 === 3) pinTick(); selTick();   // 🎛️ 행동 줄 · 📌 목표 (바뀔 때만 다시 그려요)
    g.clearRect(0, 0, W, H);
    const k = NG.k || 1, lk = LK(); buildLayer(); boardBG(); if (bgURL && skyB !== BX + "," + BY + "," + C) setSky();   // 🔍 카메라가 움직였으면 판 배경 위치도 맞춰요
    g.setTransform(1, 0, 0, 1, 0, 0); if (!bgURL) g.drawImage(layer, Math.round(BX*k), Math.round(BY*k), Math.round(COLS*C*k), Math.round(ROWS*C*k));
    unitsLayer(lk); g.drawImage(uL, Math.round(BX*k), Math.round(BY*k), Math.round(COLS*C*k), Math.round(ROWS*C*k)); g.setTransform(k, 0, 0, k, 0, 0);
    const fr = NG.frame, us = Math.round(C*.62);
    // 3마리 모인 칸: 반짝이는 🔀 표시 (동물 그림은 위 한 장에 들어 있어요)
    for (let z = 0; z < N; z++){ if (!isMine(z)) continue; Z[z].s.forEach((q, i) => { if (!q.k || q.n < 3 || RD_A[q.k].g >= RD_MG) return; const [x, y] = slotXY(z, i); g.globalAlpha = .55 + Math.sin(fr*.15)*.4; G2.put(g, lbl(["🔀"], 20), cx(x - .5) + 1, cy(y - .5) - 2); g.globalAlpha = 1; }); }
    // 🌟 스킬 기력 막대 (꽉 차면 스킬!)
    for (let z = 0; z < N; z++){ if (!isMine(z)) continue; Z[z].s.forEach((q, i) => { if (!q.k || q.mp == null) return; const A = RD_A[q.k], r = Math.min(1, q.mp/A.sk.mp), [x, y] = slotXY(z, i), bw = C*.62, bx = cx(x) - bw/2, by = cy(y) + C*.4;
      g.fillStyle = "rgba(0,0,0,.5)"; g.fillRect(bx, by, bw, 5); g.fillStyle = r > .85 ? (fr % 12 < 6 ? "#fff3bf" : "#fcc419") : "#4dabf7"; g.fillRect(bx, by, bw*r, 5); }); }
    // 끌어서 옮길 때: 이 동물에게 좋은 자리 반짝
    if (drag && drag.on){ const q0 = Z[drag.z].s[drag.i]; if (q0.k){ const A0 = RD_A[q0.k], ro = A0.ro; LN[drag.z].slots.forEach(([x, y], s) => { const hb = TERR(drag.z, s) === A0.hb, good = ro === "m" ? isFront(drag.z, s) : ro === "r" ? !isFront(drag.z, s) : true;
      if (!hb && !good) return; g.globalAlpha = (hb && good ? .5 : .28) + Math.sin(fr*.2)*.15; g.fillStyle = hb ? RD_HBI[A0.hb].c : RD_ROLE[ro].c; rrect(g, cx(x - .45), cy(y - .45), C*.9, C*.9, C*.2); g.fill(); if (hb && good){ g.strokeStyle = "#fff"; g.lineWidth = 3; g.stroke(); } g.globalAlpha = 1; }); } }
    if (grab && LN[grab.z]){ const [x, y] = slotXY(grab.z, grab.i); g.strokeStyle = "#ffd43b"; g.lineWidth = 4; g.setLineDash([8, 6]); rrect(g, cx(x - .47), cy(y - .47), C*.94, C*.94, C*.18); g.stroke(); g.setLineDash([]); outlined(g, "✋ G로 놓기", cx(x), cy(y) - C*.56, 14, "#ffe066"); }
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
      if (e.kind === 1 || e.kind === 2){ const ex = e.exT > 0 || e.ex; if (ex){ g.globalAlpha = .7 + Math.sin(e.f*.3)*.3; outlined(g, "💥 약점!", x, y - sz*1.02, 15, "#ffe066"); g.globalAlpha = 1; } else if (wave >= 20) outlined(g, "🛡️", x + sz*.42, y - sz*.62, 18, "#fff"); }
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
      if (f.ring){ const T = 26, a = 1 - f.t/T, rr = Math.min((f.r || 1)*C*(.3 + a*.7), C*3.2); g.globalAlpha = Math.min(1, f.t/10)*.8; g.drawImage(ringSpr(f.c), cx(f.x) - rr, cy(f.y) - rr, rr*2, rr*2); g.globalAlpha = 1; continue; }
      if (f.nova){ f.T = f.T || f.t + 1; const a = 1 - f.t/f.T, rr = Math.min((f.r || 2)*C*(.2 + a*.9), C*4.5), x = cx(f.x), y = cy(f.y); g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = Math.min(1, f.t/12)*.85;
        g.drawImage(novaSpr(f.c), x - rr, y - rr, rr*2, rr*2); g.restore(); continue; }
      if (f.flash){ f.T = f.T || f.t + 1; g.globalAlpha = f.t/f.T*.35; g.fillStyle = f.c; g.fillRect(0, 0, W, H); g.globalAlpha = 1; continue; }
      if (f.bolt || f.beam){ g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = Math.min(1, f.t/8); g.strokeStyle = f.c; g.lineWidth = f.beam ? 10 : 5; g.lineCap = "round"; g.lineJoin = "round";
        const x1 = cx(f.x), y1 = cy(f.y), x2 = cx(f.x2), y2 = cy(f.y2); g.beginPath(); g.moveTo(x1, y1);
        if (f.bolt){ for (let k = 1; k < 5; k++){ const u = k/5; g.lineTo(x1 + (x2 - x1)*u + ((k*37 + f.t*11) % 22) - 11, y1 + (y2 - y1)*u + ((k*53 + f.t*7) % 22) - 11); } }
        g.lineTo(x2, y2); const a0 = g.globalAlpha; g.globalAlpha = a0*.35; g.lineWidth = f.beam ? 22 : 13; g.stroke(); g.globalAlpha = a0; g.lineWidth = f.beam ? 10 : 5; g.stroke(); g.lineWidth = f.beam ? 3 : 2; g.strokeStyle = "#fff"; g.stroke(); g.restore(); continue; }
      if (f.ice){ g.globalAlpha = Math.min(1, f.t/10); G2.put(g, iceSpr(), cx(f.x) - C*.35, cy(f.y) - C*.55); g.globalAlpha = 1; continue; }
      if (f.pillar){ f.T = f.T || f.t + 1; const a = f.t/f.T, x = cx(f.x), y = cy(f.y), bw = C*1.4; g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = a*.8;
        g.drawImage(colSpr(f.c, .6), x - bw/2, y - C*3, bw, C*3.4); g.drawImage(novaSpr(f.c), x - C*2.3, y - C*2.3, C*4.6, C*4.6); g.restore(); continue; }
      if (f.tx && f.cell && !f.sm && !f.nb && f.t > 40 && !/^\+/.test(f.tx)){   // ✨ 뽑기·합치기: 칸 위로 빛기둥
        const a = (f.t - 40)/30, bx = cx(f.x), by0 = cy(f.y + .4), bw = C*.62*(.6 + a*.4);
        g.globalAlpha = a*.8; g.drawImage(colSpr(f.c, .7), bx - bw/2, by0 - C*1.6, bw, C*1.6);
        if (f.c === RD_G[3].c || f.c === RD_G[4].c){ g.globalAlpha = a*.35; g.fillStyle = f.c === RD_G[4].c ? "#ffd6f5" : "#fff3bf"; g.fillRect(0, 0, W, H); }
        g.globalAlpha = 1; }
      if (f.tx){ g.globalAlpha = Math.min(1, f.t/18); const x = f.cell ? cx(f.x) : f.x, y = (f.cell ? cy(f.y) : f.y) - (f.ui ? 0 : (70 - f.t)*.5); const fl = f.L || (f.L = splitE(f.tx)), tl = lblFX(fl, f.sm ? 14 : f.ui ? 22 : 18, f.c); G2.put(g, tl, x - tl.w/2, y - 14); g.globalAlpha = 1; } }
    // 친구 이름표
    if (N > 1) for (let z = 0; z < N; z++){ const [ox, oy] = ZO[z]; faceAt(g, SIDS[z], cx(ox) + 14, cy(oy) + 14, 13, RD_PC[z]); }
    // 🔥 응원 깃발: 내 칸 테두리가 활활
    local.forEach(z => { if (Z[z].fev > 0 && LN[z]){ const L = LN[z]; g.globalAlpha = .55 + Math.sin(fr*.3)*.3; g.strokeStyle = "#ff922b"; g.lineWidth = 6; rrect(g, cx(L.ox) + 3, cy(L.oy) + 3, L.w*C - 6, L.h*C - 6, C*.4); g.stroke(); g.globalAlpha = 1; } });
    // 🚨 마을이 위험하면 화면 가장자리가 빨갛게
    { const r = E.length/LIMIT; if (r > .55){ const a = Math.min(1, (r - .55)/.35)*(.55 + Math.sin(fr*.18)*.25); g.globalAlpha = a; G2.put(g, sp(`vig${W}x${H}`, W, H, t => { const gr = t.createRadialGradient(W/2, H/2, Math.min(W, H)*.35, W/2, H/2, Math.max(W, H)*.65); gr.addColorStop(0, "rgba(255,0,40,0)"); gr.addColorStop(1, "rgba(255,0,40,.75)"); t.fillStyle = gr; t.fillRect(0, 0, W, H); }), 0, 0); g.globalAlpha = 1; } }
    if (crOpen && crSel && RD_RC[crSel] && LN[crZ]){ const S0 = Z[crZ].s, R0 = RD_RC[crSel], r = C*.47;
      S0.forEach((q, i) => { if (!q.k) return; const use = crPick.includes(i), rel = R0.some(rr => rr[0] === q.k); if (!use && !rel && i !== crDest) return;
        const [sx, sy] = slotXY(crZ, i), X = cx(sx), Y = cy(sy); g.lineWidth = use ? 5 : 3; g.strokeStyle = i === crDest ? "#fab005" : use ? "#51cf66" : "rgba(255,212,59,.9)";
        if (!use) g.setLineDash([8, 6]); g.beginPath(); g.arc(X, Y, r, 0, 7); g.stroke(); g.setLineDash([]);
        if (use){ g.fillStyle = "#51cf66"; g.beginPath(); g.arc(X - r*.7, Y - r*.7, 11, 0, 7); g.fill(); g.fillStyle = "#fff"; g.font = "bold 14px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("✔", X - r*.7, Y - r*.7); } }); }
    emDraw(g, fr); drawTop(g, fr); drawBottom(g); bagDraw(g); drawMission(g, fr); mmDraw(g, fr);
    if (party === "guest" && performance.now() - (PARTY.rxT || 0) > 2500){ g.fillStyle = "rgba(10,6,30,.55)"; g.fillRect(0, H/2 - 60, W, 120); outlined(g, "📡 방장 화면을 받고 있어요…", W/2, H/2 - 6, 38, "#ffe066"); outlined(g, PARTY.hp && PARTY.hp.relay ? "☁️ 다리(저장소)로 연결 중 · 잠깐만 기다려요" : "자동으로 다시 이어요 · 나가지 말고 기다려요", W/2, H/2 + 36, 22, "#fff"); }
    if (banner && banner.k > 0){ /* 👀 (2026.11.18) 큰 알림이 판 한가운데 동물을 가렸어요 → 위쪽에 작은 띠로 (반투명 바탕) */
      /* 📐 (2026.11.20) 크게 보기에서 오른쪽 위 작은 지도를 가리지 않게: 지도 왼쪽 빈 곳 가운데에, 길면 글씨를 줄여요 */
      const by0 = TOPH + 40, bh = banner.s ? 74 : 46, bL = 8, bR = zoomed() ? mmRect().x - 10 : W - 8, bC = (bL + bR)/2, avail = bR - bL;
      const t1 = lblFX(splitE(banner.t), land ? 34 : 30, banner.c || "#fff"), t2 = banner.s ? lblFX(splitE(banner.s), 19, "#ffe066") : null;
      const need = Math.max(t1.w, t2 ? t2.w : 0) + 70, ks = Math.min(1, avail/need), bw = Math.min(avail, need);
      g.globalAlpha = Math.min(1, banner.k/18)*.92; g.fillStyle = "rgba(15,10,40,.62)"; rrect(g, bC - bw/2, by0, bw, bh*Math.max(.8, ks), 18); g.fill(); g.globalAlpha = Math.min(1, banner.k/18);
      const putS = (l, cy) => { if (ks >= 1){ G2.put(g, l, bC - l.w/2, cy - l.h/2); return; } g.save(); g.translate(bC, cy); g.scale(ks, ks); G2.put(g, l, -l.w/2, -l.h/2); g.restore(); };
      putS(t1, by0 + 24*Math.max(.8, ks)); if (t2) putS(t2, by0 + 56*Math.max(.8, ks)); g.globalAlpha = 1; }
    pickDraw(g);
    if (pauseU && !party){ G2.put(g, sp(`rdpz${W}`, 360, 64, t => { t.fillStyle = "rgba(15,10,40,.82)"; rrect(t, 0, 0, 360, 64, 22); t.fill(); outlinedRaw(t, "⏸️ 잠깐 멈춤 · P / ▶️ 계속", 180, 33, 26, "#ffe066"); }), W/2 - 180, TOPH + 46); }
  }
  let uL = null, uV = "", uGv = -1, uZ = [];
  /* ⚡ (2026.11.18) 동물 그림판: 바뀐 친구 마당만 다시 그려요 — 예전엔 누구 한 명이 뽑기만 해도 6명 마당(최대 96칸)을 전부 다시 그려서
     4배속·여럿이 할 때 1초에 여러 번 멈칫했어요 */
  function zoneSig(z){ let s0 = isMine(z) ? "m" : ""; const S = Z[z].s, sy = SYN && SYN[z]; for (let i = 0; i < S.length; i++){ const q = S[i]; s0 += q.k ? q.k + q.n : "-"; if (sy && sy[i]) s0 += sy[i]; s0 += ","; } return s0; }
  function zoneRect(z){ let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let i = 0; i < ZS; i++){ const [x, y] = slotXY(z, i); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return [(x0 - .5)*C, (y0 - .5)*C, (x1 - x0 + 1)*C, (y1 - y0 + 1)*C]; }
  function drawZoneUnits(t, z){
    const us = Math.round(C*.62);
    Z[z].s.forEach((q, i) => { if (!q.k) return; const [x, y] = slotXY(z, i), n = q.n, s = Math.round(C*(n === 1 ? .94 : n === 2 ? .7 : .62)), spr = unitSpr(q.k, s);
      if (n >= 3 && RD_A[q.k].g < RD_MG && isMine(z)){ t.globalAlpha = .5; t.fillStyle = RD_G[RD_A[q.k].g + 1].c; rrect(t, (x - .46)*C, (y - .46)*C, C*.92, C*.92, C*.18); t.fill(); t.globalAlpha = 1; }
      for (let u = 0; u < n; u++){ const o = UOFF[n - 1][u]; t.drawImage(spr, Math.round((x + o[0])*C - s/2), Math.round((y + o[1])*C - s/2), s, s); }
      if (n >= 2){ const l = lbl([`×${n}`], 13, n >= 3 ? "#ffe066" : "#fff"); t.drawImage(l, (x + .48)*C - 30, (y + .5)*C - 22, l.w, l.h); }
      const sy = SYN && SYN[z] && SYN[z][i]; if (sy){ const l = lbl([sy], 12, "#fff"); t.drawImage(l, (x - .48)*C, (y - .5)*C, l.w, l.h); }
      const A = RD_A[q.k], RO = RD_ROLE[A.ro || "r"], bs = Math.round(C*.26);   // ⚔️🏹✨ 역할 표시
      t.drawImage(sp(`rb${A.ro}${bs}`, bs, bs, b => { b.fillStyle = RO.c; b.beginPath(); b.arc(bs/2, bs/2, bs/2 - 1, 0, 7); b.fill(); b.strokeStyle = "#fff"; b.lineWidth = 2; b.stroke(); G2.emo(b, RO.e, bs/2, bs/2 + 1, bs*.62); }), (x - .47)*C, (y - .47)*C, bs, bs);
      if (A.ro === "m" && !isFront(z, i)){ const l = lbl(["⚠️", "길에서 멀어요"], 11, "#ffe066"); t.drawImage(l, x*C - l.w/2, (y + .2)*C, l.w, l.h); }
      /* 🌍 사는 곳 표시: 자기 땅이면 초록 테 · 아니면 빨간 테 (옮기거나 🎁 친구에게) */
      { const ok = A.hb === TERR(z, i), hs = Math.round(C*.24); t.drawImage(sp(`hbb${A.hb}${ok ? 1 : 0}${hs}`, hs, hs, b => { b.fillStyle = ok ? "#fff" : "#ffe3e3"; b.beginPath(); b.arc(hs/2, hs/2, hs/2 - 1, 0, 7); b.fill(); b.strokeStyle = ok ? "#37b24d" : "#f03e3e"; b.lineWidth = ok ? 2 : 3; b.stroke(); G2.emo(b, RD_HBI[A.hb].e, hs/2, hs/2 + 1, hs*.6); }), (x + .47)*C - hs, (y - .47)*C, hs, hs); } }); }
  function unitsLayer(k){
    const base = `${layerKey}|${k}|${COLS}|${ROWS}|${C}`;
    if (base !== uV || !uL){ uV = base; uZ = []; uGv = -1;
      uL = uL || document.createElement("canvas"); const w = Math.ceil(COLS*C*k), h = Math.ceil(ROWS*C*k); if (uL.width !== w || uL.height !== h){ uL.width = w; uL.height = h; }
      const t = uL.getContext("2d"); t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, w, h); }
    if (gv === uGv) return; uGv = gv;
    const t = uL.getContext("2d"); t.setTransform(k, 0, 0, k, 0, 0);
    for (let z = 0; z < N; z++){ const sg = zoneSig(z); if (uZ[z] === sg) continue; uZ[z] = sg;
      const [rx, ry, rw, rh] = zoneRect(z); t.save(); t.beginPath(); t.rect(rx, ry, rw, rh); t.clip(); t.clearRect(rx, ry, rw, rh); drawZoneUnits(t, z); t.restore(); }
  }
  /* 🎯 미션 · 내 유물 · 다음 보스 (위 막대 아래 한 줄) */
  function drawMission(g, fr){
    const y = TOPH + 2, parts = [];
    if (MS){ const D = RD_MS[MS.k], done = MS.st === 1, fail = MS.st === 2, prog = ["merge", "sum", "kill"].includes(MS.k) ? ` ${Math.min(MS.p, MS.n)}/${MS.n}` : MS.k === "keep" ? ` (지금 ${E.length})` : "";
      parts.push({l: (prog ? dlbl : lbl)([done ? "✅" : fail ? "❌" : D.e, `미션: ${D.t(MS.n, MS.x)}${prog}`, ...(done ? [] : ["→", "🎒"])], 15, done ? "#8ce99a" : fail ? "#ffa8a8" : "#fff"), c: done ? "rgba(43,138,62,.75)" : fail ? "rgba(120,30,30,.7)" : "rgba(15,10,40,.72)"}); }
    else if (wave % 10 === 0) parts.push({l: lbl(["👑", "보스를 잡으면 🎁 유물 상자!"], 15, "#ffe066"), c: "rgba(90,20,40,.78)"});
    if (wave % 10) parts.push({l: lbl(["👑", `보스까지 ${10 - wave % 10}단계`], 14, "#ffd8a8"), c: "rgba(15,10,40,.6)"});
    { const rg = REG(), hz = HBC[local[0]] || {l: 0, s: 0, a: 0};   // 🗺️ 이 맵에서 센 곳 · 🌍 내 무리
      parts.push({l: lbl(rg === "*" ? ["🗺️", "모두 +15%"] : ["🗺️", RD_HBI[rg].e, `${RD_HBI[rg].n} +30%`], 14, rg === "*" ? "#ffe066" : RD_HBI[rg].c), c: "rgba(15,10,40,.72)"});
      const sp0 = ["l", "s", "a"].filter(h => hz[h]).flatMap(h => { const T = rdSetT(hz[h]); return [RD_HBI[h].e, `${hz[h]}${T ? "★".repeat(T) : ""}`]; });
      if (sp0.length) parts.push({l: lbl(sp0, 14, "#fff"), c: "rgba(15,10,40,.6)"}); }
    parts.push({l: lbl(["🌀", `${dimOf(wave)}차원`, `· ${wave}/${RD_END}`], 14, "#e5dbff"), c: "rgba(60,20,90,.7)"});
    if (N >= 3) parts.push({l: lbl(["🎌", TEAM > 1 ? `역할 분담 +${Math.round((TEAM - 1)*100)}%` : "역할 분담: 친구마다 ⚔️🏹✨ 주력을 나눠요"], 14, TEAM > 1 ? "#8ce99a" : "#ced4da"), c: "rgba(15,10,40,.6)"});
    const rel = Object.entries(Z[local[0]].rel || {}); if (rel.length) parts.push({l: lbl(rel.flatMap(([k, v]) => [RD_REL[k].e, v > 1 ? `${v}` : ""]).filter(Boolean), 14, "#ffe066"), c: "rgba(15,10,40,.6)"});
    /* 🤝 같이 할 때: 이번 단계에 다 같이 잡은 수 + 친구마다 함께 때린 몫 (색 막대) */
    if (N > 1){ const tl = dlbl(["🤝", `다 같이 ${teamK}마리`], 14, "#fff"); parts.unshift({l: tl, c: "rgba(30,90,60,.78)", team: 1, w: tl.w + 150}); }
    /* 📱 (2026.11.20) 휴대폰에서는 왼쪽 위 🔊·✕ 단추가 이 줄까지 내려와서 첫 칸('다 같이')을 가렸어요 → 단추 오른쪽부터 놓아요 */
    const sc0 = Math.min(lastSW/W, lastSH/H) || 1, x0 = y < 48/sc0 ? LPAD : 8, x1 = W - 8, cxm = (x0 + x1)/2;
    let tw = parts.reduce((a, q) => a + (q.w || q.l.w) + 22, -8), x = Math.max(x0, cxm - tw/2);
    if (x + tw > x1){ if (parts[0] && parts[0].team && parts.length > 1) parts.push(parts.shift());   // 자리가 모자라면 🎯 미션을 먼저 보여 줘요
      const keep = []; let w2 = -8; for (const q of parts){ if (w2 + (q.w || q.l.w) + 22 > x1 - x0) break; keep.push(q); w2 += (q.w || q.l.w) + 22; } parts.length = 0; parts.push(...keep); tw = w2; x = Math.max(x0, cxm - tw/2); }
    parts.forEach(q => { const qw = q.w || q.l.w; g.fillStyle = q.c; rrect(g, x, y, qw + 14, q.l.h + 2, 12); g.fill(); G2.put(g, q.l, x + 7, y + 1);
      if (q.team){ const bx = x + 7 + q.l.w + 6, bw = 136, bh = 10, by = y + q.l.h/2 - 4, tot = DMGZ.reduce((a, v) => a + (v || 0), 0); g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(bx, by, bw, bh);
        if (tot > 0){ let ox = bx; DMGZ.forEach((v, z) => { const w = bw*(v || 0)/tot; if (w <= 0) return; g.fillStyle = RD_PC[z]; g.fillRect(ox, by, w, bh); ox += w; }); } }
      x += qw + 22; });
  }
  const splitE = s => s.split(/(\p{Extended_Pictographic}️?)/u).filter(Boolean).map(x => x.trim()).filter(Boolean);
  function drawTop(g, fr){
    g.fillStyle = "rgba(15,10,40,.62)"; rrect(g, 8, 6, W - 16, TOPH - 12, 16); g.fill();
    const wl = lbl(["🏁", `${wave}단계`], 24, "#ffe066"); G2.put(g, wl, LPAD, 12);
    const tR = W - (party !== "guest" ? 192 : 100) - 90, bL0 = LPAD + wl.w + (land ? 150 : 12);   // 👾 막대가 단계 글씨·시계와 겹치지 않게
    const n = E.length, r = Math.min(1, n/LIMIT); let bw = Math.min(380, W*.36), bx = W/2 - bw/2; if (bx < bL0){ bx = bL0; bw = Math.max(110, Math.min(bw, tR - bx)); }
    const by = TOPH/2 - 10;
    g.fillStyle = "rgba(0,0,0,.4)"; rrect(g, bx, by, bw, 20, 10); g.fill(); g.fillStyle = r > .8 ? (fr % 20 < 10 ? "#ff6b6b" : "#c92a2a") : r > .55 ? "#fcc419" : "#51cf66"; rrect(g, bx, by, Math.max(20, bw*r), 20, 10); g.fill();
    { const l = dlbl(["👾", `${n} / ${LIMIT}`], 16); G2.put(g, l, W/2 - l.w/2, by - 3); }
    const boss = E.find(e => e.kind === 2), sec = Math.ceil(Math.max(0, waveT)/60);
    const tl = dlbl([boss ? "⏰" : "⏱️", `${sec}초`], 20, boss && sec < 15 ? "#ff6b6b" : "#fff"); G2.put(g, tl, W - (party !== "guest" ? 192 : 100) - tl.w, 14);
    { const b = BARS.find(q => q.id === "book"); if (b) G2.put(g, btnSpr(b.w, b.h, "#63e6be", "#0ca678", ["📖", "도감"], 16), b.x, b.y); }
    if (land) G2.put(g, lbl([th().n.split(" ")[0], th().n.split(" ").slice(1).join(" ")], 16, "#d0bfff"), LPAD + 122, 16);
    { const b = BARS.find(q => q.id === "spd"); if (b) G2.put(g, btnSpr(b.w, b.h, speed === 4 ? "#ff6b6b" : speed > 1 ? "#ff922b" : "#748ffc", speed === 4 ? "#c92a2a" : speed > 1 ? "#e8590c" : "#4c6ef5", ["⏩", `×${speed}`], 17), b.x, b.y); }
  }
  /* 📥 대기 줄 카드 한 장 (등급 색 테두리 · 사는 곳 표시 · 이름) — 같은 카드는 한 번만 그려요 */
  function trCard(k, w, h, z){ const A = RD_A[k], gift = A && N > 1 && !yardH(z).includes(A.hb);
    return sp(`tc${k}${w}x${h}${gift ? "g" : ""}`, w, h, t => {
      if (!A){ t.strokeStyle = "rgba(255,255,255,.28)"; t.lineWidth = 2; t.setLineDash([6, 5]); rrect(t, 2, 2, w - 4, h - 4, 12); t.stroke(); t.setLineDash([]); t.globalAlpha = .4; G2.emo(t, "⏳", w/2, h/2, Math.min(w, h)*.32); t.globalAlpha = 1; return; }
      const G = RD_G[A.g], HB = RD_HBI[A.hb];
      t.fillStyle = "rgba(0,0,0,.3)"; rrect(t, 2, 4, w - 4, h - 4, 12); t.fill();
      t.fillStyle = BSA.lg(t, 0, 0, 0, h, [[0, "#ffffff"], [.55, G.c2], [1, G.c]]); rrect(t, 1, 1, w - 3, h - 5, 12); t.fill();
      t.strokeStyle = G.c; t.lineWidth = A.g >= 2 ? 4 : 3; t.stroke();
      const fs = Math.max(10, Math.min(15, Math.floor(w*.2))), us = Math.min(w - 6, h - fs - 12);
      t.drawImage(RDA.unitSpr(k, Math.round(us)), (w - us)/2, 2, us, us);
      t.fillStyle = HB.c2; t.beginPath(); t.arc(w*.2 + 2, w*.2 + 2, Math.min(w, h)*.17, 0, 7); t.fill(); t.strokeStyle = "#fff"; t.lineWidth = 2; t.stroke(); G2.emo(t, HB.e, w*.2 + 2, w*.2 + 3, Math.min(w, h)*.2);
      if (gift){ G2.emo(t, "🎁", w - w*.2 - 2, w*.2 + 3, Math.min(w, h)*.22); }
      outlinedRaw(t, A.n.length > 4 && w < 70 ? A.n.slice(0, 4) : A.n, w/2, h - fs*.75 - 4, fs, "#fff"); }); }
  /* 📥 다음 동물까지 막대 + ⏳ 곧 떠날 카드 + ✨ 방금 온 카드 (움직이는 것만 여기서 그려요) */
  const trNew = {};
  function trayFx(g){ const fr = NG.frame;
    BARS.forEach(b => { if (b.z < 0 || !Z[b.z]) return; const p = Z[b.z];
      if (b.id === "trb"){ const r = state === "play" ? 1 - Math.max(0, Math.min(TRF, p.trT || 0))/TRF : 0; g.fillStyle = "rgba(0,0,0,.45)"; g.fillRect(b.x + 4, b.y + b.h + 1, b.w - 8, 4); g.fillStyle = "#ffe066"; g.fillRect(b.x + 4, b.y + b.h + 1, (b.w - 8)*r, 4); return; }
      if (b.id !== "tk") return; const o = p.tr && p.tr[b.i], key = b.z + ":" + b.i, k = o ? o.k : "";
      const nw = trNew[key] || (trNew[key] = {k, f: -99}); if (nw.k !== k){ nw.k = k; nw.f = k ? fr : -99; }
      if (k && fr - nw.f < 14){ g.globalAlpha = 1 - (fr - nw.f)/14; g.strokeStyle = "#fff"; g.lineWidth = 5; rrect(g, b.x - 2, b.y - 2, b.w + 4, b.h - 2, 13); g.stroke(); g.globalAlpha = 1; }
      if (k && trOld(p) === b.i && (p.trT || 0) < 36){ g.globalAlpha = .55 + Math.sin(fr*.4)*.35; G2.put(g, lbl(["⏳"], 16), b.x + b.w - 26, b.y + b.h - 34); g.globalAlpha = 1; } }); }
  let bL = null, bV = "";
  function drawBottom(g){
    const k = NG.k || 1, sig = SPEC ? [k, W, H, BOTH, BARS.length, local[0], Z.map(p => Math.floor(p.gold/10)).join(",")].join("/") : [k, W, H, BOTH, BARS.length, local.map(z => { const p = Z[z]; return [Math.floor(p.gold), p.gems, trS(p), rrCost(z), N > 1 ? yardH(z).join("") : "", p.up.join(""), p.s.some(q => q.k && q.n >= 3 && RD_A[q.k].g < RD_MG) ? 1 : 0, p.it.length, bagN(z), crN(z), crOpen ? 1 : 0].join(","); }).join("|")].join("/");
    if (sig !== bV || !bL){ bV = sig; bL = bL || document.createElement("canvas"); const w = Math.ceil(W*k), h = Math.ceil(BOTH*k) + 2; if (bL.width !== w || bL.height !== h){ bL.width = w; bL.height = h; }
      const t = bL.getContext("2d"); t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, bL.width, bL.height); t.setTransform(k, 0, 0, k, 0, -(H - BOTH)*k); barsDraw(t); }
    g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(bL, 0, Math.round((H - BOTH)*k)); g.setTransform(k, 0, 0, k, 0, 0);
    trayFx(g); popsDraw(g);
  }
  function barsDraw(g){
    g.fillStyle = "rgba(15,10,40,.78)"; g.fillRect(0, H - BOTH, W, BOTH); g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(0, H - BOTH, W, 2);
    BARS.forEach(b => { if (b.id === "spd") return;
      if (b.id === "spl"){ const l1 = lbl(["👀", "관전 중"], land ? 24 : 22, "#ffe066"), l2 = lbl(["친구를 누르면 그 마당을 봐요"], 13, "#e5dbff"); G2.put(g, l1, b.x + 6, b.y + b.h/2 - l1.h + (land ? 4 : 10)); if (land) G2.put(g, l2, b.x + 6, b.y + b.h/2 + 6); else G2.put(g, l2, b.x + l1.w + 18, b.y + b.h/2 - l2.h/2 + 2); return; }
      if (b.id === "fol"){ const on = local[0] === b.z, p = Z[b.z]; if (!p) return; const nm = nameOf(noOf_(SIDS[b.z])), yh = N > 1 ? (TE[b.z] ? [...new Set(TE[b.z])].map(h => RD_HBI[h].e).join("") : "") : "";
        G2.put(g, btnSpr(Math.round(b.w), Math.round(b.h), on ? RD_PC[b.z] : "#e9ecef", on ? "#5f3dc4" : "#adb5bd", b.w >= 190 ? [`${b.z + 1}P`, nm, yh, "💰", rdN(p.gold)] : [`${b.z + 1}P`, b.w < 130 && nm.length > 3 ? nm.slice(0, 3) : nm], Math.max(13, Math.min(18, Math.floor(b.w/(b.w >= 190 ? 9 : 6.5)))), false), b.x, b.y); return; }
      if (b.z < 0) return; const p = Z[b.z]; if (!p) return; const col = RD_PC[b.z];
      if (b.id === "trb"){ g.fillStyle = "rgba(255,255,255,.07)"; rrect(g, b.x - 2, b.y - 2, b.w + 4, b.h + 4, 14); g.fill(); g.strokeStyle = "rgba(255,224,102,.55)"; g.lineWidth = 2; g.stroke();
        G2.put(g, lbl(["📥", "대기 줄 · 눌러서 데려와요 · 🔄 새 줄"], 13, "#ffe066"), b.x + 6, b.y - 19); }
      else if (b.id === "tk"){ const o = p.tr && p.tr[b.i]; G2.put(g, trCard(o ? o.k : "", Math.round(b.w), Math.round(b.h), b.z), b.x, b.y); }
      else if (b.id === "rr"){ const c = rrCost(b.z); G2.put(g, btnSpr(Math.round(b.w), Math.round(b.h) - 6, "#ffd43b", "#f08c00", ["🔄", rdN(c)], Math.min(17, Math.floor(b.w*.24)), p.gold < c), b.x, b.y); }
      else if (b.id === "all"){ const can = p.s.some(q => q.k && q.n >= 3 && RD_A[q.k].g < RD_MG); G2.put(g, btnSpr(Math.round(b.w), Math.round(b.h), "#69db7c", "#2b8a3e", ["🔀", "합치기"], Math.min(24, Math.floor(b.w*.19)), !can), b.x, b.y); }
      else if (b.id === "cr"){ const n = crN(b.z); G2.put(g, btnSpr(Math.round(b.w), Math.round(b.h), n ? "#ffc078" : "#ffa94d", "#d9480f", ["🧪", "조합"], Math.min(24, Math.floor(b.w*.22)), false), b.x, b.y);
        if (n){ const l = lbl(["✨", `${n}개 가능`], 14, "#fff"); g.fillStyle = "#e8590c"; rrect(g, b.x + b.w - l.w - 12, b.y - 12, l.w + 12, l.h + 4, 10); g.fill(); g.strokeStyle = "#ffd43b"; g.lineWidth = 2; g.stroke(); G2.put(g, l, b.x + b.w - l.w - 6, b.y - 10); } }
      else if (b.id === "up") G2.put(g, btnSpr(Math.round(b.w), Math.round(b.h), "#74c0fc", "#1971c2", ["⬆️", "강화"], Math.min(24, Math.floor(b.w*.22)), false), b.x, b.y);
      else if (b.id === "luck") G2.put(g, btnSpr(Math.round(b.w), Math.round(b.h), "#e599f7", "#9c36b5", ["💎", "보석"], Math.min(22, Math.floor(b.w*.22)), p.gems < 1), b.x, b.y);
      else if (b.id === "bag"){ g.fillStyle = "rgba(255,255,255,.06)"; rrect(g, b.x, b.y, b.w, b.h, 14); g.fill(); g.strokeStyle = "rgba(255,212,59,.6)"; g.lineWidth = 2; g.setLineDash([6, 5]); g.stroke(); g.setLineDash([]);
        G2.put(g, lbl(["🎒", `가방 ${p.it.length}/${bagN(b.z)}`], 13, "#ffe066"), b.x + 6, b.y - 18); }
      else if (b.id === "info"){ g.fillStyle = "rgba(255,255,255,.08)"; rrect(g, b.x, b.y, b.w, b.h, 14); g.fill(); g.strokeStyle = col; g.lineWidth = 3; g.stroke();
        if (b.wide){ const l1 = dlbl(["💰", rdN(p.gold), "💎", String(p.gems), "📥", (p.tr || []).filter(Boolean).map(o => RD_A[o.k].e).join("") || "-", "⬆️", `Lv ${p.up.join("·")}`], 22, "#ffe066"); G2.put(g, l1, b.x + 12, b.y + b.h/2 - l1.h/2); }
        else { const f1 = Math.min(26, Math.floor(b.w*.2)); G2.put(g, dlbl(["💰", rdN(p.gold)], f1, "#ffe066"), b.x + 8, b.y + b.h*.5 - f1 - 10); G2.put(g, dlbl(["💎", String(p.gems)], Math.min(22, f1), "#e5dbff"), b.x + 8, b.y + b.h*.5 + 2); }
        if (local.length >= 2 || N > 1) faceAt(g, SIDS[b.z], b.x + b.w - 4, b.y + 4, 14, col); } });
    /* ⌨️ 단추마다 자판 글자 (키보드가 있는 기기) */
    if (kHint || window.VK_ON) BARS.forEach(b => { if (b.z < 0 || b.z !== local[0]) return; const two = local.length >= 2, key = {trb: "Space", rr: "V", all: "Q", cr: "C", up: "1~4", luck: "E", bag: "5~9"}[b.id]; if (!key) return;
      const l = lbl([key], 12, "#fff"), hx = b.id === "trb" ? b.x + b.w - l.w - 12 : b.x + 4, hy = b.id === "trb" ? b.y - 20 : b.y + b.h - l.h - 4; g.fillStyle = "rgba(0,0,0,.55)"; rrect(g, hx, hy, l.w + 8, l.h + 2, 7); g.fill(); G2.put(g, l, hx + 4, hy + 1); });
    if ((kHint || window.VK_ON) && local.length >= 2) BARS.forEach(b => { if (b.z !== local[1]) return; const key = {trb: "Enter", all: "M", luck: "L"}[b.id]; if (!key) return;
      const l = lbl([key], 12, "#fff"); g.fillStyle = "rgba(0,0,0,.55)"; rrect(g, b.x + 4, b.y + b.h - l.h - 4, l.w + 8, l.h + 2, 7); g.fill(); G2.put(g, l, b.x + 8, b.y + b.h - l.h - 3); });
  }
  /* 🧪 조합 창 (DOM) — 왼쪽: 조합 목록(만들 수 있는 것이 위) · 오른쪽: 내 4×4 마당에서 재료로 쓸 동물을 직접 골라 넣고 📍 만들 자리도 골라요
     ⏸️ 혼자·둘이 할 때는 조합 창이 열려 있는 동안 게임이 잠깐 멈춰요 (천천히 생각해요) */
  function crToggle(z){ if (crOpen && crZ === z){ crClose(); return; } crOpen = true; crZ = z; crR = crD = ""; crMode = ""; panel = null; grab = null;
    if (!crSel || !RD_RC[crSel]) crSel = crList(z)[0] || RD_RCK[0]; /* 💾 고르던 조합은 그대로 기억해요 */ crPick = autoPick(z, crSel); crDest = -1; crRender(); playS("warn"); }
  function crClose(){ document.body.classList.remove("rd-cr-on"); crOpen = false; crMode = ""; bookDrawn = false; const el = $("#rdCr"); if (el) el.hidden = true; }
  const crMiss = (t, H) => RD_RC[t].reduce((a, [k, c]) => a + Math.max(0, c - (H[k] || 0)), 0);   // 🧭 모자란 재료 수
  function crShown(){ const H = haveOf(crZ), ok = RD_RCK.filter(t => canCraft(crZ, t, H)); const L = crF === "ok" ? ok.concat(RD_RCK.filter(t => !ok.includes(t)).sort((a, b) => crMiss(a, H) - crMiss(b, H) || RD_A[a].g - RD_A[b].g)) : RD_RCK.filter(t => crF === "s" || crF === "d" ? RD_A[t].job === crF : RD_A[t].g === +crF);
    return {H, ok, L}; }
  /* 🧭 만드는 길: 재료마다 '이미 있어요 / 어떻게 모아요'를 한 줄씩 (재료가 조합 동물이면 그 재료까지) */
  function crGuide(t, H){
    const R0 = RD_RC[t], miss = crMiss(t, H), how = k => { const A = RD_A[k];
      const hb = RD_HBI[A.hb], gv0 = N > 1 && !yardH(crZ).includes(A.hb) ? ` · 🎁 ${hb.e} 친구에게 부탁해요` : "";
      if (A.g === 0) return `📥 <b>대기 줄</b>에 1초마다 와요 — ${A.e}이(가) 오면 눌러서 데려와요${gv0}`;
      if (A.g < RD_MG) return `🔀 같은 ${hb.e} ${hb.n} 동물 3마리를 <b>합치면</b> ${hb.n} 동물이 나와요 · 📥 대기 줄에도 가끔${gv0}`;
      if (RD_RC[k]) return `🧪 <b>조합</b>으로 만들어요 <span class="sub">${RD_RC[k].map(([k2, c2]) => `<span class="${(H[k2] || 0) >= c2 ? "y" : ""}">${RD_A[k2].e}${RD_A[k2].n} ${Math.min(H[k2] || 0, c2)}/${c2}</span>`).join("")}</span> <button class="cx-lk" data-t="${k}" style="border:0;background:none;color:#7048e8;font:12px 'Jua';cursor:pointer">→ 보러 가기</button>`;
      return `📥 <b>대기 줄</b>에 와요 (단계가 오를수록 자주)${gv0}`; };
    const steps = R0.map(([k, c], i) => { const h = H[k] || 0, ok = h >= c;
      return `<div class="st ${ok ? "ok" : ""}"><span>${ok ? "✔" : i + 1}</span><div><b>${RD_A[k].e} ${RD_A[k].n} ${c}마리</b> — ${ok ? `<em>준비됐어요! (가진 것 ${h})</em>` : `<u>${c - h}마리 더 필요</u> · ${how(k)}`}</div></div>`; }).join("");
    return `<div class="cx-gd"><b>${miss ? `🧭 만드는 길 — ${miss}마리만 더 모으면 돼요!` : "🎉 재료가 다 모였어요! 아래에서 🧪 만들기!"}</b>${steps}</div>`; }
  function crPickSel(t){ if (!RD_RC[t]) return; crSel = t; crPick = autoPick(crZ, t); crDest = -1; crMode = ""; crD = ""; crRender(); playS("warn"); }
  /* 마당 칸 누르기: 재료로 넣기/빼기 (이미 다 찼으면 다른 칸 것과 바꿔요) · 📍 모드면 만들 자리 정하기 */
  function crTap(i){ const S = Z[crZ].s, q = S[i], R0 = RD_RC[crSel]; if (!q || !R0) return;
    if (crMode === "dest"){ crDest = i; crMode = ""; playS("sum"); crD = ""; crRender(); return; }
    const need = q.k && (R0.find(r => r[0] === q.k) || [])[1]; if (!need){ playS("no"); return; }
    const inI = crPick.filter(j => j === i).length, inK = crPick.filter(j => S[j].k === q.k).length, o = crPick.findIndex(j => j !== i && S[j].k === q.k);
    if (inI < q.n && inK < need) crPick.push(i);                       // 넣기
    else if (inI < q.n && o >= 0){ crPick.splice(o, 1); crPick.push(i); }   // 다 찼으면 다른 칸 것과 바꾸기
    else if (inI > 0) crPick = crPick.filter(j => j !== i);              // 빼기
    playS("sum"); crD = ""; crRender(); }
  function crGo(){ if (!crSel || !canCraft(crZ, crSel)){ playS("no"); return; } if (!pickOK(crZ, crSel, crPick)){ crPick = autoPick(crZ, crSel, crPick); crD = ""; crRender(); playS("warn"); return; }   // 모자란 재료만 채워서 보여 줘요 → 한 번 더 누르면 만들어요
    act(crZ, ["cr", crSel, crPick.slice(), crDest]); if (party === "guest") playS("merge"); bookDrawn = false;
    if (!party){ crPick = autoPick(crZ, crSel); crDest = -1; } crR = crD = ""; crRender(); }
  const imgOf = k => RDB.img(k);
  /* 🖐️ 조합 창: 위쪽 줄을 끌어서 옮기고(마우스·손가락), ➖ 작게 줄여서 마당을 보면서 조합해요 — 위치·크기는 기억해요 */
  /* 📱 휴대폰(작은 화면): 조합 창을 화면 가득 펼치고(끌기·작게 없음) 조합 식을 크게 보여 줘요 */
  const crMob = () => { try { return matchMedia("(max-height:520px),(max-width:640px)").matches; } catch(e){ return false; } };
  function crSave(){ try { localStorage.setItem("arcade.rdcr", JSON.stringify(CRUIS)); } catch(e){} }
  function crPlace(el){ const mob = crMob(); el.classList.toggle("cx-mb", mob); document.body.classList.toggle("rd-cr-on", mob && !el.hidden); if (mob){ el.classList.remove("cx-sm"); el.style.transform = ""; return; } el.classList.toggle("cx-sm", !!CRUIS.mini); const m = el.querySelector(".cx-mini"); if (m) m.textContent = CRUIS.mini ? "➕ 크게" : "➖ 작게";
    const r = el.getBoundingClientRect(), vw = innerWidth, vh = innerHeight, w = r.width || 600, h = r.height || 400;
    // 화면 밖으로 나가지 않게 (위쪽 줄은 꼭 보이게)
    const mx = Math.max(0, (vw - w)/2 - 6), my = Math.max(0, (vh - h)/2 - 6);
    CRUIS.x = Math.max(-mx, Math.min(mx, CRUIS.x || 0)); CRUIS.y = Math.max(-my - 30, Math.min(my + 30, CRUIS.y || 0));
    el.style.transform = `translate(calc(-50% + ${Math.round(CRUIS.x)}px), calc(-50% + ${Math.round(CRUIS.y)}px))`; }
  function crDragInit(el){ const h = el.querySelector("[data-drag]"); let st = null;
    h.addEventListener("pointerdown", e => { if (e.target.closest("button") || crMob()) return; st = {px: e.clientX, py: e.clientY, x: CRUIS.x || 0, y: CRUIS.y || 0, id: e.pointerId}; try { h.setPointerCapture(e.pointerId); } catch(_){} el.classList.add("cx-mv"); e.preventDefault(); });
    h.addEventListener("pointermove", e => { if (!st || e.pointerId !== st.id) return; CRUIS.x = st.x + e.clientX - st.px; CRUIS.y = st.y + e.clientY - st.py;
      el.style.transform = `translate(calc(-50% + ${Math.round(CRUIS.x)}px), calc(-50% + ${Math.round(CRUIS.y)}px))`; });   // ⚡ 옮길 때는 위치만 바꿔요 (다시 그리지 않아요)
    const end = e => { if (!st) return; st = null; el.classList.remove("cx-mv"); crPlace(el); crSave(); };
    h.addEventListener("pointerup", end); h.addEventListener("pointercancel", end);
    h.addEventListener("dblclick", () => { CRUIS.x = CRUIS.y = 0; crPlace(el); crSave(); }); }
  function crRender(){ if (!crOpen) return; const D = $("#ngDom"); let el = $("#rdCr");
    if (!el){ el = document.createElement("div"); el.id = "rdCr"; el.className = "rd-cr"; D.appendChild(el);
      el.innerHTML = `<div class="cx-h" data-drag="1"><span class="cx-grip" title="끌어서 옮겨요">⠿</span><b>🧪 조합 공방</b><small>⠿ 여기를 끌어서 옮겨요 · 창을 연 채로 마당의 내 동물을 눌러 재료로 넣어요 · ➖ 작게 하면 마당이 잘 보여요</small><button data-mini="1" class="cx-mini" title="작게/크게">➖ 작게</button><button data-x class="cx-x">✕<span class="cx-lg"> 닫기</span> <small>Esc</small></button></div><div class="cx-fl"></div><div class="cx-bd"><div class="cx-ls"></div><div class="cx-dt"></div></div><div class="rd-dock" data-w="cr"></div>`;
      const stop = e => e.stopPropagation(); ["pointerdown", "pointerup", "touchstart", "touchend", "mousedown", "wheel"].forEach(ev => el.addEventListener(ev, stop, {passive: true}));   // 📱 touchend도 막아요 — 안 막으면 판이 touchend를 막아서 휴대폰에서 조합 단추가 안 눌렸어요
      crDragInit(el); crPlace(el); addEventListener("resize", () => { if (el.isConnected){ crPlace(el); crR = crD = ""; if (crOpen) crRender(); } });
      el.onclick = e => { const dk = e.target.closest("[data-dk]"); if (dk){ dockClick(dk.dataset.dk, crZ); return; } const m = e.target.closest("[data-mini]"); if (m){ CRUIS.mini = !CRUIS.mini; crSave(); crPlace(el); crR = crD = ""; crRender(); return; }
        const b = e.target.closest("[data-x],[data-f],[data-t],[data-s],[data-a]"); if (!b) return;
        if (b.dataset.x != null){ crClose(); return; } if (b.dataset.f){ crF = b.dataset.f; crR = ""; crRender(); return; }
        if (b.dataset.t){ crPickSel(b.dataset.t); return; } if (b.dataset.s != null){ crCur = +b.dataset.s; crTap(+b.dataset.s); return; }
        const a = b.dataset.a; if (a === "go") crGo(); else if (a === "auto"){ crPick = autoPick(crZ, crSel); crDest = -1; crMode = ""; crD = ""; crRender(); playS("warn"); } else if (a === "dest"){ crMode = crMode === "dest" ? "" : "dest"; crD = ""; crRender(); playS("warn"); } else if (a === "pin"){ pin = pin === crSel ? null : crSel; savePin(); crD = ""; crRender(); playS("warn"); } else if (a === "more"){ crMore = !crMore; crD = ""; crRender(); const f = crMore && el.querySelector(".cx-inf .cx-sk"); if (f) try { f.scrollIntoView({block: "nearest", behavior: "smooth"}); } catch(e){} } }; }
    const {H, ok, L} = crShown(), S = Z[crZ].s;
    if (crSel && RD_RC[crSel]) crPick = autoPick(crZ, crSel, crPick, true);   // 마당이 바뀌어 없어진 재료만 빼요 (아이가 뺀 건 다시 안 채워요)
    /* 왼쪽 목록: 가진 동물 수가 바뀔 때만 다시 그려요 (스크롤 그대로) */
    const msX = MS && MS.k === "mk" && !MS.st ? MS.x : "", sig = crF + "|" + RD_RCK.map(t => RD_RC[t].map(([k]) => H[k] || 0).join(".")).join(",") + "|" + crSel + "|" + msX + "|" + pin;
    if (sig !== crR){ crR = sig;
      const F = [["ok", `🧭 추천 순 · 지금 ${ok.length}개`], ["d", "🗡️ 딜러"], ["s", "🛡️ 서포터"], ...RD_G.map((_, g) => g).filter(g => g >= 2).map(g => [String(g), RD_G[g].n])];
      el.querySelector(".cx-fl").innerHTML = F.map(([id, n]) => `<button data-f="${id}" class="${crF === id ? "cx-on" : ""}">${n}</button>`).join("");
      el.querySelector(".cx-ls").innerHTML = L.map(t => { const A = RD_A[t], G = RD_G[A.g], J = RD_JOB[A.job], can = ok.includes(t), ki = can ? ok.indexOf(t) : -1;
        return `<div class="cx-rw ${can ? "cx-ok" : ""} ${crSel === t ? "cx-on" : ""}" data-t="${t}" style="--g:${G.c};--g2:${G.c2}"><img data-im="${t}" ${imgOf(t)} alt=""><span class="cx-nm">${A.n}<small>${G.n} · ${J.e} ${J.n} · ${RD_ROLE[A.ro].e}${!can && crMiss(t, H) <= 2 ? ` · <i>🎯 ${crMiss(t, H)}마리만 더!</i>` : ""}</small></span>${msX === t ? `<b class="cx-ms">🎯 미션</b>` : ""}${pin === t ? `<b class="cx-pn">📌</b>` : ""}
          <span class="cx-ig">${RD_RC[t].map(([k, c]) => `<span class="${(H[k] || 0) >= c ? "cx-y" : ""}">${RD_A[k].e}${c > 1 ? `<sub>${c}</sub>` : ""}</span>`).join("<i>+</i>")}</span>${ki >= 0 && ki < 9 ? `<span class="cx-k">${ki + 1}</span>` : ""}</div>`; }).join(""); }
    /* 오른쪽: 고른 조합 · 내 마당 4×4 */
    const t = crSel, A = RD_A[t], R0 = RD_RC[t]; if (!A || !R0) return;
    const G = RD_G[A.g], J = RD_JOB[A.job], RO = RD_ROLE[A.ro], can = canCraft(crZ, t, H), done = pickOK(crZ, t, crPick), dst = can ? destOf(crZ, t, crPick, crDest) : -1;
    const dsig = [t, crPick.join("."), crDest, crMode, crCur, crMore, pin, N, S.map(q => q.k ? q.k + q.n : "").join(","), can].join("|"); if (dsig === crD && !el.hidden) return; crD = dsig;
    const dt = el.querySelector(".cx-dt"); dt.style.setProperty("--g", G.c); const newT = dt.dataset.cur !== t; dt.dataset.cur = t;
    /* 🧩 조합 식: [만들 동물] = 재료 + 재료 + 재료 — 재료마다 가진 수/필요 수, 모자라면 어떻게 모으는지 한 단어로 (조합 재료는 눌러서 그 조합으로) */
    const how1 = k => { const g = RD_A[k].g; return g === 0 ? "📥 대기 줄" : g < RD_MG ? "🔀 합치기" : RD_RC[k] ? "🧪 조합 ›" : "📥 대기 줄"; };
    const fm = `<div class="cx-fm"><div class="fm-out"><img data-im="${t}" ${imgOf(t)} alt=""><b>${A.n}</b></div><i class="fm-eq">=</i>${R0.map(([k, c]) => { const h = H[k] || 0, ok = h >= c, n = crPick.filter(i => S[i] && S[i].k === k).length;
        return `<button class="fm-in ${ok ? "ok" : "no"} ${n >= c ? "in" : ""}" ${RD_RC[k] ? `data-t="${k}"` : "data-h=\"1\""} style="--g:${RD_G[RD_A[k].g].c}"><img data-im="${k}" ${imgOf(k)} alt=""><span class="fm-c">${Math.min(h, 99)}<small>/${c}</small></span><b>${RD_HBI[RD_A[k].hb].e}${RD_A[k].n}</b><em>${ok ? "✔ 준비" : how1(k)}</em></button>`; }).join(`<i class="fm-pl">+</i>`)}</div>`;
    const info = `<div class="cx-sk">🌟 ${A.sk.e} <b>${A.sk.n}</b> — ${A.sk.d}<br>💪 ${A.t}${A.job === "s" ? " · 👑 보스 💥 약점 드러내기" : ""}</div>${crGuide(t, H)}`;
    dt.classList.toggle("cx-more", crMore);
    dt.innerHTML = `<div class="cx-dl"><div class="cx-tp"><img data-im="${t}" ${imgOf(t)} alt=""><div><h3>${A.e} ${A.n} <button data-a="pin" class="cx-pin${pin === t ? " on" : ""}">${pin === t ? "📌 목표 해제" : "📌 목표로"}</button></h3><i style="--q:${G.c}">${G.n}</i><i style="--q:${J.c}">${J.e} ${J.n}</i><i style="--q:${RO.c}">${RO.e} ${RO.n}</i></div></div>
      ${fm}<button class="cx-mr" data-a="more">${crMore ? "▲ 접기" : "📖 스킬 · 만드는 길 자세히"}</button><div class="cx-inf">${info}</div></div>
      <div class="cx-dr">
      <div class="cx-nd">${R0.map(([k, c]) => { const n = crPick.filter(i => S[i] && S[i].k === k).length; return `<span class="${n >= c ? "cx-y" : ""}">${RD_A[k].e} ${RD_A[k].n} ${n}/${c}${(H[k] || 0) < c ? ` <small>(가진 것 ${H[k] || 0})</small>` : ""}</span>`; }).join("")}</div>
      <div class="cx-yh">🌱 내 마당 <small>${can ? "초록 = 재료로 쓸 동물 · 눌러서 바꿔요" : "재료가 모이면 여기서 골라요"}</small></div>
      <div class="cx-yd">${S.map((q, i) => { const use = crPick.filter(j => j === i).length, rel = q.k && R0.some(r => r[0] === q.k);
        return `<div data-s="${i}" class="${q.k ? "" : "cx-no"} ${!rel && crMode !== "dest" ? "cx-no" : ""} ${use ? "cx-use" : rel ? "cx-can" : ""} ${i === dst ? "cx-dst" : ""} ${i === crCur && kHint ? "cx-cur" : ""}">${q.k ? `<img data-im="${q.k}" ${imgOf(q.k)} alt=""><b>${q.n > 1 ? "×" + q.n : ""}</b>` : ""}${use ? `<em>✔${use > 1 ? use : ""}</em>` : ""}${i === dst ? "<u>📍</u>" : ""}</div>`; }).join("")}</div>
      <div class="cx-ac"><button data-a="auto">🔄 자동<span class="cx-lg">으로 고르기</span> <small>R</small></button><button data-a="dest" class="${crMode === "dest" ? "cx-on" : ""}">${crMode === "dest" ? "📍 칸을 눌러요" : "📍 자리<span class=\"cx-lg\"> 고르기</span>"} <small>P</small></button>
        <button data-a="go" class="cx-go" ${can && done ? "" : "disabled"}>🧪 만들기 <small>Enter</small></button></div>
      <div class="cx-tip">${!can ? `재료가 ${crMiss(t, H)}마리 모자라요 — 📥 대기 줄·🔀 합치기${N > 1 ? "·🎁 친구" : ""}로 모아요!` : !done ? "초록 칸 = 재료로 넣은 동물 · 노란 테두리 칸을 눌러 넣거나 빼요" : `✔ 준비 끝! 📍 ${Math.floor(dst/4) + 1}줄 ${dst % 4 + 1}번째 칸에 ${A.n}이(가) 생겨요`}${kHint ? `<span class="cx-kb"><br>⌨️ 방향키 칸 이동 · Space 넣기/빼기 · P 자리 · R 자동 · Enter 만들기 · 1~9 조합 고르기</span>` : ""}</div></div>`; if (newT) dt.scrollTop = 0;
    el.hidden = false; document.body.classList.toggle("rd-cr-on", el.classList.contains("cx-mb")); dockTick(); }

  /* =====================================================================
     🎛️ 빠른 행동 줄 (2026.11.18) — 🧪 조합 창 · 📖 도감을 연 채로도 📥 대기 줄·🔄 새 줄·합치기·강화·💎 보석을 다 해요
     · 게임은 멈추지 않아요 (혼자 할 때만 ⏸️ 멈춤 단추로 직접 멈춰요)
     ⚡ 금·값이 바뀔 때만 다시 그려요 (8장면에 한 번 확인)
     ===================================================================== */
  let dkSub = "", pauseU = false;
  let pin = (() => { try { const v = localStorage.getItem("arcade.rdpin"); return v && RD_RC[v] ? v : null; } catch(e){ return null; } })(), pinSig = "";
  const savePin = () => { try { pin ? localStorage.setItem("arcade.rdpin", pin) : localStorage.removeItem("arcade.rdpin"); } catch(e){} pinSig = ""; };
  const mrgN = z => Z[z].s.reduce((a, q) => a + (q.k && q.n >= 3 && RD_A[q.k].g < RD_MG ? 1 : 0), 0);
  function dockSig(z, w){ const p = Z[z]; return [w, Math.floor(p.gold), p.gems, trS(p), rrCost(z), p.up.join("."), RL(z, "cheap"), mrgN(z), crN(z), dkSub, pauseU, state].join("|"); }
  function dockHTML(z, w){ const p = Z[z], gold = Math.floor(p.gold), rc = rrCost(z), mg = mrgN(z), cn = crN(z), off = c => gold < c ? " dk-off" : "";
    const tg = (id, t) => `<button data-dk="~${id}" class="dk-b dk-t${dkSub === id ? " on" : ""}">${t} <span class="dk-car">${dkSub === id ? "▴" : "▾"}</span></button>`;
    let h = `<div class="dk-row"><span class="dk-m">💰 <b>${rdN(gold)}</b>${p.gems ? `<em>💎 ${p.gems}</em>` : ""}</span><span class="dk-tl">📥</span>
      ${Array.from({length: TRN}, (_, i) => { const o = p.tr && p.tr[i]; if (!o) return `<button class="dk-b dk-tk dk-off" disabled>⏳</button>`; const A = RD_A[o.k];
        return `<button data-dk="tk:${i}:${o.k}" class="dk-b dk-tk" style="--g:${RD_G[A.g].c}"><small>${RD_HBI[A.hb].e}</small>${A.e} ${A.n}</button>`; }).join("")}
      <button data-dk="rr" class="dk-b${off(rc)}">🔄 새 줄 <small>💰${rdN(rc)}</small></button>
      <button data-dk="all" class="dk-b${mg ? " dk-hot" : ""}">🔀 합치기${mg ? ` <i>${mg}</i>` : ""}</button>
      ${w === "book" ? `<button data-dk="cr" class="dk-b${cn ? " dk-hot" : ""}">🧪 조합${cn ? ` <i>${cn}</i>` : ""}</button>` : ""}
      ${tg("up", "⬆️ 강화")}${tg("lk", "💎 보석")}
      ${!party ? `<button data-dk="pause" class="dk-b dk-p${pauseU ? " on" : ""}">${pauseU ? "▶️ 계속" : "⏸️ 멈춤"}</button>` : ""}</div>`;
    if (dkSub === "up") h += `<div class="dk-sub">${[0, 1, 2, 3].map(i => { const c = upCost(z, i); return `<button data-dk="up:${i}" class="dk-b${off(c)}">${["⚪🔵", "🟣🟡", "🌈", "💠✨"][i]} ${RD_UPN[i]} <b>Lv${p.up[i] || 0}</b> <small>💰${rdN(c)}</small></button>`; }).join("")}</div>`;
    else if (dkSub === "lk") h += `<div class="dk-sub"><span class="dk-tip">💎 보석은 👑 보스를 잡으면 1개씩 — 아껴 써요</span><button data-dk="lk:0" class="dk-b${p.gems < 1 ? " dk-off" : ""}">💎1 보석 뽑기 <small>영웅 52% · 전설 10%</small></button><button data-dk="lk:1" class="dk-b${p.gems < 4 ? " dk-off" : ""}">💎4 큰 보석 뽑기 <small>신화 25%</small></button></div>`;
    return h; }
  function dockClick(cmd, z){ if (z == null) z = crOpen ? crZ : local[0];
    if (cmd[0] === "~"){ const id = cmd.slice(1); dkSub = dkSub === id ? "" : id; playS("warn"); }
    else if (cmd === "rr") act(z, ["rr"]);
    else if (cmd === "all") act(z, ["all"]);
    else if (cmd === "cr"){ RDB.close(); if (!crOpen) crToggle(z); }
    else if (cmd === "pause"){ if (!party){ pauseU = !pauseU; playS("warn"); } }
    else { const [a, v, v2] = cmd.split(":");
      if (a === "tk") act(z, ["tk", +v, v2]);
      else if (a === "selk" || a === "sellk"){ const S = Z[z].s; let i = -1, nb = 9; S.forEach((q, j) => { if (q.k === v && q.n < nb){ nb = q.n; i = j; } });   /* 팔 때는 가장 적게 모인 칸부터 */
        if (i < 0){ playS("no"); } else if (a === "selk"){ sel = {z, i}; grab = null; selSig = ""; playS("warn"); } else { act(z, ["sel", i]); if (sel && sel.i === i && S[i].n <= 1) sel = null; } }
      else if (a === "up") act(z, ["up", +v]);
      else if (a === "lk") act(z, ["luck", +v]);
      else if (a === "crx" && RD_RC[v]){ RDB.close(); crSel = v; if (!crOpen) crToggle(z); else crPickSel(v); }
      else if (a === "pin" && RD_RC[v]){ pin = pin === v ? null : v; savePin(); playS("warn"); RDB.isOpen && RDB.render(); } }
    dockTick(true); }
  /* 📖 도감에서 고른 동물: 내 마당에 몇 마리 · 👆 고르기 · 💰 팔기 · 📥 대기 줄에 있으면 데려오기 */
  function ownHTML(k){ const z = local[0], p = Z[z], A = RD_A[k]; if (!p || !A) return ""; const n = p.s.reduce((a, q) => a + (q.k === k ? q.n : 0), 0), v = RD_G[A.g].sell, tj = (p.tr || []).findIndex(o => o && o.k === k);
    return `<span>🐾 내 마당에 <b>${n}마리</b></span>${n ? `<button class="sel" data-dk="selk:${k}">👆 판에서 고르기</button><button data-dk="sellk:${k}">💰 1마리 팔기 +${rdN(v)}</button>` : ""}${tj >= 0 ? `<button class="tk" data-dk="tk:${tj}:${k}">📥 대기 줄에서 데려오기</button>` : ""}`; }
  let ownSig = "";
  function ownTick(){ const e = $("#mdRdBook [data-own]"); if (!e) return; const k = e.dataset.own, p = Z[local[0]]; if (!p) return;
    const sg = k + "|" + p.s.map(q => q.k === k ? q.n : 0).join("") + "|" + trS(p); if (sg === ownSig && e.dataset.sg === sg) return; holdGuard(e); if (e._hold && Date.now() - e._hold < 1500) return; ownSig = sg; e.dataset.sg = sg; e.innerHTML = ownHTML(k); }
  function dockTick(force){ if (RDB.isOpen) ownTick(); const L = []; if (crOpen){ const e = $("#rdCr .rd-dock"); if (e) L.push([e, crZ]); } if (RDB.isOpen){ const e = $("#mdRdBook .rd-dock"); if (e) L.push([e, local[0]]); }
    L.forEach(([el, z]) => { holdGuard(el); const w = el.dataset.w, sig = dockSig(z, w); if (!force && el._sig === sig) return;
      if (!force && el._hold && Date.now() - el._hold < 1500) return;   // 👆 누르는 중엔 다시 그리지 않아요(금이 바뀔 때마다 단추를 새로 만들어 '눌렀는데 안 눌리던' 문제)
      el._sig = sig; el.innerHTML = dockHTML(z, w); }); }
  function holdGuard(el){ if (el._hg) return; el._hg = 1; el.addEventListener("pointerdown", () => { el._hold = Date.now(); }, {passive: true});
    const up = () => setTimeout(() => { el._hold = 0; }, 60); ["pointerup", "pointercancel", "pointerleave"].forEach(ev => el.addEventListener(ev, up, {passive: true})); }
  /* 📌 목표 조합: 고른 동물의 재료가 몇 마리 모였는지 화면 아래 왼쪽에 늘 보여요 (누르면 조합 창) · 목표가 없으면 🧪 조합 미션 동물 */
  function pinTick(){ const D = $("#ngDom"); if (!D) return; let el = $("#rdPin"); if (SPEC){ if (el) el.hidden = true; return; }
    const z = local[0], mt = MS && MS.k === "mk" && !MS.st && RD_RC[MS.x] ? MS.x : null, t = pin || mt;
    if (!t || state !== "play" || crOpen || panel || (sel && Z[sel.z].s[sel.i].k)){ if (el && !el.hidden){ el.hidden = true; pinSig = ""; } return; }
    const H = haveOf(z), R0 = RD_RC[t], can = canCraft(z, t, H), cv = $("#ngCanvas"), r = cv.getBoundingClientRect(), s0 = r.height/H0();
    const sig = [t, !!pin, R0.map(([k]) => H[k] || 0).join("."), can, Math.round(r.left), Math.round(r.bottom), Math.round(s0*100)].join("|"); if (sig === pinSig && el && !el.hidden) return; pinSig = sig;
    if (!el){ el = document.createElement("button"); el.id = "rdPin"; el.className = "rd-pin"; D.appendChild(el);
      ["pointerdown", "pointerup", "touchstart", "touchend", "mousedown"].forEach(ev => el.addEventListener(ev, e => e.stopPropagation(), {passive: true}));
      el.onclick = () => { const tt = el.dataset.t; if (!RD_RC[tt]) return; crSel = tt; crToggle(local[0]); }; }
    el.dataset.t = t; el.classList.toggle("can", can);
    el.style.left = Math.round(r.left + 8) + "px"; el.style.bottom = Math.round(innerHeight - r.bottom + BOTH*s0 + 8) + "px";
    el.innerHTML = `<span class="pt">${pin === t ? "📌 목표" : "🎯 미션"}</span><span class="po">${RD_A[t].e} ${RD_A[t].n}</span><span class="pq">=</span>${R0.map(([k, c]) => { const h = Math.min(H[k] || 0, c); return `<span class="pi ${h >= c ? "y" : ""}">${RD_A[k].e}<small>${h}/${c}</small></span>`; }).join("")}${can ? `<span class="pg">✨ 만들 수 있어요!</span>` : ""}`;
    el.hidden = false; }
  const H0 = () => H;

  /* =====================================================================
     🐾 고른 동물 단추 줄 (2026.11.18) — 판 위에 뜨던 합치기·팔기 단추가 다른 동물을 가려서, 화면 아래(단추 줄 바로 위)에 크게 모았어요
     · 🔀 합치기 R · 🧪 조합 C · 💰 팔기 X · 💰 모두 팔기 Shift+X · ✋ 옮기기 G · 📖 도감 B · Tab 다음 동물 · Esc 닫기
     ⚡ 고른 동물이나 금이 바뀔 때만 다시 그려요
     ===================================================================== */
  let selSig = "";
  function selTick(){ const D = $("#ngDom"); if (!D) return; let el = $("#rdSel");
    const q = sel && Z[sel.z] && Z[sel.z].s[sel.i];
    /* ⬆️ 강화·💎 보석 단추판이 열려 있으면 '고른 동물' 줄을 잠깐 숨겨요 (휴대폰 세로에서 이 줄이 강화 단추를 덮어 안 눌리던 문제) */
    if (!q || !q.k || state !== "play" || crOpen || panel){ if (el && !el.hidden){ el.hidden = true; selSig = ""; } return; }
    if (RDB.isOpen && RDB.tab === "a" && RDB.cur !== q.k && isMine(sel.z)) RDB.pickK(q.k);   /* 📖 도감을 연 채로 판의 동물을 누르면 도감도 그 동물로 */
    const A = RD_A[q.k], G = RD_G[A.g], RO = RD_ROLE[A.ro], fr0 = isFront(sel.z, sel.i), v = G.sell, canM = q.n >= 3 && A.g < RD_MG, hi = A.g >= RD_MG;
    const atk = rdN(A.d*upMul(sel.z, A.g)*relMul(sel.z, A, null)*(A.ro === "r" && !fr0 ? 1.25 : 1)*(BUF && BUF[sel.z] ? BUF[sel.z][sel.i] : 1)), cv = $("#ngCanvas"), r = cv.getBoundingClientRect(), s0 = r.height/H0();
    const HB = RD_HBI[A.hb], tH = TERR(sel.z, sel.i), okH = tH === A.hb, mine = isMine(sel.z);
    const hTip = okH ? `${HB.e} 자기 땅이에요! 힘 +35%` : `${HB.e} ${HB.n} 동물인데 ${RD_HBI[tH].e} ${RD_HBI[tH].n} 칸 → 힘 -20% · ✋ ${HB.e} 칸으로 옮겨요${N > 1 && !yardH(sel.z).includes(A.hb) ? " (🎁 친구에게!)" : ""}`;
    const tip = A.ro === "m" ? (fr0 ? "⚔️ 길 바로 옆 — 딱 좋아요" : "⚠️ 길에서 멀어서 못 닿아요 → ✋ 옮기기로 길 옆(⚔️ 칸)") : A.ro === "r" ? (fr0 ? "🏹 뒷줄(🏹 칸)에 두면 공격 +25%" : "🏹 뒷줄 명사수! 공격 +25%") : "✨ 옆 친구들을 도와요";
    const sig = [sel.z, sel.i, q.k, q.n, atk, fr0, !!grab, kHint, okH, Math.round(r.left), Math.round(r.width), Math.round(r.bottom), Math.round(s0*100)].join("|"); if (sig === selSig && el && !el.hidden) return; selSig = sig;
    if (!el){ el = document.createElement("div"); el.id = "rdSel"; el.className = "rd-sel"; D.appendChild(el);
      ["pointerdown", "pointerup", "touchstart", "touchend", "mousedown"].forEach(ev => el.addEventListener(ev, e => e.stopPropagation(), {passive: true}));
      el.onclick = e => { const b = e.target.closest("[data-sa]"); if (b && !b.disabled) selDo(b.dataset.sa); }; }
    holdGuard(el); if (el._hold && Date.now() - el._hold < 1500 && !el.hidden){ selSig = ""; return; }   // 👆 누르는 중엔 그대로
    const kb = k => kHint ? `<kbd>${k}</kbd>` : "";
    /* 가로 화면: 판 옆 빈자리에 세로로 (판을 가리지 않게) · 빈자리가 좁으면 아래쪽 단추 줄 바로 위 */
    const k0 = r.width/W, bR = r.left + (BX + COLS*C)*k0, bL = r.left + BX*k0, spR = r.right - bR, spL = bL - r.left, side = Math.max(spR, spL) >= 150;
    el.classList.toggle("side", side);
    if (side){ const right = spR >= 150 || spR >= spL, w = Math.min(250, (right ? spR : spL) - 14); el.style.width = Math.round(w) + "px"; el.style.left = Math.round(right ? bR + 7 + w/2 : bL - 7 - w/2) + "px";
      el.style.bottom = Math.round(innerHeight - r.bottom + BOTH*s0 + 6) + "px"; el.style.maxHeight = Math.round((H - BOTH - TOPH - 10)*s0) + "px"; }
    else { el.style.width = document.body.classList.contains("rdb-split") ? Math.round(Math.min(620, r.width - 8)) + "px" : ""; el.style.maxHeight = ""; el.style.left = Math.round(r.left + r.width/2) + "px"; el.style.bottom = Math.round(innerHeight - r.bottom + BOTH*s0 + 6) + "px"; }
    el.style.setProperty("--g", G.c);
    el.innerHTML = `<div class="rs-hd"><img data-im="${q.k}" ${RDB.img(q.k)} alt=""><div class="rs-tx"><b>${A.e} ${A.n}${q.n > 1 ? ` <em>×${q.n}</em>` : ""}</b><small><i style="--c:${G.c}">${G.n}</i> ${RO.e} ${RO.n} · 💪 ${atk} · 🌟 ${A.sk.e} ${A.sk.n}</small><span class="rs-tip ${A.ro === "m" && !fr0 ? "bad" : ""}">${grab ? "✋ 옮길 칸을 눌러요 (같은 동물 칸이면 자리 바꾸기)" : tip}</span><span class="rs-tip ${okH ? "" : "bad"}">${hTip}</span></div>
      <button class="rs-x" data-sa="x" title="닫기">✕${kb("Esc")}</button></div>
      ${N > 1 && mine ? `<div class="rs-gv"><span>🎁 친구에게 1마리</span>${Z.map((_, z2) => z2 === sel.z ? "" : `<button data-sa="give:${z2}" style="--c:${RD_PC[z2]}"${yardH(z2).includes(A.hb) ? ' class="fit"' : ""}>${z2 + 1}P ${yardH(z2).map(h => RD_HBI[h].e).join("")} <small>${esc(nameOf(noOf_(SIDS[z2])))}</small></button>`).join("")}</div>` : ""}
      <div class="rs-bt">${hi ? `<button data-sa="cr" class="rs-go">🧪 조합${kb("C")}<small>영웅부터는 조합으로</small></button>`
        : `<button data-sa="mrg" class="rs-go" ${canM ? "" : "disabled"}>🔀 합치기${kb("R")}<small>${canM ? "3마리 → 한 등급 위!" : `3마리 모이면 (지금 ${q.n})`}</small></button>`}
        <button data-sa="sel" class="rs-sell">💰 팔기${kb("X")}<small>+${v}</small></button>
        ${q.n > 1 ? `<button data-sa="sela" class="rs-sell">💰 모두 팔기${kb("⇧X")}<small>+${v*q.n}</small></button>` : ""}
        <button data-sa="mov" class="${grab ? "on" : ""}">✋ ${grab ? "취소" : "옮기기"}${kb("G")}</button>
        <button data-sa="book">📖 도감${kb("B")}</button></div>
`;
    el.hidden = false; }
  function selDo(a){ if (!sel) return; const z = sel.z, q = Z[z].s[sel.i];
    if (a === "x"){ sel = null; grab = null; }
    else if (a === "mrg") act(z, ["mrg", sel.i]);
    else if (a === "cr"){ crF = q && q.k ? "ok" : crF; const u = q && q.k && RD_USE[q.k]; if (u) crSel = u[0]; crToggle(z); }
    else if (a === "sel"){ act(z, ["sel", sel.i]); if (!q.k || q.n <= 1) sel = null; }
    else if (a === "sela"){ act(z, ["sela", sel.i]); sel = null; }
    else if (a === "mov"){ grab = grab ? null : {z, i: sel.i}; playS(grab ? "sum" : "warn"); }
    else if (a === "book"){ RDB.open(q && q.k); }
    else if (a.startsWith("give:")){ act(z, ["give", sel.i, +a.slice(5)]); if (!q.k || q.n <= 1) sel = null; }
    selSig = ""; selTick(); }
  /* 🎒 가방 아이템 단추 (누르면 바로 써요) */
  function bagIcons(){ const L = []; BARS.forEach(b => { if (!b.bag) return; const p = Z[b.z], n = Math.max(1, p.it.length), s = Math.min(b.h - 12, (b.w - 10)/Math.min(n, 5) - 6);
    p.it.slice(0, 5).forEach((k, i) => L.push({id: "it", z: b.z, i, k, x: b.x + 6 + i*(s + 6), y: b.y + (b.h - s)/2, w: s, h: s})); }); return L; }
  function bagDraw(g){
    BARS.forEach(b => { if (b.bag && !Z[b.z].it.length) G2.put(g, lbl(["보스·미션에서 받아요"], 13, "#bfb3e8"), b.x + 8, b.y + b.h/2 - 12); });
    bagIcons().forEach(b => { if (!RD_IT[b.k]) return; const s = Math.round(b.w); G2.put(g, sp(`it${b.k}${s}`, s, s + 4, t => { t.fillStyle = "rgba(0,0,0,.3)"; rrect(t, 0, 4, s, s, s*.25); t.fill();
      t.fillStyle = BSA.lg(t, 0, 0, 0, s, [[0, "#fff6d6"], [1, "#ffc94d"]]); rrect(t, 0, 0, s, s, s*.25); t.fill(); t.strokeStyle = "#fff"; t.lineWidth = 2; t.stroke(); G2.emo(t, RD_IT[b.k].e, s/2, s/2, s*.6); }), b.x, b.y); });
    local.forEach(z => { const p = Z[z]; if (p.fev > 0 || p.clv > 0){ const b = BARS.find(q => q.bag && q.z === z); if (b) G2.put(g, lbl([...(p.fev > 0 ? ["🔥", `${Math.ceil(p.fev/60)}초`] : []), ...(p.clv > 0 ? ["🍀", `×${p.clv}`] : [])], 13, "#ffd8a8"), b.x + b.w - 92, b.y - 18); } });
  }
  /* 🎁 유물 고르기 카드 (보스를 잡으면) */
  function pickCards(){ const L = []; if (SPEC) return L; local.forEach((z, si) => { const p = Z[z]; if (!p.pick) return; const two = local.length >= 2;
    const ax = two && land ? si*W/2 : 0, aw = two && land ? W/2 : W, ay = two && !land ? TOPH + si*(H - TOPH - BOTH)/2 : TOPH, ah = two && !land ? (H - TOPH - BOTH)/2 : H - TOPH - BOTH;
    const cw = Math.min(230, (aw - 60)/3), ch = Math.min(ah - 110, cw*1.25), y = ay + (ah - ch)/2 + 22;
    p.pick.forEach((k, j) => L.push({id: "rel", z, i: j, k, x: ax + aw/2 + (j - 1)*(cw + 14) - cw/2, y, w: cw, h: ch, ax, aw, ay, ah})); }); return L; }
  /* 🎁 유물 카드 (2026.11.19 화려하게): 뒷면 → 휙 뒤집히며 앞면 · 등급마다 다른 색(보통·희귀·전설·신비) · 뒤에서 빙글 도는 빛줄기 · 반짝 지나가는 광택 · 둥실둥실
     ⚡ 카드 그림은 한 번 그려 두고(스프라이트) 움직임만 매 장면 계산해요 */
  const pkT = {};
  function relFront(k, s, hh){ const R0 = RD_REL[k], RR = RD_RR[R0.r || 1];
    return sp(`rc2${k}${s}x${hh}`, s, hh + 6, t => {
      t.fillStyle = "rgba(0,0,0,.4)"; rrect(t, 0, 6, s, hh, 20); t.fill();
      if (R0.r === 4){ const gr = t.createLinearGradient(0, 0, s, hh); ["#ff6b9a", "#ffa94d", "#ffe066", "#69db7c", "#4dabf7", "#b197fc"].forEach((c, i, a) => gr.addColorStop(i/(a.length - 1), c)); t.fillStyle = gr; }
      else t.fillStyle = BSA.lg(t, 0, 0, 0, hh, [[0, RR.c], [1, RR.a]]);
      rrect(t, 0, 0, s, hh, 20); t.fill();
      t.fillStyle = BSA.lg(t, 0, 0, 0, hh, [[0, RR.a], [1, RR.b]]); rrect(t, 6, 6, s - 12, hh - 12, 15); t.fill();
      t.fillStyle = BSA.rg(t, s/2, hh*.3, 2, s*.5, [[0, R0.r >= 3 ? "rgba(255,240,160,.85)" : "rgba(255,255,255,.45)"], [1, "rgba(255,255,255,0)"]]); t.fillRect(0, 0, s, hh*.62);
      t.globalAlpha = .18; t.fillStyle = "#fff"; for (let n = 0; n < 14; n++){ const x = (n*53 % 97)/97*s, y = (n*31 % 89)/89*hh*.55 + 10; RDA.star(t, x, y, 2 + n % 3, 4, .4); t.fill(); } t.globalAlpha = 1;
      t.strokeStyle = R0.r === 4 ? "#fff" : RR.c; t.lineWidth = 3; rrect(t, 6, 6, s - 12, hh - 12, 15); t.stroke();
      const rb = `${"★".repeat(R0.r || 1)} ${RR.n}`; t.font = `${Math.max(12, Math.min(15, s*.07))}px "Jua",sans-serif`; const rw = t.measureText(rb).width + 18;
      t.fillStyle = R0.r === 4 ? "#fff" : RR.c; rrect(t, s/2 - rw/2, 14, rw, 22, 11); t.fill(); t.fillStyle = R0.r === 4 ? "#ae3ec9" : RR.b; t.textAlign = "center"; t.textBaseline = "middle"; t.fillText(rb, s/2, 26);
      G2.emo(t, R0.e, s/2, hh*.33, Math.min(s, hh)*.3); outlinedRaw(t, R0.n, s/2, hh*.57, Math.min(24, s*.11), "#fff");
      t.fillStyle = "#f3f0ff"; t.font = `${Math.min(15, s*.072)}px "Jua",sans-serif`;
      const words = R0.d.split(" "), lines = []; let cur = ""; words.forEach(w0 => { const tt = cur ? cur + " " + w0 : w0; if (t.measureText(tt).width > s - 28){ lines.push(cur); cur = w0; } else cur = tt; }); if (cur) lines.push(cur);
      lines.slice(0, 3).forEach((l, i) => t.fillText(l, s/2, hh*.69 + i*Math.min(19, s*.088))); }); }
  function relBack(r, s, hh){ const RR = RD_RR[r];
    return sp(`rcb${r}${s}x${hh}`, s, hh + 6, t => { t.fillStyle = "rgba(0,0,0,.4)"; rrect(t, 0, 6, s, hh, 20); t.fill();
      t.fillStyle = BSA.lg(t, 0, 0, s, hh, [[0, "#3b2a8f"], [1, "#160d40"]]); rrect(t, 0, 0, s, hh, 20); t.fill(); t.strokeStyle = RR.c; t.lineWidth = 5; t.stroke();
      t.strokeStyle = "rgba(255,255,255,.12)"; t.lineWidth = 2; for (let x = -hh; x < s; x += 18){ t.beginPath(); t.moveTo(x, 0); t.lineTo(x + hh, hh); t.stroke(); }
      t.fillStyle = BSA.rg(t, s/2, hh/2, 2, s*.45, [[0, RR.c], [1, "rgba(0,0,0,0)"]]); t.fillRect(0, 0, s, hh); G2.emo(t, "🎁", s/2, hh/2, s*.38); }); }
  function pickDraw(g){ const L = pickCards(); if (!L.length) return; const done = new Set(), fr = NG.frame;
    [0, 1].forEach(pass => L.forEach(b => {   // 1번째: 어두운 배경·빛줄기 · 2번째: 카드 (빛줄기가 옆 카드를 덮지 않게)
      const p = Z[b.z], key = p.pick.join(","); if (!pkT[b.z] || pkT[b.z].key !== key){ pkT[b.z] = {key, f: fr}; sfx("big"); }
      const t0 = fr - pkT[b.z].f;
      if (pass === 0 && !done.has(b.z)){ done.add(b.z); const a = Math.min(1, t0/14);
        g.fillStyle = `rgba(10,5,30,${.8*a})`; g.fillRect(b.ax, b.ay, b.aw, b.ah);
        const gx = b.ax + b.aw/2, gy = b.y + b.h/2, rr = Math.max(b.aw, b.ah)*.6;
        g.save(); g.globalAlpha = .55*a; const gr = g.createRadialGradient(gx, gy, 10, gx, gy, rr); gr.addColorStop(0, "rgba(255,212,59,.45)"); gr.addColorStop(1, "rgba(255,212,59,0)"); g.fillStyle = gr; g.fillRect(b.ax, b.ay, b.aw, b.ah); g.restore();
        }
      if (pass === 1 && b.i === 0){ const gx = b.ax + b.aw/2, sc = 1 + .06*Math.sin(fr*.08); g.save(); g.translate(gx, b.y - 34); g.scale(sc*Math.min(1, .4 + t0/20), sc*Math.min(1, .4 + t0/20)); outlined(g, "🎁 유물을 하나 골라요!", 0, 0, land ? 36 : 30, "#ffe066"); g.restore(); }
      const R0 = RD_REL[b.k], RR = RD_RR[R0.r || 1], lv = RL(b.z, b.k), s = Math.round(b.w), hh = Math.round(b.h);
      const tc = t0 - 10 - b.i*9, ph = Math.max(0, Math.min(1, tc/22));   // 카드마다 차례로 뒤집혀요
      if (tc < 0) return;
      const bob = ph >= 1 ? Math.sin(fr*.06 + b.i*1.7)*4 : 0, cxm = b.x + s/2, cym = b.y + hh/2 + bob;
      /* 뒤에서 빙글 도는 빛줄기 (전설·신비는 더 크게) */
      if (pass === 0){ if (ph > .5){ const A0 = Math.min(1, (ph - .5)*2), n = R0.r >= 3 ? 12 : 8, L0 = Math.max(s, hh)*(R0.r >= 3 ? .9 : .7); g.save(); g.translate(cxm, cym); g.rotate(fr*.012*(b.i % 2 ? -1 : 1)); g.globalAlpha = (R0.r >= 3 ? .75 : .5)*A0;
        const gr = g.createRadialGradient(0, 0, 0, 0, 0, L0); gr.addColorStop(0, RR.c); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr;
        for (let k = 0; k < n; k++){ g.rotate(Math.PI*2/n); g.beginPath(); g.moveTo(0, 0); g.lineTo(-L0*.11, -L0); g.lineTo(L0*.11, -L0); g.closePath(); g.fill(); } g.restore(); } return; }
      /* 휙 뒤집기: 앞 절반은 뒷면이 좁아지고, 뒤 절반은 앞면이 넓어져요 (살짝 튕기며 커져요) */
      const back = ph < .5, wk = back ? 1 - ph*2 : (ph - .5)*2, pop = back ? 1 : 1 + .12*Math.sin(Math.min(1, wk)*Math.PI), cw = Math.max(1, s*wk*pop), ch2 = (hh + 6)*pop;
      G2.put(g, back ? relBack(R0.r || 1, s, hh) : relFront(b.k, s, hh), cxm - cw/2, cym - ch2/2 + 3, cw, ch2);
      if (back || wk < 1) return;
      /* 반짝 지나가는 광택 */
      const sw = ((fr + b.i*40) % 150)/150; if (sw < .5){ const sx2 = b.x - s*.4 + sw*2*(s*1.8); g.save(); rrect(g, b.x, cym - hh/2, s, hh, 20); g.clip(); g.globalAlpha = .35; g.fillStyle = "#fff"; g.beginPath(); g.moveTo(sx2, cym - hh/2); g.lineTo(sx2 + s*.18, cym - hh/2); g.lineTo(sx2 - s*.12, cym + hh/2); g.lineTo(sx2 - s*.3, cym + hh/2); g.closePath(); g.fill(); g.restore(); }
      /* 전설·신비: 둘레에 반짝이는 별 */
      if (R0.r >= 3) for (let k = 0; k < 6; k++){ const a = fr*.02 + k*Math.PI/3, tw = .5 + .5*Math.sin(fr*.15 + k*2); g.globalAlpha = tw; g.fillStyle = R0.r === 4 ? ["#ff6b9a", "#ffe066", "#69db7c", "#4dabf7", "#b197fc", "#fff"][k] : "#fff3bf";
        RDA.star(g, cxm + Math.cos(a)*s*.62, cym + Math.sin(a)*hh*.56, 5 + 3*tw, 4, .35); g.fill(); g.globalAlpha = 1; }
      G2.put(g, lbl([lv ? `지금 Lv.${lv} → ${lv + 1}` : "새 유물!", local.length < 2 ? `[${b.i + 1}]` : ""].filter(Boolean), 14, "#ffe066"), b.x + 16, cym + hh/2 - 32); }));
  }
  function popsDraw(g){
    panelBtns().forEach(b => { const p = Z[b.z];
      if (b.id === "up"){ const nm = ["⚪🔵", "🟣🟡", "🌈", "🔥🌟"][b.i], c = upCost(b.z, b.i), lv = p.up[b.i] || 0, have = p.s.reduce((a, q) => a + (q.k && upTier(RD_A[q.k].g) === b.i ? q.n : 0), 0);
        G2.put(g, btnSpr(Math.round(b.w), b.h, b.i === 3 ? "#66d9e8" : "#74c0fc", b.i === 3 ? "#0b7285" : "#1864ab", [...splitE(nm), RD_UPN[b.i], `Lv${lv}`, "💰", rdN(c)], 17, p.gold < c), b.x, b.y);
        if (kHint) { const l = lbl([String(b.i + 1)], 13, "#3b2a00"); g.fillStyle = "#ffd43b"; rrect(g, b.x + 6, b.y + 6, l.w + 8, l.h + 2, 7); g.fill(); G2.put(g, l, b.x + 10, b.y + 7); }
        if (have){ const l = lbl([`내 동물 ${have}`], 12, "#d0ebff"); G2.put(g, l, b.x + b.w - l.w - 8, b.y + b.h - l.h - 4); } }
      else { const c = b.i ? 4 : 1; G2.put(g, btnSpr(Math.round(b.w), b.h, "#e599f7", "#862e9c", b.i ? ["🌈", "신화 25%·전설", "💎", "4"] : ["🎁", "영웅 52%·전설 10%", "💎", "1"], 17, p.gems < c), b.x, b.y); } });
    selBtns().forEach(b => { const q = Z[sel.z].s[sel.i]; if (!q.k) return;
      if (b.id === "smrg") G2.put(g, btnSpr(b.w, b.h, "#69db7c", "#2b8a3e", RD_A[q.k].g >= RD_MG ? ["🧪", kHint ? "조합 C" : "조합으로"] : ["🔀", kHint ? "합치기 R" : "합치기"], 17, b.off && RD_A[q.k].g < RD_MG), b.x, b.y);
      else G2.put(g, btnSpr(b.w, b.h, "#ff8787", "#c92a2a", ["💰", `팔기${kHint ? " X" : ""} +${RD_G[RD_A[q.k].g].sell}`], 16), b.x, b.y); });
    if (false && sel){ const q = Z[sel.z].s[sel.i]; if (q.k){ const A = RD_A[q.k], RO = RD_ROLE[A.ro], fr0 = isFront(sel.z, sel.i), [x, y] = slotXY(sel.z, sel.i);
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
    for (const b of BARS){ if (b.id === "trb" && inR(b, x, y)) return; }   // 📥 카드 사이 틈을 눌러도 판이 반응하지 않게
    panel = null;
    if (CAM.can){ const cb = camBtn(); if (inR(cb, x, y)){ camToggle(); return; }
      if (zoomed()){ const m = mmRect(); if (inR(m, x, y)){ camTo((x - m.x)/m.w*COLS, (y - m.y)/m.h*ROWS); playS("warn"); return; } } }
    if (y < TOPH || y > H - BOTH) return;   // 👆 위 막대·아래 단추 줄 사이 틈으로 그 밑의 맵이 눌리지 않게
    const s = slotAt(x, y);
    if (SPEC){ pan = {id, sx: x, sy: y, fx: CAM.fx, fy: CAM.fy, mv: false, s}; return; }   // 👀 관전: 끌면 맵 움직이기 · 톡 = 그 친구 보기
    if (zoomed() && (!s || !isMine(s.z)) && !crOpen && !grab){ pan = {id, sx: x, sy: y, fx: CAM.fx, fy: CAM.fy, mv: false, s}; return; }   // 🔍 빈 땅을 끌면 맵 움직이기 (톡 = 원래처럼)
    if (crOpen){   // 🧪 조합 창을 연 채로 마당을 눌러도 돼요: 내 동물 = 재료 넣기/빼기 (📍 모드면 만들 자리)
      if (s && s.z === crZ){ crCur = s.i; crTap(s.i); } return; }
    if (grab && s && s.z === grab.z){ if (s.i !== grab.i){ act(grab.z, ["mov", grab.i, s.i]); playS("merge"); } sel = {z: s.z, i: s.i}; grab = null; return; }   // ✋ 옮기기: 다음에 누른 칸으로
    if (grab && !s){ grab = null; }
    if (emPick && !s){ emClose(); }
    if (s && isMine(s.z)){ emClose(); ptr.set(id, {sx: x, sy: y}); drag = {z: s.z, i: s.i, x, y, on: false, id}; return; }
    // 💬 같이 할 때: 빈 땅을 누르면 이모티콘·말풍선 고르기
    if (N > 1 && !s && !sel && x > BX && x < BX + COLS*C && y > BY && y < BY + ROWS*C){ emOpen((x - BX)/C, (y - BY)/C); return; }
    sel = null;
  }
  /* 👆 (2026.11.18) 손가락이 살짝 떨려도 '톡'으로 알아들어요: 화면에서 18px 넘게 움직여야 끌기 (예전엔 판 기준 14칸 → 휴대폰에선 7px만 움직여도 끌기가 돼서 눌러도 안 골라졌어요) */
  const dragTh = () => Math.max(14, 18/Math.max(.2, NG.s || 1));
  function move(x, y, id){ if (pan && pan.id === id){ const dx = x - pan.sx, dy = y - pan.sy; if (!pan.mv && Math.hypot(dx, dy) > dragTh()) pan.mv = true; if (pan.mv && zoomed()) camTo(pan.fx - dx/C, pan.fy - dy/C); return; }
    if (!drag || drag.id !== id) return; drag.x = x; drag.y = y; const p = ptr.get(id); if (p && Math.hypot(x - p.sx, y - p.sy) > dragTh() && Z[drag.z].s[drag.i].k) drag.on = true; }
  function up(x, y, id){ if (pan && pan.id === id){ const p0 = pan; pan = null; if (p0.mv) return; if (SPEC){ if (p0.s) follow(p0.s.z); return; }
      if (emPick){ emClose(); return; } if (p0.s){ sel = null; return; } if (N > 1 && !sel && x > BX && x < BX + COLS*C && y > BY && y < BY + ROWS*C){ emOpen((x - BX)/C, (y - BY)/C); return; } sel = null; return; }
    if (!drag || drag.id !== id) return; const d = drag; drag = null; ptr.delete(id);
    if (d.on && (slotAt(x, y) || {}).i === d.i && (slotAt(x, y) || {}).z === d.z) d.on = false;   // 같은 칸에서 떼면 '톡'
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
      if (kit.hero){ const k = pick(2), i = placeH(z, k); if (i >= 0) popAt(z, i, `🦸 ${RD_A[k].e} ${RD_A[k].n}!`, RD_G[2].c); }
      if (kit.legend){ const k = pick(3), i = placeH(z, k); if (i >= 0) popAt(z, i, `🌟 ${RD_A[k].e} ${RD_A[k].n}!`, RD_G[3].c); }
      const P = p.pk, bits = [];
      if (P.level > 1) bits.push(`🎓 Lv.${P.level}`);
      if (P.atk) bits.push(`💪+${P.atk*4}%`); if (P.spd) bits.push(`⚡+${P.spd*3}%`);
      if (kit.items.length) bits.push(`🎒 ${kit.items.map(k => RD_IT[k].e).join("")}`);
      if (kit.rare) bits.push("👑 희귀 이상이 더 자주"); if (kit.hero) bits.push("🦸 영웅"); if (kit.legend) bits.push("🌟 전설");
      if (bits.length) msg.push((N > 1 ? nameOf(noOf_(SIDS[z])) + " " : "") + bits.join(" · "));
    });
    gv++;
    if (msg.length) banner = {t: "🏪 준비 완료!", s: msg.join("  /  ").slice(0, 90), k: 150, c: "#ffe066"};
  }
  /* 지금 판 통째로 (💾 저장 · 👑 방장 넘기기에 같이 써요) */
  function pack(){
    if (!Z || ended || state !== "play" || wave < 1) return null;
    return {v: 2, at: Date.now(), sids: SIDS, local, seed, rs: R.get(), wave, waveT, spawnLeft, spawnT, score, kills, bossK, eid, speed, bossTimer, laneRR, MS, TB,
      Z: Z.map(p => Object.assign({}, p, {s: p.s.map(q => ({k: q.k, n: q.n, cd: [0, 0, 0], hit: 0}))})),
      E: E.map(e => ({id: e.id, kind: e.kind, l: e.l, d: e.d, tr: e.tr, hp: e.hp, mhp: e.mhp, spd: e.spd, slT: e.slT, slF: e.slF, stT: e.stT, f: e.f, tt: e.tt || 0, sh: e.sh || 0, bnT: e.bnT || 0, bnD: e.bnD || 0}))};
  }
  function saveGame(){
    if (party) return; const d = pack(); if (!d) return;
    try { localStorage.setItem(SKEY, JSON.stringify(d)); } catch(e){}
  }
  function loadGame(D){
    try {
      seed = D.seed; R.seed(D.rs); wave = D.wave; waveT = D.waveT; spawnLeft = D.spawnLeft; spawnT = D.spawnT; score = D.score; kills = D.kills; bossK = D.bossK; eid = D.eid; speed = D.speed || 1; bossTimer = D.bossTimer; laneRR = D.laneRR || 0; MS = D.MS || null; TB = D.TB || [];
      D.Z.forEach((p, z) => { if (Z[z]){ Object.assign(Z[z], p); while (Z[z].up.length < 4) Z[z].up.push(0); } });
      remap(); layerKey = ""; setSky();
      E = D.E.map(e => { const p0 = posAt(e.d, e.l || 0); return Object.assign({}, e, {x: p0[0], y: p0[1]}); });
      calcLimit(); E.forEach(e => { if (e.tt) TTS.add(e.tt); }); for (let k = 1; k <= 6; k++) if (wave >= [0, 12, 20, 35, 50, 100, 150][k] + 3) TTS.add(k);
      gv++; banner = {t: `▶ ${wave}단계부터 이어하기!`, s: "저번에 하던 그대로예요", k: 120, c: "#69db7c"};
      return true;
    } catch(e){ console.error(e); return false; }
  }
  let saveT = 0; const onHide = () => { if (NG.cur === self) saveGame(); };
  const self = {
    get W(){ return W; }, get H(){ return H; }, maxSteps: 2, get maxPx(){ return Math.min(rdPx, party === "guest" ? 1.15e6 : 1.5e6); }, full: true, layout, save: saveGame, pack,
    get dbg(){ return {Z, E, wave, waveT, state, score, kills, BARS, N, LIMIT, gv, PR, FX, panel, panelBtns, bagIcons, slotXYpx: (z, i) => { const [x, y] = slotXY(z, i); return [cx(x) + C/2, cy(y) + C/2]; }, dz: DMGZ, cam: () => ({local: local.slice(), BX, BY, C, CAM: Object.assign({}, CAM), zoomed: zoomed()})}; },
    cheat(o){ if (o.rel){ Z.forEach(p => Object.assign(p.rel, o.rel)); gv++; } if (o.it) Z.forEach(p => { p.it = o.it.slice(); }); if (o.pick) Z.forEach((p, z) => offerRel(z)); if (o.gold != null) Z.forEach(p => p.gold = o.gold); if (o.gems != null) Z.forEach(p => p.gems = o.gems); if (o.wave != null){ wave = o.wave - 1; startWave(); } if (o.put){ placeK(o.z || 0, o.put); } if (o.clear) E = []; },
    init(){
      document.body.classList.remove("rd-cr-on");
      seed = O.seed || (Math.floor(Math.random()*1e9) + 1); R.seed(seed);
      Z = SIDS.map(() => mkZone()); E = []; PR = []; FX = []; TB = []; MS = null; wave = 0; waveT = 0; spawnLeft = 0; spawnT = 0; state = "play"; overT = 0; score = 0; kills = 0; bossK = 0; eid = 0; gv = 1; speed = 1; banner = null; sel = null; drag = null; ptr = new Map(); panel = null; EM = []; emPick = null; NQ = []; outbox = []; aseq = 0; lastAct = SIDS.map(() => 0); ended = false; frame = 0;
      setSky();
      const RES = (party === "host" && O.mig) || (!party && O.resume ? RDS.get(SIDS) : null);
      if (RES && loadGame(RES)){ /* 이어하기 · 👑 새 방장이 이어받기 */
        if (O.mig){ lastAct = Z.map(p => p.ack || 0); banner = {t: "👑 내가 새 방장이 됐어요!", s: "하던 판 그대로 이어서 지켜요", k: 150, c: "#ffe066"}; NQ.push(["b", banner.t, `${nameOf(noOf_(SIDS[local[0]]))} 기기가 이어받았어요 · 그대로 계속!`, banner.k, banner.c]); } }
      else if (party !== "guest"){ startWave(); Z.forEach((p, z) => { [0, 1].forEach(() => placeH(z, pick(0))); p.tr = [0, 1, 2].map(i => ({k: trayRoll(z), t: i - 10})); }); applyKit(); }
      else { wave = 1; }
      if (party) PARTY.attach(self, gridMsg);
      if (!party){ document.addEventListener("visibilitychange", onHide); window.addEventListener("pagehide", onHide); }
      const jobs = RD_K.map(k => () => { unitSpr(k, Math.round(C*.62)); unitSpr(k, Math.round(C*.62*.78)); });
      const run = dl => { if (NG.cur !== self) return; do { const j = jobs.shift(); if (!j) return; j(); } while (dl && dl.timeRemaining && dl.timeRemaining() > 6); (window.requestIdleCallback || setTimeout)(run, {timeout: 300}); };
      (window.requestIdleCallback || setTimeout)(run, {timeout: 300});
    },
    slotPt(z, i){ const [x, y] = slotXY(z, i); return [cx(x), cy(y)]; },   // (시험·도우미) 칸 가운데 판 좌표
    dockClick, ownHTML, rdInfo(){ const z = local[0]; return {rc: rrCost(z), tw: trayW(z), wave, gold: Z[z].gold, gems: Z[z].gems, H: haveOf(z), pin, yh: yardH(z), N}; },
    /* 🧪 (시험·도우미) 빠른 계산 · 행동 · 땅 */
    T: {sim: () => sim(), act: (z, a) => doAct(z, a), terr: (z, i) => TERR(z, i), front: (z, i) => isFront(z, i), hbc: () => HBC, trayW, buf: () => BUF, crList, upCost, rrCost, bestTk, set hpk(v){ HPK = v; }, set nrm(v){ NRM = v; }, set rmp(v){ RMP = v; }, E: () => E, LIMIT: () => LIMIT, get state(){ return state; }, get wave(){ return wave; }},
    apply, dropIdx(i){ /* 나간 친구 자리의 동물은 그대로 싸워요 */ },
    end(w, ws, m){ if (party !== "guest" || ended) return; ended = true; if (m){ score = m.score; wave = m.wave; kills = m.kills; }
      if (SPEC){ $("#ngOver").innerHTML = `<div class="ng-box"><h3>👀 이번 판 끝!</h3><div class="sc">${(score || 0).toLocaleString()}점</div><div class="info"><div>🏁 <b>${wave}단계</b>까지 · 👾 몬스터 ${kills}마리 · 👥 ${N}명이 함께 지켰어요</div><div style="margin-top:6px">⏳ 친구들이 <b>한 판 더</b> 하면 바로 이어서 보여 줘요!</div></div><div class="arc-row"><button class="arc-btn" data-rd="home">🏠 그만 보기</button></div></div>`;
        $("#ngOver").hidden = false; NG.ended = true; $("#ngOver").onclick = e => { const b = e.target.closest("[data-rd]"); if (b){ e.stopPropagation(); PARTY.leave(); NG.close(); } }; return; }
      RDM.guestOver(score, wave, kills); },
    spec: SPEC,
    step(){
      BARS = bars();
      if (banner && banner.k > 0 && banner.k < 900) banner.k--;
      if (party === "guest"){ guestStep(); return; }
      // 친구 기기에서 온 손가락
      if (party === "host") for (let z = 1; z < N; z++){ if (!remote(z)) continue; const r = PARTY.remoteIn(z); if (!r) continue; const m = r.m; if (m.sd !== seed || !m.a) continue;
        m.a.forEach(a => { if (a[0] > lastAct[z]){ lastAct[z] = a[0]; doAct(z, a.slice(1)); } }); Z[z].ack = lastAct[z]; }
      if (state === "over"){ RDS.del(SIDS); if (--overT <= 0) finish(); }
      else if (!(pauseU && !party)) for (let i = 0; i < speed; i++){ const p0 = PR.length; sim(); if (i < speed - 1 && PR.length > p0 + 4) PR.length = p0 + 4; }   // ⚡ 빨리 감기: 총알 그림은 마지막 한 번만 다 그려요 (계산은 그대로)
      if (!party && state === "play" && ++saveT % 180 === 0) saveGame();
      emStep();   // 📖 도감 보는 동안 잠깐 멈춤 (혼자·둘이)
      /* 📡 친구 기기로 보내기: 화면 장면 수로 세요 (예전엔 게임 계산 횟수로 세서, 2·4배속에서 홀수 칸에 걸리면 영영 안 보내져 친구 화면이 멈췄어요) */
      if (party === "host" && ++netT >= (N >= 4 || E.length > 120 ? 6 : 4)){ netT = 0; PARTY.sendSnap(snap(), NQ.splice(0), gv); }
      if (NQ.length > 400) NQ.splice(0, NQ.length - 400);   // 혹시 못 보낸 알림이 쌓여도 기기가 무거워지지 않게
    },
    draw, down, move, up,
    key(code, d, e){
      const KEYS = ["Space", "Enter", "KeyM", "KeyQ", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "KeyL", "KeyF", "KeyE", "KeyV", "KeyZ", "KeyB", "KeyC", "KeyX", "KeyR", "KeyG", "KeyP", "KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Escape", "Tab"];
      if (!d || (e && e.repeat && !/^Arrow|^Key[WASD]$/.test(code))) return KEYS.includes(code);
      if (!kHint){ kHint = true; bV = ""; }
      if (SPEC){ if (code === "KeyZ" && CAM.can) camToggle(); else if (/^Digit[1-6]$/.test(code)) follow(+code[5] - 1); else if (code === "KeyB" || code === "Escape"){ if (RDB.isOpen) RDB.close(); else if (code === "KeyB") RDB.open(); } return true; }   // 👀 관전: 보기 키만
      if (RDB.isOpen && (code === "KeyB" || code === "Escape")){ RDB.close(); return true; }   // 📖 도감을 연 채로도 다른 키는 게임에 그대로
      const two = local.length >= 2, z1 = local[0], z2 = two ? local[1] : local[0];
      /* 🧪 조합 창: 숫자 = 그 번호 조합 만들기 · C/Esc = 닫기 */
      if (crOpen){ if (code === "Escape" && crMode){ crMode = ""; crD = ""; crRender(); return true; } if (code === "KeyC" || code === "Escape"){ crClose(); return true; }
        if (/^Digit[1-9]$/.test(code)){ const ok = crShown().ok, t = ok[+code[5] - 1]; if (t) crPickSel(t); else playS("no"); return true; }
        const CD = {ArrowUp: -4, KeyW: -4, ArrowDown: 4, KeyS: 4, ArrowLeft: -1, KeyA: -1, ArrowRight: 1, KeyD: 1}[code];
        if (CD != null){ const r = Math.floor(crCur/4), c = crCur % 4; if (Math.abs(CD) === 1) crCur = r*4 + Math.max(0, Math.min(3, c + CD)); else crCur = Math.max(0, Math.min(15, crCur + CD)); crD = ""; crRender(); return true; }
        if (code === "Space"){ crTap(crCur); return true; } if (code === "Enter"){ crGo(); return true; }
        if (code === "KeyP"){ crMode = crMode === "dest" ? "" : "dest"; crD = ""; crRender(); return true; }
        if (code === "KeyR"){ crPick = autoPick(crZ, crSel); crDest = -1; crMode = ""; crD = ""; crRender(); return true; }
        return true; }
      if (code === "KeyC"){ crToggle(z1); return true; }
      if (code === "KeyP" && !party){ pauseU = !pauseU; playS("warn"); return true; }   // ⏸️ 혼자·둘이: 잠깐 멈춤
      /* 🎯 방향키·WASD로 내 마당 4×4 칸 고르기 → R 합치기 · X 팔기 · G 집어서 옮기기 */
      const DIR = {ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1], ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0]}[code];
      if (DIR){ if (!sel || sel.z !== z1) sel = {z: z1, i: 0}; else { const r = Math.floor(sel.i/4), c = sel.i % 4, nr = Math.max(0, Math.min(3, r + DIR[1])), nc = Math.max(0, Math.min(3, c + DIR[0])); sel = {z: z1, i: nr*4 + nc}; } panel = null; playS("warn"); return true; }
      if (code === "Escape"){ sel = null; grab = null; panel = null; return true; }
      if (code === "KeyX"){ if (sel && sel.z === z1 && Z[z1].s[sel.i].k){ act(z1, [e && e.shiftKey ? "sela" : "sel", sel.i]); if (e && e.shiftKey) sel = null; } else playS("no"); return true; }
      if (code === "Tab"){ const S0 = Z[z1].s, st = sel && sel.z === z1 ? sel.i : -1; for (let k = 1; k <= 16; k++){ const i = (st + k + 16) % 16; if (S0[i].k){ sel = {z: z1, i}; break; } } playS("warn"); return true; }   // ⇥ 다음 동물
      if (code === "KeyR"){ if (sel && sel.z === z1){ const q = Z[z1].s[sel.i]; if (q.k && RD_A[q.k].g >= RD_MG) selDo("cr"); else act(z1, ["mrg", sel.i]); } return true; }
      if (code === "KeyG"){ if (!sel || sel.z !== z1){ sel = {z: z1, i: 0}; return true; }
        if (!grab){ if (Z[z1].s[sel.i].k){ grab = {z: z1, i: sel.i}; playS("sum"); } else playS("no"); }
        else { if (grab.i !== sel.i) act(z1, ["mov", grab.i, sel.i]); grab = null; playS("merge"); } return true; }
      if (Z[z1].pick && /^Digit[123]$/.test(code)){ act(z1, ["rel", +code[5] - 1]); playS("up"); return true; }
      if (/^Digit[56789]$/.test(code)){ const i = +code[5] - 5; if (Z[z1].it[i]) act(z1, ["it", i]); return true; }
      if (code === "KeyV"){ act(z1, ["rr"]); return true; }   // 🔄 새 줄
      if (code === "KeyZ"){ if (CAM.can) camToggle(); return true; }   // 🔍 크게 보기 ↔ 🗺️ 전체
      const M = {Space: [z1, "tkb"], KeyQ: [z1, "all"], KeyE: [z1, "luck0"], Digit1: [z1, "up0"], Digit2: [z1, "up1"], Digit3: [z1, "up2"], Digit4: [z1, "up3"],
                 Enter: [z2, "tkb"], KeyM: [z2, "all"], KeyL: [z2, "luck0"], KeyF: [-1, "spd"], KeyB: [-1, "book"]};
      if (!two){ M.Enter = [z1, "tkb"]; M.KeyM = [z1, "all"]; M.KeyL = [z1, "luck0"]; }
      const m = M[code]; if (!m) return false;
      const [z, a] = m;
      if (a === "book"){ RDB.isOpen ? RDB.close() : RDB.open(); return true; }
      if (a === "spd"){ act(local[0], ["spd"]); playS("warn"); }
      else if (a === "tkb"){ const j = bestTk(z); if (j >= 0) act(z, ["tk", j, Z[z].tr[j].k]); else playS("no"); } else if (a === "all") act(z, ["all"]); else if (a === "luck0") act(z, ["luck", 0]); else act(z, ["up", +a[2]]);
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
  get(sids){ try { const d = JSON.parse(localStorage.getItem(this.key(sids))); if (!d || d.v !== 2 || Date.now() - d.at > 3*864e5) return null; return d; } catch(e){ return null; } },
  del(sids){ try { localStorage.removeItem(this.key(sids)); } catch(e){} },
  ago(at){ const m = Math.round((Date.now() - at)/6e4); return m < 1 ? "방금" : m < 60 ? `${m}분 전` : `${Math.round(m/60)}시간 전`; }
};
const RDM = {
  menu(){
    const me = ARC.me, box = partyModal("rd"), body = $("#wbBody"); RDB.css();
    body.innerHTML = `<div class="rd-intro"><div class="rd-gs">${RD_G.map((g, i) => `<span style="--c:${g.c}"><b>${g.n}</b><em>${RD_BY[i].map(k => RD_A[k].e).join("")}</em></span>`).join("")}</div>
      <div class="rd-cards">
        <div><h4>📥 1초마다 오는 동물로 덱 짜기</h4>뽑기는 없어요! <b>대기 줄</b>에 1초마다 랜덤 동물이 와요 — 골라서 데려오면 공짜. 단계가 오를수록 🟡 전설 · 🌈 신화가 자주 와요.</div>
        <div><h4>🌍 🌳 육지 · 🌊 바다 · ☁️ 하늘</h4>동물은 <b>자기 땅 칸</b>에서 세져요(+35%). 같은 곳 동물이 3·6·9칸 모이면 <b>무리 효과</b>! 맵마다 센 곳이 달라요(+30%).</div>
        <div><h4>🏡 1000단계 도전</h4>👾 몬스터가 꽉 차면 끝. 10단계마다 👑 보스, 100단계마다 🌀 차원 대왕! ⬆️ 강화는 끝없이 올라가요</div>
        <div><h4>👥 최대 6명 · 🎁 주고받기</h4>친구마다 마당 땅이 달라요(🌳·🌊·☁️). 내 땅이 아닌 동물은 <b>🎁 친구에게</b>! 조합 재료도 서로 부탁해요 — 이야기할수록 강해져요</div>
        <div><h4>🧩 4×4 마당 · 🗡️ 딜러 🛡️ 서포터</h4>⚔️ 근거리는 길 옆 · 🏹 원거리는 안쪽(+25%). 20단계부터 👑 보스는 단단해요 → 🛡️ 서포터가 💥 약점을 드러내야 해요!</div>
        <div><h4>⌨️ 키보드로도!</h4>Space 대기 줄에서 데려오기 · V 새 줄 · Q 합치기 · C 조합 · 1~4 강화 · 방향키로 칸 고르고 X 팔기 · G 옮기기</div>
      </div>
      <button class="arc-btn rd-book-btn" id="rdBook">📖 동물 도감 보기 · 동물마다 힘·스킬·배치 요령</button>
      <button class="arc-btn rd-shop-btn" id="rdShop">🏪 코인 상점 · 🔬 동물 연구소 <small id="rdShopMe"></small></button></div>
      <div class="wb-sec"><h3>🧒 혼자 지키기 <small>최고 단계로 랭킹!</small></h3>${(sv => sv ? `<button class="arc-btn p rd-resume" id="rdResume">💾 이어하기 · ${sv.wave}단계 · ${(sv.score || 0).toLocaleString()}점 <small>(${RDS.ago(sv.at)})</small></button>` : "")(RDS.get([sidOf(me)]))}<button class="arc-btn ${RDS.get([sidOf(me)]) ? "" : "p"}" id="rdSolo">${RDS.get([sidOf(me)]) ? "🆕 새로 시작" : "▶ 시작!"}</button></div>
      <div class="wb-sec"><h3>👫 이 기기에서 둘이 <small>한 길을 둘이 자기 자리에서 함께 지켜요 · 같은 점수로 기록</small></h3><button class="arc-btn p" id="rdDuo">👫 친구 들어오기</button></div>
      <div class="wb-sec"><h3>🌐 온라인 함께 지키기 <small>각자 기기로 최대 6명 · 친구마다 🌀 문이 생겨 다 같이 때려요 · ☁️ Firebase 반에서만</small></h3><div id="wbRooms"></div></div>`;
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
  async rejoinPill(){ const old = $("#rdBack"); if (old) old.remove();
    if (PARTY.role || !$("#ng").hidden) return; const r0 = PARTY.rjGet(); if (!r0 || r0.g !== "rd") return;
    const r = await PARTY.rjCheck(); if (!r || PARTY.role || !$("#ng").hidden || $("#scrHome").hidden) return;
    const el = document.createElement("button"); el.id = "rdBack"; el.className = "rd-back";
    el.innerHTML = `<span>🔁</span><b>동물 랜덤 디펜스로 다시 들어가기</b><small>${esc(who(r.host))}의 방 · 아직 하는 중 · 내 동물·금 그대로!</small>`;
    el.onclick = () => { el.remove(); ARC.play("rd"); setTimeout(() => { if (!PARTY.role){ PARTY.rjBack = true; PARTY.join(r.pid, r.host); } }, 50); };
    document.body.appendChild(el); setTimeout(() => el.remove(), 120000); },
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
  NG.close = function(){ document.body.classList.remove("rd-cr-on"); try { if (this.gid === "rd" && this.cur && this.cur.save) this.cur.save(); } catch(e){} if (typeof RDB !== "undefined" && RDB.isOpen) RDB.close(); return close.apply(this, arguments); };
  const again = NG.again;
  NG.again = function(){ if (this.gid === "rd"){ if (this.opt.party){ if (this.opt.party === "host") PARTY.again(); return; } RDS.del(this.sids); return this.play("rd", this.sids, Object.assign({}, this.opt, {seed: 0, resume: 0})); } return again.call(this); };
  PARTY.CFG.rd = {max: 6, bots: 0, min: 2, relay: 1, rejoin: 1, spec: 1};   // 👀 관전 되는 게임
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
    this.started = true; Store.fs.updateDoc(this.ref(this.pid), {st: "play", n: M.length, m: M, at: CLOCK.now()}).catch(() => {});
    const sids = M.map(sidOf), seed = Math.floor(Math.random()*1e9) + 1, remote = {};
    this.startMsg = {t: "start", g: "rd", sids, seed};
    M.forEach((no, i) => { if (i){ const P = this.peers.get(no); if (P){ P.idx = i; P.inN = 0; P.last = {}; remote[i] = no; this.send(P, {t: "start", g: "rd", sids, idx: i, seed}); } } });
    /* 시작 쪽지를 놓친 친구가 없게 2초마다 3번 더 보내요 (이미 같은 판이면 친구 기기는 그대로 둬요) */
    /* 👀 구경하던 친구들도 새 판으로 바로 데려가요 (예전엔 '관전 끝'에서 멈춰 있었어요) */
    const toSpecs = () => this.specs().forEach(P => { if (P.open || P.relay) this.send(P, Object.assign({}, this.startMsg, {idx: -1, spec: 1})); });
    toSpecs();
    [2000, 4000, 7000].forEach(ms => setTimeout(() => { if (this.role !== "host" || !this.startMsg || this.startMsg.seed !== seed) return; M.forEach((no, i) => { const P = i && this.peers.get(no); if (P) this.send(P, {t: "start", g: "rd", sids, idx: i, seed}); }); if (ms === 2000) toSpecs(); }, ms));
    this.seq = 0; this.lastGv = -1; const md = $("#mdWb"); if (md) md.hidden = true;
    if (!again){ ARC.game = "rd"; ARC.enter(); ARC.prep(); }
    getAC(); NG.play("rd", sids, {party: "host", local: [0], remote, seed});
  };
  if (typeof COOP !== "undefined" && !COOP.G.includes("rd")) COOP.G.unshift("rd");
  /* 🔁 홈에 오면: 튕겼던 랜덤 디펜스 판이 아직 하는 중인지 한 번 살펴보고, 그렇다면 '다시 들어가기' 띠를 보여 줘요 */
  const home = ARC.home;
  ARC.home = function(){ const r = home.apply(this, arguments); setTimeout(() => RDM.rejoinPill(), 600); return r; };
  const css = document.createElement("style");
  css.textContent = `.in-room>.rd-intro{display:none}.rd-gs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:8px}
.rd-gs span{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px;border-radius:12px;border:2px solid var(--c);background:rgba(255,255,255,.06)}
.rd-resume{display:block;width:100%;margin-bottom:8px;font-size:20px !important}.rd-resume small{opacity:.8;font-size:13px}
.rd-gs b{font:15px "Jua",sans-serif;color:var(--c)}
.wb-rejoin{display:block;width:100%;margin-bottom:8px;font-size:19px !important;animation:rdBackPulse 1.4s ease-in-out infinite alternate}.wb-rejoin small{display:block;opacity:.85;font-size:13px}
.rd-back{position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:900;display:grid;grid-template-columns:auto 1fr;column-gap:10px;align-items:center;text-align:left;width:min(480px,92vw);border:3px solid #ffe066;border-radius:20px;padding:10px 18px;background:linear-gradient(135deg,#ff9f43,#ff6b9a 50%,#845ef7);color:#fff;font-family:"Jua",sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.35);cursor:pointer;animation:rdBackPulse 1.4s ease-in-out infinite alternate}
.rd-back span{grid-row:span 2;font-size:30px}.rd-back b{font-weight:400;font-size:18px}.rd-back small{font-size:13px;opacity:.9}
@keyframes rdBackPulse{to{box-shadow:0 0 0 6px rgba(255,224,102,.35),0 10px 30px rgba(0,0,0,.35)}}.rd-gs em{font-style:normal;font-size:18px;letter-spacing:-2px;white-space:nowrap}
@media (max-width:560px){.rd-gs em{font-size:14px}}
/* ⭐ 대표 게임: 홈에서 크게, 금빛 테두리 */
.arc-game.g-rd{background:linear-gradient(135deg,#ff9f43 0%,#ff6b9a 45%,#845ef7 100%) !important;border:3px solid #ffe066 !important;box-shadow:0 0 0 3px rgba(255,224,102,.25),0 10px 28px rgba(255,159,67,.35) !important}
.arc-game.g-rd .ag-tag{background:#ffe066 !important;color:#1b1233 !important;font-weight:700}
.arc-game.g-qd{background:linear-gradient(135deg,#e03131 0%,#862e9c 50%,#1c1240 100%) !important;border:3px solid #ffe066 !important;box-shadow:0 0 0 3px rgba(255,224,102,.25),0 10px 28px rgba(201,42,42,.35) !important}
.arc-game.g-qd .ag-tag{background:#ffe066 !important;color:#1b1233 !important;font-weight:700}
@media (min-width:760px){.arc-game.g-qd{grid-column:span 2}.arc-game.g-qd .ag-nm{font-size:30px}.arc-game.g-qd .ag-ic{font-size:52px}}
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
      const done = u => { this._im[k] = u || ""; if (u) document.querySelectorAll(`img[data-im="${k}"]`).forEach(el => { el.src = u; }); if (this._q.length) this.pump(); };
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
.rdb-c u{position:absolute;top:6px;right:6px;text-decoration:none;font-size:13px;background:var(--jc);border-radius:999px;padding:1px 5px}
.rdb-to{display:inline-block;background:rgba(255,255,255,.1);border-radius:999px;padding:2px 9px;margin:2px;cursor:pointer}
.rdb-rc{max-height:62vh;overflow:auto;display:grid;gap:7px}
.rdb-rc h4{margin:6px 0 0;color:var(--c);font-size:18px}
.rdb-rr{display:grid;grid-template-columns:150px 22px 1fr;grid-template-areas:"to eq in" "to eq sk";gap:2px 8px;align-items:center;background:#2d2566;border-radius:16px;padding:8px 12px;border-left:6px solid var(--c);cursor:pointer;color:#e5dbff}
.rdb-rr .to{grid-area:to;display:flex;flex-direction:column;align-items:center;text-align:center}.rdb-rr .to img{width:54px;height:54px}.rdb-rr .to b{color:#fff;font-size:16px}.rdb-rr .to small{font-size:12px;color:var(--jc)}
.rdb-rr .eq{grid-area:eq;font-size:24px;color:#ffd43b;text-align:center}
.rdb-rr .in{grid-area:in;display:flex;flex-wrap:wrap;align-items:center;gap:4px}
.rdb-rr .in>span{display:inline-flex;align-items:center;gap:3px;background:rgba(255,255,255,.08);border-radius:12px;padding:2px 9px 2px 3px;border-bottom:3px solid var(--c);font-size:14px}
.rdb-rr .in img{width:30px;height:30px}.rdb-rr .in em{font-style:normal;color:#ffd43b;margin-left:2px}.rdb-rr .in i{font-style:normal;color:#ffd43b;font-size:18px}
.rdb-rr .sk{grid-area:sk;font-size:13px;color:#c5f6fa}
@media (max-width:640px){.rdb-rr{grid-template-columns:96px 16px 1fr}}
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
@media (max-width:560px){.rd-cards{grid-template-columns:1fr}}
/* 📖 게임 중 도감 (2026.11.18): 게임을 가리지 않고 옆에 펼쳐요 — 보면서 뽑기·조합·강화 다 해요 */
body.rdb-split{--rdbw:min(600px,48vw);--rdbh:0px}
@media (orientation:landscape) and (max-height:520px){body.rdb-split{--rdbw:min(440px,44vw)}}
@media (orientation:portrait) and (max-width:820px){body.rdb-split{--rdbw:0px;--rdbh:52vh}}
body.rdb-split #ngStage{margin-right:var(--rdbw);margin-bottom:var(--rdbh)}
#mdRdBook.rdb-live{background:transparent!important;pointer-events:none;padding:0;justify-content:flex-end;align-items:stretch;z-index:470}
#mdRdBook.rdb-live>.arc-card{pointer-events:auto;width:min(600px,52vw);max-width:none;max-height:none;height:100%;margin:0;border-radius:24px 0 0 24px;display:flex;flex-direction:column;padding:12px 14px 10px;box-shadow:-10px 0 40px rgba(0,0,0,.45)}
#mdRdBook.rdb-live #rdbBody{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column}
#mdRdBook.rdb-live .rdb-wrap{grid-template-columns:1fr}
#mdRdBook.rdb-live .rdb-grid{grid-template-columns:repeat(auto-fill,minmax(82px,1fr));max-height:30vh}
#mdRdBook.rdb-live .rdb-c img{width:46px;height:46px}#mdRdBook.rdb-live .rdb-c b{font-size:13px}
#mdRdBook.rdb-live .rdb-d{position:static}
#mdRdBook.rdb-live .rdb-rc,#mdRdBook.rdb-live .rdb-list{max-height:none}
#mdRdBook.rdb-live .rdb-top h2{font-size:20px}#mdRdBook.rdb-live .rdb-tabs button,#mdRdBook.rdb-live .rdb-fl button{font-size:13.5px;padding:5px 11px}
.rdb-dock{position:sticky;bottom:-10px;margin:auto -14px -10px;padding:8px 14px 10px;background:linear-gradient(180deg,rgba(33,26,82,.0),#211a52 22%)}
.rdb-dock .dk-sub{background:#2d2566}.rdb-dock .dk-tip{color:#c5b8ff}
#mdRdBook.rdb-live>.arc-card{width:var(--rdbw,min(600px,48vw))}
@media (orientation:portrait) and (max-width:820px){#mdRdBook.rdb-live{align-items:flex-end}#mdRdBook.rdb-live>.arc-card{width:100vw;height:var(--rdbh,52vh);border-radius:24px 24px 0 0}#mdRdBook.rdb-live .rdb-grid{max-height:22vh}}
@media (orientation:landscape) and (max-height:520px){#mdRdBook.rdb-live>.arc-card{padding:8px 10px 8px}#mdRdBook.rdb-live .rdb-grid{max-height:40vh}}
.rdb-own{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:6px}.rdb-own b{color:#ffe066}
.rdb-own button{border:0;border-radius:999px;padding:6px 12px;font:14px "Jua",sans-serif;cursor:pointer;background:#ffd43b;color:#5c3d00;box-shadow:0 2px 0 #f08c00}.rdb-own button.sel{background:#b197fc;color:#1b1233;box-shadow:0 2px 0 #7048e8}.rdb-own button.tk{background:#8ce99a;color:#0b3d1b;box-shadow:0 2px 0 #2f9e44}
@media (max-height:520px),(max-width:640px){#mdRdBook.rdb-live .rdb-tabs,#mdRdBook.rdb-live .rdb-fl{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none}#mdRdBook.rdb-live .rdb-tabs button,#mdRdBook.rdb-live .rdb-fl button{flex:none;font-size:12.5px;padding:4px 10px}
  #mdRdBook.rdb-live .rdb-top{margin-bottom:5px;flex-wrap:nowrap;padding-right:44px}#mdRdBook.rdb-live .rdb-top h2{font-size:16px;white-space:nowrap}#mdRdBook.rdb-live .rdb-fl{margin-bottom:6px}
  #mdRdBook.rdb-live .arc-x{width:34px;height:34px;font-size:20px;top:6px;right:6px}.rdb-dock .dk-tip{display:none}.rdb-dock .dk-b{padding:6px 9px;font-size:13.5px}.rdb-dock .dk-m{font-size:13px}}
.rdb-how{border-left:4px solid #ffd43b}
.rdb-tw{width:100%;border-collapse:collapse;font-size:13px;margin:4px 0;text-align:center}.rdb-tw th{color:var(--c,#ffe066);font-weight:400;padding:2px}.rdb-tw td{padding:2px;border-top:1px solid rgba(255,255,255,.08)}.rdb-tw td:first-child{color:#ffe066;text-align:left}.rdb-tw tr.on td{background:rgba(255,212,59,.18);color:#fff}
.rdb-go{border:0;border-radius:12px;padding:7px 12px;margin:6px 6px 0 0;font:14px "Jua",sans-serif;background:#ffd43b;color:#3b2a00;cursor:pointer;box-shadow:0 3px 0 #e67700}
.rdb-go.sm{padding:3px 9px;font-size:12.5px;margin:2px 0 0 4px}.rdb-go.on{background:#fff;color:#5f3dc4}
.rdb-gr{display:flex;flex-wrap:wrap}
.rdb-ga{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:9px;margin-bottom:8px}
.rdb-ga>div{background:#2d2566;border-radius:16px;padding:10px 12px;color:#e5dbff;font-size:14px;line-height:1.5}
.rdb-ga h4{margin:0 0 4px;color:#ffe066;font-size:17px}.rdb-ga h4 small{font-size:13px;color:#fff;background:rgba(255,255,255,.12);border-radius:999px;padding:1px 8px;margin-left:4px}
.rdb-ga p{margin:4px 0}
.rdb-gp{display:inline-block;border-radius:999px;padding:1px 8px;margin:2px 3px 2px 0;font-size:13px;color:#1b1233;background:var(--c)}
.rdb-tree,.rdb-tree ul{list-style:none;margin:0;padding-left:16px}.rdb-tree{padding-left:0}
.rdb-tree li{position:relative;margin:3px 0}.rdb-tree ul li::before{content:"└";position:absolute;left:-14px;top:1px;color:#7a6aa8}
.rdb-tn{display:inline-flex;align-items:center;gap:4px;border-radius:10px;padding:1px 9px;background:rgba(255,255,255,.08);border-left:4px solid var(--c);cursor:pointer}
.rdb-tn em{font-style:normal;color:#ffd43b}.rdb-tn small{font-size:12px;color:#ffa8a8}.rdb-tn small.y{color:#8ce99a}.rdb-tn i{font-style:normal;font-size:12px;opacity:.8}
`; document.head.appendChild(s); },
  live(){ return NG.gid === "rd" && NG.cur && NG.cur.rdInfo && !NG.cur.spec && !$("#ng").hidden && !NG.ended; },
  open(k){ this.css(); let m = $("#mdRdBook");
    if (!m){ m = document.createElement("div"); m.className = "arc-modal"; m.id = "mdRdBook"; m.hidden = true; m.innerHTML = `<div class="arc-card"><div id="rdbBody"></div><button class="arc-x" data-close>×</button></div>`; document.body.appendChild(m);
      m.querySelector("[data-close]").onclick = () => this.close();
      m.addEventListener("pointerdown", e => { if (e.target === m) this.close(); });
      ["pointerdown", "pointerup", "touchstart", "touchend", "mousedown"].forEach(ev => m.addEventListener(ev, e => e.stopPropagation(), {passive: true}));
      m.addEventListener("click", e => { const dk = e.target.closest("[data-dk]"); if (dk){ if (this.live()) NG.cur.dockClick(dk.dataset.dk); return; } const b = e.target.closest("[data-t],[data-f],[data-k]"); if (!b) return; if (b.dataset.k && !b.dataset.t && !b.dataset.f){ if (this.tab !== "a"){ this.tab = "a"; this.f = "all"; this.cur = b.dataset.k; this.render(); return; } this.pickK(b.dataset.k); return; } if (b.dataset.t) this.tab = b.dataset.t; if (b.dataset.f) this.f = b.dataset.f; this.render(); }); }
    if (k){ this.tab = "a"; this.cur = k; } this.isOpen = true; m.classList.toggle("rdb-live", this.live()); m.hidden = false; this.split(this.live()); this.render(); },
  /* ✂️ (2026.11.19) 게임 중 도감 = 화면 나누기: 게임판을 도감 옆(세로 화면은 위)으로 줄여서 모두 보여요
     → 동물 누르기·팔기·옮기기·대기 줄·합치기·아이템·유물 고르기·속도까지 도감을 연 채로 원래처럼 다 돼요 */
  split(on){ if (document.body.classList.contains("rdb-split") === !!on) return; document.body.classList.toggle("rdb-split", !!on);
    requestAnimationFrame(() => { try { NG.cur && NG.fit(); } catch(_){} }); },
  pickK(k){ if (!RD_A[k] || k === this.cur) return; this.cur = k; const m = $("#mdRdBook");
    m.querySelectorAll(".rdb-c.on").forEach(el => el.classList.remove("on")); const c = m.querySelector(`.rdb-c[data-k="${k}"]`); if (c) c.classList.add("on");
    const d = m.querySelector(".rdb-d"); if (d) d.outerHTML = this.detail(k); },
  close(){ const m = $("#mdRdBook"); if (m) m.hidden = true; this.isOpen = false; this.split(false); },
  how(k){ const A = RD_A[k], g = A.g, n = RD_BY[g].length, I = this.live() ? NG.cur.rdInfo() : null, HB = RD_HBI[A.hb];
    const L = [], fw = (p0) => { for (let w = 1; w <= 1000; w++) if (rdTrayP(w)[g] >= p0) return w; return 0; };
    if (g <= 7){ const now = I ? rdTrayP(I.wave)[g]/n : 0, w1 = fw(g === 0 ? 0 : 2);
      L.push(`📥 <b>대기 줄</b>에 와요 ${I ? `· 지금(${I.wave}단계) 1초마다 <b>${now < 1 ? now.toFixed(2) : now.toFixed(1)}%</b>` : ""}${g >= 2 && w1 ? ` · ${w1}단계쯤부터 자주` : ""}`); }
    if (g === 1 || g === 2) L.push(`🔀 ${HB.e} ${HB.n} ${RD_G[g - 1].n} 3마리 합치기 → ${HB.n} ${RD_G[g].n} 중 하나`);
    if (RD_RC[k]) L.push(`🧪 <b>조합</b>으로 골라서 만들기${g >= 8 ? " · 🌟 태초가 재료예요" : ""}`);
    if (g >= 2 && g <= 4) L.push("💎 보석 뽑기에서도 가끔");
    if (RD_USE[k]) L.push(`🧩 재료로 쓰여요: ${RD_USE[k].map(t => `<span class="rdb-to" data-k="${t}">${RD_A[t].e} ${RD_A[t].n}</span>`).join(" ")}`);
    return L.join("<br>"); },
  render(){
    const seen = this.seen(), nSeen = RD_K.filter(k => seen[k]).length, T = this.tab;
    const tabs = [["a", "🐾 동물"], ["s", "📥 동물 오는 법"], ["c", "🧪 조합표"], ["r", "🎁 유물"], ["i", "🎒 아이템"], ["g", "🧩 배치·보스 요령"]].map(([id, n]) => `<button data-t="${id}" class="${T === id ? "on" : ""}">${n}</button>`).join("");
    let html = `<div class="rdb-top"><h2>📖 동물 도감</h2><div class="rdb-tabs">${tabs}</div></div>`;
    if (T === "a"){
      const F = [["all", `전체 ${nSeen}/${RD_K.length}`], ["hl", "🌳 육지"], ["hs", "🌊 바다"], ["ha", "☁️ 하늘"], ["jd", "🗡️ 딜러"], ["js", "🛡️ 서포터"], ["m", "⚔️ 근거리"], ["r", "🏹 원거리"], ["s", "✨ 지원"], ...RD_G.map((g, i) => ["g" + i, g.n])];
      const list = RD_K.filter(k => { const A = RD_A[k]; return this.f === "all" || A.ro === this.f || this.f === "g" + A.g || this.f === "j" + A.job || this.f === "h" + A.hb; });
      if (!this.cur || !RD_A[this.cur]) this.cur = list[0] || RD_K[0];
      html += `<div class="rdb-fl">${F.map(([id, n]) => `<button data-f="${id}" class="${this.f === id ? "on" : ""}">${n}</button>`).join("")}</div>
        <div class="rdb-wrap"><div class="rdb-grid">${list.map(k => { const A = RD_A[k], RO = RD_ROLE[A.ro];
          return `<button class="rdb-c ${this.cur === k ? "on" : ""} ${seen[k] ? "" : "new"}" data-k="${k}" style="--c:${RD_G[A.g].c};--rc:${RO.c}"><i>${RO.e}</i><u style="--jc:${RD_JOB[A.job].c}">${RD_JOB[A.job].e}</u><img data-im="${k}" ${this.img(k)} alt=""><b>${A.n}</b><small>${RD_HBI[A.hb].e} ${RD_G[A.g].n}</small></button>`; }).join("")}</div>${this.detail(this.cur)}</div>`;
    } else if (T === "s"){ html += this.gacha();
    } else if (T === "c"){
      html += `<p class="arc-small">⚪ 일반 → 🔵 희귀 → 🟣 영웅까지는 <b>같은 동물 3마리 합치기</b>(어떤 동물이 나올지 랜덤). 🟣 영웅부터는 아래 <b>조합표</b>대로 재료 동물을 모아 <b>골라서</b> 만들어요 — 🟡 전설부터는 조합으로만! 게임 중 <b>🧪 조합</b> 단추(C 키)를 누르면 만들 수 있는 것이 반짝여요.</p>
        <div class="rdb-rc">${RD_G.map((_, g) => g).filter(g => g >= 2).map(g => `<h4 style="--c:${RD_G[g].c}">${RD_G[g].n}</h4>` + RD_RCK.filter(t => RD_A[t].g === g).map(t => { const A = RD_A[t], J = RD_JOB[A.job];
          return `<div class="rdb-rr" data-k="${t}" style="--c:${RD_G[g].c}"><span class="to"><img data-im="${t}" ${this.img(t)} alt=""><b>${A.n}</b><small style="--jc:${J.c}">${J.e} ${J.n} · ${RD_ROLE[A.ro].e} ${RD_ROLE[A.ro].n}</small></span><span class="eq">=</span>
            <span class="in">${RD_RC[t].map(([k, c]) => `<span style="--c:${RD_G[RD_A[k].g].c}"><img data-im="${k}" ${this.img(k)} alt="">${RD_A[k].n}<em>×${c}</em></span>`).join('<i>+</i>')}</span>
            <span class="sk">🌟 ${A.sk.e} <b>${A.sk.n}</b> — ${A.sk.d}</span></div>`; }).join("")).join("")}</div>`;
    } else if (T === "r"){
      html += `<p class="arc-small">👑 10단계마다 보스를 잡으면 3장 중 1장을 골라요. 같은 유물을 또 고르면 효과가 쌓여요! 유물은 등급이 있어요: ★ 보통 · ★★ 희귀 · ★★★ 전설 · ★★★★ 신비 (높을수록 잘 안 나와요)</p><div class="rdb-list">${RD_RK.slice().sort((a, b) => (RD_REL[b].r || 1) - (RD_REL[a].r || 1)).map(k => { const R0 = RD_REL[k], RR = RD_RR[R0.r || 1]; return `<div class="rdb-it" style="border-left:5px solid ${RR.c}"><span>${R0.e}</span><div><b>${R0.n} <small style="color:${RR.c}">${"★".repeat(R0.r || 1)} ${RR.n}</small></b>${R0.d}${R0.max ? ` <small>(최대 ${R0.max}개)</small>` : ""}</div></div>`; }).join("")}</div>`;
    } else if (T === "i"){
      html += `<p class="arc-small">🎯 미션 성공 · 😈 중간 보스 · 🎁 보물상자 몬스터에게서 받아요. 가방 아이콘을 누르면 바로 써요 (키보드 5~9번).</p><div class="rdb-list">${RD_IK.map(k => { const I = RD_IT[k]; return `<div class="rdb-it"><span>${I.e}</span><div><b>${I.n}</b>${I.d}</div></div>`; }).join("")}</div>`;
    } else {
      html += `<div class="rdb-guide">
        <div><h4>⚔️ 근거리는 길 바로 옆</h4>빨간 테두리 칸이 길에 붙어 있는 자리예요. 근거리 동물은 공격이 1.5배 세지만 거리가 짧아서 <b>길 옆에서만</b> 닿아요. 길이 꺾이는 <b>모퉁이 옆</b>이면 두 줄을 한꺼번에 때려요!</div>
        <div><h4>🏹 원거리는 뒷줄</h4>파란 테두리 칸은 길에서 먼 자리예요. 원거리 동물을 두면 <b>공격 +25%</b>! 부엉이·독수리처럼 거리가 아주 긴 친구는 어디서든 닿아요.</div>
        <div><h4>✨ 지원은 가운데</h4>개구리는 몬스터를 느리게, 유니콘은 옆 친구들의 힘을 올려 줘요. <b>센 친구들 사이</b>에 두면 효과가 커요.</div>
        <div><h4>🔀 합치기 · 🧪 조합</h4>⚪ 일반·🔵 희귀는 같은 동물 3마리를 합쳐요(R 키 / Q 키 모두). 🟣 영웅부터는 <b>🧪 조합표</b>대로 재료를 모아 원하는 동물을 골라 만들어요. 다음에 만들 동물의 재료는 팔지 말고 남겨 두세요!</div>
        <div><h4>🗡️ 딜러 · 🛡️ 서포터</h4>🗡️ 딜러는 세게 때려서 쓰러뜨리고, 🛡️ 서포터(🐭🐸🐧🐼🐳🦁🦄🦌🐋천마)는 느리게·멈추게·응원해요. <b>20단계부터 👑 보스는 단단해서 피해 -50%</b>! 서포터가 보스를 때리면 4초 동안 <b>💥 약점</b>이 드러나 모두 +40%로 때려요. 서포터 1~2마리를 꼭 길 옆에 두어요.</div>
        <div><h4>🤝 같이 하기 맵</h4>친구 마당이 바둑판처럼 놓이고 <b>마당 사이 골목이 모두 길</b>이에요. 몬스터는 한가운데 🌀 문에서 나와 세로 골목 → 가로 골목을 지그재그로 돌며 <b>모든 마당을 두 번씩</b> 지나가요. 가운데 골목은 양쪽 친구가 함께, 골목이 만나는 <b>네거리 옆 모서리 칸은 여러 길에 닿는 명당</b>! 친구 마당과 붙은 자리에 ✨ 지원 동물을 두면 💞 친구 응원으로 둘 다 세져요.</div>
        <div><h4>🌍 땅 칸 · 무리 효과</h4>칸 색이 땅이에요: 🌳 초록 = 육지 · 🌊 파랑 = 바다 · ☁️ 보라 = 하늘. 동물 오른쪽 위 동그라미가 <b>초록 테</b>면 자기 땅, <b>빨간 테</b>면 다른 땅(-20%) → 끌어서 옮겨요(맞는 칸이 반짝여요). 위쪽 띠에 내 무리(🌳6★★ 같은)와 이 맵에서 센 곳이 보여요.</div>
        <div><h4>⌨️ 키보드로 하기</h4>Space 대기 줄에서 가장 좋은 동물 데려오기 · V 🔄 새 줄 · Q 모두 합치기 · C 조합 · 1~4 강화 · E 💎 보석 · 5~9 아이템 · F 속도 · B 도감 · P 잠깐 멈춤(혼자·둘이)<br><b>고른 동물</b>: 방향키/WASD 칸 고르기 · Tab 다음 동물 · R 합치기(영웅부터는 조합) · X 팔기 · Shift+X 모두 팔기 · G 옮기기(집기→놓기) · Esc 닫기<br><small>📱 손가락: 동물을 톡 누르면 아래(가로 화면은 옆)에 큰 단추 줄이 떠요 · 끌어서 옮겨도 돼요</small></div>
        <div><h4>🌟 스킬 고르기</h4>👑 보스가 나오기 전엔 <b>한 마리를 세게</b> 때리는 스킬(저격·필살 냥펀치·연속 찌르기)을, 몬스터가 쌓이면 <b>여러 마리를 멈추는</b> 스킬(얼음 폭풍·지진 쿵·해일)을 가진 친구를 앞에 두어요.</div>
        <div><h4>🗺️ 4×4 마당</h4>내 마당은 16칸(4×4)! 길에 붙은 가장자리 = ⚔️ 앞줄, 안쪽 = 🏹 뒷줄이에요. 10단계마다 길 모양이 바뀌니 근거리 친구가 "⚠️ 길에서 멀어요"가 되면 옮겨 주세요.</div></div>`;
    }
    if (this.live()) html += `<div class="rd-dock rdb-dock" data-w="book"></div>`;   // 🎛️ 도감을 보면서 뽑기·합치기·강화
    $("#rdbBody").innerHTML = html;
    if (this.live()) NG.cur.dockClick("noop");
  },
  /* 📥 동물 오는 법: 대기 줄 등급표 · 땅 · 주고받기 · 합치기 · 조합 · 보석 */
  gacha(){ const I = this.live() ? NG.cur.rdInfo() : null, bt = (cmd, t) => I ? `<button class="rdb-go" data-dk="${cmd}">${t}</button>` : "";
    const row = (g, n) => `<span class="rdb-gp" style="--c:${RD_G[g].c}">${RD_G[g].n} ${n}</span>`, pc = v => v >= 10 ? Math.round(v) + "%" : v >= 1 ? v.toFixed(1) + "%" : v > 0 ? v.toFixed(2) + "%" : "-";
    const WS = [1, 10, 30, 60, 100, 200, 400, 700], cur = I ? I.wave : 0;
    const tb = `<table class="rdb-tw"><tr><th>단계</th>${RD_G.slice(0, 8).map(g => `<th style="--c:${g.c}">${g.n}</th>`).join("")}</tr>${(cur && !WS.includes(cur) ? WS.concat([cur]).sort((a, b) => a - b) : WS).map(w => { const P = rdTrayP(w); return `<tr class="${w === cur ? "on" : ""}"><td>${w === cur ? "👉 " : ""}${w}</td>${P.map(v => `<td>${pc(v)}</td>`).join("")}</tr>`; }).join("")}</table>`;
    return `<p class="arc-small">🎲 뽑기는 없어요! <b>1초마다</b> 랜덤 동물이 <b>📥 대기 줄</b>(5칸)에 와요 — 눌러서 데려오면 <b>공짜</b>. 5칸이 차면 가장 오래 기다린 동물(⏳)이 떠나요. 어떤 동물을 데려올지 <b>고르는 것</b>이 실력!</p>
      <div class="rdb-ga">
        <div><h4>📥 대기 줄 <small>공짜 · 1초마다</small></h4><p>단계가 오를수록 <b>높은 등급</b>이 자주 와요. 잘 버틸수록 🟡 전설·🌈 신화를 쉽게 만나요!</p><p>🔄 <b>새 줄</b>: 금을 내고 5마리를 모두 새로 ${I ? `(지금 💰${rdN(I.rc)})` : ""}</p>${bt("rr", "🔄 새 줄")}</div>
        <div><h4>🌍 사는 곳 <small>🌳 🌊 ☁️</small></h4><p>동물마다 사는 곳이 있어요. <b>자기 땅 칸</b>에 두면 힘 +35% (다른 땅이면 -20%). 같은 곳 동물이 자기 땅에 3·6·9칸 모이면 <b>무리 효과</b>!</p>
          <p>🌳 육지: 공격 ×1.2 → ×1.45 → ×1.8<br>🌊 바다: 공격 ×1.1~1.35 + 때리면 느려져요 15%→25%→40%<br>☁️ 하늘: 빠르기 ×1.15 → ×1.3 → ×1.5 + 거리 +0.3~1칸</p></div>
        <div><h4>🗺️ 맵마다 센 곳</h4><p>10단계마다 맵이 바뀌고, 맵마다 힘이 센 곳(+30%)이 달라요: ${RD_TH.map((T, i) => `${T.n.split(" ")[0]}${RD_REG[i] === "*" ? "✨" : RD_HBI[RD_REG[i]].e}`).join(" ")}</p><p>☁️ 하늘 → 🦇 날개 몬스터 ×1.5 · 🌳 육지 → 🛡️ 단단한 몬스터 ×1.3 · 🌊 바다 → 💨 질주·💚 재생 ×1.5</p></div>
        <div><h4>🤝 같이 하면 <small>🎁 주고받기</small></h4><p>친구마다 마당 땅이 달라요 (1P 🌳 · 2P 🌊 · 3P ☁️ …). 내 땅이 아닌 동물이 오면 데려와서 <b>🎁 친구에게</b>! 조합 재료도 서로 부탁해요 — 말을 많이 할수록 강해져요.</p></div>
        <div><h4>🔀 합치기 · 🧪 조합</h4><p>같은 동물 3마리 → 한 등급 위 <b>같은 곳 동물</b> (🌊 3마리 → 🌊)</p>${row(0, "3마리")} → ${row(1, "1마리")} → ${row(2, "1마리")}<p>🟣 영웅부터는 조합표대로 재료를 모아 골라서 만들어요. 재료는 여러 땅에서 와요!</p>${bt("all", "🔀 모두 합치기")}${I ? `<button class="rdb-go" data-dk="cr">🧪 조합 창 열기</button>` : ""}</div>
        <div><h4>💎 보석 <small>아주 가끔</small></h4><p>👑 보스를 잡으면 💎 1개. 아껴 썼다가 큰 순간에!</p><p><b>💎 1개</b>: ${row(2, "52%")}${row(3, "10%")} · 꽝 38%<br><b>💎 4개</b>: ${row(4, "25%")}${row(3, "75%")}</p>${bt("lk:0", "💎1 뽑기")}${bt("lk:1", "💎4 뽑기")}</div>
      </div>
      <div class="rdb-box"><h4>📊 대기 줄에 오는 등급 (단계마다)</h4>${tb}<small>🎲 행운 주사위 유물·🍀 네잎클로버면 더 높은 등급이 와요 · 🌌 창세 · ♾️ 영원은 조합으로만!</small></div>`; },
  /* 🌳 재료 나무: 조합 재료의 재료까지 (3단계) */
  tree(k, d = 0, c = 1){ const A = RD_A[k], R0 = RD_RC[k], H = this.live() ? NG.cur.rdInfo().H : null, h = H ? (H[k] || 0) : null;
    const me = `<span class="rdb-tn" data-k="${k}" style="--c:${RD_G[A.g].c}">${A.e} ${A.n}${c > 1 ? ` <em>×${c}</em>` : ""}${h != null && d ? ` <small class="${h >= c ? "y" : ""}">${Math.min(h, 99)}/${c}</small>` : ""}${!R0 ? ` <i>${A.g === 0 ? "📥" : A.g === 1 ? "🔀📥" : "📥"}</i>` : ""} <i>${RD_HBI[A.hb].e}</i></span>`;
    if (!R0 || d >= 3) return `<li>${me}</li>`;
    return `<li>${me}<ul>${R0.map(([q, n]) => this.tree(q, d + 1, n)).join("")}</ul></li>`; },
  detail(k){ const A = RD_A[k], RO = RD_ROLE[A.ro], G = RD_G[A.g], S = A.sk, dps = A.d*60/A.cd;
    const mx = Math.log10(RD_A.trex.d*60/RD_A.trex.cd), mn = Math.log10(RD_A.frog.d*60/RD_A.frog.cd), pw = Math.max(.06, (Math.log10(dps) - mn)/(mx - mn));
    const bar = (n, v, t, c) => `<div class="rdb-bar"><b>${n}</b><span><em style="width:${Math.round(Math.min(1, v)*100)}%;--bc:${c}"></em></span><small>${t}</small></div>`;
    const nx = A.g < RD_MAXG ? `${RD_G[A.g + 1].n} ${RD_BY[A.g + 1].map(q => RD_A[q].e).join("")}` : "가장 높은 등급!";
    return `<div class="rdb-d" style="--c:${G.c}"><div class="rdb-hd"><img data-im="${k}" ${this.img(k)} alt=""><div><h3>${A.e} ${A.n}</h3><span class="rdb-chip" style="--c:${G.c}">${G.n}</span><span class="rdb-chip" style="--c:${RO.c}">${RO.e} ${RO.n}</span><span class="rdb-chip" style="--c:${RD_JOB[A.job].c}">${RD_JOB[A.job].e} ${RD_JOB[A.job].n}</span><span class="rdb-chip" style="--c:${RD_HBI[A.hb].c}">${RD_HBI[A.hb].e} ${RD_HBI[A.hb].n}</span></div></div>
      ${this.live() ? `<div class="rdb-own" data-own="${k}">${NG.cur.ownHTML(k)}</div>` : ""}
      <div class="rdb-box rdb-how"><h4>📥 이렇게 얻어요</h4>${this.how(k)}</div>
      ${bar("💪 힘", pw, `${A.d}`, "#ff8787")}${bar("⚡ 빠르기", 28/A.cd, `${(60/A.cd).toFixed(1)}번/초`, "#ffd43b")}${bar("📏 거리", A.r/5.6, `${A.r}칸`, "#74c0fc")}
      <div class="rdb-box"><h4>✨ 특기</h4>${this.tags(A).map(([e, t]) => `${e} ${t}`).join("<br>")}</div>
      <div class="rdb-box"><h4>🌟 스킬: ${S.e} ${S.n}</h4>${S.d}<br><small>공격 ${S.mp}번마다 저절로 · 이럴 때 좋아요: ${this.when(S)}</small></div>
      <div class="rdb-box"><h4>🧩 어디에 둘까?</h4>${RD_HBI[A.hb].e} <b>${RD_HBI[A.hb].n} 칸</b>에 두면 +35% (${RD_HBI[A.hb].t}) · ${this.tip(A)}</div>
      <div class="rdb-box"><h4>${RD_JOB[A.job].e} ${RD_JOB[A.job].n}</h4>${RD_JOB[A.job].t}${A.job === "s" ? "<br><small>👑 보스를 때리면 💥 약점이 드러나 모두 +40%!</small>" : ""}</div>
      ${RD_RC[k] ? `<div class="rdb-box"><h4>🌳 재료 나무 <small>(재료의 재료까지${this.live() ? " · 숫자 = 지금 가진 수" : ""})</small></h4><ul class="rdb-tree">${this.tree(k)}</ul>${this.live() ? `<div class="rdb-gr"><button class="rdb-go" data-dk="crx:${k}">🧪 조합 창에서 만들기</button><button class="rdb-go${NG.cur.rdInfo().pin === k ? " on" : ""}" data-dk="pin:${k}">${NG.cur.rdInfo().pin === k ? "📌 목표 해제" : "📌 목표로 정하기"}</button></div>` : ""}</div>` : ""}

      ${A.g < RD_MG ? `<div class="rdb-box"><h4>🔀 3마리 합치면</h4>${nx}</div>` : ""}</div>`;
  }
};

/* =====================================================================
   👑 방장 넘기기 (2026.11.20) — 동물 랜덤 디펜스 온라인 방
   예전엔 방장이 나가면 방이 통째로 사라져서, 남은 친구들이 다 튕기고 서로 새 방을 만들어 다시 들어가야 했어요.
   - 방장이 나가면(✕·홈·창 닫기) → 함께 있던 다음 친구에게 방장을 넘겨요. 판은 그대로 이어서!
   - 방장 기기가 갑자기 꺼지면 → 남은 친구 기기들이 알아채고, 한 명(차례대로)이 새 방장이 돼요
   - 새 방장 기기는 '판 통째로'를 받아 그대로 이어서 계산하고, 다른 친구들은 새 방장 기기로 저절로 다시 이어져요
   ⚡ 가벼움: 방장 기기는 8초마다 한 번만 판을 저장소(_save)에 적어 둬요 (이게 '방장 살아 있어요' 표시도 돼요)
      친구 기기는 화면이 오래 끊겼을 때만 그 쪽지를 한 번 들여다봐요
   ===================================================================== */
const RDMIG = {
  T: 6000, DEAD: 18000, becoming: false, badT: 0, chkT: 0, wT: 0,
  on(){ return PARTY.gid === "rd" && !!PARTY.pid && PARTY.ok(); },
  sref(pid){ return PARTY.ref(pid || PARTY.pid, "peers", "_save"); },
  playing(party){ return NG.cur && NG.gid === "rd" && !$("#ng").hidden && NG.opt && NG.opt.party === party && !NG.ended; },
  /* 📝 방장: 8초마다 판 쪽지 (나가면서 한 번 더) */
  write(){
    const P = PARTY; if (!this.on() || P.role !== "host") return Promise.resolve(null);
    const o = {at: CLOCK.now(), host: ARC.me, m: P.members.slice(), st: P.started ? "play" : "open", gen: P.gen || 0}; let s = null;
    if (P.started && this.playing("host") && NG.cur.pack){ try { const d = NG.cur.pack(); if (d){ s = JSON.stringify(d); if (s.length < 850000) o.d = s; else s = null; } } catch(e){ console.warn(e); } }
    if (!P.started){ o.d = ""; Store.fs.updateDoc(P.ref(P.pid), {at: CLOCK.now(), n: P.members.length}).catch(() => {}); }   // 🚪 대기실: 방 목록에 '살아 있는 방'으로 자주 표시 (꺼진 방은 금방 사라져요)
    return Store.fs.setDoc(this.sref(), o, {merge: true}).then(() => s, e => { console.warn(e); return s; });
  },
  beat(){ clearInterval(PARTY.migT); PARTY.migT = setInterval(() => this.write(), this.T); this.write(); },
  /* 🚪 방장이 나갈 때: 다음 친구에게 넘겨요 (남은 친구가 없으면 예전처럼 방을 닫아요) */
  handOff(){
    const P = PARTY, me = ARC.me;
    const live = no => { const q = P.peers.get(no); return q && !q.spec && (q.relay || (q.open && q.r && q.r.readyState === "open")); };
    const succ = P.members.find(no => no !== me && live(no));
    if (succ == null) return false;
    const gen = (P.gen || 0) + 1, pid = P.pid; P.gen = gen;
    let d = null; try { d = P.started && this.playing("host") && NG.cur.pack ? JSON.stringify(NG.cur.pack()) : null; } catch(e) {}
    P.peers.forEach(q => P.send(q, Object.assign({t: "mig", host: succ, gen}, q.no === succ && d && d.length < 200000 ? {d} : {})));
    if (P.rly) P.rlyFlush();
    this.write().then(() => Store.fs.updateDoc(PARTY.ref(pid), {host: succ, gen, at: CLOCK.now()}).catch(e => console.warn(e)));
    P._keepRoom = true;
    try { toast(`👑 ${who(succ)}에게 방장을 넘겼어요 · 친구들은 계속 이어서 해요`); } catch(e) {}
    return true;
  },
  /* 🧒 친구: 새 방장으로 옮겨 가요 */
  migTo(nh, gen, d){
    const P = PARTY; if (P.role !== "guest" || P.gid !== "rd" || nh == null) return;
    if (gen != null && gen <= (P.gen || 0) && nh === P.host) return;
    if (gen != null) P.gen = Math.max(P.gen || 0, gen);
    if (nh === ARC.me){ if (!P.spec) this.become(d, P.host); return; }
    if (nh === P.host) return;
    const H = P.hp; P.hp = null;
    if (H){ if (H.pc){ H.pc.onconnectionstatechange = null; setTimeout(() => { try { H.pc.close(); } catch(e) {} }, 0); } }
    P.host = nh; P.inSeq = 0; P.reTry = 0; const now = performance.now(); P.snapT = now; P.joinT = now; P.rxT = now; this.badT = 0;
    if (P.myRef) Store.fs.setDoc(P.myRef, Object.assign({no: ARC.me, st: "knock", at: Date.now()}, P.spec ? {w: 1} : {})).catch(() => {});
    if (P.armCon) P.armCon();
    if (P.canRejoin() && !P.spec && NG.cur && NG.gid === "rd") P.rjSet("rd");
    toast(`👑 ${who(nh)} 친구가 새 방장이 됐어요! 그대로 이어서 해요`);
    if (!NG.cur || $("#ng").hidden) P.renderRooms();
  },
  /* 👑 내가 새 방장 */
  async become(dStr, old){
    const P = PARTY, fs = Store.fs, pid = P.pid, me = ARC.me, rref = P.ref(pid);
    if (P.role !== "guest" || this.becoming) return; this.becoming = true;
    try {
      /* 여러 친구가 동시에 방장이 되려고 하면 → 저장소가 한 명만 정해 줘요 */
      let took = null;
      await fs.runTransaction(Store.db, async t => { const s = await t.get(rref); const r = s.exists() ? s.data() : null;
        if (!r || r.st === "closed"){ took = "gone"; return; }
        if (r.host !== me && r.host !== old){ took = r.host; return; }
        t.update(rref, {host: me, gen: Math.max(P.gen || 0, r.gen || 0) + (r.host === me ? 0 : 1), at: CLOCK.now()}); took = me; });
      if (took === "gone"){ this.becoming = false; P.hostGone("방이 닫혔어요"); return; }
      if (took !== me){ this.becoming = false; this.migTo(took); return; }
      let S = null; try { const s = await fs.getDoc(this.sref(pid)); S = s.exists() ? s.data() : null; } catch(e) {}
      let blob = null; try { blob = JSON.parse(dStr || (S && S.d) || "null"); } catch(e) {}
      const inGame = this.playing("guest") && !NG.opt.spec;
      if (!inGame || !blob || blob.seed !== NG.opt.seed) blob = null;
      // 친구 쪽 연결 정리
      const H = P.hp; P.hp = null; if (H && H.pc){ H.pc.onconnectionstatechange = null; setTimeout(() => { try { H.pc.close(); } catch(e) {} }, 0); }
      P.un.forEach(f => { try { f(); } catch(e) {} }); P.un = []; clearTimeout(P.conT); clearInterval(P.wdT); clearTimeout(P.specT); P.rjClear();
      fs.deleteDoc(P.ref(pid, "peers", String(me))).catch(() => {});
      P.role = "host"; P.host = me; P.peers = new Map(); P.myRef = null; P.spec = false; P.seq = 0; P.lastGv = -1; P.rly = null;
      P.un.push(fs.onSnapshot(P.col(pid, "peers"), qs => qs.docChanges().forEach(ch => P.onPeerDoc(ch.type, ch.doc.id, ch.doc.data())), e => console.warn(e)));
      clearInterval(P.beat); P.beat = setInterval(() => { if (P.role === "host") fs.updateDoc(P.ref(P.pid), {at: CLOCK.now(), n: P.members.length, w: P.specs().length}).catch(() => {}); }, 25000);
      if (blob){
        const sids = NG.sids.slice(), myIdx = NG.opt.idx, remote = {};
        P.members = sids.map(noOf_); P.started = true; P.startMsg = {t: "start", g: "rd", sids, seed: blob.seed};
        P.members.forEach((no, i) => { if (i !== myIdx) remote[i] = no; });
        fs.updateDoc(rref, {st: "play", m: P.members, n: P.members.length, at: CLOCK.now()}).catch(() => {});
        getAC(); NG.play("rd", sids, {party: "host", local: [myIdx], remote, seed: blob.seed, mig: blob});
        toast("👑 내가 새 방장이 됐어요! 친구들이 내 기기로 이어져요");
      } else {
        const oldM = (S && S.m) || P.members || [];
        P.started = false; P.startMsg = null; P.members = [me].concat(oldM.filter(no => no !== me && no !== old));
        fs.updateDoc(rref, {st: "open", n: 1, at: CLOCK.now()}).catch(() => {});
        if (NG.cur && !$("#ng").hidden){ const r = P.role; P.role = null; NG.close(); P.role = r; setTimeout(() => RDM.menu(), 60); }
        else P.renderRooms();
        P.lobbyMsg(); toast("👑 내가 새 방장이 됐어요! 친구들이 다시 들어오면 ▶ 시작을 눌러요");
      }
      this.beat();
    } catch(e){ console.error(e); toast("⚠️ 방장을 이어받지 못했어요"); if (P.role === "guest") P.hostGone("방장이 나갔어요"); }
    this.becoming = false;
  },
  /* 👀 친구 기기 지킴이: 화면이 오래 끊기면 → 방장 기기가 살아 있는지(8초 쪽지) 보고, 꺼졌으면 차례대로 새 방장 */
  async check(){
    const P = PARTY; if (P.role !== "guest" || P.gid !== "rd" || P.spec || this.becoming || !P.pid || !P.ok()) { this.badT = 0; return; }
    const now = performance.now(), inGame = this.playing("guest");
    const bad = inGame ? now - Math.max(P.snapT || 0, P.rxT || 0) > 8000 : !P.on();
    if (!bad){ this.badT = 0; return; }
    if (!this.badT) this.badT = now; if (now - this.badT < 5000 || now - this.chkT < 5000) return; this.chkT = now;
    let S = null; try { const s = await Store.fs.getDoc(this.sref()); S = s.exists() ? s.data() : null; } catch(e){ return; }
    if (!S || P.role !== "guest") return;
    const st0 = CLOCK.now() - (S.at || 0);
    if (!inGame && st0 >= this.DEAD && !(S.m || []).includes(ARC.me)) return P.hostGone("😢 방장 기기가 꺼져 있는 방이에요. 다른 방에 들어가거나 새 방을 만들어 봐요");
    if (S.host != null && S.host !== P.host && (S.gen || 0) > (P.gen || 0)) return this.migTo(S.host, S.gen);
    const stale = CLOCK.now() - (S.at || 0); if (stale < this.DEAD) return;   // 방장 기기는 살아 있어요 (내 연결만 흔들림 → 다리로 이어요)
    const old = P.host, C = (S.m || P.members || []).filter(no => no !== old && (no === ARC.me || LIVE.online(sidOf(no))));
    if (!C.length) return;
    const nh = C[Math.floor((stale - this.DEAD)/15000) % C.length];
    if (nh === ARC.me) this.become(null, old);
  }
};
window.RDMIG = RDMIG;
(function(){
  PARTY.onMig = function(m){ if (this.gid === "rd") RDMIG.migTo(m.host, m.gen, m.d); else this.hostGone("방장이 방을 나갔어요"); };
  PARTY.onHostMove = function(d){ if (this.gid === "rd") RDMIG.migTo(d.host, d.gen); };
  const leave = PARTY.leave;
  PARTY.leave = function(){ if (this.gid === "rd" && this.role === "host" && this.pid && !RDMIG.becoming) RDMIG.handOff(); return leave.apply(this, arguments); };
  const create = PARTY.create;
  PARTY.create = async function(){ const r = await create.apply(this, arguments); if (this.gid === "rd" && this.role === "host" && this.pid){ this.gen = 0; RDMIG.beat(); } return r; };
  const start = PARTY.start;
  PARTY.start = function(){ const r = start.apply(this, arguments); if (this.gid === "rd" && this.role === "host" && this.started) RDMIG.write(); return r; };
  const join = PARTY.join;
  PARTY.join = function(){ if (this.gid === "rd") this.gen = 0; return join.apply(this, arguments); };
  setInterval(() => { if (PARTY.role === "guest" && PARTY.gid === "rd") RDMIG.check(); }, 2000);
})();
