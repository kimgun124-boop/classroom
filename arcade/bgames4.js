/* =====================================================================
   🐾 우리반 동물 보드게임 ① (2026.11.25) — 선생님이 보여 준 인기 보드게임을 '우리 동물'로 새로 만들었어요
   🔍 동물 짝꿍 찾기(도블 같은) · 🧩 동물 퍼즐 대작전(우봉고 같은) · 🌳 동물 나무 막대 빼기(텀블링 몽키 같은) · 🐧 펭귄 얼음 깨기
   - 그림은 모두 🐾 동물 랜덤 디펜스의 동물(RDA.animal)을 그대로 써요 (저작권 있는 그림·이름은 쓰지 않아요)
   - 모두 BG 엔진: 🌐 각자 기기로 온라인 · 🤖 컴퓨터 · 🧒 한 기기
   ===================================================================== */
const BA = {
  NM: {lion: "사자", tiger: "호랑이", rabbit: "토끼", cat: "고양이", dog: "강아지", panda: "판다", penguin: "펭귄", fox: "여우", owl: "부엉이", frog: "개구리", chick: "병아리", mouse: "생쥐",
    hedgehog: "고슴도치", whale: "고래", croc: "악어", eagle: "독수리", dragon: "용", unicorn: "유니콘", parrot: "앵무새", shark: "상어", squid: "오징어", mammoth: "매머드", rhino: "코뿔소",
    trex: "티라노", phoenix: "불새", golem: "돌거인", thunder: "번개새", kirin: "기린", griffin: "그리핀", genbu: "거북", bdragon: "흑룡"},
  /* 동물 한 마리 (크기마다 한 번만 그려 두고 붙여요) */
  put(g, k, x, y, s, rot = 0, gr = 0){ const q = Math.max(12, Math.round(s/6)*6), c = G2.spr(`ba_${k}_${q}_${gr}`, q, q, t => RDA.animal(t, k, q, gr));
    if (rot){ g.save(); g.translate(x, y); g.rotate(rot); G2.put(g, c, -s/2, -s/2, s, s); g.restore(); } else G2.put(g, c, x - s/2, y - s/2, s, s); },
  fast: () => window.__bgFast ? .08 : 1,
  dist: (x, y, b) => Math.hypot(x - b.x, y - b.y)
};

