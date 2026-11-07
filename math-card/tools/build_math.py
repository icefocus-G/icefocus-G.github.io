# -*- coding: utf-8 -*-
"""人教版小学数学 1~6 年级（12 册）→ data/*.json

    python tools/build_math.py            # 生成全部五份 json
    python tools/build_math.py --stat     # 只看题量统计，不写文件

产出：
    data/books.json    教材目录 + 每单元口算题池（已展开成具体题目）
    data/types.json    按计算类型的题组（20 以内进位加、表内乘法、小数加减……）
    data/know.json     知识点 / 公式表（按册、按单元）
    data/apply.json    1~6 年级应用题（题干 + 思路 + 答案）
    data/tables.json   单位换算与几何公式速查表

题目在**构建时**就展开成 ["7+5", "13-6", …]，前端只管排版，
不用在浏览器里跑出题随机数；同样的输入永远得到同样的顺序，打印出来可复现。
"""

import json
import os
import re
import random
import hashlib
import math

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "data")

from content_books import BOOKS                  # noqa: E402
from content_text import KNOW, APPLY, TABLES, TYPES   # noqa: E402


# ============================================================
# 具：分数、最大公约数
# ============================================================
def gcd(a, b):
    return math.gcd(a, b)


def frac_str(n, d, reduce=True):
    """n/d 化成最简；假分数保持假分数写法（3/2），不写带分数。
    reduce=False 时保持原分母（三年级还没学约分）。"""
    if d < 0:
        n, d = -n, -d
    if reduce:
        g = gcd(abs(n), d) or 1
        n //= g
        d //= g
    if d == 1:
        return str(n)
    return "%d/%d" % (n, d)


def fmt_num(x, maxdp=2):
    """小数输出：去掉末尾无用的 0（6.0 → 6，0.50 → 0.5）。"""
    s = ("%." + str(maxdp) + "f") % x
    if "." in s:
        s = s.rstrip("0").rstrip(".")
    if s in ("", "-0"):
        s = "0"
    return s


# 兼容旧名字
def fmt_dec(x, digits=2):
    return fmt_num(x, digits)


def rng(key):
    """同一个单元每次构建都得到同一套题（种子由 id 决定）。"""
    h = hashlib.md5(key.encode("utf-8")).hexdigest()[:8]
    return random.Random(int(h, 16))


# ============================================================
# 出题器
# ============================================================
def _add_sub(spec, rnd):
    a0, a1 = spec["a"]
    b0, b1 = spec["b"]
    carry = spec.get("carry")        # True=只要进位加, False=只要不进位
    borrow = spec.get("borrow")
    ops = spec.get("ops")
    if ops is None:
        # 只练进位加就别混进减法，只练退位减就别混进加法
        if carry is True:
            ops = "+"
        elif borrow is True:
            ops = "-"
        else:
            ops = "+-"
    maxr = spec.get("maxr", 10 ** 9)
    out = []
    for a in range(a0, a1 + 1):
        for b in range(b0, b1 + 1):
            if "+" in ops:
                r = a + b
                if r <= maxr:
                    c = (a % 10) + (b % 10) >= 10
                    if carry is None or c == carry:
                        out.append(("+", a, b, r))
            if "-" in ops:
                r = a - b
                if 0 <= r <= maxr:
                    br = (a % 10) < (b % 10)
                    if borrow is None or br == borrow:
                        out.append(("-", a, b, r))
    rnd.shuffle(out)
    return [{"p": "%d%s%d" % (a, o, b), "a": str(r)} for o, a, b, r in out]


def _mul_table(spec, rnd):
    """表内乘除：一个因数落在本单元新学的口诀里，另一个 1~9 都过一遍。"""
    f0, f1 = spec["f"]
    ops = spec.get("ops", "×÷")
    out, seen = [], set()
    for i in range(f0, f1 + 1):
        for j in range(1, 10):
            if "×" in ops:
                key = (min(i, j), max(i, j))
                if key not in seen:
                    seen.add(key)
                    out.append({"p": "%d×%d" % key, "a": str(key[0] * key[1])})
            if "÷" in ops:
                out.append({"p": "%d÷%d" % (i * j, i), "a": str(j)})
    rnd.shuffle(out)
    return out


