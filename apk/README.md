# APK · Learning Course（套壳版 v2）

## 是什么

一个**极薄的 WebView 壳**：APK 里**不含任何网站资源**，打开后直接加载 GitHub Pages 上的在线站点。

```
app 启动 → WebView 打开 https://icefocus-G.github.io/examination/  →  就这么简单
```

所以：

- **改网页不用重新打包** —— 推上 GitHub，手机上刷新就能看到；
- **APK 只有 33 KB**（旧的内嵌版是 468 KB），因为包里只有 4 个东西：Manifest、图标、resources.arsc、classes.dex；
- 加课程、改题库、改文案，全都自动生效。

代价是**需要联网**（旧版能离线做题）。断网时 App 会显示一个「连不上网络 / 重新加载」的页面。

## 和旧版的区别

| | 旧版 `LearningCourse-20261015.apk` | 新版 `LearningCourse-Shell-20261015.apk` |
|---|---|---|
| 站点资源 | 打进 `assets/www`，写死 | 不打包，实时从 GitHub 读 |
| 本地服务 | 起一个 `127.0.0.1` 微型 HTTP 服务 | 不用，直接访问 `https://` |
| 体积 | 468 KB | **33 KB** |
| 离线 | 可以 | 不行（需联网） |
| 改网页后 | 必须重新打包 | 推上去就生效 |
| 落地页 | 写死「国际金融」 | **可远程改**（见下） |
| localStorage | 端口随机，跨启动可能丢 | 固定源，稳定持久 |

## 换入口地址（不用重新打包）

编辑仓库里的 `apk/config.json`：

```json
{ "home": "https://icefocus-G.github.io/examination/" }
```

App 每次启动会在后台拉一次这个文件；`home` 变了就存下来，**下次启动生效**。
想改成直接进某门课：

```json
{ "home": "https://icefocus-G.github.io/examination/Western Economics/study.html" }
```

拉不到 / 格式不对 / 不是 https，一律回落到内置兜底地址，不会白屏。

## 装到手机

1. 把 `software/LearningCourse-Shell-20261015.apk` 传到手机，点开安装；
2. 系统会提示「未知来源」→ 允许；
3. **手机上装过旧版的话，必须先卸载旧版** —— 签名密钥换了（旧 keystore 只在打包那台机器上），
   不卸载会提示「应用未安装」。卸载不丢东西：新版是另一个源，本来就要重新填一次 Token。
4. 打开 App → 课程中心 → 选课程；
5. 右上角「☁ 云同步」→ 粘贴一次 GitHub Token（Fine-grained，只授权这一个仓库，
   权限只勾 `Contents: Read and write`）。填一次就永久有效。

> 想让 APK 自带凭据、装完免填：把 Token 存成 `apk/.token` 再跑 `./build.sh`，
> 它会写进 `assets/token.txt`，运行时注入。**该文件不要提交到仓库。**

## 功能

- 返回键：WebView 前进后退，连按两次退出
- 顶部 3dp 加载进度条
- 双指缩放
- `<input type="file">`（站点里的「导入数据文件」）→ 系统文件选择器
- 导出 JSON / TXT / CSV（`blob:`）→ 存进手机「下载」目录
  - Android 10+ 走 MediaStore，不需要任何权限
  - Android 9 及以下走公共下载目录，需要存储权限（Manifest 里已声明 `maxSdkVersion=28`）
- 站外链接（GitHub Token 页面等）→ 交给系统浏览器打开，登录体验更好
- 切到后台时自动让同步引擎补交一次，避免刚做完的题没上传

## 重新打包

```bash
cd apk && ./build.sh
```

脚本会自动在常见位置找 JDK 与 Android SDK；找不到就指定：

```bash
IF_JDK=/path/to/jdk17  IF_SDK=/path/to/android-sdk  ./build.sh
```

产出 `apk/LearningCourse-Shell-<日期>.apk`，并同步一份到 `software/`。

签名 keystore 在 `~/.cache/if-apk-tools/if.keystore`（密码 `ifpass`，别名 `ifkey`）。
**换机器打包会生成新 keystore，届时需要先卸载旧版再装。**

## 结构

```
apk/
  AndroidManifest.xml                 权限 / Activity / 图标（versionCode 2）
  config.json                         远程入口配置（部署到 /apk/config.json）
  java/com/icefocus/learningcourse/
    MainActivity.java                 WebView 壳：导航路由、文件选择、blob 下载、入口配置、令牌注入
  res/drawable/ic_launcher.xml        矢量图标
  build.sh                            一键打包
  .token                              （可选，不入库）内置同步凭据
```

包名 `com.icefocus.learningcourse`，应用名 `Learning Course`，minSdk 24（Android 7.0+），targetSdk 36。

## 注意

**不要在 WebView 里设置 `IF::apk` / `window.__IF_APK__`。**
旧的内嵌版把目录名去掉了空格（`International Finance` → `InternationalFinance`），
站点里的 `isAPK()` 据此改写链接。套壳版访问的是 GitHub 上的**原名目录（带空格）**，
所以这里一个标记都不写，站点完全按网页端逻辑跑 —— 一行网页代码都不用改。