/* ---------------- 🔍 동물 짝꿍 찾기 (2~4명 · 모두 동시에) ---------------- */
BG.def({
  id: "dp", e: "🔍", n: "동물 짝꿍 찾기", like: "도블 같은 게임", time: "3분", min: 2, max: 4, col: ["#ff6b6b", "#4dabf7", "#69db7c", "#ffd43b"], bg: ["#3b2a7a", "#1a1240"],
  d: "어느 두 카드든 똑같은 동물은 딱 한 마리! 먼저 찾아 누르면 가운데 카드를 가져와요",
  tag: "🆕 🐾 우리 동물 · 🌐 모두 동시에 2~4명",
  rules: ["카드마다 동물이 6마리 있어요. <b>어느 두 카드를 골라도 똑같은 동물은 꼭 한 마리</b>예요.", "<b>내 카드</b>와 <b>가운데 카드</b>에 똑같이 있는 동물을 찾아 <b>눌러요</b>. 모두 동시에 해요!", "가장 먼저 맞힌 친구가 가운데 카드를 가져와요. 그 카드가 새 <b>내 카드</b>가 돼요.", "틀리면 <b>❄️ 잠깐 얼음</b>! 조금 쉬었다가 다시 눌러요.", "카드 더미가 다 떨어지면 끝! 카드를 가장 많이 모은 친구가 이겨요.", "💡 동물이 돌아가 있고 크기도 달라요. 색깔과 귀 모양을 잘 봐요!"],
  AN: ["lion", "tiger", "rabbit", "cat", "dog", "panda", "penguin", "fox", "owl", "frog", "chick", "mouse", "hedgehog", "whale", "croc", "eagle", "dragon", "unicorn", "parrot", "shark", "squid", "mammoth", "rhino", "trex", "phoenix", "golem", "thunder", "kirin", "griffin", "genbu", "bdragon"],
  cards(){ if (this._C) return this._C; const p = 5, C = [];   // 🔢 유한 사영평면(5차): 카드 31장 · 동물 31종 · 카드마다 6마리 · 두 카드는 꼭 한 마리만 같아요
    for (let m = 0; m < p; m++) for (let b = 0; b < p; b++){ const L = []; for (let x = 0; x < p; x++) L.push(x*p + (m*x + b) % p); L.push(p*p + m); C.push(L); }
    for (let c = 0; c < p; c++){ const L = []; for (let y = 0; y < p; y++) L.push(c*p + y); L.push(p*p + p); C.push(L); }
    const L = []; for (let m = 0; m <= p; m++) L.push(p*p + m); C.push(L);
    return this._C = C; },
  same(a, b){ const B = this.cards()[b]; return this.cards()[a].find(s => B.includes(s)); },
  /* 카드 위 동물 자리 (카드 번호 + 판마다 다른 소금으로 정해져서 모든 기기에서 똑같아요) */
  spots(c, salt){ const R = BG.rng(c*7919 + salt*13 + 1), S = BG.shuffle(this.cards()[c].slice(), R), a0 = R()*7, out = [];
    S.forEach((s, i) => { if (i === 0) out.push({s, u: 0, v: 0, z: .5 + R()*.08, r: (R() - .5)*1.2}); else { const a = a0 + (i - 1)*2*Math.PI/5 + (R() - .5)*.35, d = .58 + R()*.06; out.push({s, u: Math.cos(a)*d, v: Math.sin(a)*d, z: .34 + R()*.14, r: (R() - .5)*1.6}); } });
    return out; },
  setup(n, R){ const dk = BG.shuffle(Array.from({length: 31}, (_, i) => i), R), my = Array.from({length: n}, () => dk.pop());
    return {n, my, ctr: dk.pop(), dk, cnt: Array(n).fill(0), frz: Array(n).fill(0), gt: 0, salt: Math.floor(R()*9999), done: 0, last: null}; },
  turn: () => -1,
  free: (S, p, a) => !!a && a.k === "tap" && !S.done,
  act(S, p, a, R, X){
    if (a.k !== "tap" || S.done || a.c !== S.ctr || S.gt < S.frz[p]) return false;
    const s = this.same(S.my[p], S.ctr);
    if (a.s !== s){ S.frz[p] = S.gt + Math.round(75*BA.fast()); bgFx(S, {k: "miss", p, say: `❄️ ${X.name(p)} 얼음!`, c: "#a5d8ff", dur: 35, snd: "bad"}); return true; }
    S.my[p] = S.ctr; S.cnt[p]++; S.last = {p, s, c: S.ctr};
    if (S.dk.length) S.ctr = S.dk.pop(); else { S.ctr = -1; S.done = 1; }
    bgFx(S, {k: "take", p, s, say: `⚡ ${X.name(p)} 찾았다! ${BA.NM[this.AN[s]] || ""}`, snd: "gold"}); return true; },
  bad: (S, p, a) => a.c !== S.ctr ? "앗, 한 발 늦었어요!" : "❄️ 얼음! 조금만 기다려요",
  tick(S, R, X){ S.gt++; if (S.done) return false; let ch = false;
    S.frz.forEach(f => { if (f === S.gt) ch = true; });   // 얼음이 풀리면 친구 기기에도 알려요
    S.bt = S.bt || {};
    for (const b of X.bots){ const B = S.bt[b];
      if (!B || B.c !== S.ctr){ const D = [[260, 420], [160, 270], [95, 165]][X.lv] || [160, 270]; S.bt[b] = {c: S.ctr, at: S.gt + Math.round((D[0] + R()*(D[1] - D[0]))*BA.fast())}; continue; }
      if (S.gt >= B.at && S.gt >= S.frz[b]){ const ok = this.same(S.my[b], S.ctr), s = X.lv === 0 && R() < .15 ? this.cards()[S.ctr][Math.floor(R()*6)] : ok; B.at = S.gt + 120;
        if (this.act(S, b, {k: "tap", s, c: S.ctr}, R, X)) return true; } }
    return ch; },
  over(S){ if (!S.done) return null; const rank = S.cnt.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).map(x => x[1]), m = S.cnt[rank[0]];
    return {w: S.cnt.filter(v => v === m).length > 1 ? -1 : rank[0], rank, txt: S.cnt.map(v => `${v}장`).join(" : ")}; },
  pinfo: (S, i) => S ? `🃏 ${S.cnt[i]}장${S.frz[i] > S.gt ? " ❄️" : ""}` : "",
  view: S => Object.assign({}, S, {dk: S.dk.map(() => 0), bt: null}),
  card(g, S, c, x, y, r, col, hl, ui, mine){
    g.save(); BGD.shadow(g, true, r*.18, r*.05); g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = BGD.lg(g, x, y - r, x, y + r, ["#ffffff", "#e9ecef"]); g.fill(); g.restore();
    g.lineWidth = Math.max(3, r*.06); g.strokeStyle = col; g.beginPath(); g.arc(x, y, r - g.lineWidth/2, 0, 7); g.stroke();
    if (c < 0) return;
    this.spots(c, S.salt).forEach(o => { const sx = x + o.u*r, sy = y + o.v*r, sz = o.z*r*1.18;
      if (hl === o.s){ g.save(); g.shadowColor = "#ffe066"; g.shadowBlur = r*.25; g.fillStyle = "rgba(255,224,102,.55)"; g.beginPath(); g.arc(sx, sy, sz*.55, 0, 7); g.fill(); g.restore(); }
      BA.put(g, this.AN[o.s], sx, sy, sz, o.r);
      if (ui && mine) ui.sym.push({x: sx, y: sy, r: sz*.5, s: o.s}); });
  },
  draw(g, S, me, A, ui, X){
    BGD.felt(g, A.x + 6, A.y + 6, A.w - 12, A.h - 12, 30, "#5f3dc4");
    ui.sym = []; const land = A.w > A.h, others = Array.from({length: S.n}, (_, i) => i).filter(i => i !== me);
    let C, M, R1, ro = 48;
    if (land){ R1 = Math.min(A.h*.37, A.w*.215); C = {x: A.x + A.w*.29, y: A.y + A.h*.56}; M = {x: A.x + A.w*.71, y: A.y + A.h*.56}; }
    else { R1 = Math.min(A.w*.32, A.h*.2); C = {x: A.x + A.w/2, y: A.y + A.h*.34}; M = {x: A.x + A.w/2, y: A.y + A.h*.77}; ro = 42; }
    const tk = ui.fx && ui.fx.k === "take" && (ui.fxT || 0) < 70 ? ui.fx : null;
    others.forEach((q, k) => { const ox = land ? A.x + A.w/2 + (k - (others.length - 1)/2)*(ro*2 + 30) : A.x + 70 + k*(ro*2 + 26), oy = land ? A.y + ro + 16 : A.y + ro + 14;
      this.card(g, S, S.my[q], ox, oy, ro, this.col[q], tk && tk.p === q ? tk.s : -1);
      outlined(g, `${X.name(q).slice(0, 6)} ${S.frz[q] > S.gt ? "❄️" : ""}`, ox, oy + ro + 14, 16, this.col[q]); });
    if (S.ctr >= 0){ this.card(g, S, S.ctr, C.x, C.y, R1, "#ffd43b", -1, ui, true); outlined(g, `가운데 카드 · 남은 ${S.dk.length}장`, C.x, C.y - R1 - 18, 20, "#ffe066"); }
    else outlined(g, "🏁 카드가 다 떨어졌어요!", C.x, C.y, 30, "#ffe066");
    this.card(g, S, S.my[me], M.x, M.y, R1, this.col[me], tk && tk.p === me ? tk.s : -1, ui, true);
    outlined(g, `내 카드 · 모은 카드 ${S.cnt[me]}장`, M.x, M.y - R1 - 18, 20, this.col[me]);
    if (S.frz[me] > S.gt){ g.fillStyle = "rgba(165,216,255,.55)"; g.beginPath(); g.arc(M.x, M.y, R1, 0, 7); g.fill(); g.fillStyle = "rgba(165,216,255,.55)"; g.beginPath(); g.arc(C.x, C.y, R1, 0, 7); g.fill(); outlined(g, "❄️ 얼음!", M.x, M.y, R1*.3, "#fff"); }
    if (!S.done && S.gt < 240) outlined(g, "👀 두 카드에 똑같이 있는 동물을 눌러요!", A.x + A.w/2, A.y + A.h - 22, 22, "#fff");
  },
  live: (S, ui) => !!(ui.fx && (ui.fxT || 0) < 72),
  tap(S, me, px, py, A, ui){ let best = null, bd = 1e9; (ui.sym || []).forEach(o => { const d = BA.dist(px, py, o); if (d < o.r*1.15 && d < bd){ bd = d; best = o; } });
    return best ? {k: "tap", s: best.s, c: S.ctr} : null; }
});

/* ---------------- 🧩 동물 퍼즐 대작전 (2~4명 · 모두 동시에) ---------------- */
const BA_PZ = {I3: [[0, 0], [1, 0], [2, 0]], L3: [[0, 0], [0, 1], [1, 1]], I4: [[0, 0], [1, 0], [2, 0], [3, 0]], O4: [[0, 0], [1, 0], [0, 1], [1, 1]], T4: [[0, 0], [1, 0], [2, 0], [1, 1]],
  L4: [[0, 0], [0, 1], [0, 2], [1, 2]], S4: [[1, 0], [2, 0], [0, 1], [1, 1]], P5: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]], V5: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]]};
