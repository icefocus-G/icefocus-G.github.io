# -*- coding: utf-8 -*-
"""按教材重建数据

源：
    tools/textbook.txt   人教版《英语（新起点）》一年级起点 1~6 年级 12 册词汇
    tools/reading.txt    配套分级阅读短文（原创）
    tools/.cache/en_UK.txt  英式 IPA 词典（open-dict-data/ipa-dict，MIT/公有领域数据）

产出：
    data/dict.json      默认词库（一年级） + 教材短语（按词数分组）
    data/phon.json      单词 / 短语的 音标 + 中文
    data/levels.json    1~6 年级分级词表
    data/reading.json   1~6 年级阅读短文

用法：python tools/build_textbook.py
之后还要跑：node tools/build-data.js  &&  python tools/build-audio.py
"""

import json
import os
import re
import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
TOOLS = os.path.join(ROOT, "tools")
IPA_DICT = os.path.join(TOOLS, ".cache", "en_UK.txt")

GRADE_NAMES = {1: "一年级", 2: "二年级", 3: "三年级", 4: "四年级", 5: "五年级", 6: "六年级"}
TERM_NAMES = {"A": "上册", "B": "下册"}

# 词典里查不到、或词典写法不适合小学生时，手工给定（英式 DJ）
IPA_OVERRIDE = {
    "a": "ə", "an": "ən", "the": "ðə", "i": "aɪ", "ok": "ˌəʊˈkeɪ",
    "pe": "ˌpiːˈiː", "tv": "ˌtiːˈviː", "t-shirt": "ˈtiː ʃɜːt",
    "ice-cream": "ˌaɪs ˈkriːm", "can't": "kɑːnt", "let's": "lets",
    "won": "wʌn", "swam": "swæm", "slept": "slept", "were": "wɜː",
    "d.c.": "ˌdiː ˈsiː", "washington": "ˈwɒʃɪŋtən",
    "sichuan": "ˌsɪtʃuˈæn", "chengdu": "ˌtʃeŋˈduː",
    # 英式词典漏收的常见词 / 月份 / 专有名词
    "christmas": "ˈkrɪsməs", "wear": "weə", "january": "ˈdʒænjuəri",
    "february": "ˈfebruəri", "april": "ˈeɪprəl", "june": "dʒuːn",
    "july": "dʒʊˈlaɪ", "august": "ˈɔːɡəst", "september": "sepˈtembə",
    "october": "ɒkˈtəʊbə", "november": "nəʊˈvembə", "december": "dɪˈsembə",
    "second": "ˈsekənd", "use": "juːz", "job": "dʒɒb", "reading": "ˈriːdɪŋ",
    "canada": "ˈkænədə", "australia": "ɒˈstreɪliə", "disneyland": "ˈdɪznilænd",
    "subject": "ˈsʌbdʒɪkt", "london": "ˈlʌndən", "toronto": "təˈrɒntəʊ",
    "sydney": "ˈsɪdni", "africa": "ˈæfrɪkə", "asia": "ˈeɪʃə",
    "american": "əˈmerɪkən", "live": "lɪv", "quite": "kwaɪt",
    "ate": "et", "british": "ˈbrɪtɪʃ", "cn": "ˌsiːˈen", "email": "ˈiːmeɪl",
    "english": "ˈɪŋɡlɪʃ", "english-chinese": "ˈɪŋɡlɪʃ ˌtʃaɪˈniːz",
    "excuse": "ɪkˈskjuːz", "flowers": "ˈflaʊəz", "french": "frentʃ",
    "ontario": "ɒnˈteəriəʊ", "potala": "pəˈtɑːlə", "row": "rəʊ",
    "rowed": "rəʊd", "tower": "ˈtaʊə", "uk": "ˌjuːˈkeɪ", "usa": "ˌjuː es ˈeɪ",
    "yangtze": "ˈjæŋtsi", "mother's": "ˈmʌðəz", "white house": "ˈwaɪt haʊs",
    "opera": "ˈɒpərə", "terrace": "ˈterɪs", "washington": "ˈwɒʃɪŋtən",
}

# 只出现在短语里、教材没单列的功能词，给个中文义（点读卡片上会用）
ZH_GLOSSARY = {
    "a": "一（个）", "an": "一（个）", "the": "这（个）", "of": "……的",
    "to": "到；向", "at": "在", "for": "为；给", "on": "在……上",
    "by": "乘（车）", "in": "在……里", "and": "和", "with": "和……一起",
    "go": "去", "be": "是", "do": "做", "not": "不", "one's": "某人的",
    "me": "我（宾格）", "some": "一些", "a lot": "许多",
}

VOWELS = set("iɪeɛæɑɒɔʊuʌəɜɐaoœøy")


def norm_chars(s):
    """把词典音标统一成教材用的 DJ 写法"""
    reps = {"ɛ": "e", "ɐ": "ə", "ɑ": "ɑ", "ɡ": "ɡ", "g": "ɡ", ":": "ː",
            "ɹ": "r", "ɚ": "ə", "ɝ": "ɜː", "ʔ": "", "ʲ": "", "˞": ""}
    out = []
    for ch in s:
        out.append(reps.get(ch, ch))
    return "".join(out).replace("ːː", "ː")


