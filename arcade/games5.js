/* =====================================================================
   🛡️ 용사 대모험 — 최대 4명이 힘을 합쳐 스테이지를 깨는 벨트 스크롤 액션
   - 한 기기: 나 혼자(+🤖 동료) 또는 둘이(키보드) · 🌐 온라인 방: 각자 기기로 4명 (PARTY)
   - 4 스테이지: 🌲 고블린 숲 · 🔥 불타는 요새 · ❄️ 얼음 동굴 · 🐉 용의 둥지 (스테이지마다 보스)
   - 그림은 모두 코드로 그린 도트 그림이에요 (한 번 그려 기억해 붙여요)
   ===================================================================== */
const QD = (() => {
  /* ---------- 도트 그림 도구 ---------- */
  const OUT = "#1b1230";
  function tiny(w, h){ const c = document.createElement("canvas"); c.width = w; c.height = h; const t = c.getContext("2d"); t.imageSmoothingEnabled = false; return [c, t]; }
  const R = (t, x, y, w, h, c) => { t.fillStyle = c; t.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  function line(t, x0, y0, x1, y1, c, w = 1){
    t.fillStyle = c; const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let i = 0; i <= n; i++){ const x = x0 + (x1 - x0)*i/n, y = y0 + (y1 - y0)*i/n; t.fillRect(Math.round(x - (w - 1)/2), Math.round(y - (w - 1)/2), w, w); }
  }
  function disc(t, cx, cy, r, c){ t.fillStyle = c; for (let y = -r; y <= r; y++){ const w = Math.floor(Math.sqrt(r*r - y*y + r*.6)); t.fillRect(Math.round(cx - w), Math.round(cy + y), w*2 + 1, 1); } }
  /* 바깥 테두리 (도트 그림 느낌) */
  function outline(c, col = OUT){
    const t = c.getContext("2d"), W = c.width, H = c.height, d = t.getImageData(0, 0, W, H), a = d.data, o = new Uint8Array(W*H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){ if (a[(y*W + x)*4 + 3] > 40) continue;
      if ((x > 0 && a[(y*W + x - 1)*4 + 3] > 40) || (x < W - 1 && a[(y*W + x + 1)*4 + 3] > 40) || (y > 0 && a[((y - 1)*W + x)*4 + 3] > 40) || (y < H - 1 && a[((y + 1)*W + x)*4 + 3] > 40)) o[y*W + x] = 1; }
    t.fillStyle = col; for (let i = 0; i < o.length; i++) if (o[i]) t.fillRect(i % W, (i/W) | 0, 1, 1);
    return c;
  }
  /* ✨ 도트 그림을 부드럽게 키우기 (Scale2x): 계단처럼 각진 대각선을 매끈하게 — 두 번 하면 4배 고운 그림 */
  function scale2x(src){
    const w = src.width, h = src.height, s0 = src.getContext("2d").getImageData(0, 0, w, h), a = new Uint32Array(s0.data.buffer);
    const [c, t] = tiny(w*2, h*2), o = t.createImageData(w*2, h*2), b = new Uint32Array(o.data.buffer), W2 = w*2;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){
      const P = a[y*w + x], A = y > 0 ? a[(y - 1)*w + x] : P, B = x < w - 1 ? a[y*w + x + 1] : P, C = x > 0 ? a[y*w + x - 1] : P, D = y < h - 1 ? a[(y + 1)*w + x] : P, i = y*2*W2 + x*2;
      b[i] = C === A && C !== D && A !== B ? A : P; b[i + 1] = A === B && A !== C && B !== D ? B : P;
      b[i + W2] = D === C && D !== B && C !== A ? C : P; b[i + W2 + 1] = B === D && B !== A && D !== C ? D : P; }
    t.putImageData(o, 0, 0); return c;
  }
  const smooth4 = c => scale2x(scale2x(c));
  /* 기억해 둔 그림 (화면 배율마다) */
  const CACHE = new Map(); let CK = 0;
  function spr(key, gw, gh, px, fn){
    const k = NG.k || 1; if (k !== CK){ CACHE.clear(); CK = k; }
    let c = CACHE.get(key);
    if (!c){
      if (CACHE.size > 900) CACHE.clear();
      const [sc, st] = tiny(gw, gh); fn(st, gw, gh); outline(sc); const big = px*k >= 2.5 ? smooth4(sc) : sc;
      c = document.createElement("canvas"); c.width = Math.max(1, Math.round(gw*px*k)); c.height = Math.max(1, Math.round(gh*px*k));
      const t = c.getContext("2d"); t.imageSmoothingEnabled = false; t.drawImage(big, 0, 0, c.width, c.height);
      c.w = gw*px; c.h = gh*px; CACHE.set(key, c);
    }
    return c;
  }
  const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    if (f < 0){ r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r)*f; g += (255 - g)*f; b += (255 - b)*f; }
    return `rgb(${r | 0},${g | 0},${b | 0})`; };

  /* ---------- 사람 모양 (용사 · 고블린 · 해골 · 예티) ----------
     격자 40×46, 발은 (20,45). o.pose: idle0/1 · walk0~3 · atk0~2 · jump · hurt · cast · spin */
  const GW = 40, GH = 46;
  function human(t, o){
    const P = o.pose, walk = P.startsWith("walk") ? +P[4] : -1, atk = P.startsWith("atk") ? +P[3] : -1;
    const bob = P === "idle1" ? 1 : walk === 1 || walk === 3 ? -1 : 0, lean = P === "hurt" ? -2 : atk === 1 ? 1 : 0;
    const hipY = 34 + bob, x0 = 20 + lean;
    const lg = walk < 0 ? [0, 0] : [[3, -3], [1, -1], [-3, 3], [-1, 1]][walk], lift = walk < 0 ? [0, 0] : [[0, 1], [0, 0], [1, 0], [0, 0]][walk];
    const legC = o.pants, bootC = o.boots, armC = o.armor, armD = shade(o.armor, -.3);
    const sk = o.skin, wide = o.big ? 2 : 0, hx = x0 + 1, hy = hipY - 21;
    if (P === "jump"){ lg[0] = 3; lg[1] = -2; lift[0] = 3; lift[1] = 1; }
    const part = o.part, back = part !== "over", over = part !== "back";
    if (back){
    // 뒷다리
    R(t, x0 - 4 + lg[1], hipY, 4, 10 - lift[1], shade(legC, -.25)); R(t, x0 - 5 + lg[1], hipY + 8 - lift[1], 6, 3, shade(bootC, -.25));
    // 뒷팔
    const sh = [x0 - 5, hipY - 11];
    if (o.weapon === "bow" && atk >= 0) R(t, sh[0] + 6, sh[1] + 1, 8, 3, armD);
    else R(t, sh[0] - 1, sh[1], 3, 9, armD);
    // 몸통
    R(t, x0 - 6 - wide, hipY - 13, 12 + wide*2, 14, armC);
    R(t, x0 - 6 - wide, hipY - 13, 12 + wide*2, 2, shade(armC, .25));
    R(t, x0 - 4 - wide, hipY - 10, 3, 6, shade(armC, .35));
    if (o.robe){ R(t, x0 - 7 - wide, hipY - 2, 14 + wide*2, 9, armC); R(t, x0 - 7 - wide, hipY + 5, 14 + wide*2, 2, shade(armC, -.25)); }
    if (o.belt) R(t, x0 - 6 - wide, hipY - 3, 12 + wide*2, 2, o.belt);
    if (o.cape) R(t, x0 - 9, hipY - 13, 3, 16, o.cape);
    if (o.ribs){ for (let i = 0; i < 4; i++) R(t, x0 - 5, hipY - 11 + i*3, 10, 1, shade(armC, -.35)); }
    // 앞다리
    if (!o.robe){ R(t, x0 + 1 + lg[0], hipY, 4, 10 - lift[0], legC); R(t, x0 + lg[0], hipY + 8 - lift[0], 7, 3, bootC); }
    else { R(t, x0 - 3 + lg[1], hipY + 7, 5, 3, bootC); R(t, x0 + 2 + lg[0], hipY + 7, 5, 3, bootC); }
    // 머리 (얼굴은 아바타를 붙여요 → face:false 이면 도트 얼굴)
    if (o.face !== false){ disc(t, hx, hy, 6, sk); R(t, hx - 1, hy - 1, 2, 3, "#2b1b17"); R(t, hx + 3, hy - 1, 2, 3, "#2b1b17"); R(t, hx, hy + 3, 4, 1, "#c2255c"); R(t, hx - 3, hy + 1, 2, 1, "#ffa8a8"); R(t, hx + 5, hy + 1, 2, 1, "#ffa8a8"); }
    else {
      disc(t, hx, hy, 6 + (o.big ? 1 : 0), sk);
      R(t, hx + 1, hy - 1, 2, 2, o.eye || "#111"); R(t, hx + 4, hy - 1, 2, 2, o.eye || "#111");
      if (o.teeth) R(t, hx + 1, hy + 3, 5, 1, "#fff");
      if (o.ears){ R(t, hx - 8, hy - 3, 3, 3, sk); R(t, hx + 6, hy - 4, 3, 3, sk); }
      if (o.horns){ R(t, hx - 5, hy - 9, 2, 4, "#e9ecef"); R(t, hx + 4, hy - 9, 2, 4, "#e9ecef"); }
    }
    }
    // 모자·투구
    const hm = over ? o.helm : null;
    if (hm === "knight"){ R(t, hx - 7, hy - 8, 14, 5, "#ced4da"); R(t, hx - 7, hy - 8, 14, 1, "#f8f9fa"); R(t, hx - 1, hy - 13, 3, 6, o.plume || "#fa5252"); R(t, hx - 4, hy - 13, 6, 2, o.plume || "#fa5252"); R(t, hx - 7, hy - 4, 2, 6, "#adb5bd"); }
    else if (hm === "lancer"){ R(t, hx - 7, hy - 9, 14, 6, "#2f9e44"); R(t, hx - 2, hy - 13, 4, 5, "#ffd43b"); R(t, hx - 8, hy - 4, 16, 2, "#ffd43b"); }
    else if (hm === "hood"){ R(t, hx - 8, hy - 9, 15, 6, o.armor); R(t, hx - 8, hy - 4, 3, 9, o.armor); R(t, hx + 6, hy - 10, 3, 2, "#fff3bf"); }
    else if (hm === "wizard"){ for (let i = 0; i < 9; i++) R(t, hx - 8 + i*.6 + (i > 5 ? 2 : 0), hy - 7 - i*1.4, 16 - i*1.6, 2, i % 3 === 2 ? "#ffd43b" : o.armor); R(t, hx - 10, hy - 6, 20, 2, shade(o.armor, -.2)); R(t, hx + 3, hy - 19, 3, 3, "#ffd43b"); }
    else if (hm === "horn"){ R(t, hx - 7, hy - 8, 14, 4, "#495057"); R(t, hx - 9, hy - 12, 2, 5, "#f1f3f5"); R(t, hx + 7, hy - 12, 2, 5, "#f1f3f5"); }
    else if (hm === "bandana"){ R(t, hx - 7, hy - 7, 14, 3, o.plume || "#e03131"); R(t, hx - 10, hy - 6, 3, 4, o.plume || "#e03131"); }
    if (!over) return;
    // 앞팔과 무기
    const sx = x0 + 3, sy = hipY - 11;
    let ang = o.weapon === "bow" ? 0 : -50;
    if (atk === 0) ang = o.weapon === "spear" ? 10 : -125; else if (atk === 1) ang = o.weapon === "spear" ? 0 : -10; else if (atk === 2) ang = o.weapon === "spear" ? 5 : 45;
    if (P === "hurt") ang = -80; if (P === "jump") ang = -100; if (P === "cast") ang = -70; if (P === "spin") ang = 0;
    const a = ang*Math.PI/180, reach = atk === 1 && o.weapon === "spear" ? 9 : 7, hxp = sx + Math.cos(a)*reach, hyp = sy + 3 + Math.sin(a)*reach;
    line(t, sx, sy + 1, hxp, hyp, armC, 3); R(t, hxp - 1, hyp - 1, 3, 3, sk);
    const W8 = o.weapon;
    if (W8 === "sword"){ const L = 15; line(t, hxp, hyp, hxp + Math.cos(a)*L, hyp + Math.sin(a)*L, "#e9ecef", 2); line(t, hxp + Math.cos(a)*2, hyp + Math.sin(a)*2, hxp + Math.cos(a)*L, hyp + Math.sin(a)*L, "#fff", 1);
      line(t, hxp - Math.sin(a)*3, hyp + Math.cos(a)*3, hxp + Math.sin(a)*3, hyp - Math.cos(a)*3, "#fab005", 2); }
    else if (W8 === "spear"){ const L = 24; line(t, hxp - Math.cos(a)*8, hyp - Math.sin(a)*8, hxp + Math.cos(a)*L, hyp + Math.sin(a)*L, "#a0522d", 2);
      const tx = hxp + Math.cos(a)*L, ty = hyp + Math.sin(a)*L; line(t, tx, ty, tx + Math.cos(a)*5, ty + Math.sin(a)*5, "#e9ecef", 3); R(t, tx - 1, ty - 1, 3, 3, "#fa5252"); }
    else if (W8 === "staff"){ const L = 16; line(t, hxp - Math.cos(a)*6, hyp - Math.sin(a)*6, hxp + Math.cos(a)*L, hyp + Math.sin(a)*L, "#8d5524", 2);
      disc(t, hxp + Math.cos(a)*(L + 2), hyp + Math.sin(a)*(L + 2), 2, o.orb || "#4dabf7"); R(t, hxp + Math.cos(a)*(L + 2) - 1, hyp + Math.sin(a)*(L + 2) - 1, 1, 1, "#fff"); }
    else if (W8 === "bow"){ const bx = hxp + 1, by = hyp; line(t, bx, by - 9, bx + 4, by - 4, "#8d5524", 2); line(t, bx + 4, by - 4, bx + 4, by + 4, "#8d5524", 2); line(t, bx + 4, by + 4, bx, by + 9, "#8d5524", 2);
      line(t, bx, by - 9, atk === 0 ? bx - 4 : bx, by, "#f1f3f5", 1); line(t, atk === 0 ? bx - 4 : bx, by, bx, by + 9, "#f1f3f5", 1);
      if (atk === 0) line(t, bx - 4, by, bx + 9, by, "#c92a2a", 1); }
    else if (W8 === "club"){ line(t, hxp, hyp, hxp + Math.cos(a)*11, hyp + Math.sin(a)*11, "#8d5524", 3); disc(t, hxp + Math.cos(a)*12, hyp + Math.sin(a)*12, 3, "#a0522d"); }
    else if (W8 === "axe"){ const L = 18, tx = hxp + Math.cos(a)*L, ty = hyp + Math.sin(a)*L; line(t, hxp - Math.cos(a)*4, hyp - Math.sin(a)*4, tx, ty, "#8d5524", 3);
      const nx = -Math.sin(a), ny = Math.cos(a); for (let i = -6; i <= 6; i++) line(t, tx + nx*i - Math.cos(a)*4, ty + ny*i - Math.sin(a)*4, tx + nx*i + Math.cos(a)*(3 - Math.abs(i)*.3), ty + ny*i + Math.sin(a)*(3 - Math.abs(i)*.3), i === -6 || i === 6 ? "#868e96" : "#dee2e6", 1); }
    else if (W8 === "rsword"){ const L = 13; line(t, hxp, hyp, hxp + Math.cos(a)*L, hyp + Math.sin(a)*L, "#adb5bd", 2); }
    if (o.shield){ R(t, x0 - 9, hipY - 11, 6, 9, o.shield); R(t, x0 - 8, hipY - 10, 4, 7, shade(o.shield, .3)); R(t, x0 - 7, hipY - 8, 2, 3, "#ffd43b"); }
  }
  /* 엎드려 쓰러진 모습 = 서 있는 그림을 옆으로 눕혀요 */
  /* 쓰러진 모습: 서 있는 그림을 눕혀요 (캔버스 52×46) */
  function lying(t, o){ const [c, ct] = tiny(GW, GH); human(ct, Object.assign({}, o, {pose: "hurt"})); t.save(); t.translate(3, 46); t.rotate(-Math.PI/2); t.drawImage(c, 0, 0); t.restore(); }

  /* ---------- 네발 짐승 (늑대 · 말) ---------- */
  function quad(t, o){
    const P = o.pose, s = o.horse ? 1.6 : 1, f = P.startsWith("walk") ? +P[4] : 0, gal = [[3, -3, -2, 2], [1, -1, 0, 0], [-3, 3, 2, -2], [-1, 1, 0, 0]][f];
    const by = o.horse ? 30 : 34, bx = o.horse ? 6 : 8, bw = o.horse ? 34 : 22, bh = o.horse ? 10 : 8, col = o.col, dk = shade(col, -.3);
    const legs = [[bx + 2, gal[0]], [bx + 6, gal[1]], [bx + bw - 7, gal[2]], [bx + bw - 3, gal[3]]];
    legs.forEach(([lx, d], i) => { const c = i % 2 ? col : dk, L = o.horse ? 14 : 9; line(t, lx, by + bh - 2, lx + d, by + bh + L, c, o.horse ? 3 : 2); if (o.horse) R(t, lx + d - 1, by + bh + L, 4, 2, "#343a40"); });
    R(t, bx, by, bw, bh, col); R(t, bx, by, bw, 2, shade(col, .25));
    // 꼬리
    line(t, bx, by + 2, bx - 6, by + (o.horse ? 10 : -3), o.mane || dk, o.horse ? 3 : 2);
    // 목과 머리
    const nx = bx + bw - 3, ny = by;
    if (o.horse){ line(t, nx - 2, ny + 4, nx + 6, ny - 12, col, 6); R(t, nx + 3, ny - 18, 8, 7, col); R(t, nx + 10, ny - 15, 6, 5, shade(col, -.15)); R(t, nx + 7, ny - 16, 2, 2, "#111"); line(t, nx - 1, ny - 2, nx + 5, ny - 18, o.mane, 2); R(t, nx + 4, ny - 21, 2, 3, col); }
    else { R(t, nx - 2, ny - 6, 9, 8, col); R(t, nx + 5, ny - 3, 6, 4, shade(col, -.1)); R(t, nx + 2, ny - 4, 2, 2, o.eye || "#ffd43b"); R(t, nx - 1, ny - 9, 3, 4, col); R(t, nx + 3, ny - 9, 3, 4, col);
      if (P === "atk1"){ R(t, nx + 5, ny + 1, 6, 2, "#fff"); } }
    if (o.saddle){ R(t, bx + 10, by - 2, 12, 4, o.saddle); R(t, bx + 12, by + 2, 3, 6, "#ffd43b"); }
  }

  /* ---------- 드래곤 (마지막 보스) ---------- */
  function dragon(t, o){
    const P = o.pose, fl = (o.f || 0) % 2, open = P === "atk1" || P === "atk2", col = o.col || "#e03131", dk = shade(col, -.35), bel = "#ffd8a8";
    // 날개
    const wy = fl ? 6 : 14; for (let i = 0; i < 5; i++) line(t, 30, 30, 8 + i*5, wy + i*2, i % 2 ? dk : shade(col, -.15), 3);
    R(t, 12, wy + 2, 22, 4, shade(col, -.2));
    // 꼬리
    for (let i = 0; i < 14; i++) R(t, 14 - i*1.2, 50 - i*.6 + Math.sin(i*.5 + (o.f || 0)*.4)*2, 6 - i*.3, 5, i % 3 ? col : dk);
    // 몸
    R(t, 18, 34, 30, 20, col); R(t, 24, 40, 20, 13, bel); for (let i = 0; i < 4; i++) R(t, 24, 42 + i*3, 20, 1, shade(bel, -.2));
    // 다리
    R(t, 22, 52, 7, 10, dk); R(t, 38, 52, 7, 10, dk); R(t, 20, 60, 10, 3, "#f1f3f5"); R(t, 37, 60, 10, 3, "#f1f3f5");
    // 목·머리
    line(t, 44, 38, 54, 22, col, 8); R(t, 50, 12, 16, 11, col); R(t, 58, 16, 14, open ? 4 : 6, col); if (open){ R(t, 58, 22, 13, 4, dk); R(t, 60, 20, 10, 2, "#ff8787"); R(t, 61, 19, 2, 2, "#fff"); R(t, 66, 19, 2, 2, "#fff"); }
    R(t, 56, 14, 3, 3, "#ffd43b"); R(t, 57, 15, 1, 2, "#111"); R(t, 51, 8, 3, 6, "#f1f3f5"); R(t, 55, 7, 3, 6, "#f1f3f5");
    for (let i = 0; i < 5; i++) R(t, 30 + i*4, 32 - (i % 2), 3, 3, dk);
  }

  /* ---------- 아이템 · 상자 · 불 ---------- */
  function itemArt(t, k){
    if (k === "meat"){ R(t, 3, 4, 9, 7, "#c2581c"); R(t, 4, 5, 6, 3, "#e8853d"); line(t, 11, 9, 15, 12, "#f8f9fa", 2); R(t, 14, 11, 3, 3, "#f8f9fa"); }
    else if (k === "gem"){ for (let i = 0; i < 6; i++) R(t, 8 - i, 3 + i, i*2 + 1, 1, "#4dabf7"); for (let i = 0; i < 6; i++) R(t, 3 + i, 9 + i, 11 - i*2, 1, "#1c7ed6"); R(t, 6, 5, 2, 2, "#fff"); }
    else if (k === "coin"){ disc(t, 8, 8, 6, "#fcc419"); disc(t, 8, 8, 4, "#ffe066"); R(t, 7, 5, 2, 6, "#f59f00"); }
    else if (k === "potion"){ R(t, 6, 2, 4, 3, "#ced4da"); disc(t, 8, 10, 5, "#cc5de8"); R(t, 6, 7, 2, 2, "#fff"); }
    else if (k === "cake"){ R(t, 2, 8, 13, 6, "#ffc9c9"); R(t, 2, 7, 13, 2, "#fff"); R(t, 7, 3, 2, 4, "#ff6b6b"); R(t, 7, 2, 2, 1, "#ffd43b"); }
  }
  function barrel(t, k, hit){
    if (k === "chest"){ R(t, 2, 6, 20, 13, "#a0522d"); R(t, 2, 3, 20, 5, "#8b4513"); R(t, 2, 9, 20, 2, "#fab005"); R(t, 10, 8, 4, 5, "#fab005"); R(t, 3, 4, 18, 1, "#c97a3d"); }
    else { R(t, 4, 2, 16, 18, "#9c6644"); R(t, 3, 5, 18, 2, "#495057"); R(t, 3, 15, 18, 2, "#495057"); for (let i = 0; i < 3; i++) R(t, 7 + i*4, 3, 1, 16, "#7f5539"); }
    if (hit) for (let i = 0; i < hit; i++) line(t, 6 + i*5, 4, 9 + i*5, 14, "#3d2410", 1);
  }
  function flame(t, f, col){
    const h = [14, 17, 12][f % 3], c1 = col === "blue" ? "#74c0fc" : "#ff6b00", c2 = col === "blue" ? "#d0ebff" : "#ffd43b", c3 = col === "blue" ? "#fff" : "#fff3bf";
    for (let y = 0; y < h; y++){ const w = Math.round(Math.sin(y/h*Math.PI)*5 + 1 + (y % 3 === f % 3 ? 1 : 0)); R(t, 8 - w, 20 - y, w*2, 1, y < h*.6 ? c1 : c2); }
    for (let y = 0; y < h*.55; y++){ const w = Math.round(Math.sin(y/(h*.55)*Math.PI)*2.5); R(t, 8 - w, 19 - y, w*2, 1, y < 3 ? c3 : c2); }
  }
  return {OUT, tiny, R, line, disc, outline, spr, shade, smooth4, human, lying, quad, dragon, itemArt, barrel, flame, GW, GH};
})();

