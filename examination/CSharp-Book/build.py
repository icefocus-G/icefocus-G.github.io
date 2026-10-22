# -*- coding: utf-8 -*-
"""把 E:/学习内容/C#学习 下的语雀 md 原稿，按 GitHub 课程站 examination/Unity 的结构渲染成课件。
产出：index.html(总览) + m01..m08.html + course.json + README.md
"""
import os, re, html, json, hashlib

SRC = r"E:/学习内容/C#学习"

MODS = [
    # (序号, 标题, 副标题, 分类, 图标, 源文件)
    (1, "C# 入门", "变量、类型转换、运算符与流程控制", "语言地基", "🚀", "编程基础_01-C# 入门🌈🔥💎🎈 😍🎉💡🚀.md"),
    (2, "C# 基础", "枚举、数组、值类型与引用类型", "语言地基", "🧱", "编程基础_02-C#基础.md"),
    (3, "C# 核心", "封装继承多态、集合与常用类库", "面向对象", "⚡", "编程基础_03-c#核心.md"),
    (4, "C# 进阶", "委托事件、泛型、反射、特性与多线程", "语言进阶", "🛠️", "编程基础_04-C#进阶.md"),
    (5, "排序算法", "八大排序的原理、图解与复杂度", "算法与数据结构", "📊", "编程基础_05-排序算法.md"),
    (6, "C# 控制台小游戏知识补充", "控制台交互、异步等待等零碎补丁", "实战补充", "🎮", "编程基础_06-C#控制台 小游戏知识补充.md"),
    (7, "C# 面向对象思想", "六大设计原则：SRP / OCP / LSP / DIP / LOP / ISP", "面向对象", "🧠", "编程基础_08-C# 面向对象思想.md"),
    (8, "算法", "进制转换、递归与单例模式", "算法与数据结构", "🧮", "编程基础_09-算法.md"),
    (9, "C# 中英文对照表", "48 个关键字的字面含义，翻卡速记", "速查参考", "🔤", "编程基础_07-C# 中英文对照表.md"),
    (10, "C# 语法简写", "完整写法 ↔ 语法糖，一行一行对着看", "速查参考", "✂️", "编程基础_10-C# 语法简写.md"),
    (11, "练习题", "入门到核心的自测题集", "实战补充", "📝", "编程基础_10-练习题.md"),
]

CAT_ORDER = ["语言地基", "面向对象", "语言进阶", "算法与数据结构", "实战补充", "速查参考"]

# 每个模块挂哪些图形演示（id 对应 assets/anim.js 里注册的 key）
DEMO_NAME = {
    "num": "二进制点灯", "flow": "循环单步", "valueref": "值类型 vs 引用", "coll": "动态数组",
    "poly": "多态分派", "dele": "委托广播", "sort": "八大排序", "game": "贪吃蛇",
    "solid": "职责拆分", "bs": "二分查找", "recurse": "递归调用栈", "vocab": "关键字翻卡",
    "short": "语法糖对照",
}
DEMOS = {
    1: ["num"],
    2: ["flow", "valueref"],
    3: ["coll", "poly"],
    4: ["dele"],
    5: ["sort"],
    6: ["game"],
    7: ["solid"],
    8: ["bs", "recurse"],
    9: ["vocab"],
    10: ["short"],
    11: [],
}

try:
    PAIRS = json.load(open(os.path.join(r"E:/学习内容/C#学习", "pairs.json"), encoding="utf-8"))
except Exception:
    PAIRS = []


def demo_zone(no):
    ids = DEMOS.get(no) or []
    if not ids:
        return ""
    inner = []
    for did in ids:
        extra = ""
        if did == "vocab" and PAIRS:
            extra = ' data-pairs="%s"' % html.escape(
                json.dumps(PAIRS, ensure_ascii=False, separators=(",", ":")), quote=True)
        inner.append('<div data-demo="%s"%s></div>' % (did, extra))
    return ('<section class="zone">'
            '<div class="zone-h"><span>图形演示 · %d 个</span><h2>先动手，再读文字</h2>'
            '<p>下面的图都能点、能拖、能播放。先看它动，再回去读原稿，理解会快很多。</p></div>'
            '%s</section>') % (len(ids), "".join(inner))