def _mul_multi(spec, rnd):
    a0, a1 = spec["a"]
    b0, b1 = spec["b"]
    out = []
    for a in range(a0, a1 + 1):
        for b in range(b0, b1 + 1):
            out.append({"p": "%d×%d" % (a, b), "a": str(a * b)})
    rnd.shuffle(out)
    return out


def _div_multi(spec, rnd):
    """被除数 = 除数 × 商，保证整除。"""
    b0, b1 = spec["b"]
    q0, q1 = spec["q"]
    out = []
    for b in range(b0, b1 + 1):
        for q in range(q0, q1 + 1):
            out.append({"p": "%d÷%d" % (b * q, b), "a": str(q)})
    rnd.shuffle(out)
    return out


def _div_rem(spec, rnd):
    """有余数的除法：(商 是 a，余数是 r)。"""
    b0, b1 = spec["b"]
    q0, q1 = spec["q"]
    out = []
    for b in range(b0, b1 + 1):
        for q in range(q0, q1 + 1):
            for r in range(1, b):
                out.append({"p": "%d÷%d" % (b * q + r, b), "a": "%d…%d" % (q, r)})
    rnd.shuffle(out)
    return out


def _dec_add(spec, rnd):
    d = spec.get("digits", 1)
    scale = 10 ** d
    a0, a1 = spec["a"]
    b0, b1 = spec["b"]
    ops = spec.get("ops", "+-")
    out = []
    for ai in range(a0 * scale, a1 * scale + 1):
        for bi in range(b0 * scale, b1 * scale + 1):
            a, b = ai / scale, bi / scale
            if "+" in ops:
                out.append({"p": "%s+%s" % (fmt_dec(a, d), fmt_dec(b, d)),
                            "a": fmt_dec(a + b, d)})
            if "-" in ops and a > b:
                out.append({"p": "%s-%s" % (fmt_dec(a, d), fmt_dec(b, d)),
                            "a": fmt_dec(a - b, d)})
    rnd.shuffle(out)
    return out


def _dec_mul(spec, rnd):
    d = spec.get("digits", 1)
    a0, a1 = spec["a"]
    b0, b1 = spec["b"]
    out = []
    for ai in range(int(a0 * 10 ** d), int(a1 * 10 ** d) + 1):
        for b in range(b0, b1 + 1):
            a = ai / 10 ** d
            out.append({"p": "%s×%d" % (fmt_dec(a, d), b), "a": fmt_dec(a * b, 3)})
    rnd.shuffle(out)
    return out


def _dec_div(spec, rnd):
    d = spec.get("digits", 1)
    b0, b1 = spec["b"]
    q0, q1 = spec["q"]
    out = []
    for b in range(b0, b1 + 1):
        for qi in range(int(q0 * 10 ** d), int(q1 * 10 ** d) + 1):
            q = qi / 10 ** d
            out.append({"p": "%s÷%d" % (fmt_dec(q * b, 2), b), "a": fmt_dec(q, d)})
    rnd.shuffle(out)
    return out


def _frac_add(spec, rnd):
    dens = spec["d"]
    mode = spec.get("mode", "same")      # same 同分母 / diff 异分母
    red = spec.get("simp", True)
    out = []
    for d in dens:
        if mode == "same":
            for x in range(1, d):
                if gcd(x, d) != 1:          # 题面里的分数必须是最简分数
                    continue
                for y in range(1, d):
                    if gcd(y, d) != 1:
                        continue
                    if spec.get("lt1", True) and x + y >= d:
                        continue
                    if x + y > 2 * d:
                        continue
                    out.append({"p": "%d/%d+%d/%d" % (x, d, y, d),
                                "a": frac_str(x + y, d, red)})
                    if x > y:
                        out.append({"p": "%d/%d-%d/%d" % (x, d, y, d),
                                    "a": frac_str(x - y, d, red)})
        else:
            for d1 in dens:
                for d2 in dens:
                    if d2 <= d1:
                        continue
                    for x in range(1, d1):
                        if gcd(x, d1) != 1:
                            continue
                        for y in range(1, d2):
                            if gcd(y, d2) != 1:
                                continue
                            if x + y > d1 and spec.get("lt1", True):
                                continue
                            out.append({"p": "%d/%d+%d/%d" % (x, d1, y, d2),
                                        "a": frac_str(x * d2 + y * d1, d1 * d2, red)})
    seen, uniq = set(), []
    for it in out:
        if it["p"] in seen:
            continue
        seen.add(it["p"])
        uniq.append(it)
    rnd.shuffle(uniq)
    return uniq


