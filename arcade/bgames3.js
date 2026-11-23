/* =====================================================================
   🎲 보드게임 모음 ③ — 🌏 세계 여행 · 🀫 숫자 타일
   ===================================================================== */

/* ---------------- 🌏 세계 여행 (부루마블 같은) ---------------- */
const MB_SQ = [["🏁", "출발"], ["🇹🇭", "방콕", 100], ["🔑", "황금 열쇠"], ["🇻🇳", "하노이", 120], ["🇸🇬", "싱가포르", 140], ["🇪🇬", "카이로", 160], ["🏝️", "무인도"],
  ["🇬🇷", "아테네", 180], ["🔑", "황금 열쇠"], ["🇪🇸", "마드리드", 200], ["🇮🇹", "로마", 220], ["🇩🇪", "베를린", 240], ["🎡", "쉼터"],
  ["🇬🇧", "런던", 260], ["🔑", "황금 열쇠"], ["🇫🇷", "파리", 280], ["🇨🇦", "토론토", 300], ["🇺🇸", "뉴욕", 320], ["🚀", "우주여행"],
  ["🇦🇺", "시드니", 340], ["🔑", "황금 열쇠"], ["🇯🇵", "도쿄", 360], ["🇨🇳", "베이징", 380], ["🇰🇷", "서울", 400]];
