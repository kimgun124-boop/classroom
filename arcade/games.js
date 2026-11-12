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
/* 캐릭터 얼굴을 동그랗게 */
function faceAt(g, sid, x, y, r, ring, sad){
  g.save();
  if (ring){ g.fillStyle = ring; g.beginPath(); g.arc(x, y, r + Math.max(2, r*.14), 0, Math.PI*2); g.fill(); }
  g.fillStyle = "#fff"; g.beginPath(); g.arc(x, y, r, 0, Math.PI*2); g.fill();
  g.font = `${Math.round(r*1.4)}px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(sad ? "😵" : faceOf(sid), x, y + r*.08);
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
  ARC.score(gid, sid, r);
  const B = board(gid), me = B.find(x => x.sid === sid);
  return {isNew, prevBest, prevRank, rank: me ? me.rank : 0, n: B.length, r};
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
    this.last = performance.now(); this.acc = 0; this.frame = 0;
    const loop = now => { this.raf = requestAnimationFrame(loop); this.acc = Math.min(100, this.acc + now - this.last); this.last = now;
      while (this.acc >= 1000/60){ this.acc -= 1000/60; if (!this.ended && !this.paused){ this.frame++; cur.step && cur.step(); } }
      if (cur.draw){ const g = this.g; g.setTransform(this.k, 0, 0, this.k, 0, 0); cur.draw(g); }
      if (this.frame % 6 === 0 && cur.hud) $("#ngHud").innerHTML = cur.hud(); };
    this.raf = requestAnimationFrame(loop);
  },
  fit(){
    const cur = this.cur; if (!cur) return;
    const st = $("#ngStage").getBoundingClientRect();
    if (cur.dom){ cur.fit && cur.fit(st.width, st.height); return; }
    const s = Math.min((st.width - 16)/cur.W, (st.height - 16)/cur.H), dpr = Math.min(2, window.devicePixelRatio || 1), cv = $("#ngCanvas");
    cv.style.width = cur.W*s + "px"; cv.style.height = cur.H*s + "px"; cv.width = Math.round(cur.W*s*dpr); cv.height = Math.round(cur.H*s*dpr);
    this.k = s*dpr; this.s = s; this.g = cv.getContext("2d");
  },
  pt(e){ const r = $("#ngCanvas").getBoundingClientRect(); return {x: (e.clientX - r.left)/r.width*this.cur.W, y: (e.clientY - r.top)/r.height*this.cur.H}; },
  stop(){ cancelAnimationFrame(this.raf); this.cur = null; },
  close(){ this.stop(); $("#ng").hidden = true; $("#ngHud").innerHTML = ""; ARC.back(); },
  conf(n){ return `<div class="ng-conf">${Array.from({length: n}, () => `<i style="left:${rnd(100)}%;background:${COLS[Math.floor(rnd(COLS.length))]};animation-duration:${2 + rnd(2.5)}s;animation-delay:${rnd(.8)}s"></i>`).join("")}</div>`; },
  /* 혼자 하는 게임 끝 */
  over(score, extra = ""){
    if (this.ended) return; this.ended = true;
    const sid = this.sids[0], res = saveRec(this.gid, sid, score);
    (res.isNew ? SFX.rec : SFX.over)();
    $("#ngOver").innerHTML = `${res.isNew ? this.conf(90) : ""}<div class="ng-box"><span class="f">${faceOf(sid)}</span><h3>${res.isNew ? "🎉 새 기록!" : "게임 끝!"}</h3>
      <div class="sc">${score}점</div>
      <div class="info">${extra}${res.isNew && res.prevBest ? `<div class="new">전 기록 ${res.prevBest}점을 넘었어요!</div>` : ""}
        <div>내 최고 <b>${res.r.best}</b>점 · 오늘 최고 <b>${res.r.dayBest}</b>점 · ${res.r.plays}번째 도전</div>
        <div>🏆 우리 반 <b>${res.rank}</b>등 <small>/ ${res.n}명</small>${res.isNew && res.prevRank && res.rank < res.prevRank ? ` · ▲ ${res.prevRank - res.rank}계단!` : ""}</div></div>
      <div class="arc-row"><button class="arc-btn p" data-ng="again">🔁 다시 하기</button><button class="arc-btn" data-ng="home">🏠 홈으로</button></div></div>`;
    $("#ngOver").hidden = false;
  },
  /* 둘이 하는 게임 끝 */
  win(w, scoreTxt){
    if (this.ended) return; this.ended = true;
    const W = this.sids[w], L = this.sids[1 - w], cpu = this.opt.cpu, cpuWon = cpu && w === 1;
    ARC.duel(this.gid, W, L, cpu);
    (cpuWon ? SFX.over : SFX.rec)();
    $("#ngOver").innerHTML = `${cpuWon ? "" : this.conf(90)}<div class="ng-box"><span class="f">${cpuWon ? "🤖" : faceOf(W)}</span><h3>${cpuWon ? "컴퓨터 승리!" : `🏆 ${esc(who(noOf_(W)))} 승리!`}</h3>
      <div class="sc">${scoreTxt}</div><div class="info">${cpu ? "🤖 컴퓨터 연습은 랭킹에 들어가지 않아요" : "이긴 친구 랭킹 +1승!"}</div>
      <div class="arc-row"><button class="arc-btn p" data-ng="again">🔁 한 판 더</button><button class="arc-btn" data-ng="home">🏠 홈으로</button></div></div>`;
    $("#ngOver").hidden = false;
  }
};
$("#ngOver").addEventListener("click", e => { const b = e.target.closest("[data-ng]"); if (!b) return; if (b.dataset.ng === "again") NG.play(NG.gid, NG.sids, NG.opt); else NG.close(); });
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
    if (NG.ended){ if (e.code === "Enter" || e.code === "Space"){ e.preventDefault(); NG.play(NG.gid, NG.sids, NG.opt); } return; }
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
  const friends = () => Store.cls.roster.map(s => sidOf(s.no));
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
  const W = 960, H = 560, GY = 470, PX = 170, R = 26;
  let p, obs, coins, dist, sp, next, candies, fx, dust, jumpsLeft, over;
  const SK = [["#74c0fc","#d0ebff","#69db7c"], ["#ff922b","#ffd8a8","#94d82d"], ["#1c2457","#4a3f86","#2b8a3e"], ["#0b0b2b","#3a1162","#868e96"], ["#3b0a2b","#ff6b6b","#5c3a22"]];
  const stg = () => Math.min(SK.length - 1, Math.floor(score()/150));
  const score = () => Math.floor(dist/40) + candies*5;
  function jump(){ if (over) return; if (jumpsLeft > 0){ p.vy = jumpsLeft === 2 ? -15 : -12.5; jumpsLeft--; SFX.jump(); for (let i = 0; i < 6; i++) dust.push({x: PX - 10, y: p.y + R, vx: rnd(-3, 0), vy: rnd(-2, 0), t: 20}); } }
  function spawn(){
    const r = rnd(1), lvl = Math.min(1, dist/40000);
    if (r < .38) obs.push({k: "box", x: W + 40, w: 46, h: rnd(42, 70 + lvl*30), e: "📚"});
    else if (r < .62) obs.push({k: "cone", x: W + 40, w: 48, h: 58, e: "🚧"});
    else if (r < .8 && dist > 2500) obs.push({k: "bird", x: W + 40, w: 52, h: 40, y: GY - (rnd(1) < .5 ? 92 : 150), e: "🐦"});
    else { obs.push({k: "box", x: W + 40, w: 46, h: 48, e: "📦"}); obs.push({k: "box", x: W + 40 + 58, w: 46, h: 76, e: "📦"}); }
    const n = 3 + Math.floor(rnd(4)), cx = W + 260 + rnd(80), high = rnd(1) < .5;
    for (let i = 0; i < n; i++) coins.push({x: cx + i*44, y: GY - (high ? 150 + Math.sin(i/(n - 1)*Math.PI)*60 : 40)});
  }
  return { W, H,
    init(){ p = {y: GY - R, vy: 0}; obs = []; coins = []; dist = 0; sp = 7; next = 90; candies = 0; fx = []; dust = []; jumpsLeft = 2; over = false; },
    down(){ jump(); },
    key(code, d){ if (d && ["Space","ArrowUp","KeyW","Enter"].includes(code)){ jump(); return true; } return false; },
    step(){
      if (over){ if (--over.t <= 0) NG.over(score(), `<div>🏃 <b>${Math.floor(dist/40)}</b>m 달리고 🍬 사탕 <b>${candies}</b>개!</div>`); fx = fx.filter(f => (f.y -= .7, --f.t > 0)); return; }
      sp = Math.min(17, 7 + dist/2400); dist += sp;
      p.vy += .82; p.y += p.vy; if (p.y >= GY - R){ p.y = GY - R; p.vy = 0; jumpsLeft = 2; }
      if (--next <= 0){ spawn(); next = Math.round(rnd(52, 95) * 7/sp + 30); }
      obs.forEach(o => o.x -= sp); coins.forEach(c => c.x -= sp);
      obs = obs.filter(o => o.x > -80); coins = coins.filter(c => c.x > -40 && !c.got);
      const hr = R*.68;
      for (const o of obs){ const top = o.k === "bird" ? o.y - o.h/2 : GY - o.h, bot = o.k === "bird" ? o.y + o.h/2 : GY, l = o.x - o.w/2 + 6, r = o.x + o.w/2 - 6;
        const cx = clampN(PX, l, r), cy = clampN(p.y, top + 6, bot); if ((PX - cx)**2 + (p.y - cy)**2 < hr*hr){ over = {t: 50}; SFX.bad(); fx.push({x: PX, y: p.y - 50, s: "앗!", t: 50}); return; } }
      coins.forEach(c => { if (Math.hypot(c.x - PX, c.y - p.y) < R + 14){ c.got = true; candies++; SFX.pt(); fx.push({x: c.x, y: c.y - 20, s: "+5", t: 30}); } });
      if (NG.frame % 3 === 0 && p.y >= GY - R - 1) dust.push({x: PX - 18, y: GY - 4, vx: -sp*.3, vy: rnd(-1.5, 0), t: 18});
      dust = dust.filter(d => (d.x += d.vx, d.y += d.vy, --d.t > 0)); fx = fx.filter(f => (f.y -= .7, --f.t > 0));
    },
    draw(g){
      const s = SK[stg()], sky = g.createLinearGradient(0, 0, 0, GY); sky.addColorStop(0, s[0]); sky.addColorStop(1, s[1]); g.fillStyle = sky; g.fillRect(0, 0, W, H);
      if (stg() >= 2){ g.fillStyle = "#fff"; for (let i = 0; i < 50; i++) g.fillRect((i*157 - dist*.02) % W + (i*157 - dist*.02 < 0 ? W : 0), (i*53) % (GY*.7), 2, 2); }
      [[.15, 200, "rgba(255,255,255,.18)"], [.35, 120, "rgba(255,255,255,.28)"]].forEach(([k, hh, c]) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, GY);
        for (let x = 0; x <= W; x += 20) g.lineTo(x, GY - hh*.5 - Math.sin((x + dist*k)*.006)*hh*.3 - Math.sin((x + dist*k)*.017)*hh*.12); g.lineTo(W, GY); g.fill(); });
      g.fillStyle = s[2]; g.fillRect(0, GY, W, H - GY); g.fillStyle = "rgba(0,0,0,.15)"; for (let x = -(dist % 40); x < W; x += 40) g.fillRect(x, GY + 14, 20, 6);
      g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(0, GY, W, 4);
      coins.forEach(c => { g.font = `30px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("🍬", c.x, c.y + Math.sin(NG.frame*.15 + c.x*.05)*3); });
      obs.forEach(o => { g.font = `${o.k === "bird" ? 46 : o.w + 4}px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "bottom";
        if (o.k === "bird"){ g.textBaseline = "middle"; g.save(); g.translate(o.x, o.y + Math.sin(NG.frame*.3)*4); g.scale(-1, 1); g.fillText(o.e, 0, 0); g.restore(); }
        else { const n = Math.max(1, Math.round(o.h/(o.w*.9))); for (let i = 0; i < n; i++) g.fillText(o.e, o.x, GY - i*o.h/n + 4); } });
      dust.forEach(d => { g.globalAlpha = d.t/20; g.fillStyle = "#fff"; g.beginPath(); g.arc(d.x, d.y, 5, 0, 7); g.fill(); }); g.globalAlpha = 1;
      // 달리는 나
      const run = p.y >= GY - R - 1 ? Math.sin(NG.frame*.45) : 0;
      g.strokeStyle = "#343a40"; g.lineWidth = 6; g.lineCap = "round";
      g.beginPath(); g.moveTo(PX - 6, p.y + R - 4); g.lineTo(PX - 6 + run*12, p.y + R + 12); g.moveTo(PX + 6, p.y + R - 4); g.lineTo(PX + 6 - run*12, p.y + R + 12); g.stroke();
      g.save(); g.translate(PX, p.y); g.rotate(p.vy*.02); faceAt(g, NG.sids[0], 0, 0, R, "#ffe066", !!over); g.restore();
      fx.forEach(f => { g.globalAlpha = Math.min(1, f.t/15); outlined(g, f.s, f.x, f.y, 30, "#ffe066"); }); g.globalAlpha = 1;
      outlined(g, `${score()}점`, W/2, 44, 46); outlined(g, `🍬 ${candies}`, W - 20, 40, 28, "#fff", undefined, "right");
      if (dist < 900) outlined(g, "화면을 톡! 점프 · 공중에서 한 번 더 톡! 2단 점프", W/2, 110, 28, "#fff");
    },
    hud(){ return `점수 <b>${score()}</b> · 🍬 ${candies}`; }
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
  function serve(to){ ball = {x: W/2, y: H/2, vx: 0, vy: 0}; serveT = 70; ball.to = to; rally = 0; }
  return { W, H,
    init(){ py = [H/2, H/2]; ty = [H/2, H/2]; score = [0, 0]; keys = new Set(); ptrs = new Map(); fx = []; trail = []; bestRally = 0; aiErr = 0; serve(rnd(1) < .5 ? 0 : 1); },
    down(x, y, id){ const side = cpu() ? 0 : (x < W/2 ? 0 : 1); ptrs.set(id, side); ty[side] = y; },
    move(x, y, id){ if (ptrs.has(id)) ty[ptrs.get(id)] = y; },
    up(x, y, id){ ptrs.delete(id); },
    key(code, d){ if (["KeyW","KeyS","ArrowUp","ArrowDown"].includes(code)){ d ? keys.add(code) : keys.delete(code); return true; } return false; },
    step(){
      if (keys.has("KeyW")) ty[0] = py[0] - 14; if (keys.has("KeyS")) ty[0] = py[0] + 14;
      if (!cpu()){ if (keys.has("ArrowUp")) ty[1] = py[1] - 14; if (keys.has("ArrowDown")) ty[1] = py[1] + 14; }
      else { if (keys.has("ArrowUp")) ty[0] = py[0] - 14; if (keys.has("ArrowDown")) ty[0] = py[0] + 14;
        const L = [{s: 5.5, e: 70, r: 26}, {s: 8, e: 38, r: 14}, {s: 11, e: 16, r: 6}][lv()];
        if (NG.frame % L.r === 0) aiErr = rnd(-L.e, L.e);
        let target = H/2;
        if (ball.vx > 0){ let bx = ball.x, by = ball.y, vy = ball.vy; const steps = (X[1] - bx)/Math.max(1, ball.vx); by += vy*steps; while (by < 0 || by > H){ by = by < 0 ? -by : 2*H - by; } target = by + aiErr; }
        ty[1] = py[1] + clampN(target - py[1], -L.s, L.s); }
      for (const k of [0, 1]){ ty[k] = clampN(ty[k], PH/2, H - PH/2); py[k] += (ty[k] - py[k])*(cpu() && k === 1 ? 1 : .5); py[k] = clampN(py[k], PH/2, H - PH/2); }
      if (serveT > 0){ if (--serveT === 0){ const a = rnd(-.5, .5), s = 7; ball.vx = Math.cos(a)*s*(ball.to ? 1 : -1); ball.vy = Math.sin(a)*s; } }
      else {
        for (let k = 0; k < 3; k++){
          ball.x += ball.vx/3; ball.y += ball.vy/3;
          if (ball.y < BRr){ ball.y = BRr; ball.vy = Math.abs(ball.vy); SFX.wall(); } if (ball.y > H - BRr){ ball.y = H - BRr; ball.vy = -Math.abs(ball.vy); SFX.wall(); }
          for (const s of [0, 1]){ const px = X[s], dirOk = s === 0 ? ball.vx < 0 : ball.vx > 0;
            if (dirOk && Math.abs(ball.x - px) < PWd/2 + BRr && Math.abs(ball.y - py[s]) < PH/2 + BRr){
              const off = clampN((ball.y - py[s])/(PH/2), -1, 1), sp = Math.min(19, Math.hypot(ball.vx, ball.vy) + .55), a = off*.95;
              ball.vx = Math.cos(a)*sp*(s === 0 ? 1 : -1); ball.vy = Math.sin(a)*sp; ball.x = px + (s === 0 ? 1 : -1)*(PWd/2 + BRr + 1);
              rally++; bestRally = Math.max(bestRally, rally); SFX.pong(); for (let i = 0; i < 8; i++) fx.push({x: ball.x, y: ball.y, vx: rnd(-3, 3)*(s ? -1 : 1) + (s ? -3 : 3), vy: rnd(-3, 3), t: 20, c: s ? "#ff8787" : "#74c0fc"}); } }
        }
        if (ball.x < -30 || ball.x > W + 30){ const w = ball.x < 0 ? 1 : 0; score[w]++; SFX.pt(); fx.push({x: W/2, y: H/2 - 60, s: `${score[0]} : ${score[1]}`, t: 60, big: 1});
          if (score[w] >= WIN){ NG.win(w, `${score[0]} : ${score[1]}${bestRally > 4 ? ` · 최고 랠리 ${bestRally}번` : ""}`); return; } serve(1 - w); }
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
        if (s === 1 && cpu()){ g.font = `20px ${EMOJI}`; g.textAlign = "center"; g.fillText("🤖", X[s] - 2, py[s] - PH/2 - 14); } });
      g.fillStyle = "#fff"; g.shadowColor = "#fff"; g.shadowBlur = 14; g.beginPath(); g.arc(ball.x, ball.y, BRr, 0, 7); g.fill(); g.shadowBlur = 0;
      fx.forEach(f => { if (f.s){ g.globalAlpha = Math.min(1, f.t/20); outlined(g, f.s, f.x, f.y, 60, "#ffe066"); } else { g.globalAlpha = f.t/20; g.fillStyle = f.c; g.fillRect(f.x, f.y, 5, 5); } }); g.globalAlpha = 1;
      if (serveT > 0) outlined(g, serveT > 35 ? "준비…" : "시작!", W/2, H/2 + 70, 40, "#fff");
      if (score[0] + score[1] === 0 && serveT > 0) outlined(g, cpu() ? "화면을 위아래로 끌어요 (W·S 또는 ↑·↓)" : "왼쪽 친구는 왼쪽 화면, 오른쪽 친구는 오른쪽 화면을 끌어요", W/2, H - 50, 24, "#fff");
    },
    hud(){ return `${esc(who(noOf_(NG.sids[0])))} <b>${score[0]}</b> : <b>${score[1]}</b> ${cpu() ? "🤖 컴퓨터" : esc(who(noOf_(NG.sids[1])))} · ${WIN}점 먼저!`; }
  };
};
