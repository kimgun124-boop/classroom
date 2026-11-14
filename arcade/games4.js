/* =====================================================================
   🌥️ 하늘 무사단 — 구름 위를 날며 기계 요괴를 무찌르는 횡스크롤 슈팅 (최대 4명 협동)
   - 캐릭터 4명: 🗡️ 바람검사 하루 · 🥷 번개닌자 미루 · 🔮 구름도사 소리 · 💪 천둥장사 두리
     (속도·공격·범위·스킬이 모두 달라요. 총은 자동으로 쏘고, ⚡ 스킬 · 💣 폭탄 버튼)
   - 아이템: P 파워업 · 💣 폭탄 · ❤️ 목숨 · 🪙 금화 · 🔮 스킬 충전 · ⭐ 무적
   - 스테이지 3곳(노을 구름바다 · 달밤 · 폭풍)이 돌아가며 나오고, 끝에는 큰 보스!
   - 한 기기 최대 2명 + 🤖 동료 / 🌐 온라인 방(PARTY)으로 각자 기기 최대 4명
   ⚡ 렉 줄이기: 캐릭터·적·총알·구름은 한 번 그린 그림을 붙여요. 그림자 번짐은 안 써요.
      온라인에서는 방장 기기가 심판이고, 친구 기기는 내 비행 위치만 보내요(내 캐릭터는 바로바로 움직여요).
      내 총알 그림은 각 기기가 스스로 그려서 주고받는 양을 줄였어요.
   ===================================================================== */
const SKC = [
  {n: "바람검사 하루", s: "하루", e: "🗡️", col: "#339af0", spd: 6, gain: .1, st: [4, 3, 3, 4], sk: "회오리 베기", skd: ["빙글 돌며 주변 적을 베고", "날아오는 총알을 지워요"], shot: "바람 칼날", dur: 80},
  {n: "번개닌자 미루", s: "미루", e: "🥷", col: "#7950f2", spd: 7.6, gain: .08, st: [5, 2, 5, 3], sk: "분신술", skd: ["그림자 분신 둘이 나와", "7초 동안 같이 쏴요"], shot: "세 갈래 표창", dur: 420},
  {n: "구름도사 소리", s: "소리", e: "🔮", col: "#f06595", spd: 5.2, gain: .09, st: [3, 3, 4, 5], sk: "결계", skd: ["6초 동안 총알을 막는", "보호막 + 부적 연사"], shot: "따라가는 부적", dur: 360},
  {n: "천둥장사 두리", s: "두리", e: "💪", col: "#fd7e14", spd: 4.6, gain: .085, st: [2, 5, 2, 4], sk: "천둥 내려치기", skd: ["번개 기둥 다섯 개로", "화면을 싹 쓸어요"], shot: "꿰뚫는 불덩이", dur: 60}
];
const SKTH = [
  {n: "🌅 노을 구름바다", sky: "linear-gradient(#5f3dc4 0%,#e64980 38%,#ffa94d 70%,#fff3bf 100%)", cl: "#fff0f6", cs: "#f8a5c2", far: "rgba(255,240,246,.55)"},
  {n: "🌙 달밤 하늘", sky: "linear-gradient(#0b1033 0%,#24306e 55%,#5c6bc0 100%)", cl: "#dbe4ff", cs: "#8c99e0", far: "rgba(219,228,255,.35)", moon: 1},
  {n: "⛈️ 폭풍 번개", sky: "linear-gradient(#1b2633 0%,#34495e 50%,#7f93a8 100%)", cl: "#ced4da", cs: "#6c7a89", far: "rgba(206,212,218,.4)", storm: 1}
];
/* 캐릭터 그림 (오른쪽을 보고 구름을 타고 날아요) — 88×76 */
function skHero(t, c, f){
  const C = SKC[c], skin = "#ffe0bd";
  // 타는 구름
  t.fillStyle = "#a5d8ff"; [[20, 66, 12], [36, 68, 14], [52, 66, 12], [64, 67, 9]].forEach(([x, y, r]) => { t.beginPath(); t.arc(x, y + 2, r, 0, 7); t.fill(); });
  t.fillStyle = "#fff"; [[20, 63, 12], [36, 64, 14], [52, 63, 12], [64, 65, 9]].forEach(([x, y, r]) => { t.beginPath(); t.arc(x, y, r, 0, 7); t.fill(); });
  const dk = c === 0 ? "#1c7ed6" : c === 1 ? "#3b2a7a" : c === 2 ? "#c92a2a" : "#d9480f";
  // 뒤로 날리는 것 (머리끈·목도리)
  if (c === 0){ t.strokeStyle = "#fff"; t.lineWidth = 4; t.lineCap = "round"; t.beginPath(); t.moveTo(40, 14); t.quadraticCurveTo(26, 10 + f*4, 14, 16 - f*3); t.stroke(); t.strokeStyle = "#212529"; t.lineWidth = 7; t.beginPath(); t.moveTo(42, 18); t.quadraticCurveTo(30, 22 + f*3, 20, 26 - f*2); t.stroke(); }
  if (c === 1){ t.fillStyle = "#fa5252"; t.beginPath(); t.moveTo(40, 30); t.quadraticCurveTo(24, 24 + f*6, 6, 30 - f*4); t.lineTo(10, 38 - f*3); t.quadraticCurveTo(26, 34 + f*4, 42, 36); t.fill(); }
  if (c === 3){ t.strokeStyle = "#e03131"; t.lineWidth = 4; t.lineCap = "round"; t.beginPath(); t.moveTo(40, 16); t.quadraticCurveTo(28, 12 + f*5, 16, 18 - f*3); t.stroke(); }
  // 다리 (뒤로 쭉)
  t.fillStyle = c === 2 ? "#e03131" : dk; t.beginPath(); t.ellipse(28, 50, 15, 7, -.25, 0, 7); t.fill();
  // 몸
  t.fillStyle = c === 2 ? "#fff" : C.col; t.beginPath(); t.ellipse(42, 40, c === 3 ? 17 : 14, 15, -.2, 0, 7); t.fill();
  if (c === 0){ t.fillStyle = "#fff"; t.save(); t.translate(42, 40); t.rotate(-.7); t.fillRect(-15, -2, 30, 4); t.restore(); }
  if (c === 2){ t.fillStyle = "#e03131"; t.beginPath(); t.ellipse(42, 48, 14, 6, -.2, 0, Math.PI); t.fill(); t.fillStyle = "#ffc9c9"; t.beginPath(); t.ellipse(30, 40, 9, 12, .4, 0, 7); t.fill(); }
  if (c === 3){ t.fillStyle = "#7f4f24"; for (let k = 0; k < 6; k++){ t.beginPath(); t.arc(34 + k*3.6, 30 + k*3.2, 2.6, 0, 7); t.fill(); } }
  // 머리
  if (c === 1){ t.fillStyle = "#3b2a7a"; t.beginPath(); t.arc(48, 21, 11, 0, 7); t.fill(); t.fillStyle = skin; rrect(t, 44, 16, 16, 7, 3); t.fill(); }
  else { t.fillStyle = skin; t.beginPath(); t.arc(48, 21, 11, 0, 7); t.fill(); }
  if (c === 0){ t.fillStyle = "#212529"; t.beginPath(); t.arc(46, 18, 11, Math.PI*1.05, Math.PI*1.95); t.fill(); t.fillRect(37, 16, 6, 9); t.fillStyle = "#fff"; t.fillRect(38, 13, 20, 3); }
  if (c === 2){ t.fillStyle = "#f783ac"; t.beginPath(); t.arc(47, 17, 11, Math.PI*1.02, Math.PI*1.98); t.fill(); t.fillRect(37, 15, 5, 12); t.beginPath(); t.arc(41, 9, 5, 0, 7); t.arc(53, 8, 5, 0, 7); t.fill(); }
  if (c === 3){ t.fillStyle = "#e03131"; t.fillRect(37, 13, 22, 4); }
  t.fillStyle = "#212529"; t.beginPath(); t.ellipse(53, 20, 1.8, 2.6, 0, 0, 7); t.fill();
  if (c !== 1){ t.fillStyle = "rgba(255,107,107,.45)"; t.beginPath(); t.arc(53, 25, 2.6, 0, 7); t.fill(); }
  // 손에 든 것
  if (c === 0){ t.strokeStyle = "#dee2e6"; t.lineWidth = 4; t.lineCap = "round"; t.beginPath(); t.moveTo(54, 37); t.lineTo(84, 28); t.stroke(); t.strokeStyle = "#fff"; t.lineWidth = 1.5; t.beginPath(); t.moveTo(58, 35); t.lineTo(82, 28); t.stroke(); t.fillStyle = "#fcc419"; t.fillRect(51, 33, 5, 9); }
  if (c === 1){ t.fillStyle = "#adb5bd"; t.save(); t.translate(64, 36); t.rotate(f*.4); t.beginPath(); for (let k = 0; k < 8; k++){ const r = k % 2 ? 2.5 : 8, a = k*Math.PI/4; t.lineTo(Math.cos(a)*r, Math.sin(a)*r); } t.fill(); t.restore(); }
  if (c === 2){ t.fillStyle = "#ffe066"; rrect(t, 57, 28, 10, 17, 2); t.fill(); t.strokeStyle = "#e03131"; t.lineWidth = 1.6; t.beginPath(); t.moveTo(60, 32); t.lineTo(64, 32); t.moveTo(62, 31); t.lineTo(62, 42); t.moveTo(59, 37); t.lineTo(65, 37); t.stroke(); }
  t.fillStyle = skin; t.beginPath(); t.arc(c === 3 ? 60 : 54, c === 3 ? 38 : 38, c === 3 ? 7 : 4, 0, 7); t.fill();
  if (c === 3){ t.fillStyle = "#ffa94d"; t.beginPath(); t.arc(66, 38, 4, 0, 7); t.fill(); }
}

