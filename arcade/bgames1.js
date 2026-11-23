/* =====================================================================
   🎲 보드게임 모음 ① — 🔲 점 잇기 상자 · 🚢 바다 대작전
   ===================================================================== */
const bgFx = (S, o) => { S.fx = o; S.fxN = (S.fxN || 0) + 1; };
const bgEase = t => t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3);

/* ---------------- 🔲 점 잇기 상자 (2~4명) ---------------- */
BG.def({
  id: "db", e: "🔲", n: "점 잇기 상자", like: "도트 앤 박스", time: "10분", min: 2, max: 4, col: ["#ff6b6b", "#4dabf7", "#69db7c", "#ffd43b"],
  d: "점 사이에 선을 하나씩! 네모의 마지막 선을 그은 사람이 그 칸을 차지하고 한 번 더",
  rules: ["차례마다 이웃한 두 점 사이에 <b>선 하나</b>를 그어요.", "네모의 <b>네 번째 선</b>을 그으면 그 네모는 내 땅이 되고 <b>한 번 더</b> 그어요.", "모든 선을 다 그으면 끝! 네모를 가장 많이 가진 사람이 이겨요.", "💡 세 번째 선을 그으면 친구에게 네모를 주는 거예요. 조심!"],
  setup(n){ const C = n > 2 ? 6 : 5, Rr = n > 2 ? 5 : 5; return {C, R: Rr, h: Array((Rr + 1)*C).fill(-1), v: Array(Rr*(C + 1)).fill(-1), box: Array(Rr*C).fill(-1), t: 0, n, left: (Rr + 1)*C + Rr*(C + 1)}; },
  turn: S => S.left > 0 ? S.t : -1,
  sides(S, b){ const r = Math.floor(b/S.C), c = b % S.C; return [["h", r*S.C + c], ["h", (r + 1)*S.C + c], ["v", r*(S.C + 1) + c], ["v", r*(S.C + 1) + c + 1]]; },
  cnt(S, b){ return this.sides(S, b).filter(([k, j]) => S[k][j] >= 0).length; },
  boxesOf(S, k, j){ const L = []; if (k === "h"){ const r = Math.floor(j/S.C), c = j % S.C; if (r > 0) L.push((r - 1)*S.C + c); if (r < S.R) L.push(r*S.C + c); }
    else { const r = Math.floor(j/(S.C + 1)), c = j % (S.C + 1); if (c > 0) L.push(r*S.C + c - 1); if (c < S.C) L.push(r*S.C + c); } return L; },
  act(S, p, a){ if (!a || !["h", "v"].includes(a[0]) || S[a[0]][a[1]] !== -1) return false; const [k, j] = a; S[k][j] = p; S.left--;
    const got = this.boxesOf(S, k, j).filter(b => this.cnt(S, b) === 4); got.forEach(b => S.box[b] = p);
    if (!got.length) S.t = (p + 1) % S.n; bgFx(S, {k: "line", a, got, snd: got.length ? "gold" : "pt", say: got.length ? "📦 네모를 차지! 한 번 더!" : null, k2: 40}); return true; },
  sc: (S, i) => S.box.filter(x => x === i).length,
  over(S){ if (S.left > 0) return null; const sc = Array.from({length: S.n}, (_, i) => this.sc(S, i)), m = Math.max(...sc), top = sc.map((v, i) => v === m ? i : -1).filter(i => i >= 0);
    return {w: top.length > 1 ? -1 : top[0], txt: sc.map((v, i) => `${v}칸`).join(" : "), rank: sc.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).map(x => x[1])}; },
  pinfo(S, i){ return `📦 ${this.sc(S, i)}칸`; },
  all(S){ const L = []; S.h.forEach((x, j) => { if (x < 0) L.push(["h", j]); }); S.v.forEach((x, j) => { if (x < 0) L.push(["v", j]); }); return L; },
  ai(S, p, R, X){ const L = this.all(S); if (!L.length) return null;
    const give = a => this.boxesOf(S, a[0], a[1]).some(b => this.cnt(S, b) === 2), take = a => this.boxesOf(S, a[0], a[1]).some(b => this.cnt(S, b) === 3);
    const T = L.filter(take); if (T.length && (X.lv > 0 || R() < .7)) return T[0];
    const safe = L.filter(a => !give(a)); if (safe.length && (X.lv > 0 || R() < .5)) return safe[Math.floor(R()*safe.length)];
    if (X.lv === 2){ /* 가장 적게 내주는 선 */ let best = L[0], bv = 1e9; for (const a of L){ const c = JSON.parse(JSON.stringify(S)); c[a[0]][a[1]] = p; let n = 0, more = true;
        while (more){ more = false; for (const b2 of this.all(c)) if (this.boxesOf(c, b2[0], b2[1]).some(b => this.cnt(c, b) === 3)){ c[b2[0]][b2[1]] = 9; n++; more = true; break; } } if (n < bv){ bv = n; best = a; } } return best; }
    return L[Math.floor(R()*L.length)]; },
  geo(S, A){ const cs = Math.min((A.w - 60)/S.C, (A.h - 80)/S.R); return {cs, x: A.x + (A.w - cs*S.C)/2, y: A.y + (A.h - cs*S.R)/2}; },
  draw(g, S, me, A, ui){
    const {cs, x, y} = this.geo(S, A); BGD.box(g, x - 30, y - 30, cs*S.C + 60, cs*S.R + 60, 24, "#fff9db"); g.strokeStyle = "rgba(76,110,245,.15)"; g.lineWidth = 1;
    for (let k = 0; k * 22 < cs*S.R + 60; k++){ g.beginPath(); g.moveTo(x - 30, y - 30 + k*22); g.lineTo(x + cs*S.C + 30, y - 30 + k*22); g.stroke(); }
    const fx = ui.fx && ui.fx.k === "line" ? ui.fx : null, t = fx ? Math.min(1, (ui.fxT || 0)/14) : 1;
    S.box.forEach((o, b) => { if (o < 0) return; const r = Math.floor(b/S.C), c = b % S.C; let s = 1; if (fx && fx.got.includes(b) && t < 1) s = bgEase(t);
      const bx = x + c*cs + cs/2, by = y + r*cs + cs/2; g.globalAlpha = .55; BGD.box(g, bx - cs*.44*s, by - cs*.44*s, cs*.88*s, cs*.88*s, 10, this.col[o]); g.globalAlpha = 1; if (s > .6) outlined(g, ["🍎", "🐳", "🍀", "⭐"][o], bx, by, cs*.42*s); });
    const ln = (k, j, col, w) => { let x0, y0, x1, y1; if (k === "h"){ const r = Math.floor(j/S.C), c = j % S.C; x0 = x + c*cs; y0 = y + r*cs; x1 = x0 + cs; y1 = y0; } else { const r = Math.floor(j/(S.C + 1)), c = j % (S.C + 1); x0 = x + c*cs; y0 = y + r*cs; x1 = x0; y1 = y0 + cs; }
      g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); g.moveTo(x0 + 9*(x1 > x0), y0 + 9*(y1 > y0)); g.lineTo(x1 - 9*(x1 > x0), y1 - 9*(y1 > y0)); g.stroke(); };
    S.h.forEach((o, j) => { if (o >= 0) ln("h", j, this.col[o], 9); }); S.v.forEach((o, j) => { if (o >= 0) ln("v", j, this.col[o], 9); });
    if (fx && fx.a && t < 1){ g.globalAlpha = 1 - t; ln(fx.a[0], fx.a[1], "#fff", 16); g.globalAlpha = 1; }
    if (ui.pv) ln(ui.pv[0], ui.pv[1], "rgba(0,0,0,.18)", 9);
    for (let r = 0; r <= S.R; r++) for (let c = 0; c <= S.C; c++){ g.fillStyle = "#343a40"; g.beginPath(); g.arc(x + c*cs, y + r*cs, 8, 0, 7); g.fill(); }
  },
  tap(S, me, px, py, A, ui){ const {cs, x, y} = this.geo(S, A), fx = (px - x)/cs, fy = (py - y)/cs, c = Math.floor(fx), r = Math.floor(fy), dx = fx - c, dy = fy - r;
    let best = null, bd = .35; const tryH = (rr, cc, d) => { if (rr >= 0 && rr <= S.R && cc >= 0 && cc < S.C && d < bd){ bd = d; best = ["h", rr*S.C + cc]; } }, tryV = (rr, cc, d) => { if (rr >= 0 && rr < S.R && cc >= 0 && cc <= S.C && d < bd){ bd = d; best = ["v", rr*(S.C + 1) + cc]; } };
    tryH(r, c, dy); tryH(r + 1, c, 1 - dy); tryV(r, c, dx); tryV(r, c + 1, 1 - dx);
    if (!best || S[best[0]][best[1]] >= 0) return null; ui.pv = null; return best; },
  bad: () => "이미 그은 선이에요"
});

