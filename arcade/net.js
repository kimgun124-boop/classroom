/* =====================================================================
   🌐 다른 기기 친구와 대결
   - 신청·수락은 Firebase(arcade/{반}/rooms)에 잠깐 쪽지를 두고 주고받아요
   - 연결되면 게임은 두 기기가 직접(WebRTC) 주고받아요 → 빠르고, Firebase 사용량도 거의 안 들어요
   - 신청한 친구(왼쪽)가 '심판' 기기예요: 공·점수는 심판 기기가 정하고, 자기 선수는 각자 기기가 움직여요
   ===================================================================== */
const NET = {
  role: null, on: false, gid: null, rid: null, a: null, b: null, pc: null, u: null, r: null,
  seq: 0, inSeq: 0, lt: 0, timer: 0, dcT: 0, unRoom: null, unInbox: null, inbox: [], inv: null, me: null, sig: null,
  ICE: [{urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"]}],
  ok(){ return !!(this.sig || Store.mode === "cloud") && "RTCPeerConnection" in window; },

  /* ---- 신청 쪽지 (Firebase) ---- */
  S(){
    if (this.sig) return this.sig;
    const fs = Store.fs, col = () => fs.collection(Store.db, "arcade", Store.cid, "rooms");
    return {
      async create(o){ const ref = fs.doc(col()); await fs.setDoc(ref, o); return ref.id; },
      watch(id, cb){ return fs.onSnapshot(fs.doc(col(), id), s => cb(s.exists() ? s.data() : null), () => {}); },
      update(id, o){ return fs.updateDoc(fs.doc(col(), id), o); },
      del(id){ return fs.deleteDoc(fs.doc(col(), id)).catch(() => {}); },
      inbox(no, cb){ return fs.onSnapshot(fs.query(col(), fs.where("to", "==", no)), qs => { const l = []; qs.forEach(d => l.push(Object.assign({id: d.id}, d.data()))); cb(l); }, e => console.warn(e)); }
    };
  },
  /* 로그인하면 나에게 온 신청을 기다려요 */
  listen(me){
    if (!this.ok() || (this.unInbox && this.me === me)) return;
    this.unlisten(); this.me = me;
    try { this.unInbox = this.S().inbox(me, l => { this.inbox = l.filter(x => x.st === "wait" && x.offer && Math.abs(Date.now() - (x.at || 0)) < 120000).sort((a, b) => b.at - a.at); this.showInvite(); }); }
    catch(e){ console.warn(e); }
  },
  unlisten(){ if (this.unInbox) this.unInbox(); this.unInbox = null; this.inbox = []; this.me = null; if (this.inv){ this.inv = null; ARC.modal("#mdNet", false); } },

  /* ---- 화면: 기다리기 / 신청 받기 ---- */
  duo(a, b){ const g = GAME[this.gid] || {}, f = n => `<span class="avf">${avHTMLof(sidOf(n), {still: true, face: true})}</span>`; return `<div class="p">${f(a)}<b>${esc(who(a))}</b></div><div class="vs">${g.e || "VS"}</div><div class="p">${f(b)}<b>${esc(who(b))}</b></div>`; },
  box(title, msg, btns){
    $("#ntTitle").textContent = title; $("#ntDuo").innerHTML = this.a != null && this.b != null ? this.duo(this.a, this.b) : "";
    $("#ntMsg").innerHTML = msg; $("#ntBtns").innerHTML = btns.map((b, i) => `<button class="arc-btn${b.p ? " p" : ""}" data-i="${i}">${b.t}</button>`).join("");
    $("#ntBtns").onclick = e => { const x = e.target.closest("[data-i]"); if (x) btns[+x.dataset.i].f(); };
    ARC.modal("#mdNet", true);
  },
  wait(msg){ const g = GAME[this.gid]; this.box(`🌐 ${g.e} ${g.n} 대결`, msg, [{t: "✕ 그만두기", f: () => this.cancel()}]); },
  fail(msg){ const g = GAME[this.gid] || {e: "🌐", n: ""}; this.close(); this.gid = g.id; this.box(`${g.e} ${g.n} 대결`, msg, [{t: "확인", p: 1, f: () => { ARC.modal("#mdNet", false); this.showInvite(); }}]); },
  showInvite(){
    if (this.role || ARC.me === null || ARC.busy) return;
    const cur = this.inv && this.inbox.find(x => x.id === this.inv.id);
    if (this.inv && !cur){ this.inv = null; ARC.modal("#mdNet", false); toast("친구가 대결 신청을 취소했어요"); }
    if (this.inv || !this.inbox.length) return;
    if (!$("#mdNet").hidden) return;   // 다른 안내를 보고 있어요
    const x = this.inv = this.inbox[0], g = GAME[x.g]; if (!g){ this.inv = null; return; }
    this.gid = x.g; this.a = x.from; this.b = ARC.me;
    ["#mdDuel", "#mdRank", "#mdPw"].forEach(q => { const m = $(q); if (m) m.hidden = true; });
    this.box(`⚔️ 대결 신청이 왔어요!`, `<b>${esc(iga(who(x.from)))}</b> <b>${g.e} ${g.n}</b> 대결을 신청했어요!<br><small>수락하면 친구 기기와 연결돼요. 이기면 랭킹 +1승!</small>`,
      [{t: "🙅 다음에", f: () => { this.inv = null; ARC.modal("#mdNet", false); this.S().update(x.id, {st: "no"}).catch(() => {}); this.a = this.b = null; }},
       {t: "⚔️ 수락!", p: 1, f: () => { this.inv = null; this.accept(x); }}]);
    try { tone(660, 990, .12, "triangle", .12); tone(990, 1320, .15, "triangle", .12, .13); } catch(e) {}
  },

  /* ---- 연결 ---- */
  mkPc(){
    const pc = this.pc = new RTCPeerConnection({iceServers: this.ICE});
    pc.onconnectionstatechange = () => { if (this.pc !== pc) return; const s = pc.connectionState;
      if (s === "failed") this.lost();
      else if (s === "disconnected"){ clearTimeout(this.dcT); this.dcT = setTimeout(() => { if (this.pc === pc && pc.connectionState === "disconnected") this.lost(); }, 5000); } };
    return pc;
  },
  gather(){ const pc = this.pc; return new Promise(res => { if (pc.iceGatheringState === "complete") return res(); const t = setTimeout(res, 3000); pc.addEventListener("icegatheringstatechange", () => { if (pc.iceGatheringState === "complete"){ clearTimeout(t); res(); } }); }); },
  wire(){
    [this.u, this.r].forEach(c => { if (!c || c._w) return; c._w = 1;
      c.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch(er){ return; } this.msg(m); };
      c.onopen = () => this.ready(); c.onclose = () => { if (this.on) this.lost(); }; });
    this.ready();
  },
  connWait(){ clearTimeout(this.timer); this.timer = setTimeout(() => { if (!this.on) this.fail(`🔌 두 기기가 연결되지 않았어요.<br><small>두 기기가 <b>같은 와이파이</b>에 연결돼 있는지 확인하고 다시 해 보세요. 학교 와이파이가 기기끼리 연결을 막아 두었으면 안 될 수 있어요. 그럴 때는 한 기기에서 🧒 둘이 대결을 해요.</small>`); }, 20000); },

  async invite(gid, to){
    this.close(); this.role = "host"; this.gid = gid; this.a = ARC.me; this.b = to;
    this.wait(`⏳ <b>${esc(who(to))}</b>에게 신청하는 중…`);
    try {
      const pc = this.mkPc();
      this.u = pc.createDataChannel("u", {ordered: false, maxRetransmits: 0}); this.r = pc.createDataChannel("r"); this.wire();
      await pc.setLocalDescription(await pc.createOffer()); await this.gather();
      if (this.pc !== pc) return;
      this.rid = await this.S().create({g: gid, from: this.a, to, st: "wait", offer: pc.localDescription.sdp, at: Date.now()});
      if (this.pc !== pc){ this.S().del(this.rid); return; }
      this.wait(`📨 <b>${esc(who(to))}</b>의 화면에 신청이 떴어요.<br>친구가 <b>⚔️ 수락</b>을 누르면 바로 시작해요!<br><small>친구도 자기 기기에서 오락실에 로그인해 있어야 해요.</small>`);
      this.unRoom = this.S().watch(this.rid, d => {
        if (this.pc !== pc || this.on) return;
        if (!d) return this.fail("신청이 사라졌어요. 다시 신청해 보세요.");
        if (d.st === "no") return this.fail(`🙏 <b>${esc(iga(who(to)))}</b> 다음에 하재요.`);
        if (d.answer && !pc.currentRemoteDescription){ pc.setRemoteDescription({type: "answer", sdp: d.answer}).catch(e => this.fail("연결하지 못했어요: " + e.message)); this.wait("🔌 친구 기기와 연결하는 중…"); this.connWait(); }
      });
      this.timer = setTimeout(() => { if (this.pc === pc && !this.on && !pc.currentRemoteDescription) this.fail(`⌛ <b>${esc(iga(who(to)))}</b> 대답이 없어요.<br><small>친구가 자기 기기에서 오락실에 로그인해 있는지 확인해요.</small>`); }, 60000);
    } catch(e){ console.error(e); this.fail("신청하지 못했어요: " + (e.message || e)); }
  },
  async accept(x){
    this.close(); this.role = "guest"; this.gid = x.g; this.a = x.from; this.b = ARC.me; this.rid = x.id;
    this.wait("🔌 친구 기기와 연결하는 중…");
    try {
      const pc = this.mkPc();
      pc.ondatachannel = e => { if (e.channel.label === "u") this.u = e.channel; else this.r = e.channel; this.wire(); };
      await pc.setRemoteDescription({type: "offer", sdp: x.offer});
      await pc.setLocalDescription(await pc.createAnswer()); await this.gather();
      if (this.pc !== pc) return;
      await this.S().update(x.id, {answer: pc.localDescription.sdp, st: "go"});
      this.unRoom = this.S().watch(x.id, d => { if (this.pc === pc && !this.on && !d) this.fail("친구가 신청을 취소했어요."); });
      this.connWait();
    } catch(e){ console.error(e); this.fail("연결하지 못했어요: " + (e.message || e)); }
  },
  cancel(){
    if (this.rid && !this.on){ if (this.role === "host") this.S().del(this.rid); else this.S().update(this.rid, {st: "no"}).catch(() => {}); }
    this.close(); ARC.modal("#mdNet", false); this.showInvite();
  },
  /* 두 통로가 다 열리면 시작 */
  ready(){
    if (this.on || !this.u || !this.r || this.u.readyState !== "open" || this.r.readyState !== "open") return;
    this.on = true; clearTimeout(this.timer); ARC.modal("#mdNet", false);
    if (this.unRoom){ this.unRoom(); this.unRoom = null; }
    if (this.role === "host"){ this.S().del(this.rid); this.go(); }
  },

  /* ---- 게임 ---- */
  ad(){ return this.gid === "vb" ? window.__vbNet : this.gid === "ah" ? window.__ahNet : this.gid === "pp" ? (NG.cur && NG.gid === "pp" && NG.cur.netAd) : null; },
  go(){   // 심판(신청한 친구) 기기가 시작해요
    const x = ARC.netGo("host", this.gid, this.a, this.b);
    this.sendR({t: "start", g: this.gid, a: this.a, b: this.b, x});
  },
  again(){
    if (!this.on) return;
    if (this.role === "host") return this.go();
    this.sendR({t: "re"}); toast("🔁 친구에게 한 판 더 하자고 보냈어요");
  },
  end(w, sc, txt){ this.sendR({t: "end", w, sc, txt}); },
  tick(A){
    if (!this.on || !A) return;
    const t = performance.now(); if (t - this.lt < 14) return; this.lt = t;
    if (this.role === "host"){ this.send({t: "s", d: A.snap()}); const e = A.ev(); if (e.length) this.sendR({t: "ev", e}); }
    else this.send({t: "i", d: A.mine()});
  },
  send(o){ const c = this.u; if (!c || c.readyState !== "open" || c.bufferedAmount > 65536) return; o.q = ++this.seq; try { c.send(JSON.stringify(o)); } catch(e) {} },
  sendR(o){ const c = this.r; if (c && c.readyState === "open") try { c.send(JSON.stringify(o)); } catch(e) {} },
  msg(m){
    if (m.t === "s" || m.t === "i"){ if (m.q <= this.inSeq) return; this.inSeq = m.q; const A = this.ad(); if (A) (m.t === "s" ? A.apply(m.d) : A.put(m.d)); return; }
    if (m.t === "ev"){ const A = this.ad(); if (A) A.fx(m.e); return; }
    if (m.t === "start"){ if (this.role === "guest"){ this.gid = m.g; ARC.netGo("guest", m.g, m.a, m.b, m.x); } return; }
    if (m.t === "end"){ const A = this.ad(); if (A) A.end(m.w, m.sc, m.txt); return; }
    if (m.t === "re"){ if (this.role === "host"){ toast("🔁 친구가 한 판 더 하재요!"); this.go(); } return; }
    if (m.t === "bye") return this.lost(true);
  },
  /* 이긴 쪽/진 쪽 제목을 내 기기 기준으로 */
  title(sel, wsid){ setTimeout(() => { const h = $(sel); if (h && this.role) h.textContent = wsid === sidOf(ARC.me) ? "🏆 내가 이겼어요!" : "😢 아쉽게 졌어요! 한 판 더?"; }, 0); },

  /* ---- 끝내기 ---- */
  leave(){ if (!this.role) return; this.sendR({t: "bye"}); this.close(); },
  lost(bye){
    if (!this.role) return;
    const was = this.on, opp = this.role === "host" ? this.b : this.a;
    this.close();
    if (was){ ARC.netQuit(); toast(bye ? `👋 ${iga(who(opp))} 대결을 끝냈어요` : "⚠️ 친구 기기와 연결이 끊겼어요"); }
    else this.fail("⚠️ 친구 기기와 연결이 끊겼어요.");
  },
  close(){
    clearTimeout(this.timer); clearTimeout(this.dcT);
    if (this.unRoom){ this.unRoom(); this.unRoom = null; }
    if (this.rid && this.role === "host" && !this.on) this.S().del(this.rid);
    const pc = this.pc, u = this.u, r = this.r; this.pc = this.u = this.r = null;
    setTimeout(() => { try { u && u.close(); r && r.close(); pc && pc.close(); } catch(e) {} }, 150);   // 'bye'가 먼저 가게 잠깐 기다려요
    [window.__vbNet, window.__ahNet].forEach(A => A && A.reset());
    this.role = null; this.on = false; this.rid = null; this.seq = 0; this.inSeq = 0;
  }
};
/* 받침에 따라 이/가 */
function iga(s){ const c = String(s).charCodeAt(String(s).length - 1); return c >= 0xAC00 && c <= 0xD7A3 ? s + ((c - 0xAC00) % 28 ? "이" : "가") : s + "이(가)"; }
window.NET = NET;