def _frac_mul(spec, rnd):
    dens = spec["d"]
    m0, m1 = spec["m"]
    out = []
    for d in dens:
        for n in range(1, d):
            if gcd(n, d) != 1:          # 题面本身要是最简分数
                continue
            for m in range(m0, m1 + 1):
                out.append({"p": "%d/%d×%d" % (n, d, m), "a": frac_str(n * m, d)})
    rnd.shuffle(out)
    return out


def _frac_div(spec, rnd):
    """分数除法：被除数和除数都取最简真分数，答案 = n/d × q/p。"""
    dens = spec["d"]
    out = []
    for d in dens:
        for n in range(1, d):
            if gcd(n, d) != 1:
                continue
            for q in dens:
                for pn in range(1, q):
                    if gcd(pn, q) != 1:
                        continue
                    out.append({"p": "%d/%d÷%d/%d" % (n, d, pn, q),
                                "a": frac_str(n * q, d * pn)})
    rnd.shuffle(out)
    return out


CMP_POOL = None


def _cmp(spec, rnd):
    a0, a1 = spec["a"]
    b0, b1 = spec["b"]
    out = []
    for a in range(a0, a1 + 1):
        for b in range(b0, b1 + 1):
            if a == b:
                continue
            out.append({"p": "%d○%d" % (a, b), "a": ">" if a > b else "<"})
    rnd.shuffle(out)
    return out


UNITS = {
    "length_small": [("米", "分米", 10), ("分米", "厘米", 10), ("厘米", "毫米", 10),
                     ("米", "厘米", 100)],
    "length_big": [("千米", "米", 1000), ("米", "厘米", 100), ("米", "毫米", 1000)],
    "area": [("平方米", "平方分米", 100), ("平方分米", "平方厘米", 100),
             ("平方米", "平方厘米", 10000), ("公顷", "平方米", 10000),
             ("平方千米", "公顷", 100)],
    "mass": [("吨", "千克", 1000), ("千克", "克", 1000)],
    "volume": [("升", "毫升", 1000), ("立方米", "立方分米", 1000),
               ("立方分米", "立方厘米", 1000)],
    "hms": [("时", "分", 60), ("分", "秒", 60)],
    "ymd": [("日", "时", 24), ("年", "月", 12), ("周", "日", 7)],
    "time": [("时", "分", 60), ("分", "秒", 60), ("日", "时", 24), ("年", "月", 12)],
    "money": [("元", "角", 10), ("角", "分", 10), ("元", "分", 100)],
}


def _unit(spec, rnd):
    out = []
    vals = spec.get("v", [1, 2, 3, 4, 5, 6, 7, 8, 9])
    for cat in spec["cat"]:
        if cat == "big":                      # 大数改写：4万 = 40000
            for v in vals:
                out.append({"p": "%d万=＿" % v, "a": str(v * 10000)})
                out.append({"p": "%d=＿万" % (v * 10000), "a": str(v)})
                out.append({"p": "%d亿=＿" % v, "a": str(v * 100000000)})
                out.append({"p": "%d=＿亿" % (v * 100000000), "a": str(v)})
            continue
        for frm, to, k in UNITS[cat]:
            for v in vals:
                out.append({"p": "%d%s=＿%s" % (v, frm, to), "a": str(v * k)})
    rnd.shuffle(out)
    return out