const BA_PC = {I3: ["#ff8787", "chick"], L3: ["#ffd43b", "mouse"], I4: ["#74c0fc", "penguin"], O4: ["#b197fc", "panda"], T4: ["#63e6be", "frog"], L4: ["#ffa94d", "fox"], S4: ["#f783ac", "rabbit"], P5: ["#a9e34b", "owl"], V5: ["#66d9e8", "whale"]};
BG.def({
  id: "ub", e: "🧩", n: "동물 퍼즐 대작전", like: "우봉고 같은 게임", time: "6분", min: 2, max: 4, col: ["#ff6b6b", "#4dabf7", "#69db7c", "#ffd43b"], bg: ["#0b4f5c", "#062a33"],
  d: "동물 조각으로 빈 집 모양을 꽉 채워요! 모두 같은 퍼즐을 동시에 풀고 빨리 끝낼수록 보석이 많아요",
  tag: "🆕 🐾 우리 동물 · 🌐 모두 동시에 2~4명",
  rules: ["모두 <b>같은 퍼즐</b>을 동시에 풀어요. 아래(옆) 조각을 모두 써서 <b>빈 집 모양을 빈틈없이</b> 채워요.", "조각을 <b>눌러 고르고</b> 집 위를 누르거나, 조각을 <b>끌어다 놓아요</b>.", "<b>🔄 돌리기</b>·<b>↔️ 뒤집기</b>로 조각 모양을 바꿔요. 놓은 조각을 다시 누르면 빼요.", "먼저 완성할수록 💎 보석을 많이 받아요 (1등 3개 · 2등 2개 · 그다음 1개).", "모두 5판! 보석이 가장 많은 친구가 이겨요."],
  T(cells, t){ let C = cells.map(([x, y]) => [t & 4 ? -x : x, y]); for (let r = 0; r < (t & 3); r++) C = C.map(([x, y]) => [-y, x]);
    const mx = Math.min(...C.map(c => c[0])), my = Math.min(...C.map(c => c[1])); return C.map(([x, y]) => [x - mx, y - my]); },
  K: [3, 3, 4, 4, 4],
  gen(R, k){
    const TY = Object.keys(BA_PZ), GW = k > 3 ? 6 : 5, GH = k > 3 ? 5 : 4;
    for (let tr = 0; tr < 400; tr++){
      const pcs = BG.shuffle(TY.slice(), R).slice(0, k), occ = new Map(), sol = []; let ok = true;
      for (let i = 0; i < k && ok; i++){ const C = []; const t0 = Math.floor(R()*8);
        for (let t = 0; t < 8; t++){ const P = this.T(BA_PZ[pcs[i]], (t0 + t) % 8), w = Math.max(...P.map(c => c[0])) + 1, h = Math.max(...P.map(c => c[1])) + 1;
          for (let y = 0; y + h <= GH; y++) for (let x = 0; x + w <= GW; x++){ const cs = P.map(([u, v]) => [x + u, y + v]); if (cs.some(([u, v]) => occ.has(u + "," + v))) continue;
            let tch = 0; cs.forEach(([u, v]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { if (occ.has((u + dx) + "," + (v + dy))) tch++; }));
            if (i && !tch) continue; C.push({t: (t0 + t) % 8, x, y, cs, s: tch + R()*2.5}); } }
        if (!C.length){ ok = false; break; } C.sort((a, b) => b.s - a.s); const c = C[Math.floor(R()*Math.min(3, C.length))];
        c.cs.forEach(([u, v]) => occ.set(u + "," + v, i)); sol.push({t: c.t, x: c.x, y: c.y}); }
      if (!ok) continue;
      const cells = [...occ.keys()].map(s => s.split(",").map(Number)), mx = Math.min(...cells.map(c => c[0])), my = Math.min(...cells.map(c => c[1]));
      /* 너무 길쭉한 모양은 다시 */
      const w = Math.max(...cells.map(c => c[0])) - mx + 1, h = Math.max(...cells.map(c => c[1])) - my + 1; if (w > GW || h > GH) continue;
      return {cells: cells.map(([x, y]) => [x - mx, y - my]), w, h, pcs, o0: pcs.map(() => Math.floor(R()*8)), sol: sol.map(s => ({t: s.t, x: s.x - mx, y: s.y - my}))};
    }
    return {cells: [[0, 0], [1, 0], [2, 0]], w: 3, h: 1, pcs: ["I3"], o0: [0], sol: [{t: 0, x: 0, y: 0}]};
  },
  newRound(S, R, X){ const k = this.K[S.rd] || 4, P = this.gen(R, k); S.sol = P.sol; delete P.sol; S.pz = P; S.ph = "play"; S.ord = []; S.t = (k > 3 ? 75 : 55)*60;
    S.pl = Array.from({length: S.n}, () => ({pc: P.pcs.map(() => null), done: 0}));
    S.bt = {}; (X.bots || []).forEach(b => { const D = [[38, 55], [24, 38], [14, 24]][X.lv] || [24, 38]; S.bt[b] = S.gt + Math.round((D[0] + R()*(D[1] - D[0]))*(k/4)*60*BA.fast()); }); },
  setup(n, R, X){ const S = {n, rd: 0, gem: Array(n).fill(0), gt: 0, ph: "play", win: -1}; this.newRound(S, R, X); return S; },
  turn: () => -1,
  free: (S, p, a) => S.ph === "play" && !S.pl[p].done,
  cov(S, p, skip){ const m = new Map(); S.pl[p].pc.forEach((q, i) => { if (q && i !== skip) this.T(BA_PZ[S.pz.pcs[i]], q.t).forEach(([u, v]) => m.set((q.x + u) + "," + (q.y + v), i)); }); return m; },
  act(S, p, a, R, X){
    if (S.ph !== "play" || S.pl[p].done) return false;
    if (a.k === "take"){ if (!S.pl[p].pc[a.i]) return false; S.pl[p].pc[a.i] = null; return true; }
    if (a.k !== "put" || !(a.i >= 0 && a.i < S.pz.pcs.length)) return false;
    const shape = new Set(S.pz.cells.map(c => c.join(","))), m = this.cov(S, p, a.i), cs = this.T(BA_PZ[S.pz.pcs[a.i]], a.t & 7).map(([u, v]) => (a.x + u) + "," + (a.y + v));
    if (cs.some(c => !shape.has(c) || m.has(c))) return false;
    S.pl[p].pc[a.i] = {t: a.t & 7, x: a.x, y: a.y};
    if (m.size + cs.length === S.pz.cells.length) this.finish(S, p, X); else bgFx(S, {k: "put", p, snd: "pt"});
    return true; },
  bad: () => "그 자리에는 들어가지 않아요",
  finish(S, p, X){ S.pl[p].done = 1; S.ord.push(p); const g = [3, 2, 1, 1][S.ord.length - 1]; S.gem[p] += g; bgFx(S, {k: "done", p, say: `💎 ${X.name(p)} 완성! 보석 ${g}개`, snd: "gold"}); },
  tick(S, R, X){ S.gt++;
    if (S.ph === "play"){ S.t--;
      for (const b of X.bots || []) if (!S.pl[b].done && S.bt[b] && S.gt >= S.bt[b]){ S.pl[b].pc = S.sol.map(s => ({t: s.t, x: s.x, y: s.y})); this.finish(S, b, X); return true; }
      if (S.t <= 0 || S.pl.every(q => q.done)){ S.ph = "res"; S.rt = Math.round(200*BA.fast()); S.show = S.sol; bgFx(S, {k: "res", say: S.ord.length ? `🏁 ${S.rd + 1}판 끝!` : "⏰ 시간 끝! 정답을 봐요", snd: "pt"}); return true; }
      return S.t % 60 === 0; }
    if (S.ph === "res" && --S.rt <= 0){ S.show = null; S.rd++; if (S.rd >= this.K.length){ S.ph = "end"; const m = Math.max(...S.gem), tops = S.gem.map((v, i) => v === m ? i : -1).filter(i => i >= 0); S.win = tops.length > 1 ? 99 : tops[0]; } else this.newRound(S, R, X); return true; }
    return false; },
  over(S){ if (S.ph !== "end") return null; const rank = S.gem.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).map(x => x[1]); return {w: S.win === 99 ? -1 : S.win, rank, txt: S.gem.map(v => `💎${v}`).join(" : ")}; },
  pinfo(S, i){ if (!S || !S.pl) return ""; const q = S.pl[i]; return `💎 ${S.gem[i]} · ${q.done ? "✅ 완성" : `🧩 ${q.pc.filter(Boolean).length}/${S.pz.pcs.length}`}`; },
  view: S => Object.assign({}, S, {sol: null, bt: null}),
  geo(S, A){ const land = A.w > A.h, bw = land ? A.w*.6 : A.w, bh = land ? A.h - 70 : A.h*.52, cs = Math.min(84, (bw - 40)/(S.pz.w + .5), (bh - 40)/(S.pz.h + .5));
    const B = {x: A.x + (bw - cs*S.pz.w)/2, y: A.y + 60 + (bh - cs*S.pz.h)/2, cs};
    const T = land ? {x: A.x + bw + 6, y: A.y + 50, w: A.w - bw - 12, h: A.h - 140} : {x: A.x + 6, y: A.y + bh + 70, w: A.w - 12, h: A.h - bh - 160};
    const BT = land ? [{id: "rot", t: "🔄 돌리기", x: T.x, y: A.y + A.h - 80, w: T.w/2 - 5, h: 66}, {id: "flip", t: "↔️ 뒤집기", x: T.x + T.w/2 + 5, y: A.y + A.h - 80, w: T.w/2 - 5, h: 66}]
      : [{id: "rot", t: "🔄 돌리기", x: A.x + 10, y: A.y + A.h - 82, w: A.w/2 - 15, h: 70}, {id: "flip", t: "↔️ 뒤집기", x: A.x + A.w/2 + 5, y: A.y + A.h - 82, w: A.w/2 - 15, h: 70}];
    return {B, T, BT, land}; },
  piece(g, type, t, x, y, cs, alpha = 1, glow){ const [col, an] = BA_PC[type], P = this.T(BA_PZ[type], t);
    g.save(); g.globalAlpha = alpha; if (glow){ g.shadowColor = "#ffe066"; g.shadowBlur = 16; }
    P.forEach(([u, v]) => { BGD.tile(g, x + u*cs + 1, y + v*cs + 1, cs - 2, cs - 2, BGD.lg(g, 0, y + v*cs, 0, y + (v + 1)*cs, [col, BGD.dark(col)]), "rgba(0,0,0,.3)", Math.max(4, cs*.18)); });
    g.restore(); const [u, v] = P[Math.floor(P.length/2)]; g.save(); g.globalAlpha = alpha; BA.put(g, an, x + (u + .5)*cs, y + (v + .5)*cs, cs*.92); g.restore(); },
  draw(g, S, me, A, ui, X){
    BGD.felt(g, A.x + 6, A.y + 6, A.w - 12, A.h - 12, 30, "#0c8599");
    const Gm = this.geo(S, A), B = Gm.B, cs = B.cs, my = S.pl[me]; ui.G = Gm; ui.o = ui.o && ui.o.rd === S.rd && ui.o.gt0 === S.pz.o0.join() ? ui.o : {rd: S.rd, gt0: S.pz.o0.join(), t: S.pz.o0.slice()};
    outlined(g, `🧩 ${S.rd + 1} / ${this.K.length}판 · ⏰ ${Math.max(0, Math.ceil(S.t/60))}`, A.x + 20, A.y + 30, 24, S.t < 600 ? "#ff8787" : "#fff", undefined, "left");
    /* 🏠 빈 집 모양 */
    BA.put(g, "lion", B.x - cs*.55, B.y - cs*.35, cs*.9);
    S.pz.cells.forEach(([u, v]) => { BGD.box(g, B.x + u*cs + 2, B.y + v*cs + 2, cs - 4, cs - 4, 8, "rgba(255,248,220,.92)", "#a87332", 3); });
    const show = S.ph === "res" && S.show ? S.show.map(s => s) : null;
    if (show) show.forEach((s, i) => this.piece(g, S.pz.pcs[i], s.t, B.x + s.x*cs, B.y + s.y*cs, cs, .9));
    else my.pc.forEach((q, i) => { if (q) this.piece(g, S.pz.pcs[i], q.t, B.x + q.x*cs, B.y + q.y*cs, cs, 1); });
    if (my.done && S.ph === "play"){ outlined(g, `✅ 완성! ${S.ord.indexOf(me) + 1}등`, B.x + cs*S.pz.w/2, B.y - 26, 30, "#ffe066"); }
    /* 🧺 내 조각 */
    const T = Gm.T, n = S.pz.pcs.length, cols = Gm.land ? 2 : n, cw = T.w/cols, chh = Gm.land ? T.h/Math.ceil(n/cols) : T.h;
    ui.tray = [];
    if (!show) S.pz.pcs.forEach((ty, i) => { const cx = T.x + (i % cols)*cw, cy = T.y + Math.floor(i/cols)*chh; ui.tray.push({x: cx, y: cy, w: cw, h: chh, i});
      const used = !!my.pc[i], sel = ui.sel === i && !used; BGD.box(g, cx + 4, cy + 4, cw - 8, chh - 8, 14, sel ? "rgba(255,224,102,.25)" : "rgba(0,0,0,.18)", sel ? "#ffe066" : "rgba(255,255,255,.15)", sel ? 3 : 2);
      if (used){ outlined(g, "✔ 놓았어요", cx + cw/2, cy + chh/2, 17, "#c5f6fa"); return; }
      const P = this.T(BA_PZ[ty], ui.o.t[i]), w = Math.max(...P.map(c => c[0])) + 1, h = Math.max(...P.map(c => c[1])) + 1, q = Math.min((cw - 24)/Math.max(w, 2.5), (chh - 24)/Math.max(h, 2.5), cs*.85);
      if (!(ui.drag && ui.sel === i)) this.piece(g, ty, ui.o.t[i], cx + (cw - w*q)/2, cy + (chh - h*q)/2, q, 1, sel); });
    if (!show && !my.done) Gm.BT.forEach(b => BGD.btn(g, Object.assign({}, b, {off: ui.sel == null})));
    if (ui.drag && ui.sel != null && !my.pc[ui.sel] && ui.gx != null){ const P = this.T(BA_PZ[S.pz.pcs[ui.sel]], ui.o.t[ui.sel]), w = Math.max(...P.map(c => c[0])) + 1, h = Math.max(...P.map(c => c[1])) + 1;
      this.piece(g, S.pz.pcs[ui.sel], ui.o.t[ui.sel], ui.gx - w*cs/2, ui.gy - h*cs/2, cs, .8, true); }
    if (show) outlined(g, "💡 이렇게 채울 수 있어요", B.x + cs*S.pz.w/2, B.y + cs*S.pz.h + 30, 22, "#ffe066");
    else if (!my.done && S.t > (this.K[S.rd] > 3 ? 70 : 50)*60) outlined(g, "조각을 골라 집 위에 놓아요", A.x + A.w/2, A.y + A.h - 22, 20, "#c5f6fa");
  },
  live: (S, ui) => !!(ui.drag || (ui.fx && (ui.fxT || 0) < 40)),
  at(S, ui, px, py){ const B = ui.G.B, P = this.T(BA_PZ[S.pz.pcs[ui.sel]], ui.o.t[ui.sel]), w = Math.max(...P.map(c => c[0])) + 1, h = Math.max(...P.map(c => c[1])) + 1;
    return {x: Math.round((px - B.x)/B.cs - w/2), y: Math.round((py - B.y)/B.cs - h/2)}; },
  onBoard(S, ui, px, py){ const B = ui.G.B; return px >= B.x - B.cs && px <= B.x + B.cs*(S.pz.w + 1) && py >= B.y - B.cs && py <= B.y + B.cs*(S.pz.h + 1); },
  tap(S, me, px, py, A, ui, can){
    if (!ui.G || S.ph !== "play") return null; const my = S.pl[me]; if (my.done) return null;
    for (const b of ui.G.BT) if (BGD.hit(b, px, py)){ if (ui.sel == null) return null; const t = ui.o.t[ui.sel]; ui.o.t[ui.sel] = b.id === "rot" ? (t & 4) | ((t + 1) & 3) : t ^ 4; return null; }
    for (const b of ui.tray || []) if (BGD.hit(b, px, py)){ if (my.pc[b.i]) return null; ui.sel = b.i; ui.drag = true; ui.gx = null; return null; }
    /* 놓은 조각 누르면 빼요 */
    const B = ui.G.B, cx = Math.floor((px - B.x)/B.cs), cy = Math.floor((py - B.y)/B.cs), m = this.cov(S, me, -1), hit = m.get(cx + "," + cy);
    if (hit != null){ ui.sel = hit; ui.o.t[hit] = my.pc[hit].t; return {k: "take", i: hit}; }
    if (ui.sel != null && !my.pc[ui.sel] && this.onBoard(S, ui, px, py)){ const q = this.at(S, ui, px, py); return {k: "put", i: ui.sel, t: ui.o.t[ui.sel], x: q.x, y: q.y}; }
    return null; },
  drag(S, me, x, y, A, ui){ if (ui.drag){ ui.gx = x; ui.gy = y; } },
  drop(S, me, px, py, A, ui){ const was = ui.drag && ui.gx != null; ui.drag = false; const gx = ui.gx; ui.gx = null;
    if (!was || ui.sel == null || !ui.G || S.pl[me].pc[ui.sel] || gx == null) return null;
    if (this.onBoard(S, ui, px, py)){ const q = this.at(S, ui, px, py); return {k: "put", i: ui.sel, t: ui.o.t[ui.sel], x: q.x, y: q.y}; }
    return null; },
  key(S, me, code, ui){ if (ui.sel == null || !ui.o) return null; const t = ui.o.t[ui.sel]; if (code === "KeyR") ui.o.t[ui.sel] = (t & 4) | ((t + 1) & 3); if (code === "KeyF") ui.o.t[ui.sel] = t ^ 4; return null; }
});

