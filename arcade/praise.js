/* =====================================================================
   🏅 칭찬 카드 · 칭호  +  ▶ 이어하기 · 🚀 부스터 (모든 혼자 하는 게임)
   - 게임이 끝나면 "오늘의 칭찬" 한마디: 새 기록·다시 도전·끝까지 해낸 마음을 칭찬해요
   - 노력하면 모이는 칭찬 카드 24장 (첫 도전·꾸준함·다시 일어서기·함께하기·선생님 칭찬…)
     카드가 모일수록 칭호가 올라가요: 🌱 새싹 도전자 → … → 🌈 전설의 성장왕
   - ▶ 이어하기: 끝난 자리에서 그대로 다시 (🪙 500 → 800 → 1100 …)
   - 🚀 부스터 달고 다시 하기: 🛡️ 든든 시작(한 번 쓰러져도 자동으로 이어하기) 🪙500 ·
     🍀 행운 점수(이번 판 점수 +20%) 🪙600 · 🌟 둘 다 🪙1000
   - 선생님이 주는 🎁 칭찬 상 코인으로 사요 → 공부·바른 행동이 게임 속 힘이 돼요
   - 🐾 동물 랜덤 디펜스와 협동 게임(이미 이어하기가 있는 게임)은 빼요
   ===================================================================== */
