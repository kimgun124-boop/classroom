/* =====================================================================
   🌸 차분하게 집중하는 예쁜 퍼즐 4종 (앱 마켓 인기 퍼즐 장르를 참고해 새로 만들었어요)
   🧩 블록 퍼즐 · 🍑 과일 합치기 · 💎 보석 맞추기 · 🧪 색깔 물 정렬
   ⚡ 렉 줄이기: 블록·과일·보석·병 같은 그림은 한 번 그린 그림(G2.spr)을 붙이고,
      매 장면 그림자 번짐·그라데이션 새로 만들기는 하지 않아요.
   ===================================================================== */
const PZ = {
  PASTEL: ["#ff8fb1", "#ffb86b", "#ffd84d", "#7ee0b5", "#6cc4ff", "#a99bff", "#f59ce6"],
  dark(hex, k){ const n = parseInt(hex.slice(1), 16); const f = c => Math.max(0, Math.min(255, Math.round(c*k))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; },
  /* 반짝이는 젤리 블록 한 칸 */
  block(t, s, col){
    const r = s*.2;
    t.fillStyle = PZ.dark(col, .78); rrect(t, 1, 3, s - 2, s - 3, r); t.fill();
    t.fillStyle = col; rrect(t, 1, 1, s - 2, s - 6, r); t.fill();
    t.fillStyle = "rgba(255,255,255,.55)"; rrect(t, s*.16, s*.12, s*.68, s*.2, s*.1); t.fill();
    t.fillStyle = "rgba(255,255,255,.9)"; t.beginPath(); t.arc(s*.25, s*.5, s*.06, 0, 7); t.fill();
  },
  /* 파스텔 배경(물방울 무늬) — 게임마다 한 장 */
  wall(t, w, h, c1, c2, dot){
    const gr = t.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, c1); gr.addColorStop(1, c2); t.fillStyle = gr; t.fillRect(0, 0, w, h);
    t.fillStyle = dot; for (let y = 20, i = 0; y < h; y += 46, i++) for (let x = (i % 2) * 23 + 12; x < w; x += 46){ t.beginPath(); t.arc(x, y, 5, 0, 7); t.fill(); }
  },
  pop(parts, x, y, col, n = 10){ for (let i = 0; i < n && parts.length < 160; i++){ const a = rnd(Math.PI*2), v = rnd(2, 7); parts.push({x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v - 2, t: 34, c: col, s: rnd(4, 9), star: rnd(1) < .4}); } },
  stepParts(parts){ for (let i = parts.length - 1; i >= 0; i--){ const q = parts[i]; q.x += q.vx; q.y += q.vy; q.vy += .22; q.vx *= .97; if (--q.t <= 0) parts.splice(i, 1); } },
  drawParts(g, parts){
    for (const q of parts){ g.globalAlpha = Math.min(1, q.t/16); g.fillStyle = q.c;
      if (q.star){ const s = q.s; g.beginPath(); g.moveTo(q.x, q.y - s); g.lineTo(q.x + s*.3, q.y - s*.3); g.lineTo(q.x + s, q.y); g.lineTo(q.x + s*.3, q.y + s*.3); g.lineTo(q.x, q.y + s); g.lineTo(q.x - s*.3, q.y + s*.3); g.lineTo(q.x - s, q.y); g.lineTo(q.x - s*.3, q.y - s*.3); g.closePath(); g.fill(); }
      else { g.beginPath(); g.arc(q.x, q.y, q.s*.5, 0, 7); g.fill(); } }
    g.globalAlpha = 1;
  },
  /* 떠오르는 칭찬 글씨 */
  praise(fx, x, y, s, c = "#fff", big = 0){ fx.push({x, y, s, c, t: 60, big}); },
  stepFx(fx){ for (let i = fx.length - 1; i >= 0; i--){ fx[i].y -= .8; if (--fx[i].t <= 0) fx.splice(i, 1); } },
  drawFx(g, fx){ for (const f of fx){ g.globalAlpha = Math.min(1, f.t/15); outlined(g, f.s, f.x, f.y, f.big ? 52 : 34, f.c, "rgba(120,40,90,.85)"); } g.globalAlpha = 1; }
};

/* =====================================================================
   🧩 블록 퍼즐 — 8×8 판에 조각 3개를 끌어다 놓아 줄을 꽉 채우면 펑!
   ===================================================================== */