SHIFT_BASES = [0.5, 0.25, 0.75, 1.2, 2.4, 3.6, 4.5, 0.08, 0.06, 12.5, 0.4, 8.5, 0.35]


def _shift(spec, rnd):
    """小数点移动：×10 / ×100 / ÷1000，四年级下「小数的意义和性质」。"""
    out = []
    for b in SHIFT_BASES:
        for m in (10, 100, 1000):
            big = round(b * m, 4)
            out.append({"p": "%s×%d" % (fmt_num(b), m), "a": fmt_num(big)})
            out.append({"p": "%s÷%d" % (fmt_num(big), m), "a": fmt_num(b)})
    rnd.shuffle(out)
    return out


def _pi(spec, rnd):
    """π 的倍数：圆的周长面积、圆柱圆锥的体积都要用到 3.14 的乘法。"""
    out = []
    for n in range(2, 13):
        out.append({"p": "3.14×%d" % n, "a": fmt_num(round(3.14 * n, 2))})
        out.append({"p": "%s÷3.14" % fmt_num(round(3.14 * n, 2)), "a": str(n)})
    rnd.shuffle(out)
    return out


def _eval(expr):
    """只处理 + - × ÷ 与括号，用作混合运算的答案。"""
    s = expr.replace("×", "*").replace("÷", "/").replace("＋", "+").replace("－", "-")
    return eval(s, {"__builtins__": {}}, {})


def _mix(spec, rnd):
    out = []
    a0, a1 = spec["a"]
    b0, b1 = spec["b"]
    c0, c1 = spec["c"]
    for a in range(a0, a1 + 1):
        for b in range(b0, b1 + 1):
            for c in range(c0, c1 + 1):
                for pat in ("a+b×c", "a×b+c", "(a+b)×c", "a×b-c", "a+b-c"):
                    if pat == "a+b×c":
                        out.append("{} + {} × {}".format(a, b, c))
                    elif pat == "a×b+c":
                        out.append("{} × {} + {}".format(a, b, c))
                    elif pat == "(a+b)×c":
                        if a + b <= 20 and (a + b) * c <= 200:
                            out.append("({} + {}) × {}".format(a, b, c))
                    elif pat == "a×b-c":
                        if a * b >= c:
                            out.append("{} × {} - {}".format(a, b, c))
                    elif pat == "a+b-c" and a + b >= c:
                        out.append("{} + {} - {}".format(a, b, c))
    items = []
    for p in out:
        try:
            v = _eval(p)
        except Exception:
            continue
        if isinstance(v, float) and abs(v - round(v)) > 1e-9:
            continue
        items.append({"p": p, "a": str(int(round(v)))})
    rnd.shuffle(items)
    return items


def _eq(spec, rnd):
    """一年级的看图列式：x+3=7 这种只用加减的方程。"""
    out = []
    for x in range(1, spec.get("xmax", 20) + 1):
        for b in range(1, 21):
            out.append({"p": "x+%d=%d" % (b, x + b), "a": str(x)})
            if x > b:
                out.append({"p": "x-%d=%d" % (b, x - b), "a": str(x)})
    rnd.shuffle(out)
    return out
    rnd.shuffle(out)
    return out


def _eq2(spec, rnd):
    """五年级的简易方程：x+3=9、3x=12、x÷4=5、2x+3=11。"""
    out = []
    top = spec.get("xmax", 12)
    for x in range(1, top + 1):
        for b in range(1, 13):
            out.append({"p": "x+%d=%d" % (b, x + b), "a": str(x)})
            if x > b:
                out.append({"p": "x-%d=%d" % (b, x - b), "a": str(x)})
        for k in range(2, 10):
            out.append({"p": "%dx=%d" % (k, k * x), "a": str(x)})
            out.append({"p": "x÷%d=%d" % (k, x), "a": str(x * k)})
        for k in range(2, 6):
            for b in range(1, 10):
                out.append({"p": "%dx+%d=%d" % (k, b, k * x + b), "a": str(x)})
    rnd.shuffle(out)
    return out


