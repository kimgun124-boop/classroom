/* =====================================================================
   💦 물풍선 대작전 — 미로에서 물풍선을 놓아 친구를 물방울에 가둬요 (최대 6명)
   - 한 기기에서 사람 2명까지 + 🤖 컴퓨터 친구로 최대 6명
   - 🌐 온라인 방: 방장 기기가 심판, 친구 최대 5명이 각자 기기로 (PARTY)
   ⚡ 렉 줄이기: 바닥·기둥·상자는 한 장으로 미리 그려 두고, 바뀔 때만 다시 그려요.
      물풍선·물줄기·아이템·몸통은 한 번 그린 그림을 붙여요. 매 장면 그림자 번짐은 쓰지 않아요.
   ===================================================================== */
const G2 = {
  cache: new Map(), ck: 0,
  /* 그림 기억: key마다 한 번만 그려요 (화면 배율이 바뀌면 다시) */
  spr(key, w, h, fn){
    const k = NG.k || 1; if (k !== this.ck){ this.cache.clear(); this.ck = k; }
    let c = this.cache.get(key);
    if (!c){ if (this.cache.size > 500) this.cache.clear();
      c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w*k)); c.height = Math.max(1, Math.ceil(h*k));
      const t = c.getContext("2d"); t.scale(k, k); fn(t, w, h); c.w = w; c.h = h; this.cache.set(key, c); }
    return c;
  },
  /* 화면 점에 딱 맞춰 붙이기 (흐려짐 없이) */
  put(g, c, x, y, w = c.w, h = c.h){ const k = NG.k || 1; g.drawImage(c, Math.round(x*k)/k, Math.round(y*k)/k, w, h); },
  emo(t, e, x, y, size){ t.font = `${size}px ${EMOJI}`; t.textAlign = "center"; t.textBaseline = "middle"; t.fillText(e, x, y); }
};

