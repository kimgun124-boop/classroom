/* =====================================================================
   👥 친구 프로필 · 💬 대화방 · 🎮 같이 게임하기 (2026.11.14)
   - 친구 얼굴을 누르면 프로필: 아바타 · 칭호 · 한마디 · 접속 상태 · 게임 기록 · 1:1 대화 · 대결 신청 · 내 방에 초대
   - 💬 채팅 칸 위 방 막대: [🌈 우리반 전체] [내 방들…] [➕ 방 만들기]
     아이들이 자유롭게 방을 만들어요(공개방 = 누구나 들어와요 / 비밀방 = 초대한 친구만)
   - 방에서 🎮 같이 게임하기: 대결 게임은 대결방을 열고 초대장을 올려요(누르면 바로 들어가요),
     여럿이 하는 게임은 그 게임 온라인 방으로, 점수 게임은 방 친구들끼리 점수 대결
   - 🛡️ 반 전체 채팅과 똑같은 약속: 나쁜 말·주소 막기, 천천히 보내기, 🔇 쉬기, 🚫 추방된 친구는 대화방도 못 써요.
     선생님은 모든 방(비밀방도)을 보고 말·방을 지울 수 있어요. 아이들에게도 그렇게 알려요.
   ☁️ Firebase 반: arcade/{반}/crooms/{방}  ·  arcade/{반}/crooms/{방}/m/{말}
   💻 이 기기: localStorage
   ===================================================================== */
const CR_EMO = ["💬", "🎮", "⚽", "🎵", "🐶", "🐱", "🍕", "🌈", "⭐", "🔥", "🦄", "🚀", "🎨", "📚", "🌸", "👑"];
const CR_MAXOWN = 3;
const crMulti = g => !!(g.multi || g.tag || (typeof PARTY !== "undefined" && PARTY.CFG && PARTY.CFG[g.id]));
const noOfSid = sid => { const m = /^n(-?\d+)$/.exec(sid || ""); return m ? +m[1] : null; };

