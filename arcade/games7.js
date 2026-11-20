/* =====================================================================
   🥋 주짓수 한판 · 🔥 우리반 격투왕 (2026.11.20)
   - 둘 다 둘이서 대결 게임: 🤖 컴퓨터 · 🧒 한 기기에서 둘이 · 🌐 친구 기기와
   - 사람 몸은 관절 12개로 코드로 그려요 (얼굴은 내 아바타). 자세가 바뀌면 관절이 부드럽게 옮겨 가요
   ⚡ 렉 줄이기: 배경은 한 장으로 미리 그려 두고, 글씨·얼굴은 기억해 둔 그림을 붙여요
      친구 기기는 손가락(누른 횟수)만 보내고, 신청한 친구 기기가 판정해요
   ===================================================================== */
const BODY = (() => {
  // 관절 순서: 0 머리 · 1 목 · 2 어깨 · 3 앞팔꿈치 · 4 앞손 · 5 뒤팔꿈치 · 6 뒤손 · 7 엉덩이 · 8 앞무릎 · 9 앞발 · 10 뒤무릎 · 11 뒤발
  const P = s => s.trim().split(/[\s,]+/).map(Number);
  const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    if (f < 0){ r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r)*f; g += (255 - g)*f; b += (255 - b)*f; }
    return `rgb(${r | 0},${g | 0},${b | 0})`; };
  function limb(t, x1, y1, x2, y2, w1, w2, col){
    const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a);
    t.fillStyle = col; t.beginPath();
    t.moveTo(x1 + nx*w1/2, y1 + ny*w1/2); t.lineTo(x2 + nx*w2/2, y2 + ny*w2/2); t.arc(x2, y2, w2/2, a + Math.PI/2, a - Math.PI/2, true);
    t.lineTo(x1 - nx*w1/2, y1 - ny*w1/2); t.arc(x1, y1, w1/2, a - Math.PI/2, a + Math.PI/2, true); t.fill();
  }
  const dot = (t, x, y, r, c) => { t.fillStyle = c; t.beginPath(); t.arc(x, y, r, 0, 7); t.fill(); };
  const mirror = a => a.map((v, i) => i % 2 ? v : -v);
  const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v)*k);
  /* 자세(상대 좌표, 오른쪽을 봐요) → 화면 좌표 */
  const place = (pose, x, y, face, s = 1) => pose.map((v, i) => i % 2 ? y + v*s : x + v*s*face);
  const ease = (cur, tgt, k) => { if (!cur) return tgt.slice(); for (let i = 0; i < tgt.length; i++) cur[i] += (tgt[i] - cur[i])*k; return cur; };
  const cache = new Map();
  /* sty: {gi, pants, belt, skin, glove, ring} · o: {flash, frz, s(크기), sad, ghost} */
  function draw(g, J, sty, sid, o = {}){
    const s = o.s || 1, X = i => J[i*2], Y = i => J[i*2 + 1];
    const fl = o.flash, fz = o.frz;
    const key = `${sty.gi}|${sty.pants}|${sty.belt}|${sty.skin}|${sty.glove}|${fl ? 1 : 0}|${fz ? 1 : 0}`;
    let C = cache.get(key);
    if (!C){ if (cache.size > 80) cache.clear();
      const T = (c, d = 0) => fl ? "#ffffff" : fz ? shade(c, .42 + d*.6) : d ? shade(c, d) : c;
      const gi = sty.gi, pa = sty.pants || gi, sk = sty.skin || "#f1c7a0", gl = sty.glove || sk;
      C = {gi: T(gi), giB: T(gi, -.2), pa: T(pa), paB: T(pa, -.2), sk: T(sk), gl: T(gl), glB: T(gl, -.2),
        belt: T(sty.belt || "#222"), out: fl ? "#ffe066" : fz ? "#1971c2" : "#1b1430", lap: T(gi, -.32)};
      cache.set(key, C); }
    const OL = 6*s;
    const L = (a, b, w1, w2, col) => { limb(g, X(a), Y(a), X(b), Y(b), (w1 + OL)*s, (w2 + OL)*s, C.out); limb(g, X(a), Y(a), X(b), Y(b), w1*s, w2*s, col); };
    const D = (i, r, col) => { dot(g, X(i), Y(i), (r + OL/2)*s, C.out); dot(g, X(i), Y(i), r*s, col); };
    if (o.ghost){ g.globalAlpha = o.ghost; }
    // 뒤팔 · 뒤다리
    L(2, 5, 19, 16, C.giB); L(5, 6, 16, 13, C.giB); D(6, sty.glove ? 13 : 10, sty.glove ? C.glB : C.sk);
    L(7, 10, 29, 23, C.paB); L(10, 11, 23, 17, C.paB); D(11, 10, C.sk);
    // 몸통 · 띠 · 옷깃
    L(1, 7, 48, 42, C.gi);
    const dx = X(7) - X(1), dy = Y(7) - Y(1), dl = Math.hypot(dx, dy) || 1, ux = dx/dl, uy = dy/dl;
    limb(g, X(7) - ux*16*s, Y(7) - uy*16*s, X(7) - ux*4*s, Y(7) - uy*4*s, 46*s, 46*s, C.belt);
    if (!fl){ g.strokeStyle = C.lap; g.lineWidth = 4*s; g.lineCap = "round"; g.beginPath(); g.moveTo(X(1) - uy*12*s, Y(1) + ux*12*s); g.lineTo(X(7) - ux*20*s + uy*6*s, Y(7) - uy*20*s - ux*6*s); g.stroke(); }
    // 앞다리
    L(7, 8, 29, 23, C.pa); L(8, 9, 23, 17, C.pa); D(9, 10, C.sk);
    // 머리 (내 아바타 얼굴)
    if (!o.ghost) faceAt(g, sid, X(0), Y(0), 30*s, fl ? "#fff" : fz ? "#a5d8ff" : (sty.ring || "#fff"), !!o.sad);
    else dot(g, X(0), Y(0), 30*s, C.gi);
    // 앞팔
    L(2, 3, 19, 16, C.gi); L(3, 4, 16, 13, C.gi); D(4, sty.glove ? 14 : 10, sty.glove ? C.gl : C.sk);
    if (o.ghost) g.globalAlpha = 1;
  }
  return {P, draw, mirror, mix, place, ease, shade, limb};
})();

/* 띠 색 (주짓수 승리 수로) */
const JJ_BELT = [[0, "#f8f9fa", "흰띠"], [3, "#1c7ed6", "파란띠"], [6, "#7048e8", "보라띠"], [10, "#8d5524", "갈색띠"], [15, "#111", "검은띠"]];
const jjBelt = sid => { const w = (((Store.recs || {}).jj || {})[sid] || {}).w || 0; let b = JJ_BELT[0]; JJ_BELT.forEach(x => { if (w >= x[0]) b = x; }); return b; };

/* =====================================================================
   🥋 주짓수 한판 — 붙잡고, 넘기고, 누르고, 조르기! 탭 받으면 바로 승리
   ⚡ 공격 · 🛡️ 탈출(숨 고르기) · 🔒 조르기 — 기술을 걸면 둘이 연타 대결!
   ===================================================================== */
