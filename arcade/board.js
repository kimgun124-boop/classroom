/* =====================================================================
   ♟️ 보드 게임 4종: 🀄 장기 · ♟️ 체스 · ⚫ 오목 · 🎱 당구
   - 🧒 한 기기에서 둘이 / 🤖 컴퓨터와 / 🌐 다른 기기 친구와 (대결 신청 그대로)
   - 다른 기기와는 '한 수'만 주고받아요 → 아주 가벼워요. 기기끼리 바로 연결이 안 되면
     Firebase 쪽지(다리)로 주고받아요 (NET.goRelay) → 학교 와이파이에서도 끊기지 않게
   - 화면은 바뀐 게 있을 때만 다시 그려요 (렉 없이)
   ===================================================================== */
NG.tie = function(txt){
  if (this.ended) return; this.ended = true; SFX.over();
  $("#ngOver").innerHTML = `<div class="ng-box"><span class="f">🤝</span><h3>비겼어요!</h3><div class="sc">${txt}</div><div class="info">비긴 판은 랭킹에 들어가지 않아요</div>
    <div class="arc-row"><button class="arc-btn p" data-ng="again">🔁 한 판 더</button><button class="arc-btn" data-ng="home">🏠 홈으로</button></div></div>`;
  $("#ngOver").hidden = false;
};
const BD_FONT = `"Jua","Gowun Dodum",sans-serif`;
function bdBtn(g, b, on){
  g.save(); rrect(g, b.x, b.y, b.w, b.h, 14); g.fillStyle = b.off ? "rgba(255,255,255,.12)" : on ? "#ffd43b" : b.p ? "#7950f2" : "rgba(255,255,255,.18)"; g.fill();
  g.lineWidth = 2; g.strokeStyle = "rgba(255,255,255,.35)"; g.stroke(); g.restore();
  outlined(g, b.t, b.x + b.w/2, b.y + b.h/2, Math.min(26, b.h*.48), b.off ? "#aaa" : "#fff");
}

/* ---------- 공통 진행 틀: 차례·무르기·기권·컴퓨터·다른 기기 ---------- */
function bdCtl(gid, G){
  let W = 1280, H = 760, land = true, Bx, Px = [], btns = [], ui = null, dirty = true, hist = [], aiBusy = false, endShown = false, banner = null, flip = false, sel = 0;
  const net = () => NG.opt.net, mine = () => net() === "guest" ? 1 : 0, cpu = () => !!NG.opt.cpu, lv = () => NG.opt.lv ?? 1;
  const busy = () => !!(G.busy && G.busy());
  const canMove = () => !NG.ended && !endShown && !busy() && (net() ? G.turn() === mine() : cpu() ? G.turn() === 0 : true);
  const say = (t, c, k = 90) => { banner = {t, c, k}; dirty = true; };
  G.ctl = {say, dirty: () => { dirty = true; }, mine, net, cpu, canMove, sent: d => { if (net()) NET.sendR({t: "bd", d}); }, check: () => checkEnd()};
  function play(mv, from){
    if (!G.apply(mv)) return false;
    hist.push(mv); dirty = true;
    if (net() && from === "me") NET.sendR({t: "bd", d: {n: hist.length, mv}});
    const s = G.status && G.status(); if (s) say(s.t, s.c);
    checkEnd(); return true;
  }
  function checkEnd(){
    const o = G.over(); if (!o || endShown) return; endShown = true; dirty = true;
    say(o.w < 0 ? "🤝 비겼어요!" : `🏆 ${G.names[o.w]} 승리!`, "#ffe066", 999);
    setTimeout(() => { if (NG.cur !== def) return; o.w < 0 ? NG.tie(o.txt) : NG.win(o.w, o.txt); }, 1300);
  }
  function replay(L){ G.reset(); hist = []; endShown = false; L.forEach(m => { if (G.apply(m)) hist.push(m); }); if (G.settle) G.settle(); dirty = true; checkEnd(); }
  function undo(){
    if (!hist.length || busy()) return;
    const L = hist.slice(); L.pop(); if (cpu()) while (L.length && (G.reset(), L.forEach(m => G.apply(m)), G.turn() !== 0)) L.pop();
    replay(L); say("↩️ 한 수 물렀어요", "#a5d8ff", 50); SFX.pt();
  }
  function resign(){
    if (NG.ended || endShown) return;
    const s = net() ? mine() : cpu() ? 0 : G.turn();
    if (!confirm(`${G.names[s]} 쪽이 기권할까요? (상대가 이겨요)`)) return;
    if (net()) NET.sendR({t: "bd", d: {rs: s}});
    doResign(s);
  }
  function doResign(s){ if (endShown) return; G.resigned = {w: 1 - s, txt: `🏳️ ${G.names[s]} 기권`}; checkEnd(); }
  function layout(w, h){
    land = w >= h*1.02;
    if (land){ H = 760; W = Math.round(Math.max(1060, Math.min(1700, H*w/Math.max(1, h)))); }
    else { W = 760; H = Math.round(Math.max(1080, Math.min(1700, W*h/Math.max(1, w)))); }
    def.W = W; def.H = H;
    const ar = G.ar;
    let ax, ay, aw, ah;
    if (land){ const pw = 320; ax = 16; ay = 16; aw = W - pw - 40; ah = H - 32; }
    else { ax = 12; ay = 150; aw = W - 24; ah = H - 150 - 260; }
    let bw = aw, bh = bw/ar; if (bh > ah){ bh = ah; bw = bh*ar; }
    Bx = {x: ax + (aw - bw)/2, y: ay + (ah - bh)/2, w: bw, h: bh};
    // 선수 카드·단추·게임별 칸
    if (land){ const px = W - 320 - 8, pw = 320;
      Px = [{x: px, y: 16, w: pw, h: 150}, {x: px, y: H - 166, w: pw, h: 150}];   // [위쪽 선수, 아래쪽 선수]
      ui = G.uiH ? {x: px, y: 180, w: pw, h: G.uiH} : null;
      const by = (ui ? ui.y + ui.h + 10 : 190); btns = [{id: "undo", t: "↩️ 무르기", x: px, y: by, w: pw/2 - 6, h: 58}, {id: "give", t: "🏳️ 기권", x: px + pw/2 + 6, y: by, w: pw/2 - 6, h: 58}];
    } else {
      Px = [{x: 12, y: 10, w: W - 24, h: 130}, {x: 12, y: H - 250, w: W - 24, h: 130}];
      ui = G.uiH ? {x: 12, y: H - 112, w: W - 24 - 260, h: 100} : null;
      const bx = ui ? W - 12 - 250 : 12, bw2 = ui ? 250 : W - 24;
      btns = [{id: "undo", t: "↩️ 무르기", x: bx, y: H - 112, w: bw2/2 - 6, h: 100}, {id: "give", t: "🏳️ 기권", x: bx + bw2/2 + 6, y: H - 112, w: bw2/2 - 6, h: 100}];
    }
    if (!G.undoOK || net()){ const a = btns[0], z = btns[1]; z.x = a.x; z.w = z.w*2 + 12; btns = [z]; }
    dirty = true;
  }
  function card(g, R, side){
    const on = G.turn() === side && !endShown, sid = NG.sids[side], isCpu = cpu() && side === 1;
    g.save(); rrect(g, R.x, R.y, R.w, R.h, 20); g.fillStyle = on ? "rgba(255,212,59,.22)" : "rgba(255,255,255,.08)"; g.fill();
    g.lineWidth = on ? 5 : 2; g.strokeStyle = on ? "#ffd43b" : "rgba(255,255,255,.2)"; g.stroke(); g.restore();
    const fr = Math.min(46, R.h*.34), fx = R.x + 16 + fr, fy = R.y + R.h/2;
    if (isCpu){ outlined(g, "🤖", fx, fy, fr*1.4); } else if (sid) try { faceAt(g, sid, fx, fy, fr, on ? "#ffd43b" : null); } catch(e) {}
    G.chip(g, fx + fr*.75, fy + fr*.7, fr*.5, side);
    const nm = isCpu ? `🤖 컴퓨터` : (sid ? who(noOf_(sid)) : "") + (net() && side === mine() ? " (나)" : "");
    g.save(); g.textAlign = "left"; outlined(g, nm.length > 12 ? nm.slice(0, 12) + "…" : nm, fx + fr + 14, fy - R.h*.18, Math.min(30, R.h*.22), "#fff", undefined, "left");
    outlined(g, `${G.names[side]}${on ? " · 차례!" : ""}`, fx + fr + 14, fy + R.h*.06, Math.min(24, R.h*.18), on ? "#ffe066" : "#d0bfff", undefined, "left");
    let ex = G.cardTxt ? G.cardTxt(side) : ""; if (ex.length > 20) ex = ex.slice(0, 19) + "…"; if (ex) outlined(g, ex, fx + fr + 14, fy + R.h*.28, Math.min(20, R.h*.15), "#c5f6fa", undefined, "left");
    g.restore();
  }
  const def = {
    W, H, maxSteps: 4,
    layout, netBd: null,
    init(){ G.reset(); hist = []; endShown = false; banner = null; flip = !!(net() && mine() === 1 && !G.noFlip);
      def.netBd = {bd: d => onNet(d)};
      const first = net() ? (mine() === 0 ? "내가 먼저!" : "친구가 먼저 해요") : cpu() ? "내가 먼저!" : `${G.names[0]} 먼저!`;
      say(`${GAME[gid].e} ${GAME[gid].n}`, "#fff", 80); setTimeout(() => { if (NG.cur === def && !endShown) say(first, "#ffe066", 70); }, 1300);
      dirty = true; },
    step(){
      if (G.step && G.step()) dirty = true;
      if (banner && banner.k < 900 && --banner.k <= 0){ banner = null; dirty = true; }
      if (banner) dirty = true;
      if (cpu() && !endShown && !NG.ended && G.turn() === 1 && !aiBusy && !busy()){
        aiBusy = true; const t0 = performance.now();
        setTimeout(() => { if (NG.cur !== def) return; G.ai(lv(), mv => { const wait = Math.max(0, 500 - (performance.now() - t0));
          setTimeout(() => { aiBusy = false; if (NG.cur === def && mv != null && !endShown) play(mv, "ai"); }, wait); }); }, 60);
      }
    },
    draw(g){
      if (!dirty) return; dirty = false;
      g.clearRect(0, 0, W, H);
      const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#241a52"); bg.addColorStop(1, "#140f2e"); g.fillStyle = bg; g.fillRect(0, 0, W, H);
      G.draw(g, Bx, flip, canMove());
      const top = flip ? 0 : 1; card(g, Px[0], top); card(g, Px[1], 1 - top);
      if (ui && G.drawUI) G.drawUI(g, ui, canMove());
      btns.forEach(b => bdBtn(g, b, false));
      if (banner){ const a = Math.min(1, banner.k/15); g.globalAlpha = banner.k >= 900 ? 1 : a;
        g.fillStyle = "rgba(10,6,30,.55)"; g.fillRect(Bx.x, Bx.y + Bx.h/2 - 46, Bx.w, 92); outlined(g, banner.t, Bx.x + Bx.w/2, Bx.y + Bx.h/2, Math.min(52, Bx.w/12), banner.c || "#fff"); g.globalAlpha = 1; }
      else if (net() && !canMove() && !endShown && !busy()){ g.fillStyle = "rgba(10,6,30,.6)"; g.fillRect(Bx.x, Bx.y + Bx.h - 46, Bx.w, 40); outlined(g, "⏳ 친구 차례예요 · 기다려요", Bx.x + Bx.w/2, Bx.y + Bx.h - 26, 24, "#d0bfff"); }
    },
    down(x, y){
      if (NG.ended) return;
      for (const b of btns) if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h){ if (b.off) return; if (b.id === "undo") undo(); else resign(); return; }
      if (ui && G.uiDown && x >= ui.x && x <= ui.x + ui.w && y >= ui.y && y <= ui.y + ui.h){ sel = 2; G.uiDown(x, y, ui, canMove()); dirty = true; return; }
      sel = 1;
      const mv = G.down(x, y, Bx, flip, canMove()); dirty = true;
      if (mv != null && canMove()) play(mv, "me");
    },
    move(x, y){ if (sel === 2 && G.uiMove){ G.uiMove(x, y, ui); dirty = true; } else if (sel === 1 && G.move){ G.move(x, y, Bx, flip, canMove()); dirty = true; } },
    up(x, y){ const s = sel; sel = 0; let mv = null;
      if (s === 2 && G.uiUp) mv = G.uiUp(x, y, ui, canMove()); else if (s === 1 && G.up) mv = G.up(x, y, Bx, flip, canMove());
      dirty = true; if (mv != null && canMove()) play(mv, "me"); },
    key(code, d){ if (!d) { if (G.keyUp){ const mv = G.keyUp(code, canMove()); dirty = true; if (mv != null && canMove()) play(mv, "me"); } return false; }
      if (code === "Escape") return false;
      if (G.key && G.key(code, canMove())){ dirty = true; return true; } return false; },
    destroy(){},
    dbg: {G, play: mv => play(mv, "me"), hist: () => hist}
  };
  function onNet(d){
    if (d.rs != null){ doResign(d.rs); return; }
    if (d.need){ NET.sendR({t: "bd", d: G.snap ? {sync: G.snap(), n: hist.length} : {hist}}); return; }
    if (d.hist){ if (d.hist.length >= hist.length) replay(d.hist); return; }
    if (d.sync){ G.sync(d.sync); while (hist.length < d.n) hist.push(0); dirty = true; checkEnd(); return; }
    if (d.mv != null){
      if (d.n === hist.length + 1) play(d.mv, "net");
      else if (d.n > hist.length + 1) NET.sendR({t: "bd", d: {need: 1}});
    }
  }
  return def;
}

