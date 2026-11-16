/* =====================================================================
   🎵 리듬 스타 (2026.11.16) — 5줄 리듬게임 · 난이도 5단계(Lv.1~15) · 혼자 점수전
   - 노래 62곡은 오락실이 직접 만든 오리지널 곡이에요(13가지 장르 · 저작권 걱정 없음).
     처음 고를 때 이 기기에서 한 번 '녹음'해 두고(OfflineAudioContext), 그 소리 그대로 틀어요.
   - 🎧 내 노래: 이 기기에 있는 음악 파일을 넣으면 박자를 찾아 악보를 저절로 만들어요(이 기기에만 저장).
   - ⚡ 렉 없이: 판정은 화면 장면이 아니라 '소리 시계'로 해요 → 화면이 잠깐 버벅여도 판정은 정확해요.
     누르는 순간 바로 판정하고, 배경·길·빛 그림은 한 번만 그려 붙여요. 그림자 번짐 없음.
   ===================================================================== */
function rhRng(seed){ let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s/4294967296; }; }
const RH_N = 5;   // 🎹 5줄
const RH_KEYS = [["KeyD", "KeyS", "KeyA", "ArrowLeft", "Digit1"], ["KeyF", "ArrowDown", "Digit2"], ["Space", "KeyG", "KeyH", "KeyV", "KeyB", "KeyN", "Digit3"], ["KeyJ", "ArrowUp", "Digit4"], ["KeyK", "KeyL", "Semicolon", "ArrowRight", "Digit5"]];
const RH_DIFF = [{n: "쉬움", e: "🌱", c: "#51cf66", mul: .7}, {n: "보통", e: "⭐", c: "#4dabf7", mul: .85}, {n: "어려움", e: "🔥", c: "#ff6b6b", mul: 1},
                 {n: "매우 어려움", e: "💀", c: "#cc5de8", mul: 1.1}, {n: "마스터", e: "👑", c: "#ffc93c", mul: 1.2}];
