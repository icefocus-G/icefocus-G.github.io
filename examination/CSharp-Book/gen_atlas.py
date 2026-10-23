# -*- coding: utf-8 -*-
"""把 CSharp-Book 的 11 个模块页，重排成「源码图谱」风格：
   左侧卡片导航 + 顶部面包屑 + 精读 / 代码 / 图示 三页签。

   输入：index.html（模块元信息）、m01..m11.html（已渲染正文）
   输出：覆盖写 index.html 与 m0x.html；原文件备份到 _legacy/
"""
import os, re, json, shutil, html

HERE = os.path.dirname(os.path.abspath(__file__))
LEG = os.path.join(HERE, '_legacy')

CAT_ORDER = ["语言地基", "面向对象", "语言进阶", "算法与数据结构", "实战补充", "速查参考"]
TOTAL_LABEL = "C# 语言图谱"


def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def write(p, s):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)


def parse_cards(idx):
    """从旧总目录里抽模块元信息。"""
    mods = []
    for sec in re.finditer(r'<section class="cat"><h2>.*?</h2><div class="grid">(.*?)</div></section>', idx, re.S):
        head = re.search(r'<section class="cat"><h2>(.*?)</h2>', sec.group(0), re.S).group(1)
        cat = re.sub(r'<[^>]+>', '', head).strip()
        for m in re.finditer(r'<a class="card" href="(m\d+\.html)">(.*?)</a>', sec.group(1), re.S):
            href, inner = m.group(1), m.group(2)
            t = re.search(r'<div class="card-t">(.*?)</div>', inner, re.S)
            s = re.search(r'<div class="card-s">(.*?)</div>', inner, re.S)
            mm = re.search(r'<div class="card-m">(.*?)</div>', inner, re.S)
            title_raw = re.sub(r'<[^>]+>', '', t.group(1)).strip() if t else href
            ico = ''
            parts = title_raw.split(' ', 1)
            if parts and len(parts[0]) <= 3 and not parts[0][0].isalnum():
                ico, title_raw = parts[0], parts[1]
            meta = re.sub(r'<[^>]+>', '', mm.group(1)).strip() if mm else ''
            nums = re.findall(r'(\d[\d,]*)', meta)
            words = nums[0].replace(',', '') if len(nums) > 0 else '0'
            code = nums[1] if len(nums) > 1 else '0'
            figs = nums[2] if len(nums) > 2 else '0'
            demos = nums[3] if len(nums) > 3 else '0'
            mods.append(dict(
                id=href[:-5], href=href, cat=cat, ico=ico, title=title_raw,
                sub=re.sub(r'<[^>]+>', '', s.group(1)).strip() if s else '',
                words=words, code=code, figs=figs, demos=demos,
            ))
    return mods


def extract(page):
    """抽出演示区与正文。"""
    zone = ''
    m = re.search(r'<section class="zone">.*?</section>', page, re.S)
    if m:
        zone = m.group(0)
    doc = ''
    m = re.search(r'<article class="doc">(.*?)</article>\s*</main>', page, re.S)
    if m:
        doc = m.group(1)
    if not doc:
        m = re.search(r'<article class="doc">(.*?)</article>', page, re.S)
        doc = m.group(1) if m else ''
    return zone, doc


def rail(mods, cur_id):
    out = ['<aside id="rail">',
           '<div class="brand"><h1><span class="dot"></span>%s</h1>'
           '<p>11 模块 · 112,173 字 · 296 段代码 · 13 个演示</p></div>' % TOTAL_LABEL,
           '<div class="searchwrap"><input id="q" type="search" placeholder="搜索模块 / 关键词…" autocomplete="off"></div>',
           '<div class="cards">']
    for cat in CAT_ORDER:
        group = [m for m in mods if m['cat'] == cat]
        if not group:
            continue
        out.append('<div class="catg" data-cat="%s">%s</div>' % (cat, cat))
        for m in group:
            out.append(
                '<a class="mcard%s" data-id="%s" data-cat="%s" data-text="%s" href="%s">'
                '<span class="rd">已读</span>'
                '<div class="t"><i>%s</i><span>%s</span></div>'
                '<div class="s">%s</div>'
                '<div class="m">%s 字 · %s 代码 · %s 图 · %s 演示</div>'
                '<div class="bar"><i></i></div></a>' % (
                    ' on' if m['id'] == cur_id else '', m['id'], cat,
                    html.escape(m['title'] + ' ' + m['sub'] + ' ' + cat, quote=True),
                    m['href'], m['ico'], m['title'], m['sub'],
                    m['words'], m['code'], m['figs'], m['demos']))
    out.append('</div>')
    out.append('<div class="railfoot"><span>阅读进度</span><b data-prog>0%</b></div>')
    out.append('</aside>')
    return '\n'.join(out)


