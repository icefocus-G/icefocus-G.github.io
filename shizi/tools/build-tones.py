# -*- coding: utf-8 -*-
"""
生成「四声表」音频：6 个单韵母 × 4 个声调 = 24 条纯元音带调音。

为什么不直接让 TTS 读带调拼音（ā á ǎ à）？
    实测 edge-tts 读拼音时声调不可靠（ó 读成平调、ě 读成降调），
    SSML 的 <phoneme> / <prosody contour> 又会被 Edge 端点拒收。

为什么不用「汉字录音剪掉声母」？
    剪掉 b/p 的爆破音之后，残留的爆破和共振峰过渡听起来还是「ba / bo / da」，
    孩子会以为 ā 就念 ba。

现在的做法：拿**单元音本身**的干净录音（啊 喔 婀 衣 乌 迂，都是第一声、纯元音、
没有声母），用 PSOLA（基音同步叠加）把音高按目标曲线改成二声/三声/四声。
元音还是那个元音、共振峰不变，变的只有音高 —— 正是声调本身。

用法：
    python tools/build-tones.py

产物：
    data/audio/tone/<id>.mp3
    data/audio/manifest.json 里的 "tones": {"ā": "tone/a1.mp3", ...}

依赖：pip install soundfile lameenc
"""
import hashlib
import json
import os

import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
AUDIO = os.path.join(ROOT, "data", "audio")
OUT = os.path.join(AUDIO, "tone")
MANIFEST = os.path.join(AUDIO, "manifest.json")

VOICE = "zh-CN-XiaoxiaoNeural"
RATE = "-10%"
BITRATE = 64          # kbps，语音够用，单条约 8KB

# 六个单韵母的「干净素材」：都是纯元音、第一声、没有声母
#   id 前缀, 韵母, 四个调的写法, 素材汉字
VOWELS = [
    ("a", "a", ["ā", "á", "ǎ", "à"], "啊"),
    ("o", "o", ["ō", "ó", "ǒ", "ò"], "喔"),
    ("e", "e", ["ē", "é", "ě", "è"], "婀"),
    ("i", "i", ["ī", "í", "ǐ", "ì"], "衣"),
    ("u", "u", ["ū", "ú", "ǔ", "ù"], "乌"),
    ("v", "ü", ["ǖ", "ǘ", "ǚ", "ǜ"], "鱼"),
]

# 整体认读音节里，有几个字 TTS 读得不对（迂被读成 yī、约被读成 yāo、冤/晕 也不稳），
# 改成用读音可靠的常用字当素材，再用同一条一声曲线合成：
#   (卡片上的带调写法, 素材汉字, 用第几条曲线)
SYNTH = [
    ("yū", "鱼", 0),
    ("yuē", "月", 0),
    ("yūn", "云", 0),
    ("yuān", "元", 0),
    ("ǖ", "鱼", 0),      # 单韵母 ü 卡
    ("üē", "月", 0),     # 复韵母 üe 卡
    ("ǖn", "云", 0),     # 前鼻韵母 ün 卡
]

# 四个调的音高曲线：横轴 0→1 是时长，纵轴是相对基础音高的半音数
#   一声 55 高平、二声 35 上扬、三声 214 降升、四声 51 下降
TONES = [
    (0.50, [(0.0, 0.0), (1.0, -0.3)]),                                  # 一声 · 高平
    (0.52, [(0.0, -1.5), (0.15, -1.2), (0.55, 1.5), (1.0, 5.0)]),       # 二声 · 上扬
    (0.66, [(0.0, 1.0), (0.35, -3.2), (0.70, -3.6), (1.0, 1.2)]),       # 三声 · 降升
    (0.46, [(0.0, 2.6), (0.25, 1.6), (0.60, -2.0), (1.0, -7.0)]),       # 四声 · 下降
]


# ---------------------------------------------------------------- 素材

def rel_of(text):
    h = 2166136261
    for b in text.encode("utf-8"):
        h = ((h ^ b) * 16777619) & 0xFFFFFFFF
    return "%02x/%s.mp3" % (h & 0x3F, "-".join("%04x" % ord(c) for c in text))


def load_manifest():
    with open(MANIFEST, encoding="utf-8") as f:
        return json.load(f)


def source_path(text, man):
    rel = (man.get("chars") or {}).get(text) or (man.get("words") or {}).get(text)
    if rel:
        p = os.path.join(AUDIO, rel)
        if os.path.exists(p) and os.path.getsize(p) > 512:
            return p
    p = os.path.join(AUDIO, rel_of(text))
    if os.path.exists(p) and os.path.getsize(p) > 512:
        return p
    import asyncio

    import edge_tts

    os.makedirs(os.path.dirname(p), exist_ok=True)
    for _ in range(3):
        try:
            asyncio.run(edge_tts.Communicate(text, VOICE, rate=RATE).save(p))
            if os.path.getsize(p) > 512:
                return p
        except Exception:
            pass
    raise SystemExit("生成素材音频失败：" + text)


