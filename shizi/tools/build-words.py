#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""生成「候选词组池」data/wordpool.json

    为什么要这个文件
    ----------------
    data/dict.json 里的词库是人工编排的（1700 多条），覆盖不到每个字；
    孩子把新字加进识字表以后，很多字在词组表里压根组不出词。

    这个脚本从分词词典（tools/jieba_dict.txt，带词频和词性）里筛出一大批候选词，
    前端再按「当前识字表里的字」实时筛（index.html 的 collectWords）：

        识字表里加了「田」→ 词组表立刻多出「田地 / 稻田 / 水田」……

    人工编排的词库仍然排在最前面，自动词排在后面。

    用法：
        python tools/build-words.py     # 重新生成 data/wordpool.json + wordpool.js
"""

import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "tools", "jieba_dict.txt")
PINYIN = os.path.join(ROOT, "data", "pinyin.json")
OUT_JSON = os.path.join(ROOT, "data", "wordpool.json")
OUT_JS = os.path.join(ROOT, "data", "wordpool.js")

# 词频下限。别调太低：分词表里低频的两字组合有大量「生造搭配」（水禾、金音），
# 高频的那部分才是真正的词。10 这一档下，163 字的识字表能组出 1200 多个词，
# 远超孩子要练的量（前端还有「每个字最多几条」的配额，见 index.html 的 WORD_QUOTA）。
MIN_FREQ = 10

HAN = re.compile(r"^[\u4e00-\u9fff]+$")

# 词性黑名单：人名 / 地名 / 机构名 / 其他专名，以及量词、代词、虚词、语气词等
BAD_POS2 = {"nr", "ns", "nt", "nz", "nw"}
BAD_POS1 = set("xmqpyuoecftr")


def load_common_chars():
    """常用字表（pinyin.json 的 4030 字）：只留全部由常用字组成的词，
    免得「龃龉」「蘡薁」这种连家长都不认识的词混进来。"""
    with open(PINYIN, encoding="utf-8") as f:
        data = json.load(f)
    return set(data.get("chars") or {})


def keep(word, freq, pos, common):
    if not (2 <= len(word) <= 4):
        return False
    if not HAN.match(word):
        return False
    if freq < MIN_FREQ:
        return False
    if pos[:2] in BAD_POS2 or pos[0] in BAD_POS1:
        return False
    return all(c in common for c in word)


def main():
    common = load_common_chars()
    bucket = {2: {}, 3: {}, 4: {}}

    with open(SRC, encoding="utf-8") as f:
        for line in f:
            parts = line.split()
            if len(parts) < 3:
                continue
            word, freq, pos = parts[0], parts[1], parts[2]
            try:
                freq = int(freq)
            except ValueError:
                continue
            if not keep(word, freq, pos, common):
                continue
            b = bucket[len(word)]
            if freq > b.get(word, 0):     # 重复词取最大词频
                b[word] = freq

    out = {}
    for n in (2, 3, 4):
        words = sorted(bucket[n].items(), key=lambda kv: (-kv[1], kv[0]))
        out[str(n)] = [w for w, _ in words]
        print("%d 字词 %5d 个，最高频：%s"
              % (n, len(words), " ".join(w for w, _ in words[:8])))

    payload = {
        "version": 1,
        "note": "候选词组池：按字数分组、词频从高到低。前端按当前识字表实时筛选，"
                "人工编排的 data/dict.json 词库排在它前面。由 tools/build-words.py 生成。",
        "minFreq": MIN_FREQ,
        "words": out,
    }
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
    with open(OUT_JS, "w", encoding="utf-8", newline="\n") as f:
        f.write("window.__SHIZI_WORDPOOL__=")
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")

    total = sum(len(v) for v in out.values())
    size = os.path.getsize(OUT_JSON) / 1024
    print("合计 %d 个候选词 → data/wordpool.json（%.0f KB）" % (total, size))


if __name__ == "__main__":
    main()
