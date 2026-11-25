/* =====================================================================
   🎲 보드게임 모음 (2026.11.23) — 초6이 좋아하는 보드게임을 반 친구와 '온라인'으로
   - 🌐 온라인 방(기본): 한 친구가 방을 만들고, 친구들은 자기 태블릿·크롬북에서 들어와요 (2~4명)
     · 연결은 기존 PARTY(방장 기기가 심판) 그대로: 기기끼리 바로(WebRTC) → 학교 와이파이에서 막히면 Firebase 다리
     · 한 수(행동)만 주고받아요 → Firebase 사용량이 거의 없어요 (방 쪽지·연결 때만 조금)
     · 방장 기기만 진짜 판을 알고, 친구 기기에는 '그 친구가 봐도 되는 것'만 보내요(손패·숨긴 패는 가려서)
   - 🤖 컴퓨터와 연습 · 🧒 한 기기에서 친구와(숨긴 패 게임은 차례마다 가림막)
   - 결과: 사람 2명 이상이 한 판만 랭킹(이긴 친구 +1승, 나머지 +1패)과 코인 — 기록은 한 번에 한 문서만 써요
   - 게임 한 개 = BG.def({...}) 한 덩어리: setup · turn · act · over · view · ai · draw · tap
   ===================================================================== */