const RH_EMO = [
  {n: "신나", e: ["😆", "🔥", "🎉", "🤩", "✨"]}, {n: "귀염", e: ["🥰", "💖", "🌸", "😻", "🍓"]}, {n: "멋짐", e: ["😎", "⚡", "👑", "💎", "🕶️"]},
  {n: "장난", e: ["🤪", "🎈", "🍭", "😜", "🦄"]}, {n: "동물", e: ["🐶", "🐱", "🐰", "🐼", "🐥"]}, {n: "우주", e: ["🚀", "⭐", "🪐", "🌙", "👽"]}
];
const RH_CHEER = ["👏", "📣", "💕", "🙌", "🎶", "💜", "🥳"];
/* 장르: 빠르기·조·멜로디 소리·드럼 모양 (모두 오락실이 직접 만드는 오리지널 곡이라 저작권 걱정 없음) */
const RH_GEN = {
  pop:    {n: "아이돌 팝",   bpm: [120, 134], mode: "maj", lead: ["bright", "square"], g: "four",  c: [["#7048e8", "#f06595"], ["#f76707", "#e64980"], ["#1c7ed6", "#f783ac"]]},
  cute:   {n: "귀염 팝",     bpm: [136, 150], mode: "maj", lead: ["square", "bell"],   g: "four",  c: [["#f783ac", "#ffa94d"], ["#da77f2", "#74c0fc"], ["#ff8787", "#ffd43b"]]},
  dance:  {n: "댄스",        bpm: [122, 130], mode: "min", lead: ["saw", "bright"],    g: "four",  c: [["#5f3dc4", "#f06595"], ["#c2255c", "#7048e8"], ["#1864ab", "#ae3ec9"]]},
  edm:    {n: "EDM",         bpm: [138, 150], mode: "min", lead: ["saw", "bright"],    g: "four",  c: [["#e8590c", "#7950f2"], ["#0ca678", "#4263eb"], ["#f03e3e", "#5c7cfa"]]},
  tropic: {n: "트로피컬",    bpm: [100, 112], mode: "maj", lead: ["pluck", "bell"],    g: "four",  c: [["#1098ad", "#fcc419"], ["#12b886", "#ff922b"], ["#15aabf", "#f783ac"]]},
  synth:  {n: "신스웨이브",  bpm: [104, 118], mode: "min", lead: ["saw", "square"],    g: "back",  c: [["#5f3dc4", "#22b8cf"], ["#862e9c", "#ff6b6b"], ["#364fc7", "#e64980"]]},
  chip:   {n: "8비트 게임",  bpm: [150, 172], mode: "maj", lead: ["square"],           g: "break", c: [["#2b8a3e", "#fab005"], ["#1971c2", "#fa5252"], ["#5c940d", "#22b8cf"]]},
  hiphop: {n: "힙합",        bpm: [86, 96],   mode: "min", lead: ["pluck", "bell"],    g: "back",  c: [["#343a40", "#fab005"], ["#495057", "#20c997"], ["#212529", "#ff6b6b"]]},
  trap:   {n: "트랩",        bpm: [136, 148], mode: "min", lead: ["bell", "saw"],      g: "half",  c: [["#212529", "#be4bdb"], ["#343a40", "#4dabf7"], ["#1a1b1e", "#ff922b"]]},
  ballad: {n: "발라드",      bpm: [76, 90],   mode: "maj", lead: ["bell", "pluck"],    g: "back",  c: [["#4c6ef5", "#a5d8ff"], ["#ae3ec9", "#ffc9e3"], ["#1098ad", "#d0bfff"]]},
  funk:   {n: "펑키",        bpm: [108, 118], mode: "min", lead: ["square", "pluck"],  g: "break", c: [["#e67700", "#9c36b5"], ["#d6336c", "#fcc419"], ["#2f9e44", "#f76707"]]},
  rock:   {n: "록",          bpm: [150, 166], mode: "min", lead: ["saw"],              g: "back",  c: [["#c92a2a", "#343a40"], ["#e8590c", "#212529"], ["#a61e4d", "#495057"]]},
  dnb:    {n: "드럼앤베이스", bpm: [170, 180], mode: "min", lead: ["saw", "bright"],    g: "dnb",   c: [["#0b7285", "#7048e8"], ["#087f5b", "#3b5bdb"], ["#5f3dc4", "#0ca678"]]}
};
/* 노래 목록: 아이디|제목|영어 제목|부른 팀|그림|장르|한 줄 소개 */
const RH_LIST = `moon|달빛 산책|Moonlight Walk|LUNA 6|🌙|ballad|조용한 밤길을 걷는 포근한 발라드
bubble|버블 팡팡|Bubble Pang|Pop Fizz|🫧|cute|비눗방울이 톡톡 터지는 귀염 팝
pixel|픽셀 어드벤처|Pixel Adventure|8BIT CREW|👾|chip|옛날 게임기 속으로 떠나는 모험
thunder|썬더 스텝|Thunder Step|STORM 4|⚡|edm|번개처럼 쾅쾅 내리꽂는 EDM
petal|벚꽃 엔딩 크레딧|Petal Credits|PETAL 6|🌸|pop|꽃잎이 흩날리는 봄 아이돌 팝
surf|파도 타기|Surf Rider|WAVE KIDS|🏄|tropic|시원하게 파도를 가르는 트로피컬
cyber|사이버 시티|Cyber City|NEON 404|🌃|synth|네온이 번쩍이는 미래 도시
dino|공룡 행진|Dino March|T-REX BAND|🦖|funk|쿵쿵 걷는 공룡들의 펑키 퍼레이드
rainbow|무지개 다리|Rainbow Bridge|6-4 STARS|🌈|pop|비 갠 뒤 함께 건너는 무지개
milky|은하수 열차|Milky Way Train|ORBIT|🚂|dnb|별 사이를 쌩쌩 달리는 우주 열차
hamster|햄스터 쳇바퀴|Hamster Wheel|CHEEK POUCH|🐹|cute|멈추지 않는 볼빵빵 햄스터
street|스트릿 비트|Street Beat|BLOCK 6|🧢|hiphop|어깨가 들썩이는 골목길 힙합
robot|로봇 그루브|Robot Groove|MECHA 4|🤖|funk|삐걱삐걱 로봇의 펑키 댄스
snow|첫눈 오는 날|First Snow|WINTER 6|❄️|ballad|창밖에 첫눈이 내리는 날
lava|용암 질주|Lava Run|BLAZE|🌋|rock|뜨거운 용암 위를 달리는 록
picnic|소풍 가는 길|Picnic Road|SUNNY 4|🧺|pop|도시락 들고 떠나는 소풍
ninja|닌자 대작전|Ninja Mission|SHADOW 6|🥷|trap|어둠 속을 슥슥 움직이는 닌자
jelly|젤리 젤리|Jelly Jelly|Gummy Club|🍬|cute|말랑말랑 쫀득한 젤리 팝
drive|미드나잇 드라이브|Midnight Drive|VIOLET 4|🚗|synth|반짝이는 밤거리 드라이브
shout|승리의 함성|Victory Shout|6-4 ALL STARS|🏅|rock|다 같이 외치는 응원 록
coco|코코넛 섬|Coconut Island|ISLAND KIDS|🥥|tropic|야자수 그늘 아래 여름 휴가
meteor|유성우|Meteor Shower|STARGAZER|☄️|edm|밤하늘을 가르는 별똥별 비
cookie|쿠키 굽는 날|Cookie Day|Sweet 6|🍪|cute|고소한 냄새 가득 달콤 팝
boss|최종 보스|Final Boss|8BIT CREW|🐉|chip|마지막 판! 보스와의 한판 승부
skate|스케이트보드|Skateboard|HALFPIPE|🛹|rock|바람을 가르는 보드 타기
sunset|노을 아래서|Under the Sunset|GOLDEN HOUR|🌇|ballad|주황빛 노을 속 잔잔한 노래
laser|레이저 쇼|Laser Show|PRISM|🔦|dance|형형색색 빛이 춤추는 무대
paw|고양이 발도장|Paw Print|MEOW 4|🐾|cute|꾹꾹 찍는 귀여운 냥 발자국
jungle|정글 탐험|Jungle Quest|WILD 6|🌴|dnb|빽빽한 정글을 헤치는 질주
diary|비밀 일기장|Secret Diary|PAGE 6|📔|ballad|나만 아는 마음을 적는 밤
hero|슈퍼 히어로|Super Hero|CAPE CREW|🦸|edm|위기의 순간 날아오는 영웅
ghost|유령 파티|Ghost Party|BOO 4|👻|trap|으스스하지만 신나는 한밤 파티
lemon|레모네이드|Lemonade|CITRUS|🍋|pop|톡 쏘는 상큼한 여름 팝
dash|100미터 달리기|100m Dash|SPRINT 6|🏃|dnb|출발 신호와 함께 전력 질주
cave|크리스탈 동굴|Crystal Cave|GEM 4|💎|synth|보석이 반짝이는 신비한 동굴
flight|용의 비행|Dragon Flight|SKY SCALE|🐲|rock|구름 위를 나는 용의 노래
popcorn|팝콘 터진다|Popcorn Pop|Movie Night|🍿|chip|팡팡 튀어 오르는 8비트 팝콘
mirror|거울 속 나|Mirror Me|ECHO 6|🪞|dance|거울 앞에서 추는 나만의 춤
grad|졸업 앨범|Graduation Album|CLASS OF 2027|🎓|ballad|함께한 날들을 넘겨 보는 앨범
bounce|통통 점프|Bounce Jump|SPRING 4|🦘|funk|트램펄린 위 통통 펑키 점프
aurora|오로라|Aurora|NORTH 6|🌌|edm|하늘에 물결치는 빛의 커튼
ramen|컵라면 3분|3-Minute Ramen|NOODLE 4|🍜|chip|3분만 기다리면 완성!
fire|불꽃놀이|Fireworks|HANABI 6|🎆|dance|밤하늘에 펑펑 터지는 축제
metro|지하철 2호선|Line 2|METRO|🚇|hiphop|덜컹덜컹 출근길 힙합
sled|펭귄 썰매|Penguin Sled|ICE 4|🐧|cute|얼음 언덕을 쭉 미끄러지는 펭귄
tornado|토네이도|Tornado|CYCLONE|🌪️|dnb|모든 걸 휘감는 회오리
bloom|꽃밭 정원|Flower Garden|BLOOM 6|🌷|tropic|나비가 춤추는 꽃밭 산책
arcade|오락실 챔피언|Arcade Champ|1UP|🕹️|chip|최고 점수에 도전하는 오락실
orion|별자리 이야기|Constellation|ORION 4|⭐|ballad|별을 이어 그리는 밤 이야기
pulse|심장 박동|Heartbeat|PULSE 6|💓|dance|두근두근 심장이 뛰는 비트
shark|상어 습격|Shark Attack|DEEP 4|🦈|trap|깊은 바다에서 다가오는 그림자
fest|축제의 밤|Festival Night|ALL STARS|🎪|edm|모두가 뛰노는 축제의 하이라이트
rain|빗방울 리듬|Raindrop Rhythm|DRIZZLE|🌧️|hiphop|창문을 톡톡 두드리는 빗방울
ufo|UFO 착륙|UFO Landing|AREA 64|🛸|synth|운동장에 내려앉은 비행접시
bee|꿀벌 윙윙|Busy Bee|HONEY 4|🐝|chip|꽃 사이를 바쁘게 나는 꿀벌
lastday|마지막 수업|Last Class|6-4 FOREVER|🔔|pop|종이 울리기 전 마지막 노래`;
/* 오리지널 노래 (도: 음 이름 숫자 60 = 가운데 도) */
const RH_SONGS = [
  {id: "star", t: "별빛 러너", en: "Starlight Runner", a: "6-4 STARS", e: "✨", bpm: 128, root: 64, mode: "maj", seed: 11, lead: "bright", gen: "pop",
   c: ["#7048e8", "#f06595"], d: "반짝반짝 신나는 댄스 팝",
   form: [["i", 4], ["v", 8], ["p", 4], ["c", 8], ["b", 4], ["c", 8], ["o", 2]],
   prog: {i: [6, 4, 1, 5], v: [1, 5, 6, 4], p: [4, 5, 3, 6], c: [6, 4, 1, 5], b: [4, 5, 4, 5], o: [1]}},
  {id: "candy", t: "캔디 팝", en: "Candy Pop", a: "Sweet 6", e: "🍭", bpm: 140, root: 65, mode: "maj", seed: 27, lead: "square", gen: "cute",
   c: ["#f783ac", "#ffa94d"], d: "통통 튀는 달콤한 버블검 팝",
   form: [["i", 4], ["v", 8], ["p", 4], ["c", 8], ["v", 4], ["c", 8], ["o", 2]],
   prog: {i: [1, 5, 6, 4], v: [1, 6, 4, 5], p: [2, 5, 3, 6], c: [1, 5, 6, 4], b: [4, 5], o: [1]}},
  {id: "neon", t: "네온 하트", en: "Neon Heart", a: "VIOLET 4", e: "💜", bpm: 118, root: 62, mode: "min", seed: 43, lead: "saw", gen: "dance",
   c: ["#5f3dc4", "#22b8cf"], d: "밤거리처럼 반짝이는 신스 댄스",
   form: [["i", 4], ["v", 8], ["p", 4], ["c", 8], ["b", 4], ["c", 8], ["o", 2]],
   prog: {i: [1, 6, 7, 5], v: [1, 6, 3, 7], p: [4, 5, 6, 5], c: [1, 6, 3, 7], b: [6, 7, 6, 7], o: [1]}},
  {id: "summer", t: "썸머 스플래시", en: "Summer Splash", a: "WAVE KIDS", e: "🌊", bpm: 108, root: 67, mode: "maj", seed: 58, lead: "pluck", gen: "tropic",
   c: ["#1098ad", "#fcc419"], d: "시원한 바다 트로피컬 하우스",
   form: [["i", 4], ["v", 8], ["p", 4], ["c", 8], ["b", 4], ["c", 8], ["o", 2]],
   prog: {i: [4, 1, 5, 6], v: [4, 1, 5, 6], p: [2, 3, 4, 5], c: [4, 5, 3, 6], b: [2, 5], o: [1]}},
  {id: "rocket", t: "드림 로켓", en: "Dream Rocket", a: "LAUNCH CREW", e: "🚀", bpm: 150, root: 60, mode: "min", seed: 71, lead: "bright", gen: "edm",
   c: ["#e8590c", "#7950f2"], d: "우주로 슝! 빠르고 짜릿한 EDM",
   form: [["i", 4], ["v", 8], ["p", 4], ["c", 8], ["b", 4], ["c", 8], ["o", 2]],
   prog: {i: [1, 7, 6, 7], v: [1, 6, 7, 5], p: [4, 5, 6, 7], c: [1, 6, 3, 7], b: [4, 5], o: [1]}},
  {id: "champ", t: "우리반 챔피언", en: "Class Champion", a: "6-4 ALL STARS", e: "🏆", bpm: 132, root: 62, mode: "maj", seed: 96, lead: "square", gen: "pop",
   c: ["#f08c00", "#e64980"], d: "다 같이 손뼉! 응원가 팝",
   form: [["i", 4], ["v", 8], ["p", 4], ["c", 8], ["b", 4], ["c", 8], ["o", 2]],
   prog: {i: [1, 4, 5, 1], v: [1, 4, 6, 5], p: [4, 5, 6, 5], c: [1, 5, 6, 4], b: [6, 4, 5, 5], o: [1]}}
];
/* 목록의 곡들은 장르 틀 + 씨앗 숫자로 모양을 정해요 (같은 씨앗 = 언제나 같은 노래) */
(function(){
  const PM = {maj: [[1, 5, 6, 4], [6, 4, 1, 5], [1, 6, 4, 5], [4, 5, 3, 6], [1, 4, 5, 1], [2, 5, 1, 6], [4, 1, 5, 6], [1, 3, 4, 5], [6, 5, 4, 5], [1, 5, 4, 5]],
              min: [[1, 6, 7, 5], [1, 6, 3, 7], [1, 7, 6, 7], [6, 7, 1, 1], [1, 4, 5, 1], [4, 5, 6, 5], [1, 3, 7, 6], [6, 3, 7, 1], [1, 4, 7, 3], [6, 4, 1, 5]]};
  const PP = {maj: [[4, 5, 3, 6], [2, 5, 3, 6], [4, 5, 6, 5], [2, 3, 4, 5]], min: [[4, 5, 6, 5], [4, 5, 6, 7], [6, 7, 6, 7], [4, 7, 3, 6]]};
  const FORM = {
    std: [["i", 4], ["v", 8], ["p", 4], ["c", 8], ["b", 4], ["c", 8], ["o", 2]],
    vv:  [["i", 4], ["v", 8], ["p", 4], ["c", 8], ["v", 4], ["p", 4], ["c", 8], ["o", 2]],
    long:[["i", 4], ["v", 8], ["p", 4], ["c", 8], ["v", 8], ["p", 4], ["c", 8], ["b", 4], ["c", 8], ["o", 2]],
    slow:[["i", 2], ["v", 8], ["p", 4], ["c", 8], ["b", 4], ["c", 8], ["o", 2]]
  };
  RH_LIST.split("\n").forEach((ln, i) => {
    const [id, t, en, a, e, gen, d] = ln.split("|"), G = RH_GEN[gen], R = rhRng(1009 + i*7919);
    const pick = arr => arr[Math.floor(R()*arr.length)];
    const bpm = Math.round(G.bpm[0] + R()*(G.bpm[1] - G.bpm[0])), mode = gen === "chip" && R() < .4 ? "min" : G.mode;
    const v = pick(PM[mode]), c = pick(PM[mode]), p = pick(PP[mode]);
    RH_SONGS.push({id, t, en, a, e, gen, d, bpm, mode, root: 60 + Math.floor(R()*8), seed: 200 + i*31, lead: pick(G.lead), g: G.g, c: pick(G.c),
      form: bpm >= 148 ? FORM.long : bpm < 96 ? FORM.slow : R() < .5 ? FORM.std : FORM.vv,
      prog: {i: c, v, p, c, b: [p[0], p[1]], o: [1]}});
  });
})();
const RH_SONG = new Map(RH_SONGS.map(S => [S.id, S]));
const RH_SC = {maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10]};

