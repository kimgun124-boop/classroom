/* =====================================================================
   🎮 새 게임: 두더지 잡기 · 벽돌깨기 · 점프 달리기 · 2048 · 얼굴 탁구
   ===================================================================== */
const EMOJI = `"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
const rnd = (a = 1, b) => b === undefined ? Math.random()*a : a + Math.random()*(b - a);
const clampN = (v, a, b) => v < a ? a : v > b ? b : v;
function tone(f1, f2, dur, type = "sine", vol = .12, delay = 0){
  try { const a = getAC(), t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f2), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + .02); } catch(e) {}
}
const SFX = {
  hit: () => { tone(520, 260, .12, "square", .1); tone(1200, 800, .06, "triangle", .08); },
  pt: () => tone(880, 1320, .1, "triangle", .1),
  gold: () => [1046, 1318, 1568, 2093].forEach((f, k) => tone(f, f, .09, "triangle", .1, k*.05)),
  bad: () => { tone(200, 60, .35, "sawtooth", .12); },
  jump: () => tone(400, 900, .14, "sine", .1),
  item: () => [660, 880, 1320].forEach((f, k) => tone(f, f, .1, "triangle", .12, k*.06)),
  over: () => [523, 440, 349, 262].forEach((f, k) => tone(f, f*.98, .2, "triangle", .12, k*.14)),
  rec: () => [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, k) => tone(f, f, .14, "square", .07, k*.09)),
  merge: v => tone(300 + Math.log2(v)*90, 400 + Math.log2(v)*110, .09, "triangle", .1),
  pong: () => tone(700, 500, .06, "square", .09),
  wall: () => tone(400, 350, .05, "square", .06)
};
/* 내 아바타 얼굴을 동그랗게 (그림이 아직 없으면 이모지) */
const AVI = {};
let AVN = 0;
function avImg(sid){ const u = photoOf(sid); if (!u) return null; let m = AVI[sid]; if (!m || m.u !== u){ m = AVI[sid] = new Image(); m.u = u; m.id = ++AVN; m.src = u; } return m.complete && m.naturalWidth ? m : null; }
/* ⚡ 얼굴은 한 번 그린 그림을 기억해 붙여요 (아바타 그림을 매 장면 동그랗게 잘라 다시 그리던 게 무거웠어요) */
const FSP = new Map();
function faceAt(g, sid, x, y, r, ring, sad){
  const t = g.getTransform(), k0 = Math.hypot(t.a, t.b) || 1, k = Math.pow(1.25, Math.ceil(Math.log(k0)/Math.log(1.25)));
  const im = avImg(sid), key = `${sid}|${(+r).toFixed(1)}|${ring || ""}|${sad ? 1 : 0}|${im ? "i" + im.id : "e" + faceOf(sid)}|${k.toFixed(3)}`;
  let c = FSP.get(key);
  if (!c){
    if (FSP.size > 160) FSP.clear();
    const half = r + Math.max(2, r*.14) + 2;
    c = document.createElement("canvas"); c.width = c.height = Math.max(1, Math.ceil(half*2*k));
    const cg = c.getContext("2d"); cg.scale(k, k); faceDraw(cg, sid, half, half, r, ring, sad, im); c.half = half; FSP.set(key, c);
  }
  g.drawImage(c, x - c.half, y - c.half, c.half*2, c.half*2);
}
function faceDraw(g, sid, x, y, r, ring, sad, im){
  g.save();
  if (ring){ g.fillStyle = ring; g.beginPath(); g.arc(x, y, r + Math.max(2, r*.14), 0, Math.PI*2); g.fill(); }
  g.fillStyle = "#fff"; g.beginPath(); g.arc(x, y, r, 0, Math.PI*2); g.fill();
  if (im){ g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI*2); g.clip(); g.drawImage(im, x - r, y - r, r*2, r*2); g.restore();
    if (sad){ g.font = `${Math.round(r*.9)}px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("😵", x + r*.55, y - r*.55); } }
  else { g.font = `${Math.round(r*1.4)}px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(sad ? "😵" : faceOf(sid), x, y + r*.08); }
  g.restore();
}
function outlined(g, txt, x, y, size, fill = "#fff", stroke = "rgba(20,15,46,.85)", align = "center"){
  g.save(); g.font = `${size}px "Jua",sans-serif`; g.textAlign = align; g.textBaseline = "middle"; g.lineJoin = "round";
  g.lineWidth = Math.max(4, size*.18); g.strokeStyle = stroke; g.strokeText(txt, x, y); g.fillStyle = fill; g.fillText(txt, x, y); g.restore();
}
function rrect(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
const COLS = ["#ff6b6b","#ffa94d","#ffd43b","#69db7c","#38d9a9","#4dabf7","#748ffc","#da77f2","#f783ac"];

/* 점수 게임 기록 (얼굴 날기와 같은 모양) */
function saveRec(gid, sid, score){
  const cur = (Store.recs[gid] || {})[sid], r = Object.assign({best: 0, plays: 0}, cur ? JSON.parse(JSON.stringify(cur)) : {});
  const prevBest = r.best || 0, before = board(gid).find(x => x.sid === sid), prevRank = before ? before.rank : 0, td = today();
  r.plays = (r.plays || 0) + 1; r.last = score;
  if (r.day !== td){ r.day = td; r.dayBest = 0; r.dayPlays = 0; }
  r.dayPlays = (r.dayPlays || 0) + 1; if (score > (r.dayBest || 0)){ r.dayBest = score; r.dayAt = Date.now(); }
  const isNew = score > prevBest; if (isNew){ r.best = score; r.bestAt = Date.now(); }
  const coins = ARC.score(gid, sid, r);
  const B = board(gid), me = B.find(x => x.sid === sid);
  return {isNew, prevBest, prevRank, rank: me ? me.rank : 0, n: B.length, r, coins};
}

/* =====================================================================
   공통 틀: 캔버스 크기 맞추기, 60fps, 터치·키보드, 끝 화면
   ===================================================================== */
const NG = {
  defs: {}, cur: null, gid: null, sids: [], opt: {}, raf: 0, last: 0, acc: 0, frame: 0, ended: false,
  play(gid, sids, opt = {}){
    this.stop(); this.gid = gid; this.sids = sids; this.opt = opt; this.ended = false;
    const G = GAME[gid]; $("#ngTitle").textContent = `${G.e} ${G.n}`;
    $("#ng").hidden = false; $("#ngOver").hidden = true; $("#ngDom").innerHTML = ""; ARC.busy = true;
    const cur = this.cur = this.defs[gid]();
    cur.sids = sids; cur.opt = opt;
    $("#ngCanvas").style.display = cur.dom ? "none" : "";
    this.fit(); cur.init && cur.init();
    this.last = performance.now(); this.acc = 0; this.frame = 0; this.drawnEnd = false;
    const loop = now => { this.raf = requestAnimationFrame(loop); this.acc = Math.min(100, this.acc + now - this.last); this.last = now;
      while (this.acc >= 1000/60){ this.acc -= 1000/60; if (!this.ended && !this.paused){ this.frame++; cur.step && cur.step(); } }
      if (cur.netAd && opt.net) NET.tick(cur.netAd);
      // ⚡ 게임이 끝나 결과 창(흐림 효과)이 떠 있으면 뒤 그림은 멈춰 둬요 — 매 장면 다시 그리면 흐림 계산이 아주 무거워요
      if (cur.draw && !(this.ended && this.drawnEnd)){ const g = this.g; g.setTransform(this.k, 0, 0, this.k, 0, 0); cur.draw(g); if (this.ended) this.drawnEnd = true; }
      if (this.frame % 6 === 0 && cur.hud) $("#ngHud").innerHTML = cur.hud(); };
    this.raf = requestAnimationFrame(loop);
  },
  fit(){
    const cur = this.cur; if (!cur) return; this.drawnEnd = false;
    const st = $("#ngStage").getBoundingClientRect();
    if (cur.dom){ cur.fit && cur.fit(st.width, st.height); return; }
    if (cur.layout) cur.layout(st.width - 6, st.height - 6);   // 가로·세로에 맞춰 게임판 모양을 바꾸는 게임
    const s = Math.min((st.width - 16)/cur.W, (st.height - 16)/cur.H), dpr = Math.min(2, window.devicePixelRatio || 1), cv = $("#ngCanvas");
    cv.style.width = cur.W*s + "px"; cv.style.height = cur.H*s + "px"; cv.width = Math.round(cur.W*s*dpr); cv.height = Math.round(cur.H*s*dpr);
    this.k = s*dpr; this.s = s; this.g = cv.getContext("2d");
  },
  pt(e){ const r = $("#ngCanvas").getBoundingClientRect(); return {x: (e.clientX - r.left)/r.width*this.cur.W, y: (e.clientY - r.top)/r.height*this.cur.H}; },
  stop(){ cancelAnimationFrame(this.raf); this.cur = null; },
  again(){ if (this.opt.net) NET.again(); else this.play(this.gid, this.sids, this.opt); },
  close(){ this.stop(); $("#ng").hidden = true; $("#ngHud").innerHTML = ""; ARC.back(); },
  conf(n){ return `<div class="ng-conf">${Array.from({length: n}, () => `<i style="left:${rnd(100)}%;background:${COLS[Math.floor(rnd(COLS.length))]};animation-duration:${2 + rnd(2.5)}s;animation-delay:${rnd(.8)}s"></i>`).join("")}</div>`; },
  /* 혼자 하는 게임 끝 */
  over(score, extra = ""){
    if (this.ended) return; this.ended = true;
    const sid = this.sids[0], res = saveRec(this.gid, sid, score);
    (res.isNew ? SFX.rec : SFX.over)();
    $("#ngOver").innerHTML = `${res.isNew ? this.conf(90) : ""}<div class="ng-box"><span class="avb">${avHTMLof(sid)}</span><h3>${res.isNew ? "🎉 새 기록!" : "게임 끝!"}</h3>
      <div class="sc">${score}점</div>
      <div class="info">${extra}${res.isNew && res.prevBest ? `<div class="new">전 기록 ${res.prevBest}점을 넘었어요!</div>` : ""}
        <div>내 최고 <b>${res.r.best}</b>점 · 오늘 최고 <b>${res.r.dayBest}</b>점 · ${res.r.plays}번째 도전</div>
        <div>🏆 우리 반 <b>${res.rank}</b>등 <small>/ ${res.n}명</small>${res.isNew && res.prevRank && res.rank < res.prevRank ? ` · ▲ ${res.prevRank - res.rank}계단!` : ""}</div>
        <div class="ng-coin">${res.coins ? `🪙 +${res.coins} 코인!` : "🪙 오늘 코인은 다 모았어요"} <small>내 코인 ${(walletOf(sid).coins || 0).toLocaleString()}</small></div></div>
      <div class="arc-row"><button class="arc-btn p" data-ng="again">🔁 다시 하기</button><button class="arc-btn" data-ng="home">🏠 홈으로</button></div></div>`;
    $("#ngOver").hidden = false;
  },
  /* 둘이 하는 게임 끝 */
  win(w, scoreTxt){
    if (this.ended) return; this.ended = true;
    const W = this.sids[w], L = this.sids[1 - w], cpu = this.opt.cpu, cpuWon = cpu && w === 1;
    const cn = ARC.duel(this.gid, W, L, cpu) || {w: 0, l: 0};
    (cpuWon ? SFX.over : SFX.rec)();
    $("#ngOver").innerHTML = `${cpuWon ? "" : this.conf(90)}<div class="ng-box">${cpuWon ? `<span class="f">🤖</span>` : `<span class="avb">${avHTMLof(W)}</span>`}<h3>${cpuWon ? "컴퓨터 승리!" : `🏆 ${esc(who(noOf_(W)))} 승리!`}</h3>
      <div class="sc">${scoreTxt}</div><div class="info">${cpu ? "🤖 컴퓨터 연습은 랭킹에 들어가지 않아요" : `이긴 친구 랭킹 +1승!<div class="ng-coin">🪙 ${esc(nameOf(noOf_(W)))} +${cn.w} · ${esc(nameOf(noOf_(L)))} +${cn.l}</div>`}</div>
      <div class="arc-row"><button class="arc-btn p" data-ng="again">🔁 한 판 더</button><button class="arc-btn" data-ng="home">🏠 홈으로</button></div></div>`;
    $("#ngOver").hidden = false;
  }
};
$("#ngOver").addEventListener("click", e => { const b = e.target.closest("[data-ng]"); if (!b) return; if (b.dataset.ng === "again") NG.again(); else NG.close(); });
$("#ngClose").onclick = () => NG.close();
window.addEventListener("resize", () => NG.cur && NG.fit());
(function(){
  const cv = $("#ngCanvas"), stg = $("#ngStage");
  stg.addEventListener("pointerdown", e => { const c = NG.cur; if (!c || NG.ended || e.target.closest(".ng-over")) return; getAC(); if (!c.dom) e.preventDefault(); const p = c.dom ? {x: e.clientX, y: e.clientY} : NG.pt(e); c.down && c.down(p.x, p.y, e.pointerId); try { stg.setPointerCapture(e.pointerId); } catch(er) {} });
  stg.addEventListener("pointermove", e => { const c = NG.cur; if (!c || NG.ended) return; const p = c.dom ? {x: e.clientX, y: e.clientY} : NG.pt(e); c.move && c.move(p.x, p.y, e.pointerId); });
  const up = e => { const c = NG.cur; if (!c) return; const p = c.dom ? {x: e.clientX, y: e.clientY} : NG.pt(e); c.up && c.up(p.x, p.y, e.pointerId); };
  stg.addEventListener("pointerup", up); stg.addEventListener("pointercancel", up);
  window.addEventListener("keydown", e => { const c = NG.cur; if (!c || $("#ng").hidden) return;
    if (e.key === "Escape"){ e.preventDefault(); NG.close(); return; }
    if (NG.ended){ if (e.code === "Enter" || e.code === "Space"){ e.preventDefault(); NG.again(); } return; }
    if (c.key && c.key(e.code, true, e)) e.preventDefault(); });
  window.addEventListener("keyup", e => { const c = NG.cur; if (c && c.key && !$("#ng").hidden) c.key(e.code, false, e); });
})();

/* =====================================================================
   🔨 두더지 잡기 — 40초 동안 튀어나오는 친구를 콩!
   ===================================================================== */
NG.defs.wm = () => {
  const W = 960, H = 600, T = 40*60;
  const HX = [210, 480, 750], HY = [235, 385, 535], KEYS = ["KeyQ","KeyW","KeyE","KeyA","KeyS","KeyD","KeyZ","KeyX","KeyC"];
  let holes, t, score, combo, best, next, fx, pops, hammer, shake, hits, miss;
  const friends = () => roster().map(s => sidOf(s.no));
  return { W, H,
    init(){ holes = Array.from({length: 9}, (_, i) => ({i, x: HX[i % 3], y: HY[Math.floor(i/3)], k: null, up: 0, life: 0, hit: 0})); t = T; score = 0; combo = 0; best = 0; next = 40; fx = []; pops = []; hammer = null; shake = 0; hits = 0; miss = 0; },
    spawn(){
      const free = holes.filter(h => !h.k); if (!free.length) return;
      const h = free[Math.floor(rnd(free.length))], p = 1 - t/T, r = rnd(1);
      h.k = r < .1 ? "gold" : r < .1 + .1 + p*.06 ? "bomb" : "friend";
      const fr = friends(); h.sid = fr[Math.floor(rnd(fr.length))];
      h.life = Math.round(95 - p*50); h.max = h.life; h.up = 0; h.hit = 0;
    },
    whack(h){
      if (!h.k || h.hit || h.up < .45) return false;
      const fever = t < 10*60;
      if (h.k === "bomb"){ score = Math.max(0, score - 3); combo = 0; shake = 14; SFX.bad(); fx.push({x: h.x, y: h.y - 70, s: "💥 -3", c: "#ff6b6b", t: 50}); h.hit = 30; return true; }
      combo++; best = Math.max(best, combo); hits++;
      let pts = (h.k === "gold" ? 3 : 1)*(fever ? 2 : 1); if (combo % 5 === 0){ pts += 2; fx.push({x: h.x, y: h.y - 120, s: `🔥 ${combo}콤보 +2`, c: "#ffa94d", t: 55}); }
      score += pts; h.hit = 26; (h.k === "gold" ? SFX.gold : SFX.hit)();
      fx.push({x: h.x, y: h.y - 80, s: `+${pts}`, c: h.k === "gold" ? "#ffe066" : "#fff", t: 40});
      for (let i = 0; i < 12; i++){ const a = rnd(Math.PI*2), s = rnd(2, 6); pops.push({x: h.x, y: h.y - 50, vx: Math.cos(a)*s, vy: Math.sin(a)*s - 2, t: 30, c: COLS[i % COLS.length]}); }
      return true;
    },
    down(x, y){
      hammer = {x, y, t: 12};
      const h = holes.find(h => Math.hypot(x - h.x, y - (h.y - 45)) < 85);
      if (!(h && this.whack(h))){ if (combo){ combo = 0; } miss++; tone(180, 140, .05, "sine", .05); }
    },
    key(code, d){ if (!d) return false; const i = KEYS.indexOf(code); if (i < 0 && !/^Numpad[1-9]$/.test(code)) return false;
      const k = i >= 0 ? i : [6,7,8,3,4,5,0,1,2][+code.slice(6) - 1]; const h = holes[k]; hammer = {x: h.x, y: h.y - 50, t: 12}; if (!this.whack(h)){ combo = 0; } return true; },
    step(){
      t--; if (t <= 0){ holes.forEach(h => h.k = null); NG.over(score, `<div>🔨 콩! <b>${hits}</b>번 · 최고 <b>${best}</b>콤보</div>`); return; }
      if (--next <= 0){ this.spawn(); if (t < 25*60 && rnd(1) < .35) this.spawn(); next = Math.round(48 - (1 - t/T)*28 + rnd(10)); }
      holes.forEach(h => { if (!h.k) return;
        if (h.hit){ h.hit--; h.up = Math.max(0, h.up - .05); if (!h.hit){ h.k = null; } return; }
        h.life--; h.up = h.life > h.max - 8 ? Math.min(1, h.up + .16) : h.life < 8 ? Math.max(0, h.up - .14) : 1;
        if (h.life <= 0){ if (h.k === "friend" || h.k === "gold"){ combo = 0; } h.k = null; } });
      fx = fx.filter(f => (f.y -= .8, --f.t > 0)); pops = pops.filter(p => (p.x += p.vx, p.y += p.vy, p.vy += .3, --p.t > 0));
      if (hammer && --hammer.t <= 0) hammer = null; if (shake > 0) shake *= .85;
    },
    draw(g){
      g.save(); if (shake > .5) g.translate(rnd(-shake, shake), rnd(-shake, shake));
      const fever = t < 10*60, sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, fever ? "#ff8787" : "#74c0fc"); sky.addColorStop(.35, fever ? "#ffc078" : "#a5d8ff"); sky.addColorStop(.36, "#8ce99a"); sky.addColorStop(1, "#51cf66");
      g.fillStyle = sky; g.fillRect(-20, -20, W + 40, H + 40);
      g.fillStyle = "rgba(255,255,255,.85)"; [[120, 70], [420, 50], [780, 80]].forEach(([x, y], i) => { const xx = (x + NG.frame*.2*(i + 1)) % (W + 200) - 100; g.beginPath(); g.arc(xx, y, 26, 0, 7); g.arc(xx + 30, y - 10, 30, 0, 7); g.arc(xx + 60, y, 24, 0, 7); g.fill(); });
      g.fillStyle = "rgba(43,138,62,.35)"; for (let i = 0; i < 60; i++){ const x = (i*97) % W, y = 230 + (i*53) % 360; g.fillRect(x, y, 3, 9); }
      holes.forEach(h => {
        g.fillStyle = "#5c3d1e"; g.beginPath(); g.ellipse(h.x, h.y, 92, 30, 0, 0, 7); g.fill();
        g.fillStyle = "#2b1a0b"; g.beginPath(); g.ellipse(h.x, h.y, 80, 22, 0, 0, 7); g.fill();
        if (h.k){
          const rise = 110*h.up, by = h.y - rise;
          g.save(); g.beginPath(); g.rect(h.x - 90, h.y - 220, 180, 220); g.ellipse(h.x, h.y, 80, 22, 0, 0, Math.PI); g.clip();
          if (h.k === "bomb"){ g.fillStyle = "#212529"; g.beginPath(); g.arc(h.x, by + 20, 46, 0, 7); g.fill(); g.font = `70px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("💣", h.x, by + 14);
            if (NG.frame % 20 < 10){ g.fillStyle = "#ffd43b"; g.beginPath(); g.arc(h.x + 30, by - 26, 6, 0, 7); g.fill(); } }
          else { g.fillStyle = h.k === "gold" ? "#fcc419" : "#a9764a"; rrect(g, h.x - 52, by - 30, 104, 140, 50); g.fill();
            g.fillStyle = h.k === "gold" ? "#fff3bf" : "#d8a878"; g.beginPath(); g.ellipse(h.x, by + 70, 34, 40, 0, 0, 7); g.fill();
            faceAt(g, h.sid, h.x, by + 6, 38, h.k === "gold" ? "#ffe066" : "#fff", h.hit > 0);
            if (h.k === "gold"){ g.font = `30px ${EMOJI}`; g.textAlign = "center"; g.fillText("⭐", h.x + 40, by - 34); } }
          g.restore();
        }
        g.fillStyle = "#5c3d1e"; g.beginPath(); g.ellipse(h.x, h.y + 2, 92, 30, 0, 0, Math.PI); g.fill();
      });
      pops.forEach(p => { g.globalAlpha = p.t/30; g.fillStyle = p.c; g.fillRect(p.x, p.y, 7, 7); }); g.globalAlpha = 1;
      fx.forEach(f => { g.globalAlpha = Math.min(1, f.t/20); outlined(g, f.s, f.x, f.y, 38, f.c); }); g.globalAlpha = 1;
      if (hammer){ g.save(); g.translate(hammer.x + 30, hammer.y - 30); g.rotate(-.9 + (12 - hammer.t)*.12); g.font = `90px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("🔨", 0, 0); g.restore(); }
      // 시간 막대
      g.fillStyle = "rgba(0,0,0,.25)"; rrect(g, 20, 16, W - 40, 20, 10); g.fill();
      g.fillStyle = fever ? "#ff6b6b" : "#ffe066"; rrect(g, 20, 16, (W - 40)*t/T, 20, 10); g.fill();
      outlined(g, `${score}점`, W/2, 74, 52, "#fff");
      if (fever) outlined(g, "🔥 피버 타임! 점수 2배", W/2, 124, 30, "#ffe066");
      else if (t > T - 150) outlined(g, "친구 얼굴을 콩! 💣는 피해요 · ⭐ 황금은 +3", W/2, 124, 28, "#fff");
      if (combo >= 2) outlined(g, `${combo}콤보`, W - 30, 74, 30, "#ffa94d", undefined, "right");
      g.restore();
    },
    hud(){ return `⏱️ <b>${Math.ceil(t/60)}</b>초 · 점수 <b>${score}</b>`; }
  };
};

/* =====================================================================
   🧱 벽돌깨기 — 내 얼굴 공으로 와장창
   ===================================================================== */
NG.defs.bk = () => {
  const W = 960, H = 640, PY = 594, BR = 13, COLN = 12, BW = 72, BH = 26, GAP = 4, BX = (W - COLN*(BW + GAP) + GAP)/2, BY = 90;
  let px, pw, tx, balls, bricks, items, lives, level, score, stuck, fx, wideT, slowT, keys, hitN;
  const me = () => NG.sids[0];
  function build(){
    bricks = []; const rows = Math.min(8, 3 + level);
    for (let r = 0; r < rows; r++) for (let c = 0; c < COLN; c++){
      if (level >= 3 && (r + c + level) % 7 === 0) continue;
      const hp = level >= 4 && r < 2 ? 3 : level >= 2 && (r + c) % 3 === 0 ? 2 : 1;
      bricks.push({x: BX + c*(BW + GAP), y: BY + r*(BH + GAP), hp, max: hp, c: COLS[r % COLS.length]});
    }
  }
  const speed = () => (6 + level*.45 + Math.min(2, hitN*.02))*(slowT > 0 ? .7 : 1);
  function newBall(){ stuck = true; balls = [{x: px, y: PY - BR - 2, vx: 0, vy: 0}]; }
  function launch(){ if (!stuck) return; stuck = false; const a = -Math.PI/2 + rnd(-.4, .4), s = speed(); balls.forEach(b => { b.vx = Math.cos(a)*s; b.vy = Math.sin(a)*s; }); SFX.jump(); }
  return { W, H,
    init(){ px = W/2; tx = px; pw = 130; lives = 3; level = 1; score = 0; items = []; fx = []; wideT = 0; slowT = 0; keys = new Set(); hitN = 0; build(); newBall(); },
    down(x){ tx = x; launch(); }, move(x){ tx = x; },
    key(code, d){ if (["ArrowLeft","ArrowRight","KeyA","KeyD"].includes(code)){ d ? keys.add(code) : keys.delete(code); return true; } if (d && (code === "Space" || code === "ArrowUp")){ launch(); return true; } return false; },
    step(){
      if (keys.has("ArrowLeft") || keys.has("KeyA")) tx = px - 16; if (keys.has("ArrowRight") || keys.has("KeyD")) tx = px + 16;
      if (wideT > 0) wideT--; if (slowT > 0) slowT--;
      pw += ((wideT > 0 ? 210 : 130) - pw)*.15; px += (clampN(tx, pw/2, W - pw/2) - px)*.45; px = clampN(px, pw/2, W - pw/2);
      if (stuck){ balls[0].x = px; balls[0].y = PY - BR - 2; }
      else for (const b of balls){
        const s = Math.hypot(b.vx, b.vy), want = speed(); if (Math.abs(s - want) > .05){ b.vx *= want/s; b.vy *= want/s; }
        for (let k = 0; k < 4; k++){
          b.x += b.vx/4; b.y += b.vy/4;
          if (b.x < BR){ b.x = BR; b.vx = Math.abs(b.vx); SFX.wall(); } if (b.x > W - BR){ b.x = W - BR; b.vx = -Math.abs(b.vx); SFX.wall(); }
          if (b.y < BR){ b.y = BR; b.vy = Math.abs(b.vy); SFX.wall(); }
          if (b.vy > 0 && b.y + BR >= PY && b.y + BR <= PY + 18 && Math.abs(b.x - px) <= pw/2 + BR*.6){
            const off = clampN((b.x - px)/(pw/2), -1, 1), a = -Math.PI/2 + off*1.05, sp = Math.hypot(b.vx, b.vy); b.vx = Math.cos(a)*sp; b.vy = Math.sin(a)*sp; b.y = PY - BR; SFX.pong(); }
          for (const br of bricks){ if (br.hp <= 0) continue;
            const cx = clampN(b.x, br.x, br.x + BW), cy = clampN(b.y, br.y, br.y + BH), dx = b.x - cx, dy = b.y - cy;
            if (dx*dx + dy*dy <= BR*BR){
              if (Math.abs(dx) > Math.abs(dy)) b.vx = Math.sign(dx || -b.vx)*Math.abs(b.vx); else b.vy = Math.sign(dy || -b.vy)*Math.abs(b.vy);
              br.hp--; hitN++;
              if (br.hp <= 0){ score += 10*level; SFX.hit(); for (let i = 0; i < 8; i++) fx.push({x: br.x + BW/2, y: br.y + BH/2, vx: rnd(-4, 4), vy: rnd(-4, 2), t: 28, c: br.c});
                if (rnd(1) < .16){ const ks = lives >= 5 ? ["wide","multi","slow"] : ["wide","multi","life","slow"]; items.push({x: br.x + BW/2, y: br.y + BH/2, k: ks[Math.floor(rnd(ks.length))]}); } }
              else tone(900, 900, .04, "square", .05);
              break; } }
        }
      }
      if (!stuck){ balls = balls.filter(b => b.y < H + 30);
        if (!balls.length){ lives--; SFX.bad(); fx.push({x: px, y: PY - 40, s: "💔", t: 50}); if (lives <= 0){ NG.over(score, `<div>🧱 <b>${level}</b>단계까지 · 벽돌 <b>${hitN}</b>번 맞혔어요</div>`); return; } newBall(); } }
      items.forEach(it => { it.y += 3; if (it.y > PY - 10 && it.y < PY + 20 && Math.abs(it.x - px) < pw/2 + 16){ it.got = true; SFX.item();
        if (it.k === "wide") wideT = 600; else if (it.k === "slow") slowT = 480; else if (it.k === "life") lives++;
        else if (it.k === "multi"){ const add = []; balls.slice(0, 4).forEach(b => { if (stuck) return; [-.5, .5].forEach(da => { const a = Math.atan2(b.vy, b.vx) + da, s = Math.hypot(b.vx, b.vy); add.push({x: b.x, y: b.y, vx: Math.cos(a)*s, vy: Math.sin(a)*s}); }); }); balls.push(...add); }
        fx.push({x: px, y: PY - 50, s: {wide: "↔️ 넓어져요!", multi: "✨ 공이 여러 개!", life: "❤️ 목숨 +1", slow: "🐢 천천히"}[it.k], t: 50}); } });
      items = items.filter(it => !it.got && it.y < H + 20);
      if (!bricks.some(b => b.hp > 0)){ score += 100*level; level++; SFX.rec(); fx.push({x: W/2, y: H/2, s: `🎉 ${level}단계!`, t: 80, big: 1}); items = []; build(); newBall(); }
      fx = fx.filter(f => (f.vx !== undefined ? (f.x += f.vx, f.y += f.vy, f.vy += .25) : (f.y -= .6), --f.t > 0));
    },
    draw(g){
      const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, ["#1b1642","#0b3d6e","#3b1d75","#5c0a2e"][(level - 1) % 4]); bg.addColorStop(1, "#0d0a24"); g.fillStyle = bg; g.fillRect(0, 0, W, H);
      g.fillStyle = "rgba(255,255,255,.5)"; for (let i = 0; i < 40; i++) g.fillRect((i*137) % W, (i*71 + NG.frame*.3*(1 + i % 3)) % H, 2, 2);
      bricks.forEach(b => { if (b.hp <= 0) return; g.fillStyle = b.c; rrect(g, b.x, b.y, BW, BH, 7); g.fill();
        g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(b.x + 5, b.y + 4, BW - 10, 5);
        if (b.max > 1){ g.fillStyle = `rgba(0,0,0,${.18*(b.hp - 1) + .05})`; rrect(g, b.x, b.y, BW, BH, 7); g.fill(); outlined(g, "★".repeat(b.hp), b.x + BW/2, b.y + BH/2 + 1, 15, "#fff"); } });
      items.forEach(it => { g.fillStyle = {wide: "#4dabf7", multi: "#da77f2", life: "#ff6b6b", slow: "#69db7c"}[it.k]; g.beginPath(); g.arc(it.x, it.y, 18, 0, 7); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 3; g.stroke();
        g.font = `20px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText({wide: "↔️", multi: "✨", life: "❤️", slow: "🐢"}[it.k], it.x, it.y + 1); });
      const pg = g.createLinearGradient(0, PY, 0, PY + 16); pg.addColorStop(0, wideT > 0 ? "#74c0fc" : "#ffe066"); pg.addColorStop(1, wideT > 0 ? "#1c7ed6" : "#f08c00");
      g.fillStyle = pg; rrect(g, px - pw/2, PY, pw, 16, 8); g.fill(); g.fillStyle = "rgba(255,255,255,.5)"; g.fillRect(px - pw/2 + 10, PY + 3, pw - 20, 3);
      balls.forEach(b => { g.fillStyle = "rgba(255,255,255,.12)"; g.beginPath(); g.arc(b.x - b.vx*1.5, b.y - b.vy*1.5, BR, 0, 7); g.fill(); faceAt(g, me(), b.x, b.y, BR, "#ffe066"); });
      fx.forEach(f => { if (f.s){ g.globalAlpha = Math.min(1, f.t/20); outlined(g, f.s, f.x, f.y, f.big ? 60 : 30, "#fff"); } else { g.globalAlpha = f.t/28; g.fillStyle = f.c; g.fillRect(f.x, f.y, 6, 6); } }); g.globalAlpha = 1;
      outlined(g, `${score}`, W/2, 44, 44); outlined(g, "❤️".repeat(Math.min(lives, 6)), 20, 44, 26, "#fff", undefined, "left"); outlined(g, `${level}단계`, W - 20, 44, 28, "#c5f6fa", undefined, "right");
      if (stuck) outlined(g, "화면을 눌러 공 쏘기! 손가락으로 막대를 움직여요", W/2, PY - 70, 26, "#ffe066");
    },
    hud(){ return `점수 <b>${score}</b> · ${level}단계 · 목숨 <b>${lives}</b>`; }
  };
};

