# -*- coding: utf-8 -*-
"""构建 examination/GameTech-Addon 课程页。
用法：cd 到本目录，python3 build.py
产物：index.html / m01..m05.html / assets/style.css / assets/app.js / course.json
全部离线可读，无外部 CDN 依赖。
"""
import html
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from content_a import M01, M02
from content_b import M03, M04, M05

MODULES = [M01, M02, M03, M04, M05]
# 本脚本在 _src/ 下，产物输出到上一级课程目录
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(HERE, "assets")

COURSE = {
    "cn": "游戏开发补充技术栈",
    "en": "Game Dev Tech Addendum",
    "code": "GAMETECH",
    "ico": "🧭",
    "order": 8,
    "status": "live",
    "theme": "#0f766e",
    "desc": "五个方向：UI Toolkit 运行时界面、NavMesh 进阶（承接 m09 第 8 章）、广告接入与双区域适配、计费点与标签体系、C 语言内存模型。每个模块标注「技术栈 / 游戏开发部位 / 其他领域用途」，总览页给出与已有课程的逐条边界说明和检索依据。",
    "mods": ["5 模块", "5 条技术栈", "场景标注", "自测题", "离线可读"],
    "entry": "index.html",
    "note": "补充型课程：只收 origin/main 上未覆盖、或只开了个头没展开的主题。每条收录判断都附可复现的检索依据，见总览页覆盖矩阵。",
    "_说明": [
        "本课程内容源在同目录 content_a.py / content_b.py，改内容后重跑 python3 build.py 即可重新生成。",
        "每个模块顶部有场景标注卡：技术栈归属、游戏开发部位、其他领域用途。",
        "交互：左侧模块导航 + 页内搜索 + 代码一键复制 + 自测题即时判定 + 阅读进度本地留存。",
        "与已有课程的边界见 index.html 的「覆盖矩阵」。",
    ],
}


# ---------------- 代码高亮（轻量词法扫描，先分词再转义，避免正则嵌套出错） ----------------
KW = {
    "csharp": set("""abstract as async await base bool break byte case catch char checked class const
        continue decimal default delegate do double else enum event explicit extern false finally fixed
        float for foreach get goto if implicit in int interface internal is lock long namespace new null
        object operator out override params private protected public readonly ref return sbyte sealed set
        short sizeof stackalloc static string struct switch this throw true try typeof uint ulong unchecked
        unsafe ushort using value var virtual void volatile while yield""".split()),
    "c": set("""auto break case char const continue default do double else enum extern float for goto if
        inline int long register restrict return short signed sizeof static struct switch typedef union
        unsigned void volatile while printf""".split()),
    "json": {"true", "false", "null"},
    "javascript": set("var function return if else new this typeof catch then".split()),
    "gradle": set("android productFlavors flavorDimensions sourceSets dimension applicationIdSuffix".split()),
}
NO_COMMENT = {"json", "xml"}


def tokenize(code, lang):
    toks, i, n = [], 0, len(code)
    kw = KW.get(lang, set())
    allow_line_cmt = lang not in NO_COMMENT
    while i < n:
        c = code[i]
        if allow_line_cmt and code.startswith("//", i):
            j = code.find("\n", i)
            j = n if j < 0 else j
            toks.append(("cmt", code[i:j]))
            i = j
            continue
        if code.startswith("/*", i):
            j = code.find("*/", i + 2)
            j = n if j < 0 else j + 2
            toks.append(("cmt", code[i:j]))
            i = j
            continue
        if c == '"':
            j = i + 1
            while j < n:
                if code[j] == "\\":
                    j += 2
                    continue
                if code[j] == '"':
                    j += 1
                    break
                j += 1
            toks.append(("str", code[i:j]))
            i = j
            continue
        if c == "'" and lang == "c":
            j = i + 1
            while j < n:
                if code[j] == "\\":
                    j += 2
                    continue
                if code[j] == "'":
                    j += 1
                    break
                j += 1
            toks.append(("str", code[i:j]))
            i = j
            continue
        if c.isdigit():
            j = i
            while j < n and (code[j].isdigit() or code[j] in ".xXabcdefABCDEF"):
                j += 1
            toks.append(("num", code[i:j]))
            i = j
            continue
        if c.isalpha() or c == "_":
            j = i
            while j < n and (code[j].isalnum() or code[j] == "_"):
                j += 1
            w = code[i:j]
            toks.append(("kw" if w in kw else "id", w))
            i = j
            continue
        toks.append(("p", c))
        i += 1
    return toks


def highlight(code, lang):
    if lang in ("text", "xml", "css"):
        return html.escape(code)
    out = []
    for kind, text in tokenize(code, lang):
        e = html.escape(text)
        if kind == "cmt":
            out.append(f'<span class="c-cmt">{e}</span>')
        elif kind == "str":
            out.append(f'<span class="c-str">{e}</span>')
        elif kind == "kw":
            out.append(f'<span class="c-kw">{e}</span>')
        elif kind == "num":
            out.append(f'<span class="c-num">{e}</span>')
        else:
            out.append(e)
    return "".join(out)


def inline(s):
    s = html.escape(s)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    return s


LANG_LABEL = {
    "csharp": "C#", "c": "C", "json": "JSON", "xml": "UXML", "css": "USS",
    "gradle": "Gradle", "javascript": "JS", "text": "流程",
}


