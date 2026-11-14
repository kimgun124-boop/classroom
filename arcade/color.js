/* =====================================================================
   🎨 색칠 스피드 (2026.11.14) — 혼자 점수전
   - 그림 칸마다 숫자가 있어요. 아래 물감에서 같은 숫자 색을 고르고 쓱쓱 문지르면 칠해져요
   - 다른 숫자 칸은 문질러도 안 칠해져서 마음 놓고 쓱쓱! (톡 눌러서 틀리면 -1초)
   - 60초 안에 그림을 많이 완성할수록 점수 ↑ · 완성할 때마다 +4초 · 연속 칠하기 콤보
   - ⚡ 그림판은 바뀔 때만 다시 그리고(미리 그린 그림 붙이기), 매 장면엔 효과만 그려요
   ===================================================================== */
const CPAL = {
  r: ["#ff6b6b", "빨강"], o: ["#ff922b", "주황"], y: ["#ffd43b", "노랑"], g: ["#51cf66", "초록"], G: ["#2f9e44", "진초록"],
  b: ["#4dabf7", "파랑"], B: ["#1c7ed6", "남색"], p: ["#b197fc", "보라"], k: ["#f783ac", "분홍"], n: ["#a9764a", "갈색"],
  w: ["#ffffff", "하양"], d: ["#495057", "검정"], s: ["#d0ebff", "하늘"], c: ["#ffe8cc", "살구"]
};
const CPICS = [
  ["❤️ 하트", ["ssssssss","srrssrrs","rwrrrrrr","rrrrrrrr","srrrrrrs","ssrrrrss","sssrrsss","ssssssss"]],
  ["🍎 사과", ["ssssgsss","sssngsss","srrrnrrs","rrwrrrrr","rwrrrrrr","rrrrrrrr","srrrrrrs","ssrrrrss"]],
  ["🍄 버섯", ["sssrrrsss","ssrrwrrss","srrwwrrrs","rrrrrrwwr","rrwrrrrrr","sssdcdsss","ssscccsss","ssscccsss","ggggggggg"]],
  ["🐟 물고기", ["bbbbbbbbbb","bbbooobbbb","bbooooobyy","boowooooyy","bodwoooooy","boooooobyy","bbbooobbbb","bbbbbbbbbb"]],
  ["🍦 아이스크림", ["sskkkkss","skkwkkks","kkkkkkpk","kpkkkkkk","yyyyyyyy","synnnnys","ssyyyyss","ssynnyss","sssyysss","sssyysss"]],
  ["🐱 고양이", ["osssssso","ooossooo","oooooooo","odwoodwo","oooooooo","oowkkwoo","sowwwwos","ssooooss"]],
  ["🌷 꽃", ["sssssssss","sskskskss","sskkkkkss","sskkykkss","ssskkksss","ggssgssgg","sggsgsggs","sssggggss","nnnnnnnnn"]],
  ["🚀 로켓", ["ssssrssss","sssrrrsss","ssswwwsss","sswwbwwss","sswbBbwss","sswwbwwss","sswwwwwss","srwwwwwrs","rrwwwwwrr","rssoyossr","sssoyosss"]],
  ["🏠 집", ["ssssrrsssss","sssrrrrssss","ssrrrrrrsss","srrrrrrrrss","rrrrrrrrrrs","swwwwwwwwss","swbbwwnnwss","swbbwwnnwss","swwwwwnnwss","ggggggggggg"]],
  ["🌈 무지개", ["ssssssssssss","sssrrrrrrsss","ssrroooorrss","srooyyyyoors","rooyggggyoor","roygbbbbgyor","roygbsssgyor","wwygbsssgyww","wwwwbsssbwww","ssssssssssss"]],
  ["🍉 수박", ["ssssssssssss","sssssssssssG","ssssssssssGG","sssssssssGgG","rrrrrrrrGgGs","rrdrrrdrGGss","rrrrrrrGgGss","rdrrrdrGGsss","rrrrrGgGssss","rrrGGGssssss","GGGGssssssss","ssssssssssss"]],
  ["🐼 판다", ["ddsssssssdd","ddwwwwwwwdd","swwwwwwwwws","wwddwwwddww","wddwdwdwddw","wwddwwwddww","wwwwwddwwww","wwwwkkkwwww","swwwwwwwwws","ssdwwwwwdss","sdddwwwddds"]],
  ["🌳 나무", ["ssssgggssss","ssggGggggss","sgggggGgggs","sggGgggggGs","gggggrgggGg","gGggggggggg","sgggGgggrgs","ssggggGggss","ssssnnnssss","ssssnnnssss","ggggnnngggg"]],
  ["⭐ 별", ["ssssssyssssss","ssssssyssssss","sssssyyysssss","sssssyyysssss","yyyyyyyyyyyyy","syyyyyyyyyyys","ssyyydydyyyss","sssyyyyyyysss","sssyyyykyysss","ssyyyysyyyyss","ssyyysssyyyss","syyssssssyyss"]]
];
/* 그림 자료 확인 (개발용) */
CPICS.forEach(([n, rows]) => { if (rows.some(r => r.length !== rows[0].length)) console.warn("색칠 그림 줄 길이가 달라요:", n); });

