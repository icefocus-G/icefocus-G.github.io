#!/bin/bash
# Learning Course · APK 一键打包（不依赖 Android Studio / Gradle）
#
#   用法：在本目录执行   ./build.sh
#   首次运行会自动下载 JDK 17 与 Android 命令行工具（约 350MB）到 ~/.cache/if-apk-tools，
#   之后每次构建只需几十秒。产出文件：本目录下的 LearningCourse-<日期>.apk
#
#   改完网页内容后直接重跑本脚本即可，站点资源会被重新打进 APK。

set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"                       # 站点根目录
TOOLS="${IF_APK_TOOLS:-$HOME/.cache/if-apk-tools}"
MIN_SDK=24
TARGET_SDK=34

mkdir -p "$TOOLS"
JDK_DIR="$(find "$TOOLS" -maxdepth 3 -type d -name Home -path '*/Contents/*' 2>/dev/null | head -1)"
ANDROID_SDK="$TOOLS/sdk"

# ---------- 0. 准备 JDK ----------
if [ -z "$JDK_DIR" ] || [ ! -x "$JDK_DIR/bin/javac" ]; then
  echo "== 下载 OpenJDK 17 =="
  cd "$TOOLS"
  curl -L -m 1800 -o jdk17.tar.gz \
    "https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_macos-aarch64_bin.tar.gz"
  tar -xzf jdk17.tar.gz
  JDK_DIR="$(find "$TOOLS" -maxdepth 3 -type d -name Home -path '*/Contents/*' 2>/dev/null | head -1)"
fi
export JAVA_HOME="$JDK_DIR"
export PATH="$JAVA_HOME/bin:$PATH"
echo "   JAVA_HOME = $JAVA_HOME"

# ---------- 1. 准备 Android SDK ----------
if [ ! -d "$ANDROID_SDK/build-tools/34.0.0" ] || [ ! -d "$ANDROID_SDK/platforms/android-$TARGET_SDK" ]; then
  echo "== 下载 Android 命令行工具 =="
  cd "$TOOLS"
  if [ ! -d cmdline-tools ]; then
    curl -L -m 1800 -o cmdtools.zip \
      "https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip"
    unzip -q -o cmdtools.zip
  fi
  mkdir -p "$ANDROID_SDK/cmdline-tools/latest"
  cp -R cmdline-tools/bin cmdline-tools/lib "$ANDROID_SDK/cmdline-tools/latest/"
  chmod +x "$ANDROID_SDK/cmdline-tools/latest/bin/"*
  echo "== 安装 platform / build-tools =="
  yes 2>/dev/null | "$ANDROID_SDK/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$ANDROID_SDK" --licenses >/dev/null 2>&1 || true
  yes 2>/dev/null | "$ANDROID_SDK/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$ANDROID_SDK" \
      "platform-tools" "platforms;android-$TARGET_SDK" "build-tools;34.0.0" >/dev/null
fi
AJ="$ANDROID_SDK/platforms/android-$TARGET_SDK/android.jar"
BT="$ANDROID_SDK/build-tools/34.0.0"
export PATH="$BT:$PATH"
echo "   ANDROID_SDK = $ANDROID_SDK"

BUILD="$HERE/.build"
rm -rf "$BUILD"; mkdir -p "$BUILD/obj" "$BUILD/assets/www"

