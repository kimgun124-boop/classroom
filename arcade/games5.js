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
  /* 기억해 둔 그림 (화면 배율마다) */
  const CACHE = new Map(); let CK = 0;
  function spr(key, gw, gh, px, fn){
    const k = NG.k || 1; if (k !== CK){ CACHE.clear(); CK = k; }
    let c = CACHE.get(key);
    if (!c){
      if (CACHE.size > 900) CACHE.clear();
      const [sc, st] = tiny(gw, gh); fn(st, gw, gh); outline(sc);
      c = document.createElement("canvas"); c.width = Math.max(1, Math.round(gw*px*k)); c.height = Math.max(1, Math.round(gh*px*k));
      const t = c.getContext("2d"); t.imageSmoothingEnabled = false; t.drawImage(sc, 0, 0, c.width, c.height);
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
  return {OUT, tiny, R, line, disc, outline, spr, shade, human, lying, quad, dragon, itemArt, barrel, flame, GW, GH};
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
  function get(stage, L){
    const k = NG.k || 1, key = `${stage}|${L}|${k}`; let c = CC.get(key); if (c) return c;
    if (CC.size > 16) CC.clear();
    const src = layer(stage, L); c = document.createElement("canvas"); c.width = Math.round(GWB*4*k); c.height = Math.round(GHB*4*k);
    const t = c.getContext("2d"); t.imageSmoothingEnabled = false; t.drawImage(src, 0, 0, c.width, c.height); c.w = GWB*4; CC.set(key, c); return c;
  }
  return {get, W: GWB*4};
})();

/* ---------- 직업 · 적 · 스테이지 ---------- */
const QCL = [
  {id: "kn", n: "검사",   e: "⚔️", c: "#4dabf7", hp: 130, spd: 4.3, dmg: [11, 11, 20], reach: 105, sp: "회오리 베기",
    art: {skin: "#ffd8b1", armor: "#1c7ed6", pants: "#364fc7", boots: "#5c3d2e", helm: "knight", weapon: "sword", shield: "#e03131", belt: "#fab005"}},
  {id: "ln", n: "창기사", e: "🔱", c: "#51cf66", hp: 120, spd: 4.0, dmg: [10, 10, 19], reach: 150, sp: "돌격 찌르기",
    art: {skin: "#ffd8b1", armor: "#2f9e44", pants: "#5c940d", boots: "#5c3d2e", helm: "lancer", weapon: "spear", belt: "#ffd43b", cape: "#e03131"}},
  {id: "ar", n: "궁수",   e: "🏹", c: "#fcc419", hp: 100, spd: 4.7, dmg: [9, 9, 9], reach: 0, sp: "화살비",
    art: {skin: "#ffd8b1", armor: "#e67700", pants: "#5c940d", boots: "#7f5539", helm: "hood", weapon: "bow", belt: "#5c3d2e"}},
  {id: "wz", n: "마법사", e: "🔮", c: "#cc5de8", hp: 95, spd: 4.0, dmg: [13, 13, 13], reach: 0, sp: "별똥별",
    art: {skin: "#ffd8b1", armor: "#7048e8", pants: "#5f3dc4", boots: "#3b2314", helm: "wizard", weapon: "staff", robe: 1, orb: "#ff8787", belt: "#ffd43b"}}
];
/* 적: hp · 빠르기 · 공격력 · 닿는 거리 · 점수 · 크기(px) */
const QEN = {
  gob:   {n: "고블린", hp: 30, spd: 2.3, dmg: 6,  reach: 70,  sc: 100, px: 3.3, wind: 22, art: {skin: "#94d82d", armor: "#8d6e63", pants: "#6d4c41", boots: "#4e342e", face: false, ears: 1, teeth: 1, weapon: "club", eye: "#e03131"}},
  gob2:  {n: "고블린 대장", hp: 55, spd: 2.5, dmg: 9, reach: 80, sc: 200, px: 3.6, wind: 20, art: {skin: "#82c91e", armor: "#495057", pants: "#343a40", boots: "#212529", face: false, ears: 1, teeth: 1, weapon: "rsword", helm: "horn", eye: "#ffd43b", shield: "#868e96"}},
  wolf:  {n: "늑대", hp: 26, spd: 4.6, dmg: 7, reach: 90, sc: 120, px: 3.4, wind: 18, quad: 1, art: {col: "#868e96", mane: "#495057"}},
  skel:  {n: "해골 병사", hp: 42, spd: 2.1, dmg: 9, reach: 80, sc: 150, px: 3.5, wind: 22, art: {skin: "#f1f3f5", armor: "#e9ecef", pants: "#dee2e6", boots: "#adb5bd", face: false, ribs: 1, weapon: "rsword", eye: "#111", shield: "#a0522d"}},
  skar:  {n: "해골 궁수", hp: 32, spd: 2.2, dmg: 8, reach: 0, sc: 180, px: 3.5, wind: 28, ranged: 1, art: {skin: "#f1f3f5", armor: "#e9ecef", pants: "#dee2e6", boots: "#adb5bd", face: false, ribs: 1, weapon: "bow", eye: "#c92a2a"}},
  igob:  {n: "얼음 고블린", hp: 36, spd: 2.4, dmg: 7, reach: 70, sc: 130, px: 3.3, wind: 22, art: {skin: "#a5d8ff", armor: "#4c6ef5", pants: "#364fc7", boots: "#1c2a6b", face: false, ears: 1, teeth: 1, weapon: "club", eye: "#1864ab"}},
  iwolf: {n: "눈늑대", hp: 30, spd: 4.8, dmg: 8, reach: 90, sc: 140, px: 3.4, wind: 18, quad: 1, art: {col: "#e7f5ff", mane: "#a5d8ff", eye: "#4dabf7"}},
  liz:   {n: "도마뱀 전사", hp: 60, spd: 2.6, dmg: 11, reach: 110, sc: 250, px: 3.7, wind: 20, art: {skin: "#e8590c", armor: "#862e9c", pants: "#5f3dc4", boots: "#3b2314", face: false, horns: 1, teeth: 1, weapon: "spear", eye: "#ffd43b"}},
  /* 보스 */
  orc:   {n: "오크 대장 쿵쾅", boss: 1, hp: 520, spd: 2.5, dmg: 15, reach: 150, sc: 3000, px: 5.4, wind: 26, art: {skin: "#5c940d", armor: "#5c3d2e", pants: "#3b2314", boots: "#212529", face: false, teeth: 1, ears: 1, horns: 1, weapon: "axe", eye: "#e03131", big: 1, belt: "#adb5bd"}},
  rider: {n: "불꽃 기마 장군", boss: 1, hp: 720, spd: 3, dmg: 16, reach: 180, sc: 4000, px: 4.6, wind: 24, rider: 1, art: {skin: "#ffc9c9", armor: "#c92a2a", pants: "#862e2e", boots: "#212529", face: false, helm: "bandana", plume: "#ffd43b", weapon: "spear", eye: "#111", belt: "#ffd43b"}, horse: {col: "#a0522d", mane: "#3b2314", saddle: "#c92a2a", horse: 1}},
  yeti:  {n: "얼음 거인 예티", boss: 1, hp: 820, spd: 2.4, dmg: 17, reach: 150, sc: 5000, px: 6.2, wind: 28, art: {skin: "#d0ebff", armor: "#e7f5ff", pants: "#c5d6f8", boots: "#4dabf7", face: false, teeth: 1, horns: 1, weapon: "club", eye: "#1971c2", big: 1, belt: "#74c0fc", ribs: 1}},
  drag:  {n: "붉은 용 화르륵", boss: 1, hp: 1150, spd: 2.2, dmg: 18, reach: 200, sc: 8000, px: 5.6, wind: 30, dragon: 1, art: {col: "#e03131"}}
};
const QST = [
  {n: "🌲 고블린 숲", len: 5800, boss: "orc",   bmin: ["gob", "gob", "wolf"],
   seg: [[300, ["gob", "gob", "gob"]], [1400, ["gob", "wolf", "gob", "wolf"]], [2600, ["gob", "gob", "gob2"], ["wolf", "wolf", "gob"]], [3800, ["gob2", "gob", "gob", "wolf"], ["gob", "gob", "wolf", "wolf"]]], props: [700, 1900, 3100, 4300]},
  {n: "🔥 불타는 요새", len: 6200, boss: "rider", bmin: ["skel", "skar"],
   seg: [[300, ["skel", "gob", "skel"]], [1400, ["skar", "skel", "gob2", "skel"]], [2600, ["skel", "skel", "skar"], ["gob2", "gob", "gob", "skar"]], [3900, ["skel", "skar", "skar", "skel"], ["gob2", "skel", "skel", "wolf"]]], props: [800, 2000, 3200, 4500]},
  {n: "❄️ 얼음 동굴", len: 6200, boss: "yeti",  bmin: ["igob", "iwolf"],
   seg: [[300, ["igob", "igob", "iwolf"]], [1400, ["iwolf", "iwolf", "igob", "skel"]], [2600, ["igob", "skar", "igob", "iwolf"], ["skel", "skel", "igob"]], [3900, ["iwolf", "iwolf", "igob", "igob"], ["skar", "skel", "igob", "iwolf"]]], props: [800, 2000, 3200, 4500]},
  {n: "🐉 용의 둥지", len: 6600, boss: "drag",  bmin: ["liz", "skar"],
   seg: [[300, ["liz", "gob2", "skel"]], [1500, ["liz", "skar", "liz", "wolf"]], [2700, ["liz", "liz", "skar"], ["gob2", "skel", "liz", "skar"]], [4000, ["liz", "liz", "skar", "skar"], ["liz", "gob2", "skel", "iwolf", "liz"]]], props: [800, 2100, 3300, 4700]}
];
const QDIR = [[0, 0], [0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]];
const qdDir = (dx, dy) => { for (let i = 0; i < 9; i++) if (QDIR[i][0] === dx && QDIR[i][1] === dy) return i; return 0; };
/* 버튼 누른 횟수를 숫자 하나에: 공격 · 점프 · 필살 (온라인으로 보낼 때) */
const qdPack = (a, j, s) => (a & 1023) | ((j & 1023) << 10) | ((s & 1023) << 20);
const qdUnpack = b => [b & 1023, (b >> 10) & 1023, (b >> 20) & 1023];

