# -*- coding: utf-8 -*-
"""生成单词 / 短语 / 字母的读音 mp3

    pip install edge-tts
    python tools/build-audio.py            # 增量：已有的跳过，只补新的
    python tools/build-audio.py --force    # 全部重来
    python tools/build-audio.py --limit 20 # 只做前 20 条，调试用

产物：
    data/audio/<两位哈希>/<slug>.mp3
    data/audio/manifest.json   { voice, rate, words:{}, phrases:{}, letters:{} }
    data/audio/manifest.js     同一份清单的脚本版，file:// 双击打开时兜底

文件名只用 ASCII（小写字母、数字、连字符），避免中文 / 空格在服务器上出乱码；
按文字哈希分到 64 个子目录，避免一个目录堆六百个文件。
"""

import argparse
import asyncio
import hashlib
import json
import os
import re
import sys

try:
    import edge_tts
except ImportError:
    sys.exit("需要先安装：pip install edge-tts")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
AUDIO = os.path.join(DATA, "audio")

VOICE = "en-GB-SoniaNeural"     # 英式女声，吐字清楚；想换童声可用 en-GB-MaisieNeural
RATE = "-8%"                    # 比正常略慢，孩子跟得上
PITCH = "+0Hz"

LETTERS = list("ABCDEFGHIJKLMNOPQRSTUVWXYZ")


def slug(text):
    """文字 → ASCII 文件名（不含扩展名）"""
    if len(text) == 1 and text.isupper():
        return "up-" + text.lower()          # 字母名，和单词 a 区分开
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s or "x"


def rel_path(text):
    h = hashlib.md5(text.encode("utf-8")).hexdigest()[:2]
    return "%s/%s.mp3" % (h, slug(text))


def load_json(name):
    with open(os.path.join(DATA, name + ".json"), encoding="utf-8") as f:
        return json.load(f)


async def synth(text, path, force=False):
    """合成一条；已存在就跳过。返回 True=已有/成功"""
    full = os.path.join(AUDIO, path)
    if os.path.exists(full) and os.path.getsize(full) > 800 and not force:
        return "skip"
    os.makedirs(os.path.dirname(full), exist_ok=True)
    for attempt in range(3):
        try:
            tts = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
            await tts.save(full)
            if os.path.getsize(full) > 800:
                return "ok"
        except Exception as e:                     # noqa: BLE001
            if attempt == 2:
                print("  失败：%s（%s）" % (text, e))
                return "fail"
            await asyncio.sleep(1.2 * (attempt + 1))
    return "fail"


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--concurrency", type=int, default=4)
    args = ap.parse_args()

    phon = load_json("phon")
    words = list(phon.get("words", {}).keys())
    phrases = list(phon.get("phrases", {}).keys())

    try:
        reading = load_json("reading")
    except FileNotFoundError:
        reading = {"grades": []}
    sentences = []
    for g in reading.get("grades", []):
        for art in g.get("articles", []):
            for s in art.get("sentences", []):
                sentences.append((s["key"], s["en"]))

    jobs = []                      # (key, text, kind)
    for w in words:
        jobs.append((w, w, "words"))
    for p in phrases:
        jobs.append((p, p, "phrases"))
    for L in LETTERS:
        jobs.append((L, L, "letters"))
    for key, text in sentences:
        jobs.append((key, text, "readings"))

    if args.limit:
        jobs = jobs[:args.limit]

    os.makedirs(AUDIO, exist_ok=True)
    print("共 %d 条 · 音色 %s · 语速 %s" % (len(jobs), VOICE, RATE))

    sem = asyncio.Semaphore(args.concurrency)
    stat = {"ok": 0, "skip": 0, "fail": 0}
    manifest = {"version": 2, "voice": VOICE, "rate": RATE,
                "words": {}, "phrases": {}, "letters": {}, "readings": {}}

    async def one(key, text, kind):
        rel = rel_path(text)
        manifest[kind][key] = rel
        async with sem:
            r = await synth(text, rel, args.force)
            stat[r] = stat.get(r, 0) + 1
            done = stat["ok"] + stat["skip"] + stat["fail"]
            if done % 25 == 0:
                print("  %d/%d …" % (done, len(jobs)))

    await asyncio.gather(*(one(k, t, kind) for k, t, kind in jobs))

    mpath = os.path.join(AUDIO, "manifest.json")
    with open(mpath, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(AUDIO, "manifest.js"), "w", encoding="utf-8") as f:
        f.write("/* 由 tools/build-audio.py 生成，勿手工编辑 */\n")
        f.write("window.__EN_AUDIO__ = " + json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + ";\n")

    print("完成：新生成 %d · 跳过 %d · 失败 %d" % (stat.get("ok", 0), stat.get("skip", 0), stat.get("fail", 0)))
    print("清单：", os.path.relpath(mpath, ROOT))


if __name__ == "__main__":
    asyncio.run(main())