NG.defs.jj = () => {
  const W = 1280, H = 720, GY = 492, SC = 1.08, T0 = 90*60;
  const cpu = () => NG.opt.cpu, lv = () => NG.opt.lv ?? 1, net = () => NG.opt.net, mine = () => net() === "guest" ? 1 : 0;
  const two = () => !cpu() && !net();
  const P = BODY.P;
  const PO = {
    st: P("14 -262 4 -228 4 -220 48 -188 84 -214 34 -176 78 -190 -8 -124 26 -64 36 0 -34 -60 -46 0"),
    gT: P("-20 -214 -30 -184 -30 -176 6 -128 40 -96 -6 -122 28 -90 -70 -88 -22 -10 -104 -4 -6 -8 -92 -4"),
    gB: P("150 -26 116 -24 112 -24 80 -70 42 -98 90 -50 30 -90 -10 -34 -40 -130 -110 -110 -30 -118 -100 -96"),
    hT: P("96 -86 64 -76 60 -74 100 -50 136 -30 40 -40 70 -24 -36 -70 -20 -8 -104 -2 4 -30 -50 -8"),
    hB: P("150 -30 116 -26 112 -26 74 -64 30 -86 90 -40 50 -60 -6 -30 -56 -50 -24 -12 -62 -28 -18 -6"),
    sT: P("118 -68 84 -80 80 -78 118 -44 150 -28 52 -36 66 -14 -16 -90 -4 -6 -84 -2 18 -8 -64 -2"),
    sB: P("150 -26 116 -22 112 -22 70 -64 40 -96 130 -8 96 -6 -14 -26 -74 -74 -126 -4 -110 -24 -184 -8"),
    mT: P("48 -232 40 -200 40 -192 84 -150 110 -82 68 -146 96 -76 26 -90 78 -20 -10 -10 66 -16 -18 -6"),
    mB: P("156 -26 122 -22 118 -22 80 -64 40 -92 100 -58 56 -98 -4 -26 -70 -86 -120 -4 -80 -70 -140 -6"),
    bT: P("-6 -178 -18 -148 -18 -140 30 -130 68 -150 14 -112 56 -128 -56 -34 -6 -82 46 -60 -14 -66 40 -42"),
    bB: P("58 -160 36 -132 34 -126 66 -104 60 -146 72 -90 66 -138 -4 -30 78 -44 150 -4 84 -36 156 -6"),
    wn: P("4 -264 0 -230 0 -222 24 -272 30 -322 -22 -270 -30 -320 -2 -126 22 -64 30 0 -26 -62 -36 0"),
    ls: P("36 -110 20 -86 20 -80 44 -50 60 -24 30 -46 50 -20 -30 -30 30 -70 60 -4 22 -60 50 -4")
  };
  const POS = {stand: "🧍 서서 잡기 싸움", guard: "🦵 클로즈 가드", half: "🌗 하프 가드", side: "🛡️ 사이드 컨트롤", mount: "🐎 마운트", back: "🎒 백 컨트롤"};
  const REST = {n: "숨 고르기", e: "😮‍💨", rest: 1};
  /* [자리][역할 n=서서 t=위 b=아래] = {a: ⚡, b: 🛡️, c: 🔒} · top: "me"=건 사람이 위 / "opp"=상대가 위 */
  const MV = {
    stand: {n: {a: {n: "테이크다운", e: "🤼", to: "half", top: "me", pts: 2, d: 1}, b: REST, c: {n: "가드 끌기", e: "🦵", to: "guard", top: "opp", pts: 0, inst: 1}}},
    guard: {t: {a: {n: "가드 패스", e: "🏃", to: "side", top: "me", pts: 3, d: 1.15}, b: REST, c: {n: "발목 꺾기", e: "🦶", sub: 1, d: 1.35, fail: {to: "stand"}}},
            b: {a: {n: "시저 스윕", e: "✂️", to: "mount", top: "me", pts: 2, d: 1.12}, b: REST, c: {n: ["트라이앵글 초크", "암바"], e: "🔺", sub: 1, d: 1.15}}},
    half:  {t: {a: {n: "하프 패스", e: "🏃", to: "side", top: "me", pts: 3, d: 1.05}, b: REST, c: {n: "키무라", e: "🔑", sub: 1, d: 1.3}},
            b: {a: {n: "언더훅 스윕", e: "🔄", to: "half", top: "me", pts: 2, d: 1.1}, b: {n: "가드 되찾기", e: "🛡️", to: "guard", top: "opp", pts: 0, d: .9}, c: null}},
    side:  {t: {a: {n: "마운트 올라타기", e: "🐎", to: "mount", top: "me", pts: 4, d: 1.1}, b: REST, c: {n: "아메리카나", e: "💪", sub: 1, d: 1.15}},
            b: {a: {n: "일어나기", e: "🧍", to: "stand", pts: 0, d: 1.15}, b: {n: "가드 되찾기", e: "🛡️", to: "guard", top: "opp", pts: 0, d: 1}, c: null}},
    mount: {t: {a: {n: "등 잡기", e: "🎒", to: "back", top: "me", pts: 4, d: 1.1}, b: REST, c: {n: "암바", e: "💪", sub: 1, d: 1, fail: {to: "guard", top: "opp"}}},
            b: {a: {n: "팔꿈치 탈출", e: "🦵", to: "half", top: "opp", pts: 0, d: 1}, b: {n: "브릿지 뒤집기", e: "🌉", to: "guard", top: "me", pts: 2, d: 1.3}, c: null}},
    back:  {t: {a: {n: "마운트로", e: "🐎", to: "mount", top: "me", pts: 0, d: .75}, b: REST, c: {n: "리어 네이키드 초크", e: "🐍", sub: 1, d: .95}},
            b: {a: {n: "돌아 나오기", e: "🔄", to: "guard", top: "me", pts: 0, d: 1.2}, b: REST, c: null}}
  };
  const GI = [{gi: "#1f5fbf", pants: "#1f5fbf", ring: "#74c0fc", skin: "#f1c7a0"}, {gi: "#f8f9fa", pants: "#f1f3f5", ring: "#ff8787", skin: "#e9b98f"}];
  const COL = ["#4dabf7", "#ff6b6b"];
  let ph, pt, t, pos, top, pts, adv, sta, scr, cool, restT, acts, q, fx, J, shake, flash, ann, endInfo, cpuT, lastSub, stall;
  let cnt = [0, 0, 0], seen = [0, 0, 0];   // 🌐 친구 기기가 누른 횟수
  const NQ = [];
  const ev = (k, ...a) => { play(k, a); if (net() === "host") NQ.push([k, ...a]); };
  function play(k, a){
    if (k === "sn"){ const n = a[0];
      if (n === "grip") tone(260, 180, .08, "square", .07);
      else if (n === "go"){ tone(520, 880, .12, "triangle", .1); tone(880, 1320, .1, "triangle", .08, .08); }
      else if (n === "ok"){ SFX.gold(); }
      else if (n === "no"){ tone(300, 120, .22, "sawtooth", .09); }
      else if (n === "lock"){ tone(140, 90, .3, "sawtooth", .12); tone(700, 500, .1, "square", .06, .05); }
      else if (n === "tap"){ [0, .14, .28].forEach(d => tone(200, 120, .1, "square", .14, d)); SFX.rec(); }
      else if (n === "mash") tone(400 + Math.random()*200, 300, .03, "square", .035);
      else if (n === "bell"){ [0, .25].forEach(d => tone(1200, 1180, .5, "sine", .12, d)); }
      else if (n === "slam"){ tone(120, 40, .25, "sawtooth", .15); }
    } else if (k === "tx"){ fx.push({s: a[0], x: a[1], y: a[2], c: a[3] || "#fff", t: 80, sz: a[4] || 40}); }
    else if (k === "bm"){ shake = Math.max(shake, a[0] || 10); flash = .35; for (let i = 0; i < 18; i++){ const an = rnd(Math.PI*2), sp = rnd(2, 8); fx.push({p: 1, x: W/2 + rnd(-60, 60), y: GY - 30, vx: Math.cos(an)*sp, vy: Math.sin(an)*sp - 3, t: 34, c: COLS[i % COLS.length]}); } }
  }
  const role = p => pos === "stand" ? "n" : top === p ? "t" : "b";
  const moveOf = (p, k) => { const m = (MV[pos][role(p)] || {})[k]; return m || null; };
  const nm = m => Array.isArray(m.n) ? m.n[lastSub % m.n.length] : m.n;
  const pow = p => .55 + .45*sta[p]/100;
  function init(){
    ph = "intro"; pt = 120; t = T0; pos = "stand"; top = -1; pts = [0, 0]; adv = [0, 0]; sta = [100, 100]; scr = null; cool = [0, 0]; restT = [0, 0]; acts = [0, 0];
    q = [[], []]; fx = []; J = [null, null]; shake = 0; flash = 0; ann = {s: "🥋 오스!", t: 110}; endInfo = null; cpuT = 60; lastSub = 0; stall = 0;
  }
  /* 기술 걸기 */
  function act(p, k){
    if (ph !== "play" || scr || cool[p] > 0) return;
    const m = moveOf(p, k); if (!m) return;
    if (m.rest){ if (restT[p] > 0) return; restT[p] = 50; cool[p] = 20; ev("tx", "😮‍💨 숨 고르기", p ? W - 230 : 230, 470, "#c5f6fa", 28); return; }
    if (sta[p] < 12){ ev("tx", "😵 숨이 차요!", p ? W - 230 : 230, 470, "#ffa8a8", 30); cool[p] = 30; return; }
    sta[p] -= 12; acts[p]++; stall = 0;
    if (m.inst){ ev("sn", "grip"); apply(p, m); cool[p] = 30; return; }
    if (m.sub) lastSub++;
    scr = {a: p, m, k: 0, t: 0, T: m.sub ? 240 : 150, n: nm(m)};
    ev("sn", m.sub ? "lock" : "go");
  }
  /* 자리 바꾸기 + 점수 */
  function apply(p, m){
    const o = 1 - p;
    if (m.to === "stand"){ pos = "stand"; top = -1; }
    else { pos = m.to; top = m.top === "me" ? p : m.top === "opp" ? o : top; }
    if (m.pts){ pts[p] += m.pts; ev("tx", `+${m.pts}점 · ${nm(m)}!`, p ? W - 300 : 300, 300, COL[p], 44); ev("sn", "ok"); ev("bm", 8); }
    else ev("sn", "slam");
  }
  function mash(p){
    if (!scr) return;
    const s = scr, sub = s.m.sub;
    if (p === s.a) s.k += pow(p)*(sub ? 4.4 : 5.6)/(s.m.d || 1);
    else s.k -= pow(p)*(sub ? 4.8 : 5.6);
    sta[p] = Math.max(0, sta[p] - .7);
    if (NG.frame % 3 === 0) ev("sn", "mash");
  }
  function scrStep(){
    const s = scr; s.t++;
    if (s.m.sub) s.k += .2;
    const a = s.a, o = 1 - a;
    const win = s.m.sub ? s.k >= 100 : s.k >= 100 || (s.t >= s.T && s.k >= 25);
    const lose = s.m.sub ? s.k <= -60 || s.t >= s.T : s.k <= -100 || (s.t >= s.T && s.k < 25);
    if (!win && !lose) return;
    scr = null; cool[a] = 40; cool[o] = 20;
    if (win){
      if (s.m.sub){ tapOut(a, s.n); return; }
      apply(a, s.m);
    } else {
      if (s.k > 0 || (s.m.sub && s.t >= s.T && s.k > 30)){ adv[a]++; ev("tx", "어드밴티지 +1", a ? W - 300 : 300, 340, "#ffe066", 32); }
      ev("tx", s.m.sub ? "🙌 빠져나왔어요!" : "🛡️ 막았어요!", o ? W - 300 : 300, 300, COL[o], 40); ev("sn", "no");
      if (s.m.fail){ const f = s.m.fail; if (f.to === "stand"){ pos = "stand"; top = -1; } else { pos = f.to; top = f.top === "opp" ? o : a; } }
    }
  }
  function tapOut(w, how){
    ev("sn", "tap"); ev("bm", 18);
    finish(w, `🔒 ${how}로 탭 승!`, 1);
  }
  function finish(w, why, sub){
    if (ph === "end") return;
    ph = "end"; pt = sub ? 150 : 120; endInfo = {w, why, sub}; scr = null;
    ann = {s: sub ? "👋 탭! 탭!" : "🔔 경기 끝!", t: 130};
    if (!sub) ev("sn", "bell");
  }
  function judge(){
    let w, why;
    if (pts[0] !== pts[1]){ w = pts[0] > pts[1] ? 0 : 1; why = "점수로 승리!"; }
    else if (adv[0] !== adv[1]){ w = adv[0] > adv[1] ? 0 : 1; why = "어드밴티지로 승리!"; }
    else if (acts[0] !== acts[1]){ w = acts[0] > acts[1] ? 0 : 1; why = "심판 판정 (더 많이 공격)"; }
    else { w = sta[0] >= sta[1] ? 0 : 1; why = "심판 판정"; }
    finish(w, why, 0);
  }
  /* 🤖 컴퓨터 */
  function ai(){
    const L = [{q: .012, mash: 4.6, sub: .3}, {q: .022, mash: 6.6, sub: .5}, {q: .034, mash: 8.6, sub: .7}][lv()], p = 1;
    if (scr){ if ((scr.a === p || scr.a === 0) && Math.random() < L.mash*(.7 + Math.random()*.6)/60) q[p].push("m"); return; }
    if (--cpuT > 0 || cool[p] > 0) return;
    if (Math.random() > L.q*6){ cpuT = 8; return; }
    cpuT = 30 + Math.floor(rnd(50));
    if (sta[p] < 30 && moveOf(p, "b") && moveOf(p, "b").rest){ q[p].push("b"); return; }
    const r = role(p), A = moveOf(p, "a"), B = moveOf(p, "b"), C = moveOf(p, "c");
    let k = "a";
    if (C && C.sub && Math.random() < L.sub*(r === "t" ? 1 : .6)) k = "c";
    else if (r === "b" && B && !B.rest && Math.random() < .5) k = "b";
    else if (!A) k = B && !B.rest ? "b" : "c";
    else if (pos === "stand" && Math.random() < .15) k = "c";
    q[p].push(k);
  }
  function step(){
    if (net() === "guest"){ if (shake > 0) shake *= .85; if (flash > 0) flash -= .03; tickFx(); return; }
    if (shake > 0) shake *= .85; if (flash > 0) flash -= .03;
    tickFx();
    if (ann && --ann.t <= 0) ann = null;
    if (ph === "intro"){ if (--pt <= 0){ ph = "play"; ann = {s: "▶ 시작!", t: 50}; ev("sn", "bell"); } q = [[], []]; return; }
    if (ph === "end"){ if (--pt === 0){ const e = endInfo, txt = `${e.why}${e.sub ? "" : ` · ${pts[0]} : ${pts[1]}`}`; if (net() === "host") NET.end(e.w, null, txt); NG.win(e.w, txt); } return; }
    // play
    t--; if (t <= 0){ t = 0; judge(); return; }
    for (const p of [0, 1]){ if (cool[p] > 0) cool[p]--; if (restT[p] > 0) restT[p]--; sta[p] = Math.min(100, sta[p] + (restT[p] > 0 ? .5 : scr ? 0 : .1)); }
    if (cpu()) ai();
    for (const p of [0, 1]){ const Q = q[p]; q[p] = []; Q.forEach(k => { if (scr && (scr.a === p || 1 - scr.a === p)) mash(p); else if (k !== "m") act(p, k); }); }
    if (scr) scrStep();
    if (!scr && ++stall > 60*12 && pos !== "stand"){ stall = 0; if (pos !== "mount" && pos !== "back"){ ev("tx", "🧑‍⚖️ 다시 서서!", W/2, 230, "#fff", 40); pos = "stand"; top = -1; ev("sn", "bell"); } }
  }
  function tickFx(){ fx = fx.filter(f => { if (f.p){ f.x += f.vx; f.y += f.vy; f.vy += .3; } else f.y -= .5; return --f.t > 0; }); }
  /* ---------- 그리기 ---------- */
  let BG = null, bgK = 0;
  function paintBg(t){
    const gr = t.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#10142b"); gr.addColorStop(.55, "#1d2445"); gr.addColorStop(1, "#0b0e1f"); t.fillStyle = gr; t.fillRect(0, 0, W, H);
    // 관중석
    for (let r = 0; r < 4; r++) for (let i = 0; i < 34; i++){ const x = i*40 + (r % 2)*20 - 10, y = 150 + r*34; t.fillStyle = `hsla(${(i*47 + r*90) % 360},40%,${32 - r*4}%,.9)`; t.beginPath(); t.arc(x, y, 13, 0, 7); t.fill(); t.fillRect(x - 15, y + 8, 30, 30); }
    const sp = t.createRadialGradient(W/2, 120, 20, W/2, 300, 620); sp.addColorStop(0, "rgba(255,248,220,.38)"); sp.addColorStop(1, "rgba(255,248,220,0)"); t.fillStyle = sp; t.fillRect(0, 0, W, H);
    // 매트 (원근)
    const mat = (y0, y1, x0, x1, c) => { t.fillStyle = c; t.beginPath(); t.moveTo(W/2 - x0, y0); t.lineTo(W/2 + x0, y0); t.lineTo(W/2 + x1, y1); t.lineTo(W/2 - x1, y1); t.closePath(); t.fill(); };
    mat(300, H, 560, 760, "#b0283a"); mat(318, H, 500, 690, "#1b8f86"); mat(345, 640, 440, 560, "#23a89c");
    t.strokeStyle = "rgba(255,255,255,.12)"; t.lineWidth = 2; for (let i = -6; i <= 6; i++){ t.beginPath(); t.moveTo(W/2 + i*72, 318); t.lineTo(W/2 + i*104, H); t.stroke(); }
    for (let y = 360; y < H; y += 46){ t.beginPath(); t.moveTo(0, y); t.lineTo(W, y); t.stroke(); }
    t.fillStyle = "rgba(255,255,255,.08)"; t.font = `bold 46px "Jua",sans-serif`; t.textAlign = "center"; t.fillText("🥋 우리반 주짓수 챔피언십", W/2, 590);
  }
  function bg(g){ const k = NG.k || 1; if (!BG || bgK !== k){ BG = document.createElement("canvas"); BG.width = Math.round(W*k); BG.height = Math.round(H*k); const c = BG.getContext("2d"); c.scale(k, k); paintBg(c); bgK = k; } g.drawImage(BG, 0, 0, W, H); }
  /* 지금 자리에서 두 사람 자세 */
  function targets(){
    const f = NG.frame, br = Math.sin(f*.06)*3, sx = W/2;
    const jit = scr ? Math.sin(f*.9)*4 : 0;
    if (ph === "end" && endInfo){ const w = endInfo.w, s = w === 0 ? 1 : -1, A = [], B = [];
      const sw = pt < (endInfo.sub ? 110 : 90);
      if (!sw) return targets0(br, jit, sx);
      A[w] = BODY.place(PO.wn, sx - 110*s, GY, s, SC); B[1 - w] = BODY.place(PO.ls, sx + 120*s, GY, -s, SC);
      return [A[0] || B[0], A[1] || B[1]];
    }
    return targets0(br, jit, sx);
  }
  function targets0(br, jit, sx){
    const out = [];
    if (pos === "stand"){
      const lean = scr ? (scr.k/100)*18*(scr.a ? -1 : 1) : 0;
      out[0] = BODY.place(PO.st, sx - 88 + lean + jit, GY, 1, SC); out[1] = BODY.place(PO.st, sx + 88 + lean - jit, GY, -1, SC);
    } else {
      const k = {guard: ["gT", "gB"], half: ["hT", "hB"], side: ["sT", "sB"], mount: ["mT", "mB"], back: ["bT", "bB"]}[pos], s = top === 0 ? 1 : -1, ox = sx - 20*s;
      out[top] = BODY.place(PO[k[0]], ox + jit, GY, s, SC); out[1 - top] = BODY.place(PO[k[1]], ox - jit*.5, GY, s, SC);
    }
    out.forEach(a => { for (let i = 0; i < 14; i += 2) a[i + 1] += br; });
    return out;
  }
  function drawP(g, p){
    const sid = NG.sids[p], b = jjBelt(sid), sty = Object.assign({}, GI[p], {belt: b[1]});
    const sad = ph === "end" && endInfo && endInfo.w !== p && pt < 100;
    const inSub = scr && scr.m.sub && scr.a !== p;
    if (inSub){ g.save(); g.shadowColor = "#ff2a2a"; g.shadowBlur = 20 + Math.sin(NG.frame*.4)*12; }
    BODY.draw(g, J[p], sty, sid, {s: SC, sad});
    if (inSub) g.restore();
  }
  function bar(g, x, y, w, h, v, c, back = "rgba(0,0,0,.45)"){ g.fillStyle = back; rrect(g, x, y, w, h, h/2); g.fill(); if (v > 0){ g.fillStyle = c; rrect(g, x, y, Math.max(h, w*v), h, h/2); g.fill(); } }
  /* 🎛️ 아래 단추판 */
  const BTN = [["a", "⚡", "#ffb703"], ["b", "🛡️", "#4dabf7"], ["c", "🔒", "#ff6b9a"]];
  function panels(){
    const L = [];
    const mk = (p, x, big) => { const w = big ? 196 : 150, h = big ? 112 : 92, gap = 12;
      BTN.forEach(([k], i) => L.push({p, k, x: x + i*(w + gap), y: H - h - 14, w, h})); };
    if (two()){ mk(0, 16, 0); mk(1, W - 16 - (150*3 + 24), 0); }
    else mk(mine(), W/2 - (196*3 + 24)/2, 1);
    return L;
  }
  function drawPanels(g){
    panels().forEach(b => {
      const m = moveOf(b.p, b.k), on = !!m && ph === "play", busy = scr && (scr.a === b.p || 1 - scr.a === b.p), c = BTN.find(x => x[0] === b.k);
      g.globalAlpha = on || busy ? 1 : .45;
      g.fillStyle = "rgba(0,0,0,.35)"; rrect(g, b.x, b.y + 6, b.w, b.h, 22); g.fill();
      const gr = g.createLinearGradient(0, b.y, 0, b.y + b.h); gr.addColorStop(0, busy ? "#ffe066" : c[2]); gr.addColorStop(1, busy ? "#f08c00" : BODY.shade(c[2], -.35));
      g.fillStyle = gr; rrect(g, b.x, b.y, b.w, b.h, 22); g.fill();
      g.strokeStyle = COL[b.p]; g.lineWidth = 4; rrect(g, b.x, b.y, b.w, b.h, 22); g.stroke();
      if (busy){ outlined(g, b.p === scr.a ? "연타!" : "버텨!", b.x + b.w/2, b.y + b.h/2, b.w > 160 ? 40 : 32, "#fff"); }
      else { g.font = `${b.w > 160 ? 34 : 28}px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(m ? (m.e || c[1]) : c[1], b.x + b.w/2, b.y + b.h*.36);
        outlined(g, m ? nm(m) : "—", b.x + b.w/2, b.y + b.h*.74, b.w > 160 ? 22 : 18, "#fff"); }
      g.globalAlpha = 1;
    });
  }
  function draw(g){
    bg(g);
    g.save(); if (shake > .5) g.translate(rnd(-shake, shake), rnd(-shake, shake));
    const T = targets(); for (const p of [0, 1]) J[p] = BODY.ease(J[p], T[p], ph === "end" ? .1 : .16);
    // 그림자
    g.fillStyle = "rgba(0,0,0,.28)"; g.beginPath(); g.ellipse(W/2, GY + 6, 240, 22, 0, 0, 7); g.fill();
    // 아래 사람 먼저
    const order = pos === "stand" || top < 0 ? [0, 1] : [1 - top, top];
    if (pos === "back") order.reverse();
    order.forEach(p => drawP(g, p));
    g.restore();
    // 점수판
    for (const p of [0, 1]){
      const y = 14 + p*66, sid = NG.sids[p];
      g.fillStyle = "rgba(10,12,28,.88)"; rrect(g, 14, y, 560, 58, 14); g.fill();
      g.fillStyle = COL[p]; rrect(g, 14, y, 12, 58, 6); g.fill();
      faceAt(g, sid, 56, y + 29, 22, GI[p].ring);
      const nmx = p === 1 && cpu() ? "🤖 컴퓨터" : who(noOf_(sid)), b = jjBelt(sid);
      outlined(g, nmx, 88, y + 22, 24, "#fff", undefined, "left");
      g.fillStyle = b[1]; rrect(g, 88, y + 38, 54, 12, 4); g.fill(); g.fillStyle = "#111"; g.fillRect(126, y + 38, 10, 12);
      outlined(g, b[2], 150, y + 44, 14, "#ced4da", undefined, "left");
      bar(g, 240, y + 40, 130, 10, sta[p]/100, sta[p] > 30 ? "#69db7c" : "#ff6b6b");
      g.fillStyle = "#0f5132"; rrect(g, 386, y + 6, 92, 46, 8); g.fill(); outlined(g, `${pts[p]}`, 432, y + 30, 38, "#b2f2bb");
      g.fillStyle = "#5c4a00"; rrect(g, 486, y + 6, 40, 46, 8); g.fill(); outlined(g, `${adv[p]}`, 506, y + 30, 26, "#ffe066");
    }
    // 시계 · 자리
    const s = Math.ceil(t/60);
    g.fillStyle = "rgba(10,12,28,.88)"; rrect(g, W - 250, 14, 236, 70, 14); g.fill();
    outlined(g, `${Math.floor(s/60)}:${String(s % 60).padStart(2, "0")}`, W - 132, 50, 46, s <= 10 ? "#ff8787" : "#fff");
    g.fillStyle = "rgba(10,12,28,.75)"; rrect(g, W - 330, 92, 316, 46, 12); g.fill();
    const tp = pos === "stand" ? "" : ` · 위: ${top === 0 ? "🔵" : "🔴"}`;
    outlined(g, POS[pos] + tp, W - 172, 115, 22, "#ffe066");
    // 연타 대결 막대
    if (scr){
      const s2 = scr, x0 = W/2 - 280, y0 = 176, sub = s2.m.sub;
      g.fillStyle = "rgba(0,0,0,.6)"; rrect(g, x0 - 12, y0 - 34, 584, 92, 18); g.fill();
      outlined(g, `${s2.m.e} ${s2.n}`, W/2, y0 - 10, 28, sub ? "#ffa8a8" : "#ffe066");
      if (sub){ const v = clampN((s2.k + 60)/160, 0, 1); bar(g, x0, y0 + 14, 560, 28, v, `hsl(${(1 - v)*60},90%,55%)`); outlined(g, "🔒 탭까지!", x0 + 560, y0 + 28, 18, "#fff", undefined, "right"); }
      else { const v = clampN((s2.k + 100)/200, 0, 1); g.fillStyle = COL[1 - s2.a]; rrect(g, x0, y0 + 14, 560, 28, 14); g.fill(); g.fillStyle = COL[s2.a]; rrect(g, x0, y0 + 14, 560*v, 28, 14); g.fill();
        g.fillStyle = "#fff"; g.fillRect(x0 + 560*.625 - 2, y0 + 10, 4, 36); }
      const tl = 1 - s2.t/s2.T; g.fillStyle = "#fff"; g.fillRect(x0, y0 + 48, 560*tl, 4);
    }
    // 글씨 · 조각
    fx.forEach(f => { g.globalAlpha = Math.min(1, f.t/20); if (f.p){ g.fillStyle = f.c; g.fillRect(f.x, f.y, 7, 7); } else outlined(g, f.s, f.x, f.y, f.sz, f.c); }); g.globalAlpha = 1;
    if (flash > 0){ g.fillStyle = `rgba(255,255,255,${flash})`; g.fillRect(0, 0, W, H); }
    drawPanels(g);
    if (ann){ const a = Math.min(1, ann.t/20); g.globalAlpha = a; outlined(g, ann.s, W/2, 300, 76, "#fff"); g.globalAlpha = 1; }
    if (ph === "intro") outlined(g, two() ? "⚡ 기술 걸기 · 🛡️ 탈출/숨 고르기 · 🔒 조르기 — 기술이 걸리면 둘 다 연타!" : "⚡ 기술 · 🛡️ 탈출 · 🔒 조르기 — 걸리면 빠르게 연타! 탭 받으면 바로 승리", W/2, 400, 26, "#ffe066");
    if (ph === "end" && endInfo && pt < 100) outlined(g, `🏆 ${endInfo.w === 1 && cpu() ? "컴퓨터" : who(noOf_(NG.sids[endInfo.w]))} 승리! ${endInfo.why}`, W/2, 250, 40, "#ffe066");
  }
  /* ---------- 손가락 · 키보드 ---------- */
  const K1 = {KeyF: "a", KeyG: "b", KeyH: "c"}, K2 = {KeyJ: "a", KeyK: "b", KeyL: "c", Numpad1: "a", Numpad2: "b", Numpad3: "c"}, KS = {Space: "a", KeyZ: "a", KeyX: "b", KeyC: "c", Digit1: "a", Digit2: "b", Digit3: "c"};
  function press(p, k){
    if (net() === "guest"){ cnt[{a: 0, b: 1, c: 2}[k]]++; return; }
    q[p].push(k);
  }
  const self = { W, H,
    init(){ init(); cnt = [0, 0, 0]; seen = [0, 0, 0]; },
    step,
    draw,
    down(x, y){
      const b = panels().find(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
      if (b){ press(b.p, b.k); return; }
      if (scr){ const p = two() ? (x < W/2 ? 0 : 1) : mine(); press(p, "a"); }
    },
    key(code, d, e){
      if (!d) return !!(K1[code] || K2[code] || KS[code]);
      if (e && e.repeat) return true;
      if (two()){ if (K1[code]){ press(0, K1[code]); return true; } if (K2[code]){ press(1, K2[code]); return true; } return false; }
      const k = K1[code] || K2[code] || KS[code]; if (!k) return false; press(mine(), k); return true;
    },
    hud(){ return `🥋 ${esc(who(noOf_(NG.sids[0])))} <b>${pts[0]}</b> : <b>${pts[1]}</b> ${cpu() ? "🤖 컴퓨터" : esc(who(noOf_(NG.sids[1])))} · 탭 받으면 바로 승리!${net() ? " · 🌐 다른 기기 대결" : ""}`; },
    netAd: {
      snap: () => ({ph, pt, t, pos, top, pts, adv, sta: sta.map(v => Math.round(v)), cool, sc: scr ? {a: scr.a, k: Math.round(scr.k), t: scr.t, T: scr.T, n: scr.n, e: scr.m.e, sub: scr.m.sub ? 1 : 0} : null, an: ann, ei: endInfo, ls: lastSub}),
      ev: () => NQ.splice(0),
      fx(e){ e.forEach(([k, ...a]) => play(k, a)); },
      apply(d){
        if (net() !== "guest") return;
        ph = d.ph; pt = d.pt; t = d.t; pos = d.pos; top = d.top; pts = d.pts; adv = d.adv; sta = d.sta; cool = d.cool; ann = d.an; endInfo = d.ei; lastSub = d.ls;
        scr = d.sc ? {a: d.sc.a, k: d.sc.k, t: d.sc.t, T: d.sc.T, n: d.sc.n, m: {e: d.sc.e, sub: d.sc.sub}} : null;
      },
      mine: () => ({c: cnt}),
      put(d){ if (net() !== "host" || !d.c) return; ["a", "b", "c"].forEach((k, i) => { let n = Math.min(12, d.c[i] - seen[i]); seen[i] = d.c[i]; while (n-- > 0) q[1].push(k); }); },
      end(w, sc, txt){ if (net() !== "guest" || NG.ended) return; NG.win(w, txt); },
      reset(){}
    }
  };
  return self;
};

/* =====================================================================
   🔥 우리반 격투왕 — 캐릭터 6명 · 3판 2선승 · 콤보 · 기술 · 필살기
   👊 펀치 · 🦵 킥 · ✨ 기술 · 💥 필살(게이지 가득) · 뒤로 = 막기 · ↓ = 앉기 · 앞으로 두 번 = 달리기
   ===================================================================== */
const KF_STY = [
  {id: "fire", e: "🔥", n: "불꽃 권법", d: "화염탄을 쏘고, 필살 불꽃 용!", gi: "#e8590c", pants: "#2b2118", belt: "#ffd43b", glove: "#c92a2a", ring: "#ff922b", aura: "#ff7b00", sp: "proj", pk: "fire", su: "beam", spn: "화염탄", sun: "🔥 불꽃 용!!", spd: 1, dm: 1},
  {id: "thunder", e: "⚡", n: "번개 태권", d: "번개처럼 날아 차는 연속 발차기", gi: "#f8f9fa", pants: "#f8f9fa", belt: "#212529", glove: "#fab005", ring: "#ffd43b", aura: "#ffe066", sp: "rush", su: "rushS", spn: "번개 회오리차기", sun: "⚡ 천둥 연속차기!!", spd: 1.06, dm: .95},
  {id: "ice", e: "❄️", n: "얼음 닌자", d: "얼음 표창으로 얼리고, 빙하 폭발", gi: "#1c7ed6", pants: "#1864ab", belt: "#a5d8ff", glove: "#e7f5ff", ring: "#74c0fc", aura: "#99e9f2", sp: "proj", pk: "ice", su: "pillars", spn: "얼음 표창", sun: "❄️ 빙하 폭발!!", spd: 1.08, dm: .95},
  {id: "rock", e: "🪨", n: "바위 레슬러", d: "막을 수 없는 돌진 메치기와 땅울림", gi: "#8d6346", pants: "#4a3426", belt: "#ffa94d", glove: "#495057", ring: "#c0a080", aura: "#e0a96d", sp: "grab", su: "quake", spn: "돌진 메치기", sun: "🪨 대지 강타!!", spd: .88, dm: 1.15},
  {id: "wind", e: "🌪️", n: "바람 권투", d: "하늘로 솟는 회오리 어퍼컷", gi: "#2b8a3e", pants: "#1b4d2a", belt: "#69db7c", glove: "#f03e3e", ring: "#8ce99a", aura: "#b2f2bb", sp: "rise", su: "tornado", spn: "회오리 어퍼컷", sun: "🌪️ 태풍 러시!!", spd: 1.04, dm: 1},
  {id: "moon", e: "🌙", n: "달빛 마법", d: "느린 달빛 구슬과 별똥별 비", gi: "#7048e8", pants: "#4c2fb0", belt: "#ffd43b", glove: "#e5dbff", ring: "#b197fc", aura: "#d0bfff", sp: "proj", pk: "orb", su: "meteor", spn: "달빛 구슬", sun: "🌙 별똥별 비!!", spd: .98, dm: 1}
];
let KF_LAST = [0, 1];
try { const v = JSON.parse(localStorage.getItem("arcade.kf") || "null"); if (Array.isArray(v)) KF_LAST = v; } catch(e) {}
NG.defs.kf = () => {
  const W = 1280, H = 720, GY = 640, LX = 70, RX = W - 70;
  const cpu = () => NG.opt.cpu, lv = () => NG.opt.lv ?? 1, net = () => NG.opt.net, mine = () => net() === "guest" ? 1 : 0, two = () => !cpu() && !net();
  const P = BODY.P;
  const PZ = {
    idle: P("8 -252 0 -218 0 -210 30 -170 52 -200 14 -166 36 -196 -6 -120 26 -62 34 0 -34 -60 -42 0"),
    idle2: P("8 -246 0 -213 0 -205 30 -165 53 -194 14 -161 37 -190 -6 -117 30 -60 34 0 -38 -58 -42 0"),
    w1: P("10 -252 2 -218 2 -210 30 -170 54 -200 14 -166 38 -196 -4 -120 36 -60 50 0 -26 -62 -46 0"),
    w2: P("10 -254 2 -220 2 -212 30 -172 54 -202 14 -168 38 -198 -4 -122 8 -66 -2 -14 -4 -64 6 0"),
    crouch: P("14 -170 4 -140 4 -134 34 -100 56 -128 18 -96 40 -124 -10 -62 40 -50 30 0 -30 -30 -50 0"),
    jump: P("6 -262 0 -228 0 -220 32 -190 50 -215 16 -186 34 -210 -4 -132 30 -110 14 -70 -20 -104 -30 -64"),
    punch: P("18 -250 8 -216 10 -208 60 -206 108 -208 0 -168 26 -192 -6 -120 34 -62 50 0 -36 -58 -52 0"),
    kick: P("-20 -250 -20 -215 -20 -207 10 -175 30 -200 -45 -170 -60 -150 -10 -120 50 -150 110 -170 -20 -60 -24 0"),
    cpunch: P("14 -170 4 -140 4 -134 56 -128 102 -128 18 -96 40 -124 -10 -62 40 -50 30 0 -30 -30 -50 0"),
    sweep: P("-6 -150 -10 -122 -10 -116 10 -80 10 -40 -30 -85 -40 -50 -20 -50 40 -22 110 -6 -40 -30 -60 0"),
    jpunch: P("6 -262 0 -228 0 -220 40 -200 82 -178 16 -186 34 -210 -4 -132 30 -110 14 -70 -20 -104 -30 -64"),
    jkick: P("-6 -260 -6 -226 -6 -218 16 -196 26 -218 -30 -200 -40 -224 -8 -132 40 -110 96 -90 -16 -100 -36 -70"),
    special: P("26 -238 16 -206 18 -198 62 -190 104 -186 56 -180 100 -176 -12 -112 40 -60 66 0 -44 -50 -70 0"),
    rush: P("30 -226 18 -194 18 -186 -10 -160 -36 -150 -16 -168 -44 -160 -8 -120 60 -150 124 -154 -24 -60 -50 -10"),
    grab: P("34 -228 22 -196 22 -188 64 -200 100 -216 58 -170 98 -164 -6 -112 40 -60 64 0 -40 -52 -66 0"),
    upper: P("14 -262 6 -228 8 -220 36 -262 48 -310 -8 -180 14 -160 -2 -128 30 -80 26 -30 -20 -60 -24 0"),
    block: P("-2 -246 -6 -212 -6 -204 26 -196 30 -230 20 -182 28 -214 -10 -118 22 -62 28 0 -36 -58 -44 0"),
    cblock: P("6 -168 -2 -138 -2 -132 30 -130 34 -160 24 -118 30 -150 -14 -60 36 -48 26 0 -32 -28 -52 0"),
    hit: P("-24 -244 -22 -210 -22 -202 0 -170 14 -150 -44 -170 -50 -140 -12 -118 20 -62 26 0 -38 -58 -46 0"),
    down: P("-120 -24 -90 -24 -86 -24 -60 -50 -30 -30 -100 -8 -70 -6 -10 -22 40 -50 80 -6 30 -30 90 -6"),
    win: P("6 -254 0 -220 0 -212 20 -262 24 -310 14 -168 30 -140 -4 -122 26 -62 34 0 -34 -60 -42 0"),
    run: P("36 -236 24 -204 24 -196 50 -160 70 -140 0 -170 -20 -150 -4 -118 40 -70 30 0 -30 -50 -70 -20")
  };
  /* 기본 기술 (hb: 앞으로 얼마나, 위 끝, 너비, 높이) */
  const M = {
    P:  {st: 4, ac: 3, rc: 9,  dm: 5, hb: [28, -236, 88, 52], hs: 14, bs: 9,  pu: 5, pz: "punch", ch: ["P", "K", "S", "X"], sf: "l"},
    K:  {st: 7, ac: 4, rc: 15, dm: 9, hb: [26, -212, 114, 74], hs: 18, bs: 12, pu: 8, pz: "kick", ch: ["S", "X"], sf: "h"},
    cP: {st: 4, ac: 3, rc: 9,  dm: 4, hb: [28, -152, 88, 46], hs: 13, bs: 8,  pu: 5, pz: "cpunch", cr: 1, ch: ["cP", "cK", "S", "X"], sf: "l"},
    cK: {st: 8, ac: 5, rc: 20, dm: 9, hb: [20, -48, 120, 48], hs: 20, bs: 12, pu: 7, pz: "sweep", cr: 1, low: 1, kd: 1, ch: ["S", "X"], sf: "h"},
    jP: {st: 4, ac: 10, rc: 0, dm: 6, hb: [8, -214, 86, 70], hs: 15, bs: 10, pu: 4, pz: "jpunch", air: 1, ov: 1, sf: "l"},
    jK: {st: 6, ac: 12, rc: 0, dm: 9, hb: [16, -164, 114, 80], hs: 18, bs: 12, pu: 6, pz: "jkick", air: 1, ov: 1, sf: "h"}
  };
  const SP = {
    proj:  {st: 13, ac: 2, rc: 22, pz: "special", spawn: 1},
    rush:  {st: 8, ac: 24, rc: 16, pz: "rush", vx: 10, mh: 3, hi: 8, dm: 5, hb: [0, -230, 96, 190], hs: 16, bs: 10, pu: 3, kdl: 1, sf: "h", chip: 1},
    grab:  {st: 7, ac: 18, rc: 26, pz: "grab", vx: 11, grab: 1},
    rise:  {st: 3, ac: 22, rc: 12, pz: "upper", inv: 10, vy: -16, vx: 3, mh: 2, hi: 9, dm: 6, hb: [0, -310, 84, 270], hs: 20, bs: 12, pu: 4, kd: 1, sf: "h", chip: 1},
    beam:  {st: 12, ac: 2, rc: 30, pz: "special", spawn: 1, sup: 1, inv: 20},
    rushS: {st: 6, ac: 42, rc: 20, pz: "rush", vx: 12, mh: 8, hi: 5, dm: 4, hb: [0, -240, 110, 210], hs: 14, bs: 8, pu: 2, kdl: 1, sf: "h", sup: 1, inv: 14, chip: 1},
    pillars: {st: 10, ac: 30, rc: 20, pz: "special", spawn: 1, sup: 1, inv: 20},
    quake: {st: 8, ac: 80, rc: 18, pz: "upper", vy: -19, vx: 0, sup: 1, inv: 30, quake: 1},
    tornado: {st: 3, ac: 36, rc: 16, pz: "upper", inv: 16, vy: -17, vx: 2, mh: 7, hi: 5, dm: 4, hb: [-40, -330, 170, 330], hs: 20, bs: 8, pu: 2, kd: 1, sf: "h", sup: 1, chip: 1},
    meteor: {st: 12, ac: 2, rc: 30, pz: "win", spawn: 1, sup: 1, inv: 20}
  };
  const COL = ["#ff922b", "#4dabf7"];
  const STAGE = [
    {n: "노을 옥상", sky: ["#ff8a5c", "#7a3d8f", "#2a1b4d"], floor: ["#5b4a6b", "#2d2340"]},
    {n: "우리반 체육관", sky: ["#f6d7a7", "#e9b872", "#c88b4a"], floor: ["#d9a066", "#9c6a3a"]},
    {n: "네온 밤거리", sky: ["#0b1033", "#1d1250", "#2b0f3f"], floor: ["#1a1838", "#0a0a1a"]}
  ];
  let F, pr, sch, parts, ph, pt, round, tm, ann, shake, freeze, slow, sf, sel, stg, cb, IN, NQ = [], winner, flash;
  let cnt = [0, 0, 0, 0, 0, 0, 0, 0], seen = [0, 0, 0, 0, 0, 0, 0, 0], held = {l: 0, r: 0, u: 0, d: 0};   // 🌐 친구 기기 손가락
  const BK = ["p", "k", "s", "x", "L", "R", "U", "D"];
  const ev = (k, ...a) => { play(k, a); if (net() === "host") NQ.push([k, ...a]); };
  function play(k, a){
    if (k === "sn"){ const n = a[0];
      if (n === "l"){ tone(260, 90, .07, "square", .11); tone(1400, 500, .03, "sawtooth", .05); }
      else if (n === "h"){ tone(170, 45, .14, "sawtooth", .15); tone(900, 200, .05, "square", .07); }
      else if (n === "b"){ tone(1100, 900, .05, "triangle", .1); tone(600, 500, .04, "square", .05); }
      else if (n === "w") tone(300, 650, .07, "sine", .05);
      else if (n === "pj"){ tone(180, 520, .22, "sawtooth", .08); tone(500, 900, .15, "triangle", .06); }
      else if (n === "sup"){ [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f*1.01, .12, "square", .07, i*.05)); tone(80, 40, .6, "sawtooth", .14); }
      else if (n === "ko"){ tone(90, 30, .9, "sawtooth", .2); [784, 659, 523, 392].forEach((f, i) => tone(f, f, .18, "triangle", .1, .3 + i*.12)); }
      else if (n === "go"){ tone(660, 1320, .2, "square", .08); }
      else if (n === "tick") tone(880, 880, .05, "triangle", .06);
      else if (n === "land") tone(120, 70, .08, "sine", .1);
      else if (n === "throw"){ tone(140, 40, .3, "sawtooth", .16); }
    } else if (k === "sp"){ const [x, y, t, c] = a, n = t === "b" ? 10 : t === "h" ? 22 : 14;
      for (let i = 0; i < n; i++){ const an = rnd(Math.PI*2), s = rnd(3, t === "h" ? 13 : 9); parts.push({x, y, vx: Math.cos(an)*s, vy: Math.sin(an)*s, t: 18 + rnd(10), T: 28, c: t === "b" ? "#a5d8ff" : i % 3 ? c : "#fff", r: rnd(2, 5)}); }
      parts.push({ring: 1, x, y, r: t === "h" ? 26 : 16, t: 14, T: 14, c: t === "b" ? "#d0ebff" : c});
      if (t !== "b") parts.push({star: 1, x, y, r: t === "h" ? 54 : 36, t: 8, T: 8, c: "#fff"});
    } else if (k === "ds"){ const [x, y] = a; for (let i = 0; i < 8; i++) parts.push({x: x + rnd(-20, 20), y: y - rnd(4), vx: rnd(-2.5, 2.5), vy: -rnd(.5, 2), t: 24, T: 24, c: "rgba(220,210,200,.8)", r: rnd(4, 9), dust: 1}); }
  }
  const sty = i => KF_STY[F[i].s];
  function mk(i, s){ return {i, s, x: i ? W/2 + 230 : W/2 - 230, y: GY, vx: 0, vy: 0, face: i ? -1 : 1, st: "idle", t: 0, mv: null, mid: "", mf: 0, hn: 0, lh: -99, hp: 100, dhp: 100, pw: 0, wins: 0, inv: 0, air: false, J: null, pz: "idle", gl: 0, frz: 0, cbN: 0, tap: {L: -99, R: -99}, rec: 0, ghost: 0, aq: 0}; }
  function init(){
    F = [mk(0, KF_LAST[0] || 0), mk(1, KF_LAST[1] ?? 1)]; pr = []; sch = []; parts = []; ann = null; shake = 0; freeze = 0; slow = 0; sf = null; cb = null; winner = -1; flash = 0;
    IN = [{h: {l: 0, r: 0, u: 0, d: 0}, q: []}, {h: {l: 0, r: 0, u: 0, d: 0}, q: []}];
    stg = Math.floor(rnd(STAGE.length)); round = 1; tm = 60*60;
    ph = "sel"; pt = 15*60; sel = {c: [F[0].s, F[1].s], ok: [0, 0]};
    if (cpu()){ sel.c[1] = Math.floor(rnd(KF_STY.length)); }
  }
  function startRound(){
    F.forEach((f, i) => Object.assign(f, {x: i ? W/2 + 230 : W/2 - 230, y: GY, vx: 0, vy: 0, face: i ? -1 : 1, st: "idle", t: 0, mv: null, mf: 0, hp: 100, dhp: 100, inv: 0, air: false, gl: 0, frz: 0, cbN: 0, rec: 0}));
    pr = []; sch = []; tm = 60*60; ph = "intro"; pt = 110; slow = 0; sf = null; cb = null;
    ann = {s: round >= 3 ? "🔥 마지막 판!" : `${round}라운드`, t: 70, s2: "준비…"};
  }
  /* ---------- 판정 상자 ---------- */
  function hurt(f){
    if (f.st === "down" || f.st === "getup") return null;
    if (f.air) return [f.x - 32, f.y - 250, 64, 220];
    if (f.st === "crouch" || (f.mv && f.mv.cr) || f.pz === "cblock") return [f.x - 38, f.y - 178, 76, 178];
    return [f.x - 32, f.y - 272, 64, 272];
  }
  const boxW = (f, hb) => f.face > 0 ? [f.x + hb[0], f.y + hb[1], hb[2], hb[3]] : [f.x - hb[0] - hb[2], f.y + hb[1], hb[2], hb[3]];
  const ov = (a, b) => a && b && a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1];
  const back = f => { const h = IN[f.i].h; return f.face > 0 ? h.l : h.r; };
  const fwd = f => { const h = IN[f.i].h; return f.face > 0 ? h.r : h.l; };
  const free = f => !f.air && ["idle", "walk", "crouch", "run", "land"].includes(f.st) && !(f.st === "land" && f.t > 0);
  function blocking(d, h){
    if (h.unb || d.air || !back(d)) return false;
    if (!["idle", "walk", "crouch", "block"].includes(d.st)) return false;
    const cr = IN[d.i].h.d;
    if (h.low && !cr) return false;
    if (h.ov && cr) return false;
    return true;
  }
  /* 맞히기 */
  function hit(a, d, h, ix, iy){
    if (d.inv > 0 || d.st === "down" || d.st === "getup" || ph !== "fight") return false;
    const dir = Math.sign(d.x - a.x) || -d.face, S = sty(a.i);
    if (blocking(d, h)){
      d.st = "block"; d.t = h.bs; d.vx = dir*h.pu*1.2; d.mv = null;
      if (h.chip){ d.hp = Math.max(1, d.hp - h.dm*.2); }
      d.pw = Math.min(300, d.pw + 3); a.pw = Math.min(300, a.pw + 2);
      if (d.x <= LX + 4 || d.x >= RX - 4) a.vx = -dir*h.pu;
      ev("sp", ix, iy, "b", "#fff"); ev("sn", "b"); freeze = Math.max(freeze, 4);
      return "b";
    }
    const k = Math.max(.4, 1 - .1*d.cbN), dmg = h.dm*S.dm*k;
    d.hp = Math.max(0, d.hp - dmg); d.cbN++; d.gl = 6; d.mv = null;
    if (h.frz) d.frz = 40;
    if (d.air || h.kd || d.hp <= 0){ d.st = "fall"; d.air = true; d.vy = -9 - (h.sup ? 3 : 0); d.vx = dir*5.5; d.t = 0; }
    else { d.st = "hit"; d.t = h.hs + (d.frz > 0 ? 8 : 0); d.vx = dir*h.pu; }
    if (d.x <= LX + 4 || d.x >= RX - 4) a.vx = -dir*h.pu*.8;
    if (!h.sup) a.pw = Math.min(300, a.pw + 7); d.pw = Math.min(300, d.pw + 5);
    if (d.cbN >= 2) cb = {i: a.i, n: d.cbN, t: 70};
    freeze = Math.max(freeze, dmg > 7 ? 8 : 5); shake = Math.max(shake, dmg > 7 ? 10 : 5);
    ev("sp", ix, iy, dmg > 7 ? "h" : "l", S.aura); ev("sn", h.sf || (dmg > 7 ? "h" : "l"));
    if (d.hp <= 0) ko(a.i);
    return "h";
  }
  function ko(w){
    if (ph !== "fight") return;
    ph = "ko"; pt = 150; winner = w; slow = 90; ann = {s: "K.O.!", t: 120, big: 1}; ev("sn", "ko"); flash = .8; shake = 20;
  }
  /* ---------- 기술 시작 ---------- */
  function start(f, id){
    const S = sty(f.i);
    let mv;
    if (id === "S") mv = SP[S.sp];
    else if (id === "X"){ if (f.pw < 100) return false; mv = SP[S.su]; }
    else mv = M[id];
    if (!mv) return false;
    if (id === "S" && S.sp === "proj" && pr.some(p => p.o === f.i && !p.sup)) return false;   // 내 화염탄은 한 번에 하나
    f.st = "atk"; f.mv = mv; f.mid = id; f.mf = 0; f.hn = 0; f.lh = -99; f.ghost = 0;
    if (!mv.air) f.vx = 0;
    if (mv.inv) f.inv = mv.inv;
    if (id === "X"){ f.pw -= 100; sf = {i: f.i, t: 48, s: S.sun, c: S.aura}; ev("sn", "sup"); shake = 6; }
    else if (id === "S") ev("sn", "w");
    else ev("sn", "w");
    return true;
  }
  function spawn(f, mv){
    const S = sty(f.i), o = F[1 - f.i], fx = f.x + f.face*70;
    if (f.mid === "S"){
      const k = S.pk, P2 = {fire: {vx: 10, r: 26, dm: 9}, ice: {vx: 12.5, r: 22, dm: 7, frz: 1}, orb: {vx: 5.5, r: 30, dm: 10}}[k];
      pr.push({o: f.i, k, x: fx, y: f.y - 170, vx: P2.vx*f.face, vy: 0, r: P2.r, dm: P2.dm, nh: 1, hi: 0, ht: 0, life: 200, frz: P2.frz, sf: "h", chip: 1});
      ev("sn", "pj");
    } else if (S.su === "beam"){
      pr.push({o: f.i, k: "beam", x: fx, y: f.y - 160, vx: 11*f.face, vy: 0, r: 70, dm: 4, nh: 6, hi: 5, ht: 0, life: 160, sup: 1, kdl: 1, chip: 1, sf: "h"});
      ev("sn", "pj"); shake = 12;
    } else if (S.su === "pillars"){
      [0, 1, 2, 3].forEach(n => sch.push({t: 6 + n*9, fn: () => { const x = clampN(f.x + f.face*(140 + n*130), LX, RX); pr.push({o: f.i, k: "pil", x, y: GY, vx: 0, vy: 0, r: 46, dm: 8, nh: 1, hi: 0, ht: 0, life: 26, sup: 1, kd: n === 3, frz: 1, rect: 1, chip: 1, sf: "h"}); ev("sp", x, GY - 40, "h", "#99e9f2"); shake = 6; }}));
    } else if (S.su === "meteor"){
      for (let n = 0; n < 7; n++) sch.push({t: n*9, fn: () => { const x = clampN(o.x + rnd(-110, 110), LX, RX); pr.push({o: f.i, k: "met", x: x - 120*f.face, y: -40, vx: 3*f.face, vy: 15, r: 26, dm: 6, nh: 1, hi: 0, ht: 0, life: 80, sup: 1, kd: n === 6, chip: 1, sf: "h"}); }});
    }
  }
  /* ---------- 한 사람 한 장면 ---------- */
  function upd(f){
    const o = F[1 - f.i], I = IN[f.i], h = I.h, S = sty(f.i);
    if (f.inv > 0) f.inv--; if (f.gl > 0) f.gl--; if (f.frz > 0) f.frz--;
    I.q = I.q.filter(x => x.f > NG.frame - 9);
    const take = k => { const j = I.q.findIndex(x => x.k === k); if (j < 0) return false; I.q.splice(j, 1); return true; };
    const any = ks => ks.find(k => I.q.some(x => x.k === k));
    // 앞으로 두 번 → 달리기 · 뒤로 두 번 → 뒤로 뛰기
    ["L", "R"].forEach(k => { if (!take(k)) return; const dirS = k === "R" ? 1 : -1, last = f.tap[k]; f.tap[k] = NG.frame;
      if (NG.frame - last < 14 && free(f)){ if (dirS === f.face){ f.st = "run"; ev("ds", f.x, GY); } else { f.st = "jump"; f.air = true; f.vy = -7; f.vx = -f.face*9; f.bs = 1; ev("ds", f.x, GY); } } });
    if (take("U") && free(f)) jump(f, h);
    // 상태
    if (f.st === "hit" || f.st === "block"){ f.vx *= .82; if (--f.t <= 0){ f.st = "idle"; } }
    else if (f.st === "down"){ f.vx *= .8; if (--f.t <= 0){ f.st = "getup"; f.t = 18; f.inv = 24; } }
    else if (f.st === "getup"){ if (--f.t <= 0){ f.st = "idle"; f.cbN = 0; } }
    else if (f.st === "land"){ if (--f.t <= 0) f.st = "idle"; }
    else if (f.st === "win" || f.st === "lose"){ f.vx *= .8; }
    else if (f.st === "atk"){
      const mv = f.mv; f.mf++;
      // 연결 기술 (맞았거나 막혔을 때)
      if (f.hn > 0 && mv.ch){ const nx = (cr => { const k = any(["x", "s", "k", "p"]); if (!k) return null; const id = k === "x" ? "X" : k === "s" ? "S" : k === "k" ? (cr ? "cK" : "K") : (cr ? "cP" : "P"); return mv.ch.includes(id) ? [k, id] : null; })(h.d);
        if (nx && (nx[1] !== "X" || f.pw >= 100) && !(nx[1] === "P" && f.rec >= 2)){ take(nx[0]); f.rec = nx[1] === "P" || nx[1] === "cP" ? f.rec + 1 : 0; start(f, nx[1]); return upd2(f, o); } }
      if (mv.vx && f.mf >= mv.st && f.mf < mv.st + mv.ac && !mv.grabbed) f.vx = mv.vx*f.face*S.spd;
      else if (!mv.air && !f.air) f.vx *= .7;
      if (mv.vy && f.mf === mv.st){ f.vy = mv.vy; f.air = true; f.vx = (mv.vx || 0)*f.face; ev("ds", f.x, GY); }
      if (mv.spawn && f.mf === mv.st) spawn(f, mv);
      if (mv.ghost !== false && (mv.sup || mv.vx)) f.ghost = 6;
      // 맞히기
      const act = f.mf >= mv.st && f.mf < mv.st + mv.ac;
      if (act && mv.hb && (f.mf - f.lh >= (mv.hi || 999)) && f.hn < (mv.mh || 1)){
        const hb = boxW(f, mv.hb), hu = hurt(o);
        if (ov(hb, hu)){ const last = f.hn === (mv.mh || 1) - 1, ix = (Math.max(hb[0], hu[0]) + Math.min(hb[0] + hb[2], hu[0] + hu[2]))/2, iy = (Math.max(hb[1], hu[1]) + Math.min(hb[1] + hb[3], hu[1] + hu[3]))/2;
          const r = hit(f, o, Object.assign({}, mv, {kd: mv.kd || (mv.kdl && last), dm: mv.dm}), ix, iy); if (r){ f.hn++; f.lh = f.mf; } }
      }
      if (act && mv.grab && !mv.grabbed && Math.abs(o.x - f.x) < 110 && !o.air && o.inv <= 0 && o.st !== "down" && o.st !== "getup"){
        f.hn = 1; f.vx = 0; const d = 16*S.dm; o.hp = Math.max(0, o.hp - d); o.st = "fall"; o.air = true; o.vy = -15; o.vx = f.face*7; o.gl = 8; o.cbN++; o.mv = null;
        ev("sn", "throw"); ev("sp", (f.x + o.x)/2, GY - 160, "h", S.aura); shake = 14; freeze = 8; f.pw = Math.min(300, f.pw + 10);
        f.mf = mv.st + mv.ac; if (o.hp <= 0) ko(f.i);
      }
      if (mv.quake && f.mf > mv.st + 4 && !f.air && !f.qk){ f.qk = 1; f.mf = mv.st + mv.ac;
        ev("sn", "ko"); shake = 22; flash = .4;
        [-1, 1].forEach(dr => pr.push({o: f.i, k: "wave", x: f.x + dr*40, y: GY - 30, vx: dr*13, vy: 0, r: 40, dm: 22, nh: 1, hi: 0, ht: 0, life: 70, sup: 1, kd: 1, unb: 1, sf: "h"})); }
      const end = mv.st + mv.ac + mv.rc;
      if (mv.air){ if (!f.air){ f.st = "land"; f.t = 4; f.mv = null; } }
      else if (mv.vy){ if (f.mf > mv.st + 2 && !f.air){ f.st = "land"; f.t = mv.rc; f.mv = null; f.qk = 0; } }
      else if (f.mf >= end){ f.st = "idle"; f.mv = null; f.rec = 0; }
    }
    else if (f.st === "jump" || f.st === "fall"){ /* 공중: 아래에서 */
      if (f.st === "jump" && !f.bs){ const k = take("k") ? "jK" : take("p") ? "jP" : null; if (k) start(f, k); }
    }
    else if (free(f)){
      f.rec = 0;
      if (take("x") && f.pw >= 100){ start(f, "X"); }
      else if (take("s")) start(f, "S");
      else if (take("p")) start(f, h.d ? "cP" : "P");
      else if (take("k")) start(f, h.d ? "cK" : "K");
      else if (h.u) jump(f, h);
      else if (h.d){ f.st = "crouch"; f.vx = 0; }
      else if (f.st === "run" && fwd(f)){ f.vx = 9*f.face*S.spd; if (NG.frame % 10 === 0) ev("ds", f.x, GY); }
      else if (fwd(f)){ f.st = "walk"; f.vx = 4.4*f.face*S.spd; }
      else if (back(f)){ f.st = "walk"; f.vx = -3.6*f.face*S.spd; }
      else { f.st = "idle"; f.vx = 0; }
    }
    return upd2(f, o);
  }
  function jump(f, h){ f.st = "jump"; f.air = true; f.bs = 0; f.vy = -18; f.vx = (h.r ? 5.5 : h.l ? -5.5 : 0)*sty(f.i).spd; ev("sn", "w"); }
  function upd2(f, o){
    // 몸 움직임
    if (f.air){ f.vy += .9; f.x += f.vx; f.y += f.vy;
      if (f.y >= GY){ f.y = GY; f.vy = 0; f.air = false; ev("ds", f.x, GY);
        if (f.st === "fall"){ f.st = "down"; f.t = 40; f.inv = 60; f.vx *= .3; ev("sn", "land"); shake = Math.max(shake, 6); }
        else if (f.st === "jump"){ f.st = "land"; f.t = 3; f.vx = 0; }
      } }
    else f.x += f.vx;
    f.x = clampN(f.x, LX, RX);
    // 서로 겹치지 않게
    const dx = o.x - f.x, ad = Math.abs(dx);
    if (ad < 66 && Math.abs(o.y - f.y) < 180 && f.st !== "down" && o.st !== "down"){ const push = (66 - ad)/2, s = Math.sign(dx) || (f.i ? 1 : -1);
      f.x -= s*push; o.x += s*push; if (f.x < LX){ o.x += LX - f.x; f.x = LX; } if (f.x > RX){ o.x -= f.x - RX; f.x = RX; } if (o.x < LX){ f.x += LX - o.x; o.x = LX; } if (o.x > RX){ f.x -= o.x - RX; o.x = RX; } }
    if (!f.air && ["idle", "walk", "crouch", "land", "run", "block"].includes(f.st) && Math.abs(o.x - f.x) > 4) f.face = Math.sign(o.x - f.x);
    if (f.ghost > 0) f.ghost--;
    if (f.dhp > f.hp) f.dhp -= f.st === "hit" || f.st === "fall" ? .05 : .6; else f.dhp = f.hp;
    f.pz = poseOf(f);
  }
  function poseOf(f){
    switch (f.st){
      case "idle": case "land": return "idle";
      case "walk": return "walk";
      case "run": return "run";
      case "crouch": return "crouch";
      case "jump": return "jump";
      case "fall": return f.y > GY - 40 && f.vy > 0 ? "down" : "hit";
      case "hit": return f.pz === "crouch" || f.pz === "cblock" ? "crouch" : "hit";
      case "block": return IN[f.i].h.d ? "cblock" : "block";
      case "down": return "down";
      case "getup": return "crouch";
      case "win": return "win";
      case "lose": return "down";
      case "atk": return f.mf < Math.min(3, f.mv.st) && !f.mv.air ? (f.mv.cr ? "crouch" : "idle") : f.mv.pz;
    }
    return "idle";
  }
  /* 화염탄·필살 */
  function projStep(){
    pr = pr.filter(p => {
      p.x += p.vx; p.y += p.vy; p.life--; if (p.ht > 0) p.ht--;
      if (p.k === "orb"){ const o = F[1 - p.o]; p.y += clampN(o.y - 150 - p.y, -1, 1); }
      if (p.k === "met" && p.y >= GY - 20){ ev("sp", p.x, GY - 20, "h", "#d0bfff"); shake = Math.max(shake, 5); return false; }
      const o = F[1 - p.o], hu = hurt(o);
      const box = p.rect ? [p.x - p.r, GY - 270*Math.min(1, (26 - p.life)/6 + .2), p.r*2, 270] : [p.x - p.r, p.y - p.r, p.r*2, p.r*2];
      if (p.ht <= 0 && ov(box, hu)){
        const last = p.nh === 1, r = hit(F[p.o], o, {dm: p.dm, hs: p.sup ? 14 : 18, bs: 12, pu: p.sup ? 2 : 6, kd: p.kd || (p.kdl && last), unb: p.unb, chip: p.chip, frz: p.frz, sup: p.sup, sf: p.sf}, p.x, p.y);
        if (r){ p.nh--; p.ht = p.hi || 99; if (p.nh <= 0) return false; }
      }
      // 화염탄끼리 부딪치면 둘 다 펑
      for (const q of pr){ if (q === p || q.o === p.o || q.dead || p.rect || q.rect || q.k === "met" || p.k === "met" || q.k === "wave" || p.k === "wave") continue;
        if (Math.abs(q.x - p.x) < p.r + q.r && Math.abs(q.y - p.y) < p.r + q.r){ ev("sp", (p.x + q.x)/2, (p.y + q.y)/2, "h", "#fff"); ev("sn", "h");
          if (p.sup && !q.sup){ q.dead = 1; } else if (q.sup && !p.sup){ p.dead = 1; } else { p.dead = 1; q.dead = 1; } } }
      if (p.dead) return false;
      return p.life > 0 && p.x > -100 && p.x < W + 100;
    });
  }
  /* 🤖 컴퓨터 */
  const ai = {t: 0, hold: null, ht: 0, plan: []};
  function aiStep(){
    const L = [{re: 26, bl: .22, aa: .1, sup: .25, ag: .45}, {re: 15, bl: .55, aa: .35, sup: .55, ag: .6}, {re: 8, bl: .82, aa: .65, sup: .85, ag: .75}][lv()];
    const me = F[1], op = F[0], I = IN[1], d = Math.abs(op.x - me.x), fk = me.face > 0 ? "r" : "l", bk = me.face > 0 ? "l" : "r", S = sty(1);
    const push = k => I.q.push({k, f: NG.frame});
    if (ai.plan.length && --ai.plan[0].t <= 0){ const x = ai.plan.shift(); if (x.k) push(x.k); if (x.h) ai.hold = x.h, ai.ht = x.ht || 10; }
    I.h = {l: 0, r: 0, u: 0, d: 0};
    if (ai.hold && ai.ht-- > 0) Object.assign(I.h, ai.hold); else ai.hold = null;
    // 막기
    const danger = (op.st === "atk" && op.mv && d < 300 && op.mf < op.mv.st + op.mv.ac) || pr.some(p => p.o === 0 && Math.abs(p.x - me.x) < 260 && Math.sign(me.x - p.x) === Math.sign(p.vx));
    if (danger && free(me) && (ai.blk ?? (ai.blk = Math.random() < L.bl))){ I.h = {l: 0, r: 0, u: 0, d: op.mv && op.mv.low ? 1 : 0}; I.h[bk] = 1; ai.plan = []; return; }
    if (!danger) ai.blk = null;
    if (op.air && d < 250 && free(me) && Math.random() < L.aa/6){ push(S.sp === "rise" ? "s" : "p"); return; }
    if (--ai.t > 0 || ai.plan.length) return;
    ai.t = L.re + Math.floor(rnd(L.re));
    if (!free(me)) return;
    const r = Math.random();
    if (me.pw >= 100 && d < 380 && r < L.sup*.5){ push("x"); return; }
    if (d > 420){
      if (S.sp === "proj" && r < .35) push("s");
      else if (r < .55) { ai.hold = {[fk]: 1}; ai.ht = 30; }
      else if (r < .7){ push(fk === "r" ? "R" : "L"); ai.plan = [{t: 3, k: fk === "r" ? "R" : "L"}, {t: 1, h: {[fk]: 1}, ht: 26}]; }
      else ai.hold = {[fk]: 1}, ai.ht = 18;
    } else if (d > 190){
      if (r < .2*L.ag) ai.plan = [{t: 1, h: {u: 1, [fk]: 1}, ht: 4}, {t: 12, k: "k"}];
      else if (r < .45) { ai.hold = {[fk]: 1}; ai.ht = 14; }
      else if (r < .6 && (S.sp === "rush" || S.sp === "grab")) push("s");
      else if (r < .75) push("k");
      else { ai.hold = {[bk]: 1}; ai.ht = 12; }
    } else {
      if (r < .35*L.ag + .1) ai.plan = [{t: 1, k: "p"}, {t: 8, k: "p"}, {t: 8, k: "k"}, {t: 10, k: lv() >= 1 ? "s" : null}];
      else if (r < .55) ai.plan = [{t: 1, h: {d: 1}, ht: 14}, {t: 2, k: "k"}];
      else if (r < .65 && S.sp === "grab") push("s");
      else if (r < .8) { ai.hold = {[bk]: 1}; ai.ht = 20; }
      else push("p");
    }
  }
  /* ---------- 캐릭터 고르기 ---------- */
  const CARD = (i) => { const c = i % 3, r = Math.floor(i/3); return {x: W/2 - 330 + c*224, y: 200 + r*196, w: 212, h: 184}; };
  function selStep(){
    pt--;
    for (const p of [0, 1]){ const I = IN[p]; const Q = I.q; I.q = [];
      if (sel.ok[p]) continue;
      Q.forEach(x => { if (sel.ok[p]) return;
        if (x.k === "L") sel.c[p] = (sel.c[p] + 5) % 6; else if (x.k === "R") sel.c[p] = (sel.c[p] + 1) % 6;
        else if (x.k === "U" || x.k === "D") sel.c[p] = (sel.c[p] + 3) % 6;
        else if (["p", "k", "s", "x"].includes(x.k)){ sel.ok[p] = 1; ev("sn", "go"); }
        if (["L", "R", "U", "D"].includes(x.k)) ev("sn", "tick"); });
    }
    if (cpu() && !sel.ok[1] && pt < 15*60 - 50){ sel.ok[1] = 1; }
    if ((sel.ok[0] && sel.ok[1]) || pt <= 0){
      F[0].s = sel.c[0]; F[1].s = sel.c[1];
      if (!net() || net() === "host"){ KF_LAST = [sel.c[0], cpu() ? KF_LAST[1] : sel.c[1]]; try { localStorage.setItem("arcade.kf", JSON.stringify(KF_LAST)); } catch(e) {} }
      startRound();
    }
  }
  /* ---------- 한 장면 ---------- */
  function step(){
    if (shake > 0) shake *= .86; if (flash > 0) flash -= .04;
    parts = parts.filter(p => { if (!p.ring && !p.star){ p.x += p.vx; p.y += p.vy; p.vy += p.dust ? -.02 : .25; p.vx *= .94; } else if (p.ring) p.r += 5; return --p.t > 0; });
    if (cb && --cb.t <= 0) cb = null;
    if (net() === "guest") return;
    if (ann && --ann.t <= 0) ann = ann.next || null;
    if (ph === "sel") return selStep();
    if (sf){ if (--sf.t <= 0) sf = null; else return; }
    if (freeze > 0){ freeze--; return; }
    if (slow > 0){ slow--; if (slow % 3) return; }
    sch = sch.filter(x => { if (--x.t <= 0){ x.fn(); return false; } return true; });
    if (ph === "intro"){ F.forEach(f => { f.pz = "idle"; }); IN.forEach(I => I.q = []); if (--pt <= 0){ ph = "fight"; ann = {s: "⚔️ 시작!", t: 50}; ev("sn", "go"); } else if (pt === 50) ann = {s: "준비…", t: 50}; return; }
    if (ph === "fight"){
      if (cpu()) aiStep();
      upd(F[0]); upd(F[1]); projStep();
      if (--tm <= 0){ tm = 0; ph = "ko"; pt = 120; winner = F[0].hp === F[1].hp ? -1 : F[0].hp > F[1].hp ? 0 : 1; ann = {s: "⏰ 시간 끝!", t: 100}; ev("sn", "ko"); }
      return;
    }
    if (ph === "ko"){
      F.forEach(f => { if (f.st === "atk" && f.mv && f.mv.air && !f.air) f.st = "idle"; if (f.st !== "fall" && f.st !== "down") { if (f.st === "atk" || f.st === "hit" || f.st === "block") { f.mf++; } } upd2Only(f); });
      projStep();
      if (--pt <= 0){
        if (winner >= 0){ F[winner].wins++; const L2 = F[1 - winner]; F[winner].st = "win"; if (L2.st !== "down"){ L2.st = "lose"; }
          ann = {s: F[1 - winner].hp <= 0 && F[winner].hp >= 100 ? "✨ 퍼펙트!" : `${winner === 1 && cpu() ? "🤖 컴퓨터" : who(noOf_(NG.sids[winner]))} 승리!`, t: 100}; }
        else ann = {s: "🤝 무승부!", t: 100};
        ph = "rend"; pt = 120; ev("sn", "go");
      }
      return;
    }
    if (ph === "rend"){
      F.forEach(f => upd2Only(f));
      if (--pt <= 0){
        const done = F.findIndex(f => f.wins >= 2), lastR = round >= 5;
        if (done >= 0 || lastR){ const w = done >= 0 ? done : F[0].hp >= F[1].hp ? 0 : 1; ph = "over";
          const txt = `${F[0].wins} : ${F[1].wins} 라운드 · ${KF_STY[F[0].s].e} vs ${KF_STY[F[1].s].e}`;
          if (net() === "host") NET.end(w, null, txt); NG.win(w, txt); return; }
        round++; startRound();
      }
    }
  }
  function upd2Only(f){
    const o = F[1 - f.i];
    if (f.air){ f.vy += .9; f.x += f.vx; f.y += f.vy; if (f.y >= GY){ f.y = GY; f.air = false; f.vy = 0; if (f.st === "fall"){ f.st = "down"; f.t = 999; ev("sn", "land"); ev("ds", f.x, GY); } else if (f.st !== "win" && f.st !== "lose") f.st = "idle"; } }
    else { f.x += f.vx; f.vx *= .85; if (["hit", "block", "atk", "land", "walk", "run", "crouch"].includes(f.st) && ph === "rend") f.st = "idle"; }
    f.x = clampN(f.x, LX, RX);
    if (f.dhp > f.hp) f.dhp -= .6;
    f.pz = poseOf(f.st === "atk" && !f.mv ? Object.assign(f, {st: "idle"}) : f);
  }
  /* ---------- 그리기 ---------- */
  let BG = null, bgK = 0, bgS = -1;
  function paintBg(t, s){
    const S = STAGE[s], g = t.createLinearGradient(0, 0, 0, GY); S.sky.forEach((c, i) => g.addColorStop(i/(S.sky.length - 1), c)); t.fillStyle = g; t.fillRect(0, 0, W, GY);
    if (s === 0){ // 노을 옥상
      t.fillStyle = "rgba(255,230,150,.9)"; t.beginPath(); t.arc(W*.72, 300, 70, 0, 7); t.fill();
      for (let i = 0; i < 22; i++){ const bw = 50 + (i*37) % 60, bh = 120 + (i*71) % 200, x = i*62 - 20; t.fillStyle = i % 2 ? "#3a2552" : "#2b1b40"; t.fillRect(x, GY - 90 - bh, bw, bh + 90);
        t.fillStyle = "rgba(255,214,120,.7)"; for (let y = GY - 80 - bh; y < GY - 100; y += 22) for (let xx = x + 8; xx < x + bw - 8; xx += 16) if ((xx*7 + y*3) % 5 < 2) t.fillRect(xx, y, 7, 10); }
      t.fillStyle = "#4a3a5e"; t.fillRect(0, GY - 70, W, 70); t.strokeStyle = "rgba(255,255,255,.35)"; t.lineWidth = 3; for (let x = 0; x < W; x += 40){ t.beginPath(); t.moveTo(x, GY - 70); t.lineTo(x, GY - 140); t.stroke(); } t.beginPath(); t.moveTo(0, GY - 140); t.lineTo(W, GY - 140); t.stroke();
    } else if (s === 1){ // 체육관
      t.fillStyle = "#b5835a"; t.fillRect(0, 0, W, 180); for (let x = 0; x < W; x += 160){ t.fillStyle = "rgba(255,255,255,.18)"; t.fillRect(x + 20, 30, 120, 90); }
      for (let r = 0; r < 4; r++){ t.fillStyle = r % 2 ? "#7a5236" : "#8a6040"; t.fillRect(0, 200 + r*70, W, 70); for (let i = 0; i < 26; i++){ const x = i*50 + (r % 2)*25, y = 220 + r*70; t.fillStyle = `hsl(${(i*53 + r*70) % 360},55%,${55 - r*5}%)`; t.beginPath(); t.arc(x, y, 14, 0, 7); t.fill(); t.fillRect(x - 15, y + 10, 30, 26); } }
      t.fillStyle = "#c92a2a"; t.fillRect(W/2 - 260, 40, 520, 76); t.fillStyle = "#fff"; t.font = `bold 46px "Jua",sans-serif`; t.textAlign = "center"; t.textBaseline = "middle"; t.fillText("🏆 우리반 격투왕 대회", W/2, 80);
    } else { // 네온 밤거리
      for (let i = 0; i < 60; i++){ t.fillStyle = "rgba(255,255,255,.7)"; t.fillRect((i*197) % W, (i*89) % 260, 2, 2); }
      for (let i = 0; i < 14; i++){ const bw = 90 + (i*29) % 70, bh = 200 + (i*53) % 220, x = i*96 - 30; t.fillStyle = "#15123a"; t.fillRect(x, GY - bh, bw, bh); }
      [["#ff4dd2", 120, 260, "떡볶이"], ["#22d3ee", 520, 220, "오락실"], ["#a3e635", 930, 280, "분식"]].forEach(([c, x, y, s2]) => { t.shadowColor = c; t.shadowBlur = 24; t.strokeStyle = c; t.lineWidth = 6; t.strokeRect(x, y, 200, 74); t.fillStyle = c; t.font = `bold 40px "Jua",sans-serif`; t.textAlign = "center"; t.textBaseline = "middle"; t.fillText(s2, x + 100, y + 38); t.shadowBlur = 0; });
    }
    const fg = t.createLinearGradient(0, GY - 20, 0, H); fg.addColorStop(0, S.floor[0]); fg.addColorStop(1, S.floor[1]); t.fillStyle = fg; t.fillRect(0, GY - 20, W, H - GY + 20);
    t.strokeStyle = "rgba(255,255,255,.12)"; t.lineWidth = 2; for (let i = -10; i <= 10; i++){ t.beginPath(); t.moveTo(W/2 + i*70, GY - 20); t.lineTo(W/2 + i*130, H); t.stroke(); }
    if (s === 2){ t.globalAlpha = .25; [["#ff4dd2", 220], ["#22d3ee", 620], ["#a3e635", 1030]].forEach(([c, x]) => { t.fillStyle = c; t.fillRect(x - 80, GY, 160, 60); }); t.globalAlpha = 1; }
  }
  function bg(g){ const k = Math.min(1.5, NG.k || 1); if (!BG || bgK !== k || bgS !== stg){ BG = document.createElement("canvas"); BG.width = Math.round(W*k); BG.height = Math.round(H*k); const c = BG.getContext("2d"); c.scale(k, k); paintBg(c, stg); bgK = k; bgS = stg; } g.drawImage(BG, 0, 0, W, H); }
  function poseArr(f){
    const fr = NG.frame + f.i*17;
    if (f.pz === "idle") return BODY.mix(PZ.idle, PZ.idle2, (Math.sin(fr*.1) + 1)/2);
    if (f.pz === "walk") return BODY.mix(PZ.w1, PZ.w2, (Math.sin(fr*.28) + 1)/2);
    return PZ[f.pz] || PZ.idle;
  }
  function drawF(g, f){
    const S = KF_STY[f.s], A = poseArr(f), T = BODY.place(A, f.x, f.y, f.face, 1);
    const fast = f.st === "atk" || f.pz === "hit";
    f.J = BODY.ease(f.J, T, fast ? .55 : .3);
    const hgt = Math.max(0, GY - f.y);
    g.fillStyle = "rgba(0,0,0,.32)"; g.beginPath(); g.ellipse(f.x, GY + 4, Math.max(26, 64 - hgt*.12), 12, 0, 0, 7); g.fill();
    if (f.pw >= 100 && ph !== "sel"){ g.save(); g.globalAlpha = .25 + Math.sin(NG.frame*.2)*.1; g.fillStyle = S.aura; g.beginPath(); g.ellipse(f.x, GY, 80, 18, 0, 0, 7); g.fill(); g.restore(); }
    if (f.ghost > 0 && f.J){ for (let k = 3; k >= 1; k--){ const off = -f.face*k*26; BODY.draw(g, f.J.map((v, i) => i % 2 ? v : v + off), S, NG.sids[f.i], {ghost: .14*(4 - k)/1.6}); } }
    const sad = f.st === "down" || f.st === "lose" || (f.st === "fall" && f.hp <= 0);
    BODY.draw(g, f.J, S, NG.sids[f.i], {flash: f.gl > 3, frz: f.frz > 0, sad});
  }
  function drawProj(g, p){
    const c = KF_STY[F[p.o].s].aura, fr = NG.frame;
    g.save(); g.globalCompositeOperation = "lighter";
    if (p.k === "fire" || p.k === "beam"){ const R = p.r;
      for (let i = 0; i < 5; i++){ g.globalAlpha = .18; g.fillStyle = "#ff6a00"; g.beginPath(); g.arc(p.x - Math.sign(p.vx)*(i*R*.45), p.y + Math.sin(fr*.5 + i)*4, R*(1 - i*.15), 0, 7); g.fill(); }
      g.globalAlpha = 1; const gr = g.createRadialGradient(p.x, p.y, 2, p.x, p.y, R); gr.addColorStop(0, "#fff"); gr.addColorStop(.35, "#ffe066"); gr.addColorStop(1, "rgba(255,90,0,0)"); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, R, 0, 7); g.fill();
      if (p.k === "beam"){ g.globalCompositeOperation = "source-over"; g.font = `${R*1.3}px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.save(); g.translate(p.x, p.y); g.scale(p.vx > 0 ? -1 : 1, 1); g.fillText("🐉", 0, 0); g.restore(); } }
    else if (p.k === "ice"){ g.translate(p.x, p.y); g.rotate(fr*.4); g.fillStyle = "#e3fafc"; g.globalAlpha = .9; for (let i = 0; i < 4; i++){ g.rotate(Math.PI/2); g.beginPath(); g.moveTo(0, 0); g.lineTo(6, -6); g.lineTo(0, -p.r); g.lineTo(-6, -6); g.closePath(); g.fill(); } g.globalAlpha = .5; g.fillStyle = "#66d9e8"; g.beginPath(); g.arc(0, 0, p.r*.6, 0, 7); g.fill(); }
    else if (p.k === "orb"){ const gr = g.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.r*1.4); gr.addColorStop(0, "#fff"); gr.addColorStop(.4, "#d0bfff"); gr.addColorStop(1, "rgba(112,72,232,0)"); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, p.r*1.4, 0, 7); g.fill();
      for (let i = 0; i < 4; i++){ const a = fr*.15 + i*Math.PI/2; g.fillStyle = "#fff"; g.fillRect(p.x + Math.cos(a)*p.r - 2, p.y + Math.sin(a)*p.r - 2, 4, 4); } }
    else if (p.k === "pil"){ const hgt = 270*Math.min(1, (26 - p.life)/6 + .2); const gr = g.createLinearGradient(0, GY - hgt, 0, GY); gr.addColorStop(0, "rgba(255,255,255,.95)"); gr.addColorStop(1, "rgba(102,217,232,.75)"); g.fillStyle = gr; g.beginPath(); g.moveTo(p.x - p.r, GY); g.lineTo(p.x - p.r*.6, GY - hgt*.7); g.lineTo(p.x, GY - hgt); g.lineTo(p.x + p.r*.6, GY - hgt*.75); g.lineTo(p.x + p.r, GY); g.closePath(); g.fill(); }
    else if (p.k === "met"){ g.strokeStyle = "rgba(208,191,255,.6)"; g.lineWidth = 14; g.lineCap = "round"; g.beginPath(); g.moveTo(p.x - p.vx*6, p.y - p.vy*6); g.lineTo(p.x, p.y); g.stroke(); g.fillStyle = "#fff"; g.beginPath(); g.arc(p.x, p.y, p.r*.7, 0, 7); g.fill(); g.globalCompositeOperation = "source-over"; g.font = `${p.r*1.6}px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("⭐", p.x, p.y); }
    else if (p.k === "wave"){ g.fillStyle = "rgba(224,169,109,.85)"; for (let i = 0; i < 4; i++){ g.beginPath(); g.moveTo(p.x - i*Math.sign(p.vx)*30 - 22, GY); g.lineTo(p.x - i*Math.sign(p.vx)*30, GY - 70 + i*14); g.lineTo(p.x - i*Math.sign(p.vx)*30 + 22, GY); g.fill(); } }
    g.restore();
  }
  function hpBar(g, i){
    const f = F[i], L = i === 0, x0 = L ? 120 : W/2 + 70, w = W/2 - 190, y = 26, h = 30, S = KF_STY[f.s];
    g.fillStyle = "rgba(10,10,25,.85)"; rrect(g, x0 - 6, y - 6, w + 12, h + 12, 10); g.fill();
    g.fillStyle = "#3b0d0d"; rrect(g, x0, y, w, h, 7); g.fill();
    const dw = w*f.dhp/100, hw = w*f.hp/100;
    g.fillStyle = "#ff6b6b"; if (L) rrect(g, x0 + w - dw, y, dw, h, 7); else rrect(g, x0, y, dw, h, 7); g.fill();
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, f.hp > 30 ? "#ffe066" : "#ff8787"); gr.addColorStop(1, f.hp > 30 ? "#f59f00" : "#e03131");
    g.fillStyle = gr; if (hw > 0){ if (L) rrect(g, x0 + w - hw, y, hw, h, 7); else rrect(g, x0, y, hw, h, 7); g.fill(); }
    g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(x0 + 4, y + 4, w - 8, 5);
    faceAt(g, NG.sids[i], L ? 62 : W - 62, 44, 40, S.ring);
    const nmx = i === 1 && cpu() ? "🤖 컴퓨터" : who(noOf_(NG.sids[i]));
    outlined(g, `${S.e} ${nmx}`, L ? x0 + w : x0, y + h + 22, 22, "#fff", undefined, L ? "right" : "left");
    for (let k = 0; k < 2; k++){ g.fillStyle = k < f.wins ? "#ffd43b" : "rgba(255,255,255,.2)"; g.beginPath(); g.arc(L ? W/2 - 70 - k*28 : W/2 + 70 + k*28, 96, 10, 0, 7); g.fill(); }
    // 필살 게이지
    const gx = L ? 30 : W - 330, gy = H - 40, gw = 300, st = Math.floor(f.pw/100), part = (f.pw % 100)/100;
    g.fillStyle = "rgba(10,10,25,.8)"; rrect(g, gx - 4, gy - 4, gw + 8, 28, 10); g.fill();
    g.fillStyle = st >= 3 ? `hsl(${NG.frame*6 % 360},90%,60%)` : "#4dabf7"; const pw = st >= 3 ? gw : gw*part; if (pw > 0){ if (L) rrect(g, gx, gy, pw, 20, 8); else rrect(g, gx + gw - pw, gy, pw, 20, 8); g.fill(); }
    outlined(g, st ? `💥 x${st}${st >= 3 ? " 최대!" : ""}` : "💥 필살 게이지", L ? gx + gw + 14 : gx - 14, gy + 10, 22, st ? "#ffe066" : "#adb5bd", undefined, L ? "left" : "right");
  }
  function drawSel(g){
    const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, "#1b1446"); gr.addColorStop(1, "#4a0f3a"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.globalAlpha = .08; g.fillStyle = "#fff"; for (let i = -10; i < 30; i++){ g.save(); g.translate(i*80 + (NG.frame % 80), 0); g.rotate(.4); g.fillRect(0, -100, 26, 1200); g.restore(); } g.globalAlpha = 1;
    outlined(g, "🔥 캐릭터를 골라요!", W/2, 70, 56, "#ffe066");
    outlined(g, two() ? "1P: A·D·W·S로 고르고 F로 결정 · 2P: 방향키로 고르고 J로 결정 · 카드를 눌러도 돼요" : "◀ ▶ 로 고르고 👊 펀치로 결정! (카드를 두 번 눌러도 돼요)", W/2, 130, 24, "#fff");
    outlined(g, `${Math.ceil(pt/60)}초 남았어요`, W/2, 612, 28, "#fff");
    KF_STY.forEach((S, i) => { const c = CARD(i);
      g.fillStyle = "rgba(255,255,255,.08)"; rrect(g, c.x, c.y, c.w, c.h, 20); g.fill();
      const cg = g.createLinearGradient(0, c.y, 0, c.y + c.h); cg.addColorStop(0, BODY.shade(S.gi, .15)); cg.addColorStop(1, BODY.shade(S.gi, -.4)); g.globalAlpha = .55; g.fillStyle = cg; rrect(g, c.x + 4, c.y + 4, c.w - 8, c.h - 8, 18); g.fill(); g.globalAlpha = 1;
      g.font = `64px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(S.e, c.x + c.w/2, c.y + 64);
      outlined(g, S.n, c.x + c.w/2, c.y + 126, 28, "#fff"); outlined(g, S.spn, c.x + c.w/2, c.y + 160, 17, "#ffe066");
      [0, 1].forEach(p => { if (sel.c[p] !== i) return; g.strokeStyle = COL[p]; g.lineWidth = sel.ok[p] ? 9 : 5; g.setLineDash(sel.ok[p] ? [] : [14, 8]); rrect(g, c.x + p*6, c.y + p*6, c.w - p*12, c.h - p*12, 20); g.stroke(); g.setLineDash([]);
        outlined(g, p === 1 && cpu() ? "🤖" : `${p + 1}P${sel.ok[p] ? " ✔" : ""}`, p ? c.x + c.w - 30 : c.x + 30, c.y + 24, 22, COL[p]); });
    });
    // 양쪽 미리 보기
    [0, 1].forEach(p => { const S = KF_STY[sel.c[p]], x = p ? W - 150 : 150, f = {i: p, s: sel.c[p], x, y: 560, face: p ? -1 : 1, pz: sel.ok[p] ? "win" : "idle", J: null, st: "idle", pw: 0, ghost: 0, gl: 0, frz: 0};
      const A = f.pz === "win" ? PZ.win : BODY.mix(PZ.idle, PZ.idle2, (Math.sin(NG.frame*.1 + p) + 1)/2);
      BODY.draw(g, BODY.place(A, x, 560, f.face, 1.1), S, NG.sids[p], {s: 1.1});
      outlined(g, `${S.e} ${S.n}`, x, 600, 26, COL[p]); outlined(g, S.d, x, 632, 16, "#dee2e6"); outlined(g, `💥 ${S.sun.replace(/!+/, "")}`, x, 660, 16, "#ffe066"); });
  }
  function draw(g){
    if (ph === "sel"){ drawSel(g); return; }
    bg(g);
    g.save(); if (shake > .5) g.translate(rnd(-shake, shake), rnd(-shake, shake)*.6);
    const order = F[0].st === "atk" ? [1, 0] : [0, 1];
    order.forEach(i => drawF(g, F[i]));
    pr.forEach(p => drawProj(g, p));
    g.save(); g.globalCompositeOperation = "lighter";
    parts.forEach(p => { const a = p.t/p.T;
      if (p.ring){ g.globalAlpha = a; g.strokeStyle = p.c; g.lineWidth = 6*a; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.stroke(); }
      else if (p.star){ g.globalAlpha = a; g.fillStyle = p.c; g.beginPath(); for (let k = 0; k < 8; k++){ const an = k/8*Math.PI*2, rr = k % 2 ? p.r*.25 : p.r; g.lineTo(p.x + Math.cos(an)*rr, p.y + Math.sin(an)*rr); } g.closePath(); g.fill(); }
      else { g.globalAlpha = a; g.fillStyle = p.c; if (p.dust){ g.globalCompositeOperation = "source-over"; g.globalAlpha = a*.5; } g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill(); if (p.dust) g.globalCompositeOperation = "lighter"; } });
    g.restore(); g.globalAlpha = 1;
    g.restore();
    // 필살 연출
    if (sf){ g.fillStyle = "rgba(0,0,0,.55)"; g.fillRect(0, 0, W, H); const f = F[sf.i]; drawF(g, f);
      const k = Math.min(1, (48 - sf.t)/10); g.save(); g.translate(W/2, 300); g.rotate(-.06); g.fillStyle = sf.c; g.globalAlpha = .85; g.fillRect(-W*k, -60, W*2*k, 120); g.globalAlpha = 1; outlined(g, sf.s, 0, 0, 70, "#fff"); g.restore(); }
    // 위 · 아래 막대
    hpBar(g, 0); hpBar(g, 1);
    g.fillStyle = "rgba(10,10,25,.9)"; rrect(g, W/2 - 50, 16, 100, 64, 14); g.fill(); outlined(g, `${Math.ceil(tm/60)}`, W/2, 50, 46, tm < 600 ? "#ff8787" : "#fff");
    outlined(g, `${round}라운드`, W/2, 96, 18, "#adb5bd");
    if (cb){ const L = cb.i === 0; g.globalAlpha = Math.min(1, cb.t/15); outlined(g, `${cb.n} 연타!`, L ? 60 : W - 60, 200, 52, "#ffa94d", undefined, L ? "left" : "right"); g.globalAlpha = 1; }
    if (flash > 0){ g.fillStyle = `rgba(255,255,255,${Math.min(.8, flash)})`; g.fillRect(0, 0, W, H); }
    if (ann){ const a = Math.min(1, ann.t/15), sz = ann.big ? 140 : 84; g.globalAlpha = a; outlined(g, ann.s, W/2, 300, sz, ann.big ? "#ff6b6b" : "#ffe066"); g.globalAlpha = 1; }
    if (ph === "intro" && round === 1){ g.fillStyle = "rgba(0,0,0,.55)"; rrect(g, W/2 - 470, 420, 940, 96, 18); g.fill();
      outlined(g, "👊 펀치 · 🦵 킥 · ✨ 기술 · 💥 필살(게이지가 차면) · ↓+🦵 다리 걸기", W/2, 450, 24, "#fff");
      outlined(g, "뒤로 누르고 있으면 막기 · 앞으로 두 번 = 달리기 · 맞히면 이어서 눌러 연타!", W/2, 488, 22, "#ffe066"); }
  }
  /* ---------- 손가락 · 키보드 ---------- */
  const K1 = {KeyA: "l", KeyD: "r", KeyW: "u", KeyS: "d", KeyF: "p", KeyG: "k", KeyH: "s", KeyT: "x"};
  const K2 = {ArrowLeft: "l", ArrowRight: "r", ArrowUp: "u", ArrowDown: "d", KeyJ: "p", KeyK: "k", KeyL: "s", KeyI: "x", Numpad1: "p", Numpad2: "k", Numpad3: "s", Numpad0: "x"};
  const KS = {KeyZ: "p", KeyX: "k", KeyC: "s", KeyV: "x", Space: "u"};
  const EDGE = {l: "L", r: "R", u: "U", d: "D"};
  function input(p, a, d, rep){
    if (net() === "guest"){
      if ("lrud".includes(a)){ held[a] = d ? 1 : 0; if (d && !rep) cnt[BK.indexOf(EDGE[a])]++; }
      else if (d && !rep) cnt[BK.indexOf(a)]++;
      return;
    }
    const I = IN[p];
    if ("lrud".includes(a)){ I.h[a] = d ? 1 : 0; if (d && !rep) I.q.push({k: EDGE[a], f: NG.frame}); }
    else if (d && !rep) I.q.push({k: a, f: NG.frame});
  }
  const self = { W, H,
    init(){ init(); cnt = [0, 0, 0, 0, 0, 0, 0, 0]; seen = cnt.slice(); held = {l: 0, r: 0, u: 0, d: 0}; Object.assign(ai, {t: 0, hold: null, ht: 0, plan: []}); },
    step, draw,
    down(x, y){
      if (ph !== "sel") return;
      const i = KF_STY.findIndex((_, k) => { const c = CARD(k); return x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h; });
      if (i < 0) return;
      let p = mine(); if (two()) p = !sel.ok[0] ? 0 : 1;
      if (net() === "guest"){ const cur = sel.c[1]; let n = (i - cur + 6) % 6; if (!n) cnt[0]++; while (n-- > 0) cnt[BK.indexOf("R")]++; return; }
      if (sel.ok[p]) return;
      if (sel.c[p] === i){ sel.ok[p] = 1; ev("sn", "go"); } else { sel.c[p] = i; ev("sn", "tick"); }
    },
    key(code, d, e){
      const rep = !!(e && e.repeat);
      if (two()){ if (K1[code]){ input(0, K1[code], d, rep); return true; } if (K2[code]){ input(1, K2[code], d, rep); return true; } return false; }
      const a = K1[code] || K2[code] || KS[code]; if (!a) return false; input(mine(), a, d, rep); return true;
    },
    hud(){ return `🔥 ${esc(who(noOf_(NG.sids[0])))} <b>${F[0].wins}</b> : <b>${F[1].wins}</b> ${cpu() ? "🤖 컴퓨터" : esc(who(noOf_(NG.sids[1])))} · 3판 2선승!${net() ? " · 🌐 다른 기기 대결" : ""}`; },
    netAd: {
      snap: () => ({ph, pt, rd: round, tm, stg, sel, an: ann, sh: Math.round(shake), fl: flash, sf, cb,
        f: F.map(f => [Math.round(f.x), Math.round(f.y), f.face, f.pz, Math.round(f.hp*10)/10, Math.round(f.dhp*10)/10, Math.round(f.pw), f.wins, f.s, f.gl, f.frz > 0 ? 1 : 0, f.ghost, f.st]),
        pr: pr.map(p => [p.k, Math.round(p.x), Math.round(p.y), p.r, p.vx, p.vy, p.o, p.life])}),
      ev: () => NQ.splice(0),
      fx(e){ e.forEach(([k, ...a]) => play(k, a)); },
      apply(d){
        if (net() !== "guest") return;
        ph = d.ph; pt = d.pt; round = d.rd; tm = d.tm; stg = d.stg; sel = d.sel; ann = d.an; shake = Math.max(shake, d.sh); flash = Math.max(flash, d.fl); sf = d.sf; cb = d.cb;
        d.f.forEach((a, i) => { const f = F[i]; [f.x, f.y, f.face, f.pz, f.hp, f.dhp, f.pw, f.wins, f.s, f.gl, f.frz, f.ghost, f.st] = a; });
        pr = d.pr.map(a => ({k: a[0], x: a[1], y: a[2], r: a[3], vx: a[4], vy: a[5], o: a[6], life: a[7]}));
      },
      mine: () => ({h: held, c: cnt}),
      put(d){ if (net() !== "host" || !d.c) return; const I = IN[1]; I.h = Object.assign({l: 0, r: 0, u: 0, d: 0}, d.h);
        BK.forEach((k, i) => { let n = Math.min(6, d.c[i] - seen[i]); seen[i] = d.c[i]; while (n-- > 0) I.q.push({k, f: NG.frame}); }); },
      end(w, sc, txt){ if (net() !== "guest" || NG.ended) return; NG.win(w, txt); },
      reset(){}
    }
  };
  return self;
};
