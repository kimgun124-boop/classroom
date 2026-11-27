/* =====================================================================
   🏟️ 동물 프로야구 3D (2026.11.27) — three.js로 진짜 입체 야구장 · 입체 동물 선수
   - three.js는 야구를 열 때만 lib/three/에서 불러와요 (안 되면 예전 그림으로 저절로)
   - 야간 경기장: 잔디 줄무늬·내야 흙·베이스·마운드 · 담장 · 관중석 · 조명탑 · 전광판
   - 동물 선수: 동물마다 머리(귀·주둥이·뿔·갈기·부리·무늬…) + 팀 유니폼·모자·바지·신발
     · 몸은 관절(허리·몸통·어깨·다리·무릎)로 움직여요: 타격 자세·스윙 / 투구 폼 / 달리기 / 수비 자세 / 다이빙
     · 팔은 손이 있는 곳을 바라보게 늘어나서 방망이를 두 손으로 꼭 잡아요
   - 좌표: 게임 좌표(x 오른쪽 1루 쪽, z 외야 쪽) → three 좌표 (-x, y, z)  (화면 오른쪽이 1루가 되게)
   - 카드 그림: 선수를 한 번 3D로 찍어 두고(portrait) 카드·전광판·타석 카드에 써요
   ===================================================================== */
