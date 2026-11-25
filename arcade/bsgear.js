/* =====================================================================
   🛒 버블 특공대 장비 상점 (2026.11.23)
   - 🔫 거품총 · 🦺 방탄 갑옷 · ⛑️ 헬멧 — 0~12단계 (나무 → 구리 → … → 전설의)
   - 코인은 보드게임 코인(지갑)을 써요 · 산 장비는 지갑(kids/{sid}.bsg)에 저장돼서 앱을 바꿔도 그대로예요
   - 단계마다 이름·색이 바뀌고, 게임 속 내 캐릭터 모습(총 색·갑옷·헬멧)도 바뀌어요
   ===================================================================== */
const BSG = (() => {
  const MAX = 12;
  const SLOTS = [
    {k: "gun",  e: "🔫", n: "거품총",    d: "거품이 더 세지고 더 빨리 쏴요"},
    {k: "arm",  e: "🦺", n: "방탄 갑옷", d: "하트가 늘고, 로봇 공격을 튕겨 낼 때가 있어요"},
    {k: "helm", e: "⛑️", n: "헬멧",      d: "맞은 뒤 반짝 시간이 길어지고, 높은 단계는 보호막·폭탄을 더 줘요"},
    {k: "shoe", e: "👟", n: "점프 신발", d: "점프가 높아지고 더 빨리 달려요 · 6단계부터 3단 점프!"}];
  /* ✨ 스킬 (2026.11.25): 코인으로 사서 하나를 장착 → 게임 중 ✨ 스킬 단추(V)로 써요 · 쓰면 잠깐 기다렸다가 다시 써요 */
  const SKILLS = [
    {k: "storm",   e: "🌪️", n: "거품 폭풍",    d: "내 둘레로 거품 16개를 한꺼번에 쏴요",               cost: 300,  cd: 15},
    {k: "guard",   e: "🛡️", n: "무적 방패",    d: "6초 동안 어떤 공격도 안 맞아요",                    cost: 600,  cd: 25},
    {k: "heal",    e: "💖", n: "응원 하트",    d: "나와 친구들 모두 하트를 1개씩 채워요",              cost: 900,  cd: 30},
    {k: "freeze",  e: "❄️", n: "얼음 시간",    d: "4초 동안 로봇과 보스, 날아오는 총알이 꽁꽁 얼어요", cost: 1300, cd: 30},
    {k: "meteor",  e: "☄️", n: "별똥별 비",    d: "화면 속 로봇과 보스에게 별똥별이 쏟아져요",          cost: 1800, cd: 28},
    {k: "rainbow", e: "🌈", n: "무지개 거품총", d: "8초 동안 거품이 두 배로 세고 두 배로 빨라요",        cost: 2500, cd: 35}];
  const skill = k => SKILLS.find(x => x.k === k) || null;
  const TIER = [{n: "기본", c: "#adb5bd"},
    {n: "나무", c: "#b08968"}, {n: "구리", c: "#e8590c"}, {n: "철", c: "#868e96"}, {n: "강철", c: "#5c7cfa"},
    {n: "은빛", c: "#dee2e6"}, {n: "황금", c: "#fcc419"}, {n: "수정", c: "#66d9e8"}, {n: "비취", c: "#38d9a9"},
    {n: "용비늘", c: "#ff6b6b"}, {n: "별빛", c: "#9775fa"}, {n: "천상", c: "#f783ac"}, {n: "전설의", c: "#ffd43b"}];
  const price = t => 40*t*(t + 1)/2;                       // 1단계 40 · 5단계 600 · 10단계 2,200 · 12단계 3,120
  const clampT = v => Math.max(0, Math.min(MAX, v | 0));
  function of(sid){ const q = (typeof walletOf === "function" ? walletOf(sid).bsg : null) || {}, sk = Array.isArray(q.sk) ? q.sk.filter(skill) : [];
    return {gun: clampT(q.gun), arm: clampT(q.arm), helm: clampT(q.helm), shoe: clampT(q.shoe), sk, eq: sk.includes(q.eq) ? q.eq : ""}; }
  const sig = g => g ? `${g.gun}.${g.arm}.${g.helm}.${g.shoe || 0}` : "0.0.0.0";
  /* 💪 장비 효과 */
  function stats(g){
    const G = g.gun || 0, A = g.arm || 0, H = g.helm || 0, S = g.shoe || 0;
    return {
      jv: 1 + .02*S,                                // 점프 힘 (12단계 ×1.24 → 높이 약 1.5배)
      sp: 1 + .015*S,                               // 달리기 (12단계 +18%)
      j3: S >= 6,                                   // 6단계부터 3단 점프
      dm: 1 + .25*G,                                // 거품 힘 (12단계 ×4)
      cdm: Math.max(.6, 1 - .033*G),                // 쏘는 간격 (짧을수록 빨라요)
      pc: G >= 8 ? 1 : 0,                           // 8단계부터 로봇 하나 더 뚫어요
      hb: Math.floor(A/4),                          // 처음 하트 +0 ~ +3
      hm: 5 + Math.floor(A/3),                      // 최대 하트 5 ~ 9
      blk: Math.min(.36, .03*A),                    // 공격 튕겨 내기
      inv: 110 + 8*H,                               // 맞은 뒤 반짝 시간
      sh: H >= 4,                                   // 스테이지 시작 보호막
      rv: H >= 8 ? 3 : 2,                           // 구조될 때 하트
      bm: H >= 10 ? 1 : 0};                         // 폭탄 +1
  }
  const fullName = (k, t) => `${TIER[t].n} ${SLOTS.find(s => s.k === k).n}`;
  function effTxt(k, t){ const s = stats({[k]: t});
    if (k === "gun") return `거품 힘 ×${s.dm.toFixed(2).replace(/\.?0+$/, "")} · 연사 +${Math.round((1/s.cdm - 1)*100)}%${s.pc ? " · 관통 +1" : ""}`;
    if (k === "arm") return `처음 하트 ${3 + s.hb}개 · 최대 ${s.hm}개 · 튕겨 내기 ${Math.round(s.blk*100)}%`;
    if (k === "shoe") return `점프 높이 +${Math.round((s.jv*s.jv - 1)*100)}% · 달리기 +${Math.round((s.sp - 1)*100)}%${s.j3 ? " · 3단 점프" : ""}`;
    return `반짝 시간 +${Math.round((s.inv/110 - 1)*100)}%${s.sh ? " · 🛡️ 시작 보호막" : ""}${s.rv === 3 ? " · 구조 하트 3" : ""}${s.bm ? " · 💣 폭탄 +1" : ""}`; }
  const power = g => (g.gun || 0) + (g.arm || 0) + (g.helm || 0) + (g.shoe || 0);

  async function buy(sid, k){
    const cur = of(sid)[k] || 0; if (cur >= MAX) throw new Error("이미 최고 단계예요");
    const cost = price(cur + 1);
    await Store.kidTx(sid, w => { if ((w.coins || 0) < cost) throw new Error(`코인이 ${(cost - (w.coins || 0)).toLocaleString()}개 모자라요`);
      const q = Object.assign({gun: 0, arm: 0, helm: 0, shoe: 0}, JSON.parse(JSON.stringify(w.bsg || {}))); if ((q[k] || 0) !== cur) throw new Error("다시 눌러 주세요");
      q[k] = cur + 1; w.coins -= cost; w.bsg = q; return w; });
    return cur + 1;
  }
  /* ✨ 스킬 사기 (사면 바로 장착) · 장착 바꾸기 */
  async function buySkill(sid, k){
    const S = skill(k); if (!S) throw new Error("없는 스킬이에요"); if (of(sid).sk.includes(k)) return equip(sid, k);
    await Store.kidTx(sid, w => { if ((w.coins || 0) < S.cost) throw new Error(`코인이 ${(S.cost - (w.coins || 0)).toLocaleString()}개 모자라요`);
      const q = Object.assign({gun: 0, arm: 0, helm: 0, shoe: 0}, JSON.parse(JSON.stringify(w.bsg || {}))); q.sk = Array.isArray(q.sk) ? q.sk : [];
      if (!q.sk.includes(k)) q.sk.push(k); q.eq = k; w.coins -= S.cost; w.bsg = q; return w; });
  }
  async function equip(sid, k){
    await Store.kidTx(sid, w => { const q = Object.assign({}, JSON.parse(JSON.stringify(w.bsg || {}))); const sk = Array.isArray(q.sk) ? q.sk : [];
      if (k && !sk.includes(k)) throw new Error("아직 없는 스킬이에요"); q.eq = q.eq === k ? "" : k; w.bsg = q; return w; });
  }

  /* ---------- 🛒 상점 화면 (보스 잡기 상점과 같은 모양 · qg- 스타일을 같이 써요) ---------- */
  const UI = {
    busy: false,
    open(sid){
      this.sid = sid || sidOf(ARC.me); if (typeof QG !== "undefined") QG.UI.css(); this.css();
      let el = $("#bsgShop"); if (!el){ el = document.createElement("div"); el.id = "bsgShop"; el.className = "qg-shop"; document.body.appendChild(el);
        ["keydown", "keyup"].forEach(ev => el.addEventListener(ev, e => e.stopPropagation()));
        el.onclick = e => this.click(e); }
      el.hidden = false; this.msg = ""; this.paint();
      if (!this.sub){ this.sub = () => { const b = $("#bsgShop"); if (b && !b.hidden) this.paint(); }; Store.subs.push(this.sub); }
    },
    close(){ const el = $("#bsgShop"); if (el) el.hidden = true; },
    css(){ if ($("#bsgCss")) return; const st = document.createElement("style"); st.id = "bsgCss"; st.textContent = `
#bsgShop .qg-box{background:linear-gradient(160deg,#123a63,#0b1a33)}
#bsgShop .qg-hero{background:radial-gradient(120% 80% at 50% 20%,rgba(77,171,247,.35),rgba(255,255,255,.03))}
#bsgShop .qg-hero canvas{width:180px;height:216px;image-rendering:pixelated}
.bs-shopb{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;margin:0 0 12px;font-size:20px;padding:12px 16px;background:linear-gradient(135deg,#74c0fc,#4263eb) !important;color:#fff !important;border:0 !important;border-radius:16px}
.bs-shopb small{font:13px "Gowun Dodum",sans-serif;opacity:.85}
#bsgShop .bsg-h{font:20px "Jua",sans-serif;color:#ffe066;margin:16px 0 8px}#bsgShop .bsg-h small{font:13px "Gowun Dodum",sans-serif;color:#c5bfe6;margin-left:8px}
#bsgShop .bsg-sk.on{box-shadow:0 0 0 2px #ffd43b inset,0 0 18px rgba(255,212,59,.35)}`; document.head.appendChild(st); },
    paint(){
      const el = $("#bsgShop"); if (!el) return; const sid = this.sid, w = walletOf(sid), g = of(sid), pw = power(g);
      const rows = SLOTS.map(s => { const t = g[s.k] || 0, nx = t + 1, max = t >= MAX, cost = price(nx);
        return `<div class="qg-it" style="--c:${TIER[t].c}"><span class="qg-ic">${s.e}</span><div><b>${fullName(s.k, t)}<i>${t}단계</i></b>
          <p>${t ? effTxt(s.k, t) : s.d}${max ? "" : ` → <em>${effTxt(s.k, nx)}</em>`}</p><div class="qg-bar"><i style="width:${t/MAX*100}%"></i></div></div>
          ${max ? `<button class="qg-buy on" disabled>👑 최고 장비</button>` : `<button class="qg-buy" data-buy="${s.k}" ${(w.coins || 0) < cost || this.busy ? "disabled" : ""}>🪙 ${cost.toLocaleString()}<small>🆙 ${TIER[nx].n}(으)로 바꾸기</small></button>`}</div>`; }).join("");
      const skRows = SKILLS.map(S => { const own = g.sk.includes(S.k), on = g.eq === S.k;
        return `<div class="qg-it bsg-sk${on ? " on" : ""}" style="--c:${on ? "#ffd43b" : own ? "#74c0fc" : "#868e96"}"><span class="qg-ic">${S.e}</span><div><b>${S.n}<i>${on ? "장착 중" : own ? "가지고 있어요" : "다시 쓰기 " + S.cd + "초"}</i></b><p>${S.d}</p></div>
          ${own ? `<button class="qg-buy${on ? " on" : ""}" data-eq="${S.k}" ${this.busy ? "disabled" : ""}>${on ? "✅ 장착 중<small>누르면 빼요</small>" : "✨ 장착하기"}</button>`
                : `<button class="qg-buy" data-sk="${S.k}" ${(w.coins || 0) < S.cost || this.busy ? "disabled" : ""}>🪙 ${S.cost.toLocaleString()}<small>사서 장착하기</small></button>`}</div>`; }).join("");
      el.innerHTML = `<div class="qg-box${this.flash ? " qg-" + this.flash : ""}"><div class="qg-hd"><h2>🛒 버블 특공대 장비 · 스킬<small>${esc(who(noOf_(sid)))}</small></h2><span class="qg-coin">🪙 ${(w.coins || 0).toLocaleString()}</span><button class="qg-x" data-x>✕</button></div>
        <div class="qg-main" style="margin-top:14px"><div class="qg-hero"><canvas id="bsgCv" width="56" height="68"></canvas><b>🫧 내 특공대원</b><span class="qg-pow">⭐ 장비 ${pw} / ${SLOTS.length*MAX}</span>
          <small>장비를 바꾸면 게임 속 모습도 바뀌어요<br>🔫 총 색 · 🦺 갑옷 · ⛑️ 헬멧 · 👟 신발</small>
          <span class="qg-pow">✨ 스킬: ${g.eq ? `${skill(g.eq).e} ${skill(g.eq).n}` : "장착 안 함"}</span></div>
        <div><div class="qg-list">${rows}</div><h3 class="bsg-h">✨ 스킬 <small>하나를 장착해서 게임 중 ✨ 스킬 단추(키보드 V)로 써요</small></h3><div class="qg-list">${skRows}</div><div class="qg-rec">🆙 한 단계씩 올려요: 나무 → 구리 → 철 → 강철 → 은빛 → <b>황금</b> → 수정 → 비취 → 용비늘 → 별빛 → 천상 → <b>전설의</b><br>
          🔫 8단계부터 거품이 로봇을 하나 더 뚫어요 · ⛑️ 4단계부터 스테이지마다 보호막 · 👟 6단계부터 3단 점프!</div></div></div>
        <div class="qg-msg" id="bsgMsg">${this.msg || ""}</div></div>`;
      this.flash = ""; this.hero();
    },
    hero(){ const cv = $("#bsgCv"); if (!cv || typeof BSP === "undefined") return; const t = cv.getContext("2d"); t.imageSmoothingEnabled = false; t.clearRect(0, 0, 56, 68);
      try { const hs = BSP.hero(0, this.sid, 0, 0, 1, false, of(this.sid)); cv.width = hs.width*2; cv.height = hs.height*2; t.imageSmoothingEnabled = false; t.drawImage(hs, 0, 0, hs.width*2, hs.height*2); } catch(e){ console.warn(e); } },
    async click(e){
      const b = e.target.closest("button"); if (!b || b.disabled){ if (e.target === $("#bsgShop")) this.close(); return; }
      if (b.dataset.x != null){ this.close(); return; }
      if (!b.dataset.buy && !b.dataset.sk && !b.dataset.eq) return;
      this.busy = true; this.msg = "";
      try {
        if (b.dataset.sk){ await buySkill(this.sid, b.dataset.sk); const S = skill(b.dataset.sk); this.flash = "ok"; this.msg = `✨ ${S.e} ${S.n}을(를) 사서 장착했어요!`; }
        else if (b.dataset.eq){ const was = of(this.sid).eq === b.dataset.eq; await equip(this.sid, b.dataset.eq); const S = skill(b.dataset.eq); this.flash = "ok"; this.msg = was ? `${S.e} ${S.n}을(를) 뺐어요` : `✨ ${S.e} ${S.n}을(를) 장착했어요!`; }
        else { const t = await buy(this.sid, b.dataset.buy); this.flash = "ok"; this.msg = `✨ ${fullName(b.dataset.buy, t)}(으)로 바꿨어요!`; }
        SFX.item && SFX.item(); }
      catch(err){ this.flash = "no"; this.msg = "😢 " + (err.message || err); }
      this.busy = false; this.paint();
    }
  };
  setTimeout(() => UI.css(), 0);
  return {MAX, SLOTS, SKILLS, skill, TIER, price, of, sig, stats, power, buy, buySkill, equip, fullName, UI};
})();