# ---------------- 工具 ----------------
def img_name(url):
    ext = os.path.splitext(url.split("?")[0])[1] or ".png"
    return hashlib.md5(url.encode()).hexdigest()[:12] + ext


def rel_img(url):
    if url.startswith("http"):
        return "assets/img/" + img_name(url)
    return url


CJK = re.compile(r"[\u3000-\u9fff\uff00-\uffef]")


def inline(t):
    """行内渲染：代码 span / 粗体 / 斜体 / 链接。"""
    codes = []

    def keep(m):
        codes.append(m.group(1))
        return "\x01%d\x01" % (len(codes) - 1)

    t = re.sub(r"`([^`]+)`", keep, t)
    t = t.replace("<br/>", "\x02").replace("<br>", "\x02")
    t = html.escape(t, quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"(?<!\*)\*([^*\n]{1,60})\*(?!\*)", r"<i>\1</i>", t)
    t = re.sub(r"\[([^\]]+)\]\((https?://[^)\s]+)\)",
               r'<a href="\2" target="_blank" rel="noopener">\1</a>', t)
    t = re.sub(r"\[([^\]]+)\]\(([^)\s]+\.md[^)\s]*)\)", r"\1", t)
    t = re.sub("\x01(\\d+)\x01",
               lambda m: "<code>" + html.escape(codes[int(m.group(1))], quote=False) + "</code>", t)
    t = t.replace("\x02", "<br>")
    return t


def figure(url, cap=""):
    src = rel_img(url)
    fc = "<figcaption>%s</figcaption>" % inline(cap) if cap.strip() else ""
    return '<figure class="fig"><img loading="lazy" src="%s" alt="">%s</figure>' % (src, fc)


RE_IMG_ONLY = re.compile(r"^\s*!\[([^\]]*)\]\((https?://[^)\s]+|[^)\s]+)\)\s*$")


def looks_like_code(s):
    t = s.strip()
    if not t:
        return False
    if t.startswith("//") or t.startswith("/*") or t.startswith("#region") or t.startswith("#endregion"):
        return True
    if re.search(r"[;{}]\s*$", t):
        return True
    if re.match(r"^(public|private|protected|internal|static|sealed|abstract|void|int|float|double|string|bool|"
                r"char|byte|class|struct|enum|interface|delegate|event|using|namespace|return|if|else|for|"
                r"foreach|while|do|switch|case|break|continue|try|catch|finally|throw|var|new|this|base|"
                r"override|virtual|readonly|const|params|ref|out|in|get|set|yield|await|async)\b", t):
        return True
    if any(k in t for k in ("Console.", "Debug.Log", "Mathf.", "List<", "Dictionary<")):
        return True
    return False


def looks_prose(s):
    """夹在代码中间的中文说明行：含汉字、不像代码、也不以代码符号收尾。"""
    t = s.strip()
    if not t or t.startswith("//") or t.startswith("/*") or t.startswith("*"):
        return False
    if not CJK.search(t):
        return False
    if re.search(r"[;{}]\s*$", t) or t.endswith(")") or t.endswith(","):
        return False
    han = len(CJK.findall(t))
    return han / max(1, len(t.replace(" ", ""))) > 0.35


def guess_lang(code):
    if re.search(r"\b(class|struct|enum|interface|namespace|delegate|event|void|public|private|protected|"
                 r"internal|static|sealed|abstract|override|virtual|return|new|try|catch|using|foreach|"
                 r"Console\.|Debug\.|var |int |string |float |double |bool )|[;{][ \t]*$", code, re.M):
        return "C#", "csharp"
    return "TEXT", "text"


