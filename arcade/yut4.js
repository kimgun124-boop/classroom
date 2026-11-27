/* =====================================================================
   🎋 다같이 윷놀이 (2026.11.27) — 2~6명 개인전 (빈자리는 🤖 컴퓨터)
   - 🧒 한 기기에서 돌려 가며 · 🌐 각자 기기로 (온라인 방, 방장 기기가 심판 — 윷은 방장 기기가 던져요)
   - 규칙은 1:1 윷놀이와 같아요: 도·개·걸·윷·모 · 빽도 · 윷·모·잡기는 한 번 더 · 내 말은 업고 · 모서리 지름길
   - 4명이면 남의 말을 모두 잡을 수 있어요 (누구 말이든 같은 자리에 서면 잡혀요)
   - 말 수(2·3·4개)를 골라 수업 시간에 맞춰요 · 한 명이 다 들어오면 끝, 나머지는 남은 거리로 순위
   - 친구 기기는 '하고 싶은 일'(던지기 · 말 옮기기)만 방장 기기에 보내요 (작아서 렉 없음)
   ===================================================================== */
GAME.yt4 = Object.assign({}, GAME.yt, {id: "yt4", n: "다같이 윷놀이"});
GAME.yt.tag = "🆕 우리 전통 놀이 · 👨‍👩‍👧‍👦 최대 6명 · 🤖 컴퓨터와도";
B2.ST.g = B2.ST.g || ["#8ce99a", "#2b8a3e"]; B2.ST.yy = ["#fff9c4", "#f0c400"];
const YT4C = [{k: "o", e: "🟠", n: "주황", c: "#ff922b"}, {k: "bl", e: "🔵", n: "파랑", c: "#4dabf7"}, {k: "g", e: "🟢", n: "초록", c: "#51cf66"}, {k: "v", e: "🟣", n: "보라", c: "#9775fa"}, {k: "yy", e: "🟡", n: "노랑", c: "#fcc419"}, {k: "r", e: "🔴", n: "빨강", c: "#ff6b6b"}];

