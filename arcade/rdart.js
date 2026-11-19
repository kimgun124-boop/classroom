/* =====================================================================
   🎨 동물 랜덤 디펜스 그림 (2026.11.16) — 이모지 대신 직접 그린 귀여운 동물 19종
   - 큰 머리·작은 몸 꼬마 캐릭터, 반짝 눈·발그레 볼, 동물마다 귀·코·무늬·뿔이 달라요
   - 등급이 오를수록 더 멋지게: ⚪ 나무 받침 → 🔵 보석 받침·별 → 🟣 보라 망토 → 🟡 금관·빛 → 🌈 무지개 고리·날개
   - 몬스터: 맵마다 모자가 다른 말랑 슬라임 · 😈 중간 보스(뿔) · 👑 보스(왕관·망토)
   - 공격: 동물마다 다른 탄(별·불꽃·얼음·물방울·깃털·무지개·하트)
   ⚡ 모두 한 번 그려 두고(G2.spr) 붙이기만 해요. 저작권 있는 그림은 쓰지 않고 전부 코드로 그렸어요.
   ===================================================================== */
const RDA = {
  OL: "#2b1d3a",
  /* 동물 모양 설명서 */
  S: {
    mouse:   {b: "#c8c3d6", b2: "#a59fb9", f: "#f3eff8", ear: "round", ein: "#ffb3c7", nose: "#ff8fab", wh: 1, tooth: 0},
    rabbit:  {b: "#fbf7ff", b2: "#e3dbef", f: "#ffffff", ear: "long", ein: "#ffb3c7", nose: "#ff8fab", tooth: 1},
    chick:   {b: "#ffe066", b2: "#fcc419", f: "#fff3bf", ear: "tuft", beak: "#ff922b"},
    frog:    {b: "#8ce99a", b2: "#51cf66", f: "#d3f9d8", ear: "frog", smile: "wide"},
    dog:     {b: "#f1c27d", b2: "#d9a05b", f: "#fff4e0", ear: "flop", ein: "#a0663a", nose: "#2b1d3a", snout: "#fff4e0", tongue: 1},
    cat:     {b: "#ffb066", b2: "#f08c3a", f: "#fff0db", ear: "point", ein: "#ffc9c9", nose: "#ff8fab", wh: 1, stripe: "#e8590c", cmouth: 1},
    penguin: {b: "#3d4a6b", b2: "#27304a", f: "#ffffff", ear: "none", beak: "#ff922b", mask: 1},
    hedgehog:{b: "#f3d2a9", b2: "#e0b583", f: "#fff4e6", ear: "spike", spk: "#8d5a3b", nose: "#2b1d3a"},
    fox:     {b: "#ff8c42", b2: "#e8590c", f: "#ffffff", ear: "point", ein: "#2b1d3a", nose: "#2b1d3a", cheek: "#ffffff", wh: 0},
    panda:   {b: "#ffffff", b2: "#e9ecef", f: "#ffffff", ear: "roundDark", nose: "#2b1d3a", patch: 1},
    owl:     {b: "#b08150", b2: "#8b5e34", f: "#f6e3c4", ear: "tufts", beak: "#ffb703", ring: 1},
    croc:    {b: "#6fcf73", b2: "#3f9a47", f: "#d8f5c8", ear: "bump", teeth: 1, nostril: 1},
    lion:    {b: "#ffd166", b2: "#f4a63a", f: "#fff3cf", ear: "round", ein: "#e8a33d", nose: "#7a3e1d", mane: "#d9731f"},
    tiger:   {b: "#ffa94d", b2: "#f76707", f: "#ffffff", ear: "round", ein: "#2b1d3a", nose: "#ff8fab", stripe: "#2b1d3a", snout: "#ffffff", wh: 1},
    whale:   {b: "#5fb4ff", b2: "#3b8fe0", f: "#e7f5ff", ear: "none", spout: 1, smile: "wide", belly: 1},
    eagle:   {b: "#ffffff", b2: "#e3dfe8", f: "#ffffff", ear: "feather", beak: "#ffc300", hook: 1, brow: 1, body: "#8b5a2b"},
    dragon:  {b: "#38d9a9", b2: "#0ca678", f: "#fff3bf", ear: "horn", horn: "#ffe066", wing: "#20c997", nostril: 1, fang: 1},
    unicorn: {b: "#fff6ff", b2: "#eadcf5", f: "#ffffff", ear: "point", ein: "#ffc9e9", horn: "#ffd43b", maneR: 1, nose: "#ffadd2"},
    trex:    {b: "#94d82d", b2: "#5c940d", f: "#e9fac8", ear: "spikeBack", teeth: 1, nostril: 1, arms: 1},
    /* 💠 초월 · 🔥 불멸 · 🌟 태초 (특별한 색과 날개·뿔) */
    phoenix: {b: "#ff7a3d", b2: "#e8590c", f: "#ffe8cc", ear: "feather", beak: "#ffd43b", hook: 1, brow: 1, body: "#c92a2a", wing: "#ffa94d"},
    kirin:   {b: "#ffe8a3", b2: "#f2c14e", f: "#fffbe6", ear: "point", ein: "#ffd6a5", horn: "#ff922b", maneR: 1, nose: "#e8590c", wing: "#fff3bf"},
    levi:    {b: "#3b5bdb", b2: "#1c3faa", f: "#d0ebff", ear: "horn", horn: "#a5f3fc", spout: 1, smile: "wide", belly: 1},
    bdragon: {b: "#4c3f73", b2: "#2a2140", f: "#d0bfff", ear: "horn", horn: "#c4b5fd", wing: "#7048e8", nostril: 1, fang: 1},
    wtiger:  {b: "#f8f9fa", b2: "#dee2e6", f: "#ffffff", ear: "round", ein: "#74c0fc", nose: "#ff8fab", stripe: "#364fc7", snout: "#ffffff", wh: 1, wing: "#a5d8ff"},
    nine:    {b: "#fff0f6", b2: "#f3d9fa", f: "#ffffff", ear: "point", ein: "#f783ac", nose: "#2b1d3a", cheek: "#ffffff", wh: 0, wing: "#fcc2d7"},
    gdragon: {b: "#ffd43b", b2: "#f08c00", f: "#fff9db", ear: "horn", horn: "#ffffff", wing: "#ffe066", nostril: 1, fang: 1},
    pegasus: {b: "#e7f5ff", b2: "#a5d8ff", f: "#ffffff", ear: "point", ein: "#b197fc", horn: "#ffe066", maneR: 1, nose: "#74c0fc", wing: "#ffffff"},
    titan:   {b: "#7950f2", b2: "#4c2fb0", f: "#e5dbff", ear: "spikeBack", teeth: 1, nostril: 1, arms: 1, wing: "#b197fc"},
    /* 🌌 창세 · ♾️ 영원 (2026.11.18) */
    cosmos:  {b: "#4c3fb0", b2: "#211a6b", f: "#d0bfff", ear: "none", spout: 1, smile: "wide", belly: 1, wing: "#9775fa"},
    suzaku:  {b: "#ff5c5c", b2: "#c92a2a", f: "#ffe3e3", ear: "feather", beak: "#ffd43b", hook: 1, brow: 1, body: "#ff922b", wing: "#ff8787"},
    genbu:   {b: "#37b24d", b2: "#1b6e2e", f: "#d3f9d8", ear: "bump", nostril: 1, arms: 1, wing: "#a9e34b"},
    eternal: {b: "#f8f9fa", b2: "#b5bdc6", f: "#ffffff", ear: "horn", horn: "#a3e635", wing: "#d9f99d", nostril: 1, fang: 1},
    yggdra:  {b: "#d8f5a2", b2: "#82c91e", f: "#f4fce3", ear: "point", ein: "#c0eb75", horn: "#a3e635", maneR: 1, nose: "#5c940d", wing: "#e9fac8"},
    /* 🌊☁️ (2026.11.18) 바다·하늘 친구 */
    parrot:  {b: "#40c057", b2: "#2b8a3e", f: "#fff3bf", ear: "tuft", beak: "#ff922b", hook: 1, body: "#ff6b6b", wing: "#4dabf7"},
    shark:   {b: "#8fa1b3", b2: "#5c6f82", f: "#f1f3f5", ear: "none", fin: 1, teeth: 1, belly: 1},
    squid:   {b: "#ff8fab", b2: "#e64980", f: "#ffdeeb", ear: "none", mantle: 1, tent: "#f06595"},
    kraken:  {b: "#9c36b5", b2: "#5f1f73", f: "#f3d9fa", ear: "none", mantle: 1, tent: "#be4bdb", brow: 1, wing: "#da77f2"},
    abyss:   {b: "#4c2fa8", b2: "#1f1360", f: "#d0bfff", ear: "none", mantle: 1, tent: "#7048e8", brow: 1, fang: 1, wing: "#9775fa"},
    kgod:    {b: "#0c8599", b2: "#0b4f5c", f: "#c3fae8", ear: "horn", horn: "#ffd43b", mantle: 1, tent: "#22b8cf", brow: 1, wing: "#99e9f2"},
    seaking: {b: "#1098ad", b2: "#0b7285", f: "#c5f6fa", ear: "horn", horn: "#ffd43b", spout: 1, smile: "wide", belly: 1, wing: "#66d9e8"},
    /* 🆕 (2026.11.19) 높은 등급 친구들 */
    mammoth: {b: "#a47148", b2: "#7f5539", f: "#e6ccb2", ear: "flop", ein: "#7f5539", snout: "#c9a27e", horn: "#fff8e7", nostril: 1},
    griffin: {b: "#ffe8a3", b2: "#d9a441", f: "#fff9e6", ear: "feather", beak: "#ffb703", hook: 1, brow: 1, body: "#b07d3b", wing: "#ffd8a8"},
    rhino:   {b: "#adb5bd", b2: "#6c757d", f: "#e9ecef", ear: "round", ein: "#868e96", horn: "#f8f9fa", nostril: 1, snout: "#ced4da"},
    icewolf: {b: "#e3fafc", b2: "#99e9f2", f: "#ffffff", ear: "point", ein: "#66d9e8", nose: "#1864ab", snout: "#ffffff", wh: 1, fang: 1, wing: "#c5f6fa"},
    thunder: {b: "#5c7cfa", b2: "#364fc7", f: "#dbe4ff", ear: "feather", beak: "#ffd43b", hook: 1, brow: 1, body: "#3b5bdb", wing: "#ffe066"},
    moonrab: {b: "#f3f0ff", b2: "#d0bfff", f: "#ffffff", ear: "long", ein: "#ffd43b", nose: "#f783ac", tooth: 1, wing: "#e5dbff"},
    hydra:   {b: "#2f9e44", b2: "#1b5e20", f: "#d3f9d8", ear: "horn", horn: "#ffd43b", fang: 1, nostril: 1, wing: "#8ce99a"},
    sunbird: {b: "#ffd43b", b2: "#f59f00", f: "#fff9db", ear: "feather", beak: "#ff6b6b", hook: 1, brow: 1, body: "#ff922b", wing: "#ffec99"},
    golem:   {b: "#868e96", b2: "#495057", f: "#dee2e6", ear: "bump", arms: 1, brow: 1, teeth: 1},
    chrono:  {b: "#e599f7", b2: "#9c36b5", f: "#f8f0fc", ear: "horn", horn: "#ffffff", wing: "#fcc2d7", nostril: 1, fang: 1},
    gfox:    {b: "#d0bfff", b2: "#7048e8", f: "#ffffff", ear: "point", ein: "#ffd43b", nose: "#2b1d3a", cheek: "#ffffff", wing: "#b197fc"}
  },
  ell(t, x, y, rx, ry, a = 0){ t.beginPath(); t.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), a, 0, Math.PI*2); },
  ol(t, w){ t.lineJoin = "round"; t.lineCap = "round"; t.lineWidth = w; t.strokeStyle = this.OL; t.stroke(); },
  star(t, x, y, r, n = 5, k = .45){ t.beginPath(); for (let i = 0; i < n*2; i++){ const a = -Math.PI/2 + i*Math.PI/n, rr = i % 2 ? r*k : r; t.lineTo(x + Math.cos(a)*rr, y + Math.sin(a)*rr); } t.closePath(); },
  crown(t, x, y, w, h, c = "#ffd43b", gem = "#ff6b9a"){
    t.beginPath(); t.moveTo(x - w/2, y); t.lineTo(x - w/2, y - h*.55); t.lineTo(x - w/4, y - h*.2); t.lineTo(x, y - h); t.lineTo(x + w/4, y - h*.2); t.lineTo(x + w/2, y - h*.55); t.lineTo(x + w/2, y); t.closePath();
    t.fillStyle = BSA.lg(t, 0, y - h, 0, y, [[0, "#fff6bf"], [.45, c], [1, "#e09b00"]]); t.fill(); this.ol(t, Math.max(1.2, w*.07));
    t.fillStyle = gem; this.ell(t, x, y - h*.32, w*.09, w*.09); t.fill(); t.fillStyle = "#fff"; this.ell(t, x - w*.03, y - h*.36, w*.03, w*.03); t.fill();
  },

  /* ---------- 동물 한 마리 (가운데 m, 크기 s) ---------- */
  animal(t, k, s, g){
    const D = this.S[k] || this.S.mouse, m = s/2, lw = Math.max(1.4, s*.035);
    const hx = m, hy = s*.47, hr = s*.3, by = s*.79;   // 머리 · 몸
    const shade = (x, y, r, c1, c2) => BSA.rg(t, x - r*.35, y - r*.45, r*.1, r*1.15, [[0, "#ffffff"], [.18, c1], [1, c2]]);
    // 🟣 영웅부터 망토 (몸 뒤)
    if (g >= 2){ t.beginPath(); t.moveTo(hx - s*.17, by - s*.16); t.quadraticCurveTo(hx - s*.32, by + s*.05, hx - s*.24, by + s*.15); t.lineTo(hx + s*.24, by + s*.15); t.quadraticCurveTo(hx + s*.32, by + s*.05, hx + s*.17, by - s*.16); t.closePath();
      t.fillStyle = g >= 4 ? BSA.lg(t, hx - s*.3, 0, hx + s*.3, 0, [[0, "#ff8fab"], [.5, "#b197fc"], [1, "#74c0fc"]]) : g === 3 ? "#e03131" : "#7048e8"; t.fill(); this.ol(t, lw); }
    // 🐉 날개 (용·신화)
    if (D.wing || g >= 4){ const wc = D.wing || "#fff"; [-1, 1].forEach(d => { t.beginPath(); t.moveTo(hx + d*s*.14, by - s*.12);
      t.quadraticCurveTo(hx + d*s*.46, by - s*.42, hx + d*s*.47, by - s*.05); t.quadraticCurveTo(hx + d*s*.36, by - s*.08, hx + d*s*.33, by + s*.02); t.quadraticCurveTo(hx + d*s*.26, by - s*.05, hx + d*s*.16, by + s*.02); t.closePath();
      t.fillStyle = D.wing ? wc : "rgba(255,255,255,.95)"; t.fill(); this.ol(t, lw*.9); }); }
    // 몸
    const bc = D.body || D.b;
    this.ell(t, hx, by, s*.2, s*.15); t.fillStyle = shade(hx, by, s*.2, bc, D.body ? "#6b4421" : D.b2); t.fill(); this.ol(t, lw);
    if (!D.mask){ this.ell(t, hx, by + s*.02, s*.12, s*.1); t.fillStyle = D.f; t.fill(); }
    else { this.ell(t, hx, by + s*.01, s*.13, s*.12); t.fillStyle = "#fff"; t.fill(); }
    if (D.arms){ [-1, 1].forEach(d => { this.ell(t, hx + d*s*.15, by - s*.05, s*.04, s*.025, d*.6); t.fillStyle = D.b; t.fill(); this.ol(t, lw*.8); }); }
    // 발
    [-1, 1].forEach(d => { this.ell(t, hx + d*s*.09, by + s*.13, s*.06, s*.035); t.fillStyle = D.beak && !D.mask ? D.beak : D.b2; t.fill(); this.ol(t, lw*.8); });
    // 귀 · 뿔 (머리 뒤)
    const ear = D.ear;
    if (ear === "round" || ear === "roundDark"){ [-1, 1].forEach(d => { const ex = hx + d*hr*.72, ey = hy - hr*.72; this.ell(t, ex, ey, hr*.36, hr*.36); t.fillStyle = ear === "roundDark" ? "#2b2b33" : D.b; t.fill(); this.ol(t, lw);
      if (ear === "round"){ this.ell(t, ex, ey + hr*.04, hr*.2, hr*.2); t.fillStyle = D.ein || D.b2; t.fill(); } }); }
    if (ear === "long"){ [-1, 1].forEach(d => { t.save(); t.translate(hx + d*hr*.4, hy - hr*.75); t.rotate(d*.18); this.ell(t, 0, -hr*.55, hr*.22, hr*.62); t.fillStyle = D.b; t.fill(); this.ol(t, lw); this.ell(t, 0, -hr*.5, hr*.11, hr*.45); t.fillStyle = D.ein; t.fill(); t.restore(); }); }
    if (ear === "point"){ [-1, 1].forEach(d => { t.beginPath(); t.moveTo(hx + d*hr*.2, hy - hr*.85); t.lineTo(hx + d*hr*.82, hy - hr*1.25); t.lineTo(hx + d*hr*.88, hy - hr*.35); t.closePath(); t.fillStyle = D.b; t.fill(); this.ol(t, lw);
      t.beginPath(); t.moveTo(hx + d*hr*.38, hy - hr*.72); t.lineTo(hx + d*hr*.75, hy - hr*1.02); t.lineTo(hx + d*hr*.76, hy - hr*.5); t.closePath(); t.fillStyle = D.ein; t.fill(); }); }
    if (ear === "flop"){ [-1, 1].forEach(d => { t.save(); t.translate(hx + d*hr*.88, hy - hr*.25); t.rotate(d*.35); this.ell(t, 0, hr*.18, hr*.24, hr*.5); t.fillStyle = D.ein; t.fill(); this.ol(t, lw); t.restore(); }); }
    if (ear === "tufts"){ [-1, 1].forEach(d => { t.beginPath(); t.moveTo(hx + d*hr*.35, hy - hr*.9); t.lineTo(hx + d*hr*.85, hy - hr*1.3); t.lineTo(hx + d*hr*.9, hy - hr*.55); t.closePath(); t.fillStyle = D.b2; t.fill(); this.ol(t, lw); }); }
    if (ear === "feather"){ [-1, 0, 1].forEach(d => { t.beginPath(); t.moveTo(hx + d*hr*.3 - hr*.12, hy - hr*.85); t.quadraticCurveTo(hx + d*hr*.55, hy - hr*1.45, hx + d*hr*.3 + hr*.14, hy - hr*.86); t.closePath(); t.fillStyle = "#fff"; t.fill(); this.ol(t, lw*.9); }); }
    if (ear === "horn"){ [-1, 1].forEach(d => { t.beginPath(); t.moveTo(hx + d*hr*.3, hy - hr*.8); t.quadraticCurveTo(hx + d*hr*.62, hy - hr*1.5, hx + d*hr*.95, hy - hr*1.38); t.quadraticCurveTo(hx + d*hr*.7, hy - hr*1.05, hx + d*hr*.72, hy - hr*.62); t.closePath(); t.fillStyle = D.horn; t.fill(); this.ol(t, lw); }); }
    if (ear === "spike" || ear === "spikeBack"){ const n = ear === "spike" ? 11 : 5, R0 = hr*(ear === "spike" ? 1.0 : .92), R1 = hr*(ear === "spike" ? 1.32 : 1.25);
      t.beginPath(); for (let i = 0; i <= n; i++){ const a0 = Math.PI*(ear === "spike" ? 1.05 : 1.15) + i*(Math.PI*(ear === "spike" ? .9 : .7))/n, am = a0 + Math.PI*(ear === "spike" ? .9 : .7)/n/2;
        t.lineTo(hx + Math.cos(a0)*R0, hy + Math.sin(a0)*R0); if (i < n) t.lineTo(hx + Math.cos(am)*R1, hy + Math.sin(am)*R1); }
      t.closePath(); t.fillStyle = D.spk || D.b2; t.fill(); this.ol(t, lw); }
    if (ear === "frog"){ [-1, 1].forEach(d => { this.ell(t, hx + d*hr*.48, hy - hr*.78, hr*.32, hr*.3); t.fillStyle = D.b; t.fill(); this.ol(t, lw); }); }
    if (ear === "bump"){ [-1, 1].forEach(d => { this.ell(t, hx + d*hr*.45, hy - hr*.8, hr*.28, hr*.24); t.fillStyle = D.b; t.fill(); this.ol(t, lw); }); }
    if (D.fin){ t.beginPath(); t.moveTo(hx - hr*.3, hy - hr*.78); t.quadraticCurveTo(hx + hr*.05, hy - hr*1.75, hx + hr*.38, hy - hr*.72); t.closePath(); t.fillStyle = D.b2; t.fill(); this.ol(t, lw); }
    if (D.mantle){ t.beginPath(); t.moveTo(hx - hr*.7, hy - hr*.45); t.quadraticCurveTo(hx, hy - hr*2.1, hx + hr*.7, hy - hr*.45); t.closePath(); t.fillStyle = BSA.lg(t, 0, hy - hr*1.6, 0, hy, [[0, D.b], [1, D.b2]]); t.fill(); this.ol(t, lw);
      t.fillStyle = "rgba(255,255,255,.35)"; [[-.2, -1.1], [.15, -1.35], [.1, -.8]].forEach(([a, b]) => { this.ell(t, hx + a*hr, hy + b*hr, hr*.08, hr*.08); t.fill(); }); }
    if (D.tent){ [-1.5, -.5, .5, 1.5].forEach((o, i) => { t.beginPath(); t.moveTo(hx + o*s*.06 - s*.025, by + s*.04); t.quadraticCurveTo(hx + o*s*.1 + (i % 2 ? s*.05 : -s*.05), by + s*.14, hx + o*s*.09, by + s*.2); t.quadraticCurveTo(hx + o*s*.07 + s*.03, by + s*.12, hx + o*s*.06 + s*.025, by + s*.04); t.closePath(); t.fillStyle = D.tent; t.fill(); this.ol(t, lw*.7); }); }
    if (D.mane){ t.beginPath(); for (let i = 0; i < 16; i++){ const a = i*Math.PI/8, rr = hr*(i % 2 ? 1.18 : 1.36); t.lineTo(hx + Math.cos(a)*rr, hy + Math.sin(a)*rr*.98); } t.closePath(); t.fillStyle = BSA.rg(t, hx, hy, hr*.5, hr*1.4, [[0, "#f59f00"], [1, D.mane]]); t.fill(); this.ol(t, lw); }
    if (D.maneR){ ["#ff8fab", "#ffd43b", "#8ce99a", "#74c0fc", "#b197fc"].forEach((c, i) => { this.ell(t, hx - hr*.85 + i*hr*.1, hy - hr*.55 + i*hr*.28, hr*.3, hr*.2, -.6); t.fillStyle = c; t.fill(); }); }
    // 머리
    this.ell(t, hx, hy, hr, hr*.94); t.fillStyle = shade(hx, hy, hr, D.b, D.b2); t.fill(); this.ol(t, lw);
    if (D.stripe){ t.strokeStyle = D.stripe; t.lineWidth = lw*1.1; t.lineCap = "round"; [[-.15, -.95, -.1, -.65], [0, -.98, 0, -.68], [.15, -.95, .1, -.65], [-.95, -.1, -.68, -.05], [.95, -.1, .68, -.05], [-.92, .15, -.7, .12], [.92, .15, .7, .12]].forEach(([a, b, c, d2]) => { t.beginPath(); t.moveTo(hx + a*hr, hy + b*hr); t.lineTo(hx + c*hr, hy + d2*hr); t.stroke(); }); }
    if (D.mask){ t.beginPath(); t.moveTo(hx, hy - hr*.35); t.bezierCurveTo(hx - hr*.35, hy - hr*.75, hx - hr*.95, hy - hr*.25, hx - hr*.78, hy + hr*.35); t.quadraticCurveTo(hx, hy + hr*1.05, hx + hr*.78, hy + hr*.35); t.bezierCurveTo(hx + hr*.95, hy - hr*.25, hx + hr*.35, hy - hr*.75, hx, hy - hr*.35); t.fillStyle = "#fff"; t.fill(); }
    if (D.cheek){ [-1, 1].forEach(d => { t.beginPath(); t.moveTo(hx + d*hr*.05, hy + hr*.1); t.quadraticCurveTo(hx + d*hr*.9, hy - hr*.05, hx + d*hr*.95, hy + hr*.25); t.quadraticCurveTo(hx + d*hr*.5, hy + hr*.95, hx, hy + hr*.9); t.closePath(); t.fillStyle = D.cheek; t.fill(); }); }
    if (D.belly){ t.save(); this.ell(t, hx, hy, hr, hr*.94); t.clip(); this.ell(t, hx, hy + hr*.75, hr*1.1, hr*.55); t.fillStyle = D.f; t.fill(); t.restore(); }
    if (D.patch){ [-1, 1].forEach(d => { this.ell(t, hx + d*hr*.36, hy + hr*.02, hr*.26, hr*.32, d*-.5); t.fillStyle = "#2b2b33"; t.fill(); }); }
    if (D.ring){ [-1, 1].forEach(d => { this.ell(t, hx + d*hr*.38, hy - hr*.02, hr*.36, hr*.36); t.fillStyle = D.f; t.fill(); t.strokeStyle = D.b2; t.lineWidth = lw; t.stroke(); }); }
    if (D.snout){ this.ell(t, hx, hy + hr*.4, hr*.42, hr*.3); t.fillStyle = D.snout; t.fill(); }
    // 눈 (반짝반짝)
    const ey = hy + hr*(D.ring || D.patch ? .02 : .05), ex = hr*.38, er = hr*(D.ring ? .2 : .17);
    [-1, 1].forEach(d => { const x = hx + d*ex;
      if (ear === "frog"){ this.ell(t, hx + d*hr*.48, hy - hr*.78, hr*.2, hr*.2); t.fillStyle = "#fff"; t.fill(); this.ell(t, hx + d*hr*.5, hy - hr*.76, hr*.12, hr*.13); t.fillStyle = this.OL; t.fill(); t.fillStyle = "#fff"; this.ell(t, hx + d*hr*.46, hy - hr*.82, hr*.05, hr*.05); t.fill(); return; }
      this.ell(t, x, ey, er, er*1.12); t.fillStyle = D.patch ? "#fff" : this.OL; t.fill();
      if (D.patch){ this.ell(t, x, ey, er*.65, er*.75); t.fillStyle = this.OL; t.fill(); }
      t.fillStyle = "#fff"; this.ell(t, x - er*.3, ey - er*.38, er*.38, er*.38); t.fill(); this.ell(t, x + er*.3, ey + er*.35, er*.16, er*.16); t.fill();
      if (D.brow){ t.strokeStyle = this.OL; t.lineWidth = lw*1.3; t.beginPath(); t.moveTo(x - d*er*1.2, ey - er*1.5); t.lineTo(x + d*er*1.2, ey - er*1.05); t.stroke(); } });
    // 볼
    t.fillStyle = "rgba(255,120,150,.45)"; [-1, 1].forEach(d => { this.ell(t, hx + d*hr*.62, hy + hr*.35, hr*.16, hr*.1); t.fill(); });
    // 코 · 입 · 부리
    const ny = hy + hr*.32;
    if (D.beak){ t.beginPath(); t.moveTo(hx - hr*.16, ny - hr*.02); t.lineTo(hx + hr*.16, ny - hr*.02); t.lineTo(hx, ny + hr*(D.hook ? .3 : .22)); t.closePath(); t.fillStyle = D.beak; t.fill(); this.ol(t, lw*.8); }
    else {
      if (D.nose){ this.ell(t, hx, ny, hr*.09, hr*.065); t.fillStyle = D.nose; t.fill(); }
      if (D.nostril){ t.fillStyle = this.OL; [-1, 1].forEach(d => { this.ell(t, hx + d*hr*.12, ny - hr*.02, hr*.035, hr*.03); t.fill(); }); }
      t.strokeStyle = this.OL; t.lineWidth = lw*.9; t.lineCap = "round";
      if (D.smile === "wide" || D.teeth){ t.beginPath(); t.moveTo(hx - hr*.32, ny + hr*.1); t.quadraticCurveTo(hx, ny + hr*.42, hx + hr*.32, ny + hr*.1); t.closePath(); t.fillStyle = "#c92a4a"; t.fill(); t.stroke();
        if (D.teeth){ t.fillStyle = "#fff"; [-.2, 0, .2].forEach(o => { t.beginPath(); t.moveTo(hx + (o - .07)*hr, ny + hr*.12); t.lineTo(hx + (o + .07)*hr, ny + hr*.12); t.lineTo(hx + o*hr, ny + hr*.22); t.closePath(); t.fill(); }); } }
      else { t.beginPath(); t.moveTo(hx - hr*.16, ny + hr*.1); t.quadraticCurveTo(hx - hr*.08, ny + hr*.2, hx, ny + hr*.1); t.quadraticCurveTo(hx + hr*.08, ny + hr*.2, hx + hr*.16, ny + hr*.1); t.stroke(); }
      if (D.tongue){ this.ell(t, hx + hr*.05, ny + hr*.24, hr*.08, hr*.1); t.fillStyle = "#ff8fab"; t.fill(); }
      if (D.tooth){ t.fillStyle = "#fff"; t.fillRect(hx - hr*.07, ny + hr*.1, hr*.14, hr*.13); t.strokeRect(hx - hr*.07, ny + hr*.1, hr*.14, hr*.13); }
      if (D.fang){ t.fillStyle = "#fff"; [-1, 1].forEach(d => { t.beginPath(); t.moveTo(hx + d*hr*.12, ny + hr*.1); t.lineTo(hx + d*hr*.2, ny + hr*.1); t.lineTo(hx + d*hr*.16, ny + hr*.22); t.closePath(); t.fill(); }); }
    }
    if (D.wh){ t.strokeStyle = "rgba(43,29,58,.55)"; t.lineWidth = lw*.6; [-1, 1].forEach(d => [-.06, .08].forEach(o => { t.beginPath(); t.moveTo(hx + d*hr*.42, ny + o*hr); t.lineTo(hx + d*hr*.85, ny + o*hr*2 - hr*.04); t.stroke(); })); }
    if (D.horn && ear !== "horn"){ t.beginPath(); t.moveTo(hx - hr*.13, hy - hr*.86); t.lineTo(hx, hy - hr*1.55); t.lineTo(hx + hr*.13, hy - hr*.86); t.closePath(); t.fillStyle = BSA.lg(t, hx, hy - hr*1.5, hx, hy - hr*.86, [[0, "#fff9db"], [1, D.horn]]); t.fill(); this.ol(t, lw);
      t.strokeStyle = "rgba(201,140,0,.7)"; t.lineWidth = lw*.6; [.35, .6].forEach(f => { t.beginPath(); t.moveTo(hx - hr*.13*(1 - f), hy - hr*(.86 + .69*f) + hr*.05); t.lineTo(hx + hr*.13*(1 - f), hy - hr*(.86 + .69*f) - hr*.04); t.stroke(); }); }
    if (D.spout){ t.fillStyle = "#a5d8ff"; [[0, -1.35, .14], [-.18, -1.18, .1], [.18, -1.18, .1], [0, -1.12, .09]].forEach(([a, b, r]) => { this.ell(t, hx + a*hr, hy + b*hr, r*hr, r*hr); t.fill(); }); t.strokeStyle = "#74c0fc"; t.lineWidth = lw; t.beginPath(); t.moveTo(hx, hy - hr*.92); t.lineTo(hx, hy - hr*1.15); t.stroke(); }
    if (ear === "tuft"){ t.strokeStyle = this.OL; t.lineWidth = lw; t.fillStyle = D.b2; [-.12, 0, .12].forEach(o => { t.beginPath(); t.moveTo(hx + o*hr, hy - hr*.9); t.quadraticCurveTo(hx + o*hr*2.5, hy - hr*1.35, hx + o*hr + hr*.12, hy - hr*1.18); t.stroke(); }); }
    // 🎀 희귀: 목 리본 · 🟡 전설: 왕관 · 🌈 신화: 무지개 왕관
    if (g === 1){ t.fillStyle = "#4dabf7"; [-1, 1].forEach(d => { t.beginPath(); t.moveTo(hx, by - s*.12); t.lineTo(hx + d*s*.09, by - s*.17); t.lineTo(hx + d*s*.09, by - s*.07); t.closePath(); t.fill(); this.ol(t, lw*.7); }); this.ell(t, hx, by - s*.12, s*.03, s*.03); t.fill(); this.ol(t, lw*.7); }
    if (g === 2){ t.fillStyle = "#ffd43b"; this.ell(t, hx, by - s*.1, s*.035, s*.035); t.fill(); this.ol(t, lw*.7); }
    if (g >= 3){ const cy0 = hy - hr*.78; this.crown(t, hx + (D.horn && ear !== "horn" ? hr*.42 : 0), cy0, hr*.75, hr*.55, g >= 4 ? "#ffe066" : "#ffd43b", g >= 4 ? "#b197fc" : "#ff6b9a"); }
  },

  /* ---------- 받침 + 동물 + 빛 (한 장) ---------- */
  unitSpr(k, s){ return G2.spr(`rdu2${k}${s}`, s, s, t => {
      // 동물은 받침 위로 살짝 올려요
      const A = RD_A[k], g = A.g, G = RD_G[g], m = s/2, py = s*.88;
      const AU = g >= 5 ? G.c + "e6" : g === 4 ? "rgba(255,170,235,.9)" : "rgba(255,226,120,.9)";
      if (g >= 3){ t.fillStyle = BSA.rg(t, m, s*.5, s*.05, s*.52, [[0, AU], [1, "rgba(255,255,255,0)"]]); t.fillRect(0, 0, s, s);
        t.save(); t.translate(m, s*.48); t.globalAlpha = g >= 5 ? .7 : .45; t.fillStyle = g >= 5 ? G.c2 : g === 4 ? "#fff0fa" : "#fff6cc"; for (let i = 0; i < 8; i++){ t.rotate(Math.PI/4); t.beginPath(); t.moveTo(0, 0); t.lineTo(s*.05, -s*.5); t.lineTo(-s*.05, -s*.5); t.closePath(); t.fill(); } t.restore(); t.globalAlpha = 1; }
      this.ell(t, m, py + s*.035, s*.38, s*.085); t.fillStyle = "rgba(0,0,0,.28)"; t.fill();
      const top = g === 0 ? ["#f1d5ad", "#b98a55"] : [G.c2, G.c];
      this.ell(t, m, py, s*.36, s*.085); t.fillStyle = BSA.lg(t, 0, py - s*.085, 0, py + s*.085, [[0, top[0]], [1, top[1]]]); t.fill(); this.ol(t, Math.max(1.2, s*.022));
      this.ell(t, m, py - s*.015, s*.27, s*.045); t.fillStyle = "rgba(255,255,255,.45)"; t.fill();
      if (g >= 1){ t.fillStyle = g >= 5 ? G.c : g === 4 ? "#ff6b9a" : "#ffd43b"; const ns = Math.min(g, 5); for (let i = 0; i < ns; i++){ this.star(t, m + (i - (ns - 1)/2)*s*.1, py + s*.005, s*.04); t.fill(); this.ol(t, 1); } }
      if (g >= 5){ t.save(); t.strokeStyle = G.c; t.lineWidth = s*.03; t.shadowColor = G.c; t.shadowBlur = s*.08; for (let k = 0; k < g - 4; k++){ this.ell(t, m, s*.48, s*(.42 + k*.04), s*(.18 + k*.02), -.2 + k*.3); t.stroke(); } t.restore(); }
      if (g >= 4){ t.lineWidth = s*.04; const cg = t.createConicGradient ? t.createConicGradient(0, m, s*.1) : null;
        if (cg){ ["#ff6b6b", "#ffd43b", "#69db7c", "#4dabf7", "#cc5de8", "#ff6b6b"].forEach((c, i) => cg.addColorStop(i/5, c)); t.strokeStyle = cg; } else t.strokeStyle = "#ffd43b";
        this.ell(t, m, s*.1, s*.2, s*.055); t.stroke(); }
      t.save(); t.translate(s*.04, -s*.02); this.animal(t, k, s*.92, g); t.restore();
    }); },

  /* ---------- 몬스터 ---------- */
  HATS: ["flower", "cap", "star", "sun", "horn", "ice", "night", "candy", "ant", "devil"],
  slime(t, s, kind, f, T, ti){
    const m = s/2, sq = f ? .06 : 0, by = s*.62, rw = s*(.42 + sq), rh = s*(.34 - sq), lw = Math.max(2, s*.045);
    this.ell(t, m, s*.93, s*.34, s*.07); t.fillStyle = "rgba(0,0,0,.22)"; t.fill();
    if (kind === 2){ t.beginPath(); t.moveTo(m - rw*.9, by - rh*.2); t.quadraticCurveTo(m - rw*1.25, by + rh*.9, m - rw*.7, by + rh*.75); t.lineTo(m + rw*.7, by + rh*.75); t.quadraticCurveTo(m + rw*1.25, by + rh*.9, m + rw*.9, by - rh*.2); t.closePath(); t.fillStyle = "#c92a2a"; t.fill(); this.ol(t, lw); }
    if (kind === 1){ t.fillStyle = "#fff3bf"; [-1, 1].forEach(d => { t.beginPath(); t.moveTo(m + d*rw*.45, by - rh*.75); t.quadraticCurveTo(m + d*rw*1.05, by - rh*1.2, m + d*rw*.85, by - rh*1.6); t.lineTo(m + d*rw*.15, by - rh*.95); t.closePath(); t.fill(); this.ol(t, lw*.8); }); }
    t.beginPath(); t.ellipse(m, by, rw, rh, 0, Math.PI, 0); t.lineTo(m + rw, by + rh*.55); t.quadraticCurveTo(m + rw*.5, by + rh*.95, m, by + rh*.7); t.quadraticCurveTo(m - rw*.5, by + rh*.95, m - rw, by + rh*.55); t.closePath();
    t.fillStyle = BSA.rg(t, m - rw*.35, by - rh*.5, 2, rw*1.25, [[0, "#ffffff"], [.3, T.sl[0]], [1, T.sl[1]]]); t.fill(); this.ol(t, lw);
    t.fillStyle = "rgba(255,255,255,.6)"; this.ell(t, m - rw*.45, by - rh*.55, rw*.17, rh*.12, -.5); t.fill(); this.ell(t, m - rw*.2, by - rh*.78, rw*.06, rh*.05); t.fill();
    // 눈
    const ey = by - rh*.08, ex = rw*.34, er = s*.085, angry = kind > 0;
    [-1, 1].forEach(d => { this.ell(t, m + d*ex, ey, er*1.2, er*1.35); t.fillStyle = "#fff"; t.fill(); t.lineWidth = lw*.5; t.strokeStyle = this.OL; t.stroke();
      this.ell(t, m + d*ex + er*.15, ey + (f ? er*.25 : er*.05), er*.72, er*.85); t.fillStyle = this.OL; t.fill(); t.fillStyle = "#fff"; this.ell(t, m + d*ex - er*.1, ey - er*.3, er*.28, er*.28); t.fill();
      if (angry){ t.strokeStyle = this.OL; t.lineWidth = lw*.9; t.beginPath(); t.moveTo(m + d*ex*1.6, ey - er*1.5); t.lineTo(m + d*ex*.35, ey - er*1.05); t.stroke(); } });
    t.fillStyle = "rgba(255,110,150,.5)"; [-1, 1].forEach(d => { this.ell(t, m + d*rw*.62, by + rh*.18, rw*.11, rh*.08); t.fill(); });
    t.strokeStyle = this.OL; t.lineWidth = lw*.8; t.beginPath();
    if (angry){ t.moveTo(m - er*.9, ey + er*2); t.lineTo(m - er*.3, ey + er*1.6); t.lineTo(m + er*.3, ey + er*2); t.lineTo(m + er*.9, ey + er*1.6); t.stroke(); }
    else { t.arc(m, ey + er*1.5, er*.7, .2, Math.PI - .2); t.stroke(); }
    // 모자 (맵마다)
    const hx = m, hy = by - rh*.92, hs = s*.2;
    if (kind === 2){ this.crown(t, hx, hy + hs*.15, hs*2.3, hs*1.6, "#ffd43b", "#4dabf7"); return; }
    const h = this.HATS[ti % this.HATS.length];
    if (h === "flower"){ ["#ff8fab", "#ffd43b"].forEach((c, j) => { if (j){ this.ell(t, hx + hs*.5, hy, hs*.22, hs*.22); t.fillStyle = c; t.fill(); return; } for (let i = 0; i < 5; i++){ const a = i*Math.PI*2/5; this.ell(t, hx + hs*.5 + Math.cos(a)*hs*.32, hy + Math.sin(a)*hs*.32, hs*.24, hs*.24); t.fillStyle = c; t.fill(); } }); }
    else if (h === "cap"){ t.beginPath(); t.ellipse(hx, hy + hs*.1, hs*1.1, hs*.75, 0, Math.PI, 0); t.closePath(); t.fillStyle = "#e03131"; t.fill(); this.ol(t, lw*.8); t.fillStyle = "#fff"; [[-.5, -.25], [.35, -.4], [0, -.6]].forEach(([a, b]) => { this.ell(t, hx + a*hs, hy + b*hs, hs*.17, hs*.13); t.fill(); }); }
    else if (h === "star"){ this.star(t, hx + hs*.3, hy - hs*.1, hs*.55); t.fillStyle = "#ff922b"; t.fill(); this.ol(t, lw*.7); }
    else if (h === "sun"){ t.beginPath(); t.ellipse(hx, hy + hs*.05, hs*1.25, hs*.35, 0, 0, Math.PI*2); t.fillStyle = "#f4d58d"; t.fill(); this.ol(t, lw*.7); t.beginPath(); t.ellipse(hx, hy - hs*.05, hs*.6, hs*.55, 0, Math.PI, 0); t.closePath(); t.fill(); this.ol(t, lw*.7); t.fillStyle = "#e8590c"; t.fillRect(hx - hs*.6, hy - hs*.15, hs*1.2, hs*.14); }
    else if (h === "horn"){ [-1, 1].forEach(d => { t.beginPath(); t.moveTo(hx + d*hs*.55, hy + hs*.2); t.lineTo(hx + d*hs*.85, hy - hs*.7); t.lineTo(hx + d*hs*.25, hy + hs*.1); t.closePath(); t.fillStyle = "#ffa94d"; t.fill(); this.ol(t, lw*.7); }); }
    else if (h === "ice"){ t.fillStyle = "#c5f6fa"; [-1, 0, 1].forEach(d => { t.beginPath(); t.moveTo(hx + d*hs*.45 - hs*.18, hy + hs*.2); t.lineTo(hx + d*hs*.45, hy - hs*(d ? .45 : .75)); t.lineTo(hx + d*hs*.45 + hs*.18, hy + hs*.2); t.closePath(); t.fill(); this.ol(t, lw*.6); }); }
    else if (h === "night"){ t.beginPath(); t.moveTo(hx - hs*.9, hy + hs*.25); t.quadraticCurveTo(hx, hy - hs*1.1, hx + hs*1.3, hy - hs*.3); t.quadraticCurveTo(hx + hs*.6, hy - hs*.2, hx + hs*.9, hy + hs*.25); t.closePath(); t.fillStyle = "#5f3dc4"; t.fill(); this.ol(t, lw*.7); this.ell(t, hx + hs*1.3, hy - hs*.3, hs*.2, hs*.2); t.fillStyle = "#fff"; t.fill(); }
    else if (h === "candy"){ this.ell(t, hx, hy - hs*.3, hs*.45, hs*.45); t.fillStyle = "#ff8fab"; t.fill(); this.ol(t, lw*.7); t.strokeStyle = "#fff"; t.lineWidth = lw; t.beginPath(); t.arc(hx, hy - hs*.3, hs*.22, 0, 4.5); t.stroke(); }
    else if (h === "ant"){ [-1, 1].forEach(d => { t.strokeStyle = this.OL; t.lineWidth = lw*.7; t.beginPath(); t.moveTo(hx + d*hs*.3, hy + hs*.2); t.lineTo(hx + d*hs*.6, hy - hs*.6); t.stroke(); this.ell(t, hx + d*hs*.6, hy - hs*.65, hs*.16, hs*.16); t.fillStyle = "#ffe066"; t.fill(); this.ol(t, lw*.5); }); }
    else if (h === "devil"){ [-1, 1].forEach(d => { t.beginPath(); t.moveTo(hx + d*hs*.6, hy + hs*.25); t.quadraticCurveTo(hx + d*hs*1.1, hy - hs*.3, hx + d*hs*.8, hy - hs*.8); t.lineTo(hx + d*hs*.25, hy + hs*.15); t.closePath(); t.fillStyle = "#2b2b33"; t.fill(); this.ol(t, lw*.6); }); }
  },

  /* ---------- 탄 ---------- */
  SHOT: {griffin: "feather", thunder: "star", hydra: "water", sunbird: "fire", chrono: "rainbow", gfox: "rainbow", moonrab: "heart", icewolf: "ice", abyss: "water", kgod: "rainbow", parrot: "feather", shark: "water", squid: "water", kraken: "water", seaking: "water", cosmos: "water", suzaku: "fire", eternal: "rainbow", yggdra: "rainbow", dragon: "fire", lion: "fire", trex: "fire", penguin: "ice", whale: "water", frog: "water", eagle: "feather", owl: "feather", chick: "feather", unicorn: "rainbow", cat: "heart", rabbit: "heart"},
  shotSpr(k, g){ const ty = this.SHOT[k] || "star", c = RD_G[g].c, s = 26 + g*4;
    return G2.spr(`rds${ty}${g}`, s, s, t => { const m = s/2;
      t.fillStyle = BSA.rg(t, m, m, 1, m, [[0, "rgba(255,255,255,.9)"], [.4, ty === "fire" ? "rgba(255,146,43,.55)" : ty === "ice" ? "rgba(153,233,242,.55)" : ty === "water" ? "rgba(116,192,252,.55)" : c + "88"], [1, "rgba(255,255,255,0)"]]); t.fillRect(0, 0, s, s);
      const r = s*.26;
      if (ty === "fire"){ t.beginPath(); t.moveTo(m, m - r*1.4); t.quadraticCurveTo(m + r*1.2, m - r*.2, m + r*.6, m + r*.9); t.quadraticCurveTo(m, m + r*1.2, m - r*.6, m + r*.9); t.quadraticCurveTo(m - r*1.2, m - r*.2, m, m - r*1.4); t.fillStyle = "#ff922b"; t.fill(); this.ell(t, m, m + r*.25, r*.4, r*.55); t.fillStyle = "#ffe066"; t.fill(); }
      else if (ty === "ice"){ t.beginPath(); t.moveTo(m, m - r*1.3); t.lineTo(m + r*.7, m); t.lineTo(m, m + r*1.3); t.lineTo(m - r*.7, m); t.closePath(); t.fillStyle = "#c5f6fa"; t.fill(); t.strokeStyle = "#3bc9db"; t.lineWidth = 2; t.stroke(); }
      else if (ty === "water"){ t.beginPath(); t.moveTo(m, m - r*1.3); t.quadraticCurveTo(m + r*1.1, m + r*.2, m, m + r); t.quadraticCurveTo(m - r*1.1, m + r*.2, m, m - r*1.3); t.fillStyle = "#4dabf7"; t.fill(); t.fillStyle = "#fff"; this.ell(t, m - r*.25, m, r*.18, r*.25); t.fill(); }
      else if (ty === "feather"){ t.save(); t.translate(m, m); t.rotate(-.7); this.ell(t, 0, 0, r*.45, r*1.2); t.fillStyle = "#fff"; t.fill(); t.strokeStyle = "#adb5bd"; t.lineWidth = 1.5; t.stroke(); t.beginPath(); t.moveTo(0, -r*1.1); t.lineTo(0, r*1.2); t.stroke(); t.restore(); }
      else if (ty === "rainbow"){ ["#ff6b6b", "#ffd43b", "#69db7c", "#4dabf7", "#cc5de8"].forEach((cc, i) => { this.star(t, m, m, r*(1.3 - i*.2)); t.fillStyle = cc; t.fill(); }); }
      else if (ty === "heart"){ t.beginPath(); t.moveTo(m, m + r); t.bezierCurveTo(m - r*1.6, m - r*.2, m - r*.6, m - r*1.3, m, m - r*.4); t.bezierCurveTo(m + r*.6, m - r*1.3, m + r*1.6, m - r*.2, m, m + r); t.fillStyle = "#ff6b9a"; t.fill(); }
      else { this.star(t, m, m, r*1.15); t.fillStyle = "#fff"; t.fill(); this.star(t, m, m, r*.8); t.fillStyle = c; t.fill(); }
    }); }
};

