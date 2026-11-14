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
  /* ⚡ 움직이지 않는 배경은 캔버스 뒤 그림(CSS)으로 한 번만 깔아요 — 매 장면 화면 전체를 다시 칠하지 않고 지우기만 해서 훨씬 가벼워요 */
  bgId: null, bgReady: false, bgUrl: "",
  bg(g, key, w, h, fn){
    const id = key + "|" + (NG.k || 1), cv = $("#ngCanvas");
    if (this.bgId === id && this.bgReady && cv.style.backgroundImage){ g.clearRect(0, 0, w, h); return; }
    const s = this.spr("bg:" + key, w, h, fn);
    g.drawImage(s, 0, 0, w, h);
    if (this.bgId === id) return;
    this.bgId = id; this.bgReady = false;
    try { s.toBlob(bl => { if (this.bgId !== id || !bl) return;
      const u = URL.createObjectURL(bl), im = new Image();
      im.onload = () => { if (this.bgId !== id){ URL.revokeObjectURL(u); return; }
        if (this.bgUrl) URL.revokeObjectURL(this.bgUrl); this.bgUrl = u;
        cv.style.backgroundImage = `url(${u})`; cv.style.backgroundSize = "100% 100%"; this.bgReady = true; };
      im.src = u; }, "image/png"); } catch(e) {}
  },
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
  /* 📱 화면 비율에 맞춰 양옆(가로) · 아래(세로) 판을 넓히고, 조작 버튼은 그 판 안에만 두어 미로를 가리지 않아요 */
  function layout(sw, sh){
    const asp = sw/Math.max(1, sh);
    land = asp >= 1.2;
    const two = local.length >= 2;
    if (land){ H = FH + TOP + 10; const side = Math.round(Math.max(236, Math.min(440, (H*asp - FW)/2))); W = FW + side*2; FX = side; FY = TOP;
      const rd = Math.round(Math.min(two ? 100 : 128, side*.42)), rb = Math.round(Math.min(two ? 70 : 108, side*.34));
      PADS = two ? [{pl: local[0], t: "d", x: side/2, y: H - rd - 40, r: rd}, {pl: local[0], t: "b", x: side/2, y: H - rd*2 - rb - 90, r: rb},
                    {pl: local[1], t: "d", x: W - side/2, y: H - rd - 40, r: rd}, {pl: local[1], t: "b", x: W - side/2, y: H - rd*2 - rb - 90, r: rb}]
                 : [{pl: local[0], t: "d", x: side/2, y: H - rd - 50, r: rd}, {pl: local[0], t: "b", x: W - side/2, y: H - rb - 60, r: rb}];
    } else { W = Math.max(FW + 16, 820); FX = (W - FW)/2; FY = TOP;
      H = Math.round(Math.max(FH + TOP + 300, Math.min(FH + TOP + 760, W*sh/Math.max(1, sw))));
      const big = H - (FH + TOP) > 420, by = H - (big ? 230 : 160);   // 📱 아래 판이 넓으면 버튼을 크게, 엄지가 닿는 높이에
      PADS = two ? [{pl: local[0], t: "d", x: 130, y: H - 150, r: 100}, {pl: local[0], t: "b", x: 310, y: H - 150, r: 64},
                    {pl: local[1], t: "b", x: W - 310, y: H - 150, r: 64}, {pl: local[1], t: "d", x: W - 130, y: H - 150, r: 100}]
                 : [{pl: local[0], t: "d", x: big ? 190 : 170, y: by, r: big ? 140 : 120}, {pl: local[0], t: "b", x: W - (big ? 190 : 170), y: by, r: big ? 118 : 100}];
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
  function padDir(p, x, y, v){ const dx = x - (v && v.cx != null ? v.cx : p.x), dy = y - (v && v.cy != null ? v.cy : p.y); if (Math.hypot(dx, dy) < p.r*.18) return 0; return Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 3 : 4) : (dy < 0 ? 1 : 2); }
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
      // 📱 엄지가 닿은 자리가 가운데가 돼요 (방향판 안에서)
      const lim = pd.r*.7, v = {pl: pd.pl, t: "d", pad: pd, cx: Math.max(pd.x - lim, Math.min(pd.x + lim, x)), cy: Math.max(pd.y - lim, Math.min(pd.y + lim, y))}; v.dir = padDir(pd, x, y, v); ptr.set(id, v);
    },
    move(x, y, id){ const v = ptr.get(id); if (v && v.t === "d") v.dir = padDir(v.pad, x, y, v); },
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
        let on = false, cx = pd.x, cy = pd.y; ptr.forEach(v => { if (v.pl === pd.pl && v.t === pd.t){ on = true; if (v.cx != null){ cx = v.cx; cy = v.cy; } } });
        g.globalAlpha = on ? 1 : .85; G2.put(g, c, cx - pd.r - 4, cy - pd.r - 4 + (on && pd.t === "b" ? 4 : 0)); g.globalAlpha = 1;
        if (pd.t === "d"){ ptr.forEach(v => { if (v.pl === pd.pl && v.t === "d" && v.dir){ const a = [0, -Math.PI/2, Math.PI/2, Math.PI, 0][v.dir]; g.fillStyle = PCOL[pd.pl]; g.beginPath(); g.arc(cx + Math.cos(a)*pd.r*.6, cy + Math.sin(a)*pd.r*.6, pd.r*.24, 0, 7); g.fill(); } }); }
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
/* 여러 명 게임 시작 창 (물풍선 · 버블 특공대가 같이 써요) */
function partyModal(gid){
  let box = $("#mdWb");
  if (!box){ document.body.insertAdjacentHTML("beforeend", `<div class="arc-modal" id="mdWb" hidden><div class="arc-card arc-wide wb-card"><h2 id="wbTitle"></h2><div id="wbBody"></div><button class="arc-x" data-close>×</button></div></div>`);
    box = $("#mdWb"); box.querySelector("[data-close]").onclick = () => { box.hidden = true; PARTY.leave(); }; }
  PARTY.use(gid); $("#wbTitle").textContent = `${GAME[gid].e} ${GAME[gid].n}`;
  return box;
}
const WB = {
  bots: 1, lv: 1,
  menu(){
    const me = ARC.me, box = partyModal("wb"), body = $("#wbBody");
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
  gid: "wb", CFG: {wb: {max: 6, bots: 1, min: 2}, bs: {max: 4, bots: 0, min: 2}},
  get MAX(){ return this.CFG[this.gid].max; },
  use(gid){ if (this.role && this.gid !== gid) this.leave(); this.gid = gid; },
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
    this.unRooms = fs.onSnapshot(fs.query(this.col(), fs.where("st", "==", "open")), qs => { this.allRooms = qs;
      const l = []; qs.forEach(d => l.push(Object.assign({id: d.id}, d.data())));
      this.rooms = l.filter(r => Date.now() - (r.at || 0) < 90000 && (r.g || "wb") === this.gid).sort((a, b) => (a.t0 || 0) - (b.t0 || 0)); this.renderRooms();
    }, e => console.warn(e));
  },
  unwatchRooms(){ if (this.unRooms) this.unRooms(); this.unRooms = null; },
  renderRooms(){
    const box = $("#wbRooms"); if (!box) return; $("#wbBody").classList.toggle("in-room", !!this.role);
    if (!this.ok()){ box.innerHTML = `<p class="arc-small">🌐 온라인 방은 선생님이 <b>☁️ Firebase</b>로 연결한 반에서 쓸 수 있어요. 지금은 위의 두 가지로 해요!</p>`; return; }
    const face = no => `<span class="avf">${avHTMLof(sidOf(no), {still: true, face: true})}</span>`;
    if (this.role === "host"){
      const M = this.members, slots = Array.from({length: this.MAX}, (_, i) => i < M.length ? `<div class="wb-slot on">${face(M[i])}<b>${i === 0 ? "👑 " : ""}${esc(who(M[i]))}</b></div>`
        : i < M.length + (this.CFG[this.gid].bots ? this.bots : 0) ? `<div class="wb-slot bot"><span class="f">🤖</span><b>컴퓨터</b></div>` : `<div class="wb-slot"><span class="f">⏳</span><b>빈자리</b></div>`).join("");
      const cf = this.CFG[this.gid], maxB = cf.bots ? this.MAX - M.length : 0, g = GAME[this.gid], nb = Math.min(this.bots, maxB);
      box.innerHTML = `<div class="wb-wait"><b>🏠 내 방이 열렸어요!</b> 친구들은 ${g.e} ${g.n} → 🌐 온라인 방에서 <b>${esc(who(ARC.me))}</b>의 방에 들어와요.</div>
        <div class="wb-slots">${slots}</div>
        ${cf.bots ? `<div class="wb-row"><span>🤖 빈자리 컴퓨터</span><div class="arc-seg" id="wbPBots">${Array.from({length: maxB + 1}, (_, n) => `<button data-v="${n}" class="${n === nb ? "on" : ""}">${n}</button>`).join("")}</div></div>` : `<p class="arc-small">👥 친구들이 다 들어오면 시작을 눌러요. 모두 함께 로봇 군단을 물리쳐요!</p>`}
        <div class="arc-row"><button class="arc-btn" id="wbPClose">✕ 방 닫기</button><button class="arc-btn p" id="wbPGo" ${M.length + nb < cf.min ? "disabled" : ""}>▶ 시작! (${M.length + nb}명)</button></div>`;
      if ($("#wbPBots")) $("#wbPBots").onclick = e => { const b = e.target.closest("button"); if (b){ this.bots = +b.dataset.v; this.renderRooms(); this.lobbyMsg(); } };
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
      await fs.setDoc(r, {host: ARC.me, g: this.gid, st: "open", n: 1, at: now, t0: now});
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
      if (m.t === "in"){ if ((m.n || 0) > (P.inN || 0)){ P.inN = m.n; P.last = m; } }
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
  lobbyMsg(){ if (this.role === "host") this.sendAll({t: "lobby", m: this.members, bots: this.CFG[this.gid].bots ? Math.min(this.bots, this.MAX - this.members.length) : 0}); },
  start(again){
    if (this.role !== "host") return;
    if (this.gid === "bs") return this.startBs(again);
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
  startBs(again){
    const live = this.connected().map(p => p.no);
    this.members = [ARC.me].concat(this.members.filter(no => no !== ARC.me && live.includes(no))).slice(0, this.MAX);
    const M = this.members; if (M.length < 2){ toast("친구가 1명 이상 들어와야 시작할 수 있어요"); this.renderRooms(); return; }
    this.started = true; Store.fs.updateDoc(this.ref(this.pid), {st: "play", n: M.length}).catch(() => {});
    const sids = M.map(sidOf), seed = Math.floor(Math.random()*1e9) + 1, remote = {};
    M.forEach((no, i) => { if (i){ const P = this.peers.get(no); if (P){ P.idx = i; P.inN = 0; P.last = {}; remote[i] = no; this.send(P, {t: "start", g: "bs", sids, idx: i, seed}); } } });
    this.seq = 0; const md = $("#mdWb"); if (md) md.hidden = true;
    if (!again){ ARC.game = "bs"; ARC.enter(); ARC.prep(); }
    getAC(); NG.play("bs", sids, {party: "host", local: [0], remote, seed});
  },
  remoteIn(idx){ for (const P of this.peers.values()) if (P.idx === idx) return {m: P.last || {}, open: P.r.readyState === "open"}; return null; },
  sendIn(o, rel){ const H = this.hp; if (!H) return; o.t = "in"; o.n = ++this.inN; const s = JSON.stringify(o);
    try { if (H.u && H.u.readyState === "open") H.u.send(s); if (rel && H.r && H.r.readyState === "open") H.r.send(s); } catch(e) {} },
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
      const gid = m.g || "wb";
      if ($("#ng").hidden || !NG.cur){ ARC.game = gid; ARC.enter(); ARC.prep(); }
      getAC(); NG.play(gid, m.sids, {party: "guest", idx: m.idx, local: [m.idx], bots: m.bots || [], lv: m.lv, seed: m.seed});
    }
    else if (m.t === "end"){ this.game && this.game.end(m.w, m.wins, m); }
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
    const playing = NG.cur && NG.gid === this.gid && !$("#ng").hidden;
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
    if (gid !== "wb" && gid !== "bs") return play.call(this, gid);
    if (!LOBBY.canPlay(gid)) return; getAC(); this.game = gid; this.lastRank = gid; (gid === "wb" ? WB : BS).menu();
  };
  const again = NG.again, close = NG.close;
  NG.again = function(){ if (this.opt.party){ if (this.opt.party === "host") PARTY.again(); return; } return again.call(this); };
  NG.close = function(){ if (this.opt && this.opt.party && PARTY.role) PARTY.leave(); return close.call(this); };
  const play0 = NG.play;   // 다른 게임으로 갈 때 배경 그림 크기 설정은 지워요
  NG.play = function(...a){ const cv = $("#ngCanvas"); cv.style.backgroundSize = cv.style.backgroundRepeat = cv.style.backgroundPosition = ""; return play0.apply(this, a); };
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
   🫧 버블 특공대 — 최대 4명이 함께 로봇 군단을 거품에 가둬 날려 보내요
   - 맵 5곳: 🌳 푸른 초원 → 🏜️ 황금 사막 → ❄️ 얼음 왕국 → 🌋 용암 던전 → 🚀 우주 요새, 다 깨면 더 어려운 2회차!
   - 맵 끝마다 맵마다 다른 왕로봇, 갈수록 로봇이 많고 빠르고 단단해지고 금빛 정예 로봇·탱크·박쥐봇이 나와요
   - 같이 하기: 한 기기에서 둘이 / 🌐 온라인 방(각자 기기로 최대 4명, 방장 기기가 심판)
   ⚡ 렉 줄이기: 하늘·먼 산은 맵마다 한 번 그린 그림(CSS 배경), 언덕·땅은 화면 점 1:1 붙이기,
      로봇·왕로봇·거품·빛은 한 번 그린 그림을 붙여요. 매 장면 그림자 번짐·그라데이션 새로 만들기 없음.
   ===================================================================== */
const BSA = {
  OL: "#1b1233",
  rng(seed){ let s = (seed >>> 0) || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0)/4294967296; },
  lg(t, x0, y0, x1, y1, st){ const g = t.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, c]) => g.addColorStop(o, c)); return g; },
  rg(t, x, y, r0, r1, st, x1, y1){ const g = t.createRadialGradient(x, y, r0, x1 ?? x, y1 ?? y, r1); st.forEach(([o, c]) => g.addColorStop(o, c)); return g; },
  ol(t, w = 3, c){ t.lineJoin = "round"; t.lineCap = "round"; t.lineWidth = w; t.strokeStyle = c || BSA.OL; t.stroke(); },
  /* 산줄기: 왼쪽→오른쪽 꼭대기 점들 (tile이면 처음과 끝 높이를 맞춰 이어 붙여도 티가 안 나요) */
  ridge(w, n, yMin, yMax, seed, tile){ const r = BSA.rng(seed), pts = []; for (let i = 0; i <= n; i++) pts.push([i*w/n, yMin + r()*(yMax - yMin)]); if (tile) pts[n][1] = pts[0][1]; return pts; },
  fillRidge(t, pts, bottom, smooth, fill, stroke){
    t.beginPath(); t.moveTo(pts[0][0], bottom); t.lineTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++){ const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      if (smooth){ const mx = (x0 + x1)/2; t.bezierCurveTo(mx, y0, mx, y1, x1, y1); } else t.lineTo(x1, y1); }
    t.lineTo(pts[pts.length - 1][0], bottom); t.closePath(); t.fillStyle = fill; t.fill(); if (stroke) BSA.ol(t, stroke[0], stroke[1]);
  },
  peaks(w, n, base, hMin, hMax, seed, tile){ const r = BSA.rng(seed), pts = []; const step = w/n;
    for (let i = 0; i <= n; i++){ pts.push([i*step, base - (i % 2 ? hMin*.35 + r()*hMin*.4 : hMin + r()*(hMax - hMin))]); } if (tile) pts[n][1] = pts[0][1]; return pts; },
  caps(t, pts, base, col){ t.fillStyle = col; for (let i = 0; i < pts.length; i += 2){ const [px, py] = pts[i], d = (base - py)*.28; if (d < 18) continue;
    t.beginPath(); t.moveTo(px, py); t.lineTo(px - d*.75, py + d); t.lineTo(px - d*.35, py + d*.8); t.lineTo(px - d*.1, py + d*1.05); t.lineTo(px + d*.2, py + d*.78); t.lineTo(px + d*.55, py + d*1.02); t.lineTo(px + d*.8, py + d); t.closePath(); t.fill(); } },
  cloud(t, x, y, s, a = 1, top = "#ffffff", bot = "#c5dcf5"){
    t.globalAlpha = a; const blobs = [[0, 0, 1], [-.9, .25, .7], [.95, .2, .75], [-.4, -.35, .75], [.45, -.4, .7], [1.6, .4, .5], [-1.55, .45, .5]];
    t.fillStyle = bot; blobs.forEach(([bx, by, br]) => { t.beginPath(); t.arc(x + bx*s, y + by*s + s*.18, br*s, 0, 7); t.fill(); });
    t.fillStyle = top; blobs.forEach(([bx, by, br]) => { t.beginPath(); t.arc(x + bx*s, y + by*s, br*s*.94, 0, 7); t.fill(); }); t.globalAlpha = 1; },
  stars(t, w, h, n, seed, big){ const r = BSA.rng(seed); for (let i = 0; i < n; i++){ const x = r()*w, y = r()*h, s = r(); t.globalAlpha = .35 + r()*.65; t.fillStyle = s > .9 ? "#ffe9a8" : s > .8 ? "#a8d8ff" : "#fff";
    t.fillRect(x, y, s > .85 ? 2.5 : 1.5, s > .85 ? 2.5 : 1.5);
    if (big && s > .965){ t.globalAlpha = .8; t.fillRect(x - 6, y + .5, 14, 1.2); t.fillRect(x + .5, y - 6, 1.2, 14); } } t.globalAlpha = 1; },
  tree(t, x, y, s, c1, c2, c3){ t.fillStyle = "#6b3e26"; t.beginPath(); t.rect(x - s*.12, y - s*.9, s*.24, s*.9); BSA.ol(t, 2); t.fill();
    t.beginPath(); t.arc(x, y - s*1.25, s*.62, 0, 7); t.arc(x - s*.45, y - s*.95, s*.45, 0, 7); t.arc(x + s*.45, y - s*.95, s*.47, 0, 7); BSA.ol(t, 3); t.fillStyle = c1; t.fill();
    t.fillStyle = c2; t.beginPath(); t.arc(x - s*.12, y - s*1.33, s*.45, 0, 7); t.arc(x - s*.5, y - s*1.02, s*.3, 0, 7); t.fill();
    t.fillStyle = c3; t.beginPath(); t.arc(x - s*.22, y - s*1.5, s*.18, 0, 7); t.fill(); },
  pine(t, x, y, s, c1, c2, snow){ t.fillStyle = "#5c3a21"; t.fillRect(x - s*.08, y - s*.35, s*.16, s*.35);
    for (let i = 0; i < 3; i++){ const yy = y - s*.25 - i*s*.42, ww = s*(.62 - i*.14); t.beginPath(); t.moveTo(x, yy - s*.62); t.lineTo(x + ww, yy); t.lineTo(x - ww, yy); t.closePath(); t.fillStyle = c1; t.fill(); BSA.ol(t, 2.5);
      t.beginPath(); t.moveTo(x, yy - s*.62); t.lineTo(x - ww, yy); t.lineTo(x - ww*.2, yy); t.closePath(); t.fillStyle = c2; t.fill();
      if (snow){ t.fillStyle = "#f4fbff"; t.beginPath(); t.moveTo(x, yy - s*.62); t.lineTo(x + ww*.45, yy - s*.34); t.lineTo(x + ww*.15, yy - s*.38); t.lineTo(x - ww*.1, yy - s*.3); t.lineTo(x - ww*.45, yy - s*.34); t.closePath(); t.fill(); } } },
  glow(t, x, y, r, col, a = .55){ t.fillStyle = BSA.rg(t, x, y, 0, r, [[0, col.replace("A", a)], [1, col.replace("A", 0)]]); t.beginPath(); t.arc(x, y, r, 0, 7); t.fill(); }
};