# ---------------- 解析 ----------------
def parse(md):
    lines = md.replace("\r\n", "\n").replace("\r", "\n").split("\n")

    # 先算标题基准层级
    levels = [len(m.group(1)) for m in (re.match(r"^(#{1,6})\s+", l) for l in lines) if m]
    base = min(levels) if levels else 2

    out = []          # (html, meta)
    heads = []        # 目录项
    stats = {"code": 0, "img": 0, "tbl": 0, "chars": 0}

    def lv(raw):
        return max(2, min(5, raw - base + 2))

    def hslug(text, used):
        s = re.sub(r"[^\w\u4e00-\u9fff]+", "-", text).strip("-").lower()
        s = s or "h"
        k, i = s, 1
        while s in used:
            i += 1
            s = "%s-%d" % (k, i)
        used.add(s)
        return s

    used = set()
    para = []
    i, n = 0, len(lines)

    def flush():
        nonlocal para
        if not para:
            return
        txt = " ".join(x.strip() for x in para if x.strip())
        para = []
        if not txt:
            return
        # 行内图片抽出来当图
        imgs = re.findall(r"!\[([^\]]*)\]\(([^)\s]+)\)", txt)
        txt = re.sub(r"!\[([^\]]*)\]\(([^)\s]+)\)", "", txt).strip()
        if txt:
            stats["chars"] += len(re.sub(r"\s", "", txt))
            out.append('<p class="tx">%s</p>' % inline(txt))
        for alt, u in imgs:
            stats["img"] += 1
            out.append(figure(u, alt))

    while i < n:
        raw = lines[i]
        s = raw.strip()

        if not s:
            flush()
            i += 1
            continue

        # 代码围栏
        m = re.match(r"^```\s*([A-Za-z0-9#+._-]*)", s)
        if m:
            flush()
            lang_tag, i = m.group(1), i + 1
            body = []
            while i < n and not lines[i].strip().startswith("```"):
                body.append(lines[i])
                i += 1
            i += 1
            code = "\n".join(body).strip("\n")
            label, dl = guess_lang(code)
            if lang_tag:
                label, dl = ("C#", "csharp") if lang_tag.lower() in ("csharp", "cs", "c#") else (lang_tag.upper(), lang_tag)
            stats["code"] += 1
            stats["chars"] += len(re.sub(r"\s", "", code))
            out.append(
                '<div class="cpair"><div class="chead"><span class="lang">%s</span>'
                '<span class="csp"></span><button class="mini copy">复制</button></div>'
                '<pre class="code" data-lang="%s"><code>%s</code></pre>'
                '<div class="cout" hidden></div></div>' % (label, dl, html.escape(code, quote=False)))
            continue

        # 标题
        m = re.match(r"^(#{1,6})\s+(.*)$", s)
        if m:
            flush()
            lv_raw, text = len(m.group(1)), m.group(2)
            mi = RE_IMG_ONLY.match(text)
            if mi:
                stats["img"] += 1
                out.append(figure(mi.group(2), mi.group(1)))
                i += 1
                continue
            clean = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", text)
            clean = clean.replace("**", "").strip()
            if not clean:
                i += 1
                continue
            L = lv(lv_raw)
            hid = hslug(clean, used)
            stats["chars"] += len(re.sub(r"\s", "", clean))
            heads.append({"lv": L, "id": hid, "text": clean})
            out.append('<h%d id="%s" class="hd lv%d">%s</h%d>' % (L, hid, L, inline(clean), L))
            i += 1
            continue

        # 表格
        if s.startswith("|") and s.count("|") >= 2:
            flush()
            rows = []
            while i < n and lines[i].strip().startswith("|"):
                t = lines[i].strip()
                if re.match(r"^\|[\s:|-]+\|$", t):
                    i += 1
                    continue
                cells = [c.strip() for c in t.strip("|").split("|")]
                rows.append(cells)
                i += 1
            if rows:
                w = max(len(r) for r in rows)
                rows = [r + [""] * (w - len(r)) for r in rows]
                stats["tbl"] += 1
                body = "".join("<tr>%s</tr>" % "".join("<td>%s</td>" % inline(c) for c in r) for r in rows)
                out.append('<div class="tw"><table class="tb">%s</table></div>' % body)
            continue

        # 引用
        if s.startswith(">"):
            flush()
            buf = []
            while i < n and lines[i].strip().startswith(">"):
                buf.append(lines[i].strip().lstrip(">").strip())
                i += 1
            out.append('<blockquote class="bq">%s</blockquote>' % inline(" ".join(buf)))
            continue

        # 列表
        if re.match(r"^([-*+]|\d+[.)])\s+", s):
            flush()
            ordered = bool(re.match(r"^\d+[.)]\s+", s))
            items = []
            while i < n:
                t = lines[i].strip()
                if not t:
                    break
                m2 = re.match(r"^([-*+]|\d+[.)])\s+(.*)$", t)
                if not m2:
                    if items and not re.match(r"^(#{1,6}\s|\||```|>)", t) and not looks_like_code(t):
                        items[-1] += " " + t
                        i += 1
                        continue
                    break
                items.append(m2.group(2))
                i += 1
            tag = "ol" if ordered else "ul"
            lis = "".join("<li>%s</li>" % inline(x) for x in items)
            stats["chars"] += sum(len(re.sub(r"\s", "", x)) for x in items)
            out.append('<%s class="bl">%s</%s>' % (tag, lis, tag))
            continue

        # 独占一行的图片
        mi = RE_IMG_ONLY.match(s)
        if mi:
            flush()
            stats["img"] += 1
            out.append(figure(mi.group(2), mi.group(1)))
            i += 1
            continue

        # 裸代码
        if looks_like_code(s):
            flush()
            body = []
            while i < n:
                t = lines[i]
                if not t.strip():
                    # 空行后面还是代码才继续
                    j = i + 1
                    while j < n and not lines[j].strip():
                        j += 1
                    if j < n and looks_like_code(lines[j]) and not looks_prose(lines[j]):
                        body.append("")
                        i += 1
                        continue
                    break
                if re.match(r"^(#{1,6})\s+", t.strip()) or t.strip().startswith("|"):
                    break
                if body and looks_prose(t):
                    break
                body.append(t.rstrip())
                i += 1
            code = "\n".join(body).strip("\n")
            if code.strip():
                label, dl = guess_lang(code)
                stats["code"] += 1
                stats["chars"] += len(re.sub(r"\s", "", code))
                out.append(
                    '<div class="cpair"><div class="chead"><span class="lang">%s</span>'
                    '<span class="csp"></span><button class="mini copy">复制</button></div>'
                    '<pre class="code" data-lang="%s"><code>%s</code></pre>'
                    '<div class="cout" hidden></div></div>' % (label, dl, html.escape(code, quote=False)))
            continue

        para.append(raw)
        i += 1

    flush()
    return out, heads, stats


