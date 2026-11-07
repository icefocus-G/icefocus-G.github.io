# -*- coding: utf-8 -*-
"""生成应用图标（assets/icon-*.png + en.ico）

    python tools/make-icons.py

一张 512 的画：圆角方块底 + 白色「Aa」+ 底下一张小卡片的影子，
和识字软件那套图标是一个系列的观感（只是换了主色）。
"""

import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
BLUE = (31, 111, 178)
BLUE_DARK = (22, 84, 138)
CREAM = (255, 254, 251)

FONT_CANDIDATES = [
    r"C:\Windows\Fonts\georgiab.ttf",
    r"C:\Windows\Fonts\timesbd.ttf",
    r"C:\Windows\Fonts\arialbd.ttf",
    "/System/Library/Fonts/Times.ttc",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
]


def font(size):
    for p in FONT_CANDIDATES:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                continue
    return ImageFont.load_default()


def rounded(size, radius_ratio=0.22):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = int(size * radius_ratio)
    # 主色底 + 底部一条略深的带，做出一点厚度
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=r, fill=BLUE)
    d.rounded_rectangle([0, int(size * 0.66), size - 1, size - 1], radius=r, fill=BLUE_DARK)
    d.rectangle([0, int(size * 0.66), size - 1, int(size * 0.66) + r], fill=BLUE_DARK)
    # 上面再盖一张白卡，像纸片
    pad = int(size * 0.14)
    d.rounded_rectangle([pad, pad, size - pad, int(size * 0.70)], radius=int(size * 0.06),
                        fill=CREAM)
    f = font(int(size * 0.40))
    text = "Aa"
    box = d.textbbox((0, 0), text, font=f)
    tw, th = box[2] - box[0], box[3] - box[1]
    d.text(((size - tw) / 2 - box[0], int(size * 0.39) - th / 2 - box[1]), text, font=f, fill=BLUE)
    return img


def main():
    os.makedirs(ASSETS, exist_ok=True)
    base = rounded(1024)
    for s in (180, 192, 512):
        base.resize((s, s), Image.LANCZOS).save(os.path.join(ASSETS, "icon-%d.png" % s))
        print("写出 assets/icon-%d.png" % s)
    base.resize((256, 256), Image.LANCZOS).save(
        os.path.join(ASSETS, "en.ico"),
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    print("写出 assets/en.ico")


if __name__ == "__main__":
    main()