NG.defs.wb = () => {
  const O = NG.opt || {}, SIDS = NG.sids.slice(), N = SIDS.length;
  const BIG = N > 4, C = BIG ? 17 : 15, R = BIG ? 13 : 11, T = BIG ? 48 : 56, FW = C*T, FH = R*T, TOP = 78;
  const PCOL = ["#339af0","#ff6b6b","#51cf66","#fcc419","#cc5de8","#ff922b"], PNAME = ["파랑","빨강","초록","노랑","보라","주황"];
  const SPAWN = BIG ? [[0,0],[16,12],[16,0],[0,12],[8,0],[8,12]] : [[0,0],[14,10],[14,0],[0,10]];
  const WINR = 2, ROUND = 100*60, SHRINK_AT = 40*60, FUSE = 150, BLAST = 30, TRAP = 190;
  const party = O.party || null;                // "host" | "guest" | null
  const myIdx = party === "guest" ? O.idx : 0;
  const isBot = i => (O.bots || []).includes(i);
  const isRemote = i => party === "host" && (O.remote || {})[i] != null;
  const local = (O.local || [0]).slice();        // 이 기기에서 조작하는 사람 (최대 2명)
  const lv = O.lv ?? 1;
  let W = 1300, H = 700, land = true, FX = 230, FY = TOP, PADS = [];
  let G, IT, P, B, E, FXS, IN, phase, pt, tm, rd, wins, shrinkI, SPIRAL, layer, layerDirty, gv, dmap, dmapF, banner, ended, winner, seed, ptr, keyStack, NQ, lastSnapT;
  /* ---------- 작은 도구 ---------- */
  const K = (c, r) => c + r*C, inb = (c, r) => c >= 0 && r >= 0 && c < C && r < R;
  let rs = 1; const rand = () => { rs = (rs*16807) % 2147483647; return (rs - 1)/2147483646; };
  const cellOf = p => [Math.round(p.x), Math.round(p.y)];
  const bombAt = (c, r) => B.find(b => b.c === c && b.r === r);
  const sfx = (k, a, b) => { playS(k); if (party === "host") NQ.push(["s", k]); };
  function playS(k){
    if (k === "plop") tone(300, 520, .08, "sine", .12);
    else if (k === "boom"){ tone(220, 70, .35, "sawtooth", .07); tone(900, 200, .25, "triangle", .06); }
    else if (k === "trap") tone(500, 1200, .3, "sine", .12);
    else if (k === "pop"){ tone(1400, 300, .18, "square", .1); tone(200, 80, .3, "sine", .14, .05); }
    else if (k === "item") SFX.item();
    else if (k === "free") [700, 1050, 1400].forEach((f, i) => tone(f, f, .07, "triangle", .1, i*.05));
    else if (k === "go") [523, 659, 784, 1046].forEach((f, i) => tone(f, f, .12, "square", .07, i*.08));
    else if (k === "win") SFX.rec();
    else if (k === "tick") tone(880, 880, .05, "square", .05);
  }

  /* ---------- 판 만들기 ---------- */
  function newRound(){
    rs = (seed + rd*7919) % 2147483646 + 1;
    G = new Uint8Array(C*R); IT = new Uint8Array(C*R);
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++){ if (c % 2 === 1 && r % 2 === 1) G[K(c, r)] = 1; }
    const safe = new Set(); SPAWN.slice(0, Math.max(N, 2)).forEach(([c, r]) => [[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx, dy]) => { if (inb(c + dx, r + dy)) safe.add(K(c + dx, r + dy)); }));
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++){ const k = K(c, r); if (!G[k] && !safe.has(k) && rand() < .72) G[k] = 2; }
    P = SIDS.map((sid, i) => ({sid, i, x: SPAWN[i][0], y: SPAWN[i][1], d: 2, mv: 0, wk: 0, sp: 0, nb: 1, rg: 2, ndl: 0, alive: true, trap: 0, inv: 0, pass: -1, popBy: -1, ai: {t: 0, path: [], bomb: 0}}));
    B = []; E = []; FXS = []; IN = SIDS.map(() => ({d: 0, b: 0, bp: 0, nd: 0}));
    phase = "ready"; pt = 110; tm = ROUND; shrinkI = 0; layerDirty = true; gv++; banner = {t: `${rd}라운드!`, s: "준비…", k: 110};
    SPIRAL = []; { let x0 = 0, y0 = 0, x1 = C - 1, y1 = R - 1; while (x0 <= x1 && y0 <= y1){ for (let c = x0; c <= x1; c++) SPIRAL.push([c, y0]); for (let r = y0 + 1; r <= y1; r++) SPIRAL.push([x1, r]);
      if (y1 > y0) for (let c = x1 - 1; c >= x0; c--) SPIRAL.push([c, y1]); if (x1 > x0) for (let r = y1 - 1; r > y0; r--) SPIRAL.push([x0, r]); x0++; y0++; x1--; y1--; } }
    { const cc = (C - 1)/2, rc = (R - 1)/2; SPIRAL = SPIRAL.filter(([c, r]) => !(Math.abs(c - cc) <= 2 && Math.abs(r - rc) <= 1)); }   // 가운데 작은 마당은 남겨요
  }
  function startMatch(){ wins = SIDS.map(() => 0); rd = 1; ended = false; winner = -1; gv = 0; newRound(); }

  /* ---------- 움직이기 (길 모서리에서 살짝 밀어 줘요) ---------- */
  function free(c, r, p){ if (!inb(c, r)) return false; const k = K(c, r); if (G[k]) return false; const b = bombAt(c, r); return !b || (p && p.pass === k); }
  function moveP(p, dir, v){
    if (!dir) return false;
    const dx = dir === 3 ? -1 : dir === 4 ? 1 : 0, dy = dir === 1 ? -1 : dir === 2 ? 1 : 0;
    const cx = Math.round(p.x), cy = Math.round(p.y);
    if (dx){
      const off = p.y - cy, offx = p.x - cx;
      if (free(cx + dx, cy, p) || offx*dx < -.001){
        if (Math.abs(off) > .001){ const s = Math.min(v, Math.abs(off)); p.y -= Math.sign(off)*s; v -= s; }
        p.x += dx*v; const nx = Math.round(p.x); if (!free(nx + dx, cy, p) && (p.x - nx)*dx > 0) p.x = nx;
        return true;
      }
      if (Math.abs(off) > .1){ const sg = Math.sign(off); if (free(cx + dx, cy + sg, p) && free(cx, cy + sg, p)){ p.y += sg*Math.min(v, .5 - Math.abs(off) + .5); return true; } }
      p.x = cx; return false;
    } else {
      const off = p.x - cx, offy = p.y - cy;
      if (free(cx, cy + dy, p) || offy*dy < -.001){
        if (Math.abs(off) > .001){ const s = Math.min(v, Math.abs(off)); p.x -= Math.sign(off)*s; v -= s; }
        p.y += dy*v; const ny = Math.round(p.y); if (!free(cx, ny + dy, p) && (p.y - ny)*dy > 0) p.y = ny;
        return true;
      }
      if (Math.abs(off) > .1){ const sg = Math.sign(off); if (free(cx + sg, cy + dy, p) && free(cx + sg, cy, p)){ p.x += sg*Math.min(v, .5 - Math.abs(off) + .5); return true; } }
      p.y = cy; return false;
    }
  }
  const speedOf = p => (2.9 + p.sp*.45)/60;

  /* ---------- 물풍선 ---------- */
  function place(p){
    if (!p.alive || p.trap || phase !== "play") return;
    const [c, r] = cellOf(p); if (G[K(c, r)] || bombAt(c, r)) return;
    if (B.filter(b => b.own === p.i).length >= p.nb) return;
    B.push({c, r, t: FUSE, own: p.i, rg: p.rg}); p.pass = K(c, r); sfx("plop");
  }
  function rayCells(c, r, rg, cb){
    cb(c, r, "c");
    [[0,-1,"u"],[0,1,"d"],[-1,0,"l"],[1,0,"r"]].forEach(([dx, dy, n]) => {
      for (let k = 1; k <= rg; k++){ const x = c + dx*k, y = r + dy*k; if (!inb(x, y) || G[K(x, y)] === 1) break;
        const stop = cb(x, y, k === rg ? n : (dx ? "h" : "v")) === false || G[K(x, y)] === 2; if (stop) break; }
    });
  }
  function boom(b){
    B.splice(B.indexOf(b), 1);
    const cells = [], breaks = [];
    rayCells(b.c, b.r, b.rg, (x, y, kind) => {
      const k = K(x, y);
      if (G[k] === 2){ cells.push([x, y, kind === "c" ? "c" : kind.length === 1 && "udlr".includes(kind) ? kind : ({h: "r", v: "d"})[kind] || kind]); breaks.push(k); return false; }
      cells.push([x, y, kind]);
      if (IT[k]){ IT[k] = 0; layerDirty = true; gv++; }
      const o = bombAt(x, y); if (o && o !== b) o.t = Math.min(o.t, 3);
    });
    breaks.forEach(k => { G[k] = 0; const c = k % C, r = (k - c)/C; if (rand() < .42){ const v = rand(); IT[k] = v < .34 ? 1 : v < .68 ? 2 : v < .9 ? 3 : 4; } spawnFx("crate", c, r); });
    if (breaks.length){ layerDirty = true; gv++; }
    E.push({cells, t: BLAST}); sfx("boom"); if (party === "host") NQ.push(["e", cells]);
    spawnFx("splash", b.c, b.r);
  }
  function spawnFx(kind, c, r, extra){
    if (FXS.length > 220) FXS.splice(0, 40);
    const x = c, y = r;
    if (kind === "crate") for (let i = 0; i < 6; i++) FXS.push({k: "sh", x: x + rnd(-.2, .2), y: y + rnd(-.2, .2), vx: rnd(-.08, .08), vy: rnd(-.12, -.02), t: 30, c: ["#ff8787","#ffd43b","#74c0fc","#b197fc"][i % 4], rot: rnd(6)});
    else if (kind === "splash") for (let i = 0; i < 8; i++){ const a = i/8*Math.PI*2; FXS.push({k: "dr", x, y, vx: Math.cos(a)*.07, vy: Math.sin(a)*.07, t: 22}); }
    else if (kind === "pop") for (let i = 0; i < 14; i++){ const a = i/14*Math.PI*2; FXS.push({k: "dr", x, y, vx: Math.cos(a)*.1, vy: Math.sin(a)*.1, t: 28}); }
    else if (kind === "txt") FXS.push({k: "tx", x, y, t: 50, s: extra});
    if (party === "host") NQ.push(["f", kind, c, r, extra]);
  }

  /* ---------- 위험 지도 (컴퓨터 친구가 피할 때 써요) ---------- */
  function danger(){
    if (dmapF === NG.frame && dmap) return dmap;
    const D = new Float32Array(C*R).fill(Infinity), te = B.map(b => b.t);
    for (let pass = 0; pass < 3; pass++) B.forEach((b, i) => rayCells(b.c, b.r, b.rg, (x, y) => { const j = B.findIndex(o => o.c === x && o.r === y); if (j >= 0 && te[j] > te[i]) te[j] = te[i]; if (G[K(x, y)] === 2) return false; }));
    B.forEach((b, i) => rayCells(b.c, b.r, b.rg, (x, y) => { const k = K(x, y); if (te[i] < D[k]) D[k] = te[i]; if (G[k] === 2) return false; }));
    E.forEach(e => e.cells.forEach(([x, y]) => D[K(x, y)] = 0));
    if (tm < SHRINK_AT) for (let i = shrinkI; i < Math.min(SPIRAL.length, shrinkI + 8); i++){ const [x, y] = SPIRAL[i]; D[K(x, y)] = Math.min(D[K(x, y)], (i - shrinkI)*10); }
    dmap = D; dmapF = NG.frame; return D;
  }
  function bfs(start, me, goal, D, maxD = 60){
    const prev = new Int16Array(C*R).fill(-2), dist = new Int16Array(C*R).fill(-1), q = [start]; prev[start] = -1; dist[start] = 0;
    const fpt = Math.round(1/speedOf(me));
    for (let h = 0; h < q.length; h++){ const k = q[h]; if (k !== start && goal(k, dist[k])){ const path = []; let x = k; while (x !== start){ path.unshift(x); x = prev[x]; } return path; }
      if (dist[k] >= maxD) continue;
      const c = k % C, r = (k - c)/C;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const x = c + dx, y = r + dy; if (!inb(x, y)) continue; const n = K(x, y);
        if (prev[n] !== -2 || G[n] || (bombAt(x, y) && n !== start)) continue;
        const arrive = (dist[k] + 1)*fpt; if (D && D[n] <= arrive + 12 && D[n] >= arrive - 26) continue;   // 터지는 순간 지나가지 않게
        if (D && D[n] === 0) continue;
        prev[n] = k; dist[n] = dist[k] + 1; q.push(n); } }
    return null;
  }
  const lineHit = (c, r, rg, tc, tr) => { let hit = false; rayCells(c, r, rg, (x, y) => { if (x === tc && y === tr) hit = true; }); return hit; };
  function aiThink(p){
    const A = p.ai, D = danger(), [c, r] = cellOf(p), me = K(c, r), L = [{every: 16, miss: .3, aggr: .35}, {every: 9, miss: .12, aggr: .6}, {every: 5, miss: .03, aggr: .85}][lv];
    if (p.trap){ if (p.ndl && p.trap < TRAP - 30) IN[p.i].nd = 1; A.path = []; return; }
    const foes = P.filter(o => o !== p && o.alive);
    if (D[me] < Infinity){ const path = bfs(me, p, k => D[k] === Infinity, D); if (path){ A.path = path; return; } }
    const trapped = foes.find(o => o.trap); if (trapped){ const [tc, tr] = cellOf(trapped), path = bfs(me, p, k => k === K(tc, tr), D, 30); if (path){ A.path = path; return; } }
    const mine = B.filter(b => b.own === p.i).length;
    if (mine < p.nb && rand() > L.miss){
      const nearCrate = [[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => inb(c + dx, r + dy) && G[K(c + dx, r + dy)] === 2);
      const foeLine = foes.some(o => { const [oc, or] = cellOf(o); return lineHit(c, r, p.rg, oc, or); });
      if ((nearCrate && rand() < .8) || (foeLine && rand() < L.aggr)){
        const D2 = Float32Array.from(D); rayCells(c, r, p.rg, (x, y) => { const k = K(x, y); if (FUSE < D2[k]) D2[k] = FUSE; if (G[k] === 2) return false; });
        const path = bfs(me, p, k => D2[k] === Infinity, D2, 12);
        if (path){ A.bomb = 1; A.path = path; return; }
      }
    }
    if (tm < SHRINK_AT){ const cc = (C - 1)/2, rc = (R - 1)/2, path = bfs(me, p, k => Math.abs(k % C - cc) <= 2 && Math.abs((k - k % C)/C - rc) <= 1 && D[k] === Infinity, D, 60); if (path && path.length){ A.path = path; return; } }
    if (foes.length && rand() < L.aggr*.45){ const o = foes[Math.floor(rand()*foes.length)], [oc, or] = cellOf(o), path = bfs(me, p, k => (k % C === oc || (k - k % C)/C === or) && Math.abs(k % C - oc) + Math.abs((k - k % C)/C - or) <= Math.min(p.rg, 3) && D[k] === Infinity, D, 24); if (path && path.length){ A.path = path; return; } }
    let path = bfs(me, p, k => IT[k] > 0 && D[k] === Infinity, D, 10);
    if (!path) path = bfs(me, p, k => D[k] === Infinity && [[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => { const x = k % C + dx, y = (k - k % C)/C + dy; return inb(x, y) && G[K(x, y)] === 2; }), D, 14);
    if (!path && foes.length){ const o = foes[Math.floor(rand()*foes.length)], [oc, or] = cellOf(o); path = bfs(me, p, k => Math.abs(k % C - oc) + Math.abs((k - k % C)/C - or) <= 2 && D[k] === Infinity, D, 40); }
    A.path = path || [];
  }
  function aiStep(p){
    const A = p.ai, L = [16, 9, 5][lv];
    if (--A.t <= 0){ A.t = L + Math.floor(rand()*4); aiThink(p); }
    if (A.bomb){ A.bomb = 0; place(p); }
    while (A.path.length){ const k = A.path[0], nc = k % C, nr = (k - nc)/C; if (Math.abs(p.x - nc) < .08 && Math.abs(p.y - nr) < .08){ p.x = nc; p.y = nr; A.path.shift(); } else break; }
    if (!A.path.length){ IN[p.i].d = 0; return; }
    const k = A.path[0], nc = k % C, nr = (k - nc)/C, dx = nc - p.x, dy = nr - p.y;
    if (G[k] || (bombAt(nc, nr) && p.pass !== k)){ A.path = []; A.t = 0; IN[p.i].d = 0; return; }
    IN[p.i].d = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 3 : 4) : (dy < 0 ? 1 : 2);
  }

  /* ---------- 한 장면 ---------- */
  function sim(){
    if (phase === "ready"){ if (--pt <= 0){ phase = "play"; sfx("go"); banner = {t: "시작!", s: "", k: 50}; } else if (pt === 50) banner = {t: `${rd}라운드!`, s: "시작합니다", k: 50}; return; }
    if (phase === "end"){ if (--pt <= 0) nextRound(); return; }
    tm--;
    if (tm === SHRINK_AT){ banner = {t: "⚠️ 판이 좁아져요!", s: "가운데로 모여요", k: 90}; sfx("tick"); }
    if (tm < SHRINK_AT && shrinkI < SPIRAL.length && tm % 10 === 0){
      const [x, y] = SPIRAL[shrinkI++], k = K(x, y); G[k] = 1; IT[k] = 0; const bb = bombAt(x, y); if (bb) B.splice(B.indexOf(bb), 1); layerDirty = true; gv++;
      P.forEach(p => { if (p.alive){ const [c, r] = cellOf(p); if (c === x && r === y){ p.alive = false; spawnFx("pop", c, r); sfx("pop"); } } });
    }
    if (tm <= 0){ endRound(-1); return; }
    // 조작
    P.forEach(p => {
      if (!p.alive) return;
      if (isBot(p.i)) aiStep(p);
      const In = IN[p.i];
      if (In.b !== In.bp){ In.bp = In.b; if (p.trap){ if (p.ndl){ p.ndl--; p.trap = 0; p.inv = 60; sfx("free"); spawnFx("txt", p.x, p.y - .6, "📌 탈출!"); } } else place(p); }
      if (In.nd){ In.nd = 0; if (p.trap && p.ndl){ p.ndl--; p.trap = 0; p.inv = 60; sfx("free"); } }
      const v = speedOf(p)*(p.trap ? .22 : 1);
      if (In.d){ p.d = In.d; p.mv = moveP(p, In.d, v) ? 1 : 0; if (p.mv) p.wk++; } else p.mv = 0;
      if (p.pass >= 0){ const c = p.pass % C, r = (p.pass - c)/C; if (Math.abs(p.x - c) + Math.abs(p.y - r) > .92 || !bombAt(c, r)) p.pass = -1; }
      if (p.inv) p.inv--;
      // 아이템
      const [c, r] = cellOf(p), k = K(c, r);
      if (IT[k] && !p.trap){ const it = IT[k]; IT[k] = 0; layerDirty = true; gv++;
        if (it === 1) p.nb = Math.min(7, p.nb + 1); else if (it === 2) p.rg = Math.min(8, p.rg + 1); else if (it === 3) p.sp = Math.min(6, p.sp + 1); else p.ndl = Math.min(3, p.ndl + 1);
        sfx("item"); spawnFx("txt", p.x, p.y - .6, ["","💧 풍선 +1","🌊 물줄기 +1","👟 빨라져요","📌 바늘"][it]); }
    });
    // 풍선 터지기
    for (let i = B.length - 1; i >= 0; i--){ const b = B[i]; if (b && --b.t <= 0) boom(b); }
    // 물줄기에 닿으면 물방울에 갇혀요
    const wet = new Set(); E.forEach(e => { if (e.t > 6) e.cells.forEach(([x, y]) => wet.add(K(x, y))); });
    P.forEach(p => { if (!p.alive || p.trap || p.inv) return; const [c, r] = cellOf(p); if (wet.has(K(c, r))){ p.trap = TRAP; sfx("trap"); } });
    E.forEach(e => e.t--); E = E.filter(e => e.t > 0);
    // 갇힌 친구: 시간이 다 되거나 다른 친구가 건드리면 펑!
    P.forEach(p => {
      if (!p.alive || !p.trap) return;
      p.trap--;
      const hit = P.find(o => o !== p && o.alive && !o.trap && Math.hypot(o.x - p.x, o.y - p.y) < .78);
      if (hit || p.trap <= 0){ p.alive = false; p.trap = 0; p.popBy = hit ? hit.i : -1; spawnFx("pop", p.x, p.y); sfx("pop"); if (hit) spawnFx("txt", hit.x, hit.y - .7, "💥 펑!"); }
    });
    const alive = P.filter(p => p.alive);
    if (alive.length <= 1) endRound(alive.length ? alive[0].i : -1);
  }
  function endRound(w){
    if (phase === "end") return;
    phase = "end"; pt = 150; winner = w;
    if (w >= 0){ wins[w]++; const nm = isBot(w) ? `🤖 ${PNAME[w]}` : who(noOf_(SIDS[w])); banner = {t: wins[w] >= WINR ? "🏆 최종 승리!" : `${nm} 승리!`, s: wins[w] >= WINR ? nm : `${wins[w]}승`, k: 150, c: PCOL[w]}; sfx("win"); }
    else banner = {t: "무승부!", s: "이번 판은 다시 해요", k: 150};
  }
  function nextRound(){
    if (winner >= 0 && wins[winner] >= WINR){ finish(winner); return; }
    rd++; newRound();
  }
  function finish(w){
    if (ended) return; ended = true;
    if (party === "host") PARTY.sendAll({t: "end", w, wins});
    WB.result(w, SIDS, O, wins);
  }

  /* ---------- 화면 배치 (가로·세로) ---------- */
  function layout(sw, sh){
    land = sw/Math.max(1, sh) >= 1.2;
    const two = local.length >= 2;
    if (land){ const side = 236; W = FW + side*2; H = FH + TOP + 10; FX = side; FY = TOP;
      PADS = two ? [{pl: local[0], t: "d", x: side/2, y: H - 150, r: 92}, {pl: local[0], t: "b", x: side/2, y: TOP + 140, r: 66},
                    {pl: local[1], t: "d", x: W - side/2, y: H - 150, r: 92}, {pl: local[1], t: "b", x: W - side/2, y: TOP + 140, r: 66}]
                 : [{pl: local[0], t: "d", x: side/2, y: H - 160, r: 96}, {pl: local[0], t: "b", x: W - side/2, y: H - 160, r: 84}];
    } else { W = Math.max(FW + 16, 820); H = FH + TOP + 300; FX = (W - FW)/2; FY = TOP;
      PADS = two ? [{pl: local[0], t: "d", x: 130, y: H - 150, r: 100}, {pl: local[0], t: "b", x: 310, y: H - 150, r: 64},
                    {pl: local[1], t: "b", x: W - 310, y: H - 150, r: 64}, {pl: local[1], t: "d", x: W - 130, y: H - 150, r: 100}]
                 : [{pl: local[0], t: "d", x: 160, y: H - 150, r: 110}, {pl: local[0], t: "b", x: W - 160, y: H - 150, r: 92}];
    }
    layerDirty = true;
  }

  /* ---------- 그림 (한 번 그려 기억) ---------- */
  const sp = (key, w, h, fn) => G2.spr("wb" + key, w, h, fn);
  /* 친구 칸 아래 작은 능력치 줄 (그림 기억) */
  function statSpr(p, wide){
    const L = [["💧", p.nb], ["🌊", p.rg]]; if (wide || p.sp) { if (p.sp) L.push(["👟", p.sp]); } if (p.ndl) L.push(["📌", p.ndl]);
    const fs = wide ? 15 : 13, cw2 = fs*1.9, w = L.length*cw2, h = fs + 8;
    return sp(`st${wide ? 1 : 0}${L.map(a => a.join("")).join("|")}`, w, h, t => { L.forEach(([e, v], i) => { const x = i*cw2; G2.emo(t, e, x + fs*.5, h/2, fs*.95); outlinedRaw(t, String(v), x + fs*1.35, h/2 + 1, fs, "#fff"); }); });
  }
  function tileFloor(t, x, y, alt){ t.fillStyle = alt ? "#b2f2bb" : "#c3fae8"; t.fillRect(x, y, T, T); t.fillStyle = alt ? "rgba(43,138,62,.12)" : "rgba(12,166,120,.1)";
    t.fillRect(x + T*.2, y + T*.62, 3, 7); t.fillRect(x + T*.7, y + T*.25, 3, 7); t.fillRect(x + T*.5, y + T*.8, 3, 6); }
  function drawPillar(t, x, y){
    t.fillStyle = "rgba(0,0,0,.18)"; rrect(t, x + 6, y + 8, T - 6, T - 6, 10); t.fill();
    t.fillStyle = "#7048e8"; rrect(t, x + 2, y + 2, T - 6, T - 6, 10); t.fill();
    t.fillStyle = "#9775fa"; rrect(t, x + 2, y + 2, T - 6, T*.62, 10); t.fill();
    t.fillStyle = "rgba(255,255,255,.35)"; rrect(t, x + 8, y + 7, T - 20, 6, 3); t.fill();
    const cx = x + T/2 - 2, cy = y + T*.36, s = T*.16; t.fillStyle = "#ffe066"; t.beginPath(); for (let i = 0; i < 10; i++){ const a = -Math.PI/2 + i*Math.PI/5, rr = i % 2 ? s*.45 : s; t.lineTo(cx + Math.cos(a)*rr, cy + Math.sin(a)*rr); } t.closePath(); t.fill();
  }
  function drawCrate(t, x, y, v){
    const col = [["#ff8787","#e03131"],["#74c0fc","#1971c2"],["#ffd43b","#f08c00"],["#b197fc","#7048e8"]][v % 4];
    t.fillStyle = "rgba(0,0,0,.16)"; rrect(t, x + 6, y + 9, T - 8, T - 9, 8); t.fill();
    t.fillStyle = col[1]; rrect(t, x + 4, y + T*.3, T - 8, T*.64, 7); t.fill();
    t.fillStyle = col[0]; rrect(t, x + 3, y + T*.18, T - 6, T*.26, 6); t.fill();
    t.fillStyle = "#fff"; t.fillRect(x + T/2 - 4, y + T*.18, 8, T*.76); t.fillRect(x + 4, y + T*.56, T - 8, 6);
    t.fillStyle = "rgba(255,255,255,.4)"; t.fillRect(x + 8, y + T*.21, T*.3, 4);
    t.fillStyle = "#fff"; t.beginPath(); t.ellipse(x + T/2 - 8, y + T*.15, 8, 5, -.5, 0, 7); t.ellipse(x + T/2 + 8, y + T*.15, 8, 5, .5, 0, 7); t.fill();
    t.fillStyle = "#ffe3e3"; t.beginPath(); t.arc(x + T/2, y + T*.17, 4, 0, 7); t.fill();
  }
  const ITEM = ["", "💧", "🌊", "👟", "📌"], ICOL = ["", "#4dabf7", "#3bc9db", "#ff922b", "#e64980"];
  const itemSpr = n => sp("it" + n + T, T, T, t => { const r = T*.36; t.fillStyle = "rgba(0,0,0,.15)"; t.beginPath(); t.ellipse(T/2, T*.86, r*.8, r*.22, 0, 0, 7); t.fill();
    const gr = t.createRadialGradient(T/2 - r*.35, T/2 - r*.45, 2, T/2, T/2, r); gr.addColorStop(0, "#fff"); gr.addColorStop(.6, ICOL[n] + "aa"); gr.addColorStop(1, ICOL[n]);
    t.fillStyle = gr; t.beginPath(); t.arc(T/2, T/2, r, 0, 7); t.fill(); t.strokeStyle = "#fff"; t.lineWidth = 3; t.stroke(); G2.emo(t, ITEM[n], T/2, T/2 + 1, r*1.1); });
  function renderLayer(){
    if (!layer) layer = document.createElement("canvas");
    const k = NG.k || 1; if (layer.width !== Math.ceil(FW*k)){ layer.width = Math.ceil(FW*k); layer.height = Math.ceil(FH*k); }
    const t = layer.getContext("2d"); t.setTransform(k, 0, 0, k, 0, 0);
    const pil = sp("pil" + T, T, T, (u) => drawPillar(u, 0, 0)), cr = [0,1,2,3].map(v => sp("cr" + v + T, T, T, u => drawCrate(u, 0, 0, v)));
    const fl = [0, 1].map(a => sp("fl" + a + T, T, T, u => tileFloor(u, 0, 0, a)));
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++){ const x = c*T, y = r*T, k2 = K(c, r); t.drawImage(fl[(c + r) % 2], x, y, T, T);
      if (G[k2] === 1) t.drawImage(pil, x, y, T, T); else if (G[k2] === 2) t.drawImage(cr[(c*7 + r*3) % 4], x, y, T, T); }
    layerDirty = false;
  }
  const balloonSpr = (hot) => sp("bal" + hot + T, T, T, t => { const r = T*.34, cx = T/2, cy = T*.52;
    t.fillStyle = "rgba(0,0,0,.18)"; t.beginPath(); t.ellipse(cx, T*.9, r*.8, r*.22, 0, 0, 7); t.fill();
    const gr = t.createRadialGradient(cx - r*.35, cy - r*.4, 2, cx, cy, r*1.05); gr.addColorStop(0, hot ? "#ffc9c9" : "#d0ebff"); gr.addColorStop(.55, hot ? "#ff6b6b" : "#4dabf7"); gr.addColorStop(1, hot ? "#c92a2a" : "#1864ab");
    t.fillStyle = gr; t.beginPath(); t.ellipse(cx, cy, r, r*1.08, 0, 0, 7); t.fill();
    t.fillStyle = hot ? "#c92a2a" : "#1864ab"; t.beginPath(); t.moveTo(cx - 5, cy - r*1.05); t.lineTo(cx + 5, cy - r*1.05); t.lineTo(cx, cy - r*1.05 - 8); t.closePath(); t.fill();
    t.fillStyle = "rgba(255,255,255,.75)"; t.beginPath(); t.ellipse(cx - r*.38, cy - r*.4, r*.18, r*.3, -.5, 0, 7); t.fill(); });
  const waterSpr = kind => sp("w" + kind + T, T, T, t => {
    const m = T/2, core = (x, y, w, h) => { t.fillStyle = "#74c0fc"; rrect(t, x, y, w, h, Math.min(w, h)/2); t.fill(); t.fillStyle = "#e7f5ff"; rrect(t, x + w*.2, y + h*.25, w*.6, h*.5, Math.min(w, h)*.25); t.fill(); };
    if (kind === "c"){ t.fillStyle = "#4dabf7"; t.beginPath(); for (let i = 0; i < 16; i++){ const a = i/16*Math.PI*2, rr = i % 2 ? T*.36 : T*.5; t.lineTo(m + Math.cos(a)*rr, m + Math.sin(a)*rr); } t.closePath(); t.fill();
      t.fillStyle = "#e7f5ff"; t.beginPath(); t.arc(m, m, T*.24, 0, 7); t.fill(); return; }
    if (kind === "h") core(0, T*.2, T, T*.6); else if (kind === "v") core(T*.2, 0, T*.6, T);
    else { const L = {l: [T*.12, T*.2, T*.88, T*.6], r: [0, T*.2, T*.88, T*.6], u: [T*.2, T*.12, T*.6, T*.88], d: [T*.2, 0, T*.6, T*.88]}[kind]; core(...L);
      t.fillStyle = "#a5d8ff"; const ex = {l: [T*.14, m], r: [T*.86, m], u: [m, T*.14], d: [m, T*.86]}[kind]; t.beginPath(); t.arc(ex[0], ex[1], T*.22, 0, 7); t.fill(); }
  });
  const bodySpr = i => sp("bd" + i + T, T, T, t => { const c = PCOL[i];
    t.fillStyle = "rgba(0,0,0,.2)"; t.beginPath(); t.ellipse(T/2, T*.92, T*.3, T*.08, 0, 0, 7); t.fill();
    t.fillStyle = c; t.beginPath(); t.ellipse(T/2, T*.7, T*.27, T*.22, 0, 0, 7); t.fill();
    t.fillStyle = "rgba(255,255,255,.35)"; t.beginPath(); t.ellipse(T/2 - T*.08, T*.63, T*.09, T*.05, 0, 0, 7); t.fill(); });
  const bubbleSpr = () => sp("bub" + T, T*1.4, T*1.4, t => { const m = T*.7, r = T*.66;
    const gr = t.createRadialGradient(m - r*.3, m - r*.35, 4, m, m, r); gr.addColorStop(0, "rgba(255,255,255,.75)"); gr.addColorStop(.6, "rgba(165,216,255,.35)"); gr.addColorStop(1, "rgba(77,171,247,.65)");
    t.fillStyle = gr; t.beginPath(); t.arc(m, m, r, 0, 7); t.fill(); t.strokeStyle = "rgba(255,255,255,.9)"; t.lineWidth = 3; t.stroke();
    t.fillStyle = "rgba(255,255,255,.9)"; t.beginPath(); t.ellipse(m - r*.42, m - r*.42, r*.16, r*.28, -.7, 0, 7); t.fill(); });
  const padSpr = (kind, r, col) => sp(`pad${kind}${r}${col}`, r*2 + 8, r*2 + 8, t => { const m = r + 4;
    if (kind === "d"){ t.fillStyle = "rgba(20,15,46,.45)"; t.beginPath(); t.arc(m, m, r, 0, 7); t.fill(); t.strokeStyle = "rgba(255,255,255,.55)"; t.lineWidth = 3; t.stroke();
      t.fillStyle = "rgba(255,255,255,.85)"; [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx, dy]) => { t.save(); t.translate(m + dx*r*.62, m + dy*r*.62); t.rotate(Math.atan2(dy, dx)); t.beginPath(); t.moveTo(r*.18, 0); t.lineTo(-r*.1, -r*.16); t.lineTo(-r*.1, r*.16); t.closePath(); t.fill(); t.restore(); });
      t.fillStyle = col; t.beginPath(); t.arc(m, m, r*.18, 0, 7); t.fill(); }
    else { const gr = t.createLinearGradient(0, 0, 0, r*2); gr.addColorStop(0, "#74c0fc"); gr.addColorStop(1, "#1864ab"); t.fillStyle = "#0b3d6e"; t.beginPath(); t.arc(m, m + 5, r, 0, 7); t.fill();
      t.fillStyle = gr; t.beginPath(); t.arc(m, m, r, 0, 7); t.fill(); t.strokeStyle = col; t.lineWidth = 5; t.stroke(); G2.emo(t, "💦", m, m - r*.1, r*.8); outlinedRaw(t, "풍선", m, m + r*.55, Math.round(r*.3), "#fff"); }
  });

  /* ---------- 조작 ---------- */
  const DK = [{u: "KeyW", d: "KeyS", l: "KeyA", r: "KeyD", b: ["Space","KeyF","KeyG"]}, {u: "ArrowUp", d: "ArrowDown", l: "ArrowLeft", r: "ArrowRight", b: ["Enter","Slash","ShiftRight","NumpadEnter"]}];
  function keyDir(slot){ const st = keyStack[slot]; return st.length ? st[st.length - 1] : 0; }
  function applyLocal(){
    // 이 기기의 사람: 키보드 + 터치
    local.forEach((pi, slot) => {
      if (party === "guest" && pi !== myIdx) return;
      const kd = local.length >= 2 ? keyDir(slot) : (keyDir(0) || keyDir(1));
      let td = 0; ptr.forEach(v => { if (v.pl === pi && v.t === "d") td = v.dir; });
      IN[pi].d = td || kd;
    });
  }
  function padAt(x, y){ return PADS.find(p => Math.hypot(x - p.x, y - p.y) < p.r*1.3); }
  function padDir(p, x, y){ const dx = x - p.x, dy = y - p.y; if (Math.hypot(dx, dy) < p.r*.18) return 0; return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 3 : 4) : (dy < 0 ? 1 : 2); }
  function pressBomb(pi){ IN[pi].b++; }

  /* ---------- 🌐 온라인: 방장 기기 → 친구 기기 ---------- */
  function snap(){
    return {p: P.map(p => [+p.x.toFixed(3), +p.y.toFixed(3), p.d, p.mv, p.trap, p.alive ? 1 : 0, p.inv, p.sp, p.nb, p.rg, p.ndl]), b: B.map(b => [b.c, b.r, b.t]), ph: phase, pt, tm, rd, w: wins, gv, bn: banner};
  }
  function gridMsg(){ return {t: "grid", gv, g: Array.from(G).join(""), it: Array.from(IT).join("")}; }

  const self = {
    get W(){ return W; }, get H(){ return H; },
    maxPx: 2.2e6, layout,
    get dbg(){ return {P, B, E, phase, rd, wins, tm}; },
    init(){
      seed = O.seed || (Math.floor(Math.random()*1e9) + 1); keyStack = [[], []]; ptr = new Map(); NQ = []; lastSnapT = 0;
      startMatch(); dmap = null; if (party === "guest"){ G = null; IT = null; }
      const cv = $("#ngCanvas"); cv.style.backgroundImage = "radial-gradient(circle at 50% 0%, #3b5bdb 0%, #1c1d52 70%)"; cv.style.backgroundColor = "#1c1d52";
      if (party) PARTY.attach(self, gridMsg);
      // ⚡ 처음 터질 때 멈칫하지 않게 그림을 미리 그려 둬요
      const warm = () => { if (NG.cur !== self) return; ["c","h","v","u","d","l","r"].forEach(waterSpr); balloonSpr(0); balloonSpr(1); bubbleSpr(); [1,2,3,4].forEach(itemSpr); P.forEach(p => bodySpr(p.i)); };
      (window.requestIdleCallback || setTimeout)(warm, {timeout: 400});
    },
    down(x, y, id){
      const pd = padAt(x, y); if (!pd) return;
      if (pd.t === "b"){ if (party === "guest"){ PARTY.input.b++; } else pressBomb(pd.pl); ptr.set(id, {pl: pd.pl, t: "b"}); return; }
      ptr.set(id, {pl: pd.pl, t: "d", pad: pd, dir: padDir(pd, x, y)});
    },
    move(x, y, id){ const v = ptr.get(id); if (v && v.t === "d") v.dir = padDir(v.pad, x, y); },
    up(x, y, id){ ptr.delete(id); },
    key(code, d){
      for (let s = 0; s < 2; s++){ const m = DK[s], dir = code === m.u ? 1 : code === m.d ? 2 : code === m.l ? 3 : code === m.r ? 4 : 0;
        if (dir){ const st = keyStack[s]; const i = st.indexOf(dir); if (i >= 0) st.splice(i, 1); if (d) st.push(dir); return true; }
        if (m.b.includes(code)){ if (d){ const pi = local.length >= 2 ? local[s] : local[0]; if (party === "guest") PARTY.input.b++; else pressBomb(pi); } return true; } }
      return false;
    },
    step(){
      applyLocal();
      if (party === "guest"){ PARTY.input.d = IN[myIdx].d; PARTY.tickGuest();
        P.forEach(p => { if (p.tx == null) return; const dx = p.tx - p.x, dy = p.ty - p.y; if (Math.abs(dx) + Math.abs(dy) > 1.5){ p.x = p.tx; p.y = p.ty; } else { p.x += dx*.45; p.y += dy*.45; } });
        E.forEach(e => e.t--); E = E.filter(e => e.t > 0); B.forEach(b => b.t--);
        FXS.forEach(f => { f.x += f.vx || 0; f.y += f.vy || 0; if (f.k === "sh") f.vy += .006; f.t--; }); FXS = FXS.filter(f => f.t > 0); if (banner && banner.k > 0) banner.k--; return; }
      if (party === "host") PARTY.readInputs(IN);
      if (!ended) sim();
      FXS.forEach(f => { f.x += f.vx || 0; f.y += f.vy || 0; if (f.k === "sh") f.vy += .006; f.t--; }); FXS = FXS.filter(f => f.t > 0);
      if (banner && banner.k > 0) banner.k--;
      if (party === "host"){ const now = performance.now(); if (now - lastSnapT > 31){ lastSnapT = now; PARTY.sendSnap(snap(), NQ.splice(0), gv); } }
    },
    /* 친구 기기: 방장이 보낸 상태를 그대로 보여 줘요 */
    apply(d){
      if (d.grid){ if (d.grid.gv !== gv || !G){ G = Uint8Array.from(d.grid.g, ch => +ch); IT = Uint8Array.from(d.grid.it, ch => +ch); gv = d.grid.gv; layerDirty = true; } return; }
      if (d.ev){ d.ev.forEach(e => { if (e[0] === "s") playS(e[1]); else if (e[0] === "f") spawnFx(e[1], e[2], e[3], e[4]); else if (e[0] === "e") E.push({cells: e[1], t: BLAST}); }); return; }
      const s = d.s; if (!s) return;
      if (s.rd !== rd){ E = []; FXS = []; }
      s.p.forEach((a, i) => { const p = P[i]; if (!p) return; if (p.tx == null || !p.alive){ p.x = a[0]; p.y = a[1]; } p.tx = a[0]; p.ty = a[1]; p.d = a[2]; p.mv = a[3]; if (p.mv) p.wk += 2; p.trap = a[4]; p.alive = !!a[5]; p.inv = a[6]; p.sp = a[7]; p.nb = a[8]; p.rg = a[9]; p.ndl = a[10]; });
      B = s.b.map(([c, r, t]) => ({c, r, t})); phase = s.ph; pt = s.pt; tm = s.tm; rd = s.rd; wins = s.w;
      if (s.bn && (!banner || banner.t !== s.bn.t || Math.abs(banner.k - s.bn.k) > 20)) banner = s.bn;
      if (s.gv !== gv) PARTY.needGrid();
    },
    dropIdx(i){ if (!(O.bots = O.bots || []).includes(i)) O.bots.push(i); },
    end(w, ws){ if (ended) return; wins = ws; ended = true; WB.result(w, SIDS, O, wins); },
    draw(g){
      g.clearRect(0, 0, W, H);
      if (!G) return;
      if (layerDirty || !layer || layer.width !== Math.ceil(FW*(NG.k || 1))) renderLayer();
      // 판 테두리
      g.fillStyle = "rgba(10,10,40,.55)"; rrect(g, FX - 8, FY - 8, FW + 16, FH + 16, 18); g.fill();
      { const k = NG.k || 1; g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(layer, Math.round(FX*k), Math.round(FY*k)); g.setTransform(k, 0, 0, k, 0, 0); }   // 1:1로 붙이기
      const fr = NG.frame, tx = c => FX + c*T, ty = r => FY + r*T;
      // 아이템 (통통)
      for (let k = 0; k < C*R; k++) if (IT[k]){ const c = k % C, r = (k - c)/C; G2.put(g, itemSpr(IT[k]), tx(c), ty(r) + Math.sin(fr*.1 + k)*3); }
      // 물줄기
      E.forEach(e => { const a = Math.min(1, e.t/10); g.globalAlpha = a; const sc = e.t > BLAST - 5 ? .7 + (BLAST - e.t)*.06 : 1;
        e.cells.forEach(([c, r, kind]) => { const s2 = waterSpr(kind), w2 = T*sc; g.drawImage(s2, tx(c) + (T - w2)/2, ty(r) + (T - w2)/2, w2, w2); }); });
      g.globalAlpha = 1;
      // 물풍선 (말랑말랑, 곧 터지면 빨개져요)
      B.forEach(b => { const hot = b.t < 45 && Math.floor(b.t/6) % 2 === 0, w2 = T*(1 + Math.sin((FUSE - b.t)*.25)*.06), h2 = T*(1 - Math.sin((FUSE - b.t)*.25)*.06);
        g.drawImage(balloonSpr(hot ? 1 : 0), tx(b.c) + (T - w2)/2, ty(b.r) + (T - h2), w2, h2); });
      // 친구들 (아래에 있는 친구가 앞에)
      const order = P.slice().sort((a, b) => a.y - b.y);
      order.forEach(p => {
        if (!p.alive) return;
        const x = tx(p.x), y = ty(p.y), bob = p.mv ? Math.abs(Math.sin(p.wk*.35))*4 : 0;
        if (p.inv && Math.floor(fr/4) % 2) g.globalAlpha = .5;
        G2.put(g, bodySpr(p.i), x, y - bob*.3);
        faceAt(g, p.sid, x + T/2, y + T*.36 - bob, T*.3, PCOL[p.i]);
        g.globalAlpha = 1;
        if (p.trap){ const bs = bubbleSpr(), wob = 1 + Math.sin(fr*.2)*.04, ww = T*1.4*wob, hh = T*1.4/wob;
          g.drawImage(bs, x + T/2 - ww/2, y + T*.45 - hh/2, ww, hh);
          g.strokeStyle = p.trap < 60 && Math.floor(fr/5) % 2 ? "#ff6b6b" : "#fff"; g.lineWidth = 4; g.beginPath(); g.arc(x + T/2, y + T*.45, T*.74, -Math.PI/2, -Math.PI/2 + Math.PI*2*p.trap/TRAP); g.stroke();
          if (p.ndl && (party !== "guest" ? local.includes(p.i) : p.i === myIdx)) outlined(g, "📌 풍선 버튼으로 탈출!", x + T/2, y - T*.45, 18, "#ffe066"); }
        if (local.length >= 2 || party || N > 2) outlined(g, `${p.i + 1}P`, x + T/2, y - T*.1 - (p.trap ? T*.4 : 0), 15, PCOL[p.i]);
      });
      // 효과
      FXS.forEach(f => { const x = tx(f.x) + T/2, y = ty(f.y) + T/2; g.globalAlpha = Math.min(1, f.t/15);
        if (f.k === "sh"){ g.fillStyle = f.c; g.save(); g.translate(x, y); g.rotate(f.rot + f.t*.2); g.fillRect(-5, -4, 10, 8); g.restore(); }
        else if (f.k === "dr"){ g.fillStyle = "#a5d8ff"; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
        else if (f.k === "tx") outlined(g, f.s, x, y - (50 - f.t)*.6, 22, "#fff"); });
      g.globalAlpha = 1;
      // 위: 친구들 · 시간
      const n = P.length, side = land ? 130 : 105, cw = Math.min(200, (W - side*2)/n), sx0 = W/2 - cw*n/2, wide = cw >= 150;
      P.forEach((p, i) => { const x0 = sx0 + i*cw;
        g.fillStyle = p.alive ? "rgba(20,15,46,.55)" : "rgba(20,15,46,.25)"; rrect(g, x0 + 3, 6, cw - 6, 64, 14); g.fill();
        g.fillStyle = PCOL[i]; rrect(g, x0 + 3, 6, cw - 6, 5, 3); g.fill();
        g.globalAlpha = p.alive ? 1 : .4; faceAt(g, p.sid, x0 + (wide ? 34 : 26), wide ? 38 : 30, wide ? 22 : 17, PCOL[p.i], !p.alive); g.globalAlpha = 1;
        const sx = wide ? x0 + 62 : x0 + 46, sw = x0 + cw - 6 - sx;
        outlined(g, "★".repeat(wins[i]) + "☆".repeat(Math.max(0, WINR - wins[i])), sx + sw/2, wide ? 26 : 26, wide ? 18 : 14, "#ffe066");
        const st = statSpr(p, wide); G2.put(g, st, wide ? sx + sw/2 - st.w/2 : x0 + cw/2 - st.w/2, wide ? 42 : 48); });
      const sec = Math.max(0, Math.ceil(tm/60)), tcol = tm < SHRINK_AT ? "#ff8787" : "#fff";
      outlined(g, `${Math.floor(sec/60)}:${String(sec % 60).padStart(2, "0")}`, side/2, 30, land ? 32 : 28, tcol);
      outlined(g, `${rd}라운드`, side/2, 58, 18, "#ffe066");
      // 패드
      PADS.forEach(pd => { if (party === "guest" && pd.pl !== myIdx) return; const c = padSpr(pd.t, pd.r, PCOL[pd.pl]);
        let on = false; ptr.forEach(v => { if (v.pl === pd.pl && v.t === pd.t) on = true; });
        g.globalAlpha = on ? 1 : .85; G2.put(g, c, pd.x - pd.r - 4, pd.y - pd.r - 4 + (on && pd.t === "b" ? 4 : 0)); g.globalAlpha = 1;
        if (pd.t === "d"){ ptr.forEach(v => { if (v.pl === pd.pl && v.t === "d" && v.dir){ const a = [0, -Math.PI/2, Math.PI/2, Math.PI, 0][v.dir]; g.fillStyle = PCOL[pd.pl]; g.beginPath(); g.arc(pd.x + Math.cos(a)*pd.r*.6, pd.y + Math.sin(a)*pd.r*.6, pd.r*.24, 0, 7); g.fill(); } }); }
        if (pd.t === "d" && (local.length >= 2 || N > 2)) outlined(g, `${pd.pl + 1}P`, pd.x, pd.y - pd.r - 16, 22, PCOL[pd.pl]); });
      // 큰 글씨
      if (banner && banner.k > 0){ const a = Math.min(1, banner.k/15); g.globalAlpha = a; outlined(g, banner.t, FX + FW/2, FY + FH/2 - 24, 64, banner.c || "#fff"); if (banner.s) outlined(g, banner.s, FX + FW/2, FY + FH/2 + 34, 30, "#ffe066"); g.globalAlpha = 1; }
      if (phase === "ready" && rd === 1 && pt > 50) outlined(g, local.length >= 2 ? "1P: W·A·S·D + 스페이스 / 2P: 방향키 + 엔터" : "움직이기: 왼쪽 패드(방향키) · 💦 풍선: 오른쪽 버튼(스페이스)", FX + FW/2, FY + FH - 30, 22, "#fff");
    },
    hud(){ return `💦 ${rd}라운드 · ${P.filter(p => p.alive).length}/${P.length}명 남음${party ? " · 🌐 온라인 방" : ""}`; }
  };
  return self;
};