/* ---------------- 🚢 바다 대작전 (배틀십 같은) ---------------- */
BG.def({
  id: "sea", e: "🚢", n: "바다 대작전", like: "배틀십 같은 게임", time: "10분", min: 2, max: 2, col: ["#4dabf7", "#ff922b"], hidden: true,
  d: "숨겨진 친구 배를 포탄으로 찾아 모두 가라앉혀요! 맞히면 한 번 더",
  rules: ["처음에 내 배 5척(5·4·3·3·2칸)이 바다에 놓여요. <b>🔀 다시 섞기</b>로 바꾸고 <b>✅ 준비 완료</b>를 눌러요.", "차례마다 친구 바다의 칸 하나를 눌러 포탄을 쏴요.", "💥 맞히면 <b>한 번 더</b>! 💧 빗나가면 친구 차례예요.", "친구 배를 <b>모두</b> 가라앉히면 이겨요.", "💡 맞힌 칸 옆(위·아래·왼쪽·오른쪽)을 노려요!"],
  SH: [5, 4, 3, 3, 2], Z: 9,
  place(R){ const Z = this.Z, occ = Array(Z*Z).fill(-1), ships = [];
    this.SH.forEach((len, k) => { for (let t = 0; t < 500; t++){ const hz = R() < .5, r = Math.floor(R()*(hz ? Z : Z - len + 1)), c = Math.floor(R()*(hz ? Z - len + 1 : Z)), cells = Array.from({length: len}, (_, i) => hz ? r*Z + c + i : (r + i)*Z + c);
      if (cells.every(i => occ[i] < 0)){ cells.forEach(i => occ[i] = k); ships.push(cells); break; } } });
    return ships; },
  setup(n, R){ return {ph: "set", ready: [0, 0], ships: [this.place(R), this.place(R)], shot: [Array(81).fill(0), Array(81).fill(0)], t: 0, win: -1, seed: Math.floor(R()*1e9)}; },
  turn: S => S.ph === "set" || S.win >= 0 ? -1 : S.t,
  free: (S, p, a) => S.ph === "set",
  sunk(S, p, k){ return S.ships[p][k].every(i => S.shot[1 - p][i] === 2); },
  act(S, p, a, R){
    if (S.ph === "set"){ if (a === "mix" && !S.ready[p]){ S.ships[p] = this.place(R); bgFx(S, {k: "mix", snd: "pt"}); return true; } if (a === "ok"){ S.ready[p] = 1; if (S.ready[0] && S.ready[1]){ S.ph = "go"; bgFx(S, {k: "go", say: "🚢 대작전 시작!", snd: "pt"}); } else bgFx(S, {k: "ok"}); return true; } return false; }
    const i = a; if (typeof i !== "number" || i < 0 || i > 80 || S.shot[p][i]) return false;
    const op = 1 - p, k = S.ships[op].findIndex(c => c.includes(i)); S.shot[p][i] = k >= 0 ? 2 : 1;
    if (k >= 0){ const sk = this.sunk(S, op, k); if (S.ships[op].every((_, kk) => this.sunk(S, op, kk))) S.win = p; bgFx(S, {k: "shot", i, p, hit: 1, say: sk ? `💥 ${S.ships[op][k].length}칸 배를 가라앉혔어요!` : "💥 맞았어요! 한 번 더", snd: "gold"}); }
    else { S.t = op; bgFx(S, {k: "shot", i, p, hit: 0, say: "💧 빗나갔어요", snd: "pt", k2: 30}); }
    return true; },
  over: S => S.win >= 0 ? {w: S.win, txt: "배를 모두 가라앉혔어요!"} : null,
  view(S, p){ const V = JSON.parse(JSON.stringify(S)); [0, 1].forEach(q => { if (q !== p) V.ships[q] = S.ships[q].map((c, k) => this.sunk(S, q, k) ? c : c.map(() => -1)); }); return V; },
  pinfo(S, i){ if (!S) return ""; if (S.ph === "set") return S.ready[i] ? "✅ 준비 완료" : "⏳ 배 놓는 중"; const left = S.ships[i].filter((c, k) => !c.every(x => x >= 0 && S.shot[1 - i][x] === 2)).length; return `🚢 남은 배 ${left}척`; },
  tick(S, R, X){ if (S.ph !== "set") return false; let ch = false; X.bots.forEach(b => { if (!S.ready[b]){ S.ready[b] = 1; ch = true; } }); if (ch && S.ready[0] && S.ready[1]){ S.ph = "go"; bgFx(S, {k: "go", say: "🚢 대작전 시작!"}); } return ch; },
  ai(S, p, R, X){ const sh = S.shot[p], Z = this.Z, op = 1 - p, open = [];
    for (let i = 0; i < 81; i++) if (!sh[i]) open.push(i);
    if (X.lv > 0){ const hits = []; for (let i = 0; i < 81; i++) if (sh[i] === 2 && !S.ships[op].some((c, k) => c.includes(i) && this.sunk(S, op, k))) hits.push(i);
      for (const h of hits){ const r = Math.floor(h/Z), c = h % Z; const L = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < Z && b < Z).map(([a, b]) => a*Z + b).filter(i => !sh[i]); if (L.length) return L[Math.floor(R()*L.length)]; }
      if (X.lv === 2){ const par = open.filter(i => (Math.floor(i/Z) + i % Z) % 2 === 0); if (par.length) return par[Math.floor(R()*par.length)]; } }
    return open[Math.floor(R()*open.length)]; },
  geo(A, land){ const two = A.w > A.h*1.2, cs = two ? Math.min((A.w - 60)/18, (A.h - 120)/9) : Math.min((A.w - 30)/9, (A.h - 180)/18);
    const bw = cs*9; return two ? {cs, me: {x: A.x + (A.w/2 - bw)/2, y: A.y + 50}, op: {x: A.x + A.w/2 + (A.w/2 - bw)/2, y: A.y + 50}, by: A.y + 60 + bw}
      : {cs, op: {x: A.x + (A.w - bw)/2, y: A.y + 34}, me: {x: A.x + (A.w - bw)/2, y: A.y + 74 + bw}, by: A.y + 84 + bw*2}; },
  draw(g, S, me, A, ui){
    const G = this.geo(A), cs = G.cs, op = 1 - me, Z = 9;
    const sea = (o, lab, own) => { g.save(); BGD.shadow(g, true, 16, 6); BGD.box(g, o.x - 6, o.y - 6, cs*Z + 12, cs*Z + 12, 14, BGD.lg(g, o.x, o.y, o.x, o.y + cs*Z, ["#1971c2", "#0b3d6e"])); g.restore();
      g.strokeStyle = "rgba(255,255,255,.18)"; g.lineWidth = 1; for (let k = 1; k < Z; k++){ g.beginPath(); g.moveTo(o.x + k*cs, o.y); g.lineTo(o.x + k*cs, o.y + cs*Z); g.moveTo(o.x, o.y + k*cs); g.lineTo(o.x + cs*Z, o.y + k*cs); g.stroke(); }
      outlined(g, lab, o.x + cs*Z/2, o.y - 22, 22, own ? "#a5d8ff" : "#ffc078"); };
    sea(G.op, S.ph === "set" ? "친구 바다" : S.t === me ? "🎯 여기를 눌러 쏴요!" : "친구 바다", false); sea(G.me, "내 바다", true);
    const ship = (o, cells, col, ghost) => { const rs = cells.map(i => Math.floor(i/Z)), cl = cells.map(i => i % Z), x0 = o.x + Math.min(...cl)*cs, y0 = o.y + Math.min(...rs)*cs, w = (Math.max(...cl) - Math.min(...cl) + 1)*cs, h = (Math.max(...rs) - Math.min(...rs) + 1)*cs;
      g.globalAlpha = ghost ? .55 : 1; BGD.tile(g, x0 + 4, y0 + 4, w - 8, h - 8, BGD.lg(g, x0, y0, x0 + w, y0 + h, [col, BGD.dark(col)]), null, Math.min(w, h)/2 - 2); g.globalAlpha = 1; };
    S.ships[me].forEach(c => ship(G.me, c, "#ced4da")); S.ships[op].forEach(c => { if (c[0] >= 0) ship(G.op, c, "#868e96", true); });
    const marks = (o, arr) => arr.forEach((v, i) => { if (!v) return; const cx = o.x + (i % Z + .5)*cs, cy = o.y + (Math.floor(i/Z) + .5)*cs; outlined(g, v === 2 ? "💥" : "💧", cx, cy, cs*.55); });
    marks(G.op, S.shot[me]); marks(G.me, S.shot[op]);
    const fx = ui.fx && ui.fx.k === "shot" ? ui.fx : null; if (fx && (ui.fxT || 0) < 30){ const o = fx.p === me ? G.op : G.me, cx = o.x + (fx.i % Z + .5)*cs, cy = o.y + (Math.floor(fx.i/Z) + .5)*cs, t = ui.fxT/30;
      g.strokeStyle = fx.hit ? "#ffd43b" : "#a5d8ff"; g.lineWidth = 5*(1 - t); g.beginPath(); g.arc(cx, cy, cs*(.3 + t*1.2), 0, 7); g.stroke(); }
    if (S.ph === "set" && !S.ready[me]){ const w = 220; [{id: "mix", t: "🔀 다시 섞기", x: A.x + A.w/2 - w - 10, y: G.by, w, h: 60}, {id: "ok", t: "✅ 준비 완료", x: A.x + A.w/2 + 10, y: G.by, w, h: 60, p: 1}].forEach(b => BGD.btn(g, b)); }
    else if (S.ph === "set") outlined(g, "⏳ 친구가 배를 놓는 중이에요", A.x + A.w/2, G.by + 30, 24, "#d0bfff");
  },
  tap(S, me, px, py, A){ const G = this.geo(A), cs = G.cs;
    if (S.ph === "set"){ if (py >= G.by && py <= G.by + 60) return px < A.x + A.w/2 ? "mix" : "ok"; return null; }
    const c = Math.floor((px - G.op.x)/cs), r = Math.floor((py - G.op.y)/cs); if (c < 0 || r < 0 || c > 8 || r > 8) return null; return r*9 + c; },
  bad: () => "이미 쏜 칸이에요"
});
