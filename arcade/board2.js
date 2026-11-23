/* =====================================================================
   🎲 인기 보드게임 8종 (2026.11.23) — 수업 시간에 쓰기 좋은 '진짜 보드게임'
   ⚪ 오델로 · 🔴 사목 · 🟥 체커 · 🫘 만칼라 · ⚫ 따먹기 바둑 · 🎋 윷놀이 · 🧱 쿼리도 · 🟪 블로커스
   - 모두 bdCtl(공통 진행 틀) 위에서 돌아가요 → 🧒 한 기기에서 둘이 / 🤖 컴퓨터와 / 🌐 다른 기기 친구와
   - 다른 기기와는 '한 수'만 주고받아요 (주사위·윷처럼 운이 있는 건 던진 사람이 결과까지 같이 보내요)
   - 화면은 바뀐 게 있을 때만 다시 그려요
   ===================================================================== */
const B2 = {
  ST: {b: ["#6b6b6b", "#111"], w: ["#fff", "#c9ced4"], r: ["#ff8787", "#c92a2a"], y: ["#ffe066", "#e67700"], bl: ["#74c0fc", "#1864ab"], o: ["#ffc078", "#d9480f"], v: ["#d0bfff", "#6741d9"]},
  stone(g, x, y, r, k, a = 1){
    const C = this.ST[k]; g.globalAlpha = a;
    const gr = g.createRadialGradient(x - r*.35, y - r*.35, r*.1, x, y, r); gr.addColorStop(0, C[0]); gr.addColorStop(1, C[1]);
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = gr; g.fill(); g.lineWidth = Math.max(1, r*.07); g.strokeStyle = "rgba(0,0,0,.35)"; g.stroke(); g.globalAlpha = 1;
  },
  wood(g, x, y, w, h, r, c1 = "#f2c879", c2 = "#d9a24e"){ rrect(g, x, y, w, h, r); const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fill(); },
  dot(g, x, y, r, c){ g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = c; g.fill(); },
  ring(g, x, y, r, c, w){ g.beginPath(); g.arc(x, y, r, 0, 7); g.lineWidth = w; g.strokeStyle = c; g.stroke(); },
  inR: (x, y, b) => b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h,
  btn(g, b, on, off){ bdBtn(g, {x: b.x, y: b.y, w: b.w, h: b.h, t: b.t, p: b.p, off}, on); },
  /* 컴퓨터 수 고르기: 점수표 → 단계(lv)에 따라 살짝 흔들어요 */
  choose(C, lv){ if (!C.length) return null; C.sort((a, b) => b.s - a.s); if (lv === 0 && Math.random() < .45) return C[Math.floor(Math.random()*Math.min(4, C.length))].m; if (lv === 1 && Math.random() < .15 && C.length > 1) return C[1].m; return C[0].m; },
  /* 쪽빛 판 위 안내 글씨 */
  hint(g, B, t, c = "#ffe066"){ g.fillStyle = "rgba(10,6,30,.62)"; g.fillRect(B.x, B.y + B.h - 44, B.w, 40); outlined(g, t, B.x + B.w/2, B.y + B.h - 24, Math.min(24, B.w/26), c); }
};

/* =====================================================================
   ⚪ 오델로 — 상대 돌을 내 돌 사이에 끼우면 뒤집혀요. 돌이 많은 쪽이 승리
   ===================================================================== */
NG.defs.ot = () => {
  const N = 8, D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const WT = [120, -20, 20, 5, 5, 20, -20, 120, -20, -40, -5, -5, -5, -5, -40, -20, 20, -5, 15, 3, 3, 15, -5, 20, 5, -5, 3, 3, 3, 3, -5, 5,
              5, -5, 3, 3, 3, 3, -5, 5, 20, -5, 15, 3, 3, 15, -5, 20, -20, -40, -5, -5, -5, -5, -40, -20, 120, -20, 20, 5, 5, 20, -20, 120];
  let b, turn, last, flipped, passMsg, win, fade = 0;
  function flips(B, i, c){
    if (B[i]) return null; const x = i % N, y = i >> 3, o = 3 - c, out = [];
    for (const [dx, dy] of D8){ let k = 1; const L = [];
      for (;;){ const X = x + dx*k, Y = y + dy*k; if (X < 0 || Y < 0 || X >= N || Y >= N){ L.length = 0; break; } const v = B[Y*N + X];
        if (v === o){ L.push(Y*N + X); k++; continue; } if (v !== c) L.length = 0; break; }
      for (const j of L) out.push(j); }
    return out.length ? out : null;
  }
  const moves = (B, c) => { const M = []; for (let i = 0; i < 64; i++) if (!B[i] && flips(B, i, c)) M.push(i); return M; };
  const put = (B, i, c) => { const F = flips(B, i, c); B[i] = c; for (const j of F) B[j] = c; return F; };
  const cnt = (B, c) => { let n = 0; for (let i = 0; i < 64; i++) if (B[i] === c) n++; return n; };
  function ev(B, c){
    const o = 3 - c; let e = 0; for (let i = 0; i < 64; i++) if (!B[i]) e++;
    if (e <= 10) return (cnt(B, c) - cnt(B, o))*20;
    let s = 0; for (let i = 0; i < 64; i++) if (B[i] === c) s += WT[i]; else if (B[i] === o) s -= WT[i];
    return s + (moves(B, c).length - moves(B, o).length)*9;
  }
  function ab(B, c, d, a, be){
    if (!d) return ev(B, c);
    const M = moves(B, c);
    if (!M.length){ if (!moves(B, 3 - c).length){ const df = cnt(B, c) - cnt(B, 3 - c); return df ? Math.sign(df)*1e6 + df : 0; } return -ab(B, 3 - c, d - 1, -be, -a); }
    M.sort((p, q) => WT[q] - WT[p]); let best = -Infinity;
    for (const m of M){ const C = B.slice(); put(C, m, c); const v = -ab(C, 3 - c, d - 1, -be, -a); if (v > best) best = v; if (v > a) a = v; if (a >= be) break; }
    return best;
  }
  const xy = (i, B) => { const c = B.w/N; return [B.x + c*(i % N + .5), B.y + c*((i >> 3) + .5)]; };
  const G = {
    ar: 1, names: ["⚫ 검은 돌", "⚪ 흰 돌"], undoOK: true, noFlip: true,
    reset(){ b = new Int8Array(64); b[27] = b[36] = 2; b[28] = b[35] = 1; turn = 0; last = -1; flipped = []; passMsg = ""; win = null; this.resigned = null; },
    turn: () => turn,
    apply(mv){
      mv = +mv; const c = turn + 1; if (win || !(mv >= 0 && mv < 64) || !flips(b, mv, c)) return false;
      flipped = put(b, mv, c); last = mv; passMsg = ""; fade = 30; SFX.pong(); if (flipped.length >= 4) setTimeout(() => SFX.pt(), 90);
      if (moves(b, 3 - c).length) turn ^= 1;
      else if (moves(b, c).length) passMsg = `${this.names[1 - turn]} 둘 곳이 없어 한 번 쉬어요`;
      else { const x = cnt(b, 1), y = cnt(b, 2); win = {w: x === y ? -1 : x > y ? 0 : 1, txt: `⚫ ${x} : ${y} ⚪`}; }
      return true;
    },
    over(){ return this.resigned || win; },
    status: () => passMsg ? {t: "⏭️ " + passMsg, c: "#ffd8a8"} : null,
    step(){ if (fade > 0){ fade--; return true; } return false; },
    cardTxt: s => `돌 ${cnt(b, s + 1)}개`,
    chip(g, x, y, r, s){ B2.stone(g, x, y, r, s ? "w" : "b"); },
    down(x, y, B, flip, can){ if (!can) return null; const c = B.w/N, i = Math.floor((x - B.x)/c), j = Math.floor((y - B.y)/c);
      if (i < 0 || j < 0 || i >= N || j >= N) return null; const k = j*N + i; return flips(b, k, turn + 1) ? k : null; },
    draw(g, B, flip, can){
      const c = B.w/N; g.save();
      B2.wood(g, B.x - 10, B.y - 10, B.w + 20, B.h + 20, 16, "#3d2a14", "#24170a");
      const gr = g.createLinearGradient(B.x, B.y, B.x + B.w, B.y + B.h); gr.addColorStop(0, "#2f9e44"); gr.addColorStop(1, "#1f7a33"); g.fillStyle = gr; g.fillRect(B.x, B.y, B.w, B.h);
      g.strokeStyle = "rgba(0,0,0,.45)"; g.lineWidth = 2; g.beginPath(); for (let i = 0; i <= N; i++){ g.moveTo(B.x + i*c, B.y); g.lineTo(B.x + i*c, B.y + B.h); g.moveTo(B.x, B.y + i*c); g.lineTo(B.x + B.w, B.y + i*c); } g.stroke();
      [[2, 2], [6, 2], [2, 6], [6, 6]].forEach(([i, j]) => B2.dot(g, B.x + i*c, B.y + j*c, c*.07, "rgba(0,0,0,.6)"));
      for (let i = 0; i < 64; i++) if (b[i]){ const [x, y] = xy(i, B); B2.stone(g, x, y, c*.42, b[i] === 1 ? "b" : "w");
        if (fade && flipped.includes(i)) B2.ring(g, x, y, c*.42, `rgba(255,212,59,${fade/30})`, c*.08); }
      if (last >= 0){ const [x, y] = xy(last, B); B2.dot(g, x, y, c*.1, "#ff4757"); }
      if (can && !win) for (const m of moves(b, turn + 1)){ const [x, y] = xy(m, B); B2.ring(g, x, y, c*.17, turn ? "rgba(255,255,255,.7)" : "rgba(0,0,0,.55)", c*.05); }
      g.restore();
    },
    ai(lv, done){
      const c = turn + 1, M = moves(b, c); if (!M.length){ done(null); return; }
      if (lv === 0){ done(B2.choose(M.map(m => ({m, s: WT[m] + flips(b, m, c).length*3})), 0)); return; }
      let e = 0; for (let i = 0; i < 64; i++) if (!b[i]) e++;
      const d = lv === 1 ? 2 : e <= 9 ? 9 : 4, C = [];
      for (const m of M){ const B = b.slice(); put(B, m, c); C.push({m, s: -ab(B, 3 - c, d - 1, -Infinity, Infinity) + Math.random()*(lv === 1 ? 12 : 1)}); }
      done(B2.choose(C, lv));
    }
  };
  return bdCtl("ot", G);
};

/* =====================================================================
   🔴 사목 (커넥트 포) — 칸을 골라 떨어뜨려요. 가로·세로·대각선 네 개 먼저!
   ===================================================================== */
