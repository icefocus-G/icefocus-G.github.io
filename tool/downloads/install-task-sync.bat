@echo off
chcp 65001 >nul
REM WorkBuddy 任务同步 · Windows 一键安装
REM
REM 用法：下载后直接双击运行。它会在 %USERPROFILE%\.wb-task-sync 装好采集器
REM 并注册开机自启（计划任务），之后网页打开即自动同步本机任务。
REM
REM 需要管理员权限吗：不需要 —— 装在用户目录、注册的是当前用户的计划任务。

setlocal

echo ==================================
echo  WorkBuddy 任务同步 . Windows 一键安装
echo ==================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [X] 没找到 node。先装 Node 18+：https://nodejs.org
  echo.
  pause
  exit /b 1
)

echo 正在下载并安装采集器，请稍候...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ProgressPreference='SilentlyContinue'; iwr https://wb-task-sync.app.workbuddy.host/collector/install.ps1 -UseBasicParsing | iex"

if errorlevel 1 (
  echo.
  echo [X] 安装失败。上面是完整报错，把窗口内容截图发出来即可。
) else (
  echo.
  echo [OK] 安装完成。回到网页刷新即可看到本机任务。
)

echo.
pause