const CROOM = {
  rooms: [], msgs: [], cur: "all", unR: null, unM: null, mRid: null, started: false, loaded: false,
  cloud(){ return LIVE.cloud(); },
  live(){ return this.cloud() || Store.mode === "local"; },
  off(){ return !!(Store.cls || {}).croomsOff; },
  col(...p){ return Store.fs.collection(Store.db, "arcade", Store.cid, "crooms", ...p); },
  ref(...p){ return Store.fs.doc(Store.db, "arcade", Store.cid, "crooms", ...p); },
  lk(n){ return `${KEY}.cr.${Store.cls.cid}.${n}`; },
  lget(n, d){ try { return JSON.parse(localStorage.getItem(this.lk(n))) || d; } catch(e) { return d; } },
  lset(n, v){ try { localStorage.setItem(this.lk(n), JSON.stringify(v)); } catch(e) {} },
  seenKey(){ return `${KEY}.crSeen.${(Store.cls || {}).cid}.${ARC.me}`; },
  seenAll(){ try { return JSON.parse(localStorage.getItem(this.seenKey())) || {}; } catch(e) { return {}; } },
  markSeen(rid, at){ const s = this.seenAll(); if ((s[rid] || 0) >= at) return; s[rid] = at; try { localStorage.setItem(this.seenKey(), JSON.stringify(s)); } catch(e) {} },

  start(){
    if (this.started || !Store.cls || !this.live()) return; this.started = true;
    if (this.cloud()){
      this.unR = Store.fs.onSnapshot(this.col(), qs => { const l = []; qs.forEach(d => l.push(Object.assign({id: d.id}, d.data()))); this.rooms = l; this.loaded = true; this.changed(); }, e => console.warn("[대화방]", e));
    } else {
      this.rooms = this.lget("rooms", []); this.loaded = true;
      addEventListener("storage", e => { if (!e.key || !e.key.startsWith(`${KEY}.cr.`)) return; this.rooms = this.lget("rooms", []); if (this.mRid) this.msgs = this.lget("m." + this.mRid, []); this.changed(); });
    }
  },
  changed(){ LIVE.emit("croom"); },

  /* ---- 내가 볼 수 있는 방 ---- */
  mine(r){ return (r.mem || []).includes(ARC.me); },
  canSee(r){ return isT(ARC.me) || this.mine(r) || (r.open && !r.dm); },
  list(){
    return this.rooms.filter(r => this.canSee(r)).sort((a, b) => (this.mine(b) - this.mine(a)) || ((b.la || b.at || 0) - (a.la || a.at || 0)));
  },
  get(rid){ return this.rooms.find(r => r.id === rid); },
  title(r){
    if (!r) return "";
    if (r.dm){ const other = (r.mem || []).find(n => n !== ARC.me); return other === undefined ? r.n : isT(ARC.me) && this.mine(r) === false ? (r.mem || []).map(n => nameOf(n) || "선생님").join(" · ") : (isT(other) ? "선생님" : nameOf(other)); }
    return r.n;
  },
  unread(r){ if (!this.mine(r) || !r.la || r.ln === ARC.me) return false; return r.la > (this.seenAll()[r.id] || 0); },
  unreadN(){ return CHAT.banned(ARC.me) && !isT(ARC.me) ? 0 : this.rooms.filter(r => this.unread(r)).length; },

  /* ---- 방 하나 열기 (그 방 말만 받아요) ---- */
  select(rid){
    if (rid !== "all" && !this.get(rid)) rid = "all";
    this.cur = rid;
    if (this.unM){ this.unM(); this.unM = null; }
    this.msgs = []; this.mRid = rid === "all" ? null : rid;
    if (this.mRid){
      if (this.cloud()){
        const fs = Store.fs, my = this.mRid;
        this.unM = fs.onSnapshot(fs.query(this.col(my, "m"), fs.orderBy("at", "desc"), fs.limit(60)), qs => { if (this.mRid !== my) return; const l = []; qs.forEach(d => l.push(Object.assign({id: d.id}, d.data()))); this.msgs = l.reverse(); this.changed(); }, e => console.warn(e));
      } else this.msgs = this.lget("m." + this.mRid, []);
    }
    this.changed();
  },

  /* ---- 방 만들기 · 들어가기 · 나가기 ---- */
  why(){
    const me = ARC.me;
    if (me === null || me === undefined) return "로그인해야 해요";
    if (!this.live()) return "💬 대화방은 선생님이 ☁️ Firebase로 연결한 반에서 쓸 수 있어요";
    if (isT(me)) return "";
    if (CHAT.banned(me)) return "🚫 채팅방에서 추방됐어요";
    if (this.off()) return "⏸️ 선생님이 대화방을 잠깐 닫았어요";
    if ((Store.cls || {}).closed) return "🔒 지금은 오락실 쉬는 시간이에요";
    return "";
  },
  nameBad(n){
    if (CHAT.bad(n)) return "🙅 방 이름에 쓸 수 없는 말이 있어요";
    if (/https?:|www\.|\.(com|net|kr|io|ly|gg)\b/i.test(n)) return "🔗 방 이름에 주소(링크)는 안 돼요";
    return "";
  },
  async create(o){
    const w = this.why(); if (w) return toast(w);
    const n = String(o.n || "").replace(/\s+/g, " ").trim().slice(0, 14); if (!n) return toast("방 이름을 적어 주세요");
    const bad = this.nameBad(n); if (bad) return toast(bad);
    if (!isT(ARC.me) && this.rooms.filter(r => r.owner === ARC.me && !r.dm).length >= CR_MAXOWN) return toast(`방은 한 사람이 ${CR_MAXOWN}개까지 만들 수 있어요. 안 쓰는 방을 닫아 주세요`);
    const mem = [ARC.me].concat((o.mem || []).filter(x => x !== ARC.me)).slice(0, 40);
    const r = {n, e: CR_EMO.includes(o.e) ? o.e : "💬", owner: ARC.me, mem, open: !!o.open, at: Date.now(), la: Date.now(), lt: "방을 만들었어요", ln: -1};
    const id = await this.put(null, r);
    await this.sysSay(id, `🎉 ${iga(who(ARC.me))} ‘${n}’ 방을 만들었어요${mem.length > 1 ? ` · ${mem.slice(1).map(x => who(x)).join(", ")} 초대` : ""}`);
    this.select(id); return id;
  },
  async dm(no){
    const w = this.why(); if (w) return toast(w);
    if (no === ARC.me) return;
    const a = Math.min(no, ARC.me), b = Math.max(no, ARC.me), id = `dm_${a}_${b}`;
    if (!this.get(id)) await this.put(id, {n: "1:1 대화", e: "💌", dm: 1, owner: ARC.me, mem: [a, b], open: false, at: Date.now(), la: 0, ln: -1}, true);
    else if (!this.mine(this.get(id))) await this.upd(id, {mem: [a, b]});
    this.select(id); return id;
  },
  async join(rid){ const r = this.get(rid), w = this.why(); if (w) return toast(w); if (!r || this.mine(r)) return this.select(rid);
    if (!r.open && !isT(ARC.me)) return toast("🔒 비밀방은 초대받아야 들어갈 수 있어요");
    await this.memAdd(rid, ARC.me); await this.sysSay(rid, `👋 ${iga(who(ARC.me))} 들어왔어요`); this.select(rid); },
  async invite(rid, no){
    const r = this.get(rid), w = this.why(); if (w) return toast(w); if (!r) return;
    if ((r.mem || []).includes(no)) return toast(`${who(no)}는 벌써 이 방에 있어요`);
    await this.memAdd(rid, no); await this.sysSay(rid, `📨 ${iga(who(ARC.me))} ${who(no)}를 초대했어요`); toast(`📨 ${who(no)}를 ‘${r.n}’ 방에 초대했어요`);
  },
  async leave(rid){
    const r = this.get(rid); if (!r) return;
    const rest = (r.mem || []).filter(n => n !== ARC.me);
    if (!rest.length || r.dm && !rest.length) await this.remove(rid);
    else { await this.memDel(rid, ARC.me); if (r.owner === ARC.me && !r.dm) await this.upd(rid, {owner: rest[0]}); if (!r.dm) await this.sysSay(rid, `🚪 ${iga(who(ARC.me))} 나갔어요`); }
    if (this.cur === rid) this.select("all");
  },
  async kick(rid, no){ const r = this.get(rid); if (!r || !(isT(ARC.me) || r.owner === ARC.me) || no === r.owner && !isT(ARC.me)) return;
    await this.memDel(rid, no); await this.sysSay(rid, `🚪 ${who(no)}가 방에서 나갔어요 (${isT(ARC.me) ? "선생님" : "방장"})`); },
  async remove(rid){
    this.rooms = this.rooms.filter(r => r.id !== rid); if (this.cur === rid) this.select("all"); this.changed();
    if (this.cloud()){
      const fs = Store.fs;
      try { const qs = await fs.getDocs(fs.query(this.col(rid, "m"), fs.limit(400))); const b = fs.writeBatch(Store.db); qs.forEach(d => b.delete(d.ref)); b.delete(this.ref(rid)); await b.commit(); }
      catch(e){ console.error(e); fs.deleteDoc(this.ref(rid)).catch(() => {}); }
    } else { this.lset("rooms", this.lget("rooms", []).filter(r => r.id !== rid)); try { localStorage.removeItem(this.lk("m." + rid)); } catch(e) {} }
  },

  /* ---- 저장 (☁️ / 💻) ---- */
  async put(id, r, merge){
    if (this.cloud()){
      const ref = id ? this.ref(id) : Store.fs.doc(this.col()); await Store.fs.setDoc(ref, r, merge ? {merge: true} : undefined);
      if (!this.get(ref.id)) this.rooms.push(Object.assign({id: ref.id}, r)); return ref.id;
    }
    id = id || rid(10); const l = this.lget("rooms", []).filter(x => x.id !== id); l.push(Object.assign({id}, r)); this.lset("rooms", l); this.rooms = l; this.changed(); return id;
  },
  async upd(id, o){
    const r = this.get(id); if (r) Object.assign(r, o);
    if (this.cloud()) return Store.fs.updateDoc(this.ref(id), o).catch(e => console.error(e));
    const l = this.lget("rooms", []), x = l.find(z => z.id === id); if (x) Object.assign(x, o); this.lset("rooms", l); this.rooms = l; this.changed();
  },
  async memAdd(id, no){ if (this.cloud()) return Store.fs.updateDoc(this.ref(id), {mem: Store.fs.arrayUnion(no)}).catch(e => console.error(e)); const r = this.get(id); return this.upd(id, {mem: [...new Set((r.mem || []).concat(no))]}); },
  async memDel(id, no){ if (this.cloud()) return Store.fs.updateDoc(this.ref(id), {mem: Store.fs.arrayRemove(no)}).catch(e => console.error(e)); const r = this.get(id); return this.upd(id, {mem: (r.mem || []).filter(n => n !== no)}); },
  async say(rm, o){
    const last = {la: o.at, lt: o.k === "game" ? `🎮 ${(GAME[o.g] || {}).n || "게임"} 같이 하자!` : String(o.t || "").slice(0, 30), ln: o.sys ? -1 : o.no};
    if (this.cloud()){ await Store.fs.addDoc(this.col(rm, "m"), o); Store.fs.updateDoc(this.ref(rm), last).catch(() => {}); return; }
    const l = this.lget("m." + rm, []); l.push(Object.assign({id: rid(10)}, o)); this.lset("m." + rm, l.slice(-80));
    if (this.mRid === rm) this.msgs = l.slice(-60);
    await this.upd(rm, last);
  },
  sysSay(id, t){ return this.say(id, {no: -1, sys: 1, t: String(t).slice(0, 80), at: Date.now()}).catch(() => {}); },
  async unsay(mid){
    const rid = this.mRid; if (!rid) return; this.msgs = this.msgs.filter(m => m.id !== mid); this.changed();
    if (this.cloud()) return Store.fs.deleteDoc(this.ref(rid, "m", mid)).catch(() => {});
    this.lset("m." + rid, this.lget("m." + rid, []).filter(m => m.id !== mid));
  },
  /* 반 전체 채팅과 똑같은 검사(나쁜 말 · 천천히 · 쉬기 · 추방)를 거쳐서 이 방에 보내요 */
  send(text, k, extra){
    const rid = this.mRid, w = this.why(); if (w) return Promise.resolve(w); if (!rid) return Promise.resolve("방을 골라 주세요");
    const r = this.get(rid); if (r && !this.mine(r) && !isT(ARC.me)) return Promise.resolve("방에 들어가야 말할 수 있어요");
    if (r && r.dm && (r.mem || []).length < 2){ const m = /^dm_(-?\d+)_(-?\d+)$/.exec(r.id); if (m) this.upd(r.id, {mem: [+m[1], +m[2]]}); }   // 닫은 친구에게도 다시 열려요
    const orig = LIVE.say; LIVE.say = o => this.say(rid, Object.assign(o, extra || {}));
    let p; try { p = CHAT_SEND.call(CHAT, text, ARC.me, k); } finally { LIVE.say = orig; }
    return p;
  },

  /* ---- 🎮 같이 게임하기 ---- */
  async game(gid){
    const g = GAME[gid], rid = this.mRid; if (!g || !rid) return;
    const why = LOBBY.blocked(gid); if (why) return toast(why);
    const duel = g.kind === "duel" && !g.multi;
    if (duel && ROOMS.ok()){
      await ROOMS.open(gid); const lr = ROOMS.mine; if (!lr || lr === "…") return;
      const m = await this.send(`${g.e} ${g.n} 한 판 할 사람! ⚔️`, "game", {k: "game", g: gid, lr});
      if (m) toast(m);
      return;
    }
    const m = await this.send(g.kind === "score" && !crMulti(g) ? `${g.e} ${g.n} 점수 대결! 누가 더 높을까? 🏆` : `${g.e} ${g.n} 같이 하자! 🎮`, "game", {k: "game", g: gid});
    if (m) return toast(m);
    ARC.play(gid);
    if (crMulti(g)) setTimeout(() => toast(`🌐 ${g.n}의 온라인 방에서 방을 만들면 친구들이 들어와요!`), 600);
  },
  joinGame(mid){
    const m = this.msgs.find(x => x.id === mid); if (!m || !GAME[m.g]) return;
    if (m.lr){ const lr = LIVE.rooms.find(x => x.id === m.lr);
      if (m.no === ARC.me) return toast(lr ? "⏳ 내가 만든 대결방이에요. 친구가 들어오면 바로 시작해요!" : "이 대결방은 끝났어요. 🎮 같이 게임하기로 새로 열어 봐요");
      if (!lr || lr.st !== "open") return toast("😢 이미 시작했거나 닫힌 대결방이에요");
      return ROOMS.join(m.lr); }
    ARC.play(m.g);
  }
};
const CHAT_SEND = CHAT.send;   // 원래 반 전체 보내기
/* 💬 채팅 칸에서 고른 방이 있으면 그 방으로 (선생님 관리 화면에서 보내는 말은 늘 반 전체로) */
CHAT.send = function(text, no = ARC.me, k){
  if (CROOM.mRid && no === ARC.me && $("#mdTeach").hidden && !$("#scrHome").hidden && LOBBY.tab === "chat") return CROOM.send(text, k);
  return CHAT_SEND.call(this, text, no, k);
};

