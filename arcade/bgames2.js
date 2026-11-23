
/* ---------------- 🔢 숫자 암호 (다빈치 코드 같은) ---------------- */
BG.def({
  id: "dv", e: "🔢", n: "숫자 암호", like: "다빈치 코드 같은 게임", time: "10분", min: 2, max: 4, col: ["#ff8787", "#74c0fc", "#8ce99a", "#ffd43b"], hidden: true,
  d: "친구가 숨긴 숫자 타일을 추리해서 맞혀요! 내 타일이 모두 들키면 탈락",
  rules: ["검은 타일·흰 타일에 0~11 숫자가 있어요. 내 타일은 <b>작은 수부터 큰 수</b> 순서로 놓여요(같은 수는 검은 타일이 왼쪽).", "차례가 되면 <b>⚫ 또는 ⚪ 더미</b>에서 타일 1장을 가져와요(나만 보여요).", "친구의 숨은 타일 하나를 누르고 <b>숫자</b>를 골라 맞혀요. 맞으면 그 타일이 뒤집히고, <b>더 맞히거나 멈출</b> 수 있어요.", "틀리면 방금 가져온 내 타일이 모두에게 공개돼요.", "타일이 모두 공개되면 탈락! 마지막까지 남으면 이겨요.", "💡 순서 규칙을 이용해요. 옆에 공개된 숫자가 큰 힌트예요!"],
  setup(n, R){ const pool = []; for (let v = 0; v < 12; v++){ pool.push({v, c: 0}); pool.push({v, c: 1}); } BG.shuffle(pool, R);
    const k = n > 3 ? 3 : 4, hands = Array.from({length: n}, () => []);
    for (let i = 0; i < n; i++) for (let j = 0; j < k; j++) this.ins(hands[i], Object.assign(pool.pop(), {o: 0}));
    return {n, h: hands, pool: [pool.filter(t => t.c === 0), pool.filter(t => t.c === 1)], t: 0, ph: "draw", nw: -1, out: [], win: -1, log: ""}; },
  key: t => t.v*2 + t.c,
  ins(h, t){ let i = 0; while (i < h.length && this.key(h[i]) < this.key(t)) i++; h.splice(i, 0, t); return i; },
  alive(S, p){ return S.h[p].some(t => !t.o); },
  turn: S => S.win >= 0 ? -1 : S.t,
  nextP(S){ let q = S.t; for (let k = 0; k < S.n; k++){ q = (q + 1) % S.n; if (this.alive(S, q)) break; } S.t = q; S.ph = "draw"; S.nw = -1; },
  act(S, p, a){
    if (a.k === "draw"){ if (S.ph !== "draw") return false; const P = S.pool[a.c] && S.pool[a.c].length ? S.pool[a.c] : S.pool[1 - a.c];
      if (!P.length){ S.ph = "guess"; S.nw = -1; return true; } const t = Object.assign(P.pop(), {o: 0, nw: 1}); S.h[p].forEach(x => delete x.nw); S.nw = this.ins(S.h[p], t); S.ph = "guess"; bgFx(S, {k: "draw", snd: "pt"}); return true; }
    if (a.k === "stop"){ if (S.ph !== "more") return false; S.h[p].forEach(x => delete x.nw); this.nextP(S); bgFx(S, {k: "stop", say: "멈췄어요"}); return true; }
    if (a.k === "guess"){ if (S.ph !== "guess" && S.ph !== "more") return false; const q = a.p, T = S.h[q] && S.h[q][a.i]; if (q === p || !T || T.o || !this.alive(S, q)) return false;
      if (T.v === a.v){ T.o = 1; let say = `⭕ 맞았어요! ${T.c ? "⚪" : "⚫"}${T.v}`;
        if (!this.alive(S, q)){ S.out.push(q); say = `💥 탈락! ${say}`; }
        const left = Array.from({length: S.n}, (_, i) => i).filter(i => this.alive(S, i)); if (left.length === 1){ S.win = left[0]; bgFx(S, {k: "ok", say, snd: "gold"}); return true; }
        S.ph = "more"; bgFx(S, {k: "ok", q, i: a.i, say, snd: "gold"}); return true; }
      let i = S.h[p].findIndex(x => x.nw); if (i < 0) i = S.h[p].findIndex(x => !x.o); if (i >= 0) S.h[p][i].o = 1;
      S.h[p].forEach(x => delete x.nw);
      if (!this.alive(S, p)) S.out.push(p);
      const left = Array.from({length: S.n}, (_, i) => i).filter(i => this.alive(S, i)); if (left.length === 1){ S.win = left[0]; bgFx(S, {k: "no", say: "❌ 틀렸어요!", snd: "bad"}); return true; }
      this.nextP(S); bgFx(S, {k: "no", say: `❌ ${a.v}이(가) 아니에요!`, snd: "bad"}); return true; }
    return false; },
  over(S){ if (S.win < 0) return null; return {w: S.win, rank: [S.win].concat(S.out.slice().reverse()), txt: "끝까지 암호를 지켰어요!"}; },
  view(S, p){ const V = JSON.parse(JSON.stringify(S)); V.h.forEach((h, q) => { if (q !== p) h.forEach(t => { if (!t.o){ t.v = -1; delete t.nw; } }); }); V.pool = V.pool.map(P => P.map(() => ({c: 0}))); return V; },
  pinfo(S, i){ if (!S) return ""; const h = S.h[i]; return this.alive(S, i) ? `🔒 숨은 ${h.filter(t => !t.o).length} / ${h.length}` : "💥 탈락"; },
  cands(V, p, q, i){ const h = V.h[q], T = h[i], seen = new Set();
    V.h.forEach((hh, qq) => hh.forEach(t => { if (t.v >= 0 && (t.o || qq === p)) seen.add(this.key(t)); }));
    let lo = -1, hi = 99; for (let j = i - 1; j >= 0; j--) if (h[j].v >= 0){ lo = this.key(h[j]); break; } for (let j = i + 1; j < h.length; j++) if (h[j].v >= 0){ hi = this.key(h[j]); break; }
    const L = []; for (let v = 0; v < 12; v++){ const k = v*2 + T.c; if (k > lo && k < hi && !seen.has(k)) L.push(v); } return L; },
  ai(S, p, R, X){ const V = this.view(S, p);
    if (V.ph === "draw") return {k: "draw", c: R() < .5 ? 0 : 1};
    let best = null, bn = 99; for (let q = 0; q < V.n; q++){ if (q === p || !this.alive(S, q)) continue; V.h[q].forEach((t, i) => { if (t.o) return; const C = this.cands(V, p, q, i); if (C.length && C.length < bn){ bn = C.length; best = {q, i, C}; } }); }
    if (V.ph === "more" && (!best || bn > (X.lv === 2 ? 2 : 1) || (X.lv === 0 && R() < .5))) return {k: "stop"};
    if (!best) return V.ph === "more" ? {k: "stop"} : null;
    const C = X.lv === 0 ? Array.from({length: 12}, (_, v) => v) : best.C; return {k: "guess", p: best.q, i: best.i, v: C[Math.floor(R()*C.length)]}; },
  geo(S, A, me){ const rows = S.n, rh = Math.min(150, (A.h - 210)/rows); return {rh, top: A.y + 10}; },
  tileDraw(g, t, x, y, w, h, mine, hl){ const blk = t.c === 0; g.save(); if (hl){ BGD.shadow(g, true, 18, 0, "#ffe066"); }
    BGD.tile(g, x, y, w, h, blk ? BGD.lg(g, x, y, x, y + h, ["#495057", "#212529"]) : BGD.lg(g, x, y, x, y + h, ["#ffffff", "#dee2e6"]), hl ? "#ffe066" : null, 10); g.restore();
    const show = t.v >= 0 && (t.o || mine); if (show) outlined(g, String(t.v), x + w/2, y + h/2 + 2, h*.5, blk ? "#fff" : "#212529", blk ? "rgba(0,0,0,.6)" : "rgba(255,255,255,.7)"); else outlined(g, "?", x + w/2, y + h/2, h*.42, blk ? "#868e96" : "#adb5bd");
    if (t.o){ g.fillStyle = "rgba(255,80,80,.85)"; g.beginPath(); g.arc(x + w - 10, y + 10, 7, 0, 7); g.fill(); }
    if (mine && t.nw){ outlined(g, "NEW", x + w/2, y - 10, 14, "#ffe066"); } },
  rowsOf(S, me){ const L = []; for (let k = 1; k < S.n; k++) L.push((me + k) % S.n); L.push(me); return L; },
  draw(g, S, me, A, ui, X){
    ui.hit = {}; const {rh, top} = this.geo(S, A, me), order = this.rowsOf(S, me);
    order.forEach((q, ri) => { const h = S.h[q], y = top + ri*rh + (q === me ? 16 : 0), tw = Math.min(70, (A.w - 140)/Math.max(6, h.length) - 8), th = Math.min(rh - 34, tw*1.4), x0 = A.x + 130;
      BGD.box(g, A.x, y, A.w, th + 26, 16, q === S.t ? "rgba(255,212,59,.12)" : "rgba(255,255,255,.05)", q === me ? "#4dabf7" : null);
      outlined(g, q === me ? "나" : X.name(q).slice(0, 6), A.x + 64, y + (th + 26)/2, 20, this.col[q]);
      if (!this.alive(S, q)) outlined(g, "💥 탈락", A.x + 64, y + (th + 26)/2 + 22, 15, "#ffa8a8");
      h.forEach((t, i) => { const x = x0 + i*(tw + 8), hl = ui.sel && ui.sel.q === q && ui.sel.i === i; this.tileDraw(g, t, x, y + 13, tw, th, q === me, hl);
        (ui.hit = ui.hit || {})[q + ":" + i] = {x, y: y + 13, w: tw, h: th}; }); });
    const by = top + S.n*rh + 26, myTurn = S.t === me && S.win < 0;
    const pc = [S.pool[0].length, S.pool[1].length];
    ui.pb = [0, 1].map(c => ({x: A.x + 20 + c*150, y: by, w: 136, h: 70, t: `${c ? "⚪" : "⚫"} 더미 ${pc[c]}`, p: myTurn && S.ph === "draw", off: !myTurn || S.ph !== "draw" || (!pc[0] && !pc[1])}));
    ui.pb.forEach(b => BGD.btn(g, b));
    if (myTurn && S.ph === "draw") outlined(g, "👈 더미를 눌러 타일을 가져와요", A.x + 520, by + 35, 22, "#ffe066");
    if (myTurn && (S.ph === "guess" || S.ph === "more")){
      if (!ui.sel) outlined(g, S.ph === "more" ? "또 맞히려면 친구 타일을 눌러요" : "🔍 친구의 숨은 타일을 눌러요", A.x + 520, by + 20, 21, "#ffe066");
      if (S.ph === "more"){ ui.sb = {x: A.x + A.w - 200, y: by, w: 180, h: 70, t: "✋ 멈추기", p: 1, c: "#20c997"}; BGD.btn(g, ui.sb); } else ui.sb = null;
      if (ui.sel){ const nw = Math.min(56, (A.w - 340)/12 - 4); ui.nb = Array.from({length: 12}, (_, v) => ({x: A.x + 320 + v*(nw + 4), y: by + 6, w: nw, h: 58, t: String(v), v}));
        const C = new Set(this.cands(S, me, ui.sel.q, ui.sel.i)); ui.nb.forEach(b => BGD.btn(g, Object.assign({}, b, {p: C.has(b.v), c: "#7950f2"}))); }
    } else { ui.nb = null; ui.sb = null; }
  },
  tap(S, me, px, py, A, ui){
    if (ui.pb) for (const b of ui.pb) if (BGD.hit(b, px, py) && !b.off) return {k: "draw", c: b === ui.pb[0] ? 0 : 1};
    if (ui.sb && BGD.hit(ui.sb, px, py)) return {k: "stop"};
    if (ui.nb && ui.sel) for (const b of ui.nb) if (BGD.hit(b, px, py)){ const s = ui.sel; ui.sel = null; return {k: "guess", p: s.q, i: s.i, v: b.v}; }
    if (ui.hit) for (const k in ui.hit){ const [q, i] = k.split(":").map(Number); if (q !== me && BGD.hit(ui.hit[k], px, py)){ const t = S.h[q][i]; if (t && !t.o) ui.sel = {q, i}; return null; } }
    return null; },
  bad: (S, p, a) => a.k === "guess" ? "그 타일은 고를 수 없어요" : "지금은 할 수 없어요"
});