def module_page(mods, m, zone, doc):
    i = mods.index(m)
    prev = mods[i - 1] if i > 0 else None
    nxt = mods[i + 1] if i < len(mods) - 1 else None
    pager = ['<div class="pager">']
    if prev:
        pager.append('<a href="%s">← %s %s</a>' % (prev['href'], prev['ico'], prev['title']))
    else:
        pager.append('<span class="pager-ghost ghost">已是第一篇</span>')
    pager.append('<button id="markBtn" class="mark">标记已读</button>')
    if nxt:
        pager.append('<a href="%s">%s %s →</a>' % (nxt['href'], nxt['ico'], nxt['title']))
    else:
        pager.append('<span class="pager-ghost ghost">已是最后一篇</span>')
    pager.append('</div>')

    demos = m['demos']
    return """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} · {total}</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%236366f1'/%3E%3Ctext x='32' y='44' font-size='34' font-family='monospace' font-weight='700' fill='%23fff' text-anchor='middle'%3E%23%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="assets/atlas.css">
<link rel="stylesheet" href="assets/anim.css">
</head>
<body data-mid="{mid}">
<div id="app">
{rail}
<main id="main">
  <header id="topbar">
    <button class="mtoggle" id="railToggle" aria-label="目录">☰</button>
    <div class="crumbbar">
      <span class="kicker">{cat}</span>
      <h2>{title}</h2>
      <span class="one">{sub}</span>
    </div>
    <nav class="tabs" id="tabs">
      <button data-p="read" class="on">精读{dtag}</button>
      <button data-p="code">代码 <em id="tabCodeN">{code}</em></button>
      <button data-p="fig">图示 <em id="tabFigN">{figs}</em></button>
    </nav>
  </header>
  <section id="view">
    <div class="panel on" data-p="read">
      <div class="mhead">
        <div class="kick">{cat} · 第 {no} 模块</div>
        <h1>{ico} {title}</h1>
        <div class="chips">
          <span class="chip"><b>{words}</b> 字</span>
          <span class="chip"><b>{code}</b> 代码</span>
          <span class="chip"><b>{figs}</b> 配图</span>
          <span class="chip"><b>{demos}</b> 演示</span>
        </div>
      </div>
      {zone}
      <article class="doc">{doc}</article>
      {pager}
    </div>
    <div class="panel" data-p="code">
      <div class="mhead"><div class="kick">代码速览</div><h1>本模块的 {code} 段代码</h1>
      <p style="font-size:12.5px;color:var(--sub);margin:6px 0 0">按出现顺序排列，标的是所在小节。点「复制」可取走整段，点「▶ 运行」看它在 dotnet 里的真实输出 —— 本模块 <b data-runcount>—</b> 段能独立编译，标着「片段」的是原稿里混了讲解文字、跑不起来的段落。</p></div>
      <div class="codelist" id="codeList"></div>
      {pager}
    </div>
    <div class="panel" data-p="fig">
      <div class="mhead"><div class="kick">配图</div><h1>本模块的 {figs} 张图</h1>
      <p style="font-size:12.5px;color:var(--sub);margin:6px 0 0">点任意一张放大查看。</p></div>
      <div class="figgrid" id="figGrid"></div>
      {pager}
    </div>
  </section>
</main>
</div>
<script>window.BOOK_MODS={mods_json};</script>
<script src="assets/anim.js"></script>
<script src="assets/atlas.js"></script>
</body>
</html>
""".format(
        title=m['title'], total=TOTAL_LABEL, mid=m['id'], cat=m['cat'], sub=m['sub'],
        ico=m['ico'], no=mods.index(m) + 1, words=m['words'], code=m['code'],
        figs=m['figs'], demos=m['demos'],
        dtag=('<em>%s 演示</em>' % demos) if demos != '0' else '',
        zone=zone, doc=doc, pager='\n      '.join(pager),
        rail=rail(mods, m['id']),
        mods_json=json.dumps([{k: mm[k] for k in ('id', 'href', 'cat', 'ico', 'title', 'sub')} for mm in mods],
                             ensure_ascii=False),
    )


