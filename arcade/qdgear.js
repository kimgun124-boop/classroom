/* =====================================================================
   🛒 용사 대모험 상점 (2026.11.17)
   - 영웅(검객·창장수·궁장·책사)마다 따로: ⚔️ 무기 · 🛡️ 갑옷 · ⛑️ 투구 · 👢 신발 · 🪽 날개 (0~12강)
   - 🐾 펫: 한 번 사면 모든 영웅이 데려갈 수 있어요 · 따라다니며 콕콕 공격 + 펫 스킬(P 키)
   - 코인은 오락실 코인(지갑)을 써요 · 산 장비는 지갑(kids/{sid}.qd)에 저장돼서 앱을 바꿔도 그대로예요
   - 단계가 올라갈수록 몬스터가 훨씬 세져요 → 장비를 강화해야 더 멀리 갈 수 있어요 (추천 ⭐ 표시)
   ===================================================================== */
const QG = (() => {
  const MAX = 12;
  const SLOTS = [
    {k: "wpn",  e: "⚔️", n: "무기"}, {k: "arm", e: "🛡️", n: "갑옷"}, {k: "helm", e: "⛑️", n: "투구"},
    {k: "boot", e: "👢", n: "신발"}, {k: "wing", e: "🪽", n: "날개"}];
  const WPN = {kn: "검", ln: "창", ar: "활", wz: "부채"};
  const TIER = [{n: "기본", c: "#adb5bd"},
    {n: "나무", c: "#b08968"}, {n: "구리", c: "#e8590c"}, {n: "철", c: "#868e96"}, {n: "강철", c: "#5c7cfa"},
    {n: "은빛", c: "#dee2e6"}, {n: "황금", c: "#fcc419"}, {n: "수정", c: "#66d9e8"}, {n: "비취", c: "#38d9a9"},
    {n: "용비늘", c: "#ff6b6b"}, {n: "별빛", c: "#9775fa"}, {n: "천상", c: "#f783ac"}, {n: "전설의", c: "#ffd43b"}];
  const PETS = [
    {id: "fox",    e: "🦊", n: "구미호",        sk: "여우불",     d: "가까운 적 셋에게 여우불을 날려요", price: 900,  c: "#ff922b"},
    {id: "turtle", e: "🐢", n: "거북 수호신",   sk: "거북 방패",  d: "3초 동안 무적 + 체력 25% 회복",     price: 800,  c: "#51cf66"},
    {id: "panda",  e: "🐼", n: "쿵푸 판다",     sk: "대나무 쿵",  d: "주변 적을 크게 때리고 넘어뜨려요",   price: 1000, c: "#f1f3f5"},
    {id: "dragon", e: "🐲", n: "아기 청룡",     sk: "불꽃 숨결",  d: "앞쪽으로 불을 뿜어 줄줄이 태워요",   price: 1300, c: "#ff6b6b"},
    {id: "eagle",  e: "🦅", n: "하늘 독수리",   sk: "하늘 급습",  d: "화면의 모든 적에게 급강하 공격",     price: 1600, c: "#74c0fc"},
    {id: "uni",    e: "🦄", n: "무지개 유니콘", sk: "무지개 치유", d: "모든 친구 체력 30% + 필살 기운 40", price: 2000, c: "#f783ac"}];
  const price = t => 40*t*(t + 1)/2;                      // 1강 40 · 5강 600 · 10강 2,200 · 12강 3,120
  const rec = s => Math.round(s*.42);                       // 단계별 추천 장비 ⭐ (5부위 × 12강 = 60)
  /* 💪 몬스터 세기: 단계가 오를수록 체력·공격이 쑥쑥 (장비 없이는 50단계 넘기 어려워요) */
  const SD = s => 1.3*(1 + .065*s)*(1 + s/90);              // 체력 배율  (1단계 ×1.3 · 30단계 ×5.1 · 60단계 ×11 · 100단계 ×20 · 130단계 ×29)
  const ED = s => 1.2 + .045*s;                              // 공격 배율  (30단계 ×2.5 · 100단계 ×5.7)
  /* 🔨 강화 (+1 ~ +15): 코인을 내고 두근두근 도전! 실패해도 장비는 그대로 (코인만 써요) */
  const EMAX = 15, ecost = n => 60*(n + 1)*(n + 2)/2, echance = n => Math.max(.3, 1 - n*.05);
  function kid(sid){ return (walletOf(sid).qd) || {}; }
  function of(sid, clsId){ const q = kid(sid), g = Object.assign({wpn: 0, arm: 0, helm: 0, boot: 0, wing: 0}, q[clsId] || {}); g.e = Object.assign({}, (q[clsId] || {}).e || {}); g.pet = q.pet || null; return g; }
  function botGear(stage){ const r = rec(stage), b = Math.floor(r/5), x = r % 5, g = {pet: null, e: {wpn: Math.floor(stage/12)}}; SLOTS.forEach((s, i) => g[s.k] = Math.min(MAX, b + (i < x ? 1 : 0))); return g; }
  const power = g => SLOTS.reduce((a, s) => a + (g[s.k] || 0) + Math.floor(((g.e || {})[s.k] || 0)/3), 0);   // ⭐: 단계 + 강화 3마다 1
  function stats(g){
    const w = g.wpn || 0, a = g.arm || 0, h = g.helm || 0, b = g.boot || 0, wi = g.wing || 0, E = g.e || {}, ew = E.wpn || 0, ea = E.arm || 0, eh = E.helm || 0, eb = E.boot || 0, ewi = E.wing || 0;
    return {dm: (1 + .5*w)*(1 + .025*wi)*(1 + .07*ew)*(1 + .01*ewi), hpm: (1 + .3*a)*(1 + .08*h)*(1 + .02*wi)*(1 + .05*ea)*(1 + .01*ewi), dr: Math.min(.4, .022*a + .004*h + .005*ea), crit: Math.min(.55, .03*h + .005*wi + .01*eh),
      spm: 1 + .035*b + .012*wi + .01*eb, dcd: Math.max(12, 40 - 2*b - wi - Math.floor(eb/3)), jmp: 1 + .03*wi, regen: wi*.0015 + ewi*.0005};
  }
  const nameOf = (slot, clsId, t) => t ? `${TIER[t].n} ${slot === "wpn" ? WPN[clsId] : SLOTS.find(s => s.k === slot).n}` : `기본 ${slot === "wpn" ? WPN[clsId] : SLOTS.find(s => s.k === slot).n}`;
  function effTxt(slot, t, e = 0){ const s = stats({[slot]: t, e: {[slot]: e}});
    return slot === "wpn" ? `공격 ×${s.dm.toFixed(1)}` : slot === "arm" ? `체력 ×${s.hpm.toFixed(1)} · 받는 피해 -${Math.round(s.dr*100)}%` : slot === "helm" ? `치명타 ${Math.round(s.crit*100)}% · 체력 +${t*8}%`
      : slot === "boot" ? `이동 +${Math.round((s.spm - 1)*100)}% · 대시 대기 ${(s.dcd/60).toFixed(2)}초` : `모든 능력 조금 ↑ · 회복 · 높이 점프`; }
  /* 🎨 장비에 따라 바뀌는 영웅 모습 (갑옷 색 · 장식 색 · 무기 빛) */
  function def(clsId, g){
    const base = WDEF[clsId], E = g && g.e || {}; if (!g || !power(g)) return {d: base, sig: ""};
    const d = JSON.parse(JSON.stringify(base));
    /* ⚔️ 무기: 단계마다 모양이 바뀌어요 (검 → 큰칼 → 언월도 / 창 → 미늘창 → 언월도 · 활·부채는 빛깔) */
    const W = g.wpn || 0, WT = {kn: ["sword", "sword", "dao", "guandao"], ln: ["spear", "spear", "halberd", "guandao"], ar: ["bow", "bow", "bow", "bow"], wz: ["fan", "fan", "fan", "fan"]}[clsId];
    d.weapon = WT[W >= 9 ? 3 : W >= 5 ? 2 : W >= 1 ? 1 : 0];
    if (W){ d.wd = Object.assign({}, d.wd || {}, {glow: TIER[W].c, tassel: TIER[Math.max(1, W - 1)].c, metal: W >= 6 ? TIER[W].c : "#dfe6ee"}); }
    if ((E.wpn || 0) >= 10) d.wd = Object.assign({}, d.wd || {}, {glow: "#ffffff"});
    /* 🛡️ 갑옷: 색 → 망토 → 방패 → 우람한 몸 */
    const A = g.arm || 0;
    if (A){ d.armor = TIER[A].c; d.cloth = TIER[Math.max(1, A - 3)].c; }
    if (A >= 4) d.cape = TIER[Math.max(1, A - 1)].c;
    if (A >= 7 && (clsId === "kn" || clsId === "ln")) d.shield = TIER[A].c;
    if (A >= 10) d.big = 1;
    /* ⛑️ 투구: 단계마다 다른 투구 (병사 → 장군 깃털 → 뿔 → 왕관) */
    const Hh = g.helm || 0;
    if (Hh){ d.trim = TIER[Hh].c; d.plume = TIER[Hh].c; d.band = TIER[Hh].c;
      d.helm = clsId === "wz" ? (Hh >= 10 ? "crown" : Hh >= 7 ? "general" : "scholar") : Hh >= 10 ? "crown" : Hh >= 7 ? "horned" : Hh >= 4 ? "general" : clsId === "ar" ? "band" : "soldier"; }
    if (g.wing) d.sash = TIER[g.wing].c;
    return {d, sig: `${A}.${Hh}.${W}.${g.wing || 0}.${(E.wpn || 0) >= 10 ? 1 : 0}`};
  }
  /* 🪽 날개 그림 (단계마다 색·크기) */
  const WCACHE = new Map();
  function wingSpr(t){ const k = NG.k || 1, key = t + "|" + k; let c = WCACHE.get(key); if (c) return c;
    const w = 150, h = 120; c = document.createElement("canvas"); c.width = Math.ceil(w*k); c.height = Math.ceil(h*k); const g = c.getContext("2d"); g.scale(k, k);
    const col = TIER[t].c, big = .7 + t*.03;
    g.translate(w/2, h*.62);
    [-1, 1].forEach(sd => { g.save(); g.scale(sd*big, big);
      const gr = g.createLinearGradient(0, -60, 70, 30); gr.addColorStop(0, "#fff"); gr.addColorStop(.5, col); gr.addColorStop(1, t >= 9 ? "#fff3bf" : col);
      g.fillStyle = gr; g.strokeStyle = "rgba(30,20,60,.55)"; g.lineWidth = 2.2;
      g.beginPath(); g.moveTo(4, 0); g.bezierCurveTo(20, -56, 62, -66, 74, -40); g.bezierCurveTo(70, -22, 60, -14, 52, -10); g.bezierCurveTo(60, -4, 58, 6, 46, 6); g.bezierCurveTo(48, 16, 38, 22, 28, 18); g.bezierCurveTo(22, 26, 12, 22, 4, 10); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = "rgba(255,255,255,.7)"; g.lineWidth = 1.6; [[14, -18, 58, -42], [14, -8, 50, -10], [12, 2, 36, 12]].forEach(([a, b, c2, d2]) => { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo((a + c2)/2, b - 8, c2, d2); g.stroke(); });
      g.restore(); });
    c.w = w; c.h = h; WCACHE.set(key, c); return c; }
  /* 🐾 펫 그림 (이모지 + 반짝 테두리) */
  const PCACHE = new Map();
  function petSpr(id){ const k = NG.k || 1, key = id + "|" + k; let c = PCACHE.get(key); if (c) return c; const P = PETS.find(p => p.id === id); if (!P) return null;
    c = document.createElement("canvas"); c.width = Math.ceil(64*k); c.height = Math.ceil(64*k); const g = c.getContext("2d"); g.scale(k, k);
    const gr = g.createRadialGradient(32, 34, 4, 32, 34, 30); gr.addColorStop(0, P.c + "aa"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.beginPath(); g.arc(32, 34, 30, 0, 7); g.fill();
    g.font = `40px ${typeof EMOJI !== "undefined" ? EMOJI : "sans-serif"}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(P.e, 32, 35); c.w = 64; c.h = 64; PCACHE.set(key, c); return c; }

  /* ---------- 사고 끼기 ---------- */
  async function buy(sid, clsId, slot){
    const cur = of(sid, clsId)[slot] || 0; if (cur >= MAX) throw new Error("이미 최고 단계예요");
    const cost = price(cur + 1);
    await Store.kidTx(sid, w => { if ((w.coins || 0) < cost) throw new Error(`코인이 ${(cost - (w.coins || 0)).toLocaleString()}개 모자라요`);
      const q = JSON.parse(JSON.stringify(w.qd || {})); q[clsId] = Object.assign({}, q[clsId] || {}); if ((q[clsId][slot] || 0) !== cur) throw new Error("다시 눌러 주세요");
      q[clsId][slot] = cur + 1; w.coins -= cost; w.qd = q; return w; });
    return cur + 1;
  }
  async function enhance(sid, clsId, slot){
    const g = of(sid, clsId), n = g.e[slot] || 0; if (n >= EMAX) throw new Error("이미 +15 최고 강화예요");
    const cost = ecost(n), ok = Math.random() < echance(n);   // 🎲 성공은 미리 정해요 (저장할 때 똑같이)
    await Store.kidTx(sid, w => { if ((w.coins || 0) < cost) throw new Error(`코인이 ${(cost - (w.coins || 0)).toLocaleString()}개 모자라요`);
      const q = JSON.parse(JSON.stringify(w.qd || {})); q[clsId] = Object.assign({}, q[clsId] || {}); q[clsId].e = Object.assign({}, q[clsId].e || {});
      if ((q[clsId].e[slot] || 0) !== n) throw new Error("다시 눌러 주세요");
      if (ok) q[clsId].e[slot] = n + 1; w.coins -= cost; w.qd = q; return w; });
    return ok ? n + 1 : -1;
  }
  async function buyPet(sid, id){
    const P = PETS.find(p => p.id === id); if (!P) return;
    await Store.kidTx(sid, w => { const q = JSON.parse(JSON.stringify(w.qd || {})); q.pets = Object.assign({}, q.pets || {});
      if (!q.pets[id]){ if ((w.coins || 0) < P.price) throw new Error(`코인이 ${(P.price - (w.coins || 0)).toLocaleString()}개 모자라요`); w.coins -= P.price; q.pets[id] = Date.now(); }
      q.pet = id; w.qd = q; return w; });
  }
  async function petOff(sid){ await Store.kidTx(sid, w => { const q = JSON.parse(JSON.stringify(w.qd || {})); q.pet = null; w.qd = q; return w; }); }

  /* ---------- 🛒 상점 화면 ---------- */
  const UI = {
    tab: 0, busy: false,
    open(sid, cls){
      this.sid = sid || sidOf(ARC.me); if (cls != null) this.tab = cls; this.css();
      let el = $("#qgShop"); if (!el){ el = document.createElement("div"); el.id = "qgShop"; el.className = "qg-shop"; document.body.appendChild(el);
        ["keydown", "keyup"].forEach(ev => el.addEventListener(ev, e => e.stopPropagation()));
        el.onclick = e => this.click(e); }
      el.hidden = false; this.paint();
      if (!this.sub){ this.sub = () => { if (!$("#qgShop").hidden) this.paint(); }; Store.subs.push(this.sub); }
    },
    close(){ const el = $("#qgShop"); if (el) el.hidden = true; },
    css(){ if ($("#qgCss")) return; const st = document.createElement("style"); st.id = "qgCss"; st.textContent = `
.qg-shop{position:fixed;inset:0;z-index:950;background:rgba(8,5,22,.78);display:grid;place-items:center;padding:12px;font-family:"Gowun Dodum",sans-serif;color:#fff}
.qg-shop[hidden]{display:none}
.qg-box{width:min(940px,100%);max-height:100%;overflow:auto;background:linear-gradient(160deg,#211a4d,#120d2c);border:1px solid rgba(255,255,255,.14);border-radius:24px;box-shadow:0 20px 60px rgba(0,0,0,.6);padding:16px 18px 18px}
.qg-hd{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.qg-hd h2{margin:0;font:26px "Jua",sans-serif;flex:1;min-width:200px}
.qg-hd h2 small{font:13px "Gowun Dodum",sans-serif;color:#b9b0dd;margin-left:6px}
.qg-coin{font:20px "Jua",sans-serif;color:#ffe066;background:rgba(255,212,59,.1);border:1px solid rgba(255,212,59,.35);border-radius:999px;padding:6px 14px}
.qg-x{width:40px;height:40px;border-radius:50%;border:0;background:rgba(255,255,255,.1);color:#fff;font-size:18px;cursor:pointer}
.qg-tabs{display:flex;gap:6px;margin:14px 0 12px;overflow-x:auto;scrollbar-width:none}
.qg-tabs button{flex:none;font:16px "Jua",sans-serif;color:#d6cff7;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:8px 14px;cursor:pointer}
.qg-tabs button.on{background:#fff;color:#1b1340;border-color:#fff}
.qg-main{display:grid;grid-template-columns:240px 1fr;gap:14px}
@media (max-width:700px){.qg-main{grid-template-columns:1fr}}
.qg-hero{background:radial-gradient(120% 80% at 50% 20%,rgba(124,92,255,.35),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:10px;text-align:center}
.qg-hero canvas{width:200px;height:220px;display:block;margin:0 auto}
.qg-hero b{display:block;font:20px "Jua",sans-serif}
.qg-pow{display:inline-block;margin-top:6px;font:15px "Jua",sans-serif;color:#ffe066;background:rgba(0,0,0,.25);border-radius:999px;padding:4px 12px}
.qg-hero small{display:block;color:#b9b0dd;font-size:12.5px;margin-top:6px;line-height:1.5}
.qg-list{display:flex;flex-direction:column;gap:8px}
.qg-it{display:grid;grid-template-columns:52px 1fr auto auto;gap:12px;align-items:center;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:10px 12px}
.qg-ic{width:52px;height:52px;border-radius:14px;display:grid;place-items:center;font-size:28px;background:linear-gradient(150deg,var(--c),rgba(0,0,0,.25));box-shadow:inset 0 0 0 1px rgba(255,255,255,.2)}
.qg-it b{font:17px "Jua",sans-serif;font-weight:400}
.qg-it b i{font-style:normal;font-size:13px;color:#ffe066;margin-left:6px}
.qg-it p{margin:2px 0 0;font-size:12.5px;color:#b9b0dd;line-height:1.45}
.qg-it p em{font-style:normal;color:#8ce99a}
.qg-buy{font:16px "Jua",sans-serif;color:#2b1d5c;background:linear-gradient(180deg,#ffe066,#fab005);border:0;border-radius:14px;padding:10px 14px;cursor:pointer;box-shadow:0 3px 0 #c77d00;white-space:nowrap}
.qg-buy small{display:block;font-size:11px;opacity:.75}
.qg-buy:disabled{filter:grayscale(1);opacity:.5;cursor:default}
.qg-buy.eq{background:linear-gradient(180deg,#8ce99a,#2f9e44);color:#fff;box-shadow:0 3px 0 #1b5e20}
.qg-buy.on{background:rgba(255,255,255,.12);color:#fff;box-shadow:none}
.qg-bar{height:6px;border-radius:3px;background:rgba(255,255,255,.1);margin-top:6px;overflow:hidden}
.qg-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--c),#fff)}
.qg-ic{position:relative}.qg-ic u{position:absolute;right:-6px;bottom:-6px;text-decoration:none;font:12px "Jua",sans-serif;background:#ff6b6b;color:#fff;border-radius:999px;padding:1px 6px;box-shadow:0 2px 0 rgba(0,0,0,.3)}
.qg-buy.qg-en{background:linear-gradient(180deg,#b197fc,#7048e8);color:#fff;box-shadow:0 3px 0 #4c2fb0}
.qg-ok .qg-msg{color:#8ce99a;animation:qgPop .5s}.qg-no .qg-msg{color:#ffa8a8;animation:qgShake .4s}
@keyframes qgPop{0%{transform:scale(.6)}60%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes qgShake{0%,100%{transform:none}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
@media (max-width:700px){.qg-it{grid-template-columns:44px 1fr;}.qg-it .qg-buy{grid-column:span 1}.qg-ic{width:44px;height:44px}}
.qg-msg{min-height:20px;margin-top:10px;text-align:center;font-size:14px;color:#ffa8a8}
.qg-rec{margin-top:12px;font-size:12.5px;color:#b9b0dd;line-height:1.6;background:rgba(0,0,0,.2);border-radius:14px;padding:8px 12px}
.qg-rec b{color:#ffe066;font-weight:400;font-family:"Jua",sans-serif}
.qd-shopb{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;margin:0 0 12px;font-size:20px;padding:12px 16px;background:linear-gradient(135deg,#ffd43b,#ff922b) !important;color:#3b1d00 !important;border:0 !important;border-radius:16px}
.qd-shopb small{font:13px "Gowun Dodum",sans-serif;opacity:.8}`; document.head.appendChild(st); },
    paint(){
      const el = $("#qgShop"); if (!el) return; const sid = this.sid, w = walletOf(sid), T = this.tab;
      const tabs = QCL.map((C, i) => `<button data-tab="${i}" class="${T === i ? "on" : ""}">${C.e} ${C.n}</button>`).join("") + `<button data-tab="4" class="${T === 4 ? "on" : ""}">🐾 펫</button>`;
      let main;
      if (T < 4){ const C = QCL[T], g = of(sid, C.id), pw = power(g);
        const rows = SLOTS.map(s => { const t = g[s.k] || 0, nx = t + 1, max = t >= MAX, cost = price(nx), en = g.e[s.k] || 0, ec = ecost(en), emax = en >= EMAX;
          return `<div class="qg-it" style="--c:${TIER[t].c}"><span class="qg-ic">${s.e}${en ? `<u>+${en}</u>` : ""}</span><div><b>${en ? `+${en} ` : ""}${nameOf(s.k, C.id, t)}<i>Lv.${t}</i></b>
            <p>${t || en ? effTxt(s.k, t, en) : "아직 기본 장비예요"}${max ? "" : ` → <em>${effTxt(s.k, nx, en)}</em>`}</p><div class="qg-bar"><i style="width:${t/MAX*100}%"></i></div></div>
            ${max ? `<button class="qg-buy on" disabled>👑 최고 장비</button>` : `<button class="qg-buy" data-buy="${s.k}" ${(w.coins || 0) < cost || this.busy ? "disabled" : ""}>🪙 ${cost.toLocaleString()}<small>🆙 ${TIER[nx].n}(으)로 바꾸기</small></button>`}
            ${emax ? `<button class="qg-buy on qg-en" disabled>🔨 +15 최고</button>` : `<button class="qg-buy qg-en" data-en="${s.k}" ${(w.coins || 0) < ec || this.busy ? "disabled" : ""}>🔨 ${ec.toLocaleString()}<small>+${en + 1} 강화 · 성공 ${Math.round(echance(en)*100)}%</small></button>`}</div>`; }).join("");
        const reach = REACH.get("qd", sid), nextRec = rec(Math.min(QD_MAX - 1, reach - 1));
        main = `<div class="qg-main"><div class="qg-hero"><canvas id="qgCv" width="400" height="440"></canvas><b>${C.e} ${C.n}</b><span class="qg-pow">⭐ 장비 ${pw} / ${SLOTS.length*MAX}</span>
          <small>${g.pet ? `🐾 ${PETS.find(p => p.id === g.pet).e} ${PETS.find(p => p.id === g.pet).n} 데려가는 중` : "🐾 펫 없음 (펫 탭에서 데려와요)"}<br>✨ ${C.sp} · 🌀 ${QSK[C.id][0].n} · 🌊 ${QSK[C.id][1].n}${C.reach ? "<br>💪 근거리 영웅: 공격력 ×1.45" : ""}</small></div>
          <div><div class="qg-list">${rows}</div><div class="qg-rec">🗺️ 지금 <b>${reach}단계</b>까지 왔어요 · 이 단계 추천 장비 <b>⭐${nextRec}</b>${pw < nextRec ? " — 강화하면 훨씬 쉬워져요!" : " — 충분해요! 💪"}<br>
          🆙 바꾸기: 더 좋은 장비로 · 🔨 강화: 코인으로 +1씩 (실패해도 장비는 그대로)<br>추천: 30단계 ⭐${rec(29)} · 50단계 ⭐${rec(49)} · 80단계 ⭐${rec(79)} · 100단계 ⭐${rec(99)} · ${QD_MAX}단계 ⭐${rec(QD_MAX - 1)}</div></div></div>`;
      } else {
        const q = kid(sid), own = q.pets || {};
        main = `<div class="qg-list">${PETS.map(P => { const has = !!own[P.id], on = q.pet === P.id;
          return `<div class="qg-it" style="--c:${P.c}"><span class="qg-ic">${P.e}</span><div><b>${P.n}<i>✨ ${P.sk}</i></b><p>${P.d} · 평소엔 따라다니며 콕콕 공격해요 · <em>P 키</em>(📱 ${P.e} 단추)로 스킬</p></div>
            ${on ? `<button class="qg-buy on" data-petoff="1">✔ 데려가는 중</button>` : has ? `<button class="qg-buy eq" data-pet="${P.id}">데려가기</button>` : `<button class="qg-buy" data-pet="${P.id}" ${(w.coins || 0) < P.price || this.busy ? "disabled" : ""}>🪙 ${P.price.toLocaleString()}<small>입양하기</small></button>`}</div>`; }).join("")}</div>
          <div class="qg-rec">🐾 펫은 한 번 데려오면 <b>모든 영웅</b>이 함께 다녀요 · 한 번에 한 마리</div>`;
      }
      el.innerHTML = `<div class="qg-box${this.flash ? " qg-" + this.flash : ""}"><div class="qg-hd"><h2>🛒 용사 상점<small>${esc(who(noOf_(sid)))} · 영웅마다 장비가 따로예요</small></h2><span class="qg-coin">🪙 ${(w.coins || 0).toLocaleString()}</span><button class="qg-x" data-x>✕</button></div>
        <div class="qg-tabs">${tabs}</div>${main}<div class="qg-msg" id="qgMsg">${this.msg || ""}</div></div>`;
      if (T < 4) this.hero(T); this.flash = "";
    },
    hero(ci){ const cv = $("#qgCv"); if (!cv || typeof WAR === "undefined") return; const C = QCL[ci], g = of(this.sid, C.id), D = def(C.id, g), t = cv.getContext("2d"); t.clearRect(0, 0, 400, 440);
      try { if (g.wing){ const ws = wingSpr(g.wing); t.drawImage(ws, 200 - ws.w*1.25, 150 - ws.h*.9, ws.w*2.5, ws.h*2.5); }
        const hc = WAR.spr("hq" + ci + D.sig, "war", D.d, "idle0", 1.9); t.drawImage(hc, 200 - hc.ax, 420 - hc.ay, hc.w, hc.h);
        if (g.pet){ const ps = petSpr(g.pet); t.drawImage(ps, 290, 150, 100, 100); } } catch(e){ console.warn(e); } },
    async click(e){
      const b = e.target.closest("button"); if (!b || b.disabled) { if (e.target === $("#qgShop")) this.close(); return; }
      if (b.dataset.x != null){ this.close(); return; }
      if (b.dataset.tab != null){ this.tab = +b.dataset.tab; this.msg = ""; this.paint(); return; }
      const sid = this.sid; this.busy = true; this.msg = "";
      try {
        if (b.dataset.en){ const C = QCL[this.tab], r = await enhance(sid, C.id, b.dataset.en); this.flash = r > 0 ? "ok" : "no";
          this.msg = r > 0 ? `🔨✨ 강화 성공! ${SLOTS.find(x => x.k === b.dataset.en).n} +${r}` : "💥 아쉽게 강화 실패… 장비는 그대로예요. 한 번 더?"; (r > 0 ? (SFX.rec || SFX.item) : (SFX.over || (() => {})))(); }
        else if (b.dataset.buy){ const C = QCL[this.tab], t = await buy(sid, C.id, b.dataset.buy); this.msg = `✨ ${nameOf(b.dataset.buy, C.id, t)}(${t}강)으로 강화했어요!`; SFX.item && SFX.item(); }
        else if (b.dataset.pet){ await buyPet(sid, b.dataset.pet); const P = PETS.find(p => p.id === b.dataset.pet); this.msg = `🐾 ${P.e} ${P.n}이(가) 함께 다녀요!`; SFX.item && SFX.item(); }
        else if (b.dataset.petoff){ await petOff(sid); this.msg = "펫을 쉬게 했어요"; }
      } catch(err){ this.msg = "😢 " + (err.message || err); }
      this.busy = false; this.paint();
    }
  };
  setTimeout(() => UI.css(), 0);
  return {EMAX, ecost, echance, enhance, MAX, SLOTS, TIER, PETS, price, rec, SD, ED, of, botGear, power, stats, def, wingSpr, petSpr, nameOf, buy, buyPet, UI};
})();