/* =====================================================================
   🏃 점프 달리기 — 톡 눌러 점프 (공중에서 한 번 더!)
   ===================================================================== */
NG.defs.rn = () => {
  /* 🏃 점프 달리기 2 — 맵 7개 · 아이템 7개 · 그리기 최적화
     (배경은 맵마다 한 번만 그려 둔 그림을 밀어서 보여 주고, 글자·얼굴·이모지는 그림으로 기억해 붙여요) */
  const W = 960, H = 560, GY = 470, PX = 190, R = 26, MAPLEN = 9000;
  const MAPS = [
    {n: "🏫 학교 운동장", sky: ["#1c7ed6", "#a5d8ff"], far: "#74c0fc", near: "#40c057", ground: "#2f9e44", edge: "#b2f2bb", stripe: "#237032",
     obs: ["📚", "📦", "🚧"], fly: "🐦", deco: ["🌳", "🏫", "🌳", "⚽"], sun: "#ffe066"},
    {n: "🌆 노을 도시", sky: ["#e8590c", "#ffd8a8"], far: "#c2255c", near: "#5f3dc4", ground: "#495057", edge: "#ffd43b", stripe: "#343a40",
     obs: ["🗑️", "🚧", "🛴"], fly: "🕊️", deco: ["🏢", "🏬", "🏪"], city: true, sun: "#ff8787"},
    {n: "🌲 깊은 숲", sky: ["#0ca678", "#c3fae8"], far: "#2b8a3e", near: "#1b4d2b", ground: "#6b4226", edge: "#94d82d", stripe: "#4a2c17",
     obs: ["🪵", "🍄", "🪨"], fly: "🐝", deco: ["🌲", "🌲", "🌳", "🦌"]},
    {n: "🏜️ 뜨거운 사막", sky: ["#f76707", "#ffe8cc"], far: "#e8a35a", near: "#d08a3c", ground: "#c98d45", edge: "#ffd8a8", stripe: "#a86e2f",
     obs: ["🌵", "🪨", "🦂"], fly: "🦅", deco: ["🌵", "🐪", "🌵"], sun: "#fff3bf"},
    {n: "❄️ 눈 나라", sky: ["#1864ab", "#d0ebff"], far: "#e7f5ff", near: "#ffffff", ground: "#dbe4ff", edge: "#ffffff", stripe: "#bac8ff",
     obs: ["⛄", "🧊", "🎄"], fly: "🦉", deco: ["🎄", "🏔️", "⛄"], snow: true},
    {n: "🌌 우주 정거장", sky: ["#0b0b2b", "#3b2a6b"], far: "#5f3dc4", near: "#2b1d5c", ground: "#495057", edge: "#74c0fc", stripe: "#343a40",
     obs: ["🪨", "👾", "🛰️"], fly: "☄️", deco: ["🪐", "🌙", "🛸"], stars: true, grav: .62},
    {n: "🌋 불꽃 화산", sky: ["#3b0a0a", "#e03131"], far: "#5c1a1a", near: "#2b0b0b", ground: "#3d1f1f", edge: "#ff922b", stripe: "#5c2a1a",
     obs: ["🔥", "🪨", "🌋"], fly: "🐉", deco: ["🌋", "🔥"], ember: true}
  ];
  const ITEMS = {
    shield: {e: "🛡️", n: "방패! 한 번 막아 줘요", t: 0},
    magnet: {e: "🧲", n: "자석! 사탕이 끌려와요", t: 480},
    star:   {e: "⭐", n: "무적 별! 장애물을 부숴요", t: 330},
    rocket: {e: "🚀", n: "로켓 발사!", t: 240},
    slow:   {e: "🐢", n: "느림보 시간", t: 360},
    wings:  {e: "🪽", n: "날개! 3단 점프", t: 600},
    x2:     {e: "💎", n: "점수 2배!", t: 480}
  };
  const IK = Object.keys(ITEMS);
  let p, obs, coins, items, pts, bonus, dist, sp, next, nextItem, candies, fx, parts, flakes, jumpsLeft, over, act, shield, invul, mapI, fade, lay, layPrev, layK, banner;
  const score = () => Math.floor(pts) + bonus;
  const mult = () => act.x2 > 0 ? 2 : 1;
  const M = () => MAPS[mapI];

  /* ---- 맵 그림: 한 번만 그려 두기 ---- */
  function canvasOf(w, h, k, fn){ const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w*k)); c.height = Math.max(1, Math.ceil(h*k)); const x = c.getContext("2d"); x.scale(k, k); fn(x); return c; }
  // 옆으로 이어 붙이는 배경: 가로를 화면 점 수에 딱 맞춰서 이음매에 틈(세로 줄)이 안 생기게
  function stripOf(h, k, fn){ const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(W*k)); c.height = Math.max(1, Math.ceil(h*k)); const x = c.getContext("2d"); x.scale(c.width/W, k); fn(x); return c; }
  function hills(x, col, base, amp, f1, f2, ph){
    x.fillStyle = col; x.beginPath(); x.moveTo(-16, GY);
    for (let i = -16; i <= W + 16; i += 8) x.lineTo(i, base - amp*(.6*Math.sin(2*Math.PI*i/W*f1 + ph) + .4*Math.sin(2*Math.PI*i/W*f2 + ph*1.7)) - amp);
    x.lineTo(W + 16, GY); x.closePath(); x.fill();
  }
  function build(m, k){
    const sky = m.sky;
    const far = stripOf(GY, k, x => {
      if (m.stars){ for (let i = 0; i < 110; i++){ x.globalAlpha = .35 + (i*37 % 60)/100; x.fillStyle = "#fff"; const s = i % 7 === 0 ? 3 : 2; x.fillRect((i*157) % W, (i*89) % (GY*.75), s, s); } x.globalAlpha = 1; }
      if (m.sun){ x.fillStyle = m.sun; x.globalAlpha = .35; x.beginPath(); x.arc(W*.72, 110, 62, 0, 7); x.fill(); x.globalAlpha = 1; x.beginPath(); x.arc(W*.72, 110, 44, 0, 7); x.fill(); }
      if (m.city){ x.fillStyle = m.far; for (let i = 0; i < 16; i++){ const bw = 40 + (i*53 % 40), bh = 90 + (i*71 % 130); x.fillRect(i*W/16, GY - bh, bw, bh); x.fillRect(i*W/16 - W, GY - bh, bw, bh); } }
      else hills(x, m.far, GY - 120, 70, 2, 3, .7);
    });
    const NH = 230;
    const near = stripOf(NH, k, x => {
      x.translate(0, -(GY - NH));
      if (m.city){ x.fillStyle = m.near; for (let i = 0; i < 12; i++){ const bw = 60 + (i*31 % 30), bh = 70 + (i*47 % 90); x.fillRect(i*W/12 + 10, GY - bh, bw, bh); x.fillStyle = "rgba(255,236,153,.85)"; for (let r = GY - bh + 12; r < GY - 14; r += 22) for (let c2 = i*W/12 + 18; c2 < i*W/12 + 10 + bw - 12; c2 += 18) if ((r + c2) % 3) x.fillRect(c2, r, 8, 10); x.fillStyle = m.near; } }
      else hills(x, m.near, GY - 40, 34, 3, 5, 2.1);
      x.font = `46px ${EMOJI}`; x.textAlign = "center"; x.textBaseline = "bottom";
      m.deco.forEach((e, i) => { const dx = (i + .5)*W/m.deco.length; [dx, dx - W, dx + W].forEach(z => x.fillText(e, z, GY + 2)); });
    });
    return {sky, far, near, NH};
  }
  // ⚡ 미리 그린 그림을 화면 점에 딱 맞춰(늘이거나 줄이지 않고) 그대로 복사해요 — 가장 빠르고 선명해요
  function strip(g, c, o, y){ const k = layK, cw = c.width/k, ch = c.height/k, ox = Math.round(((o % cw) + cw) % cw*k)/k, yy = Math.round(y*k)/k;
    g.drawImage(c, -ox, yy, cw, ch); g.drawImage(c, cw - ox, yy, cw, ch); }
  function drawLayers(g, L){
    if (!L.grad){ L.grad = g.createLinearGradient(0, 0, 0, GY); L.grad.addColorStop(0, L.sky[0]); L.grad.addColorStop(1, L.sky[1]); }
    g.fillStyle = L.grad; g.fillRect(0, 0, W, GY);
    strip(g, L.far, dist*.12, 0);
    strip(g, L.near, dist*.4, GY - L.NH);
  }
  /* ---- 글자 그림 기억 (점수판 글자를 매 장면 다시 쓰지 않게) ---- */
  const TS = new Map();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => TS.clear());   // 글꼴(Jua)이 늦게 오면 다시 그려요
  function txt(g, s, x, y, size, fill = "#fff", align = "center"){
    const k = g.getTransform().a, key = `${s}|${size}|${fill}|${k.toFixed(2)}`;
    let c = TS.get(key);
    if (!c){
      if (TS.size > 120) TS.clear();
      const mx = g.font; g.font = `${size}px "Jua",sans-serif`; const w = g.measureText(s).width + size*.6; g.font = mx;
      c = canvasOf(w, size*1.6, k, x2 => outlined(x2, s, w/2, size*.8, size, fill)); c.w = w; c.h = size*1.6; TS.set(key, c);
    }
    const ax = align === "center" ? x - c.w/2 : align === "right" ? x - c.w + size*.3 : x - size*.3;
    g.drawImage(c, ax, y - c.h/2, c.w, c.h);
  }

  function jump(){
    if (over || act.rocket > 0) return;
    if (jumpsLeft > 0){ const max = act.wings > 0 ? 3 : 2; p.vy = jumpsLeft === max ? -15 : -12.5; jumpsLeft--; SFX.jump();
      for (let i = 0; i < 5; i++) parts.push({x: PX - 10, y: p.y + R, vx: rnd(-3, 0), vy: rnd(-2, 0), t: 20, c: "#fff", s: 5}); }
  }
  function burst(x, y, c, n = 12){ for (let i = 0; i < n && parts.length < 90; i++) parts.push({x, y, vx: rnd(-6, 6), vy: rnd(-7, 2), t: 30, c, s: rnd(3, 7)}); }
  function spawn(){
    const m = M(), r = rnd(1), lvl = Math.min(1, dist/40000), e = m.obs[Math.floor(rnd(m.obs.length))];
    if (r < .4) obs.push({k: "box", x: W + 40, w: 46, h: rnd(42, 70 + lvl*30), e});
    else if (r < .62) obs.push({k: "box", x: W + 40, w: 52, h: 56, e: m.obs[1]});
    else if (r < .8 && dist > 2500) obs.push({k: "bird", x: W + 40, w: 52, h: 40, y: GY - (rnd(1) < .5 ? 92 : 150), e: m.fly});
    else { obs.push({k: "box", x: W + 40, w: 46, h: 48, e}); obs.push({k: "box", x: W + 40 + 58, w: 46, h: 76, e}); }
    const n = 3 + Math.floor(rnd(4)), cx = W + 260 + rnd(80), high = rnd(1) < .5, gold = rnd(1) < .1;
    for (let i = 0; i < n; i++) coins.push({x: cx + i*44, y: GY - (high ? 150 + Math.sin(i/Math.max(1, n - 1)*Math.PI)*60 : 40), gold: gold && i === n >> 1});
  }
  function getItem(k){
    SFX.item(); const I = ITEMS[k];
    if (k === "shield") shield = true; else act[k] = I.t;
    if (k === "rocket"){ p.vy = 0; }
    if (k === "wings") jumpsLeft = Math.max(jumpsLeft, 1);
    fx.push({x: PX + 40, y: p.y - 60, s: `${I.e} ${I.n}`, t: 70, big: 1});
    burst(PX, p.y, "#ffe066", 16);
  }
  function hit(o){
    if (act.star > 0 || act.rocket > 0){ o.dead = true; bonus += 15*mult(); SFX.hit(); burst(o.x, GY - 30, "#ffd43b"); fx.push({x: o.x, y: GY - 90, s: `+${15*mult()}`, t: 30}); return false; }
    if (invul > 0) return false;
    if (shield){ shield = false; invul = 70; o.dead = true; SFX.wall(); burst(PX, p.y, "#74c0fc", 18); fx.push({x: PX, y: p.y - 60, s: "🛡️ 막았다!", t: 45}); return false; }
    return true;
  }

  return { W, H,
    init(){
      p = {y: GY - R, vy: 0}; obs = []; coins = []; items = []; pts = 0; bonus = 0; dist = 0; sp = 7; next = 90; nextItem = 360;
      candies = 0; fx = []; parts = []; flakes = []; jumpsLeft = 2; over = false; shield = false; invul = 0; mapI = 0; fade = 0; lay = layPrev = null; layK = 0; banner = 120;
      act = {}; IK.forEach(k => act[k] = 0);
    },
    down(){ jump(); },
    key(code, d){ if (d && ["Space","ArrowUp","KeyW","Enter"].includes(code)){ jump(); return true; } return false; },
    step(){
      if (over){ if (--over.t <= 0) NG.over(score(), `<div>🏃 <b>${Math.floor(dist/40)}</b>m · 🍬 사탕 <b>${candies}</b>개 · 🗺️ ${M().n}까지!</div>`);
        fx = fx.filter(f => (f.y -= .7, --f.t > 0)); parts = parts.filter(q => (q.x += q.vx, q.y += q.vy, q.vy += .3, --q.t > 0)); return; }
      const m = M(), lap = Math.floor(dist/(MAPLEN*MAPS.length));
      let base = Math.min(15.5, 7 + dist/2600) + Math.min(2, lap);
      if (act.slow > 0) base *= .62;
      sp = act.rocket > 0 ? base*1.5 : base;
      dist += sp; pts += sp/40*mult();
      IK.forEach(k => { if (act[k] > 0) act[k]--; }); if (invul > 0) invul--;
      // 맵 바뀜
      const mi = Math.floor(dist/MAPLEN) % MAPS.length;
      if (mi !== mapI){ mapI = mi; layPrev = lay; lay = null; fade = 60; banner = 120; SFX.gold(); nextItem = Math.min(nextItem, 60); }
      // 나
      if (act.rocket > 0){ p.y += (GY - 210 - p.y)*.12; p.vy = 0; jumpsLeft = 0; parts.length < 90 && parts.push({x: PX - 30, y: p.y + 18, vx: -sp*.5, vy: rnd(-1, 1), t: 18, c: rnd(1) < .5 ? "#ff922b" : "#ffe066", s: rnd(4, 8)}); if (act.rocket === 1) invul = 60; }
      else { const gv = (m.grav || 1)*(act.wings > 0 ? .8 : 1); p.vy += .82*gv; p.y += p.vy; if (p.y >= GY - R){ p.y = GY - R; p.vy = 0; jumpsLeft = act.wings > 0 ? 3 : 2; } }
      if (--next <= 0){ spawn(); next = Math.round(rnd(52, 95)*7/sp + 30); }
      if (--nextItem <= 0){ items.push({k: IK[Math.floor(rnd(IK.length))], x: W + 40, y: GY - rnd(80, 170)}); nextItem = Math.round(rnd(420, 720)); }
      for (const o of obs) o.x -= sp; for (const c of coins) c.x -= sp; for (const it of items) it.x -= sp;
      // 자석·로켓: 사탕 끌어오기
      if (act.magnet > 0 || act.rocket > 0) for (const c of coins){ const dx = PX - c.x, dy = p.y - c.y, d = Math.hypot(dx, dy); if (d < 300 && d > 1){ c.x += dx/d*14; c.y += dy/d*14; } }
      const hr = R*.68;
      for (const o of obs){ if (o.dead) continue; const top = o.k === "bird" ? o.y - o.h/2 : GY - o.h, bot = o.k === "bird" ? o.y + o.h/2 : GY, l = o.x - o.w/2 + 6, r = o.x + o.w/2 - 6;
        const cx = clampN(PX, l, r), cy = clampN(p.y, top + 6, bot);
        if ((PX - cx)**2 + (p.y - cy)**2 < hr*hr && hit(o)){ over = {t: 50}; SFX.bad(); fx.push({x: PX, y: p.y - 50, s: "앗!", t: 50}); return; } }
      for (const c of coins) if (Math.hypot(c.x - PX, c.y - p.y) < R + 16){ c.got = true; const v = (c.gold ? 20 : 5)*mult(); bonus += v; candies++; SFX.pt(); if (fx.length < 12) fx.push({x: c.x, y: c.y - 20, s: `+${v}`, t: 30}); }
      for (const it of items) if (Math.hypot(it.x - PX, it.y - p.y) < R + 24){ it.got = true; getItem(it.k); }
      obs = obs.filter(o => o.x > -80 && !o.dead); coins = coins.filter(c => c.x > -40 && !c.got); items = items.filter(i => i.x > -40 && !i.got);
      if (NG.frame % 3 === 0 && p.y >= GY - R - 1 && parts.length < 90) parts.push({x: PX - 18, y: GY - 4, vx: -sp*.3, vy: rnd(-1.5, 0), t: 18, c: "#fff", s: 5});
      parts = parts.filter(q => (q.x += q.vx, q.y += q.vy, q.vy += .15, --q.t > 0)); fx = fx.filter(f => (f.y -= .7, --f.t > 0));
      if (m.snow || m.ember){ if (flakes.length < 45) flakes.push({x: rnd(W + 200), y: m.snow ? -10 : GY + 5, v: rnd(1, 2.6)});
        flakes.forEach(f => { f.x -= sp*.25 + (m.snow ? .5 : 0); f.y += m.snow ? f.v : -f.v; }); flakes = flakes.filter(f => f.x > -10 && f.y < GY + 10 && f.y > -20); }
      else if (flakes.length) flakes = [];
      if (fade > 0) fade--; if (banner > 0) banner--;
    },
    draw(g){
      const k = g.getTransform().a;
      if (k !== layK){ layK = k; lay = null; layPrev = null; }
      if (!lay) lay = build(M(), k);
      const m = M();
      if (fade > 0 && layPrev){ drawLayers(g, layPrev); g.globalAlpha = 1 - fade/60; drawLayers(g, lay); g.globalAlpha = 1; }
      else { layPrev = null; drawLayers(g, lay); }
      // 땅
      g.fillStyle = m.ground; g.fillRect(0, GY, W, H - GY);
      g.fillStyle = m.edge; g.fillRect(0, GY, W, 6);
      g.fillStyle = m.stripe; for (let x = -(dist % 48); x < W; x += 48) g.fillRect(x, GY + 22, 24, 7);
      // 눈·불씨
      if (flakes.length){ g.fillStyle = m.snow ? "#fff" : "#ff922b"; for (const f of flakes) g.fillRect(f.x, f.y, 4, 4); }
      // 사탕·아이템
      g.font = `30px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle";
      const bob = NG.frame*.15;
      for (const c of coins) g.fillText(c.gold ? "🍭" : "🍬", c.x, c.y + Math.sin(bob + c.x*.05)*3);
      g.font = `40px ${EMOJI}`;
      for (const it of items){ const y = it.y + Math.sin(bob + it.x*.03)*6; g.fillStyle = "rgba(255,255,255,.55)"; g.beginPath(); g.arc(it.x, y, 28, 0, 7); g.fill(); g.strokeStyle = "#ffe066"; g.lineWidth = 4; g.stroke(); g.fillText(ITEMS[it.k].e, it.x, y + 2); }
      // 장애물
      for (const o of obs){ g.font = `${o.k === "bird" ? 46 : o.w + 4}px ${EMOJI}`; g.textAlign = "center";
        if (o.k === "bird"){ g.textBaseline = "middle"; g.save(); g.translate(o.x, o.y + Math.sin(NG.frame*.3)*4); g.scale(-1, 1); g.fillText(o.e, 0, 0); g.restore(); }
        else { g.textBaseline = "bottom"; const n = Math.max(1, Math.round(o.h/(o.w*.9))); for (let i = 0; i < n; i++) g.fillText(o.e, o.x, GY - i*o.h/n + 4); } }
      for (const q of parts){ g.globalAlpha = Math.min(1, q.t/20); g.fillStyle = q.c; g.fillRect(q.x - q.s/2, q.y - q.s/2, q.s, q.s); } g.globalAlpha = 1;
      // 나
      const blink = invul > 0 && (invul >> 2) % 2 === 0;
      if (!blink){
        if (act.rocket > 0){ g.save(); g.translate(PX - 4, p.y + 22); g.rotate(Math.PI/4); g.font = `56px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("🚀", 0, 0); g.restore(); }
        else { const run = p.y >= GY - R - 1 ? Math.sin(NG.frame*.45) : 0;
          g.strokeStyle = "#212529"; g.lineWidth = 6; g.lineCap = "round"; g.beginPath();
          g.moveTo(PX - 6, p.y + R - 4); g.lineTo(PX - 6 + run*12, p.y + R + 12); g.moveTo(PX + 6, p.y + R - 4); g.lineTo(PX + 6 - run*12, p.y + R + 12); g.stroke(); }
        if (act.wings > 0){ g.font = `40px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("🪽", PX - 30, p.y - 6 + Math.sin(NG.frame*.4)*4); }
        if (act.star > 0){ g.strokeStyle = `hsl(${(NG.frame*12) % 360},100%,60%)`; g.lineWidth = 6; g.beginPath(); g.arc(PX, p.y, R + 10, 0, 7); g.stroke(); }
        if (shield){ g.fillStyle = "rgba(116,192,252,.28)"; g.strokeStyle = "#4dabf7"; g.lineWidth = 3; g.beginPath(); g.arc(PX, p.y, R + 14, 0, 7); g.fill(); g.stroke(); }
        g.save(); g.translate(PX, p.y); g.rotate(p.vy*.02); faceAt(g, NG.sids[0], 0, 0, R, act.star > 0 ? "#fff" : "#ffe066", !!over); g.restore();
      }
      // 글자
      for (const f of fx){ g.globalAlpha = Math.min(1, f.t/15); txt(g, f.s, f.x, f.y, f.big ? 30 : 28, "#ffe066"); } g.globalAlpha = 1;
      txt(g, `${score()}점`, W/2, 42, 46);
      txt(g, `🍬 ${candies}`, W - 20, 40, 28, "#fff", "right");
      if (mult() > 1) txt(g, "💎 x2", W/2, 88, 26, "#91a7ff");
      // 켜진 아이템 남은 시간
      let ix = 18;
      g.font = `26px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle";
      const on = IK.filter(kk => kk !== "shield" && act[kk] > 0);
      if (shield) on.unshift("shield");
      for (const kk of on){
        g.fillStyle = "rgba(20,15,46,.55)"; g.fillRect(ix, 16, 44, 52);
        g.fillText(ITEMS[kk].e, ix + 22, 36);
        if (kk !== "shield"){ g.fillStyle = "#ffe066"; g.fillRect(ix + 4, 58, 36*act[kk]/ITEMS[kk].t, 5); }
        ix += 50;
      }
      if (banner > 0){ g.globalAlpha = Math.min(1, banner/20); txt(g, m.n, W/2, 160, 52, "#fff"); g.globalAlpha = 1; }
      if (dist < 900) txt(g, "화면을 톡! 점프 · 공중에서 한 번 더 톡! 2단 점프", W/2, 220, 26, "#fff");
    },
    hud(){ return `점수 <b>${score()}</b> · 🍬 ${candies} · ${M().n}`; },
    _t: {go(d){ dist = d; }, give(k){ getItem(k); }, god(){ invul = 1e9; }, info(){ return {mapI, dist: Math.round(dist), sp: +sp.toFixed(1), act: {...act}, shield, obs: obs.length, items: items.length}; }}
  };
};

