# -*- coding: utf-8 -*-
"""在桌面创建「英语卡片」快捷方式（.lnk）。

为什么指向 chrome.exe 而不是 index.html：
  这台机器上 .html 的 UserChoice 指向了不存在的 ProgId（MSEdgeHTMNameX），
  双击 html 会弹「选择打开方式」。直接调 Chrome 的 --app 模式可绕过，
  而且没有地址栏 / 标签栏，像一个独立应用。
  Chrome 哪天被卸载，用 M:\\英语应用\\启动.bat 也能打开。

    python tools/make_shortcut.py
"""
import os
import urllib.parse

import pylnk3

DESK = os.path.join(os.path.expanduser("~"), "OneDrive", "Desktop")
if not os.path.isdir(DESK):
    DESK = os.path.join(os.path.expanduser("~"), "Desktop")

APP = r"M:\英语应用"
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
url = "file:///" + "M:/" + urllib.parse.quote("英语应用") + "/index.html"

assert os.path.isfile(CHROME), "Chrome 不存在: " + CHROME
assert os.path.isfile(os.path.join(APP, "index.html")), "应用不存在"

lnk = os.path.join(DESK, "英语卡片.lnk")
if os.path.exists(lnk):
    os.remove(lnk)

pylnk3.for_file(
    CHROME,
    lnk_name=lnk,
    arguments='--app="%s"' % url,
    description="英语卡片 · A4 打印版（单词表 / 短语表）",
    icon_file=os.path.join(APP, "assets", "en.ico"),
    icon_index=0,
    work_dir=APP,
    window_mode=pylnk3.WINDOW_NORMAL,
)

print("已创建:", lnk, os.path.getsize(lnk), "bytes")
with open(lnk, "rb") as f:
    chk = pylnk3.Lnk(f)
print("  target  :", chk.path)
print("  args    :", chk.arguments)
print("  work_dir:", chk.work_dir)
print("  icon    :", chk.icon)
