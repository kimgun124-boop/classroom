/* =====================================================================
   🗺️ 동물 랜덤 디펜스 — 50단계마다 새로운 곳 (2026.11.27)
   - 1000단계 = 20곳. 50단계를 지킬 때마다 완전히 다른 곳으로 떠나요
     (하늘·먼 산·섬 색·소품·몬스터 모자·날리는 꽃잎/눈/불티까지 모두 바뀌어요)
   - 5단계마다는 같은 곳 안에서 '구역'(길 모양·센 땅)만 바뀌어요
   - 곳마다 👑 보스와 👹 마왕의 이름이 달라요
   ===================================================================== */
const RD_WD = w => Math.floor((Math.max(1, w) - 1)/50) % 20;   // 몇 번째 곳 (0~19)

/* 새 곳(art 10~19)의 마을 지붕 색 */
const RDW_ROOF = ["#f06595", "#e8590c", "#2b8a3e", "#e64980", "#7048e8", "#4dabf7", "#cc5de8", "#c92a2a", "#1c7ed6", "#f59f00"];

const RD_WORLD = (() => {
  const old = k => Object.assign({}, RD_TH[k], {tp: RD_TOP[k], art: k});
  const W = [
    /* 1 · 1~50 */
    Object.assign(old(0), {n: "🌼 꽃밭 마을", amb: "petal", boss: ["가시덩굴 슬라임", "꽃밭 마왕 로즈킹"],
      bd: {sky: [[0, "#5fb6ff"], [.55, "#bfe9ff"], [1, "#e6fbe0"]], sun: {x: .82, y: .16, r: .07, c: "#fff3bf"}, clouds: {n: 7, c: "#ffffff", a: .9},
        L: [{t: "mt", y: .52, h: .2, c: "#a9cdf0", snow: 1}, {t: "hill", y: .66, h: .1, c: "#9ad98f"}, {t: "trees", y: .76, h: .08, c: "#5fbf6a", c2: "#ffafcc"}, {t: "hill", y: .86, h: .05, c: "#6fcf73", flw: ["#fff", "#ffd6e7", "#ffe066"]}]}}),
    /* 2 · 51~100 */
    Object.assign(old(1), {n: "🍄 버섯 숲", amb: "spore", boss: ["독버섯 대장", "버섯 마왕 머쉬로드"],
      bd: {sky: [[0, "#1f6f3a"], [.5, "#6fbf4a"], [1, "#d8f5a2"]], rays: {c: "rgba(255,250,200,.18)", n: 6},
        L: [{t: "pines", y: .55, h: .2, c: "#3d8a44"}, {t: "shrooms", y: .7, h: .16, c: "#ff8787", c2: "#fff4e6"}, {t: "trees", y: .8, h: .08, c: "#2f7a35"}, {t: "hill", y: .9, h: .04, c: "#4c9a2a"}]}}),
    /* 3 · 101~150 */
    Object.assign(old(2), {n: "🏖️ 바닷가", amb: "sparkle", boss: ["집게발 슬라임", "바다 마왕 크랩킹"],
      bd: {sky: [[0, "#1c7ed6"], [.5, "#74c0fc"], [1, "#fff3bf"]], sun: {x: .2, y: .2, r: .08, c: "#fff9db"}, clouds: {n: 5, c: "#fff", a: .85},
        L: [{t: "sea", y: .56, h: .14, c: "#3b9be0", c2: "#a5e4ff"}, {t: "dune", y: .74, h: .06, c: "#ffe8a3"}, {t: "palms", y: .82, h: .2, c: "#2f9e44"}, {t: "dune", y: .9, h: .04, c: "#ffd977"}]}}),
    /* 4 · 151~200 */
    Object.assign(old(3), {n: "🏜️ 사막", amb: "sand", boss: ["모래 폭풍 슬라임", "사막 마왕 파라오"],
      bd: {sky: [[0, "#ff8a3d"], [.5, "#ffc98a"], [1, "#fff1dc"]], sun: {x: .75, y: .22, r: .11, c: "#fff0c2"},
        L: [{t: "pyr", y: .62, h: .2, c: "#e8b06b"}, {t: "dune", y: .7, h: .1, c: "#f5c07a"}, {t: "cactus", y: .82, h: .1, c: "#4c9a5a"}, {t: "dune", y: .9, h: .05, c: "#e9a75a"}]}}),
    /* 5 · 201~250 */
    Object.assign(old(5), {n: "❄️ 빙하", amb: "snow", boss: ["눈보라 슬라임", "얼음 마왕 프로스트"],
      bd: {sky: [[0, "#1c3d8f"], [.5, "#74c0fc"], [1, "#e7f5ff"]], sun: {x: .8, y: .18, r: .06, c: "#ffffff"},
        L: [{t: "mt", y: .55, h: .26, c: "#9cc4ec", snow: 1}, {t: "ice", y: .7, h: .14, c: "#d0ecff"}, {t: "pines", y: .82, h: .1, c: "#4c7aa8", snow: 1}, {t: "hill", y: .9, h: .04, c: "#f1f8ff"}]}}),
    /* 6 · 251~300 */
    {n: "🌸 벚꽃 마을", art: 10, hat: 10, amb: "petal", boss: ["꽃보라 슬라임", "벚꽃 마왕 하나비"],
      sky: "linear-gradient(#ffb8d4,#ffe3ee 55%,#fff5f8)", pa: ["#f3dcc6", "#d9b08c"], sl: ["#b197fc", "#7048e8"], ey: "#1b1233",
      tp: {top: ["#c9f2c7", "#8fd694"], side: ["#c08a55", "#7a4f2a"], slot: ["#fffafc", "#ffe0ec", "#d99ab3"], tuft: "rgba(214,51,108,.25)", dot: ["#ffafcc", "#fff", "#ffc8dd"]},
      bd: {sky: [[0, "#ff9ec4"], [.5, "#ffd6e7"], [1, "#fff5f8"]], sun: {x: .78, y: .2, r: .09, c: "#fff0f6"},
        L: [{t: "mt", y: .55, h: .22, c: "#e8b4d0", snow: 1}, {t: "pagoda", y: .66, h: .18, c: "#c2577f"}, {t: "blossom", y: .78, h: .1, c: "#ff8fb8", c2: "#ffd1e3"}, {t: "hill", y: .9, h: .04, c: "#a6dd9f", flw: ["#ffafcc", "#fff"]}]}},
    /* 7 · 301~350 */
    Object.assign(old(6), {n: "🌙 밤의 숲", amb: "firefly", boss: ["그림자 슬라임", "밤의 마왕 녹턴"],
      bd: {sky: [[0, "#070726"], [.55, "#262b6b"], [1, "#5b3fb8"]], moon: {x: .78, y: .18, r: .07}, stars: 90,
        L: [{t: "mt", y: .58, h: .18, c: "#2b2f6b"}, {t: "pines", y: .7, h: .2, c: "#1f2456"}, {t: "trees", y: .82, h: .1, c: "#181c48"}, {t: "hill", y: .92, h: .04, c: "#141838"}]}}),
    /* 8 · 351~400 */
    {n: "🍁 단풍 산", art: 11, hat: 11, amb: "leaf", boss: ["낙엽 회오리 슬라임", "단풍 마왕 오텀"],
      sky: "linear-gradient(#ff9f5a,#ffd8a8 55%,#fff4e6)", pa: ["#d9b38c", "#b08960"], sl: ["#5c940d", "#2b8a3e"], ey: "#1b1233",
      tp: {top: ["#f4c27a", "#e09a4a"], side: ["#8d5a3b", "#4e2f1d"], slot: ["#fff8ef", "#ffe0bd", "#c98a4b"], tuft: "rgba(150,60,20,.35)", dot: ["#e8590c", "#ffd43b", "#c92a2a"]},
      bd: {sky: [[0, "#ff8a5c"], [.5, "#ffc999"], [1, "#fff0de"]], sun: {x: .25, y: .24, r: .1, c: "#fff3bf"},
        L: [{t: "mt", y: .52, h: .26, c: "#c98a6e"}, {t: "maple", y: .66, h: .12, c: "#e8590c", c2: "#ffa94d"}, {t: "maple", y: .78, h: .1, c: "#c92a2a", c2: "#ffd43b"}, {t: "hill", y: .9, h: .04, c: "#b5651d"}]}},
    /* 9 · 401~450 */
    Object.assign(old(4), {n: "🌋 화산", amb: "ember", boss: ["용암 슬라임", "화산 마왕 이그니스"],
      bd: {sky: [[0, "#120303"], [.5, "#4a1308"], [1, "#d9480f"]], stars: 20,
        L: [{t: "volc", y: .5, h: .32, c: "#2b1512", glow: "#ff6b1a"}, {t: "mt", y: .7, h: .12, c: "#3d1f18"}, {t: "rocks", y: .82, h: .08, c: "#2b1512", glow: "#ff922b"}, {t: "hill", y: .92, h: .03, c: "#1f0d0a"}]}}),
    /* 10 · 451~500 */
    {n: "🪸 바닷속 왕국", art: 13, hat: 13, amb: "bubble", boss: ["해파리 슬라임", "심해 마왕 크라켄"],
      sky: "linear-gradient(#0b3d91,#1971c2 50%,#4dabf7)", pa: ["#ffe8a3", "#e0c068"], sl: ["#ff8fab", "#d6336c"], ey: "#1b1233",
      tp: {top: ["#ffe9b0", "#e8c873"], side: ["#c49a58", "#8a6630"], slot: ["#f1fbff", "#c5f6fa", "#5cb8d6"], tuft: "rgba(32,120,160,.3)", dot: ["#ff8787", "#ffa8a8", "#fff"]},
      bd: {sky: [[0, "#5fd3f3"], [.35, "#1c7ed6"], [1, "#082a66"]], rays: {c: "rgba(200,245,255,.16)", n: 7},
        L: [{t: "hill", y: .62, h: .1, c: "#1a5aa0"}, {t: "coral", y: .74, h: .16, c: "#ff6b9a", c2: "#ffa94d"}, {t: "kelp", y: .86, h: .2, c: "#2f9e70"}, {t: "dune", y: .92, h: .04, c: "#d9c07a"}]}},
    /* 11 · 501~550 */
    {n: "🌴 정글", art: 12, hat: 12, amb: "firefly", boss: ["덩굴 뱀 슬라임", "정글 마왕 콩가"],
      sky: "linear-gradient(#2b8a3e,#69db7c 55%,#d8f5a2)", pa: ["#a0784e", "#7a5532"], sl: ["#ff922b", "#d9480f"], ey: "#1b1233",
      tp: {top: ["#7bc96f", "#3f8f3a"], side: ["#6b4a2b", "#3a2615"], slot: ["#f4fce3", "#c0eb75", "#5c940d"], tuft: "rgba(20,70,20,.45)", dot: ["#ff6b6b", "#ffd43b", "#fff"]},
      bd: {sky: [[0, "#cfeec0"], [.4, "#7cc46a"], [1, "#245c2c"]], rays: {c: "rgba(255,255,210,.2)", n: 5},
        L: [{t: "mt", y: .5, h: .2, c: "#5e9e6a"}, {t: "palms", y: .68, h: .22, c: "#2b7a3a"}, {t: "jungle", y: .8, h: .12, c: "#1e5c28"}, {t: "hill", y: .92, h: .04, c: "#173f1c"}]}},
    /* 12 · 551~600 */
    Object.assign(old(7), {n: "🍭 과자 나라", amb: "sparkle", boss: ["젤리곰 슬라임", "과자 마왕 캔디킹"],
      bd: {sky: [[0, "#f783ac"], [.5, "#ffc2d9"], [1, "#fff0f6"]], clouds: {n: 6, c: "#fff", a: .95}, rainbow: 1,
        L: [{t: "hill", y: .6, h: .14, c: "#ffb3d1"}, {t: "candy", y: .72, h: .16, c: "#ff6b9a"}, {t: "hill", y: .82, h: .06, c: "#ffd8a8", drip: "#ff8fab"}, {t: "hill", y: .92, h: .03, c: "#e9a8c6"}]}}),
    /* 13 · 601~650 */
    {n: "💎 수정 동굴", art: 14, hat: 14, amb: "sparkle", boss: ["수정 거미 슬라임", "보석 마왕 크리스탈로"],
      sky: "radial-gradient(circle at 50% 30%,#5f3dc4,#2b1d6b 55%,#120a33)", pa: ["#9775fa", "#7048e8"], sl: ["#63e6be", "#0ca678"], ey: "#1b1233",
      tp: {top: ["#6a5aa8", "#463a7a"], side: ["#2e2456", "#16112b"], slot: ["#b8a6ff", "#8c76e6", "#3a2c78"], tuft: "rgba(150,240,255,.25)", dot: ["#99e9f2", "#e599f7", "#fff"]},
      bd: {sky: [[0, "#0d0826"], [.5, "#2a1a63"], [1, "#4b2a9a"]], stars: 40, cave: 1,
        L: [{t: "crystal", y: .62, h: .22, c: "#7b5fd6", c2: "#c0f2ff"}, {t: "mt", y: .72, h: .1, c: "#24184f"}, {t: "crystal", y: .84, h: .14, c: "#e599f7", c2: "#fff"}, {t: "hill", y: .93, h: .03, c: "#140d30"}]}},
    /* 14 · 651~700 */
    {n: "☁️ 구름 왕국", art: 15, hat: 15, amb: "sparkle", boss: ["천둥 구름 슬라임", "구름 마왕 썬더킹"],
      sky: "linear-gradient(#4dabf7,#a5d8ff 55%,#e7f5ff)", pa: ["#fff9db", "#ffe8a3"], sl: ["#ffa94d", "#e8590c"], ey: "#1b1233",
      tp: {top: ["#ffffff", "#dbe9ff"], side: ["#b9cce8", "#8aa4cc"], slot: ["#ffffff", "#eef4ff", "#9fb4d6"], tuft: "rgba(120,150,200,.3)", dot: ["#ffd43b", "#fff", "#a5d8ff"]},
      bd: {sky: [[0, "#3d8bfd"], [.5, "#9fd0ff"], [1, "#f0f8ff"]], sun: {x: .82, y: .16, r: .08, c: "#fffbe6"}, rainbow: 1,
        L: [{t: "isle", y: .45, h: .1, c: "#8fc7ff"}, {t: "castleC", y: .62, h: .2, c: "#e3efff"}, {t: "cloudbank", y: .76, h: .1, c: "#ffffff"}, {t: "cloudbank", y: .9, h: .08, c: "#eaf3ff"}]}},
    /* 15 · 701~750 */
    {n: "🌈 무지개 언덕", art: 16, hat: 16, amb: "petal", boss: ["무지개 뱀 슬라임", "무지개 마왕 프리즘"],
      sky: "linear-gradient(#91a7ff,#d0bfff 45%,#ffdeeb 75%,#fff3bf)", pa: ["#fff3bf", "#ffe066"], sl: ["#4dabf7", "#1864ab"], ey: "#1b1233",
      tp: {top: ["#b2f2bb", "#69db7c"], side: ["#c08a55", "#7a4f2a"], slot: ["#ffffff", "#f3f0ff", "#b197fc"], tuft: "rgba(43,138,62,.3)", dot: ["#ff6b6b", "#ffd43b", "#4dabf7", "#cc5de8"]},
      bd: {sky: [[0, "#7f92ff"], [.45, "#cdb8ff"], [.75, "#ffd6e7"], [1, "#fff4c2"]], rainbow: 2, clouds: {n: 6, c: "#fff", a: .9},
        L: [{t: "hill", y: .6, h: .14, c: "#b7a7ff"}, {t: "hill", y: .72, h: .1, c: "#8ce99a", flw: ["#ff6b6b", "#ffd43b", "#4dabf7", "#cc5de8"]}, {t: "trees", y: .82, h: .08, c: "#51cf66", c2: "#ffd43b"}, {t: "hill", y: .92, h: .04, c: "#40c057"}]}},
    /* 16 · 751~800 */
    {n: "⚙️ 시계탑 도시", art: 17, hat: 17, amb: "ember", boss: ["톱니 로봇 슬라임", "시계 마왕 크로노스"],
      sky: "linear-gradient(#e8590c,#ffa94d 45%,#ffe8cc)", pa: ["#adb5bd", "#868e96"], sl: ["#5c7cfa", "#364fc7"], ey: "#1b1233",
      tp: {top: ["#c7b299", "#a08a6e"], side: ["#6b5a48", "#3d3227"], slot: ["#f8f1e7", "#e3d5c0", "#8c7558"], tuft: "rgba(80,60,40,.3)", dot: ["#ffd43b", "#fff"]},
      bd: {sky: [[0, "#5a2a8a"], [.4, "#e8590c"], [.75, "#ffb366"], [1, "#ffe8cc"]], sun: {x: .5, y: .48, r: .12, c: "#fff0c2"},
        L: [{t: "city", y: .66, h: .3, c: "#6b3a5a", win: "#ffd43b", tower: 1}, {t: "city", y: .78, h: .18, c: "#4a2740", win: "#ffe8a3"}, {t: "gears", y: .86, h: .1, c: "#3a2030"}, {t: "hill", y: .93, h: .03, c: "#2b1726"}]}},
    /* 17 · 801~850 */
    {n: "🌌 오로라 설원", art: 18, hat: 18, amb: "snow", boss: ["오로라 늑대 슬라임", "극지 마왕 오로라"],
      sky: "linear-gradient(#050b2b,#0b2350 55%,#1b4a7a)", pa: ["#d0ebff", "#a5d8ff"], sl: ["#ff6b9a", "#c2255c"], ey: "#1b1233",
      tp: {top: ["#f1f8ff", "#c9ddf2"], side: ["#6f8fb5", "#3d5a80"], slot: ["#ffffff", "#e7f5ff", "#7a9cc6"], tuft: "rgba(80,130,190,.35)", dot: ["#fff", "#96f2d7", "#b197fc"]},
      bd: {sky: [[0, "#030817"], [.55, "#0b2350"], [1, "#2b5d8f"]], stars: 120, aurora: ["#63e6be", "#74c0fc", "#b197fc"], moon: {x: .18, y: .16, r: .045},
        L: [{t: "mt", y: .56, h: .24, c: "#2c4a70", snow: 1}, {t: "pines", y: .72, h: .14, c: "#1d3354", snow: 1}, {t: "ice", y: .82, h: .1, c: "#b9d4ef"}, {t: "hill", y: .92, h: .04, c: "#e3efff"}]}},
    /* 18 · 851~900 */
    Object.assign(old(8), {n: "🪐 우주 정거장", amb: "star", boss: ["외계인 슬라임", "우주 마왕 갤럭시아"],
      bd: {sky: [[0, "#05051a"], [.5, "#1c1d52"], [1, "#3b1f7a"]], stars: 160, planet: 1, nebula: ["#7048e8", "#e64980"],
        L: [{t: "station", y: .64, h: .18, c: "#2b2f6b", win: "#74c0fc"}, {t: "rocks", y: .8, h: .1, c: "#25286b", glow: "#9775fa"}, {t: "hill", y: .92, h: .04, c: "#14153d"}]}}),
    /* 19 · 901~950 */
    {n: "✨ 천공 신전", art: 19, hat: 19, amb: "sparkle", boss: ["황금 수호 슬라임", "천공 마왕 솔라리스"],
      sky: "linear-gradient(#ffe066,#fff3bf 45%,#e7f5ff)", pa: ["#f8f9fa", "#dee2e6"], sl: ["#845ef7", "#5f3dc4"], ey: "#1b1233",
      tp: {top: ["#fff9db", "#ffe8a3"], side: ["#d9c08a", "#a8884a"], slot: ["#ffffff", "#fff9db", "#d4b860"], tuft: "rgba(200,160,60,.3)", dot: ["#ffd43b", "#fff", "#ffe8cc"]},
      bd: {sky: [[0, "#ffc94d"], [.45, "#fff0b3"], [1, "#eaf6ff"]], sun: {x: .5, y: .12, r: .1, c: "#ffffff"}, rays: {c: "rgba(255,255,255,.3)", n: 9, top: 1}, clouds: {n: 6, c: "#fff", a: .95},
        L: [{t: "temple", y: .64, h: .26, c: "#d9b860", c2: "#fff3bf"}, {t: "cloudbank", y: .74, h: .08, c: "#fffdf0"}, {t: "columns", y: .86, h: .14, c: "#f8f3e3"}, {t: "cloudbank", y: .93, h: .06, c: "#ffffff"}]}},
    /* 20 · 951~1000 */
    Object.assign(old(9), {n: "👑 마왕성", amb: "ember", boss: ["어둠 기사 슬라임", "대마왕 다크로드"],
      bd: {sky: [[0, "#0a0106"], [.55, "#3b0a1a"], [1, "#7a2c8f"]], moon: {x: .5, y: .2, r: .09, red: 1}, stars: 40,
        L: [{t: "mt", y: .6, h: .2, c: "#4a1a3a"}, {t: "castle", y: .7, h: .32, c: "#3a1230", win: "#ff4d4d"}, {t: "rocks", y: .84, h: .08, c: "#12040c", glow: "#c92a2a"}, {t: "hill", y: .93, h: .03, c: "#0a0206"}]}})
  ];
  W.forEach(w => { w.hat = w.hat != null ? w.hat : w.art; });
  return W;
})();

