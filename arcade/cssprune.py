"""⚡ 오락실 렉 줄이기: 손들고 말해요(index.html)에서 가져온 CSS 중
오락실 화면·코드 어디에도 안 나오는 클래스/아이디만 쓰는 규칙을 빼요.
(규칙이 적을수록 화면이 바뀔 때 브라우저가 스타일을 빨리 계산해요)
조심: 'lv' + n 처럼 코드에서 이어 붙여 만드는 이름도 지키려고, 숫자·끝 조각을 뗀 이름이 보여도 남겨 둬요."""
import re
def strip_comments(css): return re.sub(r'/\*.*?\*/', '', css, flags=re.S)
def blocks(css):
    """top-level: yields (prelude, body) ; body is inner text"""
    i=0; n=len(css); out=[]
    while i<n:
        j=css.find('{',i)
        if j<0: out.append(('__tail__',css[i:])); break
        pre=css[i:j]; d=1; k=j+1
        while k<n and d:
            if css[k]=='{': d+=1
            elif css[k]=='}': d-=1
            k+=1
        out.append((pre.strip(), css[j+1:k-1])); i=k
    return out
TOK=re.compile(r'([.#])(-?[_a-zA-Z][\w-]*)')
def prune(css, corpus):
    cache={}
    def ok_tok(t):
        if t not in cache:
            base = re.sub(r'\d+$', '', t)
            cache[t] = (t in corpus) or (base != t and len(base) >= 1 and base in corpus) or ('-' in t and t.rsplit('-', 1)[0] + '-' in corpus)
        return cache[t]
    def ok_sel(sel):
        s=re.sub(r'\[[^\]]*\]','',sel)   # attribute selectors 무시
        s=re.sub(r':not\([^)]*\)','',s)
        return all(ok_tok(m.group(2)) for m in TOK.finditer(s))
    def walk(css):
        res=[]; kept=dropped=0
        for pre,body in blocks(css):
            if pre=='__tail__': res.append(body); continue
            if pre.startswith('@media') or pre.startswith('@supports'):
                inner,k,d=walk(body); kept+=k; dropped+=d
                if inner.strip(): res.append(pre+'{'+inner+'}')
                continue
            if pre.startswith('@'):
                res.append(pre+'{'+body+'}'); continue
            sels=[x for x in split_sel(pre)]
            good=[x for x in sels if ok_sel(x)]
            if good: res.append(','.join(good)+'{'+body+'}'); kept+=1
            else: dropped+=1
        return '\n'.join(res),kept,dropped
    return walk(strip_comments(css))
def split_sel(pre):
    out=[];d=0;cur=''
    for ch in pre:
        if ch in '([': d+=1
        elif ch in ')]': d-=1
        if ch==',' and d==0: out.append(cur.strip()); cur=''
        else: cur+=ch
    if cur.strip(): out.append(cur.strip())
    return out
