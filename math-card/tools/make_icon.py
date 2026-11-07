# -*- coding: utf-8 -*-
"""生成数学卡片的图标：assets/icon-{180,192,512}.png + assets/math.ico

画的是「一叠卡片」：两张错开的纸卡，前面一张写着 7×8，下面一行 56。
颜色沿用页面里的数学棕橙 #b45309。
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "assets")
os.makedirs(OUT, exist_ok=True)

BROWN = (180, 83, 9)
BROWN_D = (140, 62, 6)
PAPER = (255, 253, 248)
RED = (192, 57, 43)

FONT_BD = "C:/Windows/Fonts/msyhbd.ttc"
FONT_MATH = "C:/Windows/Fonts/seguisb.ttf"


def rounded(size, r, fill):
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(im).rounded_rectangle([0, 0, size - 1, size - 1], r, fill=fill)
    return im


def card(w, h, r):
    """一张纸卡：白底 + 很浅的描边"""
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, w - 1, h - 1], r, fill=PAPER, outline=(232, 222, 205), width=max(2, w // 90))
    return im


def build(px=1024):
    S = px
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))

    # 底：竖直渐变 + 圆角
    bg = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    grad = Image.new("RGB", (1, S))
    gd = ImageDraw.Draw(grad)
    for y in range(S):
        t = y / (S - 1)
        gd.point((0, y), (
            int(BROWN[0] * (1 - t) + BROWN_D[0] * t),
            int(BROWN[1] * (1 - t) + BROWN_D[1] * t),
            int(BROWN[2] * (1 - t) + BROWN_D[2] * t),
        ))
    grad = grad.resize((S, S)).convert("RGBA")
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, S - 1, S - 1], int(S * 0.225), fill=255)
    bg.paste(grad, (0, 0), mask)
    img.alpha_composite(bg)

    # 后面那张卡（微微左旋）
    cw, ch = int(S * 0.56), int(S * 0.66)
    back = card(cw, ch, int(cw * 0.075))
    back = back.rotate(9, resample=Image.BICUBIC, expand=True)
    # 阴影
    sh = Image.new("RGBA", back.size, (0, 0, 0, 0))
    sh.paste((0, 0, 0, 90), (0, 0), back.split()[3])
    sh = sh.filter(ImageFilter.GaussianBlur(S // 40))
    cx, cy = S // 2, S // 2
    sh_pos = (cx - back.width // 2 + int(S * 0.045), cy - back.height // 2 + int(S * 0.055))
    img.alpha_composite(sh, sh_pos)
    img.alpha_composite(back, (cx - back.width // 2 + int(S * 0.035), cy - back.height // 2 - int(S * 0.03)))

    # 前面那张卡（微微右旋）
    front = card(cw, ch, int(cw * 0.075))
    fd = ImageDraw.Draw(front)
    f1 = ImageFont.truetype(FONT_MATH, int(cw * 0.40))
    f2 = ImageFont.truetype(FONT_MATH, int(cw * 0.26))
    t1, t2 = "7×8", "56"
    b1 = fd.textbbox((0, 0), t1, font=f1)
    fd.text(((cw - (b1[2] - b1[0])) / 2 - b1[0], ch * 0.16 - b1[1]), t1, font=f1, fill=BROWN)
    b2 = fd.textbbox((0, 0), t2, font=f2)
    fd.text(((cw - (b2[2] - b2[0])) / 2 - b2[0], ch * 0.60 - b2[1]), "=" + t2, font=f2, fill=RED)
    front = front.rotate(-7, resample=Image.BICUBIC, expand=True)
    fsh = Image.new("RGBA", front.size, (0, 0, 0, 0))
    fsh.paste((0, 0, 0, 70), (0, 0), front.split()[3])
    fsh = fsh.filter(ImageFilter.GaussianBlur(S // 34))
    fx = cx - front.width // 2 - int(S * 0.02)
    fy = cy - front.height // 2 + int(S * 0.045)
    img.alpha_composite(fsh, (fx + int(S * 0.012), fy + int(S * 0.022)))
    img.alpha_composite(front, (fx, fy))

    return img


def main():
    big = build(1024)
    for n in (180, 192, 512):
        big.resize((n, n), Image.LANCZOS).save(os.path.join(OUT, "icon-%d.png" % n))
    big.resize((256, 256), Image.LANCZOS).save(
        os.path.join(OUT, "math.ico"),
        sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    big.resize((512, 512), Image.LANCZOS).save(os.path.join(OUT, "_preview.png"))
    print("ok ->", OUT)


if __name__ == "__main__":
    main()