# ---------------- 页面组装 ----------------
def nav_html(cur):
    groups = []
    for cat in CAT_ORDER:
        items = [m for m in MODS if m[3] == cat]
        if not items:
            continue
        lis = "".join(
            '<a href="m%02d.html"%s>%s</a>' % (m[0], ' class="on"' if m[0] == cur else "", m[1])
            for m in items)
        groups.append('<div class="ng"><div class="ngt">%s</div>%s</div>' % (cat, lis))
    return '<nav class="navbox">%s</nav>' % "".join(groups)


HEAD = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} · C# 交互课件</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%2368217a'/%3E%3Ctext x='32' y='45' font-size='36' font-family='monospace' font-weight='700' fill='%23fff' text-anchor='middle'%3E%23%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="assets/style.css">
<link rel="stylesheet" href="assets/anim.css">
</head>
<body data-mid="m{no:02d}">
<header class="top">
  <a class="brand" href="index.html"><span class="logo">C#</span><b>C#</b><i>交互课件</i></a>
  <div class="crumb"><span>{cat}</span><em>/</em><strong>{title}</strong></div>
  <div class="top-r">
    <span class="stat">{chars} 字 · {code} 代码 · {img} 图 · {tbl} 表</span>
    <button class="mini" id="btnNav">目录</button>
  </div>