/* ---------- 작곡: 모양(구성)·화음·멜로디·베이스·드럼을 숫자 악보로 ---------- */
function rhCompose(S){
  const R = rhRng(S.seed), sc = RH_SC[S.mode], root = S.root, GV = S.g || "four";
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
      else if (type === "v" && GV === "half"){ K(0); K(b % 2 ? 10 : 7); SN(8); for (let x = 0; x < 16; x += 2) H(x, x % 4 ? .5 : .85); if (b % 2) [13, 14, 15].forEach(x => H(x, .45)); }
      else if (type === "v" && (GV === "break" || GV === "dnb")){ K(0); K(10); if (b % 2 && GV === "break") K(7); [4, 12].forEach(x => SN(x)); for (let x = 0; x < 16; x += 2) H(x, x % 4 ? .55 : .85); if (last && nextType === "c") [12, 13, 14, 15].forEach((x, k) => SN(x, .5 + k*.15)); }
      else if (type === "v"){ [0, 8].forEach(K); if (b % 2) K(10); else K(6); [4, 12].forEach(x => SN(x)); [0, 2, 4, 6, 8, 10, 12, 14].forEach(x => H(x, x % 4 ? .6 : .9)); if (last && nextType === "c") [12, 13, 14, 15].forEach((x, k) => SN(x, .5 + k*.15)); }
      else if (type === "p" && GV !== "four"){ if (GV === "half"){ K(0); K(10); SN(8); } else { K(0); K(GV === "back" ? 8 : 10); [4, 12].forEach(x => SN(x)); } [0, 2, 4, 6, 8, 10, 12, 14].forEach(x => H(x, .8));
        if (last) for (let x = 0; x < 16; x++) SN(x, .35 + x*.04); }
      else if (type === "p"){ [0, 4, 8, 12].forEach(K); [4, 12].forEach(x => SN(x)); [0, 2, 4, 6, 8, 10, 12, 14].forEach(x => H(x, .8));
        if (b === bars - 2) [0, 2, 4, 6, 8, 10, 12, 14].forEach((x, k) => SN(x, .35 + k*.04)); if (last) for (let x = 0; x < 16; x++) SN(x, .35 + x*.04); }
      else if (type === "c" && GV !== "four"){
        if (GV === "half"){ [0, 10].forEach(K); if (b % 2) K(3); CL(8); SN(8, .7); for (let x = 0; x < 16; x++) H(x, x % 2 ? .4 : .7); }
        else if (GV === "back"){ [0, 6, 8].forEach(K); if (b % 2) K(11); [4, 12].forEach(x => { CL(x); SN(x, .7); }); for (let x = 0; x < 16; x += 2) H(x, x % 4 ? .55 : .85); OH(14); }
        else { K(0); K(10); if (GV === "break") K(7); else if (b % 2) K(6); [4, 12].forEach(x => { CL(x); SN(x, .7); }); for (let x = 0; x < 16; x++) if (GV === "break" || x % 2 === 0) H(x, x % 2 ? .4 : .75); }
        if (b === 0) ev.crash.push({s}); if (last && nextType && nextType !== "o") [12, 13, 14, 15].forEach((x, k) => SN(x, .5 + k*.15)); }
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
/* ⚡ 녹음한 노래는 한 곡에 수십 MB라서 최근 곡 몇 개만 기억해요 (많이 들어 봐도 태블릿 메모리가 꽉 차지 않게) */
function rhKeep(id, b){ RH_BUF.delete(id); RH_BUF.set(id, b); while (RH_BUF.size > 3){ const k = RH_BUF.keys().next().value; RH_BUF.delete(k); } return b; }
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
  const put = (i, v, pan) => { if (i < 0 || i >= N) return; if (pan === 0){ Lb[i] += v; Rb[i] += v; return; } Lb[i] += pan > 0 ? v*(1 - pan) : v; Rb[i] += pan < 0 ? v*(1 + pan) : v; };
  const noiseHit = (t0, d, type, f, q, v, pan = 0, f1) => { const b = BQ(type).set(f, q), i0 = Math.round(t0*SR), n = Math.round(d*SR), r = Math.pow(.001, 1/n); let e = v;
    for (let i = 0; i < n; i++){ if (f1 && i % 32 === 0) b.set(f*Math.pow(f1/f, i/n), q); put(i0 + i, b.p(nz())*e, pan); e *= r; } };
  /* ⚡ 북·심벌 소리는 한 번만 만들어 두고 박자마다 붙여요 (예전엔 칠 때마다 새로 계산해서 녹음이 오래 걸렸어요) */
  const mk = (len, fill) => { const M = new Float32Array(Math.round(len*SR)); fill(M); return M; };
  const nzT = (len, type, f, q, f1) => mk(len, M => { const b = BQ(type).set(f, q), n = M.length, r = Math.pow(.001, 1/n); let e = 1; for (let i = 0; i < n; i++){ if (f1 && i % 32 === 0) b.set(f*Math.pow(f1/f, i/n), q); M[i] = b.p(nz())*e; e *= r; } });
  const add = (M, t0, v, pan = 0) => { const i0 = Math.round(t0*SR), gl = v*(1 - Math.max(0, pan)), gr = v*(1 + Math.min(0, pan)), n = Math.min(M.length, N - i0); for (let i = Math.max(0, -i0); i < n; i++){ const x = M[i]; Lb[i0 + i] += x*gl; Rb[i0 + i] += x*gr; } };
  const DR = .78, MU = .85;
  const KICK = mk(.36, M => { let ph = 0; const n = M.length, r = Math.pow(.001, 1/(.34*SR)); let e = 1; for (let i = 0; i < n; i++){ const t = i/SR, f = 155*Math.pow(46/155, Math.min(1, t/.13)); ph += f/SR; M[i] = Math.sin(TAU*ph)*e; e *= r; }
    const c = nzT(.012, "hp", 3000, .7); for (let i = 0; i < c.length; i++) M[i] += c[i]*.25; });
  const SNARE = mk(.17, M => { const c = nzT(.17, "bp", 1900, .8); for (let i = 0; i < M.length; i++) M[i] = c[i]*.9; let ph = 0; const n = Math.round(.1*SR), r = Math.pow(.001, 1/n); let e = 1;
    for (let i = 0; i < n; i++){ const t = i/SR; ph += (200 - 50*Math.min(1, t/.08))/SR; M[i] += tri(ph % 1)*.4*e; e *= r; } });
  const CLAP = mk(.2, M => { const a = nzT(.02, "bp", 1250, 1.2), b2 = nzT(.16, "bp", 1250, 1.1); [0, .011, .022].forEach(d => { const o = Math.round(d*SR); for (let i = 0; i < a.length && o + i < M.length; i++) M[o + i] += a[i]*.8; });
    const o = Math.round(.03*SR); for (let i = 0; i < b2.length && o + i < M.length; i++) M[o + i] += b2[i]*.6; });
  const HAT = nzT(.045, "hp", 7800, .7), OHAT = nzT(.2, "hp", 6800, .7), CRASH = nzT(1.3, "hp", 4200, .5);
  ev.kick.forEach(e => add(KICK, T(e.s), DR));
  ev.snare.forEach(e => add(SNARE, T(e.s), (e.v || 1)*DR));
  ev.clap.forEach(e => add(CLAP, T(e.s), DR));
  ev.hat.forEach((e, k) => add(HAT, T(e.s), .3*(e.v || 1)*DR, k % 2 ? .25 : -.25));
  ev.ohat.forEach(e => add(OHAT, T(e.s), .2*DR, .15));
  ev.crash.forEach(e => add(CRASH, T(e.s), .35*DR, -.1));
  ev.riser.forEach(r => { const b = BQ("bp"), i0 = Math.round(T(r.s)*SR), n = Math.round((T(r.e) - T(r.s))*SR), g = Math.pow(.32/.001, 1/n); let e = .001*MU*1.6;
    for (let i = 0; i < n; i++){ const k = i/n; if (i % 32 === 0) b.set(400*Math.pow(7000/400, k), 2); put(i0 + i, b.p(nz())*e, 0); e *= g; } });
  ev.bass.forEach(e => { const t0 = T(e.s), d = T(e.d)*.92, f = hz(e.m), dt = f/SR, b = BQ("lp"), i0 = Math.round(t0*SR), n = Math.round((d + .06)*SR), rr = Math.pow(.001, 1/(.05*SR)); let ph = 0, rel = 1;
    for (let i = 0; i < n; i++){ const t = i/SR; if (i % 32 === 0) b.set(900*Math.pow(260/900, Math.min(1, t/Math.min(.25, d))), 3);
      ph += dt; if (ph >= 1) ph -= 1;
      let a; if (t < .005) a = t/.005; else if (t < d - .04) a = 1; else { a = rel; rel *= rr; }
      put(i0 + i, (b.p(saw(ph, dt))*.8 + Math.sin(TAU*ph)*.7)*.3*a*MU, 0); } });
  // 🎹 패드 (킥에 맞춰 숨 쉬듯)
  ev.pad.forEach(p => { const t0 = T(p.s), d = T(p.d), i0 = Math.round(t0*SR), n = Math.round((d + .3)*SR), v = .045*(p.v || 1), rr = Math.pow(.001, 1/(.25*SR));
    p.ms.forEach(m => [-9, 9].forEach(dc => { const f = hz(m)*Math.pow(2, dc/1200), dt = f/SR; let ph = (m*.137 + dc) % 1, rel = 1; if (ph < 0) ph += 1;
      for (let i = 0; i < n; i++){ const t = i/SR; let a; if (t < .18) a = t/.18; else if (t < d - .1) a = 1; else { a = rel; rel *= rr; } ph += dt; if (ph >= 1) ph -= 1; const j = i0 + i; if (j < N) PD[j] += saw(ph, dt)*v*a; } })); });
  { const b = BQ("lp").set(1500, .7), kicks = ev.kick.map(e => Math.round(T(e.s)*SR)), rise = st*3*SR; let ki = 0, last = -1e9;
    for (let i = 0; i < N; i++){ while (ki < kicks.length && kicks[ki] <= i){ last = kicks[ki]; ki++; } const g = i - last < rise ? .35 + .65*(i - last)/rise : 1; const v = b.p(PD[i])*g*MU; Lb[i] += v; Rb[i] += v; } }
  const pluck = (t0, m, v, d, pan) => { const f = hz(m), dt = f/SR, b = BQ("lp"), i0 = Math.round(t0*SR), n = Math.round((d + .06)*SR), r = Math.pow(.001, 1/((d + .05)*SR)); let ph = 0, e = v*MU;
    for (let i = 0; i < n; i++){ const t = i/SR; if (i % 32 === 0) b.set(4200*Math.pow(500/4200, Math.min(1, t/d)), 4); ph += dt; if (ph >= 1) ph -= 1; put(i0 + i, b.p(saw(ph, dt))*e, pan); e *= r; } };
  ev.stab.forEach(s => s.ms.forEach((m, k) => pluck(T(s.s), m, .07, .16, (k - 1)*.3)));
  ev.arp.forEach((a, k) => pluck(T(a.s), a.m, .06, .14, k % 2 ? .35 : -.35));
  // 🎤 멜로디
  const PL = S.lead === "pluck" || S.lead === "bell", OS = S.lead === "square" ? [["q", -6], ["q", 6]] : S.lead === "saw" ? [["s", -8], ["s", 8], ["q", 0]] : S.lead === "pluck" ? [["t", 0], ["s", 5]] : S.lead === "bell" ? [["t", 0], ["t", 1200], ["t", 1902]] : [["s", -7], ["q", 7]];
  const OR = OS.map(o => Math.pow(2, o[1]/1200));
  ev.lead.forEach(e => { const t0 = T(e.s), d = Math.max(.08, T(e.d) - .03), b = BQ("lp").set(S.lead === "pluck" ? 2400 : S.lead === "bell" ? 6500 : 3600, 1.2), i0 = Math.round(t0*SR), n = Math.round((d + .2)*SR);
    const v = (S.lead === "saw" ? .11 : S.lead === "pluck" ? .2 : S.lead === "bell" ? .17 : .13)*(e.type === "c" ? 1.1 : 1), ph = OS.map((o, k) => k*.31), f0 = hz(e.m), dts = OR.map(r => f0*r/SR);
    const rp = Math.pow(.001, 1/((d + (S.lead === "bell" ? .35 : .15))*SR)), rr = Math.pow(.001, 1/(.12*SR)); let ep = 1, rel = 1, vr = 1;
    for (let i = 0; i < n; i++){ const t = i/SR;
      if (i % 16 === 0){ if (S.lead === "pluck" && i % 32 === 0) b.set(5000*Math.pow(900/5000, Math.min(1, t/Math.min(.4, d))), 1.2);
        vr = d > .3 && t > .18 ? Math.pow(2, Math.sin(TAU*5.5*(t - .18))*12*Math.min(1, (t - .18)/.2)/1200) : 1; }
      let x = 0; for (let k = 0; k < OS.length; k++){ const dt = dts[k]*vr; ph[k] += dt; if (ph[k] >= 1) ph[k] -= 1; const w = OS[k][0]; x += w === "s" ? saw(ph[k], dt) : w === "q" ? sqr(ph[k], dt)*.8 : tri(ph[k]); }
      let a; if (PL){ a = ep; ep *= rp; } else if (t < .012) a = t/.012; else if (t < d - .02) a = 1; else { a = rel; rel *= rr; }
      const y = b.p(x*.5)*v*a*MU, j = i0 + i; if (j < N){ Lb[j] += y; Rb[j] += y; DS[j] += y*.5; } } });
  // 메아리(딜레이)
  { const D = Math.round(st*3*SR), b = BQ("lp").set(2600, .7), buf = new Float32Array(D); let w = 0;
    for (let i = 0; i < N; i++){ const out = buf[w], f = b.p(out); buf[w] = DS[i] + f*.3; w = (w + 1) % D; Lb[i] += f*.3*.8; Rb[i] += f*.3*1.1; } }
  // 마무리: 부드럽게 눌러 주기(소리가 깨지지 않게) — 빠른 tanh 근사
  let pk = 0; for (let i = 0; i < N; i++){ const a = Lb[i] < 0 ? -Lb[i] : Lb[i], c = Rb[i] < 0 ? -Rb[i] : Rb[i]; if (a > pk) pk = a; if (c > pk) pk = c; }
  const pre = 1.15/Math.max(.6, pk*.55), th = x => x > 3 ? 1 : x < -3 ? -1 : x*(27 + x*x)/(27 + 9*x*x);
  for (let i = 0; i < N; i++){ Lb[i] = th(Lb[i]*pre)*.86; Rb[i] = th(Rb[i]*pre)*.86; }
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
  if (RH_BUF.has(S.id)) return Promise.resolve(rhKeep(S.id, RH_BUF.get(S.id)));
  if (RH_LOAD.has(S.id)) return RH_LOAD.get(S.id);
  const p = rhSynthAsync(rhPlan(S), S, 32000).then(r => { const a = getAC(), b = a.createBuffer(2, r.L.length, r.SR); b.copyToChannel(r.L, 0); b.copyToChannel(r.R, 1); rhKeep(S.id, b); RH_LOAD.delete(S.id); return b; });
  RH_LOAD.set(S.id, p); return p;
}