NG.defs.c4 = () => {
  const C = 7, R = 6, ORD = [3, 2, 4, 1, 5, 0, 6], DIR = [[0, 1], [1, 0], [1, 1], [1, -1]];
  const WIN4 = []; for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) for (const [dr, dc] of DIR){ const L = []; for (let k = 0; k < 4; k++){ const y = r + dr*k, x = c + dc*k; if (y < 0 || y >= R || x < 0 || x >= C) break; L.push(y*C + x); } if (L.length === 4) WIN4.push(L); }
  let b, turn, win, line, anim, hov = -1, n;
  const drop = (B, c) => { for (let r = R - 1; r >= 0; r--) if (!B[r*C + c]) return r*C + c; return -1; };
  function four(B, i){ const p = B[i], r = (i/C) | 0, c = i % C;
    for (const [dr, dc] of DIR){ const L = [i];
      for (const s of [1, -1]) for (let k = 1; k < 4; k++){ const y = r + dr*k*s, x = c + dc*k*s; if (y < 0 || y >= R || x < 0 || x >= C || B[y*C + x] !== p) break; L.push(y*C + x); }
      if (L.length >= 4) return L; }
    return null; }
  function heur(B, p){ const o = 3 - p; let s = 0;
    for (const L of WIN4){ let a = 0, z = 0; for (const i of L){ if (B[i] === p) a++; else if (B[i] === o) z++; } if (!z) s += [0, 1, 6, 40][a] || 0; else if (!a) s -= [0, 1, 7, 50][z] || 0; }
    for (let r = 0; r < R; r++){ const v = B[r*C + 3]; if (v === p) s += 4; else if (v === o) s -= 4; }
    return s; }
  function nm(B, p, d, a, be, ply){
    let best = -Infinity, any = false;
    for (const c of ORD){ const i = drop(B, c); if (i < 0) continue; any = true; B[i] = p;
      const v = four(B, i) ? 1e6 - ply : d <= 1 ? heur(B, p) : -nm(B, 3 - p, d - 1, -be, -a, ply + 1);
      B[i] = 0; if (v > best) best = v; if (v > a) a = v; if (a >= be) break; }
    return any ? best : 0;
  }
  let geo = null;
  const G = {
    ar: C/(R + 1), names: ["🔴 빨강", "🟡 노랑"], undoOK: true, noFlip: true,
    reset(){ b = new Int8Array(C*R); turn = 0; win = null; line = null; anim = null; n = 0; this.resigned = null; },
    turn: () => turn, busy: () => !!anim,
    apply(mv){ mv = +mv; if (win || !(mv >= 0 && mv < C)) return false; const i = drop(b, mv); if (i < 0) return false;
      b[i] = turn + 1; n++; anim = {i, y: -0.8, v: 0, t: (i/C) | 0};
      const L = four(b, i); if (L){ line = L; win = {w: turn, txt: `${this.names[turn]} 네 개 완성!`}; } else if (n >= C*R) win = {w: -1, txt: "판이 가득 찼어요"};
      turn ^= 1; return true; },
    settle(){ anim = null; },
    over(){ return anim ? null : this.resigned || win; },
    step(){ if (!anim) return false; anim.v += .05; anim.y += anim.v; if (anim.y >= anim.t){ anim = null; SFX.pong(); this.ctl && this.ctl.check(); } return true; },
    cardTxt: s => `${s ? "🟡" : "🔴"} 네 개를 먼저 이어요`,
    chip(g, x, y, r, s){ B2.stone(g, x, y, r, s ? "y" : "r"); },
    move(x, y, B){ const c = Math.floor((x - B.x)/(B.w/C)); hov = c >= 0 && c < C ? c : -1; },
    down(x, y, B, flip, can){ const c = Math.floor((x - B.x)/(B.w/C)); if (c < 0 || c >= C || y < B.y || y > B.y + B.h){ hov = -1; return null; } hov = c; if (!can) return null; return drop(b, c) >= 0 ? c : null; },
    up(){ hov = -1; return null; },
    draw(g, B, flip, can){
      const s = B.w/C, top = B.y + s, cx = c => B.x + s*(c + .5), cy = r => top + s*(r + .5);
      g.save();
      if (can && !win && hov >= 0){ B2.stone(g, cx(hov), B.y + s*.5, s*.4, turn ? "y" : "r", .8); }
      else if (can && !win){ outlined(g, "▼ 놓을 줄을 톡!", B.x + B.w/2, B.y + s*.5, Math.min(30, s*.38), "#ffe066"); }
      rrect(g, B.x - 8, top - 8, B.w + 16, s*R + 16, 18); const gr = g.createLinearGradient(0, top, 0, top + s*R); gr.addColorStop(0, "#3b5bdb"); gr.addColorStop(1, "#253f9e"); g.fillStyle = gr; g.fill();
      for (let r = 0; r < R; r++) for (let c = 0; c < C; c++){ const i = r*C + c, v = anim && anim.i === i ? 0 : b[i];
        if (v) B2.stone(g, cx(c), cy(r), s*.4, v === 1 ? "r" : "y"); else { B2.dot(g, cx(c), cy(r), s*.4, "#14102e"); B2.ring(g, cx(c), cy(r), s*.4, "rgba(0,0,0,.4)", 3); } }
      if (anim){ const c = anim.i % C, v = b[anim.i]; B2.stone(g, cx(c), cy(Math.min(anim.t, anim.y)), s*.4, v === 1 ? "r" : "y"); }
      if (line && !anim){ g.strokeStyle = "#fff"; g.lineWidth = s*.12; g.lineCap = "round"; const P = line.map(i => [cx(i % C), cy((i/C) | 0)]).sort((p, q) => p[0] - q[0] || p[1] - q[1]); g.beginPath(); g.moveTo(...P[0]); g.lineTo(...P[P.length - 1]); g.stroke(); }
      g.restore();
    },
    ai(lv, done){
      const p = turn + 1, B = b.slice(), d = [2, 5, 7][lv] || 5, Cs = [];
      for (const c of ORD){ const i = drop(B, c); if (i < 0) continue; B[i] = p; const v = four(B, i) ? 1e7 : -nm(B, 3 - p, d - 1, -Infinity, Infinity, 1); B[i] = 0; Cs.push({m: c, s: v + Math.random()*(lv ? 2 : 30)}); }
      done(B2.choose(Cs, lv));
    }
  };
  return bdCtl("c4", G);
};

/* =====================================================================
   🟥 체커 — 대각선으로 한 칸씩! 상대 말을 뛰어넘어 잡아요 (잡을 수 있으면 꼭 잡아야 해요)
   끝 줄에 닿으면 👑 왕이 되어 뒤로도 가요
   ===================================================================== */
NG.defs.ck = () => {
  /* 1·2 = 빨강(아래, 위로 가요) 말·왕 · 3·4 = 검정(위, 아래로 가요) 말·왕 */
  let b, turn, quiet, win, path = [], last = null, plies = 0;
  const own = (v, s) => s ? v === 3 || v === 4 : v === 1 || v === 2, king = v => v === 2 || v === 4;
  const dirsOf = v => king(v) ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] : (v === 1 ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]);
  const ok = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  function gen(B, s){
    const J = [], S = [];
    for (let i = 0; i < 64; i++){ const v = B[i]; if (!own(v, s)) continue; const r = i >> 3, c = i & 7;
      const dfs = (r0, c0, P, X, kv) => { let more = false;
        for (const [dr, dc] of dirsOf(kv)){ const r1 = r0 + dr, c1 = c0 + dc, r2 = r0 + 2*dr, c2 = c0 + 2*dc; if (!ok(r2, c2)) continue;
          const m = r1*8 + c1, t = r2*8 + c2; if (!B[m] || own(B[m], s) || X.includes(m) || (B[t] && t !== i)) continue;
          more = true; const crown = !king(kv) && (s ? r2 === 7 : r2 === 0);
          if (crown) J.push({p: [...P, t], x: [...X, m]}); else dfs(r2, c2, [...P, t], [...X, m], kv); }
        if (!more && X.length) J.push({p: P, x: X}); };
      dfs(r, c, [i], [], v);
      for (const [dr, dc] of dirsOf(v)){ const r1 = r + dr, c1 = c + dc; if (ok(r1, c1) && !B[r1*8 + c1]) S.push({p: [i, r1*8 + c1], x: []}); } }
    return J.length ? J : S;
  }
  function doMv(B, m){ const f = m.p[0], t = m.p[m.p.length - 1], v = B[f]; B[f] = 0; for (const x of m.x) B[x] = 0;
    B[t] = (v === 1 && t >> 3 === 0) ? 2 : (v === 3 && t >> 3 === 7) ? 4 : v; }
  function ev(B, s){ let e = 0; for (let i = 0; i < 64; i++){ const v = B[i]; if (!v) continue; const r = i >> 3, mine = own(v, s);
      const val = king(v) ? 175 : 100 + (v === 1 ? 7 - r : r)*4 + ((i & 7) > 1 && (i & 7) < 6 ? 4 : 0); e += mine ? val : -val; } return e; }
  function ab(B, s, d, a, be){
    const M = gen(B, s); if (!M.length) return -1e6 - d; if (!d) return ev(B, s);
    let best = -Infinity; for (const m of M){ const C = B.slice(); doMv(C, m); const v = -ab(C, 1 - s, d - 1, -be, -a); if (v > best) best = v; if (v > a) a = v; if (a >= be) break; }
    return best; }
  const cnt = s => { let n = 0; for (let i = 0; i < 64; i++) if (own(b[i], s)) n++; return n; };
  const sq = (i, B, flip) => { const c = B.w/8; let r = i >> 3, k = i & 7; if (flip){ r = 7 - r; k = 7 - k; } return [B.x + c*(k + .5), B.y + c*(r + .5)]; };
  const G = {
    ar: 1, names: ["🔴 빨강", "⚫ 검정"], undoOK: true,
    reset(){ b = new Int8Array(64); for (let i = 0; i < 64; i++){ const r = i >> 3, c = i & 7; if ((r + c) % 2){ if (r < 3) b[i] = 3; else if (r > 4) b[i] = 1; } }
      turn = 0; quiet = 0; win = null; path = []; last = null; plies = 0; this.resigned = null; },
    turn: () => turn,
    apply(mv){ if (win || !mv || !Array.isArray(mv.p)) return false;
      const m = gen(b, turn).find(x => x.p.length === mv.p.length && x.p.every((v, k) => v === mv.p[k])); if (!m) return false;
      const f = b[m.p[0]]; doMv(b, m); last = m; path = []; plies++; quiet = m.x.length || (!king(f) && king(b[m.p[m.p.length - 1]])) ? 0 : quiet + 1;
      m.x.length ? SFX.hit() : SFX.pong(); if (!king(f) && king(b[m.p[m.p.length - 1]])) setTimeout(() => SFX.gold(), 120);
      turn ^= 1;
      if (!gen(b, turn).length) win = {w: 1 - turn, txt: cnt(turn) ? `${this.names[turn]} 움직일 말이 없어요` : `${this.names[turn]} 말을 모두 잡았어요`};
      else if (quiet >= 60) win = {w: -1, txt: "오랫동안 잡지 못했어요"};
      return true; },
    over(){ return this.resigned || win; },
    status: () => last && last.x.length >= 2 ? {t: `⚡ ${last.x.length}개 연속 잡기!`, c: "#ffe066"} : null,
    cardTxt: s => { let k = 0; for (let i = 0; i < 64; i++) if (own(b[i], s) && king(b[i])) k++; return `말 ${cnt(s)}개${k ? ` · 👑${k}` : ""}`; },
    chip(g, x, y, r, s){ B2.stone(g, x, y, r, s ? "b" : "r"); },
    down(x, y, B, flip, can){
      if (!can) return null; const c = B.w/8; let k = Math.floor((x - B.x)/c), r = Math.floor((y - B.y)/c); if (k < 0 || r < 0 || k > 7 || r > 7) return null;
      if (flip){ k = 7 - k; r = 7 - r; } const i = r*8 + k, M = gen(b, turn);
      if (own(b[i], turn)){ path = M.some(m => m.p[0] === i) ? [i] : []; if (!path.length){ tone(220, 180, .06, "square", .05); } return null; }
      if (!path.length) return null;
      const cand = M.filter(m => path.every((v, j) => m.p[j] === v) && m.p[path.length] === i); if (!cand.length) return null;
      path = [...path, i]; const done = cand.find(m => m.p.length === path.length);
      if (done && cand.length === 1){ const p = path; path = []; return {p}; }
      tone(900, 900, .03, "sine", .05); return null; },
    draw(g, B, flip, can){
      const c = B.w/8; g.save(); B2.wood(g, B.x - 12, B.y - 12, B.w + 24, B.h + 24, 16, "#5c3a1a", "#3b2410");
      for (let r = 0; r < 8; r++) for (let k = 0; k < 8; k++){ g.fillStyle = (r + k) % 2 ? "#7a4b26" : "#f1dbb3"; g.fillRect(B.x + k*c, B.y + r*c, c + .5, c + .5); }
      if (last) for (const i of [last.p[0], last.p[last.p.length - 1]]){ const [x, y] = sq(i, B, flip); g.fillStyle = "rgba(255,212,59,.28)"; g.fillRect(x - c/2, y - c/2, c, c); }
      const M = can && !win ? gen(b, turn) : [];
      for (let i = 0; i < 64; i++){ const v = b[i]; if (!v) continue; const [x, y] = sq(i, B, flip);
        B2.stone(g, x, y, c*.4, v <= 2 ? "r" : "b"); B2.ring(g, x, y, c*.27, v <= 2 ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.18)", c*.04);
        if (king(v)) outlined(g, "👑", x, y + c*.02, c*.42);
        if (M.length && !path.length && M.some(m => m.p[0] === i)) B2.ring(g, x, y, c*.45, "#ffd43b", c*.06); }
      if (path.length){ const [x, y] = sq(path[path.length - 1], B, flip); B2.ring(g, x, y, c*.46, "#69db7c", c*.08);
        const nx = new Set(M.filter(m => path.every((v, j) => m.p[j] === v) && m.p.length > path.length).map(m => m.p[path.length]));
        nx.forEach(i => { const [x, y] = sq(i, B, flip); B2.dot(g, x, y, c*.16, "rgba(105,219,124,.9)"); }); }
      if (M.length && M[0].x.length && !path.length) B2.hint(g, B, "⚡ 잡을 수 있는 말이 있으면 꼭 잡아야 해요!");
      g.restore(); },
    ai(lv, done){ const M = gen(b, turn); if (!M.length){ done(null); return; }
      const d = [1, 4, 6][lv] || 4, C = M.map(m => { const B = b.slice(); doMv(B, m); return {m: {p: m.p}, s: -ab(B, 1 - turn, d - 1, -Infinity, Infinity) + Math.random()*(lv ? 3 : 40)}; });
      done(B2.choose(C, lv)); }
  };
  return bdCtl("ck", G);
};