const PRAISE = {
  CARDS: [
    ["first", "🎮", "첫 발걸음", "게임을 처음 끝까지 해요", "시작하는 용기가 모든 일의 첫걸음이에요. 오늘 그 걸음을 뗐어요!", s => s.plays >= 1],
    ["p10", "🔟", "열 번의 도전", "게임 10판", "열 번 해 본 사람은 한 번 해 본 사람보다 훨씬 많이 알아요. 경험은 가장 좋은 선생님이에요.", s => s.plays >= 10],
    ["p50", "💦", "오십 번의 땀방울", "게임 50판", "같은 일을 꾸준히 해내는 힘은 어른이 되어서도 너를 지켜 주는 보물이에요.", s => s.plays >= 50],
    ["p150", "🏔️", "산을 오르는 끈기", "게임 150판", "높은 산도 한 걸음씩 오르면 꼭대기에 닿아요. 너는 이미 그 방법을 알고 있어요.", s => s.plays >= 150],
    ["b1", "📈", "어제의 나를 넘다", "내 최고 기록 넘기", "남과 비교하지 않고 어제의 나보다 나아지는 것, 그게 진짜 성장이에요.", s => s.best >= 1],
    ["b10", "🚀", "성장 로켓", "내 최고 기록 10번 넘기", "열 번이나 스스로의 기록을 넘었어요! 노력은 절대 너를 배신하지 않아요.", s => s.best >= 10],
    ["b30", "🌠", "멈추지 않는 성장", "내 최고 기록 30번 넘기", "계속 자라는 사람은 어떤 어려움도 이겨 낼 수 있어요. 바로 너처럼!", s => s.best >= 30],
    ["r3", "🔁", "다시 일어서기", "기록을 못 넘어도 바로 다시 도전 3번", "넘어져도 다시 일어나는 사람이 결국 해내요. 실패는 성공으로 가는 계단이에요.", s => s.retry >= 3],
    ["r20", "🦾", "오뚝이 마음", "다시 도전 20번", "스무 번 넘어져도 스무 번 일어났어요. 그 마음이면 세상 어디서든 빛날 거예요.", s => s.retry >= 20],
    ["c1", "▶", "포기하지 않는 마음", "▶ 이어하기 1번", "끝났다고 생각할 때 한 번 더 해 보는 것, 그게 꿈을 이루는 사람들의 비밀이에요.", s => s.cont >= 1],
    ["g5", "🧭", "호기심 탐험가", "서로 다른 게임 5가지", "새로운 것에 도전하는 호기심은 배움을 즐겁게 만드는 마법이에요.", s => s.games >= 5],
    ["g12", "🗺️", "용감한 모험가", "서로 다른 게임 12가지", "낯선 길도 겁내지 않는 용기는 앞으로 만날 넓은 세상에서 큰 힘이 될 거예요.", s => s.games >= 12],
    ["d3", "🌱", "꾸준함의 씨앗", "3일 동안 놀러 오기", "매일 조금씩, 그게 가장 강한 힘이에요. 씨앗이 싹을 틔웠어요!", s => s.days >= 3],
    ["d7", "🌿", "꾸준함의 나무", "7일 동안 놀러 오기", "일주일을 꾸준히 해냈어요. 좋은 습관은 사람을 바꾸는 가장 큰 힘이에요.", s => s.days >= 7],
    ["d20", "🌳", "꾸준함의 숲", "20일 동안 놀러 오기", "스무 날의 꾸준함이 숲이 되었어요. 무엇이든 이렇게 하면 이룰 수 있어요.", s => s.days >= 20],
    ["co1", "🤝", "함께하는 힘", "친구와 협동 게임 1판", "혼자보다 함께일 때 더 멀리 갈 수 있어요. 좋은 친구가 되어 줘서 고마워요.", s => s.coop >= 1],
    ["co10", "🫂", "든든한 팀원", "친구와 협동 게임 10판", "친구를 믿고 힘을 보태는 사람은 어디서나 꼭 필요한 사람이에요.", s => s.coop >= 10],
    ["w1", "⚔️", "정정당당 승리", "친구와 대결에서 이기기", "이겼을 때 겸손하게 손 내미는 사람이 진짜 멋진 승자예요.", s => s.win >= 1],
    ["l3", "🙇", "멋진 패배", "대결에서 3번 져도 다시 도전", "져도 웃으며 다시 도전하는 마음, 그게 진짜 강한 사람의 마음이에요.", s => s.lose >= 3],
    ["top3", "🥉", "시상대에 서다", "어떤 게임이든 우리 반 3등 안", "열심히 한 만큼 결과가 따라왔어요. 오늘은 스스로를 꼭 칭찬해 주세요!", s => s.top3 >= 1],
    ["rank1", "👑", "우리 반 1등", "어떤 게임이든 우리 반 1등", "1등보다 더 멋진 건 1등이 되기까지 노력한 시간이에요.", s => s.rank1 >= 1],
    ["focus", "⏳", "깊은 집중", "한 판을 3분 넘게 집중", "한 가지에 오래 집중하는 힘은 공부에도, 꿈에도 날개를 달아 줘요.", s => s.focus >= 1],
    ["t1", "🎁", "선생님의 칭찬", "선생님께 칭찬 상 받기", "선생님이 너의 노력을 보고 있어요. 너는 칭찬받기에 충분한 사람이에요.", s => s.gifts >= 1],
    ["t5", "💌", "칭찬 부자", "선생님께 칭찬 상 5번", "칭찬을 많이 받는다는 건 그만큼 좋은 일을 많이 했다는 뜻이에요. 정말 자랑스러워요!", s => s.gifts >= 5]
  ],
  TITLES: [[0, "🌱", "새싹 도전자"], [3, "🌿", "쑥쑥 자라는 나무"], [6, "🔥", "끈기 챌린저"], [10, "💪", "다시 일어서는 용사"], [14, "🌟", "빛나는 노력가"], [18, "🏅", "모두의 본보기"], [22, "👑", "꿈을 이루는 리더"], [24, "🌈", "전설의 성장왕"]],
  COOP: ["qd", "sk", "bs", "rd", "wb"],
  last: null, t0: 0, queue: [], msg: "",
  pr(sid){ const w = walletOf(sid) || {}, p = w.pr || {}; return {c: Object.assign({}, p.c), s: Object.assign({plays: 0, best: 0, retry: 0, cont: 0, games: 0, days: 0, coop: 0, win: 0, lose: 0, top3: 0, rank1: 0, focus: 0, gifts: 0}, p.s), g: Object.assign({}, p.g), ld: p.ld || ""}; },
  count(sid){ return Object.keys(this.pr(sid).c).length; },
  title(n){ let t = this.TITLES[0]; this.TITLES.forEach(x => { if (n >= x[0]) t = x; }); return t; },
  next(n){ return this.TITLES.find(x => x[0] > n) || null; },
  /* 한 판 끝날 때마다: 숫자를 세고, 새로 얻은 카드는 축하 */
  async bump(sid, fn){
    if (!sid || !Store.cls) return;
    let fresh = [];
    try {
      await Store.kidTx(sid, w => {
        const p = w.pr = Object.assign({c: {}, s: {}, g: {}, ld: ""}, w.pr); p.c = Object.assign({}, p.c); p.s = Object.assign({}, p.s); p.g = Object.assign({}, p.g);
        const td = today(); if (p.ld !== td){ p.ld = td; p.s.days = (p.s.days || 0) + 1; }
        fn(p.s, p.g); p.s.games = Object.keys(p.g).length; p.s.gifts = Array.isArray(w.gifts) ? w.gifts.length : 0;
        const S = Object.assign({plays: 0, best: 0, retry: 0, cont: 0, games: 0, days: 0, coop: 0, win: 0, lose: 0, top3: 0, rank1: 0, focus: 0, gifts: 0}, p.s);
        fresh = []; this.CARDS.forEach(c => { if (!p.c[c[0]] && c[5](S)){ p.c[c[0]] = Date.now(); fresh.push(c); } });
        return w;
      });
    } catch(e){ console.warn(e); return; }
    if (fresh.length){ this.queue.push(...fresh); setTimeout(() => this.showNext(sid), 1100); }
  },
  /* 결과 화면의 "오늘의 칭찬" 한마디 */
  line(o){
    const pick = a => a[Math.floor(Math.random()*a.length)];
    if (o.cont) return pick(["▶ 끝까지 포기하지 않았어요! 그 마음이 진짜 실력이에요.", "▶ 한 번 더 일어선 용기, 정말 멋져요!"]);
    if (o.isNew) return pick(["🎉 어제의 나를 넘었어요! 이렇게 한 걸음씩 자라면 못 할 게 없어요.", "📈 새 기록! 노력한 만큼 자라고 있다는 증거예요.", "🌟 스스로의 기록을 넘은 너, 오늘 정말 빛났어요!"]);
    if (o.coop) return pick(["🤝 친구와 힘을 합친 시간, 그 자체가 정말 멋진 기록이에요.", "🫂 서로 도와주며 끝까지 해냈어요. 최고의 팀이에요!"]);
    if (o.near) return pick(["🔥 최고 기록에 거의 다 왔어요! 한 번만 더 하면 넘을 수 있어요.", "🔥 아까보다 더 잘했어요! 조금만 더 힘내요."]);
    if (o.retry >= 2) return `💪 ${o.retry + 1}번째 도전! 포기하지 않는 마음이 제일 멋져요.`;
    return pick(["🌱 괜찮아요, 실패는 성공으로 가는 계단이에요. 다시 해 볼까요?", "😊 끝까지 해낸 것만으로도 충분히 멋져요!", "🍀 연습할수록 손이 기억해요. 다음 판은 더 잘할 거예요."]);
  },
  onScore(gid, sid, rec){
    if (sid !== sidOf(ARC.me)) return;
    const now = Date.now(), prevBest = ((Store.recs[gid] || {})[sid] || {}).best || 0, score = rec.last || 0;
    const isNew = score > prevBest && score > 0, L = this.last, coop = this.COOP.includes(gid) && NG.gid === gid && (NG.sids || []).length > 1;
    const retry = L && L.gid === gid && !L.isNew && now - L.at < 10*60*1000 ? (L.retry || 0) + 1 : 0;
    const dur = NG.gid === gid && this.t0 ? now - this.t0 : 0;
    this.last = {gid, isNew, at: now, retry};
    this.msg = this.line({isNew, coop, retry, cont: RUN.cont > 0 && RUN.gid === gid, near: !isNew && prevBest > 0 && score >= prevBest*.8});
    setTimeout(() => { const B = board(gid), me = B.find(x => x.sid === sid);
      this.bump(sid, (s, g) => { s.plays = (s.plays || 0) + 1; g[gid] = 1; if (isNew && prevBest > 0) s.best = (s.best || 0) + 1; if (isNew && !prevBest) s.best = s.best || 0;
        if (retry) s.retry = (s.retry || 0) + 1; if (coop) s.coop = (s.coop || 0) + 1; if (dur > 3*60*1000) s.focus = (s.focus || 0) + 1;
        if (me && B.length >= 3 && me.rank <= 3) s.top3 = (s.top3 || 0) + 1; if (me && B.length >= 2 && me.rank === 1) s.rank1 = (s.rank1 || 0) + 1; }); }, 50);
  },
  onDuel(gid, w, l, cpu){ const me = sidOf(ARC.me); if (cpu || (w !== me && l !== me)) return;
    this.msg = w === me ? "⚔️ 이겼어요! 함께 해 준 친구에게 고맙다고 말해 볼까요?" : "🙇 져도 괜찮아요. 웃으며 다시 도전하는 마음이 진짜 강한 거예요.";
    this.bump(me, (s, g) => { s.plays = (s.plays || 0) + 1; g[gid] = 1; if (w === me) s.win = (s.win || 0) + 1; else s.lose = (s.lose || 0) + 1; }); },
  /* 🎉 새 칭찬 카드 축하 */
  showNext(sid){
    if ($("#prPop")) return; const c = this.queue.shift(); if (!c) return;
    const n = this.count(sid), t = this.title(n), prevT = this.title(n - 1), up = t !== prevT;
    document.body.insertAdjacentHTML("beforeend", `<div class="pr-pop" id="prPop">${NG.conf ? NG.conf(70) : ""}<div class="pr-card new"><div class="pr-shine"></div><span class="pr-e">${c[1]}</span><b>${c[2]}</b><p>${c[4]}</p><small>✅ ${c[3]}</small></div>
      <div class="pr-msg">🏅 칭찬 카드를 얻었어요! <b>${n}</b> / ${this.CARDS.length}장${up ? `<br>👏 새 칭호 <b>${t[1]} ${t[2]}</b>!` : ""}</div><button class="arc-btn p" id="prOk">멋져요! 👏</button></div>`);
    try { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, f, .12, "triangle", .08, i*.08)); } catch(e) {}
    $("#prOk").onclick = () => { $("#prPop").remove(); setTimeout(() => this.showNext(sid), 250); };
  },
  /* 📖 칭찬 카드 모음 */
  open(sid){
    sid = sid || sidOf(ARC.me); const P = this.pr(sid), n = Object.keys(P.c).length, t = this.title(n), nx = this.next(n);
    const S = Object.assign({plays: 0}, P.s);
    document.body.insertAdjacentHTML("beforeend", `<div class="arc-modal pr-modal" id="prBook"><div class="arc-card arc-wide"><button class="arc-x" id="prX">×</button>
      <h2>🏅 칭찬 카드 <small>${n} / ${this.CARDS.length}</small></h2>
      <div class="pr-ttl"><span class="pr-big">${t[1]}</span><div><b>${t[2]}</b><small>${nx ? `카드 <b>${nx[0] - n}</b>장 더 모으면 <b>${nx[1]} ${nx[2]}</b>` : "모든 칭호를 얻었어요! 정말 대단해요 🌈"}</small>
        <div class="pr-bar"><i style="width:${Math.round(n/this.CARDS.length*100)}%"></i></div></div></div>
      <p class="arc-small">🎮 ${S.plays}판 · 📈 기록 넘기 ${S.best || 0}번 · 🔁 다시 도전 ${S.retry || 0}번 · 📅 ${S.days || 0}일 · 🤝 협동 ${S.coop || 0}판 · 🎁 선생님 칭찬 ${S.gifts || 0}번</p>
      <div class="pr-grid">${this.CARDS.map(c => { const at = P.c[c[0]]; return at ? `<div class="pr-card"><span class="pr-e">${c[1]}</span><b>${c[2]}</b><p>${c[4]}</p><small>${new Date(at).toLocaleDateString("ko-KR", {month: "long", day: "numeric"})}에 얻음</small></div>`
        : `<div class="pr-card lock"><span class="pr-e">🔒</span><b>${c[2]}</b><p>${c[3]}</p></div>`; }).join("")}</div>
      <p class="arc-small">💡 카드는 이겨야만 얻는 게 아니에요. 꾸준히, 다시, 함께, 끝까지 — 노력하는 모든 순간을 칭찬해요.</p></div></div>`);
    const close = () => $("#prBook") && $("#prBook").remove(); $("#prX").onclick = close; $("#prBook").addEventListener("click", e => { if (e.target.id === "prBook") close(); });
  },
  inject(){ const info = $("#ngOver .ng-box .info"); if (this.msg && info && !info.querySelector(".ng-praise")) info.insertAdjacentHTML("afterbegin", `<div class="ng-praise">${esc(this.msg)}</div>`); this.msg = ""; },
  chip(sid){ const n = this.count(sid), t = this.title(n); return `<button class="pr-chip" id="prChip" title="칭찬 카드 모음">${t[1]} ${t[2]} <small>🏅 ${n}/${this.CARDS.length}</small></button>`; }
};
window.PRAISE = PRAISE;

