/* =====================================================================
   👕 오락실 아바타 — 코인 상점 · 오락실 전용 고급 아이템(움직이는 배경·테두리·날개·효과·펫·칭호)
   손들고 말해요의 avatarSVG 위에 AVX 훅으로 덧그려요.
   ===================================================================== */

/* ---------- 오락실 전용 아이템 목록 [값, 이름, 가격] ---------- */
const XI = {
  xbg: [["none","없음",0],["aurora","오로라",300],["fireworks","불꽃놀이",400],["sakura","벚꽃비",250],["snowfall","함박눈",200],["waves","노을 바다",250],
        ["neoncity","네온 시티",400],["vortex","소용돌이 은하",500],["lavaflow","용암 화산",400],["pixel","8비트 오락실",300],["heaven","구름 위 천국",600],["diamondcave","다이아 동굴",800],["dragonsky","드래곤 하늘",1200]],
  xfr: [["none","없음",0],["spin","무지개 전광판",300],["flame","타오르는 불꽃",400],["electric","찌릿찌릿 번개",400],["pixel","픽셀 오락기",250],["sakura","벚꽃 화관",300],["crystal","크리스탈",500],["champion","챔피언",800],["legend","전설의 황금",1500]],
  aura: [["none","없음",0],["glow","반짝 빛",200],["fireaura","불꽃 오라",400],["iceaura","얼음 오라",400],["rainbowaura","무지개 링",600],["angel","천사 날개",800],["bat","박쥐 날개",600],["butterfly","나비 날개",700],["dragon","드래곤 날개",1500]],
  fx: [["none","없음",0],["sparkle","반짝반짝",150],["hearts","두근 하트",150],["notes","음표",150],["bubbles","비눗방울",120],["snow","눈송이",150],["confetti","꽃가루",300],["orbit","도는 별",300]],
  pet: [["none","없음",0],["chick","🐥 병아리",120],["dog","🐶 강아지",150],["cat","🐱 고양이",150],["bunny","🐰 토끼",150],["hamster","🐹 햄스터",150],["panda","🐼 판다",250],["fox","🦊 여우",250],
        ["penguin","🐧 펭귄",250],["ghost","👻 유령",300],["robot","🤖 로봇",500],["dino","🦖 공룡",500],["unicorn","🦄 유니콘",600],["dragon","🐲 아기 용",1000]],
  title: [["none","없음",0],["sprout","🌱 오락실 새싹",50],["jumper","🦘 점프왕",150],["star","⭐ 반짝 스타",200],["combo","🔥 콤보 장인",300],["brain","🧠 천재 두뇌",300],
          ["ace","🎯 에이스",500],["champ","🏆 챔피언",800],["legend","👑 전설의 게이머",1500],["king","💎 오락실의 왕",2500]]
};
const PET_E = {chick:"🐥",dog:"🐶",cat:"🐱",bunny:"🐰",hamster:"🐹",panda:"🐼",fox:"🦊",penguin:"🐧",ghost:"👻",robot:"🤖",dino:"🦖",unicorn:"🦄",dragon:"🐲"};

/* ---------- 손들고 말해요 아이템 가격 (없는 건 무료) ---------- */
const PRICE = {
  eyes: {star: 60, fierce: 40, cool: 40}, cheek: {star: 40},
  hat: {cap: 40, beanie: 40, ribbon: 40, flower: 40, cat: 80, bunny: 80, phones: 80, goggle: 80, horn: 120, crown: 300},
  glasses: {round: 30, square: 30, sun: 80, heart: 80},
  top: {overall: 60, cape: 120}, pat: {stripe: 30, dots: 30, star: 60, heart: 60},
  bg: {sunset: 50, forest: 50, beach: 50, snow: 50, ocean: 80, night: 80, candy: 80, hearts: 80, rainbow: 150, castle: 150, stage: 150, space: 150, galaxy: 200, chalk: 60, gold: 300},
  frame: {wood: 60, leaf: 60, flower: 80, hearts: 80, star: 80, rainbow: 120, ice: 120, gold: 150, neon: 150, bolt: 150, fire: 200, gem: 250, royal: 400},
  hero: {hero: 300, ninja: 300, armor: 500, samurai: 500, space: 700, goldarmor: 1200},
  helm: {viking: 250, knight: 400, spartan: 500, spacehelm: 700, dragon: 1200},
  weapon: {woodsword: 80, shield: 150, sword: 300, staff: 400, bow: 400, lightblade: 800, legend: 1500},
  idol: {ghoodie: 250, schoolidol: 300, tweed: 400, sequin: 500, stagedress: 700, diamond: 1200},
  acc: {starpins: 60, earrings: 80, glitter: 100, headset: 150, choker: 150, butterfly: 200, tiara: 500, crystal: 1200},
  tout: {track: 150, cardigan: 200, labcoat: 250, suit: 300, tux: 500, captain: 600, wizard: 800, general: 800, king: 1200},
  thead: {gradcap: 200, captainhat: 300, wizhat: 400, laurel: 600, halo: 800, kingcrown: 1000},
  tacc: {chalk: 50, pointer: 80, book: 80, mug: 80, whistle: 80, wand: 300, trophy: 500}
};
/* 🎁 선생님 상: 상점에서 살 수 없고 선생님만 줄 수 있는 칭호·아바타 (gift.js 에서 채워요) */
const GIFTS = new Set();
const isGift = (slot, v) => GIFTS.has(slot + ":" + v);
const priceOf = (slot, v) => { if (XI[slot]){ const it = XI[slot].find(x => x[0] === v); return it ? it[2] : 0; } return (PRICE[slot] || {})[v] || 0; };
const itemName = (slot, v) => { const L = XI[slot] || AV[slot] || []; const it = L.find(x => x[0] === v); return it ? it[1] : v; };
const RAR = {c: ["일반", "#adb5bd"], r: ["희귀", "#4dabf7"], e: ["영웅", "#b197fc"], l: ["전설", "#ffd43b"], g: ["선생님 상", "#ff8ec6"]};
const rarOf = p => p >= 700 ? "l" : p >= 300 ? "e" : p >= 100 ? "r" : "c";

/* 상점 칸 */
const CATS = [
  {id: "face", n: "😀 얼굴", slots: [["skin","피부"],["hair","머리 모양"],["hairC","머리색"],["eyes","눈"],["mouth","입"],["cheek","볼"]]},
  {id: "wear", n: "👕 옷", slots: [["top","옷"],["topC","옷 색"],["pat","무늬"],["hero","히어로"],["idol","스타일"],["tout","특별한 옷"]]},
  {id: "head", n: "👑 모자·장신구", slots: [["hat","모자"],["helm","투구"],["thead","특별 모자"],["glasses","안경"],["acc","장신구"],["weapon","손에 든 것"],["tacc","소품"]]},
  {id: "bg", n: "🌌 배경", slots: [["xbg","✨ 움직이는 배경"],["bg","배경"]]},
  {id: "frame", n: "🖼️ 테두리", slots: [["xfr","✨ 움직이는 테두리"],["frame","테두리"]]},
  {id: "fx", n: "🪽 날개·효과·펫", slots: [["aura","날개·오라"],["fx","반짝 효과"],["pet","펫"]]},
  {id: "title", n: "🏷️ 칭호", slots: [["title","칭호"]]},
  {id: "gift", n: "🎁 선생님 상", slots: [["title","칭호"],["xbg","배경"],["xfr","테두리"],["aura","날개"],["fx","효과"]]}
];
const optsOf = slot => (XI[slot] || AV[slot] || []).map(x => x[0]);
/* 같이 입을 수 없는 것 */
const CLASH = {hero: ["idol","tout"], idol: ["hero","tout"], tout: ["hero","idol"], hat: ["helm","thead"], helm: ["hat","thead"], thead: ["hat","helm"], bg: ["xbg"], frame: ["xfr"], acc: [], weapon: ["tacc"], tacc: ["weapon"]};