</header>
<div class="wrap">
  <aside class="side" id="side">
    <div class="side-h">本篇目录</div>
    {toc_side}
    <div class="side-h">全部模块</div>
    {nav}
  </aside>
  <main class="main">
    <div class="mhead">
      <div class="kick">{cat} · 模块 {no:02d}</div>
      <h1>{title}</h1>
      <p class="msub">{sub}</p>
      <div class="chips"><span>{chars} 字原稿</span><span>{code} 段代码</span><span>{img} 张配图</span><span>{tbl} 个表格</span></div>
    </div>
{demos}
    <article class="doc">
{body}
    </article>
    <footer class="pnbar">{prev}{next}</footer>
  </main>
</div>
<button class="totop" id="totop">↑</button>
<script src="assets/app.js"></script>
<script src="assets/anim.js"></script>
</body>
</html>
"""


def build():
    rendered = {}
    for no, title, sub, cat, ico, fn in MODS:
        path = os.path.join(SRC, fn)
        if not os.path.exists(path):
            path = os.path.join(SRC, "原稿", fn)
        md = open(path, encoding="utf-8").read()
        body, heads, st = parse(md)
        # 目录：标题太多时只保留前两级
        maxlv = 3 if len(heads) > 60 else 4
        toc = "".join('<a class="toc lv%d" href="#%s">%s</a>' % (h["lv"], h["id"], inline(h["text"]))
                      for h in heads if h["lv"] <= maxlv)
        rendered[no] = dict(title=title, sub=sub, cat=cat, ico=ico, src=fn,
                            body="\n".join(body), toc=toc, heads=len(heads), **st)

    # 章节页
    for no, title, sub, cat, ico, fn in MODS:
        r = rendered[no]
        if r["toc"]:
            toc_side = '<nav class="tocbox">%s</nav>' % r["toc"]
        else:
            toc_side = ('<div style="padding:0 14px 12px;font-size:12.5px;line-height:1.7;color:#8a96a8">'
                        '本篇原稿没有分级标题，按正文顺序阅读。</div>')
        prev = ""
        nxt = ""
        if no > 1:
            p = rendered[no - 1]
            prev = '<a class="pn prev" href="m%02d.html"><span>上一节</span>%s</a>' % (no - 1, p["title"])
        if no < len(MODS):
            q = rendered[no + 1]
            nxt = '<a class="pn next" href="m%02d.html"><span>下一节</span>%s</a>' % (no + 1, q["title"])
        htmltxt = HEAD.format(
            title=title, sub=sub, cat=cat, no=no, toc=r["toc"], toc_side=toc_side, nav=nav_html(no),
            chars=f'{r["chars"]:,}'.replace(",", ""), code=r["code"], img=r["img"], tbl=r["tbl"],
            demos=demo_zone(no), body=r["body"], prev=prev, next=nxt)
        open(os.path.join(SRC, "m%02d.html" % no), "w", encoding="utf-8").write(htmltxt)

    # 总览
    tot_chars = sum(r["chars"] for r in rendered.values())
    tot_code = sum(r["code"] for r in rendered.values())
    tot_img = sum(r["img"] for r in rendered.values())
    tot_tbl = sum(r["tbl"] for r in rendered.values())

    cats = []
    for cat in CAT_ORDER:
        items = [r for r in rendered.values() if r["cat"] == cat]
        if not items:
            continue
        cards = []
        for no, title, sub, catg, ico, fn in MODS:
            if catg != cat:
                continue
            r = rendered[no]
            cards.append(
                '<a class="card" href="m%02d.html"><div class="card-t">%s %s</div>'
                '<div class="card-s">%s</div>'
                '<div class="card-m"><b>%d</b> 字 · %d 代码 · %d 图%s</div></a>'
                % (no, ico, title, sub, r["chars"], r["code"], r["img"],
                   (' · <b>%d</b> 演示' % len(DEMOS[no])) if DEMOS.get(no) else ""))
        cats.append('<section class="cat"><h2><i></i>%s</h2><div class="grid">%s</div></section>'
                    % (cat, "".join(cards)))

    index = """<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>C# 交互课件 · 总目录</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%2368217a'/%3E%3Ctext x='32' y='45' font-size='36' font-family='monospace' font-weight='700' fill='%23fff' text-anchor='middle'%3E%23%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="assets/style.css">