/* =====================================================================
   ▶ 이어하기 · 🚀 부스터 (한 판 동안의 상태)
   ===================================================================== */
const RUN = {
  gid: null, cont: 0, free: 0, mult: 1, saved: null, pending: null,
  SKIP: ["rd"],
  ok(gid){ return !this.SKIP.includes(gid) && !(typeof CONT !== "undefined" && CONT.G.includes(gid)); },
  contCost(){ return 500 + 300*this.cont; },
  BOOST: [{k: "free", e: "🛡️", n: "든든 시작", d: "한 번 쓰러져도 저절로 이어하기", c: 500, rv: 1}, {k: "mult", e: "🍀", n: "행운 점수", d: "이번 판 점수 +20%", c: 600}, {k: "both", e: "🌟", n: "둘 다!", d: "🛡️ 든든 시작 + 🍀 점수 +20%", c: 1000, rv: 1}],
  coins(){ return (walletOf(sidOf(ARC.me)) || {}).coins || 0; },
  async pay(cost){ try { await Store.buy(sidOf(ARC.me), [], cost); return true; } catch(e){ toast("🪙 코인이 모자라요"); return false; } },
  /* 결과 화면에 단추 붙이기 */
  attach(gid){
    const box = $("#ngOver .ng-box"), row = box && box.querySelector(".arc-row"); if (!row || box.querySelector(".rn-cont") || !this.ok(gid)) return;
    const c = this.coins(), canRv = !!(NG.cur && NG.cur.revive) && !NG.opt.party && !NG.opt.net, cost = this.contCost();
    const html = `${canRv ? `<div class="ng-cont rn-cont"><button class="arc-btn p" id="rnCont" ${c >= cost ? "" : "disabled"}>▶ 이어하기 · 🪙 ${cost.toLocaleString()}</button>
        <small>${c >= cost ? `지금 점수 그대로 다시 해요 · 내 코인 ${c.toLocaleString()} → ${(c - cost).toLocaleString()}` : `코인이 모자라요 (내 코인 ${c.toLocaleString()} / ${cost.toLocaleString()}) · 선생님 칭찬 상으로 모아요!`}</small></div>` : ""}
      <div class="rn-boost" id="rnBoost" hidden><b>🚀 부스터 달고 다시 하기</b><small>내 코인 🪙 ${c.toLocaleString()}</small><div class="rn-bs">${this.BOOST.filter(b => canRv || !b.rv).map(b => `<button class="rn-b" data-b="${b.k}" ${c >= b.c ? "" : "disabled"}><span>${b.e}</span><b>${b.n}</b><small>${b.d}</small><em>🪙 ${b.c.toLocaleString()}</em></button>`).join("")}</div></div>`;
    row.insertAdjacentHTML("beforebegin", html);
    if (!NG.opt.party && !NG.opt.net) row.insertAdjacentHTML("afterbegin", `<button class="arc-btn rn-bbtn" id="rnBB">🚀 부스터</button>`);
    const rc = $("#rnCont"); if (rc) rc.addEventListener("click", async e => { e.stopPropagation(); if (rc.disabled) return; rc.disabled = true;
      if (!await this.pay(cost)){ rc.disabled = false; return; }
      this.cont++; toast(`▶ 🪙 ${cost.toLocaleString()}코인을 쓰고 이어서 해요!`); PRAISE.bump(sidOf(ARC.me), s => s.cont = (s.cont || 0) + 1); this.resume(); });
    const bb = $("#rnBB"); if (bb) bb.addEventListener("click", e => { e.stopPropagation(); const p = $("#rnBoost"); p.hidden = !p.hidden; });
    box.querySelectorAll(".rn-b").forEach(b => b.addEventListener("click", async e => { e.stopPropagation(); if (b.disabled) return; const B = this.BOOST.find(x => x.k === b.dataset.b);
      box.querySelectorAll(".rn-b").forEach(x => x.disabled = true); if (!await this.pay(B.c)){ box.querySelectorAll(".rn-b").forEach(x => x.disabled = false); return; }
      this.pending = {gid, free: B.k !== "mult" ? 1 : 0, mult: B.k !== "free" ? 1.2 : 1}; toast(`🚀 ${B.e} ${B.n}! 부스터를 달고 다시 시작해요`); NG.again(); }));
  },
  resume(){ $("#ngOver").hidden = true; $("#ngOver").innerHTML = ""; NG.ended = false; NG.drawnEnd = false; try { NG.cur.revive(); } catch(e){ console.error(e); } },
  banner(){ const b = []; if (this.free) b.push("🛡️ 든든 시작"); if (this.mult > 1) b.push("🍀 점수 +20%"); if (b.length) setTimeout(() => toast(`🚀 부스터 켜짐: ${b.join(" · ")}`), 500); }
};
window.RUN = RUN;

