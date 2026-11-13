/* =====================================================================
   🎁 선생님 상 (2026.11.13)
   - 상점에서 살 수 없고, 수업 시간에 잘한 친구에게 선생님만 줄 수 있는 칭호 · 아바타
   - 🛠️ 관리자 → 🎁 칭찬 상 주기 : 여러 명 골라서 코인 + 칭호 + 아바타 상을 한꺼번에
   - 받은 친구는 다음에 홈에 오면 🎁 축하 화면이 떠요
   - 🔥 열정 보너스 안내 글
   ===================================================================== */

/* ---------- 🏷️ 선생님 칭호 10가지 ---------- */
const GIFT_TITLES = [
  ["gfocus", "🎯 수업 집중왕"], ["gspeak", "🎤 발표왕"], ["gkind", "💗 친절 천사"], ["gscholar", "📚 공부 박사"], ["gtidy", "🧹 정리 요정"],
  ["gidea", "💡 아이디어 뱅크"], ["ghelp", "🤝 도움 천사"], ["ghero", "🦸 우리 반 히어로"], ["gmonth", "👑 이달의 어린이"], ["gpride", "💎 선생님의 자랑"]
];
/* ---------- 🎨 선생님 아바타 상 ---------- */
const GIFT_AV = {
  xbg: [["groyal", "황금 궁전"], ["gaward", "시상식 무대"], ["gnebula", "오색 성운"]],
  xfr: [["glaurel", "황금 월계관"], ["gprism", "프리즘 홀로그램"], ["gpearl", "진주 리본"]],
  aura: [["gphoenix", "불사조 날개"], ["gseraph", "대천사 빛 날개"]],
  fx: [["ggoldrain", "황금 별비"], ["gcrown", "왕관 궤도"]]
};
(function(){
  GIFT_TITLES.forEach(([v, n]) => { XI.title.push([v, n, 0]); GIFTS.add("title:" + v); });
  for (const slot in GIFT_AV) GIFT_AV[slot].forEach(([v, n]) => { XI[slot].push([v, "🎁 " + n, 0]); GIFTS.add(slot + ":" + v); });
})();
const giftList = () => [...GIFTS].map(k => { const [slot, v] = k.split(":"); return {k, slot, v, n: itemName(slot, v)}; });

/* ---------- 🖌️ 그림 (100×100) ---------- */
const GSTAR = (x, y, r, fill, stroke) => { let d = ""; for (let i = 0; i < 10; i++){ const a = -Math.PI/2 + i*Math.PI/5, rr = i % 2 ? r*.45 : r; d += (i ? "L" : "M") + (x + Math.cos(a)*rr).toFixed(2) + "," + (y + Math.sin(a)*rr).toFixed(2); } return `<path d="${d}Z" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width=".5"` : ""}/>`; };
const GLINT = (x, y, r = 3) => `M${x},${y - r} L${x + r*.25},${y - r*.25} L${x + r},${y} L${x + r*.25},${y + r*.25} L${x},${y + r} L${x - r*.25},${y + r*.25} L${x - r},${y} L${x - r*.25},${y - r*.25} Z`;
const GOLD = (id, rot) => `<linearGradient id="${id}gx" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a5a00"/><stop offset=".22" stop-color="#ffe066"/><stop offset=".4" stop-color="#fffbe6"/><stop offset=".58" stop-color="#f5b700"/><stop offset=".8" stop-color="#b07800"/><stop offset="1" stop-color="#ffe066"/>${rot || ""}</linearGradient>`;

