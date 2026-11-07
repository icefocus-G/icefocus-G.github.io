# -*- coding: utf-8 -*-
"""把题目、知识点、应用题的「读法」生成 mp3（微软 edge-tts，中文女声）

    python tools/build-audio.py            # 增量：已有的跳过，只补新的
    python tools/build-audio.py --force    # 全部重来
    python tools/build-audio.py --limit 5  # 只做 5 条，试听用

需要：pip install edge-tts

清单 data/audio/manifest.json 是「文字 → 文件」的绑定表，前端只查表：
    { "voice":"zh-CN-XiaoxiaoNeural", "rate":"-8%",
      "texts": { "七加五等于多少": "3f/9a8b7c6d5e4f.mp3" } }
文件名取文字 md5，纯 ASCII，服务器上不会因中文文件名出乱码；
按前两位分到 64 个子目录，避免一个目录堆两千多个文件。
"""

import asyncio
import hashlib
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, "data")
AUDIO = os.path.join(DATA, "audio")

VOICE = "zh-CN-XiaoxiaoNeural"
RATE = "-8%"

try:
    import edge_tts
except ImportError:
    print("缺 edge-tts：pip install edge-tts")
    sys.exit(1)


def load(name):
    path = os.path.join(DATA, name + ".json")
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def collect():
    """所有要说出口的句子。同一句话只用生成一次。"""
    texts = []

    books = load("books")
    if books:
        for b in books["books"]:
            for u in b["units"]:
                for it in u["items"]:
                    if it.get("s"):
                        texts.append(it["s"])

    types = load("types")
    if types:
        for t in types["types"]:
            for it in t["items"]:
                if it.get("s"):
                    texts.append(it["s"])

    know = load("know")
    if know:
        for k in know["items"]:
            if k.get("s"):
                texts.append(k["s"])

    apply_ = load("apply")
    if apply_:
        for g in apply_["grades"]:
            for a in g["items"]:
                texts.extend(a.get("q", []))
                texts.extend(a.get("steps", []))
                if a.get("a"):
                    texts.append(a["a"])

    seen, out = set(), []
    for t in texts:
        t = (t or "").strip()
        if not t or t in seen:
            continue
        seen.add(t)
        out.append(t)
    return out


def rel_of(text):
    h = hashlib.md5(text.encode("utf-8")).hexdigest()
    return h[:2] + "/" + h[:14] + ".mp3"


async def synth(text, path, sem, stats):
    async with sem:
        for attempt in range(3):
            try:
                comm = edge_tts.Communicate(text, VOICE, rate=RATE)
                await comm.save(path)
                if os.path.getsize(path) > 800:
                    stats["new"] += 1
                    return True
            except Exception as e:                      # 网络抖动就重试
                if attempt == 2:
                    stats["fail"].append((text, str(e)[:80]))
                else:
                    await asyncio.sleep(1.2 * (attempt + 1))
        return False


async def run(texts, force, limit):
    os.makedirs(AUDIO, exist_ok=True)
    sem = asyncio.Semaphore(6)
    stats = {"new": 0, "fail": [], "skip": 0}
    manifest = {"voice": VOICE, "rate": RATE, "texts": {}}
    todo = []

    for text in texts:
        rel = rel_of(text)
        manifest["texts"][text] = rel
        path = os.path.join(AUDIO, rel.replace("/", os.sep))
        if not force and os.path.exists(path) and os.path.getsize(path) > 800:
            stats["skip"] += 1
            continue
        os.makedirs(os.path.dirname(path), exist_ok=True)
        todo.append((text, path))

    if limit:
        todo = todo[:limit]
    print("共 %d 句：已有 %d，待生成 %d" % (len(texts), stats["skip"], len(todo)))

    done = 0
    tasks = []
    for text, path in todo:
        tasks.append(synth(text, path, sem, stats))
        done += 1
        if done % 100 == 0:
            await asyncio.gather(*tasks)
            tasks = []
            print("  进度 %d / %d" % (done, len(todo)), flush=True)
    if tasks:
        await asyncio.gather(*tasks)

    return manifest, stats


def main():
    texts = collect()
    force = "--force" in sys.argv
    limit = None
    for i, a in enumerate(sys.argv):
        if a == "--limit":
            limit = int(sys.argv[i + 1])

    manifest, stats = asyncio.run(run(texts, force, limit))

    # 清单只保留文件确实在的条目
    kept = {t: r for t, r in manifest["texts"].items()
            if os.path.exists(os.path.join(AUDIO, r.replace("/", os.sep)))}
    manifest["texts"] = kept
    manifest["count"] = len(kept)

    with open(os.path.join(AUDIO, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(AUDIO, "manifest.js"), "w", encoding="utf-8") as f:
        f.write("/* 由 tools/build-audio.py 生成，不要手改 */\n")
        f.write("window.__MATH_AUDIO__ = " + json.dumps(manifest, ensure_ascii=False) + ";\n")

    print("新建 %d 条，跳过 %d 条，清单共 %d 条" % (stats["new"], stats["skip"], len(kept)))
    if stats["fail"]:
        print("失败 %d 条（重跑会再试）：" % len(stats["fail"]))
        for t, e in stats["fail"][:8]:
            print("   ", t, "|", e)


if __name__ == "__main__":
    main()