def render_block(b):
    kind = b[0]
    if kind == "p":
        return f"<p>{inline(b[1])}</p>"
    if kind == "h3":
        return f"<h3 class=\"sub-h\">{inline(b[1])}</h3>"
    if kind == "list":
        return "<ul class=\"pts\">" + "".join(f"<li>{inline(x)}</li>" for x in b[1]) + "</ul>"
    if kind == "table":
        rows = b[1]
        head = "".join(f"<th>{inline(c)}</th>" for c in rows[0])
        body = "".join(
            "<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rows[1:]
        )
        return f'<div class="tw"><table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>'
    if kind == "code":
        lang, code = b[1], b[2]
        label = LANG_LABEL.get(lang, lang.upper())
        return (
            f'<div class="codewrap"><div class="codebar"><span class="lang">{label}</span>'
            f'<button class="copy" type="button">复制</button></div>'
            f'<pre class="code"><code>{highlight(code, lang)}</code></pre></div>'
        )
    if kind == "note":
        cls, txt = b[1], b[2]
        icon = {"key": "◆", "tip": "→", "warn": "⚠", "info": "ⓘ"}.get(cls, "ⓘ")
        label = {"key": "核心", "tip": "建议", "warn": "坑", "info": "背景"}.get(cls, "")
        return (
            f'<div class="note n-{cls}"><span class="ni">{icon}</span>'
            f'<div><b>{label}</b>{inline(txt)}</div></div>'
        )
    if kind == "kv":
        items = "".join(
            f'<div class="kvrow"><div class="k">{inline(k)}</div><div class="v">{inline(v)}</div></div>'
            for k, v in b[1]
        )
        return f'<div class="kv">{items}</div>'
    return ""


def render_quiz(m):
    qs = m["quiz"]
    out = [
        '<section class="quiz" id="quiz">',
        f'<h2>自测 · {len(qs)} 题</h2>',
        '<p class="qhint">点选项立即判定，答错会给出原因。</p>',
    ]
    for qi, q in enumerate(qs):
        opts = "".join(
            f'<button class="opt" data-q="{qi}" data-i="{oi}" type="button">'
            f'<span class="oi">{"ABCD"[oi]}</span><span>{inline(o)}</span></button>'
            for oi, o in enumerate(q["opts"])
        )
        out.append(
            f'<div class="qcard" data-q="{qi}" data-a="{q["a"]}" data-why="{html.escape(q["why"])}">'
            f'<div class="qt"><span class="qn">{qi+1}</span>{inline(q["q"])}</div>'
            f'<div class="opts">{opts}</div>'
            f'<div class="qfb"></div></div>'
        )
    out.append("</section>")
    return "\n".join(out)


def render_rail(mid):
    cats = []
    for m in MODULES:
        if m["cat"] not in cats:
            cats.append(m["cat"])
    parts = []
    for cat in cats:
        parts.append(f'<div class="catg">{cat}</div>')
        for m in MODULES:
            if m["cat"] != cat:
                continue
            on = " on" if m["id"] == mid else ""
            parts.append(
                f'<a class="mcard{on}" href="{m["id"]}.html" data-id="{m["id"]}" '
                f'data-text="{html.escape(m["title"] + " " + m["sub"] + " " + m["cat"] + " " + m["stack"])}">'
                f'<span class="rd">已读</span>'
                f'<div class="t"><i>{m["icon"]}</i><span>{html.escape(m["title"])}</span></div>'
                f'<div class="s">{html.escape(m["sub"])}</div>'
                f'<div class="bar"><i></i></div></a>'
            )
    return "\n".join(parts)


def page(mid, title, body, extra_class=""):
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230f766e'/%3E%3Cpath d='M20 40h24M20 32h24M20 24h16' stroke='%23fff' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E">
<link rel="stylesheet" href="assets/style.css">
</head>
<body data-mid="{mid}"{extra_class}>
<div id="app">
<aside id="rail">
  <a class="brand" href="index.html">
    <h1><span class="dot"></span>游戏开发补充技术栈</h1>
    <p>5 模块 · 5 条技术栈 · 场景标注</p>
  </a>
  <div class="searchwrap">
    <input id="q" type="search" placeholder="搜索模块 / 技术栈…" autocomplete="off">
  </div>
  <div class="cards">
{render_rail(mid)}
  </div>
  <div class="railfoot">
    <div class="pgwrap"><div class="pg"><i></i></div><span id="pgtxt">0 / 5 已读</span></div>
    <a class="backlink" href="../../examination/index.html">← 课程中心</a>
  </div>
</aside>
<main id="main">
{body}
</main>
</div>
<script src="assets/app.js"></script>
</body>
</html>
"""


def build_module(m):
    # 目录
    toc = "".join(
        f'<a href="#{s["id"]}">{inline(s["h"])}</a>' for s in m["sections"]
    ) + '<a href="#quiz">自测</a>'
    # 正文
    secs = []
    for s in m["sections"]:
        blocks = "\n".join(render_block(b) for b in s["blocks"])
        secs.append(f'<section id="{s["id"]}"><h2>{inline(s["h"])}</h2>\n{blocks}\n</section>')
    words = 0
    codes = 0
    for s in m["sections"]:
        for b in s["blocks"]:
            if b[0] in ("p", "note"):
                words += len(b[-1])
            elif b[0] == "list":
                words += sum(len(x) for x in b[1])
            elif b[0] == "table":
                words += sum(len(str(c)) for r in b[1] for c in r)
            elif b[0] == "kv":
                words += sum(len(k) + len(v) for k, v in b[1])
            elif b[0] == "code":
                codes += 1
    idx = [x["id"] for x in MODULES].index(m["id"])
    nxt = MODULES[idx + 1] if idx + 1 < len(MODULES) else None
    prv = MODULES[idx - 1] if idx > 0 else None
    nav = ['<nav class="pagenav">']
    if prv:
        nav.append(f'<a class="pv" href="{prv["id"]}.html"><span>上一模块</span><b>{html.escape(prv["title"])}</b></a>')
    if nxt:
        nav.append(f'<a class="nx" href="{nxt["id"]}.html"><span>下一模块</span><b>{html.escape(nxt["title"])}</b></a>')
    nav.append("</nav>")

    body = f"""
