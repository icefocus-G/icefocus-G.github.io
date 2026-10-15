#!/bin/bash
# =============================================================================
#  Learning Course · 套壳版 APK 一键打包
#
#   用法：cd apk && ./build.sh
#   产出：apk/LearningCourse-Shell-<日期>.apk（并同步一份到 software/）
#
#   与旧版的区别：**不再把网站打进 APK**。
#   这里只编译一个 WebView 壳，运行时直接打开 GitHub Pages 上的在线站点，
#   所以改网页不用重新打包，改完推上去手机上刷新就能看到。
#
#   依赖：JDK 17 + Android SDK（build-tools + 任一 platforms/android-XX）
#         脚本会自动在常见位置找；找不到就用环境变量指定：
#           IF_JDK=/path/to/jdk17  IF_SDK=/path/to/android-sdk  ./build.sh
#
#   可选：把同步凭据放在 apk/.token（或 ~/.cache/if-apk-tools/gh.token），
#         会被写进 assets/token.txt，装完即自动同步。不提供则需在 App 里手动填一次。
# =============================================================================

set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
MIN_SDK=24
TARGET_SDK=36
BUILD="$HERE/.build"

# ---------- 跨平台小工具 ----------
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) WIN=1 ;;
  *) WIN=0 ;;
esac
btool() { # btool <name>  →  build-tools 里的可执行文件路径
  if [ "$WIN" = 1 ] && [ -f "$BT/$1.exe" ]; then echo "$BT/$1.exe"
  elif [ -f "$BT/$1.bat" ]; then echo "$BT/$1.bat"
  elif [ -f "$BT/$1.exe" ]; then echo "$BT/$1.exe"
  else echo "$BT/$1"; fi
}
has() { [ -e "$1/bin/javac" ] || [ -e "$1/bin/javac.exe" ]; }

# ---------- 0. 找 JDK ----------
JDK_DIR=""
for p in "${IF_JDK:-}" \
         "/c/Program Files (x86)/Android/openjdk/jdk-17.0.14" \
         "/c/Program Files (x86)/Android/openjdk/jdk-17.0.12" \
         "/c/Program Files/Android/openjdk/jdk-21.0.8" \
         "$HOME/.cache/if-apk-tools/jdk"; do
  [ -n "$p" ] && has "$p" && { JDK_DIR="$p"; break; }
done
if [ -z "$JDK_DIR" ]; then
  for base in "/c/Program Files (x86)/Android/openjdk" "/c/Program Files/Android/openjdk" \
              "/Library/Java/JavaVirtualMachines" "/usr/lib/jvm"; do
    [ -d "$base" ] || continue
    f="$(find "$base" -maxdepth 3 \( -name javac -o -name javac.exe \) -type f 2>/dev/null | head -1)"
    [ -n "$f" ] && { JDK_DIR="$(dirname "$(dirname "$f")")"; break; }
  done
fi
if [ -z "$JDK_DIR" ]; then
  echo "✗ 找不到 JDK 17。请设置 IF_JDK=/path/to/jdk17 后重跑。"; exit 1
fi
export JAVA_HOME="$JDK_DIR"
export PATH="$JAVA_HOME/bin:$PATH"
echo "   JAVA_HOME    = $JAVA_HOME"

# ---------- 1. 找 Android SDK ----------
ANDROID_SDK=""
for c in "${IF_SDK:-}" \
         "/c/Program Files (x86)/Android/android-sdk" \
         "/c/Program Files/Android/android-sdk" \
         "$LOCALAPPDATA/Android/Sdk" "$HOME/AppData/Local/Android/Sdk" \
         "$HOME/Library/Android/sdk" "$HOME/Android/Sdk" \
         "${ANDROID_HOME:-}" "${ANDROID_SDK_ROOT:-}"; do
  [ -n "$c" ] && [ -d "$c/platforms" ] && [ -d "$c/build-tools" ] && { ANDROID_SDK="$c"; break; }
done
if [ -z "$ANDROID_SDK" ]; then
  echo "✗ 找不到 Android SDK（需要 platforms/ 与 build-tools/）。请设置 IF_SDK=... 后重跑。"; exit 1
fi
BT="$ANDROID_SDK/build-tools/$(ls "$ANDROID_SDK/build-tools" | sort -V | tail -1)"
PLATFORM="$(ls "$ANDROID_SDK/platforms" | sort -V | tail -1)"
AJ="$ANDROID_SDK/platforms/$PLATFORM/android.jar"
echo "   ANDROID_SDK  = $ANDROID_SDK"
echo "   build-tools  = $(basename "$BT")   platform = $PLATFORM"

rm -rf "$BUILD"; mkdir -p "$BUILD/obj" "$BUILD/assets"

# ---------- 2. 可选：内置同步凭据 ----------
TOKEN_FILE=""
for f in "$HERE/.token" "${IF_GH_TOKEN_FILE:-}" "$HOME/.cache/if-apk-tools/gh.token"; do
  [ -n "$f" ] && [ -f "$f" ] && { TOKEN_FILE="$f"; break; }
done
if [ -n "$TOKEN_FILE" ]; then
  TOKEN="$(tr -d ' \t\r\n' < "$TOKEN_FILE")"
  if [ -n "$TOKEN" ]; then
    printf '%s' "$TOKEN" > "$BUILD/assets/token.txt"
    echo "   ✔ 已内置同步凭据（${#TOKEN} 字符）→ assets/token.txt"
  else
    echo "   ⚠ $TOKEN_FILE 是空文件，APK 将需要手动填 Token"
  fi