/* ---------- 스테이지 배경 (도트 그림 · 한 장씩 기억) ---------- */
const QDBG = (() => {
  const {R, line, disc, shade} = QD;
  function rng(s){ return () => (s = (s*16807) % 2147483647) / 2147483647; }
  const GWB = 320, GHB = 180;
  // 같은 그림을 왼쪽·오른쪽으로 한 번 더 그려서 이어 붙여도 티 안 나게
  const wrap = (fn, x, ...a) => { fn(x, ...a); fn(x - GWB, ...a); fn(x + GWB, ...a); };
  function sky(t, a, b, y1 = GHB){ for (let y = 0; y < y1; y++){ const k = y/y1; t.fillStyle = mix(a, b, k); t.fillRect(0, y, GWB, 1); } }
  function mix(a, b, k){ const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16); const r = (A >> 16)*(1 - k) + (B >> 16)*k, g = ((A >> 8) & 255)*(1 - k) + ((B >> 8) & 255)*k, bb = (A & 255)*(1 - k) + (B & 255)*k; return `rgb(${r | 0},${g | 0},${bb | 0})`; }
  function hills(t, y0, amp, col, seed, step = 1){ const r = rng(seed); const ph = r()*6, ph2 = r()*6; t.fillStyle = col;
    for (let x = 0; x < GWB; x += step){ const y = y0 - amp*(.6*Math.sin(x/GWB*Math.PI*2*2 + ph) + .4*Math.sin(x/GWB*Math.PI*2*5 + ph2)); t.fillRect(x, Math.round(y), step, GHB - Math.round(y)); } }
  function pine(t, x, y, h, c1, c2){ for (let i = 0; i < h; i++){ const w = Math.round((i/h)*h*.45) + 1; t.fillStyle = i % 4 < 2 ? c1 : c2; t.fillRect(x - w, y - h + i, w*2 + 1, 1); } R(t, x - 1, y, 3, 4, "#5c3d2e"); }
  function tree(t, x, y, s, c){ R(t, x - 2*s, y - 22*s, 5*s, 22*s, "#6b4423"); R(t, x - 1*s, y - 22*s, 1*s, 22*s, "#8b5a2b");
    [[0, -30, 12], [-9, -24, 9], [9, -25, 9], [-4, -36, 9], [6, -35, 8]].forEach(([dx, dy, r], i) => disc(t, x + dx*s, y + dy*s, r*s, i % 2 ? c : shade(c, .12)));
    disc(t, x - 3*s, y - 33*s, 3*s, shade(c, .3)); }
  function house(t, x, y, w, h, wall, roof){ R(t, x, y - h, w, h, wall); for (let i = 0; i < h; i += 4) R(t, x, y - h + i, w, 1, shade(wall, -.15));
    for (let i = 0; i < w/2 + 3; i++) R(t, x - 3 + i, y - h - i*.8, w + 6 - i*2, 1, i % 3 ? roof : shade(roof, -.2)); R(t, x + w/2 - 3, y - 10, 6, 10, "#3b2314"); R(t, x + 3, y - h + 5, 5, 5, "#ffd43b"); }
  function layer(stage, L){
    const [c, t] = QD.tiny(GWB, GHB), r = rng(101 + stage*31 + L*7);
    if (stage === 0){   // 🌲 고블린 숲
      if (L === 0){ sky(t, "#4dabf7", "#d0ebff", 110); for (let i = 0; i < 6; i++){ const x = r()*GWB, y = 10 + r()*35; wrap((xx) => { disc(t, xx, y, 6, "#fff"); disc(t, xx + 8, y + 2, 5, "#fff"); disc(t, xx - 7, y + 3, 4, "#f1f3f5"); }, x); }
        hills(t, 88, 10, "#8ce99a", 3); hills(t, 98, 7, "#69db7c", 5); for (let i = 0; i < 30; i++){ const x = r()*GWB; { const y = 104 + r()*6, h = 14 + r()*10; wrap(xx => pine(t, xx, y, h, "#2b8a3e", "#2f9e44"), x); } } }
      else if (L === 1){ for (let i = 0; i < 7; i++){ const x = i*46 + r()*20; { const sc = 1 + r()*.3; wrap(xx => tree(t, xx, 112, sc, ["#37b24d", "#2f9e44", "#40c057"][i % 3]), x); } } for (let i = 0; i < 14; i++){ const x = r()*GWB; { const rr2 = 5 + r()*3; wrap((xx) => disc(t, xx, 110, rr2, "#51cf66"), x); } } }
      else { R(t, 0, 104, GWB, 76, "#74b816"); R(t, 0, 104, GWB, 3, "#94d82d"); R(t, 0, 120, GWB, 60, "#d9a66b"); R(t, 0, 120, GWB, 2, "#b5874f");
        for (let i = 0; i < 70; i++) R(t, r()*GWB, 124 + r()*54, 2 + r()*3, 1 + r()*2, r() < .5 ? "#c08a50" : "#e9bf87");
        for (let i = 0; i < 40; i++){ const x = r()*GWB, y = 106 + r()*12; R(t, x, y, 1, 3, "#5c940d"); R(t, x + 2, y - 1, 1, 4, "#5c940d"); }
        for (let i = 0; i < 6; i++){ const x = r()*GWB; R(t, x, 108 + r()*8, 2, 2, ["#ff6b6b", "#ffd43b", "#fff"][i % 3]); } }
    } else if (stage === 1){   // 🔥 불타는 요새
      if (L === 0){ sky(t, "#1a0b2e", "#d9480f", 120); for (let i = 0; i < 10; i++){ const x = r()*GWB, y = 20 + r()*50; wrap((xx) => { disc(t, xx, y, 8, "rgba(60,30,40,.7)"); disc(t, xx + 10, y + 3, 6, "rgba(80,40,40,.6)"); }, x); }
        t.fillStyle = "#2b1a2e"; for (let x = 0; x < GWB; x++){ const k = x % 64; const y = k < 10 ? 62 : k < 14 ? 56 : k < 50 ? 70 : k < 54 ? 58 : 70; t.fillRect(x, y, 1, GHB - y); } for (let x = 0; x < GWB; x += 6) R(t, x, 66, 3, 4, "#2b1a2e"); for (let i = 0; i < 5; i++) R(t, 20 + i*64, 74, 3, 6, "#ffa94d"); }
      else if (L === 1){ for (let i = 0; i < 5; i++){ const x = i*64 + r()*14; { const w = 34 + r()*8, h = 22 + r()*8; wrap(xx => house(t, xx, 112, w, h, "#8d6e63", "#5d4037"), x); } } for (let x = 0; x < GWB; x += 5){ R(t, x, 90, 4, 22, "#6d4c41"); R(t, x + 1, 87, 2, 3, "#6d4c41"); } R(t, 0, 98, GWB, 2, "#4e342e"); }
      else { R(t, 0, 104, GWB, 76, "#5c4033"); R(t, 0, 104, GWB, 3, "#7b5642"); for (let y = 112; y < GHB; y += 9) for (let x = (y % 18 ? 0 : 10); x < GWB; x += 20){ R(t, x, y, 18, 8, "#6f4e37"); R(t, x, y, 18, 1, "#8a6248"); }
        for (let i = 0; i < 40; i++) R(t, r()*GWB, 108 + r()*70, 1, 1, r() < .5 ? "#ffa94d" : "#ff6b6b"); }
    } else if (stage === 2){   // ❄️ 얼음 동굴
      if (L === 0){ sky(t, "#0b1d3a", "#1c4f82", GHB); for (let i = 0; i < 40; i++) R(t, r()*GWB, r()*80, 1, 1, "#a5d8ff");
        for (let i = 0; i < 18; i++){ const x = r()*GWB, h = 10 + r()*30; wrap((xx) => { for (let y = 0; y < h; y++) R(t, xx - (h - y)/6, y, (h - y)/3 + 1, 1, y % 5 ? "#4c6ef5" : "#5c7cfa"); }, x); }
        hills(t, 96, 10, "#364fc7", 9); }
      else if (L === 1){ for (let i = 0; i < 9; i++){ const x = r()*GWB, h = 18 + r()*24; wrap((xx) => { for (let y = 0; y < h; y++){ const w = Math.max(1, (h - y)/3.2); R(t, xx - w, 110 - y, w*2, 1, y % 4 ? "#74c0fc" : "#a5d8ff"); } R(t, xx - 1, 110 - h*.7, 2, h*.4, "#e7f5ff"); }, x); }
        for (let i = 0; i < 12; i++){ const x = r()*GWB, h = 8 + r()*14; wrap((xx) => { for (let y = 0; y < h; y++) R(t, xx - (h - y)/5, y, (h - y)/2.5 + 1, 1, "#d0ebff"); }, x); } }
      else { R(t, 0, 104, GWB, 76, "#dbe4ff"); R(t, 0, 104, GWB, 3, "#ffffff"); R(t, 0, 124, GWB, 56, "#c5d6f8");
        for (let i = 0; i < 26; i++){ const x = r()*GWB, y = 126 + r()*50; QD.line(t, x, y, x + 6 + r()*10, y + r()*4, "#91a7ff", 1); }
        for (let i = 0; i < 50; i++) R(t, r()*GWB, 106 + r()*70, 1, 1, "#fff"); }
    } else {   // 🐉 용의 둥지
      if (L === 0){ sky(t, "#2b0a0a", "#f76707", 130); for (let i = 0; i < 6; i++){ const x = r()*GWB, y = 20 + r()*40; wrap((xx) => disc(t, xx, y, 7, "rgba(40,10,10,.6)"), x); }
        t.fillStyle = "#3b1a1a"; for (let x = 0; x < GWB; x++){ const k = Math.abs(((x + 60) % 160) - 80); const y = 40 + k*.7; t.fillRect(x, y, 1, GHB - y); } for (let x = 0; x < GWB; x++){ const k = Math.abs(((x + 60) % 160) - 80); if (k < 8) R(t, x, 40 + k*.7, 1, 6 + (8 - k), "#ff922b"); } hills(t, 98, 6, "#4a1f1f", 13); }
      else if (L === 1){ for (let i = 0; i < 8; i++){ const x = r()*GWB, h = 20 + r()*30; wrap((xx) => { for (let y = 0; y < h; y++){ const w = Math.max(1, 5 - y/h*3); R(t, xx - w, 112 - y, w*2, 1, y % 6 ? "#5c2e2e" : "#6b3434"); } }, x); }
        for (let i = 0; i < 6; i++){ const x = r()*GWB; wrap((xx) => { R(t, xx, 106, 10, 3, "#f1f3f5"); disc(t, xx + 11, 105, 3, "#f1f3f5"); R(t, xx + 10, 104, 2, 1, "#111"); }, x); } }
      else { R(t, 0, 104, GWB, 76, "#3d3d45"); R(t, 0, 104, GWB, 3, "#55555f"); for (let y = 110; y < GHB; y += 10) for (let x = (y % 20 ? 0 : 12); x < GWB; x += 24){ R(t, x, y, 22, 9, "#45454e"); }
        for (let i = 0; i < 14; i++){ let x = r()*GWB, y = 112 + r()*60; for (let k = 0; k < 6; k++){ const nx = x + 3 + r()*5, ny = y + r()*4 - 2; QD.line(t, x, y, nx, ny, k % 2 ? "#ff6b00" : "#ffd43b", 1); x = nx; y = ny; } } }
    }
    return c;
  }
  const CC = new Map();
  /* 화면 배율에 맞춰 키운 배경 (1280 × 720) */
  /* 장 배경: 0 숲 · 1 요새 · 2 얼음 · 3 용둥지 · 4 달밤 숲(숲을 밤빛으로) · 5 용암 요새(요새를 붉게) */
  function themed(th, L){ const base = [0, 1, 2, 3, 0, 1][th], src0 = layer(base, L); if (th < 4) return src0;
    const [src, t] = QD.tiny(GWB, GHB), r = rng(77 + L*13);
    t.drawImage(src0, 0, 0); t.globalCompositeOperation = "multiply"; t.fillStyle = th === 4 ? (L === 0 ? "#2c3a7a" : "#5866a8") : (L === 0 ? "#ff7a5c" : "#ffb199"); t.fillRect(0, 0, GWB, GHB);
    t.globalCompositeOperation = "destination-in"; t.drawImage(src0, 0, 0); t.globalCompositeOperation = "source-over";   // 빈 곳은 그대로 비워 두기
    if (th === 4 && L === 0){ for (let i = 0; i < 60; i++) R(t, r()*GWB, r()*70, 1, 1, r() < .3 ? "#fff3bf" : "#dbe4ff"); disc(t, 250, 26, 12, "#fff9db"); disc(t, 246, 23, 3, "#f1e3a8"); }
    if (th === 4 && L === 2) for (let i = 0; i < 14; i++) R(t, r()*GWB, 106 + r()*10, 1, 1, "#d8f5a2");
    if (th === 5 && L === 2) for (let i = 0; i < 16; i++){ let x = r()*GWB, y = 112 + r()*60; for (let k2 = 0; k2 < 5; k2++){ const nx = x + 3 + r()*5, ny = y + r()*4 - 2; line(t, x, y, nx, ny, k2 % 2 ? "#ff6b00" : "#ffd43b", 1); x = nx; y = ny; } }
    if (th === 5 && L === 0) for (let x = 0; x < GWB; x++){ const y = 150 + Math.sin(x*.05)*3; R(t, x, y, 1, GHB - y, x % 7 ? "#c92a2a" : "#ff6b00"); }
    return src; }
  function get(stage, L){
    const k = NG.k || 1, key = `${stage}|${L}|${k}`; let c = CC.get(key); if (c) return c;
    if (CC.size > 16) CC.clear();
    const src = QD.smooth4(themed(stage, L)); c = document.createElement("canvas"); c.width = Math.round(GWB*4*k); c.height = Math.round(GHB*4*k);
    const t = c.getContext("2d"); t.imageSmoothingEnabled = false; t.drawImage(src, 0, 0, c.width, c.height); c.w = GWB*4; CC.set(key, c); return c;
  }
  return {get, W: GWB*4};
})();

/* ---------- 직업 · 적 · 스테이지 ---------- */
const QCL = [
  {id: "kn", n: "청룡 검객",   e: "⚔️", c: "#4dabf7", hp: 130, spd: 4.3, dmg: [11, 11, 20], reach: 105, sp: "회오리 베기",
    art: {skin: "#ffd8b1", armor: "#1c7ed6", pants: "#364fc7", boots: "#5c3d2e", helm: "knight", weapon: "sword", shield: "#e03131", belt: "#fab005"}},
  {id: "ln", n: "은빛 창장수", e: "🔱", c: "#51cf66", hp: 120, spd: 4.0, dmg: [10, 10, 19], reach: 150, sp: "돌격 찌르기",
    art: {skin: "#ffd8b1", armor: "#2f9e44", pants: "#5c940d", boots: "#5c3d2e", helm: "lancer", weapon: "spear", belt: "#ffd43b", cape: "#e03131"}},
  {id: "ar", n: "바람 궁장",   e: "🏹", c: "#fcc419", hp: 100, spd: 4.7, dmg: [9, 9, 9], reach: 0, sp: "화살비",
    art: {skin: "#ffd8b1", armor: "#e67700", pants: "#5c940d", boots: "#7f5539", helm: "hood", weapon: "bow", belt: "#5c3d2e"}},
  {id: "wz", n: "자색 책사", e: "🔮", c: "#cc5de8", hp: 95, spd: 4.0, dmg: [13, 13, 13], reach: 0, sp: "별똥별",
    art: {skin: "#ffd8b1", armor: "#7048e8", pants: "#5f3dc4", boots: "#3b2314", helm: "wizard", weapon: "staff", robe: 1, orb: "#ff8787", belt: "#ffd43b"}}
];
/* 적: hp · 빠르기 · 공격력 · 닿는 거리 · 점수 · 크기(px) */
const QEN = {
  gob:   {n: "황건 졸개", hp: 30, spd: 2.3, dmg: 6,  reach: 70,  sc: 100, px: 3.3, wind: 22, art: {skin: "#94d82d", armor: "#8d6e63", pants: "#6d4c41", boots: "#4e342e", face: false, ears: 1, teeth: 1, weapon: "club", eye: "#e03131"}},
  gob2:  {n: "황건 두목", hp: 55, spd: 2.5, dmg: 9, reach: 80, sc: 200, px: 3.6, wind: 20, art: {skin: "#82c91e", armor: "#495057", pants: "#343a40", boots: "#212529", face: false, ears: 1, teeth: 1, weapon: "rsword", helm: "horn", eye: "#ffd43b", shield: "#868e96"}},
  wolf:  {n: "늑대", hp: 26, spd: 4.6, dmg: 7, reach: 90, sc: 120, px: 3.4, wind: 18, quad: 1, art: {col: "#868e96", mane: "#495057"}},
  skel:  {n: "망령 병사", hp: 42, spd: 2.1, dmg: 9, reach: 80, sc: 150, px: 3.5, wind: 22, art: {skin: "#f1f3f5", armor: "#e9ecef", pants: "#dee2e6", boots: "#adb5bd", face: false, ribs: 1, weapon: "rsword", eye: "#111", shield: "#a0522d"}},
  skar:  {n: "망령 궁수", hp: 32, spd: 2.2, dmg: 8, reach: 0, sc: 180, px: 3.5, wind: 28, ranged: 1, art: {skin: "#f1f3f5", armor: "#e9ecef", pants: "#dee2e6", boots: "#adb5bd", face: false, ribs: 1, weapon: "bow", eye: "#c92a2a"}},
  igob:  {n: "설원 산적", hp: 36, spd: 2.4, dmg: 7, reach: 70, sc: 130, px: 3.3, wind: 22, art: {skin: "#a5d8ff", armor: "#4c6ef5", pants: "#364fc7", boots: "#1c2a6b", face: false, ears: 1, teeth: 1, weapon: "club", eye: "#1864ab"}},
  iwolf: {n: "눈늑대", hp: 30, spd: 4.8, dmg: 8, reach: 90, sc: 140, px: 3.4, wind: 18, quad: 1, art: {col: "#e7f5ff", mane: "#a5d8ff", eye: "#4dabf7"}},
  liz:   {n: "남만 전사", hp: 60, spd: 2.6, dmg: 11, reach: 110, sc: 250, px: 3.7, wind: 20, art: {skin: "#e8590c", armor: "#862e9c", pants: "#5f3dc4", boots: "#3b2314", face: false, horns: 1, teeth: 1, weapon: "spear", eye: "#ffd43b"}},
  /* 보스 */
  orc:   {n: "거한 장수 쿵쾅", boss: 1, hp: 520, spd: 2.5, dmg: 15, reach: 150, sc: 3000, px: 5.4, wind: 26, art: {skin: "#5c940d", armor: "#5c3d2e", pants: "#3b2314", boots: "#212529", face: false, teeth: 1, ears: 1, horns: 1, weapon: "axe", eye: "#e03131", big: 1, belt: "#adb5bd"}},
  rider: {n: "불꽃 기마 장군", boss: 1, hp: 720, spd: 3, dmg: 16, reach: 180, sc: 4000, px: 4.6, wind: 24, rider: 1, art: {skin: "#ffc9c9", armor: "#c92a2a", pants: "#862e2e", boots: "#212529", face: false, helm: "bandana", plume: "#ffd43b", weapon: "spear", eye: "#111", belt: "#ffd43b"}, horse: {col: "#a0522d", mane: "#3b2314", saddle: "#c92a2a", horse: 1}},
  yeti:  {n: "설원 거인 장수", boss: 1, hp: 820, spd: 2.4, dmg: 17, reach: 150, sc: 5000, px: 6.2, wind: 28, art: {skin: "#d0ebff", armor: "#e7f5ff", pants: "#c5d6f8", boots: "#4dabf7", face: false, teeth: 1, horns: 1, weapon: "club", eye: "#1971c2", big: 1, belt: "#74c0fc", ribs: 1}},
  drag:  {n: "붉은 용 화르륵", boss: 1, hp: 1150, spd: 2.2, dmg: 18, reach: 200, sc: 8000, px: 5.6, wind: 30, dragon: 1, art: {col: "#e03131"}}
};
/* 새 친구·새 보스 (색을 바꾼 강한 녀석들) */
Object.assign(QEN, {
  nwolf:  Object.assign({}, QEN.wolf, {n: "그림자 늑대", hp: 36, spd: 5, dmg: 9, sc: 170, art: {col: "#343a40", mane: "#212529", eye: "#ff6b6b"}}),
  lskel:  Object.assign({}, QEN.skel, {n: "화염 망령병", hp: 56, dmg: 11, sc: 210, art: Object.assign({}, QEN.skel.art, {skin: "#ffc078", armor: "#e8590c", pants: "#c92a2a", boots: "#5c1010", eye: "#ffe066", shield: "#5c1010"})}),
  korc:   Object.assign({}, QEN.orc, {n: "달밤 패왕 우르릉", ai: "orc", hp: 900, dmg: 17, sc: 6000, art: Object.assign({}, QEN.orc.art, {skin: "#495057", armor: "#1c2a6b", pants: "#212529", eye: "#ffe066"})}),
  lrider: Object.assign({}, QEN.rider, {n: "용암 기사 활활", ai: "rider", hp: 1000, dmg: 18, sc: 7000, art: Object.assign({}, QEN.rider.art, {armor: "#ff6b00", pants: "#5c1010", plume: "#ffe066"})}),
  kdrag:  Object.assign({}, QEN.drag, {n: "황금 용왕 번쩍", ai: "drag", hp: 1500, dmg: 20, sc: 15000, art: {col: "#f59f00"}})
});
Object.assign(QEN, {
  shroom: {n: "버섯 병사", hp: 22, spd: 2.2, dmg: 5, reach: 60, sc: 70, px: 3.0, wind: 20, art: {}},
  blob:   {n: "젤리 슬라임", hp: 16, spd: 1.7, dmg: 4, reach: 50, sc: 50, px: 2.6, wind: 18, blob: 1, art: {}}
});
/* ---------- 🆕 다양한 병사 14종 · 보스 20종 (2026.11.17) — 모두 오리지널 디자인 ---------- */
const QNEW = [
  ["spr",   "붉은 창병",     {hp: 40, spd: 2.4, dmg: 9,  reach: 115, sc: 160, px: 3.5, wind: 22}, {weapon: "spear", armor: "#c92a2a", trim: "#ffd43b", cloth: "#7f1d1d", skin: "#f3cfae", hair: "#141022", helm: "soldier", plume: "#ff6b6b", angry: 1}],
  ["axe",   "도끼 산적",     {hp: 52, spd: 2.3, dmg: 12, reach: 90,  sc: 190, px: 3.7, wind: 24}, {weapon: "axe", armor: "#5c4033", trim: "#adb5bd", cloth: "#3b2314", skin: "#d9a47c", hair: "#2a1a10", helm: "band", band: "#e03131", beard: "#2a1a10", angry: 1, big: 1}],
  ["nin",   "그림자 자객",   {hp: 28, spd: 3.6, dmg: 10, reach: 75,  sc: 170, px: 3.3, wind: 14}, {weapon: "dao", armor: "#212529", trim: "#ced4da", cloth: "#343a40", skin: "#e8c2a0", hair: "#0b0b14", helm: "band", band: "#212529", angry: 1, wd: {glow: "#e599f7"}}],
  ["farc",  "불화살 궁수",   {hp: 34, spd: 2.3, dmg: 10, reach: 0,   sc: 190, px: 3.5, wind: 26, ranged: 1}, {weapon: "bow", armor: "#e8590c", trim: "#ffd43b", cloth: "#7c2d12", skin: "#f3cfae", hair: "#141022", helm: "band", band: "#ff922b", wd: {glow: "#ffa94d"}}],
  ["sham",  "보라 주술사",   {hp: 30, spd: 2.0, dmg: 11, reach: 0,   sc: 200, px: 3.4, wind: 30, ranged: 1}, {weapon: "fan", armor: "#5f3dc4", trim: "#e599f7", cloth: "#3b1d6e", skin: "#d0bfff", hair: "#141022", helm: "scholar", robe: 1, angry: 1, wd: {glow: "#da77f2"}}],
  ["shld",  "철벽 방패병",   {hp: 85, spd: 1.8, dmg: 9,  reach: 80,  sc: 230, px: 3.7, wind: 26}, {weapon: "dao", armor: "#495057", trim: "#ffd43b", cloth: "#343a40", skin: "#f3cfae", hair: "#141022", helm: "general", plume: "#adb5bd", shield: "#868e96", angry: 1, big: 1}],
  ["halb",  "미늘창 근위병", {hp: 58, spd: 2.2, dmg: 13, reach: 135, sc: 220, px: 3.7, wind: 26}, {weapon: "halberd", armor: "#1864ab", trim: "#ffd43b", cloth: "#0b3d75", skin: "#f3cfae", hair: "#141022", helm: "general", plume: "#4dabf7", angry: 1}],
  ["bear",  "곰가죽 전사",   {hp: 95, spd: 2.0, dmg: 15, reach: 100, sc: 260, px: 4.0, wind: 28}, {weapon: "club", armor: "#5c3d2e", trim: "#c08a50", cloth: "#3b2314", skin: "#c98b62", hair: "#2a1a10", helm: "fur", beard: "#2a1a10", angry: 1, big: 1, cape: "#5c3d2e"}],
  ["gsp",   "망령 창병",     {hp: 48, spd: 2.3, dmg: 11, reach: 115, sc: 200, px: 3.5, wind: 22}, {weapon: "spear", armor: "#364fc7", trim: "#a5d8ff", cloth: "#1c2a6b", skin: "#dbe4ff", helm: "soldier", plume: "#748ffc", ghost: 1, eyeGlow: "#91a7ff"}],
  ["isp",   "얼음 창병",     {hp: 50, spd: 2.3, dmg: 11, reach: 115, sc: 210, px: 3.5, wind: 22}, {weapon: "spear", armor: "#a5d8ff", trim: "#e7f5ff", cloth: "#4dabf7", skin: "#e8c2a0", hair: "#3b2a20", helm: "fur", angry: 1, wd: {glow: "#a5d8ff"}}],
  ["gold",  "황금 근위대",   {hp: 75, spd: 2.4, dmg: 14, reach: 130, sc: 300, px: 3.8, wind: 22}, {weapon: "guandao", armor: "#fab005", trim: "#fff3bf", cloth: "#e67700", skin: "#f3cfae", hair: "#141022", helm: "crown", cape: "#c92a2a", angry: 1, wd: {glow: "#ffe066"}}],
  ["monk",  "떠돌이 무승",   {hp: 46, spd: 3.1, dmg: 11, reach: 90,  sc: 210, px: 3.4, wind: 16}, {weapon: "club", armor: "#e67700", trim: "#ffd43b", cloth: "#d9480f", skin: "#e8b48f", hair: "#e8b48f", helm: "band", band: "#fab005", angry: 1}],
  ["fwolf", "불꽃 늑대",     {hp: 40, spd: 5.2, dmg: 10, reach: 90,  sc: 190, px: 3.4, wind: 16, quad: 1}, {col: "#e8590c", mane: "#ffd43b", eye: "#fff3bf"}],
  ["pblob", "독 슬라임",     {hp: 34, spd: 1.9, dmg: 8,  reach: 55,  sc: 110, px: 2.8, wind: 18, blob: 1}, {col: "#94d82d"}]
];
QNEW.forEach(([k, n, st, art]) => { QEN[k] = Object.assign({n, art: {}}, st); WDEF[k] = art; });
/* 보스 20종: [키, 이름, 바탕(ai), 체력, 공격, 그림] — 사람 장수 · 기마 장군 · 용 */
const QBOSS = [
  ["b_frog",  "독두꺼비 대왕",   "yeti",  900, 17, {weapon: "club", armor: "#2b8a3e", trim: "#c0eb75", cloth: "#1b4332", skin: "#8ce99a", hair: "#2b8a3e", helm: "skull", angry: 1, big: 1, cape: "#2f9e44"}],
  ["b_ghost", "망령 대장군",     "orc",   950, 18, {weapon: "guandao", armor: "#364fc7", trim: "#a5d8ff", cloth: "#1c2a6b", skin: "#dbe4ff", helm: "general", plume: "#748ffc", ghost: 1, eyeGlow: "#91a7ff", big: 1, cape: "#3b5bdb", wd: {glow: "#91a7ff"}}],
  ["r_tiger", "호랑이 기마 장군", "rider", 1000, 18, {weapon: "halberd", armor: "#f08c00", trim: "#212529", cloth: "#e8590c", skin: "#f3cfae", hair: "#141022", helm: "general", plume: "#212529", angry: 1, cape: "#d9480f", horse: {col: "#f08c00", mane: "#212529", barding: "#212529", trim: "#ffd43b"}}],
  ["d_blue",  "푸른 용 쏴아",    "drag",  1150, 19, {col: "#1c7ed6", fin: "#a5d8ff", horn: "#e7f5ff", mane: "#d0ebff"}],
  ["b_monk",  "금강 무승",       "orc",   1050, 19, {weapon: "club", armor: "#fab005", trim: "#fff3bf", cloth: "#e8590c", skin: "#e8b48f", hair: "#e8b48f", helm: "band", band: "#ffd43b", angry: 1, big: 1, cape: "#f08c00", wd: {glow: "#ffe066"}}],
  ["b_witch", "보라 마녀 장수",   "yeti",  1100, 19, {weapon: "fan", armor: "#862e9c", trim: "#f783ac", cloth: "#5f3dc4", skin: "#e599f7", hair: "#141022", helm: "scholar", robe: 1, angry: 1, big: 1, cape: "#ae3ec9", wd: {glow: "#f783ac"}}],
  ["r_ice",   "얼음 기마 여왕",   "rider", 1200, 20, {weapon: "spear", armor: "#a5d8ff", trim: "#ffffff", cloth: "#4dabf7", skin: "#f3cfae", hair: "#e7f5ff", helm: "crown", angry: 1, cape: "#74c0fc", wd: {glow: "#e7f5ff"}, horse: {col: "#f8f9fa", mane: "#a5d8ff", barding: "#1c7ed6", trim: "#e7f5ff"}}],
  ["d_black", "흑룡 어둠",       "drag",  1350, 21, {col: "#343a40", fin: "#e64980", horn: "#f8f9fa", mane: "#868e96"}],
  ["b_bull",  "황소 뿔 장사",    "orc",   1300, 21, {weapon: "axe", armor: "#862e2e", trim: "#ffd43b", cloth: "#5c1010", skin: "#a0522d", hair: "#141022", helm: "horned", beard: "#141022", angry: 1, big: 1, cape: "#c92a2a", wd: {glow: "#ff8787"}}],
  ["b_snow",  "눈보라 거인왕",   "yeti",  1400, 22, {weapon: "club", armor: "#e7f5ff", trim: "#74c0fc", cloth: "#a5d8ff", skin: "#d0ebff", hair: "#ffffff", helm: "fur", beard: "#ffffff", angry: 1, big: 1, cape: "#d0ebff", eyeGlow: "#74c0fc"}],
  ["r_shadow","그림자 흑기사",   "rider", 1450, 22, {weapon: "guandao", armor: "#212529", trim: "#e64980", cloth: "#0b0b14", skin: "#adb5bd", hair: "#0b0b14", helm: "horned", angry: 1, cape: "#343a40", wd: {glow: "#f06595"}, horse: {col: "#0b0b14", mane: "#e64980", barding: "#343a40", trim: "#f06595"}}],
  ["d_green", "독룡 쉬이익",     "drag",  1550, 23, {col: "#2f9e44", fin: "#d8f5a2", horn: "#fff9db", mane: "#c0eb75"}],
  ["b_sun",   "태양 패왕",       "orc",   1600, 23, {weapon: "guandao", armor: "#ff922b", trim: "#fff3bf", cloth: "#e8590c", skin: "#f3cfae", hair: "#141022", helm: "crown", angry: 1, big: 1, cape: "#ffd43b", beard: "#141022", wd: {glow: "#ffe066"}}],
  ["b_bone",  "해골 대마왕",     "yeti",  1650, 24, {weapon: "axe", armor: "#212529", trim: "#ced4da", cloth: "#343a40", skin: "#f1f3f5", helm: "skull", ghost: 1, eyeGlow: "#ff6b6b", big: 1, cape: "#495057", wd: {glow: "#ff8787"}}],
  ["r_flame", "화룡 기병 대장",  "rider", 1700, 24, {weapon: "halberd", armor: "#e03131", trim: "#ffd43b", cloth: "#5c1010", skin: "#f3cfae", hair: "#141022", helm: "general", plume: "#ffd43b", angry: 1, cape: "#ff6b6b", beard: "#141022", wd: {glow: "#ffa94d"}, horse: {col: "#c92a2a", mane: "#ffd43b", barding: "#5c1010", trim: "#ffd43b"}}],
  ["d_white", "백룡 눈부심",     "drag",  1800, 25, {col: "#f1f3f5", fin: "#74c0fc", horn: "#ffe066", mane: "#e7f5ff"}],
  ["b_star",  "별빛 대장군",     "orc",   1900, 26, {weapon: "sword", armor: "#5f3dc4", trim: "#ffe066", cloth: "#1c2a6b", skin: "#f3cfae", hair: "#141022", helm: "general", plume: "#ffe066", angry: 1, big: 1, cape: "#7048e8", wd: {glow: "#b197fc"}}],
  ["r_gold",  "황금 천마 장군",  "rider", 2000, 26, {weapon: "guandao", armor: "#fab005", trim: "#ffffff", cloth: "#e67700", skin: "#f3cfae", hair: "#141022", helm: "crown", angry: 1, cape: "#fff3bf", beard: "#141022", wd: {glow: "#fff3bf"}, horse: {col: "#fff9db", mane: "#fab005", barding: "#e67700", trim: "#ffffff"}}],
  ["d_rainbow","무지개 용 반짝", "drag",  2150, 27, {col: "#cc5de8", fin: "#ffd43b", horn: "#ffffff", mane: "#63e6be"}],
  ["b_king",  "어둠의 마왕",     "yeti",  2300, 28, {weapon: "guandao", armor: "#1a1423", trim: "#ff6b6b", cloth: "#0b0b14", skin: "#c5b3e6", hair: "#0b0b14", helm: "horned", angry: 1, big: 1, cape: "#862e2e", eyeGlow: "#ff6b6b", wd: {glow: "#ff6b6b"}}]
];
QBOSS.forEach(([k, n, ai, hp, dmg, art]) => { const B = QEN[ai === "rider" ? "rider" : ai === "drag" ? "drag" : ai === "yeti" ? "yeti" : "orc"];
  QEN[k] = Object.assign({}, B, {n, ai, hp, dmg, sc: Math.round(hp*6), art: {}}); WDEF[k] = art; });