/* ---------------------------------------------------------------------
   🎨 먼 풍경 한 장 (곳이 바뀔 때만 그려요 → CSS 배경으로 붙여 매 장면 부담 없음)
   --------------------------------------------------------------------- */
const RDW = {
  rng(s){ s = (s >>> 0) || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s/4294967296; }; },
  mix(a, b, k){ const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)), A = p(a), B = p(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v)*k).toString(16).padStart(2, "0")).join(""); },
  paint(wd, w, h){
    const Wd = RD_WORLD[wd], B = Wd.bd, cv = document.createElement("canvas"); cv.width = w; cv.height = h;
    const t = cv.getContext("2d"), R = this.rng(1234 + wd*977), m = Math.min(w, h), hz = B.sky[B.sky.length - 1][1];
    /* 하늘 */
    const sg = t.createLinearGradient(0, 0, 0, h); B.sky.forEach(([o, c]) => sg.addColorStop(o, c)); t.fillStyle = sg; t.fillRect(0, 0, w, h);
    if (B.nebula) B.nebula.forEach((c, i) => { const x = w*(.25 + i*.5), y = h*(.25 + i*.12), r = m*.6, g = t.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c + "66"); g.addColorStop(1, c + "00"); t.fillStyle = g; t.fillRect(0, 0, w, h); });
    if (B.stars) for (let i = 0; i < B.stars; i++){ const x = R()*w, y = R()*h*.7, r = R() < .1 ? 1.8 : .5 + R()*1.1; t.globalAlpha = .4 + R()*.6; t.fillStyle = R() < .15 ? "#ffe8a3" : "#fff"; t.beginPath(); t.arc(x, y, r, 0, 7); t.fill();
      if (r > 1.6){ t.globalAlpha = .5; t.strokeStyle = "#fff"; t.lineWidth = .8; t.beginPath(); t.moveTo(x - r*3, y); t.lineTo(x + r*3, y); t.moveTo(x, y - r*3); t.lineTo(x, y + r*3); t.stroke(); } }
    t.globalAlpha = 1;
    if (B.aurora) B.aurora.forEach((c, i) => { t.save(); t.globalAlpha = .38; t.globalCompositeOperation = "lighter";
      for (let x = 0; x < w; x += 3){ const y0 = h*(.12 + i*.07) + Math.sin(x/w*7 + i*1.7)*h*.05 + Math.sin(x/w*17 + i)*h*.015, L = h*(.16 + .06*Math.sin(x/w*5 + i));
        const g = t.createLinearGradient(0, y0, 0, y0 + L); g.addColorStop(0, c + "00"); g.addColorStop(.35, c); g.addColorStop(1, c + "00"); t.fillStyle = g; t.fillRect(x, y0, 3, L); } t.restore(); });
    if (B.sun){ const S = B.sun, x = w*S.x, y = h*S.y, r = m*S.r, g = t.createRadialGradient(x, y, r*.4, x, y, r*4); g.addColorStop(0, S.c); g.addColorStop(.25, S.c + "88"); g.addColorStop(1, S.c + "00"); t.fillStyle = g; t.fillRect(0, 0, w, h); t.fillStyle = S.c; t.beginPath(); t.arc(x, y, r, 0, 7); t.fill(); }
    if (B.moon){ const M = B.moon, x = w*M.x, y = h*M.y, r = m*M.r, c = M.red ? "#ff6b6b" : "#fff9db", g = t.createRadialGradient(x, y, r*.6, x, y, r*3.5); g.addColorStop(0, c + "aa"); g.addColorStop(1, c + "00"); t.fillStyle = g; t.fillRect(0, 0, w, h);
      t.fillStyle = M.red ? "#ff8787" : "#fffbe6"; t.beginPath(); t.arc(x, y, r, 0, 7); t.fill(); t.fillStyle = "rgba(0,0,0,.08)"; [[-.3, -.2, .22], [.25, .2, .16], [.1, -.4, .1]].forEach(([a, b, k]) => { t.beginPath(); t.arc(x + a*r, y + b*r, k*r, 0, 7); t.fill(); }); }
    if (B.planet){ const x = w*.8, y = h*.22, r = m*.09, g = t.createRadialGradient(x - r*.4, y - r*.4, r*.1, x, y, r); g.addColorStop(0, "#ffd8a8"); g.addColorStop(1, "#e8590c"); t.fillStyle = g; t.beginPath(); t.arc(x, y, r, 0, 7); t.fill();
      t.strokeStyle = "rgba(255,236,200,.75)"; t.lineWidth = r*.12; t.beginPath(); t.ellipse(x, y, r*1.8, r*.42, -.35, 0, 7); t.stroke();
      const x2 = w*.14, y2 = h*.34, r2 = m*.04; t.fillStyle = "#91a7ff"; t.beginPath(); t.arc(x2, y2, r2, 0, 7); t.fill(); t.fillStyle = "rgba(255,255,255,.35)"; t.beginPath(); t.arc(x2 - r2*.3, y2 - r2*.3, r2*.4, 0, 7); t.fill(); }
    if (B.rainbow){ const x = w*(B.rainbow === 2 ? .5 : .3), y = h*.72, r = m*(B.rainbow === 2 ? .75 : .45); t.save(); t.globalAlpha = .45; ["#ff6b6b", "#ffa94d", "#ffe066", "#8ce99a", "#74c0fc", "#b197fc"].forEach((c, i) => { t.strokeStyle = c; t.lineWidth = r*.05; t.beginPath(); t.arc(x, y, r - i*r*.05, Math.PI, 0); t.stroke(); }); t.restore(); }
    if (B.rays){ t.save(); t.globalCompositeOperation = "lighter"; for (let i = 0; i < B.rays.n; i++){ const x = w*(.08 + i/B.rays.n*.9 + R()*.05), ww = w*(.03 + R()*.04); t.fillStyle = B.rays.c; t.beginPath();
      if (B.rays.top){ t.moveTo(w*.5, 0); t.lineTo(x - ww, h); t.lineTo(x + ww, h); } else { t.moveTo(x, 0); t.lineTo(x + ww, 0); t.lineTo(x + ww*3 - w*.08, h); t.lineTo(x - w*.08, h); } t.closePath(); t.fill(); } t.restore(); }
    if (B.clouds) for (let i = 0; i < B.clouds.n; i++) this.cloud(t, R()*w, h*(.06 + R()*.3), m*(.05 + R()*.05), B.clouds.c, B.clouds.a*(.6 + R()*.4));
    /* 겹겹이 땅 (멀수록 하늘색에 섞여 흐려져요) */
    B.L.forEach((L, li) => { const fade = (1 - li/B.L.length)*.45, c = this.mix(L.c, hz, fade*.6), c2 = L.c2 ? this.mix(L.c2, hz, fade*.4) : null;
      this.layer(t, L, w, h, m, R, c, c2, li); });
    if (B.cave){ const g = t.createRadialGradient(w/2, h*.45, m*.3, w/2, h*.45, Math.max(w, h)*.8); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(5,0,20,.75)"); t.fillStyle = g; t.fillRect(0, 0, w, h); }
    /* 가장자리를 살짝 어둡게 → 가운데 섬이 돋보여요 */
    const vg = t.createRadialGradient(w/2, h/2, m*.35, w/2, h/2, Math.max(w, h)*.75); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.28)"); t.fillStyle = vg; t.fillRect(0, 0, w, h);
    return cv; },
  cloud(t, x, y, r, c, a){ t.save(); t.globalAlpha = a; t.fillStyle = c; [[0, 0, 1], [-.9, .25, .7], [.95, .25, .75], [-.4, -.35, .7], [.45, -.3, .65]].forEach(([dx, dy, k]) => { t.beginPath(); t.arc(x + dx*r, y + dy*r, r*k, 0, 7); t.fill(); });
    t.fillRect(x - r*1.5, y + r*.2, r*3, r*.6); t.globalAlpha = a*.25; t.fillStyle = "#000"; t.fillRect(x - r*1.5, y + r*.65, r*3, r*.15); t.restore(); },
  ridge(t, w, h, y0, amp, R, jag, c){ const n = jag ? 9 + Math.floor(R()*5) : 0, ph = R()*9, f1 = 1.5 + R()*2, f2 = 4 + R()*4; t.beginPath(); t.moveTo(0, h);
    if (jag){ const xs = []; for (let i = 0; i <= n; i++) xs.push(i/n*w + (R() - .5)*w/n*.5); xs.forEach((x, i) => { const pk = y0 - amp*(.45 + R()*.55); if (i) t.lineTo((x + xs[i - 1])/2, y0 - amp*(.05 + R()*.25)); t.lineTo(x, pk); }); }
    else for (let x = 0; x <= w; x += 6) t.lineTo(x, y0 - amp*(.5 + .35*Math.sin(x/w*f1*6.28 + ph) + .15*Math.sin(x/w*f2*6.28 + ph*2)));
    t.lineTo(w, h); t.closePath(); t.fillStyle = c; t.fill(); },
  layer(t, L, w, h, m, R, c, c2, li){ const y0 = h*L.y, A = h*L.h, dk = this.mix(c, "#000000", .18), lt = this.mix(c, "#ffffff", .25);
    const ground = (k = .3) => this.ridge(t, w, h, y0 + A*.35, A*k, R, 0, c);
    switch (L.t){
      case "mt": { const sd = Math.floor(R()*1e9); this.ridge(t, w, h, y0, A, this.rng(sd), 1, c);
        if (L.snow){ t.save(); t.beginPath(); t.rect(0, 0, w, y0 - A*.62); t.clip(); this.ridge(t, w, h, y0, A, this.rng(sd), 1, this.mix(c, "#ffffff", .75)); t.restore(); }
        t.save(); t.globalAlpha = .22; t.beginPath(); t.rect(w*.5, 0, w*.5, h); t.clip(); this.ridge(t, w, h, y0, A, this.rng(sd), 1, dk); t.restore();
        break; }
      case "hill": case "dune": this.ridge(t, w, h, y0, L.t === "dune" ? A*.7 : A, R, 0, c);
        if (L.flw) for (let i = 0; i < w/9; i++){ t.fillStyle = L.flw[i % L.flw.length]; t.globalAlpha = .85; t.beginPath(); t.arc(R()*w, y0 + R()*(h - y0), 1.4 + R()*1.6, 0, 7); t.fill(); }
        if (L.drip){ t.fillStyle = L.drip; for (let x = 0; x < w; x += 22 + R()*18){ t.beginPath(); t.ellipse(x, y0 - A*.2, 7, 10 + R()*14, 0, 0, 7); t.fill(); } }
        t.globalAlpha = 1; break;
      case "sea": { t.fillStyle = c; t.fillRect(0, y0 - A*.4, w, h); t.strokeStyle = c2 || "#fff"; t.globalAlpha = .55; t.lineWidth = 1.5; for (let i = 0; i < 60; i++){ const x = R()*w, y = y0 - A*.3 + R()*A*1.2, l = 6 + R()*16; t.beginPath(); t.moveTo(x, y); t.lineTo(x + l, y); t.stroke(); } t.globalAlpha = 1; break; }
      case "trees": case "blossom": case "maple": case "jungle": { ground();
        const n = Math.ceil(w/(m*.05)); for (let i = 0; i < n; i++){ const x = (i + R()*.6)/n*w, r = A*(.45 + R()*.4), y = y0 + A*.2 - r*.4, cc = L.t === "maple" && R() < .5 ? (c2 || lt) : c;
          t.fillStyle = dk; t.fillRect(x - r*.08, y, r*.16, r*1.2);
          [[0, 0, 1], [-.55, .25, .7], [.55, .25, .7], [0, -.45, .7]].forEach(([dx, dy, k]) => { t.fillStyle = cc; t.beginPath(); t.arc(x + dx*r, y + dy*r, r*k*.7, 0, 7); t.fill(); });
          t.fillStyle = this.mix(cc, "#ffffff", .3); t.beginPath(); t.arc(x - r*.2, y - r*.35, r*.22, 0, 7); t.fill();
          if (c2 && L.t !== "maple") for (let j = 0; j < 5; j++){ t.fillStyle = c2; t.beginPath(); t.arc(x + (R() - .5)*r*1.2, y + (R() - .6)*r, r*.09, 0, 7); t.fill(); } }
        break; }
      case "pines": { ground(.2); const n = Math.ceil(w/(m*.035)); for (let i = 0; i < n; i++){ const x = (i + R()*.7)/n*w, hh = A*(.6 + R()*.6), bw = hh*.36, y = y0 + A*.3;
          t.fillStyle = c; for (let k = 0; k < 3; k++){ const yy = y - hh*k*.3; t.beginPath(); t.moveTo(x, yy - hh*.55); t.lineTo(x + bw*(1 - k*.22), yy); t.lineTo(x - bw*(1 - k*.22), yy); t.closePath(); t.fill();
            if (L.snow){ t.fillStyle = "rgba(255,255,255,.8)"; t.beginPath(); t.moveTo(x, yy - hh*.55); t.lineTo(x + bw*.3, yy - hh*.4); t.lineTo(x - bw*.3, yy - hh*.4); t.closePath(); t.fill(); t.fillStyle = c; } } } break; }
      case "palms": { ground(.15); for (let i = 0; i < 6; i++){ const x = (i + .2 + R()*.6)/6*w, hh = A*(.8 + R()*.5), lean = (R() - .5)*hh*.4, y = y0 + A*.35;
          t.strokeStyle = dk; t.lineWidth = Math.max(3, hh*.06); t.beginPath(); t.moveTo(x, y); t.quadraticCurveTo(x + lean*.2, y - hh*.5, x + lean, y - hh); t.stroke();
          t.fillStyle = c; for (let k = 0; k < 6; k++){ const a = k/6*Math.PI*2 + R()*.3; t.save(); t.translate(x + lean, y - hh); t.rotate(a); t.beginPath(); t.ellipse(hh*.24, hh*.04, hh*.28, hh*.07, .3, 0, 7); t.fill(); t.restore(); } } break; }
      case "shrooms": { ground(.2); for (let i = 0; i < 7; i++){ const x = (i + .2 + R()*.6)/7*w, hh = A*(.5 + R()*.7), y = y0 + A*.3, cw = hh*.6;
          t.fillStyle = c2 || "#fff"; t.fillRect(x - cw*.15, y - hh, cw*.3, hh); t.fillStyle = c; t.beginPath(); t.ellipse(x, y - hh, cw, cw*.6, 0, Math.PI, 0); t.closePath(); t.fill();
          t.fillStyle = "rgba(255,255,255,.75)"; for (let k = 0; k < 4; k++){ t.beginPath(); t.arc(x + (R() - .5)*cw*1.2, y - hh - R()*cw*.4, cw*.1, 0, 7); t.fill(); } } break; }
      case "cactus": { ground(.15); for (let i = 0; i < 6; i++){ const x = (i + R())/6*w, hh = A*(.6 + R()*.6), y = y0 + A*.35, bw = hh*.14; t.fillStyle = c;
          this.rr(t, x - bw/2, y - hh, bw, hh, bw/2); this.rr(t, x - bw*2, y - hh*.65, bw*.8, hh*.35, bw*.4); this.rr(t, x - bw*2, y - hh*.38, bw*1.7, bw*.7, bw*.35); this.rr(t, x + bw*1.2, y - hh*.8, bw*.8, hh*.4, bw*.4); this.rr(t, x + bw*.3, y - hh*.48, bw*1.7, bw*.7, bw*.35); } break; }
      case "pyr": { [[.2, 1], [.34, .7], [.78, .85]].forEach(([px, k]) => { const x = w*px, hh = A*k*1.2, y = y0 + A*.3; t.fillStyle = c; t.beginPath(); t.moveTo(x - hh, y); t.lineTo(x, y - hh); t.lineTo(x + hh, y); t.closePath(); t.fill();
          t.fillStyle = dk; t.beginPath(); t.moveTo(x, y - hh); t.lineTo(x + hh, y); t.lineTo(x + hh*.15, y); t.closePath(); t.fill(); }); break; }
      case "ice": { ground(.2); for (let i = 0; i < 9; i++){ const x = (i + R())/9*w, hh = A*(.4 + R()*.8), bw = hh*(.5 + R()*.4), y = y0 + A*.35;
          t.fillStyle = c; t.beginPath(); t.moveTo(x - bw, y); t.lineTo(x - bw*.4, y - hh*.8); t.lineTo(x + bw*.1, y - hh); t.lineTo(x + bw, y); t.closePath(); t.fill();
          t.fillStyle = "rgba(255,255,255,.55)"; t.beginPath(); t.moveTo(x - bw*.4, y - hh*.8); t.lineTo(x + bw*.1, y - hh); t.lineTo(x - bw*.1, y); t.lineTo(x - bw*.6, y); t.closePath(); t.fill(); } break; }
      case "volc": { const x = w*.84, hh = A, y = y0 + A*.3; t.fillStyle = c; t.beginPath(); t.moveTo(x - hh*2.2, y + A); t.lineTo(x - hh*.35, y - hh); t.lineTo(x + hh*.35, y - hh); t.lineTo(x + hh*2.2, y + A); t.closePath(); t.fill();
          const g = t.createRadialGradient(x, y - hh, 2, x, y - hh, hh*1.2); g.addColorStop(0, L.glow); g.addColorStop(1, L.glow + "00"); t.fillStyle = g; t.fillRect(x - hh*1.5, y - hh*2.2, hh*3, hh*2.4);
          t.strokeStyle = L.glow; t.lineWidth = 3; for (let k = 0; k < 4; k++){ t.beginPath(); t.moveTo(x + (k - 1.5)*hh*.15, y - hh); t.quadraticCurveTo(x + (k - 1.5)*hh*.5, y - hh*.4, x + (k - 1.5)*hh*.9 + (R() - .5)*20, y + A*.3); t.stroke(); }
          t.fillStyle = "rgba(60,40,40,.55)"; for (let k = 0; k < 6; k++) this.cloud(t, x + (R() - .3)*hh*.8, y - hh*(1.4 + k*.25), m*(.03 + k*.012), "#4a3a3a", .5); this.ridge(t, w, h, y0 + A*.7, A*.2, R, 0, dk); break; }
      case "rocks": { ground(.25); for (let i = 0; i < 12; i++){ const x = R()*w, r = A*(.25 + R()*.4), y = y0 + A*.35; t.fillStyle = c; t.beginPath(); t.moveTo(x - r, y); t.lineTo(x - r*.6, y - r*.9); t.lineTo(x + r*.2, y - r*1.2); t.lineTo(x + r, y); t.closePath(); t.fill(); }
          if (L.glow){ t.save(); t.globalCompositeOperation = "lighter"; for (let i = 0; i < 8; i++){ const x = R()*w, y = y0 + A*(.3 + R()*.6), g = t.createRadialGradient(x, y, 1, x, y, A*.6); g.addColorStop(0, L.glow + "aa"); g.addColorStop(1, L.glow + "00"); t.fillStyle = g; t.fillRect(x - A, y - A, A*2, A*2); } t.restore(); } break; }
      case "coral": { ground(.2); for (let i = 0; i < 10; i++){ const x = (i + R())/10*w, hh = A*(.5 + R()*.7), y = y0 + A*.35, cc = i % 2 ? c : (c2 || c); t.strokeStyle = cc; t.lineCap = "round";
          const br = (bx, by, len, an, d) => { if (d > 3 || len < 3) return; const ex = bx + Math.cos(an)*len, ey = by + Math.sin(an)*len; t.lineWidth = Math.max(2, len*.22); t.beginPath(); t.moveTo(bx, by); t.lineTo(ex, ey); t.stroke(); br(ex, ey, len*.7, an - .5, d + 1); br(ex, ey, len*.7, an + .45, d + 1); };
          br(x, y, hh*.4, -Math.PI/2 + (R() - .5)*.4, 0); } break; }
      case "kelp": { for (let i = 0; i < 14; i++){ const x = R()*w, hh = A*(.6 + R()*.8), y = h; t.strokeStyle = c; t.lineWidth = 5 + R()*4; t.lineCap = "round"; t.beginPath(); t.moveTo(x, y);
          for (let k = 1; k <= 8; k++) t.lineTo(x + Math.sin(k*.9 + i)*10, y - hh*k/8 - (h - y0)*.2); t.stroke(); } break; }
      case "crystal": { for (let i = 0; i < 11; i++){ const x = (i + R())/11*w, hh = A*(.4 + R()*.9), bw = hh*.18, y = y0 + A*.4, an = (R() - .5)*.5; t.save(); t.translate(x, y); t.rotate(an);
          const g = t.createLinearGradient(-bw, 0, bw, 0); g.addColorStop(0, c); g.addColorStop(.5, c2 || "#fff"); g.addColorStop(1, c); t.fillStyle = g; t.globalAlpha = .9;
          t.beginPath(); t.moveTo(-bw, 0); t.lineTo(-bw, -hh*.75); t.lineTo(0, -hh); t.lineTo(bw, -hh*.75); t.lineTo(bw, 0); t.closePath(); t.fill(); t.restore();
          t.save(); t.globalCompositeOperation = "lighter"; const gg = t.createRadialGradient(x, y - hh*.6, 1, x, y - hh*.6, hh*.6); gg.addColorStop(0, (c2 || "#ffffff") + "55"); gg.addColorStop(1, "#00000000"); t.fillStyle = gg; t.fillRect(x - hh, y - hh*1.3, hh*2, hh*1.4); t.restore(); } t.globalAlpha = 1; break; }
      case "cloudbank": { for (let i = 0; i < w/(m*.06); i++) this.cloud(t, (i + R()*.5)*m*.06, y0 + (R() - .5)*A*.4, m*(.04 + R()*.03), c, 1); t.fillStyle = c; t.fillRect(0, y0 + A*.15, w, h); break; }
      case "isle": { for (let i = 0; i < 3; i++){ const x = w*(.15 + i*.35 + R()*.1), y = y0 + (R() - .5)*A, s = m*(.05 + R()*.04); t.fillStyle = c; t.beginPath(); t.moveTo(x - s*1.4, y); t.lineTo(x + s*1.4, y); t.lineTo(x, y + s*1.4); t.closePath(); t.fill(); t.fillStyle = "#8ce99a"; t.fillRect(x - s*1.4, y - s*.18, s*2.8, s*.22); this.cloud(t, x, y + s*.2, s*.45, "#fff", .8); } break; }
      case "castleC": case "castle": [.15, .85].forEach(px => { const x = w*px, y = y0 + A*.3, s = A*.75; t.fillStyle = c;
          [[-1.1, .55, .16], [-.6, .8, .22], [0, 1.05, .3], [.6, .8, .22], [1.1, .55, .16]].forEach(([dx, k, bw]) => { const bx = x + dx*s, hh = s*k; t.fillRect(bx - s*bw/2, y - hh, s*bw, hh); t.beginPath(); t.moveTo(bx - s*bw*.7, y - hh); t.lineTo(bx, y - hh - s*bw*1.4); t.lineTo(bx + s*bw*.7, y - hh); t.closePath(); t.fill();
            if (L.win){ t.fillStyle = L.win; for (let k2 = 0; k2 < 3; k2++){ t.fillRect(bx - s*.02, y - hh*(.3 + k2*.22), s*.04, s*.06); } t.fillStyle = c; } });
          t.fillRect(x - s*1.2, y - s*.35, s*2.4, s*.35); if (L.t === "castleC"){ for (let i = 0; i < 6; i++) this.cloud(t, x + (i - 2.5)*s*.5, y, s*.25, "#fff", .95); } }); break;
      case "pagoda": { [[.16, .9], [.84, .7]].forEach(([px, k]) => { const x = w*px, s = A*k, y = y0 + A*.3; t.fillStyle = c; for (let f = 0; f < 4; f++){ const yy = y - f*s*.28, bw = s*(.55 - f*.1); t.fillRect(x - bw*.6, yy - s*.2, bw*1.2, s*.2);
          t.beginPath(); t.moveTo(x - bw, yy - s*.18); t.quadraticCurveTo(x, yy - s*.3, x + bw, yy - s*.18); t.lineTo(x + bw*.7, yy - s*.28); t.lineTo(x - bw*.7, yy - s*.28); t.closePath(); t.fill(); } t.fillRect(x - 1.5, y - s*1.35, 3, s*.25); }); break; }
      case "candy": { ground(.2); for (let i = 0; i < 8; i++){ const x = (i + .2 + R()*.6)/8*w, hh = A*(.6 + R()*.6), y = y0 + A*.35, r = hh*.22; t.fillStyle = "#fff"; t.fillRect(x - 2, y - hh, 4, hh);
          const cc = ["#ff6b9a", "#74c0fc", "#ffd43b", "#b197fc"][i % 4]; t.fillStyle = cc; t.beginPath(); t.arc(x, y - hh, r, 0, 7); t.fill(); t.strokeStyle = "#fff"; t.lineWidth = r*.18; t.beginPath(); t.arc(x, y - hh, r*.55, 0, 5); t.stroke(); } break; }
      case "city": { for (let x = 0; x < w;){ const bw = m*(.035 + R()*.04), hh = A*(.35 + R()*.65), y = y0 + A*.3; t.fillStyle = c; t.fillRect(x, y - hh, bw, hh + h);
          if (R() < .4){ t.beginPath(); t.moveTo(x, y - hh); t.lineTo(x + bw/2, y - hh - bw*.6); t.lineTo(x + bw, y - hh); t.fill(); }
          if (L.win){ t.fillStyle = L.win; for (let yy = y - hh + 6; yy < y - 4; yy += 9) for (let xx = x + 4; xx < x + bw - 4; xx += 8) if (R() < .45) t.fillRect(xx, yy, 3.5, 4.5); } x += bw + 2; }
        if (L.tower){ const x = w*.86, y = y0 + A*.3, s = A*1.3, bw = s*.16; t.fillStyle = dk; t.fillRect(x - bw/2, y - s, bw, s); t.beginPath(); t.moveTo(x - bw*.7, y - s); t.lineTo(x, y - s - bw*1.6); t.lineTo(x + bw*.7, y - s); t.fill();
          t.fillStyle = "#fff3bf"; t.beginPath(); t.arc(x, y - s*.8, bw*.38, 0, 7); t.fill(); t.strokeStyle = dk; t.lineWidth = 2; t.beginPath(); t.moveTo(x, y - s*.8); t.lineTo(x, y - s*.8 - bw*.28); t.moveTo(x, y - s*.8); t.lineTo(x + bw*.2, y - s*.8 + bw*.05); t.stroke(); } break; }
      case "gears": { ground(.2); for (let i = 0; i < 7; i++){ const x = (i + R())/7*w, r = A*(.3 + R()*.4), y = y0 + A*.1; this.gear(t, x, y, r, c); } break; }
      case "station": { ground(.15); const x = w*.84, y = y0, s = A*.8; t.fillStyle = c; t.fillRect(x - s*2, y - s*.12, s*4, s*.24); t.beginPath(); t.arc(x, y, s*.5, 0, 7); t.fill();
          [[-1.4, .3], [1.4, .3], [-.8, .22], [.8, .22]].forEach(([dx, r]) => { t.beginPath(); t.arc(x + dx*s, y, s*r, 0, 7); t.fill(); });
          t.fillStyle = L.win; for (let k = -6; k <= 6; k++) if (k) t.fillRect(x + k*s*.28 - 2, y - 2, 4, 4); t.beginPath(); t.arc(x, y, s*.18, 0, 7); t.fill(); break; }
      case "temple": [.15, .85].forEach(px => { const x = w*px, y = y0 + A*.3, s = A*.8; t.fillStyle = c; t.fillRect(x - s*1.2, y - s*.12, s*2.4, s*.12);
          for (let k = -4; k <= 4; k++) t.fillRect(x + k*s*.26 - s*.05, y - s*.75, s*.1, s*.63);
          t.beginPath(); t.moveTo(x - s*1.3, y - s*.75); t.lineTo(x, y - s*1.1); t.lineTo(x + s*1.3, y - s*.75); t.closePath(); t.fill(); t.fillStyle = L.c2 || c; t.beginPath(); t.arc(x, y - s*.88, s*.1, 0, 7); t.fill(); t.strokeStyle = this.mix(c, "#000000", .3); t.lineWidth = 2; t.strokeRect(x - s*1.2, y - s*.12, s*2.4, s*.12); }); break;
      case "columns": { for (let i = 0; i < 8; i++){ const x = (i + .5)/8*w + (R() - .5)*20, hh = A*(.4 + R()*.7), bw = m*.022, y = y0 + A*.4; t.fillStyle = c; t.fillRect(x - bw/2, y - hh, bw, hh); t.fillRect(x - bw*.8, y - hh - bw*.4, bw*1.6, bw*.4);
          t.fillStyle = "rgba(0,0,0,.1)"; t.fillRect(x + bw*.15, y - hh, bw*.2, hh); } this.ridge(t, w, h, y0 + A*.45, A*.1, R, 0, "#fffdf0"); break; }
      default: ground();
    } },
  rr(t, x, y, w, h, r){ t.beginPath(); t.moveTo(x + r, y); t.arcTo(x + w, y, x + w, y + h, r); t.arcTo(x + w, y + h, x, y + h, r); t.arcTo(x, y + h, x, y, r); t.arcTo(x, y, x + w, y, r); t.closePath(); t.fill(); },
  gear(t, x, y, r, c){ t.fillStyle = c; t.beginPath(); for (let i = 0; i < 20; i++){ const a = i/20*Math.PI*2, rr = i % 2 ? r*.78 : r; t.lineTo(x + Math.cos(a)*rr, y + Math.sin(a)*rr); } t.closePath(); t.fill();
    t.globalCompositeOperation = "destination-out"; t.beginPath(); t.arc(x, y, r*.3, 0, 7); t.fill(); t.globalCompositeOperation = "source-over"; },
  /* ✨ 날리는 꽃잎·눈·불티·거품 (가볍게: 22개) */
  amb(g, P, W, H, fr, ty){
    if (!ty) return; if (P.length < 22) for (let i = P.length; i < 22; i++) P.push({x: Math.random()*W, y: Math.random()*H, s: .6 + Math.random()*.8, p: Math.random()*7});
    for (const q of P){ const k = q.s;
      if (ty === "bubble" || ty === "spore" || ty === "ember"){ q.y -= .5*k*(ty === "ember" ? 1.6 : 1); q.x += Math.sin((fr + q.p*40)*.02)*.4; if (q.y < -10){ q.y = H + 10; q.x = Math.random()*W; } }
      else if (ty === "firefly" || ty === "sparkle" || ty === "star"){ q.x += Math.sin((fr + q.p*50)*.01)*.3; q.y += Math.cos((fr + q.p*30)*.012)*.25; }
      else { q.y += .7*k*(ty === "snow" ? .8 : 1); q.x += Math.sin((fr + q.p*60)*.015)*.8 + (ty === "sand" ? 1.6*k : ty === "leaf" || ty === "petal" ? .35 : 0); if (q.y > H + 10){ q.y = -10; q.x = Math.random()*W; } if (q.x > W + 10) q.x = -10; }
      const tw = .5 + .5*Math.sin(fr*.06 + q.p*9), x = q.x, y = q.y;
      if (ty === "petal" || ty === "leaf"){ g.save(); g.translate(x, y); g.rotate(fr*.03*k + q.p); g.globalAlpha = .75; g.fillStyle = ty === "leaf" ? (q.p > 3.5 ? "#e8590c" : "#ffa94d") : (q.p > 3.5 ? "#ffafcc" : "#ffd6e7"); g.beginPath(); g.ellipse(0, 0, 5*k, 2.6*k, 0, 0, 7); g.fill(); g.restore(); }
      else if (ty === "snow"){ g.globalAlpha = .85; g.fillStyle = "#fff"; g.beginPath(); g.arc(x, y, 2.2*k, 0, 7); g.fill(); }
      else if (ty === "bubble"){ g.globalAlpha = .55; g.strokeStyle = "#e3fafc"; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 4*k, 0, 7); g.stroke(); g.fillStyle = "rgba(255,255,255,.6)"; g.beginPath(); g.arc(x - 1.4*k, y - 1.4*k, 1.2*k, 0, 7); g.fill(); }
      else if (ty === "ember"){ g.globalAlpha = .5 + tw*.5; g.fillStyle = q.p > 3.5 ? "#ffd43b" : "#ff6b1a"; g.beginPath(); g.arc(x, y, 1.8*k, 0, 7); g.fill(); }
      else if (ty === "sand"){ g.globalAlpha = .45; g.fillStyle = "#f5d08a"; g.fillRect(x, y, 2.4*k, 1.4*k); }
      else if (ty === "spore"){ g.globalAlpha = .5 + tw*.3; g.fillStyle = "#f4fce3"; g.beginPath(); g.arc(x, y, 1.8*k, 0, 7); g.fill(); }
      else { g.globalAlpha = tw*.85; g.fillStyle = ty === "firefly" ? "#d8f5a2" : "#fff9db"; g.beginPath(); g.arc(x, y, (ty === "firefly" ? 2.2 : 1.6)*k, 0, 7); g.fill();
        if (tw > .8){ g.strokeStyle = g.fillStyle; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 5*k, y); g.lineTo(x + 5*k, y); g.moveTo(x, y - 5*k); g.lineTo(x, y + 5*k); g.stroke(); } } }
    g.globalAlpha = 1; }
};

