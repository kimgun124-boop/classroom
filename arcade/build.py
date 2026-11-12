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

game_js = "\n".join(mods[k] for k in ("vb", "ah", "fl", "tr"))

# ---- 4) 합치기
out = rd("shell.html")
for k, v in {
    "/*{{CSS_APP}}*/": css_app,
    "/*{{CSS_ARC}}*/": rd("arcade.css"),
    "<!--{{GAME_HTML}}-->": game_html,
    "/*{{CORE_JS}}*/": rd("core.js"),
    "/*{{GAME_JS}}*/": game_js,
    "/*{{NEW_JS}}*/": rd("games.js"),
}.items():
    assert out.count(k) == 1, k
    out = out.replace(k, v)
open(os.path.join(ROOT, "arcade.html"), "w", encoding="utf-8").write(out)
print(f"arcade.html 완성 ({len(out.encode('utf-8'))//1024} KB)")
