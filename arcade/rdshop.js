/* =====================================================================
   🏪 동물 랜덤 디펜스 · 코인 상점 & 🔬 동물 연구소 (2026.11.17)
   - 보드게임 코인(지갑)을 써요. 산 것은 지갑(kids/{sid}.rd)에 저장돼서 앱을 바꿔도 그대로예요.
   - 🔬 연구(영원히): 💪 공격력 · ⚡ 공격 속도 · 🎯 치명타 · 🍀 대기 줄 행운 · 💰 시작 금 · 🎒 가방 칸
     → 연구를 할 때마다 🎓 사육사 레벨이 올라가요(칭호가 바뀌어요). 함께 지키기에서도 내 길에 그대로 적용!
   - 🎒 준비물(한 번 쓰면 사라져요): 아이템 6종 · 🦸 영웅 동물 상자 · 🌟 전설 동물 상자 · 👑 희귀 이상 소환권(2,000)
     → 혼자·둘이 할 때 판이 시작되면 저절로 꺼내 써요(온라인 방에서는 연구만 적용).
   - 🏷️ 오늘의 특가: 날마다 연구 하나가 30% 할인!
   ===================================================================== */
const RDP = (() => {
  const RES = [
    {k: "atk",  e: "💪", n: "공격력 연구",   max: 30, d: l => `모든 동물 공격 +${l*4}%`,            cost: l => 100 + 50*l},
    {k: "spd",  e: "⚡", n: "공격 속도 연구", max: 20, d: l => `모든 동물 공격 속도 +${l*3}%`,       cost: l => 150 + 70*l},
    {k: "crit", e: "🎯", n: "치명타 연구",   max: 10, d: l => `치명타 확률 +${(l*1.5).toFixed(1)}%p`, cost: l => 150 + 80*l},
    {k: "luck", e: "🍀", n: "대기 줄 행운 연구", max: 10, d: l => `📥 대기 줄에 희귀 이상이 +${l*5}% 더 잘 와요`, cost: l => 200 + 100*l},
    {k: "gold", e: "💰", n: "시작 금 연구",  max: 10, d: l => `판을 시작할 때 금 +${l*25}`,          cost: l => 80 + 40*l},
    {k: "bag",  e: "🎒", n: "가방 늘리기",   max: 3,  d: l => `아이템 가방 +${l}칸`,                 cost: l => [500, 1200, 2500][l] || 0}
  ];
  const GOODS = [
    ...RD_IK.map(k => ({k, e: RD_IT[k].e, n: RD_IT[k].n, d: RD_IT[k].d, cost: {bomb: 60, ice: 80, clover: 100, gold: 60, time: 80, fever: 120}[k], item: 1})),
    {k: "hero",  e: "🦸", n: "영웅 동물 상자",   d: "판을 시작할 때 영웅 동물 1마리를 데리고 시작", cost: 700},
    {k: "legend", e: "🌟", n: "전설 동물 상자",  d: "판을 시작할 때 전설 동물 1마리를 데리고 시작", cost: 3000},
    {k: "rare",  e: "👑", n: "희귀 이상 소환권", d: "그 판에서 📥 대기 줄에 희귀 이상이 훨씬 자주 와요! (35%는 꼭 희귀 이상)", cost: 2000}
  ];
  const TITLES = [[1, "🌱 새싹 사육사"], [8, "🐣 동물 친구"], [20, "🐾 동물 조련사"], [35, "🦁 동물 대장"], [55, "🐉 전설의 사육사"], [75, "👑 동물의 왕"], [84, "🌌 우주 최강 사육사"]];
  const kid = sid => (walletOf(sid).rd) || {};
  const lv = (sid, k) => Math.min((RES.find(r => r.k === k) || {max: 0}).max, (kid(sid).lv || {})[k] || 0);
  const level = sid => 1 + RES.reduce((a, r) => a + lv(sid, r.k), 0);
  const title = L => TITLES.filter(t => L >= t[0]).pop()[1];
  const inv = sid => Object.assign({}, kid(sid).inv || {});
  /* 🏷️ 오늘의 특가 (날짜로 정해져서 모두 같아요) */
  const deal = () => { const d = new Date(), s = d.getFullYear()*372 + d.getMonth()*31 + d.getDate(); return RES[s % RES.length].k; };
  const price = (r, l) => Math.round(r.cost(l)*(r.k === deal() ? .7 : 1));
  /* 게임 쪽에서 쓰는 값 */
  function perk(sid){ const L = k => sid ? lv(sid, k) : 0;
    return {atk: L("atk"), spd: L("spd"), crit: L("crit"), luck: L("luck"), gold: L("gold"), bag: L("bag"), level: sid ? level(sid) : 1}; }
  async function research(sid, k){
    const r = RES.find(x => x.k === k), l = lv(sid, k); if (!r || l >= r.max) throw new Error("이미 최고 단계예요");
    const c = price(r, l);
    await Store.kidTx(sid, w => { if ((w.coins || 0) < c) throw new Error(`코인이 ${(c - (w.coins || 0)).toLocaleString()}개 모자라요`);
      const q = JSON.parse(JSON.stringify(w.rd || {})); q.lv = Object.assign({}, q.lv || {}); q.lv[k] = Math.min(r.max, (q.lv[k] || 0) + 1);
      w.coins -= c; w.rd = q; return w; });
    return c;
  }
  async function buy(sid, k){
    const g = GOODS.find(x => x.k === k); if (!g) return;
    await Store.kidTx(sid, w => { if ((w.coins || 0) < g.cost) throw new Error(`코인이 ${(g.cost - (w.coins || 0)).toLocaleString()}개 모자라요`);
      const q = JSON.parse(JSON.stringify(w.rd || {})); q.inv = Object.assign({}, q.inv || {}); q.inv[k] = (q.inv[k] || 0) + 1;
      w.coins -= g.cost; w.rd = q; return w; });
  }
  /* 판을 시작할 때 준비물 꺼내기: 아이템은 가방 칸만큼, 상자·소환권은 하나씩 (지갑에서 빠져요) */
  function takeKit(sid, bagRoom){
    const have = inv(sid), out = {items: [], hero: 0, legend: 0, rare: 0};
    if (!sid) return out;
    const order = ["fever", "bomb", "ice", "clover", "time", "gold"];
    for (const k of order){ while ((have[k] || 0) > 0 && out.items.length < bagRoom){ out.items.push(k); have[k]--; } }
    ["hero", "legend", "rare"].forEach(k => { if ((have[k] || 0) > 0){ out[k] = 1; have[k]--; } });
    if (out.items.length || out.hero || out.legend || out.rare)
      Store.kidTx(sid, w => { const q = JSON.parse(JSON.stringify(w.rd || {})); const iv = Object.assign({}, q.inv || {});
        out.items.forEach(k => iv[k] = Math.max(0, (iv[k] || 0) - 1)); ["hero", "legend", "rare"].forEach(k => { if (out[k]) iv[k] = Math.max(0, (iv[k] || 0) - 1); });
        q.inv = iv; w.rd = q; return w; }).catch(e => { console.error(e); toast("⚠️ 준비물을 지갑에 반영하지 못했어요"); });
    return out;
  }

  /* ---------- 🏪 상점 화면 ---------- */
  let tab = "res";
  function css(){ if (css.done) return; css.done = 1; const s = document.createElement("style"); s.textContent = `
#mdRdShop .arc-card{max-width:900px;padding:18px 20px 20px}
.rds-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding-right:52px;margin-bottom:10px}
.rds-top h2{margin:0}
.rds-me{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-left:auto}
.rds-me span{background:#2d2566;border-radius:999px;padding:5px 12px;color:#fff;font-size:15px}
.rds-me b{color:#ffe066}
.rds-tabs{display:flex;gap:6px;margin:0 0 10px;flex-wrap:wrap}
.rds-tabs button{border:0;border-radius:999px;padding:7px 15px;font:inherit;font-size:16px;background:#3a3178;color:#e5dbff;cursor:pointer}
.rds-tabs button.on{background:#ffd43b;color:#3b2a00}
.rds-lvbar{background:#211a52;border-radius:14px;padding:10px 14px;margin-bottom:10px;color:#e5dbff;font-size:14px}
.rds-lvbar i{display:block;height:10px;border-radius:5px;background:rgba(255,255,255,.12);margin-top:6px;overflow:hidden}
.rds-lvbar i em{display:block;height:100%;background:linear-gradient(90deg,#69db7c,#ffd43b)}
.rds-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px;max-height:58vh;overflow:auto;padding:2px}
.rds-c{background:#2d2566;border-radius:16px;padding:12px 14px;color:#e5dbff;font-size:14px;display:flex;flex-direction:column;gap:6px;position:relative}
.rds-c h4{margin:0;font-size:17px;color:#fff;display:flex;align-items:center;gap:6px}
.rds-c h4 span{font-size:26px}
.rds-c .lv{font-size:13px;color:#ffe066}
.rds-c .dots{display:flex;gap:2px;flex-wrap:wrap}
.rds-c .dots i{width:7px;height:7px;border-radius:2px;background:rgba(255,255,255,.15)}
.rds-c .dots i.on{background:#69db7c}
.rds-c .nx{color:#c5f6fa;font-size:13px}
.rds-c button{border:0;border-radius:12px;padding:8px 10px;font:inherit;font-size:15px;font-weight:800;background:linear-gradient(180deg,#ffe066,#fab005);color:#3b2a00;cursor:pointer;box-shadow:0 3px 0 #e67700}
.rds-c button[disabled]{filter:grayscale(.9);opacity:.55;cursor:default}
.rds-c .own{position:absolute;top:10px;right:12px;background:#69db7c;color:#0b3d1a;border-radius:999px;padding:1px 9px;font-size:13px;font-weight:800}
.rds-c.deal{outline:3px solid #ff8787}
.rds-c.deal::before{content:"🏷️ 오늘의 특가 -30%";position:absolute;top:-10px;left:12px;background:#ff8787;color:#fff;border-radius:999px;padding:1px 9px;font-size:12px;font-weight:800}
.rds-c.big{background:linear-gradient(135deg,#3d2a7a,#5f3dc4)}
.rds-note{color:#bfb3e8;font-size:13px;margin:8px 2px 0}
.rd-shop-btn{width:100%;margin:2px 0 6px;background:linear-gradient(180deg,#ffe066,#fab005)!important;color:#3b2a00!important}
@media (max-width:560px){.rds-grid{grid-template-columns:1fr}}`; document.head.appendChild(s); }
  function open(){ css(); let m = $("#mdRdShop");
    if (!m){ m = document.createElement("div"); m.className = "arc-modal"; m.id = "mdRdShop"; m.hidden = true;
      m.innerHTML = `<div class="arc-card"><div id="rdsBody"></div><button class="arc-x" data-close>×</button></div>`; document.body.appendChild(m);
      m.querySelector("[data-close]").onclick = () => close();
      m.addEventListener("pointerdown", e => { if (e.target === m) close(); });
      m.addEventListener("click", async e => {
        const t = e.target.closest("[data-t]"); if (t){ tab = t.dataset.t; render(); return; }
        const b = e.target.closest("[data-r],[data-g]"); if (!b || b.disabled) return; b.disabled = true;
        const sid = sidOf(ARC.me);
        try {
          if (b.dataset.r){ const c = await research(sid, b.dataset.r), r = RES.find(x => x.k === b.dataset.r), L = level(sid);
            toast(`🔬 ${r.e} ${r.n} ${lv(sid, r.k)}단계! (🪙 -${c.toLocaleString()}) · 🎓 사육사 Lv.${L}`); (SFX.rec || SFX.coin || (() => {}))(); }
          else { await buy(sid, b.dataset.g); const g = GOODS.find(x => x.k === b.dataset.g); toast(`🛒 ${g.e} ${g.n}을(를) 샀어요! 다음 판에 꺼내 써요`); (SFX.coin || (() => {}))(); }
        } catch(err){ toast("⚠️ " + err.message); }
        render();
      }); }
    m.hidden = false; render(); }
  function close(){ const m = $("#mdRdShop"); if (m) m.hidden = true; }
  function render(){
    const sid = sidOf(ARC.me), coins = walletOf(sid).coins || 0, L = level(sid), nx = TITLES.find(t => t[0] > L), cur = TITLES.filter(t => L >= t[0]).pop(), IV = inv(sid);
    const tabs = [["res", "🔬 동물 연구소"], ["kit", "🎒 준비물"], ["sp", "👑 특별 상자·소환권"]].map(([k, n]) => `<button data-t="${k}" class="${tab === k ? "on" : ""}">${n}</button>`).join("");
    let html = `<div class="rds-top"><h2>🏪 코인 상점</h2><div class="rds-me"><span>🪙 <b>${coins.toLocaleString()}</b></span><span>🎓 사육사 <b>Lv.${L}</b></span></div></div>
      <div class="rds-lvbar">${cur[1]} ${nx ? `→ 다음 칭호 <b>${nx[1]}</b>까지 연구 ${nx[0] - L}번` : "· 최고 칭호!"}<i><em style="width:${Math.min(100, nx ? Math.round((L - cur[0])/(nx[0] - cur[0])*100) : 100)}%"></em></i></div>
      <div class="rds-tabs">${tabs}</div>`;
    if (tab === "res"){
      html += `<div class="rds-grid">${RES.map(r => { const l = lv(sid, r.k), full = l >= r.max, c = full ? 0 : price(r, l);
        return `<div class="rds-c ${r.k === deal() && !full ? "deal" : ""}"><h4><span>${r.e}</span>${r.n}</h4><div class="lv">${l} / ${r.max}단계 · 지금: ${l ? r.d(l) : "아직 없음"}</div>
          <div class="dots">${Array.from({length: r.max}, (_, i) => `<i class="${i < l ? "on" : ""}"></i>`).join("")}</div>
          <div class="nx">${full ? "✨ 최고 단계 완성!" : `다음: ${r.d(l + 1)}`}</div>
          <button data-r="${r.k}" ${full || coins < c ? "disabled" : ""}>${full ? "완성" : `🔬 연구하기 · 🪙 ${c.toLocaleString()}`}</button></div>`; }).join("")}</div>
        <p class="rds-note">🔬 연구는 영원히 남아요. 혼자·둘이·온라인 함께 지키기 모두 내 동물에게 적용돼요. 연구할 때마다 🎓 사육사 레벨 +1!</p>`;
    } else if (tab === "kit"){
      html += `<div class="rds-grid">${GOODS.filter(g => g.item).map(g => `<div class="rds-c">${IV[g.k] ? `<span class="own">${IV[g.k]}개</span>` : ""}<h4><span>${g.e}</span>${g.n}</h4><div>${g.d}</div>
          <button data-g="${g.k}" ${coins < g.cost ? "disabled" : ""}>🛒 사기 · 🪙 ${g.cost}</button></div>`).join("")}</div>
        <p class="rds-note">🎒 판이 시작되면 가방 칸만큼(🔥 → 💣 → ❄️ → 🍀 → ⏳ → 💰 순서로) 저절로 챙겨 가요. 혼자·둘이 할 때 써요.</p>`;
    } else {
      html += `<div class="rds-grid">${GOODS.filter(g => !g.item).map(g => `<div class="rds-c big">${IV[g.k] ? `<span class="own">${IV[g.k]}개</span>` : ""}<h4><span>${g.e}</span>${g.n}</h4><div>${g.d}</div>
          <button data-g="${g.k}" ${coins < g.cost ? "disabled" : ""}>🛒 사기 · 🪙 ${g.cost.toLocaleString()}</button></div>`).join("")}</div>
        <p class="rds-note">👑 소환권은 한 판에 한 장씩 저절로 써요. 상자도 한 판에 하나씩 열려요. 혼자·둘이 할 때 써요.</p>`;
    }
    $("#rdsBody").innerHTML = html;
  }
  return {RES, GOODS, perk, level, title, inv, takeKit, open, close, deal, css};
})();
