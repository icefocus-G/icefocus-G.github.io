package com.icefocus.learningcourse;

import android.content.res.AssetManager;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.util.Locale;

/**
 * 只监听 127.0.0.1 的极简静态文件服务：把 assets/www 当成一个小型站点根。
 *
 * 存在的意义：WebView 直接 file:// 打开时，同源策略会把 localStorage / iframe /
 * fetch 全部打残，GitHub 同步也就无从谈起；走 http://127.0.0.1 就一切正常，
 * 而且完全离线 —— 断网也能做题，有网时再同步。
 */
public class LocalServer implements Runnable {

    private static final String TAG = "IF-Server";
    private static final String ROOT = "www";

    private final AssetManager assets;
    private final ServerSocket socket;
    private final Thread thread;
    private volatile boolean alive = true;

    public LocalServer(AssetManager am, int port) throws IOException {
        this.assets = am;
        this.socket = new ServerSocket(port, 16, InetAddress.getByName("127.0.0.1"));
        this.thread = new Thread(this, "IF-LocalServer");
        this.thread.setDaemon(true);
        this.thread.start();
    }

    public String getBaseUrl() {
        return "http://127.0.0.1:" + socket.getLocalPort() + "/";
    }

    public void stop() {
        alive = false;
        try { socket.close(); } catch (Exception ignored) { }
    }

    @Override
    public void run() {
        while (alive) {
            try {
                Socket client = socket.accept();
                try {
                    handle(client);
                } catch (Exception ignored) {
                } finally {
                    try { client.close(); } catch (Exception ignored) { }
                }
            } catch (Exception e) {
                if (!alive) break;
            }
        }
    }

    private void handle(Socket client) throws IOException {
        InputStream in = client.getInputStream();
        String head = readHead(in);
        if (head == null || head.length() == 0) return;

        String[] lines = head.split("\r\n");
        String req = lines.length > 0 ? lines[0] : "";
        String[] parts = req.split(" ");
        String method = parts.length > 0 ? parts[0] : "GET";
        String rawPath = parts.length > 1 ? parts[1] : "/";
        if (!"GET".equalsIgnoreCase(method)) {
            write(client, 405, "Method Not Allowed", mimeOf(""), new byte[0]);
            return;
        }

        String path = rawPath;
        int q = path.indexOf('?');
        if (q >= 0) path = path.substring(0, q);
        try {
            path = URLDecoder.decode(path, "UTF-8");
        } catch (Exception ignored) { }

        while (path.startsWith("/")) path = path.substring(1);
        if (path.length() == 0) path = "index.html";

        // 目录 → index.html
        if (!hasAsset(path)) {
            String idx = path.endsWith("/") ? path + "index.html" : path + "/index.html";
            if (hasAsset(idx.startsWith(ROOT + "/") ? idx : ROOT + "/" + idx)) {
                writeRedirect(client, "/" + (path.endsWith("/") ? path : path + "/"));
                return;
            }
        }

        String assetPath = ROOT + "/" + path;
        byte[] body = readAsset(assetPath);

        if (body == null) {
            byte[] nf = "<h1>404 Not Found</h1><p>Learning Course local assets.</p>".getBytes("UTF-8");
            write(client, 404, "Not Found", "text/html; charset=utf-8", nf);
            return;
        }
        write(client, 200, "OK", mimeOf(path), body);
    }

    /* assets/www 里的路径是否存在（Assets#list 按目录列举，文件名含空格也能正确识别） */
    private boolean hasAsset(String relPathNoRoot) {
        String p = relPathNoRoot.startsWith(ROOT + "/") ? relPathNoRoot.substring(ROOT.length() + 1) : relPathNoRoot;
        if (p.length() == 0) return true;
        String parent = null, name = p;
        int slash = p.lastIndexOf('/');
        if (slash >= 0) { parent = p.substring(0, slash); name = p.substring(slash + 1); }
        try {
            String[] list = assets.list(ROOT + (parent == null ? "" : "/" + parent));
            if (list != null) {
                for (String f : list) if (f.equals(name)) return true;
            }
            InputStream is = assets.open(ROOT + "/" + p);
            is.close();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private byte[] readAsset(String assetPath) {
        try {
            InputStream is = assets.open(assetPath);
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = is.read(buf)) > 0) bos.write(buf, 0, n);
            is.close();
            return bos.toByteArray();
        } catch (Exception e) {
            return null;
        }
    }

    private String readHead(InputStream in) throws IOException {
        ByteArrayOutputStream sb = new ByteArrayOutputStream();
        int b;
        int crlf = 0;
        while ((b = in.read()) != -1) {
            sb.write(b);
            if (b == '\r') continue;
            if (b == '\n') { crlf++; if (crlf >= 2) break; }
            else crlf = 0;
            if (sb.size() > 16384) break;
        }
        return new String(sb.toByteArray(), "UTF-8");
    }

    private void write(Socket client, int code, String reason, String mime, byte[] body) throws IOException {
        OutputStream os = client.getOutputStream();
        DataOutputStream out = new DataOutputStream(os);
        out.writeBytes("HTTP/1.1 " + code + " " + reason + "\r\n");
        out.writeBytes("Content-Type: " + mime + "\r\n");
        out.writeBytes("Content-Length: " + body.length + "\r\n");
        out.writeBytes("Cache-Control: no-cache, no-store, must-revalidate\r\n");
        out.writeBytes("Connection: close\r\n");
        out.writeBytes("Access-Control-Allow-Origin: *\r\n");
        out.writeBytes("\r\n");
        if (body.length > 0) out.write(body);
        out.flush();
    }

    private void writeRedirect(Socket client, String location) throws IOException {
        OutputStream os = client.getOutputStream();
        DataOutputStream out = new DataOutputStream(os);
        out.writeBytes("HTTP/1.1 302 Found\r\n");
        out.writeBytes("Location: " + location + "\r\n");
        out.writeBytes("Content-Length: 0\r\n");
        out.writeBytes("Connection: close\r\n");
        out.writeBytes("\r\n");
        out.flush();
    }

    private static String mimeOf(String name) {
        String n = name.toLowerCase(Locale.US);
        if (n.endsWith(".html") || n.endsWith(".htm")) return "text/html; charset=utf-8";
        if (n.endsWith(".js"))   return "application/javascript; charset=utf-8";
        if (n.endsWith(".css"))  return "text/css; charset=utf-8";
        if (n.endsWith(".json")) return "application/json; charset=utf-8";
        if (n.endsWith(".webmanifest") || n.endsWith(".manifest"))
                                 return "application/manifest+json; charset=utf-8";
        if (n.endsWith(".svg"))  return "image/svg+xml";
        if (n.endsWith(".png"))  return "image/png";
        if (n.endsWith(".jpg") || n.endsWith(".jpeg")) return "image/jpeg";
        if (n.endsWith(".gif"))  return "image/gif";
        if (n.endsWith(".webp")) return "image/webp";
        if (n.endsWith(".ico"))  return "image/x-icon";
        if (n.endsWith(".md") || n.endsWith(".txt")) return "text/plain; charset=utf-8";
        if (n.endsWith(".mp3"))  return "audio/mpeg";
        if (n.endsWith(".mp4"))  return "video/mp4";
        if (n.endsWith(".woff") || n.endsWith(".woff2")) return "font/woff2";
        return "application/octet-stream";
    }
}
