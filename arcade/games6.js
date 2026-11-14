/* =====================================================================
   🐾 동물 랜덤 디펜스 — 동물 친구를 뽑고, 같은 친구 3마리를 합쳐 더 센 동물로!
   - 빙글빙글 도는 길을 따라 오는 몬스터를 동물들이 막아요. 몬스터가 너무 많이 쌓이면 끝!
   - 100단계 (10단계마다 맵이 바뀌고 👑 보스, 5단계마다 😈 중간 보스)
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
  {n: "신화", c: "#ff6b9a", c2: "#ffe3ec", sell: 450}
];
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
  trex:    {e: "🦖", n: "티라노",   g: 4, d: 2600, cd: 80, r: 2.5, sp: 1.3, st: .15, t: "쿵쿵 짓밟기"}
};
const RD_K = Object.keys(RD_A), RD_BY = [0, 1, 2, 3, 4].map(g => RD_K.filter(k => RD_A[k].g === g));
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
const RD_PC = ["#ff922b", "#4dabf7", "#51cf66", "#f783ac"];

NG.defs.rd = () => {
  const O = NG.opt || {}, SIDS = NG.sids.slice(0, 4), N = SIDS.length;
  const party = O.party || null, myIdx = party === "guest" ? O.idx : 0;
  const local = party === "guest" ? [O.idx] : (O.local || [0]).slice(0, 2);
  const remote = i => party === "host" && O.remote && O.remote[i] != null;
  const ZC = 6, ZR = 3, ZS = ZC*ZR, LIMIT = 100 + 40*(N - 1);
  let W = 1280, H = 720, land = true, C = 90, BX = 0, BY = 0, COLS = 8, ROWS = 5, GC = 1, TOPH = 70, BOTH = 120, ZO = [], PATH = [], PL = 0, layer = null, layerKey = "";
  let Z, PS, E, PR, FX, wave, waveT, spawnLeft, spawnT, state, overT, score, kills, bossK, eid, gv, speed, banner, sel, drag, ptr, panel, NQ, outbox, aseq, lastAct, sndT, ended, seed, bossTimer, frame;
  const R = (() => { let s = 1; return {seed(v){ s = (v >>> 0) || 1; }, f(){ s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s/4294967296; }}; })();
  const th = () => RD_TH[Math.min(9, Math.floor((Math.max(1, wave) - 1)/10))];
  const hpAt = w => 15*Math.pow(1.19, w - 1)*(1 + Math.max(0, w - 30)*.03);
  const isMine = z => local.includes(z);
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
    const GR = Math.ceil(N/GC); COLS = GC*ZC + 2; ROWS = GR*ZR + 2;
    const aw = W - 16, ah = H - TOPH - BOTH - 12;
    C = Math.floor(Math.min(112, aw/COLS, ah/ROWS)); BX = Math.round((W - COLS*C)/2); BY = Math.round(TOPH + 6 + (ah - ROWS*C)/2);
    ZO = []; for (let z = 0; z < Math.max(N, GC*GR); z++) ZO.push([1 + (z % GC)*ZC, 1 + Math.floor(z/GC)*ZR]);
    const a = .5, b = COLS - .5, c = ROWS - .5;
    PATH = [[a, a], [b, a], [b, c], [a, c], [a, a]]; PL = 2*((COLS - 1) + (ROWS - 1));
    layerKey = ""; panel = null;
  }
  function posAt(d){ d = ((d % PL) + PL) % PL; const w = COLS - 1, h = ROWS - 1;
    if (d < w) return [.5 + d, .5]; d -= w; if (d < h) return [COLS - .5, .5 + d]; d -= h; if (d < w) return [COLS - .5 - d, ROWS - .5]; d -= w; return [.5, ROWS - .5 - d]; }
  const cx = c => BX + c*C, cy = r => BY + r*C;
  const slotXY = (z, s) => [ZO[z][0] + (s % ZC) + .5, ZO[z][1] + Math.floor(s/ZC) + .5];
  const UOFF = [[[0, 0]], [[-.19, .02], [.19, .02]], [[0, -.18], [-.2, .15], [.2, .15]]];

  /* ---------- 그림 ---------- */
  function buildLayer(){
    const key = `${th().n}|${W}|${H}|${C}|${N}`; if (key === layerKey && layer) return; layerKey = key;
    const k = NG.k || 1; layer = layer || document.createElement("canvas"); layer.width = Math.ceil(COLS*C*k); layer.height = Math.ceil(ROWS*C*k);
    const t = layer.getContext("2d"); t.setTransform(k, 0, 0, k, 0, 0); t.clearRect(0, 0, COLS*C, ROWS*C); const T = th(), w = COLS*C, h = ROWS*C;
    // 바깥 테두리 · 풀밭
    t.fillStyle = "rgba(0,0,0,.25)"; rrect(t, 4, 8, w - 4, h - 4, C*.3); t.fill();
    t.fillStyle = BSA.lg(t, 0, 0, 0, h, [[0, T.gr[0]], [1, T.gr[1]]]); rrect(t, 0, 0, w, h - 4, C*.3); t.fill();
    // 길 (빙글빙글)
    t.save(); rrect(t, 0, 0, w, h - 4, C*.3); t.clip();
    t.fillStyle = BSA.lg(t, 0, 0, 0, h, [[0, T.pa[0]], [1, T.pa[1]]]); t.fillRect(0, 0, w, C); t.fillRect(0, h - C - 4, w, C + 4); t.fillRect(0, 0, C, h); t.fillRect(w - C, 0, C, h);
    const rr = BSA.rng(7 + wave); t.fillStyle = "rgba(255,255,255,.18)";
    for (let i = 0; i < 2*(COLS + ROWS)*3; i++){ const [px, py] = posAt(rr()*PL); t.beginPath(); t.ellipse(px*C + (rr() - .5)*C*.7, py*C + (rr() - .5)*C*.7, C*.08 + rr()*C*.06, C*.05 + rr()*C*.04, 0, 0, 7); t.fill(); }
    t.strokeStyle = "rgba(0,0,0,.18)"; t.lineWidth = 3; t.strokeRect(C, C, w - 2*C, h - 2*C - 4);
    // 길 화살표
    t.fillStyle = "rgba(255,255,255,.35)"; for (let d = 1; d < PL; d += 3){ const [x0, y0] = posAt(d), [x1, y1] = posAt(d + .3), a = Math.atan2(y1 - y0, x1 - x0); t.save(); t.translate(x0*C, y0*C); t.rotate(a); t.beginPath(); t.moveTo(C*.16, 0); t.lineTo(-C*.08, -C*.12); t.lineTo(-C*.08, C*.12); t.closePath(); t.fill(); t.restore(); }
    t.restore();
    // 칸
    ZO.forEach((o, z) => { const own = z < N, col = own ? RD_PC[z] : "#868e96";
      t.fillStyle = own ? "rgba(255,255,255,.14)" : "rgba(0,0,0,.12)"; rrect(t, o[0]*C + 3, o[1]*C + 3, ZC*C - 6, ZR*C - 6, C*.22); t.fill();
      t.strokeStyle = col; t.lineWidth = 3; t.globalAlpha = own ? .85 : .35; t.stroke(); t.globalAlpha = 1;
      if (!own){ G2.emo(t, T.deco[0] === "🌼" ? "🌳" : [...T.deco][1], o[0]*C + ZC*C/2, o[1]*C + ZR*C/2, C*.9); return; }
      for (let s = 0; s < ZS; s++){ const x = (o[0] + (s % ZC))*C, y = (o[1] + Math.floor(s/ZC))*C; t.fillStyle = "rgba(0,0,0,.12)"; rrect(t, x + C*.08, y + C*.1, C*.84, C*.84, C*.18); t.fill(); t.fillStyle = "rgba(255,255,255,.22)"; rrect(t, x + C*.08, y + C*.06, C*.84, C*.84, C*.18); t.fill(); } });
    // 꾸미기 (네 귀퉁이)
    const dz = [...th().deco]; [[.5, .5], [COLS - .5, .5], [COLS - .5, ROWS - .5], [.5, ROWS - .5]].forEach(([x, y], i) => { G2.emo(t, dz[i % dz.length], x*C, y*C, C*.62); });
  }
  const unitSpr = (k, s) => sp(`u${k}${s}`, s, s, (t) => { const A = RD_A[k], G = RD_G[A.g], m = s/2;
    t.fillStyle = "rgba(0,0,0,.25)"; t.beginPath(); t.ellipse(m, s*.92, s*.36, s*.08, 0, 0, 7); t.fill();
    t.fillStyle = BSA.rg(t, m - s*.12, m - s*.16, 2, s*.46, [[0, "#fff"], [.7, G.c2], [1, G.c]]); t.beginPath(); t.arc(m, m, s*.44, 0, 7); t.fill();
    if (A.g === 4 && t.createConicGradient){ const cg = t.createConicGradient(0, m, m); ["#ff6b6b", "#ffd43b", "#69db7c", "#4dabf7", "#cc5de8", "#ff6b6b"].forEach((c, i) => cg.addColorStop(i/5, c)); t.strokeStyle = cg; }
    else t.strokeStyle = G.c;
    t.lineWidth = Math.max(3, s*.075); t.stroke(); t.strokeStyle = "rgba(27,18,51,.6)"; t.lineWidth = 1.5; t.beginPath(); t.arc(m, m, s*.48, 0, 7); t.stroke();
    G2.emo(t, A.e, m, m + s*.03, s*.58);
    if (A.g >= 3){ t.fillStyle = A.g === 4 ? "#ff6b9a" : "#f59f00"; t.font = `bold ${Math.round(s*.2)}px sans-serif`; t.textAlign = "center"; t.textBaseline = "middle"; t.fillText(A.g === 4 ? "★★" : "★", m, s*.1); } });
  function slimeSpr(kind, f){ const T = th(), s = Math.round(kind === 2 ? C*1.25 : kind === 1 ? C*.85 : C*.6);   // 그릴 크기 그대로 (늘이기 없이)
    return sp(`sl${T.n}${kind}${f}`, s, s, (t) => { const m = s/2, sq = f ? .06 : 0, by = s*.62, rw = s*(.42 + sq), rh = s*(.34 - sq);
      t.fillStyle = "rgba(0,0,0,.22)"; t.beginPath(); t.ellipse(m, s*.93, s*.34, s*.07, 0, 0, 7); t.fill();
      if (kind === 1){ t.fillStyle = "#fff3bf"; [[-1], [1]].forEach(([d]) => { t.beginPath(); t.moveTo(m + d*rw*.45, by - rh*.75); t.lineTo(m + d*rw*.85, by - rh*1.45); t.lineTo(m + d*rw*.15, by - rh*.95); t.closePath(); t.fill(); }); }
      t.beginPath(); t.ellipse(m, by, rw, rh, 0, Math.PI, 0); t.lineTo(m + rw, by + rh*.55); t.quadraticCurveTo(m, by + rh*.85, m - rw, by + rh*.55); t.closePath();
      t.fillStyle = BSA.rg(t, m - rw*.35, by - rh*.5, 2, rw*1.2, [[0, "#fff"], [.35, T.sl[0]], [1, T.sl[1]]]); t.fill(); BSA.ol(t, Math.max(2, s*.045));
      t.fillStyle = "rgba(255,255,255,.55)"; t.beginPath(); t.ellipse(m - rw*.45, by - rh*.55, rw*.16, rh*.12, -.5, 0, 7); t.fill();
      const ey = by - rh*.1, ex = rw*.34, er = s*.075; [-1, 1].forEach(d => { t.fillStyle = "#fff"; t.beginPath(); t.arc(m + d*ex, ey, er*1.25, 0, 7); t.fill(); t.fillStyle = T.ey === "#fff" ? "#1b1233" : T.ey; t.beginPath(); t.arc(m + d*ex + er*.25, ey + (f ? er*.2 : 0), er*.7, 0, 7); t.fill(); });
      t.strokeStyle = "#1b1233"; t.lineWidth = Math.max(1.5, s*.03); t.beginPath(); t.arc(m, ey + er*1.6, er*.8, .2, Math.PI - .2); t.stroke();
      if (kind === 2){ t.fillStyle = "#ffd43b"; t.beginPath(); const cy0 = by - rh - s*.02; t.moveTo(m - s*.2, cy0); t.lineTo(m - s*.22, cy0 - s*.16); t.lineTo(m - s*.1, cy0 - s*.07); t.lineTo(m, cy0 - s*.2); t.lineTo(m + s*.1, cy0 - s*.07); t.lineTo(m + s*.22, cy0 - s*.16); t.lineTo(m + s*.2, cy0); t.closePath(); t.fill(); BSA.ol(t, 2); } }); }
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
  function mkZone(){ return {s: Array.from({length: ZS}, () => ({k: null, n: 0, cd: [0, 0, 0], hit: 0})), gold: 140, gems: 0, up: [0, 0, 0], sum: 0, ack: 0}; }
  function startWave(){
    wave++; const boss = wave % 10 === 0, mini = !boss && wave % 5 === 0;
    waveT = boss ? 60*60 : 20*60; spawnLeft = boss ? 0 : Math.round((30 + Math.min(14, wave*.3))*(1 + .6*(N - 1))); spawnT = 0;
    if (wave > 1) Z.forEach(p => p.gold += 10 + Math.floor(wave*1.5));
    if (boss){ spawn(2); bossTimer = waveT; banner = {t: `👑 ${wave}단계 보스!`, s: "60초 안에 꼭 잡아요!", k: 150, c: "#ff6b6b"}; sfx("boss"); }
    else { if (mini) spawn(1); banner = {t: `🏁 ${wave}단계`, s: wave % 10 === 1 ? th().n + "에 왔어요!" : mini ? "😈 중간 보스가 섞여 있어요" : "", k: 110}; sfx("wave"); }
    if (wave % 10 === 1){ layerKey = ""; setSky(); }
    if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c || ""]);
  }
  function spawn(kind){ const h = hpAt(wave)*(kind === 2 ? 28*(1 + .5*(N - 1)) : kind === 1 ? 10*(1 + .3*(N - 1)) : 1);
    E.push({id: ++eid, kind, d: 0, tr: 0, hp: h, mhp: h, spd: (kind === 2 ? 1.15 : kind === 1 ? 1.55 : 2.05 + Math.min(.6, wave*.012))/60, slT: 0, slF: 0, stT: 0, x: .5, y: .5, f: R.f()*60|0}); }
  function setSky(){ const cv = $("#ngCanvas"); cv.style.backgroundImage = (bgURL ? `url(${bgURL}),` : "") + th().sky; cv.style.backgroundColor = "#1c1d52";
    if (bgURL){ cv.style.backgroundSize = `${COLS*C/W*100}% ${ROWS*C/H*100}%, 100% 100%`; cv.style.backgroundPosition = `${W > COLS*C ? BX/(W - COLS*C)*100 : 0}% ${H > ROWS*C ? BY/(H - ROWS*C)*100 : 0}%, 0 0`; cv.style.backgroundRepeat = "no-repeat"; } else { cv.style.backgroundSize = ""; cv.style.backgroundPosition = ""; } }
  /* ⚡ 판 그림은 CSS 배경으로 (매 장면 붙이지 않아요) — 준비되기 전에는 캔버스에 붙여요 */
  let bgURL = null, bgKey = "";
  function boardBG(){ if (bgKey === layerKey) return; bgKey = layerKey; const key = layerKey; bgURL = null; setSky();
    try { layer.toBlob(bl => { if (!bl || key !== layerKey || NG.cur !== self) return; if (RD_BG.url) URL.revokeObjectURL(RD_BG.url); RD_BG.url = bgURL = URL.createObjectURL(bl); setSky(); }, "image/png"); } catch(e) {} }

  /* ---------- 동물 뽑기 · 합치기 · 팔기 · 옮기기 · 강화 · 행운 ---------- */
  function placeK(z, k, pref){ const S = Z[z].s; let i = S.findIndex(q => q.k === k && q.n < 3); if (i < 0 && pref != null && !S[pref].k) i = pref; if (i < 0) i = S.findIndex(q => !q.k); if (i < 0) return -1;
    const q = S[i]; if (!q.k){ q.k = k; q.n = 0; } q.cd[q.n] = 10 + q.n*7; q.n++; q.hit = 12; gv++; return i; }
  const sumCost = z => 20 + Z[z].sum;
  function rollG(){ const r = R.f(); return r < .015 ? 2 : r < .15 ? 1 : 0; }
  function pick(g){ const L = RD_BY[g]; return L[Math.floor(R.f()*L.length)]; }
  function doAct(z, a){
    const p = Z[z]; if (!p || state !== "play") return;
    const S = p.s, ty = a[0];
    if (ty === "sum"){ const c = sumCost(z); if (p.gold < c){ toastZ(z, "💰 금이 모자라요"); return; }
      const g = rollG(), k = pick(g), i = placeK(z, k); if (i < 0){ toastZ(z, "🈵 자리가 꽉 찼어요! 합치거나 팔아요"); return; }
      p.gold -= c; p.sum++; sfx(g >= 2 ? "big" : "sum", z); popAt(z, i, `${RD_A[k].e} ${RD_A[k].n}${g ? "!" : ""}`, RD_G[g].c); }
    else if (ty === "mrg"){ const i = a[1], q = S[i]; if (!q || q.n < 3 || RD_A[q.k].g >= 4) return; mergeAt(z, i); }
    else if (ty === "all"){ let n = 0; for (let loop = 0; loop < 40; loop++){ const i = S.findIndex(q => q.k && q.n >= 3 && RD_A[q.k].g < 4); if (i < 0) break; mergeAt(z, i, true); n++; }
      if (!n) toastZ(z, "🔀 3마리 모인 동물이 없어요"); else sfx("merge", z); }
    else if (ty === "sel"){ const i = a[1], q = S[i]; if (!q || !q.k) return; const v = RD_G[RD_A[q.k].g].sell; q.n--; if (!q.n) q.k = null; p.gold += v; gv++; sfx("sell", z); popAt(z, i, `+${v}💰`, "#ffe066"); }
    else if (ty === "mov"){ const i = a[1], j = a[2]; if (i === j || !S[i] || !S[j]) return; const t = S[i]; S[i] = S[j]; S[j] = t; gv++; }
    else if (ty === "up"){ const g = a[1], c = upCost(z, g); if (p.up[g] >= 25) return; if (p.gold < c){ toastZ(z, "💰 금이 모자라요"); return; } p.gold -= c; p.up[g]++; sfx("up", z); toastZ(z, `⬆️ ${["일반·희귀", "영웅·전설", "신화"][g]} 공격력 Lv.${p.up[g]}!`); gv++; }
    else if (ty === "luck"){ const big = a[1] === 1, c = big ? 4 : 1; if (p.gems < c){ toastZ(z, "💎 보석이 모자라요 (보스를 잡으면 생겨요)"); return; }
      const r = R.f(), g = big ? (r < .35 ? 4 : 3) : (r < .15 ? 3 : r < .7 ? 2 : -1);
      if (g < 0){ p.gems -= c; sfx("fail", z); toastZ(z, "😅 꽝! 다음엔 꼭!"); return; }
      const k = pick(g), i = placeK(z, k); if (i < 0){ toastZ(z, "🈵 자리가 꽉 찼어요"); return; } p.gems -= c; sfx("big", z); popAt(z, i, `✨ ${RD_A[k].e} ${RD_A[k].n}!`, RD_G[g].c); }
  }
  function mergeAt(z, i, quiet){ const S = Z[z].s, q = S[i], g = RD_A[q.k].g; q.k = null; q.n = 0; gv++;
    const k = pick(g + 1), j = placeK(z, k, i); if (!quiet) sfx(g + 1 >= 3 ? "big" : "merge", z); else if (g + 1 >= 3) sfx("big", z);
    popAt(z, j, `${RD_A[k].e} ${RD_A[k].n}${g + 1 >= 3 ? "!!" : "!"}`, RD_G[g + 1].c); fxRing(z, j, RD_G[g + 1].c); }
  const upCost = (z, g) => [30, 90, 250][g]*(Z[z].up[g] + 1);
  const upMul = (z, g) => 1 + .3*Z[z].up[g < 2 ? 0 : g < 4 ? 1 : 2];
  function toastZ(z, s){ if (isMine(z)) FX.push({tx: s, x: W/2, y: H - BOTH - 26, t: 90, c: "#fff", ui: 1, z}); else if (party === "host" && remote(z)) NQ.push(["t", z, s]); }
  function popAt(z, i, s, c){ if (i < 0) return; const [x, y] = slotXY(z, i); FX.push({tx: s, x, y: y - .4, t: 70, c, cell: 1}); if (party === "host") NQ.push(["p", z, i, s, c]); }
  function fxRing(z, i, c){ if (i < 0) return; const [x, y] = slotXY(z, i); FX.push({ring: 1, x, y, t: 26, c}); if (party === "host") NQ.push(["r", +x.toFixed(2), +y.toFixed(2), c]); }

  /* ---------- 싸움 (방장 기기) ---------- */
  const buffMap = () => { const B = Z.map(p => p.s.map(() => 1));
    Z.forEach((p, z) => p.s.forEach((q, i) => { if (!q.k || !RD_A[q.k].bf) return; const [x, y] = slotXY(z, i);
      Z.forEach((p2, z2) => p2.s.forEach((q2, j) => { if (!q2.k) return; const [x2, y2] = slotXY(z2, j); if ((x2 - x)**2 + (y2 - y)**2 < 1.7*1.7) B[z2][j] = Math.max(B[z2][j], 1 + RD_A[q.k].bf); })); }));
    return B; };
  let BUF = null, bufV = -1;
  const fxN = {t: 0, r: 0};   // ⚡ 한꺼번에 너무 많은 반짝이를 그리지 않게 세어요
  function attack(viz){
    fxN.t = FX.reduce((a, f) => a + (f.sm ? 1 : 0), 0); fxN.r = FX.reduce((a, f) => a + (f.k ? 1 : 0), 0);
    if (!viz && bufV !== gv){ BUF = buffMap(); bufV = gv; }
    for (let z = 0; z < Z.length; z++){ const p = Z[z];
      for (let i = 0; i < ZS; i++){ const q = p.s[i]; if (!q.k) continue; const A = RD_A[q.k], [sx, sy] = slotXY(z, i), r2 = A.r*A.r;
        for (let u = 0; u < q.n; u++){ if (--q.cd[u] > 0) continue;
          // 가장 앞서가는 몬스터부터
          let tg = [], best = -1; const mt = A.mt || 1;
          for (const e of E){ const dx = e.x - sx, dy = e.y - sy; if (dx*dx + dy*dy > r2) continue; if (mt === 1){ if (e.tr > best){ best = e.tr; tg[0] = e; } } else tg.push(e); }
          if (!tg.length){ q.cd[u] = 6; continue; }
          if (mt > 1) tg = tg.sort((a, b) => b.tr - a.tr).slice(0, mt);
          q.cd[u] = A.cd; q.hit = 8;
          const ox = sx + UOFF[q.n - 1][u][0], oy = sy + UOFF[q.n - 1][u][1];
          tg.forEach(e => { PR.push({x0: ox, y0: oy, e, x1: e.x, y1: e.y, t: 0, T: 7, g: A.g}); if (viz) return;
            const cr = A.cr && R.f() < A.cr, dm = A.d*upMul(z, A.g)*(BUF ? BUF[z][i] : 1)*(cr ? 3 : 1);
            hitE(e, dm, A); if (cr && fxN.t < 6){ fxN.t++; FX.push({tx: "치명타!", x: e.x, y: e.y - .35, t: 34, c: "#ff6b6b", cell: 1, sm: 1}); }
            if (A.sp){ for (const o of E){ if (o !== e && (o.x - e.x)**2 + (o.y - e.y)**2 < A.sp*A.sp) hitE(o, dm*.6, A); } } });
          if (A.sp && fxN.r < 14){ fxN.r++; const e = tg[0]; FX.push({ring: 1, x: e.x, y: e.y, t: 16, c: RD_G[A.g].c, r: A.sp, k: 1}); }
        } } }
  }
  function hitE(e, dm, A){ e.hp -= dm; if (A.sl){ e.slT = 90; e.slF = Math.max(e.slF, A.sl); } if (A.st && R.f() < A.st) e.stT = 40; }
  function sim(){
    frame++;
    if (state !== "play") return;
    if (--waveT <= 0){ if (E.some(e => e.kind === 2)){ lose("👑 보스를 시간 안에 못 잡았어요"); return; } startWave(); }
    if (spawnLeft > 0 && --spawnT <= 0){ spawn(0); spawnLeft--; spawnT = 28; }
    for (const e of E){ if (e.stT > 0){ e.stT--; } else { const v = e.spd*(e.slT > 0 ? 1 - e.slF : 1); e.d += v; e.tr += v; } if (e.slT > 0 && --e.slT === 0) e.slF = 0; const pp = posAt(e.d); e.x = pp[0]; e.y = pp[1]; e.f++; }
    attack(false);
    for (let i = E.length - 1; i >= 0; i--){ const e = E[i]; if (e.hp > 0) continue; E.splice(i, 1); kills++;
      const gd = e.kind === 2 ? 120 : e.kind === 1 ? 35 : 2; Z.forEach(p => p.gold += gd);
      if (e.kind){ const gm = e.kind === 2 ? 2 : 1; Z.forEach(p => p.gems += gm); bossK += e.kind === 2 ? 1 : 0; sfx("kboss"); banner = {t: e.kind === 2 ? "🎉 보스 처치!" : "😈 중간 보스 처치!", s: `💎 보석 +${gm} · 💰 +${gd}`, k: 120, c: "#ffe066"};
        if (party === "host") NQ.push(["b", banner.t, banner.s, banner.k, banner.c]); boom(e.x, e.y, 1);
        if (e.kind === 2 && waveT > 180) waveT = 180; }
      else if (FX.length < 200) boom(e.x, e.y, 0); }
    const n = E.length; if (n >= LIMIT){ lose("👾 몬스터가 너무 많이 쌓였어요"); return; }
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
  function snap(){ return {w: wave, wt: waveT, st: state, sc: score, kl: kills, bk: bossK, gv,
    P: Z.map(p => [Math.floor(p.gold), p.gems, p.up[0], p.up[1], p.up[2], p.sum, p.ack]),
    E: E.map(e => [e.id, e.kind, Math.round(e.d*100), Math.max(1, Math.round(e.hp/e.mhp*100)), (e.slT > 0 ? 1 : 0) | (e.stT > 0 ? 2 : 0)])}; }
  function apply(d){
    if (d.grid){ if (!Z) return; d.grid.z.forEach((arr, z) => arr.forEach((v, i) => { const q = Z[z].s[i]; if (v < 0){ q.k = null; q.n = 0; } else { const k = RD_K[v >> 2], n = v & 3; if (q.k !== k || q.n !== n) q.hit = 10; q.k = k; q.n = n; } })); gv = d.grid.gv; return; }
    if (d.ev){ d.ev.forEach(e => { const k = e[0];
      if (k === "s"){ if (e[2] < 0 || isMine(e[2])) playS(e[1]); }
      else if (k === "b") banner = {t: e[1], s: e[2], k: e[3], c: e[4] || undefined};
      else if (k === "t"){ if (isMine(e[1])) FX.push({tx: e[2], x: W/2, y: H - BOTH - 26, t: 90, c: "#fff", ui: 1}); }
      else if (k === "p"){ const [x, y] = slotXY(e[1], e[2]); FX.push({tx: e[3], x, y: y - .4, t: 70, c: e[4], cell: 1}); }
      else if (k === "r") FX.push({ring: 1, x: e[1], y: e[2], t: 26, c: e[3], r: 1.4}); }); return; }
    const s = d.s; if (!s) return;
    if (s.w !== wave){ const nt = Math.floor((s.w - 1)/10) !== Math.floor((Math.max(1, wave) - 1)/10); wave = s.w; if (nt){ layerKey = ""; setSky(); } }
    waveT = s.wt; state = s.st; score = s.sc; kills = s.kl; bossK = s.bk;
    s.P.forEach((a, z) => { const p = Z[z]; if (!p) return; p.gold = a[0]; p.gems = a[1]; p.up = [a[2], a[3], a[4]]; p.sum = a[5]; if (z === myIdx){ const ack = a[6]; outbox = outbox.filter(o => o[0] > ack); } });
    const old = new Map(E.map(e => [e.id, e]));
    E = s.E.map(a => { const o = old.get(a[0]), d0 = a[2]/100, kind = a[1];
      const e = o || {id: a[0], kind, d: d0, tr: d0, spd: (kind === 2 ? 1.15 : kind === 1 ? 1.55 : 2.05 + Math.min(.6, wave*.012))/60, f: a[0]*7, x: 0, y: 0};
      if (o){ let dd = d0 - o.d; if (Math.abs(dd) > 2) o.d = d0; else o.d += dd*.5; } e.hpR = a[3]/100; e.sl = a[4] & 1; e.stn = a[4] & 2; return e; });
    if (s.gv !== gv) PARTY.needGrid();
  }
  function guestStep(){
    frame++;
    for (const e of E){ if (!e.stn){ const v = e.spd*(e.sl ? .6 : 1); e.d += v; e.tr = (e.tr || 0) + v; } const pp = posAt(e.d); e.x = pp[0]; e.y = pp[1]; e.f++; }
    attack(true);
    if (outbox.length && frame % 6 === 0) PARTY.sendIn({sd: seed, a: outbox}, true);
  }
  function act(z, a){ if (party === "guest"){ outbox.push([++aseq, ...a]); if (frame % 6 !== 0) PARTY.sendIn({sd: seed, a: outbox}, true); if (a[0] === "sum") playS("sum"); return; } doAct(z, a); }

  /* ---------- 아래 단추 (사람마다) ---------- */
  function bars(){
    const L = []; const two = local.length >= 2;
    if (window.VK_ON){ local.forEach((z, si) => { const w = two && land ? W/2 : W, x0 = two && land ? si*W/2 : 0, y0 = two && !land ? H - BOTH + si*BOTH/2 : H - BOTH, h = two && !land ? BOTH/2 : BOTH; L.push({id: "info", z, x: x0 + 10, y: y0 + 6, w: w - 20, h: h - 12, info: 1, wide: 1}); });
      if (party !== "guest") L.push({id: "spd", z: -1, x: W - 92, y: 8, w: 84, h: TOPH - 18}); return L; }
    local.forEach((z, si) => {
      const x0 = two ? (land ? si*W/2 : 0) : 0, w = two && land ? W/2 : W, y0 = two && !land ? H - BOTH + si*BOTH/2 : H - BOTH, h = two && !land ? BOTH/2 : BOTH;
      const pad = 10, rows = !land && !two ? 2 : 1;
      if (rows === 1){ const bw = (w - pad*2 - 8*5)/6.2, bh = h - 30;
        let x = x0 + pad; const yy = y0 + 22;
        const add = (id, ww, extra) => { L.push(Object.assign({id, z, x, y: yy, w: ww, h: bh}, extra || {})); x += ww + 8; };
        add("sum", bw*1.8); add("all", bw); add("up", bw); add("luck", bw); add("info", bw*1.4, {info: 1}); }
      else { const bh = (h - 44)/2, bw = (w - pad*2 - 16)/3;
        L.push({id: "sum", z, x: x0 + pad, y: y0 + 30, w: bw*1.6, h: bh}); L.push({id: "all", z, x: x0 + pad + bw*1.6 + 8, y: y0 + 30, w: bw*1.4 - 8 + 8, h: bh});
        L.push({id: "up", z, x: x0 + pad, y: y0 + 38 + bh, w: bw, h: bh}); L.push({id: "luck", z, x: x0 + pad + bw + 8, y: y0 + 38 + bh, w: bw, h: bh}); L.push({id: "info", z, x: x0 + pad + 2*bw + 16, y: y0 + 38 + bh, w: bw, h: bh, info: 1}); }
    });
    if (party !== "guest") L.push({id: "spd", z: -1, x: W - 92, y: 8, w: 84, h: TOPH - 18});
    return L;
  }
  let BARS = [];
  function panelBtns(){ if (!panel) return []; const b = BARS.find(q => q.id === panel.id && q.z === panel.z); if (!b) return [];
    const n = panel.id === "up" ? 3 : 2, w = Math.min(330, W - 20), h = 64, x = Math.max(10, Math.min(W - w - 10, b.x + b.w/2 - w/2)), y0 = b.y - 14 - n*(h + 8);
    return Array.from({length: n}, (_, i) => ({id: panel.id, i, z: panel.z, x, y: y0 + i*(h + 8), w, h})); }
  function selBtns(){ if (!sel) return []; const q = Z[sel.z].s[sel.i]; if (!q.k) return []; const [x, y] = slotXY(sel.z, sel.i), px = cx(x), py = cy(y) - C*.62;
    const w = 112, h = 50, L = []; const can = q.n >= 3 && RD_A[q.k].g < 4;
    L.push({id: "smrg", x: px - w - 4, y: py - h - 40, w, h, off: !can}); L.push({id: "ssel", x: px + 4, y: py - h - 40, w, h});
    L.forEach(b => { b.x = Math.max(6, Math.min(W - b.w - 6, b.x)); b.y = Math.max(TOPH + 4, b.y); }); return L; }
  const inR = (b, x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h + 6;
  function slotAt(x, y){ const c = (x - BX)/C, r = (y - BY)/C; for (let z = 0; z < N; z++){ const [ox, oy] = ZO[z], i = Math.floor(c - ox), j = Math.floor(r - oy); if (i >= 0 && i < ZC && j >= 0 && j < ZR) return {z, i: j*ZC + i}; } return null; }
  function press(b){
    if (b.id === "sum") act(b.z, ["sum"]);
    else if (b.id === "all") act(b.z, ["all"]);
    else if (b.id === "up" || b.id === "luck"){ if (b.i != null){ act(b.z, b.id === "up" ? ["up", b.i] : ["luck", b.i]); } else panel = panel && panel.id === b.id && panel.z === b.z ? null : {id: b.id, z: b.z}; }
    else if (b.id === "spd"){ speed = speed === 1 ? 2 : 1; playS("warn"); }
    else if (b.id === "smrg"){ if (!b.off){ act(sel.z, ["mrg", sel.i]); sel = null; } }
    else if (b.id === "ssel"){ act(sel.z, ["sel", sel.i]); const q = Z[sel.z].s[sel.i]; if (!q.k || q.n <= 1) sel = null; }
  }

  /* ---------- 그리기 ---------- */
  function draw(g){
    g.clearRect(0, 0, W, H);
    const k = NG.k || 1; buildLayer(); boardBG();
    g.setTransform(1, 0, 0, 1, 0, 0); if (!bgURL) g.drawImage(layer, Math.round(BX*k), Math.round(BY*k));
    unitsLayer(k); g.drawImage(uL, Math.round(BX*k), Math.round(BY*k)); g.setTransform(k, 0, 0, k, 0, 0);
    const fr = NG.frame, us = Math.round(C*.62);
    // 3마리 모인 칸: 반짝이는 🔀 표시 (동물 그림은 위 한 장에 들어 있어요)
    for (let z = 0; z < N; z++){ if (!isMine(z)) continue; Z[z].s.forEach((q, i) => { if (!q.k || q.n < 3 || RD_A[q.k].g >= 4) return; const [x, y] = slotXY(z, i); g.globalAlpha = .55 + Math.sin(fr*.15)*.4; G2.put(g, lbl(["🔀"], 20), cx(x - .5) + 1, cy(y - .5) - 2); g.globalAlpha = 1; }); }
    if (sel){ const [x, y] = slotXY(sel.z, sel.i), q = Z[sel.z].s[sel.i]; g.strokeStyle = "#fff"; g.lineWidth = 4; rrect(g, cx(x - .47), cy(y - .47), C*.94, C*.94, C*.18); g.stroke();
      if (q.k){ g.globalAlpha = .14; g.fillStyle = "#fff"; g.beginPath(); g.arc(cx(x), cy(y), RD_A[q.k].r*C, 0, 7); g.fill(); g.globalAlpha = .6; g.strokeStyle = "#fff"; g.lineWidth = 2; g.stroke(); g.globalAlpha = 1; } }
    // 몬스터
    const slS = [0, 1, 2].map(kd => [slimeSpr(kd, 0), slimeSpr(kd, 1)]);
    for (const e of E){ const s = slS[e.kind][(e.f >> 4) & 1], sz = s.w, x = cx(e.x), y = cy(e.y);
      G2.put(g, s, x - sz/2, y - sz*.7);
      const hr = e.hpR != null ? e.hpR : e.hp/e.mhp; if (hr < .999){ const bw = sz*.7; g.fillStyle = "rgba(0,0,0,.55)"; g.fillRect(x - bw/2, y - sz*.72, bw, 5); g.fillStyle = hr > .5 ? "#51cf66" : hr > .25 ? "#fcc419" : "#ff6b6b"; g.fillRect(x - bw/2, y - sz*.72, bw*hr, 5); }
      if (e.stT > 0 || e.stn) outlined(g, "💫", x, y - sz*.8, 16, "#fff");
      if (e.slT > 0 || e.sl){ g.fillStyle = "rgba(116,192,252,.35)"; g.beginPath(); g.ellipse(x, y + sz*.18, sz*.4, sz*.12, 0, 0, 7); g.fill(); } }
    // 총알
    if (PR.length > 90) PR.splice(0, PR.length - 90);
    for (let i = PR.length - 1; i >= 0; i--){ const p = PR[i]; p.t++; const a = p.t/p.T, tx = p.e && E.includes(p.e) ? p.e.x : p.x1, ty = p.e && E.includes(p.e) ? p.e.y : p.y1; p.x1 = tx; p.y1 = ty;
      const x = cx(p.x0 + (tx - p.x0)*a), y = cy(p.y0 + (ty - p.y0)*a) - Math.sin(a*Math.PI)*C*.2, s = 10 + p.g*3; G2.put(g, orbSpr(p.g), x - s, y - s);
      if (p.t >= p.T) PR.splice(i, 1); }
    // 효과
    for (let i = FX.length - 1; i >= 0; i--){ const f = FX[i]; f.t--; if (f.t <= 0){ FX.splice(i, 1); continue; }
      if (f.ring){ const T = 26, a = 1 - f.t/T, rr = (f.r || 1)*C*(.3 + a*.7); g.globalAlpha = Math.min(1, f.t/10)*.8; g.drawImage(ringSpr(f.c), cx(f.x) - rr, cy(f.y) - rr, rr*2, rr*2); g.globalAlpha = 1; continue; }
      if (f.tx){ g.globalAlpha = Math.min(1, f.t/18); const x = f.cell ? cx(f.x) : f.x, y = (f.cell ? cy(f.y) : f.y) - (f.ui ? 0 : (70 - f.t)*.5); G2.put(g, lbl(splitE(f.tx), f.sm ? 14 : f.ui ? 22 : 18, f.c), x - lbl(splitE(f.tx), f.sm ? 14 : f.ui ? 22 : 18, f.c).w/2, y - 14); g.globalAlpha = 1; } }
    // 친구 이름표
    if (N > 1) for (let z = 0; z < N; z++){ const [ox, oy] = ZO[z]; faceAt(g, SIDS[z], cx(ox) + 14, cy(oy) + 14, 13, RD_PC[z]); }
    drawTop(g, fr); drawBottom(g);
    if (banner && banner.k > 0){ g.globalAlpha = Math.min(1, banner.k/18); outlined(g, banner.t, W/2, BY + ROWS*C*.42, land ? 60 : 50, banner.c || "#fff"); if (banner.s) outlined(g, banner.s, W/2, BY + ROWS*C*.42 + 52, 26, "#ffe066"); g.globalAlpha = 1; }
  }
  let uL = null, uV = "";
  function unitsLayer(k){
    const key = `${gv}|${layerKey}|${k}`; if (key === uV && uL) return; uV = key;
    uL = uL || document.createElement("canvas"); const w = Math.ceil(COLS*C*k), h = Math.ceil(ROWS*C*k); if (uL.width !== w || uL.height !== h){ uL.width = w; uL.height = h; }
    const t = uL.getContext("2d"); t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, w, h); t.setTransform(k, 0, 0, k, 0, 0);
    const us = Math.round(C*.62);
    for (let z = 0; z < N; z++) Z[z].s.forEach((q, i) => { if (!q.k) return; const [x, y] = slotXY(z, i), n = q.n, s = n === 1 ? us : Math.round(us*.78), spr = unitSpr(q.k, s);
      if (n >= 3 && RD_A[q.k].g < 4 && isMine(z)){ t.globalAlpha = .5; t.fillStyle = RD_G[RD_A[q.k].g + 1].c; rrect(t, (x - .46)*C, (y - .46)*C, C*.92, C*.92, C*.18); t.fill(); t.globalAlpha = 1; }
      for (let u = 0; u < n; u++){ const o = UOFF[n - 1][u]; t.drawImage(spr, Math.round((x + o[0])*C - s/2), Math.round((y + o[1])*C - s/2), s, s); }
      if (n >= 2){ const l = lbl([`×${n}`], 13, n >= 3 ? "#ffe066" : "#fff"); t.drawImage(l, (x + .48)*C - 30, (y + .5)*C - 22, l.w, l.h); } });
  }
  const splitE = s => s.split(/(\p{Extended_Pictographic}️?)/u).filter(Boolean).map(x => x.trim()).filter(Boolean);
  function drawTop(g, fr){
    g.fillStyle = "rgba(15,10,40,.62)"; rrect(g, 8, 6, W - 16, TOPH - 12, 16); g.fill();
    G2.put(g, lbl(["🏁", `${wave}단계`], 24, "#ffe066"), 18, 12);
    const n = E.length, r = Math.min(1, n/LIMIT), bw = Math.min(380, W*.36), bx = W/2 - bw/2, by = TOPH/2 - 10;
    g.fillStyle = "rgba(0,0,0,.4)"; rrect(g, bx, by, bw, 20, 10); g.fill(); g.fillStyle = r > .8 ? (fr % 20 < 10 ? "#ff6b6b" : "#c92a2a") : r > .55 ? "#fcc419" : "#51cf66"; rrect(g, bx, by, Math.max(20, bw*r), 20, 10); g.fill();
    G2.put(g, lbl(["👾", `${n} / ${LIMIT}`], 16), W/2 - lbl(["👾", `${n} / ${LIMIT}`], 16).w/2, by - 3);
    const boss = E.find(e => e.kind === 2), sec = Math.ceil(Math.max(0, waveT)/60);
    const tl = lbl([boss ? "⏰" : "⏱️", `${sec}초`], 20, boss && sec < 15 ? "#ff6b6b" : "#fff"); G2.put(g, tl, W - (party !== "guest" ? 100 : 16) - tl.w, 14);
    if (land) G2.put(g, lbl([th().n.split(" ")[0], th().n.split(" ").slice(1).join(" ")], 16, "#d0bfff"), 140, 16);
    if (party !== "guest"){ const b = BARS.find(q => q.id === "spd"); if (b) G2.put(g, btnSpr(b.w, b.h, speed > 1 ? "#ff922b" : "#748ffc", speed > 1 ? "#e8590c" : "#4c6ef5", ["⏩", `×${speed}`], 17), b.x, b.y); }
  }
  let bL = null, bV = "";
  function drawBottom(g){
    const k = NG.k || 1, sig = [k, W, H, BOTH, BARS.length, local.map(z => { const p = Z[z]; return [Math.floor(p.gold), p.gems, sumCost(z), p.up.join(""), p.s.some(q => q.k && q.n >= 3 && RD_A[q.k].g < 4) ? 1 : 0].join(","); }).join("|")].join("/");
    if (sig !== bV || !bL){ bV = sig; bL = bL || document.createElement("canvas"); const w = Math.ceil(W*k), h = Math.ceil(BOTH*k) + 2; if (bL.width !== w || bL.height !== h){ bL.width = w; bL.height = h; }
      const t = bL.getContext("2d"); t.setTransform(1, 0, 0, 1, 0, 0); t.clearRect(0, 0, bL.width, bL.height); t.setTransform(k, 0, 0, k, 0, -(H - BOTH)*k); barsDraw(t); }
    g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(bL, 0, Math.round((H - BOTH)*k)); g.setTransform(k, 0, 0, k, 0, 0);
    popsDraw(g);
  }
  function barsDraw(g){
    g.fillStyle = "rgba(15,10,40,.78)"; g.fillRect(0, H - BOTH, W, BOTH); g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(0, H - BOTH, W, 2);
    BARS.forEach(b => { if (b.id === "spd") return; if (b.z < 0) return; const p = Z[b.z]; if (!p) return; const col = RD_PC[b.z];
      if (b.id === "sum"){ const c = sumCost(b.z), off = p.gold < c; G2.put(g, btnSpr(Math.round(b.w), Math.round(b.h), "#ffd43b", "#f08c00", ["🎲", "뽑기", "💰", String(c)], land ? 27 : 28, off), b.x, b.y); }
      else if (b.id === "all"){ const can = p.s.some(q => q.k && q.n >= 3 && RD_A[q.k].g < 4); G2.put(g, btnSpr(Math.round(b.w), Math.round(b.h), "#69db7c", "#2b8a3e", ["🔀", "합치기"], 24, !can), b.x, b.y); }
      else if (b.id === "up") G2.put(g, btnSpr(Math.round(b.w), Math.round(b.h), "#74c0fc", "#1971c2", ["⬆️", "강화"], 24, false), b.x, b.y);
      else if (b.id === "luck") G2.put(g, btnSpr(Math.round(b.w), Math.round(b.h), "#e599f7", "#9c36b5", ["💎", "행운"], 24, p.gems < 1), b.x, b.y);
      else if (b.id === "info"){ g.fillStyle = "rgba(255,255,255,.08)"; rrect(g, b.x, b.y, b.w, b.h, 14); g.fill(); g.strokeStyle = col; g.lineWidth = 3; g.stroke();
        if (b.wide){ const l1 = lbl(["💰", String(Math.floor(p.gold)), "💎", String(p.gems), "🎲", `뽑기 ${sumCost(b.z)}`, "⬆️", `Lv ${p.up.join("·")}`], 22, "#ffe066"); G2.put(g, l1, b.x + 12, b.y + b.h/2 - l1.h/2); }
        else { G2.put(g, lbl(["💰", String(Math.floor(p.gold))], 26, "#ffe066"), b.x + 10, b.y + b.h*.5 - 36); G2.put(g, lbl(["💎", String(p.gems)], 22, "#e5dbff"), b.x + 10, b.y + b.h*.5 + 2); }
        if (local.length >= 2 || N > 1) faceAt(g, SIDS[b.z], b.x + b.w - 26, b.y + 26, 18, col); } });
  }
  function popsDraw(g){
    panelBtns().forEach(b => { const p = Z[b.z];
      if (b.id === "up"){ const nm = ["⚪🔵", "🟣🟡", "🌈"][b.i], c = upCost(b.z, b.i), lv = p.up[b.i];
        G2.put(g, btnSpr(Math.round(b.w), b.h, "#74c0fc", "#1864ab", [...splitE(nm), ["일반·희귀", "영웅·전설", "신화"][b.i], `Lv${lv}`, "💰", String(c)], 18, p.gold < c || lv >= 25), b.x, b.y); }
      else { const c = b.i ? 4 : 1; G2.put(g, btnSpr(Math.round(b.w), b.h, "#e599f7", "#862e9c", b.i ? ["🌈", "신화 35%·전설", "💎", "4"] : ["🎁", "영웅 55%·전설 15%", "💎", "1"], 17, p.gems < c), b.x, b.y); } });
    selBtns().forEach(b => { const q = Z[sel.z].s[sel.i]; if (!q.k) return;
      if (b.id === "smrg") G2.put(g, btnSpr(b.w, b.h, "#69db7c", "#2b8a3e", ["🔀", "합치기"], 17, b.off), b.x, b.y);
      else G2.put(g, btnSpr(b.w, b.h, "#ff8787", "#c92a2a", ["💰", `팔기 +${RD_G[RD_A[q.k].g].sell}`], 16), b.x, b.y); });
    if (sel){ const q = Z[sel.z].s[sel.i]; if (q.k){ const A = RD_A[q.k], [x, y] = slotXY(sel.z, sel.i), l = lbl([A.e, `${A.n}`, `(${RD_G[A.g].n})`, `공격 ${Math.round(A.d*upMul(sel.z, A.g))}`, "·", A.t], 15, RD_G[A.g].c2);
      const px = Math.max(6, Math.min(W - l.w - 6, cx(x) - l.w/2)), py = Math.max(TOPH + 56, cy(y) - C*.62 - 34); g.fillStyle = "rgba(15,10,40,.85)"; rrect(g, px - 6, py - 4, l.w + 12, l.h + 8, 10); g.fill(); G2.put(g, l, px, py); } }
    if (drag && drag.on){ const q = Z[drag.z].s[drag.i]; if (q.k){ const s = Math.round(C*.7); g.globalAlpha = .85; g.drawImage(unitSpr(q.k, s), drag.x - s/2, drag.y - s/2, s, s); g.globalAlpha = 1; } }
  }

  /* ---------- 손가락 ---------- */
  function down(x, y, id){
    getAC && getAC();
    for (const b of selBtns()){ if (inR(b, x, y)){ press(b); return; } }
    for (const b of panelBtns()){ if (inR(b, x, y)){ press(b); return; } }
    for (const b of BARS){ if (!b.info && inR(b, x, y)){ press(b); if (b.id !== "up" && b.id !== "luck") panel = null; return; } }
    panel = null;
    const s = slotAt(x, y);
    if (s && isMine(s.z)){ ptr.set(id, {sx: x, sy: y}); drag = {z: s.z, i: s.i, x, y, on: false, id}; return; }
    sel = null;
  }
  function move(x, y, id){ if (!drag || drag.id !== id) return; drag.x = x; drag.y = y; const p = ptr.get(id); if (p && Math.hypot(x - p.sx, y - p.sy) > 14 && Z[drag.z].s[drag.i].k) drag.on = true; }
  function up(x, y, id){ if (!drag || drag.id !== id) return; const d = drag; drag = null; ptr.delete(id);
    if (d.on){ const s = slotAt(x, y); if (s && s.z === d.z && s.i !== d.i){ act(d.z, ["mov", d.i, s.i]); if (sel && sel.z === d.z) sel = {z: d.z, i: s.i}; playS("sell"); } return; }
    sel = sel && sel.z === d.z && sel.i === d.i ? null : (Z[d.z].s[d.i].k ? {z: d.z, i: d.i} : null); }

  const self = {
    get W(){ return W; }, get H(){ return H; }, maxPx: 1.5e6, layout,
    get dbg(){ return {Z, E, wave, waveT, state, score, kills, BARS, N, LIMIT, gv, PR, FX}; },
    cheat(o){ if (o.gold != null) Z.forEach(p => p.gold = o.gold); if (o.gems != null) Z.forEach(p => p.gems = o.gems); if (o.wave != null){ wave = o.wave - 1; startWave(); } if (o.put){ placeK(o.z || 0, o.put); } if (o.clear) E = []; },
    init(){
      seed = O.seed || (Math.floor(Math.random()*1e9) + 1); R.seed(seed);
      Z = SIDS.map(() => mkZone()); E = []; PR = []; FX = []; wave = 0; waveT = 0; spawnLeft = 0; spawnT = 0; state = "play"; overT = 0; score = 0; kills = 0; bossK = 0; eid = 0; gv = 1; speed = 1; banner = null; sel = null; drag = null; ptr = new Map(); panel = null; NQ = []; outbox = []; aseq = 0; lastAct = SIDS.map(() => 0); ended = false; frame = 0;
      setSky();
      if (party !== "guest"){ startWave(); [0, 1].forEach(() => Z.forEach((p, z) => { const k = pick(0); placeK(z, k); })); }
      else { wave = 1; }
      if (party) PARTY.attach(self, gridMsg);
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
      if (state === "over"){ if (--overT <= 0) finish(); }
      else for (let i = 0; i < speed; i++) sim();
      if (party === "host" && frame % 4 === 0) PARTY.sendSnap(snap(), NQ.splice(0), gv);
    },
    draw, down, move, up,
    key(code, d, e){
      if (!d || (e && e.repeat)) return ["Space", "Enter", "KeyM", "KeyQ", "Digit1", "Digit2", "Digit3", "KeyL", "KeyF", "KeyE"].includes(code);
      const two = local.length >= 2, z1 = local[0], z2 = two ? local[1] : local[0];
      const M = {Space: [z1, "sum"], KeyQ: [z1, "all"], KeyE: [z1, "luck0"], Digit1: [z1, "up0"], Digit2: [z1, "up1"], Digit3: [z1, "up2"],
                 Enter: [z2, "sum"], KeyM: [z2, "all"], KeyL: [z2, "luck0"], KeyF: [-1, "spd"]};
      if (!two){ M.Enter = [z1, "sum"]; M.KeyM = [z1, "all"]; M.KeyL = [z1, "luck0"]; }
      const m = M[code]; if (!m) return false;
      const [z, a] = m;
      if (a === "spd"){ if (party !== "guest"){ speed = speed === 1 ? 2 : 1; playS("warn"); } }
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
const RDM = {
  menu(){
    const me = ARC.me, box = partyModal("rd"), body = $("#wbBody");
    body.innerHTML = `<div class="rd-intro"><div class="rd-gs">${RD_G.map((g, i) => `<span style="--c:${g.c}"><b>${g.n}</b><em>${RD_BY[i].map(k => RD_A[k].e).join("")}</em></span>`).join("")}</div>
      <p class="arc-small">🎲 <b>뽑기</b>로 동물 친구를 데려오고, 같은 동물 <b>3마리</b>가 모이면 <b>🔀 합치기</b>로 더 센 등급이 돼요! 빙글빙글 도는 몬스터가 <b>너무 많이 쌓이지 않게</b> 막아요. 10단계마다 👑 보스, 100단계까지 도전!</p></div>
      <div class="wb-sec"><h3>🧒 혼자 지키기 <small>최고 단계로 랭킹!</small></h3><button class="arc-btn p" id="rdSolo">▶ 시작!</button></div>
      <div class="wb-sec"><h3>👫 이 기기에서 둘이 <small>한 화면에서 각자 칸을 지켜요 · 같은 점수로 기록</small></h3><button class="arc-btn p" id="rdDuo">👫 친구 들어오기</button></div>
      <div class="wb-sec"><h3>🌐 온라인 함께 지키기 <small>각자 기기로 최대 4명 · ☁️ Firebase 반에서만</small></h3><div id="wbRooms"></div></div>`;
    $("#rdSolo").onclick = () => { box.hidden = true; ARC.enter(); ARC.prep(); getAC(); NG.play("rd", [sidOf(me)]); };
    $("#rdDuo").onclick = () => { box.hidden = true; ARC.pickRival("rd", opp => { ARC.enter(); ARC.prep(); getAC(); NG.play("rd", [sidOf(me), sidOf(opp)], {local: [0, 1]}); }); };
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
  const again = NG.again;
  NG.again = function(){ if (this.gid === "rd"){ if (this.opt.party){ if (this.opt.party === "host") PARTY.again(); return; } return this.play("rd", this.sids, Object.assign({}, this.opt, {seed: 0})); } return again.call(this); };
  PARTY.CFG.rd = {max: 4, bots: 0, min: 2};
  const start = PARTY.start;
  PARTY.start = function(again){
    if (this.gid !== "rd") return start.call(this, again);
    if (this.role !== "host") return;
    const live = this.connected().map(p => p.no);
    this.members = [ARC.me].concat(this.members.filter(no => no !== ARC.me && live.includes(no))).slice(0, this.MAX);
    const M = this.members; if (M.length < 2){ toast("친구가 1명 이상 들어와야 시작할 수 있어요"); this.renderRooms(); return; }
    this.started = true; Store.fs.updateDoc(this.ref(this.pid), {st: "play", n: M.length}).catch(() => {});
    const sids = M.map(sidOf), seed = Math.floor(Math.random()*1e9) + 1, remote = {};
    M.forEach((no, i) => { if (i){ const P = this.peers.get(no); if (P){ P.idx = i; P.inN = 0; P.last = {}; remote[i] = no; this.send(P, {t: "start", g: "rd", sids, idx: i, seed}); } } });
    this.seq = 0; this.lastGv = -1; const md = $("#mdWb"); if (md) md.hidden = true;
    if (!again){ ARC.game = "rd"; ARC.enter(); ARC.prep(); }
    getAC(); NG.play("rd", sids, {party: "host", local: [0], remote, seed});
  };
  if (typeof COOP !== "undefined" && !COOP.G.includes("rd")) COOP.G.unshift("rd");
  const css = document.createElement("style");
  css.textContent = `.in-room>.rd-intro{display:none}.rd-gs{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:8px}
.rd-gs span{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 2px;border-radius:12px;border:2px solid var(--c);background:rgba(255,255,255,.06)}
.rd-gs b{font:15px "Jua",sans-serif;color:var(--c)}.rd-gs em{font-style:normal;font-size:18px;letter-spacing:-2px;white-space:nowrap}
@media (max-width:560px){.rd-gs em{font-size:14px}}
/* ⭐ 대표 게임: 홈에서 크게, 금빛 테두리 */
.arc-game.g-rd{background:linear-gradient(135deg,#ff9f43 0%,#ff6b9a 45%,#845ef7 100%) !important;border:3px solid #ffe066 !important;box-shadow:0 0 0 3px rgba(255,224,102,.25),0 10px 28px rgba(255,159,67,.35) !important}
.arc-game.g-rd .ag-tag{background:#ffe066 !important;color:#1b1233 !important;font-weight:700}
@media (min-width:760px){.arc-game.g-rd{grid-column:span 2}.arc-game.g-rd .ag-nm{font-size:30px}.arc-game.g-rd .ag-ic{font-size:52px}}`;
  document.head.appendChild(css);
})();