/* ---------------- 🌳 동물 나무 막대 빼기 (2~4명) ---------------- */
BG.def({
  id: "tm", e: "🌳", n: "동물 나무 막대 빼기", like: "텀블링 몽키 같은 게임", time: "8분", min: 2, max: 4, col: ["#ff6b6b", "#4dabf7", "#69db7c", "#ffd43b"], bg: ["#74c0fc", "#d0ebff"],
  d: "주사위 색깔 막대를 하나씩 쏙! 동물 친구가 떨어지면 내가 받아요. 적게 받은 친구가 승리",
  tag: "🆕 🐾 우리 동물 · 🌐 온라인 2~4명",
  rules: ["나무에 색깔 막대가 꽂혀 있고, 그 위에 동물 친구들이 앉아 있어요.", "차례가 되면 <b>🎲 주사위</b>를 굴려요. 나온 <b>색깔 막대 하나</b>를 골라 빼요. ⭐가 나오면 아무 색이나 골라요.", "막대를 빼서 <b>떨어진 동물</b>은 내가 받아요. (밑에 다른 막대가 있으면 거기에 걸려요!)", "막대가 다 빠지거나 동물이 모두 떨어지면 끝! <b>동물을 가장 적게 받은</b> 친구가 이겨요.", "💡 동물이 많이 앉은 막대는 조심! 아래에 받쳐 줄 막대가 있는지 잘 봐요."],
  C: ["#fa5252", "#fcc419", "#339af0"], CN: ["빨강", "노랑", "파랑"],
  AN: ["chick", "mouse", "rabbit", "cat", "dog", "panda", "fox", "frog", "owl", "hedgehog", "penguin", "tiger", "lion", "parrot"],
  setup(n, R){
    /* 막대는 모두 나무줄기(가운데)를 지나요 · 왼쪽·오른쪽 길이가 제각각이라 가장자리 동물은 떨어지기 쉬워요 */
    const st = []; for (let i = 0; i < 15; i++){ const y = 2.3 + i*(6.4/14) + (R() - .5)*.1, L = R() < .5; st.push({id: i, y, a: L ? .5 + R()*1.6 : 2 + R()*2.4, b: L ? 5.6 + R()*2.4 : 8 + R()*1.5, c: i % 3, on: 1}); }
    const cols = BG.shuffle(st.map(s => s.c), R); st.forEach((s, i) => s.c = cols[i]);
    const S = {n, st, cr: [], t: 0, ph: "roll", die: -1, got: Array(n).fill(0), win: -1};
    for (let k = 0; k < 14; k++){ for (let tr = 0; tr < 40; tr++){ const c = {a: this.AN[k], x: .9 + R()*8.2, y: 1.9 + (k % 7)*.85 + R()*.3, on: -1, by: -1}; this.land(S, c); if (c.on >= 0 && !S.cr.some(o => o.on === c.on && Math.abs(o.x - c.x) < .75)){ S.cr.push(c); break; } } }
    return S; },
  land(S, c){ let best = null; S.st.forEach(s => { if (s.on && s.y > c.y + .01 && c.x >= s.a - .2 && c.x <= s.b + .2 && (!best || s.y < best.y)) best = s; });
    if (best){ c.y = best.y; c.on = best.id; } else { c.on = -1; c.y = 10.4; } },
  sim(S, i){ return S.cr.filter(c => c.on === i).reduce((n, c) => { const cc = {x: c.x, y: c.y}; const T = {st: S.st.map(s => s.id === i ? Object.assign({}, s, {on: 0}) : s)}; this.land(T, cc); return n + (cc.on < 0 ? 1 : 0); }, 0); },
  turn: S => S.win >= 0 ? -1 : S.t,
  ok(S, i){ const s = S.st[i]; if (!s || !s.on || S.ph !== "pull") return false; if (S.die === 3) return true; if (!S.st.some(o => o.on && o.c === S.die)) return true; return s.c === S.die; },
  act(S, p, a, R, X){
    if (a.k === "roll"){ if (S.ph !== "roll") return false; S.die = Math.floor(R()*4); if (S.die < 3 && !S.st.some(o => o.on && o.c === S.die)) S.die = 3; S.ph = "pull";
      bgFx(S, {k: "roll", say: S.die === 3 ? "⭐ 아무 색이나 골라요!" : `🎲 ${this.CN[S.die]} 막대!`, c: S.die === 3 ? "#ffe066" : this.C[S.die], snd: "pt"}); return true; }
    if (a.k === "pull"){ if (!this.ok(S, a.i)) return false; S.st[a.i].on = 0; let f = 0;
      S.cr.forEach(c => { if (c.on === a.i){ this.land(S, c); if (c.on < 0){ c.by = p; f++; } } }); S.got[p] += f;
      bgFx(S, {k: "pull", i: a.i, say: f ? `😱 ${X.name(p)} 동물 ${f}마리 받았어요!` : "😮‍💨 휴~ 아무도 안 떨어졌어요", c: f ? "#ff8787" : "#69db7c", snd: f ? "bad" : "pt"});
      if (!S.st.some(s => s.on) || !S.cr.some(c => c.on >= 0)){ const m = Math.min(...S.got), tops = S.got.map((v, i) => v === m ? i : -1).filter(i => i >= 0); S.win = tops.length > 1 ? 99 : tops[0]; }
      else { S.t = (S.t + 1) % S.n; S.ph = "roll"; S.die = -1; }
      return true; }
    return false; },
  bad: S => S.ph === "roll" ? "먼저 🎲 주사위를 굴려요" : "주사위 색깔 막대를 골라요",
  aiDelay: 800,
  ai(S, p, R, X){ if (S.ph === "roll") return {k: "roll"};
    const C = S.st.filter(s => this.ok(S, s.id)).map(s => ({i: s.id, f: this.sim(S, s.id), r: R()})); if (!C.length) return null;
    if (X.lv === 0 || (X.lv === 1 && R() < .3)) return {k: "pull", i: C[Math.floor(R()*C.length)].i};
    C.sort((a, b) => a.f - b.f || a.r - b.r); return {k: "pull", i: C[0].i}; },
  over(S){ if (S.win < 0) return null; const rank = S.got.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]).map(x => x[1]); return {w: S.win === 99 ? -1 : S.win, rank, txt: S.got.map(v => `🙈${v}`).join(" : ")}; },
  pinfo: (S, i) => S ? `🙈 받은 동물 ${S.got[i]}` : "",
  geo(A){ const land = A.w > A.h, u = land ? Math.min((A.w - 280)/10.4, (A.h - 20)/11) : Math.min((A.w - 20)/10.4, (A.h - 200)/11); return {u, ox: A.x + (land ? (A.w - 260 - 10*u)/2 : (A.w - 10*u)/2), oy: A.y + 10, land}; },
  draw(g, S, me, A, ui, X){
    const Q = this.geo(A), u = Q.u, X0 = Q.ox, Y0 = Q.oy, px = x => X0 + x*u, py = y => Y0 + y*u;
    BGD.box(g, A.x + 6, A.y + 6, A.w - 12, A.h - 12, 30, BGD.lg(g, 0, A.y, 0, A.y + A.h, ["#a5d8ff", "#e7f5ff"]));
    g.fillStyle = "#8ce99a"; g.fillRect(A.x + 6, py(10.2), A.w - 12, A.y + A.h - 6 - py(10.2)); g.fillStyle = "#69db7c"; g.fillRect(A.x + 6, py(10.2), A.w - 12, 8);
    /* 🌳 나무 */
    [[5, .9, 1.6], [3.7, 1.4, 1.2], [6.3, 1.4, 1.2], [5, 1.8, 1.4]].forEach(([x, y, r]) => { BGD.disc(g, px(x), py(y), r*u, "#40c057", "#b2f2bb"); });
    g.save(); BGD.shadow(g, true, 14, 4); BGD.box(g, px(4.45), py(1.6), u*1.1, py(10.3) - py(1.6), u*.4, BGD.lg(g, px(4.45), 0, px(5.55), 0, ["#a0522d", "#8b4513", "#6b3410"])); g.restore();
    g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = 2; for (let k = 0; k < 9; k++){ g.beginPath(); g.moveTo(px(4.6 + (k % 3)*.3), py(2 + k*.9)); g.lineTo(px(4.6 + (k % 3)*.3), py(2.5 + k*.9)); g.stroke(); }
    /* 🪵 막대 */
    const can = S.t === me && S.ph === "pull" && S.win < 0; ui.st = [];
    const pf = ui.fx && ui.fx.k === "pull" && (ui.fxT || 0) < 30 ? ui.fx : null;
    S.st.forEach(s => { if (!s.on && !(pf && pf.i === s.id)) return; const ok = can && this.ok(S, s.id), x0 = px(s.a), x1 = px(s.b), y = py(s.y) + u*.13, hh = u*.26;
      g.save(); if (pf && pf.i === s.id){ const k = (ui.fxT || 0)/30; g.globalAlpha = 1 - k; g.translate((k*4*u)*(s.a + s.b > 10 ? 1 : -1), 0); }
      if (ok){ g.shadowColor = "#fff"; g.shadowBlur = 16; }
      BGD.box(g, x0, y - hh/2, x1 - x0, hh, hh/2, BGD.lg(g, 0, y - hh/2, 0, y + hh/2, ["#fff", this.C[s.c], BGD.dark(this.C[s.c])]), "rgba(0,0,0,.35)", 2); g.restore();
      if (s.on) ui.st.push({i: s.id, x0, x1, y, ok}); });
    /* 🐾 동물 (떨어지는 모습은 부드럽게) */
    ui.cy = ui.cy || {};
    S.cr.forEach((c, k) => { const ty = c.on >= 0 ? c.y : 10.3, cur = ui.cy[k] == null ? ty : ui.cy[k], ny = cur + Math.min(.35, Math.max(-.35, ty - cur)); ui.cy[k] = Math.abs(ty - ny) < .02 ? ty : ny;
      const dx = c.on >= 0 ? c.x : c.x*.8 + 1, sz = u*1.05; g.save(); if (c.on < 0 && ui.cy[k] >= 10.3){ g.globalAlpha = .9; }
      BA.put(g, c.a, px(dx), py(ui.cy[k]) - sz*.42, sz, c.on < 0 ? (k % 2 ? .5 : -.5) : 0); g.restore();
      if (c.on < 0 && c.by >= 0 && ui.cy[k] >= 10.3){ g.fillStyle = this.col[c.by]; g.beginPath(); g.arc(px(dx) + sz*.3, py(ui.cy[k]) - sz*.75, 7, 0, 7); g.fill(); } });
    /* 🎲 주사위 · 안내 */
    const dx = Q.land ? A.x + A.w - 130 : A.x + A.w/2, dy = Q.land ? A.y + A.h*.42 : A.y + A.h - 92, ds = 96;
    g.save(); BGD.shadow(g, true, 14, 5); BGD.box(g, dx - ds/2, dy - ds/2, ds, ds, 20, "#fff", "#495057", 3); g.restore();
    if (S.die >= 0 && S.die < 3){ BGD.disc(g, dx, dy, ds*.32, this.C[S.die]); } else if (S.die === 3) outlined(g, "⭐", dx, dy, ds*.55); else outlined(g, "🎲", dx, dy, ds*.5);
    ui.roll = null;
    if (S.t === me && S.win < 0){ if (S.ph === "roll"){ ui.roll = {x: dx - 110, y: dy + ds/2 + 14, w: 220, h: 64, t: "🎲 굴리기", p: 1}; if (!Q.land) ui.roll = {x: dx + ds/2 + 20, y: dy - 32, w: 200, h: 64, t: "🎲 굴리기", p: 1}; BGD.btn(g, ui.roll); }
      else outlined(g, S.die === 3 ? "아무 막대나 골라요" : `${this.CN[S.die]} 막대를 골라요`, Q.land ? dx : dx + ds/2 + 120, Q.land ? dy + ds/2 + 40 : dy, 20, "#1c3d5a", "rgba(255,255,255,.85)"); }
  },
  live(S, ui){ if (ui.fx && (ui.fxT || 0) < 32) return true; const C = ui.cy || {}; return S.cr.some((c, k) => C[k] != null && Math.abs(C[k] - (c.on >= 0 ? c.y : 10.3)) > .01); },
  tap(S, me, px, py, A, ui){ if (ui.roll && BGD.hit(ui.roll, px, py)) return {k: "roll"};
    if (S.ph === "roll" && Math.hypot(px - (this.geo(A).land ? A.x + A.w - 130 : A.x + A.w/2), py - (this.geo(A).land ? A.y + A.h*.42 : A.y + A.h - 92)) < 60) return {k: "roll"};
    let best = null, bd = 1e9; (ui.st || []).forEach(s => { const cx = Math.max(s.x0, Math.min(s.x1, px)), d = Math.hypot(px - cx, py - s.y); if (d < 26 && d < bd){ bd = d; best = s; } });
    return best ? {k: "pull", i: best.i} : null; }
});