/* =====================================================================
   🫘 만칼라 — 구멍의 씨앗을 모두 집어 하나씩 뿌려요. 내 창고에 많이 모으면 승리!
   마지막 씨앗이 내 창고에 들어가면 한 번 더 · 내 빈 구멍에 떨어지면 맞은편 씨앗을 가져와요
   ===================================================================== */
NG.defs.mk = () => {
  let b, turn, win, seq = [], tick = 0, last = -1, msg = "";
  /* 0~5 = 빨강 구멍(아래, 왼→오), 6 = 빨강 창고(오른쪽) · 7~12 = 파랑 구멍(위, 오→왼), 13 = 파랑 창고(왼쪽) */
  const mine = (s, i) => s ? i >= 7 && i <= 12 : i >= 0 && i <= 5, store = s => s ? 13 : 6;
  function sow(B, s, i, rec){
    let n = B[i]; B[i] = 0; let k = i; if (rec) rec.push(B.slice());
    while (n){ k = (k + 1) % 14; if (k === store(1 - s)) continue; B[k]++; n--; if (rec) rec.push(B.slice()); }
    let extra = k === store(s), cap = 0;
    if (!extra && mine(s, k) && B[k] === 1 && B[12 - k]){ cap = B[12 - k] + 1; B[store(s)] += cap; B[k] = B[12 - k] = 0; if (rec) rec.push(B.slice()); }
    let end = false; const sum = t => { let a = 0; for (let j = t ? 7 : 0; j <= (t ? 12 : 5); j++) a += B[j]; return a; };
    if (!sum(0) || !sum(1)){ end = true; for (let j = 0; j < 6; j++){ B[6] += B[j]; B[j] = 0; } for (let j = 7; j < 13; j++){ B[13] += B[j]; B[j] = 0; } if (rec) rec.push(B.slice()); }
    return {extra, cap, end};
  }
  function ab(B, s, d, a, be){
    let any = false, best = -Infinity;
    if (!d) return B[store(s)] - B[store(1 - s)];
    for (let j = 0; j < 6; j++){ const i = s ? 7 + j : j; if (!B[i]) continue; any = true; const C = B.slice(), r = sow(C, s, i);
      const v = r.end ? (C[store(s)] - C[store(1 - s)])*100 : r.extra ? ab(C, s, d - 1, a, be) : -ab(C, 1 - s, d - 1, -be, -a);
      if (v > best) best = v; if (v > a) a = v; if (a >= be) break; }
    return any ? best : B[store(s)] - B[store(1 - s)];
  }
  let lay = null;
  /* 판 모양: 가로 화면은 옆으로 길게, 세로 화면(휴대폰)은 세워서 (내 창고가 아래) */
  function geo(B, flip){
    const vert = B.h > B.w, P = [];
    for (let i = 0; i < 14; i++){ let u, v, w = .84, h = .78;
      if (i < 6){ u = 1.5 + i; v = 1.5; } else if (i === 6){ u = 7.5; v = 1; h = 1.8; } else if (i < 13){ u = 1.5 + 12 - i; v = .5; } else { u = .5; v = 1; h = 1.8; }
      if (flip){ u = 8 - u; v = 2 - v; }
      if (vert){ const k = B.h/8; P.push({x: B.x + (2 - v)*k, y: B.y + u*k, w: h*k, h: w*k}); }
      else { const k = B.w/8; P.push({x: B.x + u*k, y: B.y + v*k, w: w*k, h: h*k}); } }
    return P;
  }
  const SEEDC = ["#ff8787", "#ffd43b", "#69db7c", "#4dabf7", "#b197fc", "#f783ac", "#ffa94d"];
  const G = {
    get ar(){ return innerWidth >= innerHeight*1.02 ? 4 : 1/4; }, names: ["🔴 빨강", "🔵 파랑"], undoOK: true,
    reset(){ b = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]; turn = 0; win = null; seq = []; last = -1; msg = ""; this.resigned = null; },
    turn: () => turn, busy: () => seq.length > 0,
    apply(mv){ mv = +mv; if (win || !mine(turn, mv) || !b[mv]) return false;
      const rec = [], r = sow(b, turn, mv, rec); seq = rec; tick = 0; last = mv;
      msg = r.cap ? `😋 냠! 씨앗 ${r.cap}개를 가져왔어요` : r.extra && !r.end ? `🎉 창고에 쏙! ${this.names[turn]} 한 번 더` : "";
      if (r.end){ const x = b[6], y = b[13]; win = {w: x === y ? -1 : x > y ? 0 : 1, txt: `🔴 ${x} : ${y} 🔵`}; }
      else if (!r.extra) turn ^= 1;
      return true; },
    settle(){ seq = []; },
    over(){ return seq.length ? null : this.resigned || win; },
    status: () => msg ? {t: msg, c: "#ffe066"} : null,
    step(){ if (!seq.length) return false; if (++tick % 7) return false; seq.shift(); tone(500 + Math.random()*300, 600, .04, "sine", .05); if (!seq.length) this.ctl && this.ctl.check(); return true; },
    cardTxt: s => `창고 ${b[store(s)]}개`,
    chip(g, x, y, r, s){ B2.stone(g, x, y, r, s ? "bl" : "r"); },
    down(x, y, B, flip, can){ if (!can) return null; const P = geo(B, flip);
      for (let i = 0; i < 14; i++){ const p = P[i]; if (Math.abs(x - p.x) < p.w/2 && Math.abs(y - p.y) < p.h/2) return mine(turn, i) && b[i] ? i : null; } return null; },
    draw(g, B, flip, can){
      const P = geo(B, flip), V = seq.length ? seq[0] : b; g.save();
      B2.wood(g, B.x, B.y, B.w, B.h, Math.min(B.w, B.h)*.3, "#a0612a", "#6b3a14");
      for (let i = 0; i < 14; i++){ const p = P[i], st = i === 6 || i === 13, glow = can && mine(turn, i) && V[i] > 0;
        g.beginPath(); g.ellipse(p.x, p.y, p.w/2, p.h/2, 0, 0, 7); const gr = g.createRadialGradient(p.x, p.y - p.h*.2, 2, p.x, p.y, Math.max(p.w, p.h)/2); gr.addColorStop(0, "#4a2a10"); gr.addColorStop(1, "#2b1707"); g.fillStyle = gr; g.fill();
        g.lineWidth = glow ? 5 : 2; g.strokeStyle = glow ? "#ffd43b" : i === last && !st ? "#ff8787" : st ? (i === 6 ? "rgba(255,135,135,.7)" : "rgba(116,192,252,.7)") : "rgba(255,255,255,.15)"; g.stroke();
        const n = V[i], m = Math.min(p.w, p.h), r = m*.085, sx = p.w > p.h ? 2.2 : .8, sy = p.h > p.w ? 2.2 : .8;
        for (let k = 0; k < Math.min(n, 18); k++){ const a = k*2.4 + i, d = Math.sqrt(k)*r*1.15; B2.dot(g, p.x + Math.cos(a)*d*(st ? sx : 1.1), p.y - m*.06 + Math.sin(a)*d*(st ? sy : 1.1), r, SEEDC[(k + i) % SEEDC.length]); }
        g.font = `${Math.round(m*.3)}px Jua`; outlined(g, String(n), p.x, p.y + (st ? (p.h > p.w ? p.h*.36 : p.h*.28) : m*.3), Math.min(34, m*.3), st ? "#fff" : "#ffe8cc"); }
      g.restore(); },
    ai(lv, done){ const s = turn, C = [];
      for (let j = 0; j < 6; j++){ const i = s ? 7 + j : j; if (!b[i]) continue; const B = b.slice(), r = sow(B, s, i);
        const d = [1, 5, 8][lv] || 5, v = r.end ? (B[store(s)] - B[store(1 - s)])*100 : r.extra ? ab(B, s, d - 1, -Infinity, Infinity) + 1 : -ab(B, 1 - s, d - 1, -Infinity, Infinity);
        C.push({m: i, s: v + Math.random()*(lv ? .5 : 6)}); }
      done(B2.choose(C, lv)); }
  };
  return bdCtl("mk", G);
};

/* =====================================================================
   ⚫ 따먹기 바둑 (9줄) — 상대 돌을 둘러싸 숨구멍을 막으면 잡아요. 먼저 5개 잡으면 승리!
   ===================================================================== */
