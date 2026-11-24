#!/usr/bin/env python3
"""页面级 OCR，仅用于全文搜索定位，不作为正文展示。"""
import json, os, subprocess, time
from concurrent.futures import ProcessPoolExecutor

BASE = "/Volumes/02-program/WorkBuddyPlace/2026-11-24-16-13-41/408教材"
BOOKS = {"ds": 404, "cn": 316, "os": 372, "co": 340}
ENV = {**os.environ, "OMP_THREAD_LIMIT": "1"}


def ocr(arg):
    key, n = arg
    path = f"{BASE}/pages/{key}/{n:04d}.webp"
    try:
        out = subprocess.run(
            ["tesseract", path, "-", "-l", "chi_sim", "--psm", "3"],
            capture_output=True, text=True, env=ENV, timeout=90,
        ).stdout
    except Exception as e:
        return key, n, f"[OCR失败 {e!r}]"
    lines = [ln.strip() for ln in out.splitlines()]
    lines = [ln for ln in lines if len(ln.strip(" 　|·-—=_.")) >= 2]
    return key, n, "\n".join(lines)


def main():
    os.makedirs(f"{BASE}/search", exist_ok=True)
    tasks = [(k, i) for k, n in BOOKS.items() for i in range(1, n + 1)]
    t0 = time.time()
    store = {k: {} for k in BOOKS}
    done = 0
    with ProcessPoolExecutor(max_workers=9) as ex:
        for key, n, txt in ex.map(ocr, tasks, chunksize=6):
            store[key][n] = txt
            done += 1
            if done % 150 == 0:
                print(f"{done}/{len(tasks)}  {time.time()-t0:.0f}s", flush=True)

    for k, n in BOOKS.items():
        arr = [store[k].get(i, "") for i in range(1, n + 1)]
        js = f"window.__TXT_{k}=" + json.dumps(arr, ensure_ascii=False, separators=(",", ":")) + ";"
        with open(f"{BASE}/search/{k}.js", "w") as f:
            f.write(js)
        empty = sum(1 for a in arr if not a.strip())
        print(f"{k}: {len(arr)} 页，空白 {empty} 页，{(os.path.getsize(f'{BASE}/search/{k}.js'))/1048576:.2f}MB")
    print(f"总用时 {time.time()-t0:.0f}s")


if __name__ == "__main__":
    main()
