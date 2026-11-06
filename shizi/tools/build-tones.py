# -*- coding: utf-8 -*-
"""
生成「四声表」音频：6 个单韵母 × 4 个声调 = 24 条纯元音带调音。

为什么不用 TTS 直接读带调拼音（あ ā á ǎ à）？
    实测 edge-tts 读拼音时声调不可靠（ó 读平、ě 读降），孩子学不会。
所以这里改成：拿真实汉字的录音（声调一定对），把开头的声母剪掉，
只留下元音 —— 「八 bā」剪掉 b 就是 ā，「拔 bá」剪掉 b 就是 á。

用法：
    python tools/build-tones.py

产物：
    data/audio/tone/<id>.mp3
    data/audio/manifest.json 里的 "tones": {"ā": "tone/a1.mp3", ...}
"""
import json
import os
import sys

import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
AUDIO = os.path.join(ROOT, "data", "audio")
OUT = os.path.join(AUDIO, "tone")
MANIFEST = os.path.join(AUDIO, "manifest.json")

VOICE = "zh-CN-XiaoxiaoNeural"
RATE = "-10%"
BITRATE = 64          # kbps，语音够用，单条约 7KB

# id, 四声写法, 来源（汉字 / (词, 取第几个音节)）, 裁剪方式
#   None  = 本来就以元音开头，不剪
#   "stop"= 开头是 b/p/d/t/g/k 这类爆破音，剪掉闭塞+送气
SPECS = [
    ("a1", "ā", "阿", None),
    ("a2", "á", "拔", "stop"),
    ("a3", "ǎ", "把", "stop"),
    ("a4", "à", "爸", "stop"),
    ("o1", "ō", "波", "stop"),
    ("o2", "ó", "博", "stop"),
    ("o3", "ǒ", "簸", "stop"),
    ("o4", "ò", "破", "stop"),
    ("e1", "ē", "婀", None),
    ("e2", "é", "鹅", None),
    ("e3", "ě", ("恶心", 1), None),   # ě 只有「恶心」能读出来，取第一音节
    ("e4", "è", "饿", None),
    ("i1", "ī", "衣", None),
    ("i2", "í", "姨", None),
    ("i3", "ǐ", "已", None),
    ("i4", "ì", "意", None),
    ("u1", "ū", "乌", None),
    ("u2", "ú", "无", None),
    ("u3", "ǔ", "五", None),
    ("u4", "ù", "物", None),
    ("v1", "ǖ", "迂", None),
    ("v2", "ǘ", "鱼", None),
    ("v3", "ǚ", "雨", None),
    ("v4", "ǜ", "玉", None),
]


def rel_of(text):
    h = 2166136261
    for b in text.encode("utf-8"):
        h = ((h ^ b) * 16777619) & 0xFFFFFFFF
    return "%02x/%s.mp3" % (h & 0x3F, "-".join("%04x" % ord(c) for c in text))


def load_manifest():
    with open(MANIFEST, encoding="utf-8") as f:
        return json.load(f)


def source_path(text, man):
    """找来源录音；没有就用 edge-tts 现生成一条（不进清单，只当素材）"""
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
    raise SystemExit("生成来源音频失败：" + text)


# ---------------------------------------------------------------- 信号处理