/* ---------------- 🐧 펭귄 얼음 깨기 (2~4명) ---------------- */
BG.def({
  id: "pg", e: "🐧", n: "펭귄 얼음 깨기", like: "펭귄 얼음깨기 같은 게임", time: "6분", min: 2, max: 4, col: ["#ff6b6b", "#4dabf7", "#69db7c", "#ffd43b"], bg: ["#1864ab", "#0b2d55"],
  d: "얼음을 하나씩 톡! 펭귄을 떨어뜨리는 친구가 져요. 3판 동안 가장 적게 떨어뜨린 친구가 승리",
  tag: "🆕 🐾 우리 동물 · 🌐 온라인 2~4명",
  rules: ["차례마다 <b>얼음 한 칸</b>을 눌러 깨요. 가운데 펭귄이 앉은 얼음은 깰 수 없어요.", "얼음은 <b>옆 얼음 두 개</b>가 잡아 줘야 버텨요. 벽에 닿은 면은 벽이 한 개로 잡아 줘요.", "잡아 주는 게 하나뿐이면 와르르 떨어져요! 그 바람에 <b>펭귄이 떨어지면</b> 그 친구가 한 번 진 거예요.", "모두 3판! <b>펭귄을 가장 적게 떨어뜨린</b> 친구가 이겨요.", "💡 펭귄 주변 얼음은 끝까지 아껴 둬요!"],
  N: 7, P: 24,
  fresh(){ return Array(49).fill(1); },
  sup(b, i){ const N = this.N, x = i % N, y = (i/N) | 0; let s = 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= N || Y >= N) s++; else if (b[Y*N + X]) s++; }); return s; },
  crash(b){ const f = []; let ch = true; while (ch){ ch = false; for (let i = 0; i < 49; i++) if (b[i] && this.sup(b, i) < 2){ b[i] = 0; f.push(i); ch = true; } } return f; },
  hitSim(b, i){ const c = b.slice(); c[i] = 0; const f = this.crash(c); return {c, f, drop: !c[this.P]}; },
  setup(n, R){ return {n, b: this.fresh(), t: Math.floor(R()*n), rd: 0, drop: Array(n).fill(0), ph: "play", ft: 0, win: -1, lost: -1}; },
  turn: S => S.ph === "play" ? S.t : -1,
  act(S, p, a, R, X){
    if (a.k !== "hit" || S.ph !== "play" || a.i === this.P || !S.b[a.i]) return false;
    const r = this.hitSim(S.b, a.i); S.b = r.c; S.fall = [a.i].concat(r.f);
    if (r.drop){ S.drop[p]++; S.lost = p; S.ph = "fall"; S.ft = Math.round(150*BA.fast()); bgFx(S, {k: "drop", say: `💦 펭귄이 풍덩! ${X.name(p)}`, c: "#a5d8ff", snd: "bad"}); }
    else { S.t = (S.t + 1) % S.n; bgFx(S, {k: "hit", say: r.f.length ? `🧊 와르르 ${r.f.length + 1}칸!` : null, snd: "pt"}); }
    return true; },
  tick(S){ if (S.ph !== "fall") return false; if (--S.ft > 0) return false;
    S.rd++; if (S.rd >= 3){ S.ph = "end"; const m = Math.min(...S.drop), tops = S.drop.map((v, i) => v === m ? i : -1).filter(i => i >= 0); S.win = tops.length > 1 ? 99 : tops[0]; return true; }
    S.b = this.fresh(); S.fall = null; S.ph = "play"; S.t = S.lost; bgFx(S, {k: "new", say: `🧊 ${S.rd + 1}판! 새 얼음판`, snd: "pt"}); return true; },
  bad: () => "깰 수 있는 얼음을 눌러요",
  aiDelay: 750,
  ai(S, p, R, X){ const L = []; for (let i = 0; i < 49; i++) if (S.b[i] && i !== this.P) L.push(i);
    const safe = L.filter(i => !this.hitSim(S.b, i).drop); if (!safe.length) return {k: "hit", i: L[Math.floor(R()*L.length)]};
    if (X.lv === 0){ const pool = R() < .12 ? L : safe; return {k: "hit", i: pool[Math.floor(R()*pool.length)]}; }
    if (X.lv === 1) return {k: "hit", i: safe[Math.floor(R()*safe.length)]};
    /* 어려움: 상대에게 안전한 수가 가장 적게 남도록 (짝수 남기기) */
    let best = null, bs = 1e9; safe.forEach(i => { const c = this.hitSim(S.b, i).c, rest = []; for (let j = 0; j < 49; j++) if (c[j] && j !== this.P) rest.push(j); const s2 = rest.filter(j => !this.hitSim(c, j).drop).length, sc = (s2 === 0 ? -100 : s2 % 2 === 0 ? -10 : 0) + s2*.1 + R()*.05; if (sc < bs){ bs = sc; best = i; } });
    return {k: "hit", i: best}; },
  over(S){ if (S.ph !== "end") return null; const rank = S.drop.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]).map(x => x[1]); return {w: S.win === 99 ? -1 : S.win, rank, txt: S.drop.map(v => `💦${v}`).join(" : ")}; },
  pinfo: (S, i) => S ? `💦 떨어뜨림 ${S.drop[i]}` : "",
  draw(g, S, me, A, ui, X){
    BGD.box(g, A.x + 6, A.y + 6, A.w - 12, A.h - 12, 30, BGD.lg(g, 0, A.y, 0, A.y + A.h, ["#1971c2", "#0b3d74"]));
    const N = this.N, cs = Math.min((A.w - 120)/N, (A.h - 150)/N, 92), bx = A.x + (A.w - cs*N)/2, by = A.y + 70 + (A.h - 110 - cs*N)/2, dep = cs*.22;
    ui.cell = {bx, by, cs};
    outlined(g, `🧊 ${Math.min(3, S.rd + 1)} / 3판`, A.x + 24, A.y + 34, 24, "#fff", undefined, "left");
    /* 🧱 얼음 틀 */
    g.save(); BGD.shadow(g, true, 20, 8); BGD.box(g, bx - 22, by - 22, cs*N + 44, cs*N + 44 + dep, 22, BGD.lg(g, bx, by, bx + cs*N, by + cs*N, ["#4dabf7", "#1c7ed6"]), "#e7f5ff", 4); g.restore();
    BGD.box(g, bx - 4, by - 4, cs*N + 8, cs*N + 8 + dep, 10, "rgba(5,30,60,.85)");
    const my = S.t === me && S.ph === "play", fx = ui.fx, ft = (ui.fxT || 0), fall = S.fall && fx && (fx.k === "hit" || fx.k === "drop") && ft < 40 ? S.fall : [];
    ui.safe = ui.safe && ui.safe.k === S.b.join("") ? ui.safe : {k: S.b.join(""), s: null};
    for (let i = 0; i < 49; i++){ const x = bx + (i % N)*cs, y = by + ((i/N) | 0)*cs;
      if (!S.b[i]){ if (fall.includes(i)){ const k = ft/40; g.save(); g.globalAlpha = 1 - k; this.ice(g, x + cs*k*.2, y + k*cs*1.4, cs*(1 - k*.4), dep, i === this.P); g.restore(); } continue; }
      this.ice(g, x, y, cs, dep, i === this.P, my && ui.hov === i); }
    /* 🐧 펭귄 */
    const P = this.P, pxx = bx + (P % N + .5)*cs, pyy = by + ((P/N | 0) + .5)*cs;
    if (S.b[P]) BA.put(g, "penguin", pxx, pyy - cs*.35, cs*1.25);
    else { const k = Math.min(1, ft/50); g.save(); g.globalAlpha = 1 - k*.6; BA.put(g, "penguin", pxx, pyy - cs*.35 + k*cs*2.5, cs*1.25*(1 - k*.3), k*2); g.restore(); outlined(g, "💦 풍덩!", pxx, pyy + cs*2.2, 40, "#e7f5ff"); }
    if (S.ph === "play" && S.t === me) outlined(g, "깰 얼음을 눌러요 · 펭귄을 지켜요!", A.x + A.w/2, A.y + A.h - 26, 22, "#ffe066");
  },
  ice(g, x, y, cs, dep, pen, hov){ const p = 2;
    BGD.box(g, x + p, y + p + dep*.6, cs - p*2, cs - p*2, 8, "#5c9fd6");
    BGD.box(g, x + p, y + p, cs - p*2, cs - p*2, 8, BGD.lg(g, x, y, x + cs, y + cs, pen ? ["#fff9db", "#ffe066"] : hov ? ["#ffffff", "#d0ebff"] : ["#f1f8ff", "#a5d8ff"]), "rgba(255,255,255,.8)", 2);
    g.fillStyle = "rgba(255,255,255,.6)"; g.beginPath(); g.moveTo(x + cs*.2, y + cs*.25); g.lineTo(x + cs*.45, y + cs*.18); g.lineTo(x + cs*.25, y + cs*.4); g.closePath(); g.fill(); },
  live: (S, ui) => !!(ui.fx && (ui.fxT || 0) < 52),
  tap(S, me, px, py, A, ui){ const C = ui.cell; if (!C) return null; const cx = Math.floor((px - C.bx)/C.cs), cy = Math.floor((py - C.by)/C.cs); if (cx < 0 || cy < 0 || cx >= this.N || cy >= this.N) return null;
    const i = cy*this.N + cx; if (!S.b[i] || i === this.P) return null; return {k: "hit", i}; }
});
