/* =====================================================================
   🎵 리듬 스타 (2026.11.14) — 4줄 리듬게임 · 혼자 점수전
   - 노래 6곡은 오락실이 직접 만든 오리지널 아이돌 팝이에요(저작권 걱정 없음).
     처음 고를 때 이 기기에서 한 번 '녹음'해 두고(OfflineAudioContext), 그 소리 그대로 틀어요.
   - 🎧 내 노래: 이 기기에 있는 음악 파일을 넣으면 박자를 찾아 악보를 저절로 만들어요(이 기기에만 저장).
   - ⚡ 렉 없이: 판정은 화면 장면이 아니라 '소리 시계'로 해요 → 화면이 잠깐 버벅여도 판정은 정확해요.
     누르는 순간 바로 판정하고, 배경·길·빛 그림은 한 번만 그려 붙여요. 그림자 번짐 없음.
   ===================================================================== */
const RH_KEYS = [["KeyD", "KeyS", "ArrowLeft", "Digit1"], ["KeyF", "ArrowDown", "Digit2"], ["KeyJ", "ArrowUp", "Digit3"], ["KeyK", "KeyL", "ArrowRight", "Digit4"]];
const RH_DIFF = [{n: "쉬움", e: "🌱", c: "#51cf66", mul: .7}, {n: "보통", e: "⭐", c: "#4dabf7", mul: .85}, {n: "어려움", e: "🔥", c: "#ff6b6b", mul: 1}];
const RH_EMO = [
  {n: "신나", e: ["😆", "🔥", "🎉", "🤩", "✨"]}, {n: "귀염", e: ["🥰", "💖", "🌸", "😻", "🍓"]}, {n: "멋짐", e: ["😎", "⚡", "👑", "💎", "🕶️"]},
  {n: "장난", e: ["🤪", "🎈", "🍭", "😜", "🦄"]}, {n: "동물", e: ["🐶", "🐱", "🐰", "🐼", "🐥"]}, {n: "우주", e: ["🚀", "⭐", "🪐", "🌙", "👽"]}
];
const RH_CHEER = ["👏", "📣", "💕", "🙌", "🎶", "💜", "🥳"];
/* 오리지널 노래 (도: 음 이름 숫자 60 = 가운데 도) */
const RH_SONGS = [
  {id: "star", t: "별빛 러너", en: "Starlight Runner", a: "6-4 STARS", e: "✨", bpm: 128, root: 64, mode: "maj", seed: 11, lead: "bright",
   c: ["#7048e8", "#f06595"], d: "반짝반짝 신나는 댄스 팝",
   form: [["i", 4], ["v", 8], ["p", 4], ["c", 8], ["b", 4], ["c", 8], ["o", 2]],
   prog: {i: [6, 4, 1, 5], v: [1, 5, 6, 4], p: [4, 5, 3, 6], c: [6, 4, 1, 5], b: [4, 5, 4, 5], o: [1]}},
  {id: "candy", t: "캔디 팝", en: "Candy Pop", a: "Sweet 6", e: "🍭", bpm: 140, root: 65, mode: "maj", seed: 27, lead: "square",
   c: ["#f783ac", "#ffa94d"], d: "통통 튀는 달콤한 버블검 팝",
   form: [["i", 4], ["v", 8], ["p", 4], ["c", 8], ["v", 4], ["c", 8], ["o", 2]],
   prog: {i: [1, 5, 6, 4], v: [1, 6, 4, 5], p: [2, 5, 3, 6], c: [1, 5, 6, 4], b: [4, 5], o: [1]}},
  {id: "neon", t: "네온 하트", en: "Neon Heart", a: "VIOLET 4", e: "💜", bpm: 118, root: 62, mode: "min", seed: 43, lead: "saw",
   c: ["#5f3dc4", "#22b8cf"], d: "밤거리처럼 반짝이는 신스 댄스",
   form: [["i", 4], ["v", 8], ["p", 4], ["c", 8], ["b", 4], ["c", 8], ["o", 2]],
   prog: {i: [1, 6, 7, 5], v: [1, 6, 3, 7], p: [4, 5, 6, 5], c: [1, 6, 3, 7], b: [6, 7, 6, 7], o: [1]}},
  {id: "summer", t: "썸머 스플래시", en: "Summer Splash", a: "WAVE KIDS", e: "🌊", bpm: 108, root: 67, mode: "maj", seed: 58, lead: "pluck",
   c: ["#1098ad", "#fcc419"], d: "시원한 바다 트로피컬 하우스",
   form: [["i", 4], ["v", 8], ["p", 4], ["c", 8], ["b", 4], ["c", 8], ["o", 2]],
   prog: {i: [4, 1, 5, 6], v: [4, 1, 5, 6], p: [2, 3, 4, 5], c: [4, 5, 3, 6], b: [2, 5], o: [1]}},
  {id: "rocket", t: "드림 로켓", en: "Dream Rocket", a: "LAUNCH CREW", e: "🚀", bpm: 150, root: 60, mode: "min", seed: 71, lead: "bright",
   c: ["#e8590c", "#7950f2"], d: "우주로 슝! 빠르고 짜릿한 EDM",
   form: [["i", 4], ["v", 8], ["p", 4], ["c", 8], ["b", 4], ["c", 8], ["o", 2]],
   prog: {i: [1, 7, 6, 7], v: [1, 6, 7, 5], p: [4, 5, 6, 7], c: [1, 6, 3, 7], b: [4, 5], o: [1]}},
  {id: "champ", t: "우리반 챔피언", en: "Class Champion", a: "6-4 ALL STARS", e: "🏆", bpm: 132, root: 62, mode: "maj", seed: 96, lead: "square",
   c: ["#f08c00", "#e64980"], d: "다 같이 손뼉! 응원가 팝",
   form: [["i", 4], ["v", 8], ["p", 4], ["c", 8], ["b", 4], ["c", 8], ["o", 2]],
   prog: {i: [1, 4, 5, 1], v: [1, 4, 6, 5], p: [4, 5, 6, 5], c: [1, 5, 6, 4], b: [6, 4, 5, 5], o: [1]}}
];
const RH_SC = {maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10]};
function rhRng(seed){ let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s/4294967296; }; }

