/* =====================================================================
   🏠 오락실 로비 (2026.11.13)
   - 첫 화면(로그인)에 🏆 명예의 전당 · 🟢 지금 접속 중
   - 홈: 게임 카드 + 옆 패널 [🏆 랭킹 | ⚔️ 대결방 | 💬 채팅]
   - 🛠️ 관리자: 지금 현황 · 채팅 관리 · 대결방 · 게임 끄기/문 닫기
   - ⚡ 렉 줄이기: 바뀐 칸만 다시 그리기, 아바타는 그림으로 한 번만, 접속 신호는 4분에 한 번
   ===================================================================== */
const hhmm = t => { const d = new Date(t || 0); return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`; };
const agoTxt = t => { const m = Math.floor((Date.now() - (t || 0))/60000); return m < 1 ? "방금" : m < 60 ? `${m}분 전` : m < 1440 ? `${Math.floor(m/60)}시간 전` : `${Math.floor(m/1440)}일 전`; };
const isT = no => +no === TEACHER;
const avI = (sid, cls = "avf") => `<span class="${cls}">${avHTMLof(sid, {still: true, face: true})}</span>`;
const gameOn = gid => !((Store.cls && Store.cls.off) || {})[gid];

/* =====================================================================
   🔴 실시간 반 소식: 접속 중 · 채팅 · 대결방
   ☁️ Firebase 반: arcade/{반}/on · chat · lobby  /  💻 이 기기: localStorage (같은 기기의 다른 창끼리)
   ===================================================================== */
const LIVE = {
  started: false, chat: [], on: {}, rooms: [], subs: [], un: [], _t: 0, _k: {}, last: null, cur: {st: "off", g: ""}, loaded: false,
  emit(kind){ this._k[kind] = 1; if (this._t) return; this._t = setTimeout(() => { const k = this._k; this._k = {}; this._t = 0; this.subs.forEach(f => { try { f(k); } catch(e) { console.error(e); } }); }, 120); },
  cloud(){ return Store.mode === "cloud" && !!Store.fs; },
  col(n){ return Store.fs.collection(Store.db, "arcade", Store.cid, n); },
  lk(n){ return `${KEY}.live.${Store.cls.cid}.${n}`; },
  lget(n, d){ try { return JSON.parse(localStorage.getItem(this.lk(n))) || d; } catch(e) { return d; } },
  lset(n, v){ try { localStorage.setItem(this.lk(n), JSON.stringify(v)); } catch(e) {} this.lload(); },
  lload(){ this.chat = this.lget("chat", []).slice(-50); this.on = this.lget("on", {}); this.rooms = this.lget("lobby", []); this.loaded = true; this.emit("chat"); this.emit("on"); this.emit("rooms"); },
  start(){
    if (this.started || !Store.cls) return; this.started = true;
    if (this.cloud()){
      const fs = Store.fs, warn = e => console.warn("[오락실 실시간]", e);
      // 채팅은 마지막 50개만 받아요 (반 친구 모두가 받으니까 적게)
      this.un.push(fs.onSnapshot(fs.query(this.col("chat"), fs.orderBy("at", "desc"), fs.limit(50)), qs => { const l = []; qs.forEach(d => l.push(Object.assign({id: d.id}, d.data()))); this.chat = l.reverse(); this.emit("chat"); }, warn));
      this.un.push(fs.onSnapshot(this.col("on"), qs => { const o = {}; qs.forEach(d => o[d.id] = d.data()); this.on = o; this.emit("on"); }, warn));
      this.un.push(fs.onSnapshot(this.col("lobby"), qs => { const l = []; qs.forEach(d => l.push(Object.assign({id: d.id}, d.data()))); this.rooms = l; this.loaded = true; this.emit("rooms"); }, warn));
    } else {
      this.lload();
      addEventListener("storage", e => { if (e.key && e.key.startsWith(`${KEY}.live.`)) this.lload(); });
    }
    setInterval(() => this.emit("tick"), 30000);                         // '몇 분 전' · 접속 표시 새로
    setInterval(() => { if (ARC.me !== null && !document.hidden) this.ping(this.cur.st, this.cur.g, true); }, 4*60000);   // 4분마다 '나 여기 있어요'
    document.addEventListener("visibilitychange", () => { if (ARC.me === null) return; if (document.hidden) this.ping("off", "", true, true); else this.ping(this.cur.st === "off" ? "home" : this.cur.st, this.cur.g, true); });
    addEventListener("pagehide", () => { ROOMS.leaveMine(); if (ARC.me !== null) this.ping("off", "", true, true); });
  },

  /* ---- 🟢 접속 중 (바뀔 때 + 4분마다만 올려요 → 반 전체 읽기 수가 적어요) ---- */
  ping(st, g, force, keepCur){
    if (ARC.me === null || ARC.me === undefined || !Store.cls) return;
    if (!keepCur) this.cur = {st, g: g || ""};
    const sid = sidOf(ARC.me), o = {no: ARC.me, st, g: g || "", at: Date.now()};
    if (!force && this.last && this.last.st === o.st && this.last.g === o.g && o.at - this.last.at < 60000) return;
    this.last = o; this.on[sid] = o; this.emit("on");
    if (this.cloud()) Store.fs.setDoc(Store.fs.doc(this.col("on"), sid), o).catch(() => {});
    else { const m = this.lget("on", {}); m[sid] = o; this.lset("on", m); }
  },
  online(sid){ const o = this.on[sid]; return o && o.st !== "off" && Date.now() - (o.at || 0) < 6*60000 ? o : null; },
  onlineList(){ return roster().filter(s => this.online(sidOf(s.no))); },

  /* ---- 💬 채팅 ---- */
  async say(o){
    if (this.cloud()) return Store.fs.addDoc(this.col("chat"), o);
    const l = this.lget("chat", []); l.push(Object.assign({id: rid(10)}, o)); this.lset("chat", l.slice(-80));
  },
  async unsay(id){
    this.chat = this.chat.filter(m => m.id !== id); this.emit("chat");
    if (this.cloud()) return Store.fs.deleteDoc(Store.fs.doc(this.col("chat"), id));
    this.lset("chat", this.lget("chat", []).filter(m => m.id !== id));
  },
  async clearChat(){
    if (!this.cloud()){ this.lset("chat", []); return; }
    const fs = Store.fs; let n = 0;
    for (let k = 0; k < 4; k++){
      const qs = await fs.getDocs(fs.query(this.col("chat"), fs.orderBy("at", "desc"), fs.limit(200)));
      if (qs.empty) break; const b = fs.writeBatch(Store.db); qs.forEach(d => { b.delete(d.ref); n++; }); await b.commit();
    }
    return n;
  },

  /* ---- ⚔️ 대결방 ---- */
  async addRoom(o){
    if (this.cloud()){ const ref = Store.fs.doc(this.col("lobby")); await Store.fs.setDoc(ref, o); return ref.id; }
    const id = rid(10), l = this.lget("lobby", []); l.push(Object.assign({id}, o)); this.lset("lobby", l); return id;
  },
  async delRoom(id){
    this.rooms = this.rooms.filter(r => r.id !== id); this.emit("rooms");
    if (this.cloud()) return Store.fs.deleteDoc(Store.fs.doc(this.col("lobby"), id)).catch(() => {});
    this.lset("lobby", this.lget("lobby", []).filter(r => r.id !== id));
  },
  async joinRoom(id, me){
    const gone = "방이 없어졌어요. 다른 방을 골라 봐요", full = "벌써 다른 친구가 들어갔어요";
    if (this.cloud()){
      const fs = Store.fs, ref = fs.doc(this.col("lobby"), id);
      return fs.runTransaction(Store.db, async t => { const d = await t.get(ref); if (!d.exists()) throw new Error(gone); if (d.data().st !== "open") throw new Error(full); t.update(ref, {st: "full", guest: me, gat: Date.now()}); });
    }
    const l = this.lget("lobby", []), r = l.find(x => x.id === id); if (!r) throw new Error(gone); if (r.st !== "open") throw new Error(full);
    Object.assign(r, {st: "full", guest: me, gat: Date.now()}); this.lset("lobby", l);
  }
};

/* ---------- 💬 채팅 규칙: 고운 말 · 천천히 · 선생님이 끄고 켜요 ---------- */
const CHAT = {
  BAD: ["시발","씨발","씨바","씨빨","씹","ㅅㅂ","ㅆㅂ","ㅅ1ㅂ","병신","븅신","빙신","ㅂㅅ","ㅄ","개새","개색","새끼","색끼","섀끼","존나","졸라","좆","ㅈㄴ","ㅈ같","지랄","ㅈㄹ","닥쳐","꺼져","미친","미쳤냐","ㅁㅊ","또라이","등신","찐따","느금","니애미","니엄마","애미","애비","엠창","fuck","shit","bitch","sex","섹스","야동","죽어","뒤져","디져",
    /* 비방(놀리기·흉보기) */ "바보","멍청","한심","재수없","못생","꼴통","왕따","찌질","쓰레기","장애인","정신병","돌아이","죽여","죽을래","꺼지","닥치","sibal","tlqkf","qudtls"],
  last: 0, lastT: "",
  rules(){ return Object.assign({off: false, slow: 3}, (Store.cls || {}).chat); },
  muted(no){ const u = (((Store.cls || {}).mute) || {})[no] || 0; return u > Date.now() ? u : 0; },
  norm(t){ return String(t).toLowerCase().replace(/[\s.,!?\-_~^*@#$%&()'"`:;+=<>\/\\|[\]{}0-9ㆍ·…]/g, ""); },
  /* 🚫 영원히 추방 (선생님이 풀어 줄 때까지) */
  banned(no){ return !!((((Store.cls || {}).chatBan) || {})[no]); },
  bad(t){ const n = this.norm(t); return this.BAD.concat(((Store.cls || {}).ban) || []).map(w => this.norm(w)).find(w => w && n.includes(w)); },
  /* 왜 못 보내는지 (보낼 수 있으면 "") */
  why(no){
    if (no === null || no === undefined) return "로그인해야 채팅할 수 있어요";
    if (isT(no)) return "";
    if (this.banned(no)) return "🚫 채팅방에서 추방됐어요";
    const R = this.rules();
    if ((Store.cls || {}).closed) return "🔒 지금은 오락실 쉬는 시간이에요";
    if (R.off) return "🤫 선생님이 채팅을 잠깐 껐어요";
    const m = this.muted(no); if (m) return `🔇 ${hhmm(m)}까지 채팅을 쉬어요`;
    return "";
  },
  async send(text, no = ARC.me, k){
    const t = String(text || "").replace(/\s+/g, " ").trim().slice(0, 50);
    if (!t) return "";
    const w = this.why(no); if (w) return w;
    if (!isT(no)){
      const slow = Math.max(1, +this.rules().slow || 0)*1000, left = this.last + slow - Date.now();
      if (left > 0) return `⏳ ${Math.ceil(left/1000)}초 뒤에 보낼 수 있어요`;
      if (t === this.lastT && k !== "st") return "🔁 같은 말을 또 보내지 않아요";
      if (/https?:|www\.|\.(com|net|kr|io|ly|gg)\b/i.test(t)) return "🔗 채팅에는 주소(링크)를 올리지 않아요";
      if (this.bad(t)){
        // 욕·비방: 보내지 않고, 선생님 화면에 경고 횟수와 그 말을 남겨요
        this.warn = (this.warn || 0) + 1; const sid = sidOf(no), n = ((Store.kids[sid] || {}).cw || 0) + 1;
        Store.kidTx(sid, w => Object.assign(w, {cw: (w.cw || 0) + 1, cwLast: t.slice(0, 50), cwAt: Date.now()})).catch(e => console.error(e));
        try { tone(300, 160, .25, "sawtooth", .08); } catch(e) {}
        return `🙅 보낼 수 없는 말이에요! 욕·비방은 선생님께 기록돼요 (경고 ${n}번). 계속하면 채팅방에서 영원히 추방될 수 있어요`;
      }
    }
    this.last = Date.now(); this.lastT = t;
    try { await LIVE.say(Object.assign({no: +no, t, at: Date.now()}, k === "st" ? {k} : {})); } catch(e){ console.error(e); return "⚠️ 보내지 못했어요. 인터넷을 확인해 주세요."; }
    return "";
  },
  /* 🏆 새 1등 같은 자동 알림 */
  sys(t){ if (LIVE.cloud() || Store.mode === "local") LIVE.say({no: -1, sys: 1, t: String(t).slice(0, 80), at: Date.now()}).catch(() => {}); }
};