NG.defs.bp = () => {
  const N = 8;
  const SHAPES = [
    [[0,0]], [[0,0],[0,1]], [[0,0],[1,0]], [[0,0],[0,1],[0,2]], [[0,0],[1,0],[2,0]], [[0,0],[0,1],[0,2],[0,3]], [[0,0],[1,0],[2,0],[3,0]],
    [[0,0],[0,1],[0,2],[0,3],[0,4]], [[0,0],[1,0],[2,0],[3,0],[4,0]], [[0,0],[0,1],[1,0],[1,1]],
    [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]], [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]], [[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]],
    [[0,0],[1,0],[1,1]], [[0,1],[1,0],[1,1]], [[0,0],[0,1],[1,0]], [[0,0],[0,1],[1,1]],
    [[0,0],[1,0],[2,0],[2,1]], [[0,1],[1,1],[2,1],[2,0]], [[0,0],[0,1],[0,2],[1,0]], [[0,0],[0,1],[0,2],[1,2]],
    [[0,0],[0,1],[0,2],[1,1]], [[0,1],[1,0],[1,1],[1,2]], [[0,0],[1,0],[1,1],[2,0]], [[0,1],[1,0],[1,1],[2,1]],
    [[0,0],[0,1],[1,1],[1,2]], [[0,1],[0,2],[1,0],[1,1]]
  ];
  const WEIGHT = SHAPES.map(s => s.length >= 9 ? .5 : s.length === 5 ? .7 : 1);
  let W = 720, H = 1080, land = false, C = 76, BX = 56, BY = 170, TRAY = [];
  let bd, tray, score, combo, drag, clearing, fx, parts, over, moves, shake, best;
  function layout(sw, sh){
    land = sw/Math.max(1, sh) >= 1.1;
    if (land){ W = 1280; H = 760; C = 78; BX = 70; BY = (H - C*N)/2 + 20; TRAY = [0, 1, 2].map(i => ({x: 1000, y: 250 + i*190}));
    } else { W = 720; H = 1080; C = 76; BX = (W - C*N)/2; BY = 170; TRAY = [0, 1, 2].map(i => ({x: 130 + i*230, y: 930})); }
  }
  const fits = (sh, r0, c0) => sh.cells.every(([r, c]) => { const R = r0 + r, Cc = c0 + c; return R >= 0 && Cc >= 0 && R < N && Cc < N && !bd[R][Cc]; });
  const canPlace = sh => { for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (fits(sh, r, c)) return true; return false; };
  function pick(){
    const tot = WEIGHT.reduce((a, b) => a + b, 0); let x = rnd(tot), i = 0;
    while (x > WEIGHT[i]){ x -= WEIGHT[i]; i++; }
    const cells = SHAPES[i], h = Math.max(...cells.map(c => c[0])) + 1, w = Math.max(...cells.map(c => c[1])) + 1;
    return {cells, h, w, col: PZ.PASTEL[Math.floor(rnd(PZ.PASTEL.length))]};
  }
  function deal(){
    for (let tries = 0; tries < 30; tries++){ tray = [pick(), pick(), pick()]; if (tray.some(canPlace)) break; }
  }
  const trayScale = sh => Math.min(.62, 150/(Math.max(sh.w, sh.h)*C));
  function trayRect(i){ const sh = tray[i], s = trayScale(sh)*C, t = TRAY[i]; return {x: t.x - sh.w*s/2, y: t.y - sh.h*s/2, s}; }
  function checkOver(){ if (tray.filter(Boolean).length && !tray.some(t => t && canPlace(t))){ over = 70; SFX.bad(); PZ.praise(fx, W/2, BY + C*N/2, "놓을 곳이 없어요!", "#fff", 1); } }
  function place(sh, r0, c0){
    sh.cells.forEach(([r, c]) => bd[r0 + r][c0 + c] = sh.col);
    score += sh.cells.length; moves++;
    const rows = [], cols = [];
    for (let r = 0; r < N; r++) if (bd[r].every(Boolean)) rows.push(r);
    for (let c = 0; c < N; c++) if (bd.every(row => row[c])) cols.push(c);
    const lines = rows.length + cols.length;
    if (lines){
      combo++;
      const pts = 10*lines*(lines + 1)/2*Math.min(5, combo); score += pts;
      const cells = new Set(); rows.forEach(r => { for (let c = 0; c < N; c++) cells.add(r*N + c); }); cols.forEach(c => { for (let r = 0; r < N; r++) cells.add(r*N + c); });
      cells.forEach(k => { const r = Math.floor(k/N), c = k % N; clearing.push({r, c, col: bd[r][c], t: 18}); PZ.pop(parts, BX + c*C + C/2, BY + r*C + C/2, bd[r][c], 3); bd[r][c] = null; });
      const msg = lines >= 4 ? "완벽해요! 💖" : lines === 3 ? "환상적이에요! ✨" : lines === 2 ? "멋져요! 🌟" : combo >= 3 ? `${combo}연속! 🔥` : "좋아요!";
      PZ.praise(fx, BX + C*N/2, BY - 40 + (land ? 60 : 0), `${msg}  +${pts}`, lines >= 2 ? "#ffe066" : "#fff", lines >= 2);
      [1046, 1318, 1568].slice(0, Math.min(3, lines + 1)).forEach((f, k) => tone(f*(1 + combo*.04), f*(1 + combo*.04), .12, "triangle", .1, k*.06));
      if (bd.every(row => row.every(v => !v))){ score += 300; PZ.praise(fx, W/2, BY + C*N/2, "판을 모두 비웠어요! +300", "#ffe066", 1); SFX.rec(); }
      shake = Math.min(12, 4 + lines*2);
    } else { combo = 0; tone(330, 300, .06, "sine", .1); }
  }
  const self = {
    get W(){ return W; }, get H(){ return H; }, maxPx: 2.2e6, layout,
    init(){ bd = Array.from({length: N}, () => Array(N).fill(null)); score = 0; combo = 0; drag = null; clearing = []; fx = []; parts = []; over = 0; moves = 0; shake = 0;
      best = ((Store.recs.bp || {})[NG.sids[0]] || {}).best || 0; deal(); },
    down(x, y, id){
      if (over || drag) return;
      for (let i = 0; i < 3; i++){ if (!tray[i]) continue; const t = TRAY[i]; if (Math.abs(x - t.x) < 110 && Math.abs(y - t.y) < 100){
        const sh = tray[i]; drag = {i, sh, x, y, id, lift: land ? 0 : 130, ox: sh.w*C/2, oy: sh.h*C/2}; tone(500, 650, .05, "sine", .08); return; } }
    },
    move(x, y, id){ if (drag && drag.id === id){ drag.x = x; drag.y = y; } },
    up(x, y, id){
      if (!drag || drag.id !== id) return;
      const d = drag; drag = null; const g = this.ghost(d);
      if (g){ place(d.sh, g.r, g.c); tray[d.i] = null; if (tray.every(t => !t)) deal(); checkOver(); }
      else tone(220, 200, .08, "sine", .08);
    },
    ghost(d){
      const left = d.x - d.ox - (land ? 120 : 0), top = d.y - d.lift - d.oy;
      const c = Math.round((left - BX)/C), r = Math.round((top - BY)/C);
      return fits(d.sh, r, c) ? {r, c} : null;
    },
    step(){
      if (over && --over === 0) NG.over(score, `<div>🧩 ${moves}개 놓기 · 최고 연속 콤보까지 화이팅!</div>`);
      for (let i = clearing.length - 1; i >= 0; i--) if (--clearing[i].t <= 0) clearing.splice(i, 1);
      PZ.stepParts(parts); PZ.stepFx(fx); shake *= .85;
    },
    draw(g){
      G2.bg(g, `bpbg${W}`, W, H, t => PZ.wall(t, W, H, "#ffe3f1", "#e5dbff", "rgba(255,255,255,.55)"));
      g.save(); if (shake > .5) g.translate(rnd(-shake, shake), rnd(-shake, shake));
      G2.put(g, G2.spr(`bpboard${C}`, C*N + 24, C*N + 24, t => { t.fillStyle = "rgba(120,80,160,.18)"; rrect(t, 0, 6, C*N + 24, C*N + 18, 28); t.fill();
        t.fillStyle = "#fff8fd"; rrect(t, 0, 0, C*N + 24, C*N + 18, 28); t.fill();
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++){ t.fillStyle = (r + c) % 2 ? "#f6eefb" : "#fbf4fd"; rrect(t, 12 + c*C + 3, 12 + r*C + 3, C - 6, C - 6, 12); t.fill(); } }), BX - 12, BY - 12);
      // 놓일 자리 미리 보기 + 채워질 줄 반짝
      const gh = drag && this.ghost(drag);
      if (gh){ g.globalAlpha = .38; drag.sh.cells.forEach(([r, c]) => G2.put(g, G2.spr(`blk${drag.sh.col}${C}`, C, C, t => PZ.block(t, C, drag.sh.col)), BX + (gh.c + c)*C, BY + (gh.r + r)*C)); g.globalAlpha = 1;
        const tmp = bd.map(row => row.slice()); drag.sh.cells.forEach(([r, c]) => tmp[gh.r + r][gh.c + c] = 1);
        g.fillStyle = "rgba(255,255,255,.45)";
        for (let r = 0; r < N; r++) if (tmp[r].every(Boolean)){ rrect(g, BX, BY + r*C, C*N, C, 14); g.fill(); }
        for (let c = 0; c < N; c++) if (tmp.every(row => row[c])){ rrect(g, BX + c*C, BY, C, C*N, 14); g.fill(); } }
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++){ const v = bd[r][c]; if (v) G2.put(g, G2.spr(`blk${v}${C}`, C, C, t => PZ.block(t, C, v)), BX + c*C, BY + r*C); }
      for (const q of clearing){ const s = q.t/18, sz = C*s; g.globalAlpha = s; G2.put(g, G2.spr(`blk${q.col}${C}`, C, C, t => PZ.block(t, C, q.col)), BX + q.c*C + (C - sz)/2, BY + q.r*C + (C - sz)/2, sz, sz); } g.globalAlpha = 1;
      // 조각 받침
      for (let i = 0; i < 3; i++){ const t = TRAY[i]; G2.put(g, G2.spr("bptray", 210, 180, x => { x.fillStyle = "rgba(255,255,255,.55)"; rrect(x, 0, 0, 210, 180, 30); x.fill(); }), t.x - 105, t.y - 90);
        const sh = tray[i]; if (!sh || (drag && drag.i === i)) continue;
        const R = trayRect(i), ok = canPlace(sh); g.globalAlpha = ok ? 1 : .35;
        sh.cells.forEach(([r, c]) => G2.put(g, G2.spr(`blk${sh.col}${C}`, C, C, x => PZ.block(x, C, sh.col)), R.x + c*R.s, R.y + r*R.s, R.s, R.s)); g.globalAlpha = 1; }
      // 끄는 조각
      if (drag){ const left = drag.x - drag.ox - (land ? 120 : 0), top = drag.y - drag.lift - drag.oy;
        drag.sh.cells.forEach(([r, c]) => G2.put(g, G2.spr(`blk${drag.sh.col}${C}`, C, C, t => PZ.block(t, C, drag.sh.col)), left + c*C, top + r*C)); }
      PZ.drawParts(g, parts);
      g.restore();
      // 점수
      const sx = land ? 1000 : W/2, sy = land ? 54 : 70;
      outlined(g, `${score}`, sx, sy, 62, "#fff", "rgba(150,60,130,.9)");
      outlined(g, `👑 ${Math.max(best, score)}`, land ? 1000 : W - 90, land ? 108 : 70, 26, "#ffe066", "rgba(150,60,130,.9)");
      if (combo >= 2) outlined(g, `🔥 ${combo}연속`, land ? 1000 : 90, land ? 104 + 30 : 70, 26, "#ffa94d", "rgba(150,60,130,.9)");
      PZ.drawFx(g, fx);
      if (moves === 0 && !drag) outlined(g, "아래 조각을 끌어서 판에 놓아요 · 가로·세로 한 줄을 꽉 채우면 펑!", W/2, land ? H - 30 : BY + C*N + 46, land ? 22 : 21, "#fff", "rgba(150,60,130,.9)");
    },
    hud(){ return `🧩 <b>${score}</b>점${combo >= 2 ? ` · 🔥 ${combo}연속` : ""}`; }
  };
  return self;
};

