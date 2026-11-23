/* =====================================================================
   🏫 학교 채널 (2026.11.23) — 한 Firebase 안에 반마다 따로 들어가는 채널(예: 6학년 1반~8반)
   - 반마다 자기 문서(arcade/{cid})를 따로 써요 → 랭킹·코인·채팅·대결방·접속 표시가 반끼리 섞이지 않고,
     한 반에 친구가 많아도 다른 반 화면은 느려지지 않아요
   - 선생님(만든 분)의 🛠️ 관리자 → 🏫 학교 채널에서 한 번에 만들고, 반마다 '선생님 안내장'(입장 주소·QR·선생님 비밀번호·학생 비밀번호 쪽지)을 인쇄해 나눠 드려요
   - 각 반 선생님은 안내장의 선생님 비밀번호로 들어가 👧 학생 탭에서 이름을 고치고, 🔑 비밀번호를 바꿔 써요
   - 반 고르기 주소(#school=…)를 열면 반 목록이 나와요 · 로그인 화면의 🏫 반 바꾸기로도 옮겨 갈 수 있어요
   ===================================================================== */
const SCHOOL = {
  LK: id => `${KEY}.school.${id}`,
  secret(id){ try { return JSON.parse(localStorage.getItem(this.LK(id))) || {}; } catch(e){ return {}; } },
  keep(id, o){ try { localStorage.setItem(this.LK(id), JSON.stringify(Object.assign(this.secret(id), o))); } catch(e){} },
  /* Firestore는 '배열 속 배열'을 못 넣어요 → 저장은 [{n, c}], 쓸 때는 [이름, cid] 짝으로 */
  pairs: l => (Array.isArray(l) ? l : []).map(x => Array.isArray(x) ? x : [x.n, x.c]),
  list(){ const s = Store.cls && Store.cls.school; return s ? this.pairs(s.l) : []; },
  cfg(){ const j = Store.join(); return j ? j.c : null; },
  joinOf(cid){ const c = this.cfg(); return c ? `${location.origin}${location.pathname}?s=2#join=${b64e({c, i: cid})}` : ""; },
  hubUrl(){ const c = this.cfg(), s = Store.cls && Store.cls.school; return c && s ? `${location.origin}${location.pathname}?s=2#school=${b64e({c, n: s.n, l: this.pairs(s.l)})}` : ""; },
  pin6: () => String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000)),

  /* ---------- 🛠️ 관리자 → 🏫 학교 채널 ---------- */
  render(body){
    const cls = Store.cls, sc = cls.school;
    if (!this.isOwner()){ body.innerHTML = `<h3>🏫 학교 채널</h3><p>학교 채널(반 만들기 · 안내장 · 비밀번호)은 <b>채널을 만든 총관리자 선생님</b>만 관리해요. 우리 반 학생·비밀번호·코인은 다른 탭에서 관리하면 돼요.</p>`; return; }
    if (Store.mode !== "cloud"){ body.innerHTML = `<h3>🏫 학교 채널</h3><p>학교 채널은 <b>☁️ Firebase에 연결된 보드게임</b>에서만 만들 수 있어요. 먼저 <b>☁️ 저장</b> 탭에서 연결해 주세요.</p>`; return; }
    if (!sc){
      body.innerHTML = `<h3>🏫 학교 채널 만들기</h3>
        <p>같은 학년의 다른 반 선생님들도 <b>반마다 따로</b> 보드게임을 쓸 수 있게, 반 채널을 한 번에 만들어요.
          반마다 랭킹·코인·채팅·대결방이 <b>따로</b> 돌아가서, 반이 많아져도 서로 섞이거나 느려지지 않아요.</p>
        <div class="sc-form">
          <label class="arc-f">학교 · 학년 이름 <input id="scN" value="${esc(cls.schoolName || "6학년")}" maxlength="20" placeholder="예) 6학년"></label>
          <label class="arc-f">반 수 <input id="scK" type="number" min="2" max="15" value="8" inputmode="numeric"></label>
          <label class="arc-f">우리 반은 몇 반? <input id="scMe" type="number" min="1" max="15" value="4" inputmode="numeric"><small>지금 이 보드게임(${esc(cls.name || "우리 반")})이 그 반 채널이 돼요 · 기록은 그대로예요</small></label>
          <label class="arc-f">반마다 학생 수 <input id="scS" type="number" min="1" max="40" value="25" inputmode="numeric"><small>처음엔 1번~25번으로 만들어 두고, 각 반 선생님이 이름을 고쳐요</small></label>
        </div>
        <div class="arc-row"><button class="arc-btn p" id="scGo">🏫 반 채널 만들기</button></div>
        <p class="arc-small">만들면 반마다 <b>입장 주소 · QR · 선생님 비밀번호 · 학생 비밀번호 쪽지</b>가 든 안내장을 인쇄할 수 있어요. 비밀번호는 이 기기에만 기억해요(Firebase에는 암호처럼 바꿔 저장).</p>`;
      $("#scGo").onclick = () => this.create();
      return;
    }
    const sec = this.secret(sc.id), hub = this.hubUrl();
    body.innerHTML = `<h3>🏫 학교 채널 · ${esc(sc.n || "")}</h3>
      <p class="arc-small">반마다 <b>따로</b> 들어가는 채널이에요. 각 반 선생님께 <b>🖨️ 안내장</b>을 드리면, 선생님 비밀번호로 🛠️ 관리자에 들어가 학생 이름을 고치고 쓰시면 돼요.</p>
      <div class="sc-list">${this.pairs(sc.l).map(([n, cid], i) => { const me = cid === cls.cid, pin = (sec.t || {})[cid];
        return `<div class="sc-r${me ? " me" : ""}" data-cid="${cid}"><b>🎲 ${esc(n)}</b>${me ? `<i>지금 이 반</i>` : ""}
          <span class="sc-pin">${me ? "선생님 비밀번호: (지금 쓰는 것)" : pin ? `🔑 선생님 비밀번호 <b>${pin}</b>` : "🔑 비밀번호는 만든 기기에만 있어요"}</span>
          <span class="bb"><button class="arc-btn sm" data-copy="${cid}">📋 입장 주소</button><button class="arc-btn sm" data-dl="${cid}">📥 파일</button><button class="arc-btn sm p" data-print="${cid}">🖨️ 안내장</button></span></div>`; }).join("")}</div>
      <div class="arc-row"><button class="arc-btn p" id="scDl">📥 선생님 안내 파일 받기 (전체)</button><button class="arc-btn p" id="scAll">🖨️ 모든 반 안내장 한꺼번에 인쇄</button><button class="arc-btn" id="scHub">🏫 모든 반 같은 주소 복사</button></div>
      <p class="arc-small">📥 <b>선생님 안내 파일</b>: 안내문 + 반마다 안내장(입장 주소·QR·선생님 비밀번호·학생 비밀번호)이 든 파일과, 엑셀에서 열리는 <b>비밀번호 표</b>를 받아요. 각 반 선생님께는 줄마다 있는 <b>📥 파일</b>(그 반 것만)을 보내 주세요.</p>
      <p class="arc-small">🏫 <b>모든 반이 같은 주소</b>(반 고르기 주소)를 써요. 열면 1반~8반 목록이 나와서 자기 반을 눌러 들어가요 · 각 반 선생님의 🔗 반 입장 주소 탭에도 이 주소가 나와요. 이 주소들은 우리 학교 안에서만 나눠 주세요.</p>
      <details class="arc-how"><summary>⚡ 반이 많을 때 꼭 확인해요 (Firebase 사용량)</summary><ul>
        <li>여러 반이 하루 종일 쓰면 Firebase <b>무료(Spark) 하루 읽기 5만 번</b>을 넘을 수 있어요. 넘으면 그날 밤(한국 오후 4~5시쯤 초기화)까지 기록이 안 올라가요.
          Firebase 콘솔 → ⚙️ 사용량 및 결제에서 <b>Blaze(쓴 만큼 결제)</b>로 바꾸면 끊기지 않아요 (무료 양은 그대로이고, 넘은 만큼만 아주 조금 내요). <b>예산 알림</b>도 꼭 걸어 두세요.</li>
        <li>같은 학교 와이파이에서 <b>처음 들어오는 기기</b>가 한 시간에 100대를 넘으면 잠깐 막힐 수 있어요 (Firebase 익명 로그인 한도). 처음 나눠 줄 때는 <b>반마다 시간을 나눠서</b> 들어오거나, 콘솔 → Authentication → 설정에서 <b>가입 한도를 잠깐 늘려</b> 두세요. 한 번 들어온 기기는 다시 세지 않아요.</li></ul></details>`;
    body.onclick = e => {
      const c = e.target.closest("[data-copy]"); if (c) return this.copy(this.joinOf(c.dataset.copy), "📋 반 입장 주소를 복사했어요");
      const p = e.target.closest("[data-print]"); if (p) return this.print([p.dataset.print]);
      const d = e.target.closest("[data-dl]"); if (d) return this.download([d.dataset.dl]);
    };
    $("#scAll").onclick = () => this.print(this.pairs(sc.l).map(x => x[1]));
    $("#scDl").onclick = () => this.download(this.pairs(sc.l).map(x => x[1]), true);
    $("#scHub").onclick = () => this.copy(hub, "📋 모든 반 같은 주소를 복사했어요");
  },
  copy(t, msg){ if (!t) return; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast(msg), () => prompt("복사해 주세요", t)); },

  async create(){
    const cls = Store.cls, n = ($("#scN").value || "").trim() || "우리 학교", K = Math.max(2, Math.min(15, +$("#scK").value | 0)),
      me = Math.max(1, Math.min(K, +$("#scMe").value | 0)), S = Math.max(1, Math.min(40, +$("#scS").value | 0));
    const grade = (n.match(/(\d+)\s*학년/) || [])[1];
    const nameOf = k => grade ? `${grade}학년 ${k}반` : `${n} ${k}반`;
    if (!confirm(`${n} 반 채널 ${K}개를 만들까요?\n(${me}반은 지금 이 보드게임 · 나머지 ${K - 1}개 반은 학생 ${S}명씩 새로 만들어요)`)) return;
    const id = "s" + rid(10), docs = [], tp = {}, l = [];
    for (let k = 1; k <= K; k++){
      if (k === me){ l.push([cls.name && !/^우리 ?반$/.test(cls.name) ? cls.name : nameOf(k), cls.cid]); continue; }
      const cid = rid(20), roster = Array.from({length: S}, (_, i) => ({no: i + 1, name: `${i + 1}번`})), pw = {}, plain = {}, faces = {}, pin = this.pin6();
      roster.forEach((s, i) => { plain[s.no] = pin4(); pw[s.no] = sha256(`${cid}:${s.no}:${plain[s.no]}`); faces[s.no] = FACES[i % FACES.length]; });
      const name = nameOf(k);
      docs.push({cid, plain, doc: {v: 1, cid, name, roster, faces, pw, admin: sha256(`${cid}:teacher:${pin}`)}});
      tp[cid] = pin; l.push([name, cid]);
    }
    const school = {id, n, own: cls.cid, l: l.map(([nm, c]) => ({n: nm, c}))};
    const b = $("#scGo"); b.disabled = true; b.textContent = "만드는 중…";
    this.keep(id, {t: tp}); docs.forEach(d => savePlain(d.cid, d.plain));
    try {
      const fs = Store.fs;
      for (const d of docs){ d.doc.school = school; await fs.setDoc(fs.doc(Store.db, "arcade", d.cid), d.doc); }
      await Store.patch({school, schoolName: n});
      toast(`🏫 반 채널 ${K}개를 만들었어요! 안내장을 인쇄해 각 반 선생님께 드려요`);
      ARC.teacher("school");
    } catch(e){ console.error(e); b.disabled = false; b.textContent = "🏫 반 채널 만들기"; alert("만들지 못했어요: " + (e.message || e)); }
  },

  /* ---------- 🖨️ 반마다 선생님 안내장 (입장 주소 · QR · 선생님 비밀번호 · 학생 비밀번호 쪽지) ---------- */
  /* 반마다 안내에 필요한 것 모으기: 이름 · 입장 주소 · QR · 선생님 비밀번호 · 학생 명단과 비밀번호 */
  async collect(cids){
    const sc = Store.cls.school, sec = this.secret(sc.id), fs = Store.fs, out = [], hub = this.hubUrl();
    let hqr = ""; try { hqr = hub ? await qrSvg(hub) : ""; } catch(e){}
    for (const cid of cids){
      const name = (this.pairs(sc.l).find(x => x[1] === cid) || [])[0] || "", url = hub || this.joinOf(cid), me = cid === Store.cls.cid;
      let roster = [];
      if (me) roster = Store.cls.roster;
      else try { const d = await fs.getDoc(fs.doc(Store.db, "arcade", cid)); if (d.exists()) roster = d.data().roster || []; } catch(e){ console.warn(e); }
      const plain = loadPlain(cid), pin = me ? "" : (sec.t || {})[cid] || "";
      let qr = hqr; if (!qr) try { qr = await qrSvg(url); } catch(e){}
      out.push({cid, name, url, me, pin, qr, kids: roster.map(k => ({no: k.no, name: k.name && k.name !== `${k.no}번` ? k.name : "", pw: plain[k.no] || ""}))});
    }
    return out;
  },
  html(D, o){
    const sc = Store.cls.school, hub = this.hubUrl(), pinTxt = c => c.me ? "(지금 쓰는 선생님 비밀번호)" : c.pin || "(만든 컴퓨터에서 확인)";
    const guide = o.guide ? `<section class="pg guide"><h1>🎲 우리반 보드게임 — 선생님 안내</h1><p class="sub">${esc(sc.n || "")} · 반 ${this.pairs(sc.l).length}개 · 반마다 따로 들어가는 채널이에요</p>
      <h3>무엇인가요?</h3><p>아이들이 각자 태블릿·크롬북으로 들어와 반 친구들과 함께 하는 학급 보드게임이에요. 게임으로 모은 코인으로 아바타를 꾸미고, 반마다 <b>랭킹 · 코인 · 채팅 · 대결방이 따로</b> 돌아가서 다른 반과 섞이지 않아요.</p>
      <h3>처음 한 번 (선생님, 5분)</h3><ol>
        <li>다음 장의 <b>보드게임 주소</b>(또는 QR, <b>모든 반 같은 주소</b>)를 교실 컴퓨터에서 열고, 반 고르기에서 <b>우리 반</b>을 눌러요.</li>
        <li>로그인 화면 아래 <b>🛠️ 관리자</b>를 누르고 <b>선생님 비밀번호(6자리)</b>를 넣어요.</li>
        <li><b>👧 학생 · 비밀번호</b> 탭에서 학생 이름(별명)을 고치고 <b>💾 저장</b>해요. 학생 수가 다르면 <b>➕ 학생 추가</b> / <b>✕</b>로 맞춰요.</li>
        <li><b>☁️ 저장 → 🔑 선생님 비밀번호 바꾸기</b>로 선생님만 아는 비밀번호로 바꿔요.</li>
        <li>같은 주소나 QR을 아이들에게 보여 줘요 (<b>🔗 반 입장 주소</b> 탭에도 있어요 · 클래스룸·학급 게시판 등 학교 안에서만).</li></ol>
      <h3>아이들은</h3><ol><li>보드게임 주소(또는 QR)로 <b>한 번만</b> 들어와 <b>우리 반</b>을 고르면, 다음부터는 같은 기기에서 바로 열려요. <b>📲 앱으로 설치</b>를 누르면 홈 화면 아이콘이 생겨요.</li>
        <li>자기 <b>번호</b>를 누르고 <b>비밀번호 4자리</b>(학생 쪽지)를 넣어요.</li>
        <li>다른 반 화면이 나오면 로그인 화면 아래 <b>🏫 반 바꾸기</b>로 우리 반을 골라요.</li></ol>
      <h3>선생님 화면에서 할 수 있는 것</h3><ul><li>📊 지금 누가 무엇을 하는지 · 💬 채팅 끄기/추방 · 🎮 게임별 문 닫기(수업 중 잠그기)</li>
        <li>🎁 수업 시간에 잘한 아이에게 코인·칭호 주기 · 🪙 하루 코인 한도 · 🏆 랭킹 지우기</li>
        <li>🔑 비밀번호를 잊은 아이는 👧 학생 탭에서 <b>🎲 새로 → 💾 저장</b>으로 다시 만들어 주면 돼요.</li></ul>
      <h3>꼭 지켜 주세요</h3><ul><li>선생님 비밀번호와 학생 비밀번호는 <b>우리 반 것만</b> 나눠 주세요. 보드게임 주소도 학교 안에서만 써요.</li>
        <li>처음 시작하는 날에는 같은 학교 와이파이에서 새 기기가 한꺼번에 많이 들어오면 잠깐 막힐 수 있어요. <b>반마다 시간을 나눠</b> 처음 접속해 주세요.</li></ul>
      ${hub ? `<p class="url">🏫 반 고르기 주소(반 목록이 나와요): ${esc(hub)}</p>` : ""}</section>` : "";
    const pages = D.map(c => `<section class="pg"><h1>🎲 ${esc(c.name)} 보드게임 <small>${esc(sc.n || "")}</small></h1>
        <div class="top"><div class="qr">${c.qr}</div><div><h2>🔑 선생님 비밀번호: <b>${esc(pinTxt(c))}</b></h2>
          <ol><li>교실 컴퓨터에서 아래 <b>보드게임 주소</b>(모든 반 같은 주소)를 열고 <b>반 고르기</b>에서 <b>${esc(c.name)}</b>을 눌러요 (또는 QR)</li>
            <li>로그인 화면 아래 <b>🛠️ 관리자</b> → 선생님 비밀번호</li>
            <li><b>👧 학생 · 비밀번호</b> 탭에서 이름(별명)을 고치고 <b>💾 저장</b> · 학생 수가 다르면 ➕/✕</li>
            <li><b>☁️ 저장 → 🔑 선생님 비밀번호 바꾸기</b>로 내 비밀번호로 바꿔요</li>
            <li>아이들도 같은 주소·QR로 들어와 <b>${esc(c.name)}</b>을 누르고 <b>번호 + 아래 비밀번호 4자리</b>로 로그인해요</li></ol>
          <p class="url">${esc(c.url)}</p></div></div>
        <div class="g">${c.kids.map(k => `<div class="s"><small>🎲 ${esc(c.name)} 보드게임</small><div><b>${k.no}번${k.name ? " " + esc(k.name) : ""}</b></div><div class="p">${k.pw || "____"}</div><small>친구에게 알려 주지 마세요!</small></div>`).join("")}</div></section>`).join("");
    return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(o.title || "우리반 보드게임 선생님 안내")}</title><style>
      body{font-family:"Malgun Gothic","Apple SD Gothic Neo",sans-serif;margin:8mm;color:#222}.pg{page-break-after:always;margin-bottom:24px}.pg:last-child{page-break-after:auto}
      h1{font-size:24px;margin:0 0 8px}h1 small{font-size:14px;color:#888;margin-left:8px}h2{font-size:20px;margin:0 0 6px}h2 b{letter-spacing:3px;color:#c2255c}h3{font-size:17px;margin:16px 0 4px;color:#5f3dc4}
      .guide p,.guide li{font-size:14px;line-height:1.7}.guide .sub{color:#777;margin-top:-4px}
      .top{display:flex;gap:16px;align-items:flex-start;border:2px solid #333;border-radius:12px;padding:12px;margin-bottom:10px}.qr{width:150px;flex:none}.qr svg{width:150px;height:150px}
      .top ol{margin:4px 0;padding-left:20px;font-size:13px;line-height:1.55}.url{font-size:9px;word-break:break-all;color:#555;margin:6px 0 0}
      .g{display:grid;grid-template-columns:repeat(5,1fr);gap:0}.s{border:1px dashed #999;padding:8px 4px;text-align:center;page-break-inside:avoid}.s b{font-size:15px}.s .p{font-size:22px;letter-spacing:4px;font-weight:bold;margin-top:2px}.s small{color:#666;font-size:10px}
    </style></head><body>${guide}${pages}${o.print ? `<script>setTimeout(()=>print(),400)<\/script>` : ""}</body></html>`;
  },
  csv(D){
    const q = v => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`, rows = [["반", "선생님 비밀번호", "번호", "이름", "학생 비밀번호", "보드게임 주소(모든 반 같음)"]];
    D.forEach(c => c.kids.forEach((k, i) => rows.push([c.name, i ? "" : (c.me ? "(지금 쓰는 것)" : c.pin), k.no, k.name, k.pw, i ? "" : c.url])));
    return "﻿" + rows.map(r => r.map(q).join(",")).join("\r\n");
  },
  save(name, text, type){ const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], {type})); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); },
  async print(cids){
    const w = window.open("", "_blank"); if (!w) return alert("팝업이 막혀 있어요. 팝업을 허용해 주세요.");
    w.document.write("<p style='font-family:sans-serif'>안내장을 만드는 중…</p>");
    const D = await this.collect(cids); w.document.open(); w.document.write(this.html(D, {print: true, title: "보드게임 반 채널 안내장"})); w.document.close();
  },
  /* 📥 파일로 받기: 안내문(+반마다 안내장) HTML 한 개 · 전체는 비밀번호 표(엑셀에서 열리는 CSV)도 함께 */
  async download(cids, all){
    toast("📥 안내 파일을 만드는 중…"); const D = await this.collect(cids), sc = Store.cls.school, base = (sc.n || "우리반").replace(/[\\/:*?"<>|\s]+/g, "_");
    const nm = all ? `${base}_보드게임_선생님_안내문(전체)` : `${D[0].name.replace(/\s+/g, "")}_보드게임_안내문`;
    this.save(nm + ".html", this.html(D, {guide: true, title: nm}), "text/html;charset=utf-8");
    if (all) setTimeout(() => this.save(`${base}_보드게임_비밀번호표(전체).csv`, this.csv(D), "text/csv;charset=utf-8"), 600);
    if (D.some(c => !c.me && !c.pin) || D.some(c => c.kids.some(k => !k.pw))) toast("⚠️ 이 컴퓨터에 없는 비밀번호는 빈칸(____)으로 나와요 · 반 채널을 만든 컴퓨터에서 받아 주세요");
    else toast("📥 안내 파일을 받았어요 (다운로드 폴더)");
  },

  /* ---------- 🏫 반 고르기 (반 고르기 주소 · 로그인 화면 '반 바꾸기') ---------- */
  pick(o){
    let el = $("#scPick"); if (!el){ el = document.createElement("div"); el.id = "scPick"; el.className = "sc-pick"; document.body.appendChild(el); }
    const cur = Store.cls ? Store.cls.cid : "";
    el.innerHTML = `<div class="sc-box"><h2>🏫 ${esc(o.n || "우리 학교")} 보드게임</h2><p>우리 반 채널을 눌러 들어가요${o.entry ? `<br><small>선생님도 자기 반으로 들어가 아래 🛠️ 관리자를 눌러요</small>` : ""}</p>
      <div class="sc-grid">${this.pairs(o.l).map(([n, cid]) => `<button data-cid="${cid}" class="${cid === cur && !o.entry ? "on" : ""}">🎲<b>${esc(n)}</b>${cid === cur && !o.entry ? "<small>지금 반</small>" : ""}</button>`).join("")}</div>
      ${o.close ? `<button class="arc-btn" data-x>닫기</button>` : ""}</div>`;
    el.hidden = false;
    el.onclick = e => { if (e.target.closest("[data-x]") || e.target === el && o.close){ el.hidden = true; return; }
      const b = e.target.closest("[data-cid]"); if (!b) return;
      try { sessionStorage.setItem(KEY + ".picked", b.dataset.cid); } catch(e2){}
      if (b.dataset.cid === cur){ el.hidden = true; return; }
      if (o.close && !confirm(`${b.querySelector("b").textContent}(으)로 옮길까요? 이 기기의 로그인이 풀려요.`)) return;
      localStorage.setItem(KEY + ".join", JSON.stringify({c: o.c, i: b.dataset.cid})); localStorage.removeItem(KEY + ".me"); location.reload(); };
  },
  /* 🚪 (2026.11.23) 처음 화면은 '반 채널 고르기': 학교 채널이면 로그인 전에 1반~8반 중 우리 반을 먼저 골라요
     (이 탭에서 한 번 고르면 다시 묻지 않아요 · 로그아웃하면 다시 골라요) */
  entry(){
    const sc = Store.mode === "cloud" && Store.cls && Store.cls.school; if (!sc) return false;
    let p = ""; try { p = sessionStorage.getItem(KEY + ".picked") || ""; } catch(e){}
    if (p === Store.cls.cid) return false;
    this.pick({c: this.cfg(), n: sc.n, l: this.pairs(sc.l), entry: true}); return true;
  },
  /* 👑 학교 채널 관리는 만든 선생님(총관리자) 한 분만 */
  isOwner(){ const sc = Store.cls && Store.cls.school; if (!sc) return true; return sc.own ? sc.own === Store.cls.cid : !!(this.secret(sc.id).t); },
  /* 반 고르기 주소로 들어왔어요 → 반 목록 (반을 누르면 그 반으로) */
  fromHash(){
    const h = location.hash.match(/school=([\w-]+)/); if (!h) return false;
    history.replaceState(null, "", location.pathname);
    try { const o = b64d(h[1]); if (!o.c || !Array.isArray(o.l)) throw 0; this.pick(o); return true; }
    catch(e){ alert("반 고르기 주소가 잘못됐어요. 선생님께 다시 받아 주세요."); return false; }
  },
  /* 로그인 화면: 학교 채널이면 🏫 반 바꾸기 버튼 */
  loginBtn(){
    let b = $("#lgSchool"); const sc = Store.mode === "cloud" && Store.cls && Store.cls.school;
    if (!sc){ if (b) b.hidden = true; return; }
    if (!b){ b = document.createElement("button"); b.id = "lgSchool"; b.className = "arc-teach lg-school"; b.title = "다른 반 보드게임으로"; const t = $("#lgTeach"); t.parentNode.insertBefore(b, t); }
    b.hidden = false; b.textContent = `🏫 ${Store.cls.name || ""} · 반 고르기`;
    b.onclick = () => this.pick({c: this.cfg(), n: sc.n, l: this.pairs(sc.l), close: true});
  },
  css(){ if ($("#scCss")) return; const st = document.createElement("style"); st.id = "scCss"; st.textContent = `
.sc-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin:12px 0}
.sc-list{display:flex;flex-direction:column;gap:8px;margin:12px 0}
.sc-r{display:flex;align-items:center;flex-wrap:wrap;gap:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:10px 14px}
.sc-r.me{border-color:#ffd43b;background:rgba(255,212,59,.1)}.sc-r>b{font:20px "Jua",sans-serif;min-width:130px}.sc-r>i{font-style:normal;font-size:12px;background:#ffd43b;color:#3b2a00;border-radius:999px;padding:2px 8px}
.sc-r .sc-pin{flex:1;font-size:14px;color:#c5bfe6}.sc-r .sc-pin b{font-size:18px;letter-spacing:2px;color:#ffe066}.sc-r .bb{display:flex;gap:6px}
.sc-pick{position:fixed;inset:0;z-index:9000;background:radial-gradient(120% 90% at 50% 0%,#3b2f7a,#120d2a);display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto}
.sc-box{width:min(820px,100%);text-align:center;color:#fff}.sc-box h2{font:34px "Jua",sans-serif;margin:0 0 6px}.sc-box p{color:#c5bfe6;margin:0 0 18px}
.sc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-bottom:16px}
.sc-grid button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:18px 10px;border-radius:20px;border:2px solid rgba(255,255,255,.15);background:linear-gradient(160deg,rgba(255,255,255,.12),rgba(255,255,255,.04));color:#fff;font:30px sans-serif;cursor:pointer;transition:transform .15s}
.sc-grid button:hover{transform:translateY(-3px);border-color:#ffd43b}.sc-grid button b{font:22px "Jua",sans-serif}.sc-grid button small{font-size:12px;color:#ffd43b}.sc-grid button.on{border-color:#ffd43b;background:rgba(255,212,59,.15)}
.lg-school{right:auto;left:50%;transform:translateX(-50%)}`; document.head.appendChild(st); }
};
setTimeout(() => SCHOOL.css(), 0);