/* =====================================================================
   🎁 유물 · 🎒 아이템 · 🎯 단계 미션 (2026.11.16)
   - 👑 보스를 잡으면 유물 3장 중 1장을 골라요 → 판마다 다르게 강해져요 (겹쳐 쌓여요)
   - 😈 중간 보스·미션 성공·🎁 보물상자 몬스터에서 아이템이 나와요 (가방 3칸, 🎒 큰 가방이면 더)
   - 보스가 아닌 단계마다 미션 하나: 성공하면 아이템! 실패해도 괜찮아요
   ===================================================================== */
const RD_REL = {
  atk:   {e: "⚔️", n: "용감한 깃발",   d: "모든 동물 공격 +30%"},
  low:   {e: "🐣", n: "아기 사랑",     d: "⚪일반·🔵희귀 공격 +60%"},
  top:   {e: "🌟", n: "별빛 왕관",     d: "🟡전설·🌈신화 공격 +40%"},
  crit:  {e: "🎯", n: "매의 눈",       d: "모든 동물 치명타 +10%", max: 4},
  spd:   {e: "⚡", n: "번개 발톱",     d: "공격 속도 +15%", max: 4},
  rng:   {e: "🏹", n: "긴 활",         d: "공격 거리 +0.5칸", max: 3},
  boss:  {e: "👑", n: "보스 사냥꾼",   d: "보스·중간 보스에게 피해 +60%"},
  bank:  {e: "🪙", n: "황금 저금통",   d: "단계마다 💰+30, 가진 금 5% 이자"},
  dice:  {e: "🎲", n: "행운 주사위",   d: "대기 줄에 높은 등급이 더 잘 와요", max: 3},
  merge: {e: "🔀", n: "합치기 달인",   d: "합칠 때 15% 확률로 두 등급 껑충!", max: 3},
  slow:  {e: "🐢", n: "끈적끈적 길",   d: "몬스터가 10% 느려져요", max: 3},
  gem:   {e: "💎", n: "보석 광산",     d: "보스 💎+2 · 중간 보스 💎+1"},
  bag:   {e: "🎒", n: "큰 가방",       d: "아이템 칸 +2 · 아이템 2개 바로!", max: 2},
  cheap: {e: "🛠️", n: "대장장이",      d: "강화 비용 -25%", max: 2},
  /* 🆕 빌드 유물: 무엇을 고르느냐에 따라 키울 동물·배치가 달라져요 */
  melee: {e: "🗡️", n: "용사의 검",     d: "⚔️ 근거리 동물 공격 +50%"},
  ranged:{e: "🎯", n: "명사수 화살통", d: "🏹 원거리 동물 공격 +50%"},
  support:{e: "🪄", n: "현자의 지팡이", d: "✨ 지원 동물 공격 +80% · 응원 효과 1.5배"},
  chain: {e: "⛓️", n: "번개 사슬",     d: "공격이 옆 몬스터에게 1번 더 튕겨요", max: 3},
  burn:  {e: "🔥", n: "불씨 주머니",   d: "맞은 몬스터가 3초 동안 불타요", max: 3},
  skill: {e: "🌟", n: "기력의 샘",     d: "스킬 기력이 30% 빨리 차요", max: 3},
  frost: {e: "🧊", n: "서리 발톱",     d: "공격할 때 8% 확률로 몬스터를 얼려요", max: 3},
  lucky: {e: "🍀", n: "행운의 합치기", d: "합칠 때마다 25% 확률로 금 보너스"},
  greed: {e: "🤑", n: "욕심쟁이 지갑", d: "몬스터를 잡으면 금 2배", max: 2},
  glass: {e: "💥", n: "유리 대포",     d: "모든 공격 +70% · 대신 몬스터 한도 -15", max: 2},
  guard: {e: "🛡️", n: "수호 방패",     d: "몬스터 한도 +25 (더 많이 버텨요)", max: 3},
  myth:  {e: "🌈", n: "신화의 숨결",   d: "🌈신화 이상 동물 공격 +60%"},
  sync:  {e: "🤝", n: "찰떡 친구",     d: "같은 동물끼리 붙어 있을 때 힘 2배"},
  /* 🆕 (2026.11.19) 독특한 유물 13종 — 오래 버티고, 깜짝 놀라고, 작전을 바꾸게 해요 */
  phoenix:{e: "🪶", n: "불사조 깃털",   d: "질 뻔하면 한 번 다시 일어나요! 몬스터 절반이 사라져요", max: 2, r: 4},
  star:  {e: "🌠", n: "소원 별",       d: "지금 바로 💎+5 · 대기 줄이 모두 영웅 이상으로!", max: 1, r: 4},
  sand:  {e: "⌛", n: "느긋한 모래시계", d: "보스 잡는 시간 +15초", max: 3, r: 2},
  twin:  {e: "👯", n: "쌍둥이 알",     d: "대기 줄에서 데려올 때 12% 확률로 한 마리 더!", max: 3, r: 3},
  meteor:{e: "☄️", n: "별똥별 부적",   d: "6초마다 별똥별이 가장 튼튼한 몬스터를 쾅!", max: 3, r: 3},
  drum:  {e: "🥁", n: "기합 북",       d: "단계가 시작될 때마다 동물들 기력이 반쯤 차요", max: 2, r: 2},
  snack: {e: "🍱", n: "간식 도시락",   d: "5단계마다 아이템 하나 (두 개면 3단계마다)", max: 2, r: 2},
  alchemy:{e: "⚗️", n: "연금술 솥",    d: "조합할 때 25% 확률로 재료 한 마리를 돌려받아요", max: 2, r: 3},
  slot:  {e: "🎰", n: "행운 룰렛",     d: "단계가 끝날 때마다 룰렛! 금·보석·아이템 (가끔 꽝)", max: 2, r: 2},
  shell: {e: "🐢", n: "거북 등껍질",   d: "몬스터 한도 +10 · 보스가 있을 땐 +30 더", max: 3, r: 2},
  icecrown:{e: "❄️", n: "얼음 왕관",   d: "보스·중간 보스가 20% 느려져요", max: 2, r: 3},
  rainbow:{e: "🪁", n: "무지개 연",    d: "🔄 새 줄 비용 -35%", max: 2, r: 2},
  echo:  {e: "🔔", n: "메아리 종",     d: "스킬을 쓰면 20% 확률로 한 번 더!", max: 2, r: 3}
};
/* 💫 유물 등급: 1 보통 · 2 희귀 · 3 전설 · 4 신비 (높을수록 잘 안 나와요) */
const RD_RR = [null, {n: "보통", c: "#b197fc", a: "#5f3dc4", b: "#2b1d6b", w: 10}, {n: "희귀", c: "#74c0fc", a: "#1c7ed6", b: "#0b2f6b", w: 7}, {n: "전설", c: "#ffd43b", a: "#e67700", b: "#5c2b00", w: 4}, {n: "신비", c: "#f783ac", a: "#ae3ec9", b: "#2b0a4d", w: 1.6}];
"atk top boss chain burn skill frost merge greed bag guard".split(" ").forEach(k => RD_REL[k].r = 2);
"glass myth sync".split(" ").forEach(k => RD_REL[k].r = 3);
Object.values(RD_REL).forEach(R0 => { if (!R0.r) R0.r = 1; });
const RD_IT = {
  bomb:   {e: "💣", n: "폭탄",       d: "모든 몬스터 체력 -30% (보스 -6%)"},
  ice:    {e: "❄️", n: "얼음꽃",     d: "모든 몬스터 5초 꽁꽁 (보스 2초)"},
  clover: {e: "🍀", n: "네잎클로버", d: "대기 줄에 오는 동물 3마리 희귀 이상!"},
  gold:   {e: "💰", n: "금주머니",   d: "금 +(40 + 단계×5)"},
  time:   {e: "⏳", n: "모래시계",   d: "이번 단계 시간 +15초"},
  fever:  {e: "🔥", n: "응원 깃발",  d: "15초 동안 모든 동물 공격 ×2"},
  /* 🆕 (2026.11.19) */
  wall:   {e: "🧱", n: "돌담",       d: "30초 동안 몬스터 한도 +40"},
  honey:  {e: "🍯", n: "꿀단지",     d: "8초 동안 모든 몬스터 아주 느리게"},
  candy:  {e: "🍬", n: "별사탕",     d: "내 동물 모두 기력 가득 → 스킬 와르르!"},
  broom:  {e: "🧹", n: "빗자루",     d: "가장 약한 몬스터 열 마리를 쓱싹! (보스 빼고)"},
  gems:   {e: "💎", n: "보석 주머니", d: "💎 보석 +2"}
};
const RD_RK = Object.keys(RD_REL), RD_IK = Object.keys(RD_IT);
const RD_MS = {
  keep:  {e: "🧹", t: n => `단계가 끝날 때 몬스터 ${n}마리 이하`},
  gold:  {e: "🟡", t: () => "황금 슬라임이 도망가기 전에 잡기"},
  chest: {e: "🎁", t: () => "보물상자 몬스터 잡기"},
  merge: {e: "🔀", t: n => `이번 단계에 합치기 ${n}번`},
  sum:   {e: "📥", t: n => `이번 단계에 동물 ${n}마리 데려오기`},
  kill:  {e: "⚔️", t: n => `이번 단계에 몬스터 ${n}마리 잡기`},
  mk:    {e: "🧪", t: (n, x) => x && RD_A[x] ? `이번 단계에 ${RD_A[x].e} ${RD_A[x].n} 만들기` : "조합하기"}   // 🆕 머리 쓰기: 정해진 동물 조합
};