const BB3D = {
  st: 0, T: null, R: null, S: null, cam: null, CH: new Map(), PORT: new Map(), onReady: [], q: 1, slow: 0,
  load(cb){
    if (this.st === 2){ cb && cb(); return; } if (cb) this.onReady.push(cb); if (this.st) return; this.st = 1;
    try { const c = document.createElement("canvas"); if (!(c.getContext("webgl2") || c.getContext("webgl"))) throw new Error("no webgl"); } catch(e){ this.st = -1; return; }
    import("./lib/three/three.module.min.js").then(T => { this.T = T; this.build(); this.st = 2; const L = this.onReady; this.onReady = []; L.forEach(f => { try { f(); } catch(e){ console.warn(e); } }); })
      .catch(e => { console.warn("[3D 야구]", e); this.st = -1; this.onReady = []; });
  },
  ready(){ return this.st === 2; },
  V3(x, y, z){ return new this.T.Vector3(-x, y, z); },

  /* ---------- 🏟️ 경기장 ---------- */
  build(){
    const T = this.T;
    const R = this.R = new T.WebGLRenderer({antialias: true, powerPreference: "high-performance"});
    R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.15;
    R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
    const S = this.S = new T.Scene();
    S.background = this.skyTex(); S.fog = new T.Fog(0x0d1730, 140, 330);
    S.add(new T.HemisphereLight(0xcfe0ff, 0x1d3b20, 1.05));
    const key = this.key = new T.DirectionalLight(0xfff6e0, 2.4); key.position.set(-30, 60, -40); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); const sc = key.shadow.camera; sc.left = sc.bottom = -18; sc.right = sc.top = 18; sc.near = 10; sc.far = 160; key.shadow.bias = -.0006; key.shadow.normalBias = .02;
    S.add(key); S.add(key.target);
    const fill = new T.DirectionalLight(0xa8c4ff, .7); fill.position.set(40, 30, 80); S.add(fill);
    this.cam = new T.PerspectiveCamera(25, 16/9, .1, 600);
    // 바닥: 경기장 그림 (210m × 150m) + 홈 근처 고화질 그림
    const big = new T.Mesh(new T.PlaneGeometry(900, 900), new T.MeshStandardMaterial({color: 0x1f5a2c, roughness: 1})); big.rotation.x = -Math.PI/2; big.position.y = -.03; S.add(big);
    S.add(this.groundMesh(-105, 105, -30, 120, this.fieldTex(), 0));
    S.add(this.groundMesh(-7, 7, -7, 7, this.homeTex(), .012));
    // 마운드 (살짝 볼록)
    const mound = new T.Mesh(new T.CylinderGeometry(2.6, 2.9, .25, 40), new T.MeshStandardMaterial({color: 0xb9784a, roughness: .95})); mound.position.copy(this.V3(0, .1, 18.4)); mound.receiveShadow = true; S.add(mound);
    const rub = new T.Mesh(new T.BoxGeometry(.6, .05, .15), new T.MeshStandardMaterial({color: 0xffffff})); rub.position.copy(this.V3(0, .25, 18.4)); S.add(rub);
    // 베이스
    const bm = new T.MeshStandardMaterial({color: 0xffffff, roughness: .6}), bg = new T.BoxGeometry(.42, .08, .42);
    [[19.4, 19.4], [0, 38.8], [-19.4, 19.4]].forEach(([x, z]) => { const b = new T.Mesh(bg, bm); b.position.copy(this.V3(x, .04, z)); b.rotation.y = Math.PI/4; b.receiveShadow = true; S.add(b); });
    this.stadium();
    // 공 + 꼬리
    this.ball = new T.Mesh(new T.SphereGeometry(.075, 16, 12), new T.MeshStandardMaterial({map: this.ballTex(), roughness: .45, emissive: 0x333333})); this.ball.castShadow = true; S.add(this.ball);
    this.trail = [0, 1, 2, 3].map(i => { const m = new T.Mesh(new T.SphereGeometry(.07, 10, 8), new T.MeshBasicMaterial({color: 0xffffff, transparent: true, opacity: .25 - i*.05, depthWrite: false})); S.add(m); return m; });
    this.bshadow = new T.Mesh(new T.CircleGeometry(.12, 16), new T.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: .3, depthWrite: false})); this.bshadow.rotation.x = -Math.PI/2; S.add(this.bshadow);
    this.mats = {};
  },
  groundMesh(x0, x1, z0, z1, tex, y){
    const T = this.T, g = new T.BufferGeometry(), P = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
    g.setAttribute("position", new T.Float32BufferAttribute(P.flatMap(([x, z]) => [-x, y, z]), 3));
    g.setAttribute("uv", new T.Float32BufferAttribute(P.flatMap(([x, z]) => [(x - x0)/(x1 - x0), (z - z0)/(z1 - z0)]), 2));
    g.setAttribute("normal", new T.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3)); g.setIndex([0, 1, 2, 0, 2, 3]);
    const m = new T.Mesh(g, new T.MeshStandardMaterial({map: tex, roughness: .95, transparent: y > 0, depthWrite: !(y > 0), polygonOffset: true, polygonOffsetFactor: -1 - y*100})); m.receiveShadow = true; return m;
  },
  canvasTex(c, rep){ const T = this.T, t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; if (rep){ t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(...rep); } return t; },
  fieldTex(){
    const X0 = -105, X1 = 105, Z0 = -30, Z1 = 120, s = 10, c = document.createElement("canvas"); c.width = (X1 - X0)*s; c.height = (Z1 - Z0)*s;
    const g = c.getContext("2d"), px = x => (x - X0)*s, py = z => (Z1 - z)*s, fR = a => 84 + 16*Math.cos(2*a);
    g.fillStyle = "#2c7a3c"; g.fillRect(0, 0, c.width, c.height);
    // 페어 지역 잔디 (체크 무늬 깎기)
    g.save(); g.beginPath(); g.moveTo(px(0), py(0)); for (let d = -45; d <= 45; d += 1){ const a = d*Math.PI/180, r = fR(a); g.lineTo(px(Math.sin(a)*r), py(Math.cos(a)*r)); } g.closePath(); g.clip();
    g.fillStyle = "#38994b"; g.fillRect(0, 0, c.width, c.height);
    for (let i = -30; i < 30; i++){ g.fillStyle = i % 2 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.06)"; g.save(); g.translate(px(0), py(0)); g.rotate(Math.PI/4); g.fillRect(i*6*s, -200*s, 6*s, 400*s); g.restore(); }
    for (let i = -30; i < 30; i++){ g.fillStyle = i % 2 ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.035)"; g.save(); g.translate(px(0), py(0)); g.rotate(-Math.PI/4); g.fillRect(i*6*s, -200*s, 6*s, 400*s); g.restore(); }
    g.restore();
    // 경고 트랙 (담장 앞 흙길)
    g.strokeStyle = "#a8693d"; g.lineWidth = 4.5*s; g.beginPath(); for (let d = -45; d <= 45; d += 1){ const a = d*Math.PI/180, r = fR(a) - 2.3; d === -45 ? g.moveTo(px(Math.sin(a)*r), py(Math.cos(a)*r)) : g.lineTo(px(Math.sin(a)*r), py(Math.cos(a)*r)); } g.stroke();
    // 내야 흙 + 안쪽 잔디
    const dirt = "#c4834f"; g.fillStyle = dirt; g.beginPath(); g.arc(px(0), py(19), 28.5*s, 0, 7); g.fill();
    g.fillStyle = "#3a9e4e"; g.beginPath(); g.moveTo(px(0), py(3.6)); g.lineTo(px(15.6), py(19.4)); g.lineTo(px(0), py(35.2)); g.lineTo(px(-15.6), py(19.4)); g.closePath(); g.fill();
    // 베이스 길 (흙) · 파울선
    g.strokeStyle = dirt; g.lineWidth = 1.3*s; g.lineCap = "round"; g.beginPath(); g.moveTo(px(0), py(0)); g.lineTo(px(19.4), py(19.4)); g.lineTo(px(0), py(38.8)); g.lineTo(px(-19.4), py(19.4)); g.closePath(); g.stroke();
    [[19.4, 19.4], [0, 38.8], [-19.4, 19.4]].forEach(([x, z]) => { g.fillStyle = dirt; g.beginPath(); g.arc(px(x), py(z), 2.8*s, 0, 7); g.fill(); });
    g.strokeStyle = "rgba(255,255,255,.95)"; g.lineWidth = .14*s; g.beginPath(); [1, -1].forEach(k => { g.moveTo(px(0), py(0)); g.lineTo(px(k*Math.sin(Math.PI/4)*84), py(Math.cos(Math.PI/4)*84)); }); g.stroke();
    // 흙 질감
    for (let i = 0; i < 9000; i++){ const x = X0 + Math.random()*(X1 - X0), z = -10 + Math.random()*60; g.fillStyle = `rgba(${Math.random() < .5 ? "255,255,255" : "60,30,10"},${Math.random()*.05})`; g.fillRect(px(x), py(z), 2, 2); }
    return this.canvasTex(c);
  },
  homeTex(){
    const N = 1024, s = N/14, c = document.createElement("canvas"); c.width = c.height = N; const g = c.getContext("2d"), px = x => (x + 7)*s, py = z => (7 - z)*s;
    g.fillStyle = "#c4834f"; g.beginPath(); g.arc(px(0), py(0), 4.3*s, 0, 7); g.fill();
    for (let i = 0; i < 4000; i++){ const a = Math.random()*7, r = Math.random()*4.2*s; g.fillStyle = `rgba(${Math.random() < .5 ? "255,255,255" : "70,35,10"},${Math.random()*.08})`; g.fillRect(px(0) + Math.cos(a)*r, py(0) + Math.sin(a)*r, 3, 3); }
    g.strokeStyle = "rgba(255,255,255,.92)"; g.lineWidth = .07*s; [[-1.3, -.9, .8, 1.8], [.5, -.9, .8, 1.8]].forEach(([x, z, w, h]) => g.strokeRect(px(x), py(z + h), w*s, h*s));
    g.beginPath(); [1, -1].forEach(k => { g.moveTo(px(k*.6), py(.6)); g.lineTo(px(k*7), py(7)); }); g.stroke();
    g.fillStyle = "#fff"; g.beginPath(); g.moveTo(px(-.215), py(.215)); g.lineTo(px(.215), py(.215)); g.lineTo(px(.215), py(0)); g.lineTo(px(0), py(-.215)); g.lineTo(px(-.215), py(0)); g.closePath(); g.fill();
    g.globalCompositeOperation = "destination-in"; const gr = g.createRadialGradient(px(0), py(0), 3.9*s, px(0), py(0), 4.4*s); gr.addColorStop(0, "#000"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, N, N);
    return this.canvasTex(c);
  },
  skyTex(){ const c = document.createElement("canvas"); c.width = 4; c.height = 512; const g = c.getContext("2d"), gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, "#050a1c"); gr.addColorStop(.55, "#0f1f45"); gr.addColorStop(.8, "#26386e"); gr.addColorStop(1, "#3c3f6e"); g.fillStyle = gr; g.fillRect(0, 0, 4, 512); const t = this.canvasTex(c); return t; },
  ballTex(){ const c = document.createElement("canvas"); c.width = 128; c.height = 64; const g = c.getContext("2d"); g.fillStyle = "#fbfbf6"; g.fillRect(0, 0, 128, 64);
    g.strokeStyle = "#d9302c"; g.lineWidth = 3; g.setLineDash([3, 3]); g.beginPath(); for (let x = 0; x <= 128; x += 2) g.lineTo(x, 32 + Math.sin(x/128*Math.PI*4)*18); g.stroke(); return this.canvasTex(c); },
  crowdTex(){ const c = document.createElement("canvas"); c.width = 512; c.height = 256; const g = c.getContext("2d"); g.fillStyle = "#1d2236"; g.fillRect(0, 0, 512, 256);
    const C = ["#ff6b6b", "#4dabf7", "#ffd43b", "#f8f9fa", "#69db7c", "#da77f2", "#ffa94d", "#e64980", "#3bc9db"];
    for (let r = 0; r < 16; r++){ g.fillStyle = r % 2 ? "#262c45" : "#20253b"; g.fillRect(0, r*16, 512, 16); for (let k = 0; k < 64; k++){ if (Math.random() < .15) continue; const x = k*8 + Math.random()*3, y = r*16 + 4;
      g.fillStyle = C[(Math.random()*C.length) | 0]; g.fillRect(x, y + 4, 6, 7); g.fillStyle = "#f1c8a0"; g.beginPath(); g.arc(x + 3, y + 2, 2.6, 0, 7); g.fill(); } }
    return this.canvasTex(c, [6, 1]); },
  stadium(){
    const T = this.T, S = this.S, fR = a => 84 + 16*Math.cos(2*a), FH = 3.2;
    const quadStrip = (A, B, mat) => { const pos = [], uv = [], idx = []; A.forEach((p, i) => { pos.push(-A[i][0], A[i][1], A[i][2], -B[i][0], B[i][1], B[i][2]); uv.push(i/(A.length - 1), 0, i/(A.length - 1), 1); if (i){ const k = i*2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); } });
      const g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); const m = new T.Mesh(g, mat); S.add(m); return m; };
    const arc = (r0, y, d0 = -45, d1 = 45, st = 2) => { const L = []; for (let d = d0; d <= d1; d += st){ const a = d*Math.PI/180, r = typeof r0 === "function" ? r0(a) : r0; L.push([Math.sin(a)*r, y, Math.cos(a)*r]); } return L; };
    // 담장 (짙은 초록 쿠션 + 노란 선)
    const wallM = new T.MeshStandardMaterial({color: 0x17472f, roughness: .8, side: T.DoubleSide});
    quadStrip(arc(fR, 0), arc(fR, FH), wallM);
    quadStrip(arc(fR, FH - .02), arc(a => fR(a) + .3, FH + .08), new T.MeshBasicMaterial({color: 0xffd43b, side: T.DoubleSide}));
    // 파울 지역 담장 (홈 뒤까지)
    const sideR = a => { const d = Math.abs(a*180/Math.PI); return d <= 45 ? fR(a) : 84*Math.cos(Math.PI/4)/Math.max(.25, Math.cos(Math.abs(a))) ; };
    [[45, 100], [-100, -45]].forEach(([d0, d1]) => { const A = arc(a => Math.min(130, 59.4/Math.max(.35, Math.cos(Math.abs(a) - Math.PI/4 - .0001)) ), 0, d0, d1, 3).map(([x, y, z]) => [x, y, z]); });
    // 관중석: 담장 뒤로 높아져요 (외야) + 내야 쪽 스탠드
    const crowdM = new T.MeshStandardMaterial({map: this.crowdTex(), roughness: .9, side: T.DoubleSide});
    quadStrip(arc(a => fR(a) + 1, FH + .2, -46, 46), arc(a => fR(a) + 34, 24, -46, 46), crowdM);
    quadStrip(arc(a => fR(a) + 34, 24, -46, 46), arc(a => fR(a) + 36, 30, -46, 46), new T.MeshStandardMaterial({color: 0x2b3352, side: T.DoubleSide}));
    [[46, 128], [-128, -46]].forEach(([d0, d1]) => {
      const rIn = a => 62/Math.max(.3, Math.abs(Math.cos(Math.abs(a) - (Math.abs(a) > Math.PI/2 ? Math.PI : 0)))) * 0 + 64, rOut = a => 100;
      quadStrip(arc(rIn, 1.2, d0, d1, 4), arc(rOut, 22, d0, d1, 4), crowdM);
      quadStrip(arc(rIn, 0, d0, d1, 4), arc(rIn, 1.2, d0, d1, 4), wallM); });
    // 파울 기둥
    const poleM = new T.MeshStandardMaterial({color: 0xffd43b, emissive: 0x806000, roughness: .5});
    [1, -1].forEach(k => { const p = new T.Mesh(new T.CylinderGeometry(.18, .18, 22, 10), poleM); p.position.copy(this.V3(k*Math.sin(Math.PI/4)*84, 11, Math.cos(Math.PI/4)*84)); S.add(p); });
    // 조명탑 (빛나는 판 + 번짐)
    const glow = this.glowTex(), towerM = new T.MeshStandardMaterial({color: 0x3d4766, roughness: .7}), lampM = new T.MeshBasicMaterial({color: 0xfff8e1});
    [[-75, 30], [-55, 82], [0, 128], [55, 82], [75, 30], [-60, -18], [60, -18]].forEach(([x, z]) => {
      const pole = new T.Mesh(new T.CylinderGeometry(.6, .9, 46, 8), towerM); pole.position.copy(this.V3(x, 23, z)); S.add(pole);
      const lamp = new T.Mesh(new T.BoxGeometry(9, 5, .6), lampM); lamp.position.copy(this.V3(x, 47, z)); lamp.lookAt(this.V3(0, 0, 30)); S.add(lamp);
      const sp = new T.Sprite(new T.SpriteMaterial({map: glow, color: 0xfff2c8, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false})); sp.scale.set(34, 34, 1); sp.position.copy(this.V3(x, 47, z)); S.add(sp); });
    // 전광판 (가운데 담장 뒤)
    this.sbC = document.createElement("canvas"); this.sbC.width = 1024; this.sbC.height = 384; this.sbT = this.canvasTex(this.sbC);
    const sb = new T.Mesh(new T.PlaneGeometry(36, 13.5), new T.MeshBasicMaterial({map: this.sbT, fog: false})); sb.position.copy(this.V3(0, 33, 136)); sb.rotation.y = Math.PI; S.add(sb);
    const frame = new T.Mesh(new T.BoxGeometry(38, 15.5, 1), towerM); frame.position.copy(this.V3(0, 33, 136.6)); S.add(frame);
    const leg = new T.Mesh(new T.BoxGeometry(2, 26, 2), towerM); leg.position.copy(this.V3(0, 13, 137)); S.add(leg);
    this.sbKey = "";
  },
  glowTex(){ const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 2, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.25, "rgba(255,255,255,.5)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new this.T.CanvasTexture(c); },
  board(o){ const k = JSON.stringify(o); if (k === this.sbKey) return; this.sbKey = k; const g = this.sbC.getContext("2d"), W = 1024, H = 384;
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#0b1a3a"); gr.addColorStop(1, "#04081a"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = "#ffd43b"; g.lineWidth = 8; g.strokeRect(6, 6, W - 12, H - 12);
    g.font = "bold 60px Jua, sans-serif"; g.textBaseline = "middle"; g.fillStyle = "#ffe066"; g.textAlign = "center"; g.fillText("⚾ 동물 프로야구", W/2, 62);
    [[o.a, o.sa, "#4dabf7", 165], [o.h, o.sh, "#ff6b6b", 265]].forEach(([n, v, c, y]) => { g.textAlign = "left"; g.fillStyle = c; g.fillRect(40, y - 36, 14, 72); g.fillStyle = "#fff"; g.font = "bold 58px Jua, sans-serif"; g.fillText(n, 74, y); g.textAlign = "right"; g.fillStyle = "#ffe066"; g.font = "bold 80px Jua, sans-serif"; g.fillText(String(v), W - 60, y); });
    g.textAlign = "center"; g.fillStyle = "#a5d8ff"; g.font = "bold 40px Jua, sans-serif"; g.fillText(o.i, W/2, H - 34); this.sbT.needsUpdate = true; },

  /* ---------- 🐾 동물 선수 ---------- */
  /* 이모지 → [털색, 배·주둥이색, 귀, 주둥이, 꾸미기…] */
  SP: {
    "🐔": [0xf8f9fa, 0xffffff, "none", "beak", "comb,wattle"], "🐷": [0xffb3c6, 0xffd6e0, "point", "pig", ""], "🐑": [0xf1f3f5, 0x5c5f66, "floppy", "short", "wool"], "🐸": [0x51cf66, 0xd8f5a2, "none", "flat", "frogeyes"],
    "🐧": [0x25262b, 0xffffff, "none", "beak", "face"], "🦆": [0x2f9e44, 0xfff3bf, "none", "duck", ""], "🐮": [0xffffff, 0xffc9c9, "floppy", "short", "spots,horns"], "🐹": [0xf4a261, 0xfff4e6, "round", "short", ""],
    "🦊": [0xf76707, 0xffffff, "point", "long", "face"], "🦉": [0x8d5524, 0xe6c79c, "tuft", "beak", "bigeyes,face"], "🐺": [0x868e96, 0xdee2e6, "point", "long", "face"], "🦌": [0xb5651d, 0xf1d3b3, "point", "long", "antlers"],
    "🐐": [0xe9ecef, 0xffffff, "floppy", "long", "horns,beard"], "🦜": [0xfa5252, 0xffd43b, "none", "beak", "crest"], "🐬": [0x74c0fc, 0xe7f5ff, "none", "long", "fin"], "🦅": [0xffffff, 0xffffff, "none", "beak", "brow"],
    "🐻‍❄️": [0xf8f9fa, 0xe9ecef, "round", "short", ""], "🦈": [0x8fa3b8, 0xffffff, "none", "long", "fin,teeth"], "🐍": [0x51cf66, 0xd8f5a2, "none", "flat", "tongue,spots"], "🦩": [0xff8fab, 0xffc2d1, "none", "beak", ""],
    "🐲": [0x2f9e44, 0xd8f5a2, "none", "long", "horns,spikes,mane"], "🦄": [0xffffff, 0xf3d9fa, "point", "long", "horn1,rainbow"], "🦖": [0x40c057, 0xd3f9d8, "none", "croc", "spikes"], "🐢": [0x82c91e, 0xd8f5a2, "none", "short", "shell"],
    "🐻": [0x8b5a2b, 0xd2a679, "round", "short", ""], "🦔": [0x8d6e63, 0xf5deb3, "small", "short", "spikes"], "🦏": [0x868e96, 0xadb5bd, "point", "long", "horn1"], "🦫": [0x8b5a2b, 0xd2a679, "small", "short", "teeth,tailflat"],
    "🦍": [0x343a40, 0x6c757d, "small", "flat", "brow"], "🐘": [0xadb5bd, 0xced4da, "big", "trunk", "tusks"], "🦬": [0x5c3d2e, 0x3b2a20, "small", "short", "horns,beard,wool"], "🐊": [0x2b8a3e, 0x94d82d, "none", "croc", "spikes"],
    "🐼": [0xffffff, 0xffffff, "roundk", "short", "patch"], "🐨": [0xadb5bd, 0xf1f3f5, "fluffy", "nose", ""], "🐗": [0x6d4c41, 0x8d6e63, "point", "pig", "tusks"], "🐂": [0x8b5a2b, 0xd2a679, "floppy", "short", "horns"],
    "🦛": [0x9c88b8, 0xe0c3fc, "small", "wide", ""], "🐃": [0x495057, 0x868e96, "small", "short", "horns"], "🦭": [0x868e96, 0xdee2e6, "none", "short", ""], "🦁": [0xf59f00, 0xffe8a1, "round", "short", "mane"],
    "🐿️": [0xd9480f, 0xffe8cc, "point", "short", "tailbushy"], "🐭": [0xadb5bd, 0xffdeeb, "big", "short", ""], "🐞": [0xe03131, 0x212529, "none", "flat", "antennae,spots"], "🦝": [0x868e96, 0xf1f3f5, "point", "short", "mask,tailring"],
    "🐒": [0x8b5a2b, 0xf1d3b3, "side", "flat", ""], "🦦": [0x8b5a2b, 0xd2a679, "small", "short", ""], "🐱": [0xffa94d, 0xfff4e6, "point", "short", "stripes"], "🐵": [0x8b5a2b, 0xf1d3b3, "side", "flat", "band"],
    "🦎": [0x94d82d, 0xd8f5a2, "none", "flat", "spots"], "🐇": [0xf8f9fa, 0xffdeeb, "long", "short", ""], "🦀": [0xfa5252, 0xffa8a8, "none", "flat", "eyestalk"], "🐶": [0xd4a373, 0xfefae0, "floppy", "short", ""],
    "🐆": [0xfab005, 0xfff3bf, "round", "short", "spots"], "🦡": [0x495057, 0xffffff, "small", "long", "stripe"], "🐯": [0xff922b, 0xffffff, "round", "short", "stripes"], "🐰": [0xffe3ec, 0xffffff, "long", "short", ""],
    "🐌": [0xced4da, 0xe9ecef, "none", "flat", "eyestalk,shellsnail"], "🦨": [0x212529, 0xffffff, "small", "short", "stripe,tailbushy"], "🐙": [0xcc5de8, 0xf3d9fa, "none", "flat", "spots"], "🦞": [0xc92a2a, 0xffa8a8, "none", "flat", "antennae"],
    "🦧": [0xd9480f, 0xf1a87c, "small", "flat", "brow"], "🦕": [0x51cf66, 0xb2f2bb, "none", "flat", "spots"], "🦇": [0x495057, 0x868e96, "bigpoint", "short", "wings"], "🐝": [0xfab005, 0x212529, "none", "flat", "stripes,antennae,wings"],
    "🦥": [0xa98467, 0xe6ccb2, "none", "flat", "mask"], "🦘": [0xc97b45, 0xf1d3b3, "long", "long", ""], "🐫": [0xd4a373, 0xe9c46a, "small", "long", "hump"], "🦒": [0xfab005, 0xfff3bf, "point", "long", "ossicones,spots"],
    "🐅": [0xff922b, 0xffffff, "round", "short", "stripes"], "🐳": [0x339af0, 0xe7f5ff, "none", "wide", ""], "🦙": [0xf8f0e3, 0xffffff, "long", "long", "wool"], "🐴": [0x8b5a2b, 0xd2a679, "point", "long", "mane"],
    "🦋": [0x4dabf7, 0xe7f5ff, "none", "flat", "antennae,wings"], "🐦": [0x4dabf7, 0xe7f5ff, "none", "beak", ""], "🦓": [0xffffff, 0xf1f3f5, "point", "long", "stripes,mane"], "🦢": [0xffffff, 0xffffff, "none", "beak", ""],
    "🐎": [0x5c3d2e, 0x8b5a2b, "point", "long", "mane"], "🦚": [0x1c7ed6, 0x63e6be, "none", "beak", "crest"], "🐉": [0x15aabf, 0x99e9f2, "none", "long", "horns,mane,spikes"], "🐕": [0xf1d3b3, 0xffffff, "point", "long", ""],
    "🐤": [0xffd43b, 0xfff3bf, "none", "beak", ""], "🦃": [0x8b5a2b, 0xc92a2a, "none", "beak", "wattle"], "🐟": [0x4dabf7, 0xe7f5ff, "none", "flat", "fin"], "🐕‍🦺": [0xd4a373, 0xfefae0, "point", "long", ""],
    "🐈‍⬛": [0x2b2b30, 0x495057, "point", "short", ""], "🐣": [0xffe066, 0xfff3bf, "none", "beak", "eggshell"]
  },
  mat(col, o = {}){ const k = col + JSON.stringify(o); let m = this.mats[k]; if (!m){ m = this.mats[k] = new this.T.MeshStandardMaterial(Object.assign({color: col, roughness: .75}, o)); } return m; },
  headTex(sp){ const [fur, bel, , , ex] = sp, k = "h" + fur + bel + ex; if (this.mats[k]) return this.mats[k];
    const c = document.createElement("canvas"); c.width = 256; c.height = 128; const g = c.getContext("2d"), hx = n => "#" + n.toString(16).padStart(6, "0");
    g.fillStyle = hx(fur); g.fillRect(0, 0, 256, 128); const front = 64;   // 앞 = u 0.25
    if (/stripes/.test(ex)){ g.fillStyle = "rgba(25,20,15,.85)"; for (let i = 0; i < 12; i++){ const x = 100 + i*14; g.beginPath(); g.moveTo(x, 10); g.lineTo(x + 6, 10); g.lineTo(x + 2, 60); g.closePath(); g.fill(); } }
    if (/spots/.test(ex)){ g.fillStyle = "rgba(40,25,10,.75)"; for (let i = 0; i < 40; i++){ const x = Math.random()*256, y = 10 + Math.random()*100; if (Math.abs(x - front) < 26 && y > 40) continue; g.beginPath(); g.arc(x, y, 3 + Math.random()*5, 0, 7); g.fill(); } }
    if (/mask/.test(ex)){ g.fillStyle = "rgba(30,30,35,.9)"; g.beginPath(); g.ellipse(front, 56, 34, 10, 0, 0, 7); g.fill(); }
    if (/patch/.test(ex)){ g.fillStyle = "#212529"; [-13, 13].forEach(d => { g.beginPath(); g.ellipse(front + d, 58, 8, 11, d > 0 ? -.4 : .4, 0, 7); g.fill(); }); }
    if (/stripe(?!s)/.test(ex)){ g.fillStyle = "#ffffff"; g.fillRect(front - 5, 0, 10, 70); }
    if (/face/.test(ex)){ g.fillStyle = hx(bel); g.beginPath(); g.ellipse(front, 74, 28, 30, 0, 0, 7); g.fill(); }
    g.fillStyle = hx(bel); g.beginPath(); g.ellipse(front, 128, 46, 30, 0, 0, 7); g.fill();
    const t = this.canvasTex(c); this.mats[k] = t; return t; },
  /* 선수 만들기 (얼굴은 +z 쪽) */
  makeChar(card, teamCol, opt = {}){
    const T = this.T, sp = this.SP[card.e] || [0x8b5a2b, 0xd2a679, "round", "short", ""], [fur, bel, ear, snout, ex] = sp;
    const M = {fur: this.mat(fur, {roughness: .85}), bel: this.mat(bel, {roughness: .85}), jer: this.mat(teamCol, {roughness: .55}), pants: this.mat(0xf1f3f5, {roughness: .6}),
      sock: this.mat(teamCol, {roughness: .6}), shoe: this.mat(0x212529, {roughness: .4}), belt: this.mat(0x1b1b1f), black: this.mat(0x111111, {roughness: .3}), white: this.mat(0xffffff, {roughness: .3}),
      cap: this.mat(teamCol, {roughness: .35, metalness: .1}), glove: this.mat(0x9c5a24, {roughness: .6}), bat: this.mat(0xd7a86e, {roughness: .45}), gold: this.mat(0xffd43b, {roughness: .3, metalness: .6}),
      beak: this.mat(/duck|🐧|🦩|🦢|🐤|🐣|🐔|🦆/.test(card.e) ? 0xff922b : 0xfab005, {roughness: .5}), horn: this.mat(0xf8f0e3, {roughness: .5}), pink: this.mat(0xff8fab, {roughness: .6})};
    const sph = (r, ws = 16, hs = 12) => new T.SphereGeometry(r, ws, hs), cap = (r, l) => new T.CapsuleGeometry(r, l, 6, 12), cyl = (a, b, h, n = 12) => new T.CylinderGeometry(a, b, h, n), cone = (r, h, n = 12) => new T.ConeGeometry(r, h, n);
    const add = (par, geo, mat, x = 0, y = 0, z = 0, sc, rot) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); if (sc) m.scale.set(...sc); if (rot) m.rotation.set(...rot); m.castShadow = true; par.add(m); return m; };
    const G = new T.Group(), J = {};
    const root = J.root = new T.Group(); G.add(root);
    const hip = J.hip = new T.Group(); hip.position.y = .72; root.add(hip);
    add(hip, sph(.21), M.pants, 0, -.02, 0, [1.05, .8, .85]);
    [1, -1].forEach(sd => { const L = new T.Group(); L.position.set(sd*.11, -.05, 0); hip.add(L);
      add(L, cap(.085, .2), M.pants, 0, -.15, 0); const K = new T.Group(); K.position.y = -.33; L.add(K);
      add(K, cap(.07, .18), M.sock, 0, -.14, 0); add(K, new T.BoxGeometry(.14, .08, .26), M.shoe, 0, -.3, .05);
      J[sd > 0 ? "legL" : "legR"] = L; J[sd > 0 ? "kneeL" : "kneeR"] = K; });
    const sp_ = J.spine = new T.Group(); sp_.position.y = .04; hip.add(sp_);
    add(sp_, cap(.21, .2), M.jer, 0, .22, 0, [1.05, 1, .82]); add(sp_, cyl(.21, .21, .05, 16), M.belt, 0, .03, 0, [1.02, 1, .84]);
    if (/shell(?!snail)/.test(ex)) add(sp_, sph(.3, 16, 10), this.mat(0x5c940d, {roughness: .5}), 0, .27, -.16, [1, 1.05, .6]);
    if (/shellsnail/.test(ex)) add(sp_, sph(.26, 16, 10), this.mat(0xb5651d, {roughness: .5}), 0, .3, -.2, [.7, 1, 1]);
    if (/hump/.test(ex)) add(sp_, sph(.17), M.fur, 0, .43, -.15);
    if (/wings/.test(ex)) [1, -1].forEach(sd => add(sp_, sph(.22, 12, 8), this.mat(card.e === "🦋" ? 0x74c0fc : card.e === "🐝" ? 0xe7f5ff : 0x495057, {roughness: .4, transparent: card.e === "🐝", opacity: .7}), sd*.17, .36, -.17, [.25, 1.1, .7], [0, sd*.5, sd*.3]));
    // 배번
    // 어깨 (팔은 손을 바라보게 매 장면 돌려요)
    [1, -1].forEach(sd => { const sh = new T.Group(); sh.position.set(sd*.25, .36, 0); sp_.add(sh);
      const arm = new T.Group(); sh.add(arm); add(arm, cap(.07, .14), M.jer, 0, 0, .09, null, [Math.PI/2, 0, 0]); add(arm, cap(.058, .14), M.fur, 0, 0, .27, null, [Math.PI/2, 0, 0]);
      J[sd > 0 ? "shL" : "shR"] = sh; J[sd > 0 ? "armL" : "armR"] = arm; });
    // 손 (몸통 기준 자리)
    J.hL = new T.Group(); J.hR = new T.Group(); sp_.add(J.hL); sp_.add(J.hR);
    add(J.hR, sph(.065, 10, 8), M.fur); add(J.hL, sph(.065, 10, 8), M.fur);
    if (opt.glove) add(J.hL, sph(.11, 12, 8), M.glove, 0, 0, .02, [1, 1.2, .55]);
    // 방망이 (오른손이 손잡이)
    if (opt.bat){ const bat = J.bat = new T.Group(); J.hR.add(bat); add(bat, cyl(.032, .022, .3, 10), M.bat, 0, .15, 0); add(bat, cyl(.045, .032, .55, 12), M.bat, 0, .57, 0); add(bat, sph(.045, 10, 8), M.bat, 0, .85, 0); add(bat, cyl(.03, .03, .03, 10), M.black, 0, .0, 0); }
    // 머리
    const hd = J.head = new T.Group(); hd.position.y = .56; sp_.add(hd);
    const big = /🐙|🐸|🐣|🐤/.test(card.e) ? 1.1 : 1, headM = new T.MeshStandardMaterial({map: this.headTex(sp), roughness: .85});
    add(hd, sph(.29*big, 24, 18), headM, 0, .2, 0, [1, .95, .95]);
    const fz = .27*big;
    // 눈
    const eyeS = /bigeyes/.test(ex) ? 1.6 : 1, eyeY = /frogeyes/.test(ex) ? .42 : .26;
    [1, -1].forEach(sd => { const e = new T.Group(); e.position.set(sd*.1, eyeY, /frogeyes/.test(ex) ? .12 : fz - .03); hd.add(e);
      if (/frogeyes|eyestalk/.test(ex)) add(e, /eyestalk/.test(ex) ? cyl(.025, .025, .18, 8) : sph(.08, 12, 8), M.fur, 0, /eyestalk/.test(ex) ? .1 : -.02, 0);
      const ey = new T.Group(); ey.position.y = /eyestalk/.test(ex) ? .2 : 0; e.add(ey);
      add(ey, sph(.05*eyeS, 12, 10), M.white, 0, 0, 0, [1, 1.1, .6]); add(ey, sph(.033*eyeS, 10, 8), M.black, 0, 0, .025*eyeS); add(ey, sph(.011*eyeS, 6, 6), M.white, sd*.01, .015, .05*eyeS); });
    if (/brow/.test(ex)) add(hd, cap(.04, .22), M.fur, 0, .33, fz - .05, null, [0, 0, Math.PI/2]);
    // 주둥이
    const nose = (z, y = .16) => add(hd, sph(.035, 10, 8), M.black, 0, y, z);
    if (snout === "short"){ add(hd, sph(.12, 14, 10), M.bel, 0, .12, fz - .02, [1.15, .8, .7]); nose(fz + .07); }
    else if (snout === "long"){ add(hd, cap(.08, .16), M.bel, 0, .12, fz + .04, [1.1, 1, 1], [Math.PI/2, 0, 0]); nose(fz + .2, .14); }
    else if (snout === "flat"){ add(hd, sph(.1, 14, 10), M.bel, 0, .1, fz - .03, [1.3, .7, .5]); }
    else if (snout === "nose"){ add(hd, sph(.07, 12, 10), M.black, 0, .14, fz + .02, [1, 1.3, .8]); }
    else if (snout === "pig"){ add(hd, cyl(.09, .09, .08, 16), M.pink, 0, .12, fz + .02, null, [Math.PI/2, 0, 0]); [1, -1].forEach(sd => add(hd, sph(.02, 6, 6), M.black, sd*.035, .12, fz + .06)); }
    else if (snout === "beak"){ add(hd, cone(.07, .18), M.beak, 0, .13, fz + .06, null, [Math.PI/2, 0, 0]); }
    else if (snout === "duck"){ add(hd, sph(.1, 12, 8), M.beak, 0, .1, fz + .05, [1.2, .35, 1.1]); }
    else if (snout === "trunk"){ const tr = new T.Group(); tr.position.set(0, .1, fz); hd.add(tr); add(tr, cyl(.07, .04, .4, 10), M.fur, 0, -.12, .12, null, [.7, 0, 0]); }
    else if (snout === "croc"){ add(hd, new T.BoxGeometry(.24, .1, .36), M.fur, 0, .08, fz + .1); add(hd, new T.BoxGeometry(.2, .03, .3), M.white, 0, .03, fz + .1); }
    else if (snout === "wide"){ add(hd, sph(.16, 14, 10), M.bel, 0, .08, fz, [1.4, .8, .8]); [1, -1].forEach(sd => add(hd, sph(.02, 6, 6), M.black, sd*.06, .14, fz + .12)); }
    if (/teeth/.test(ex)) add(hd, new T.BoxGeometry(.07, .05, .02), M.white, 0, .02, fz + .02);
    if (/tongue/.test(ex)) add(hd, new T.BoxGeometry(.03, .01, .12), this.mat(0xe03131), 0, .07, fz + .08);
    // 귀
    const EAR = {round: [sph(.09, 12, 8), [1, 1, .45], .19, .4, 0], small: [sph(.06, 10, 8), [1, 1, .5], .2, .38, 0], roundk: [sph(.09, 12, 8), [1, 1, .45], .19, .4, 0],
      point: [cone(.08, .2, 10), [1, 1, .6], .16, .46, -.25], bigpoint: [cone(.12, .3, 10), [1, 1, .4], .18, .5, -.3], long: [cap(.055, .3), [1, 1, .55], .09, .6, -.1],
      floppy: [cap(.055, .16), [1, 1, .5], .3, .22, 1.1], big: [sph(.22, 14, 10), [1, 1.1, .25], .3, .25, .2], fluffy: [sph(.12, 12, 8), [1, 1, .5], .25, .38, 0],
      side: [sph(.07, 10, 8), [.5, 1, 1], .3, .24, 0], tuft: [cone(.05, .14, 8), [1, 1, .6], .14, .48, -.2]}[ear];
    if (EAR) [1, -1].forEach(sd => add(hd, EAR[0], ear === "roundk" ? M.black : M.fur, sd*EAR[2], EAR[3], -.02, EAR[1], [0, 0, -sd*EAR[4]]));
    // 꾸미기
    if (/mane/.test(ex)) add(hd, new T.TorusGeometry(.27, .1, 10, 24), this.mat(card.e === "🦁" ? 0xb35900 : card.e === "🦓" ? 0x212529 : card.e === "🐲" || card.e === "🐉" ? 0xffd43b : 0x3b2a20, {roughness: .9}), 0, .2, -.06);
    if (/rainbow/.test(ex)) add(hd, new T.TorusGeometry(.25, .07, 8, 20, Math.PI), this.mat(0xda77f2), 0, .3, -.12, null, [0, Math.PI/2, 0]);
    if (/horns/.test(ex)) [1, -1].forEach(sd => add(hd, cone(.045, .2, 8), M.horn, sd*.17, .46, -.02, null, [0, 0, -sd*.6]));
    if (/horn1/.test(ex)) add(hd, cone(.045, .26, 10), card.e === "🦄" ? M.gold : M.horn, 0, .47, .12, null, [.5, 0, 0]);
    if (/antlers/.test(ex)) [1, -1].forEach(sd => { add(hd, cyl(.02, .025, .3, 6), this.mat(0x8d6e63), sd*.12, .55, -.03, null, [0, 0, -sd*.4]); add(hd, cyl(.015, .02, .14, 6), this.mat(0x8d6e63), sd*.2, .62, -.03, null, [0, 0, sd*.6]); });
    if (/ossicones/.test(ex)) [1, -1].forEach(sd => { add(hd, cyl(.02, .02, .14, 6), M.fur, sd*.08, .5, -.02); add(hd, sph(.035, 8, 6), this.mat(0x8b5a2b), sd*.08, .58, -.02); });
    if (/tusks/.test(ex)) [1, -1].forEach(sd => add(hd, cone(.025, .14, 8), M.horn, sd*.09, .02, fz + .02, null, [-.4, 0, 0]));
    if (/comb/.test(ex)) [-.06, 0, .06].forEach((z, i) => add(hd, sph(.05, 8, 6), this.mat(0xe03131), 0, .47 + (i === 1 ? .03 : 0), z + .05));
    if (/wattle/.test(ex)) add(hd, sph(.04, 8, 6), this.mat(0xe03131), 0, .0, fz + .02, [1, 1.4, 1]);
    if (/crest/.test(ex)) [-.05, 0, .05].forEach(x => add(hd, cone(.025, .16, 6), this.mat(card.e === "🦚" ? 0x63e6be : 0xffd43b), x, .5, -.02));
    if (/fin/.test(ex)) add(hd, cone(.08, .25, 4), M.fur, 0, .5, -.05, [.4, 1, 1.4]);
    if (/spikes/.test(ex)) for (let i = 0; i < 7; i++){ const a = -1.1 + i*.36; add(hd, cone(.04, .14, 6), card.e === "🦔" ? this.mat(0x5d4037) : M.bel, 0, .2 + Math.cos(a)*.28, -Math.sin(-a)*.0 - .1 - Math.abs(a)*.08, null, [-.5 - a*.3, 0, 0]); }
    if (/antennae/.test(ex)) [1, -1].forEach(sd => { add(hd, cyl(.008, .008, .25, 4), M.black, sd*.07, .55, .05, null, [.3, 0, -sd*.3]); add(hd, sph(.025, 6, 6), M.black, sd*.12, .67, .09); });
    if (/beard/.test(ex)) add(hd, cone(.06, .14, 8), M.bel, 0, -.04, fz - .04, null, [Math.PI, 0, 0]);
    if (/wool/.test(ex)) for (let i = 0; i < 6; i++){ const a = i/6*Math.PI*2; add(hd, sph(.09, 8, 6), this.mat(0xf8f9fa, {roughness: 1}), Math.cos(a)*.15, .42, Math.sin(a)*.1 - .04); }
    if (/band/.test(ex)) add(hd, new T.TorusGeometry(.27, .025, 6, 24), M.gold, 0, .32, 0, null, [Math.PI/2, 0, 0]);
    if (/eggshell/.test(ex)) add(hip, sph(.24, 14, 8, 0, Math.PI*2, Math.PI/2, Math.PI/2), this.mat(0xfff9db), 0, .05, 0);
    // 모자 (귀·뿔이 있으면 조금 뒤로)
    if (!opt.nocap){ const capG = new T.Group(); capG.position.set(0, .3, -.02); hd.add(capG);
      add(capG, new T.SphereGeometry(.27*big, 18, 10, 0, Math.PI*2, 0, Math.PI/2), M.cap, 0, .08, -.02, [1, .7, 1]);
      add(capG, cyl(.2, .2, .02, 20, 1), M.cap, 0, .08, .2, [1, 1, .9]);
      add(capG, sph(.03, 6, 6), M.cap, 0, .27, -.02); }
    // 꼬리
    if (/tailbushy/.test(ex)) add(hip, cap(.12, .3), M.fur, 0, .2, -.28, null, [-.6, 0, 0]);
    if (/tailring/.test(ex)) add(hip, cap(.07, .3), this.mat(0x495057), 0, .05, -.3, null, [-1, 0, 0]);
    if (/tailflat/.test(ex)) add(hip, new T.BoxGeometry(.18, .04, .3), this.mat(0x5d4037), 0, -.12, -.3, null, [-.5, 0, 0]);
    G.userData = {J, ph: 0, card: card.id};
    G.traverse(o => { if (o.isMesh){ o.castShadow = true; } });
    return G;
  },
  /* ---------- 🤸 자세 ---------- */
  L: (a, b, t) => a + (b - a)*t,
  lerpPose(A, B, t){ const o = {}; for (const k in A){ const a = A[k], b = B[k] ?? a; o[k] = Array.isArray(a) ? a.map((v, i) => this.L(v, b[i], t)) : this.L(a, b, t); } return o; },
  keys(K, t){ if (t <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (t <= K[i][0]){ const [t0, a] = K[i - 1], [t1, b] = K[i], u = (t - t0)/(t1 - t0); return this.lerpPose(a, b, u*u*(3 - 2*u)); } return K[K.length - 1][1]; },
  /* 자세: y(앉기) hy(허리 돌기) sy·sx·sz(몸통) lL·lR([앞뒤, 옆]) kL·kR(무릎) hL·hR(손 자리, 몸통 기준) bat([x,y,z] 방망이 돌림) hx·hyw(고개) */
  P0: {y: 0, hy: 0, sy: 0, sx: 0, sz: 0, lL: [0, 0], lR: [0, 0], kL: 0, kR: 0, hL: [.18, .12, .25], hR: [-.18, .12, .25], bat: [0, 0, 0], hx: 0, hyw: 0, rx: 0},
  pose(name, t){
    const P = this.P0, Q = (o) => Object.assign({}, P, o);
    if (name === "stance"){ const b = Math.sin(t*6)*.02;
      return Q({y: -.05, lL: [-.15, .18], lR: [.1, -.18], kL: .3, kR: .35, sx: .2, hy: 0, sy: -.15, hL: [-.08, .42 + b, .18], hR: [-.14, .4 + b, .16], bat: [.6, 0, .55], hyw: 1.2, hx: .1}); }
    if (name === "swing"){
      const S0 = Q({y: -.05, lL: [-.15, .18], lR: [.1, -.18], kL: .3, kR: .35, sx: .2, sy: -.15, hL: [-.08, .42, .18], hR: [-.14, .4, .16], bat: [.6, 0, .55], hyw: 1.2, hx: .1});
      const S1 = Q({y: -.08, lL: [-.45, .3], lR: [.15, -.2], kL: .35, kR: .45, sx: .25, sy: -.45, hy: -.15, hL: [-.12, .44, .1], hR: [-.2, .42, .06], bat: [.9, 0, .7], hyw: 1.4, hx: .1});
      const S2 = Q({y: -.12, lL: [-.25, .35], lR: [.3, -.25], kL: .15, kR: .6, sx: .3, sy: .55, hy: .55, hL: [.1, .2, .42], hR: [.02, .2, .38], bat: [1.55, 0, 1.55], hyw: .6, hx: .2});
      const S3 = Q({y: -.06, lL: [-.2, .35], lR: [.25, -.1], kL: .1, kR: .5, sx: .15, sy: 1.25, hy: .9, hL: [.22, .48, .12], hR: [.16, .5, .1], bat: [1.4, 0, 2.9], hyw: .2, hx: 0});
      return this.keys([[0, S0], [.3, S1], [.52, S2], [1, S3]], t); }
    if (name === "pitch"){   // 0 셋 · .5 다리 들기 · .78 내딛기 · .9 놓기 · 1 따라가기
      const A = Q({hL: [.08, .3, .3], hR: [-.02, .3, .32], hyw: 0});
      const B = Q({lL: [-1.3, .1], kL: 1.6, kR: .1, sy: -.8, hy: -.4, hL: [.06, .32, .26], hR: [0, .3, .28], hyw: .6, y: .02});
      const C = Q({lL: [-.7, .3], lR: [.5, -.1], kL: .5, kR: .4, sy: -.5, hy: -.3, sx: .1, hL: [.45, .45, .25], hR: [-.5, .55, -.35], y: -.12, hyw: .5});
      const D = Q({lL: [-.55, .25], lR: [.7, -.05], kL: .4, kR: .7, sy: .6, hy: .4, sx: .55, hL: [.35, .2, .05], hR: [-.05, .7, .55], y: -.2, hyw: 0});
      const E = Q({lL: [-.4, .2], lR: [.2, -.3], kL: .5, kR: .3, sy: .9, hy: .6, sx: .75, hL: [.3, .05, 0], hR: [.35, -.05, .35], y: -.22, hyw: -.2});
      return this.keys([[0, A], [.5, B], [.78, C], [.9, D], [1, E]], t); }
    if (name === "run"){ const s = Math.sin(t), c = Math.cos(t);
      return Q({y: Math.abs(c)*.06 - .04, lL: [-s*.9, 0], lR: [s*.9, 0], kL: .4 + Math.max(0, s)*1.1, kR: .4 + Math.max(0, -s)*1.1, sx: .3, hL: [.2, .1 + s*.12, .12 + s*.22], hR: [-.2, .1 - s*.12, .12 - s*.22], hx: -.2}); }
    if (name === "ready"){ const b = Math.sin(t*3)*.015;
      return Q({y: -.12 + b, lL: [-.35, .25], lR: [-.35, -.25], kL: .7, kR: .7, sx: .45, hL: [.16, -.05, .38], hR: [-.16, -.05, .38], hx: -.35}); }
    if (name === "idle"){ const b = Math.sin(t*2)*.01; return Q({y: b, lL: [0, .08], lR: [0, -.08], hL: [.26, .02, .08], hR: [-.26, .02, .08]}); }
    if (name === "crouch") return Q({y: -.36, lL: [-1.3, .45], lR: [-1.3, -.45], kL: 2, kR: 2, sx: .2, hL: [.18, .2, .42], hR: [-.15, .05, .3], hx: -.1});
    if (name === "throw"){ const u = Math.min(1, t);
      return this.keys([[0, Q({lL: [-.4, .2], kL: .4, kR: .3, hR: [-.4, .55, -.25], hL: [.3, .35, .3], sy: -.5})], [1, Q({lL: [-.5, .2], lR: [.4, 0], kL: .4, kR: .5, sx: .4, sy: .6, hR: [.2, .1, .5], hL: [.3, .05, .1]})]], u); }
    if (name === "catch") return Q({y: -.05, lL: [-.2, .2], lR: [.1, -.2], kL: .3, kR: .3, hL: [.12, .7, .32], hR: [-.12, .6, .3], hx: .4});
    if (name === "dive") return Q({y: -.35, rx: 1.25, lL: [.3, .2], lR: [.5, -.2], kL: .3, kR: .5, hL: [.2, .75, .25], hR: [-.15, .7, .2], hx: -1});
    if (name === "cheer"){ const b = Math.abs(Math.sin(t*8))*.12; return Q({y: b, hL: [.25, .75, .1], hR: [-.25, .75, .1], hx: .3}); }
    return P;
  },
  applyPose(G, p){
    const J = G.userData.J, T = this.T;
    J.root.position.y = p.y; J.root.rotation.x = p.rx; J.hip.rotation.y = p.hy;
    J.spine.rotation.set(p.sx, p.sy - p.hy*.0, p.sz);
    J.legL.rotation.set(p.lL[0], 0, p.lL[1]*.6); J.legR.rotation.set(p.lR[0], 0, p.lR[1]*.6); J.kneeL.rotation.x = p.kL; J.kneeR.rotation.x = p.kR;
    J.head.rotation.set(p.hx, p.hyw, 0);
    J.hL.position.set(...p.hL); J.hR.position.set(...p.hR);
    if (J.bat) J.bat.rotation.set(p.bat[0], p.bat[1], p.bat[2]);
    // 방망이를 두 손으로: 왼손은 방망이 손잡이 위쪽으로
    G.updateMatrixWorld(true);
    if (J.bat){ const w = new T.Vector3(0, .13, 0); J.bat.localToWorld(w); J.spine.worldToLocal(w); J.hL.position.copy(w); G.updateMatrixWorld(true); }
    // 팔: 어깨에서 손을 바라봐요
    [["shL", "armL", "hL"], ["shR", "armR", "hR"]].forEach(([s, a, h]) => { const tgt = new T.Vector3(); J[h].getWorldPosition(tgt); const arm = J[a];
      const o = new T.Vector3(); J[s].getWorldPosition(o); const d = o.distanceTo(tgt); arm.lookAt(tgt); arm.scale.z = Math.max(.35, Math.min(1.3, d/.36)); });
  },

  /* ---------- 🎬 한 장면 그리기 ----------
     o = {cam: {p, t, fov, cy}, chars: [{key, card, team, x, z, fx, fz, pose, t, alpha, glove, bat, hide}], ball, trail, board, W, H, k} */
  frame(o){
    const T = this.T, R = this.R, S = this.S, W = o.W, H = o.H;
    const q = this.slow > 40 ? .7 : Math.min(1.5, Math.max(.75, o.k || 1)), w = Math.round(W*q), h = Math.round(H*q);
    if (this._w !== w || this._h !== h){ R.setSize(w, h, false); this._w = w; this._h = h; }
    const C = this.cam; C.fov = o.cam.fov; C.aspect = W/H; C.position.copy(this.V3(...o.cam.p)); C.lookAt(this.V3(...o.cam.t));
    C.setViewOffset(W, H, 0, H/2 - o.cam.cy, W, H); C.updateProjectionMatrix();
    // 그림자는 보고 있는 곳 둘레만
    const fc = o.shadowAt || o.cam.t; this.key.target.position.copy(this.V3(fc[0], 0, fc[2])); this.key.position.copy(this.V3(fc[0] - 30*-1, 60, fc[2] - 45));
    const sc = this.key.shadow.camera, ext = o.shadowR || 18; if (sc.right !== ext){ sc.left = sc.bottom = -ext; sc.right = sc.top = ext; sc.updateProjectionMatrix(); }
    // 선수
    const seen = new Set();
    (o.chars || []).forEach(c => {
      const key = c.key; let G = this.CH.get(key);
      if (!G){ G = this.makeChar(c.card, c.team, {glove: c.glove, bat: c.bat}); this.CH.set(key, G); S.add(G); }
      seen.add(key); G.visible = !c.hide; if (c.hide) return;
      G.position.copy(this.V3(c.x, c.y || 0, c.z)); G.scale.set(c.L ? -1 : 1, 1, 1); G.scale.multiplyScalar(c.s || 1);
      G.lookAt(this.V3(c.fx, (c.y || 0), c.fz));
      if (c.L){ G.rotateY(0); }
      this.applyPose(G, this.pose(c.pose, c.t || 0));
      if (c.alpha != null && c.alpha < 1){ G.traverse(m => { if (m.isMesh){ m.material = m.material.clone(); m.material.transparent = true; m.material.opacity = c.alpha; } }); G.userData.faded = 1; }
    });
    this.CH.forEach((G, k) => { if (!seen.has(k)) G.visible = false; });
    // 공
    if (o.ball){ this.ball.visible = this.bshadow.visible = true; this.ball.position.copy(this.V3(...o.ball)); this.ball.rotation.x += .4; this.bshadow.position.copy(this.V3(o.ball[0], .02, o.ball[2])); }
    else this.ball.visible = this.bshadow.visible = false;
    this.trail.forEach((m, i) => { const p = o.trail && o.trail[i]; m.visible = !!p; if (p) m.position.copy(this.V3(...p)); });
    if (o.board) this.board(o.board);
    const t0 = performance.now(); R.render(S, C); const dt = performance.now() - t0; this.slow = dt > 22 ? this.slow + 1 : Math.max(0, this.slow - 1);
    if (this.slow > 240 && window.NG){ NG.no3d = true; console.warn("[3D 야구] 기기가 느려서 예전 그림으로 바꿔요"); }   // 너무 느린 기기는 예전 그림으로
    return R.domElement;
  },
  /* 새 경기: 지난 경기 선수는 치워요 */
  reset(){ if (!this.S) return; this.CH.forEach(G => { this.S.remove(G); G.traverse(o => { if (o.isMesh) o.geometry.dispose(); }); }); this.CH.clear(); this.sbKey = ""; },
  /* 3D 점 → 화면 (이름표·표시용) */
  project(x, y, z, W, H){ const v = this.V3(x, y, z).project(this.cam); if (v.z > 1) return null; return [(v.x + 1)/2*W, (1 - v.y)/2*H]; },
  /* 지난 장면에서 쓴 흐린 재료는 다시 진하게 */
  unfade(){ this.CH.forEach((G, k) => { if (G.userData.faded){ this.S.remove(G); this.CH.delete(k); } }); },

  /* ---------- 🖼️ 카드 그림 (3D로 한 번 찍어 두기) ---------- */
  portrait(card, teamCol = 0x4c6ef5, size = 256){
    const k = card.id + "|" + teamCol + "|" + size; if (this.PORT.has(k)) return this.PORT.get(k); if (this.st !== 2) return null;
    const T = this.T, R = this.R;
    if (!this.pS){ const S = this.pS = new T.Scene(); S.add(new T.HemisphereLight(0xffffff, 0x445066, 1.6)); const d = new T.DirectionalLight(0xffffff, 2.2); d.position.set(1.5, 3, 4); S.add(d);
      const r = new T.DirectionalLight(0xb4c8ff, 1.2); r.position.set(-3, 2, -2); S.add(r); this.pC = new T.PerspectiveCamera(26, 1, .1, 20); this.pRT = new T.WebGLRenderTarget(size, size, {samples: 4}); }
    const G = this.makeChar(card, teamCol, {glove: card.pos !== "P" && false, bat: card.pos !== "P"}); this.pS.add(G);
    this.applyPose(G, card.pos === "P" ? Object.assign({}, this.P0, {hL: [.2, .3, .3], hR: [-.12, .3, .32], hyw: .2}) : Object.assign(this.pose("stance", 0), {hyw: -.35, hx: 0, sx: .05, y: 0}));
    G.rotation.y = card.pos === "P" ? -.35 : .45;
    this.pC.position.set(0, 1.55, 2.75); this.pC.lookAt(0, 1.28, 0);
    if (this.pRT.width !== size) this.pRT.setSize(size, size);
    const prev = R.getRenderTarget(); R.setRenderTarget(this.pRT); R.setClearColor(0x000000, 0); R.clear(); R.render(this.pS, this.pC); R.setRenderTarget(prev);
    const px = new Uint8Array(size*size*4); R.readRenderTargetPixels(this.pRT, 0, 0, size, size, px);
    const c = document.createElement("canvas"); c.width = c.height = size; const g = c.getContext("2d"), im = g.createImageData(size, size);
    for (let y = 0; y < size; y++) im.data.set(px.subarray((size - 1 - y)*size*4, (size - y)*size*4), y*size*4);
    g.putImageData(im, 0, 0); this.pS.remove(G); G.traverse(o => { if (o.isMesh && o.geometry) o.geometry.dispose(); });
    this.PORT.set(k, c); return c;
  }
};
window.BB3D = BB3D;