else
  echo "   ⚠ 未提供同步凭据 —— 装好后在「☁ 云同步」里手动填一次即可"
fi

# ---------- 3. 编译 ----------
echo "== javac =="
"$JAVA_HOME/bin/javac" -encoding UTF-8 -source 17 -target 17 -nowarn \
  -classpath "$AJ" -d "$BUILD/obj" $(find "$HERE/java" -name '*.java' ! -name '._*')

echo "== d8 =="
# Windows 上 build-tools 里的 d8 / apksigner 是 .bat，路径含空格时从 bash 调会散架；
# 有 d8.jar 就直接用 java 起，跨平台且不受路径空格影响。
if [ -f "$BT/lib/d8.jar" ]; then
  "$JAVA_HOME/bin/java" -cp "$BT/lib/d8.jar" com.android.tools.r8.D8 \
    --lib "$AJ" --min-api $MIN_SDK --output "$BUILD" \
    $(find "$BUILD/obj" -name '*.class' ! -name '._*')
else
  "$(btool d8)" --lib "$AJ" --min-api $MIN_SDK --output "$BUILD" \
    $(find "$BUILD/obj" -name '*.class' ! -name '._*')
fi

echo "== aapt2 =="
"$(btool aapt2)" compile --dir "$HERE/res" -o "$BUILD/flats.zip"
"$(btool aapt2)" link -I "$AJ" --manifest "$HERE/AndroidManifest.xml" \
  -A "$BUILD/assets" --min-sdk-version $MIN_SDK --target-sdk-version $TARGET_SDK \
  --auto-add-overlay -o "$BUILD/app.raw.apk" "$BUILD/flats.zip"

echo "== 注入 classes.dex =="
if command -v zip >/dev/null 2>&1; then
  cp "$BUILD/app.raw.apk" "$BUILD/app.dex.apk"
  (cd "$BUILD" && zip -q -X -0 -j app.dex.apk classes.dex)
else
  # 没有 zip 命令（常见于 Git Bash for Windows）→ 交给 Python 的 zipfile
  PY=""
  for p in python3 python py; do command -v "$p" >/dev/null 2>&1 && { PY="$p"; break; }; done
  [ -z "$PY" ] && [ -x "$HOME/.workbuddy/binaries/python/versions/3.13.12/python.exe" ] && \
    PY="$HOME/.workbuddy/binaries/python/versions/3.13.12/python.exe"
  if [ -z "$PY" ]; then echo "✗ 缺少 zip 或 python，无法注入 classes.dex"; exit 1; fi
  "$PY" - "$BUILD" <<'PYEOF'
import sys, os, zipfile
b = sys.argv[1]
src, dst = os.path.join(b, 'app.raw.apk'), os.path.join(b, 'app.dex.apk')
zin, out = zipfile.ZipFile(src), zipfile.ZipFile(dst, 'w')
for it in zin.infolist():
    if it.filename == 'classes.dex':
        continue
    ni = zipfile.ZipInfo(it.filename, date_time=it.date_time)
    ni.compress_type, ni.external_attr = it.compress_type, it.external_attr
    out.writestr(ni, zin.read(it.filename))
dex = os.path.join(b, 'classes.dex')
out.writestr(zipfile.ZipInfo('classes.dex'), open(dex, 'rb').read())
out.close()
print('      classes.dex 已写入（%d 字节）' % os.path.getsize(dex))
PYEOF
fi

echo "== zipalign + 签名 =="
"$(btool zipalign)" -p -f 4 "$BUILD/app.dex.apk" "$BUILD/app.aligned.apk"

TOOLS="${IF_APK_TOOLS:-$HOME/.cache/if-apk-tools}"
mkdir -p "$TOOLS"
KS="$TOOLS/if.keystore"
if [ ! -f "$KS" ]; then
  echo "   生成新的签名密钥（$KS）"
  "$JAVA_HOME/bin/keytool" -genkeypair -keystore "$KS" -storepass ifpass -keypass ifpass \
    -alias ifkey -keyalg RSA -keysize 2048 -validity 10950 \
    -dname "CN=ICEFOCUS Learning Course, OU=Study, O=ICEFOCUS, C=CN" >/dev/null
fi

STAMP="$(date +%Y%m%d)"
OUT="$HERE/LearningCourse-Shell-$STAMP.apk"
if [ -f "$BT/lib/apksigner.jar" ]; then
  "$JAVA_HOME/bin/java" -jar "$BT/lib/apksigner.jar" sign \
    --ks "$KS" --ks-pass pass:ifpass --key-pass pass:ifpass \
    --ks-key-alias ifkey --v1-signing-enabled true --v2-signing-enabled true \
    --out "$OUT" "$BUILD/app.aligned.apk"
else
  "$(btool apksigner)" sign --ks "$KS" --ks-pass pass:ifpass --key-pass pass:ifpass \
    --ks-key-alias ifkey --v1-signing-enabled true --v2-signing-enabled true \
    --out "$OUT" "$BUILD/app.aligned.apk"
fi

mkdir -p "$ROOT/software"
cp -f "$OUT" "$ROOT/software/$(basename "$OUT")"

echo ""
echo "✅ 完成：$OUT"
echo "   大小：$(ls -lh "$OUT" | awk '{print $5}')   已同步一份到 software/"
echo "   （套壳版里没有网站资源，只有几十 KB —— 这是正常的）"