/* =====================================================================
   ⚫ 오목 — 15줄, 다섯 개 먼저 한 줄로 (자유 오목). 두 번 톡톡 눌러야 놓여요(실수 방지)
   ===================================================================== */
NG.defs.om = () => {
  const N = 15; let b, turn, last, win, line, pend = -1, moves = 0;
  const DIR = [[1, 0], [0, 1], [1, 1], [1, -1]];
  const at = (x, y) => x < 0 || y < 0 || x >= N || y >= N ? -1 : b[y*N + x];
  function five(i){ const x = i % N, y = Math.floor(i/N), c = b[i];
    for (const [dx, dy] of DIR){ const L = [i]; let k = 1; while (at(x + dx*k, y + dy*k) === c){ L.push((y + dy*k)*N + x + dx*k); k++; } k = 1; while (at(x - dx*k, y - dy*k) === c){ L.push((y - dy*k)*N + x - dx*k); k++; } if (L.length >= 5) return L; }
    return null; }
  /* 🤖 컴퓨터: 놓았을 때 생기는 줄(열린 3·4 등)을 점수로 */
  function lineScore(x, y, c){
    let s = 0;
    for (const [dx, dy] of DIR){
      let n = 1, o = 0, k = 1, gap = 0;
      while (at(x + dx*k, y + dy*k) === c){ n++; k++; } if (at(x + dx*k, y + dy*k) === 0){ o++; if (at(x + dx*(k + 1), y + dy*(k + 1)) === c) gap++; }
      k = 1; while (at(x - dx*k, y - dy*k) === c){ n++; k++; } if (at(x - dx*k, y - dy*k) === 0){ o++; if (at(x - dx*(k + 1), y - dy*(k + 1)) === c) gap++; }
      s += n >= 5 ? 1e7 : n === 4 ? (o === 2 ? 2e5 : o ? 2.2e4 : 0) : n === 3 ? (o === 2 ? 1.2e4 : o ? 600 : 0) + gap*2000 : n === 2 ? (o === 2 ? 300 : o ? 30 : 0) + gap*250 : (o === 2 ? 12 : o ? 3 : 0);
    }
    return s;
  }
  const G = {
    ar: 1, names: ["⚫ 흑돌", "⚪ 백돌"], undoOK: true, noFlip: true,
    reset(){ b = new Int8Array(N*N); turn = 0; last = -1; win = null; line = null; pend = -1; moves = 0; this.resigned = null; },
    turn: () => turn,
    apply(mv){ mv = +mv; if (win || !(mv >= 0 && mv < N*N) || b[mv]) return false;
      b[mv] = turn + 1; last = mv; moves++; pend = -1; const L = five(mv); SFX.pong();
      if (L){ line = L; win = {w: turn, txt: `${this.names[turn]} 다섯 개 완성!`}; }
      else if (moves >= N*N) win = {w: -1, txt: "판이 가득 찼어요"};
      turn ^= 1; return true; },
    over(){ return this.resigned || win; },
    status(){ return null; },
    cardTxt: s => `놓은 돌 ${b.reduce((a, v) => a + (v === s + 1 ? 1 : 0), 0)}개`,
    chip(g, x, y, r, s){ g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = s ? "#f8f9fa" : "#212529"; g.fill(); g.lineWidth = 2; g.strokeStyle = s ? "#868e96" : "#868e96"; g.stroke(); },
    down(x, y, B, flip, can){ if (!can) return null;
      const c = B.w/N, i = Math.floor((x - B.x)/c), j = Math.floor((y - B.y)/c); if (i < 0 || j < 0 || i >= N || j >= N) return null;
      const k = j*N + i; if (b[k]) return null;
      if (pend === k){ return k; } pend = k; tone(900, 900, .03, "sine", .05); return null; },
    draw(g, B, flip, can){
      const c = B.w/N;
      g.save(); rrect(g, B.x - 8, B.y - 8, B.w + 16, B.h + 16, 14); const wd = g.createLinearGradient(B.x, B.y, B.x + B.w, B.y + B.h); wd.addColorStop(0, "#f2c879"); wd.addColorStop(1, "#d9a24e"); g.fillStyle = wd; g.fill();
      g.strokeStyle = "rgba(60,35,10,.8)"; g.lineWidth = 1.6;
      for (let i = 0; i < N; i++){ g.beginPath(); g.moveTo(B.x + c/2, B.y + c/2 + i*c); g.lineTo(B.x + B.w - c/2, B.y + c/2 + i*c); g.stroke(); g.beginPath(); g.moveTo(B.x + c/2 + i*c, B.y + c/2); g.lineTo(B.x + c/2 + i*c, B.y + B.h - c/2); g.stroke(); }
      g.fillStyle = "rgba(60,35,10,.9)"; [[3, 3], [11, 3], [7, 7], [3, 11], [11, 11]].forEach(([i, j]) => { g.beginPath(); g.arc(B.x + c/2 + i*c, B.y + c/2 + j*c, c*.12, 0, 7); g.fill(); });
      const st = (i, v, a) => { const x = B.x + c/2 + (i % N)*c, y = B.y + c/2 + Math.floor(i/N)*c, r = c*.44; g.globalAlpha = a;
        const gr = g.createRadialGradient(x - r*.35, y - r*.35, r*.1, x, y, r); if (v === 1){ gr.addColorStop(0, "#666"); gr.addColorStop(1, "#111"); } else { gr.addColorStop(0, "#fff"); gr.addColorStop(1, "#cfd4da"); }
        g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = gr; g.fill(); g.lineWidth = 1; g.strokeStyle = "rgba(0,0,0,.35)"; g.stroke(); g.globalAlpha = 1; };
      for (let i = 0; i < N*N; i++) if (b[i]) st(i, b[i], 1);
      if (last >= 0){ const x = B.x + c/2 + (last % N)*c, y = B.y + c/2 + Math.floor(last/N)*c; g.beginPath(); g.arc(x, y, c*.13, 0, 7); g.fillStyle = "#ff4757"; g.fill(); }
      if (line){ g.strokeStyle = "#ff4757"; g.lineWidth = c*.16; g.lineCap = "round"; const p = i => [B.x + c/2 + (i % N)*c, B.y + c/2 + Math.floor(i/N)*c]; const s = line.map(p).sort((a, z) => a[0] - z[0] || a[1] - z[1]); g.beginPath(); g.moveTo(...s[0]); g.lineTo(...s[s.length - 1]); g.stroke(); }
      if (pend >= 0 && can && !b[pend]){ st(pend, turn + 1, .55); const x = B.x + c/2 + (pend % N)*c, y = B.y + c/2 + Math.floor(pend/N)*c; outlined(g, "한 번 더 톡!", x, y - c*.85, Math.max(14, c*.42), "#ffe066"); }
      g.restore();
    },
    ai(lv, done){
      if (!moves){ done(7*N + 7); return; }
      const me = turn + 1, op = 3 - me, C = [];
      for (let i = 0; i < N*N; i++){ if (b[i]) continue; const x = i % N, y = Math.floor(i/N); let near = false;
        for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) if (at(x + dx, y + dy) > 0){ near = true; break; }
        if (!near) continue; const a = lineScore(x, y, me), d = lineScore(x, y, op);
        C.push({i, s: a*(lv === 2 ? 1.1 : 1) + d*(lv === 0 ? .6 : .95) + Math.random()*(lv === 0 ? 400 : lv === 1 ? 40 : 5)}); }
      C.sort((p, q) => q.s - p.s);
      const pick = lv === 0 && Math.random() < .35 && C[0].s < 1e5 ? C[Math.floor(Math.random()*Math.min(5, C.length))] : C[0];
      done(pick ? pick.i : -1);
    }
  };
  return bdCtl("om", G);
};