/* ---------- 기본 아바타 (번호로 정해져서 늘 똑같아요) ---------- */
function avDefault(no){
  let s = (no*9301 + 49297) % 233280; const r = () => (s = (s*9301 + 49297) % 233280)/233280;
  const free = k => AV[k].map(x => x[0]).filter(v => !priceOf(k, v) && v !== "bald");
  const pick = k => { const L = free(k); return L[Math.floor(r()*L.length)]; };
  return {skin: pick("skin"), hair: pick("hair"), hairC: pick("hairC"), eyes: pick("eyes"), mouth: pick("mouth"), cheek: Math.floor(r()*2) ? "pink" : "none",
    hat: "none", glasses: "none", top: ["tee","hoodie","shirt"][Math.floor(r()*3)], topC: pick("topC"), pat: "none", bg: "sky", frame: "basic",
    hero: "none", helm: "none", weapon: "none", idol: "none", acc: "none", tout: "none", thead: "none", tacc: "none", xbg: "none", xfr: "none", aura: "none", fx: "none", pet: "none", title: "none", on: true};
}
const walletOf = sid => Object.assign({coins: 0, total: 0, owned: {}}, (Store.kids || {})[sid]);
function avOf(sid){ const w = (Store.kids || {})[sid]; const d = avDefault(noOf_(sid)); return w && w.av ? Object.assign(d, w.av) : d; }
const owns = (sid, slot, v) => isGift(slot, v) ? (sid === sidOf(TEACHER) || !!walletOf(sid).owned[`${slot}:${v}`]) : (!priceOf(slot, v) || !!walletOf(sid).owned[`${slot}:${v}`]);
const ttlCls = t => `ttl ttl-${t}${isGift("title", t) ? " gift" : ""}`;

/* ---------- 그림: 사진 대신 쓰는 얼굴 이미지 (가져온 게임들이 씀) ---------- */
const AVIMG = {};
function avPhoto(sid){
  const a = avOf(sid), key = JSON.stringify(a);
  if (AVIMG[sid] && AVIMG[sid].k === key) return AVIMG[sid].u;
  AVX.still = true; const svg = avatarSVG(Object.assign({}, a, {frame: "basic", xfr: "none", fx: "none", pet: "none"}), "", "15 13 70 70"); AVX.still = false;
  const u = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  AVIMG[sid] = {k: key, u}; return u;
}
/* 화면에 그릴 아바타 (still: 움직이지 않게 · face: 얼굴만 크게) */
/* ⚡ 렉 줄이기: 움직이지 않는 아바타(목록·랭킹·채팅)는 그림(img)으로 한 번만 만들어 두고 다시 써요.
   SVG를 화면에 수십 개 그대로 넣으면 그라디언트·번짐 필터를 매번 다시 계산해서 느려져요. */
const AVSTILL = new Map();
function avStillURL(sid, face){
  const a = avOf(sid), key = sid + (face ? "|f|" : "|a|") + JSON.stringify(a);
  let u = AVSTILL.get(key); if (u) return u;
  AVX.still = true; let svg = avatarSVG(a, "", face ? "15 13 70 70" : undefined); AVX.still = false;
  if (!/xmlns=/.test(svg.slice(0, 200))) svg = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
  u = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  if (AVSTILL.size > 600) AVSTILL.clear();
  AVSTILL.set(key, u); return u;
}
function avHTMLof(sid, o = {}){
  if (o.still) return `<img src="${avStillURL(sid, o.face)}" alt="" draggable="false" decoding="async">`;
  AVX.still = false; const svg = avatarSVG(avOf(sid), "", o.face ? "15 13 70 70" : undefined); return svg;
}
function titleHTML(sid){ const t = avOf(sid).title; if (!t || t === "none") return ""; return `<span class="${ttlCls(t)}">${esc(itemName("title", t))}</span>`; }

/* =====================================================================
   AVX: 오락실 전용 고급 아이템 그리기 (손들고 말해요 avatarSVG 훅)
   ===================================================================== */