/* =====================================================================
   🖼️ 채팅 칸: 방 막대 + 방 머리 + 방 말 목록
   ===================================================================== */
const CRUI = {
  sig: "", makeOpen: false,
  bar(){
    const me = ARC.me, L = CROOM.list(), on = CROOM.cur, why = CROOM.why(), banned = CHAT.banned(me) && !isT(me);
    if (banned) return "";
    const unAll = LIVE.chat.filter(m => (m.at || 0) > LOBBY.seen && m.no !== me && !m.sys).length;
    return `<button class="cr-chip${on === "all" ? " on" : ""}" data-cr="all"><span class="f">🌈</span>우리반 전체${on !== "all" && unAll ? `<i class="nb">${unAll > 9 ? "9+" : unAll}</i>` : ""}</button>`
      + L.map(r => `<button class="cr-chip${on === r.id ? " on" : ""}${CROOM.mine(r) ? "" : " peek"}${r.dm ? " dm" : ""}" data-cr="${esc(r.id)}" title="${esc(CROOM.title(r))}"><span class="f">${r.dm ? "💌" : r.e || "💬"}</span>${esc(CROOM.title(r))}${!r.open && !r.dm ? " 🔒" : ""}${CROOM.unread(r) && on !== r.id ? `<i class="nb">N</i>` : ""}</button>`).join("")
      + (why && !isT(me) ? "" : `<button class="cr-chip add" data-cr="new"><span class="f">➕</span>방 만들기</button>`)
      + (isT(me) && CROOM.live() ? `<button class="cr-chip add" data-cr="toggle" title="아이들이 대화방을 만들고 쓰는 것을 끄고 켜요"><span class="f">${CROOM.off() ? "▶️" : "⏸️"}</span>${CROOM.off() ? "대화방 열기" : "대화방 닫기"}</button>` : "");
  },
  head(r){
    const me = ARC.me, mine = CROOM.mine(r), owner = r.owner === me, T = isT(me), mem = r.mem || [];
    return `<div class="cr-hd"><div class="t"><span class="f">${r.dm ? "💌" : r.e || "💬"}</span><b>${esc(CROOM.title(r))}</b><small>${r.dm ? "1:1 대화" : `${r.open ? "🌐 공개방" : "🔒 비밀방"} · ${mem.length}명`}${!mine && T ? " · 👀 선생님 보기" : ""}</small></div>
      <div class="ppl">${mem.slice(0, 12).map(n => `<span class="avf" data-pf="${sidOf(n)}" title="${esc(who(n))}${n === r.owner && !r.dm ? " (방장)" : ""}">${avHTMLof(sidOf(n), {still: true, face: true})}</span>`).join("")}${mem.length > 12 ? `<small>+${mem.length - 12}</small>` : ""}</div>
      <div class="acts">${mine || T ? `<button class="arc-btn sm p" data-cra="game">🎮 같이 게임</button>` : ""}${(mine && !r.dm) || T ? `<button class="arc-btn sm" data-cra="inv">👥 초대</button>` : ""}${mine ? `<button class="arc-btn sm" data-cra="leave">${r.dm ? "🗑️ 대화 닫기" : "🚪 나가기"}</button>` : !r.dm ? `<button class="arc-btn sm p" data-cra="join">🙋 들어가기</button>` : ""}${(owner && !r.dm) || T ? `<button class="arc-btn sm" data-cra="set">⚙️</button>` : ""}</div></div>`;
  },
  msgHTML(m, r){
    const me = ARC.me, T = isT(me), ban = (Store.cls || {}).chatBan || {};
    if (m.sys) return `<div class="cm sys"><p>${esc(m.t)}</p></div>`;
    const del = T || (r && r.owner === me && !r.dm) ? `<button class="del" data-crdel="${m.id}" title="지우기">🗑️</button>` : "";
    const banB = T && !isT(m.no) && !ban[m.no] ? `<button class="del" data-ban="${m.no}" title="채팅방에서 영원히 추방">🚫</button>` : "";
    let body;
    if (m.k === "game" && GAME[m.g]){
      const g = GAME[m.g], lr = m.lr ? LIVE.rooms.find(x => x.id === m.lr) : null, alive = !m.lr || (lr && lr.st === "open");
      const sc = g.kind === "score" && !crMulti(g) ? (r.mem || []).map(n => { const x = board(g.id).find(b => b.sid === sidOf(n)); return x ? {n, v: x.r.best || 0, t: valTxt(g, x.r)} : null; }).filter(Boolean).sort((a, b) => b.v - a.v).slice(0, 5) : [];
      body = `<div class="cr-game g-${g.id}"><span class="ic f">${g.e}</span><div class="i"><b>${esc(m.t)}</b><small>${m.lr ? (alive ? (m.no === me ? "⏳ 친구가 들어오면 바로 시작!" : "누르면 바로 대결 시작!") : "끝난 대결방") : crMulti(g) ? "🌐 온라인 방에서 만나요" : "각자 해서 점수 비교!"}</small>
        ${sc.length ? `<ol class="cr-sc">${sc.map((x, i) => `<li>${["🥇","🥈","🥉"][i] || i + 1} ${esc(isT(x.n) ? "선생님" : nameOf(x.n))} <b>${x.t}</b></li>`).join("")}</ol>` : ""}</div>
        ${alive ? `<button class="arc-btn sm p" data-crg="${m.id}">${m.lr ? (m.no === me ? "⏳ 기다리는 중" : "⚔️ 들어가기") : "▶ 하러 가기"}</button>` : ""}</div>`;
    } else body = `<p class="${m.k === "st" ? "st" : emoOnly(m.t) ? "big" : ""}">${esc(m.t)}</p>`;
    return `<div class="cm${m.no === me ? " me" : ""}${isT(m.no) ? " tch" : ""}"><span class="avf" data-pf="${sidOf(m.no)}">${avHTMLof(sidOf(m.no), {still: true, face: true})}</span><div class="bx"><div class="hd">${esc(isT(m.no) ? "🧑‍🏫 선생님" : `${m.no}번 ${nameOf(m.no)}`)}${ban[m.no] ? ` <i class="out">🚫 추방됨</i>` : ""} <small>${hhmm(m.at)}</small>${del}${banB}</div>${body}</div></div>`;
  },
  render(){
    const pane = $("#paneChat"); if (!pane) return;
    if (CHAT.banned(ARC.me) && !isT(ARC.me) && CROOM.mRid){ CROOM.select("all"); }
    const r = CROOM.mRid && CROOM.get(CROOM.mRid);
    if (CROOM.mRid && !r){ CROOM.select("all"); return; }
    pane.classList.toggle("in-room", !!r);
    const barH = this.bar();
    if (this.barSig !== barH){ this.barSig = barH; $("#crBar").innerHTML = barH; }
    $("#crBar").hidden = !barH;
    const hd = r ? this.head(r) : "";
    if (this.hdSig !== hd){ this.hdSig = hd; $("#crHd").innerHTML = hd; }
    $("#crHd").hidden = !r;
    if (!r) return false;
    const me = ARC.me, why = CROOM.why() || CHAT.why(me), canSay = !why && (CROOM.mine(r) || isT(me));
    const inp = $("#chText"); inp.disabled = $("#chSend").disabled = $("#chEmoBtn").disabled = !canSay;
    inp.placeholder = why || (canSay ? `‘${CROOM.title(r)}’에 한마디! (고운 말 😊)` : "🙋 들어가기를 누르면 말할 수 있어요");
    $("#chRule").hidden = LOBBY.ruleOk(); $("#chQuick").hidden = false; $("#chForm").hidden = false;
    const L = CROOM.msgs, sg = r.id + "|" + L.map(m => m.id).join(",") + "|" + JSON.stringify((Store.cls || {}).chatBan || {}) + "|" + LIVE.rooms.map(x => x.id + x.st).join(",") + "|" + Math.floor(Date.now()/60000) + "|" + (r.mem || []).join(",");
    if (sg !== this.sig){
      this.sig = sg;
      const box = $("#chList"), near = box.scrollHeight - box.scrollTop - box.clientHeight < 80 || this.lastRid !== r.id;
      box.innerHTML = L.length ? L.map(m => this.msgHTML(m, r)).join("") : `<div class="ch-off">${r.dm ? `💌 <b>${esc(CROOM.title(r))}</b>와 1:1 대화를 시작해요!` : `${r.e || "💬"} <b>${esc(r.n)}</b> 방이에요!`}<br>첫 인사를 해 볼까요? 👋<br><small>대화방에서도 고운 말만 · 선생님은 모든 방을 볼 수 있어요</small></div>`;
      if (near) box.scrollTop = box.scrollHeight; this.lastRid = r.id;
    }
    if (L.length) CROOM.markSeen(r.id, Math.max(...L.map(m => m.at || 0), r.la || 0));
    return true;
  },

  /* ➕ 방 만들기 */
  openMake(){
    const w = CROOM.why(); if (w) return toast(w);
    let e = CR_EMO[0], open = true, mem = new Set();
    const ppl = roster().filter(s => s.no !== ARC.me);
    const draw = () => {
      $("#crMkBody").innerHTML = `<label class="cr-f">방 이름<input id="crMkN" maxlength="14" placeholder="예) 축구 좋아하는 방 ⚽" value="${esc($("#crMkN") ? $("#crMkN").value : "")}"></label>
        <div class="cr-f">방 그림<div class="cr-emos">${CR_EMO.map(x => `<button data-e="${x}" class="${x === e ? "on" : ""}">${x}</button>`).join("")}</div></div>
        <div class="cr-f">어떤 방?<div class="arc-seg" id="crMkOpen" style="margin:0"><button data-v="1" class="${open ? "on" : ""}">🌐 공개방 <small>누구나 들어와요</small></button><button data-v="0" class="${open ? "" : "on"}">🔒 비밀방 <small>초대한 친구만</small></button></div></div>
        <div class="cr-f">같이 할 친구 초대 <small>${mem.size}명</small><div class="cr-pick">${ppl.map(s => `<button data-no="${s.no}" class="${mem.has(s.no) ? "on" : ""}">${avI(sidOf(s.no))}${esc(s.t ? "선생님" : `${s.no}. ${s.name}`)}</button>`).join("")}</div></div>
        <p class="arc-small">🛡️ 대화방에서도 반 전체 채팅과 똑같이 나쁜 말은 막히고, <b>선생님은 모든 방을 볼 수 있어요.</b></p>`;
    };
    draw(); ARC.modal("#mdCrMake", true);
    $("#crMkBody").onclick = ev => {
      const b = ev.target.closest("[data-e],[data-v],[data-no]"); if (!b) return; ev.preventDefault();
      if (b.dataset.e) e = b.dataset.e; else if (b.dataset.v !== undefined) open = b.dataset.v === "1"; else { const n = +b.dataset.no; mem.has(n) ? mem.delete(n) : mem.add(n); }
      const keep = $("#crMkN").value; draw(); $("#crMkN").value = keep;
    };
    $("#crMkGo").onclick = async () => { const n = $("#crMkN").value; const id = await CROOM.create({n, e, open, mem: [...mem]}); if (id){ ARC.modal("#mdCrMake", false); LOBBY.setTab("chat"); } };
  },
  /* 👥 초대 · ⚙️ 설정 · 🎮 게임 고르기 (작은 창) */
  sheet(title, html, bind){
    $("#crShT").textContent = title; $("#crShB").innerHTML = html; ARC.modal("#mdCrSheet", true); bind($("#crShB"));
  },
  openInvite(r){
    const ppl = roster().filter(s => !(r.mem || []).includes(s.no));
    this.sheet(`👥 ‘${CROOM.title(r)}’에 초대하기`, ppl.length ? `<div class="cr-pick">${ppl.map(s => `<button data-no="${s.no}">${avI(sidOf(s.no))}${esc(s.t ? "선생님" : `${s.no}. ${s.name}`)}${LIVE.online(sidOf(s.no)) ? " 🟢" : ""}</button>`).join("")}</div>` : `<p class="arc-empty">반 친구가 모두 이 방에 있어요!</p>`,
      el => el.onclick = async ev => { const b = ev.target.closest("[data-no]"); if (!b || b.disabled) return; b.disabled = true; b.classList.add("on"); await CROOM.invite(r.id, +b.dataset.no); });
  },
  openSet(r){
    const T = isT(ARC.me);
    this.sheet(`⚙️ ‘${r.n}’ 방 설정`, `<label class="cr-f">방 이름<input id="crSetN" maxlength="14" value="${esc(r.n)}"></label>
      <div class="cr-f">방 그림<div class="cr-emos">${CR_EMO.map(x => `<button data-e="${x}" class="${x === r.e ? "on" : ""}">${x}</button>`).join("")}</div></div>
      <div class="cr-f">어떤 방?<div class="arc-seg" style="margin:0"><button data-v="1" class="${r.open ? "on" : ""}">🌐 공개방</button><button data-v="0" class="${r.open ? "" : "on"}">🔒 비밀방</button></div></div>
      <div class="cr-f">방 친구 <small>${T || r.owner === ARC.me ? "❌를 누르면 방에서 내보내요" : ""}</small><div class="cr-pick">${(r.mem || []).map(n => `<span class="cr-m">${avI(sidOf(n))}${esc(who(n))}${n === r.owner ? " 👑" : `<button data-kick="${n}" title="내보내기">❌</button>`}</span>`).join("")}</div></div>
      <div class="arc-row"><button class="arc-btn" data-del="1">🗑️ 방 없애기</button><button class="arc-btn p" data-save="1">💾 저장</button></div>`,
      el => { let e = r.e, open = r.open;
        el.onclick = async ev => {
          const b = ev.target.closest("[data-e],[data-v],[data-kick],[data-del],[data-save]"); if (!b) return;
          if (b.dataset.e){ e = b.dataset.e; el.querySelectorAll("[data-e]").forEach(x => x.classList.toggle("on", x === b)); }
          else if (b.dataset.v !== undefined){ open = b.dataset.v === "1"; el.querySelectorAll("[data-v]").forEach(x => x.classList.toggle("on", x === b)); }
          else if (b.dataset.kick){ const n = +b.dataset.kick; if (confirm(`${who(n)}를 방에서 내보낼까요?`)){ await CROOM.kick(r.id, n); b.closest(".cr-m").remove(); } }
          else if (b.dataset.del){ if (confirm(`‘${r.n}’ 방을 없앨까요? 방의 말도 모두 지워져요.`)){ await CROOM.remove(r.id); ARC.modal("#mdCrSheet", false); } }
          else if (b.dataset.save){ const n = $("#crSetN").value.replace(/\s+/g, " ").trim().slice(0, 14); if (!n) return toast("방 이름을 적어 주세요"); const bad = CROOM.nameBad(n); if (bad) return toast(bad);
            await CROOM.upd(r.id, {n, e, open}); ARC.modal("#mdCrSheet", false); toast("💾 방 설정을 바꿨어요"); }
        }; });
  },
  openGames(r){
    const G = LOBBY.visGames().filter(g => gameOn(g.id) || isT(ARC.me)), grp = [["⚔️ 둘이 대결 (누르면 바로 대결방이 열려요)", G.filter(g => g.kind === "duel" && !g.multi)], ["🤝 여럿이 같이 (온라인 방)", G.filter(g => crMulti(g))], ["🏆 점수 대결 (각자 해서 비교)", G.filter(g => g.kind === "score" && !crMulti(g))]];
    this.sheet(`🎮 ‘${CROOM.title(r)}’ 친구들과 같이 게임`, grp.filter(x => x[1].length).map(([t, l]) => `<div class="cr-gh">${t}</div><div class="cr-gs">${l.map(g => `<button class="g-${g.id}" data-g="${g.id}"><span class="f">${g.e}</span>${g.n}</button>`).join("")}</div>`).join(""),
      el => el.onclick = ev => { const b = ev.target.closest("[data-g]"); if (!b) return; ARC.modal("#mdCrSheet", false); CROOM.game(b.dataset.g); });
  }
};

