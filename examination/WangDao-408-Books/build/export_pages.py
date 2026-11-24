#!/usr/bin/env python3
"""把四本 PDF 的全部页面导出为 WebP，供教程页面按页加载。"""
import io, os, sys, time
import pymupdf
from PIL import Image
from multiprocessing import Pool

SRC = "/Volumes/02-program"
BOOKS = {
    "ds": "2027数据结构_高清带书签版.pdf",
    "cn": "2027计算机网络_高清带书签版.pdf",
    "os": "王道2027操作系统-高清带书签.pdf",
    "co": "王道2027计算机组成原理_高清带书签版.pdf",
}
OUT = "/Volumes/02-program/WorkBuddyPlace/2026-11-24-16-13-41/408教材/pages"
DPI = 132
Q = 76


def job(arg):
    key, idx = arg
    d = pymupdf.open(os.path.join(SRC, BOOKS[key]))
    pix = d[idx].get_pixmap(dpi=DPI, colorspace=pymupdf.csRGB)
    im = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
    path = os.path.join(OUT, key, f"{idx + 1:04d}.webp")
    im.save(path, "WEBP", quality=Q, method=5)
    d.close()
    return idx, os.path.getsize(path)


def main():
    tasks = []
    for key, f in BOOKS.items():
        os.makedirs(os.path.join(OUT, key), exist_ok=True)
        n = pymupdf.open(os.path.join(SRC, f)).page_count
        tasks += [(key, i) for i in range(n)]
    print(f"总页数 {len(tasks)}", flush=True)
    t0 = time.time()
    done = 0
    total = 0
    with Pool(8) as p:
        for idx, size in p.imap_unordered(job, tasks, chunksize=4):
            done += 1
            total += size
            if done % 100 == 0:
                el = time.time() - t0
                print(f"{done}/{len(tasks)}  {el:.0f}s  已写 {total/1048576:.1f}MB", flush=True)
    print(f"完成 {done} 页，{total/1048576:.1f}MB，用时 {time.time()-t0:.0f}s", flush=True)


if __name__ == "__main__":
    main()