<header class="mhead">
  <div class="crumb"><a href="index.html">游戏开发补充技术栈</a><span>/</span>{html.escape(m["cat"])}</div>
  <h1><i>{m["icon"]}</i>{html.escape(m["title"])}</h1>
  <p class="sub">{html.escape(m["sub"])}</p>
  <div class="statsrow">
    <span>{words:,} 字</span><span>{codes} 段代码</span><span>{len(m["sections"])} 节</span><span>{len(m["quiz"])} 道自测</span>
  </div>
  <div class="scene">
    <div class="sc"><div class="sk">技术栈</div><div class="sv">{inline(m["stack"])}</div></div>
    <div class="sc"><div class="sk">🎮 游戏开发部位</div><div class="sv">{inline(m["game"])}</div></div>
    <div class="sc"><div class="sk">🌐 其他领域用途</div><div class="sv">{inline(m["other"])}</div></div>
  </div>
</header>
<nav class="toc"><div class="toch">本模块目录</div>{toc}</nav>
<article>
{chr(10).join(secs)}
{render_quiz(m)}
</article>
{''.join(nav)}
"""
    return page(m["id"], f'{m["title"]} · 游戏开发补充技术栈', body)


def build_index():
    total_words = 0
    total_codes = 0
    total_quiz = 0
    total_cn = 0
    for m in MODULES:
        for s in m["sections"]:
            for b in s["blocks"]:
                if b[0] in ("p", "note"):
                    total_words += len(b[-1])
                    total_cn += len(re.findall(r"[\u4e00-\u9fff]", b[-1]))
                elif b[0] == "list":
                    total_words += sum(len(x) for x in b[1])
                    total_cn += sum(len(re.findall(r"[\u4e00-\u9fff]", x)) for x in b[1])
                elif b[0] == "table":
                    total_words += sum(len(str(c)) for r in b[1] for c in r)
                    total_cn += sum(len(re.findall(r"[\u4e00-\u9fff]", str(c))) for r in b[1] for c in r)
                elif b[0] == "kv":
                    total_words += sum(len(k) + len(v) for k, v in b[1])
                    total_cn += sum(len(re.findall(r"[\u4e00-\u9fff]", k + v)) for k, v in b[1])
                elif b[0] == "code":
                    total_codes += 1
        total_quiz += len(m["quiz"])

    # 覆盖矩阵：本课程只收已有课程未覆盖、或只开了个头没展开的主题
    matrix = [
        ["模块", "技术栈", "游戏开发部位", "其他领域", "与已有课程的关系"],
        ["UI Toolkit", "界面层", "HUD / 背包 / 主菜单 / 技能栏 / 对话", "编辑器扩展、数据密集桌面应用",
         "已有课程只有 UGUI 与 TextMeshPro，全文检索 UI Toolkit 命中 0 个文件"],
        ["NavMesh 进阶", "AI 与导航", "敌人追击巡逻、NPC 寻路、点击移动", "AGV 调度、室内导航、可达性分析",
         "m09 已有 5 节基础专题（概念/组件/OffMeshLink/障碍），本篇只补它没展开的参数取值、Areas 代价、路径查询 API、运行时重建"],
        ["广告接入与双区域", "商业化与发行", "变现层、版本切分、打包管线", "移动广告变现、多租户构建",
         "Unity-Games 有商业化策略建议（选哪家聚合、哪里做变现点），但没有 SDK 初始化与回调分发实现"],
        ["计费点与标签体系", "商业化设计", "付费点设计、埋点、远程调优", "SaaS 定价、增长分析、埋点治理",
         "全文检索「计费」命中 0 个文件，商业化设计完全未涉及"],
        ["C 语言与内存", "语言底层", "IL2CPP、Native 插件、struct 布局", "嵌入式、驱动、跨语言 ABI",
         "全文检索「C 语言」「malloc」「内存对齐」均命中 0；IL2CPP 只在 6 处上下文被顺带提及，无底层内存模型教学"],
    ]
    mrows = "".join(
        "<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in matrix[1:]
    )
    mhead = "".join(f"<th>{inline(c)}</th>" for c in matrix[0])

    # 已核对为「重复、不再收录」的清单
    dup = [
        ("UniTask / ScriptableObject / Newtonsoft.Json / MessagePack", "Unity"),
        ("PlayerPrefs / Binary 持久化 / Excel 配置表", "Unity"),
        ("Addressables / YooAsset / HybridCLR / 性能优化", "Unity"),
        ("UGUI / TextMeshPro / InputSystem / iOS / Android", "Unity"),
        ("动画 1D / 2D 混合树", "Unity（m09）"),
        ("NavMesh 概念 / Agent 组件字段 / OffMeshLink 字段 / 障碍面板（基础部分）", "Unity（m09 第 8 章）"),
        ("委托事件 / 泛型 / 反射 / 多线程 / 协变逆变 / 迭代器 / 预处理器", "CSharp-Book（m04）"),
        ("八大排序算法", "CSharp-Book（m05）"),
        ("栈 / 队列 / List / Dictionary / LinkedList / 匿名函数 / Lambda", "CSharp-Book（m04）"),
        ("14 个小游戏工程解剖 / 2048 手册 / Tetris 解剖 / 类图", "Unity-Games"),
        ("单例模式 / 公共 Mono 模块（75 课时框架）", "Unity-Book"),
        ("C# 20 张分册思维导图", "CSharp-Map"),
    ]
    drows = "".join(
        f"<tr><td>{inline(a)}</td><td class='src'>{inline(b)}</td></tr>" for a, b in dup
    )

    cards = []
    for m in MODULES:
        cards.append(
            f'<a class="bigcard" href="{m["id"]}.html">'
            f'<div class="bc-top"><i>{m["icon"]}</i><span class="bc-cat">{html.escape(m["cat"])}</span></div>'
            f'<h3>{html.escape(m["title"])}</h3>'
            f'<p class="bc-sub">{html.escape(m["sub"])}</p>'
            f'<div class="bc-scene"><b>🎮</b>{inline(m["game"])}</div>'
            f'<div class="bc-scene"><b>🌐</b>{inline(m["other"])}</div>'
            f'<div class="bc-foot">{len(m["sections"])} 节 · {len(m["quiz"])} 道自测 →</div>'
            f"</a>"
        )

    body = f"""
