# -*- coding: utf-8 -*-
"""在桌面创建「数学卡片」快捷方式（.lnk）。

为什么指向 chrome.exe 而不是 index.html：
  本机 .html 的 UserChoice 指向了不存在的 ProgId（MSEdgeHTMNameX），
  双击 html 会弹「选择打开方式」。直接调 Chrome 的 --app 模式可绕过，
  而且没有地址栏 / 标签栏，像一个独立应用。
  如果哪天 Chrome 被卸载，用 M:\\数学应用\\启动.bat 也能打开。

用法：
  python tools/make_shortcut.py            # 桌面（默认口算表）
  python tools/make_shortcut.py --all      # 桌面 + 四个常用入口
"""
import hashlib
import os
import sys

import pylnk3

DESK = os.path.join(os.path.expanduser("~"), "OneDrive", "Desktop")
if not os.path.isdir(DESK):
    DESK = os.path.join(os.path.expanduser("~"), "Desktop")

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
ICON = os.path.join(APP, "assets", "math.ico")

# Windows 只认真实写进 .lnk 的字节，路径里有中文要按 UTF-8 百分号编码
APP_URL = "file:///" + APP.replace("\\", "/")


def make(name, query=""):
    url = APP_URL + "/index.html" + (("?" + query) if query else "")
    lnk = os.path.join(DESK, name + ".lnk")
    if os.path.exists(lnk):
        os.remove(lnk)
    pylnk3.for_file(
        CHROME,
        lnk_name=lnk,
        arguments='--app="%s"' % url,
        description="数学卡片 · 人教版 1~6 年级口算 / 知识点 / 应用题",
        icon_file=ICON,
        icon_index=0,
        work_dir=APP,
        window_mode=pylnk3.WINDOW_NORMAL,
    )
    with open(lnk, "rb") as f:
        chk = pylnk3.Lnk(f)
    print("已创建:", lnk, os.path.getsize(lnk), "bytes")
    print("  target  :", chk.path)
    print("  args    :", chk.arguments)
    print("  icon    :", chk.icon)


def main():
    assert os.path.isfile(CHROME), "Chrome 不存在: " + CHROME
    assert os.path.isfile(os.path.join(APP, "index.html")), "应用不存在"
    if not os.path.isfile(ICON):
        print("图标还没生成，先跑 python tools/make_icon.py")

    make("数学卡片")
    if "--all" in sys.argv:
        make("数学卡片-知识点", "view=know")
        make("数学卡片-应用题", "view=apply")
        make("数学卡片-学计算", "view=calc")
        make("数学卡片-加题", "view=add")


if __name__ == "__main__":
    main()