/* ---------- 악보 만들기 (5단계: 쉬움·보통·어려움·매우 어려움·마스터) · 5줄 ---------- */
function rhChart(S, diff){
  const ev = rhPlan(S), st = 60/S.bpm/4, secs = ev.sec, secAt = s => { let t = "v"; for (const x of secs) if (x.s <= s) t = x.type; return t; };
  const cand = [];
  ev.lead.forEach(n => cand.push({s: n.s, m: n.m, d: n.d, k: "m", p: 3}));
  ev.kick.forEach(k => cand.push({s: k.s, k: "k", p: 1, sec: secAt(k.s)}));
  ev.clap.forEach(k => cand.push({s: k.s, k: "s", p: 2, sec: "c"}));
  ev.snare.forEach(k => { if (k.v >= .9) cand.push({s: k.s, k: "s", p: 1.5, sec: secAt(k.s)}); });
  if (diff >= 3){ ev.arp.forEach(a => cand.push({s: a.s, m: a.m, k: "a", p: .8, sec: secAt(a.s)}));
    ev.snare.forEach(k => { if (k.v < .9 && k.v >= .5) cand.push({s: k.s, k: "f", p: .7, sec: secAt(k.s)}); }); }
  if (diff >= 4) ev.hat.forEach(h => { const sc = secAt(h.s); if (sc === "c" && h.s % 2 === 1) cand.push({s: h.s, k: "h", p: .5, sec: sc}); });
  const gap = [4, 2, 1, 1, 1][diff], holdMin = [8, 6, 6, 5, 4][diff], runMax = [0, 0, 4, 6, 10][diff], chordMax = [1, 1, 1, 2, 3][diff];
  const pick = cand.filter(n => {
    if (n.k === "m") return diff >= 2 || n.s % 2 === 0;
    if (diff === 0) return n.k === "k" && n.s % 8 === 0 && "ivbo".includes(n.sec);
    if (diff === 1) return n.k === "k" ? n.s % 4 === 0 && "ib".includes(n.sec) : false;
    if (diff === 2) return n.k === "k" ? n.s % 4 === 0 : n.k === "s";
    if (n.k === "a") return diff === 4 || n.s % 2 === 0;
    if (n.k === "f") return true;
    return n.k === "k" ? (diff === 4 || n.s % 2 === 0) : true;
  }).sort((a, b) => a.s - b.s || b.p - a.p);
  const out = []; let lastS = -99, run = 0, atS = [];
  for (const n of pick){
    if (out.length && n.s === lastS){   // 같은 박: 매우 어려움부터 서로 다른 소리끼리 동시에
      if (atS.length < chordMax && !atS.includes(n.k) && (n.k === "m" || n.k === "k" || n.k === "s")){ out.push(n); atS.push(n.k); }
      continue; }
    if (out.length && n.s - lastS < gap) continue;
    if (diff >= 2){ run = n.s - lastS === 1 ? run + 1 : 0; if (run >= runMax) continue; }
    out.push(n); lastS = n.s; atS = [n.k];
  }
  // 줄 정하기 (0~4): 멜로디는 높으면 오른쪽·낮으면 왼쪽, 쿵(킥)은 양 끝, 짝(스네어)은 안쪽, 반짝이(아르페지오)는 높낮이대로
  const NL = RH_N, busy = new Array(NL).fill(-1), notes = []; let pL = 2, pM = null, pS = -99, kc = 0, scn = 0, hc = 0, curS = -1, used = [];
  const free = (L, s) => busy[L] < s - 1 && !(s === curS && used.includes(L));
  const near = (L, s) => { if (free(L, s)) return L; for (const d of [1, -1, 2, -2, 3, -3, 4, -4]){ const x = L + d; if (x >= 0 && x < NL && free(x, s)) return x; } return -1; };
  for (const n of out){
    if (n.s !== curS){ curS = n.s; used = []; }
    let L;
    if (n.k === "m"){
      if (pM === null) L = 2; else { const d = n.m - pM; L = d > 0 ? pL + (d > 4 ? 2 : 1) : d < 0 ? pL - (d < -4 ? 2 : 1) : (n.s - pS <= 2 ? (pL <= 2 ? pL + 1 : pL - 1) : pL); }
      pM = n.m;
    } else if (n.k === "k") L = kc++ % 2 ? NL - 1 : 0;
    else if (n.k === "s" || n.k === "f") L = scn++ % 2 ? 3 : 1;
    else if (n.k === "a") L = [1, 2, 3, 2][Math.round(n.s) % 4] + (n.m % 3 === 0 ? (n.s % 8 < 4 ? -1 : 1) : 0);
    else L = [2, 1, 2, 3][hc++ % 4];
    L = Math.max(0, Math.min(NL - 1, L));
    if (n.s !== pS && L === pL && n.s - pS < (diff >= 3 ? 1 : diff === 2 ? 2 : 3)) L = pL <= 2 ? pL + 1 : pL - 1;
    L = near(L, n.s); if (L < 0) continue;
    const note = {t: n.s*st, l: L};
    if (n.k === "m" && n.d >= holdMin){ const hd = n.d - 2; note.e = (n.s + hd)*st; busy[L] = n.s + hd; }
    notes.push(note); used.push(L); if (n.s !== pS || n.k === "m"){ pL = L; } pS = n.s;
    // 후렴 강세 박엔 두 줄(마스터는 세 줄) 동시에
    const acc = secAt(n.s) === "c" && (diff === 2 ? n.s % 16 === 0 : diff === 3 ? n.s % 8 === 0 : diff === 4 ? n.s % 4 === 0 : false);
    if (acc && used.length === 1){ const L2 = NL - 1 - L !== L ? NL - 1 - L : (L + 2) % NL; if (free(L2, n.s)){ notes.push({t: n.s*st, l: L2}); used.push(L2); }
      if (diff === 4 && n.s % 16 === 0){ const L3 = [0, 1, 2, 3, 4].find(x => free(x, n.s) && Math.abs(x - L) > 1 && Math.abs(x - L2) > 1); if (L3 !== undefined){ notes.push({t: n.s*st, l: L3}); used.push(L3); } } }
  }
  notes.sort((a, b) => a.t - b.t || a.l - b.l);
  return notes;
}
/* 레벨 (1~15): 1초에 치는 노트 수(긴 노트·동시 치기는 더 어렵게)로 단계마다 정해진 범위 안에서 */
const RH_LVR = [[1, 4], [3, 7], [6, 10], [9, 13], [12, 15]], RH_LVK = [[1.6, -.6], [1.667, .5], [1.43, 3], [.8, 5.7], [.4, 10]];
function rhLv(notes, dur, diff = 2){
  let w = 0, pt = -1; for (const n of notes){ w += n.e ? 1.4 : 1; if (n.t === pt) w += .35; pt = n.t; }
  const nps = w/Math.max(20, dur), [lo, hi] = RH_LVR[diff], [k, c] = RH_LVK[diff];
  return Math.max(lo, Math.min(hi, Math.round(nps*k + c)));
}

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
  const gap = [.36, .22, .14, .11, .085][diff], dens = [1.25, 2.1, 3.2, 4.2, 5.4][diff], want = Math.round(dur*dens);
  const sorted = on.filter(o => o.t > 1 && o.t < dur - .5).sort((a, b) => b.v - a.v), taken = [];
  const ok = t => { for (const x of taken) if (Math.abs(x.t - t) < gap) return false; return true; };
  for (const o of sorted){ if (taken.length >= want) break; if (ok(o.t)) taken.push(o); }
  taken.sort((a, b) => a.t - b.t);
  const notes = []; let pL = 2, kc = 0, mc = 0, hc = 0, pt = -9;
  taken.forEach(o => {
    let L = o.b === 0 ? (kc++ % 2 ? 4 : 0) : o.b === 2 ? [2, 3, 2, 1][hc++ % 4] : [1, 3, 2, 0, 4][mc++ % 5];
    if (L === pL && o.t - pt < .3) L = (L + 2) % RH_N;
    notes.push({t: +o.t.toFixed(3), l: L}); pL = L; pt = o.t;
  });
  return notes;
}