/* =====================================================================
   ♟️ 체스 — 캐슬링·앙파상·체크메이트 다 돼요. 폰이 끝까지 가면 저절로 퀸!
   ===================================================================== */
const CH_V = {p: 100, n: 320, b: 335, r: 500, q: 900, k: 0};
const CH_G = {k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟"};
const CH_N = {k: "킹", q: "퀸", r: "룩", b: "비숍", n: "나이트", p: "폰"};
const BDSPR = new Map();
function bdGlyph(ch, white, s){
  const key = ch + white + s; let c = BDSPR.get(key); if (c) return c;
  if (BDSPR.size > 200) BDSPR.clear();
  c = document.createElement("canvas"); c.width = c.height = Math.ceil(s*1.2); const x = c.getContext("2d");
  x.font = `${Math.round(s)}px "Segoe UI Symbol","Noto Sans Symbols 2","Noto Sans Symbols2","DejaVu Sans","Arial Unicode MS",serif`; x.textAlign = "center"; x.textBaseline = "middle";
  const t = CH_G[ch] + "︎", cx = c.width/2, cy = c.height*.53;
  x.lineJoin = "round"; x.lineWidth = s*.09; x.strokeStyle = white ? "#212529" : "#f1f3f5"; x.strokeText(t, cx, cy);
  x.fillStyle = white ? "#ffffff" : "#212529"; x.fillText(t, cx, cy);
  BDSPR.set(key, c); return c;
}
NG.defs.ch = () => {
  let b, turn, cast, ep, half, last, selQ = -1, tgts = [], win = null, chk = false, capd = [[], []], plies = 0, anim = null, a3 = false;   // 🧊 anim: 말이 움직이는 모습(3D)
  const side = p => p ? (p === p.toUpperCase() ? 0 : 1) : -1, low = p => p.toLowerCase();
  const rc = i => [i >> 3, i & 7], on = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  const KN = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]], KG = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
  function attacked(sq, by){
    const [r, c] = rc(sq), P = by ? "p" : "P", pr = by ? r - 1 : r + 1;
    for (const dc of [-1, 1]) if (on(pr, c + dc) && b[pr*8 + c + dc] === P) return true;
    const Nn = by ? "n" : "N", Kk = by ? "k" : "K", Q = by ? "q" : "Q", R = by ? "r" : "R", Bb = by ? "b" : "B";
    for (const [dr, dc] of KN) if (on(r + dr, c + dc) && b[(r + dr)*8 + c + dc] === Nn) return true;
    for (const [dr, dc] of KG) if (on(r + dr, c + dc) && b[(r + dr)*8 + c + dc] === Kk) return true;
    for (const [dr, dc] of KG){ let k = 1; while (on(r + dr*k, c + dc*k)){ const p = b[(r + dr*k)*8 + c + dc*k]; if (p){ if (p === Q || (dr && dc ? p === Bb : p === R)) return true; break; } k++; } }
    return false;
  }
  const kingSq = s => b.indexOf(s ? "k" : "K");
  function pseudo(s){
    const M = [];
    for (let i = 0; i < 64; i++){ const p = b[i]; if (!p || side(p) !== s) continue; const t = low(p), [r, c] = rc(i);
      const add = (j, f) => { const q = b[j]; if (q && side(q) === s) return false; M.push({f: i, t: j, c: q || "", ...f}); return !q; };
      if (t === "p"){ const d = s ? 1 : -1, sr = s ? 1 : 6, lr = s ? 7 : 0;
        if (on(r + d, c) && !b[(r + d)*8 + c]){ M.push({f: i, t: (r + d)*8 + c, c: "", pr: r + d === lr ? 1 : 0}); if (r === sr && !b[(r + 2*d)*8 + c]) M.push({f: i, t: (r + 2*d)*8 + c, c: "", dbl: 1}); }
        for (const dc of [-1, 1]) if (on(r + d, c + dc)){ const j = (r + d)*8 + c + dc, q = b[j]; if (q && side(q) !== s) M.push({f: i, t: j, c: q, pr: r + d === lr ? 1 : 0}); else if (j === ep) M.push({f: i, t: j, c: s ? "P" : "p", ep: 1}); } }
      else if (t === "n" || t === "k"){ for (const [dr, dc] of (t === "n" ? KN : KG)) if (on(r + dr, c + dc)) add((r + dr)*8 + c + dc);
        if (t === "k"){ const hr = s ? 0 : 7; if (i === hr*8 + 4){
          if (cast[s*2] && !b[hr*8 + 5] && !b[hr*8 + 6] && b[hr*8 + 7] === (s ? "r" : "R") && !attacked(i, 1 - s) && !attacked(i + 1, 1 - s) && !attacked(i + 2, 1 - s)) M.push({f: i, t: i + 2, c: "", cs: 1});
          if (cast[s*2 + 1] && !b[hr*8 + 3] && !b[hr*8 + 2] && !b[hr*8 + 1] && b[hr*8] === (s ? "r" : "R") && !attacked(i, 1 - s) && !attacked(i - 1, 1 - s) && !attacked(i - 2, 1 - s)) M.push({f: i, t: i - 2, c: "", cs: 2}); } } }
      else { const D = t === "r" ? KG.filter(d => !d[0] || !d[1]) : t === "b" ? KG.filter(d => d[0] && d[1]) : KG;
        for (const [dr, dc] of D){ let k = 1; while (on(r + dr*k, c + dc*k)){ if (!add((r + dr*k)*8 + c + dc*k)) break; k++; } } }
    }
    return M;
  }
  function make(m){
    const U = {m, cast: cast.slice(), ep, half, p: b[m.f]}; const p = b[m.f], s = side(p);
    b[m.t] = m.pr ? (s ? "q" : "Q") : p; b[m.f] = "";
    if (m.ep){ U.epSq = m.t + (s ? -8 : 8); b[U.epSq] = ""; }
    if (m.cs){ const hr = s ? 0 : 7; if (m.cs === 1){ b[hr*8 + 5] = b[hr*8 + 7]; b[hr*8 + 7] = ""; } else { b[hr*8 + 3] = b[hr*8]; b[hr*8] = ""; } }
    ep = m.dbl ? (m.f + m.t)/2 : -1;
    if (low(p) === "k"){ cast[s*2] = cast[s*2 + 1] = 0; }
    [[63, 0], [56, 1], [7, 2], [0, 3]].forEach(([q, ci]) => { if (m.f === q || m.t === q) cast[ci] = 0; });
    half = low(p) === "p" || m.c ? 0 : half + 1;
    turn ^= 1; return U;
  }
  function unmake(U){
    const m = U.m, s = side(U.p); turn ^= 1;
    b[m.f] = U.p; b[m.t] = m.ep ? "" : m.c; if (m.ep) b[U.epSq] = m.c;
    if (m.cs){ const hr = s ? 0 : 7; if (m.cs === 1){ b[hr*8 + 7] = b[hr*8 + 5]; b[hr*8 + 5] = ""; } else { b[hr*8] = b[hr*8 + 3]; b[hr*8 + 3] = ""; } }
    cast = U.cast; ep = U.ep; half = U.half;
  }
  function legal(s){ return pseudo(s).filter(m => { const U = make(m); const ok = !attacked(kingSq(s), 1 - s); unmake(U); return ok; }); }
  const PST = i => { const [r, c] = rc(i); return 6 - (Math.abs(3.5 - r) + Math.abs(3.5 - c))*1.5; };
  function evalS(s){ let v = 0; for (let i = 0; i < 64; i++){ const p = b[i]; if (!p) continue; const t = low(p); let x = CH_V[t] + (t === "n" || t === "b" ? PST(i)*2 : t === "p" ? (side(p) ? (i >> 3) : 7 - (i >> 3))*6 + PST(i) : t === "q" ? PST(i)*.5 : 0); v += side(p) === s ? x : -x; } return v; }
  function search(d, al, be, s){
    if (d === 0) return evalS(s);
    const M = pseudo(s); M.sort((x, y) => (y.c ? CH_V[low(y.c)] : 0) - (x.c ? CH_V[low(x.c)] : 0));
    let best = -1e9, any = false;
    for (const m of M){ if (m.c && low(m.c) === "k") return 1e6; const U = make(m); if (attacked(kingSq(s), 1 - s)){ unmake(U); continue; } any = true;
      const v = -search(d - 1, -be, -al, 1 - s); unmake(U); if (v > best) best = v; if (v > al) al = v; if (al >= be) break; }
    if (!any) return attacked(kingSq(s), 1 - s) ? -1e5 - d : 0;
    return best;
  }
  const G = {
    ar: 1.22, names: ["⚪ 흰색", "⚫ 검은색"], undoOK: true,   // 🧊 3D 판은 비스듬히 보여서 옆으로 조금 넓게
    reset(){ b = "rnbqkbnrpppppppp".split("").concat(Array(32).fill(""), "PPPPPPPPRNBQKBNR".split("")); turn = 0; cast = [1, 1, 1, 1]; ep = -1; half = 0; last = null; selQ = -1; tgts = []; win = null; chk = false; capd = [[], []]; plies = 0; anim = null; this.resigned = null; },
    turn: () => turn,
    apply(mv){ const L = legal(turn), m = L.find(x => x.f === mv[0] && x.t === mv[1]); if (!m || win) return false;
      const s = turn, hr = s ? 0 : 7; anim = {f: m.f, t: m.t, p: b[m.f], c: m.c, cs: m.ep ? m.t + (s ? -8 : 8) : m.t, rf: m.cs ? hr*8 + (m.cs === 1 ? 7 : 0) : null, rt: m.cs ? hr*8 + (m.cs === 1 ? 5 : 3) : null, t0: performance.now(), dur: 420}; make(m); plies++; last = m; selQ = -1; tgts = []; if (m.c) capd[s].push(low(m.c));
      (m.c ? SFX.hit : SFX.pong)();
      const nl = legal(turn); chk = attacked(kingSq(turn), 1 - turn);
      if (!nl.length) win = chk ? {w: s, txt: "체크메이트!"} : {w: -1, txt: "스테일메이트 (움직일 수가 없어요)"};
      else if (half >= 100) win = {w: -1, txt: "50수 동안 잡지 못했어요"};
      else if (b.filter(p => p).length === 2) win = {w: -1, txt: "킹만 남았어요"};
      if (m.pr) this.ctl.say("👑 폰이 퀸이 됐어요!", "#ffe066", 60);
      return true; },
    over(){ return this.resigned || win; },
    status(){ return chk && !win ? {t: "⚠️ 체크! 킹을 지켜요", c: "#ff8787"} : null; },
    cardTxt: s => capd[s].length ? "잡은 말 " + capd[s].map(t => CH_G[t]).join("") : "",
    chip(g, x, y, r, s){ g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = s ? "#212529" : "#fff"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#868e96"; g.stroke(); },
    step: () => a3 || (CH3D.st === 2 && chk && !win),   // 🧊 3D: 움직이는 동안·체크 반짝임만 다시 그려요
    down(x, y, B, flip, can){
      let i;
      if (CH3D.st === 2){ i = CH3D.pick(x, y, B); if (i < 0){ selQ = -1; tgts = []; return null; } }
      else { B = this.sq2(B); const c = B.w/8; let C = Math.floor((x - B.x)/c), R = Math.floor((y - B.y)/c); if (C < 0 || R < 0 || C > 7 || R > 7){ selQ = -1; tgts = []; return null; }
        if (flip){ C = 7 - C; R = 7 - R; } i = R*8 + C; }
      if (!can) return null;
      if (selQ >= 0 && tgts.includes(i)) return [selQ, i];
      if (b[i] && side(b[i]) === turn){ selQ = i; tgts = legal(turn).filter(m => m.f === i).map(m => m.t); tone(700, 700, .03, "sine", .05); if (!tgts.length) this.ctl.say(`${CH_N[low(b[i])]}은(는) 지금 못 움직여요`, "#ffc9c9", 40); }
      else { selQ = -1; tgts = []; }
      return null; },
    sq2: B => ({x: B.x + (B.w - B.h)/2, y: B.y, w: B.h, h: B.h}),   // 2D 판은 가운데 정사각형
    draw(g, B, flip){
      if (CH3D.st === 0) CH3D.load(() => this.ctl.dirty());
      if (CH3D.st === 2){ try { a3 = CH3D.draw(g, B, flip, {b, sel: selQ, tgts, last, chk: chk && !win ? kingSq(turn) : -1, epT: selQ >= 0 && low(b[selQ] || "") === "p" ? ep : -1, anim}, NG.k || 1); return; } catch(e){ console.warn("[3D 체스]", e); CH3D.st = -1; } }
      a3 = false; B = this.sq2(B);
      const c = B.w/8, P = i => { let R = i >> 3, C = i & 7; if (flip){ R = 7 - R; C = 7 - C; } return [B.x + C*c, B.y + R*c]; };
      g.save(); rrect(g, B.x - 10, B.y - 10, B.w + 20, B.h + 20, 14); g.fillStyle = "#5c3d1e"; g.fill();
      for (let i = 0; i < 64; i++){ const [x, y] = P(i); g.fillStyle = ((i >> 3) + (i & 7)) % 2 ? "#b58863" : "#f0d9b5"; g.fillRect(x, y, c + .5, c + .5); }
      if (last){ g.fillStyle = "rgba(255,212,59,.45)"; [last.f, last.t].forEach(i => { const [x, y] = P(i); g.fillRect(x, y, c, c); }); }
      if (chk && !win){ const [x, y] = P(kingSq(turn)); const gr = g.createRadialGradient(x + c/2, y + c/2, c*.1, x + c/2, y + c/2, c*.7); gr.addColorStop(0, "rgba(255,40,40,.9)"); gr.addColorStop(1, "rgba(255,40,40,0)"); g.fillStyle = gr; g.fillRect(x, y, c, c); }
      if (selQ >= 0){ const [x, y] = P(selQ); g.fillStyle = "rgba(81,207,102,.55)"; g.fillRect(x, y, c, c); }
      for (let i = 0; i < 64; i++){ const p = b[i]; if (!p) continue; const [x, y] = P(i), s = bdGlyph(low(p), side(p) === 0, c*.82); g.drawImage(s, x + c/2 - s.width/2, y + c/2 - s.height/2); }
      tgts.forEach(i => { const [x, y] = P(i); g.beginPath(); if (b[i] || (i === ep && selQ >= 0 && low(b[selQ]) === "p")){ g.lineWidth = c*.08; g.strokeStyle = "rgba(81,207,102,.9)"; g.arc(x + c/2, y + c/2, c*.44, 0, 7); g.stroke(); } else { g.fillStyle = "rgba(55,178,77,.75)"; g.arc(x + c/2, y + c/2, c*.16, 0, 7); g.fill(); } });
      g.fillStyle = "rgba(255,255,255,.75)"; g.font = `${Math.round(c*.18)}px ${BD_FONT}`; g.textAlign = "left";
      for (let k = 0; k < 8; k++){ const [x, y] = P(flip ? k : 56 + k); g.fillText("abcdefgh"[k], x + 3, y + c - 4); }
      if (CH3D.st === 1){ g.fillStyle = "rgba(10,6,30,.6)"; g.fillRect(B.x, B.y + B.h - 44, B.w, 40); outlined(g, "🧊 3D 체스판을 불러오는 중…", B.x + B.w/2, B.y + B.h - 24, 22, "#c5f6fa"); }
      g.restore();
    },
    ai(lv, done){
      const L = legal(turn); if (!L.length){ done(null); return; }
      const d = [1, 2, 3][lv] || 2; let best = null, bv = -1e9;
      L.sort(() => Math.random() - .5);
      for (const m of L){ const U = make(m); const v = -search(d - 1, -1e9, 1e9, turn) + (lv === 0 ? Math.random()*160 : Math.random()*8); unmake(U); if (v > bv){ bv = v; best = m; } }
      done([best.f, best.t]);
    }
  };
  return bdCtl("ch", G);
};

