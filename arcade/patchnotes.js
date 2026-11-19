/* =====================================================================
   📢 새 소식 (패치노트)
   - 오락실을 고칠 때마다 아래 NEWS 맨 위에 한 덩어리를 더해요 (id는 날짜+순서, 겹치지 않게)
   - 아이가 로그인했을 때 아직 못 본 소식이 있으면 한 번 크게 보여 줘요 (못 본 게 여러 개면 모아서)
   - 위쪽 📢 새 소식 단추로 언제든 다시 볼 수 있어요 (안 본 소식이 있으면 빨간 점)

   ✏️ 아이들이 알아보기 쉽게 쓰기
   - 한 줄 제목(무엇이 생겼나/고쳐졌나) + 한 줄 설명(어떻게 쓰나). 어려운 말·영어·숫자 설정값은 빼요
   - 한 번에 3~5개까지. 가장 신나는 것부터
   - k: "new"(새로 생겼어요) · "up"(더 좋아졌어요) · "fix"(고쳤어요)
   ===================================================================== */
const NEWS = [
<<<<<<< HEAD
  {id: "2026-11-19f", d: "11월 19일", e: "🐾", t: "랜덤 디펜스가 쉬워지고 새 동물 11마리!", items: [
    ["new", "🦣", "높은 등급 새 동물 11마리", "매머드·그리폰·강철 코뿔소·서리 늑대·천둥새·달토끼·히드라·태양 봉황·대지 거인·시간룡·은하 구미호가 왔어요! 🧪 조합표에서 만드는 법을 찾아봐요."],
    ["up", "😊", "랜덤 디펜스가 쉬워졌어요", "몬스터가 덜 튼튼해지고, 몬스터가 더 많이 쌓여도 버틸 수 있어요. 보스는 덜 단단하고, 잡을 시간도 더 길어졌어요."],
    ["fix", "👀", "구경하기 화면이 딱 맞아요", "구경할 때 처음엔 판 전체가 화면에 딱 맞게 보여요. 크게 보기를 누르면 고른 친구 마당이 가운데에 나와요."]
  ], tip: "🛡️ 서포터 동물을 길 옆에 두면 보스를 훨씬 쉽게 잡아요!"},
  {id: "2026-11-19e", d: "11월 19일", e: "👀", t: "구경하기가 끊기지 않아요", items: [
    ["fix", "📡", "구경하다 튕기지 않아요", "와이파이가 잠깐 흔들려도 구경하던 화면이 그대로 있고, 저절로 다시 이어져요."],
    ["up", "🔁", "다음 판도 이어서 구경", "친구들이 ‘한 판 더’를 하면 구경하던 친구도 새 판으로 바로 따라가요."],
    ["up", "🐾", "같이 하는 친구도 더 부드럽게", "한 판이 끝난 뒤 다음 판이 뚝뚝 끊기던 문제를 고쳤어요."]
  ]},
=======
  {id: "2026-11-19e", d: "11월 19일", e: "♟️", t: "장기·체스·오목·당구가 생겼어요!", items: [
    ["new", "🀄", "장기", "초와 한의 한판 승부! 말을 누르면 갈 수 있는 곳이 초록 점으로 보여요. 장군을 받으면 꼭 막아요."],
    ["new", "♟️", "체스", "킹을 체크메이트하면 승리! 폰이 끝까지 가면 저절로 퀸이 돼요."],
    ["new", "⚫", "오목", "돌 다섯 개를 먼저 한 줄로! 실수하지 않게 두 번 톡톡 눌러야 놓여요."],
    ["new", "🎱", "당구", "판을 끌어 방향을 정하고 힘 막대를 당겼다 놓아요. 공을 넣으면 한 번 더, 9번 공은 3점!"],
    ["new", "🌐", "친구 기기와도 대결", "한 기기에서 둘이, 컴퓨터와, 또는 내 기기와 친구 기기로 대결해요. 이기면 랭킹 1승!"]
  ], tip: "🤝 지더라도 “잘했어!” 한마디. 무르기는 한 기기에서 할 때만 돼요."},
>>>>>>> 54ddfe2 (♟️ 보드 게임 4종 추가: 장기·체스·오목·당구 (둘이·컴퓨터·다른 기기 대결) · 보드 게임은 기기끼리 연결이 안 되면 Firebase 쪽지(다리)로 한 수씩 주고받기 · 📢 새 소식)
  {id: "2026-11-19d", d: "11월 19일", e: "⬆️", t: "강화 단추가 잘 눌려요!", items: [
    ["fix", "⬆️", "랜덤 디펜스 강화가 잘 눌려요", "동물을 고른 채로 ⬆️ 강화를 누르면 단추가 가려져서 안 눌리던 문제를 고쳤어요. 이제 강화판이 열리면 맨 앞에 보여요."],
    ["fix", "👆", "도감·조합 창 단추도 한 번에", "도감이나 조합 창을 연 채로 강화·새 줄·합치기를 눌러도 금이 바뀌는 순간 안 눌리던 문제를 고쳤어요."],
    ["fix", "👕", "아바타가 잘 저장돼요", "아바타를 바꿨는데 원래대로 돌아가던 문제를 고쳤어요. 인터넷이 잠깐 끊겨도 꼭 저장돼요."]
  ], tip: "🐾 강화는 금을 많이 써요. 새 줄과 강화 중에 잘 골라서 써 봐요!"},
  {id: "2026-11-19c", d: "11월 19일", e: "🎮", t: "게임하면서 말로 이야기해요!", items: [
    ["new", "🎙️", "게임 화면에서 바로 음성 채팅", "게임 중에 왼쪽의 🎙️ 단추를 누르면 바로 친구들과 말할 수 있어요. 채팅 칸에 가지 않아도 돼요!"],
    ["new", "🎮", "같은 게임방 친구끼리만", "온라인 방에 들어가면 ‘방 친구들과 말로 이야기’ 단추가 생겨요. 같이 하는 친구들끼리만 이야기하고, 게임이 끝나면 저절로 나와요."],
    ["up", "🔉", "친구 말이 더 잘 들려요", "친구가 말할 때는 게임 소리가 살짝 작아져요. 말이 끝나면 다시 원래대로!"]
  ], tip: "🎧 이어폰을 끼면 소리가 울리지 않아요. 게임하면서도 고운 말 약속!"},
  {id: "2026-11-19b", d: "11월 19일", e: "🎁", t: "선생님 코인이 바로 들어와요", items: [
    ["fix", "🪙", "선생님이 주신 코인", "선생님이 코인이나 상을 주셨는데 가끔 안 들어오던 문제를 고쳤어요. 이제 게임하는 중에도 바로 들어와요!"]
  ], tip: "🎁 수업 시간에 멋진 모습을 보여 주면 선생님이 코인을 주실 수도 있어요!"},
  {id: "2026-11-19a", d: "11월 19일", e: "🎙️", t: "친구랑 말로 이야기해요!", items: [
    ["new", "🎙️", "음성 채팅이 생겼어요", "💬 채팅 맨 위 ‘🎙️ 참여하기’를 누르고 마이크를 허용하면 친구들과 말로 이야기해요. 게임하면서도 계속 들려요!"],
    ["fix", "💬", "채팅이 바로바로 보여요", "보낸 말이 늦게 뜨거나, 순서가 뒤죽박죽이거나, 시간이 다르게 찍히던 문제를 고쳤어요."],
    ["fix", "⌨️", "글자가 깔끔하게 쳐져요", "한글을 치고 바로 보내도 마지막 글자가 남거나 두 번 보내지지 않아요."],
    ["up", "🪙", "코인이 절대 안 사라져요", "인터넷이 잠깐 끊겨도 번 코인은 기기에 먼저 적어 두었다가 꼭 저장해요."],
    ["new", "👀", "랜덤 디펜스 구경하기", "친구들이 하고 있는 방을 누르면 들어가서 구경할 수 있어요. 친구를 따라다니며 볼 수도 있어요!"],
    ["fix", "👀", "구경하기가 잘 돼요", "친구가 판을 막 끝냈을 때 눌러도 ‘꽉 찼어요’가 뜨지 않고, 다음 판이 시작되면 바로 보여 줘요."],
    ["up", "🐾", "랜덤 디펜스 큰 마당", "같이 할 때 내 마당을 크게 보고, 손가락으로 끌어서 맵을 움직여요. 작은 지도도 생겼어요!"]
  ], tip: "🎧 음성 채팅은 이어폰을 끼면 소리가 울리지 않아요. 고운 말 약속은 음성 채팅에서도 똑같아요!"},
  {id: "2026-11-18a", d: "11월 18일", e: "👹", t: "보스가 100단계로!", items: [
    ["new", "👹", "‘불가능한 보스 잡기’", "용사 대모험이 새 이름으로 바뀌었어요. 보스가 100단계까지 있어요. 어디까지 갈 수 있을까요?"],
    ["new", "📥", "랜덤 디펜스 대기 줄", "뽑기 대신 1초마다 동물이 줄을 서서 와요. 땅(🌳🌊☁️) 덱을 짜고, 친구에게 동물을 선물할 수도 있어요."],
    ["new", "🐙", "새 동물 크라켄", "바다·하늘 동물 5종과 전설의 크라켄이 새로 왔어요."],
    ["up", "🔁", "튕겨도 다시 들어가요", "같이 하다가 끊겨도 다시 들어가면 내 동물과 금이 그대로 있어요."]
  ]},
  {id: "2026-11-17a", d: "11월 17일", e: "🏪", t: "상점과 연구소가 열렸어요", items: [
    ["new", "🏪", "코인 상점 · 동물 연구소", "코인으로 동물을 영원히 강하게 만들 수 있어요."],
    ["new", "🛡️", "장비 강화 · 펫", "무기·갑옷을 강화하면 모습이 바뀌고, 따라다니며 도와주는 펫도 생겼어요."],
    ["new", "🔇", "소리 끄기 단추", "위쪽 🔊 단추로 모든 소리를 한 번에 끄고 켤 수 있어요."],
    ["fix", "💾", "산 아바타가 그대로", "코인으로 산 옷·장신구가 사라지던 문제를 고쳤어요."]
  ]}
];

