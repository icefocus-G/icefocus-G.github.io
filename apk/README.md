# APK · Learning Course 安卓安装包

## 是什么

一个极薄的原生壳：WebView + 一个只监听 `127.0.0.1` 的微型 HTTP 服务，
把 `assets/www`（即整个站点）当成小型站点根提供出来。

**为什么不让 WebView 直接 file:// 打开页面：**
file:// 源下 localStorage 与同源策略会被打残，iframe 之间读不到同一份存档，
GitHub 同步也就无从谈起。走 `http://127.0.0.1` 之后：

- localStorage / iframe / fetch 全部按标准行为工作；
- 完全离线 —— 断网也能做题，联网后自动同步；
- NFS 凭证（GitHub Token）存在 WebView 自己的 storage 里，不进也不出。

## 怎么用现成果

根目录 `LearningCourse-<日期>.apk`（约 470KB，minSdk 24 / Android 7.0+）：
传到手机点开即可，安装时选「允许未知来源」。首次安装后：

1. 打开 App → 随机展示一套首页皮肤；
2. 进 Learning Course → 国际金融 00076；
3. 右上角 ☁ 云同步 → 粘贴一次 GitHub Token（`repo` 权限）；
4. 之后答题、判分、错题本、笔记在网页 / 手机浏览器 / App 之间自动互通。

## 重新打包

```bash
cd apk && ./build.sh           # 产出 ./LearningCourse-<日期>.apk
```

首次运行会下载 JDK 17 与 Android 命令行工具到 `~/.cache/if-apk-tools`（约 350MB），
之后再构建只需几十秒。**改完网页内容后直接重跑即可**，站点资源会被重新打包进去。

签名 keystore 也在 `~/.cache/if-apk-tools/if.keystore`（密码 `ifpass`），
换 keystore 会导致无法覆盖安装，需要卸载旧版。

## 结构

```
apk/
  AndroidManifest.xml                 权限 / Activity / 图标
  java/com/icefocus/learningcourse/
    MainActivity.java                 WebView 配置、返回键、外链处理
    LocalServer.java                  微型静态服务（把 assets/www 当站点根）
  res/drawable/ic_launcher.xml        矢量图标
  build.sh                            一键打包
```

包名：`com.icefocus.learningcourse`，应用名：`Learning Course`。
