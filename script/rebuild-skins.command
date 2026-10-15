#!/bin/bash
# 双击执行：扫描 ThemedSkin/ 里的首页皮肤，自动重建清单。
# 新增 / 删除皮肤文件后跑一次即可（文件名任意，不需要改代码）。

cd "$(dirname "$0")/.." || exit 1

NODE_BIN="/Users/icefocus/.workbuddy/binaries/node/versions/22.12.0/bin/node"
if [ ! -x "$NODE_BIN" ]; then NODE_BIN="$(command -v node)"; fi

if [ -z "$NODE_BIN" ]; then
  echo "没有找到 Node.js，请先安装 Node 后重试。"
  read -r -p "按回车关闭…"
  exit 1
fi

"$NODE_BIN" "script/rebuild-skins.js"
echo ""
read -r -p "按回车关闭…"