NG.defs.yt4 = () => {
  const O = NG.opt, party = O.party || null, myIdx = party === "guest" ? O.idx : 0, SIDS = NG.sids.slice(), N = SIDS.length, BOTS = O.bots || [], M = Math.max(2, Math.min(4, O.mode || 4));
  const NM = {"-1": "빽도", 1: "도", 2: "개", 3: "걸", 4: "윷", 5: "모"}, END = 99;
  const NEXT = {0: END, 19: END, 20: 21, 21: 22, 23: 24, 24: 15, 25: 26, 26: 22, 27: 28, 28: END}; for (let i = 1; i < 19; i++) NEXT[i] = i + 1;
  const BACK = {0: 19, 1: 0, 5: 4, 10: 9, 15: 14, 20: 5, 21: 20, 22: 21, 23: 22, 24: 23, 25: 10, 26: 25, 27: 22, 28: 27}; for (let i = 2; i < 20; i++) if (BACK[i] === undefined) BACK[i] = i - 1;
  const PXY = []; for (let i = 0; i <= 28; i++){ let p;
    if (i === 0) p = [1, 1]; else if (i < 5) p = [1, 1 - i/5]; else if (i === 5) p = [1, 0]; else if (i < 10) p = [1 - (i - 5)/5, 0]; else if (i === 10) p = [0, 0];
    else if (i < 15) p = [0, (i - 10)/5]; else if (i === 15) p = [0, 1]; else if (i < 20) p = [(i - 15)/5, 1];
    else { const L = {20: [1, 0, 1], 21: [1, 0, 2], 22: [1, 0, 3], 23: [0, 1, 2], 24: [0, 1, 1], 25: [0, 0, 1], 26: [0, 0, 2], 27: [1, 1, 2], 28: [1, 1, 1]}[i]; p = [L[0] + (.5 - L[0])*L[2]/3, L[1] + (.5 - L[1])*L[2]/3]; }
    PXY.push(p); }
  function walk(p, n){
    if (n < 0) return p >= 0 && p <= 28 ? [BACK[p]] : null;
    const out = []; let cur = p, prev = -2;
    for (let k = 0; k < n; k++){ let nx;
      if (cur === -1) nx = 1; else if (k === 0 && cur === 5) nx = 20; else if (k === 0 && cur === 10) nx = 25; else if (cur === 22) nx = k === 0 || prev === 26 ? 27 : 23; else nx = NEXT[cur];
      out.push(nx); if (nx === END) return out; prev = cur; cur = nx; }
    return out; }
  const DIST = {}; for (let p = -1; p <= 28; p++){ for (let n = 1; n < 40; n++){ const w = walk(p, n); if (w[w.length - 1] === END){ DIST[p] = n; break; } } } DIST[END] = 0;
  const roll = () => { const f = [0, 1, 2, 3].map(() => Math.random() < .5); const k = f.filter(Boolean).length; return k === 0 ? 5 : k === 4 ? 4 : k === 1 && f[0] ? -1 : k; };

  /* ---------- 판 상태 (심판 기기) ---------- */
  let S, winT = 0, sel = 0, pend = null, aSeq = 0, lastA = {}, aiT = 0, sendT = 0, dirtyN = false, endDone = false, offT = {};
  const fresh = () => ({n: N, m: M, pc: Array.from({length: N}, () => Array(M).fill(-1)), turn: 0, rs: [], ph: "th", bonus: 0, win: null, msg: "", msgT: 0, thr: 0, thrR: 0, mvA: null, ord: null, v: 0});
  const at = (s, p) => S.pc[s].map((q, k) => q === p ? k : -1).filter(k => k >= 0);
  const usable = (s, r) => r > 0 ? S.pc[s].some(p => p !== END) : S.pc[s].some(p => p >= 0 && p <= 28);
  const canUse = (s, r, k) => { const p = S.pc[s][k]; return p !== END && (r > 0 || p >= 0); };
  const busy = () => S.thr > 0 || !!S.mvA;
  const isBot = i => BOTS.includes(i);
  const mine = i => party === "guest" ? i === myIdx : party === "host" ? i === 0 : !isBot(i);
  const canAct = () => !S.win && !busy() && mine(S.turn) && !NG.ended;
  const say = (t, k = 110) => { S.msg = t; S.msgT = k; };
  const nm = i => isBot(i) ? `🤖 컴퓨터 ${YT4C[i].n}` : who(noOf_(SIDS[i]));
  function nextTurn(){ S.turn = (S.turn + 1) % N; S.ph = "th"; S.rs = []; S.bonus = 0; }
  function tidy(){ if (S.ph !== "mv") return; const L = S.rs.filter(r => usable(S.turn, r)); if (L.length !== S.rs.length){ if (!L.length) say("😅 움직일 말이 없어요", 80); S.rs = L; }
    if (!S.rs.length){ if (S.bonus > 0){ S.bonus--; S.ph = "th"; } else nextTurn(); } }
  function rank(){ return [...Array(N).keys()].map(i => ({i, done: S.pc[i].filter(p => p === END).length, left: S.pc[i].reduce((a, p) => a + (DIST[p] ?? 30), 0)}))
    .sort((a, b) => b.done - a.done || a.left - b.left).map(o => o.i); }
  /* a: ["th"] · ["mv", 결과 번호, 말 번호] — 심판 기기에서만 실행 */
  function act(a){ if (S.win) return false; const t = S.turn;
    if (a[0] === "th"){ if (S.ph !== "th" || S.thr) return false; const r = roll(); S.rs.push(r); S.thr = 42; S.thrR = r;
      if (r >= 4) say(`🎉 ${NM[r]}! 한 번 더 던져요`, 90); else { S.ph = "mv"; S.msgT = 0; } tidy(); S.v++; return true; }
    if (a[0] === "mv"){ const i = +a[1], k = +a[2], r = S.rs[i]; if (S.ph !== "mv" || r === undefined || !(k >= 0 && k < M) || !canUse(t, r, k)) return false;
      const from = S.pc[t][k], route = walk(from, r), to = route[route.length - 1], grp = from >= 0 ? at(t, from) : [k];
      grp.forEach(j => S.pc[t][j] = to); S.rs.splice(i, 1); S.mvA = {who: t, grp, pts: [from, ...route], t: 0}; S.msgT = 0;
      if (to !== END){ let got = 0, whoG = []; for (let o = 0; o < N; o++){ if (o === t) continue; const h = at(o, to); if (h.length){ h.forEach(j => S.pc[o][j] = -1); got += h.length; whoG.push(YT4C[o].e); } }
        if (got){ S.bonus++; say(`💥 ${whoG.join("")} ${got > 1 ? `${got}개 ` : ""}잡았어요! 한 번 더`, 110); S.fx = {k: "hit", v: S.v + 1}; } }
      else { say(`🏁 ${YT4C[t].e} ${grp.length}개 들어왔어요!`, 90); S.fx = {k: "gold", v: S.v + 1}; }
      if (S.pc[t].every(p => p === END)){ S.win = {w: t}; S.ord = rank(); say(`🏆 ${YT4C[t].e} ${nm(t)} 우승!`, 999); }
      else { if (S.bonus > 0 && !S.rs.length){ S.bonus--; S.ph = "th"; } tidy(); }
      S.v++; return true; }
    return false; }
  function doAct(a){ if (party === "guest"){ PARTY.sendIn({a: [++aSeq, ...a]}, true); pend = null; return; } if (act(a)) { pend = null; dirtyN = true; snd(a[0]); } }
  const snd = k => { try { if (k === "th") tone(300, 500, .08, "triangle", .08); } catch(e) {} };

  /* ---------- 🤖 컴퓨터 (이 판의 모든 상대를 생각해요) ---------- */
  function ai(){
    if (S.ph === "th") return ["th"];
    const s = S.turn, C = [], tried = new Set();
    const danger = (p, stk) => { if (p === END || p < 0) return 0; let d = 0; for (let o = 0; o < N; o++){ if (o === s) continue; for (const q of S.pc[o]){ if (q === END) continue; for (let n = 1; n <= 5; n++){ const w = walk(q, n); if (w && w[w.length - 1] === p){ d += [0, 4, 6, 4, 1, 1][n]; break; } } } } return d*stk; };
    S.rs.forEach((r, i) => { for (let k = 0; k < M; k++){ if (!canUse(s, r, k)) continue; const key = r + ":" + S.pc[s][k]; if (tried.has(key)) continue; tried.add(key);
      const from = S.pc[s][k], w = walk(from, r), to = w[w.length - 1], stk = from >= 0 ? at(s, from).length : 1;
      let v = (DIST[from] ?? 30) - (to === END ? 0 : DIST[to] ?? 30);
      if (to === END) v += 60*stk; else { for (let o = 0; o < N; o++) if (o !== s) v += S.pc[o].filter(p => p === to).length*90; if (to === 5 || to === 10 || to === 22) v += 18; v += at(s, to).length*12; v -= danger(to, stk)*5; }
      if (from >= 0) v += danger(from, stk)*4; if (r < 0) v -= 6;
      C.push({a: ["mv", i, k], v: v + Math.random()*6}); } });
    C.sort((a, b) => b.v - a.v); return C.length ? C[0].a : null; }

  /* ---------- 화면 배치 ---------- */
  let W = 1280, H = 760, land = true, BX, CARD = [], TB, CH = [];
  function layout(w, h){ land = w >= h*1.02;
    const rows = Math.ceil(N/2);
    if (land){ W = 1280; H = 760; BX = {x: 20, y: 20, s: 720}; const px = 768, pw = W - px - 20, st = N > 4 ? 76 : 108; CARD = [...Array(N).keys()].map(i => ({x: px, y: 20 + i*st, w: pw, h: st - 8}));
      const uy = 20 + Math.max(4*108, N*st) + 6 - (N > 4 ? 0 : 0); TB = {x: px, y: Math.min(uy, H - 200), w: pw, h: 88}; CH = {x: px, y: TB.y + 98, w: pw, h: 62}; }
    else { W = 760; const cw = (W - 36)/2; CARD = [...Array(N).keys()].map(i => ({x: 12 + (i % 2)*(cw + 12), y: 12 + Math.floor(i/2)*104, w: cw, h: 96}));
      const by = 20 + rows*104; H = by + 720 + 280; BX = {x: 20, y: by, s: 720}; TB = {x: 20, y: by + 740, w: W - 40, h: 96}; CH = {x: 20, y: by + 850, w: W - 40, h: 70}; }
    self.W = W; self.H = H; }
  const geo = () => { const pad = BX.s*.09, bx = BX.x + pad, by = BX.y + pad, bs = BX.s - 2*pad; return {xy: p => [bx + PXY[p][0]*bs, by + PXY[p][1]*bs], r: BX.s*.038}; };
  const chips = () => { const n = Math.max(1, S.rs.length), cw = Math.min(110, CH.w/n - 8); return S.rs.map((r, i) => ({x: CH.x + i*(cw + 8), y: CH.y, w: cw, h: CH.h, t: NM[r], i})); };
  const inR = (x, y, b) => b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  /* 같은 자리에 여러 사람 말이 있으면 살짝 비켜 그려요 */
  const OFF = [[-.6, -.45], [.6, -.45], [-.6, .5], [.6, .5], [0, -.75], [0, .8]];

  function drawBoard(g, can){ const Q = geo(), S0 = BX.s;
    B2.wood(g, BX.x, BX.y, S0, S0, 26, "#f8e7bd", "#e2bd76");
    g.save(); rrect(g, BX.x + 10, BX.y + 10, S0 - 20, S0 - 20, 20); g.lineWidth = 3; g.strokeStyle = "rgba(138,90,34,.35)"; g.setLineDash([10, 8]); g.stroke(); g.restore();
    g.strokeStyle = "rgba(120,70,20,.55)"; g.lineWidth = 6; g.lineCap = "round"; g.beginPath();
    [[0, 5], [5, 10], [10, 15], [15, 0], [5, 15], [10, 0]].forEach(([a, z]) => { const [x1, y1] = Q.xy(a), [x2, y2] = Q.xy(z); g.moveTo(x1, y1); g.lineTo(x2, y2); }); g.stroke(); g.lineCap = "butt";
    for (let p = 0; p <= 28; p++){ const [x, y] = Q.xy(p), big = (p % 5 === 0 && p <= 15) || p === 22, r = Q.r*(big ? 1.45 : 1);
      g.beginPath(); g.arc(x, y + 3, r, 0, 7); g.fillStyle = "rgba(90,50,10,.25)"; g.fill();
      g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = big ? "#d9480f" : "#fffaf0"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#8a5a22"; g.stroke();
      if (big){ g.beginPath(); g.arc(x, y, r*.55, 0, 7); g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = 2; g.stroke(); } }
    { const [x, y] = Q.xy(0); outlined(g, "출발·도착", x - Q.r*.6, y + Q.r*1.9, 15, "#7c2d12"); }
    if (pend && can){ const [x, y] = Q.xy(pend.to === END ? 0 : pend.to); B2.ring(g, x, y, Q.r*2, "#2f9e44", 6); outlined(g, pend.to === END ? "🏁 완주! 한 번 더 톡" : "한 번 더 톡!", x, y - Q.r*2.6, 20, "#2f9e44"); }
    const hide = S.mvA ? new Set(S.mvA.grp.map(k => S.mvA.who + ":" + k)) : null;
    for (let s = 0; s < N; s++){ const seen = {};
      S.pc[s].forEach((p, k) => { if (p < 0 || p === END || (hide && hide.has(s + ":" + k))) return; seen[p] = (seen[p] || 0) + 1; });
      Object.entries(seen).forEach(([p, n]) => { p = +p; const [x0, y0] = Q.xy(p), crowd = SIDS.some((_, o) => o !== s && S.pc[o].includes(p)), x = x0 + (crowd ? OFF[s][0]*Q.r*1.3 : 0), y = y0 - Q.r*.2 + (crowd ? OFF[s][1]*Q.r*1.3 : 0);
        piece(g, x, y, Q.r*1.15, s);
        if (n > 1){ B2.dot(g, x + Q.r, y - Q.r, Q.r*.62, "#fff"); outlined(g, `${n}`, x + Q.r, y - Q.r, Q.r*.95, "#d9480f"); }
        if (can && s === S.turn && S.ph === "mv" && S.rs.length && !pend) B2.ring(g, x, y, Q.r*1.4 + Math.sin(NG.frame*.15)*2, "#ffd43b", 4); }); }
    if (S.mvA){ const A = S.mvA, t = Math.min(A.t, A.pts.length - 1), a = Math.floor(t), f = t - a, P = q => q === END ? Q.xy(0) : q < 0 ? homeXY(A.who) : Q.xy(q);
      const [x1, y1] = P(A.pts[a]), [x2, y2] = P(A.pts[Math.min(a + 1, A.pts.length - 1)]), hop = Math.sin(f*Math.PI)*Q.r*1.8;
      piece(g, x1 + (x2 - x1)*f, y1 + (y2 - y1)*f - hop, Q.r*1.25, A.who); if (A.grp.length > 1) outlined(g, `x${A.grp.length}`, x1 + (x2 - x1)*f + Q.r, y1 + (y2 - y1)*f - hop - Q.r, Q.r); } }
  const homeXY = s => { const C = CARD[s]; return [C.x + C.w*.62, C.y + C.h*.7]; };
  function piece(g, x, y, r, s, a = 1){ g.globalAlpha = a; g.beginPath(); g.ellipse(x, y + r*.85, r*.85, r*.3, 0, 0, 7); g.fillStyle = "rgba(0,0,0,.22)"; g.fill(); g.globalAlpha = 1;
    B2.stone(g, x, y, r, YT4C[s].k, a); g.globalAlpha = a*.55; g.beginPath(); g.ellipse(x - r*.3, y - r*.38, r*.32, r*.18, -.5, 0, 7); g.fillStyle = "#fff"; g.fill(); g.globalAlpha = 1; }
  function drawCard(g, i, can){ const C = CARD[i], on = S.turn === i && !S.win, wait = S.pc[i].filter(p => p === -1).length, done = S.pc[i].filter(p => p === END).length, col = YT4C[i].c;
    g.save(); rrect(g, C.x, C.y, C.w, C.h, 18); g.fillStyle = on ? "rgba(255,212,59,.2)" : "rgba(255,255,255,.07)"; g.fill(); g.lineWidth = on ? 5 : 2; g.strokeStyle = on ? "#ffd43b" : col + "88"; g.stroke();
    g.fillStyle = col; rrect(g, C.x, C.y + 14, 8, C.h - 28, 4); g.fill(); g.restore();
    const fr = Math.min(34, C.h*.36), fx = C.x + 22 + fr, fy = C.y + C.h*.45;
    if (isBot(i)) outlined(g, "🤖", fx, fy, fr*1.4); else try { faceAt(g, SIDS[i], fx, fy, fr, on ? "#ffd43b" : null); } catch(e) {}
    piece(g, fx + fr*.8, fy + fr*.75, fr*.42, i);
    const tx = fx + fr + 14, me = party ? i === myIdx : false;
    let name = nm(i); if (name.length > 9) name = name.slice(0, 9) + "…";
    outlined(g, `${name}${me ? " (나)" : ""}`, tx, C.y + C.h*.27, Math.min(24, C.h*.24), "#fff", undefined, "left");
    outlined(g, on ? (S.ph === "th" ? "🎋 던질 차례!" : "🟡 말 옮길 차례!") : `🏁 ${done}/${M}`, tx, C.y + C.h*.55, Math.min(18, C.h*.18), on ? "#ffe066" : "#d0bfff", undefined, "left");
    const hx = C.x + C.w*.5, hr = Math.min(13, C.h*.13), canHome = can && on && S.ph === "mv" && S.rs.length && wait && S.rs[sel] > 0;
    if (canHome){ g.save(); rrect(g, hx - 10, C.y + C.h*.62, C.w*.5 - 6, C.h*.34, 10); g.fillStyle = "rgba(255,212,59,.25)"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#ffd43b"; g.stroke(); g.restore(); }
    for (let k = 0; k < M; k++){ const x = hx + 6 + k*hr*2.6, y = C.y + C.h*.79; piece(g, x, y, hr, i, k < wait ? 1 : k < wait + done ? .35 : .1); if (k >= wait && k < wait + done) outlined(g, "🏁", x, y, hr*1.1); }
    if (canHome) outlined(g, "👆 새 말", C.x + C.w - 50, C.y + C.h*.3, 16, "#ffe066"); }
  function drawUI(g, can){ const T = TB;
    if (S.thr > 0){ const k = 42 - S.thr, cx = T.x + T.w/2, cy = T.y + T.h/2; rrect(g, T.x, T.y, T.w, T.h, 16); g.fillStyle = "rgba(255,255,255,.06)"; g.fill();
      for (let s = 0; s < 4; s++){ const a = k*.5 + s*1.7, x = cx + (s - 1.5)*Math.min(34, T.w/8), y = cy - Math.abs(Math.sin(k*.18 + s))*T.h*.35;
        g.save(); g.translate(x, y); g.rotate(Math.sin(a)*.7); rrect(g, -9, -T.h*.38, 18, T.h*.76, 8); g.fillStyle = Math.sin(a*2) > 0 ? "#f8f0dc" : "#8a5a22"; g.fill(); g.lineWidth = 2; g.strokeStyle = "rgba(0,0,0,.3)"; g.stroke(); g.restore(); }
      if (S.thr < 16) outlined(g, NM[S.thrR] + "!", cx, cy, 56, S.thrR >= 4 ? "#ffe066" : "#fff"); }
    else bdBtn(g, {x: T.x, y: T.y, w: T.w, h: T.h, t: can && S.ph === "th" ? "🎋 윷 던지기! (스페이스)" : S.win ? "🏆 끝!" : mine(S.turn) && S.ph === "mv" ? "🟡 말을 골라요" : `⏳ ${YT4C[S.turn].e} ${nm(S.turn).slice(0, 8)} 차례`, p: can && S.ph === "th" ? 1 : 0, off: !(can && S.ph === "th")}, false);
    if (!S.thr) chips().forEach(c => bdBtn(g, Object.assign({p: 0, off: !can}, c), c.i === sel && S.rs.length > 1));
    const hint = S.win ? "" : can ? (S.ph === "th" ? "👆 윷을 던져요!" : S.rs.length > 1 ? "👇 쓸 결과를 고르고 말을 톡톡!" : "🟡 움직일 말을 톡톡! (새 말은 내 이름 칸)") : "";
    if (hint) outlined(g, hint, CH.x + CH.w/2, CH.y + CH.h + (land ? 26 : 30), 20, "#ffe066"); }
  function draw(g){ if (!S) return;
    const can = canAct(), bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#2a1d5c"); bg.addColorStop(1, "#151033"); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    drawBoard(g, can); for (let i = 0; i < N; i++) drawCard(g, i, can); drawUI(g, can);
    if (S.msg && S.msgT > 0){ const a = Math.min(1, S.msgT/15); g.globalAlpha = S.msgT >= 900 ? 1 : a; g.fillStyle = "rgba(10,6,30,.6)"; g.fillRect(BX.x, BX.y + BX.s/2 - 44, BX.s, 88); outlined(g, S.msg, BX.x + BX.s/2, BX.y + BX.s/2, Math.min(44, BX.s/14), "#ffe066"); g.globalAlpha = 1; }
    else if (!S.win && !mine(S.turn) && !busy()){ g.fillStyle = "rgba(10,6,30,.55)"; g.fillRect(BX.x, BX.y + BX.s - 50, BX.s, 40); outlined(g, `⏳ ${YT4C[S.turn].e} ${nm(S.turn)} 차례예요`, BX.x + BX.s/2, BX.y + BX.s - 30, 22, "#d0bfff"); } }

  /* ---------- 진행 ---------- */
  let lastFx = 0;
  function step(){ if (!S) return;
    if (S.msgT > 0 && S.msgT < 900) S.msgT--;
    if (S.thr > 0){ S.thr--; if (S.thr === 0) try { tone(700, 900, .1, "triangle", .1); } catch(e) {} }
    if (S.mvA){ S.mvA.t += .14; if (S.mvA.t >= S.mvA.pts.length - 1){ S.mvA = null; try { SFX.pong(); } catch(e) {} } }
    if (S.fx && S.fx.v !== lastFx){ lastFx = S.fx.v; setTimeout(() => { try { SFX[S.fx && S.fx.k === "gold" ? "gold" : "hit"](); } catch(e) {} }, 240); }
    if (party === "guest") return;
    /* 🌐 친구 기기가 보낸 일 */
    if (party === "host" && O.remote) for (const k in O.remote){ const i = +k, r = PARTY.remoteIn(i);
      if (r && r.open) offT[i] = 0; else offT[i] = (offT[i] || 0) + 1;
      const a = r && r.m && r.m.a; if (!a || a[0] <= (lastA[i] || 0) || busy()) continue; lastA[i] = a[0]; if (S.turn === i && act(a.slice(1))){ pend = null; dirtyN = true; snd(a[1]); } }
    /* 🤖 컴퓨터 차례 (연결이 10초 넘게 끊긴 친구 차례도 대신 해 줘요) */
    const auto = isBot(S.turn) || (party === "host" && O.remote && O.remote[S.turn] != null && (offT[S.turn] || 0) > 600);
    if (!S.win && auto && !busy()){ if (++aiT > (S.ph === "th" ? 40 : 30)){ aiT = 0; const a = ai(); if (a && act(a)){ dirtyN = true; snd(a[0]); } else if (!a){ S.rs = []; tidy(); } } } else if (!auto) aiT = 0;
    if (party === "host" && (dirtyN || ++sendT >= (busy() ? 4 : 20))){ sendT = 0; dirtyN = false; PARTY.sendSnap({S}, [], 0); }
    if (S.win && !busy() && !endDone && ++winT > 100){ endDone = true; finish(); } }
  function finish(){ const ord = S.ord || rank(), coins = {};
    if (party !== "guest") ord.forEach((i, pl) => { if (!isBot(i)) try { coins[i] = Store.earn(SIDS[i], [20, 10, 6, 4, 3, 2][pl] + (N >= 3 && pl === 0 ? 10 : 0) + (N >= 5 && pl === 0 ? 10 : 0)); } catch(e) {} });
    if (party === "host"){ PARTY.sendSnap({S}, [], 0); PARTY.sendAll({t: "end", w: S.win.w, wins: ord, coins}); }
    showEnd(ord, coins); }
  function showEnd(ord, coins = {}){ if (NG.ended) return;
    const guest = party === "guest", rows = ord.map((i, pl) => { const done = S.pc[i].filter(p => p === END).length;
      return `<div class="sk-row${(party ? i === myIdx : !isBot(i) && i === 0) ? " me" : ""}"><span class="rk">${["🥇", "🥈", "🥉", "4", "5", "6"][pl]}</span>${isBot(i) ? `<span class="f">🤖</span>` : `<span class="avf">${avHTMLof(SIDS[i], {still: true, face: true})}</span>`}
        <b>${YT4C[i].e} ${esc(nm(i))}</b><span class="v">🏁 ${done}/${M}</span>${coins[i] ? `<small>🪙 +${coins[i]}</small>` : ""}</div>`; }).join("");
    $("#ngOver").innerHTML = `${NG.conf ? NG.conf(60) : ""}<div class="ng-box sk-res"><h3>🏆 ${YT4C[ord[0]].e} ${esc(nm(ord[0]))} 우승!</h3><div class="sk-rows">${rows}</div>
      <div class="info">말을 모두 먼저 들여보낸 친구가 1등 · 나머지는 들어온 말과 남은 거리로 순위를 정해요</div>
      <div class="arc-row">${guest ? `<button class="arc-btn" data-yt="wait">⏳ 방장이 다시 시작하길 기다려요</button>` : `<button class="arc-btn p" data-yt="again">🔁 한 판 더</button>`}<button class="arc-btn" data-yt="home">🏠 홈으로</button></div></div>`;
    $("#ngOver").hidden = false; NG.ended = true;
    $("#ngOver").onclick = e => { const b = e.target.closest("[data-yt]"); if (!b) return; e.stopPropagation();
      if (b.dataset.yt === "home"){ PARTY.leave(); NG.close(); }
      else if (b.dataset.yt === "again"){ if (party === "host") PARTY.again(); else NG.play("yt4", SIDS, Object.assign({}, O)); } }; }

  /* ---------- 손가락 · 키보드 ---------- */
  function tapPiece(x, y){ const Q = geo(), r = S.rs[sel]; let k = -1;
    for (let i = 0; i < N; i++) if (i === S.turn && inR(x, y, CARD[i])) k = S.pc[i].indexOf(-1);
    if (k < 0) for (let p = 0; p <= 28 && k < 0; p++){ const [px, py] = Q.xy(p); if ((x - px)**2 + (y - py)**2 < (Q.r*2.1)**2) k = S.pc[S.turn].findIndex(q => q === p); }
    if (k < 0 || !canUse(S.turn, r, k)){ if (k >= 0) try { tone(220, 180, .06, "square", .05); } catch(e) {} return; }
    const key = `${sel}:${S.pc[S.turn][k]}`;
    if (pend && pend.key === key){ doAct(["mv", sel, k]); return; }
    pend = {key, k, to: walk(S.pc[S.turn][k], r).pop()}; try { tone(900, 900, .03, "sine", .05); } catch(e) {} }
  const self = {
    W, H, maxSteps: 4, layout,
    init(){ S = fresh(); winT = 0; sel = 0; pend = null; aSeq = 0; lastA = {}; endDone = false; offT = {};
      if (party) PARTY.attach(self, null);
      say(`🎋 다같이 윷놀이 · ${N}명 · 말 ${M}개`, 100); },
    step, draw,
    down(x, y){ if (!S || NG.ended) return; const can = canAct();
      if (can && S.ph === "th" && !S.thr && inR(x, y, TB)){ doAct(["th"]); return; }
      for (const c of chips()) if (inR(x, y, c)){ sel = c.i; pend = null; return; }
      if (can && S.ph === "mv" && S.rs.length) tapPiece(x, y); },
    key(code, d){ if (!d || !S) return false; const can = canAct();
      if ((code === "Space" || code === "Enter") && can && S.ph === "th" && !S.thr){ doAct(["th"]); return true; }
      const n = {Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Digit5: 4}[code]; if (n !== undefined && n < S.rs.length){ sel = n; pend = null; return true; }
      return false; },
    hud(){ return S ? `🎋 다같이 윷놀이 · ${N}명 · 말 ${M}개${party ? " · 🌐 온라인 방" : ""} · 지금 ${YT4C[S.turn].e} ${esc(nm(S.turn))} 차례` : ""; },
    /* 🌐 친구 기기: 방장 판을 그대로 받아요 (애니메이션은 내 기기에서 이어 그려요) */
    apply(d){ if (party !== "guest" || !d || !d.s || !d.s.S) return; const T = d.s.S; if (S && T.v < S.v) return;
      const turnCh = !S || T.turn !== S.turn || T.v !== S.v; if (S && T.v === S.v){ T.thr = S.thr; T.mvA = S.mvA; T.msgT = S.msgT; } S = T; if (turnCh){ pend = null; sel = Math.min(sel, Math.max(0, S.rs.length - 1)); } },
    end(w, wins, m){ if (party !== "guest") return; showEnd(wins && wins.length ? wins : rank(), (m && m.coins) || {}); },
    dbg: {S: () => S, act, ai, walk}
  };
  return self;
};

/* ---------- 🎋 시작 창: 1:1 대결 창에 '다같이 윷놀이' 단추 ---------- */
const YT4 = {
  m: 4, nb: 2, nf: 0,
  menu(){
    const me = ARC.me, box = partyModal("yt4"), body = $("#wbBody");
    const seg = (id, L, v) => `<div class="arc-seg" id="${id}">${L.map(([val, t]) => `<button data-v="${val}" class="${val === v ? "on" : ""}">${t}</button>`).join("")}</div>`;
    body.innerHTML = `<p class="arc-small">도·개·걸·윷·모! <b>2~6명</b>이 각자 말로 겨뤄요. 누구 말이든 같은 자리에 서면 <b>잡혀요</b>. 내 말을 모두 먼저 들여보내면 우승!</p>
      <div class="wb-row"><span>🐎 말 개수 <small style="opacity:.7">(적을수록 빨리 끝나요)</small></span>${seg("ytM", [[2, "2개"], [3, "3개"], [4, "4개"]], this.m)}</div>
      <div class="wb-sec"><h3>🧒 이 기기에서 함께 <small>차례가 오면 기기를 돌려 가며 해요</small></h3>
        <div class="wb-row"><span>👥 같이 할 친구</span>${seg("ytF", [[0, "없음"], [1, "1명"], [2, "2명"], [3, "3명"], [4, "4명"], [5, "5명"]], this.nf)}</div>
        <div class="wb-row"><span>🤖 컴퓨터</span>${seg("ytB", [[0, "0명"], [1, "1명"], [2, "2명"], [3, "3명"], [4, "4명"], [5, "5명"]], this.nb)}</div>
        <p class="arc-small" id="ytCnt"></p><button class="arc-btn p" id="ytGo">▶ 시작!</button></div>
      <div class="wb-sec"><h3>🌐 온라인 방 <small>각자 기기로 최대 6명 · 빈자리는 🤖 · ☁️ Firebase 반에서만</small></h3><div id="wbRooms"></div></div>`;
    const fix = () => { if (1 + this.nf + this.nb > 6) this.nb = 6 - 1 - this.nf; if (1 + this.nf + this.nb < 2) this.nb = 1;
      ["ytF", "ytB"].forEach(id => $$(`#${id} button`).forEach(b => b.classList.toggle("on", +b.dataset.v === (id === "ytF" ? this.nf : this.nb))));
      $("#ytCnt").textContent = `👉 모두 ${1 + this.nf + this.nb}명 (나 + 친구 ${this.nf}명 + 🤖 ${this.nb}명)`; };
    const on = (id, f) => { $("#" + id).onclick = e => { const b = e.target.closest("button"); if (!b) return; f(+b.dataset.v); $$(`#${id} button`).forEach(x => x.classList.toggle("on", x === b)); fix(); }; };
    on("ytM", v => { this.m = v; }); on("ytF", v => { this.nf = v; }); on("ytB", v => { this.nb = v; }); fix();
    $("#ytGo").onclick = () => { box.hidden = true; const L = [me], pick = () => { if (L.length > this.nf) return this.start(L, this.nb);
        ARC.pickRival("yt", no => { if (L.includes(no)){ toast("이미 들어온 친구예요"); pick(); return; } L.push(no); pick(); }); }; pick(); };
    PARTY.renderRooms(); box.hidden = false;
  },
  start(humans, nb){ nb = Math.max(0, Math.min(6 - humans.length, nb)); if (humans.length + nb < 2) nb = 1;
    const bots = WB.pickBots(humans, nb), sids = humans.concat(bots).map(sidOf);
    ARC.game = "yt"; ARC.enter && ARC.enter(); ARC.prep(); getAC();
    NG.play("yt4", sids, {bots: bots.map((_, i) => humans.length + i), mode: this.m}); }
};
(function(){
  PARTY.CFG.yt4 = {max: 6, bots: 1, min: 2};
  const start = PARTY.start;
  PARTY.start = function(again){
    if (this.gid !== "yt4") return start.call(this, again);
    if (this.role !== "host") return;
    const live = this.connected().map(p => p.no);
    this.members = [ARC.me].concat(this.members.filter(no => no !== ARC.me && live.includes(no))).slice(0, this.MAX);
    const M = this.members, nb = Math.max(0, Math.min(this.bots, this.MAX - M.length));
    if (M.length + nb < 2){ toast("친구가 들어오거나 🤖 컴퓨터를 넣어야 시작할 수 있어요"); this.renderRooms(); return; }
    this.started = true; Store.fs.updateDoc(this.ref(this.pid), {st: "play", n: M.length}).catch(() => {});
    const botNos = WB.pickBots(M, nb), sids = M.concat(botNos).map(sidOf), bots = botNos.map((_, i) => M.length + i), seed = Math.floor(Math.random()*1e9) + 1, remote = {};
    M.forEach((no, i) => { if (i){ const P = this.peers.get(no); if (P){ P.idx = i; P.inN = 0; P.last = {}; remote[i] = no; this.send(P, {t: "start", g: "yt4", sids, idx: i, bots, seed, mode: YT4.m}); } } });
    this.seq = 0; this.lastGv = -1;
    const md = $("#mdWb"); if (md) md.hidden = true;
    if (!again){ ARC.game = "yt"; ARC.enter(); ARC.prep(); }
    getAC(); NG.play("yt4", sids, {party: "host", local: [0], bots, remote, seed, mode: YT4.m});
  };
  /* 1:1 대결 창(윷놀이)에 '다같이' 단추 */
  const dm = ARC.duelMenu;
  ARC.duelMenu = function(gid){ dm.call(this, gid);
    let b = $("#duYt4"); if (!b){ b = document.createElement("button"); b.id = "duYt4"; b.className = "arc-btn p"; b.style.cssText = "width:100%;margin:6px 0 10px;font-size:19px;background:linear-gradient(135deg,#ff922b,#9775fa)"; $("#duHelp").before(b); }
    b.hidden = gid !== "yt"; b.innerHTML = `👨‍👩‍👧‍👦 다같이 윷놀이 (3~6명) <small style="display:block;font-size:13px;opacity:.9">이 기기에서 돌려 가며 · 각자 기기 온라인 방 · 빈자리는 🤖</small>`;
    b.onclick = () => { this.modal("#mdDuel", false); YT4.menu(); }; };
})();