const MB_KEY = [["💰 용돈을 받아요", 150], ["🎂 생일! 모두에게 30씩 받아요", "bd"], ["🚑 병원비를 내요", -100], ["🏁 출발점으로 가요", "go"], ["🔙 뒤로 3칸 가요", "bk"], ["📚 장학금을 받아요", 200], ["🧾 세금을 내요", -80], ["🎁 복권 당첨!", 300]];
BG.def({
  id: "mb", e: "🌏", n: "세계 여행", like: "부루마블 같은 게임", time: "20분", min: 2, max: 4, col: ["#ff6b6b", "#4dabf7", "#69db7c", "#cc5de8"],
  d: "주사위를 굴려 세계 도시를 사고, 친구가 내 도시에 오면 통행료를 받아요!",
  rules: ["<b>🎲 굴리기</b>로 주사위 2개를 굴려 그만큼 가요. 같은 숫자(더블)면 한 번 더!", "주인이 없는 도시에 서면 <b>살 수</b> 있어요. 내 도시에 다시 서면 <b>🏨 호텔</b>을 지어 통행료가 3배!", "친구 도시에 서면 <b>통행료</b>를 내요. 돈이 모자라면 파산!", "🔑 황금 열쇠는 좋은 일·나쁜 일이 생겨요. 🏝️ 무인도는 한 번 쉬고, 🚀 우주여행은 아무 도시로 날아가요(자동).", "출발점을 지나면 월급 200! 15바퀴째가 끝나거나 한 명만 남으면 끝 — 돈과 땅을 더해 가장 부자가 이겨요."],
  setup(n){ return {n, pos: Array(n).fill(0), m: Array(n).fill(1500), own: Array(24).fill(-1), lv: Array(24).fill(0), t: 0, ph: "roll", d: [1, 1], db: 0, skip: Array(n).fill(0), out: [], round: 1, last: "", win: -1}; },
  turn: S => S.win >= 0 ? -1 : S.t,
  price: i => MB_SQ[i][2] || 0, toll(S, i){ return Math.round(this.price(i)*.4*(S.lv[i] ? 3 : 1)); },
  worth(S, p){ return S.m[p] + S.own.reduce((a, o, i) => a + (o === p ? this.price(i)*(S.lv[i] ? 2 : 1) : 0), 0); },
  next(S){ S.db = 0; S.ph = "roll"; let q = S.t; for (let k = 0; k < S.n; k++){ q = (q + 1) % S.n; if (!S.out.includes(q)) break; } if (q <= S.t) S.round++; S.t = q;
    if (S.round > 15) this.finish(S); else if (S.skip[q]){ S.skip[q] = 0; S.last = "🏝️ 무인도에서 한 번 쉬어요"; this.next(S); } },
  finish(S){ const al = Array.from({length: S.n}, (_, i) => i).filter(i => !S.out.includes(i)); al.sort((a, b) => this.worth(S, b) - this.worth(S, a)); S.win = al[0]; },
  pay(S, p, q, v){ if (S.m[p] >= v){ S.m[p] -= v; if (q >= 0) S.m[q] += v; return true; } if (q >= 0) S.m[q] += S.m[p]; S.m[p] = 0; S.out.push(p); S.own = S.own.map(o => o === p ? -1 : o); S.lv = S.lv.map((l, i) => S.own[i] < 0 ? 0 : l); return false; },
  land(S, p, R){ const i = S.pos[p], sq = MB_SQ[i];
    if (sq[2]){ if (S.own[i] < 0){ S.ph = S.m[p] >= sq[2] ? "buy" : "done"; return `${sq[0]} ${sq[1]} 도착!`; }
      if (S.own[i] === p){ S.ph = !S.lv[i] && S.m[p] >= sq[2] ? "build" : "done"; return `${sq[0]} 내 도시예요`; }
      const v = this.toll(S, i), o = S.own[i], ok = this.pay(S, p, o, v); S.ph = "done"; return ok ? `💸 통행료 ${v} 내기` : "💥 파산했어요!"; }
    if (sq[1] === "황금 열쇠"){ const k = MB_KEY[Math.floor(R()*MB_KEY.length)], v = k[1];
      if (typeof v === "number"){ if (v > 0) S.m[p] += v; else this.pay(S, p, -1, -v); }
      else if (v === "bd"){ for (let q = 0; q < S.n; q++) if (q !== p && !S.out.includes(q)){ const x = Math.min(30, S.m[q]); S.m[q] -= x; S.m[p] += x; } }
      else if (v === "go"){ S.pos[p] = 0; S.m[p] += 200; }
      else if (v === "bk"){ S.pos[p] = (S.pos[p] + 21) % 24; S.ph = "done"; return `🔑 ${k[0]} → ${this.land(S, p, R)}`; }
      S.ph = "done"; return `🔑 ${k[0]}`; }
    if (sq[1] === "무인도"){ S.skip[p] = 1; S.db = 0; S.ph = "done"; return "🏝️ 무인도! 다음에 한 번 쉬어요"; }
    if (sq[1] === "쉼터"){ S.m[p] += 100; S.ph = "done"; return "🎡 쉼터에서 100 받아요"; }
    if (sq[1] === "우주여행"){ const L = S.own.map((o, k) => MB_SQ[k][2] && (o < 0 || o === p) ? k : -1).filter(k => k >= 0); const to = L.length ? L[Math.floor(R()*L.length)] : 0; if (to < S.pos[p]) S.m[p] += 200; S.pos[p] = to; return `🚀 ${MB_SQ[to][1]}(으)로 슝! ${this.land(S, p, R)}`; }
    S.ph = "done"; return ""; },
  act(S, p, a, R){
    if (a.k === "roll"){ if (S.ph !== "roll") return false; const d = [1 + Math.floor(R()*6), 1 + Math.floor(R()*6)]; S.d = d; const dbl = d[0] === d[1]; S.db = dbl ? S.db + 1 : 0;
      const from = S.pos[p], to = (from + d[0] + d[1]) % 24; let say = ""; if (to < from){ S.m[p] += 200; say = "💰 월급 200! "; } S.pos[p] = to;
      say += this.land(S, p, R); S.last = say; if (S.out.includes(p)) this.after(S, p); else if (S.ph === "done") this.after(S, p);
      bgFx(S, {k: "roll", d, p, from, to, say: say || null, snd: "pt", k2: 60}); return true; }
    if (a.k === "buy"){ if (S.ph !== "buy") return false; const i = S.pos[p]; S.m[p] -= this.price(i); S.own[i] = p; S.last = `🏳️ ${MB_SQ[i][1]}을(를) 샀어요!`; this.after(S, p); bgFx(S, {k: "buy", i, say: S.last, snd: "gold"}); return true; }
    if (a.k === "build"){ if (S.ph !== "build") return false; const i = S.pos[p]; S.m[p] -= this.price(i); S.lv[i] = 1; S.last = `🏨 ${MB_SQ[i][1]}에 호텔!`; this.after(S, p); bgFx(S, {k: "buy", i, say: S.last, snd: "gold"}); return true; }
    if (a.k === "pass"){ if (S.ph !== "buy" && S.ph !== "build") return false; this.after(S, p); bgFx(S, {k: "pass"}); return true; }
    return false; },
  after(S, p){ const al = Array.from({length: S.n}, (_, i) => i).filter(i => !S.out.includes(i)); if (al.length <= 1){ S.win = al[0]; return; }
    if (!S.out.includes(p) && S.db > 0 && S.db < 3 && !S.skip[p]){ S.ph = "roll"; S.last += " · 🎲 더블! 한 번 더"; return; } this.next(S); },
  over(S){ if (S.win < 0) return null; const rank = Array.from({length: S.n}, (_, i) => i).sort((a, b) => (S.out.includes(a) - S.out.includes(b)) || this.worth(S, b) - this.worth(S, a)); return {w: S.win, rank, txt: `가장 부자! 💰 ${this.worth(S, S.win)}`}; },
  pinfo(S, i){ return S ? (S.out.includes(i) ? "💥 파산" : `💰${S.m[i]} · 🏳️${S.own.filter(o => o === i).length}`) : ""; },
  ai(S, p, R, X){ if (S.ph === "roll") return {k: "roll"}; const i = S.pos[p], keep = [100, 250, 400][X.lv];
    if (S.ph === "buy") return S.m[p] - this.price(i) >= keep*(R() < .2 ? 0 : 1) ? {k: "buy"} : {k: "pass"};
    if (S.ph === "build") return S.m[p] - this.price(i) >= keep ? {k: "build"} : {k: "pass"}; return null; },
  sqXY(b, i){ const n = 6, c = b.s/(n + 1), L = b.x, T = b.y; let x, y; if (i <= 6){ x = L + b.s - c - i*c; y = T + b.s - c; } else if (i <= 12){ x = L; y = T + b.s - c - (i - 6)*c; } else if (i <= 18){ x = L + (i - 12)*c; y = T; } else { x = L + b.s - c; y = T + (i - 18)*c; } return {x, y, c}; },
  draw(g, S, me, A, ui, X){
    const s = Math.min(A.w, A.h) - 10, b = {x: A.x + (A.w - s)/2, y: A.y + (A.h - s)/2, s};
    g.save(); BGD.shadow(g, true, 24, 8); BGD.box(g, b.x - 6, b.y - 6, s + 12, s + 12, 18, "#c5f6fa"); g.restore();
    for (let i = 0; i < 24; i++){ const {x, y, c} = this.sqXY(b, i), sq = MB_SQ[i], o = S.own[i];
      BGD.box(g, x + 2, y + 2, c - 4, c - 4, 8, sq[2] ? "#fff" : i % 6 === 0 ? "#ffe066" : "#e7f5ff", o >= 0 ? this.col[o] : "rgba(0,0,0,.15)", o >= 0 ? 5 : 1.5);
      if (o >= 0){ g.fillStyle = this.col[o]; g.fillRect(x + 4, y + 4, c - 8, c*.16); }
      outlined(g, sq[0], x + c/2, y + c*.42, c*.32); BGD.txt(g, sq[1], x + c/2, y + c*.72, Math.min(16, c*.17), "#343a40");
      if (sq[2]) BGD.txt(g, S.lv[i] ? `🏨${this.toll(S, i)}` : `${sq[2]}`, x + c/2, y + c*.88, Math.min(13, c*.14), S.lv[i] ? "#e8590c" : "#868e96");
      if (ui.hl === i){ g.lineWidth = 5; g.strokeStyle = "#ffd43b"; rrect(g, x + 2, y + 2, c - 4, c - 4, 8); g.stroke(); } }
    const fx = ui.fx && ui.fx.k === "roll" ? ui.fx : null, ft = fx ? Math.min(1, (ui.fxT || 0)/40) : 1;
    for (let q = 0; q < S.n; q++){ if (S.out.includes(q)) continue; let i = S.pos[q];
      if (fx && fx.p === q && ft < 1){ const steps = (fx.to - fx.from + 24) % 24; i = (fx.from + Math.floor(steps*ft)) % 24; }
      const {x, y, c} = this.sqXY(b, i), ox = (q % 2 - .5)*c*.38, oy = (Math.floor(q/2) - .5)*c*.3; BGD.disc(g, x + c/2 + ox, y + c*.55 + oy, c*.16, this.col[q]); outlined(g, ["🐯", "🐰", "🐶", "🐱"][q], x + c/2 + ox, y + c*.55 + oy, c*.18); }
    /* 가운데: 주사위 · 단추 · 소식 */
    const ix = b.x + s/7 + 14, iw = s - 2*s/7 - 28, cy = b.y + s/2;
    outlined(g, "🌏 세계 여행", ix + iw/2, b.y + s/7 + 34, 30, "#1971c2", "rgba(255,255,255,.9)"); BGD.txt(g, `${Math.min(15, S.round)} / 15 바퀴`, ix + iw/2, b.y + s/7 + 66, 18, "#495057");
    const roll = fx && ft < .6; [0, 1].forEach(k => { const v = roll ? 1 + Math.floor(Math.random()*6) : S.d[k], dx = ix + iw/2 + (k - .5)*90 - 34, dy = cy - 110;
      g.save(); g.translate(dx + 34, dy + 34); if (roll) g.rotate(Math.sin(ui.fxT*.7 + k)*.5); BGD.tile(g, -34, -34, 68, 68, "#fff", "#495057", 14);
      const P = {1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]}[v];
      P.forEach(([u, w]) => { g.fillStyle = v === 1 ? "#e03131" : "#212529"; g.beginPath(); g.arc(u*16, w*16, 7, 0, 7); g.fill(); }); g.restore(); });
    const myT = S.t === me && S.win < 0, bw = Math.min(200, iw/2 - 8);
    ui.bt = [];
    if (myT && S.ph === "roll") ui.bt.push({k: "roll", x: ix + iw/2 - 120, y: cy - 10, w: 240, h: 70, t: "🎲 굴리기", p: 1});
    if (myT && S.ph === "buy") ui.bt.push({k: "buy", x: ix + iw/2 - bw - 6, y: cy - 10, w: bw, h: 70, t: `🏳️ 사기 ${this.price(S.pos[me])}`, p: 1, c: "#20c997"}, {k: "pass", x: ix + iw/2 + 6, y: cy - 10, w: bw, h: 70, t: "그냥 가기"});
    if (myT && S.ph === "build") ui.bt.push({k: "build", x: ix + iw/2 - bw - 6, y: cy - 10, w: bw, h: 70, t: `🏨 호텔 ${this.price(S.pos[me])}`, p: 1, c: "#f76707"}, {k: "pass", x: ix + iw/2 + 6, y: cy - 10, w: bw, h: 70, t: "그냥 가기"});
    ui.bt.forEach(q => BGD.btn(g, q));
    if (S.last){ const t = S.last.length > 26 ? S.last.slice(0, 26) + "…" : S.last; BGD.box(g, ix, cy + 80, iw, 48, 14, "rgba(0,0,0,.08)"); BGD.txt(g, t, ix + iw/2, cy + 104, Math.min(20, iw/18), "#343a40"); }
    for (let q = 0; q < S.n; q++){ const yy = cy + 140 + q*28; if (yy > b.y + s - s/7 - 10) break; BGD.txt(g, `${["🐯", "🐰", "🐶", "🐱"][q]} ${X.name(q).slice(0, 7)}  💰${S.m[q]}  🏳️${S.own.filter(o => o === q).length}${S.out.includes(q) ? " 💥" : ""}`, ix + iw/2, yy, 17, q === S.t ? this.col[q] : "#495057"); }
  },
  tap(S, me, px, py, A, ui){ for (const q of ui.bt || []) if (BGD.hit(q, px, py)) return {k: q.k}; return null; }
});