<header class="mhead idx">
  <div class="crumb">课程中心<span>/</span>补充技术栈</div>
  <h1><i>🧭</i>游戏开发补充技术栈</h1>
  <p class="sub">只收已有课程尚未覆盖的部分。5 个模块分属 5 条技术栈，每节都标了「用在游戏的哪儿、还能用在哪」。</p>
  <div class="statsrow">
    <span>5 模块</span><span>5 条技术栈</span><span>{total_words:,} 字</span>
    <span>{total_codes} 段代码</span><span>{total_quiz} 道自测</span>
  </div>
  <div class="scope">
    <div class="scope-t">这份清单是怎么定出来的</div>
    <p>以 <code>origin/main</code> 为准，逐个读取了 CSharp-Book（11 模块）、CSharp-Map（20 分册）、Unity（27 模块）、
    Unity-Book（75 课时）、Unity-Games（14 工程 × 9 页签）的实际章节标题并做了全文关键词检索。
    凡是已有课程讲过的一律不收，下列 11 类被判定为重复、已剔除。</p>
  </div>
</header>

<section class="idxsec">
  <h2>覆盖矩阵</h2>
  <p class="lead">五个模块对应五条技术栈，最右一列写明它与已有课程的真实关系——包括哪部分是重复的、哪部分才是本篇的增量。</p>
  <div class="tw"><table><thead><tr>{mhead}</tr></thead><tbody>{mrows}</tbody></table></div>
</section>

<section class="idxsec">
  <h2>五个模块</h2>
  <div class="bigcards">
{chr(10).join(cards)}
  </div>
</section>

<section class="idxsec">
  <h2>已判定重复、不再收录</h2>
  <p class="lead">以下主题在 GitHub 上已有完整教学，本地对应文件不再整理成新教程，避免重复建设。</p>
  <div class="tw"><table class="dupt"><thead><tr><th>主题</th><th>已有位置</th></tr></thead><tbody>{drows}</tbody></table></div>
</section>

<section class="idxsec">
  <h2>这些判定是怎么核对出来的</h2>
  <p class="lead">上面每一条「已覆盖 / 是缺口」都来自可复现的检索，不是凭印象。核对基准是本站仓库的 <code>1f4bae2</code>（= origin/main）。</p>
  <ol class="howto">
    <li><b>先锁定版本</b>，防止核对对象在过程中变动：<code>git rev-parse HEAD origin/main</code> 两者必须一致。</li>
    <li><b>全文检索，但要排除本课程自己的目录</b>：<code>grep -ril --include="*.html" --exclude-dir=GameTech-Addon "关键词" examination/</code>。不排除的话，本篇自己写的内容会把每一项「缺口」都变成命中，等于没核对。</li>
    <li><b>看章节结构，不能只数关键词</b>：抽出文中所有 <code>href="#..."</code> 锚点，确认该主题是独立小节还是顺带提及。这一条曾推翻过一个错误判断——NavMesh 原本被误记为「只顺带提了一句烘焙」，抽出锚点后才发现 m09 里有 5 个小节。</li>
    <li><b>区分「有建议」和「有实现」</b>：命中数不等于覆盖度。Unity-Games 里「广告」出现 7 处，但全是选哪家聚合、哪里设变现点的策略建议，没有一行 SDK 初始化或回调代码，所以广告接入仍算缺口。</li>
    <li><b>字数要注明口径</b>：汉字数、非空白字符数、总字符数能差出三倍以上，混用会得出错误结论。</li>
  </ol>
</section>

<footer class="idxfoot">
  <p>内容源：<code>_src/content_a.py</code> / <code>_src/content_b.py</code>，改完跑 <code>python3 _src/build.py</code> 重新生成。</p>
  <p>正文合计 {total_words:,} 字符（含标点与英文，不含代码块） · {total_codes} 段代码 · {total_quiz} 道自测 · 全部离线可读。</p>
</footer>
"""
    return page("index", "游戏开发补充技术栈", body, ' class="is-index"')


CSS = r""":root{
  --bg:#faf9ff; --card:#fff; --ink:#1e1b4b; --sub:#6b6690; --line:#ece7fb;
  --accent:#6366f1; --acc2:#0f766e; --accent-soft:#e0e7ff;
  --ok:#10b981; --ok-soft:#d1fae5; --warn:#f59e0b; --warn-soft:#fef3c7;
  --danger:#f43f5e; --danger-soft:#ffe4e6;
  --code-bg:#191633; --code-fg:#e7e5ff;
  --shadow:0 1px 2px rgba(30,27,75,.04),0 6px 20px rgba(30,27,75,.05);
  --sans:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif;
  --mono:"SF Mono",ui-monospace,Menlo,Consolas,"Liberation Mono",monospace;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:20px}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);
  font-size:15.5px;line-height:1.75;-webkit-font-smoothing:antialiased}
#app{display:flex;min-height:100vh;align-items:flex-start;width:100%;max-width:100vw;overflow-x:clip}

/* ---------- 左侧栏 ---------- */
#rail{width:288px;flex:0 0 288px;min-width:0;position:sticky;top:0;height:100vh;overflow-y:auto;
  background:#fff;border-right:1px solid var(--line);padding:20px 16px 18px;display:flex;flex-direction:column}