/* =====================================================================
   🀄 장기 — 초(아래·먼저) vs 한(위). 궁성 대각선·포 넘기·멱 막기 다 돼요
   - 200수가 지나면 남은 말 점수로 승부 (한은 +1.5 덤)
   ===================================================================== */
const JG_H = ["", "將", "士", "象", "馬", "車", "包", "卒"], JG_K = ["", "궁", "사", "상", "마", "차", "포", "졸"], JG_V = [0, 0, 3, 3, 5, 13, 7, 2];
NG.defs.jg = () => {
  let b, turn, last = null, selQ = -1, tgts = [], win = null, chk = false, plies = 0, capd = [[], []];
  const sd = v => v > 0 ? 0 : v < 0 ? 1 : -1, ty = v => Math.abs(v), ok = (x, y) => x >= 0 && x < 9 && y >= 0 && y < 10;
  const inPal = (x, y) => x >= 3 && x <= 5 && (y <= 2 || y >= 7), palOf = y => y <= 2 ? 1 : 2;
  const pc = y => y <= 2 ? 1 : 8;   // 궁성 가운데 줄
  /* 궁성 대각선 한 칸: 한쪽이 가운데, 다른 쪽이 모서리 */
  function pd(x, y, x2, y2){ if (!inPal(x, y) || !inPal(x2, y2) || palOf(y) !== palOf(y2) || Math.abs(x2 - x) !== 1 || Math.abs(y2 - y) !== 1) return false;
    const cy = pc(y), cen = (X, Y) => X === 4 && Y === cy; return cen(x, y) || cen(x2, y2); }
  function pseudo(s){
    const M = [];
    for (let y = 0; y < 10; y++) for (let x = 0; x < 9; x++){ const v = b[y*9 + x]; if (!v || sd(v) !== s) continue; const t = ty(v), f = y*9 + x;
      const add = (X, Y) => { if (!ok(X, Y)) return false; const q = b[Y*9 + X]; if (q && sd(q) === s) return false; M.push([f, Y*9 + X, q]); return !q; };
      if (t === 1 || t === 2){ for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++){ if (!dx && !dy) continue; const X = x + dx, Y = y + dy;
          if (!ok(X, Y) || !inPal(X, Y) || (s === 0 ? Y < 7 : Y > 2)) continue; if (dx && dy && !pd(x, y, X, Y)) continue; add(X, Y); } }
      else if (t === 5){ for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ let k = 1; while (add(x + dx*k, y + dy*k)) k++; }
        for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]){ let X = x, Y = y; while (pd(X, Y, X + dx, Y + dy)){ X += dx; Y += dy; if (!add(X, Y)) break; } } }
      else if (t === 6){
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ let k = 1; while (ok(x + dx*k, y + dy*k) && !b[(y + dy*k)*9 + x + dx*k]) k++;
          if (!ok(x + dx*k, y + dy*k) || ty(b[(y + dy*k)*9 + x + dx*k]) === 6) continue; k++;
          while (ok(x + dx*k, y + dy*k)){ const q = b[(y + dy*k)*9 + x + dx*k]; if (!q){ M.push([f, (y + dy*k)*9 + x + dx*k, 0]); k++; continue; } if (sd(q) !== s && ty(q) !== 6) M.push([f, (y + dy*k)*9 + x + dx*k, q]); break; } }
        for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]){ if (!pd(x, y, x + dx, y + dy) || !pd(x + dx, y + dy, x + 2*dx, y + 2*dy)) continue; const m = b[(y + dy)*9 + x + dx], q = b[(y + 2*dy)*9 + x + 2*dx];
          if (m && ty(m) !== 6 && (!q || (sd(q) !== s && ty(q) !== 6))) M.push([f, (y + 2*dy)*9 + x + 2*dx, q]); } }
      else if (t === 4){ for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ if (!ok(x + dx, y + dy) || b[(y + dy)*9 + x + dx]) continue;
          if (dx) { add(x + 2*dx, y + 1); add(x + 2*dx, y - 1); } else { add(x + 1, y + 2*dy); add(x - 1, y + 2*dy); } } }
      else if (t === 3){ for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ if (!ok(x + dx, y + dy) || b[(y + dy)*9 + x + dx]) continue;
          for (const e of [-1, 1]){ const ex = dx ? dx : e, ey = dy ? dy : e, mx = x + dx + ex, my = y + dy + ey; if (!ok(mx, my) || b[my*9 + mx]) continue; add(mx + ex, my + ey); } } }
      else if (t === 7){ const fw = s === 0 ? -1 : 1; add(x, y + fw); add(x - 1, y); add(x + 1, y);
        for (const dx of [-1, 1]) if (pd(x, y, x + dx, y + fw)) add(x + dx, y + fw); }
    }
    return M;
  }
  const kSq = s => b.indexOf(s ? -1 : 1);
  const attacked = (sq, by) => pseudo(by).some(m => m[1] === sq);
  function make(m){ const c = b[m[1]]; b[m[1]] = b[m[0]]; b[m[0]] = 0; turn ^= 1; return c; }
  function unmake(m, c){ turn ^= 1; b[m[0]] = b[m[1]]; b[m[1]] = c; }
  function legal(s){ return pseudo(s).filter(m => { const c = make(m); const okk = !attacked(kSq(s), 1 - s); unmake(m, c); return okk; }); }
  function score(s){ let v = s ? 1.5 : 0; b.forEach(q => { if (q && sd(q) === s) v += JG_V[ty(q)]; }); return v; }
  function evalS(s){ let v = 0; for (let i = 0; i < 90; i++){ const q = b[i]; if (!q) continue; const t = ty(q), y = Math.floor(i/9); let x = JG_V[t]*100 + (t === 7 ? (sd(q) ? y : 9 - y)*4 : 0) + (t === 4 || t === 5 || t === 6 ? 6 - Math.abs(4 - i % 9) : 0); v += sd(q) === s ? x : -x; } return v; }
  function search(d, al, be, s){
    if (d === 0) return evalS(s);
    const M = pseudo(s); M.sort((p, q) => JG_V[ty(q[2])] - JG_V[ty(p[2])] + (ty(q[2]) === 1 ? 999 : 0) - (ty(p[2]) === 1 ? 999 : 0));
    let best = -1e9;
    for (const m of M){ if (ty(m[2]) === 1) return 1e6; const c = make(m); const v = -search(d - 1, -be, -al, 1 - s); unmake(m, c); if (v > best) best = v; if (v > al) al = v; if (al >= be) break; }
    return M.length ? best : -1e5;
  }
  const G = {
    ar: 9/10, names: ["🟢 초", "🔴 한"], undoOK: true,
    reset(){ b = new Int8Array(90); const back = [5, 4, 3, 2, 0, 2, 4, 3, 5];
      back.forEach((t, x) => { if (t){ b[x] = -t; b[81 + x] = t; } });
      b[13] = -1; b[76] = 1; b[19] = b[25] = -6; b[64] = b[70] = 6; [0, 2, 4, 6, 8].forEach(x => { b[27 + x] = -7; b[54 + x] = 7; });
      turn = 0; last = null; selQ = -1; tgts = []; win = null; chk = false; plies = 0; capd = [[], []]; this.resigned = null; },
    turn: () => turn,
    apply(mv){ if (win) return false; const L = legal(turn), m = L.find(x => x[0] === mv[0] && x[1] === mv[1]); if (!m) return false;
      const s = turn; const c = make(m); plies++; last = m; selQ = -1; tgts = []; if (c) capd[s].push(ty(c)); (c ? SFX.hit : SFX.pong)();
      chk = attacked(kSq(turn), 1 - turn); const nl = legal(turn);
      if (!nl.length) win = {w: s, txt: chk ? "외통수! 장군을 막을 수 없어요" : "상대가 움직일 수 없어요"};
      else if (plies >= 200){ const a = score(0), z = score(1); win = {w: a > z ? 0 : 1, txt: `200수 끝! 남은 말 점수 초 ${a} : 한 ${z}`}; }
      return true; },
    over(){ return this.resigned || win; },
    status(){ return chk && !win ? {t: "📢 장군! 궁을 지켜요", c: "#ff8787"} : null; },
    cardTxt: s => `점수 ${score(s)}${capd[s].length ? ` · 잡은 말 ${capd[s].length}개` : ""}`,
    chip(g, x, y, r, s){ g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = s ? "#e03131" : "#2f9e44"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#fff"; g.stroke(); },
    down(x, y, B, flip, can){
      const cw = B.w/9, ch = B.h/10; let X = Math.round((x - B.x - cw/2)/cw), Y = Math.round((y - B.y - ch/2)/ch); if (!ok(X, Y)){ selQ = -1; tgts = []; return null; }
      if (flip){ X = 8 - X; Y = 9 - Y; } const i = Y*9 + X; if (!can) return null;
      if (selQ >= 0 && tgts.includes(i)) return [selQ, i];
      if (b[i] && sd(b[i]) === turn){ selQ = i; tgts = legal(turn).filter(m => m[0] === i).map(m => m[1]); tone(700, 700, .03, "sine", .05); if (!tgts.length) this.ctl.say(`${JG_K[ty(b[i])]}은(는) 지금 못 움직여요`, "#ffc9c9", 40); }
      else { selQ = -1; tgts = []; }
      return null; },
    draw(g, B, flip){
      const cw = B.w/9, ch = B.h/10, P = i => { let X = i % 9, Y = Math.floor(i/9); if (flip){ X = 8 - X; Y = 9 - Y; } return [B.x + cw/2 + X*cw, B.y + ch/2 + Y*ch]; };
      g.save(); rrect(g, B.x - 8, B.y - 8, B.w + 16, B.h + 16, 14); const wd = g.createLinearGradient(B.x, B.y, B.x + B.w, B.y + B.h); wd.addColorStop(0, "#f5d08a"); wd.addColorStop(1, "#dcaa5c"); g.fillStyle = wd; g.fill();
      g.strokeStyle = "rgba(70,40,10,.85)"; g.lineWidth = 1.8;
      for (let y = 0; y < 10; y++){ const [a1, b1] = P(y*9), [a2, b2] = P(y*9 + 8); g.beginPath(); g.moveTo(a1, b1); g.lineTo(a2, b2); g.stroke(); }
      for (let x = 0; x < 9; x++){ const [a1, b1] = P(x), [a2, b2] = P(81 + x); g.beginPath(); g.moveTo(a1, b1); g.lineTo(a2, b2); g.stroke(); }
      [[3, 23], [5, 21], [66, 86], [68, 84]].forEach(([p, q]) => { const [a1, b1] = P(p), [a2, b2] = P(q); g.beginPath(); g.moveTo(a1, b1); g.lineTo(a2, b2); g.stroke(); });
      if (last){ g.fillStyle = "rgba(255,212,59,.6)"; [last[0], last[1]].forEach(i => { const [x, y] = P(i); g.beginPath(); g.arc(x, y, Math.min(cw, ch)*.47, 0, 7); g.fill(); }); }
      const R0 = Math.min(cw, ch)*.47;
      for (let i = 0; i < 90; i++){ const v = b[i]; if (!v) continue; const [x, y] = P(i), t = ty(v), s = sd(v), r = R0*(t === 1 ? 1 : t === 2 || t === 7 ? .74 : .86);
        g.beginPath(); for (let k = 0; k < 8; k++){ const a = Math.PI/8 + k*Math.PI/4; g[k ? "lineTo" : "moveTo"](x + Math.cos(a)*r, y + Math.sin(a)*r); } g.closePath();
        g.fillStyle = "#fff8e6"; g.fill(); g.lineWidth = Math.max(2, r*.1); g.strokeStyle = i === selQ ? "#37b24d" : (chk && t === 1 && s === turn ? "#ff2020" : "#7a5a2a"); g.stroke();
        g.fillStyle = s ? "#d6336c" : "#1c7ed6"; g.font = `bold ${Math.round(r*1.05)}px "Noto Serif CJK KR","Noto Sans CJK KR","Nanum Myeongjo","Malgun Gothic",serif`; g.textAlign = "center"; g.textBaseline = "middle";
        const hz = t === 1 ? (s ? "漢" : "楚") : t === 7 ? (s ? "兵" : "卒") : JG_H[t]; g.fillText(hz, x, y - r*.08);
        g.font = `${Math.round(r*.42)}px ${BD_FONT}`; g.fillText(JG_K[t], x, y + r*.66); }
      tgts.forEach(i => { const [x, y] = P(i); g.beginPath(); if (b[i]){ g.lineWidth = R0*.18; g.strokeStyle = "rgba(55,178,77,.95)"; g.arc(x, y, R0*.95, 0, 7); g.stroke(); } else { g.fillStyle = "rgba(55,178,77,.85)"; g.arc(x, y, R0*.3, 0, 7); g.fill(); } });
      g.restore();
    },
    ai(lv, done){
      const L = legal(turn); if (!L.length){ done(null); return; }
      const d = [1, 2, 3][lv] || 2; let best = null, bv = -1e9; L.sort(() => Math.random() - .5);
      for (const m of L){ const c = make(m); const v = -search(d - 1, -1e9, 1e9, turn) + (lv === 0 ? Math.random()*300 : Math.random()*10); unmake(m, c); if (v > bv){ bv = v; best = m; } }
      done([best[0], best[1]]);
    }
  };
  return bdCtl("jg", G);
};