def _prop(spec, rnd):
    """解比例：x : (k·d) = c : d，答案是 k·c（内项积 = 外项积）。"""
    out = []
    for c in range(1, 10):
        for d in range(2, 10):
            if gcd(c, d) != 1:
                continue
            for k in range(2, 8):
                out.append({"p": "x:%d=%d:%d" % (k * d, c, d), "a": str(k * c)})
    rnd.shuffle(out)
    return out


def _ratio(spec, rnd):
    out = []
    for a in range(2, 25):
        for b in range(2, 25):
            if a == b:
                continue
            g = gcd(a, b)
            if g == 1:
                continue
            na, nb = a // g, b // g
            if na == nb:
                continue
            out.append({"p": "%d:%d" % (a, b), "a": "%d:%d" % (na, nb)})
    rnd.shuffle(out)
    return out


def _pct(spec, rnd):
    out = []
    for n in (5, 10, 12, 15, 20, 25, 30, 40, 45, 50, 60, 75, 80, 90, 95, 100, 125, 150):
        out.append({"p": "%d%%=＿" % n, "a": fmt_dec(n / 100, 3)})
        out.append({"p": "%s=＿%%" % fmt_dec(n / 100, 3), "a": str(n)})
    rnd.shuffle(out)
    return out


def _mul_neg(spec, rnd):
    out = []
    for a in range(-10, 11):
        for b in range(-10, 11):
            if a * b == 0:
                continue
            out.append({"p": "%d×%d" % (a, b), "a": str(a * b)})
    rnd.shuffle(out)
    return out


GENS = {
    "as": _add_sub, "md": _mul_table, "m1": _mul_multi, "m2": _mul_multi,
    "d1": _div_multi, "d2": _div_multi, "dr": _div_rem,
    "dec": _dec_add, "decm": _dec_mul, "decd": _dec_div,
    "frac": _frac_add, "fracm": _frac_mul, "fracd": _frac_div,
    "cmp": _cmp, "unit": _unit, "mix": _mix, "eq": _eq, "eq2": _eq2,
    "prop": _prop, "ratio": _ratio, "pct": _pct, "neg": _mul_neg,
    "shift": _shift, "pi": _pi,
}


# ============================================================
# 读法：把「7+5」变成「七加五等于多少」
# ------------------------------------------------------------
# 构建时就把读法算好写进数据（每题的 s 字段），前端只管查语音表，
# 不用在浏览器里再实现一套中文数字转换 —— 两边写法不一致就会出现「有题没声音」。
# ============================================================
DIG = "零一二三四五六七八九"
BIG = ["", "万", "亿", "万亿"]
POS = ["", "十", "百", "千"]