/* ---------- 맵 5곳 ---------- */
const BS_TH = [
  {id: "meadow", n: "🌳 푸른 초원", base: "#2f6fd0", boss: "킹크랩 메카", roll: "#8d6e63",
   top: "#5fd35a", top2: "#3fae3b", dirt: "#9a6235", dirt2: "#7a4a26", stone: "#c9b79c", plat: ["#b07a45", "#8a5a2e", "#6fd36a"]},
  {id: "desert", n: "🏜️ 황금 사막", base: "#e07b39", boss: "모래 전갈 전차", roll: "#c98a3d",
   top: "#ffd77a", top2: "#f2b84b", dirt: "#e6a24c", dirt2: "#c9822f", stone: "#f7d9a0", plat: ["#d9a066", "#a86f3a", "#ffe08a"]},
  {id: "snow", n: "❄️ 얼음 왕국", base: "#2a4fa8", boss: "빙하 골렘", roll: "#e3f2ff",
   top: "#ffffff", top2: "#d6ecff", dirt: "#7fb2f0", dirt2: "#5c8fd6", stone: "#c9e3ff", plat: ["#9cc9f5", "#6a9fd8", "#ffffff"]},
  {id: "lava", n: "🌋 용암 던전", base: "#2a0808", boss: "용암 드래곤", roll: "#ff7b29",
   top: "#5a2a2a", top2: "#3d1a1a", dirt: "#2e1717", dirt2: "#1f0e0e", stone: "#ff7b29", plat: ["#4a2424", "#2e1414", "#ff8a3d"]},
  {id: "space", n: "🚀 우주 요새", base: "#120b33", boss: "우주 마더쉽", roll: "#8ce9ff",
   top: "#9aa4c7", top2: "#6d7699", dirt: "#4a5170", dirt2: "#363c57", stone: "#ffd43b", plat: ["#7c86ad", "#4f5778", "#9ff3ff"]}
];

/* 하늘 · 먼 풍경 (맵마다 한 장, CSS 배경으로) */
function bsBackdrop(t, th, w, h){
  const R = BSA.rng(77 + th.id.length*13), hz = h*.82;
  if (th.id === "meadow"){
    t.fillStyle = BSA.lg(t, 0, 0, 0, h, [[0, "#1d4fb8"], [.45, "#4f9df0"], [.78, "#a9dcff"], [1, "#e8f8ff"]]); t.fillRect(0, 0, w, h);
    const sx = w*.78, sy = h*.17; BSA.glow(t, sx, sy, 260, "rgba(255,244,190,A)", .5);
    t.save(); t.translate(sx, sy); for (let i = 0; i < 14; i++){ t.rotate(Math.PI*2/14); t.fillStyle = "rgba(255,255,230,.07)"; t.beginPath(); t.moveTo(0, 0); t.lineTo(w*.7, -26); t.lineTo(w*.7, 26); t.closePath(); t.fill(); } t.restore();
    t.fillStyle = BSA.rg(t, sx, sy, 10, 62, [[0, "#ffffff"], [.5, "#fff6b8"], [1, "#ffd451"]]); t.beginPath(); t.arc(sx, sy, 58, 0, 7); t.fill();
    [[.12, .16, 46, .95], [.4, .1, 34, .85], [.58, .26, 52, .95], [.95, .33, 40, .9], [.25, .36, 30, .8]].forEach(([x, y, s, a]) => BSA.cloud(t, x*w, y*h, s, a));
    const p1 = BSA.peaks(w, 12, hz - 40, 180, 300, 3); BSA.fillRidge(t, p1, h, false, BSA.lg(t, 0, hz - 300, 0, hz, [[0, "#8fa9e8"], [1, "#6d8ad6"]])); BSA.caps(t, p1, hz - 40, "#f2f6ff");
    // 먼 성
    const cx = w*.3, cy = hz - 130; t.fillStyle = "#5d77c7";
    [[-70, 60, 26], [-36, 110, 30], [0, 150, 36], [40, 100, 30], [76, 70, 24]].forEach(([dx, hh, ww]) => { t.fillRect(cx + dx - ww/2, cy - hh, ww, hh + 140);
      t.beginPath(); t.moveTo(cx + dx - ww*.65, cy - hh); t.lineTo(cx + dx, cy - hh - ww*1.3); t.lineTo(cx + dx + ww*.65, cy - hh); t.closePath(); t.fill();
      t.fillStyle = "#ffe48a"; t.fillRect(cx + dx - 3, cy - hh + 18, 6, 9); t.fillStyle = "#5d77c7"; });
    t.fillStyle = "#ff6b6b"; t.beginPath(); t.moveTo(cx, cy - 150 - 47); t.lineTo(cx + 22, cy - 150 - 41); t.lineTo(cx, cy - 150 - 35); t.fill();
    const p2 = BSA.ridge(w, 7, hz - 90, hz - 30, 9); BSA.fillRidge(t, p2, h, true, BSA.lg(t, 0, hz - 90, 0, hz, [[0, "#5aa7a0"], [1, "#4b8f8a"]]));
    t.strokeStyle = "rgba(30,40,80,.5)"; t.lineWidth = 2.2; for (let i = 0; i < 6; i++){ const bx = w*(.45 + R()*.3), by = h*(.2 + R()*.2), s = 6 + R()*5; t.beginPath(); t.moveTo(bx - s, by - s*.4); t.quadraticCurveTo(bx - s*.4, by - s*.6, bx, by); t.quadraticCurveTo(bx + s*.4, by - s*.6, bx + s, by - s*.4); t.stroke(); }
  } else if (th.id === "desert"){
    t.fillStyle = BSA.lg(t, 0, 0, 0, h, [[0, "#2b1055"], [.3, "#8e2c6b"], [.55, "#e2574c"], [.75, "#ff9a4d"], [1, "#ffd99a"]]); t.fillRect(0, 0, w, h);
    BSA.stars(t, w, h*.3, 60, 5);
    const sx = w*.62, sy = hz - 120; BSA.glow(t, sx, sy, 300, "rgba(255,200,120,A)", .55);
    t.save(); t.beginPath(); t.arc(sx, sy, 120, 0, 7); t.clip(); t.fillStyle = BSA.lg(t, 0, sy - 120, 0, sy + 120, [[0, "#fff6a8"], [.6, "#ffb347"], [1, "#ff6f3c"]]); t.fillRect(sx - 130, sy - 130, 260, 260);
    t.fillStyle = "#e2574c"; for (let i = 0; i < 6; i++) t.fillRect(sx - 130, sy + 10 + i*18, 260, 4 + i*1.6); t.restore();
    const mesa = (x, y, ww, hh, c) => { t.fillStyle = c; t.beginPath(); t.moveTo(x, y + hh); t.lineTo(x + ww*.12, y); t.lineTo(x + ww*.88, y); t.lineTo(x + ww, y + hh); t.closePath(); t.fill(); };
    mesa(w*.02, hz - 150, 260, 200, "#8f3d59"); mesa(w*.78, hz - 120, 300, 180, "#8f3d59"); mesa(w*.4, hz - 90, 180, 150, "#a24d5e");
    const pyr = (x, base, s) => { t.beginPath(); t.moveTo(x, base - s); t.lineTo(x + s*1.1, base); t.lineTo(x - s*1.1, base); t.closePath(); t.fillStyle = "#e8a25a"; t.fill();
      t.beginPath(); t.moveTo(x, base - s); t.lineTo(x + s*1.1, base); t.lineTo(x + s*.15, base); t.closePath(); t.fillStyle = "#b8703c"; t.fill();
      t.strokeStyle = "rgba(90,40,20,.35)"; t.lineWidth = 1.5; for (let i = 1; i < 6; i++){ const yy = base - s + s*i/6; t.beginPath(); t.moveTo(x - s*1.1*i/6, yy); t.lineTo(x + s*1.1*i/6, yy); t.stroke(); } };
    pyr(w*.22, hz - 10, 150); pyr(w*.36, hz - 10, 95); pyr(w*.86, hz, 120);
    const d1 = BSA.ridge(w, 6, hz - 40, hz, 21); BSA.fillRidge(t, d1, h, true, BSA.lg(t, 0, hz - 40, 0, h, [[0, "#f0a35a"], [1, "#d98a40"]]));
  } else if (th.id === "snow"){
    t.fillStyle = BSA.lg(t, 0, 0, 0, h, [[0, "#040a2a"], [.4, "#10276a"], [.75, "#3a68c8"], [1, "#9fc2ff"]]); t.fillRect(0, 0, w, h);
    BSA.stars(t, w, h*.6, 140, 8, true);
    t.save(); t.globalCompositeOperation = "lighter";
    [[.12, "rgba(80,255,170,A)"], [.2, "rgba(120,140,255,A)"], [.28, "rgba(200,110,255,A)"]].forEach(([yy, col], k) => { for (let i = 0; i < 26; i++){ const x = i*w/25, y = h*yy + Math.sin(i*.55 + k)*h*.06;
      t.fillStyle = BSA.lg(t, 0, y - 70, 0, y + 90, [[0, col.replace("A", 0)], [.5, col.replace("A", .22)], [1, col.replace("A", 0)]]); t.fillRect(x - 3, y - 70, w/25 + 6, 160); } });
    t.restore();
    const mx = w*.18, my = h*.16; BSA.glow(t, mx, my, 130, "rgba(220,235,255,A)", .45); t.fillStyle = "#f1f6ff"; t.beginPath(); t.arc(mx, my, 40, 0, 7); t.fill();
    t.fillStyle = "rgba(160,180,220,.5)"; [[-12, -8, 9], [10, 6, 7], [14, -14, 5]].forEach(([dx, dy, r]) => { t.beginPath(); t.arc(mx + dx, my + dy, r, 0, 7); t.fill(); });
    const p1 = BSA.peaks(w, 10, hz - 20, 200, 330, 31); BSA.fillRidge(t, p1, h, false, BSA.lg(t, 0, hz - 330, 0, hz, [[0, "#c9dcff"], [1, "#7f9fe0"]]));
    t.fillStyle = "rgba(255,255,255,.55)"; for (let i = 0; i + 1 < p1.length; i += 2){ const [x0, y0] = p1[i], [x1, y1] = p1[i + 1]; t.beginPath(); t.moveTo(x0, y0); t.lineTo(x1, y1); t.lineTo(x0 + (x1 - x0)*.25, hz); t.closePath(); t.fill(); }
    const p2 = BSA.peaks(w, 14, hz + 20, 90, 170, 37); BSA.fillRidge(t, p2, h, false, "#5b7fd0"); BSA.caps(t, p2, hz + 20, "#eef5ff");
  } else if (th.id === "lava"){
    t.fillStyle = BSA.lg(t, 0, 0, 0, h, [[0, "#0d0306"], [.45, "#2b0909"], [.8, "#6e1609"], [1, "#d8441c"]]); t.fillRect(0, 0, w, h);
    const vx = w*.55, vy = hz - 180; BSA.glow(t, vx, vy, 260, "rgba(255,110,40,A)", .45);
    t.beginPath(); t.moveTo(vx - 380, hz + 20); t.lineTo(vx - 70, vy); t.lineTo(vx + 70, vy); t.lineTo(vx + 380, hz + 20); t.closePath(); t.fillStyle = BSA.lg(t, 0, vy, 0, hz, [[0, "#3a1010"], [1, "#1a0707"]]); t.fill();
    t.fillStyle = BSA.lg(t, 0, vy, 0, vy + 200, [[0, "#ffd36b"], [.4, "#ff7b29"], [1, "rgba(255,80,20,0)"]]); [[-30, 14], [10, 10], [40, 12]].forEach(([dx, ww]) => { t.beginPath(); t.moveTo(vx + dx - ww/2, vy); t.quadraticCurveTo(vx + dx + 30, vy + 100, vx + dx*3, vy + 220); t.lineTo(vx + dx*3 + ww, vy + 220); t.quadraticCurveTo(vx + dx + 40, vy + 100, vx + dx + ww/2, vy); t.fill(); });
    t.fillStyle = "rgba(60,30,30,.55)"; [[0, -60, 60], [-30, -120, 80], [20, -190, 100], [-10, -260, 120]].forEach(([dx, dy, r]) => { t.beginPath(); t.arc(vx + dx, vy + dy, r, 0, 7); t.fill(); });
    // 먼 어둠의 성
    const fx = w*.15; t.fillStyle = "#170606"; [[0, 200, 50], [60, 260, 60], [130, 180, 46]].forEach(([dx, hh, ww]) => { t.fillRect(fx + dx, hz - hh, ww, hh + 50);
      for (let k = 0; k < 4; k++) t.fillRect(fx + dx + k*ww/4, hz - hh - 12, ww/8, 12); t.fillStyle = "#ff5a1f"; t.fillRect(fx + dx + ww/2 - 4, hz - hh + 30, 8, 12); t.fillRect(fx + dx + ww/2 - 4, hz - hh + 70, 8, 12); t.fillStyle = "#170606"; });
    // 천장 종유석
    t.fillStyle = "#0a0204"; t.beginPath(); t.moveTo(0, 0); for (let x = 0; x <= w; x += 40){ t.lineTo(x + 20, 30 + R()*110); t.lineTo(x + 40, 10 + R()*20); } t.lineTo(w, 0); t.closePath(); t.fill();
    // 용암 폭포
    t.save(); t.globalCompositeOperation = "lighter"; [w*.82, w*.93].forEach(x => { t.fillStyle = BSA.lg(t, x, 0, x + 26, 0, [[0, "rgba(255,90,20,0)"], [.5, "rgba(255,170,60,.85)"], [1, "rgba(255,90,20,0)"]]); t.fillRect(x, 60, 26, hz); BSA.glow(t, x + 13, hz, 70, "rgba(255,120,40,A)", .5); }); t.restore();
    t.fillStyle = "#ffb04a"; for (let i = 0; i < 70; i++){ t.globalAlpha = .3 + R()*.7; t.fillRect(R()*w, h*.2 + R()*h*.7, 2, 2); } t.globalAlpha = 1;
  } else {
    t.fillStyle = BSA.lg(t, 0, 0, 0, h, [[0, "#02010f"], [.55, "#130b3d"], [1, "#2c1166"]]); t.fillRect(0, 0, w, h);
    t.save(); t.globalCompositeOperation = "lighter";
    [[.2, .3, 260, "rgba(140,60,255,A)", .35], [.7, .55, 300, "rgba(30,200,210,A)", .22], [.45, .15, 200, "rgba(255,80,180,A)", .2]].forEach(([x, y, r, c, a]) => BSA.glow(t, x*w, y*h, r, c, a));
    t.restore(); BSA.stars(t, w, h, 220, 13, true);
    const px = w*.8, py = h*.28; t.fillStyle = BSA.rg(t, px - 30, py - 30, 10, 95, [[0, "#ffd0a0"], [.6, "#e0703a"], [1, "#6a2a5a"]]); t.beginPath(); t.arc(px, py, 90, 0, 7); t.fill();
    t.strokeStyle = "rgba(255,220,170,.75)"; t.lineWidth = 7; t.beginPath(); t.ellipse(px, py, 150, 30, -.25, Math.PI*.98, Math.PI*2.02); t.stroke();
    t.fillStyle = "#b8c4ff"; t.beginPath(); t.arc(w*.12, h*.2, 22, 0, 7); t.fill();
    // 먼 우주 정거장
    const sx = w*.35, sy = hz - 140; t.fillStyle = "#2a2466"; t.fillRect(sx - 160, sy, 320, 20); t.fillRect(sx - 30, sy - 80, 60, 180); t.beginPath(); t.arc(sx, sy - 80, 40, Math.PI, 0); t.fill();
    t.fillStyle = "#3d5aa8"; for (let i = 0; i < 4; i++){ t.fillRect(sx - 150 + i*32, sy - 40, 26, 40); t.fillRect(sx + 50 + i*32, sy - 40, 26, 40); }
    t.fillStyle = "#9ff3ff"; for (let i = 0; i < 8; i++) t.fillRect(sx - 20 + (i % 2)*30, sy - 60 + Math.floor(i/2)*30, 8, 6);
    const p1 = BSA.peaks(w, 16, hz + 10, 60, 140, 51); BSA.fillRidge(t, p1, h, false, "#241a55");
  }
}
/* 가운데 언덕 (천천히 따라오는 줄) — 이어 붙여도 티 안 나게 tile */
function bsMid(t, th, w, h){
  const R = BSA.rng(101 + th.id.length*7), b = h;
  if (th.id === "meadow"){
    BSA.fillRidge(t, BSA.ridge(w, 5, h*.35, h*.6, 3, true), b, true, BSA.lg(t, 0, h*.35, 0, h, [[0, "#57c45a"], [1, "#2f8f3a"]]), [3]);
    for (let i = 0; i < 9; i++){ const x = 40 + i*(w - 80)/8 + R()*30, y = h*.62 + R()*h*.25; R() < .3 ? BSA.pine(t, x, y, 60 + R()*20, "#2b7a3a", "#1f5f2c") : BSA.tree(t, x, y, 46 + R()*20, "#3fa548", "#5cc95e", "#9be38f"); }
  } else if (th.id === "desert"){
    BSA.fillRidge(t, BSA.ridge(w, 4, h*.45, h*.7, 5, true), b, true, BSA.lg(t, 0, h*.45, 0, h, [[0, "#f5b866"], [1, "#d98e3e"]]), [3]);
    for (let i = 0; i < 4; i++){ const x = 80 + i*w/4 + R()*60, y = h*.78; t.fillStyle = "#d9b48a"; for (let k = 0; k < 2; k++){ t.beginPath(); t.rect(x + k*70, y - 120 - k*30, 30, 120 + k*30); t.fill(); BSA.ol(t, 3); t.fillStyle = "#c49a6c"; t.fillRect(x + k*70, y - 120 - k*30, 30, 10); t.fillStyle = "#d9b48a"; } }
    for (let i = 0; i < 5; i++){ const x = 30 + i*w/5 + R()*80, y = h*.85, s = 50 + R()*30; t.fillStyle = "#3fa55a";
      t.beginPath(); t.roundRect ? t.roundRect(x - 9, y - s, 18, s, 9) : t.rect(x - 9, y - s, 18, s); BSA.ol(t, 3); t.fill();
      t.beginPath(); t.roundRect ? t.roundRect(x - 26, y - s*.7, 10, s*.35, 5) : 0; BSA.ol(t, 2.5); t.fill(); t.beginPath(); t.roundRect ? t.roundRect(x + 16, y - s*.85, 10, s*.4, 5) : 0; BSA.ol(t, 2.5); t.fill(); }
  } else if (th.id === "snow"){
    BSA.fillRidge(t, BSA.ridge(w, 5, h*.4, h*.62, 7, true), b, true, BSA.lg(t, 0, h*.4, 0, h, [[0, "#ffffff"], [1, "#b9d6ff"]]), [3, "#2a3f7a"]);
    for (let i = 0; i < 11; i++){ const x = 30 + i*(w - 60)/10 + R()*20, y = h*.66 + R()*h*.25; BSA.pine(t, x, y, 55 + R()*30, "#1f6f6a", "#164f4c", true); }
  } else if (th.id === "lava"){
    const pts = BSA.peaks(w, 12, h, h*.35, h*.8, 9, true); BSA.fillRidge(t, pts, b, false, BSA.lg(t, 0, 0, 0, h, [[0, "#3a1414"], [1, "#160606"]]), [3, "#0a0203"]);
    t.save(); t.globalCompositeOperation = "lighter"; t.strokeStyle = "rgba(255,120,40,.85)"; t.lineWidth = 3;
    for (let i = 0; i < 14; i++){ let x = R()*w, y = h*.5 + R()*h*.45; t.beginPath(); t.moveTo(x, y); for (let k = 0; k < 4; k++){ x += (R() - .5)*30; y += 10 + R()*14; t.lineTo(x, y); } t.stroke(); }
    t.restore();
  } else {
    t.fillStyle = BSA.lg(t, 0, h*.5, 0, h, [[0, "#3b4170"], [1, "#22264a"]]);
    for (let i = 0; i < 7; i++){ const x = i*w/7 + 20, tw = 60 + R()*40, th2 = h*(.35 + R()*.45);
      t.beginPath(); t.rect(x, h - th2, tw, th2); BSA.ol(t, 3); t.fill();
      t.fillStyle = "#5a6299"; t.fillRect(x + 6, h - th2 + 6, tw - 12, 8); t.fillStyle = "#9ff3ff"; for (let k = 0; k < 5; k++) t.fillRect(x + 10 + (k % 2)*(tw - 30), h - th2 + 26 + k*22, 10, 6);
      t.strokeStyle = "#5a6299"; t.lineWidth = 3; t.beginPath(); t.moveTo(x + tw/2, h - th2); t.lineTo(x + tw/2, h - th2 - 30); t.stroke(); t.fillStyle = "#ff6b6b"; t.beginPath(); t.arc(x + tw/2, h - th2 - 32, 4, 0, 7); t.fill();
      t.fillStyle = BSA.lg(t, 0, h*.5, 0, h, [[0, "#3b4170"], [1, "#22264a"]]); }
    t.beginPath(); t.ellipse(w*.5, h, 140, 90, 0, Math.PI, 0); t.fillStyle = "#46508a"; t.fill(); BSA.ol(t, 3); t.fillStyle = "rgba(160,240,255,.25)"; t.beginPath(); t.ellipse(w*.5 - 30, h - 50, 50, 20, -.3, 0, 7); t.fill();
  }
}
/* 가까운 풀숲·바위 (빨리 따라오는 줄) */
function bsNear(t, th, w, h){
  const R = BSA.rng(201 + th.id.length*5);
  if (th.id === "meadow"){
    for (let i = 0; i < 8; i++){ const x = i*w/8 + R()*40, s = 26 + R()*18; t.beginPath(); t.arc(x, h, s, Math.PI, 0); t.arc(x + s*.9, h, s*.75, Math.PI, 0); BSA.ol(t, 3); t.fillStyle = "#3e9e46"; t.fill(); t.fillStyle = "#5cc95e"; t.beginPath(); t.arc(x - s*.2, h - s*.3, s*.45, 0, 7); t.fill();
      if (R() < .6){ t.fillStyle = ["#ff6b9a", "#ffd43b", "#ffffff"][i % 3]; t.beginPath(); t.arc(x + s*.4, h - s*.6, 5, 0, 7); t.fill(); } }
    t.fillStyle = "#c08a55"; for (let x = 0; x < w; x += 60){ t.beginPath(); t.rect(x + 10, h - 56, 9, 56); BSA.ol(t, 2); t.fill(); } t.beginPath(); t.rect(0, h - 46, w, 7); t.rect(0, h - 26, w, 7); BSA.ol(t, 2); t.fill();
  } else if (th.id === "desert"){
    for (let i = 0; i < 6; i++){ const x = i*w/6 + R()*60, s = 22 + R()*26; t.beginPath(); t.moveTo(x - s, h); t.lineTo(x - s*.7, h - s*.9); t.lineTo(x + s*.2, h - s*1.2); t.lineTo(x + s, h - s*.5); t.lineTo(x + s*1.1, h); t.closePath(); BSA.ol(t, 3); t.fillStyle = "#c27c48"; t.fill(); t.fillStyle = "#e09a5e"; t.beginPath(); t.moveTo(x - s*.7, h - s*.9); t.lineTo(x + s*.2, h - s*1.2); t.lineTo(x, h - s*.5); t.closePath(); t.fill(); }
  } else if (th.id === "snow"){
    for (let i = 0; i < 7; i++){ const x = i*w/7 + R()*50, s = 20 + R()*30; t.beginPath(); t.moveTo(x, h); t.lineTo(x + s*.3, h - s*1.6); t.lineTo(x + s*.55, h - s*.6); t.lineTo(x + s*.85, h - s*2); t.lineTo(x + s*1.2, h); t.closePath(); BSA.ol(t, 3, "#2a3f7a"); t.fillStyle = "rgba(160,220,255,.9)"; t.fill(); t.fillStyle = "rgba(255,255,255,.75)"; t.beginPath(); t.moveTo(x + s*.3, h - s*1.6); t.lineTo(x + s*.4, h); t.lineTo(x + s*.15, h); t.closePath(); t.fill(); }
  } else if (th.id === "lava"){
    for (let i = 0; i < 7; i++){ const x = i*w/7 + R()*40, s = 24 + R()*26; t.beginPath(); t.moveTo(x - s, h); t.lineTo(x - s*.5, h - s); t.lineTo(x + s*.4, h - s*1.3); t.lineTo(x + s, h); t.closePath(); BSA.ol(t, 3, "#050101"); t.fillStyle = "#2a1010"; t.fill(); t.strokeStyle = "#ff7b29"; t.lineWidth = 2.5; t.beginPath(); t.moveTo(x - s*.3, h - s*.6); t.lineTo(x, h - s*.3); t.lineTo(x + s*.2, h - s*.8); t.stroke(); }
  } else {
    t.fillStyle = "#4b5480"; t.beginPath(); t.rect(0, h - 40, w, 14); BSA.ol(t, 3); t.fill(); t.fillStyle = "#6e78a8"; t.fillRect(0, h - 38, w, 4);
    for (let i = 0; i < 6; i++){ const x = i*w/6 + 30; t.fillStyle = "#59628f"; t.beginPath(); t.rect(x, h - 70, 54, 70); BSA.ol(t, 3); t.fill(); t.fillStyle = "#ffd43b"; for (let k = 0; k < 4; k++){ t.beginPath(); t.moveTo(x + k*14, h - 70); t.lineTo(x + k*14 + 7, h - 70); t.lineTo(x + k*14 + 14, h - 62); t.lineTo(x + k*14 + 7, h - 62); t.fill(); } t.fillStyle = i % 2 ? "#69db7c" : "#ff6b6b"; t.beginPath(); t.arc(x + 42, h - 48, 4, 0, 7); t.fill(); }
  }
}
/* 땅 한 칸 (128 × 땅 두께) */
function bsGround(t, th, w, h){
  const R = BSA.rng(301 + th.id.length);
  t.fillStyle = BSA.lg(t, 0, 0, 0, h, [[0, th.dirt], [1, th.dirt2]]); t.fillRect(0, 0, w, h);
  if (th.id === "lava" || th.id === "space"){
    t.strokeStyle = th.id === "lava" ? "#120606" : "#2b3047"; t.lineWidth = 3;
    for (let r = 0; r < 3; r++){ const y = 26 + r*30; t.beginPath(); t.moveTo(0, y); t.lineTo(w, y); t.stroke(); for (let c = 0; c < 2; c++){ const x = (c*64 + (r % 2)*32) % w; t.beginPath(); t.moveTo(x, y); t.lineTo(x, y + 30); t.stroke(); } }
    if (th.id === "lava"){ t.save(); t.globalCompositeOperation = "lighter"; t.strokeStyle = "rgba(255,110,30,.9)"; t.lineWidth = 2.5; for (let i = 0; i < 3; i++){ let x = 10 + i*42, y = 30; t.beginPath(); t.moveTo(x, y); for (let k = 0; k < 4; k++){ x += (R() - .5)*20; y += 14; t.lineTo(x, y); } t.stroke(); } t.restore(); }
    else { t.fillStyle = "#8a93b8"; for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++){ t.beginPath(); t.arc(8 + c*32, 32 + r*30, 2.5, 0, 7); t.fill(); } }
  } else {
    for (let i = 0; i < 7; i++){ const x = R()*w, y = 34 + R()*(h - 44), rx = 7 + R()*9, ry = 5 + R()*5; t.fillStyle = "rgba(0,0,0,.18)"; t.beginPath(); t.ellipse(x + 2, y + 3, rx, ry, 0, 0, 7); t.fill(); t.fillStyle = th.stone; t.beginPath(); t.ellipse(x, y, rx, ry, 0, 0, 7); t.fill(); t.fillStyle = "rgba(255,255,255,.35)"; t.beginPath(); t.ellipse(x - rx*.3, y - ry*.35, rx*.4, ry*.3, 0, 0, 7); t.fill(); }
  }
  // 윗면
  t.fillStyle = th.top2; t.fillRect(0, 0, w, 22);
  if (th.id === "meadow"){ t.fillStyle = th.top; t.fillRect(0, 0, w, 14); t.beginPath(); for (let x = 0; x <= w; x += 10){ t.moveTo(x, 14); t.lineTo(x + 5, 24 + (x % 20 ? 0 : 5)); t.lineTo(x + 10, 14); } t.fill(); t.fillStyle = "#9cf08f"; t.fillRect(0, 2, w, 3); }
  else if (th.id === "snow"){ t.fillStyle = th.top; t.beginPath(); t.moveTo(0, 0); t.lineTo(w, 0); t.lineTo(w, 16); for (let x = w; x >= 0; x -= 16) t.quadraticCurveTo(x - 8, 30, x - 16, 16); t.closePath(); t.fill(); t.fillStyle = "#d8ecff"; t.fillRect(0, 12, w, 3); }
  else if (th.id === "desert"){ t.fillStyle = th.top; t.fillRect(0, 0, w, 16); t.strokeStyle = "rgba(200,130,50,.5)"; t.lineWidth = 2; for (let k = 0; k < 2; k++){ t.beginPath(); t.moveTo(0, 6 + k*6); for (let x = 0; x <= w; x += 16) t.quadraticCurveTo(x + 8, 3 + k*6, x + 16, 6 + k*6); t.stroke(); } }
  else if (th.id === "lava"){ t.fillStyle = th.top; t.fillRect(0, 0, w, 14); t.fillStyle = "#ff7b29"; t.fillRect(0, 14, w, 3); }
  else { t.fillStyle = th.top; t.fillRect(0, 0, w, 16); t.fillStyle = "#ffd43b"; for (let x = -16; x < w; x += 24){ t.beginPath(); t.moveTo(x, 16); t.lineTo(x + 12, 16); t.lineTo(x + 24, 22); t.lineTo(x + 12, 22); t.fill(); } t.fillStyle = "#c5ccea"; t.fillRect(0, 2, w, 3); }
  t.fillStyle = "rgba(0,0,0,.25)"; t.fillRect(0, 22, w, 3);
}