def nuclei_count(s):
    n = 0
    prev = False
    for ch in s:
        v = ch in VOWELS
        if v and not prev:
            n += 1
        prev = v
    return n


def normalize_ipa(raw):
    """'/bəˈnɑːnə/, /bəˈnɑːnə/' → 'bəˈnɑːnə'；把重音挪到音节首"""
    if not raw:
        return ""
    s = raw.split(",")[0].strip().strip("/").strip()
    s = norm_chars(s)
    i = s.find("ˈ")
    if i < 0:
        return s.replace("ˌ", "")
    clean = s.replace("ˈ", "").replace("ˌ", "")
    if nuclei_count(clean) <= 1:
        return clean
    j = min(i, len(clean) - 1)
    k = j
    while k < len(clean) and clean[k] not in VOWELS:
        k += 1
    if k >= len(clean):
        return clean
    start = k
    while start > 0 and clean[start - 1] not in VOWELS and clean[start - 1] not in "ːˑ.":
        start -= 1
    return clean[:start] + "ˈ" + clean[start:]


def load_ipa_dict():
    d = {}
    with open(IPA_DICT, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or "\t" not in line:
                continue
            w, ipa = line.split("\t", 1)
            d.setdefault(w.lower(), ipa)
    return d


def lookup_ipa(word, ipa_dict):
    w = word.lower().strip(".,!?")
    if w in IPA_OVERRIDE:
        return IPA_OVERRIDE[w]
    if w in ipa_dict:
        return normalize_ipa(ipa_dict[w])
    for suf in ("'s", "s", "es", "ed", "ing"):
        if w.endswith(suf) and len(w) - len(suf) >= 3:
            base = w[: -len(suf)]
            if base in ipa_dict:
                return normalize_ipa(ipa_dict[base])
            if base + "e" in ipa_dict:
                return normalize_ipa(ipa_dict[base + "e"])
    if "-" in w:
        parts = [lookup_ipa(p, ipa_dict) or "" for p in w.split("-") if p]
        if all(parts):
            return " ".join(p.strip("/") for p in parts)
    return ""


def clean_word(w):
    w = re.sub(r"\([^)]*\)", "", w).strip()
    w = w.strip(".,!?;:")
    return w


def parse_textbook():
    grades = {g: [] for g in GRADE_NAMES}
    phrases = []
    seen_phrase = set()
    cur = None
    with open(os.path.join(TOOLS, "textbook.txt"), encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")
            if not line.strip() or line.lstrip().startswith("#"):
                continue
            if line.startswith("==="):
                m = re.match(r"===\s*(\d)([AB])\s*(U\d+)", line)
                if not m:
                    raise ValueError("表头格式不对：" + line)
                cur = (int(m.group(1)), m.group(2), m.group(3))
                continue
            if not cur:
                continue
            # 英文部分可能带空格（短语），中文部分也可能夹着 ASCII（T恤衫、D.C.）。
            # 判据：从左往右收「全是 ASCII 的词」，遇到第一个含中文的词就收手。
            toks = line.split()
            cut = 0
            while cut < len(toks) and all(ord(c) < 128 for c in toks[cut]):
                cut += 1
            if cut == 0 or cut == len(toks):
                continue
            en = " ".join(toks[:cut])
            zh = " ".join(toks[cut:]).strip()
            en = clean_word(en)
            if not en or "..." in en or "…" in en:
                continue
            grade, term, unit = cur
            # a/an 这类一次给两个词
            if "/" in en and " " not in en:
                for w in en.split("/"):
                    w = clean_word(w)
                    if w:
                        grades[grade].append((w, zh, term, unit))
                continue
            if " " in en:
                n = len(en.split())
                if 2 <= n <= 4 and en.lower() not in seen_phrase:
                    seen_phrase.add(en.lower())
                    phrases.append((en, zh, grade, term, unit))
                continue
            grades[grade].append((en, zh, term, unit))

    # 年级内去重，保留第一次出现；跨年级重复是教材的复习词，保留
    for g in grades:
        seen = set()
        uniq = []
        for w, zh, term, unit in grades[g]:
            if w.lower() in seen:
                continue
            seen.add(w.lower())
            uniq.append((w, zh, term, unit))
        grades[g] = uniq
    return grades, phrases


def parse_reading():
    grades = {g: [] for g in GRADE_NAMES}
    cur = None
    with open(os.path.join(TOOLS, "reading.txt"), encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")
            if not line.strip() or line.lstrip().startswith("#"):
                continue
            if line.startswith("==="):
                bits = [x.strip() for x in line[3:].split("|")]
                g = int(bits[0])
                idx = len(grades[g]) + 1
                cur = {
                    "id": "g%da%d" % (g, idx),
                    "grade": g,
                    "unit": bits[1],
                    "title": bits[2],
                    "titleZh": bits[3],
                    "sentences": [],
                }
                grades[g].append(cur)
                continue
            if not cur or "|" not in line:
                continue
            en, zh = [x.strip() for x in line.split("|", 1)]
            cur["sentences"].append({
                "key": "%s:%d" % (cur["id"], len(cur["sentences"])),
                "en": en, "zh": zh,
            })
    return grades


def dump(name, obj):
    p = os.path.join(DATA, name + ".json")
    with open(p, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
    print("  data/%-14s %s" % (name + ".json", os.path.getsize(p) // 1024), "KB")


def main():
    ipa_dict = load_ipa_dict()
    grades, phrases = parse_textbook()
    readings = parse_reading()
    today = datetime.date.today().isoformat()

    # 以干净的手工音标表为底：里面手工校过的 DJ 音标优先，
    # 且老版本浏览器缓存里的自定义词仍能显示。
    # 优先用 .cache 基线，避免本脚本重跑时读到自己生成的版本。
    base_path = os.path.join(TOOLS, ".cache", "phon_base.json")
    if not os.path.exists(base_path):
        base_path = os.path.join(DATA, "phon.json")
    old_phon = json.load(open(base_path, encoding="utf-8")) if os.path.exists(base_path) else {"words": {}, "phrases": {}}
    words = dict(old_phon.get("words", {}))

    # 教材单词：中文以教材为准，音标优先沿用手工校过的
    for g, items in grades.items():
        for w, zh, term, unit in items:
            old = words.get(w) or words.get(w.lower()) or ["", ""]
            ipa = old[0] or lookup_ipa(w, ipa_dict) or IPA_OVERRIDE.get(w.lower(), "")
            words[w] = [ipa, zh]

    # 教材短语：逐词音标从 words 取，缺的功能词补进 words
    phrase_dict = {}
    phrase_groups = {"2": [], "3": [], "4": []}
    for p, zh, g, term, unit in phrases:
        tokens = p.split()
        ipas = []
        for t in tokens:
            bare = clean_word(t).lower()
            if t not in words and bare not in words:
                words[bare] = [lookup_ipa(t, ipa_dict), ZH_GLOSSARY.get(bare, "")]
            hit = words.get(t) or words.get(bare) or ["", ""]
            ipas.append(hit[0])
        phrase_dict[p] = [" ".join(x for x in ipas if x), zh]
        phrase_groups[str(len(tokens))].append(p)

    # 阅读短文里出现的生词，若是词典里的常用词也补个音标（点句朗读不依赖它，但词卡要）
    for g, arts in readings.items():
        for art in arts:
            for s in art["sentences"]:
                for raw in re.findall(r"[A-Za-z][A-Za-z'-]*", s["en"]):
                    bare = raw.lower()
                    if bare not in words and len(bare) > 1:
                        ipa = lookup_ipa(bare, ipa_dict)
                        if ipa:
                            words[bare] = [ipa, ""]

    # 默认词库 = 一年级全部单词（严格教材顺序）
    default_words = [w for w, _, _, _ in grades[1]]

    dump("dict", {
        "version": 2, "updated": today,
        "source": "人教版《英语（新起点）》一年级起点 · 成都 1~6 年级",
        "note": "defaultWords 为一年级教材全部单词；phrases 为教材短语，按词数分组。",
        "defaultWords": default_words,
        "phrases": phrase_groups,
    })

    dump("phon", {
        "version": 2, "updated": today, "accent": "uk",
        "note": "音标（英式 DJ）+ 中文释义。教材词以教材释义为准；其余为词典补充，便于自定义加词。",
        "words": words, "phrases": phrase_dict,
    })

    levels = []
    for g in sorted(grades):
        items = grades[g]
        by_term = {}
        for w, zh, term, unit in items:
            by_term.setdefault(TERM_NAMES[term], 0)
            by_term[TERM_NAMES[term]] += 1
        levels.append({
            "level": g,
            "name": GRADE_NAMES[g],
            "note": "人教版新起点 · " + "、".join("%s %d 词" % (k, v) for k, v in by_term.items()),
            "words": [w for w, _, _, _ in items],
        })
    dump("levels", {
        "version": 2, "updated": today,
        "source": "人教版《英语（新起点）》一年级起点（成都主城区现行教材）12 册",
        "note": "1~6 年级分级词表，按教材单元顺序；跨年级重复为教材复习词。",
        "levels": levels,
    })

    dump("reading", {
        "version": 1, "updated": today,
        "note": "配套分级阅读短文，原创，只用本年级及以前学过的词；生词在中文里给出。",
        "grades": [{"grade": g, "name": GRADE_NAMES[g], "articles": readings[g]} for g in sorted(readings)],
    })

    print("\n年级词数：" + " · ".join("%s %d" % (GRADE_NAMES[g], len(grades[g])) for g in sorted(grades)))
    print("教材短语：" + " · ".join("%s 词 %d" % (k, len(v)) for k, v in phrase_groups.items()))
    print("阅读短文：" + " · ".join("%s %d 篇" % (GRADE_NAMES[g], len(readings[g])) for g in sorted(readings)))
    missing = [w for w, v in words.items() if not v[0] and w in default_words]
    print("一年级缺音标：" + (", ".join(missing) if missing else "无"))


if __name__ == "__main__":
    main()