/* ---------- 작곡: 모양(구성)·화음·멜로디·베이스·드럼을 숫자 악보로 ---------- */
function rhCompose(S){
  const R = rhRng(S.seed), sc = RH_SC[S.mode], root = S.root;
  const deg = d => { const i = d - 1; return sc[((i % 7) + 7) % 7] + 12*Math.floor(i/7); };
  const triad = d => [deg(d), deg(d + 2), deg(d + 4)];
  const scaleNotes = []; for (let m = root - 24; m <= root + 36; m++) if (sc.includes(((m - root) % 12 + 12) % 12)) scaleNotes.push(m);
  const nearestIdx = m => { let b = 0; for (let i = 0; i < scaleNotes.length; i++) if (Math.abs(scaleNotes[i] - m) < Math.abs(scaleNotes[b] - m)) b = i; return b; };
  const ev = {kick: [], snare: [], clap: [], hat: [], ohat: [], crash: [], bass: [], lead: [], pad: [], stab: [], arp: [], riser: [], sec: []};
  const RHY = {
    v: [[0, 4, 6, 8, 12, 16, 20, 22, 24, 28], [0, 2, 4, 8, 10, 12, 16, 18, 20, 24], [0, 3, 6, 8, 12, 16, 19, 22, 24]],
    p: [[0, 4, 8, 12, 16, 20, 24, 26, 28, 30], [0, 2, 4, 8, 12, 16, 18, 20, 24, 28]],
    c: [[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28], [0, 2, 3, 6, 8, 10, 11, 14, 16, 18, 19, 22, 24, 26, 28], [0, 3, 6, 8, 10, 12, 14, 16, 19, 22, 24, 26, 28, 30]],
    b: [[0, 8, 12, 16, 24], [0, 6, 8, 16, 22, 24]]
  };
  const rhyOf = {}; Object.keys(RHY).forEach(k => rhyOf[k] = RHY[k][Math.floor(R()*RHY[k].length)]);
  const memo = {};
  function block(type, chords, key, last){
    if (memo[key] && !last) return memo[key];
    const on = rhyOf[type], center = root + 12 + (type === "c" ? 3 : type === "p" ? 1 : 0), lo = center - 7, hi = center + 9;
    let prev = null; const out = [];
    on.forEach((s, i) => {
      const bar = s < 16 ? 0 : 1, ct = triad(chords[bar]).map(x => (x % 12 + 12) % 12), next = i + 1 < on.length ? on[i + 1] : 32;
      let dur = Math.min(8, next - s); if (i === on.length - 1) dur = 32 - s;
      let m;
      const strong = s % 8 === 0 || (s % 4 === 0 && R() < .5);
      const chordNear = t => { let best = null; for (let x = lo; x <= hi; x++) if (ct.includes(((x - root) % 12 + 12) % 12) && (best === null || Math.abs(x - t) < Math.abs(best - t))) best = x; return best; };
      if (prev === null) m = chordNear(center - 2 + Math.floor(R()*5));
      else if (strong) m = chordNear(prev + Math.floor(R()*9) - 4);
      else {
        let dir = Math.abs(prev - center) > 5 ? -Math.sign(prev - center) : (R() < .5 ? -1 : 1);
        if (type === "p") dir = R() < .75 ? 1 : -1;
        const stp = R() < .72 ? 1 : 2, idx = nearestIdx(prev) + dir*stp; m = scaleNotes[Math.max(0, Math.min(scaleNotes.length - 1, idx))];
      }
      m = Math.max(lo, Math.min(hi, m)); prev = m; out.push({s, dur, m});
    });
    if (last && out.length){ const L = out[out.length - 1]; L.m = (function(){ let b = null; for (let x = lo; x <= hi; x++) if (((x - root) % 12 + 12) % 12 === (deg(chords[1]) % 12 + 12) % 12 && (b === null || Math.abs(x - L.m) < Math.abs(b - L.m))) b = x; return b === null ? L.m : b; })(); }
    if (!last) memo[key] = out;
    return out;
  }
  let bar0 = 0;
  S.form.forEach(([type, bars], si) => {
    const prog = S.prog[type] || S.prog.v, s0 = bar0*16;
    ev.sec.push({s: s0, type, bars});
    if (type === "p") ev.riser.push({s: s0 + (bars - 2)*16, e: s0 + bars*16});
    for (let b = 0; b < bars; b++){
      const s = s0 + b*16, cd = prog[b % prog.length], tri = triad(cd), last = b === bars - 1, nextType = S.form[si + 1] ? S.form[si + 1][0] : "";
      // 🥁 드럼
      const K = x => ev.kick.push({s: s + x}), SN = (x, v = 1) => ev.snare.push({s: s + x, v}), CL = x => ev.clap.push({s: s + x}), H = (x, v = 1) => ev.hat.push({s: s + x, v}), OH = x => ev.ohat.push({s: s + x});
      if (type === "i"){ if (b >= 1) [0, 2, 4, 6, 8, 10, 12, 14].forEach(x => H(x, .7)); if (b >= 2) [0, 8].forEach(K); if (last){ [8, 10, 12, 13, 14, 15].forEach((x, k) => SN(x, .4 + k*.1)); } }
      else if (type === "v"){ [0, 8].forEach(K); if (b % 2) K(10); else K(6); [4, 12].forEach(x => SN(x)); [0, 2, 4, 6, 8, 10, 12, 14].forEach(x => H(x, x % 4 ? .6 : .9)); if (last && nextType === "c") [12, 13, 14, 15].forEach((x, k) => SN(x, .5 + k*.15)); }
      else if (type === "p"){ [0, 4, 8, 12].forEach(K); [4, 12].forEach(x => SN(x)); [0, 2, 4, 6, 8, 10, 12, 14].forEach(x => H(x, .8));
        if (b === bars - 2) [0, 2, 4, 6, 8, 10, 12, 14].forEach((x, k) => SN(x, .35 + k*.04)); if (last) for (let x = 0; x < 16; x++) SN(x, .35 + x*.04); }
      else if (type === "c"){ [0, 4, 8, 12].forEach(K); [4, 12].forEach(x => { CL(x); SN(x, .7); }); for (let x = 0; x < 16; x++) if (x % 4 !== 2) H(x, x % 2 ? .45 : .7); [2, 6, 10, 14].forEach(OH);
        if (b === 0) ev.crash.push({s}); if (last && nextType && nextType !== "o") [12, 13, 14, 15].forEach((x, k) => SN(x, .5 + k*.15)); }
      else if (type === "b"){ if (b >= 2) [0, 8].forEach(K); [4, 12].forEach(CL); [0, 4, 8, 12].forEach(x => H(x, .6)); if (last) for (let x = 8; x < 16; x++) SN(x, .3 + (x - 8)*.08); }
      else if (type === "o"){ if (b === 0){ K(0); ev.crash.push({s}); } }
      // 🎸 베이스 (낮은 음 범위로 접어요)
      let br = root - 24 + deg(cd); while (br > root - 12) br -= 12; while (br < root - 26) br += 12;
      const BS = (x, d, o = 0) => ev.bass.push({s: s + x, d, m: br + o});
      if (type === "c") for (let x = 0; x < 16; x += 2) BS(x, 2, x % 4 === 2 ? 12 : 0);
      else if (type === "v") [[0, 3], [6, 2], [8, 3], [14, 2]].forEach(([x, d]) => BS(x, d));
      else if (type === "p") for (let x = 0; x < 16; x += 2) BS(x, 2);
      else if (type === "b") BS(0, 14);
      else if (type === "i" && b >= 2) [[0, 6], [8, 6]].forEach(([x, d]) => BS(x, d));
      else if (type === "o" && b === 0) BS(0, 16);
      // 🎹 화음
      const chord = tri.map(x => root + x).map(m => m > root + 9 ? m - 12 : m);
      if (type === "c"){ [2, 6, 10, 14].forEach(x => ev.stab.push({s: s + x, d: 1.5, ms: chord.map(m => m + 12)})); ev.pad.push({s, d: 16, ms: chord, v: .55}); }
      else if (type === "o"){ if (b === 0) ev.pad.push({s, d: 32, ms: chord, v: 1}); }
      else ev.pad.push({s, d: 16, ms: chord, v: 1});
      if (type === "i" || type === "p") for (let x = 0; x < 16; x++) ev.arp.push({s: s + x, m: chord[[0, 1, 2, 1][x % 4]] + 12 + (x % 8 >= 4 ? 12 : 0)});
    }
    // 🎤 멜로디 (2마디씩 같은 가락을 되풀이해서 귀에 쏙)
    if (RHY[type]) for (let b = 0; b < bars; b += 2){
      const chords = [prog[b % prog.length], prog[(b + 1) % prog.length]], last = b + 2 >= bars && (type === "c" || type === "b");
      block(type, chords, `${type}${(b/2) % 2}`, last).forEach(n => ev.lead.push({s: s0 + b*16 + n.s, d: n.dur, m: n.m, type}));
    }
    if (type === "o") ev.lead.push({s: s0, d: 24, m: root + 12, type});
    bar0 += bars;
  });
  ev.steps = bar0*16;
  return ev;
}

/* ---------- 녹음: 숫자 악보를 실제 소리로 ----------
   ⚡ 웹 오디오로 수천 개 소리 부품을 만들어 녹음하면 태블릿에서 수십 초가 걸려서,
      소리 계산을 직접 해요(파형·필터·울림). 뒤에서 일하는 일꾼(Worker)이 계산해서 화면은 안 멈춰요. */
