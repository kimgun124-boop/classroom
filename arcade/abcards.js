/* =====================================================================
   ⚾ 동물 프로야구 — 선수 카드 · 뽑기 · 내 팀 (2026.11.25)
   - 동물 선수 카드 96장 + 새싹 선수 9명(처음부터 있어요)
   - 포지션: 투수 · 포수 · 1루 · 2루 · 3루 · 유격 · 좌익 · 중견 · 우익
   - 별: ⭐일반 · ⭐⭐희귀 · ⭐⭐⭐영웅 · ⭐⭐⭐⭐전설
   - 뽑기는 보드게임 코인을 써요 · 같은 카드가 또 나오면 강화(+1, 최대 +5)
   - 모은 카드·내 팀은 지갑(kids/{sid}.abb)에 저장돼서 앱을 바꿔도 그대로예요
     abb = {c: {카드id: 장수}, l: {P: id, C: id, …}, n: 뽑은 횟수}
   ===================================================================== */
const ABC = (() => {
  const POS = ["P", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF"];
  const PN = {P: "투수", C: "포수", "1B": "1루수", "2B": "2루수", "3B": "3루수", SS: "유격수", LF: "좌익수", CF: "중견수", RF: "우익수"};
  const PS = {P: "투", C: "포", "1B": "1루", "2B": "2루", "3B": "3루", SS: "유격", LF: "좌익", CF: "중견", RF: "우익"};
  /* 같은 무리면 다른 자리도 해요 (수비가 조금 낮아져요) */
  const GRP = {C: "C", "1B": "Q", "3B": "Q", "2B": "M", SS: "M", LF: "O", CF: "O", RF: "O", P: "P"};
  const RAR = [{n: "일반", s: "⭐", c: "#adb5bd", g: "#495057"}, {n: "희귀", s: "⭐⭐", c: "#4dabf7", g: "#1864ab"},
               {n: "영웅", s: "⭐⭐⭐", c: "#b197fc", g: "#5f3dc4"}, {n: "전설", s: "⭐⭐⭐⭐", c: "#ffd43b", g: "#e67700"}];
  const PT = {fb: {n: "직구", e: "⚡", sp: 1, B: [0, .05]}, ts: {n: "투심", e: "💨", sp: .95, B: [.17, -.14]}, cu: {n: "커브", e: "🌙", sp: .76, B: [.16, -.6]},
              sl: {n: "슬라이더", e: "↪️", sp: .86, B: [-.4, -.12]}, ch: {n: "체인지업", e: "🐢", sp: .8, B: [.1, -.3]}, fk: {n: "포크", e: "🍴", sp: .86, B: [0, -.52]},
              /* ⚾ (2026.11.27) 새 공 8가지 — 빠르기·꺾임이 다 달라서 타자와 타이밍 싸움! (d: 게이지가 빨라지는 정도) */
              ct: {n: "커터", e: "✂️", sp: .93, B: [-.16, -.06], d: 1.1}, si: {n: "싱커", e: "⬇️", sp: .91, B: [.24, -.36], d: 1.1}, spl: {n: "스플리터", e: "🪨", sp: .87, B: [.04, -.46], d: 1.2},
              sw: {n: "스위퍼", e: "🌀", sp: .82, B: [-.64, -.1], d: 1.3}, sc: {n: "스크루볼", e: "🔩", sp: .8, B: [.42, -.32], d: 1.3}, rf: {n: "라이징", e: "🚀", sp: 1.03, B: [0, .22], d: 1.25},
              kn: {n: "너클볼", e: "🦋", sp: .7, B: [0, -.18], d: 1.5, wob: 1}, ep: {n: "아리랑볼", e: "🎈", sp: .55, B: [0, -.08], d: .9, arc: 1.5}};
  /* 카드: 이모지|이름|자리|별(0~3)|특기 (p 힘 · c 정확 · s 빠름 · d 수비 · a 어깨 | v 구속 · k 제구 · b 변화구 · t 체력) */
  const RAW = `🐔|꼬꼬 닭|P|0|k 🐷|통통 돼지|P|0|t 🐑|몽실 양|P|0|k 🐸|개굴 개구리|P|0|b 🐧|뒤뚱 펭귄|P|0|t 🦆|꽥꽥 오리|P|0|k 🐮|음메 젖소|P|0|t 🐹|볼볼 햄스터|P|0|b
🦊|꾀돌이 여우|P|1|bk 🦉|밤하늘 부엉이|P|1|kb 🐺|달빛 늑대|P|1|vt 🦌|바람 사슴|P|1|vk 🐐|돌산 염소|P|1|tv 🦜|알록 앵무새|P|1|bk 🐬|물결 돌고래|P|1|vb
🦅|폭풍 독수리|P|2|vk 🐻‍❄️|얼음 북극곰|P|2|vt 🦈|회오리 상어|P|2|vb 🐍|요술 뱀|P|2|bk 🦩|학다리 플라밍고|P|2|kb
🐲|불꽃 용|P|3|vbt 🦄|무지개 유니콘|P|3|bkv 🦖|강속구 티라노|P|3|vtk
🐢|단단 거북|C|0|d 🐻|곰돌이|C|0|p 🦔|따끔 고슴도치|C|0|d 🦏|든든 코뿔소|C|1|pd 🦫|부지런 비버|C|1|dc 🦍|킹콩 고릴라|C|2|pda 🐘|기억왕 코끼리|C|2|cd 🦬|천둥 들소|C|3|pda 🐊|철벽 악어|C|1|da
🐼|냠냠 판다|1B|0|p 🐨|졸린 코알라|1B|0|c 🐗|돌격 멧돼지|1B|0|p 🐂|황소 거포|1B|1|p 🦛|하품 하마|1B|1|pd 🐃|물소 장군|1B|2|pc 🦭|물범 대장|1B|2|cd 🦁|백수의 왕 사자|1B|3|pcd 🐻|꿀단지 곰|1B|1|pc
🐿️|도토리 다람쥐|2B|0|sd 🐭|찍찍 생쥐|2B|0|s 🐞|점박이 무당벌레|2B|0|c 🦝|재빠른 너구리|2B|1|sd 🐒|재주꾼 원숭이|2B|1|cd 🦦|물찬 수달|2B|2|sdc 🐱|날쌘 고양이|2B|2|sd 🐵|손오공 원숭이|2B|3|csd 🐹|쪼르르 햄찌|2B|1|sc
🦎|꼬리 도마뱀|SS|0|s 🐇|깡총 토끼|SS|0|s 🦀|옆걸음 게|SS|0|d 🦊|불여우|SS|1|sd 🐶|멍멍 강아지|SS|1|cd 🐆|점박이 표범|SS|2|sda 🦡|용감한 오소리|SS|2|dc 🐯|번개 호랑이|SS|3|sdp 🐰|달토끼|SS|1|sc
🐌|느긋 달팽이|3B|0|d 🦨|뿡뿡 스컹크|3B|0|p 🐙|여덟 팔 문어|3B|0|dc 🐊|악어 수비대|3B|1|da 🐏|뿔난 숫양|3B|1|pa 🦧|오랑우탄 거포|3B|2|pa 🦞|집게 랍스터|3B|2|da 🦕|공룡 거인|3B|3|pda 🐗|산 멧돼지|3B|1|pd
🦇|박쥐 소년|LF|0|s 🐝|윙윙 꿀벌|LF|0|c 🦥|나무늘보|LF|0|d 🦘|점프 캥거루|LF|1|ps 🐫|사막 낙타|LF|1|ca 🦒|키다리 기린|LF|2|dp 🐅|밀림 호랑이|LF|2|pc 🐳|대왕 고래|LF|3|pca 🦙|복슬 라마|LF|1|ca
🐴|따각 망아지|CF|0|s 🦋|팔랑 나비|CF|0|s 🐦|짹짹 참새|CF|0|sd 🦓|줄무늬 얼룩말|CF|1|sd 🦢|우아한 백조|CF|1|ds 🐎|질주 경주마|CF|2|sc 🦚|화려한 공작|CF|2|dc 🐉|구름 용|CF|3|sdp 🐕|진돗개|CF|1|sa
🐤|삐약 병아리|RF|0|c 🦃|칠면조|RF|0|p 🐟|팔딱 물고기|RF|0|s 🐕‍🦺|든든 안내견|RF|1|da 🐺|은빛 늑대|RF|1|pa 🐻|불곰 강타자|RF|2|pa 🐈‍⬛|흑표범|RF|2|sa 🦁|황금 갈기 사자|RF|3|pac 🦌|순록|RF|1|sa`;
  const STARTER = `🐣|새싹 병아리|P|k 🐶|새싹 강아지|C|d 🐻|새싹 곰|1B|p 🐭|새싹 생쥐|2B|s 🐸|새싹 개구리|3B|d 🐰|새싹 토끼|SS|s 🐱|새싹 고양이|LF|c 🐴|새싹 망아지|CF|s 🐷|새싹 돼지|RF|p`;
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); };
  const cl = v => Math.max(25, Math.min(99, Math.round(v)));
  const PTM = {C: {d: 5, s: -9, a: 3}, "1B": {p: 6, s: -4, d: -3}, "2B": {d: 4, s: 3, p: -5}, SS: {d: 5, s: 4, p: -4, a: 2}, "3B": {p: 3, d: 2, a: 3}, LF: {p: 3, d: -2}, CF: {s: 6, d: 3, p: -3}, RF: {p: 2, a: 5}};
  /* ---------- ✨ 스킬·특성 (2026.11.27) ----------
     g: 1 아마추어 · 2 마이너 · 3 메이저 · 4 레전드(전설 카드만의 필살 특성)
     w(언제): 없음 = 늘 (능력치에 바로 더해져요) · s2 2스트라이크 · risp 2·3루에 주자 · lead 이닝 첫 타자 · last 마지막 회 · late 2회부터
     k(무엇): 능력치 이름, 또는 wp(딱! 칸 넓이) · eye(속지 않기) · gauge(투구 게이지 느리게) · bait(볼에 속이기) */
  const SK = {
    hit:   {e: "🎯", n: "정밀타격",   t: "b", k: "wp",  v: [.08, .14, .22, .32], d: v => `딱! 칸이 ${Math.round(v*100)}% 넓어져요`},
    pow:   {e: "💥", n: "거포 본능",  t: "b", k: "pow", v: [3, 5, 8, 12], d: v => `파워 +${v}`},
    clutch:{e: "🔥", n: "승부근성",   t: "b", k: "con", w: "s2", v: [6, 10, 14, 20], d: v => `2스트라이크에서 정확 +${v}`},
    big:   {e: "👑", n: "빅게임 헌터", t: "b", k: "pow,con", w: "risp", v: [4, 7, 10, 15], d: v => `득점권 주자가 있으면 파워·정확 +${v}`},
    eye:   {e: "👀", n: "선구안",     t: "b", k: "eye", v: [.15, .25, .35, .5], d: v => `볼·변화구에 ${Math.round(v*100)}% 덜 속아요`},
    run:   {e: "🏃", n: "질주 본능",  t: "b", k: "spd", v: [3, 5, 8, 12], d: v => `주루 +${v}`},
    lead:  {e: "⚡", n: "1번 타자",   t: "b", k: "con", w: "lead", v: [6, 10, 14, 20], d: v => `이닝 첫 타자일 때 정확 +${v}`},
    walk:  {e: "🌙", n: "끝내기 본능", t: "b", k: "pow", w: "last", v: [6, 10, 15, 22], d: v => `마지막 회에 파워 +${v}`},
    glove: {e: "🧤", n: "철벽 수비",  t: "b", k: "def", v: [3, 6, 9, 13], d: v => `수비 +${v}`},
    laser: {e: "🚀", n: "레이저 송구", t: "b", k: "arm", v: [4, 7, 10, 15], d: v => `어깨 +${v}`},
    heat:  {e: "⚡", n: "강속구",     t: "p", k: "vel", v: [2, 4, 6, 10], d: v => `구속 +${v}`},
    pin:   {e: "📍", n: "핀포인트",   t: "p", k: "ctl", v: [3, 5, 8, 12], d: v => `제구 +${v}`},
    magic: {e: "🌀", n: "마구",       t: "p", k: "brk", v: [3, 5, 8, 12], d: v => `변화 +${v}`},
    iron:  {e: "🔋", n: "철완",       t: "p", k: "sta", v: [5, 9, 14, 20], d: v => `체력 +${v}`},
    crisis:{e: "🧊", n: "위기관리",   t: "p", k: "ctl,brk", w: "risp", v: [5, 8, 12, 18], d: v => `득점권 주자가 있으면 제구·변화 +${v}`},
    kk:    {e: "💪", n: "탈삼진 머신", t: "p", k: "brk", w: "s2", v: [6, 10, 14, 20], d: v => `2스트라이크에서 변화 +${v}`},
    slow:  {e: "🐢", n: "슬로우 스타터", t: "p", k: "vel,ctl", w: "late", v: [3, 5, 8, 12], d: v => `2회부터 구속·제구 +${v}`},
    rhythm:{e: "🎶", n: "리듬 장인",  t: "p", k: "gauge", v: [.08, .14, .2, .28], d: v => `투구 게이지가 ${Math.round(v*100)}% 느려져요`},
    bait:  {e: "🎣", n: "유인구 장인", t: "p", k: "bait", v: [.05, .09, .13, .18], d: v => `볼에 타자가 더 잘 속아요 (+${Math.round(v*100)}%)`}
  };
  const GN = ["", "아마추어", "마이너", "메이저", "레전드"], GC = ["", "#adb5bd", "#4dabf7", "#b197fc", "#ffd43b"];
  const TAGSK = {p: ["pow", "big", "walk"], c: ["hit", "clutch", "eye", "lead"], s: ["run", "lead"], d: ["glove"], a: ["laser"], v: ["heat", "kk"], k: ["pin", "rhythm", "crisis"], b: ["magic", "bait", "kk"], t: ["iron", "slow"]};
  /* 🌟 전설 카드만의 레전드 특성 (이름이 따로 있어요) */
  const SIG = {"불꽃 용": ["heat", "🐉 드래곤 파이어볼"], "무지개 유니콘": ["magic", "🌈 무지개 마구"], "강속구 티라노": ["pin", "🦖 티라노 컨트롤"],
    "천둥 들소": ["laser", "⚡ 천둥 송구"], "백수의 왕 사자": ["big", "🦁 사자왕의 포효"], "손오공 원숭이": ["run", "☁️ 근두운 질주"], "번개 호랑이": ["glove", "⚡ 번개 다이빙"],
    "공룡 거인": ["pow", "🦕 공룡 홈런"], "대왕 고래": ["walk", "🐳 고래 끝내기"], "구름 용": ["hit", "🐉 용의 눈"], "황금 갈기 사자": ["clutch", "✨ 황금 갈기"]};
  function skillsOf(c, h){
    const out = [], used = new Set(), bat = c.pos !== "P";
    const pool = [...new Set([...c.tg].flatMap(t => TAGSK[t] || []).filter(k => (SK[k].t === "p") !== bat))];
    const all = Object.keys(SK).filter(k => (SK[k].t === "p") !== bat);
    const n = c.r < 0 ? 1 : [1, 2, 3, 3][c.r], g0 = c.r < 0 ? 1 : [1, 1, 2, 3][c.r];
    const sig = c.r === 3 && SIG[c.n];
    if (sig){ out.push({k: sig[0], g: 4, nm: sig[1]}); used.add(sig[0]); }
    for (let i = 0; out.length < n + (sig ? 1 : 0) && i < 40; i++){
      const A = pool.filter(k => !used.has(k)), L = A.length ? A : all.filter(k => !used.has(k)); if (!L.length) break;
      const k = L[(h >>> (i*3)) % L.length]; used.add(k); out.push({k, g: Math.max(1, Math.min(3, g0 - (out.length >= 1 && c.r === 1 ? 1 : 0) + (out.length === 0 && c.r === 1 ? 1 : 0)))});
    }
    return out;
  }
  const skv = s => SK[s.k].v[s.g - 1];
  function make(id, e, n, pos, r, tg){
    const base = r < 0 ? 46 : [54, 64, 75, 86][r], h = hash(id), nz = k => ((h >>> (k*4)) & 15)/15*6 - 3, has = c => tg.includes(c);
    const c = {id, e, n, pos, r, tg};
    if (pos === "P"){
      c.vel = cl(base + (has("v") ? 10 : -3) + nz(1)); c.ctl = cl(base + (has("k") ? 10 : -3) + nz(2)); c.brk = cl(base + (has("b") ? 10 : -3) + nz(3)); c.sta = cl(base + (has("t") ? 10 : -3) + nz(4));
      /* ⚾ (2026.11.27) 공 종류: 직구 + 카드마다 다른 변화구 (별이 많을수록 더 많이, 최대 6가지) */
      const L = ["fb"]; if (has("v")) { L.push("ts"); if (r >= 2) L.push("rf"); }
      const br = ["cu", "sl", "fk", "ct", "si", "spl", "sw", "sc"], k0 = h % 8, nb = 1 + (has("b") ? 2 : 0) + (r >= 1 ? 1 : 0) + (r >= 3 ? 1 : 0);
      for (let i = 0; i < nb; i++) L.push(br[(k0 + i*3) % 8]);
      if (has("k")) L.push("ch"); if (r >= 3 && h % 5 === 0) L.splice(1, 0, "kn"); if (r >= 2 && h % 7 === 0) L.push("ep");
      c.pit = [...new Set(L)].slice(0, 6);
    } else {
      const m = PTM[pos] || {};
      c.pow = cl(base + (has("p") ? 10 : -3) + (m.p || 0) + nz(1)); c.con = cl(base + (has("c") ? 10 : -3) + nz(2)); c.spd = cl(base + (has("s") ? 10 : -3) + (m.s || 0) + nz(3));
      c.def = cl(base + (has("d") ? 10 : -3) + (m.d || 0) + nz(4)); c.arm = cl(base + (has("a") ? 9 : -2) + (m.a || 0) + nz(5));
      c.hand = (h >> 7) % 4 === 0 ? "L" : "R";
    }
    c.sk = skillsOf(c, h);
    return c;
  }
  const SPL = /\s+(?=\S+\|[^|]+\|(?:P|C|1B|2B|3B|SS|LF|CF|RF)\|)/, ALL = [], BY = {};
  RAW.trim().split(SPL).forEach((t, i) => { const [e, n, pos, r, tg] = t.split("|"); const id = "a" + i; const c = make(id, e, n, pos, +r, tg || ""); ALL.push(c); BY[id] = c; });
  const ST = {}; STARTER.trim().split(SPL).forEach(t => { const [e, n, pos, tg] = t.split("|"); const id = "s" + pos; const c = make(id, e, n, pos, -1, tg || ""); ST[pos] = c; BY[id] = c; });
  /* 강화된 능력치 */
  function stat(c, lv = 0){ const b = lv*2, o = Object.assign({}, c, {lv});
    ["vel", "ctl", "brk", "sta", "pow", "con", "spd", "def", "arm"].forEach(k => { if (c[k] != null) o[k] = Math.min(99, c[k] + b); });
    /* ✨ 강화 +3부터 스킬 등급 한 칸 위 (레전드는 그대로) · 늘 켜진 스킬은 능력치에 더해요 */
    o.sk = (c.sk || []).map(s => ({k: s.k, g: s.g < 4 && lv >= 3 ? Math.min(3, s.g + 1) : s.g, nm: s.nm}));
    o.base = {}; ["vel", "ctl", "brk", "sta", "pow", "con", "spd", "def", "arm"].forEach(k => { if (o[k] != null) o.base[k] = o[k]; });
    o.sk.forEach(s => { const d = SK[s.k]; if (d.w) return; d.k.split(",").forEach(k => { if (o[k] != null) o[k] = Math.min(99, o[k] + skv(s)); }); });
    o.ovr = ovr(o); return o; }
  function ovr(c){ return c.pos === "P" ? Math.round(c.vel*.32 + c.ctl*.3 + c.brk*.28 + c.sta*.1) : Math.round(c.pow*.3 + c.con*.3 + c.spd*.15 + c.def*.17 + c.arm*.08); }
  [...ALL, ...Object.values(ST)].forEach(c => { c.ovr = stat(c, 0).ovr; });
  const canPlay = (c, pos) => c.pos === pos || (GRP[c.pos] === GRP[pos] && pos !== "P");

  /* ---------- 지갑 ---------- */
  function of(sid){ const q = (typeof walletOf === "function" ? walletOf(sid).abb : null) || {}; return {c: Object.assign({}, q.c || {}), l: Object.assign({}, q.l || {}), n: q.n || 0}; }
  const lvOf = (q, id) => Math.max(0, Math.min(5, (q.c[id] || 0) - 1));
  /* 경기에 나가는 팀 (모자란 자리는 새싹 선수) */
  function team(q){
    q = q || {c: {}, l: {}}; const used = new Set(), L = {};
    POS.forEach(p => { const id = q.l && q.l[p]; const c = id && BY[id]; if (c && (q.c[id] || 0) > 0 && canPlay(c, p) && !used.has(id)){ L[p] = id; used.add(id); } else L[p] = ST[p].id; });
    return L;
  }
  function teamCards(L, q){
    const out = {}; POS.forEach(p => { const c = BY[L[p]] || ST[p], lv = q && q.c ? lvOf(q, c.id) : 0, s = stat(c, c.r < 0 ? 0 : lv); if (c.pos !== p) s.def = Math.max(25, s.def - 8); s.at = p; out[p] = s; }); return out;
  }
  /* 타순: 1번 정확·빠름, 3~5번 힘 */
  function order(T){
    const B = POS.filter(p => p !== "P").map(p => T[p]); const sc = (c, k) => k === "pow" ? c.pow : c.con*.6 + c.spd*.4;
    const L = [], left = B.slice(); const take = k => { left.sort((a, b) => sc(b, k) - sc(a, k)); return left.shift(); };
    const lead = take("con"), two = take("con"), A = take("pow"), Bc = take("pow"), Cc = take("pow");
    L.push(lead, two, A, Bc, Cc); left.sort((a, b) => b.ovr - a.ovr); L.push(...left); return L;
  }
  const power = T => Math.round(POS.reduce((a, p) => a + T[p].ovr*(p === "P" ? 2 : 1), 0)/10);
  /* 🤖 컴퓨터 팀 (단계가 높을수록 별이 많아요) */
  function cpuTeam(lv, seed){
    let h = hash("cpu" + seed + lv); const rnd = () => (h = (Math.imul(h ^ (h >>> 15), 2246822507) + 0x9e3779b9) >>> 0)/4294967296;
    const L = {}, q = {c: {}, l: L}; const rar = () => { const x = rnd(); return lv === 0 ? (x < .8 ? 0 : 1) : lv === 1 ? (x < .45 ? 0 : x < .9 ? 1 : 2) : (x < .15 ? 1 : x < .75 ? 2 : 3); };
    POS.forEach(p => { const r = rar(), P = ALL.filter(c => c.pos === p && c.r === r); const c = P[Math.floor(rnd()*P.length)] || ST[p]; L[p] = c.id; q.c[c.id] = lv === 2 ? 3 : 1; });
    return q;
  }

  /* ---------- 🎁 뽑기 ---------- */
  const PACKS = [{k: "all", e: "🎁", n: "선수 팩", d: "모든 자리 선수가 나와요"}, {k: "pit", e: "⚾", n: "투수 팩", d: "투수만 나와요"}, {k: "bat", e: "🏏", n: "타자 팩", d: "투수 빼고 나와요"}];
  const COST1 = 60, COST10 = 540, PROB = [.6, .28, .1, .02];
  function roll(pack, sure){
    let x = Math.random(), r = 0; for (let acc = 0; r < 4; r++){ acc += PROB[r]; if (x < acc) break; } r = Math.min(3, r); if (sure && r < 1) r = 1;
    const P = ALL.filter(c => c.r === r && (pack === "all" || (pack === "pit" ? c.pos === "P" : c.pos !== "P")));
    return P[Math.floor(Math.random()*P.length)];
  }
  async function pull(sid, pack, n){
    const cost = n === 10 ? COST10 : COST1*n, got = [];
    for (let i = 0; i < n; i++) got.push(roll(pack, n === 10 && i === 9 && !got.some(c => c.r >= 1)).id);
    let res = null;
    await Store.kidTx(sid, w => {
      if ((w.coins || 0) < cost) throw new Error(`코인이 ${(cost - (w.coins || 0)).toLocaleString()}개 모자라요`);
      const q = JSON.parse(JSON.stringify(w.abb || {})); q.c = q.c || {}; q.l = q.l || {}; q.n = (q.n || 0) + n;
      res = got.map(id => { const before = q.c[id] || 0; q.c[id] = before + 1; return {id, isNew: !before, lv: Math.min(5, before)}; });
      // 처음 뽑은 카드는 비어 있는 자리에 바로 넣어요
      got.forEach(id => { const c = BY[id]; if (!q.l[c.pos] && !Object.values(q.l).includes(id)) q.l[c.pos] = id; });
      w.coins -= cost; w.abb = q; return w; });
    return res;
  }
  async function setPos(sid, pos, id){
    await Store.kidTx(sid, w => { const q = JSON.parse(JSON.stringify(w.abb || {})); q.c = q.c || {}; q.l = q.l || {};
      if (id && (!(q.c[id] > 0) || !canPlay(BY[id], pos))) throw new Error("이 자리에 넣을 수 없어요");
      Object.keys(q.l).forEach(p => { if (q.l[p] === id && p !== pos) delete q.l[p]; });
      if (id) q.l[pos] = id; else delete q.l[pos]; w.abb = q; return w; });
  }
  async function auto(sid){
    await Store.kidTx(sid, w => { const q = JSON.parse(JSON.stringify(w.abb || {})); q.c = q.c || {}; const L = {}, used = new Set();
      const mine = Object.keys(q.c).filter(id => BY[id] && q.c[id] > 0).map(id => stat(BY[id], lvOf(q, id)));
      // 꼭 맞는 자리부터, 별·능력이 높은 선수 먼저
      [true, false].forEach(exact => POS.forEach(p => { if (L[p]) return; const C = mine.filter(c => !used.has(c.id) && (exact ? c.pos === p : canPlay(c, p))).sort((a, b) => b.ovr - a.ovr);
        if (C.length && C[0].ovr > ST[p].ovr - (exact ? 0 : -8)){ L[p] = C[0].id; used.add(C[0].id); } }));
      q.l = L; w.abb = q; return w; });
  }

  /* ---------- 🃏 카드 그림 (HTML) ---------- */
  /* 🖼️ 3D 카드 그림: 선수를 3D로 한 번 찍어 두고 써요 (몇 장씩 천천히 만들어 바꿔 끼워요) */
  const PURL = {}, PICQ = new Set(); let picT = 0;
  function picHTML(c, big){
    const B = window.BB3D; if (!B || NG.no3d || B.st < 0) return `<span class="abc-e">${c.e}</span>`;
    if (B.st === 0) B.load(() => picWork());
    const u = PURL[c.id]; if (u) return `<img class="abc-img" src="${u}" alt="">`;
    PICQ.add(c.id); if (B.ready()) picSoon(); return `<span class="abc-e" data-pic="${c.id}">${c.e}</span>`; }
  function picSoon(){ if (!picT) picT = setTimeout(picWork, 40); }
  function picWork(){ picT = 0; const B = window.BB3D; if (!B || !B.ready()) return; let n = 0;
    for (const id of PICQ){ PICQ.delete(id); try { const cv = B.portrait(BY[id], 0x4c6ef5, 200); if (cv){ PURL[id] = cv.toDataURL();
      document.querySelectorAll(`[data-pic="${id}"]`).forEach(el => { const im = new Image(); im.className = "abc-img"; im.alt = ""; im.src = PURL[id]; el.replaceWith(im); }); } } catch(e){ console.warn(e); }
      if (++n >= 3) break; }
    if (PICQ.size) picSoon(); }
  const skChip = s => { const d = SK[s.k]; return `<span class="abc-sk g${s.g}" title="${esc((s.nm || d.n) + " · " + GN[s.g])}">${d.e}</span>`; };
  function cardHTML(c, o = {}){
    const R = c.r < 0 ? {n: "새싹", s: "🌱", c: "#8ce99a", g: "#2b8a3e"} : RAR[c.r], s = o.lv != null ? stat(c, o.lv) : c;
    const bars = c.pos === "P" ? [["구속", s.vel], ["제구", s.ctl], ["변화", s.brk], ["체력", s.sta]] : [["파워", s.pow], ["정확", s.con], ["주루", s.spd], ["수비", s.def]];
    return `<div class="abc r${c.r}${o.cls ? " " + o.cls : ""}" style="--rc:${R.c};--rg:${R.g}"${o.data || ""}>
      <div class="abc-top"><span class="abc-pos">${PS[c.pos]}</span><span class="abc-ovr">${s.ovr}</span></div>
      <div class="abc-em">${picHTML(c)}</div><div class="abc-sks">${(s.sk || []).map(skChip).join("")}</div><div class="abc-nm">${esc(c.n)}${o.lv ? `<b>+${o.lv}</b>` : ""}</div>
      <div class="abc-rr">${R.s} ${R.n}${c.pos !== "P" ? ` · ${c.hand === "L" ? "좌타" : "우타"}` : ""}</div>
      <div class="abc-st">${bars.map(([k, v]) => `<i><u>${k}</u><s style="width:${v}%"></s><em>${v}</em></i>`).join("")}</div>
      ${c.pos === "P" ? `<div class="abc-pit">${c.pit.map(p => PT[p].e + PT[p].n).join(" · ")}</div>` : ""}
      ${o.cnt > 1 ? `<span class="abc-cnt">×${o.cnt}</span>` : ""}${o.isNew ? `<span class="abc-new">NEW</span>` : ""}${o.nodet ? "" : `<button class="abc-i" data-det="${c.id}:${o.lv || 0}" title="자세히 보기">🔍</button>`}</div>`;
  }

  /* ---------- 🛒 카드 창 (뽑기 · 내 팀 · 도감) ---------- */
  const UI = {
    tab: "gacha", busy: false, pick: null, flt: "all",
    open(sid, tab){ this.sid = sid || sidOf(ARC.me); this.tab = tab || this.tab; this.css();
      let el = $("#abShop"); if (!el){ el = document.createElement("div"); el.id = "abShop"; document.body.appendChild(el);
        ["keydown", "keyup"].forEach(ev => el.addEventListener(ev, e => e.stopPropagation())); el.onclick = e => this.click(e); }
      el.hidden = false; this.res = null; this.pick = null; this.det = null; this.paint();
      if (window.BB3D && !NG.no3d && !BB3D.ready()) BB3D.load(() => { if (!el.hidden) this.paint(); }); },
    close(){ const el = $("#abShop"); if (el) el.hidden = true; if (this.onClose){ const f = this.onClose; this.onClose = null; f(); } },
    paint(){
      const el = $("#abShop"); if (!el || el.hidden) return; const w = walletOf(this.sid), q = of(this.sid), T = teamCards(team(q), q);
      const own = Object.keys(q.c).filter(id => BY[id] && q.c[id] > 0), tabs = [["gacha", "🎁 카드 뽑기"], ["team", "📋 내 팀"], ["book", `🗂️ 도감 ${own.length}/${ALL.length}`]];
      let body = "";
      if (this.tab === "gacha"){
        body = `<div class="ab-packs">${PACKS.map(p => `<div class="ab-pack"><div class="ab-pe">${p.e}</div><b>${p.n}</b><small>${p.d}</small>
          <button class="ab-buy" data-pull="${p.k}:1" ${(w.coins || 0) < COST1 || this.busy ? "disabled" : ""}>1장 · 🪙 ${COST1}</button>
          <button class="ab-buy p" data-pull="${p.k}:10" ${(w.coins || 0) < COST10 || this.busy ? "disabled" : ""}>10장 · 🪙 ${COST10}<small>⭐⭐ 이상 1장 꼭!</small></button></div>`).join("")}</div>
          <p class="ab-prob">나올 확률 · ⭐ 일반 60% · ⭐⭐ 희귀 28% · ⭐⭐⭐ 영웅 10% · ⭐⭐⭐⭐ 전설 2% &nbsp;|&nbsp; 같은 카드가 또 나오면 <b>강화 +1</b> (최대 +5, 능력 쑥쑥)</p>
          ${this.res ? `<div class="ab-res"><h3>🎉 새로 받은 카드</h3><div class="ab-grid">${this.res.map((x, i) => cardHTML(BY[x.id], {lv: x.lv, isNew: x.isNew, cls: "flip", data: ` style="animation-delay:${i*.12}s;--rc:${(BY[x.id].r < 0 ? "#8ce99a" : RAR[BY[x.id].r].c)};--rg:${RAR[BY[x.id].r].g}"`})).join("")}</div>
            <div class="ab-row"><button class="ab-btn" data-tab="team">📋 내 팀에 넣으러 가기</button><button class="ab-btn" data-res-x>확인</button></div></div>` : ""}`;
      } else if (this.tab === "team"){
        const O = order(T);
        body = `<div class="ab-team"><div class="ab-field">${POS.map(p => { const c = T[p]; return `<button class="ab-slot s-${p}${this.pick === p ? " on" : ""}" data-slot="${p}" style="--rc:${c.r < 0 ? "#8ce99a" : RAR[c.r].c}"><span>${c.e}</span><b>${PS[p]} · ${c.ovr}</b><small>${esc(c.n)}${c.lv ? ` +${c.lv}` : ""}</small></button>`; }).join("")}</div>
          <div class="ab-side"><div class="ab-pow">💪 팀 전력 <b>${power(T)}</b></div><button class="ab-btn p" data-auto>⚡ 가장 센 팀으로 자동 편성</button>
            <div class="ab-ord"><h4>🏏 타순</h4>${O.map((c, i) => `<div><b>${i + 1}</b>${c.e} ${esc(c.n)} <small>${PS[c.at]}</small></div>`).join("")}<div><b>⚾</b>${T.P.e} ${esc(T.P.n)} <small>선발 투수</small></div></div></div></div>
          ${this.pick ? this.pickList(q) : `<p class="ab-prob">👆 바꾸고 싶은 자리를 눌러요 · 같은 무리(1루↔3루, 2루↔유격, 외야끼리)는 서로 바꿔 서도 돼요</p>`}`;
      } else {
        const L = ALL.filter(c => this.flt === "all" || c.pos === this.flt);
        body = `<div class="ab-flt">${[["all", "전체"], ...POS.map(p => [p, PN[p]])].map(([k, t]) => `<button data-flt="${k}" class="${this.flt === k ? "on" : ""}">${t}</button>`).join("")}</div>
          <div class="ab-grid book">${L.map(c => (q.c[c.id] || 0) > 0 ? cardHTML(c, {lv: lvOf(q, c.id), cnt: q.c[c.id]}) : `<div class="abc lock r${c.r}" style="--rc:${RAR[c.r].c};--rg:${RAR[c.r].g}"><div class="abc-top"><span class="abc-pos">${PS[c.pos]}</span></div><div class="abc-em">❔</div><div class="abc-nm">???</div><div class="abc-rr">${RAR[c.r].s} ${RAR[c.r].n}</div></div>`).join("")}</div>`;
      }
      el.innerHTML = `<div class="ab-box"><div class="ab-hd"><h2>⚾ 동물 프로야구 <small>${esc(who(noOf_(this.sid)))}</small></h2><span class="ab-coin">🪙 ${(w.coins || 0).toLocaleString()}</span><button class="ab-x" data-x>✕</button></div>
        <div class="ab-tabs">${tabs.map(([k, t]) => `<button data-tab="${k}" class="${this.tab === k ? "on" : ""}">${t}</button>`).join("")}</div>
        <div class="ab-body">${body}</div>${this.msg ? `<div class="ab-msg">${this.msg}</div>` : ""}</div>${this.det ? this.detHTML() : ""}`;
    },
    /* 🔍 선수 자세히: 3D 그림 · 능력치 (기본 + 스킬) · 공 종류 · 스킬 */
    detHTML(){ const [id, lv] = this.det, c0 = BY[id]; if (!c0) return ""; const c = stat(c0, +lv || 0), R = c0.r < 0 ? {n: "새싹", s: "🌱", c: "#8ce99a", g: "#2b8a3e"} : RAR[c0.r];
      const ST_ = c.pos === "P" ? [["vel", "⚡ 구속", "공이 빨라요"], ["ctl", "🎯 제구", "던지고 싶은 곳에 잘 들어가요 · 게이지 칸이 넓어요"], ["brk", "🌀 변화", "변화구가 크게 휘어요"], ["sta", "🔋 체력", "공을 많이 던져도 덜 지쳐요"]]
        : [["pow", "💪 파워", "멀리 날려요 (홈런)"], ["con", "🎯 정확", "공을 잘 맞혀요 · 딱! 칸이 넓어요"], ["spd", "👟 주루", "빨리 달려요"], ["def", "🧤 수비", "공을 잘 잡아요"], ["arm", "🚀 어깨", "멀리·세게 던져요"]];
      const big = (window.BB3D && BB3D.ready() && BB3D.portrait(c0, 0x4c6ef5, 320)) ? `<img src="${BB3D.portrait(c0, 0x4c6ef5, 320).toDataURL()}" alt="">` : `<span>${c0.e}</span>`;
      return `<div class="ab-det" data-detx><div class="ab-dbox" style="--rc:${R.c};--rg:${R.g}">
        <button class="ab-x" data-detx>✕</button>
        <div class="ab-dl"><div class="ab-dpic">${big}</div><div class="ab-dovr"><b>${c.ovr}</b><small>종합</small></div>
          <h3>${esc(c0.n)}${c.lv ? ` <em>+${c.lv}</em>` : ""}</h3><div class="ab-dr">${R.s} ${R.n} · ${PN[c0.pos]}${c0.pos !== "P" ? ` · ${c0.hand === "L" ? "왼손 타자" : "오른손 타자"}` : ""}</div></div>
        <div class="ab-dr2"><h4>📊 능력치 <small>회색 = 기본 · 초록 = 스킬로 더해진 만큼</small></h4>
          ${ST_.map(([k, n, d]) => { const b = c.base[k], v = c[k], plus = v - b; return `<div class="ab-st"><b>${n}</b><div class="ab-bar"><s style="width:${b}%"></s>${plus > 0 ? `<i style="left:${b}%;width:${plus}%"></i>` : ""}</div><em>${v}${plus > 0 ? `<small>+${plus}</small>` : ""}</em><p>${d}</p></div>`; }).join("")}
          ${c.pos === "P" ? `<h4>⚾ 던질 수 있는 공 <small>${c.pit.length}가지</small></h4><div class="ab-pits">${c.pit.map(p => `<span>${PT[p].e} ${PT[p].n}</span>`).join("")}</div>` : ""}
          <h4>✨ 스킬 · 특성 <small>강화 +3부터 등급이 한 칸 올라가요</small></h4>
          ${(c.sk || []).map(s => { const d = SK[s.k]; return `<div class="ab-skd g${s.g}"><span class="ab-ske">${d.e}</span><div><b>${esc(s.nm || d.n)}</b> <i class="g${s.g}">${GN[s.g]}</i><p>${d.d(skv(s))}${d.w ? " · 🔔 그때만 켜져요" : " · 늘 켜져 있어요"}</p></div></div>`; }).join("") || "<p>스킬이 없어요</p>"}
        </div></div></div>`; },
    pickList(q){ const p = this.pick, cur = team(q)[p];
      const L = Object.keys(q.c).filter(id => BY[id] && q.c[id] > 0 && canPlay(BY[id], p)).map(id => BY[id]).sort((a, b) => (b.pos === p) - (a.pos === p) || stat(b, lvOf(q, b.id)).ovr - stat(a, lvOf(q, a.id)).ovr);
      return `<div class="ab-pick"><h4>${PN[p]} 자리에 넣을 선수 <small>${L.length ? "카드를 눌러요" : "아직 이 자리 카드가 없어요 · 🎁 뽑기에서 모아요!"}</small></h4>
        <div class="ab-grid">${cardHTML(ST[p], {cls: cur === ST[p].id ? "cur" : "", data: ` data-put="${p}:"`})}${L.map(c => cardHTML(c, {lv: lvOf(q, c.id), cnt: q.c[c.id], cls: (cur === c.id ? "cur" : "") + (c.pos !== p ? " off" : ""), data: ` data-put="${p}:${c.id}"`})).join("")}</div></div>`; },
    async click(e){
      const t = e.target;
      const dt = t.closest("[data-det]"); if (dt){ e.stopPropagation(); this.det = dt.dataset.det.split(":"); return this.paint(); }
      if (this.det && (t.closest("[data-detx]") && (t.classList.contains("ab-det") || t.closest("button[data-detx]")))){ this.det = null; return this.paint(); }
      if (this.det && t.closest(".ab-dbox")) return;
      if (t.id === "abShop" || t.closest("[data-x]")) return this.close();
      const tb = t.closest("[data-tab]"); if (tb){ this.tab = tb.dataset.tab; this.res = null; this.pick = null; this.msg = ""; return this.paint(); }
      if (t.closest("[data-res-x]")){ this.res = null; return this.paint(); }
      const fl = t.closest("[data-flt]"); if (fl){ this.flt = fl.dataset.flt; return this.paint(); }
      const sl = t.closest("[data-slot]"); if (sl){ this.pick = this.pick === sl.dataset.slot ? null : sl.dataset.slot; return this.paint(); }
      if (this.busy) return;
      const run = async (f, ok) => { this.busy = true; this.msg = "⏳ 잠깐만요…"; this.paint(); try { const r = await f(); this.msg = ok ? ok(r) : ""; } catch(er){ this.msg = "⚠️ " + (er.message || er); } this.busy = false; this.paint(); };
      const pl = t.closest("[data-pull]"); if (pl){ const [k, n] = pl.dataset.pull.split(":");
        return run(async () => { const r = await pull(this.sid, k, +n); this.res = r; const best = Math.max(...r.map(x => BY[x.id].r)); this.fanfare(best); return r; }, r => { const b = Math.max(...r.map(x => BY[x.id].r)); return b >= 3 ? "🌈 우와! ⭐⭐⭐⭐ 전설 카드!!" : b >= 2 ? "✨ ⭐⭐⭐ 영웅 카드가 나왔어요!" : "🎉 카드를 받았어요!"; }); }
      const pu = t.closest("[data-put]"); if (pu){ const [p, id] = pu.dataset.put.split(":"); return run(() => setPos(this.sid, p, id || null).then(() => { this.pick = null; }), () => "✅ 바꿨어요!"); }
      if (t.closest("[data-auto]")) return run(() => auto(this.sid), () => "⚡ 가장 센 팀으로 짰어요!");
    },
    fanfare(r){ try { if (r >= 3){ [523, 659, 784, 1046, 1318, 1568, 2093].forEach((f, k) => tone(f, f, .16, "triangle", .12, k*.08)); } else if (r >= 2) [659, 880, 1175, 1568].forEach((f, k) => tone(f, f, .12, "triangle", .11, k*.07)); else tone(880, 1320, .12, "triangle", .1); } catch(e){} },
    css(){ if ($("#abCss")) return; const s = document.createElement("style"); s.id = "abCss"; s.textContent = `
#abShop{position:fixed;inset:0;z-index:9000;background:rgba(8,6,24,.78);display:flex;align-items:center;justify-content:center;padding:12px;font-family:"Gowun Dodum",sans-serif}
#abShop[hidden]{display:none}
.ab-box{width:min(1100px,100%);max-height:100%;overflow:auto;background:linear-gradient(160deg,#1b2a4a,#0d1426);border:2px solid #3b5bdb;border-radius:22px;padding:16px 18px;color:#fff;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.ab-hd{display:flex;align-items:center;gap:12px}.ab-hd h2{margin:0;font:28px "Jua",sans-serif;flex:1}.ab-hd h2 small{font:15px "Gowun Dodum";color:#a5d8ff;margin-left:8px}
.ab-coin{font:22px "Jua";background:rgba(255,212,59,.15);border:1px solid #ffd43b;border-radius:99px;padding:4px 14px;color:#ffe066}
.ab-x{font:22px "Jua";background:none;border:0;color:#fff;cursor:pointer;padding:4px 10px}
.ab-tabs{display:flex;gap:6px;margin:12px 0}.ab-tabs button,.ab-flt button{font:18px "Jua";border:0;border-radius:12px;padding:8px 16px;background:rgba(255,255,255,.08);color:#dbe4ff;cursor:pointer}
.ab-tabs button.on,.ab-flt button.on{background:#4c6ef5;color:#fff}
.ab-packs{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.ab-pack{background:linear-gradient(160deg,#283d6b,#172446);border-radius:18px;padding:14px;text-align:center;display:flex;flex-direction:column;gap:8px;border:1px solid rgba(116,143,252,.4)}
.ab-pe{font-size:54px;line-height:1;filter:drop-shadow(0 4px 10px rgba(0,0,0,.4))}.ab-pack b{font:22px "Jua"}.ab-pack>small{color:#a5b4fc}
.ab-buy,.ab-btn{font:19px "Jua";border:0;border-radius:14px;padding:10px;cursor:pointer;background:#364fc7;color:#fff}.ab-buy.p,.ab-btn.p{background:linear-gradient(135deg,#f59f00,#e8590c)}
.ab-buy small{display:block;font:13px "Gowun Dodum";opacity:.9}.ab-buy:disabled{opacity:.4;cursor:default}
.ab-prob{font-size:14px;color:#a5b4fc;margin:12px 2px}.ab-msg{margin-top:10px;font:18px "Jua";color:#ffe066;text-align:center}
.ab-res{margin-top:10px;background:rgba(255,255,255,.05);border-radius:18px;padding:12px}.ab-res h3{margin:0 0 8px;font:22px "Jua"}
.ab-row{display:flex;gap:8px;justify-content:center;margin-top:10px}
.ab-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:10px}.ab-grid.book{grid-template-columns:repeat(auto-fill,minmax(130px,1fr))}
.abc{position:relative;border-radius:14px;padding:8px 9px 9px;background:linear-gradient(160deg,var(--rg),#101830 75%);border:2px solid var(--rc);box-shadow:0 0 0 1px rgba(0,0,0,.4),0 6px 16px rgba(0,0,0,.35);cursor:pointer;overflow:hidden}
.abc.r3{box-shadow:0 0 18px rgba(255,212,59,.55);background:linear-gradient(160deg,#c77d00,#3b1f00 70%)}.abc.r3::after{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.35) 45%,transparent 60%);animation:abShine 2.6s infinite}
.abc.r2{box-shadow:0 0 12px rgba(177,151,252,.45)}
@keyframes abShine{0%{transform:translateX(-100%)}60%,100%{transform:translateX(100%)}}
.abc-top{display:flex;justify-content:space-between;font:15px "Jua"}.abc-pos{background:rgba(0,0,0,.35);border-radius:8px;padding:1px 7px}.abc-ovr{font:22px "Jua";color:var(--rc);text-shadow:0 1px 2px #000}
.abc-em{font-size:52px;text-align:center;line-height:1.15;margin:2px 0;filter:drop-shadow(0 4px 6px rgba(0,0,0,.45))}
.abc-nm{font:17px "Jua";text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.abc-nm b{color:#69db7c;margin-left:4px}
.abc-rr{font-size:12px;text-align:center;color:var(--rc);margin-bottom:5px}
.abc-st i{display:grid;grid-template-columns:30px 1fr 22px;align-items:center;gap:4px;font-style:normal;font-size:11px;margin:2px 0}.abc-st u{text-decoration:none;color:#ced4da}
.abc-st s{display:block;height:6px;border-radius:4px;background:linear-gradient(90deg,var(--rc),#fff)}.abc-st em{font-style:normal;text-align:right;font-weight:bold}
.abc-pit{font-size:10.5px;color:#ffe8cc;text-align:center;margin-top:4px}
.abc-cnt{position:absolute;right:6px;bottom:4px;font:13px "Jua";color:#ffe066}.abc-new{position:absolute;left:6px;bottom:5px;background:#fa5252;font:12px "Jua";padding:1px 8px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,.4)}
.abc.lock{filter:grayscale(.8) brightness(.6);cursor:default}
.abc-e{display:block}.abc-img{display:block;width:84px;height:84px;margin:-6px auto -4px;object-fit:contain;filter:drop-shadow(0 5px 6px rgba(0,0,0,.5))}
.abc-sks{display:flex;justify-content:center;gap:3px;min-height:22px;margin:1px 0 2px}.abc-sk{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:13px;background:rgba(0,0,0,.45);border:2px solid #adb5bd}
.abc-sk.g2,.ab-skd.g2 .ab-ske{border-color:#4dabf7}.abc-sk.g3,.ab-skd.g3 .ab-ske{border-color:#b197fc;box-shadow:0 0 6px #b197fc}.abc-sk.g4,.ab-skd.g4 .ab-ske{border-color:#ffd43b;box-shadow:0 0 8px #ffd43b}
.abc-i{position:absolute;right:4px;top:30px;width:28px;height:28px;border-radius:50%;border:0;background:rgba(0,0,0,.45);cursor:pointer;font-size:14px;padding:0}
.ab-det{position:fixed;inset:0;z-index:9100;background:rgba(5,4,18,.72);display:flex;align-items:center;justify-content:center;padding:12px}
.ab-dbox{position:relative;width:min(860px,100%);max-height:100%;overflow:auto;display:grid;grid-template-columns:300px 1fr;gap:18px;background:linear-gradient(160deg,var(--rg),#0d1426 60%);border:3px solid var(--rc);border-radius:24px;padding:18px;box-shadow:0 0 40px rgba(0,0,0,.6)}
.ab-dbox>.ab-x{position:absolute;right:8px;top:6px}
.ab-dl{text-align:center;position:relative}.ab-dpic{border-radius:18px;background:radial-gradient(circle at 50% 40%,rgba(255,255,255,.18),transparent 70%)}.ab-dpic img{width:100%;max-width:280px;display:block;margin:auto}.ab-dpic span{font-size:140px;line-height:1.6}
.ab-dovr{position:absolute;left:4px;top:4px;background:rgba(0,0,0,.5);border:2px solid var(--rc);border-radius:14px;padding:4px 10px;line-height:1}.ab-dovr b{font:34px "Jua";color:var(--rc);display:block}.ab-dovr small{font-size:12px}
.ab-dl h3{font:28px "Jua";margin:6px 0 2px}.ab-dl h3 em{color:#69db7c;font-style:normal}.ab-dr{color:var(--rc);font-size:15px}
.ab-dr2 h4{font:19px "Jua";margin:10px 0 6px}.ab-dr2 h4 small{font:13px "Gowun Dodum";color:#a5b4fc;margin-left:6px}
.ab-st{display:grid;grid-template-columns:78px 1fr 58px;align-items:center;gap:8px;margin:3px 0}.ab-st b{font:16px "Jua"}.ab-st p{grid-column:2/4;margin:-3px 0 4px;font-size:12px;color:#a5b4fc}
.ab-bar{position:relative;height:12px;border-radius:6px;background:rgba(255,255,255,.1);overflow:hidden}.ab-bar s{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#868e96,#dee2e6)}.ab-bar i{position:absolute;top:0;bottom:0;background:#51cf66}
.ab-st em{font:20px "Jua";font-style:normal;text-align:right}.ab-st em small{font-size:13px;color:#69db7c;margin-left:2px}
.ab-pits{display:flex;flex-wrap:wrap;gap:6px}.ab-pits span{background:rgba(255,255,255,.08);border-radius:10px;padding:4px 10px;font:15px "Jua"}
.ab-skd{display:flex;gap:10px;align-items:flex-start;background:rgba(255,255,255,.05);border-radius:14px;padding:8px 10px;margin:6px 0}.ab-ske{flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-size:22px;border:3px solid #adb5bd;background:rgba(0,0,0,.35)}
.ab-skd b{font:18px "Jua"}.ab-skd i{font:12px "Jua";font-style:normal;padding:1px 8px;border-radius:8px;background:#495057;margin-left:4px}.ab-skd i.g2{background:#1971c2}.ab-skd i.g3{background:#7048e8}.ab-skd i.g4{background:linear-gradient(90deg,#f59f00,#fab005);color:#2b1a00}
.ab-skd p{margin:2px 0 0;font-size:14px;color:#dbe4ff}
@media (max-width:760px){.ab-dbox{grid-template-columns:1fr}.ab-dpic img{max-width:200px}}.abc.cur{outline:4px solid #69db7c}.abc.off{opacity:.85}
.abc.flip{animation:abFlip .55s both}@keyframes abFlip{0%{transform:rotateY(90deg) scale(.6);opacity:0}100%{transform:none;opacity:1}}
.ab-team{display:grid;grid-template-columns:1.6fr 1fr;gap:14px}
.ab-field{position:relative;aspect-ratio:1.25;border-radius:18px;background:radial-gradient(circle at 50% 92%,#c98b52 0 18%,transparent 18.5%),radial-gradient(circle at 50% 62%,#c98b52 0 27%,transparent 27.5%),linear-gradient(180deg,#2f9e44,#237a35)}
.ab-slot{position:absolute;transform:translate(-50%,-50%);width:118px;border:2px solid var(--rc);border-radius:14px;background:rgba(10,16,36,.82);color:#fff;padding:4px 4px 5px;cursor:pointer;text-align:center}
.ab-slot span{font-size:34px;display:block;line-height:1.1}.ab-slot b{font:14px "Jua";display:block}.ab-slot small{font-size:11px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ab-slot.on{outline:4px solid #ffd43b}
.s-P{left:50%;top:60%}.s-C{left:50%;top:91%}.s-1B{left:78%;top:58%}.s-2B{left:64%;top:36%}.s-SS{left:36%;top:36%}.s-3B{left:22%;top:58%}.s-LF{left:15%;top:16%}.s-CF{left:50%;top:10%}.s-RF{left:85%;top:16%}
.ab-side{display:flex;flex-direction:column;gap:10px}.ab-pow{font:20px "Jua";background:rgba(255,255,255,.06);border-radius:14px;padding:10px 14px}.ab-pow b{font-size:30px;color:#ffe066;margin-left:6px}
.ab-ord{background:rgba(255,255,255,.05);border-radius:14px;padding:8px 12px}.ab-ord h4{margin:0 0 4px;font:18px "Jua"}.ab-ord div{font-size:15px;padding:2px 0}.ab-ord div b{display:inline-block;width:24px;color:#74c0fc}.ab-ord small{color:#a5b4fc}
.ab-pick{margin-top:12px}.ab-pick h4{font:20px "Jua";margin:0 0 8px}.ab-pick h4 small{font:14px "Gowun Dodum";color:#a5b4fc;margin-left:6px}
.ab-flt{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}.ab-flt button{font-size:15px;padding:6px 12px}
@media (max-width:760px){.ab-packs{grid-template-columns:1fr}.ab-team{grid-template-columns:1fr}.ab-field{aspect-ratio:.92}.ab-slot{width:72px;padding:2px 2px 3px;border-radius:10px}.ab-slot span{font-size:22px}.ab-slot b{font-size:11px}.ab-slot small{font-size:9px}.ab-tabs button{font-size:15px;padding:7px 10px;white-space:nowrap}.ab-box{padding:12px}.ab-grid{grid-template-columns:repeat(auto-fill,minmax(120px,1fr))}.ab-hd h2{font-size:21px}}`;
      document.head.appendChild(s); }
  };
  return {SK, GN, GC, skv, POS, PN, PS, PT, RAR, ALL, BY, ST, stat, team, teamCards, order, power, cpuTeam, of, lvOf, canPlay, cardHTML, UI, COST1, COST10};
})();
window.ABC = ABC;