const QNEWK = QNEW.map(x => x[0]);

/* 26장 × 5단계 = 130단계. 장마다 배경(th) · 졸개 · 보스가 달라요. 3단계는 작은 보스, 5단계는 진짜 보스!
   31단계부터는 같은 땅의 Ⅱ·Ⅲ·Ⅳ·Ⅴ — 다음 땅의 졸개까지 섞여 나오고 몬스터가 훨씬 세져요 (🛒 상점에서 장비를 강화해야 해요) */
const QCH0 = [
  {n: "🌲 고블린 숲",    th: 0, boss: "orc",    bmin: ["gob", "gob", "wolf"],  pool: [["gob", "gob", "wolf"], ["gob", "wolf", "gob2"], ["gob2", "gob", "wolf", "wolf"]]},
  {n: "🔥 불타는 요새",  th: 1, boss: "rider",  bmin: ["skel", "skar"],        pool: [["skel", "gob", "skel"], ["skar", "skel", "gob2"], ["skel", "skar", "skar", "gob2"]]},
  {n: "❄️ 얼음 동굴",    th: 2, boss: "yeti",   bmin: ["igob", "iwolf"],       pool: [["igob", "igob", "iwolf"], ["iwolf", "skel", "igob"], ["skar", "igob", "iwolf", "iwolf"]]},
  {n: "🌙 달밤의 숲",    th: 4, boss: "korc",   bmin: ["nwolf", "gob2"],       pool: [["nwolf", "gob", "nwolf"], ["gob2", "nwolf", "skar"], ["nwolf", "nwolf", "gob2", "skel"]]},
  {n: "🌋 용암 요새",    th: 5, boss: "lrider", bmin: ["lskel", "skar"],       pool: [["lskel", "skel", "lskel"], ["skar", "lskel", "liz"], ["lskel", "liz", "skar", "lskel"]]},
  {n: "🐉 용의 둥지",    th: 3, boss: "drag",   bmin: ["liz", "skar"],         pool: [["liz", "gob2", "lskel"], ["liz", "skar", "liz", "nwolf"], ["liz", "liz", "skar", "lskel"]]}
];
const QCH = [];
for (let c = 0; c < 26; c++){ const B = QCH0[c % 6], r = Math.floor(c/6), nx = QCH0[(c + 1) % 6];
  const nw = [QNEWK[(c*2) % QNEWK.length], QNEWK[(c*2 + 1) % QNEWK.length], QNEWK[(c*3 + 5) % QNEWK.length]];   // 🆕 장마다 다른 새 병사
  QCH.push(r ? {n: B.n + ["", " Ⅱ", " Ⅲ", " Ⅳ", " Ⅴ"][r], th: B.th, boss: QBOSS[(c - 6) % QBOSS.length][0], r, bmin: B.bmin.slice(0, 1).concat(nw.slice(0, 2)), pool: B.pool.map((pl, i) => pl.concat(nx.pool[i].slice(0, Math.min(2, r)), nw.slice(0, 1 + i)))}
    : Object.assign({r: 0}, B, {pool: B.pool.map((pl, i) => i ? pl.concat(nw.slice(0, i)) : pl)})); }
const QST = [];
QCH.forEach((C, c) => { for (let k = 0; k < 5; k++){
  const n = c*5 + k, nSeg = 3 + (k >= 2 ? 1 : 0), seg = [];
  for (let i = 0; i < nSeg; i++){ const waves = 1 + (i >= 1 ? 1 : 0) + (k >= 3 && i === nSeg - 1 ? 1 : 0), x = 300 + i*1150, row = [x];
    for (let w = 0; w < waves; w++){ const base = C.pool[Math.min(2, Math.floor((i + k + w)/2))], add = Math.min(5, Math.floor((k + c)/3) + 1), mix = QCH[(c + w + i) % (c + 1)].pool[0];
      // 더 많이 · 더 다양하게: 이 장 졸개 + 지난 장 졸개 + 버섯 병사·젤리 슬라임
      row.push(base.concat(Array.from({length: add}, (_, q) => base[(q + w) % base.length]), [mix[(i + w) % mix.length], (i + w) % 2 ? "shroom" : "blob", (k + w) % 3 ? "blob" : "shroom"])); }
    seg.push(row); }
  const len = 300 + nSeg*1150 + 1100, last = n === QCH.length*5 - 1;
  QST.push({n: C.n, ch: c, k, th: C.th, len, seg, bmin: C.bmin, props: seg.map(r => r[0] + 500),
    boss: k === 4 ? (last ? "kdrag" : C.boss) : k === 2 ? C.boss : null, mini: k === 2});
} });
const QD_MAX = QST.length;
/* 👑 보스 도전 (2026.11.17): 졸개 없이 보스와 1:1 — 바닥에 뜨는 빨간 경고를 보고 피하는 '컨트롤' 싸움.
   덜 맞을수록 ⭐이 많고, ⭐마다 🏅 용사 포인트 → ⚔️ 결투장에서 친구와 겨뤄요 */