/* =====================================================================
   💦 물풍선 대작전 — 시작 메뉴 · 결과 · 기록
   ===================================================================== */
const WB = {
  bots: 1, lv: 1,
  menu(){
    const me = ARC.me, gd = GAME.wb;
    let box = $("#mdWb");
    if (!box){ document.body.insertAdjacentHTML("beforeend", `<div class="arc-modal" id="mdWb" hidden><div class="arc-card arc-wide wb-card"><h2>💦 물풍선 대작전</h2><div id="wbBody"></div><button class="arc-x" data-close>×</button></div></div>`);
      box = $("#mdWb"); box.querySelector("[data-close]").onclick = () => { box.hidden = true; PARTY.leave(); }; }
    const body = $("#wbBody");
    const botRow = (id, min) => `<div class="wb-row"><span>🤖 컴퓨터 친구</span><div class="arc-seg" id="${id}">${[0,1,2,3,4,5].filter(n => n >= min).map(n => `<button data-v="${n}" class="${n === Math.max(min, this.bots) ? "on" : ""}">${n}명</button>`).join("")}</div></div>`;
    body.innerHTML = `<p class="arc-small">물풍선을 놓아 친구를 <b>물방울에 가둬요!</b> 갇힌 친구는 다른 친구가 건드리거나 시간이 지나면 펑! 마지막까지 남으면 승리, <b>먼저 2판</b> 이기면 우승이에요. 최대 6명까지 할 수 있어요.</p>
      <div class="wb-sec"><h3>🤖 컴퓨터와 연습 <small>랭킹에는 안 들어가요</small></h3>${botRow("wbBots1", 1)}
        <div class="wb-row"><span>난이도</span><div class="arc-seg" id="wbLv">${["🐣 쉬움","🐥 보통","🦅 어려움"].map((t, i) => `<button data-v="${i}" class="${i === this.lv ? "on" : ""}">${t}</button>`).join("")}</div></div>
        <button class="arc-btn p" id="wbCpu">▶ 컴퓨터와 시작</button></div>
      <div class="wb-sec"><h3>🧒 이 기기에서 친구와 <small>둘이 한 화면 · 이기면 랭킹 1승</small></h3>${botRow("wbBots2", 0)}<button class="arc-btn p" id="wbFriend">🧒 친구 들어오기</button></div>
      <div class="wb-sec"><h3>🌐 온라인 방 <small>각자 기기로 최대 6명 · ☁️ Firebase 반에서만</small></h3><div id="wbRooms"></div></div>`;
    const seg = id => { const s = $("#" + id); if (s) s.onclick = e => { const b = e.target.closest("button"); if (!b) return; s.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); if (id.startsWith("wbBots")) this.bots = +b.dataset.v; else this.lv = +b.dataset.v; }; };
    ["wbBots1", "wbBots2", "wbLv"].forEach(seg);
    const botsOf = id => { const b = $(`#${id} .on`); return b ? +b.dataset.v : 1; };
    $("#wbCpu").onclick = () => { const n = Math.max(1, botsOf("wbBots1")); box.hidden = true; this.start([me], n, true); };
    $("#wbFriend").onclick = () => { const n = botsOf("wbBots2"); box.hidden = true; ARC.pickRival("wb", opp => this.start([me, opp], n, false)); };
    PARTY.renderRooms();
    box.hidden = false;
  },
  pickBots(humans, n){
    const others = roster().filter(s => !humans.includes(s.no) && !s.t).map(s => s.no).sort(() => Math.random() - .5);
    return Array.from({length: n}, (_, i) => others[i] != null ? others[i] : humans[0]);
  },
  start(humans, nBots, cpuOnly){
    nBots = Math.max(0, Math.min(6 - humans.length, nBots));
    const bots = this.pickBots(humans, nBots), sids = humans.concat(bots).map(sidOf);
    ARC.enter && ARC.enter(); ARC.prep(); getAC();
    NG.play("wb", sids, {local: humans.map((_, i) => i), bots: bots.map((_, i) => humans.length + i), lv: this.lv, cpu: cpuOnly});
  },
  /* 결과: 친구(사람) 2명 이상이 함께 한 판만 랭킹에 들어가요 */
  result(w, sids, o, wins){
    const humans = sids.map((s, i) => i).filter(i => !(o.bots || []).includes(i));
    const wsid = w >= 0 ? sids[w] : null, wHuman = w >= 0 && humans.includes(w);
    const ranked = humans.length >= 2 && o.party !== "guest";
    let coins = {};
    if (ranked && wHuman){
      humans.forEach(i => { if (i !== w) wbLoss("wb", sids[i]); });
      wbWin("wb", wsid);
      humans.forEach(i => coins[i] = Store.earn(sids[i], i === w ? WIN_COIN : LOSE_COIN));
    }
    SFX.rec();
    const isB = (o.bots || []).includes(w), meWon = !!o.party && w === (o.party === "guest" ? o.idx : 0);
    const title = w < 0 ? "무승부!" : meWon ? "🏆 내가 우승했어요!" : isB ? "🤖 컴퓨터 친구 우승!" : `🏆 ${esc(who(noOf_(wsid)))} 우승!`;
    $("#ngOver").innerHTML = `${meWon || (!o.party && wHuman) ? NG.conf(90) : ""}<div class="ng-box">${w < 0 || isB ? `<span class="f">${isB ? "🤖" : "🤝"}</span>` : `<span class="avb">${avHTMLof(wsid)}</span>`}
      <h3>${title}</h3>
      <div class="sc">${wins.join(" : ")}</div>
      <div class="info">${ranked ? (wHuman ? `우승 +1승 · 🪙 ${Object.entries(coins).map(([i, c]) => `${esc(nameOf(noOf_(sids[i])))} +${c}`).join(" · ")}` : "컴퓨터 친구가 이긴 판은 랭킹에 들어가지 않아요") : o.party === "guest" ? "랭킹과 코인은 방장 기기가 올려요" : "🤖 컴퓨터 연습은 랭킹에 들어가지 않아요"}</div>
      <div class="arc-row">${o.party === "guest" ? `<button class="arc-btn" data-wb="wait">⏳ 방장이 다시 시작하길 기다려요</button>` : `<button class="arc-btn p" data-wb="again">🔁 한 판 더</button>`}<button class="arc-btn" data-wb="home">🏠 홈으로</button></div></div>`;
    $("#ngOver").hidden = false; NG.ended = true;
    $("#ngOver").onclick = e => { const b = e.target.closest("[data-wb]"); if (!b) return; e.stopPropagation();
      if (b.dataset.wb === "home"){ PARTY.leave(); NG.close(); }
      else if (b.dataset.wb === "again"){ if (o.party === "host") PARTY.again(); else { const opt = Object.assign({}, o, {seed: 0}); NG.play("wb", sids, opt); } } };
  }
};
/* 대결 기록: 이긴 친구 +1승 / 진 친구 +1패 */
async function wbWin(gid, w){ const R = Store.recs[gid] = Store.recs[gid] || {}; R[w] = Object.assign({w: 0, l: 0}, R[w]); R[w].w++; R[w].at = Date.now(); Store.emit(); if (Store.mode === "local") return Store.saveLocal();
  const fs = Store.fs; try { await fs.setDoc(fs.doc(Store.db, "arcade", Store.cid, "recs", gid), {[w]: {w: fs.increment(1), at: Date.now()}}, {merge: true}); } catch(e){ console.error(e); } }
