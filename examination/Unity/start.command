#!/bin/zsh
# Unity 交互课件 · 一键启动（站点 + C# 真实运行器）
cd "$(dirname "$0")" || exit 1
PORT=7788
NODE_BIN=$(command -v node)
if [ -z "$NODE_BIN" ]; then
  echo "未找到 node。请先安装 Node.js 18+，或改用：python3 -m http.server 7788（仅能浏览，不能真实运行 C#）"
  read -r -n 1
  exit 1
fi
if lsof -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  echo "服务已在运行：http://localhost:$PORT/"
  open "http://localhost:$PORT/"
  exit 0
fi
( sleep 1.2; open "http://localhost:$PORT/" ) &
exec "$NODE_BIN" runner.js $PORT