def home_page(mods, sort_demo):
    words = sum(int(m['words'] or 0) for m in mods)
    code = sum(int(m['code'] or 0) for m in mods)
    figs = sum(int(m['figs'] or 0) for m in mods)
    demos = sum(int(m['demos'] or 0) for m in mods)
    cats = [c for c in CAT_ORDER if any(m['cat'] == c for m in mods)]

    fbtns = ['<button class="fbtn on" data-cat="all">全部 %d</button>' % len(mods)]
    for c in cats:
        n = len([m for m in mods if m['cat'] == c])
        fbtns.append('<button class="fbtn" data-cat="%s">%s %d</button>' % (c, c, n))

    cards = []
    for i, m in enumerate(mods):
        cards.append(
            '<a class="mcard2" href="{href}" data-cat="{cat}">'
            '<span class="no">M{no:02d}</span><div class="ico">{ico}</div>'
            '<h3>{title}</h3><div class="s">{sub}</div>'
            '<div class="cat">{cat}</div>'
            '<div class="m">{words} 字 · {code} 代码 · {figs} 图 · {demos} 演示</div>'
            '</a>'.format(no=i + 1, href=m['href'], cat=m['cat'], ico=m['ico'], title=m['title'],
                          sub=m['sub'], words=m['words'], code=m['code'], figs=m['figs'], demos=m['demos']))

    return """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{total} · 总目录</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%236366f1'/%3E%3Ctext x='32' y='44' font-size='34' font-family='monospace' font-weight='700' fill='%23fff' text-anchor='middle'%3E%23%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="assets/atlas.css">
<link rel="stylesheet" href="assets/anim.css">
</head>
<body>
<div id="app">
{rail}
<main id="main">
  <header id="topbar">
    <button class="mtoggle" id="railToggle" aria-label="目录">☰</button>
    <div class="crumbbar">
      <span class="kicker">ROOT</span>
      <h2>总览</h2>
      <span class="one">11 个模块 · 六个分类 · 先玩再读</span>
    </div>
    <nav class="tabs" id="tabs"></nav>
  </header>
  <section id="view">
    <div class="hero">
      <span class="kick">图形化 · 可操作 · 有动画</span>
      <h1>C# 语言图谱</h1>
      <p>语雀《C# 学习》11 篇原稿逐块还原，按六个分类重排成 11 个模块；每段代码都能单独抽出、每张图都能放大、每个模块都配了可以直接上手的图形演示。</p>
      <p>正文一字未改，演示是额外的「先看懂再读」层。代码段可以点「▶ 运行」看 dotnet 的真实输出 —— 结果由 GitHub Actions 预先跑好、页面只做回放，全站仍是纯静态。296 段里 35 段能独立编译，其余是原稿代码块里混了讲解文字的片段。</p>
      <div class="kpis">
        <div class="kpi"><b>{words}</b><span>正文字数</span></div>
        <div class="kpi"><b>{code}</b><span>代码段</span></div>
        <div class="kpi"><b>{figs}</b><span>配图</span></div>
        <div class="kpi"><b>{nmods}</b><span>模块</span></div>
        <div class="kpi"><b>{demos}</b><span>互动演示</span></div>
      </div>
    </div>

    <section class="zone" style="margin-top:22px">
      <div class="zone-h"><span>先玩一下</span><h2>排序算法 · 一步一步看</h2>
      <p>选算法、点播放，看得见每一次比较和交换。各模块页里还有进制点灯、多态分派、委托广播等 12 个演示。</p></div>
      {sort_demo}
    </section>

    <div class="filters">{filters}</div>
    <div class="mgrid">{cards}</div>
  </section>
</main>
</div>
<script>window.BOOK_MODS={mods_json};</script>
<script src="assets/anim.js"></script>
<script src="assets/atlas.js"></script>
</body>
</html>
""".format(total=TOTAL_LABEL, rail=rail(mods, ''), words='{:,}'.format(words), code=code,
           figs=figs, nmods=len(mods), demos=demos, sort_demo=sort_demo,
           filters=''.join(fbtns), cards=''.join(cards),
           mods_json=json.dumps([{k: m[k] for k in ('id', 'href', 'cat', 'ico', 'title', 'sub')} for m in mods],
                                ensure_ascii=False))


def main():
    os.makedirs(LEG, exist_ok=True)
    idx = read(os.path.join(HERE, 'index.html'))
    mods = parse_cards(idx)

    # 首页排序演示块
    sort_demo = ''
    m = re.search(r'<div data-demo="sort"></div>', idx)
    if m:
        sort_demo = m.group(0)

    # 备份
    for m in mods:
        p = os.path.join(HERE, m['href'])
        if os.path.exists(p):
            shutil.copy2(p, os.path.join(LEG, m['href']))
    shutil.copy2(os.path.join(HERE, 'index.html'), os.path.join(LEG, 'index.html'))

    for m in mods:
        p = os.path.join(HERE, m['href'])
        old = read(p)
        zone, doc = extract(old)
        write(p, module_page(mods, m, zone, doc))
        print('  重写', m['href'], m['title'], '| 演示', m['demos'], '| 正文', len(doc), 'B')

    write(os.path.join(HERE, 'index.html'), home_page(mods, sort_demo))
    print('  重写 index.html | 模块', len(mods))
    print('完成。原文件备份在 _legacy/')


if __name__ == '__main__':
    main()
