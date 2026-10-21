/* ================= Unity 交互课件 · 页面脚本 ================= */
(function () {
  'use strict';

  /* ---------------- 代码高亮 ---------------- */
  var KW = new Set(('abstract as base bool break byte case catch char checked class const continue ' +
    'decimal default delegate do double else enum event explicit extern false finally fixed float for ' +
    'foreach goto if implicit in int interface internal is lock long namespace new null object operator ' +
    'out override params private protected public readonly ref return sbyte sealed short sizeof ' +
    'stackalloc static string struct switch this throw true try typeof uint ulong unchecked unsafe ' +
    'ushort using virtual void volatile while var async await yield get set partial record init ' +
    'nameof when with dynamic global function let const of then end local').split(' '));

  var TYPES = new Set(('GameObject Transform Vector2 Vector3 Vector4 Quaternion Matrix4x4 Color Mathf ' +
    'Time Input Debug Application Resources SceneManager MonoBehaviour ScriptableObject ' +
    'Canvas RectTransform Sprite Texture2D Renderer Material Shader Animator Rigidbody Collider ' +
    'Addressables YooAsset AssetDatabase EditorWindow SerializeField JsonConvert JObject ' +
    'MessagePackSerializer UniTask Task List Dictionary Array String Int32 Single Boolean').split(' '));

  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var RE_TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|@?"(?:[^"]|"")*")|(\b\d+(?:\.\d+)?[fFdDmMlLuU]?\b|\b0x[0-9a-fA-F]+\b)|([A-Za-z_][A-Za-z0-9_]*)/g;

  function highlight(code) {
    var out = '', last = 0, m;
    RE_TOKEN.lastIndex = 0;
    while ((m = RE_TOKEN.exec(code)) !== null) {
      if (m.index > last) out += escHtml(code.slice(last, m.index));
      last = m.index + m[0].length;
      if (m[1]) {
        out += '<span class="c">' + escHtml(m[1]) + '</span>';
      } else if (m[2]) {
        out += '<span class="s">' + escHtml(m[2]) + '</span>';
      } else if (m[3]) {
        out += '<span class="n">' + escHtml(m[3]) + '</span>';
      } else if (m[4]) {
        var w = m[4];
        if (KW.has(w)) out += '<span class="k">' + w + '</span>';
        else if (TYPES.has(w)) out += '<span class="t">' + w + '</span>';
        else out += w;
      }
    }
    if (last < code.length) out += escHtml(code.slice(last));
    return out;
  }

  function paintAll() {
    document.querySelectorAll('pre.code > code').forEach(function (el) {
      if (el.dataset.hl) return;
      el.dataset.hl = '1';
      el.innerHTML = highlight(el.textContent);
    });
  }

  /* ---------------- 代码块：复制 / 展开 / 运行 ---------------- */
  function bindCode() {
    document.querySelectorAll('.cpair').forEach(function (pair) {
      var pre = pair.querySelector('pre.code');
      var codeEl = pre && pre.querySelector('code');
      if (!pre || !codeEl) return;

      var cp = pair.querySelector('.mini.copy');
      if (cp) {
        cp.addEventListener('click', function () {
          var txt = codeEl.textContent;
          var done = function () {
            var old = cp.textContent;
            cp.textContent = '已复制';
            setTimeout(function () { cp.textContent = old; }, 1200);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(txt).then(done, function () { fallbackCopy(txt, done); });
          } else {
            fallbackCopy(txt, done);
          }
        });
      }

      if (pre.scrollHeight > 580) {
        var more = document.createElement('button');
        more.className = 'more';
        more.textContent = '展开全部 ' + codeEl.textContent.split('\n').length + ' 行';
        more.addEventListener('click', function () {
          var open = pre.classList.toggle('expand');
          more.textContent = open ? '收起' : '展开全部 ' + codeEl.textContent.split('\n').length + ' 行';
        });
        pair.appendChild(more);
      }

      var run = pair.querySelector('.mini.run');
      if (run) {
        run.addEventListener('click', function () { runCode(pair, codeEl.textContent, run); });
      }
    });
  }

  function fallbackCopy(txt, done) {
    var ta = document.createElement('textarea');
    ta.value = txt;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { }
    document.body.removeChild(ta);
  }

  function apiBase() {
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      if (location.port === '7788') return '';
    }
    return 'http://localhost:7788';
  }

  /* 只有本机 / 局域网才可能连得上 runner.js。
     放到 GitHub Pages 这类线上静态托管时，浏览器会以 mixed-content / 私有网络策略
     直接掐掉对 localhost 的请求，硬发只会弹一句看不懂的 Failed to fetch，
     所以先判断环境，线上直接给出人话说明。 */
  function isLocalEnv() {
    if (location.protocol === 'file:') return true;
    var h = location.hostname;
    if (h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h === '::1') return true;
    return /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h);
  }

  function runCode(pair, code, btn) {
    var out = pair.querySelector('.cout');
    if (!out) {
      out = document.createElement('pre');
      out.className = 'cout';
      pair.appendChild(out);
    }
    out.hidden = false;

    if (!isLocalEnv()) {
      out.className = 'cout bad';
      out.textContent = 'ⓘ 这里是线上静态版，没有 .NET 编译器，C# 不能在这一页真跑。\n\n' +
        '想真跑的话：把课件下载到本机 → 双击 start.command（或 node runner.js 7788）' +
        '→ 从 http://localhost:7788/ 打开同一页。\n\n' +
        '现在也可以点代码框右上角的「复制」，粘到 Unity 里验证。';
      return;
    }

    out.className = 'cout busy';
    out.textContent = '⏳ 正在编译并运行（首次需还原 NuGet 包，约 3~20 秒）…';
    btn.disabled = true;

    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 60000);

    fetch(apiBase() + '/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code }),
      signal: ctrl.signal
    }).then(function (r) { return r.json(); }).then(function (d) {
      clearTimeout(timer);
      btn.disabled = false;
      var stdout = d.stdout || d.output || '';
      var stderr = d.stderr || d.error || '';
      if (d.ok) {
        out.className = 'cout';
        out.textContent = (stdout || '（无输出）') + '\n\n[退出码 ' + (d.exit != null ? d.exit : d.code) + ' · ' + d.ms + ' ms]';
      } else {
        out.className = 'cout bad';
        var msg = (stderr && stderr !== stdout) ? (stderr + '\n' + stdout) : (stdout || stderr || '运行失败');
        out.textContent = msg.trim() + (d.ms ? '\n\n[' + d.ms + ' ms]' : '');
      }
    }).catch(function (e) {
      clearTimeout(timer);
      btn.disabled = false;
      out.className = 'cout bad';
      out.textContent = '✗ 连不上本地运行服务（' + apiBase() + '）。\n\n' +
        '启动方式：在课件目录双击 start.command，或执行  node runner.js 7788\n' +
        '然后从 http://localhost:7788/ 打开本页。\n\n' + e.message;
    });
  }

  /* ---------------- 目录高亮 ---------------- */
  function bindToc() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.tocbox .toc'));
    if (!links.length) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var heads = Array.prototype.slice.call(document.querySelectorAll('.hd'));
    var cur = null;

    function onScroll() {
      var top = window.scrollY + 90, pick = null;
      for (var i = 0; i < heads.length; i++) {
        if (heads[i].offsetTop <= top) pick = heads[i]; else break;
      }
      if (!pick) pick = heads[0];
      var a = pick && map[pick.id];
      if (a && a !== cur) {
        if (cur) cur.classList.remove('on');
        a.classList.add('on');
        cur = a;
        var sb = document.querySelector('.side');
        if (sb && sb.scrollHeight > sb.clientHeight) {
          var r = a.getBoundingClientRect(), sr = sb.getBoundingClientRect();
          if (r.top < sr.top + 40 || r.bottom > sr.bottom - 40) {
            sb.scrollTop += r.top - sr.top - sb.clientHeight / 2;
          }
        }
      }
      var tt = document.getElementById('totop');
      if (tt) tt.classList.toggle('on', window.scrollY > 600);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- 图片放大 ---------------- */
  function bindZoom() {
    document.addEventListener('click', function (e) {
      var img = e.target.closest && e.target.closest('.fig img, .tb img');
      if (img) {
        var ov = document.createElement('div');
        ov.className = 'zoom';
        var big = document.createElement('img');
        big.src = img.src;
        ov.appendChild(big);
        ov.addEventListener('click', function () { ov.remove(); });
        document.body.appendChild(ov);
        return;
      }
      var z = e.target.closest && e.target.closest('.zoom');
      if (z) z.remove();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var z = document.querySelector('.zoom');
        if (z) z.remove();
      }
    });
  }

  /* ---------------- 侧栏开关 ---------------- */
  function bindNav() {
    var btn = document.getElementById('btnNav');
    var side = document.getElementById('side');
    if (btn && side) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        side.classList.toggle('open');
      });
      document.addEventListener('click', function (e) {
        if (side.classList.contains('open') && !side.contains(e.target)) side.classList.remove('open');
      });
    }
    var tt = document.getElementById('totop');
    if (tt) tt.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------- 交互演示挂载 ---------------- */
  function mountDemos() {
    document.querySelectorAll('[data-demo]').forEach(function (root) {
      var key = root.getAttribute('data-demo');
      var fn = window.DEMOS && window.DEMOS[key];
      if (typeof fn !== 'function') {
        var b = root.querySelector('.demo-body');
        if (b) b.innerHTML = '<div class="demo-loading">未找到演示实现：' + key + '</div>';
        return;
      }
      try {
        fn(root);
      } catch (err) {
        var bb = root.querySelector('.demo-body');
        if (bb) bb.innerHTML = '<div class="demo-loading">演示初始化失败：' + err.message + '</div>';
        console.error('[demo ' + key + ']', err);
      }
    });
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    paintAll();
    bindCode();
    bindToc();
    bindZoom();
    bindNav();
    mountDemos();
    document.documentElement.dataset.ready = '1';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