def read_mono(path):
    d, sr = sf.read(path, dtype="float64", always_2d=False)
    if d.ndim > 1:
        d = d.mean(axis=1)
    return d, int(sr)


# ---------------------------------------------------------------- 分析

def frames(x, sr, win=0.025, hop=0.005):
    w, h = int(win * sr), int(hop * sr)
    n = max(1, (len(x) - w) // h + 1)
    return np.stack([x[i * h:i * h + w] for i in range(n)]), h


def energy(x, sr, win=0.025, hop=0.005):
    fr, h = frames(x, sr, win, hop)
    return np.sqrt((fr ** 2).mean(axis=1)), h


def f0_of(frame, sr):
    f = frame - frame.mean()
    c = np.correlate(f, f, "full")[len(f) - 1:]
    if c[0] <= 0:
        return 0.0
    lo, hi = int(sr / 400), int(sr / 80)
    seg = c[lo:hi]
    if not len(seg) or seg.max() < 0.4 * c[0]:
        return 0.0
    return sr / (np.argmax(seg) + lo)


def steady_vowel(x, sr):
    """取中间那段稳定元音：掐掉起音和收尾"""
    e, hop = energy(x, sr)
    good = [i for i, v in enumerate(e) if v > 0.45 * e.max()]
    a, b = good[0], good[-1]
    a += int(0.030 * sr / hop)          # 起音过渡
    b -= int(0.055 * sr / hop)          # 收尾
    if b - a < int(0.12 * sr / hop):
        a, b = good[0], good[-1]
    return x[a * hop:b * hop]


def median_f0(x, sr):
    fr, _ = frames(x, sr)
    vals = [f0_of(f, sr) for f in fr]
    vals = [v for v in vals if v > 0]
    return float(np.median(vals)) if vals else 200.0


def pitch_marks(x, f0, sr):
    """基音标记：从能量最大处出发，按周期左右各找一次声门脉冲（局部峰）"""
    P = int(round(sr / f0))
    if P < 8 or len(x) < 3 * P:
        return []
    start = int(np.argmax(np.abs(x)))
    marks = [start]
    pos = start
    while pos + 1.5 * P < len(x):
        lo = int(pos + 0.65 * P)
        hi = min(int(pos + 1.45 * P), len(x))
        if hi - lo < 3:
            break
        pos = lo + int(np.argmax(np.abs(x[lo:hi])))
        marks.append(pos)
    pos = start
    while pos - 1.5 * P > 0:
        hi = int(pos - 0.65 * P)
        lo = max(int(pos - 1.45 * P), 0)
        if hi - lo < 3:
            break
        pos = lo + int(np.argmax(np.abs(x[lo:hi])))
        marks.insert(0, pos)
    return marks


# ---------------------------------------------------------------- PSOLA 合成

def semi_at(curve, t):
    for i in range(len(curve) - 1):
        x0, y0 = curve[i]
        x1, y1 = curve[i + 1]
        if x0 <= t <= x1:
            k = 0 if x1 == x0 else (t - x0) / (x1 - x0)
            return y0 + (y1 - y0) * k
    return curve[-1][1]


def psola(x, sr, f0, curve, dur):
    """按曲线改音高，同时把时长拉到 dur 秒（元音场景：两周期 Hann 窗叠加）"""
    P = int(round(sr / f0))
    marks = pitch_marks(x, f0, sr)
    if not marks:
        return None
    n = int(dur * sr)
    out = np.zeros(n + 4 * P)
    nrm = np.zeros(n + 4 * P)
    w = np.hanning(2 * P)
    span = max(1.0, len(x) - 2 * P)

    pos = 0.0                     # 输出位置，单位是采样点
    while pos < n:
        frac = pos / n
        semi = semi_at(curve, frac)
        f = f0 * (2 ** (semi / 12.0))
        step = sr / f                 # 一个周期多少采样点
        src_t = frac * span
        m = min(marks, key=lambda q: abs(q - src_t))
        s = m - P
        if s >= 0 and s + 2 * P <= len(x):
            i = int(pos)
            out[i:i + 2 * P] += x[s:s + 2 * P] * w
            nrm[i:i + 2 * P] += w
        pos += step

    out = out / np.maximum(nrm, 1e-6)
    return out[:n]


def envelope(y, sr):
    fi, fo = int(0.018 * sr), int(0.055 * sr)
    if len(y) > fi + fo:
        y = y.copy()
        y[:fi] *= np.linspace(0, 1, fi)
        y[-fo:] *= np.linspace(1, 0, fo)
    return y


def pad(x, sr, head=0.03, tail=0.10):
    return np.concatenate([np.zeros(int(head * sr)), x, np.zeros(int(tail * sr))])


def write_mp3(path, x, sr):
    import lameenc

    peak = np.abs(x).max()
    if peak > 0:
        x = x / peak * 0.92
    pcm = np.clip(x * 32767, -32768, 32767).astype("<i2").tobytes()
    enc = lameenc.Encoder()
    enc.set_bit_rate(BITRATE)
    enc.set_in_sample_rate(sr)
    enc.set_channels(1)
    enc.set_quality(5)
    data = enc.encode(pcm) + enc.flush()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(data)
    return len(data)


def contour(path, n=9):
    """自检：打印音高曲线（半音，相对中位数）"""
    x, sr = read_mono(path)
    e, _ = energy(x, sr)
    fr, _ = frames(x, sr)
    vals = []
    for f, en in zip(fr, e):
        if en < e.max() * 0.2:
            continue
        v = f0_of(f, sr)
        if v:
            vals.append(v)
    if len(vals) < 5:
        return "无浊音"
    v = np.array(vals)
    st = 12 * np.log2(v / np.median(v))
    a, b = int(len(st) * 0.1), int(len(st) * 0.9)
    s = st[a:b]
    return " ".join("%+.1f" % s[int(k * (len(s) - 1) / (n - 1))] for k in range(n))


def main():
    man = load_manifest()

    # 先把 24 条全合成出来，再按内容算一个总指纹当目录名：
    # 地址是 tone/<指纹>/a1.mp3，改了音指纹就变，浏览器和 CDN 都不会拿旧的
    clips = []          # (文件名, 波形, 采样率, 写法)
    for vid, vowel, marks, src in VOWELS:
        p = source_path(src, man)
        raw, sr = read_mono(p)
        base = steady_vowel(raw, sr)
        f0 = median_f0(base, sr)
        print("%s（%s）素材 %s  稳定元音 %.2fs  F0≈%.0fHz"
              % (vowel, src, os.path.basename(p), len(base) / sr, f0))
        for k, (dur, curve) in enumerate(TONES):
            y = psola(base, sr, f0, curve, dur)
            if y is None:
                raise SystemExit("合成失败：%s%d" % (vid, k + 1))
            clips.append(("%s%d.mp3" % (vid, k + 1), pad(envelope(y, sr), sr), sr, marks[k]))

    # 整音节：同样用 PSOLA，只是走一声那条平曲线
    for i, (key, src, k) in enumerate(SYNTH):
        p = source_path(src, man)
        raw, sr = read_mono(p)
        base = steady_vowel(raw, sr)
        f0 = median_f0(base, sr)
        dur, curve = TONES[k]
        y = psola(base, sr, f0, curve, dur)
        if y is None:
            raise SystemExit("合成失败：" + key)
        clips.append(("syn%d.mp3" % i, pad(envelope(y, sr), sr), sr, key))
        print("  整音节 %s ← %s（%.0fHz）" % (key, src, f0))

    h = hashlib.md5()
    for name, y, sr, _ in clips:
        h.update(name.encode())
        h.update(np.clip(y * 32767, -32768, 32767).astype("<i2").tobytes())
    digest = h.hexdigest()[:10]
    outdir = os.path.join(OUT, digest)
    os.makedirs(outdir, exist_ok=True)
    # 只留这一版，旧指纹目录删掉，别把仓库堆胖
    for old in os.listdir(OUT):
        if old != digest:
            oldp = os.path.join(OUT, old)
            if os.path.isdir(oldp):
                for f in os.listdir(oldp):
                    os.remove(os.path.join(oldp, f))
                os.rmdir(oldp)
            else:
                os.remove(oldp)

    tones = {}
    for name, y, sr, mark in clips:
        path = os.path.join(outdir, name)
        size = write_mp3(path, y, sr)
        tones[mark] = "tone/%s/%s" % (digest, name)
        print("  %-8s %s %.2fs %5dB  %s"
              % (name, mark, len(y) / sr, size, contour(path)))

    man["tones"] = tones
    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(man, f, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(AUDIO, "manifest.js"), "w", encoding="utf-8", newline="\n") as f:
        f.write("window.__SHIZI_AUDIO__=")
        json.dump(man, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")
    print("完成：%d 条四声音 → tone/%s/" % (len(tones), digest))


if __name__ == "__main__":
    main()
