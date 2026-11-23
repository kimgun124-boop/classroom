/* =====================================================================
   🧊 3D 체스 (2026.11.23) — three.js로 진짜 입체 체스판·말을 그려요
   - three.js는 체스를 처음 열 때만 lib/three/에서 불러와요 (보드게임 첫 화면은 가벼운 그대로)
   - 불러오지 못하거나 WebGL이 안 되는 기기는 예전 2D 체스로 저절로 돌아가요
   - 화면은 바뀐 게 있을 때(말 움직임·고르기)만 다시 그려요 → 렉 없이
   - 칸 좌표: i = 줄(위 검은색 쪽 0 ~ 아래 흰색 쪽 7)*8 + 칸(a~h) · 칸 하나 = 1 · 판 가운데가 (0, 0)
   ===================================================================== */
const CH3D = {
  st: 0,   // 0 아직 · 1 불러오는 중 · 2 준비됨 · -1 안 됨(2D로)
  T: null, R: null, scene: null, cam: null, flip: null, pool: {}, used: {}, hl: [], onReady: [],
  load(cb){
    if (this.st === 2){ cb && cb(); return; } if (cb) this.onReady.push(cb); if (this.st) return; this.st = 1;
    try { const c = document.createElement("canvas"); if (!(c.getContext("webgl2") || c.getContext("webgl"))) throw new Error("no webgl"); } catch(e){ this.st = -1; return; }
    Promise.all([import("./lib/three/three.module.min.js"), import("./lib/three/RoomEnvironment.js")]).then(([T, RE]) => {
      this.T = T; this.build(RE.RoomEnvironment); this.st = 2; const L = this.onReady; this.onReady = []; L.forEach(f => { try { f(); } catch(e){} });
    }).catch(e => { console.warn("[3D 체스]", e); this.st = -1; const L = this.onReady; this.onReady = []; L.forEach(f => { try { f(); } catch(e){} }); });
  },
  /* ---------- 장면: 조명 · 판 · 말 모양 ---------- */
  build(RoomEnvironment){
    const T = this.T;
    const R = this.R = new T.WebGLRenderer({antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: false});
    R.setPixelRatio(1); R.outputColorSpace = T.SRGBColorSpace; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
    R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap; R.setClearColor(0x000000, 0);
    const S = this.scene = new T.Scene();
    const pm = new T.PMREMGenerator(R); S.environment = pm.fromScene(new RoomEnvironment(), .04).texture; S.environmentIntensity = .55;
    const key = new T.DirectionalLight(0xfff1d6, 2.6); key.position.set(-4.5, 11, 6); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = key.shadow.camera.bottom = -6.5; key.shadow.camera.right = key.shadow.camera.top = 6.5; key.shadow.camera.near = 2; key.shadow.camera.far = 30; key.shadow.bias = -.0004; key.shadow.normalBias = .02; key.shadow.radius = 4;
    S.add(key); const rim = new T.DirectionalLight(0xb4c8ff, .9); rim.position.set(5, 6, -7); S.add(rim);
    S.add(new T.HemisphereLight(0xfff4e0, 0x2a1d4a, .35));
    this.cam = new T.PerspectiveCamera(30, 1, .1, 100);
    /* 🪵 판: 나뭇결 무늬 칸 + 테두리 글자 (캔버스로 그린 그림) */
    const top = new T.MeshPhysicalMaterial({map: this.boardTex(), roughness: .42, clearcoat: .55, clearcoatRoughness: .25});
    const side = new T.MeshPhysicalMaterial({color: 0x3a2312, roughness: .5, clearcoat: .4});
    const BW = 9.3, board = new T.Mesh(new T.BoxGeometry(BW, .42, BW), [side, side, top, side, side, side]);
    board.position.y = -.21; board.receiveShadow = true; board.castShadow = true; S.add(board);
    const foot = new T.Mesh(new T.BoxGeometry(BW + .3, .14, BW + .3), side); foot.position.y = -.47; foot.receiveShadow = true; S.add(foot);
    const sh = new T.Mesh(new T.PlaneGeometry(40, 40), new T.ShadowMaterial({opacity: .35})); sh.rotation.x = -Math.PI/2; sh.position.y = -.54; sh.receiveShadow = true; S.add(sh);
    /* ♟️ 말 재료: 상아빛 흰색 · 윤나는 검은색 · 금 장식 */
    this.mat = [new T.MeshPhysicalMaterial({color: 0xf4ead6, roughness: .3, clearcoat: .8, clearcoatRoughness: .12, sheen: .3, sheenColor: 0xffffff}),
                new T.MeshPhysicalMaterial({color: 0x24202c, roughness: .26, clearcoat: 1, clearcoatRoughness: .08, metalness: .08})];
    this.gold = new T.MeshPhysicalMaterial({color: 0xe0b44c, metalness: 1, roughness: .22, clearcoat: .5});
    this.felt = new T.MeshStandardMaterial({color: 0x1f5e3a, roughness: .9});
    this.geo = this.makeGeo();
    /* ✨ 표시(고른 칸·갈 수 있는 칸·마지막 수·체크) */
    this.hlM = {sel: new T.MeshBasicMaterial({color: 0x51cf66, transparent: true, opacity: .55, depthWrite: false}),
      last: new T.MeshBasicMaterial({color: 0xffd43b, transparent: true, opacity: .42, depthWrite: false}),
      dot: new T.MeshBasicMaterial({color: 0x2f9e44, transparent: true, opacity: .85, depthWrite: false}),
      ring: new T.MeshBasicMaterial({color: 0x51cf66, transparent: true, opacity: .9, depthWrite: false}),
      chk: new T.MeshBasicMaterial({map: this.glowTex(), color: 0xff3b3b, transparent: true, depthWrite: false, blending: T.AdditiveBlending})};
    this.hlG = {sq: new T.PlaneGeometry(.98, .98), dot: new T.CircleGeometry(.15, 32), ring: new T.RingGeometry(.36, .45, 48), chk: new T.PlaneGeometry(1.5, 1.5)};
    this.ray = new T.Raycaster();
  },
  boardTex(){
    const T = this.T, N = 1024, c = document.createElement("canvas"); c.width = c.height = N; const x = c.getContext("2d");
    const BW = 9.3, u = N/BW, o = (BW - 8)/2*u;   // 칸 하나 크기 · 테두리
    const grain = (X, Y, w, h, base, dark, n, seed) => { x.fillStyle = base; x.fillRect(X, Y, w, h); let s = seed;
      const rnd = () => (s = (s*16807) % 2147483647)/2147483647;
      x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip();
      for (let k = 0; k < n; k++){ const yy = Y + rnd()*h, a = .05 + rnd()*.12; x.strokeStyle = `rgba(${dark},${a})`; x.lineWidth = .6 + rnd()*2.2; x.beginPath(); x.moveTo(X - 5, yy);
        for (let t = 0; t <= 1.01; t += .1) x.lineTo(X + t*w, yy + Math.sin(t*6 + k)*h*.02 + (rnd() - .5)*1.5); x.stroke(); }
      const gr = x.createLinearGradient(X, Y, X + w, Y + h); gr.addColorStop(0, "rgba(255,255,255,.06)"); gr.addColorStop(1, "rgba(0,0,0,.08)"); x.fillStyle = gr; x.fillRect(X, Y, w, h); x.restore(); };
    grain(0, 0, N, N, "#4a2c17", "20,10,4", 260, 7);
    x.strokeStyle = "rgba(224,180,76,.9)"; x.lineWidth = 5; x.strokeRect(o - 9, o - 9, 8*u + 18, 8*u + 18);
    for (let r = 0; r < 8; r++) for (let q = 0; q < 8; q++){ const lt = (r + q) % 2 === 0;
      grain(o + q*u, o + r*u, u + 1, u + 1, lt ? "#ecd5ae" : "#9a6239", lt ? "120,80,40" : "50,25,10", 16, 31 + r*8 + q); }
    x.fillStyle = "#f3d48a"; x.font = `bold ${Math.round(u*.32)}px "Jua",sans-serif`; x.textAlign = "center"; x.textBaseline = "middle";
    for (let k = 0; k < 8; k++){ x.fillText("abcdefgh"[k], o + (k + .5)*u, N - o/2); x.fillText("abcdefgh"[k], o + (k + .5)*u, o/2); x.fillText(String(8 - k), o/2, o + (k + .5)*u); x.fillText(String(8 - k), N - o/2, o + (k + .5)*u); }
    const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; return t;
  },
  glowTex(){ const T = this.T, c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.5, "rgba(255,255,255,.45)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new T.CanvasTexture(c); },
  /* 말 모양: 돌림판(선반)으로 깎은 몸통 + 장식 */
  makeGeo(){
    const T = this.T, V = (a, b) => new T.Vector2(a, b), lathe = P => new T.LatheGeometry(P, 48);
    const base = [V(0, 0), V(.37, 0), V(.38, .035), V(.355, .075), V(.37, .1), V(.34, .13), V(.29, .15)];
    const arc = (cx, cy, rx, ry, a0, a1, n = 10) => { const L = []; for (let k = 0; k <= n; k++){ const a = a0 + (a1 - a0)*k/n; L.push(V(Math.max(0, cx + Math.cos(a)*rx), cy + Math.sin(a)*ry)); } return L; };
    const G = {};
    G.p = [[lathe([...base, V(.25, .18), V(.18, .24), V(.135, .42), V(.21, .455), V(.215, .48), V(.12, .51), ...arc(0, .64, .155, .155, -Math.PI/2 + .45, Math.PI/2)]), "b"]];
    G.r = [[lathe([...base, V(.29, .2), V(.235, .26), V(.215, .62), V(.28, .66), V(.285, .7), V(.27, .73), V(.27, .88), V(.2, .88), V(.2, .8), V(0, .8)]), "b"]];
    for (let k = 0; k < 6; k++){ const a = k/6*Math.PI*2, m = new T.BoxGeometry(.13, .1, .085); m.translate(0, .915, .228); m.rotateY(a); G.r.push([m, "b"]); }
    G.b = [[lathe([...base, V(.25, .19), V(.17, .27), V(.12, .52), V(.215, .57), V(.22, .6), V(.13, .63), ...arc(0, .81, .165, .21, -Math.PI/2 + .25, Math.PI/2 - .2)]), "b"],
           [new T.SphereGeometry(.055, 20, 14).translate(0, 1.05, 0), "g"]];
    G.b.push([new T.TorusGeometry(.2, .018, 10, 48).rotateX(Math.PI/2).translate(0, .585, 0), "g"]);   // 금 목걸이
    G.q = [[lathe([...base, V(.27, .2), V(.19, .28), V(.13, .66), V(.25, .72), V(.255, .755), V(.15, .79), V(.17, .95), V(.25, 1.03), V(.24, 1.05), V(.16, 1.04), ...arc(0, 1.04, .16, .1, 0, Math.PI/2)]), "b"],
           [new T.SphereGeometry(.065, 20, 14).translate(0, 1.2, 0), "g"], [new T.TorusGeometry(.235, .02, 10, 48).rotateX(Math.PI/2).translate(0, .74, 0), "g"]];
    for (let k = 0; k < 9; k++){ const a = k/9*Math.PI*2; G.q.push([new T.SphereGeometry(.042, 12, 10).translate(Math.cos(a)*.235, 1.07, Math.sin(a)*.235), "g"]); }
    G.k = [[lathe([...base, V(.28, .2), V(.2, .29), V(.14, .72), V(.26, .78), V(.265, .815), V(.16, .85), V(.19, 1.02), V(.25, 1.07), V(.25, 1.1), V(.15, 1.1), ...arc(0, 1.1, .15, .07, 0, Math.PI/2)]), "b"],
           [new T.BoxGeometry(.075, .3, .075).translate(0, 1.33, 0), "g"], [new T.BoxGeometry(.22, .075, .075).translate(0, 1.37, 0), "g"],
           [new T.TorusGeometry(.245, .02, 10, 48).rotateX(Math.PI/2).translate(0, .8, 0), "g"]];
    /* 🐴 나이트: 받침 + 말 머리(옆모습을 두껍게 뽑아내기) — 얼굴이 +x 쪽 */
    const h = new T.Shape(); h.moveTo(-.24, .24); h.lineTo(.2, .24); h.quadraticCurveTo(.12, .36, .2, .46); h.quadraticCurveTo(.3, .52, .37, .6);
    h.quadraticCurveTo(.4, .68, .33, .72); h.quadraticCurveTo(.22, .76, .14, .84); h.lineTo(.12, .97); h.lineTo(.04, .9); h.quadraticCurveTo(-.06, .95, -.14, .88);
    h.quadraticCurveTo(-.27, .72, -.26, .5); h.quadraticCurveTo(-.25, .36, -.24, .24);
    const hg = new T.ExtrudeGeometry(h, {depth: .2, bevelEnabled: true, bevelThickness: .05, bevelSize: .045, bevelSegments: 4, curveSegments: 14}); hg.translate(0, 0, -.1);
    const mn = new T.Shape(); mn.moveTo(.06, .92); mn.quadraticCurveTo(-.1, .93, -.2, .8); mn.quadraticCurveTo(-.3, .62, -.27, .4); mn.lineTo(-.22, .4); mn.quadraticCurveTo(-.25, .62, -.15, .79); mn.quadraticCurveTo(-.06, .88, .06, .88);
    const mg = new T.ExtrudeGeometry(mn, {depth: .08, bevelEnabled: true, bevelThickness: .03, bevelSize: .03, bevelSegments: 3, curveSegments: 12}); mg.translate(-.02, 0, -.04);
    G.n = [[mg, "b"], [lathe([...base, V(.29, .19), V(.27, .26), V(0, .26)]), "b"], [hg, "b"],
           [new T.SphereGeometry(.032, 12, 10).translate(.2, .74, .125), "e"], [new T.SphereGeometry(.032, 12, 10).translate(.2, .74, -.125), "e"]];
    return G;
  },
  piece(t, s){   // 같은 말은 꺼내 쓰기 (매번 새로 만들지 않아요)
    const k = t + s, P = this.pool[k] || (this.pool[k] = []), n = this.used[k] || 0; this.used[k] = n + 1;
    if (P[n]){ P[n].visible = true; return P[n]; }
    const T = this.T, g = new T.Group(); this.geo[t].forEach(([geo, m]) => { if (m === "x") return;
      const mesh = new T.Mesh(geo, m === "g" ? this.gold : m === "e" ? this.mat[1 - s] : this.mat[s]); mesh.castShadow = true; mesh.receiveShadow = true; g.add(mesh); });
    const felt = new T.Mesh(new T.CylinderGeometry(.33, .33, .012, 32), this.felt); felt.position.y = .004; g.add(felt);
    this.scene.add(g); P.push(g); return g;
  },
  hlAdd(kind, i, y = .006){ const T = this.T; let m = this.hl.find(o => !o.visible && o.userData.k === kind);
    if (!m){ m = new T.Mesh(kind === "sel" || kind === "last" ? this.hlG.sq : this.hlG[kind], this.hlM[kind]); m.rotation.x = -Math.PI/2; m.userData.k = kind; m.renderOrder = 2; this.scene.add(m); this.hl.push(m); }
    m.visible = true; m.position.set((i & 7) - 3.5, y, (i >> 3) - 3.5); return m; },
  /* ---------- 그리기: S = {b, sel, tgts, last, chk, ep, anim} ---------- */
  draw(g, B, flip, S, k){
    const T = this.T, R = this.R, w = Math.max(64, Math.round(B.w*k)), h = Math.max(64, Math.round(B.h*k));
    /* ⚡ (2026.11.23) 바뀐 게 없으면 3D를 다시 그리지 않고 지난 그림을 붙여요 — 태블릿 렉의 가장 큰 원인이었어요 (그림자·계단 없애기가 매 장면 돌았음) */
    const now0 = performance.now(), A0 = S.anim, mov = A0 && (performance.now() - A0.t0) < A0.dur, sig = [S.b.join(""), S.sel, S.tgts.join(","), S.last ? S.last.f + "-" + S.last.t : "", S.chk, S.epT, flip, w, h, mov ? "m" + now0 : ""].join("|");
    const pulse = S.chk >= 0 && (this.pT = (this.pT || 0) + 1) % 4 === 0;   // 장군 깜빡임은 4장면에 한 번만
    if (!mov && !pulse && sig === this.sig && this.cache){ g.drawImage(this.cache, B.x, B.y, B.w, B.h); return false; }
    this.sig = sig;
    if (R.domElement.width !== w || R.domElement.height !== h){ R.setSize(w, h, false); this.cam.aspect = w/h; this.cam.updateProjectionMatrix(); }
    if (this.flip !== flip){ this.flip = flip; const z = flip ? -1 : 1; this.cam.position.set(0, 13.4, 10.6*z); this.cam.lookAt(0, -.7, .7*z); }
    Object.values(this.pool).forEach(P => P.forEach(o => o.visible = false)); this.used = {}; this.hl.forEach(o => o.visible = false);
    const low = p => p.toLowerCase(), side = p => p === p.toUpperCase() ? 0 : 1, at = i => [(i & 7) - 3.5, (i >> 3) - 3.5];
    const A = S.anim, now = performance.now(), u = A ? Math.min(1, (now - A.t0)/A.dur) : 1, e = u < .5 ? 2*u*u : 1 - Math.pow(-2*u + 2, 2)/2;
    const put = (p, i, x, y, z) => { const o = this.piece(low(p), side(p)); o.position.set(x, y, z); o.rotation.y = low(p) === "n" ? (side(p) ? Math.PI - .5 : .5)*(this.flip ? -1 : 1) + (this.flip ? Math.PI : 0) : 0; /* 🐴 옆모습이 보이게 */ o.scale.setScalar(1); o.userData.sq = i; return o; };
    for (let i = 0; i < 64; i++){ const p = S.b[i]; if (!p) continue;
      if (A && u < 1 && (i === A.t || (A.rf != null && i === A.rt))){
        const f = i === A.t ? A.f : A.rf, pp = i === A.t ? A.p : p, [x0, z0] = at(f), [x1, z1] = at(i), hop = low(pp) === "n" ? .9 : .28;
        put(pp, i, x0 + (x1 - x0)*e, Math.sin(Math.PI*u)*hop, z0 + (z1 - z0)*e); continue; }
      const [x, z] = at(i), o = put(p, i, x, i === S.sel ? .18 : 0, z); }
    if (A && u < 1 && A.c){ const [x, z] = at(A.cs), o = put(A.c, A.cs, x, 0, z); const q = Math.max(0, (u - .45)/.55); o.scale.setScalar(1 - q*.9); o.position.y = -q*.3; o.rotation.z = q*.8; }
    if (S.last){ this.hlAdd("last", S.last.f); this.hlAdd("last", S.last.t); }
    if (S.sel >= 0) this.hlAdd("sel", S.sel, .008);
    if (S.chk >= 0){ const m = this.hlAdd("chk", S.chk, .012); m.material.opacity = .75 + Math.sin(now/180)*.25; }
    S.tgts.forEach(i => this.hlAdd(S.b[i] || i === S.epT ? "ring" : "dot", i, .01));
    R.render(this.scene, this.cam);
    const cc = this.cache || (this.cache = document.createElement("canvas")); if (cc.width !== w || cc.height !== h){ cc.width = w; cc.height = h; }
    const cx2 = cc.getContext("2d"); cx2.clearRect(0, 0, w, h); cx2.drawImage(R.domElement, 0, 0);
    g.drawImage(cc, B.x, B.y, B.w, B.h);
    return u < 1;
  },
  /* 눌린 곳 → 칸 번호 (말을 눌러도, 칸을 눌러도 돼요) */
  pick(x, y, B){
    if (this.st !== 2) return -1; const T = this.T, nd = new T.Vector2((x - B.x)/B.w*2 - 1, -((y - B.y)/B.h*2 - 1));
    if (Math.abs(nd.x) > 1.05 || Math.abs(nd.y) > 1.05) return -1;
    this.ray.setFromCamera(nd, this.cam);
    const ps = []; Object.values(this.pool).forEach(P => P.forEach(o => { if (o.visible) ps.push(o); }));
    const hit = this.ray.intersectObjects(ps, true)[0]; if (hit){ let o = hit.object; while (o && o.userData.sq == null) o = o.parent; if (o) return o.userData.sq; }
    const pt = new T.Vector3(); if (!this.ray.ray.intersectPlane(new T.Plane(new T.Vector3(0, 1, 0), 0), pt)) return -1;
    const C = Math.floor(pt.x + 4), Rr = Math.floor(pt.z + 4); return C < 0 || Rr < 0 || C > 7 || Rr > 7 ? -1 : Rr*8 + C;
  }
};