async function wbLoss(gid, l){ const R = Store.recs[gid] = Store.recs[gid] || {}; R[l] = Object.assign({w: 0, l: 0}, R[l]); R[l].l++; R[l].at = Date.now(); Store.emit(); if (Store.mode === "local") return Store.saveLocal();
  const fs = Store.fs; try { await fs.setDoc(fs.doc(Store.db, "arcade", Store.cid, "recs", gid), {[l]: {l: fs.increment(1), at: Date.now()}}, {merge: true}); } catch(e){ console.error(e); } }

/* =====================================================================
   🌐 PARTY — 물풍선 대작전 온라인 방 (방장 1 + 친구 최대 5명)
   - 들어가기 쪽지는 Firebase(arcade/{반}/parties)에 잠깐 두고, 연결되면 기기끼리 직접(WebRTC) 주고받아요
   - 방장 기기가 심판: 판·풍선·점수는 방장이 정하고, 친구 기기는 손가락(방향·풍선)만 보내요
   ===================================================================== */
const PARTY = {
  role: null, pid: null, host: null, peers: new Map(), un: [], game: null, gridFn: null, input: {d: 0, b: 0}, inT: 0, inSig: "",
  rooms: [], unRooms: null, inN: 0, lastB: 0, bots: 0, lv: 1, seq: 0, inSeq: 0, lastGv: -1, ngT: 0, beat: 0, conT: 0, members: [], started: false, myIdx: 0, startMsg: null,
  MAX: 6,
  ok(){ return Store.mode === "cloud" && !!Store.fs && "RTCPeerConnection" in window; },
  col(...p){ return Store.fs.collection(Store.db, "arcade", Store.cid, "parties", ...p); },
  ref(...p){ return Store.fs.doc(Store.db, "arcade", Store.cid, "parties", ...p); },
  ice(){ return (typeof NET !== "undefined" && NET.ICE) || [{urls: ["stun:stun.l.google.com:19302"]}]; },
  gather(pc){ return new Promise(res => { if (pc.iceGatheringState === "complete") return res(); const t = setTimeout(res, 3000); pc.addEventListener("icegatheringstatechange", () => { if (pc.iceGatheringState === "complete"){ clearTimeout(t); res(); } }); }); },
  sd(d){ return {type: d.type, sdp: d.sdp}; },

  /* ---------- 방 목록 ---------- */
  watchRooms(){
    if (this.unRooms || !this.ok()) return;
    const fs = Store.fs;
    this.unRooms = fs.onSnapshot(fs.query(this.col(), fs.where("st", "==", "open")), qs => {
      const l = []; qs.forEach(d => l.push(Object.assign({id: d.id}, d.data())));
      this.rooms = l.filter(r => Date.now() - (r.at || 0) < 90000).sort((a, b) => (a.t0 || 0) - (b.t0 || 0)); this.renderRooms();
    }, e => console.warn(e));
  },
  unwatchRooms(){ if (this.unRooms) this.unRooms(); this.unRooms = null; },
  renderRooms(){
    const box = $("#wbRooms"); if (!box) return; $("#wbBody").classList.toggle("in-room", !!this.role);
    if (!this.ok()){ box.innerHTML = `<p class="arc-small">🌐 온라인 방은 선생님이 <b>☁️ Firebase</b>로 연결한 반에서 쓸 수 있어요. 지금은 위의 두 가지로 해요!</p>`; return; }
    const face = no => `<span class="avf">${avHTMLof(sidOf(no), {still: true, face: true})}</span>`;
    if (this.role === "host"){
      const M = this.members, slots = Array.from({length: this.MAX}, (_, i) => i < M.length ? `<div class="wb-slot on">${face(M[i])}<b>${i === 0 ? "👑 " : ""}${esc(who(M[i]))}</b></div>`
        : i < M.length + this.bots ? `<div class="wb-slot bot"><span class="f">🤖</span><b>컴퓨터</b></div>` : `<div class="wb-slot"><span class="f">⏳</span><b>빈자리</b></div>`).join("");
      const maxB = this.MAX - M.length;
      box.innerHTML = `<div class="wb-wait"><b>🏠 내 방이 열렸어요!</b> 친구들은 💦 물풍선 대작전 → 🌐 온라인 방에서 <b>${esc(who(ARC.me))}</b>의 방에 들어와요.</div>
        <div class="wb-slots">${slots}</div>
        <div class="wb-row"><span>🤖 빈자리 컴퓨터</span><div class="arc-seg" id="wbPBots">${Array.from({length: maxB + 1}, (_, n) => `<button data-v="${n}" class="${n === Math.min(this.bots, maxB) ? "on" : ""}">${n}</button>`).join("")}</div></div>
        <div class="arc-row"><button class="arc-btn" id="wbPClose">✕ 방 닫기</button><button class="arc-btn p" id="wbPGo" ${M.length + Math.min(this.bots, maxB) < 2 ? "disabled" : ""}>▶ 시작! (${M.length + Math.min(this.bots, maxB)}명)</button></div>`;
      $("#wbPBots").onclick = e => { const b = e.target.closest("button"); if (b){ this.bots = +b.dataset.v; this.renderRooms(); this.lobbyMsg(); } };
      $("#wbPClose").onclick = () => { this.leave(); this.renderRooms(); };
      $("#wbPGo").onclick = () => this.start();
      return;
    }
    if (this.role === "guest"){
      const M = this.members.length ? this.members : [this.host, ARC.me];
      box.innerHTML = `<div class="wb-wait">${this.on() ? `✅ <b>${esc(who(this.host))}</b>의 방에 들어왔어요! 방장이 시작하길 기다려요…` : `🔌 <b>${esc(who(this.host))}</b>의 방에 연결하는 중…`}</div>
        <div class="wb-slots">${M.map((no, i) => `<div class="wb-slot on">${face(no)}<b>${i === 0 ? "👑 " : ""}${esc(who(no))}</b></div>`).join("")}${this.bots ? `<div class="wb-slot bot"><span class="f">🤖</span><b>컴퓨터 ×${this.bots}</b></div>` : ""}</div>
        <div class="arc-row"><button class="arc-btn" id="wbPLeave">✕ 나가기</button></div>`;
      $("#wbPLeave").onclick = () => { this.leave(); this.renderRooms(); };
      return;
    }
    this.watchRooms();
    const L = this.rooms.filter(r => r.host !== ARC.me);
    box.innerHTML = `<button class="arc-btn p" id="wbPNew">🏠 방 만들기 <small>친구들이 들어오면 시작!</small></button>
      <div class="wb-rooms">${L.length ? L.map(r => `<button class="wb-room" data-pid="${esc(r.id)}" data-h="${+r.host}" ${(r.n || 1) >= this.MAX ? "disabled" : ""}>${face(r.host)}<b>${esc(who(r.host))}의 방</b><small>${r.n || 1}/${this.MAX}명 · 들어가기 ▶</small></button>`).join("")
        : `<p class="arc-small">아직 열린 방이 없어요. 먼저 방을 만들어 친구를 불러 봐요! 📣</p>`}</div>`;
    $("#wbPNew").onclick = () => this.create();
    box.querySelector(".wb-rooms").onclick = e => { const b = e.target.closest("[data-pid]"); if (b && !b.disabled) this.join(b.dataset.pid, +b.dataset.h); };
  },
  on(){ return this.role === "guest" ? !!(this.hp && this.hp.r && this.hp.r.readyState === "open") : true; },

  /* ---------- 방장 ---------- */
  async create(){
    if (this.role) return; const fs = Store.fs;
    this.role = "host"; this.members = [ARC.me]; this.started = false; this.bots = this.bots || 0; this.renderRooms();
    try {
      const r = fs.doc(this.col()); this.pid = r.id; const now = Date.now();
      await fs.setDoc(r, {host: ARC.me, st: "open", n: 1, at: now, t0: now});
      this.un.push(fs.onSnapshot(this.col(this.pid, "peers"), qs => qs.docChanges().forEach(ch => this.onPeerDoc(ch.type, ch.doc.id, ch.doc.data())), e => console.warn(e)));
      this.beat = setInterval(() => { if (this.role === "host" && !this.started) fs.updateDoc(this.ref(this.pid), {at: Date.now(), n: this.members.length}).catch(() => {}); }, 25000);
    } catch(e){ console.error(e); toast("⚠️ 방을 만들지 못했어요. 인터넷을 확인해 주세요."); this.leave(); this.renderRooms(); }
  },
  async onPeerDoc(type, id, d){
    if (this.role !== "host") return;
    const no = +id;
    if (type === "removed"){ this.drop(no); return; }
    let P = this.peers.get(no);
    if (!P && d.st === "knock"){
      if (this.started || this.members.length + this.peers.size - this.connected().length >= this.MAX){ Store.fs.updateDoc(this.ref(this.pid, "peers", id), {st: "full"}).catch(() => {}); return; }
      const pc = new RTCPeerConnection({iceServers: this.ice()});
      P = {no, pc, u: pc.createDataChannel("u", {ordered: false, maxRetransmits: 0}), r: pc.createDataChannel("r"), last: {d: 0, b: 0}, open: false, idx: -1};
      this.peers.set(no, P); this.wirePeer(P);
      pc.onconnectionstatechange = () => { const s = pc.connectionState; if (s === "failed" || s === "closed") this.drop(no); else if (s === "disconnected") setTimeout(() => { if (pc.connectionState === "disconnected") this.drop(no); }, 5000); };
      try { await pc.setLocalDescription(await pc.createOffer()); await this.gather(pc);
        await Store.fs.updateDoc(this.ref(this.pid, "peers", id), {st: "offer", offer: this.sd(pc.localDescription)}); }
      catch(e){ console.warn(e); this.drop(no); }
      return;
    }
    if (P && d.answer && !P.pc.remoteDescription){ try { await P.pc.setRemoteDescription(d.answer); } catch(e){ console.warn(e); this.drop(no); } }
  },
  wirePeer(P){
    const onOpen = () => { if (P.r.readyState !== "open" || P.open) return; P.open = true;
      if (!this.members.includes(P.no)){ if (this.started || this.members.length >= this.MAX){ this.send(P, {t: "full"}); return; } this.members.push(P.no); }
      try { tone(660, 990, .1, "triangle", .1); } catch(e) {}
      this.lobbyMsg(); this.renderRooms(); };
    P.r.onopen = onOpen; P.u.onopen = onOpen;
    const onMsg = e => { let m; try { m = JSON.parse(e.data); } catch(er){ return; }
      if (m.t === "in"){ if ((m.n || 0) > (P.inN || 0)){ P.inN = m.n; P.last = {d: m.d | 0, b: m.b | 0}; } }
      else if (m.t === "ng"){ if (this.gridFn) this.send(P, this.gridFn()); }
      else if (m.t === "bye") this.drop(P.no); };
    P.r.onmessage = onMsg; P.u.onmessage = onMsg;
    P.r.onclose = () => this.drop(P.no);
  },
  connected(){ return [...this.peers.values()].filter(p => p.open && p.r.readyState === "open"); },
  drop(no){
    const P = this.peers.get(no); if (!P) return; this.peers.delete(no);
    try { P.pc.close(); } catch(e) {}
    if (!this.started){ this.members = this.members.filter(x => x !== no); this.lobbyMsg(); this.renderRooms(); }
    else if (P.idx >= 0){ toast(`🔌 ${who(no)} 연결이 끊겨서 🤖 컴퓨터가 대신해요`); if (this.game) this.game.dropIdx(P.idx); }
    if (this.pid) Store.fs.deleteDoc(this.ref(this.pid, "peers", String(no))).catch(() => {});
  },
  send(P, m){ try { const ch = m.t === "s" ? P.u : P.r; if (ch.readyState === "open") ch.send(typeof m === "string" ? m : JSON.stringify(m)); } catch(e) {} },
  sendAll(m){ const s = JSON.stringify(m); this.connected().forEach(P => { try { (m.t === "s" ? P.u : P.r).send(s); } catch(e) {} }); },
  lobbyMsg(){ if (this.role === "host") this.sendAll({t: "lobby", m: this.members, bots: Math.min(this.bots, this.MAX - this.members.length)}); },
  start(again){
    if (this.role !== "host") return;
    const live = this.connected().map(p => p.no);
    this.members = [ARC.me].concat(this.members.filter(no => no !== ARC.me && live.includes(no)));
    const M = this.members, nb = Math.max(0, Math.min(this.bots, this.MAX - M.length));
    if (M.length + nb < 2){ toast("친구가 들어오거나 🤖 컴퓨터를 넣어야 시작할 수 있어요"); this.renderRooms(); return; }
    this.started = true; Store.fs.updateDoc(this.ref(this.pid), {st: "play", n: M.length}).catch(() => {});
    const botNos = WB.pickBots(M, nb), sids = M.concat(botNos).map(sidOf), bots = botNos.map((_, i) => M.length + i), seed = Math.floor(Math.random()*1e9) + 1, remote = {};
    M.forEach((no, i) => { if (i){ const P = this.peers.get(no); if (P){ P.idx = i; P.inN = 0; P.last = {d: 0, b: 0}; remote[i] = no; this.send(P, {t: "start", sids, idx: i, bots, seed, lv: WB.lv}); } } });
    this.seq = 0; this.lastGv = -1;
    const md = $("#mdWb"); if (md) md.hidden = true;
    if (!again){ ARC.enter(); ARC.prep(); }
    getAC(); NG.play("wb", sids, {party: "host", local: [0], bots, remote, lv: WB.lv, seed});
  },
  again(){ this.start(true); },
  attach(game, gridFn){ this.game = game; this.gridFn = gridFn; this.seq = 0; this.inSeq = 0; this.lastGv = -1; this.input = {d: 0, b: this.input.b || 0}; },
  readInputs(IN){ this.peers.forEach(P => { if (P.idx >= 0 && IN[P.idx]){ const open = P.r.readyState === "open"; IN[P.idx].d = open ? P.last.d : 0; IN[P.idx].b = P.last.b; } }); },
  sendSnap(s, ev, gv){
    if (gv !== this.lastGv && this.gridFn){ this.lastGv = gv; this.sendAll(this.gridFn()); }
    if (ev.length) this.sendAll({t: "ev", ev});
    this.sendAll({t: "s", n: ++this.seq, s});
  },

  /* ---------- 친구 ---------- */
  async join(pid, host){
    if (this.role) return; const fs = Store.fs, me = ARC.me;
    this.role = "guest"; this.pid = pid; this.host = host; this.members = []; this.bots = 0; this.unwatchRooms(); this.renderRooms();
    try {
      const myRef = this.ref(pid, "peers", String(me));
      await fs.setDoc(myRef, {no: me, st: "knock", at: Date.now()});
      this.un.push(fs.onSnapshot(myRef, s => this.onMyDoc(s.exists() ? s.data() : null), () => {}));
      this.un.push(fs.onSnapshot(this.ref(pid), s => { const d = s.exists() ? s.data() : null; if (this.role !== "guest") return;
        if (!d || d.st === "closed"){ this.hostGone("방장이 방을 닫았어요"); } }, () => {}));
      clearTimeout(this.conT); this.conT = setTimeout(() => { if (this.role === "guest" && !this.on()) this.hostGone("🔌 방장 기기와 연결되지 않았어요. 같은 와이파이인지 확인하고 다시 해 보세요."); }, 20000);
    } catch(e){ console.error(e); toast("⚠️ 방에 들어가지 못했어요"); this.leave(); this.renderRooms(); }
  },
  async onMyDoc(d){
    if (this.role !== "guest") return;
    if (!d){ return; }
    if (d.st === "full"){ this.hostGone("방이 꽉 찼거나 이미 시작했어요"); return; }
    if (d.offer && !this.hp){
      const pc = new RTCPeerConnection({iceServers: this.ice()}), H = this.hp = {pc, u: null, r: null};
      pc.ondatachannel = e => { const ch = e.channel; if (ch.label === "u") H.u = ch; else H.r = ch;
        ch.onmessage = ev => { let m; try { m = JSON.parse(ev.data); } catch(er){ return; } this.onHost(m); };
        ch.onopen = () => { this.renderRooms(); }; ch.onclose = () => { if (this.role === "guest") this.hostGone("🔌 방장 기기와 연결이 끊겼어요"); }; };
      pc.onconnectionstatechange = () => { const s = pc.connectionState; if (s === "failed") this.hostGone("🔌 방장 기기와 연결이 끊겼어요"); else if (s === "disconnected") setTimeout(() => { if (pc.connectionState === "disconnected") this.hostGone("🔌 방장 기기와 연결이 끊겼어요"); }, 5000); };
      try { await pc.setRemoteDescription(d.offer); await pc.setLocalDescription(await pc.createAnswer()); await this.gather(pc);
        await Store.fs.updateDoc(this.ref(this.pid, "peers", String(ARC.me)), {st: "answer", answer: this.sd(pc.localDescription)}); }
      catch(e){ console.warn(e); this.hostGone("🔌 연결하지 못했어요"); }
    }
  },
  onHost(m){
    if (m.t === "s"){ if (m.n > this.inSeq || m.n < this.inSeq - 500){ this.inSeq = m.n; this.game && this.game.apply({s: m.s}); } }
    else if (m.t === "ev"){ this.game && this.game.apply({ev: m.ev}); }
    else if (m.t === "grid"){ this.game && this.game.apply({grid: m}); }
    else if (m.t === "lobby"){ this.members = m.m; this.bots = m.bots; if (!this.game || $("#ng").hidden) this.renderRooms(); }
    else if (m.t === "start"){
      clearTimeout(this.conT); const md = $("#mdWb"); if (md) md.hidden = true; this.myIdx = m.idx; this.inSeq = 0;
      if ($("#ng").hidden || !NG.cur){ ARC.game = "wb"; ARC.enter(); ARC.prep(); }
      getAC(); NG.play("wb", m.sids, {party: "guest", idx: m.idx, local: [m.idx], bots: m.bots, lv: m.lv, seed: m.seed});
    }
    else if (m.t === "end"){ this.game && this.game.end(m.w, m.wins); }
    else if (m.t === "full"){ this.hostGone("방이 꽉 찼거나 이미 시작했어요"); }
    else if (m.t === "bye"){ this.hostGone("방장이 방을 나갔어요"); }
  },
  tickGuest(){
    const H = this.hp; if (!H || !H.u || H.u.readyState !== "open") return;
    const now = performance.now(), sig = this.input.d + ":" + this.input.b;
    if (sig !== this.inSig || now - this.inT > 90){ this.inSig = sig; this.inT = now; try { H.u.send(JSON.stringify({t: "in", n: ++this.inN || (this.inN = 1), d: this.input.d, b: this.input.b})); } catch(e) {}
      if (this.input.b !== this.lastB && H.r && H.r.readyState === "open"){ this.lastB = this.input.b; try { H.r.send(JSON.stringify({t: "in", n: ++this.inN, d: this.input.d, b: this.input.b})); } catch(e) {} } }
  },
  needGrid(){ const now = performance.now(); if (now - this.ngT < 400) return; this.ngT = now; const H = this.hp; if (H && H.r && H.r.readyState === "open") try { H.r.send('{"t":"ng"}'); } catch(e) {} },
  hostGone(msg){
    if (this.role !== "guest") return;
    const playing = NG.cur && NG.gid === "wb" && !$("#ng").hidden;
    this.leave(); toast(msg);
    if (playing) NG.close(); else this.renderRooms();
  },

  /* ---------- 나가기 ---------- */
  leave(){
    const role = this.role; if (!role){ this.unwatchRooms(); return; }
    this.role = null; clearInterval(this.beat); clearTimeout(this.conT);
    this.un.forEach(f => { try { f(); } catch(e) {} }); this.un = [];
    const fs = Store.fs, pid = this.pid;
    if (role === "host"){
      this.sendAll({t: "bye"}); const ps = [...this.peers.values()]; this.peers.clear();
      setTimeout(() => ps.forEach(P => { try { P.pc.close(); } catch(e) {} }), 300);
      if (pid && fs){ ps.forEach(P => fs.deleteDoc(this.ref(pid, "peers", String(P.no))).catch(() => {})); fs.deleteDoc(this.ref(pid)).catch(() => {}); }
    } else {
      const H = this.hp; this.hp = null;
      if (H){ try { H.r && H.r.readyState === "open" && H.r.send('{"t":"bye"}'); } catch(e) {} setTimeout(() => { try { H.pc.close(); } catch(e) {} }, 300); }
      if (pid && fs) fs.deleteDoc(this.ref(pid, "peers", String(ARC.me))).catch(() => {});
    }
    this.pid = null; this.game = null; this.gridFn = null; this.members = []; this.started = false; this.unwatchRooms();
  }
};
/* 물풍선은 자기 시작 메뉴 · 온라인 방(여러 명)을 써요 */
(function(){
  const play = ARC.play;
  ARC.play = function(gid){
    if (gid !== "wb") return play.call(this, gid);
    if (!LOBBY.canPlay(gid)) return; getAC(); this.game = gid; this.lastRank = gid; WB.menu();
  };
  const again = NG.again, close = NG.close;
  NG.again = function(){ if (this.gid === "wb" && this.opt.party){ if (this.opt.party === "host") PARTY.again(); return; } return again.call(this); };
  NG.close = function(){ if (this.gid === "wb" && PARTY.role) PARTY.leave(); return close.call(this); };
  window.addEventListener("pagehide", () => PARTY.leave());
  const css = document.createElement("style");
  css.textContent = `.wb-card{max-width:640px;max-height:94vh;overflow:auto}.in-room>.wb-sec:not(:last-child),.in-room>p{display:none}.wb-sec{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:12px 14px;margin:10px 0}
.wb-sec h3{margin:0 0 8px;font:20px "Jua",sans-serif}.wb-sec h3 small{font:13px "Gowun Dodum",sans-serif;opacity:.7;margin-left:6px}
.wb-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:6px 0}.wb-row>span{font:16px "Jua",sans-serif}
.wb-sec>.arc-btn{width:100%;margin-top:6px}.wb-slots{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}
.wb-slot{display:flex;align-items:center;gap:8px;padding:8px;border-radius:12px;background:rgba(0,0,0,.2);border:2px dashed rgba(255,255,255,.18);min-width:0}
.wb-slot.on{border:2px solid #4dabf7;background:rgba(77,171,247,.15)}.wb-slot.bot{border:2px solid #9775fa;background:rgba(151,117,250,.12)}
.wb-slot b{font:14px "Jua",sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wb-slot .avf,.wb-slot .f,.wb-room .avf{width:36px;height:36px;flex:none;font-size:26px;display:grid;place-items:center}
.wb-wait{padding:8px 10px;border-radius:12px;background:rgba(81,207,102,.12);font-size:15px}
.wb-rooms{display:grid;gap:8px;margin-top:10px}.wb-room{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;border:2px solid #4dabf7;background:rgba(77,171,247,.12);color:inherit;cursor:pointer;text-align:left}
.wb-room b{font:17px "Jua",sans-serif;flex:1}.wb-room small{opacity:.8}.wb-room:disabled{opacity:.45;cursor:default}
@media (max-width:560px){.wb-slots{grid-template-columns:repeat(2,1fr)}}`;
  document.head.appendChild(css);
})();