/* 🎨 새 곳 소품 (art 10~19) — 섬 위 나무·바위 자리 */
RDA.prop2 = function(t, ti, x, y, s, v){
  const ol = w => this.ol(t, w || Math.max(1.5, s*.035)), lg = (a, b, y1, y2) => BSA.lg(t, 0, y1, 0, y2, [[0, a], [1, b]]);
  const roundTree = (c1, c2, dots) => { t.fillStyle = "#8d5a3b"; t.fillRect(x - s*.06, y, s*.12, s*.38); ol(); [[0, -.18, .3], [-.18, .02, .22], [.18, .02, .22]].forEach(([a, b, r]) => { this.ell(t, x + a*s, y + b*s, r*s, r*s*.92); t.fillStyle = BSA.rg(t, x + a*s - r*s*.3, y + b*s - r*s*.4, 1, r*s*1.2, [[0, c1], [1, c2]]); t.fill(); ol(); });
    if (dots) for (let i = 0; i < 8; i++){ const a = i*2.3 + v, rr = s*.24*((i % 3) + 1)/3; this.ell(t, x + Math.cos(a)*rr, y - s*.08 + Math.sin(a)*rr*.8, s*.04, s*.04); t.fillStyle = dots[i % dots.length]; t.fill(); } };
  if (ti === 10) roundTree("#ffe3ef", "#f783ac", ["#fff", "#ffc9de"]);
  else if (ti === 11) roundTree(v % 2 ? "#ffd8a8" : "#ffc078", v % 2 ? "#e8590c" : "#c92a2a", ["#ffd43b"]);
  else if (ti === 12){ t.fillStyle = "#6b4a2b"; t.fillRect(x - s*.05, y - s*.1, s*.1, s*.46); ol(); [-2, -1, 0, 1, 2].forEach(k => { t.save(); t.translate(x, y - s*.1); t.rotate(k*.55 - Math.PI/2); this.ell(t, s*.24, 0, s*.26, s*.09); t.fillStyle = k % 2 ? "#2f9e44" : "#40c057"; t.fill(); ol(1.4); t.restore(); });
    this.ell(t, x + s*.12, y + s*.2, s*.07, s*.07); t.fillStyle = "#ff6b6b"; t.fill(); ol(1.2); }
  else if (ti === 13){ t.strokeStyle = v % 2 ? "#ff6b9a" : "#ffa94d"; t.lineCap = "round"; const br = (bx, by, len, an, d) => { if (d > 2) return; const ex = bx + Math.cos(an)*len, ey = by + Math.sin(an)*len; t.lineWidth = s*.08*(1 - d*.25); t.beginPath(); t.moveTo(bx, by); t.lineTo(ex, ey); t.stroke(); br(ex, ey, len*.7, an - .55, d + 1); br(ex, ey, len*.7, an + .5, d + 1); };
    br(x, y + s*.34, s*.3, -Math.PI/2, 0); this.ell(t, x - s*.2, y + s*.3, s*.1, s*.06); t.fillStyle = "#fff3bf"; t.fill(); ol(1.2); }
  else if (ti === 14){ [[-.14, .7, "#b197fc"], [.14, .8, "#66d9e8"], [0, 1, "#e599f7"]].forEach(([a, k, c]) => { const bx = x + a*s, hh = s*.62*k, bw = s*.1; t.fillStyle = lg("#ffffff", c, y + s*.36 - hh, y + s*.36); t.beginPath(); t.moveTo(bx - bw, y + s*.36); t.lineTo(bx - bw, y + s*.36 - hh*.75); t.lineTo(bx, y + s*.36 - hh); t.lineTo(bx + bw, y + s*.36 - hh*.75); t.lineTo(bx + bw, y + s*.36); t.closePath(); t.fill(); ol(1.4); });
    t.fillStyle = "#fff"; this.star(t, x + s*.18, y - s*.2, s*.05); t.fill(); }
  else if (ti === 15){ [[0, -.08, .22], [-.18, .08, .17], [.18, .08, .17], [0, .14, .2]].forEach(([a, b, r]) => { this.ell(t, x + a*s, y + b*s, r*s, r*s*.8); t.fillStyle = lg("#ffffff", "#d0e3ff", y + (b - r)*s, y + (b + r)*s); t.fill(); ol(1.3); });
    this.ell(t, x - s*.06, y - s*.12, s*.05, s*.03); t.fillStyle = "#fff"; t.fill(); }
  else if (ti === 16){ ["#ff6b6b", "#ffa94d", "#ffe066", "#69db7c", "#4dabf7", "#9775fa"].forEach((c, i) => { t.strokeStyle = c; t.lineWidth = s*.05; t.beginPath(); t.arc(x, y + s*.32, s*(.34 - i*.045), Math.PI, 0); t.stroke(); });
    [-1, 1].forEach(d => { this.ell(t, x + d*s*.34, y + s*.3, s*.1, s*.07); t.fillStyle = "#fff"; t.fill(); ol(1.2); }); }
  else if (ti === 17){ t.fillStyle = "#495057"; t.fillRect(x - s*.03, y - s*.3, s*.06, s*.66); ol(1.4); this.ell(t, x, y - s*.34, s*.09, s*.09); t.fillStyle = "#ffe066"; t.fill(); ol(1.4);
    t.fillStyle = "rgba(255,224,102,.3)"; this.ell(t, x, y - s*.34, s*.24, s*.24); t.fill(); RDW.gear(t, x + s*.2, y + s*.22, s*.13, "#868e96"); this.ell(t, x + s*.2, y + s*.22, s*.13, s*.13); ol(1.2); }
  else if (ti === 18){ [[0, .82], [.16, .6]].forEach(([a, k]) => { const bx = x + a*s - s*.06, hh = s*.7*k; for (let j = 0; j < 3; j++){ const yy = y + s*.32 - j*hh*.28, bw = s*.24*k*(1 - j*.22); t.beginPath(); t.moveTo(bx, yy - hh*.5); t.lineTo(bx + bw, yy); t.lineTo(bx - bw, yy); t.closePath(); t.fillStyle = "#2f6f5a"; t.fill(); ol(1.2);
      t.beginPath(); t.moveTo(bx, yy - hh*.5); t.lineTo(bx + bw*.35, yy - hh*.32); t.lineTo(bx - bw*.35, yy - hh*.32); t.closePath(); t.fillStyle = "#fff"; t.fill(); } }); }
  else { t.fillStyle = lg("#ffffff", "#e9dcb0", y - s*.3, y + s*.36); t.fillRect(x - s*.08, y - s*.28, s*.16, s*.62); ol(); t.fillRect(x - s*.14, y - s*.34, s*.28, s*.08); ol(); t.fillRect(x - s*.14, y + s*.3, s*.28, s*.07); ol();
    t.strokeStyle = "rgba(160,130,60,.45)"; t.lineWidth = 1.5; [-.03, .03].forEach(a => { t.beginPath(); t.moveTo(x + a*s, y - s*.26); t.lineTo(x + a*s, y + s*.3); t.stroke(); }); t.fillStyle = "#ffd43b"; this.star(t, x, y - s*.45, s*.07); t.fill(); ol(1.2); }
};