NG.defs.gd = () => {
  const N = 9, GOAL = 5;
  let b, turn, cap, win, last, pend = -1, prev = "", prev2 = "", passes = 0, msg = "", moves = 0;
  const nb = i => { const x = i % N, y = (i/N) | 0, L = []; if (x) L.push(i - 1); if (x < N - 1) L.push(i + 1); if (y) L.push(i - N); if (y < N - 1) L.push(i + N); return L; };
  const NB = Array.from({length: N*N}, (_, i) => nb(i));
  function group(B, i){ const c = B[i], S = [i], seen = new Set([i]), lib = new Set();
    for (let k = 0; k < S.length; k++) for (const j of NB[S[k]]){ if (!B[j]) lib.add(j); else if (B[j] === c && !seen.has(j)){ seen.add(j); S.push(j); } }
    return {S, lib}; }
  /* 놓아 보기: {B, got} 또는 null(못 놓는 곳) */
  function tryPut(B0, i, c, ko){
    if (B0[i]) return null; const B = B0.slice(); B[i] = c; let got = 0;
    for (const j of NB[i]) if (B[j] === 3 - c){ const g = group(B, j); if (!g.lib.size){ got += g.S.length; for (const k of g.S) B[k] = 0; } }
    if (!got && !group(B, i).lib.size) return null;
    if (ko && B.join("") === ko) return null;
    return {B, got};
  }
  function score(i, c){
    const r = tryPut(b, i, c, prev2); if (!r) return null; const B = r.B, o = 3 - c; let s = r.got*1000;
    const me = group(B, i); if (me.lib.size === 1 && !r.got) s -= 400*me.S.length; else s += me.lib.size*6;
    for (const j of NB[i]){ if (b[j] === c){ const g0 = group(b, j); if (g0.lib.size === 1 && me.lib.size > 1) s += 500*g0.S.length; }
      if (B[j] === o){ const g = group(B, j); if (g.lib.size === 1) s += 160*g.S.length; else if (g.lib.size === 2) s += 25; } }
    const x = i % N, y = (i/N) | 0; s -= (Math.abs(x - 4) + Math.abs(y - 4))*2;
    return {s, B};
  }
  const G = {
    ar: 1, names: ["⚫ 흑", "⚪ 백"], undoOK: true, noFlip: true, uiH: 150,
    reset(){ b = new Int8Array(N*N); turn = 0; cap = [0, 0]; win = null; last = -1; pend = -1; prev = prev2 = b.join(""); passes = 0; msg = ""; moves = 0; this.resigned = null; },
    turn: () => turn,
    apply(mv){ mv = +mv; if (win) return false;
      if (mv === -1){ passes++; prev2 = prev; msg = `⏭️ ${this.names[turn]} 쉬었어요`; turn ^= 1; pend = -1;
        if (passes >= 2) win = cap[0] === cap[1] ? {w: -1, txt: `둘 다 쉬었어요 · ${cap[0]} : ${cap[1]}`} : {w: cap[0] > cap[1] ? 0 : 1, txt: `잡은 돌 ${cap[0]} : ${cap[1]}`};
        return true; }
      if (!(mv >= 0 && mv < N*N)) return false; const r = tryPut(b, mv, turn + 1, prev2); if (!r) return false;
      prev2 = prev; b = r.B; prev = b.join(""); cap[turn] += r.got; last = mv; pend = -1; passes = 0; moves++;
      msg = r.got ? `🎯 ${r.got}개 잡았어요!` : ""; r.got ? SFX.pt() : SFX.pong();
      if (cap[turn] >= GOAL) win = {w: turn, txt: `${this.names[turn]} 승리 · 잡은 돌 ⚫ ${cap[0]} : ${cap[1]} ⚪`};
      else if (b.every(v => v)) win = cap[0] === cap[1] ? {w: -1, txt: "판이 가득 찼어요"} : {w: cap[0] > cap[1] ? 0 : 1, txt: `잡은 돌 ${cap[0]} : ${cap[1]}`};
      turn ^= 1; return true; },
    over(){ return this.resigned || win; },
    status: () => msg ? {t: msg, c: "#ffe066"} : null,
    cardTxt: s => `잡은 돌 ${cap[s]} / ${GOAL}`,
    chip(g, x, y, r, s){ B2.stone(g, x, y, r, s ? "w" : "b"); },
    down(x, y, B, flip, can){ if (!can) return null; const c = B.w/N, i = Math.floor((x - B.x)/c), j = Math.floor((y - B.y)/c);
      if (i < 0 || j < 0 || i >= N || j >= N) return null; const k = j*N + i; if (!tryPut(b, k, turn + 1, prev2)){ if (!b[k]){ msg = ""; this.ctl.say("🚫 거기는 못 놓아요 (숨구멍이 없거나 패)", "#ffa8a8", 60); } return null; }
      if (pend === k) return k; pend = k; tone(900, 900, .03, "sine", .05); return null; },
    draw(g, B, flip, can){
      const c = B.w/N, X = i => B.x + c*(i % N + .5), Y = i => B.y + c*(((i/N) | 0) + .5); g.save();
      B2.wood(g, B.x - 8, B.y - 8, B.w + 16, B.h + 16, 14);
      g.strokeStyle = "rgba(60,35,10,.85)"; g.lineWidth = 2; g.beginPath(); for (let i = 0; i < N; i++){ g.moveTo(B.x + c/2, B.y + c/2 + i*c); g.lineTo(B.x + B.w - c/2, B.y + c/2 + i*c); g.moveTo(B.x + c/2 + i*c, B.y + c/2); g.lineTo(B.x + c/2 + i*c, B.y + B.h - c/2); } g.stroke();
      [20, 24, 40, 56, 60].forEach(i => B2.dot(g, X(i), Y(i), c*.09, "rgba(60,35,10,.9)"));
      for (let i = 0; i < N*N; i++) if (b[i]){ B2.stone(g, X(i), Y(i), c*.45, b[i] === 1 ? "b" : "w"); const gg = group(b, i); if (gg.lib.size === 1 && can) B2.ring(g, X(i), Y(i), c*.47, "rgba(255,71,87,.85)", c*.06); }
      if (last >= 0) B2.dot(g, X(last), Y(last), c*.12, "#ff4757");
      if (pend >= 0 && can && !b[pend]){ B2.stone(g, X(pend), Y(pend), c*.45, turn ? "w" : "b", .55); outlined(g, "한 번 더 톡!", X(pend), Y(pend) - c*.8, Math.max(14, c*.36), "#ffe066"); }
      g.restore(); },
    pb(U){ const wide = U.w > U.h*2.6; return wide ? {x: U.x + U.w*.62, y: U.y + 12, w: U.w*.38 - 12, h: U.h - 24, t: "⏭️ 쉬기(패스)"} : {x: U.x + 12, y: U.y + U.h - 66, w: U.w - 24, h: 54, t: "⏭️ 쉬기(패스)"}; },
    drawUI(g, U, can){ g.save(); rrect(g, U.x, U.y, U.w, U.h, 18); g.fillStyle = "rgba(255,255,255,.07)"; g.fill();
      const wide = U.w > U.h*2.6, tx = wide ? U.x + U.w*.31 : U.x + U.w/2;
      outlined(g, `🎯 먼저 ${GOAL}개 잡으면 승리`, tx, U.y + (wide ? U.h*.3 : 28), Math.min(22, U.w/14), "#ffe066");
      outlined(g, `⚫ ${cap[0]}  :  ${cap[1]} ⚪`, tx, U.y + (wide ? U.h*.68 : 62), Math.min(26, U.w/12), "#fff");
      B2.btn(g, this.pb(U), false, !can); g.restore(); },
    uiDown(){}, uiUp(x, y, U, can){ return can && B2.inR(x, y, this.pb(U)) && confirm("이번 차례를 쉴까요? (둘 다 쉬면 잡은 돌이 많은 쪽이 이겨요)") ? -1 : null; },
    ai(lv, done){ const c = turn + 1, C = [];
      for (let i = 0; i < N*N; i++){ if (b[i]) continue; const x = i % N, y = (i/N) | 0;
        if (moves > 2 && !NB[i].some(j => b[j]) && !NB[i].some(j => NB[j].some(k => b[k]))) continue;
        const r = score(i, c); if (!r) continue; let s = r.s;
        if (lv === 2){ let worst = 0; for (let k = 0; k < N*N; k++){ if (r.B[k]) continue; const t = tryPut(r.B, k, 3 - c, b.join("")); if (t && t.got > worst) worst = t.got; } s -= worst*900; }
        C.push({m: i, s: s + Math.random()*(lv === 0 ? 300 : lv === 1 ? 40 : 5)}); }
      if (!C.length){ done(-1); return; } done(B2.choose(C, lv)); }
  };
  return bdCtl("gd", G);
};

/* =====================================================================
   🎋 윷놀이 — 윷을 던져 말 4개를 먼저 모두 한 바퀴 돌리면 승리!
   도·개·걸·윷·모 · 빽도(뒤로 한 칸) · 윷·모·잡기는 한 번 더 · 같은 편 말은 업고 가요 · 모서리에서는 지름길
   ===================================================================== */