/* =====================================================================
   🛡️ 게임
   ===================================================================== */
NG.defs.qd = () => {
  const O = NG.opt || {}, SIDS = NG.sids.slice(), N = SIDS.length;
  const party = O.party || null, myIdx = party === "guest" ? O.idx : 0;
  const isBot = i => (O.bots || []).includes(i);
  const local = (O.local || [0]).slice();
  const W = 1280, H = 720, YT = 456, YB = 700, HP4 = 4;
  const HUM = SIDS.map((s, i) => i).filter(i => !isBot(i));
  const emult = .75 + .25*N, bmult = .55 + .45*N;
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
  function doSpark(x, y, z, c, n){ for (let i = 0; i < n; i++){ const a = rand()*6.28, s = 2 + rand()*6; addFx({k: "p", x, y, z, vx: Math.cos(a)*s, vz: Math.sin(a)*s + 3, t: 22, c}); } addFx({k: "star", x, y, z, t: 10, c}); }
  function num(x, y, z, txt, c){ ev("nm", x | 0, y | 0, z | 0, txt, c); addFx({k: "n", x, y, z, txt: String(txt), c, t: 40}); }
  function slash(x, y, z, f, big){ ev("sl", x | 0, y | 0, z | 0, f, big ? 1 : 0); addFx({k: "sl", x, y, z, f, big, t: 10}); }
  function boomFx(x, y, r = 80){ ev("bm", x | 0, y | 0, r); addFx({k: "bm", x, y, r, t: 26}); for (let i = 0; i < 14; i++){ const a = rand()*6.28, s = 3 + rand()*7; addFx({k: "p", x, y, z: 30, vx: Math.cos(a)*s, vz: Math.sin(a)*s + 5, t: 30, c: i % 2 ? "#ffd43b" : "#ff6b00"}); } }
  function quake(n){ shake = Math.max(shake, n); ev("q", n); }
  function say(t, s, k = 120){ banner = {t, s, k}; ev("b", t, s || "", k); }

  /* ---------- 시작 ---------- */
  function mkPlayer(i, cls){
    return {i, sid: SIDS[i], cls, x: 160 + i*70, y: YT + 50 + i*48, z: 0, vz: 0, f: 1, st: "idle", t: 0, hp: QCL[cls].hp, mp: 0, lives: 2, inv: 0,
      combo: 0, cT: 0, buf: 0, aid: 0, hits: new Set(), kx: 0, jx: 0, score: 0, ko: 0, ready: false, mv: 0, ai: {t: 0, at: 0}};
  }
  function init(){
    rs = (O.seed || Math.floor(Math.random()*1e9)) % 2147483646 + 1; uid = 1;
    P = SIDS.map((s, i) => mkPlayer(i, (O.cls && O.cls[i] != null) ? O.cls[i] : i % 4));
    E = []; PR = []; IT = []; PROPS = []; FX = []; NQ = []; team = 0; shake = 0; banner = null; flashT = 0; goT = 0; bossId = 0; results = null;
    IN = SIDS.map(() => ({d: 0, a: 0, j: 0, s: 0})); LAST = SIDS.map(() => ({a: 0, j: 0, s: 0}));
    keys = new Set(); ptr = new Map(); lastSnap = 0; ended = false;
    stage = O.stage || 0; camX = 0; phase = "sel"; pt = 60*20;
    P.forEach(p => { if (isBot(p.i)){ p.cls = Math.floor(rand()*4); p.ready = true; } });
  }
  function startStage(s){
    stage = s; camX = 0; lockX = null; segI = 0; waveQ = []; E = []; PR = []; IT = []; FX = []; bossId = 0; goT = 0; stageT = 0;
    const S = QST[s];
    PROPS = S.props.map((x, k) => ({id: uid++, k: k % 2 ? "chest" : "barrel", x: x + 300, y: YT + 40 + ((k*97) % 180), hp: 3}));
    P.forEach((p, i) => { if (p.st === "out" && s > 0){ p.st = "idle"; p.lives = 1; } if (p.st === "dead"){ p.st = "idle"; } if (p.st !== "out"){ Object.assign(p, {x: 120 + i*60, y: YT + 40 + i*50, z: 0, vz: 0, f: 1, st: "idle", t: 0, inv: 90, hp: QCL[p.cls].hp}); } });
    phase = "play"; say(`STAGE ${s + 1}`, S.n, 150); sfx("go");
  }

  /* ---------- 입력 ---------- */
  const KM = {
    one: {u: ["KeyW", "ArrowUp"], d: ["KeyS", "ArrowDown"], l: ["KeyA", "ArrowLeft"], r: ["KeyD", "ArrowRight"], a: ["KeyF", "KeyJ", "KeyZ", "Space"], j: ["KeyG", "KeyK", "KeyX"], s: ["KeyH", "KeyL", "KeyC"]},
    p1:  {u: ["KeyW"], d: ["KeyS"], l: ["KeyA"], r: ["KeyD"], a: ["KeyF"], j: ["KeyG"], s: ["KeyH"]},
    p2:  {u: ["ArrowUp"], d: ["ArrowDown"], l: ["ArrowLeft"], r: ["ArrowRight"], a: ["KeyJ", "Numpad1", "Comma"], j: ["KeyK", "Numpad2", "Period"], s: ["KeyL", "Numpad3", "Slash"]}
  };
  const maps = () => local.length >= 2 ? [KM.p1, KM.p2] : [KM.one];
  const has = arr => arr.some(k => keys.has(k));
  function localDir(slot){
    const m = maps()[slot]; let dx = (has(m.r) ? 1 : 0) - (has(m.l) ? 1 : 0), dy = (has(m.d) ? 1 : 0) - (has(m.u) ? 1 : 0);
    if (slot === 0) ptr.forEach(v => { if (v.t === "st" && (v.dx || v.dy)){ dx = v.dx; dy = v.dy; } });
    return qdDir(dx, dy);
  }
  function press(pi, b){ if (party === "guest"){ const u = qdUnpack(PARTY.input.b || 0); if (b === "a") u[0]++; else if (b === "j") u[1]++; else u[2]++; PARTY.input.b = qdPack(...u); } else IN[pi][b]++; }
  /* 화면 단추 (손가락) */
  /* 📱 가로가 길쭉한 화면(핸드폰)은 양옆 남는 자리에 단추를 두어 싸움터를 가리지 않아요 */
  const PADS0 = [{t: "st", x: 165, y: 575, r: 105}, {t: "a", x: 1150, y: 600, r: 76, e: "⚔️"}, {t: "j", x: 1012, y: 640, r: 56, e: "🦘"}, {t: "s", x: 1062, y: 488, r: 52, e: "✨"}];
  let PADS = PADS0, PX = 0;
  function layout(sw, sh){
    PX = Math.round(Math.max(0, Math.min(420, (H*sw/Math.max(1, sh) - W)/2)));
    if (PX < 150){ PX = 0; PADS = PADS0; return; }
    const r = Math.round(Math.min(124, PX*.46)), ra = Math.round(Math.min(92, PX*.36)), rj = Math.round(ra*.8), rs = Math.round(ra*.7), bx = W + PX/2;
    PADS = [{t: "st", x: -PX/2, y: H - r - 46, r}, {t: "a", x: bx, y: H - ra - 40, r: ra, e: "⚔️"}, {t: "j", x: bx, y: H - ra*2 - rj - 70, r: rj, e: "🦘"}, {t: "s", x: bx, y: H - ra*2 - rj*2 - rs - 100, r: rs, e: "✨"}];
  }
  const padAt = (x, y) => PADS.find(p => Math.hypot(x - p.x, y - p.y) < p.r*1.35) || (x < 0 || (!PX && x < W*.42 && y > H*.45) ? PADS[0] : null);
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
    if (e.st === "die" || e.inv > 0) return;
    const D = QEN[e.k], p = P[pi]; dmg = Math.round(dmg*(.9 + rand()*.2));
    const real = Math.min(dmg, Math.max(0, e.hp)); e.hp -= dmg; e.flash = 6; if (p){ p.mp = Math.min(100, p.mp + real*.9); p.score += real*3; }
    spark(e.x, e.y, (e.z || 0) + (D.boss ? 130 : 80), kd ? "#ffd43b" : "#fff", kd ? 12 : 7); num(e.x, e.y, (e.z || 0) + (D.boss ? 220 : 150), dmg, kd ? "#ffd43b" : "#fff");
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
    const inp = IN[p.i], L = LAST[p.i], pa = inp.a !== L.a, pj = inp.j !== L.j, ps = inp.s !== L.s; L.a = inp.a; L.j = inp.j; L.s = inp.s;
    if (p.st === "out") return;
    if (p.inv > 0) p.inv--;
    const C = QCL[p.cls], [dx, dy] = QDIR[inp.d || 0];
    // 공중
    if (p.z > 0 || p.vz){ p.vz -= .95; p.z += p.vz; if (p.st === "down" || p.st === "dead" || p.st === "hurt") p.x += p.kx;
      if (p.z <= 0){ p.z = 0; p.vz = 0; if (p.st === "jump" || p.st === "jatk"){ p.st = "idle"; p.t = 0; addFx({k: "dust", x: p.x, y: p.y, t: 14}); } } }
    if (p.cT > 0) p.cT--;
    p.mv = 0;
    switch (p.st){
      case "dead": p.t++; if (p.t > 150){ if (p.lives > 0){ p.lives--; Object.assign(p, {st: "jump", z: 420, vz: 0, x: camX + W*.4 + p.i*40, y: YT + 60 + p.i*40, hp: C.hp, inv: 150, t: 0, jx: 0}); say("", `${who(noOf_(p.sid))} 다시 출동!`, 80); }
        else { p.st = "out"; checkOver(); } } return;
      case "idle": case "walk":
        p.mp = Math.min(100, p.mp + .03);
        if (ps && p.mp >= 100){ special(p); break; }
        if (ps) num(p.x, p.y, 200, "✨ 기운이 모자라요", "#adb5bd");
        if (pa){ startAtk(p); break; }
        if (pj){ p.st = "jump"; p.vz = 16; p.z = 1; p.jx = dx*C.spd*1.1; p.t = 0; sfx("jump"); break; }
        if (dx || dy){ p.x += dx*C.spd; p.y += dy*C.spd*.62; if (dx) p.f = dx; p.st = "walk"; p.mv = 1; } else p.st = "idle";
        p.t++; break;
      case "jump": p.x += p.jx; p.y += dy*1.4; p.t++; if (pa){ p.st = "jatk"; p.t = 0; p.aid++; p.hits = new Set(); sfx("sw"); } break;
      case "jatk": p.x += p.jx; p.t++; if (p.t >= 3 && p.t <= 14){ if (C.reach) meleeHit(p, C.reach*.85, C.dmg[2]*.8, true, p.i); else if (p.t === 4) shoot(p, C.id === "ar" ? "arrow" : "orb", 0, true); } break;
      case "atk": {
        p.t++; if (pa && p.t > 3) p.buf = 1;
        if (p.t === 6){ const step = p.combo - 1, kd = p.combo === 3;
          if (C.reach){ meleeHit(p, C.reach, C.dmg[step], kd, p.i); slash(p.x + p.f*40, p.y, 90, p.f, kd); }
          else if (C.id === "ar"){ if (kd){ shoot(p, "arrow", -26); shoot(p, "arrow", 0); shoot(p, "arrow", 26); } else shoot(p, "arrow"); }
          else shoot(p, "orb", 0, kd); }
        if (p.t >= (p.combo === 3 ? 20 : 14)){ if (p.buf && p.combo < 3){ p.cT = 10; startAtk(p); } else { p.st = "idle"; p.t = 0; p.cT = p.combo < 3 ? 12 : 0; if (p.combo === 3) p.combo = 0; } }
        break; }
      case "spc": upSpecial(p); break;
      case "hurt": p.t++; p.x += p.kx; p.kx *= .8; if (p.t > 16){ p.st = "idle"; p.t = 0; } break;
      case "down": p.t++; if (p.z === 0) p.kx *= .8; if (p.t > 56){ p.st = "idle"; p.t = 0; p.inv = 70; } break;
    }
    // 먹을 것 줍기
    if (p.z < 10 && alive(p)) for (let k = IT.length - 1; k >= 0; k--){ const it = IT[k]; if (it.z < 10 && Math.abs(it.x - p.x) < 46 && Math.abs(it.y - p.y) < 30){ IT.splice(k, 1); pick(p, it); } }
    const lo = (lockX != null ? lockX : camX) + 30, hi = Math.min(QST[stage].len - 30, (lockX != null ? lockX : camX) + W - 30);
    p.x = clampN(p.x, Math.max(lo, camX + 30), hi); p.y = clampN(p.y, YT, YB);
  }
  function pick(p, it){
    const C = QCL[p.cls];
    if (it.k === "meat"){ p.hp = Math.min(C.hp, p.hp + 45); num(p.x, p.y, 200, "🍗 +45", "#ff8787"); sfx("item"); }
    else if (it.k === "cake"){ p.hp = C.hp; num(p.x, p.y, 200, "🎂 체력 가득!", "#ff8787"); sfx("item"); }
    else if (it.k === "potion"){ p.mp = 100; num(p.x, p.y, 200, "🧪 필살기 가득!", "#cc5de8"); sfx("item"); }
    else if (it.k === "gem"){ p.score += 500; num(p.x, p.y, 200, "💎 +500", "#74c0fc"); sfx("coin"); }
    else { p.score += 100; num(p.x, p.y, 200, "🪙 +100", "#ffd43b"); sfx("coin"); }
  }
  function hurtPlayer(p, dmg, f, kd){
    if (!alive(p) || p.inv > 0 || p.st === "down" || p.st === "spc") return false;
    p.hp -= dmg; p.inv = 12; spark(p.x, p.y, p.z + 90, "#ff6b6b", 8); num(p.x, p.y, p.z + 170, `-${dmg}`, "#ff6b6b"); sfx("ouch");
    if (p.hp <= 0){ p.hp = 0; p.st = "dead"; p.t = 0; p.vz = 9; p.z = Math.max(1, p.z); p.kx = f*5; quake(6); say("", `💫 ${who(noOf_(p.sid))} 쓰러졌어요!`, 70); return true; }
    if (kd){ p.st = "down"; p.t = 0; p.vz = 8; p.z = Math.max(1, p.z); p.kx = f*6; quake(4); }
    else { p.st = "hurt"; p.t = 0; p.kx = f*3; }
    return true;
  }
  function checkOver(){ if (!P.some(p => p.st !== "out")) finish(false); }

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
      if (p.mp >= 100 && L.filter(e => Math.abs(e.x - p.x) < 300).length >= 2 && (p.st === "idle" || p.st === "walk")) inp.s++; }
  }

  /* ---------- 적 ---------- */
  function spawn(k, side, x){
    const D = QEN[k], e = {id: uid++, k, x: x != null ? x : side < 0 ? camX - 90 : camX + W + 90, y: YT + 20 + rand()*(YB - YT - 40), z: 0, vz: 0, f: side < 0 ? 1 : -1, st: "walk", t: 0,
      hp: Math.round(D.hp*(D.boss ? bmult : emult)), cd: 40 + rand()*60, yo: rr(-14, 14), kx: 0, flash: 0, inv: 0, ag: 0, tg: -1, ph: 0, sk: 220 + rand()*120};
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
      if (e.t > wind + 22){ e.st = "walk"; e.t = 0; e.cd = (D.boss ? 40 : 55) + rand()*(D.boss ? 50 : 70); }
      return;
    }
    // 다가가기 (한 친구에게 한꺼번에 몰리지 않게 2마리까지만 바짝)
    if (e.t % 50 === 1){ const n = E.filter(o => o !== e && o.ag && o.tg === tg.i && o.st !== "die").length; e.ag = D.boss || n < 2 || D.ranged ? 1 : 0; }
    if (e.cd > 0) e.cd--;
    const side = e.x < tg.x ? -1 : 1, want = D.ranged ? 380 : e.ag ? D.reach*.72 : 250 + (e.id % 3)*40;
    const tx = tg.x + side*want, ty = tg.y + (e.ag ? e.yo*.4 : e.yo*3);
    const ddx = tx - e.x, ddy = ty - e.y, sp = D.spd*(e.ag ? 1 : .7);
    if (Math.abs(ddx) > 6) e.x += clampN(ddx, -sp, sp); if (Math.abs(ddy) > 4) e.y += clampN(ddy, -sp*.6, sp*.6);
    e.y = clampN(e.y, YT, YB);
    e.st = Math.abs(ddx) > 6 || Math.abs(ddy) > 4 ? "walk" : "idle";
    e.f = tg.x > e.x ? 1 : -1;
    if (e.ag && e.cd <= 0 && Math.abs(ddx) < (D.ranged ? 160 : 24) && Math.abs(tg.y - e.y) < (D.ranged ? 22 : 18)){ e.st = "atk"; e.t = 0; }
  }
  /* 보스: 특별 기술 */
  function bossAI(e, D){
    e.sk--;
    const tg = target(e); if (!tg) return false;
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
    if (!e.ph && e.hp < e.mhp*.55){ e.ph = 1; sfx("roar"); say("", `${D.n}: 얘들아 나와라!`, 90); QST[stage].bmin.forEach((k, i) => spawn(k, i % 2 ? 1 : -1)); if (N > 2) spawn(QST[stage].bmin[0], 1); return false; }
    if (e.sk > 0) return false;
    if (e.k === "orc"){ e.st = "bjump"; e.t = 0; e.vz = 17; e.z = 1; e.jx = tg.x; e.jy = tg.y; sfx("roar"); return true; }
    if (e.k === "rider"){ e.st = "chg0"; e.t = 0; e.cx = e.x < camX + W/2 ? camX + 90 : camX + W - 90; return true; }
    if (e.k === "yeti"){ if (rand() < .5){ e.st = "throw"; e.t = 0; e.f = tg.x > e.x ? 1 : -1; } else { e.st = "bjump"; e.t = 0; e.vz = 15; e.z = 1; e.jx = tg.x; e.jy = tg.y; sfx("roar"); } return true; }
    if (e.k === "drag"){ e.f = tg.x > e.x ? 1 : -1; e.st = "fire"; e.t = 0; sfx("roar"); return true; }
    return false;
  }
  function bossLand(e){ e.st = "walk"; e.t = 0; e.sk = 200 + rand()*120; e.cd = 30; quake(12); sfx("boom"); boomFx(e.x, e.y, 170);
    P.forEach(p => { if (alive(p) && Math.abs(p.x - e.x) < 190 && Math.abs(p.y - e.y) < 80 && p.z < 40) hurtPlayer(p, 14, p.x > e.x ? 1 : -1, true); }); }
  function bossDown(e){
    quake(16); sfx("boom"); boomFx(e.x, e.y, 200); E.forEach(o => { if (o !== e && o.st !== "die"){ o.st = "die"; o.t = 0; o.vz = 7; o.kx = 0; } });
    phase = "clear"; pt = 60*6; flashT = 30; flashC = "#fff"; ev("fl", 30, "#fff");
    P.forEach(p => { if (alive(p)) p.score += 1000; });
    say("STAGE CLEAR!", stage < QST.length - 1 ? "다음 스테이지로!" : "모든 스테이지를 깼어요!", 300); sfx("clear");
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
        for (const e of E){ if (e.st === "die" || q.hit.has(e.id)) continue; const D = QEN[e.k], rb = D.boss ? 50 : 0;
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
      else if (segI >= S.seg.length && camX >= S.len - W - 1 && !bossId){ lockX = S.len - W; camX = lockX; bossCome(); }
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
    if (party === "host") PARTY.sendAll({t: "end", w: win ? 1 : 0, wins: results});
    setTimeout(() => QDM.result(results, O), win ? 1600 : 1400);
  }

  /* ---------- 한 장면 ---------- */
  function step(){
    if (party === "guest"){ guestStep(); return; }
    // 입력 모으기
    local.forEach((pi, s) => { IN[pi].d = localDir(s); });
    if (party === "host"){ const R = SIDS.map(() => ({d: 0, b: 0})); PARTY.readInputs(R); R.forEach((r, i) => { if ((O.remote || {})[i] != null){ const u = qdUnpack(r.b); IN[i].d = r.d; IN[i].a = u[0]; IN[i].j = u[1]; IN[i].s = u[2]; } }); }
    P.forEach(p => { if (isBot(p.i)) botThink(p); });
    if (shake > 0) shake *= .86; if (flashT > 0) flashT--; if (banner && --banner.k <= 0) banner = null; if (goT > 0) goT--;
    if (phase === "sel"){
      pt--;
      P.forEach(p => { const inp = IN[p.i], L = LAST[p.i];
        if (!p.ready){ const [dx] = QDIR[inp.d || 0]; if (dx && dx !== L.dx){ p.cls = (p.cls + dx + 4) % 4; sfx("sel"); } L.dx = dx;
          if (inp.a !== L.a || inp.j !== L.j){ p.ready = true; sfx("ready"); } }
        L.a = inp.a; L.j = inp.j; L.s = inp.s; });
      if (pt <= 0 || P.every(p => p.ready)){ P.forEach(p => { p.ready = true; p.hp = QCL[p.cls].hp; }); startStage(stage); }
    } else if (phase === "play"){
      stageT++; team = P.reduce((a, p) => a + p.score, 0);
      P.forEach(upPlayer); E.forEach(upEnemy); E = E.filter(e => !e.gone); upShots(); upCamera(); upWaves();
    } else if (phase === "clear"){
      pt--; P.forEach(p => { if (alive(p)){ IN[p.i].d = 4; upPlayer(p); } }); upShots(); E.forEach(upEnemy); E = E.filter(e => !e.gone);
      if (pt <= 0){ if (stage < QST.length - 1) startStage(stage + 1); else finish(true); }
    }
    upFx();
    if (party === "host"){ const now = performance.now(); if (now - lastSnap > 32){ lastSnap = now; PARTY.sendSnap(snap(), NQ.splice(0), 0); } }
  }
  function upFx(){
    for (let k = FX.length - 1; k >= 0; k--){ const f = FX[k];
      if (f.k === "p"){ f.x += f.vx; f.z += f.vz; f.vz -= .5; if (f.z < 0){ f.z = 0; f.vz *= -.4; f.vx *= .7; } }
      else if (f.k === "n") f.z += 1.2;
      if (--f.t <= 0) FX.splice(k, 1); }
  }

  /* ---------- 🌐 주고받기 ---------- */
  const r1 = v => Math.round(v);
  function snap(){
    return {g: [phase, stage, r1(camX), pt, r1(team), bossId, goT, lockX != null ? 1 : 0, flashT],
      p: P.map(p => [r1(p.x), r1(p.y), r1(p.z), p.f, p.st, p.t, Math.ceil(p.hp), p.mp | 0, p.lives, p.cls, p.inv > 0 ? 1 : 0, r1(p.score), p.ready ? 1 : 0, p.mv, p.combo]),
      e: E.map(e => [e.id, e.k, r1(e.x), r1(e.y), r1(e.z), e.f, e.st, e.t, Math.max(0, Math.ceil(e.hp)), e.mhp, e.flash]),
      q: PR.map(q => [q.id, q.k, r1(q.x), r1(q.y), r1(q.z), q.f, q.big ? 1 : 0]),
      i: IT.map(t => [t.id, t.k, r1(t.x), r1(t.y), r1(t.z)]),
      b: PROPS.map(b => [b.id, b.k, r1(b.x), r1(b.y), b.hp])};
  }
  let SN = null;
  function apply(d){
    if (d.ev){ d.ev.forEach(a => { const k = a[0];
      if (k === "s") playS(a[1]); else if (k === "sp") doSpark(a[1], a[2], a[3], a[4], a[5]); else if (k === "nm") addFx({k: "n", x: a[1], y: a[2], z: a[3], txt: String(a[4]), c: a[5], t: 40});
      else if (k === "sl") addFx({k: "sl", x: a[1], y: a[2], z: a[3], f: a[4], big: a[5], t: 10}); else if (k === "bm") boomFx(a[1], a[2], a[3]);
      else if (k === "q") shake = Math.max(shake, a[1]); else if (k === "b") banner = {t: a[1], s: a[2], k: a[3]}; else if (k === "fl"){ flashT = a[1]; flashC = a[2]; }
      else if (k === "pb"){ const b = PROPS.find(x => x.id === a[1]); if (b) for (let i = 0; i < 8; i++) addFx({k: "p", x: b.x, y: b.y, z: 30, vx: rr(-5, 5), vz: rr(3, 9), t: 30, c: "#9c6644"}); } }); }
    if (!d.s) return;
    const s = d.s; SN = s;
    [phase, stage, , pt, team, bossId, goT, , ] = s.g; lockX = s.g[7] ? s.g[2] : null;
    if (Math.abs(camX - s.g[2]) > 300) camX = s.g[2];
    camX += 0; P.forEach((p, i) => { const a = s.p[i]; if (!a) return; p.tx = a[0]; p.ty = a[1]; p.tz = a[2]; if (Math.abs(p.x - a[0]) > 200) { p.x = a[0]; p.y = a[1]; }
      p.f = a[3]; p.st = a[4]; p.t = a[5]; p.hp = a[6]; p.mp = a[7]; p.lives = a[8]; p.cls = a[9]; p.inv = a[10]; p.score = a[11]; p.ready = !!a[12]; p.mv = a[13]; p.combo = a[14]; });
    const old = new Map(E.map(e => [e.id, e]));
    E = s.e.map(a => { const e = old.get(a[0]) || {id: a[0], x: a[2], y: a[3], z: a[4]}; Object.assign(e, {k: a[1], tx: a[2], ty: a[3], tz: a[4], f: a[5], st: a[6], t: a[7], hp: a[8], mhp: a[9], flash: a[10]}); return e; });
    const oq = new Map(PR.map(q => [q.id, q]));
    PR = s.q.map(a => { const q = oq.get(a[0]) || {id: a[0], x: a[2], y: a[3], z: a[4]}; Object.assign(q, {k: a[1], tx: a[2], ty: a[3], tz: a[4], f: a[5], big: a[6]}); return q; });
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
    P.forEach(lerp); E.forEach(lerp); PR.forEach(lerp);
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
  function drawHero(g, p, sx, sy){
    const pose = (p.st === "dead" || p.st === "down") ? "lie" : poseOf(p), px = HP4, art = heroArt(p.cls), blink = p.inv > 0 && p.st !== "spc" && (NG.frame >> 2) % 2;
    if (blink) g.globalAlpha = .45;
    if (pose === "lie"){ const c = QD.spr(`hl${p.cls}`, 52, 46, px, t => QD.lying(t, art)); blit(g, c, sx, sy - p.z, 26*px, 45*px, p.f);
      faceAt(g, p.sid, sx - p.f*42, sy - p.z - 80, 19, QCL[p.cls].c, p.st === "dead"); g.globalAlpha = 1; return; }
    const back = QD.spr(`hb${p.cls}${pose}`, QD.GW, QD.GH, px, t => QD.human(t, Object.assign({pose, part: "back"}, art)));
    const over = QD.spr(`ho${p.cls}${pose}`, QD.GW, QD.GH, px, t => QD.human(t, Object.assign({pose, part: "over"}, art)));
    blit(g, back, sx, sy - p.z, 20*px, 45*px, p.f);
    const walk = pose.startsWith("walk") ? +pose[4] : -1, bob = pose === "idle1" ? 1 : walk === 1 || walk === 3 ? -1 : 0, lean = pose === "hurt" ? -2 : pose === "atk1" ? 1 : 0;
    faceAt(g, p.sid, sx + (1 + lean)*px*p.f, sy - p.z - (45 - (13 + bob))*px, 23, QCL[p.cls].c);
    blit(g, over, sx, sy - p.z, 20*px, 45*px, p.f);
    g.globalAlpha = 1;
  }
  function drawEnemy(g, e){
    const D = QEN[e.k], fl = e.flash > 0 && (e.flash % 2 === 0) ? 1 : 0, dying = e.st === "die";
    if (dying && (e.t >> 2) % 2) return;
    let pose = (e.st === "down" || dying) ? "lie" : poseOf(e, true);
    const sx = e.x, sy = e.y - e.z;
    if (D.dragon){ const fr = (NG.frame >> 3) % 2, c = QD.spr(`dr${pose}${fr}${fl}`, 76, 66, D.px, (t, w, h) => { QD.dragon(t, {pose, f: fr, col: D.art.col}); if (fl) whiten(t, w, h); }); blit(g, c, sx, sy, 38*D.px, 63*D.px, e.f); return; }
    if (D.rider){ const c = QD.spr(`rd${pose}${fl}`, 64, 62, D.px, (t, w, h) => { QD.quad(t, Object.assign({pose: pose === "lie" ? "idle0" : pose.startsWith("walk") ? pose : "walk1"}, D.horse)); t.save(); t.translate(2, -18); QD.human(t, Object.assign({pose: pose === "lie" ? "hurt" : pose.startsWith("walk") ? "idle0" : pose}, D.art)); t.restore(); if (fl) whiten(t, w, h); });
      if (pose === "lie"){ g.save(); g.globalAlpha = .9; } blit(g, c, sx, sy, 32*D.px, 58*D.px, e.f); if (pose === "lie") g.restore(); return; }
    if (D.quad){ const c = QD.spr(`q${e.k}${pose}${fl}`, 48, 54, D.px, (t, w, h) => { QD.quad(t, Object.assign({pose: pose === "lie" ? "idle0" : pose}, D.art)); if (fl) whiten(t, w, h); });
      if (pose === "lie"){ g.save(); g.translate(sx, sy); g.scale(1, -.6); g.translate(-sx, -sy); blit(g, c, sx, sy, 24*D.px, 51*D.px, e.f); g.restore(); return; }
      blit(g, c, sx, sy, 24*D.px, 51*D.px, e.f); return; }
    if (pose === "lie"){ const c = QD.spr(`el${e.k}${fl}`, 52, 46, D.px, (t, w, h) => { QD.lying(t, D.art); if (fl) whiten(t, w, h); }); blit(g, c, sx, sy, 26*D.px, 45*D.px, e.f); return; }
    const c = QD.spr(`e${e.k}${pose}${fl}`, QD.GW, QD.GH, D.px, (t, w, h) => { QD.human(t, Object.assign({pose}, D.art)); if (fl) whiten(t, w, h); });
    blit(g, c, sx, sy, 20*D.px, 45*D.px, e.f);
  }
  function drawShot(g, q){
    const x = q.x, y = q.y - q.z;
    if (q.k === "arrow" || q.k === "earrow" || q.k === "rain"){ const c = QD.spr(`ar${q.k}`, 22, 7, 3, t => { QD.line(t, 1, 3, 17, 3, q.k === "earrow" ? "#868e96" : "#a0522d", 1); QD.R(t, 17, 2, 4, 3, "#dee2e6"); QD.R(t, 0, 1, 3, 2, q.k === "earrow" ? "#495057" : "#fa5252"); QD.R(t, 0, 4, 3, 2, q.k === "earrow" ? "#495057" : "#fa5252"); });
      if (q.k === "rain"){ g.save(); g.translate(x, y); g.rotate(Math.PI/2); g.drawImage(c, -33, -10, c.w, c.h); g.restore(); } else blit(g, c, x, y, 33, 10, q.f); return; }
    if (q.k === "orb"){ const r = q.big ? 22 : 15, c = QD.spr(`orb${q.big ? 1 : 0}`, 14, 14, r/7*2, t => { QD.disc(t, 7, 7, 6, "#cc5de8"); QD.disc(t, 7, 7, 4, "#f3d9fa"); QD.R(t, 5, 4, 2, 2, "#fff"); }); g.drawImage(c, x - c.w/2, y - c.h/2, c.w, c.h);
      if (NG.frame % 3 === 0) addFx({k: "p", x: q.x - q.f*14, y: q.y, z: q.z, vx: -q.f, vz: rr(-1, 1), t: 12, c: "#e599f7"}); return; }
    if (q.k === "met"){ const c = QD.spr("met", 18, 18, 5, t => { QD.disc(t, 9, 9, 7, "#ff6b00"); QD.disc(t, 9, 9, 5, "#ffd43b"); QD.disc(t, 8, 8, 2, "#fff"); }); g.drawImage(c, x - c.w/2, y - c.h/2, c.w, c.h);
      if (NG.frame % 2 === 0) addFx({k: "p", x: q.x - 6, y: q.y, z: q.z + 20, vx: rr(-2, 0), vz: 2, t: 16, c: "#ff922b"}); return; }
    if (q.k === "fire"){ const c = QD.spr(`fb${(NG.frame >> 2) % 3}`, 16, 21, 4, t => QD.flame(t, (NG.frame >> 2) % 3)); g.drawImage(c, x - c.w/2, y - c.h*.6, c.w, c.h); return; }
    if (q.k === "snow"){ const c = QD.spr("snow", 14, 14, 5, t => { QD.disc(t, 7, 7, 6, "#e7f5ff"); QD.R(t, 4, 4, 3, 2, "#fff"); }); g.drawImage(c, x - c.w/2, y - c.h/2, c.w, c.h); }
  }
  function bar(g, x, y, w, h, v, c, bg = "#1b1230"){ g.fillStyle = bg; g.fillRect(x - 2, y - 2, w + 4, h + 4); g.fillStyle = "#495057"; g.fillRect(x, y, w, h); g.fillStyle = c; g.fillRect(x, y, Math.max(0, Math.min(1, v))*w, h); g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(x, y, Math.max(0, Math.min(1, v))*w, Math.max(1, h*.3)); }
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
    [[0, .15], [1, .45], [2, 1]].forEach(([L, k]) => { const c = QDBG.get(stage, L), w = QDBG.W, o = -((camX*k) % w); g.drawImage(c, Math.floor(o), 0, w, H); g.drawImage(c, Math.floor(o) + w, 0, w, H); });
    // 뒤쪽 불꽃 (불타는 요새 · 용의 둥지)
    if (stage === 1 || stage === 3){ for (let wx = Math.floor(camX*.45/260)*260 - 260; wx < camX*.45 + W + 260; wx += 260){ const fr = ((NG.frame >> 3) + (wx/260 | 0)) % 3, sx = wx - camX*.45 + ((wx*7) % 120), c = QD.spr(`fl${fr}`, 16, 21, 4, t => QD.flame(t, fr)); g.drawImage(c, Math.round(sx), (stage === 1 ? 318 : 330) + ((wx*13) % 36), c.w, c.h); } }
    if (phase === "sel"){ g.restore(); drawSel(g); drawFx(g, true); drawHud(g); return; }
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
      else if (k === 3){ shadow(g, sx, o.y, 46); drawHero(g, o, sx, o.y); if (alive(o)){ const tag = `${o.i + 1}P`; outlined(g, tag, sx, o.y - o.z - 205, 20, QCL[o.cls].c); } }
      else drawShot(g, Object.assign({}, o, {x: sx}));
    });
    drawFx(g);
    // 앞쪽 불길 (사진처럼 화면 아래에서 일렁여요)
    if (stage === 1){ const sp = 330, cx = camX*1.2; g.globalAlpha = .9; for (let wx = Math.floor(cx/sp)*sp - sp; wx < cx + W + sp; wx += sp){ const k = (wx/sp | 0), fr = ((NG.frame >> 2) + k) % 3, sx = wx - cx + (k % 2 ? 90 : 0), c = QD.spr(`ff${fr}`, 16, 21, 5, t => QD.flame(t, fr)); g.drawImage(c, Math.round(sx), H - 78, c.w, c.h); } g.globalAlpha = 1; }
    if (stage === 2 && NG.frame % 3 === 0) addFx({k: "snowf", x: camX + rand()*W, y: 0, t: 200, vx: rr(-.6, .2)});
    g.restore();
    if (flashT > 0){ g.globalAlpha = Math.min(.55, flashT/30); g.fillStyle = flashC || "#fff"; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
    drawHud(g);
  }
  function drawFx(g, sel){
    FX.forEach(f => { const sx = f.x - camX;
      if (f.k === "p"){ g.fillStyle = f.c; g.fillRect(Math.round(sx), Math.round(f.y - f.z), 6, 6); }
      else if (f.k === "star"){ const r = (10 - f.t)*6 + 10; g.strokeStyle = f.c; g.lineWidth = 5; g.beginPath(); for (let i = 0; i < 8; i++){ const a = i*Math.PI/4; g.moveTo(sx + Math.cos(a)*r*.3, f.y - f.z + Math.sin(a)*r*.3); g.lineTo(sx + Math.cos(a)*r, f.y - f.z + Math.sin(a)*r); } g.stroke(); }
      else if (f.k === "n"){ g.globalAlpha = Math.min(1, f.t/15); outlined(g, f.txt, sx, f.y - f.z, typeof f.txt === "string" && f.txt.length > 4 ? 26 : 32, f.c); g.globalAlpha = 1; }
      else if (f.k === "sl"){ const k = 1 - f.t/10, R0 = f.big ? 110 : 80; g.strokeStyle = `rgba(255,255,255,${.9*(1 - k)})`; g.lineWidth = f.big ? 14 : 9; g.beginPath(); const a0 = f.f > 0 ? -1.6 : Math.PI + 1.6, a1 = f.f > 0 ? .9 : Math.PI - .9;
        g.arc(sx, f.y - f.z, R0 + k*20, Math.min(a0, a1), Math.max(a0, a1)); g.stroke(); g.strokeStyle = `rgba(255,224,102,${.8*(1 - k)})`; g.lineWidth = 4; g.beginPath(); g.arc(sx, f.y - f.z, R0 + k*20 - 10, Math.min(a0, a1), Math.max(a0, a1)); g.stroke(); }
      else if (f.k === "bm"){ const k = 1 - f.t/26; g.globalAlpha = 1 - k; g.fillStyle = "#ffd43b"; g.beginPath(); g.ellipse(sx, f.y - 40, f.r*(.4 + k), f.r*(.4 + k)*.5, 0, 0, 7); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.ellipse(sx, f.y - 40, f.r*(.25 + k*.6), f.r*(.25 + k*.6)*.45, 0, 0, 7); g.fill(); g.globalAlpha = 1; }
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
      const back = QD.spr(`hb${ci}${pose}`, QD.GW, QD.GH, 4, t => QD.human(t, Object.assign({pose, part: "back"}, C.art))), over = QD.spr(`ho${ci}${pose}`, QD.GW, QD.GH, 4, t => QD.human(t, Object.assign({pose, part: "over"}, C.art)));
      g.drawImage(back, x - 80, y - 180 + 60, back.w, back.h); g.drawImage(over, x - 80, y - 180 + 60, over.w, over.h);
      outlined(g, `${C.e} ${C.n}`, x, 280, 30, C.c); outlined(g, `✨ ${C.sp}`, x, 590, 19, "#fff");
      const here = P.filter(p => p.cls === ci);
      here.forEach((p, k) => { const fx = x - (here.length - 1)*28 + k*56; faceAt(g, p.sid, fx, 625 + 28, 24, p.ready ? "#69db7c" : "#fff"); if (p.ready) outlined(g, "✔", fx + 18, 625 + 10, 22, "#69db7c"); }); });
  }
  function drawHud(g){
    const n = P.length, pw = Math.min(310, (W - 20)/n);
    P.forEach((p, i) => { const x = 10 + i*pw, y = 8, C = QCL[p.cls], me = party ? i === myIdx : local.includes(i);
      g.fillStyle = me ? "rgba(255,224,102,.22)" : "rgba(15,10,40,.55)"; rrect(g, x, y, pw - 8, 84, 14); g.fill();
      faceAt(g, p.sid, x + 38, y + 42, 28, C.c, p.st === "out" || p.st === "dead");
      outlined(g, `${i + 1}P ${C.e} ${nameOf(noOf_(p.sid)) || "선생님"}${isBot(i) ? " 🤖" : ""}`, x + 74, y + 18, 19, me ? "#ffe066" : "#fff", undefined, "left");
      bar(g, x + 74, y + 34, pw - 96, 14, p.hp/C.hp, p.hp/C.hp > .35 ? "#51cf66" : "#ff6b6b");
      bar(g, x + 74, y + 54, pw - 96, 8, p.mp/100, p.mp >= 100 ? ((NG.frame >> 3) % 2 ? "#ffd43b" : "#74c0fc") : "#4dabf7");
      outlined(g, p.st === "out" ? "💤 쉬는 중" : `${"❤️".repeat(Math.max(0, p.lives))} ${Math.round(p.score)}점`, x + 74, y + 74, 15, "#fff", undefined, "left");
      if (p.mp >= 100 && alive(p)) outlined(g, "✨OK", x + pw - 40, y + 56, 15, "#ffd43b"); });
    if (phase !== "sel"){
      outlined(g, `${QST[stage].n}  ·  팀 ${Math.round(team)}점`, W/2, 112, 20, "#fff");
      const b = bossId && E.find(e => e.id === bossId);
      if (b && b.st !== "die"){ const D = QEN[b.k]; g.fillStyle = "rgba(15,10,40,.6)"; rrect(g, 150, H - 54, W - 300, 44, 12); g.fill(); outlined(g, `👑 ${D.n}`, 170, H - 32, 22, "#ffd43b", undefined, "left"); bar(g, 420, H - 42, W - 590, 20, b.hp/b.mhp, "#fa5252"); }
      if (goT > 0 && (goT >> 4) % 2) outlined(g, "GO ▶▶", W - 140, 330, 60, "#ffe066");
    }
    if (banner){ const a = Math.min(1, banner.k/20); g.globalAlpha = a; if (banner.t) outlined(g, banner.t, W/2, 290, 78, "#ffe066"); if (banner.s) outlined(g, banner.s, W/2, banner.t ? 360 : 300, 34, "#fff"); g.globalAlpha = 1; }
  }
  function drawPads(g){
    // 손가락 단추
    if (!NG.ended && (party !== "guest" || true) && ("ontouchstart" in window || navigator.maxTouchPoints > 0)){
      PADS.forEach(pd => { let on = false, sv = null; ptr.forEach(v => { if (v.t === pd.t){ on = true; sv = v; } });
        const cx = sv && sv.cx != null ? sv.cx : pd.x, cy = sv && sv.cx != null ? sv.cy : pd.y;
        g.globalAlpha = PX ? (on ? .85 : .6) : on ? .55 : .3; g.fillStyle = pd.t === "st" ? "#fff" : pd.t === "a" ? "#ff6b6b" : pd.t === "j" ? "#4dabf7" : "#cc5de8"; g.beginPath(); g.arc(cx, cy, pd.r, 0, 7); g.fill(); g.globalAlpha = 1;
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
        ["a", "j", "s"].forEach(b => { if (m[b].includes(code)){ used = true; if (d && !(e && e.repeat)) press(local[s] != null ? local[s] : local[0], b); } }); });
      if (used){ d ? keys.add(code) : keys.delete(code); }
      return used;
    },
    hud(){ return `🛡️ 용사 대모험 · ${phase === "sel" ? "용사 고르기" : QST[stage].n} · 팀 ${Math.round(team)}점${party ? " · 🌐 온라인" : ""}`; },
    apply, dropIdx(i){ if (!(O.bots = O.bots || []).includes(i)) O.bots.push(i); },
    end(w, res){ if (ended) return; ended = true; results = res; QDM.result(res, O); },
    /* 시험용 */
    dbg(){ return {P, E, PR, IT, PROPS, phase, stage, camX, team, lockX, segI, bossId}; },
    cheat(o){ if (o.stage != null){ P.forEach(p => p.ready = true); startStage(o.stage); } if (o.cam != null){ P.forEach((p, i) => p.x = o.cam + 300 + i*60); camX = o.cam; E = []; pend = []; lockX = null; segI = QST[stage].seg.filter(sg => sg[0] <= o.cam).length; } if (o.god) P.forEach(p => p.inv = 1e9); if (o.mp) P.forEach(p => p.mp = 100); if (o.kill) E.forEach(e => { if (e.st !== "die") hitEnemy(e, 99999, 1, true, 0); }); if (o.hurt) P.forEach(p => { p.hp = 1; p.inv = 0; }); }
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
const QDM = {
  bots: 1,
  menu(){
    const me = ARC.me, box = partyModal("qd");
    const botRow = (id, max) => `<div class="wb-row"><span>🤖 컴퓨터 동료</span><div class="arc-seg" id="${id}">${Array.from({length: max + 1}, (_, n) => `<button data-v="${n}" class="${n === Math.min(max, this.bots) ? "on" : ""}">${n}명</button>`).join("")}</div></div>`;
    $("#wbBody").innerHTML = `<div class="qd-intro"><div class="qd-cls">${QCL.map(c => `<span style="--c:${c.c}">${c.e}<b>${c.n}</b><small>✨ ${c.sp}</small></span>`).join("")}</div>
        <p class="arc-small">최대 <b>4명</b>이 힘을 합쳐 <b>4개의 스테이지</b>(🌲 고블린 숲 · 🔥 불타는 요새 · ❄️ 얼음 동굴 · 🐉 용의 둥지)를 깨요. 스테이지 끝에는 무시무시한 <b>보스</b>가 기다려요!
        <br>⌨️ 이동 <b>WASD</b>·방향키 · ⚔️ 공격 <b>F·J</b> · 🦘 점프 <b>G·K</b> · ✨ 필살기 <b>H·L</b> (파란 기운이 가득 차면) · 📱 화면 단추도 돼요</p></div>
      <div class="wb-sec"><h3>🧒 나 혼자 <small>🤖 동료와 함께 · 내 점수가 랭킹에 올라가요</small></h3>${botRow("qdB1", 3)}<button class="arc-btn p" id="qdSolo">▶ 출발!</button></div>
      <div class="wb-sec"><h3>👫 이 기기에서 둘이 <small>1P WASD+F·G·H · 2P 방향키+J·K·L</small></h3>${botRow("qdB2", 2)}<button class="arc-btn p" id="qdTwo">🧒 친구 들어오기</button></div>
      <div class="wb-sec"><h3>🌐 온라인 방 <small>각자 기기로 최대 4명 · ☁️ Firebase 반에서만</small></h3><div id="wbRooms"></div></div>`;
    const seg = id => { const s = $("#" + id); if (s) s.onclick = e => { const b = e.target.closest("button"); if (!b) return; s.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); this.bots = +b.dataset.v; }; };
    ["qdB1", "qdB2"].forEach(seg);
    const nb = id => { const b = $(`#${id} .on`); return b ? +b.dataset.v : 0; };
    $("#qdSolo").onclick = () => { box.hidden = true; this.start([me], nb("qdB1")); };
    $("#qdTwo").onclick = () => { const n = nb("qdB2"); box.hidden = true; ARC.pickRival("qd", opp => this.start([me, opp], n)); };
    PARTY.renderRooms();
    box.hidden = false;
  },
  start(humans, nBots){
    nBots = Math.max(0, Math.min(4 - humans.length, nBots));
    const bots = WB.pickBots(humans, nBots), sids = humans.concat(bots).map(sidOf);
    ARC.game = "qd"; ARC.enter && ARC.enter(); ARC.prep(); getAC();
    NG.play("qd", sids, {local: humans.map((_, i) => i), bots: bots.map((_, i) => humans.length + i)});
  },
  /* 결과: 사람 친구마다 자기 점수가 랭킹에 (방장 기기가 올려요) */
  result(R, o){
    if (!R) return;
    let saved = {};
    const mine = o.party === "guest" ? [o.idx] : o.party === "host" ? [0] : (o.local || [0]);
    R.res.forEach(x => { if (mine.includes(x.i)) try { saved[x.i] = qdSave(x.sid, x.sc); } catch(e){ console.error(e); } });
    (R.win ? SFX.rec : SFX.over)();
    const rows = R.res.concat(R.bots || []).sort((a, b) => b.sc - a.sc).map((x, k) => { const s = saved[x.i], bot = (R.bots || []).some(b => b.i === x.i);
      return `<div class="qd-r${o.party === "guest" ? (x.i === o.idx ? " me" : "") : (o.local || [0]).includes(x.i) ? " me" : ""}"><span class="rk">${["🥇","🥈","🥉","4"][k] || k + 1}</span><span class="avf">${avHTMLof(x.sid, {still: true, face: true})}</span>
        <b>${QCL[x.cls].e} ${esc(who(noOf_(x.sid)))}${bot ? " 🤖" : ""}</b><span class="sc">${x.sc.toLocaleString()}점</span>
        <small>${bot ? "컴퓨터 동료" : s ? `${s.isNew ? "🎉 새 기록! · " : ""}반 ${s.rank}등${s.coins ? ` · 🪙 +${s.coins}` : ""}` : o.party ? "기록은 친구 자기 기기에서 올라가요" : ""}</small></div>`; }).join("");
    $("#ngOver").innerHTML = `${R.win ? NG.conf(110) : ""}<div class="ng-box qd-over"><h3>${R.win ? "🏆 모든 스테이지 클리어! 용사들 최고!" : `💫 STAGE ${R.stage}에서 쓰러졌어요`}</h3>
      <div class="sc">팀 ${R.team.toLocaleString()}점</div><div class="qd-rs">${rows}</div>
      <div class="arc-row">${o.party === "guest" ? `<button class="arc-btn" data-qd="wait">⏳ 방장이 다시 시작하길 기다려요</button>` : `<button class="arc-btn p" data-qd="again">🔁 다시 모험</button>`}<button class="arc-btn" data-qd="home">🏠 홈으로</button></div></div>`;
    $("#ngOver").hidden = false; NG.ended = true;
    $("#ngOver").onclick = e => { const b = e.target.closest("[data-qd]"); if (!b) return; e.stopPropagation();
      if (b.dataset.qd === "home"){ PARTY.leave(); NG.close(); }
      else if (b.dataset.qd === "again"){ if (o.party === "host") PARTY.again(); else NG.play("qd", NG.sids, Object.assign({}, o, {seed: 0, cls: null})); } };
  }
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
    const M = this.members, nb = Math.max(0, Math.min(this.bots, this.MAX - M.length));
    this.started = true; Store.fs.updateDoc(this.ref(this.pid), {st: "play", n: M.length}).catch(() => {});
    const botNos = WB.pickBots(M, nb), sids = M.concat(botNos).map(sidOf), bots = botNos.map((_, i) => M.length + i), seed = Math.floor(Math.random()*1e9) + 1, remote = {};
    M.forEach((no, i) => { if (i){ const P = this.peers.get(no); if (P){ P.idx = i; P.inN = 0; P.last = {d: 0, b: 0}; remote[i] = no; this.send(P, {t: "start", g: "qd", sids, idx: i, bots, seed}); } } });
    this.seq = 0; this.lastGv = -1;
    const md = $("#mdWb"); if (md) md.hidden = true;
    if (!again){ ARC.game = "qd"; ARC.enter(); ARC.prep(); }
    getAC(); NG.play("qd", sids, {party: "host", local: [0], bots, remote, seed});
  };
  const css = document.createElement("style");
  css.textContent = `.in-room>.qd-intro{display:none}.qd-intro{margin-bottom:10px}.qd-cls{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:8px}
.qd-cls span{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;border-radius:14px;border:2px solid var(--c);background:rgba(255,255,255,.06);font-size:30px}
.qd-cls b{font:17px "Jua",sans-serif;color:var(--c)}.qd-cls small{font:12px "Gowun Dodum",sans-serif;opacity:.85}
.qd-over{max-width:640px}.qd-rs{display:flex;flex-direction:column;gap:6px;margin:10px 0 14px;text-align:left}
.qd-r{display:grid;grid-template-columns:34px 44px 1fr auto;grid-template-rows:auto auto;align-items:center;column-gap:8px;padding:6px 10px;border-radius:12px;background:rgba(255,255,255,.08)}
.qd-r.me{background:rgba(255,224,102,.2);border:2px solid #ffe066}.qd-r .rk{grid-row:span 2;font:22px "Jua",sans-serif;text-align:center}.qd-r .avf{grid-row:span 2;width:44px;height:44px}
.qd-r b{font:17px "Jua",sans-serif}.qd-r .sc{font:20px "Jua",sans-serif;color:#ffe066}.qd-r small{grid-column:3/5;font-size:12.5px;opacity:.85}
@media (max-width:560px){.qd-cls{grid-template-columns:repeat(2,1fr)}}`;
  document.head.appendChild(css);
})();