/* ---------------- 🍓 과일 종치기 (할리갈리 같은 · 실시간) ---------------- */
BG.def({
  id: "hg", e: "🍓", n: "과일 종치기", like: "할리갈리 같은 게임", time: "3분", min: 2, max: 4, col: ["#ff6b6b", "#ffd43b", "#69db7c", "#b197fc"],
  d: "같은 과일이 딱 5개가 되면 종을 땡! 빠른 눈과 손이 이겨요",
  rules: ["차례가 되면 <b>내 카드 더미</b>를 눌러 한 장을 뒤집어요.", "보이는 맨 위 카드들에서 <b>같은 과일이 모두 합쳐 딱 5개</b>가 되면 누구든 가운데 <b>🔔 종</b>을 눌러요!", "가장 먼저 친 친구가 보이는 카드를 <b>모두</b> 가져가요.", "5개가 아닌데 치면 친구들에게 카드를 1장씩 줘요.", "3분이 지나거나 한 명만 남으면 끝! 카드를 가장 많이 가진 친구가 이겨요."],
  F: ["🍓", "🍌", "🍇", "🍋"],
  setup(n, R){ const D = []; for (let f = 0; f < 4; f++) [[1, 5], [2, 3], [3, 3], [4, 2], [5, 1]].forEach(([k, c]) => { for (let j = 0; j < c; j++) D.push({f, k}); }); BG.shuffle(D, R);
    const dk = Array.from({length: n}, () => []); D.forEach((c, i) => dk[i % n].push(c));
    return {n, dk, up: Array.from({length: n}, () => []), t: 0, left: 180, end: 0, cool: 0, win: -1, ring: -1, gt: 0}; },
  turn: S => S.win >= 0 ? -1 : S.t,
  free: (S, p, a) => a && a.k === "bell",
  five(S){ const c = [0, 0, 0, 0]; S.up.forEach(u => { const t = u[u.length - 1]; if (t) c[t.f] += t.k; }); return c.some(x => x === 5); },
  cnt: (S, i) => S.dk[i].length + S.up[i].length,
  alive(S, i){ return S.dk[i].length > 0 || S.up[i].length > 0; },
  nextP(S){ let q = S.t; for (let k = 0; k < S.n; k++){ q = (q + 1) % S.n; if (S.dk[q].length) break; } S.t = q; },
  act(S, p, a, R){
    const now = S.gt;
    if (a.k === "flip"){ if (S.t !== p || !S.dk[p].length || now < S.cool) return false; S.up[p].push(S.dk[p].shift()); this.nextP(S); if (!S.dk[S.t].length) this.fin(S); bgFx(S, {k: "flip", p, snd: "pt"}); S.ft = now; return true; }
    if (a.k === "bell"){ if (now < S.cool || !this.alive(S, p)) return false; S.cool = now + 60;
      if (this.five(S)){ const won = []; S.up.forEach(u => { won.push(...u); u.length = 0; }); BG.shuffle(won, R); S.dk[p].push(...won); S.ring = p; bgFx(S, {k: "bell", p, ok: 1, say: `🔔 땡! 카드 ${won.length}장!`, snd: "gold"}); }
      else { let g = 0; for (let q = 0; q < S.n; q++) if (q !== p && this.alive(S, q) && S.dk[p].length){ S.dk[q].push(S.dk[p].pop()); g++; } S.ring = p; bgFx(S, {k: "bell", p, ok: 0, say: `🙈 5개가 아니에요! 카드 ${g}장 주기`, snd: "bad", c: "#ffa8a8"}); }
      if (!S.dk[S.t].length) this.nextP(S); this.fin(S); return true; }
    return false; },
  fin(S){ const al = Array.from({length: S.n}, (_, i) => i).filter(i => S.dk[i].length); if (al.length <= 1 || S.left <= 0){ const c = Array.from({length: S.n}, (_, i) => this.cnt(S, i)); const m = Math.max(...c); const tops = c.map((v, i) => v === m ? i : -1).filter(i => i >= 0); S.win = tops.length > 1 ? 99 : tops[0]; } },
  tick(S, R, X){ S.gt++; let ch = false;
    if (S.gt % 60 === 0 && S.win < 0){ S.left--; ch = true; if (S.left <= 0) this.fin(S); }
    if (S.win >= 0) return ch;
    if (this.five(S)){ if (!S.bot){ const sp = [70, 45, 30][X.lv] + Math.floor(R()*35); S.bot = {at: S.gt + sp, who: X.bots[Math.floor(R()*Math.max(1, X.bots.length))]}; } }
    else if (S.bot){ if (R() < .004 && X.lv === 0 && X.bots.length) { /* 쉬움 컴퓨터는 가끔 실수 */ } S.bot = null; }
    if (S.bot && S.gt >= S.bot.at && S.bot.who != null && this.alive(S, S.bot.who)){ const w = S.bot.who; S.bot = null; if (this.act(S, w, {k: "bell"}, R)) return true; }
    return ch; },
  aiDelay: 700,
  ai(S, p){ return S.dk[p].length ? {k: "flip"} : null; },
  over(S){ if (S.win < 0) return null; const c = Array.from({length: S.n}, (_, i) => this.cnt(S, i)), rank = c.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).map(x => x[1]); return {w: S.win === 99 ? -1 : S.win, rank, txt: c.map(v => `${v}장`).join(" : ")}; },
  pinfo(S, i){ return S ? `🃏 ${this.cnt(S, i)}장` : ""; },
  view(S){ const V = Object.assign({}, S, {dk: S.dk.map(d => d.map(() => 0)), bot: null}); return V; },
  card(g, c, x, y, w, h, rot){ g.save(); g.translate(x + w/2, y + h/2); g.rotate(rot || 0); BGD.tile(g, -w/2, -h/2, w, h, "#fff", "#adb5bd", 14);
    const P = {1: [[0, 0]], 2: [[-.22, -.22], [.22, .22]], 3: [[-.25, -.27], [0, 0], [.25, .27]], 4: [[-.22, -.25], [.22, -.25], [-.22, .25], [.22, .25]], 5: [[-.22, -.27], [.22, -.27], [0, 0], [-.22, .27], [.22, .27]]}[c.k];
    P.forEach(([u, v]) => outlined(g, this.F[c.f], u*w, v*h, w*.28, "#fff", "rgba(0,0,0,.15)")); g.restore(); },
  back(g, x, y, w, h){ BGD.tile(g, x, y, w, h, BGD.lg(g, x, y, x + w, y + h, ["#e64980", "#a61e4d"]), "#fff", 14); outlined(g, "🍓", x + w/2, y + h/2, w*.4); },
  geo(S, A){ const cx = A.x + A.w/2, cy = A.y + A.h/2, R0 = Math.min(A.w, A.h)*.34, cw = Math.min(120, R0*.6), ch = cw*1.4;
    const ang = q => Math.PI/2 + q*2*Math.PI/S.n; return {cx, cy, R0, cw, ch, pos: q => ({x: cx + Math.cos(ang(q))*R0*(S.n === 2 ? 1 : 1.05), y: cy + Math.sin(ang(q))*R0*.9})}; },
  draw(g, S, me, A, ui, X){
    const G = this.geo(S, A); BGD.felt(g, A.x + 10, A.y + 10, A.w - 20, A.h - 20, 40, "#2f9e44");
    const rot = q => ((q - me + S.n) % S.n);
    for (let q = 0; q < S.n; q++){ const P = G.pos(rot(q)), dx = P.x - G.cx, dy = P.y - G.cy, d = Math.hypot(dx, dy) || 1, ux = dx/d, uy = dy/d;
      const dkx = P.x + ux*G.cw*.2 - G.cw*1.1, dky = P.y - G.ch/2, upx = P.x - ux*G.cw*.5 + G.cw*.1, upy = P.y - uy*G.ch*.55 - G.ch/2;
      if (S.dk[q].length){ for (let k = Math.min(3, S.dk[q].length) - 1; k >= 0; k--) this.back(g, dkx - k*3, dky - k*3, G.cw*.8, G.ch*.8); outlined(g, `${S.dk[q].length}`, dkx + G.cw*.4, dky + G.ch*.8 + 16, 20, "#fff"); }
      if (q === me){ ui.deck = {x: dkx - 10, y: dky - 10, w: G.cw*.8 + 20, h: G.ch*.8 + 20}; if (S.t === me && S.win < 0){ g.lineWidth = 4; g.strokeStyle = "#ffe066"; rrect(g, dkx - 6, dky - 6, G.cw*.8 + 12, G.ch*.8 + 12, 14); g.stroke(); outlined(g, "👆 뒤집기", dkx + G.cw*.4, dky - 22, 20, "#ffe066"); } }
      const top = S.up[q][S.up[q].length - 1]; if (top){ const ft = ui.fx && ui.fx.k === "flip" && ui.fx.p === q ? bgEase((ui.fxT || 0)/12) : 1; g.save(); g.globalAlpha = ft; this.card(g, top, upx, upy + (1 - ft)*30, G.cw, G.ch, (q*.13) % .2 - .1); g.restore(); }
      outlined(g, q === me ? "나" : X.name(q).slice(0, 6), P.x - G.cw*.3, P.y + G.ch*.62 + 8, 18, this.col[q]); }
    const bf = ui.fx && ui.fx.k === "bell" ? ui.fx : null, bt = bf ? (ui.fxT || 0) : 99, shake = bt < 20 ? Math.sin(bt*1.6)*8*(1 - bt/20) : 0, br = Math.min(90, G.R0*.38);
    ui.bell = {x: G.cx - br, y: G.cy - br, w: br*2, h: br*2};
    g.save(); g.translate(G.cx + shake, G.cy); BGD.disc(g, 0, br*.25, br*.95, "#868e96"); BGD.disc(g, 0, 0, br*.8, "#fcc419", "#fff3bf"); outlined(g, "🔔", 0, -4, br*.9); g.restore();
    if (bf && bt < 40){ g.strokeStyle = bf.ok ? "#ffe066" : "#ff8787"; g.lineWidth = 6; g.beginPath(); g.arc(G.cx, G.cy, br + bt*3, 0, 7); g.stroke(); }
    outlined(g, `⏰ ${Math.floor(S.left/60)}:${String(S.left % 60).padStart(2, "0")}`, A.x + 90, A.y + 40, 28, S.left < 30 ? "#ff8787" : "#fff");
  },
  tap(S, me, px, py, A, ui){ if (BGD.hit(ui.bell, px, py)) return {k: "bell"}; if (BGD.hit(ui.deck, px, py)) return {k: "flip"}; return null; },
  key(S, me, code){ return code === "Space" ? {k: "bell"} : code === "Enter" ? {k: "flip"} : null; }
});