const RH_BUF = new Map(), RH_PLAN = new Map(), RH_LOAD = new Map();
function rhPlan(S){ let p = RH_PLAN.get(S.id); if (!p){ p = rhCompose(S); RH_PLAN.set(S.id, p); } return p; }
function rhSynth(ev, S, SR){
  const st = 60/S.bpm/4, N = Math.ceil((ev.steps*st + 2.2)*SR), T = s => s*st;
  const Lb = new Float32Array(N), Rb = new Float32Array(N), DS = new Float32Array(N), PD = new Float32Array(N);
  const TAU = Math.PI*2, hz = m => 440*Math.pow(2, (m - 69)/12);
  let sd = 22222; const nz = () => { sd ^= sd << 13; sd ^= sd >>> 17; sd ^= sd << 5; return ((sd >>> 0)/4294967296)*2 - 1; };
  function BQ(type){ const o = {b0: 1, b1: 0, b2: 0, a1: 0, a2: 0, x1: 0, x2: 0, y1: 0, y2: 0,
      set(f, q){ f = Math.min(f, SR*.45); const w = TAU*f/SR, c = Math.cos(w), s = Math.sin(w), al = s/(2*q), a0 = 1 + al;
        if (type === "lp"){ o.b0 = (1 - c)/2/a0; o.b1 = (1 - c)/a0; o.b2 = o.b0; }
        else if (type === "hp"){ o.b0 = (1 + c)/2/a0; o.b1 = -(1 + c)/a0; o.b2 = o.b0; }
        else { o.b0 = al/a0; o.b1 = 0; o.b2 = -al/a0; }
        o.a1 = -2*c/a0; o.a2 = (1 - al)/a0; return o; },
      p(x){ const y = o.b0*x + o.b1*o.x1 + o.b2*o.x2 - o.a1*o.y1 - o.a2*o.y2; o.x2 = o.x1; o.x1 = x; o.y2 = o.y1; o.y1 = y; return y; } }; return o; }
  const blep = (t, dt) => t < dt ? (t /= dt, t + t - t*t - 1) : t > 1 - dt ? (t = (t - 1)/dt, t*t + t + t + 1) : 0;
  const saw = (ph, dt) => 2*ph - 1 - blep(ph, dt);
  const sqr = (ph, dt) => (ph < .5 ? 1 : -1) + blep(ph, dt) - blep((ph + .5) % 1, dt);
  const tri = ph => 4*Math.abs(ph - .5) - 1;
  const put = (i, v, pan) => { if (i < 0 || i >= N) return; Lb[i] += v*(1 - Math.max(0, pan)); Rb[i] += v*(1 + Math.min(0, pan)); };
  const noiseHit = (t0, d, type, f, q, v, pan = 0, f1) => { const b = BQ(type).set(f, q), i0 = Math.round(t0*SR), n = Math.round(d*SR), k = Math.log(.001)/n;
    for (let i = 0; i < n; i++){ if (f1 && i % 32 === 0) b.set(f*Math.pow(f1/f, i/n), q); put(i0 + i, b.p(nz())*v*Math.exp(k*i), pan); } };
  const DR = .78, MU = .85;
  ev.kick.forEach(e => { const i0 = Math.round(T(e.s)*SR), n = Math.round(.36*SR); let ph = 0;
    for (let i = 0; i < n; i++){ const t = i/SR, f = 155*Math.pow(46/155, Math.min(1, t/.13)); ph += f/SR; put(i0 + i, Math.sin(TAU*ph)*Math.pow(.001, t/.34)*DR, 0); }
    noiseHit(T(e.s), .012, "hp", 3000, .7, .25*DR); });
  ev.snare.forEach(e => { const v = e.v || 1; noiseHit(T(e.s), .17, "bp", 1900, .8, .9*v*DR); const i0 = Math.round(T(e.s)*SR), n = Math.round(.1*SR); let ph = 0;
    for (let i = 0; i < n; i++){ const t = i/SR; ph += (200 - 50*Math.min(1, t/.08))/SR; put(i0 + i, tri(ph % 1)*.4*v*Math.pow(.001, t/.1)*DR, 0); } });
  ev.clap.forEach(e => { [0, .011, .022].forEach(d => noiseHit(T(e.s) + d, .02, "bp", 1250, 1.2, .8*DR)); noiseHit(T(e.s) + .03, .16, "bp", 1250, 1.1, .6*DR); });
  ev.hat.forEach((e, k) => noiseHit(T(e.s), .045, "hp", 7800, .7, .3*(e.v || 1)*DR, k % 2 ? .25 : -.25));
  ev.ohat.forEach(e => noiseHit(T(e.s), .2, "hp", 6800, .7, .2*DR, .15));
  ev.crash.forEach(e => noiseHit(T(e.s), 1.3, "hp", 4200, .5, .35*DR, -.1));
  ev.riser.forEach(r => { const b = BQ("bp"), i0 = Math.round(T(r.s)*SR), n = Math.round((T(r.e) - T(r.s))*SR);
    for (let i = 0; i < n; i++){ const k = i/n; if (i % 32 === 0) b.set(400*Math.pow(7000/400, k), 2); put(i0 + i, b.p(nz())*.001*Math.pow(.32/.001, k)*MU*1.6, 0); } });
  ev.bass.forEach(e => { const t0 = T(e.s), d = T(e.d)*.92, f = hz(e.m), dt = f/SR, b = BQ("lp"), i0 = Math.round(t0*SR), n = Math.round((d + .06)*SR); let ph = 0;
    for (let i = 0; i < n; i++){ const t = i/SR; if (i % 32 === 0) b.set(900*Math.pow(260/900, Math.min(1, t/Math.min(.25, d))), 3);
      ph += dt; if (ph >= 1) ph -= 1;
      const a = t < .005 ? t/.005 : t < d - .04 ? 1 : Math.pow(.001, (t - d + .04)/.05);
      put(i0 + i, (b.p(saw(ph, dt))*.8 + Math.sin(TAU*ph)*.7)*.3*a*MU, 0); } });
  // 🎹 패드 (킥에 맞춰 숨 쉬듯)
  ev.pad.forEach(p => { const t0 = T(p.s), d = T(p.d), i0 = Math.round(t0*SR), n = Math.round((d + .3)*SR), v = .045*(p.v || 1);
    p.ms.forEach(m => [-9, 9].forEach(dc => { const f = hz(m)*Math.pow(2, dc/1200), dt = f/SR; let ph = (m*.137 + dc) % 1; if (ph < 0) ph += 1;
      for (let i = 0; i < n; i++){ const t = i/SR, a = t < .18 ? t/.18 : t < d - .1 ? 1 : Math.pow(.001, (t - d + .1)/.25); ph += dt; if (ph >= 1) ph -= 1; const j = i0 + i; if (j < N) PD[j] += saw(ph, dt)*v*a; } })); });
  { const b = BQ("lp").set(1500, .7), kicks = ev.kick.map(e => Math.round(T(e.s)*SR)), rise = st*3*SR; let ki = 0, last = -1e9;
    for (let i = 0; i < N; i++){ while (ki < kicks.length && kicks[ki] <= i){ last = kicks[ki]; ki++; } const g = i - last < rise ? .35 + .65*(i - last)/rise : 1; const v = b.p(PD[i])*g*MU; Lb[i] += v; Rb[i] += v; } }
  const pluck = (t0, m, v, d, pan) => { const f = hz(m), dt = f/SR, b = BQ("lp"), i0 = Math.round(t0*SR), n = Math.round((d + .06)*SR); let ph = 0;
    for (let i = 0; i < n; i++){ const t = i/SR; if (i % 32 === 0) b.set(4200*Math.pow(500/4200, Math.min(1, t/d)), 4); ph += dt; if (ph >= 1) ph -= 1; put(i0 + i, b.p(saw(ph, dt))*v*Math.pow(.001, t/(d + .05))*MU, pan); } };
  ev.stab.forEach(s => s.ms.forEach((m, k) => pluck(T(s.s), m, .07, .16, (k - 1)*.3)));
  ev.arp.forEach((a, k) => pluck(T(a.s), a.m, .06, .14, k % 2 ? .35 : -.35));
  // 🎤 멜로디
  const OS = S.lead === "square" ? [["q", -6], ["q", 6]] : S.lead === "saw" ? [["s", -8], ["s", 8], ["q", 0]] : S.lead === "pluck" ? [["t", 0], ["s", 5]] : [["s", -7], ["q", 7]];
  ev.lead.forEach(e => { const t0 = T(e.s), d = Math.max(.08, T(e.d) - .03), b = BQ("lp").set(S.lead === "pluck" ? 2400 : 3600, 1.2), i0 = Math.round(t0*SR), n = Math.round((d + .2)*SR);
    const v = (S.lead === "saw" ? .11 : S.lead === "pluck" ? .2 : .13)*(e.type === "c" ? 1.1 : 1), ph = OS.map((o, k) => k*.31), f0 = hz(e.m);
    for (let i = 0; i < n; i++){ const t = i/SR;
      if (S.lead === "pluck" && i % 32 === 0) b.set(5000*Math.pow(900/5000, Math.min(1, t/Math.min(.4, d))), 1.2);
      const vib = d > .3 && t > .18 ? Math.sin(TAU*5.5*(t - .18))*12*Math.min(1, (t - .18)/.2) : 0;
      let x = 0; for (let k = 0; k < OS.length; k++){ const dt = f0*Math.pow(2, (OS[k][1] + vib)/1200)/SR; ph[k] += dt; if (ph[k] >= 1) ph[k] -= 1; const w = OS[k][0]; x += w === "s" ? saw(ph[k], dt) : w === "q" ? sqr(ph[k], dt)*.8 : tri(ph[k]); }
      const a = S.lead === "pluck" ? Math.pow(.001, t/(d + .15)) : t < .012 ? t/.012 : t < d - .02 ? 1 : Math.pow(.001, (t - d + .02)/.12);
      const y = b.p(x*.5)*v*a*MU, j = i0 + i; if (j < N){ Lb[j] += y; Rb[j] += y; DS[j] += y*.5; } } });
  // 메아리(딜레이)
  { const D = Math.round(st*3*SR), b = BQ("lp").set(2600, .7), buf = new Float32Array(D); let w = 0;
    for (let i = 0; i < N; i++){ const out = buf[w], f = b.p(out); buf[w] = DS[i] + f*.3; w = (w + 1) % D; Lb[i] += f*.3*.8; Rb[i] += f*.3*1.1; } }
  // 마무리: 부드럽게 눌러 주기(소리가 깨지지 않게)
  let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(Lb[i]), Math.abs(Rb[i]));
  const pre = 1.15/Math.max(.6, pk*.55);
  for (let i = 0; i < N; i++){ Lb[i] = Math.tanh(Lb[i]*pre)*.86; Rb[i] = Math.tanh(Rb[i]*pre)*.86; }
  return {L: Lb, R: Rb, SR};
}
function rhSynthAsync(ev, S, SR){
  return new Promise(ok => {
    let w = null;
    try { const code = `const rhSynth = ${rhSynth.toString()};\nonmessage = e => { const r = rhSynth(e.data.ev, e.data.S, e.data.SR); postMessage(r, [r.L.buffer, r.R.buffer]); };`;
      w = new Worker(URL.createObjectURL(new Blob([code], {type: "text/javascript"}))); } catch(e) { w = null; }
    if (!w){ setTimeout(() => ok(rhSynth(ev, S, SR)), 30); return; }
    const to = setTimeout(() => { try { w.terminate(); } catch(e) {} ok(rhSynth(ev, S, SR)); }, 20000);
    w.onmessage = e => { clearTimeout(to); w.terminate(); ok(e.data); };
    w.onerror = () => { clearTimeout(to); try { w.terminate(); } catch(e) {} ok(rhSynth(ev, S, SR)); };
    w.postMessage({ev, S: {bpm: S.bpm, lead: S.lead}, SR});
  });
}
function rhRender(S){
  if (RH_BUF.has(S.id)) return Promise.resolve(RH_BUF.get(S.id));
  if (RH_LOAD.has(S.id)) return RH_LOAD.get(S.id);
  const p = rhSynthAsync(rhPlan(S), S, 32000).then(r => { const a = getAC(), b = a.createBuffer(2, r.L.length, r.SR); b.copyToChannel(r.L, 0); b.copyToChannel(r.R, 1); RH_BUF.set(S.id, b); RH_LOAD.delete(S.id); return b; });
  RH_LOAD.set(S.id, p); return p;
}

/* ---------- 악보 만들기 (쉬움·보통·어려움) ---------- */
function rhChart(S, diff){
  const ev = rhPlan(S), st = 60/S.bpm/4, secAt = s => { let t = "v"; for (const x of ev.sec) if (x.s <= s) t = x.type; return t; };
  const cand = [];
  ev.lead.forEach(n => cand.push({s: n.s, m: n.m, d: n.d, k: "m", p: 3}));
  ev.kick.forEach(k => cand.push({s: k.s, k: "k", p: 1, sec: secAt(k.s)}));
  ev.clap.forEach(k => cand.push({s: k.s, k: "s", p: 2, sec: "c"}));
  ev.snare.forEach(k => { if (k.v >= .9) cand.push({s: k.s, k: "s", p: 1.5, sec: secAt(k.s)}); });
  const gap = [4, 2, 1][diff], holdMin = [8, 6, 6][diff];
  let pick = cand.filter(n => {
    if (n.k === "m") return diff === 2 || n.s % 2 === 0;
    if (diff === 0) return n.k === "k" && n.s % 8 === 0 && "ivbo".includes(n.sec);
    if (diff === 1) return n.k === "k" ? n.s % 4 === 0 && "ib".includes(n.sec) : false;
    return n.k === "k" ? n.s % 4 === 0 : n.k === "s";
  }).sort((a, b) => a.s - b.s || b.p - a.p);
  const out = []; let lastS = -99, run = 0;
  for (const n of pick){
    if (out.length && n.s - lastS < gap) continue;
    if (diff === 2){ run = n.s - lastS === 1 ? run + 1 : 0; if (run >= 4) continue; }
    out.push(n); lastS = n.s;
  }
  // 줄 정하기: 멜로디는 높으면 오른쪽·낮으면 왼쪽, 북은 바깥/안쪽 번갈아
  const busy = [-1, -1, -1, -1], notes = []; let pL = 1, pM = null, pS = -99, kc = 0, scn = 0;
  const free = (L, s) => busy[L] < s - 1;
  for (const n of out){
    let L;
    if (n.k === "m"){
      if (pM === null) L = 1; else { const d = n.m - pM; L = d > 0 ? pL + (d > 4 ? 2 : 1) : d < 0 ? pL - (d < -4 ? 2 : 1) : (n.s - pS <= 2 ? (pL <= 1 ? pL + 1 : pL - 1) : pL); }
      pM = n.m;
    } else if (n.k === "k") L = kc++ % 2 ? 3 : 0; else L = scn++ % 2 ? 2 : 1;
    if (L < 0) L = 1; if (L > 3) L = 2;
    if (L === pL && n.s - pS < (diff === 2 ? 2 : 3)) L = pL <= 1 ? pL + 1 : pL - 1;
    if (!free(L, n.s)){ const alt = [L - 1, L + 1, L - 2, L + 2].filter(x => x >= 0 && x <= 3 && free(x, n.s) && !(x === pL && n.s - pS < 2)); if (!alt.length) continue; L = alt[0]; }
    const note = {t: n.s*st, l: L};
    if (n.k === "m" && n.d >= holdMin){ const hd = n.d - 2; note.e = (n.s + hd)*st; busy[L] = n.s + hd; }
    notes.push(note); pL = L; pS = n.s;
    // 어려움: 후렴 마디 첫 박엔 두 줄 동시에
    if (diff === 2 && n.s % 16 === 0 && secAt(n.s) === "c"){ const L2 = 3 - L; if (L2 !== L && free(L2, n.s)) notes.push({t: n.s*st, l: L2}); }
  }
  notes.sort((a, b) => a.t - b.t || a.l - b.l);
  return notes;
}
const rhLv = (notes, dur) => Math.max(1, Math.min(15, Math.round(notes.length/Math.max(20, dur)*2.4 + (notes.filter(n => n.e).length > 6 ? .5 : 0))));