NG.defs.sk = () => {
  const O = NG.opt || {}, SIDS = NG.sids.slice(), N = SIDS.length, W = 1280, H = 720;
  const party = O.party || null, myIdx = party === "guest" ? O.idx : 0, local = (O.local || [0]).slice();
  const BOT = new Set(O.bots || []);
  const PCOL = ["#4dabf7", "#ff6b6b", "#51cf66", "#fcc419"];
  const KIND = ["kite", "crow", "lantern", "turret", "fish"], ITK = "PBHGSX";
  const EN = {kite: {w: 46, h: 46, hp: 3, sc: 100}, crow: {w: 58, h: 42, hp: 4, sc: 150}, lantern: {w: 44, h: 60, hp: 14, sc: 300, drop: 1}, turret: {w: 72, h: 62, hp: 20, sc: 400}, fish: {w: 108, h: 66, hp: 55, sc: 900, drop: 1}};
  const BS = [{n: "기계 용머리 비행선", w: 300, h: 210, hp: 650, mx: -135, my: 30, k: 1}, {n: "구름 거북 요새", w: 320, h: 230, hp: 800, mx: -150, my: 20, k: 0}, {n: "강철 장군", w: 260, h: 290, hp: 950, mx: -95, my: -60, k: 2}];
  const STAGE_LEN = 3000, SEL_T = 900;
  const TOUCH = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
  const sp = (k, w, h, fn) => G2.spr("sk" + k, w, h, fn);
  let P, E, EB, SH, IT, FX, LZ, boss, phase, pt, stage, sT, waveT, banner, shake, flash, ended, NQ, lastSnap, keys, drags, selT, scroll, gsel, gsk, gbm, me, IN, eid, bossN;

  /* ---------- 소리 ---------- */
  function playS(k){
    if (k === "pop") tone(520, 140, .12, "square", .05);
    else if (k === "boom"){ tone(200, 50, .4, "sawtooth", .08); tone(700, 150, .25, "triangle", .05); }
    else if (k === "big"){ tone(150, 30, .9, "sawtooth", .12); tone(500, 60, .7, "triangle", .1, .1); }
    else if (k === "item") SFX.item();
    else if (k === "pow") [523, 784, 1046, 1568].forEach((f, i) => tone(f, f, .08, "square", .07, i*.05));
    else if (k === "skill") [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, f*1.02, .09, "triangle", .1, i*.04));
    else if (k === "bomb"){ tone(110, 35, .7, "sawtooth", .13); tone(1500, 200, .5, "sine", .06); }
    else if (k === "hit"){ tone(400, 60, .45, "square", .1); }
    else if (k === "warn") [880, 660, 880, 660].forEach((f, i) => tone(f, f, .16, "square", .06, i*.2));
    else if (k === "clear") SFX.rec();
    else if (k === "sel") tone(660, 880, .06, "triangle", .08);
    else if (k === "go") [523, 659, 784, 1046].forEach((f, i) => tone(f, f, .12, "square", .07, i*.08));
    else if (k === "zap"){ tone(1600, 90, .3, "sawtooth", .07); }
  }
  const sfx = k => { playS(k); if (party === "host") NQ.push(["s", k]); };

  /* ---------- 그림 (한 번만 그려요) ---------- */
  const heroSpr = (c, f) => sp(`h${c}${f}`, 88, 76, t => skHero(t, c, f));
  const ghostSpr = c => sp(`gh${c}`, 88, 76, t => { t.globalAlpha = .5; skHero(t, c, 1); t.globalCompositeOperation = "source-atop"; t.fillStyle = "rgba(80,40,160,.55)"; t.fillRect(0, 0, 88, 76); });
  const orb = (t, m, r, c0, c1, c2) => { const gr = t.createRadialGradient(m - r*.3, m - r*.3, 1, m, m, r); gr.addColorStop(0, c0); gr.addColorStop(.5, c1); gr.addColorStop(1, c2); t.fillStyle = gr; t.beginPath(); t.arc(m, m, r, 0, 7); t.fill(); };
  const ebSpr = k => sp("eb" + k, 26, 26, t => { const r = [8, 10, 7][k], m = 13;
    t.fillStyle = ["rgba(255,146,43,.35)", "rgba(240,101,149,.35)", "rgba(116,192,252,.35)"][k]; t.beginPath(); t.arc(m, m, r + 3, 0, 7); t.fill();
    orb(t, m, r, "#fff", ["#ffd43b", "#f783ac", "#a5d8ff"][k], ["#e8590c", "#c2255c", "#1971c2"][k]); });
  const shotSpr = k => sp("s" + k, 60, 60, t => { const m = 30;
    if (k === "bl" || k === "bl2"){ const s = k === "bl2" ? 1.25 : 1; t.save(); t.translate(m, m); t.scale(s, s); t.fillStyle = "rgba(165,216,255,.5)"; t.beginPath(); t.arc(-6, 0, 16, -1.2, 1.2); t.arc(-14, 0, 13, 1.1, -1.1, true); t.fill();
      t.fillStyle = "#e7f5ff"; t.beginPath(); t.arc(-4, 0, 13, -1.15, 1.15); t.arc(-11, 0, 11, 1.05, -1.05, true); t.fill(); t.restore(); }
    else if (k === "sr0" || k === "sr1"){ t.save(); t.translate(m, m); t.rotate(k === "sr1" ? Math.PI/4 : 0); t.fillStyle = "#ced4da"; t.beginPath(); for (let i = 0; i < 8; i++){ const r = i % 2 ? 3 : 10, a = i*Math.PI/4; t.lineTo(Math.cos(a)*r, Math.sin(a)*r); } t.fill(); t.fillStyle = "#7950f2"; t.beginPath(); t.arc(0, 0, 2.5, 0, 7); t.fill(); t.restore(); }
    else if (k === "po"){ t.fillStyle = "rgba(247,131,172,.35)"; t.beginPath(); t.ellipse(m - 6, m, 16, 7, 0, 0, 7); t.fill(); orb(t, m, 7, "#fff", "#fcc2d7", "#e64980"); }
    else if (k === "tl"){ t.save(); t.translate(m, m); t.fillStyle = "#ffe066"; rrect(t, -10, -6, 20, 12, 2); t.fill(); t.strokeStyle = "#e03131"; t.lineWidth = 1.6; t.beginPath(); t.moveTo(-6, 0); t.lineTo(6, 0); t.moveTo(-2, -4); t.lineTo(-2, 4); t.moveTo(3, -4); t.lineTo(3, 4); t.stroke(); t.restore(); }
    else { const r = k === "fb2" ? 18 : 14; t.fillStyle = "rgba(255,146,43,.35)"; t.beginPath(); t.ellipse(m - r*.5, m, r*1.5, r*.9, 0, 0, 7); t.fill(); orb(t, m, r, "#fff9db", "#ffa94d", "#e8590c"); t.fillStyle = "rgba(255,255,255,.7)"; t.beginPath(); t.arc(m + r*.3, m - r*.3, r*.25, 0, 7); t.fill(); } });
  const itemSpr = k => sp("it" + k, 52, 52, t => { const m = 26, col = {P: "#e03131", B: "#495057", H: "#f06595", G: "#f59f00", S: "#7950f2", X: "#fab005"}[k];
    t.fillStyle = "rgba(255,255,255,.35)"; t.beginPath(); t.arc(m, m, 24, 0, 7); t.fill(); orb(t, m, 20, "#fff", col, col); t.strokeStyle = "#fff"; t.lineWidth = 3; t.beginPath(); t.arc(m, m, 20, 0, 7); t.stroke();
    if (k === "P") outlinedRaw(t, "P", m, m + 1, 24, "#fff", "#862e9c"); else G2.emo(t, {B: "💣", H: "❤️", G: "🪙", S: "🔮", X: "⭐"}[k], m, m + 1, 22); });
  const boomSpr = () => sp("boom", 96, 96, t => { const gr = t.createRadialGradient(48, 48, 2, 48, 48, 48); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.25, "rgba(255,236,153,.95)"); gr.addColorStop(.55, "rgba(255,146,43,.7)"); gr.addColorStop(1, "rgba(232,89,12,0)"); t.fillStyle = gr; t.beginPath(); t.arc(48, 48, 48, 0, 7); t.fill(); });
  const lzSpr = v => sp("lz" + v, 90, H, t => { let x = 45, s = v*97 + 13; const pts = [[x, 0]]; for (let y = 30; y <= H; y += 30){ s = (s*9301 + 49297) % 233280; x = 45 + (s/233280 - .5)*50; pts.push([x, y]); }
    [[24, "rgba(116,192,252,.35)"], [12, "rgba(165,216,255,.8)"], [5, "#fff"]].forEach(([lw, c]) => { t.strokeStyle = c; t.lineWidth = lw; t.lineJoin = "round"; t.beginPath(); pts.forEach(([a, b], i) => i ? t.lineTo(a, b) : t.moveTo(a, b)); t.stroke(); }); });
  // 적
  const enSpr = (k, f) => { const d = EN[k]; return sp(`e${k}${f}`, d.w + 8, d.h + 8, t => { t.translate(4, 4); const w = d.w, h = d.h;
    if (k === "kite"){ t.fillStyle = "#c92a2a"; t.beginPath(); t.moveTo(w/2, 0); t.lineTo(w, h/2); t.lineTo(w/2, h); t.lineTo(0, h/2); t.closePath(); t.fill();
      t.fillStyle = "#ffe066"; t.beginPath(); t.moveTo(w/2, 5); t.lineTo(w - 6, h/2); t.lineTo(w/2, h - 5); t.lineTo(6, h/2); t.closePath(); t.fill();
      t.strokeStyle = "#862e9c"; t.lineWidth = 2; t.beginPath(); t.moveTo(w/2, 0); t.lineTo(w/2, h); t.moveTo(0, h/2); t.lineTo(w, h/2); t.stroke();
      t.fillStyle = "#495057"; t.beginPath(); t.arc(w/2, h/2, 9, 0, 7); t.fill(); t.fillStyle = "#ff6b6b"; t.beginPath(); t.arc(w/2 - 2, h/2, 4, 0, 7); t.fill();
      t.strokeStyle = "#868e96"; t.lineWidth = 2; t.beginPath(); t.moveTo(w, h/2); t.quadraticCurveTo(w + 2, h/2 + 8 + f*4, w + 4, h - 2); t.stroke(); }
    else if (k === "crow"){ t.fillStyle = "#343a40"; t.beginPath(); t.ellipse(w*.55, h*.55, w*.3, h*.24, 0, 0, 7); t.fill();
      t.fillStyle = "#495057"; t.beginPath(); t.moveTo(w*.6, h*.45); t.lineTo(w*.95, f ? h*.05 : h*.25); t.lineTo(w*.8, h*.55); t.fill(); t.beginPath(); t.moveTo(w*.55, h*.6); t.lineTo(w*.85, f ? h*.95 : h*.8); t.lineTo(w*.7, h*.55); t.fill();
      t.fillStyle = "#868e96"; for (let i = 0; i < 3; i++) t.fillRect(w*.62 + i*6, h*.32 + (f ? -i*3 : i*2), 4, 3);
      t.fillStyle = "#212529"; t.beginPath(); t.arc(w*.25, h*.45, h*.2, 0, 7); t.fill(); t.fillStyle = "#fab005"; t.beginPath(); t.moveTo(w*.1, h*.42); t.lineTo(0, h*.5); t.lineTo(w*.1, h*.55); t.fill();
      t.fillStyle = "#ff6b6b"; t.beginPath(); t.arc(w*.2, h*.4, 3.5, 0, 7); t.fill(); }
    else if (k === "lantern"){ t.fillStyle = "#fab005"; rrect(t, w*.2, 0, w*.6, 8, 3); t.fill(); rrect(t, w*.2, h - 8, w*.6, 8, 3); t.fill();
      const gr = t.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "#c92a2a"); gr.addColorStop(.5, f ? "#ff8787" : "#ff6b6b"); gr.addColorStop(1, "#c92a2a"); t.fillStyle = gr; t.beginPath(); t.ellipse(w/2, h/2, w/2, h*.4, 0, 0, 7); t.fill();
      t.strokeStyle = "rgba(0,0,0,.25)"; t.lineWidth = 2; for (let i = 1; i < 4; i++){ t.beginPath(); t.ellipse(w/2, h/2, w/2*i/4, h*.4, 0, 0, 7); t.stroke(); }
      outlinedRaw(t, "福", w/2, h/2, 18, "#ffe066", "#862e9c"); }
    else if (k === "turret"){ t.fillStyle = "#e7f5ff"; [[w*.2, h*.82, 14], [w*.45, h*.86, 17], [w*.72, h*.82, 14]].forEach(([x, y, r]) => { t.beginPath(); t.arc(x, y, r, 0, 7); t.fill(); });
      t.fillStyle = "#495057"; t.beginPath(); t.arc(w/2, h*.6, w*.32, Math.PI, 0); t.fill(); t.fillStyle = "#868e96"; rrect(t, w*.12, h*.56, w*.76, 10, 4); t.fill();
      t.fillStyle = "#343a40"; rrect(t, -2, h*.36 - (f ? 1 : 0), w*.42, 12, 5); t.fill(); t.fillStyle = "#ffd43b"; t.beginPath(); t.arc(w*.55, h*.42, 6, 0, 7); t.fill(); }
    else { const gr = t.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#ffd43b"); gr.addColorStop(1, "#e67700"); t.fillStyle = gr; t.beginPath(); t.ellipse(w*.48, h/2, w*.42, h*.36, 0, 0, 7); t.fill();
      t.fillStyle = "#f08c00"; t.beginPath(); t.moveTo(w*.85, h/2); t.lineTo(w, f ? h*.15 : h*.25); t.lineTo(w, f ? h*.85 : h*.75); t.fill();
      t.beginPath(); t.moveTo(w*.45, h*.18); t.lineTo(w*.62, 0); t.lineTo(w*.68, h*.2); t.fill();
      t.strokeStyle = "rgba(160,80,0,.6)"; t.lineWidth = 2; for (let i = 0; i < 4; i++){ t.beginPath(); t.arc(w*(.36 + i*.11), h/2, h*.22, -1, 1); t.stroke(); }
      t.fillStyle = "#adb5bd"; for (let i = 0; i < 5; i++){ t.beginPath(); t.arc(w*(.3 + i*.12), h*.78, 2.4, 0, 7); t.fill(); }
      t.fillStyle = "#fff"; t.beginPath(); t.arc(w*.18, h*.42, 8, 0, 7); t.fill(); t.fillStyle = "#e03131"; t.beginPath(); t.arc(w*.16, h*.42, 4.5, 0, 7); t.fill();
      t.strokeStyle = "#e8590c"; t.lineWidth = 3; t.beginPath(); t.moveTo(w*.08, h*.6); t.quadraticCurveTo(-4, h*.72 + f*4, 2, h*.9); t.stroke(); }
  }); };
  const bossSpr = (k, f) => { const d = BS[k]; return sp(`b${k}${f}`, d.w + 20, d.h + 20, t => { t.translate(10, 10); const w = d.w, h = d.h;
    if (k === 0){ // 기계 용머리 비행선
      t.fillStyle = "#e7f5ff"; [[w*.35, h*.12, 30], [w*.55, h*.08, 36], [w*.75, h*.14, 28]].forEach(([x, y, r]) => { t.beginPath(); t.arc(x, y + 20, r, 0, 7); t.fill(); });
      t.fillStyle = "#8d5524"; rrect(t, w*.3, h*.38, w*.66, h*.36, 26); t.fill(); t.fillStyle = "#6f4518"; rrect(t, w*.3, h*.6, w*.66, h*.14, 14); t.fill();
      t.fillStyle = "#fab005"; for (let i = 0; i < 6; i++){ t.beginPath(); t.arc(w*(.38 + i*.1), h*.5, 7, 0, 7); t.fill(); }
      t.fillStyle = "#c92a2a"; t.beginPath(); t.moveTo(w*.5, h*.38); t.lineTo(w*.6, h*.12); t.lineTo(w*.72, h*.38); t.fill(); t.beginPath(); t.moveTo(w*.72, h*.38); t.lineTo(w*.84, h*.18); t.lineTo(w*.92, h*.38); t.fill();
      t.fillStyle = "#868e96"; t.fillRect(w*.9, h*.7 + (f ? 2 : -2), 14, 30); t.fillRect(w*.94, h*.76, 24, 6);
      // 용머리
      t.fillStyle = "#fab005"; t.beginPath(); t.moveTo(w*.34, h*.4); t.lineTo(w*.06, h*.42); t.lineTo(0, h*.56); t.lineTo(w*.1, h*.62); t.lineTo(w*.06, h*.74); t.lineTo(w*.34, h*.72); t.closePath(); t.fill();
      t.fillStyle = "#e67700"; t.beginPath(); t.moveTo(w*.1, h*.62); t.lineTo(w*.32, h*.6); t.lineTo(w*.34, h*.72); t.lineTo(w*.06, h*.74); t.fill();
      t.fillStyle = "#fff"; t.beginPath(); t.moveTo(w*.08, h*.6); t.lineTo(w*.11, h*.66); t.lineTo(w*.14, h*.6); t.fill();
      t.fillStyle = "#c92a2a"; t.beginPath(); t.arc(w*.17, h*.48, 9, 0, 7); t.fill(); t.fillStyle = "#ffe066"; t.beginPath(); t.arc(w*.16, h*.48, 4, 0, 7); t.fill();
      t.strokeStyle = "#e67700"; t.lineWidth = 6; t.lineCap = "round"; t.beginPath(); t.moveTo(w*.25, h*.4); t.quadraticCurveTo(w*.3, h*.15, w*.42, h*.2 + (f ? 4 : 0)); t.stroke();
      t.strokeStyle = "#868e96"; t.lineWidth = 3; t.beginPath(); t.moveTo(w*.04, h*.66); t.quadraticCurveTo(-10, h*.8, 0, h*.92 + (f ? 4 : 0)); t.stroke(); }
    else if (k === 1){ // 구름 거북 요새
      t.fillStyle = "#e7f5ff"; [[w*.15, h*.9, 30], [w*.4, h*.95, 40], [w*.65, h*.95, 40], [w*.88, h*.9, 30]].forEach(([x, y, r]) => { t.beginPath(); t.arc(x, y, r, 0, 7); t.fill(); });
      t.fillStyle = "#2b8a3e"; t.beginPath(); t.ellipse(w*.58, h*.62, w*.38, h*.3, 0, Math.PI, 0); t.fill(); t.fillRect(w*.2, h*.62, w*.76, h*.12);
      t.strokeStyle = "#69db7c"; t.lineWidth = 4; for (let i = 0; i < 4; i++){ t.beginPath(); t.arc(w*(.36 + i*.15), h*.56, 22, 0, 7); t.stroke(); }
      t.fillStyle = "#c92a2a"; t.beginPath(); t.moveTo(w*.4, h*.34); t.lineTo(w*.58, h*.16); t.lineTo(w*.76, h*.34); t.fill(); t.fillStyle = "#862e9c"; t.fillRect(w*.46, h*.34, w*.24, h*.08);
      t.fillStyle = "#c92a2a"; t.beginPath(); t.moveTo(w*.44, h*.2); t.lineTo(w*.58, h*.04); t.lineTo(w*.72, h*.2); t.fill(); t.fillStyle = "#fab005"; t.fillRect(w*.57, 0, 6, h*.06);
      t.fillStyle = "#495057"; t.fillRect(w*.38, h*.44 - (f ? 2 : 0), 16, 20); t.fillRect(w*.74, h*.44 + (f ? 2 : 0), 16, 20);
      t.fillStyle = "#40c057"; t.beginPath(); t.ellipse(w*.12, h*.6, w*.1, h*.11, -.2, 0, 7); t.fill(); t.fillRect(w*.14, h*.56, w*.1, h*.1);
      t.fillStyle = "#fff"; t.beginPath(); t.arc(w*.08, h*.56, 8, 0, 7); t.fill(); t.fillStyle = "#e03131"; t.beginPath(); t.arc(w*.07, h*.56, 4, 0, 7); t.fill();
      t.fillStyle = "#2b8a3e"; [[.3, f], [.8, 1 - f]].forEach(([x, q]) => { t.beginPath(); t.ellipse(w*x, h*.8 + q*4, 20, 10, 0, 0, 7); t.fill(); }); }
    else { // 강철 장군
      t.fillStyle = "#e7f5ff"; [[w*.2, h*.94, 30], [w*.5, h*.97, 40], [w*.8, h*.94, 30]].forEach(([x, y, r]) => { t.beginPath(); t.arc(x, y, r, 0, 7); t.fill(); });
      t.fillStyle = "#495057"; rrect(t, w*.25, h*.32, w*.56, h*.48, 24); t.fill(); t.fillStyle = "#868e96"; for (let i = 0; i < 4; i++){ rrect(t, w*.28, h*(.4 + i*.09), w*.5, h*.06, 6); t.fill(); }
      t.fillStyle = "#c92a2a"; t.beginPath(); t.ellipse(w*.3, h*.36, w*.14, h*.08, -.3, 0, 7); t.fill(); t.beginPath(); t.ellipse(w*.76, h*.36, w*.14, h*.08, .3, 0, 7); t.fill();
      t.fillStyle = "#343a40"; rrect(t, w*.36, h*.12, w*.32, h*.22, 16); t.fill();
      t.fillStyle = "#fab005"; t.beginPath(); t.moveTo(w*.38, h*.14); t.lineTo(w*.22, 0); t.lineTo(w*.46, h*.12); t.fill(); t.beginPath(); t.moveTo(w*.66, h*.14); t.lineTo(w*.82, 0); t.lineTo(w*.58, h*.12); t.fill();
      t.fillStyle = "#212529"; t.fillRect(w*.38, h*.2, w*.28, h*.07); t.fillStyle = f ? "#ff8787" : "#ff6b6b"; t.fillRect(w*.4, h*.22, w*.08, h*.03); t.fillRect(w*.55, h*.22, w*.08, h*.03);
      t.save(); t.translate(w*.2, h*.55); t.rotate(-.5 + (f ? .06 : 0)); t.fillStyle = "#dee2e6"; t.fillRect(-w*.22, -8, w*.26, 16); t.fillStyle = "#fff"; t.fillRect(-w*.22, -8, w*.26, 4); t.fillStyle = "#fab005"; t.fillRect(0, -14, 10, 28); t.restore();
      t.fillStyle = "#495057"; t.beginPath(); t.arc(w*.2, h*.55, 16, 0, 7); t.fill(); }
  }); };
  const cloudStrip = (k, w, h, n, rmin, rmax, seed) => sp(`cl${k}`, w, h, t => { const th = SKTH[(stage - 1) % 3]; let s = seed; const r = () => { s = (s*9301 + 49297) % 233280; return s/233280; };
    for (let i = 0; i < n; i++){ const x = r()*w, y = h*.25 + r()*h*.6, R = rmin + r()*(rmax - rmin);
      [[x - R*.8, y + R*.2, R*.7], [x, y, R], [x + R*.9, y + R*.15, R*.75]].forEach(([a, b, c]) => { [a - w, a, a + w].forEach(ax => { t.fillStyle = k[0] === "f" ? th.far : th.cs; t.beginPath(); t.arc(ax, b + (k[0] === "f" ? 0 : 8), c, 0, 7); t.fill(); }); });
      if (k[0] !== "f") [[x - R*.8, y + R*.2, R*.7], [x, y, R], [x + R*.9, y + R*.15, R*.75]].forEach(([a, b, c]) => { [a - w, a, a + w].forEach(ax => { t.fillStyle = th.cl; t.beginPath(); t.arc(ax, b, c, 0, 7); t.fill(); }); }); } });
  const celSpr = () => sp("cel" + (stage - 1) % 3, 160, 160, t => { const th = SKTH[(stage - 1) % 3];
    if (th.moon){ t.fillStyle = "rgba(255,249,219,.2)"; t.beginPath(); t.arc(80, 80, 70, 0, 7); t.fill(); t.fillStyle = "#fff9db"; t.beginPath(); t.arc(80, 80, 48, 0, 7); t.fill(); t.fillStyle = "rgba(230,220,180,.6)"; [[64, 70, 8], [92, 92, 11], [96, 64, 5]].forEach(([x, y, r]) => { t.beginPath(); t.arc(x, y, r, 0, 7); t.fill(); }); }
    else if (!th.storm){ t.fillStyle = "rgba(255,236,153,.25)"; t.beginPath(); t.arc(80, 80, 76, 0, 7); t.fill(); t.fillStyle = "#ffe066"; t.beginPath(); t.arc(80, 80, 52, 0, 7); t.fill(); } });
  const cardSpr = c => sp("card" + c, 260, 400, t => { const C = SKC[c], gr = t.createLinearGradient(0, 0, 0, 400); gr.addColorStop(0, C.col); gr.addColorStop(.55, "#1c1d52"); gr.addColorStop(1, "#14112e");
    t.fillStyle = gr; rrect(t, 0, 0, 260, 400, 22); t.fill(); t.strokeStyle = "rgba(255,255,255,.35)"; t.lineWidth = 3; rrect(t, 2, 2, 256, 396, 20); t.stroke();
    t.fillStyle = "rgba(255,255,255,.15)"; t.beginPath(); t.arc(130, 96, 74, 0, 7); t.fill();
    t.save(); t.translate(130 - 88*1.05, 96 - 38*2.1); t.scale(2.1, 2.1); skHero(t, c, 0); t.restore();
    outlinedRaw(t, C.n, 130, 190, 25, "#fff"); outlinedRaw(t, `${C.e} ${C.shot}`, 130, 222, 17, "#ffe066");
    ["속도", "공격", "범위", "스킬"].forEach((l, i) => { const y = 250 + i*22; t.font = `16px "Jua",sans-serif`; t.textAlign = "left"; t.textBaseline = "middle"; t.fillStyle = "#dee2e6"; t.fillText(l, 34, y);
      for (let s = 0; s < 5; s++){ t.fillStyle = s < C.st[i] ? "#ffd43b" : "rgba(255,255,255,.18)"; t.beginPath(); for (let q = 0; q < 10; q++){ const r = q % 2 ? 4 : 9, a = -Math.PI/2 + q*Math.PI/5; t.lineTo(100 + s*26 + Math.cos(a)*r, y + Math.sin(a)*r); } t.fill(); } });
    t.fillStyle = "rgba(255,255,255,.1)"; rrect(t, 14, 330, 232, 62, 12); t.fill();
    outlinedRaw(t, `⚡ ${C.sk}`, 130, 345, 18, "#ffd8a8"); t.font = `13px "Gowun Dodum",sans-serif`; t.fillStyle = "#e9ecef"; t.textAlign = "center"; C.skd.forEach((l, i) => t.fillText(l, 130, 366 + i*17)); });
  const btnSpr = (k, r, col) => sp(`bt${k}${r}${col}`, r*2 + 8, r*2 + 8, t => { const m = r + 4; t.fillStyle = "rgba(20,15,46,.45)"; t.beginPath(); t.arc(m, m, r, 0, 7); t.fill(); t.strokeStyle = col; t.lineWidth = 4; t.stroke();
    G2.emo(t, k === "sk" ? "⚡" : "💣", m, m - (k === "sk" ? 6 : 4), r*.7); outlinedRaw(t, k === "sk" ? "스킬" : "폭탄", m, m + r*.55, Math.round(r*.3), "#fff"); });

  /* ---------- 만들기 ---------- */
  function mkP(i){ return {i, sid: SIDS[i], ch: i % 4, x: 170, y: H/2 + (i - (N - 1)/2)*110, alive: true, lives: 3, bombs: 2, pow: 1, score: 0, gauge: 30, skT: 0, inv: 0, cd: i*3, resp: 0, ent: 0, spN: 0, sel: {c: i % 4, ok: false}, rb: null, vol: 0, tgT: 0, tg: null}; }
  function mkE(k, x, y, o = {}){ const d = EN[k], hp = d.hp*(1 + (stage - 1)*.35)*(.75 + .25*N); const e = Object.assign({id: ++eid, k, x, y, y0: y, hp, max: hp, t: 0, h: 0, hf: 0, vx: 0, vy: 0, ph: 0, xs: 0, dead: 0}, o); E.push(e); return e; }
  const eb = (x, y, vx, vy, k) => { if (EB.length < 240) EB.push({x, y, vx, vy, k}); };
  function nearestP(x, y){ let b = null, bd = 1e9; P.forEach(p => { if (!p.alive || p.ent) return; const d = Math.hypot(p.x - x, p.y - y); if (d < bd){ bd = d; b = p; } }); return b; }
  function aimFrom(x, y, s, spread, n, k, off = 0){ const p = nearestP(x, y), a0 = p ? Math.atan2(p.y - y, p.x - x) : Math.PI;
    for (let i = 0; i < n; i++){ const a = a0 + (i - (n - 1)/2)*spread + off; eb(x, y, Math.cos(a)*s, Math.sin(a)*s, k); } }
  function ring(x, y, n, s, k, off = 0){ for (let i = 0; i < n; i++){ const a = off + i*Math.PI*2/n; eb(x, y, Math.cos(a)*s, Math.sin(a)*s, k); } }
  const cy = y => clampN(y, 104, H - 34);

  /* ---------- 터지는 효과 ---------- */
  function boomFx(x, y, s, net = true){
    if (FX.length < 320){ FX.push({k: "b", x, y, s, t: 22 + s*4, T: 22 + s*4});
      const n = Math.min(14, 4 + s*3); for (let i = 0; i < n && FX.length < 320; i++){ const a = rnd(Math.PI*2), v = rnd(1.5, 3 + s*1.5); FX.push({k: "p", x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v, t: 20 + rnd(14), c: ["#ffe066", "#ffa94d", "#fff", "#ff8787"][i % 4]}); } }
    if (net && party === "host") NQ.push(["x", x | 0, y | 0, s]);
  }
  function txtFx(x, y, s, c = "#fff", net = true){ x = clampN(x, 120, W - 120); y = Math.max(y, 118); FX.push({k: "t", x, y, s, c, t: 55}); if (net && party === "host") NQ.push(["t", x | 0, y | 0, s, c]); }

  /* ---------- 쏘기 (방장·친구 기기가 똑같이 그려요) ---------- */
  function shot(x, y, vx, vy, k, r, dm, o, hm = 0, pc = 1){ if (SH.length < 240) SH.push({x, y, vx, vy, k, r, dm, o, hm, pc, t: 0, hit: null}); }
  function fire(p){
    const c = p.ch, L = p.pow, x = p.x + 34, y = p.y;
    if (c === 0){ p.cd = 8; const n = L >= 3 ? 3 : L, dm = L >= 4 ? 2.9 : 2.2;
      for (let k = 0; k < n; k++){ const o = n === 1 ? 0 : n === 2 ? (k ? 1 : -1) : k - 1; shot(x, y + o*(n === 2 ? 10 : 13), 17, n === 3 ? o*1.1 : 0, L >= 4 ? "bl2" : "bl", L >= 4 ? 17 : 14, dm, p.i); } }
    else if (c === 1){ p.cd = 7; const n = L >= 3 ? 5 : 3, dm = L >= 4 ? 1.55 : L >= 2 ? 1.3 : 1.1, s2 = n === 5 ? 1.5 : 2.1;
      const src = [[x, y, dm]]; if (p.skT > 0) src.push([p.x, cy(p.y - 80), dm*.7], [p.x, cy(p.y + 80), dm*.7]);
      src.forEach(([sx, sy, d2]) => { for (let k = 0; k < n; k++) shot(sx, sy, 15, (k - (n - 1)/2)*s2, "sr", 10, d2, p.i); }); }
    else if (c === 2){ p.cd = p.skT > 0 ? 5 : 9; p.vol++;
      shot(x, y, 15, 0, "po", 9, 1.6, p.i);
      if (p.vol % 2 === 0) for (let k = 0; k < L; k++){ const sg = k % 2 ? 1 : -1; shot(x - 12, y + sg*(14 + k*5), 6, sg*3.2, "tl", 10, 2.3, p.i, 1); } }
    else { p.cd = 15; const n = L >= 4 ? 3 : L >= 3 ? 2 : 1, big = L >= 2;
      for (let k = 0; k < n; k++) shot(x + 6, y + (n === 1 ? 0 : (k - (n - 1)/2)*28), 11, 0, big ? "fb2" : "fb1", big ? 21 : 16, big ? 6.5 : 5.5, p.i, 0, 3); }
  }
  function moveShots(host){
    const tgs = boss && !boss.dead ? E.concat([boss]) : E;
    for (let i = SH.length - 1; i >= 0; i--){ const s = SH[i]; s.t++;
      if (s.hm){ if (s.t % 5 === 1){ let b = null, bd = 1e9; tgs.forEach(e => { if (e.dead || e.x < s.x - 40) return; const d = Math.hypot(e.x - s.x, e.y - s.y); if (d < bd){ bd = d; b = e; } }); s.tg = b; }
        const sp2 = Math.min(12, 6 + s.t*.3); if (s.tg && !s.tg.dead){ const a = Math.atan2(s.tg.y - s.y, s.tg.x - s.x), a0 = Math.atan2(s.vy, s.vx); let da = a - a0; while (da > Math.PI) da -= Math.PI*2; while (da < -Math.PI) da += Math.PI*2; const na = a0 + clampN(da, -.16, .16); s.vx = Math.cos(na)*sp2; s.vy = Math.sin(na)*sp2; }
        else { const m = Math.hypot(s.vx, s.vy) || 1; s.vx = s.vx/m*sp2; s.vy = s.vy/m*sp2*.96; } }
      s.x += s.vx; s.y += s.vy;
      if (s.x > W + 40 || s.x < -40 || s.y < 64 || s.y > H + 30 || s.t > 160){ SH.splice(i, 1); continue; }
      let gone = false;
      if (boss && !boss.dead && boss.tt > 60){ const d = BS[boss.t]; if (Math.abs(s.x - boss.x) < d.w*.4 + s.r && Math.abs(s.y - boss.y) < d.h*.38 + s.r){ if (host) dmgBoss(s.dm, s.o); else boss.hf = 3; hitSpark(s.x, s.y); gone = true; } }
      if (!gone) for (const e of E){ if (e.dead) continue; const d = EN[e.k]; if (Math.abs(s.x - e.x) < d.w*.42 + s.r && Math.abs(s.y - e.y) < d.h*.42 + s.r){
        if (s.pc > 1){ s.hit = s.hit || []; if (s.hit.includes(e.id)) continue; s.hit.push(e.id); }
        if (host) dmg(e, s.dm, s.o); else e.hf = 3; hitSpark(s.x, s.y); if (--s.pc <= 0){ gone = true; break; } } }
      if (gone) SH.splice(i, 1);
    }
  }
  function hitSpark(x, y){ if (FX.length < 300) FX.push({k: "p", x, y, vx: rnd(-1.5, 1.5), vy: rnd(-2, 2), t: 8, c: "#fff"}); }

  /* ---------- 피해 · 처치 · 아이템 ---------- */
  function dmg(e, d, o){ if (e.dead) return; e.hp -= d; e.hf = 4; if (e.hp <= 0) kill(e, o); }
  function kill(e, o){
    e.dead = 1; const d = EN[e.k], p = P[o];
    if (p){ p.score += d.sc; p.gauge = Math.min(100, p.gauge + 3); }
    boomFx(e.x, e.y, e.k === "fish" ? 3 : e.k === "turret" ? 2 : 1); sfx(e.k === "fish" || e.k === "turret" ? "boom" : "pop");
    if (d.drop || Math.random() < .05) drop(e.x, e.y, e.k === "fish" ? 2 : 1);
  }
  function dmgBoss(d, o){ const b = boss; if (!b || b.dead) return; b.hp -= d; b.hf = 3; const p = P[o]; if (p){ p.score += Math.round(d*3); }
    if (b.hp <= 0){ b.dead = 1; EB.length = 0; sfx("big"); P.forEach(q => { if (q.lives > 0 || q.alive){ q.score += 5000; } }); if (p) p.score += 5000; txtFx(b.x, b.y - 80, "🎉 보스 격파! +5000", "#ffe066"); } }
  function drop(x, y, n){
    for (let i = 0; i < n; i++){ const needP = P.some(p => p.alive && p.pow < 4), r = Math.random();
      const k = needP && r < .36 ? "P" : r < .58 ? "G" : r < .72 ? "B" : r < .84 ? "S" : r < .93 ? "X" : r < .97 || !needP ? "H" : "P";
      IT.push({k, x, y: y + i*30, vx: -1.2, vy: rnd(-1.6, 1.6), t: 0}); }
  }
  function pick(p, it){
    const t = it.k;
    if (t === "P"){ if (p.pow < 4){ p.pow++; txtFx(p.x, p.y - 50, p.pow === 4 ? "💥 최대 파워!" : `P ${p.pow}단계!`, "#ff8787"); sfx("pow"); } else { p.score += 1000; txtFx(p.x, p.y - 50, "+1000", "#ffe066"); sfx("item"); } }
    else if (t === "B"){ p.bombs = Math.min(5, p.bombs + 1); txtFx(p.x, p.y - 50, "💣 폭탄 +1"); sfx("item"); }
    else if (t === "H"){ p.lives = Math.min(5, p.lives + 1); txtFx(p.x, p.y - 50, "❤️ 목숨 +1", "#ffa8a8"); sfx("pow"); }
    else if (t === "G"){ p.score += 500; txtFx(p.x, p.y - 50, "🪙 +500", "#ffe066"); sfx("item"); }
    else if (t === "S"){ p.gauge = 100; txtFx(p.x, p.y - 50, "🔮 스킬 충전!", "#d0bfff"); sfx("item"); }
    else { p.inv = Math.max(p.inv, 420); txtFx(p.x, p.y - 50, "⭐ 무적 7초!", "#ffe066"); sfx("pow"); }
  }
  const shielded = p => p.inv > 0 || p.ent > 0 || (p.skT > 0 && (p.ch === 0 || p.ch === 2));
  function die(p){
    p.alive = false; p.lives--; p.resp = p.lives > 0 ? 100 : -1; p.skT = 0;
    boomFx(p.x, p.y, 3); sfx("hit");
    if (p.pow > 1){ IT.push({k: "P", x: p.x + 20, y: p.y, vx: 1.5, vy: rnd(-2, 2), t: 0}); p.pow--; }
    if (p.lives <= 0) txtFx(p.x + 60, p.y, `${p.i + 1}P 탈락… 😵`, "#ff8787");
  }

  /* ---------- 스킬 · 폭탄 ---------- */
  function useSkill(p){
    if (!p.alive || p.ent || p.gauge < 100 || p.skT > 0 || phase !== "play") return;
    p.gauge = 0; p.skT = SKC[p.ch].dur; sfx("skill"); txtFx(p.x + 40, p.y - 60, `⚡ ${SKC[p.ch].sk}!`, SKC[p.ch].col === "#7950f2" ? "#d0bfff" : "#fff");
  }
  function useBomb(p){
    if (!p.alive || p.ent || p.bombs <= 0 || phase !== "play") return;
    p.bombs--; p.inv = Math.max(p.inv, 120); flash = 1; shake = 16; sfx("bomb"); if (party === "host") NQ.push(["f"]);
    EB.forEach((b, i) => { if (i % 4 === 0) boomFx(b.x, b.y, 0, false); }); EB.length = 0;
    E.forEach(e => dmg(e, 25, p.i)); if (boss && !boss.dead && boss.tt > 60) dmgBoss(40, p.i);
  }
  function skillTick(p){
    if (p.skT <= 0) return; p.skT--;
    if (p.ch === 0){ const R = 170;
      E.forEach(e => { if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < R) dmg(e, .9, p.i); });
      if (boss && !boss.dead && Math.abs(boss.x - p.x) < R + BS[boss.t].w*.3 && Math.abs(boss.y - p.y) < R + BS[boss.t].h*.3) dmgBoss(.6, p.i);
      for (let i = EB.length - 1; i >= 0; i--){ const b = EB[i]; if (Math.hypot(b.x - p.x, b.y - p.y) < R) EB.splice(i, 1); } }
    else if (p.ch === 2){ const R = 95;
      for (let i = EB.length - 1; i >= 0; i--){ const b = EB[i]; if (Math.hypot(b.x - p.x, b.y - p.y) < R){ EB.splice(i, 1); if (i % 3 === 0) hitSpark(b.x, b.y); } }
      E.forEach(e => { if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < R + 20) dmg(e, .4, p.i); }); }
    else if (p.ch === 3 && p.skT % 10 === 0 && p.skT >= 10){
      const k = (SKC[3].dur - p.skT)/10 - 1, x = Math.min(W - 40, p.x + 130 + k*220);
      zap(x); E.forEach(e => { if (!e.dead && Math.abs(e.x - x) < 75) dmg(e, 40, p.i); });
      if (boss && !boss.dead && Math.abs(boss.x - x) < BS[boss.t].w*.45) dmgBoss(35, p.i);
      for (let i = EB.length - 1; i >= 0; i--) if (Math.abs(EB[i].x - x) < 60) EB.splice(i, 1);
    }
  }
  function zap(x){ LZ.push({x, t: 22, v: Math.floor(rnd(3))}); shake = Math.max(shake, 12); playS("zap"); if (party === "host") NQ.push(["l", x | 0]); }

  /* ---------- 적 나오기 ---------- */
  function wave(){
    const r = Math.random(), late = sT > 900;
    if (r < .3){ const y0 = rnd(130, H - 140), n = 5; for (let k = 0; k < n; k++) mkE("kite", W + 40 + k*55, y0, {ph: k*.6, y0}); }
    else if (r < .55){ const n = 3 + (stage > 1 ? 1 : 0); for (let k = 0; k < n; k++) mkE("crow", W + 40 + k*70, rnd(100, H - 80)); }
    else if (r < .75){ const n = stage > 1 ? 2 : 1; for (let k = 0; k < n; k++) mkE("turret", W + 50 + k*40, rnd(130, H - 120), {xs: rnd(W - 400, W - 220)}); }
    else if (r < .87) mkE("lantern", W + 40, rnd(140, H - 140));
    else if (late) mkE("fish", W + 70, rnd(170, H - 170));
    else { const y0 = rnd(150, H - 150); for (let k = 0; k < 4; k++) mkE("kite", W + 40 + k*55, y0, {ph: k*.6, y0}); mkE("lantern", W + 300, y0); }
  }
  function enemyStep(){
    const hard = stage > 1;
    for (let i = E.length - 1; i >= 0; i--){ const e = E[i]; if (e.dead){ E.splice(i, 1); continue; }
      const px = e.x, py = e.y; e.t++; if (e.hf) e.hf--;
      if (e.k === "kite"){ e.x -= 3.2; e.y = e.y0 + Math.sin(e.t*.05 + e.ph)*55; if (hard && e.t % 150 === 60 && Math.random() < .4) aimFrom(e.x, e.y, 3.8, 0, 1, 0); }
      else if (e.k === "crow"){ if (e.t < 40) e.x -= 6.5; else { e.x -= 5; const p = nearestP(e.x, e.y); if (p && e.x > p.x + 60) e.vy = clampN(e.vy + Math.sign(p.y - e.y)*.16, -3, 3); e.y += e.vy; } if (hard && e.t === 50) aimFrom(e.x, e.y, 4, 0, 1, 0); }
      else if (e.k === "lantern"){ e.x -= 1.7; e.y = e.y0 + Math.sin(e.t*.03)*30; }
      else if (e.k === "turret"){ if (e.x > e.xs && !e.h) e.x -= 4; else { e.h++; if (e.h % 70 === 35) aimFrom(e.x - 30, e.y - 6, 4.1, .22, 3, 1); if (e.h > 260){ e.x -= 2.5; e.y += e.y < H/2 ? -1.4 : 1.4; } } }
      else { if (e.x > W - 230 && !e.h) e.x -= 1.4; else { e.h++; e.y = e.y0 + Math.sin(e.h*.02)*60; if (e.h % 110 === 50) ring(e.x, e.y, 12 + stage*2, 3.1, 2, e.h*.1); if (e.h > 640) e.x -= 2; } }
      e.vx = e.x - px; e.vy2 = e.y - py;
      if (e.x < -140 || e.y < -120 || e.y > H + 120) E.splice(i, 1);
    }
  }
  function spawnBoss(){ const t = (stage - 1) % 3, d = BS[t], hp = d.hp*(1 + (stage - 1)*.3)*(.7 + .3*N); boss = {t, x: W + 230, y: H/2, hp, max: hp, tt: 0, hf: 0, dead: 0, vx: 0, vy: 0}; bossN++; }
  function bossStep(){
    const b = boss, d = BS[b.t]; b.tt++; if (b.hf) b.hf--; const px = b.x, py = b.y;
    if (b.dead){ b.dead++; if (b.dead % 6 === 0) boomFx(b.x + rnd(-d.w*.4, d.w*.4), b.y + rnd(-d.h*.4, d.h*.4), 2); if (b.dead % 18 === 0) sfx("boom"); b.y += .6; shake = 8;
      if (b.dead > 110){ boomFx(b.x, b.y, 5); boomFx(b.x - 60, b.y + 30, 4); sfx("big"); boss = null; clearStage(); } return; }
    if (b.tt < 150) b.x += (W - 210 - b.x)*.03;
    else { b.x = W - 210 + Math.sin(b.tt*.007)*60; b.y = H/2 + 20 + Math.sin(b.tt*.011)*(H/2 - 190); }
    b.vx = b.x - px; b.vy = b.y - py;
    if (b.tt < 150) return;
    const rage = b.hp < b.max/2, f = rage ? .7 : 1, u = (b.tt - 150) % 260, ph = Math.floor((b.tt - 150)/260) % 3, mx = b.x + d.mx, my = b.y + d.my, more = stage > 3 ? 2 : 0;
    if (ph === 0 && u % Math.round(44*f) === 0) aimFrom(mx, my, 4, .16, 7 + more, d.k);
    else if (ph === 1 && u < 120 && u % Math.round(7*f) === 0) aimFrom(mx, my, 5.2, 0, 1, 1, Math.sin(u*.1)*.25);
    else if (ph === 2 && u % Math.round(6*f) === 0){ const n = rage ? 3 : 2; for (let k = 0; k < n; k++){ const a = u*.13 + k*Math.PI*2/n; eb(b.x - 40, b.y, Math.cos(a)*3.2, Math.sin(a)*3.2, 2); } }
    if (u === 200 && b.t !== 2) for (let k = 0; k < 2; k++) mkE(b.t === 0 ? "crow" : "kite", W + 40 + k*50, cy(b.y + (k ? 140 : -140)), {y0: cy(b.y + (k ? 140 : -140))});
    if (b.t === 2 && u === 180) ring(b.x, b.y, 18, 3, 0, b.tt*.05);
  }
  function clearStage(){ phase = "clear"; pt = 220; sfx("clear"); P.forEach(p => { if (p.lives > 0){ p.bombs = Math.min(5, p.bombs + 1); } });
    banner = {t: `🎉 ${stage}스테이지 클리어!`, s: "모두 폭탄 +1 · 다음 하늘로!", k: 200, c: "#ffe066"}; }

  /* ---------- 움직이기 ---------- */
  function moveToward(p, tx, ty, v){ const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy); if (d <= v){ p.x = tx; p.y = ty; } else { p.x += dx/d*v; p.y += dy/d*v; } p.x = clampN(p.x, 34, W - 70); p.y = cy(p.y); }
  const DK = [{u: "KeyW", d: "KeyS", l: "KeyA", r: "KeyD", sk: ["KeyF", "Space", "KeyE"], bm: ["KeyG", "KeyQ"]}, {u: "ArrowUp", d: "ArrowDown", l: "ArrowLeft", r: "ArrowRight", sk: ["Enter", "NumpadEnter", "Slash"], bm: ["ShiftRight", "Period", "Numpad0"]}];
  const slotOf = s => local.length >= 2 ? local[s] : local[0];
  function localMove(p, slot, pos){
    const C = SKC[p.ch], dr = drags.get(p.i);
    if (dr){ moveToward(pos, dr.tx, dr.ty, C.spd*1.9); return; }
    const ms = local.length >= 2 ? [DK[slot]] : DK; let kx = 0, ky = 0;
    ms.forEach(m => { if (keys.has(m.l)) kx -= 1; if (keys.has(m.r)) kx += 1; if (keys.has(m.u)) ky -= 1; if (keys.has(m.d)) ky += 1; });
    kx = clampN(kx, -1, 1); ky = clampN(ky, -1, 1); if (kx && ky){ kx *= .72; ky *= .72; }
    pos.x = clampN(pos.x + kx*C.spd, 34, W - 70); pos.y = cy(pos.y + ky*C.spd);
  }
  function botMove(p){
    let tgt = boss && !boss.dead && boss.tt > 100 ? boss : null, best = 1e9;
    if (!tgt) for (const e of E){ if (e.dead || e.x < p.x + 40 || e.x > W) continue; const d = Math.abs(e.y - p.y) + (e.x - p.x)*.3; if (d < best){ best = d; tgt = e; } }
    let ty = tgt ? tgt.y + Math.sin(NG.frame*.02 + p.i)*24 + (p.i - 1.5)*34 : H/2 + (p.i - 1.5)*90, tx = 160 + p.i*40, push = 0, close = false;
    for (const b of EB){ const dx = b.x - p.x, dy = b.y - p.y; if (dx > -24 && dx < 150 && Math.abs(dy) < 54){ push += (dy > 0 ? -1 : 1)*(60 - Math.abs(dy)); if (Math.abs(dx) < 30 && Math.abs(dy) < 26) close = true; } }
    if (push) ty = p.y + push*2;
    for (const it of IT) if (Math.abs(it.x - p.x) < 220 && Math.abs(it.y - p.y) < 160 && !push){ tx = it.x; ty = it.y; break; }
    moveToward(p, tx, ty, SKC[p.ch].spd*.9);
    if (p.gauge >= 100 && (boss || E.length >= 5)) useSkill(p);
    if (close && p.bombs > 0 && !shielded(p) && Math.random() < .25) useBomb(p);
  }

  /* ---------- 고르기 → 출발 ---------- */
  function beginPlay(){
    P.forEach((p, i) => { p.ch = p.sel.c; p.x = 170; p.y = H/2 + (i - (N - 1)/2)*110; p.ent = 0; p.inv = 150; p.rb = null; p.spN++; });
    phase = "play"; sT = 0; waveT = 100; banner = {t: `${stage}스테이지`, s: SKTH[(stage - 1) % 3].n, k: 130}; sfx("go"); setSky();
  }
  function setSky(){ const cv = $("#ngCanvas"); cv.style.backgroundImage = SKTH[(stage - 1) % 3].sky; cv.style.backgroundColor = "#24306e"; }
  function nextStage(){ stage++; sT = 0; waveT = 120; E = []; EB = []; setSky(); banner = {t: `${stage}스테이지`, s: SKTH[(stage - 1) % 3].n + (stage > 3 ? " · 더 세졌어요!" : ""), k: 130}; phase = "play"; sfx("go"); }

  /* ---------- 방장(혼자 할 때도) 한 장면 ---------- */
  function hostStep(){
    if (party === "host") PARTY.readInputs(IN);
    scroll += phase === "sel" ? 1 : 2.4;
    if (phase === "sel"){
      selT--;
      P.forEach((p, i) => { if (BOT.has(i) && !p.sel.ok){ p.sel.c = Math.floor(Math.random()*4); p.sel.ok = true; }
        const d = IN[i].d; if (party === "host" && (O.remote || {})[i] != null && !BOT.has(i) && (d & (1 << 23))){ p.sel.c = d & 3; p.sel.ok = !!(d & 16); } });
      if (selT <= 0 || P.every(p => p.sel.ok)) beginPlay();
      return;
    }
    // 사람·동료 움직이기
    P.forEach((p, i) => {
      if (!p.alive){ if (p.resp > 0 && --p.resp === 0){ p.alive = true; p.x = -50; p.y = H/2 + (i - (N - 1)/2)*90; p.ent = 50; p.inv = 180; p.spN++; } return; }
      if (p.ent > 0){ p.ent--; p.x += (170 - p.x)*.09; }
      else if (BOT.has(i)) botMove(p);
      else if (party === "host" && (O.remote || {})[i] != null){
        const d = IN[i].d, b = IN[i].b, sk = b & 4095, bm = (b >> 12) & 4095;
        if (d & (1 << 22)) moveToward(p, (d >> 10) & 2047, d & 1023, SKC[p.ch].spd*2.6);
        if (p.rb == null) p.rb = [sk, bm]; else { const ds = (sk - p.rb[0] + 4096) % 4096, db = (bm - p.rb[1] + 4096) % 4096; if (ds && ds < 200) useSkill(p); if (db && db < 200) useBomb(p); p.rb = [sk, bm]; }
      } else localMove(p, local.indexOf(i), p);
      if (p.inv > 0) p.inv--;
      p.gauge = Math.min(100, p.gauge + SKC[p.ch].gain);
      if (--p.cd <= 0 && p.ent <= 0) fire(p);
      skillTick(p);
    });
    // 적
    if (phase === "play"){
      sT++;
      if (sT < STAGE_LEN){ if (--waveT <= 0){ wave(); waveT = Math.round(rnd(85, 135)/(1 + (stage - 1)*.12)); } }
      if (sT === STAGE_LEN + 40){ banner = {t: "⚠️ 큰 적이 와요!", s: BS[(stage - 1) % 3].n, k: 150, c: "#ff8787"}; sfx("warn"); }
      if (sT === STAGE_LEN + 160 && !boss) spawnBoss();
    }
    if (phase === "clear" && --pt <= 0) nextStage();
    enemyStep(); if (boss) bossStep();
    moveShots(true);
    // 적 총알
    for (let i = EB.length - 1; i >= 0; i--){ const b = EB[i]; b.x += b.vx; b.y += b.vy; if (b.x < -30 || b.x > W + 30 || b.y < -30 || b.y > H + 30){ EB.splice(i, 1); continue; }
      for (const p of P){ if (!p.alive || shielded(p)) continue; if (Math.abs(b.x - p.x) < 12 && Math.abs(b.y - p.y) < 12 && Math.hypot(b.x - p.x, b.y - p.y) < 6 + [8, 10, 7][b.k]*.65){ EB.splice(i, 1); die(p); break; } } }
    // 몸으로 부딪히기
    P.forEach(p => { if (!p.alive || shielded(p)) return;
      for (const e of E){ if (!e.dead && Math.abs(e.x - p.x) < EN[e.k].w*.36 + 6 && Math.abs(e.y - p.y) < EN[e.k].h*.36 + 6){ dmg(e, 10, p.i); die(p); return; } }
      if (boss && !boss.dead && Math.abs(boss.x - p.x) < BS[boss.t].w*.36 && Math.abs(boss.y - p.y) < BS[boss.t].h*.34) die(p); });
    // 아이템
    for (let i = IT.length - 1; i >= 0; i--){ const it = IT[i]; it.t++; it.x += it.t > 600 ? -3 : it.vx; it.y += it.vy;
      if (it.t <= 600){ if (it.y < 90 || it.y > H - 40) it.vy *= -1; if (it.x < 60) it.vx = Math.abs(it.vx); if (it.x > W - 60) it.vx = -Math.abs(it.vx); }
      if (it.x < -40){ IT.splice(i, 1); continue; }
      const p = P.find(q => q.alive && !q.ent && Math.abs(q.x - it.x) < 40 && Math.abs(q.y - it.y) < 40); if (p){ pick(p, it); IT.splice(i, 1); } }
    commonFx();
    if ((phase === "play" || phase === "clear") && P.every(p => !p.alive && p.lives <= 0)){ phase = "over"; pt = 170; banner = {t: "게임 끝!", s: `${stage}스테이지까지 왔어요`, k: 160, c: "#ff8787"}; playS("hit"); }
    if (phase === "over" && --pt <= 0) finish();
    if (party === "host"){ const now = performance.now(); if (now - lastSnap > 48){ lastSnap = now; PARTY.sendSnap(snap(), NQ.splice(0), 0); } }
  }
  function commonFx(){
    for (let i = FX.length - 1; i >= 0; i--){ const f = FX[i]; if (f.k === "p"){ f.x += f.vx; f.y += f.vy; f.vx *= .95; f.vy *= .95; } else if (f.k === "t") f.y -= .7; if (--f.t <= 0) FX.splice(i, 1); }
    for (let i = LZ.length - 1; i >= 0; i--) if (--LZ[i].t <= 0) LZ.splice(i, 1);
    if (shake > .5) shake *= .86; else shake = 0; if (flash > 0) flash -= .05; if (banner && banner.k > 0) banner.k--;
  }
  function finish(){
    if (ended) return; ended = true; const sc = P.map(p => p.score);
    if (party === "host") PARTY.sendAll({t: "end", w: -1, wins: sc.concat([stage])});
    SKY.result(sc, SIDS, O, stage);
  }

  /* ---------- 🌐 친구 기기 ---------- */
  function snap(){
    const p = [], e = [], b = [], it = [];
    P.forEach(q => p.push(Math.round(q.x), Math.round(q.y), q.ch, q.alive ? 1 : 0, q.inv > 0 ? 1 : 0, q.lives, q.bombs, q.pow, q.score, Math.floor(q.gauge), q.skT, q.sel.c, q.sel.ok ? 1 : 0, q.spN, q.ent));
    E.forEach(q => { if (!q.dead) e.push(KIND.indexOf(q.k), Math.round(q.x), Math.round(q.y), Math.round(q.vx*10), Math.round((q.vy2 || 0)*10), q.hf); });
    EB.forEach(q => b.push(Math.round(q.x), Math.round(q.y), Math.round(q.vx*10), Math.round(q.vy*10), q.k));
    IT.forEach(q => it.push(ITK.indexOf(q.k), Math.round(q.x), Math.round(q.y)));
    return {ph: phase, pt, st: stage, sl: selT, p, e, b, it, bo: boss ? [boss.t, Math.round(boss.x), Math.round(boss.y), Math.round(boss.hp/boss.max*1000), boss.tt, boss.dead, boss.hf, Math.round(boss.vx*10), Math.round(boss.vy*10)] : null, bn: banner};
  }
  function guestStep(){
    scroll += phase === "sel" ? 1 : 2.4;
    const p = P[myIdx];
    if (phase === "sel"){ PARTY.input.d = (1 << 23) | gsel.c | (gsel.ok ? 16 : 0); }
    else if (p && p.alive && !p.ent){ localMove(p, 0, me); p.x = me.x; p.y = me.y; PARTY.input.d = (1 << 22) | (Math.round(clampN(me.x, 0, 2047)) << 10) | Math.round(clampN(me.y, 0, 1023)); }
    PARTY.input.b = ((gbm & 4095) << 12) | (gsk & 4095); PARTY.tickGuest();
    P.forEach((q, i) => { if (i !== myIdx || !q.alive || q.ent){ if (q.tx != null){ const dx = q.tx - q.x, dy = q.ty - q.y; if (Math.abs(dx) + Math.abs(dy) > 160){ q.x = q.tx; q.y = q.ty; } else { q.x += dx*.4; q.y += dy*.4; } } }
      if (q.alive && !q.ent && phase !== "sel" && --q.cd <= 0) fire(q); });
    E.forEach(e => { e.x += e.vx/10; e.y += e.vy/10; if (e.hf) e.hf--; e.t = (e.t || 0) + 1; });
    EB.forEach(b => { b.x += b.vx/10; b.y += b.vy/10; });
    if (boss){ boss.x += boss.bvx/10; boss.y += boss.bvy/10; if (boss.hf) boss.hf--; }
    moveShots(false);
    IT.forEach(it => { it.t = (it.t || 0) + 1; });
    commonFx();
  }
  function apply(d){
    if (d.grid) return;
    if (d.ev){ d.ev.forEach(v => { if (v[0] === "s") playS(v[1]); else if (v[0] === "x") boomFx(v[1], v[2], v[3]); else if (v[0] === "t") txtFx(v[1], v[2], v[3], v[4]); else if (v[0] === "l") LZ.push({x: v[1], t: 22, v: Math.floor(rnd(3))}), shake = 12; else if (v[0] === "f"){ flash = 1; shake = 16; EB.length = 0; } }); return; }
    const s = d.s; if (!s) return;
    if (s.st !== stage){ stage = s.st; setSky(); }
    if (s.ph === "play" && phase === "sel") setSky();
    phase = s.ph; pt = s.pt; selT = s.sl;
    for (let i = 0; i < N; i++){ const a = s.p.slice(i*15, i*15 + 15), q = P[i]; if (!q) continue;
      const wasAlive = q.alive, oldSp = q.spN;
      q.tx = a[0]; q.ty = a[1]; q.ch = a[2]; q.alive = !!a[3]; q.invF = a[4]; q.lives = a[5]; q.bombs = a[6]; q.pow = a[7]; q.score = a[8]; q.gauge = a[9]; q.skT = a[10]; q.sel = {c: a[11], ok: !!a[12]}; q.spN = a[13]; q.ent = a[14];
      if (i === myIdx){ if (q.spN !== oldSp || (q.alive && !wasAlive) || q.ent){ me.x = q.x = a[0]; me.y = q.y = a[1]; } }
      else if (!wasAlive && q.alive){ q.x = a[0]; q.y = a[1]; } }
    E = []; for (let i = 0; i < s.e.length; i += 6) E.push({k: KIND[s.e[i]], x: s.e[i + 1], y: s.e[i + 2], vx: s.e[i + 3], vy: s.e[i + 4], hf: s.e[i + 5], id: i, t: 0});
    EB = []; for (let i = 0; i < s.b.length; i += 5) EB.push({x: s.b[i], y: s.b[i + 1], vx: s.b[i + 2], vy: s.b[i + 3], k: s.b[i + 4]});
    IT = []; for (let i = 0; i < s.it.length; i += 3) IT.push({k: ITK[s.it[i]], x: s.it[i + 1], y: s.it[i + 2], t: 0});
    boss = s.bo ? {t: s.bo[0], x: s.bo[1], y: s.bo[2], hp: s.bo[3], max: 1000, tt: s.bo[4], dead: s.bo[5], hf: s.bo[6], bvx: s.bo[7], bvy: s.bo[8]} : null;
    if (s.bn && (!banner || banner.t !== s.bn.t || Math.abs(banner.k - s.bn.k) > 20)) banner = s.bn;
  }

  /* ---------- 터치 버튼 ---------- */
  function pads(){ const L = []; if (!TOUCH || window.VK_ON) return L;
    const mine = party === "guest" ? [myIdx] : local;
    if (mine.length >= 2){ L.push({t: "sk", pl: mine[0], x: 92, y: H - 104, r: 56}, {t: "bm", pl: mine[0], x: 222, y: H - 66, r: 42}, {t: "sk", pl: mine[1], x: W - 92, y: H - 104, r: 56}, {t: "bm", pl: mine[1], x: W - 222, y: H - 66, r: 42}); }
    else L.push({t: "sk", pl: mine[0], x: W - 96, y: H - 106, r: 60}, {t: "bm", pl: mine[0], x: W - 236, y: H - 66, r: 44});
    return L; }
  let PADS = [];
  function press(pl, t){
    if (party === "guest"){ if (t === "sk") gsk++; else gbm++; return; }
    const p = P[pl]; if (t === "sk") useSkill(p); else useBomb(p);
  }
  function pickCard(x, y){
    if (y < 150 || y > 550) return -1; const c = Math.floor((x - 84)/284); if (c < 0 || c > 3 || x - 84 - c*284 > 260) return -1; return c;
  }
  function choose(slot, c, ok){
    if (party === "guest"){ if (gsel.ok) return; gsel.c = c; gsel.ok = ok; P[myIdx].sel = Object.assign({}, gsel); playS("sel"); return; }
    const p = P[slotOf(slot)]; if (!p || p.sel.ok) return; p.sel.c = c; p.sel.ok = ok; playS("sel");
  }

  /* ---------- 그리기 ---------- */
  const self = {
    W, H, maxPx: 1.7e6,
    get dbg(){ return {P, E, EB, SH, IT, boss, phase, stage, sT}; },
    init(){
      P = SIDS.map((_, i) => mkP(i)); E = []; EB = []; SH = []; IT = []; FX = []; LZ = []; boss = null; bossN = 0; eid = 0;
      phase = "sel"; pt = 0; stage = 1; sT = 0; waveT = 100; banner = null; shake = 0; flash = 0; ended = false; NQ = []; lastSnap = 0; scroll = 0;
      keys = new Set(); drags = new Map(); selT = SEL_T; gsel = {c: party === "guest" ? myIdx % 4 : 0, ok: false}; gsk = PARTY.input && PARTY.input.b ? PARTY.input.b & 4095 : 0; gbm = PARTY.input && PARTY.input.b ? (PARTY.input.b >> 12) & 4095 : 0;
      me = {x: 170, y: H/2}; IN = SIDS.map(() => ({d: 0, b: 0})); PADS = pads();
      setSky();
      if (party) PARTY.attach(self, () => ({t: "grid", gv: 0}));
      const warm = () => { if (NG.cur !== self) return; [0, 1, 2, 3].forEach(c => { heroSpr(c, 0); heroSpr(c, 1); cardSpr(c); }); [0, 1, 2].forEach(ebSpr); ["bl", "bl2", "sr0", "sr1", "po", "tl", "fb1", "fb2"].forEach(shotSpr); KIND.forEach(k => { enSpr(k, 0); enSpr(k, 1); }); ITK.split("").forEach(itemSpr); boomSpr(); };
      (window.requestIdleCallback || setTimeout)(warm, {timeout: 400});
    },
    down(x, y, id){
      if (phase === "sel"){ const c = pickCard(x, y); if (c >= 0){ const slot = local.length >= 2 ? (P[local[0]].sel.ok ? 1 : 0) : 0; choose(slot, c, true); } return; }
      const pd = PADS.find(p => Math.hypot(x - p.x, y - p.y) < p.r*1.15); if (pd){ press(pd.pl, pd.t); return; }
      const mine = party === "guest" ? [myIdx] : local; const pl = mine.length >= 2 ? (x < W/2 ? mine[0] : mine[1]) : mine[0];
      const p = P[pl]; if (!p) return; for (const [k, v] of drags) if (v.id === id) drags.delete(k);
      const pos = party === "guest" ? me : p;
      drags.set(pl, {id, fx: x, fy: y, sx: pos.x, sy: pos.y, tx: pos.x, ty: pos.y});
    },
    move(x, y, id){ for (const [, v] of drags) if (v.id === id){ v.tx = clampN(v.sx + (x - v.fx)*1.5, 34, W - 70); v.ty = cy(v.sy + (y - v.fy)*1.5); } },
    up(x, y, id){ for (const [k, v] of drags) if (v.id === id) drags.delete(k); },
    key(code, d, e){
      for (let s = 0; s < 2; s++){ const m = DK[s];
        const isMove = [m.u, m.d, m.l, m.r].includes(code), isSk = m.sk.includes(code), isBm = m.bm.includes(code);
        if (!isMove && !isSk && !isBm) continue;
        if (d) keys.add(code); else keys.delete(code);
        if (!d || (e && e.repeat)) return true;
        const slot = local.length >= 2 ? s : 0;
        if (phase === "sel"){ const cur = party === "guest" ? gsel : (P[slotOf(slot)] || {}).sel; if (!cur || cur.ok) return true;
          if (code === m.l || code === m.r) choose(slot, (cur.c + (code === m.l ? 3 : 1)) % 4, false); else if (isSk) choose(slot, cur.c, true); return true; }
        if (isSk) press(party === "guest" ? myIdx : slotOf(slot), "sk"); else if (isBm) press(party === "guest" ? myIdx : slotOf(slot), "bm");
        return true; }
      return false;
    },
    step(){ if (ended) return; if (party === "guest") guestStep(); else hostStep(); },
    apply,
    dropIdx(i){ BOT.add(i); const p = P[i]; if (p && !p.sel.ok){ p.sel.ok = true; } },
    end(w, ws){ if (ended) return; ended = true; const st = ws.length > N ? ws[N] : stage; SKY.result(ws.slice(0, N), SIDS, O, st); },
    draw(g){
      g.clearRect(0, 0, W, H);
      const fr = NG.frame, th = SKTH[(stage - 1) % 3];
      g.save(); if (shake > .5) g.translate(rnd(-shake, shake), rnd(-shake, shake));
      // 하늘 (배경색은 CSS) · 해/달 · 구름 두 겹
      if (!th.storm) G2.put(g, celSpr(), 930, 50);
      const far = cloudStrip("f" + (stage - 1) % 3, 1280, 300, 9, 26, 52, 11), near = cloudStrip("n" + (stage - 1) % 3, 1280, 230, 8, 50, 95, 29);
      { const o = (scroll*.25) % 1280; G2.put(g, far, -o, 60); G2.put(g, far, 1280 - o, 60); }
      { const o = (scroll*.9) % 1280; G2.put(g, near, -o, H - 150); G2.put(g, near, 1280 - o, H - 150); }
      if (th.storm && fr % 420 < 8){ g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(0, 0, W, H); }
      // 아이템
      IT.forEach(it => { const s2 = itemSpr(it.k), b = Math.sin((it.t || 0)*.12)*3; G2.put(g, s2, it.x - 26, it.y - 26 + b); });
      // 적
      const af = (fr >> 3) & 1;
      E.forEach(e => { if (e.dead) return; const d = EN[e.k], s2 = enSpr(e.k, af); G2.put(g, s2, e.x - d.w/2 - 4, e.y - d.h/2 - 4);
        if (e.hf){ g.globalAlpha = .55; g.globalCompositeOperation = "lighter"; G2.put(g, s2, e.x - d.w/2 - 4, e.y - d.h/2 - 4); g.globalCompositeOperation = "source-over"; g.globalAlpha = 1; } });
      // 보스
      if (boss){ const d = BS[boss.t], s2 = bossSpr(boss.t, (fr >> 4) & 1), bx = boss.x - d.w/2 - 10, by = boss.y - d.h/2 - 10;
        if (!(boss.dead && fr % 4 < 2)) G2.put(g, s2, bx, by);
        if (boss.hf){ g.globalAlpha = .4; g.globalCompositeOperation = "lighter"; G2.put(g, s2, bx, by); g.globalCompositeOperation = "source-over"; g.globalAlpha = 1; }
        if (!boss.dead){ const r = clampN(boss.hp/boss.max, 0, 1); g.fillStyle = "rgba(20,15,46,.6)"; rrect(g, W/2 - 260, H - 34, 520, 20, 10); g.fill(); g.fillStyle = r < .5 ? "#ff6b6b" : "#ffa94d"; rrect(g, W/2 - 256, H - 30, 512*r, 12, 6); g.fill();
          outlined(g, `👹 ${d.n}`, W/2, H - 48, 18, "#fff"); } }
      // 내 편 총알
      SH.forEach(s => { const k = s.k === "sr" ? "sr" + ((s.t >> 2) & 1) : s.k, c = shotSpr(k);
        if (s.k === "tl"){ g.save(); g.translate(s.x, s.y); g.rotate(Math.atan2(s.vy, s.vx)); g.drawImage(c, -30, -30, 60, 60); g.restore(); } else G2.put(g, c, s.x - 30, s.y - 30); });
      // 캐릭터
      P.forEach((p, i) => { if (!p.alive) return; const x = p.x, y = p.y, mine = party === "guest" ? i === myIdx : local.includes(i) && !BOT.has(i);
        const inv = party === "guest" ? p.invF || p.ent : p.inv > 0 || p.ent > 0;
        if (p.skT > 0 && p.ch === 1){ G2.put(g, ghostSpr(1), x - 50, cy(y - 80) - 38); G2.put(g, ghostSpr(1), x - 50, cy(y + 80) - 38); }
        if (p.skT > 0 && p.ch === 2){ g.fillStyle = "rgba(247,131,172,.18)"; g.beginPath(); g.arc(x, y, 95, 0, 7); g.fill(); g.strokeStyle = `rgba(255,222,235,${.6 + Math.sin(fr*.3)*.3})`; g.lineWidth = 4; g.stroke(); }
        if (!(inv && fr % 6 < 3)) G2.put(g, heroSpr(p.ch, (fr >> 3) & 1), x - 44, y - 40);
        if (p.skT > 0 && p.ch === 0){ g.strokeStyle = "rgba(208,235,255,.85)"; g.lineWidth = 6; const a = fr*.45; for (let k = 0; k < 3; k++){ g.beginPath(); g.arc(x, y, 120 + k*22, a + k*2.1, a + k*2.1 + 1.4); g.stroke(); } }
        if (mine){ g.fillStyle = "#fff"; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); g.strokeStyle = PCOL[i]; g.lineWidth = 2; g.stroke(); }
        if (N > 1) outlined(g, `${i + 1}P`, x - 8, y - 50, 15, PCOL[i]); });
      // 적 총알 (가장 위에 · 잘 보이게)
      const ebs = [ebSpr(0), ebSpr(1), ebSpr(2)]; EB.forEach(b => G2.put(g, ebs[b.k], b.x - 13, b.y - 13));
      // 효과
      const bm = boomSpr(); FX.forEach(f => {
        if (f.k === "b"){ const q = 1 - f.t/f.T, sz = (30 + f.s*30)*(.4 + q*.9); g.globalAlpha = Math.max(0, 1 - q); g.drawImage(bm, f.x - sz/2, f.y - sz/2, sz, sz); }
        else if (f.k === "p"){ g.globalAlpha = Math.min(1, f.t/10); g.fillStyle = f.c; g.fillRect(f.x - 2, f.y - 2, 4, 4); }
        else { g.globalAlpha = Math.min(1, f.t/15); outlined(g, f.s, f.x, f.y, 20, f.c); } });
      g.globalAlpha = 1;
      LZ.forEach(z => { g.globalAlpha = Math.min(1, z.t/10); G2.put(g, lzSpr(z.v), z.x - 45, 0); }); g.globalAlpha = 1;
      g.restore();
      if (flash > 0){ g.fillStyle = `rgba(255,255,255,${flash*.7})`; g.fillRect(0, 0, W, H); }
      // 위: 친구들 칸
      const sw = Math.min(300, (W - 20)/N), x00 = W/2 - sw*N/2;
      P.forEach((p, i) => { const x0 = x00 + i*sw, dead = !p.alive && p.lives <= 0;
        g.fillStyle = dead ? "rgba(20,15,46,.3)" : "rgba(20,15,46,.55)"; rrect(g, x0 + 3, 6, sw - 6, 56, 14); g.fill(); g.fillStyle = PCOL[i]; rrect(g, x0 + 3, 6, sw - 6, 4, 2); g.fill();
        g.globalAlpha = dead ? .45 : 1; faceAt(g, p.sid, x0 + 30, 34, 19, PCOL[i], dead); g.globalAlpha = 1;
        outlined(g, `${i + 1}P ${SKC[p.ch].s}${BOT.has(i) ? " 🤖" : ""}`, x0 + 56, 22, 15, PCOL[i], "rgba(20,15,46,.85)", "left");
        g.font = `20px "Jua",sans-serif`; g.textAlign = "right"; g.textBaseline = "middle"; g.fillStyle = "#fff"; g.fillText(p.score.toLocaleString(), x0 + sw - 12, 22);
        g.font = `14px "Jua",sans-serif`; g.textAlign = "left"; g.fillStyle = "#ff8787"; g.fillText("♥".repeat(Math.max(0, p.lives)), x0 + 56, 44);
        g.fillStyle = "#ffe066"; g.fillText(`P${p.pow}`, x0 + 56 + Math.max(1, p.lives)*12 + 6, 44); g.fillStyle = "#ced4da"; g.fillText(`💣${p.bombs}`, x0 + 56 + Math.max(1, p.lives)*12 + 34, 44);
        const gx = x0 + sw - 82, gw = 70; g.fillStyle = "rgba(255,255,255,.15)"; rrect(g, gx, 39, gw, 9, 4); g.fill(); g.fillStyle = p.gauge >= 100 ? (fr % 20 < 10 ? "#ffe066" : "#ffd43b") : "#9775fa"; rrect(g, gx, 39, gw*p.gauge/100, 9, 4); g.fill(); });
      // 터치 버튼
      if (phase !== "sel") PADS.forEach(pd => { const p = P[pd.pl]; if (!p) return; const r = pd.r; G2.put(g, btnSpr(pd.t, r, PCOL[pd.pl]), pd.x - r - 4, pd.y - r - 4);
        if (pd.t === "sk"){ g.strokeStyle = p.gauge >= 100 ? "#ffe066" : "#9775fa"; g.lineWidth = 6; g.beginPath(); g.arc(pd.x, pd.y, r + 2, -Math.PI/2, -Math.PI/2 + Math.PI*2*p.gauge/100); g.stroke(); }
        else outlined(g, `×${p.bombs}`, pd.x + r*.75, pd.y - r*.75, 18, "#fff"); });
      // 글씨
      if (banner && banner.k > 0){ g.globalAlpha = Math.min(1, banner.k/15); outlined(g, banner.t, W/2, H/2 - 30, 64, banner.c || "#fff"); if (banner.s) outlined(g, banner.s, W/2, H/2 + 30, 28, "#ffe066"); g.globalAlpha = 1; }
      if (phase === "play" && sT < 260 && stage === 1 && party !== "guest" || (party === "guest" && phase === "play" && stage === 1 && banner && banner.k > 0 && banner.k < 100))
        outlined(g, TOUCH ? "손가락으로 끌어서 움직여요 · 총은 자동! · ⚡ 스킬 💣 폭탄" : local.length >= 2 ? "1P W·A·S·D + F 스킬 · G 폭탄 / 2P 방향키 + 엔터 스킬 · 오른쪽 Shift 폭탄" : "방향키(W·A·S·D)로 움직여요 · 총은 자동! · F/스페이스 스킬 · G 폭탄", W/2, H - 70, 22, "#fff");
      // 캐릭터 고르기
      if (phase === "sel"){
        g.fillStyle = "rgba(14,10,40,.62)"; g.fillRect(0, 0, W, H);
        outlined(g, "🌥️ 캐릭터를 골라요!", W/2, 100, 40, "#fff"); outlined(g, `${Math.max(0, Math.ceil(selT/60))}초`, W - 80, 100, 30, selT < 300 ? "#ff8787" : "#ffe066");
        for (let c = 0; c < 4; c++){ const x = 84 + c*284; G2.put(g, cardSpr(c), x, 150); }
        P.forEach((p, i) => { const s = i === myIdx && party === "guest" ? gsel : p.sel, x = 84 + s.c*284;
          g.strokeStyle = PCOL[i]; g.lineWidth = s.ok ? 7 : 4; if (!s.ok) g.setLineDash([12, 8]); rrect(g, x - 4 - i*3, 146 - i*3, 268 + i*6, 408 + i*6, 24); g.stroke(); g.setLineDash([]);
          faceAt(g, p.sid, x + 30 + i*48, 572, 20, PCOL[i]); outlined(g, s.ok ? `${i + 1}P ✔` : `${i + 1}P`, x + 30 + i*48, 604, 15, PCOL[i]); });
        outlined(g, TOUCH ? "카드를 톡! 누르면 결정이에요" : "← → 로 고르고 F(스페이스) / 엔터로 결정!", W/2, H - 50, 24, "#fff");
      }
    },
    hud(){ return `🌥️ ${stage}스테이지 · ${N}명 함께${party ? " · 🌐 온라인 방" : ""}`; }
  };
  return self;
};