/* 😊 이모티콘 고르기 */
const CHAT_EMO = [
  ["😀", "얼굴", "😀😃😄😁😆😅🤣😂🙂😉😊😇🥰😍🤩😘😋😛😜🤪😝🤗🤭🤫🤔😐😑😶🙄😏😴😪😮😯😲😳🥺😢😭😤😱😨😰😓🤯🥳😎🤓🧐🤠👻🤖😺😸😹😻🙀"],
  ["❤️", "마음", "❤️🧡💛💚💙💜🤎🖤🤍💖💗💓💞💕💘💝💟❣️✨⭐🌟💫🔥💥💯🎵🎶💤💦💨"],
  ["👍", "손", "👍👏🙌👐🤝🙏✌️🤞🤟👌👈👉👆👇☝️✋🤚🖐️👋🤙💪✍️🫶"],
  ["🐶", "동물", "🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🐧🐦🐤🦆🦉🐺🐴🦄🐝🐛🦋🐌🐞🐢🐍🦖🦕🐙🦑🦀🐬🐳🐋🦈🐊🦒🐘🦔🐿️"],
  ["🍕", "음식", "🍎🍊🍋🍌🍉🍇🍓🍒🍑🥭🍍🥝🍅🥕🌽🍟🍕🌭🍔🥪🌮🍙🍚🍜🍝🍣🍤🍦🍧🍨🍩🍪🎂🍰🧁🍫🍬🍭🍮🍯🥛🧃🧋"],
  ["⚽", "놀이", "⚽🏀🏈⚾🎾🏐🏉🏓🏸🏒🥅⛳🏆🥇🥈🥉🏅🎮🕹️🎲🧩🎯🎳🎨🎤🎧🎸🎹🥁🚀✈️🚗🚲🛹🎡🎢🎠"],
  ["🎉", "기타", "🎉🎊🎈🎁🎀🪄📚✏️📝📌📎🔑💡🔔📢⏰⌛🌈☀️🌙⛄❄️☔🌸🌻🌷🍀🌲🌍🏫🏠"]
];
const CHAT_ST = ["👍", "😂", "🥰", "😭", "😮", "🤔", "🎉", "🔥", "💯", "👏", "🙏", "😴", "🥳", "😎", "🤗", "😱", "❤️", "⭐", "🏆", "✌️", "🍀", "🐶", "🐱", "🍕"];
const emoList = s => Array.from(new Intl.Segmenter("ko", {granularity: "grapheme"}).segment(s), x => x.segment);
const emoOnly = t => /^(\p{Extended_Pictographic}|\p{Emoji_Component}|\u200d|\ufe0f|\s){1,16}$/u.test(t) && !/[0-9#*]/.test(t);

/* ---------- ⚔️ 대결방: 방을 만들면 다른 기기 친구가 들어와서 바로 시작 ---------- */
const ROOMS = {
  mine: null, mineAt: 0, inviting: false,
  ok(){ return NET.ok() && !(Store.cls || {}).roomsOff; },
  list(){ return LIVE.rooms.filter(r => r.st === "open" && GAME[r.g] && gameOn(r.g) && Date.now() - (r.at || 0) < 15*60000 && (r.host === ARC.me || LIVE.online(sidOf(r.host)))).sort((a, b) => (a.at || 0) - (b.at || 0)); },
  myRoom(){ return this.mine && LIVE.rooms.find(r => r.id === this.mine); },
  async open(g){
    if (!this.ok() || ARC.me === null) return;
    if (this.mine) await this.close();
    const why = LOBBY.blocked(g); if (why) return toast(why);
    try { this.mineAt = Date.now(); this.mine = "…"; this.mine = await LIVE.addRoom({g, host: ARC.me, st: "open", at: Date.now()}); toast(`⚔️ ${GAME[g].e} ${GAME[g].n} 방을 만들었어요! 친구가 들어오면 바로 시작해요`); }
    catch(e){ this.mine = null; console.error(e); toast("⚠️ 방을 만들지 못했어요. 인터넷을 확인해 주세요."); }
    LOBBY.renderSide(true);
  },
  async close(){ const id = this.mine; this.mine = null; if (id && id !== "…") await LIVE.delRoom(id); LOBBY.renderSide(true); },
  leaveMine(){ if (this.mine && this.mine !== "…"){ const id = this.mine; this.mine = null; LIVE.delRoom(id); } },
  async join(id){
    const r = LIVE.rooms.find(x => x.id === id); if (!r || ARC.me === null) return;
    if (r.host === ARC.me) return;
    const why = LOBBY.blocked(r.g); if (why) return toast(why);
    if (this.mine) await this.close();
    try { await LIVE.joinRoom(id, ARC.me); } catch(e){ toast("😢 " + (e.message || e)); return; }
    const g = GAME[r.g], at = Date.now();
    NET.auto = {from: r.host, g: r.g, at, until: at + 45000};
    NET.gid = r.g; NET.a = r.host; NET.b = ARC.me;
    NET.box(`⚔️ ${g.e} ${g.n} 대결방`, `🚪 <b>${esc(who(r.host))}</b>의 방에 들어갔어요!<br>방장 기기와 연결하는 중… 잠깐만 기다려요`, [{t: "✕ 그만두기", f: () => { NET.auto = null; NET.cancel(); }}]);
    NET.showInvite();
    setTimeout(() => { if (NET.auto && NET.auto.at === at){ NET.auto = null; NET.fail("⌛ 방장 기기와 연결되지 않았어요.<br><small>방장이 다른 화면으로 갔을 수 있어요. 다른 방에 들어가거나 새 방을 만들어 봐요.</small>"); } }, 45000);
  },
  /* 방장 기기: 친구가 들어오면 신청을 보내요 (친구 기기는 자동으로 받아요) */
  check(){
    if (!this.mine || this.mine === "…" || this.inviting || ARC.busy) return;
    const r = this.myRoom();
    if (!r){ if (LIVE.loaded && Date.now() - this.mineAt > 8000) this.mine = null; return; }
    if (r.st === "full" && r.guest !== undefined && r.guest !== null){
      this.inviting = true; const g = r.g, guest = r.guest; this.mine = null; LIVE.delRoom(r.id);
      try { tone(660, 990, .12, "triangle", .12); } catch(e) {}
      NET.invite(g, guest); setTimeout(() => this.inviting = false, 4000);
    }
  }
};

/* =====================================================================
   🖼️ 화면 그리기 (바뀐 칸만 다시 그려요)
   ===================================================================== */
const LOBBY = {
  sig: {}, filter: "all", tab: "rank", rk: {g: "fl", day: false}, fame: 0, fameTouch: 0, fameTimer: 0, seen: 0, chatSig: "",
  put(id, html){ if (this.sig[id] === html) return false; this.sig[id] = html; const el = document.getElementById(id); if (el) el.innerHTML = html; return true; },
  visGames(){ const t = isT(ARC.me); return GAMES.filter(g => t || gameOn(g.id)); },

  /* ---- 막기: 문 닫힘 · 게임 꺼짐 · 내보내기 ---- */
  blocked(gid){
    if (isT(ARC.me)) return "";
    const c = Store.cls || {};
    if (c.closed) return "🔒 지금은 오락실 쉬는 시간이에요";
    if (gid && (c.off || {})[gid]) return `⏸️ 선생님이 ${GAME[gid].e} ${GAME[gid].n}을(를) 잠깐 껐어요`;
    return "";
  },
  canPlay(gid){ const w = this.blocked(gid); if (w){ toast(w); return false; } return true; },
  guard(){
    const me = ARC.me, c = Store.cls || {};
    if (me === null || me === undefined || isT(me)) return false;
    const k = (c.kick || {})[me] || 0, inAt = +localStorage.getItem(KEY + ".in") || 0;
    if (k && k > inAt){ ARC.logout(); setTimeout(() => toast("🚪 선생님이 로그아웃했어요. 다시 들어오려면 번호를 눌러요"), 50); return true; }
    return false;
  },

  /* ---------- 🔑 첫 화면(로그인) ---------- */
  renderLogin(){
    const c = Store.cls; if (!c) return;
    $("#lgClass").textContent = c.name || "우리반";
    this.put("lgOnline", this.onlineHTML());
    this.put("lgNums", roster().map(s => { const on = LIVE.online(sidOf(s.no));
      return `<button class="arc-num${s.t ? " tch" : ""}${on ? " on" : ""}" data-no="${s.no}">${on ? `<i class="dot${on.st === "play" ? " play" : ""}"></i>` : ""}${avI(sidOf(s.no))}<b>${s.t ? "선생님" : s.no}</b><small>${s.t ? "같이 해요!" : esc(s.name)}</small></button>`; }).join(""));
    this.renderFame();
    if (!this.fameTimer) this.fameTimer = setInterval(() => {
      if ($("#scrLogin").hidden || ARC.busy || Date.now() - this.fameTouch < 20000) return;
      this.fame = (this.fame + 1) % (this.visGames().length + 1); this.renderFame(true);
    }, 7000);
  },
  renderFame(auto){
    const G = this.visGames(), i = this.fame % (G.length + 1), g = G[i], coin = !g;
    const tabs = G.map((x, k) => `<button data-k="${k}" class="${k === i ? "on" : ""}" title="${x.n}"><span class="f">${x.e}</span></button>`).join("") + `<button data-k="${G.length}" class="${coin ? "on" : ""}" title="코인왕"><span class="f">🪙</span></button>`;
    let rows;
    if (coin) rows = roster().map(s => ({sid: sidOf(s.no), no: s.no, v: walletOf(sidOf(s.no)).total || 0})).filter(x => x.v > 0).sort((a, b) => b.v - a.v).map(x => ({sid: x.sid, no: x.no, txt: `${x.v.toLocaleString()}코인`}));
    else rows = board(g.id).map(x => ({sid: x.sid, no: x.st.no, txt: valTxt(g, x.r)}));
    const pd = k => { const x = rows[k]; return x ? `<div class="pd p${k + 1}">${avI(x.sid)}<span class="nm">${esc(isT(x.no) ? "선생님" : nameOf(x.no))}</span><span class="v">${x.txt}</span><div class="bar">${k + 1}</div></div>` : `<div class="pd p${k + 1} empty"><span class="avf" style="display:grid;place-items:center;font-size:26px;background:#2a2366">❔</span><span class="nm">비어 있어요</span><span class="v">&nbsp;</span><div class="bar">${k + 1}</div></div>`; };
    const html = `<div class="fame${Date.now() - this.fameTouch < 20000 ? " still" : ""}"><h3>🏆 명예의 전당</h3><div class="fm-sub">우리 반 게임별 1·2·3등</div>
      <div class="fm-tabs" id="fmTabs">${tabs}</div>
      <div class="fm-gt"><span class="f">${coin ? "🪙" : g.e}</span>${coin ? "코인왕" : g.n} <small>${coin ? "모은 코인" : g.kind === "duel" ? "이긴 횟수" : "최고 점수"}</small></div>
      ${rows.length ? `<div class="podium">${pd(1)}${pd(0)}${pd(2)}</div><div class="fm-rest">${rows.slice(3, 8).map((x, k) => `<div class="r"><b>${k + 4}</b>${avI(x.sid)}<span>${esc(isT(x.no) ? "선생님" : `${x.no}번 ${nameOf(x.no)}`)}</span><i>${x.txt}</i></div>`).join("")}</div>`
        : `<div class="fm-empty">아직 기록이 없어요.<br>첫 번째 1등의 주인공이 되어 보세요! ✨</div>`}
      <div class="fm-prog"><i${auto ? ' style="animation:none"' : ""}></i></div></div>`;
    if (this.put("lgFame", html)){
      const p = $("#lgFame .fm-prog i"); if (p && auto){ void p.offsetWidth; p.style.animation = ""; }
      $("#fmTabs").onclick = e => { const b = e.target.closest("[data-k]"); if (b){ this.fame = +b.dataset.k; this.fameTouch = Date.now(); this.renderFame(); } };
    }
  },
  onlineHTML(){
    const L = LIVE.onlineList(); if (!LIVE.started || (!LIVE.cloud() && Store.mode !== "local")) return "";
    if (!L.length) return `<span class="arc-pill"><i class="dot" style="background:#868e96;box-shadow:none"></i> 지금 접속한 친구가 없어요</span>`;
    return `<span class="arc-pill"><i class="dot"></i> 지금 <b>${L.length}</b>명 접속 중 <span class="ppl">${L.slice(0, 10).map(s => avI(sidOf(s.no))).join("")}</span>${L.length > 10 ? `+${L.length - 10}` : ""}</span>`;
  },

  /* ---------- 🏠 홈 ---------- */
  bindHome(){
    $("#hmFilter").onclick = e => { const b = e.target.closest("[data-f]"); if (!b) return; this.filter = b.dataset.f; $$("#hmFilter button").forEach(x => x.classList.toggle("on", x === b)); this.renderGames(); };
    $("#hmTabs").onclick = e => { const b = e.target.closest("[data-t]"); if (b) this.setTab(b.dataset.t); };
    $("#hmGames").onclick = e => { const b = e.target.closest("[data-g]"); if (b) ARC.play(b.dataset.g); };
    $("#paneRank").onclick = e => {
      const g = e.target.closest("[data-rg]"), d = e.target.closest("[data-day]"), big = e.target.closest("#rkBig");
      if (g){ this.rk.g = g.dataset.rg; if (!GAME[this.rk.g] || GAME[this.rk.g].kind === "duel") this.rk.day = false; this.renderRank(); }
      if (d){ this.rk.day = d.dataset.day === "1"; this.renderRank(); }
      if (big) ARC.rank(this.rk.g);
    };
    $("#paneRoom").onclick = e => {
      const n = e.target.closest("[data-new]"), j = e.target.closest("[data-join]"), x = e.target.closest("[data-close]");
      if (n) ROOMS.open(n.dataset.new); if (j) ROOMS.join(j.dataset.join); if (x) ROOMS.close();
    };
    $("#chQuick").innerHTML = ["👍","ㅋㅋㅋ","🎉 축하해!","GG!","대결할 사람? ⚔️","화이팅! 💪","잘했어 👏","고마워 😊"].map(t => `<button type="button">${t}</button>`).join("");
    $("#chQuick").onclick = e => { const b = e.target.closest("button"); if (b) this.send(b.textContent); };
    $("#chForm").onsubmit = e => { e.preventDefault(); const i = $("#chText"); this.send(i.value, () => { i.value = ""; }); };
    $("#chList").onclick = e => { const d = e.target.closest("[data-del]"), b = e.target.closest("[data-ban]");
      if (d && isT(ARC.me) && confirm("이 채팅을 지울까요?")) LIVE.unsay(d.dataset.del);
      if (b && isT(ARC.me)) ADMIN.ban(+b.dataset.ban, true); };
    $("#chEmoBtn").onclick = () => { const p = $("#chEmo"); p.hidden = !p.hidden; if (!p.hidden) this.emo(); };
    $("#chRuleOk").onclick = () => { try { localStorage.setItem(this.ruleKey(), 1); } catch(e) {} $("#chRule").hidden = true; this.chatSig = ""; this.renderSide(true); };
    this.setTab(this.tab);
  },
  ruleKey(){ return `${KEY}.chatOk.${(Store.cls || {}).cid}.${ARC.me}`; },
  ruleOk(){ try { return isT(ARC.me) || !!localStorage.getItem(this.ruleKey()); } catch(e){ return true; } },
  emo(){
    const T = this.emoTab ?? 0, st = T === "st";
    const list = st ? CHAT_ST : emoList(CHAT_EMO[T][2]);
    $("#chEmo").innerHTML = `<div class="ce-tabs">${CHAT_EMO.map((c, i) => `<button type="button" data-tab="${i}" class="${T === i ? "on" : ""}" title="${c[1]}">${c[0]}</button>`).join("")}<button type="button" data-tab="st" class="big${st ? " on" : ""}">🎁 큰 이모티콘</button></div>${st ? `<p class="ce-hint">누르면 바로 크게 보내져요!</p>` : ""}<div class="ce-grid${st ? " st" : ""}">${list.map(e => `<button type="button" data-e="${e}">${e}</button>`).join("")}</div>`;
    $("#chEmo").onclick = async e => {
      const t = e.target.closest("[data-tab]"); if (t){ this.emoTab = t.dataset.tab === "st" ? "st" : +t.dataset.tab; this.emo(); return; }
      const b = e.target.closest("[data-e]"); if (!b) return;
      if (this.emoTab === "st"){ const msg = await CHAT.send(b.dataset.e, ARC.me, "st"); $("#chMsg").textContent = msg; if (!msg){ $("#chEmo").hidden = true; this.seen = Date.now(); } return; }
      const i = $("#chText"), v = b.dataset.e; if (i.disabled || i.value.length + v.length > 50) return;
      const p = i.selectionStart ?? i.value.length; i.value = i.value.slice(0, p) + v + i.value.slice(i.selectionEnd ?? p); i.selectionStart = i.selectionEnd = p + v.length;
    };
  },
  async send(t, ok){
    const msg = await CHAT.send(t); $("#chMsg").textContent = msg;
    if (!msg){ if (ok) ok(); this.seen = Date.now(); }
    else if (/고운 말/.test(msg)){ $("#chText").classList.remove("arc-shk"); }
  },
  setTab(t){
    this.tab = t; $$("#hmTabs button").forEach(b => b.classList.toggle("on", b.dataset.t === t));
    $("#paneRank").hidden = t !== "rank"; $("#paneRoom").hidden = t !== "room"; $("#paneChat").hidden = t !== "chat";
    if (t === "chat"){ this.seen = Date.now(); this.chatSig = ""; }
    this.renderSide(true);
    if (t === "chat"){ const l = $("#chList"); l.scrollTop = l.scrollHeight; }
  },
  renderHome(){
    if (!Store.cls || ARC.me === null) return;
    const me = ARC.me, sid = sidOf(me), w = walletOf(sid), c = Store.cls;
    $("#hmClass").textContent = c.name || "우리반";
    $("#hmAdmin").hidden = !isT(me);
    if (this.put("hmMe", `<span class="avb">${avHTMLof(sid)}</span><div><b>${esc(who(me))}</b>${titleHTML(sid)}<button class="arc-coin" id="hmCoin" title="상점 열기">🪙 <b>${(w.coins || 0).toLocaleString()}</b><small>${heatTxt(sid)}</small></button></div>`))
      $("#hmCoin").onclick = () => SHOP.open(sid);
    this.put("hmOnline", this.onlineHTML());
    const nt = (c.notice || {}).t; $("#hmNotice").hidden = !nt; this.put("hmNotice", nt ? `<b>📢 선생님 알림</b><span>${esc(nt)}</span>` : "");
    const cl = c.closed && !isT(me); $("#hmClosed").hidden = !cl;
    this.put("hmClosed", cl ? `<div class="bx"><span class="f">🔒</span>지금은 오락실 쉬는 시간이에요<small>${esc(c.closedMsg || "선생님이 문을 열면 다시 놀 수 있어요")}</small></div>` : "");
    this.renderGames(); this.renderSide();
    setTimeout(() => GIFTBOX.check(), 300);
  },
  renderGames(){
    const me = ARC.me, sid = sidOf(me), L = this.visGames().filter(g => this.filter === "all" || g.kind === this.filter);
    this.put("hmGames", L.map(g => {
      const B = board(g.id), mine = B.find(x => x.sid === sid), top = B[0], off = !gameOn(g.id);
      const myTxt = mine ? `내 기록 <b>${valTxt(g, mine.r)}</b> · <b>${mine.rank}</b>등` : g.kind === "duel" ? "아직 대결 기록이 없어요" : "아직 기록이 없어요";
      const topTxt = top ? `${avI(top.sid)} <span>${esc(isT(top.st.no) ? "선생님" : nameOf(top.st.no))}</span> <b>${valTxt(g, top.r)}</b>` : `<i>1등 자리가 비어 있어요!</i>`;
      return `<button class="arc-game ${g.kind} g-${g.id}${off ? " off" : ""}" data-g="${g.id}">
        <span class="ag-ic f">${g.e}</span><span class="ag-tag">${g.tag ? g.tag : g.multi ? "🎉 최대 6명 · 승리전" : g.kind === "duel" ? "⚔️ 둘이서 · 승리전" : "🏆 혼자 · 점수전"}</span>
        <b class="ag-nm">${g.n}</b><small class="ag-ds">${g.d}</small><span class="ag-play">▶ PLAY</span>
        <span class="ag-top">👑 ${topTxt}</span><span class="ag-my">${myTxt}</span>${off ? `<span class="ag-off">⏸️ 꺼 둔 게임 (선생님만 보여요)</span>` : ""}</button>`;
    }).join(""));
  },
  renderSide(force){
    if (force){ delete this.sig.paneRank; delete this.sig.paneRoom; }
    const unread = LIVE.chat.filter(m => (m.at || 0) > this.seen && m.no !== ARC.me && !m.sys).length;
    if (this.tab === "chat"){ this.seen = Math.max(this.seen, ...LIVE.chat.map(m => m.at || 0), 0); }
    $("#bChat").textContent = this.tab === "chat" || !unread ? "" : unread > 9 ? "9+" : unread;
    const nr = ROOMS.ok() ? ROOMS.list().filter(r => r.host !== ARC.me).length : 0; $("#bRoom").textContent = nr || "";
    if (this.tab === "rank") this.renderRank(); else if (this.tab === "room") this.renderRoom(); else this.renderChat();
  },

  /* ---- 🏆 랭킹 칸 ---- */
  renderRank(){
    const G = this.visGames(); if (!GAME[this.rk.g] && this.rk.g !== "coin") this.rk.g = G[0] ? G[0].id : "fl";
    const gid = this.rk.g, me = sidOf(ARC.me), coin = gid === "coin", g = GAME[gid];
    let rows;
    if (coin) rows = roster().map(s => ({sid: sidOf(s.no), no: s.no, w: walletOf(sidOf(s.no))})).filter(x => x.w.total > 0).sort((a, b) => b.w.total - a.w.total).map((x, i) => ({sid: x.sid, no: x.no, rank: i + 1, txt: `${x.w.total.toLocaleString()}코인`, sub: ""}));
    else if (this.rk.day && g.kind !== "duel"){
      const td = today(), R = Store.recs[gid] || {};
      rows = roster().map(s => ({sid: sidOf(s.no), no: s.no, r: R[sidOf(s.no)]})).filter(x => x.r && x.r.day === td && (x.r.dayBest || 0) > 0).sort((a, b) => b.r.dayBest - a.r.dayBest || (a.r.dayAt || 0) - (b.r.dayAt || 0));
      let rk = 0, pv = null; rows = rows.map((x, i) => { if (x.r.dayBest !== pv){ rk = i + 1; pv = x.r.dayBest; } return {sid: x.sid, no: x.no, rank: rk, txt: `${x.r.dayBest}점`, sub: `${x.r.dayPlays || 0}판`}; });
    } else rows = board(gid).map(x => ({sid: x.sid, no: x.st.no, rank: x.rank, txt: valTxt(g, x.r), sub: g.kind === "duel" ? `${Math.round((x.r.w || 0)/Math.max(1, (x.r.w || 0) + (x.r.l || 0))*100)}%` : `${x.r.plays || 0}판`}));
    const row = x => `<div class="arc-rrow${x.sid === me ? " me" : ""}${x.rank <= 3 ? " t" + x.rank : ""}"><span class="rk">${x.rank <= 3 ? ["🥇","🥈","🥉"][x.rank - 1] : x.rank}</span>${avI(x.sid)}<span class="nm">${esc(isT(x.no) ? "🧑‍🏫 선생님" : `${x.no}번 ${nameOf(x.no)}`)}</span><span class="v">${x.txt} <small>${x.sub}</small></span></div>`;
    const top = rows.slice(0, 10), mine = rows.find(x => x.sid === me && x.rank > 10);
    this.put("paneRank", `<div class="rk-games">${G.map(x => `<button data-rg="${x.id}" class="${x.id === gid ? "on" : ""}" title="${x.n}"><span class="f">${x.e}</span></button>`).join("")}<button data-rg="coin" class="${coin ? "on" : ""}" title="코인왕"><span class="f">🪙</span></button></div>
      <div class="rk-sub"><span>${coin ? "🪙 코인왕" : `${g.e} ${g.n}`}</span>${!coin && g.kind !== "duel" ? `<div class="arc-seg"><button data-day="0" class="${this.rk.day ? "" : "on"}">👑 전체</button><button data-day="1" class="${this.rk.day ? "on" : ""}">📅 오늘</button></div>` : `<small style="font:13px 'Gowun Dodum',sans-serif;color:#a79fd0">${coin ? "모은 코인 순서" : "친구끼리 이긴 횟수"}</small>`}</div>
      <div class="rk-list">${top.length ? top.map(row).join("") : `<p class="arc-empty">${this.rk.day ? "오늘은 아직 아무도 안 했어요" : "아직 기록이 없어요.<br>첫 1등이 되어 보세요!"}</p>`}${mine ? `<div class="rk-me">${row(mine)}</div>` : ""}</div>
      ${coin ? "" : `<button class="arc-btn rk-more" id="rkBig">🔍 랭킹 크게 보기</button>`}`);
  },

  /* ---- ⚔️ 대결방 칸 ---- */
  renderRoom(){
    if (!NET.ok()){ this.put("paneRoom", `<div class="ch-off">⚔️ 대결방은 선생님이 <b>☁️ Firebase</b>로 연결한 반에서 쓸 수 있어요.<br><br>지금은 게임 카드를 눌러 <b>🧒 이 기기에서 둘이 대결</b>을 해요!</div>`); return; }
    if ((Store.cls || {}).roomsOff){ this.put("paneRoom", `<div class="ch-off">⏸️ 선생님이 대결방을 잠깐 닫았어요.</div>`); return; }
    const duels = this.visGames().filter(g => g.kind === "duel" && !g.multi && gameOn(g.id)), my = ROOMS.myRoom(), L = ROOMS.list().filter(r => r.host !== ARC.me);
    const card = (r, mine) => { const g = GAME[r.g]; return `<div class="rm g-${r.g}${mine ? " mine" : ""}">${avI(sidOf(r.host))}<div class="i"><b>${g.e} ${g.n}</b><small>${mine ? "내가 만든 방" : `방장 ${esc(who(r.host))}`} · ${agoTxt(r.at)}</small></div>${mine ? `<span class="wt">⏳ 기다리는 중</span><button class="arc-btn sm" data-close>✕ 닫기</button>` : `<button class="arc-btn p" data-join="${r.id}">⚔️ 들어가기</button>`}</div>`; };
    const ppl = LIVE.onlineList().filter(s => s.no !== ARC.me);
    this.put("paneRoom", `${my ? card(my, true) : ROOMS.mine === "…" ? `<div class="rm-empty">방 만드는 중…</div>` : `<div class="rm-new"><div class="t">🏠 방 만들기 <small style="font:13px 'Gowun Dodum',sans-serif;color:#b9b0dd">친구가 들어오면 바로 시작!</small></div><div class="rm-gs">${duels.map(g => `<button class="g-${g.id}" data-new="${g.id}"><span class="f">${g.e}</span>${g.n}</button>`).join("") || "<small>지금 켜진 대결 게임이 없어요</small>"}</div></div>`}
      <div class="rm-h">🚪 들어갈 수 있는 방 ${L.length ? `(${L.length})` : ""}</div>
      ${L.length ? L.map(r => card(r)).join("") : `<div class="rm-empty">아직 열린 방이 없어요.<br>먼저 방을 만들어 친구를 불러 봐요! 📣</div>`}
      <div class="rm-h" style="margin-top:12px">🟢 지금 접속 중 (${ppl.length})</div>
      <div class="rm-ppl">${ppl.map(s => { const o = LIVE.online(sidOf(s.no)), g = o.st === "play" && GAME[o.g]; return `<div class="r">${avI(sidOf(s.no))}<span>${esc(isT(s.no) ? "🧑‍🏫 선생님" : `${s.no}번 ${s.name}`)}</span><small>${g ? `${g.e} ${g.n} 하는 중` : "🏠 로비"}</small></div>`; }).join("") || `<div class="rm-empty">다른 친구가 아직 안 들어왔어요</div>`}</div>`);
  },

  /* ---- 💬 채팅 칸 ---- */
  renderChat(){
    const me = ARC.me, why = CHAT.why(me), live = LIVE.cloud() || Store.mode === "local", out = CHAT.banned(me) && !isT(me);
    const inp = $("#chText"), btn = $("#chSend");
    inp.disabled = btn.disabled = $("#chEmoBtn").disabled = !!why || !live; inp.placeholder = why || "친구들에게 한마디! (고운 말 😊)";
    $("#chRule").hidden = out || this.ruleOk(); $("#chQuick").hidden = out; $("#chForm").hidden = out; if (out) $("#chEmo").hidden = true;
    if (why && !$("#chMsg").textContent) $("#chMsg").textContent = "";
    const L = LIVE.chat, ban = (Store.cls || {}).chatBan || {}, sg = L.map(m => m.id).join(",") + "|" + isT(me) + "|" + out + "|" + JSON.stringify(ban) + "|" + (L.length ? L[L.length - 1].at : 0) + "|" + Math.floor(Date.now()/60000);
    if (sg === this.chatSig) return; this.chatSig = sg;
    const box = $("#chList"), near = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    if (out){ box.innerHTML = `<div class="ch-banned"><div class="e">🚫</div><b>채팅방에서 추방됐어요</b><p>욕이나 친구를 놀리는 말(비방)을 해서<br>선생님이 채팅방에서 내보냈어요.<br><small>선생님이 풀어 주기 전까지는 채팅을 볼 수도, 쓸 수도 없어요.</small></p></div>`; return; }
    box.innerHTML = L.length ? L.map(m => m.sys ? `<div class="cm sys"><p>${esc(m.t)}</p></div>`
      : `<div class="cm${m.no === me ? " me" : ""}${isT(m.no) ? " tch" : ""}">${avI(sidOf(m.no))}<div class="bx"><div class="hd">${esc(isT(m.no) ? "🧑‍🏫 선생님" : `${m.no}번 ${nameOf(m.no)}`)}${ban[m.no] ? ` <i class="out">🚫 추방됨</i>` : ""} <small>${hhmm(m.at)}</small>${isT(me) ? `<button class="del" data-del="${m.id}" title="지우기">🗑️</button>${isT(m.no) || ban[m.no] ? "" : `<button class="del" data-ban="${m.no}" title="채팅방에서 영원히 추방">🚫</button>`}` : ""}</div><p class="${m.k === "st" ? "st" : emoOnly(m.t) ? "big" : ""}">${esc(m.t)}</p></div></div>`).join("")
      : `<div class="ch-off">💬 아직 채팅이 없어요.<br>첫 인사를 해 볼까요? 👋<br><small>고운 말만 써요 · 선생님도 함께 봐요</small></div>`;
    if (near || !this._scrolled){ box.scrollTop = box.scrollHeight; this._scrolled = true; }
  },

  /* 실시간 소식이 오면: 보이는 칸만 */
  onLive(k){
    ROOMS.check();
    if (!Store.cls || ARC.busy) return;
    if (!$("#scrLogin").hidden && (k.on || k.tick)) this.renderLogin();
    if (!$("#scrHome").hidden && ARC.me !== null){
      if (k.on || k.tick){ this.put("hmOnline", this.onlineHTML()); }
      this.renderSide();
    }
    if (!$("#mdTeach").hidden) ADMIN.live(k);
  }
};
LIVE.subs.push(k => LOBBY.onLive(k));

/* 🏆 점수 게임에서 반 1등이 바뀌면 채팅에 알려요 */
(function(){
  const sc = ARC.score;
  ARC.score = function(gid, sid, rec){
    const g = GAME[gid], top = board(gid)[0], prevTop = top ? (top.r.best || 0) : 0, was = top && top.sid;
    const got = sc.call(this, gid, sid, rec);
    try { if (g && sid === sidOf(this.me) && (rec.last || 0) > prevTop && (rec.last || 0) > 0 && was !== sid) CHAT.sys(`🏆 ${iga(who(this.me))} ${g.e} ${g.n} 새 1등이 됐어요! (${rec.last}점)`); } catch(e) {}
    return got;
  };
})();

/* =====================================================================
   🛠️ 관리자: 지금 현황 · 채팅 관리 · 대결방 · 게임 끄기/문 닫기
   ===================================================================== */
const ADMIN = {
  tabs: {live: "📊 지금 현황", chat: "💬 채팅 관리", room: "⚔️ 대결방", game: "🎮 게임 · 문 닫기"},
  has(t){ return !!this.tabs[t]; },
  sw(id, on, label, sub){ return `<label class="ad-sw"><input type="checkbox" id="${id}" ${on ? "checked" : ""}><span class="k"></span><span>${label}${sub ? `<small>${sub}</small>` : ""}</span></label>`; },
  async patch(o, msg){ try { await Store.patch(o); if (msg) toast(msg); } catch(e){ console.error(e); alert("저장하지 못했어요: " + (e.message || e)); } },
  kids(){ return (Store.cls.roster || []).slice(); },
  render(tab, body){
    this.tab = tab; const c = Store.cls;
    body.innerHTML = `<h3>${this.tabs[tab]}</h3>` + (tab === "live" ? `<div id="adLive"></div>`
      : tab === "chat" ? `
        <div class="ad-sec"><h4>⚙️ 채팅 규칙</h4>
          ${this.sw("acOn", !CHAT.rules().off, "💬 채팅 켜기", "끄면 아이들은 채팅을 볼 수만 있고 보낼 수 없어요")}
          <div class="arc-row"><span style="align-self:center">⏳ 천천히 보내기</span><div class="arc-seg" id="acSlow" style="margin:0">${[1, 3, 5, 10, 30].map(v => `<button data-v="${v}" class="${+CHAT.rules().slow === v ? "on" : ""}">${v}초</button>`).join("")}</div></div>
          <p class="arc-small">나쁜 말(욕설 · 비하하는 말)과 주소(링크)는 자동으로 막아요. 더 막을 말이 있으면 아래에 쉼표로 적어 주세요.</p>
          <div class="ad-in"><input id="acBan" value="${esc(((c.ban) || []).join(", "))}" placeholder="예) 바보, 멍청이"><button class="arc-btn" id="acBanSave">💾 막을 말 저장</button></div></div>
        <div class="ad-sec"><h4>🚫 영원히 추방 · ⚠️ 경고 기록</h4>
          <p class="arc-small">아이들 채팅 칸 맨 위에 <b>“욕·비방을 하면 영원히 추방될 수 있어요”</b>가 늘 보이고, 처음 들어올 때 <b>✋ 약속해요</b>를 눌러야 써요.
            욕·비방은 보내지지 않고 여기에 <b>경고 횟수와 그 말</b>이 남아요. <b>🚫 추방</b>하면 선생님이 <b>풀어 줄 때까지</b> 채팅을 볼 수도 쓸 수도 없어요 (🔇 10분 쉬기보다 센 벌).</p>
          <div class="ad-chat" id="adBan"></div></div>
        <div class="ad-sec"><h4>📢 선생님 알림 (홈 맨 위에 계속 보여요)</h4>
          <div class="ad-in"><input id="acNotice" maxlength="80" value="${esc((c.notice || {}).t || "")}" placeholder="예) 5분 뒤에 수업 시작해요! 마무리해요 🙂"><button class="arc-btn p" id="acNoticeGo">📢 올리기</button><button class="arc-btn" id="acNoticeOff">내리기</button></div></div>
        <div class="ad-sec"><h4>🧑‍🏫 선생님으로 채팅 보내기</h4>
          <form class="ad-in" id="acSayF"><input id="acSay" maxlength="50" placeholder="아이들 채팅창에 선생님 말이 노랗게 보여요"><button class="arc-btn p">보내기</button></form></div>
        <div class="ad-sec"><h4>📜 채팅 기록 (최근 50개) <small style="font:13px 'Gowun Dodum',sans-serif;color:#b9b0dd">🗑️ 지우기 · 🔇 그 친구 10분 채팅 쉬기</small></h4>
          <div class="ad-chat" id="adChat"></div>
          <div class="arc-row"><button class="arc-btn" id="acClear">🧹 채팅 모두 지우기</button></div></div>`
      : tab === "room" ? `
        <div class="ad-sec">${this.sw("arOn", !c.roomsOff, "⚔️ 대결방 열기", "닫으면 새 방을 만들거나 들어갈 수 없어요 (이 기기에서 둘이 대결은 그대로)")}</div>
        <div class="ad-sec"><h4>🚪 지금 열린 방</h4><div id="adRooms"></div><div class="arc-row"><button class="arc-btn" id="arAll">🧹 모든 방 닫기</button></div></div>`
      : `
        <div class="ad-sec"><h4>🔒 오락실 문</h4>
          ${this.sw("agOpen", !c.closed, "🔓 오락실 열기", "닫으면 아이들은 로그인은 되지만 게임·채팅을 할 수 없어요 (수업 시간·청소 시간에)")}
          <div class="ad-in" style="margin-top:10px"><input id="agMsg" maxlength="60" value="${esc(c.closedMsg || "")}" placeholder="닫혔을 때 보일 말 (예: 쉬는 시간에 다시 열어요!)"><button class="arc-btn" id="agMsgSave">💾 저장</button></div></div>
        <div class="ad-sec"><h4>🎮 게임 켜기 · 끄기 <small style="font:13px 'Gowun Dodum',sans-serif;color:#b9b0dd">끈 게임은 아이들 화면에서 사라져요 (랭킹·코인은 그대로)</small></h4>
          <div class="ad-games">${GAMES.map(g => `<label><input type="checkbox" data-g="${g.id}" ${gameOn(g.id) ? "checked" : ""}><span class="f">${g.e}</span>${g.n}</label>`).join("")}</div></div>`);
    if (tab === "chat"){
      $("#acOn").onchange = e => this.patch({chat: {off: !e.target.checked}}, e.target.checked ? "💬 채팅을 켰어요" : "🤫 채팅을 껐어요");
      $("#acSlow").onclick = e => { const b = e.target.closest("[data-v]"); if (!b) return; $$("#acSlow button").forEach(x => x.classList.toggle("on", x === b)); this.patch({chat: {slow: +b.dataset.v}}, `⏳ ${b.dataset.v}초에 한 번씩 보낼 수 있어요`); };
      $("#acBanSave").onclick = () => this.patch({ban: $("#acBan").value.split(/[,\n]/).map(x => x.trim()).filter(Boolean).slice(0, 100)}, "💾 막을 말을 저장했어요");
      $("#acNoticeGo").onclick = () => { const t = $("#acNotice").value.trim(); if (!t) return; this.patch({notice: {t, at: Date.now()}}, "📢 알림을 올렸어요"); };
      $("#acNoticeOff").onclick = () => { $("#acNotice").value = ""; this.patch({notice: {t: "", at: Date.now()}}, "알림을 내렸어요"); };
      $("#acSayF").onsubmit = async e => { e.preventDefault(); const i = $("#acSay"), m = await CHAT.send(i.value, TEACHER); if (m) toast(m); else i.value = ""; };
      $("#acClear").onclick = async () => { if (!confirm("채팅 기록을 모두 지울까요? 되돌릴 수 없어요.")) return; try { await LIVE.clearChat(); toast("🧹 채팅을 모두 지웠어요"); } catch(e){ alert("지우지 못했어요: " + (e.message || e)); } };
      $("#adChat").onclick = e => {
        const d = e.target.closest("[data-del]"), m = e.target.closest("[data-mute]"), b = e.target.closest("[data-ban]");
        if (d) LIVE.unsay(d.dataset.del);
        if (m) this.mute(+m.dataset.mute, 10);
        if (b) this.ban(+b.dataset.ban, true);
      };
      $("#adBan").onclick = e => {
        const b = e.target.closest("[data-ban]"), u = e.target.closest("[data-unban]"), w = e.target.closest("[data-cw]");
        if (b) this.ban(+b.dataset.ban, true);
        if (u) this.ban(+u.dataset.unban, false);
        if (w) Store.kidTx(sidOf(+w.dataset.cw), x => Object.assign(x, {cw: 0, cwLast: "", cwAt: 0})).then(() => { this.sig = ""; this.live(); }).catch(er => toast(er.message));
      };
    } else if (tab === "room"){
      $("#arOn").onchange = e => this.patch({roomsOff: !e.target.checked}, e.target.checked ? "⚔️ 대결방을 열었어요" : "⏸️ 대결방을 닫았어요");
      $("#arAll").onclick = async () => { for (const r of LIVE.rooms.slice()) await LIVE.delRoom(r.id); toast("🧹 모든 방을 닫았어요"); };
      $("#adRooms").onclick = e => { const x = e.target.closest("[data-rm]"); if (x) LIVE.delRoom(x.dataset.rm); };
    } else if (tab === "game"){
      $("#agOpen").onchange = e => this.patch({closed: !e.target.checked}, e.target.checked ? "🔓 오락실 문을 열었어요" : "🔒 오락실 문을 닫았어요");
      $("#agMsgSave").onclick = () => this.patch({closedMsg: $("#agMsg").value.trim()}, "💾 저장했어요");
      body.querySelector(".ad-games").onchange = e => { const i = e.target.closest("[data-g]"); if (i) this.patch({off: {[i.dataset.g]: !i.checked}}, `${GAME[i.dataset.g].e} ${GAME[i.dataset.g].n} ${i.checked ? "켰어요" : "껐어요"}`); };
    } else if (tab === "live"){
      $("#adLive").onclick = e => {
        const m = e.target.closest("[data-mute]"), u = e.target.closest("[data-unmute]"), k = e.target.closest("[data-kick]");
        if (m) this.mute(+m.dataset.mute, +m.dataset.min || 10);
        if (u) this.patch({mute: {[u.dataset.unmute]: 0}}, "🔊 채팅 쉬기를 풀었어요");
        if (k && confirm(`${who(+k.dataset.kick)}을(를) 로그아웃시킬까요? (비밀번호로 다시 들어올 수 있어요)`)) this.patch({kick: {[k.dataset.kick]: Date.now()}}, `🚪 ${who(+k.dataset.kick)} 로그아웃`);
      };
    }
    this.sig = ""; this.live({chat: 1, on: 1, rooms: 1});
  },
  ban(no, on){
    if (on && !confirm(`${who(no)}을(를) 채팅방에서 영원히 추방할까요?\n선생님이 풀어 줄 때까지 채팅을 볼 수도, 쓸 수도 없어요.`)) return;
    this.patch({chatBan: {[no]: on ? Date.now() : 0}}, on ? `🚫 ${who(no)} 채팅방에서 추방했어요` : `✅ ${who(no)} 다시 채팅할 수 있어요`);
  },
  mute(no, min){ this.patch({mute: {[no]: Date.now() + min*60000}}, `🔇 ${who(no)} ${min}분 채팅 쉬기`); },
  /* 데이터가 바뀌면 목록만 다시 (입력 칸은 그대로) */
  live(){
    if ($("#mdTeach").hidden) return;
    const t = this.tab, td = today();
    if (t === "live" && $("#adLive")){
      const K = this.kids(), on = K.filter(s => LIVE.online(sidOf(s.no))), play = on.filter(s => LIVE.online(sidOf(s.no)).st === "play");
      let plays = 0; for (const g in Store.recs){ const R = Store.recs[g]; for (const s in R){ const r = R[s]; if (r && r.day === td) plays += r.dayPlays || 0; } }
      let coins = 0; K.forEach(s => { const w = walletOf(sidOf(s.no)); if (w.day === td) coins += w.dayCoins || 0; });
      const kidRow = s => { const sid = sidOf(s.no), o = LIVE.online(sid), last = LIVE.on[sid], w = walletOf(sid), mu = CHAT.muted(s.no), g = o && o.st === "play" && GAME[o.g];
        return `<div class="ad-kid${o ? (o.st === "play" ? " play" : " on") : ""}">${avI(sid)}<div class="i"><b>${o ? `<i class="dot${o.st === "play" ? " play" : ""}"></i> ` : ""}${s.no}번 ${esc(s.name)}</b><small>${o ? (g ? `${g.e} ${g.n} 하는 중` : "🏠 로비에 있어요") : last && last.at ? `마지막 ${agoTxt(last.at)}` : "아직 안 들어왔어요"} · 오늘 🪙${w.day === td ? w.dayCoins || 0 : 0}</small>${mu ? `<small class="ad-mute"> 🔇 ${hhmm(mu)}까지 채팅 쉬기</small>` : ""}</div>
          <div class="bb">${mu ? `<button class="arc-btn sm" data-unmute="${s.no}">🔊 풀기</button>` : `<button class="arc-btn sm" data-mute="${s.no}" data-min="10" title="10분 동안 채팅 못 해요">🔇 10분</button>`}<button class="arc-btn sm" data-kick="${s.no}" title="로그아웃시키기">🚪</button></div></div>`; };
      const sorted = K.sort((a, b) => (!!LIVE.online(sidOf(b.no)) - !!LIVE.online(sidOf(a.no))) || a.no - b.no);
      const html = `<div class="ad-cards"><div><b>${on.length}<small> / ${K.length}명</small></b><small>🟢 지금 접속 중</small></div><div><b>${play.length}</b><small>🎮 게임하는 중</small></div><div><b>${plays}</b><small>📅 오늘 게임 판 수 (점수전)</small></div><div><b>${coins.toLocaleString()}</b><small>🪙 오늘 모은 코인</small></div><div><b>${LIVE.chat.filter(m => !m.sys && new Date(m.at).toDateString() === new Date().toDateString()).length}</b><small>💬 오늘 채팅</small></div></div>
        ${Store.cls.closed ? `<p class="arc-notice" style="margin:0 0 12px">🔒 지금 오락실 문이 닫혀 있어요 → 🎮 게임 · 문 닫기 탭에서 열 수 있어요</p>` : ""}
        <div class="ad-kids">${sorted.map(kidRow).join("")}</div>`;
      if (html !== this.sig){ this.sig = html; $("#adLive").innerHTML = html; }
    }
    if (t === "chat" && $("#adChat")){
      const L = LIVE.chat.slice().reverse();
      const html = L.length ? L.map(m => `<div class="r">${m.sys ? `<span class="f">🏆</span>` : avI(sidOf(m.no))}<b>${m.sys ? "알림" : esc(isT(m.no) ? "선생님" : `${m.no}번 ${nameOf(m.no)}`)}</b><span class="t">${esc(m.t)}</span><small>${hhmm(m.at)}</small><button class="arc-btn sm" data-del="${m.id}" title="지우기">🗑️</button>${m.sys || isT(m.no) ? "" : `<button class="arc-btn sm" data-mute="${m.no}" title="10분 채팅 쉬기">🔇</button>${CHAT.banned(m.no) ? "" : `<button class="arc-btn sm" data-ban="${m.no}" title="영원히 추방">🚫</button>`}`}</div>`).join("") : `<p class="arc-empty">채팅 기록이 없어요</p>`;
      const ban = Store.cls.chatBan || {}, K = this.kids().filter(s => ban[s.no] || (walletOf(sidOf(s.no)).cw || 0) > 0).sort((a, b) => (!!ban[b.no] - !!ban[a.no]) || ((walletOf(sidOf(b.no)).cw || 0) - (walletOf(sidOf(a.no)).cw || 0)));
      const bh = K.length ? K.map(s => { const w = walletOf(sidOf(s.no)), cw = w.cw || 0;
        return `<div class="r${ban[s.no] ? " out" : ""}">${avI(sidOf(s.no))}<b>${s.no}번 ${esc(s.name)}</b><span class="t">${ban[s.no] ? "🚫 추방됨 · " : ""}${cw ? `⚠️ 경고 ${cw}번 · 마지막 말 “${esc(w.cwLast || "")}”` : ""}</span>${cw ? `<button class="arc-btn sm" data-cw="${s.no}">경고 지우기</button>` : ""}${ban[s.no] ? `<button class="arc-btn sm" data-unban="${s.no}">✅ 풀어 주기</button>` : `<button class="arc-btn sm" data-ban="${s.no}">🚫 추방</button>`}</div>`; }).join("") : `<p class="arc-empty">추방되거나 경고받은 친구가 없어요 👍</p>`;
      if (html + bh !== this.sig){ this.sig = html + bh; $("#adChat").innerHTML = html; $("#adBan").innerHTML = bh; }
    }
    if (t === "room" && $("#adRooms")){
      const L = LIVE.rooms.slice().sort((a, b) => (a.at || 0) - (b.at || 0));
      const html = L.length ? L.map(r => { const g = GAME[r.g] || {e: "❔", n: r.g}; return `<div class="ad-kid">${avI(sidOf(r.host))}<div class="i"><b>${g.e} ${g.n}</b><small>방장 ${esc(who(r.host))} · ${agoTxt(r.at)} · ${r.st === "open" ? "기다리는 중" : `${esc(who(r.guest))} 들어옴`}</small></div><div class="bb"><button class="arc-btn sm" data-rm="${r.id}">✕ 닫기</button></div></div>`; }).join("") : `<p class="arc-empty">열린 방이 없어요</p>`;
      if (html !== this.sig){ this.sig = html; $("#adRooms").innerHTML = html; }
    }
    $("#tbLive").textContent = LIVE.onlineList().filter(s => !isT(s.no)).length || "";
  }
};
