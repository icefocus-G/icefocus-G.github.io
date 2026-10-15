package com.icefocus.learningcourse;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.DownloadManager;
import android.content.ActivityNotFoundException;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Message;
import android.provider.MediaStore;
import android.util.Base64;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Learning Course · 套壳版（Shell / v2）
 *
 * 设计要点
 * ─────────────────────────────────────────────────────────────
 * 1. **不写死页面**：APK 里不带任何站点资源，只用一个全屏 WebView 打开
 *    GitHub Pages 上的在线站点。改网页 → 手机上立刻生效，不用重新打包。
 *
 * 2. **入口地址也不写死**：启动时先用缓存的入口（或内置兜底地址）秒开，
 *    同时在后台拉一次 <code>apk/config.json</code>；里面的 home 一旦变化就存下来，
 *    下次启动走新入口。想换首页 / 加一门课，改仓库里那个 json 就行。
 *
 * 3. **不设置旧的 APK 标记**：老版 APK 把站点打进包里时，目录名去掉了空格
 *    （International Finance → InternationalFinance），站点里 isAPK() 据此改写链接。
 *    套壳版访问的是 GitHub 上的原版目录（带空格），所以这里一个标记都不写，
 *    站点完全按网页端逻辑跑，不需要改一行网页代码。
 *
 * 4. **存储**：固定源 https://icefocus-G.github.io —— localStorage 天然持久，
 *    学习进度、错题本、云同步凭据都在 WebView 自己的存储里，跨启动保留。
 *
 * 5. **可选内置同步凭据**：打包时若存在 gh.token，会写进 assets/token.txt，
 *    启动时注入 window.IF_GH_TOKEN，装完即自动同步；没有就手动填一次。
 */
public class MainActivity extends Activity {

    private static final String TAG = "IF-Shell";

    /** 内置兜底入口（首次启动、拉不到远程配置时用） */
    private static final String DEFAULT_HOME =
            "https://icefocus-G.github.io/examination/";
    /** 远程入口配置：{"home":"https://.../xxx/study.html"} */
    private static final String CONFIG_URL =
            "https://icefocus-G.github.io/apk/config.json";
    /** 只允许站内导航留在 App 里，其余一律丢给系统浏览器 */
    private static final String SITE_HOST = "icefocus-g.github.io";

    private static final String PREF = "if_shell";
    private static final String K_HOME = "home";

    private static final int REQ_FILE = 1001;

    private WebView web;
    private WebView probe;
    private ProgressBar bar;
    private ValueCallback<Uri[]> fileCb;
    private String token = "";
    private long lastBack = 0;