/* =====================================================================
   🌥️ 하늘 무사단 — 시작 메뉴 · 결과 · 기록
   ===================================================================== */
const SKY = {
  bots: 0, bots2: 0, lv: 1,
  menu(){
    const me = ARC.me;
    const box = partyModal("sk"), body = $("#wbBody");
    const botRow = (id, max, v) => `<div class="wb-row"><span>🤖 컴퓨터 동료</span><div class="arc-seg" id="${id}">${Array.from({length: max + 1}, (_, n) => `<button data-v="${n}" class="${n === Math.min(v, max) ? "on" : ""}">${n}명</button>`).join("")}</div></div>`;
    body.innerHTML = `<p class="arc-small">구름 위를 날며 <b>기계 요괴</b>를 무찔러요! 총은 <b>자동</b>으로 쏘고, 손가락으로 끌어 움직여요. 친구와 <b>최대 4명</b>이 함께 하고, 각자 점수로 랭킹에 올라가요.</p>
      <div class="sk-chars">${SKC.map((c, i) => `<div class="sk-ch" style="--c:${c.col}"><canvas data-skc="${i}" width="176" height="152"></canvas><b>${c.n}</b><small>⚡ ${c.sk}</small></div>`).join("")}</div>
      <div class="wb-sec"><h3>🧍 혼자 출발 <small>🤖 컴퓨터 동료를 데려갈 수 있어요</small></h3>${botRow("skB1", 3, this.bots)}<button class="arc-btn p" id="skSolo">▶ 출발!</button></div>
      <div class="wb-sec"><h3>🧒 이 기기에서 친구와 둘이 <small>화면 왼쪽·오른쪽 반씩 · 키보드 1P W·A·S·D / 2P 방향키</small></h3>${botRow("skB2", 2, this.bots2)}<button class="arc-btn p" id="skFriend">🧒 친구 들어오기</button></div>
      <div class="wb-sec"><h3>🌐 온라인 방 <small>각자 기기로 최대 4명 · ☁️ Firebase 반에서만</small></h3><div id="wbRooms"></div></div>`;
    body.querySelectorAll("[data-skc]").forEach(cv => { const t = cv.getContext("2d"); t.scale(2, 2); skHero(t, +cv.dataset.skc, 0); });
    const seg = (id, key) => { const s = $("#" + id); s.onclick = e => { const b = e.target.closest("button"); if (!b) return; s.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); this[key] = +b.dataset.v; }; };
    seg("skB1", "bots"); seg("skB2", "bots2");
    $("#skSolo").onclick = () => { box.hidden = true; this.start([me], this.bots); };
    $("#skFriend").onclick = () => { box.hidden = true; ARC.pickRival("sk", opp => this.start([me, opp], this.bots2)); };
    PARTY.renderRooms();
    box.hidden = false;
  },
  start(humans, nBots){
    nBots = Math.max(0, Math.min(4 - humans.length, nBots));
    const bots = WB.pickBots(humans, nBots), sids = humans.concat(bots).map(sidOf);
    ARC.game = "sk"; ARC.enter && ARC.enter(); ARC.prep(); getAC();
    NG.play("sk", sids, {local: humans.map((_, i) => i), bots: bots.map((_, i) => humans.length + i)});
  },
  save(sid, score){
    const gid = "sk", cur = (Store.recs[gid] || {})[sid], r = Object.assign({best: 0, plays: 0}, cur ? JSON.parse(JSON.stringify(cur)) : {}), td = today(), prevBest = r.best || 0;
    r.plays = (r.plays || 0) + 1; r.last = score;
    if (r.day !== td){ r.day = td; r.dayBest = 0; r.dayPlays = 0; }
    r.dayPlays = (r.dayPlays || 0) + 1; if (score > (r.dayBest || 0)){ r.dayBest = score; r.dayAt = Date.now(); }
    const isNew = score > prevBest && score > 0; if (isNew){ r.best = score; r.bestAt = Date.now(); }
    Store.putScore(gid, sid, JSON.parse(JSON.stringify(r)));
    const coins = Store.earn(sid, coinsFor(gid, score) + (isNew ? BEST_COIN : 0));
    return {isNew, r, coins};
  },
  /* 결과: 사람 친구마다 자기 점수로 랭킹 (온라인 방은 방장 기기가 한 번만 올려요) */
  result(scores, sids, o, stage){
    const bots = o.bots || [], guest = o.party === "guest", res = {};
    if (!guest) sids.forEach((sid, i) => { if (!bots.includes(i)) res[i] = this.save(sid, scores[i] || 0); });
    const order = sids.map((s, i) => i).sort((a, b) => (scores[b] || 0) - (scores[a] || 0)), total = scores.reduce((a, b) => a + (b || 0), 0);
    const anyNew = Object.values(res).some(r => r.isNew);
    (anyNew ? SFX.rec : SFX.over)();
    const rows = order.map((i, k) => { const bot = bots.includes(i), r = res[i], sid = sids[i];
      return `<div class="sk-row${(guest ? i === o.idx : (o.local || [0]).includes(i)) && !bot ? " me" : ""}"><span class="rk">${["🥇", "🥈", "🥉", "4"][k]}</span>${bot ? `<span class="f">🤖</span>` : `<span class="avf">${avHTMLof(sid, {still: true, face: true})}</span>`}
        <b>${bot ? "컴퓨터 동료" : esc(who(noOf_(sid)))}</b><span class="v">${(scores[i] || 0).toLocaleString()}점${r && r.isNew ? ` <em>🎉 새 기록</em>` : ""}</span>${r ? `<small>🪙 +${r.coins}</small>` : ""}</div>`; }).join("");
    $("#ngOver").innerHTML = `${anyNew ? NG.conf(80) : ""}<div class="ng-box sk-res"><h3>🌥️ ${stage}스테이지까지 날았어요!</h3>
      <div class="sc">${sids.length > 1 ? `팀 점수 ${total.toLocaleString()}` : `${total.toLocaleString()}점`}</div>
      <div class="sk-rows">${rows}</div>
      <div class="info">${guest ? "랭킹과 코인은 방장 기기가 올려요" : bots.length ? "🤖 컴퓨터 동료 점수는 랭킹에 들어가지 않아요" : "각자 점수로 우리 반 랭킹에 올라가요!"}</div>
      <div class="arc-row">${guest ? `<button class="arc-btn" data-sk="wait">⏳ 방장이 다시 시작하길 기다려요</button>` : `<button class="arc-btn p" data-sk="again">🔁 한 판 더</button>`}<button class="arc-btn" data-sk="home">🏠 홈으로</button></div></div>`;
    $("#ngOver").hidden = false; NG.ended = true;
    $("#ngOver").onclick = e => { const b = e.target.closest("[data-sk]"); if (!b) return; e.stopPropagation();
      if (b.dataset.sk === "home"){ PARTY.leave(); NG.close(); }
      else if (b.dataset.sk === "again"){ if (o.party === "host") PARTY.again(); else NG.play("sk", sids, Object.assign({}, o)); } };
  }
};
(function(){
  const play = ARC.play;
  ARC.play = function(gid){
    if (gid !== "sk") return play.call(this, gid);
    if (!LOBBY.canPlay(gid)) return; getAC(); this.game = gid; this.lastRank = gid; SKY.menu();
  };
  /* 🌐 온라인 방: 각자 기기 최대 4명 (빈자리는 🤖 동료로 채울 수 있어요 · 방장 혼자서도 출발) */
  PARTY.CFG.sk = {max: 4, bots: 1, min: 1};
  const start = PARTY.start;
  PARTY.start = function(again){
    if (this.gid !== "sk") return start.call(this, again);
    if (this.role !== "host") return;
    const live = this.connected().map(p => p.no);
    this.members = [ARC.me].concat(this.members.filter(no => no !== ARC.me && live.includes(no))).slice(0, this.MAX);
    const M = this.members, nb = Math.max(0, Math.min(this.bots, this.MAX - M.length));
    this.started = true; Store.fs.updateDoc(this.ref(this.pid), {st: "play", n: M.length}).catch(() => {});
    const botNos = WB.pickBots(M, nb), sids = M.concat(botNos).map(sidOf), bots = botNos.map((_, i) => M.length + i), seed = Math.floor(Math.random()*1e9) + 1, remote = {};
    M.forEach((no, i) => { if (i){ const P = this.peers.get(no); if (P){ P.idx = i; P.inN = 0; P.last = {d: 0, b: 0}; remote[i] = no; this.send(P, {t: "start", g: "sk", sids, idx: i, bots, seed}); } } });
    this.seq = 0; this.lastGv = -1;
    const md = $("#mdWb"); if (md) md.hidden = true;
    if (!again){ ARC.game = "sk"; ARC.enter(); ARC.prep(); }
    getAC(); NG.play("sk", sids, {party: "host", local: [0], bots, remote, seed});
  };
  const css = document.createElement("style");
  css.textContent = `.sk-chars{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:8px 0}
.sk-ch{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;border-radius:14px;background:linear-gradient(180deg,color-mix(in srgb,var(--c) 45%,transparent),rgba(0,0,0,.15));border:2px solid var(--c);text-align:center}
.sk-ch canvas{width:88px;height:76px}.sk-ch b{font:14px "Jua",sans-serif}.sk-ch small{font-size:12px;opacity:.85}
.in-room>.sk-chars{display:none}
.sk-res{max-width:560px}.sk-rows{display:grid;gap:6px;margin:10px 0;text-align:left}
.sk-row{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:12px;background:rgba(255,255,255,.08)}.sk-row.me{background:rgba(77,171,247,.2);outline:2px solid #4dabf7}
.sk-row .rk{width:28px;text-align:center;font:20px "Jua",sans-serif}.sk-row .avf,.sk-row .f{width:38px;height:38px;flex:none;display:grid;place-items:center;font-size:28px}
.sk-row b{flex:1;font:17px "Jua",sans-serif;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sk-row .v{font:18px "Jua",sans-serif}.sk-row em{font-style:normal;color:#ffe066;font-size:13px}.sk-row small{opacity:.85}
@media (max-width:560px){.sk-chars{grid-template-columns:repeat(2,1fr)}}`;
  document.head.appendChild(css);
})();