/* =====================================================================
   🔢 2048 — 밀어서 같은 숫자 합치기
   ===================================================================== */
NG.defs.tw = () => {
  const N = 4, BADGE = {64: "🍀", 128: "⭐", 256: "🌈", 512: "🔥", 1024: "👑", 2048: "💎", 4096: "🚀"};
  const TC = {2: ["#eee4da","#5c4b37"], 4: ["#ede0c8","#5c4b37"], 8: ["#ffa94d","#fff"], 16: ["#ff922b","#fff"], 32: ["#ff6b6b","#fff"], 64: ["#fa5252","#fff"], 128: ["#ffe066","#5c4b37"], 256: ["#fcc419","#5c4b37"], 512: ["#69db7c","#fff"], 1024: ["#4dabf7","#fff"], 2048: ["#da77f2","#fff"]};
  let grid, tiles, score, idc, board, cell, gap, sw, moving, maxV;
  const pos = (r, c) => `translate(${gap + c*(cell + gap)}px, ${gap + r*(cell + gap)}px)`;
  function add(){ const e = []; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!grid[r][c]) e.push([r, c]); if (!e.length) return;
    const [r, c] = e[Math.floor(rnd(e.length))], t = {id: ++idc, v: rnd(1) < .9 ? 2 : 4, r, c, isNew: true}; grid[r][c] = t; tiles.push(t); }
  function render(){
    board.querySelectorAll(".tw-tile").forEach(el => { if (!tiles.find(t => t.id == el.dataset.id)) el.remove(); });
    tiles.forEach(t => { let el = board.querySelector(`[data-id="${t.id}"]`);
      if (!el){ el = document.createElement("div"); el.className = "tw-tile"; el.dataset.id = t.id; board.appendChild(el); }
      const [bg, fg] = TC[t.v] || ["#3b3180","#fff"], fs = cell*(t.v < 100 ? .46 : t.v < 1000 ? .38 : .3);
      el.style.cssText = `width:${cell}px;height:${cell}px;transform:${pos(t.r, t.c)};--p:${pos(t.r, t.c)};background:${bg};color:${fg};font-size:${fs}px;${t.v >= 128 ? `box-shadow:0 0 ${Math.min(30, t.v/40)}px ${bg},inset 0 -5px 0 rgba(0,0,0,.15)` : ""}`;
      el.innerHTML = `${t.v}${BADGE[t.v] ? `<span class="fc">${BADGE[t.v]}</span>` : ""}`;
      el.classList.toggle("new", !!t.isNew); el.classList.toggle("pop", !!t.merged); t.isNew = false; t.merged = false; });
  }
  function canMove(){ for (let r = 0; r < N; r++) for (let c = 0; c < N; c++){ const t = grid[r][c]; if (!t) return true; if (c < N - 1 && grid[r][c + 1] && grid[r][c + 1].v === t.v) return true; if (r < N - 1 && grid[r + 1][c] && grid[r + 1][c].v === t.v) return true; } return false; }
  function move(dir){
    if (moving || NG.ended) return; const dr = {up: -1, down: 1, left: 0, right: 0}[dir], dc = {left: -1, right: 1, up: 0, down: 0}[dir];
    let moved = false, gain = 0; const done = new Set(), dead = [];
    const rs = [...Array(N).keys()], cs = [...Array(N).keys()]; if (dr > 0) rs.reverse(); if (dc > 0) cs.reverse();
    for (const r of rs) for (const c of cs){ const t = grid[r][c]; if (!t) continue; let nr = r, nc = c;
      while (true){ const rr = nr + dr, cc = nc + dc; if (rr < 0 || rr >= N || cc < 0 || cc >= N) break; const o = grid[rr][cc];
        if (!o){ nr = rr; nc = cc; continue; }
        if (o.v === t.v && !done.has(o.id)){ grid[r][c] = null; t.r = rr; t.c = cc; dead.push(t); o.v *= 2; o.merged = true; done.add(o.id); gain += o.v; moved = true; SFX.merge(o.v); maxV = Math.max(maxV, o.v); nr = -1; }
        break; }
      if (nr === -1) continue;
      if (nr !== r || nc !== c){ grid[r][c] = null; grid[nr][nc] = t; t.r = nr; t.c = nc; moved = true; } }
    if (!moved) return;
    score += gain; moving = true;
    // 합쳐지는 타일이 미끄러져 들어간 다음 지워져요
    dead.forEach(t => { const el = board.querySelector(`[data-id="${t.id}"]`); if (el){ el.style.transform = pos(t.r, t.c); el.style.zIndex = 0; } });
    tiles.filter(t => !dead.includes(t)).forEach(t => { const el = board.querySelector(`[data-id="${t.id}"]`); if (el) el.style.transform = pos(t.r, t.c); });
    setTimeout(() => { tiles = tiles.filter(t => !dead.includes(t)); add(); render(); moving = false;
      if (maxV >= 2048 && !this_.won){ this_.won = true; SFX.rec(); toast("💎 2048 성공! 대단해요! 계속 이어서 해 봐요"); }
      if (!canMove()) setTimeout(() => NG.over(score, `<div>가장 큰 숫자 <b>${maxV}</b> ${BADGE[maxV] || ""}</div>`), 400); }, 120);
  }
  const this_ = { dom: true,
    init(){ grid = Array.from({length: N}, () => Array(N).fill(null)); tiles = []; score = 0; idc = 0; moving = false; maxV = 2;
      $("#ngDom").innerHTML = `<div class="tw-board" id="twB"></div>`; board = $("#twB"); this.fit2(); add(); add(); render(); },
    fit(w, h){ this.W2 = w; this.H2 = h; if (board) this.fit2(); },
    fit2(){ const S2 = Math.min(560, Math.min(this.W2 || 600, this.H2 || 600) - 30); gap = Math.round(S2*.03); cell = Math.floor((S2 - gap*(N + 1))/N);
      const tot = cell*N + gap*(N + 1); board.style.width = board.style.height = tot + "px"; board.style.padding = "0";
      board.querySelectorAll(".tw-cell").forEach(x => x.remove());
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++){ const d = document.createElement("div"); d.className = "tw-cell"; d.style.cssText = `width:${cell}px;height:${cell}px;transform:${pos(r, c)}`; board.prepend(d); }
      const dom = $("#ngDom"); dom.style.left = "50%"; dom.style.top = "50%"; dom.style.transform = "translate(-50%,-50%)"; if (tiles) render(); },
    down(x, y){ sw = [x, y]; },
    up(x, y){ if (!sw) return; const dx = x - sw[0], dy = y - sw[1]; sw = null; if (Math.max(Math.abs(dx), Math.abs(dy)) < 28) return; move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up")); },
    key(code, d){ if (!d) return false; const m = {ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right", KeyW: "up", KeyS: "down", KeyA: "left", KeyD: "right"}[code]; if (m){ move(m); return true; } return false; },
    hud(){ return `점수 <b>${score}</b> · 최고 숫자 <b>${maxV}</b> ${BADGE[maxV] || ""} · <small>손가락으로 밀어요</small>`; }
  };
  return this_;
};

/* =====================================================================
   🏓 얼굴 탁구 — 둘이서 (또는 컴퓨터와 연습)
   ===================================================================== */
NG.defs.pp = () => {
  const W = 960, H = 600, PH = 120, PWd = 18, X = [46, W - 46], WIN = 7, BRr = 12;
  let py, ty, ball, score, serveT, rally, bestRally, keys, ptrs, fx, trail, aiErr;
  const cpu = () => NG.opt.cpu, lv = () => NG.opt.lv ?? 1;
  /* 🌐 다른 기기 대결: host = 신청한 친구(왼쪽, 공·점수를 정해요), guest = 수락한 친구(오른쪽) */
  const net = () => NG.opt.net, mine = () => net() === "guest" ? 1 : 0, NQ = [];
  const sfx = k => { SFX[k](); if (net() === "host") NQ.push(k); };
  function serve(to){ ball = {x: W/2, y: H/2, vx: 0, vy: 0}; serveT = 70; ball.to = to; rally = 0; }
  function paddles(){
    if (cpu() || net()){ const m = mine(); if (keys.has("KeyW") || keys.has("ArrowUp")) ty[m] = py[m] - 14; if (keys.has("KeyS") || keys.has("ArrowDown")) ty[m] = py[m] + 14; }
    else { if (keys.has("KeyW")) ty[0] = py[0] - 14; if (keys.has("KeyS")) ty[0] = py[0] + 14; if (keys.has("ArrowUp")) ty[1] = py[1] - 14; if (keys.has("ArrowDown")) ty[1] = py[1] + 14; }
    if (cpu()){
      const L = [{s: 5.5, e: 70, r: 26}, {s: 8, e: 38, r: 14}, {s: 11, e: 16, r: 6}][lv()];
      if (NG.frame % L.r === 0) aiErr = rnd(-L.e, L.e);
      let target = H/2;
      if (ball.vx > 0){ let bx = ball.x, by = ball.y, vy = ball.vy; const steps = (X[1] - bx)/Math.max(1, ball.vx); by += vy*steps; while (by < 0 || by > H){ by = by < 0 ? -by : 2*H - by; } target = by + aiErr; }
      ty[1] = py[1] + clampN(target - py[1], -L.s, L.s);
    }
    for (const k of [0, 1]){
      if (net() && k !== mine()) continue;   // 친구 탁구채는 친구 기기에서 받아요
      ty[k] = clampN(ty[k], PH/2, H - PH/2); py[k] += (ty[k] - py[k])*(cpu() && k === 1 ? 1 : .5); py[k] = clampN(py[k], PH/2, H - PH/2);
    }
  }
  const self = { W, H,
    init(){ py = [H/2, H/2]; ty = [H/2, H/2]; score = [0, 0]; keys = new Set(); ptrs = new Map(); fx = []; trail = []; bestRally = 0; aiErr = 0; serve(rnd(1) < .5 ? 0 : 1); },
    down(x, y, id){ const side = net() ? mine() : cpu() ? 0 : (x < W/2 ? 0 : 1); ptrs.set(id, side); ty[side] = y; },
    move(x, y, id){ if (ptrs.has(id)) ty[ptrs.get(id)] = y; },
    up(x, y, id){ ptrs.delete(id); },
    key(code, d){ if (["KeyW","KeyS","ArrowUp","ArrowDown"].includes(code)){ d ? keys.add(code) : keys.delete(code); return true; } return false; },
    step(){
      paddles();
      if (net() === "guest"){   // 공은 친구 기기에서 받은 걸 조금씩 이어서 그려요
        if (serveT > 0) serveT--;
        else { ball.x += ball.vx; ball.y += ball.vy; if (ball.y < BRr){ ball.y = BRr; ball.vy = Math.abs(ball.vy); } if (ball.y > H - BRr){ ball.y = H - BRr; ball.vy = -Math.abs(ball.vy); } }
      } else if (serveT > 0){ if (--serveT === 0){ const a = rnd(-.5, .5), s = 7; ball.vx = Math.cos(a)*s*(ball.to ? 1 : -1); ball.vy = Math.sin(a)*s; } }
      else {
        for (let k = 0; k < 3; k++){
          ball.x += ball.vx/3; ball.y += ball.vy/3;
          if (ball.y < BRr){ ball.y = BRr; ball.vy = Math.abs(ball.vy); sfx("wall"); } if (ball.y > H - BRr){ ball.y = H - BRr; ball.vy = -Math.abs(ball.vy); sfx("wall"); }
          for (const s of [0, 1]){ const px = X[s], dirOk = s === 0 ? ball.vx < 0 : ball.vx > 0;
            if (dirOk && Math.abs(ball.x - px) < PWd/2 + BRr && Math.abs(ball.y - py[s]) < PH/2 + BRr){
              const off = clampN((ball.y - py[s])/(PH/2), -1, 1), sp = Math.min(19, Math.hypot(ball.vx, ball.vy) + .55), a = off*.95;
              ball.vx = Math.cos(a)*sp*(s === 0 ? 1 : -1); ball.vy = Math.sin(a)*sp; ball.x = px + (s === 0 ? 1 : -1)*(PWd/2 + BRr + 1);
              rally++; bestRally = Math.max(bestRally, rally); sfx("pong"); for (let i = 0; i < 8; i++) fx.push({x: ball.x, y: ball.y, vx: rnd(-3, 3)*(s ? -1 : 1) + (s ? -3 : 3), vy: rnd(-3, 3), t: 20, c: s ? "#ff8787" : "#74c0fc"}); } }
        }
        if (ball.x < -30 || ball.x > W + 30){ const w = ball.x < 0 ? 1 : 0; score[w]++; sfx("pt"); fx.push({x: W/2, y: H/2 - 60, s: `${score[0]} : ${score[1]}`, t: 60, big: 1});
          if (score[w] >= WIN){ const txt = `${score[0]} : ${score[1]}${bestRally > 4 ? ` · 최고 랠리 ${bestRally}번` : ""}`; if (net() === "host") NET.end(w, score, txt); NG.win(w, txt); return; } serve(1 - w); }
      }
      trail.push({x: ball.x, y: ball.y}); if (trail.length > 10) trail.shift();
      fx = fx.filter(f => (f.vx !== undefined ? (f.x += f.vx, f.y += f.vy) : (f.y -= .5), --f.t > 0));
    },
    draw(g){
      const bg = g.createLinearGradient(0, 0, W, 0); bg.addColorStop(0, "#1864ab"); bg.addColorStop(.5, "#1c7ed6"); bg.addColorStop(1, "#c92a2a"); g.fillStyle = "#0b2e59"; g.fillRect(0, 0, W, H);
      g.fillStyle = "#1971c2"; rrect(g, 8, 8, W/2 - 12, H - 16, 14); g.fill(); g.fillStyle = "#c2255c"; rrect(g, W/2 + 4, 8, W/2 - 12, H - 16, 14); g.fill();
      g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 4; g.strokeRect(8, 8, W - 16, H - 16); g.beginPath(); g.moveTo(8, H/2); g.lineTo(W - 8, H/2); g.lineWidth = 2; g.stroke();
      g.setLineDash([14, 12]); g.lineWidth = 6; g.beginPath(); g.moveTo(W/2, 0); g.lineTo(W/2, H); g.stroke(); g.setLineDash([]);
      outlined(g, `${score[0]}`, W/2 - 70, 60, 64, "#d0ebff"); outlined(g, `${score[1]}`, W/2 + 70, 60, 64, "#ffe3e3");
      trail.forEach((t, i) => { g.globalAlpha = i/trail.length*.4; g.fillStyle = "#fff"; g.beginPath(); g.arc(t.x, t.y, BRr*(i/trail.length), 0, 7); g.fill(); }); g.globalAlpha = 1;
      [0, 1].forEach(s => { const c = s ? "#ffa8a8" : "#a5d8ff"; g.fillStyle = c; rrect(g, X[s] - PWd/2, py[s] - PH/2, PWd, PH, 9); g.fill(); g.fillStyle = "rgba(255,255,255,.6)"; g.fillRect(X[s] - 3, py[s] - PH/2 + 8, 4, PH - 16);
        const fxp = X[s] + (s ? 40 : -40); faceAt(g, NG.sids[s], clampN(fxp, 26, W - 26), py[s], 22, c);
        if (net() && s === mine()) outlined(g, "나", clampN(fxp, 26, W - 26), py[s] - 40, 20, "#ffe066");
        if (s === 1 && cpu()){ g.font = `20px ${EMOJI}`; g.textAlign = "center"; g.fillText("🤖", X[s] - 2, py[s] - PH/2 - 14); } });
      g.fillStyle = "#fff"; g.shadowColor = "#fff"; g.shadowBlur = 14; g.beginPath(); g.arc(ball.x, ball.y, BRr, 0, 7); g.fill(); g.shadowBlur = 0;
      fx.forEach(f => { if (f.s){ g.globalAlpha = Math.min(1, f.t/20); outlined(g, f.s, f.x, f.y, 60, "#ffe066"); } else { g.globalAlpha = f.t/20; g.fillStyle = f.c; g.fillRect(f.x, f.y, 5, 5); } }); g.globalAlpha = 1;
      if (serveT > 0) outlined(g, serveT > 35 ? "준비…" : "시작!", W/2, H/2 + 70, 40, "#fff");
      if (score[0] + score[1] === 0 && serveT > 0) outlined(g, net() ? `나는 ${mine() ? "오른쪽" : "왼쪽"}! 화면을 위아래로 끌어요 (W·S 또는 ↑·↓)` : cpu() ? "화면을 위아래로 끌어요 (W·S 또는 ↑·↓)" : "왼쪽 친구는 왼쪽 화면, 오른쪽 친구는 오른쪽 화면을 끌어요", W/2, H - 50, 24, "#fff");
    },
    hud(){ return `${esc(who(noOf_(NG.sids[0])))} <b>${score[0]}</b> : <b>${score[1]}</b> ${cpu() ? "🤖 컴퓨터" : esc(who(noOf_(NG.sids[1])))} · ${WIN}점 먼저!${net() ? " · 🌐 다른 기기 대결" : ""}`; },
    netAd: {
      snap: () => ({b: ball, p: py[0], sc: score, sv: serveT, rl: rally, br: bestRally, fx}),
      ev: () => NQ.splice(0),
      fx(e){ e.forEach(k => SFX[k] && SFX[k]()); },
      apply(d){ if (net() !== "guest") return; ball = d.b; py[0] = ty[0] = d.p; score = d.sc; serveT = d.sv; rally = d.rl; bestRally = d.br; fx = d.fx; },
      mine: () => ({y: py[1]}),
      put(d){ if (net() === "host"){ py[1] = ty[1] = d.y; } },
      end(w, sc, txt){ if (net() !== "guest" || NG.ended) return; score = sc; NG.win(w, txt); },
      reset(){}
    }
  };
  return self;
};

/* =====================================================================
   🪜 얼굴 계단 — 무한의 계단처럼! ⬆️ 오르기 · 🔄 방향 바꾸기
   가로·세로 화면에 맞춰 게임판 모양이 바뀌고, 화면을 꽉 채워요.
   ===================================================================== */
NG.defs.st = () => {
  let W = 760, H = 900, land = false, SW = 92, SH = 46, BY = 590, BTN = [];
  let st, p, f, energy, shownE, score, stars, camX, camI, camKick, anim, fall, fx, dust, over, best50, keysDown, press, streak, lastT, flipT, shake, flash, beatT, crumble;
  const THEME = [
    {at: 0,   n: "🏫 학교 옥상",   sky: ["#4dabf7","#d0ebff"], c: ["#ffd43b","#f08c00"], deco: "cloud"},
    {at: 60,  n: "🌅 노을 구름",   sky: ["#ff6b6b","#ffd8a8"], c: ["#ffa8a8","#e03131"], deco: "bird"},
    {at: 130, n: "🌃 밤하늘",     sky: ["#141b4d","#4a3f86"], c: ["#d0bfff","#7048e8"], deco: "moon"},
    {at: 220, n: "🌌 우주",       sky: ["#03030f","#3a1162"], c: ["#96f2d7","#0ca678"], deco: "planet"},
    {at: 330, n: "🌈 무지개 하늘", sky: ["#ff9ce6","#a5d8ff"], c: null, deco: "rainbow"}
  ];
  const themeAt = n => { let t = THEME[0]; THEME.forEach(x => { if (n >= x.at) t = x; }); return t; };
  const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch(e) {} };
  function gen(n){ while (st.length < n){ const last = st[st.length - 1], prevDir = st.length > 1 ? last.x - st[st.length - 2].x : 1;
    const d = rnd(1) < (st.length < 6 ? .15 : .38) ? -prevDir : prevDir;
    st.push({x: last.x + d, star: st.length > 8 && rnd(1) < .045, dip: 0}); } }
  /* 가로·세로에 맞춰 판 크기와 버튼 자리를 정해요 */
  function layout(sw, sh){
    const a = sw/Math.max(1, sh); land = a >= 1.05;
    if (land){ H = 640; W = Math.round(Math.min(1500, Math.max(900, H*a))); SW = 104; SH = 46; BY = Math.round(H*.6); }
    else { W = 720; H = Math.round(Math.min(1500, Math.max(860, W/a))); SW = 96; SH = 50; BY = Math.round(H*.6); }
    BTN = land
      ? [{k: 0, x: 24, y: H - 190, w: 250, h: 166, t: "방향 바꾸기", e: "🔄", c: ["#4dabf7","#1864ab"], key: "←"},
         {k: 1, x: W - 274, y: H - 190, w: 250, h: 166, t: "오르기", e: "⬆️", c: ["#ff6b9d","#a61e4d"], key: "→"}]
      : [{k: 0, x: 18, y: H - 176, w: W/2 - 27, h: 156, t: "방향 바꾸기", e: "🔄", c: ["#4dabf7","#1864ab"], key: "←"},
         {k: 1, x: W/2 + 9, y: H - 176, w: W/2 - 27, h: 156, t: "오르기", e: "⬆️", c: ["#ff6b9d","#a61e4d"], key: "→"}];
  }
  function hitPress(k){ press[k] = 1; }
  function step(turn){
    if (over || fall) return;
    hitPress(turn ? 0 : 1);
    if (turn){ f = -f; flipT = 1; tone(300, 700, .08, "sine", .06); }
    gen(p + 40);
    const ok = st[p + 1].x - st[p].x === f;
    if (!ok){ anim = {from: p, t: 0, ok: false}; fall = {t: 0, x: st[p].x + f*.6}; crumble = p; SFX.bad(); buzz([60, 40, 120]); shake = 18; flash = {c: "255,80,80", a: .45}; return; }
    anim = {from: p, t: 0, ok: true, turn};
    p++; score++; st[p].dip = 1;
    const now = performance.now(); streak = now - lastT < 380 ? streak + 1 : 0; lastT = now;
    energy = Math.min(1, energy + .085 - Math.min(.04, score*.00008));
    tone(500 + Math.min(700, streak*22), 760 + Math.min(900, streak*28), .07, "triangle", .07); buzz(8);
    camKick = 1;
    const sx0 = st[p].x;
    for (let i = 0; i < 7; i++) dust.push({x: sx0, i: p, dx: rnd(-1, 1)*.45, vy: rnd(-3, -1), y: 0, t: 22, r: rnd(3, 6)});
    if (streak && streak % 10 === 0) fx.push({x: sx0, i: p + 1, s: `🔥 ${streak}연속! 빠르다!`, t: 55, c: "#ffa94d"});
    if (st[p].star){ st[p].star = false; stars++; score += 4; energy = Math.min(1, energy + .25); SFX.gold(); buzz(30); flash = {c: "255,230,120", a: .35};
      for (let i = 0; i < 16; i++){ const a = i/16*Math.PI*2; dust.push({x: sx0, i: p, dx: Math.cos(a)*.08, vy: Math.sin(a)*4, y: -30, t: 30, r: 5, star: 1}); }
      fx.push({x: sx0, i: p, s: "⭐ +5", t: 45, c: "#ffe066"}); }
    if (score >= best50 + 50){ best50 += 50; SFX.rec(); flash = {c: "255,255,255", a: .5}; fx.push({x: sx0, i: p + 2, s: `🎉 ${best50}계단!`, t: 80, big: 1, c: "#ffe066"}); }
    const th = themeAt(score), prev = themeAt(score - 1); if (th !== prev){ flash = {c: "255,255,255", a: .7}; fx.push({x: sx0, i: p + 3, s: th.n, t: 100, big: 1, c: "#fff"}); }
  }
  const sx = x => W/2 + (x - camX)*SW, sy = i => BY - (i - camI)*SH;
  const self = {
    get W(){ return W; }, get H(){ return H; },
    get dbg(){ return {next: st[p + 1] ? st[p + 1].x - st[p].x : 0, f, score, energy, land, W, H}; },
    layout,
    init(){ st = [{x: 0, dip: 0}]; gen(50); p = 0; f = st[1].x - st[0].x; energy = 1; shownE = 1; score = 0; stars = 0; camX = 0; camI = 0; camKick = 0; anim = null; fall = null; fx = []; dust = [];
      over = 0; best50 = 0; keysDown = new Set(); press = [0, 0]; streak = 0; lastT = 0; flipT = 0; shake = 0; flash = null; beatT = 0; crumble = -1; },
    down(x, y){ step(x < W/2); },
    key(code, d){ if (!d){ keysDown.delete(code); return false; } if (keysDown.has(code)) return true; keysDown.add(code);
      if (["ArrowLeft","KeyA","KeyZ"].includes(code)){ step(true); return true; } if (["ArrowRight","KeyD","KeyX","Space","ArrowUp","KeyW"].includes(code)){ step(false); return true; } return false; },
    step(){
      if (over){ if (--over <= 0) NG.over(score, `<div>🪜 <b>${score}</b>계단 · ⭐ <b>${stars}</b>개 · ${themeAt(score).n}까지!</div>`); }
      else if (!fall && score > 0){ energy -= .0016 + Math.min(.0085, score*.000045);
        if (energy < .22 && --beatT <= 0){ beatT = 26; tone(90, 60, .12, "sine", .16); }
        if (energy <= 0){ energy = 0; fall = {t: 0, x: st[p].x, tired: 1}; SFX.bad(); buzz([80, 40, 160]); shake = 12; flash = {c: "255,80,80", a: .4}; } }
      if (fall){ fall.t++; if (fall.t === 70 && !over) over = 20; }
      if (anim){ anim.t += .22; if (anim.t >= 1) anim = null; }
      shownE += (energy - shownE)*.25;
      camX += (st[p].x - camX)*.16; camI += (p - camI)*.16; camKick *= .8;
      for (let i = Math.max(0, p - 3); i <= p + 2; i++) if (st[i] && st[i].dip) st[i].dip *= .82;
      press = press.map(v => v*.86); flipT *= .8; shake *= .86; if (flash){ flash.a *= .88; if (flash.a < .02) flash = null; }
      dust = dust.filter(d => (d.y += d.vy, d.vy += .25, d.x += d.dx, --d.t > 0)); fx = fx.filter(e => --e.t > 0);
    },
    draw(g){
      const th = themeAt(score), fr = NG.frame;
      g.save(); if (shake > .5) g.translate(rnd(-shake, shake), rnd(-shake, shake));
      const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, th.sky[0]); sky.addColorStop(1, th.sky[1]); g.fillStyle = sky; g.fillRect(-30, -30, W + 60, H + 60);
      /* 배경 꾸미기 (멀리 있는 건 천천히 움직여요) */
      const par = (k, span) => ((-camX*SW*k) % span + span) % span;
      if (th.deco === "cloud" || th.deco === "bird"){ g.fillStyle = "rgba(255,255,255,.8)";
        for (let i = 0; i < 7; i++){ const x = (par(.25, W + 260) + i*230) % (W + 260) - 130, y = ((i*157 + camI*SH*.35) % (H*.8)) + 20, s = .7 + (i % 3)*.25;
          g.beginPath(); g.arc(x, y, 30*s, 0, 7); g.arc(x + 34*s, y - 12*s, 36*s, 0, 7); g.arc(x + 72*s, y, 28*s, 0, 7); g.fill(); }
        if (th.deco === "bird"){ g.strokeStyle = "rgba(80,30,40,.7)"; g.lineWidth = 3; g.lineCap = "round"; for (let i = 0; i < 6; i++){ const x = (fr*1.4 + i*140) % (W + 100) - 50, y = 120 + (i % 3)*50 + Math.sin(fr*.05 + i)*8, w = Math.sin(fr*.3 + i)*7; g.beginPath(); g.moveTo(x - 10, y - w); g.lineTo(x, y); g.lineTo(x + 10, y - w); g.stroke(); } } }
      else { g.fillStyle = "#fff"; for (let i = 0; i < 90; i++){ const x = (par(.08, W) + i*137) % W, y = ((i*97 + camI*SH*.2) % H); g.globalAlpha = .3 + .7*Math.abs(Math.sin(fr*.03 + i)); g.fillRect(x, y, i % 9 ? 2 : 3, i % 9 ? 2 : 3); } g.globalAlpha = 1;
        if (th.deco === "moon"){ g.fillStyle = "#fff9db"; g.shadowColor = "#fff3bf"; g.shadowBlur = 40; g.beginPath(); g.arc(W*.8, H*.16, 46, 0, 7); g.fill(); g.shadowBlur = 0; g.fillStyle = th.sky[0]; g.beginPath(); g.arc(W*.8 + 18, H*.16 - 10, 40, 0, 7); g.fill(); }
        if (th.deco === "planet"){ const x = W*.78 - camX*4 % 100, y = H*.2; g.fillStyle = "#ffa94d"; g.beginPath(); g.arc(x, y, 50, 0, 7); g.fill(); g.strokeStyle = "rgba(255,224,170,.9)"; g.lineWidth = 8; g.beginPath(); g.ellipse(x, y, 92, 20, -.35, 0, 7); g.stroke();
          g.fillStyle = "#4dabf7"; g.beginPath(); g.arc(W*.18, H*.32, 22, 0, 7); g.fill(); }
        if (th.deco === "rainbow"){ ["#ff6b6b","#ffa94d","#ffe066","#69db7c","#4dabf7","#b197fc"].forEach((c, k) => { g.strokeStyle = c; g.globalAlpha = .55; g.lineWidth = 18; g.beginPath(); g.arc(W/2, H*.75, W*.55 - k*18, Math.PI, 0); g.stroke(); }); g.globalAlpha = 1; } }
      // 빨리 오를 때 속도선
      if (streak >= 5 && !fall){ g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 3; for (let i = 0; i < 16; i++){ const x = (i*97 + fr*7) % W, y = (i*131 + fr*22) % H; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 40 + streak*2); g.stroke(); } }
      /* 계단 */
      const from = Math.max(0, Math.floor(camI) - Math.ceil((H - BY)/SH) - 2), to = Math.floor(camI) + Math.ceil(BY/SH) + 3; gen(to + 3);
      for (let i = to; i >= from; i--){ const s = st[i]; let x = sx(s.x), y = sy(i) + (s.dip || 0)*8;
        if (fall && i === crumble){ y += fall.t*fall.t*.08; }
        const col = th.c ? (i % 2 ? th.c[0] : th.c[1]) : `hsl(${(i*24) % 360},85%,62%)`, near = Math.abs(i - p) <= 1;
        g.fillStyle = "rgba(0,0,0,.2)"; rrect(g, x - SW/2 + 7, y + 8, SW, 26, 8); g.fill();
        g.fillStyle = col; rrect(g, x - SW/2, y, SW, 26, 8); g.fill();
        g.fillStyle = "rgba(255,255,255,.5)"; rrect(g, x - SW/2 + 6, y + 4, SW - 12, 6, 3); g.fill();
        g.fillStyle = "rgba(0,0,0,.18)"; g.fillRect(x - SW/2 + 4, y + 19, SW - 8, 7);
        if (i === p + 1 && !fall){ g.strokeStyle = `rgba(255,255,255,${.4 + .3*Math.sin(fr*.2)})`; g.lineWidth = 3; rrect(g, x - SW/2 - 3, y - 3, SW + 6, 32, 10); g.stroke(); }
        if (i % 10 === 0 && i > 0) outlined(g, `${i}`, x, y + 13, 16, "#fff");
        if (s.star){ const b = Math.sin(fr*.12 + i)*4; g.save(); g.shadowColor = "#ffe066"; g.shadowBlur = 16; g.font = `34px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("⭐", x, y - 26 + b); g.restore(); }
        if (near && s.dip > .3){ g.fillStyle = `rgba(255,255,255,${s.dip*.5})`; rrect(g, x - SW/2, y, SW, 26, 8); g.fill(); } }
      /* 먼지 */
      dust.forEach(d => { g.globalAlpha = d.t/30; g.fillStyle = d.star ? "#ffe066" : "rgba(255,255,255,.9)"; g.beginPath(); g.arc(sx(d.x), sy(d.i) + d.y, d.r*(d.t/22 + .3), 0, 7); g.fill(); }); g.globalAlpha = 1;
      /* 나 */
      let px = st[p].x, pi = p, lift = 0, rot = 0, alpha = 1, sqx = 1, sqy = 1;
      if (anim && anim.ok){ const t = Math.min(1, anim.t), a = st[anim.from].x; px = a + (st[p].x - a)*t; pi = anim.from + t; lift = Math.sin(t*Math.PI)*30; sqx = 1 - Math.sin(t*Math.PI)*.12; sqy = 1 + Math.sin(t*Math.PI)*.14; }
      else if (st[p].dip > .2){ sqx = 1 + st[p].dip*.18; sqy = 1 - st[p].dip*.16; }
      if (fall){ const t = fall.t; px = fall.tired ? st[p].x : st[p].x + f*.55*Math.min(1, t/8); pi = p - t*t*.0035 - (fall.tired ? 0 : .25); rot = (fall.tired ? .5 : f*.35)*t*.12; alpha = Math.max(0, 1 - t/80); }
      const X = sx(px), Y = sy(pi) - 40 - lift - camKick*4, R = land ? 32 : 34;
      g.fillStyle = "rgba(0,0,0,.25)"; g.beginPath(); g.ellipse(X, sy(pi) + 2, 26*(1 - lift/80), 6, 0, 0, 7); g.fill();
      g.save(); g.globalAlpha = alpha; g.translate(X, Y); g.rotate(rot); g.scale(sqx, sqy);
      const run = anim ? Math.sin(anim.t*Math.PI*2)*8 : Math.sin(fr*.15)*1.5;
      g.strokeStyle = "#343a40"; g.lineWidth = 8; g.lineCap = "round";
      g.beginPath(); g.moveTo(-9, R*.7); g.lineTo(-9 - run, R + 10); g.moveTo(9, R*.7); g.lineTo(9 + run, R + 10); g.stroke();
      g.fillStyle = "#212529"; g.beginPath(); g.ellipse(-9 - run + f*3, R + 12, 8, 4.5, 0, 0, 7); g.ellipse(9 + run + f*3, R + 12, 8, 4.5, 0, 0, 7); g.fill();
      g.save(); g.scale(f*Math.max(.15, Math.abs(1 - flipT*2)), 1); faceAt(g, NG.sids[0], 0, 0, R, streak >= 10 ? "#ff922b" : "#ffe066", !!fall); g.restore();
      g.fillStyle = "#fff"; g.strokeStyle = "rgba(0,0,0,.3)"; g.lineWidth = 2; g.beginPath(); g.moveTo(f*(R + 10), -8); g.lineTo(f*(R + 24), 0); g.lineTo(f*(R + 10), 8); g.closePath(); g.fill(); g.stroke();
      g.restore();
      /* 글씨 효과 */
      fx.forEach(e => { const life = e.big ? 100 : 55; g.globalAlpha = Math.min(1, e.t/18); const sc = 1 + Math.max(0, (e.t - life + 10)/10)*.4;
        outlined(g, e.s, sx(e.x), sy(e.i) - 80 - (life - e.t)*.5, (e.big ? 50 : 34)*sc, e.c || "#fff"); }); g.globalAlpha = 1;
      g.restore();
      if (flash){ g.fillStyle = `rgba(${flash.c},${flash.a})`; g.fillRect(0, 0, W, H); }
      if (energy < .22 && !fall){ const a = (.22 - energy)/.22*(.5 + .3*Math.sin(fr*.25)); const vg = g.createRadialGradient(W/2, H/2, Math.min(W, H)*.3, W/2, H/2, Math.max(W, H)*.7); vg.addColorStop(0, "rgba(255,0,0,0)"); vg.addColorStop(1, `rgba(255,0,0,${a})`); g.fillStyle = vg; g.fillRect(0, 0, W, H); }
      /* 위: 기운 막대 · 점수 */
      const bw = Math.min(W - 120, 640), bx = (W - bw)/2;
      g.fillStyle = "rgba(0,0,0,.35)"; rrect(g, bx, 22, bw, 30, 15); g.fill();
      const eg = g.createLinearGradient(bx, 0, bx + bw, 0); eg.addColorStop(0, "#ff6b6b"); eg.addColorStop(.45, "#ffd43b"); eg.addColorStop(1, "#69db7c");
      g.fillStyle = eg; rrect(g, bx + 3, 25, Math.max(24, (bw - 6)*Math.max(0, shownE)), 24, 12); g.fill();
      g.fillStyle = "rgba(255,255,255,.4)"; rrect(g, bx + 8, 28, Math.max(10, (bw - 16)*Math.max(0, shownE)), 6, 3); g.fill();
      g.font = `26px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(energy < .22 ? "🥵" : energy < .5 ? "😤" : "⚡", bx - 22, 37);
      outlined(g, `${score}`, W/2, 108 + (camKick*-6), 74, streak >= 10 ? "#ffa94d" : "#fff"); outlined(g, th.n, W/2, 160, 24, "#fff");
      if (streak >= 3) outlined(g, `🔥 ${streak}연속`, land ? W - 120 : W - 90, 108, 28, "#ffa94d");
      if (stars) outlined(g, `⭐ ${stars}`, land ? 110 : 80, 108, 28, "#ffe066");
      /* 아래: 버튼 (누르면 쏙 들어가요) */
      BTN.forEach(b => { const pr = press[b.k], dy = pr*8;
        g.save(); g.globalAlpha = .93;
        g.fillStyle = b.c[1]; rrect(g, b.x, b.y + 10, b.w, b.h, 30); g.fill();
        const gr = g.createLinearGradient(0, b.y, 0, b.y + b.h); gr.addColorStop(0, b.c[0]); gr.addColorStop(1, b.c[1]);
        g.fillStyle = gr; rrect(g, b.x, b.y + dy, b.w, b.h - 4, 30); g.fill();
        g.fillStyle = "rgba(255,255,255,.28)"; rrect(g, b.x + 12, b.y + 10 + dy, b.w - 24, b.h*.28, 18); g.fill();
        if (pr > .05){ g.strokeStyle = `rgba(255,255,255,${pr})`; g.lineWidth = 6; rrect(g, b.x - pr*10, b.y - pr*10 + dy, b.w + pr*20, b.h + pr*20 - 4, 34); g.stroke(); }
        g.globalAlpha = 1;
        // 아이콘 (직접 그려서 어느 기기에서나 또렷해요)
        { const cx = b.x + b.w/2, cy = b.y + b.h*.38 + dy, r = 24; g.save(); g.translate(cx, cy); g.strokeStyle = "#fff"; g.fillStyle = "#fff"; g.lineWidth = 9; g.lineCap = "round"; g.lineJoin = "round";
          g.shadowColor = "rgba(0,0,0,.35)"; g.shadowOffsetY = 3;
          if (b.k){ g.beginPath(); g.moveTo(0, r); g.lineTo(0, -r + 6); g.stroke(); g.beginPath(); g.moveTo(-20, -r + 22); g.lineTo(0, -r - 2); g.lineTo(20, -r + 22); g.stroke(); }
          else { g.rotate(-press[0]*Math.PI); g.beginPath(); g.arc(0, 0, r, Math.PI*.15, Math.PI*1.15); g.stroke(); g.beginPath(); g.arc(0, 0, r, Math.PI*1.15 + .5, Math.PI*2.15 - .2); g.stroke();
            g.beginPath(); g.moveTo(r + 10, 2); g.lineTo(r, -14); g.lineTo(r - 10, 2); g.closePath(); g.fill(); g.beginPath(); g.moveTo(-r - 10, -2); g.lineTo(-r, 14); g.lineTo(-r + 10, -2); g.closePath(); g.fill(); }
          g.restore(); }
        outlined(g, b.t, b.x + b.w/2, b.y + b.h*.74 + dy, land ? 30 : 30, "#fff");
        outlined(g, b.key, b.k ? b.x + b.w - 28 : b.x + 28, b.y + 26 + dy, 20, "rgba(255,255,255,.85)");
        g.restore(); });
      if (score === 0 && !fall){ const y = BTN[0].y - 34; outlined(g, "다음 계단이 같은 쪽이면 ⬆️ 오르기, 반대쪽이면 🔄 방향 바꾸기!", W/2, y, land ? 24 : 21, "#fff"); }
    },
    hud(){ return `🪜 <b>${score}</b>계단 · ⭐ ${stars}${streak >= 3 ? ` · 🔥 ${streak}연속` : ""}`; }
  };
  return self;
};