def zh_int(n):
    if n < 0:
        return "负" + zh_int(-n)
    if n == 0:
        return "零"
    groups = []
    while n > 0:
        groups.append(n % 10000)
        n //= 10000
    out = ""
    for gi in range(len(groups) - 1, -1, -1):
        g = groups[gi]
        if g == 0:
            if out and not out.endswith("零"):
                out += "零"
            continue
        part = ""
        for pos in range(3, -1, -1):
            d = (g // 10 ** pos) % 10
            if d == 0:
                if part and not part.endswith("零"):
                    part += "零"
            else:
                part += DIG[d] + POS[pos]
        part = part.rstrip("零")
        out += part + BIG[gi]
    out = out.rstrip("零")
    if out.startswith("一十"):
        out = out[1:]
    return out


def zh_num(s):
    """'13' → 十三；'0.25' → 零点二五；'-8' → 负八"""
    neg = s.startswith("-")
    if neg:
        s = s[1:]
    if "." in s:
        a, b = s.split(".", 1)
        out = zh_int(int(a)) + "点" + "".join(DIG[int(c)] for c in b if c.isdigit())
    else:
        out = zh_int(int(s))
    return ("负" if neg else "") + out


TOKEN = re.compile(r"(\d+\.\d+|\d+/\d+|(?<![\d.x)])-\d+\.?\d*|\d+|\d+x|[+\-×÷:=○＿%（）()])")

OP = {"+": "加", "-": "减", "×": "乘", "÷": "除以", ":": "比", "=": "等于",
      "＿": "多少", "（": "，", "）": "，", "(": "，", ")": "，"}


def zh_read(p):
    """题面 → 说给耳朵听的话。"""
    s = str(p)
    # 比大小：7○5 → 七和五比大小
    if "○" in s:
        a, b = s.split("○", 1)
        return zh_num(a) + "和" + zh_num(b) + "比大小"
    # 百分号是前缀：5% → 百分之五；＿% → 百分之多少
    s = re.sub(r"(\d+(?:\.\d+)?)%", r"百分之\1", s)
    s = s.replace("＿%", "百分之多少")
    # 8x → 8乘x
    s = re.sub(r"(\d)x", r"\1乘x", s)
    out = ""
    for tok in TOKEN.split(s):
        if not tok:
            continue
        if re.fullmatch(r"\d+/\d+", tok):
            a, b = tok.split("/")
            out += zh_num(b) + "分之" + zh_num(a)
        elif re.fullmatch(r"-?\d+(\.\d+)?", tok):
            out += zh_num(tok)
        elif re.fullmatch(r"\d+x", tok):
            out += zh_num(tok[:-1]) + "乘x"
        elif tok in OP:
            out += OP[tok]
        else:
            out += tok
    return out


def build_items(spec, key):
    fn = GENS.get(spec["k"])
    if not fn:
        raise ValueError("未知出题类型：" + spec["k"])
    items = fn(spec, rng(key))
    n = spec.get("n", 80)
    seen, out = set(), []
    for it in items:
        if it["p"] in seen:
            continue
        seen.add(it["p"])
        it["s"] = zh_read(it["p"])      # 读法一起写进数据，前端不用再算一遍
        out.append(it)
        if len(out) >= n:
            break
    return out


# ============================================================
# 组装
# ============================================================
def build():
    books = []
    for b in BOOKS:
        units = []
        for u in b["units"]:
            uid = b["id"] + "-" + u["no"]
            items = build_items(u["gen"], uid) if u.get("gen") else []
            units.append({
                "no": u["no"],
                "title": u["title"],
                "items": items,
                "note": u.get("note", ""),
            })
        books.append({"id": b["id"], "grade": b["grade"], "name": b["name"],
                      "units": units})

    types = []
    for t in TYPES:
        types.append({"id": t["id"], "name": t["name"],
                      "items": build_items(t["gen"], "type-" + t["id"]),
                      "note": t.get("note", "")})

    return books, types


def write(name, obj):
    path = os.path.join(DATA, name + ".json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1, separators=(",", ":"))
    print("  写入 %-16s %6.1f KB" % (name + ".json", os.path.getsize(path) / 1024))


def main():
    os.makedirs(DATA, exist_ok=True)
    books, types = build()

    total = sum(len(u["items"]) for b in books for u in b["units"])
    uniq = len({it["p"] for b in books for u in b["units"] for it in u["items"]})
    print("教材：%d 册 / %d 单元 / 题目 %d 条（去重 %d）"
          % (len(books), sum(len(b["units"]) for b in books), total, uniq))
    for t in types:
        print("   题型 %-14s %4d 题" % (t["name"], len(t["items"])))
    print("知识点 %d 条 / 应用题 %d 道 / 速查表 %d 节"
          % (len(KNOW), sum(len(g["items"]) for g in APPLY["grades"]), len(TABLES["sections"])))

    if "--stat" in os.sys.argv:
        return

    write("books", {"version": 1, "updated": "2026-11-07",
                    "textbook": "人教版小学数学（成都主城区现行）", "books": books})
    write("types", {"version": 1, "types": types})
    know = [dict(k, s=k["name"] + "，" + k["note"]) for k in KNOW]
    write("know", {"version": 1, "items": know})
    write("apply", APPLY)
    write("tables", TABLES)


if __name__ == "__main__":
    main()