    /* ===================================================================== */
    /*  生命周期                                                              */
    /* ===================================================================== */

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);

        token = readBuiltinToken();

        /* 顶层：进度条 + WebView */
        FrameLayout root = new FrameLayout(this);
        root.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        bar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        bar.setMax(100);
        bar.setVisibility(View.GONE);
        FrameLayout.LayoutParams bp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, dp(3));
        bp.gravity = Gravity.TOP;
        root.addView(bar, bp);

        web = new WebView(this);
        root.addView(web, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);

        configure(web);
        web.addJavascriptInterface(new SaveBridge(), "IFSAVE");

        web.loadUrl(homeUrl());
        refreshRemoteConfig();
    }

    private int dp(int v) {
        return Math.round(getResources().getDisplayMetrics().density * v);
    }

    /* ===================================================================== */
    /*  WebView 配置                                                          */
    /* ===================================================================== */

    @SuppressLint("SetJavaScriptEnabled")
    private void configure(WebView v) {
        WebSettings s = v.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // localStorage —— 学习进度 / 判分记录的主存储
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(true);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(false);
        s.setSupportZoom(true);
        s.setBuiltInZoomControls(true);        // 双指缩放；下面的 × 控件隐藏掉
        s.setDisplayZoomControls(false);
        s.setLoadsImagesAutomatically(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setSupportMultipleWindows(true);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);          // 联网优先走网络，断网回落到缓存
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        String ua = s.getUserAgentString();
        s.setUserAgentString((ua == null ? "" : ua) + " ICEFOCUS-Shell/2.0");

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(v, true);

        v.setWebViewClient(new WebViewClient() {

            @Override
            public boolean shouldOverrideUrlLoading(WebView w, WebResourceRequest req) {
                return route(req == null || req.getUrl() == null ? null : req.getUrl().toString());
            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView w, String url) {
                return route(url);
            }

            @Override
            public void onPageStarted(WebView w, String url, android.graphics.Bitmap icon) {
                injectBootstrap(w);
            }

            @Override
            public void onPageFinished(WebView w, String url) {
                injectBootstrap(w);            // 兜一次：处理页内脚本早于 onPageStarted 注入的情况
            }

            /**
             * 内置令牌的关键一环：直接把站点里的 script/gh-token.js 换成带令牌的版本。
             * 比 evaluateJavascript 注入可靠 —— 令牌一定在 cloud.js 读取之前就位，
             * 不受页面脚本执行时机的影响。
             */
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView w, WebResourceRequest req) {
                if (token == null || token.isEmpty() || req == null) return null;
                String u = req.getUrl() == null ? "" : req.getUrl().toString();
                if (u.endsWith("/script/gh-token.js") || u.contains("/script/gh-token.js?")) {
                    try {
                        String body = "/* Learning Course · APK 内置凭据（由壳层注入） */\n"
                                + "window.IF_GH_TOKEN = " + jsStr(token) + ";\n";
                        return new WebResourceResponse("application/javascript", "utf-8",
                                new java.io.ByteArrayInputStream(body.getBytes("UTF-8")));
                    } catch (Exception e) {
                        return null;
                    }
                }
                return null;
            }

            @Override
            public void onReceivedError(WebView w, WebResourceRequest req, WebResourceError err) {
                // 只在主文档加载失败时给离线页；子资源（图片、脚本）失败不打扰用户
                if (req != null && req.isForMainFrame()) showOffline(w);
            }
        });

        v.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView w, int p) {
                bar.setProgress(p);
                bar.setVisibility(p >= 100 ? View.GONE : View.VISIBLE);
            }

            /** window.open / target=_blank → 交给系统浏览器 */
            @Override
            public boolean onCreateWindow(WebView w, boolean dialog, boolean gesture, Message msg) {
                if (msg == null || !(msg.obj instanceof WebView.WebViewTransport)) return false;
                if (probe != null) {
                    probe.destroy();          // 上一个探针用完即毁，别攒着
                    probe = null;
                }
                probe = new WebView(MainActivity.this);
                probe.setWebViewClient(new WebViewClient() {
                    @Override
                    public boolean shouldOverrideUrlLoading(WebView x, String url) {
                        openOutside(url);
                        return true;
                    }
                });
                ((WebView.WebViewTransport) msg.obj).setWebView(probe);
                msg.sendToTarget();
                return true;
            }

            /** <input type="file"> —— 站点里的「导入数据文件」靠它 */
            @Override
            public boolean onShowFileChooser(WebView w, ValueCallback<Uri[]> cb,
                                             FileChooserParams params) {
                if (fileCb != null) fileCb.onReceiveValue(null);
                fileCb = cb;
                try {
                    Intent i = params.createIntent();
                    i.addCategory(Intent.CATEGORY_OPENABLE);
                    startActivityForResult(i, REQ_FILE);
                    return true;
                } catch (ActivityNotFoundException e) {
                    fileCb = null;
                    Toast.makeText(MainActivity.this, "没有可用的文件选择器", Toast.LENGTH_SHORT).show();
                    return false;
                }
            }
        });

        /* 导出 JSON / TXT / CSV：blob: 交给 JS 转 base64 回传，其余走系统下载器 */
        v.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String ua, String cd, String mime, long len) {
                if (url == null) return;
                if (url.startsWith("blob:") || url.startsWith("data:")) {
                    grabBlob(url, cd);
                } else {
                    try {
                        DownloadManager dm = (DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE);
                        if (dm != null) {
                            dm.enqueue(new DownloadManager.Request(Uri.parse(url))
                                    .setNotificationVisibility(
                                            DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                                    .setDestinationInExternalPublicDir(
                                            Environment.DIRECTORY_DOWNLOADS, guessName(cd, "download")));
                            Toast.makeText(MainActivity.this, "已开始下载", Toast.LENGTH_SHORT).show();
                        } else {
                            openOutside(url);
                        }
                    } catch (Exception e) {
                        openOutside(url);
                    }
                }
            }
        });
    }

    /** 站内留在 WebView，站外丢给系统浏览器 */
    private boolean route(String url) {
        if (url == null) return false;
        Uri u = Uri.parse(url);
        String scheme = u.getScheme() == null ? "" : u.getScheme().toLowerCase(Locale.ROOT);
        String host = u.getHost() == null ? "" : u.getHost().toLowerCase(Locale.ROOT);
        if (scheme.startsWith("http") && (host.equals(SITE_HOST) || host.endsWith("." + SITE_HOST))) {
            return false;                       // 站内 → 留在 App
        }
        if (scheme.startsWith("http")) {
            openOutside(url);
            return true;
        }
        if (scheme.startsWith("mailto") || scheme.startsWith("tel") || scheme.startsWith("intent")) {
            openOutside(url);
            return true;
        }
        return false;
    }

    private void openOutside(String url) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
        } catch (Exception e) {
            Toast.makeText(this, "无法打开：\n" + url, Toast.LENGTH_LONG).show();
        }
    }

    /* ===================================================================== */
    /*  注入：内置同步凭据 + 离线重试钩子                                      */
    /* ===================================================================== */

    private void injectBootstrap(WebView w) {
        if (token == null || token.isEmpty()) return;
        String js = "(function(){try{if(!window.IF_GH_TOKEN)window.IF_GH_TOKEN=" + jsStr(token) +
                ";}catch(e){}})()";
        w.evaluateJavascript(js, null);
    }

    private void showOffline(final WebView w) {
        String html = "<!DOCTYPE html><html lang=\"zh-CN\"><head><meta charset=\"utf-8\">"
                + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
                + "<style>body{margin:0;min-height:100vh;display:flex;align-items:center;"
                + "justify-content:center;background:#eef1f7;color:#1e293b;"
                + "font:15px/1.8 -apple-system,'PingFang SC','Microsoft YaHei',sans-serif}"
                + ".c{text-align:center;padding:32px 26px;max-width:420px}"
                + "h1{font-size:19px;margin:0 0 10px}p{color:#5b6478;margin:0 0 22px;font-size:13.5px}"
                + "button{border:0;background:#2d5fe0;color:#fff;font:600 14px inherit;"
                + "padding:11px 30px;border-radius:10px}</style></head><body><div class=\"c\">"
                + "<h1>📡 连不上网络</h1>"
                + "<p>套壳版直接从 GitHub 读取课程页面，需要联网。<br>"
                + "连上 Wi‑Fi 或流量后点下面重试。</p>"
                + "<button onclick=\"location.replace('" + homeUrl() + "')\">重新加载</button>"
                + "</div></body></html>";
        w.loadDataWithBaseURL("https://icefocus-G.github.io/", html, "text/html", "utf-8", null);
    }

    /* ===================================================================== */
    /*  入口地址：缓存优先 + 远程可改                                          */
    /* ===================================================================== */

    private String homeUrl() {
        try {
            String h = prefs().getString(K_HOME, null);
            if (h != null && h.startsWith("https://")) return h;
        } catch (Exception ignored) {
        }
        return DEFAULT_HOME;
    }

    private SharedPreferences prefs() {
        return getSharedPreferences(PREF, MODE_PRIVATE);
    }

    /** 后台拉一次 apk/config.json：{ "home": "https://..." }。失败或格式不对就当没这回事。 */
    private void refreshRemoteConfig() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                HttpURLConnection c = null;
                try {
                    c = (HttpURLConnection) new URL(CONFIG_URL + "?t=" + System.currentTimeMillis())
                            .openConnection();
                    c.setConnectTimeout(6000);
                    c.setReadTimeout(6000);
                    c.setInstanceFollowRedirects(true);
                    c.setRequestProperty("Cache-Control", "no-cache");
                    c.setRequestProperty("User-Agent", "ICEFOCUS-Shell/2.0");
                    if (c.getResponseCode() != 200) return;
                    InputStream in = c.getInputStream();
                    ByteArrayOutputStream bo = new ByteArrayOutputStream();
                    byte[] buf = new byte[2048];
                    int n;
                    while ((n = in.read(buf)) > 0 && bo.size() < 65536) bo.write(buf, 0, n);
                    in.close();
                    String body = bo.toString("UTF-8");
                    String home = jsonString(body, "home");
                    if (home == null) return;
                    home = home.trim();
                    if (!home.startsWith("https://")) return;       // 只认 https，别被乱跳
                    final String h = home;
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            String cur = prefs().getString(K_HOME, null);
                            if (!h.equals(cur)) {
                                prefs().edit().putString(K_HOME, h).apply();
                                Log.i(TAG, "入口已更新：" + h);
                            }
                        }
                    });
                } catch (Exception e) {
                    Log.d(TAG, "远程配置拉取失败（忽略）：" + e);
                } finally {
                    if (c != null) c.disconnect();
                }
            }
        }, "if-config").start();
    }

    /** 极简 JSON 取值：只认 {"key":"value"}，够用且不会引入依赖 */
    private static String jsonString(String body, String key) {
        if (body == null) return null;
        int i = body.indexOf("\"" + key + "\"");
        if (i < 0) return null;
        int c = body.indexOf(':', i);
        if (c < 0) return null;
        int a = body.indexOf('"', c + 1);
        if (a < 0) return null;
        StringBuilder sb = new StringBuilder();
        for (int k = a + 1; k < body.length(); k++) {
            char ch = body.charAt(k);
            if (ch == '\\' && k + 1 < body.length()) {
                char nx = body.charAt(++k);
                if (nx == 'u' && k + 4 < body.length()) {
                    sb.append((char) Integer.parseInt(body.substring(k + 1, k + 5), 16));
                    k += 4;
                } else {
                    sb.append(nx == 'n' ? '\n' : nx);
                }
            } else if (ch == '"') {
                return sb.toString();
            } else {
                sb.append(ch);
            }
        }
        return null;
    }

    /* ===================================================================== */
    /*  内置令牌                                                              */
    /* ===================================================================== */

    private String readBuiltinToken() {
        InputStream in = null;
        try {
            in = getAssets().open("token.txt");
            ByteArrayOutputStream bo = new ByteArrayOutputStream();
            byte[] buf = new byte[512];
            int n;
            while ((n = in.read(buf)) > 0) bo.write(buf, 0, n);
            return bo.toString("UTF-8").replaceAll("\\s", "");
        } catch (Exception e) {
            return "";
        } finally {
            try {
                if (in != null) in.close();
            } catch (Exception ignored) {
            }
        }
    }

    /* ===================================================================== */
    /*  blob → 文件                                                           */
    /* ===================================================================== */

    private void grabBlob(final String blobUrl, final String disposition) {
        final String name = guessName(disposition, "learning-course-"
                + new SimpleDateFormat("yyyyMMdd-HHmm", Locale.US).format(new Date()) + ".json");
        final String js = "(function(){try{fetch(" + jsStr(blobUrl) + ")"
                + ".then(function(r){return r.blob()})"
                + ".then(function(b){var f=new FileReader();"
                + "f.onload=function(){IFSAVE.post(f.result," + jsStr(name) + ")};"
                + "f.readAsDataURL(b)})"
                + ".catch(function(e){IFSAVE.fail(''+e)})}catch(e){IFSAVE.fail(''+e)}})()";
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                web.evaluateJavascript(js, null);
            }
        });
    }

    /** 注入到页面的保存桥（public：JS 接口走反射，类可见性放宽更稳） */
    public class SaveBridge {
        @JavascriptInterface
        public void post(final String dataUrl, final String name) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        int comma = dataUrl == null ? -1 : dataUrl.indexOf(',');
                        if (comma < 0) throw new IllegalArgumentException("数据为空");
                        String meta = dataUrl.substring(0, comma);
                        String mime = meta.substring(5, Math.max(5, meta.indexOf(';') > 0
                                ? meta.indexOf(';') : meta.length()));
                        byte[] bytes = Base64.decode(dataUrl.substring(comma + 1), Base64.DEFAULT);
                        String path = saveToDownloads(name, mime, bytes);
                        Toast.makeText(MainActivity.this,
                                "已保存到下载目录：\n" + path, Toast.LENGTH_LONG).show();
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "保存失败：" + e.getMessage(),
                                Toast.LENGTH_LONG).show();
                    }
                }
            });
        }

        @JavascriptInterface
        public void fail(final String msg) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Toast.makeText(MainActivity.this, "导出失败：" + msg, Toast.LENGTH_LONG).show();
                }
            });
        }
    }

    private String saveToDownloads(String name, String mime, byte[] data) throws Exception {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues cv = new ContentValues();
            cv.put(MediaStore.Downloads.DISPLAY_NAME, name);
            cv.put(MediaStore.Downloads.MIME_TYPE,
                    mime == null || mime.isEmpty() ? "application/octet-stream" : mime);
            cv.put(MediaStore.Downloads.IS_PENDING, 1);
            Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
            if (uri == null) throw new IllegalStateException("无法在下载目录创建文件");
            OutputStream os = getContentResolver().openOutputStream(uri);
            if (os == null) throw new IllegalStateException("写入失败");
            os.write(data);
            os.close();
            cv.clear();
            cv.put(MediaStore.Downloads.IS_PENDING, 0);
            getContentResolver().update(uri, cv, null, null);
            return "下载/" + name;
        }
        java.io.File dir = new java.io.File(
                Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                "");
        if (!dir.exists() && !dir.mkdirs()) throw new IllegalStateException("下载目录不可写");
        java.io.File f = new java.io.File(dir, name);
        java.io.FileOutputStream fo = new java.io.FileOutputStream(f);
        fo.write(data);
        fo.close();
        return f.getAbsolutePath();
    }

    /* ===================================================================== */
    /*  工具                                                                  */
    /* ===================================================================== */

    private static String jsStr(String s) {
        if (s == null) return "\"\"";
        StringBuilder sb = new StringBuilder("\"");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"':  sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\n': sb.append("\\n");  break;
                case '\r': sb.append("\\r");  break;
                case '\t': sb.append("\\t");  break;
                default:
                    if (c < 0x20) sb.append(String.format(Locale.US, "\\u%04x", (int) c));
                    else sb.append(c);
            }
        }
        return sb.append('"').toString();
    }

    private static String guessName(String disposition, String fallback) {
        if (disposition != null) {
            int i = disposition.toLowerCase(Locale.ROOT).indexOf("filename=");
            if (i >= 0) {
                String v = disposition.substring(i + 9).trim();
                if (v.startsWith("\"")) v = v.substring(1, Math.max(1, v.lastIndexOf('"')));
                if (v.contains(";")) v = v.substring(0, v.indexOf(';'));
                v = v.replaceAll("[\\\\/:*?\"<>|]", "_").trim();
                if (!v.isEmpty()) return v;
            }
        }
        return fallback;
    }

    /* ===================================================================== */
    /*  返回键 / 文件选择回调 / 暂停补同步                                     */
    /* ===================================================================== */

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) {
            long now = System.currentTimeMillis();
            if (now - lastBack > 2400) {
                web.goBack();
                lastBack = now;
                return;
            }
        }
        super.onBackPressed();
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == REQ_FILE) {
            if (fileCb != null) {
                Uri[] out = null;
                if (res == RESULT_OK && data != null) {
                    if (data.getDataString() != null) {
                        out = new Uri[]{Uri.parse(data.getDataString())};
                    } else if (data.getClipData() != null) {
                        int n = data.getClipData().getItemCount();
                        out = new Uri[n];
                        for (int i = 0; i < n; i++) out[i] = data.getClipData().getItemAt(i).getUri();
                    }
                }
                fileCb.onReceiveValue(out);
                fileCb = null;
            }
            return;
        }
        super.onActivityResult(req, res, data);
    }

    @Override
    protected void onPause() {
        super.onPause();
        // 切走/锁屏时让同步引擎补交一次，避免刚做完的题没上传
        if (web != null) {
            web.evaluateJavascript("(function(){try{"
                    + "if(window.IF_COURSE_SYNC&&window.IF_COURSE_SYNC.flush)"
                    + "window.IF_COURSE_SYNC.flush();}catch(e){}})()", null);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            try {
                ViewGroup vg = (ViewGroup) web.getParent();
                if (vg != null) vg.removeView(web);
                web.destroy();
            } catch (Exception ignored) {
            }
            web = null;
        }
        super.onDestroy();
    }
}