# ---------- 2. 站点资源 → assets/www ----------
echo "== 打包站点资源（只装课程与子页面，首页皮肤不进包） =="
cd "$ROOT"
find . -type f \
  ! -name '.DS_Store' ! -name '._*' ! -path './.git/*' ! -path './apk/*' \
  ! -path './ThemedSkin/*' ! -path './index.html' \
  -print0 | while IFS= read -r -d '' f; do
    mkdir -p "$BUILD/assets/www/$(dirname "${f#./}")"
    cp -p "$f" "$BUILD/assets/www/${f#./}"
  done
# 拷贝到外置盘（exFAT）时，macOS 会给每个文件再生成一个 ._xxx 的 AppleDouble 副本，
# 打包前必须清掉，否则这些垃圾会一起进 APK。
find "$BUILD/assets/www" \( -name '._*' -o -name '.DS_Store' \) -delete 2>/dev/null || true

# 目录名里的空格在 assets / URL 里一路都是麻烦（%20、AssetManager 列举都可能踩坑），
# 打包时统一压成无空格形式：International Finance → InternationalFinance。
# 层级深度不变，页面里的 ../../data、../../script 等相对路径照旧成立。
W="$BUILD/assets/www"
[ -d "$W/examination/International Finance" ] && mv "$W/examination/International Finance" "$W/examination/InternationalFinance"
[ -d "$W/examination/Western Economics" ]     && mv "$W/examination/Western Economics"     "$W/examination/WesternEconomics"

# 包里也放一个根 index.html：兜住页面上的「返回首页」，直接送进课程内页，
# 避免出现 404 白屏（APK 里不打首页皮肤）。
cat > "$W/index.html" <<'HTML'
<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">
<title>Learning Course</title>
<meta http-equiv="refresh" content="0; url=examination/InternationalFinance/study.html">
</head><body style="font:14px -apple-system,sans-serif;padding:24px">
<script>location.replace('examination/InternationalFinance/study.html');</script>
正在打开「国际金融 00076」…
</body></html>
HTML

echo "   资源文件数：$(find "$BUILD/assets/www" -type f | wc -l | tr -d ' ')"

# ---------- 3. 编译 ----------
echo "== javac =="
"$JAVA_HOME/bin/javac" -encoding UTF-8 -source 17 -target 17 -nowarn \
  -classpath "$AJ" -d "$BUILD/obj" $(find "$HERE/java" -name '*.java' ! -name '._*')

echo "== d8 =="
# 注意：外置盘上会立刻生成 ._xxx.class 这类 AppleDouble 副本，
#       不加 ! -name '._*' 的话 d8 会报 "Invalid classfile header"。
"$BT/d8" --lib "$AJ" --min-api $MIN_SDK --output "$BUILD" $(find "$BUILD/obj" -name '*.class' ! -name '._*')

echo "== aapt2 =="
"$BT/aapt2" compile --dir "$HERE/res" -o "$BUILD/flats.zip"
"$BT/aapt2" link -I "$AJ" --manifest "$HERE/AndroidManifest.xml" \
  -A "$BUILD/assets" --min-sdk-version $MIN_SDK --target-sdk-version $TARGET_SDK \
  --auto-add-overlay -o "$BUILD/app.raw.apk" "$BUILD/flats.zip"

cp "$BUILD/app.raw.apk" "$BUILD/app.dex.apk"
(cd "$BUILD" && zip -q -X -0 -j app.dex.apk classes.dex)

echo "== zipalign + 签名 =="
"$BT/zipalign" -p -f 4 "$BUILD/app.dex.apk" "$BUILD/app.aligned.apk"
KS="$TOOLS/if.keystore"
if [ ! -f "$KS" ]; then
  "$JAVA_HOME/bin/keytool" -genkeypair -keystore "$KS" -storepass ifpass -keypass ifpass \
    -alias ifkey -keyalg RSA -keysize 2048 -validity 10950 \
    -dname "CN=ICEFOCUS Learning Course, OU=Study, O=ICEFOCUS, C=CN" >/dev/null
fi
OUT="$HERE/LearningCourse-$(date +%Y%m%d).apk"
"$BT/apksigner" sign --ks "$KS" --ks-pass pass:ifpass --key-pass pass:ifpass --ks-key-alias ifkey \
  --v1-signing-enabled true --v2-signing-enabled true --out "$OUT" "$BUILD/app.aligned.apk"

SIZE=$(ls -lh "$OUT" | awk '{print $5}')
echo ""
echo "✅ 完成：$OUT  ($SIZE)"
echo "   装到手机：adb install -r \"$OUT\"，或直接把 APK 传到手机点击安装。"