/* 🎨 맵마다 다른 입체 소품 (네 귀퉁이) */
RDA.prop = function(t, ti, x, y, s, v){
  const ol = (w) => this.ol(t, w || Math.max(1.5, s*.035)), sh = () => { this.ell(t, x, y + s*.38, s*.36, s*.1); t.fillStyle = "rgba(0,0,0,.25)"; t.fill(); };
  sh();
  const tree = (c1, c2, flw) => { t.fillStyle = "#8d5a3b"; t.fillRect(x - s*.06, y, s*.12, s*.38); ol(); [[0, -.18, .3], [-.18, .02, .22], [.18, .02, .22]].forEach(([a, b, r]) => { this.ell(t, x + a*s, y + b*s, r*s, r*s*.92); t.fillStyle = BSA.rg(t, x + a*s - r*s*.3, y + b*s - r*s*.4, 1, r*s*1.2, [[0, c1], [1, c2]]); t.fill(); ol(); });
    if (flw) for (let i = 0; i < 7; i++){ const a = i*2.3 + v, rr = s*.22*((i % 3) + 1)/3; this.ell(t, x + Math.cos(a)*rr, y - s*.08 + Math.sin(a)*rr*.8, s*.035, s*.035); t.fillStyle = flw; t.fill(); } };
  if (ti === 0) tree("#d3f9d8", "#51cf66", v % 2 ? "#ffafcc" : "#fff3bf");
  else if (ti === 1){ t.fillStyle = "#fff4e6"; t.fillRect(x - s*.08, y - s*.05, s*.16, s*.42); ol(); t.beginPath(); t.ellipse(x, y - s*.05, s*.36, s*.28, 0, Math.PI, 0); t.closePath(); t.fillStyle = v % 2 ? "#ff6b6b" : "#ffa94d"; t.fill(); ol(); t.fillStyle = "#fff"; [[-.15, -.15], [.1, -.22], [.2, -.08]].forEach(([a, b]) => { this.ell(t, x + a*s, y + b*s, s*.05, s*.04); t.fill(); }); }
  else if (ti === 2){ t.strokeStyle = "#8d5a3b"; t.lineWidth = s*.09; t.beginPath(); t.moveTo(x, y + s*.36); t.quadraticCurveTo(x + s*.1, y, x - s*.02, y - s*.25); t.stroke(); [0, 1, 2, 3, 4].forEach(i => { const a = -Math.PI*.95 + i*Math.PI*.47; t.save(); t.translate(x - s*.02, y - s*.25); t.rotate(a); this.ell(t, s*.2, 0, s*.22, s*.06); t.fillStyle = "#51cf66"; t.fill(); ol(1.5); t.restore(); }); }
  else if (ti === 3){ const g = BSA.lg(t, x - s*.1, 0, x + s*.1, 0, [[0, "#69db7c"], [1, "#2b8a3e"]]); t.fillStyle = g; rrect(t, x - s*.1, y - s*.3, s*.2, s*.66, s*.1); t.fill(); ol(); [[-1, -.05], [1, .05]].forEach(([d, o]) => { rrect(t, x + d*s*.1 + (d < 0 ? -s*.14 : 0), y + o*s, s*.14, s*.08, s*.04); t.fill(); rrect(t, x + d*s*.2 + (d < 0 ? -s*.05 : -s*.03), y + o*s - s*.14, s*.08, s*.2, s*.04); t.fill(); ol(1.5); }); this.ell(t, x, y - s*.32, s*.05, s*.05); t.fillStyle = "#ff8fab"; t.fill(); }
  else if (ti === 4){ t.beginPath(); t.moveTo(x - s*.36, y + s*.36); t.lineTo(x - s*.12, y - s*.22); t.lineTo(x + s*.12, y - s*.22); t.lineTo(x + s*.36, y + s*.36); t.closePath(); t.fillStyle = BSA.lg(t, 0, y - s*.2, 0, y + s*.36, [[0, "#5c3a3a"], [1, "#2b1d1d"]]); t.fill(); ol(); t.fillStyle = "#ff922b"; t.beginPath(); t.moveTo(x - s*.12, y - s*.22); t.lineTo(x - s*.04, y - s*.02); t.lineTo(x + s*.04, y - s*.12); t.lineTo(x + s*.12, y - s*.22); t.closePath(); t.fill(); this.ell(t, x, y - s*.3, s*.12, s*.08); t.fillStyle = "rgba(255,146,43,.6)"; t.fill(); }
  else if (ti === 5){ [[-.13, .05, .6], [.12, 0, .75], [0, -.05, 1]].forEach(([a, b, k]) => { t.beginPath(); t.moveTo(x + a*s - s*.1*k, y + s*.36); t.lineTo(x + a*s, y + s*.36 - s*.7*k); t.lineTo(x + a*s + s*.1*k, y + s*.36); t.closePath(); t.fillStyle = BSA.lg(t, x + a*s - s*.1, 0, x + a*s + s*.1, 0, [[0, "#e3fafc"], [1, "#66d9e8"]]); t.fill(); ol(1.5); }); }
  else if (ti === 6){ t.fillStyle = "#495057"; t.fillRect(x - s*.03, y - s*.28, s*.06, s*.64); ol(1.5); rrect(t, x - s*.1, y - s*.42, s*.2, s*.18, s*.04); t.fillStyle = "#ffe066"; t.fill(); ol(1.5); t.fillStyle = "rgba(255,224,102,.35)"; this.ell(t, x, y - s*.33, s*.3, s*.25); t.fill(); }
  else if (ti === 7){ t.strokeStyle = "#fff"; t.lineWidth = s*.08; t.beginPath(); t.moveTo(x, y + s*.36); t.lineTo(x, y - s*.05); t.stroke(); this.ell(t, x, y - s*.18, s*.2, s*.2); t.fillStyle = v % 2 ? "#ff8fab" : "#b197fc"; t.fill(); ol(); t.strokeStyle = "#fff"; t.lineWidth = s*.04; t.beginPath(); t.arc(x, y - s*.18, s*.1, 0, 4.6); t.stroke(); }
  else if (ti === 8){ this.ell(t, x, y - s*.05, s*.22, s*.22); t.fillStyle = BSA.rg(t, x - s*.08, y - s*.12, 1, s*.26, [[0, "#ffe8cc"], [1, v % 2 ? "#e8590c" : "#7048e8"]]); t.fill(); ol(); t.strokeStyle = "#ffd8a8"; t.lineWidth = s*.04; this.ell(t, x, y - s*.05, s*.38, s*.08, -.3); t.stroke(); }
  else { t.fillStyle = "#6b5b73"; rrect(t, x - s*.16, y - s*.2, s*.32, s*.56, s*.03); t.fill(); ol(); t.fillStyle = "#6b5b73"; [-.12, 0, .12].forEach(a => { t.fillRect(x + a*s - s*.04, y - s*.3, s*.08, s*.12); }); t.fillStyle = "#ffd43b"; rrect(t, x - s*.05, y - s*.05, s*.1, s*.14, s*.05); t.fill(); }
};
/* 🟡 황금 슬라임 · 🎁 보물상자 몬스터 */
RDA.gold = function(t, s, f){ this.slime(t, s, 0, f, {sl: ["#ffe066", "#e67700"]}, 2); t.fillStyle = "#fff"; [[.25, .3], [.75, .38], [.62, .2]].forEach(([a, b]) => { this.star(t, s*a, s*b, s*.06); t.fill(); }); };
RDA.chest = function(t, s, f){ const m = s/2, y0 = s*.42, w = s*.72, h = s*.42, lw = Math.max(2, s*.04), op = f ? s*.05 : 0;
  this.ell(t, m, s*.93, s*.34, s*.07); t.fillStyle = "rgba(0,0,0,.22)"; t.fill();
  t.fillStyle = BSA.lg(t, 0, y0, 0, y0 + h, [[0, "#c47a3a"], [1, "#7a4419"]]); rrect(t, m - w/2, y0, w, h, s*.06); t.fill(); this.ol(t, lw);
  t.beginPath(); t.moveTo(m - w/2, y0 - op); t.quadraticCurveTo(m, y0 - s*.32 - op, m + w/2, y0 - op); t.closePath(); t.fillStyle = "#d9893f"; t.fill(); this.ol(t, lw);
  t.fillStyle = "#ffd43b"; t.fillRect(m - w/2, y0 - op - s*.02, w, s*.05); t.fillRect(m - s*.06, y0 + s*.02, s*.12, s*.14);
  t.fillStyle = "#2b1d3a"; rrect(t, m - w*.38, y0 + s*.04, w*.76, s*.06 + op, s*.03); t.fill(); t.fillStyle = "#fff"; [-.28, -.14, 0, .14, .28].forEach(a => { t.beginPath(); t.moveTo(m + a*w - s*.03, y0 + s*.04); t.lineTo(m + a*w + s*.03, y0 + s*.04); t.lineTo(m + a*w, y0 + s*.09); t.closePath(); t.fill(); });
  [-1, 1].forEach(d => { this.ell(t, m + d*w*.22, y0 - s*.1 - op, s*.07, s*.08); t.fillStyle = "#fff"; t.fill(); this.ol(t, lw*.5); this.ell(t, m + d*w*.22, y0 - s*.09 - op, s*.04, s*.05); t.fillStyle = "#2b1d3a"; t.fill(); });
  t.fillStyle = "#fff"; this.star(t, m + w*.4, y0 - s*.22, s*.06); t.fill(); };
