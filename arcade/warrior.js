/* =====================================================================
   ⚔️ 장수 그림 (WAR) — 삼국지 무장 느낌의 멋진 캐릭터를 코드로 그려요 (오리지널 디자인)
   - 갑옷 비늘(찰갑) · 어깨 갑옷 · 허리 장식 · 휘날리는 띠 · 투구 깃털 · 긴 머리
   - 무기: 검 · 창 · 월도 · 방천극 · 도끼 · 철퇴 · 큰칼 · 활 · 깃털 부채
   - 짐승(늑대·말) · 동양 용도 같은 붓 느낌으로
   - 한 자세를 한 번만 그려 기억해 붙여요 (렉 없게). 용사 대모험 · 하늘 무사단이 같이 써요.
   ===================================================================== */
let WAR_CHIBI = true;   // 🍭 귀여운 메이플풍 비율 (false면 늘씬한 무장)
const WAR = (() => {
  const D2R = Math.PI/180, C = Math.cos, S = Math.sin;
  const sh = (hex, f) => { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    if (f < 0){ r *= 1 + f; g *= 1 + f; b *= 1 + f; } else { r += (255 - r)*f; g += (255 - g)*f; b += (255 - b)*f; }
    return `rgb(${r | 0},${g | 0},${b | 0})`; };
  const INK = "#140b24";
  /* 굵기가 변하는 팔다리 (끝이 둥근) */
  function limb(t, x1, y1, x2, y2, w1, w2, col, hi){
    const a = Math.atan2(y2 - y1, x2 - x1), nx = -S(a), ny = C(a);
    t.fillStyle = col; t.beginPath();
    t.moveTo(x1 + nx*w1/2, y1 + ny*w1/2); t.lineTo(x2 + nx*w2/2, y2 + ny*w2/2); t.arc(x2, y2, w2/2, a + Math.PI/2, a - Math.PI/2, true);
    t.lineTo(x1 - nx*w1/2, y1 - ny*w1/2); t.arc(x1, y1, w1/2, a - Math.PI/2, a + Math.PI/2, true); t.fill();
    if (hi){ t.fillStyle = hi; t.beginPath(); t.moveTo(x1 - nx*w1*.32, y1 - ny*w1*.32); t.lineTo(x2 - nx*w2*.32, y2 - ny*w2*.32); t.lineTo(x2 - nx*w2*.05, y2 - ny*w2*.05); t.lineTo(x1 - nx*w1*.05, y1 - ny*w1*.05); t.fill(); }
  }
  const poly = (t, pts, col) => { t.fillStyle = col; t.beginPath(); pts.forEach(([x, y], i) => i ? t.lineTo(x, y) : t.moveTo(x, y)); t.closePath(); t.fill(); };
  const lgrad = (t, x0, y0, x1, y1, stops) => { const g = t.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
  const circ = (t, x, y, r, col) => { t.fillStyle = col; t.beginPath(); t.arc(x, y, r, 0, 7); t.fill(); };

  /* ---------- 자세 (각도: 0 = 앞, 90 = 아래, -90 = 위) ---------- */
  const POSE = {
    idle0: {hy: 0, lean: 4, ft: 76, fs: 96, bt: 108, bs: 100, fu: 62, ff: 6, bu: 112, bf: 78, w: -42},
    idle1: {hy: 2, lean: 5, ft: 76, fs: 96, bt: 108, bs: 100, fu: 66, ff: 12, bu: 114, bf: 82, w: -36},
    walk0: {hy: 0, lean: 8, ft: 62, fs: 88, bt: 118, bs: 126, fu: 70, ff: 18, bu: 100, bf: 70, w: -30},
    walk1: {hy: -3, lean: 8, ft: 86, fs: 102, bt: 96, bs: 98, fu: 64, ff: 10, bu: 106, bf: 76, w: -36},
    walk2: {hy: 0, lean: 8, ft: 116, fs: 124, bt: 64, bs: 90, fu: 58, ff: 2, bu: 112, bf: 84, w: -42},
    walk3: {hy: -3, lean: 8, ft: 96, fs: 98, bt: 84, bs: 104, fu: 64, ff: 10, bu: 106, bf: 76, w: -36},
    atk0:  {hy: 2, lean: -8, ft: 66, fs: 88, bt: 112, bs: 104, fu: -128, ff: -160, bu: 130, bf: 100, w: -150},
    atk1:  {hy: 8, lean: 16, ft: 52, fs: 84, bt: 124, bs: 112, fu: -6, ff: -8, bu: 150, bf: 130, w: -12},
    atk2:  {hy: 9, lean: 20, ft: 50, fs: 84, bt: 126, bs: 112, fu: 40, ff: 62, bu: 160, bf: 140, w: 58},
    jump:  {hy: -14, lean: 4, ft: 22, fs: 112, bt: 78, bs: 140, fu: -60, ff: -96, bu: 140, bf: 110, w: -104},
    hurt:  {hy: 2, lean: -22, ft: 82, fs: 92, bt: 112, bs: 108, fu: 150, ff: 170, bu: 120, bf: 150, w: 196},
    cast:  {hy: 0, lean: 6, ft: 72, fs: 94, bt: 110, bs: 102, fu: -34, ff: -48, bu: 118, bf: 84, w: -62},
    spin:  {hy: 4, lean: 2, ft: 64, fs: 90, bt: 116, bs: 106, fu: 0, ff: 0, bu: 180, bf: 180, w: 0},
    fly:   {hy: 0, lean: 22, ft: 18, fs: 100, bt: 168, bs: 110, fu: -8, ff: -18, bu: 130, bf: 100, w: -24},
    fly1:  {hy: -2, lean: 24, ft: 22, fs: 104, bt: 164, bs: 106, fu: -14, ff: -26, bu: 126, bf: 96, w: -30},
    ride:  {hy: 0, lean: 6, ft: 26, fs: 100, bt: 36, bs: 104, fu: 0, ff: -10, bu: 110, bf: 80, w: -18}
  };
  /* 무기마다 자세를 조금씩 바꿔요 */
  function poseFor(name, wp){
    const p = Object.assign({}, POSE[name] || POSE.idle0);
    if (wp === "spear" || wp === "halberd" || wp === "guandao"){
      const thrust = {idle0: [40, 10, -8], idle1: [42, 12, -6], walk0: [44, 14, -6], walk1: [42, 12, -8], walk2: [40, 10, -10], walk3: [42, 12, -8],
        atk0: [120, 170, -4], atk1: [-4, -2, -2], atk2: [6, 8, 6], cast: [-20, -30, -40], fly: [10, 0, -6], fly1: [6, -4, -8], ride: [10, 0, -4]}[name];
      if (thrust){ [p.fu, p.ff, p.w] = thrust; if (name === "atk0"){ p.lean = -4; } }
      if (wp === "guandao" && (name === "atk0")) { p.fu = -120; p.ff = -150; p.w = -140; }
      if (wp === "guandao" && name === "atk2") { p.fu = 40; p.ff = 60; p.w = 40; }
    }
    if (wp === "bow"){ const b = {atk0: [0, 0, -90, 180, 180], atk1: [0, 0, -90, 170, 150], atk2: [10, 10, -80, 130, 110]}[name]; if (b){ [p.fu, p.ff, p.w, p.bu, p.bf] = b; p.lean = 4; } else p.w = -90; }
    if (wp === "fan"){ if (name.startsWith("idle") || name.startsWith("walk")){ p.fu = 50; p.ff = -40; p.w = -70; } if (name === "atk0"){ p.fu = -110; p.ff = -140; p.w = -150; } }
    return p;
  }

  /* ---------- 무기 ---------- */
  function weapon(t, wp, x, y, a, d, s){
    const ca = C(a), sa = S(a), nx = -sa, ny = ca, M = d.metal || "#dfe6ee", glow = d.glow;
    const along = (k, o = 0) => [x + ca*k + nx*o, y + sa*k + ny*o];
    t.save();
    if (wp === "sword" || wp === "dao"){
      const L = (wp === "sword" ? 78 : 66)*s, G = 10*s;
      // 손잡이 · 술
      limb(t, ...along(-14*s), ...along(4*s), 5*s, 5*s, "#3b2314");
      const [px, py] = along(-16*s); t.strokeStyle = d.tassel || "#e03131"; t.lineWidth = 2.5*s; t.lineCap = "round"; t.beginPath(); t.moveTo(px, py); t.quadraticCurveTo(px - 4*s, py + 16*s, px - 10*s, py + 26*s); t.stroke();
      // 날
      if (glow){ t.shadowColor = glow; t.shadowBlur = 14*s; }
      const tipC = wp === "dao" ? along(L, -6*s) : along(L);
      t.fillStyle = lgrad(t, ...along(0, -4*s), ...along(0, 4*s), [[0, "#ffffff"], [.45, M], [1, sh(M.startsWith("#") ? M : "#dfe6ee", -.35)]]);
      t.beginPath(); t.moveTo(...along(G, -3.6*s)); t.lineTo(...along(L - 12*s, -3.4*s)); t.lineTo(...tipC); t.lineTo(...along(L - 12*s, wp === "dao" ? 6*s : 3.4*s)); t.lineTo(...along(G, wp === "dao" ? 5*s : 3.6*s)); t.closePath(); t.fill();
      t.shadowBlur = 0;
      if (glow){ t.strokeStyle = glow; t.lineWidth = 1.4*s; t.beginPath(); t.moveTo(...along(G + 4*s, -1*s)); t.lineTo(...along(L - 14*s, -1*s)); t.stroke(); }
      // 코등이
      limb(t, ...along(5*s, -9*s), ...along(5*s, 9*s), 6*s, 6*s, d.trim || "#f59f00", "rgba(255,255,255,.45)");
    } else if (wp === "spear" || wp === "halberd" || wp === "guandao"){
      const back = 74*s, fwd = (wp === "guandao" ? 96 : 116)*s;
      limb(t, ...along(-back), ...along(fwd), 5*s, 5*s, "#5c3a1e", "rgba(255,255,255,.25)");
      const [tx, ty] = along(fwd);
      t.fillStyle = "#e03131"; for (let k = 0; k < 5; k++){ const [qx, qy] = along(fwd - 4*s, (k - 2)*2*s); t.beginPath(); t.moveTo(qx, qy); t.quadraticCurveTo(qx - 6*s, qy + 12*s, qx - 10*s + k*2*s, qy + 20*s); t.lineTo(qx - 7*s + k*2*s, qy + 20*s); t.closePath(); t.fill(); }
      limb(t, ...along(fwd - 6*s), ...along(fwd + 2*s), 8*s, 7*s, d.trim || "#f59f00");
      if (glow){ t.shadowColor = glow; t.shadowBlur = 12*s; }
      t.fillStyle = lgrad(t, ...along(fwd, -5*s), ...along(fwd, 5*s), [[0, "#fff"], [.5, M], [1, "#7c8a99"]]);
      if (wp === "guandao"){ t.beginPath(); t.moveTo(...along(fwd, 3*s)); t.quadraticCurveTo(...along(fwd + 26*s, 14*s), ...along(fwd + 46*s, -10*s)); t.quadraticCurveTo(...along(fwd + 22*s, -10*s), ...along(fwd, -6*s)); t.closePath(); t.fill(); }
      else { t.beginPath(); t.moveTo(...along(fwd + 2*s, -5*s)); t.lineTo(...along(fwd + 34*s)); t.lineTo(...along(fwd + 2*s, 5*s)); t.closePath(); t.fill(); }
      if (wp === "halberd"){ t.beginPath(); t.moveTo(...along(fwd + 6*s, 3*s)); t.quadraticCurveTo(...along(fwd + 14*s, 22*s), ...along(fwd + 2*s, 26*s)); t.quadraticCurveTo(...along(fwd + 12*s, 14*s), ...along(fwd, 4*s)); t.fill();
        t.beginPath(); t.moveTo(...along(fwd + 6*s, -3*s)); t.quadraticCurveTo(...along(fwd + 14*s, -22*s), ...along(fwd + 2*s, -26*s)); t.quadraticCurveTo(...along(fwd + 12*s, -14*s), ...along(fwd, -4*s)); t.fill(); }
      t.shadowBlur = 0; void tx; void ty;
    } else if (wp === "axe"){
      const L = 70*s; limb(t, ...along(-20*s), ...along(L), 6*s, 6*s, "#4a2c17");
      t.fillStyle = lgrad(t, ...along(L, -30*s), ...along(L, 30*s), [[0, "#f1f3f5"], [.5, "#adb5bd"], [1, "#495057"]]);
      t.beginPath(); t.moveTo(...along(L - 18*s, -4*s)); t.quadraticCurveTo(...along(L - 30*s, -36*s), ...along(L + 6*s, -40*s)); t.quadraticCurveTo(...along(L + 22*s, 0), ...along(L + 6*s, 40*s)); t.quadraticCurveTo(...along(L - 30*s, 36*s), ...along(L - 18*s, 4*s)); t.closePath(); t.fill();
      circ(t, ...along(L - 10*s), 5*s, d.trim || "#f59f00");
    } else if (wp === "club"){
      const L = 60*s; limb(t, ...along(-8*s), ...along(L - 20*s), 6*s, 7*s, "#4a2c17");
      limb(t, ...along(L - 24*s), ...along(L + 8*s), 16*s, 20*s, "#495057", "rgba(255,255,255,.3)");
      t.fillStyle = "#dee2e6"; for (let k = 0; k < 4; k++){ for (const sd of [-1, 1]){ const [qx, qy] = along(L - 18*s + k*8*s, sd*10*s), [ex, ey] = along(L - 18*s + k*8*s, sd*17*s); t.beginPath(); t.moveTo(qx - ca*3*s, qy - sa*3*s); t.lineTo(ex, ey); t.lineTo(qx + ca*3*s, qy + sa*3*s); t.fill(); } }
    } else if (wp === "bow"){
      const R = 62*s; t.strokeStyle = "#5c3a1e"; t.lineWidth = 5*s; t.lineCap = "round";
      t.beginPath(); t.moveTo(...along(-R, 0)); t.quadraticCurveTo(...along(-R*.5, 14*s), ...along(0, 10*s)); t.quadraticCurveTo(...along(R*.5, 14*s), ...along(R, 0)); t.stroke();
      t.strokeStyle = d.trim || "#f59f00"; t.lineWidth = 2*s; t.beginPath(); t.moveTo(...along(-R, 0)); t.lineTo(...along(-R*.85, 6*s)); t.moveTo(...along(R, 0)); t.lineTo(...along(R*.85, 6*s)); t.stroke();
      t.strokeStyle = "rgba(255,255,255,.85)"; t.lineWidth = 1.2*s; t.beginPath(); t.moveTo(...along(-R, 0)); t.lineTo(...along(0, d.draw ? -26*s : 0)); t.lineTo(...along(R, 0)); t.stroke();
      if (d.draw){ limb(t, ...along(0, -26*s), ...along(0, 34*s), 2*s, 2*s, "#a0522d"); poly(t, [along(-4*s, 34*s), along(0, 44*s), along(4*s, 34*s)], "#dee2e6"); }
    } else if (wp === "fan"){
      limb(t, ...along(-6*s), ...along(14*s), 4*s, 4*s, "#5c3a1e");
      for (let k = -5; k <= 5; k++){ const fa = a + k*9*D2R, fx = x + C(a)*14*s, fy = y + S(a)*14*s;
        t.fillStyle = k % 2 ? "#f8f9fa" : "#dee2e6"; t.beginPath(); t.ellipse(fx + C(fa)*24*s, fy + S(fa)*24*s, 26*s, 5*s, fa, 0, 7); t.fill();
        t.fillStyle = "#495057"; t.beginPath(); t.ellipse(fx + C(fa)*46*s, fy + S(fa)*46*s, 4*s, 3*s, fa, 0, 7); t.fill();
        t.strokeStyle = "rgba(120,120,140,.5)"; t.lineWidth = .8*s; t.beginPath(); t.moveTo(fx, fy); t.lineTo(fx + C(fa)*40*s, fy + S(fa)*40*s); t.stroke(); }
      if (glow){ const [ox, oy] = along(36*s); const g = t.createRadialGradient(ox, oy, 1, ox, oy, 22*s); g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(.4, glow); g.addColorStop(1, "rgba(0,0,0,0)"); t.fillStyle = g; t.beginPath(); t.arc(ox, oy, 22*s, 0, 7); t.fill(); }
    }
    t.restore();
  }

  /* ---------- 머리 ---------- */
  function head(t, x, y, r, d, P, s, CB){
    const hair = d.hair || "#1a1423", skin = d.skin || "#f1c9a5";
    // 뒤로 휘날리는 머리 (꽁지머리)
    const rt = CB ? r*.62 : r;   // 꽁지머리·깃털·띠 길이 (아기자기 비율은 짧게)
    if (d.tail !== false && !d.ghost){ t.fillStyle = hair; t.beginPath(); t.moveTo(x - r*.6, y - r*.7); t.quadraticCurveTo(x - r*.6 - rt*1.8, y - r*.2 + P*2*s, x - r*.6 - rt*2.4, y + rt*1.4 + P*3*s); t.quadraticCurveTo(x - r*.6 - rt*1.3, y + rt*.5, x - r*.4, y + r*.2); t.fill();
      if (CB){ circ(t, x - r*.75, y - r*.65, r*.22, d.trim || "#f59f00"); } }
    // 얼굴
    const fg = t.createLinearGradient(x - r, y - r, x + r, y + r); fg.addColorStop(0, sh(skin, .1)); fg.addColorStop(1, sh(skin, -.18));
    if (CB){ t.fillStyle = fg; t.beginPath(); t.ellipse(x + r*.05, y + r*.05, r*1.0, r*.98, 0, 0, 7); t.fill(); t.beginPath(); t.ellipse(x + r*.45, y + r*.45, r*.62, r*.5, -.2, 0, 7); t.fill(); }
    else { t.fillStyle = fg; t.beginPath(); t.moveTo(x - r*.9, y - r*.4); t.quadraticCurveTo(x - r*.9, y - r*1.05, x, y - r*1.05); t.quadraticCurveTo(x + r*.95, y - r*1.0, x + r*1.0, y - r*.2);
    t.lineTo(x + r*1.12, y + r*.18); t.lineTo(x + r*.95, y + r*.35); t.quadraticCurveTo(x + r*.85, y + r*.95, x + r*.25, y + r*1.12); t.quadraticCurveTo(x - r*.5, y + r*1.05, x - r*.85, y + r*.4); t.closePath(); t.fill(); }
    // 귀
    circ(t, x - r*.25, y + r*.05, r*.22, sh(skin, -.12));
    // 눈 · 눈썹
    const ex = x + r*.52, ey = y - r*.08;
    if (CB){ // 메이플처럼 큰 반짝 눈 · 볼터치 · 작은 입
      const ew = r*.19, eh = r*.29, e1 = x + r*.64, e2 = x + r*.02;   // 두 눈 사이를 넉넉히 · 얼굴 가운데보다 조금 아래
      [[e1, .95], [e2, .8]].forEach(([cx, k]) => { const yy = y + r*.16;
        if (d.ghost){ t.shadowColor = d.eyeGlow || "#74c0fc"; t.shadowBlur = 8*s; t.fillStyle = d.eyeGlow || "#a5f3fc"; t.beginPath(); t.ellipse(cx, yy, ew*k*.8, eh*.55, 0, 0, 7); t.fill(); t.shadowBlur = 0; return; }
        t.fillStyle = "#fff"; t.beginPath(); t.ellipse(cx, yy, ew*k, eh, 0, 0, 7); t.fill();
        const ig = t.createLinearGradient(0, yy - eh, 0, yy + eh); ig.addColorStop(0, "#1a1033"); ig.addColorStop(.55, d.eye || "#5b3a8a"); ig.addColorStop(1, sh(d.eye || "#7c4dff", .45));
        t.fillStyle = ig; t.beginPath(); t.ellipse(cx + ew*.12*k, yy + eh*.05, ew*.78*k, eh*.86, 0, 0, 7); t.fill();
        circ(t, cx + ew*.32*k, yy - eh*.4, ew*.32, "#fff"); circ(t, cx - ew*.18*k, yy + eh*.42, ew*.16, "rgba(255,255,255,.85)");
        t.strokeStyle = "#1a1033"; t.lineWidth = r*.06; t.lineCap = "round"; t.beginPath(); t.moveTo(cx - ew*1.05*k, yy - eh*.78); t.quadraticCurveTo(cx, yy - eh*1.12, cx + ew*1.1*k, yy - eh*.7); t.stroke(); });
      if (!d.ghost){ t.fillStyle = "rgba(255,120,150,.32)"; t.beginPath(); t.ellipse(x - r*.12, y + r*.52, r*.16, r*.09, 0, 0, 7); t.fill(); t.beginPath(); t.ellipse(x + r*.86, y + r*.52, r*.14, r*.08, 0, 0, 7); t.fill(); }
      // 코 (작은 점) · 입 (두 눈 사이 아래)
      t.fillStyle = sh(skin, -.3); t.beginPath(); t.arc(x + r*.4, y + r*.42, r*.04, 0, 7); t.fill();
      t.strokeStyle = d.ghost ? "#0f172a" : sh(skin, -.5); t.lineWidth = r*.06; t.lineCap = "round"; t.beginPath();
      if (d.angry){ t.moveTo(x + r*.26, y + r*.66); t.lineTo(x + r*.52, y + r*.63); } else { t.moveTo(x + r*.26, y + r*.6); t.quadraticCurveTo(x + r*.39, y + r*.72, x + r*.52, y + r*.6); } t.stroke();
      if (d.angry){ t.strokeStyle = hair; t.lineWidth = r*.09; [[e1, 1], [e2, -1]].forEach(([cx, sd]) => { t.beginPath(); t.moveTo(cx - r*.18, y - r*.2 + (sd > 0 ? 0 : -r*.05)); t.lineTo(cx + r*.18, y - r*.2 + (sd > 0 ? -r*.06 : r*.04)); t.stroke(); }); }
    } else if (d.ghost){ t.shadowColor = d.eyeGlow || "#74c0fc"; t.shadowBlur = 8*s; poly(t, [[ex - r*.3, ey - r*.08], [ex + r*.26, ey - r*.12], [ex + r*.18, ey + r*.1], [ex - r*.26, ey + r*.08]], d.eyeGlow || "#a5f3fc"); t.shadowBlur = 0; }
    else { poly(t, [[ex - r*.28, ey - r*.05], [ex + r*.26, ey - r*.14], [ex + r*.22, ey + r*.1], [ex - r*.22, ey + r*.1]], "#fff");
      circ(t, ex + r*.05, ey - r*.01, r*.12, d.eye || "#2b1b17"); circ(t, ex + r*.08, ey - r*.05, r*.04, "#fff"); }
    if (!CB){
    t.strokeStyle = d.ghost ? "#0f172a" : hair; t.lineWidth = r*.16; t.lineCap = "round";
    t.beginPath(); t.moveTo(ex - r*.36, ey - r*(d.angry ? .2 : .32)); t.lineTo(ex + r*.32, ey - r*(d.angry ? .38 : .34)); t.stroke();
    // 코 · 입
    t.strokeStyle = sh(skin, -.32); t.lineWidth = r*.07; t.beginPath(); t.moveTo(x + r*1.0, y - r*.02); t.lineTo(x + r*1.08, y + r*.22); t.stroke();
    t.beginPath(); t.moveTo(x + r*.62, y + r*.58); t.lineTo(x + r*.88, y + r*.54); t.stroke(); }
    // 수염
    if (d.beard && CB){ t.fillStyle = d.beard; t.beginPath(); t.moveTo(x + r*.2, y + r*.75); t.quadraticCurveTo(x + r*.9, y + r*.7, x + r*.75, y + r*1.15); t.quadraticCurveTo(x + r*.45, y + r*1.45 + P*s, x + r*.25, y + r*1.2); t.fill(); }
    else if (d.beard){ t.fillStyle = d.beard; t.beginPath(); t.moveTo(x + r*.15, y + r*.45); t.quadraticCurveTo(x + r*.95, y + r*.5, x + r*.95, y + r*.62); t.quadraticCurveTo(x + r*.9, y + r*1.9, x + r*.2, y + r*2.6 + P*s); t.quadraticCurveTo(x - r*.1, y + r*1.4, x - r*.4, y + r*.5); t.fill(); }
    if (d.ghost){ t.fillStyle = "rgba(15,23,42,.45)"; t.beginPath(); t.ellipse(x + r*.4, y + r*.55, r*.35, r*.18, 0, 0, 7); t.fill(); }
    // 머리카락 (앞머리 · 정수리)
    if (!d.ghost){ t.fillStyle = hair; t.beginPath(); t.moveTo(x - r*.6, y - r*.9); for (let k = 0; k < 5; k++){ t.lineTo(x - r*(1.3 + k*.12), y - r*(1.0 - k*.42)); t.lineTo(x - r*(.85 + k*.08), y - r*(.8 - k*.4)); } t.lineTo(x - r*.6, y + r*.6); t.fill();
      t.beginPath(); t.moveTo(x - r*1.0, y + r*.3); t.quadraticCurveTo(x - r*1.15, y - r*1.25, x + r*.1, y - r*1.22); t.quadraticCurveTo(x + r*1.0, y - r*1.15, x + r*1.08, y - r*.45);
      t.lineTo(x + r*.7, y - r*.62); t.lineTo(x + r*.5, y - r*.32); t.lineTo(x + r*.25, y - r*.6); t.lineTo(x - r*.1, y - r*.3); t.lineTo(x - r*.45, y - r*.15); t.lineTo(x - r*.6, y + r*.35); t.closePath(); t.fill();
      t.fillStyle = "rgba(255,255,255,.14)"; t.beginPath(); t.ellipse(x - r*.1, y - r*.95, r*.5, r*.12, -.2, 0, 7); t.fill(); }
    // 투구 · 관
    const hm = d.helm, T = d.trim || "#f59f00", A = d.armor || "#495057";
    if (hm === "general" || hm === "horned"){
      t.fillStyle = lgrad(t, x, y - r*1.6, x, y - r*.2, [[0, sh(A, .35)], [1, sh(A, -.25)]]);
      t.beginPath(); t.moveTo(x - r*1.15, y - r*.15); t.quadraticCurveTo(x - r*1.25, y - r*1.55, x + r*.05, y - r*1.55); t.quadraticCurveTo(x + r*1.15, y - r*1.5, x + r*1.1, y - r*.55); t.lineTo(x + r*.55, y - r*.6); t.lineTo(x - r*.5, y - r*.45); t.lineTo(x - r*.6, y + r*.5); t.lineTo(x - r*1.15, y + r*.35); t.closePath(); t.fill();
      t.strokeStyle = T; t.lineWidth = r*.14; t.beginPath(); t.moveTo(x - r*1.1, y - r*.4); t.quadraticCurveTo(x, y - r*.7, x + r*1.08, y - r*.62); t.stroke();
      circ(t, x + r*.15, y - r*.95, r*.2, T);
      if (hm === "general"){ // 깃털 장식
        t.fillStyle = d.plume || "#e03131"; t.beginPath(); t.moveTo(x - r*.1, y - r*1.5); t.quadraticCurveTo(x - rt*.6, y - r*1.5 - rt*1.5, x - rt*2.6, y - r*1.5 - rt*1.4 + P*2*s); t.quadraticCurveTo(x - rt*1.0, y - r*1.5 - rt*.7, x + r*.3, y - r*1.45); t.fill();
        t.fillStyle = T; poly(t, [[x - r*.2, y - r*1.5], [x + r*.05, y - r*2.1], [x + r*.3, y - r*1.5]], T); }
      else { t.fillStyle = "#f1f3f5"; [[-1, -.6], [1, .7]].forEach(([sd, bx]) => { t.beginPath(); t.moveTo(x + r*bx - r*.15, y - r*1.25); t.quadraticCurveTo(x + r*(bx + sd*.9), y - r*1.6, x + r*(bx + sd*.6), y - r*2.4); t.quadraticCurveTo(x + r*(bx + sd*.3), y - r*1.7, x + r*bx + r*.2, y - r*1.3); t.fill(); }); }
    } else if (hm === "crown"){ // 작은 금관 + 비녀
      poly(t, [[x - r*.35, y - r*1.15], [x - r*.25, y - r*1.6], [x + r*.35, y - r*1.6], [x + r*.45, y - r*1.15]], T); limb(t, x - r*.8, y - r*1.4, x + r*.9, y - r*1.4, r*.1, r*.1, "#f8f9fa");
    } else if (hm === "scholar"){ // 책사 관
      poly(t, [[x - r*.95, y - r*.85], [x - r*.75, y - r*1.75], [x + r*.75, y - r*1.75], [x + r*.95, y - r*.85]], "#1a1423"); limb(t, x - r*1.0, y - r*.9, x + r*1.0, y - r*.9, r*.16, r*.16, T);
      t.strokeStyle = "#1a1423"; t.lineWidth = r*.12; t.beginPath(); t.moveTo(x - r*.8, y - r*1.6); t.lineTo(x - r*1.9, y - r*1.3 + P*s); t.stroke();
    } else if (hm === "band" || hm === "turban"){ // 머리띠 (황건 · 바람)
      const bc = d.band || "#facc15"; limb(t, x - r*1.02, y - r*.55, x + r*1.0, y - r*.68, r*.32, r*.3, bc, "rgba(255,255,255,.35)");
      t.fillStyle = bc; t.beginPath(); t.moveTo(x - r*.95, y - r*.6); t.quadraticCurveTo(x - r*.95 - rt*.95, y - r*.4 + P*2*s, x - r*.95 - rt*1.65, y + rt*.2 + P*3*s); t.lineTo(x - r*.95 - rt*1.45, y + rt*.5 + P*3*s); t.quadraticCurveTo(x - r*.95 - rt*.75, y - r*.1, x - r*.95, y - r*.35); t.fill();
    } else if (hm === "soldier"){ // 병사 투구 (뾰족)
      t.fillStyle = lgrad(t, x, y - r*1.9, x, y - r*.3, [[0, sh(A, .3)], [1, sh(A, -.3)]]); t.beginPath(); t.moveTo(x - r*1.15, y - r*.3); t.quadraticCurveTo(x - r*1.1, y - r*1.3, x, y - r*1.95); t.quadraticCurveTo(x + r*1.1, y - r*1.3, x + r*1.15, y - r*.45); t.lineTo(x + r*.4, y - r*.5); t.lineTo(x - r*.6, y - r*.3); t.closePath(); t.fill();
      limb(t, x - r*1.15, y - r*.42, x + r*1.15, y - r*.52, r*.16, r*.16, T); circ(t, x, y - r*1.95, r*.14, d.plume || "#e03131");
    } else if (hm === "shroom"){ // 버섯 모자
      const cc = d.cap || "#e8590c"; t.fillStyle = lgrad(t, x, y - r*2, x, y - r*.2, [[0, sh(cc, .25)], [1, sh(cc, -.25)]]); t.beginPath(); t.moveTo(x - r*1.55, y - r*.25); t.quadraticCurveTo(x - r*1.5, y - r*2.1, x + r*.1, y - r*2.0); t.quadraticCurveTo(x + r*1.6, y - r*1.9, x + r*1.55, y - r*.3); t.quadraticCurveTo(x, y - r*.55, x - r*1.55, y - r*.25); t.fill();
      [[-.7, -1.3, .28], [.2, -1.6, .34], [.95, -1.05, .24], [-.1, -.85, .2]].forEach(([a, b, c]) => circ(t, x + r*a, y + r*b, r*c, "#fff8e1"));
    } else if (hm === "fur"){
      t.fillStyle = "#f1f3f5"; t.beginPath(); t.moveTo(x - r*1.25, y + r*.4); t.quadraticCurveTo(x - r*1.4, y - r*1.6, x + r*.1, y - r*1.5); t.quadraticCurveTo(x + r*1.2, y - r*1.4, x + r*1.15, y - r*.5); t.lineTo(x + r*.5, y - r*.55); t.lineTo(x - r*.5, y - r*.4); t.lineTo(x - r*.7, y + r*.6); t.closePath(); t.fill();
      t.fillStyle = "rgba(160,170,190,.6)"; for (let k = 0; k < 5; k++){ t.beginPath(); t.arc(x - r*1.0 + k*r*.45, y - r*1.25 + (k % 2)*r*.12, r*.14, 0, 7); t.fill(); }
    } else if (hm === "skull"){ // 남만 뿔장식
      t.fillStyle = "#f8f0e3"; [[-.6, -1], [.6, 1]].forEach(([bx, sd]) => { t.beginPath(); t.moveTo(x + r*bx, y - r*1.0); t.quadraticCurveTo(x + r*(bx + sd*1.2), y - r*1.4, x + r*(bx + sd*.9), y - r*2.3); t.quadraticCurveTo(x + r*(bx + sd*.6), y - r*1.5, x + r*bx + sd*r*.3, y - r*1.0); t.fill(); });
      limb(t, x - r*1.0, y - r*.7, x + r*1.0, y - r*.8, r*.22, r*.22, "#b91c1c"); [-.5, 0, .5].forEach(k => circ(t, x + r*k, y - r*.74, r*.1, "#facc15"));
    }
  }

  /* ---------- 몸 전체 ---------- */
  /* d: 장수 정보 · pn: 자세 이름 · t: 그릴 곳 · (ox, oy) = 발 · s = 크기 */
  function body(t, d, pn, ox, oy, s){
    const wp = d.weapon, P = poseFor(pn, wp), big = d.big ? 1.25 : 1, robe = d.robe;
    const A = d.armor || "#495057", T = d.trim || "#f59f00", CL = d.cloth || "#7f1d1d", SK = d.skin || "#f1c9a5";
    const AD = sh(A, -.35), AL = sh(A, .3), pf = POSE[pn] ? (pn.endsWith("1") || pn.endsWith("3") ? 1 : 0) : 0;
    const CB = WAR_CHIBI && !d.real;   // 🍭 아기자기 2.5등신 (큰 머리 · 짧은 팔다리 · 큰 무기)
    const TH = (CB ? 24 : 46)*s, SH = (CB ? 22 : 46)*s, TO = (CB ? 34 : 62)*s*(d.tall || 1), UA = (CB ? 19 : 34)*s, FA = (CB ? 18 : 32)*s, HR = (CB ? 31 : 16.5)*s;
    const hip = [ox, oy - (TH + SH)*.96 + P.hy*s], lean = P.lean*D2R;
    const neck = [hip[0] + S(lean)*TO, hip[1] - C(lean)*TO];
    const shF = [neck[0] + 4*s*big, neck[1] + 10*s], shB = [neck[0] - 6*s*big, neck[1] + 8*s];
    const leg = (th, sn) => { const k = [hip[0] + C(th*D2R)*TH, hip[1] + S(th*D2R)*TH]; return [k, [k[0] + C(sn*D2R)*SH, k[1] + S(sn*D2R)*SH]]; };
    const arm = (sh0, u, f) => { const e = [sh0[0] + C(u*D2R)*UA, sh0[1] + S(u*D2R)*UA]; return [e, [e[0] + C(f*D2R)*FA, e[1] + S(f*D2R)*FA]]; };
    const [bk, bf] = leg(P.bt, P.bs), [fk, ff] = leg(P.ft, P.fs);
    const [be, bh] = arm(shB, P.bu, P.bf), [fe, fh] = arm(shF, P.fu, P.ff);
    const wave = pf ? 4*s : 0, cs = CB ? .55 : 1, ps = CB ? .72 : 1;
    // 휘날리는 망토 · 띠
    if (d.cape){ const k2 = s*cs; t.fillStyle = lgrad(t, shB[0], shB[1], shB[0] - 70*k2, shB[1] + 90*k2, [[0, d.cape], [1, sh(d.cape, -.45)]]);
      t.beginPath(); t.moveTo(shB[0] + 4*s, shB[1] - 4*s); t.quadraticCurveTo(shB[0] - 40*k2, shB[1] + 20*k2 + wave, shB[0] - 72*k2, shB[1] + 86*k2 + wave); t.lineTo(shB[0] - 40*k2, shB[1] + 96*k2); t.quadraticCurveTo(shB[0] - 14*k2, shB[1] + 50*k2, hip[0] - 2*s, hip[1] + 8*s); t.closePath(); t.fill(); }
    // 뒤로 길게 휘날리는 전포 자락
    { const cc = robe ? CL : (d.coat || sh(CL, -.1)); t.fillStyle = lgrad(t, hip[0], hip[1], hip[0] - 40*s, oy, [[0, cc], [1, sh(cc, -.4)]]);
      t.beginPath(); t.moveTo(hip[0] - 6*s, hip[1] - 8*s); t.quadraticCurveTo(hip[0] - 30*s*cs, hip[1] + 30*s*cs + wave, hip[0] - 46*s*cs - wave, oy - 18*s); t.lineTo(hip[0] - 22*s*cs, oy - 26*s + wave); t.quadraticCurveTo(hip[0] - 10*s, hip[1] + 30*s, hip[0] + 6*s, hip[1] - 4*s); t.closePath(); t.fill();
      t.strokeStyle = T; t.lineWidth = 2*s; t.beginPath(); t.moveTo(hip[0] - 46*s*cs - wave, oy - 18*s); t.lineTo(hip[0] - 22*s*cs, oy - 26*s + wave); t.stroke(); }
    { const sc = d.sash || T; t.strokeStyle = sc; t.lineWidth = 5*s; t.lineCap = "round"; t.beginPath(); t.moveTo(hip[0] - 8*s, hip[1] - 4*s); t.quadraticCurveTo(hip[0] - 34*s*cs, hip[1] + 4*s + wave, hip[0] - 52*s*cs, hip[1] + 26*s*cs - wave); t.stroke();
      t.lineWidth = 4*s; t.beginPath(); t.moveTo(hip[0] - 8*s, hip[1] - 2*s); t.quadraticCurveTo(hip[0] - 26*s*cs, hip[1] + 18*s*cs, hip[0] - 40*s*cs, hip[1] + 40*s*cs + wave); t.stroke(); }
    // 뒷팔
    limb(t, ...shB, ...be, 13*s*big, 11*s*big, sh(A, -.45)); limb(t, ...be, ...bh, 11*s*big, 10*s, sh(A, -.55)); circ(t, ...bh, 5.5*s, sh(SK, -.25));
    t.fillStyle = sh(A, -.3); t.beginPath(); t.ellipse(shB[0], shB[1] + 3*s, 15*s*big, 11*s*big, -.3, Math.PI, Math.PI*2.1); t.fill();
    if (d.shield){ t.fillStyle = lgrad(t, bh[0], bh[1] - 26*s, bh[0], bh[1] + 26*s, [[0, sh(d.shield, .3)], [1, sh(d.shield, -.35)]]); t.beginPath(); t.ellipse(bh[0] + 4*s, bh[1], 16*s, 26*s, 0, 0, 7); t.fill();
      t.strokeStyle = T; t.lineWidth = 3*s; t.stroke(); circ(t, bh[0] + 4*s, bh[1], 6*s, T); }
    if (wp === "bow" && P.bu > 120 && (pn === "atk0" || pn === "atk1")){ /* 시위 당기는 손 */ }
    // 뒷다리
    limb(t, ...hip, ...bk, 17*s*big, 13*s, sh(CL, -.45)); limb(t, ...bk, ...bf, 13*s, 11*s, sh(A, -.5)); poly(t, [[bf[0] - 8*s, bf[1] - 4*s], [bf[0] + 13*s, bf[1] - 3*s], [bf[0] + 14*s, bf[1] + 3*s], [bf[0] - 8*s, bf[1] + 3*s]], "#1a1423");
    // 허리치마 (뒤)
    poly(t, [[hip[0] - 15*s*big, hip[1] - 6*s], [hip[0] + 4*s, hip[1] - 6*s], [hip[0] - 4*s, hip[1] + 34*s], [hip[0] - 24*s*big, hip[1] + 30*s]], sh(robe ? CL : A, -.4));
    // 몸통
    const tw = (CB ? 15 : 22)*s*big, tb = (CB ? 12 : 13)*s*big, nX = -C(lean), nY = -S(lean); // 몸 옆 방향
    const tp = [[neck[0] - tw*C(lean) - 2*s, neck[1] - tw*S(lean) + 4*s], [neck[0] + tw*C(lean) + 2*s, neck[1] + tw*S(lean) + 2*s], [hip[0] + tb*C(lean), hip[1] + tb*S(lean)], [hip[0] - tb*C(lean), hip[1] - tb*S(lean)]];
    t.fillStyle = robe ? lgrad(t, hip[0] - 20*s, 0, hip[0] + 20*s, 0, [[0, sh(CL, -.3)], [.5, CL], [1, sh(CL, .2)]]) : lgrad(t, hip[0] - 20*s, 0, hip[0] + 22*s, 0, [[0, AD], [.55, A], [1, AL]]);
    t.beginPath(); tp.forEach(([x, y], i) => i ? t.lineTo(x, y) : t.moveTo(x, y)); t.closePath(); t.fill();
    if (!robe){ // 찰갑 비늘
      t.save(); t.beginPath(); tp.forEach(([x, y], i) => i ? t.lineTo(x, y) : t.moveTo(x, y)); t.closePath(); t.clip();
      t.strokeStyle = "rgba(0,0,0,.28)"; t.lineWidth = 1.1*s; const rows = 7;
      for (let rI = 0; rI < rows; rI++){ const k = (rI + .6)/rows, cx = neck[0] + (hip[0] - neck[0])*k, cy = neck[1] + (hip[1] - neck[1])*k;
        for (let q = -3; q <= 3; q++){ const px = cx + C(lean)*q*6*s + (rI % 2)*3*s, py = cy + S(lean)*q*6*s; t.beginPath(); t.arc(px, py - 2*s, 3.2*s, 0, Math.PI); t.stroke(); } }
      t.restore();
      // 가슴 거울판 (호심경)
      const cx = neck[0] + (hip[0] - neck[0])*.32 + C(lean)*5*s, cy = neck[1] + (hip[1] - neck[1])*.32 + S(lean)*5*s;
      t.fillStyle = lgrad(t, cx - 8*s, cy - 8*s, cx + 8*s, cy + 8*s, [[0, "#fff"], [.4, sh(T, .2)], [1, sh(T, -.3)]]); t.beginPath(); t.arc(cx, cy, 8.5*s*big, 0, 7); t.fill();
      t.strokeStyle = sh(T, -.4); t.lineWidth = 1.4*s; t.stroke();
    } else { // 도포 깃
      t.strokeStyle = T; t.lineWidth = 3.5*s; t.beginPath(); t.moveTo(neck[0] - 6*s, neck[1] + 2*s); t.lineTo(hip[0] + 8*s, hip[1] - 8*s); t.stroke();
      t.strokeStyle = "#f8f9fa"; t.lineWidth = 2*s; t.beginPath(); t.moveTo(neck[0] - 3*s, neck[1] + 1*s); t.lineTo(hip[0] + 10*s, hip[1] - 10*s); t.stroke(); }
    // 허리띠 · 짐승 얼굴 버클
    limb(t, hip[0] - 17*s*big, hip[1] - 4*s, hip[0] + 17*s*big, hip[1] - 2*s, 7*s, 7*s, sh(CL, -.25)); circ(t, hip[0] + 8*s, hip[1] - 3*s, 6.5*s, T); circ(t, hip[0] + 8*s, hip[1] - 3*s, 3*s, sh(T, -.45));
    // 앞다리
    limb(t, ...hip, ...fk, 17*s*big, 14*s, robe ? sh(CL, -.15) : CL, "rgba(255,255,255,.12)");
    limb(t, ...fk, ...ff, 14*s, 12*s, robe ? sh(CL, -.25) : A, "rgba(255,255,255,.25)");
    if (!robe) circ(t, ...fk, 7.5*s, T);
    poly(t, [[ff[0] - 8*s, ff[1] - 5*s], [ff[0] + 15*s, ff[1] - 3*s], [ff[0] + 16*s, ff[1] + 3*s], [ff[0] - 8*s, ff[1] + 3*s]], "#241629");
    // 허리치마 (앞)
    const sk1 = [hip[0] + 4*s, hip[1] - 4*s], k1 = [fk[0], fk[1]];
    t.fillStyle = lgrad(t, sk1[0], sk1[1], k1[0], k1[1] + 10*s, [[0, robe ? CL : A], [1, sh(robe ? CL : A, -.3)]]);
    const kx = k1[0] + (ff[0] - k1[0])*.35, ky = k1[1] + (ff[1] - k1[1])*.35 + (robe ? 16 : 6)*s;
    t.beginPath(); t.moveTo(hip[0] - 10*s*big, hip[1] - 4*s); t.lineTo(hip[0] + 17*s*big, hip[1] - 4*s); t.lineTo(kx + 14*s, ky - 4*s); t.lineTo(kx - 10*s, ky + 2*s); t.closePath(); t.fill();
    if (!robe){ t.strokeStyle = "rgba(0,0,0,.25)"; t.lineWidth = 1*s; for (let q = 1; q < 4; q++){ const u = q/4; t.beginPath(); t.moveTo(hip[0] - 10*s + (kx - 10*s - hip[0] + 10*s)*u, hip[1] - 4*s + (ky + 2*s - hip[1] + 4*s)*u); t.lineTo(hip[0] + 17*s + (kx + 14*s - hip[0] - 17*s)*u, hip[1] - 4*s + (ky - 4*s - hip[1] + 4*s)*u); t.stroke(); } }
    t.strokeStyle = T; t.lineWidth = 2.4*s; t.beginPath(); t.moveTo(kx + 14*s, ky - 4*s); t.lineTo(kx - 10*s, ky + 2*s); t.stroke();
    // 머리
    const hd = CB ? [neck[0] + 3*s + S(lean)*10*s, neck[1] - HR*.86] : [neck[0] + 6*s + S(lean)*6*s, neck[1] - 13*s];
    limb(t, ...neck, hd[0] - 2*s, hd[1] + 6*s, 10*s, 9*s, sh(SK, -.15));
    head(t, hd[0], hd[1], HR*(d.big ? 1.05 : 1), d, pf, s, CB);
    // 어깨 갑옷 (앞)
    t.fillStyle = lgrad(t, shF[0], shF[1] - 12*s, shF[0], shF[1] + 18*s, [[0, AL], [1, AD]]);
    const pa = (P.fu*.25)*D2R;
    for (let q = 2; q >= 0; q--){ t.fillStyle = q ? sh(A, -.15*q) : lgrad(t, shF[0], shF[1] - 14*s, shF[0], shF[1] + 22*s, [[0, AL], [1, AD]]);
      t.beginPath(); t.ellipse(shF[0] - 1*s + q*3*s*S(pa), shF[1] + 5*s*ps + q*6*s*ps, 19*s*big*ps, 14*s*big*ps, pa, Math.PI*1.0, Math.PI*2.05); t.closePath(); t.fill();
      t.strokeStyle = T; t.lineWidth = (q ? 1.6 : 2.8)*s; t.beginPath(); t.ellipse(shF[0] - 1*s + q*3*s*S(pa), shF[1] + 5*s*ps + q*6*s*ps, 19*s*big*ps, 14*s*big*ps, pa, Math.PI*1.0, Math.PI*2.05); t.stroke(); }
    if (d.helm === "general" || d.lion){ circ(t, shF[0] - 2*s, shF[1] - 2*s, 4.5*s, T); }
    // 앞팔 · 무기
    const wA = P.w*D2R;
    const behindW = wp === "bow" || wp === "spear" || wp === "halberd" || wp === "guandao";
    if (!behindW){ limb(t, ...shF, ...fe, 13*s*big, 11*s*big, robe ? CL : AD, "rgba(255,255,255,.2)"); limb(t, ...fe, ...fh, 11*s*big, 9*s, robe ? sh(CL, .1) : A, "rgba(255,255,255,.22)"); }
    weapon(t, wp, fh[0], fh[1], wA, Object.assign({draw: wp === "bow" && pn === "atk0"}, d.wd || {}, {trim: T}), s);
    if (behindW){ limb(t, ...shF, ...fe, 13*s*big, 11*s*big, robe ? CL : AD, "rgba(255,255,255,.2)"); limb(t, ...fe, ...fh, 11*s*big, 9*s, robe ? sh(CL, .1) : A, "rgba(255,255,255,.22)"); }
    circ(t, ...fh, 5.5*s, sh(SK, -.08)); limb(t, fe[0] + (fh[0] - fe[0])*.4, fe[1] + (fh[1] - fe[1])*.4, fe[0] + (fh[0] - fe[0])*.9, fe[1] + (fh[1] - fe[1])*.9, 12.5*s*big, 11.5*s, sh(A, -.45), "rgba(255,255,255,.18)");
    { const ax2 = fe[0] + (fh[0] - fe[0])*.42, ay2 = fe[1] + (fh[1] - fe[1])*.42, an = Math.atan2(fh[1] - fe[1], fh[0] - fe[0]) + Math.PI/2; t.strokeStyle = T; t.lineWidth = 2.6*s; t.beginPath(); t.moveTo(ax2 + C(an)*6.5*s*big, ay2 + S(an)*6.5*s*big); t.lineTo(ax2 - C(an)*6.5*s*big, ay2 - S(an)*6.5*s*big); t.stroke(); } // 팔 보호대 띠
    if (wp === "bow" && (pn === "atk0" || pn === "atk1")){ /* 시위 손 */ circ(t, fh[0] - 30*s, fh[1], 5*s, SK); }
  }

  /* ---------- 짐승 ---------- */
  function wolf(t, d, pn, ox, oy, s){
    const col = d.col || "#868e96", dk = sh(col, -.4), lt = sh(col, .3), f = pn.startsWith("walk") ? +pn[4] : 0, atk = pn === "atk1";
    const by = oy - 52*s, bx = ox - 6*s, sw = [[18, -14, -10, 14], [6, -6, 0, 0], [-16, 14, 12, -12], [-6, 6, 0, 0]][f];
    // 꼬리
    t.fillStyle = d.mane || dk; t.beginPath(); t.moveTo(bx - 34*s, by - 4*s); t.quadraticCurveTo(bx - 70*s, by - 16*s + f*2*s, bx - 74*s, by + 14*s); t.quadraticCurveTo(bx - 56*s, by + 4*s, bx - 30*s, by + 10*s); t.fill();
    // 다리
    [[bx - 26*s, sw[0], dk], [bx + 26*s, sw[2], dk], [bx - 18*s, sw[1], col], [bx + 32*s, sw[3], col]].forEach(([lx, a, c]) => { const k = [lx + S(a*D2R)*24*s, by + 20*s + C(a*D2R)*20*s]; limb(t, lx, by + 6*s, ...k, 12*s, 8*s, c); limb(t, ...k, k[0] + 4*s, oy - 2*s, 8*s, 7*s, c); poly(t, [[k[0] - 2*s, oy - 5*s], [k[0] + 12*s, oy - 4*s], [k[0] + 12*s, oy], [k[0] - 2*s, oy]], "#1a1423"); });
    // 몸
    t.fillStyle = lgrad(t, 0, by - 22*s, 0, by + 22*s, [[0, lt], [.5, col], [1, dk]]); t.beginPath(); t.ellipse(bx, by, 44*s, 20*s, -.05, 0, 7); t.fill();
    t.fillStyle = d.mane || dk; t.beginPath(); t.moveTo(bx + 12*s, by - 18*s); for (let k = 0; k < 7; k++) t.lineTo(bx + 18*s + k*5*s, by - 24*s + (k % 2)*8*s); t.lineTo(bx + 46*s, by + 10*s); t.lineTo(bx + 20*s, by + 6*s); t.fill();
    // 머리
    const hx = bx + 50*s, hy = by - 18*s;
    t.fillStyle = lgrad(t, hx, hy - 16*s, hx, hy + 16*s, [[0, lt], [1, col]]); t.beginPath(); t.moveTo(hx - 14*s, hy - 12*s); t.lineTo(hx + 8*s, hy - 10*s); t.lineTo(hx + 30*s, hy + (atk ? -2 : 2)*s); t.lineTo(hx + 30*s, hy + 8*s); t.lineTo(hx + 4*s, hy + 16*s); t.lineTo(hx - 14*s, hy + 10*s); t.closePath(); t.fill();
    if (atk){ poly(t, [[hx + 6*s, hy + 8*s], [hx + 30*s, hy + 8*s], [hx + 26*s, hy + 18*s], [hx + 4*s, hy + 16*s]], "#7f1d1d"); t.fillStyle = "#fff"; for (let k = 0; k < 4; k++) poly(t, [[hx + 10*s + k*5*s, hy + 8*s], [hx + 12*s + k*5*s, hy + 13*s], [hx + 14*s + k*5*s, hy + 8*s]], "#fff"); }
    poly(t, [[hx - 10*s, hy - 10*s], [hx - 6*s, hy - 30*s], [hx + 4*s, hy - 10*s]], dk); poly(t, [[hx - 2*s, hy - 10*s], [hx + 4*s, hy - 28*s], [hx + 10*s, hy - 9*s]], col);
    circ(t, hx + 30*s, hy + 3*s, 3.5*s, "#1a1423");
    t.shadowColor = d.eye || "#ffd43b"; t.shadowBlur = 6*s; poly(t, [[hx + 2*s, hy - 3*s], [hx + 12*s, hy - 4*s], [hx + 9*s, hy + 1*s]], d.eye || "#ffd43b"); t.shadowBlur = 0;
  }
  function horse(t, d, pn, ox, oy, s){
    const col = d.col || "#3b2314", dk = sh(col, -.4), lt = sh(col, .25), f = pn.startsWith("walk") ? +pn[4] : 1, sw = [[24, -18, -14, 20], [8, -8, 0, 0], [-22, 18, 16, -16], [-8, 8, 0, 0]][f];
    const by = oy - 84*s, bx = ox - 4*s;
    t.fillStyle = d.mane || "#1a1423"; t.beginPath(); t.moveTo(bx - 52*s, by - 6*s); t.quadraticCurveTo(bx - 90*s, by + 4*s, bx - 84*s, by + 60*s); t.quadraticCurveTo(bx - 70*s, by + 20*s, bx - 48*s, by + 8*s); t.fill();
    [[bx - 40*s, sw[0], dk], [bx + 36*s, sw[2], dk], [bx - 30*s, sw[1], col], [bx + 44*s, sw[3], col]].forEach(([lx, a, c]) => { const k = [lx + S(a*D2R)*34*s, by + 50*s]; limb(t, lx, by + 10*s, ...k, 18*s, 10*s, c); limb(t, ...k, k[0] + S(a*D2R)*6*s, oy - 8*s, 9*s, 8*s, c); poly(t, [[k[0] - 6*s, oy - 9*s], [k[0] + 9*s, oy - 9*s], [k[0] + 10*s, oy], [k[0] - 7*s, oy]], "#1a1423"); });
    t.fillStyle = lgrad(t, 0, by - 30*s, 0, by + 30*s, [[0, lt], [.5, col], [1, dk]]); t.beginPath(); t.ellipse(bx, by + 8*s, 60*s, 28*s, 0, 0, 7); t.fill();
    // 말 갑옷
    if (d.barding){ t.fillStyle = lgrad(t, 0, by - 10*s, 0, by + 34*s, [[0, sh(d.barding, .25)], [1, sh(d.barding, -.35)]]); t.beginPath(); t.moveTo(bx - 50*s, by); t.lineTo(bx + 54*s, by - 6*s); t.lineTo(bx + 56*s, by + 30*s); t.lineTo(bx - 52*s, by + 32*s); t.closePath(); t.fill();
      t.strokeStyle = d.trim || "#f59f00"; t.lineWidth = 3*s; t.stroke(); for (let k = 0; k < 5; k++) circ(t, bx - 40*s + k*22*s, by + 32*s, 4*s, d.trim || "#f59f00"); }
    // 목 · 머리
    const nx = bx + 48*s, ny = by - 6*s; limb(t, nx - 8*s, ny + 6*s, nx + 26*s, ny - 50*s, 36*s, 22*s, col);
    t.fillStyle = lgrad(t, nx + 20*s, ny - 70*s, nx + 60*s, ny - 30*s, [[0, lt], [1, col]]); t.beginPath(); t.moveTo(nx + 14*s, ny - 64*s); t.lineTo(nx + 34*s, ny - 70*s); t.lineTo(nx + 66*s, ny - 38*s); t.lineTo(nx + 58*s, ny - 28*s); t.lineTo(nx + 22*s, ny - 40*s); t.closePath(); t.fill();
    poly(t, [[nx + 20*s, ny - 64*s], [nx + 22*s, ny - 80*s], [nx + 30*s, ny - 66*s]], col);
    t.fillStyle = d.mane || "#1a1423"; t.beginPath(); t.moveTo(nx + 18*s, ny - 66*s); t.quadraticCurveTo(nx - 4*s, ny - 40*s, nx - 18*s, ny + 4*s); t.lineTo(nx - 4*s, ny + 2*s); t.quadraticCurveTo(nx + 8*s, ny - 36*s, nx + 26*s, ny - 60*s); t.fill();
    circ(t, nx + 38*s, ny - 56*s, 3*s, "#1a1423");
    if (d.barding){ poly(t, [[nx + 16*s, ny - 64*s], [nx + 40*s, ny - 68*s], [nx + 58*s, ny - 44*s], [nx + 46*s, ny - 42*s]], sh(d.barding, .1)); }
    t.strokeStyle = "#a61e1e"; t.lineWidth = 2*s; t.beginPath(); t.moveTo(nx + 56*s, ny - 34*s); t.lineTo(nx + 6*s, ny - 26*s); t.stroke();
  }
  /* 젤리 슬라임 (말랑말랑) */
  function blob(t, d, pn, ox, oy, s){
    const col = d.col || "#74c0fc", sq = pn.startsWith("walk") ? [1.1, .92, .96, 1.04][+pn[4]] : pn === "atk1" ? .8 : pn === "jump" ? 1.2 : 1, w = 46*s/Math.sqrt(sq), h = 40*s*sq;
    t.fillStyle = lgrad(t, ox, oy - h*2, ox, oy, [[0, sh(col, .45)], [.6, col], [1, sh(col, -.3)]]);
    t.beginPath(); t.moveTo(ox - w, oy); t.quadraticCurveTo(ox - w*1.05, oy - h*1.5, ox, oy - h*1.8); t.quadraticCurveTo(ox + w*1.05, oy - h*1.5, ox + w, oy); t.closePath(); t.fill();
    t.fillStyle = "rgba(255,255,255,.55)"; t.beginPath(); t.ellipse(ox - w*.4, oy - h*1.25, w*.22, h*.18, -.5, 0, 7); t.fill();
    [[ox + w*.15, 1], [ox + w*.55, .85]].forEach(([cx, k]) => { t.fillStyle = "#1a1033"; t.beginPath(); t.ellipse(cx, oy - h*.85, 5*s*k, 8*s, 0, 0, 7); t.fill(); circ(t, cx + 1.5*s, oy - h*.95, 2*s, "#fff"); });
    t.strokeStyle = "#1a1033"; t.lineWidth = 2*s; t.beginPath(); t.arc(ox + w*.35, oy - h*.55, 5*s, .2, Math.PI - .2); t.stroke();
  }
  /* 동양 용 (구불구불 긴 몸) */
  function dragon(t, d, pn, ox, oy, s, fr){
    const col = d.col || "#e03131", dk = sh(col, -.45), lt = sh(col, .3), bel = "#ffe8b0", open = pn === "atk1" || pn === "atk2";
    const pts = []; for (let k = 0; k <= 40; k++){ const u = k/40; pts.push([ox - 150*s + u*250*s, oy - 120*s - S(u*Math.PI*2.2 + fr*.6)*42*s*(1 - u*.4) - u*40*s]); }
    const wAt = k => (10 + 28*Math.sin(Math.PI*Math.min(1, k/40*1.15)))*s;
    // 몸 (뒤에서 앞으로 원을 이어 그리기)
    for (let k = 0; k < pts.length; k++){ const [x, y] = pts[k], r = wAt(k);
      t.fillStyle = lgrad(t, x, y - r, x, y + r, [[0, lt], [.55, col], [1, dk]]); t.beginPath(); t.arc(x, y, r, 0, 7); t.fill();
      if (k % 3 === 0){ t.fillStyle = bel; t.beginPath(); t.ellipse(x, y + r*.55, r*.7, r*.35, 0, 0, 7); t.fill(); }
      if (k % 2 === 0 && k > 3){ poly(t, [[x - r*.3, y - r*.9], [x + r*.1, y - r*1.5], [x + r*.4, y - r*.85]], d.fin || "#ffd43b"); } }
    // 발톱 두 쌍
    [10, 26].forEach(k => { const [x, y] = pts[k]; limb(t, x, y, x + 14*s, y + 44*s, 12*s, 8*s, dk); [-1, 0, 1].forEach(q => limb(t, x + 14*s, y + 44*s, x + 22*s + q*6*s, y + 52*s, 4*s, 2*s, "#f8f9fa")); });
    // 머리
    const [hx, hy] = pts[40], R = 46*s;
    t.fillStyle = d.mane || "#f8f0e3"; t.beginPath(); t.moveTo(hx - R*.8, hy - R*.6); for (let k = 0; k < 7; k++) t.lineTo(hx - R*(1.4 + (k % 2)*.5), hy - R*.8 + k*R*.35); t.lineTo(hx - R*.6, hy + R*.8); t.fill();
    t.fillStyle = lgrad(t, hx, hy - R, hx, hy + R, [[0, lt], [1, col]]); t.beginPath(); t.moveTo(hx - R*.9, hy - R*.7); t.quadraticCurveTo(hx + R*.2, hy - R*1.1, hx + R*1.7, hy - R*.35); t.lineTo(hx + R*1.75, hy + (open ? -.05 : .1)*R); t.lineTo(hx + R*.2, hy + R*.15); t.lineTo(hx - R*.8, hy + R*.5); t.closePath(); t.fill();
    t.fillStyle = col; t.beginPath(); t.moveTo(hx + R*.1, hy + R*(open ? .35 : .18)); t.lineTo(hx + R*1.6, hy + R*(open ? .75 : .25)); t.lineTo(hx + R*1.4, hy + R*(open ? .95 : .45)); t.lineTo(hx - R*.4, hy + R*.75); t.closePath(); t.fill();
    if (open){ poly(t, [[hx + R*.3, hy + R*.15], [hx + R*1.7, hy], [hx + R*1.55, hy + R*.72], [hx + R*.2, hy + R*.4]], "#7f1d1d"); for (let k = 0; k < 5; k++) poly(t, [[hx + R*(.5 + k*.25), hy + R*.1], [hx + R*(.58 + k*.25), hy + R*.3], [hx + R*(.66 + k*.25), hy + R*.08]], "#fff"); }
    // 뿔 · 수염 · 눈
    t.fillStyle = d.horn || "#ffe066"; [[-.3, -1.9], [.1, -1.6]].forEach(([a, b]) => { t.beginPath(); t.moveTo(hx + R*a, hy - R*.7); t.quadraticCurveTo(hx + R*(a - .8), hy + R*(b + .4), hx + R*(a - 1.2), hy + R*b); t.quadraticCurveTo(hx + R*(a - .5), hy + R*(b + .7), hx + R*(a + .25), hy - R*.6); t.fill(); });
    t.strokeStyle = d.horn || "#ffe066"; t.lineWidth = 2.5*s; t.lineCap = "round"; [[0, 1], [.2, 1.3]].forEach(([q, l]) => { t.beginPath(); t.moveTo(hx + R*1.3, hy + R*(.05 + q)); t.quadraticCurveTo(hx + R*1.6, hy + R*(.9 + q), hx + R*(1.0 + l*.2), hy + R*(1.5 + q)); t.stroke(); });
    t.shadowColor = "#ffe066"; t.shadowBlur = 10*s; poly(t, [[hx + R*.35, hy - R*.45], [hx + R*.85, hy - R*.55], [hx + R*.7, hy - R*.25]], "#fff3bf"); t.shadowBlur = 0; circ(t, hx + R*.68, hy - R*.42, R*.08, "#1a1423");
  }

  /* ---------- 테두리 (스티커처럼 또렷하게) ---------- */
  function ink(c, w){
    const t = c.getContext("2d"), W = c.width, H = c.height, s2 = document.createElement("canvas"); s2.width = W; s2.height = H; const q = s2.getContext("2d");
    q.drawImage(c, 0, 0); q.globalCompositeOperation = "source-in"; q.fillStyle = INK; q.fillRect(0, 0, W, H);
    t.save(); t.setTransform(1, 0, 0, 1, 0, 0); t.globalCompositeOperation = "destination-over";
    for (let a = 0; a < 8; a++) t.drawImage(s2, Math.round(C(a*Math.PI/4)*w), Math.round(S(a*Math.PI/4)*w)); t.restore();
  }

  /* ---------- 그림 기억 ---------- */
  const CACHE = new Map(); let CK = 0;
  /* kind: "war" | "wolf" | "horse+war" | "dragon" · 반환 캔버스: c.w/c.h (화면 크기) · c.ax/c.ay (발 위치) */
  function spr(key, kind, d, pn, scale, opt = {}){
    const k = NG.k || 1; if (k !== CK){ CACHE.clear(); CK = k; }
    const K = key + "|" + pn + "|" + scale; let c = CACHE.get(K); if (c){ if (CACHE.size > 60){ CACHE.delete(K); CACHE.set(K, c); } return c; }
    while (CACHE.size >= 170) CACHE.delete(CACHE.keys().next().value);   // ⚡ 오래 안 쓴 그림부터 비워요 (메모리 아끼기)
    const box = kind === "dragon" ? [460, 300, 230, 290] : kind === "rider" ? [470, 360, 190, 348] : kind === "wolf" ? [220, 150, 110, 142] : kind === "blob" ? [130, 110, 65, 104] : [400, 300, 170, 286];
    const [bw, bh, ax, ay] = box.map(v => v*scale);
    c = document.createElement("canvas"); c.width = Math.ceil(bw*k); c.height = Math.ceil(bh*k);
    const t = c.getContext("2d"); t.scale(k, k);
    const lie = pn === "lie", pose = lie ? "hurt" : pn;
    let fx = ax, fy = ay;
    if (lie){ if (kind === "war"){ t.translate(ax + 92*scale, ay - 16*scale); t.rotate(-Math.PI/2); fx = 0; fy = 0; } else { t.translate(ax, ay); t.scale(1, .62); t.translate(-ax, -ay); } }
    if (kind === "war") body(t, d, pose, fx, fy, scale);
    else if (kind === "wolf") wolf(t, d, lie ? "idle0" : pose, fx, fy, scale);
    else if (kind === "blob") blob(t, d, lie ? "idle0" : pose, fx, fy, scale);
    else if (kind === "rider"){ horse(t, d.horse || {}, lie || pose === "hurt" ? "idle0" : pose.startsWith("walk") ? pose : "walk1", fx, fy, scale); body(t, d, pose.startsWith("atk") ? pose : pose === "hurt" ? "hurt" : "ride", fx - 4*scale, fy - 70*scale, scale); }
    else if (kind === "dragon") dragon(t, d, pose, fx, fy, scale, opt.fr || 0);
    if (opt.cloud){ cloud(t, ax, ay, scale, opt.cloud === "dark"); }
    ink(c, Math.max(1.5, 2.4*scale*k));
    c.w = bw; c.h = bh; c.ax = ax; c.ay = ay; CACHE.set(K, c); return c;
  }
  function cloud(t, x, y, s, dark){ const g = t.createLinearGradient(0, y - 30*s, 0, y + 20*s); g.addColorStop(0, dark ? "#6b7280" : "#ffffff"); g.addColorStop(1, dark ? "#1f2937" : "#a5d8ff");
    t.fillStyle = g; [[-50, 4, 22], [-20, -6, 30], [16, -2, 28], [48, 6, 20], [-6, 10, 26]].forEach(([dx, dy, r]) => { t.beginPath(); t.arc(x + dx*s, y + dy*s, r*s, 0, 7); t.fill(); });
    t.fillStyle = dark ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.7)"; t.beginPath(); t.ellipse(x - 14*s, y - 22*s, 22*s, 6*s, -.1, 0, 7); t.fill(); }
  return {spr, body, wolf, horse, dragon, cloud, ink, POSE, sh};
})();

/* ---------- 🧑‍🤝‍🧑 장수 · 적 디자인 표 (모두 오리지널) ---------- */
const WDEF = {
  /* 용사 대모험 직업 */
  kn: {n: "청룡 검객", weapon: "sword", armor: "#1f4e9c", trim: "#dbe4ff", cloth: "#e7f5ff", skin: "#f3cfae", hair: "#141022", helm: "crown", cape: "#173a7a", sash: "#74c0fc", wd: {glow: "#74c0fc", tassel: "#4dabf7"}},
  ln: {n: "은빛 창장수", weapon: "spear", armor: "#d9dee6", trim: "#f59f00", cloth: "#0f766e", skin: "#f3cfae", hair: "#141022", helm: "general", plume: "#f8f9fa", cape: "#e9ecef", sash: "#14b8a6", wd: {glow: "#e6fcf5"}},
  ar: {n: "바람 궁장", weapon: "bow", armor: "#3f6212", trim: "#d4a017", cloth: "#7c4a1e", skin: "#f3cfae", hair: "#2a1a10", helm: "band", band: "#65a30d", sash: "#a3e635"},
  wz: {n: "자색 책사", weapon: "fan", armor: "#5b21b6", trim: "#facc15", cloth: "#4c1d95", skin: "#f6d7bb", hair: "#141022", helm: "scholar", robe: 1, sash: "#c084fc", wd: {glow: "#e9d5ff"}},
  /* 졸개 */
  gob:   {weapon: "dao", armor: "#7c5c3b", trim: "#b08968", cloth: "#a8742c", skin: "#d9a47c", hair: "#2a1a10", helm: "band", band: "#facc15", angry: 1, tail: false},
  gob2:  {weapon: "dao", armor: "#4b3a2a", trim: "#facc15", cloth: "#92400e", skin: "#c98b62", hair: "#1a1423", helm: "band", band: "#fde047", angry: 1, beard: "#1a1423", shield: "#854d0e", big: 1},
  skel:  {weapon: "dao", armor: "#475569", trim: "#94a3b8", cloth: "#334155", skin: "#cbd5e1", helm: "soldier", plume: "#64748b", ghost: 1, shield: "#3f3f46", eyeGlow: "#7dd3fc"},
  skar:  {weapon: "bow", armor: "#475569", trim: "#94a3b8", cloth: "#334155", skin: "#cbd5e1", helm: "soldier", plume: "#64748b", ghost: 1, eyeGlow: "#7dd3fc"},
  igob:  {weapon: "club", armor: "#64748b", trim: "#e2e8f0", cloth: "#475569", skin: "#e8c2a0", hair: "#3b2a20", helm: "fur", angry: 1, beard: "#5c4033"},
  liz:   {weapon: "spear", armor: "#7f1d1d", trim: "#facc15", cloth: "#57534e", skin: "#9a5b32", hair: "#1a1423", helm: "skull", angry: 1, big: 1},
  lskel: {weapon: "dao", armor: "#1f1f1f", trim: "#fb923c", cloth: "#431407", skin: "#d6a77a", helm: "soldier", plume: "#ea580c", ghost: 1, eyeGlow: "#fdba74", wd: {glow: "#fb923c"}},
  /* 귀여운 졸개 */
  shroom: {weapon: "club", armor: "#a16207", trim: "#fde68a", cloth: "#78350f", skin: "#f5deb3", hair: "#5c3a1e", helm: "shroom", cap: "#e8590c", tail: false},
  blob:   {col: "#74c0fc"},
  /* 짐승 */
  wolf:  {col: "#868e96", mane: "#495057"}, iwolf: {col: "#e7f5ff", mane: "#a5d8ff", eye: "#4dabf7"}, nwolf: {col: "#343a40", mane: "#141022", eye: "#ff6b6b"},
  /* 보스 */
  orc:   {weapon: "axe", armor: "#5c3d2e", trim: "#facc15", cloth: "#3b2314", skin: "#c98b62", hair: "#141022", helm: "horned", beard: "#141022", angry: 1, big: 1, cape: "#7f1d1d"},
  korc:  {weapon: "axe", armor: "#1e2a5a", trim: "#fde047", cloth: "#111827", skin: "#a9b4c2", hair: "#0b0b14", helm: "horned", beard: "#0b0b14", angry: 1, big: 1, cape: "#312e81", wd: {glow: "#fde047"}},
  rider: {weapon: "halberd", armor: "#b91c1c", trim: "#facc15", cloth: "#7f1d1d", skin: "#e8b48f", hair: "#141022", helm: "general", plume: "#facc15", angry: 1, cape: "#991b1b", horse: {col: "#3b2314", mane: "#141022", barding: "#7f1d1d", trim: "#facc15"}},
  lrider:{weapon: "guandao", armor: "#ea580c", trim: "#fde047", cloth: "#7c2d12", skin: "#e8b48f", hair: "#141022", helm: "general", plume: "#fde047", angry: 1, beard: "#141022", cape: "#c2410c", wd: {glow: "#fdba74"}, horse: {col: "#1c1917", mane: "#ea580c", barding: "#431407", trim: "#fb923c"}},
  yeti:  {weapon: "club", armor: "#cbd5e1", trim: "#38bdf8", cloth: "#64748b", skin: "#d9b99b", hair: "#f8fafc", helm: "fur", beard: "#f8fafc", angry: 1, big: 1, cape: "#94a3b8"},
  drag:  {col: "#e03131", fin: "#ffd43b", horn: "#ffe066", mane: "#f8f0e3"},
  kdrag: {col: "#f59f00", fin: "#fff3bf", horn: "#ffffff", mane: "#fff9db"}
};