NG.defs.yt = () => {
  const NM = {"-1": "빽도", 1: "도", 2: "개", 3: "걸", 4: "윷", 5: "모"}, END = 99;
  const NEXT = {0: END, 19: END, 20: 21, 21: 22, 23: 24, 24: 15, 25: 26, 26: 22, 27: 28, 28: END}; for (let i = 1; i < 19; i++) NEXT[i] = i + 1;
  const BACK = {0: 19, 1: 0, 5: 4, 10: 9, 15: 14, 20: 5, 21: 20, 22: 21, 23: 22, 24: 23, 25: 10, 26: 25, 27: 22, 28: 27}; for (let i = 2; i < 20; i++) if (BACK[i] === undefined) BACK[i] = i - 1;
  /* 판 위 자리(0~1) */
  const PXY = []; for (let i = 0; i <= 28; i++){ let p;
    if (i === 0) p = [1, 1]; else if (i < 5) p = [1, 1 - i/5]; else if (i === 5) p = [1, 0]; else if (i < 10) p = [1 - (i - 5)/5, 0]; else if (i === 10) p = [0, 0];
    else if (i < 15) p = [0, (i - 10)/5]; else if (i === 15) p = [0, 1]; else if (i < 20) p = [(i - 15)/5, 1];
    else { const L = {20: [1, 0, 1], 21: [1, 0, 2], 22: [1, 0, 3], 23: [0, 1, 2], 24: [0, 1, 1], 25: [0, 0, 1], 26: [0, 0, 2], 27: [1, 1, 2], 28: [1, 1, 1]}[i]; p = [L[0] + (.5 - L[0])*L[2]/3, L[1] + (.5 - L[1])*L[2]/3]; }
    PXY.push(p); }
  function walk(p, n){   // 지나가는 자리들 (마지막이 도착)
    if (n < 0) return p >= 0 && p <= 28 ? [BACK[p]] : null;
    const out = []; let cur = p, prev = -2;
    for (let k = 0; k < n; k++){ let nx;
      if (cur === -1) nx = 1; else if (k === 0 && cur === 5) nx = 20; else if (k === 0 && cur === 10) nx = 25; else if (cur === 22) nx = k === 0 || prev === 26 ? 27 : 23; else nx = NEXT[cur];
      out.push(nx); if (nx === END) return out; prev = cur; cur = nx; }
    return out;
  }
  const DIST = {}; for (let p = -1; p <= 28; p++){ for (let n = 1; n < 40; n++){ const w = walk(p, n); if (w[w.length - 1] === END){ DIST[p] = n; break; } } }
  const roll = () => { const f = [0, 1, 2, 3].map(() => Math.random() < .5); const k = f.filter(Boolean).length; return k === 0 ? 5 : k === 4 ? 4 : k === 1 && f[0] ? -1 : k; };
  let pc, turn, rs, ph, bonus, win, sel = 0, pend = null, thr = 0, thrR = 0, mvA = null, msg = "";
  const at = (s, p) => [0, 1, 2, 3].filter(k => pc[s][k] === p);
  const usable = (s, r) => r > 0 ? pc[s].some(p => p !== END) : pc[s].some(p => p >= 0 && p <= 28);
  const canUse = (s, r, k) => { const p = pc[s][k]; return p !== END && (r > 0 || p >= 0); };
  function tidy(){ while (ph === "mv"){ const L = rs.filter(r => usable(turn, r)); if (L.length !== rs.length){ msg = rs.length && !L.length ? "😅 움직일 말이 없어요" : msg; rs = L; } if (rs.length) break;
      if (bonus > 0){ bonus--; ph = "th"; } else { turn ^= 1; ph = "th"; } break; }
    sel = Math.min(sel, Math.max(0, rs.length - 1)); }
  let geoB = null;
  const G = {
    ar: .84, names: ["🟠 주황 팀", "🔵 파랑 팀"], undoOK: false, noFlip: true, uiH: 210,
    reset(){ pc = [[-1, -1, -1, -1], [-1, -1, -1, -1]]; turn = 0; rs = []; ph = "th"; bonus = 0; win = null; sel = 0; pend = null; thr = 0; mvA = null; msg = ""; this.resigned = null; },
    turn: () => turn, busy: () => thr > 0 || !!mvA,
    apply(mv){ if (win || !mv) return false;
      if (mv.t === "th"){ const r = +mv.r; if (ph !== "th" || !NM[r]) return false;
        rs.push(r); thr = 42; thrR = r; pend = null; tone(300, 500, .08, "triangle", .08);
        msg = r >= 4 ? `🎉 ${NM[r]}! 한 번 더 던져요` : ""; if (r < 4) ph = "mv"; tidy(); return true; }
      if (mv.t === "mv"){ const i = +mv.i, k = +mv.k, r = rs[i]; if (ph !== "mv" || r === undefined || !(k >= 0 && k < 4) || !canUse(turn, r, k)) return false;
        const from = pc[turn][k], route = walk(from, r), to = route[route.length - 1], grp = from >= 0 ? at(turn, from) : [k];
        grp.forEach(j => pc[turn][j] = to); rs.splice(i, 1); pend = null;
        const ptsFrom = from >= 0 ? from : -1; mvA = {who: turn, grp, pts: [ptsFrom, ...route], t: 0};
        msg = "";
        if (to !== END){ const hit = at(1 - turn, to); if (hit.length){ hit.forEach(j => pc[1 - turn][j] = -1); bonus++; msg = `💥 ${hit.length > 1 ? `${hit.length}개 ` : ""}잡았어요! 한 번 더`; setTimeout(() => SFX.hit(), 260); } }
        else { msg = `🏁 ${grp.length}개 들어왔어요!`; setTimeout(() => SFX.gold(), 260); }
        if (pc[turn].every(p => p === END)) win = {w: turn, txt: `${this.names[turn]} 말 4개 모두 완주!`};
        else { if (bonus > 0 && rs.length === 0){ bonus--; ph = "th"; } tidy(); }
        return true; }
      return false; },
    over(){ return thr || mvA ? null : this.resigned || win; },
    status: () => msg ? {t: msg, c: "#ffe066"} : null,
    step(){ let ch = false; if (thr > 0){ thr--; ch = true; if (thr === 0){ tone(700, 900, .1, "triangle", .1); this.ctl && this.ctl.check(); } }
      if (mvA){ mvA.t += .14; ch = true; if (mvA.t >= mvA.pts.length - 1){ mvA = null; SFX.pong(); this.ctl && this.ctl.check(); } } return ch; },
    cardTxt: s => `완주 ${pc[s].filter(p => p === END).length}/4 · 대기 ${pc[s].filter(p => p === -1).length}`,
    chip(g, x, y, r, s){ B2.stone(g, x, y, r, s ? "bl" : "o"); },
    geo(B){ const S = B.w, pad = S*.09, bx = B.x + pad, by = B.y + pad, bs = S - 2*pad;
      return {xy: p => [bx + PXY[p][0]*bs, by + PXY[p][1]*bs], home: [{x: B.x + 6, y: B.y + S + 6, w: S/2 - 12, h: B.h - S - 12}, {x: B.x + S/2 + 6, y: B.y + S + 6, w: S/2 - 12, h: B.h - S - 12}], r: S*.04}; },
    pieceAt(x, y, B){ const Q = this.geo(B);
      for (let p = 0; p <= 28; p++){ const [px, py] = Q.xy(p); if ((x - px)**2 + (y - py)**2 < (Q.r*1.9)**2) return {p}; }
      for (let s = 0; s < 2; s++) if (B2.inR(x, y, Q.home[s])) return {home: s};
      return null; },
    down(x, y, B, flip, can){ if (!can || ph !== "mv" || !rs.length) return null; const h = this.pieceAt(x, y, B), r = rs[sel]; if (!h) return null;
      let k = -1; if (h.home === turn) k = pc[turn].indexOf(-1); else if (h.p !== undefined) k = pc[turn].findIndex(p => p === h.p);
      if (k < 0 || !canUse(turn, r, k)){ tone(220, 180, .06, "square", .05); return null; }
      const key = `${sel}:${pc[turn][k]}`;
      if (pend && pend.key === key) return {t: "mv", i: sel, k};
      pend = {key, k, to: walk(pc[turn][k], r).pop()}; tone(900, 900, .03, "sine", .05); return null; },
    draw(g, B, flip, can){
      const Q = this.geo(B), S = B.w; g.save();
      B2.wood(g, B.x, B.y, S, S, 22, "#f6e3b4", "#e0bf7c");
      g.strokeStyle = "rgba(120,70,20,.55)"; g.lineWidth = 5; g.beginPath();
      [[0, 5], [5, 10], [10, 15], [15, 0], [5, 15], [10, 0]].forEach(([a, z]) => { const [x1, y1] = Q.xy(a), [x2, y2] = Q.xy(z); g.moveTo(x1, y1); g.lineTo(x2, y2); }); g.stroke();
      for (let p = 0; p <= 28; p++){ const [x, y] = Q.xy(p), big = p % 5 === 0 && p <= 15 || p === 22, r = Q.r*(big ? 1.35 : .95);
        g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = big ? "#c2410c" : "#fff7e6"; g.fill(); g.lineWidth = 3; g.strokeStyle = "#8a5a22"; g.stroke();
        if (p === 0) outlined(g, "출발·도착", x - Q.r*2.2, y + Q.r*2.1, Math.max(13, S*.03), "#7c2d12"); }
      // 미리 보기: 도착할 자리
      if (pend && can){ const to = pend.to; if (to === END){ const [x, y] = Q.xy(0); B2.ring(g, x, y, Q.r*2, "#2f9e44", 6); outlined(g, "🏁 완주!", x - Q.r*1.5, y - Q.r*2.4, Math.max(16, S*.04), "#2f9e44"); }
        else { const [x, y] = Q.xy(to); B2.ring(g, x, y, Q.r*1.8, "#2f9e44", 6); outlined(g, "한 번 더 톡!", x, y - Q.r*2.5, Math.max(16, S*.036), "#2f9e44"); } }
      // 판 위 말 (업은 말은 숫자)
      const hide = mvA ? new Set(mvA.grp.map(k => mvA.who + ":" + k)) : null;
      for (let s = 0; s < 2; s++){ const seen = {};
        pc[s].forEach((p, k) => { if (p < 0 || p === END || (hide && hide.has(s + ":" + k))) return; seen[p] = (seen[p] || 0) + 1; });
        Object.entries(seen).forEach(([p, n]) => { const [x, y] = Q.xy(+p), o = pc[1 - s].includes(+p) ? (s ? 1 : -1)*Q.r*.5 : 0;
          B2.stone(g, x + o, y - Q.r*.2, Q.r*1.15, s ? "bl" : "o"); outlined(g, s ? "🔵" : "🟠", x + o, y - Q.r*.2, Q.r*1.1);
          if (n > 1) { B2.dot(g, x + o + Q.r, y - Q.r*1.1, Q.r*.6, "#fff"); outlined(g, `${n}`, x + o + Q.r, y - Q.r*1.1, Q.r*.9, "#d9480f"); }
          if (can && s === turn && ph === "mv" && rs.length && pend === null) B2.ring(g, x + o, y - Q.r*.2, Q.r*1.35, "#ffd43b", 4); }); }
      if (mvA){ const t = Math.min(mvA.t, mvA.pts.length - 1), a = Math.floor(t), f = t - a, P = q => q === END ? Q.xy(0) : q < 0 ? [Q.home[mvA.who].x + Q.home[mvA.who].w/2, Q.home[mvA.who].y + Q.home[mvA.who].h/2] : Q.xy(q);
        const [x1, y1] = P(mvA.pts[a]), [x2, y2] = P(mvA.pts[Math.min(a + 1, mvA.pts.length - 1)]), hop = Math.sin(f*Math.PI)*Q.r*1.6;
        B2.stone(g, x1 + (x2 - x1)*f, y1 + (y2 - y1)*f - hop, Q.r*1.2, mvA.who ? "bl" : "o"); if (mvA.grp.length > 1) outlined(g, `x${mvA.grp.length}`, x1 + (x2 - x1)*f, y1 + (y2 - y1)*f - hop, Q.r); }
      // 집(출발 전 말)과 완주한 말
      for (let s = 0; s < 2; s++){ const H = Q.home[s], n = pc[s].filter(p => p === -1).length, d = pc[s].filter(p => p === END).length, on = can && s === turn && ph === "mv" && rs.length && n && rs[sel] > 0;
        rrect(g, H.x, H.y, H.w, H.h, 14); g.fillStyle = on ? "rgba(255,212,59,.3)" : "rgba(0,0,0,.18)"; g.fill(); if (on){ g.lineWidth = 4; g.strokeStyle = "#ffd43b"; g.stroke(); }
        outlined(g, `${s ? "🔵" : "🟠"} 대기 ${n} · 🏁 ${d}`, H.x + H.w/2, H.y + H.h*.28, Math.min(22, H.w/10), "#fff");
        for (let k = 0; k < 4; k++){ const x = H.x + H.w*(.2 + k*.2), y = H.y + H.h*.68; B2.stone(g, x, y, Math.min(H.h*.2, H.w*.08), s ? "bl" : "o", k < n ? 1 : k < n + d ? .35 : .08); } }
      g.restore(); },
    tb(U){ const wide = U.w > U.h*2; return wide ? {x: U.x + 10, y: U.y + 10, w: U.w*.36, h: U.h - 20, t: "🎋 윷 던지기", p: 1} : {x: U.x + 12, y: U.y + 12, w: U.w - 24, h: 64, t: "🎋 윷 던지기!", p: 1}; },
    chips(U){ const wide = U.w > U.h*2, x0 = wide ? U.x + U.w*.4 : U.x + 12, y0 = wide ? U.y + U.h*.5 : U.y + 132, w = wide ? U.w*.58 : U.w - 24, n = Math.max(1, rs.length), cw = Math.min(90, w/n - 8);
      return rs.map((r, i) => ({x: x0 + i*(cw + 8), y: y0, w: cw, h: wide ? U.h*.42 : 56, t: NM[r], i})); },
    drawUI(g, U, can){ g.save(); rrect(g, U.x, U.y, U.w, U.h, 18); g.fillStyle = "rgba(255,255,255,.07)"; g.fill();
      const wide = U.w > U.h*2, T = this.tb(U);
      if (thr > 0){ const k = 42 - thr, cx = T.x + T.w/2, cy = T.y + T.h/2;
        for (let s = 0; s < 4; s++){ const a = k*.5 + s*1.7, x = cx + (s - 1.5)*Math.min(26, T.w/6), y = cy - Math.abs(Math.sin(k*.18 + s))*T.h*.3;
          g.save(); g.translate(x, y); g.rotate(Math.sin(a)*.6); rrect(g, -7, -T.h*.36, 14, T.h*.72, 6); g.fillStyle = Math.sin(a*2) > 0 ? "#f8f0dc" : "#8a5a22"; g.fill(); g.restore(); }
        if (thr < 14) outlined(g, NM[thrR] + "!", cx, cy, Math.min(48, T.h*.7), "#ffe066"); }
      else B2.btn(g, T, false, !(can && ph === "th"));
      const tx = wide ? U.x + U.w*.69 : U.x + U.w/2;
      outlined(g, ph === "th" ? (can ? "👆 윷을 던져요!" : "⏳ 던지는 중") : rs.length > 1 ? "👇 쓸 결과를 고르고 말을 톡톡!" : "🟡 움직일 말을 톡톡!", tx, wide ? U.y + U.h*.25 : U.y + 102, Math.min(20, U.w/16), "#ffe066");
      if (!thr) this.chips(U).forEach(c => B2.btn(g, c, c.i === sel && rs.length > 1, !can));
      g.restore(); },
    uiDown(){}, uiUp(x, y, U, can){ if (!can || thr) return null;
      if (ph === "th" && B2.inR(x, y, this.tb(U))) return {t: "th", r: roll()};
      for (const c of this.chips(U)) if (B2.inR(x, y, c)){ sel = c.i; pend = null; }
      return null; },
    key(code, can){ if (code === "Space" && can && ph === "th" && !thr){ this.ctl && this.ctl.dirty(); return false; } return false; },
    keyUp(code, can){ return code === "Space" && can && ph === "th" && !thr ? {t: "th", r: roll()} : null; },
    ai(lv, done){
      if (ph === "th"){ done({t: "th", r: roll()}); return; }
      const s = turn, o = 1 - s, C = [], tried = new Set();
      const danger = (p, stk) => { if (p === END || p < 0) return 0; let d = 0; for (let k = 0; k < 4; k++){ const q = pc[o][k]; if (q === END) continue; for (let n = 1; n <= 5; n++){ const w = walk(q, n); if (w && w[w.length - 1] === p){ d += [0, 4, 6, 4, 1, 1][n]; break; } } } return d*stk; };
      rs.forEach((r, i) => { for (let k = 0; k < 4; k++){ if (!canUse(s, r, k)) continue; const key = r + ":" + pc[s][k]; if (tried.has(key)) continue; tried.add(key);
        const from = pc[s][k], w = walk(from, r), to = w[w.length - 1], stk = from >= 0 ? at(s, from).length : 1;
        let v = (DIST[from] ?? 30) - (to === END ? 0 : DIST[to] ?? 30);
        if (to === END) v += 60*stk; else { v += pc[o].filter(p => p === to).length*90; if (to === 5 || to === 10 || to === 22) v += 18; v += at(s, to).length*12; v -= danger(to, stk)*5; }
        if (from >= 0) v += danger(from, stk)*4; if (r < 0) v -= 6;
        C.push({m: {t: "mv", i, k}, s: v + Math.random()*(lv === 0 ? 40 : lv === 1 ? 8 : 1)}); } });
      if (!C.length){ done(null); return; } done(B2.choose(C, lv));
    }
  };
  return bdCtl("yt", G);
};