Object.assign(AVX.BG, {
  /* 👑 황금 궁전: 붉은 벨벳 커튼 · 황금 기둥 · 레드 카펫 · 샹들리에 */
  groyal(id){
    const pillar = x => `<g><rect x="${x}" y="22" width="11" height="62" fill="url(#${id}gxrg)"/>${[2.2, 5.5, 8.8].map(o => `<rect x="${x + o - .5}" y="26" width="1" height="54" fill="#8a5a00" opacity=".45"/>`).join("")}
      <rect x="${x - 1.5}" y="18" width="14" height="5" rx="1" fill="url(#${id}gxrg)"/><rect x="${x - 2.5}" y="15.5" width="16" height="3" rx="1" fill="#ffe066"/><rect x="${x - 2}" y="83" width="15" height="4" fill="url(#${id}gxrg)"/></g>`;
    const curtain = s => `<g transform="translate(${s > 0 ? 0 : 100} 0) scale(${s} 1)"><path d="M0,0 H34 Q30,6 22,7 Q16,9 13,18 Q9,30 0,40 Z" fill="url(#${id}gxrv)"/>
      <path d="M34,0 Q30,6 22,7 Q16,9 13,18 Q9,30 0,40" fill="none" stroke="#ffd43b" stroke-width="1.4"/><path d="M8,3 Q10,14 4,26 M18,2 Q20,8 14,14" fill="none" stroke="#5c0a1e" stroke-width="1" opacity=".6"/>
      <circle cx="13" cy="19" r="1.6" fill="#ffd43b"/><path d="M13,20 L11.5,26 H14.5 Z" fill="#ffd43b"/></g>`;
    return `<defs><linearGradient id="${id}gxrb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a0718"/><stop offset=".55" stop-color="#6b1238"/><stop offset="1" stop-color="#240514"/></linearGradient>
      ${GOLD(id + "gxrg")}<linearGradient id="${id}gxrv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e03131"/><stop offset=".6" stop-color="#a61e4d"/><stop offset="1" stop-color="#5c0a1e"/></linearGradient>
      <radialGradient id="${id}gxrl" cx=".5" cy=".12" r=".7"><stop offset="0" stop-color="#ffe8a3" stop-opacity=".75"/><stop offset=".5" stop-color="#ffb84d" stop-opacity=".18"/><stop offset="1" stop-color="#ffb84d" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}gxrc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c92a2a"/><stop offset="1" stop-color="#7a0f1f"/></linearGradient></defs>
      <rect width="100" height="100" fill="url(#${id}gxrb)"/>
      <path d="M26,86 V40 Q26,14 50,14 Q74,14 74,40 V86" fill="#ffe066" fill-opacity=".07" stroke="#ffd43b" stroke-opacity=".55" stroke-width="1.2"/>
      <path d="M31,86 V42 Q31,20 50,20 Q69,20 69,42 V86" fill="none" stroke="#ffd43b" stroke-opacity=".25" stroke-width=".8"/>
      <rect width="100" height="100" fill="url(#${id}gxrl)">${AVX.A(`<animate attributeName="opacity" values=".8;1;.8" dur="3s" repeatCount="indefinite"/>`)}</rect>
      <rect y="84" width="100" height="16" fill="#1d0410"/><path d="M0,84 H100" stroke="#ffd43b" stroke-width=".8" opacity=".6"/>
      <path d="M38,84 H62 L78,100 H22 Z" fill="url(#${id}gxrc)"/><path d="M38,84 L22,100 M62,84 L78,100" stroke="#ffd43b" stroke-width="1"/>
      ${pillar(3)}${pillar(86)}
      <g transform="translate(50 4)"><path d="M-12,0 Q0,7 12,0" fill="none" stroke="#ffd43b" stroke-width="1"/><path d="M-8,4 Q0,9 8,4" fill="none" stroke="#ffd43b" stroke-width=".8"/>
        ${[-12, -6, 0, 6, 12].map((x, i) => `<g><rect x="${x - .5}" y="${i === 2 ? 4 : 1}" width="1" height="2" fill="#fff3bf"/><circle cx="${x}" cy="${i === 2 ? 3.5 : .5}" r="1.3" fill="#fff9db">${AVX.A(`<animate attributeName="r" values="1;1.8;1" dur="${1 + i*.2}s" repeatCount="indefinite"/>`)}</circle></g>`).join("")}
        ${[-9, -3, 3, 9].map(x => `<path d="M${x},6 l1,2 l-1,2 l-1,-2 Z" fill="#a5d8ff" opacity=".9"/>`).join("")}</g>
      ${curtain(1)}${curtain(-1)}
      ${AVX.rise(9, 21, i => `<circle r="${.5 + (i % 3)*.25}" fill="${i % 2 ? "#ffe066" : "#fff9db"}"/>`, 7)}`;
  },
  /* 🏆 시상식 무대: 흔들리는 스포트라이트 · 반짝 무대 · 금은 꽃가루 */
  gaward(id){
    const spot = (x, a, d, c) => `<path d="M${x - 3},-4 L${x + 3},-4 L${x + 22},104 L${x - 22},104 Z" fill="url(#${id}gx${c})" transform="rotate(${a} ${x} -4)">${AVX.A(`<animateTransform attributeName="transform" type="rotate" values="${a} ${x} -4;${-a} ${x} -4;${a} ${x} -4" dur="${d}s" repeatCount="indefinite"/>`)}</path>`;
    return `<defs><linearGradient id="${id}gxab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#090726"/><stop offset=".7" stop-color="#22125e"/><stop offset="1" stop-color="#3b1b7a"/></linearGradient>
      <linearGradient id="${id}gxs1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff9db" stop-opacity=".9"/><stop offset="1" stop-color="#fff9db" stop-opacity="0"/></linearGradient>
      <linearGradient id="${id}gxs2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d0ebff" stop-opacity=".85"/><stop offset="1" stop-color="#d0ebff" stop-opacity="0"/></linearGradient>
      <radialGradient id="${id}gxaf" cx=".5" cy=".3"><stop offset="0" stop-color="#9775fa"/><stop offset="1" stop-color="#2b1663"/></radialGradient>
      <radialGradient id="${id}gxag"><stop offset="0" stop-color="#ffd43b" stop-opacity=".45"/><stop offset="1" stop-color="#ffd43b" stop-opacity="0"/></radialGradient></defs>
      <rect width="100" height="100" fill="url(#${id}gxab)"/>${AVX.stars(16, 9, "#e5dbff", 60)}
      <circle cx="50" cy="46" r="40" fill="url(#${id}gxag)"/>
      <g transform="translate(50 44)" opacity=".35">${AVX.A(`<animateTransform attributeName="transform" type="rotate" additive="sum" values="0;360" dur="24s" repeatCount="indefinite"/>`)}${GSTAR(0, 0, 38, "none")}<path d="${[...Array(10)].map((_, i) => { const a = -Math.PI/2 + i*Math.PI/5, r = i % 2 ? 17 : 38; return (i ? "L" : "M") + (Math.cos(a)*r).toFixed(1) + "," + (Math.sin(a)*r).toFixed(1); }).join("")}Z" fill="none" stroke="#ffd43b" stroke-width="1.6"/></g>
      ${spot(8, 14, 5, "s1")}${spot(92, -14, 6, "s2")}${spot(50, 8, 7, "s1")}
      <ellipse cx="50" cy="96" rx="62" ry="15" fill="url(#${id}gxaf)"/><ellipse cx="50" cy="92" rx="50" ry="8" fill="#fff" opacity=".08"/><path d="M-12,96 Q50,76 112,96" fill="none" stroke="#ffd43b" stroke-width="1.2" opacity=".8"/>
      ${[...Array(9)].map((_, i) => `<circle cx="${10 + i*10}" cy="${97 - Math.sin(i/8*Math.PI)*4}" r="1.3" fill="${["#ff6b6b","#ffd43b","#69db7c","#4dabf7","#da77f2"][i % 5]}">${AVX.A(`<animate attributeName="opacity" values="1;.2;1" dur="1.2s" begin="${i*.13}s" repeatCount="indefinite"/>`)}</circle>`).join("")}
      ${AVX.fall(12, 7, i => `<rect x="-1.3" y="-2.2" width="2.6" height="4.4" rx=".4" fill="${["#ffd43b","#f1f3f5","#ffe066","#dee2e6"][i % 4]}">${AVX.A(`<animateTransform attributeName="transform" type="rotate" values="0;360" dur="${1.2 + (i % 3)*.4}s" repeatCount="indefinite"/>`)}</rect>`, 5, 7)}`;
  },
  /* 🌌 오색 성운: 분홍·하늘·보라·금빛 구름 · 별 · 별똥별 · 고리 행성 */
  gnebula(id){
    const cloud = (k, cx, cy, rx, ry, c, dx, dur) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id}gxn${k})">${AVX.A(`<animateTransform attributeName="transform" type="translate" values="0 0;${dx} ${-dx/2};0 0" dur="${dur}s" repeatCount="indefinite"/>`)}</ellipse>`;
    const g = (k, c) => `<radialGradient id="${id}gxn${k}"><stop offset="0" stop-color="${c}" stop-opacity=".75"/><stop offset=".55" stop-color="${c}" stop-opacity=".25"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
    const shoot = (x, y, b) => `<g transform="translate(${x} ${y}) rotate(150)" opacity="0">${AVX.A(`<animate attributeName="opacity" values="0;1;0;0" keyTimes="0;.08;.25;1" dur="5s" begin="${b}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" additive="sum" values="0 0;-60 0;-60 0" keyTimes="0;.25;1" dur="5s" begin="${b}s" repeatCount="indefinite"/>`)}<path d="M0,0 L18,0" stroke="url(#${id}gxnt)" stroke-width="1.2" stroke-linecap="round"/><circle r="1.2" fill="#fff"/></g>`;
    return `<defs>${g(1, "#ff6bcb")}${g(2, "#3bc9db")}${g(3, "#845ef7")}${g(4, "#ffd43b")}
      <linearGradient id="${id}gxnt" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <radialGradient id="${id}gxnp" cx=".35" cy=".35"><stop offset="0" stop-color="#ffd8a8"/><stop offset="1" stop-color="#e8590c"/></radialGradient></defs>
      <rect width="100" height="100" fill="#06021a"/>
      ${cloud(3, 30, 40, 46, 30, "", 6, 11)}${cloud(1, 72, 30, 38, 26, "", -5, 9)}${cloud(2, 40, 78, 44, 22, "", 5, 10)}${cloud(4, 82, 74, 26, 18, "", -4, 8)}
      ${AVX.stars(34, 13)}
      <g transform="translate(83 18)"><ellipse rx="10" ry="2.6" fill="none" stroke="#ffe8cc" stroke-width="1.2" opacity=".7" transform="rotate(-18)"/><circle r="5.5" fill="url(#${id}gxnp)"/><path d="M-9.5,1.5 A10,2.6 -18 0 0 9.5,-4.6" fill="none" stroke="#ffe8cc" stroke-width="1.2" transform="rotate(-18) rotate(18)" opacity=".9"/></g>
      ${shoot(104, 6, 0)}${shoot(80, -2, 2.5)}`;
  }
});

Object.assign(AVX.FR, {
  /* 🌿 황금 월계관: 돌아가는 금빛 테 · 금 잎사귀 · 루비 · 리본 · 테두리를 도는 반짝이 */
  glaurel(id){
    const leaves = s => `<g transform="translate(${s > 0 ? 0 : 100} 0) scale(${s} 1)">${[...Array(10)].map((_, i) => { const y = 86 - i*7.2, x = 7.5 + Math.sin(i/9*Math.PI)*2.2, a = s > 0 ? -35 : -35;
        return `<ellipse cx="${(x + 3.2).toFixed(1)}" cy="${y.toFixed(1)}" rx="3.6" ry="1.5" fill="url(#${id}gxll)" stroke="#8a5a00" stroke-width=".35" transform="rotate(${a} ${(x + 3.2).toFixed(1)} ${y.toFixed(1)})"/><ellipse cx="${(x - 1.8).toFixed(1)}" cy="${(y - 2.5).toFixed(1)}" rx="3.2" ry="1.3" fill="url(#${id}gxll)" stroke="#8a5a00" stroke-width=".35" transform="rotate(${-a - 70} ${(x - 1.8).toFixed(1)} ${(y - 2.5).toFixed(1)})"/>`; }).join("")}
      <path d="M8,90 Q10,50 7.5,16" fill="none" stroke="#b07800" stroke-width=".8"/></g>`;
    const path = "M12.5,2.5 H87.5 Q97.5,2.5 97.5,12.5 V87.5 Q97.5,97.5 87.5,97.5 H12.5 Q2.5,97.5 2.5,87.5 V12.5 Q2.5,2.5 12.5,2.5 Z";
    return `<defs>${GOLD(id + "gxlg", AVX.A(`<animateTransform attributeName="gradientTransform" type="rotate" values="0 .5 .5;360 .5 .5" dur="5s" repeatCount="indefinite"/>`))}
      <linearGradient id="${id}gxll" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3bf"/><stop offset=".5" stop-color="#fcc419"/><stop offset="1" stop-color="#e67700"/></linearGradient>
      <linearGradient id="${id}gxlr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6b6b"/><stop offset="1" stop-color="#a61e4d"/></linearGradient>
      <filter id="${id}gxlb" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6"/></filter></defs>
      <path d="${path}" fill="none" stroke="#ffd43b" stroke-width="7" opacity=".55" filter="url(#${id}gxlb)">${AVX.A(`<animate attributeName="opacity" values=".3;.75;.3" dur="2.2s" repeatCount="indefinite"/>`)}</path>
      <path d="${path}" fill="none" stroke="url(#${id}gxlg)" stroke-width="6.5"/>
      <rect x="7" y="7" width="86" height="86" rx="8.5" fill="none" stroke="#fff3bf" stroke-width=".9"/><rect x="8.6" y="8.6" width="82.8" height="82.8" rx="7.5" fill="none" stroke="#b07800" stroke-width=".5"/>
      ${leaves(1)}${leaves(-1)}
      <g><path d="M30,93 H70 L66,97.5 L70,102 H30 L34,97.5 Z" fill="url(#${id}gxlr)" stroke="#ffd43b" stroke-width=".8"/><path d="M30,93 L24,91 L27,96 L22,100 L30,99 Z M70,93 L76,91 L73,96 L78,100 L70,99 Z" fill="#a61e4d" stroke="#ffd43b" stroke-width=".6"/>
        ${[38, 44, 50, 56, 62].map(x => GSTAR(x, 97.5, 1.8, "#ffe066")).join("")}</g>
      <g transform="translate(50 3)"><path d="M-9,4 L-6,-3 L-3,2 L0,-5 L3,2 L6,-3 L9,4 Z" fill="url(#${id}gxll)" stroke="#8a5a00" stroke-width=".6"/><path d="M0,-1 L3,3 L0,7 L-3,3 Z" fill="url(#${id}gxlr)" stroke="#fff" stroke-width=".6"/><path d="M-1,1 L0,0 L1,1 Z" fill="#fff" opacity=".8"/></g>
      ${[[4.5, 4.5], [95.5, 4.5], [4.5, 95.5], [95.5, 95.5]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="url(#${id}gxll)" stroke="#8a5a00" stroke-width=".5"/><circle cx="${x}" cy="${y}" r="1.6" fill="#4dabf7" stroke="#fff" stroke-width=".4"/>`).join("")}
      ${[0, 1.5].map(b => `<path d="${GLINT(0, 0, 3.4)}" fill="#fff">${AVX.still ? "" : `<animateMotion dur="3s" begin="${b}s" repeatCount="indefinite" path="${path}"/>`}</path>`).join("")}`;
  },
  /* 🔷 프리즘 홀로그램: 파스텔 무지개가 도는 테 · 코너 다이아몬드 · 흐르는 빛 */
  gprism(id){
    const dia = (x, y, r) => `<path d="M${x},${y - r} L${x + r*.75},${y} L${x},${y + r} L${x - r*.75},${y} Z" fill="url(#${id}gxpd)" stroke="#fff" stroke-width=".6"/><path d="M${x},${y - r} L${x + r*.75},${y} L${x},${y} Z" fill="#fff" opacity=".55"/>`;
    const path = "M12.5,2.5 H87.5 Q97.5,2.5 97.5,12.5 V87.5 Q97.5,97.5 87.5,97.5 H12.5 Q2.5,97.5 2.5,87.5 V12.5 Q2.5,2.5 12.5,2.5 Z";
    return `<defs><linearGradient id="${id}gxph" x1="0" y1="0" x2="1" y2="1">${["#a5f3fc","#c4b5fd","#fbcfe8","#fde68a","#bbf7d0","#a5f3fc"].map((c, i) => `<stop offset="${i/5}" stop-color="${c}"/>`).join("")}
      ${AVX.A(`<animateTransform attributeName="gradientTransform" type="rotate" values="0 .5 .5;360 .5 .5" dur="3.5s" repeatCount="indefinite"/>`)}</linearGradient>
      <linearGradient id="${id}gxpd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#99e9f2"/><stop offset="1" stop-color="#b197fc"/></linearGradient>
      <linearGradient id="${id}gxpw" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
      <path d="${path}" fill="none" stroke="url(#${id}gxph)" stroke-width="7.5"/>
      <path d="${path}" fill="none" stroke="#fff" stroke-width="7.5" stroke-dasharray="14 366" opacity=".7">${AVX.A(`<animate attributeName="stroke-dashoffset" values="0;-380" dur="2.6s" repeatCount="indefinite"/>`)}</path>
      <rect x="7.3" y="7.3" width="85.4" height="85.4" rx="8.5" fill="none" stroke="#fff" stroke-width="1" opacity=".9"/>
      <rect x="9" y="9" width="82" height="82" rx="7.5" fill="none" stroke="url(#${id}gxph)" stroke-width=".8"/>
      ${[[4.5, 4.5, 5], [95.5, 4.5, 5], [4.5, 95.5, 5], [95.5, 95.5, 5], [50, 2.5, 3.6], [50, 97.5, 3.6], [2.5, 50, 3.6], [97.5, 50, 3.6]].map(([x, y, r]) => dia(x, y, r)).join("")}
      ${[[22, 4], [78, 96], [96, 28], [4, 72]].map(([x, y], i) => `<path d="${GLINT(x, y, 2.6)}" fill="#fff">${AVX.A(`<animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="${i*.45}s" repeatCount="indefinite"/>`)}</path>`).join("")}`;
  },
  /* 🎀 진주 리본: 분홍빛 테 · 진주알 · 큰 리본 · 하트 */
  gpearl(id){
    const pearls = []; for (let i = 0; i < 13; i++){ const t = 12 + i*6.33; pearls.push([t, 7], [t, 93], [7, t], [93, t]); }
    const heart = (x, y, s, c) => `<path d="M${x},${y + 2.2*s} C${x - 4*s},${y - .8*s} ${x - 2.4*s},${y - 3.6*s} ${x},${y - 1.6*s} C${x + 2.4*s},${y - 3.6*s} ${x + 4*s},${y - .8*s} ${x},${y + 2.2*s} Z" fill="${c}" stroke="#fff" stroke-width=".5"/>`;
    return `<defs><linearGradient id="${id}gxqp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffdeeb"/><stop offset=".35" stop-color="#ff8ec6"/><stop offset=".65" stop-color="#f783ac"/><stop offset="1" stop-color="#ffc9de"/>
      ${AVX.A(`<animateTransform attributeName="gradientTransform" type="rotate" values="0 .5 .5;360 .5 .5" dur="6s" repeatCount="indefinite"/>`)}</linearGradient>
      <radialGradient id="${id}gxqe" cx=".35" cy=".35"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#f8f0fa"/><stop offset="1" stop-color="#d6c7e0"/></radialGradient>
      <linearGradient id="${id}gxqb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffa8d2"/><stop offset="1" stop-color="#e64980"/></linearGradient></defs>
      <rect x="2.5" y="2.5" width="95" height="95" rx="12.5" fill="none" stroke="url(#${id}gxqp)" stroke-width="6.5"/>
      <rect x="2.5" y="2.5" width="95" height="95" rx="12.5" fill="none" stroke="#ffd43b" stroke-width=".8"/><rect x="5.8" y="5.8" width="88.4" height="88.4" rx="9.5" fill="none" stroke="#fff" stroke-width=".6" opacity=".8"/>
      ${pearls.filter(([x, y]) => !(y < 10 && x > 34 && x < 66)).map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.45" fill="url(#${id}gxqe)" stroke="#e5dbff" stroke-width=".25"/>`).join("")}
      <g transform="translate(50 6)">${AVX.A(`<animateTransform attributeName="transform" type="rotate" additive="sum" values="-4;4;-4" dur="2.4s" repeatCount="indefinite"/>`)}
        <path d="M0,0 C-6,-9 -18,-6 -14,2 C-12,7 -5,4 0,0 Z" fill="url(#${id}gxqb)" stroke="#fff" stroke-width=".7"/><path d="M0,0 C6,-9 18,-6 14,2 C12,7 5,4 0,0 Z" fill="url(#${id}gxqb)" stroke="#fff" stroke-width=".7"/>
        <path d="M-1,1 L-8,12 L-4,11 L-3,15 L1,2 Z M1,1 L8,12 L4,11 L3,15 L-1,2 Z" fill="#e64980" stroke="#fff" stroke-width=".5"/>
        <path d="M-10,-2 C-8,-4 -5,-3 -3,-1" fill="none" stroke="#fff" stroke-width=".7" opacity=".7"/><circle r="2.8" fill="#ffd43b" stroke="#fff" stroke-width=".6"/><circle cx="-.8" cy="-.8" r=".9" fill="#fff"/></g>
      ${heart(14, 94, .9, "#ff8ec6")}${heart(86, 94, .9, "#ff8ec6")}${heart(50, 95.5, 1.1, "#f06595")}
      ${[[20, 4], [80, 4], [3, 36], [97, 64]].map(([x, y], i) => `<path d="${GLINT(x, y, 2.4)}" fill="#fff">${AVX.A(`<animate attributeName="opacity" values="0;1;0" dur="1.7s" begin="${i*.4}s" repeatCount="indefinite"/>`)}</path>`).join("")}`;
  }
});

Object.assign(AVX.AU, {
  /* 🔥 불사조 날개: 금빛→주홍→진홍 깃털 3겹 · 날갯짓 · 불씨 */
  gphoenix(id){
    const fea = (L, a, w, cls) => `<path d="M0,0 C${(L*.2).toFixed(1)},${-w} ${(L*.7).toFixed(1)},${-w*1.1} ${L},0 C${(L*.7).toFixed(1)},${w*.9} ${(L*.2).toFixed(1)},${w*.8} 0,0 Z" fill="url(#${id}gx${cls})" stroke="#fff3bf" stroke-width=".5" transform="rotate(${a})"/>`;
    const wing = s => `<g transform="translate(50 62) scale(${s} 1)">${AVX.A(`<animateTransform attributeName="transform" type="rotate" additive="sum" values="0;-12;0" dur="1.3s" repeatCount="indefinite"/>`)}
      <g transform="translate(7 0)">${[...Array(8)].map((_, i) => fea(50 - Math.abs(i - 2.5)*3.2, -78 + i*11, 4.2, "p3")).join("")}${[...Array(7)].map((_, i) => fea(36 - Math.abs(i - 2)*2.4, -72 + i*11, 3.6, "p2")).join("")}${[...Array(6)].map((_, i) => fea(22, -66 + i*12, 3, "p1")).join("")}</g></g>`;
    return `<defs><radialGradient id="${id}gxpg"><stop offset="0" stop-color="#ffe066" stop-opacity=".85"/><stop offset=".5" stop-color="#ff922b" stop-opacity=".35"/><stop offset="1" stop-color="#ff6b6b" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}gxp1" x1="0" x2="1"><stop offset="0" stop-color="#fff9db"/><stop offset="1" stop-color="#ffd43b"/></linearGradient>
      <linearGradient id="${id}gxp2" x1="0" x2="1"><stop offset="0" stop-color="#ffd43b"/><stop offset="1" stop-color="#ff922b"/></linearGradient>
      <linearGradient id="${id}gxp3" x1="0" x2="1"><stop offset="0" stop-color="#ff922b"/><stop offset=".65" stop-color="#f03e3e"/><stop offset="1" stop-color="#a61e4d"/></linearGradient></defs>
      <circle cx="50" cy="54" r="46" fill="url(#${id}gxpg)">${AVX.A(`<animate attributeName="opacity" values=".6;1;.6" dur="1.6s" repeatCount="indefinite"/>`)}</circle>
      ${wing(1)}${wing(-1)}
      ${AVX.rise(9, 31, i => `<path d="M0,-2.6 C1.8,-.4 1.5,1.7 0,2.6 C-1.5,1.7 -1.8,-.4 0,-2.6 Z" fill="${["#ffd43b","#ff922b","#ff6b6b"][i % 3]}"/>`, 3.6)}`;
  },
  /* 😇 대천사 빛 날개: 하얀 날개 3쌍 · 금빛 깃끝 · 도는 빛줄기 · 머리 위 후광 */
  gseraph(id){
    const feather = (L, a) => `<path d="M0,0 C${(L*.15).toFixed(1)},-2.6 ${(L*.65).toFixed(1)},-3.6 ${L},0 C${(L*.65).toFixed(1)},3 ${(L*.15).toFixed(1)},2.4 0,0 Z" fill="url(#${id}gxsf)" stroke="#d4a72c" stroke-width=".55" transform="rotate(${a})"/>`;
    const wing = (s, y, sc, rot, dur) => `<g transform="translate(50 ${y}) scale(${s*sc} ${sc}) rotate(${rot})">${AVX.A(`<animateTransform attributeName="transform" type="rotate" additive="sum" values="0;-9;0" dur="${dur}s" repeatCount="indefinite"/>`)}
      <g transform="translate(6 0)">${[...Array(7)].map((_, i) => feather(46 - Math.abs(i - 3)*3, -72 + i*12)).join("")}${[...Array(5)].map((_, i) => feather(28, -62 + i*14)).join("")}</g></g>`;
    return `<defs><linearGradient id="${id}gxsf" x1="0" x2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f3f0ff"/><stop offset=".85" stop-color="#fff3bf"/><stop offset="1" stop-color="#fcc419"/></linearGradient>
      <radialGradient id="${id}gxsg"><stop offset="0" stop-color="#fff9db" stop-opacity=".95"/><stop offset=".6" stop-color="#fff3bf" stop-opacity=".35"/><stop offset="1" stop-color="#fff3bf" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}gxsr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff9db" stop-opacity=".7"/><stop offset="1" stop-color="#fff9db" stop-opacity="0"/></linearGradient></defs>
      <g transform="translate(50 46)" opacity=".7">${AVX.A(`<animateTransform attributeName="transform" type="rotate" additive="sum" values="0;360" dur="18s" repeatCount="indefinite"/>`)}${[...Array(12)].map((_, i) => `<path d="M-2.5,0 L2.5,0 L5,-52 L-5,-52 Z" fill="url(#${id}gxsr)" transform="rotate(${i*30}) scale(1 -1)"/>`).join("")}</g>
      <circle cx="50" cy="50" r="42" fill="url(#${id}gxsg)"/>
      ${wing(1, 70, .78, 10, 1.9)}${wing(-1, 70, .78, 10, 1.9)}${wing(1, 58, 1, -4, 1.6)}${wing(-1, 58, 1, -4, 1.6)}${wing(1, 46, .82, -18, 1.75)}${wing(-1, 46, .82, -18, 1.75)}
      <g transform="translate(50 8)">${AVX.A(`<animateTransform attributeName="transform" type="translate" additive="sum" values="0 0;0 -1.4;0 0" dur="2s" repeatCount="indefinite"/>`)}
        <ellipse rx="15" ry="3.6" fill="none" stroke="#ffd43b" stroke-width="4" opacity=".35"/><ellipse rx="14" ry="3.2" fill="none" stroke="#ffe066" stroke-width="2.2"/><ellipse rx="14" ry="3.2" fill="none" stroke="#fffbe6" stroke-width=".7"/></g>`;
  }
});

Object.assign(AVX.FX, {
  /* ✨ 황금 별비 */
  ggoldrain(){
    return AVX.fall(13, 11, i => i % 3 === 2 ? `<path d="${GLINT(0, 0, 2.4)}" fill="#fff"/>` : GSTAR(0, 0, 2.4 + (i % 2)*.8, i % 2 ? "#ffd43b" : "#ffe066", "#fff"), 4.5, 5)
      + [[16, 30], [84, 24], [12, 70], [88, 66]].map(([x, y], i) => `<path d="${GLINT(x, y, 3.4)}" fill="#fff9db" stroke="#ffd43b" stroke-width=".4">${AVX.A(`<animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="${i*.37}s" repeatCount="indefinite"/>`)}</path>`).join("");
  },
  /* 👑 왕관 궤도: 금 왕관과 보석이 비스듬한 고리를 따라 돌아요 */
  gcrown(id){
    const crown = `<g transform="scale(1 3.1)"><path d="M-5,2.6 L-5.6,-2.6 L-2.6,0 L0,-3.8 L2.6,0 L5.6,-2.6 L5,2.6 Z" fill="#ffd43b" stroke="#b07800" stroke-width=".5"/><circle cy="-.2" r=".9" fill="#e03131"/><rect x="-5" y="2.1" width="10" height="1.2" fill="#f59f00"/></g>`;
    const gem = c => `<g transform="scale(1 3.1)"><path d="M0,-2.6 L2,0 L0,2.6 L-2,0 Z" fill="${c}" stroke="#fff" stroke-width=".5"/><path d="M0,-2.6 L2,0 L0,0 Z" fill="#fff" opacity=".6"/></g>`;
    const items = [crown, gem("#4dabf7"), GSTAR(0, 0, 2.6, "#fff9db", "#ffd43b").replace("<path", '<path transform="scale(1 3.1)"'), gem("#e64980"), crown, gem("#51cf66")];
    return `<g transform="translate(50 18) scale(1 .3)"><circle r="43" fill="none" stroke="#ffd43b" stroke-width="1.6" opacity=".55"/><circle r="43" fill="none" stroke="#fff" stroke-width=".6" stroke-dasharray="3 9" opacity=".8"/>
      <g>${AVX.A(`<animateTransform attributeName="transform" type="rotate" values="0;360" dur="7s" repeatCount="indefinite"/>`)}${items.map((s, i) => `<g transform="rotate(${i*60}) translate(43 0) rotate(${-i*60})"><g>${AVX.A(`<animateTransform attributeName="transform" type="rotate" values="0;-360" dur="7s" repeatCount="indefinite"/>`)}${s}</g></g>`).join("")}</g></g>
      ${[[20, 18], [80, 14]].map(([x, y], i) => `<path d="${GLINT(x, y, 3)}" fill="#fff" stroke="#ffd43b" stroke-width=".4">${AVX.A(`<animate attributeName="opacity" values="0;1;0" dur="1.4s" begin="${i*.6}s" repeatCount="indefinite"/>`)}</path>`).join("")}`;
  }
});

/* ---------- 🔥 열정 보너스 안내 ---------- */
function heatTxt(sid){
  const d = Store.dayOf(sid), R = Store.coinRule(), h = heatOf(d.n), nx = heatNext(d.n);
  let s = `🔥 오늘 ${d.n}판 · 코인 ×${h}`;
  if (R.boost > 1) s += ` · 🎉 ${R.boost}배 이벤트`;
  if (nx) s += ` · ${nx[0] - d.n}판 더 하면 ×${nx[1]}`;
  if (R.cap > 0) s += ` · 오늘 ${Math.max(0, R.cap - d.c)}개 남음`;
  return s;
}

/* =====================================================================
   🎁 받은 상 축하 화면 (학생)
   ===================================================================== */
const GIFTBOX = {
  key(sid){ return `${KEY}.gseen.${(Store.cls || {}).cid}.${sid}`; },
  check(){
    const me = ARC.me; if (me === null || me === undefined || isT(me) || ARC.busy) return;
    if (!$("#mdGift") || !$("#mdGift").hidden) return;
    const sid = sidOf(me), w = walletOf(sid), G = Array.isArray(w.gifts) ? w.gifts : []; if (!G.length) return;
    const raw = localStorage.getItem(this.key(sid)), seen = raw === null ? Date.now() - 3*864e5 : +raw || 0;
    const fresh = G.filter(g => (g.at || 0) > seen); if (!fresh.length) return;
    this.show(sid, fresh);
  },
  show(sid, L){
    const coins = L.reduce((s, g) => s + (g.coins || 0), 0), items = [...new Set(L.flatMap(g => g.items || []))], why = (L.find(g => g.why) || {}).why || "";
    const av = Object.assign({}, avOf(sid)); items.forEach(k => { const [slot, v] = k.split(":"); if (slot !== "title") av[slot] = v; });
    const title = items.find(k => k.startsWith("title:")), tv = title ? title.split(":")[1] : null;
    AVX.still = false;
    $("#gfBody").innerHTML = `<div class="gf-rays"></div><div class="gf-in">
      <div class="gf-top">🎁 선생님이 상을 주셨어요!</div>
      ${why ? `<div class="gf-why">“${esc(why)}”</div>` : ""}
      <div class="gf-av">${avatarSVG(av, "")}</div>
      ${tv ? `<div class="gf-ttl"><span class="${ttlCls(tv)}">${esc(itemName("title", tv))}</span></div>` : ""}
      <div class="gf-list">${items.filter(k => !k.startsWith("title:")).map(k => { const [slot, v] = k.split(":"); return `<span>${esc(itemName(slot, v))}</span>`; }).join("")}${coins ? `<span class="c">🪙 +${coins.toLocaleString()} 코인</span>` : ""}</div>
      <div class="gf-note">🎁 선생님 상은 상점에서 살 수 없는 특별한 상이에요</div>
      <div class="arc-row">${items.length ? `<button class="arc-btn p big" id="gfWear">✨ 지금 입어 보기</button>` : ""}<button class="arc-btn big" id="gfOk">고마워요! 😊</button></div></div>
      <div class="gf-conf">${NG.conf(70)}</div>`;
    ARC.modal("#mdGift", true); try { SFX.rec(); } catch(e) {}
    const done = () => { localStorage.setItem(this.key(sid), String(Math.max(...L.map(g => g.at || 0)))); ARC.modal("#mdGift", false); };
    $("#gfOk").onclick = done;
    const wr = $("#gfWear"); if (wr) wr.onclick = async () => {
      const nv = Object.assign({}, avOf(sid)); items.forEach(k => { const [slot, v] = k.split(":"); nv[slot] = v; (CLASH[slot] || []).forEach(c => nv[c] = "none"); });
      try { await Store.putAv(sid, nv); toast("✨ 선생님 상을 입었어요!"); } catch(e){ toast("⚠️ 저장하지 못했어요"); }
      done();
    };
  }
};
(function(){
  const m = document.createElement("div"); m.className = "arc-modal"; m.id = "mdGift"; m.hidden = true;
  m.innerHTML = `<div class="arc-card gf-card" id="gfBody"></div>`; document.body.appendChild(m);
})();

/* =====================================================================
   🛠️ 관리자 → 🎁 칭찬 상 주기
   ===================================================================== */
(function(){
  ADMIN.tabs.gift = "🎁 칭찬 상 주기";
  const gf = ADMIN.gf = {sel: new Set(), coins: 30, title: "", items: new Set(), why: "", brag: true};
  const WHY = ["🎤 발표를 멋지게 했어요", "👂 친구 말을 잘 들었어요", "🤝 친구를 도와줬어요", "📚 공부를 열심히 했어요", "🧹 정리 정돈 최고!", "💡 좋은 생각을 냈어요", "🎯 수업에 집중했어요", "💪 끝까지 포기하지 않았어요"];
  const prevAv = (slot, v) => { const a = Object.assign(avDefault(1), {[slot]: v}); AVX.still = true; const s = avatarSVG(a, ""); AVX.still = false; return s; };
  const base = ADMIN.render.bind(ADMIN);
  ADMIN.render = function(tab, body){
    if (tab !== "gift") return base(tab, body);
    this.tab = tab;
    const K = this.kids(), A = giftList().filter(x => x.slot !== "title");
    const sum = () => {
      const n = gf.sel.size, parts = [];
      if (gf.coins) parts.push(`🪙 ${gf.coins}`); if (gf.title) parts.push(itemName("title", gf.title)); gf.items.forEach(k => { const [s, v] = k.split(":"); parts.push(itemName(s, v)); });
      $("#gfGo").disabled = !n || !parts.length; $("#gfGo").innerHTML = n ? `🎁 ${n}명에게 상 주기${parts.length ? `<small>${esc(parts.join(" · "))}</small>` : ""}` : "🎁 먼저 친구를 골라요";
    };
    body.innerHTML = `<h3>🎁 칭찬 상 주기</h3>
      <p class="arc-small">수업 시간에 잘한 친구에게 코인과 <b>선생님만 줄 수 있는 칭호 · 아바타 상</b>을 줘요. 받은 친구는 홈에 오면 🎁 축하 화면이 떠요. 선생님 상은 상점에서 살 수 없어요.</p>
      <div class="ad-sec"><h4>① 누구에게? <small style="font:13px 'Gowun Dodum',sans-serif;color:#b9b0dd">여러 명 고를 수 있어요</small></h4>
        <div class="gf-kids" id="gfKids">${K.map(s => `<button data-no="${s.no}" class="${gf.sel.has(s.no) ? "on" : ""}">${avI(sidOf(s.no))}<b>${s.no}</b><small>${esc(s.name)}</small></button>`).join("")}</div>
        <div class="arc-row" style="justify-content:flex-start"><button class="arc-btn sm" id="gfAll">✅ 모두 고르기</button><button class="arc-btn sm" id="gfNone">↩️ 다 풀기</button></div></div>
      <div class="ad-sec"><h4>② 무엇을?</h4>
        <div class="arc-row" style="justify-content:flex-start"><span style="align-self:center;min-width:90px">🪙 코인</span><div class="arc-seg" id="gfCoins" style="margin:0">${[0, 10, 30, 50, 100, 300].map(v => `<button data-v="${v}" class="${gf.coins === v ? "on" : ""}">${v ? "+" + v : "없음"}</button>`).join("")}</div></div>
        <div class="gf-h">🏷️ 선생님 칭호 <small>하나 고르기 · 다시 누르면 빼기</small></div>
        <div class="gf-ttls" id="gfTtls">${GIFT_TITLES.map(([v]) => `<button data-t="${v}" class="${gf.title === v ? "on" : ""}"><span class="${ttlCls(v)}">${esc(itemName("title", v))}</span></button>`).join("")}</div>
        <div class="gf-h">🎨 선생님 아바타 상 <small>여러 개 고를 수 있어요</small></div>
        <div class="gf-avs" id="gfAvs">${A.map(x => `<button data-k="${x.k}" class="${gf.items.has(x.k) ? "on" : ""}"><span class="pv">${prevAv(x.slot, x.v)}</span><b>${esc(x.n.replace("🎁 ", ""))}</b><small>${{xbg: "배경", xfr: "테두리", aura: "날개", fx: "효과"}[x.slot]}</small></button>`).join("")}</div></div>
      <div class="ad-sec"><h4>③ 칭찬 한마디 <small style="font:13px 'Gowun Dodum',sans-serif;color:#b9b0dd">축하 화면에 보여요</small></h4>
        <div class="gf-whyq" id="gfWhyQ">${WHY.map(t => `<button>${t}</button>`).join("")}</div>
        <div class="ad-in"><input id="gfWhy" maxlength="40" value="${esc(gf.why)}" placeholder="예) 모둠 발표를 정말 멋지게 했어요!"></div>
        <label class="ad-sw" style="margin-top:10px"><input type="checkbox" id="gfBrag" ${gf.brag ? "checked" : ""}><span class="k"></span><span>💬 채팅에 자랑하기<small>“🎁 ○○이(가) 선생님께 상을 받았어요!” 알림이 올라가요</small></span></label></div>
      <button class="arc-btn p big gf-go" id="gfGo"></button>
      <div class="ad-sec" style="margin-top:16px"><h4>📜 최근에 준 상</h4><div id="gfHist"></div></div>`;
    const hist = () => {
      const L = []; K.forEach(s => (walletOf(sidOf(s.no)).gifts || []).forEach(g => L.push(Object.assign({no: s.no}, g))));
      L.sort((a, b) => (b.at || 0) - (a.at || 0));
      $("#gfHist").innerHTML = L.slice(0, 20).map(g => `<div class="ad-chat"><div class="r">${avI(sidOf(g.no))}<b>${g.no}번 ${esc(nameOf(g.no))}</b><span class="t">${[g.coins ? `🪙 ${g.coins}` : "", ...(g.items || []).map(k => { const [s, v] = k.split(":"); return itemName(s, v); })].filter(Boolean).map(esc).join(" · ")}${g.why ? ` — “${esc(g.why)}”` : ""}</span><small>${agoTxt(g.at)}</small></div></div>`).join("") || `<p class="arc-empty">아직 준 상이 없어요</p>`;
    };
    hist(); sum();
    $("#gfKids").onclick = e => { const b = e.target.closest("[data-no]"); if (!b) return; const n = +b.dataset.no; gf.sel.has(n) ? gf.sel.delete(n) : gf.sel.add(n); b.classList.toggle("on", gf.sel.has(n)); sum(); };
    $("#gfAll").onclick = () => { K.forEach(s => gf.sel.add(s.no)); $$("#gfKids button").forEach(b => b.classList.add("on")); sum(); };
    $("#gfNone").onclick = () => { gf.sel.clear(); $$("#gfKids button").forEach(b => b.classList.remove("on")); sum(); };
    $("#gfCoins").onclick = e => { const b = e.target.closest("[data-v]"); if (!b) return; gf.coins = +b.dataset.v; $$("#gfCoins button").forEach(x => x.classList.toggle("on", x === b)); sum(); };
    $("#gfTtls").onclick = e => { const b = e.target.closest("[data-t]"); if (!b) return; gf.title = gf.title === b.dataset.t ? "" : b.dataset.t; $$("#gfTtls button").forEach(x => x.classList.toggle("on", x.dataset.t === gf.title)); sum(); };
    $("#gfAvs").onclick = e => { const b = e.target.closest("[data-k]"); if (!b) return; const k = b.dataset.k; gf.items.has(k) ? gf.items.delete(k) : gf.items.add(k); b.classList.toggle("on", gf.items.has(k)); sum(); };
    $("#gfWhyQ").onclick = e => { const b = e.target.closest("button"); if (!b) return; $("#gfWhy").value = gf.why = b.textContent.replace(/^\S+\s/, ""); };
    $("#gfWhy").oninput = e => gf.why = e.target.value;
    $("#gfBrag").onchange = e => gf.brag = e.target.checked;
    $("#gfGo").onclick = async () => {
      const L = [...gf.sel].sort((a, b) => a - b); if (!L.length) return;
      const items = [...gf.items]; if (gf.title) items.unshift("title:" + gf.title);
      $("#gfGo").disabled = true;
      try {
        for (const no of L) await Store.award(sidOf(no), {coins: gf.coins, items, why: gf.why});
        if (gf.brag){
          const nm = L.length === 1 ? iga(who(L[0])) : `${L.length > 3 ? `${who(L[0])} 외 ${L.length - 1}명` : L.map(n => who(n)).join(", ")}이(가)`;
          const names = items.map(k => itemName(...k.split(":")).replace("🎁 ", ""));
          const prize = names.length ? `‘${names[0]}’${names.length > 1 ? ` 외 ${names.length - 1}가지` : ""} 상` : `🪙 ${gf.coins}코인`;
          CHAT.sys(`🎁 ${nm} 선생님께 ${prize}을 받았어요! 👏`);
        }
        toast(`🎁 ${L.length}명에게 상을 줬어요!`);
        gf.sel.clear(); gf.why = ""; this.render("gift", body);
      } catch(e){ console.error(e); alert("상을 주지 못했어요: " + (e.message || e)); $("#gfGo").disabled = false; }
    };
  };
})();
