/* =====================================================================
   🐾 우리반 동물 보드게임 ② (2026.11.25) — 카드 게임
   👑 동물 왕국 서열(달무티 같은) · 🌈 동물 색깔 카드(우노 같은) · 🥣 분수 먹이 나누기(분수 카드 게임)
   - 내 카드는 나만 보여요(view) · 🌐 각자 기기로 온라인
   ===================================================================== */

/* ---------------- 👑 동물 왕국 서열 (3~5명) ---------------- */
BG.def({
  id: "dm", e: "👑", n: "동물 왕국 서열", like: "달무티 같은 게임", time: "15분", min: 3, max: 5, col: ["#ff6b6b", "#4dabf7", "#69db7c", "#ffd43b", "#cc5de8"], hidden: true, bg: ["#5f3dc4", "#25125c"],
  d: "같은 동물을 모아 내고, 더 센 동물로 이겨요! 카드를 먼저 다 낸 친구가 다음 판의 🦁 왕",
  tag: "🆕 🐾 우리 동물 · 🌐 온라인 3~5명",
  rules: ["동물 카드에는 <b>서열 숫자</b>가 있어요. <b>숫자가 작을수록 세요</b> (1 🦁 사자 왕이 가장 세고, 10 🐭 생쥐가 가장 약해요). 센 동물일수록 카드가 적어요.", "먼저 내는 친구는 <b>같은 동물 카드</b>를 원하는 만큼 내요.", "다음 친구들은 <b>같은 장수</b>로 <b>더 센(숫자가 작은)</b> 동물을 내거나 <b>🙅 패스</b>해요.", "모두 패스하면 마지막에 낸 친구가 새로 시작해요. <b>🦄 유니콘</b>은 아무 동물이나 될 수 있어요.", "카드를 먼저 다 낸 순서대로 점수를 받아요. 다음 판엔 꼴찌가 1등에게 <b>가장 센 카드</b>를 바치고, 1등은 약한 카드를 돌려줘요. 모두 3판!"],
  RK: ["", "lion", "tiger", "eagle", "mammoth", "rhino", "croc", "fox", "dog", "rabbit", "mouse", "unicorn"],
  RN: ["", "사자 왕", "호랑이", "독수리", "매머드", "코뿔소", "악어", "여우", "강아지", "토끼", "생쥐", "유니콘"],
  RC: ["", "#ffd43b", "#ff922b", "#a5d8ff", "#c69c6d", "#adb5bd", "#8ce99a", "#ffa94d", "#f4c48a", "#fcc2d7", "#ced4da", "#e5dbff"],
  ROUNDS: 3,
  deal(S, R){ const D = []; for (let r = 1; r <= 10; r++) for (let k = 0; k < r; k++) D.push(r); D.push(11, 11); BG.shuffle(D, R);
    S.h = Array.from({length: S.n}, () => Array(12).fill(0)); D.forEach((c, i) => S.h[i % S.n][c]++);
    S.tr = null; S.pc = 0; S.out = []; S.log = [];
    if (S.prev){ const P = S.prev, top = P[0], last = P[S.n - 1], tx = [[top, last, 2]]; if (S.n >= 4) tx.push([P[1], P[S.n - 2], 1]); const msg = [];
      tx.forEach(([hi, lo, k]) => { for (let j = 0; j < k; j++){ const r = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].find(r => S.h[lo][r] > 0); if (r){ S.h[lo][r]--; S.h[hi][r]++; } }
        for (let j = 0; j < k; j++){ const r = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].find(r => S.h[hi][r] > 0); if (r){ S.h[hi][r]--; S.h[lo][r]++; } } msg.push(k); });
      S.t = top; S.tax = 1; } else { S.t = Math.floor(R()*S.n); S.tax = 0; } },
  setup(n, R){ const S = {n, rd: 0, pts: Array(n).fill(0), win: -1, prev: null}; this.deal(S, R); return S; },
  turn: S => S.win >= 0 ? -1 : S.t,
  cnt: (h) => h.reduce((a, b) => a + b, 0),
  act1: (S) => Array.from({length: S.n}, (_, i) => i).filter(i => !S.out.includes(i)),
  nxt(S, p){ let q = p; for (let k = 0; k < S.n; k++){ q = (q + 1) % S.n; if (!S.out.includes(q)) return q; } return p; },
  legal(S, p, a){ const h = S.h[p], n = a.n | 0, j = a.j | 0, r = a.r | 0; if (n < 0 || j < 0 || n + j < 1) return false; if (j > h[11]) return false;
    if (n > 0 && (r < 1 || r > 10 || h[r] < n)) return false; const eff = n > 0 ? r : 11;
    if (S.tr) return n + j === S.tr.n && eff < S.tr.r; return true; },
  act(S, p, a, R, X){
    if (a.k === "pass"){ if (!S.tr) return false; S.pc++; const others = this.act1(S).filter(i => i !== S.tr.by).length;
      if (S.pc >= others){ const by = S.tr.by; S.tr = null; S.pc = 0; S.t = S.out.includes(by) ? this.nxt(S, by) : by; bgFx(S, {k: "clear", say: `🧹 모두 패스! ${X.name(S.t)} 새로 시작`, snd: "pt"}); }
      else { S.t = this.nxt(S, p); bgFx(S, {k: "pass", p, snd: "pt"}); }
      return true; }
    if (a.k !== "play" || !this.legal(S, p, a)) return false;
    const n = a.n | 0, j = a.j | 0, eff = n > 0 ? a.r : 11; if (n) S.h[p][a.r] -= n; S.h[p][11] -= j;
    S.tr = {r: eff, n: n + j, by: p, j}; S.pc = 0; S.tax = 0;
    let say = `${X.name(p)}: ${this.RN[eff]} ${n + j}장`;
    if (!this.cnt(S.h[p])){ S.out.push(p); say = `🎉 ${X.name(p)} ${S.out.length}등으로 다 냈어요!`; }
    const L = this.act1(S);
    if (L.length <= 1){ if (L.length) S.out.push(L[0]); return this.endRound(S, R, X); }
    S.t = this.nxt(S, p);
    bgFx(S, {k: "play", p, say, c: "#ffe066", dur: 60, snd: "pt"}); return true; },
  endRound(S, R, X){ S.out.forEach((p, k) => S.pts[p] += S.n - 1 - k); S.rd++;
    if (S.rd >= this.ROUNDS){ const rank = S.pts.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0] || S.out.indexOf(a[1]) - S.out.indexOf(b[1])).map(x => x[1]); S.rank = rank; S.win = rank[0]; bgFx(S, {k: "end", snd: "gold"}); return true; }
    S.prev = S.out.slice(); this.deal(S, R); bgFx(S, {k: "round", say: `👑 ${X.name(S.prev[0])} 왕! ${S.rd + 1}판 시작 · 세금 바치기`, dur: 120, snd: "gold"}); return true; },
  bad: (S) => S.tr ? `같은 ${S.tr.n}장으로, 더 센(숫자가 작은) 동물만 낼 수 있어요` : "같은 동물 카드를 골라요",
  aiDelay: 850,
  ai(S, p, R, X){ const h = S.h[p];
    if (!S.tr){ const r = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].find(r => h[r] > 0); if (r) return {k: "play", r, n: h[r], j: 0}; return {k: "play", r: 0, n: 0, j: h[11]}; }
    if (X.lv === 0 && R() < .25) return {k: "pass"};
    const need = S.tr.n; for (let r = S.tr.r - 1; r >= 1; r--) if (h[r] >= need) return {k: "play", r, n: need, j: 0};
    if (X.lv >= 1 && h[11] && (this.cnt(h) <= 6 || X.lv === 2)){ for (let r = S.tr.r - 1; r >= 1; r--) if (h[r] > 0 && h[r] + h[11] >= need) return {k: "play", r, n: Math.min(h[r], need), j: need - Math.min(h[r], need)}; if (h[11] >= need && S.tr.r > 11) return {k: "play", r: 0, n: 0, j: need}; }
    return {k: "pass"}; },
  over(S){ if (S.win < 0) return null; return {w: S.win, rank: S.rank, txt: S.pts.map(v => `${v}점`).join(" : ")}; },
  pinfo(S, i){ if (!S) return ""; const pl = S.out.indexOf(i); return `⭐ ${S.pts[i]}점 · ${pl >= 0 ? `🎉 ${pl + 1}등` : `🂠 ${this.cnt(S.h[i])}장`}`; },
  view(S, p){ const V = JSON.parse(JSON.stringify(S)); V.h = S.h.map((h, q) => q === p ? h : (() => { const z = Array(12).fill(0); z[0] = this.cnt(h); return z; })()); return V; },
  card(g, r, x, y, w, h, hl, dim, badge){
    g.save(); if (hl){ g.shadowColor = "#ffe066"; g.shadowBlur = 18; } BGD.tile(g, x, y, w, h, BGD.lg(g, x, y, x, y + h, ["#fff", this.RC[r]]), hl ? "#ffe066" : "#868e96", 12); g.restore();
    BA.put(g, this.RK[r], x + w/2, y + h*.5, Math.min(w*.95, h*.62));
    outlined(g, r === 11 ? "🦄" : String(r), x + 14, y + 18, Math.max(16, w*.24), "#fff");
    if (h > 90) outlined(g, this.RN[r], x + w/2, y + h - 14, Math.max(12, w*.16), "#343a40", "rgba(255,255,255,.85)");
    if (badge) { BGD.disc(g, x + w - 12, y + 12, 15, "#e03131"); outlined(g, badge, x + w - 12, y + 12, 16, "#fff"); }
    if (dim){ g.fillStyle = "rgba(0,0,0,.4)"; rrect(g, x, y, w, h, 12); g.fill(); } },
  draw(g, S, me, A, ui, X){
    BGD.felt(g, A.x + 6, A.y + 6, A.w - 12, A.h - 12, 30, "#6741d9");
    const land = A.w > A.h, ly = A.y + (land ? 34 : 74);
    outlined(g, `👑 ${Math.min(S.rd + 1, this.ROUNDS)} / ${this.ROUNDS}판`, A.x + 20, A.y + 30, 22, "#fff", undefined, "left");
    /* 서열 줄 */
    const lw = Math.min(46, (A.w - 40)/11); for (let r = 1; r <= 11; r++){ const x = A.x + A.w/2 + (r - 6)*lw; BA.put(g, this.RK[r], x, ly, lw*.9); outlined(g, r === 11 ? "?" : String(r), x, ly + 26, 13, "#e5dbff"); }
    outlined(g, "◀ 숫자가 작을수록 세요 · 🦄 유니콘은 아무 동물", A.x + A.w/2, ly + 48, 15, "#e5dbff");
    /* 가운데: 지금 나온 카드 */
    const cx = A.x + A.w/2, cy = A.y + A.h*(land ? .4 : .38), cw = Math.min(96, A.w*.11), chh = cw*1.4;
    if (S.tr){ const n = S.tr.n, sp = Math.min(cw*.55, 300/Math.max(1, n)); for (let k = 0; k < n; k++) this.card(g, k >= n - (S.tr.j || 0) ? 11 : S.tr.r, cx - ((n - 1)*sp + cw)/2 + k*sp, cy - chh/2, cw, chh);
      outlined(g, `${X.name(S.tr.by).slice(0, 7)}: ${this.RN[S.tr.r]} ${n}장`, cx, cy + chh/2 + 22, 20, "#ffe066"); }
    else outlined(g, S.t === me ? "👑 내가 먼저! 같은 동물을 골라 내요" : `${X.name(S.t)} 먼저 내요`, cx, cy, 26, "#ffe066");
    /* 내 손패 (동물별로 묶어서) */
    const H = S.h[me] || [], G = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].filter(r => H[r] > 0), my = S.t === me && S.win < 0 && !S.out.includes(me);
    const hw = Math.min(104, (A.w - 40)/Math.max(6, G.length) - 8), hh = hw*1.42, y0 = A.y + A.h - hh - 96; ui.hand = [];
    if (ui.sr != null && !(H[ui.sr] > 0)) ui.sr = null; if ((ui.sj || 0) > (H[11] || 0)) ui.sj = H[11] || 0;
    G.forEach((r, i) => { const x = A.x + A.w/2 - (G.length*(hw + 8) - 8)/2 + i*(hw + 8), sel = r === 11 ? (ui.sj || 0) > 0 : ui.sr === r, y = y0 - (sel ? 22 : 0);
      for (let k = Math.min(3, H[r]) - 1; k > 0; k--) this.card(g, r, x + k*4, y - k*4, hw, hh);
      this.card(g, r, x, y, hw, hh, sel, false, String(H[r]));
      if (sel) outlined(g, `${r === 11 ? ui.sj : ui.sn}장 고름`, x + hw/2, y - 16, 17, "#ffe066");
      ui.hand.push({x, y: y - 12, w: hw, h: hh + 12, r}); });
    if (S.out.includes(me)) outlined(g, `🎉 ${S.out.indexOf(me) + 1}등! 친구들을 기다려요`, cx, y0 + hh/2, 26, "#ffe066");
    ui.bt = [];
    if (my){ const n = (ui.sr ? ui.sn : 0) + (ui.sj || 0), a = {k: "play", r: ui.sr || 0, n: ui.sr ? ui.sn : 0, j: ui.sj || 0}, ok = n > 0 && this.legal(S, me, a);
      ui.bt.push({id: "play", x: cx - 250, y: A.y + A.h - 82, w: 240, h: 66, t: n ? `✅ ${n}장 내기` : "카드를 골라요", p: ok, off: !ok, c: "#2f9e44"});
      if (S.tr) ui.bt.push({id: "pass", x: cx + 10, y: A.y + A.h - 82, w: 240, h: 66, t: "🙅 패스", c: "#868e96", p: 1});
      ui.bt.forEach(b => BGD.btn(g, b));
      if (S.tax && S.rd > 0) outlined(g, "👑 세금을 주고받았어요 (센 카드 ↔ 약한 카드)", cx, cy - chh/2 - 40, 18, "#ffd8a8"); }
  },
  tap(S, me, px, py, A, ui){ const H = S.h[me];
    for (const b of ui.bt || []) if (BGD.hit(b, px, py)){ if (b.id === "pass"){ ui.sr = null; ui.sj = 0; return {k: "pass"}; } if (b.off) return null; const a = {k: "play", r: ui.sr || 0, n: ui.sr ? ui.sn : 0, j: ui.sj || 0}; ui.sr = null; ui.sj = 0; return a; }
    for (const b of ui.hand || []) if (BGD.hit(b, px, py)){
      if (b.r === 11){ ui.sj = ((ui.sj || 0) + 1) % (H[11] + 1); return null; }
      if (ui.sr === b.r){ ui.sn = ui.sn > 1 ? ui.sn - 1 : H[b.r]; return null; }
      ui.sr = b.r; ui.sn = S.tr ? Math.min(H[b.r], S.tr.n) : H[b.r]; if (S.tr) ui.sj = Math.min(H[11], S.tr.n - ui.sn); return null; }
    return null; }
});