<link rel="stylesheet" href="assets/anim.css"></head>
<body class="home">
<header class="top">
  <a class="brand" href="index.html"><span class="logo">C#</span><b>C#</b><i>交互课件</i></a>
  <div class="crumb"><span>总目录</span></div>
  <div class="top-r"><span class="stat">{chars} 字 · {code} 代码 · {img} 图 · {tbl} 表</span></div>
</header>
<main class="homewrap">
  <div class="hero">
    <div class="kick">图形化 · 可操作 · 有动画</div>
    <h1>C# 交互课件</h1>
    <p>内容来自语雀《C# 学习》知识库 {n} 篇原稿，按语言地基 / 面向对象 / 语言进阶 / 算法与数据结构 / 实战补充 / 速查参考 六个分类重排。
    每个模块都配了可以直接上手动的图形演示：进制点灯、循环单步、值类型与引用类型、动态数组增删、多态分派、委托广播、八大排序动画、可玩的贪吃蛇、二分查找、递归调用栈。</p>
    <p>正文仍然是语雀原稿逐块还原，一字未改；演示是额外的「先看懂再读」层。{chars} 字、{code} 段代码、{img} 张配图全部本地化，不依赖外链。</p>
    <div class="hero-stat">
      <div><b>{chars}</b><span>正文字数</span></div>
      <div><b>{code}</b><span>代码段</span></div>
      <div><b>{img}</b><span>配图</span></div>
      <div><b>{n}</b><span>个模块</span></div>
      <div><b>13</b><span>个互动演示</span></div>
    </div>
  </div>
  <section class="zone home">
    <div class="zone-h"><span>先玩一下</span><h2>排序算法 · 一步一步看</h2>
      <p>选算法、点播放，看得见每一次比较和交换。五个分类里都有这样的演示。</p></div>
    <div data-demo="sort"></div>
  </section>
{cats}
  <div class="foot">原稿 07（中英文对照表）、10（语法简写 / 练习题）本次已从语雀补全。</div>
</main>
<script src="assets/anim.js"></script>
</body></html>
""".format(chars="{:,}".format(tot_chars), code=tot_code, img=tot_img, tbl=tot_tbl,
           n=len(MODS), cats="\n".join(cats))
    open(os.path.join(SRC, "index.html"), "w", encoding="utf-8").write(index)

    # course.json
    cj = {
        "cn": "C# 语言基础",
        "en": "C# Programming",
        "code": "CSHARP",
        "ico": "🧩",
        "order": 6,
        "status": "live",
        "theme": "#68217a",
        "desc": "语雀《C# 学习》11 篇原稿还原成 %d 个模块的交互课件：%s 字、%d 段代码、%d 张配图全部本地化，另有 13 个可直接上手的图形演示（含八大排序动画、贪吃蛇、二分查找、递归调用栈）。" % (
            len(MODS), format(tot_chars, ","), tot_code, tot_img),
        "mods": ["%d 模块" % len(MODS), "{:,} 字".format(tot_chars), "13 个交互演示", "%d 张图" % tot_img],
        "entry": "index.html",
        "note": "阅读型课件 + 图形演示，无判分题库",
        "_说明": [
            "entry 相对本课程目录，直接指向课件首页 index.html（不走 shell/study.html 通用壳）。",
            "本课程没有题库，故不填 storage / total —— 课程中心会按「阅读型」显示。",
            "内页 m01.html ~ m%02d.html 与 index.html 同级，assets/ 存放样式、脚本与全部配图。" % len(MODS),
            "内容由 build.py 从 原稿/*.md 渲染，改原稿后重跑即可，不用手改 HTML。",
        ],
    }
    open(os.path.join(SRC, "course.json"), "w", encoding="utf-8").write(
        json.dumps(cj, ensure_ascii=False, indent=2) + "\n")

    # README
    rows = "\n".join("| m%02d | %s | %s | %s 字 · %d 代码 · %d 图 | %s |"
                     % (no, t, c, format(rendered[no]["chars"], ","), rendered[no]["code"], rendered[no]["img"],
                        "、".join(DEMO_NAME.get(d, d) for d in DEMOS.get(no, [])) or "—")
                     for no, t, s, c, i, f in MODS)
    readme = """# C# 交互课件