/* =====================================================================
   👤 친구 프로필
   ===================================================================== */
const PROF = {
  no: null,
  open(sid){
    const no = noOfSid(sid); if (no === null || !roster().find(s => s.no === no) || ARC.me === null) return;
    this.no = no; this.render(); ARC.modal("#mdProf", true);
  },
  recs(sid){
    return GAMES.map(g => { const b = board(g.id), x = b.find(y => y.sid === sid); return x ? {g, rank: x.rank, n: b.length, txt: valTxt(g, x.r), plays: x.r.plays || ((x.r.w || 0) + (x.r.l || 0))} : null; })
      .filter(Boolean).sort((a, b) => a.rank - b.rank || b.plays - a.plays);
  },
  render(){
    const no = this.no, sid = sidOf(no), me = ARC.me, self = no === me, w = walletOf(sid), o = LIVE.online(sid), last = (LIVE.on[sid] || {}).at;
    const st = o ? (o.st === "play" && GAME[o.g] ? `<span class="on play">🎮 ${GAME[o.g].e} ${GAME[o.g].n} 하는 중</span>` : `<span class="on">🟢 지금 접속 중</span>`) : `<span class="off">⚪ 접속 안 함${last ? ` · ${agoTxt(last)}` : ""}</span>`;
    const R = this.recs(sid), gold = R.filter(x => x.rank === 1).length, bio = (Store.kids[sid] || {}).bio || "";
    const myRooms = CROOM.rooms.filter(r => CROOM.mine(r) && !r.dm && !(r.mem || []).includes(no));
    const duels = LOBBY.visGames().filter(g => g.kind === "duel" && !g.multi && gameOn(g.id));
    const canNet = !self && NET.ok() && !!o;
    $("#pfBody").innerHTML = `<div class="pf-top"><span class="pf-av">${avHTMLof(sid)}</span>
        <div class="pf-i"><b class="nm">${esc(isT(no) ? "🧑‍🏫 선생님" : `${no}번 ${nameOf(no)}`)}</b>${titleHTML(sid)}<div class="st">${st}</div>
          ${self ? `<form class="pf-bio" id="pfBioF"><input id="pfBio" maxlength="30" placeholder="나를 소개하는 한마디 (30자)" value="${esc(bio)}"><button class="arc-btn sm">💾</button></form><div class="pf-msg" id="pfMsg"></div>`
            : `<p class="pf-say">${bio ? `💬 ${esc(bio)}` : `<i>아직 한마디가 없어요</i>`}</p>`}</div></div>
      <div class="pf-stats"><div><b>🪙 ${(w.total || 0).toLocaleString()}</b><small>모은 코인</small></div><div><b>🥇 ${gold}</b><small>반 1등 게임</small></div><div><b>🎮 ${R.length}</b><small>기록 있는 게임</small></div></div>
      <div class="pf-h">🏅 게임 기록</div>
      <div class="pf-recs">${R.length ? R.slice(0, 12).map(x => `<div class="pf-r g-${x.g.id}"><span class="f">${x.g.e}</span><span class="n">${x.g.n}</span><b>${x.txt}</b><i class="${x.rank <= 3 ? "t" + x.rank : ""}">${x.rank <= 3 ? ["🥇","🥈","🥉"][x.rank - 1] : x.rank + "등"}</i></div>`).join("") : `<p class="arc-empty">아직 게임 기록이 없어요</p>`}</div>
      ${self ? `<div class="arc-row"><button class="arc-btn p" data-pa="shop">🛍️ 꾸미기 (상점)</button></div>`
        : `<div class="pf-acts">
          <button class="arc-btn p" data-pa="dm">💬 1:1 대화</button>
          ${canNet && duels.length ? `<button class="arc-btn" data-pa="duel">⚔️ 대결 신청</button>` : ""}
          ${myRooms.length ? `<button class="arc-btn" data-pa="inv">📨 내 방에 초대</button>` : ""}</div>
          ${!o && NET.ok() ? `<p class="arc-small">⚔️ 대결 신청은 친구가 접속해 있을 때 할 수 있어요</p>` : ""}
          <div id="pfMore"></div>`}`;
    const body = $("#pfBody");
    if (self){ $("#pfBioF").onsubmit = async e => { e.preventDefault(); const t = $("#pfBio").value.replace(/\s+/g, " ").trim().slice(0, 30);
      if (t && CHAT.bad(t)) return $("#pfMsg").textContent = "🙅 쓸 수 없는 말이 있어요";
      if (/https?:|www\./i.test(t)) return $("#pfMsg").textContent = "🔗 주소(링크)는 안 돼요";
      try { await Store.kidTx(sid, x => Object.assign(x, {bio: t})); $("#pfMsg").textContent = "✅ 저장했어요"; } catch(err){ $("#pfMsg").textContent = "⚠️ 저장하지 못했어요"; } }; }
    body.onclick = async e => {
      const b = e.target.closest("[data-pa],[data-pg],[data-pr]"); if (!b) return;
      if (b.dataset.pa === "shop"){ ARC.modal("#mdProf", false); SHOP.open(sid); }
      else if (b.dataset.pa === "dm"){ const id = await CROOM.dm(no); if (id){ ARC.modal("#mdProf", false); LOBBY.setTab("chat"); } }
      else if (b.dataset.pa === "duel") $("#pfMore").innerHTML = `<div class="pf-h">⚔️ 무슨 게임으로 대결할까요?</div><div class="cr-gs">${duels.map(g => `<button class="g-${g.id}" data-pg="${g.id}"><span class="f">${g.e}</span>${g.n}</button>`).join("")}</div>`;
      else if (b.dataset.pa === "inv") $("#pfMore").innerHTML = `<div class="pf-h">📨 어느 방에 초대할까요?</div><div class="cr-gs">${myRooms.map(r => `<button data-pr="${esc(r.id)}"><span class="f">${r.e}</span>${esc(r.n)}</button>`).join("")}</div>`;
      else if (b.dataset.pg){ const why = LOBBY.blocked(b.dataset.pg); if (why) return toast(why); ARC.modal("#mdProf", false); NET.invite(b.dataset.pg, no); }
      else if (b.dataset.pr){ await CROOM.invite(b.dataset.pr, no); b.disabled = true; b.textContent = "✅ 초대했어요"; }
    };
  }
};

