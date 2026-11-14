# -*- coding: utf-8 -*-
"""
🕹️ 우리반 오락실(arcade.html) 만들기

손들고 말해요(index.html)에 있는 게임 4개(얼굴 배구·에어하키·얼굴 날기·얼굴 기차)를
그대로 가져와서, 오락실용으로 몇 군데만 바꿔 끼우고 새 게임들과 합쳐 arcade.html 하나로 만들어요.
index.html의 게임을 고친 뒤에는 이 파일을 다시 실행하면 오락실에도 반영돼요.

    python3 arcade/build.py
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.join(ROOT, "arcade")
src = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
lines = src.split("\n")


def rd(name):
    return open(os.path.join(HERE, name), encoding="utf-8").read()


def block_from(start_pat, kind):
    """start_pat가 있는 줄부터 그 블록이 끝나는 줄까지 잘라 와요."""
    idx = next(i for i, l in enumerate(lines) if start_pat in l)
    if kind == "module":   # "  (function(){" ~ "  })();"
        j = next(k for k in range(idx + 1, len(lines)) if lines[k].startswith("  })();"))
    else:                  # 맨 왼쪽의 <div id=...> ~ 맨 왼쪽 </div>
        j = next(k for k in range(idx + 1, len(lines)) if lines[k] == "</div>")
    return "\n".join(lines[idx:j + 1])


def module_containing(pat):
    i = next(k for k, l in enumerate(lines) if pat in l)
    s = max(k for k in range(0, i + 1) if lines[k].startswith("  (function(){"))
    e = next(k for k in range(i, len(lines)) if lines[k].startswith("  })();"))
    return "\n".join(lines[s:e + 1])


# ---- 1) 스타일 (index.html의 <style> 통째로: 게임 화면 모양이 똑같이 나오게)
css_app = src[src.index("<style>") + len("<style>"): src.index("</style>")]

# ---- 2) 게임 화면 HTML
overlays = [block_from(f'<div id="{i}"', "html") for i in ("volley", "airh", "flappy")]
overlays += [block_from(f'<div id="{i}" class="gm-ov"', "html") for i in ("memo", "guess", "train")]
game_html = "\n".join(overlays)

# ---- 3) 게임 코드 + 오락실용으로 바꿔 끼우기
mods = {
    "vb": module_containing('const cv = $("#vbCanvas")'),
    "ah": module_containing('const cv = $("#ahCanvas")'),
    "fl": module_containing('const cv = $("#flCanvas")'),
    "tr": module_containing('const cv = $("#trCanvas")'),
}


def patch(key, a, b, count=1):
    c = mods[key].count(a)
    if c != count:
        sys.exit(f"[{key}] 바꿀 곳을 찾지 못했어요 ({c}곳): {a[:70]}")
    mods[key] = mods[key].replace(a, b)


# 결과를 오락실 랭킹으로 보내기
patch("vb", "function endMatch(w){", 'function endMatch(w){ window.ARC && ARC.duel("vb", P[w].sid, P[1 - w].sid, P[1].ctl === "cpu", score);')
patch("ah", "function endMatch(w){", 'function endMatch(w){ window.ARC && ARC.duel("ah", M[w].sid, M[1 - w].sid, M[1].ctl === "cpu", score);')
patch("fl", "const st = stu(sid), res = saveResult();", 'const st = stu(sid), res = saveResult(); window.ARC && ARC.score("fl", sid, recOf(sid));')
patch("tr", "const res = saveResult(), st = stu(sid), r = recOf(sid);", 'const res = saveResult(), st = stu(sid), r = recOf(sid); window.ARC && ARC.score("tr", sid, r);')
# '캐릭터/친구 고르기'로 가면 → 오락실 홈으로 (다른 친구로 바꿔서 하지 못하게)
patch("vb", "function toSel(){", "function toSel(){ if (window.ARC && ARC.busy){ closeVb(); return; }")
patch("ah", "function toSel(){", "function toSel(){ if (window.ARC && ARC.busy){ closeAh(); return; }")
patch("fl", "function toSel(){", "function toSel(){ if (window.ARC && ARC.busy){ closeFl(); return; }")
patch("tr", 'function toSel(){ state = "sel"; sid = null; snake = [];', 'function toSel(){ if (window.ARC && ARC.busy){ closeTr(); return; } state = "sel"; sid = null; snake = [];')
# 닫으면 홈 새로 그리기
patch("vb", "function closeVb(){", "function closeVb(){ window.ARC && ARC.back();")
patch("ah", "function closeAh(){", "function closeAh(){ window.ARC && ARC.back();")
patch("fl", "function closeFl(){", "function closeFl(){ window.ARC && ARC.back();")
patch("tr", "function closeTr(){", "function closeTr(){ window.ARC && ARC.back();")
# 오락실에서 쓸 시작 함수 내보내기
patch("vb", "window.__vbTest = {", "window.__vbOpen = openVb; window.__vbTest = { setLv(v){ lv = v; }, setTarget(v){ target = v; },")
patch("ah", "window.__ahTest = {", "window.__ahOpen = openAh; window.__ahTest = { setLv(v){ lv = v; }, setTarget(v){ target = v; },")
patch("fl", "window.__flTest = {", "window.__flOpen = openFl; window.__flTest = { begin,")
patch("tr", "window.__trTest = {", "window.__trOpen = openTr; window.__trTest = {")

# ---- 🌐 다른 기기 친구와 대결 (net.js) ----
# 신청한 친구 기기(host)가 공·점수를 정하고, 수락한 친구 기기(guest)는 자기 선수만 움직여서 보내요.
LOOP = 'while (acc >= 1000/60){ if (state !== "pause" && state !== "sel" && state !== "end") step(); acc -= 1000/60; }'
NETVARS = ' let netR = null, mySide = 0, srvN = 0, gSrv = -1; const NQ = [];'

# --- 배구
patch("vb", "    const keys = new Set(), pressed = new Set();\n", "    const keys = new Set(), pressed = new Set();" + NETVARS + "\n")
patch("vb", "function snd(kind){", 'function snd(kind){ if (netR === "host") NQ.push(["sn", kind]);')
patch("vb", "function serve(who){", "function serve(who){ srvN++;")
patch("vb", 'const sets = p.ctl === "p1" && mode === "cpu" ?', 'const sets = p.ctl === "me" || (p.ctl === "p1" && mode === "cpu") ?')
patch("vb", 'const c = p.ctl === "cpu" ? cpu(p) : ctlState(p);', 'if (p.ctl === "net"){ if (p.cool > 0) p.cool--; if (p.swing > 0) p.swing--; return; } const c = p.ctl === "cpu" ? cpu(p) : ctlState(p);')
patch("vb", "function endMatch(w){ window.ARC", 'function endMatch(w){ if (netR === "host") NET.end(w, score); window.ARC')
patch("vb", 'const tag = p.ctl === "cpu" ? "🤖" : p.side ? "2P" : "1P";', 'const tag = p.ctl === "cpu" ? "🤖" : netR ? (p.ctl === "net" ? "친구" : "⬇ 나") : p.side ? "2P" : "1P";')
patch("vb", LOOP, LOOP.replace("step();", '(netR === "guest" ? gstep() : step());') + " if (netR) NET.tick(window.__vbNet);")
patch("vb", 'if (e.code === "KeyP" && (state === "play"', 'if (e.code === "KeyP" && !netR && (state === "play"')
patch("vb", '$("#vbKeys").innerHTML = mode === "cpu"', '$("#vbKeys").innerHTML = netR ? `🌐 다른 기기 대결 · 이동 <kbd>A</kbd><kbd>D</kbd> 또는 <kbd>←</kbd><kbd>→</kbd> · 점프 <kbd>W</kbd>/<kbd>↑</kbd> · 스파이크 <kbd>F</kbd>/<kbd>Enter</kbd>` : mode === "cpu"')
patch("vb", '$("#vbRe").onclick = startMatch;', '$("#vbRe").onclick = () => netR ? NET.again() : startMatch();')
patch("vb", "    window.__vbOpen = openVb;", r'''    /* 🌐 수락한 친구 기기: 내 선수만 움직이고 나머지는 받은 대로 그려요 */
    function gstep(){
      frame++;
      if (shake > 0) shake *= .85;
      fx = fx.filter(f => (f.t -= 1) > 0);
      if (state === "play"){
        ball.vy += BG; ball.x += ball.vx; ball.y += ball.vy; ball.spin += ball.vx * .02;
        if (ball.x < BR){ ball.x = BR; ball.vx = Math.abs(ball.vx); } if (ball.x > W - BR){ ball.x = W - BR; ball.vx = -Math.abs(ball.vx); }
        if (ball.y + BR > GROUND) ball.y = GROUND - BR;
        const o = P[0]; o.x += o.vx; if (!o.ground){ o.vy += PG; o.y = Math.min(GROUND, o.y + o.vy); }
        const p = P[1], c = ctlState(p), sp = p.spd;
        p.vx = (c.r ? sp : 0) - (c.l ? sp : 0);
        if ((c.u || c.up) && p.ground){ p.vy = -p.jump; p.ground = false; p.squash = 6; snd("jump"); }
        if (c.sp) p.spikeT = 10;
        p.spikeDir = c.d ? 1 : c.u ? -1 : 0;
        if (p.spikeT > 0) p.spikeT--;
        if (p.swing > 0) p.swing--;
        p.x += p.vx;
        if (!p.ground){ p.vy += PG + (c.d ? .35 : 0); p.y += p.vy; if (p.y >= GROUND){ p.y = GROUND; p.vy = 0; p.ground = true; p.squash = 6; } }
        if (p.squash > 0) p.squash--;
        p.x = Math.max(minX(p), Math.min(maxX(p), p.x));
      } else if (state === "point" && ball){ ball.vy += BG*.5; ball.y = Math.min(ball.y + ball.vy*.3, GROUND - BR*.6); }
      pressed.clear();
    }
    window.__vbNet = {
      isOpen: () => open,
      begin(role, a, b, x){
        netR = role; mySide = role === "guest" ? 1 : 0; NQ.length = 0; mode = "cpu"; ensureStats();
        if (role === "host"){ pick = [a, b]; startMatch(); P[1].ctl = "net"; return {st: {[a]: statsOf(a), [b]: statsOf(b)}, tg: target}; }
        if (x && x.st) Object.assign(S.vb.stats, x.st);
        if (x && x.tg) target = x.tg;
        pick = [a, b]; P = [mkPlayer(a, 0, "net"), mkPlayer(b, 1, "me")]; score = [0, 0]; fx = []; trail = []; gSrv = -1;
        ball = {x: W/2, y: 110, vx: 0, vy: 0, spin: 0, spiked: 0}; state = "play";
        $("#vbSel").hidden = true; $("#vbEnd").hidden = true; $("#vbPause").hidden = true; renderKeys();
      },
      snap(){ const o = P[0]; return {st: state, sc: score, sv: server, n: srvN, fr: frame, b: ball, tr: trail, fx, sh: shake, sw: P[1].swing,
        p: {x: o.x, y: o.y, vx: o.vx, vy: o.vy, ground: o.ground, squash: o.squash, swing: o.swing, spikeT: o.spikeT}}; },
      ev: () => NQ.splice(0),
      fx(e){ e.forEach(([k, a]) => { if (k === "sn") snd(a); }); },
      apply(d){
        if (!P[1] || P[1].ctl !== "me") return;
        if (d.n !== gSrv){ gSrv = d.n; const p = P[1]; p.x = homeX(p); p.y = GROUND; p.vx = p.vy = 0; p.ground = true; p.spikeT = 0; p.swing = 0; }
        state = d.st; score = d.sc; server = d.sv; frame = d.fr; ball = d.b; trail = d.tr; fx = d.fx; shake = d.sh;
        Object.assign(P[0], d.p); P[1].swing = Math.max(P[1].swing, d.sw || 0);
        if (state !== "end" && !$("#vbEnd").hidden) $("#vbEnd").hidden = true;
      },
      mine(){ const p = P[1]; return {x: p.x, y: p.y, vx: p.vx, vy: p.vy, ground: p.ground, spikeT: p.spikeT, spikeDir: p.spikeDir, squash: p.squash}; },
      put(d){ if (P[1] && P[1].ctl === "net") Object.assign(P[1], d); },
      end(w, sc){ if (netR !== "guest") return; score = sc; endMatch(w); },
      reset(){ netR = null; mySide = 0; NQ.length = 0; },
      close(){ if (open) closeVb(); }
    };
    window.__vbOpen = openVb;''')

# --- 에어하키
patch("ah", "const keys = new Set(), pressed = new Set(), ptr = new Map(), imgs = {};", "const keys = new Set(), pressed = new Set(), ptr = new Map(), imgs = {};" + NETVARS)
patch("ah", "function snd(kind, v){", 'function snd(kind, v){ if (netR === "host") NQ.push(["sn", kind, v]);')
patch("ah", "function sparks(x, y, n, col, sp){", 'function sparks(x, y, n, col, sp){ if (netR === "host") NQ.push(["sp", x, y, n, col, sp]);')
patch("ah", "function confetti(x, y, n, dir){", 'function confetti(x, y, n, dir){ if (netR === "host") NQ.push(["cf", x, y, n, dir]);')
patch("ah", "function say(txt, x, y, col, size, life){", 'function say(txt, x, y, col, size, life){ if (netR === "host") NQ.push(["sy", txt, x, y, col, size, life]);')
patch("ah", "function ready(side, first){", "function ready(side, first){ srvN++;")
patch("ah", 'if (m.ctl === "cpu") return cpu(m);', 'if (m.ctl === "cpu") return cpu(m); if (m.ctl === "net") return {ix: 0, iy: 0};')
patch("ah", 'const sets = m.ctl === "p1" && mode === "cpu" ?', 'const sets = m.ctl === "me" || (m.ctl === "p1" && mode === "cpu") ?')
patch("ah", "function moveIntent(m, c){", 'function moveIntent(m, c){ if (m.ctl === "net"){ if (m.hitT > 0) m.hitT--; if (m.bump > 0) m.bump--; return; }')
patch("ah", 'side = mode === "cpu" ? 0 :', 'side = mode === "cpu" ? mySide :')
patch("ah", "function endMatch(w){ window.ARC", 'function endMatch(w){ if (netR === "host") NET.end(w, score); window.ARC')
patch("ah", LOOP, LOOP.replace("step();", '(netR === "guest" ? gstep() : step());') + " if (netR) NET.tick(window.__ahNet);")
patch("ah", "function togglePause(){", "function togglePause(){ if (netR) return;")
patch("ah", '$("#ahKeys").innerHTML = mode === "cpu"', '$("#ahKeys").innerHTML = netR ? `🌐 다른 기기 대결 · 화면을 손가락으로 끌거나 <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>·방향키로 움직여요 · 대시 <kbd>F</kbd>/<kbd>Enter</kbd>` : mode === "cpu"')
patch("ah", '$("#ahRe").onclick = startMatch;', '$("#ahRe").onclick = () => netR ? NET.again() : startMatch();')
patch("ah", "e.stopPropagation(); startMatch(); return; }", "e.stopPropagation(); netR ? NET.again() : startMatch(); return; }")
patch("ah", "    window.__ahOpen = openAh;", r'''    /* 🌐 수락한 친구 기기: 내 말렛만 움직이고 나머지는 받은 대로 그려요 */
    let gRd = -1;
    function gstep(){
      frame++;
      if (shake > 0) shake *= .86; if (flash > 0) flash -= .05;
      parts = parts.filter(p => { p.x += p.vx; p.y += p.vy; if (p.k){ p.vy += .25; p.vx *= .98; p.r += .2; } else { p.vx *= .9; p.vy *= .9; } return --p.t > 0; });
      rings = rings.filter(r => { r.r += 4.5; return --r.t > 0; });
      texts = texts.filter(t => --t.t > 0);
      if (state === "play"){ puck.x += puck.vx; puck.y += puck.vy; puck.y = clamp(puck.y, Y0 + PR, Y1 - PR); const o = M[0]; o.x = clamp(o.x + o.vx, minX(o), maxX(o)); o.y = clamp(o.y + o.vy, minY(o), maxY(o)); }
      else if (state === "goal"){ puck.x += puck.vx; puck.y += puck.vy; puck.vx *= .9; puck.vy *= .9; }
      else if (state === "ready" && readyT > 0) readyT--;
      if (state === "play" || state === "ready"){
        const m = M[1], c = input(m); moveIntent(m, c);
        for (let s = 0; s < SUB; s++){ m.x = clamp(m.x + m.vx/SUB, minX(m), maxX(m)); m.y = clamp(m.y + m.vy/SUB, minY(m), maxY(m)); }
      }
      pressed.clear();
    }
    window.__ahNet = {
      isOpen: () => open,
      begin(role, a, b, x){
        netR = role; mySide = role === "guest" ? 1 : 0; NQ.length = 0; mode = "cpu"; ensure();
        if (role === "host"){ pick = [a, b]; startMatch(); M[1].ctl = "net"; $("#ahPauseBtn").hidden = true;
          texts.push({txt: "⬅ 나는 왼쪽 🟠", x: MX - 230, y: MY + 150, c: SC[0].m, s: 34, t: 150, T: 150});
          return {st: {[a]: statsOf(a), [b]: statsOf(b)}, tg: target}; }
        if (x && x.st && S.vb && S.vb.stats) Object.assign(S.vb.stats, x.st);
        if (x && x.tg) target = x.tg;
        pick = [a, b]; M = [mkMallet(a, 0, "net"), mkMallet(b, 1, "me")]; score = [0, 0]; parts = []; rings = []; texts = []; trail = []; best = 0; ptr.clear(); gRd = -1;
        puck = {x: MX, y: MY, vx: 0, vy: 0, a: 0}; readyMax = readyT = 150; state = "ready";
        $("#ahSel").hidden = true; $("#ahEnd").hidden = true; $("#ahPause").hidden = true; $("#ahPauseBtn").hidden = true; renderKeys();
        texts.push({txt: "나는 오른쪽 🔵 ➡", x: MX + 230, y: MY + 150, c: SC[1].m, s: 34, t: 150, T: 150});
      },
      snap(){ const o = M[0]; return {st: state, sc: score, rt: readyT, rm: readyMax, gt: goalT, sr: scorer, fr: frame, pk: puck, tr: trail, rg: rings, sh: shake, fl: flash, fc: flashC, rl: rally, bs: best, n: srvN,
        m: {x: o.x, y: o.y, vx: o.vx, vy: o.vy, dash: o.dash, cool: o.cool, bump: o.bump, ghosts: o.ghosts}, bp: M[1].bump}; },
      ev: () => NQ.splice(0),
      fx(e){ e.forEach(([k, ...a]) => k === "sn" ? snd(...a) : k === "sp" ? sparks(...a) : k === "cf" ? confetti(...a) : k === "sy" ? say(...a) : 0); },
      apply(d){
        if (!M[1] || M[1].ctl !== "me") return;
        if (d.n !== gRd){ gRd = d.n; const m = M[1]; m.x = homeX(1); m.y = MY; m.vx = m.vy = 0; m.dash = 0; m.cool = 0; m.ghosts = []; }
        state = d.st; score = d.sc; readyT = d.rt; readyMax = d.rm; goalT = d.gt; scorer = d.sr; frame = d.fr; puck = d.pk; trail = d.tr; rings = d.rg;
        shake = d.sh; flash = d.fl; flashC = d.fc; rally = d.rl; best = d.bs;
        Object.assign(M[0], d.m); M[1].bump = Math.max(M[1].bump, d.bp || 0);
        if (state !== "end" && !$("#ahEnd").hidden) $("#ahEnd").hidden = true;
      },
      mine(){ const m = M[1]; return {x: m.x, y: m.y, vx: m.vx, vy: m.vy, dash: m.dash, cool: m.cool, ghosts: m.ghosts}; },
      put(d){ if (M[1] && M[1].ctl === "net") Object.assign(M[1], d); },
      end(w, sc){ if (netR !== "guest") return; score = sc; endMatch(w); },
      reset(){ netR = null; mySide = 0; NQ.length = 0; },
      close(){ if (open) closeAh(); }
    };
    window.__ahOpen = openAh;''')

game_js = "\n".join(mods[k] for k in ("vb", "ah", "fl", "tr"))

# ---- 3-1) 👕 아바타 그리기 (index.html의 아바타 모듈 + 오락실 고급 아이템 자리)
s = src.index("  /* ---------- 👕 아바타: 부위별로 골라서 SVG로 그려요 ---------- */")
e = src.index("  const avMood = sid =>")
av_js = src[s:e]
def avp(a, b):
    global av_js
    c = av_js.count(a)
    if c != 1:
        sys.exit(f"[avatar] 바꿀 곳을 찾지 못했어요 ({c}곳): {a[:70]}")
    av_js = av_js.replace(a, b)
avp('const avatarOf = sid => { const a = (S.avatars||{})[sid]; return a && a.on !== false ? a : null; };',
    'const avatarOf = sid => (typeof avOf === "function" ? avOf(sid) : null);')
avp('g += BG[a.bg || "sky"] || BG.sky;',
    'g += (window.AVX && AVX.bg(a, id)) || BG[a.bg || "sky"] || BG.sky;\n    if (window.AVX) g += AVX.under(a, id);')
avp('if (a.tacc && a.tacc !== "none") g += TA[a.tacc] || "";',
    'if (a.tacc && a.tacc !== "none") g += TA[a.tacc] || "";\n    if (window.AVX) g += AVX.over(a, id);')
avp('const frame = FR[fr] || FR.basic;', 'const frame = (window.AVX && AVX.frame(a, id)) || FR[fr] || FR.basic;')
avp('return `<svg class="avs" viewBox=', 'return `<svg class="avs" xmlns="http://www.w3.org/2000/svg" viewBox=')

# ---- 4) 합치기
out = rd("shell.html")
for k, v in {
    "/*{{CSS_APP}}*/": css_app,
    "/*{{CSS_ARC}}*/": rd("arcade.css") + "\n" + rd("lobby.css") + "\n" + rd("gift.css"),
    "<!--{{GAME_HTML}}-->": game_html,
    "/*{{CORE_JS}}*/": rd("core.js"),
    "/*{{AV_JS}}*/": av_js + "\n" + rd("avatar.js"),
    "/*{{GAME_JS}}*/": game_js,
    "/*{{NEW_JS}}*/": rd("games.js") + "\n" + rd("net.js") + "\n" + rd("lobby.js") + "\n" + rd("gift.js") + "\n" + rd("games2.js") + "\n" + rd("color.js") + "\n" + rd("games3.js"),
}.items():
    assert out.count(k) == 1, k
    out = out.replace(k, v)
# ---- 5) ⚡ 렉 줄이기 · 화면 꽉 채우기 (오락실에서만)
def swap(a, b, at_least=1):
    global out
    c = out.count(a)
    if c < at_least:
        sys.exit(f"[최적화] 바꿀 곳을 찾지 못했어요 ({c}곳): {a[:70]}")
    out = out.replace(a, b)

# 캔버스 해상도: 기기 배율(최대 2)을 그대로 쓰던 걸 → 화면 크기에 맞춘 상한(PERF.dpr)으로
swap("Math.min(2, window.devicePixelRatio || 1)", "ARCDPR()", 6)
# 게임판 둘레 여백을 줄여서 화면을 더 크게
swap("w = st.clientWidth - 24, h = st.clientHeight - 12", "w = st.clientWidth - 6, h = st.clientHeight - 4", 4)
swap("(st.width - 16)/cur.W, (st.height - 16)/cur.H", "(st.width - 6)/cur.W, (st.height - 6)/cur.H")

# 손들고 말해요에서 가져온 CSS 중 오락실에서 안 쓰는 규칙 빼기
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cssprune import prune
_s, _e = out.index("<style>"), out.index("</style>")
_css = out[_s + 7:_e]
assert _css.count(css_app) == 1
_slim, _k, _d = (css_app, 0, 0) if os.environ.get("NOPRUNE") else prune(css_app, out[:_s] + out[_e:])
out = out[:_s + 7] + _css.replace(css_app, _slim) + out[_e:]
print(f"CSS 정리: 안 쓰는 규칙 {_d}개 뺌 ({_k}개 남김)")
open(os.path.join(ROOT, "arcade.html"), "w", encoding="utf-8").write(out)
print(f"arcade.html 완성 ({len(out.encode('utf-8'))//1024} KB)")