const NEWSUI = {
  K: {new: ["새로 생겼어요", "nw-new"], up: ["더 좋아졌어요", "nw-up"], fix: ["고쳤어요", "nw-fix"]},
  key(){ return `${KEY}.news.${(Store.cls || {}).cid}.${ARC.me}`; },
  seen(){ try { return localStorage.getItem(this.key()) || ""; } catch(e){ return ""; } },
  mark(){ try { localStorage.setItem(this.key(), NEWS[0].id); } catch(e) {} this.dot(); },
  /* 아직 안 본 소식들 (처음 들어온 친구는 가장 최근 날짜의 소식들) */
  unseen(){ const s = this.seen(), i = s ? NEWS.findIndex(n => n.id === s) : -1; return i < 0 ? NEWS.filter(n => n.d === NEWS[0].d).slice(0, 3) : NEWS.slice(0, i).slice(0, 3); },
  card(n, big){
    return `<section class="nw-sec${big ? " big" : ""}">
      <div class="nw-hd"><span class="nw-e">${n.e}</span><div><small>${esc(n.d)} 업데이트</small><b>${esc(n.t)}</b></div></div>
      <ul class="nw-list">${n.items.map(([k, e, t, s]) => { const K = this.K[k] || this.K.up; return `<li><span class="nw-ie">${e}</span><div><span class="nw-tag ${K[1]}">${K[0]}</span><b>${esc(t)}</b><p>${esc(s)}</p></div></li>`; }).join("")}</ul>
      ${n.tip ? `<p class="nw-tip">${esc(n.tip)}</p>` : ""}</section>`;
  },
  open(list, auto){
    list = list && list.length ? list : NEWS.slice(0, 1);
    const old = auto ? [] : NEWS.filter(n => !list.includes(n));
    let m = $("#mdNews");
    if (!m){ m = document.createElement("div"); m.className = "arc-modal"; m.id = "mdNews"; m.hidden = true; document.body.appendChild(m);
      m.addEventListener("pointerdown", e => { if (e.target === m) this.close(); }); }
    m.innerHTML = `<div class="nw-box" role="dialog" aria-label="새 소식">
      <div class="nw-top"><div class="nw-big">${auto ? "🎉" : "📢"}</div><h2>${auto ? "새 소식이 있어요!" : "오락실 새 소식"}</h2><p>${auto ? "오락실이 이렇게 바뀌었어요 👀" : "그동안 바뀐 것들을 모아 봤어요"}</p><button class="nw-x" data-nw="x" title="닫기">✕</button></div>
      <div class="nw-body">${list.map((n, i) => this.card(n, i === 0)).join("")}
        ${old.length ? `<details class="nw-old"><summary>📜 지난 소식 보기 (${old.length})</summary>${old.map(n => this.card(n)).join("")}</details>` : ""}</div>
      <div class="nw-foot"><button class="arc-btn p nw-ok" data-nw="ok">알겠어요! 👍</button><small>📢 위쪽 <b>새 소식</b> 단추로 언제든 다시 볼 수 있어요 · 만든 사람 효석쌤</small></div></div>`;
    m.onclick = e => { if (e.target.closest("[data-nw]")) this.close(); };
    m.hidden = false; this.mark();
    try { tone(660, 990, .1, "triangle", .08); tone(990, 1320, .12, "triangle", .08, .1); } catch(e) {}
  },
  close(){ const m = $("#mdNews"); if (m) m.hidden = true; },
  /* 로그인하면: 다른 창(아바타 만들기·대결 신청 등)이 다 닫힌 다음에 보여 줘요 */
  auto(){
    clearTimeout(this.t); let n = 0;
    const go = () => {
      if (ARC.me === null || ARC.me === undefined || $("#scrHome").hidden) return;
      const L = this.unseen(); if (!L.length) return this.dot();
      const busy = ARC.busy || $$(".arc-modal").some(x => !x.hidden && x.id !== "mdNews");
      if (busy){ if (++n < 120) this.t = setTimeout(go, 1500); return; }
      this.open(L, true);
    };
    this.t = setTimeout(go, 700);
  },
  dot(){ const b = $("#hmNews"); if (b) b.classList.toggle("nw-on", ARC.me !== null && ARC.me !== undefined && this.unseen().length > 0 && this.seen() !== NEWS[0].id); },
  btn(){
    const bar = $("#scrHome .arc-topb"); if (!bar || $("#hmNews")) return this.dot();
    const b = document.createElement("button"); b.className = "arc-btn"; b.id = "hmNews"; b.title = "새 소식";
    b.innerHTML = `<span class="ic">📢</span><span class="lb"> 새 소식</span>`;
    b.onclick = () => { const L = this.unseen(); this.open(this.seen() === NEWS[0].id ? NEWS.slice(0, 1) : L, false); };
    const ref = bar.querySelector(".arc-refresh"); bar.insertBefore(b, ref || null); this.dot();
  }
};