NG.defs.cp = () => {
  const W = 960, H = 600, T = 60*60, BX = 34, BY = 70, BS = 510, PX = 580, PW = 350;
  let t, score, combo, best, pics, done, pi, pic, cells, cols, cur, left, cs, ox, oy, pal, dirty, bimg, fx, pops, flash, wrongs, painted, drag, freeze, shake, lastHit;
  const SND = {paint: k => tone(520 + (k % 8)*60, 620 + (k % 8)*60, .05, "triangle", .06), pick: () => tone(700, 900, .06, "sine", .08),
    wrong: () => tone(220, 120, .18, "square", .07), done: () => [784, 988, 1175, 1568].forEach((f, k) => tone(f, f, .12, "triangle", .1, k*.07)), colorDone: () => tone(988, 1318, .1, "triangle", .08)};
  function load(){
    const [name, rows] = pics[pi % pics.length];
    const keys = [...new Set(rows.join(""))].sort(() => rnd(1) - .5);                 // 매번 숫자를 새로 섞어요
    cols = keys.map((k, i) => ({k, no: i + 1, hex: CPAL[k][0], nm: CPAL[k][1], left: 0}));
    const R = rows.length, C = rows[0].length;
    cells = []; rows.forEach((row, y) => [...row].forEach((k, x) => { const c = cols.find(q => q.k === k); c.left++; cells.push({x, y, c, on: false, t: 0}); }));
    pic = {name, R, C}; left = cells.length;
    cs = Math.floor(Math.min(BS/C, BS/R)); ox = BX + (BS - cs*C)/2; oy = BY + (BS - cs*R)/2;
    cur = cols.slice().sort((a, b) => b.left - a.left)[0];                              // 제일 많은 색부터 골라 줘요
    layoutPal(); dirty = true;
  }
  function layoutPal(){
    const n = cols.length, per = n <= 5 ? 1 : 2, rows = Math.ceil(n/per), gap = 10, h = Math.min(92, (BS - gap*(rows - 1))/rows), w = (PW - gap*(per - 1))/per;
    pal = cols.map((c, i) => ({c, x: PX + (i % per)*(w + gap), y: BY + Math.floor(i/per)*(h + gap) + (BS - (rows*h + gap*(rows - 1)))/2, w, h}));
  }
  function render(){
    // 그림판을 따로 그려 두고, 매 장면엔 붙이기만 해요
    const k = NG.k || 1, Wb = Math.ceil(BS*k), c2 = bimg || document.createElement("canvas");
    if (c2.width !== Wb){ c2.width = c2.height = Wb; } bimg = c2;
    const g = c2.getContext("2d"); g.setTransform(k, 0, 0, k, -BX*k, -BY*k); g.clearRect(BX, BY, BS, BS);
    g.fillStyle = "#fff"; rrect(g, ox - 8, oy - 8, cs*pic.C + 16, cs*pic.R + 16, 16); g.fill();
    const fs = Math.max(10, Math.round(cs*.42));
    g.font = `${fs}px "Jua",sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
    for (const q of cells){
      const x = ox + q.x*cs, y = oy + q.y*cs;
      if (q.on){ g.fillStyle = q.c.hex; g.fillRect(x, y, cs + .6, cs + .6); continue; }
      const sel = q.c === cur;
      g.fillStyle = sel ? mix(q.c.hex, .38) : ((q.x + q.y) % 2 ? "#f1f3f5" : "#f8f9fa"); g.fillRect(x, y, cs + .6, cs + .6);
      g.fillStyle = sel ? "#212529" : "#adb5bd"; g.fillText(q.c.no, x + cs/2, y + cs/2 + 1);
    }
    g.strokeStyle = "rgba(0,0,0,.08)"; g.lineWidth = 1; g.beginPath();
    for (let i = 0; i <= pic.C; i++){ g.moveTo(ox + i*cs, oy); g.lineTo(ox + i*cs, oy + cs*pic.R); }
    for (let i = 0; i <= pic.R; i++){ g.moveTo(ox, oy + i*cs); g.lineTo(ox + cs*pic.C, oy + i*cs); } g.stroke();
    dirty = false;
  }
  function mix(hex, a){ const n = parseInt(hex.slice(1), 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255; return `rgb(${Math.round(255 + (r - 255)*a)},${Math.round(255 + (gg - 255)*a)},${Math.round(255 + (b - 255)*a)})`; }
  const cellAt = (x, y) => { const cx = Math.floor((x - ox)/cs), cy = Math.floor((y - oy)/cs); return cx < 0 || cy < 0 || cx >= pic.C || cy >= pic.R ? null : cells[cy*pic.C + cx]; };
  function pick(c){ if (!c || c === cur) return; cur = c; dirty = true; SND.pick(); }
  function paint(q){
    q.on = true; q.t = 14; left--; q.c.left--; painted++; dirty = true;
    const now = NG.frame; combo = now - lastHit < 40 ? combo + 1 : 1; lastHit = now; best = Math.max(best, combo);
    const pts = 1 + (combo >= 30 ? 2 : combo >= 12 ? 1 : 0); score += pts;
    if (combo % 20 === 0){ fx.push({x: Math.max(BX + 70, Math.min(BX + BS - 70, ox + q.x*cs + cs/2)), y: oy + q.y*cs - 6, s: `🔥 ${combo}콤보!`, c: "#ffa94d", t: 50}); }
    SND.paint(painted);
    if (!q.c.left){ SND.colorDone(); fx.push({x: PX + PW/2, y: BY + BS + 12, s: `${q.c.no}번 ${q.c.nm} 끝! ✔`, c: q.c.hex === "#ffffff" ? "#fff" : q.c.hex, t: 45});
      const nx = cols.filter(c => c.left).sort((a, b) => b.left - a.left)[0]; if (nx) cur = nx; }     // 다 칠한 색은 다음 색으로 바로 넘어가요
    if (!left) finishPic();
  }
  function finishPic(){
    done++; const bonus = 10 + pic.R*pic.C/4 | 0; score += bonus; t = Math.min(T, t + 4*60); freeze = 70; flash = 1; SND.done();
    fx.push({x: BX + BS/2, y: BY + BS/2 - 30, s: `${pic.name} 완성!`, c: "#fff", t: 70, big: 1}, {x: BX + BS/2, y: BY + BS/2 + 34, s: `+${bonus}점 · ⏱️ +4초`, c: "#ffe066", t: 70});
    for (let i = 0; i < 50; i++){ const a = rnd(Math.PI*2), sp = 3 + rnd(7); pops.push({x: BX + BS/2, y: BY + BS/2, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp - 3, t: 50 + rnd(20), c: cols[i % cols.length].hex}); }
  }
  function tryAt(x, y, tap){
    const q = cellAt(x, y); if (!q || q.on) return;
    if (q.c === cur) return paint(q);
    if (tap){ wrongs++; combo = 0; t = Math.max(0, t - 60); shake = 8; SND.wrong(); q.bad = 18;
      fx.push({x: Math.max(BX + 110, Math.min(BX + BS - 110, ox + q.x*cs + cs/2)), y: oy + q.y*cs, s: `${q.c.no}번 칸이에요 · -1초`, c: "#ff8787", t: 40}); }
  }
  function line(a, b){ const d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(1, Math.ceil(d/(cs*.35))); for (let i = 1; i <= n; i++) tryAt(a.x + (b.x - a.x)*i/n, a.y + (b.y - a.y)*i/n, false); }
  return { W, H,
    init(){ t = T; score = 0; combo = 0; best = 0; done = 0; painted = 0; wrongs = 0; fx = []; pops = []; flash = 0; shake = 0; drag = {}; freeze = 0; lastHit = -99; bimg = null;
      // 작은 그림부터, 같은 크기끼리는 섞어서
      const by = {}; CPICS.forEach(p => { const n = p[1].length*p[1][0].length; (by[n < 75 ? 0 : n < 100 ? 1 : n < 125 ? 2 : 3] = by[n < 75 ? 0 : n < 100 ? 1 : n < 125 ? 2 : 3] || []).push(p); });
      pics = [0, 1, 2, 3].flatMap(k => (by[k] || []).sort(() => rnd(1) - .5)); pi = 0; load(); },
    down(x, y, id){
      if (freeze) return;
      const p = pal.find(p => x >= p.x && x <= p.x + p.w && y >= p.y && y <= p.y + p.h); if (p){ pick(p.c); return; }
      drag[id] = {x, y}; tryAt(x, y, true);
    },
    move(x, y, id){ const d = drag[id]; if (!d || freeze) return; line(d, {x, y}); drag[id] = {x, y}; },
    up(x, y, id){ delete drag[id]; },
    key(code, d){ if (!d) return false; const m = /^(Digit|Numpad)([1-9])$/.exec(code); if (m){ pick(cols[+m[2] - 1]); return true; }
      if (code === "Space" || code === "Tab"){ const L = cols.filter(c => c.left); if (L.length){ pick(L[(L.indexOf(cur) + 1) % L.length]); } return true; } return false; },
    step(){
      if (freeze){ if (--freeze === 0){ pi++; load(); } }
      else { t--; if (t <= 0){ NG.over(score, `<div>🎨 그림 <b>${done}</b>장 완성 · <b>${painted}</b>칸 칠함 · 최고 <b>${best}</b>콤보${wrongs ? ` · 틀린 칸 ${wrongs}번` : ""}</div>`); return; } }
      if (NG.frame - lastHit > 40 && combo) combo = 0;
      for (const q of cells) { if (q.t) q.t--; if (q.bad) q.bad--; }
      fx = fx.filter(f => (f.y -= .7, --f.t > 0)); pops = pops.filter(p => (p.x += p.vx, p.y += p.vy, p.vy += .25, --p.t > 0));
      if (flash > 0) flash -= .03; if (shake > 0) shake *= .8;
    },
    draw(g){
      G2.bg(g, "cpbg" + W + "x" + H, W, H, t => { const gr = t.createLinearGradient(0, 0, W, H); gr.addColorStop(0, "#ffe3ec"); gr.addColorStop(.5, "#e5dbff"); gr.addColorStop(1, "#d0ebff"); t.fillStyle = gr; t.fillRect(0, 0, W, H); });
      g.save(); if (shake > .5) g.translate(rnd(-shake, shake), rnd(-shake, shake));
      if (dirty || !bimg || bimg.width !== Math.ceil(BS*(NG.k || 1))) render();
      g.drawImage(bimg, BX, BY, BS, BS);
      // 방금 칠한 칸 반짝 · 틀린 칸 빨간 테
      for (const q of cells){
        if (q.t){ const x = ox + q.x*cs, y = oy + q.y*cs, s = q.t/14; g.fillStyle = `rgba(255,255,255,${s*.7})`; g.fillRect(x + cs*(1 - s)/2, y + cs*(1 - s)/2, cs*s, cs*s); }
        if (q.bad){ g.strokeStyle = `rgba(250,82,82,${q.bad/18})`; g.lineWidth = 4; g.strokeRect(ox + q.x*cs + 2, oy + q.y*cs + 2, cs - 4, cs - 4); }
      }
      if (flash > 0){ g.fillStyle = `rgba(255,255,255,${flash*.6})`; g.fillRect(BX, BY, BS, BS); }
      // 물감
      for (const p of pal){
        const c = p.c, on = c === cur, fin = !c.left;
        g.globalAlpha = fin ? .4 : 1;
        g.fillStyle = on ? "#fff" : "rgba(255,255,255,.65)"; rrect(g, p.x, p.y, p.w, p.h, 18); g.fill();
        if (on){ g.strokeStyle = "#7048e8"; g.lineWidth = 5; rrect(g, p.x + 2.5, p.y + 2.5, p.w - 5, p.h - 5, 16); g.stroke(); }
        const r = Math.min(p.h*.36, 30), cx = p.x + 16 + r, cy = p.y + p.h/2;
        g.fillStyle = c.hex; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); g.strokeStyle = "rgba(0,0,0,.15)"; g.lineWidth = 2; g.stroke();
        g.fillStyle = "rgba(255,255,255,.55)"; g.beginPath(); g.arc(cx - r*.35, cy - r*.35, r*.28, 0, 7); g.fill();
        outlined(g, String(c.no), cx, cy + 1, r*1.1, "#fff", "rgba(0,0,0,.55)");
        g.fillStyle = "#343a40"; g.font = `${Math.round(Math.min(26, p.h*.3))}px "Jua",sans-serif`; g.textAlign = "left"; g.textBaseline = "middle";
        g.fillText(fin ? `${c.nm} ✔` : c.nm, cx + r + 12, cy - (p.w > 200 ? 0 : 8));
        g.fillStyle = "#868e96"; g.font = `${Math.round(Math.min(18, p.h*.22))}px "Jua",sans-serif`;
        if (!fin) g.fillText(`${c.left}칸`, p.w > 200 ? p.x + p.w - 60 : cx + r + 12, cy + (p.w > 200 ? 0 : 14));
        g.globalAlpha = 1;
      }
      pops.forEach(p => { g.globalAlpha = Math.min(1, p.t/30); g.fillStyle = p.c; g.fillRect(p.x, p.y, 8, 8); }); g.globalAlpha = 1;
      fx.forEach(f => { g.globalAlpha = Math.min(1, f.t/20); outlined(g, f.s, f.x, f.y, f.big ? 58 : 26, f.c); }); g.globalAlpha = 1;
      g.restore();
      // 위쪽: 시간 막대 · 점수 · 그림 이름
      const low = t < 10*60;
      g.fillStyle = "rgba(0,0,0,.12)"; rrect(g, 20, 14, W - 40, 18, 9); g.fill();
      g.fillStyle = low ? "#ff6b6b" : "#845ef7"; rrect(g, 20, 14, Math.max(0, (W - 40)*t/T), 18, 9); g.fill();
      outlined(g, `${score}점`, W/2, 52, 36, "#fff", "rgba(80,40,140,.85)");
      outlined(g, `${pic.name} · ${pics.length ? (done + 1) : 1}번째 그림`, BX + 6, 52, 22, "#fff", "rgba(80,40,140,.8)", "left");
      outlined(g, combo >= 3 ? `🔥 ${combo}콤보` : `⏱️ ${Math.ceil(t/60)}초`, W - 26, 52, 24, combo >= 3 ? "#ffa94d" : (low ? "#ff6b6b" : "#fff"), "rgba(80,40,140,.8)", "right");
      if (t > T - 200 && !done) outlined(g, "같은 숫자 색을 고르고 쓱쓱 문질러요!", BX + BS/2, BY + BS + 12, 22, "#fff", "rgba(80,40,140,.8)");
    },
    hud(){ return `⏱️ <b>${Math.ceil(t/60)}</b>초 · 점수 <b>${score}</b> · 완성 <b>${done}</b>장 · <small>숫자키 1~9로 색 고르기 · Space 다음 색</small>`; }
  };
};