/* ---------- 로봇 그림 (두 장면씩) ---------- */
const BS_EN = {
  walker: {hp: 2, w: 74, h: 62, sc: 100, n: "꽃게봇"},
  drone: {hp: 1, w: 76, h: 56, sc: 150, n: "윙윙드론"},
  jumper: {hp: 2, w: 62, h: 70, sc: 150, n: "스프링봇"},
  turret: {hp: 4, w: 80, h: 64, sc: 250, n: "포탑"},
  tank: {hp: 7, w: 120, h: 84, sc: 500, n: "탱크봇"},
  bat: {hp: 2, w: 84, h: 54, sc: 250, n: "박쥐봇"}
};
function bsEye(t, x, y, r, col = "#ff3b3b"){ t.fillStyle = "#1b1233"; t.beginPath(); t.arc(x, y, r + 3, 0, 7); t.fill();
  t.fillStyle = BSA.rg(t, x, y, 0, r, [[0, "#fff"], [.35, col], [1, col]]); t.beginPath(); t.arc(x, y, r, 0, 7); t.fill(); t.fillStyle = "#fff"; t.beginPath(); t.arc(x - r*.35, y - r*.35, r*.28, 0, 7); t.fill(); }
function bsMetal(t, y0, y1, c1, c2, c3){ return BSA.lg(t, 0, y0, 0, y1, [[0, c1], [.45, c2], [1, c3]]); }
function bsRobot(t, k, f, w, h){
  const O = BSA.ol;
  if (k === "walker"){   // 🦀 꽃게봇: 빨간 껍데기 + 집게 + 다리 4개
    t.strokeStyle = BSA.OL; t.lineWidth = 5; t.lineCap = "round";
    for (let i = 0; i < 4; i++){ const x = w*(.22 + i*.19), up = (i + f) % 2 ? 6 : 0; t.beginPath(); t.moveTo(x, h*.62); t.lineTo(x + (i < 2 ? -8 : 8), h*.82 - up); t.lineTo(x + (i < 2 ? -4 : 4), h - 3 - up); t.stroke(); }
    t.strokeStyle = "#ff8787"; t.lineWidth = 2.5; for (let i = 0; i < 4; i++){ const x = w*(.22 + i*.19), up = (i + f) % 2 ? 6 : 0; t.beginPath(); t.moveTo(x, h*.62); t.lineTo(x + (i < 2 ? -8 : 8), h*.82 - up); t.stroke(); }
    [[-1, w*.1], [1, w*.9]].forEach(([s, x]) => { t.beginPath(); t.ellipse(x, h*.38 - (f && s < 0 ? 4 : 0), 13, 11, 0, 0, 7); t.fillStyle = "#e03131"; t.fill(); O(t, 3);
      t.beginPath(); t.moveTo(x, h*.38); t.lineTo(x + s*14, h*.26 - (f ? 6 : 0)); t.lineTo(x + s*4, h*.34); t.closePath(); t.fillStyle = "#ffc9c9"; t.fill(); O(t, 2); });
    t.beginPath(); t.ellipse(w/2, h*.48, w*.34, h*.27, 0, 0, 7); t.fillStyle = bsMetal(t, h*.2, h*.75, "#ff8a8a", "#e03131", "#9b1c1c"); t.fill(); O(t, 3.5);
    t.fillStyle = "rgba(255,255,255,.45)"; t.beginPath(); t.ellipse(w*.4, h*.36, w*.12, h*.06, -.3, 0, 7); t.fill();
    t.fillStyle = "#ffd43b"; [w*.36, w*.5, w*.64].forEach(x => { t.beginPath(); t.arc(x, h*.62, 3, 0, 7); t.fill(); });
    t.strokeStyle = BSA.OL; t.lineWidth = 3; [w*.4, w*.6].forEach(x => { t.beginPath(); t.moveTo(x, h*.3); t.lineTo(x, h*.14); t.stroke(); }); bsEye(t, w*.4, h*.13, 6); bsEye(t, w*.6, h*.13, 6);
  } else if (k === "drone"){   // 🛸 윙윙드론: 유리 돔 + 프로펠러
    t.fillStyle = "#495057"; t.fillRect(w/2 - 3, 6, 6, 12); t.fillStyle = "rgba(220,230,255,.85)"; t.beginPath(); t.ellipse(w/2, 6, f ? w*.46 : w*.2, 4, 0, 0, 7); t.fill(); O(t, 2);
    t.beginPath(); t.ellipse(w/2, h*.62, w*.47, h*.22, 0, 0, 7); t.fillStyle = bsMetal(t, h*.4, h*.85, "#9bd4ff", "#2f86d6", "#164f8a"); t.fill(); O(t, 3.5);
    t.beginPath(); t.arc(w/2, h*.5, w*.22, Math.PI, 0); t.closePath(); t.fillStyle = "rgba(170,240,255,.85)"; t.fill(); O(t, 3); bsEye(t, w/2, h*.44, 7, "#ffd43b");
    t.fillStyle = "rgba(255,255,255,.7)"; t.beginPath(); t.ellipse(w*.42, h*.38, 5, 3, -.5, 0, 7); t.fill();
    for (let i = 0; i < 5; i++){ t.fillStyle = (i + f) % 2 ? "#69db7c" : "#ffd43b"; t.beginPath(); t.arc(w*(.18 + i*.16), h*.68, 3.5, 0, 7); t.fill(); }
  } else if (k === "jumper"){   // 🟢 스프링봇
    t.strokeStyle = "#adb5bd"; t.lineWidth = 6; t.beginPath(); for (let i = 0; i < 5; i++){ const y = h*(.62 + i*.07*(f ? .8 : 1)); t.moveTo(w*.3, y); t.lineTo(w*.7, y + h*.035); } t.stroke();
    t.strokeStyle = BSA.OL; t.lineWidth = 2; t.stroke(); t.fillStyle = "#495057"; t.beginPath(); t.rect(w*.22, h - 9, w*.56, 8); t.fill(); O(t, 2);
    t.beginPath(); t.arc(w/2, h*.36, w*.42, 0, 7); t.fillStyle = BSA.rg(t, w*.38, h*.22, 4, w*.48, [[0, "#b2f2bb"], [.6, "#40c057"], [1, "#1f7a33"]]); t.fill(); O(t, 3.5);
    t.fillStyle = "#1f7a33"; t.beginPath(); t.rect(w*.12, h*.4, w*.76, 7); t.fill(); bsEye(t, w*.36, h*.3, 7); bsEye(t, w*.64, h*.3, 7);
    t.fillStyle = "#1b1233"; t.beginPath(); t.arc(w/2, h*.48, 6, 0, Math.PI); t.fill();
  } else if (k === "turret"){   // 🏰 포탑 (포신은 따로 돌려 그려요)
    t.beginPath(); t.rect(2, h*.6, w - 4, h*.4 - 2); t.fillStyle = bsMetal(t, h*.6, h, "#adb5bd", "#6c757d", "#343a40"); t.fill(); O(t, 3.5);
    t.fillStyle = "#ffd43b"; for (let x = 6; x < w - 10; x += 18){ t.beginPath(); t.moveTo(x, h - 4); t.lineTo(x + 9, h - 4); t.lineTo(x + 15, h*.78); t.lineTo(x + 6, h*.78); t.fill(); }
    t.beginPath(); t.arc(w/2, h*.6, w*.36, Math.PI, 0); t.closePath(); t.fillStyle = bsMetal(t, h*.25, h*.6, "#dee2e6", "#868e96", "#495057"); t.fill(); O(t, 3.5); bsEye(t, w/2, h*.42, 8);
  } else if (k === "tank"){   // 🚜 탱크봇
    t.beginPath(); t.roundRect ? t.roundRect(4, h*.62, w - 8, h*.36, 16) : t.rect(4, h*.62, w - 8, h*.36); t.fillStyle = "#343a40"; t.fill(); O(t, 3.5);
    for (let i = 0; i < 6; i++){ const x = 16 + i*(w - 32)/5; t.fillStyle = "#868e96"; t.beginPath(); t.arc(x, h*.8, 8, 0, 7); t.fill(); O(t, 2); t.fillStyle = "#495057"; t.beginPath(); t.arc(x, h*.8, 3, 0, 7); t.fill(); }
    t.fillStyle = "#adb5bd"; for (let x = 8 + (f ? 7 : 0); x < w - 8; x += 14) t.fillRect(x, h*.62, 6, 4);
    t.beginPath(); t.roundRect ? t.roundRect(w*.12, h*.34, w*.76, h*.32, 10) : t.rect(w*.12, h*.34, w*.76, h*.32); t.fillStyle = bsMetal(t, h*.34, h*.66, "#a9e34b", "#5c940d", "#2b5a06"); t.fill(); O(t, 3.5);
    t.beginPath(); t.roundRect ? t.roundRect(w*.3, h*.1, w*.42, h*.3, 12) : t.rect(w*.3, h*.1, w*.42, h*.3); t.fillStyle = bsMetal(t, h*.1, h*.4, "#c0eb75", "#74b816", "#2b5a06"); t.fill(); O(t, 3.5);
    t.beginPath(); t.rect(w*.02, h*.18, w*.32, 12); t.fillStyle = "#495057"; t.fill(); O(t, 3); bsEye(t, w*.56, h*.24, 7);
    t.fillStyle = "#ffd43b"; t.font = `bold ${Math.round(h*.18)}px sans-serif`; t.textAlign = "center"; t.textBaseline = "middle"; t.fillText("★", w*.7, h*.5);
  } else if (k === "bat"){   // 🦇 박쥐봇
    const up = f ? -10 : 8;
    [[-1], [1]].forEach(([s]) => { t.beginPath(); t.moveTo(w/2 + s*12, h*.45); t.lineTo(w/2 + s*w*.48, h*.3 + up); t.lineTo(w/2 + s*w*.38, h*.62 + up*.4); t.lineTo(w/2 + s*w*.28, h*.5); t.lineTo(w/2 + s*w*.2, h*.7); t.closePath(); t.fillStyle = "#7048e8"; t.fill(); O(t, 3); t.fillStyle = "rgba(200,180,255,.5)"; t.beginPath(); t.moveTo(w/2 + s*14, h*.46); t.lineTo(w/2 + s*w*.44, h*.33 + up); t.lineTo(w/2 + s*w*.3, h*.45); t.fill(); });
    t.beginPath(); t.ellipse(w/2, h*.5, 18, 20, 0, 0, 7); t.fillStyle = bsMetal(t, h*.25, h*.8, "#b197fc", "#6741d9", "#3b1f99"); t.fill(); O(t, 3.5);
    t.fillStyle = "#3b1f99"; t.beginPath(); t.moveTo(w/2 - 14, h*.3); t.lineTo(w/2 - 10, h*.06); t.lineTo(w/2 - 3, h*.28); t.moveTo(w/2 + 14, h*.3); t.lineTo(w/2 + 10, h*.06); t.lineTo(w/2 + 3, h*.28); t.fill();
    bsEye(t, w/2 - 7, h*.45, 5, "#ff6b6b"); bsEye(t, w/2 + 7, h*.45, 5, "#ff6b6b");
    t.fillStyle = "#fff"; t.beginPath(); t.moveTo(w/2 - 5, h*.62); t.lineTo(w/2 - 2, h*.72); t.lineTo(w/2 + 1, h*.62); t.moveTo(w/2 + 1, h*.62); t.lineTo(w/2 + 4, h*.72); t.lineTo(w/2 + 6, h*.62); t.fill();
  }
}
/* ---------- 왕로봇 5마리 (260 × 240) ---------- */
function bsBoss(t, id, f, w, h, rage){
  const O = BSA.ol, eye = rage ? "#ff2222" : "#ffd43b";
  if (id === "meadow"){   // 🦀 킹크랩 메카
    t.strokeStyle = BSA.OL; t.lineWidth = 9; for (let i = 0; i < 6; i++){ const s = i < 3 ? -1 : 1, x = w/2 + s*(30 + (i % 3)*24), up = (i + f) % 2 ? 10 : 0; t.beginPath(); t.moveTo(x, h*.62); t.lineTo(x + s*40, h*.8 - up); t.lineTo(x + s*30, h - 4 - up); t.stroke(); }
    t.strokeStyle = "#c92a2a"; t.lineWidth = 5; for (let i = 0; i < 6; i++){ const s = i < 3 ? -1 : 1, x = w/2 + s*(30 + (i % 3)*24), up = (i + f) % 2 ? 10 : 0; t.beginPath(); t.moveTo(x, h*.62); t.lineTo(x + s*40, h*.8 - up); t.stroke(); }
    [[-1], [1]].forEach(([s]) => { const cx = w/2 + s*w*.4, cy = h*.32 - (f ? 8 : 0); t.beginPath(); t.ellipse(cx, cy, 30, 26, s*.3, 0, 7); t.fillStyle = bsMetal(t, cy - 26, cy + 26, "#ff8787", "#e03131", "#8a1414"); t.fill(); O(t, 4);
      t.beginPath(); t.moveTo(cx, cy - 8); t.lineTo(cx + s*44, cy - 40); t.lineTo(cx + s*20, cy - 4); t.lineTo(cx + s*46, cy + 14); t.lineTo(cx + s*8, cy + 14); t.closePath(); t.fillStyle = "#ffc9c9"; t.fill(); O(t, 3); });
    t.beginPath(); t.ellipse(w/2, h*.5, w*.32, h*.22, 0, 0, 7); t.fillStyle = bsMetal(t, h*.28, h*.72, "#ff9b9b", "#e03131", "#7d1010"); t.fill(); O(t, 5);
    t.fillStyle = "#ffd43b"; t.beginPath(); t.moveTo(w*.38, h*.32); t.lineTo(w*.42, h*.2); t.lineTo(w*.47, h*.29); t.lineTo(w*.5, h*.16); t.lineTo(w*.53, h*.29); t.lineTo(w*.58, h*.2); t.lineTo(w*.62, h*.32); t.closePath(); t.fill(); O(t, 3);
    t.fillStyle = "rgba(255,255,255,.35)"; t.beginPath(); t.ellipse(w*.42, h*.4, 30, 10, -.2, 0, 7); t.fill();
    bsEye(t, w*.42, h*.48, 13, eye); bsEye(t, w*.58, h*.48, 13, eye);
    t.fillStyle = "#1b1233"; t.beginPath(); t.rect(w*.4, h*.6, w*.2, 10); t.fill(); t.fillStyle = "#fff"; for (let i = 0; i < 5; i++) t.fillRect(w*.41 + i*w*.04, h*.6, w*.025, 6);
  } else if (id === "desert"){   // 🦂 모래 전갈 전차
    t.beginPath(); t.roundRect ? t.roundRect(w*.08, h*.68, w*.84, h*.28, 22) : t.rect(w*.08, h*.68, w*.84, h*.28); t.fillStyle = "#3d2b1f"; t.fill(); O(t, 4);
    for (let i = 0; i < 7; i++){ const x = w*.14 + i*w*.12; t.fillStyle = "#a07850"; t.beginPath(); t.arc(x, h*.82, 13, 0, 7); t.fill(); O(t, 2.5); }
    t.strokeStyle = BSA.OL; t.lineWidth = 22; t.lineCap = "round"; t.beginPath(); t.moveTo(w*.75, h*.55); t.quadraticCurveTo(w*1.0, h*.3 + (f ? 6 : 0), w*.78, h*.08); t.stroke();
    t.strokeStyle = "#e8a33d"; t.lineWidth = 15; t.stroke();
    t.beginPath(); t.moveTo(w*.78, h*.1); t.lineTo(w*.66, h*.0); t.lineTo(w*.72, h*.16); t.closePath(); t.fillStyle = "#ff6b6b"; t.fill(); O(t, 3);
    t.beginPath(); t.roundRect ? t.roundRect(w*.12, h*.38, w*.7, h*.34, 26) : t.rect(w*.12, h*.38, w*.7, h*.34); t.fillStyle = bsMetal(t, h*.38, h*.72, "#ffd98a", "#e8a33d", "#8a5a1c"); t.fill(); O(t, 5);
    for (let i = 0; i < 4; i++){ t.strokeStyle = "rgba(90,50,10,.5)"; t.lineWidth = 3; t.beginPath(); t.moveTo(w*(.2 + i*.15), h*.4); t.lineTo(w*(.2 + i*.15), h*.7); t.stroke(); }
    [[w*.08, h*.36], [w*.08, h*.6]].forEach(([x, y], i) => { t.beginPath(); t.ellipse(x, y, 26, 16, i ? .3 : -.3, 0, 7); t.fillStyle = "#e8a33d"; t.fill(); O(t, 3.5); t.beginPath(); t.moveTo(x - 20, y); t.lineTo(x - 40, y - 12 + i*24 - (f ? 6 : 0)); t.lineTo(x - 18, y + (i ? 10 : -10)); t.closePath(); t.fillStyle = "#ffe0a0"; t.fill(); O(t, 2.5); });
    t.beginPath(); t.rect(w*.15, h*.24, w*.3, 14); t.fillStyle = "#495057"; t.fill(); O(t, 3);
    bsEye(t, w*.32, h*.48, 12, eye); bsEye(t, w*.5, h*.48, 12, eye);
  } else if (id === "snow"){   // 🧊 빙하 골렘
    const ice = (x, y, ww, hh) => { t.beginPath(); t.moveTo(x + ww*.15, y); t.lineTo(x + ww*.85, y); t.lineTo(x + ww, y + hh*.3); t.lineTo(x + ww*.9, y + hh); t.lineTo(x + ww*.1, y + hh); t.lineTo(x, y + hh*.3); t.closePath(); t.fillStyle = BSA.lg(t, x, y, x + ww, y + hh, [[0, "#e7f5ff"], [.5, "#74c0fc"], [1, "#1c7ed6"]]); t.fill(); O(t, 4, "#0b2a5c"); t.fillStyle = "rgba(255,255,255,.55)"; t.beginPath(); t.moveTo(x + ww*.2, y + 4); t.lineTo(x + ww*.45, y + 4); t.lineTo(x + ww*.25, y + hh*.5); t.closePath(); t.fill(); };
    ice(w*.24, h*.72, w*.2, h*.27 - (f ? 4 : 0)); ice(w*.56, h*.72, w*.2, h*.27 - (f ? 0 : 4));
    ice(w*.02, h*.3 - (f ? 8 : 0), w*.22, h*.4); ice(w*.76, h*.3 - (f ? 0 : 8), w*.22, h*.4);
    ice(w*.2, h*.22, w*.6, h*.55); ice(w*.32, h*.02, w*.36, h*.3);
    bsEye(t, w*.43, h*.16, 10, rage ? eye : "#3bc9db"); bsEye(t, w*.57, h*.16, 10, rage ? eye : "#3bc9db");
    t.fillStyle = "#0b2a5c"; t.beginPath(); t.rect(w*.4, h*.24, w*.2, 6); t.fill();
    t.save(); t.globalCompositeOperation = "lighter"; BSA.glow(t, w/2, h*.48, 40, "rgba(120,220,255,A)", .9); t.restore(); t.fillStyle = "#e3fafc"; t.beginPath(); t.arc(w/2, h*.48, 12, 0, 7); t.fill();
  } else if (id === "lava"){   // 🐉 용암 드래곤 (머리 + 날개)
    [[-1], [1]].forEach(([s]) => { t.beginPath(); t.moveTo(w/2 + s*30, h*.4); t.lineTo(w/2 + s*w*.5, h*.08 + (f ? 14 : 0)); t.lineTo(w/2 + s*w*.42, h*.36); t.lineTo(w/2 + s*w*.48, h*.5 + (f ? 8 : 0)); t.lineTo(w/2 + s*w*.3, h*.5); t.lineTo(w/2 + s*w*.34, h*.66); t.closePath(); t.fillStyle = "#5c1414"; t.fill(); O(t, 4, "#0a0203"); t.fillStyle = "rgba(255,120,40,.35)"; t.beginPath(); t.moveTo(w/2 + s*34, h*.42); t.lineTo(w/2 + s*w*.46, h*.14 + (f ? 14 : 0)); t.lineTo(w/2 + s*w*.3, h*.48); t.fill(); });
    t.beginPath(); t.ellipse(w/2, h*.66, w*.24, h*.3, 0, 0, 7); t.fillStyle = bsMetal(t, h*.4, h*.96, "#d9480f", "#8a1c0b", "#3a0a05"); t.fill(); O(t, 5, "#0a0203");
    t.fillStyle = "#ffa94d"; for (let i = 0; i < 4; i++){ t.beginPath(); t.ellipse(w/2, h*(.56 + i*.1), w*.1 - i*4, 7, 0, 0, 7); t.fill(); }
    t.beginPath(); t.moveTo(w*.3, h*.38); t.quadraticCurveTo(w*.5, h*.02, w*.7, h*.38); t.quadraticCurveTo(w*.62, h*.5, w*.5, h*.52); t.quadraticCurveTo(w*.38, h*.5, w*.3, h*.38); t.fillStyle = bsMetal(t, h*.05, h*.5, "#ff6b3d", "#c92a2a", "#5c0f0f"); t.fill(); O(t, 5, "#0a0203");
    t.fillStyle = "#2b0a0a"; [[-1], [1]].forEach(([s]) => { t.beginPath(); t.moveTo(w/2 + s*24, h*.18); t.lineTo(w/2 + s*44, h*.0); t.lineTo(w/2 + s*36, h*.22); t.fill(); });
    bsEye(t, w*.42, h*.3, 10, rage ? "#fff" : "#ffd43b"); bsEye(t, w*.58, h*.3, 10, rage ? "#fff" : "#ffd43b");
    t.fillStyle = "#fff"; for (let i = 0; i < 6; i++){ t.beginPath(); t.moveTo(w*.4 + i*w*.035, h*.44); t.lineTo(w*.415 + i*w*.035, h*.5); t.lineTo(w*.43 + i*w*.035, h*.44); t.fill(); }
  } else {   // 🛸 우주 마더쉽
    t.beginPath(); t.ellipse(w/2, h*.55, w*.48, h*.2, 0, 0, 7); t.fillStyle = bsMetal(t, h*.35, h*.75, "#c5cff5", "#5c6ab8", "#252c63"); t.fill(); O(t, 5);
    t.beginPath(); t.ellipse(w/2, h*.6, w*.38, h*.08, 0, 0, 7); t.fillStyle = "#1b1f45"; t.fill();
    for (let i = 0; i < 9; i++){ const a = Math.PI*(.1 + i*.1), x = w/2 + Math.cos(a)*w*.4, y = h*.6 + Math.sin(a)*h*.06; t.fillStyle = (i + f) % 3 ? "#9ff3ff" : "#ff8787"; t.beginPath(); t.arc(x, y, 6, 0, 7); t.fill(); }
    t.beginPath(); t.arc(w/2, h*.48, w*.22, Math.PI, 0); t.closePath(); t.fillStyle = "rgba(160,240,255,.55)"; t.fill(); O(t, 4);
    t.fillStyle = "rgba(255,255,255,.6)"; t.beginPath(); t.ellipse(w*.42, h*.36, 14, 6, -.5, 0, 7); t.fill();
    t.beginPath(); t.arc(w/2, h*.44, 30, 0, 7); t.fillStyle = bsMetal(t, h*.32, h*.56, "#b197fc", "#7048e8", "#3b1f99"); t.fill(); O(t, 3); bsEye(t, w/2, h*.43, 14, rage ? eye : "#69db7c");
    t.beginPath(); t.moveTo(w*.3, h*.7); t.lineTo(w*.24, h*.9); t.lineTo(w*.36, h*.72); t.moveTo(w*.7, h*.7); t.lineTo(w*.76, h*.9); t.lineTo(w*.64, h*.72); t.fillStyle = "#5c6ab8"; t.fill();
    t.save(); t.globalCompositeOperation = "lighter"; t.fillStyle = BSA.lg(t, 0, h*.66, 0, h, [[0, "rgba(120,240,255,.5)"], [1, "rgba(120,240,255,0)"]]); t.beginPath(); t.moveTo(w*.4, h*.66); t.lineTo(w*.6, h*.66); t.lineTo(w*.7, h); t.lineTo(w*.3, h); t.closePath(); t.fill(); t.restore();
  }
}
/* ---------- 주인공 (색 4가지) ---------- */
const BS_PC = [["#ff922b", "#d9480f", "#ffd8a8"], ["#4dabf7", "#1864ab", "#d0ebff"], ["#51cf66", "#2b8a3e", "#d3f9d8"], ["#f783ac", "#c2255c", "#ffdeeb"]];
function bsHero(t, ci, f, up, w, h){
  const [c1, c2, c3] = BS_PC[ci], O = BSA.ol, lg = [[0, 0], [9, -7], [0, 0], [-9, 7]][f];
  // 뒤 거품 탱크
  t.beginPath(); t.roundRect ? t.roundRect(14, 34, 18, 34, 8) : t.rect(14, 34, 18, 34); t.fillStyle = "#74c0fc"; t.fill(); O(t, 3); t.fillStyle = "rgba(255,255,255,.7)"; t.beginPath(); t.arc(21, 44, 3, 0, 7); t.arc(24, 54, 2, 0, 7); t.fill();
  // 다리
  [[30 + lg[0]*.5, lg[1]], [46 - lg[0]*.5, -lg[1]]].forEach(([x, dy]) => { t.beginPath(); t.roundRect ? t.roundRect(x, 64, 12, 20 + Math.min(0, dy)*.3, 5) : t.rect(x, 64, 12, 20); t.fillStyle = "#364fc7"; t.fill(); O(t, 2.5);
    t.beginPath(); t.roundRect ? t.roundRect(x - 3, 80, 18, 9, 4) : t.rect(x - 3, 80, 18, 9); t.fillStyle = "#212529"; t.fill(); });
  // 몸통 (갑옷)
  t.beginPath(); t.roundRect ? t.roundRect(26, 38, 36, 30, 11) : t.rect(26, 38, 36, 30); t.fillStyle = bsMetal(t, 38, 68, c3, c1, c2); t.fill(); O(t, 3);
  t.fillStyle = "#ffd43b"; t.fillRect(27, 58, 34, 5); t.fillStyle = "#fff"; t.beginPath(); t.arc(44, 48, 4, 0, 7); t.fill();
  // 거품총
  if (up){ t.beginPath(); t.roundRect ? t.roundRect(48, 4, 16, 40, 6) : t.rect(48, 4, 16, 40); t.fillStyle = bsMetal(t, 4, 44, "#e9ecef", "#adb5bd", "#495057"); t.fill(); O(t, 3); t.fillStyle = "#4dabf7"; t.beginPath(); t.arc(56, 5, 8, 0, 7); t.fill(); O(t, 2); }
  else { t.beginPath(); t.roundRect ? t.roundRect(46, 44, 40, 15, 6) : t.rect(46, 44, 40, 15); t.fillStyle = bsMetal(t, 44, 59, "#e9ecef", "#adb5bd", "#495057"); t.fill(); O(t, 3); t.fillStyle = "#4dabf7"; t.beginPath(); t.arc(86, 51.5, 8, 0, 7); t.fill(); O(t, 2);
    t.beginPath(); t.roundRect ? t.roundRect(54, 36, 16, 9, 4) : t.rect(54, 36, 16, 9); t.fillStyle = c1; t.fill(); O(t, 2); }
}
/* 반짝이 · 거품 · 총알 그림 */
function bsBubble(t, r, tint){
  const m = r + 3; t.fillStyle = BSA.rg(t, m - r*.35, m - r*.4, 1, r, [[0, "rgba(255,255,255,.95)"], [.5, tint ? tint + "55" : "rgba(165,216,255,.4)"], [1, tint || "rgba(60,160,245,.9)"]], m, m);
  t.beginPath(); t.arc(m, m, r, 0, 7); t.fill(); t.strokeStyle = "rgba(255,255,255,.95)"; t.lineWidth = Math.max(1.5, r*.09); t.stroke();
  t.fillStyle = "#fff"; t.beginPath(); t.ellipse(m - r*.42, m - r*.42, r*.15, r*.27, -.75, 0, 7); t.fill(); t.beginPath(); t.arc(m + r*.45, m + r*.4, r*.07, 0, 7); t.fill();
}