(function(){
  const st = document.createElement("style"); st.textContent = `
#hmNews{position:relative}
#hmNews.nw-on::after{content:"";position:absolute;top:5px;right:6px;width:9px;height:9px;border-radius:50%;background:#ff4d6d;box-shadow:0 0 0 2px #1b1340;animation:nwDot 1.4s ease-in-out infinite}
@keyframes nwDot{50%{transform:scale(1.35)}}
#mdNews{z-index:960}
.nw-box{position:relative;width:min(460px,100%);max-height:min(88vh,760px);display:flex;flex-direction:column;background:linear-gradient(180deg,#241a5c 0,#16113a 220px);border:1px solid rgba(255,255,255,.14);border-radius:26px;box-shadow:0 24px 70px rgba(0,0,0,.6);color:#fff;overflow:hidden;animation:nwIn .28s cubic-bezier(.2,1.3,.4,1)}
@keyframes nwIn{from{opacity:0;transform:translateY(18px) scale(.96)}to{opacity:1;transform:none}}
.nw-top{position:relative;text-align:center;padding:22px 20px 12px}
.nw-big{font-size:46px;line-height:1;margin-bottom:6px;animation:nwBob 1.6s ease-in-out infinite}
@keyframes nwBob{50%{transform:translateY(-5px) rotate(-6deg)}}
.nw-top h2{margin:0;font:400 26px "Jua",sans-serif;color:#ffe066;letter-spacing:.5px}
.nw-top p{margin:4px 0 0;font:14px "Gowun Dodum",sans-serif;color:#cfc6f5}
.nw-x{position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:50%;border:0;background:rgba(255,255,255,.1);color:#fff;font-size:15px;cursor:pointer}
.nw-body{flex:1;min-height:0;overflow-y:auto;padding:4px 16px 8px;overscroll-behavior:contain}
.nw-sec{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-radius:20px;padding:14px 14px 10px;margin-bottom:12px}
.nw-sec.big{background:rgba(255,255,255,.08);border-color:rgba(255,224,102,.35)}
.nw-hd{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.nw-e{flex:none;width:44px;height:44px;border-radius:14px;background:rgba(255,224,102,.14);display:grid;place-items:center;font-size:25px}
.nw-hd small{display:block;font:12px "Gowun Dodum",sans-serif;color:#a99fd8}
.nw-hd b{display:block;font:400 19px "Jua",sans-serif;color:#fff;line-height:1.2}
.nw-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px}
.nw-list li{display:flex;gap:11px;align-items:flex-start;padding:9px 4px;border-top:1px solid rgba(255,255,255,.06)}
.nw-list li:first-child{border-top:0}
.nw-ie{flex:none;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.08);display:grid;place-items:center;font-size:18px}
.nw-list b{display:block;font:400 16.5px "Jua",sans-serif;color:#fff;margin:2px 0 1px}
.nw-list p{margin:0;font:14px/1.5 "Gowun Dodum",sans-serif;color:#d6cff7;word-break:keep-all}
.nw-tag{display:inline-block;font:11.5px "Jua",sans-serif;border-radius:999px;padding:2px 8px}
.nw-new{background:#2b8a3e;color:#ebfbee}
.nw-up{background:#1971c2;color:#e7f5ff}
.nw-fix{background:#e8590c;color:#fff4e6}
.nw-tip{margin:6px 0 2px;background:rgba(255,224,102,.1);border-radius:12px;padding:9px 12px;font:13.5px/1.5 "Gowun Dodum",sans-serif;color:#ffe8a3;word-break:keep-all}
.nw-old{margin:4px 0 8px}
.nw-old summary{cursor:pointer;list-style:none;text-align:center;font:15px "Jua",sans-serif;color:#b9b0dd;padding:8px;border-radius:12px;background:rgba(255,255,255,.04)}
.nw-old summary::-webkit-details-marker{display:none}
.nw-old[open] summary{margin-bottom:10px}
.nw-old .nw-sec{opacity:.9}
.nw-foot{padding:10px 16px max(14px,env(safe-area-inset-bottom));text-align:center;border-top:1px solid rgba(255,255,255,.07);background:rgba(10,7,30,.5)}
.nw-ok{width:100%;height:50px;font-size:19px;border-radius:16px}
.nw-foot small{display:block;margin-top:8px;font:12px "Gowun Dodum",sans-serif;color:#9b92c7}
@media (max-width:700px){
  #mdNews{align-items:flex-end;padding:0}
  .nw-box{width:100%;max-height:92vh;border-radius:26px 26px 0 0;animation-name:nwUp}
  @keyframes nwUp{from{transform:translateY(40%);opacity:0}to{transform:none;opacity:1}}
  .nw-top h2{font-size:24px}
}`;
  document.head.appendChild(st);
  const hm = ARC.home;
  ARC.home = function(){ const r = hm.apply(this, arguments); try { NEWSUI.btn(); NEWSUI.auto(); } catch(e){ console.error(e); } return r; };
})();
