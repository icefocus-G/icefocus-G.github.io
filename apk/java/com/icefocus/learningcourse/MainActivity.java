package com.icefocus.learningcourse;

import android.app.Activity;
import android.graphics.Bitmap;
import android.os.Build;
import android.os.Bundle;
import android.os.Message;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.annotation.SuppressLint;
import android.widget.Toast;

/**
 * Learning Course · 壳层
 *
 * · 站点资源打包在 assets/www 里，由一个只监听 127.0.0.1 的微型 HTTP 服务提供，
 *   这样 WebView 拿到的是真正的 http 源 —— localStorage / iframe / fetch 全部按标准行为工作，
 *   离线也能完整做题，联网后自动把答案与判分结果同步到 GitHub。
 * · 外部链接（GitHub Token 页面等）直接在同一个 WebView 内打开，返回键可以回退。
 */
public class MainActivity extends Activity {

    private static final String TAG = "IF-Main";
    private LocalServer server;
    private WebView web;
    private long lastBack = 0;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        /* 1) 起本地服务 */
        try {
            server = new LocalServer(getAssets(), 0);
        } catch (Exception e) {
            Log.e(TAG, "本地服务启动失败", e);
            server = null;
        }

        /* 2) WebView */
        web = new WebView(this);
        web.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);            // localStorage：学习进度与同步的主存储
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setUseWideViewPort(true);
        s.setLoadWithOverviewMode(false);
        s.setSupportZoom(true);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setLoadsImagesAutomatically(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setSupportMultipleWindows(true);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        String ua = s.getUserAgentString();
        if (ua == null) ua = "";
        s.setUserAgentString(ua + " ICEFOCUS-APK/1.0");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, String url) {
                return false;                     // 站内导航 + 外链都留在 App 里
            }
            @Override
            public void onPageFinished(WebView v, String url) {
                // 告诉前端当前跑在 APK 里（页面据此隐藏「返回首页」等网页端入口）
                v.evaluateJavascript("window.__IF_NATIVE__=true;window.__IF_APK__=true;", null);
            }
            @Override
            public void onReceivedError(WebView v, int code, String desc, String url) {
                Log.w(TAG, "加载失败 " + code + " " + url + " " + desc);
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onCreateWindow(WebView v, boolean dialog, boolean userGesture, Message resultMsg) {
                // window.open（GitHub Token 页面）→ 在同一个 WebView 里打开
                WebView.WebViewTransport t = (WebView.WebViewTransport) resultMsg.obj;
                if (t != null) {
                    t.setWebView(web);
                    resultMsg.sendToTarget();
                    return true;
                }
                return false;
            }
            @Override
            public void onProgressChanged(WebView v, int progress) { /* no-op */ }
        });

        if (server != null) {
            // 直接进课程中心：APK 里不打首页皮肤，只装课程与子页面
            web.loadUrl(server.getBaseUrl() + "examination/index.html");
        } else {
            Toast.makeText(this, "本地资源服务启动失败", Toast.LENGTH_LONG).show();
        }
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) {
            long now = System.currentTimeMillis();
            if (now - lastBack > 2200) {
                web.goBack();
                lastBack = now;
                return;
            }
        }
        super.onBackPressed();
    }

    @Override
    protected void onPause() {
        super.onPause();
        // 页面失去焦点时，同步引擎自己会补交一次（flush/ping），这里只做兜底刷新
        if (web != null) web.evaluateJavascript(
                "(function(){try{if(window.IF_COURSE_SYNC)window.IF_COURSE_SYNC.flush();}catch(e){}})", null);
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            ViewGroup vg = (ViewGroup) web.getParent();
            if (vg != null) vg.removeView(web);
            web.destroy();
            web = null;
        }
        if (server != null) { server.stop(); server = null; }
        super.onDestroy();
    }
}