/* =====================================================================
   🔌 로비에 끼우기
   ===================================================================== */
(function(){
  // 아바타를 누르면 프로필 (로그인 화면에서는 로그인 그대로)
  const avI0 = avI;
  avI = (sid, cls = "avf") => avI0(sid, cls).replace(`<span class="${cls}">`, `<span class="${cls}" data-pf="${sid}">`);
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-pf]"); if (!t || ARC.me === null || ARC.busy) return;
    if (t.closest("#scrLogin, #mdCrMake, #mdCrSheet, #mdProf, .cr-pick, #lgNums")) return;
    e.preventDefault(); e.stopPropagation(); PROF.open(t.dataset.pf);
  }, true);

  // 채팅 칸: 방이 골라져 있으면 방 화면
  const rc = LOBBY.renderChat;
  LOBBY.renderChat = function(){
    CROOM.start();
    if (CRUI.render()) return;
    rc.call(this);
  };
  // 안 읽은 표시: 반 전체 + 내 방들
  const rs = LOBBY.renderSide;
  LOBBY.renderSide = function(force){
    const seen = this.seen; rs.call(this, force); if (CROOM.mRid) this.seen = seen;   // 방을 보는 동안 '반 전체'는 안 읽은 채로
    const n = CROOM.unreadN(), b = $("#bChat");
    if (n && this.tab !== "chat"){ const a = parseInt(b.textContent) || 0; b.textContent = a + n > 9 ? "9+" : String(a + n); }
  };
  // 방을 고른 채로 '반 전체'의 '읽음'이 바뀌지 않게
  const st = LOBBY.setTab;
  LOBBY.setTab = function(t){ CRUI.sig = ""; st.call(this, t); };
  // 로그인/로그아웃
  const hm = ARC.home;
  ARC.home = function(){ hm.apply(this, arguments); CROOM.start(); };
  const lo = ARC.logout;
  ARC.logout = function(){ CROOM.select("all"); return lo.apply(this, arguments); };
  // 홈 칸 클릭
  const bh = LOBBY.bindHome;
  LOBBY.bindHome = function(){
    bh.call(this);
    $("#crBar").onclick = e => { const b = e.target.closest("[data-cr]"); if (!b) return;
      if (b.dataset.cr === "new") return CRUI.openMake();
      if (b.dataset.cr === "toggle"){ const off = !CROOM.off(); return ADMIN.patch({croomsOff: off}, off ? "⏸️ 대화방을 닫았어요 (반 전체 채팅은 그대로)" : "▶️ 대화방을 열었어요").then(() => { CRUI.barSig = ""; LOBBY.renderSide(true); }); }
      if (b.dataset.cr === "all"){ CROOM.select("all"); LOBBY.chatSig = ""; this.seen = Date.now(); } else CROOM.select(b.dataset.cr);
      CRUI.sig = ""; LOBBY.renderSide(true); const l = $("#chList"); l.scrollTop = l.scrollHeight; };
    $("#crHd").onclick = async e => { const b = e.target.closest("[data-cra]"); const r = CROOM.get(CROOM.mRid); if (!b || !r) return;
      const a = b.dataset.cra;
      if (a === "game") CRUI.openGames(r); else if (a === "inv") CRUI.openInvite(r); else if (a === "set") CRUI.openSet(r);
      else if (a === "join") CROOM.join(r.id);
      else if (a === "leave" && confirm(r.dm ? "이 1:1 대화를 닫을까요? (친구가 다시 말을 걸면 다시 열려요)" : `‘${r.n}’ 방에서 나갈까요?`)) CROOM.leave(r.id); };
    $("#chList").addEventListener("click", e => {
      const g = e.target.closest("[data-crg]"), d = e.target.closest("[data-crdel]");
      if (g){ e.stopPropagation(); CROOM.joinGame(g.dataset.crg); }
      if (d){ e.stopPropagation(); if (confirm("이 말을 지울까요?")) CROOM.unsay(d.dataset.crdel); }
    }, true);
  };
  // 실시간 소식
  // (홈 화면 다시 그리기는 LOBBY.onLive가 해요)
  LIVE.subs.unshift(k => { if (k.rooms) CRUI.sig = ""; if (!$("#mdProf").hidden && k.on && !ARC.busy && !$("#pfMore")?.innerHTML && document.activeElement !== $("#pfBio")) PROF.render(); });
})();
