/* =====================================================================
   💬 게임 중 채팅 (모든 게임에서)
   - 게임을 하는 동안 왼쪽 가장자리에 💬 단추가 떠요 → 누르면 반 전체 채팅이 옆에서 열려요
   - 닫혀 있을 때 친구 말이 오면 단추 옆에 잠깐 말풍선으로 보여 줘요
   - 채팅 규칙(욕·비방 막기, 추방, 쉬는 시간)은 오락실 채팅과 똑같아요
   ⚡ 게임을 방해하지 않게: 글자를 칠 때는 게임 키가 눌리지 않고, 화면은 열려 있을 때만 다시 그려요
   ===================================================================== */
const GCHAT = {
  open: false, seen: 0, sig: "", toastT: 0,
  ok(){ return document.body.classList.contains("arc-playing") && ARC.me !== null && ARC.me !== undefined && !!Store.cls && (LIVE.cloud() || Store.mode === "local"); },
  init(){
    if (this.el) return;
    const st = document.createElement("style"); st.textContent = `
#gcBtn{position:fixed;left:max(8px,env(safe-area-inset-left));top:50%;transform:translateY(-50%);z-index:900;width:46px;height:46px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:rgba(28,20,64,.88);color:#fff;font-size:22px;display:grid;place-items:center;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.4);-webkit-tap-highlight-color:transparent}
#gcBtn[hidden],#gcPanel[hidden],#gcToast[hidden]{display:none}
#gcBtn:active{transform:translateY(-50%) scale(.92)}
#gcBtn i{position:absolute;top:-3px;right:-3px;min-width:18px;height:18px;border-radius:9px;background:#ff4d6d;color:#fff;font:11px/18px "Jua",sans-serif;font-style:normal;text-align:center;padding:0 4px;box-sizing:border-box}
#gcBtn i:empty{display:none}
#gcToast{position:fixed;left:calc(max(8px,env(safe-area-inset-left)) + 54px);top:50%;transform:translateY(-50%);z-index:900;max-width:min(300px,60vw);background:#fff;color:#2b1d5c;border-radius:4px 16px 16px 16px;padding:7px 12px;font:14px "Gowun Dodum",sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.35);pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;animation:gcIn .2s ease-out}
#gcToast b{font-family:"Jua",sans-serif;font-weight:400;color:#6c5ce7;margin-right:4px}
@keyframes gcIn{from{opacity:0;transform:translate(-8px,-50%)}to{opacity:1;transform:translateY(-50%)}}
#gcPanel{position:fixed;left:max(8px,env(safe-area-inset-left));top:max(10px,env(safe-area-inset-top));bottom:max(10px,env(safe-area-inset-bottom));z-index:901;width:min(340px,calc(100vw - 20px));display:flex;flex-direction:column;background:#140f2e;border:1px solid rgba(255,255,255,.14);border-radius:20px;box-shadow:0 16px 48px rgba(0,0,0,.55);color:#fff;overflow:hidden;animation:gcPan .18s ease-out}
@keyframes gcPan{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}
#gcPanel .hd{display:flex;align-items:center;gap:8px;padding:10px 10px 8px 14px;font:18px "Jua",sans-serif;border-bottom:1px solid rgba(255,255,255,.08)}
#gcPanel .hd small{flex:1;font:11.5px "Gowun Dodum",sans-serif;color:#b9b0dd}
#gcPanel .hd button{width:34px;height:34px;border-radius:50%;border:0;background:rgba(255,255,255,.1);color:#fff;font-size:16px;cursor:pointer}
#gcList{flex:1;overflow-y:auto;padding:10px 12px;display:flex;flex-direction:column;gap:8px;overscroll-behavior:contain}
#gcList .m{display:flex;gap:7px;align-items:flex-start;max-width:90%}
#gcList .m .avf{width:28px;height:28px;flex:none}
#gcList .m .b{display:flex;flex-direction:column;align-items:flex-start;min-width:0}
#gcList .m .n{font:11.5px "Jua",sans-serif;color:#aaa2d4;padding:0 4px 2px}
#gcList .m p{margin:0;background:#2a2360;border-radius:4px 16px 16px 16px;padding:6px 11px;font:14px/1.4 "Gowun Dodum",sans-serif;word-break:break-all;white-space:pre-wrap}
#gcList .m.me{align-self:flex-end;flex-direction:row-reverse}
#gcList .m.me .avf,#gcList .m.me .n{display:none}
#gcList .m.me .b{align-items:flex-end}
#gcList .m.me p{background:linear-gradient(160deg,#8f7cff,#6c5ce7);border-radius:16px 4px 16px 16px}
#gcList .m.tch p{background:linear-gradient(160deg,#6b4800,#4a3200);border:1px solid rgba(255,212,59,.5)}
#gcList .m p.big{background:none !important;border:0 !important;font-size:30px;padding:0 2px}
#gcList .sys{align-self:center;max-width:94%;background:rgba(255,212,59,.08);color:#f0d77a;border-radius:10px;padding:4px 10px;font:11.5px/1.4 "Gowun Dodum",sans-serif;text-align:center}
#gcList .none{margin:auto;text-align:center;color:#b9b0dd;font:14px/1.6 "Gowun Dodum",sans-serif}
#gcQuick{display:flex;gap:6px;overflow-x:auto;padding:8px 10px 2px;scrollbar-width:none;border-top:1px solid rgba(255,255,255,.08)}
#gcQuick::-webkit-scrollbar{display:none}
#gcQuick button{flex:none;font:14px "Jua",sans-serif;color:#e5dbff;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:999px;padding:5px 11px;cursor:pointer}
#gcForm{display:flex;gap:6px;padding:8px 10px 10px}
#gcForm input{flex:1;min-width:0;height:40px;box-sizing:border-box;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:0 14px;background:rgba(255,255,255,.07);color:#fff;font:15px "Gowun Dodum",sans-serif;outline:none}
#gcForm input:focus{border-color:#a594ff}
#gcForm button{height:40px;border:0;border-radius:999px;padding:0 15px;background:linear-gradient(160deg,#8f7cff,#6c5ce7);color:#fff;font:15px "Jua",sans-serif;cursor:pointer}
#gcForm button:disabled,#gcForm input:disabled{opacity:.5}
#gcMsg{padding:0 14px 8px;font:12px "Gowun Dodum",sans-serif;color:#ffa8a8;min-height:0}
#gcMsg:empty{display:none}`;
    document.head.appendChild(st);
    const wrap = document.createElement("div"); wrap.innerHTML = `
<button id="gcBtn" hidden title="채팅">💬<i id="gcBadge"></i></button>
<div id="gcToast" hidden></div>
<div id="gcPanel" hidden>
  <div class="hd">💬 반 채팅 <small>게임하면서 이야기해요 · 고운 말만!</small><button id="gcX" title="닫기">✕</button></div>
  <div id="gcList"></div>
  <div id="gcQuick">${["👍", "ㅋㅋㅋ", "🎉 축하해!", "GG!", "같이 하자!", "도와줘!", "고마워!", "😂", "🔥"].map(t => `<button>${t}</button>`).join("")}</div>
  <form id="gcForm" autocomplete="off"><input id="gcIn" maxlength="50" placeholder="고운 말로 한마디 😊" enterkeyhint="send"><button id="gcSend">보내기</button></form>
  <div id="gcMsg"></div>
</div>`;
    while (wrap.firstElementChild) document.body.appendChild(wrap.firstElementChild);
    this.el = $("#gcPanel");
    // ⌨️ 글자를 칠 때는 게임 키(스페이스·화살표 등)가 눌리지 않게
    ["keydown", "keyup", "keypress"].forEach(ev => this.el.addEventListener(ev, e => e.stopPropagation()));
    ["pointerdown", "touchstart", "mousedown"].forEach(ev => { this.el.addEventListener(ev, e => e.stopPropagation()); $("#gcBtn").addEventListener(ev, e => e.stopPropagation()); });
    $("#gcBtn").onclick = () => this.toggle();
    $("#gcX").onclick = () => this.toggle(false);
    $("#gcQuick").onclick = e => { const b = e.target.closest("button"); if (b) this.send(b.textContent); };
    $("#gcForm").onsubmit = e => { e.preventDefault(); const i = $("#gcIn"); this.send(i.value).then(ok => { if (ok) i.value = ""; }); };
    LIVE.subs.push(k => { if (k.chat || k.on) this.paint(); });
    new MutationObserver(() => this.paint()).observe(document.body, {attributes: true, attributeFilter: ["class"]});
    this.seen = Date.now(); this.paint();
  },
  toggle(on){ this.open = on == null ? !this.open : on; if (this.open){ this.seen = Date.now(); this.painted = false; $("#gcToast").hidden = true; } this.sig = ""; this.paint();
    if (this.open && !matchMedia("(pointer:coarse)").matches) setTimeout(() => { const i = $("#gcIn"); if (i && !i.disabled) i.focus(); }, 50);
    if (!this.open){ const i = $("#gcIn"); if (i) i.blur(); } },
  async send(t){ const r = await CHAT_SEND.call(CHAT, t, ARC.me); $("#gcMsg").textContent = r || ""; if (!r){ this.seen = Date.now(); } return !r; },
  paint(){
    if (!this.el) return;
    const ok = this.ok(); $("#gcBtn").hidden = !ok || this.open; if (!ok){ this.el.hidden = true; $("#gcToast").hidden = true; if (this.open) this.open = false; return; }
    const L = LIVE.chat || [], me = ARC.me, unread = L.filter(m => !m.sys && m.no !== me && (m.at || 0) > this.seen);
    $("#gcBadge").textContent = this.open || !unread.length ? "" : unread.length > 9 ? "9+" : unread.length;
    // 닫혀 있으면 새로 온 친구 말을 잠깐 말풍선으로
    const last = unread[unread.length - 1];
    if (!this.open && last && last.id !== this.lastToast){ this.lastToast = last.id; const t = $("#gcToast");
      t.innerHTML = `<b>${esc(isT(last.no) ? "선생님" : nameOf(last.no))}</b>${esc(last.t)}`; t.hidden = false; clearTimeout(this.toastT); this.toastT = setTimeout(() => { t.hidden = true; }, 4000); }
    this.el.hidden = !this.open; if (!this.open) return;
    this.seen = Date.now();
    const why = CHAT.why(me), inp = $("#gcIn"); inp.disabled = $("#gcSend").disabled = !!why; inp.placeholder = why || "고운 말로 한마디 😊";
    const sig = L.length + "|" + (L.length ? L[L.length - 1].id : "") + "|" + why; if (sig === this.sig) return; this.sig = sig;
    const box = $("#gcList"), stick = box.scrollHeight - box.scrollTop - box.clientHeight < 40;
    if (CHAT.banned(me)){ box.innerHTML = `<div class="none">🚫 채팅방에서 추방됐어요</div>`; return; }
    box.innerHTML = L.length ? L.slice(-40).map(m => m.sys ? `<div class="sys">${esc(m.t)}</div>`
      : `<div class="m${m.no === me ? " me" : ""}${isT(m.no) ? " tch" : ""}">${avI(sidOf(m.no))}<div class="b"><span class="n">${esc(isT(m.no) ? "🧑‍🏫 선생님" : `${m.no}번 ${nameOf(m.no)}`)} · ${hhmm(m.at)}</span><p${emoOnly(m.t) ? ' class="big"' : ""}>${esc(m.t)}</p></div></div>`).join("")
      : `<div class="none">💬 아직 채팅이 없어요<br><small>첫 인사를 해 볼까요? 👋</small></div>`;
    if (stick || !this.painted){ box.scrollTop = box.scrollHeight; } this.painted = true;
  }
};
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => GCHAT.init()); else setTimeout(() => GCHAT.init(), 0);