/* 🏔️ 동물 마을 섬 색 (맵 10곳) — 윗면 · 옆면(흙/돌) · 칸 받침돌 · 풀잎 · 점 무늬 */
const RD_TOP = [
  {top: ["#a9f0b4", "#69db7c"], side: ["#c08a55", "#7a4f2a"], slot: ["#f8fff2", "#d8f5c8", "#7fb36b"], tuft: "rgba(43,138,62,.35)", dot: ["#fff", "#ffd6e7", "#fff3bf"]},
  {top: ["#a3d977", "#5c940d"], side: ["#8d5a3b", "#4e2f1d"], slot: ["#f4fce3", "#d8f5a2", "#6b8f2a"], tuft: "rgba(43,90,20,.4)", dot: ["#ff8787", "#fff"]},
  {top: ["#fff3bf", "#ffe066"], side: ["#e8b86a", "#b5803a"], slot: ["#fffdf3", "#fff0c2", "#d6b56a"], tuft: "rgba(180,140,60,.3)", dot: ["#ffc9c9", "#a5d8ff", "#fff"]},
  {top: ["#ffe1b3", "#ffc078"], side: ["#d9824a", "#9c5326"], slot: ["#fff8ef", "#ffe0bd", "#c98a4b"], tuft: "rgba(150,90,30,.3)", dot: ["#d9480f", "#fff"]},
  {top: ["#7a5555", "#4a3030"], side: ["#3d2020", "#1f0f0f"], slot: ["#9c7b7b", "#6b4b4b", "#2b1515"], tuft: "rgba(255,120,40,.35)", dot: ["#ff922b", "#ffd43b"]},
  {top: ["#f1f8ff", "#cfe8ff"], side: ["#8fb8e0", "#4f7fae"], slot: ["#ffffff", "#e7f5ff", "#8fb0d0"], tuft: "rgba(100,150,200,.35)", dot: ["#fff", "#99e9f2"]},
  {top: ["#5c6fd6", "#34428f"], side: ["#2b2f6b", "#151838"], slot: ["#8a96e6", "#5c6bc8", "#232860"], tuft: "rgba(255,255,255,.18)", dot: ["#ffe066", "#fff"]},
  {top: ["#ffe3ef", "#fcc2d7"], side: ["#c97a4b", "#8a4b26"], slot: ["#fffafc", "#ffe0ec", "#d99ab3"], tuft: "rgba(214,51,108,.25)", dot: ["#74c0fc", "#ffd43b", "#b197fc"]},
  {top: ["#4a4f8f", "#2a2d63"], side: ["#1d1f45", "#0b0c22"], slot: ["#7a80c7", "#4d528f", "#1a1c45"], tuft: "rgba(140,233,154,.25)", dot: ["#fff", "#ffe066", "#b197fc"]},
  {top: ["#5a5563", "#36323d"], side: ["#2b2730", "#141217"], slot: ["#8b8494", "#5e5866", "#25212a"], tuft: "rgba(224,49,49,.25)", dot: ["#ffd43b", "#e03131"]}
];

