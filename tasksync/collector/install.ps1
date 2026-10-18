# WorkBuddy 任务同步 —— 一键安装采集器（Windows）
#
#   powershell -ExecutionPolicy Bypass -File install.ps1
#   powershell -ExecutionPolicy Bypass -File install.ps1 -Port 8790
#   powershell -ExecutionPolicy Bypass -File install.ps1 -Uninstall
#   powershell -ExecutionPolicy Bypass -File install.ps1 -NoService   # 只下载
#
# 装到 %USERPROFILE%\.wb-task-sync，注册「登录时启动」的计划任务。

param(
  [switch]$Uninstall,
  [switch]$NoService,
  [int]$Port = 8787,
  [string]$BaseUrl = "https://wb-task-sync.app.workbuddy.host"
)

$ErrorActionPreference = "Stop"
$Dir        = Join-Path $env:USERPROFILE ".wb-task-sync"
$LogDir     = Join-Path $Dir "logs"
$TaskName   = "WorkBuddyTaskSync"
$Runner     = Join-Path $Dir "run.ps1"

function Info($m) { Write-Host "  $m" }
function Ok($m)   { Write-Host "  [OK] $m" -ForegroundColor Green }
function Warn($m) { Write-Host "  [!]  $m" -ForegroundColor Yellow }
function Die($m)  { Write-Host "  [X]  $m" -ForegroundColor Red; exit 1 }

Write-Host "WorkBuddy 任务同步 · 采集器安装（Windows）"
Write-Host ""

# ------------------------------------------------------------------ 卸载
if ($Uninstall) {
  Write-Host "卸载中"
  $t = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
  if ($t) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Ok "已移除计划任务 $TaskName"
  }
  Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like "*$Dir*collect.js*" } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  if (Test-Path $Dir) { Remove-Item -Recurse -Force $Dir; Ok "已删除 $Dir" }
  Write-Host "完成。看板不再能读取本机任务。"
  exit 0
}

# ------------------------------------------------------------------ 前置检查
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) { Die "没找到 node。先装 Node 18+：https://nodejs.org" }
$NodeExe = $nodeCmd.Source
$ver = (& $NodeExe -p "process.versions.node")
$major = [int]($ver.Split(".")[0])
if ($major -lt 18) { Die "Node 版本过低（当前 $ver），需要 18 或更高" }
Info "Node: $NodeExe (v$ver)"

$wbHome = Join-Path $env:USERPROFILE ".workbuddy"
if (-not (Test-Path $wbHome)) {
  Warn "没找到 $wbHome —— 这台机器上可能还没用过 WorkBuddy，装了也读不到任务"
}
$sqlite = Get-Command sqlite3 -ErrorAction SilentlyContinue
if (-not $sqlite) {
  Warn "没找到 sqlite3：会话标题会显示成「会话 xxxxxxxx」，任务也归不到 WorkBuddy 账号"
  Warn "  可装：winget install SQLite.SQLite   （或从 sqlite.org 下载 tools 包）"
}

# ------------------------------------------------------------------ 下载
New-Item -ItemType Directory -Force -Path $Dir, $LogDir | Out-Null
Info "下载到 $Dir"
try {
  Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl/collector/collect.js" -OutFile (Join-Path $Dir "collect.js")
  try { Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl/collector/import.js" -OutFile (Join-Path $Dir "import.js") } catch { }
} catch {
  Die "下载失败：$($_.Exception.Message)"
}

# 自检：这份文件在这台机器上真能跑
$selftest = Join-Path $Dir ".selftest.json"
$stErr = Join-Path $Dir ".selftest.err"
& $NodeExe (Join-Path $Dir "collect.js") --json 1> $selftest 2> $stErr
if ($LASTEXITCODE -ne 0) {
  Warn "自检失败："
  if (Test-Path $stErr) { Get-Content $stErr | Select-Object -First 10 | ForEach-Object { Write-Host "     $_" } }
  Die "采集器在这台机器上跑不起来，已中止（未注册自启）"
}
$count = 0
try { $count = (Get-Content $selftest -Raw | ConvertFrom-Json).tasks.Count } catch { $count = 0 }
Remove-Item $selftest, $stErr -Force -ErrorAction SilentlyContinue
Ok "自检通过：读到 $count 个任务"

if ($NoService) {
  Write-Host ""
  Write-Host "已下载，未注册自启。手动启动："
  Write-Host "  `"$NodeExe`" `"$Dir\collect.js`" --serve --port $Port"
  exit 0
}

# ------------------------------------------------------------------ 启动器
$runnerBody = @"
Set-Location -LiteralPath '$Dir'
`$ErrorActionPreference = 'Continue'
& '$NodeExe' '$Dir\collect.js' --serve --port $Port *>> '$LogDir\collector.log'
"@
Set-Content -Path $Runner -Value $runnerBody -Encoding UTF8

# ------------------------------------------------------------------ 注册「登录时启动」
$action  = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$Runner`""
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$set     = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero)

try {
  Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $set -Force | Out-Null
  Ok "已注册计划任务 $TaskName（登录时自动启动）"
} catch {
  Warn "注册计划任务失败：$($_.Exception.Message)"
  Warn "  常见原因：没有权限或组策略限制。可以改用「启动」文件夹的快捷方式。"
}

# ------------------------------------------------------------------ 现在就起一个
$already = $false
try {
  $r = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/health" -TimeoutSec 2
  if ($r.StatusCode -eq 200) { $already = $true }
} catch { }

if (-not $already) {
  Info "拉起采集器…"
  Start-Process -FilePath $NodeExe `
    -ArgumentList @("`"$Dir\collect.js`"", "--serve", "--port", "$Port") `
    -WorkingDirectory $Dir -WindowStyle Hidden
}

# ------------------------------------------------------------------ 验证
$ready = $false
for ($i = 0; $i -lt 10; $i++) {
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/health" -TimeoutSec 2
    if ($r.StatusCode -eq 200) { $ready = $true; break }
  } catch { Start-Sleep -Seconds 1 }
}

Write-Host ""
if ($ready) {
  Ok "采集器已就绪：http://127.0.0.1:$Port"
  Write-Host ""
  Write-Host "现在打开看板 -> 左下角「同步本机任务」->「从本机同步」："
  Write-Host "  https://wb-task-sync.app.workbuddy.host/"
  Write-Host ""
  Write-Host "换端口：powershell -ExecutionPolicy Bypass -File install.ps1 -Port 8790"
  Write-Host "卸载：  powershell -ExecutionPolicy Bypass -File install.ps1 -Uninstall"
} else {
  Warn "服务没在 10 秒内起来"
  $log = Join-Path $LogDir "collector.log"
  if (Test-Path $log) {
    Info "日志末尾："
    Get-Content $log -Tail 12 | ForEach-Object { Write-Host "     $_" }
  } else {
    Info "日志是空的 —— 进程还没被拉起来，先手动试："
    Info "  `"$NodeExe`" `"$Dir\collect.js`" --serve --port $Port"
  }
  exit 1
}