/* =====================================================================
   🫧 버블 특공대 — 달리고 뛰며 거품총으로 로봇을 거품에 가둬 날려 보내요
   - 맵 4곳(초원·사막·눈나라·우주기지)이 돌아가며 나오고, 맵 끝에는 왕로봇!
   - 아이템: 🔱 세 갈래 · ⚡ 연사 · 🛡️ 방패 · ❤️ 하트 · 💣 거품 폭탄 · 🪙 코인
   ⚡ 렉 줄이기: 로봇·땅·배경 산은 한 번 그린 그림을 붙이고, 하늘은 CSS 배경이에요.
   ===================================================================== */
NG.defs.bs = () => {
  const sid = NG.sids[0];
  let W = 1280, H = 720, VH = 720, land = true, CT = [];
  const GY0 = 110;               // 땅 두께
  let GY = VH - GY0;
  const STAGE_L = 5600;
  const TH = [
    {n: "🌳 초원", sky: "linear-gradient(#4dabf7,#a5d8ff 55%,#d3f9d8)", far: "#748ffc", far2: "#91a7ff", near: "#40c057", near2: "#69db7c", top: "#51cf66", dirt: "#9c6644", dirt2: "#7f5539", deco: "🌼"},
    {n: "🏜️ 사막", sky: "linear-gradient(#ff922b,#ffd8a8 50%,#fff3bf)", far: "#e8590c", far2: "#fd7e14", near: "#f59f00", near2: "#fcc419", top: "#ffd43b", dirt: "#e8a33d", dirt2: "#d08c2a", deco: "🌵"},
    {n: "❄️ 눈나라", sky: "linear-gradient(#4c6ef5,#a5d8ff 55%,#e7f5ff)", far: "#bac8ff", far2: "#dbe4ff", near: "#e9ecef", near2: "#f8f9fa", top: "#ffffff", dirt: "#74c0fc", dirt2: "#4dabf7", deco: "⛄"},
    {n: "🚀 우주기지", sky: "radial-gradient(circle at 70% 20%,#7048e8,#1c1d52 60%,#0b0b24)", far: "#3b5bdb", far2: "#4263eb", near: "#495057", near2: "#5c677d", top: "#adb5bd", dirt: "#495057", dirt2: "#343a40", deco: "🛸"}
  ];
  const EN = {walker: {hp: 2, w: 62, h: 62, sc: 100}, drone: {hp: 1, w: 66, h: 50, sc: 150}, jumper: {hp: 2, w: 54, h: 60, sc: 150}, turret: {hp: 4, w: 70, h: 58, sc: 250}};
  let pl, cam, camMax, stage, stEnd, score, hearts, shots, ebul, ens, plats, items, crates, fx, trapped, genX, boss, bossOn, clearT, bombs, wpn, wpnT, shield, inv, dead, deadT, keys, ptr, jumpBuf, shootCd, kills, stick, startT, flash, msg;
  const thm = () => TH[(stage - 1) % TH.length];
  const sp = (k, w, h, fn) => G2.spr("bs" + k, w, h, fn);
  const hitR = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  /* ---------- 배치 (가로·세로) ---------- */
  function layout(sw, sh){
    land = sw/Math.max(1, sh) >= 1.15;
    if (land){ W = 1280; VH = 720; H = 720;
      CT = [{t: "stick", x: 160, y: VH - 150, r: 100}, {t: "shoot", x: W - 290, y: VH - 115, r: 80}, {t: "jump", x: W - 115, y: VH - 160, r: 76}, {t: "bomb", x: W - 105, y: VH - 330, r: 52}];
    } else { W = 760; VH = 780; H = VH + 360;
      CT = [{t: "stick", x: 180, y: VH + 185, r: 120}, {t: "shoot", x: W - 270, y: VH + 230, r: 88}, {t: "jump", x: W - 110, y: VH + 140, r: 80}, {t: "bomb", x: W - 105, y: VH + 300, r: 54}];
    }
    const old = GY; GY = VH - GY0;
    if (pl && old !== GY){ const d = GY - old; pl.y += d; ens.forEach(e => e.y += d); items.forEach(e => e.y += d); crates.forEach(e => e.y += d); plats.forEach(e => e.y += d); trapped.forEach(e => e.y += d); shots.forEach(e => e.y += d); ebul.forEach(e => e.y += d); fx.forEach(e => e.y += d); if (boss) boss.y += d; }
  }

  /* ---------- 그림 ---------- */
  function hillStrip(t, w, h, col, col2, seed, peak){
    let s = seed; const r = () => { s = (s*9301 + 49297) % 233280; return s/233280; };
    t.fillStyle = col; t.beginPath(); t.moveTo(0, h);
    const n = 6, pts = []; for (let i = 0; i <= n; i++) pts.push([i*w/n, h - peak*(.45 + r()*.55)]); pts[n][1] = pts[0][1];
    t.lineTo(0, pts[0][1]); for (let i = 0; i < n; i++){ const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; t.quadraticCurveTo(x0 + (x1 - x0)/2, Math.min(y0, y1) - peak*.25, x1, y1); }
    t.lineTo(w, h); t.closePath(); t.fill();
    t.fillStyle = col2; for (let i = 0; i < 9; i++){ const x = 50 + r()*(w - 100), y = h - peak*.25 + r()*peak*.2; t.beginPath(); t.ellipse(x, y, 30 + r()*40, 10 + r()*10, 0, 0, 7); t.fill(); }
  }
  const farSpr = () => sp("far" + stage % 4, 900, 300, t => { const T = thm();
    if (T.n.includes("눈")){ hillStrip(t, 900, 300, T.far, T.far2, 7, 260); t.fillStyle = "#fff"; for (let i = 0; i < 6; i++){ t.beginPath(); t.arc(i*160 + 60, 120 + (i % 2)*30, 26, 0, 7); t.fill(); } }
    else if (T.n.includes("우주")){ t.fillStyle = "#fff"; let s = 3; for (let i = 0; i < 60; i++){ s = (s*9301 + 49297) % 233280; const x = s/233280*900; s = (s*9301 + 49297) % 233280; t.globalAlpha = .4 + (s % 60)/100; t.fillRect(x, s/233280*200, 2, 2); } t.globalAlpha = 1;
      t.fillStyle = "#ffd43b"; t.beginPath(); t.arc(700, 70, 34, 0, 7); t.fill(); t.fillStyle = "rgba(255,255,255,.35)"; t.beginPath(); t.ellipse(700, 70, 60, 10, -.3, 0, 7); t.fill();
      hillStrip(t, 900, 300, T.far, T.far2, 11, 150); }
    else hillStrip(t, 900, 300, T.far, T.far2, 5 + stage, 230); });
  const nearSpr = () => sp("near" + stage % 4, 800, 200, t => { const T = thm(); hillStrip(t, 800, 200, T.near, T.near2, 17 + stage, 150);
    t.font = `40px ${EMOJI}`; t.textAlign = "center"; t.textBaseline = "bottom"; [120, 430, 690].forEach(x => t.fillText(T.deco, x, 196)); });
  const groundSpr = () => sp("gr" + stage % 4 + GY0, 128, GY0, t => { const T = thm();
    t.fillStyle = T.dirt; t.fillRect(0, 0, 128, GY0); t.fillStyle = T.dirt2; for (let i = 0; i < 5; i++) { t.beginPath(); t.ellipse(14 + i*26, 40 + (i % 2)*30, 9, 6, 0, 0, 7); t.fill(); }
    t.fillStyle = T.top; t.fillRect(0, 0, 128, 18); t.beginPath(); for (let i = 0; i <= 8; i++) t.arc(i*16, 18, 8, 0, Math.PI); t.fill();
    t.fillStyle = "rgba(255,255,255,.35)"; t.fillRect(0, 2, 128, 4); });
  const platSpr = w => sp("pl" + stage % 4 + w, w, 30, t => { const T = thm(); t.fillStyle = "rgba(0,0,0,.18)"; rrect(t, 4, 8, w - 4, 22, 10); t.fill();
    t.fillStyle = T.dirt; rrect(t, 0, 4, w, 22, 10); t.fill(); t.fillStyle = T.top; rrect(t, 0, 0, w, 12, 8); t.fill(); t.fillStyle = "rgba(255,255,255,.4)"; t.fillRect(10, 3, w - 20, 3); });
  const ROBO = {walker: ["#ff6b6b","#c92a2a"], drone: ["#4dabf7","#1864ab"], jumper: ["#51cf66","#2b8a3e"], turret: ["#adb5bd","#495057"]};
  function eyes(t, x, y, r, col = "#fff"){ t.fillStyle = col; t.beginPath(); t.arc(x - r*1.2, y, r, 0, 7); t.arc(x + r*1.2, y, r, 0, 7); t.fill(); t.fillStyle = "#212529"; t.beginPath(); t.arc(x - r*1.2 - r*.3, y, r*.5, 0, 7); t.arc(x + r*1.2 - r*.3, y, r*.5, 0, 7); t.fill(); }
  const robotSpr = (k, f) => { const d = EN[k]; return sp(`rb${k}${f}`, d.w, d.h, t => { const [c1, c2] = ROBO[k], w = d.w, h = d.h;
    if (k === "walker"){ t.fillStyle = c2; t.fillRect(w*.2, h*.72, 10, h*.28 - (f ? 6 : 0)); t.fillRect(w*.65, h*.72, 10, h*.28 - (f ? 0 : 6));
      t.fillStyle = c1; rrect(t, 4, h*.18, w - 8, h*.58, 12); t.fill(); t.fillStyle = c2; rrect(t, 4, h*.58, w - 8, h*.18, 8); t.fill();
      t.fillStyle = "#ffe066"; t.fillRect(w/2 - 2, 0, 4, h*.2); t.beginPath(); t.arc(w/2, 4, 6, 0, 7); t.fill(); eyes(t, w/2, h*.38, 7); }
    else if (k === "drone"){ t.fillStyle = "#495057"; t.fillRect(w/2 - 3, 4, 6, 10); t.fillStyle = "rgba(73,80,87,.8)"; t.fillRect(f ? 4 : 14, 2, f ? w - 8 : w - 28, 5);
      t.fillStyle = c1; t.beginPath(); t.ellipse(w/2, h*.55, w*.46, h*.32, 0, 0, 7); t.fill(); t.fillStyle = c2; t.beginPath(); t.ellipse(w/2, h*.68, w*.46, h*.16, 0, 0, Math.PI); t.fill();
      t.fillStyle = "rgba(255,255,255,.4)"; t.beginPath(); t.ellipse(w*.35, h*.42, w*.12, h*.07, -.3, 0, 7); t.fill(); eyes(t, w/2, h*.55, 6); }
    else if (k === "jumper"){ t.strokeStyle = "#868e96"; t.lineWidth = 5; t.beginPath(); for (let i = 0; i < 4; i++){ t.moveTo(w*.3, h*(.66 + i*.08 - (f ? .03 : 0))); t.lineTo(w*.7, h*(.7 + i*.08 - (f ? .03 : 0))); } t.stroke();
      t.fillStyle = c1; t.beginPath(); t.arc(w/2, h*.36, w*.42, 0, 7); t.fill(); t.fillStyle = c2; t.beginPath(); t.arc(w/2, h*.36, w*.42, .2, Math.PI - .2); t.fill(); eyes(t, w/2, h*.3, 7); }
    else { t.fillStyle = c2; rrect(t, 0, h*.62, w, h*.38, 8); t.fill(); t.fillStyle = c1; t.beginPath(); t.arc(w/2, h*.62, w*.38, Math.PI, 0); t.fill();
      t.fillStyle = "#ff6b6b"; t.beginPath(); t.arc(w/2, h*.45, 8, 0, 7); t.fill(); t.fillStyle = "#ffe066"; t.fillRect(8, h*.78, w - 16, 5); }
  }); };
  const bossSpr = f => sp("boss" + stage % 4 + f, 240, 220, t => { const T = thm(), c1 = ["#e03131","#f08c00","#1971c2","#7048e8"][(stage - 1) % 4];
    t.fillStyle = "#343a40"; t.fillRect(50, 170, 30, 50 - (f ? 8 : 0)); t.fillRect(160, 170, 30, 50 - (f ? 0 : 8));
    t.fillStyle = "#495057"; rrect(t, 20, 150, 200, 34, 14); t.fill();
    t.fillStyle = c1; rrect(t, 24, 40, 192, 120, 30); t.fill(); t.fillStyle = "rgba(255,255,255,.25)"; rrect(t, 40, 50, 120, 16, 8); t.fill();
    t.fillStyle = "#212529"; rrect(t, 50, 70, 140, 50, 18); t.fill();
    t.fillStyle = "#adb5bd"; rrect(t, 0, 90, 34, 60, 10); t.fill(); rrect(t, 206, 90, 34, 60, 10); t.fill();
    t.fillStyle = "#ffe066"; t.fillRect(116, 6, 8, 36); t.beginPath(); t.arc(120, 8, 10, 0, 7); t.fill();
    t.fillStyle = T.top; t.font = `30px ${EMOJI}`; t.textAlign = "center"; t.textBaseline = "middle"; t.fillText("👑", 120, 32); });
  const bubSpr = r => sp("bub" + r, r*2 + 4, r*2 + 4, t => { const m = r + 2, gr = t.createRadialGradient(m - r*.35, m - r*.4, 1, m, m, r);
    gr.addColorStop(0, "rgba(255,255,255,.95)"); gr.addColorStop(.55, "rgba(165,216,255,.45)"); gr.addColorStop(1, "rgba(77,171,247,.85)"); t.fillStyle = gr; t.beginPath(); t.arc(m, m, r, 0, 7); t.fill();
    t.strokeStyle = "rgba(255,255,255,.9)"; t.lineWidth = Math.max(1.5, r*.1); t.stroke(); t.fillStyle = "#fff"; t.beginPath(); t.ellipse(m - r*.4, m - r*.4, r*.16, r*.26, -.7, 0, 7); t.fill(); });
  const orbSpr = () => sp("orb", 22, 22, t => { const gr = t.createRadialGradient(9, 9, 1, 11, 11, 11); gr.addColorStop(0, "#fff3bf"); gr.addColorStop(.5, "#ff922b"); gr.addColorStop(1, "#e8590c"); t.fillStyle = gr; t.beginPath(); t.arc(11, 11, 10, 0, 7); t.fill(); });
  const heroSpr = (dir, f, up) => sp(`hero${dir}${f}${up}`, 80, 80, t => {
    t.save(); if (dir < 0){ t.translate(80, 0); t.scale(-1, 1); }
    const lg = [[0, 0], [8, -6], [0, 0], [-8, 6]][f];
    t.fillStyle = "#364fc7"; rrect(t, 28 + lg[0]*.5, 56, 11, 22, 5); t.fill(); rrect(t, 42 - lg[0]*.5, 56, 11, 22, 5); t.fill();
    t.fillStyle = "#212529"; rrect(t, 25 + lg[0]*.5, 72, 16, 8, 4); t.fill(); rrect(t, 40 - lg[0]*.5, 72, 16, 8, 4); t.fill();
    t.fillStyle = "#f76707"; rrect(t, 24, 34, 34, 28, 10); t.fill(); t.fillStyle = "#ffd43b"; t.fillRect(24, 50, 34, 5);
    t.fillStyle = "#adb5bd"; if (up){ rrect(t, 46, 4, 14, 36, 6); t.fill(); t.fillStyle = "#4dabf7"; t.beginPath(); t.arc(53, 6, 7, 0, 7); t.fill(); }
    else { rrect(t, 44, 38, 34, 14, 6); t.fill(); t.fillStyle = "#4dabf7"; t.beginPath(); t.arc(77, 45, 7, 0, 7); t.fill(); t.fillStyle = "#74c0fc"; rrect(t, 50, 32, 14, 8, 4); t.fill(); }
    t.restore(); });
  const ICON = {s: "🔱", r: "⚡", h: "❤️", d: "🛡️", b: "💣", c: "🪙"};
  const itemSpr = k => sp("it" + k, 52, 52, t => { if (k !== "c"){ const gr = t.createRadialGradient(20, 18, 2, 26, 26, 24); gr.addColorStop(0, "#fff"); gr.addColorStop(1, {s: "#da77f2", r: "#ffd43b", h: "#ff8787", d: "#74c0fc", b: "#9775fa"}[k]);
      t.fillStyle = gr; t.beginPath(); t.arc(26, 26, 23, 0, 7); t.fill(); t.strokeStyle = "#fff"; t.lineWidth = 3; t.stroke(); } G2.emo(t, ICON[k], 26, 28, k === "c" ? 34 : 26); });
  const crateSpr = () => sp("crate", 56, 56, t => { t.fillStyle = "#b07d48"; rrect(t, 0, 0, 56, 56, 8); t.fill(); t.strokeStyle = "#7f5539"; t.lineWidth = 5; t.strokeRect(6, 6, 44, 44); t.beginPath(); t.moveTo(6, 6); t.lineTo(50, 50); t.stroke();
    t.fillStyle = "#ffe066"; t.font = `22px ${EMOJI}`; t.textAlign = "center"; t.textBaseline = "middle"; t.fillText("❓", 28, 29); });
  const ctrlSpr = (k, r, on) => sp(`ct${k}${r}${on ? 1 : 0}`, r*2 + 10, r*2 + 10, t => { const m = r + 5;
    if (k === "stick"){ t.fillStyle = "rgba(20,15,46,.38)"; t.beginPath(); t.arc(m, m, r, 0, 7); t.fill(); t.strokeStyle = "rgba(255,255,255,.6)"; t.lineWidth = 3; t.stroke();
      t.fillStyle = "rgba(255,255,255,.75)"; [[-1,0],[1,0],[0,-1]].forEach(([dx, dy]) => { t.save(); t.translate(m + dx*r*.7, m + dy*r*.7); t.rotate(Math.atan2(dy, dx)); t.beginPath(); t.moveTo(r*.14, 0); t.lineTo(-r*.08, -r*.13); t.lineTo(-r*.08, r*.13); t.closePath(); t.fill(); t.restore(); }); return; }
    const col = {shoot: ["#74c0fc","#1864ab"], jump: ["#8ce99a","#2b8a3e"], bomb: ["#d0bfff","#5f3dc4"]}[k];
    t.fillStyle = "rgba(0,0,0,.35)"; t.beginPath(); t.arc(m, m + 5, r, 0, 7); t.fill();
    const gr = t.createLinearGradient(0, m - r, 0, m + r); gr.addColorStop(0, col[0]); gr.addColorStop(1, col[1]); t.globalAlpha = on ? 1 : .82; t.fillStyle = gr; t.beginPath(); t.arc(m, m + (on ? 4 : 0), r, 0, 7); t.fill();
    t.globalAlpha = 1; t.strokeStyle = "rgba(255,255,255,.8)"; t.lineWidth = 4; t.stroke();
    G2.emo(t, {shoot: "🫧", jump: "⤴️", bomb: "💣"}[k], m, m - r*.12 + (on ? 4 : 0), r*.75); outlinedRaw(t, {shoot: "쏘기", jump: "점프", bomb: "폭탄"}[k], m, m + r*.56 + (on ? 4 : 0), Math.round(r*.3), "#fff"); });
  const knob = () => sp("knob", 80, 80, t => { t.fillStyle = "rgba(255,255,255,.85)"; t.beginPath(); t.arc(40, 40, 34, 0, 7); t.fill(); t.fillStyle = "#4dabf7"; t.beginPath(); t.arc(40, 40, 22, 0, 7); t.fill(); });

  /* ---------- 판 만들기 ---------- */
  function setSky(){ const cv = $("#ngCanvas"); cv.style.backgroundImage = thm().sky; cv.style.backgroundColor = "#1c1d52"; }
  function gen(upto){
    while (genX < upto){
      const x0 = genX, cw = 520, diff = Math.min(1, (stage - 1)*.25 + (x0 - (stEnd - STAGE_L))/STAGE_L*.35);
      genX += cw;
      if (x0 < 900) continue;
      if (x0 > stEnd - 900) continue;                         // 왕로봇 나오는 곳은 비워 둬요
      if (Math.random() < .55){ const w = [160, 220, 280][Math.floor(Math.random()*3)], px = x0 + 60 + Math.random()*(cw - w - 60), py = GY - 140 - Math.random()*110; plats.push({x: px, y: py, w, h: 24});
        if (Math.random() < .5) for (let i = 0; i < 4; i++) items.push({k: "c", x: px + w/2 - 70 + i*36, y: py - 60, w: 36, h: 36, vy: 0, fix: 1}); }
      if (Math.random() < .3) crates.push({x: x0 + 80 + Math.random()*360, y: GY - 56, w: 56, h: 56, hp: 2});
      const n = 1 + Math.floor(Math.random()*(1.5 + diff*2.5));
      for (let i = 0; i < n; i++){
        const r = Math.random(), k = r < .4 ? "walker" : r < .62 ? "drone" : r < .82 ? "jumper" : "turret", d = EN[k];
        const x = x0 + 120 + Math.random()*(cw - 140);
        ens.push({k, x, y: k === "drone" ? GY - 230 - Math.random()*120 : GY - d.h, w: d.w, h: d.h, hp: d.hp + Math.floor((stage - 1)/2), vx: 0, vy: 0, t: Math.floor(Math.random()*60), on: false, dir: -1, y0: 0, hit: 0});
      }
      if (Math.random() < .25 + diff*.1) for (let i = 0; i < 5; i++) items.push({k: "c", x: x0 + 100 + i*44, y: GY - 60 - Math.sin(i/4*Math.PI)*80, w: 36, h: 36, vy: 0, fix: 1});
    }
  }
  function newStage(){ stEnd = (stEnd || 0) + STAGE_L; camMax = Infinity; boss = null; bossOn = false; setSky(); msg = {t: `STAGE ${stage}`, s: thm().n, k: 140}; }

  /* ---------- 쏘기 ---------- */
  function fire(){
    const up = pl.aimUp, sp0 = 12.5, ox = up ? pl.x + pl.w/2 + pl.dir*14 : pl.x + pl.w/2 + pl.dir*40, oy = up ? pl.y - 22 : pl.y + 36;
    const base = up ? -Math.PI/2 : pl.dir > 0 ? 0 : Math.PI, angs = wpn === "s" ? [-.2, 0, .2] : [0];
    angs.forEach(a => { const an = base + a*(pl.dir > 0 || up ? 1 : -1); shots.push({x: ox, y: oy, vx: Math.cos(an)*sp0 + (up ? 0 : pl.vx*.3), vy: Math.sin(an)*sp0, t: 75, r: 13}); });
    shootCd = wpn === "r" ? 6 : 11; tone(900 + Math.random()*200, 1500, .06, "sine", .05);
  }
  function popBomb(){
    if (bombs <= 0 || dead) return; bombs--; flash = 26; tone(200, 900, .4, "sine", .14); tone(1200, 200, .5, "triangle", .08, .1);
    ens.forEach(e => { if (e.on && e.x < cam + W + 40) trapE(e); }); ens = ens.filter(e => !e.trapped);
    ebul = []; if (boss && bossOn) dmgBoss(18);
  }
  function trapE(e){ e.trapped = true; trapped.push({k: e.k, x: e.x, y: e.y, w: e.w, h: e.h, t: 0, sc: EN[e.k].sc}); score += EN[e.k].sc; kills++;
    if (Math.random() < .28) items.push({k: Math.random() < .8 ? "c" : ["s","r","h","d","b"][Math.floor(Math.random()*5)], x: e.x + e.w/2 - 20, y: e.y, w: 40, h: 40, vy: -6});
    tone(600, 1300, .2, "sine", .1); }
  function dmgBoss(n){ boss.hp -= n; boss.hit = 6; if (boss.hp <= 0){ score += 3000 + stage*1000; bossDown(); } }
  function bossDown(){
    bossOn = false; clearT = 200; tone(300, 1200, .5, "square", .07);
    trapped.push({k: "boss", x: boss.x, y: boss.y, w: 240, h: 220, t: 0, sc: 0, big: 1}); boss = null; ebul = [];
    msg = {t: "🎉 STAGE CLEAR!", s: `+${(3000 + stage*1000).toLocaleString()}점`, k: 180}; SFX.rec();
    for (let i = 0; i < 8; i++) items.push({k: "c", x: camMax + W*.45 + i*40, y: GY - 200 - Math.random()*80, w: 36, h: 36, vy: -4 - Math.random()*4});
    if (hearts < 5) items.push({k: "h", x: camMax + W*.55, y: GY - 260, w: 40, h: 40, vy: -5});
  }
  function hurt(){
    if (inv || dead) return;
    if (shield){ shield = 0; inv = 70; tone(800, 300, .2, "square", .08); return; }
    hearts--; inv = 110; pl.vy = -7; pl.vx = -pl.dir*5; SFX.bad(); flash = 10;
    if (hearts <= 0){ dead = true; deadT = 110; SFX.over(); }
  }
  function boom(x, y, n, col){ if (fx.length > 260) fx.splice(0, 60); for (let i = 0; i < n; i++){ const a = Math.random()*7, v = 1.5 + Math.random()*4; fx.push({x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v - 1, t: 26 + Math.random()*14, c: col || "#a5d8ff", r: 3 + Math.random()*4}); } }

  /* ---------- 한 장면 ---------- */
  function step(){
    if (flash) flash--; if (msg && msg.k) msg.k--;
    if (dead){ if (--deadT <= 0){ NG.over(score, `<div>🫧 STAGE ${stage} · 🤖 로봇 ${kills}대를 거품에 가뒀어요</div>`); } pl.vy += .5; pl.y += pl.vy; return; }
    startT++;
    // 조작
    const L = keys.l || stick.x < -.3, R = keys.r || stick.x > .3;
    pl.aimUp = keys.u || stick.y < -.55;
    const acc = pl.ground ? .9 : .55, mx = 5.4;
    if (L && !R){ pl.vx = Math.max(-mx, pl.vx - acc); pl.dir = -1; } else if (R && !L){ pl.vx = Math.min(mx, pl.vx + acc); pl.dir = 1; } else pl.vx *= pl.ground ? .72 : .94;
    if (jumpBuf > 0) jumpBuf--;
    if (jumpBuf && (pl.ground || pl.coy > 0)){ pl.vy = -14.2; pl.ground = false; pl.coy = 0; jumpBuf = 0; pl.jumps = 1; tone(380, 820, .12, "sine", .09); }
    else if (jumpBuf && pl.jumps === 1 && !pl.ground){ pl.vy = -12; pl.jumps = 2; jumpBuf = 0; boom(pl.x + pl.w/2, pl.y + pl.h, 8, "#fff"); tone(520, 1100, .12, "sine", .09); }
    if (!keys.j && !stick.jh && pl.vy < -5) pl.vy += 1.1;     // 짧게 누르면 낮게
    pl.vy = Math.min(16, pl.vy + .62);
    const oy = pl.y; pl.x += pl.vx; pl.y += pl.vy;
    pl.x = Math.max(cam + 10, Math.min(pl.x, (camMax < Infinity ? camMax + W : cam + W) - pl.w - 10));
    if (boss && bossOn && pl.x + pl.w > boss.x + 40){ pl.x = boss.x + 40 - pl.w; if (pl.vx > 0) pl.vx = -3; }   // 왕로봇 뒤로는 못 가요
    // 땅·발판
    const was = pl.ground; pl.ground = false;
    if (pl.y + pl.h >= GY){ pl.y = GY - pl.h; pl.vy = 0; pl.ground = true; }
    else if (pl.vy >= 0) for (const p of plats){ if (pl.x + pl.w - 10 > p.x && pl.x + 10 < p.x + p.w && oy + pl.h <= p.y + 2 && pl.y + pl.h >= p.y){ pl.y = p.y - pl.h; pl.vy = 0; pl.ground = true; break; } }
    if (pl.ground){ pl.jumps = 0; pl.coy = 7; if (!was) boom(pl.x + pl.w/2, pl.y + pl.h, 4, "rgba(255,255,255,.8)"); } else if (pl.coy > 0) pl.coy--;
    if (Math.abs(pl.vx) > .6 && pl.ground) pl.run += Math.abs(pl.vx)*.09;
    if (inv) inv--;
    if (wpnT > 0 && --wpnT === 0) wpn = "";
    // 쏘기
    if (shootCd > 0) shootCd--;
    if ((keys.s || stick.sh) && shootCd <= 0) fire();
    // 카메라
    const want = pl.x - W*(land ? .36 : .3);
    if (want > cam) cam += Math.min(want - cam, 9);
    if (!bossOn && !boss && cam > stEnd - W && clearT <= 0){ camMax = stEnd - W; boss = {x: stEnd - 300, y: GY - 220 - 40, hp: 60 + stage*25, max: 60 + stage*25, t: 0, hit: 0, ph: 0, vy: 0}; bossOn = true; msg = {t: "⚠️ 왕로봇 등장!", s: "거품을 마구 쏴요!", k: 120}; tone(150, 100, .6, "sawtooth", .08); }
    if (camMax < Infinity) cam = Math.min(cam, camMax);
    gen(cam + W + 600);
    // 총알
    shots.forEach(s => { s.x += s.vx; s.y += s.vy; s.t--; });
    shots = shots.filter(s => { if (s.t <= 0 || s.x < cam - 40 || s.x > cam + W + 40 || s.y < -40) return false;
      const b = {x: s.x - s.r, y: s.y - s.r, w: s.r*2, h: s.r*2};
      for (const e of ens){ if (e.on && !e.trapped && hitR(b, e)){ e.hp--; e.hit = 6; boom(s.x, s.y, 5); if (e.hp <= 0) trapE(e); return false; } }
      for (const c of crates){ if (hitR(b, c)){ c.hp--; boom(s.x, s.y, 4, "#d9a066"); if (c.hp <= 0){ c.dead = 1; boom(c.x + 28, c.y + 28, 14, "#b07d48"); tone(300, 120, .15, "square", .08);
        items.push({k: ["s","r","d","b","h","s","r"][Math.floor(Math.random()*7)], x: c.x + 8, y: c.y, w: 40, h: 40, vy: -7}); } return false; } }
      if (boss && bossOn && hitR(b, {x: boss.x + 20, y: boss.y + 30, w: 200, h: 180})){ dmgBoss(1); boom(s.x, s.y, 4, "#ffe066"); return false; }
      return true; });
    ens = ens.filter(e => !e.trapped); crates = crates.filter(c => !c.dead && c.x > cam - 100);
    // 로봇
    const px = pl.x + pl.w/2, py = pl.y + pl.h/2;
    ens.forEach(e => {
      if (!e.on){ if (e.x < cam + W + 30) { e.on = true; e.y0 = e.y; } else return; }
      e.t++; if (e.hit) e.hit--;
      const ex = e.x + e.w/2, sp2 = 1 + stage*.15;
      if (e.k === "walker"){ e.dir = px < ex ? -1 : 1; e.x += e.dir*(1.1 + sp2*.5); }
      else if (e.k === "drone"){ e.x += Math.sign(px - ex)*Math.min(1.6, Math.abs(px - ex)*.01) - .3; e.y = e.y0 + Math.sin(e.t*.05)*30;
        if (e.t % Math.max(70, 140 - stage*12) === 0 && Math.abs(px - ex) < 360) ebul.push({x: ex, y: e.y + e.h, vx: 0, vy: 4.2, t: 200}); }
      else if (e.k === "jumper"){ e.vy += .6; e.y += e.vy; e.x += e.vx; if (e.y >= GY - e.h){ e.y = GY - e.h; e.vy = 0; e.vx = 0; if (e.t % 60 === 0){ e.vy = -11 - Math.random()*3; e.vx = Math.sign(px - ex)*(2.4 + sp2*.4); } } }
      else if (e.k === "turret"){ if (e.t % Math.max(80, 150 - stage*12) === 0 && Math.abs(px - ex) < W*.8){ const a = Math.atan2(py - (e.y + 20), px - ex), v = 4.6 + stage*.3; ebul.push({x: ex, y: e.y + 20, vx: Math.cos(a)*v, vy: Math.sin(a)*v, t: 220}); tone(250, 180, .08, "square", .05); } }
      if (!inv && hitR({x: pl.x + 8, y: pl.y + 8, w: pl.w - 16, h: pl.h - 10}, e)) hurt();
    });
    ens = ens.filter(e => e.x > cam - 240);
    // 왕로봇
    if (boss && bossOn){ const b = boss; b.t++; if (b.hit) b.hit--; b.y = GY - 240 + Math.sin(b.t*.04)*18; b.x = camMax + W - 280 + Math.sin(b.t*.017)*70;
      const per = Math.max(60, 110 - stage*8), ph = Math.floor(b.t/240) % 3;
      if (ph === 0 && b.t % per === 0){ const a0 = Math.atan2(py - (b.y + 100), px - (b.x + 40)); for (let i = -2; i <= 2; i++){ const a = a0 + i*.22; ebul.push({x: b.x + 30, y: b.y + 110, vx: Math.cos(a)*5.2, vy: Math.sin(a)*5.2, t: 240}); } tone(220, 140, .15, "sawtooth", .06); }
      if (ph === 1 && b.t % 120 === 0 && ens.length < 4){ for (let i = 0; i < 2; i++){ const d = EN.drone; ens.push({k: "drone", x: b.x + 60*i, y: b.y, y0: GY - 260 - Math.random()*160, w: d.w, h: d.h, hp: 1, vx: 0, vy: 0, t: 1, on: true, dir: -1, hit: 0}); } }
      if (ph === 2 && b.t % Math.max(45, per - 20) === 0){ ebul.push({x: b.x + 40, y: GY - 22, vx: -6.2 - stage*.3, vy: 0, t: 260, roll: 1}); tone(160, 90, .2, "triangle", .08); }
      if (!inv && hitR({x: pl.x + 8, y: pl.y + 8, w: pl.w - 16, h: pl.h - 10}, {x: b.x + 30, y: b.y + 40, w: 180, h: 170})) hurt();
    }
    if (clearT > 0 && --clearT === 0){ stage++; newStage(); }
    // 적 총알
    ebul.forEach(b => { b.x += b.vx; b.y += b.vy; b.t--; });
    ebul = ebul.filter(b => { if (b.t <= 0 || b.y > GY + 10 || b.x < cam - 40 || b.x > cam + W + 60) return false;
      if (!inv && Math.hypot(b.x - px, b.y - py) < (b.roll ? 34 : 28)){ hurt(); return false; } return true; });
    // 아이템
    items.forEach(it => { if (!it.fix){ it.vy = Math.min(9, it.vy + .4); it.y += it.vy; if (it.y + it.h > GY){ it.y = GY - it.h; it.vy = 0; } } });
    items = items.filter(it => { if (it.x < cam - 80) return false;
      if (hitR({x: pl.x, y: pl.y, w: pl.w, h: pl.h}, it)){ const k = it.k;
        if (k === "c"){ score += 50; tone(1320, 1760, .07, "square", .05); }
        else { SFX.item(); score += 100;
          if (k === "s" || k === "r"){ wpn = k; wpnT = 60*14; } else if (k === "h") hearts = Math.min(5, hearts + 1); else if (k === "d") shield = 1; else if (k === "b") bombs = Math.min(5, bombs + 1);
          fx.push({tx: {s: "🔱 세 갈래 거품!", r: "⚡ 연사!", h: "❤️ 하트 +1", d: "🛡️ 방패!", b: "💣 거품 폭탄 +1"}[k], x: it.x, y: it.y, t: 60}); }
        return false; } return true; });
    // 거품에 갇힌 로봇: 둥실둥실 올라가요 (닿으면 펑! 보너스)
    trapped.forEach(t => { t.t++; t.y -= t.big ? 1.6 : 1.9; t.x += Math.sin(t.t*.08)*.8; });
    trapped = trapped.filter(t => { if (t.y < -t.h - 40 || t.t > 260){ return false; }
      if (!t.big && t.t > 12 && hitR({x: pl.x, y: pl.y, w: pl.w, h: pl.h}, t)){ score += 50; boom(t.x + t.w/2, t.y + t.h/2, 14); tone(1400, 400, .15, "square", .07); fx.push({tx: "+50 펑!", x: t.x, y: t.y, t: 50}); return false; }
      return true; });
    // 효과
    fx.forEach(f => { if (f.tx){ f.y -= 1; } else { f.x += f.vx; f.y += f.vy; f.vy += .15; } f.t--; }); fx = fx.filter(f => f.t > 0);
    plats = plats.filter(p => p.x + p.w > cam - 60);
    if (pl.y > VH + 200){ pl.y = GY - pl.h - 200; hurt(); }
  }

  /* ---------- 그리기 ---------- */
  /* 옆으로 이어지는 그림은 무늬 칠하기로 (이음매 틈 없이, 한 번에) */
  function strip(g, c, w, h, off, y){
    const k = NG.k || 1, cw = Math.max(1, Math.floor(w*k)), ch = c.height, dy = Math.round(y*k);   // 화면 점 1:1로 붙여요 (늘이기 없이 → 가장 빠르고 이음매도 없어요)
    g.setTransform(1, 0, 0, 1, 0, 0);
    for (let x = -Math.round((off*k) % cw); x < W*k; x += cw) g.drawImage(c, 0, 0, cw, ch, x, dy, cw, ch);
    g.setTransform(k, 0, 0, k, 0, 0);
  }
  function draw(g){
    g.clearRect(0, 0, W, H);
    const fr = NG.frame, k = NG.k || 1, X = x => Math.round((x - cam)*k)/k;
    // 먼 산 · 가까운 언덕
    strip(g, farSpr(), 900, 300, cam*.15, GY - 290);
    strip(g, nearSpr(), 800, 200, cam*.45, GY - 190);
    strip(g, groundSpr(), 128, GY0, cam, GY);
    // 발판 · 상자
    plats.forEach(p => { if (p.x - cam < W + 10 && p.x + p.w - cam > -10) g.drawImage(platSpr(p.w), X(p.x), p.y, p.w, 30); });
    const cs = crateSpr(); crates.forEach(c => { if (c.x - cam < W) g.drawImage(cs, X(c.x), c.y, 56, 56); });
    // 아이템
    items.forEach(it => { if (it.x - cam > W) return; const s = itemSpr(it.k), bob = it.fix ? Math.sin(fr*.1 + it.x)*4 : 0, sz = it.k === "c" ? 36 : 44; g.drawImage(s, X(it.x) + (it.w - sz)/2, it.y + bob + (it.h - sz)/2, sz, sz); });
    // 로봇
    ens.forEach(e => { if (!e.on && e.x - cam > W + 30) return; const s = robotSpr(e.k, Math.floor((e.t || 0)/8) % 2), x = X(e.x);
      if (e.hit && e.hit % 2) g.globalAlpha = .55;
      if (e.k === "walker" && e.dir > 0){ g.save(); g.translate(x + e.w, e.y); g.scale(-1, 1); g.drawImage(s, 0, 0, e.w, e.h); g.restore(); } else g.drawImage(s, x, e.y, e.w, e.h);
      if (e.k === "turret"){ const a = Math.atan2(pl.y + 40 - (e.y + 26), pl.x + 20 - (e.x + 35)); g.save(); g.translate(x + 35, e.y + 26); g.rotate(a); g.fillStyle = "#343a40"; g.fillRect(4, -6, 32, 12); g.restore(); }
      g.globalAlpha = 1; });
    // 왕로봇
    if (boss){ const b = boss, s = bossSpr(Math.floor(b.t/10) % 2); if (b.hit % 2) g.globalAlpha = .6; g.drawImage(s, X(b.x), b.y, 240, 220); g.globalAlpha = 1;
      const eye = Math.floor(b.t/240) % 3; g.fillStyle = ["#ff6b6b","#ffe066","#74c0fc"][eye]; const ex = X(b.x) + 120 + Math.cos(b.t*.05)*30; g.beginPath(); g.arc(ex - 26, b.y + 95, 11, 0, 7); g.arc(ex + 26, b.y + 95, 11, 0, 7); g.fill(); }
    // 갇힌 로봇
    trapped.forEach(t => { const s = t.k === "boss" ? null : robotSpr(t.k, 0), r = Math.max(t.w, t.h)*.72, cx = X(t.x) + t.w/2, cy = t.y + t.h/2;
      if (s){ g.save(); g.translate(cx, cy); g.rotate(Math.sin(t.t*.1)*.3); g.drawImage(s, -t.w/2*.8, -t.h/2*.8, t.w*.8, t.h*.8); g.restore(); }
      else { g.globalAlpha = .85; g.drawImage(bossSpr(0), cx - 100, cy - 92, 200, 184); g.globalAlpha = 1; }
      const bs = bubSpr(40), wob = 1 + Math.sin(t.t*.15)*.05; g.drawImage(bs, cx - r*wob, cy - r/wob, r*2*wob, r*2/wob); });
    // 친구 (주인공)
    if (!(inv && Math.floor(fr/4) % 2)){
      const f = pl.ground ? (Math.abs(pl.vx) > .6 ? Math.floor(pl.run) % 4 : 0) : 1, hs = heroSpr(pl.dir, f, pl.aimUp ? 1 : 0), x = X(pl.x) - 18, y = pl.y - 20;
      if (shield){ g.drawImage(bubSpr(50), x - 2, y - 6, 104, 104); }
      g.drawImage(hs, x, y + 20, 80, 80);
      faceAt(g, sid, x + 40 + pl.dir*2, y + 28 + (pl.ground && Math.abs(pl.vx) > .6 ? Math.abs(Math.sin(pl.run*Math.PI/2))*-3 : 0), 24, "#fff", dead);
    }
    // 총알
    const sb = bubSpr(13); shots.forEach(s => g.drawImage(sb, X(s.x) - 15, s.y - 15, 30, 30));
    const ob = orbSpr(); ebul.forEach(b => { if (b.roll){ g.drawImage(ob, X(b.x) - 22, b.y - 22, 44, 44); } else g.drawImage(ob, X(b.x) - 11, b.y - 11, 22, 22); });
    // 효과
    fx.forEach(f => { if (f.tx){ g.globalAlpha = Math.min(1, f.t/20); outlined(g, f.tx, X(f.x) + 20, f.y, 24, "#ffe066"); g.globalAlpha = 1; return; }
      g.globalAlpha = Math.min(1, f.t/18); g.fillStyle = f.c; g.fillRect(X(f.x) - f.r/2, f.y - f.r/2, f.r, f.r); });
    g.globalAlpha = 1;
    if (flash){ g.fillStyle = `rgba(255,255,255,${flash/40})`; g.fillRect(0, 0, W, VH); }
    // 위: 하트 · 점수 · 무기
    outlined(g, "❤️".repeat(Math.max(0, Math.min(5, hearts))) + "🤍".repeat(Math.max(0, 3 - hearts)), 20, 34, 30, "#fff", undefined, "left");
    outlined(g, `${score.toLocaleString()}점`, W/2, 34, 34, "#fff");
    outlined(g, `💣×${bombs}${shield ? " 🛡️" : ""}${wpn ? ` ${ICON[wpn]} ${Math.ceil(wpnT/60)}` : ""}`, W - 20, 34, 26, "#fff", undefined, "right");
    const base = stEnd - STAGE_L, pr = Math.max(0, Math.min(1, (cam + W*.5 - base)/(STAGE_L - W*.5)));
    g.fillStyle = "rgba(20,15,46,.45)"; rrect(g, W/2 - 160, 60, 320, 14, 7); g.fill(); g.fillStyle = "#ffe066"; rrect(g, W/2 - 160, 60, Math.max(14, 320*pr), 14, 7); g.fill();
    outlined(g, `ST${stage}`, W/2 - 182, 67, 18, "#fff", undefined, "right"); outlined(g, "👑", W/2 + 176, 67, 18, "#fff", undefined, "left");
    if (boss && bossOn){ const r = Math.max(0, boss.hp/boss.max); g.fillStyle = "rgba(20,15,46,.6)"; rrect(g, W/2 - 220, 86, 440, 20, 10); g.fill(); g.fillStyle = "#ff6b6b"; rrect(g, W/2 - 220, 86, Math.max(20, 440*r), 20, 10); g.fill(); outlined(g, "왕로봇", W/2, 96, 16, "#fff"); }
    if (msg && msg.k > 0){ g.globalAlpha = Math.min(1, msg.k/20); outlined(g, msg.t, W/2, VH*.36, land ? 72 : 60, "#fff"); if (msg.s) outlined(g, msg.s, W/2, VH*.36 + 60, 34, "#ffe066"); g.globalAlpha = 1; }
    if (startT < 240 && !dead){ g.globalAlpha = Math.min(1, (240 - startT)/40); outlined(g, land ? "← → 움직이기 · ↑ 위로 쏘기 · Z 쏘기 · X 점프(두 번!) · C 폭탄" : "왼쪽 막대로 움직이고 · 오른쪽 버튼으로 쏘고 뛰어요!", W/2, VH*.6, land ? 26 : 24, "#fff"); g.globalAlpha = 1; }
    // 조작 버튼
    if (!land){ g.fillStyle = "rgba(20,15,46,.82)"; g.fillRect(0, VH, W, H - VH); g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(0, VH, W, 3); }
    CT.forEach(c => { if (c.t === "bomb" && bombs <= 0) g.globalAlpha = .35;
      let on = false; ptr.forEach(v => { if (v.t === c.t) on = true; }); if (c.t === "shoot" && keys.s) on = true; if (c.t === "jump" && keys.j) on = true;
      g.drawImage(ctrlSpr(c.t, c.r, on && c.t !== "stick"), c.x - c.r - 5, c.y - c.r - 5, c.r*2 + 10, c.r*2 + 10);
      if (c.t === "stick"){ g.drawImage(knob(), c.x + stick.x*c.r*.6 - 30, c.y + stick.y*c.r*.6 - 30, 60, 60); }
      if (c.t === "bomb") outlined(g, `×${bombs}`, c.x + c.r*.75, c.y - c.r*.7, 20, "#ffe066");
      g.globalAlpha = 1; });
  }

  /* ---------- 터치 ---------- */
  function hitCT(x, y){ let best = null, bd = 1e9; CT.forEach(c => { const d = Math.hypot(x - c.x, y - c.y); if (d < c.r*(c.t === "stick" ? 1.6 : 1.3) && d < bd){ bd = d; best = c; } });
    if (!best && x < W*.42 && y > VH*.45) best = CT[0];           // 왼쪽 아래 아무 데나 누르면 막대
    return best; }
  function stickAt(c, x, y){ const dx = (x - c.x)/(c.r*.7), dy = (y - c.y)/(c.r*.7), m = Math.hypot(dx, dy); stick.x = m > 1 ? dx/m : dx; stick.y = m > 1 ? dy/m : dy; }
  function syncPtr(){ let sh = false, jh = false, st = false; ptr.forEach(v => { if (v.t === "shoot") sh = true; if (v.t === "jump") jh = true; if (v.t === "stick") st = true; }); stick.sh = sh; stick.jh = jh; if (!st){ stick.x = 0; stick.y = 0; } }

  const self = {
    get W(){ return W; }, get H(){ return H; }, maxPx: 1.9e6, layout,
    get dbg(){ return {pl, cam, stage, score, hearts, ens, boss, bossOn, stEnd, camMax, items, shots}; },
    cheat(o){ Object.assign(pl, o.pl || {}); if (o.cam != null) cam = o.cam; if (o.hearts != null) hearts = o.hearts; if (o.bombs != null) bombs = o.bombs; },
    init(){
      stage = 1; stEnd = 0; score = 0; hearts = 3; bombs = 2; wpn = ""; wpnT = 0; shield = 0; inv = 0; dead = false; kills = 0; flash = 0; startT = 0; clearT = 0;
      cam = 0; camMax = Infinity; genX = 0; shots = []; ebul = []; ens = []; plats = []; items = []; crates = []; fx = []; trapped = [];
      keys = {}; ptr = new Map(); jumpBuf = 0; shootCd = 0; stick = {x: 0, y: 0, sh: false, jh: false};
      pl = {x: 200, y: GY - 74, w: 44, h: 74, vx: 0, vy: 0, dir: 1, ground: true, coy: 0, jumps: 0, run: 0, aimUp: false};
      newStage(); gen(W + 600);
      const warm = () => { if (NG.cur !== self) return; Object.keys(EN).forEach(k => { robotSpr(k, 0); robotSpr(k, 1); }); "srhdbc".split("").forEach(itemSpr); bubSpr(13); bubSpr(40); bubSpr(50); orbSpr(); crateSpr(); bossSpr(0); bossSpr(1); [0,1,2,3].forEach(f => [1,-1].forEach(d => { heroSpr(d, f, 0); heroSpr(d, f, 1); })); };
      (window.requestIdleCallback || setTimeout)(warm, {timeout: 400});
    },
    down(x, y, id){ const c = hitCT(x, y); if (!c) { ptr.set(id, {t: "shoot"}); syncPtr(); return; }
      ptr.set(id, {t: c.t, c});
      if (c.t === "stick") stickAt(c, x, y); else if (c.t === "jump") jumpBuf = 8; else if (c.t === "bomb") popBomb();
      syncPtr(); },
    move(x, y, id){ const v = ptr.get(id); if (v && v.t === "stick") stickAt(v.c, x, y); },
    up(x, y, id){ ptr.delete(id); syncPtr(); },
    key(code, d){
      const m = {ArrowLeft: "l", KeyA: "l", ArrowRight: "r", KeyD: "r", ArrowUp: "u", KeyW: "u", KeyZ: "s", KeyJ: "s", KeyX: "j", KeyK: "j", Space: "j", KeyC: "b", KeyL: "b"}[code];
      if (!m) return false;
      if (m === "j" && d && !keys.j) jumpBuf = 8;
      if (m === "b"){ if (d && !keys.b) popBomb(); }
      keys[m] = d; return true;
    },
    step, draw,
    hud(){ return `🫧 STAGE ${stage} · ${thm().n} · ${score.toLocaleString()}점`; }
  };
  return self;
};