/* =====================================================================
   ⚔️ 근거리 · 🏹 원거리 · ✨ 지원 + 🌟 스킬 (공격할 때마다 기력이 차서 저절로 써요)
   ===================================================================== */
const RD_ROLE = {m: {e: "⚔️", n: "근거리", c: "#ff8787"}, r: {e: "🏹", n: "원거리", c: "#74c0fc"}, s: {e: "✨", n: "지원", c: "#b197fc"}};
const RD_SK = {
  mouse:   {ro: "m", sk: {e: "🧀", n: "치즈 줍기",   d: "금을 주워 와요",                 mp: 10, ty: "gold"}},
  rabbit:  {ro: "m", sk: {e: "🥕", n: "연속 찌르기", d: "한 몬스터를 3번 콕콕",            mp: 8,  ty: "multi", v: 3}},
  chick:   {ro: "r", sk: {e: "🪶", n: "깃털비",      d: "거리 안 몬스터 모두",            mp: 8,  ty: "all", v: 1}},
  frog:    {ro: "s", sk: {e: "🌧️", n: "끈적 장판",   d: "거리 안 몬스터 아주 느리게",      mp: 7,  ty: "slow", v: .65}},
  dog:     {ro: "m", sk: {e: "🦴", n: "와르르 물기", d: "한 몬스터를 4번 앙앙",            mp: 7,  ty: "multi", v: 4}},
  cat:     {ro: "m", sk: {e: "😼", n: "필살 냥펀치", d: "한 몬스터에 6배",                 mp: 8,  ty: "big", v: 6}},
  penguin: {ro: "r", sk: {e: "❄️", n: "얼음 폭풍",   d: "거리 안 몬스터 꽁꽁",             mp: 9,  ty: "freeze", v: 90}},
  hedgehog:{ro: "m", sk: {e: "💥", n: "가시 폭발",   d: "주변에 3배 펑!",                  mp: 8,  ty: "all", v: 3}},
  fox:     {ro: "r", sk: {e: "🔥", n: "여우불",      d: "몬스터 5마리에 2배",              mp: 8,  ty: "pick", v: 2, n2: 5}},
  panda:   {ro: "m", sk: {e: "🐾", n: "지진 쿵",     d: "주변 기절 + 2배",                 mp: 9,  ty: "stun", v: 2}},
  owl:     {ro: "r", sk: {e: "🎯", n: "저격",        d: "멀리 있는 가장 센 몬스터에 8배",  mp: 8,  ty: "snipe", v: 8}},
  croc:    {ro: "m", sk: {e: "🐊", n: "한입에 꿀꺽", d: "약해진 몬스터를 한 번에!",        mp: 8,  ty: "exec", v: 4}},
  lion:    {ro: "m", sk: {e: "🦁", n: "우렁찬 포효", d: "옆 친구들 공격 +50% (6초)",       mp: 10, ty: "buffA"}},
  tiger:   {ro: "m", sk: {e: "⚡", n: "번개 할퀴기", d: "주변 몬스터 모두 3배",             mp: 8,  ty: "all", v: 3}},
  whale:   {ro: "r", sk: {e: "🌊", n: "해일",        d: "거리 안 몬스터를 뒤로 밀어요",    mp: 10, ty: "push"}},
  eagle:   {ro: "r", sk: {e: "🌪️", n: "회오리",      d: "어디든 몬스터 6마리에 3배",       mp: 9,  ty: "storm", v: 3}},
  dragon:  {ro: "r", sk: {e: "🐉", n: "용의 숨결",   d: "거리 안 몬스터 모두 6배",         mp: 10, ty: "all", v: 6}},
  unicorn: {ro: "s", sk: {e: "🌈", n: "무지개 축복", d: "옆 친구들 공격 속도 2배 (6초)",   mp: 10, ty: "buffS"}},
  trex:    {ro: "m", sk: {e: "🦖", n: "대지 진동",   d: "길 위 몬스터 모두 기절 + 4배",    mp: 12, ty: "quake", v: 4}},
  phoenix: {ro: "r", sk: {e: "🔥", n: "부활의 불꽃", d: "거리 안 몬스터 모두 8배 + 불태우기", mp: 9,  ty: "burn", v: 8}},
  kirin:   {ro: "s", sk: {e: "✨", n: "신수의 가호", d: "주변 친구 공격 ×2 (8초)",            mp: 10, ty: "buffA2"}},
  levi:    {ro: "r", sk: {e: "🌊", n: "대해일",      d: "길 위 몬스터 모두 뒤로 + 4배",        mp: 11, ty: "tsunami", v: 4}},
  bdragon: {ro: "r", sk: {e: "🌑", n: "흑염",        d: "맵 위 몬스터 모두 6배",               mp: 11, ty: "nova", v: 6}},
  wtiger:  {ro: "m", sk: {e: "⚡", n: "백뢰",        d: "번개가 12마리를 튕기며 5배",           mp: 9,  ty: "chain", v: 5, n2: 12}},
  nine:    {ro: "r", sk: {e: "🔮", n: "여우 구슬",   d: "구슬 9개가 앞선 몬스터부터 7배",       mp: 9,  ty: "pick", v: 7, n2: 9}},
  gdragon: {ro: "r", sk: {e: "🌟", n: "천지개벽",    d: "모든 몬스터 10배 + 기절",              mp: 12, ty: "nova", v: 10, stn: 1}},
  pegasus: {ro: "s", sk: {e: "🌈", n: "하늘의 축복", d: "모든 친구 공격 ×2 · 속도 ×2 (6초)",    mp: 12, ty: "bless"}},
  titan:   {ro: "m", sk: {e: "🌍", n: "대지 분쇄",   d: "길 위 몬스터 기절 + 12배",             mp: 12, ty: "quake", v: 12}},
  cosmos:  {ro: "r", sk: {e: "🌌", n: "은하 해일",   d: "길 위 몬스터 모두 뒤로 + 14배",         mp: 11, ty: "tsunami", v: 14}},
  suzaku:  {ro: "r", sk: {e: "🔥", n: "남쪽 불꽃",   d: "거리 안 몬스터 모두 18배 + 불태우기",   mp: 9,  ty: "burn", v: 18}},
  genbu:   {ro: "m", sk: {e: "🐢", n: "북쪽 방패",   d: "길 위 몬스터 기절 + 16배",             mp: 11, ty: "quake", v: 16}},
  eternal: {ro: "r", sk: {e: "🌠", n: "영원의 별비", d: "모든 몬스터 30배 + 기절",              mp: 12, ty: "nova", v: 30, stn: 1}},
  yggdra:  {ro: "s", sk: {e: "🌳", n: "세계수 축복", d: "모든 친구 공격 ×2 · 속도 ×2 (6초)",    mp: 10, ty: "bless"}},
  parrot:  {ro: "r", sk: {e: "🗣️", n: "따라쟁이",    d: "거리 안 몬스터 모두 2배",              mp: 8,  ty: "all", v: 2}},
  shark:   {ro: "m", sk: {e: "🦈", n: "상어 이빨",   d: "약해진 몬스터를 한입에! (아니면 6배)",  mp: 8,  ty: "exec", v: 6}},
  squid:   {ro: "r", sk: {e: "🦑", n: "먹물 폭풍",   d: "거리 안 몬스터 꽁꽁 (2초)",             mp: 10, ty: "freeze", v: 120}},
  kraken:  {ro: "m", sk: {e: "🐙", n: "휘감기",      d: "길 위 몬스터 기절 + 12배",              mp: 12, ty: "quake", v: 12}},
  seaking: {ro: "r", sk: {e: "🔱", n: "용왕의 심판", d: "모든 몬스터 뒤로 + 26배",               mp: 12, ty: "tsunami", v: 26}},
  abyss:   {ro: "m", sk: {e: "🐙", n: "심연 휘감기", d: "길 위 몬스터 모두 기절 + 18배",          mp: 11, ty: "quake", v: 18}},
  kgod:    {ro: "r", sk: {e: "🌀", n: "심해 소용돌이", d: "모든 몬스터 32배 + 기절",              mp: 12, ty: "nova", v: 32, stn: 1}},
  mammoth: {ro: "m", sk: {e: "🦣", n: "매머드 돌진", d: "길 위 몬스터 기절 + 5배",               mp: 12, ty: "quake", v: 5}},
  griffin: {ro: "r", sk: {e: "🌪️", n: "하늘 회오리", d: "어디든 몬스터 여러 마리에 5배",         mp: 9,  ty: "storm", v: 5}},
  rhino:   {ro: "m", sk: {e: "🦏", n: "강철 뿔",     d: "한 몬스터에 12배",                      mp: 8,  ty: "big", v: 12}},
  icewolf: {ro: "m", sk: {e: "❄️", n: "서리 울음",   d: "거리 안 몬스터 꽁꽁 (2초)",             mp: 9,  ty: "freeze", v: 130}},
  thunder: {ro: "r", sk: {e: "⚡", n: "천둥 번개",   d: "번개가 14마리를 튕기며 7배",            mp: 9,  ty: "chain", v: 7, n2: 14}},
  moonrab: {ro: "s", sk: {e: "🌕", n: "달빛 축복",   d: "모든 친구 공격 ×2 · 속도 ×2 (6초)",     mp: 11, ty: "bless"}},
  hydra:   {ro: "r", sk: {e: "🐍", n: "다섯 머리",   d: "앞선 몬스터 12마리에 10배",             mp: 9,  ty: "pick", v: 10, n2: 12}},
  sunbird: {ro: "r", sk: {e: "🌞", n: "태양 불꽃",   d: "거리 안 몬스터 모두 22배 + 불태우기",   mp: 9,  ty: "burn", v: 22}},
  golem:   {ro: "m", sk: {e: "🗿", n: "대지 거인",   d: "길 위 몬스터 기절 + 20배",              mp: 11, ty: "quake", v: 20}},
  chrono:  {ro: "r", sk: {e: "⏳", n: "시간 멈춤",   d: "모든 몬스터 36배 + 기절",               mp: 12, ty: "nova", v: 36, stn: 1}},
  gfox:    {ro: "r", sk: {e: "💫", n: "은하 구슬",   d: "앞선 몬스터 18마리에 30배",             mp: 9,  ty: "pick", v: 30, n2: 18}}
};
/* 근거리는 길 바로 옆에서만 닿는 대신 더 세게 · 원거리는 멀리서 */
Object.entries(RD_SK).forEach(([k, v]) => { const A = RD_A[k]; if (!A) return; A.ro = v.ro; A.sk = v.sk;
  if (v.ro === "m"){ A.r = k === "trex" || k === "titan" || k === "genbu" || k === "kraken" || k === "abyss" || k === "mammoth" || k === "golem" ? 1.7 : 1.5; A.d = Math.round(A.d*1.5); }
  else if (v.ro === "r") A.r = Math.max(2.6, A.r + .4);
  else A.r = Math.max(2.3, A.r); });