/* =====================================================================
   🧱 쿼리도 — 말을 한 칸씩 움직여 건너편 끝줄에 먼저! 벽(10개)으로 친구 길을 막아요
   (벽으로 길을 완전히 막을 수는 없어요)
   ===================================================================== */
NG.defs.qr = () => {
  const N = 9;
  let pos, walls, hw, vw, left, turn, win, mode = "m", pend = null, last = null;
  const goal = s => s ? N - 1 : 0;
  const blocked = (r, c, r2, c2) => {
    if (r2 === r + 1) return (c < 8 && hw.has(r*8 + c)) || (c > 0 && hw.has(r*8 + c - 1));
    if (r2 === r - 1) return (c < 8 && hw.has((r - 1)*8 + c)) || (c > 0 && hw.has((r - 1)*8 + c - 1));
    if (c2 === c + 1) return (r < 8 && vw.has(r*8 + c)) || (r > 0 && vw.has((r - 1)*8 + c));
    if (c2 === c - 1) return (r < 8 && vw.has(r*8 + c - 1)) || (r > 0 && vw.has((r - 1)*8 + c - 1));
    return true; };
  const nbrs = i => { const r = (i/N) | 0, c = i % N, L = []; for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]){ const R = r + dr, C = c + dc; if (R >= 0 && R < N && C >= 0 && C < N && !blocked(r, c, R, C)) L.push(R*N + C); } return L; };
  function dist(s){ const D = new Int16Array(N*N).fill(-1), Q = [pos[s]]; D[pos[s]] = 0;
    for (let k = 0; k < Q.length; k++){ const i = Q[k]; if (((i/N) | 0) === goal(s)) return {d: D[i], end: i, D}; for (const j of nbrs(i)) if (D[j] < 0){ D[j] = D[i] + 1; Q.push(j); } }
    return {d: 999, D}; }
  function pawnMoves(s){
    const me = pos[s], op = pos[1 - s], r = (me/N) | 0, c = me % N, M = [];
    for (const j of nbrs(me)){
      if (j !== op){ M.push(j); continue; }
      const dr = ((j/N) | 0) - r, dc = j % N - c, r2 = ((j/N) | 0) + dr, c2 = j % N + dc, jr = (j/N) | 0, jc = j % N;
      if (r2 >= 0 && r2 < N && c2 >= 0 && c2 < N && !blocked(jr, jc, r2, c2)) M.push(r2*N + c2);
      else for (const k of nbrs(j)) if (k !== me) M.push(k); }
    return M; }
  function wallOK(k, o){
    if (!(k >= 0 && k < 64)) return false; const r = k >> 3, c = k & 7;
    if (hw.has(k) || vw.has(k)) return false;
    if (o === 0 && ((c > 0 && hw.has(k - 1)) || (c < 7 && hw.has(k + 1)))) return false;
    if (o === 1 && ((r > 0 && vw.has(k - 8)) || (r < 7 && vw.has(k + 8)))) return false;
    (o ? vw : hw).add(k); const ok = dist(0).d < 999 && dist(1).d < 999; (o ? vw : hw).delete(k); return ok; }
  function withWall(k, o, f){ (o ? vw : hw).add(k); const v = f(); (o ? vw : hw).delete(k); return v; }
  const G = {
    ar: 1, names: ["🟢 초록", "🟣 보라"], undoOK: true, uiH: 210,
    reset(){ pos = [8*N + 4, 4]; hw = new Set(); vw = new Set(); left = [10, 10]; turn = 0; win = null; mode = "m"; pend = null; last = null; this.resigned = null; },
    turn: () => turn,
    apply(mv){ if (win || !mv) return false;
      if (mv.m !== undefined){ const j = +mv.m; if (!pawnMoves(turn).includes(j)) return false; last = {f: pos[turn], t: j}; pos[turn] = j; SFX.pong();
        if (((j/N) | 0) === goal(turn)) win = {w: turn, txt: `${this.names[turn]} 끝줄에 먼저 도착!`}; }
      else if (mv.w !== undefined){ const k = +mv.w, o = +mv.o ? 1 : 0; if (!left[turn] || !wallOK(k, o)) return false; (o ? vw : hw).add(k); left[turn]--; last = {w: k, o}; tone(300, 200, .08, "square", .08); }
      else return false;
      pend = null; turn ^= 1; if (!left[turn] && mode !== "m") mode = "m"; return true; },
    over(){ return this.resigned || win; },
    status: () => null,
    cardTxt: s => `🧱 벽 ${left[s]}개 · 남은 길 ${dist(s).d}칸`,
    chip(g, x, y, r, s){ B2.stone(g, x, y, r, s ? "v" : "r"); g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = s ? "#9775fa" : "#40c057"; g.fill(); },
    tf(B, flip){ const c = B.w/N; return {c, X: (col) => B.x + c*((flip ? 8 - col : col) + .5), Y: (row) => B.y + c*((flip ? 8 - row : row) + .5)}; },
    down(x, y, B, flip, can){ if (!can) return null; const c = B.w/N;
      if (mode === "m"){ let col = Math.floor((x - B.x)/c), row = Math.floor((y - B.y)/c); if (col < 0 || row < 0 || col > 8 || row > 8) return null; if (flip){ col = 8 - col; row = 8 - row; }
        const j = row*N + col; return pawnMoves(turn).includes(j) ? {m: j} : null; }
      let fx = (x - B.x)/c, fy = (y - B.y)/c; if (flip){ fx = 9 - fx; fy = 9 - fy; }
      const o = mode === "v" ? 1 : 0, col = Math.max(0, Math.min(7, Math.round(fx) - 1)), row = Math.max(0, Math.min(7, Math.round(fy) - 1)), k = row*8 + col;
      if (pend && pend.k === k && pend.o === o){ if (wallOK(k, o)) return {w: k, o}; return null; }
      pend = {k, o, ok: wallOK(k, o)}; tone(900, 900, .03, "sine", .05); return null; },
    draw(g, B, flip, can){
      const {c, X, Y} = this.tf(B, flip); g.save();
      B2.wood(g, B.x - 10, B.y - 10, B.w + 20, B.h + 20, 16, "#5c3a1a", "#3b2410");
      for (let r = 0; r < N; r++) for (let k = 0; k < N; k++){ const x = X(k) - c*.44, y = Y(r) - c*.44; rrect(g, x, y, c*.88, c*.88, c*.12);
        g.fillStyle = r === 0 ? "rgba(64,192,87,.55)" : r === 8 ? "rgba(151,117,250,.55)" : "#c99a63"; g.fill(); }
      const M = can && mode === "m" && !win ? pawnMoves(turn) : [];
      M.forEach(j => B2.dot(g, X(j % N), Y((j/N) | 0), c*.16, "rgba(255,212,59,.95)"));
      if (last && last.f !== undefined){ B2.ring(g, X(last.f % N), Y((last.f/N) | 0), c*.2, "rgba(255,255,255,.35)", 3); }
      const wall = (k, o, col, a) => { const r = k >> 3, cc = k & 7, ix = (X(cc) + X(cc + 1))/2, iy = (Y(r) + Y(r + 1))/2; g.globalAlpha = a; g.fillStyle = col;
        if (o === 0){ rrect(g, ix - c*.95, iy - c*.08, c*1.9, c*.16, c*.06); } else { rrect(g, ix - c*.08, iy - c*.95, c*.16, c*1.9, c*.06); } g.fill(); g.globalAlpha = 1; };
      hw.forEach(k => wall(k, 0, last && last.w === k && last.o === 0 ? "#ffd43b" : "#f8f0dc", 1)); vw.forEach(k => wall(k, 1, last && last.w === k && last.o === 1 ? "#ffd43b" : "#f8f0dc", 1));
      if (pend && can && mode !== "m") wall(pend.k, pend.o, pend.ok ? "#69db7c" : "#ff6b6b", .85);
      for (let s = 0; s < 2; s++){ const i = pos[s]; const x = X(i % N), y = Y((i/N) | 0); g.beginPath(); g.arc(x, y, c*.36, 0, 7); const gr = g.createRadialGradient(x - c*.12, y - c*.12, 2, x, y, c*.36); gr.addColorStop(0, s ? "#d0bfff" : "#b2f2bb"); gr.addColorStop(1, s ? "#6741d9" : "#2b8a3e"); g.fillStyle = gr; g.fill();
        g.lineWidth = s === turn && !win ? 5 : 2; g.strokeStyle = s === turn && !win ? "#ffd43b" : "rgba(0,0,0,.4)"; g.stroke(); outlined(g, s ? "🟣" : "🟢", x, y, c*.32); }
      if (pend && can && mode !== "m") B2.hint(g, B, pend.ok ? "🧱 같은 곳을 한 번 더 톡 하면 벽을 세워요" : "🚫 거기는 벽을 놓을 수 없어요", pend.ok ? "#b2f2bb" : "#ffa8a8");
      g.restore(); },
    mb(U){ const wide = U.w > U.h*2, n = 3, gap = 8;
      if (wide){ const w = (U.w*.66 - gap*(n + 1))/n; return [["m", "🚶 말"], ["h", "━ 가로 벽"], ["v", "┃ 세로 벽"]].map(([id, t], i) => ({id, t, x: U.x + U.w*.34 + gap + i*(w + gap), y: U.y + 12, w, h: U.h - 24})); }
      return [["m", "🚶 말 움직이기"], ["h", "━ 가로 벽 놓기"], ["v", "┃ 세로 벽 놓기"]].map(([id, t], i) => ({id, t, x: U.x + 12, y: U.y + 54 + i*50, w: U.w - 24, h: 44})); },
    drawUI(g, U, can){ g.save(); rrect(g, U.x, U.y, U.w, U.h, 18); g.fillStyle = "rgba(255,255,255,.07)"; g.fill();
      const wide = U.w > U.h*2; outlined(g, `🧱 남은 벽 ${left[turn]}개`, wide ? U.x + U.w*.17 : U.x + U.w/2, wide ? U.y + U.h/2 : U.y + 28, Math.min(22, U.w/14), "#ffe066");
      this.mb(U).forEach(b => B2.btn(g, b, mode === b.id, !can || (b.id !== "m" && !left[turn]))); g.restore(); },
    uiDown(){}, uiUp(x, y, U, can){ for (const b of this.mb(U)) if (B2.inR(x, y, b)){ if (b.id !== "m" && !left[turn]){ this.ctl.say("🧱 벽을 모두 썼어요", "#ffa8a8", 50); return null; } mode = b.id; pend = null; } return null; },
    ai(lv, done){
      const s = turn, o = 1 - s, dm = dist(s), dO = dist(o);
      const bestStep = () => { let best = null, bd = 1e9; for (const j of pawnMoves(s)){ const p0 = pos[s]; pos[s] = j; const d = ((j/N) | 0) === goal(s) ? -1 : dist(s).d; pos[s] = p0; if (d < bd || (d === bd && Math.random() < .3)){ bd = d; best = j; } } return {m: best}; };
      if (!left[s] || dm.d <= 1 || (lv === 0 && Math.random() < .75)){ done(bestStep()); return; }
      // 상대의 가장 짧은 길 위를 막는 벽들
      const cand = new Set(); let i = pos[o]; const D = dO.D, path = [i];
      for (let g = 0; g < 40 && ((i/N) | 0) !== goal(o); g++){ let nx = -1; for (const j of nbrs(i)){ const p0 = pos[o]; pos[o] = j; const dd = dist(o).d; pos[o] = p0; if (dd === dO.d - path.length){ nx = j; break; } } if (nx < 0) break; path.push(nx); i = nx; }
      for (let k = 0; k + 1 < path.length; k++){ const a = path[k], z = path[k + 1], ra = (a/N) | 0, ca = a % N, rz = (z/N) | 0, cz = z % N;
        if (ra !== rz){ const r = Math.min(ra, rz); for (const c of [ca - 1, ca]) if (c >= 0 && c < 8 && r < 8) cand.add(`${r*8 + c},0`); }
        else { const c = Math.min(ca, cz); for (const r of [ra - 1, ra]) if (r >= 0 && r < 8 && c < 8) cand.add(`${r*8 + c},1`); } }
      let best = null, bg = -1e9;
      cand.forEach(t => { const [k, oo] = t.split(",").map(Number); if (!wallOK(k, oo)) return; const g = withWall(k, oo, () => (dist(o).d - dO.d) - (dist(s).d - dm.d)*1.2); if (g > bg){ bg = g; best = {w: k, o: oo}; } });
      const need = lv === 2 ? (dO.d <= dm.d ? 1 : 2) : 2;
      done(best && bg >= need && (dO.d <= dm.d + 1 || left[s] > 6) ? best : bestStep());
    }
  };
  return bdCtl("qr", G);
};