/* =====================================================================
   🍑 과일 합치기 — 같은 과일 둘이 닿으면 더 큰 과일로! 수박까지 가 봐요
   ===================================================================== */
NG.defs.fm = () => {
  const W = 720, H = 1080, L = 54, R = W - 54, B = 1030, TOP = 250, DANGER = 290;
  const FR = [
    {e: "🍒", r: 24, c: "#ff6b81"}, {e: "🍓", r: 32, c: "#ff8fa3"}, {e: "🍇", r: 40, c: "#b197fc"}, {e: "🍊", r: 49, c: "#ffa94d"},
    {e: "🍋", r: 58, c: "#ffe066"}, {e: "🍎", r: 68, c: "#ff6b6b"}, {e: "🍐", r: 79, c: "#c0eb75"}, {e: "🍑", r: 90, c: "#ffc9c9"},
    {e: "🍍", r: 102, c: "#ffd43b"}, {e: "🍈", r: 116, c: "#a9e34b"}, {e: "🍉", r: 132, c: "#51cf66"}
  ];
  const PTS = FR.map((_, i) => (i + 1)*(i + 2)/2);
  let fr, cur, nxt, aimX, cool, score, fx, parts, over, dangerT, maxLv, best, seq;
  const sprite = lv => G2.spr(`fm${lv}`, FR[lv].r*2 + 4, FR[lv].r*2 + 4, t => {
    const r = FR[lv].r, c = r + 2;
    t.fillStyle = PZ.dark(FR[lv].c, .82); t.beginPath(); t.arc(c, c + 2, r, 0, 7); t.fill();
    t.fillStyle = FR[lv].c; t.beginPath(); t.arc(c, c, r - 1, 0, 7); t.fill();
    t.fillStyle = "rgba(255,255,255,.75)"; t.beginPath(); t.arc(c, c, r*.82, 0, 7); t.fill();
    t.font = `${Math.round(r*1.25)}px ${EMOJI}`; t.textAlign = "center"; t.textBaseline = "middle"; t.fillText(FR[lv].e, c, c + r*.06);
    t.fillStyle = "rgba(255,255,255,.85)"; t.beginPath(); t.ellipse(c - r*.42, c - r*.5, r*.18, r*.1, -.6, 0, 7); t.fill();
  });
  const newFruit = () => Math.floor(rnd(1) < .4 ? rnd(2) : rnd(5));
  function drop(){
    if (cool > 0 || over) return;
    const f = FR[cur]; fr.push({x: clampN(aimX, L + f.r, R - f.r), y: TOP - 20, vx: 0, vy: 0, lv: cur, a: 0, born: NG.frame, id: ++seq});
    cur = nxt; nxt = newFruit(); cool = 28; tone(500, 380, .07, "sine", .1);
  }
  function physics(){
    const SUB = 3, G = .5/SUB;
    for (let s = 0; s < SUB; s++){
      for (const p of fr){ p.vy += G; p.x += p.vx/SUB; p.y += p.vy/SUB; const r = FR[p.lv].r;
        if (p.x < L + r){ p.x = L + r; p.vx = Math.abs(p.vx)*.3; } if (p.x > R - r){ p.x = R - r; p.vx = -Math.abs(p.vx)*.3; }
        if (p.y > B - r){ p.y = B - r; p.vy = -Math.abs(p.vy)*.15; p.vx *= .92; } }
      for (let it = 0; it < 3; it++){
        for (let i = 0; i < fr.length; i++){ const a = fr[i]; if (a.dead) continue;
          for (let j = i + 1; j < fr.length; j++){ const b = fr[j]; if (b.dead) continue;
            const dx = b.x - a.x, dy = b.y - a.y, rr = FR[a.lv].r + FR[b.lv].r, d2 = dx*dx + dy*dy;
            if (d2 >= rr*rr || d2 === 0) continue;
            if (a.lv === b.lv){ merge(a, b); continue; }
            const d = Math.sqrt(d2), nx = dx/d, ny = dy/d, ov = rr - d, ma = FR[a.lv].r**2, mb = FR[b.lv].r**2, ta = mb/(ma + mb), tb = ma/(ma + mb);
            a.x -= nx*ov*ta; a.y -= ny*ov*ta; b.x += nx*ov*tb; b.y += ny*ov*tb;
            const rv = (b.vx - a.vx)*nx + (b.vy - a.vy)*ny;
            if (rv < 0){ const imp = -(1.15)*rv; a.vx -= nx*imp*ta; a.vy -= ny*imp*ta; b.vx += nx*imp*tb; b.vy += ny*imp*tb; } } }
        fr = fr.filter(p => !p.dead); }
    }
    for (const p of fr){ p.vx *= .995; p.a += p.vx/FR[p.lv].r; }
  }
  function merge(a, b){
    a.dead = b.dead = true;
    const x = (a.x + b.x)/2, y = (a.y + b.y)/2, lv = a.lv + 1;
    if (lv >= FR.length){ score += 300; PZ.praise(fx, x, y - 60, "🍉🍉 수박 두 개 펑! +300", "#ffe066", 1); PZ.pop(parts, x, y, "#51cf66", 30); SFX.rec(); return; }
    fr.push({x, y, vx: (a.vx + b.vx)/2, vy: Math.min(a.vy, b.vy) - 1.5, lv, a: 0, born: NG.frame - 999, id: ++seq});
    score += PTS[lv]; PZ.pop(parts, x, y, FR[lv].c, 8 + lv*2);
    tone(300 + lv*70, 520 + lv*90, .1, "triangle", .11);
    if (lv > maxLv){ maxLv = lv; if (lv >= 5){ PZ.praise(fx, x, y - FR[lv].r - 20, `${FR[lv].e} 처음 만들었어요!`, "#ffe066", 1); SFX.gold(); } }
    else if (lv >= 6) PZ.praise(fx, x, y - FR[lv].r - 20, `${FR[lv].e} +${PTS[lv]}`, "#fff");
  }
  return {
    W, H, maxPx: 2.2e6,
    init(){ fr = []; cur = newFruit(); nxt = newFruit(); aimX = W/2; cool = 0; score = 0; fx = []; parts = []; over = 0; dangerT = 0; maxLv = 0; seq = 0;
      best = ((Store.recs.fm || {})[NG.sids[0]] || {}).best || 0; },
    down(x){ aimX = x; this.held = true; },
    move(x){ if (this.held) aimX = x; },
    up(x){ if (!this.held) return; this.held = false; aimX = x; drop(); },
    key(code, d){ if (!d) return false; if (code === "ArrowLeft"){ aimX -= 30; return true; } if (code === "ArrowRight"){ aimX += 30; return true; } if (["Space","Enter","ArrowDown"].includes(code)){ drop(); return true; } return false; },
    step(){
      if (over){ if (--over === 0) NG.over(score, `<div>🍑 가장 큰 과일: ${FR[maxLv].e} · 과일 ${fr.length}개</div>`); PZ.stepParts(parts); PZ.stepFx(fx); return; }
      if (cool > 0) cool--;
      aimX = clampN(aimX, L + FR[cur].r, R - FR[cur].r);
      physics();
      const high = fr.some(p => NG.frame - p.born > 70 && p.y - FR[p.lv].r < DANGER && Math.abs(p.vy) < 2);
      dangerT = high ? dangerT + 1 : Math.max(0, dangerT - 2);
      if (dangerT > 150){ over = 60; SFX.bad(); PZ.praise(fx, W/2, 200, "과일이 넘쳤어요!", "#fff", 1); }
      PZ.stepParts(parts); PZ.stepFx(fx);
    },
    draw(g){
      G2.bg(g, "fmbg" + W, W, H, t => { PZ.wall(t, W, H, "#fff0e6", "#ffe3ec", "rgba(255,255,255,.6)");
        t.fillStyle = "rgba(255,255,255,.55)"; rrect(t, L - 14, TOP - 30, R - L + 28, B - TOP + 44, 36); t.fill();
        t.strokeStyle = "rgba(255,150,170,.9)"; t.lineWidth = 8; rrect(t, L - 14, TOP - 30, R - L + 28, B - TOP + 44, 36); t.stroke();
        t.fillStyle = "#ffd6e0"; rrect(t, L - 4, B, R - L + 8, 18, 9); t.fill(); });
      // 위험선
      const warn = dangerT > 0;
      g.strokeStyle = warn ? `rgba(255,70,110,${.5 + .4*Math.sin(NG.frame*.3)})` : "rgba(255,140,170,.45)"; g.lineWidth = 4; g.setLineDash([16, 12]);
      g.beginPath(); g.moveTo(L, DANGER); g.lineTo(R, DANGER); g.stroke(); g.setLineDash([]);
      // 떨어뜨릴 자리 안내선
      if (!over){ g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 3; g.setLineDash([6, 10]); g.beginPath(); g.moveTo(aimX, TOP + FR[cur].r - 20); g.lineTo(aimX, B); g.stroke(); g.setLineDash([]);
        g.globalAlpha = cool > 0 ? .4 : 1; const s = sprite(cur); g.drawImage(s, aimX - s.w/2, TOP - 20 - s.h/2, s.w, s.h); g.globalAlpha = 1; }
      for (const p of fr){ const s = sprite(p.lv); g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.drawImage(s, -s.w/2, -s.h/2, s.w, s.h); g.restore(); }
      PZ.drawParts(g, parts);
      // 위: 점수 · 다음 과일 · 과일 순서
      outlined(g, `${score}`, W/2, 64, 60, "#fff", "rgba(190,70,110,.9)");
      outlined(g, `👑 ${Math.max(best, score)}`, 100, 50, 24, "#ffe066", "rgba(190,70,110,.9)");
      outlined(g, "다음", W - 92, 40, 22, "#fff", "rgba(190,70,110,.9)");
      const ns = sprite(nxt), sc = Math.min(1, 52/ns.w); g.drawImage(ns, W - 92 - ns.w*sc/2, 84 - ns.h*sc/2, ns.w*sc, ns.h*sc);
      for (let i = 0; i < FR.length; i++){ const s = sprite(i), z = 34/s.w; g.globalAlpha = i <= maxLv ? 1 : .3; g.drawImage(s, W/2 - 5*44 + i*44 - 17, 120, s.w*z, s.h*z); } g.globalAlpha = 1;
      PZ.drawFx(g, fx);
      if (!fr.length) outlined(g, "옆으로 끌어서 놓으면 톡! 같은 과일끼리 닿으면 합쳐져요", W/2, 600, 23, "#fff", "rgba(190,70,110,.9)");
    },
    hud(){ return `🍑 <b>${score}</b>점 · 최고 ${FR[maxLv].e}`; }
  };
};