/* =====================================================================
   🎧 내 노래: 이 기기의 음악 파일 → 박자 찾기 → 악보 (파일은 이 기기 안에만 저장)
   ===================================================================== */
const RHDB = {
  db: null,
  open(){ if (this.db) return Promise.resolve(this.db);
    return new Promise((ok, no) => { try { const r = indexedDB.open("arcade-rhythm", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("songs", {keyPath: "id"});
      r.onsuccess = () => { this.db = r.result; ok(this.db); }; r.onerror = () => no(r.error); } catch(e) { no(e); } }); },
  async all(){ const db = await this.open(); return new Promise(ok => { const out = []; const q = db.transaction("songs").objectStore("songs").openCursor();
    q.onsuccess = () => { const c = q.result; if (c){ const v = c.value; out.push({id: v.id, t: v.t, at: v.at, dur: v.dur, size: v.size}); c.continue(); } else ok(out.sort((a, b) => a.at - b.at)); }; q.onerror = () => ok(out); }); },
  async get(id){ const db = await this.open(); return new Promise(ok => { const q = db.transaction("songs").objectStore("songs").get(id); q.onsuccess = () => ok(q.result); q.onerror = () => ok(null); }); },
  async put(v){ const db = await this.open(); return new Promise((ok, no) => { const tx = db.transaction("songs", "readwrite"); tx.objectStore("songs").put(v); tx.oncomplete = ok; tx.onerror = () => no(tx.error); }); },
  async del(id){ const db = await this.open(); return new Promise(ok => { const tx = db.transaction("songs", "readwrite"); tx.objectStore("songs").delete(id); tx.oncomplete = ok; tx.onerror = ok; }); }
};
/* 소리를 낮은·가운데·높은 소리로 나눠 '쿵·짝·칙'이 생기는 순간을 찾아요 */
async function rhAnalyze(buf){
  const SR = 11025, n = Math.ceil(buf.duration*SR), OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const c = new OAC(3, n, SR), src = c.createBufferSource(); src.buffer = buf;
  const mg = c.createChannelMerger(3);
  [["lowpass", 180, .7], ["bandpass", 1200, .6], ["highpass", 4000, .7]].forEach(([ty, f, q], i) => { const b = c.createBiquadFilter(); b.type = ty; b.frequency.value = f; b.Q.value = q; src.connect(b); b.connect(mg, 0, i); });
  mg.connect(c.destination); src.start();
  const r = await c.startRendering(), hop = Math.round(SR*.01), F = Math.floor(n/hop);
  const bands = [0, 1, 2].map(ch => { const d = r.getChannelData(ch), e = new Float32Array(F);
    for (let f = 0; f < F; f++){ let s = 0; const o = f*hop; for (let i = 0; i < hop; i++){ const v = d[o + i] || 0; s += v*v; } e[f] = Math.log(1e-6 + s/hop); }
    const fl = new Float32Array(F); for (let f = 1; f < F; f++) fl[f] = Math.max(0, e[f] - e[f - 1]);
    return fl; });
  const W = [1.2, 1, .7], on = [];
  for (let f = 2; f < F - 2; f++){
    let best = -1, bs = 0; for (let b = 0; b < 3; b++){ const v = bands[b][f]*W[b]; if (v > bs){ bs = v; best = b; } }
    if (best < 0) continue;
    const fl = bands[best]; if (!(fl[f] >= fl[f - 1] && fl[f] > fl[f + 1] && fl[f] >= fl[f - 2] && fl[f] >= fl[f + 2])) continue;
    let m = 0, m2 = 0, k = 0; for (let j = Math.max(0, f - 50); j < Math.min(F, f + 50); j++){ m += fl[j]; m2 += fl[j]*fl[j]; k++; }
    m /= k; const sd = Math.sqrt(Math.max(0, m2/k - m*m));
    if (fl[f] > m + 1.4*sd && fl[f] > .25) on.push({t: f*.01, b: best, v: (fl[f] - m)/(sd + 1e-3)*W[best]});
  }
  return on;
}
function rhChartFrom(on, dur, diff){
  const gap = [.36, .22, .14][diff], dens = [1.25, 2.1, 3.2][diff], want = Math.round(dur*dens);
  const sorted = on.filter(o => o.t > 1 && o.t < dur - .5).sort((a, b) => b.v - a.v), taken = [];
  const ok = t => { for (const x of taken) if (Math.abs(x.t - t) < gap) return false; return true; };
  for (const o of sorted){ if (taken.length >= want) break; if (ok(o.t)) taken.push(o); }
  taken.sort((a, b) => a.t - b.t);
  const notes = []; let pL = 1, kc = 0, mc = 0, pt = -9;
  taken.forEach(o => {
    let L = o.b === 0 ? (kc++ % 2 ? 3 : 0) : o.b === 2 ? (mc++ % 2 ? 1 : 2) : [1, 2, 0, 3][mc++ % 4];
    if (L === pL && o.t - pt < .3) L = (L + 2) % 4;
    notes.push({t: +o.t.toFixed(3), l: L}); pL = L; pt = o.t;
  });
  return notes;
}

/* =====================================================================
   🎵 리듬 스타 게임
   ===================================================================== */
const RH_JW = [.05, .09, .135];            // 판정 창(초): PERFECT · GREAT · GOOD
const RH_JN = ["PERFECT", "GREAT", "GOOD", "MISS"], RH_JC = ["#fff27a", "#7cf3ff", "#9dff9a", "#ff7b9c"], RH_JV = [1, .75, .4, 0];
const RH_LANE = ["#ff7ad9", "#6ee7ff", "#6ee7ff", "#ff7ad9"], RH_KEYN = ["D", "F", "J", "K"];
const RH_PREF = () => { try { return Object.assign({speed: 2.5, emo: 0, off: 0, tap: true, vol: .9, song: "star", diff: 0}, JSON.parse(localStorage.getItem("arcade.rh.pref")) || {}); } catch(e) { return {speed: 2.5, emo: 0, off: 0, tap: true, vol: .9, song: "star", diff: 0}; } };
const rhSavePref = p => { try { localStorage.setItem("arcade.rh.pref", JSON.stringify(p)); } catch(e) {} };
const rhBestKey = sid => "arcade.rh.best." + sid;
const rhBests = sid => { try { return JSON.parse(localStorage.getItem(rhBestKey(sid))) || {}; } catch(e) { return {}; } };

let RH_QUICK = false;
{ const _again = NG.again; NG.again = function(){ RH_QUICK = this.gid === "rh"; return _again.apply(this, arguments); }; }
NG.defs.rh = () => {
  const SID = NG.sids[0], pref = RH_PREF();
  let W = 1280, H = 720, land = true, L = {};
  let phase = "menu", song = null, chart = [], buf = null, src = null, gain = null, T0 = 0, dur = 0, lead = 1.6;
  let notes = [], ptr = [0, 0, 0, 0], held = [null, null, null, null], down = [0, 0, 0, 0], beam = [0, 0, 0, 0], ptrLane = {};
  let score = 0, combo = 0, maxC = 0, cnt = [0, 0, 0, 0], jSum = 0, jN = 0, totalJ = 1, life = 1000, judge = null, fx = [], emo = [], fail = false, endAt = 0;
  let preview = null, menuEl = null, avImgC = null, tapBuf = null, pausedAt = 0, bpm = 120, beat0 = 0, hitFlash = 0;
  const ac = () => getAC();

  /* ---- 화면 배치 ---- */
  function layout(sw, sh){
    land = sw/Math.max(1, sh) >= 1;
    if (land){ W = 1280; H = 720; L = {cx: 640, hy: 74, jy: 590, bw: 300, av: {x: 150, y: 470, h: 300}, cb: {x: 1115, y: 250}, pad: 650}; }
    else { W = 720; H = 1280; L = {cx: 360, hy: 300, jy: 1040, bw: 320, av: {x: 120, y: 250, h: 170}, cb: {x: 600, y: 200}, pad: 1150}; }
    L.s1 = .3/(1.3); L.lw = L.bw/2;
  }
  const sAt = d => .3/(.3 + Math.max(-.22, d));
  const yOf = s => L.jy - (1 - s)/(1 - L.s1)*(L.jy - L.hy);
  const xOf = (lane, s) => L.cx + (lane - 2)*L.lw*s;
  const sOfY = y => 1 - (L.jy - y)*(1 - L.s1)/(L.jy - L.hy);

  /* ---- 그림 (한 번만 그려 두는 것들) ---- */
  function bgDraw(t){
    const gr = t.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#0b0628"); gr.addColorStop(.45, "#2a1468"); gr.addColorStop(.75, "#1d2a8a"); gr.addColorStop(1, "#0a0a2a");
    t.fillStyle = gr; t.fillRect(0, 0, W, H);
    const R = rhRng(7);
    for (let i = 0; i < 90; i++){ t.globalAlpha = .25 + R()*.6; t.fillStyle = "#fff"; const s = R()*2 + .6; t.fillRect(R()*W, R()*L.hy*2.4, s, s); } t.globalAlpha = 1;
    // 도시 불빛
    const base = L.hy + (L.jy - L.hy)*.42;
    for (let x = -20; x < W; ){ const w = 30 + R()*70, h = 40 + R()*160, d = Math.abs(x + w/2 - L.cx)/W;
      t.fillStyle = `rgba(${40 + d*40},${20 + d*30},${110 + d*60},.85)`; t.fillRect(x, base - h, w, h + 400);
      t.fillStyle = "rgba(255,220,140,.5)"; for (let wy = base - h + 8; wy < base - 6; wy += 13) for (let wx = x + 5; wx < x + w - 6; wx += 11) if (R() < .35) t.fillRect(wx, wy, 5, 6);
      x += w + 6 + R()*10; }
    // 바닥 그물
    t.strokeStyle = "rgba(160,120,255,.25)"; t.lineWidth = 1.5;
    for (let i = 0; i < 14; i++){ const y = base + Math.pow(i/13, 1.8)*(H - base); t.beginPath(); t.moveTo(0, y); t.lineTo(W, y); t.stroke(); }
    for (let i = -16; i <= 16; i++){ t.beginPath(); t.moveTo(L.cx + i*30, base); t.lineTo(L.cx + i*240, H); t.stroke(); }
    // 양쪽 빛 기둥
    [[L.cx - L.bw*1.9, -.35], [L.cx + L.bw*1.9, .35]].forEach(([x, k]) => { const g2 = t.createLinearGradient(0, H, 0, L.hy); g2.addColorStop(0, "rgba(120,220,255,.55)"); g2.addColorStop(1, "rgba(120,220,255,0)");
      t.fillStyle = g2; t.beginPath(); t.moveTo(x - 40, H); t.lineTo(x + 40, H); t.lineTo(x + 40 + k*500, L.hy); t.lineTo(x - 40 + k*500, L.hy); t.closePath(); t.fill(); });
    // 길
    const yb = H + 40, sb = sOfY(yb);
    t.fillStyle = "rgba(14,8,40,.82)"; t.beginPath(); t.moveTo(xOf(0, L.s1), L.hy); t.lineTo(xOf(4, L.s1), L.hy); t.lineTo(xOf(4, sb), yb); t.lineTo(xOf(0, sb), yb); t.closePath(); t.fill();
    for (let l = 0; l < 4; l++){ const g3 = t.createLinearGradient(0, L.hy, 0, L.jy); g3.addColorStop(0, "rgba(255,255,255,0)"); g3.addColorStop(1, l % 3 ? "rgba(110,231,255,.10)" : "rgba(255,122,217,.10)");
      t.fillStyle = g3; t.beginPath(); t.moveTo(xOf(l, L.s1), L.hy); t.lineTo(xOf(l + 1, L.s1), L.hy); t.lineTo(xOf(l + 1, sb), yb); t.lineTo(xOf(l, sb), yb); t.closePath(); t.fill(); }
    for (let l = 0; l <= 4; l++){ t.strokeStyle = l === 0 || l === 4 ? "#b48cff" : "rgba(200,180,255,.45)"; t.lineWidth = l === 0 || l === 4 ? 4 : 2;
      t.beginPath(); t.moveTo(xOf(l, L.s1), L.hy); t.lineTo(xOf(l, sb), yb); t.stroke(); }
    // 판정선
    const jx0 = xOf(0, 1) - 14, jx1 = xOf(4, 1) + 14;
    t.fillStyle = "rgba(255,255,255,.18)"; t.fillRect(jx0, L.jy - 14, jx1 - jx0, 28);
    t.fillStyle = "#fff"; t.fillRect(jx0, L.jy - 3, jx1 - jx0, 6);
    t.fillStyle = "rgba(180,140,255,.9)"; t.fillRect(jx0, L.jy - 7, jx1 - jx0, 2); t.fillRect(jx0, L.jy + 5, jx1 - jx0, 2);
    // 아바타 무대
    const a = L.av, sg = t.createRadialGradient(a.x, a.y + a.h*.5, 4, a.x, a.y + a.h*.5, a.h*.55); sg.addColorStop(0, "rgba(255,150,240,.7)"); sg.addColorStop(1, "rgba(255,150,240,0)");
    t.fillStyle = sg; t.beginPath(); t.ellipse(a.x, a.y + a.h*.5, a.h*.55, a.h*.16, 0, 0, 7); t.fill();
    t.strokeStyle = "rgba(255,200,250,.9)"; t.lineWidth = 3; t.beginPath(); t.ellipse(a.x, a.y + a.h*.5, a.h*.4, a.h*.1, 0, 0, 7); t.stroke();
    // 터치 패드
    for (let l = 0; l < 4; l++){ const x0 = xOf(l, sOfY(L.pad)), x1 = xOf(l + 1, sOfY(L.pad));
      t.fillStyle = "rgba(255,255,255,.07)"; rrect(t, x0 + 6, L.pad - 34, x1 - x0 - 12, 68, 18); t.fill();
      t.strokeStyle = "rgba(255,255,255,.22)"; t.lineWidth = 2; t.stroke();
      t.fillStyle = "rgba(255,255,255,.55)"; t.font = `28px "Jua",sans-serif`; t.textAlign = "center"; t.textBaseline = "middle"; t.fillText(RH_KEYN[l], (x0 + x1)/2, L.pad); }
  }
  const noteSpr = (l, w) => G2.spr(`rhn${l}${w}`, w + 24, 44, t => {
    t.shadowColor = RH_LANE[l]; t.shadowBlur = 14;
    const g = t.createLinearGradient(0, 10, 0, 34); g.addColorStop(0, "#fff"); g.addColorStop(.45, RH_LANE[l]); g.addColorStop(1, RH_LANE[l]);
    t.fillStyle = g; rrect(t, 12, 10, w, 24, 9); t.fill(); t.shadowBlur = 0;
    t.fillStyle = "rgba(255,255,255,.85)"; rrect(t, 18, 13, w - 12, 5, 3); t.fill(); });
  const beamSpr = l => G2.spr(`rhb${l}`, 64, 256, t => { const g = t.createLinearGradient(0, 256, 0, 0); g.addColorStop(0, RH_LANE[l]); g.addColorStop(1, "rgba(255,255,255,0)"); t.globalAlpha = .55; t.fillStyle = g; t.fillRect(0, 0, 64, 256); });
  const ringSpr = l => G2.spr(`rhr${l}`, 160, 160, t => { t.strokeStyle = RH_LANE[l]; t.shadowColor = RH_LANE[l]; t.shadowBlur = 16; t.lineWidth = 8; t.beginPath(); t.ellipse(80, 80, 60, 30, 0, 0, 7); t.stroke();
    t.fillStyle = "rgba(255,255,255,.85)"; t.beginPath(); t.ellipse(80, 80, 26, 12, 0, 0, 7); t.fill(); });
  const glowSpr = () => G2.spr("rhglow", 256, 128, t => { const g = t.createRadialGradient(128, 64, 4, 128, 64, 128); g.addColorStop(0, "rgba(255,170,255,.75)"); g.addColorStop(1, "rgba(255,170,255,0)"); t.fillStyle = g; t.fillRect(0, 0, 256, 128); });
  /* 숫자는 글자 그림을 붙여요 (바뀔 때마다 테두리 글씨를 새로 만들지 않게) */
  const DIG = "0123456789,%";
  function digSpr(ch, size, col){ return G2.spr(`rhd${ch}${size}${col}`, size*.72, size*1.2, t => {
    t.font = `${size}px "Jua",sans-serif`; t.textAlign = "center"; t.textBaseline = "middle"; t.lineJoin = "round";
    t.lineWidth = size*.16; t.strokeStyle = "rgba(30,10,70,.9)"; t.strokeText(ch, size*.36, size*.62); t.fillStyle = col; t.fillText(ch, size*.36, size*.62); }); }
  function num(g, txt, x, y, size, col = "#fff", align = "left"){
    txt = String(txt); const cw = size*.6, w = [...txt].reduce((a, ch) => a + (ch === "," ? cw*.42 : cw), 0); let px = align === "center" ? x - w/2 : align === "right" ? x - w : x;
    for (const ch of txt){ const s = digSpr(ch, size, col), c = ch === ","; g.drawImage(s, px - size*(c ? .22 : .06), y - size*.6, s.w, s.h); px += c ? cw*.42 : cw; }
  }

  /* ---- 소리 ---- */
  function clock(ts){
    const a = ac(); let ct;
    const o = a.getOutputTimestamp ? a.getOutputTimestamp() : null, pn = performance.now();
    if (o && o.performanceTime > 0 && o.contextTime > 0) ct = o.contextTime + ((ts === undefined ? pn : ts) - o.performanceTime)/1000;
    else ct = a.currentTime - (a.outputLatency || a.baseLatency || 0) - (pn - (ts === undefined ? pn : ts))/1000;
    return ct - T0 + pref.off/1000;
  }
  function tapSound(perfect){
    if (!pref.tap) return;
    try { const a = ac();
      if (!tapBuf){ const n = Math.round(a.sampleRate*.06); tapBuf = a.createBuffer(1, n, a.sampleRate); const d = tapBuf.getChannelData(0);
        for (let i = 0; i < n; i++){ const k = i/n; d[i] = (Math.sin(i/a.sampleRate*2*Math.PI*1800)*.5 + (Math.random()*2 - 1)*.5)*Math.pow(1 - k, 6); } }
      const s = a.createBufferSource(), g = a.createGain(); s.buffer = tapBuf; s.playbackRate.value = perfect ? 1.15 : .95; g.gain.value = .22; s.connect(g); g.connect(a.destination); s.start(); } catch(e) {}
  }
  function stopPreview(){ if (preview){ try { preview.g.gain.setTargetAtTime(0, ac().currentTime, .08); preview.s.stop(ac().currentTime + .4); } catch(e) {} preview = null; } }
  function startPreview(b, from){
    stopPreview(); const a = ac(), s = a.createBufferSource(), g = a.createGain(); s.buffer = b; s.connect(g); g.connect(a.destination);
    const t = a.currentTime + .05, st = Math.max(0, Math.min(from, b.duration - 14)); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.5*pref.vol, t + .6); g.gain.setValueAtTime(.5*pref.vol, t + 11); g.gain.linearRampToValueAtTime(0, t + 13);
    s.start(t, st, 13.2); preview = {s, g}; s.onended = () => { if (preview && preview.s === s) preview = null; };
  }

  /* ---- 노래 고르는 화면 (HTML) ---- */
  let mine = [], busy = false, sel = null, starting = false;
  const isMine = id => String(id).startsWith("my:");
  const songOf = id => RH_SONGS.find(s => s.id === id) || mine.find(m => "my:" + m.id === id);
  async function loadBuf(id){
    if (RH_BUF.has(id)) return RH_BUF.get(id);
    if (isMine(id)){ const v = await RHDB.get(id.slice(3)); if (!v) throw new Error("없음"); const b = await ac().decodeAudioData(v.data.slice(0)); RH_BUF.set(id, b); return b; }
    return rhRender(songOf(id));
  }
  function chartFor(id, diff, b){
    const key = id + "|" + diff;
    if (!RH_PLAN.has(key)){
      if (isMine(id)){ const m = mine.find(x => "my:" + x.id === id); RH_PLAN.set(key, rhChartFrom(m.on || [], b.duration, diff)); }
      else RH_PLAN.set(key, rhChart(songOf(id), diff));
    }
    return RH_PLAN.get(key);
  }
  const fmtT = s => `${Math.floor(s/60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
  const songDur = S => { const bars = S.form.reduce((a, f) => a + f[1], 0); return bars*4*60/S.bpm; };
  function menuHTML(){
    const B = rhBests(SID), all = RH_SONGS.map(S => ({id: S.id, t: S.t, a: `${S.a} · ${S.bpm} BPM · ${fmtT(songDur(S))}`, e: S.e, c: S.c, d: S.d}))
      .concat(mine.map(m => ({id: "my:" + m.id, t: m.t, a: `🎧 내 노래 · ${fmtT(m.dur || 0)}`, e: "🎧", c: ["#343a40", "#868e96"], d: "이 기기에만 저장된 노래", my: 1})));
    const cur = songOf(pref.song) ? pref.song : "star";
    const lv = d => { if (isMine(cur)){ return ["3", "6", "9"][d]; } const S = songOf(cur); return rhLv(rhChart(S, d), songDur(S)); };
    return `<div class="rh-in">
      <div class="rh-head"><div class="rh-logo">🎵 리듬 스타 <small>떨어지는 노트를 판정선에서 딱! · 키보드 <b>D F J K</b> 또는 화면 톡</small></div>
        <span class="rh-me">${avHTMLof(SID, {still: true, face: true})}</span></div>
      <div class="rh-body">
        <div class="rh-songs">${all.map(s => { const b = [0, 1, 2].map(d => B[s.id + "|" + d]).filter(Boolean).sort((x, y) => y.best - x.best)[0];
          return `<button class="rh-song${s.id === cur ? " on" : ""}" data-rhs="${esc(s.id)}" style="--c1:${s.c[0]};--c2:${s.c[1]}"><span class="jk">${s.e}</span><span class="tx"><b>${esc(s.t)}</b><small>${esc(s.a)}</small><i>${esc(s.d)}</i></span>${b ? `<span class="bst">${b.rank}<small>${b.best.toLocaleString()}</small></span>` : ""}${s.my ? `<span class="del" data-rhdel="${esc(s.id)}" title="지우기">🗑️</span>` : ""}</button>`; }).join("")}
          <label class="rh-song add"><input type="file" accept="audio/*" id="rhFile" hidden><span class="jk">➕</span><span class="tx"><b>내 노래 넣기</b><small>이 기기에 있는 음악 파일(mp3 등)</small><i>박자를 찾아 악보를 저절로 만들어요 · 이 기기에만 저장</i></span></label>
        </div>
        <div class="rh-side">
          <div class="rh-k">난이도</div>
          <div class="rh-diff">${RH_DIFF.map((d, i) => { const b = B[cur + "|" + i]; return `<button data-rhd="${i}" class="${pref.diff === i ? "on" : ""}" style="--dc:${d.c}">${d.e} ${d.n}<small>Lv.${lv(i)}</small>${b ? `<em>${b.rank} ${b.fc ? "· FC" : ""}</em>` : ""}</button>`; }).join("")}</div>
          <div class="rh-k">노트 속도 <b id="rhSpV">${pref.speed.toFixed(1)}</b></div>
          <input type="range" min="1" max="5" step=".5" value="${pref.speed}" data-rhp="speed">
          <div class="rh-k">내 캐릭터 이모티콘</div>
          <div class="rh-emo">${RH_EMO.map((x, i) => `<button data-rhe="${i}" class="${pref.emo === i ? "on" : ""}" title="${x.n}">${x.e.slice(0, 3).join("")}</button>`).join("")}</div>
          <div class="rh-k">박자 맞추기 <b id="rhOfV">${pref.off > 0 ? "+" : ""}${pref.off}ms</b> <small>노트가 늦게 맞으면 −, 빨리 맞으면 +</small></div>
          <input type="range" min="-150" max="150" step="10" value="${pref.off}" data-rhp="off">
          <label class="rh-chk"><input type="checkbox" data-rhp="tap" ${pref.tap ? "checked" : ""}> 칠 때 톡 소리</label>
          <button class="arc-btn p rh-go" data-rhgo>▶ 시작!</button>
          <div class="rh-msg" id="rhMsg"></div>
        </div>
      </div></div>`;
  }
  function showMenu(){
    phase = "menu"; NG.ended = false;
    if (!menuEl){ menuEl = document.createElement("div"); menuEl.className = "rh-menu";
      ["pointerdown", "pointerup", "touchstart", "touchend", "dblclick"].forEach(t => menuEl.addEventListener(t, e => e.stopPropagation(), {passive: true}));
      menuEl.addEventListener("click", onMenuClick); menuEl.addEventListener("input", onMenuInput); menuEl.addEventListener("change", onMenuChange);
      $("#ngStage").appendChild(menuEl); }
    menuEl.hidden = false; menuEl.innerHTML = menuHTML();
  }
  const msg = (t, bad) => { const m = $("#rhMsg"); if (m){ m.textContent = t; m.classList.toggle("bad", !!bad); } };
  async function pick(id, play){
    pref.song = id; rhSavePref(pref); sel = id; showMenu();
    msg(RH_BUF.has(id) ? "" : "🎼 노래 준비 중… (처음 한 번만 몇 초 걸려요)");
    try { const b = await loadBuf(id); if (sel !== id || phase !== "menu") return; msg("");
      const S = songOf(id); let from = 0; if (!isMine(id)){ const ev = rhPlan(S), c = ev.sec.find(x => x.type === "c"); from = c ? c.s*60/S.bpm/4 : 0; } else from = b.duration*.35;
      if (play !== false) startPreview(b, from);
    } catch(e) { msg("노래를 불러오지 못했어요 😢 다른 곡을 골라 주세요", true); }
  }
  function onMenuClick(e){
    const t = e.target.closest("[data-rhs],[data-rhd],[data-rhe],[data-rhgo],[data-rhdel]"); if (!t) return;
    getAC();
    if (t.dataset.rhdel){ e.preventDefault(); e.stopPropagation(); const id = t.dataset.rhdel; if (!confirm("이 노래를 이 기기에서 지울까요?")) return;
      RHDB.del(id.slice(3)).then(async () => { RH_BUF.delete(id); mine = await RHDB.all().catch(() => []); if (pref.song === id) pref.song = "star"; showMenu(); }); return; }
    if (t.dataset.rhs){ pick(t.dataset.rhs); return; }
    if (t.dataset.rhd){ pref.diff = +t.dataset.rhd; rhSavePref(pref); menuEl.querySelectorAll("[data-rhd]").forEach(b => b.classList.toggle("on", b === t)); return; }
    if (t.dataset.rhe){ pref.emo = +t.dataset.rhe; rhSavePref(pref); menuEl.querySelectorAll("[data-rhe]").forEach(b => b.classList.toggle("on", b === t)); return; }
    if (t.dataset.rhgo !== undefined) start();
  }
  function onMenuInput(e){
    const k = e.target.dataset.rhp; if (!k || e.target.type === "checkbox") return;
    pref[k] = +e.target.value; rhSavePref(pref);
    if (k === "speed") $("#rhSpV").textContent = pref.speed.toFixed(1);
    if (k === "off") $("#rhOfV").textContent = `${pref.off > 0 ? "+" : ""}${pref.off}ms`;
  }
  async function onMenuChange(e){
    if (e.target.dataset.rhp === "tap"){ pref.tap = e.target.checked; rhSavePref(pref); return; }
    if (e.target.id !== "rhFile") return;
    const f = e.target.files && e.target.files[0]; if (!f) return;
    if (f.size > 25e6){ msg("파일이 너무 커요 (25MB까지)", true); return; }
    if (mine.length >= 8){ msg("내 노래는 8곡까지 넣을 수 있어요. 안 쓰는 노래를 지워 주세요", true); return; }
    busy = true; msg("🎧 노래를 듣고 박자를 찾는 중… (10초쯤)");
    try {
      const data = await f.arrayBuffer(), b = await ac().decodeAudioData(data.slice(0));
      if (b.duration < 20){ msg("20초보다 긴 노래를 넣어 주세요", true); return; }
      const on = await rhAnalyze(b);
      const id = Date.now().toString(36), t = f.name.replace(/\.[^.]+$/, "").slice(0, 40);
      await RHDB.put({id, t, at: Date.now(), dur: b.duration, size: f.size, data, on: on.map(o => ({t: +o.t.toFixed(3), b: o.b, v: +o.v.toFixed(2)}))});
      RH_BUF.set("my:" + id, b); mine = await RHDB.all(); for (const m of mine) if (m.id === id) m.on = on;
      pref.song = "my:" + id; rhSavePref(pref); busy = false; await pick("my:" + id);
      msg(`✅ ‘${t}’ 악보를 만들었어요!`);
    } catch(err) { msg("이 파일은 열 수 없어요 😢 mp3·m4a·wav 파일을 넣어 주세요", true); }
    finally { busy = false; e.target.value = ""; }
  }
  async function loadMine(){
    try { mine = await RHDB.all(); } catch(e) { mine = []; }
    // 악보 재료(박자)는 고를 때 불러와요
    for (const m of mine){ if (!m.on){ const v = await RHDB.get(m.id).catch(() => null); m.on = v ? v.on : []; } }
    if (phase === "menu") showMenu();
  }

  /* ---- 시작 ---- */
  async function start(){
    if (busy || starting) return; const id = pref.song, S = songOf(id); if (!S){ msg("노래를 골라 주세요", true); return; }
    starting = true; if (!RH_BUF.has(id)) msg("🎼 노래 준비 중… 곧 시작해요!");
    try { buf = await loadBuf(id); } catch(e) { starting = false; msg("노래를 불러오지 못했어요 😢", true); return; }
    starting = false; if (phase !== "menu" || pref.song !== id) return; stopPreview();
    song = S; chart = chartFor(id, pref.diff, buf); dur = buf.duration;
    bpm = isMine(id) ? 120 : S.bpm; beat0 = 0;
    notes = chart.map(n => ({t: n.t, l: n.l, e: n.e, st: 0, hs: 0}));
    totalJ = Math.max(1, notes.length + notes.filter(n => n.e).length);
    ptr = [0, 0, 0, 0]; held = [null, null, null, null]; down = [0, 0, 0, 0]; beam = [0, 0, 0, 0]; ptrLane = {};
    score = 0; combo = 0; maxC = 0; cnt = [0, 0, 0, 0]; jSum = 0; jN = 0; life = 1000; judge = null; fx = []; emo = []; fail = false; endAt = 0;
    lead = 2.6/pref.speed;
    menuEl.hidden = true; phase = "play"; NG.ended = false;
    const a = ac(); src = a.createBufferSource(); gain = a.createGain(); src.buffer = buf; gain.gain.value = pref.vol; src.connect(gain); gain.connect(a.destination);
    T0 = a.currentTime + 2.2; src.start(T0);
    prepAvatar();
  }
  function prepAvatar(){
    if (avImgC) return;
    const im = new Image(); im.decoding = "async";
    im.onload = () => { const h = L.av.h, w = h*(im.naturalWidth/im.naturalHeight || 1), k = Math.min(2, NG.k || 1), c = document.createElement("canvas");
      c.width = Math.ceil(w*k); c.height = Math.ceil(h*k); const t = c.getContext("2d"); t.drawImage(im, 0, 0, c.width, c.height); c.w = w; c.h = h; avImgC = c; };
    try { AVX.still = true; const svg = avatarSVG(Object.assign({}, avOf(SID), {bg: "none", xbg: "none", frame: "none", xfr: "none", fx: "none"}), ""); AVX.still = false;
      im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); } catch(e) { AVX.still = false; try { im.src = avStillURL(SID, false); } catch(e2) {} }
  }
  function stopSong(){ if (src){ try { src.onended = null; gain.gain.setTargetAtTime(0, ac().currentTime, .15); src.stop(ac().currentTime + .6); } catch(e) {} src = null; } }

  /* ---- 판정 ---- */
  function addJ(j, lane){
    cnt[j]++; jN++; jSum += RH_JV[j];
    score = Math.round(1e6*RH_DIFF[pref.diff].mul*jSum/totalJ);
    if (j < 3){ combo++; if (combo > maxC) maxC = combo; life = Math.min(1000, life + (j === 0 ? 6 : j === 1 ? 3 : 0)); }
    else { if (combo >= 10) burst(["💦", "😵"], 2); combo = 0; life -= [35, 55, 80][pref.diff]; }
    judge = {j, t: 22};
    if (lane !== undefined && j < 3){ fx.push({l: lane, t: 18}); hitFlash = 6; }
    if (j === 0 && Math.random() < .35) burst(RH_EMO[pref.emo].e, 1);
    if (combo && combo % 25 === 0){ burst(RH_EMO[pref.emo].e, 6); burst(RH_CHEER, 3, true); }
    if (life <= 0 && !fail){ fail = true; life = 0; endAt = performance.now() + 900; stopSong(); SFX.bad(); }
  }
  function burst(set, n, side){
    for (let i = 0; i < n && emo.length < 36; i++){
      const a = L.av, x = side ? L.cb.x + rnd(-80, 80) : a.x + rnd(-a.h*.25, a.h*.25), y = side ? L.cb.y + 90 : a.y - a.h*.35;
      emo.push({e: set[Math.floor(rnd(set.length))], x, y, vx: rnd(-1.6, 1.6), vy: rnd(-5.5, -3), t: 70, s: [40, 52, 64][Math.floor(rnd(3))]});
    }
  }
  function press(l, tt){
    down[l] = 1; beam[l] = 1;
    let best = null, bd = 9;
    for (let i = ptr[l]; i < notes.length; i++){ const n = notes[i]; if (n.t - tt > RH_JW[2]) break; if (n.l !== l || n.st) continue; const d = Math.abs(n.t - tt); if (d < bd){ bd = d; best = n; } }
    if (!best || bd > RH_JW[2]) return;
    const j = bd <= RH_JW[0] ? 0 : bd <= RH_JW[1] ? 1 : 2;
    tapSound(j === 0);
    if (best.e){ best.st = 1; held[l] = best; } else best.st = 2;
    addJ(j, l);
  }
  function release(l, tt){
    down[l] = 0; const n = held[l]; if (!n) return; held[l] = null;
    if (n.st !== 1) return;
    n.st = 2; const left = n.e - tt;
    addJ(left <= .08 ? 0 : left <= .16 ? 1 : 3, l);
  }
  const laneAt = x => Math.max(0, Math.min(3, Math.floor((x - (L.cx - L.bw))/L.lw)));

  /* ---- 그리기 ---- */
  function drawPlay(g){
    const tt = clock();
    G2.bg(g, `rhbg${W}`, W, H, bgDraw);
    // 박자에 맞춰 반짝이는 지평선 빛 + 이퀄라이저
    const bph = tt > 0 ? (tt*bpm/60) % 1 : 0, pulse = Math.pow(1 - bph, 3);
    g.globalAlpha = .35 + pulse*.55; g.drawImage(glowSpr(), L.cx - 300, L.hy - 110, 600, 260); g.globalAlpha = 1;
    const eqY = land ? L.hy + (L.jy - L.hy)*.42 : L.hy + 134, n = land ? 26 : 14, bw = (land ? 560 : 360)/n;
    g.fillStyle = "rgba(200,160,255,.55)";
    for (let i = 0; i < n; i++){ const k = Math.abs(i - (n - 1)/2)/(n/2), h = (8 + 50*pulse*(1 - k*.6))*(.6 + .4*Math.abs(Math.sin(i*1.7 + tt*3))); g.fillRect(L.cx - n*bw/2 + i*bw + 2, eqY - h - 140, bw - 4, h); }
    // 흐르는 바닥 줄
    g.strokeStyle = "rgba(190,160,255,.35)"; g.lineWidth = 2;
    for (let i = 0; i < 6; i++){ const d = ((i/6) - (tt/lead)*.6 % (1/6) + 1) % 1, s = sAt(d), y = yOf(s); g.beginPath(); g.moveTo(xOf(0, s), y); g.lineTo(xOf(4, s), y); g.stroke(); }
    // 누른 줄 빛
    for (let l = 0; l < 4; l++){ if (down[l]) beam[l] = 1; else beam[l] *= .82; if (beam[l] < .03) continue;
      g.globalAlpha = beam[l]; const s0 = sAt(.55), y0 = yOf(s0);
      g.save(); g.beginPath(); g.moveTo(xOf(l, s0), y0); g.lineTo(xOf(l + 1, s0), y0); g.lineTo(xOf(l + 1, 1), L.jy); g.lineTo(xOf(l, 1), L.jy); g.closePath(); g.clip();
      g.drawImage(beamSpr(l), xOf(l, 1), y0, L.lw, L.jy - y0); g.restore(); g.globalAlpha = 1; }
    // 노트
    for (let l = 0; l < 4; l++) while (ptr[l] < notes.length && notes[ptr[l]].st >= 2 && notes[ptr[l]].t < tt - 1) ptr[l]++;
    const p0 = Math.min(...ptr), nw = Math.round(L.lw*.92);
    for (let i = p0; i < notes.length; i++){
      const nt = notes[i]; if (nt.t - tt > lead*1.05) break;
      if (nt.st === 2 && !nt.e) continue;
      const end = nt.e || nt.t;
      if (end < tt - .25) continue;
      if (nt.e){ // 길게 누르기
        const hd = nt.st === 1 ? 0 : Math.max(-.2, (nt.t - tt)/lead), td = Math.min(1.02, (nt.e - tt)/lead);
        if (td > hd && !(nt.st === 2)){
          const sh = sAt(hd), st = sAt(td), yh = yOf(sh), yt = yOf(st), m = .18;
          g.fillStyle = nt.st === 1 ? "rgba(255,255,255,.55)" : nt.st === 3 ? "rgba(120,120,140,.4)" : RH_LANE[nt.l] + "88";
          g.beginPath(); g.moveTo(xOf(nt.l + m, sh), yh); g.lineTo(xOf(nt.l + 1 - m, sh), yh); g.lineTo(xOf(nt.l + 1 - m, st), yt); g.lineTo(xOf(nt.l + m, st), yt); g.closePath(); g.fill();
          const sp = noteSpr(nt.l, nw); g.globalAlpha = nt.st === 3 ? .4 : 1; g.drawImage(sp, xOf(nt.l + .5, st) - sp.w*st*.5, yt - sp.h*st*.5, sp.w*st, sp.h*st); g.globalAlpha = 1;
        }
        if (nt.st === 1 || nt.st === 2 && nt.hs) continue;
      }
      if (nt.st !== 0 && !(nt.st === 3)) continue;
      const d = (nt.t - tt)/lead; if (d < -.2) continue;
      const s = sAt(d), y = yOf(s), sp = noteSpr(nt.l, nw);
      if (nt.st === 3) g.globalAlpha = .35;
      g.drawImage(sp, xOf(nt.l + .5, s) - sp.w*s*.5, y - sp.h*s*.5, sp.w*s, sp.h*s);
      g.globalAlpha = 1;
    }
    // 치는 효과
    for (let i = fx.length - 1; i >= 0; i--){ const f = fx[i], k = 1 - f.t/18, r = ringSpr(f.l), w = (L.lw*1.2)*(.7 + k*.9);
      g.globalAlpha = f.t/18; g.drawImage(r, xOf(f.l + .5, 1) - w/2, L.jy - w/4, w, w/2); g.globalAlpha = 1; if (--f.t <= 0) fx.splice(i, 1); }
    for (let l = 0; l < 4; l++) if (held[l]){ const r = ringSpr(l), w = L.lw*(1.1 + .1*Math.sin(tt*30)); g.drawImage(r, xOf(l + .5, 1) - w/2, L.jy - w/4, w, w/2); }
    // 판정 글씨
    if (judge && judge.t > 0){ const k = judge.t > 16 ? 1 + (judge.t - 16)*.05 : 1; g.save(); g.globalAlpha = Math.min(1, judge.t/8);
      g.translate(L.cx, L.jy - (land ? 150 : 210)); g.scale(k, k); outlined(g, RH_JN[judge.j], 0, 0, land ? 54 : 58, RH_JC[judge.j], "rgba(40,10,90,.9)"); g.restore(); judge.t--; }
    drawChar(g, tt, bph);
    drawHud(g, tt);
    // 시작 전 카운트
    if (tt < 0){ const c = Math.ceil(-tt); outlined(g, tt < -1.6 ? "READY?" : c >= 1 ? String(c) : "GO!", L.cx, L.hy + (L.jy - L.hy)*.45, 90, "#fff", "rgba(80,20,150,.9)"); }
    if (NG.paused){ g.fillStyle = "rgba(10,5,30,.6)"; g.fillRect(0, 0, W, H); outlined(g, "⏸ 잠깐 멈춤", W/2, H/2 - 30, 70, "#fff"); outlined(g, "화면을 톡 하거나 스페이스바를 누르면 이어서 해요", W/2, H/2 + 40, 26, "#ffe7a8"); }
  }
  function drawChar(g, tt, bph){
    const a = L.av, hop = tt > 0 && !fail ? Math.sin(Math.min(1, bph*2)*Math.PI) : 0, sq = 1 - hop*.04;
    if (avImgC){ const w = avImgC.w, h = avImgC.h, tilt = tt > 0 ? (Math.floor(tt*bpm/60) % 2 ? 1 : -1)*.06*hop : 0;
      g.save(); g.translate(a.x, a.y + a.h*.5 - hop*18); g.rotate(tilt); g.scale(1/sq, sq); g.drawImage(avImgC, -w/2, -h, w, h); g.restore(); }
    else faceAt(g, SID, a.x, a.y, a.h*.3, "#ff8ed1");
    if (fail) G2.emo(g, "😵", a.x + a.h*.22, a.y - a.h*.42, 44);
    for (let i = emo.length - 1; i >= 0; i--){ const q = emo[i]; q.x += q.vx; q.y += q.vy; q.vy += .09; q.vx *= .99; if (--q.t <= 0){ emo.splice(i, 1); continue; }
      g.globalAlpha = Math.min(1, q.t/20); g.font = `${q.s}px ${EMOJI}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(q.e, q.x, q.y); }
    g.globalAlpha = 1;
  }
  function drawHud(g){
    const x0 = land ? 26 : 22;
    outlined(g, `${song.e} ${song.t}`, x0, 30, 24, "#fff", "rgba(40,10,90,.9)", "left");
    outlined(g, `${RH_DIFF[pref.diff].e} ${RH_DIFF[pref.diff].n}`, x0, 62, 20, RH_DIFF[pref.diff].c, "rgba(40,10,90,.9)", "left");
    // 점수 + 등급 막대
    num(g, score.toLocaleString(), x0, 104, 40);
    const acc = jN ? jSum/jN : 1, bx = x0, by = 132, bw = land ? 300 : 260;
    g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(bx, by, bw, 10);
    const pr = score/(1e6*RH_DIFF[pref.diff].mul); g.fillStyle = "#7cf3ff"; g.fillRect(bx, by, bw*Math.min(1, pr), 10);
    [["C", .6], ["B", .75], ["A", .88], ["S", .95]].forEach(([r, v]) => { g.fillStyle = "#fff"; g.fillRect(bx + bw*v - 1, by - 4, 2, 18); outlined(g, r, bx + bw*v, by - 14, 16, "#fff", "rgba(40,10,90,.9)"); });
    if (jN) outlined(g, `정확도 ${(acc*100).toFixed(1)}%`, bx, by + 30, 18, "#d9ccff", "rgba(40,10,90,.9)", "left");
    // 체력
    const lw = land ? 220 : 200, lx = W - lw - 26, ly = 34;
    outlined(g, "💚 LIFE", lx, ly - 2, 18, "#bfffd0", "rgba(40,10,90,.9)", "left");
    g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(lx, ly + 14, lw, 12);
    g.fillStyle = life > 400 ? "#69f0ae" : life > 200 ? "#ffd43b" : "#ff6b6b"; g.fillRect(lx, ly + 14, lw*life/1000, 12);
    // 일시 정지 단추
    G2.put(g, G2.spr("rhpause", 52, 52, t => { t.fillStyle = "rgba(255,255,255,.18)"; t.beginPath(); t.arc(26, 26, 24, 0, 7); t.fill(); t.fillStyle = "#fff"; t.fillRect(17, 15, 6, 22); t.fillRect(29, 15, 6, 22); }), W - 70, ly + 40);
    // 콤보
    if (combo >= 2){ const c = L.cb, k = judge && judge.t > 18 ? 1.08 : 1;
      outlined(g, "COMBO", c.x, c.y - 44, 28, "#ffd6f5", "rgba(40,10,90,.9)");
      g.save(); g.translate(c.x, c.y + 14); g.scale(k, k); num(g, combo, 0, 0, land ? 84 : 72, "#fff", "center"); g.restore(); }
  }

  const self = {
    get W(){ return W; }, get H(){ return H; }, maxPx: 2.1e6, layout,
    _dbg(){ return {phase, notes, t: phase === "play" ? clock() : 0, cnt, score, combo, maxC, life, dur}; },   // (시험용)
    init(){
      $("#ngStage").style.background = "#0b0628";
      showMenu(); loadMine();
      const id = songOf(pref.song) ? pref.song : "star"; sel = id;
      const quick = RH_QUICK; RH_QUICK = false;
      if (quick && (RH_BUF.has(id) || !isMine(id))) setTimeout(() => { if (phase === "menu") start(); }, 30);   // 🔁 다시 하기 = 같은 노래 바로
      else setTimeout(() => { if (phase === "menu" && !RH_BUF.has(id)) pick(id, false); }, 300);   // 고른 노래를 미리 준비
      this._vis = () => { if (document.hidden && phase === "play" && !NG.paused) pause(); };
      document.addEventListener("visibilitychange", this._vis);
    },
    destroy(){
      stopPreview(); stopSong(); if (NG.paused){ try { ac().resume(); } catch(e) {} }
      if (menuEl){ menuEl.remove(); menuEl = null; } $("#ngStage").style.background = "";
      document.removeEventListener("visibilitychange", this._vis);
    },
    step(){
      if (phase !== "play") return;
      const tt = clock();
      // 지나간 노트 = MISS, 끝까지 누른 긴 노트 = 성공
      for (let l = 0; l < 4; l++){ const h = held[l]; if (h && h.st === 1 && tt >= h.e){ h.st = 2; h.hs = 1; held[l] = null; addJ(0, l); } }
      for (let i = Math.min(...ptr); i < notes.length; i++){ const n = notes[i]; if (n.t > tt) break;
        if (n.st === 0 && tt - n.t > RH_JW[2]){ n.st = 3; addJ(3); if (n.e) addJ(3); } }
      if (fail && performance.now() > endAt) finish();
      else if (!fail && tt > dur + .6) finish();
    },
    draw(g){
      if (phase === "menu"){ G2.bg(g, `rhbg${W}`, W, H, bgDraw); g.fillStyle = "rgba(8,4,26,.55)"; g.fillRect(0, 0, W, H); return; }
      drawPlay(g);
    },
    hud(){ return phase === "play" ? `🎵 <b>${esc(song.t)}</b> · ${RH_DIFF[pref.diff].n}` : "🎵 노래를 골라요"; },
    key(code, isDown, e){
      if (phase !== "play") return false;
      if (code === "Space" || code === "KeyP"){ if (isDown && !(e && e.repeat)) NG.paused ? resume() : pause(); return true; }
      const l = RH_KEYS.findIndex(ks => ks.includes(code)); if (l < 0) return false;
      if (NG.paused) return true;
      const ts = e && e.timeStamp ? e.timeStamp : undefined;
      if (isDown){ if (!(e && e.repeat)) press(l, clock(ts)); } else release(l, clock(ts));
      return true;
    },
    down(x, y, id){
      if (phase !== "play") return;
      if (NG.paused){ resume(); return; }
      if (x > W - 80 && y > 60 && y < 140){ pause(); return; }
      const l = laneAt(x); ptrLane[id] = l; press(l, clock());
    },
    move(x, y, id){
      if (phase !== "play" || NG.paused || ptrLane[id] === undefined) return;
      const l = laneAt(x); if (l !== ptrLane[id] && !held[ptrLane[id]]){ release(ptrLane[id], clock()); ptrLane[id] = l; press(l, clock()); }
    },
    up(x, y, id){ if (ptrLane[id] === undefined) return; const l = ptrLane[id]; delete ptrLane[id]; if (!Object.values(ptrLane).includes(l)) release(l, clock()); }
  };
  function pause(){ if (NG.paused || phase !== "play") return; NG.paused = true; pausedAt = performance.now(); try { ac().suspend(); } catch(e) {} for (let l = 0; l < 4; l++){ down[l] = 0; } }
  function resume(){ if (!NG.paused) return; try { ac().resume(); } catch(e) {} setTimeout(() => { NG.paused = false; }, 120); }
  function finish(){
    if (phase !== "play") return; phase = "done"; stopSong();
    const acc = jN ? jSum/totalJ : 0, rank = fail ? "F" : acc >= .95 ? "S" : acc >= .88 ? "A" : acc >= .75 ? "B" : acc >= .6 ? "C" : "D";
    const fc = !fail && cnt[3] === 0, ap = fc && cnt[1] === 0 && cnt[2] === 0, key = pref.song + "|" + pref.diff;
    const B = rhBests(SID), prev = B[key]; if (!prev || score > prev.best){ B[key] = {best: score, rank, fc}; try { localStorage.setItem(rhBestKey(SID), JSON.stringify(B)); } catch(e) {} }
    if (fc) burst(RH_EMO[pref.emo].e, 10);
    NG.over(score, `<div class="rh-res"><b class="rk rk-${rank}">${rank}</b><div>${song.e} ${esc(song.t)} · ${RH_DIFF[pref.diff].e} ${RH_DIFF[pref.diff].n}${ap ? ` · <span class="fc">💎 ALL PERFECT!</span>` : fc ? ` · <span class="fc">✨ FULL COMBO!</span>` : fail ? " · 💦 에너지가 바닥났어요" : ""}</div>
      <div class="cn"><span style="color:${RH_JC[0]}">PERFECT ${cnt[0]}</span><span style="color:${RH_JC[1]}">GREAT ${cnt[1]}</span><span style="color:${RH_JC[2]}">GOOD ${cnt[2]}</span><span style="color:${RH_JC[3]}">MISS ${cnt[3]}</span></div>
      <div>최대 콤보 <b>${maxC}</b> · 정확도 <b>${(acc*100).toFixed(1)}%</b></div></div>`);
    const row = $("#ngOver .arc-row"); if (row && !row.querySelector("[data-rhmenu]")){ const b = document.createElement("button"); b.className = "arc-btn"; b.dataset.rhmenu = "1"; b.textContent = "🎵 다른 노래"; row.insertBefore(b, row.lastElementChild);
      b.onclick = ev => { ev.stopPropagation(); RH_QUICK = false; $("#ngOver").hidden = true; NG.ended = false; NG.drawnEnd = false; showMenu(); }; }
  }
  return self;
};