/* =====================================================================
   🧪 조합 (2026.11.17) — 영웅부터는 '같은 동물 3마리'가 아니라 정해진 재료로 만들어요
   · ⚪ 일반 → 🔵 희귀 → 🟣 영웅까지는 같은 동물 3마리 합치기(랜덤)로 올라가요
   · 🟣 영웅은 조합으로 '골라서' 만들 수도 있어요 · 🟡 전설부터는 조합으로만!
   · 재료: [동물, 마리 수] — 내 마당에 있는 동물을 써요 (겹쳐 있는 칸에서 한 마리씩 빠져요)
   ===================================================================== */
const RD_MG = 2;   // 같은 동물 3마리 합치기는 이 등급 아래(일반·희귀)까지만
const RD_RC = {
  fox:     [["mouse", 1], ["chick", 1], ["cat", 1]],
  panda:   [["rabbit", 1], ["dog", 1], ["hedgehog", 1]],
  owl:     [["chick", 2], ["penguin", 1], ["frog", 1]],
  croc:    [["frog", 1], ["mouse", 1], ["hedgehog", 1]],
  lion:    [["cat", 2], ["panda", 1], ["dog", 2]],
  tiger:   [["cat", 1], ["fox", 1], ["croc", 1], ["rabbit", 2]],
  whale:   [["penguin", 2], ["croc", 1], ["frog", 2]],
  eagle:   [["owl", 1], ["fox", 1], ["chick", 3]],
  dragon:  [["eagle", 1], ["croc", 2], ["fox", 2]],
  unicorn: [["whale", 1], ["owl", 2], ["frog", 3]],
  trex:    [["lion", 1], ["tiger", 1], ["panda", 2]],
  phoenix: [["dragon", 1], ["eagle", 2], ["owl", 3]],
  kirin:   [["unicorn", 1], ["lion", 2], ["panda", 3]],
  levi:    [["whale", 2], ["dragon", 1], ["penguin", 3]],
  bdragon: [["dragon", 2], ["phoenix", 1], ["levi", 1]],
  wtiger:  [["tiger", 2], ["trex", 1], ["kirin", 1]],
  nine:    [["fox", 3], ["unicorn", 1], ["phoenix", 1]],
  gdragon: [["bdragon", 1], ["dragon", 2], ["phoenix", 2]],
  pegasus: [["kirin", 1], ["unicorn", 2], ["nine", 1]],
  titan:   [["trex", 2], ["wtiger", 1], ["levi", 1]],
  /* 🌌 창세 (태초 1마리 + 아래 등급 재료) · ♾️ 영원 (창세 + 태초) */
  cosmos:  [["gdragon", 1], ["levi", 2], ["whale", 2]],
  suzaku:  [["gdragon", 1], ["phoenix", 2], ["nine", 1]],
  genbu:   [["titan", 1], ["pegasus", 1], ["trex", 2]],
  eternal: [["cosmos", 1], ["suzaku", 1], ["gdragon", 2]],
  yggdra:  [["genbu", 1], ["pegasus", 2], ["kirin", 2]],
  /* 🌊 (2026.11.18) 바다 친구 */
  shark:   [["croc", 1], ["whale", 1], ["penguin", 2]],
  squid:   [["levi", 1], ["shark", 1], ["whale", 2]],
  kraken:  [["squid", 1], ["levi", 1], ["shark", 2]],
  seaking: [["cosmos", 1], ["kraken", 1], ["squid", 2]],
  abyss:   [["kraken", 2], ["levi", 1], ["squid", 1]],   // 🐙 창세: 크라켄 2마리
  kgod:    [["abyss", 1], ["cosmos", 1], ["kraken", 2]],   // 🌀 영원: 심연 크라켄 + 은하 고래 + 크라켄 2마리
  /* 🆕 (2026.11.19) 높은 등급 친구들 */
  mammoth: [["lion", 1], ["panda", 2], ["hedgehog", 2]],
  griffin: [["eagle", 2], ["lion", 1], ["dragon", 1]],
  rhino:   [["trex", 1], ["mammoth", 1], ["croc", 2]],
  icewolf: [["levi", 1], ["mammoth", 1], ["penguin", 3]],
  thunder: [["griffin", 1], ["eagle", 2], ["phoenix", 1]],
  moonrab: [["nine", 1], ["kirin", 1], ["rabbit", 3]],
  hydra:   [["squid", 1], ["bdragon", 1], ["croc", 3]],
  sunbird: [["gdragon", 1], ["thunder", 1], ["phoenix", 2]],
  golem:   [["titan", 1], ["rhino", 2], ["mammoth", 2]],
  chrono:  [["sunbird", 1], ["moonrab", 2], ["gdragon", 1]],
  gfox:    [["suzaku", 1], ["nine", 2], ["moonrab", 1]]
};
const RD_RCK = Object.keys(RD_RC);
/* ⚔️ 딜러 · 🛡️ 서포터 — 👑 보스는 단단해서(20단계부터 받는 피해 -50%) 🛡️ 서포터가 먼저 때려 '💥 약점'을 드러내야 딜러가 세게(+40%) 때려요 */
const RD_JOB = {d: {e: "🗡️", n: "딜러", c: "#ff8787", t: "몬스터를 세게 때려 쓰러뜨려요"}, s: {e: "🛡️", n: "서포터", c: "#63e6be", t: "느리게·멈추게·응원 + 👑 보스 약점 드러내기"}};
["mouse", "frog", "penguin", "panda", "whale", "lion", "unicorn", "kirin", "levi", "pegasus", "genbu", "yggdra", "squid", "icewolf", "moonrab", "mammoth"].forEach(k => { if (RD_A[k]) RD_A[k].job = "s"; });
RD_K.forEach(k => { if (!RD_A[k].job) RD_A[k].job = "d"; });
/* 이 동물이 재료로 쓰이는 조합들 */
const RD_USE = {}; RD_RCK.forEach(t => RD_RC[t].forEach(([k]) => (RD_USE[k] = RD_USE[k] || []).push(t)));

