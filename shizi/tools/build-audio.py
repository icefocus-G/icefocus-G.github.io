# -*- coding: utf-8 -*-
"""
为字库和词库里的每一个字 / 词生成 mp3 语音，并输出清单。

用法：
    python tools/build-audio.py            # 增量：已存在的文件跳过
    python tools/build-audio.py --force    # 全部重生成
    python tools/build-audio.py --limit 30 # 只做前 30 条（调试用）

产物：
    data/audio/<hh>/<码点>.mp3     hh = 文本哈希低 6 位（64 个目录，避免单目录堆几千文件）
    data/audio/manifest.json       字/词 → 相对路径
    data/audio/manifest.js         同上，供 file:// 双击打开时兜底

依赖：pip install edge-tts
"""
import asyncio
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "data")
OUT = os.path.join(DATA, "audio")

VOICE = "zh-CN-XiaoxiaoNeural"   # 微软中文女声，吐字清楚，适合儿童
RATE = "-10%"                     # 比正常稍慢
CONCURRENCY = 8
RETRY = 3

# ---------------------------------------------------------------- 收集文本

def read_json(name):
    p = os.path.join(DATA, name)
    if not os.path.exists(p):
        return None
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def is_han(s):
    return all("\u4e00" <= ch <= "\u9fff" for ch in s)


def collect():
    chars, words = set(), set()

    # 1) 拼音表里所有单字（覆盖 jieba 最常用 4000 字，手工加的生僻字也多半在）
    pj = read_json("pinyin.json") or {}
    for c in (pj.get("chars") or {}):
        if len(c) == 1 and is_han(c):
            chars.add(c)

    # 2) 年级字表
    gr = read_json("grades.json") or {}
    for g in gr.get("grades") or []:
        for item in g.get("chars") or []:
            c = item[0] if isinstance(item, list) else item
            if len(c) == 1 and is_han(c):
                chars.add(c)

    # 3) 词库
    dj = read_json("dict.json") or {}
    for n in ("2", "3", "4"):
        for w in (dj.get("words") or {}).get(n) or []:
            if is_han(w):
                words.add(w)
    for c in dj.get("defaultChars") or "":
        if is_han(c):
            chars.add(c)

    # 3.5) 候选词组池里「字全部在默认识字表内」的词：词组表会自动匹配出这些词，
    #      先把音备好，免得点读时退回系统语音（字表变了再跑一次本脚本即可）
    wp = read_json("wordpool.json") or {}
    default_chars = set(dj.get("defaultChars") or "")
    if default_chars:
        for n in ("2", "3", "4"):
            for w in (wp.get("words") or {}).get(n) or []:
                if is_han(w) and all(ch in default_chars for ch in w):
                    words.add(w)

    # 4) 学拼音页的例字（从 index.html 的 PY_LESSON / PY_TONES 里抓）
    idx = os.path.join(ROOT, "index.html")
    if os.path.exists(idx):
        with open(idx, encoding="utf-8") as f:
            html = f.read()
        # 新格式：["b", "bō", "玻"] —— 第三个字段才是要读的汉字（前两个是符号和标注）
        for m in re.finditer(r'\[\s*"[^"]*"\s*,\s*"[^"]*"\s*,\s*"([\u4e00-\u9fff]{1,4})"\s*\]', html):
            t = m.group(1)
            chars.add(t) if len(t) == 1 else words.add(t)
        # 四声表是四个字段：["ā", "妈", "mā", "第一声 · 高平"]
        for m in re.finditer(r'\[\s*"[^"]*"\s*,\s*"([\u4e00-\u9fff]{1,4})"\s*,\s*"[^"]*"', html):
            t = m.group(1)
            chars.add(t) if len(t) == 1 else words.add(t)

    # 词里的字也顺带生成（用户可以单独点词里的字）
    for w in words:
        for ch in w:
            if is_han(ch):
                chars.add(ch)

    return sorted(chars), sorted(words)


def key_of(text):
    return "-".join("%04x" % ord(ch) for ch in text)


def rel_of(text):
    h = 2166136261
    for b in text.encode("utf-8"):
        h = ((h ^ b) * 16777619) & 0xFFFFFFFF
    return "%02x/%s.mp3" % (h & 0x3F, key_of(text))

# ---------------------------------------------------------------- 生成

async def synth(text, path, sem, force):
    if not force and os.path.exists(path) and os.path.getsize(path) > 512:
        return "skip"
    async with sem:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        import edge_tts
        for i in range(RETRY):
            try:
                c = edge_tts.Communicate(text, VOICE, rate=RATE)
                await c.save(path)
                if os.path.exists(path) and os.path.getsize(path) > 512:
                    return "ok"
            except Exception:
                pass
            await asyncio.sleep(1.2 * (i + 1))
        if os.path.exists(path) and os.path.getsize(path) < 512:
            try:
                os.remove(path)
            except OSError:
                pass
        return "fail"


async def main():
    force = "--force" in sys.argv
    limit = 0
    if "--limit" in sys.argv:
        limit = int(sys.argv[sys.argv.index("--limit") + 1])

    chars, words = collect()
    if limit:
        chars, words = chars[:limit], words[:limit]
    total = len(chars) + len(words)
    print("待生成：单字 %d · 词 %d · 合计 %d" % (len(chars), len(words), total))

    sem = asyncio.Semaphore(CONCURRENCY)
    done = [0, 0]      # ok, skip
    fails = []

    async def run(text, kind):
        path = os.path.join(OUT, rel_of(text))
        st = await synth(text, path, sem, force)
        if st == "fail":
            fails.append(text)
        else:
            done[0 if st == "ok" else 1] += 1
        n = done[0] + done[1] + len(fails)
        if n % 200 == 0:
            print("  ... %d/%d（新生成 %d · 已有 %d · 失败 %d）" % (n, total, done[0], done[1], len(fails)))

    tasks = [run(c, "char") for c in chars] + [run(w, "word") for w in words]
    await asyncio.gather(*tasks)

    # 四声表的音是 tools/build-tones.py 单独剪出来的，重跑本脚本时别把它们丢掉
    old = read_json("audio/manifest.json") or {}
    tones = old.get("tones") or {}

    manifest = {
        "version": 1,
        "voice": VOICE,
        "rate": RATE,
        "chars": {c: rel_of(c) for c in chars},
        "words": {w: rel_of(w) for w in words},
        "tones": tones,
    }
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(OUT, "manifest.js"), "w", encoding="utf-8", newline="\n") as f:
        f.write("window.__SHIZI_AUDIO__=")
        json.dump(manifest, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")

    size = 0
    cnt = 0
    for dirpath, _, files in os.walk(OUT):
        for fn in files:
            if fn.endswith(".mp3"):
                size += os.path.getsize(os.path.join(dirpath, fn))
                cnt += 1
    print("完成：新生成 %d · 跳过 %d · 失败 %d" % (done[0], done[1], len(fails)))
    print("音频文件 %d 个，共 %.1f MB" % (cnt, size / 1048576))
    if fails:
        print("失败示例：" + "、".join(fails[:20]))


if __name__ == "__main__":
    asyncio.run(main())
