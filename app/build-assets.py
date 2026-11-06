#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成「工具箱」iPad 应用壳的图标与启动图。

只用 Pillow，不依赖 numpy。产物：

    icon-1024.png        主图（设计稿，全幅不圆角，iOS 自己会切圆角）
    icon-512.png         安卓 / 清单用
    icon-192.png         清单用
    icon-180.png         apple-touch-icon（iOS 桌面图标实际取这个）
    splash/*.png         iPad 各机型启动图，避免打开时白屏闪一下

改动设计后重跑：python app/build-assets.py
"""

import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SPLASH_DIR = os.path.join(HERE, "splash")

# 配色跟站点一致（tool/index.html 的 --bg / --a1 / --a2）
BG_TOP = (9, 15, 32)
BG_BOT = (13, 26, 58)
CYAN = (56, 189, 248)
PURPLE = (167, 139, 250)
INK = (232, 238, 251)
DIM = (139, 158, 194)

FONT_CN = "C:/Windows/Fonts/msyhbd.ttc"
FONT_EN = "C:/Windows/Fonts/msyh.ttc"


def linear_bg(w, h):
    """斜向渐变底：左上深、右下微微透蓝。"""
    n = 192
    tiny = Image.new("RGB", (n, n))
    px = tiny.load()
    for y in range(n):
        for x in range(n):
            t = (x / (n - 1)) * 0.55 + (y / (n - 1)) * 0.45
            px[x, y] = tuple(int(BG_TOP[i] + (BG_BOT[i] - BG_TOP[i]) * t) for i in range(3))
    return tiny.resize((w, h), Image.LANCZOS)


def add_glow(img, cx, cy, r, color, strength):
    """在 (cx,cy) 叠一团柔光。"""
    cx, cy, r = int(cx), int(cy), max(2, int(r))
    grad = Image.radial_gradient("L").resize((r * 2, r * 2), Image.BILINEAR)
    mask = grad.point(lambda v: int((1 - v / 255.0) ** 2.2 * strength * 255))
    layer = Image.new("RGB", img.size, color)
    full_mask = Image.new("L", img.size, 0)
    full_mask.paste(mask, (int(cx - r), int(cy - r)))
    img.paste(layer, (0, 0), full_mask)


def gradient_tile(size, radius):
    """青→紫的对角渐变方块（用来做高亮那格）。"""
    n = 128
    tiny = Image.new("RGB", (n, n))
    px = tiny.load()
    for y in range(n):
        for x in range(n):
            t = (x / (n - 1)) * 0.6 + (y / (n - 1)) * 0.4
            px[x, y] = tuple(int(CYAN[i] + (PURPLE[i] - CYAN[i]) * t) for i in range(3))
    img = tiny.resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def draw_mark(layer, cx, cy, box):
    """在透明层上画四宫格：三格半透明、一格实心高亮。

    cx, cy 是四宫格的中心，box 是整组的边长（正方形）。
    """
    gap = box * 0.061
    tile = (box - gap) / 2
    rad = box * 0.111
    stroke = max(2, box * 0.0063)
    x0 = cx - box / 2
    y0 = cy - box / 2
    gx = x0 + tile + gap
    gy = y0 + tile + gap

    d = ImageDraw.Draw(layer)
    for (x, y) in ((x0, y0), (gx, y0), (x0, gy)):
        d.rounded_rectangle(
            [x, y, x + tile, y + tile], radius=rad,
            fill=(255, 255, 255, 46), outline=(255, 255, 255, 118), width=int(stroke),
        )

    halo = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    for k, alpha in ((0.030, 12), (0.018, 18), (0.010, 26), (0.005, 34)):
        s = max(1, int(box * k))
        tmp = Image.new("RGBA", (int(tile) + s * 2, int(tile) + s * 2), (0, 0, 0, 0))
        ImageDraw.Draw(tmp).rounded_rectangle(
            [0, 0, int(tile) + s * 2 - 1, int(tile) + s * 2 - 1], radius=rad + s, fill=CYAN + (alpha,)
        )
        halo.paste(tmp, (int(gx) - s, int(gy) - s), tmp)
    layer.alpha_composite(halo)

    layer.alpha_composite(gradient_tile(int(tile), int(rad)), (int(gx), int(gy)))


def make_icon(size):
    img = linear_bg(size, size).convert("RGBA")
    add_glow(img, size * 0.16, size * 0.10, size * 0.62, (20, 70, 120), 0.75)
    add_glow(img, size * 0.88, size * 0.02, size * 0.52, (70, 50, 130), 0.62)
    add_glow(img, size * 0.5, size * 1.02, size * 0.55, (12, 40, 80), 0.5)
    mark = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw_mark(mark, size / 2, size / 2, size * 0.512)
    img.alpha_composite(mark)
    return img


def fit_icon(size):
    """先按 1024 渲染再缩小，边缘更干净。"""
    return make_icon(1024).resize((size, size), Image.LANCZOS)


def make_splash(w, h):
    img = linear_bg(w, h).convert("RGBA")
    add_glow(img, w * 0.5, h * 0.32, min(w, h) * 0.62, (22, 62, 110), 0.55)
    add_glow(img, w * 0.16, h * 0.08, min(w, h) * 0.5, (20, 70, 120), 0.5)

    mark = int(min(w, h) * 0.30)
    cy = int(h * 0.40)

    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw_mark(layer, w / 2, cy, mark)
    img.alpha_composite(layer)
    top = cy + mark / 2

    d = ImageDraw.Draw(img)
    scale = min(w, h) / 1024.0

    f_cn = ImageFont.truetype(FONT_CN, int(92 * scale))
    txt = "工具箱"
    tw = d.textlength(txt, font=f_cn)
    d.text(((w - tw) / 2, top + 84 * scale), txt, font=f_cn, fill=INK + (255,))

    f_en = ImageFont.truetype(FONT_EN, int(30 * scale))
    sub = " I C E F O C U S   ·   T O O L B O X "
    sw = d.textlength(sub, font=f_en)
    d.text(((w - sw) / 2, top + 214 * scale), sub, font=f_en, fill=DIM + (255,))
    return img


ICONS = [
    ("icon-1024.png", 1024),
    ("icon-512.png", 512),
    ("icon-192.png", 192),
    ("icon-180.png", 180),
]

# (文件名, 宽, 高) —— CSS 像素 × 设备像素比
SPLASHES = [
    ("ipad-768x1024.png", 1536, 2048),
    ("ipad-768x1024-l.png", 2048, 1536),
    ("ipad-810x1080.png", 1620, 2160),
    ("ipad-810x1080-l.png", 2160, 1620),
    ("ipad-820x1180.png", 1640, 2360),
    ("ipad-820x1180-l.png", 2360, 1640),
    ("ipad-834x1194.png", 1668, 2388),
    ("ipad-834x1194-l.png", 2388, 1668),
    ("ipad-1024x1366.png", 2048, 2732),
    ("ipad-1024x1366-l.png", 2732, 2048),
    ("ipad-744x1133.png", 1488, 2266),
    ("ipad-744x1133-l.png", 2266, 1488),
]


def main():
    os.makedirs(SPLASH_DIR, exist_ok=True)
    master = make_icon(1024)
    for name, size in ICONS:
        img = master if size == 1024 else master.resize((size, size), Image.LANCZOS)
        img.save(os.path.join(HERE, name), optimize=True)
        print("icon ", name, os.path.getsize(os.path.join(HERE, name)))

    for name, w, h in SPLASHES:
        p = os.path.join(SPLASH_DIR, name)
        make_splash(w, h).convert("RGB").save(p, optimize=True)
        print("splash", name, os.path.getsize(p))


if __name__ == "__main__":
    main()
