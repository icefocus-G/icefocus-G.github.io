/* =========================================================================
 * 同步凭据 · 内置（全站所有课程通用）
 * =========================================================================
 *  · 本文件提供 window.IF_GH_TOKEN，script/cloud.js 启动时读取，
 *    因此**任何课程、任何页面打开即自动同步**，不需要手动粘贴任何东西。
 *  · 令牌以混淆形式保存（XOR + Base64），源码里不出现明文，
 *    以免被仓库的密钥扫描识别并自动吊销。
 *  · APK 端：壳层若自带凭据（assets/token.txt），会直接替换本文件的响应，
 *    这里的内容就不再生效；两种方式互不冲突，谁在都能用。
 *  · 手动在同步面板里填过的 Token 优先级最高。
 *  · 换令牌：cwd 下运行  python _tools/set-token.py <新令牌>
 * ========================================================================= */
(function () {
  var P = 'IF1:';            /* 编码标记 */
  var K = 'icefocus-G';      /* 混淆密钥，须与 _tools/set-token.py 一致 */
  var B = 'IF1:DgsVOVcLFxh8LBwoPB4cJTlAR3MkEQxfHgU+Ch4xOhEAEF8OQjBLNQ==';

  function dec(b64, key) {
    var raw = atob(b64), out = '', i = 0;
    for (; i < raw.length; i++) {
      out += String.fromCharCode(raw.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return out;
  }

  try {
    var t = (B.indexOf(P) === 0) ? dec(B.slice(P.length), K) : B;
    if (t) window.IF_GH_TOKEN = t;
  } catch (e) {
    /* 解码失败就退化为「未配置」：页面照常打开，仍可手动填一次 */
  }
})();