const BG = {
  D: {}, ids: [], lv: 1, n: {},
  def(G){
    G.min = G.min || 2; G.max = G.max || 2;
    this.D[G.id] = G; this.ids.push(G.id);
    NG.defs[G.id] = () => bgGame(G);
    const g = {id: G.id, e: G.e, n: G.n, kind: "duel", c: "board", bg: 1, multi: 1, tag: G.tag || (G.max > 2 ? `🌐 온라인 ${G.min}~${G.max}명 · 🤖 컴퓨터와도` : "🌐 온라인 둘이서 · 🤖 컴퓨터와도"), d: G.d};
    { let k = 0; GAMES.forEach((x, i) => { if (x.c === "board") k = i + 1; }); GAMES.splice(k, 0, g); } GAME[G.id] = g;   // 🎲 보드게임 칸 끝에 붙여요
    if (typeof PARTY !== "undefined") PARTY.CFG[G.id] = {max: G.max, bots: 1, min: G.min, relay: 1};   // 🌉 학교 와이파이에서 기기끼리 못 이으면 Firebase 다리로
    if (window.COOP && !COOP.G.includes(G.id)) COOP.G.push(G.id);   // 홈 옆 🤝 방 목록에도 보여요
  },
  rng(seed){ let s = (seed >>> 0) || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0)/4294967296; },
  shuffle(a, R){ for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(R()*(i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  /* ---------- 시작 창: 🌐 온라인 방 · 🤖 컴퓨터 · 🧒 한 기기 ---------- */
  menu(gid){
    const G = this.D[gid], me = ARC.me, box = partyModal(gid), body = $("#wbBody");
    const nOpt = Array.from({length: G.max - G.min + 1}, (_, i) => G.min + i);
    this.n[gid] = Math.min(G.max, Math.max(G.min, this.n[gid] || G.min));
    const seg = (id, L, v, f) => `<div class="arc-seg" id="${id}">${L.map(x => `<button data-v="${x}" class="${x === v ? "on" : ""}">${f(x)}</button>`).join("")}</div>`;
    body.innerHTML = `<div class="bg-intro"><span class="f">${G.e}</span><div><b>${G.n}</b><small>${G.like ? `${esc(G.like)} · ` : ""}${G.min === G.max ? `${G.min}명` : `${G.min}~${G.max}명`} · ${esc(G.time || "10분")}</small><p>${esc(G.d)}</p></div></div>
      <details class="bg-rules"><summary>📖 규칙 보기</summary><ol>${G.rules.map(r => `<li>${r}</li>`).join("")}</ol></details>
      <div class="wb-sec bg-on"><h3>🌐 온라인 방 <small>친구는 자기 기기에서 들어와요 · 이기면 랭킹 1승!</small></h3><div id="wbRooms"></div></div>
      <div class="wb-sec bg-x"><h3>🤖 컴퓨터와 연습 <small>랭킹에는 안 들어가요</small></h3>
        ${G.max > 2 ? `<div class="wb-row"><span>몇 명이서?</span>${seg("bgN", nOpt, this.n[gid], x => `${x}명`)}</div>` : ""}
        <div class="wb-row"><span>난이도</span>${seg("bgLv", [0, 1, 2], this.lv, x => ["🐣 쉬움", "🐥 보통", "🦅 어려움"][x])}</div>
        <button class="arc-btn p" id="bgCpu">▶ 컴퓨터와 시작</button></div>
      <div class="wb-sec bg-x"><h3>🧒 이 기기에서 친구와 <small>한 화면을 같이 봐요${G.hidden ? " · 차례마다 가림막" : ""}</small></h3><button class="arc-btn" id="bgFriend">🧒 친구 들어오기</button></div>`;
    const on = (id, f) => { const s = $("#" + id); if (s) s.onclick = e => { const b = e.target.closest("button"); if (!b) return; s.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); f(+b.dataset.v); }; };
    on("bgN", v => this.n[gid] = v); on("bgLv", v => this.lv = v);
    $("#bgCpu").onclick = () => { box.hidden = true; PARTY.leave(); this.start(gid, [me], this.n[gid] - 1); };
    $("#bgFriend").onclick = () => { box.hidden = true; PARTY.leave(); ARC.pickRival(gid, opp => this.start(gid, [me, opp], Math.max(0, this.n[gid] - 2))); };
    PARTY.renderRooms();
    box.hidden = false;
  },
  start(gid, humans, nBots){
    const G = this.D[gid]; nBots = Math.max(0, Math.min(G.max - humans.length, nBots)); if (humans.length + nBots < G.min) nBots = G.min - humans.length;
    const bots = WB.pickBots(humans, nBots), sids = humans.concat(bots).map(sidOf);
    ARC.game = gid; ARC.enter && ARC.enter(); ARC.prep(); getAC();
    NG.play(gid, sids, {local: humans.map((_, i) => i), bots: bots.map((_, i) => humans.length + i), lv: this.lv, cpu: humans.length === 1, seed: Math.floor(Math.random()*1e9) + 1});
  }
};

/* ---------- 그림 도우미 ---------- */
const BGD = {
  F: `"Jua","Gowun Dodum",sans-serif`,
  txt(g, t, x, y, s, c = "#fff", al = "center", b = ""){ g.font = `${b}${Math.round(s)}px ${this.F}`; g.textAlign = al; g.textBaseline = "middle"; g.fillStyle = c; g.fillText(t, x, y); },
  box(g, x, y, w, h, r, fill, stroke, lw = 2){ rrect(g, x, y, w, h, r); if (fill){ g.fillStyle = fill; g.fill(); } if (stroke){ g.lineWidth = lw; g.strokeStyle = stroke; g.stroke(); } },
  lg(g, x0, y0, x1, y1, st){ const q = g.createLinearGradient(x0, y0, x1, y1); st.forEach((c, i) => q.addColorStop(i/(st.length - 1), c)); return q; },
  shadow(g, on, b = 12, y = 4, c = "rgba(0,0,0,.35)"){ if (on){ g.shadowColor = c; g.shadowBlur = b; g.shadowOffsetY = y; } else { g.shadowColor = "transparent"; g.shadowBlur = 0; g.shadowOffsetY = 0; } },
  /* 반짝이는 돌·말 */
  disc(g, x, y, r, c, c2){ g.save(); this.shadow(g, true, r*.5, r*.15); const q = g.createRadialGradient(x - r*.35, y - r*.4, r*.1, x, y, r); q.addColorStop(0, c2 || "#fff"); q.addColorStop(.35, c); q.addColorStop(1, this.dark(c)); g.fillStyle = q; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.restore();
    g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.ellipse(x - r*.3, y - r*.42, r*.32, r*.18, -.5, 0, 7); g.fill(); },
  dark(c){ const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(c); if (!m) return c; const f = v => Math.max(0, Math.round(parseInt(v, 16)*.55)).toString(16).padStart(2, "0"); return "#" + f(m[1]) + f(m[2]) + f(m[3]); },
  /* 카드·타일 */
  tile(g, x, y, w, h, fill, edge, r = 10){ g.save(); this.shadow(g, true, 8, 3); this.box(g, x, y, w, h, r, fill); g.restore(); this.box(g, x + 1, y + 1, w - 2, h - 2, r - 1, null, edge || "rgba(0,0,0,.25)", 2);
    g.fillStyle = "rgba(255,255,255,.22)"; rrect(g, x + 3, y + 3, w - 6, h*.38, r*.8); g.fill(); },
  wood(g, x, y, w, h, r = 18){ g.save(); this.shadow(g, true, 22, 8); this.box(g, x, y, w, h, r, this.lg(g, x, y, x + w, y + h, ["#c8935a", "#a8713e", "#8a5a30"])); g.restore();
    g.save(); rrect(g, x, y, w, h, r); g.clip(); g.globalAlpha = .12; g.strokeStyle = "#3b220e"; for (let i = 0; i < 26; i++){ const yy = y + (i + .5)*h/26; g.lineWidth = 1 + (i*7 % 3); g.beginPath(); g.moveTo(x, yy); g.bezierCurveTo(x + w*.3, yy + 6, x + w*.6, yy - 6, x + w, yy + 2); g.stroke(); } g.restore();
    this.box(g, x, y, w, h, r, null, "rgba(60,30,10,.7)", 3); },
  felt(g, x, y, w, h, r = 18, c = "#1f6e4a"){ g.save(); this.shadow(g, true, 22, 8); this.box(g, x, y, w, h, r, this.lg(g, x, y, x, y + h, [c, this.dark(c)])); g.restore(); this.box(g, x, y, w, h, r, null, "rgba(255,255,255,.15)", 3); },
  btn(g, b, on){ g.save(); this.shadow(g, true, 8, 3); this.box(g, b.x, b.y, b.w, b.h, Math.min(16, b.h/3), b.off ? "rgba(255,255,255,.1)" : on || b.p ? this.lg(g, b.x, b.y, b.x, b.y + b.h, b.c ? [b.c, this.dark(b.c)] : ["#ffd43b", "#f59f00"]) : "rgba(255,255,255,.16)"); g.restore();
    this.box(g, b.x, b.y, b.w, b.h, Math.min(16, b.h/3), null, "rgba(255,255,255,.35)", 2); outlined(g, b.t, b.x + b.w/2, b.y + b.h/2, Math.min(26, b.h*.42), b.off ? "#999" : "#fff"); },
  hit: (b, x, y) => b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h
};

/* =====================================================================
   공통 진행 틀 (NG 게임 한 개)
   ===================================================================== */
function bgGame(G){
  let W = 1280, H = 760, land = true, A = {x: 0, y: 0, w: 100, h: 100}, PC = [], btns = [], dirty = true, S = null, R = null, ui = {}, seq = 0, lastN = {},
    endShown = false, banner = null, aiBusy = false, castT = 0, needCast = false, curtain = -1, lastView = -1, help = false, dropped = {}, turnF = 0, lastTurn = -9, fxN = 0, endInfo = null;
  const O = () => NG.opt || {}, party = () => O().party, host = () => party() === "host", guest = () => party() === "guest", auth = () => !guest();
  const N = () => NG.sids.length, bots = () => O().bots || [], isBot = i => bots().includes(i) || !!dropped[i];
  const local = () => guest() ? [O().idx] : host() ? [0] : (O().local || [0]);
  const turn = () => S ? G.turn(S) : -1;
  const remoteHuman = i => host() && i > 0 && !isBot(i);
  /* 지금 이 기기에서 판을 보는 사람 */
  function viewer(){
    if (party()) return guest() ? O().idx : 0;
    const t = turn(), L = local();
    if (L.includes(t)) return t;
    return lastView >= 0 && L.includes(lastView) ? lastView : L[0];
  }
  const canAct = (a) => { if (endShown || NG.ended || !S || curtain >= 0) return false; const v = viewer(), t = turn(); return t === v || (G.free && G.free(S, v, a)); };
  const say = (t, c = "#fff", k = 80) => { banner = {t, c, k}; dirty = true; };
  const nameOf_ = i => isBot(i) && !dropped[i] ? "🤖 컴퓨터" : who(noOf_(NG.sids[i]));
  const short = i => { if (isBot(i) && !dropped[i]) return "🤖 컴퓨터"; const no = noOf_(NG.sids[i]); return +no === TEACHER ? "선생님" : `${no}번 ${nameOf(no)}`; };
  const ctx = () => ({N: N(), me: viewer(), name: short, bots: bots().concat(Object.keys(dropped).map(Number)), lv: O().lv ?? 1, R, say, local: local(), party: party()});

  /* ---- 행동 ---- */
  function doAct(p, a, from){
    if (!S || endShown) return false;
    if (guest()){ PARTY.sendIn({a}, true); return true; }
    if (!G.act(S, p, a, R, ctx())) { if (from === "me" && G.bad) say(G.bad(S, p, a), "#ffa8a8", 50); return false; }
    changed(); return true;
  }
  function changed(){
    dirty = true; ui.an = Math.max(ui.an || 0, 24);
    if (S.fxN && S.fxN !== fxN){ fxN = S.fxN; ui.fx = S.fx; ui.fxT = 0; if (S.fx && S.fx.say) say(S.fx.say, S.fx.c || "#ffe066", S.fx.dur || 70); if (S.fx && S.fx.snd) try { SFX[S.fx.snd] && SFX[S.fx.snd](); } catch(e) {} else try { SFX.pt(); } catch(e) {} }
    if (host()) cast();
    checkEnd();
  }
  function viewFor(i){ return G.view ? G.view(S, i) : S; }
  /* 📡 판 보내기: 친구마다 '볼 수 있는 것만'(손패 가림) · 꼭 도착하는 통로로
     - 바뀌면 바로 · 안 바뀌어도 가끔(바로 이어진 친구 1.5초, 🌉 다리로 이어진 친구 6초 — Firebase 쓰기를 아껴요) */
  function cast(periodic){ if (!host()) return; castT = 0; needCast = false; const now = Date.now();
    PARTY.connected().forEach(P => { const i = P.spec ? -1 : P.idx; if (i == null) return; if (periodic && P.relay && now - (P.bgT || 0) < 6000) return; P.bgT = now;
      try { P.r.send(JSON.stringify({t: "bs", n: ++seq, s: {v: viewFor(i)}})); } catch(e) {} }); }
  function checkEnd(){
    if (endShown || !S) return; const o = guest() ? null : G.over(S); if (!o) return;
    endShown = true; dirty = true; endInfo = o;
    say(o.w < 0 ? "🤝 비겼어요!" : `🏆 ${short(o.w)} 승리!`, "#ffe066", 999);
    if (host()) PARTY.sendAll({t: "end", w: o.w, wins: [], txt: o.txt || "", rk: o.rank || null});
    setTimeout(() => { if (NG.cur === def) result(o); }, 1400);
  }
  /* ---- 결과: 사람 2명 이상이면 랭킹·코인 (방장/이 기기만 한 번 올려요) ---- */
  function result(o){
    if (NG.ended && $("#ngOver") && !$("#ngOver").hidden) return;
    NG.ended = true;
    const humans = NG.sids.map((s, i) => i).filter(i => !bots().includes(i)), sids = NG.sids;
    const ranked = !guest() && humans.length >= 2 && o.w >= 0 && humans.includes(o.w);
    let coin = {};
    if (ranked){ const ws = sids[o.w], ls = humans.filter(i => i !== o.w).map(i => sids[i]);
      Store.putMulti(G.id, ws, ls); humans.forEach(i => coin[i] = Store.earn(sids[i], i === o.w ? WIN_COIN : LOSE_COIN)); }
    const me = viewer(), meWon = o.w === me && !isBot(me), isB = o.w >= 0 && bots().includes(o.w);
    const order = o.rank || (o.w >= 0 ? [o.w].concat(NG.sids.map((_, i) => i).filter(i => i !== o.w)) : NG.sids.map((_, i) => i));
    const rows = order.map((i, k) => `<div class="bg-rr${i === me ? " me" : ""}"><span class="rk">${o.w < 0 ? "🤝" : k === 0 ? "🏆" : k + 1}</span>${bots().includes(i) ? `<span class="f">🤖</span>` : `<span class="avf">${avHTMLof(sids[i], {still: true, face: true})}</span>`}<b>${esc(short(i))}</b><small>${esc(G.pinfo ? G.pinfo(S, i, true) || "" : "")}</small>${coin[i] ? `<em>🪙 +${coin[i]}</em>` : ""}</div>`).join("");
    const info = ranked ? "이긴 친구 랭킹 +1승! 함께 한 친구들도 코인을 받아요" : guest() ? "랭킹과 코인은 방장 기기가 올려요" : humans.length < 2 ? "🤖 컴퓨터 연습은 랭킹에 들어가지 않아요" : o.w < 0 ? "비긴 판은 랭킹에 들어가지 않아요" : "컴퓨터가 이긴 판은 랭킹에 들어가지 않아요";
    $("#ngOver").innerHTML = `${meWon || (!party() && !isB && o.w >= 0) ? NG.conf(90) : ""}<div class="ng-box bg-res"><span class="f">${o.w < 0 ? "🤝" : isB ? "🤖" : "🏆"}</span>
      <h3>${o.w < 0 ? "비겼어요!" : party() ? (meWon ? "🏆 내가 이겼어요!" : `${esc(short(o.w))} 승리!`) : `${esc(short(o.w))} 승리!`}</h3>
      ${o.txt ? `<div class="sc">${esc(o.txt)}</div>` : ""}<div class="bg-rows">${rows}</div><div class="info">${info}</div>
      <div class="arc-row">${guest() ? `<button class="arc-btn" data-bgr="wait">⏳ 방장이 다시 시작하길 기다려요</button>` : `<button class="arc-btn p" data-bgr="again">🔁 한 판 더</button>`}<button class="arc-btn" data-bgr="home">🏠 홈으로</button></div></div>`;
    $("#ngOver").hidden = false;
    $("#ngOver").onclick = e => { const b = e.target.closest("[data-bgr]"); if (!b) return; e.stopPropagation();
      if (b.dataset.bgr === "home"){ PARTY.leave(); NG.close(); }
      else if (b.dataset.bgr === "again"){ if (host()) PARTY.again(); else NG.play(G.id, NG.sids, Object.assign({}, O(), {seed: Math.floor(Math.random()*1e9) + 1})); } };
    try { (meWon || (!party() && !isB) ? SFX.rec : SFX.over)(); } catch(e) {}
  }

  /* ---- 화면 배치 ---- */
  function layout(w, h){
    land = w >= h*1.02;
    if (land){ H = 760; W = Math.round(Math.max(1060, Math.min(1700, H*w/Math.max(1, h)))); }
    else { W = 760; H = Math.round(Math.max(1080, Math.min(1700, W*h/Math.max(1, w)))); }
    def.W = W; def.H = H;
    const n = N();
    if (land){ const pw = 300, px = W - pw - 14; A = {x: 14, y: 14, w: px - 28, h: H - 28};
      const ch = Math.min(118, (H - 28 - 140)/n - 8); PC = Array.from({length: n}, (_, i) => ({x: px, y: 14 + i*(ch + 8), w: pw, h: ch}));
      const by = H - 14 - 58; btns = [{id: "help", t: "📖 규칙", x: px, y: by, w: pw/2 - 5, h: 58}, {id: "quit", t: party() ? "🚪 나가기" : "🏳️ 그만", x: px + pw/2 + 5, y: by, w: pw/2 - 5, h: 58}];
    } else { const cw = (W - 24 - (n - 1)*8)/n; PC = Array.from({length: n}, (_, i) => ({x: 12 + i*(cw + 8), y: 10, w: cw, h: 112}));
      A = {x: 10, y: 132, w: W - 20, h: H - 132 - 96};
      btns = [{id: "help", t: "📖 규칙", x: 12, y: H - 84, w: (W - 34)/2, h: 72}, {id: "quit", t: party() ? "🚪 나가기" : "🏳️ 그만", x: 22 + (W - 34)/2, y: H - 84, w: (W - 34)/2, h: 72}]; }
    if (G.layout) G.layout(A, land, ui);
    dirty = true;
  }
  function card(g, R0, i){
    const on = turn() === i && !endShown, me = i === viewer() && (party() || local().length === 1), sid = NG.sids[i], col = G.col ? G.col[i] : "#ffd43b";
    g.save(); BGD.shadow(g, on, 18, 0, col); BGD.box(g, R0.x, R0.y, R0.w, R0.h, 18, on ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.07)"); g.restore();
    BGD.box(g, R0.x, R0.y, R0.w, R0.h, 18, null, on ? col : "rgba(255,255,255,.18)", on ? 4 : 2);
    const small = R0.w < 200, fr = Math.min(small ? 26 : 34, R0.h*.3), fx = R0.x + (small ? R0.w/2 : 14 + fr), fy = R0.y + (small ? 12 + fr : R0.h/2);
    if (isBot(i) && !dropped[i]) outlined(g, "🤖", fx, fy, fr*1.5); else try { faceAt(g, sid, fx, fy, fr, on ? col : null); } catch(e) {}
    g.fillStyle = col; g.beginPath(); g.arc(fx + fr*.78, fy + fr*.7, fr*.34, 0, 7); g.fill(); g.lineWidth = 2; g.strokeStyle = "#fff"; g.stroke();
    let nm = short(i) + (me ? " (나)" : ""); const sub = G.pinfo ? G.pinfo(S, i) || "" : "";
    if (small){ if (nm.length > 7) nm = nm.slice(0, 7) + "…"; outlined(g, nm, R0.x + R0.w/2, R0.y + R0.h - 38, 18, on ? "#ffe066" : "#fff"); outlined(g, sub.length > 9 ? sub.slice(0, 9) + "…" : sub, R0.x + R0.w/2, R0.y + R0.h - 16, 15, "#c5f6fa"); }
    else { if (nm.length > 11) nm = nm.slice(0, 11) + "…"; const tx = fx + fr + 12; g.save();
      outlined(g, nm, tx, fy - R0.h*.17, Math.min(24, R0.h*.21), on ? "#ffe066" : "#fff", undefined, "left");
      outlined(g, (on ? "▶ 차례! " : "") + (sub.length > 14 ? sub.slice(0, 14) + "…" : sub), tx, fy + R0.h*.17, Math.min(19, R0.h*.17), on ? "#ffe066" : "#c5f6fa", undefined, "left"); g.restore(); }
    if (on && party() && remoteHuman(i) && turnF > 60*20){ const left = Math.max(0, 45 - Math.floor(turnF/60)); outlined(g, `⏰${left}`, R0.x + R0.w - 26, R0.y + 20, 16, "#ffa8a8"); }
  }
  /* ---- NG 게임 ---- */
  const def = {
    W, H, maxSteps: 3, layout,
    init(){
      R = BG.rng(O().seed || 1); ui = {}; endShown = false; banner = null; dropped = {}; seq = 0; lastN = {}; curtain = -1; help = false; fxN = 0; endInfo = null;
      if (!guest()) S = G.setup(N(), R, ctx());
      else S = null;
      if (host()){ PARTY.attach({dropIdx: i => { dropped[i] = 1; dirty = true; }, end(){}, apply(){}}, () => { needCast = true; return {t: "hi"}; }); setTimeout(() => cast(), 300); }
      if (guest()) PARTY.attach({apply: d => { if (d && d.s && d.s.v){ const first = !S; S = d.s.v; if (S.fxN && S.fxN !== fxN){ fxN = S.fxN; ui.fx = S.fx; ui.fxT = 0; if (S.fx && S.fx.say && !first) say(S.fx.say, S.fx.c || "#ffe066", S.fx.dur || 70); if (!first) try { SFX[(S.fx && S.fx.snd) || "pt"](); } catch(e) {} } ui.an = Math.max(ui.an || 0, 24); dirty = true; } },
        end: (w, wins, m) => { if (endShown) return; endShown = true; say(w < 0 ? "🤝 비겼어요!" : `🏆 ${short(w)} 승리!`, "#ffe066", 999); setTimeout(() => { if (NG.cur === def) result({w, txt: m.txt, rank: m.rk}); }, 1200); },
        dropIdx(){} }, null);
      say(`${G.e} ${G.n}`, "#fff", 70);
      if (G.start && S) G.start(S, ui, ctx());
      dirty = true;
    },
    step(){
      if (!S){ dirty = true; return; }
      const t = turn(); if (t !== lastTurn){ lastTurn = t; turnF = 0; if (!party() && G.hidden && local().length > 1 && local().includes(t) && lastView >= 0 && lastView !== t && !endShown) curtain = t; if (local().includes(t)) lastView = t; ui.sel = null; dirty = true; } else turnF++;
      if (ui.an > 0){ ui.an--; dirty = true; } if (ui.fx){ ui.fxT = (ui.fxT || 0) + 1; }
      if (banner && banner.k < 900 && --banner.k <= 0){ banner = null; dirty = true; } if (banner) dirty = true;
      if (G.live && G.live(S, ui)) dirty = true;
      if (guest() || endShown || NG.ended) return;
      /* 🌐 친구 기기가 보낸 행동 */
      if (host()) for (const P of PARTY.peers.values()){ if (P.idx >= 0 && P.last && (P.last.n || 0) > (lastN[P.idx] || 0)){ lastN[P.idx] = P.last.n; if (P.last.a !== undefined) doAct(P.idx, P.last.a, "net"); } }
      if (host() && (needCast || ++castT > 90)) cast(!needCast);
      if (G.tick && G.tick(S, R, ctx())) changed();
      /* 🤖 컴퓨터 차례 (끊긴 친구 자리도) · ⏰ 친구가 45초 넘게 안 두면 컴퓨터가 한 수 */
      const late = remoteHuman(t) && turnF > 60*45;
      if (t >= 0 && (isBot(t) || late) && !aiBusy){
        aiBusy = true; const delay = late ? 50 : (window.__bgFast ? 30 : (G.aiDelay || 650) + R()*300);
        setTimeout(() => { aiBusy = false; if (NG.cur !== def || endShown || turn() !== t) return; const a = G.ai(S, t, R, ctx()); if (a != null){ if (late) toast(`⏰ ${short(t)} 대신 컴퓨터가 한 수 뒀어요`); doAct(t, a, "ai"); turnF = 0; } }, delay);
      }
    },
    draw(g){
      if (!dirty) return; dirty = false;
      g.clearRect(0, 0, W, H);
      g.fillStyle = BGD.lg(g, 0, 0, 0, H, G.bg || ["#2a1f5e", "#140f2e"]); g.fillRect(0, 0, W, H);
      if (!S){ outlined(g, "⏳ 방장 기기에서 판을 받는 중…", W/2, H/2, 30, "#d0bfff"); return; }
      const V = G.view && !guest() ? G.view(S, viewer()) : S; ui.V = V;   // 🙈 이 기기에는 '내가 볼 수 있는 것'만 그려요 (방장 기기도 친구 손패를 못 봐요)
      g.save(); try { G.draw(g, V, viewer(), A, ui, ctx()); } catch(e){ console.error(e); } g.restore();
      for (let i = 0; i < N(); i++) card(g, PC[i], i);
      btns.forEach(b => BGD.btn(g, b));
      if (party() && !endShown && turn() >= 0 && turn() !== viewer() && !(G.free && G.free(S, viewer()))){ BGD.box(g, A.x + A.w/2 - 190, A.y + 6, 380, 40, 20, "rgba(10,6,30,.72)"); outlined(g, `⏳ ${short(turn())} 차례예요`, A.x + A.w/2, A.y + 26, 21, "#d0bfff"); }
      if (banner){ g.globalAlpha = banner.k >= 900 ? 1 : Math.min(1, banner.k/15); BGD.box(g, A.x, A.y + A.h/2 - 44, A.w, 88, 0, "rgba(10,6,30,.6)"); outlined(g, banner.t, A.x + A.w/2, A.y + A.h/2, Math.min(46, A.w/13), banner.c || "#fff"); g.globalAlpha = 1; }
      if (curtain >= 0){ g.fillStyle = "rgba(20,12,50,.96)"; g.fillRect(0, 0, W, H); outlined(g, "🙈", W/2, H/2 - 90, 90); outlined(g, `${short(curtain)} 차례!`, W/2, H/2 + 10, 46, "#ffe066"); outlined(g, "다른 친구는 화면을 보지 않아요 · 눌러서 시작", W/2, H/2 + 70, 26, "#d0bfff"); }
      if (help){ g.fillStyle = "rgba(15,10,40,.95)"; g.fillRect(0, 0, W, H); outlined(g, `📖 ${G.n} 규칙`, W/2, 60, 40, "#ffe066");
        const L = G.rules.map(r => r.replace(/<[^>]+>/g, "")); let y = 120; const fs = land ? 22 : 24, mw = W - 120;
        g.font = `${fs}px ${BGD.F}`; L.forEach((t, k) => { const words = `${k + 1}. ${t}`.split(" "); let line = ""; words.forEach(wd => { const tt = line ? line + " " + wd : wd; if (g.measureText(tt).width > mw){ BGD.txt(g, line, 60, y, fs, "#fff", "left"); y += fs*1.45; line = wd; } else line = tt; }); if (line){ BGD.txt(g, line, 60, y, fs, "#fff", "left"); y += fs*1.45 + 6; } });
        outlined(g, "화면을 누르면 닫혀요", W/2, H - 40, 22, "#d0bfff"); }
    },
    down(x, y){
      if (NG.ended) return; dirty = true;
      if (help){ help = false; return; }
      if (curtain >= 0){ curtain = -1; return; }
      for (const b of btns) if (BGD.hit(b, x, y)){ if (b.id === "help") help = true; else if (b.id === "quit"){ if (confirm(party() ? "방에서 나갈까요?" : "이 판을 그만할까요?")){ PARTY.leave(); NG.close(); } } return; }
      if (!S) return;
      const v = viewer(), a = G.tap(ui.V || S, v, x, y, A, ui, canAct(), ctx());
      if (a != null){ if (canAct(a)) doAct(v, a, "me"); else if (!endShown) say(turn() >= 0 ? `⏳ ${short(turn())} 차례예요` : "잠깐만요!", "#d0bfff", 40); }
    },
    move(x, y){ if (G.drag && S){ G.drag(S, viewer(), x, y, A, ui); dirty = true; } },
    up(x, y){ if (G.drop && S){ const a = G.drop(S, viewer(), x, y, A, ui, canAct()); dirty = true; if (a != null && canAct(a)) doAct(viewer(), a, "me"); } },
    key(code, d){ if (!d || !S || !G.key) return false; const a = G.key(S, viewer(), code, ui, canAct()); dirty = true; if (a != null && canAct(a)) doAct(viewer(), a, "me"); return a != null; },
    destroy(){},
    dbg: {S: () => S, act: (p, a) => doAct(p, a, "me"), G, ui: () => ui, view: i => viewFor(i), A: () => A}
  };
  return def;
}

/* ---------- 연결: 시작 창 · 온라인 방 시작 · 기록 · 홈 목록 ---------- */
(function(){
  const play = ARC.play;
  ARC.play = function(gid){ if (!BG.D[gid]) return play.call(this, gid); if (!LOBBY.canPlay(gid)) return; getAC(); this.game = gid; this.lastRank = gid; BG.menu(gid); };
  const start = PARTY.start;
  PARTY.start = function(again){
    if (!BG.D[this.gid]) return start.call(this, again);
    if (this.role !== "host") return;
    const G = BG.D[this.gid], live = this.connected().map(p => p.no);
    this.members = [ARC.me].concat(this.members.filter(no => no !== ARC.me && live.includes(no))).slice(0, G.max);
    const M = this.members, nb = Math.max(0, Math.min(this.bots, G.max - M.length));
    if (M.length + nb < G.min){ toast(`친구가 들어오거나 🤖 컴퓨터를 넣어야 시작할 수 있어요 (${G.min}명부터)`); this.renderRooms(); return; }
    this.started = true; Store.fs.updateDoc(this.ref(this.pid), {st: "play", n: M.length}).catch(() => {});
    const botNos = WB.pickBots(M, nb), sids = M.concat(botNos).map(sidOf), bots = botNos.map((_, i) => M.length + i), seed = Math.floor(Math.random()*1e9) + 1, remote = {};
    M.forEach((no, i) => { if (i){ const P = this.peers.get(no); if (P){ P.idx = i; P.inN = 0; P.last = {}; remote[i] = no; this.send(P, {t: "start", g: this.gid, sids, idx: i, bots, seed, lv: BG.lv}); } } });
    this.seq = 0; this.lastGv = -1;
    const md = $("#mdWb"); if (md) md.hidden = true;
    if (!again){ ARC.game = this.gid; ARC.enter(); ARC.prep(); }
    getAC(); NG.play(this.gid, sids, {party: "host", local: [0], bots, remote, seed, lv: BG.lv});
  };
  /* 🎲 친구 기기: 방장이 보낸 판 받기 · 조용한 차례(생각하는 중)에도 '끊겼다'고 착각하지 않게 */
  const onHost = PARTY.onHost;
  PARTY.onHost = function(m){
    if (m && m.t === "bs"){ this.rxT = this.snapT = performance.now(); if (!this.bsN || m.n > this.bsN || m.n <= 2){ this.bsN = m.n; this.safeApply({s: m.s}); } return; }
    if (m && m.t === "start") this.bsN = 0;
    return onHost.call(this, m);
  };
  const watch = PARTY.watch;
  PARTY.watch = function(){
    if (!BG.D[this.gid]) return watch.call(this);
    clearInterval(this.wdT); this.snapT = performance.now();
    this.wdT = setInterval(() => { if (this.role !== "guest" || $("#ng").hidden){ clearInterval(this.wdT); return; }
      if (NG.ended || !$("#ngOver").hidden){ this.snapT = performance.now(); return; }
      const gap = performance.now() - Math.max(this.snapT || 0, this.joinT || 0);
      if (gap > 9000) this.needGrid();
      if (gap > 25000 && this.canRelay() && !(this.hp && this.hp.relay)){ this.relayJoin(); this.joinT = performance.now(); } }, 3000);
  };
  /* 여럿이 한 판 기록: 이긴 친구 +1승 · 나머지 +1패 → 문서 한 번만 써요 */
  Store.putMulti = async function(game, w, ls){
    const R = this.recs[game] = this.recs[game] || {}, now = Date.now(), up = (s, k) => { R[s] = Object.assign({w: 0, l: 0}, R[s]); R[s][k]++; R[s].at = now; };
    up(w, "w"); ls.forEach(l => up(l, "l")); this.emit();
    if (this.mode === "local") return this.saveLocal();
    const fs = this.fs, inc = fs.increment(1), o = {[w]: {w: inc, at: now}}; ls.forEach(l => o[l] = {l: inc, at: now});
    try { await fs.setDoc(fs.doc(this.db, "arcade", this.cid, "recs", game), o, {merge: true}); } catch(e){ toast("⚠️ 승리 기록을 올리지 못했어요. 인터넷을 확인해 주세요."); console.error(e); }
  };
  /* 🤝 홈의 '협동방' 칸에도 보드게임 방이 보여요 */
  if (window.COOP){ const coop = COOP.coop; COOP.coop = gid => BG.D[gid] ? false : coop.call(COOP, gid); }
  const css = document.createElement("style");
  css.textContent = `.bg-intro{display:flex;gap:14px;align-items:center;background:rgba(255,255,255,.07);border-radius:16px;padding:10px 14px;margin-bottom:8px}.bg-intro .f{font-size:54px}.bg-intro b{font:24px "Jua",sans-serif}.bg-intro small{display:block;color:#c5bfe6}.bg-intro p{margin:4px 0 0;font-size:14px}
.bg-rules{background:rgba(255,255,255,.05);border-radius:12px;padding:6px 12px;margin-bottom:8px}.bg-rules summary{cursor:pointer;font:17px "Jua",sans-serif}.bg-rules ol{margin:6px 0;padding-left:22px;font-size:14px;line-height:1.65}
.in-room>.wb-sec.bg-on{display:block!important}.in-room>.bg-x,.in-room>.bg-rules{display:none!important}.wb-sec.bg-on{border:2px solid #ffd43b;box-shadow:0 0 18px rgba(255,212,59,.18)}
.bg-res{max-width:560px}.bg-rows{display:grid;gap:6px;margin:10px 0}.bg-rr{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:12px;background:rgba(255,255,255,.08);text-align:left}.bg-rr.me{outline:2px solid #4dabf7;background:rgba(77,171,247,.18)}
.bg-rr .rk{width:30px;text-align:center;font:20px "Jua",sans-serif}.bg-rr .avf,.bg-rr .f{width:38px;height:38px;flex:none;display:grid;place-items:center;font-size:28px}.bg-rr b{flex:1;font:17px "Jua",sans-serif}.bg-rr small{opacity:.85}.bg-rr em{font-style:normal;color:#ffe066}`;
  document.head.appendChild(css);
})();
