/* =====================================================================
   ⌨️ 화면 키보드 — 게임 아래에 버튼판이 나와서, 키보드를 누른 것처럼 조작해요 (모든 게임)
   - 🎮 게임마다 필요한 키만: 방향판(엄지로 굴리면 대각선까지 부드럽게) + 큰 동작 버튼
   - 둘이 하는 게임은 1P · 2P 판을 양쪽에
   ⚡ 조작감: 누르는 순간 바로(손을 떼기 전에) 키가 눌려요. 여러 손가락 동시에, 손가락을 밀어서
      옆 버튼으로 넘어가도 끊기지 않아요. 꾹 누르면 진짜 키보드처럼 계속 눌려요(필요한 게임만).
      버튼판은 HTML 하나로 한 번만 만들고, 누를 때는 클래스 하나만 바꿔요 (다시 그리기 없음).
   ===================================================================== */
const VK = {
  on: (() => { try { return localStorage.getItem("arcade.vk") === "1"; } catch(e){ return false; } })(),
  two: false, gid: null, sig: "", held: new Map(), dpads: new Map(), rep: new Map(),
  /* 키 이름 → 눌린 글자 (몇몇 게임은 e.key를 봐요) */
  keyOf(code){ return code === "Space" ? " " : code.startsWith("Key") ? code.slice(3).toLowerCase() : code.startsWith("Digit") ? code.slice(5) : code; },
  send(type, code, repeat){ window.dispatchEvent(new KeyboardEvent(type, {code, key: this.keyOf(code), bubbles: true, cancelable: true, repeat: !!repeat})); },
  /* ---------- 게임마다 버튼판 ----------
     d: 방향판 {u,d,l,r, diag:대각선, rep:꾹 누르면 반복}  b: 버튼 [키, 그림, 글자, 크게?, 반복?] */
  P1: {u: "KeyW", d: "KeyS", l: "KeyA", r: "KeyD"}, P2: {u: "ArrowUp", d: "ArrowDown", l: "ArrowLeft", r: "ArrowRight"}, AR: {u: "ArrowUp", d: "ArrowDown", l: "ArrowLeft", r: "ArrowRight"},
  layout(gid, two){
    const A = this.AR, P1 = this.P1, P2 = this.P2, lr = m => ({l: m.l, r: m.r}), ud = m => ({u: m.u, d: m.d});
    const L = {
      rd: two ? [{c: 0, b: [["Space", "🎲", "뽑기", 1], ["KeyQ", "🔀", "합치기"], ["KeyE", "💎", "행운"]]}, {c: 1, b: [["Enter", "🎲", "뽑기", 1], ["KeyM", "🔀", "합치기"], ["KeyL", "💎", "행운"]]}]
              : [{b: [["Space", "🎲", "뽑기", 1], ["KeyQ", "🔀", "합치기", 1]]}, {b: [["Digit1", "⬆️", "일반·희귀"], ["Digit2", "⬆️", "영웅·전설"], ["Digit3", "⬆️", "신화"]], g: 1}, {b: [["KeyE", "💎", "행운"], ["KeyF", "⏩", "빠르게"]], g: 1}],
      wm: [{grid: 3, b: [["KeyQ", "", "1"], ["KeyW", "", "2"], ["KeyE", "", "3"], ["KeyA", "", "4"], ["KeyS", "", "5"], ["KeyD", "", "6"], ["KeyZ", "", "7"], ["KeyX", "", "8"], ["KeyC", "", "9"]]}],
      bk: [{d: lr(A)}, {b: [["Space", "🚀", "발사", 1]]}],
      rn: [{b: [["Space", "⤴️", "점프", 2]]}],
      tw: [{d: A}],
      tr: [{d: A}],
      fl: [{b: [["Space", "🐤", "날기", 2]]}],
      st: [{b: [["ArrowLeft", "🔄", "방향 바꾸기", 2]]}, {b: [["ArrowRight", "⬆️", "오르기", 2]]}],
      fm: [{d: Object.assign(lr(A), {rep: 1})}, {b: [["Space", "⬇️", "떨어뜨리기", 1]]}],
      rh: [{lanes: 1, b: [["KeyD", "", "1"], ["KeyF", "", "2"], ["KeyJ", "", "3"], ["KeyK", "", "4"]]}],
      pp: two ? [{c: 0, d: ud(P1)}, {c: 1, d: ud(P2)}] : [{d: ud(A)}],
      vb: two ? [{c: 0, d: lr(P1), b: [["KeyW", "⤴️", "점프"], ["KeyF", "💥", "스파이크"]]}, {c: 1, d: lr(P2), b: [["ArrowUp", "⤴️", "점프"], ["Enter", "💥", "스파이크"]]}]
              : [{d: lr(P1)}, {b: [["KeyW", "⤴️", "점프", 1], ["KeyF", "💥", "스파이크", 1]]}],
      ah: two ? [{c: 0, d: Object.assign({diag: 1}, P1), b: [["KeyF", "💥", "세게"]]}, {c: 1, d: Object.assign({diag: 1}, P2), b: [["Enter", "💥", "세게"]]}]
              : [{d: Object.assign({diag: 1}, P1)}, {b: [["KeyF", "💥", "세게", 1]]}],
      wb: two ? [{c: 0, d: P1, b: [["Space", "💦", "풍선"]]}, {c: 1, d: P2, b: [["Enter", "💦", "풍선"]]}] : [{d: A}, {b: [["Space", "💦", "풍선", 2]]}],
      bs: two ? [{c: 0, d: {l: "KeyA", r: "KeyD", u: "KeyW", diag: 1}, b: [["KeyF", "🫧", "쏘기", 0, 0, 1], ["KeyG", "⤴️", "점프"], ["KeyH", "💣", ""]]}, {c: 1, d: {l: "ArrowLeft", r: "ArrowRight", u: "ArrowUp", diag: 1}, b: [["KeyK", "🫧", "쏘기", 0, 0, 1], ["KeyL", "⤴️", "점프"], ["KeyO", "💣", ""]]}]
              : [{d: {l: "ArrowLeft", r: "ArrowRight", u: "ArrowUp", diag: 1}}, {b: [["KeyZ", "🫧", "쏘기", 1], ["KeyX", "⤴️", "점프", 1], ["KeyC", "💣", "폭탄"]]}],
      qd: two ? [{c: 0, d: Object.assign({diag: 1}, P1), b: [["KeyF", "⚔️", "공격"], ["KeyG", "🦘", "점프"], ["KeyH", "✨", "스킬"]]}, {c: 1, d: Object.assign({diag: 1}, P2), b: [["KeyJ", "⚔️", "공격"], ["KeyK", "🦘", "점프"], ["KeyL", "✨", "스킬"]]}]
              : [{d: Object.assign({diag: 1}, A)}, {b: [["KeyF", "⚔️", "공격", 1], ["KeyG", "🦘", "점프", 1], ["KeyH", "✨", "스킬"]]}],
      sk: two ? [{c: 0, d: Object.assign({diag: 1}, P1), b: [["KeyF", "⚡", "스킬"], ["KeyG", "💣", "폭탄"]]}, {c: 1, d: Object.assign({diag: 1}, P2), b: [["Enter", "⚡", "스킬"], ["Period", "💣", "폭탄"]]}]
              : [{d: Object.assign({diag: 1}, A)}, {b: [["KeyF", "⚡", "스킬", 1], ["KeyG", "💣", "폭탄", 1]]}]
    };
    return L[gid] || null;
  },
  TWO: ["rd", "pp", "vb", "ah", "wb", "bs", "qd", "sk"],
  /* 지금 열린 게임 */
  active(){
    if (typeof NG !== "undefined" && NG.cur && !$("#ng").hidden){ const g = NG.gid, o = NG.opt || {};
      const two = (o.local || []).length >= 2 || (g === "pp" && !o.cpu && !o.net); return {gid: g, two, auto: true}; }
    const L = [["vb", "#volley"], ["ah", "#airh"], ["fl", "#flappy"], ["tr", "#train"]];
    for (const [g, s] of L){ const el = $(s); if (el && el.classList.contains("open")) return {gid: g, two: this.two, auto: false}; }
    return null;
  },
  /* ---------- 화면 ---------- */
  build(){
    document.body.insertAdjacentHTML("beforeend", `<button class="vk-tog" id="vkTog" hidden title="화면 키보드">⌨️</button><div class="vk-bar" id="vkBar" hidden><div class="vk-in" id="vkIn"></div><button class="vk-two" id="vkTwo" hidden>👫 둘이</button></div>`);
    const tog = $("#vkTog"), bar = $("#vkBar");
    tog.addEventListener("pointerdown", e => { e.preventDefault(); e.stopPropagation(); this.set(!this.on); });
    $("#vkTwo").addEventListener("pointerdown", e => { e.preventDefault(); e.stopPropagation(); this.two = !this.two; this.sig = ""; this.tick(); });
    bar.addEventListener("pointerdown", e => this.pd(e), {passive: false});
    bar.addEventListener("pointermove", e => this.pm(e), {passive: false});
    ["pointerup", "pointercancel"].forEach(t => bar.addEventListener(t, e => this.pu(e)));
    bar.addEventListener("lostpointercapture", e => this.pu(e));
    ["contextmenu", "selectstart", "dblclick"].forEach(t => bar.addEventListener(t, e => e.preventDefault()));
    bar.addEventListener("touchstart", e => e.preventDefault(), {passive: false});   // 길게 누르기 확대경·스크롤 막기
    window.addEventListener("blur", () => this.releaseAll());
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.releaseAll(); });
    setInterval(() => this.tick(), 350);
  },
  set(on){ this.on = on; try { localStorage.setItem("arcade.vk", on ? "1" : "0"); } catch(e) {} if (!on) this.releaseAll(); this.sig = ""; this.tick(); try { navigator.vibrate && navigator.vibrate(10); } catch(e) {} },
  tick(){
    const a = this.active(), L = a && this.layout(a.gid, a.two);
    const tog = $("#vkTog"); tog.hidden = !L; if (L) tog.classList.toggle("on", this.on);
    // 게임 창 위쪽 줄(닫기 단추 옆)에 넣어 놀이 화면을 가리지 않아요
    const top = a && a.auto ? $("#ng .ng-top") : null, want = top || document.body;
    if (tog.parentElement !== want){ if (top) top.insertBefore(tog, $("#ngClose")); else document.body.appendChild(tog); tog.classList.toggle("in", !!top); }
    const show = !!(L && this.on), sig = show ? `${a.gid}|${a.two}|${innerWidth > innerHeight}` : "";
    window.VK_ON = show;
    if (sig === this.sig) return; this.sig = sig; this.releaseAll();
    document.body.classList.toggle("vk-on", show); $("#vkBar").hidden = !show;
    if (show){ this.render(a.gid, a.two, L); $("#vkTwo").hidden = a.auto || !this.TWO.includes(a.gid); $("#vkTwo").classList.toggle("on", a.two); }
    // 게임 화면 크기를 다시 맞춰요
    requestAnimationFrame(() => { window.dispatchEvent(new Event("resize")); });
  },
  render(gid, two, L){
    const col = ["#ff922b", "#4dabf7"];
    const btn = (b, i) => `<div class="vk-b${b[3] === 2 ? " xl" : b[3] ? " lg" : ""}" data-k="${b[0]}"${b[4] ? ' data-rep="1"' : ""}>${b[1] ? `<span class="e">${b[1]}</span>` : ""}${b[2] ? `<span class="t">${b[2]}</span>` : ""}</div>`;
    const dpad = (d, c) => { const dirs = [["u", "▲"], ["l", "◀"], ["r", "▶"], ["d", "▼"]].filter(([k]) => d[k]);
      return `<div class="vk-d${d.u && d.d ? "" : d.u ? " nu" : " h"}${d.l ? "" : " v"}" data-u="${d.u || ""}" data-d="${d.d || ""}" data-l="${d.l || ""}" data-r="${d.r || ""}" data-diag="${d.diag ? 1 : 0}"${d.rep ? ' data-rep="1"' : ""}>
        ${dirs.map(([k, s]) => `<i class="a ${k}">${s}</i>`).join("")}<i class="knob"></i></div>`; };
    $("#vkIn").innerHTML = L.map((g, gi) => `<div class="vk-g${g.c != null ? " p" + g.c : ""}${g.grid ? " grid" : ""}${g.lanes ? " lanes" : ""}${g.g ? " sm" : ""}" style="${g.c != null ? `--pc:${col[g.c]}` : ""}">
      ${g.c != null && two ? `<em class="vk-p">${g.c + 1}P</em>` : ""}${g.d ? dpad(g.d) : ""}${g.b ? `<div class="vk-bs">${g.b.map(btn).join("")}</div>` : ""}</div>`).join("");
  },
  /* ---------- 손가락 ---------- */
  press(code, el){ if (!code) return; this.send("keydown", code); el && el.classList.add("on");
    try { navigator.vibrate && navigator.vibrate(6); } catch(e) {}
    if (el && el.dataset.rep){ const r = {t: setTimeout(function loop(){ VK.send("keydown", code, true); r.t = setTimeout(loop, 55); }, 280)}; this.rep.set(code, r); } },
  release(code, el){ if (!code) return; const r = this.rep.get(code); if (r){ clearTimeout(r.t); this.rep.delete(code); } this.send("keyup", code); el && el.classList.remove("on"); },
  dirOf(el, x, y){ const r = el.getBoundingClientRect(), cx = r.left + r.width/2, cy = r.top + r.height/2, dx = x - cx, dy = y - cy, rad = Math.min(r.width, r.height)/2, m = Math.hypot(dx, dy), D = el.dataset;
    const out = new Set(); if (m < rad*.18) return {out, kx: 0, ky: 0};
    const hasU = !!D.u, hasD = !!D.d, hasL = !!D.l, hasR = !!D.r, diag = D.diag === "1";
    if (!hasU && !hasD){ if (dx < 0) out.add(D.l); else out.add(D.r); }
    else if (!hasL && !hasR){ if (dy < 0) out.add(D.u); else out.add(D.d); }
    else if (diag){ const a = Math.atan2(dy, dx), s = Math.round(a/(Math.PI/4)); const map = {0: ["r"], 1: ["r", "d"], 2: ["d"], 3: ["d", "l"], 4: ["l"], "-4": ["l"], "-3": ["l", "u"], "-2": ["u"], "-1": ["u", "r"]};
      (map[s] || []).forEach(k => { if (D[k]) out.add(D[k]); }); if (!out.size){ if (Math.abs(dx) > Math.abs(dy)) out.add(dx < 0 ? D.l : D.r); else if (dy < 0 && D.u) out.add(D.u); else if (D.d) out.add(D.d); } }
    else { if (Math.abs(dx) > Math.abs(dy) || (!hasD && dy > 0)) out.add(dx < 0 ? D.l : D.r); else out.add(dy < 0 ? D.u : D.d); }
    out.delete(""); const k = Math.min(1, m/(rad*.7)); return {out, kx: dx/(m || 1)*k, ky: dy/(m || 1)*k};
  },
  dpadMove(id, el, x, y){ const st = this.dpads.get(id) || {el, keys: new Set()}; this.dpads.set(id, st);
    const {out, kx, ky} = this.dirOf(el, x, y);
    st.keys.forEach(c => { if (!out.has(c)){ st.keys.delete(c); this.release(c); } });
    out.forEach(c => { if (!st.keys.has(c)){ st.keys.add(c); this.press(c, el.dataset.rep ? el : null); } });
    const kn = el.querySelector(".knob"); if (kn) kn.style.transform = `translate(${(kx*80).toFixed(1)}%,${(ky*80).toFixed(1)}%)`;
    el.querySelectorAll(".a").forEach(a => a.classList.toggle("on", [...st.keys].includes(el.dataset[a.classList[1]])));
    el.classList.add("on"); },
  pd(e){
    e.preventDefault(); const t = e.target.closest(".vk-d, .vk-b"); if (!t) return;
    try { t.setPointerCapture(e.pointerId); } catch(er) {}
    if (t.classList.contains("vk-d")) return this.dpadMove(e.pointerId, t, e.clientX, e.clientY);
    this.held.set(e.pointerId, t); this.press(t.dataset.k, t);
  },
  pm(e){
    const st = this.dpads.get(e.pointerId); if (st){ e.preventDefault(); return this.dpadMove(e.pointerId, st.el, e.clientX, e.clientY); }
    const cur = this.held.get(e.pointerId); if (!cur) return; e.preventDefault();
    // 손가락을 밀어서 옆 버튼으로 (같은 판 안에서) — 떼지 않고 바로 넘어가요
    const el = document.elementFromPoint(e.clientX, e.clientY), nb = el && el.closest(".vk-b");
    if (nb && nb !== cur && nb.parentElement === cur.parentElement && ![...this.held.values()].includes(nb)){ this.release(cur.dataset.k, cur); this.held.set(e.pointerId, nb); this.press(nb.dataset.k, nb); }
  },
  pu(e){
    const st = this.dpads.get(e.pointerId); if (st){ this.dpads.delete(e.pointerId); st.keys.forEach(c => this.release(c)); const kn = st.el.querySelector(".knob"); if (kn) kn.style.transform = ""; st.el.classList.remove("on"); st.el.querySelectorAll(".a.on").forEach(a => a.classList.remove("on")); return; }
    const b = this.held.get(e.pointerId); if (!b) return; this.held.delete(e.pointerId); this.release(b.dataset.k, b);
  },
  releaseAll(){ this.held.forEach(b => this.release(b.dataset.k, b)); this.held.clear(); this.dpads.forEach(st => { st.keys.forEach(c => this.release(c)); st.el.classList.remove("on"); }); this.dpads.clear(); this.rep.forEach(r => clearTimeout(r.t)); this.rep.clear(); }
};
window.VK = VK;
(function(){
  const css = document.createElement("style");
  css.textContent = `:root{--vkh:min(34vh,290px)}@media (orientation:landscape){:root{--vkh:min(33vh,180px)}}
body.vk-on .ng-ov .ng-top{padding:4px 12px}body.vk-on .ng-ov .ng-top h2{font-size:18px}body.vk-on .ng-ov .ng-hud{font-size:15px}
@media (orientation:landscape) and (max-height:520px){body.vk-on .ng-ov .ng-top h2{display:none}body.vk-on .ng-ov .ng-top .pk-x,.vk-tog.in{width:36px;height:36px;font-size:20px}}
body.vk-on .ng-ov,body.vk-on #volley,body.vk-on #airh,body.vk-on #flappy,body.vk-on #train{height:calc(100dvh - var(--vkh)) !important;bottom:auto !important}
body.vk-on #vpad{display:none !important}
.vk-tog{position:fixed;top:10px;right:70px;z-index:1300;width:46px;height:46px;border-radius:50%;border:2px solid rgba(255,255,255,.35);background:rgba(30,22,70,.85);color:#fff;font-size:22px;display:grid;place-items:center;cursor:pointer;touch-action:none;box-shadow:0 3px 10px rgba(0,0,0,.35)}
.vk-tog[hidden],.vk-bar[hidden],.vk-two[hidden]{display:none !important}.vk-tog.on{background:#ffd43b;border-color:#fff}.vk-tog.in{position:static;flex:none;box-shadow:none}
.vk-bar{position:fixed;left:0;right:0;bottom:0;height:var(--vkh);z-index:1290;background:linear-gradient(#1d1640,#0d0a24);border-top:2px solid rgba(255,255,255,.14);touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;padding:10px max(10px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left));box-sizing:border-box}
.vk-in{display:flex;height:100%;gap:12px;align-items:stretch;justify-content:space-between}
.vk-g{position:relative;display:flex;gap:10px;align-items:stretch;flex:1 1 0;min-width:0;justify-content:center}
.vk-in>.vk-g:first-child:not(:only-child){justify-content:flex-start}.vk-in>.vk-g:last-child:not(:only-child){justify-content:flex-end}
.vk-g.sm{flex:.9 1 0}.vk-g.p0,.vk-g.p1{border:2px solid var(--pc);border-radius:18px;padding:6px;background:rgba(255,255,255,.04)}
.vk-p{position:absolute;top:-2px;left:10px;font:13px "Jua",sans-serif;color:var(--pc);font-style:normal;background:#0d0a24;padding:0 6px;border-radius:8px;transform:translateY(-50%)}
.vk-bs{display:flex;gap:8px;flex:1;min-width:0}
.vk-g.sm .vk-bs{flex-direction:column}
.vk-b{flex:1;min-width:0;border-radius:18px;background:linear-gradient(#4b3f8f,#2c2460);border:2px solid rgba(255,255,255,.25);box-shadow:0 5px 0 #15102e;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:#fff;transition:transform .04s,box-shadow .04s,background .04s}
.vk-b .e{font-size:clamp(20px,5.5vh,34px);line-height:1}.vk-b .t{font:clamp(12px,2.4vh,17px) "Jua",sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.vk-b.lg{flex:1.5;background:linear-gradient(#5c7cfa,#364fc7)}.vk-b.xl{flex:3;background:linear-gradient(#ffa94d,#e8590c)}.vk-b.xl .e{font-size:clamp(26px,7vh,44px)}.vk-b.xl .t{font-size:clamp(15px,3vh,22px)}
.vk-b.on{transform:translateY(4px);box-shadow:0 1px 0 #15102e;background:linear-gradient(#ffe066,#fab005);color:#1b1233}
.vk-g.grid .vk-bs{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:1fr;max-width:min(560px,100%);margin:0 auto}
.vk-g.grid .vk-b .t,.vk-g.lanes .vk-b .t{font-size:clamp(18px,4vh,28px)}
.vk-g.lanes .vk-b:nth-child(1){background:linear-gradient(#ff8787,#e03131)}.vk-g.lanes .vk-b:nth-child(2){background:linear-gradient(#ffd43b,#f08c00)}.vk-g.lanes .vk-b:nth-child(3){background:linear-gradient(#69db7c,#2b8a3e)}.vk-g.lanes .vk-b:nth-child(4){background:linear-gradient(#74c0fc,#1971c2)}
.vk-g.lanes .vk-b.on{filter:brightness(1.35);transform:translateY(4px)}
.vk-d{position:relative;aspect-ratio:1;width:min(calc(var(--vkh) - 24px),44vw);height:auto;align-self:center;flex:none;border-radius:50%;background:radial-gradient(circle at 50% 45%,#3d3478,#221b4d 70%);border:2px solid rgba(255,255,255,.22);box-shadow:inset 0 0 0 6px rgba(0,0,0,.18)}
.vk-d.h{aspect-ratio:1.9;width:min(calc((var(--vkh) - 24px)*1.5),56vw);border-radius:999px}.vk-d.v{aspect-ratio:.62;width:min(calc((var(--vkh) - 24px)*.62),30vw);border-radius:999px}.vk-d.nu{}
.vk-d .a{position:absolute;font-style:normal;color:rgba(255,255,255,.75);font-size:clamp(16px,3.6vh,26px);transition:color .04s,transform .04s}
.vk-d .a.u{top:6%;left:50%;transform:translateX(-50%)}.vk-d .a.d{bottom:6%;left:50%;transform:translateX(-50%)}.vk-d .a.l{left:7%;top:50%;transform:translateY(-50%)}.vk-d .a.r{right:7%;top:50%;transform:translateY(-50%)}
.vk-d .a.on{color:#ffe066;text-shadow:0 0 10px #ffd43b}
.vk-d .knob{position:absolute;left:31%;top:31%;width:38%;height:38%;border-radius:50%;background:radial-gradient(circle at 40% 35%,#fff,#c5c0e8);box-shadow:0 3px 8px rgba(0,0,0,.4);pointer-events:none}
.vk-d.h .knob{left:39%;width:22%;top:14%;height:72%;aspect-ratio:auto}.vk-d.v .knob{top:39%;height:22%;left:14%;width:72%}
.vk-d.on{border-color:#ffd43b}
.vk-two{position:absolute;top:-38px;left:10px;height:30px;padding:0 12px;border-radius:15px;border:2px solid rgba(255,255,255,.3);background:rgba(30,22,70,.9);color:#fff;font:14px "Jua",sans-serif}
.vk-two.on{background:#ffd43b;color:#1b1233}`;
  document.head.appendChild(css);
  const go = () => VK.build(); if (document.body) go(); else document.addEventListener("DOMContentLoaded", go);
})();
