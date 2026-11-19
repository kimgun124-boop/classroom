/* =====================================================================
   🎙️ 음성 채팅 (2026.11.19)
   - 💬 채팅 칸 위 음성 막대에서 [🎙️ 참여하기] → 마이크 허용 → 같은 방 친구들과 바로 말해요
     (반 전체 = 🌈 우리반 전체 음성방, 대화방에 있으면 그 방 친구들끼리)
   - 들어가 있으면 게임을 하거나 다른 탭을 봐도 계속 이어져요 (옆에 작은 🎙️ 막대가 떠요)
   - 기기끼리 직접(WebRTC) 소리를 주고받아요. Firebase에는 '누가 들어왔는지'와 연결 쪽지만 잠깐 둬요
     ☁️ arcade/{반}/voice/{방}/p/{사람}  ·  arcade/{반}/voice/{방}/s/{쪽지}
   - 끊기지 않게: 메아리·잡음 줄이기, Opus 소리 손실 메우기(FEC), 넉넉한 소리 대기열,
     연결이 흔들리면 4초 안에 저절로 다시 연결, 12초 안에 안 이어지면 다시 걸기
   - 한 방에 8명까지 (기기마다 친구 수만큼 연결해서, 더 많으면 태블릿이 버벅여요)
   - 마이크가 없거나 허용하지 않으면 '듣기만' 할 수도 있어요
   - 🛡️ 채팅 약속 그대로: 🚫 추방 · 🔇 쉬기 · 🔒 쉬는 시간 · 선생님이 음성 채팅 끄기 · 선생님이 내보내기
   ===================================================================== */