/* =====================================================================
   🎱 당구 (포켓볼 점수 대결) — 공 9개, 넣으면 1점(⭐9번 공은 3점), 넣으면 한 번 더!
   - 흰 공이 빠지면 -1점. 공을 다 넣으면 점수 많은 쪽 승리
   - 판을 끌어서 방향, 오른쪽 힘 막대를 아래로 당겼다 놓으면 쳐요
   - 다른 기기와는 '어느 쪽으로 얼마나 셌는지'만 보내고, 친 사람이 끝난 모습을 맞춰 줘요
   ===================================================================== */
const BL_C = ["#fff", "#fcc419", "#1c7ed6", "#e03131", "#7048e8", "#fd7e14", "#2f9e44", "#862e9c", "#212529", "#f59f00"];
NG.defs.bl = () => {
  const TW = 1000, TH = 500, RL = 46, R = 14, POK = [[0, 0, 34], [TW/2, -4, 28], [TW, 0, 34], [0, TH, 34], [TW/2, TH + 4, 28], [TW, TH, 34]];
  let balls, turn, sc, moving = false, shot = null, aim = 0, pow = 0, charging = false, win = null, aimOn = false, fx = [], shooter = 0, sentSync = false, waitSync = false;
  const fresh = () => balls.filter(o => !o.in);
  function rack(){ balls = [{n: 0, x: TW*.25, y: TH/2, vx: 0, vy: 0, in: false}]; const ox = TW*.7, d = R*2 + .6, rows = [1, 2, 3, 2, 1], ord = [1, 2, 3, 4, 9, 5, 6, 7, 8]; let k = 0;
    rows.forEach((n, ci) => { for (let j = 0; j < n; j++){ balls.push({n: ord[k++], x: ox + ci*d*.866, y: TH/2 + (j - (n - 1)/2)*d, vx: 0, vy: 0, in: false}); } }); }
  function sim(B, onPot){   // 한 장면(4번 나눠서) — 덧셈·곱셈·제곱근만 써서 두 기기가 똑같이 계산해요
    let mv = false;
    for (let s = 0; s < 4; s++){
      for (const o of B){ if (o.in) continue; o.x += o.vx/4; o.y += o.vy/4;
        for (const [px, py, pr] of POK) { const dx = o.x - px, dy = o.y - py; if (dx*dx + dy*dy < pr*pr){ o.in = true; o.vx = o.vy = 0; onPot && onPot(o); break; } }
        if (o.in) continue;
        if (o.x < R){ o.x = R; o.vx = -o.vx*.82; } else if (o.x > TW - R){ o.x = TW - R; o.vx = -o.vx*.82; }
        if (o.y < R){ o.y = R; o.vy = -o.vy*.82; } else if (o.y > TH - R){ o.y = TH - R; o.vy = -o.vy*.82; } }
      for (let i = 0; i < B.length; i++){ const a = B[i]; if (a.in) continue;
        for (let j = i + 1; j < B.length; j++){ const c = B[j]; if (c.in) continue; const dx = c.x - a.x, dy = c.y - a.y, d2 = dx*dx + dy*dy; if (d2 >= 4*R*R || d2 === 0) continue;
          const d = Math.sqrt(d2), nx = dx/d, ny = dy/d, ov = (2*R - d)/2; a.x -= nx*ov; a.y -= ny*ov; c.x += nx*ov; c.y += ny*ov;
          const rv = (c.vx - a.vx)*nx + (c.vy - a.vy)*ny; if (rv < 0){ const im = -rv*.97; a.vx -= im*nx; a.vy -= im*ny; c.vx += im*nx; c.vy += im*ny; B.hit = (B.hit || 0) + 1; } } } }
    for (const o of B){ if (o.in) continue; o.vx *= .984; o.vy *= .984; const v2 = o.vx*o.vx + o.vy*o.vy; if (v2 < .0049){ o.vx = o.vy = 0; } else { const sp = Math.sqrt(v2), f = (sp - .014)/sp; o.vx *= f; o.vy *= f; mv = true; } }
    return mv;
  }
  function resolve(){
    const P = shot.pot, cue = P.includes(0), pts = P.filter(n => n).reduce((a, n) => a + (n === 9 ? 3 : 1), 0), s = shooter;
    sc[s] += pts; if (cue){ sc[s] = Math.max(0, sc[s] - 1); const c = balls[0]; c.in = false; c.vx = c.vy = 0; c.x = TW*.25; c.y = TH/2;
      while (balls.some(o => o !== c && !o.in && (o.x - c.x)**2 + (o.y - c.y)**2 < 4*R*R)) c.y = c.y > 40 ? c.y - 30 : TH/2 + 60; }
    if (balls.slice(1).every(o => o.in)) win = sc[0] === sc[1] ? {w: -1, txt: `${sc[0]} : ${sc[1]}`} : {w: sc[0] > sc[1] ? 0 : 1, txt: `🎱 ${sc[0]} : ${sc[1]}`};
    const again = pts > 0 && !cue; if (!again) turn = 1 - s;
    G.ctl.say(cue ? "😵 흰 공이 빠졌어요! -1점" : pts ? `🎉 +${pts}점! ${again ? "한 번 더!" : ""}` : "차례가 넘어가요", cue ? "#ff8787" : pts ? "#ffe066" : "#d0bfff", 55);
    if (pts) SFX.gold(); else if (cue) SFX.bad();
    shot = null;
    if (G.ctl.net() && s === G.ctl.mine()) G.ctl.sent({sync: G.snap(), n: G.nShots});
    G.ctl.dirty(); G.ctl.check();
  }
  /* 겨냥선: 흰 공이 처음 닿는 공·벽까지 */
  function ray(ang){ const c = balls[0], dx = Math.cos(ang), dy = Math.sin(ang); let best = 1e9, hit = null;
    for (const o of fresh()){ if (o === c) continue; const fx2 = o.x - c.x, fy = o.y - c.y, t = fx2*dx + fy*dy; if (t <= 0) continue; const q = (fx2*fx2 + fy*fy) - t*t; if (q > 4*R*R) continue; const tt = t - Math.sqrt(4*R*R - q); if (tt < best){ best = tt; hit = o; } }
    const tw = Math.min(dx > 0 ? (TW - R - c.x)/dx : dx < 0 ? (R - c.x)/dx : 1e9, dy > 0 ? (TH - R - c.y)/dy : dy < 0 ? (R - c.y)/dy : 1e9);
    return hit && best < tw ? {t: best, o: hit} : {t: tw, o: null}; }
  const toT = (B, x, y) => { const k = (B.w)/(TW + 2*RL); return [(x - B.x)/k - RL, (y - B.y)/k - RL]; };
  const G = {
    ar: (TW + 2*RL)/(TH + 2*RL), names: ["🔵 파랑", "🟠 주황"], undoOK: false, noFlip: true, uiH: 300, nShots: 0,
    reset(){ rack(); turn = 0; sc = [0, 0]; moving = false; shot = null; aim = 0; pow = 0; charging = false; win = null; fx = []; this.nShots = 0; this.resigned = null; },
    turn: () => turn,
    busy: () => moving,
    apply(mv){ if (moving || win || !mv || typeof mv.vx !== "number") return false; const c = balls[0];
      c.vx = mv.vx; c.vy = mv.vy; shooter = turn; moving = true; shot = {pot: []}; this.nShots++; tone(300, 160, .08, "square", .1); return true; },
    step(){ if (!moving) return false; const h0 = balls.hit || 0;
      const mv = sim(balls, o => { shot.pot.push(o.n); fx.push({x: o.x, y: o.y, n: o.n, t: 30}); o.n ? tone(520, 1040, .12, "triangle", .1) : null; });
      if ((balls.hit || 0) > h0) tone(900, 700, .025, "square", .05);
      fx.forEach(f => f.t--); fx = fx.filter(f => f.t > 0);
      if (!mv){ moving = false; resolve(); }
      return true; },
    over(){ return this.resigned || win; },
    snap(){ return {b: balls.map(o => [Math.round(o.x*100)/100, Math.round(o.y*100)/100, o.in ? 1 : 0]), t: turn, s: sc.slice(), w: win}; },
    sync(d){ moving = false; shot = null; d.b.forEach((a, i) => { const o = balls[i]; o.x = a[0]; o.y = a[1]; o.in = !!a[2]; o.vx = o.vy = 0; }); turn = d.t; sc = d.s; win = d.w; },
    cardTxt: s => `⭐ ${sc[s]}점`,
    chip(g, x, y, r, s){ g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = s ? "#fd7e14" : "#1c7ed6"; g.fill(); g.lineWidth = 2; g.strokeStyle = "#fff"; g.stroke(); },
    down(x, y, B, flip, can){ if (!can) return null; const [tx, ty2] = toT(B, x, y), c = balls[0]; aim = Math.atan2(ty2 - c.y, tx - c.x); aimOn = true; return null; },
    move(x, y, B, flip, can){ if (!can) return; const [tx, ty2] = toT(B, x, y), c = balls[0]; aim = Math.atan2(ty2 - c.y, tx - c.x); },
    uiDown(x, y, U, can){ if (!can) return; charging = true; this.uiMove(x, y, U); },
    uiMove(x, y, U){ if (!charging) return; if (U.w > U.h*1.5){ const bx = U.x + 20, bw = U.w - 40; pow = Math.max(0, Math.min(1, (x - bx)/bw)); } else { const by = U.y + 60, bh = U.h - 80; pow = Math.max(0, Math.min(1, (y - by)/bh)); } },
    uiUp(x, y, U, can){ if (!charging) return null; charging = false; const p = pow; pow = 0; if (!can || p < .05) return null; const sp = 3 + 27*p; return {vx: Math.cos(aim)*sp, vy: Math.sin(aim)*sp}; },
    key(code, can){ if (!can) return false; if (code === "ArrowLeft" || code === "ArrowUp"){ aim -= .012; return true; } if (code === "ArrowRight" || code === "ArrowDown"){ aim += .012; return true; }
      if (code === "Space"){ charging = true; pow = Math.min(1, pow + .04); return true; } return false; },
    keyUp(code, can){ if (code !== "Space" || !charging) return null; charging = false; const p = pow; pow = 0; if (!can || p < .05) return null; const sp = 3 + 27*p; return {vx: Math.cos(aim)*sp, vy: Math.sin(aim)*sp}; },
    drawUI(g, U, can){
      g.save(); rrect(g, U.x, U.y, U.w, U.h, 18); g.fillStyle = "rgba(255,255,255,.07)"; g.fill();
      const hz = U.w > U.h*1.5;
      outlined(g, can ? (hz ? "💪 힘: 오른쪽으로 밀었다 놓기!" : "💪 힘: 아래로 당겼다 놓기!") : moving ? "🎱 굴러가는 중…" : "⏳ 기다려요", U.x + U.w/2, U.y + (hz ? 22 : 28), Math.min(22, U.w/14), can ? "#ffe066" : "#d0bfff");
      if (hz){ const bx = U.x + 20, by = U.y + 44, bw = U.w - 40; rrect(g, bx, by, bw, 44, 14); g.fillStyle = "rgba(0,0,0,.35)"; g.fill();
        const gr = g.createLinearGradient(bx, 0, bx + bw, 0); gr.addColorStop(0, "#69db7c"); gr.addColorStop(.6, "#ffd43b"); gr.addColorStop(1, "#ff6b6b");
        if (pow > .01){ rrect(g, bx, by, bw*pow, 44, 14); g.fillStyle = gr; g.fill(); } rrect(g, bx + bw*pow - 9, by - 6, 18, 56, 8); g.fillStyle = can ? "#fff" : "#888"; g.fill(); g.restore(); return; }
      const bx = U.x + U.w/2 - 34, by = U.y + 60, bh = U.h - 80; rrect(g, bx, by, 68, bh, 16); g.fillStyle = "rgba(0,0,0,.35)"; g.fill();
      const gr = g.createLinearGradient(0, by, 0, by + bh); gr.addColorStop(0, "#69db7c"); gr.addColorStop(.6, "#ffd43b"); gr.addColorStop(1, "#ff6b6b");
      if (pow > .01){ g.save(); rrect(g, bx, by, 68, bh*pow, 16); g.fillStyle = gr; g.fill(); g.restore(); }
      rrect(g, bx - 6, by + bh*pow - 10, 80, 20, 8); g.fillStyle = can ? "#fff" : "#888"; g.fill(); g.restore(); },
    draw(g, B){
      const k = B.w/(TW + 2*RL), X = x => B.x + (x + RL)*k, Y = y => B.y + (y + RL)*k;
      g.save(); rrect(g, B.x, B.y, B.w, B.h, 26*k + 10); g.fillStyle = "#6b3e1f"; g.fill();
      rrect(g, X(-14), Y(-14), (TW + 28)*k, (TH + 28)*k, 14*k); g.fillStyle = "#156b3a"; g.fill();
      const fe = g.createRadialGradient(X(TW/2), Y(TH/2), 30*k, X(TW/2), Y(TH/2), TW*.6*k); fe.addColorStop(0, "#2fa45c"); fe.addColorStop(1, "#1d7d43");
      g.fillStyle = fe; g.fillRect(X(0), Y(0), TW*k, TH*k);
      g.fillStyle = "rgba(255,255,255,.75)"; [.25, .5, .75].forEach(f => { g.beginPath(); g.arc(X(TW*f), Y(-28), 4*k, 0, 7); g.fill(); g.beginPath(); g.arc(X(TW*f), Y(TH + 28), 4*k, 0, 7); g.fill(); });
      for (const [px, py, pr] of POK){ g.beginPath(); g.arc(X(px), Y(py), (pr - 6)*k, 0, 7); g.fillStyle = "#0b0b0b"; g.fill(); }
      const can = G.ctl.canMove(), c = balls[0];
      if (can && !c.in){ const r = ray(aim), ex = c.x + Math.cos(aim)*r.t, ey = c.y + Math.sin(aim)*r.t;
        g.setLineDash([8*k, 8*k]); g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 2.5*k; g.beginPath(); g.moveTo(X(c.x), Y(c.y)); g.lineTo(X(ex), Y(ey)); g.stroke(); g.setLineDash([]);
        g.beginPath(); g.arc(X(ex), Y(ey), R*k, 0, 7); g.strokeStyle = "rgba(255,255,255,.85)"; g.stroke();
        if (r.o){ const nx = r.o.x - ex, ny = r.o.y - ey, d = Math.hypot(nx, ny) || 1; g.strokeStyle = "rgba(255,230,100,.9)"; g.lineWidth = 3*k; g.beginPath(); g.moveTo(X(r.o.x), Y(r.o.y)); g.lineTo(X(r.o.x + nx/d*120), Y(r.o.y + ny/d*120)); g.stroke(); }
        const bk = 30 + pow*90; g.strokeStyle = "#c08a4a"; g.lineWidth = 7*k; g.lineCap = "round"; g.beginPath(); g.moveTo(X(c.x - Math.cos(aim)*(R + bk*.3 + 6)), Y(c.y - Math.sin(aim)*(R + bk*.3 + 6))); g.lineTo(X(c.x - Math.cos(aim)*(R + bk + 260)), Y(c.y - Math.sin(aim)*(R + bk + 260))); g.stroke(); }
      for (const o of balls){ if (o.in) continue; const x = X(o.x), y = Y(o.y), r = R*k;
        g.beginPath(); g.arc(x + 2*k, y + 3*k, r, 0, 7); g.fillStyle = "rgba(0,0,0,.3)"; g.fill();
        g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = BL_C[o.n]; g.fill();
        if (o.n === 9){ g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.clip(); g.fillStyle = "#fff"; g.fillRect(x - r, y - r, r*2, r*.55); g.fillRect(x - r, y + r*.45, r*2, r*.55); g.restore(); }
        if (o.n){ g.beginPath(); g.arc(x, y, r*.52, 0, 7); g.fillStyle = "#fff"; g.fill(); g.fillStyle = "#222"; g.font = `bold ${Math.round(r*.8)}px ${BD_FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(o.n === 9 ? "⭐" : o.n, x, y + r*.04); }
        g.beginPath(); g.arc(x - r*.35, y - r*.4, r*.25, 0, 7); g.fillStyle = "rgba(255,255,255,.55)"; g.fill(); }
      fx.forEach(f => outlined(g, f.n ? (f.n === 9 ? "+3" : "+1") : "-1", X(f.x), Y(f.y) - (30 - f.t)*2*k, 30*k + 8, f.n ? "#ffe066" : "#ff8787"));
      const left = balls.slice(1).filter(o => !o.in).map(o => o.n); g.restore();
      outlined(g, `남은 공 ${left.length}개`, B.x + B.w/2, B.y + RL*k*.5, Math.max(14, RL*k*.45), "#ffe8cc");
    },
    ai(lv, done){
      const c = balls[0], targets = fresh().filter(o => o.n), C = [];
      const tryShot = (ang, p) => { const B = balls.map(o => ({...o})); const sp = 3 + 27*p; B[0].vx = Math.cos(ang)*sp; B[0].vy = Math.sin(ang)*sp; const pot = [];
        for (let f = 0; f < 900 && sim(B, o => pot.push(o.n)); f++); return pot.includes(0) ? -15 : pot.reduce((a, n) => a + (n === 9 ? 30 : 10), 0); };
      for (const o of targets) for (const [px, py] of POK){ const dx = px - o.x, dy = py - o.y, d = Math.hypot(dx, dy); const gx = o.x - dx/d*2*R, gy = o.y - dy/d*2*R, ang = Math.atan2(gy - c.y, gx - c.x);
        const cut = Math.abs(((Math.atan2(dy, dx) - ang + Math.PI*3) % (Math.PI*2)) - Math.PI); if (cut > 1.25) continue; C.push(ang); }
      let best = null, bv = -1e9; const noise = [.07, .025, .006][lv] ?? .025;
      C.slice(0, 36).forEach(a => [.45, .7].forEach(p => { const v = tryShot(a, p) + Math.random()*3; if (v > bv){ bv = v; best = [a, p]; } }));
      if (!best || bv <= 0){ const o = targets.sort((p, q) => Math.hypot(p.x - c.x, p.y - c.y) - Math.hypot(q.x - c.x, q.y - c.y))[0]; best = [o ? Math.atan2(o.y - c.y, o.x - c.x) : 0, .6]; }
      const a = best[0] + (Math.random() - .5)*2*noise, sp = 3 + 27*best[1]; aim = a; done({vx: Math.cos(a)*sp, vy: Math.sin(a)*sp});
    }
  };
  return bdCtl("bl", G);
};
