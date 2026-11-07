# -*- coding: utf-8 -*-
"""生成「学拼读」卡片上那些音标的纯音素录音。

问题背景：卡片写的是 /æ/，旧逻辑却播放整词 cat(/kæt/)，听起来当然是错的。
这里用 Cambridge Dictionary 帮助页里的英式音素示范录音
（uk_phonetics_sound_*，只念那一个音，不念例词），裁掉前后静音后
导出成 48kHz 单声道 WAV。

    python tools/build-phonemes.py

产物：
    data/audio/phon/<unicode 码位>.wav
    文件名由 IPA 字符串本身算出，前端用同一个规则拼路径，不用维护清单。

/juː/ 和 /kw/ 是两个音素连起来的，Cambridge 没有现成录音，
用 /j/+/uː/、/k/+/w/ 拼起来。
"""
import concurrent.futures
import json
import os
import re
import sys
import urllib.request

import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CACHE = os.path.join(HERE, ".cache")
RAW = os.path.join(CACHE, "cam-uk")
OUT = os.path.join(ROOT, "data", "audio", "phon")
CAM = "https://dictionary.cambridge.org"
PAGE = CAM + "/help/phonetics.html"
UA = {"User-Agent": "Mozilla/5.0"}

# 卡片上出现过的所有音标（PH_SECTIONS），外加两个复合音的零件
TARGET = [
    "æ", "e", "ɪ", "ɒ", "ʌ",                       # 短元音
    "eɪ", "aɪ", "əʊ", "juː",                       # 魔法 e
    "ʃ", "tʃ", "θ", "ð", "w", "f", "k", "ŋ", "kw",  # 辅音组合
    "iː", "aʊ", "uː", "ʊ", "ɔɪ", "ɑː", "ɔː",
    "ə", "ɜː", "ɪə", "eə",                          # 元音组合
]
COMPOUND = {"juː": ["j", "uː"], "kw": ["k", "w"]}
PARTS = sorted(set(sum(COMPOUND.values(), [])))


def code(ipa):
    """IPA → ASCII 文件名（每个字符的 Unicode 码位）"""
    return "-".join("%04x" % ord(c) for c in ipa)


def fetch(url, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 800:
        return dest
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=40) as r, open(dest, "wb") as f:
        f.write(r.read())
    return dest


def get_page():
    os.makedirs(CACHE, exist_ok=True)
    p = os.path.join(CACHE, "cambridge.html")
    if os.path.exists(p) and os.path.getsize(p) > 10000:
        return open(p, encoding="utf-8", errors="ignore").read()
    fetch(PAGE, p)
    return open(p, encoding="utf-8", errors="ignore").read()


def parse_map(html):
    rows = re.findall(
        r'<td class="ipa-sound[^"]*">\s*([^<]+?)\s*</td>(.*?)(?=<td class="ipa-sound|</tbody>)',
        html, re.S)
    out = {}
    for ipa, body in rows:
        m = re.search(r'(/media/english/uk_phonetic/uk_phonetics_sound_[^?"\' ]+\.mp3)', body)
        if m:
            out[ipa.strip()] = m.group(1)
    return out


def trim(x, sr):
    """裁掉前后静音，留一点气口，两端做淡入淡出"""
    x = np.asarray(x, dtype=np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    win = int(sr * 0.02)
    hop = win // 2
    n = max(1, (len(x) - win) // hop)
    rms = np.sqrt(np.mean(np.lib.stride_tricks.sliding_window_view(x, win)[::hop][:n] ** 2, axis=1))
    peak = float(rms.max()) if len(rms) else 0.0
    if peak <= 0:
        return x.astype(np.float32)
    idx = np.flatnonzero(rms > peak * 0.07)
    if not len(idx):
        return x.astype(np.float32)
    a = max(0, int(idx[0] * hop) - int(sr * 0.045))
    b = min(len(x), int(idx[-1] * hop) + win + int(sr * 0.06))
    y = x[a:b].copy()
    fade = min(int(sr * 0.018), len(y) // 4)
    if fade > 0:
        y[:fade] *= np.linspace(0, 1, fade)
        y[-fade:] *= np.linspace(1, 0, fade)
    # 归一化到 -1dB 左右，元音和摩擦音听起来音量一致
    m = float(np.abs(y).max())
    if m > 0:
        y *= min(0.89 / m, 3.0)
    return y.astype(np.float32)


def main():
    os.makedirs(RAW, exist_ok=True)
    os.makedirs(OUT, exist_ok=True)
    mp = parse_map(get_page())
    need = sorted(set(TARGET + PARTS) - set(COMPOUND))
    missing = [s for s in need if s not in mp]
    if missing:
        sys.exit("Cambridge 音素表里没有：%s" % missing)

    def download(s):
        url = CAM + mp[s]
        dest = os.path.join(RAW, "ipa-" + code(s) + ".mp3")
        return s, fetch(url, dest)

    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
        raw = dict(ex.map(download, need))

    clips = {}
    for s in need:
        x, sr = sf.read(raw[s])
        clips[s] = (trim(x, sr), sr)

    for s in sorted(set(TARGET)):
        if s in COMPOUND:
            parts = clips[COMPOUND[s][0]][0]
            for p in COMPOUND[s][1:]:
                parts = np.concatenate([parts, np.zeros(int(sr * 0.012), np.float32), clips[p][0]])
            y, sr = parts, clips[COMPOUND[s][0]][1]
        else:
            y, sr = clips[s]
        dest = os.path.join(OUT, code(s) + ".wav")
        sf.write(dest, y, sr, subtype="PCM_16")
        print("  /%-4s/  %-24s %5.2fs -> %5.2fs" %
              (s, os.path.basename(dest), len(x) / sr, len(y) / sr))

    # 顺手写一份可供核对的清单（前端不用它，纯留档）
    with open(os.path.join(OUT, "index.json"), "w", encoding="utf-8") as f:
        json.dump({"/" + s + "/": code(s) + ".wav" for s in TARGET},
                  f, ensure_ascii=False, indent=1)
    print("完成：%d 个音素 → %s" % (len(TARGET), os.path.relpath(OUT, ROOT)))


if __name__ == "__main__":
    main()