const VOICE = {
  MAX: 8, STALE: 45000,
  ch: null, sess: null, me: null, stream: null, track: null, mic: false, peers: {}, mem: {}, unP: null, unS: null, hb: 0, tk: 0,
  ac: null, an: {}, speak: {}, lvT: 0, joining: false, confirmed: false, needTap: false, pt: 0,
  view: {ch: null, un: null, mem: {}},

  off(){ return !!(((Store.cls || {}).voice) || {}).off; },
  col(ch, n){ return Store.fs.collection(Store.db, "arcade", Store.cid, "voice", ch, n); },
  ice(){
    const l = [{urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"]}];
    const t = (Store.cls || {}).turn;
    if (t && t.urls){ const u = String(t.urls).split(/[\s,]+/).filter(x => /^turns?:/.test(x)); if (u.length) l.push({urls: u, username: t.u || "", credential: t.p || ""}); }
    return l;
  },
  chName(ch){ if (ch === "all") return "🌈 우리반 전체"; const r = CROOM.get(ch); return r ? `${r.dm ? "💌" : r.e || "💬"} ${CROOM.title(r)}` : "대화방"; },
  /* 왜 못 들어가는지 ("" = 들어갈 수 있어요) */
  why(ch){
    const me = ARC.me;
    if (me === null || me === undefined) return "로그인해야 해요";
    if (!LIVE.cloud()) return "🎙️ 음성 채팅은 선생님이 ☁️ Firebase로 연결한 반에서 쓸 수 있어요";
    if (!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return "🔒 이 주소(또는 브라우저)에서는 마이크를 쓸 수 없어요 (https 주소 · 크롬/사파리 최신)";
    if (!("RTCPeerConnection" in window)) return "😢 이 브라우저는 음성 채팅을 못 해요. 크롬이나 사파리 최신 버전으로 열어 주세요";
    if (isT(me)) return "";
    if (CHAT.banned(me)) return "🚫 채팅방에서 추방돼서 음성 채팅도 못 해요";
    if ((Store.cls || {}).closed) return "🔒 지금은 오락실 쉬는 시간이에요";
    if (this.off()) return "🤫 선생님이 음성 채팅을 잠깐 껐어요";
    const m = CHAT.muted(me); if (m) return `🔇 ${hhmm(m)}까지 채팅을 쉬어요`;
    if (ch && ch !== "all"){ const r = CROOM.get(ch); if (!r) return "방이 없어졌어요"; if (!CROOM.mine(r)) return "🙋 방에 들어가야 음성 채팅을 할 수 있어요"; }
    return "";
  },
  alive(mem){ const now = CLOCK.now(); return Object.keys(mem || {}).filter(sid => Math.abs(now - (mem[sid].at || 0)) < this.STALE); },
  micErr(e){
    const n = (e && e.name) || "";
    if (n === "NotAllowedError" || n === "SecurityError" || n === "PermissionDeniedError") return "🎤 마이크 사용이 '허용 안 함'으로 되어 있어요.\n주소창 왼쪽 🔒(또는 ⓘ)을 눌러 마이크를 '허용'으로 바꾸고 다시 눌러 주세요.\n(아이패드·아이폰: 설정 → Safari(또는 Chrome) → 마이크 → 허용)";
    if (n === "NotFoundError" || n === "DevicesNotFoundError" || n === "OverconstrainedError") return "🎤 이 기기에서 마이크를 찾지 못했어요.";
    if (n === "NotReadableError" || n === "TrackStartError" || n === "AbortError") return "🎤 다른 앱(카메라·통화·녹음)이 마이크를 쓰고 있어요. 그 앱을 닫고 다시 눌러 주세요.";
    return "🎤 마이크를 켜지 못했어요. (" + (n || (e && e.message) || "알 수 없음") + ")";
  },

  /* ---------- 들어가기 · 나가기 ---------- */
  async join(ch){
    if (this.joining) return;
    ch = ch || this.viewCh() || "all";
    const w = this.why(ch); if (w) return toast(w);
    if (this.ch === ch) return;
    const now = this.view.ch === ch ? this.alive(this.view.mem).filter(s => s !== sidOf(ARC.me)) : [];
    if (now.length >= this.MAX && !isT(ARC.me)) return toast(`🎙️ 음성 채팅은 한 방에 ${this.MAX}명까지예요. 지금 꽉 찼어요! 대화방을 만들어 따로 이야기해 봐요`);
    if (this.ch) await this.leave(true);
    this.joining = true; this.paint();
    this.audioCtx();                       // 누른 순간에 소리 장치를 깨워요 (아이폰·아이패드는 꼭 이렇게)
    let stream = null, err = "";
    try {
      stream = await navigator.mediaDevices.getUserMedia({audio: {echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1}, video: false});
    } catch(e){ console.warn("[음성] 마이크", e); err = this.micErr(e); }
    this.joining = false;
    if (!stream && !confirm(err + "\n\n마이크 없이 친구들 말을 듣기만 할까요?")){ this.paint(); return; }
    if (this.why(ch)){ if (stream) stream.getTracks().forEach(t => t.stop()); this.paint(); return toast(this.why(ch)); }
    this.stream = stream; this.track = stream ? stream.getAudioTracks()[0] : null; this.mic = !!this.track;
    if (this.track){
      try { this.track.contentHint = "speech"; } catch(e) {}
      this.track.onended = () => { if (!this.ch) return; toast("🎤 마이크가 꺼졌어요. 다시 들어오면 켜져요"); this.track = null; this.mic = false; for (const s in this.peers) this.setSend(this.peers[s]); this.pub(); this.paint(); };
      this.level("me", stream);
    }
    this.ch = ch; this.sess = rid(8); this.me = sidOf(ARC.me); this.peers = {}; this.mem = {}; this.confirmed = false; this.needTap = false;
    const fs = Store.fs, my = this.sess;
    this.unP = fs.onSnapshot(this.col(ch, "p"), qs => { if (this.sess !== my) return; const o = {}; qs.forEach(d => o[d.id] = d.data()); this.mem = o; this.onMem(); }, e => console.warn("[음성]", e));
    this.unS = fs.onSnapshot(fs.query(this.col(ch, "s"), fs.where("t", "==", this.me)), qs => { if (this.sess !== my) return; qs.docChanges().forEach(c => { if (c.type === "added") this.onSig(c.doc); }); }, e => console.warn("[음성]", e));
    try { await this.pub(); this.confirmed = this.sess === my; }
    catch(e){ console.error(e); this.leave(true); return toast("⚠️ 음성 채팅에 들어가지 못했어요. 인터넷을 확인해 주세요"); }
    this.hb = setInterval(() => this.pub().catch(() => {}), 15000);   // 15초마다 '나 여기 있어요'
    this.tk = setInterval(() => this.tick(), 3000);
    try { tone(520, 780, .1, "triangle", .08); } catch(e) {}
    toast(this.mic ? `🎙️ ${this.chName(ch)} 음성 채팅에 들어왔어요! 🎧 이어폰을 끼면 소리가 울리지 않아요` : `🎧 ${this.chName(ch)} 음성 채팅을 듣고 있어요 (마이크 없음)`);
    this.paint();
  },
  pub(){ if (!this.ch) return Promise.resolve(); return Store.fs.setDoc(Store.fs.doc(this.col(this.ch, "p"), this.me), {no: ARC.me, s: this.sess, at: CLOCK.now(), mic: !!(this.track && this.mic)}); },
  async leave(quiet, msg){
    if (!this.ch) return;
    const ch = this.ch, me = this.me;
    clearInterval(this.hb); clearInterval(this.tk); this.hb = this.tk = 0;
    if (this.unP) this.unP(); if (this.unS) this.unS(); this.unP = this.unS = null;
    for (const sid in this.peers) this.drop(sid);
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    this.unlevel("me");
    this.stream = this.track = null; this.mic = false; this.ch = null; this.sess = null; this.mem = {}; this.confirmed = false; this.needTap = false;
    this.paint();
    try { await Store.fs.deleteDoc(Store.fs.doc(this.col(ch, "p"), me)); } catch(e) {}
    if (msg) toast(msg); else if (!quiet) toast("📞 음성 채팅에서 나왔어요");
  },
  toggleMic(){
    if (!this.ch) return;
    if (!this.track) return toast("🎤 마이크 없이 듣기만 하고 있어요. 나갔다가 다시 들어와서 마이크를 허용해 주세요");
    if (!this.mic && !isT(ARC.me) && CHAT.muted(ARC.me)) return toast(this.why(this.ch));
    this.mic = !this.mic; this.track.enabled = this.mic;
    this.pub().catch(() => {}); this.paint();
  },
  /* 3초마다: 약속 확인 · 오래 조용한 친구 정리 */
  tick(){
    if (!this.ch) return;
    const w = this.why(this.ch);
    if (w && !/쉬어요/.test(w)) return this.leave(true, w);
    if (w && this.mic && this.track){ this.mic = false; this.track.enabled = false; this.pub().catch(() => {}); toast(w); }
    this.onMem();
  },

  /* ---------- 같은 방 친구들과 연결 ---------- */
  onMem(){
    if (!this.ch) return;
    const mine = this.mem[this.me];
    if (this.confirmed && !mine) return this.leave(true, "🧑‍🏫 선생님이 음성 채팅에서 내보냈어요");
    if (this.confirmed && mine && mine.s !== this.sess) return this.leave(true, "📱 다른 기기에서 음성 채팅에 들어가서 여기서는 나왔어요");
    const now = CLOCK.now(), want = {};
    for (const sid in this.mem){ const p = this.mem[sid]; if (sid !== this.me && Math.abs(now - (p.at || 0)) < this.STALE) want[sid] = p; }
    for (const sid in this.peers){ const P = this.peers[sid]; if (want[sid] ? want[sid].s !== P.rs : P.seen || Date.now() - P.born > 10000) this.drop(sid); else if (want[sid]) P.seen = 1; }   // 막 연결 쪽지가 온 친구는 잠깐 기다려 줘요
    for (const sid in want) if (!this.peers[sid]) this.peer(sid, want[sid].s, true).seen = 1;
    this.paint();
  },
  peer(sid, rs, start){
    let P = this.peers[sid];
    if (P && P.rs === rs) return P;
    if (P) this.drop(sid);
    P = this.peers[sid] = {sid, rs, born: Date.now(), offerer: this.me < sid, pc: null, tr: null, n: "", tries: 0, st: "new", t: 0, au: null, tuned: false};
    if (start){
      if (P.offerer) this.offer(P);
      else P.t = setTimeout(() => { if (this.peers[sid] === P && P.st !== "on") this.signal(P, {k: "r"}); }, 7000);   // 오래 연결이 안 오면 다시 걸어 달라고
    }
    return P;
  },
  mkPc(P){
    this.closePc(P);
    const pc = P.pc = new RTCPeerConnection({iceServers: this.ice(), bundlePolicy: "max-bundle", rtcpMuxPolicy: "require"});
    P.tuned = false;
    pc.ontrack = e => { if (P.pc === pc) this.play(P, (e.streams && e.streams[0]) || new MediaStream([e.track]), e.receiver); };
    pc.onconnectionstatechange = () => this.state(P, pc);
    pc.oniceconnectionstatechange = () => this.state(P, pc);
    return pc;
  },
  closePc(P){ const pc = P.pc; P.pc = null; P.tr = null; if (!pc) return; pc.ontrack = pc.onconnectionstatechange = pc.oniceconnectionstatechange = null; try { pc.close(); } catch(e) {} },
  up(pc){ return !!pc && (pc.connectionState === "connected" || pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed"); },
  state(P, pc){
    if (P.pc !== pc || this.peers[P.sid] !== P) return;
    const s = pc.connectionState, ice = pc.iceConnectionState;
    if (this.up(pc)){ P.st = "on"; P.tries = 0; clearTimeout(P.t); this.tune(P); }
    else if (s === "failed" || ice === "failed"){ P.st = "bad"; this.retry(P, 300); }
    else if (s === "disconnected" || ice === "disconnected"){ P.st = "wait"; this.retry(P, 4000); }   // 잠깐 흔들리는 건 기다려 봐요
    else if (s === "closed") return;
    else P.st = "new";
    this.paint();
  },
  retry(P, ms){
    clearTimeout(P.t);
    P.t = setTimeout(() => {
      if (this.peers[P.sid] !== P || !this.ch || this.up(P.pc)) return;
      if (P.offerer) this.offer(P); else this.signal(P, {k: "r"});
    }, ms + Math.min(8000, P.tries*1500));
  },
  gather(pc){ return new Promise(res => { if (pc.iceGatheringState === "complete") return res(); const t = setTimeout(res, 2500); pc.addEventListener("icegatheringstatechange", () => { if (pc.iceGatheringState === "complete"){ clearTimeout(t); res(); } }); }); },
  async offer(P){
    P.tries++; const n = P.n = rid(6), pc = this.mkPc(P);
    P.tr = pc.addTransceiver("audio", {direction: "sendrecv"}); this.setSend(P);
    try {
      await pc.setLocalDescription(await pc.createOffer());
      await this.gather(pc);
      if (P.pc !== pc) return;
      await this.signal(P, {k: "o", n, sdp: this.sdp(pc.localDescription.sdp)});
    } catch(e){ console.warn("[음성] 연결 걸기", e); }
    if (P.pc === pc) this.retry(P, 12000);
  },
  async answer(P, m){
    clearTimeout(P.t); P.n = m.n;
    const pc = this.mkPc(P);
    try {
      await pc.setRemoteDescription({type: "offer", sdp: m.sdp});
      P.tr = pc.getTransceivers()[0] || null;
      if (P.tr){ try { P.tr.direction = "sendrecv"; } catch(e) {} }
      this.setSend(P);
      await pc.setLocalDescription(await pc.createAnswer());
      await this.gather(pc);
      if (P.pc !== pc) return;
      await this.signal(P, {k: "a", n: m.n, sdp: this.sdp(pc.localDescription.sdp)});
    } catch(e){ console.warn("[음성] 연결 받기", e); }
    if (P.pc === pc) this.retry(P, 15000);
  },
  signal(P, o){
    if (!this.ch) return Promise.resolve();
    return Store.fs.addDoc(this.col(this.ch, "s"), Object.assign({f: this.me, fs: this.sess, t: P.sid, ts: P.rs || "", at: CLOCK.now()}, o)).catch(e => console.warn("[음성] 쪽지", e));
  },
  async onSig(d){
    const m = d.data(); Store.fs.deleteDoc(d.ref).catch(() => {});   // 읽은 쪽지는 바로 지워요
    if (!this.ch || !m || m.f === this.me) return;
    if (m.ts && m.ts !== this.sess) return;                          // 예전 연결에 온 쪽지
    if (Math.abs(CLOCK.now() - (m.at || 0)) > 60000) return;
    const P = this.peer(m.f, m.fs, false);
    if (m.k === "o"){ if (!P.offerer) await this.answer(P, m); }
    else if (m.k === "a"){
      if (P.offerer && P.n === m.n && P.pc && P.pc.signalingState === "have-local-offer")
        await P.pc.setRemoteDescription({type: "answer", sdp: m.sdp}).catch(e => { console.warn("[음성]", e); this.retry(P, 1000); });
    }
    else if (m.k === "r"){ if (P.offerer && !this.up(P.pc)) this.offer(P); }
  },
  /* 🎚️ 소리 품질: 말소리용 Opus · 손실 메우기(FEC) · 조용할 때 덜 보내기 */
  sdp(s){
    const m = /a=rtpmap:(\d+) opus\/48000/i.exec(s); if (!m) return s;
    const pt = m[1], re = new RegExp(`a=fmtp:${pt} ([^\\r\\n]*)`);
    const add = {useinbandfec: 1, stereo: 0, maxaveragebitrate: 32000, maxplaybackrate: 48000};
    if (re.test(s)) return s.replace(re, (all, p) => { const o = {}; p.split(";").forEach(kv => { const [k, v] = kv.split("="); if (k) o[k.trim()] = v; }); Object.assign(o, add); return `a=fmtp:${pt} ` + Object.keys(o).map(k => `${k}=${o[k]}`).join(";"); });
    return s.replace(m[0], m[0] + `\r\na=fmtp:${pt} ` + Object.keys(add).map(k => `${k}=${add[k]}`).join(";"));
  },
  setSend(P){ const s = P.tr && P.tr.sender; if (s) s.replaceTrack(this.track || null).catch(() => {}); },
  tune(P){
    if (P.tuned || !P.tr) return; P.tuned = true;
    try { const s = P.tr.sender, p = s.getParameters(); if (!p.encodings || !p.encodings.length) p.encodings = [{}]; Object.assign(p.encodings[0], {maxBitrate: 40000, priority: "high", networkPriority: "high"}); s.setParameters(p).catch(() => {}); } catch(e) {}
  },
  /* 🔊 친구 소리 틀기 */
  box(){ let b = document.getElementById("vcAudio"); if (!b){ b = document.createElement("div"); b.id = "vcAudio"; b.style.cssText = "position:fixed;width:0;height:0;overflow:hidden;left:-9px;top:-9px"; document.body.appendChild(b); } return b; },
  play(P, st, rcv){
    try { if (rcv){ if ("jitterBufferTarget" in rcv) rcv.jitterBufferTarget = 120; else if ("playoutDelayHint" in rcv) rcv.playoutDelayHint = .12; } } catch(e) {}   // 소리를 0.1초쯤 모아 두고 틀어서 뚝뚝 끊기지 않게
    let a = P.au;
    if (!a){ a = P.au = document.createElement("audio"); a.autoplay = true; a.playsInline = true; a.setAttribute("playsinline", ""); this.box().appendChild(a); }
    if (a.srcObject !== st) a.srcObject = st;
    const p = a.play(); if (p && p.catch) p.catch(() => { this.needTap = true; this.paint(); });
    this.level(P.sid, st);
  },
  unmute(){ this.needTap = false; this.audioCtx(); for (const s in this.peers){ const a = this.peers[s].au; if (a) a.play().catch(() => { this.needTap = true; }); } this.paint(); },
  drop(sid){
    const P = this.peers[sid]; if (!P) return;
    clearTimeout(P.t); this.closePc(P);
    if (P.au){ try { P.au.pause(); } catch(e) {} P.au.srcObject = null; P.au.remove(); }
    this.unlevel(sid); delete this.peers[sid];
  },

  /* ---------- 🟢 말하는 친구 표시 (소리 크기) ---------- */
  audioCtx(){
    try { if (!this.ac){ const C = window.AudioContext || window.webkitAudioContext; if (C) this.ac = new C(); } if (this.ac && this.ac.state === "suspended") this.ac.resume().catch(() => {}); } catch(e) {}
    return this.ac;
  },
  level(id, st){
    const ac = this.ac; if (!ac) return;
    this.unlevel(id);
    try { const src = ac.createMediaStreamSource(st), an = ac.createAnalyser(); an.fftSize = 512; an.smoothingTimeConstant = .3; src.connect(an); this.an[id] = {src, an, buf: new Uint8Array(an.fftSize), hold: 0}; } catch(e) {}
    if (!this.lvT) this.lvT = setInterval(() => this.levels(), 150);
  },
  unlevel(id){ const x = this.an[id]; if (x){ try { x.src.disconnect(); } catch(e) {} delete this.an[id]; } delete this.speak[id]; if (!Object.keys(this.an).length && this.lvT){ clearInterval(this.lvT); this.lvT = 0; } },
  levels(){
    let ch = false;
    for (const id in this.an){
      const x = this.an[id]; x.an.getByteTimeDomainData(x.buf);
      let m = 0; for (let i = 0; i < x.buf.length; i += 4){ const v = Math.abs(x.buf[i] - 128); if (v > m) m = v; }
      if (m > 9) x.hold = 3; else if (x.hold > 0) x.hold--;
      const on = x.hold > 0 && !(id === "me" && !this.mic);
      if (!!this.speak[id] !== on){ this.speak[id] = on; ch = true; }
    }
    if (ch) $$("[data-vsid]").forEach(el => { const id = el.dataset.vsid === this.me ? "me" : el.dataset.vsid; el.classList.toggle("sp", !!this.speak[id]); });
  },

  /* ---------- 지금 보고 있는 방의 음성 채팅 (안 들어가도 누가 있는지 보여요) ---------- */
  viewCh(){
    if (ARC.me === null || ARC.me === undefined || !LIVE.cloud() || $("#scrHome").hidden || LOBBY.tab !== "chat") return null;
    if (CHAT.banned(ARC.me) && !isT(ARC.me)) return null;
    return CROOM.mRid || "all";
  },
  watchView(){
    const ch = this.viewCh(), want = ch && ch !== this.ch ? ch : null;
    if (this.view.ch === want) return;
    if (this.view.un) this.view.un();
    this.view = {ch: want, un: null, mem: {}};
    if (want){ const v = this.view; v.un = Store.fs.onSnapshot(this.col(want, "p"), qs => { if (this.view !== v) return; const o = {}; qs.forEach(d => o[d.id] = d.data()); v.mem = o; this.paint(); }, e => console.warn("[음성]", e)); }
  },

  /* ---------- 🖼️ 화면 ---------- */
  face(sid, p, my){
    const P = this.peers[sid], wait = !my && this.ch && P && P.st !== "on", sp = this.speak[my ? "me" : sid];
    const no = p ? p.no : noOfSid(sid);
    return `<span class="vc-f${sp ? " sp" : ""}${wait ? " wait" : ""}${p && !p.mic ? " mute" : ""}" data-vsid="${sid}" title="${esc(who(no))}${wait ? " · 연결하는 중…" : ""}">${avHTMLof(sid, {still: true, face: true})}${p && !p.mic ? `<i>🔇</i>` : ""}</span>`;
  },
  list(mem, joined){
    const ids = this.alive(mem);
    if (joined && !ids.includes(this.me)) ids.unshift(this.me);
    return ids.sort((a, b) => (a === this.me ? -1 : b === this.me ? 1 : 0)).map(sid => ({sid, p: sid === this.me && joined ? {no: ARC.me, mic: !!(this.track && this.mic)} : mem[sid]}));
  },
  paint(){ if (this.pt) return; this.pt = requestAnimationFrame(() => { this.pt = 0; this.draw(); }); },
  draw(){
    this.watchView();
    const bar = $("#vcBar"); if (bar) this.drawBar(bar);
    this.drawPill();
  },
  drawBar(bar){
    const ch = this.viewCh();
    if (!ch){ bar.hidden = true; return; }
    bar.hidden = false;
    const T = isT(ARC.me), here = this.ch === ch, why = this.why(ch);
    let h;
    if (here){
      const L = this.list(this.mem, true), bad = Object.values(this.peers).filter(P => P.st !== "on").length;
      h = `<div class="vc-row on"><span class="vc-t">🟢 음성 연결됨<small>${L.length}명${bad ? ` · 🔄 ${bad}명 연결 중` : ""}</small></span>
        <div class="vc-ppl">${L.map(x => this.face(x.sid, x.p, x.sid === this.me) + (T && x.sid !== this.me ? `<button class="vc-kick" data-vkick="${x.sid}" title="음성 채팅에서 내보내기">✕</button>` : "")).join("")}</div>
        <div class="vc-acts">${this.needTap ? `<button class="vc-b tap" data-va="tap">🔈 소리 켜기</button>` : ""}<button class="vc-b ${this.track && this.mic ? "mic" : "off"}" data-va="mic">${!this.track ? "🎧 듣기만" : this.mic ? "🎤 켜짐" : "🔇 꺼짐"}</button><button class="vc-b end" data-va="leave">📞 나가기</button></div></div>`;
    } else {
      const L = this.list(this.view.mem, false), full = L.length >= this.MAX && !T;
      h = `<div class="vc-row"><span class="vc-t">🎙️ 음성 채팅<small>${L.length ? `${L.length}명 이야기하는 중` : "아직 아무도 없어요"}</small></span>
        <div class="vc-ppl">${L.map(x => this.face(x.sid, x.p, false) + (T ? `<button class="vc-kick" data-vkick="${x.sid}" data-vch="${esc(ch)}" title="음성 채팅에서 내보내기">✕</button>` : "")).join("")}</div>
        <div class="vc-acts">${why ? `<small class="vc-why">${esc(why)}</small>` : full ? `<small class="vc-why">꽉 찼어요 (${this.MAX}명)</small>` : `<button class="vc-b go" data-va="join"${this.joining ? " disabled" : ""}>${this.joining ? "🎤 마이크 켜는 중…" : this.ch ? "🎙️ 여기로 옮기기" : "🎙️ 참여하기"}</button>`}</div></div>`;
    }
    if (bar._h !== h){ bar._h = h; bar.innerHTML = h; }
  },
  drawPill(){
    let el = $("#vcPill");
    const show = !!this.ch && !(this.viewCh() === this.ch && !document.body.classList.contains("arc-playing"));
    if (!show){ if (el) el.hidden = true; return; }
    if (!el){
      el = document.createElement("div"); el.id = "vcPill"; document.body.appendChild(el);
      ["pointerdown", "touchstart", "mousedown", "keydown"].forEach(ev => el.addEventListener(ev, e => e.stopPropagation()));
      el.onclick = e => this.click(e);
    }
    el.hidden = false;
    const L = this.list(this.mem, true);
    const h = `<button class="vc-go" data-va="open" title="${esc(this.chName(this.ch))} 음성 채팅">🎙️<b>${L.length}</b></button><div class="vc-ppl">${L.slice(0, 5).map(x => this.face(x.sid, x.p, x.sid === this.me)).join("")}</div>${this.needTap ? `<button class="vc-b tap" data-va="tap">🔈</button>` : ""}<button class="vc-b ${this.track && this.mic ? "mic" : "off"}" data-va="mic" title="마이크">${!this.track ? "🎧" : this.mic ? "🎤" : "🔇"}</button><button class="vc-b end" data-va="leave" title="나가기">📞</button>`;
    if (el._h !== h){ el._h = h; el.innerHTML = h; }
  },
  click(e){
    const k = e.target.closest("[data-vkick]");
    if (k){ e.stopPropagation(); return this.kick(k.dataset.vkick, k.dataset.vch || this.ch); }
    const b = e.target.closest("[data-va]"); if (!b) return;
    e.stopPropagation();
    const a = b.dataset.va;
    if (a === "join") this.join(this.viewCh());
    else if (a === "leave") this.leave();
    else if (a === "mic") this.toggleMic();
    else if (a === "tap") this.unmute();
    else if (a === "open" && !document.body.classList.contains("arc-playing")){ CROOM.select(this.ch); LOBBY.setTab("chat"); }
    if (this.needTap) this.unmute();
  },
  kick(sid, ch){
    if (!isT(ARC.me) || !ch) return;
    if (!confirm(`${who(noOfSid(sid))}을(를) 음성 채팅에서 내보낼까요?`)) return;
    Store.fs.deleteDoc(Store.fs.doc(this.col(ch, "p"), sid)).then(() => toast("🎙️ 음성 채팅에서 내보냈어요")).catch(e => alert("내보내지 못했어요: " + (e.message || e)));
  }
};

/* ---------- 연결: 화면 · 로그아웃 · 선생님 관리 ---------- */
(function(){
  const st = document.createElement("style"); st.textContent = `
#vcBar{flex:none;padding:6px 10px 2px}
#vcBar[hidden],#vcPill[hidden]{display:none}
.vc-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:6px 8px 6px 12px}
.vc-row.on{background:rgba(64,192,87,.12);border-color:rgba(105,219,124,.45)}
.vc-t{display:flex;flex-direction:column;font:15px "Jua",sans-serif;color:#fff;line-height:1.15}
.vc-t small{font:11.5px "Gowun Dodum",sans-serif;color:#b9b0dd}
.vc-ppl{flex:1 1 110px;min-width:0;display:flex;align-items:center;gap:4px;overflow-x:auto;scrollbar-width:none;padding:3px 2px}
.vc-ppl::-webkit-scrollbar{display:none}
.vc-f{position:relative;flex:none;width:30px;height:30px;border-radius:50%;box-shadow:0 0 0 2px rgba(255,255,255,.12);transition:box-shadow .12s}
.vc-f .avs,.vc-f svg{width:100%;height:100%;border-radius:50%;display:block}
.vc-f.sp{box-shadow:0 0 0 3px #69db7c,0 0 12px #69db7c}
.vc-f.wait{opacity:.45}
.vc-f.wait::after{content:"";position:absolute;inset:-3px;border-radius:50%;border:2px solid transparent;border-top-color:#ffd43b;animation:vcSpin 1s linear infinite}
@keyframes vcSpin{to{transform:rotate(360deg)}}
.vc-f i{position:absolute;right:-4px;bottom:-4px;font-size:11px;font-style:normal;background:#1b1340;border-radius:50%;width:16px;height:16px;display:grid;place-items:center}
.vc-kick{flex:none;margin-left:-8px;width:16px;height:16px;border-radius:50%;border:0;background:#ff6b6b;color:#fff;font-size:9px;line-height:16px;padding:0;cursor:pointer;align-self:flex-start}
.vc-acts{display:flex;gap:6px;align-items:center;flex:none}
.vc-b{border:0;border-radius:999px;padding:7px 12px;font:14px "Jua",sans-serif;color:#fff;cursor:pointer;background:rgba(255,255,255,.12);-webkit-tap-highlight-color:transparent;white-space:nowrap}
.vc-b:disabled{opacity:.6}
.vc-b.go{background:linear-gradient(160deg,#51cf66,#2b8a3e)}
.vc-b.mic{background:linear-gradient(160deg,#51cf66,#2b8a3e)}
.vc-b.off{background:#495057}
.vc-b.end{background:linear-gradient(160deg,#ff6b6b,#c92a2a)}
.vc-b.tap{background:#f59f00;animation:vcPulse 1s ease-in-out infinite}
@keyframes vcPulse{50%{transform:scale(1.07)}}
.vc-why{font:12px "Gowun Dodum",sans-serif;color:#ffd8a8;max-width:220px;text-align:right}
#vcPill{position:fixed;right:max(12px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));z-index:930;display:flex;align-items:center;gap:6px;background:rgba(20,15,46,.94);border:1px solid rgba(105,219,124,.5);border-radius:999px;padding:5px 6px 5px 8px;box-shadow:0 8px 24px rgba(0,0,0,.45);color:#fff;max-width:calc(100vw - 24px)}
#vcPill .vc-go{border:0;background:none;color:#fff;font:16px "Jua",sans-serif;display:flex;align-items:center;gap:3px;cursor:pointer;padding:0 2px}
#vcPill .vc-go b{font-weight:400;font-size:13px;color:#69db7c}
#vcPill .vc-ppl{flex:none;max-width:150px}
#vcPill .vc-f{width:24px;height:24px}
#vcPill .vc-b{padding:6px 9px;font-size:15px}
@media (max-width:700px){
  #vcPill{bottom:calc(64px + 12px + env(safe-area-inset-bottom))}
  #vcBar{padding:4px 16px 2px}
  .vc-acts{margin-left:auto}
}
body.arc-playing #vcPill{right:auto;left:max(8px,env(safe-area-inset-left));top:calc(50% + 32px);bottom:auto;padding:3px 4px;opacity:.92}
body.arc-playing #vcPill .vc-ppl{max-width:84px}
body.ch-kb #vcPill{display:none}`;
  document.head.appendChild(st);

  // 💬 채팅 칸 위에 음성 막대
  const hook = () => {
    const pane = $("#paneChat"); if (!pane || $("#vcBar")) return;
    const bar = document.createElement("div"); bar.id = "vcBar"; bar.hidden = true;
    const hd = $("#crHd"); if (hd && hd.parentNode === pane) hd.after(bar); else pane.prepend(bar);
    bar.onclick = e => VOICE.click(e);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hook); else hook();

  LIVE.subs.push(k => { if (k.on || k.croom || k.rooms || k.tick) VOICE.paint(); });
  Store.subs.push(() => VOICE.paint());
  const stb = LOBBY.setTab; LOBBY.setTab = function(){ const r = stb.apply(this, arguments); VOICE.paint(); return r; };
  const sel = CROOM.select; CROOM.select = function(){ const r = sel.apply(this, arguments); VOICE.paint(); return r; };
  const lo = ARC.logout; ARC.logout = function(){ VOICE.leave(true); return lo.apply(this, arguments); };
  const hm = ARC.home; ARC.home = function(){ const r = hm.apply(this, arguments); VOICE.paint(); return r; };
  new MutationObserver(() => VOICE.paint()).observe(document.body, {attributes: true, attributeFilter: ["class"]});
  addEventListener("pagehide", () => { if (VOICE.ch) VOICE.leave(true); });
  // 화면을 다시 보면 멈춘 소리를 다시 틀어요 (아이패드가 잠깐 잠들었다 깰 때)
  document.addEventListener("visibilitychange", () => { if (!document.hidden && VOICE.ch){ VOICE.audioCtx(); for (const s in VOICE.peers){ const a = VOICE.peers[s].au; if (a && a.paused) a.play().catch(() => { VOICE.needTap = true; VOICE.paint(); }); } VOICE.pub().catch(() => {}); VOICE.onMem(); } });

  // 🌐 대결·협동 게임 연결에도 선생님이 넣은 TURN 서버를 같이 써요 (학교 와이파이가 기기끼리 연결을 막을 때)
  try { Object.defineProperty(NET, "ICE", {get(){ return VOICE.ice(); }, configurable: true}); } catch(e) {}

  // 🛠️ 선생님 관리 → 💬 채팅 관리에 🎙️ 음성 채팅 칸
  const rd = ADMIN.render;
  ADMIN.render = function(tab, body){
    rd.call(this, tab, body);
    if (tab !== "chat") return;
    const c = Store.cls || {}, t = c.turn || {};
    const sec = document.createElement("div"); sec.className = "ad-sec";
    sec.innerHTML = `<h4>🎙️ 음성 채팅</h4>
      ${this.sw("avOn", !VOICE.off(), "🎙️ 음성 채팅 켜기", "끄면 음성 채팅 중인 아이들도 바로 나가요. 🚫 추방 · 🔇 쉬기 중인 아이는 음성 채팅도 못 해요")}
      <p class="arc-small">아이들은 💬 채팅 칸 맨 위 <b>🎙️ 참여하기</b>를 눌러 들어와요 (한 방에 ${VOICE.MAX}명까지). 선생님 화면에서는 얼굴 옆 <b>✕</b>로 내보낼 수 있어요.<br>
      교실처럼 가까이 모여 있으면 소리가 울릴 수 있어요 → <b>🎧 이어폰</b>을 쓰면 깨끗해요.</p>
      <details class="arc-how"><summary>🔌 학교 와이파이에서 음성이 연결되지 않을 때 (TURN 서버, 선택)</summary>
        <p class="arc-small">학교 와이파이가 기기끼리 직접 연결을 막아 두면 소리가 안 들릴 수 있어요. 그럴 때 TURN 서버(예: Metered·Twilio 무료 계정) 정보를 넣으면 그 서버를 거쳐 이어져요. 대결·협동 게임 연결에도 같이 써요.</p>
        <div class="ad-in"><input id="avTurnU" value="${esc(t.urls || "")}" placeholder="turn:주소:3478, turns:주소:443 (쉼표로 여러 개)"></div>
        <div class="ad-in"><input id="avTurnN" value="${esc(t.u || "")}" placeholder="사용자 이름 (username)"><input id="avTurnP" value="${esc(t.p || "")}" placeholder="비밀번호 (credential)"><button class="arc-btn" id="avTurnSave">💾 저장</button></div>
      </details>`;
    body.appendChild(sec);
    $("#avOn").onchange = e => this.patch({voice: {off: !e.target.checked}}, e.target.checked ? "🎙️ 음성 채팅을 켰어요" : "🤫 음성 채팅을 껐어요");
    $("#avTurnSave").onclick = () => this.patch({turn: {urls: $("#avTurnU").value.trim(), u: $("#avTurnN").value.trim(), p: $("#avTurnP").value.trim()}}, "💾 TURN 서버를 저장했어요 (다음 연결부터 써요)");
  };
})();
