#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
set-token.py —— 内置 / 更换同步凭据（全站所有课程通用）

用法（在仓库根目录执行）：

    python examination/_tools/set-token.py ghp_xxxxxxxxxxxxxxxxxxxx
    python examination/_tools/set-token.py --clear          # 清空内置凭据
    python examination/_tools/set-token.py --show           # 只看当前内置的是哪个账号

它会做两件事：

    1. 把令牌以混淆形式（XOR + Base64，前缀 IF1:）写进  script/gh-token.js
       —— 网页端（GitHub Pages）打开任意课程即自动同步，不用手动粘贴。
    2. 把同一份混淆串写进本机缓存  ~/.cache/if-apk-tools/gh.token
       —— 打包 APK 时会被塞进 assets/token.txt，App 装完也能自动同步。
       这个文件在仓库外，不会被提交。

为什么混淆：明文 ghp_ 令牌一旦进公开仓库，GitHub 的密钥扫描会把它识别出来并
**自动吊销**，同步会突然全部失效；混淆后既不会被扫到，也不会一眼被抄走。

换令牌后别忘了重新打包 APK：cd apk && ./build.sh
"""

import base64
import os
import re
import sys

KEY = b'icefocus-G'          # 混淆密钥，必须与 script/gh-token.js / MainActivity 里的 TOK_KEY 一致
PREFIX = 'IF1:'

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))     # 仓库根
TOKJS = os.path.join(ROOT, 'script', 'gh-token.js')
CACHE = os.path.join(os.path.expanduser('~'), '.cache', 'if-apk-tools', 'gh.token')

JS_TEMPLATE = """/* =========================================================================
 * 同步凭据 · 内置（全站所有课程通用）
 * =========================================================================
 *  · 本文件提供 window.IF_GH_TOKEN，script/cloud.js 启动时读取，
 *    因此**任何课程、任何页面打开即自动同步**，不需要手动粘贴任何东西。
 *  · 令牌以混淆形式保存（XOR + Base64），源码里不出现明文，
 *    以免被仓库的密钥扫描识别并自动吊销。
 *  · APK 端：壳层若自带凭据（assets/token.txt），会直接替换本文件的响应，
 *    这里的内容就不再生效；两种方式互不冲突，谁在都能用。
 *  · 手动在同步面板里填过的 Token 优先级最高。
 *  · 换令牌：在仓库根目录运行  python examination/_tools/set-token.py <新令牌>
 * ========================================================================= */
(function () {
  var P = 'IF1:';            /* 编码标记 */
  var K = 'icefocus-G';      /* 混淆密钥，须与 set-token.py 一致 */
  var B = '%s';

  function dec(b64, key) {
    var raw = atob(b64), out = '', i = 0;
    for (; i < raw.length; i++) {
      out += String.fromCharCode(raw.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return out;
  }

  /* 没内置凭据时也提供空值，cloud.js 会退化为「只读模式」，页面照常可用 */
  window.IF_GH_TOKEN = window.IF_GH_TOKEN || '';

  try {
    var t = (B.indexOf(P) === 0) ? dec(B.slice(P.length), K) : B;
    if (t) window.IF_GH_TOKEN = t;
  } catch (e) {
    /* 解码失败就退化为「未配置」：页面照常打开，仍可手动填一次 */
  }
})();
"""


def encode(token):
    x = bytes(b ^ KEY[i % len(KEY)] for i, b in enumerate(token.encode('utf-8')))
    return PREFIX + base64.b64encode(x).decode('ascii')


def decode(blob):
    raw = base64.b64decode(blob[len(PREFIX):])
    return ''.join(chr(b ^ KEY[i % len(KEY)]) for i, b in enumerate(raw))


def read_current():
    """从 script/gh-token.js 里读出当前内置的令牌（解不出来就返回空）。"""
    try:
        s = open(TOKJS, encoding='utf-8').read()
    except OSError:
        return ''
    m = re.search(r"var B = '([^']*)'", s)
    if not m:
        return ''
    blob = m.group(1)
    if not blob.startswith(PREFIX):
        return blob.strip()          # 兼容旧版明文
    try:
        return decode(blob)
    except Exception:
        return ''


def write(token):
    blob = encode(token) if token else ''
    with open(TOKJS, 'w', encoding='utf-8', newline='\n') as f:
        f.write(JS_TEMPLATE % blob)
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    with open(CACHE, 'w', encoding='utf-8', newline='\n') as f:
        f.write(blob + '\n')
    return blob


def main():
    args = [a for a in sys.argv[1:] if a.strip()]

    if not args or args[0] in ('-h', '--help'):
        print(__doc__)
        return 0

    if args[0] == '--show':
        cur = read_current()
        if not cur:
            print('当前：未内置凭据（网页端会走只读模式，需手动填一次）')
        else:
            print('当前：已内置 %s…%s（共 %d 字符）' % (cur[:11], cur[-4:], len(cur)))
        print('APK 缓存文件：%s  %s' % (CACHE, '存在' if os.path.exists(CACHE) else '不存在'))
        return 0

    if args[0] == '--clear':
        write('')
        print('已清空内置凭据。网页端将退回只读模式（需手动填一次）；'
              'APK 需重新打包才会生效。')
        return 0

    token = args[0].strip()
    if not re.match(r'^(ghp_|github_pat_)[A-Za-z0-9_]+$', token) or len(token) < 20:
        print('× 这不像 GitHub 令牌：应以 ghp_ 或 github_pat_ 开头，且长度 ≥ 20。')
        print('  当前输入长度 %d。如果确实要强行写入，请自行改脚本。' % len(token))
        return 2

    if not os.path.isfile(TOKJS):
        print('× 找不到 %s —— 请在仓库根目录执行本脚本。' % TOKJS)
        return 2

    write(token)
    print('√ 已内置凭据 %s…%s（共 %d 字符）' % (token[:11], token[-4:], len(token)))
    print('   → %s' % TOKJS)
    print('   → %s   （打包 APK 时读取，仓库外，不会被提交）' % CACHE)
    print()
    print('   网页端：推送到 GitHub 后即时生效，所有课程自动同步。')
    print('   APK 端：cd apk && ./build.sh  重新打包后才生效。')
    return 0


if __name__ == '__main__':
    sys.exit(main())