#rail::-webkit-scrollbar{width:6px}
#rail::-webkit-scrollbar-thumb{background:#ddd8f0;border-radius:3px}
.brand{display:block;text-decoration:none;color:inherit;margin-bottom:14px}
.brand h1{font-size:15px;margin:0 0 4px;display:flex;align-items:center;gap:7px;font-weight:700;letter-spacing:-.2px}
.brand .dot{width:9px;height:9px;border-radius:50%;background:var(--acc2);flex:0 0 auto;
  box-shadow:0 0 0 3px rgba(15,118,110,.14)}
.brand p{margin:0;font-size:11.5px;color:var(--sub)}
.searchwrap{margin-bottom:12px}
#q{width:100%;padding:8px 11px;border:1px solid var(--line);border-radius:9px;background:var(--bg);
  font-size:13px;font-family:inherit;color:var(--ink);outline:none}
#q:focus{border-color:var(--accent);background:#fff}
.catg{font-size:11px;font-weight:700;color:var(--sub);letter-spacing:.6px;
  margin:12px 0 6px;padding-left:2px}
.mcard{display:block;position:relative;text-decoration:none;color:inherit;background:var(--bg);
  border:1px solid var(--line);border-radius:10px;padding:9px 10px 8px;margin-bottom:6px;
  transition:.16s;overflow:hidden}