/* 🏡 동물 마을 (지켜야 하는 곳) */
RDA.house = function(t, x, y, s, ti){
  const roof = ["#ff6b6b", "#e8590c", "#4dabf7", "#d9480f", "#495057", "#74c0fc", "#5f3dc4", "#f783ac", "#7048e8", "#862e9c"][ti % 10], lw = Math.max(1.5, s*.03);
  this.ell(t, x, y + s*.38, s*.42, s*.1); t.fillStyle = "rgba(0,0,0,.25)"; t.fill();
  t.fillStyle = "#fff4e6"; rrect(t, x - s*.3, y - s*.08, s*.6, s*.44, s*.04); t.fill(); this.ol(t, lw);
  t.beginPath(); t.moveTo(x - s*.4, y - s*.04); t.lineTo(x, y - s*.4); t.lineTo(x + s*.4, y - s*.04); t.closePath(); t.fillStyle = roof; t.fill(); this.ol(t, lw);
  t.fillStyle = "#a0663a"; rrect(t, x - s*.08, y + s*.1, s*.16, s*.26, s*.06); t.fill(); this.ol(t, lw*.8);
  t.fillStyle = "#a5d8ff"; [-1, 1].forEach(d => { rrect(t, x + d*s*.19 - s*.06, y + s*.02, s*.12, s*.1, s*.02); t.fill(); this.ol(t, lw*.6); });
  t.strokeStyle = "#5c3a1e"; t.lineWidth = lw; t.beginPath(); t.moveTo(x + s*.22, y - s*.22); t.lineTo(x + s*.22, y - s*.52); t.stroke();
  t.fillStyle = "#ffd43b"; t.beginPath(); t.moveTo(x + s*.22, y - s*.52); t.lineTo(x + s*.4, y - s*.46); t.lineTo(x + s*.22, y - s*.4); t.closePath(); t.fill(); this.ol(t, lw*.6);
  t.fillStyle = "#ff8fab"; this.ell(t, x - s*.3, y + s*.33, s*.06, s*.05); t.fill(); this.ell(t, x + s*.32, y + s*.34, s*.05, s*.04); t.fill();
};
/* 👾 몬스터 문 (길이 시작되는 곳) */
RDA.portal = function(t, x, y, s){ for (let i = 0; i < 4; i++){ this.ell(t, x, y, s*(.42 - i*.09), s*(.42 - i*.09)); t.fillStyle = ["#2b1d3a", "#5f3dc4", "#9775fa", "#e5dbff"][i]; t.fill(); }
  t.strokeStyle = "#e5dbff"; t.lineWidth = Math.max(1.5, s*.03); for (let i = 0; i < 3; i++){ t.beginPath(); t.arc(x, y, s*(.15 + i*.08), i*2, i*2 + 2.4); t.stroke(); } };

/* =====================================================================
   🗺️ 4×4 마당 맵 (2026.11.17) — 친구마다 16칸(4×4) 자기 마당
   · 길이 마당을 세 면으로 감싸요(혼자 '꽉 찬 고리'는 네 면) → 길 옆 = ⚔️ 앞줄, 안쪽 = 🏹 뒷줄
   · 같이 하면 🌀 문이 사람 수만큼! 문마다 그 친구 마당 바로 앞에서 몬스터가 나와요 → 모두 함께 때려요
   · 모양은 10단계마다 바뀌어요: 0 뱀길 · 1 거울 뱀길 · 2 거꾸로 도는 길 · 3 (혼자) 꽉 찬 고리
   · 사람 수마다 모두 공평하게(앞줄 10칸씩) 되는 배치를 미리 찾아 두었어요
   ===================================================================== */
