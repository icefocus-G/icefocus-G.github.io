#!/usr/bin/env python3
"""生成 iPad 用的 Web Clip 描述文件（.mobileconfig）。

装了这个描述文件之后，主屏会生成一个「工具箱」图标，点开就是全屏网页，
没有 Safari 地址栏 —— 这是不越狱、不用 Mac 的前提下，iPad 上最接近
"安装原生 App" 的做法。

    python build-webclip.py

改名称 / 地址 / 图标就改下面几个常量。
"""

import base64
import plistlib
import uuid
import pathlib

# ---- 要改的东西 ----
LABEL = "工具箱"                      # 主屏上显示的名字
URL = "https://icefocus.cn/app/"      # 点开图标后打开的地址
ICON = "icon-192.png"                 # 图标（正方形 PNG）
ORG = "icefocus"
DESC = "在主屏幕上添加「工具箱」图标，点开即全屏打开工具中心。"

OUT = "toolbox.mobileconfig"
# -------------------

here = pathlib.Path(__file__).resolve().parent
icon_bytes = (here / ICON).read_bytes()

webclip = {
    "PayloadType": "com.apple.webClip.managed",
    "PayloadIdentifier": "cn.icefocus.toolbox.webclip",
    "PayloadUUID": str(uuid.uuid4()).upper(),
    "PayloadVersion": 1,
    "PayloadDisplayName": LABEL,
    "Label": LABEL,
    "URL": URL,
    "Icon": icon_bytes,
    "FullScreen": True,
    "IsRemovable": True,
    "IgnoreManifest": False,   # 让它是用我们自己的 manifest.webmanifest
}

profile = {
    "PayloadType": "Configuration",
    "PayloadIdentifier": "cn.icefocus.toolbox",
    "PayloadUUID": str(uuid.uuid4()).upper(),
    "PayloadVersion": 1,
    "PayloadDisplayName": f"{LABEL} · 主屏图标",
    "PayloadDescription": DESC,
    "PayloadOrganization": ORG,
    "PayloadRemovalDisallowed": False,
    "PayloadContent": [webclip],
}

raw = plistlib.dumps(profile, fmt=plistlib.FMT_XML)
(here / OUT).write_bytes(raw)

print(f"{OUT}  {len(raw)} 字节")
print(f"  名称 {LABEL}")
print(f"  地址 {URL}")
print(f"  图标 {ICON} ({len(icon_bytes)} 字节)")