const AVX = {
  still: false,
  A(s){ return this.still ? "" : s; },   // 움직임은 still 일 때 빼요
  bg(a, id){ const f = this.BG[a.xbg]; return f ? f.call(this, id) : ""; },
  under(a, id){ const f = this.AU[a.aura]; return f ? f.call(this, id) : ""; },
  over(a, id){ let s = ""; const f = this.FX[a.fx]; if (f) s += f.call(this, id);
    if (a.pet && PET_E[a.pet]) s += `<g><ellipse cx="85" cy="97" rx="9" ry="2.4" fill="#000" opacity=".25"/><g>${this.A(`<animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="1.2s" repeatCount="indefinite"/>`)}<text x="85" y="94" font-size="19" text-anchor="middle" font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif">${PET_E[a.pet]}</text></g></g>`;
    return s; },
  frame(a, id){ const f = this.FR[a.xfr]; return f ? f.call(this, id) : ""; },
  stars(n, seed, col = "#fff", maxY = 70){ let s = ""; for (let i = 0; i < n; i++){ const x = (i*37 + seed*13) % 97 + 1.5, y = (i*53 + seed*7) % maxY + 2, r = .5 + (i % 3)*.35;
    s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}">${this.A(`<animate attributeName="opacity" values="1;.2;1" dur="${1.5 + (i % 4)*.6}s" begin="${(i*.37) % 2}s" repeatCount="indefinite"/>`)}</circle>`; } return s; },
  fall(n, seed, shape, dur = 6, sway = 6){ let s = ""; for (let i = 0; i < n; i++){ const x = (i*29 + seed*17) % 96 + 2, d = dur + (i % 4)*1.2, b = -((i*1.7) % d);
    s += `<g transform="translate(${x} -8)">${this.A(`<animateTransform attributeName="transform" type="translate" values="${x} -8;${x + sway} 50;${x - sway/2} 110" dur="${d}s" begin="${b}s" repeatCount="indefinite"/>`)}<g transform="${this.still ? `translate(0 ${(i*31) % 100})` : ""}">${shape(i)}</g></g>`; } return s; },
  rise(n, seed, shape, dur = 5){ let s = ""; for (let i = 0; i < n; i++){ const x = (i*31 + seed*11) % 90 + 5, d = dur + (i % 3)*1.3, b = -((i*1.3) % d);
    s += `<g transform="translate(${x} ${(i*37) % 100})">${this.A(`<animateTransform attributeName="transform" type="translate" values="${x} 108;${x + 4} 50;${x - 3} -8" dur="${d}s" begin="${b}s" repeatCount="indefinite"/>`)}${shape(i)}</g>`; } return s; },

  /* ---------- ✨ 움직이는 배경 ---------- */
  BG: {
    aurora(id){ return `<defs><linearGradient id="${id}xa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050b2e"/><stop offset=".7" stop-color="#0d2b4f"/><stop offset="1" stop-color="#123d4a"/></linearGradient>
      <linearGradient id="${id}xb" x1="0" x2="1"><stop offset="0" stop-color="#3cff9e" stop-opacity="0"/><stop offset=".5" stop-color="#3cff9e" stop-opacity=".8"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id}xc" x1="0" x2="1"><stop offset="0" stop-color="#c084fc" stop-opacity="0"/><stop offset=".5" stop-color="#e879f9" stop-opacity=".7"/><stop offset="1" stop-color="#60a5fa" stop-opacity="0"/></linearGradient>
      <filter id="${id}xbl"><feGaussianBlur stdDeviation="2.4"/></filter></defs>
      <rect width="100" height="100" fill="url(#${id}xa)"/>${this.stars(26, 1)}
      <g filter="url(#${id}xbl)"><path d="M-10,40 Q15,20 40,36 T90,30 T130,34 L130,50 Q100,44 80,52 T30,50 T-10,58 Z" fill="url(#${id}xb)">${this.A(`<animateTransform attributeName="transform" type="translate" values="0 0;-14 4;0 0" dur="7s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;1;.6" dur="4s" repeatCount="indefinite"/>`)}</path>
      <path d="M-10,22 Q20,8 45,22 T100,16 T130,20 L130,34 Q100,26 70,34 T20,34 T-10,38 Z" fill="url(#${id}xc)">${this.A(`<animateTransform attributeName="transform" type="translate" values="-10 0;6 3;-10 0" dur="9s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;.5;1" dur="5s" repeatCount="indefinite"/>`)}</path></g>
      <path d="M0,86 L14,74 L24,82 L36,70 L50,84 L62,72 L76,82 L88,72 L100,80 L100,100 L0,100 Z" fill="#071a2b"/>`; },
    fireworks(id){ const burst = (cx, cy, c, b) => `<g transform="translate(${cx} ${cy})">${[...Array(12)].map((_, i) => { const an = i*30*Math.PI/180;
        return `<circle cx="${(Math.cos(an)*12).toFixed(1)}" cy="${(Math.sin(an)*12).toFixed(1)}" r="1.5" fill="${c}"/>`; }).join("")}<circle r="2.4" fill="#fff"/>
        ${this.A(`<animateTransform attributeName="transform" type="scale" additive="sum" values="0.1;1.2;1.3" keyTimes="0;.6;1" dur="2.4s" begin="${b}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0" keyTimes="0;.6;1" dur="2.4s" begin="${b}s" repeatCount="indefinite"/>`)}</g>`;
      return `<defs><linearGradient id="${id}xf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0628"/><stop offset="1" stop-color="#3a1162"/></linearGradient></defs>
      <rect width="100" height="100" fill="url(#${id}xf)"/>${this.stars(18, 3)}${burst(24, 26, "#ff6b6b", 0)}${burst(74, 20, "#ffd43b", .8)}${burst(52, 40, "#69db7c", 1.6)}${burst(86, 46, "#da77f2", 1.2)}${burst(14, 50, "#4dabf7", .4)}
      <path d="M0,100 L0,80 L8,80 L8,70 L16,70 L16,82 L24,82 L24,64 L34,64 L34,78 L44,78 L44,72 L56,72 L56,84 L64,84 L64,66 L74,66 L74,78 L84,78 L84,70 L92,70 L92,82 L100,82 L100,100 Z" fill="#120a2a"/>
      ${[[11,74],[28,70],[30,76],[67,72],[70,78],[88,76]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="2" height="2" fill="#ffe066">${this.A(`<animate attributeName="opacity" values="1;.2;1" dur="${2 + i*.5}s" repeatCount="indefinite"/>`)}</rect>`).join("")}`; },
    sakura(id){ return `<defs><linearGradient id="${id}xs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffdeeb"/><stop offset="1" stop-color="#fff0f6"/></linearGradient></defs>
      <rect width="100" height="100" fill="url(#${id}xs)"/><circle cx="80" cy="18" r="10" fill="#fff" opacity=".7"/>
      <path d="M-4,14 Q20,22 34,14 Q44,8 56,12" fill="none" stroke="#7a4b36" stroke-width="3" stroke-linecap="round"/><path d="M20,19 Q24,28 18,34" fill="none" stroke="#7a4b36" stroke-width="2"/>
      ${[[6,12],[16,20],[28,13],[40,10],[52,13],[19,32],[34,17]].map(([x, y]) => `<g transform="translate(${x} ${y})">${[0,72,144,216,288].map(d => `<ellipse cx="0" cy="-3" rx="2.2" ry="3.2" fill="#ffa8c5" transform="rotate(${d})"/>`).join("")}<circle r="1.2" fill="#fff3bf"/></g>`).join("")}
      ${this.fall(12, 2, i => `<ellipse rx="1.8" ry="1.1" fill="${i % 2 ? "#ff8fb4" : "#ffc2d6"}" transform="rotate(${i*40})">${this.A(`<animateTransform attributeName="transform" type="rotate" values="0;360" dur="${2 + i % 3}s" repeatCount="indefinite"/>`)}</ellipse>`, 7, 10)}
      <path d="M0,88 Q30,80 60,86 T100,84 L100,100 L0,100 Z" fill="#c3fae8"/>`; },
    snowfall(id){ return `<defs><linearGradient id="${id}xw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c3d6e"/><stop offset="1" stop-color="#7fb2e5"/></linearGradient></defs>
      <rect width="100" height="100" fill="url(#${id}xw)"/><path d="M0,78 Q25,66 50,76 T100,72 L100,100 L0,100 Z" fill="#e7f5ff"/><path d="M0,86 Q30,78 60,86 T100,84 L100,100 L0,100 Z" fill="#fff"/>
      <path d="M12,76 L18,62 L24,76 Z M16,66 L18,60 L20,66 Z" fill="#2b8a3e"/><path d="M80,72 L87,56 L94,72 Z" fill="#2f9e44"/>
      ${this.fall(22, 4, i => `<circle r="${.8 + (i % 3)*.5}" fill="#fff" opacity=".9"/>`, 6, 5)}`; },
    waves(id){ const wave = (y, c, d, o) => `<path d="M-30,${y} Q-17,${y - 4} -5,${y} T20,${y} T45,${y} T70,${y} T95,${y} T120,${y} T145,${y} L145,100 L-30,100 Z" fill="${c}" opacity="${o}">${this.A(`<animateTransform attributeName="transform" type="translate" values="0 0;25 0" dur="${d}s" repeatCount="indefinite"/>`)}</path>`;
      return `<defs><linearGradient id="${id}xv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7e5f"/><stop offset=".5" stop-color="#feb47b"/><stop offset=".62" stop-color="#ffd8a8"/></linearGradient></defs>
      <rect width="100" height="100" fill="url(#${id}xv)"/><circle cx="50" cy="58" r="16" fill="#fff3bf">${this.A(`<animate attributeName="r" values="16;17;16" dur="3s" repeatCount="indefinite"/>`)}</circle>
      ${wave(62, "#4dabf7", 4, .9)}${wave(72, "#1c7ed6", 3, .9)}${wave(84, "#1864ab", 2.4, 1)}
      <path d="M16,30 q3,-3 6,0 q3,-3 6,0" fill="none" stroke="#5c3d2e" stroke-width="1"/><path d="M70,24 q2,-2 4,0 q2,-2 4,0" fill="none" stroke="#5c3d2e" stroke-width="1"/>`; },
    neoncity(id){ const bl = [[0,46,14],[14,30,12],[26,52,10],[36,22,14],[50,40,12],[62,28,10],[72,50,12],[84,34,16]];
      return `<defs><linearGradient id="${id}xn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14002e"/><stop offset="1" stop-color="#4c0070"/></linearGradient></defs>
      <rect width="100" height="100" fill="url(#${id}xn)"/>${this.stars(12, 5, "#f0abfc", 40)}<circle cx="78" cy="18" r="9" fill="#ff7ad9" opacity=".8"/>
      ${bl.map(([x, h, w], i) => `<rect x="${x}" y="${80 - h}" width="${w}" height="${h + 20}" fill="#1a0838" stroke="${["#22e1ff","#ff4fd8","#a3ff12"][i % 3]}" stroke-width=".8"/>
        ${[...Array(Math.floor(h/8))].map((_, k) => `<rect x="${x + 2 + (k % 2)*5}" y="${84 - h + k*8}" width="3" height="3" fill="${["#22e1ff","#ff4fd8","#ffe066"][(i + k) % 3]}">${this.A(`<animate attributeName="opacity" values="1;.15;1" dur="${1.4 + ((i + k) % 4)*.7}s" repeatCount="indefinite"/>`)}</rect>`).join("")}`).join("")}
      <rect x="0" y="80" width="100" height="20" fill="#0b0018"/>${[84,88,93,99].map(y => `<line x1="0" y1="${y}" x2="100" y2="${y}" stroke="#ff4fd8" stroke-width=".5" opacity=".7"/>`).join("")}
      ${[-40,-20,0,20,40,60,80,100,120,140].map(x => `<line x1="50" y1="80" x2="${x}" y2="100" stroke="#22e1ff" stroke-width=".5" opacity=".6"/>`).join("")}`; },
    vortex(id){ return `<defs><radialGradient id="${id}xg" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".15" stop-color="#ff8ad8"/><stop offset=".45" stop-color="#5b2a9e"/><stop offset="1" stop-color="#070418"/></radialGradient></defs>
      <rect width="100" height="100" fill="url(#${id}xg)"/>${this.stars(30, 7)}
      <g transform="translate(50 45)">${this.A(`<animateTransform attributeName="transform" type="rotate" additive="sum" values="0;360" dur="18s" repeatCount="indefinite"/>`)}
      ${[0,90,180,270].map(d => `<path d="M0,0 C10,-6 22,-4 30,6 C36,14 34,26 26,32" fill="none" stroke="${d % 180 ? "#b197fc" : "#ff9ce6"}" stroke-width="4" stroke-linecap="round" opacity=".55" transform="rotate(${d})"/>`).join("")}
      ${[0,60,120,180,240,300].map(d => `<circle cx="18" cy="0" r="1.2" fill="#fff" transform="rotate(${d})"/>`).join("")}</g>
      <circle cx="50" cy="45" r="5" fill="#fff" opacity=".8">${this.A(`<animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite"/>`)}</circle>`; },
    lavaflow(id){ return `<defs><linearGradient id="${id}xl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b0000"/><stop offset=".6" stop-color="#8b1300"/><stop offset="1" stop-color="#ff5a00"/></linearGradient></defs>
      <rect width="100" height="100" fill="url(#${id}xl)"/><path d="M0,70 L22,36 L30,40 L40,70 Z M56,70 L74,30 L82,34 L100,70 Z" fill="#1c0703"/>
      <path d="M26,38 Q24,52 30,70 M78,32 Q84,50 76,70" fill="none" stroke="#ff8a00" stroke-width="2.5">${this.A(`<animate attributeName="stroke" values="#ff8a00;#ffd43b;#ff8a00" dur="1.6s" repeatCount="indefinite"/>`)}</path>
      ${this.rise(14, 6, i => `<circle r="${.8 + (i % 3)*.5}" fill="${i % 2 ? "#ffd43b" : "#ff6b00"}"/>`, 4)}
      <path d="M0,74 Q20,68 40,74 T80,72 T100,74 L100,100 L0,100 Z" fill="#ff6b00">${this.A(`<animate attributeName="fill" values="#ff6b00;#ff922b;#ff6b00" dur="2s" repeatCount="indefinite"/>`)}</path>
      <path d="M0,82 Q25,78 50,84 T100,82 L100,100 L0,100 Z" fill="#c92a00"/>`; },
    pixel(id){ const cl = (x, y) => `<g fill="#fff">${[[0,2,12,4],[2,0,8,2],[4,-2,4,2]].map(([a, b, w, h]) => `<rect x="${x + a}" y="${y + b}" width="${w}" height="${h}"/>`).join("")}</g>`;
      return `<rect width="100" height="100" fill="#5c94fc"/>
      <g>${this.A(`<animateTransform attributeName="transform" type="translate" values="0 0;-40 0" dur="12s" repeatCount="indefinite"/>`)}${cl(10, 14)}${cl(50, 22)}${cl(90, 12)}${cl(130, 20)}</g>
      <path d="M0,74 L8,74 L8,66 L16,66 L16,58 L24,58 L24,74 L100,74 L100,100 L0,100 Z" fill="#00a800"/>
      ${[...Array(13)].map((_, i) => `<rect x="${i*8}" y="80" width="8" height="8" fill="#c84c0c" stroke="#000" stroke-width=".6"/><rect x="${i*8 - 4}" y="88" width="8" height="8" fill="#c84c0c" stroke="#000" stroke-width=".6"/>`).join("")}
      <rect x="70" y="40" width="10" height="10" fill="#fc9838" stroke="#000" stroke-width=".8"/><text x="75" y="48.5" font-size="8" text-anchor="middle" fill="#fff" font-family="monospace" font-weight="bold">?</text>
      ${[[84,52],[90,52],[96,52]].map(([x, y], i) => `<rect x="${x - 1.5}" y="${y}" width="3" height="5" rx="1" fill="#ffd43b">${this.A(`<animate attributeName="width" values="3;.6;3" dur="1s" begin="${i*.2}s" repeatCount="indefinite"/><animate attributeName="x" values="${x - 1.5};${x - .3};${x - 1.5}" dur="1s" begin="${i*.2}s" repeatCount="indefinite"/>`)}</rect>`).join("")}`; },
    heaven(id){ const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff"><circle cx="0" cy="0" r="8"/><circle cx="9" cy="-4" r="9"/><circle cx="19" cy="0" r="8"/><rect x="0" y="0" width="19" height="7"/></g>`;
      return `<defs><radialGradient id="${id}xh" cx=".5" cy=".2" r=".9"><stop offset="0" stop-color="#fffbe6"/><stop offset=".5" stop-color="#ffe8a3"/><stop offset="1" stop-color="#ffc078"/></radialGradient></defs>
      <rect width="100" height="100" fill="url(#${id}xh)"/>
      <g transform="translate(50 12)" opacity=".5">${this.A(`<animateTransform attributeName="transform" type="rotate" additive="sum" values="0;360" dur="30s" repeatCount="indefinite"/>`)}${[...Array(12)].map((_, i) => `<path d="M0,0 L-4,70 L4,70 Z" fill="#fff" transform="rotate(${i*30})"/>`).join("")}</g>
      <g>${this.A(`<animateTransform attributeName="transform" type="translate" values="0 0;6 0;0 0" dur="8s" repeatCount="indefinite"/>`)}${cloud(6, 70, 1.2)}${cloud(60, 74, 1.4)}${cloud(30, 86, 1.6)}${cloud(76, 90, 1.2)}</g>
      ${this.stars(10, 9, "#fff", 50)}`; },
    diamondcave(id){ const gem = (x, y, s, c, b) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0,-10 L6,-2 L0,12 L-6,-2 Z" fill="${c}" stroke="#fff" stroke-width=".6"/><path d="M0,-10 L2,-2 L0,12 Z" fill="#fff" opacity=".45"/>${this.A(`<animate attributeName="opacity" values="1;.55;1" dur="2s" begin="${b}s" repeatCount="indefinite"/>`)}</g>`;
      return `<defs><radialGradient id="${id}xd" cx=".5" cy=".6" r=".8"><stop offset="0" stop-color="#3b2a6e"/><stop offset="1" stop-color="#0c0820"/></radialGradient></defs>
      <rect width="100" height="100" fill="url(#${id}xd)"/><path d="M0,0 L100,0 L100,10 L88,22 L80,10 L66,20 L56,8 L44,18 L32,6 L20,20 L10,8 L0,16 Z" fill="#160f30"/>
      ${gem(10, 80, 1.6, "#9ee6ff", 0)}${gem(22, 88, 1.1, "#ff8ec6", .4)}${gem(88, 78, 1.8, "#b197fc", .8)}${gem(76, 90, 1.1, "#69db7c", 1.2)}${gem(48, 92, 1, "#ffe066", .6)}${gem(8, 30, .9, "#74c0fc", 1)}${gem(92, 34, 1, "#ff8ec6", .2)}
      ${this.stars(14, 11, "#d0bfff", 70)}<path d="M0,92 L100,92 L100,100 L0,100 Z" fill="#160f30"/>`; },
    dragonsky(id){ return `<defs><linearGradient id="${id}xk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b0010"/><stop offset=".55" stop-color="#9c1a1a"/><stop offset="1" stop-color="#ff7b00"/></linearGradient></defs>
      <rect width="100" height="100" fill="url(#${id}xk)"/><circle cx="74" cy="30" r="14" fill="#ffd8a8" opacity=".9"/>
      <g fill="#1a0006">${this.A(`<animateTransform attributeName="transform" type="translate" values="-60 10;140 -6" dur="9s" repeatCount="indefinite"/>`)}
        <path d="M0,20 C6,16 12,16 18,18 L26,16 L22,20 L28,24 L18,22 C12,24 6,24 0,20 Z"/><path d="M8,18 L4,4 L14,14 L20,2 L18,18 Z">${this.A(`<animateTransform attributeName="transform" type="scale" values="1 1;1 -.2;1 1" dur=".8s" repeatCount="indefinite" additive="sum"/>`)}</path></g>
      ${this.rise(12, 13, i => `<circle r="${.6 + (i % 3)*.4}" fill="${i % 2 ? "#ffd43b" : "#ff6b00"}"/>`, 5)}
      <path d="M0,80 L12,70 L22,78 L34,64 L46,76 L60,62 L72,76 L86,66 L100,74 L100,100 L0,100 Z" fill="#2b0008"/>`; }
  },

  /* ---------- ✨ 움직이는 테두리 ---------- */
  FR: {
    spin(id){ return `<defs><linearGradient id="${id}fs" x1="0" y1="0" x2="1" y2="1">${["#ff6b6b","#ffa94d","#ffd43b","#69db7c","#4dabf7","#b197fc","#ff6b6b"].map((c, i) => `<stop offset="${i/6}" stop-color="${c}"/>`).join("")}
      ${this.A(`<animateTransform attributeName="gradientTransform" type="rotate" values="0 .5 .5;360 .5 .5" dur="3s" repeatCount="indefinite"/>`)}</linearGradient></defs>
      <rect x="2.5" y="2.5" width="95" height="95" rx="12.5" fill="none" stroke="url(#${id}fs)" stroke-width="7"/>
      <rect x="2.5" y="2.5" width="95" height="95" rx="12.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-dasharray="2 6">${this.A(`<animate attributeName="stroke-dashoffset" values="0;-16" dur=".8s" repeatCount="indefinite"/>`)}</rect>`; },
    flame(id){ return `<defs><linearGradient id="${id}ff" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff2d00"/><stop offset=".5" stop-color="#ff8a00"/><stop offset="1" stop-color="#ffe066"/></linearGradient></defs>
      <rect x="2.5" y="2.5" width="95" height="95" rx="12.5" fill="none" stroke="url(#${id}ff)" stroke-width="7"/>
      ${[6,16,26,36,46,56,66,76,86,96].map((x, i) => `<path d="M${x - 5},100 Q${x - 5},90 ${x},${84 - (i % 3)*3} Q${x + 5},90 ${x + 5},100 Z" fill="url(#${id}ff)">${this.A(`<animateTransform attributeName="transform" type="translate" values="0 0;0 -2.5;0 0" dur="${.5 + (i % 3)*.15}s" repeatCount="indefinite"/>`)}</path>`).join("")}
      ${[10,26,42,58,74,90].map((y, i) => `<path d="M0,${y - 4} Q8,${y} 0,${y + 4} Z M100,${y - 4} Q92,${y} 100,${y + 4} Z" fill="#ff8a00">${this.A(`<animate attributeName="opacity" values="1;.4;1" dur="${.6 + i*.1}s" repeatCount="indefinite"/>`)}</path>`).join("")}`; },
    electric(id){ return `<defs><filter id="${id}fe" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.4"/></filter></defs>
      <rect x="2.5" y="2.5" width="95" height="95" rx="12.5" fill="none" stroke="#22e1ff" stroke-width="6" filter="url(#${id}fe)">${this.A(`<animate attributeName="opacity" values="1;.5;1;.7;1" dur="1s" repeatCount="indefinite"/>`)}</rect>
      <rect x="2.5" y="2.5" width="95" height="95" rx="12.5" fill="none" stroke="#e3fdff" stroke-width="2"/>
      ${["M8,2 L14,7 L18,1 L24,6 L30,1","M70,99 L76,94 L80,99 L86,94 L92,99","M1,40 L6,46 L1,52 L6,58","M99,30 L94,36 L99,42 L94,48"].map((d, i) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round">${this.A(`<animate attributeName="opacity" values="0;1;0;0" keyTimes="0;.1;.2;1" dur="${1.2 + i*.3}s" repeatCount="indefinite"/>`)}</path>`).join("")}`; },
    pixel(id){ let s = ""; const C = ["#ff004d","#ffa300","#ffec27","#00e436","#29adff","#ff77a8"];
      for (let i = 0; i < 25; i++){ const c = C[i % 6], v = C.slice(i % 6).concat(C.slice(0, i % 6)).join(";");
        const anim = this.A(`<animate attributeName="fill" values="${v};${C[i % 6]}" dur="3s" repeatCount="indefinite"/>`);
        s += `<rect x="${i*4}" y="0" width="4" height="4" fill="${c}">${anim}</rect><rect x="${96 - i*4}" y="96" width="4" height="4" fill="${c}">${anim}</rect><rect x="0" y="${96 - i*4}" width="4" height="4" fill="${c}">${anim}</rect><rect x="96" y="${i*4}" width="4" height="4" fill="${c}">${anim}</rect>`; }
      return s + `<rect x="4" y="4" width="92" height="92" fill="none" stroke="#000" stroke-width="1"/>`; },
    sakura(id){ const fl = (x, y, s, b) => `<g transform="translate(${x} ${y}) scale(${s})">${this.A(`<animateTransform attributeName="transform" type="rotate" additive="sum" values="0;360" dur="12s" begin="${b}s" repeatCount="indefinite"/>`)}${[0,72,144,216,288].map(d => `<ellipse cx="0" cy="-4" rx="2.8" ry="4" fill="#ffa8c5" stroke="#fff" stroke-width=".5" transform="rotate(${d})"/>`).join("")}<circle r="1.6" fill="#ffe066"/></g>`;
      return `<rect x="2.5" y="2.5" width="95" height="95" rx="12.5" fill="none" stroke="#ffc9de" stroke-width="5"/><rect x="2.5" y="2.5" width="95" height="95" rx="12.5" fill="none" stroke="#fff" stroke-width="1.4"/>
      ${fl(7, 7, 1.3, 0)}${fl(93, 7, 1.1, 1)}${fl(7, 93, 1.1, 2)}${fl(93, 93, 1.3, 3)}${fl(50, 3, .8, 1.5)}${fl(50, 97, .8, .5)}${fl(3, 50, .8, 2.5)}${fl(97, 50, .8, 3.5)}`; },
    crystal(id){ return `<defs><linearGradient id="${id}fc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e7f5ff"/><stop offset=".3" stop-color="#9ee6ff"/><stop offset=".6" stop-color="#d0bfff"/><stop offset="1" stop-color="#ffffff"/>
      ${this.A(`<animateTransform attributeName="gradientTransform" type="translate" values="-.5 -.5;.5 .5;-.5 -.5" dur="4s" repeatCount="indefinite"/>`)}</linearGradient></defs>
      <rect x="2.5" y="2.5" width="95" height="95" rx="12.5" fill="none" stroke="url(#${id}fc)" stroke-width="7"/>
      ${[[6,6],[94,6],[6,94],[94,94],[50,3],[50,97],[3,50],[97,50]].map(([x, y], i) => `<path d="M${x},${y - 5} L${x + 3.5},${y} L${x},${y + 5} L${x - 3.5},${y} Z" fill="#fff" stroke="#74c0fc" stroke-width=".6">${this.A(`<animate attributeName="opacity" values="1;.3;1" dur="${1.4 + i*.2}s" repeatCount="indefinite"/>`)}</path>`).join("")}`; },
    champion(id){ return `<defs><linearGradient id="${id}fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3bf"/><stop offset=".4" stop-color="#fcc419"/><stop offset=".7" stop-color="#e67700"/><stop offset="1" stop-color="#ffe066"/></linearGradient></defs>
      <rect x="2.5" y="2.5" width="95" height="95" rx="12.5" fill="none" stroke="url(#${id}fg)" stroke-width="7"/><rect x="7" y="7" width="86" height="86" rx="9" fill="none" stroke="#fff3bf" stroke-width="1"/>
      ${[...Array(9)].map((_, i) => `<ellipse cx="${20 + i*3.4}" cy="${95 - Math.sin(i/8*Math.PI)*5}" rx="3" ry="1.5" fill="#2f9e44" transform="rotate(${-30 + i*6} ${20 + i*3.4} ${95 - Math.sin(i/8*Math.PI)*5})"/><ellipse cx="${80 - i*3.4}" cy="${95 - Math.sin(i/8*Math.PI)*5}" rx="3" ry="1.5" fill="#2f9e44" transform="rotate(${30 - i*6} ${80 - i*3.4} ${95 - Math.sin(i/8*Math.PI)*5})"/>`).join("")}
      <path d="M50,-1 L53,6 L60,6.5 L54.5,11 L56.5,18 L50,14 L43.5,18 L45.5,11 L40,6.5 L47,6 Z" fill="#ffd43b" stroke="#e67700" stroke-width="1">${this.A(`<animateTransform attributeName="transform" type="scale" values="1;1.08;1" dur="1.5s" repeatCount="indefinite" additive="sum"/>`)}</path>`; },
    legend(id){ return `<defs><linearGradient id="${id}fl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffd43b"/><stop offset=".25" stop-color="#fff9db"/><stop offset=".5" stop-color="#f59f00"/><stop offset=".75" stop-color="#fff9db"/><stop offset="1" stop-color="#ffd43b"/>
      ${this.A(`<animateTransform attributeName="gradientTransform" type="rotate" values="0 .5 .5;360 .5 .5" dur="4s" repeatCount="indefinite"/>`)}</linearGradient>
      <filter id="${id}flg" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter></defs>
      <rect x="2.5" y="2.5" width="95" height="95" rx="12.5" fill="none" stroke="#ffd43b" stroke-width="8" filter="url(#${id}flg)" opacity=".8">${this.A(`<animate attributeName="opacity" values=".4;.9;.4" dur="2s" repeatCount="indefinite"/>`)}</rect>
      <rect x="2.5" y="2.5" width="95" height="95" rx="12.5" fill="none" stroke="url(#${id}fl)" stroke-width="7"/><rect x="7" y="7" width="86" height="86" rx="9" fill="none" stroke="#a61e4d" stroke-width="1.6"/>
      ${[[5,5,"#e03131"],[95,5,"#1971c2"],[5,95,"#2f9e44"],[95,95,"#7048e8"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="4.6" fill="${c}" stroke="#ffd43b" stroke-width="1.6"/><circle cx="${x - 1.4}" cy="${y - 1.4}" r="1.3" fill="#fff" opacity=".8"/>`).join("")}
      <path d="M36,6 L39,-1 L44,4 L50,-3 L56,4 L61,-1 L64,6 Z" fill="#ffd43b" stroke="#e67700" stroke-width=".8"/>
      ${[[20,3],[80,3],[3,30],[97,70],[30,97],[70,97]].map(([x, y], i) => `<path d="M${x},${y - 3} L${x + .8},${y - .8} L${x + 3},${y} L${x + .8},${y + .8} L${x},${y + 3} L${x - .8},${y + .8} L${x - 3},${y} L${x - .8},${y - .8} Z" fill="#fff">${this.A(`<animate attributeName="opacity" values="0;1;0" dur="1.6s" begin="${i*.27}s" repeatCount="indefinite"/>`)}</path>`).join("")}`; }
  },

  /* ---------- 🪽 날개·오라 (캐릭터 뒤) ---------- */
  AU: {
    glow(id){ return `<defs><radialGradient id="${id}ag"><stop offset="0" stop-color="#fff9db" stop-opacity=".95"/><stop offset=".6" stop-color="#ffe066" stop-opacity=".4"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></radialGradient></defs>
      <circle cx="50" cy="52" r="42" fill="url(#${id}ag)">${this.A(`<animate attributeName="r" values="38;46;38" dur="2.4s" repeatCount="indefinite"/>`)}</circle>`; },
    fireaura(id){ return `<defs><linearGradient id="${id}af" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff2d00" stop-opacity=".9"/><stop offset=".6" stop-color="#ff8a00" stop-opacity=".7"/><stop offset="1" stop-color="#ffe066" stop-opacity="0"/></linearGradient></defs>
      ${[[22,0],[34,1],[50,2],[66,1],[78,0]].map(([x, k], i) => `<path d="M${x - 12},100 Q${x - 14},${60 - k*8} ${x},${24 - k*10} Q${x + 14},${60 - k*8} ${x + 12},100 Z" fill="url(#${id}af)">${this.A(`<animateTransform attributeName="transform" type="scale" values="1 1;1.05 .92;1 1" dur="${.6 + i*.12}s" repeatCount="indefinite" additive="sum"/>`)}</path>`).join("")}`; },
    iceaura(id){ return `<defs><radialGradient id="${id}ai"><stop offset=".4" stop-color="#e7f5ff" stop-opacity=".9"/><stop offset="1" stop-color="#74c0fc" stop-opacity="0"/></radialGradient></defs>
      <circle cx="50" cy="52" r="44" fill="url(#${id}ai)"/>
      <g transform="translate(50 50)">${this.A(`<animateTransform attributeName="transform" type="rotate" additive="sum" values="0;360" dur="20s" repeatCount="indefinite"/>`)}
      ${[...Array(8)].map((_, i) => `<path d="M0,-46 L4,-34 L0,-28 L-4,-34 Z" fill="#d0ebff" stroke="#fff" stroke-width=".8" transform="rotate(${i*45})"/>`).join("")}</g>`; },
    rainbowaura(id){ return `<g transform="translate(50 46)">${this.A(`<animateTransform attributeName="transform" type="rotate" additive="sum" values="0;360" dur="6s" repeatCount="indefinite"/>`)}
      ${["#ff6b6b","#ffa94d","#ffd43b","#69db7c","#4dabf7","#b197fc"].map((c, i) => `<circle r="38" fill="none" stroke="${c}" stroke-width="4" stroke-dasharray="20 ${238 - 20}" stroke-dashoffset="${-i*40}" opacity=".85"/>`).join("")}</g>
      <circle cx="50" cy="46" r="34" fill="#fff" opacity=".18"/>`; },
    angel(id){ const wing = s => `<g transform="translate(50 64) scale(${s} 1)">${this.A(`<animateTransform attributeName="transform" type="rotate" additive="sum" values="0;-10;0" dur="1.6s" repeatCount="indefinite"/>`)}
      <path d="M8,0 C20,-26 44,-34 48,-22 C50,-14 44,-10 40,-8 C46,-6 46,0 38,2 C42,4 40,10 32,10 C34,14 26,16 20,12 C14,10 10,6 8,0 Z" fill="#fff" stroke="#d0ebff" stroke-width="1.2"/>
      <path d="M14,-4 C24,-14 34,-18 42,-16 M16,2 C26,-4 34,-6 40,-4 M18,8 C26,4 30,4 34,6" fill="none" stroke="#a5d8ff" stroke-width="1"/></g>`;
      return `<defs><radialGradient id="${id}aw"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="50" r="40" fill="url(#${id}aw)"/>${wing(1)}${wing(-1)}`; },
    bat(id){ const wing = s => `<g transform="translate(50 64) scale(${s} 1)">${this.A(`<animateTransform attributeName="transform" type="rotate" additive="sum" values="0;-14;0" dur="1s" repeatCount="indefinite"/>`)}
      <path d="M8,0 C18,-24 38,-34 50,-26 C44,-20 46,-14 48,-8 C40,-12 36,-8 36,-2 C30,-6 24,-4 24,2 C18,-2 12,0 8,0 Z" fill="#3b1f5c" stroke="#7048e8" stroke-width="1"/>
      <path d="M12,-2 L48,-24 M20,0 L40,-12" stroke="#7048e8" stroke-width=".8"/></g>`; return wing(1) + wing(-1); },
    butterfly(id){ const wing = s => `<g transform="translate(50 62) scale(${s} 1)">${this.A(`<animateTransform attributeName="transform" type="scale" additive="sum" values="1 1;.75 1;1 1" dur="1.1s" repeatCount="indefinite"/>`)}
      <path d="M6,0 C10,-34 46,-40 44,-14 C42,-4 26,0 6,0 Z" fill="#ff8ec6" stroke="#fff" stroke-width="1.2"/><path d="M6,2 C24,4 40,8 34,24 C28,34 10,20 6,2 Z" fill="#b197fc" stroke="#fff" stroke-width="1.2"/>
      <circle cx="30" cy="-18" r="5" fill="#fff" opacity=".7"/><circle cx="24" cy="14" r="3.5" fill="#fff" opacity=".7"/></g>`; return wing(1) + wing(-1); },
    dragon(id){ const wing = s => `<g transform="translate(50 62) scale(${s} 1)">${this.A(`<animateTransform attributeName="transform" type="rotate" additive="sum" values="0;-12;0" dur="1.4s" repeatCount="indefinite"/>`)}
      <path d="M8,0 L22,-36 L50,-44 L44,-30 L52,-22 L42,-16 L48,-6 L36,-4 L38,6 L24,2 Z" fill="#c92a2a" stroke="#5c0a0a" stroke-width="1.4"/>
      <path d="M22,-36 L26,0 M50,-44 L30,-2 M52,-22 L32,0 M48,-6 L34,2" stroke="#5c0a0a" stroke-width="1"/><path d="M22,-36 L18,-44 L26,-38 Z" fill="#ffd43b"/></g>`;
      return `<defs><radialGradient id="${id}ad"><stop offset="0" stop-color="#ff6b6b" stop-opacity=".6"/><stop offset="1" stop-color="#ff6b6b" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="50" r="44" fill="url(#${id}ad)">${this.A(`<animate attributeName="opacity" values=".5;1;.5" dur="1.4s" repeatCount="indefinite"/>`)}</circle>${wing(1)}${wing(-1)}`; }
  },

  /* ---------- ✨ 반짝 효과 (캐릭터 앞) ---------- */
  FX: {
    sparkle(){ return [[14,20],[86,16],[10,62],[90,58],[24,40],[78,36]].map(([x, y], i) => `<path d="M${x},${y - 4} L${x + 1},${y - 1} L${x + 4},${y} L${x + 1},${y + 1} L${x},${y + 4} L${x - 1},${y + 1} L${x - 4},${y} L${x - 1},${y - 1} Z" fill="#fff" stroke="#ffd43b" stroke-width=".4">
      ${this.A(`<animateTransform attributeName="transform" type="scale" additive="sum" values="1;1;1" dur="1s"/><animate attributeName="opacity" values="0;1;0" dur="1.6s" begin="${i*.27}s" repeatCount="indefinite"/>`)}</path>`).join(""); },
    hearts(){ return this.rise(6, 2, i => `<path d="M0,2 C-4,-1 -3,-4 -1,-4 C0,-4 0,-3 0,-2.5 C0,-3 0,-4 1,-4 C3,-4 4,-1 0,2 Z" fill="${i % 2 ? "#ff6b9d" : "#ff8ec6"}" transform="scale(1.4)"/>`, 4); },
    notes(){ return this.rise(5, 3, i => `<text font-size="9" fill="${["#7048e8","#1c7ed6","#e64980"][i % 3]}" font-weight="bold">${i % 2 ? "♪" : "♫"}</text>`, 4.5); },
    bubbles(){ return this.rise(8, 4, i => `<circle r="${2 + (i % 3)}" fill="#e7f5ff" fill-opacity=".35" stroke="#fff" stroke-width=".7"/><circle cx="-.8" cy="-.8" r=".7" fill="#fff"/>`, 5); },
    snow(){ return this.fall(10, 8, () => `<path d="M0,-2.6 L0,2.6 M-2.3,-1.3 L2.3,1.3 M-2.3,1.3 L2.3,-1.3" stroke="#fff" stroke-width=".8" stroke-linecap="round"/>`, 6, 4); },
    confetti(){ return this.fall(14, 5, i => `<rect x="-1.2" y="-2" width="2.4" height="4" fill="${COLS[i % COLS.length]}">${this.A(`<animateTransform attributeName="transform" type="rotate" values="0;360" dur="${1 + i % 3*.4}s" repeatCount="indefinite"/>`)}</rect>`, 4, 8); },
    orbit(){ return `<g transform="translate(50 44)">${this.A(`<animateTransform attributeName="transform" type="rotate" additive="sum" values="0;360" dur="4s" repeatCount="indefinite"/>`)}
      ${[0,120,240].map(d => `<path d="M0,-4 L1.2,-1.2 L4,-1 L2,1 L2.6,4 L0,2.4 L-2.6,4 L-2,1 L-4,-1 L-1.2,-1.2 Z" fill="#ffd43b" stroke="#fff" stroke-width=".5" transform="rotate(${d}) translate(0 -36) rotate(${-d})"/>`).join("")}</g>`; }
  }
};
window.AVX = AVX;

/* =====================================================================
   🛍️ 상점 · 꾸미기 화면
   ===================================================================== */
const SHOP = {
  sid: null, draft: null, cat: "face", slot: "skin", forOther: false,
  open(sid, first){
    this.sid = sid; this.draft = Object.assign({}, avOf(sid)); this.first = !!first;
    const c = CATS.find(x => x.id === this.cat) || CATS[0]; if (!c.slots.some(s => s[0] === this.slot)) this.slot = c.slots[0][0];
    ARC.modal("#mdShop", true); this.render();
  },
  wallet(){ return walletOf(this.sid); },
  unowned(){ return Object.keys(this.draft).filter(k => (XI[k] || AV[k]) && !owns(this.sid, k, this.draft[k])); },
  render(){
    const w = this.wallet(), un = this.unowned(), cost = un.reduce((s, k) => s + priceOf(k, this.draft[k]), 0);
    $("#shTitle").textContent = this.first ? "🎉 처음 왔네요! 내 아바타를 꾸며요" : "👕 꾸미기 · 🛍️ 상점";
    $("#shCoins").innerHTML = `🪙 <b>${w.coins.toLocaleString()}</b> 코인`;
    AVX.still = false; $("#shPrev").innerHTML = avatarSVG(this.draft, "");
    $("#shWho").innerHTML = `<b>${esc(who(noOf_(this.sid)))}</b>${this.draft.title && this.draft.title !== "none" ? `<span class="${ttlCls(this.draft.title)}">${esc(itemName("title", this.draft.title))}</span>` : ""}`;
    $("#shBuy").innerHTML = un.length ? `<div class="sh-try">👀 입어 보는 중: ${un.map(k => `<b>${esc(itemName(k, this.draft[k]))}</b>`).join(", ")}</div>
        <button class="arc-btn p big" id="shBuyGo" ${cost > w.coins ? "disabled" : ""}>🛒 ${cost.toLocaleString()} 코인으로 사서 입기</button>${cost > w.coins ? `<div class="sh-need">코인이 ${(cost - w.coins).toLocaleString()}개 모자라요. 게임에서 모아 와요!</div>` : ""}
        <button class="arc-btn" id="shUndo">↩️ 원래대로</button>`
      : `<button class="arc-btn p big" id="shSave">💾 이대로 입기</button>`;
    $("#shCats").innerHTML = CATS.map(c => `<button data-c="${c.id}" class="${c.id === this.cat ? "on" : ""}">${c.n}</button>`).join("");
    const cat = CATS.find(c => c.id === this.cat);
    $("#shSlots").innerHTML = cat.slots.map(([k, n]) => `<button data-s="${k}" class="${k === this.slot ? "on" : ""}">${n}</button>`).join("");
    this.grid();
    const bg = $("#shBuyGo"); if (bg) bg.onclick = () => this.buyAll();
    const sv = $("#shSave"); if (sv) sv.onclick = () => this.save();
    const ud = $("#shUndo"); if (ud) ud.onclick = () => { this.draft = Object.assign({}, avOf(this.sid)); this.render(); };
  },
  grid(){
    const k = this.slot, opts = optsOf(k).filter(v => this.cat === "gift" ? isGift(k, v) || v === "none" : !isGift(k, v) || owns(this.sid, k, v)), isColor = k === "skin" || k === "hairC" || k === "topC", face = ["hair","eyes","mouth","cheek","hat","glasses","helm","thead","acc"].includes(k);
    const animate = ["xbg","xfr","aura","fx","pet"].includes(k);
    $("#shGrid").className = "sh-grid" + (isColor ? " col" : "") + (k === "title" ? " ttlg" : "");
    $("#shGrid").innerHTML = opts.map(v => {
      const p = priceOf(k, v), own = owns(this.sid, k, v), on = this.draft[k] === v, r = rarOf(p);
      let pv;
      if (isColor) pv = `<span class="sw" style="background:${v}"></span>`;
      else if (k === "title") pv = v === "none" ? `<span class="ttl">칭호 없음</span>` : `<span class="${ttlCls(v)}">${esc(itemName(k, v))}</span>`;
      else { const t = Object.assign({}, this.draft, {[k]: v}); (CLASH[k] || []).forEach(c => { if (v !== "none") t[c] = "none"; }); if (k === "bg") t.xbg = "none"; if (k === "frame") t.xfr = "none";
        AVX.still = !animate; pv = avatarSVG(t, "", face ? "15 10 70 70" : undefined); AVX.still = false; }
      const gf = isGift(k, v);
      return `<button class="sh-it r-${gf ? "g" : p ? r : "f"}${on ? " on" : ""}${own ? " own" : ""}${gf && !own ? " lock" : ""}" data-v="${v}" title="${esc(itemName(k, v))}">
        <span class="pv">${pv}</span><span class="nm">${esc(k === "title" ? "" : itemName(k, v))}</span>
        <span class="pr">${on ? "✅ 입는 중" : gf ? (own ? "🎁 받은 상" : "🔒 선생님만 줄 수 있어요") : own ? (p ? "✔️ 내 것" : "무료") : `🪙 ${p.toLocaleString()}`}</span>${gf ? `<span class="rr">🎁 선생님 상</span>` : p && !own ? `<span class="rr">${RAR[r][0]}</span>` : ""}</button>`;
    }).join("");
  },
  pick(v){
    const k = this.slot;
    if (isGift(k, v) && !owns(this.sid, k, v)){ toast("🎁 이건 수업 시간에 잘하면 선생님이 주시는 특별한 상이에요!"); return; }
    this.draft[k] = v;
    if (v !== "none") (CLASH[k] || []).forEach(c => this.draft[c] = "none");
    if (k === "bg") this.draft.xbg = "none"; if (k === "frame") this.draft.xfr = "none";
    this.render();
  },
  async buyAll(){
    const un = this.unowned(), cost = un.reduce((s, k) => s + priceOf(k, this.draft[k]), 0);
    if (cost > this.wallet().coins) return;
    $("#shBuyGo").disabled = true;
    try { await Store.buy(this.sid, un.map(k => `${k}:${this.draft[k]}`), cost, this.draft); SFX.rec(); toast(`🛍️ 샀어요! 🪙 -${cost.toLocaleString()}`); this.burst(); this.render(); }
    catch(e){ toast("⚠️ " + (e.message || e)); this.render(); }
  },
  async save(){ await Store.putAv(this.sid, this.draft); toast("💾 이대로 입었어요!"); ARC.modal("#mdShop", false); },
  burst(){ const c = $("#shPrevBox"); c.insertAdjacentHTML("beforeend", NG.conf(60)); setTimeout(() => { const x = c.querySelector(".ng-conf"); if (x) x.remove(); }, 4500); }
};
(function(){
  document.addEventListener("click", e => {
    if (!$("#mdShop") || $("#mdShop").hidden) return;
    const c = e.target.closest("#shCats [data-c]"); if (c){ SHOP.cat = c.dataset.c; SHOP.slot = CATS.find(x => x.id === SHOP.cat).slots[0][0]; SHOP.render(); return; }
    const s = e.target.closest("#shSlots [data-s]"); if (s){ SHOP.slot = s.dataset.s; SHOP.render(); return; }
    const it = e.target.closest("#shGrid [data-v]"); if (it){ getAC(); tone(700, 900, .05, "triangle", .06); SHOP.pick(it.dataset.v); }
  });
})();