/* ---------------- 🌈 동물 색깔 카드 (2~4명) ---------------- */
BG.def({
  id: "un", e: "🌈", n: "동물 색깔 카드", like: "우노 같은 게임", time: "10분", min: 2, max: 4, col: ["#ff6b6b", "#4dabf7", "#69db7c", "#ffd43b"], hidden: true, bg: ["#1c7c54", "#0b3b28"],
  d: "같은 색이나 같은 동물을 내요! 한 장 남으면 🙌 하나! 를 외치기",
  tag: "🆕 🐾 우리 동물 · 🌐 온라인 2~4명",
  rules: ["맨 위 카드와 <b>색깔</b>이 같거나 <b>동물(숫자)</b>이 같은 카드를 한 장 내요. 낼 카드가 없으면 <b>🂠 한 장 먹기</b>(먹은 카드가 맞으면 바로 낼 수 있어요).", "<b>⏭️ 쉬어</b>: 다음 친구 건너뛰기 · <b>🔄 거꾸로</b>: 방향 바꾸기 · <b>+2</b>: 다음 친구가 2장 먹고 쉬어요.", "<b>🌈 무지개</b>는 아무 때나 내고 색깔을 골라요. <b>🌈+4</b>는 다음 친구가 4장 먹고 쉬어요.", "카드가 <b>2장일 때 🙌 하나!</b> 를 누르고 내요. 안 누르고 1장이 되면 친구가 <b>🫵 잡았다!</b> 를 눌러 2장을 먹일 수 있어요.", "카드를 가장 먼저 <b>모두 낸</b> 친구가 이겨요!"],
  CO: ["#f03e3e", "#fab005", "#37b24d", "#1c7ed6"], CN: ["🌋 화산", "🏜️ 사막", "🌳 숲", "🌊 바다"],
  NA: ["mouse", "chick", "rabbit", "cat", "dog", "fox", "panda", "penguin", "tiger", "lion"],
  /* 카드 = 색*16 + 값 (0~9 숫자 · 10 쉬어 · 11 거꾸로 · 12 +2 · 13 무지개 · 14 무지개+4), 무지개는 색 4 */
  setup(n, R){ const D = []; for (let c = 0; c < 4; c++){ D.push(c*16); for (let v = 1; v <= 12; v++){ D.push(c*16 + v, c*16 + v); } } for (let k = 0; k < 4; k++) D.push(4*16 + 13, 4*16 + 14);
    BG.shuffle(D, R); const h = Array.from({length: n}, () => D.splice(0, 7)); let top = D.pop(); while ((top & 15) >= 10){ D.unshift(top); top = D.pop(); }
    return {n, h, d: D, pile: [top], col: top >> 4, t: 0, dir: 1, drew: -1, one: Array(n).fill(0), vul: -1, vulN: 0, gt: 0, win: -1}; },
  turn: S => S.win >= 0 ? -1 : S.t,
  free: (S, p, a) => !!a && (a.k === "one" || a.k === "catch"),
  can(S, c){ const top = S.pile[S.pile.length - 1]; if ((c >> 4) === 4) return true; return (c >> 4) === S.col || (c & 15) === (top & 15); },
  nx(S, k = 1){ return ((S.t + S.dir*k) % S.n + S.n*4) % S.n; },
  give(S, p, k){ for (let i = 0; i < k; i++){ if (!S.d.length){ const top = S.pile.pop(); S.d = BG.shuffle(S.pile.map(c => c), BG.rng(S.pile.length*31 + 7)); S.pile = [top]; } if (S.d.length) S.h[p].push(S.d.pop()); } if (S.h[p].length > 1) S.one[p] = 0; },
  tickVul(S, p){ if (S.vul >= 0 && p !== S.vul && --S.vulN <= 0) S.vul = -1; },
  act(S, p, a, R, X){
    if (a.k === "one"){ if (S.h[p].length > 2 || S.one[p]) return false; S.one[p] = 1; if (S.vul === p) S.vul = -1; bgFx(S, {k: "one", p, say: `🙌 ${X.name(p)}: 하나!`, snd: "gold"}); return true; }
    if (a.k === "catch"){ if (S.vul < 0 || S.vul === p) return false; const q = S.vul; S.vul = -1; this.give(S, q, 2); bgFx(S, {k: "catch", p, say: `🫵 ${X.name(p)}: 잡았다! ${X.name(q)} 2장`, c: "#ff8787", snd: "hit"}); return true; }
    if (S.t !== p) return false;
    if (a.k === "draw"){ this.tickVul(S, p);
      if (S.drew === p){ S.drew = -1; S.t = this.nx(S); bgFx(S, {k: "pass", p, snd: "pt"}); return true; }
      this.give(S, p, 1); const c = S.h[p][S.h[p].length - 1];
      if (this.can(S, c)){ S.drew = p; S.dc = c; bgFx(S, {k: "draw", p, snd: "pt"}); }
      else { S.drew = -1; S.t = this.nx(S); bgFx(S, {k: "draw", p, snd: "pt"}); }
      return true; }
    if (a.k !== "play") return false;
    const i = S.h[p].indexOf(a.c); if (i < 0 || !this.can(S, a.c) || (S.drew === p && a.c !== S.dc)) return false;
    this.tickVul(S, p); S.drew = -1;
    if (a.one && S.h[p].length === 2) S.one[p] = 1;
    S.h[p].splice(i, 1); S.pile.push(a.c); const v = a.c & 15; S.col = (a.c >> 4) === 4 ? ((a.s | 0) & 3) : a.c >> 4;
    let say = null, step = 1;
    if (v === 10){ step = 2; say = "⏭️ 쉬어!"; }
    else if (v === 11){ S.dir = -S.dir; say = "🔄 거꾸로!"; if (S.n === 2) step = 2; }
    else if (v === 12){ const q = this.nx(S); this.give(S, q, 2); step = 2; say = `+2! ${X.name(q)} 2장 먹고 쉬어요`; }
    else if (v === 13) say = `🌈 ${this.CN[S.col]}!`;
    else if (v === 14){ const q = this.nx(S); this.give(S, q, 4); step = 2; say = `🌈+4! ${X.name(q)} 4장 · ${this.CN[S.col]}`; }
    if (!S.h[p].length){ S.win = p; bgFx(S, {k: "win", p, say: "🎉 카드를 다 냈어요!", snd: "gold"}); return true; }
    if (S.h[p].length === 1 && !S.one[p]){ S.vul = p; S.vulN = 2; S.vulAt = S.gt; }
    S.t = this.nx(S, step); bgFx(S, {k: "play", p, c: a.c, say, snd: v >= 10 ? "hit" : "pt"}); return true; },
  tick(S, R, X){ S.gt++;
    if (S.vul >= 0 && S.win < 0){ const D = [170, 100, 55][X.lv] || 100, cat = X.bots.find(b => b !== S.vul);
      if (cat != null && S.gt - (S.vulAt || 0) >= Math.round(D*BA.fast()) && (X.lv > 0 || R() < .01)) return this.act(S, cat, {k: "catch"}, R, X);
      if (X.bots.includes(S.vul) && S.gt - (S.vulAt || 0) >= Math.round([120, 50, 15][X.lv]*BA.fast()) && R() < [.01, .03, .5][X.lv]) return this.act(S, S.vul, {k: "one"}, R, X); }
    return false; },
  aiDelay: 750,
  ai(S, p, R, X){ const H = S.h[p];
    if (S.drew === p){ return this.can(S, S.dc) && (X.lv > 0 || R() < .7) ? {k: "play", c: S.dc, s: this.best(H, S.dc), one: R() < [.5, .85, 1][X.lv]} : {k: "draw"}; }
    const ok = H.filter(c => this.can(S, c)); if (!ok.length) return {k: "draw"};
    const nx = this.nx(S), danger = S.h[nx].length <= 2;
    let c = X.lv === 0 ? ok[Math.floor(R()*ok.length)] : ok.sort((a, b) => { const sc = x => { const v = x & 15; return (v >= 10 && v <= 12 ? (danger ? 30 : 4) : 0) + (v === 14 ? (danger ? 40 : -30) : 0) + (v === 13 ? -20 : 0) + H.filter(y => (y >> 4) === (x >> 4)).length*2 + v*.1; }; return sc(b) - sc(a); })[0];
    return {k: "play", c, s: this.best(H, c), one: R() < [.5, .85, 1][X.lv]}; },
  best(H, c){ const n = [0, 0, 0, 0]; H.forEach(x => { if (x !== c && (x >> 4) < 4) n[x >> 4]++; }); return n.indexOf(Math.max(...n)); },
  over(S){ if (S.win < 0) return null; const rank = Array.from({length: S.n}, (_, i) => i).sort((a, b) => S.h[a].length - S.h[b].length); return {w: S.win, rank, txt: "모두 냈어요!"}; },
  pinfo: (S, i) => S ? `🂠 ${S.h[i].length}장${S.one[i] && S.h[i].length <= 2 ? " · 🙌" : S.vul === i ? " · ⚠️" : ""}` : "",
  view(S, p){ const V = JSON.parse(JSON.stringify(S)); V.h = S.h.map((h, q) => q === p ? h : h.map(() => -1)); V.d = S.d.map(() => -1); if (S.drew !== p) V.dc = null; return V; },
  card(g, c, x, y, w, h, hl, dim){
    g.save(); if (hl){ g.shadowColor = "#ffe066"; g.shadowBlur = 18; }
    if (c < 0){ BGD.tile(g, x, y, w, h, BGD.lg(g, x, y, x + w, y + h, ["#343a40", "#212529"]), "#fff", 12); g.restore(); BA.put(g, "unicorn", x + w/2, y + h/2, w*.7); outlined(g, "🌈", x + w/2, y + h - 16, w*.2); return; }
    const co = c >> 4, v = c & 15, fill = co === 4 ? BGD.lg(g, x, y, x + w, y + h, this.CO.concat(["#7048e8"])) : BGD.lg(g, x, y, x, y + h, [this.CO[co], BGD.dark(this.CO[co])]);
    BGD.tile(g, x, y, w, h, fill, hl ? "#ffe066" : "#fff", 12); g.restore();
    g.save(); g.fillStyle = "rgba(255,255,255,.92)"; g.beginPath(); g.ellipse(x + w/2, y + h/2, w*.38, h*.33, -.35, 0, 7); g.fill(); g.restore();
    const big = Math.max(14, w*.26);
    if (v <= 9){ BA.put(g, this.NA[v], x + w/2, y + h/2, w*.62); outlined(g, String(v), x + 12, y + 16, big, "#fff"); outlined(g, String(v), x + w - 12, y + h - 16, big, "#fff"); }
    else { const L = {10: ["⏭️", "owl"], 11: ["🔄", "frog"], 12: ["+2", "croc"], 13: ["🌈", "unicorn"], 14: ["+4", "dragon"]}[v];
      BA.put(g, L[1], x + w/2, y + h/2 + h*.04, w*.55); outlined(g, L[0], x + w/2, y + h*.2, big*1.05, "#fff"); outlined(g, L[0], x + 14, y + h - 16, big*.7, "#fff"); }
    if (dim){ g.fillStyle = "rgba(0,0,0,.4)"; rrect(g, x, y, w, h, 12); g.fill(); } },
  draw(g, S, me, A, ui, X){
    BGD.felt(g, A.x + 6, A.y + 6, A.w - 12, A.h - 12, 30, "#2b8a3e");
    const others = []; for (let k = 1; k < S.n; k++) others.push((me + k) % S.n);
    others.forEach((q, k) => { const cx = A.x + (k + 1)*A.w/(others.length + 1), n = S.h[q].length, sp = Math.min(16, 150/Math.max(1, n));
      for (let i = 0; i < Math.min(n, 12); i++) this.card(g, -1, cx - (Math.min(n, 12) - 1)*sp/2 + i*sp - 21, A.y + 24, 42, 60);
      outlined(g, `${q === S.t ? "▶ " : ""}${X.name(q).slice(0, 6)} · ${n}장${S.vul === q ? " ⚠️" : ""}`, A.x + (k + 1)*A.w/(others.length + 1), A.y + 104, 18, q === S.t ? "#ffe066" : "#fff"); });
    const cx = A.x + A.w/2, cy = A.y + A.h*.41, cw = Math.min(112, A.w*.12), ch = cw*1.42;
    for (let k = 0; k < 3; k++) this.card(g, -1, cx - cw*1.45 - k*2, cy - ch/2 - k*2, cw, ch);
    ui.db = {x: cx - cw*1.45 - 6, y: cy - ch/2 - 6, w: cw + 12, h: ch + 12};
    const top = S.pile[S.pile.length - 1], pf = ui.fx && ui.fx.k === "play" ? bgEase((ui.fxT || 0)/14) : 1;
    if (S.pile.length > 1) this.card(g, S.pile[S.pile.length - 2], cx + cw*.15 - 6, cy - ch/2 + 4, cw, ch);
    g.save(); g.translate(0, (1 - pf)*80); this.card(g, top, cx + cw*.15, cy - ch/2, cw, ch); g.restore();
    BGD.box(g, cx + cw*1.35, cy - 44, 150, 88, 16, "rgba(0,0,0,.3)"); outlined(g, "지금 색깔", cx + cw*1.35 + 75, cy - 22, 16, "#d3f9d8"); BGD.disc(g, cx + cw*1.35 + 40, cy + 16, 18, this.CO[S.col]); outlined(g, this.CN[S.col].split(" ")[1], cx + cw*1.35 + 100, cy + 16, 20, "#fff");
    outlined(g, S.dir > 0 ? "🔃 시계 방향" : "🔄 거꾸로", A.x + 90, cy, 18, "#d3f9d8");
    const H = S.h[me] || [], n = H.length, hw = Math.min(92, (A.w - 40)/Math.max(7, n)*1.6), hh = hw*1.42, sp = Math.min(hw + 6, (A.w - 60 - hw)/Math.max(1, n - 1)), x0 = A.x + A.w/2 - ((n - 1)*sp + hw)/2, y0 = A.y + A.h - hh - 16;
    const my = S.t === me && S.win < 0; ui.hand = [];
    H.forEach((c, i) => { const ok = my && this.can(S, c) && (S.drew !== me || c === S.dc), sel = ui.sel === i, y = y0 - (sel ? 26 : ok ? 10 : 0); this.card(g, c, x0 + i*sp, y, hw, hh, sel, my && !ok); ui.hand.push({x: x0 + i*sp, y, w: i === n - 1 ? hw : sp, h: hh, c, i}); });
    ui.co = null; const sc = ui.sel != null ? H[ui.sel] : null;
    if (my && sc != null && (sc >> 4) === 4){ ui.co = this.CO.map((c, k) => ({x: cx - 250 + k*125, y: y0 - 100, w: 115, h: 64, t: this.CN[k], k, c, p: 1})); outlined(g, "바꿀 색깔을 골라요", cx, y0 - 118, 20, "#ffe066"); ui.co.forEach(b => BGD.btn(g, b)); }
    ui.bt = [];
    if (my) ui.bt.push({id: "draw", x: A.x + A.w - 220, y: cy + ch/2 + 30, w: 200, h: 60, t: S.drew === me ? "⏩ 넘기기" : "🂠 한 장 먹기", p: !H.some(c => this.can(S, c)) || S.drew === me, c: "#e8590c"});
    if (n <= 2 && !S.one[me] && S.win < 0) ui.bt.push({id: "one", x: A.x + 20, y: cy + ch/2 + 30, w: 190, h: 60, t: "🙌 하나!", p: 1, c: "#f59f00"});
    if (S.vul >= 0 && S.vul !== me && S.win < 0) ui.bt.push({id: "catch", x: A.x + 20, y: cy - ch/2 - 10, w: 210, h: 64, t: `🫵 잡았다!`, p: 1, c: "#e03131"});
    ui.bt.forEach(b => BGD.btn(g, b));
    if (my && ui.sel != null && !ui.co) outlined(g, "한 번 더 누르면 내요", cx, y0 - 46, 18, "#ffe066");
  },
  tap(S, me, px, py, A, ui){ const H = S.h[me];
    for (const b of ui.bt || []) if (BGD.hit(b, px, py)){ if (b.id === "one") return {k: "one"}; if (b.id === "catch") return {k: "catch"}; ui.sel = null; return {k: "draw"}; }
    if (ui.co) for (const b of ui.co) if (BGD.hit(b, px, py)){ const c = H[ui.sel]; ui.sel = null; return {k: "play", c, s: b.k}; }
    if (BGD.hit(ui.db, px, py)){ ui.sel = null; return {k: "draw"}; }
    for (let i = (ui.hand || []).length - 1; i >= 0; i--){ const b = ui.hand[i]; if (BGD.hit(b, px, py)){ if (!this.can(S, b.c) || (S.drew === me && b.c !== S.dc)){ ui.sel = null; return null; }
      if (ui.sel === b.i && (b.c >> 4) !== 4){ ui.sel = null; return {k: "play", c: b.c}; } ui.sel = b.i; return null; } }
    ui.sel = null; return null; },
  bad: () => "그 카드는 지금 낼 수 없어요"
});