/* =====================================================================
   🟪 블로커스 (둘이서) — 내 조각은 내 조각과 '모서리'만 닿게! 변끼리 붙이면 안 돼요
   첫 조각은 별 칸을 덮어요 · 조각을 많이 놓아 남은 칸이 적은 쪽이 승리
   ===================================================================== */
const BX_P = [[[0, 0]], [[0, 0], [1, 0]], [[0, 0], [1, 0], [2, 0]], [[0, 0], [1, 0], [0, 1]], [[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [1, 0], [2, 0], [2, 1]], [[0, 0], [1, 0], [2, 0], [1, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]], [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1]], [[0, 0], [1, 0], [2, 0], [1, 1], [2, 1]], [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1]], [[0, 0], [1, 0], [2, 0], [3, 0], [1, 1]],
  [[1, 0], [1, 1], [0, 2], [1, 2], [2, 2]], [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]], [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]], [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]], [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]], [[1, 0], [0, 1], [1, 1], [2, 1], [2, 2]]];
const BX_O = BX_P.map(P => Array.from({length: 8}, (_, t) => { let Q = P.map(([x, y]) => t >= 4 ? [-x, y] : [x, y]); for (let r = 0; r < t % 4; r++) Q = Q.map(([x, y]) => [-y, x]);
  const mx = Math.min(...Q.map(q => q[0])), my = Math.min(...Q.map(q => q[1])); return Q.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); }));