/* =====================================================================
   🎵 리듬 스타 게임
   ===================================================================== */
const RH_JW = [.05, .09, .135];            // 판정 창(초): PERFECT · GREAT · GOOD
const RH_JN = ["PERFECT", "GREAT", "GOOD", "MISS"], RH_JC = ["#fff27a", "#7cf3ff", "#9dff9a", "#ff7b9c"], RH_JV = [1, .75, .4, 0];
const RH_LANE = ["#ff7ad9", "#6ee7ff", "#ffd166", "#6ee7ff", "#ff7ad9"], RH_KEYN = ["D", "F", "SPACE", "J", "K"];
const RH_SPD = [1, 10];
const RH_KEY_OF = {}; RH_KEYS.forEach((ks, l) => ks.forEach(k => { RH_KEY_OF[k] = l; }));   // 노트 속도 범위 (게임 중에도 − + 로 바꿔요)
const RH_PREF = () => { const d = {speed: 2.5, emo: 0, off: 0, tap: true, vol: .9, song: "star", diff: 0, gen: "all"}; let p; try { p = Object.assign(d, JSON.parse(localStorage.getItem("arcade.rh.pref")) || {}); } catch(e) { p = d; }
  p.speed = Math.max(RH_SPD[0], Math.min(RH_SPD[1], +p.speed || 2.5)); p.diff = Math.max(0, Math.min(RH_DIFF.length - 1, p.diff | 0)); return p; };
const rhSavePref = p => { try { localStorage.setItem("arcade.rh.pref", JSON.stringify(p)); } catch(e) {} };
const rhBestKey = sid => "arcade.rh.best." + sid;
const rhBests = sid => { try { return JSON.parse(localStorage.getItem(rhBestKey(sid))) || {}; } catch(e) { return {}; } };

