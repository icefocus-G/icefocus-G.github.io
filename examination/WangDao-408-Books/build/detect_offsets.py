#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从 OCR 文本的页眉/页脚提取印刷页码，反推「书内页码 = PDF 页序 - 偏移」。"""
import json, re, collections

BASE = "/Volumes/02-program/WorkBuddyPlace/2026-11-24-16-13-41/408教材"
BOOKS = {"ds": 404, "cn": 316, "os": 372, "co": 340}


def load_js(k):
    s = open(f"{BASE}/search/{k}.js").read()
    arr = json.loads(s[s.index("=") + 1: s.rstrip().rindex(";")])
    return arr


def guess_offset(arr):
    votes = collections.Counter()
    samples = []
    for i, txt in enumerate(arr, start=1):
        if not txt:
            continue
        head = [ln for ln in txt.splitlines()[:2]]
        foot = [ln for ln in txt.splitlines()[-2:]]
        cand = []
        for ln in head + foot:
            m = re.search(r"(\d{1,3})\s*$", ln.strip())
            if m:
                cand.append(int(m.group(1)))
            m = re.match(r"^(\d{1,3})\b", ln.strip())
            if m:
                cand.append(int(m.group(1)))
        for c in cand:
            off = i - c
            if 0 <= off <= 30:
                votes[off] += 1
                samples.append((i, c))
    if not votes:
        return None, 0
    off, n = votes.most_common(1)[0]
    total = sum(votes.values())
    return off, n / total


res = {}
for k, n in BOOKS.items():
    arr = load_js(k)
    off, conf = guess_offset(arr)
    # 用该偏移回头校验：命中的页占比
    hit = 0
    for i, txt in enumerate(arr, start=1):
        if txt and re.search(r"(^|\s)%d\s*$" % (i - off), txt.splitlines()[0] if txt.splitlines() else ""):
            hit += 1
    res[k] = off
    print(f"{k}: 偏移 {off}（票数占比 {conf:.0%}），首行命中 {hit}/{n}")
json.dump(res, open(f"{BASE}/build/offsets.json", "w"))
print(res)