const RD_GSPEC = {   // K: 위 줄 마당 수 · top: 위 줄 길 높이 · bot: 아래 줄 길 높이 · bb: 아래 줄 마당 자리 (L 가로 화면 · P 세로 화면)
  L: {1: {K: 1, top: [0]}, 2: {K: 1, top: [0], bot: [12], bb: [1]}, 3: {K: 3, top: [0, 5, 0]}, 4: {K: 4, top: [0, 5, 0, 5]}, 5: {K: 5, top: [0, 5, 0, 5, 0]}, 6: {K: 3, top: [0, 5, 0], bot: [12, 7, 12], bb: [1, 1, 1]}},
  P: {1: {K: 1, top: [0]}, 2: {K: 1, top: [0], bot: [12], bb: [1]}, 3: {K: 3, top: [0, 5, 0]}, 4: {K: 3, top: [0, 5, 0], bot: [12, 7, 12], bb: [1, 0, 0]}, 5: {K: 3, top: [0, 5, 0], bot: [12, 7, 12], bb: [1, 1, 0]}, 6: {K: 3, top: [0, 5, 0], bot: [12, 7, 12], bb: [1, 1, 1]}}};
/* =====================================================================
   🤝 같이 하기 맵 (2026.11.18) — "한 문에서 나와도 모두가 때리는 길"
   · 친구 마당(4×4)을 바둑판처럼 놓고, 마당 사이사이 골목이 모두 길이에요 → 마당마다 네 면이 다 길(앞줄 12칸 · 뒷줄 4칸)
   · 몬스터는 한 문에서 나와 ① 세로 골목을 지그재그로 모두 지나고 ② 가로 골목을 지그재그로 모두 지나요
     → 가운데 골목은 양쪽 두 친구가 함께 때리고, 골목이 만나는 네거리는 네 친구가 모두 닿는 '명당'
   · 한 바퀴에 모든 친구 마당을 두 번씩 지나요 → 누구도 할 일이 없지 않아요
   · 10단계마다 시작 모서리·방향이 바뀌어요 (뒤집기·거울)
   ===================================================================== */
function rdGenCoop(N, v, land){
  /* 가로 화면 모양으로 만들고, 세로 화면은 그대로 '눕혀요'(x↔y) — 방장·친구 기기의 화면 방향이 달라도 길 순서·칸 번호·앞줄/뒷줄이 똑같아요 */
  const G = {2: [1, 2], 3: [1, 3], 4: [2, 2], 5: [2, 3], 6: [2, 3]}[N];
  const R = G[0], K = G[1], mg = R === 1 ? 1 : 0, w = 5*K + 1 + 2*mg, h = 5*R + 1 + 2*mg;
  const pts = [], add = (x, y) => { const l = pts[pts.length - 1]; if (!l || l[0] !== x || l[1] !== y) pts.push([x, y]); };
  const line = (x0, y0, x1, y1) => { const sx = Math.sign(x1 - x0), sy = Math.sign(y1 - y0); let x = x0, y = y0; add(x, y); while (x !== x1 || y !== y1){ x += sx; y += sy; add(x, y); } };
  /* ① 세로 골목 지그재그 */
  let x = 0, y = 0; add(0, 0);
  for (let c = 0; c <= K; c++){ const ty = c % 2 ? 0 : 5*R; line(x, y, 5*c, y); x = 5*c; line(x, y, x, ty); y = ty; }
  /* ② 가로 골목 지그재그 (끝난 쪽에서) */
  const rows = []; for (let r = 0; r <= R; r++) rows.push(5*r); if (y !== 0) rows.reverse();
  rows.forEach((ry, i) => { line(x, y, x, ry); y = ry; const tx = x === 0 ? 5*K : 0; line(x, y, tx, y); x = tx; });
  /* 처음 자리(0,0)로 돌아와 고리를 닫아요 */
  if (x !== 0) line(x, y, 0, y); if (y !== 0) line(0, y, 0, 1);
  if (pts.length > 1){ const l = pts[pts.length - 1]; if (l[0] === 0 && l[1] === 0) pts.pop(); }
  /* 모양 바꾸기: 0 그대로 · 1 거꾸로 · 2 좌우 거울 · 3 상하 거울+거꾸로 */
  v = v % 4; const W0 = 5*K + 1, H0 = 5*R + 1;
  const T = ([px, py]) => { if (v === 2) px = W0 - 1 - px; if (v === 3) py = H0 - 1 - py; return [px + mg, py + mg]; };
  let path = pts.map(T); if (v === 1 || v === 3) path.reverse();
  const key = (a, b) => a + "," + b, P = new Set(path.map(([a, b]) => key(a, b)));
  const blocks = []; for (let r = 0; r < R; r++) for (let c = 0; c < K; c++) blocks.push([1 + 5*c + mg, 1 + 5*r + mg]);
  const isF = ([a, b]) => { for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (P.has(key(a + dx, b + dy))) return true; return false; };
  let zones = blocks.map(([bx, by]) => { const slots = []; for (let yy = 0; yy < 4; yy++) for (let xx = 0; xx < 4; xx++) slots.push([bx + xx, by + yy]);
    return {slots, box: [bx, by, bx + 4, by + 4], front: slots.map(isF)}; });
  /* 사람 수보다 칸이 많으면(5명) 가장자리 빈 마당 하나는 🏡 마을 공원으로 */
  let spare = [];
  if (zones.length > N){ const cxm = w/2, cym = h/2; const ord = zones.map((Z, i) => [i, Math.hypot(Z.box[0] + 2 - cxm, Z.box[1] + 2 - cym)]).sort((a, b) => b[1] - a[1]);
    const drop = new Set(ord.slice(0, zones.length - N).map(q => q[0])); spare = zones.filter((_, i) => drop.has(i)); zones = zones.filter((_, i) => !drop.has(i)); }
  zones.sort((a, b) => a.box[1] - b.box[1] || a.box[0] - b.box[0]);
  zones.forEach(Z => { Z.door = 0; });
  const used = new Set([...P, ...zones.flatMap(Z => Z.slots.map(([a, b]) => key(a, b)))]);
  let house = null;
  if (spare.length){ const b = spare[0].box; house = [b[0] + 1, b[1] + 2]; }
  else { let bd = 1e9; for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) if (!used.has(key(xx, yy))){ const d = (xx - w/2 + .5)**2 + (yy - h/2 + .5)**2; if (d < bd){ bd = d; house = [xx, yy]; } } }
  const D = []; for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) if (!used.has(key(xx, yy)) && !(house && house[0] === xx && house[1] === yy)) D.push([xx, yy]);
  /* 🌀 문은 한가운데 네거리(가장 많은 친구 마당이 닿는 곳)에 — 나오자마자 모두가 함께 때려요 */
  const near = ([a, b]) => zones.reduce((n, Z) => n + (Z.slots.some(([sx, sy]) => Math.abs(sx - a) <= 1 && Math.abs(sy - b) <= 1) ? 1 : 0), 0);
  let door = 0, best = -1; path.forEach((q, i) => { const sc = near(q)*100 - Math.hypot(q[0] - w/2 + .5, q[1] - h/2 + .5); if (sc > best){ best = sc; door = i; } });
  if (!land){ const t = ([a, b]) => [b, a]; path = path.map(t); zones.forEach(Z => { Z.slots = Z.slots.map(t); Z.box = [Z.box[1], Z.box[0], Z.box[3], Z.box[2]]; });
    const D2 = D.map(t), hs = house ? t(house) : null, P2 = new Set(path.map(([a, b]) => key(a, b)));
    return {id: `c${N}v${v}P`, n: N, w: h, h: w, path, deco: D2, house: hs, P: P2, zones, slots: zones.flatMap(Z => Z.slots), front: zones.flatMap(Z => Z.front), doors: [door], coop: 1}; }
  return {id: `c${N}v${v}L`, n: N, w, h, path, deco: D, house, P, zones, slots: zones.flatMap(Z => Z.slots), front: zones.flatMap(Z => Z.front), doors: [door], coop: 1};
}
function rdGen(N, v, land){
  if (N >= 2 && N <= 6) return rdGenCoop(N, v, land);
  N = Math.max(1, Math.min(6, N)); v = v % (N === 1 ? 4 : 3);
  const S = RD_GSPEC[land ? "L" : "P"][N], K = S.K, two = !!S.bot, ring = N === 1 && v === 3, mg = N === 1 ? 1 : 0;
  const W0 = ring ? 6 : 5*K + 1, H0 = ring ? 6 : two ? 13 : 8;
  const pts = [], add = (x, y) => { const l = pts[pts.length - 1]; if (!l || l[0] !== x || l[1] !== y) pts.push([x, y]); };
  const line = (x0, y0, x1, y1) => { const sx = Math.sign(x1 - x0), sy = Math.sign(y1 - y0); let x = x0, y = y0; add(x, y); while (x !== x1 || y !== y1){ x += sx; y += sy; add(x, y); } };
  const blocks = [];
  if (ring){ line(0, 0, 5, 0); line(5, 0, 5, 5); line(5, 5, 0, 5); line(0, 5, 0, 1); blocks.push([1, 1]); }
  else {
    let cx = 0, cy = S.top[0]; add(0, cy);
    for (let i = 0; i < K; i++){ line(cx, cy, cx, S.top[i]); cy = S.top[i]; line(cx, cy, cx + 5, cy); cx += 5; blocks.push([1 + 5*i, 1]); }
    if (!two){ line(cx, cy, cx, 7); cy = 7; line(cx, cy, 0, cy); cx = 0; }
    else { for (let p = K - 1; p >= 0; p--){ line(cx, cy, cx, S.bot[p]); cy = S.bot[p]; line(cx, cy, cx - 5, cy); cx -= 5; } for (let p = 0; p < K; p++) if (S.bb[p]) blocks.push([1 + 5*p, 8]); }
    line(0, cy, 0, S.top[0] + (cy > S.top[0] ? 1 : -1));
  }
  /* 모양 바꾸기 → 여백 → (가로·세로에 맞게) 눕히기 */
  const tr = (land && H0 > W0) || (!land && W0 > H0);
  const T = ([x, y]) => { if (v === 1) x = W0 - 1 - x; x += mg; y += mg; return tr ? [y, x] : [x, y]; };
  let path = pts.map(T); if (v === 1 || v === 2) path.reverse();
  const w0 = W0 + 2*mg, h0 = H0 + 2*mg, w = tr ? h0 : w0, h = tr ? w0 : h0, key = (x, y) => x + "," + y, P = new Set(path.map(([x, y]) => key(x, y)));
  const zones = blocks.map(([bx, by]) => { const slots = []; for (let yy = 0; yy < 4; yy++) for (let xx = 0; xx < 4; xx++){ const a = T([bx + xx, by + yy]); slots.push(a); }
    /* 칸 순서: 늘 화면 기준 위→아래, 왼→오 (1~16번 자리) */
    slots.sort((a, b) => a[1] - b[1] || a[0] - b[0]); const xs = slots.map(c => c[0]), ys = slots.map(c => c[1]);
    return {slots, box: [Math.min(...xs), Math.min(...ys), Math.max(...xs) + 1, Math.max(...ys) + 1]}; });
  /* 마당 순서도 화면 기준 (위 줄 왼쪽부터) → 1번 친구가 늘 왼쪽 위 */
  zones.sort((a, b) => a.box[1] - b.box[1] || a.box[0] - b.box[0]);
  const used = new Set([...P, ...zones.flatMap(Z => Z.slots.map(([x, y]) => key(x, y)))]);
  let house = null, bd = 1e9; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!used.has(key(x, y))){ const d = (x - w/2 + .5)**2 + (y - h/2 + .5)**2*1.3; if (d < bd){ bd = d; house = [x, y]; } }
  const D = []; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!used.has(key(x, y)) && !(house && house[0] === x && house[1] === y)) D.push([x, y]);
  const isF = ([x, y]) => { for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (P.has(key(x + dx, y + dy))) return true; return false; };
  /* 🌀 문: 그 친구 마당을 가장 길게 끼고 도는 길이 시작되기 바로 앞 */
  const n = path.length;
  zones.forEach(Z => { const near = i => { const [x, y] = path[((i % n) + n) % n]; return Z.slots.some(([a, b]) => Math.abs(a - x) <= 1 && Math.abs(b - y) <= 1); };
    Z.front = Z.slots.map(isF); let best = 0, bl = -1;
    for (let i = 0; i < n; i++){ if (!near(i) || near(i - 1)) continue; let l = 0; while (l < n && near(i + l)) l++; if (l > bl){ bl = l; best = i; } }
    Z.door = (best - 1 + n) % n; });
  return {id: `g${N}v${v}${land ? "L" : "P"}`, n: N, w, h, path, deco: D, house, P, zones, slots: zones.flatMap(Z => Z.slots), front: zones.flatMap(Z => Z.front), doors: zones.map(Z => Z.door)};
}
