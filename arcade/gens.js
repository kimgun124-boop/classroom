/* =====================================================================
   🎓 기수 (2026.11.26) — 우리 반 아이들을 1기, 2기…로 이어 가요
   - 지금 반 = cls.gen 기 (처음엔 1기) · 이름표: cls.genLabel (예: "2026학년도 6학년 4반")
   - 🎓 새 기수 시작: 지금 기수의 명단·캐릭터·랭킹 기록·코인·아이템을 통째로 🏛️ 보관함에 옮기고,
     새 명단으로 깨끗하게 시작해요 (새 비밀번호도 만들어요)
       ☁️ arcade/{반}/gens/g{기수}            ← 명단 · 캐릭터 · 랭킹 기록 · 아이들 코인 요약
       ☁️ arcade/{반}/gens/g{기수}/kids/{sid}  ← 아이들 지갑 통째로 (코인·산 아이템·카드…)
       💻 이 기기에만: localStorage  arcade.v1.gens.{반}
   - 번호가 같아도 1기 친구의 코인·기록이 2기 친구에게 넘어가지 않아요
   - 1기 친구 기기는 새 기수가 시작되면 저절로 로그아웃돼요 (2기 명단으로 잘못 들어가지 않게)
   ===================================================================== */
const GENS = {
  cur(){ return (Store.cls && +Store.cls.gen) || 1; },
  name(n = this.cur()){ return `${n}기`; },
  gk(){ return `${KEY}.gen.${(Store.cls && Store.cls.cid) || "local"}`; },
  dev(){ const v = localStorage.getItem(this.gk()); return v ? +v : 1; },
  mark(){ try { localStorage.setItem(this.gk(), String(this.cur())); } catch(e){} },
  /* 이 기기에 로그인한 친구가 지난 기수 친구면 로그아웃 (선생님은 그대로) */
  check(){
    if (!Store.cls || typeof ARC === "undefined" || ARC.me === null || ARC.me === undefined || +ARC.me === TEACHER) return false;
    if (this.dev() === this.cur()) return false;
    localStorage.removeItem(KEY + ".me"); this.mark();
    if (!this._bye){ this._bye = 1; toast(`🎓 ${this.name()}가 시작됐어요! 새 명단으로 다시 로그인해 주세요`); setTimeout(() => location.reload(), 1500); }
    return true;
  },
  /* 명단 글 → [{no, name}] ("번호 이름" 한 줄에 한 명, 번호가 없으면 차례대로) */
  parse(txt){
    const L = []; let k = 0;
    txt.split(/\n/).map(s => s.trim()).filter(Boolean).forEach(s => { const m = s.match(/^(\d{1,3})\s*[.)번:\-]?\s*(.*)$/);
      if (m){ k = +m[1]; L.push({no: k, name: (m[2] || "").trim() || `${k}번`}); } else { k++; L.push({no: k, name: s}); } });
    return L;
  },
  /* 지난 기수 목록 (반 정보에 요약만) */
  list(){ return ((Store.cls && Store.cls.gens) || []).slice().sort((a, b) => b.n - a.n); },
  lk(){ return `${KEY}.gens.${(Store.cls && Store.cls.cid) || "local"}`; },
  async load(n){
    if (Store.mode !== "cloud"){ try { return (JSON.parse(localStorage.getItem(this.lk())) || {})["g" + n] || null; } catch(e){ return null; } }
    const fs = Store.fs, d = await fs.getDoc(fs.doc(Store.db, "arcade", Store.cid, "gens", "g" + n)); if (!d.exists()) return null;
    const A = d.data(), ks = await fs.getDocs(fs.collection(Store.db, "arcade", Store.cid, "gens", "g" + n, "kids")); A.kids = {}; ks.forEach(x => A.kids[x.id] = x.data()); return A;
  },
  /* 🎓 새 기수 시작 */
  async start(roster, label){
    const cls = Store.cls, n = this.cur(), cid = cls.cid;
    const arc = {n, label: cls.genLabel || "", name: cls.name || "", roster: cls.roster || [], faces: cls.faces || {}, recs: JSON.parse(JSON.stringify(Store.recs || {})), at: Date.now(), from: cls.genAt || null};
    const kids = JSON.parse(JSON.stringify(Store.kids || {}));
    arc.sum = Object.fromEntries(Object.entries(kids).map(([sid, w]) => [sid, {coins: w.coins || 0, total: w.total || 0}]));
    // 새 반 정보: 명단·비밀번호·캐릭터·채팅 금지 같은 '학생마다' 칸은 새로
    const nc = JSON.parse(JSON.stringify(cls)), np = {};
    nc.roster = roster; nc.pw = {}; nc.faces = {}; nc.facePicked = {};
    ["chatBan", "ban", "kick", "mute"].forEach(k => { if (k in nc) nc[k] = {}; });
    roster.forEach(s => { const p = pin4(); np[s.no] = p; nc.pw[s.no] = sha256(`${cid}:${s.no}:${p}`); nc.faces[s.no] = FACES[(s.no - 1) % FACES.length]; });
    if ((cls.faces || {})[TEACHER]) nc.faces[TEACHER] = cls.faces[TEACHER];
    nc.gen = n + 1; nc.genLabel = label || ""; nc.genAt = Date.now();
    nc.gens = [...(cls.gens || []).filter(g => g.n !== n), {n, label: arc.label, count: arc.roster.length, at: arc.at, from: arc.from}];
    if (Store.mode === "cloud"){
      const fs = Store.fs, db = Store.db, root = fs.doc(db, "arcade", cid, "gens", "g" + n);
      await fs.setDoc(root, arc);                                                         // 1) 보관함에 먼저 (실패하면 아무것도 지우지 않아요)
      let b = fs.writeBatch(db), k = 0; const flush = async () => { if (k){ await b.commit(); b = fs.writeBatch(db); k = 0; } };
      for (const [sid, w] of Object.entries(kids)){ b.set(fs.doc(db, "arcade", cid, "gens", "g" + n, "kids", sid), w); if (++k >= 400) await flush(); }
      await flush();
      const ks = await fs.getDocs(fs.collection(db, "arcade", cid, "kids")), rs = await fs.getDocs(fs.collection(db, "arcade", cid, "recs"));   // 2) 지금 기록·지갑 비우기
      for (const d of [...ks.docs, ...rs.docs]){ b.delete(d.ref); if (++k >= 400) await flush(); }
      await flush();
      Store.kids = {}; Store.recs = {}; if (Store._raw) Store._raw = {};
    } else {
      let A = {}; try { A = JSON.parse(localStorage.getItem(this.lk())) || {}; } catch(e){}
      arc.kids = kids; A["g" + n] = arc;
      try { localStorage.setItem(this.lk(), JSON.stringify(A)); } catch(e){ throw new Error("이 기기 저장 공간이 모자라요"); }
      Store.kids = {}; Store.recs = {};
    }
    await Store.putClass(nc);                                                             // 3) 새 명단으로
    savePlain(cid, np); this.mark();
    return np;
  },

  /* ---------- 🛠️ 관리자: 🎓 기수 탭 ---------- */
  render(body){
    const cls = Store.cls, n = this.cur(), G = this.list(), kn = (cls.roster || []).length;
    const coins = Object.values(Store.kids || {}).reduce((a, w) => a + (w.total || 0), 0), games = Object.keys(Store.recs || {}).length;
    body.innerHTML = `
      <div class="gn-now"><div class="gn-big">🎓 지금은 <b>${n}기</b></div>
        <div class="gn-sub">${esc(cls.name || "")} · 친구 ${kn}명 · 기록이 있는 게임 ${games}개 · 모은 코인 ${coins.toLocaleString()}개${cls.genAt ? ` · ${new Date(cls.genAt).toLocaleDateString("ko-KR")}부터` : ""}</div>
        <label class="arc-f">${n}기 이름표 <small>보관함과 화면에 함께 보여요 (예: 2026학년도 6학년 4반)</small><span class="arc-row"><input id="gnLabel" value="${esc(cls.genLabel || "")}" maxlength="30" placeholder="예: 2026학년도 6학년 4반"><button class="arc-btn" id="gnLabelSave">💾 저장</button></span></label>
        <p class="arc-small">명단 고치기·비밀번호는 <b>👧 학생 · 비밀번호</b> 탭에서 해요. 이 탭은 해가 바뀌어 <b>새 친구들을 받을 때</b> 써요.</p></div>
      <div class="gn-box"><h4>🎓 ${n}기 졸업 · <b>${n + 1}기</b> 시작하기</h4>
        <ol class="gn-steps"><li>지금 ${n}기의 <b>명단 · 캐릭터 · 랭킹 기록 · 코인 · 산 아이템 · 카드</b>를 모두 🏛️ <b>보관함</b>에 옮겨요 (지워지지 않아요)</li>
          <li>보드게임은 <b>새 명단</b>으로 깨끗하게 시작해요 · 랭킹과 코인은 0부터 · <b>새 비밀번호</b>를 만들어요</li>
          <li>${n}기 친구 기기는 저절로 로그아웃돼요 · 게임 켜기/끄기 · 코인 규칙 · 반 입장 주소는 그대로예요</li></ol>
        <label class="arc-f">${n + 1}기 명단 <small>한 줄에 한 명씩 "번호 이름" (이름 대신 별명도 좋아요)</small><textarea id="gnRoster" rows="8" placeholder="1 김하늘&#10;2 이바다&#10;3 박구름"></textarea></label>
        <label class="arc-f">${n + 1}기 이름표 <input id="gnNewLabel" maxlength="30" placeholder="예: 2027학년도 6학년 4반"></label>
        <div class="arc-row"><button class="arc-btn p" id="gnStart">🎓 ${n + 1}기 시작하기</button></div></div>
      <div class="gn-box"><h4>🏛️ 지난 기수 보관함 <small>${G.length ? `${G.length}개` : "아직 없어요"}</small></h4>
        ${G.length ? `<div class="gn-list">${G.map(g => `<div class="gn-it"><b>${g.n}기</b><span>${esc(g.label || "")} · ${g.count}명${g.at ? ` · ${new Date(g.at).toLocaleDateString("ko-KR")} 졸업` : ""}</span><button class="arc-btn sm" data-view="${g.n}">👀 보기</button></div>`).join("")}</div><div id="gnView"></div>`
          : `<p class="arc-small">새 기수를 시작하면 지금 기수가 여기에 남아요. 명단·랭킹 1~3등·코인을 언제든 다시 볼 수 있어요.</p>`}</div>`;
    $("#gnLabelSave").onclick = async () => { await Store.patch({genLabel: $("#gnLabel").value.trim()}); toast("💾 이름표를 저장했어요"); };
    $("#gnStart").onclick = async () => {
      const R = this.parse($("#gnRoster").value);
      if (!R.length) return alert(`${n + 1}기 명단을 먼저 적어 주세요.`);
      if (new Set(R.map(s => s.no)).size !== R.length) return alert("같은 번호가 두 번 있어요.");
      const ask = prompt(`${n}기 친구 ${kn}명의 기록·코인을 🏛️ 보관함에 옮기고, ${n + 1}기 ${R.length}명으로 새로 시작해요.\n${n}기 친구 기기는 로그아웃돼요.\n\n계속하려면 "${n + 1}기 시작"이라고 적어 주세요.`);
      if (ask === null) return; if (ask.replace(/\s/g, "") !== `${n + 1}기시작`) return alert(`"${n + 1}기 시작"이라고 똑같이 적어야 해요.`);
      const btn = $("#gnStart"); btn.disabled = true; btn.textContent = "⏳ 보관함에 옮기는 중…";
      try { await this.start(R, $("#gnNewLabel").value.trim());
        toast(`🎉 ${n + 1}기를 시작했어요! 새 비밀번호 쪽지를 인쇄해 주세요`); ARC.teacher("kids");
        setTimeout(() => { if (confirm(`${n + 1}기 친구들의 새 비밀번호 쪽지를 지금 인쇄할까요?`)) printSlips(); }, 600);
      } catch(e){ console.error(e); alert("기수를 바꾸지 못했어요: " + (e.message || e) + "\n(지금 기수 자료는 그대로예요)"); btn.disabled = false; btn.textContent = `🎓 ${n + 1}기 시작하기`; }
    };
    body.querySelectorAll("[data-view]").forEach(b => b.onclick = () => this.view(+b.dataset.view));
  },
  async view(n){
    const el = $("#gnView"); el.innerHTML = `<p class="arc-small">⏳ ${n}기 보관함을 여는 중…</p>`;
    const A = await this.load(n).catch(e => { console.error(e); return null; }); if (!A){ el.innerHTML = `<p class="arc-small">보관함을 열지 못했어요.</p>`; return; }
    const nm = sid => { const s = (A.roster || []).find(x => "n" + x.no === sid); return s ? `${s.no}. ${esc(s.name)}` : sid === "n0" ? "선생님" : sid; };
    const top = GAMES.filter(g => A.recs && A.recs[g.id]).map(g => { const R = Object.entries(A.recs[g.id]).filter(([sid]) => sid !== "n0");
      const L = g.kind === "duel" ? R.filter(([, r]) => (r.w || 0) > 0).sort((a, b) => (b[1].w || 0) - (a[1].w || 0)).slice(0, 3).map(([sid, r]) => `${nm(sid)} <small>${r.w}승</small>`)
                                  : R.filter(([, r]) => (r.best || 0) > 0).sort((a, b) => (b[1].best || 0) - (a[1].best || 0)).slice(0, 3).map(([sid, r]) => `${nm(sid)} <small>${(r.best || 0).toLocaleString()}</small>`);
      return L.length ? `<div class="gn-g"><b>${g.e} ${esc(g.n)}</b>${L.map((t, i) => `<span>${["🥇", "🥈", "🥉"][i]} ${t}</span>`).join("")}</div>` : ""; }).join("");
    const S = A.sum || Object.fromEntries(Object.entries(A.kids || {}).map(([k, w]) => [k, {coins: w.coins || 0, total: w.total || 0}]));
    el.innerHTML = `<div class="gn-arc"><h4>🏛️ ${n}기 ${esc(A.label || "")} <small>${esc(A.name || "")} · ${(A.roster || []).length}명</small></h4>
      <div class="gn-ros">${(A.roster || []).map(s => `<span>${esc((A.faces || {})[s.no] || "🙂")} ${s.no}. ${esc(s.name)} <small>🪙 ${((S["n" + s.no] || {}).total || 0).toLocaleString()}</small></span>`).join("")}</div>
      <h5>🏆 게임별 명예의 전당</h5><div class="gn-hof">${top || `<p class="arc-small">남은 기록이 없어요</p>`}</div>
      <p class="arc-small">🪙 옆 숫자는 ${n}기 동안 모은 코인이에요. 산 아이템·카드도 보관함에 그대로 남아 있어요.</p></div>`;
  },
  css(){ if ($("#gnCss")) return; const s = document.createElement("style"); s.id = "gnCss"; s.textContent = `
.gn-now{padding:12px 16px;border-radius:16px;background:linear-gradient(135deg,rgba(255,212,59,.14),rgba(177,151,252,.12));border:1px solid rgba(255,212,59,.4);margin-bottom:12px}
.gn-big{font:28px "Jua",sans-serif}.gn-big b{color:#ffe066}.gn-sub{font-size:14px;color:#c9c2ef;margin:4px 0 8px}
.gn-box{padding:12px 16px;border-radius:16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);margin:12px 0}
.gn-box h4,.gn-arc h4{margin:0 0 8px;font:21px "Jua",sans-serif}.gn-box h4 small,.gn-arc h4 small{font:14px "Gowun Dodum";color:#b9b0dd;margin-left:6px}
.gn-steps{margin:0 0 10px 18px;padding:0;font-size:14px;line-height:1.6;color:#ddd6ff}
.gn-list{display:flex;flex-direction:column;gap:6px}.gn-it{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:12px;background:rgba(255,255,255,.06)}
.gn-it b{font:20px "Jua";color:#ffe066;min-width:48px}.gn-it span{flex:1;font-size:14px;color:#ddd6ff}
.gn-arc{margin-top:12px;padding:12px;border-radius:14px;background:rgba(0,0,0,.2)}.gn-arc h5{margin:12px 0 6px;font:17px "Jua"}
.gn-ros{display:flex;flex-wrap:wrap;gap:6px}.gn-ros span{background:rgba(255,255,255,.07);border-radius:10px;padding:4px 10px;font-size:14px}.gn-ros small{color:#ffe066;margin-left:4px}
.gn-hof{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}.gn-g{background:rgba(255,255,255,.05);border-radius:12px;padding:8px 10px;font-size:13px;display:flex;flex-direction:column;gap:2px}
.gn-g b{font:15px "Jua";margin-bottom:2px}.gn-g small{color:#ffe066}`; document.head.appendChild(s); }
};