.mcard:hover{background:#fff;border-color:#d8d2f0;transform:translateY(-1px);box-shadow:var(--shadow)}
.mcard.on{background:var(--accent-soft);border-color:#b9b3f0}
.mcard .t{display:flex;align-items:center;gap:6px;font-size:13.5px;font-weight:650}
.mcard .t i{font-style:normal;font-size:14px}
.mcard .s{font-size:11.5px;color:var(--sub);margin-top:2px;line-height:1.45;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.mcard .rd{position:absolute;top:7px;right:8px;font-size:9.5px;color:#fff;background:var(--ok);
  padding:0 5px;border-radius:4px;opacity:0;transition:.16s}
.mcard.done .rd{opacity:1}
.mcard .bar{height:2px;background:#e8e4f6;border-radius:2px;margin-top:7px;overflow:hidden}
.mcard .bar i{display:block;height:100%;width:0;background:var(--ok);transition:width .2s}
.railfoot{margin-top:auto;padding-top:14px;border-top:1px solid var(--line);font-size:11.5px;color:var(--sub)}
.pgwrap{display:flex;flex-direction:column;gap:5px;margin-bottom:9px}
.pg{height:5px;background:#efecf9;border-radius:3px;overflow:hidden}
.pg i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--acc2),var(--accent));
  transition:width .3s}
.backlink{color:var(--sub);text-decoration:none;font-size:11.5px}
.backlink:hover{color:var(--accent)}

/* ---------- 主区 ---------- */
#main{flex:1;min-width:0;max-width:100%;padding:34px 44px 90px;display:block}
.mhead{max-width:860px;margin:0 auto 22px}
.crumb{font-size:12px;color:var(--sub);display:flex;gap:7px;align-items:center;margin-bottom:10px}
.crumb a{color:var(--acc2);text-decoration:none}
.crumb a:hover{text-decoration:underline}
.mhead h1{font-size:30px;margin:0 0 6px;letter-spacing:-.6px;display:flex;align-items:center;gap:10px;font-weight:750}
.mhead h1 i{font-style:normal;font-size:27px}
.mhead .sub{margin:0;color:var(--sub);font-size:14.5px}
.statsrow{display:flex;gap:16px;flex-wrap:wrap;margin-top:12px;font-size:12px;color:var(--sub);
  font-family:var(--mono)}
.statsrow span{position:relative;padding-right:16px}
.statsrow span:not(:last-child)::after{content:"·";position:absolute;right:5px;color:#cdc7e6}

/* 场景标注卡 */
.scene{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:18px}
.sc{background:#fff;border:1px solid var(--line);border-left:3px solid var(--acc2);
  border-radius:9px;padding:10px 12px}
.sc:nth-child(2){border-left-color:var(--accent)}
.sc:nth-child(3){border-left-color:var(--warn)}
.sk{font-size:10.5px;font-weight:700;color:var(--sub);letter-spacing:.4px;margin-bottom:3px}
.sv{font-size:13px;line-height:1.6}

/* 目录 */
.toc{max-width:860px;margin:0 auto 24px;background:#fff;border:1px solid var(--line);
  border-radius:11px;padding:13px 16px;display:flex;flex-wrap:wrap;gap:7px 14px;align-items:baseline}
.toch{font-size:11.5px;font-weight:700;color:var(--sub);letter-spacing:.4px;width:100%;margin-bottom:2px}
.toc a{font-size:12.5px;color:var(--sub);text-decoration:none;padding:2px 8px;border-radius:6px;
  background:var(--bg);border:1px solid transparent}
.toc a:hover{color:var(--accent);background:var(--accent-soft);border-color:#d5d0f5}

article{max-width:860px;margin:0 auto}
article section{background:#fff;border:1px solid var(--line);border-radius:13px;
  padding:22px 26px;margin-bottom:16px;box-shadow:var(--shadow)}
article h2{font-size:19px;margin:0 0 14px;letter-spacing:-.3px;font-weight:720;
  padding-bottom:10px;border-bottom:1px solid var(--line)}
article h3.sub-h{font-size:15px;margin:18px 0 8px;color:var(--acc2);font-weight:700}
article p{margin:0 0 11px}
article p:last-child{margin-bottom:0}
strong{font-weight:700;color:#151236}
code{font-family:var(--mono);font-size:.9em;background:#f1eefb;color:#5b4bb8;
  padding:1px 5px;border-radius:4px}
a{color:var(--accent)}

.pts{margin:0 0 11px;padding-left:0;list-style:none}
.pts li{position:relative;padding-left:17px;margin-bottom:6px;font-size:14.5px}
.pts li::before{content:"";position:absolute;left:4px;top:.68em;width:5px;height:5px;
  border-radius:50%;background:#c3bce8}

.tw{overflow-x:auto;margin:0 0 13px;border:1px solid var(--line);border-radius:9px}
table{border-collapse:collapse;width:100%;font-size:13.5px;background:#fff}
thead th{background:#f6f4fd;text-align:left;font-weight:700;color:#3b3468;
  padding:9px 11px;border-bottom:1px solid var(--line);white-space:nowrap;font-size:12.5px}
tbody td{padding:9px 11px;border-bottom:1px solid #f4f1fb;vertical-align:top;line-height:1.6}
tbody td:first-child{min-width:5.6em}
tbody tr:last-child td{border-bottom:none}
tbody tr:hover{background:#fbfaff}

.kv{border:1px solid var(--line);border-radius:9px;overflow:hidden;margin-bottom:13px}
.kvrow{display:flex;border-bottom:1px solid #f4f1fb;font-size:13.5px}
.kvrow:last-child{border-bottom:none}
.kvrow .k{flex:0 0 168px;background:#f6f4fd;padding:9px 11px;font-weight:650;font-size:13px}
.kvrow .v{flex:1;padding:9px 11px;line-height:1.6}

/* 提示条 */
.note{display:flex;gap:9px;padding:11px 13px;border-radius:9px;margin:0 0 13px;font-size:13.8px;
  line-height:1.7;border:1px solid transparent}
.note .ni{flex:0 0 auto;font-weight:700;font-size:13px;line-height:1.7}
.note b{font-weight:750;margin-right:5px}
.n-key{background:#eef7f5;border-color:#c9e8e1;color:#0d5f55}
.n-key .ni{color:#0f766e}
.n-tip{background:var(--accent-soft);border-color:#cfd8fb;color:#38418f}
.n-tip .ni{color:var(--accent)}
.n-warn{background:var(--warn-soft);border-color:#f5e0a8;color:#7a5306}
.n-warn .ni{color:#b45309}
.n-info{background:#f5f3fc;border-color:#e2dcf7;color:#4c4374}
.n-info .ni{color:#7c6bbd}

/* 代码块 */
.codewrap{margin:0 0 14px;border-radius:10px;overflow:hidden;background:var(--code-bg);
  box-shadow:0 2px 10px rgba(25,22,51,.16)}
.codebar{display:flex;justify-content:space-between;align-items:center;padding:6px 11px;
  background:#221e40;border-bottom:1px solid #2e2952}
.codebar .lang{font-size:10.5px;color:#9c94d0;font-family:var(--mono);letter-spacing:.6px;font-weight:600}
.copy{background:#2e2952;border:none;color:#c7c0f0;font-size:11px;padding:3px 10px;
  border-radius:5px;cursor:pointer;font-family:var(--sans);transition:.15s}
.copy:hover{background:#3b3468;color:#fff}
.copy.ok{background:#0f766e;color:#fff}
pre.code{margin:0;padding:14px 15px;overflow-x:auto;font-family:var(--mono);font-size:12.8px;
  line-height:1.72;color:var(--code-fg);tab-size:2}
pre.code code{background:none;padding:0;color:inherit;font-size:inherit}
.c-cmt{color:#7f79ab;font-style:italic}
.c-str{color:#a8e6a3}
.c-kw{color:#8fb8ff;font-weight:600}
.c-num{color:#ffcf8b}

/* 自测 */
.quiz{background:#fff;border:1px solid var(--line);border-radius:13px;padding:22px 26px;
  margin-bottom:16px;box-shadow:var(--shadow)}
.quiz h2{font-size:19px;margin:0 0 6px;padding-bottom:10px;border-bottom:1px solid var(--line);font-weight:720}
.qhint{font-size:12.5px;color:var(--sub);margin:0 0 14px}
.qcard{padding:14px 0;border-bottom:1px dashed var(--line)}
.qcard:last-child{border-bottom:none;padding-bottom:0}
.qt{font-size:14.5px;font-weight:650;display:flex;gap:9px;margin-bottom:10px;line-height:1.6}
.qn{flex:0 0 21px;height:21px;border-radius:50%;background:var(--accent-soft);color:var(--accent);
  font-size:11.5px;display:flex;align-items:center;justify-content:center;font-weight:700;margin-top:2px}
.opts{display:flex;flex-direction:column;gap:6px}
.opt{display:flex;gap:9px;align-items:flex-start;text-align:left;background:var(--bg);
  border:1px solid var(--line);border-radius:8px;padding:8px 11px;cursor:pointer;
  font-family:inherit;font-size:13.8px;color:var(--ink);transition:.14s;line-height:1.6}
.opt:hover{border-color:#c3bce8;background:#fff}
.opt .oi{flex:0 0 19px;height:19px;border-radius:5px;background:#e9e5f7;color:#6b64a0;
  font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:2px}
.opt.right{background:var(--ok-soft);border-color:#7dd8b5}
.opt.right .oi{background:var(--ok);color:#fff}
.opt.wrong{background:var(--danger-soft);border-color:#f9aabb}
.opt.wrong .oi{background:var(--danger);color:#fff}
.opt.dim{opacity:.55}
.qfb{display:none;margin-top:9px;font-size:13.2px;padding:9px 11px;border-radius:8px;line-height:1.65}
.qfb.show{display:block}
.qfb.ok{background:var(--ok-soft);color:#0a6b4d;border:1px solid #7dd8b5}
.qfb.no{background:var(--danger-soft);color:#8c1f37;border:1px solid #f9aabb}
.qfb b{font-weight:750}

/* 上一/下一 */
.pagenav{max-width:860px;margin:22px auto 0;display:flex;gap:12px;justify-content:space-between}
.pagenav a{flex:1;text-decoration:none;background:#fff;border:1px solid var(--line);
  border-radius:11px;padding:12px 15px;transition:.16s;max-width:49%}
.pagenav a:hover{border-color:#c3bce8;box-shadow:var(--shadow);transform:translateY(-1px)}
.pagenav span{display:block;font-size:11px;color:var(--sub)}
.pagenav b{font-size:14px;color:var(--ink);font-weight:650}
.pagenav .nx{text-align:right}

/* 总览页 */
.scope{background:#fff;border:1px solid var(--line);border-left:3px solid var(--accent);
  border-radius:10px;padding:14px 16px;margin-top:18px}
.scope-t{font-size:13px;font-weight:750;margin-bottom:6px;color:#3b3468}
.scope p{margin:0;font-size:13.4px;color:#4a4374;line-height:1.72}
.idxsec{max-width:940px;margin:0 auto 26px;background:#fff;border:1px solid var(--line);
  border-radius:13px;padding:22px 26px;box-shadow:var(--shadow)}
.idxsec h2{font-size:19px;margin:0 0 6px;font-weight:720;letter-spacing:-.3px}
.idxsec .lead{font-size:13.4px;color:var(--sub);margin:0 0 14px}
.bigcards{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px}
.bigcard{display:block;text-decoration:none;color:inherit;background:var(--bg);
  border:1px solid var(--line);border-radius:12px;padding:15px 16px;transition:.18s}
.bigcard:hover{background:#fff;border-color:#c3bce8;box-shadow:var(--shadow);transform:translateY(-2px)}
.bc-top{display:flex;align-items:center;gap:8px;margin-bottom:7px}
.bc-top i{font-style:normal;font-size:19px}
.bc-cat{font-size:10.5px;font-weight:700;color:var(--acc2);background:#e6f4f1;
  padding:2px 8px;border-radius:20px;letter-spacing:.3px}
.bigcard h3{font-size:16px;margin:0 0 3px;font-weight:720}
.bc-sub{font-size:12.5px;color:var(--sub);margin:0 0 9px;line-height:1.55}
.bc-scene{font-size:12px;color:#4a4374;line-height:1.55;margin-bottom:4px;
  display:flex;gap:5px;align-items:flex-start}
.bc-scene b{flex:0 0 auto;font-weight:400;font-size:11.5px;opacity:.85}
.bc-foot{margin-top:9px;padding-top:8px;border-top:1px solid var(--line);
  font-size:11.5px;color:var(--accent);font-weight:650}
.dupt td.src{color:var(--sub);font-family:var(--mono);font-size:12px}
.howto{margin:4px 0 0;padding-left:20px;font-size:13.2px;line-height:1.75;color:var(--ink)}
.howto li{margin-bottom:9px}
.howto b{font-weight:700}
.howto code{font-family:var(--mono);font-size:11.5px;background:#f3f0ff;color:#4c3fbf;
  padding:1.5px 5px;border-radius:4px;word-break:break-all}
.idxfoot{max-width:940px;margin:26px auto 0;text-align:center;font-size:12px;color:var(--sub);
  line-height:1.9}
.idxfoot code{font-size:11.5px}

/* 搜索态 */
.mcard.hide{display:none}
.catg.hide{display:none}

/* 移动端 */
@media (max-width:1000px){
  #app{flex-direction:column}
  #rail{width:100%;max-width:100%;flex:none;height:auto;position:static;border-right:none;
    border-bottom:1px solid var(--line);padding:14px 16px;min-width:0;overflow:visible}
  .cards{display:flex;gap:8px;overflow-x:auto;overflow-y:hidden;padding-bottom:4px;
    min-width:0;max-width:100%;-webkit-overflow-scrolling:touch}
  .catg{display:none}
  .mcard{flex:0 0 200px;margin-bottom:0}
  .railfoot{display:none}
  #main{padding:22px 18px 70px}
  .mhead h1{font-size:24px}
  article section,.quiz,.idxsec{padding:17px 16px;border-radius:11px}
  .kvrow{flex-direction:column}
  .kvrow .k{flex:none}
  .pagenav{flex-direction:column}
  .pagenav a{max-width:none}
  .toc{gap:6px 8px}
}
@media (prefers-color-scheme:dark){
  :root{--bg:#12111c;--card:#1a1828;--ink:#e8e5f7;--sub:#9d97bd;--line:#2a2740;
    --accent-soft:#282448;--ok-soft:#12312a;--warn-soft:#33280f;--danger-soft:#331520}
  body{background:var(--bg)}
  #rail{background:#161424;border-color:var(--line)}
  .mcard{background:#1e1b30;border-color:var(--line)}
  .mcard.on{background:#282448}
  article section,.quiz,.idxsec,.toc,.sc,.pagenav a,.bigcard,.scope{background:#1a1828;border-color:var(--line)}
  thead th{background:#232038;color:#cfc9ec}
  tbody td{border-color:#252238}
  tbody tr:hover{background:#201d33}
  .kvrow .k{background:#232038}
  .kvrow{border-color:#252238}
  code{background:#282448;color:#b9aef5}
  .opt{background:#1e1b30;border-color:var(--line)}
  .opt:hover{background:#252238}
  .copy{background:#2e2952}
  .n-key{background:#12312a;color:#8ee0cd;border-color:#1c4a3f}
  .n-tip{background:#282448;color:#b9c2f5;border-color:#3a3470}
  .n-warn{background:#33280f;color:#e8c47a;border-color:#4d3c17}
  .n-info{background:#232038;color:#bfb6e8;border-color:#312c52}
  .qfb.ok{background:#12312a;color:#8ee0cd}
  .qfb.no{background:#331520;color:#f5a3b5}
  .opt.right{background:#12312a}
  .opt.wrong{background:#331520}
  .tw,table{background:#1a1828}
  .toch{color:#9d97bd}
}
"""

JS = r"""(function () {
  var LS_DONE = 'gametech.done';
  var LS_POS = 'gametech.pos.';

  function loadDone() {
    try { return JSON.parse(localStorage.getItem(LS_DONE) || '[]'); } catch (e) { return []; }
  }
  function saveDone(a) { try { localStorage.setItem(LS_DONE, JSON.stringify(a)); } catch (e) {} }

  /* ---------- 代码复制 ---------- */
  document.querySelectorAll('.codewrap').forEach(function (w) {
    var btn = w.querySelector('.copy');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var code = w.querySelector('pre.code').innerText;
      var done = function () {
        btn.textContent = '已复制';
        btn.classList.add('ok');
        setTimeout(function () { btn.textContent = '复制'; btn.classList.remove('ok'); }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(done).catch(function () { fallback(code, done); });
      } else { fallback(code, done); }
    });
  });
  function fallback(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- 自测题 ---------- */
  document.querySelectorAll('.qcard').forEach(function (card) {
    var ans = parseInt(card.dataset.a, 10);
    var why = card.dataset.why || '';
    var fb = card.querySelector('.qfb');
    var opts = card.querySelectorAll('.opt');
    opts.forEach(function (opt) {
      opt.addEventListener('click', function () {
        if (card.dataset.locked === '1') return;
        var pick = parseInt(opt.dataset.i, 10);
        var right = pick === ans;
        opts.forEach(function (o) {
          var i = parseInt(o.dataset.i, 10);
          if (i === ans) o.classList.add('right');
          else if (i === pick) o.classList.add('wrong');
          else o.classList.add('dim');
        });
        card.dataset.locked = '1';
        fb.className = 'qfb show ' + (right ? 'ok' : 'no');
        fb.innerHTML = '<b>' + (right ? '对。' : '不对，正确答案是 ' + 'ABCD'[ans] + '。') + '</b>' + why;
      });
    });
  });

  /* ---------- 侧栏搜索 ---------- */
  var q = document.getElementById('q');
  if (q) {
    q.addEventListener('input', function () {
      var kw = q.value.trim().toLowerCase();
      document.querySelectorAll('.mcard').forEach(function (c) {
        var hit = !kw || (c.dataset.text || '').toLowerCase().indexOf(kw) > -1;
        c.classList.toggle('hide', !hit);
      });
      document.querySelectorAll('.catg').forEach(function (g) {
        var n = 0, el = g.nextElementSibling;
        while (el && el.classList.contains('mcard')) {
          if (!el.classList.contains('hide')) n++;
          el = el.nextElementSibling;
        }
        g.classList.toggle('hide', n === 0);
      });
    });
  }

  /* ---------- 已读进度 ---------- */
  var mid = document.body.dataset.mid;
  var isIndex = document.body.classList.contains('is-index');
  var allIds = ['m01', 'm02', 'm03', 'm04', 'm05'];

  function paintRail() {
    var done = loadDone();
    document.querySelectorAll('.mcard').forEach(function (c) {
      c.classList.toggle('done', done.indexOf(c.dataset.id) > -1);
    });
    var pg = document.querySelector('.pg i');
    var txt = document.getElementById('pgtxt');
    if (pg) pg.style.width = (done.length / allIds.length * 100) + '%';
    if (txt) txt.textContent = done.length + ' / ' + allIds.length + ' 已读';
  }
  paintRail();

  if (mid && allIds.indexOf(mid) > -1) {
    // 记录滚动位置
    try {
      var y = localStorage.getItem(LS_POS + mid);
      if (y && parseInt(y, 10) > 200) window.scrollTo(0, parseInt(y, 10));
    } catch (e) {}
    var savePos = function () {
      try { localStorage.setItem(LS_POS + mid, String(Math.round(window.scrollY))); } catch (e) {}
    };
    window.addEventListener('scroll', function () { window.clearTimeout(window.__t); window.__t = window.setTimeout(savePos, 400); }, { passive: true });

    // 阅读到 75% 视为已读
    var markRead = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0) return;
      var pct = window.scrollY / h;
      var bar = document.querySelector('.mcard.on .bar i');
      if (bar) bar.style.width = Math.min(100, Math.round(pct * 100 / 0.75 * 100)) + '%';
      if (pct > 0.75) {
        var done = loadDone();
        if (done.indexOf(mid) === -1) { done.push(mid); saveDone(done); paintRail(); }
        var b = document.querySelector('.mcard.on .bar i');
        if (b) b.style.width = '100%';
      }
    };
    window.addEventListener('scroll', markRead, { passive: true });
    markRead();
  }

  /* ---------- 目录当前节高亮 ---------- */
  var links = document.querySelectorAll('.toc a');
  if (links.length) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.style.color = ''; a.style.background = ''; });
          var cur = map[e.target.id];
          if (cur) { cur.style.color = 'var(--accent)'; cur.style.background = 'var(--accent-soft)'; }
        }
      });
    }, { rootMargin: '-15% 0px -70% 0px' });
    document.querySelectorAll('article section[id]').forEach(function (s) { io.observe(s); });
  }
})();
"""


def main():
    os.makedirs(ASSETS, exist_ok=True)
    with open(os.path.join(ASSETS, "style.css"), "w", encoding="utf-8") as f:
        f.write(CSS)
    with open(os.path.join(ASSETS, "app.js"), "w", encoding="utf-8") as f:
        f.write(JS)

    for m in MODULES:
        html_str = build_module(m)
        with open(os.path.join(HERE, m["id"] + ".html"), "w", encoding="utf-8") as f:
            f.write(html_str)
        print("  写出 %s.html (%d KB)" % (m["id"], len(html_str.encode()) // 1024))

    idx = build_index()
    with open(os.path.join(HERE, "index.html"), "w", encoding="utf-8") as f:
        f.write(idx)
    print("  写出 index.html (%d KB)" % (len(idx.encode()) // 1024))

    with open(os.path.join(HERE, "course.json"), "w", encoding="utf-8") as f:
        json.dump(COURSE, f, ensure_ascii=False, indent=2)
    print("  写出 course.json")
    print("完成。")


if __name__ == "__main__":
    main()