/* ---------------- 🀫 숫자 타일 (루미큐브 같은) ---------------- */
const RK_C = ["#e03131", "#1971c2", "#f08c00", "#212529"];
BG.def({
  id: "rk", e: "🧮", n: "숫자 타일", like: "루미큐브 같은 게임", time: "20분", min: 2, max: 4, col: ["#ff6b6b", "#4dabf7", "#ffa94d", "#adb5bd"], hidden: true,
  d: "같은 숫자 모으기·같은 색 연속 숫자로 타일을 내려놓아요! 먼저 다 내면 승리",
  rules: ["묶음은 두 가지: <b>같은 숫자·다른 색 3~4개</b> (예: 🔴7 🔵7 🟠7) 또는 <b>같은 색·이어지는 숫자 3개 이상</b> (예: 🔵4 🔵5 🔵6).", "타일을 눌러 고르고 <b>📦 묶음 만들기</b> → 다 만들었으면 <b>⬇️ 내려놓기</b>. 처음 내려놓을 때는 숫자 합이 <b>30 이상</b>이어야 해요.", "한 번 내려놓은 뒤에는 판 위 묶음에 내 타일을 <b>붙일 수</b> 있어요(타일 고르고 묶음 누르기).", "아무것도 못 내면 <b>🂠 한 장 가져오기</b>. 냈으면 <b>✅ 차례 끝</b>.", "타일을 먼저 <b>모두 내려놓으면</b> 이겨요!"],
  num: id => id % 13 + 1, colr: id => Math.floor(id % 52/13),
  setup(n, R){ const D = BG.shuffle(Array.from({length: 104}, (_, i) => i), R); const h = Array.from({length: n}, () => D.splice(0, 14)); return {n, h, d: D, tb: [], t: 0, melt: Array(n).fill(0), put: 0, pass: 0, win: -1}; },
  turn: S => S.win >= 0 ? -1 : S.t,
  valid(ids){ if (ids.length < 3) return false; const N = ids.map(this.num), C = ids.map(this.colr);
    if (N.every(x => x === N[0]) && ids.length <= 4 && new Set(C).size === C.length) return true;
    if (C.every(x => x === C[0])){ const s = N.slice().sort((a, b) => a - b); return s.every((v, i) => !i || v === s[i - 1] + 1); } return false; },
  sortSet(ids){ return ids.slice().sort((a, b) => this.num(a) - this.num(b) || this.colr(a) - this.colr(b)); },
  sum(ids){ return ids.reduce((a, x) => a + this.num(x), 0); },
  next(S){ S.t = (S.t + 1) % S.n; S.put = 0; },
  act(S, p, a){
    const H = S.h[p], has = ids => ids.every(x => H.includes(x)) && new Set(ids).size === ids.length;
    if (a.k === "meld"){ if (!Array.isArray(a.sets) || !a.sets.length) return false; const all = a.sets.flat(); if (!has(all) || !a.sets.every(s => this.valid(s))) return false;
      if (!S.melt[p] && this.sum(all) < 30) return false; S.h[p] = H.filter(x => !all.includes(x)); a.sets.forEach(s => S.tb.push(this.sortSet(s))); S.melt[p] = 1; S.put = 1; S.pass = 0;
      if (!S.h[p].length) S.win = p; bgFx(S, {k: "meld", say: `⬇️ ${all.length}개 내려놓기!`, snd: "gold"}); return true; }
    if (a.k === "add"){ if (!S.melt[p] || !has(a.ids || []) || !S.tb[a.s]) return false; const ns = S.tb[a.s].concat(a.ids); if (!this.valid(ns)) return false;
      S.tb[a.s] = this.sortSet(ns); S.h[p] = H.filter(x => !a.ids.includes(x)); S.put = 1; S.pass = 0; if (!S.h[p].length) S.win = p; bgFx(S, {k: "add", s: a.s, snd: "pt"}); return true; }
    if (a.k === "draw"){ if (S.put) return false; if (S.d.length) H.push(S.d.pop()); else S.pass++; if (S.pass >= S.n){ const sc = S.h.map(h => this.sum(h)); S.win = sc.indexOf(Math.min(...sc)); } this.next(S); bgFx(S, {k: "draw", snd: "pt"}); return true; }
    if (a.k === "end"){ if (!S.put) return false; this.next(S); bgFx(S, {k: "end"}); return true; }
    return false; },
  over(S){ if (S.win < 0) return null; const rank = Array.from({length: S.n}, (_, i) => i).sort((a, b) => this.sum(S.h[a]) - this.sum(S.h[b])); return {w: S.win, rank, txt: "타일을 모두 내려놓았어요!"}; },
  view(S, p){ const V = JSON.parse(JSON.stringify(S)); V.h = S.h.map((h, q) => q === p ? h : h.map(() => -1)); V.d = S.d.map(() => -1); return V; },
  pinfo(S, i){ return S ? `🧮 ${S.h[i].length}개${S.melt[i] ? "" : " · 첫 30점 전"}` : ""; },
  findSets(H){ const sets = [], used = new Set();
    for (let c = 0; c < 4; c++){ const byN = {}; H.filter(x => this.colr(x) === c).forEach(x => { if (!byN[this.num(x)]) byN[this.num(x)] = x; });
      let run = []; for (let v = 1; v <= 14; v++){ if (byN[v] != null && !used.has(byN[v])) run.push(byN[v]); else { if (run.length >= 3){ sets.push(run.slice()); run.forEach(x => used.add(x)); } run = []; } } }
    for (let v = 13; v >= 1; v--){ const byC = {}; H.filter(x => this.num(x) === v && !used.has(x)).forEach(x => { if (byC[this.colr(x)] == null) byC[this.colr(x)] = x; }); const L = Object.values(byC); if (L.length >= 3){ sets.push(L); L.forEach(x => used.add(x)); } }
    return sets; },
  ai(S, p, R, X){ const H = S.h[p];
    if (!S.put || S.melt[p]){ const sets = this.findSets(H); if (sets.length && !S.put || (sets.length && S.melt[p])){ const sum = this.sum(sets.flat()); if (S.melt[p] || sum >= 30) return {k: "meld", sets}; } }
    if (S.melt[p] && X.lv > 0) for (const x of H) for (let s = 0; s < S.tb.length; s++) if (this.valid(S.tb[s].concat([x]))) return {k: "add", s, ids: [x]};
    return S.put ? {k: "end"} : {k: "draw"}; },
  tileDraw(g, id, x, y, w, h, sel){ g.save(); if (sel) BGD.shadow(g, true, 16, 0, "#ffe066"); if (id < 0){ BGD.tile(g, x, y, w, h, "#fff3bf", "#e9ecef", 8); g.restore(); return; }
    BGD.tile(g, x, y, w, h, BGD.lg(g, x, y, x, y + h, ["#fffdf5", "#f1e9d2"]), sel ? "#ffd43b" : "#ced4da", 8); g.restore();
    BGD.txt(g, String(this.num(id)), x + w/2, y + h*.44, h*.45, RK_C[this.colr(id)], "center", "bold "); g.fillStyle = RK_C[this.colr(id)]; g.beginPath(); g.arc(x + w/2, y + h*.8, h*.07, 0, 7); g.fill(); },
  draw(g, S, me, A, ui, X){
    BGD.felt(g, A.x + 4, A.y + 4, A.w - 8, A.h*.62, 24, "#2b6e4f");
    ui.sets = ui.sets || []; ui.selH = (ui.selH || []).filter(x => (S.h[me] || []).includes(x));
    const staged = new Set(ui.sets.flat());
    const tw = Math.min(42, A.w/26), th = tw*1.35; let x = A.x + 20, y = A.y + 20; ui.tbHit = [];
    S.tb.forEach((s, si) => { const w = s.length*(tw + 2) + 10; if (x + w > A.x + A.w - 16){ x = A.x + 20; y += th + 14; }
      BGD.box(g, x - 5, y - 5, w, th + 10, 10, "rgba(0,0,0,.18)"); s.forEach((id, k) => this.tileDraw(g, id, x + k*(tw + 2), y, tw, th)); ui.tbHit.push({x: x - 5, y: y - 5, w, h: th + 10, s: si}); x += w + 12; });
    ui.sets.forEach((s, si) => { const w = s.length*(tw + 2) + 10; if (x + w > A.x + A.w - 16){ x = A.x + 20; y += th + 14; } BGD.box(g, x - 5, y - 5, w, th + 10, 10, "rgba(255,212,59,.25)", "#ffd43b", 2); s.forEach((id, k) => this.tileDraw(g, id, x + k*(tw + 2), y, tw, th)); x += w + 12; });
    if (!S.tb.length && !ui.sets.length) outlined(g, "판이 비어 있어요 · 묶음을 만들어 내려놓아요", A.x + A.w/2, A.y + A.h*.3, 22, "#c3fae8");
    outlined(g, `🂠 남은 타일 ${S.d.length}`, A.x + A.w - 110, A.y + A.h*.62 - 22, 17, "#c3fae8");
    const H = (S.h[me] || []).filter(x => !staged.has(x)).sort((a, b) => this.colr(a) - this.colr(b) || this.num(a) - this.num(b)), hw = Math.min(54, (A.w - 30)/Math.max(14, Math.ceil(H.length/2)) - 4), hh = hw*1.35, per = Math.floor((A.w - 30)/(hw + 4));
    const ry = A.y + A.h*.62 + 14; BGD.wood(g, A.x + 4, ry - 6, A.w - 8, Math.ceil(H.length/per)*(hh + 8) + 12, 14); ui.hand = [];
    H.forEach((id, i) => { const xx = A.x + 14 + (i % per)*(hw + 4), yy = ry + Math.floor(i/per)*(hh + 8), sl = ui.selH.includes(id); this.tileDraw(g, id, xx, yy - (sl ? 8 : 0), hw, hh, sl); ui.hand.push({x: xx, y: yy, w: hw, h: hh, id}); });
    const my = S.t === me && S.win < 0, by = A.y + A.h - 64, bw = (A.w - 50)/4; ui.bt = [];
    if (my){ const selOk = ui.selH.length >= 3 && this.valid(ui.selH), stSum = this.sum(ui.sets.flat());
      ui.bt.push({k: "mk", x: A.x + 10, y: by, w: bw, h: 58, t: "📦 묶음 만들기", p: selOk, off: !selOk},
        {k: "meld", x: A.x + 20 + bw, y: by, w: bw, h: 58, t: S.melt[me] ? "⬇️ 내려놓기" : `⬇️ 내려놓기 ${stSum}/30`, p: ui.sets.length && (S.melt[me] || stSum >= 30), off: !ui.sets.length, c: "#20c997"},
        {k: ui.sets.length ? "back" : S.put ? "end" : "draw", x: A.x + 30 + bw*2, y: by, w: bw, h: 58, t: ui.sets.length ? "↩️ 되돌리기" : S.put ? "✅ 차례 끝" : "🂠 한 장 가져오기", p: !ui.sets.length && !!S.put, c: "#7950f2"},
        {k: "clr", x: A.x + 40 + bw*3, y: by, w: bw, h: 58, t: "✋ 고르기 취소", off: !ui.selH.length});
      ui.bt.forEach(b => BGD.btn(g, b));
      if (ui.selH.length && S.melt[me]) outlined(g, "판 위 묶음을 누르면 붙여요", A.x + A.w/2, by - 14, 17, "#ffe066"); }
  },
  tap(S, me, px, py, A, ui){
    for (const b of ui.bt || []) if (BGD.hit(b, px, py)){ if (b.off) return null;
      if (b.k === "mk"){ ui.sets.push(ui.selH.slice()); ui.selH = []; return null; }
      if (b.k === "meld"){ const sets = ui.sets; ui.sets = []; return {k: "meld", sets}; }
      if (b.k === "back"){ ui.sets = []; return null; } if (b.k === "clr"){ ui.selH = []; return null; }
      return {k: b.k}; }
    for (const h of ui.hand || []) if (BGD.hit(h, px, py)){ ui.selH = ui.selH.includes(h.id) ? ui.selH.filter(x => x !== h.id) : ui.selH.concat([h.id]); return null; }
    if (ui.selH.length) for (const t of ui.tbHit || []) if (BGD.hit(t, px, py)){ const ids = ui.selH; ui.selH = []; return {k: "add", s: t.s, ids}; }
    return null; },
  bad: (S, p, a) => a.k === "meld" && !S.melt[p] ? "처음엔 숫자 합이 30 이상이어야 해요" : a.k === "add" ? (S.melt[p] ? "그 묶음에는 붙일 수 없어요" : "먼저 30점 이상 내려놓아야 붙일 수 있어요") : "지금은 할 수 없어요"
});