语雀《C# 学习》知识库 11 篇原稿 → 按 6 个分类 / {n} 个模块重组，并给每个模块挂上可直接操作的图形演示。

## 怎么打开

双击 `index.html`，或用任意静态服务器打开本目录。首页顶部就能玩排序动画；各模块页在正文之前是「图形演示」区。

## 目录结构

```
C#学习/
├── index.html           总目录 + 排序演示
├── m01.html … m{n:02d}.html   {n} 个模块页
├── assets/
│   ├── style.css        版式（与 Unity 课件同一套）
│   ├── anim.css         图形演示层样式
│   ├── anim.js          13 个交互演示（rAF 驱动，Canvas / SVG / DOM）
│   ├── app.js           代码高亮 / 复制 / 目录高亮 / 图片放大
│   └── img/             {img} 张配图（已从语雀 CDN 本地化）
├── build.py             重新生成整套课件（改完 原稿/*.md 跑一次即可）
├── pairs.json           07 对照表抽出的 48 组词条，供翻卡演示使用
├── course.json          课程中心配置（order 6，theme #68217a）
├── README.md
└── 原稿/                11 篇语雀 md 原件
```

## 模块与演示

| 页 | 模块 | 分类 | 体量 | 演示 |
|---|---|---|---|---|
{rows}

合计 {chars} 字、{code} 段代码、{img} 张配图、{tbl} 个表格、13 个交互演示。

## 交互演示清单

| 演示 | 位置 | 类型 |
|---|---|---|
| 二进制点灯 | m01 | 点击位开关，实时换算 2/8/16 进制，可看除 2 取余 |
| for 循环单步 | m02 | 代码高亮跟帧执行，i / sum / 条件同步变化 |
| 值类型 vs 引用类型 | m02 | SVG + 补间动画，看复制的是数据还是地址 |
| 动态数组增删 | m03 | 元素平移 + 扩容，count / capacity 实时变 |
| 多态分派 | m03 | 脉冲沿调用链跑到真实类型的方法 |
| 委托与事件 | m04 | 订阅 / 退订，按注册顺序逐个回调 |
| 八大排序 | m05 | Canvas 逐帧演示冒泡/选择/插入/希尔/快排/归并/堆/计数 |
| 贪吃蛇 | m06 | 可玩，键盘 + 触屏方向键 |
| 职责拆分 | m07 | 上帝类按 SRP 拆成三类，再演示 OCP 扩展 |
| 二分查找 | m08 | 区间收缩 + mid 指针，逐步排除 |
| 递归调用栈 | m08 | 栈帧压入弹出，返回值回代 |
| 关键字翻卡 | m09 | 48 组词条点击翻面 |
| 语法糖对照 | m10 | 完整写法 ↔ 简写切换 |

## 说明

- 正文是语雀原稿逐块还原，一字未删改；`#region` 之类裸露在围栏外的代码按上下文重建成代码块。
- 07 / 10 两篇（中英文对照表、语法简写、练习题）是通过扫码登录语雀后补抓的，此前本地导出缺失。
- 改完 `原稿/` 里的 md，执行 `python build.py` 即可整站重建。
- 首页 `course.json` 的 `order` 为 6，接在 Unity(3) / Unity-Book(4) / CSharp-Map(5) 之后。
""".format(n=len(MODS), img=tot_img, rows=rows, chars=format(tot_chars, ","), code=tot_code, tbl=tot_tbl)
    open(os.path.join(SRC, "README.md"), "w", encoding="utf-8").write(readme)

    print("built:", len(MODS), "modules")
    for no in sorted(rendered):
        r = rendered[no]
        print("  m%02d %-28s %6d字 %4d代码 %3d图 %2d表 %3d标题"
              % (no, r["title"], r["chars"], r["code"], r["img"], r["tbl"], r["heads"]))
    print("total:", tot_chars, tot_code, tot_img, tot_tbl)


if __name__ == "__main__":
    build()
