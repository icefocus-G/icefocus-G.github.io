#!/usr/bin/env python3
"""清洗书签：剔除广告/目录页、合并重复标题、计算每节页码范围。"""
import json, re

RAW = "/Volumes/02-program/WorkBuddyPlace/2026-11-24-16-13-41/408教材/build/raw_toc.json"
OUT = "/Volumes/02-program/WorkBuddyPlace/2026-11-24-16-13-41/408教材/build/toc.json"

META = {
    "ds": {"name": "数据结构", "code": "DS", "full": "数据结构"},
    "cn": {"name": "计算机网络", "code": "CN", "full": "计算机网络"},
    "os": {"name": "操作系统", "code": "OS", "full": "操作系统"},
    "co": {"name": "计算机组成原理", "code": "CO", "full": "计算机组成原理"},
}

DROP = ("王道训练营", "目 录", "目　录", "前 言", "致 读 者", "前　言", "致　读　者")
# 卷首里这些不是广告，要保留为可跳转条目（键为去掉空格后的标题）
FRONT = {"前言": "前言", "致读者": "致读者", "目录": "目录", "王道训练营": "王道训练营（广告页）"}


def norm(t):
    t = t.replace("\u3000", " ").strip()
    t = re.sub(r"\s+", " ", t)
    return t


def clean(toc):
    # 1) 去掉广告与目录页整棵子树，但卷首的实质内容记下来留用
    out, skip_level = [], None
    front = {}
    for lv, title, pg in toc:
        nt = norm(title)
        key = nt.replace(" ", "")
        if key in FRONT and pg > 1:
            # 同一标题可能出现多次（目录页里也有一份），取最早出现的位置
            front.setdefault(FRONT[key], pg)
        if skip_level is not None:
            if lv > skip_level:
                continue
            skip_level = None
        if any(k in nt for k in DROP):
            skip_level = lv
            continue
        if pg <= 1:          # 页码异常的脏条目
            continue
        out.append([lv, nt, pg])

    # 2) 合并同页的“裸标题”，如「第1章」与「第1章 计算机系统概述」
    merged = []
    for item in out:
        if merged:
            prev = merged[-1]
            same_page = prev[2] == item[2] and prev[0] == item[0]
            if same_page and (item[1].startswith(prev[1]) or prev[1].startswith(item[1])):
                if len(item[1]) > len(prev[1]):
                    merged[-1] = item
                continue
        merged.append(item)

    # 3) 完全重复
    seen, uniq = set(), []
    for item in merged:
        k = (item[0], item[1], item[2])
        if k in seen:
            continue
        seen.add(k)
        uniq.append(item)
    return uniq, front


def build(toc, pages, front=None):
    """把平铺的 4 级列表还原成树，并写入 end 页。"""
    root = {"children": []}
    stack = [(0, root)]
    flat = []
    for lv, title, pg in toc:
        while stack and stack[-1][0] >= lv:
            stack.pop()
        node = {"t": title, "p": pg, "children": []}
        stack[-1][1]["children"].append(node)
        stack.append((lv, node))
        flat.append(node)

    # 按页码顺序计算 end（下一个同级或更高级节点的起始页 -1）
    def walk(nodes, limit):
        for i, n in enumerate(nodes):
            # 下一个同级节点的起始页 -1 就是本节末页；最后一个节点用 limit（含）
            end = (nodes[i + 1]["p"] - 1) if i + 1 < len(nodes) else limit
            if n["children"]:
                walk(n["children"], end)
            n["end"] = max(end, n["p"])

    walk(root["children"], pages)

    # 书签里偶有子条目页码超过父节末页的情况，父节范围需包含全部子条目
    def widen(ns):
        for n in ns:
            if n["children"]:
                widen(n["children"])
                n["end"] = max(n["end"], max(c["end"] for c in n["children"]))

    widen(root["children"])
    # 卷首：封面 / 前言 / 致读者 / 目录 各自成条，保证从第 1 页起连续且都能跳
    front = front or {}
    first = next((c["p"] for c in root["children"] if c["p"] > 1), pages)
    if first > 1:
        stops = [("封面", 1)]
        for name in ("前言", "致读者", "王道训练营（广告页）", "目录"):
            pg = front.get(name)
            if pg and 1 < pg < first:
                stops.append((name, pg))
        if not any(n == "目录" for n, _ in stops):
            stops.append(("目录", stops[-1][1]))
        stops.sort(key=lambda x: x[1])
        kids = []
        for i, (t, a) in enumerate(stops):
            b = (stops[i + 1][1] - 1) if i + 1 < len(stops) else (first - 1)
            kids.append({"t": t, "p": a, "end": max(a, b), "children": []})
        root["children"].insert(0, {"t": "卷首", "p": 1, "end": first - 1, "children": kids})
    return root["children"]


def main():
    raw = json.load(open(RAW))
    res = {}
    for key, v in raw.items():
        toc, front = clean(v["toc"])
        chs = build(toc, v["pages"], front)
        res[key] = {**META[key], "pages": v["pages"], "chapters": chs}
        n_all = len(toc)
        n_ch = len([c for c in chs if c["t"].startswith("第")])
        print(f"{key}: 书签 {len(v['toc'])} → 清洗后 {n_all}，一级节点 {len(chs)}，正文章 {n_ch}")
        for c in chs[:3]:
            print(f"   · {c['t']}  p{c['p']}-{c['end']}  子节点{len(c['children'])}")
    json.dump(res, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
    print("写出", OUT)


if __name__ == "__main__":
    main()