let RH_QUICK = false;
{ const _again = NG.again; NG.again = function(){ RH_QUICK = this.gid === "rh"; return _again.apply(this, arguments); }; }
NG.defs.rh = () => {
  const SID = NG.sids[0], pref = RH_PREF();
  let W = 1280, H = 720, land = true, L = {};
  let phase = "menu", song = null, chart = [], buf = null, src = null, gain = null, T0 = 0, dur = 0, lead = 1.6;
  const Z5 = v => new Array(RH_N).fill(v);
  let notes = [], ptr = Z5(0), held = Z5(null), down = Z5(0), beam = Z5(0), ptrLane = {}, spdT = 0;
  let score = 0, combo = 0, maxC = 0, cnt = [0, 0, 0, 0], jSum = 0, jN = 0, totalJ = 1, life = 1000, judge = null, fx = [], emo = [], fail = false, endAt = 0;
  let lvNow = 1, preview = null, menuEl = null, avImgC = null, tapBuf = null, pausedAt = 0, bpm = 120, beat0 = 0, hitFlash = 0;
  const ac = () => getAC();

  /* ---- 화면 배치 ---- */
  function layout(sw, sh){
    land = sw/Math.max(1, sh) >= 1;
    if (land){ W = 1280; H = 720; L = {cx: 640, hy: 74, jy: 590, bw: 340, av: {x: 150, y: 470, h: 300}, cb: {x: 1120, y: 300}, pad: 652}; }
    else { W = 720; H = 1280; L = {cx: 360, hy: 300, jy: 1040, bw: 296, av: {x: 112, y: 300, h: 170}, cb: {x: 600, y: 270}, pad: 1150}; }
    L.s1 = .3/(1.3); L.lw = L.bw*2/RH_N;
  }
  const sAt = d => .3/(.3 + Math.max(-.22, d));
  const yOf = s => L.jy - (1 - s)/(1 - L.s1)*(L.jy - L.hy);
  const xOf = (lane, s) => L.cx + (lane - RH_N/2)*L.lw*s;
  const sOfY = y => 1 - (L.jy - y)*(1 - L.s1)/(L.jy - L.hy);

  /* ---- 그림 (한 번만 그려 두는 것들) ---- */
  function bgDraw(t){
    const gr = t.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#0b0628"); gr.addColorStop(.45, "#2a1468"); gr.addColorStop(.75, "#1d2a8a"); gr.addColorStop(1, "#0a0a2a");
    t.fillStyle = gr; t.fillRect(0, 0, W, H);
    if (phase === "play" && song){   // 곡마다 하늘빛이 달라요
      [[song.c[0], L.cx, L.hy + 40, W*.55, .55], [song.c[1], W*.08, H*.85, W*.45, .35], [song.c[1], W*.92, H*.85, W*.45, .35]].forEach(([c, x, y, r, al]) => {
        const rg = t.createRadialGradient(x, y, 4, x, y, r); rg.addColorStop(0, c); rg.addColorStop(1, "rgba(0,0,0,0)"); t.globalAlpha = al; t.fillStyle = rg; t.fillRect(0, 0, W, H); }); t.globalAlpha = 1; }
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
    // 길 (5줄)
    const yb = H + 40, sb = sOfY(yb), NL = RH_N;
    const road = t.createLinearGradient(0, L.hy, 0, H); road.addColorStop(0, "rgba(10,6,34,.55)"); road.addColorStop(.6, "rgba(16,9,48,.9)"); road.addColorStop(1, "rgba(8,5,26,.96)");
    t.fillStyle = road; t.beginPath(); t.moveTo(xOf(0, L.s1), L.hy); t.lineTo(xOf(NL, L.s1), L.hy); t.lineTo(xOf(NL, sb), yb); t.lineTo(xOf(0, sb), yb); t.closePath(); t.fill();
    for (let l = 0; l < NL; l++){ const g3 = t.createLinearGradient(0, L.hy, 0, L.jy); g3.addColorStop(0, "rgba(255,255,255,0)"); g3.addColorStop(1, RH_LANE[l] + (l === 2 ? "24" : "1c"));
      t.fillStyle = g3; t.beginPath(); t.moveTo(xOf(l, L.s1), L.hy); t.lineTo(xOf(l + 1, L.s1), L.hy); t.lineTo(xOf(l + 1, sb), yb); t.lineTo(xOf(l, sb), yb); t.closePath(); t.fill(); }
    for (let l = 0; l <= NL; l++){ const edge = l === 0 || l === NL;
      if (edge){ t.strokeStyle = "rgba(200,160,255,.35)"; t.lineWidth = 12; t.beginPath(); t.moveTo(xOf(l, L.s1), L.hy); t.lineTo(xOf(l, sb), yb); t.stroke(); }
      t.strokeStyle = edge ? "#d0b4ff" : "rgba(210,190,255,.32)"; t.lineWidth = edge ? 3.5 : 1.6;
      t.beginPath(); t.moveTo(xOf(l, L.s1), L.hy); t.lineTo(xOf(l, sb), yb); t.stroke(); }
    // 판정선 (빛나는 띠)
    const jx0 = xOf(0, 1) - 16, jx1 = xOf(NL, 1) + 16, jg = t.createLinearGradient(0, L.jy - 26, 0, L.jy + 26);
    jg.addColorStop(0, "rgba(255,170,240,0)"); jg.addColorStop(.5, "rgba(255,190,245,.42)"); jg.addColorStop(1, "rgba(255,170,240,0)");
    t.fillStyle = jg; t.fillRect(jx0, L.jy - 26, jx1 - jx0, 52);
    const jl = t.createLinearGradient(jx0, 0, jx1, 0); jl.addColorStop(0, "#ff9ee0"); jl.addColorStop(.5, "#fff"); jl.addColorStop(1, "#9be7ff");
    t.fillStyle = jl; t.fillRect(jx0, L.jy - 3, jx1 - jx0, 6);
    t.fillStyle = "rgba(255,255,255,.55)"; t.fillRect(jx0, L.jy - 9, jx1 - jx0, 1.5); t.fillRect(jx0, L.jy + 8, jx1 - jx0, 1.5);
    for (let l = 0; l <= NL; l++){ const x = xOf(l, 1); t.fillStyle = "#fff"; t.beginPath(); t.arc(x, L.jy, 5, 0, 7); t.fill(); }
    // 아바타 무대
    const a = L.av, sg = t.createRadialGradient(a.x, a.y + a.h*.5, 4, a.x, a.y + a.h*.5, a.h*.55); sg.addColorStop(0, "rgba(255,150,240,.7)"); sg.addColorStop(1, "rgba(255,150,240,0)");
    t.fillStyle = sg; t.beginPath(); t.ellipse(a.x, a.y + a.h*.5, a.h*.55, a.h*.16, 0, 0, 7); t.fill();
    t.strokeStyle = "rgba(255,200,250,.9)"; t.lineWidth = 3; t.beginPath(); t.ellipse(a.x, a.y + a.h*.5, a.h*.4, a.h*.1, 0, 0, 7); t.stroke();
    // 터치 패드 (키 이름)
    for (let l = 0; l < NL; l++){ const sp = sOfY(L.pad), x0 = xOf(l, sp), x1 = xOf(l + 1, sp), w = x1 - x0 - 10;
      const pg = t.createLinearGradient(0, L.pad - 32, 0, L.pad + 32); pg.addColorStop(0, "rgba(255,255,255,.13)"); pg.addColorStop(1, "rgba(255,255,255,.03)");
      t.fillStyle = pg; rrect(t, x0 + 5, L.pad - 32, w, 64, 16); t.fill();
      t.strokeStyle = RH_LANE[l] + "88"; t.lineWidth = 2; t.stroke();
      t.fillStyle = "rgba(255,255,255,.7)"; t.font = `${RH_KEYN[l].length > 1 ? 18 : 28}px "Jua",sans-serif`; t.textAlign = "center"; t.textBaseline = "middle"; t.fillText(RH_KEYN[l], (x0 + x1)/2, L.pad); }
  }
  /* 노트: 빛나는 보석 막대 (한 번 그려 두고 붙여요) */
  const noteSpr = (l, w) => G2.spr(`rhn5${l}${w}`, w + 24, 48, t => {
    const c = RH_LANE[l];
    t.shadowColor = c; t.shadowBlur = 16; t.fillStyle = c; rrect(t, 12, 11, w, 26, 13); t.fill(); t.shadowBlur = 0;
    const g = t.createLinearGradient(0, 11, 0, 37); g.addColorStop(0, "#ffffff"); g.addColorStop(.38, c); g.addColorStop(1, "rgba(40,10,90,.9)");
    t.fillStyle = g; rrect(t, 12, 11, w, 26, 13); t.fill();
    t.lineWidth = 2; t.strokeStyle = "rgba(255,255,255,.95)"; rrect(t, 13, 12, w - 2, 24, 12); t.stroke();
    t.fillStyle = "rgba(255,255,255,.75)"; rrect(t, 22, 14, w - 20, 5, 3); t.fill();
    t.fillStyle = "#fff"; t.beginPath(); t.moveTo(12 + w/2, 17); t.lineTo(12 + w/2 + 7, 24); t.lineTo(12 + w/2, 31); t.lineTo(12 + w/2 - 7, 24); t.closePath(); t.fill(); });
  /* 누르고 있을 때 패드 빛 */
  const padSpr = (l, w) => G2.spr(`rhp${l}${w}`, w, 64, t => { const g = t.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, RH_LANE[l]); g.addColorStop(1, "rgba(255,255,255,.15)");
    t.globalAlpha = .55; t.fillStyle = g; rrect(t, 0, 0, w, 64, 16); t.fill(); t.globalAlpha = 1; t.lineWidth = 3; t.strokeStyle = "#fff"; rrect(t, 1.5, 1.5, w - 3, 61, 15); t.stroke(); });
  /* 이모티콘도 그림으로 기억 (글자 그리기는 무거워요) */
  const emoSpr = (e, s) => G2.spr(`rhe${e}${s}`, s*1.3, s*1.3, t => { t.font = `${s}px ${EMOJI}`; t.textAlign = "center"; t.textBaseline = "middle"; t.fillText(e, s*.65, s*.68); });
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
    txt = String(txt); const cw = size*.6, w = [...txt].reduce((a, ch) => a + (ch === "," || ch === "." ? cw*.42 : cw), 0); let px = align === "center" ? x - w/2 : align === "right" ? x - w : x;
    for (const ch of txt){ const s = digSpr(ch, size, col), c = ch === "," || ch === "."; g.drawImage(s, px - size*(c ? .22 : .06), y - size*.6, s.w, s.h); px += c ? cw*.42 : cw; }
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
  const songOf = id => RH_SONG.get(id) || mine.find(m => "my:" + m.id === id);
  async function loadBuf(id){
    if (RH_BUF.has(id)) return rhKeep(id, RH_BUF.get(id));
    if (isMine(id)){ const v = await RHDB.get(id.slice(3)); if (!v) throw new Error("없음"); const b = await ac().decodeAudioData(v.data.slice(0)); return rhKeep(id, b); }
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
  const LVC = new Map();
  function lvOf(id, d){ if (isMine(id)) return [3, 6, 9, 12, 14][d]; const k = id + "|" + d; if (!LVC.has(k)){ const S = songOf(id); LVC.set(k, rhLv(chartFor(id, d), songDur(S), d)); } return LVC.get(k); }
  const genOf = S => S && S.gen ? RH_GEN[S.gen] : null;
  function cardHTML(s, B, cur){
    const b = RH_DIFF.map((_, d) => B[s.id + "|" + d]).filter(Boolean).sort((x, y) => y.best - x.best)[0];
    return `<button class="rh-song${s.id === cur ? " on" : ""}" data-rhs="${esc(s.id)}" data-g="${s.my ? "my" : s.gen || ""}" data-q="${esc((s.t + " " + (s.en || "") + " " + (s.a || "")).toLowerCase())}" style="--c1:${s.c[0]};--c2:${s.c[1]}">`
      + `<span class="jk">${s.e}</span><span class="tx"><b>${esc(s.t)}</b><small>${esc(s.sub)}</small></span>${b ? `<span class="bst rk-${b.rank}">${b.rank}</span>` : ""}${s.my ? `<span class="del" data-rhdel="${esc(s.id)}" title="지우기">🗑️</span>` : ""}</button>`;
  }
  function listItems(){
    return RH_SONGS.map(S => ({id: S.id, t: S.t, en: S.en, a: S.a, e: S.e, c: S.c, gen: S.gen, sub: `${genOf(S) ? genOf(S).n + " · " : ""}${S.bpm} BPM · ${fmtT(songDur(S))}`}))
      .concat(mine.map(m => ({id: "my:" + m.id, t: m.t, e: "🎧", c: ["#343a40", "#868e96"], sub: `🎧 내 노래 · ${fmtT(m.dur || 0)}`, my: 1})));
  }
  function sideHTML(){
    const B = rhBests(SID), cur = songOf(pref.song) ? pref.song : "star", S = songOf(cur), my = isMine(cur), G = my ? null : genOf(S);
    const c = my ? ["#343a40", "#868e96"] : S.c, dv = my ? fmtT(S.dur || 0) : fmtT(songDur(S));
    return `<div class="rh-jacket" style="--c1:${c[0]};--c2:${c[1]}"><span class="big">${my ? "🎧" : S.e}</span><div class="info"><b>${esc(S.t)}</b><small>${my ? "내 노래" : esc(S.en + " · " + S.a)}</small>`
      + `<div class="rh-tg">${G ? `<i>${G.n}</i>` : ""}${my ? "" : `<i>♩ ${S.bpm}</i>`}<i>⏱ ${dv}</i></div>${my ? "" : `<p>${esc(S.d)}</p>`}</div></div>`
      + `<div class="rh-k">난이도 <small>Lv.1 ~ Lv.15 · 숫자가 클수록 노트가 많고 빨라요</small></div>`
      + `<div class="rh-diff">${RH_DIFF.map((d, i) => { const b = B[cur + "|" + i]; return `<button data-rhd="${i}" class="${pref.diff === i ? "on" : ""}" style="--dc:${d.c}"><span class="de">${d.e}</span><span class="dn">${d.n}</span><b>${lvOf(cur, i)}</b><em>${b ? b.rank + (b.fc ? " · FC" : "") : "&nbsp;"}</em></button>`; }).join("")}</div>`;
  }
  function menuHTML(){
    const B = rhBests(SID), cur = songOf(pref.song) ? pref.song : "star", items = listItems();
    const gens = Object.keys(RH_GEN).filter(k => RH_SONGS.some(S => S.gen === k)), gc = k => RH_SONGS.filter(S => S.gen === k).length;
    const chips = [["all", `전체 ${RH_SONGS.length}`]].concat(gens.map(k => [k, `${RH_GEN[k].n} ${gc(k)}`]), [["my", `🎧 내 노래${mine.length ? " " + mine.length : ""}`]]);
    return `<div class="rh-in">
      <div class="rh-head"><div class="rh-logo">🎵 리듬 스타 <small>떨어지는 노트를 판정선에서 딱! · 키보드 <b>D F SPACE J K</b> 또는 화면 톡 · 게임 중 <b>− +</b> 로 속도 조절</small></div>
        <span class="rh-me">${avHTMLof(SID, {still: true, face: true})}</span></div>
      <div class="rh-body">
        <div class="rh-left">
          <div class="rh-tools"><div class="rh-chips">${chips.map(([k, n]) => `<button data-rhg="${k}" class="${(pref.gen || "all") === k ? "on" : ""}">${n}</button>`).join("")}</div>
            <input class="rh-q" id="rhQ" type="search" placeholder="🔍 노래 찾기" autocomplete="off"></div>
          <div class="rh-songs" id="rhList">${items.map(s => cardHTML(s, B, cur)).join("")}
            <label class="rh-song add" data-g="my"><input type="file" accept="audio/*" id="rhFile" hidden><span class="jk">➕</span><span class="tx"><b>내 노래 넣기</b><small>mp3 등 · 박자를 찾아 악보를 저절로 · 이 기기에만 저장</small></span></label>
          </div>
        </div>
        <div class="rh-side">
          <div id="rhSide">${sideHTML()}</div>
          <div class="rh-k">노트 속도 <b id="rhSpV">${pref.speed.toFixed(1)}</b><small>게임 중에도 오른쪽 위 − + 또는 키보드 − = 로 바꿔요</small></div>
          <input type="range" min="${RH_SPD[0]}" max="${RH_SPD[1]}" step=".5" value="${pref.speed}" data-rhp="speed">
          <details class="rh-more"><summary>⚙️ 더 맞추기 (이모티콘 · 박자 · 톡 소리)</summary>
            <div class="rh-k">내 캐릭터 이모티콘</div>
            <div class="rh-emo">${RH_EMO.map((x, i) => `<button data-rhe="${i}" class="${pref.emo === i ? "on" : ""}" title="${x.n}">${x.e.slice(0, 3).join("")}</button>`).join("")}</div>
            <div class="rh-k">박자 맞추기 <b id="rhOfV">${pref.off > 0 ? "+" : ""}${pref.off}ms</b> <small>노트가 늦게 맞으면 −, 빨리 맞으면 +</small></div>
            <input type="range" min="-150" max="150" step="10" value="${pref.off}" data-rhp="off">
            <label class="rh-chk"><input type="checkbox" data-rhp="tap" ${pref.tap ? "checked" : ""}> 칠 때 톡 소리</label></details>
          <button class="arc-btn p rh-go" data-rhgo>▶ 시작!</button>
          <div class="rh-msg" id="rhMsg"></div>
        </div>
      </div></div>`;
  }
  /* 장르·검색: 목록을 다시 만들지 않고 숨기기만 해요 (가볍게) */
  function applyFilter(){
    if (!menuEl) return; const g = pref.gen || "all", q = (($("#rhQ") || {}).value || "").trim().toLowerCase();
    menuEl.querySelectorAll("#rhList .rh-song").forEach(el => {
      if (el.classList.contains("add")){ el.hidden = !!q || !(g === "all" || g === "my"); return; }
      el.hidden = !((g === "all" || el.dataset.g === g) && (!q || (el.dataset.q || "").includes(q))); });
  }
  function showMenu(){
    phase = "menu"; NG.ended = false;
    if (!menuEl){ menuEl = document.createElement("div"); menuEl.className = "rh-menu";
      ["pointerdown", "pointerup", "touchstart", "touchend", "dblclick"].forEach(t => menuEl.addEventListener(t, e => e.stopPropagation(), {passive: true}));
      menuEl.addEventListener("click", onMenuClick); menuEl.addEventListener("input", onMenuInput); menuEl.addEventListener("change", onMenuChange);
      $("#ngStage").appendChild(menuEl); }
    menuEl.hidden = false; menuEl.innerHTML = menuHTML(); applyFilter();
    const on = menuEl.querySelector(".rh-song.on"); if (on && !on.hidden) on.scrollIntoView({block: "nearest"});
  }
  const refreshSide = () => { const el = $("#rhSide"); if (el) el.innerHTML = sideHTML(); };
  const msg = (t, bad) => { const m = $("#rhMsg"); if (m){ m.textContent = t; m.classList.toggle("bad", !!bad); } };
  async function pick(id, play){
    pref.song = id; rhSavePref(pref); sel = id;
    if (menuEl && !menuEl.hidden && menuEl.querySelector("#rhList")){   // 고를 때마다 화면 전체를 다시 만들지 않아요
      menuEl.querySelectorAll(".rh-song.on").forEach(el => el.classList.remove("on"));
      menuEl.querySelectorAll(".rh-song[data-rhs]").forEach(el => { if (el.dataset.rhs === id) el.classList.add("on"); });
      refreshSide(); }
    else showMenu();
    msg(RH_BUF.has(id) ? "" : "🎼 노래 준비 중… (처음 한 번만 몇 초 걸려요)");
    try { const b = await loadBuf(id); if (sel !== id || phase !== "menu") return; msg("");
      const S = songOf(id); let from = 0; if (!isMine(id)){ const ev = rhPlan(S), c = ev.sec.find(x => x.type === "c"); from = c ? c.s*60/S.bpm/4 : 0; } else from = b.duration*.35;
      if (play !== false) startPreview(b, from);
    } catch(e) { msg("노래를 불러오지 못했어요 😢 다른 곡을 골라 주세요", true); }
  }
  function onMenuClick(e){
    const t = e.target.closest("[data-rhs],[data-rhd],[data-rhe],[data-rhgo],[data-rhdel],[data-rhg]"); if (!t) return;
    getAC();
    if (t.dataset.rhdel){ e.preventDefault(); e.stopPropagation(); const id = t.dataset.rhdel; if (!confirm("이 노래를 이 기기에서 지울까요?")) return;
      RHDB.del(id.slice(3)).then(async () => { RH_BUF.delete(id); mine = await RHDB.all().catch(() => []); if (pref.song === id) pref.song = "star"; showMenu(); }); return; }
    if (t.dataset.rhg){ pref.gen = t.dataset.rhg; rhSavePref(pref); menuEl.querySelectorAll("[data-rhg]").forEach(b => b.classList.toggle("on", b === t)); applyFilter(); return; }
    if (t.dataset.rhs){ if (t.dataset.rhs === sel && preview) return; pick(t.dataset.rhs); return; }
    if (t.dataset.rhd){ pref.diff = +t.dataset.rhd; rhSavePref(pref); menuEl.querySelectorAll("[data-rhd]").forEach(b => b.classList.toggle("on", b === t)); return; }
    if (t.dataset.rhe){ pref.emo = +t.dataset.rhe; rhSavePref(pref); menuEl.querySelectorAll("[data-rhe]").forEach(b => b.classList.toggle("on", b === t)); return; }
    if (t.dataset.rhgo !== undefined) start();
  }
  function onMenuInput(e){
    if (e.target.id === "rhQ"){ applyFilter(); return; }
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
      rhKeep("my:" + id, b); mine = await RHDB.all(); for (const m of mine) if (m.id === id) m.on = on;
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
    song = S; chart = chartFor(id, pref.diff, buf); dur = buf.duration; lvNow = lvOf(id, pref.diff);
    bpm = isMine(id) ? 120 : S.bpm; beat0 = 0;
    notes = chart.map(n => ({t: n.t, l: n.l, e: n.e, st: 0, hs: 0}));
    totalJ = Math.max(1, notes.length + notes.filter(n => n.e).length);
    ptr = Z5(0); held = Z5(null); down = Z5(0); beam = Z5(0); ptrLane = {}; spdT = 0;
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
    else { if (combo >= 10) burst(["💦", "😵"], 2); combo = 0; life -= [30, 40, 55, 65, 75][pref.diff]; }
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
  const laneAt = x => Math.max(0, Math.min(RH_N - 1, Math.floor((x - (L.cx - L.bw))/L.lw)));

  /* ---- 그리기 ---- */
  function drawPlay(g){
    const tt = clock();
    G2.bg(g, `rhbg${W}${song.id}`, W, H, bgDraw);
    // 박자에 맞춰 반짝이는 지평선 빛 + 이퀄라이저
    const bph = tt > 0 ? (tt*bpm/60) % 1 : 0, pulse = Math.pow(1 - bph, 3);
    g.globalAlpha = .35 + pulse*.55; g.drawImage(glowSpr(), L.cx - 300, L.hy - 110, 600, 260); g.globalAlpha = 1;
    const eqY = land ? L.hy + (L.jy - L.hy)*.42 : L.hy + 134, n = land ? 26 : 14, bw = (land ? 560 : 360)/n;
    g.fillStyle = "rgba(200,160,255,.55)";
    for (let i = 0; i < n; i++){ const k = Math.abs(i - (n - 1)/2)/(n/2), h = (8 + 50*pulse*(1 - k*.6))*(.6 + .4*Math.abs(Math.sin(i*1.7 + tt*3))); g.fillRect(L.cx - n*bw/2 + i*bw + 2, eqY - h - 140, bw - 4, h); }
    // 흐르는 바닥 줄
    g.strokeStyle = "rgba(190,160,255,.35)"; g.lineWidth = 2;
    for (let i = 0; i < 6; i++){ const d = ((i/6) - (tt/lead)*.6 % (1/6) + 1) % 1, s = sAt(d), y = yOf(s); g.beginPath(); g.moveTo(xOf(0, s), y); g.lineTo(xOf(RH_N, s), y); g.stroke(); }
    // 누른 줄 빛
    for (let l = 0; l < RH_N; l++){ if (down[l]) beam[l] = 1; else beam[l] *= .82; if (beam[l] < .03) continue;
      g.globalAlpha = beam[l]; const s0 = sAt(.55), y0 = yOf(s0);
      g.save(); g.beginPath(); g.moveTo(xOf(l, s0), y0); g.lineTo(xOf(l + 1, s0), y0); g.lineTo(xOf(l + 1, 1), L.jy); g.lineTo(xOf(l, 1), L.jy); g.closePath(); g.clip();
      g.drawImage(beamSpr(l), xOf(l, 1), y0, L.lw, L.jy - y0); g.restore(); g.globalAlpha = 1; }
    // 누른 패드 빛
    { const sp = sOfY(L.pad); for (let l = 0; l < RH_N; l++) if (beam[l] > .05){ const x0 = xOf(l, sp) + 5, w = Math.round(xOf(l + 1, sp) - xOf(l, sp) - 10); g.globalAlpha = beam[l]; g.drawImage(padSpr(l, w), x0, L.pad - 32, w, 64); g.globalAlpha = 1; } }
    // 노트
    for (let l = 0; l < RH_N; l++) while (ptr[l] < notes.length && notes[ptr[l]].st >= 2 && notes[ptr[l]].t < tt - 1) ptr[l]++;
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
          g.fillStyle = nt.st === 1 ? "rgba(255,255,255,.6)" : nt.st === 3 ? "rgba(120,120,140,.4)" : RH_LANE[nt.l] + "80";
          g.beginPath(); g.moveTo(xOf(nt.l + m, sh), yh); g.lineTo(xOf(nt.l + 1 - m, sh), yh); g.lineTo(xOf(nt.l + 1 - m, st), yt); g.lineTo(xOf(nt.l + m, st), yt); g.closePath(); g.fill();
          if (nt.st !== 3){ g.strokeStyle = "rgba(255,255,255,.75)"; g.lineWidth = 3; g.beginPath(); g.moveTo(xOf(nt.l + .5, sh), yh); g.lineTo(xOf(nt.l + .5, st), yt); g.stroke(); }
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
    for (let l = 0; l < RH_N; l++) if (held[l]){ const r = ringSpr(l), w = L.lw*(1.1 + .1*Math.sin(tt*30)); g.drawImage(r, xOf(l + .5, 1) - w/2, L.jy - w/4, w, w/2); }
    // 판정 글씨
    if (judge && judge.t > 0){ const k = judge.t > 16 ? 1 + (judge.t - 16)*.05 : 1; g.save(); g.globalAlpha = Math.min(1, judge.t/8);
      g.translate(L.cx, L.jy - (land ? 150 : 210)); g.scale(k, k); outlined(g, RH_JN[judge.j], 0, 0, land ? 54 : 58, RH_JC[judge.j], "rgba(40,10,90,.9)"); g.restore(); judge.t--; }
    drawChar(g, tt, bph);
    drawHud(g, tt);
    // 시작 전 카운트
    if (tt < 0){ const c = Math.ceil(-tt); outlined(g, tt < -1.6 ? "READY?" : c >= 1 ? String(c) : "GO!", L.cx, L.hy + (L.jy - L.hy)*.45, 90, "#fff", "rgba(80,20,150,.9)"); }
    if (NG.paused){ g.fillStyle = "rgba(10,5,30,.6)"; g.fillRect(0, 0, W, H); outlined(g, "⏸ 잠깐 멈춤", W/2, H/2 - 30, 70, "#fff"); outlined(g, "화면을 톡 하거나 P·스페이스바를 누르면 이어서 해요", W/2, H/2 + 40, 26, "#ffe7a8"); outlined(g, "오른쪽 위 − + 로 노트 속도를 바꿀 수 있어요", W/2, H/2 + 82, 22, "#d9ccff"); }
  }
  function drawChar(g, tt, bph){
    const a = L.av, hop = tt > 0 && !fail ? Math.sin(Math.min(1, bph*2)*Math.PI) : 0, sq = 1 - hop*.04;
    if (avImgC){ const w = avImgC.w, h = avImgC.h, tilt = tt > 0 ? (Math.floor(tt*bpm/60) % 2 ? 1 : -1)*.06*hop : 0;
      g.save(); g.translate(a.x, a.y + a.h*.5 - hop*18); g.rotate(tilt); g.scale(1/sq, sq); g.drawImage(avImgC, -w/2, -h, w, h); g.restore(); }
    else faceAt(g, SID, a.x, a.y, a.h*.3, "#ff8ed1");
    if (fail) G2.emo(g, "😵", a.x + a.h*.22, a.y - a.h*.42, 44);
    for (let i = emo.length - 1; i >= 0; i--){ const q = emo[i]; q.x += q.vx; q.y += q.vy; q.vy += .09; q.vx *= .99; if (--q.t <= 0){ emo.splice(i, 1); continue; }
      g.globalAlpha = Math.min(1, q.t/20); const es = emoSpr(q.e, q.s); g.drawImage(es, q.x - es.w/2, q.y - es.h/2, es.w, es.h); }
    g.globalAlpha = 1;
  }
  const spdBox = () => ({x: W - 214, y: 132, w: 196, h: 56});
  function setSpeed(v){ const n = Math.max(RH_SPD[0], Math.min(RH_SPD[1], Math.round(v*2)/2)); if (n === pref.speed){ spdT = 20; return; } pref.speed = n; lead = 2.6/n; spdT = 50; rhSavePref(pref); }
  function drawHud(g){
    const x0 = land ? 26 : 22;
    outlined(g, `${song.e} ${song.t}`, x0, 30, 24, "#fff", "rgba(40,10,90,.9)", "left");
    outlined(g, `${RH_DIFF[pref.diff].e} ${RH_DIFF[pref.diff].n} · Lv.${lvNow}`, x0, 62, 20, RH_DIFF[pref.diff].c, "rgba(40,10,90,.9)", "left");
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
    // ⚡ 노트 속도 (게임 중에도 − + 로 바꿔요)
    const SB = spdBox();
    G2.put(g, G2.spr("rhspdbg", SB.w, SB.h, t => { t.fillStyle = "rgba(20,10,60,.72)"; rrect(t, 0, 0, SB.w, SB.h, SB.h/2); t.fill(); t.strokeStyle = "rgba(200,170,255,.6)"; t.lineWidth = 2; rrect(t, 1, 1, SB.w - 2, SB.h - 2, SB.h/2 - 1); t.stroke();
      [[SB.h/2, "−"], [SB.w - SB.h/2, "+"]].forEach(([x, ch]) => { t.fillStyle = "rgba(255,255,255,.16)"; t.beginPath(); t.arc(x, SB.h/2, SB.h/2 - 5, 0, 7); t.fill(); t.fillStyle = "#fff"; t.font = `34px "Jua",sans-serif`; t.textAlign = "center"; t.textBaseline = "middle"; t.fillText(ch, x, SB.h/2 + 2); }); }), SB.x, SB.y);
    if (spdT > 0) spdT--;
    outlined(g, "속도", SB.x + SB.w/2, SB.y + 14, 15, "#d9ccff", "rgba(20,10,60,.9)");
    num(g, pref.speed.toFixed(1), SB.x + SB.w/2, SB.y + 36, 26, spdT ? "#ffe38a" : "#fff", "center");
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
      for (let l = 0; l < RH_N; l++){ const h = held[l]; if (h && h.st === 1 && tt >= h.e){ h.st = 2; h.hs = 1; held[l] = null; addJ(0, l); } }
      for (let i = Math.min(...ptr); i < notes.length; i++){ const n = notes[i]; if (n.t > tt) break;
        if (n.st === 0 && tt - n.t > RH_JW[2]){ n.st = 3; addJ(3); if (n.e) addJ(3); } }
      if (fail && performance.now() > endAt) finish();
      else if (!fail && tt > dur + .6) finish();
    },
    draw(g){
      if (phase === "menu"){ G2.bg(g, `rhbg${W}`, W, H, bgDraw); g.fillStyle = "rgba(8,4,26,.55)"; g.fillRect(0, 0, W, H); return; }
      drawPlay(g);
    },
    hud(){ return phase === "play" ? `🎵 <b>${esc(song.t)}</b> · ${RH_DIFF[pref.diff].e} Lv.${lvNow}` : "🎵 노래를 골라요"; },
    key(code, isDown, e){
      if (phase !== "play") return false;
      if (code === "KeyP" || code === "Enter" || code === "Backspace"){ if (isDown && !(e && e.repeat)) NG.paused ? resume() : pause(); return true; }
      const sp = {Minus: -.5, NumpadSubtract: -.5, BracketLeft: -.5, PageDown: -.5, Equal: .5, NumpadAdd: .5, BracketRight: .5, PageUp: .5}[code];
      if (sp){ if (isDown) setSpeed(pref.speed + sp); return true; }
      const l = RH_KEY_OF[code]; if (l === undefined) return false;
      if (NG.paused){ if (isDown && code === "Space") resume(); return true; }
      const ts = e && e.timeStamp ? e.timeStamp : undefined;
      if (isDown){ if (!(e && e.repeat)) press(l, clock(ts)); } else release(l, clock(ts));
      return true;
    },
    down(x, y, id, e){
      if (phase !== "play") return;
      const SB = spdBox();
      if (y >= SB.y - 6 && y <= SB.y + SB.h + 6 && x >= SB.x - 6 && x <= SB.x + SB.w + 6){ setSpeed(pref.speed + (x < SB.x + SB.w/2 ? -.5 : .5)); return; }   // 멈춤 중에도 속도는 바꿀 수 있어요
      if (NG.paused){ resume(); return; }
      if (x > W - 80 && y > 66 && y < 128){ pause(); return; }
      const l = laneAt(x); ptrLane[id] = l; press(l, clock(e && e.timeStamp));   // 손가락이 닿은 '그 순간'으로 판정
    },
    move(x, y, id, e){
      if (phase !== "play" || NG.paused || ptrLane[id] === undefined) return;
      const l = laneAt(x); if (l !== ptrLane[id] && !held[ptrLane[id]]){ const ts = clock(e && e.timeStamp); if (!Object.entries(ptrLane).some(([k, v]) => v === ptrLane[id] && k != id)) release(ptrLane[id], ts); ptrLane[id] = l; press(l, ts); }
    },
    up(x, y, id, e){ if (ptrLane[id] === undefined) return; const l = ptrLane[id]; delete ptrLane[id]; if (!Object.values(ptrLane).includes(l)) release(l, clock(e && e.timeStamp)); }
  };
  function pause(){ if (NG.paused || phase !== "play") return; NG.paused = true; pausedAt = performance.now(); try { ac().suspend(); } catch(e) {} for (let l = 0; l < RH_N; l++){ down[l] = 0; } }
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