const QBL = ["orc", "rider", "yeti", "korc", "lrider", "drag"].concat(QBOSS.map(b => b[0]), ["kdrag"]);
const qblStage = l => { const k = QBL[l]; if (k === "kdrag") return QD_MAX - 1; const c = QCH.findIndex(C => C.boss === k); return c >= 0 ? c*5 + 4 : (l*5 + 4) % QD_MAX; };
/* ⚔️ 결투장: 친구 용사도 '맞을 수 있는 상대'로 (그림은 용사 그대로) */
QEN.pvp = {n: "용사", hp: 1, spd: 0, dmg: 0, reach: 0, sc: 0, px: 3, wind: 1, art: {}};
const QDIR = [[0, 0], [0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];
const qdDir = (dx, dy) => { for (let i = 0; i < 9; i++) if (QDIR[i][0] === dx && QDIR[i][1] === dy) return i; return 0; };
/* 버튼 누른 횟수를 숫자 하나에: 공격 · 점프 · 필살 (온라인으로 보낼 때) */
/* 버튼 7개(공격·점프·필살·스킬1·스킬2·대시·🐾펫)를 4칸씩 숫자 하나에 */
const qdPack = (...v) => v.reduce((a, x, i) => a | ((x & 15) << (i*4)), 0);
const qdUnpack = b => Array.from({length: 7}, (_, i) => (b >> (i*4)) & 15);
const QB = ["a", "j", "s", "q", "e", "x", "p"];
/* 직업마다 스킬 둘 (R·T) — 쿨타임(프레임) */
const QSK = {
  kn: [{n: "삼연참", e: "🌀", cd: 240}, {n: "검기 날리기", e: "🌊", cd: 420}],
  ln: [{n: "회전창", e: "🌪️", cd: 240}, {n: "돌진 찌르기", e: "💨", cd: 420}],
  ar: [{n: "삼연발", e: "🎯", cd: 220}, {n: "폭탄 화살", e: "💥", cd: 420}],
  wz: [{n: "낙뢰", e: "⚡", cd: 240}, {n: "치유의 바람", e: "💚", cd: 600}]
};

/* =====================================================================
   🛡️ 게임
   ===================================================================== */
NG.defs.qd = () => {
  const O = NG.opt || {}, SIDS = NG.sids.slice(), N = SIDS.length;
  const party = O.party || null, myIdx = party === "guest" ? O.idx : 0;
  const isBot = i => (O.bots || []).includes(i);
  const local = (O.local || [0]).slice();
  const W = 1280, H = 720, YT = 456, YB = 700, HP4 = 4;
  const MODE = O.mode || "adv", BLV = Math.max(0, Math.min(QBL.length - 1, O.bl || 0));   // adv 모험 · boss 👑 보스 도전 · arena ⚔️ 결투장
  let HZ = [], AR = null, BT = 0;   // ⚠️ 보스 경고 장판 · 결투장 판 정보 · 보스 시간
  const HUM = SIDS.map((s, i) => i).filter(i => !isBot(i));
  const emult = .8 + .15*N, bmult = .6 + .3*N;   // 🤝 같이 하면 몬스터는 덜 늘고
  const TEAM = 1 + .15*(Math.max(1, SIDS.filter((s, i) => !isBot(i)).length) - 1);   // 🤝 우정 파워: 사람 친구가 많을수록 다 같이 세져요 (2명 +15% · 4명 +45%)
  let P, E, PR, IT, PROPS, FX, phase, pt, stage, camX, lockX, segI, waveQ, team, banner, shake, NQ, IN, LAST, ended, lastSnap, bossId, goT, keys, ptr, uid, rs, flashT, flashC, stageT, results;
  /* ---------- 작은 도구 ---------- */
  const rand = () => (rs = (rs*16807) % 2147483647) / 2147483647;
  const rr = (a, b) => a + rand()*(b - a);
  const alive = p => p.st !== "dead" && p.st !== "out";
  const live = () => P.filter(alive);
  const ens = () => E.filter(e => e.st !== "die");
  function ev(...a){ if (party === "host") NQ.push(a); }
  function sfx(k){ playS(k); ev("s", k); }
  function playS(k){
    if (k === "sw") tone(700, 300, .08, "triangle", .07);
    else if (k === "hit"){ tone(220, 90, .1, "square", .1); tone(1400, 500, .05, "sawtooth", .05); }
    else if (k === "big"){ tone(160, 50, .25, "sawtooth", .12); tone(900, 200, .15, "square", .06); }
    else if (k === "ouch") tone(500, 180, .18, "sawtooth", .09);
    else if (k === "die") [440, 330, 220].forEach((f, i) => tone(f, f*.8, .1, "square", .07, i*.07));
    else if (k === "jump") tone(300, 700, .1, "sine", .08);
    else if (k === "item") SFX.item();
    else if (k === "coin") tone(1320, 1760, .08, "square", .06);
    else if (k === "spc"){ [523, 784, 1046, 1568].forEach((f, i) => tone(f, f, .12, "square", .07, i*.05)); tone(120, 60, .5, "sawtooth", .08, .1); }
    else if (k === "shoot") tone(1200, 400, .08, "triangle", .07);
    else if (k === "boom"){ tone(140, 40, .4, "sawtooth", .12); tone(800, 100, .3, "square", .05); }
    else if (k === "boss") [196, 185, 175, 165].forEach((f, i) => tone(f, f*.9, .3, "sawtooth", .08, i*.22));
    else if (k === "go") [784, 988, 1175].forEach((f, i) => tone(f, f, .1, "square", .06, i*.08));
    else if (k === "clear") SFX.rec();
    else if (k === "sel") tone(660, 880, .06, "triangle", .08);
    else if (k === "ready") [660, 990].forEach((f, i) => tone(f, f, .08, "square", .07, i*.07));
    else if (k === "roar"){ tone(110, 60, .7, "sawtooth", .12); tone(90, 50, .7, "square", .06, .05); }
    else if (k === "fire") tone(300, 120, .12, "sawtooth", .05);
  }
  function addFx(o){ if (FX.length > 260) FX.splice(0, 60); FX.push(o); }
  /* 눈에 보이는 효과 (방장 기기에서 만들면 친구 기기에도 똑같이 보내요) */
  function spark(x, y, z, c = "#fff", n = 8){ ev("sp", x | 0, y | 0, z | 0, c, n); doSpark(x, y, z, c, n); }
  function doSpark(x, y, z, c, n){ for (let i = 0; i < n; i++){ const a = rand()*6.28, s = 2 + rand()*6; addFx({k: "p", x, y, z, vx: Math.cos(a)*s, vz: Math.sin(a)*s + 3, t: 22, c}); } addFx({k: "hb", x, y, z, t: 14, c, r: (x*7 + y*3) % 6}); }
  function num(x, y, z, txt, c){ ev("nm", x | 0, y | 0, z | 0, txt, c); addNum(x, y, z, txt, c); }
  /* 💥 데미지 숫자: 같은 자리에서 연속으로 맞으면 위로 차곡차곡 쌓여요 */
  function addNum(x, y, z, txt, c){ let st = 0; for (const f of FX) if (f.k === "n" && f.t > 22 && Math.abs(f.x - x) < 40) st++; addFx({k: "n", x: x + (st % 2 ? 6 : -6), y, z: z + Math.min(st, 6)*40, txt: String(txt), c, t: 48, T: 48}); }
  function slash(x, y, z, f, big){ ev("sl", x | 0, y | 0, z | 0, f, big ? 1 : 0); addFx({k: "sl", x, y, z, f, big, t: 10}); }
  function boomFx(x, y, r = 80){ ev("bm", x | 0, y | 0, r); addFx({k: "bm", x, y, r, t: 26}); for (let i = 0; i < 14; i++){ const a = rand()*6.28, s = 3 + rand()*7; addFx({k: "p", x, y, z: 30, vx: Math.cos(a)*s, vz: Math.sin(a)*s + 5, t: 30, c: i % 2 ? "#ffd43b" : "#ff6b00"}); } }
  function quake(n){ shake = Math.max(shake, n); ev("q", n); }
  function say(t, s, k = 120){ banner = {t, s, k}; ev("b", t, s || "", k); }

  /* ---------- 🛒 장비 · 🐾 펫 (QG) ---------- */
  function gearOf(p){ const kq = isBot(p.i) ? null : ((Store.kids || {})[p.sid] || {}).qd || null;   // ⚡ 지갑이 바뀔 때만 다시 계산
    if (p.ggq === kq && p.ggc === p.cls && p.ggs === stage && p.gg) return p.gg; p.ggq = kq; p.ggc = p.cls; p.ggs = stage; const key = p.cls + "|" + stage + "|" + (isBot(p.i) ? "b" : JSON.stringify(kq || 0));
    if (p.ggk !== key){ p.ggk = key; p.gg = isBot(p.i) ? QG.botGear(stage) : QG.of(p.sid, QCL[p.cls].id); p.gd = QG.def(QCL[p.cls].id, p.gg); } return p.gg; }
  function applyGear(p){ const g = gearOf(p); p.gs = QG.stats(g); p.mhp = Math.round(QCL[p.cls].hp*p.gs.hpm); p.pet = g.pet; }
  const mhpOf = p => p.mhp || QCL[p.cls].hp;

  /* ---------- 시작 ---------- */
  function mkPlayer(i, cls){
    return {i, sid: SIDS[i], cls, x: 160 + i*70, y: YT + 50 + i*48, z: 0, vz: 0, f: 1, st: "idle", t: 0, hp: QCL[cls].hp, mp: 0, lives: 2, inv: 0, mhp: QCL[cls].hp, gs: QG.stats({}), pcd: 0, pat: 0,
      combo: 0, cT: 0, buf: 0, aid: 0, hits: new Set(), kx: 0, jx: 0, score: 0, ko: 0, ready: false, mv: 0, ai: {t: 0, at: 0}};
  }
  function init(){
    rs = (O.seed || Math.floor(Math.random()*1e9)) % 2147483646 + 1; uid = 1;
    P = SIDS.map((s, i) => mkPlayer(i, (O.cls && O.cls[i] != null) ? O.cls[i] : i % 4));
    E = []; PR = []; IT = []; PROPS = []; FX = []; NQ = []; team = 0; shake = 0; banner = null; flashT = 0; goT = 0; bossId = 0; results = null;
    IN = SIDS.map(() => ({d: 0, a: 0, j: 0, s: 0, q: 0, e: 0, x: 0, p: 0})); LAST = SIDS.map(() => ({a: 0, j: 0, s: 0, q: 0, e: 0, x: 0, p: 0}));
    keys = new Set(); ptr = new Map(); lastSnap = 0; ended = false;
    stage = Math.max(0, Math.min(QD_MAX - 1, O.stage || 0)); camX = 0; phase = "sel"; pt = 60*20; HZ = []; AR = null;
    if (MODE === "boss") stage = qblStage(BLV); else if (MODE === "arena") stage = [15, 0, 10, 20, 5][(O.seed || 0) % 5];
    P.forEach(p => { if (isBot(p.i)){ p.cls = Math.floor(rand()*4); p.ready = true; } });
  }
  function startStage(s){
    stage = s; camX = 0; lockX = null; segI = 0; waveQ = []; E = []; PR = []; IT = []; FX = []; bossId = 0; goT = 0; stageT = 0;
    const S = QST[s];
    PROPS = S.props.map((x, k) => ({id: uid++, k: k % 2 ? "chest" : "barrel", x: x + 300, y: YT + 40 + ((k*97) % 180), hp: 3}));
    P.forEach((p, i) => { if (p.st === "out" && s > 0){ p.st = "idle"; p.lives = 1; } if (p.st === "dead"){ p.st = "idle"; } applyGear(p); if (p.st !== "out"){ Object.assign(p, {x: 120 + i*60, y: YT + 40 + i*50, z: 0, vz: 0, f: 1, st: "idle", t: 0, inv: 90, hp: p.mhp}); } });
    phase = "play"; say(`STAGE ${s + 1}/${QD_MAX}`, `${S.n} · ${S.k + 1}번째 길${S.boss ? (S.mini ? " · 👑 작은 보스" : " · 👑 보스") : ""}`, 160); sfx("go");
    if (TEAM > 1 && s === (O.stage || 0)) setTimeout0(() => say("", `🤝 우정 파워! 친구와 함께라 공격 +${Math.round((TEAM - 1)*100)}% · 받는 피해 ↓`, 160), 120);
    // ⭐ 장비가 추천보다 많이 약하면 알려 줘요
    { const R = QG.rec(s), weak = P.filter(p => !isBot(p.i) && p.st !== "out" && QG.power(p.gg || {}) < R - 4); if (weak.length && R >= 8) setTimeout0(() => say("", `⚠️ 이 단계 추천 장비 ⭐${R} — 🛒 용사 상점에서 강화하면 쉬워져요`, 200), 170); }
  }

  /* ---------- 입력 ---------- */
  /* ⌨️ (2026.11.17) 왼손은 A S D F · Q W E R, 오른손은 방향키 — 대시가 D에 있어서 공격(A)·점프(S) 바로 옆이에요
     A ⚔️공격 · S 🦘점프 · D 💨대시 · F ✨필살 · Q 🌀스킬1 · W 🌊스킬2 · E 🐾펫 · R 💨대시 (예전 J K L ; ' P · 스페이스도 그대로 돼요) */
  const KM = {
    one: {u: ["ArrowUp"], d: ["ArrowDown"], l: ["ArrowLeft"], r: ["ArrowRight"],
          a: ["KeyA", "KeyJ", "KeyZ"], j: ["KeyS", "KeyK", "KeyX"], x: ["KeyD", "KeyR", "Space", "ShiftLeft", "ShiftRight"], s: ["KeyF", "Quote", "KeyB"],
          q: ["KeyQ", "KeyL", "KeyC"], e: ["KeyW", "Semicolon", "KeyV"], p: ["KeyE", "KeyP", "KeyN"]},
    p1:  {u: ["KeyW"], d: ["KeyS"], l: ["KeyA"], r: ["KeyD"], a: ["KeyZ", "KeyF"], j: ["KeyX", "KeyG"], q: ["KeyC"], e: ["KeyV"], s: ["KeyB", "KeyH"], p: ["KeyN"], x: ["ShiftLeft", "KeyQ", "Space"]},
    p2:  {u: ["ArrowUp"], d: ["ArrowDown"], l: ["ArrowLeft"], r: ["ArrowRight"], a: ["KeyJ", "Numpad1"], j: ["KeyK", "Numpad2"], q: ["KeyL", "Numpad4"], e: ["Semicolon", "Numpad5"], s: ["Quote", "Numpad3"], p: ["KeyP", "Numpad6"], x: ["ShiftRight", "Enter", "NumpadEnter", "Numpad0"]}
  };
  const maps = () => local.length >= 2 ? [KM.p1, KM.p2] : [KM.one];
  const has = arr => arr.some(k => keys.has(k));
  function localDir(slot){
    const m = maps()[slot]; let dx = (has(m.r) ? 1 : 0) - (has(m.l) ? 1 : 0), dy = (has(m.d) ? 1 : 0) - (has(m.u) ? 1 : 0);
    if (slot === 0) ptr.forEach(v => { if (v.t === "st" && (v.dx || v.dy)){ dx = v.dx; dy = v.dy; } });
    return qdDir(dx, dy);
  }
  function press(pi, b){ if (party === "guest"){ const u = qdUnpack(PARTY.input.b || 0), k = QB.indexOf(b); if (k >= 0) u[k]++; PARTY.input.b = qdPack(...u); } else IN[pi][b] = (IN[pi][b] || 0) + 1; }
  /* 화면 단추 (손가락) */
  /* 📱 가로가 길쭉한 화면(핸드폰)은 양옆 남는 자리에 단추를 두어 싸움터를 가리지 않아요 */
  const PADS0 = [{t: "st", x: 165, y: 575, r: 105}, {t: "a", x: 1150, y: 600, r: 76, e: "⚔️"}, {t: "j", x: 1012, y: 640, r: 56, e: "🦘"}, {t: "s", x: 1062, y: 488, r: 52, e: "✨"},
    {t: "q", x: 1190, y: 452, r: 42, e: "🌀"}, {t: "e", x: 930, y: 540, r: 42, e: "🌊"}, {t: "x", x: 880, y: 650, r: 42, e: "💨"}, {t: "p", x: 1100, y: 380, r: 38, e: "🐾"}];
  let PADS = PADS0, PX = 0;
  function layout(sw, sh){
    PX = Math.round(Math.max(0, Math.min(420, (H*sw/Math.max(1, sh) - W)/2)));
    if (window.VK_ON){ PX = 0; PADS = []; return; }   // ⌨️ 화면 키보드를 쓸 땐 화면 단추를 숨겨요
    if (PX < 150){ PX = 0; PADS = PADS0; return; }
    const r = Math.round(Math.min(124, PX*.46)), ra = Math.round(Math.min(92, PX*.36)), rj = Math.round(ra*.8), rs = Math.round(ra*.7), bx = W + PX/2;
    const ys = H - ra*2 - rj*2 - rs - 100;
    PADS = [{t: "st", x: -PX/2, y: H - r - 46, r}, {t: "a", x: bx, y: H - ra - 40, r: ra, e: "⚔️"}, {t: "j", x: bx, y: H - ra*2 - rj - 70, r: rj, e: "🦘"}, {t: "s", x: bx, y: ys, r: rs, e: "✨"},
      {t: "q", x: bx - rs*1.1, y: Math.max(rs + 10, ys - rs*2 - 20), r: rs, e: "🌀"}, {t: "e", x: bx + rs*1.1, y: Math.max(rs + 10, ys - rs*2 - 20), r: rs, e: "🌊"}, {t: "x", x: -PX/2, y: Math.max(rs + 10, H - r*2 - rs - 90), r: rs, e: "💨"}, {t: "p", x: bx, y: Math.max(rs + 10, ys - rs*4 - 30), r: Math.round(rs*.85), e: "🐾"}];
  }
  const padAt = (x, y) => !PADS.length ? null : PADS.find(p => Math.hypot(x - p.x, y - p.y) < p.r*1.35) || (x < 0 || (!PX && x < W*.42 && y > H*.45) ? PADS[0] : null);
  function stickSet(v, x, y){ const p = PADS[0];
    if (v.cx == null){ const lim = p.r*1.2; v.cx = Math.max(p.x - lim, Math.min(p.x + lim, x)); v.cy = Math.max(p.y - lim, Math.min(p.y + lim, y)); if (PX){ v.cx = Math.max(-PX + p.r + 6, Math.min(-p.r - 6, v.cx)); v.cy = Math.min(H - p.r*.5, v.cy); } }   // 📱 엄지가 닿은 곳이 막대 가운데
    const dx = x - v.cx, dy = y - v.cy, d = Math.hypot(dx, dy); v.sx = x; v.sy = y;
    if (d < 22){ v.dx = v.dy = 0; return; } const a = Math.atan2(dy, dx), o = Math.round(a/(Math.PI/4)); v.dx = Math.round(Math.cos(o*Math.PI/4)); v.dy = Math.round(Math.sin(o*Math.PI/4)); }

  /* ---------- 공격 ---------- */
  function startAtk(p){ const C = QCL[p.cls]; p.st = "atk"; p.t = 0; p.aid++; p.hits = new Set(); p.buf = 0; p.combo = p.cT > 0 ? (p.combo % 3) + 1 : 1; p.cT = 0; sfx("sw"); }
  function meleeHit(src, reach, dmg, kd, pi, back = 20, band = 42){
    let n = 0;
    E.forEach(e => { if (e.st === "die" || src.hits.has(e.id)) return; const dx = (e.x - src.x)*src.f, D = QEN[e.k], rb = D.boss ? 60 : 0;
      if (dx > -back && dx < reach + rb && Math.abs(e.y - src.y) < band + rb*.5 && e.z < 90 && src.z < 110){ src.hits.add(e.id); hitEnemy(e, dmg, src.f, kd, pi); n++; } });
    PROPS.forEach(b => { if (src.hits.has(b.id)) return; const dx = (b.x - src.x)*src.f; if (dx > -back && dx < reach && Math.abs(b.y - src.y) < band){ src.hits.add(b.id); hitProp(b); } });
    return n;
  }
  function hitEnemy(e, dmg, f, kd, pi){
    if (e.pv != null){ if (e.pv !== pi) pvpHurt(P[e.pv], dmg, f, kd, pi); return; }   // ⚔️ 결투장: 친구 용사를 맞혔어요
    if (e.st === "die" || e.inv > 0) return;
    const D = QEN[e.k], p = P[pi]; let crit = false;
    if (p && p.gs){ dmg *= p.gs.dm*TEAM*(QCL[p.cls].reach ? 1.45 : 1); if (rand() < p.gs.crit){ dmg *= 1.8; crit = true; } }   // 🛒 장비 · 💪 근거리 영웅은 더 세게 · 💥 치명타
    dmg = Math.round(dmg*(.9 + rand()*.2));
    const real = Math.min(dmg, Math.max(0, e.hp)); e.hp -= dmg; e.flash = 6; if (p){ p.mp = Math.min(100, p.mp + real*.9); p.score += real*3; }
    spark(e.x, e.y, (e.z || 0) + (D.boss ? 130 : 80), kd ? "#ffd43b" : "#fff", kd ? 12 : 7); num(e.x, e.y, (e.z || 0) + (D.boss ? 220 : 150), dmg, kd || crit ? "#ffd43b" : "#fff");
    sfx(kd ? "big" : "hit"); if (kd) quake(5);
    if (e.hp <= 0){ e.hp = 0; e.st = "die"; e.t = 0; e.vz = D.boss ? 6 : 9; e.kx = f*(D.boss ? 2 : 6); sfx("die");
      if (p){ p.score += D.sc; p.ko++; } num(e.x, e.y, 200, `+${D.sc}`, "#69db7c");
      if (!D.boss && rand() < .22) drop(e.x, e.y, rand() < .5 ? "coin" : rand() < .6 ? "meat" : "gem");
      if (D.boss) bossDown(e);
      return; }
    if (D.boss){ e.stag = (e.stag || 0) + (kd ? 3 : 1); if (e.stag >= 9 && (e.st === "idle" || e.st === "walk")){ e.stag = 0; e.st = "hurt"; e.t = 0; e.kx = f*3; } return; }
    if (kd){ e.st = "down"; e.t = 0; e.vz = 8; e.kx = f*7; e.z = Math.max(e.z, 1); }
    else { e.st = "hurt"; e.t = 0; e.kx = f*2.5; }
  }
  function hitProp(b){ b.hp--; spark(b.x, b.y, 40, "#c08a50", 6); sfx("hit");
    if (b.hp <= 0){ PROPS.splice(PROPS.indexOf(b), 1); const k = b.k === "chest" ? (rand() < .5 ? "cake" : rand() < .5 ? "gem" : "potion") : (rand() < .6 ? "meat" : rand() < .5 ? "coin" : "gem"); drop(b.x, b.y, k); if (b.k === "chest") drop(b.x + 30, b.y, "coin"); ev("pb", b.id); for (let i = 0; i < 8; i++) addFx({k: "p", x: b.x, y: b.y, z: 30, vx: rr(-5, 5), vz: rr(3, 9), t: 30, c: "#9c6644"}); } }
  function drop(x, y, k){ IT.push({id: uid++, k, x, y: clampN(y, YT + 10, YB - 10), z: 40, vz: 7, t: 60*14}); }
  function shoot(p, k, dy = 0, big){ const C = QCL[p.cls]; PR.push({id: uid++, k, x: p.x + p.f*50, y: p.y + dy, z: 82, vx: p.f*(k === "arrow" ? 16 : 10), vz: 0, f: p.f, pi: p.i, dmg: Math.round(C.dmg[0]*(big ? 1.5 : 1)), t: k === "arrow" ? 50 : 40, hit: new Set(), big}); sfx("shoot"); }
  /* 💨 대시: 바라보는 쪽으로 슝! (잠깐 무적 · 잔상) */
  function startDash(p, dx, dy){ p.st = "dash"; p.t = 0; p.ddx = dx || p.f; p.ddy = dy; if (dx) p.f = dx; p.inv = Math.max(p.inv, 16); p.dcd = p.gs ? p.gs.dcd : 40; p.dbuf = 0; sfx("jump"); addFx({k: "dust", x: p.x, y: p.y, t: 14}); }
  function upDash(p){ const C = QCL[p.cls]; p.t++; p.x += p.ddx*C.spd*3.4*(1 - p.t/14); p.y += p.ddy*C.spd*1.6;
    if (p.t % 2 === 0) addFx({k: "ghost", x: p.x, y: p.y, z: p.z, f: p.f, cls: p.cls, t: 12});
    if (p.t >= 11){ p.st = "idle"; p.t = 0; } }
  /* 🌀 스킬 (R · T) */
  function startSkill(p, n){ const C = QCL[p.cls], K = QSK[C.id][n]; p.st = "skl"; p.sk = n; p.t = 0; p.aid++; p.hits = new Set(); if (n === 0) p.cd1 = K.cd; else p.cd2 = K.cd;
    sfx("spc"); addFx({k: "mc", x: p.x, y: p.y, c: C.c, t: 30}); num(p.x, p.y, 230, `${K.e} ${K.n}!`, C.c); }
  function upSkill(p){ const C = QCL[p.cls], id = C.id, n = p.sk, t = ++p.t, nh = () => { p.aid++; p.hits = new Set(); };
    if (id === "kn" && n === 0){ if (t === 4 || t === 10 || t === 16){ nh(); meleeHit(p, C.reach*1.2, 15, t === 16, p.i); slash(p.x + p.f*40, p.y, 90, p.f, t === 16); } if (t >= 22) p.st = "idle"; }
    else if (id === "kn" && n === 1){ if (t === 6){ shoot(p, "arrow", 0, true); const q = PR[PR.length - 1]; q.wave = 1; q.dmg = 28; q.t = 60; q.vx = p.f*13; } if (t >= 16) p.st = "idle"; }
    else if (id === "ln" && n === 0){ if (t === 5 || t === 12){ nh(); meleeHit(p, C.reach, 16, true, p.i); p.f = -p.f; nh(); meleeHit(p, C.reach, 16, true, p.i); p.f = -p.f; slash(p.x + 40, p.y, 90, 1, true); slash(p.x - 40, p.y, 90, -1, true); } if (t >= 18) p.st = "idle"; }
    else if (id === "ln" && n === 1){ p.x += p.f*C.spd*3; p.inv = Math.max(p.inv, 4); meleeHit(p, 120, 24, true, p.i); if (t % 2) addFx({k: "ghost", x: p.x, y: p.y, z: p.z, f: p.f, cls: p.cls, t: 10}); if (t >= 18) p.st = "idle"; }
    else if (id === "ar" && n === 0){ if (t === 4 || t === 12){ shoot(p, "arrow", -30); shoot(p, "arrow", 0); shoot(p, "arrow", 30); } if (t >= 18) p.st = "idle"; }
    else if (id === "ar" && n === 1){ if (t === 6){ shoot(p, "orb", 0, true); const q = PR[PR.length - 1]; q.dmg = 34; } if (t >= 16) p.st = "idle"; }
    else if (id === "wz" && n === 0){ if (t === 8){ let tg = null, bd = 700; E.forEach(e => { if (e.st === "die") return; const d = Math.abs(e.x - p.x) + Math.abs(e.y - p.y); if (d < bd){ bd = d; tg = e; } });
        if (tg){ hitEnemy(tg, 38, p.f, true, p.i); boomFx(tg.x, tg.y, 90); addFx({k: "bolt", x: tg.x, y: tg.y, t: 14}); ev("bt", tg.x | 0, tg.y | 0); quake(4); } } if (t >= 18) p.st = "idle"; }
    else if (id === "wz" && n === 1){ if (t === 6) (MODE === "arena" ? [p] : P).forEach(q => { if (!alive(q)) return; const add = Math.round(mhpOf(q)*.35); q.hp = Math.min(mhpOf(q), q.hp + add); num(q.x, q.y, 200, `+${add}`, "#69db7c"); addFx({k: "mc", x: q.x, y: q.y, c: "#69db7c", t: 30}); }); if (t >= 18) p.st = "idle"; }
    else p.st = "idle";
    if (p.st === "idle") p.t = 0; }
  /* 🐾 펫: 따라다니며 콕콕 + 펫 스킬 (P) */
  const petXY = p => [p.x - p.f*58, p.y - 4, (p.z || 0) + 118 + Math.sin(NG.frame*.12 + p.i)*8];
  function petAuto(p){ if (!p.pet) return; if (++p.pat < 48) return; p.pat = 0;
    let tg = null, bd = 520; E.forEach(e => { if (e.st === "die") return; const d = Math.abs(e.x - p.x) + Math.abs(e.y - p.y); if (d < bd){ bd = d; tg = e; } });
    if (!tg) return; const [px, py, pz] = petXY(p), P0 = QG.PETS.find(q => q.id === p.pet) || {c: "#fff"};
    zap(px, py - pz, tg.x, tg.y - (tg.z || 0) - 80, P0.c); hitEnemy(tg, 6 + Math.min(10, stage*.08), p.f, false, p.i); }
  function zap(x0, y0, x1, y1, c){ ev("zp", x0 | 0, y0 | 0, x1 | 0, y1 | 0, c); addFx({k: "zp", x0, y0, x1, y1, c, t: 12}); }
  function petSkill(p){
    if (!p.pet){ num(p.x, p.y, 210, "🐾 펫이 없어요 · 🛒 상점에서 데려와요", "#adb5bd"); return; }
    if (p.pcd > 0) return;
    const P0 = QG.PETS.find(q => q.id === p.pet); if (!P0) return; const [px, py, pz] = petXY(p);
    p.pcd = p.pet === "uni" || p.pet === "eagle" ? 780 : 600; sfx("spc"); num(p.x, p.y, 250, `${P0.e} ${P0.sk}!`, P0.c); addFx({k: "mc", x: px, y: py, c: P0.c, t: 30});
    const near = (r) => ens().filter(e => Math.abs(e.x - p.x) < r && Math.abs(e.y - p.y) < r*.4);
    if (p.pet === "fox"){ ens().filter(e => e.x > camX - 20 && e.x < camX + W + 20).sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x)).slice(0, 3).forEach(e => { zap(px, py - pz, e.x, e.y - 80, "#ff922b"); hitEnemy(e, 34, p.f, true, p.i); boomFx(e.x, e.y, 70); }); }
    else if (p.pet === "turtle"){ p.inv = Math.max(p.inv, 180); const add = Math.round(mhpOf(p)*.25); p.hp = Math.min(mhpOf(p), p.hp + add); num(p.x, p.y, 200, `🛡️ +${add}`, "#69db7c"); addFx({k: "mc", x: p.x, y: p.y, c: "#51cf66", t: 60}); }
    else if (p.pet === "panda"){ quake(8); boomFx(p.x, p.y, 200); near(260).forEach(e => hitEnemy(e, 40, e.x > p.x ? 1 : -1, true, p.i)); }
    else if (p.pet === "dragon"){ for (let k = 0; k < 6; k++) setTimeout0(() => { const fx = p.x + p.f*(90 + k*70); boomFx(fx, p.y, 80); ens().forEach(e => { if (Math.abs(e.x - fx) < 70 && Math.abs(e.y - p.y) < 60) hitEnemy(e, 16, p.f, k === 5, p.i); }); sfx("fire"); }, k*6); }
    else if (p.pet === "eagle"){ flashT = 10; flashC = "#74c0fc"; ev("fl", 10, "#74c0fc"); ens().filter(e => e.x > camX - 20 && e.x < camX + W + 20).slice(0, 14).forEach((e, k) => setTimeout0(() => { zap(e.x - 60, 60, e.x, e.y - 80, "#74c0fc"); hitEnemy(e, 26, e.x > p.x ? 1 : -1, true, p.i); }, k*3)); }
    else if (p.pet === "uni"){ P.forEach(q => { if (!alive(q)) return; const add = Math.round(mhpOf(q)*.3); q.hp = Math.min(mhpOf(q), q.hp + add); q.mp = Math.min(100, q.mp + 40); num(q.x, q.y, 200, `🌈 +${add}`, "#69db7c"); addFx({k: "mc", x: q.x, y: q.y, c: "#f783ac", t: 40}); }); }
  }
  function special(p){
    p.mp = 0; p.st = "spc"; p.t = 0; p.inv = 60; p.aid++; p.hits = new Set(); sfx("spc"); flashT = 14; flashC = QCL[p.cls].c; ev("fl", 14, QCL[p.cls].c);
    num(p.x, p.y, 230, `${QCL[p.cls].e} ${QCL[p.cls].sp}!`, QCL[p.cls].c);
  }
  function upSpecial(p){
    const c = QCL[p.cls].id, t = ++p.t;
    if (c === "kn"){ if (t % 4 === 0) p.f = -p.f; if (t === 8 || t === 20 || t === 32){ p.hits = new Set(); slash(p.x, p.y, 80, 1, true); slash(p.x, p.y, 80, -1, true);
        E.forEach(e => { if (e.st !== "die" && Math.abs(e.x - p.x) < 190 && Math.abs(e.y - p.y) < 70) hitEnemy(e, 20, e.x > p.x ? 1 : -1, t === 32, p.i); }); }
      if (t > 40) p.st = "idle"; }
    else if (c === "ln"){ if (t > 4 && t < 30){ p.x += p.f*16; if (t % 3 === 0) addFx({k: "p", x: p.x - p.f*30, y: p.y, z: 10, vx: -p.f*2, vz: 2, t: 16, c: "#ced4da"}); meleeHit(p, 110, 30, true, p.i, 30, 55); }
      if (t > 36) p.st = "idle"; }
    else if (c === "ar"){ if (t >= 6 && t <= 30 && t % 3 === 0){ const k = (t - 6)/3; PR.push({id: uid++, k: "rain", x: p.x + p.f*(140 + k*85), y: p.y + rr(-60, 60), z: 520, vx: 0, vz: -22, f: p.f, pi: p.i, dmg: 22, t: 60, hit: new Set()}); }
      if (t > 40) p.st = "idle"; }
    else if (c === "wz"){ if (t === 12){ const L = ens().filter(e => e.x > camX - 20 && e.x < camX + W + 20).slice(0, 9);
        (L.length ? L : [{x: p.x + p.f*300, y: p.y}]).forEach((e, k) => PR.push({id: uid++, k: "met", x: e.x - 120 + k*8, y: e.y, z: 620 + k*40, vx: 5, vz: -18, f: 1, pi: p.i, dmg: 34, t: 90, hit: new Set()})); }
      if (t > 40) p.st = "idle"; }
  }

  /* ---------- 용사 움직이기 ---------- */
  function upPlayer(p){
    const inp = IN[p.i], L = LAST[p.i], pa = inp.a !== L.a, pj = inp.j !== L.j, ps = inp.s !== L.s, pq = (inp.q | 0) !== (L.q | 0), pe = (inp.e | 0) !== (L.e | 0), ppet = (inp.p | 0) !== (L.p | 0);
    if ((inp.x | 0) !== (L.x | 0)) p.dbuf = 14;   // 💨 대시는 조금 일찍 눌러도 기억해 뒀다가 바로 써요
    const pxd = (p.dbuf || 0) > 0; if (p.dbuf > 0) p.dbuf--;
    QB.forEach(k => { L[k] = inp[k] | 0; });
    p.cd1 = Math.max(0, (p.cd1 || 0) - 1); p.cd2 = Math.max(0, (p.cd2 || 0) - 1); p.dcd = Math.max(0, (p.dcd || 0) - 1); p.pcd = Math.max(0, (p.pcd || 0) - 1);
    if (p.st === "out") return;
    if (alive(p) && phase === "play"){ if (ppet) petSkill(p); petAuto(p); if (p.gs.regen && p.hp < mhpOf(p)) p.hp = Math.min(mhpOf(p), p.hp + mhpOf(p)*p.gs.regen/60); }
    if (p.inv > 0) p.inv--;
    const C = QCL[p.cls], [dx, dy] = QDIR[inp.d || 0];
    // 공중
    if (p.z > 0 || p.vz){ p.vz -= .95; p.z += p.vz; if (p.st === "down" || p.st === "dead" || p.st === "hurt") p.x += p.kx;
      if (p.z <= 0){ p.z = 0; p.vz = 0; if (p.st === "jump" || p.st === "jatk"){ p.st = "idle"; p.t = 0; addFx({k: "dust", x: p.x, y: p.y, t: 14}); } } }
    if (p.cT > 0) p.cT--;
    p.mv = 0;
    switch (p.st){
      case "dead": p.t++; if (p.t > 150){ if (p.lives > 0){ p.lives--; Object.assign(p, {st: "jump", z: 420, vz: 0, x: camX + W*.4 + p.i*40, y: YT + 60 + p.i*40, hp: mhpOf(p), inv: 150, t: 0, jx: 0}); say("", `${who(noOf_(p.sid))} 다시 출동!`, 80); }
        else { p.st = "out"; checkOver(); } } return;
      case "idle": case "walk":
        p.mp = Math.min(100, p.mp + .03);
        if (ps && p.mp >= 100){ special(p); break; }
        if (ps) num(p.x, p.y, 200, "✨ 기운이 모자라요", "#adb5bd");
        if (pxd && p.dcd <= 0){ startDash(p, dx, dy); break; }
        if (pq && p.cd1 <= 0){ startSkill(p, 0); break; }
        if (pe && p.cd2 <= 0){ startSkill(p, 1); break; }
        if (pa){ startAtk(p); break; }
        if (pj){ p.st = "jump"; p.vz = 16*p.gs.jmp; p.z = 1; p.jx = dx*C.spd*1.1; p.t = 0; sfx("jump"); break; }
        if (dx || dy){ const sp = C.spd*p.gs.spm; p.x += dx*sp; p.y += dy*sp*.62; if (dx) p.f = dx; p.st = "walk"; p.mv = 1; } else p.st = "idle";
        p.t++; break;
      case "jump": if (pxd && p.dcd <= 0){ startDash(p, dx, dy); break; } p.x += p.jx; p.y += dy*1.4; p.t++; if (pa){ p.st = "jatk"; p.t = 0; p.aid++; p.hits = new Set(); sfx("sw"); } break;
      case "jatk": p.x += p.jx; p.t++; if (p.t >= 3 && p.t <= 14){ if (C.reach) meleeHit(p, C.reach*.85, C.dmg[2]*.8, true, p.i); else if (p.t === 4) shoot(p, C.id === "ar" ? "arrow" : "orb", 0, true); } break;
      case "dash": upDash(p); break;
      case "skl": upSkill(p); if (pxd && p.dcd <= 0 && p.t > 8 && p.st === "skl"){ startDash(p, dx, dy); } break;
      case "atk": {
        if (pxd && p.dcd <= 0){ startDash(p, dx, dy); break; }   // 공격 중에도 대시로 빠지기
        p.t++; if (pa && p.t > 3) p.buf = 1;
        if (p.t === 6){ const step = p.combo - 1, kd = p.combo === 3;
          if (C.reach){ meleeHit(p, C.reach, C.dmg[step], kd, p.i); slash(p.x + p.f*40, p.y, 90, p.f, kd); }
          else if (C.id === "ar"){ if (kd){ shoot(p, "arrow", -26); shoot(p, "arrow", 0); shoot(p, "arrow", 26); } else shoot(p, "arrow"); }
          else shoot(p, "orb", 0, kd); }
        if (p.t >= (p.combo === 3 ? 20 : 14)){ if (p.buf && p.combo < 3){ p.cT = 10; startAtk(p); } else { p.st = "idle"; p.t = 0; p.cT = p.combo < 3 ? 12 : 0; if (p.combo === 3) p.combo = 0; } }
        break; }
      case "spc": upSpecial(p); break;
      case "hurt": p.t++; p.x += p.kx; p.kx *= .8; if (p.t > 16){ p.st = "idle"; p.t = 0; } else if (pxd && p.dcd <= 0 && p.t > 6){ startDash(p, dx, dy); } break;
      case "down": p.t++; if (p.z === 0) p.kx *= .8; if (p.t > 56){ p.st = "idle"; p.t = 0; p.inv = 70; } break;
    }
    // 먹을 것 줍기
    if (p.z < 10 && alive(p)) for (let k = IT.length - 1; k >= 0; k--){ const it = IT[k]; if (it.z < 10 && Math.abs(it.x - p.x) < 46 && Math.abs(it.y - p.y) < 30){ IT.splice(k, 1); pick(p, it); } }
    const lo = (lockX != null ? lockX : camX) + 30, hi = Math.min(QST[stage].len - 30, (lockX != null ? lockX : camX) + W - 30);
    p.x = clampN(p.x, Math.max(lo, camX + 30), hi); p.y = clampN(p.y, YT, YB);
  }
  function pick(p, it){
    const C = QCL[p.cls];
    if (it.k === "meat"){ p.hp = Math.min(mhpOf(p), p.hp + Math.round(mhpOf(p)*.35)); num(p.x, p.y, 200, "🍗 +45", "#ff8787"); sfx("item"); }
    else if (it.k === "cake"){ p.hp = mhpOf(p); num(p.x, p.y, 200, "🎂 체력 가득!", "#ff8787"); sfx("item"); }
    else if (it.k === "potion"){ p.mp = 100; num(p.x, p.y, 200, "🧪 필살기 가득!", "#cc5de8"); sfx("item"); }
    else if (it.k === "gem"){ p.score += 500; num(p.x, p.y, 200, "💎 +500", "#74c0fc"); sfx("coin"); }
    else { p.score += 100; num(p.x, p.y, 200, "🪙 +100", "#ffd43b"); sfx("coin"); }
  }
  function hurtPlayer(p, dmg, f, kd){
    if (!alive(p) || p.inv > 0 || p.st === "down" || p.st === "spc") return false;
    dmg = Math.max(1, Math.round(dmg*edm()*(1 - (p.gs ? p.gs.dr : 0))/(1 + (TEAM - 1)*.6)));
    if (MODE === "boss" && !isBot(p.i)) p.hitN = (p.hitN || 0) + 1;   // ⭐ 덜 맞을수록 별이 많아요   // 💪 단계가 오를수록 아프게 · 🛡️ 갑옷이 막아 줘요
    p.hp -= dmg; p.inv = 12; spark(p.x, p.y, p.z + 90, "#ff6b6b", 8); num(p.x, p.y, p.z + 170, `-${dmg}`, "#ff6b6b"); sfx("ouch");
    if (p.hp <= 0){ p.hp = 0; p.st = "dead"; p.t = 0; p.vz = 9; p.z = Math.max(1, p.z); p.kx = f*5; quake(6); say("", `💫 ${who(noOf_(p.sid))} 쓰러졌어요!`, 70); return true; }
    if (kd){ p.st = "down"; p.t = 0; p.vz = 8; p.z = Math.max(1, p.z); p.kx = f*6; quake(4); }
    else { p.st = "hurt"; p.t = 0; p.kx = f*3; }
    return true;
  }
  function checkOver(){ if (MODE === "arena") return; if (!P.some(p => p.st !== "out")) finish(false); }
  const edm = () => MODE === "boss" ? 1 + BLV*.045 : QG.ED(stage);
  /* =========================== 👑 보스 도전 =========================== */
  const hitsNow = () => HUM.reduce((a, i) => a + (P[i].hitN || 0), 0);
  function starsNow(){ const h = hitsNow(), n = Math.max(1, HUM.length); return h <= 2*n ? 3 : h <= 6*n ? 2 : 1; }   // ⭐⭐⭐: 거의 안 맞고 이기기
  function startBoss(){
    camX = 0; lockX = 0; segI = 99; waveQ = []; E = []; PR = []; IT = []; FX = []; PROPS = []; HZ = []; pend = []; bossId = 0; goT = 0; stageT = 0;
    BT = 60*(100 + Math.min(80, BLV*3));
    P.forEach((p, i) => { applyGear(p); if (p.gs){ p.gs = Object.assign({}, p.gs, {dm: Math.min(2.5, p.gs.dm), hpm: Math.min(2.5, p.gs.hpm)}); p.mhp = Math.round(QCL[p.cls].hp*p.gs.hpm); }   // 🛒 장비는 조금만 (실력 싸움!)
      Object.assign(p, {x: 180 + i*50, y: YT + 50 + i*50, z: 0, vz: 0, f: 1, st: "idle", t: 0, inv: 120, hp: p.mhp, lives: 1, hitN: 0}); });
    phase = "play";
    const b = spawn(QBL[BLV], 1, W*.74); b.y = (YT + YB)/2; bossId = b.id; b.cd = 90; b.sk = 150; b.pc = 0;
    say(`👑 보스 도전 ${BLV + 1}단계`, `${QEN[QBL[BLV]].n} · 빨간 경고를 보고 피해요!`, 170); sfx("boss"); quake(8);
  }
  /* 보스 기술: 자기 기술(뛰어 찍기·돌진·불·눈덩이) + ☄️ 떨어지는 돌 · 💫 충격파(점프로 넘어요) · ⚡ 줄 번개(빈 줄로 피해요) */
  function bossPat(e, D, tg){
    if (e.st === "cast"){ if (e.t > 36){ e.st = "walk"; e.t = 0; } return true; }
    if (e.st !== "walk" && e.st !== "idle") return false;
    if (!e.rage && e.hp < e.mhp*.5){ e.rage = 1; e.sk = Math.min(e.sk, 40); sfx("roar"); quake(10); say("", `😡 ${D.n}이(가) 화났어요! 기술이 빨라져요`, 110); flashT = 16; flashC = "#ff6b6b"; }
    if (e.sk > 0) return false;
    const c = (e.pc = (e.pc || 0) + 1) % (BLV < 2 ? 2 : 3);
    if (c === 1) return false;   // 보스 자기 기술 (아래 원래 코드)
    e.st = "cast"; e.t = 0; e.sk = (e.rage ? 150 : 220) - Math.min(70, BLV*3); sfx("roar");
    const lv = BLV + (e.rage ? 3 : 0);
    if (c === 2 && BLV >= 2 && (e.pc >> 1) % 2){ // ⚡ 줄 번개
      const n = 4, hgt = (YB - YT + 30)/n, safe = Math.floor(rand()*n), safe2 = lv < 6 ? (safe + 2) % n : -1;
      for (let k = 0; k < n; k++) if (k !== safe && k !== safe2) HZ.push({k: "lane", y0: YT - 15 + k*hgt, y1: YT - 15 + (k + 1)*hgt, t: 0, T: Math.max(42, 66 - lv*2), dmg: 13});
      say("", "⚡ 줄 번개! 빈 줄로 피해요", 70); return true; }
    if (c === 0 && BLV >= 1){ // 💫 충격파: 점프!
      HZ.push({k: "ring", x: e.x, y: e.y, r: 0, t: 0, T: 30, sp: 7 + Math.min(5, lv*.4), dmg: 12, hit: new Set()});
      if (lv >= 8) HZ.push({k: "ring", x: e.x, y: e.y, r: 0, t: -40, T: 30, sp: 7 + Math.min(5, lv*.4), dmg: 12, hit: new Set()});
      say("", "💫 충격파! 🦘 점프로 넘어요", 70); return true; }
    // ☄️ 떨어지는 돌: 용사 발밑 + 여기저기
    const nr = 3 + Math.min(6, Math.floor(lv/2)), T = Math.max(40, 64 - lv*2);
    live().forEach(p => HZ.push({k: "met", x: p.x, y: p.y, r: 92, t: 0, T, dmg: 14}));
    for (let i = 0; i < nr; i++) HZ.push({k: "met", x: 80 + rand()*(W - 160), y: YT + 10 + rand()*(YB - YT - 20), r: 80 + rand()*30, t: -i*5, T, dmg: 14});
    return true;
  }
  function upHz(){
    for (let k = HZ.length - 1; k >= 0; k--){ const h = HZ[k]; h.t++;
      if (h.k === "met"){ if (h.t === h.T){ boomFx(h.x, h.y, h.r*1.4); sfx("boom"); quake(4);
          P.forEach(p => { if (alive(p) && p.z < 60 && ((p.x - h.x)/h.r)**2 + ((p.y - h.y)/(h.r*.42))**2 < 1) hurtPlayer(p, h.dmg, p.x > h.x ? 1 : -1, true); }); }
        if (h.t > h.T + 8) HZ.splice(k, 1); }
      else if (h.k === "lane"){ if (h.t === h.T){ sfx("boom"); quake(6); flashT = 6; flashC = "#ffe066";
          P.forEach(p => { if (alive(p) && p.y >= h.y0 && p.y < h.y1) hurtPlayer(p, h.dmg, p.f, true); }); }
        if (h.t > h.T + 14) HZ.splice(k, 1); }
      else if (h.k === "ring"){ if (h.t > h.T){ h.r += h.sp;
          P.forEach(p => { if (!alive(p) || h.hit.has(p.i)) return; const d = Math.hypot(p.x - h.x, (p.y - h.y)*2.4); if (Math.abs(d - h.r) < 24 && p.z < 26){ h.hit.add(p.i); hurtPlayer(p, h.dmg, p.x > h.x ? 1 : -1, true); } });
          if (h.r > 1500) HZ.splice(k, 1); } }
    }
  }
  function drawHz(g){
    HZ.forEach(h => { const a = Math.max(0, Math.min(1, h.t/h.T));
      if (h.k === "met"){ if (h.t < 0 || h.t > h.T) return; const x = h.x - camX; g.save(); g.globalAlpha = .28 + .25*Math.sin(h.t*.4); g.fillStyle = "#ff2d2d"; g.beginPath(); g.ellipse(x, h.y, h.r, h.r*.42, 0, 0, 7); g.fill();
        g.globalAlpha = .75; g.fillStyle = "#ff6b6b"; g.beginPath(); g.ellipse(x, h.y, h.r*a, h.r*.42*a, 0, 0, 7); g.fill(); g.globalAlpha = 1; g.strokeStyle = "#fff"; g.lineWidth = 3; g.beginPath(); g.ellipse(x, h.y, h.r, h.r*.42, 0, 0, 7); g.stroke();
        const rk = 700*(1 - a); g.fillStyle = "#5c3d2e"; g.beginPath(); g.arc(x + rk*.25, h.y - 40 - rk, 22, 0, 7); g.fill(); g.restore(); }
      else if (h.k === "lane"){ const blink = h.t < h.T ? .18 + .22*((h.t >> 3) % 2) : Math.max(0, 1 - (h.t - h.T)/14); g.save();
        if (h.t < h.T){ g.globalAlpha = blink; g.fillStyle = "#ff2d2d"; g.fillRect(0, h.y0, W, h.y1 - h.y0); g.globalAlpha = .9; g.fillStyle = "#ff6b6b"; g.fillRect(0, h.y0, W*a, 4); g.fillRect(0, h.y1 - 4, W*a, 4); outlined(g, "⚡", 40, (h.y0 + h.y1)/2, 28, "#ffe066"); }
        else { g.globalAlpha = blink; g.fillStyle = "#fff9db"; g.fillRect(0, h.y0 + 6, W, h.y1 - h.y0 - 12); g.fillStyle = "#ffd43b"; g.fillRect(0, h.y0, W, 6); g.fillRect(0, h.y1 - 6, W, 6); }
        g.restore(); }
      else if (h.k === "ring"){ if (h.t < 0) return; const x = h.x - camX; g.save();
        if (h.t <= h.T){ g.globalAlpha = .5 + .4*Math.sin(h.t*.6); g.strokeStyle = "#ff6b6b"; g.lineWidth = 6; g.beginPath(); g.ellipse(x, h.y, 60 + h.t*2, (60 + h.t*2)/2.4, 0, 0, 7); g.stroke(); }
        else { g.globalAlpha = .9; g.strokeStyle = "#fff"; g.lineWidth = 10; g.beginPath(); g.ellipse(x, h.y, h.r, h.r/2.4, 0, 0, 7); g.stroke(); g.strokeStyle = "#ff922b"; g.lineWidth = 5; g.stroke(); }
        g.restore(); } });
    // 보스 기술 미리 보기: 뛰어 찍기 자리 · 돌진 줄 · 눈덩이 자리
    E.forEach(e => { if (!QEN[e.k].boss || e.st === "die") return; g.save();
      if (e.st === "bjump"){ g.globalAlpha = .35 + .2*Math.sin(NG.frame*.5); g.fillStyle = "#ff2d2d"; g.beginPath(); g.ellipse(e.jx - camX, e.jy, 190, 80, 0, 0, 7); g.fill(); }
      else if (e.st === "chg0"){ g.globalAlpha = .22 + .15*Math.sin(NG.frame*.5); g.fillStyle = "#ff2d2d"; g.fillRect(0, e.y - 50, W, 100); }
      else if (e.st === "throw" && e.t < 20){ const tg = target(e); if (tg){ g.globalAlpha = .4; g.fillStyle = "#ff2d2d"; g.beginPath(); g.ellipse(tg.x - camX, tg.y, 80, 46, 0, 0, 7); g.fill(); } }
      g.restore(); });
  }

  /* =========================== ⚔️ 결투장 =========================== */
  /* 장비 없이 모두 같은 힘 · 3판 2선승 · 한 판 60초 (시간이 끝나면 체력이 많이 남은 친구가 이겨요) */
  function startArena(){
    camX = 0; lockX = 0; segI = 99; waveQ = []; E = []; PR = []; IT = []; FX = []; PROPS = []; HZ = []; pend = []; bossId = 0; goT = 0; stageT = 0;
    AR = AR || {w: P.map(() => 0), rd: 0}; AR.rd++; AR.t = 60*60; AR.end = 0;
    const n = P.length;
    P.forEach((p, i) => { p.gs = QG.stats({}); p.mhp = Math.round(QCL[p.cls].hp*1.5); p.pet = null;
      const xs = n === 2 ? [W*.25, W*.75] : [W*.18, W*.82, W*.42, W*.58];
      Object.assign(p, {x: xs[i], y: YT + 40 + (n > 2 ? (i % 2)*120 : 70), z: 0, vz: 0, f: xs[i] < W/2 ? 1 : -1, st: "idle", t: 0, inv: 0, hp: p.mhp, mp: 30, lives: 0, cd1: 0, cd2: 0, dcd: 0, kx: 0}); });
    phase = "rdy"; pt = 120; say(`ROUND ${AR.rd}`, P.map((p, i) => `${i + 1}P ${"★".repeat(AR.w[i])}`).join("  vs  "), 100); sfx("go");
  }
  function pvpHurt(t, dmg, f, kd, pi){
    if (!t || !alive(t) || t.inv > 0 || t.st === "down" || t.st === "spc" || phase !== "play") return;
    const a = P[pi]; dmg = Math.max(1, Math.round(dmg*.8*(.9 + rand()*.2)));
    t.hp -= dmg; t.inv = 10; if (a){ a.mp = Math.min(100, a.mp + dmg*1.4); a.score += dmg; }
    spark(t.x, t.y, t.z + 90, kd ? "#ffd43b" : "#ff6b6b", kd ? 12 : 8); num(t.x, t.y, t.z + 170, `-${dmg}`, kd ? "#ffd43b" : "#ff6b6b"); sfx(kd ? "big" : "hit"); if (kd) quake(4);
    if (t.hp <= 0){ t.hp = 0; t.st = "dead"; t.t = 0; t.vz = 9; t.z = Math.max(1, t.z); t.kx = f*5; quake(8); if (a) a.ko++; return; }
    if (kd){ t.st = "down"; t.t = 0; t.vz = 8; t.z = Math.max(1, t.z); t.kx = f*6; } else { t.st = "hurt"; t.t = 0; t.kx = f*3; }
  }
  function arenaStep(){
    stageT++;
    if (phase === "rdy"){ if (--pt <= 0){ phase = "play"; say("FIGHT!", "", 50); sfx("boss"); } return; }
    if (phase === "rend"){ P.forEach(p => { if (p.z > 0 || p.vz){ p.vz -= .95; p.z = Math.max(0, p.z + p.vz); if (p.z === 0) p.vz = 0; p.x = clampN(p.x + (p.kx || 0), 30, W - 30); } if (p.kx) p.kx *= .85; p.t++; if (p.st !== "dead" && p.st !== "idle" && p.z === 0){ p.st = "idle"; p.t = 0; } }); if (--pt <= 0){ if (Math.max(...AR.w) >= 2) finish(true); else startArena(); } return; }
    if (phase !== "play") return;
    const PV = P.map(p => ({id: 900000 + p.i, pv: p.i, k: "pvp", x: p.x, y: p.y, z: p.z, f: p.f, st: alive(p) && p.st !== "dead" ? "walk" : "die", hp: p.hp, mhp: p.mhp, inv: 0, flash: 0}));
    P.forEach(p => { if (isBot(p.i)){ E = PV.filter(q => q.pv !== p.i && q.st !== "die"); botThink(p); } });
    P.forEach(p => { E = PV.filter(q => q.pv !== p.i); if (p.st !== "dead") upPlayer(p); else { p.t++; if (p.z > 0 || p.vz){ p.vz -= .95; p.z = Math.max(0, p.z + p.vz); if (p.z === 0) p.vz = 0; p.x = clampN(p.x + p.kx, 30, W - 30); } } });
    E = PV; upShots(); E = [];
    for (let k = pend.length - 1; k >= 0; k--) if (pend[k].at <= stageT){ const f = pend[k].fn; pend.splice(k, 1); E = PV; f(); E = []; }
    AR.t--;
    const up = P.filter(p => p.st !== "dead");
    if (up.length <= 1 || AR.t <= 0){
      const w = up.length === 1 ? up[0] : up.slice().sort((a, b) => b.hp/b.mhp - a.hp/a.mhp)[0];
      if (w){ AR.w[w.i]++; say(`${w.i + 1}P 승리!`, `${who(noOf_(w.sid))} ${"★".repeat(AR.w[w.i])}${AR.t <= 0 ? " · ⏰ 체력이 더 많이 남았어요" : ""}`, 150); }
      else say("무승부!", "", 120);
      phase = "rend"; pt = 170; sfx("clear"); PR = []; }
  }


  /* ---------- 🤖 동료 (컴퓨터) ---------- */
  function botThink(p){
    const inp = IN[p.i], A = p.ai, C = QCL[p.cls]; inp.d = 0;
    if (!alive(p) || p.st === "spc") return;
    const L = ens(); let tg = null, best = 1e9;
    L.forEach(e => { const d = Math.abs(e.x - p.x) + Math.abs(e.y - p.y)*2; if (d < best){ best = d; tg = e; } });
    let tx, ty;
    if (!tg){ const lead = P.find(q => !isBot(q.i) && alive(q)) || P[0]; tx = lead.x - 120 - p.i*20; ty = lead.y + (p.i % 2 ? 40 : -40); }
    else { const side = p.x < tg.x ? -1 : 1, rng = C.reach ? C.reach*.7 : 340; tx = tg.x + side*rng; ty = tg.y; }
    const dx = Math.abs(tx - p.x) > 14 ? Math.sign(tx - p.x) : 0, dy = Math.abs(ty - p.y) > 10 ? Math.sign(ty - p.y) : 0;
    inp.d = qdDir(dx, dy);
    if (tg){ const fdir = Math.sign(tg.x - p.x) || 1, inR = Math.abs(tg.y - p.y) < 22 && (C.reach ? Math.abs(tg.x - p.x) < C.reach + 10 : Math.abs(tg.x - p.x) < 640);
      if (inR && dx === 0 && p.f !== fdir) inp.d = qdDir(fdir, 0);
      if (inR && p.f === fdir && ++A.t > 9){ A.t = 0; inp.a++; }
      if (p.mp >= 100 && L.filter(e => Math.abs(e.x - p.x) < 300).length >= 2 && (p.st === "idle" || p.st === "walk")) inp.s++;
      if ((p.st === "idle" || p.st === "walk") && L.some(e => Math.abs(e.x - p.x) < 260 && Math.abs(e.y - p.y) < 60)){ if (!p.cd1 && rand() < .03) inp.q = (inp.q | 0) + 1; else if (!p.cd2 && rand() < .015) inp.e = (inp.e | 0) + 1; } }
  }

  /* ---------- 적 ---------- */
  function spawn(k, side, x){
    const D = QEN[k], e = {id: uid++, k, x: x != null ? x : side < 0 ? camX - 90 : camX + W + 90, y: YT + 20 + rand()*(YB - YT - 40), z: 0, vz: 0, f: side < 0 ? 1 : -1, st: "walk", t: 0,
      hp: Math.round(MODE === "boss" ? D.hp*(1.35 + .45*(HUM.length - 1))*(1 + BLV*.03) : D.hp*(D.boss ? bmult*(QST[stage].mini ? .6 : 1)*QG.SD(stage)*.85 : emult*QG.SD(stage))), cd: 40 + rand()*60, yo: rr(-14, 14), kx: 0, flash: 0, inv: 0, ag: 0, tg: -1, ph: 0, sk: 220 + rand()*120};
    e.mhp = e.hp; E.push(e); return e;
  }
  function target(e){ let tg = null, best = 1e9; P.forEach(p => { if (!alive(p)) return; const d = Math.abs(p.x - e.x) + Math.abs(p.y - e.y)*1.5 + (p.i === e.tg ? -120 : 0); if (d < best){ best = d; tg = p; } }); return tg; }
  function upEnemy(e){
    const D = QEN[e.k]; if (e.flash > 0) e.flash--; if (e.inv > 0) e.inv--;
    if (e.z > 0 || e.vz){ e.vz -= .8; e.z += e.vz; e.x += e.kx; if (e.z <= 0){ e.z = 0; e.vz = 0; if (e.st === "down"){ quake(1); addFx({k: "dust", x: e.x, y: e.y, t: 14}); } if (e.st === "bjump") bossLand(e); } }
    e.t++;
    if (e.st === "die"){ if (e.z === 0) e.kx *= .85; if (e.t > (D.boss ? 90 : 46)) e.gone = 1; return; }
    if (e.st === "down"){ if (e.z === 0) e.kx *= .8; if (e.t > 60){ e.st = "walk"; e.t = 0; e.inv = 25; } return; }
    if (e.st === "hurt"){ e.x += e.kx; e.kx *= .8; if (e.t > 15){ e.st = "walk"; e.t = 0; } return; }
    if (D.boss && bossAI(e, D)) return;
    const tg = target(e); if (!tg){ e.st = "idle"; return; }
    e.tg = tg.i;
    if (e.st === "atk"){
      const wind = D.wind;
      if (D.quad && e.t > wind && e.t < wind + 10) e.x += e.f*9;
      if (e.t === wind){
        if (D.ranged){ PR.push({id: uid++, k: "earrow", x: e.x + e.f*40, y: e.y, z: 80, vx: e.f*9, vz: 0, f: e.f, dmg: D.dmg, t: 110, hit: new Set()}); sfx("shoot"); }
        else P.forEach(p => { if (!alive(p)) return; const dx = (p.x - e.x)*e.f; if (dx > -14 && dx < D.reach + (D.boss ? 30 : 0) && Math.abs(p.y - e.y) < (D.boss ? 60 : 34) && p.z < 70) hurtPlayer(p, D.dmg, e.f, D.boss || (D.quad && rand() < .3)); });
        if (!D.ranged && D.boss) slash(e.x + e.f*80, e.y, 100, e.f, true);
      }
      if (e.t > wind + 22){ e.st = "walk"; e.t = 0; e.cd = ((D.boss ? 40 : 55) + rand()*(D.boss ? 50 : 70))*Math.max(.6, 1 - stage*.004); }
      return;
    }
    // 다가가기 (한 친구에게 한꺼번에 몰리지 않게 2마리까지만 바짝)
    if (e.t % 50 === 1){ const n = E.filter(o => o !== e && o.ag && o.tg === tg.i && o.st !== "die").length; e.ag = D.boss || n < 2 || D.ranged ? 1 : 0; }
    if (e.cd > 0) e.cd--;
    const side = e.x < tg.x ? -1 : 1, want = D.ranged ? 380 : e.ag ? D.reach*.72 : 250 + (e.id % 3)*40;
    const tx = tg.x + side*want, ty = tg.y + (e.ag ? e.yo*.4 : e.yo*3);
    const ddx = tx - e.x, ddy = ty - e.y, sp = D.spd*(e.ag ? 1 : .7)*(1 + Math.min(.35, stage*.004));
    if (Math.abs(ddx) > 6) e.x += clampN(ddx, -sp, sp); if (Math.abs(ddy) > 4) e.y += clampN(ddy, -sp*.6, sp*.6);
    e.y = clampN(e.y, YT, YB);
    e.st = Math.abs(ddx) > 6 || Math.abs(ddy) > 4 ? "walk" : "idle";
    e.f = tg.x > e.x ? 1 : -1;
    if (e.ag && e.cd <= 0 && Math.abs(ddx) < (D.ranged ? 160 : 24) && Math.abs(tg.y - e.y) < (D.ranged ? 22 : 18)){ e.st = "atk"; e.t = 0; }
  }
  /* 보스: 특별 기술 */
  function bossAI(e, D){
    e.sk -= MODE === "boss" ? (e.rage ? 1.7 : 1.15) : 1;
    const tg = target(e); if (!tg) return false;
    if (MODE === "boss" && bossPat(e, D, tg)) return true;
    if (e.st === "bjump"){ e.x += (e.jx - e.x)*.06; e.y += (e.jy - e.y)*.06; return true; }
    if (e.st === "chg0"){ const ex = e.cx, ey = tg.y; e.x += clampN(ex - e.x, -7, 7); e.y += clampN(ey - e.y, -4, 4); e.f = e.cx < camX + W/2 ? 1 : -1; if (Math.abs(ex - e.x) < 8 || e.t > 150){ e.st = "chg1"; e.t = 0; sfx("roar"); e.hits = new Set(); } return true; }
    if (e.st === "chg1"){ e.x += e.f*13; if (e.t % 4 === 0) addFx({k: "dust", x: e.x - e.f*60, y: e.y, t: 16});
      P.forEach(p => { if (alive(p) && !e.hits.has(p.i) && Math.abs(p.x - e.x) < 80 && Math.abs(p.y - e.y) < 50 && p.z < 80){ e.hits.add(p.i); hurtPlayer(p, D.dmg + 2, e.f, true); } });
      if ((e.f > 0 && e.x > camX + W - 90) || (e.f < 0 && e.x < camX + 90) || e.t > 160){ e.st = "walk"; e.t = 0; e.cd = 50; e.sk = 260 + rand()*120; } return true; }
    if (e.st === "fire"){ if (e.t % 4 === 0 && e.t < 70){ PR.push({id: uid++, k: "fire", x: e.x + e.f*150, y: e.y + rr(-30, 30), z: 150 - e.t*.4, vx: e.f*rr(8, 10), vz: rr(-1.5, .5), f: e.f, dmg: 7, t: 50, hit: new Set()}); if (e.t % 12 === 0) sfx("fire"); }
      if (e.t > 84){ e.st = "walk"; e.t = 0; e.cd = 40; e.sk = 240 + rand()*120; } return true; }
    if (e.st === "throw"){ if (e.t === 20){ const dx = tg.x - e.x, T = 44; PR.push({id: uid++, k: "snow", x: e.x + e.f*40, y: e.y, z: 200, vx: dx/T, vy: (tg.y - e.y)/T, vz: 11, f: e.f, dmg: 13, t: 200, hit: new Set()}); sfx("shoot"); }
      if (e.t > 40){ e.st = "walk"; e.t = 0; e.cd = 30; e.sk = 120 + rand()*100; } return true; }
    if (e.st !== "walk" && e.st !== "idle") return false;
    // 졸개 부르기
    if (!e.ph && MODE !== "boss" && e.hp < e.mhp*.55){ e.ph = 1; sfx("roar"); say("", `${D.n}: 얘들아 나와라!`, 90); QST[stage].bmin.forEach((k, i) => spawn(k, i % 2 ? 1 : -1)); if (N > 2) spawn(QST[stage].bmin[0], 1); return false; }
    if (e.sk > 0) return false;
    if ((D.ai || e.k) === "orc"){ e.st = "bjump"; e.t = 0; e.vz = 17; e.z = 1; e.jx = tg.x; e.jy = tg.y; sfx("roar"); return true; }
    if ((D.ai || e.k) === "rider"){ e.st = "chg0"; e.t = 0; e.cx = e.x < camX + W/2 ? camX + 90 : camX + W - 90; return true; }
    if ((D.ai || e.k) === "yeti"){ if (rand() < .5){ e.st = "throw"; e.t = 0; e.f = tg.x > e.x ? 1 : -1; } else { e.st = "bjump"; e.t = 0; e.vz = 15; e.z = 1; e.jx = tg.x; e.jy = tg.y; sfx("roar"); } return true; }
    if ((D.ai || e.k) === "drag"){ e.f = tg.x > e.x ? 1 : -1; e.st = "fire"; e.t = 0; sfx("roar"); return true; }
    return false;
  }
  function bossLand(e){ e.st = "walk"; e.t = 0; e.sk = 200 + rand()*120; e.cd = 30; quake(12); sfx("boom"); boomFx(e.x, e.y, 170);
    P.forEach(p => { if (alive(p) && Math.abs(p.x - e.x) < 190 && Math.abs(p.y - e.y) < 80 && p.z < 40) hurtPlayer(p, 14, p.x > e.x ? 1 : -1, true); }); }
  function bossDown(e){
    quake(16); sfx("boom"); boomFx(e.x, e.y, 200); E.forEach(o => { if (o !== e && o.st !== "die"){ o.st = "die"; o.t = 0; o.vz = 7; o.kx = 0; } });
    stageWin();
  }
  function stageWin(){
    if (MODE === "boss"){ phase = "clear"; pt = 60*3; flashT = 30; flashC = "#fff"; HZ = []; const st = starsNow(); say("👑 보스 처치!", `${"⭐".repeat(st)}${"☆".repeat(3 - st)} · 맞은 횟수 ${hitsNow()}번`, 200); sfx("clear"); return; }
    phase = "clear"; pt = 60*5; flashT = 30; flashC = "#fff"; ev("fl", 30, "#fff");
    P.forEach(p => { if (alive(p)) p.score += 600 + stage*80; });
    if (party !== "guest") HUM.forEach(i => { if (party !== "host" || i === 0) REACH.set("qd", SIDS[i], Math.min(QD_MAX, stage + 2)); });
    const S = QST[stage]; say(`STAGE ${stage + 1} CLEAR!`, stage >= QD_MAX - 1 ? `${QD_MAX}단계를 모두 깼어요! 전설의 용사!` : S.k === 4 ? `${S.n} 정복! 다음은 ${QST[stage + 1].n}` : "다음 단계로!", 300); sfx("clear");
  }

  /* ---------- 화살·마법·불 ---------- */
  function upShots(){
    for (let k = PR.length - 1; k >= 0; k--){
      const q = PR[k]; q.t--; q.x += q.vx; if (q.vy) q.y += q.vy;
      if (q.k === "snow"){ q.vz -= .5; q.z += q.vz; if (q.z <= 0){ PR.splice(k, 1); boomFx(q.x, q.y, 70); sfx("big"); P.forEach(p => { if (alive(p) && Math.abs(p.x - q.x) < 80 && Math.abs(p.y - q.y) < 46) hurtPlayer(p, q.dmg, p.x > q.x ? 1 : -1, true); }); } continue; }
      if (q.k === "rain" || q.k === "met"){ q.z += q.vz; if (q.z <= 20){ PR.splice(k, 1); if (q.k === "met"){ boomFx(q.x, q.y, 90); sfx("boom"); quake(5); }
          E.forEach(e => { if (e.st !== "die" && Math.abs(e.x - q.x) < (q.k === "met" ? 110 : 60) && Math.abs(e.y - q.y) < (q.k === "met" ? 70 : 40)) hitEnemy(e, q.dmg, e.x > q.x ? 1 : -1, q.k === "met", q.pi); }); }
        continue; }
      let gone = q.t <= 0 || q.x < camX - 200 || q.x > camX + W + 200;
      if (q.k === "fire"){ q.z = Math.max(20, q.z + q.vz); P.forEach(p => { if (alive(p) && !q.hit.has(p.i) && Math.abs(p.x - q.x) < 50 && Math.abs(p.y - q.y) < 34 && p.z < 120){ q.hit.add(p.i); hurtPlayer(p, q.dmg, q.f, false); } }); }
      else if (q.k === "earrow"){ P.forEach(p => { if (!gone && alive(p) && Math.abs(p.x - q.x) < 34 && Math.abs(p.y - q.y) < 26 && p.z < 110){ if (hurtPlayer(p, q.dmg, q.f, false)) gone = true; } }); }
      else { // 용사 화살·마법 구슬
        for (const e of E){ if (e.st === "die" || q.hit.has(e.id) || (e.pv != null && e.pv === q.pi)) continue; const D = QEN[e.k], rb = D.boss ? 50 : 0;
          if (Math.abs(e.x - q.x) < 36 + rb && Math.abs(e.y - q.y) < 30 + rb*.6 && e.z < 120){ q.hit.add(e.id);
            if (q.k === "orb"){ boomFx(q.x, q.y, q.big ? 90 : 55); E.forEach(o => { if (o.st !== "die" && Math.abs(o.x - q.x) < (q.big ? 120 : 70) && Math.abs(o.y - q.y) < 50) hitEnemy(o, q.dmg, q.f, !!q.big, q.pi); }); gone = true; break; }
            hitEnemy(e, q.dmg, q.f, !!q.big, q.pi); if (!q.big){ gone = true; break; } } }
        PROPS.forEach(b => { if (!gone && Math.abs(b.x - q.x) < 30 && Math.abs(b.y - q.y) < 30){ hitProp(b); gone = true; } });
      }
      if (gone) PR.splice(k, 1);
    }
    for (let k = IT.length - 1; k >= 0; k--){ const it = IT[k]; if (it.z > 0 || it.vz){ it.vz -= .7; it.z += it.vz; if (it.z <= 0){ it.z = 0; it.vz = it.vz < -4 ? -it.vz*.4 : 0; } } if (--it.t <= 0) IT.splice(k, 1); }
  }

  /* ---------- 화면 이동 · 적 무리 ---------- */
  function upCamera(){
    const L = live(), S = QST[stage]; if (!L.length) return;
    const maxX = Math.max(...L.map(p => p.x)), minX = Math.min(...L.map(p => p.x));
    let want = Math.min(maxX - W*.58, minX - 70);
    const stop = lockX != null ? lockX : S.len - W;
    camX = clampN(Math.max(camX, want), 0, stop);
    if (lockX == null){
      if (segI < S.seg.length && camX >= S.seg[segI][0]){ lockX = S.seg[segI][0]; camX = lockX; waveQ = S.seg[segI].slice(1).map(w => w.slice()); nextWave(); }
      else if (segI >= S.seg.length && camX >= S.len - W - 1 && !bossId){ lockX = S.len - W; camX = lockX; if (S.boss) bossCome(); else { bossId = -1; stageWin(); } }
    }
  }
  function nextWave(){
    const w = waveQ.shift(); if (!w) return false;
    const extra = Math.round((N - 1)*.45*w.length), list = w.concat(Array.from({length: extra}, (_, i) => w[i % w.length]));
    list.forEach((k, i) => setTimeout0(() => spawn(k, i % 2 ? -1 : 1), i*24));
    return true;
  }
  let pend = [];
  function setTimeout0(fn, frames){ pend.push({fn, at: stageT + frames}); }
  function bossCome(){ const S = QST[stage]; say("⚠️ BOSS ⚠️", QEN[S.boss].n, 160); sfx("boss"); quake(8);
    const b = spawn(S.boss, 1, camX + W + 160); b.y = (YT + YB)/2; bossId = b.id; b.cd = 120; b.sk = 300;
    S.bmin.forEach((k, i) => setTimeout0(() => spawn(k, i % 2 ? -1 : 1), 90 + i*30)); }
  function upWaves(){
    for (let k = pend.length - 1; k >= 0; k--) if (pend[k].at <= stageT){ const f = pend[k].fn; pend.splice(k, 1); f(); }
    if (lockX != null && !bossId && !pend.length && !ens().length){
      if (!nextWave()){ lockX = null; segI++; goT = 200; sfx("go"); }
    }
    if (bossId && phase === "play"){ const b = E.find(e => e.id === bossId); if (b && b.st !== "die" && ens().length === 1 && stageT % 600 === 0) QST[stage].bmin.slice(0, 1 + (N > 2 ? 1 : 0)).forEach((k, i) => spawn(k, i % 2 ? 1 : -1)); }
  }

  /* ---------- 끝 ---------- */
  function finish(win){
    if (ended) return; ended = true; phase = win ? "win" : "over"; team = P.reduce((a, p) => a + p.score, 0);
    const res = HUM.map(i => ({i, sid: SIDS[i], sc: Math.round(P[i].score), ko: P[i].ko, cls: P[i].cls}));
    results = {win, stage: stage + 1, team: Math.round(team), res, bots: (O.bots || []).map(i => ({i, sid: SIDS[i], sc: Math.round(P[i].score), cls: P[i].cls}))};
    results.mode = MODE; if (MODE === "boss"){ results.bl = BLV; results.stars = win ? starsNow() : 0; results.hits = hitsNow(); }
    if (MODE === "arena" && AR){ results.aw = AR.w.slice(); const mx = Math.max(...AR.w); results.win = true; results.wi = AR.w.indexOf(mx); results.hum = HUM.length; }
    if (party === "host") PARTY.sendAll({t: "end", w: win ? 1 : 0, wins: results});
    setTimeout(() => QDM.result(results, O), win ? 1600 : 1400);
  }

  /* ---------- 한 장면 ---------- */
  function step(){
    if (party === "guest"){ guestStep(); return; }
    // 입력 모으기
    local.forEach((pi, s) => { IN[pi].d = localDir(s); });
    if (party === "host"){ const R = SIDS.map(() => ({d: 0, b: 0})); PARTY.readInputs(R); R.forEach((r, i) => { if ((O.remote || {})[i] != null){ const u = qdUnpack(r.b); IN[i].d = r.d; QB.forEach((k, n) => { IN[i][k] = u[n]; }); } }); }
    P.forEach(p => { if (isBot(p.i)) botThink(p); });
    if (shake > 0) shake *= .86; if (flashT > 0) flashT--; if (banner && --banner.k <= 0) banner = null; if (goT > 0) goT--;
    if (phase === "sel"){
      pt--;
      P.forEach(p => { const inp = IN[p.i], L = LAST[p.i];
        if (!p.ready){ const [dx] = QDIR[inp.d || 0]; if (dx && dx !== L.dx){ p.cls = (p.cls + dx + 4) % 4; sfx("sel"); } L.dx = dx;
          if (inp.a !== L.a || inp.j !== L.j){ p.ready = true; sfx("ready"); } }
        L.a = inp.a; L.j = inp.j; L.s = inp.s; });
      if (pt <= 0 || P.every(p => p.ready)){ P.forEach(p => { p.ready = true; applyGear(p); p.hp = p.mhp; }); MODE === "boss" ? startBoss() : MODE === "arena" ? startArena() : startStage(stage); }
    } else if (MODE === "arena" && phase !== "sel"){ arenaStep();
    } else if (phase === "play" && MODE === "boss"){
      stageT++; team = P.reduce((a, p) => a + p.score, 0);
      P.forEach(upPlayer); E.forEach(upEnemy); E = E.filter(e => !e.gone); upShots(); upHz();
      for (let k = pend.length - 1; k >= 0; k--) if (pend[k].at <= stageT){ const f = pend[k].fn; pend.splice(k, 1); f(); }
      if (--BT <= 0 && phase === "play"){ say("⏰ 시간 끝!", "보스가 도망갔어요", 120); finish(false); }
    } else if (phase === "play"){
      stageT++; team = P.reduce((a, p) => a + p.score, 0);
      P.forEach(upPlayer); E.forEach(upEnemy); E = E.filter(e => !e.gone); upShots(); upCamera(); upWaves();
    } else if (phase === "clear" && MODE === "boss"){
      pt--; P.forEach(p => { if (alive(p)) upPlayer(p); }); upShots(); E.forEach(upEnemy); E = E.filter(e => !e.gone);
      if (pt <= 0) finish(true);
    } else if (phase === "clear"){
      pt--; P.forEach(p => { if (alive(p)){ IN[p.i].d = 4; upPlayer(p); } }); upShots(); E.forEach(upEnemy); E = E.filter(e => !e.gone);
      if (pt <= 0){ if (stage < QD_MAX - 1) startStage(stage + 1); else finish(true); }
    }
    upFx();
    if (party === "host"){ const now = performance.now(); if (now - lastSnap > (N >= 3 ? 44 : 36)){ lastSnap = now; PARTY.sendSnap(snap(), NQ.splice(0), 0); } }
  }
  function upFx(){
    for (let k = FX.length - 1; k >= 0; k--){ const f = FX[k];
      if (f.k === "p"){ f.x += f.vx; f.z += f.vz; f.vz -= .5; if (f.z < 0){ f.z = 0; f.vz *= -.4; f.vx *= .7; } }
      else if (f.k === "n") f.z += f.t > 38 ? 2.6 : .7;
      if (--f.t <= 0) FX.splice(k, 1); }
  }

  /* ---------- 🌐 주고받기 ---------- */
  const r1 = v => Math.round(v);
  function snap(){
    return {g: [phase, stage, r1(camX), pt, r1(team), bossId, goT, lockX != null ? 1 : 0, flashT, AR ? AR.w.join(",") : "", AR ? AR.t : 0, AR ? AR.rd : 0, BT | 0],
      p: P.map(p => [r1(p.x), r1(p.y), r1(p.z), p.f, p.st, p.t, Math.ceil(p.hp), p.mp | 0, p.lives, p.cls, p.inv > 0 ? 1 : 0, r1(p.score), p.ready ? 1 : 0, p.mv, p.combo, p.mhp | 0, p.pcd | 0]),
      e: E.map(e => [e.id, e.k, r1(e.x), r1(e.y), r1(e.z), e.f, e.st, e.t, Math.max(0, Math.ceil(e.hp)), e.mhp, e.flash, e.st === "bjump" ? r1(e.jx) : 0, e.st === "bjump" ? r1(e.jy) : 0, e.rage ? 1 : 0]),
      q: PR.map(q => [q.id, q.k, r1(q.x), r1(q.y), r1(q.z), q.f, q.big ? 1 : 0, Math.round((q.vx || 0)*10)/10]),
      h: HZ.map(h => h.k === "lane" ? ["l", r1(h.y0), r1(h.y1), h.t, h.T] : h.k === "ring" ? ["r", r1(h.x), r1(h.y), r1(h.r), h.t, h.T, h.sp] : ["m", r1(h.x), r1(h.y), r1(h.r), h.t, h.T]),
      hn: P.map(p => p.hitN || 0),
      i: IT.map(t => [t.id, t.k, r1(t.x), r1(t.y), r1(t.z)]),
      b: PROPS.map(b => [b.id, b.k, r1(b.x), r1(b.y), b.hp])};
  }
  let SN = null;
  function apply(d){
    if (d.ev){ d.ev.forEach(a => { const k = a[0];
      if (k === "s") playS(a[1]); else if (k === "sp") doSpark(a[1], a[2], a[3], a[4], a[5]); else if (k === "nm") addNum(a[1], a[2], a[3], a[4], a[5]); else if (k === "bt") addFx({k: "bolt", x: a[1], y: a[2], t: 14}); else if (k === "zp") addFx({k: "zp", x0: a[1], y0: a[2], x1: a[3], y1: a[4], c: a[5], t: 12});
      else if (k === "sl") addFx({k: "sl", x: a[1], y: a[2], z: a[3], f: a[4], big: a[5], t: 10}); else if (k === "bm") boomFx(a[1], a[2], a[3]);
      else if (k === "q") shake = Math.max(shake, a[1]); else if (k === "b") banner = {t: a[1], s: a[2], k: a[3]}; else if (k === "fl"){ flashT = a[1]; flashC = a[2]; }
      else if (k === "pb"){ const b = PROPS.find(x => x.id === a[1]); if (b) for (let i = 0; i < 8; i++) addFx({k: "p", x: b.x, y: b.y, z: 30, vx: rr(-5, 5), vz: rr(3, 9), t: 30, c: "#9c6644"}); } }); }
    if (!d.s) return;
    const s = d.s; SN = s;
    [phase, stage, , pt, team, bossId, goT, , ] = s.g; lockX = s.g[7] ? s.g[2] : null;
    if (s.g[9]){ AR = AR || {}; AR.w = String(s.g[9]).split(",").map(Number); AR.t = s.g[10]; AR.rd = s.g[11]; }
    if (Math.abs(camX - s.g[2]) > 300) camX = s.g[2];
    camX += 0; P.forEach((p, i) => { const a = s.p[i]; if (!a) return; p.tx = a[0]; p.ty = a[1]; p.tz = a[2]; if (Math.abs(p.x - a[0]) > 200) { p.x = a[0]; p.y = a[1]; }
      if (!(i === myIdx && p.pred > 0)) p.f = a[3]; p.st = a[4]; p.t = a[5]; p.hp = a[6]; p.mp = a[7]; p.lives = a[8]; p.cls = a[9]; p.inv = a[10]; p.score = a[11]; p.ready = !!a[12]; p.mv = a[13]; p.combo = a[14]; p.mhp = a[15]; p.pcd = a[16]; });
    const old = new Map(E.map(e => [e.id, e]));
    E = s.e.map(a => { const e = old.get(a[0]) || {id: a[0], x: a[2], y: a[3], z: a[4]}; Object.assign(e, {k: a[1], tx: a[2], ty: a[3], tz: a[4], f: a[5], st: a[6], t: a[7], hp: a[8], mhp: a[9], flash: a[10], jx: a[11], jy: a[12], rage: a[13]}); return e; });
    /* ⚠️ 경고 장판: 방장 시간에 맞추고, 다음 소식이 늦어도 내 화면에서 계속 흘러가요 (끊김 없이) */
    if (s.h) HZ = s.h.map(a => a[0] === "l" ? {k: "lane", y0: a[1], y1: a[2], t: a[3], T: a[4]} : a[0] === "r" ? {k: "ring", x: a[1], y: a[2], r: a[3], t: a[4], T: a[5], sp: a[6], hit: new Set()} : {k: "met", x: a[1], y: a[2], r: a[3], t: a[4], T: a[5]});
    if (s.hn) P.forEach((p, i) => { p.hitN = s.hn[i] || 0; }); if (s.g[12] != null) BT = s.g[12];
    const oq = new Map(PR.map(q => [q.id, q]));
    PR = s.q.map(a => { const q = oq.get(a[0]) || {id: a[0], x: a[2], y: a[3], z: a[4]}; Object.assign(q, {k: a[1], tx: a[2], ty: a[3], tz: a[4], f: a[5], big: a[6], vx: a[7] || 0}); return q; });
    IT = s.i.map(a => ({id: a[0], k: a[1], x: a[2], y: a[3], z: a[4]}));
    PROPS = s.b.map(a => ({id: a[0], k: a[1], x: a[2], y: a[3], hp: a[4]}));
    tcx = s.g[2];
  }
  let tcx = 0;
  function guestStep(){
    // 내 손가락·키보드 → 방장에게
    PARTY.input.d = localDir(0); PARTY.tickGuest();
    if (shake > 0) shake *= .86; if (flashT > 0) flashT--; if (banner && --banner.k <= 0) banner = null; if (goT > 0) goT--;
    camX += (tcx - camX)*.35;
    const lerp = o => { if (o.tx == null) return; o.x += (o.tx - o.x)*.45; o.y += (o.ty - o.y)*.45; o.z += (o.tz - o.z)*.5; };
    /* 🎮 내 용사는 내 기기에서 바로 움직여요(방장 답을 기다리지 않음) → 온라인에서도 조작이 즉시 반응. 멈추면 방장 자리로 살며시 맞춰요 */
    const me = P[myIdx];
    P.forEach(p => { if (p !== me) lerp(p); });
    if (me && me.tx != null){ const [dx, dy] = QDIR[PARTY.input.d || 0], free = me.st === "idle" || me.st === "walk";
      if (free && (dx || dy) && phase === "play"){ const sp = QCL[me.cls].spd*(MODE === "arena" ? 1 : QG.stats(me.gg || {}).spm); me.x = clampN(me.x + dx*sp, camX + 30, camX + W - 30); me.y = clampN(me.y + dy*sp*.62, YT, YB); if (dx) me.f = dx; me.mv = 1; me.pred = 10; }
      else { if (me.pred > 0) me.pred--; const k = !free ? .45 : me.pred > 0 ? .06 : .22; me.x += (me.tx - me.x)*k; me.y += (me.ty - me.y)*k; }
      me.z += (me.tz - me.z)*.5; if (Math.abs(me.x - me.tx) > 180 || Math.abs(me.y - me.ty) > 120){ me.x = me.tx; me.y = me.ty; } }
    E.forEach(lerp); PR.forEach(q => { if (q.vx){ q.tx += q.vx; q.x += q.vx; } lerp(q); });   // 화살은 날아가던 대로 이어서
    HZ.forEach(h => { h.t++; if (h.k === "ring" && h.t > h.T) h.r += h.sp; });
    if (MODE === "boss" && phase === "play" && BT > 0) BT--;
    upFx();
  }

  /* ---------- 그리기 ---------- */
  const heroArt = cls => QCL[cls].art;
  function poseOf(o, isE){
    const t = o.t | 0, st = o.st;
    if (st === "walk" || o.mv) return "walk" + ((t >> 3) % 4);
    if (st === "atk") return isE ? (t < QEN[o.k].wind ? "atk0" : t < QEN[o.k].wind + 8 ? "atk1" : "atk2") : (t < 6 ? "atk0" : t < 10 ? "atk1" : "atk2");
    if (st === "jump" || st === "bjump") return "jump";
    if (st === "jatk") return t < 3 ? "atk0" : "atk1";
    if (st === "hurt") return "hurt";
    if (st === "spc") return QCL[o.cls] && QCL[o.cls].id === "kn" ? "spin" : QCL[o.cls] && QCL[o.cls].id === "ln" ? "atk1" : "cast";
    if (st === "chg0" || st === "chg1") return "walk" + ((t >> 2) % 4);
    if (st === "dash") return "walk1"; if (st === "skl") return t % 8 < 3 ? "atk0" : t % 8 < 6 ? "atk1" : "atk2";
    if (st === "fire") return "atk1"; if (st === "throw") return t < 20 ? "atk0" : "atk2";
    return "idle" + ((t >> 5) % 2);
  }
  const SH = new Map();
  function shadow(g, x, y, w){ const k = NG.k || 1, key = `${w | 0}|${k}`; let c = SH.get(key);
    if (!c){ c = document.createElement("canvas"); c.width = Math.ceil(w*2*k); c.height = Math.ceil(w*.5*k); const t = c.getContext("2d"); t.scale(k, k); t.fillStyle = "rgba(10,5,25,.38)"; t.beginPath(); t.ellipse(w, w*.25, w, w*.25, 0, 0, 7); t.fill(); c.w = w*2; c.h = w*.5; SH.set(key, c); }
    g.drawImage(c, x - w, y - w*.25, c.w, c.h); }
  function blit(g, c, x, y, ax, ay, f){ // ax, ay: 발 위치 (그림 안에서)
    if (f < 0){ g.save(); g.translate(Math.round(x), 0); g.scale(-1, 1); g.drawImage(c, -ax, Math.round(y - ay), c.w, c.h); g.restore(); }
    else g.drawImage(c, Math.round(x - ax), Math.round(y - ay), c.w, c.h);
  }
  function whiten(t, w, h){ t.globalCompositeOperation = "source-atop"; t.fillStyle = "rgba(255,255,255,.8)"; t.fillRect(0, 0, w, h); t.globalCompositeOperation = "source-over"; }
  /* ✨ 반짝 효과 그림들 (한 번만 그려 기억해요) */
  /* 데미지 숫자 한 글자씩 그림으로 (숫자가 많아도 기억 칸이 늘지 않게) */
  const digSpr = (ch, kind) => G2.spr(`dg${kind}${ch}`, 40, 62, t => {
    t.font = `${kind === "c" ? 50 : 44}px "Jua",sans-serif`; t.textAlign = "center"; t.textBaseline = "middle"; t.lineJoin = "round";
    const g2 = t.createLinearGradient(0, 10, 0, 56);
    if (kind === "c"){ g2.addColorStop(0, "#fff0f6"); g2.addColorStop(.35, "#f783ac"); g2.addColorStop(.7, "#d6336c"); g2.addColorStop(1, "#7048e8"); }
    else if (kind === "h"){ g2.addColorStop(0, "#ebfbee"); g2.addColorStop(.5, "#69db7c"); g2.addColorStop(1, "#2b8a3e"); }
    else if (kind === "w"){ g2.addColorStop(0, "#fff"); g2.addColorStop(1, "#ced4da"); }
    else { g2.addColorStop(0, "#fff9db"); g2.addColorStop(.35, "#ffd43b"); g2.addColorStop(.75, "#ff922b"); g2.addColorStop(1, "#e8590c"); }
    t.strokeStyle = "#2b0f2e"; t.lineWidth = 9; t.strokeText(ch, 20, 33); t.strokeStyle = "#fff"; t.lineWidth = 3; t.strokeText(ch, 20, 33); t.fillStyle = g2; t.fillText(ch, 20, 33); });
  function drawDmg(g, txt, c, x, y, sc){ const kind = c === "#ffd43b" ? "c" : c === "#69db7c" ? "h" : /\d/.test(txt) && c !== "#fff" ? "n" : (/^\d+$/.test(txt) ? "n" : "w"), cw = 27*sc, n = txt.length;
    if (!/^[+\-]?\d+$/.test(txt)){ outlined(g, txt, x, y, 30*sc, c); return; }
    for (let i = 0; i < n; i++){ const d = digSpr(txt[i], kind); g.drawImage(d, x - n*cw/2 + i*cw - 6*sc, y - 31*sc + (i % 2 ? 2 : -2)*sc, 40*sc, 62*sc); } }
  const burstSpr = c => G2.spr("hb" + c, 128, 128, t => { const g2 = t.createRadialGradient(64, 64, 2, 64, 64, 62); g2.addColorStop(0, "rgba(255,255,255,1)"); g2.addColorStop(.25, c); g2.addColorStop(1, "rgba(0,0,0,0)"); t.fillStyle = g2; t.beginPath(); t.arc(64, 64, 62, 0, 7); t.fill();
    t.fillStyle = "#fff"; for (let i = 0; i < 6; i++){ const a = i*Math.PI/3; t.beginPath(); t.moveTo(64 + Math.cos(a)*62, 64 + Math.sin(a)*62); t.lineTo(64 + Math.cos(a + .2)*12, 64 + Math.sin(a + .2)*12); t.lineTo(64 + Math.cos(a - .2)*12, 64 + Math.sin(a - .2)*12); t.fill(); }
    t.strokeStyle = "rgba(255,255,255,.8)"; t.lineWidth = 3; t.beginPath(); t.arc(64, 64, 40, 0, 7); t.stroke(); });
  const crescentSpr = big => G2.spr("cr" + big, 200, 200, t => { const g2 = t.createLinearGradient(40, 0, 180, 200); g2.addColorStop(0, "rgba(255,255,255,0)"); g2.addColorStop(.45, big ? "#ffe066" : "#a5d8ff"); g2.addColorStop(.7, "#ffffff"); g2.addColorStop(1, "rgba(255,255,255,0)");
    t.fillStyle = g2; t.beginPath(); t.arc(100, 100, 92, -1.5, 1.5); t.arc(80, 100, 78, 1.35, -1.35, true); t.fill(); t.shadowColor = big ? "#ffd43b" : "#74c0fc"; t.shadowBlur = 18; t.strokeStyle = "rgba(255,255,255,.9)"; t.lineWidth = 3; t.beginPath(); t.arc(100, 100, 90, -1.3, 1.3); t.stroke(); });
  const circleSpr = c => G2.spr("mc" + c, 256, 256, t => { t.translate(128, 128); t.strokeStyle = c; t.shadowColor = c; t.shadowBlur = 16; t.lineWidth = 6; t.beginPath(); t.arc(0, 0, 118, 0, 7); t.stroke(); t.lineWidth = 3; t.beginPath(); t.arc(0, 0, 96, 0, 7); t.stroke();
    t.beginPath(); for (let i = 0; i < 6; i++){ const a = i*Math.PI/3; t.lineTo(Math.cos(a)*96, Math.sin(a)*96); } t.closePath(); t.stroke(); t.beginPath(); for (let i = 0; i < 6; i++){ const a = i*Math.PI/3 + Math.PI/6; t.lineTo(Math.cos(a)*96, Math.sin(a)*96); } t.closePath(); t.stroke();
    t.fillStyle = "#fff"; for (let i = 0; i < 12; i++){ const a = i*Math.PI/6; t.beginPath(); t.arc(Math.cos(a)*107, Math.sin(a)*107, 4, 0, 7); t.fill(); } });
  /* 🎬 필살기 컷인 (메이플 5차 스킬처럼 화면을 가로지르는 띠) */
  const CUT = []; const lastSt = {};
  function cutIn(p){ const C = QCL[p.cls]; CUT.push({c: C.c, cls: p.cls, n: C.sp, who: `${p.i + 1}P`, t: 70}); addFx({k: "mc", x: p.x, y: p.y, c: C.c, t: 60}); }
  function drawCut(g){
    for (let i = CUT.length - 1; i >= 0; i--){ const q = CUT[i]; q.t--; if (q.t <= 0){ CUT.splice(i, 1); continue; }
      const age = 70 - q.t, slide = age < 10 ? 1 - age/10 : q.t < 12 ? -(1 - q.t/12) : 0, y0 = 250 + i*40;
      g.save(); g.globalAlpha = q.t < 12 ? q.t/12 : 1; g.translate(slide*W, 0);
      const gb = g.createLinearGradient(0, 0, W, 0); gb.addColorStop(0, "rgba(0,0,0,0)"); gb.addColorStop(.25, q.c); gb.addColorStop(.75, q.c); gb.addColorStop(1, "rgba(0,0,0,0)");
      g.globalAlpha *= .85; g.fillStyle = "rgba(10,5,30,.55)"; g.beginPath(); g.moveTo(0, y0 + 20); g.lineTo(W, y0 - 20); g.lineTo(W, y0 + 150); g.lineTo(0, y0 + 190); g.fill();
      g.fillStyle = gb; g.fillRect(0, y0 + 4, W, 5); g.fillRect(0, y0 + 168, W, 5);
      const hc = WAR.spr("h" + q.cls, "war", WDEF[QCL[q.cls].id], "atk1", 1.5); g.drawImage(hc, 260 - hc.ax, y0 + 215 - hc.ay, hc.w, hc.h);
      outlined(g, q.n, W/2 + 120, y0 + 80, 64, "#fff", q.c); outlined(g, `${q.who} 필살기!`, W/2 + 120, y0 + 136, 26, "#ffe066");
      g.restore(); }
  }
  /* ⚔️ 장수 그림 (WAR · 삼국지 무장 느낌의 오리지널 디자인) */
  const HSC = .62, ESC = .66, BSC = .78;   // 용사·적·큰 적 크기 (작게 → 싸움터가 훨씬 넓어요)
  const flashOver = (g, c, x, y, ax, ay, f) => { g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = .65; blit(g, c, x, y, ax, ay, f); g.restore(); };
  function drawHero(g, p, sx, sy){
    const pose = (p.st === "dead" || p.st === "down") ? "lie" : poseOf(p), blink = p.inv > 0 && p.st !== "spc" && (NG.frame >> 2) % 2;
    if (blink) g.globalAlpha = .45;
    if (p.st === "spc" && lastSt[p.i] !== "spc") cutIn(p); lastSt[p.i] = p.st;
    gearOf(p); const gd = p.gd || {d: WDEF[QCL[p.cls].id], sig: ""}, gg = p.gg || {};
    // 🪽 날개 (등 뒤) — 장비 단계마다 색·크기
    if (gg.wing && p.st !== "dead" && p.st !== "down"){ const ws = QG.wingSpr(gg.wing), fl = 1 + Math.sin(NG.frame*.22 + p.i)*.1, sc = HSC*1.15;
      g.save(); g.translate(Math.round(sx - p.f*8), Math.round(sy - p.z - 150*HSC)); g.scale(sc, sc*fl); g.drawImage(ws, -ws.w/2, -ws.h*.62, ws.w, ws.h); g.restore(); }
    const c = WAR.spr("h" + p.cls + gd.sig, "war", gd.d, pose, HSC);
    blit(g, c, sx, sy - p.z, c.ax, c.ay, p.f);
    // 🐾 펫 (뒤쪽 위에서 둥실둥실)
    if (gg.pet && p.st !== "out"){ const ps = QG.petSpr(gg.pet); if (ps){ const [, , pz] = petXY(p), cd = p.pcd > 0; g.globalAlpha = Math.min(g.globalAlpha, cd ? .8 : 1); g.drawImage(ps, Math.round(sx - p.f*58 - 24), Math.round(sy - pz - 24), 48, 48); } }
    g.globalAlpha = 1;
  }
  function drawEnemy(g, e){
    const D = QEN[e.k], fl = e.flash > 0 && (e.flash % 2 === 0), dying = e.st === "die";
    if (dying && (e.t >> 2) % 2) return;
    let pose = (e.st === "down" || dying) ? "lie" : poseOf(e, true);
    const sx = e.x, sy = e.y - e.z, W8 = WDEF[e.k];
    let c;
    if (D.dragon){ const fr = (NG.frame >> 4) % 2; c = WAR.spr("dr" + e.k + fr, "dragon", W8, pose.startsWith("atk") ? "atk1" : "idle0", D.px/5.6*BSC, {fr}); }
    else if (D.rider) c = WAR.spr("rd" + e.k, "rider", W8, pose, D.px/4.6*.8*BSC);
    else if (D.quad) c = WAR.spr("q" + e.k, "wolf", W8, pose, D.px/3.4*.62*.75);
    else if (D.blob) c = WAR.spr("bl" + e.k, "blob", W8, pose, D.px/2.6*.8*.75);
    else c = WAR.spr("e" + e.k, "war", W8, pose, D.px/4*ESC);
    blit(g, c, sx, sy, c.ax, c.ay, e.f);
    if (fl) flashOver(g, c, sx, sy, c.ax, c.ay, e.f);
  }
  function drawShot(g, q){
    const x = q.x, y = q.y - q.z;
    if (q.wave){ const cr = crescentSpr(1), sz = 170; g.save(); g.globalCompositeOperation = "lighter"; g.translate(x, y); g.scale(q.f > 0 ? 1 : -1, 1); g.drawImage(cr, -sz/2, -sz/2, sz, sz); g.restore(); return; }
    if (q.k === "arrow" || q.k === "earrow" || q.k === "rain"){ const c = QD.spr(`ar${q.k}`, 22, 7, 3, t => { QD.line(t, 1, 3, 17, 3, q.k === "earrow" ? "#868e96" : "#a0522d", 1); QD.R(t, 17, 2, 4, 3, "#dee2e6"); QD.R(t, 0, 1, 3, 2, q.k === "earrow" ? "#495057" : "#fa5252"); QD.R(t, 0, 4, 3, 2, q.k === "earrow" ? "#495057" : "#fa5252"); });
      if (q.k === "rain"){ g.save(); g.translate(x, y); g.rotate(Math.PI/2); g.drawImage(c, -33, -10, c.w, c.h); g.restore(); } else blit(g, c, x, y, 33, 10, q.f); return; }
    if (q.k === "orb"){ const r = q.big ? 22 : 15, c = QD.spr(`orb${q.big ? 1 : 0}`, 14, 14, r/7*2, t => { QD.disc(t, 7, 7, 6, "#cc5de8"); QD.disc(t, 7, 7, 4, "#f3d9fa"); QD.R(t, 5, 4, 2, 2, "#fff"); }); g.drawImage(c, x - c.w/2, y - c.h/2, c.w, c.h);
      if (NG.frame % 3 === 0) addFx({k: "p", x: q.x - q.f*14, y: q.y, z: q.z, vx: -q.f, vz: rr(-1, 1), t: 12, c: "#e599f7"}); return; }
    if (q.k === "met"){ const c = QD.spr("met", 18, 18, 5, t => { QD.disc(t, 9, 9, 7, "#ff6b00"); QD.disc(t, 9, 9, 5, "#ffd43b"); QD.disc(t, 8, 8, 2, "#fff"); }); g.drawImage(c, x - c.w/2, y - c.h/2, c.w, c.h);
      if (NG.frame % 2 === 0) addFx({k: "p", x: q.x - 6, y: q.y, z: q.z + 20, vx: rr(-2, 0), vz: 2, t: 16, c: "#ff922b"}); return; }
    if (q.k === "fire"){ const c = QD.spr(`fb${(NG.frame >> 2) % 3}`, 16, 21, 4, t => QD.flame(t, (NG.frame >> 2) % 3)); g.drawImage(c, x - c.w/2, y - c.h*.6, c.w, c.h); return; }
    if (q.k === "snow"){ const c = QD.spr("snow", 14, 14, 5, t => { QD.disc(t, 7, 7, 6, "#e7f5ff"); QD.R(t, 4, 4, 3, 2, "#fff"); }); g.drawImage(c, x - c.w/2, y - c.h/2, c.w, c.h); }
  }
  /* 체력·기운 막대 (둥글고 반짝이게) */
  function bar(g, x, y, w, h, v, c, bg = "#1b1230"){ const r = h/2 + 1, f = Math.max(0, Math.min(1, v));
    g.fillStyle = bg; rrect(g, x - 2, y - 2, w + 4, h + 4, r + 2); g.fill(); g.fillStyle = "rgba(255,255,255,.12)"; rrect(g, x, y, w, h, r); g.fill();
    if (f > 0){ const gb = g.createLinearGradient(0, y, 0, y + h); gb.addColorStop(0, "#fff"); gb.addColorStop(.25, c); gb.addColorStop(1, c); g.fillStyle = gb; rrect(g, x, y, Math.max(h, f*w), h, r); g.fill();
      g.fillStyle = "rgba(255,255,255,.4)"; rrect(g, x + 3, y + 1, Math.max(0, f*w - 6), Math.max(1, h*.3), h*.15); g.fill(); } }
  function draw(g){
    const k = NG.k || 1;
    if (PX){ g.setTransform(k, 0, 0, k, 0, 0); g.clearRect(0, 0, W + 2*PX, H); g.fillStyle = "#140d2e"; g.fillRect(0, 0, PX, H); g.fillRect(PX + W, 0, PX, H); g.fillStyle = "rgba(255,255,255,.12)"; g.fillRect(PX - 3, 0, 3, H); g.fillRect(PX + W, 0, 3, H);
      g.setTransform(k, 0, 0, k, Math.round(PX*k), 0); g.save(); g.beginPath(); g.rect(0, 0, W, H); g.clip(); }
    drawMain(g);
    if (PX) g.restore();
    drawPads(g);
  }
  function drawMain(g){
    const S = QST[stage], sh = shake > .5 ? rr(-shake, shake) : 0, sv = shake > .5 ? rr(-shake, shake)*.6 : 0;
    g.save(); g.translate(sh, sv);
    // 배경 3겹
    [[0, .15], [1, .45], [2, 1]].forEach(([L, k]) => { const c = QDBG.get(S.th, L), w = QDBG.W, o = -((camX*k) % w); g.drawImage(c, Math.floor(o), 0, w, H); g.drawImage(c, Math.floor(o) + w, 0, w, H); });
    // 뒤쪽 불꽃 (불타는 요새 · 용의 둥지)
    if (S.th === 1 || S.th === 3 || S.th === 5){ for (let wx = Math.floor(camX*.45/260)*260 - 260; wx < camX*.45 + W + 260; wx += 260){ const fr = ((NG.frame >> 3) + (wx/260 | 0)) % 3, sx = wx - camX*.45 + ((wx*7) % 120), c = QD.spr(`fl${fr}`, 16, 21, 4, t => QD.flame(t, fr)); g.drawImage(c, Math.round(sx), (S.th !== 3 ? 318 : 330) + ((wx*13) % 36), c.w, c.h); } }
    if (phase === "sel"){ g.restore(); drawSel(g); drawFx(g, true); drawHud(g); return; }
    if (HZ.length || MODE === "boss") drawHz(g);
    // 물건·적·용사 (아래쪽이 앞으로)
    const L = [];
    PROPS.forEach(b => L.push([b.y, 0, b])); IT.forEach(it => L.push([it.y, 1, it])); E.forEach(e => L.push([e.y, 2, e])); P.forEach(p => { if (p.st !== "out") L.push([p.y + .5, 3, p]); }); PR.forEach(q => L.push([q.y + 1, 4, q]));
    L.sort((a, b) => a[0] - b[0]);
    L.forEach(([y, k, o]) => {
      const sx = o.x - camX;
      if (sx < -260 || sx > W + 260) return;
      if (k === 0){ shadow(g, sx, o.y, 44); const c = QD.spr(`bx${o.k}${3 - o.hp}`, 24, 21, 4, t => QD.barrel(t, o.k, 3 - o.hp)); g.drawImage(c, Math.round(sx - 48), Math.round(o.y - 80), c.w, c.h); }
      else if (k === 1){ shadow(g, sx, o.y, 20); const c = QD.spr(`it${o.k}`, 17, 17, 3.4, t => QD.itemArt(t, o.k)); const bob = o.z > 0 ? 0 : Math.sin(NG.frame*.12 + o.id)*4; g.drawImage(c, Math.round(sx - c.w/2), Math.round(o.y - o.z - c.h - 4 + bob), c.w, c.h); }
      else if (k === 2){ const D = QEN[o.k]; shadow(g, sx, o.y, D.boss ? 110 : D.quad ? 58 : 48); drawEnemy(g, Object.assign({}, o, {x: sx}));
        if (!D.boss && o.st !== "die" && o.hp < o.mhp){ bar(g, sx - 34, o.y - o.z - D.px*48, 68, 6, o.hp/o.mhp, "#ff6b6b"); } }
      else if (k === 3){ shadow(g, sx, o.y, 46); drawHero(g, o, sx, o.y); if (alive(o)){ const tag = `${o.i + 1}P`; outlined(g, tag, sx, o.y - o.z - 104, 16, QCL[o.cls].c); } }
      else drawShot(g, Object.assign({}, o, {x: sx}));
    });
    drawFx(g);
    // 앞쪽 불길 (사진처럼 화면 아래에서 일렁여요)
    if (S.th === 1 || S.th === 5){ const sp = 330, cx = camX*1.2; g.globalAlpha = .9; for (let wx = Math.floor(cx/sp)*sp - sp; wx < cx + W + sp; wx += sp){ const k = (wx/sp | 0), fr = ((NG.frame >> 2) + k) % 3, sx = wx - cx + (k % 2 ? 90 : 0), c = QD.spr(`ff${fr}`, 16, 21, 5, t => QD.flame(t, fr)); g.drawImage(c, Math.round(sx), H - 78, c.w, c.h); } g.globalAlpha = 1; }
    if (S.th === 4){ g.fillStyle = "#e9fac8"; for (let k = 0; k < 22; k++){ const t2 = NG.frame*.01 + k*1.7, x = ((k*211 + Math.sin(t2)*60) % W + W) % W, y = 330 + ((k*67) % 320) + Math.sin(t2*1.7)*18; g.globalAlpha = .35 + .35*Math.sin(NG.frame*.08 + k); g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); } g.globalAlpha = 1; }
    if (S.th === 2 && NG.frame % 3 === 0) addFx({k: "snowf", x: camX + rand()*W, y: 0, t: 200, vx: rr(-.6, .2)});
    g.restore();
    if (!document.body.classList.contains("arc-lite")) g.drawImage(vig(), 0, 0, W, H);
    drawSkillBar(g); drawCut(g);
    if (flashT > 0){ g.globalAlpha = Math.min(.55, flashT/30); g.fillStyle = flashC || "#fff"; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
    drawHud(g);
  }
  function drawFx(g, sel){
    FX.forEach(f => { const sx = f.x - camX;
      if (f.k === "p"){ g.fillStyle = f.c; g.fillRect(Math.round(sx), Math.round(f.y - f.z), 6, 6); }
      else if (f.k === "star"){ const r = (10 - f.t)*6 + 10; g.strokeStyle = f.c; g.lineWidth = 5; g.beginPath(); for (let i = 0; i < 8; i++){ const a = i*Math.PI/4; g.moveTo(sx + Math.cos(a)*r*.3, f.y - f.z + Math.sin(a)*r*.3); g.lineTo(sx + Math.cos(a)*r, f.y - f.z + Math.sin(a)*r); } g.stroke(); }
      else if (f.k === "n"){ const age = (f.T || 48) - f.t, pop = age < 6 ? 1.5 - age*.085 : 1; g.globalAlpha = Math.min(1, f.t/12);
        drawDmg(g, f.txt, f.c, sx, f.y - f.z, pop*(f.c === "#ffd43b" ? 1.15 : 1)); g.globalAlpha = 1; }
      else if (f.k === "hb"){ const q = 1 - f.t/14, b = burstSpr(f.c), sz = 70 + q*110; g.save(); g.globalAlpha = Math.min(1, f.t/6); g.globalCompositeOperation = "lighter"; g.translate(sx, f.y - f.z); g.rotate(f.r + q*.6); g.drawImage(b, -sz/2, -sz/2, sz, sz); g.restore(); }
      else if (f.k === "ghost"){ const c = WAR.spr("h" + f.cls, "war", WDEF[QCL[f.cls].id], "walk1", HSC); g.save(); g.globalAlpha = f.t/12*.45; g.globalCompositeOperation = "lighter"; blit(g, c, sx, f.y - (f.z || 0), c.ax, c.ay, f.f); g.restore(); }
      else if (f.k === "bolt"){ g.save(); g.globalAlpha = f.t/14; g.strokeStyle = "#fff"; g.shadowColor = "#74c0fc"; g.shadowBlur = 20; g.lineWidth = 8; g.beginPath(); let yy = 0, xx = sx; g.moveTo(xx, -10); while (yy < f.y - 40){ yy += 50; xx = sx + ((yy*37 + f.t*13) % 50) - 25; g.lineTo(xx, yy); } g.lineTo(sx, f.y - 40); g.stroke(); g.lineWidth = 3; g.strokeStyle = "#a5d8ff"; g.stroke(); g.restore(); }
      else if (f.k === "mc"){ const q = 1 - f.t/60, m = circleSpr(f.c), sz = 260*(q < .15 ? q/.15 : 1); g.save(); g.globalAlpha = Math.min(1, f.t/12)*.9; g.translate(f.x - camX, f.y); g.scale(1, .35); g.rotate(NG.frame*.05); g.drawImage(m, -sz/2, -sz/2, sz, sz); g.restore(); }
      else if (f.k === "sl"){ const k = 1 - f.t/10, R0 = f.big ? 120 : 90, cr = crescentSpr(f.big ? 1 : 0); g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = 1 - k*.8; g.translate(sx, f.y - f.z); g.scale(f.f > 0 ? 1 : -1, 1); g.rotate(-.9 + k*1.1); const sz = (R0 + k*30)*2.3; g.drawImage(cr, -sz/2, -sz/2, sz, sz); g.restore(); }
      else if (f.k === "sl_old"){ const k = 1 - f.t/10, R0 = f.big ? 110 : 80; g.strokeStyle = `rgba(255,255,255,${.9*(1 - k)})`; g.lineWidth = f.big ? 14 : 9; g.beginPath(); const a0 = f.f > 0 ? -1.6 : Math.PI + 1.6, a1 = f.f > 0 ? .9 : Math.PI - .9;
        g.arc(sx, f.y - f.z, R0 + k*20, Math.min(a0, a1), Math.max(a0, a1)); g.stroke(); g.strokeStyle = `rgba(255,224,102,${.8*(1 - k)})`; g.lineWidth = 4; g.beginPath(); g.arc(sx, f.y - f.z, R0 + k*20 - 10, Math.min(a0, a1), Math.max(a0, a1)); g.stroke(); }
      else if (f.k === "bm"){ const k = 1 - f.t/26; g.globalAlpha = 1 - k; g.fillStyle = "#ffd43b"; g.beginPath(); g.ellipse(sx, f.y - 40, f.r*(.4 + k), f.r*(.4 + k)*.5, 0, 0, 7); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.ellipse(sx, f.y - 40, f.r*(.25 + k*.6), f.r*(.25 + k*.6)*.45, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
      else if (f.k === "zp"){ const k = f.t/12, x0 = f.x0 - camX, x1 = f.x1 - camX; g.save(); g.globalCompositeOperation = "lighter"; g.globalAlpha = k; g.strokeStyle = f.c; g.lineWidth = 6*k + 2; g.lineCap = "round"; g.beginPath(); g.moveTo(x0, f.y0); g.quadraticCurveTo((x0 + x1)/2, Math.min(f.y0, f.y1) - 60, x1, f.y1); g.stroke(); g.strokeStyle = "#fff"; g.lineWidth = 2; g.stroke(); g.fillStyle = f.c; g.beginPath(); g.arc(x1, f.y1, 14*k + 4, 0, 7); g.fill(); g.restore(); }
      else if (f.k === "dust"){ g.globalAlpha = f.t/14*.6; g.fillStyle = "#dee2e6"; g.beginPath(); g.ellipse(sx, f.y, 40 - f.t*1.5, 12, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
      else if (f.k === "snowf"){ f.y += 2.2; f.x += f.vx; g.fillStyle = "#fff"; g.fillRect(Math.round(sx), Math.round(f.y), 5, 5); } });
  }
  function drawSel(g){
    g.fillStyle = "rgba(15,10,40,.62)"; g.fillRect(0, 0, W, H);
    outlined(g, "🛡️ 용사를 골라요!", W/2, 150, 52, "#ffe066");
    outlined(g, `← → 로 바꾸고 ⚔️ 공격 단추로 결정 · ${Math.ceil(pt/60)}초`, W/2, 205, 24, "#fff");
    const cw = 260, x0 = W/2 - cw*2;
    QCL.forEach((C, ci) => { const x = x0 + ci*cw + cw/2, y = 420;
      g.fillStyle = "rgba(255,255,255,.08)"; rrect(g, x - cw/2 + 10, 240, cw - 20, 380, 20); g.fill(); g.strokeStyle = C.c; g.lineWidth = 4; g.stroke();
      const pose = ["idle0", "atk1"][(NG.frame >> 5) % 2];
      const hc = WAR.spr("h" + ci, "war", WDEF[C.id], pose, 1.3); g.drawImage(hc, x - hc.ax, y + 140 - hc.ay, hc.w, hc.h);
      outlined(g, `${C.e} ${C.n}`, x, 280, 30, C.c); outlined(g, `✨ ${C.sp}`, x, 590, 19, "#fff");
      const here = P.filter(p => p.cls === ci);
      here.forEach((p, k) => { const fx = x - (here.length - 1)*28 + k*56; faceAt(g, p.sid, fx, 625 + 28, 24, p.ready ? "#69db7c" : "#fff"); if (p.ready) outlined(g, "✔", fx + 18, 625 + 10, 22, "#69db7c"); }); });
  }
  /* 화면 위 칸 그림 (한 번만 그려 붙여요) */
  const hudCard = (c, w, me) => G2.spr(`qdc${c}${w}${me ? 1 : 0}`, w, 84, t => { const g2 = t.createLinearGradient(0, 0, 0, 84); g2.addColorStop(0, me ? "rgba(70,52,10,.88)" : "rgba(34,24,80,.86)"); g2.addColorStop(1, me ? "rgba(40,28,6,.82)" : "rgba(14,10,40,.8)");
    t.fillStyle = g2; rrect(t, 0, 0, w, 84, 16); t.fill(); t.strokeStyle = me ? "#ffe066" : c; t.lineWidth = 2.5; rrect(t, 1.25, 1.25, w - 2.5, 81.5, 15); t.stroke();
    t.fillStyle = "rgba(255,255,255,.1)"; rrect(t, 6, 4, w - 12, 18, 9); t.fill(); });
  const stPill = () => G2.spr("qdpill", 560, 44, t => { const g2 = t.createLinearGradient(0, 0, 0, 44); g2.addColorStop(0, "rgba(34,24,80,.88)"); g2.addColorStop(1, "rgba(14,10,40,.84)"); t.fillStyle = g2; rrect(t, 0, 0, 560, 44, 22); t.fill();
    t.strokeStyle = "rgba(255,224,102,.7)"; t.lineWidth = 2; rrect(t, 1, 1, 558, 42, 21); t.stroke(); });
  const plate = () => G2.spr("qdplate", 900, 190, t => { const g2 = t.createLinearGradient(0, 0, 900, 0); g2.addColorStop(0, "rgba(15,10,40,0)"); g2.addColorStop(.2, "rgba(15,10,40,.75)"); g2.addColorStop(.8, "rgba(15,10,40,.75)"); g2.addColorStop(1, "rgba(15,10,40,0)");
    t.fillStyle = g2; t.fillRect(0, 12, 900, 166); const l = t.createLinearGradient(0, 0, 900, 0); l.addColorStop(0, "rgba(255,224,102,0)"); l.addColorStop(.5, "#ffe066"); l.addColorStop(1, "rgba(255,224,102,0)"); t.fillStyle = l; t.fillRect(0, 12, 900, 3); t.fillRect(0, 175, 900, 3); });
  const vig = () => G2.spr("qdvig", 1280, 720, t => { const g2 = t.createRadialGradient(640, 400, 320, 640, 360, 820); g2.addColorStop(0, "rgba(10,5,25,0)"); g2.addColorStop(1, "rgba(10,5,25,.4)"); t.fillStyle = g2; t.fillRect(0, 0, 1280, 720); });
  function drawHud(g){
    const n = P.length, pw = Math.min(310, (W - 20)/n);
    P.forEach((p, i) => { const x = 10 + i*pw, y = 8, C = QCL[p.cls], me = party ? i === myIdx : local.includes(i);
      g.drawImage(hudCard(C.c, Math.round(pw - 8), me), x, y, Math.round(pw - 8), 84);
      faceAt(g, p.sid, x + 38, y + 42, 28, C.c, p.st === "out" || p.st === "dead");
      outlined(g, `${i + 1}P ${C.e} ${nameOf(noOf_(p.sid)) || "선생님"}${isBot(i) ? " 🤖" : ""}`, x + 74, y + 18, 19, me ? "#ffe066" : "#fff", undefined, "left");
      const hr = p.hp/mhpOf(p); bar(g, x + 74, y + 34, pw - 96, 14, hr, hr > .35 ? "#51cf66" : "#ff6b6b");
      bar(g, x + 74, y + 54, pw - 96, 8, p.mp/100, p.mp >= 100 ? ((NG.frame >> 3) % 2 ? "#ffd43b" : "#74c0fc") : "#4dabf7");
      outlined(g, p.st === "out" ? "💤 쉬는 중" : `${"❤️".repeat(Math.max(0, p.lives))} ${Math.round(p.score)}점`, x + 74, y + 74, 15, "#fff", undefined, "left");
      if (p.mp >= 100 && alive(p)) outlined(g, "✨OK", x + pw - 40, y + 56, 15, "#ffd43b"); });
    if (phase !== "sel" && MODE !== "adv"){ const px = W/2 - 280, py = 98; g.drawImage(stPill(), px, py, 560, 44);
      if (MODE === "boss"){ outlined(g, `👑 보스 도전 ${BLV + 1}/${QBL.length}`, px + 18, py + 22, 18, "#ffe066", undefined, "left"); const st = phase === "play" ? starsNow() : 3;
        outlined(g, `${"⭐".repeat(st)}${"☆".repeat(3 - st)}`, px + 300, py + 22, 18, "#fff"); outlined(g, `⏱️ ${Math.ceil(Math.max(0, BT)/60)}초`, px + 540, py + 22, 18, BT < 60*15 ? "#ff6b6b" : "#fff", undefined, "right"); }
      else if (AR){ outlined(g, `⚔️ 결투장 ROUND ${AR.rd}`, px + 18, py + 22, 18, "#ffe066", undefined, "left"); outlined(g, P.map((p, i) => `${i + 1}P ${"★".repeat(AR.w[i]) || "·"}`).join("  "), px + 300, py + 22, 17, "#fff");
        outlined(g, `⏱️ ${Math.ceil(Math.max(0, AR.t)/60)}초`, px + 540, py + 22, 18, AR.t < 60*10 ? "#ff6b6b" : "#fff", undefined, "right"); }
      const b = bossId && E.find(e => e.id === bossId);
      if (b && b.st !== "die"){ const D = QEN[b.k]; g.fillStyle = "rgba(15,10,40,.6)"; rrect(g, 200, 150, W - 400, 40, 20); g.fill(); outlined(g, `👑 ${D.n}${b.rage ? " 😡" : ""}`, 222, 170, 20, "#ffd43b", undefined, "left"); bar(g, 470, 161, W - 690, 18, b.hp/b.mhp, b.rage ? "#ff2d2d" : "#fa5252"); }
    }
    if (phase !== "sel" && MODE === "adv"){
      { const S = QST[stage], px = W/2 - 280, py = 98; g.drawImage(stPill(), px, py, 560, 44);
        outlined(g, `STAGE ${stage + 1}/${QD_MAX}`, px + 18, py + 22, 18, "#ffe066", undefined, "left");
        outlined(g, S.n, px + 214, py + 22, 17, "#fff");
        for (let k = 0; k < 5; k++){ const dx = px + 300 + k*26, on = k === S.k, done = k < S.k; g.fillStyle = on ? "#ffe066" : done ? "#69db7c" : "rgba(255,255,255,.22)"; g.beginPath(); g.arc(dx, py + 22, on ? 9 : 7, 0, 7); g.fill();
          if (k === 4 || k === 2){ g.font = `${k === 4 ? 12 : 10}px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("👑", dx, py + 8); } }
        outlined(g, `팀 ${Math.round(team).toLocaleString()}점`, px + 540, py + 22, 18, "#fff", undefined, "right"); }
      const b = bossId && E.find(e => e.id === bossId);
      if (b && b.st !== "die"){ const D = QEN[b.k]; g.fillStyle = "rgba(15,10,40,.6)"; rrect(g, 200, 150, W - 400, 40, 20); g.fill(); outlined(g, `👑 ${D.n}`, 222, 170, 20, "#ffd43b", undefined, "left"); bar(g, 470, 161, W - 690, 18, b.hp/b.mhp, "#fa5252"); }
      if (goT > 0 && (goT >> 4) % 2) outlined(g, "GO ▶▶", W - 140, 330, 60, "#ffe066");
    }
    if (banner){ const a = Math.min(1, banner.k/20); g.globalAlpha = a; if (banner.t) g.drawImage(plate(), W/2 - 450, 220, 900, 190); if (banner.t) outlined(g, banner.t, W/2, 290, 78, "#ffe066"); if (banner.s) outlined(g, banner.s, W/2, banner.t ? 360 : 300, 34, "#fff"); g.globalAlpha = 1; }
  }
  /* ⌨️ 스킬 단축키 칸 (메이플처럼 아래쪽에 · 쿨타임이 돌아요) */
  const slotBg = () => G2.spr("qdslot", 60, 60, t => { const g2 = t.createLinearGradient(0, 0, 0, 60); g2.addColorStop(0, "rgba(60,48,110,.92)"); g2.addColorStop(1, "rgba(20,14,48,.92)"); t.fillStyle = g2; rrect(t, 2, 2, 56, 56, 12); t.fill(); t.strokeStyle = "rgba(255,224,102,.75)"; t.lineWidth = 2; rrect(t, 2, 2, 56, 56, 12); t.stroke(); t.fillStyle = "rgba(255,255,255,.12)"; rrect(t, 6, 5, 48, 14, 7); t.fill(); });
  const emoS = e => G2.spr("qe" + e, 40, 40, t => { t.font = `30px ${EMOJI}`; t.textAlign = "center"; t.textBaseline = "middle"; t.fillText(e, 20, 22); });
  function drawSkillBar(g){
    if (phase !== "play" && phase !== "clear") return; const mine = party === "guest" ? [myIdx] : local.filter(i => !isBot(i)); if (!mine.length || (PADS.length && "ontouchstart" in window)) return;
    mine.slice(0, 2).forEach((pi, n) => { const p = P[pi]; if (!p) return; const C = QCL[p.cls], K = QSK[C.id], two = local.length >= 2 && party !== "guest";
      const keysTxt = two ? (n === 0 ? ["Z", "X", "C", "V", "B", "N", "⇧"] : ["J", "K", "L", ";", "'", "P", "⇧"]) : ["A", "S", "Q", "W", "F", "E", "D"];
      const gg = p.gg || {}, PT = gg.pet ? QG.PETS.find(q => q.id === gg.pet) : null;
      const slots = [["⚔️", "공격", 0, 1], ["🦘", "점프", 0, 1], [K[0].e, K[0].n, p.cd1 || 0, K[0].cd], [K[1].e, K[1].n, p.cd2 || 0, K[1].cd], ["✨", C.sp, p.mp >= 100 ? 0 : 100 - p.mp, 100], [PT ? PT.e : "🐾", PT ? PT.sk : "펫 없음", PT ? p.pcd || 0 : 1, PT ? (gg.pet === "uni" || gg.pet === "eagle" ? 780 : 600) : 1], ["💨", "대시", p.dcd || 0, p.gs ? p.gs.dcd : 40]];
      const x0 = two ? (n === 0 ? 16 : W - 16 - slots.length*64) : W/2 - slots.length*32, y0 = H - 72;
      slots.forEach(([e, nm, cd, mx], i) => { const x = x0 + i*64; g.drawImage(slotBg(), x, y0, 60, 60); g.drawImage(emoS(e), x + 10, y0 + 6, 40, 40);
        if (cd > 0){ g.fillStyle = "rgba(0,0,0,.55)"; g.beginPath(); g.moveTo(x + 30, y0 + 30); g.arc(x + 30, y0 + 30, 27, -Math.PI/2, -Math.PI/2 + Math.PI*2*cd/mx); g.closePath(); g.fill();
          if (i !== 4 && mx > 1) outlined(g, String(Math.ceil(cd/60)), x + 30, y0 + 30, 20, "#fff"); }
        else if (i === 4 && (NG.frame >> 3) % 2){ g.strokeStyle = "#ffe066"; g.lineWidth = 3; rrect(g, x + 2, y0 + 2, 56, 56, 12); g.stroke(); }
        outlined(g, keysTxt[i], x + 10, y0 + 10, 14, "#ffe066", undefined, "left"); }); });
  }
  function drawPads(g){
    // 손가락 단추
    if (!NG.ended && (party !== "guest" || true) && ("ontouchstart" in window || navigator.maxTouchPoints > 0)){
      PADS.forEach(pd => { let on = false, sv = null; ptr.forEach(v => { if (v.t === pd.t){ on = true; sv = v; } });
        const cx = sv && sv.cx != null ? sv.cx : pd.x, cy = sv && sv.cx != null ? sv.cy : pd.y;
        g.globalAlpha = PX ? (on ? .85 : .6) : on ? .55 : .3; g.fillStyle = pd.t === "st" ? "#fff" : pd.t === "a" ? "#ff6b6b" : pd.t === "j" ? "#4dabf7" : pd.t === "x" ? "#20c997" : pd.t === "q" || pd.t === "e" ? "#fab005" : "#cc5de8"; g.beginPath(); g.arc(cx, cy, pd.r, 0, 7); g.fill(); g.globalAlpha = 1;
        if (pd.t === "st"){ const lim = pd.r*.57, kx = sv ? clampN(sv.sx - cx, -lim, lim) : 0, ky = sv ? clampN(sv.sy - cy, -lim, lim) : 0; g.fillStyle = "rgba(255,255,255,.8)"; g.beginPath(); g.arc(cx + kx, cy + ky, pd.r*.38, 0, 7); g.fill(); }
        else { g.font = `${pd.r*.8}px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(pd.e, pd.x, pd.y + 2); } });
    }
  }

  const self = { get W(){ return W + 2*PX; }, H, layout, maxPx: 1280*720*1.6,
    init(){ init(); if (party) PARTY.attach(self, null); },
    step, draw,
    down(x, y, id){ x -= PX; const pd = padAt(x, y); if (!pd) return; const pi = local[0];
      if (pd.t === "st"){ const v = {t: "st"}; stickSet(v, x, y); ptr.set(id, v); return; }
      ptr.set(id, {t: pd.t}); press(pi, pd.t); },
    move(x, y, id){ const v = ptr.get(id); if (v && v.t === "st") stickSet(v, x - PX, y); },
    up(x, y, id){ ptr.delete(id); },
    key(code, d, e){
      const ms = maps(); let used = false;
      ms.forEach((m, s) => { ["u", "d", "l", "r"].forEach(k => { if (m[k].includes(code)) used = true; });
        QB.forEach(b => { if (m[b] && m[b].includes(code)){ used = true; if (d && !(e && e.repeat)) press(local[s] != null ? local[s] : local[0], b); } }); });
      if (used){ d ? keys.add(code) : keys.delete(code); }
      return used;
    },
    hud(){ if (MODE !== "adv" && phase !== "sel") return MODE === "boss" ? `👑 보스 도전 ${BLV + 1}단계 · ${QEN[QBL[BLV]].n}` : `⚔️ 결투장${AR ? ` · ROUND ${AR.rd}` : ""}${party ? " · 🌐 온라인" : ""}`;
      return `🛡️ 용사 대모험 · ${phase === "sel" ? "용사 고르기" : `STAGE ${stage + 1}/${QD_MAX} · ${QST[stage].n}`} · 팀 ${Math.round(team)}점${party ? " · 🌐 온라인" : ""}`; },
    apply, dropIdx(i){ if (!(O.bots = O.bots || []).includes(i)) O.bots.push(i); },
    end(w, res){ if (ended) return; ended = true; results = res; QDM.result(res, O); },
    /* ▶ 이어하기: 모두 다시 일어나서 지금 스테이지 그대로 */
    revive(){ if (!ended || (results && results.win) || MODE !== "adv") return; ended = false; phase = "play"; results = null;
      P.forEach(p => { p.lives = Math.max(p.lives, 2); if (!alive(p)) Object.assign(p, {st: "jump", z: 420, vz: 0, x: camX + W*.4 + p.i*40, y: YT + 60 + p.i*40, hp: mhpOf(p), inv: 180, t: 0, jx: 0}); else p.hp = mhpOf(p); });
      say("▶ 이어하기!", "용사들이 다시 일어났어요!", 120); },
    cont(){ ended = false; },
    /* 시험용 */
    dbg(){ return {P, E, PR, IT, PROPS, phase, stage, camX, team, lockX, segI, bossId, HZ, AR, MODE, BT}; },
    cheat(o){ if (o.kb){ const b = E.find(e => QEN[e.k].boss && e.st !== "die"); if (b) hitEnemy(b, 1e7, 1, true, 0); } if (o.hits != null) P.forEach(p => p.hitN = o.hits); if (o.stage != null){ P.forEach(p => p.ready = true); startStage(o.stage); } if (o.cam != null){ P.forEach((p, i) => p.x = o.cam + 300 + i*60); camX = o.cam; E = []; pend = []; lockX = null; segI = QST[stage].seg.filter(sg => sg[0] <= o.cam).length; } if (o.god) P.forEach(p => p.inv = 1e9); if (o.mp) P.forEach(p => p.mp = 100); if (o.kill) E.forEach(e => { if (e.st !== "die") hitEnemy(e, 99999, 1, true, 0); }); if (o.hurt) P.forEach(p => { p.hp = 1; p.inv = 0; }); }
  };
  return self;
};

/* =====================================================================
   🛡️ 시작 메뉴 · 결과 · 온라인 방
   ===================================================================== */
/* 기록 남기기: 이 기기에서 한 친구들만 (온라인이면 각자 자기 기기에서) — 둘이 한 기기면 친구 기록도 같이 */
function qdSave(sid, score){
  const cur = (Store.recs.qd || {})[sid], r = Object.assign({best: 0, plays: 0}, cur ? JSON.parse(JSON.stringify(cur)) : {});
  const prevBest = r.best || 0, td = today();
  r.plays = (r.plays || 0) + 1; r.last = score;
  if (r.day !== td){ r.day = td; r.dayBest = 0; r.dayPlays = 0; }
  r.dayPlays = (r.dayPlays || 0) + 1; if (score > (r.dayBest || 0)){ r.dayBest = score; r.dayAt = Date.now(); }
  const isNew = score > prevBest && score > 0; if (isNew){ r.best = score; r.bestAt = Date.now(); }
  Store.putScore("qd", sid, JSON.parse(JSON.stringify(r)));
  const coins = Store.earn(sid, coinsFor("qd", score) + (isNew ? BEST_COIN : 0));
  const B = board("qd"), me = B.find(x => x.sid === sid);
  return {isNew, rank: me ? me.rank : 0, n: B.length, coins};
}
/* 🏅 용사 포인트: 👑 보스 도전에서 ⭐을 모아 얻고 · ⚔️ 결투장 참가비(10)로 써요. 이긴 친구가 참가비를 모두 가져가요 */
const QPT = {
  FEE: 10,
  of(sid){ const q = walletOf(sid).qdp || {}; return {pt: q.pt || 0, bs: q.bs || {}, aw: q.aw || 0, al: q.al || 0}; },
  edit(sid, fn){ return Store.kidTx(sid, w => { const q = Object.assign({pt: 0, aw: 0, al: 0}, w.qdp || {}); q.bs = Object.assign({}, q.bs || {}); fn(q); q.pt = Math.max(0, Math.round(q.pt)); w.qdp = q; return w; }); },
  open(sid){ const b = this.of(sid).bs; let n = 0; while (n < QBL.length - 1 && (b[n] || 0) >= 1) n++; return n; },   // 도전할 수 있는 가장 높은 단계
  per: l => 10 + l*2,   // ⭐ 하나에 받는 포인트 (뒤 보스일수록 많이)
  /* 보스 결과 저장: 새로 딴 ⭐만 포인트 (같은 보스를 또 깨면 +2) */
  boss(sid, l, stars){ const old = this.of(sid).bs[l] || 0, gain = stars > old ? (stars - old)*this.per(l) : stars ? 2 : 0;
    if (stars || gain) this.edit(sid, q => { q.bs[l] = Math.max(q.bs[l] || 0, stars); q.pt += gain; }); return {gain, old}; },
  duel(sid, won, nHum){ const d = won ? this.FEE*(nHum - 1) : -this.FEE; this.edit(sid, q => { q.pt += d; if (won) q.aw++; else q.al++; }); return d; }
};
const QDM = {
  bots: 1, st: 1, om: "boss", obl: 0, two: false,
  menu(){
    const me = ARC.me, box = partyModal("qd");
    const botRow = (id, max) => `<div class="wb-row"><span>🤖 컴퓨터 동료</span><div class="arc-seg" id="${id}">${Array.from({length: max + 1}, (_, n) => `<button data-v="${n}" class="${n === Math.min(max, this.bots) ? "on" : ""}">${n}명</button>`).join("")}</div></div>`;
    const qp = QPT.of(sidOf(me)), op = QPT.open(sidOf(me));
    const bossGrid = QBL.map((k, l) => { const st = qp.bs[l] || 0, lock = l > op; return `<button class="qd-bl${lock ? " lock" : ""}${st ? " done" : ""}" data-bl="${l}" ${lock ? "disabled" : ""} title="${esc(QEN[k].n)}"><b>${lock ? "🔒" : l + 1}</b><small>${lock ? "" : "⭐".repeat(st) + "☆".repeat(3 - st)}</small><i>${esc(QEN[k].n)}</i></button>`; }).join("");
    $("#wbBody").innerHTML = `<div class="qd-pt">🏅 용사 포인트 <b>${qp.pt}</b><small>⚔️ 결투 ${qp.aw}승 ${qp.al}패</small></div>
      <div class="wb-sec qd-boss"><h3>👑 보스 도전 <small>졸개 없이 보스와 한판! 바닥의 <b style="color:#ff6b6b">빨간 경고</b>를 보고 💨대시·🦘점프로 피해요 · 덜 맞을수록 ⭐ · ⭐마다 🏅 포인트</small></h3>
        <div class="qd-bls">${bossGrid}</div><label class="qd-two"><input type="checkbox" id="qdBTwo" ${this.two ? "checked" : ""}> 👫 이 기기에서 친구와 둘이 도전</label></div>
      <div class="wb-sec qd-arena"><h3>⚔️ 결투장 <small>장비 없이 모두 같은 힘 · 3판 2선승 · 참가비 🏅${QPT.FEE} → 이긴 친구가 모두 가져가요</small></h3>
        <div class="arc-row"><button class="arc-btn p" id="qdDuel">👫 이 기기에서 친구와 결투</button><button class="arc-btn" id="qdDuelBot">🤖 컴퓨터와 연습 <small>(포인트 없이)</small></button></div>
        </div>
      <div class="wb-sec qd-on"><h3>🌐 온라인 방 <small>각자 기기로 최대 4명 · 방을 만들기 전에 할 것을 골라요</small></h3>
        <div class="wb-row"><span>할 것</span><div class="arc-seg" id="qdOm"><button data-v="boss" class="${this.om === "boss" ? "on" : ""}">👑 보스 협동</button><button data-v="arena" class="${this.om === "arena" ? "on" : ""}">⚔️ 결투</button><button data-v="adv" class="${this.om === "adv" ? "on" : ""}">🗺️ 모험</button></div></div>
        <div class="wb-row" id="qdObRow" ${this.om === "boss" ? "" : "hidden"}><span>👑 보스</span><select id="qdOb" class="qd-ob">${QBL.map((k, l) => `<option value="${l}" ${l === Math.min(this.obl, op) ? "selected" : ""} ${l > op ? "disabled" : ""}>${l + 1}단계 · ${esc(QEN[k].n)}${l > op ? " 🔒" : ""}</option>`).join("")}</select></div></div>
      <button class="arc-btn p qd-shopb" id="qdShop">🛒 용사 상점 <small>무기·갑옷·투구·신발·날개·🐾펫</small></button><div class="qd-intro"><div class="qd-cls">${QCL.map(c => `<span style="--c:${c.c}">${c.e}<b>${c.n}</b><small>✨ ${c.sp}</small></span>`).join("")}</div>
        <p class="arc-small">최대 <b>4명</b>이 힘을 합쳐 <b>${QD_MAX}단계</b>(26개의 땅 × 5단계)를 깨요. 3단계마다 작은 보스, 5단계마다 무시무시한 <b>보스</b>! 31단계부터는 몬스터가 훨씬 세져서 <b>🛒 용사 상점</b>에서 장비를 강화해야 해요.
        <br>⌨️ 이동 <b>방향키</b> · 왼손 <b>A</b> 공격 · <b>S</b> 점프 · <b>D</b> 💨대시 · <b>F</b> ✨필살 · <b>Q</b> 스킬1 · <b>W</b> 스킬2 · <b>E</b> 🐾펫 · 📱 화면 단추도 돼요
        <br><small>직업마다 스킬 둘: 검객 삼연참·검기 / 창장수 회전창·돌진 / 궁장 삼연발·폭탄 화살 / 책사 낙뢰·치유의 바람</small></p></div>
      ${REACH.html("qd", sidOf(me), QCH.map(c => c.n), this.st = Math.min(this.st, Math.floor((REACH.get("qd", sidOf(me)) - 1)/5)*5 + 1))}
      <div class="wb-sec"><h3>🧒 나 혼자 <small>🤖 동료와 함께 · 내 점수가 랭킹에 올라가요</small></h3>${botRow("qdB1", 3)}<button class="arc-btn p" id="qdSolo">▶ 출발!</button></div>
      <div class="wb-sec"><h3>👫 이 기기에서 둘이 <small>1P WASD + Z X C V B N · 대시 왼쪽 Shift · 2P 방향키 + J K L ; ' P · 대시 오른쪽 Shift·Enter</small></h3>${botRow("qdB2", 2)}<button class="arc-btn p" id="qdTwo">🧒 친구 들어오기</button></div>
      <div class="wb-sec"><h3>🌐 온라인 방 목록 <small>☁️ Firebase 반에서만 · 방장이 고른 것(👑 보스 협동 · ⚔️ 결투 · 🗺️ 모험)을 함께 해요</small></h3><div id="wbRooms"></div></div>`;
    const seg = id => { const s = $("#" + id); if (s) s.onclick = e => { const b = e.target.closest("button"); if (!b) return; s.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); this.bots = +b.dataset.v; }; };
    ["qdB1", "qdB2"].forEach(seg); REACH.bind($("#wbBody"), v => { this.st = v; });
    const nb = id => { const b = $(`#${id} .on`); return b ? +b.dataset.v : 0; };
    $("#qdSolo").onclick = () => { box.hidden = true; this.start([me], nb("qdB1")); };
    $("#qdTwo").onclick = () => { const n = nb("qdB2"); box.hidden = true; ARC.pickRival("qd", opp => this.start([me, opp], n)); };
    $("#qdShop").onclick = () => QG.UI.open(sidOf(me));
    $("#qdBTwo").onchange = e => { this.two = e.target.checked; };
    $("#wbBody").querySelector(".qd-bls").onclick = e => { const b = e.target.closest("[data-bl]"); if (!b || b.disabled) return; const l = +b.dataset.bl;
      box.hidden = true; if (this.two) ARC.pickRival("qd", opp => this.start([me, opp], 0, {mode: "boss", bl: l})); else this.start([me], 0, {mode: "boss", bl: l}); };
    $("#qdDuel").onclick = () => { box.hidden = true; ARC.pickRival("qd", opp => { const ok = [me, opp].every(n => QPT.of(sidOf(n)).pt >= QPT.FEE);
      if (!ok) toast(`🏅 포인트가 ${QPT.FEE}보다 적은 친구가 있어서 이번엔 포인트 없이 결투해요 · 👑 보스 도전으로 모아요`); this.start([me, opp], 0, {mode: "arena", stake: ok}); }); };
    $("#qdDuelBot").onclick = () => { box.hidden = true; this.start([me], 1, {mode: "arena"}); };
    { const s = $("#qdOm"); s.onclick = e => { const b = e.target.closest("button"); if (!b) return; s.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); this.om = b.dataset.v; $("#qdObRow").hidden = this.om !== "boss"; }; }
    this.obl = Math.min(this.obl, op); $("#qdOb").onchange = e => { this.obl = +e.target.value; };
    PARTY.renderRooms();
    box.hidden = false;
  },
  start(humans, nBots, extra){
    nBots = Math.max(0, Math.min(4 - humans.length, nBots));
    const bots = WB.pickBots(humans, nBots), sids = humans.concat(bots).map(sidOf);
    ARC.game = "qd"; ARC.enter && ARC.enter(); ARC.prep(); getAC();
    NG.play("qd", sids, Object.assign({local: humans.map((_, i) => i), bots: bots.map((_, i) => humans.length + i), stage: this.st - 1}, extra || {}));
  },
  /* 결과: 사람 친구마다 자기 점수가 랭킹에 (방장 기기가 올려요) */
  result(R, o){
    if (!R) return;
    if (R.mode === "boss" || R.mode === "arena") return this.result2(R, o);
    let saved = {};
    const mine = o.party === "guest" ? [o.idx] : o.party === "host" ? [0] : (o.local || [0]);
    R.res.forEach(x => { if (mine.includes(x.i)) try { saved[x.i] = qdSave(x.sid, x.sc); } catch(e){ console.error(e); } });
    (R.win ? SFX.rec : SFX.over)();
    const rows = R.res.concat(R.bots || []).sort((a, b) => b.sc - a.sc).map((x, k) => { const s = saved[x.i], bot = (R.bots || []).some(b => b.i === x.i);
      return `<div class="qd-r${o.party === "guest" ? (x.i === o.idx ? " me" : "") : (o.local || [0]).includes(x.i) ? " me" : ""}"><span class="rk">${["🥇","🥈","🥉","4"][k] || k + 1}</span><span class="avf">${avHTMLof(x.sid, {still: true, face: true})}</span>
        <b>${QCL[x.cls].e} ${esc(who(noOf_(x.sid)))}${bot ? " 🤖" : ""}</b><span class="sc">${x.sc.toLocaleString()}점</span>
        <small>${bot ? "컴퓨터 동료" : s ? `${s.isNew ? "🎉 새 기록! · " : ""}반 ${s.rank}등${s.coins ? ` · 🪙 +${s.coins}` : ""}` : o.party ? "기록은 친구 자기 기기에서 올라가요" : ""}</small></div>`; }).join("");
    $("#ngOver").innerHTML = `${R.win ? NG.conf(110) : ""}<div class="ng-box qd-over"><h3>${R.win ? `🏆 ${QD_MAX}단계 모두 클리어! 전설의 용사들!` : `💫 STAGE ${R.stage}/${QD_MAX}에서 쓰러졌어요`}</h3>
      <div class="sc">팀 ${R.team.toLocaleString()}점</div><div class="qd-rs">${rows}</div>
      <div class="arc-row">${o.party === "guest" ? `<button class="arc-btn" data-qd="wait">⏳ 방장이 다시 시작하길 기다려요</button>` : `<button class="arc-btn p" data-qd="again">🔁 다시 모험</button>`}<button class="arc-btn" data-qd="home">🏠 홈으로</button></div></div>`;
    $("#ngOver").hidden = false; NG.ended = true;
    $("#ngOver").onclick = e => { const b = e.target.closest("[data-qd]"); if (!b) return; e.stopPropagation();
      if (b.dataset.qd === "home"){ PARTY.leave(); NG.close(); }
      else if (b.dataset.qd === "again"){ if (o.party === "host") PARTY.again(); else NG.play("qd", NG.sids, Object.assign({}, o, {seed: 0, cls: null})); } };
    if (!R.win && !R.mode || R.mode === "adv" && !R.win) CONT.attach("qd", o, () => NG.cur && NG.cur.revive && NG.cur.revive());
  }
};
/* 👑 보스 도전 · ⚔️ 결투장 결과 */
QDM.result2 = function(R, o){
  const mine = o.party === "guest" ? [o.idx] : o.party === "host" ? [0] : (o.local || [0]);
  const rows = [], go = (k, t) => `<button class="arc-btn${k === "next" || k === "again" ? " p" : ""}" data-qd="${k}">${t}</button>`;
  let title, sub = "", btns = "";
  if (R.mode === "boss"){
    const l = R.bl, nm = QEN[QBL[l]].n;
    R.res.forEach(x => { if (!mine.includes(x.i)) return; const g = R.win ? QPT.boss(x.sid, l, R.stars) : {gain: 0}; try { qdSave(x.sid, Math.round(x.sc)); } catch(e){}
      rows.push(`<div class="qd-r me"><span class="rk">${QCL[x.cls].e}</span><span class="avf">${avHTMLof(x.sid, {still: true, face: true})}</span><b>${esc(who(noOf_(x.sid)))}</b><span class="sc">${g.gain ? `🏅 +${g.gain}` : ""}</span><small>${R.win ? (g.gain ? (g.old ? "⭐을 더 땄어요!" : "처음 깼어요!") : "이미 딴 ⭐이에요 (더 적게 맞으면 ⭐이 늘어요)") : "다시 도전해 봐요!"} · 지금 🏅 ${QPT.of(x.sid).pt}</small></div>`); });
    title = R.win ? `👑 ${nm} 처치!` : `💫 ${nm}에게 졌어요`;
    sub = R.win ? `<div class="sc qd-stars">${"⭐".repeat(R.stars)}${"☆".repeat(3 - R.stars)}</div><div class="arc-small">맞은 횟수 ${R.hits}번 · ⭐⭐⭐은 거의 안 맞고 이기기</div>` : `<div class="arc-small">💡 빨간 경고가 뜨면 💨대시(D)로 빠지고, 💫 충격파는 🦘점프(S)로 넘어요</div>`;
    const nx = l + 1 < QBL.length && R.win && o.party !== "guest";   // 온라인 방장은 다음 보스로 다 같이
    btns = o.party === "guest" ? `<button class="arc-btn" data-qd="wait">⏳ 방장이 다음 판을 고르길 기다려요</button>` + go("home", "🏠 홈으로")
      : go("again", "🔁 다시 도전") + (nx ? go("next", "▶ 다음 보스") : "") + (o.party ? "" : go("menu", "📜 보스 고르기")) + go("home", "🏠 홈으로");
    SFX[R.win ? "rec" : "over"]();
  } else {
    const wi = R.wi, wsid = (R.res.concat(R.bots || []).find(x => x.i === wi) || {}).sid, botWin = (R.bots || []).some(b => b.i === wi), stake = R.hum >= 2 && (o.party ? true : !!o.stake);
    title = botWin ? "🤖 컴퓨터가 이겼어요" : `🏆 ${esc(who(noOf_(wsid)))} 승리!`;
    sub = `<div class="arc-small">${(R.aw || []).map((w, i) => `${i + 1}P ${"★".repeat(w) || "·"}`).join(" · ")}${stake ? ` · 참가비 🏅${QPT.FEE}씩` : " · 연습 (포인트 없이)"}</div>`;
    R.res.forEach(x => { const won = x.i === wi; let d = 0; if (mine.includes(x.i) && stake){ d = (won || QPT.of(x.sid).pt >= QPT.FEE) ? QPT.duel(x.sid, won, R.hum) : 0; }
      rows.push(`<div class="qd-r${mine.includes(x.i) ? " me" : ""}"><span class="rk">${won ? "🥇" : "🥈"}</span><span class="avf">${avHTMLof(x.sid, {still: true, face: true})}</span><b>${QCL[x.cls].e} ${esc(who(noOf_(x.sid)))}</b><span class="sc">${"★".repeat((R.aw || [])[x.i] || 0)}</span><small>${d ? `🏅 ${d > 0 ? "+" : ""}${d} · 지금 🏅 ${QPT.of(x.sid).pt}` : won ? "멋진 컨트롤!" : "다음엔 이길 수 있어요!"}</small></div>`); });
    btns = (o.party === "guest" ? `<button class="arc-btn" data-qd="wait">⏳ 방장을 기다려요</button>` : go("again", "🔁 한 번 더")) + go("home", "🏠 홈으로");
    SFX.rec();
  }
  const party = R.mode === "boss" ? R.win : !(R.bots || []).some(b => b.i === R.wi);
  $("#ngOver").innerHTML = `${party ? NG.conf(80) : ""}<div class="ng-box qd-over"><h3>${title}</h3>${sub}<div class="qd-rs">${rows.join("")}</div><div class="arc-row">${btns}</div></div>`;
  $("#ngOver").hidden = false; NG.ended = true;
  $("#ngOver").onclick = e => { const b = e.target.closest("[data-qd]"); if (!b) return; e.stopPropagation(); const k = b.dataset.qd;
    if (k === "home"){ PARTY.leave(); NG.close(); }
    else if (k === "menu"){ NG.close(); QDM.menu(); }
    else if (k === "again"){ if (o.party === "host") PARTY.again(); else NG.play("qd", NG.sids, Object.assign({}, o, {seed: 0, cls: null})); }
    else if (k === "next"){ if (o.party === "host"){ QDM.obl = R.bl + 1; PARTY.again(); } else NG.play("qd", NG.sids, Object.assign({}, o, {seed: 0, cls: null, bl: R.bl + 1})); } };
};
(function(){
  const play = ARC.play;
  ARC.play = function(gid){
    if (gid !== "qd") return play.call(this, gid);
    if (!LOBBY.canPlay(gid)) return; getAC(); this.game = gid; this.lastRank = gid; QDM.menu();
  };
  const again = NG.again;
  NG.again = function(){ if (this.gid === "qd"){ if (this.opt.party){ if (this.opt.party === "host") PARTY.again(); return; } return this.play("qd", this.sids, Object.assign({}, this.opt, {seed: 0})); } return again.call(this); };
  /* 🌐 온라인 방: 각자 기기 최대 4명 (빈자리는 🤖 동료 · 방장 혼자서도 출발) */
  PARTY.CFG.qd = {max: 4, bots: 1, min: 1};
  const start = PARTY.start;
  PARTY.start = function(again){
    if (this.gid !== "qd") return start.call(this, again);
    if (this.role !== "host") return;
    const live = this.connected().map(p => p.no);
    this.members = [ARC.me].concat(this.members.filter(no => no !== ARC.me && live.includes(no))).slice(0, this.MAX);
    const M = this.members, nb = QDM.om === "boss" ? 0 : Math.max(0, Math.min(this.bots, this.MAX - M.length));   // 👑 보스는 사람 친구끼리만
    this.started = true; Store.fs.updateDoc(this.ref(this.pid), {st: "play", n: M.length}).catch(() => {});
    const botNos = WB.pickBots(M, nb), sids = M.concat(botNos).map(sidOf), bots = botNos.map((_, i) => M.length + i), seed = Math.floor(Math.random()*1e9) + 1, remote = {};
    M.forEach((no, i) => { if (i){ const P = this.peers.get(no); if (P){ P.idx = i; P.inN = 0; P.last = {d: 0, b: 0}; remote[i] = no; this.send(P, {t: "start", g: "qd", sids, idx: i, bots, seed, mode: QDM.om, bl: QDM.obl}); } } });
    this.startMsg = {t: "start", g: "qd", sids, bots, seed, mode: QDM.om, bl: QDM.obl};
    this.seq = 0; this.lastGv = -1;
    const md = $("#mdWb"); if (md) md.hidden = true;
    if (!again){ ARC.game = "qd"; ARC.enter(); ARC.prep(); }
    getAC(); NG.play("qd", sids, {party: "host", local: [0], bots, remote, seed, stage: QDM.st - 1, mode: QDM.om, bl: QDM.obl});
  };
  const css = document.createElement("style");
  css.textContent = `.in-room>.qd-intro{display:none}.qd-intro{margin-bottom:10px}.qd-cls{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px}
.qd-cls span{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;border-radius:14px;border:2px solid var(--c);background:rgba(255,255,255,.06);font-size:30px}
.qd-cls b{font:17px "Jua",sans-serif;color:var(--c)}.qd-cls small{font:12px "Gowun Dodum",sans-serif;opacity:.85}
.qd-over{max-width:640px}.qd-rs{display:flex;flex-direction:column;gap:6px;margin:10px 0 14px;text-align:left}
.qd-r{display:grid;grid-template-columns:34px 44px 1fr auto;grid-template-rows:auto auto;align-items:center;column-gap:8px;padding:6px 10px;border-radius:12px;background:rgba(255,255,255,.08)}
.qd-r.me{background:rgba(255,224,102,.2);border:2px solid #ffe066}.qd-r .rk{grid-row:span 2;font:22px "Jua",sans-serif;text-align:center}.qd-r .avf{grid-row:span 2;width:44px;height:44px}
.qd-r b{font:17px "Jua",sans-serif}.qd-r .sc{font:20px "Jua",sans-serif;color:#ffe066}.qd-r small{grid-column:3/5;font-size:12.5px;opacity:.85}
.qd-pt{display:flex;align-items:center;gap:10px;justify-content:center;margin:0 0 10px;padding:8px 12px;border-radius:14px;background:linear-gradient(135deg,rgba(255,212,59,.22),rgba(255,146,43,.18));border:2px solid #ffd43b;font:20px "Jua",sans-serif}
.qd-pt b{font-size:26px;color:#ffe066}.qd-pt small{font:13px "Gowun Dodum",sans-serif;opacity:.85}
.qd-bls{display:grid;grid-template-columns:repeat(auto-fill,minmax(74px,1fr));gap:6px;margin:6px 0}
.qd-bl{display:flex;flex-direction:column;align-items:center;gap:1px;padding:6px 2px;border-radius:12px;border:2px solid #ff6b6b;background:rgba(255,107,107,.12);color:#fff;cursor:pointer;font:inherit}
.qd-bl b{font:20px "Jua",sans-serif}.qd-bl small{font-size:11px;letter-spacing:-1px}.qd-bl i{font:normal 10.5px "Gowun Dodum",sans-serif;opacity:.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.qd-bl.done{border-color:#ffd43b;background:rgba(255,212,59,.14)}.qd-bl.lock{opacity:.4;cursor:default;border-color:#495057;background:rgba(255,255,255,.04)}
.qd-ob{flex:1;min-width:0;padding:8px;border-radius:10px;font:15px "Gowun Dodum",sans-serif;background:#1b1642;color:#fff;border:2px solid #7048e8}
.qd-two{display:flex;gap:6px;align-items:center;font-size:14px;margin-top:4px}.qd-stars{font-size:40px}
@media (max-width:560px){.qd-cls{grid-template-columns:repeat(2,1fr)}}`;
  document.head.appendChild(css);
})();
