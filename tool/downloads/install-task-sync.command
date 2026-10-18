#!/bin/bash
# WorkBuddy 任务同步 · macOS / Linux 一键安装
#
# 用法：下载后直接双击运行（macOS）。若系统提示「无法打开」，右键 → 打开。
# 它会在 ~/.wb-task-sync 装好采集器并注册开机自启，之后网页打开即自动同步。

cd "$HOME" || exit 1

# 有些人的 shell 里 export 了 http_proxy（Clash / V2Ray），会让本机 127.0.0.1 的
# 健康检查被丢给代理，这里先排除掉，避免误报「服务没起来」。
export no_proxy="127.0.0.1,localhost,::1${no_proxy:+,$no_proxy}"
export NO_PROXY="$no_proxy"

SITE="https://wb-task-sync.app.workbuddy.host"
PORT="${WB_SYNC_PORT:-8787}"
LOG="$HOME/wb-install-last.log"

# 全程留一份日志，出问题直接把 ~/wb-install-last.log 发出来就能定位
exec > >(tee "$LOG") 2>&1

clear
echo "=================================="
echo " WorkBuddy 任务同步 · 一键安装"
echo "=================================="
echo

if ! command -v node >/dev/null 2>&1; then
  echo "❌ 没找到 node。先装 Node 18+：https://nodejs.org"
  echo
  read -n 1 -s -r -p "按任意键关闭…"
  exit 1
fi

TMP="$(mktemp -t wb-install)"
if ! curl -fsSL "$SITE/collector/install.txt" -o "$TMP"; then
  echo "❌ 下载安装脚本失败，检查网络后重试"
  rm -f "$TMP"
  echo
  read -n 1 -s -r -p "按任意键关闭…"
  exit 1
fi

bash "$TMP"
RC=$?
rm -f "$TMP"

echo
echo "----------------------------------"
if [ "$RC" -ne 0 ]; then
  echo "❌ 安装没有完全成功（退出码 $RC），把上面的报错或 $LOG 发出来。"
else
  # 再确认一次：自启注册上了吗、端口通不通
  if launchctl print "gui/$(id -u)/dev.workbuddy.tasksync" >/dev/null 2>&1; then
    echo "✅ 开机自启已注册（长期后台运行，关掉窗口也不停）"
  else
    echo "⚠️  开机自启这次没注册上，但采集器已经在跑，本次可以正常同步。"
    echo "    重启电脑后如果又连不上，再双击本文件一次。"
  fi
  if curl -fsS -m 3 --noproxy '*' "http://127.0.0.1:$PORT/health" >/dev/null 2>&1; then
    echo "✅ 本机桥已就绪：http://127.0.0.1:$PORT"
    echo
    echo "现在回到网页，点「同步」或直接刷新页面即可上传本机任务。"
  else
    echo "⚠️  端口 $PORT 暂时没通，可能被别的程序占了。"
    echo "    换端口重装：先执行 bash install.txt --port 8790"
  fi
fi
echo "----------------------------------"
echo
read -n 1 -s -r -p "按任意键关闭…"
echo