/* =====================================================================
   💎 보석 맞추기 — 같은 보석 3개를 한 줄로! 90초 동안 최고 점수
   ===================================================================== */
NG.defs.jm = () => {
  const N = 8, C = 82, W = 720, H = 1040, BX = (W - C*N)/2, BY = 250, TIME = 90*60;
  const GEM = [{c: "#ff6fa5", k: "heart"}, {c: "#6cc4ff", k: "drop"}, {c: "#ffd43b", k: "star"}, {c: "#7ee0b5", k: "leaf"}, {c: "#b197fc", k: "diamond"}, {c: "#ffa94d", k: "circle"}];
  let bd, sel, swap, fall, score, combo, time, fx, parts, busy, idle, hint, over, best, dragS;
  function shape(t, k, s, col){
    const c = s/2, r = s*.36;
    t.save(); t.translate(c, c);
    const path = () => { t.beginPath();
      if (k === "heart"){ t.moveTo(0, r*.85); t.bezierCurveTo(-r*1.3, -r*.1, -r*.6, -r*1.1, 0, -r*.45); t.bezierCurveTo(r*.6, -r*1.1, r*1.3, -r*.1, 0, r*.85); }
      else if (k === "drop"){ t.moveTo(0, -r); t.bezierCurveTo(r*.9, -r*.1, r*.85, r*.95, 0, r*.95); t.bezierCurveTo(-r*.85, r*.95, -r*.9, -r*.1, 0, -r); }
      else if (k === "star"){ for (let i = 0; i < 10; i++){ const a = -Math.PI/2 + i*Math.PI/5, rr = i % 2 ? r*.48 : r*1.05; t.lineTo(Math.cos(a)*rr, Math.sin(a)*rr); } }
      else if (k === "leaf"){ for (let i = 0; i < 6; i++){ const a = Math.PI/6 + i*Math.PI/3; t.lineTo(Math.cos(a)*r, Math.sin(a)*r); } }
      else if (k === "diamond"){ t.moveTo(0, -r); t.lineTo(r*.85, -r*.25); t.lineTo(0, r); t.lineTo(-r*.85, -r*.25); }
      else t.arc(0, 0, r*.9, 0, 7);
      t.closePath(); };
    t.translate(0, 3); path(); t.fillStyle = PZ.dark(col, .7); t.fill(); t.translate(0, -3);
    path(); t.fillStyle = col; t.fill();
    t.lineWidth = 3; t.strokeStyle = "rgba(255,255,255,.8)"; t.stroke();
    t.save(); path(); t.clip(); t.fillStyle = "rgba(255,255,255,.4)"; t.beginPath(); t.ellipse(-r*.25, -r*.45, r*.6, r*.3, -.5, 0, 7); t.fill(); t.restore();
    t.fillStyle = "#fff"; t.beginPath(); t.arc(-r*.35, -r*.3, r*.1, 0, 7); t.fill();
    t.restore();
  }
  const spr = (v, bomb) => G2.spr(`jm${v}${bomb ? "b" : ""}`, C, C, t => { shape(t, GEM[v].k, C, GEM[v].c);
    if (bomb){ t.strokeStyle = "#fff"; t.lineWidth = 4; t.setLineDash([6, 6]); t.beginPath(); t.arc(C/2, C/2, C*.44, 0, 7); t.stroke(); t.setLineDash([]); t.font = `${C*.3}px ${EMOJI}`; t.textAlign = "center"; t.textBaseline = "middle"; t.fillText("✨", C*.76, C*.24); } });
  const at = (r, c) => r >= 0 && c >= 0 && r < N && c < N ? bd[r][c] : null;
  function rndGem(){ return {v: Math.floor(rnd(GEM.length)), oy: 0, bomb: false}; }
  function fill(){ bd = Array.from({length: N}, () => Array(N).fill(null));
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++){ let g; do { g = rndGem(); } while ((c >= 2 && bd[r][c-1].v === g.v && bd[r][c-2].v === g.v) || (r >= 2 && bd[r-1][c].v === g.v && bd[r-2][c].v === g.v)); bd[r][c] = g; } }
  function findRuns(){
    const runs = [];
    for (let r = 0; r < N; r++){ let s = 0; for (let c = 1; c <= N; c++){ if (c < N && bd[r][c] && bd[r][s] && bd[r][c].v === bd[r][s].v) continue; if (c - s >= 3 && bd[r][s]) runs.push({cells: Array.from({length: c - s}, (_, i) => [r, s + i])}); s = c; } }
    for (let c = 0; c < N; c++){ let s = 0; for (let r = 1; r <= N; r++){ if (r < N && bd[r][c] && bd[s][c] && bd[r][c].v === bd[s][c].v) continue; if (r - s >= 3 && bd[s][c]) runs.push({cells: Array.from({length: r - s}, (_, i) => [s + i, c])}); s = r; } }
    return runs;
  }
  function anyMove(){
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) for (const [dr, dc] of [[0, 1], [1, 0]]){ const r2 = r + dr, c2 = c + dc; if (r2 >= N || c2 >= N) continue;
      [bd[r][c], bd[r2][c2]] = [bd[r2][c2], bd[r][c]]; const ok = findRuns().length > 0; [bd[r][c], bd[r2][c2]] = [bd[r2][c2], bd[r][c]]; if (ok) return [[r, c], [r2, c2]]; }
    return null;
  }
  function resolve(focus){
    const runs = findRuns(); if (!runs.length){ combo = 0; if (!anyMove()){ fill(); PZ.praise(fx, W/2, BY + C*4, "보석을 새로 섞었어요 🔀", "#fff", 1); } return false; }
    combo++;
    const kill = new Set(), make = [];
    runs.forEach(run => { run.cells.forEach(([r, c]) => kill.add(r*N + c));
      if (run.cells.length >= 4){ const f = focus && run.cells.find(([r, c]) => (r === focus[0][0] && c === focus[0][1]) || (r === focus[1][0] && c === focus[1][1])); make.push({at: f || run.cells[1], v: bd[run.cells[0][0]][run.cells[0][1]].v, n: run.cells.length}); } });
    // 반짝 보석이 터지면 둘레 3×3도 함께
    let grow = true; while (grow){ grow = false; [...kill].forEach(k => { const r = Math.floor(k/N), c = k % N; if (bd[r][c] && bd[r][c].bomb && !bd[r][c].boomed){ bd[r][c].boomed = true; tone(160, 80, .25, "sawtooth", .1);
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++){ const k2 = (r + dr)*N + c + dc; if (at(r + dr, c + dc) && !kill.has(k2)){ kill.add(k2); grow = true; } } } }); }
    const pts = kill.size*10*combo; score += pts;
    kill.forEach(k => { const r = Math.floor(k/N), c = k % N; PZ.pop(parts, BX + c*C + C/2, BY + r*C + C/2, GEM[bd[r][c].v].c, 4); bd[r][c] = null; });
    make.forEach(m => { const [r, c] = m.at; bd[r][c] = {v: m.v, oy: 0, bomb: true}; });
    if (combo >= 2) PZ.praise(fx, W/2, BY - 30, `${combo}연속! +${pts}`, combo >= 4 ? "#ffe066" : "#fff", combo >= 4);
    else if (make.length) PZ.praise(fx, W/2, BY - 30, make[0].n >= 5 ? "다섯 개! ✨ 반짝 보석" : "네 개! ✨ 반짝 보석", "#ffe066");
    tone(660 + combo*90, 990 + combo*110, .1, "triangle", .1);
    // 아래로 떨어뜨리고 위에서 새로
    for (let c = 0; c < N; c++){ let w = N - 1;
      for (let r = N - 1; r >= 0; r--) if (bd[r][c]){ const g = bd[r][c]; bd[r][c] = null; g.oy -= (w - r)*C; bd[w][c] = g; w--; }
      for (let r = w, k = 1; r >= 0; r--, k++){ const g = rndGem(); g.oy = -k*C - 40; bd[r][c] = g; } }
    fall = true; return true;
  }
  function trySwap(a, b){
    if (busy || over || !b || Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) !== 1) return;
    swap = {a, b, t: 0, back: false}; busy = true; sel = null; idle = 0; hint = null; tone(520, 600, .05, "sine", .08);
  }
  const cellAt = (x, y) => { const c = Math.floor((x - BX)/C), r = Math.floor((y - BY)/C); return r >= 0 && c >= 0 && r < N && c < N ? [r, c] : null; };
  return {
    W, H, maxPx: 2.2e6,
    init(){ fill(); sel = null; swap = null; fall = false; score = 0; combo = 0; time = TIME; fx = []; parts = []; busy = false; idle = 0; hint = null; over = 0; dragS = null;
      best = ((Store.recs.jm || {})[NG.sids[0]] || {}).best || 0; },
    down(x, y, id){ const p = cellAt(x, y); if (!p || busy || over) return;
      if (sel && Math.abs(sel[0] - p[0]) + Math.abs(sel[1] - p[1]) === 1){ trySwap(sel, p); return; }
      sel = p; dragS = {p, x, y, id}; tone(700, 760, .04, "sine", .06); },
    move(x, y, id){ if (!dragS || dragS.id !== id || busy) return; const dx = x - dragS.x, dy = y - dragS.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) > C*.35){ const [r, c] = dragS.p, t = Math.abs(dx) > Math.abs(dy) ? [r, c + Math.sign(dx)] : [r + Math.sign(dy), c]; dragS = null;
        if (at(t[0], t[1])) trySwap([r, c], t); } },
    up(){ dragS = null; },
    step(){
      if (over){ if (--over === 0) NG.over(score, `<div>💎 90초 동안 ${score}점!</div>`); PZ.stepParts(parts); PZ.stepFx(fx); return; }
      if (time > 0) time--;
      if (swap){ swap.t += 1/8;
        if (swap.t >= 1){ const {a, b} = swap; [bd[a[0]][a[1]], bd[b[0]][b[1]]] = [bd[b[0]][b[1]], bd[a[0]][a[1]]];
          if (swap.back){ swap = null; busy = false; }
          else if (!resolve([a, b])){ swap = {a, b, t: 0, back: true}; tone(260, 220, .08, "sine", .08); }
          else swap = null; } }
      if (fall){ let moving = false;
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++){ const g = bd[r][c]; if (g && g.oy < 0){ g.vy = (g.vy || 0) + 1.6; g.oy = Math.min(0, g.oy + g.vy); if (g.oy < 0) moving = true; else g.vy = 0; } }
        if (!moving){ fall = false; if (!resolve(null)){ busy = false; } } }
      if (!busy){ idle++; if (idle === 300) hint = anyMove(); if (time <= 0){ over = 60; PZ.praise(fx, W/2, BY + C*4, "시간 끝!", "#fff", 1); SFX.gold(); } }
      PZ.stepParts(parts); PZ.stepFx(fx);
    },
    draw(g){
      G2.bg(g, "jmbg" + W, W, H, t => { PZ.wall(t, W, H, "#e7e5ff", "#ffe0f0", "rgba(255,255,255,.55)");
        t.fillStyle = "rgba(255,255,255,.65)"; rrect(t, BX - 14, BY - 14, C*N + 28, C*N + 28, 30); t.fill();
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++){ t.fillStyle = (r + c) % 2 ? "rgba(214,204,255,.45)" : "rgba(255,230,245,.6)"; rrect(t, BX + c*C + 3, BY + r*C + 3, C - 6, C - 6, 16); t.fill(); } });
      if (sel){ g.fillStyle = "rgba(255,255,255,.85)"; rrect(g, BX + sel[1]*C + 2, BY + sel[0]*C + 2, C - 4, C - 4, 18); g.fill(); }
      if (hint && !busy){ const a = .35 + .3*Math.sin(NG.frame*.15); g.strokeStyle = `rgba(255,255,255,${a + .3})`; g.lineWidth = 5; hint.forEach(([r, c]) => { rrect(g, BX + c*C + 4, BY + r*C + 4, C - 8, C - 8, 16); g.stroke(); }); }
      g.save(); g.beginPath(); g.rect(BX - 6, BY - 6, C*N + 12, C*N + 12); g.clip();
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++){ const gm = bd[r][c]; if (!gm) continue;
        let x = BX + c*C, y = BY + r*C + gm.oy;
        if (swap){ const e = swap.t < .5 ? 2*swap.t*swap.t : 1 - 2*(1 - swap.t)**2, tt = swap.back ? 1 - e : e;
          const {a, b} = swap; if (r === a[0] && c === a[1]){ x += (b[1] - a[1])*C*tt; y += (b[0] - a[0])*C*tt; } else if (r === b[0] && c === b[1]){ x += (a[1] - b[1])*C*tt; y += (a[0] - b[0])*C*tt; } }
        const s = spr(gm.v, gm.bomb); if (sel && sel[0] === r && sel[1] === c){ const z = 1 + .06*Math.sin(NG.frame*.25); g.drawImage(s, x + C*(1 - z)/2, y + C*(1 - z)/2, C*z, C*z); }
        else G2.put(g, s, x, y); }
      g.restore();
      PZ.drawParts(g, parts);
      // 위: 점수 · 시간 막대
      outlined(g, `${score}`, W/2, 74, 62, "#fff", "rgba(110,70,170,.9)");
      outlined(g, `👑 ${Math.max(best, score)}`, 100, 60, 24, "#ffe066", "rgba(110,70,170,.9)");
      const sec = Math.ceil(time/60), bw = W - 120;
      g.fillStyle = "rgba(110,70,170,.25)"; rrect(g, 60, 150, bw, 26, 13); g.fill();
      g.fillStyle = sec <= 10 ? "#ff6b81" : "#b197fc"; rrect(g, 63, 153, Math.max(20, (bw - 6)*time/TIME), 20, 10); g.fill();
      outlined(g, `⏰ ${sec}초`, W - 90, 74, 26, sec <= 10 ? "#ffa8a8" : "#fff", "rgba(110,70,170,.9)");
      if (combo >= 2) outlined(g, `🔥 ${combo}연속`, W/2, 210, 28, "#ffa94d", "rgba(110,70,170,.9)");
      PZ.drawFx(g, fx);
      if (score === 0 && !busy) outlined(g, "보석을 옆 칸으로 밀어서 같은 보석 3개를 한 줄로!", W/2, BY + C*N + 48, 23, "#fff", "rgba(110,70,170,.9)");
    },
    hud(){ return `💎 <b>${score}</b>점 · ⏰ ${Math.ceil(time/60)}초`; }
  };
};