def frames(x, sr, win=0.03, hop=0.01):
    w, h = int(win * sr), int(hop * sr)
    n = max(1, (len(x) - w) // h + 1)
    out = np.empty((n, w))
    for i in range(n):
        out[i] = x[i * h:i * h + w]
    return out, h


def analyse(x, sr):
    """每帧的能量与周期性（自相关峰 / 零延迟峰）"""
    fr, hop = frames(x, sr)
    e = np.sqrt((fr ** 2).mean(axis=1))
    r = np.zeros(len(fr))
    lo, hi = int(sr / 400), int(sr / 80)
    for i, f in enumerate(fr):
        f = f - f.mean()
        c = np.correlate(f, f, "full")[len(f) - 1:]
        if c[0] <= 0:
            continue
        seg = c[lo:hi]
        if len(seg):
            r[i] = seg.max() / c[0]
    return e, r, hop


def trim_onset(x, sr, mode):
    """剪掉开头的声母：找到第一个「又响又有周期」的帧，往前留 20ms"""
    e, r, hop = analyse(x, sr)
    if not len(e):
        return x
    th_e = e.max() * 0.30
    good = [i for i in range(len(e)) if e[i] > th_e and r[i] > 0.40]
    start = 0
    if mode == "stop" and good:
        start = max(0, (good[0] - 2) * hop)
    elif mode is None and good:
        # 以元音开头：只掐掉真正的静音
        start = max(0, (good[0] - 3) * hop)
    end_frames = [i for i in range(len(e)) if e[i] > e.max() * 0.12]
    end = min(len(x), (end_frames[-1] + 3) * hop) if end_frames else len(x)
    y = np.array(x[start:end], dtype=np.float64)
    # 首尾淡入淡出，避免爆音
    fi, fo = int(0.015 * sr), int(0.045 * sr)
    if len(y) > fi * 2:
        y[:fi] *= np.linspace(0, 1, fi)
        y[-fo:] *= np.linspace(1, 0, fo)
    return y


def cut_first_syllable(x, sr):
    """双音节词取第一个音节（恶心 → ě）。

    两个音节之间是后一个字的辅音（x 是擦音），周期性会掉下来的那一段就是
    分界，比找能量最低点准（三声本身中间就有个能量谷）。"""
    e, r, hop = analyse(x, sr)
    if not len(e):
        return x
    lo = int(len(e) * 0.35)
    cut_f = None
    for i in range(lo, len(r) - 2):
        if r[i] < 0.35 and r[i + 1] < 0.45:
            cut_f = i
            break
    cut = (cut_f * hop if cut_f else int(len(x) * 0.5)) + int(0.015 * sr)
    y = np.array(x[:cut], dtype=np.float64)
    fo = int(0.045 * sr)
    if len(y) > fo:
        y[-fo:] *= np.linspace(1, 0, fo)
    return y


def read_mono(path):
    d, sr = sf.read(path, dtype="float64", always_2d=False)
    if d.ndim > 1:
        d = d.mean(axis=1)
    return d, int(sr)


def pad(x, sr, head=0.02, tail=0.09):
    """前后留一点静音，点下去不至于太突然"""
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


def contour(path, n=7):
    """自检用：打印音高曲线，确认剪完还是那个调"""
    x, sr = read_mono(path)
    e, r, hop = analyse(x, sr)
    if not len(e):
        return "静音"
    f0 = []
    for i, f in enumerate(frames(x, sr)[0]):
        f = f - f.mean()
        c = np.correlate(f, f, "full")[len(f) - 1:]
        lo, hi = int(sr / 400), int(sr / 80)
        seg = c[lo:hi]
        if not len(seg) or c[0] <= 0 or seg.max() < 0.35 * c[0]:
            continue
        f0.append(sr / (np.argmax(seg) + lo))
    if len(f0) < 5:
        return "无浊音"
    f0 = np.array(f0)
    st = 12 * np.log2(f0 / np.median(f0))
    a, b = int(len(st) * 0.1), int(len(st) * 0.9)
    s = st[a:b]
    return " ".join("%+.1f" % s[int(k * (len(s) - 1) / (n - 1))] for k in range(n))


def main():
    man = load_manifest()
    tones = {}
    ok = fail = 0
    for tid, mark, src, mode in SPECS:
        word = src if isinstance(src, tuple) else None
        text = word[0] if word else src
        p = source_path(text, man)
        x, sr = read_mono(p)
        if word and word[1] == 1:
            x = cut_first_syllable(x, sr)
        x = trim_onset(x, sr, mode)
        x = pad(x, sr)
        out = os.path.join(OUT, tid + ".mp3")
        write_mp3(out, x, sr)
        tones[mark] = "tone/%s.mp3" % tid
        dur = len(x) / sr
        print("%s  %-3s 来源 %-3s %.2fs  %6dB  %s"
              % (tid, mark, text[:2], dur, os.path.getsize(out),
                 contour(out)))
        ok += 1
    man["tones"] = tones
    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(man, f, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(AUDIO, "manifest.js"), "w", encoding="utf-8", newline="\n") as f:
        f.write("window.__SHIZI_AUDIO__=")
        json.dump(man, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")
    print("完成：%d 条四声音，失败 %d" % (ok, fail))


if __name__ == "__main__":
    main()