/* ---------------- 🃏 원카드 (2~4명) ---------------- */
BG.def({
  id: "oc", e: "🃏", n: "원카드", like: "우리가 아는 그 원카드", time: "10분", min: 2, max: 4, col: ["#ff6b6b", "#4dabf7", "#69db7c", "#ffd43b"], hidden: true,
  d: "같은 무늬나 같은 숫자를 내요! 공격 카드로 친구에게 카드를 왕창",
  rules: ["맨 위 카드와 <b>무늬</b>가 같거나 <b>숫자</b>가 같은 카드를 한 장 내요. 낼 카드가 없으면 <b>🂠 한 장 먹기</b>.", "⚔️ 공격: <b>2</b> → 2장, <b>A</b> → 3장, <b>♠A</b> → 5장, <b>조커</b> → 5장(컬러 조커 7장). 공격받으면 더 센 공격 카드로 막을 수 있어요(쌓여요)!", "<b>7</b> 무늬 바꾸기 · <b>J</b> 다음 사람 건너뛰기 · <b>Q</b> 방향 바꾸기 · <b>K</b> 한 번 더", "카드를 먼저 <b>모두 내면</b> 이겨요! 카드가 20장 넘으면 파산이에요."],
  SU: ["♠", "♥", "♦", "♣"], RK: ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"],
  setup(n, R){ const D = BG.shuffle(Array.from({length: 54}, (_, i) => i), R), h = Array.from({length: n}, () => D.splice(0, 7)); let top = D.pop(); while (top >= 52 || [1, 2].includes(top % 13 + 1)){ D.unshift(top); top = D.pop(); }
    return {n, h, d: D, pile: [top], su: Math.floor(top/13), atk: 0, dir: 1, t: 0, win: -1, out: [], bust: []}; },
  turn: S => S.win >= 0 ? -1 : S.t,
  rk: c => c >= 52 ? 0 : c % 13 + 1, su: c => c >= 52 ? -1 : Math.floor(c/13),
  pow(c){ if (c === 53) return 7; if (c === 52) return 5; const r = this.rk(c); if (r === 1) return this.su(c) === 0 ? 5 : 3; if (r === 2) return 2; return 0; },
  can(S, c){ const top = S.pile[S.pile.length - 1];
    if (S.atk > 0){ const p = this.pow(c); if (!p) return false; if (c >= 52) return true; if (top >= 52) return p >= 3; return this.su(c) === S.su || this.rk(c) === this.rk(top) || p >= this.pow(top); }
    if (c >= 52) return true; if (top >= 52) return this.su(c) === S.su; return this.su(c) === S.su || this.rk(c) === this.rk(top); },
  step(S, k = 1){ let q = S.t; for (let i = 0; i < k; i++){ do { q = (q + S.dir + S.n) % S.n; } while (S.out.includes(q) && S.out.length < S.n); } return q; },
  drawN(S, p, n){ for (let i = 0; i < n; i++){ if (!S.d.length){ const top = S.pile.pop(); S.d = BG.shuffle(S.pile, BG.rng(S.pile.length*7 + 3)); S.pile = [top]; } if (S.d.length) S.h[p].push(S.d.pop()); } },
  act(S, p, a){
    if (a.k === "draw"){ const n = S.atk || 1; this.drawN(S, p, n); const say = S.atk ? `😱 ${n}장 먹었어요!` : null; S.atk = 0;
      if (S.h[p].length > 20){ S.out.push(p); S.bust.push(p); S.h[p] = []; bgFx(S, {k: "bust", say: "💸 파산! 카드가 20장 넘었어요", snd: "bad"}); this.chk(S); if (S.win < 0) S.t = this.step(S); return true; }
      S.t = this.step(S); bgFx(S, {k: "draw", p, say, snd: "pt"}); return true; }
    if (a.k === "play"){ const i = S.h[p].indexOf(a.c); if (i < 0 || !this.can(S, a.c)) return false; S.h[p].splice(i, 1); S.pile.push(a.c);
      const r = this.rk(a.c); let skip = 1, say = null; S.su = a.c >= 52 ? (a.s != null ? a.s : S.su) : this.su(a.c);
      const pw = this.pow(a.c); if (pw){ S.atk += pw; say = `⚔️ 공격 +${pw} (쌓인 ${S.atk}장)`; }
      else if (r === 7){ if (a.s != null && a.s >= 0 && a.s < 4) S.su = a.s; say = `🎨 ${this.SU[S.su]} 무늬로!`; }
      else if (r === 11){ skip = 2; say = "⏭️ 건너뛰기!"; } else if (r === 12){ S.dir = -S.dir; say = "🔄 방향 바꾸기!"; if (S.n - S.out.length === 2) skip = 2; } else if (r === 13){ skip = 0; say = "👑 한 번 더!"; }
      if (!S.h[p].length){ S.out.push(p); say = "🎉 카드를 다 냈어요!"; this.chk(S); }
      if (S.win < 0) S.t = skip ? this.step(S, skip) : p;
      bgFx(S, {k: "play", p, c: a.c, say, snd: pw ? "hit" : "pt"}); return true; }
    return false; },
  chk(S){ const left = Array.from({length: S.n}, (_, i) => i).filter(i => !S.out.includes(i)); const winners = S.out.filter(i => !S.bust.includes(i)); if (winners.length) S.win = winners[0]; else if (left.length === 1) S.win = left[0]; },
  over(S){ if (S.win < 0) return null; const rank = Array.from({length: S.n}, (_, i) => i).sort((a, b) => (a === S.win ? -1 : b === S.win ? 1 : S.h[a].length - S.h[b].length)); return {w: S.win, rank, txt: "원카드 승리!"}; },
  view(S, p){ const V = JSON.parse(JSON.stringify(S)); V.h = S.h.map((h, q) => q === p ? h : h.map(() => -1)); V.d = S.d.map(() => -1); return V; },
  pinfo(S, i){ return S ? (S.bust.includes(i) ? "💸 파산" : S.out.includes(i) ? "🎉 다 냈어요" : `🂠 ${S.h[i].length}장${S.h[i].length === 1 ? " · 원카드!" : ""}`) : ""; },
  ai(S, p, R, X){ const H = S.h[p], ok = H.filter(c => this.can(S, c)); if (!ok.length) return {k: "draw"};
    const nx = this.step(S), danger = S.h[nx].length <= 2; let c;
    if (X.lv === 0) c = ok[Math.floor(R()*ok.length)];
    else c = ok.sort((a, b) => { const sc = x => (this.pow(x) ? (danger || S.atk ? 30 : -10) : 0) + (x >= 52 ? -20 : 0) + (this.rk(x) === 7 ? -5 : 0) + (this.rk(x) === 13 ? 8 : 0) + H.filter(y => this.su(y) === this.su(x)).length; return sc(b) - sc(a); })[0];
    const cnt = [0, 0, 0, 0]; H.forEach(x => { if (x < 52 && x !== c) cnt[this.su(x)]++; }); const best = cnt.indexOf(Math.max(...cnt));
    return {k: "play", c, s: best}; },
  cardDraw(g, c, x, y, w, h, hl, dim){ g.save(); if (hl){ BGD.shadow(g, true, 18, 0, "#ffe066"); } if (c < 0){ BGD.tile(g, x, y, w, h, BGD.lg(g, x, y, x + w, y + h, ["#5c7cfa", "#364fc7"]), "#fff", 10); outlined(g, "🎲", x + w/2, y + h/2, w*.4); g.restore(); return; }
    BGD.tile(g, x, y, w, h, "#fff", hl ? "#ffe066" : "#adb5bd", 10); g.restore();
    if (c >= 52){ outlined(g, "🃏", x + w/2, y + h/2, w*.55); outlined(g, c === 53 ? "컬러" : "흑백", x + w/2, y + h - 14, 13, c === 53 ? "#e03131" : "#343a40", "rgba(255,255,255,.8)"); }
    else { const red = [1, 2].includes(this.su(c)), col = red ? "#e03131" : "#212529"; BGD.txt(g, this.RK[this.rk(c)], x + 8, y + 16, w*.3, col, "left"); BGD.txt(g, this.SU[this.su(c)], x + 8, y + 16 + w*.28, w*.24, col, "left"); BGD.txt(g, this.SU[this.su(c)], x + w/2, y + h*.6, w*.55, col);
      if (this.pow(c)){ outlined(g, "⚔️", x + w - 14, y + 16, 15); } }
    if (dim){ g.fillStyle = "rgba(0,0,0,.35)"; rrect(g, x, y, w, h, 10); g.fill(); } },
  draw(g, S, me, A, ui, X){
    BGD.felt(g, A.x + 6, A.y + 6, A.w - 12, A.h - 12, 30, "#1c7c54");
    const others = []; for (let k = 1; k < S.n; k++) others.push(this.step(Object.assign({}, S, {t: me, dir: 1}), k));
    others.forEach((q, k) => { const cx = A.x + (k + 1)*A.w/(others.length + 1), n = S.h[q].length, cw = 44, ch = 62, sp = Math.min(18, 160/Math.max(1, n));
      for (let i = 0; i < Math.min(n, 12); i++) this.cardDraw(g, -1, cx - (Math.min(n, 12) - 1)*sp/2 + i*sp - cw/2, A.y + 30, cw, ch);
      outlined(g, `${q === S.t ? "▶ " : ""}${X.name(q).slice(0, 6)} · ${n}장`, cx, A.y + 110, 18, q === S.t ? "#ffe066" : "#fff"); });
    const cx = A.x + A.w/2, cy = A.y + A.h*.42, cw = Math.min(110, A.w*.12), ch = cw*1.42;
    for (let k = 0; k < 3; k++) this.cardDraw(g, -1, cx - cw*1.4 - k*2, cy - ch/2 - k*2, cw, ch);
    outlined(g, `${S.d.length}장`, cx - cw*.9, cy + ch/2 + 18, 18); ui.db = {x: cx - cw*1.4 - 6, y: cy - ch/2 - 6, w: cw + 12, h: ch + 12};
    const top = S.pile[S.pile.length - 1], pf = ui.fx && ui.fx.k === "play" ? bgEase((ui.fxT || 0)/14) : 1;
    if (S.pile.length > 1) this.cardDraw(g, S.pile[S.pile.length - 2], cx + cw*.2 - 6, cy - ch/2 + 4, cw, ch);
    g.save(); g.translate(0, (1 - pf)*80); this.cardDraw(g, top, cx + cw*.2, cy - ch/2, cw, ch); g.restore();
    BGD.box(g, cx + cw*1.4, cy - 40, 120, 80, 16, "rgba(0,0,0,.3)"); outlined(g, "지금 무늬", cx + cw*1.4 + 60, cy - 20, 16, "#d0bfff"); outlined(g, this.SU[S.su], cx + cw*1.4 + 60, cy + 14, 40, [1, 2].includes(S.su) ? "#ff6b6b" : "#fff");
    if (S.atk) outlined(g, `⚔️ 공격 ${S.atk}장 받는 중!`, cx, cy - ch/2 - 24, 26, "#ff8787");
    outlined(g, S.dir > 0 ? "🔃 시계 방향" : "🔄 반대 방향", A.x + 100, A.y + A.h*.42, 18, "#c5f6fa");
    const H = S.h[me] || [], n = H.length, hw = Math.min(96, (A.w - 40)/Math.max(7, n)*1.6), hh = hw*1.42, sp = Math.min(hw + 6, (A.w - 60 - hw)/Math.max(1, n - 1)), x0 = A.x + A.w/2 - ((n - 1)*sp + hw)/2, y0 = A.y + A.h - hh - 16;
    const my = S.t === me && S.win < 0; ui.hand = [];
    H.forEach((c, i) => { const ok = my && this.can(S, c), sel = ui.sel === c, y = y0 - (sel ? 26 : ok ? 10 : 0); this.cardDraw(g, c, x0 + i*sp, y, hw, hh, sel, my && !ok); ui.hand.push({x: x0 + i*sp, y, w: i === n - 1 ? hw : sp, h: hh, c}); });
    ui.su = null;
    if (my && ui.sel != null && (this.rk(ui.sel) === 7 || ui.sel >= 52)){ ui.su = this.SU.map((s, k) => ({x: cx - 230 + k*120, y: y0 - 100, w: 110, h: 64, t: s, k, c: [1, 2].includes(k) ? "#e03131" : "#343a40", p: 1})); outlined(g, "바꿀 무늬를 골라요", cx, y0 - 118, 20, "#ffe066"); ui.su.forEach(b => BGD.btn(g, b)); }
    if (my){ ui.dbt = {x: A.x + A.w - 210, y: cy + ch/2 + 40, w: 190, h: 62, t: S.atk ? `😱 ${S.atk}장 먹기` : "🂠 한 장 먹기", p: !H.some(c => this.can(S, c)), c: "#e8590c"}; BGD.btn(g, ui.dbt); } else ui.dbt = null;
    if (my && ui.sel != null && !ui.su){ outlined(g, "한 번 더 누르면 내요", cx, y0 - 46, 18, "#ffe066"); }
  },
  tap(S, me, px, py, A, ui){
    if (ui.su) for (const b of ui.su) if (BGD.hit(b, px, py)){ const c = ui.sel; ui.sel = null; return {k: "play", c, s: b.k}; }
    if ((ui.dbt && BGD.hit(ui.dbt, px, py)) || BGD.hit(ui.db, px, py)){ ui.sel = null; return {k: "draw"}; }
    for (let i = (ui.hand || []).length - 1; i >= 0; i--){ const b = ui.hand[i]; if (BGD.hit(b, px, py)){ if (!this.can(S, b.c)){ ui.sel = null; return null; }
      if (ui.sel === b.c && !(this.rk(b.c) === 7 || b.c >= 52)){ ui.sel = null; return {k: "play", c: b.c}; } ui.sel = b.c; return null; } }
    ui.sel = null; return null; },
  bad: () => "그 카드는 낼 수 없어요"
});