/* ---------------- 🥣 분수 먹이 나누기 (2~4명) ---------------- */
BG.def({
  id: "fr", e: "🥣", n: "분수 먹이 나누기", like: "분수 카드 게임", time: "8분", min: 2, max: 4, col: ["#ff6b6b", "#4dabf7", "#69db7c", "#ffd43b"], hidden: true, bg: ["#e8590c", "#7c2d12"],
  d: "분수 먹이 카드로 동물 밥그릇을 딱 1만큼 채워요! 꽉 채운 친구가 그 밥그릇을 가져가요",
  tag: "🆕 🐾 수학 놀이 · 🌐 온라인 2~4명",
  rules: ["가운데에 배고픈 동물의 <b>밥그릇 2개</b>가 있어요. 밥그릇은 <b>1</b>만큼 먹을 수 있어요.", "차례마다 <b>분수 카드 한 장</b>을 밥그릇 하나에 넣어요. 넣은 뒤에 <b>1을 넘으면 안 돼요</b>.", "넣어서 <b>딱 1</b>이 되면 \"냠냠!\" 그 밥그릇을 가져가요(1점). 새 동물이 와요.", "넣을 카드가 없으면 카드를 한 장 가져오고 차례를 넘겨요.", "카드가 다 떨어지고 아무도 못 넣으면 끝! <b>밥그릇을 가장 많이 모은</b> 친구가 이겨요.", "💡 1/2 = 2/4 = 3/6 = 6/12 처럼 같은 크기의 분수를 떠올려 봐요!"],
  /* 카드 값은 12분의 몇 (1/2 = 6) */
  DK: {6: 7, 4: 7, 8: 3, 3: 7, 9: 3, 2: 7, 10: 2, 1: 5, 5: 3, 7: 2},
  BW: ["panda", "rabbit", "penguin", "cat", "dog", "fox", "chick", "tiger", "lion", "frog", "owl", "hedgehog", "mouse", "whale"],
  gcd: (a, b) => b ? BG.D.fr.gcd(b, a % b) : a,
  fr(v){ if (v === 0) return "0"; if (v === 12) return "1"; const g = this.gcd(v, 12); return `${v/g}/${12/g}`; },
  setup(n, R){ const D = []; Object.entries(this.DK).forEach(([v, k]) => { for (let i = 0; i < k; i++) D.push(+v); }); BG.shuffle(D, R);
    const h = Array.from({length: n}, () => D.splice(0, 5)); return {n, h, d: D, bw: [{f: 0, a: 0, c: []}, {f: 0, a: 1, c: []}], na: 2, sc: Array(n).fill(0), t: 0, ps: 0, win: -1}; },
  turn: S => S.win >= 0 ? -1 : S.t,
  canAny: (S, p) => S.h[p].some(v => S.bw.some(b => b.f + v <= 12)),
  act(S, p, a, R, X){
    if (a.k === "play"){ const i = S.h[p].indexOf(a.v), b = S.bw[a.b]; if (i < 0 || !b || b.f + a.v > 12) return false;
      S.h[p].splice(i, 1); b.f += a.v; b.c.push(a.v); S.ps = 0; let say = null;
      if (b.f === 12){ S.sc[p]++; say = `😋 냠냠! ${X.name(p)} ${BA.NM[this.BW[b.a]] || ""} 밥그릇 완성!`; S.bw[a.b] = {f: 0, a: S.na++ % this.BW.length, c: []}; }
      if (S.d.length) S.h[p].push(S.d.pop());
      bgFx(S, {k: "play", p, b: a.b, say, snd: say ? "gold" : "pt"}); this.next(S); return true; }
    if (a.k === "draw"){ if (this.canAny(S, p)) return false; if (S.d.length){ S.h[p].push(S.d.pop()); S.ps = 0; } else S.ps++; bgFx(S, {k: "draw", p, say: S.d.length || S.ps === 0 ? null : "🙅 넣을 카드가 없어요", snd: "pt"}); this.next(S); return true; }
    return false; },
  next(S){ const all = S.h.every(h => !h.length); if (all || S.ps >= S.n){ const m = Math.max(...S.sc), tops = S.sc.map((v, i) => v === m ? i : -1).filter(i => i >= 0); S.win = tops.length > 1 ? 99 : tops[0]; return; } S.t = (S.t + 1) % S.n; },
  bad: (S, p, a) => a.k === "draw" ? "넣을 수 있는 카드가 있어요!" : "1을 넘어가면 안 돼요!",
  aiDelay: 900,
  ai(S, p, R, X){ const M = []; S.h[p].forEach(v => S.bw.forEach((b, k) => { if (b.f + v <= 12) M.push({v, b: k, done: b.f + v === 12}); }));
    if (!M.length) return {k: "draw"};
    if (X.lv === 0) return Object.assign({k: "play"}, M[Math.floor(R()*M.length)]);
    const win = M.find(m => m.done); if (win) return {k: "play", v: win.v, b: win.b};
    const fq = v => this.DK[v] || 0;
    M.forEach(m => { const rem = S.bw.map((b, k) => 12 - (k === m.b ? b.f + m.v : b.f)); m.s = -(fq(rem[0]) + fq(rem[1]))*(X.lv === 2 ? 1 : .3) + m.v*.05 + R()*.5; });
    M.sort((a, b) => b.s - a.s); return {k: "play", v: M[0].v, b: M[0].b}; },
  over(S){ if (S.win < 0) return null; const rank = S.sc.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).map(x => x[1]); return {w: S.win === 99 ? -1 : S.win, rank, txt: S.sc.map(v => `🥣${v}`).join(" : ")}; },
  pinfo: (S, i) => S ? `🥣 ${S.sc[i]}개 · 🂠 ${S.h[i].length}장` : "",
  view(S, p){ const V = JSON.parse(JSON.stringify(S)); V.h = S.h.map((h, q) => q === p ? h : h.map(() => -1)); V.d = S.d.map(() => -1); return V; },
  pie(g, x, y, r, v, col, ticks){ g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = "rgba(255,255,255,.85)"; g.fill();
    if (v > 0){ g.beginPath(); g.moveTo(x, y); g.arc(x, y, r, -Math.PI/2, -Math.PI/2 + v/12*Math.PI*2); g.closePath(); g.fillStyle = col; g.fill(); }
    if (ticks){ g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = 1; for (let k = 0; k < 12; k++){ const a = -Math.PI/2 + k*Math.PI/6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a)*r, y + Math.sin(a)*r); g.stroke(); } }
    g.lineWidth = 2; g.strokeStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); g.restore(); },
  card(g, v, x, y, w, h, hl, dim){
    g.save(); if (hl){ g.shadowColor = "#ffe066"; g.shadowBlur = 18; }
    if (v < 0){ BGD.tile(g, x, y, w, h, BGD.lg(g, x, y, x + w, y + h, ["#ff922b", "#d9480f"]), "#fff", 12); g.restore(); outlined(g, "🥣", x + w/2, y + h/2, w*.45); return; }
    BGD.tile(g, x, y, w, h, "#fff9db", hl ? "#ffe066" : "#e8590c", 12); g.restore();
    this.pie(g, x + w/2, y + h*.38, w*.3, v, "#ff922b", true);
    const [a, b] = this.fr(v).split("/"); outlined(g, a, x + w/2, y + h*.73, w*.22, "#d9480f", "#fff"); g.fillStyle = "#d9480f"; g.fillRect(x + w*.32, y + h*.8, w*.36, 3); outlined(g, b, x + w/2, y + h*.89, w*.22, "#d9480f", "#fff");
    if (dim){ g.fillStyle = "rgba(0,0,0,.4)"; rrect(g, x, y, w, h, 12); g.fill(); } },
  draw(g, S, me, A, ui, X){
    BGD.box(g, A.x + 6, A.y + 6, A.w - 12, A.h - 12, 30, BGD.lg(g, 0, A.y, 0, A.y + A.h, ["#fff4e6", "#ffd8a8"]));
    const others = []; for (let k = 1; k < S.n; k++) others.push((me + k) % S.n);
    others.forEach((q, k) => { const cx = A.x + (k + 1)*A.w/(others.length + 1), n = S.h[q].length;
      for (let i = 0; i < n; i++) this.card(g, -1, cx - (n - 1)*7 + i*14 - 20, A.y + 20, 40, 56);
      outlined(g, `${q === S.t ? "▶ " : ""}${X.name(q).slice(0, 6)}`, cx, A.y + 96, 18, q === S.t ? "#d9480f" : "#495057", "rgba(255,255,255,.9)"); });
    const my = S.t === me && S.win < 0, H = S.h[me] || [], sel = ui.sel != null ? H[ui.sel] : null, br = Math.min(110, A.w*.13, A.h*.15);
    ui.bw = [];
    S.bw.forEach((b, k) => { const x = A.x + A.w*(k ? .7 : .3), y = A.y + A.h*.42, fits = sel != null && b.f + sel <= 12;
      const done = ui.fx && ui.fx.k === "play" && ui.fx.b === k && ui.fx.say && (ui.fxT || 0) < 50;
      BA.put(g, this.BW[b.a], x, y - br*1.25, br*1.2);
      g.save(); BGD.shadow(g, true, 16, 6); g.beginPath(); g.ellipse(x, y + br*.15, br*1.18, br*1.05, 0, 0, Math.PI); g.fillStyle = fits ? "#74c0fc" : "#4dabf7"; g.fill(); g.restore();
      this.pie(g, x, y, br, done ? 12 : b.f, "#ffa94d", true);
      if (fits){ g.lineWidth = 6; g.strokeStyle = "#ffe066"; g.beginPath(); g.arc(x, y, br + 8, 0, 7); g.stroke(); g.save(); g.globalAlpha = .45; g.beginPath(); g.moveTo(x, y); g.arc(x, y, br, -Math.PI/2 + b.f/12*Math.PI*2, -Math.PI/2 + (b.f + sel)/12*Math.PI*2); g.closePath(); g.fillStyle = "#ff922b"; g.fill(); g.restore(); }
      if (done) outlined(g, "😋 냠냠!", x, y, 34, "#fff");
      outlined(g, `지금 ${this.fr(b.f)}`, x, y + br + 30, 24, "#7c2d12", "#fff");
      ui.bw.push({x, y, r: br + 14, k}); });
    outlined(g, `남은 카드 ${S.d.length}장`, A.x + A.w/2, A.y + A.h*.42 + br + 70, 18, "#7c2d12", "#fff");
    const n = H.length, hw = Math.min(100, (A.w - 40)/Math.max(5, n) - 10), hh = hw*1.38, x0 = A.x + A.w/2 - (n*(hw + 10) - 10)/2, y0 = A.y + A.h - hh - 20; ui.hand = [];
    H.forEach((v, i) => { const ok = my && S.bw.some(b => b.f + v <= 12), sl = ui.sel === i, y = y0 - (sl ? 24 : ok ? 8 : 0); this.card(g, v, x0 + i*(hw + 10), y, hw, hh, sl, my && !ok); ui.hand.push({x: x0 + i*(hw + 10), y, w: hw, h: hh, i}); });
    ui.dbt = null;
    if (my && !this.canAny(S, me)){ ui.dbt = {x: A.x + A.w/2 - 130, y: y0 - 90, w: 260, h: 62, t: S.d.length ? "🂠 한 장 가져오기" : "🙅 넘기기", p: 1, c: "#e8590c"}; BGD.btn(g, ui.dbt); }
    else if (my) outlined(g, ui.sel == null ? "카드를 고르고 밥그릇을 눌러요" : "넣을 밥그릇을 눌러요", A.x + A.w/2, y0 - 36, 20, "#7c2d12", "#fff");
  },
  tap(S, me, px, py, A, ui){
    if (ui.dbt && BGD.hit(ui.dbt, px, py)) return {k: "draw"};
    for (const b of ui.hand || []) if (BGD.hit(b, px, py)){ ui.sel = ui.sel === b.i ? null : b.i; return null; }
    if (ui.sel != null) for (const b of ui.bw || []) if (BA.dist(px, py, b) < b.r){ const v = S.h[me][ui.sel]; ui.sel = null; return {k: "play", v, b: b.k}; }
    return null; }
});