NG.defs.bs = () => {
  const O = NG.opt || {}, SIDS = NG.sids.slice(0, 4), N = SIDS.length;
  const party = O.party || null, myIdx = party === "guest" ? O.idx : 0;
  const local = party === "guest" ? [O.idx] : (O.local || [0]).slice(0, 2);
  const remote = i => party === "host" && O.remote && O.remote[i] != null;
  const GT = 110;
  let W = 1280, H = 720, VH = 720, land = true, CT = [], GY = VH - GT;
  let P, cam, camT, camMax, stage, stEnd, stLen, score, shots, ebul, ens, plats, items, crates, fx, trapped, genX, boss, clearT, flash, shake, msg, startT, overT, kills, eid, NQ, sendF, bcLocal, ended, lastS, keyS, ptr, snd;
  const th = () => BS_TH[(stage - 1) % BS_TH.length], D = () => stage - 1, loopN = () => Math.floor((stage - 1)/BS_TH.length);
  const coop = () => 1 + .4*(N - 1);
  const sp = (k, w, h, fn) => G2.spr("bs" + k, w, h, fn);
  const hitR = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const alive = () => P.filter(p => !p.dead);
  const pBox = p => ({x: p.x + 8, y: p.y + 8, w: p.w - 16, h: p.h - 10});
  const isLocal = i => local.includes(i);
  const rnd = Math.random;

  /* ---------- 소리 (방장은 친구 기기로도 보내요) ---------- */
  function playS(k){
    if (k === "shot") tone(900 + rnd()*250, 1500, .05, "sine", .035);
    else if (k === "trap") { tone(600, 1400, .18, "sine", .09); tone(1200, 1800, .1, "triangle", .05, .06); }
    else if (k === "pop") tone(1400, 400, .14, "square", .06);
    else if (k === "hurt") SFX.bad();
    else if (k === "item") SFX.item();
    else if (k === "coin") tone(1320, 1760, .07, "square", .045);
    else if (k === "bomb"){ tone(180, 900, .45, "sine", .14); tone(1200, 200, .5, "triangle", .08, .1); }
    else if (k === "boom") { tone(140, 50, .3, "sawtooth", .08); tone(600, 120, .2, "square", .05); }
    else if (k === "warn") [0, .35, .7].forEach(d => tone(440, 330, .25, "square", .07, d));
    else if (k === "laser") tone(1800, 200, .5, "sawtooth", .05);
    else if (k === "clear") SFX.rec();
    else if (k === "fire") tone(250, 160, .09, "square", .045);
    else if (k === "shield") tone(800, 300, .2, "square", .07);
    else if (k === "revive") [660, 880, 1100, 1320].forEach((f, i) => tone(f, f, .09, "triangle", .1, i*.06));
    else if (k === "jump") tone(380, 820, .1, "sine", .07);
    else if (k === "crate") tone(300, 120, .14, "square", .07);
  }
  const sfx = k => { playS(k); if (party === "host") NQ.push(["s", k]); };

  /* ---------- 화면 배치 (가로·세로, 1명·2명) ---------- */
  /* 📱 가로 화면이 길쭉하면(핸드폰) 양옆 남는 자리에 조작 버튼을 두어 놀이 화면을 가리지 않아요 */
  let PX = 0, PAN = false;
  function layout(sw, sh){
    const asp = sw/Math.max(1, sh), two = local.length >= 2, a = local[0], b = local[1];
    land = asp >= 1.15;
    if (land){ W = 1280; VH = 720; H = 720;
      PX = Math.round(Math.max(0, Math.min(420, (VH*asp - W)/2)));
      PAN = PX >= 150;
      if (PAN && !two){
        const r = Math.round(Math.min(124, PX*.46)), rb = Math.round(Math.min(96, PX*.38)), rj = Math.round(rb*.92), bx = W + PX/2;
        CT = [{t: "stick", pl: a, x: -PX/2, y: VH - r - 46, r, free: 1},
              {t: "shoot", pl: a, x: bx, y: VH - rb - 40, r: rb},
              {t: "jump", pl: a, x: bx, y: VH - rb*2 - rj - 76, r: rj},
              {t: "bomb", pl: a, x: -PX/2, y: Math.max(120, VH - r*2 - 150), r: Math.round(Math.min(54, PX*.2))}];
      } else if (PAN){
        const r = Math.round(Math.min(96, PX*.4)), rb = Math.round(Math.min(64, PX*.27)), L = -PX/2, Rr = W + PX/2;
        CT = [{t: "stick", pl: a, x: L, y: VH - r - 40, r, free: 1}, {t: "shoot", pl: a, x: L - rb*.45, y: VH - r*2 - rb - 70, r: rb}, {t: "jump", pl: a, x: L + rb*.55, y: VH - r*2 - rb*3 - 80, r: Math.round(rb*.9)}, {t: "bomb", pl: a, x: L, y: 70, r: 36},
              {t: "stick", pl: b, x: Rr, y: VH - r - 40, r, free: 1}, {t: "shoot", pl: b, x: Rr + rb*.45, y: VH - r*2 - rb - 70, r: rb}, {t: "jump", pl: b, x: Rr - rb*.55, y: VH - r*2 - rb*3 - 80, r: Math.round(rb*.9)}, {t: "bomb", pl: b, x: Rr, y: 70, r: 36}];
      } else {
        const o = PX*.6;   // 태블릿: 화면 가장자리 쪽으로 붙이고, 손대지 않을 땐 흐리게
        CT = two ? [{t: "stick", pl: a, x: 120 - o, y: VH - 130, r: 86, free: 1}, {t: "shoot", pl: a, x: 272 - o, y: VH - 78, r: 60}, {t: "jump", pl: a, x: 262 - o, y: VH - 205, r: 54}, {t: "bomb", pl: a, x: 56 - o, y: VH - 280, r: 40},
                    {t: "stick", pl: b, x: W - 120 + o, y: VH - 130, r: 86, free: 1}, {t: "shoot", pl: b, x: W - 272 + o, y: VH - 78, r: 60}, {t: "jump", pl: b, x: W - 262 + o, y: VH - 205, r: 54}, {t: "bomb", pl: b, x: W - 56 + o, y: VH - 280, r: 40}]
                  : [{t: "stick", pl: a, x: 150 - o, y: VH - 140, r: 100, free: 1}, {t: "shoot", pl: a, x: W - 270 + o, y: VH - 105, r: 78}, {t: "jump", pl: a, x: W - 105 + o, y: VH - 150, r: 72}, {t: "bomb", pl: a, x: W - 95 + o, y: VH - 310, r: 50}];
      }
    } else { W = 760; PX = 0; PAN = false;
      H = Math.round(Math.max(1140, Math.min(1700, W*sh/Math.max(1, sw))));   // 📱 세로로 긴 화면: 놀이 화면을 위로 더 크게, 조작판은 손가락이 편한 아래쪽에
      VH = H - 380;
      const B = H - 380;
      CT = two ? [{t: "stick", pl: a, x: 110, y: B + 200, r: 88, free: 1}, {t: "shoot", pl: a, x: 280, y: B + 275, r: 60}, {t: "jump", pl: a, x: 280, y: B + 130, r: 56}, {t: "bomb", pl: a, x: 110, y: B + 58, r: 38},
                  {t: "stick", pl: b, x: W - 110, y: B + 200, r: 88, free: 1}, {t: "shoot", pl: b, x: W - 280, y: B + 275, r: 60}, {t: "jump", pl: b, x: W - 280, y: B + 130, r: 56}, {t: "bomb", pl: b, x: W - 110, y: B + 58, r: 38}]
                : [{t: "stick", pl: a, x: 180, y: B + 200, r: 120, free: 1}, {t: "shoot", pl: a, x: W - 270, y: B + 250, r: 88}, {t: "jump", pl: a, x: W - 110, y: B + 155, r: 80}, {t: "bomb", pl: a, x: W - 105, y: B + 310, r: 52}];
    }
    const old = GY; GY = VH - GT;
    if (P && old !== GY){ const d = GY - old, mv = o => o.y += d; P.forEach(mv); [ens, items, crates, plats, trapped, shots, ebul, fx].forEach(L => L.forEach(mv)); if (boss){ boss.y += d; boss.ty += d; } }
    if (stage) backdrop();
  }

  /* ---------- 배경: 하늘 한 장(CSS) + 언덕·땅 (1:1 붙이기) ---------- */
  function bgMake(T, cb){
    const key = `${T.id}|${W}|${VH}`, hit = BSBG.cache.get(key); if (hit){ cb && cb(hit, key); return key; }
    if (BSBG.busy[key]){ BSBG.busy[key].push(cb); return key; } BSBG.busy[key] = [cb];
    const k = Math.min(1.5, Math.max(.75, NG.k || 1)), c = document.createElement("canvas"); c.width = Math.round(W*k); c.height = Math.round(VH*k);
    const t = c.getContext("2d"); t.scale(k, k); bsBackdrop(t, T, W, VH);
    c.toBlob(b => { const cbs = BSBG.busy[key] || []; delete BSBG.busy[key]; if (!b) return; const url = URL.createObjectURL(b); BSBG.cache.set(key, url);
      while (BSBG.cache.size > 5){ const [k0, u0] = BSBG.cache.entries().next().value; BSBG.cache.delete(k0); URL.revokeObjectURL(u0); } cbs.forEach(f => f && f(url, key)); }, "image/png");
    return key;
  }
  function backdrop(){
    const T = th(), cv = $("#ngCanvas"); cv.style.backgroundColor = T.base;
    BSBG.want = `${T.id}|${W}|${VH}`; if (!BSBG.cache.has(BSBG.want)) cv.style.backgroundImage = "";
    bgMake(T, (url, key) => { if (NG.cur !== self || BSBG.want !== key) return; cv.style.backgroundImage = `url(${url})`; cv.style.backgroundSize = `${W/(W + 2*PX)*100}% ${VH/H*100}%`; cv.style.backgroundRepeat = "no-repeat"; cv.style.backgroundPosition = "50% 0"; });
  }
  /* ⚡ 다음 맵 그림은 왕로봇을 쓰러뜨리는 동안 미리 그려 둬요 (맵이 바뀔 때 멈칫하지 않게) */
  function prewarmNext(){ const nx = BS_TH[stage % BS_TH.length], cur = stage;
    const job = [() => bgMake(nx), () => { stage = cur + 1; midSpr(); stage = cur; }, () => { stage = cur + 1; nearSpr(); grSpr(); stage = cur; }, () => { stage = cur + 1; bossSpr(0, 0); stage = cur; }, () => { stage = cur + 1; bossSpr(1, 0); stage = cur; }, () => { stage = cur + 1; bossSpr(0, 1); bossSpr(1, 1); stage = cur; }];
    const run = () => { if (NG.cur !== self || stage !== cur || !job.length) return; job.shift()(); (window.requestIdleCallback || setTimeout)(run, {timeout: 600}); }; run(); }
  const midSpr = () => sp("mid" + th().id, 1024, 280, (t, w, h) => bsMid(t, th(), w, h));
  const nearSpr = () => sp("near" + th().id, 900, 150, (t, w, h) => bsNear(t, th(), w, h));
  const grSpr = () => sp("gr" + th().id, 128, GT, (t, w, h) => bsGround(t, th(), w, h));
  function strip(g, c, w, off, y, sx){
    const k = NG.k || 1, cw = Math.max(1, Math.floor(w*k)), ch = c.height, dy = Math.round(y*k), ox = Math.round(PX*k);
    g.setTransform(1, 0, 0, 1, ox, 0);
    for (let x = -Math.round(((off*k) % cw + cw) % cw) + Math.round(sx*k); x < W*k; x += cw) g.drawImage(c, 0, 0, cw, ch, x, dy, cw, ch);
    g.setTransform(k, 0, 0, k, ox, 0);
  }
  const platSpr = w => sp(`pl${th().id}${w}`, w + 8, 40, (t) => { const [c1, c2, c3] = th().plat;
    t.fillStyle = "rgba(0,0,0,.25)"; t.beginPath(); t.roundRect ? t.roundRect(8, 14, w - 4, 24, 10) : t.rect(8, 14, w - 4, 24); t.fill();
    t.beginPath(); t.roundRect ? t.roundRect(3, 6, w, 26, 10) : t.rect(3, 6, w, 26); t.fillStyle = BSA.lg(t, 0, 6, 0, 32, [[0, c1], [1, c2]]); t.fill(); BSA.ol(t, 3);
    t.beginPath(); t.roundRect ? t.roundRect(3, 3, w, 12, 7) : t.rect(3, 3, w, 12); t.fillStyle = c3; t.fill(); BSA.ol(t, 3);
    t.fillStyle = "rgba(255,255,255,.45)"; t.fillRect(12, 6, w - 24, 3); t.fillStyle = "rgba(0,0,0,.2)"; for (let x = 24; x < w - 10; x += 34) t.fillRect(x, 18, 3, 12); });
  const enSpr = (k, f) => { const d = BS_EN[k]; return sp(`en${k}${f}`, d.w, d.h, (t, w, h) => bsRobot(t, k, f, w, h)); };
  const auraSpr = () => sp("aura", 160, 160, t => { t.fillStyle = BSA.rg(t, 80, 80, 10, 80, [[0, "rgba(255,215,80,.75)"], [.55, "rgba(255,190,40,.3)"], [1, "rgba(255,190,40,0)"]]); t.fillRect(0, 0, 160, 160); });
  const bossSpr = (f, rage) => sp(`boss${th().id}${f}${rage ? 1 : 0}`, 260, 240, (t, w, h) => bsBoss(t, th().id, f, w, h, rage));
  const heroSpr = (ci, f, up) => sp(`hero${ci}${f}${up}`, 96, 92, (t, w, h) => bsHero(t, ci, f, up, w, h));
  const bubSpr = (r, tint) => sp(`bub${r}${tint || ""}`, r*2 + 6, r*2 + 6, t => bsBubble(t, r, tint));
  const glowSpr = (col) => sp("gl" + col, 64, 64, t => { t.fillStyle = BSA.rg(t, 32, 32, 2, 32, [[0, "rgba(255,255,255,1)"], [.3, col], [1, "rgba(0,0,0,0)"]]); t.fillRect(0, 0, 64, 64); });
  const orbSpr = () => sp("orb", 30, 30, t => { t.fillStyle = BSA.rg(t, 15, 15, 1, 15, [[0, "rgba(255,255,220,1)"], [.35, "rgba(255,170,60,1)"], [.7, "rgba(255,80,30,.8)"], [1, "rgba(255,60,20,0)"]]); t.fillRect(0, 0, 30, 30); });
  const rollSpr = () => sp("roll" + th().id, 52, 52, t => { const c = th().roll; t.beginPath(); t.arc(26, 26, 22, 0, 7); t.fillStyle = BSA.rg(t, 18, 18, 2, 24, [[0, "#fff"], [.4, c], [1, th().id === "lava" ? "#8a1c0b" : "#555"]]); t.fill(); BSA.ol(t, 3);
    t.strokeStyle = "rgba(0,0,0,.3)"; t.lineWidth = 3; t.beginPath(); t.moveTo(10, 26); t.lineTo(42, 26); t.moveTo(26, 8); t.lineTo(26, 44); t.stroke(); });
  const shellSpr = () => sp("shell", 30, 30, t => { t.beginPath(); t.arc(15, 15, 10, 0, 7); t.fillStyle = BSA.rg(t, 11, 11, 1, 11, [[0, "#ffe066"], [1, "#495057"]]); t.fill(); BSA.ol(t, 2.5); t.fillStyle = "#ff6b6b"; t.fillRect(13, 2, 4, 6); });
  const ICON = {s: "🔱", r: "⚡", p: "💥", h: "❤️", d: "🛡️", b: "💣", c: "🪙"};
  const itemSpr = k => sp("it" + k, 56, 56, t => { if (k !== "c"){ t.fillStyle = BSA.rg(t, 22, 20, 2, 26, [[0, "#fff"], [1, {s: "#da77f2", r: "#ffd43b", p: "#ff6b6b", h: "#ff8787", d: "#74c0fc", b: "#9775fa"}[k]]], 28, 28);
      t.beginPath(); t.arc(28, 28, 24, 0, 7); t.fill(); t.strokeStyle = "#fff"; t.lineWidth = 3.5; t.stroke(); } G2.emo(t, ICON[k], 28, 30, k === "c" ? 36 : 28); });
  const crateSpr = () => sp("crate" + th().id, 58, 58, t => { t.beginPath(); t.roundRect ? t.roundRect(2, 2, 54, 54, 8) : t.rect(2, 2, 54, 54); t.fillStyle = BSA.lg(t, 0, 0, 0, 58, [[0, "#d9a066"], [1, "#9c6a3a"]]); t.fill(); BSA.ol(t, 3);
    t.strokeStyle = "#7f5539"; t.lineWidth = 5; t.strokeRect(9, 9, 40, 40); t.beginPath(); t.moveTo(9, 9); t.lineTo(49, 49); t.stroke(); t.fillStyle = "#ffd43b"; t.beginPath(); t.arc(29, 29, 11, 0, 7); t.fill(); BSA.ol(t, 2); outlinedRaw(t, "?", 29, 30, 16, "#fff"); });
  const ctrlSpr = (k, r, on, col) => sp(`ct${k}${r}${on ? 1 : 0}${col}`, r*2 + 12, r*2 + 12, t => { const m = r + 6;
    if (k === "stick"){ t.fillStyle = "rgba(20,15,46,.4)"; t.beginPath(); t.arc(m, m, r, 0, 7); t.fill(); t.strokeStyle = col; t.lineWidth = 4; t.stroke();
      t.fillStyle = "rgba(255,255,255,.8)"; [[-1, 0], [1, 0], [0, -1]].forEach(([dx, dy]) => { t.save(); t.translate(m + dx*r*.7, m + dy*r*.7); t.rotate(Math.atan2(dy, dx)); t.beginPath(); t.moveTo(r*.14, 0); t.lineTo(-r*.08, -r*.13); t.lineTo(-r*.08, r*.13); t.closePath(); t.fill(); t.restore(); }); return; }
    const c = {shoot: ["#74c0fc", "#1864ab"], jump: ["#8ce99a", "#2b8a3e"], bomb: ["#d0bfff", "#5f3dc4"]}[k];
    t.fillStyle = "rgba(0,0,0,.35)"; t.beginPath(); t.arc(m, m + 5, r, 0, 7); t.fill();
    t.globalAlpha = on ? 1 : .85; t.fillStyle = BSA.lg(t, 0, m - r, 0, m + r, [[0, c[0]], [1, c[1]]]); t.beginPath(); t.arc(m, m + (on ? 4 : 0), r, 0, 7); t.fill();
    t.globalAlpha = 1; t.strokeStyle = col; t.lineWidth = 4; t.stroke();
    G2.emo(t, {shoot: "🫧", jump: "⤴️", bomb: "💣"}[k], m, m - r*.12 + (on ? 4 : 0), r*.72); outlinedRaw(t, {shoot: "쏘기", jump: "점프", bomb: "폭탄"}[k], m, m + r*.55 + (on ? 4 : 0), Math.round(r*.3), "#fff"); });
  const knobSpr = col => sp("knob" + col, 80, 80, t => { t.fillStyle = "rgba(255,255,255,.9)"; t.beginPath(); t.arc(40, 40, 34, 0, 7); t.fill(); t.fillStyle = col; t.beginPath(); t.arc(40, 40, 22, 0, 7); t.fill(); });
  const warnSpr = () => sp("warn" + W, W, 44, t => { t.fillStyle = "rgba(200,20,20,.85)"; t.fillRect(0, 0, W, 44); t.fillStyle = "#ffd43b"; for (let x = -44; x < W; x += 44){ t.beginPath(); t.moveTo(x, 0); t.lineTo(x + 22, 0); t.lineTo(x + 44, 44); t.lineTo(x + 22, 44); t.fill(); }
    t.fillStyle = "rgba(20,0,0,.75)"; t.fillRect(0, 8, W, 28); });
  const beamSpr = () => sp("beam", 64, 60, t => { t.fillStyle = BSA.lg(t, 0, 0, 0, 60, [[0, "rgba(255,60,60,0)"], [.25, "rgba(255,60,60,.8)"], [.42, "rgba(255,230,230,1)"], [.58, "rgba(255,230,230,1)"], [.75, "rgba(255,60,60,.8)"], [1, "rgba(255,60,60,0)"]]); t.fillRect(0, 0, 64, 60); });
  /* 글자 + 그림 섞인 줄은 한 장으로 기억 (테두리 글씨에 그림 글자를 섞으면 숫자가 깨지는 기기가 있어요) */
  function icoTxt(list, fs){ const key = list.map(a => a.join("")).join("|"); const cw = list.map(([e, v]) => (e ? fs*1.15 : 0) + (v !== "" && v != null ? String(v).length*fs*.62 + 4 : 0) + 6), w = cw.reduce((a, b) => a + b, 0) + 4, h = fs + 10;
    return sp(`ico${fs}${key}`, w, h, t => { let x = 2; list.forEach(([e, v], i) => { if (e){ G2.emo(t, e, x + fs*.55, h/2, fs*.95); x += fs*1.15; } if (v !== "" && v != null){ outlinedRaw(t, String(v), x + 2, h/2 + 1, fs, "#fff", undefined, "left"); } x = 2 + cw.slice(0, i + 1).reduce((a, b) => a + b, 0); }); }); }

  /* ---------- 판 만들기 ---------- */
  function mkP(i){ return {i, sid: SIDS[i], x: 180 + i*70, y: GY - 80, w: 44, h: 80, vx: 0, vy: 0, dir: 1, ground: true, coy: 0, jumps: 0, run: 0, aimUp: false, jb: 0, hearts: 3, inv: 90, dead: false, gone: false, deadT: 0, gx: 0, gy: 0,
    wpn: "", wpnT: 0, shield: 0, bombs: 2, cd: 0, bcSeen: 0, in: {l: 0, r: 0, u: 0, s: 0, jh: 0}, tx: null, ty: null}; }
  function newStage(){
    stLen = 5000 + 350*Math.min(D(), 8); stEnd = (stEnd || 0) + stLen; camMax = -1; boss = null;
    backdrop(); msg = {t: `STAGE ${stage}`, s: th().n + (loopN() ? ` · ${loopN() + 1}회차!` : ""), k: 160};
    P.forEach(p => { if (p.gone) return; if (p.dead){ revive(p, cam + 200 + p.i*60, GY - 300); } else p.hearts = Math.min(5, p.hearts + (stage > 1 ? 1 : 0)); });
  }
  function gen(upto){
    while (genX < upto){
      const x0 = genX, cw = 520, st0 = stEnd - stLen, prog = (x0 - st0)/stLen, d = D() + prog*.6;
      genX += cw;
      if (x0 < st0 + (stage === 1 ? 900 : 600) || x0 > stEnd - 950) continue;
      if (rnd() < .55){ const w = [160, 220, 280][Math.floor(rnd()*3)], px = x0 + 60 + rnd()*(cw - w - 60), py = GY - 140 - rnd()*120; plats.push({x: px, y: py, w, h: 24});
        if (rnd() < .5) for (let i = 0; i < 4; i++) items.push({id: ++eid, k: "c", x: px + w/2 - 70 + i*36, y: py - 60, w: 36, h: 36, vy: 0, fix: 1}); }
      if (rnd() < .3) crates.push({x: x0 + 80 + rnd()*360, y: GY - 58, w: 58, h: 58, hp: 2});
      const n = Math.min(8, Math.round((1 + rnd()*(1.4 + d*.75))*coop()));
      const pool = [["walker", 4], ["drone", 3], ["jumper", 2.4], ["turret", 2]]; if (stage >= 2) pool.push(["tank", 1 + d*.3]); if (stage >= 3) pool.push(["bat", 1.6 + d*.25]);
      const tot = pool.reduce((a, b) => a + b[1], 0), eliteP = stage >= 3 ? Math.min(.38, .08 + .045*d) : stage === 2 ? .04 : 0;
      for (let i = 0; i < n; i++){
        let r = rnd()*tot, k = pool[0][0]; for (const [kk, wgt] of pool){ if ((r -= wgt) <= 0){ k = kk; break; } }
        const e = BS_EN[k], el = rnd() < eliteP, sc = el ? 1.22 : 1;
        const hp = Math.round((e.hp + Math.floor(d/2))*(el ? 2.2 : 1)*(1 + .25*(N - 1)));
        ens.push({id: ++eid, k, x: x0 + 120 + rnd()*(cw - 140), y: (k === "drone" || k === "bat") ? GY - 230 - rnd()*130 : GY - e.h*sc, w: e.w*sc, h: e.h*sc, hp, mhp: hp, t: Math.floor(rnd()*60), on: false, dir: -1, y0: 0, hit: 0, vx: 0, vy: 0, el, st: 0, cd: 60 + rnd()*60});
      }
      if (rnd() < .22) for (let i = 0; i < 5; i++) items.push({id: ++eid, k: "c", x: x0 + 100 + i*44, y: GY - 60 - Math.sin(i/4*Math.PI)*80, w: 36, h: 36, vy: 0, fix: 1});
    }
  }

  /* ---------- 주인공 움직이기 (방장·친구 기기 모두 같은 규칙) ---------- */
  function phys(p, inp){
    const L = inp.l, R = inp.r; p.aimUp = !!inp.u;
    const acc = p.ground ? 1 : .62, mx = 5.6;
    if (L && !R){ p.vx = Math.max(-mx, p.vx - acc); p.dir = -1; } else if (R && !L){ p.vx = Math.min(mx, p.vx + acc); p.dir = 1; } else { p.vx *= p.ground ? .68 : .93; if (Math.abs(p.vx) < .05) p.vx = 0; }
    if (p.jb > 0) p.jb--;
    if (p.jb && (p.ground || p.coy > 0)){ p.vy = -14.6; p.ground = false; p.coy = 0; p.jb = 0; p.jumps = 1; if (isLocal(p.i)) playS("jump"); }
    else if (p.jb && p.jumps === 1){ p.vy = -12.4; p.jumps = 2; p.jb = 0; puff(p.x + p.w/2, p.y + p.h, 8, "#ffffff", true); if (isLocal(p.i)) playS("jump"); }
    if (!inp.jh && p.vy < -5) p.vy += 1.15;
    p.vy = Math.min(17, p.vy + .66);
    const oy = p.y; p.x += p.vx; p.y += p.vy;
    clampX(p);
    const was = p.ground; p.ground = false;
    if (p.y + p.h >= GY){ p.y = GY - p.h; p.vy = 0; p.ground = true; }
    else if (p.vy >= 0) for (const q of plats){ if (p.x + p.w - 10 > q.x && p.x + 10 < q.x + q.w && oy + p.h <= q.y + 3 && p.y + p.h >= q.y){ p.y = q.y - p.h; p.vy = 0; p.ground = true; break; } }
    if (p.ground){ p.jumps = 0; p.coy = 7; if (!was) puff(p.x + p.w/2, p.y + p.h, 4, "rgba(255,255,255,.8)", true); } else if (p.coy > 0) p.coy--;
    if (Math.abs(p.vx) > .6 && p.ground) p.run += Math.abs(p.vx)*.085;
  }
  function clampX(p){
    const right = (camMax >= 0 ? camMax : cam) + W - p.w - 8;
    p.x = Math.max(cam + 8, Math.min(p.x, right));
    if (boss && !boss.dying && p.x + p.w > boss.x + 30){ p.x = boss.x + 30 - p.w; if (p.vx > 0) p.vx = -3; }
  }

  /* ---------- 쏘기 · 폭탄 ---------- */
  function fire(p){
    const up = p.aimUp, w = p.wpn, ox = up ? p.x + p.w/2 + p.dir*12 : p.x + p.w/2 + p.dir*44, oy = up ? p.y - 30 : p.y + 34;
    const base = up ? -Math.PI/2 : p.dir > 0 ? 0 : Math.PI, angs = w === "s" ? [-.22, 0, .22] : [0], spd = w === "p" ? 10.5 : 13.5;
    angs.forEach(a => { const an = base + a; shots.push({x: ox, y: oy, vx: Math.cos(an)*spd + (up ? 0 : p.vx*.3), vy: Math.sin(an)*spd, t: w === "p" ? 90 : 72, r: w === "p" ? 22 : w === "r" ? 11 : 13, dm: w === "p" ? 3 : 1, pc: w === "p" ? 4 : 1, o: p.i}); });
    p.cd = w === "r" ? 6 : w === "p" ? 17 : w === "s" ? 12 : 11;
    if (isLocal(p.i)) playS("shot");
  }
  function popBomb(p){
    if (p.bombs <= 0 || p.dead) return; p.bombs--; flash = 26; shake = 14; sfx("bomb");
    ring(p.x + p.w/2, p.y + p.h/2, 1);
    ens.forEach(e => { if (e.on && e.x < cam + W + 40) trapE(e); }); ens = ens.filter(e => !e.trapped);
    ebul = []; if (boss && !boss.dying && boss.enter <= 0) dmgBoss(14 + stage*2);
  }
  function trapE(e){
    e.trapped = true; const sc = BS_EN[e.k].sc*(e.el ? 3 : 1); trapped.push({k: e.k, x: e.x, y: e.y, w: e.w, h: e.h, t: 0, el: e.el}); score += sc; kills++; sfx("trap");
    txt(`+${sc}`, e.x + e.w/2, e.y, e.el ? "#ffd43b" : "#fff");
    if (e.el || rnd() < .26) items.push({id: ++eid, k: e.el ? ["s", "r", "p", "d", "b", "h"][Math.floor(rnd()*6)] : rnd() < .78 ? "c" : ["s", "r", "p", "h", "d", "b"][Math.floor(rnd()*6)], x: e.x + e.w/2 - 22, y: e.y, w: 44, h: 44, vy: -6});
  }
  function hurt(p){
    if (p.inv || p.dead) return;
    if (p.shield){ p.shield = 0; p.inv = 70; sfx("shield"); return; }
    p.hearts--; p.inv = 110; sfx("hurt"); if (isLocal(p.i)){ flash = 10; shake = 6; }
    if (isLocal(p.i) || !party){ p.vy = -7; p.vx = -p.dir*5; } else if (remote(p.i)) NQ.push(["kb", p.i, p.dir]);
    if (p.hearts <= 0) die(p);
  }
  function die(p){
    p.dead = true; p.deadT = 70; p.gx = p.x; p.gy = p.y; puff(p.x + p.w/2, p.y + p.h/2, 20, "#a5d8ff");
    if (!alive().length){ overT = 130; setMsg("GAME OVER", `STAGE ${stage} · ${score.toLocaleString()}점`, 999); }
    else txt("💫 친구가 거품을 터뜨려 구해 줘요!", p.x + p.w/2, p.y - 20, "#ffe066");
  }
  function revive(p, x, y){ p.dead = false; p.hearts = 2; p.inv = 140; p.x = x; p.y = y; p.vx = 0; p.vy = 0; puff(x + p.w/2, y + p.h/2, 16, "#ffe066"); sfx("revive"); }

  /* ---------- 효과 (방장은 친구 기기에도 보내요) ---------- */
  function puff(x, y, n, col, localOnly){ if (fx.length > 300) fx.splice(0, 80); for (let i = 0; i < n; i++){ const a = rnd()*6.28, v = 1.5 + rnd()*4; fx.push({x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v - 1, t: 24 + rnd()*16, c: col || "#a5d8ff", r: 3 + rnd()*5}); }
    if (party === "host" && !localOnly) NQ.push(["p", Math.round(x), Math.round(y), n, col]); }
  function ring(x, y, big){ fx.push({ring: 1, x, y, t: big ? 40 : 22, r0: big ? 30 : 10, big}); if (party === "host") NQ.push(["r", Math.round(x), Math.round(y), big ? 1 : 0]); }
  function txt(s, x, y, col){ fx.push({tx: s, x, y, t: 55, c: col || "#fff"}); if (party === "host") NQ.push(["t", s, Math.round(x), Math.round(y), col || "#fff"]); }
  function setMsg(t, s, k){ msg = {t, s, k}; if (party === "host") NQ.push(["m", t, s, k]); }
  function boomAt(x, y, big){ puff(x, y, big ? 22 : 10, big ? "#ffa94d" : "#ffd43b"); ring(x, y, big); }

  /* ---------- 왕로봇 ---------- */
  function spawnBoss(){
    camMax = stEnd - W; const hp = Math.round((70 + 32*stage + 25*loopN())*(1 + .65*(N - 1)));
    boss = {x: stEnd - (land ? 440 : 330), y: -260, ty: GY - 250, hp, max: hp, t: 0, hit: 0, ph: 0, phT: 0, rage: false, enter: 110, las: null, dying: 0, fly: th().id === "space" || th().id === "lava"};
    setMsg("⚠️ WARNING ⚠️", `${th().boss} 등장!`, 150); sfx("warn"); shake = 20;
  }
  function bossPats(){ const L = [0, 1, 2]; if (stage >= 2) L.push(3); if (stage >= 3) L.push(4); return L; }
  function nearest(x){ let best = null, bd = 1e9; P.forEach(p => { if (p.dead) return; const d = Math.abs(p.x - x); if (d < bd){ bd = d; best = p; } }); return best; }
  function bossStep(){
    const b = boss; b.t++; if (b.hit) b.hit--;
    if (b.dying){ b.dying--; if (b.dying % 6 === 0){ boomAt(b.x + 30 + rnd()*200, b.y + 30 + rnd()*180, rnd() < .3); sfx("boom"); shake = 10; }
      if (b.dying === 70) prewarmNext();
      if (!b.dying){ trapped.push({k: "boss", x: b.x, y: b.y, w: 260, h: 240, t: 0, big: 1}); boss = null; clearT = 220; sfx("clear");
        setMsg("🎉 STAGE CLEAR!", `+${(3000 + stage*1000).toLocaleString()}점`, 190);
        for (let i = 0; i < 10; i++) items.push({id: ++eid, k: "c", x: camMax + W*.4 + i*40, y: GY - 220 - rnd()*80, w: 36, h: 36, vy: -4 - rnd()*4});
        items.push({id: ++eid, k: "h", x: camMax + W*.55, y: GY - 260, w: 44, h: 44, vy: -5}); items.push({id: ++eid, k: "b", x: camMax + W*.6, y: GY - 260, w: 44, h: 44, vy: -5});
        P.forEach(p => { if (p.dead && !p.gone) revive(p, camMax + 200 + p.i*70, GY - 300); }); }
      return; }
    if (b.enter > 0){ b.enter--; b.y += (b.ty - b.y)*.06; if (b.enter === 1){ shake = 16; boomAt(b.x + 130, GY, true); } return; }
    const fl = b.fly ? Math.sin(b.t*.03)*60 - 40 : 0; b.y = b.ty + Math.sin(b.t*.045)*16 + fl; b.x = camMax + W - (land ? 440 : 330) + Math.sin(b.t*.016)*70;
    b.rage = b.hp < b.max*.4; const rf = b.rage ? .7 : 1, d = D();
    const pats = bossPats(), dur = b.rage ? 170 : 210;
    if (++b.phT > dur){ b.phT = 0; b.ph = (b.ph + 1) % pats.length; b.las = null; }
    const pat = pats[b.ph], tg = nearest(b.x), tx = tg ? tg.x + tg.w/2 : b.x - 300, ty = tg ? tg.y + tg.h/2 : GY - 40, mx = b.x + 50, my = b.y + 130;
    if (pat === 0 && b.phT % Math.round(Math.max(48, 100 - d*7)*rf) === 0){ const n = 3 + 2*Math.min(3, Math.floor(d/1.5)), a0 = Math.atan2(ty - my, tx - mx), v = 5 + d*.3;
      for (let i = 0; i < n; i++){ const a = a0 + (i - (n - 1)/2)*.2; ebul.push({x: mx, y: my, vx: Math.cos(a)*v, vy: Math.sin(a)*v, t: 260, ty: 0}); } sfx("fire"); }
    if (pat === 1 && b.phT % 120 === 30 && ens.length < 3 + N){ for (let i = 0; i < 2; i++){ const k = stage >= 3 && rnd() < .5 ? "bat" : "drone", e = BS_EN[k]; const hp = 1 + Math.floor(d/2);
      ens.push({id: ++eid, k, x: b.x + 40 + 80*i, y: b.y + 40, y0: GY - 250 - rnd()*150, w: e.w, h: e.h, hp, mhp: hp, vx: 0, vy: 0, t: 1, on: true, dir: -1, hit: 0, el: false, st: 0, cd: 40}); } }
    if (pat === 2 && b.phT % Math.round(Math.max(36, 70 - d*5)*rf) === 0){ ebul.push({x: b.x + 40, y: GY - 26, vx: -(5.6 + d*.4), vy: 0, t: 300, ty: 1}); sfx("fire"); }
    if (pat === 3 && b.phT % Math.round(95*rf) === 20){ const n = 12 + 2*Math.min(5, d), off = b.t*.1; for (let i = 0; i < n; i++){ const a = off + i/n*6.283; ebul.push({x: b.x + 130, y: b.y + 120, vx: Math.cos(a)*(4 + d*.25), vy: Math.sin(a)*(4 + d*.25), t: 260, ty: 0}); } sfx("fire"); }
    if (pat === 4){ if (!b.las && b.phT > 20 && b.phT < dur - 120){ const low = rnd() < .5; b.las = {y: low ? GY - 40 : GY - 175, t: 0}; sfx("warn"); }
      if (b.las){ b.las.t++; if (b.las.t === 70){ sfx("laser"); shake = 10; } if (b.las.t > 70 && b.las.t < 112){ P.forEach(p => { if (!p.dead && p.y < b.las.y + 26 && p.y + p.h > b.las.y - 26 && p.x < b.x) hurt(p); }); } if (b.las.t > 120) b.las = null; } }
    P.forEach(p => { if (!p.dead && hitR(pBox(p), {x: b.x + 40, y: b.y + 40, w: 180, h: 180})) hurt(p); });
  }
  function dmgBoss(n){ if (!boss || boss.dying) return; boss.hp -= n; boss.hit = 6; if (boss.hp <= 0){ boss.hp = 0; boss.dying = 100; score += 3000 + stage*1000; ebul = []; ens.forEach(e => { if (e.on) trapE(e); }); ens = ens.filter(e => !e.trapped); } }

  /* ---------- 방장(혼자 할 때 포함) 한 장면 ---------- */
  function sim(){
    startT++;
    // 사람들
    P.forEach(p => {
      if (p.gone) return;
      if (remote(p.i)){
        const r = PARTY.remoteIn(p.i); if (!r || !r.open){ p.in = {}; return; }
        const m = r.m; if (m.sd !== O.seed) return;
        if (!p.dead && m.x != null){ p.x = m.x; p.y = m.y; p.vx = m.vx; p.vy = m.vy; p.dir = m.dr; p.aimUp = !!m.u; p.ground = !!m.g; p.run = m.rn; }
        p.in = {s: m.s}; if ((m.bc || 0) > p.bcSeen){ p.bcSeen = m.bc; popBomb(p); }
      } else if (!p.dead) phys(p, p.in);
      if (p.dead){
        if (p.deadT > 0){ p.deadT--; p.gy -= 2; } else { const tx = cam + 90 + p.i*80, ty = 150 + Math.sin(startT*.05 + p.i)*14; p.gx += (tx - p.gx)*.06; p.gy += (ty - p.gy)*.06; }
        const helper = P.find(o => !o.dead && !o.gone && Math.hypot(o.x + o.w/2 - (p.gx + 22), o.y + o.h/2 - (p.gy + 40)) < 70);
        if (helper && p.deadT <= 0 && overT <= 0) revive(p, p.gx, p.gy);
        return;
      }
      if (p.inv) p.inv--; if (p.wpnT > 0 && --p.wpnT === 0) p.wpn = "";
      if (p.cd > 0) p.cd--; if (p.in.s && p.cd <= 0) fire(p);
      if (p.y > VH + 200){ p.y = GY - p.h - 260; hurt(p); }
    });
    // 카메라: 맨 앞 친구를 따라가되 맨 뒤 친구가 화면 밖으로 밀려나지 않게
    const A = alive(); if (A.length){ const lead = Math.max(...A.map(p => p.x)), rear = Math.min(...A.map(p => p.x)); let want = lead - W*(land ? .4 : .32); if (A.length > 1) want = Math.min(want, rear - 20);
      if (want > cam) cam += Math.min(want - cam, 9); }
    if (!boss && clearT <= 0 && cam > stEnd - W) spawnBoss();
    if (camMax >= 0) cam = Math.min(cam, camMax);
    gen(cam + W + 600);
    // 거품 총알
    shots.forEach(s => { s.x += s.vx; s.y += s.vy; s.t--; });
    shots = shots.filter(s => { if (s.t <= 0 || s.x < cam - 40 || s.x > cam + W + 40 || s.y < -40) return false;
      const b = {x: s.x - s.r, y: s.y - s.r, w: s.r*2, h: s.r*2};
      for (const e of ens){ if (e.on && !e.trapped && !(s.hit && s.hit.has(e.id)) && hitR(b, e)){ e.hp -= s.dm; e.hit = 6; puff(s.x, s.y, 4, "#d0ebff", true); if (e.hp <= 0) trapE(e); if (--s.pc <= 0) return false; (s.hit = s.hit || new Set()).add(e.id); } }
      for (const c of crates){ if (!c.dead && hitR(b, c)){ c.hp--; puff(s.x, s.y, 4, "#d9a066", true); if (c.hp <= 0){ c.dead = 1; puff(c.x + 29, c.y + 29, 14, "#b07d48"); sfx("crate");
        items.push({id: ++eid, k: ["s", "r", "p", "d", "b", "h", "s", "r"][Math.floor(rnd()*8)], x: c.x + 7, y: c.y, w: 44, h: 44, vy: -7}); } return false; } }
      if (boss && !boss.dying && boss.enter <= 0 && hitR(b, {x: boss.x + 30, y: boss.y + 30, w: 200, h: 190})){ dmgBoss(s.dm); puff(s.x, s.y, 4, "#ffe066", true); return false; }
      return true; });
    ens = ens.filter(e => !e.trapped); crates = crates.filter(c => !c.dead && c.x > cam - 100);
    // 로봇
    const d = D(), spd = 1 + .12*d, fm = Math.max(.42, 1 - .09*d), bv = 4.4 + .35*d;
    ens.forEach(e => {
      if (!e.on){ if (e.x < cam + W + 30){ e.on = true; e.y0 = e.y; } else return; }
      e.t++; if (e.hit) e.hit--; if (e.cd > 0) e.cd--;
      const tg = nearest(e.x), ex = e.x + e.w/2, px = tg ? tg.x + tg.w/2 : ex - 200, py = tg ? tg.y + tg.h/2 : GY - 40, dx = px - ex, onS = e.x < cam + W - 20 && e.x > cam - 20;
      if (e.k === "walker"){ e.dir = dx < 0 ? -1 : 1; e.x += e.dir*1.25*spd; }
      else if (e.k === "drone"){ e.x += Math.sign(dx)*Math.min(1.7*spd, Math.abs(dx)*.01) - .3; e.y = e.y0 + Math.sin(e.t*.05)*30;
        if (e.cd <= 0 && Math.abs(dx) < 380 && onS){ e.cd = Math.round(130*fm); ebul.push({x: ex, y: e.y + e.h, vx: 0, vy: 4.2 + d*.2, t: 200, ty: 0}); } }
      else if (e.k === "jumper"){ e.vy += .6; e.y += e.vy; e.x += e.vx; if (e.y >= GY - e.h){ e.y = GY - e.h; e.vy = 0; e.vx = 0; if (e.t % Math.max(36, 60 - d*4) === 0){ e.vy = -11 - rnd()*3; e.vx = Math.sign(dx)*(2.4 + spd*.5); } } }
      else if (e.k === "turret"){ if (e.cd <= 0 && onS){ e.cd = Math.round(150*fm); const a = Math.atan2(py - (e.y + 22), dx); ebul.push({x: ex, y: e.y + 22, vx: Math.cos(a)*bv, vy: Math.sin(a)*bv, t: 220, ty: 0}); sfx("fire"); } }
      else if (e.k === "tank"){ if (Math.abs(dx) > 260) e.x += Math.sign(dx)*.65*spd; e.dir = dx < 0 ? -1 : 1;
        if (e.cd <= 0 && onS){ e.cd = Math.round(175*fm); const ft = 60, g = .25; ebul.push({x: ex - 40*(dx < 0 ? 1 : -1), y: e.y + 16, vx: dx/ft, vy: (py - (e.y + 16))/ft - .5*g*ft, t: 200, ty: 2}); sfx("fire"); } }
      else if (e.k === "bat"){ if (e.st === 0){ e.y = e.y0 + Math.sin(e.t*.06)*24; e.x += Math.sign(dx)*.8*spd; if (Math.abs(dx) < 280 && e.cd <= 0 && onS){ e.st = 1; e.vx = Math.sign(dx)*(4 + d*.3); e.vy = 7 + d*.2; } }
        else { e.x += e.vx; e.y += e.vy; e.vy -= .24; if (e.vy < -5 && e.y <= e.y0){ e.st = 0; e.cd = Math.round(110*fm); } if (e.y > GY - e.h){ e.y = GY - e.h; e.vy = Math.min(e.vy, -2); } } }
      P.forEach(p => { if (!p.dead && !p.inv && hitR(pBox(p), {x: e.x + 6, y: e.y + 6, w: e.w - 12, h: e.h - 10})) hurt(p); });
    });
    ens = ens.filter(e => e.x > cam - 260);
    if (boss) bossStep();
    if (clearT > 0 && --clearT === 0){ stage++; newStage(); }
    // 로봇 총알
    ebul.forEach(b => { b.x += b.vx; b.y += b.vy; if (b.ty === 2) b.vy += .25; if (b.ty === 1) b.rot = (b.rot || 0) + b.vx*.05; b.t--; });
    ebul = ebul.filter(b => { if (b.t <= 0 || b.x < cam - 60 || b.x > cam + W + 80) return false;
      if (b.y > GY - (b.ty === 1 ? 20 : 4)){ if (b.ty === 2){ boomAt(b.x, GY - 10); return false; } if (b.ty !== 1) return false; }
      const rr = b.ty === 1 ? 22 : 12; for (const p of P){ if (p.dead || p.inv) continue; const q = pBox(p), cx = Math.max(q.x, Math.min(b.x, q.x + q.w)), cy = Math.max(q.y, Math.min(b.y, q.y + q.h)); if ((cx - b.x)**2 + (cy - b.y)**2 < rr*rr){ hurt(p); if (b.ty !== 1) return false; } }
      return true; });
    // 아이템
    items.forEach(it => { if (!it.fix){ it.vy = Math.min(9, it.vy + .4); it.y += it.vy; if (it.y + it.h > GY){ it.y = GY - it.h; it.vy = 0; } } });
    items = items.filter(it => { if (it.x < cam - 80) return false;
      const p = P.find(p => !p.dead && hitR({x: p.x, y: p.y, w: p.w, h: p.h}, it)); if (!p) return true;
      const k = it.k; if (k === "c"){ score += 50; sfx("coin"); return false; }
      sfx("item"); score += 100;
      if ("srp".includes(k)){ p.wpn = k; p.wpnT = 60*15; } else if (k === "h") p.hearts = Math.min(5, p.hearts + 1); else if (k === "d") p.shield = 1; else if (k === "b") p.bombs = Math.min(5, p.bombs + 1);
      txt({s: "🔱 세 갈래 거품!", r: "⚡ 연사 거품!", p: "💥 왕거품 관통!", h: "❤️ 하트 +1", d: "🛡️ 방패!", b: "💣 거품 폭탄 +1"}[k], it.x + 20, it.y, "#ffe066");
      return false; });
    // 갇힌 로봇은 둥실둥실 (몸으로 터뜨리면 +50)
    trapped.forEach(t => { t.t++; t.y -= t.big ? 1.5 : 1.9; t.x += Math.sin(t.t*.08)*.8; });
    trapped = trapped.filter(t => { if (t.y < -t.h - 60 || t.t > 300) return false;
      if (!t.big && t.t > 12 && P.some(p => !p.dead && hitR({x: p.x, y: p.y, w: p.w, h: p.h}, t))){ score += 50; sfx("pop"); puff(t.x + t.w/2, t.y + t.h/2, 14, "#d0ebff"); txt("+50 펑!", t.x + t.w/2, t.y, "#a5d8ff"); return false; }
      return true; });
    plats = plats.filter(q => q.x + q.w > cam - 60);
    if (overT > 0 && --overT === 0) finish();
  }
  function finish(){
    if (ended) return; ended = true;
    if (party === "guest") return;
    const team = SIDS.map((s, i) => P[i] && !P[i].gone ? esc(nameOf(noOf_(s))) : "").filter(Boolean);
    // 같은 기기에서 함께한 2P 기록 (온라인 친구는 자기 기기에서 자기 기록을 올려요)
    local.forEach(i => { if (i > 0 && P[i] && !P[i].gone){ const me0 = ARC.me; ARC.me = noOf_(SIDS[i]); try { saveRec("bs", SIDS[i], score); } finally { ARC.me = me0; } } });
    if (party === "host") PARTY.sendAll({t: "end", w: 0, wins: [], score, stage, kills});
    NG.over(score, `<div>🫧 STAGE ${stage}${loopN() ? ` (${loopN() + 1}회차)` : ""} · 🤖 로봇 ${kills}대를 거품에 가뒀어요</div>${N > 1 ? `<div>👥 함께한 친구: ${team.join(", ")} <small>(모두 같은 점수로 기록돼요)</small></div>` : ""}`);
  }

  /* ---------- 🌐 친구 기기로 보내기 / 받기 ---------- */
  const R0 = v => Math.round(v);
  function snap(){
    const lo = cam - 160, hi = cam + W + 160, inV = o => o.x + (o.w || 0) > lo && o.x < hi;
    return {c: +cam.toFixed(1), cm: camMax, st: stage, sc: score, cl: clearT, ov: overT, kl: kills,
      P: P.map(p => [R0(p.x), R0(p.y), p.dir, p.aimUp ? 1 : 0, +p.run.toFixed(2), p.hearts, p.inv, p.dead ? 1 : 0, p.wpn, Math.ceil(p.wpnT/60), p.shield, p.bombs, p.ground ? 1 : 0, R0(p.gx), R0(p.gy), p.gone ? 1 : 0, p.deadT]),
      E: ens.filter(e => e.on && inV(e)).map(e => [e.id, e.k, R0(e.x), R0(e.y), e.t, e.hit, e.dir, e.el ? 1 : 0, R0(e.w), R0(e.h)]),
      S: shots.filter(inV).map(s => [R0(s.x), R0(s.y), +s.vx.toFixed(1), +s.vy.toFixed(1), s.r]),
      B: ebul.filter(inV).map(b => [R0(b.x), R0(b.y), +b.vx.toFixed(2), +b.vy.toFixed(2), b.ty]),
      I: items.filter(inV).map(i => [i.k, R0(i.x), R0(i.y), i.fix ? 1 : 0]), C: crates.filter(inV).map(c => [R0(c.x), R0(c.y)]), L: plats.filter(inV).map(q => [R0(q.x), R0(q.y), q.w]),
      T: trapped.filter(inV).map(t => [t.k, R0(t.x), R0(t.y), t.t, t.big ? 1 : 0, t.el ? 1 : 0, R0(t.w), R0(t.h)]),
      bo: boss ? [R0(boss.x), R0(boss.y), boss.hp, boss.max, boss.t, boss.hit, boss.rage ? 1 : 0, boss.dying, boss.enter, boss.las ? boss.las.y : 0, boss.las ? boss.las.t : 0] : 0};
  }
  function apply(d){
    if (d.ev){ d.ev.forEach(e => { const k = e[0];
      if (k === "s") playS(e[1]); else if (k === "p") puff(e[1], e[2], e[3], e[4], true); else if (k === "r") fx.push({ring: 1, x: e[1], y: e[2], t: e[3] ? 40 : 22, r0: e[3] ? 30 : 10, big: e[3]});
      else if (k === "t") fx.push({tx: e[1], x: e[2], y: e[3], t: 55, c: e[4]}); else if (k === "m") msg = {t: e[1], s: e[2], k: e[3]};
      else if (k === "kb" && e[1] === myIdx){ const me = P[myIdx]; me.vy = -7; me.vx = -e[2]*5; flash = 10; shake = 6; } }); return; }
    const s = d.s; if (!s) return;
    if (s.st !== stage){ stage = s.st; backdrop(); msg = {t: `STAGE ${stage}`, s: th().n + (loopN() ? ` · ${loopN() + 1}회차!` : ""), k: 160}; }
    camT = s.c; camMax = s.cm; score = s.sc; clearT = s.cl; overT = s.ov; kills = s.kl;
    s.P.forEach((a, i) => { const p = P[i]; if (!p) return; const wasDead = p.dead;
      p.hearts = a[5]; p.inv = a[6]; p.dead = !!a[7]; p.wpn = a[8]; p.wpnT = a[9]*60; p.shield = a[10]; p.bombs = a[11]; p.gx = a[13]; p.gy = a[14]; p.gone = !!a[15]; p.deadT = a[16];
      if (i === myIdx){ if (wasDead && !p.dead){ p.x = a[0]; p.y = a[1]; p.vx = 0; p.vy = 0; } return; }
      if (p.tx == null || p.dead){ p.x = a[0]; p.y = a[1]; } p.tx = a[0]; p.ty = a[1]; p.dir = a[2]; p.aimUp = !!a[3]; p.run = a[4]; p.ground = !!a[12]; });
    const old = new Map(ens.map(e => [e.id, e]));
    ens = s.E.map(a => { const o = old.get(a[0]) || {x: a[2], y: a[3]}; return {id: a[0], k: a[1], x: o.x, y: o.y, tx: a[2], ty: a[3], t: a[4], hit: a[5], dir: a[6], el: !!a[7], w: a[8], h: a[9], on: true}; });
    shots = s.S.map(a => ({x: a[0], y: a[1], vx: a[2], vy: a[3], r: a[4]}));
    ebul = s.B.map(a => ({x: a[0], y: a[1], vx: a[2], vy: a[3], ty: a[4], rot: 0}));
    items = s.I.map(a => ({k: a[0], x: a[1], y: a[2], fix: a[3], w: 44, h: 44})); crates = s.C.map(a => ({x: a[0], y: a[1], w: 58, h: 58})); plats = s.L.map(a => ({x: a[0], y: a[1], w: a[2], h: 24}));
    trapped = s.T.map(a => ({k: a[0], x: a[1], y: a[2], t: a[3], big: a[4], el: a[5], w: a[6], h: a[7]}));
    if (s.bo){ const b = s.bo, o = boss; boss = {x: o ? o.x : b[0], y: o ? o.y : b[1], tx: b[0], ty2: b[1], hp: b[2], max: b[3], t: b[4], hit: b[5], rage: !!b[6], dying: b[7], enter: b[8], las: b[9] ? {y: b[9], t: b[10]} : null}; } else boss = null;
  }
  function guestStep(){
    const me = P[myIdx];
    cam += ((camT ?? cam) - cam)*.5;
    if (!me.dead){ if (me.inv) me.inv--; phys(me, me.in); if (me.in.s && (me.cd = (me.cd || 0) - 1) <= 0){ me.cd = me.wpn === "r" ? 6 : me.wpn === "p" ? 17 : 11; playS("shot"); } }
    if (NG.frame % 2 === 0 || bcLocal !== lastS){ const rel = bcLocal !== lastS; lastS = bcLocal;
      PARTY.sendIn({sd: O.seed, x: R0(me.x), y: R0(me.y), vx: +me.vx.toFixed(2), vy: +me.vy.toFixed(2), dr: me.dir, u: me.aimUp ? 1 : 0, g: me.ground ? 1 : 0, rn: +me.run.toFixed(2), s: me.in.s ? 1 : 0, bc: bcLocal}, rel); }
    P.forEach(p => { if (p.i === myIdx || p.tx == null) return; const dx = p.tx - p.x, dy = p.ty - p.y; if (Math.abs(dx) + Math.abs(dy) > 200){ p.x = p.tx; p.y = p.ty; } else { p.x += dx*.4; p.y += dy*.4; } });
    ens.forEach(e => { e.x += (e.tx - e.x)*.4; e.y += (e.ty - e.y)*.4; e.t++; });
    if (boss){ boss.x += (boss.tx - boss.x)*.4; boss.y += (boss.ty2 - boss.y)*.4; boss.t++; }
    shots.forEach(s => { s.x += s.vx; s.y += s.vy; }); ebul.forEach(b => { b.x += b.vx; b.y += b.vy; if (b.ty === 2) b.vy += .25; if (b.ty === 1) b.rot += b.vx*.05; });
    trapped.forEach(t => { t.t++; t.y -= t.big ? 1.5 : 1.9; });
    items.forEach(it => { if (!it.fix && it.y + it.h < GY) it.y += 3; });
    startT++;
  }
  const self = {
    get W(){ return W + 2*PX; }, get H(){ return H; }, maxPx: 1.9e6, layout,
    get dbg(){ return {P, cam, stage, score, ens, boss, camMax, stEnd, items, shots, ebul, trapped, CT, PX}; },
    cheat(o){ if (o.p) Object.assign(P[o.i || 0], o.p); if (o.cam != null) cam = o.cam; if (o.stage){ stage = o.stage; stEnd = cam - 600; newStage(); } },
    init(){
      stage = 1; stEnd = 0; score = 0; kills = 0; flash = 0; shake = 0; startT = 0; clearT = 0; overT = 0; eid = 0; ended = false; NQ = []; bcLocal = 0; lastS = 0;
      cam = 0; camT = 0; camMax = -1; genX = 0; shots = []; ebul = []; ens = []; plats = []; items = []; crates = []; fx = []; trapped = []; boss = null;
      keyS = [{}, {}]; ptr = new Map(); P = SIDS.map((_, i) => mkP(i));
      newStage();
      if (party !== "guest") gen(W + 600);
      if (party) PARTY.attach(self, null);
      // ⚡ 그림은 쉬는 틈에 조금씩 미리 그려 둬요 (한꺼번에 그리면 처음에 멈칫해요)
      const jobs = []; P.forEach(p => [0, 1, 2, 3].forEach(f => jobs.push(() => { heroSpr(p.i, f, 0); heroSpr(p.i, f, 1); })));
      Object.keys(BS_EN).forEach(k => jobs.push(() => { enSpr(k, 0); enSpr(k, 1); }));
      jobs.push(() => "srphdbc".split("").forEach(itemSpr), () => [11, 13, 22, 40, 52].forEach(r => bubSpr(r)), () => { orbSpr(); rollSpr(); shellSpr(); crateSpr(); }, () => { auraSpr(); beamSpr(); }, () => bossSpr(0, 0), () => bossSpr(1, 0), () => { bossSpr(0, 1); }, () => bossSpr(1, 1));
      const run = dl => { if (NG.cur !== self) return; do { const j = jobs.shift(); if (!j) return; j(); } while (dl && dl.timeRemaining && dl.timeRemaining() > 8); (window.requestIdleCallback || setTimeout)(run, {timeout: 300}); };
      (window.requestIdleCallback || setTimeout)(run, {timeout: 300});
    },
    dropIdx(i){ const p = P[i]; if (!p) return; p.gone = true; p.dead = true; if (!alive().length && overT <= 0) overT = 60; },
    end(w, ws, m){ if (party !== "guest" || ended) return; ended = true; if (m){ score = m.score; stage = m.stage; kills = m.kills; } BS.guestOver(score, stage, kills); },
    apply,
    step(){
      // 이 기기 사람들의 손가락·키보드
      local.forEach((pi, slot) => { const p = P[pi]; if (!p) return; const k = keyS[local.length >= 2 ? slot : 0], k2 = local.length >= 2 ? {} : keyS[1];
        let st = null; ptr.forEach(v => { if (v.pl === pi && v.t === "stick") st = v; }); let sh = false, jh = false; ptr.forEach(v => { if (v.pl === pi && v.t === "shoot") sh = true; if (v.pl === pi && v.t === "jump") jh = true; });
        p.in = {l: k.l || k2.l || (st && st.sx < -.3), r: k.r || k2.r || (st && st.sx > .3), u: k.u || k2.u || (st && st.sy < -.55), s: k.s || k2.s || sh, jh: k.j || k2.j || jh}; });
      if (flash) flash--; if (shake) shake--; if (msg && msg.k > 0 && msg.k < 900) msg.k--;
      fx.forEach(f => { if (f.tx) f.y -= 1; else if (!f.ring){ f.x += f.vx; f.y += f.vy; f.vy += .15; } f.t--; }); fx = fx.filter(f => f.t > 0);
      if (party === "guest"){ guestStep(); return; }
      if (!ended) sim();
      if (party === "host" && NG.frame % 2 === 0){ if (NQ.length) PARTY.sendAll({t: "ev", ev: NQ.splice(0)}); PARTY.sendAll({t: "s", n: ++PARTY.seq, s: snap()}); }
    },
    down(x, y, id){ x -= PX; const c = hitCT(x, y); if (!c){ ptr.set(id, {t: "shoot", pl: local[0]}); return; }
      const v = {t: c.t, pl: c.pl, c, sx: 0, sy: 0}; ptr.set(id, v);
      // 📱 막대는 엄지가 닿은 자리가 가운데가 돼요 (막대 영역 안에서)
      if (c.t === "stick" && c.free){ const lim = c.r*1.25; v.cx = Math.max(c.x - lim, Math.min(c.x + lim, x)); v.cy = Math.max(c.y - lim, Math.min(Math.min(c.y + lim, H - c.r*.5), y));
        if (PAN){ v.cx = Math.max(c.x < 0 ? -PX + c.r + 6 : W + c.r + 6, Math.min(c.x < 0 ? -c.r - 6 : W + PX - c.r - 6, v.cx)); } }
      if (c.t === "stick") stickAt(v, x, y); else if (c.t === "jump") P[c.pl].jb = 8; else if (c.t === "bomb") bombPress(c.pl); },
    move(x, y, id){ const v = ptr.get(id); if (v && v.t === "stick") stickAt(v, x - PX, y); },
    up(x, y, id){ ptr.delete(id); },
    key(code, d){
      const two = local.length >= 2;
      const M1 = two ? {KeyA: "l", KeyD: "r", KeyW: "u", KeyF: "s", KeyG: "j", KeyH: "b", Space: "j"} : {ArrowLeft: "l", KeyA: "l", ArrowRight: "r", KeyD: "r", ArrowUp: "u", KeyW: "u", KeyZ: "s", KeyJ: "s", KeyX: "j", KeyK: "j", Space: "j", KeyC: "b", KeyL: "b"};
      const M2 = two ? {ArrowLeft: "l", ArrowRight: "r", ArrowUp: "u", KeyK: "s", KeyL: "j", KeyO: "b", Enter: "j"} : {};
      let slot = 0, m = M1[code]; if (!m && M2[code]){ slot = 1; m = M2[code]; } if (!m) return false;
      const ks = keyS[slot], pi = local[slot];
      if (m === "j" && d && !ks.j && P[pi]) P[pi].jb = 8;
      if (m === "b" && d && !ks.b) bombPress(pi);
      ks[m] = d; return true;
    },
    draw,
    hud(){ return `🫧 STAGE ${stage} · ${th().n} · ${score.toLocaleString()}점${party ? " · 🌐 함께 출동" : N > 1 ? " · 👥 둘이 출동" : ""}`; }
  };
  function bombPress(pi){ if (party === "guest"){ if (P[pi].bombs > 0 && !P[pi].dead) bcLocal++; } else popBomb(P[pi]); }
  function hitCT(x, y){ let best = null, bd = 1e9; CT.forEach(c => { if (party === "guest" && c.pl !== myIdx) return; const dd = Math.hypot(x - c.x, y - c.y); if (dd < c.r*(c.t === "stick" ? 1.6 : 1.3) && dd < bd){ bd = dd; best = c; } });
    if (!best && local.length < 2 && (x < 0 || (!PAN && x < W*.42 && y > VH*.45))) best = CT[0];
    if (!best && local.length >= 2 && PAN && (x < 0 || x > W)) best = CT.find(c => c.t === "stick" && (x < 0) === (c.x < 0));
    return best; }
  function stickAt(v, x, y){ const c = v.c, ox = v.cx ?? c.x, oy = v.cy ?? c.y, dx = (x - ox)/(c.r*.7), dy = (y - oy)/(c.r*.7), m = Math.hypot(dx, dy); v.sx = m > 1 ? dx/m : dx; v.sy = m > 1 ? dy/m : dy; }

  /* ---------- 그리기 ---------- */
  function draw(g){
    const k = NG.k || 1; g.clearRect(0, 0, W + 2*PX, H);
    if (PX){ g.fillStyle = "#140d2e"; g.fillRect(0, 0, PX, H); g.fillRect(PX + W, 0, PX, H); g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(PX - 3, 0, 3, H); g.fillRect(PX + W, 0, 3, H); }
    g.setTransform(k, 0, 0, k, Math.round(PX*k), 0);
    if (PX){ g.save(); g.beginPath(); g.rect(0, 0, W, H); g.clip(); }
    drawWorld(g, k);
    if (PX) g.restore();
    drawCtrls(g);
  }
  function drawWorld(g, k){
    const fr = NG.frame, sx = shake ? (rnd() - .5)*shake*.9 : 0, sy = shake ? (rnd() - .5)*shake*.6 : 0, X = x => x - cam;
    strip(g, midSpr(), 1024, cam*.3, GY - 270 + sy, sx); strip(g, nearSpr(), 900, cam*.62, GY - 146 + sy, sx); strip(g, grSpr(), 128, cam, GY + sy, sx);
    g.save(); g.translate(sx, sy);
    plats.forEach(q => { if (q.x - cam < W + 10 && q.x + q.w - cam > -10) g.drawImage(platSpr(q.w), X(q.x) - 3, q.y - 3, q.w + 8, 40); });
    const cs = crateSpr(); crates.forEach(c => { if (c.x - cam < W) g.drawImage(cs, X(c.x), c.y, 58, 58); });
    items.forEach(it => { if (it.x - cam > W) return; const s = itemSpr(it.k), bob = it.fix ? Math.sin(fr*.1 + it.x)*4 : Math.sin(fr*.12)*2, sz = it.k === "c" ? 38 : 50; g.drawImage(s, X(it.x) + (it.w - sz)/2, it.y + bob + (it.h - sz)/2, sz, sz); });
    // 로봇
    const au = auraSpr();
    ens.forEach(e => { if (e.x - cam > W + 30) return; const s = enSpr(e.k, Math.floor((e.t || 0)/8) % 2), x = X(e.x);
      if (e.el){ const r = Math.max(e.w, e.h)*.9; g.globalAlpha = .75 + Math.sin(fr*.15)*.2; g.drawImage(au, x + e.w/2 - r, e.y + e.h/2 - r, r*2, r*2); g.globalAlpha = 1; }
      if (e.hit && e.hit % 2) g.globalAlpha = .45;
      if ((e.k === "walker" || e.k === "tank") && e.dir > 0){ g.save(); g.translate(x + e.w, e.y); g.scale(-1, 1); g.drawImage(s, 0, 0, e.w, e.h); g.restore(); } else g.drawImage(s, x, e.y, e.w, e.h);
      if (e.k === "turret"){ const tp = nearest(e.x), a = tp ? Math.atan2(tp.y + 40 - (e.y + e.h*.42), tp.x + 22 - (e.x + e.w/2)) : Math.PI; g.save(); g.translate(x + e.w/2, e.y + e.h*.42); g.rotate(a); g.fillStyle = "#1b1233"; g.fillRect(6, -8, 38, 16); g.fillStyle = "#868e96"; g.fillRect(8, -6, 34, 12); g.fillStyle = "#ff6b6b"; g.fillRect(38, -6, 4, 12); g.restore(); }
      g.globalAlpha = 1;
      if (e.el) outlined(g, "★", x + e.w/2, e.y - 8, 18, "#ffd43b"); });
    // 왕로봇 · 레이저
    if (boss){ const b = boss, s = bossSpr(Math.floor(b.t/10) % 2, b.rage ? 1 : 0), x = X(b.x), shk = b.dying ? (rnd() - .5)*8 : 0;
      if (b.las){ const lt = b.las.t; if (lt < 70){ g.globalAlpha = .25 + (Math.floor(lt/5) % 2)*.35; g.fillStyle = "#ff3b3b"; g.fillRect(0, b.las.y - 26, x, 52); g.globalAlpha = 1; outlined(g, "⚠️", Math.max(40, x - 60), b.las.y, 30, "#fff"); }
        else if (lt < 112){ g.drawImage(beamSpr(), 0, b.las.y - 34, x + 40, 68); } }
      if (b.hit % 2 || (b.dying && b.dying % 8 < 4)) g.globalAlpha = .55; g.drawImage(s, x + shk, b.y, 260, 240); g.globalAlpha = 1; }
    // 거품에 갇힌 로봇
    trapped.forEach(t => { const r = Math.max(t.w, t.h)*.72, cx = X(t.x) + t.w/2, cy = t.y + t.h/2;
      if (t.k === "boss"){ g.globalAlpha = .9; g.drawImage(bossSpr(0, 0), cx - 110, cy - 102, 220, 204); g.globalAlpha = 1; }
      else { g.save(); g.translate(cx, cy); g.rotate(Math.sin(t.t*.1)*.3); g.drawImage(enSpr(t.k, 0), -t.w*.4, -t.h*.4, t.w*.8, t.h*.8); g.restore(); }
      const bs = bubSpr(40, t.el ? "#ffd43b" : ""), wob = 1 + Math.sin(t.t*.15)*.05; g.drawImage(bs, cx - r*wob, cy - r/wob, r*2*wob, r*2/wob); });
    // 친구들
    P.forEach(p => { if (p.gone) return;
      if (p.dead){ const gx = X(p.gx) + 22, gy = p.gy + 40; if (p.deadT > 0){ g.globalAlpha = .8; } g.drawImage(bubSpr(52, BS_PC[p.i][0]), gx - 55, gy - 55, 110, 110); faceAt(g, p.sid, gx, gy, 30, "#fff", true); g.globalAlpha = 1;
        if (p.deadT <= 0 && overT <= 0 && N > 1) outlined(g, "구해 줘요!", gx, gy - 66, 16, "#ffe066"); return; }
      if (p.inv && Math.floor(fr/4) % 2 && p.inv < 100) return;
      const f = p.ground ? (Math.abs(p.vx) > .6 || (p.tx != null && Math.abs(p.tx - p.x) > 1) ? Math.floor(p.run) % 4 : 0) : 1, hs = heroSpr(p.i, f, p.aimUp ? 1 : 0), x = X(p.x) - 22, y = p.y - 12;
      if (p.shield) g.drawImage(bubSpr(52, "#74c0fc"), x - 6, y - 10, 112, 112);
      if (p.dir < 0){ g.save(); g.translate(x + 96, y); g.scale(-1, 1); g.drawImage(hs, 0, 0, 96, 92); g.restore(); } else g.drawImage(hs, x, y, 96, 92);
      faceAt(g, p.sid, x + 48 + (p.dir < 0 ? -4 : 0) - p.dir*4, y + 16 + (p.ground && Math.abs(p.vx) > .6 ? -Math.abs(Math.sin(p.run*Math.PI/2))*3 : 0), 24, BS_PC[p.i][0]);
      if (N > 1) outlined(g, `${p.i + 1}P`, x + 48, y - 18, 18, BS_PC[p.i][0]); });
    // 거품 총알 · 로봇 총알
    shots.forEach(s => { const bs = bubSpr(s.r > 18 ? 22 : s.r < 12 ? 11 : 13); g.drawImage(bs, X(s.x) - s.r - 3, s.y - s.r - 3, s.r*2 + 6, s.r*2 + 6); });
    const ob = orbSpr(), rb = rollSpr(), sb = shellSpr();
    ebul.forEach(b => { const x = X(b.x); if (b.ty === 1){ g.save(); g.translate(x, b.y); g.rotate(b.rot || 0); g.drawImage(rb, -26, -26, 52, 52); g.restore(); } else if (b.ty === 2) g.drawImage(sb, x - 15, b.y - 15, 30, 30); else g.drawImage(ob, x - 15, b.y - 15, 30, 30); });
    // 효과
    fx.forEach(f => { if (f.tx){ g.globalAlpha = Math.min(1, f.t/20); outlined(g, f.tx, X(f.x), f.y, 24, f.c); g.globalAlpha = 1; return; }
      if (f.ring){ const age = (f.big ? 40 : 22) - f.t, r = f.r0 + age*(f.big ? 14 : 4); g.globalAlpha = Math.min(1, f.t/12)*.8; g.strokeStyle = f.big ? "#ffffff" : "#ffd43b"; g.lineWidth = f.big ? 8 : 4; g.beginPath(); g.arc(X(f.x), f.y, r, 0, 7); g.stroke(); g.globalAlpha = 1; return; }
      g.globalAlpha = Math.min(1, f.t/18); g.fillStyle = f.c; g.fillRect(X(f.x) - f.r/2, f.y - f.r/2, f.r, f.r); });
    g.globalAlpha = 1; g.restore();
    if (flash){ g.fillStyle = `rgba(255,255,255,${Math.min(.6, flash/40)})`; g.fillRect(0, 0, W, VH); }
    drawHud(g, fr);
  }
  function drawHud(g, fr){
    // 친구 칸 (얼굴 · 하트 · 폭탄 · 무기)
    const pw = N > 1 ? 178 : 230, ph = 58;
    P.forEach((p, i) => { const x0 = 10 + i*(pw + 6), y0 = 8;
      g.fillStyle = "rgba(15,10,40,.55)"; rrect(g, x0, y0, pw, ph, 14); g.fill(); g.fillStyle = BS_PC[i][0]; rrect(g, x0, y0, 6, ph, 3); g.fill();
      g.globalAlpha = p.dead ? .45 : 1; faceAt(g, p.sid, x0 + 34, y0 + ph/2, 20, BS_PC[i][0], p.dead); g.globalAlpha = 1;
      if (p.gone){ outlined(g, "연결 끊김", x0 + 60, y0 + ph/2, 16, "#adb5bd", undefined, "left"); return; }
      const hs = p.hearts > 3 ? icoTxt([["❤️", "×" + p.hearts]], 18) : null;
      if (hs) G2.put(g, hs, x0 + 60, y0 + 6); else outlined(g, "❤️".repeat(Math.max(0, p.hearts)) + "🖤".repeat(Math.max(0, 3 - p.hearts)), x0 + 60, y0 + 18, 18, "#fff", undefined, "left");
      const row = [["💣", p.bombs]]; if (p.wpn) row.push([ICON[p.wpn], Math.ceil(p.wpnT/60)]); if (p.shield) row.push(["🛡️", ""]);
      G2.put(g, icoTxt(row, 15), x0 + 58, y0 + 30); });
    // 점수 · 맵 진행
    const two = 20 + N*(pw + 6) + 250 > W, sxR = W - 16, sy0 = two ? 92 : 30;
    outlined(g, `${score.toLocaleString()}`, sxR, sy0, 34, "#fff", undefined, "right");
    const base = stEnd - stLen, pr = Math.max(0, Math.min(1, (cam + W*.5 - base)/(stLen - W*.5))), bw = 220, bx = sxR - bw - 18, by = sy0 + 26;
    g.fillStyle = "rgba(15,10,40,.55)"; rrect(g, bx, by, bw, 12, 6); g.fill(); g.fillStyle = "#ffd43b"; rrect(g, bx, by, Math.max(12, bw*pr), 12, 6); g.fill();
    outlined(g, `ST${stage}`, bx - 8, by + 6, 16, "#fff", undefined, "right"); G2.put(g, icoTxt([["👑", ""]], 16), bx + bw - 4, by - 6);
    if (boss && !boss.enter && !boss.dying){ const r = Math.max(0, boss.hp/boss.max), w = Math.min(520, W - 120), x = W/2 - w/2, y = two ? 140 : 84;
      g.fillStyle = "rgba(15,10,40,.75)"; rrect(g, x - 4, y - 4, w + 8, 28, 12); g.fill(); g.fillStyle = boss.rage ? "#ff3b3b" : "#ff8787"; rrect(g, x, y, Math.max(20, w*r), 20, 10); g.fill();
      outlined(g, `👑 ${th().boss}${boss.rage ? " · 화났어요!" : ""}`, W/2, y + 10, 16, "#fff"); }
    if (msg && msg.k > 0){ const a = Math.min(1, msg.k/20), warn = msg.t.includes("WARNING"); g.globalAlpha = a;
      if (warn){ const ws = warnSpr(); g.drawImage(ws, -((fr*3) % 44), VH*.36 - 22, W, 44); g.drawImage(ws, -((fr*3) % 44), VH*.36 + 70, W, 44); }
      outlined(g, msg.t, W/2, VH*.36 + (warn ? 0 : 0), land ? 68 : 54, warn ? "#ffd43b" : "#fff"); if (msg.s) outlined(g, msg.s, W/2, VH*.36 + (warn ? 48 : 58), 32, "#ffe066"); g.globalAlpha = 1; }
    if (startT < 260 && !overT){ g.globalAlpha = Math.min(1, (260 - startT)/40);
      const h1 = local.length >= 2 ? "1P: A·D 움직이기 W 위로 F 쏘기 G 점프 H 폭탄  /  2P: ←→ ↑ K 쏘기 L 점프 O 폭탄" : land ? "← → 움직이기 · ↑ 위로 쏘기 · Z 쏘기 · X 점프(두 번!) · C 폭탄" : "왼쪽 막대로 움직이고 · 오른쪽 버튼으로 쏘고 뛰어요!";
      outlined(g, h1, W/2, VH*.6, land ? (local.length >= 2 ? 20 : 26) : 22, "#fff"); g.globalAlpha = 1; }
  }
  function drawCtrls(g){
    if (!land){ g.fillStyle = "rgba(15,10,40,.88)"; g.fillRect(0, VH, W, H - VH); g.fillStyle = "rgba(255,255,255,.14)"; g.fillRect(0, VH, W, 3); if (local.length >= 2){ g.fillRect(W/2 - 1, VH + 20, 2, H - VH - 40); } }
    const over = land && !PAN;   // 놀이 화면 위에 겹칠 때는 손대지 않으면 흐리게
    CT.forEach(c => { if (party === "guest" && c.pl !== myIdx) return; const p = P[c.pl]; if (!p) return; const col = BS_PC[c.pl][0];
      let on = false, st = null; ptr.forEach(v => { if (v.pl === c.pl && v.t === c.t){ on = true; if (c.t === "stick") st = v; } });
      g.globalAlpha = (c.t === "bomb" && p.bombs <= 0) ? .3 : over && !on ? .55 : 1;
      const cx = st && st.cx != null ? st.cx : c.x, cy = st && st.cy != null ? st.cy : c.y;
      G2.put(g, ctrlSpr(c.t, c.r, on && c.t !== "stick", col), cx - c.r - 6, cy - c.r - 6);
      if (c.t === "stick"){ const kx = st ? st.sx : 0, ky = st ? st.sy : 0, kr = c.r*.42; g.drawImage(knobSpr(col), cx + kx*c.r*.6 - kr, cy + ky*c.r*.6 - kr, kr*2, kr*2); }
      if (c.t === "bomb") G2.put(g, icoTxt([["", "×" + p.bombs]], 18), c.x + c.r*.45, c.y - c.r*1.15);
      if (c.t === "stick" && local.length >= 2) outlined(g, `${c.pl + 1}P`, c.x, c.y - c.r - 18, 20, col);
      g.globalAlpha = 1; });
  }
  return self;
};
const BSBG = {cache: new Map(), want: "", busy: {}};

