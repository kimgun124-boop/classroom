/* =====================================================================
   ⚾ 동물 프로야구 (2026.11.25) — 3D 야구 대결
   - 🎯 투수: 공 종류를 고르고 스트라이크존을 톡 → 링이 작을 때 ⚾ 던지기 (작을수록 정확)
   - 🏏 타자: 공이 올 곳을 보고 알맞은 때에 화면을 톡! (빨리 치면 당겨 치고, 늦으면 밀어 쳐요)
   - 수비수·주자는 카드 능력(파워·정확·주루·수비·어깨 / 구속·제구·변화·체력)대로 움직여요
   - 3D는 가벼운 원근 그리기(캔버스)로: 타석 화면은 한 번 그려 기억해 붙이고, 공이 날아갈 때만 경기장을 다시 그려요
   - 🌐 다른 기기와: 신청한 친구(홈 팀) 기기가 심판 — 스윙은 '내 기기에서 본 때'를 보내서 늦게 도착해도 공정해요
   ===================================================================== */
NG.defs.ab = () => {
  const W = 1280, H = 720, INN = 3, NEAR = .35, DT = 1/60;
  const cpu = () => NG.opt.cpu, lv = () => NG.opt.lv ?? 1, net = () => NG.opt.net, two = () => !cpu() && !net();
  const isLocal = t => two() || (net() ? (net() === "host" ? t === 0 : t === 1) : t === 0);   // 이 기기에서 조종하는 팀
  const human = t => !(cpu() && t === 1);
  const remote = t => net() === "host" && t === 1;
  const PT = ABC.PT, TC = ["#ff6b6b", "#4dabf7"], TN = ["🏠", "✈️"];
  const BASE = [[0, 0], [19.4, 19.4], [0, 38.8], [-19.4, 19.4]];
  const fenceR = a => 84 + 16*Math.cos(2*a), FH = 3.2;
  const FP = {P: [0, 17.5], C: [0, -1.4], "1B": [16, 23], "2B": [7.5, 33], SS: [-7.5, 33], "3B": [-16, 23], LF: [-28, 60], CF: [0, 71], RF: [28, 60]};
  const ZX = .25, ZY0 = .48, ZY1 = 1.08, REL = [.28, 1.85, 17.1];
  const rnd = (a = 1, b) => b === undefined ? Math.random()*a : a + Math.random()*(b - a);
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const bpos = p => { const i = Math.floor(clamp(p, 0, 3.999)), f = clamp(p, 0, 4) - i, a = BASE[i], b = BASE[(i + 1) % 4]; return [a[0] + (b[0] - a[0])*f, a[1] + (b[1] - a[1])*f]; };

  /* ---------- 팀 ---------- */
  const dOf = q => { const L = ABC.team(q), lvm = {}; Object.values(L).forEach(id => { lvm[id] = ABC.lvOf(q, id); }); return {L, lv: lvm}; };
  const TCache = {};
  function teamOf(D){ const k = JSON.stringify(D); if (TCache[k]) return TCache[k];
    const C = {}; ABC.POS.forEach(p => { const c = ABC.BY[D.L[p]] || ABC.ST[p], s = ABC.stat(c, c.r < 0 ? 0 : (D.lv[c.id] || 0)); if (c.pos !== p) s.def = Math.max(25, s.def - 8); s.at = p; C[p] = s; });
    const t = {C, ord: ABC.order(C), P: C.P, pow: ABC.power(C)}; return (TCache[k] = t); }
  const defStat = (c, k) => c[k] != null ? c[k] : 60;

  /* ---------- 상태 (심판 기기) ---------- */
  let S, TM = [null, null], remD = null, inp = {pc: 0, sw: 0}, swing = null, cpuSw = null, ball = null, Fd = [], Rn = [], thr = null, play = null, fT = 0, pid = 0, line = {};
  let sel = {pt: "fb", x: 0, y: .78, set: false}, ringT = 0;
  function freshS(){ return {ph: "intro", pt: 0, inn: 1, top: true, o: 0, b: 0, s: 0, sc: [0, 0], h: [0, 0], bo: [0, 0], bs: [0, 0, 0], msg: 0, pz: 0, kmh: 0, tm: [null, null], pc: [0, 0], ln: {}}; }
  const off = () => S.top ? 1 : 0, dfn = () => S.top ? 0 : 1;
  const batter = () => TM[off()].ord[S.bo[off()] % TM[off()].ord.length], pitcher = () => TM[dfn()].P;
  function say(t, sub = "", c = "#fff", f = 90, big = 0){ S.msg = [t, sub, c, f, big]; }

  /* ---------- 공 던지기 ---------- */
  function fatigue(){ const P = pitcher(); return clamp((S.pc[dfn()] - (25 + P.sta*.35))/40, 0, 1); }
  function mkPitch(type, cx, cy, acc){
    const P = pitcher(), t = PT[type] || PT.fb, fat = fatigue();
    const kmh = (100 + P.vel*(1 - fat*.08)*.5)*t.sp, FT = 17.4/(kmh/3.6)*1.55;
    const sig = (.16 - P.ctl*(1 - fat*.25)*.0013)*(.55 + clamp(acc, 0, 1)*1.1);
    const Tx = cx + gauss()*sig, Ty = cy + gauss()*sig*.85, bk = .55 + P.brk/110, Bx = t.B[0]*bk, By = t.B[1]*bk;
    S.pc[dfn()]++;
    return [++pid, type, +Tx.toFixed(3), +Ty.toFixed(3), +(Tx - Bx).toFixed(3), +(Ty - By).toFixed(3), +Bx.toFixed(3), +By.toFixed(3), +FT.toFixed(3), +(.1 + (1 - t.sp)*.55).toFixed(3), Math.round(kmh), 0];
  }
  /* pz: [id, 종류, Tx, Ty, Ax, Ay, Bx, By, FT, 솟음, km/h, 지난 시간] */
  function pzPos(pz, t){
    const FT = pz[8], u = t/FT;
    if (u <= 1){ const x = REL[0] + (pz[4] - REL[0])*u + pz[6]*u*u, y = REL[1] + (pz[5] - REL[1])*u + pz[7]*u*u + pz[9]*4*u*(1 - u); return [x, y, REL[2]*(1 - u)]; }
    const e = pzPos(pz, FT), k = (u - 1)*REL[2]; return [e[0] + (pz[6]*.4)*(u - 1), e[1] + (pz[7]*.6 - .2)*(u - 1), -k];
  }
  const inZone = (x, y) => Math.abs(x) <= ZX && y >= ZY0 && y <= ZY1;
  function startPitch(type, x, y, acc){ S.pz = mkPitch(type, x, y, acc); S.ph = "wind"; S.pt = 0; swing = null; cpuSw = null; sel.set = false;
    if (!human(off())) planCpuSwing(); }
  function cpuPitch(){
    const P = pitcher(), L = P.pit, b = S.b, s = S.s, l = lv();
    const type = Math.random() < .42 ? "fb" : L[1 + Math.floor(Math.random()*(L.length - 1))] || "fb";
    let x, y; const side = Math.random() < .5 ? -1 : 1;
    if (b === 3){ x = rnd(-.12, .12); y = rnd(.62, .95); }
    else if (s === 2 && b < 2 && Math.random() < .45){ x = side*rnd(.27, .38); y = rnd(.35, .6); }
    else if (Math.random() < .25){ x = side*rnd(.24, .34); y = rnd(.45, 1.1); }
    else { x = side*rnd(.05, .2); y = rnd(.55, 1.02); }
    startPitch(type, x, y, [.75, .5, .3][l] + rnd(.25));
  }

  /* ---------- 치기 ---------- */
  function contact(ts, sx, sy, B, pz){
    const Wt = .095 + B.con*.0009, Rr = .12 + B.con*.0012, dt = ts - pz[8], dx = sx - pz[2], dy = sy - pz[3], d = Math.hypot(dx, dy*1.15);
    if (Math.abs(dt) > Wt || d > Rr) return {hit: false};
    const q = clamp(1 - .45*(dt/Wt)**2 - .5*(d/Rr)**2, .1, 1), ev = (28 + B.pow*.28)*(.62 + .38*q);
    const la = clamp(19 - dy*150 + (1 - q)*rnd(-26, 20) + rnd(-7, 7), -20, 70);
    const pull = B.hand === "L" ? 1 : -1, sp = pull*(-dt/Wt)*40 + rnd(-9, 9);
    return {hit: true, q, ev, la, sp};
  }
  function planCpuSwing(){
    const pz = S.pz, B = batter(), l = lv(), Tz = inZone(pz[2], pz[3]), s = S.s;
    let p = Tz ? (s === 2 ? .92 : .7)*[.85, 1, 1.05][l] : (s === 2 ? .4 : .24)*[1.25, 1, .7][l];
    if (S.b === 3 && !Tz) p *= .5; if (Math.random() > p){ cpuSw = null; return; }
    const Wt = .095 + B.con*.0009, Rr = .12 + B.con*.0012, k = [.78, .62, .5][l], brk = pz[1] !== "fb" && pz[1] !== "ts";
    const fool = brk ? rnd(.15, .45) : 0;
    cpuSw = {t: pz[8] + gauss()*Wt*k + (brk ? gauss()*.03 : 0), x: pz[2] + gauss()*Rr*k*.8 + (pz[4] - pz[2])*fool*.6, y: pz[3] + gauss()*Rr*k*.8 + (pz[5] - pz[3])*fool};
  }
  function doSwing(ts, x, y){
    if (S.ph !== "fly" || swing) return; const pz = S.pz;
    swing = {t: ts, x, y, res: contact(ts, x, y, batter(), pz), done: false}; S.sw = [+ts.toFixed(3), +x.toFixed(2), +y.toFixed(2), swing.res.hit ? 1 : 0];
    tone(300, 120, .1, "sawtooth", .05);
  }

  /* ---------- 볼카운트 ---------- */
  function lineOf(c){ const k = off() + ":" + c.id; return S.ln[k] || (S.ln[k] = [0, 0]); }
  function endPA(kind, hit){ const B = batter(); const L = lineOf(B); if (kind !== "walk") L[0]++; if (hit) L[1]++; S.bo[off()]++; S.b = S.s = 0; }
  function callPitch(k){
    if (k === "ball"){ S.b++; if (S.b >= 4){ endPA("walk"); walk(); return; } say("볼", `${S.b}볼 ${S.s}스트라이크`, "#a5d8ff", 55); }
    else if (k === "foul"){ if (S.s < 2) S.s++; say("파울!", `${S.b}볼 ${S.s}스트라이크`, "#ffe066", 60); }
    else { S.s++; if (S.s >= 3){ say("삼진 아웃!", k === "look" ? "🧍 보고만 있었어요" : "💨 헛스윙", "#ff8787", 100, 1); endPA("k"); S.o++; tone(500, 200, .3, "square", .08); S.ph = "res"; S.cd = 100; return; }
      say(k === "look" ? "스트라이크!" : "헛스윙!", `${S.b}볼 ${S.s}스트라이크`, "#ffd8a8", 55); }
    S.ph = "res"; S.cd = 60;
  }
  function walk(){
    const bs = S.bs, B = batter(); let runs = 0;
    const nb = [B.id + "/" + off(), bs[0], bs[1], bs[2]];
    if (bs[0]){ if (bs[1]){ if (bs[2]) runs++; S.bs = [nb[0], bs[0], bs[1]]; } else S.bs = [nb[0], bs[0], bs[2]]; } else S.bs = [nb[0], bs[1], bs[2]];
    S.sc[off()] += runs; say("볼넷!", runs ? `밀어내기 ${runs}점!` : "1루로 걸어가요", "#a5d8ff", 90); S.ph = "res"; S.cd = 90;
  }

  /* ---------- 공이 날아가요 (경기장) ---------- */
  function ballStep(B, dt){
    if (B.dead) return; B.vy -= 9.8*dt; const dr = Math.pow(B.y > .05 ? .9965 : .982, dt*60); B.vx *= dr; B.vz *= dr; if (B.y > .05) B.vy *= Math.pow(.9992, dt*60);
    B.x += B.vx*dt; B.y += B.vy*dt; B.z += B.vz*dt;
    if (B.y < 0){ B.y = 0; if (!B.land){ B.land = [B.x, B.z]; } if (B.vy < -1.2){ B.vy = -B.vy*.36; B.vx *= .72; B.vz *= .72; B.bn = (B.bn || 0) + 1; } else B.vy = 0; }
    const r = Math.hypot(B.x, B.z), a = Math.atan2(B.x, B.z);
    if (Math.abs(a) <= Math.PI/4 + .01 && r >= fenceR(a) && !B.out){
      if (B.y > FH && !B.land){ B.hr = 1; B.out = 1; } else { const nx = B.x/r, nz = B.z/r, vr = B.vx*nx + B.vz*nz; if (vr > 0){ B.vx -= 1.4*vr*nx; B.vz -= 1.4*vr*nz; B.x -= nx*.3; B.z -= nz*.3; B.wall = 1; } }
    }
    if (r > 140) B.dead = 1;
  }
  function predict(B0){ const B = Object.assign({}, B0), P = []; for (let k = 0; k < 300 && !B.dead; k++){ for (let j = 0; j < 2; j++) ballStep(B, DT); P.push([k*2*DT, B.x, B.y, B.z, B.land ? 1 : 0, B.hr || 0]); if (B.hr) break; } return P; }
  function chase(){
    const P = predict(ball); let best = null;
    Fd.forEach(f => { if (f.p === "C") return; for (const [t, x, y, z, ld, hr] of P){ if (hr) break; if (y > 2.6) continue;
        const d = Math.hypot(x - f.x, z - f.z) - f.reach; if (d <= f.sp*Math.max(0, t - .5)){ if (!best || t < best.t) best = {f, t, x, z, air: !ld}; break; } } });
    Fd.forEach(f => f.chase = false); if (best){ best.f.chase = true; best.f.tx = best.x; best.f.tz = best.z; best.f.air = best.air; best.f.eta = best.t; }
    else { // 아무도 못 잡으면 가장 가까운 외야수가 쫓아가요
      const L = P.filter(p => p[4]).slice(-1)[0] || P[P.length - 1]; if (L){ const f = Fd.filter(f => f.p !== "C").sort((a, b) => Math.hypot(a.x - L[1], a.z - L[3]) - Math.hypot(b.x - L[1], b.z - L[3]))[0]; if (f){ f.chase = true; f.tx = L[1]; f.tz = L[3]; f.air = false; } } }
  }
  function startBIP(res){
    const B = batter(), la = res.la*Math.PI/180, sp = res.sp*Math.PI/180, h = res.ev*Math.cos(la);
    ball = {x: 0, y: S.pz[3], z: .6, vx: h*Math.sin(sp), vy: res.ev*Math.sin(la), vz: h*Math.cos(sp)};
    const D = TM[dfn()].C;
    Fd = ABC.POS.map(p => ({p, c: D[p], x: FP[p][0], z: FP[p][1], hx: FP[p][0], hz: FP[p][1], sp: 4.4 + defStat(D[p], "spd")*.03, reach: .65 + defStat(D[p], "def")*.006, chase: false, tx: FP[p][0], tz: FP[p][1], wait: 0, has: false}));
    const o = off(); Rn = [{c: B, tm: o, p: 0, b0: 0, tgt: 1, go: -.5, out: 0}];
    S.bs.forEach((r, i) => { if (r){ const [id] = r.split("/"); const c = TM[o].ord.find(x => x.id === id) || ABC.stat(ABC.BY[id] || ABC.ST.P); Rn.push({c, tm: o, p: i + 1, b0: i + 1, tgt: i + 1, go: 0, out: 0}); } });
    Rn.forEach(r => r.spd = 6.6 + defStat(r.c, "spd")*.032);
    thr = null; play = null; fT = 0; S.ph = "field"; S.pt = 0; chase(); S.sw = 0;
    if (window.__abLog) window.__abLog.push([Math.round(res.ev), Math.round(res.la), Math.round(res.sp), +res.q.toFixed(2), B.pow]);
    tone(1400, 600, .07, "square", .12); tone(180, 90, .12, "sawtooth", .1);
    const loud = res.q > .8 && res.ev > 34; if (loud) setTimeout(() => SFX.gold(), 60);
  }
  const airBall = () => !ball.land;
  function fieldStep(){
    fT += DT; ballStep(ball, DT);
    const outs = S.o, ground = ball.land || (ball.vy < 4 && ball.y < 1.5 && fT < .4);
    // 주자: 땅볼이면 바로, 뜬공이면 떨어질 때까지 기다려요 (2아웃이면 무조건 뛰어요)
    Rn.forEach(r => { if (r.out) return; if (r.b0 === 0){ r.go += DT; if (r.go < 0) return; }
      if (!play){ const go = r.b0 === 0 || outs === 2 || ground; r.tgt = go ? Math.min(4, Math.max(r.tgt, Math.floor(r.p) + 1)) : r.b0; }
      const d = r.tgt - r.p; if (Math.abs(d) > .002){ const st = r.spd*DT/27.43; r.p += Math.sign(d)*Math.min(Math.abs(d), st); } });
    // 담장 너머 → 홈런
    if (ball.hr && !play){ decide({hr: 1}); }
    // 파울 (처음 떨어진 곳이 선 밖)
    if (!play && ball.land && !ball.fc){ ball.fc = 1; const a = Math.atan2(ball.land[0], ball.land[1]), r = Math.hypot(ball.land[0], ball.land[1]); if (Math.abs(a) > Math.PI/4 && r > 1){ play = {foul: 1}; callPitch("foul"); return; } }
    if (Math.floor(fT*60) % 15 === 0 && !play) chase();
    // 수비수
    Fd.forEach(f => {
      let tx = f.hx, tz = f.hz;
      if (f.chase && !play){ const slow = Math.hypot(ball.vx, ball.vz) < 4 || Math.hypot(ball.x - f.x, ball.z - f.z) < 3; tx = f.air || !slow ? f.tx : ball.x; tz = f.air || !slow ? f.tz : ball.z; }
      else if (!f.has){ const cv = cover(f); if (cv){ tx = cv[0]; tz = cv[1]; } }
      if (f.has) { tx = f.x; tz = f.z; }
      const dx = tx - f.x, dz = tz - f.z, d = Math.hypot(dx, dz); if (d > .05){ const st = Math.min(d, f.sp*DT*(f.chase ? 1 : .8)); f.x += dx/d*st; f.z += dz/d*st; } else if (f.chase) f.wait += DT;
      if (f.chase && !play && ball.y < 2.6 && Math.hypot(ball.x - f.x, ball.z - f.z) < f.reach){
        if (airBall()){ const p = f.wait > .2 ? .975 : .45 + defStat(f.c, "def")*.0052;
          if (Math.random() < p){ f.has = true; decide({fly: 1, f}); }
          else { f.miss = (f.miss || 0) + 1; ball.land = [ball.x, ball.z]; ball.fc = 1; ball.vx *= .3; ball.vz *= .3; ball.vy = 1.5; say("앗! 놓쳤어요", "", "#ffa8a8", 50); f.chase = false; }
        } else { f.has = true; decide({gr: 1, f}); }
      }
    });
    if (thr){ thr.t += DT; const k = clamp(thr.t/thr.d, 0, 1); ball.x = thr.a[0] + (thr.b[0] - thr.a[0])*k; ball.z = thr.a[1] + (thr.b[1] - thr.a[1])*k; ball.y = 1.6 + Math.sin(k*Math.PI)*(1 + thr.d*2); ball.vx = ball.vy = ball.vz = 0; ball.dead = 1;
      if (k >= 1 && !thr.done){ thr.done = 1; tone(900, 700, .04, "square", .08); } }
    if (play && !play.fin){ const moving = Rn.some(r => !r.out && Math.abs(r.tgt - r.p) > .01); if ((!thr || thr.done) && !moving && fT > (play.hr ? 3.2 : 1)) finish(); }
    if (fT > 16 && !play) decide({gr: 1, f: Fd.find(f => f.chase) || Fd[0]});
  }
  function cover(f){ if (f.p === "1B") return BASE[1]; if (f.p === "C") return [0, -.8]; if (f.p === "P") return [0, 17.5];
    const right = ball.x > 0; if (f.p === "2B" && !right) return [3, 37]; if (f.p === "SS" && right) return [-3, 37]; if (f.p === "3B") return [-17.5, 19.6]; return null; }
  /* 결과 정하기 (공을 잡은 순간) */
  function decide(o){
    const outs = S.o; play = o; S.pt = 0;
    const live = Rn.filter(r => !r.out).sort((a, b) => b.b0 - a.b0), bat = Rn[0];
    const rem = (r, k) => Math.max(0, (k - r.p))*27.43/r.spd + (r.b0 === 0 ? Math.max(0, -r.go) : 0);
    if (o.hr){ live.forEach(r => r.tgt = 4); o.txt = "홈런!!!"; o.hit = 4; tone(523, 1046, .5, "triangle", .12); [784, 1046, 1318, 1568, 2093].forEach((f, k) => tone(f, f, .18, "square", .07, .2 + k*.1)); return; }
    const f = o.f, vt = 23 + defStat(f.c, "arm")*.14, far = Math.hypot(f.x, f.z) > 50, tThrow = k => Math.hypot(BASE[k % 4][0] - f.x, BASE[k % 4][1] - f.z)/vt + .5 + (far ? .55 : 0) + (Math.hypot(f.x, f.z) > 72 && k >= 2 ? .5 : 0);
    const dist = Math.hypot(f.x, f.z);
    if (o.fly){
      bat.out = 1; bat.tgt = bat.p; o.outs = 1; o.txt = dist > 45 ? "뜬공 아웃" : ball.vy > -1 && Math.abs(ball.vx) + Math.abs(ball.vz) > 15 ? "라이너 아웃" : "뜬공 아웃";
      live.filter(r => r !== bat).forEach(r => { r.tgt = r.b0; if (outs + 1 < 3){ if (r.b0 === 3 && dist > 56){ r.tgt = 4; o.sac = 1; } else if (r.b0 === 2 && dist > 78 && f.x > 0) r.tgt = 3; } });
      if (o.sac) o.txt = "희생 플라이!"; throwTo(f, o.sac ? 0 : 2); tone(700, 500, .05, "square", .1); return;
    }
    const infield = dist < 44 && Math.abs(f.x) < 32;
    if (o.gr && infield && fT < 4.2){
      const r1 = live.find(r => r.b0 === 1), forced1 = !!r1;
      if (forced1 && outs < 2){ const t2 = fT + tThrow(2) - fT; if (t2 < rem(r1, 2)){ r1.out = 1; r1.tgt = 2; o.outs = 1; const t1 = t2 + .5 + 27.43/vt; if (t1 < rem(bat, 1)){ bat.out = 1; bat.tgt = 1; o.outs = 2; o.txt = "병살!"; } else { bat.tgt = 1; o.txt = "2루에서 아웃!"; }
          live.filter(r => !r.out && r !== bat).forEach(r => r.tgt = r.b0 + 1); throwTo(f, 2); return; } }
      if (tThrow(1) < rem(bat, 1)){ bat.out = 1; bat.tgt = 1; o.outs = 1; o.txt = "땅볼 아웃"; live.filter(r => r !== bat).forEach(r => r.tgt = (outs + 1 < 3) ? Math.min(4, r.b0 + 1) : r.b0); throwTo(f, 1); return; }
      o.txt = "내야 안타!"; o.hit = 1; bat.tgt = 1; push(live); throwTo(f, 1); return;
    }
    // 외야로 빠진 안타
    let k = 1; for (let b = 2; b <= 3; b++) if (rem(bat, b) - .15 < tThrow(b)) k = b; else break;
    bat.tgt = k; o.hit = k; o.txt = ["", "안타!", "2루타!", "3루타!"][k];
    live.filter(r => r !== bat).forEach(r => { let g = r.b0 + 1; for (let b = r.b0 + 1; b <= 4; b++) if (rem(r, b) < tThrow(b) + 1.4 || (b === r.b0 + 2 && (outs === 2 || far))) g = b; else break; r.tgt = g; });
    push(live); throwTo(f, Math.min(3, k + 1));
  }
  function push(live){   // 뒤 주자를 앞지르거나 같은 루에 둘이 서지 않게 (뒤 주자가 앞 주자를 밀어요)
    let prev = null; live.filter(r => !r.out).sort((a, b) => a.b0 - b.b0).forEach(r => { r.tgt = Math.max(r.tgt, r.b0); if (prev !== null && prev < 4 && r.tgt <= prev) r.tgt = prev + 1; r.tgt = Math.min(4, r.tgt); prev = r.tgt; });
  }
  function throwTo(f, base){ const b = BASE[base % 4], d = Math.hypot(b[0] - f.x, b[1] - f.z); thr = {a: [f.x, f.z], b, t: -.25, d: Math.max(.25, d/(23 + defStat(f.c, "arm")*.14))}; f.has = false; }
  function finish(){
    const o = play; o.fin = 1; const off_ = off(); let runs = 0; const nb = [0, 0, 0];
    if (window.__abLog && window.__abLog.length) window.__abLog[window.__abLog.length - 1].push(o.txt, o.f ? Math.round(Math.hypot(o.f.x, o.f.z)) : 0, +fT.toFixed(1), ball.land ? Math.round(Math.hypot(ball.land[0], ball.land[1])) : -1);
    Rn.forEach(r => { if (r.out) return; if (r.tgt >= 4) runs++; else if (r.tgt >= 1) nb[r.tgt - 1] = r.c.id + "/" + off_; });
    S.bs = nb; S.sc[off_] += runs; S.o += o.outs || 0;
    if (o.hit) S.h[off_]++; endPA("bip", !!o.hit);
    const big = o.hr || runs >= 2 || o.txt === "병살!";
    say(o.hr ? (runs >= 4 ? "만루 홈런!!!" : "홈런!!!") : o.txt, runs ? `${runs}점! ${S.sc[1]} : ${S.sc[0]}` : o.outs ? `${S.o}아웃` : "", o.hr ? "#ffe066" : o.hit ? "#69db7c" : "#ffa8a8", o.hr ? 160 : 110, big ? 1 : 0);
    if (runs && !o.hr) setTimeout(() => SFX.pt(), 50);
    S.ph = "res"; S.cd = o.hr ? 160 : 110;
  }

  /* ---------- 다음 타자 · 공수 교대 · 끝 ---------- */
  function afterRes(){
    if (gameOver()) return;
    if (S.o >= 3){ S.ph = "change"; S.pt = 0; const wasTop = S.top;
      if (wasTop){ S.top = false; } else { S.top = true; S.inn++; }
      S.o = S.b = S.s = 0; S.bs = [0, 0, 0]; S.pz = 0; bgKey = "";
      say(S.top ? `${S.inn}회 초` : `${S.inn}회 말`, `${TN[off()]} ${who(noOf_(NG.sids[off()]))} 공격`, "#fff", 110, 1); return; }
    toReady();
  }
  function toReady(){ S.ph = "ready"; S.pt = 0; S.pz = 0; S.sw = 0; swing = null; ball = null; Fd = []; Rn = []; thr = null; play = null; sel.set = false; }
  function gameOver(){
    const [h, a] = S.sc; let w = -1;
    if (!S.top && S.inn >= INN && h > a) w = 0;                                   // 끝내기 (마지막 말 공격에서 앞서요)
    else if (S.o >= 3 && S.inn >= INN){
      if (S.top && h > a) w = 0;                                                  // 초가 끝났는데 홈 팀이 앞서면 말 공격은 없어요
      else if (!S.top && a > h) w = 1;
      else if (!S.top && S.inn >= INN + 2){ w = S.h[0] >= S.h[1] ? 0 : 1; S.tie = 1; }   // 연장 2회까지 동점이면 안타 수로
    }
    if (w < 0) return false;
    S.ph = "end"; S.pt = 0; const txt = `${TN[0]} ${h} : ${a} ${TN[1]}${S.tie ? ` · 연장도 동점 → 안타 ${S.h[0]}:${S.h[1]}` : ""}${S.inn > INN ? ` · 연장 ${S.inn}회` : ""}`;
    setTimeout(() => { if (NG.cur !== self) return; if (net() === "host") NET.end(w, null, txt); NG.win(w, txt); }, 1400);
    say(w === 0 && !S.top && S.o < 3 ? "끝내기!!!" : "경기 끝!", `${who(noOf_(NG.sids[w]))} 승리!`, "#ffe066", 200, 1); return true;
  }

  /* ---------- 한 장면 ---------- */
  function step(){
    if (net() === "guest"){ gstep(); return; }
    S.tm = [TM[0].D, TM[1].D];
    if (S.msg && S.msg[3] > 0) S.msg[3]--;
    S.pt++; ringT += DT;
    if (S.ph === "intro"){ if (S.pt > (net() === "host" && !remD ? 360 : 200)) { say("1회 초", `${TN[1]} ${who(noOf_(NG.sids[1]))} 공격`, "#fff", 110, 1); S.ph = "change"; S.pt = 1; } return; }
    if (S.ph === "change"){ if (S.pt > 110) toReady(); return; }
    if (S.ph === "ready"){
      const d = dfn();
      if (!human(d) && S.pt > 60) cpuPitch();
      return;
    }
    if (S.ph === "wind"){ if (S.pt >= 42){ S.ph = "fly"; S.pt = 0; } return; }
    if (S.ph === "fly"){
      const pz = S.pz; pz[11] = +(pz[11] + DT).toFixed(4); const t = pz[11];
      if (cpuSw && !swing && t >= cpuSw.t) doSwing(cpuSw.t, cpuSw.x, cpuSw.y);
      const grace = Math.max(.16, .095 + batter().con*.0009) + (remote(off()) ? .25 : .03);
      if (swing && !swing.done && t >= Math.max(pz[8], swing.t)){ swing.done = true;
        if (swing.res.hit){ if (Math.abs(swing.res.sp) > 46 || swing.res.la > 66){ S.ph = "foulfx"; S.pt = 0; S.fx = [Math.sign(swing.res.sp || 1), swing.res.la]; tone(1200, 600, .05, "square", .1); return; } startBIP(swing.res); return; } }
      if (t >= pz[8] + grace && (!swing || (swing.done && !swing.res.hit))){
        tone(160, 120, .06, "square", .1);   // 펑! 포수 미트
        if (swing) callPitch("swing"); else callPitch(inZone(pz[2], pz[3]) ? "look" : "ball"); return; }
      return;
    }
    if (S.ph === "foulfx"){ if (S.pt > 40) callPitch("foul"); return; }
    if (S.ph === "field"){ fieldStep(); return; }
    if (S.ph === "res"){ if (ball && thr && !thr.done) fieldStep(); if (--S.cd <= 0) afterRes(); return; }
  }

  /* ---------- 보기 (심판 기기는 상태로 만들고, 친구 기기는 받은 걸 그대로) ---------- */
  let V = null, gLocal = {id: 0, t0: 0}, mySw = 0, cursor = {x: W/2, y: H*.62, on: false};
  function view(){
    return {ph: S.ph, pt: S.pt, inn: S.inn, top: S.top, o: S.o, b: S.b, s: S.s, sc: S.sc, h: S.h, bo: S.bo, bs: S.bs, msg: S.msg, pz: S.pz, sw: S.sw, tm: S.tm, pc: S.pc, ln: S.ln, fx: S.fx,
      ball: ball && (S.ph === "field" || S.ph === "res") ? [+ball.x.toFixed(2), +ball.y.toFixed(2), +ball.z.toFixed(2)] : 0,
      F: (S.ph === "field" || S.ph === "res") && Fd.length ? Fd.map(f => [f.c.id, +f.x.toFixed(2), +f.z.toFixed(2), f.has ? 1 : 0]) : 0,
      R: (S.ph === "field" || S.ph === "res") && Rn.length ? Rn.map(r => [r.c.id, r.tm, +r.p.toFixed(3), r.out]) : 0, sel: S.ph === "ready" ? [sel.pt, sel.x, sel.y, sel.set ? 1 : 0] : 0};
  }
  function gstep(){ if (!V) return; if (V.pz && V.ph === "fly"){ if (gLocal.id !== V.pz[0]){ gLocal.id = V.pz[0]; gLocal.t0 = performance.now() - V.pz[11]*1000; } } if (mySw > 0) mySw--; ringT += DT; }
  const flightT = () => net() === "guest" && V && V.pz ? (V.ph === "fly" && gLocal.id === V.pz[0] ? (performance.now() - gLocal.t0)/1000 : V.pz[11]) : (S.pz ? S.pz[11] : 0);

  /* ---------- 3D 카메라 ---------- */
  function camMake(px, py, pz, tx, ty, tz, fov, cy = H*.5){
    let fx = tx - px, fy = ty - py, fz = tz - pz; const fl = Math.hypot(fx, fy, fz); fx /= fl; fy /= fl; fz /= fl;
    let rx = fz, rz = -fx; const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;          // 오른쪽 = 위 × 앞
    const u = [fy*rz, fz*rx - fx*rz, -fy*rx];                                                  // 위 = 앞 × 오른쪽
    return {px, py, pz, f: [fx, fy, fz], r: [rx, 0, rz], u, F: (H/2)/Math.tan(fov*Math.PI/360), cy};
  }
  function toC(C, x, y, z){ const dx = x - C.px, dy = y - C.py, dz = z - C.pz; return [dx*C.r[0] + dz*C.r[2], dx*C.u[0] + dy*C.u[1] + dz*C.u[2], dx*C.f[0] + dy*C.f[1] + dz*C.f[2]]; }
  function P(C, x, y, z){ const c = toC(C, x, y, z); if (c[2] < NEAR) return null; const s = C.F/c[2]; return [W/2 + c[0]*s, C.cy - c[1]*s, s, c[2]]; }
  function poly(g, C, pts, fill, stroke, lw){
    const cs = pts.map(p => toC(C, p[0], p[1], p[2])), out = [];
    for (let i = 0; i < cs.length; i++){ const a = cs[i], b = cs[(i + 1) % cs.length], ia = a[2] > NEAR, ib = b[2] > NEAR;
      if (ia) out.push(a); if (ia !== ib){ const t = (NEAR - a[2])/(b[2] - a[2]); out.push([a[0] + (b[0] - a[0])*t, a[1] + (b[1] - a[1])*t, NEAR]); } }
    if (out.length < 3) return; g.beginPath(); out.forEach((c, k) => { const s = C.F/c[2], x = W/2 + c[0]*s, y = C.cy - c[1]*s; k ? g.lineTo(x, y) : g.moveTo(x, y); });
    g.closePath(); if (fill){ g.fillStyle = fill; g.fill(); } if (stroke){ g.lineWidth = lw || 2; g.strokeStyle = stroke; g.stroke(); }
  }
  function seg(g, C, a, b, col, lw){ let A = toC(C, ...a), B = toC(C, ...b); if (A[2] < NEAR && B[2] < NEAR) return;
    if (A[2] < NEAR){ const t = (NEAR - A[2])/(B[2] - A[2]); A = [A[0] + (B[0] - A[0])*t, A[1] + (B[1] - A[1])*t, NEAR]; } if (B[2] < NEAR){ const t = (NEAR - B[2])/(A[2] - B[2]); B = [B[0] + (A[0] - B[0])*t, B[1] + (A[1] - B[1])*t, NEAR]; }
    const sa = C.F/A[2], sb = C.F/B[2]; g.beginPath(); g.moveTo(W/2 + A[0]*sa, C.cy - A[1]*sa); g.lineTo(W/2 + B[0]*sb, C.cy - B[1]*sb); g.strokeStyle = col; g.lineWidth = lw; g.stroke(); }
  const circ = (cx, cz, r, n = 28, y = 0) => Array.from({length: n}, (_, i) => [cx + Math.cos(i/n*Math.PI*2)*r, y, cz + Math.sin(i/n*Math.PI*2)*r]);
  const ARC = []; for (let d = -45; d <= 45; d += 3){ const a = d*Math.PI/180; ARC.push([a, fenceR(a)]); }
  const ap = (a, r, y = 0) => [Math.sin(a)*r, y, Math.cos(a)*r];
  function drawField(g, C, crowd){
    // 하늘
    const hz = P(C, 0, 0, 2000), hy = hz ? hz[1] : H*.3; const sk = g.createLinearGradient(0, 0, 0, Math.max(10, hy)); sk.addColorStop(0, "#1c3d7a"); sk.addColorStop(1, "#6fa8dc"); g.fillStyle = sk; g.fillRect(0, 0, W, H);
    g.fillStyle = "#2b7a3d"; g.fillRect(0, Math.max(0, hy), W, H);
    poly(g, C, [[-160, 0, -30], [160, 0, -30], [160, 0, 170], [-160, 0, 170]], "#2f8a43");
    // 관중석 (담장 뒤로 올라가요)
    for (let i = 0; i + 1 < ARC.length; i++){ const [a0, r0] = ARC[i], [a1, r1] = ARC[i + 1];
      poly(g, C, [ap(a0, r0 + 1, FH), ap(a1, r1 + 1, FH), ap(a1, r1 + 26, 20), ap(a0, r0 + 26, 20)], i % 2 ? "#3b4a6b" : "#34425f");
      if (crowd){ for (let k = 0; k < 3; k++){ const p = P(C, ...ap((a0 + a1)/2, r0 + 6 + k*7, FH + 2 + k*5)); if (p && p[2] > .8){ g.fillStyle = COLS[(i*3 + k) % COLS.length]; g.fillRect(p[0] - p[2]*1.3, p[1] - p[2]*1.2, p[2]*2.6, p[2]*1.6); } } } }
    for (let i = 0; i + 1 < ARC.length; i++){ const [a0, r0] = ARC[i], [a1, r1] = ARC[i + 1]; poly(g, C, [ap(a0, r0), ap(a1, r1), ap(a1, r1, FH), ap(a0, r0, FH)], i % 2 ? "#1d5c3a" : "#1a5434"); }
    for (let i = 0; i + 1 < ARC.length; i++) seg(g, C, ap(ARC[i][0], ARC[i][1], FH), ap(ARC[i + 1][0], ARC[i + 1][1], FH), "#ffd43b", 3);
    // 잔디 (줄무늬)
    poly(g, C, [[0, 0, 0], ...ARC.map(([a, r]) => ap(a, r))], "#3aa556");
    for (let i = 0; i + 1 < ARC.length; i += 2){ const [a0, r0] = ARC[i], [a1, r1] = ARC[i + 1]; poly(g, C, [[0, 0, 0], ap(a0, r0), ap(a1, r1)], "#35994f"); }
    // 내야
    poly(g, C, circ(0, 19, 28.5, 40), "#c98b52");
    poly(g, C, [[0, 0, 3.6], [15.6, 0, 19.4], [0, 0, 35.2], [-15.6, 0, 19.4]], "#3aa556");
    poly(g, C, circ(0, 0, 4.2, 24), "#c98b52"); poly(g, C, circ(0, 18.4, 2.8, 20), "#c98b52");
    seg(g, C, [0, .02, 0], ap(Math.PI/4, fenceR(Math.PI/4), .02), "#fff", 2.4); seg(g, C, [0, .02, 0], ap(-Math.PI/4, fenceR(-Math.PI/4), .02), "#fff", 2.4);
    seg(g, C, ap(Math.PI/4, fenceR(Math.PI/4)), ap(Math.PI/4, fenceR(Math.PI/4), 14), "#ffd43b", 3); seg(g, C, ap(-Math.PI/4, fenceR(-Math.PI/4)), ap(-Math.PI/4, fenceR(-Math.PI/4), 14), "#ffd43b", 3);
    poly(g, C, [[-.2, .03, 17.9], [.2, .03, 17.9], [.2, .03, 18.1], [-.2, .03, 18.1]], "#fff");
    [1, 2, 3].forEach(i => { const [x, z] = BASE[i]; poly(g, C, [[x - .4, .05, z], [x, .05, z + .4], [x + .4, .05, z], [x, .05, z - .4]], "#fff"); });
    poly(g, C, [[-.22, .04, .22], [.22, .04, .22], [.22, .04, 0], [0, .04, -.22], [-.22, .04, 0]], "#fff");
    [[-1.25, -.85], [.45, -.85]].forEach(([x0]) => poly(g, C, [[x0, .04, -.9], [x0 + .8, .04, -.9], [x0 + .8, .04, .9], [x0, .04, .9]], null, "rgba(255,255,255,.8)", 2));
  }
  /* 동물 그림은 한 번 그려 두고 붙여요 */
  const EMC = new Map();
  function emo(e){ let c = EMC.get(e); if (!c){ c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"); x.font = `100px ${EMOJI}`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(e, 64, 70); EMC.set(e, c); } return c; }
  function sprite(g, C, x, z, e, col, hm = 1.7, o = {}){
    const p = P(C, x, 0, z); if (!p) return null; const s = p[2], h = hm*s;
    g.globalAlpha = .35; g.fillStyle = "#000"; g.beginPath(); g.ellipse(p[0], p[1], h*.32, h*.1, 0, 0, 7); g.fill(); g.globalAlpha = 1;
    if (col){ g.strokeStyle = col; g.lineWidth = Math.max(2, h*.05); g.beginPath(); g.ellipse(p[0], p[1], h*.34, h*.11, 0, 0, 7); g.stroke(); }
    const sz = h*1.05; g.save(); if (o.flip){ g.translate(p[0], 0); g.scale(-1, 1); g.translate(-p[0], 0); } if (o.alpha) g.globalAlpha = o.alpha;
    if (o.rot){ g.translate(p[0], p[1] - sz*.45); g.rotate(o.rot); g.drawImage(emo(e), -sz/2, -sz*.55, sz, sz); } else g.drawImage(emo(e), p[0] - sz/2, p[1] - sz*.98, sz, sz);
    g.restore(); return p;
  }
  function ballAt(g, C, x, y, z, trail){
    const sh = P(C, x, 0, z), p = P(C, x, y, z); if (!p) return;
    if (sh){ g.globalAlpha = .3; g.fillStyle = "#000"; g.beginPath(); g.ellipse(sh[0], sh[1], Math.max(2, .09*sh[2]), Math.max(1, .04*sh[2]), 0, 0, 7); g.fill(); g.globalAlpha = 1; }
    const r = Math.max(4.5, .07*p[2]); g.fillStyle = "#fff"; g.beginPath(); g.arc(p[0], p[1], r, 0, 7); g.fill(); g.strokeStyle = "#e03131"; g.lineWidth = Math.max(1, r*.18); g.beginPath(); g.arc(p[0] - r*.5, p[1], r*.7, -1, 1); g.stroke(); g.beginPath(); g.arc(p[0] + r*.5, p[1], r*.7, 2.14, 4.14); g.stroke();
  }

  /* 타석 화면 (뒤에서 보는 카메라) — 배경은 한 번 그려 둬요 */
  const BC = camMake(0, 2.05, -5.4, 0, .5, 18.4, 25, H*.52);
  let bg = null, bgKey = "";
  function batBg(Vv, T){
    const k = NG.k || 1, key = `${k}|${Vv.top}|${JSON.stringify(Vv.tm)}`; if (bg && bgKey === key) return bg;
    bg = bg || document.createElement("canvas"); bg.width = Math.round(W*k); bg.height = Math.round(H*k); const g = bg.getContext("2d"); g.setTransform(k, 0, 0, k, 0, 0);
    drawField(g, BC, true);
    const D = T[Vv.top ? 0 : 1]; if (D){ ["CF", "LF", "RF", "SS", "2B", "3B", "1B"].forEach(p => sprite(g, BC, FP[p][0], FP[p][1], D.C[p].e, TC[Vv.top ? 0 : 1], p.length === 2 && "LFCFRF".includes(p) ? 3.4 : 2.4)); }
    bgKey = key; return bg;
  }
  const zoneScr = () => { const a = P(BC, -ZX, ZY1, 0), b = P(BC, ZX, ZY0, 0); return {x: a[0], y: a[1], w: b[0] - a[0], h: b[1] - a[1]}; };
  function scr2plate(sx, sy){ // 화면 → 홈플레이트 면 (z=0)
    const C = BC, dx = (sx - W/2)/C.F, dy = (C.cy - sy)/C.F, d = [C.f[0] + C.r[0]*dx + C.u[0]*dy, C.f[1] + C.r[1]*dx + C.u[1]*dy, C.f[2] + C.r[2]*dx + C.u[2]*dy];
    const t = (0 - C.pz)/d[2]; return [C.px + d[0]*t, C.py + d[1]*t]; }
  function plate2scr(x, y){ const p = P(BC, x, y, 0); return p ? [p[0], p[1]] : [W/2, H/2]; }

  /* 필드 카메라 (공을 따라가요) */
  let FC = {x: 0, y: 30, z: -26, tx: 0, tz: 40};
  function fieldCam(bx, bz){
    const r = Math.hypot(bx, bz), tx = bx*.82, tz = bz*.78 + 6, px = bx*.3, pz = -24 + bz*.38, py = 24 + r*.12;
    FC.x += (px - FC.x)*.08; FC.y += (py - FC.y)*.08; FC.z += (pz - FC.z)*.08; FC.tx += (tx - FC.tx)*.1; FC.tz += (tz - FC.tz)*.1;
    return camMake(FC.x, FC.y, FC.z, FC.tx, 0, FC.tz, 52, H*.48);
  }

  /* ---------- 그리기 ---------- */
  function teams(Vv){ return [Vv.tm[0] ? teamOf(Vv.tm[0]) : null, Vv.tm[1] ? teamOf(Vv.tm[1]) : null]; }
  const cardById = (T, id) => { for (const t of T) if (t) for (const p of ABC.POS) if (t.C[p].id === id) return t.C[p]; const c = ABC.BY[id]; return c ? ABC.stat(c) : ABC.ST.P; };
  function draw(g){
    const Vv = net() === "guest" ? V : view(); if (!Vv || !Vv.tm || !Vv.tm[0]){ g.fillStyle = "#0d1426"; g.fillRect(0, 0, W, H); outlined(g, "⚾ 경기장으로 가는 중…", W/2, H/2, 40, "#fff"); return; }
    const T = teams(Vv), of_ = Vv.top ? 1 : 0, df = 1 - of_;
    if (Vv.ph === "intro"){ drawIntro(g, Vv, T); drawMsg(g, Vv); return; }
    const fieldView = (Vv.ph === "field" || Vv.ph === "res") && Vv.F;
    if (fieldView){
      const b = Vv.ball || [0, 1, 0], C = fieldCam(b[0], b[2]); drawField(g, C, false);
      const L = [];
      Vv.F.forEach(([id, x, z, has]) => L.push({x, z, e: cardById(T, id).e, col: TC[df], has}));
      Vv.R.forEach(([id, tm, p, out]) => { if (out && p % 1 < .02 && Vv.ph === "res") return; const [x, z] = bpos(p); L.push({x: x + .6, z: z - .6, e: cardById(T, id).e, col: TC[tm], alpha: out ? .45 : 1}); });
      L.forEach(o => { const c = toC(C, o.x, 0, o.z); o.d = c[2]; }); L.sort((a, b) => b.d - a.d);
      L.forEach(o => sprite(g, C, o.x, o.z, o.e, o.col, 3.4, {alpha: o.alpha}));
      if (Vv.ball) ballAt(g, C, b[0], b[1], b[2]);
      if (Vv.ph === "field"){ const r = Math.hypot(b[0], b[2]); outlined(g, `${Math.round(r)}m`, W - 90, 120, 26, "#fff"); }
    } else {
      g.drawImage(batBg(Vv, T), 0, 0, W, H);
      const D = T[df], O = T[of_], bat = O ? O.ord[Vv.bo[of_] % O.ord.length] : null, pit = D ? D.P : null;
      // 투수 (던지는 몸짓)
      const wind = Vv.ph === "wind" ? Vv.pt/42 : Vv.ph === "fly" ? 1 : 0;
      if (pit){ const lift = Math.sin(clamp(wind, 0, 1)*Math.PI)*.5; const p = sprite(g, BC, 0, 18.1, pit.e, TC[df], 2.3 + lift*.25, {rot: wind > .6 && wind < 1 ? -.5 : wind >= 1 && Vv.ph === "fly" && flightT() < .15 ? .4 : 0}); }
      // 스트라이크존
      const Z = zoneScr(); g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 2; g.strokeRect(Z.x, Z.y, Z.w, Z.h);
      g.strokeStyle = "rgba(255,255,255,.18)"; g.lineWidth = 1; g.beginPath(); for (let i = 1; i < 3; i++){ g.moveTo(Z.x + Z.w*i/3, Z.y); g.lineTo(Z.x + Z.w*i/3, Z.y + Z.h); g.moveTo(Z.x, Z.y + Z.h*i/3); g.lineTo(Z.x + Z.w, Z.y + Z.h*i/3); } g.stroke();
      // 투수 겨냥 (던지는 쪽 기기만 보여요)
      const sel_ = net() === "guest" ? gsel : sel;
      if (Vv.ph === "ready" && isLocal(df) && human(df)){
        if (sel_.set){ const [sx, sy] = plate2scr(sel_.x, sel_.y), rr = ringR(); g.strokeStyle = "#ffd43b"; g.lineWidth = 4; g.beginPath(); g.arc(sx, sy, 14, 0, 7); g.stroke();
          g.strokeStyle = `rgba(255,212,59,${.4 + (1 - rr)*.6})`; g.lineWidth = 3; g.beginPath(); g.arc(sx, sy, 14 + rr*70, 0, 7); g.stroke(); }
      }
      // 공
      if ((Vv.ph === "fly" || Vv.ph === "foulfx") && Vv.pz){ const t = Vv.ph === "foulfx" ? Vv.pz[8] : flightT();
        if (Vv.ph === "foulfx"){ const k = Vv.pt/40, fx = Vv.fx || [1, 40]; ballAt(g, BC, fx[0]*k*6, 1 + k*8*(fx[1] > 60 ? 1.8 : .6), -k*4 + 1); }
        else { for (let j = 3; j >= 1; j--){ const q = pzPos(Vv.pz, Math.max(0, t - j*.03)), p = P(BC, ...q); if (p){ g.globalAlpha = .12*(4 - j); g.fillStyle = "#fff"; g.beginPath(); g.arc(p[0], p[1], Math.max(2, .04*p[2]), 0, 7); g.fill(); } } g.globalAlpha = 1;
          const q = pzPos(Vv.pz, t); if (q[2] > -2.5) ballAt(g, BC, q[0], q[1], q[2]); } }
      // 타자 + 방망이
      if (bat){ const L = bat.hand === "L", bx = L ? 1.05 : -1.05; const swT = net() === "guest" && mySw ? (24 - mySw)/24 : Vv.sw ? clamp((flightT() - Vv.sw[0] + .1)/.25, 0, 1) : 0;
        const p = P(BC, bx, 0, .15); if (p){ const sz = 1.45*p[2]; g.globalAlpha = .9; g.drawImage(emo(bat.e), p[0] - sz/2, p[1] - sz*.92, sz, sz); g.globalAlpha = 1;
          const hx = p[0] + (L ? -sz*.18 : sz*.18), hy = p[1] - sz*.5, ang = (L ? Math.PI + .6 : -.6) + (L ? 1 : -1)*swT*2.6;
          g.strokeStyle = "#c8915a"; g.lineCap = "round"; g.lineWidth = sz*.06; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + Math.cos(ang - Math.PI/2)*sz*.55, hy + Math.sin(ang - Math.PI/2)*sz*.55); g.stroke(); g.lineCap = "butt"; } }
      // 타격 겨냥 원 (마우스)
      if ((Vv.ph === "fly" || Vv.ph === "wind") && isLocal(of_) && human(of_) && cursor.on){ g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 3; g.beginPath(); g.arc(cursor.x, cursor.y, 22, 0, 7); g.stroke(); }
      if (Vv.pz && Vv.ph !== "ready") outlined(g, `${PT[Vv.pz[1]].e} ${PT[Vv.pz[1]].n} ${Vv.pz[10]}km/h`, W/2, 128, 24, "#ffe8cc");
      drawCards(g, Vv, bat, pit, of_, df);
      drawControls(g, Vv, of_, df, pit);
    }
    drawBoard(g, Vv, T); drawMsg(g, Vv);
  }
  function ringR(){ return (Math.cos(ringT*Math.PI*1.7) + 1)/2; }
  /* 버튼들 */
  function pitchBtns(pit){ const L = pit ? pit.pit : ["fb"]; return L.map((k, i) => ({k, x: W - 196, y: 190 + i*78, w: 180, h: 66})); }
  const THROW = {x: W - 236, y: H - 128, w: 220, h: 96};
  function drawControls(g, Vv, of_, df, pit){
    const sel_ = net() === "guest" ? gsel : sel;
    if (Vv.ph === "ready"){
      if (isLocal(df) && human(df)){
        pitchBtns(pit).forEach(b => { bdBtn(g, {x: b.x, y: b.y, w: b.w, h: b.h, t: `${PT[b.k].e} ${PT[b.k].n}`, p: sel_.pt === b.k ? 1 : 0}, sel_.pt === b.k); });
        if (sel_.set) bdBtn(g, {x: THROW.x, y: THROW.y, w: THROW.w, h: THROW.h, t: "⚾ 던지기!", p: 1}, true);
        outlined(g, sel_.set ? "🎯 링이 작아질 때 ⚾ 던지기! (작을수록 정확해요)" : "🎯 공 종류를 고르고, 던질 곳을 스트라이크존에 톡!", W/2, H - 34, 26, "#ffe066");
      } else outlined(g, isLocal(of_) ? "🤔 투수가 공을 고르고 있어요… 공이 오면 칠 곳을 톡!" : "🤔 투수가 공을 고르고 있어요", W/2, H - 34, 26, "#fff");
    } else if ((Vv.ph === "wind" || Vv.ph === "fly") && isLocal(of_) && human(of_)) outlined(g, "🏏 공이 올 곳을 보고, 홈에 닿을 때 화면을 톡!", W/2, H - 34, 26, "#ffe066");
  }
  function drawCards(g, Vv, bat, pit, of_, df){
    const box = (x, y, w, h, col) => { rrect(g, x, y, w, h, 16); g.fillStyle = "rgba(10,14,32,.78)"; g.fill(); g.lineWidth = 3; g.strokeStyle = col; g.stroke(); };
    if (bat){ const ln = (Vv.ln || {})[of_ + ":" + bat.id] || [0, 0]; box(16, H - 152, 330, 136, TC[of_]); g.drawImage(emo(bat.e), 22, H - 146, 92, 92);
      outlined(g, `${(Vv.bo[of_] % 8) + 1}번 ${ABC.PS[bat.at]} ${bat.hand === "L" ? "좌타" : "우타"}`, 120, H - 132, 18, "#a5d8ff", undefined, "left");
      outlined(g, bat.n + (bat.lv ? ` +${bat.lv}` : ""), 120, H - 104, 26, "#fff", undefined, "left");
      outlined(g, `💪${bat.pow} 🎯${bat.con} 👟${bat.spd}`, 120, H - 74, 20, "#ffe8cc", undefined, "left");
      outlined(g, `오늘 ${ln[0]}타수 ${ln[1]}안타`, 120, H - 44, 18, "#b2f2bb", undefined, "left"); }
    if (pit && Vv.ph !== "ready"){ const fat = clamp(((Vv.pc || [0, 0])[df] - (25 + pit.sta*.35))/40, 0, 1); box(W - 300, H - 152, 284, 136, TC[df]); g.drawImage(emo(pit.e), W - 294, H - 146, 84, 84);
      outlined(g, "투수 " + pit.n, W - 204, H - 120, 22, "#fff", undefined, "left"); outlined(g, `⚡${pit.vel} 🎯${pit.ctl} 🌀${pit.brk}`, W - 204, H - 90, 18, "#ffe8cc", undefined, "left");
      outlined(g, `공 ${(Vv.pc || [0, 0])[df]}개`, W - 204, H - 62, 17, "#ced4da", undefined, "left");
      g.fillStyle = "rgba(255,255,255,.15)"; g.fillRect(W - 204, H - 44, 170, 10); g.fillStyle = fat > .5 ? "#ff6b6b" : fat > 0 ? "#ffd43b" : "#69db7c"; g.fillRect(W - 204, H - 44, 170*(1 - fat*.8), 10); }
  }
  function drawBoard(g, Vv, T){
    rrect(g, 12, 12, 430, 96, 16); g.fillStyle = "rgba(10,14,32,.82)"; g.fill();
    [1, 0].forEach((t, i) => { const y = 38 + i*40, on = (Vv.top ? 1 : 0) === t;
      g.fillStyle = TC[t]; g.fillRect(24, y - 14, 8, 28);
      outlined(g, `${TN[t]} ${who(noOf_(NG.sids[t]))}${t === 1 && cpu() ? " 🤖" : ""}`, 42, y, 22, on ? "#ffe066" : "#fff", undefined, "left");
      outlined(g, String(Vv.sc[t]), 300, y, 30, "#fff"); outlined(g, `안타 ${Vv.h[t]}`, 360, y, 16, "#adb5bd"); });
    rrect(g, 452, 12, 250, 96, 16); g.fillStyle = "rgba(10,14,32,.82)"; g.fill();
    outlined(g, `${Vv.inn}회 ${Vv.top ? "▲초" : "▼말"}`, 512, 40, 22, "#fff");
    const dots = (n, max, col, y, lab) => { outlined(g, lab, 476, y, 17, "#ced4da"); for (let i = 0; i < max; i++){ g.beginPath(); g.arc(500 + i*20, y, 7, 0, 7); g.fillStyle = i < n ? col : "rgba(255,255,255,.15)"; g.fill(); } };
    dots(Vv.b, 3, "#69db7c", 66, "B"); dots(Vv.s, 2, "#ffd43b", 90, "S");
    outlined(g, "O", 572, 90, 17, "#ced4da"); for (let i = 0; i < 2; i++){ g.beginPath(); g.arc(594 + i*20, 90, 7, 0, 7); g.fillStyle = i < Vv.o ? "#ff6b6b" : "rgba(255,255,255,.15)"; g.fill(); }
    // 루 (작은 다이아몬드)
    const cx = 664, cy = 74, d = 14; [[cx + d, cy - d], [cx, cy - 2*d], [cx - d, cy - d]].forEach(([x, y], i) => { g.save(); g.translate(x, y); g.rotate(Math.PI/4); g.fillStyle = Vv.bs[i] ? "#ffd43b" : "rgba(255,255,255,.2)"; g.fillRect(-6, -6, 12, 12); g.restore(); });
  }
  function drawMsg(g, Vv){ const m = Vv.msg; if (!m || m[3] <= 0) return; const a = Math.min(1, m[3]/15), big = m[4];
    g.globalAlpha = a; if (big){ g.fillStyle = "rgba(10,8,30,.55)"; g.fillRect(0, H*.36, W, H*.24); }
    outlined(g, m[0], W/2, H*(big ? .45 : .3), big ? 78 : 50, m[2]); if (m[1]) outlined(g, m[1], W/2, H*(big ? .54 : .37), big ? 30 : 24, "#fff"); g.globalAlpha = 1; }
  function drawIntro(g, Vv, T){
    const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, "#132044"); gr.addColorStop(1, "#2b1440"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    outlined(g, "⚾ 동물 프로야구", W/2, 56, 46, "#ffe066"); outlined(g, `${INN}이닝 경기 · 플레이 볼!`, W/2, 100, 22, "#fff");
    [1, 0].forEach((t, i) => { const x0 = i ? W/2 + 30 : 40, Tt = T[t]; if (!Tt) return;
      rrect(g, x0, 130, W/2 - 70, 560, 22); g.fillStyle = "rgba(255,255,255,.06)"; g.fill(); g.lineWidth = 3; g.strokeStyle = TC[t]; g.stroke();
      outlined(g, `${TN[t]} ${who(noOf_(NG.sids[t]))}${t === 1 && cpu() ? " 🤖" : ""}`, x0 + 24, 166, 28, "#fff", undefined, "left");
      outlined(g, `💪 전력 ${Tt.pow}`, x0 + W/2 - 100, 166, 24, "#ffe066", undefined, "right");
      Tt.ord.forEach((c, k) => { const y = 214 + k*48; g.drawImage(emo(c.e), x0 + 24, y - 22, 44, 44); outlined(g, `${k + 1}. ${c.n}${c.lv ? ` +${c.lv}` : ""}`, x0 + 78, y, 22, "#fff", undefined, "left"); outlined(g, `${ABC.PS[c.at]} · ${c.ovr}`, x0 + W/2 - 100, y, 20, "#a5d8ff", undefined, "right"); });
      const p = Tt.P, y = 214 + 9*48; g.drawImage(emo(p.e), x0 + 24, y - 22, 44, 44); outlined(g, `⚾ ${p.n}`, x0 + 78, y, 22, "#ffe8cc", undefined, "left"); outlined(g, `투수 · ${p.ovr}`, x0 + W/2 - 100, y, 20, "#ffd8a8", undefined, "right"); });
    outlined(g, "VS", W/2, 400, 60, "#fff");
    if (net() === "host" && !remD) outlined(g, "🌐 친구 팀을 받는 중…", W/2, H - 20, 20, "#ced4da");
  }

  /* ---------- 손가락 · 키보드 ---------- */
  let gsel = {pt: "fb", x: 0, y: .78, set: false}, gpc = 0, gsw = 0;
  function myTeamSide(){ return net() === "guest" ? 1 : 0; }
  function curV(){ return net() === "guest" ? V : view(); }
  function tapPitch(x, y, Vv, pit){
    const s = net() === "guest" ? gsel : sel;
    for (const b of pitchBtns(pit)) if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h){ s.pt = b.k; tone(800, 900, .04, "sine", .06); return; }
    if (s.set && x >= THROW.x && x <= THROW.x + THROW.w && y >= THROW.y && y <= THROW.y + THROW.h){ throwIt(); return; }
    const [px, py] = scr2plate(x, y); if (Math.abs(px) < .6 && py > .1 && py < 1.5){ if (s.set && Math.hypot(px - s.x, py - s.y) < .06){ throwIt(); return; } s.x = clamp(px, -.5, .5); s.y = clamp(py, .2, 1.4); s.set = true; ringT = 0; tone(900, 900, .03, "sine", .05); }
  }
  function throwIt(){ const acc = ringR(); if (net() === "guest"){ gsel.acc = acc; gpc++; gsel.set = false; return; } startPitch(sel.pt, sel.x, sel.y, acc); }
  function tapSwing(x, y){ const [px, py] = scr2plate(x, y);
    if (net() === "guest"){ if (gsw === (V && V.pz ? V.pz[0] : -1)) return; gsw = V.pz[0]; gswing = {n: gsw, ts: flightT(), x: px, y: py}; mySw = 24; tone(300, 120, .1, "sawtooth", .05); return; }
    doSwing(S.pz[11], px, py); }
  let gswing = null, myD = null;
  const self = {
    W, H,
    init(){
      S = freshS(); pid = 0; remD = null; inp = {pc: 0, sw: 0}; bgKey = ""; V = null; FC = {x: 0, y: 30, z: -26, tx: 0, tz: 40};
      if (net() !== "guest"){
        const d0 = dOf(ABC.of(NG.sids[0])); let d1;
        if (cpu()) d1 = dOf(ABC.cpuTeam(lv(), Math.floor(Date.now()/86400000)));
        else if (net()) d1 = dOf({c: {}, l: {}});
        else d1 = dOf(ABC.of(NG.sids[1]));
        TM = [teamOf(d0), teamOf(d1)]; TM[0].D = d0; TM[1].D = d1; S.tm = [d0, d1];
      }
      [...ABC.ALL, ...Object.values(ABC.ST)].forEach(c => emo(c.e));
    },
    step, draw,
    down(x, y){
      const Vv = curV(); if (!Vv || !Vv.tm || !Vv.tm[0]) return; const T = teams(Vv), of_ = Vv.top ? 1 : 0, df = 1 - of_;
      cursor = {x, y, on: true};
      if (Vv.ph === "ready" && isLocal(df) && human(df)) return tapPitch(x, y, Vv, T[df] && T[df].P);
      if (Vv.ph === "fly" && isLocal(of_) && human(of_)) return tapSwing(x, y);
    },
    move(x, y){ cursor = {x, y, on: true}; },
    key(code, d){
      if (!d) return false; const Vv = curV(); if (!Vv || !Vv.tm || !Vv.tm[0]) return false; const of_ = Vv.top ? 1 : 0, df = 1 - of_;
      if (Vv.ph === "ready" && isLocal(df) && human(df)){ const s = net() === "guest" ? gsel : sel, T = teams(Vv), L = (T[df] && T[df].P.pit) || ["fb"];
        const mv = {ArrowLeft: [-.08, 0], ArrowRight: [.08, 0], ArrowUp: [0, .08], ArrowDown: [0, -.08]}[code];
        if (mv){ s.x = clamp(s.x + mv[0], -.5, .5); s.y = clamp(s.y + mv[1], .2, 1.4); s.set = true; return true; }
        const n = {Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3}[code]; if (n !== undefined && L[n]){ s.pt = L[n]; return true; }
        if (code === "Space" || code === "Enter"){ if (!s.set) s.set = true; else throwIt(); return true; } }
      if (Vv.ph === "fly" && isLocal(of_) && human(of_) && (code === "Space" || code === "Enter")){ tapSwing(cursor.x, cursor.y); return true; }
      return false;
    },
    hud(){ const Vv = curV(); if (!Vv) return ""; return `⚾ ${esc(who(noOf_(NG.sids[1])))} <b>${Vv.sc[1]}</b> : <b>${Vv.sc[0]}</b> ${esc(who(noOf_(NG.sids[0])))} · ${Vv.inn}회${Vv.top ? "초" : "말"} · ${INN}이닝${net() ? " · 🌐 다른 기기 대결" : cpu() ? " · 🤖 컴퓨터" : ""}`; },
    netAd: {
      snap: () => view(),
      ev: () => [], fx(){},
      apply(d){ if (net() !== "guest") return; V = d; if (window.__abTest) window.__abV = d; },
      mine: () => ({tm: myD || (myD = dOf(ABC.of(NG.sids[1]))), pc: gpc, sel: [gsel.pt, +gsel.x.toFixed(3), +gsel.y.toFixed(3), +(gsel.acc || 0).toFixed(3)], sw: gswing}),
      put(d){ if (net() !== "host" || !d) return;
        if (d.tm && !remD){ remD = d.tm; TM[1] = teamOf(remD); TM[1].D = remD; S.tm = [TM[0].D, remD]; bgKey = ""; }
        if (d.pc > inp.pc){ inp.pc = d.pc; if (S.ph === "ready" && dfn() === 1 && d.sel){ startPitch(PT[d.sel[0]] ? d.sel[0] : "fb", clamp(+d.sel[1], -.5, .5), clamp(+d.sel[2], .2, 1.4), clamp(+d.sel[3], 0, 1)); } }
        if (d.sw && d.sw.n > inp.sw){ inp.sw = d.sw.n; if (S.ph === "fly" && off() === 1 && S.pz && d.sw.n === S.pz[0]) doSwing(clamp(+d.sw.ts, 0, S.pz[8] + .5), +d.sw.x, +d.sw.y); }
      },
      end(w, sc, txt){ if (net() !== "guest" || NG.ended) return; NG.win(w, txt); },
      reset(){}
    },
    /* 🧪 시험용 */
    dbg: {ft: () => flightT(), auto(){ if (S.ph === "ready") cpuPitch(); else if (S.ph === "fly" && !cpuSw && !swing && S.pz[11] < .02) planCpuSwing(); }, S: () => S, ball: () => ball, Fd: () => Fd, Rn: () => Rn, contact, startBIP, doSwing, startPitch, sel: () => sel, scr2plate, plate2scr, zoneScr, pzPos}
  };
  return self;
};