(function(){
  // 새 판 시작: 부스터 적용, 이어하기 횟수 초기화
  const play = NG.play;
  NG.play = function(gid, sids, opt){
    const P = RUN.pending; RUN.pending = null;
    RUN.gid = gid; RUN.cont = 0; RUN.saved = null; RUN.free = P && P.gid === gid ? P.free : 0; RUN.mult = P && P.gid === gid ? P.mult : 1;
    PRAISE.t0 = Date.now();
    const r = play.apply(this, arguments); RUN.banner(); return r;
  };
  // 끝: 🛡️ 든든 시작이면 저절로 이어하기, 🍀 점수 보너스, 결과 화면에 칭찬 한마디 · 이어하기 · 부스터
  const over = NG.over;
  NG.over = function(score, extra = ""){
    if (this.ended) return;
    const gid = this.gid;
    if (RUN.gid === gid && RUN.free > 0 && this.cur && this.cur.revive && RUN.ok(gid) && !this.opt.party){ RUN.free--; toast("🛡️ 든든 시작 부스터! 한 번 더 해요"); try { this.cur.revive(); } catch(e){ console.error(e); } return; }
    if (RUN.gid === gid && RUN.mult > 1 && RUN.ok(gid)){ const s0 = score; score = Math.round(score*RUN.mult); extra = `<div class="ng-boost">🍀 행운 점수 부스터 ${s0.toLocaleString()} → <b>${score.toLocaleString()}</b>점</div>` + extra; }
    if (RUN.gid === gid && RUN.cont) extra = `<div class="ng-boost">▶ 이어하기 ${RUN.cont}번으로 끝까지 해냈어요!</div>` + extra;
    RUN.prev = RUN.saved; RUN.saved = score;
    const r = over.call(this, score, extra);
    setTimeout(() => { if (this.gid !== gid || !this.ended) return; PRAISE.inject(); RUN.attach(gid); }, 0);
    return r;
  };
  const win = NG.win;
  NG.win = function(){ const r = win.apply(this, arguments); setTimeout(() => PRAISE.inject(), 0); return r; };
  // 이어한 판은 코인을 처음부터 다시 받지 않게 (늘어난 만큼만)
  const sc = ARC.score;
  ARC.score = function(gid, sid, rec){
    try { PRAISE.onScore(gid, sid, rec); } catch(e){ console.warn(e); }
    if (RUN.gid === gid && RUN.cont > 0 && RUN.prev != null && typeof coinsFor === "function"){
      const minus = coinsFor(gid, RUN.prev), e0 = Store.earn; Store.earn = function(s, n){ return e0.call(this, s, Math.max(0, n - minus)); };
      try { return sc.call(this, gid, sid, rec); } finally { Store.earn = e0; } }
    return sc.call(this, gid, sid, rec);
  };
  if (typeof CONT !== "undefined"){ const cr = CONT.resume; CONT.resume = function(){ try { if (!$("#ngCont") || $("#ngCont").disabled) PRAISE.bump(sidOf(ARC.me), s => s.cont = (s.cont || 0) + 1); } catch(e) {} return cr.apply(this, arguments); }; }
  const duel = ARC.duel;
  ARC.duel = function(gid, w, l, cpu){ try { PRAISE.onDuel(gid, w, l, cpu); } catch(e){ console.warn(e); } return duel.apply(this, arguments); };
  // 홈 화면 내 카드 아래 칭호 단추
  const rh = LOBBY.renderHome;
  LOBBY.renderHome = function(){ const r = rh.apply(this, arguments); try { const me = ARC.me, box = $("#hmMe");
      if (box && me !== null && me !== undefined && Store.cls){ const sid = sidOf(me), html = PRAISE.chip(sid), old = $("#prChip");
        if (!old || old.outerHTML !== html){ if (old) old.remove(); const host = box.querySelector("div") || box; host.insertAdjacentHTML("beforeend", html); $("#prChip").onclick = e => { e.stopPropagation(); PRAISE.open(sid); }; }
        const g = ((walletOf(sid) || {}).gifts || []).length, s = PRAISE.pr(sid).s; if (g !== (s.gifts || 0)) PRAISE.bump(sid, () => {}); } } catch(e){ console.warn(e); } return r; };
  const css = document.createElement("style");
  css.textContent = `.ng-praise{margin:2px 0 8px;padding:8px 12px;border-radius:14px;background:linear-gradient(90deg,rgba(255,224,102,.18),rgba(255,138,201,.18));color:#fff3bf;font-size:16px;line-height:1.45}
.ng-boost{color:#b2f2bb;font-size:14px}
.rn-bbtn{background:linear-gradient(180deg,#b197fc,#7048e8) !important;color:#fff !important}
.rn-boost{margin:8px 0;padding:10px;border-radius:16px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);text-align:center}
.rn-boost>b{display:block;font:18px "Jua",sans-serif;color:#e5dbff}.rn-boost>small{color:#d0bfff}
.rn-bs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}
.rn-b{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 6px;border-radius:14px;border:2px solid #b197fc;background:linear-gradient(180deg,#3b2f7a,#241b52);color:#fff;cursor:pointer}
.rn-b span{font-size:30px}.rn-b b{font:16px "Jua",sans-serif}.rn-b small{font-size:12px;color:#d0bfff;line-height:1.3}.rn-b em{font-style:normal;color:#ffe066;font:15px "Jua",sans-serif}
.rn-b[disabled]{opacity:.45;filter:grayscale(.7);cursor:default}
@media (max-width:520px){.rn-bs{grid-template-columns:1fr}.rn-b{flex-direction:row;justify-content:space-between;text-align:left}}
.pr-chip{display:inline-flex;align-items:center;gap:6px;margin:4px 6px 0 0;padding:3px 10px;border-radius:999px;border:1.5px solid #ffe066;background:linear-gradient(90deg,rgba(255,224,102,.2),rgba(255,138,201,.2));color:#fff3bf;font:14px "Jua",sans-serif;cursor:pointer}
.pr-chip small{color:#ffe066;font-size:12px}
.pr-pop{position:fixed;inset:0;z-index:3000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:rgba(10,6,30,.78);padding:20px;overflow:hidden}
.pr-pop .pr-card{width:min(300px,82vw);animation:prIn .7s cubic-bezier(.2,1.4,.4,1)}
@keyframes prIn{0%{transform:scale(.2) rotateY(180deg);opacity:0}100%{transform:none;opacity:1}}
.pr-msg{color:#fff;font:18px "Jua",sans-serif;text-align:center;line-height:1.5}.pr-msg b{color:#ffe066}
.pr-card{position:relative;overflow:hidden;display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 12px;border-radius:20px;background:linear-gradient(160deg,#fff9db,#ffe3ec 55%,#e5dbff);color:#3b2a5c;text-align:center;border:3px solid #ffd43b;box-shadow:0 8px 24px rgba(0,0,0,.3)}
.pr-card .pr-e{font-size:46px;line-height:1}.pr-card b{font:19px "Jua",sans-serif}.pr-card p{margin:0;font-size:14px;line-height:1.45}.pr-card small{color:#7048e8;font-size:12px}
.pr-card.lock{background:rgba(255,255,255,.06);border:2px dashed rgba(255,255,255,.25);color:#adb5bd;box-shadow:none}.pr-card.lock .pr-e{font-size:32px;opacity:.6}.pr-card.lock b{color:#ced4da}
.pr-shine{position:absolute;inset:-40%;background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.7) 50%,transparent 60%);animation:prSh 1.8s .5s ease-in-out 2}
@keyframes prSh{0%{transform:translateX(-60%)}100%{transform:translateX(60%)}}
.pr-modal .arc-card{max-height:92vh;overflow:auto}.pr-modal h2 small{font-size:16px;color:#ffe066;margin-left:6px}
.pr-ttl{display:flex;align-items:center;gap:12px;margin:8px 0;padding:12px;border-radius:16px;background:linear-gradient(90deg,rgba(255,224,102,.15),rgba(177,151,252,.15))}
.pr-big{font-size:46px}.pr-ttl>div>b{display:block;font:22px "Jua",sans-serif;color:#ffe066}.pr-ttl small{display:block;color:#e5dbff}.pr-ttl small b{color:#ffe066}.pr-ttl>div{flex:1}
.rn-cont{display:flex;flex-direction:column;align-items:center;gap:4px;margin:10px 0 4px}.rn-cont .arc-btn{min-width:240px;font-size:20px;background:linear-gradient(180deg,#ffe066,#fab005) !important;color:#3b2a00 !important;box-shadow:0 5px 0 #e67700}
.rn-cont .arc-btn[disabled]{filter:grayscale(.8);opacity:.6}.rn-cont small{color:#d0bfff;font-size:13px}
.pr-bar{height:10px;border-radius:5px;background:rgba(0,0,0,.35);margin-top:6px;overflow:hidden}.pr-bar i{display:block;height:100%;background:linear-gradient(90deg,#ffd43b,#ff8ac9)}
.pr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;margin:10px 0}
.pr-grid .pr-card{padding:12px 8px}.pr-grid .pr-card .pr-e{font-size:36px}.pr-grid .pr-card p{font-size:12.5px}`;
  document.head.appendChild(css);
})();