/* 🎩 새 곳 몬스터 모자 */
RDA.HATS.push("sakura", "maple", "palm", "shell", "gem", "cloud", "rainbow", "gear", "snow", "halo");
RDA.hat2 = function(t, h, hx, hy, hs, lw){
  const ol = k => this.ol(t, lw*(k || .7));
  if (h === "sakura"){ for (let i = 0; i < 5; i++){ const a = i*Math.PI*2/5; this.ell(t, hx + hs*.4 + Math.cos(a)*hs*.3, hy - hs*.1 + Math.sin(a)*hs*.3, hs*.22, hs*.22); t.fillStyle = "#ffc9de"; t.fill(); } this.ell(t, hx + hs*.4, hy - hs*.1, hs*.13, hs*.13); t.fillStyle = "#f06595"; t.fill(); }
  else if (h === "maple"){ t.save(); t.translate(hx + hs*.3, hy - hs*.2); this.star(t, 0, 0, hs*.55, 5, .5); t.fillStyle = "#e8590c"; t.fill(); ol(); t.restore(); }
  else if (h === "palm"){ [-1, 0, 1].forEach(d => { t.save(); t.translate(hx, hy + hs*.1); t.rotate(d*.7 - Math.PI/2); this.ell(t, hs*.45, 0, hs*.5, hs*.16); t.fillStyle = "#40c057"; t.fill(); ol(.6); t.restore(); }); }
  else if (h === "shell"){ t.beginPath(); t.moveTo(hx - hs*.6, hy + hs*.2); t.quadraticCurveTo(hx, hy - hs*1.1, hx + hs*.6, hy + hs*.2); t.closePath(); t.fillStyle = "#ffc9c9"; t.fill(); ol(); t.strokeStyle = "#ff8787"; t.lineWidth = lw*.5; [-.3, 0, .3].forEach(a => { t.beginPath(); t.moveTo(hx, hy + hs*.15); t.lineTo(hx + a*hs*1.4, hy - hs*.45); t.stroke(); }); }
  else if (h === "gem"){ t.beginPath(); t.moveTo(hx - hs*.4, hy - hs*.2); t.lineTo(hx, hy - hs*.75); t.lineTo(hx + hs*.4, hy - hs*.2); t.lineTo(hx, hy + hs*.25); t.closePath(); t.fillStyle = "#99e9f2"; t.fill(); ol(); t.fillStyle = "rgba(255,255,255,.7)"; t.beginPath(); t.moveTo(hx - hs*.15, hy - hs*.3); t.lineTo(hx, hy - hs*.6); t.lineTo(hx, hy - hs*.2); t.closePath(); t.fill(); }
  else if (h === "cloud"){ [[0, -.2, .35], [-.35, 0, .25], [.35, 0, .25]].forEach(([a, b, r]) => { this.ell(t, hx + a*hs, hy + b*hs, r*hs, r*hs*.85); t.fillStyle = "#fff"; t.fill(); }); ol(.5); }
  else if (h === "rainbow"){ ["#ff6b6b", "#ffd43b", "#69db7c", "#4dabf7"].forEach((c, i) => { t.strokeStyle = c; t.lineWidth = hs*.14; t.beginPath(); t.arc(hx, hy + hs*.2, hs*(.62 - i*.13), Math.PI, 0); t.stroke(); }); }
  else if (h === "gear"){ RDW.gear(t, hx + hs*.2, hy - hs*.15, hs*.42, "#adb5bd"); this.ell(t, hx + hs*.2, hy - hs*.15, hs*.42, hs*.42); ol(.5); }
  else if (h === "snow"){ t.beginPath(); t.moveTo(hx - hs*.6, hy + hs*.25); t.lineTo(hx + hs*.2, hy - hs*.9); t.lineTo(hx + hs*.6, hy + hs*.25); t.closePath(); t.fillStyle = "#e03131"; t.fill(); ol(); t.fillStyle = "#fff"; t.fillRect(hx - hs*.65, hy + hs*.1, hs*1.3, hs*.22); this.ell(t, hx + hs*.2, hy - hs*.9, hs*.16, hs*.16); t.fill(); }
  else if (h === "halo"){ t.strokeStyle = "#ffd43b"; t.lineWidth = hs*.16; this.ell(t, hx, hy - hs*.55, hs*.55, hs*.18); t.stroke(); t.strokeStyle = "rgba(255,255,255,.8)"; t.lineWidth = hs*.05; t.stroke(); }
};