NG.defs.bx = () => {
  const N = 14, START = [4*N + 4, 9*N + 9];
  let b, used, turn, win, sel = -1, ori = 0, pend = null, last = [], msg = "", skip = [0, 0];
  const left = s => BX_P.reduce((a, P, k) => a + (used[s][k] ? 0 : P.length), 0);
  function fits(s, p, t, at){ const ax = at % N, ay = (at/N) | 0, first = !used[s].some(Boolean); let corner = false, cells = [];
    for (const [dx, dy] of BX_O[p][t]){ const x = ax + dx, y = ay + dy; if (x >= N || y >= N || x < 0 || y < 0) return null; const i = y*N + x; if (b[i]) return null;
      if ((x > 0 && b[i - 1] === s + 1) || (x < N - 1 && b[i + 1] === s + 1) || (y > 0 && b[i - N] === s + 1) || (y < N - 1 && b[i + N] === s + 1)) return null;
      if (first){ if (i === START[s]) corner = true; }
      else if ((x > 0 && y > 0 && b[i - N - 1] === s + 1) || (x < N - 1 && y > 0 && b[i - N + 1] === s + 1) || (x > 0 && y < N - 1 && b[i + N - 1] === s + 1) || (x < N - 1 && y < N - 1 && b[i + N + 1] === s + 1)) corner = true;
      cells.push(i); }
    return corner ? cells : null; }
  function corners(s){ const L = []; const first = !used[s].some(Boolean); if (first) return b[START[s]] ? [] : [START[s]];
    for (let i = 0; i < N*N; i++){ if (b[i]) continue; const x = i % N, y = (i/N) | 0;
      if ((x > 0 && b[i - 1] === s + 1) || (x < N - 1 && b[i + 1] === s + 1) || (y > 0 && b[i - N] === s + 1) || (y < N - 1 && b[i + N] === s + 1)) continue;
      if ((x > 0 && y > 0 && b[i - N - 1] === s + 1) || (x < N - 1 && y > 0 && b[i - N + 1] === s + 1) || (x > 0 && y < N - 1 && b[i + N - 1] === s + 1) || (x < N - 1 && y < N - 1 && b[i + N + 1] === s + 1)) L.push(i); }
    return L; }
  function gen(s, any){ const out = [], seen = new Set(), C = corners(s);
    for (let p = BX_P.length - 1; p >= 0; p--){ if (used[s][p]) continue; const done = new Set();
      for (let t = 0; t < 8; t++){ const O = BX_O[p][t], sig = O.join(";"); if (done.has(sig)) continue; done.add(sig);
        for (const c of C){ const cx = c % N, cy = (c/N) | 0;
          for (const [dx, dy] of O){ const ax = cx - dx, ay = cy - dy; if (ax < 0 || ay < 0) continue; const at = ay*N + ax, key = p*10000 + t*1000 + at; if (seen.has(key)) continue; seen.add(key);
            const cells = fits(s, p, t, at); if (cells){ out.push({p, t, at, cells}); if (any) return out; } } } } }
    return out; }
  function after(){ // 다음 차례 정하기 (둘 다 못 두면 끝)
    for (let k = 0; k < 2; k++){ turn ^= 1; if (gen(turn, true).length){ if (k === 1){ skip[1 - turn]++; msg = `⏭️ ${G.names[1 - turn]} 놓을 곳이 없어 쉬어요`; } return; } }
    const x = left(0), y = left(1); win = {w: x === y ? -1 : x < y ? 0 : 1, txt: `남은 칸 🟪 ${x} : ${y} 🟧 (적을수록 좋아요)`}; }
  const COL = [["#b197fc", "#6741d9"], ["#ffa94d", "#d9480f"]];
  function cell(g, x, y, s, c, a = 1){ g.globalAlpha = a; const gr = g.createLinearGradient(x, y, x + c, y + c); gr.addColorStop(0, COL[s][0]); gr.addColorStop(1, COL[s][1]); rrect(g, x + 1, y + 1, c - 2, c - 2, c*.18); g.fillStyle = gr; g.fill(); g.lineWidth = 1.5; g.strokeStyle = "rgba(255,255,255,.45)"; g.stroke(); g.globalAlpha = 1; }
  const G = {
    get ar(){ return innerWidth >= innerHeight*1.02 ? 1.6 : 1/1.46; }, names: ["🟪 보라", "🟧 주황"], undoOK: true, noFlip: true,
    reset(){ b = new Int8Array(N*N); used = [Array(21).fill(0), Array(21).fill(0)]; turn = 0; win = null; sel = -1; ori = 0; pend = null; last = []; msg = ""; skip = [0, 0]; this.resigned = null; },
    turn: () => turn,
    apply(mv){ if (win || !mv) return false; const p = +mv.p, t = +mv.t, at = +mv.at; if (!(p >= 0 && p < 21) || used[turn][p] || !(t >= 0 && t < 8)) return false;
      const cells = fits(turn, p, t, at); if (!cells) return false;
      cells.forEach(i => b[i] = turn + 1); used[turn][p] = 1; last = cells; sel = -1; pend = null; msg = ""; cells.length >= 5 ? SFX.pt() : SFX.pong();
      if (used[turn].every(Boolean)){ msg = `🎉 ${this.names[turn]} 조각을 모두 놓았어요!`; }
      after(); return true; },
    over(){ return this.resigned || win; },
    status: () => msg ? {t: msg, c: "#ffe066"} : null,
    cardTxt: s => `남은 조각 ${used[s].filter(x => !x).length}개 · ${left(s)}칸`,
    chip(g, x, y, r, s){ cell(g, x - r, y - r, s, r*2); },
    lay(B){
      if (B.w > B.h){ const S = B.h, c = S/N, tx = B.x + S + 14, tw = B.x + B.w - tx, bh = 56, th = S - bh - 10;
        return {c, S, tray: {x: tx, y: B.y, w: tw, h: th, cw: tw/3, ch: th/7, cols: 3}, rot: {x: tx, y: B.y + th + 10, w: tw/2 - 4, h: bh, t: "🔄 돌리기"}, flp: {x: tx + tw/2 + 4, y: B.y + th + 10, w: tw/2 - 4, h: bh, t: "↔️ 뒤집기"}}; }
      const S = B.w, c = S/N, ty = B.y + S + 10, th = B.h - S - 10, bw = S*.17, gw = S - bw - 8;
      return {c, S, tray: {x: B.x, y: ty, w: gw, h: th, cw: gw/7, ch: th/3, cols: 7}, rot: {x: B.x + gw + 8, y: ty, w: bw, h: th/2 - 4, t: "🔄 돌리기"}, flp: {x: B.x + gw + 8, y: ty + th/2 + 4, w: bw, h: th/2 - 4, t: "↔️ 뒤집기"}}; },
    who(can){ return can ? turn : this.ctl && this.ctl.net() ? this.ctl.mine() : this.ctl && this.ctl.cpu() ? 0 : turn; },
    down(x, y, B, flip, can){ const L = this.lay(B), s = turn;
      if (B2.inR(x, y, L.rot)){ if (sel >= 0){ ori = (ori & 4) | ((ori + 1) & 3); if (pend) pend.ok = !!fits(s, sel, ori, pend.at); tone(700, 800, .04, "sine", .05); } return null; }
      if (B2.inR(x, y, L.flp)){ if (sel >= 0){ ori ^= 4; if (pend) pend.ok = !!fits(s, sel, ori, pend.at); tone(700, 800, .04, "sine", .05); } return null; }
      if (B2.inR(x, y, L.tray)){ if (!can) return null; const k = Math.floor((x - L.tray.x)/L.tray.cw) + L.tray.cols*Math.floor((y - L.tray.y)/L.tray.ch); if (k >= 0 && k < 21 && !used[s][k]){ sel = k; ori = 0; pend = null; tone(900, 1000, .04, "sine", .06); } return null; }
      if (!can || sel < 0) return null;
      const cx = Math.floor((x - B.x)/L.c), cy = Math.floor((y - B.y)/L.c); if (cx < 0 || cy < 0 || cx >= N || cy >= N) return null;
      const O = BX_O[sel][ori], w = Math.max(...O.map(q => q[0])), h = Math.max(...O.map(q => q[1]));
      const ax = Math.max(0, Math.min(N - 1 - w, cx - (w >> 1))), ay = Math.max(0, Math.min(N - 1 - h, cy - (h >> 1))), at = ay*N + ax;
      if (pend && pend.at === at && pend.t === ori && pend.p === sel){ return pend.ok ? {p: sel, t: ori, at} : null; }
      pend = {p: sel, t: ori, at, ok: !!fits(s, sel, ori, at)}; tone(900, 900, .03, "sine", .05); return null; },
    draw(g, B, flip, can){
      const L = this.lay(B), c = L.c, S = L.S; g.save();
      rrect(g, B.x - 8, B.y - 8, S + 16, S + 16, 14); g.fillStyle = "#e9ecef"; g.fill();
      for (let i = 0; i < N*N; i++){ const x = B.x + (i % N)*c, y = B.y + ((i/N) | 0)*c; if (b[i]) cell(g, x, y, b[i] - 1, c); else { g.fillStyle = (i + ((i/N) | 0)) % 2 ? "#dee2e6" : "#e9ecef"; g.fillRect(x, y, c, c); } }
      g.strokeStyle = "rgba(0,0,0,.08)"; g.lineWidth = 1; g.beginPath(); for (let i = 0; i <= N; i++){ g.moveTo(B.x + i*c, B.y); g.lineTo(B.x + i*c, B.y + S); g.moveTo(B.x, B.y + i*c); g.lineTo(B.x + S, B.y + i*c); } g.stroke();
      START.forEach((i, s) => { if (!b[i]) outlined(g, "★", B.x + (i % N + .5)*c, B.y + (((i/N) | 0) + .5)*c, c*.8, COL[s][1]); });
      last.forEach(i => { g.lineWidth = 3; g.strokeStyle = "#ffd43b"; g.strokeRect(B.x + (i % N)*c + 2, B.y + ((i/N) | 0)*c + 2, c - 4, c - 4); });
      if (can && !win && sel >= 0 && !pend) corners(turn).forEach(i => B2.dot(g, B.x + (i % N + .5)*c, B.y + (((i/N) | 0) + .5)*c, c*.16, COL[turn][1]));
      if (pend && can){ BX_O[pend.p][pend.t].forEach(([dx, dy]) => { const x = B.x + (pend.at % N + dx)*c, y = B.y + (((pend.at/N) | 0) + dy)*c; cell(g, x, y, turn, c, .6); g.lineWidth = 3; g.strokeStyle = pend.ok ? "#2f9e44" : "#e03131"; g.strokeRect(x + 2, y + 2, c - 4, c - 4); });
        outlined(g, pend.ok ? "한 번 더 톡 하면 놓여요" : "🚫 여기는 못 놓아요", B.x + S/2, B.y + S - 20, Math.min(24, S/20), pend.ok ? "#2b8a3e" : "#e03131"); }
      // 조각 상자
      const s = this.who(can), T = L.tray; rrect(g, T.x, T.y, T.w, T.h, 14); g.fillStyle = "rgba(255,255,255,.08)"; g.fill();
      for (let k = 0; k < 21; k++){ const gx = T.x + (k % T.cols)*T.cw, gy = T.y + Math.floor(k/T.cols)*T.ch, O = k === sel ? BX_O[k][ori] : BX_O[k][0], w = Math.max(...O.map(q => q[0])) + 1, h = Math.max(...O.map(q => q[1])) + 1, u = Math.min(T.cw*.86/Math.max(w, 2), T.ch*.86/Math.max(h, 2));
        if (k === sel){ rrect(g, gx + 2, gy + 2, T.cw - 4, T.ch - 4, 10); g.fillStyle = "rgba(255,212,59,.35)"; g.fill(); }
        if (used[s][k]) continue; const ox = gx + (T.cw - w*u)/2, oy = gy + (T.ch - h*u)/2; O.forEach(([dx, dy]) => cell(g, ox + dx*u, oy + dy*u, s, u, can ? 1 : .55)); }
      B2.btn(g, L.rot, false, sel < 0 || !can); B2.btn(g, L.flp, false, sel < 0 || !can);
      if (can && sel < 0 && !win) outlined(g, B.w > B.h ? "👉 조각을 고르고 판을 톡톡!" : "👇 조각을 고르고 판을 톡톡!", B.x + S/2, B.y + S - 20, Math.min(24, S/20), "#5f3dc4");
      g.restore(); },
    ai(lv, done){
      const s = turn, o = 1 - s, M = gen(s, false); if (!M.length){ done(null); return; }
      const oc = new Set(corners(o)), C = [];
      for (const m of M){ let v = m.cells.length*12;
        for (const i of m.cells){ if (oc.has(i)) v += 8; const x = i % N, y = (i/N) | 0; v -= (Math.abs(x - 6.5) + Math.abs(y - 6.5))*(used[s].filter(Boolean).length < 6 ? .9 : .2); }
        C.push({m: {p: m.p, t: m.t, at: m.at}, s: v + Math.random()*(lv === 0 ? 30 : lv === 1 ? 6 : 1)}); }
      if (lv === 2){ C.sort((a, z) => z.s - a.s); for (const x of C.slice(0, 12)){ const cells = fits(s, x.m.p, x.m.t, x.m.at); cells.forEach(i => b[i] = s + 1); used[s][x.m.p] = 1; x.s += corners(s).length*2 - corners(o).length*2.5; cells.forEach(i => b[i] = 0); used[s][x.m.p] = 0; } }
      done(B2.choose(C, lv)); }
  };
  return bdCtl("bx", G);
};

/* 대결 창의 '어떻게 해요' 한 줄 */
window.BD2_HELP = {
  ot: "놓을 수 있는 곳(동그라미)을 톡! 상대 돌을 내 돌 사이에 끼우면 뒤집혀요. 돌이 많으면 승리",
  c4: "떨어뜨릴 줄을 톡! 가로·세로·대각선으로 네 개를 먼저 이으면 승리",
  ck: "노란 테두리 말을 고르고 초록 점으로 옮겨요. 잡을 수 있으면 꼭 잡아야 해요. 끝 줄에 가면 👑 왕!",
  mk: "내 쪽 구멍을 톡! 씨앗을 하나씩 뿌려요. 창고에 쏙 들어가면 한 번 더, 빈 구멍에 떨어지면 맞은편을 가져와요",
  gd: "놓을 곳을 두 번 톡톡! 상대 돌을 둘러싸 숨구멍을 다 막으면 잡아요. 먼저 5개 잡으면 승리",
  yt: "🎋 윷 던지기를 누르고, 움직일 말을 두 번 톡톡! 윷·모·잡기는 한 번 더. 같은 편 말은 업고 가요",
  qr: "🚶 말: 노란 점으로 한 칸씩 · 🧱 벽: 놓을 곳을 두 번 톡톡! 건너편 끝줄에 먼저 가면 승리",
  bx: "조각을 고르고 판을 두 번 톡톡! 내 조각끼리는 모서리만 닿아야 해요. 남은 칸이 적은 쪽이 승리"
};