/* =====================================================================
   🫧 버블 특공대 — 시작 메뉴 · 친구 기기 결과
   ===================================================================== */
const BS = {
  menu(){
    const me = ARC.me, box = partyModal("bs"), body = $("#wbBody");
    body.innerHTML = `<p class="arc-small">달리고 뛰며 거품총으로 로봇을 <b>거품에 가둬</b> 날려 보내요! 맵 5곳 끝마다 <b>왕로봇</b>이 기다리고, 갈수록 로봇이 많고 빠르고 단단해져요. 쓰러진 친구는 다른 친구가 거품을 터뜨려 구해 줄 수 있어요.</p>
      <div class="wb-sec"><h3>🧒 혼자 출동 <small>최고 점수로 랭킹!</small></h3><button class="arc-btn p" id="bsSolo">▶ 출동!</button></div>
      <div class="wb-sec"><h3>👫 이 기기에서 둘이 협동 <small>한 화면에서 같이 · 둘 다 같은 점수로 기록돼요</small></h3><button class="arc-btn p" id="bsDuo">👫 친구 들어오기</button></div>
      <div class="wb-sec"><h3>🌐 온라인 협동 <small>각자 기기로 최대 4명 · ☁️ Firebase 반에서만</small></h3><div id="wbRooms"></div></div>`;
    $("#bsSolo").onclick = () => { box.hidden = true; ARC.enter(); ARC.prep(); getAC(); NG.play("bs", [sidOf(me)]); };
    $("#bsDuo").onclick = () => { box.hidden = true; ARC.pickRival("bs", opp => { ARC.enter(); ARC.prep(); getAC(); NG.play("bs", [sidOf(me), sidOf(opp)], {local: [0, 1]}); }); };
    PARTY.renderRooms(); box.hidden = false;
  },
  guestOver(score, stage, kills){
    const sid = sidOf(ARC.me), res = saveRec("bs", sid, score || 0); (res.isNew ? SFX.rec : SFX.over)();
    $("#ngOver").innerHTML = `${res.isNew ? NG.conf(90) : ""}<div class="ng-box"><span class="avb">${avHTMLof(sid)}</span><h3>${res.isNew ? "🎉 새 기록!" : "🫧 팀 출동 끝!"}</h3><div class="sc">${(score || 0).toLocaleString()}점</div>
      <div class="info"><div>STAGE ${stage} · 🤖 로봇 ${kills}대를 거품에 가뒀어요 · 👥 팀 점수</div><div>내 최고 <b>${res.r.best}</b>점 · 🏆 우리 반 <b>${res.rank}</b>등 <small>/ ${res.n}명</small></div>
        <div class="ng-coin">${res.coins ? `🪙 +${res.coins} 코인!` : "🪙 오늘 코인은 다 모았어요"}</div></div>
      <div class="arc-row"><button class="arc-btn" data-bs="wait">⏳ 방장이 다시 시작하길 기다려요</button><button class="arc-btn" data-bs="home">🏠 홈으로</button></div></div>`;
    $("#ngOver").hidden = false; NG.ended = true;
    $("#ngOver").onclick = e => { const b = e.target.closest("[data-bs]"); if (!b) return; e.stopPropagation(); if (b.dataset.bs === "home"){ PARTY.leave(); NG.close(); } };
  }
};
