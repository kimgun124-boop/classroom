/* =====================================================================
   🤝 협동방 — 여럿이 하는 게임의 온라인 방을 홈 옆 패널 한곳에서 모아 봐요
   - 🛡️ 용사 대모험 · 🌥️ 하늘 무사단 · 🫧 버블 특공대 (협동) + 💦 물풍선 대작전 (여럿이 대결)
   - 방 만들기 → 그 게임의 방이 바로 열리고, 친구 방은 눌러서 바로 들어가요
   - 빈자리는 🤖 동료로 채울 수 있어요 (게임마다 다름) · 선생님이 🛠️ 관리자에서 끄고 켜요
   ⚡ 렉 줄이기
   - 방 목록 듣기(Firebase)는 홈 화면이 보일 때 딱 하나만 켜요.
     게임을 하는 중이나 게임 창(방 안)이 열려 있을 때는 꺼서, 놀이 화면에 일을 더하지 않아요.
   - 목록이 바뀌어도 패널 글자가 같으면 다시 그리지 않아요 (LOBBY.put).
   - 게임 안에서는 방장 기기가 심판, 친구 기기는 손가락만 보내요 (PARTY 그대로)
   ===================================================================== */
const COOP = {
  G: ["qd", "sk", "bs", "wb"], all: [], un: null, busyT: 0,
  games(){ return this.G.map(id => GAME[id]).filter(g => g && gameOn(g.id)); },
  coop(gid){ return gid !== "wb"; },
  max(gid){ return (PARTY.CFG[gid] || {max: 4}).max; },
  off(){ return !!(Store.cls || {}).coopOff; },
  ok(){ return PARTY.ok() && !this.off(); },
  /* 듣기가 필요할 때: 홈이 보이고 · 게임 중이 아니고 · 방 창이 닫혀 있을 때 */
  want(){ const md = $("#mdWb"); return this.ok() && ARC.me !== null && !ARC.busy && $("#ng").hidden && !$("#scrHome").hidden && (!md || md.hidden); },
  sync(){ if (this.want()) this.watch(); else this.unwatch(); },
  watch(){
    if (this.un) return; const fs = Store.fs;
    try {
      this.un = fs.onSnapshot(fs.query(PARTY.col(), fs.where("st", "==", "open")), qs => {
        const l = []; qs.forEach(d => l.push(Object.assign({id: d.id}, d.data()))); this.all = l;
        if (!$("#scrHome").hidden && !ARC.busy) LOBBY.renderSide();
      }, e => console.warn("[협동방]", e));
    } catch(e){ console.warn(e); this.un = null; }
  },
  unwatch(){ if (this.un){ try { this.un(); } catch(e) {} this.un = null; } },
  list(){
    if (!this.ok()) return [];
    const now = Date.now();
    return this.all.filter(r => { const g = r.g || "wb"; return this.G.includes(g) && gameOn(g) && now - (r.at || 0) < 90000 && r.host !== ARC.me; })
      .sort((a, b) => (this.full(a) - this.full(b)) || (this.coop(b.g || "wb") - this.coop(a.g || "wb")) || (b.at || 0) - (a.at || 0));
  },
  full(r){ return (r.n || 1) >= this.max(r.g || "wb"); },

  render(){
    const G = this.games();
    if (!PARTY.ok()){
      LOBBY.put("paneCoop", `<div class="ch-off">🤝 협동방(각자 기기로 함께하기)은 선생님이 <b>☁️ Firebase</b>로 연결한 반에서 쓸 수 있어요.<br><br>지금은 한 기기에서 친구와 둘이, 또는 🤖 동료와 함께 해요!</div>
        <div class="co-gs">${G.map(g => this.gBtn(g, "play")).join("")}</div>`); return;
    }
    if (this.off()){ LOBBY.put("paneCoop", `<div class="ch-off">⏸️ 선생님이 협동방을 잠깐 닫았어요.<br><small>한 기기에서 함께하기는 그대로 할 수 있어요</small></div><div class="co-gs">${G.map(g => this.gBtn(g, "play")).join("")}</div>`); return; }
    const L = this.list(), open = L.filter(r => !this.full(r));
    const card = r => { const g = GAME[r.g || "wb"], n = r.n || 1, mx = this.max(g.id), full = this.full(r);
      return `<div class="rm co g-${g.id}${full ? " full" : ""}">${avI(sidOf(r.host))}<div class="i"><b>${g.e} ${g.n}</b><small>방장 ${esc(who(r.host))} · ${agoTxt(r.at)}</small>
        <span class="co-n">${Array.from({length: mx}, (_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("")}<em>${n}/${mx}명</em></span></div>
        ${full ? `<span class="wt">꽉 찼어요</span>` : `<button class="arc-btn p" data-cjoin="${esc(r.id)}" data-h="${+r.host}" data-g="${g.id}">🤝 들어가기</button>`}</div>`; };
    LOBBY.put("paneCoop", `<div class="rm-new"><div class="t">🏠 협동방 만들기 <small style="font:13px 'Gowun Dodum',sans-serif;color:#b9b0dd">친구들이 들어오면 방장이 시작!</small></div>
        <div class="co-gs">${G.map(g => this.gBtn(g, "new")).join("") || "<small>지금 켜진 함께하기 게임이 없어요</small>"}</div></div>
      <div class="rm-h">🚪 들어갈 수 있는 방 ${open.length ? `(${open.length})` : ""}</div>
      ${L.length ? L.map(card).join("") : `<div class="rm-empty">아직 열린 협동방이 없어요.<br>먼저 방을 만들어 친구를 불러 봐요! 📣</div>`}
      <p class="co-tip">💡 같은 와이파이의 기기끼리 바로 연결돼요. 방장 기기가 심판이라 친구 기기는 손가락만 보내서 가벼워요.</p>`);
  },
  gBtn(g, k){ const mx = this.max(g.id); return `<button class="g-${g.id}" data-c${k}="${g.id}"><span class="f">${g.e}</span><b>${g.n}</b><small>${this.coop(g.id) ? `🤝 협동 · 최대 ${mx}명` : `🎉 대결 · 최대 ${mx}명`}</small></button>`; },

  /* 그 게임의 시작 창을 열고(방 칸 포함) → 방 만들기 / 들어가기 */
  openMenu(gid){ ARC.play(gid); const md = $("#mdWb"); return !!(md && !md.hidden && PARTY.gid === gid); },
  click(e){
    const n = e.target.closest("[data-cnew]"), p = e.target.closest("[data-cplay]"), j = e.target.closest("[data-cjoin]");
    if (Date.now() - this.busyT < 600) return; this.busyT = Date.now();
    if (p) ARC.play(p.dataset.cplay);
    else if (n){ const gid = n.dataset.cnew; if (!this.ok()) return; if (this.openMenu(gid) && !PARTY.role) PARTY.create(); }
    else if (j){ const gid = j.dataset.g, pid = j.dataset.cjoin, host = +j.dataset.h, r = this.all.find(x => x.id === pid);
      if (!r || Date.now() - (r.at || 0) > 90000){ toast("방이 없어졌어요. 다른 방을 골라 봐요"); return; }
      if (this.full(r)){ toast("벌써 꽉 찼어요"); return; }
      if (this.openMenu(gid) && !PARTY.role) PARTY.join(pid, host); }
    this.sync();
  },
  /* 🛠️ 선생님: 열린 협동방 모두 닫기 */
  async closeAll(){
    if (!PARTY.ok()) return 0; const fs = Store.fs, qs = await fs.getDocs(fs.query(PARTY.col(), fs.where("st", "in", ["open", "play"]))); let n = 0;
    const jobs = []; qs.forEach(d => { n++; jobs.push(fs.updateDoc(d.ref, {st: "closed"}).catch(() => {})); }); await Promise.all(jobs); return n;
  }
};
window.COOP = COOP;
(function(){
  /* 게임 창·방 창이 열리고 닫힐 때 듣기를 켜고 꺼요 */
  const later = () => setTimeout(() => COOP.sync(), 60);
  const play = ARC.play; ARC.play = function(...a){ const r = play.apply(this, a); later(); return r; };
  const ngPlay = NG.play; NG.play = function(...a){ COOP.unwatch(); return ngPlay.apply(this, a); };
  const ngClose = NG.close; NG.close = function(...a){ const r = ngClose.apply(this, a); later(); return r; };
  const leave = PARTY.leave; PARTY.leave = function(...a){ const r = leave.apply(this, a); later(); return r; };
  document.addEventListener("click", e => { if (e.target.closest("#mdWb [data-close]")) later(); }, true);
  /* 선생님이 협동방을 닫으면 게임 창 안의 🌐 온라인 방 칸도 닫혀요 */
  const rr = PARTY.renderRooms;
  PARTY.renderRooms = function(){
    if (COOP.off() && !this.role && PARTY.ok()){ const box = $("#wbRooms"); if (box) box.innerHTML = `<p class="arc-small">⏸️ 선생님이 협동방(온라인 방)을 잠깐 닫았어요. 위의 방법으로 함께 해요!</p>`; return; }
    return rr.apply(this, arguments);
  };
  const create = PARTY.create; PARTY.create = function(...a){ if (COOP.off()){ toast("⏸️ 선생님이 협동방을 잠깐 닫았어요"); return; } return create.apply(this, a); };
  const join = PARTY.join; PARTY.join = function(...a){ if (COOP.off()){ toast("⏸️ 선생님이 협동방을 잠깐 닫았어요"); return; } return join.apply(this, a); };
  window.addEventListener("pagehide", () => COOP.unwatch());
  const css = document.createElement("style");
  css.textContent = `.co-gs{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:8px}
.co-gs button{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:8px;align-items:center;text-align:left;padding:9px 10px;border-radius:14px;border:2px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);color:#fff;cursor:pointer;min-width:0}
.co-gs button:hover{background:rgba(255,255,255,.14);border-color:#ffd43b}
.co-gs .f{grid-row:1/3;font-size:28px}.co-gs b{font:16px "Jua",sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.co-gs small{font:12px "Gowun Dodum",sans-serif;color:#c5b8ff}
.rm.co .co-n{display:flex;align-items:center;gap:3px;margin-top:3px}.rm.co .co-n i{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.18)}.rm.co .co-n i.on{background:#69db7c}
.rm.co .co-n em{font:12px "Gowun Dodum",sans-serif;font-style:normal;color:#c5b8ff;margin-left:4px}.rm.co.full{opacity:.55}
.co-tip{font:12px "Gowun Dodum",sans-serif;color:#a79fd0;margin:12px 2px 0;line-height:1.5}`;
  document.head.appendChild(css);
})();