/* =====================================================================
   🧪 색깔 물 정렬 — 병마다 한 가지 색만 남게 물을 옮겨 담아요 (150초 동안 몇 판?)
   ===================================================================== */
NG.defs.ws = () => {
  const CAP = 4, TIME = 150*60;
  const COL = ["#ff6fa5", "#a06bff", "#4dabf7", "#2fd3a3", "#ffd43b", "#ff922b", "#ff5c5c", "#94d82d", "#5c7cfa", "#e599f7"];
  let W = 720, H = 1080, land = false, tubes, pos, sel, pours, hist, level, score, time, fx, parts, over, done, best, solvedT;
  function layout(sw, sh){ land = sw/Math.max(1, sh) >= 1.1; if (land){ W = 1280; H = 760; } else { W = 720; H = 1080; } if (tubes) place(); }
  const TW = 78, TH = 300;
  function place(){
    const n = tubes.length, perRow = land ? Math.min(n, 9) : Math.min(n, n > 6 ? Math.ceil(n/2) : n), rows = Math.ceil(n/perRow);
    const gap = Math.min(land ? 128 : 120, (W - 40)/perRow), top = land ? 250 : (rows > 1 ? 280 : 420);
    pos = tubes.map((_, i) => { const r = Math.floor(i/perRow), k = i % perRow, cnt = Math.min(perRow, n - r*perRow); return {x: W/2 + (k - (cnt - 1)/2)*gap, y: top + r*(TH + 90)}; });
  }
  // 풀 수 있는지 확인(작은 탐색) — 못 풀면 다시 섞어요
  function solvable(ts){
    const seen = new Set(); let nodes = 0;
    const key = s => s.map(t => t.join("")).sort().join("|");
    const dfs = s => { if (++nodes > 25000) return false; if (s.every(t => !t.length || (t.length === CAP && t.every(v => v === t[0])))) return true;
      const k = key(s); if (seen.has(k)) return false; seen.add(k);
      for (let a = 0; a < s.length; a++){ const A = s[a]; if (!A.length || (A.length === CAP && A.every(v => v === A[0]))) continue; const top = A[A.length - 1];
        let run = 0; for (let i = A.length - 1; i >= 0 && A[i] === top; i--) run++;
        for (let b = 0; b < s.length; b++){ if (a === b) continue; const B2 = s[b]; if (B2.length >= CAP || (B2.length && B2[B2.length - 1] !== top)) continue; if (!B2.length && run === A.length) continue;
          const m = Math.min(run, CAP - B2.length), n = s.map(t => t.slice()); for (let i = 0; i < m; i++) n[b].push(n[a].pop()); if (dfs(n)) return true; } }
      return false; };
    return dfs(ts.map(t => t.slice()));
  }
  function newLevel(){
    const nc = Math.min(COL.length, 3 + level);
    for (let tries = 0; tries < 40; tries++){
      const pool = []; for (let c = 0; c < nc; c++) for (let i = 0; i < CAP; i++) pool.push(c);
      for (let i = pool.length - 1; i > 0; i--){ const j = Math.floor(rnd(i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      const ts = Array.from({length: nc}, (_, i) => pool.slice(i*CAP, i*CAP + CAP)); ts.push([], []);
      if (ts.some(t => t.length === CAP && t.every(v => v === t[0]))) continue;
      if (nc > 7 || solvable(ts)){ tubes = ts; break; }
    }
    sel = -1; pours = []; hist = []; done = new Set(); solvedT = 0; place();
  }
  const isDone = t => t.length === CAP && t.every(v => v === t[0]);
  function pour(a, b){
    const A = tubes[a], B = tubes[b]; if (!A.length || B.length >= CAP || (B.length && B[B.length - 1] !== A[A.length - 1])) return false;
    hist.push(tubes.map(t => t.slice()));
    const col = A[A.length - 1]; let m = 0; while (A.length && A[A.length - 1] === col && B.length < CAP){ B.push(A.pop()); m++; }
    pours.push({a, b, col, t: 22}); tone(400, 700, .18, "sine", .08);
    if (isDone(B) && !done.has(b)){ done.add(b); PZ.pop(parts, pos[b].x, pos[b].y, COL[col], 16); [880, 1175].forEach((f, k) => tone(f, f, .1, "triangle", .1, k*.07)); }
    if (tubes.every(t => !t.length || isDone(t))){ const pts = 100 + level*30 + Math.floor(time/60); score += pts; solvedT = 80; SFX.rec();
      PZ.praise(fx, W/2, land ? 150 : 210, `🎉 ${level + 1}판 성공! +${pts}`, "#ffe066", 1); }
    return true;
  }
  const BTN = () => land ? [{k: "undo", x: 70, y: H - 90, w: 200, h: 70, t: "↩️ 되돌리기"}, {k: "re", x: W - 270, y: H - 90, w: 200, h: 70, t: "🔀 새로 섞기"}]
                         : [{k: "undo", x: 60, y: H - 110, w: 280, h: 80, t: "↩️ 되돌리기"}, {k: "re", x: W - 340, y: H - 110, w: 280, h: 80, t: "🔀 새로 섞기"}];
  const tubeSpr = () => G2.spr("wstube", TW + 16, TH + 20, t => {
    t.fillStyle = "rgba(255,255,255,.35)"; rrect(t, 8, 8, TW, TH, 34); t.fill();
    t.strokeStyle = "rgba(255,255,255,.95)"; t.lineWidth = 5; rrect(t, 8, 8, TW, TH, 34); t.stroke();
    t.fillStyle = "rgba(255,255,255,.5)"; rrect(t, 18, 30, 10, TH - 80, 5); t.fill(); });
  const unitH = (TH - 30)/CAP;
  function drawLiquid(g, x, y, t, lift){
    const ty = y - TH/2 - lift, bot = ty + TH - 8;
    g.save(); g.beginPath(); rrect(g, x - TW/2 + 5, ty + 5, TW - 10, TH - 10, 30); g.clip();
    for (let i = 0; i < t.length; i++){ const yy = bot - (i + 1)*unitH; g.fillStyle = COL[t[i]]; g.fillRect(x - TW/2, yy, TW, unitH + 1);
      g.fillStyle = "rgba(255,255,255,.22)"; g.fillRect(x - TW/2, yy, TW, 6); }
    g.restore();
  }
  return {
    get W(){ return W; }, get H(){ return H; }, maxPx: 2.2e6, layout,
    init(){ level = 0; score = 0; time = TIME; fx = []; parts = []; over = 0; best = ((Store.recs.ws || {})[NG.sids[0]] || {}).best || 0; newLevel(); },
    down(x, y){
      if (over || solvedT) return;
      for (const b of BTN()) if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h){
        if (b.k === "undo" && hist.length){ tubes = hist.pop(); sel = -1; done = new Set(tubes.map((t, i) => isDone(t) ? i : -1).filter(i => i >= 0)); tone(500, 380, .07, "sine", .08); }
        if (b.k === "re"){ newLevel(); tone(600, 900, .1, "triangle", .08); } return; }
      const i = pos.findIndex(p => Math.abs(x - p.x) < TW/2 + 18 && Math.abs(y - p.y) < TH/2 + 30);
      if (i < 0){ sel = -1; return; }
      if (sel < 0){ if (tubes[i].length && !isDone(tubes[i])){ sel = i; tone(700, 760, .04, "sine", .06); } return; }
      if (sel === i){ sel = -1; return; }
      if (!pour(sel, i)){ tone(220, 200, .08, "sine", .08); sel = tubes[i].length && !isDone(tubes[i]) ? i : -1; } else sel = -1;
    },
    step(){
      if (over){ if (--over === 0) NG.over(score, `<div>🧪 ${level}판 성공!</div>`); PZ.stepParts(parts); PZ.stepFx(fx); return; }
      if (time > 0 && !solvedT) time--;
      if (solvedT && --solvedT === 0){ level++; newLevel(); }
      if (time <= 0 && !solvedT){ over = 60; PZ.praise(fx, W/2, 200, "시간 끝!", "#fff", 1); SFX.gold(); }
      for (let i = pours.length - 1; i >= 0; i--) if (--pours[i].t <= 0) pours.splice(i, 1);
      PZ.stepParts(parts); PZ.stepFx(fx);
    },
    draw(g){
      G2.bg(g, `wsbg${W}`, W, H, t => PZ.wall(t, W, H, "#d3f9f0", "#e5dbff", "rgba(255,255,255,.55)"));
      const ts = tubeSpr();
      tubes.forEach((t, i) => { const p = pos[i], lift = sel === i ? 36 : 0;
        drawLiquid(g, p.x, p.y, t, lift);
        G2.put(g, ts, p.x - TW/2 - 8, p.y - TH/2 - lift - 8);
        if (done.has(i)){ g.fillStyle = "#ffd6e7"; rrect(g, p.x - TW/2 + 4, p.y - TH/2 - 22, TW - 8, 22, 8); g.fill(); g.font = `30px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("🎀", p.x, p.y - TH/2 - 26); } });
      for (const q of pours){ const a = pos[q.a], b = pos[q.b], k = q.t/22; g.strokeStyle = COL[q.col]; g.globalAlpha = Math.min(1, k*2); g.lineWidth = 12; g.lineCap = "round";
        g.beginPath(); g.moveTo(a.x, a.y - TH/2 - 30); g.quadraticCurveTo((a.x + b.x)/2, Math.min(a.y, b.y) - TH/2 - 120, b.x, b.y - TH/2); g.stroke(); g.globalAlpha = 1; }
      PZ.drawParts(g, parts);
      for (const b of BTN()){ g.fillStyle = "rgba(255,255,255,.75)"; rrect(g, b.x, b.y, b.w, b.h, 24); g.fill(); g.strokeStyle = "rgba(160,107,255,.6)"; g.lineWidth = 3; g.stroke();
        outlined(g, b.t, b.x + b.w/2, b.y + b.h/2, 28, "#7048e8", "rgba(255,255,255,.95)"); }
      const sec = Math.ceil(time/60);
      outlined(g, `${score}`, W/2, 64, 58, "#fff", "rgba(80,90,170,.9)");
      outlined(g, `${level + 1}판`, land ? 90 : 80, 60, 30, "#fff", "rgba(80,90,170,.9)");
      outlined(g, `⏰ ${sec}초`, W - (land ? 110 : 90), 60, 28, sec <= 15 ? "#ffa8a8" : "#fff", "rgba(80,90,170,.9)");
      outlined(g, `👑 ${Math.max(best, score)}`, W/2 + 150, 64, 24, "#ffe066", "rgba(80,90,170,.9)");
      PZ.drawFx(g, fx);
      if (level === 0 && !hist.length) outlined(g, "병을 톡 → 다른 병을 톡! 위에 있는 같은 색끼리 옮겨 담아요", W/2, land ? 130 : 175, land ? 24 : 21, "#fff", "rgba(80,90,170,.9)");
    },
    hud(){ return `🧪 <b>${score}</b>점 · ${level + 1}판 · ⏰ ${Math.ceil(time/60)}초`; }
  };
};
