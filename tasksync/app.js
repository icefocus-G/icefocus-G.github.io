/* ============================================================
   任务同步站 · 前端逻辑
   - 云服务：WorkBuddy Cloud SDK（Auth + Database）
   - 本机数据：collector/collect.js 提供的 127.0.0.1 桥
   ============================================================ */
(() => {
  'use strict';

  const CFG = window.PUBLIC_CONFIG || {};
  const BRIDGE = (window.LOCAL_BRIDGE || 'http://127.0.0.1:8787').replace(/\/+$/, '');
  const REFRESH_MS = 30000;
  const LOCAL_SYNC_MS = 120000; // 页面开着时，每 2 分钟悄悄把本机新任务送上去
  const LOCAL_SYNC_MIN_GAP = 25000; // 两次自动同步之间的最小间隔，防止切标签页时抖动

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  // ------------------------------------------------------------ 错误可见化
  // 之前报错只进控制台，用户只能看到"没反应"。统一弹出来，并且可以一键复制。
  const shownErrors = new Set();

  function showFatal(msg) {
    const box = document.querySelector('#fatal');
    const slot = document.querySelector('#fatalMsg');
    if (!box || !slot) return;
    const text = String(msg || '未知错误').slice(0, 600);
    if (/AbortError|The user aborted a request/i.test(text)) return;
    if (shownErrors.has(text)) return; // 同一条错误只弹一次，避免刷屏
    shownErrors.add(text);
    slot.textContent = text;
    box.classList.remove('hidden');
  }

  window.addEventListener('error', (e) => {
    const where = e && e.filename ? ` @${String(e.filename).split('/').pop()}:${e.lineno || 0}` : '';
    showFatal(`${(e && e.message) || '脚本错误'}${where}`);
  });

  window.addEventListener('unhandledrejection', (e) => {
    const r = e && e.reason;
    const msg = r && r.message ? r.message : String(r);
    showFatal(`未处理的异步错误：${msg}`);
  });

  const STATUS = {
    pending: { label: '待开始', cls: 'badge-pending', color: '#a39c8d' },
    in_progress: { label: '进行中', cls: 'badge-progress', color: '#35558f' },
    completed: { label: '已完成', cls: 'badge-done', color: '#2e8571' },
    cancelled: { label: '已取消', cls: 'badge-cancel', color: '#a9453c' },
  };
  const ORDER = ['pending', 'in_progress', 'completed', 'cancelled'];

  // ------------------------------------------------------------ 云客户端
  let cloud = null;
  try {
    if (window.WorkBuddyCloud && CFG.endpoint && CFG.publishableKey) {
      cloud = window.WorkBuddyCloud.createWorkBuddyCloud({
        endpoint: CFG.endpoint,
        oauthRelayBaseUrl: CFG.oauthRelayBaseUrl,
        publishableKey: CFG.publishableKey,
      });
    }
  } catch (err) {
    console.error('[cloud] 初始化失败', err && err.message);
  }

  // ------------------------------------------------------------ 状态
  const state = {
    session: null,
    tasks: [],
    devices: [],
    spaces: [],
    files: [],
    loading: true,
    view: localStorage.getItem('ts_view') === 'board' ? 'board' : 'list',
    sort: localStorage.getItem('ts_sort') || 'updated',
    filter: { status: 'all', device: 'all', space: 'all', q: '', sharedOnly: false },
    selectMode: false,
    selected: new Set(),
    editingSpace: null,
    uploadFiles: true,
    lastSync: null,
    pending: null,
    busy: false,
    currentTask: null,
  };
  let pollTimer = null;
  let syncTimer = null;
  let lastLocalSyncAt = 0;

  const SPACE_COLORS = ['#2e8571', '#35558f', '#96661a', '#8f4560', '#5b6b3a', '#7a5c9e'];

  // ------------------------------------------------------------ 小工具
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function parseTime(v) {
    if (!v) return 0;
    const t = Date.parse(v);
    return Number.isNaN(t) ? 0 : t;
  }

  function relTime(v) {
    const t = parseTime(v);
    if (!t) return '—';
    const diff = Date.now() - t;
    if (diff < 0) return '刚刚';
    if (diff < 60e3) return '刚刚';
    if (diff < 3600e3) return `${Math.floor(diff / 60e3)} 分钟前`;
    if (diff < 86400e3) return `${Math.floor(diff / 3600e3)} 小时前`;
    if (diff < 7 * 86400e3) return `${Math.floor(diff / 86400e3)} 天前`;
    const d = new Date(t);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear() === new Date().getFullYear() ? '' : `${d.getFullYear()}/`;
    return `${yyyy}${mm}/${dd}`;
  }

  function fullTime(v) {
    const t = parseTime(v);
    if (!t) return '—';
    const d = new Date(t);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  function toast(message, kind) {
    const el = document.createElement('div');
    el.className = 'toast' + (kind === 'err' ? ' err' : '');
    el.textContent = message;
    $('#toasts').appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .25s, transform .25s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(6px)';
      setTimeout(() => el.remove(), 260);
    }, kind === 'err' ? 4200 : 2600);
  }

  function setSyncState(kind, text) {
    const bar = $('#syncBar');
    bar.className = 'sync-bar' + (kind ? ` ${kind}` : '');
    $('#syncText').textContent = text;
  }

  function debounce(fn, wait) {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  // ------------------------------------------------------------ 账号空间
  function spaceOf(wbUserId) {
    if (!wbUserId) return null;
    const found = state.spaces.find((s) => s.wb_user_id === wbUserId);
    if (found) return found;
    return { wb_user_id: wbUserId, label: null, color: null, share_default: 'all' };
  }

  function spaceLabel(wbUserId) {
    if (!wbUserId) return '未知账号';
    const space = spaceOf(wbUserId);
    return space && space.label ? space.label : `账号 ${wbUserId.slice(0, 6)}`;
  }

  function spaceColor(wbUserId) {
    if (!wbUserId) return '#8c877d';
    const space = spaceOf(wbUserId);
    if (space && space.color) return space.color;
    let hash = 0;
    for (let i = 0; i < wbUserId.length; i += 1) hash = (hash * 31 + wbUserId.charCodeAt(i)) % 9973;
    return SPACE_COLORS[hash % SPACE_COLORS.length];
  }

  function fmtSize(bytes) {
    const n = Number(bytes) || 0;
    if (n < 1024) return `${n} B`;
    if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / 1048576).toFixed(1)} MB`;
  }

  function fileIcon(name) {
    const ext = String(name).split('.').pop().toLowerCase();
    const map = {
      html: 'HTML',
      htm: 'HTML',
      md: 'MD',
      json: 'JSON',
      js: 'JS',
      css: 'CSS',
      csv: 'CSV',
      txt: 'TXT',
      png: 'IMG',
      jpg: 'IMG',
      jpeg: 'IMG',
      gif: 'IMG',
      webp: 'IMG',
      svg: 'SVG',
      pdf: 'PDF',
      zip: 'ZIP',
      docx: 'DOC',
      xlsx: 'XLS',
      pptx: 'PPT',
    };
    return map[ext] || 'FILE';
  }

  function safeStorageName(fileUid) {
    return String(fileUid)
      .replace(/[^a-zA-Z0-9._-]+/g, '_')
      .slice(-120);
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  // ------------------------------------------------------------ 鉴权
  async function boot() {
    if (!cloud) {
      $('#boot').innerHTML =
        '<div class="boot-mark"></div><div class="boot-text">登录组件加载失败，请检查网络后刷新页面</div>';
      return;
    }
    try {
      await restoreAuth();
    } catch (err) {
      showLogin(err && err.message ? err.message : '初始化失败，请刷新重试。');
    }
  }

  async function restoreAuth() {
    const url = new URL(location.href);
    const hasCallback = url.searchParams.has('code') || url.searchParams.has('error');

    if (hasCallback) {
      // 中转回调不一定带回 provider 参数，用发起前的记录兜底，避免误判为非法回调。
      const provider =
        url.searchParams.get('provider') || sessionStorage.getItem('wb_oauth_provider') || 'wechat';
      if (provider !== 'workbuddy' && provider !== 'wechat') {
        showLogin('登录回调缺少有效的登录方式，请重新登录。');
        return;
      }
      const handler = provider === 'workbuddy' ? cloud.auth.handleWorkBuddyCallback : cloud.auth.handleWechatWebCallback;
      if (typeof handler !== 'function') {
        showLogin('当前登录组件版本不支持该登录方式，请联系维护者。');
        return;
      }
      try {
        const { data: session, error } = await handler.call(cloud.auth);
        if (error) {
          showLogin(error.message || '登录失败，请重试。');
          return;
        }
        if (session) {
          ['code', 'state', 'provider', 'auth'].forEach((k) => url.searchParams.delete(k));
          history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
          sessionStorage.removeItem('wb_oauth_provider');
          markLoginSource(provider);
          await enterApp(session);
          return;
        }
      } catch (err) {
        showLogin(err && err.message ? err.message : '登录失败，请重试。');
        return;
      }
    }

    let session = null;
    try {
      const res = await cloud.auth.getSession();
      session = (res && res.data) || null;
    } catch {
      session = null;
    }
    if (session) {
      if (url.searchParams.has('auth')) {
        url.searchParams.delete('auth');
        history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
      }
      await enterApp(session);
      return;
    }

    showLogin();
    // 深链：?auth=wechat 直接唤起微信授权，省掉一次点击
    if (url.searchParams.get('auth') === 'wechat') wechatLogin({ auto: true });
  }

  // 记录本次登录用的是哪种方式，供侧栏显示（SDK 的 OAuth 用户不带 phone/email）
  function markLoginSource(provider) {
    try {
      localStorage.setItem('wb_login_source', provider);
    } catch {
      /* 隐私模式下忽略 */
    }
  }

  function loginSource(user) {
    let hint = '';
    try {
      hint = localStorage.getItem('wb_login_source') || '';
    } catch {
      hint = '';
    }
    const raw = (user && user.raw) || {};
    const declared = String(raw.provider || raw.provider_id || '').toLowerCase();
    if (declared.includes('wechat') || hint === 'wechat') return '微信登录';
    if (declared.includes('workbuddy') || hint === 'workbuddy') return 'WorkBuddy 登录';
    if (user && user.phone) return '手机号登录';
    if (user && user.email) return '邮箱登录';
    if (hint === 'phone') return '手机号登录';
    if (hint === 'email') return '邮箱登录';
    if (user && (user.avatarUrl || raw.avatar_url)) return '微信登录';
    return '已登录';
  }

  function showLogin(message) {
    $('#boot').classList.add('hidden');
    $('#app').classList.add('hidden');
    $('#login').classList.remove('hidden');
    showOriginWarn();
    if (message) {
      $('#phoneMsg').textContent = message;
      $('#phoneMsg').classList.remove('ok');
    }
  }

  // 云服务按「注册来源」放行：换个域名打开（比如 GitHub Pages）会一律 403。
  // 与其让人对着「登录失败」发呆，不如进页面就说清楚。
  function showOriginWarn() {
    const box = $('#originWarn');
    if (!box) return;
    const cfg = window.PUBLIC_CONFIG || {};
    let want = '';
    try {
      want = cfg.endpoint ? new URL(cfg.endpoint).origin : '';
    } catch {
      want = '';
    }
    if (!want || location.origin === want) {
      box.classList.add('hidden');
      box.textContent = '';
      return;
    }
    box.classList.remove('hidden');
    box.innerHTML = `当前域名 <code>${location.origin}</code> 不是这个应用的注册来源，登录和读写都会被拒绝（403 access_denied）。<br />
      请改用 <a href="${want}/">${want}</a> 打开；或在「设置—数据管理—应用」把当前域名加入允许来源。`;
  }

  async function enterApp(session) {
    state.session = session;
    $('#boot').classList.add('hidden');
    $('#login').classList.add('hidden');
    $('#app').classList.remove('hidden');
    renderMe();

    try {
      if (typeof cloud.auth.onAuthStateChange === 'function') {
        cloud.auth.onAuthStateChange((event, next) => {
          if (event === 'SIGNED_OUT') {
            state.session = null;
            stopPolling();
            showLogin();
          } else if (next) {
            state.session = next;
            renderMe();
          }
        });
      }
    } catch {
      /* 订阅失败不影响主流程 */
    }

    await loadAll();
    startPolling();
    autoSyncLocal();
  }

  function renderMe() {
    const user = (state.session && state.session.user) || {};
    const src = loginSource(user);
    const label = user.name || user.phone || user.email || '我的账号';
    $('#meName').textContent = label;

    const avatarEl = $('#meAvatar');
    const initial = String(label).trim().slice(0, 1).toUpperCase() || '·';
    if (user.avatarUrl) {
      avatarEl.textContent = '';
      avatarEl.style.setProperty('background-image', `url(${JSON.stringify(String(user.avatarUrl))})`);
      avatarEl.style.backgroundSize = 'cover';
      avatarEl.style.backgroundPosition = 'center';
    } else {
      avatarEl.textContent = initial;
      avatarEl.style.backgroundImage = '';
    }

    const isMaster = src === '微信登录';
    const badge = $('#meBadge');
    if (badge) badge.classList.toggle('hidden', !isMaster);
    $('#meSub').textContent = src;
  }

  // ------------------------------------------------------------ 登录交互
  const pending = { phone: null, email: null };

  function bindTabs() {
    $$('.tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        $$('.tab').forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
        const which = tab.dataset.tab;
        $('#phoneForm').classList.toggle('hidden', which !== 'phone');
        $('#emailForm').classList.toggle('hidden', which !== 'email');
      });
    });
  }

  function startCountdown(btn, seconds) {
    const original = btn.textContent;
    let left = seconds;
    btn.disabled = true;
    btn.textContent = `${left}s`;
    const timer = setInterval(() => {
      left -= 1;
      if (left <= 0) {
        clearInterval(timer);
        btn.disabled = false;
        btn.textContent = original;
      } else {
        btn.textContent = `${left}s`;
      }
    }, 1000);
  }

  async function sendCode(kind) {
    const msg = kind === 'phone' ? $('#phoneMsg') : $('#emailMsg');
    const btn = kind === 'phone' ? $('#phoneSend') : $('#emailSend');
    msg.textContent = '';
    msg.classList.remove('ok');

    if (kind === 'phone') {
      const phone = $('#phone').value.trim();
      if (!/^1\d{10}$/.test(phone)) {
        msg.textContent = '请输入正确的 11 位手机号';
        return;
      }
      btn.disabled = true;
      const { data, error } = await cloud.auth.sendOtp({ phone });
      btn.disabled = false;
      if (error) {
        msg.textContent = error.message || '验证码发送失败，请稍后再试';
        return;
      }
      pending.phone = { phone, verificationId: data.verificationId, isExistingUser: data.isExistingUser };
      msg.textContent = '验证码已发送';
      msg.classList.add('ok');
      startCountdown(btn, 60);
      $('#phoneCode').focus();
    } else {
      const email = $('#email').value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = '请输入正确的邮箱地址';
        return;
      }
      btn.disabled = true;
      const { data, error } = await cloud.auth.sendOtp({ email });
      btn.disabled = false;
      if (error) {
        msg.textContent = error.message || '验证码发送失败，请稍后再试';
        return;
      }
      pending.email = { email, verificationId: data.verificationId, isExistingUser: data.isExistingUser };
      msg.textContent = '验证码已发送';
      msg.classList.add('ok');
      startCountdown(btn, 60);
      $('#emailCode').focus();
    }
  }

  async function submitCode(kind) {
    const msg = kind === 'phone' ? $('#phoneMsg') : $('#emailMsg');
    const code = (kind === 'phone' ? $('#phoneCode') : $('#emailCode')).value.trim();
    const saved = pending[kind];

    if (!saved) {
      msg.textContent = '请先获取验证码';
      msg.classList.remove('ok');
      return;
    }
    if (!/^\d{4,8}$/.test(code)) {
      msg.textContent = '请输入收到的验证码';
      msg.classList.remove('ok');
      return;
    }

    const submit = kind === 'phone' ? $('#phoneSubmit') : $('#emailSubmit');
    submit.disabled = true;
    submit.textContent = '登录中…';

    const payload = {
      verificationId: saved.verificationId,
      isExistingUser: saved.isExistingUser,
      token: code,
    };
    if (kind === 'phone') payload.phone = saved.phone;
    else payload.email = saved.email;

    const { data, error } = await cloud.auth.verifyOtp(payload);
    submit.disabled = false;
    submit.textContent = '登录 / 注册';

    if (error) {
      msg.textContent = error.message || '验证码不正确，请重试';
      msg.classList.remove('ok');
      return;
    }
    pending[kind] = null;
    markLoginSource(kind === 'phone' ? 'phone' : 'email');
    const session = data.session || (await cloud.auth.getSession()).data;
    await enterApp(session);
  }

  async function wechatLogin(options) {
    const auto = Boolean(options && options.auto);
    const msg = $('#wechatMsg');
    const btn = $('#wechatLogin');
    const label = btn ? btn.querySelector('span') : null;

    if (msg) {
      msg.classList.remove('err');
      msg.textContent = '正在跳转微信授权…';
    }
    if (btn) btn.disabled = true;
    if (label) label.textContent = '正在跳转…';

    // 回调不一定带 provider，先记下这次用的是哪种登录
    try {
      sessionStorage.setItem('wb_oauth_provider', 'wechat');
    } catch {
      /* 隐私模式下忽略 */
    }

    const { data, error } = await cloud.auth.signInWithOAuth({
      provider: 'wechat',
      redirectTo: `${location.origin}/`,
    });

    if (error) {
      if (btn) btn.disabled = false;
      if (label) label.textContent = '微信扫码登录';
      if (msg) {
        msg.classList.add('err');
        msg.textContent = auto
          ? `微信授权未能发起：${error.message || '请重试'}`
          : error.message || '微信登录暂不可用，请改用手机号登录';
      }
      return;
    }
    location.assign(data.url);
  }

  // ------------------------------------------------------------ 数据读取
  async function loadTasks() {
    const { data, error } = await cloud.database
      .from('tasks')
      .select('*')
      .order('task_updated_at', { ascending: false, nullsFirst: false })
      .limit(1000);
    if (error) {
      setSyncState('err', '读取失败');
      toast(error.message || '任务读取失败', 'err');
      return false;
    }
    state.tasks = data || [];
    return true;
  }

  async function loadDevices() {
    const { data } = await cloud.database
      .from('devices')
      .select('*')
      .order('last_sync_at', { ascending: false, nullsFirst: false });
    state.devices = data || [];
  }

  async function loadSpaces() {
    const { data, error } = await cloud.database.from('spaces').select('*').order('created_at', { ascending: true });
    if (error) {
      state.spaces = [];
      return;
    }
    state.spaces = data || [];
  }

  async function loadFiles() {
    const { data, error } = await cloud.database
      .from('files')
      .select('*')
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(600);
    if (error) {
      state.files = [];
      return;
    }
    state.files = data || [];
  }

  async function loadAll() {
    state.loading = true;
    render();
    const ok = await loadTasks();
    await Promise.all([loadDevices(), loadSpaces(), loadFiles()]);
    state.loading = false;
    if (ok) setSyncState('', state.lastSync ? `已同步 · ${relTime(state.lastSync)}` : '已连接云端');
    render();
  }

  async function refreshQuiet() {
    if (document.hidden || !state.session) return;
    await loadTasks();
    await Promise.all([loadDevices(), loadSpaces(), loadFiles()]);
    render();
  }

  function startPolling() {
    stopPolling();
    pollTimer = setInterval(refreshQuiet, REFRESH_MS);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        refreshQuiet();
        autoSyncQuiet();
      }
    });
    // 页面开着不动也会周期性把本机新任务送上去；没变化时 pushSnapshot 会自动跳过写入
    syncTimer = setInterval(autoSyncQuiet, LOCAL_SYNC_MS);
  }

  function stopPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
    if (syncTimer) clearInterval(syncTimer);
    syncTimer = null;
  }

  // ------------------------------------------------------------ 渲染
  function visibleTasks() {
    const { status, device, space, q, sharedOnly } = state.filter;
    const keyword = q.trim().toLowerCase();
    let list = state.tasks;
    if (status !== 'all') list = list.filter((t) => t.status === status);
    if (device !== 'all') list = list.filter((t) => t.device_id === device);
    if (space !== 'all') list = list.filter((t) => (t.wb_user_id || 'unknown') === space);
    if (sharedOnly) list = list.filter((t) => t.shared);
    if (keyword) {
      list = list.filter((t) => {
        const hay = [t.subject, t.description, t.session_title, t.project, t.note, t.active_form]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(keyword);
      });
    }
    const copy = list.slice();
    if (state.sort === 'created') copy.sort((a, b) => parseTime(b.task_created_at) - parseTime(a.task_created_at));
    else copy.sort((a, b) => parseTime(b.task_updated_at) - parseTime(a.task_updated_at));
    return copy;
  }

  function baseTasks() {
    let list = state.tasks;
    if (state.filter.device !== 'all') list = list.filter((t) => t.device_id === state.filter.device);
    if (state.filter.space !== 'all') list = list.filter((t) => (t.wb_user_id || 'unknown') === state.filter.space);
    return list;
  }

  function counts() {
    const base = baseTasks();
    const out = { all: base.length, pending: 0, in_progress: 0, completed: 0, cancelled: 0, shared: 0 };
    base.forEach((t) => {
      if (out[t.status] !== undefined) out[t.status] += 1;
      if (t.shared) out.shared += 1;
    });
    return out;
  }

  function render() {
    renderStats();
    renderNav();
    renderSpaces();
    renderDevices();
    renderChips();
    renderTitle();
    renderContent();
    renderSelBar();
  }

  function renderTitle() {
    const map = {
      all: '全部任务',
      pending: '待开始',
      in_progress: '进行中',
      completed: '已完成',
      cancelled: '已取消',
    };
    $('#pageTitle').textContent = map[state.filter.status] || '全部任务';
    const c = counts();
    const deviceLabel =
      state.filter.device === 'all'
        ? '所有设备'
        : (state.devices.find((d) => d.device_id === state.filter.device) || {}).device_name || '指定设备';
    const spacePart = state.filter.space === 'all' ? '' : ` · ${spaceLabel(state.filter.space)}`;
    const sharedPart = state.filter.sharedOnly ? ' · 仅共享' : '';
    $('#pageSub').textContent = `${c.all} 个任务 · ${deviceLabel}${spacePart}${sharedPart}${
      state.lastSync ? ` · 本机同步于 ${relTime(state.lastSync)}` : ''
    }`;
  }

  function renderStats() {
    const c = counts();
    const done = c.completed;
    const active = c.pending + c.in_progress;
    const rate = done + active > 0 ? Math.round((done / (done + active)) * 100) : 0;
    const spaceCount = new Set(state.tasks.map((t) => t.wb_user_id).filter(Boolean)).size;
    const deviceCount = new Set(state.tasks.map((t) => t.device_id).filter(Boolean)).size;

    const cards = [
      { label: '任务总数', value: c.all, hint: `${spaceCount || 0} 个账号 · ${deviceCount || 1} 台设备` },
      { label: '进行中', value: c.in_progress, hint: `待开始 ${c.pending}`, accent: c.in_progress ? '#35558f' : null },
      { label: '已完成', value: done, hint: `完成率 ${rate}%`, accent: done ? '#2e8571' : null },
      { label: '共享中', value: c.shared, hint: `私有 ${c.all - c.shared}`, accent: c.shared ? '#96661a' : null, act: 'shared', active: state.filter.sharedOnly },
    ];

    $('#stats').innerHTML = cards
      .map(
        (card) => `
      <div class="stat ${card.act ? 'stat-click' : ''} ${card.active ? 'stat-active' : ''}" ${card.act ? `data-act="${card.act}"` : ''}>
        <div class="stat-top">${esc(card.label)}</div>
        <div class="stat-val" style="${card.accent ? `color:${card.accent}` : ''}">${card.value}</div>
        <div class="stat-hint">${esc(card.active ? '已筛选 · 点击取消' : card.hint)}</div>
      </div>`
      )
      .join('');
  }

  function renderNav() {
    const c = counts();
    $$('#statusNav .side-item').forEach((item) => {
      const key = item.dataset.status;
      item.setAttribute('aria-current', String(key === state.filter.status));
      const counter = item.querySelector('[data-count]');
      if (counter) counter.textContent = c[key] || 0;
    });
  }

  function renderSpaces() {
    const host = $('#spaceList');
    if (!host) return;

    const groups = new Map();
    state.tasks.forEach((t) => {
      const key = t.wb_user_id || 'unknown';
      const entry = groups.get(key) || { count: 0, shared: 0 };
      entry.count += 1;
      if (t.shared) entry.shared += 1;
      groups.set(key, entry);
    });
    state.spaces.forEach((s) => {
      if (!groups.has(s.wb_user_id)) groups.set(s.wb_user_id, { count: 0, shared: 0 });
    });

    const rows = [
      `<div class="space-row" data-space="all" aria-current="${state.filter.space === 'all'}">
         <span class="space-dot" style="background:#8c877d"></span>
         <button class="space-name" data-space="all">全部账号</button>
         <span class="side-count">${state.tasks.length}</span>
       </div>`,
    ];

    Array.from(groups.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .forEach(([id, entry]) => {
        const shareHint = entry.shared ? `共享 ${entry.shared}` : '全私有';
        rows.push(
          `<div class="space-row" data-space="${esc(id)}" aria-current="${state.filter.space === id}">
             <span class="space-dot" style="background:${spaceColor(id)}"></span>
             <button class="space-name" data-space="${esc(id)}" title="${esc(shareHint)}">${esc(spaceLabel(id))}</button>
             <span class="side-count">${entry.count}</span>
             <button class="space-gear" data-gear="${esc(id)}" title="账号设置">⚙</button>
           </div>`
        );
      });

    host.innerHTML = rows.join('');
  }

  function renderSelBar() {
    const bar = $('#selBar');
    if (!bar) return;
    bar.classList.toggle('hidden', !state.selectMode);
    const btn = $('#selectBtn');
    if (btn) btn.classList.toggle('on', state.selectMode);
    if (!state.selectMode) return;
    $('#selCount').textContent = `已选 ${state.selected.size} 项`;
    ['#selShare', '#selUnshare', '#selExport'].forEach((sel) => {
      const el = $(sel);
      if (el) el.disabled = state.selected.size === 0;
    });
  }

  function renderDevices() {
    const host = $('#deviceList');
    const items = [];
    items.push(
      `<button class="device-line" data-device="all" aria-current="${state.filter.device === 'all'}">
         <span class="device-glyph">◈</span>所有设备
       </button>`
    );
    const grouped = new Map();
    state.tasks.forEach((t) => {
      if (!t.device_id) return;
      const entry = grouped.get(t.device_id) || { name: t.device_name || '未知设备', count: 0 };
      entry.count += 1;
      grouped.set(t.device_id, entry);
    });
    grouped.forEach((entry, id) => {
      items.push(
        `<button class="device-line" data-device="${esc(id)}" aria-current="${state.filter.device === id}">
           <span class="device-glyph">▢</span>
           <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(entry.name)}</span>
           <span class="side-count">${entry.count}</span>
         </button>`
      );
    });
    if (grouped.size === 0) {
      items.push('<div style="font-size:12px;color:#7d776b;padding:8px 10px">还没有同步过设备</div>');
    }
    host.innerHTML = items.join('');
    host.querySelectorAll('[data-device]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.filter.device = btn.dataset.device;
        render();
      });
    });
  }

  function renderChips() {
    const c = counts();
    const chips = [{ key: 'all', label: '全部', n: c.all }].concat(
      ORDER.map((k) => ({ key: k, label: STATUS[k].label, n: c[k] }))
    );
    $('#statusChips').innerHTML = chips
      .map(
        (chip) =>
          `<button class="chip" data-chip="${chip.key}" aria-pressed="${state.filter.status === chip.key}">
             ${chip.label}<span class="chip-count">${chip.n}</span>
           </button>`
      )
      .join('');
    $$('#statusChips .chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.filter.status = btn.dataset.chip;
        render();
      });
    });
  }

  function taskRow(task) {
    const st = STATUS[task.status] || STATUS.pending;
    const done = task.status === 'completed';
    const selected = state.selected.has(task.id);
    const badges = [];

    if (task.wb_user_id) {
      badges.push(
        `<span class="badge badge-soft"><span class="dot" style="background:${spaceColor(task.wb_user_id)}"></span>${esc(
          spaceLabel(task.wb_user_id)
        )}</span>`
      );
    }
    if (task.device_name) badges.push(`<span class="badge badge-soft">${esc(task.device_name)}</span>`);
    if (task.source === 'manual') badges.push('<span class="badge badge-soft">手动</span>');
    if (!task.shared) badges.push('<span class="badge badge-soft">私有</span>');
    if (task.note) badges.push('<span class="badge badge-note">有备注</span>');

    return `
      <div class="task ${done ? 'done' : ''} ${selected ? 'sel-on' : ''}" data-id="${task.id}">
        ${
          state.selectMode
            ? `<button class="sel-box ${selected ? 'on' : ''}" data-act="sel" data-id="${task.id}" aria-label="选择">
                 <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6">
                   <path d="m5 12.5 4.5 4.5L19 6.5" stroke-linecap="round" stroke-linejoin="round" />
                 </svg>
               </button>`
            : ''
        }
        <button class="task-check ${done ? 'on' : ''}" data-act="toggle" data-id="${task.id}" title="标记完成">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4">
            <path d="m5 12.5 4.5 4.5L19 6.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <div class="task-body">
          <div class="task-title">${esc(task.subject)}</div>
          ${task.description ? `<div class="task-desc">${esc(task.description)}</div>` : ''}
          <div class="task-meta">
            <span class="badge ${st.cls}"><span class="dot"></span>${st.label}</span>
            ${badges.join('')}
          </div>
        </div>
        <div class="task-right">
          <span class="time">${relTime(task.task_updated_at || task.task_created_at)}</span>
        </div>
      </div>`;
  }

  function listView(list) {
    if (state.sort === 'session') {
      const groups = new Map();
      list.forEach((t) => {
        const key = t.session_title || `手动添加`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(t);
      });
      return Array.from(groups.entries())
        .map(([title, rows]) => {
          const project = rows[0] && rows[0].project ? rows[0].project : '';
          return `
            <div class="group">
              <div class="group-head">
                <span class="group-title">${esc(title)}</span>
                ${project ? `<span class="group-meta">${esc(project)}</span>` : ''}
                <span class="group-line"></span>
                <span class="group-count">${rows.length}</span>
              </div>
              <div class="list">${rows.map(taskRow).join('')}</div>
            </div>`;
        })
        .join('');
    }
    return `<div class="list">${list.map(taskRow).join('')}</div>`;
  }

  function boardView(list) {
    const mobileActive = state.filter.status === 'all' ? 'pending' : state.filter.status;
    return `<div class="board">${ORDER.map((key) => {
      const rows = list.filter((t) => t.status === key);
      const st = STATUS[key];
      const cards = rows.length
        ? rows
            .map(
              (t) => `
          <div class="kcard" data-id="${t.id}">
            <div class="kcard-title">${esc(t.subject)}</div>
            <div class="kcard-foot">
              <span>${esc(t.device_name || '本机')}</span>
              <span class="time">${relTime(t.task_updated_at || t.task_created_at)}</span>
            </div>
          </div>`
            )
            .join('')
        : '<div class="col-empty">暂无任务</div>';
      return `
        <div class="col ${key === mobileActive ? 'active-mobile' : ''}">
          <div class="col-head">
            <span class="dot" style="width:6px;height:6px;border-radius:50%;background:${st.color}"></span>
            ${st.label}
            <span class="badge">${rows.length}</span>
          </div>
          <div class="col-body">${cards}</div>
        </div>`;
    }).join('')}</div>`;
  }

  function renderContent() {
    const host = $('#content');
    if (state.loading) {
      host.innerHTML = `<div class="skeleton">
        ${[1, 2, 3, 4]
          .map(
            () => `<div class="sk-row"><div class="sk" style="width:18px;height:18px;border-radius:50%"></div>
          <div style="flex:1"><div class="sk" style="height:13px;width:62%"></div>
          <div class="sk" style="height:10px;width:88%;margin-top:8px"></div></div></div>`
          )
          .join('')}
      </div>`;
      return;
    }

    const list = visibleTasks();
    if (!list.length) {
      const hasAny = state.tasks.length > 0;
      host.innerHTML = hasAny
        ? `<div class="empty">
             <div class="empty-icon">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                 <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" stroke-linecap="round" />
               </svg>
             </div>
             <h3>没有符合条件的任务</h3>
             <p>换个状态或设备看看，或者清空搜索关键词。</p>
             <button class="btn btn-sm" data-act="reset-filter">清除筛选</button>
           </div>`
        : `<div class="empty">
             <div class="empty-icon">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                 <path d="M4 7h16M4 12h16M4 17h10" stroke-linecap="round" />
               </svg>
             </div>
             <h3>还没有同步过任务</h3>
             <p>在装有 WorkBuddy 的电脑上启动采集器，然后点「同步本机任务」，这里的看板就会亮起来。</p>
             <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
               <button class="btn btn-accent btn-sm" data-act="open-sync">同步本机任务</button>
               <button class="btn btn-sm" data-act="new">新建一个任务</button>
             </div>
           </div>`;
      return;
    }

    host.innerHTML = state.view === 'board' ? boardView(list) : listView(list);
  }

  // ------------------------------------------------------------ 交互
  function toggleSelected(rawId) {
    const id = Number(rawId);
    if (state.selected.has(id)) state.selected.delete(id);
    else state.selected.add(id);
    render();
  }

  function openDrawer(task) {
    state.currentTask = task;
    const st = STATUS[task.status] || STATUS.pending;
    const files = state.files.filter((f) => f.session_id === task.session_id);
    $('#drawerTitle').textContent = task.subject;
    $('#drawerBody').innerHTML = `
      <div class="section-label">状态</div>
      <div class="status-pick">
        ${ORDER.map(
          (key) =>
            `<button data-set-status="${key}" aria-pressed="${task.status === key}">${STATUS[key].label}</button>`
        ).join('')}
      </div>

      <div class="section-label">任务描述</div>
      <div class="desc-box">${task.description ? esc(task.description) : '<span style="color:var(--ink-4)">没有填写描述</span>'}</div>

      <div class="section-label">我的备注</div>
      <textarea class="input" id="noteInput" rows="3" placeholder="记录进展、卡点、下一步…">${esc(task.note || '')}</textarea>

      <div class="section-label">共享与移交</div>
      <div class="share-row">
        <div style="flex: 1">
          <b>允许其他账号取用</b>
          <p>${task.shared ? '已进入共享池，可在主账号下勾选后导出' : '仅自己可见，不会出现在移交清单'}</p>
        </div>
        <button class="switch ${task.shared ? 'on' : ''}" data-act="toggle-share" aria-label="切换共享"></button>
      </div>

      <div class="section-label">
        会话产物 · ${files.length} 个
        ${files.length ? '<button class="btn btn-sm" data-act="upload-all" style="float:right;margin-top:-4px">全部上传</button>' : ''}
      </div>
      ${
        files.length
          ? files
              .slice(0, 40)
              .map(
                (f) => `
        <div class="file-row">
          <div class="file-ico">${fileIcon(f.name)}</div>
          <div style="flex: 1; min-width: 0">
            <div class="file-name" title="${esc(f.name)}">${esc(f.name)}</div>
            <div class="file-meta">${fmtSize(f.size)} · ${f.uploaded ? '已上传' : '待上传'}${f.shared ? '' : ' · 私有'}</div>
          </div>
          <button class="btn btn-sm" data-file-action="${f.uploaded ? 'download' : 'upload'}" data-file-id="${f.id}">
            ${f.uploaded ? '下载' : '上传'}
          </button>
        </div>`
              )
              .join('')
          : '<p style="font-size: 12.5px; color: var(--ink-4)">这个会话还没有登记产物文件。</p>'
      }
      ${files.length > 40 ? `<p style="font-size: 11.5px; color: var(--ink-4); margin-top: 8px">仅显示前 40 个，共 ${files.length} 个</p>` : ''}

      <div class="section-label">来源</div>
      <dl class="kv">
        <dt>会话</dt><dd>${esc(task.session_title || '—')}</dd>
        <dt>项目</dt><dd>${esc(task.project || '—')}</dd>
        <dt>设备</dt><dd>${esc(task.device_name || '—')}</dd>
        <dt>类型</dt><dd>${task.source === 'manual' ? '手动添加' : 'WorkBuddy 任务'}</dd>
        <dt>创建</dt><dd>${fullTime(task.task_created_at)}</dd>
        <dt>更新</dt><dd>${fullTime(task.task_updated_at || task.task_created_at)}</dd>
      </dl>`;

    $('#drawerDelete').hidden = task.source !== 'manual';
    const mask = $('#drawerMask');
    mask.classList.remove('hidden');
    const drawer = $('#drawer');
    drawer.classList.remove('hidden');
    requestAnimationFrame(() => {
      mask.classList.add('show');
      drawer.classList.add('show');
    });
    drawer.setAttribute('aria-hidden', 'false');

    $$('#drawerBody [data-set-status]').forEach((btn) => {
      btn.addEventListener('click', () => changeStatus(task, btn.dataset.setStatus));
    });

    const shareBtn = $('#drawerBody [data-act="toggle-share"]');
    if (shareBtn) shareBtn.addEventListener('click', () => toggleShare(task));

    $$('#drawerBody [data-file-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const file = state.files.find((f) => String(f.id) === String(btn.dataset.fileId));
        if (!file) return;
        if (btn.dataset.fileAction === 'upload') uploadFile(file, btn);
        else downloadFile(file);
      });
    });

    const uploadAll = $('#drawerBody [data-act="upload-all"]');
    if (uploadAll) uploadAll.addEventListener('click', () => uploadAllFiles(files, uploadAll));
  }

  function closeDrawer() {
    const drawer = $('#drawer');
    const mask = $('#drawerMask');
    drawer.classList.remove('show');
    mask.classList.remove('show');
    drawer.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      drawer.classList.add('hidden');
      mask.classList.add('hidden');
    }, 220);
    state.currentTask = null;
  }

  async function changeStatus(task, status) {
    const patch = { status, status_locked: true, updated_at: new Date().toISOString() };
    const { data, error } = await cloud.database.from('tasks').update(patch).eq('id', task.id).select();
    if (error) {
      toast(error.message || '状态更新失败', 'err');
      return;
    }
    if (!data || !data.length) {
      toast('没有改动生效，可能不是你名下的任务', 'err');
      return;
    }
    const idx = state.tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) state.tasks[idx] = { ...state.tasks[idx], ...patch };
    toast(`已标记为「${STATUS[status].label}」`);
    render();
    if (state.currentTask && state.currentTask.id === task.id) openDrawer(state.tasks[idx] || task);
  }

  async function toggleComplete(task) {
    const next = task.status === 'completed' ? 'pending' : 'completed';
    await changeStatus(task, next);
  }

  async function saveNote() {
    const task = state.currentTask;
    if (!task) return;
    const note = $('#noteInput').value;
    const { data, error } = await cloud.database
      .from('tasks')
      .update({ note, updated_at: new Date().toISOString() })
      .eq('id', task.id)
      .select();
    if (error) {
      toast(error.message || '备注保存失败', 'err');
      return;
    }
    if (!data || !data.length) {
      toast('备注没有保存成功', 'err');
      return;
    }
    const idx = state.tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) state.tasks[idx] = { ...state.tasks[idx], note };
    toast('备注已保存');
    render();
  }

  async function deleteTask(task) {
    if (!task || task.source !== 'manual') return;
    if (!window.confirm(`删除「${task.subject}」？此操作不可恢复。`)) return;
    const { data, error } = await cloud.database.from('tasks').delete().eq('id', task.id).select();
    if (error) {
      toast(error.message || '删除失败', 'err');
      return;
    }
    if (!data || !data.length) {
      toast('没有删除任何行', 'err');
      return;
    }
    state.tasks = state.tasks.filter((t) => t.id !== task.id);
    closeDrawer();
    toast('任务已删除');
    render();
  }

  // ------------------------------------------------------------ 共享 / 文件 / 移交
  function spacePolicy(wbUserId) {
    const space = spaceOf(wbUserId);
    return (space && space.share_default) || 'all';
  }

  function sessionUserId() {
    const user = state.session && state.session.user;
    return (user && (user.id || user.userId)) || null;
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        resolve(result.indexOf(',') >= 0 ? result.split(',')[1] : '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function setShared(ids, shared) {
    if (!ids.length) return 0;
    let changed = 0;
    for (const part of chunk(ids, 6)) {
      const results = await Promise.all(
        part.map((id) => cloud.database.from('tasks').update({ shared }).eq('id', id).select('id'))
      );
      for (const res of results) {
        if (res.error) throw res.error;
        changed += (res.data || []).length;
      }
    }
    state.tasks = state.tasks.map((t) => (ids.includes(t.id) ? { ...t, shared } : t));
    render();
    return changed;
  }

  async function toggleShare(task) {
    try {
      await setShared([task.id], !task.shared);
      const fresh = state.tasks.find((t) => t.id === task.id);
      if (fresh && state.currentTask && state.currentTask.id === task.id) openDrawer(fresh);
      toast(task.shared ? '已设为私有' : '已加入共享池');
    } catch (err) {
      toast(err.message || '共享状态更新失败', 'err');
    }
  }

  async function batchShare(shared) {
    const ids = Array.from(state.selected);
    if (!ids.length) return;
    try {
      const n = await setShared(ids, shared);
      toast(`${n} 个任务已${shared ? '加入共享池' : '设为私有'}`);
    } catch (err) {
      toast(err.message || '批量更新失败', 'err');
    }
  }

  async function uploadOne(meta, dbId) {
    const uid = sessionUserId();
    if (!uid) throw new Error('登录状态异常，请重新登录');
    if (!meta || !meta.file_uid) throw new Error('文件缺少标识');
    const rel = `task-files/${safeStorageName(meta.wb_user_id || 'unknown')}/${safeStorageName(meta.file_uid)}`;
    const path = cloud.storage.userPath(uid, rel);

    const res = await fetch(`${BRIDGE}/file?uid=${encodeURIComponent(meta.file_uid)}`);
    if (!res.ok) throw new Error('本机采集器没有响应，请确认它还在运行');
    const blob = await res.blob();

    const up = await cloud.storage.upload(path, blob, {
      contentType: meta.mime || blob.type || 'application/octet-stream',
      upsert: true,
    });
    if (up.error) throw up.error;

    const { error } = await cloud.database
      .from('files')
      .update({ storage_path: path, uploaded: true, size: blob.size, updated_at: new Date().toISOString() })
      .eq('id', dbId);
    if (error) throw error;
    return path;
  }

  async function uploadFile(file, btn) {
    if (!file) return;
    const original = btn ? btn.textContent : '';
    if (btn) {
      btn.disabled = true;
      btn.textContent = '上传中…';
    }
    try {
      await uploadOne(file, file.id);
      const idx = state.files.findIndex((f) => f.id === file.id);
      if (idx >= 0) state.files[idx] = { ...state.files[idx], uploaded: true };
      toast('文件已上传');
      const task = state.currentTask;
      if (task) openDrawer(task);
    } catch (err) {
      toast(err.message || '上传失败', 'err');
      if (btn) {
        btn.disabled = false;
        btn.textContent = original;
      }
    }
  }

  async function uploadAllFiles(files, btn) {
    const pending = files.filter((f) => !f.uploaded);
    if (!pending.length) {
      toast('这些文件都已经上传过了');
      return;
    }
    if (btn) {
      btn.disabled = true;
      btn.textContent = `0/${pending.length}`;
    }
    let ok = 0;
    let failed = 0;
    for (const file of pending) {
      try {
        await uploadOne(file, file.id);
        const idx = state.files.findIndex((f) => f.id === file.id);
        if (idx >= 0) state.files[idx] = { ...state.files[idx], uploaded: true };
        ok += 1;
      } catch {
        failed += 1;
      }
      if (btn) btn.textContent = `${ok + failed}/${pending.length}`;
    }
    toast(`上传完成：成功 ${ok}${failed ? ` · 失败 ${failed}` : ''}`, failed ? 'err' : undefined);
    if (state.currentTask) openDrawer(state.currentTask);
  }

  async function downloadFile(file) {
    if (!file || !file.uploaded || !file.storage_path) {
      toast('这个文件还没上传，先上传才能下载', 'err');
      return;
    }
    try {
      const res = await cloud.storage.download(file.storage_path);
      if (res.error) throw res.error;
      downloadBlob(res.data, file.name || 'download');
    } catch (err) {
      toast(err.message || '下载失败', 'err');
    }
  }

  function openSpaceModal(wbUserId) {
    state.editingSpace = wbUserId;
    const space = spaceOf(wbUserId);
    $('#spaceIdHint').textContent = `WorkBuddy 账号 ${wbUserId}`;
    $('#spaceLabel').value = (space && space.label) || '';
    const policy = (space && space.share_default) || 'all';
    $$('#spaceModal [data-policy]').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.policy === policy))
    );
    $('#spaceModal').classList.remove('hidden');
    setTimeout(() => $('#spaceLabel').focus(), 40);
  }

  async function saveSpace() {
    const wbUserId = state.editingSpace;
    if (!wbUserId) return;
    const label = $('#spaceLabel').value.trim() || null;
    const policyBtn = $('#spaceModal [data-policy][aria-pressed="true"]');
    const shareDefault = policyBtn ? policyBtn.dataset.policy : 'all';
    const color = spaceColor(wbUserId);
    const existing = state.spaces.find((s) => s.wb_user_id === wbUserId);

    const result = existing
      ? await cloud.database
          .from('spaces')
          .update({ label, share_default: shareDefault, color })
          .eq('id', existing.id)
      : await cloud.database
          .from('spaces')
          .insert({ wb_user_id: wbUserId, label, color, share_default: shareDefault });

    if (result.error) {
      toast(result.error.message || '保存失败', 'err');
      return;
    }
    await loadSpaces();
    $('#spaceModal').classList.add('hidden');
    render();
    toast('账号设置已保存');
  }

  async function exportHandoff() {
    const ids = Array.from(state.selected);
    const tasks = state.tasks.filter((t) => ids.includes(t.id));
    if (!tasks.length) return;

    const btn = $('#selExport');
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = '打包中…';

    try {
      const sessions = new Set(tasks.map((t) => t.session_id).filter(Boolean));
      const candidateFiles = state.files.filter((f) => sessions.has(f.session_id));
      const MAX_ONE = 5 * 1024 * 1024;
      const MAX_TOTAL = 40 * 1024 * 1024;
      let bytes = 0;
      const packed = [];

      for (const file of candidateFiles) {
        if (bytes >= MAX_TOTAL) break;
        let base64 = null;
        let skipped = null;
        if (!file.uploaded || !file.storage_path) skipped = '未上传，仅保留清单';
        else if (Number(file.size) > MAX_ONE) skipped = '超过 5MB，仅保留清单';
        else {
          try {
            const res = await cloud.storage.download(file.storage_path);
            if (res.error) skipped = '下载失败，仅保留清单';
            else {
              base64 = await blobToBase64(res.data);
              bytes += Math.round((base64.length * 3) / 4);
            }
          } catch {
            skipped = '下载失败，仅保留清单';
          }
        }
        packed.push({
          name: file.name,
          mime: file.mime,
          size: file.size,
          session_id: file.session_id,
          session_title: file.title,
          wb_user_id: file.wb_user_id,
          skipped,
          base64,
        });
      }

      const payload = {
        kind: 'wb-task-handoff',
        version: 1,
        exportedAt: new Date().toISOString(),
        from: {
          device: state.devices[0] ? state.devices[0].device_name : null,
          accounts: Array.from(new Set(tasks.map((t) => t.wb_user_id).filter(Boolean))),
        },
        tasks: tasks.map((t) => ({
          subject: t.subject,
          description: t.description,
          note: t.note,
          status: t.status,
          session_id: t.session_id,
          session_title: t.session_title,
          project: t.project,
          wb_user_id: t.wb_user_id,
          wb_user_label: t.wb_user_id ? spaceLabel(t.wb_user_id) : null,
          device_name: t.device_name,
          created_at: t.task_created_at,
          updated_at: t.task_updated_at,
        })),
        files: packed,
      };

      const stamp = new Date()
        .toISOString()
        .replace(/[-:]/g, '')
        .replace('T', '-')
        .slice(0, 13);
      downloadBlob(
        new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
        `handoff-${stamp}.json`
      );
      toast(`移交包已生成：${tasks.length} 个任务、${packed.filter((f) => f.base64).length} 个文件`);
    } catch (err) {
      toast(err.message || '导出失败', 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  }

  async function syncFiles(localFiles, silent) {
    if (!localFiles || !localFiles.length) return { uploaded: 0 };

    const existing = new Map();
    for (const part of chunk(
      localFiles.map((f) => f.file_uid),
      120
    )) {
      const { data, error } = await cloud.database
        .from('files')
        .select('id, file_uid, uploaded, size, storage_path')
        .in('file_uid', part);
      if (error) throw error;
      (data || []).forEach((row) => existing.set(row.file_uid, row));
    }

    const inserts = [];
    for (const file of localFiles) {
      if (existing.has(file.file_uid)) continue;
      const policy = spacePolicy(file.wb_user_id);
      inserts.push({
        file_uid: file.file_uid,
        wb_user_id: file.wb_user_id || null,
        session_id: file.session_id,
        name: file.name,
        title: file.title || file.name,
        mime: file.mime,
        size: file.size,
        local_path: file.local_path,
        shared: policy === 'all',
      });
    }

    for (const part of chunk(inserts, 150)) {
      const { data, error } = await cloud.database.from('files').insert(part).select('id, file_uid');
      if (error) throw error;
      (data || []).forEach((row) => existing.set(row.file_uid, row));
    }

    if (!state.uploadFiles) return { uploaded: 0, queued: inserts.length };

    const pending = localFiles.filter((f) => {
      const row = existing.get(f.file_uid);
      return row && !row.uploaded;
    });

    let uploaded = 0;
    let failed = 0;
    for (const file of pending) {
      const row = existing.get(file.file_uid);
      try {
        await uploadOne(file, row.id);
        uploaded += 1;
      } catch {
        failed += 1;
      }
      if (!silent) $('#bridgeState').textContent = `上传产物 ${uploaded + failed}/${pending.length}…`;
    }
    return { uploaded, failed, queued: inserts.length };
  }

  async function createTask() {
    const subject = $('#newSubject').value.trim();
    if (!subject) {
      toast('先写一个任务标题', 'err');
      return;
    }
    const description = $('#newDesc').value.trim() || null;
    const now = new Date().toISOString();
    const row = {
      task_uid: `manual:${crypto.randomUUID()}`,
      subject,
      description,
      status: 'pending',
      status_locked: true,
      source: 'manual',
      device_id: 'manual',
      device_name: '手动添加',
      session_title: '手动添加',
      task_created_at: now,
      task_updated_at: now,
      owner_name: (state.session && state.session.user && state.session.user.name) || null,
    };
    const { data, error } = await cloud.database.from('tasks').insert(row).select();
    if (error) {
      toast(error.message || '创建失败', 'err');
      return;
    }
    const created = data && data[0];
    if (created) {
      state.tasks.unshift(created);
      if (state.filter.status !== 'all' && state.filter.status !== 'pending') {
        state.filter.status = 'all';
      }
    }
    $('#newSubject').value = '';
    $('#newDesc').value = '';
    $('#newModal').classList.add('hidden');
    toast('任务已添加');
    render();
  }

  // ------------------------------------------------------------ 同步
  function normalizeLocal(doc, device) {
    const status = ORDER.includes(doc.status) ? doc.status : doc.cancelled ? 'cancelled' : 'pending';
    return {
      task_uid: String(doc.task_uid),
      session_id: doc.session_id || null,
      session_title: doc.session_title || 'WorkBuddy 任务',
      project: doc.project || null,
      wb_user_id: doc.wb_user_id || null,
      device_id: (device && device.id) || doc.device_id || 'unknown',
      device_name: (device && device.name) || doc.device_name || '未知设备',
      source: 'workbuddy',
      subject: String(doc.subject).slice(0, 500),
      description: doc.description || null,
      active_form: doc.active_form || null,
      status,
      cancelled: Boolean(doc.cancelled),
      cancel_reason: doc.cancel_reason || null,
      task_created_at: doc.task_created_at || null,
      task_updated_at: doc.task_updated_at || null,
      updated_at: new Date().toISOString(),
      owner_name: (state.session && state.session.user && state.session.user.name) || null,
    };
  }

  async function fetchExisting(uids) {
    const map = new Map();
    for (const part of chunk(uids, 120)) {
      const { data, error } = await cloud.database
        .from('tasks')
        .select('id, task_uid, status, status_locked, note, source, task_updated_at, subject, description')
        .in('task_uid', part);
      if (error) throw error;
      (data || []).forEach((row) => map.set(row.task_uid, row));
    }
    return map;
  }

  // ------------------------------------------------------------ 同步范围
  // 读到的数据先过一遍筛选：按账号、时间、产物文件类型。选择记在 localStorage，
  // 静默自动同步也跟着这套规则走，避免"手动选了、自动又全传"。
  const SCOPE_KEY = 'wb_sync_scope';
  const FILE_KINDS = [
    ['image', '图片'],
    ['doc', '文档'],
    ['data', '数据'],
    ['code', '代码'],
    ['other', '其他'],
  ];

  function loadScope() {
    try {
      const raw = JSON.parse(localStorage.getItem(SCOPE_KEY) || 'null');
      if (raw && typeof raw === 'object') {
        return {
          accounts: Array.isArray(raw.accounts) ? raw.accounts : null,
          days: Number(raw.days) || 0,
          files: raw.files !== false,
          types: Array.isArray(raw.types) ? raw.types : null,
        };
      }
    } catch {
      /* 用默认值 */
    }
    return { accounts: null, days: 0, files: true, types: null };
  }

  function saveScope(scope) {
    try {
      localStorage.setItem(SCOPE_KEY, JSON.stringify(scope));
    } catch {
      /* 忽略 */
    }
  }

  function fileKind(f) {
    const name = String((f && (f.name || f.title)) || '').toLowerCase();
    const mime = String((f && f.mime) || '');
    if (mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg|bmp|heic)$/.test(name)) return 'image';
    if (/\.(md|txt|docx?|pdf|rtf|pptx?|key|epub)$/.test(name)) return 'doc';
    if (/\.(csv|xlsx?|json|tsv|sql|db)$/.test(name)) return 'data';
    if (/\.(js|mjs|ts|jsx|tsx|py|go|rs|java|c|cc|cpp|h|cs|rb|php|sh|css|html?|vue|svelte|yml|yaml|toml)$/.test(name)) {
      return 'code';
    }
    return 'other';
  }

  function applyScope(payload, scope) {
    const s = scope || loadScope();
    const cutoff = s.days > 0 ? Date.now() - s.days * 86400000 : 0;
    const accOk = (id) => !s.accounts || s.accounts.includes(id || 'unknown');

    const tasks = (payload.tasks || []).filter((t) => {
      if (!accOk(t.wb_user_id)) return false;
      if (cutoff) {
        const ts = parseTime(t.task_updated_at);
        if (!ts || ts < cutoff) return false;
      }
      return true;
    });

    const files = s.files
      ? (payload.files || []).filter((f) => {
          if (!accOk(f.wb_user_id)) return false;
          if (s.types && !s.types.includes(fileKind(f))) return false;
          return true;
        })
      : [];

    return { ...payload, tasks, files };
  }

  // 把读到的原始数据做成可选范围，等用户确认再上传
  function previewScope(payload, meta) {
    state.pending = { payload, meta: meta || {} };
    renderScope();
  }

  function renderScope() {
    const box = $('#scopeBox');
    if (!box) return;
    if (!state.pending) {
      box.classList.add('hidden');
      return;
    }
    const raw = state.pending.payload;
    const scope = loadScope();
    const accounts = raw.accounts && raw.accounts.length ? raw.accounts : [];
    const accIds = accounts.length
      ? accounts.map((a) => a.wb_user_id || 'unknown')
      : [...new Set((raw.tasks || []).map((t) => t.wb_user_id || 'unknown'))];

    // 账号 chip：默认全选
    const chosenAcc = scope.accounts || accIds;
    $('#scopeAccounts').innerHTML = accIds
      .map((id) => {
        const cnt = (raw.tasks || []).filter((t) => (t.wb_user_id || 'unknown') === id).length;
        const on = chosenAcc.includes(id);
        return `<label class="scope-chip${on ? ' on' : ''}" data-acc="${esc(id)}">
          <input type="checkbox" ${on ? 'checked' : ''} />
          <span class="scope-dot" style="background:${spaceColor(id === 'unknown' ? null : id)}"></span>
          <span>${esc(spaceLabel(id === 'unknown' ? null : id))}</span>
          <i>${cnt}</i>
        </label>`;
      })
      .join('');

    // 文件类型 chip
    const chosenType = scope.types || FILE_KINDS.map((k) => k[0]);
    $('#scopeTypes').innerHTML = FILE_KINDS.map(([key, label]) => {
      const cnt = (raw.files || []).filter((f) => fileKind(f) === key).length;
      if (!cnt) return '';
      const on = chosenType.includes(key);
      return `<label class="scope-chip${on ? ' on' : ''}" data-type="${key}">
        <input type="checkbox" ${on ? 'checked' : ''} />
        <span>${label}</span><i>${cnt}</i>
      </label>`;
    }).join('');

    $('#scopeDays').value = String(scope.days || 0);
    $('#scopeFiles').checked = scope.files !== false;
    $('#scopeTypesWrap').classList.toggle('hidden', scope.files === false);

    box.classList.remove('hidden');
    updateScopeCount();
  }

  function readScopeFromUI() {
    const accounts = $$('#scopeAccounts .scope-chip')
      .filter((el) => el.querySelector('input').checked)
      .map((el) => el.dataset.acc);
    const allAcc = $$('#scopeAccounts .scope-chip');
    const types = $$('#scopeTypes .scope-chip')
      .filter((el) => el.querySelector('input').checked)
      .map((el) => el.dataset.type);
    const allTypes = $$('#scopeTypes .scope-chip');

    return {
      // 全选就存 null，这样以后新出现的账号/类型默认也包含
      accounts: accounts.length === allAcc.length ? null : accounts,
      days: Number($('#scopeDays').value) || 0,
      files: $('#scopeFiles').checked,
      types: !$('#scopeFiles').checked || types.length === allTypes.length ? null : types,
    };
  }

  function updateScopeCount() {
    if (!state.pending) return;
    const scope = readScopeFromUI();
    const kept = applyScope(state.pending.payload, scope);
    const rawTasks = (state.pending.payload.tasks || []).length;
    const rawFiles = (state.pending.payload.files || []).length;
    const tail = [];
    if (kept.tasks.length !== rawTasks) tail.push(`任务 ${rawTasks} → ${kept.tasks.length}`);
    if (kept.files.length !== rawFiles) tail.push(`文件 ${rawFiles} → ${kept.files.length}`);
    $('#scopeCount').textContent = `将同步 ${kept.tasks.length} 个任务 · ${kept.files.length} 个文件${
      tail.length ? `（已筛掉：${tail.join('，')}）` : ''
    }`;
    $('#scopeConfirm').textContent = kept.tasks.length ? `确认同步 ${kept.tasks.length} 条` : '没有符合范围的任务';
    $('#scopeConfirm').disabled = !kept.tasks.length;
    $('#scopeConfirm').dataset.scope = JSON.stringify(scope);
  }

  async function confirmScope() {
    if (!state.pending) return;
    const btn = $('#scopeConfirm');
    const scope = readScopeFromUI();
    saveScope(scope);
    state.uploadFiles = scope.files !== false;
    const kept = applyScope(state.pending.payload, scope);
    const meta = state.pending.meta || {};
    state.pending = null;
    $('#scopeBox').classList.add('hidden');
    btn.disabled = true;

    try {
      if (meta.stateEl) meta.stateEl.textContent = `正在上传 ${kept.tasks.length} 个任务…`;
      const result = await pushSnapshot(kept, {});
      if (meta.stateEl) meta.stateEl.textContent = `已同步 ${result.inserted + result.updated} 个任务`;
      $('#syncModal').classList.add('hidden');
    } catch (err) {
      toast((err && err.message) || '同步失败', 'err');
      if (meta.stateEl) meta.stateEl.textContent = '';
    } finally {
      btn.disabled = false;
      if (typeof meta.done === 'function') meta.done();
    }
  }

  async function pushSnapshot(payload, options) {
    const silent = Boolean(options && options.silent);
    if (!payload || !Array.isArray(payload.tasks)) throw new Error('快照格式不正确');
    const device = payload.device || { id: 'unknown', name: '未知设备', platform: '' };
    const docs = payload.tasks.filter((t) => t && t.task_uid && t.subject);
    if (!docs.length) {
      if (!silent) toast('这台机器上还没有任务记录');
      return { inserted: 0, updated: 0 };
    }

    setSyncState('busy', '正在合并…');
    const rows = docs.map((t) => normalizeLocal(t, device));
    const existing = await fetchExisting(rows.map((r) => r.task_uid));

    const inserts = [];
    const updates = [];
    let skipped = 0;
    let unchanged = 0;

    for (const row of rows) {
      const cur = existing.get(row.task_uid);
      if (!cur) {
        inserts.push({ ...row, shared: spacePolicy(row.wb_user_id) === 'all' });
        continue;
      }
      if (cur.source === 'manual') {
        skipped += 1;
        continue;
      }
      const patch = {
        subject: row.subject,
        description: row.description,
        active_form: row.active_form,
        session_title: row.session_title,
        project: row.project,
        device_name: row.device_name,
        task_created_at: row.task_created_at,
        task_updated_at: row.task_updated_at,
        cancelled: row.cancelled,
        cancel_reason: row.cancel_reason,
        updated_at: row.updated_at,
      };
      if (!cur.status_locked) patch.status = row.status;

      // 完全没变化就不写库，避免每次打开页面都产生一批无用写入
      const sameTime = parseTime(cur.task_updated_at) === parseTime(row.task_updated_at);
      const sameBody = (cur.subject || '') === (row.subject || '') && (cur.description || '') === (row.description || '');
      const sameStatus = cur.status_locked || cur.status === row.status;
      if (sameTime && sameBody && sameStatus) {
        unchanged += 1;
        continue;
      }
      updates.push({ id: cur.id, patch });
    }

    let inserted = 0;
    for (const part of chunk(inserts, 200)) {
      const { data, error } = await cloud.database.from('tasks').insert(part).select('id');
      if (error) throw error;
      inserted += (data || []).length;
    }

    let updated = 0;
    for (const part of chunk(updates, 6)) {
      const results = await Promise.all(
        part.map((u) => cloud.database.from('tasks').update(u.patch).eq('id', u.id).select('id'))
      );
      results.forEach((res) => {
        if (res.error) throw res.error;
        updated += (res.data || []).length;
      });
    }

    await touchDevice(device, rows.length);

    let fileResult = { uploaded: 0 };
    if (payload.files && payload.files.length) {
      if (!silent) $('#bridgeState').textContent = `登记产物 ${payload.files.length} 个…`;
      fileResult = await syncFiles(payload.files, silent);
    }

    state.lastSync = new Date().toISOString();
    await loadTasks();
    await Promise.all([loadDevices(), loadSpaces(), loadFiles()]);
    render();
    setSyncState('', `已同步 · ${relTime(state.lastSync)}`);

    if (!silent) {
      const parts = [`新增 ${inserted}`, `更新 ${updated}`];
      if (unchanged) parts.push(`无变化 ${unchanged}`);
      if (fileResult.uploaded) parts.push(`文件 ${fileResult.uploaded}`);
      if (fileResult.failed) parts.push(`文件失败 ${fileResult.failed}`);
      if (skipped) parts.push(`跳过 ${skipped}`);
      toast(`同步完成：${parts.join(' · ')}`);
    }
    return { inserted, updated, skipped, unchanged, files: fileResult };
  }

  async function touchDevice(device, taskCount) {
    if (!device || !device.id) return;
    try {
      const { data } = await cloud.database
        .from('devices')
        .select('id')
        .eq('device_id', device.id)
        .maybeSingle();
      const row = {
        device_id: device.id,
        device_name: device.name || '未知设备',
        platform: device.platform || '',
        last_sync_at: new Date().toISOString(),
        task_count: taskCount,
      };
      if (data && data.id) {
        await cloud.database.from('devices').update(row).eq('id', data.id);
      } else {
        await cloud.database.from('devices').insert(row);
      }
    } catch {
      /* 设备表写失败不影响主流程 */
    }
  }

  async function detectBridge() {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1800);
      const res = await fetch(`${BRIDGE}/health`, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async function pullFromBridge(silent) {
    const btn = $('#pullLocal');
    if (!silent) {
      btn.disabled = true;
      btn.textContent = '读取中…';
      $('#bridgeState').textContent = '正在连接本机采集器…';
    }
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${BRIDGE}/tasks`, { signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error('采集器返回异常');
      const payload = await res.json();
      if (silent) {
        // 静默自动同步：按上次记住的范围直接传，不打扰
        const kept = applyScope(payload);
        if (!kept.tasks.length) return true;
        await pushSnapshot(kept, { silent: true });
        return true;
      }
      $('#bridgeState').textContent = `读到 ${payload.tasks.length} 个任务`;
      previewScope(payload, {
        stateEl: $('#bridgeState'),
        done: () => {
          $('#bridgeState').textContent = '已连接本机采集器';
        },
      });
      return true;
    } catch (err) {
      setSyncState('', '已连接云端');
      if (!silent) {
        $('#bridgeState').textContent = '没连上本机采集器';
        toast('没连上本机采集器，请先在那台电脑上运行 collect.js --serve', 'err');
      }
      return false;
    } finally {
      if (!silent) {
        btn.disabled = false;
        btn.textContent = '从本机同步';
      }
    }
  }

  async function autoSyncLocal() {
    if (await detectBridge()) {
      await pullFromBridge(true);
      lastLocalSyncAt = Date.now();
      return;
    }
    // 采集器可能刚装好 / 刚开机还没起来，隔一会儿再试两次，省得用户手动刷新
    [8000, 25000].forEach((delay) => {
      setTimeout(async () => {
        if (state.session && (await detectBridge())) {
          await pullFromBridge(true);
          lastLocalSyncAt = Date.now();
          setSyncState('', '已自动同步');
        }
      }, delay);
    });
  }

  // 打开页面 / 切回标签页 / 定时轮询时调用：只要本机桥在，就静默把新任务传上去
  async function autoSyncQuiet() {
    if (!state.session || state.busy) return;
    if (Date.now() - lastLocalSyncAt < LOCAL_SYNC_MIN_GAP) return;
    if (!(await detectBridge())) return;
    lastLocalSyncAt = Date.now();
    try {
      await pullFromBridge(true);
    } catch {
      /* 静默失败，不打扰 */
    }
  }

  // ------------------------------------------------ 免安装：直读本机 .workbuddy
  // 浏览器读不到 workbuddy.db（SQLite 二进制），所以会话标题退化成「会话 xxxxxxxx」，
  // wb_user_id 为空 —— 与「装了采集器但没有 sqlite3」时的降级表现一致。
  const PICK_STATUS = {
    pending: 'pending',
    todo: 'pending',
    queued: 'pending',
    waiting: 'pending',
    not_started: 'pending',
    in_progress: 'in_progress',
    running: 'in_progress',
    active: 'in_progress',
    doing: 'in_progress',
    completed: 'completed',
    complete: 'completed',
    done: 'completed',
    finished: 'completed',
    cancelled: 'cancelled',
    canceled: 'cancelled',
    deleted: 'cancelled',
    skipped: 'cancelled',
  };

  function pickStatus(raw, extra) {
    if (extra && extra.cancelled) return 'cancelled';
    const key = String(raw || '')
      .toLowerCase()
      .trim();
    return PICK_STATUS[key] || 'pending';
  }

  function pickIso(value) {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) {
      const ms = n > 1e14 ? Math.round(n / 1000) : n > 1e11 ? n : n * 1000;
      const d = new Date(ms);
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  // 设备名 → 稳定设备 ID：同一台机器重复导入会合并，而不是每次都造一台新设备
  function manualDeviceId(name) {
    let h = 5381;
    const s = String(name || 'manual');
    for (let i = 0; i < s.length; i += 1) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return `manual-${h.toString(16)}`;
  }

  async function resolveWbHome(dir) {
    try {
      await dir.getDirectoryHandle('tasks');
      return dir; // 直接选中的就是 .workbuddy
    } catch {
      /* 继续往下找 */
    }
    try {
      return await dir.getDirectoryHandle('.workbuddy');
    } catch {
      return null;
    }
  }

  async function scanPickedDir(dir) {
    const home = await resolveWbHome(dir);
    if (!home) throw new Error('这个目录里没有 .workbuddy（请选个人文件夹或 .workbuddy 本身）');

    const nameInput = $('#pickDeviceName');
    const deviceName = ((nameInput && nameInput.value) || '').trim() || '手动导入设备';
    const device = { id: manualDeviceId(deviceName), name: deviceName, platform: 'browser-picker' };
    const tasks = [];

    const tasksDir = await home.getDirectoryHandle('tasks');
    for await (const [sessionId, sessionHandle] of tasksDir.entries()) {
      if (sessionHandle.kind !== 'directory' || sessionId.startsWith('.')) continue;
      for await (const [fileName, fileHandle] of sessionHandle.entries()) {
        if (fileHandle.kind !== 'file' || !fileName.endsWith('.json') || fileName.startsWith('.')) continue;
        let record = null;
        try {
          record = JSON.parse(await (await fileHandle.getFile()).text());
        } catch {
          continue;
        }
        if (!record || !record.subject) continue;
        const taskId = String(record.id || fileName.replace(/\.json$/, ''));
        const extra = record.metadata && typeof record.metadata === 'object' ? record.metadata : {};
        tasks.push({
          task_uid: `${device.id}:${sessionId}:${taskId}`,
          session_id: sessionId,
          session_title: `会话 ${sessionId.slice(0, 8)}`,
          project: null,
          wb_user_id: null,
          device_id: device.id,
          device_name: device.name,
          source: 'workbuddy',
          subject: String(record.subject),
          description: record.description || null,
          active_form: record.activeForm || null,
          status: pickStatus(record.status, extra),
          cancelled: Boolean(extra.cancelled),
          cancel_reason: extra.cancelReason || null,
          task_created_at: pickIso(record.createdAt),
          task_updated_at: pickIso(record.updatedAt),
        });
      }
    }

    tasks.sort((a, b) => {
      const ta = Date.parse(a.task_updated_at || a.task_created_at || 0) || 0;
      const tb = Date.parse(b.task_updated_at || b.task_created_at || 0) || 0;
      return tb - ta;
    });

    return { version: 2, device, accounts: [], tasks, files: [], problems: [], generatedAt: new Date().toISOString() };
  }

  async function pickLocalDir() {
    const stateEl = $('#pickState');
    const btn = $('#pickDir');
    if (typeof window.showDirectoryPicker !== 'function') {
      if (stateEl) stateEl.textContent = '这个浏览器不支持目录直读，请用 Chrome / Edge';
      toast('这个浏览器不支持目录直读，请用 Chrome / Edge，或安装采集器', 'err');
      return;
    }
    let dir = null;
    try {
      dir = await window.showDirectoryPicker({ id: 'workbuddy-home', mode: 'read' });
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      if (stateEl) stateEl.textContent = '目录没有选上';
      return;
    }

    if (btn) btn.disabled = true;
    if (stateEl) stateEl.textContent = '正在读取…';
    try {
      const payload = await scanPickedDir(dir);
      if (!payload.tasks.length) {
        if (stateEl) stateEl.textContent = '这个目录里没有任务';
        return;
      }
      if (stateEl) stateEl.textContent = `读到 ${payload.tasks.length} 个任务`;
      previewScope(payload, { stateEl, done: () => { if (stateEl) stateEl.textContent = ''; } });
    } catch (err) {
      if (stateEl) stateEl.textContent = '';
      toast((err && err.message) || '读取失败', 'err');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function importFile(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      if (!payload || !Array.isArray(payload.tasks)) throw new Error('不是有效的快照文件');
      previewScope(payload, {});
    } catch (err) {
      toast(err.message || '快照文件解析失败', 'err');
    }
  }

  // ------------------------------------------------------------ 事件绑定
  function bindEvents() {
    bindTabs();
    $('#phoneSend').addEventListener('click', () => sendCode('phone'));
    $('#emailSend').addEventListener('click', () => sendCode('email'));
    $('#phoneForm').addEventListener('submit', (e) => {
      e.preventDefault();
      submitCode('phone');
    });
    $('#emailForm').addEventListener('submit', (e) => {
      e.preventDefault();
      submitCode('email');
    });
    $('#wechatLogin').addEventListener('click', wechatLogin);

    $$('#statusNav .side-item').forEach((item) => {
      item.addEventListener('click', () => {
        state.filter.status = item.dataset.status;
        render();
      });
    });

    $('#searchInput').addEventListener(
      'input',
      debounce((e) => {
        state.filter.q = e.target.value;
        renderContent();
        renderTitle();
      }, 180)
    );

    $('#refreshBtn').addEventListener('click', async () => {
      setSyncState('busy', '刷新中…');
      await loadTasks();
      await Promise.all([loadDevices(), loadSpaces(), loadFiles()]);
      setSyncState('', '已连接云端');
      render();
      toast('已刷新');
    });

    $('#selectBtn').addEventListener('click', () => {
      state.selectMode = !state.selectMode;
      if (!state.selectMode) state.selected.clear();
      render();
    });
    $('#selCancel').addEventListener('click', () => {
      state.selectMode = false;
      state.selected.clear();
      render();
    });
    $('#selShare').addEventListener('click', () => batchShare(true));
    $('#selUnshare').addEventListener('click', () => batchShare(false));
    $('#selExport').addEventListener('click', exportHandoff);

    $('#spaceList').addEventListener('click', (e) => {
      const gear = e.target.closest('[data-gear]');
      if (gear) {
        e.stopPropagation();
        openSpaceModal(gear.dataset.gear);
        return;
      }
      const target = e.target.closest('[data-space]');
      if (!target) return;
      state.filter.space = target.dataset.space;
      render();
    });

    $$('#spaceModal [data-policy]').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('#spaceModal [data-policy]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      });
    });
    $('#spaceSave').addEventListener('click', saveSpace);
    $('#spaceCancel').addEventListener('click', () => $('#spaceModal').classList.add('hidden'));
    $('#spaceClose').addEventListener('click', () => $('#spaceModal').classList.add('hidden'));

    // 同步范围面板：账号 / 时间 / 文件类型
    $('#scopeBox').addEventListener('change', (e) => {
      const chip = e.target.closest('.scope-chip');
      if (chip) chip.classList.toggle('on', e.target.checked);
      if (e.target.id === 'scopeFiles') {
        $('#scopeTypesWrap').classList.toggle('hidden', !e.target.checked);
        state.uploadFiles = e.target.checked;
      }
      updateScopeCount();
    });
    $('#scopeAll').addEventListener('click', () => {
      $$('#scopeAccounts .scope-chip, #scopeTypes .scope-chip').forEach((el) => {
        el.querySelector('input').checked = true;
        el.classList.add('on');
      });
      $('#scopeDays').value = '0';
      $('#scopeFiles').checked = true;
      $('#scopeTypesWrap').classList.remove('hidden');
      updateScopeCount();
    });
    $('#scopeConfirm').addEventListener('click', confirmScope);
    $('#scopeCancel').addEventListener('click', () => {
      state.pending = null;
      $('#scopeBox').classList.add('hidden');
    });

    $('#stats').addEventListener('click', (e) => {
      const hit = e.target.closest('[data-act="shared"]');
      if (!hit) return;
      state.filter.sharedOnly = !state.filter.sharedOnly;
      render();
    });

    $$('#viewSeg button').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.view = btn.dataset.view;
        localStorage.setItem('ts_view', state.view);
        $$('#viewSeg button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        renderContent();
      });
    });

    $('#sortSel').addEventListener('change', (e) => {
      state.sort = e.target.value;
      localStorage.setItem('ts_sort', state.sort);
      renderContent();
    });

    $('#content').addEventListener('click', (e) => {
      const action = e.target.closest('[data-act]');
      if (action) {
        const act = action.dataset.act;
        if (act === 'open-sync') openSyncModal();
        else if (act === 'new') openNewModal();
        else if (act === 'reset-filter') {
          state.filter = { status: 'all', device: 'all', space: 'all', q: '', sharedOnly: false };
          $('#searchInput').value = '';
          render();
        } else if (act === 'toggle') {
          e.stopPropagation();
          const task = state.tasks.find((t) => String(t.id) === action.dataset.id);
          if (task) toggleComplete(task);
        } else if (act === 'sel') {
          e.stopPropagation();
          toggleSelected(action.dataset.id);
        }
        return;
      }
      const card = e.target.closest('.task, .kcard');
      if (card) {
        if (state.selectMode) {
          toggleSelected(card.dataset.id);
          return;
        }
        const task = state.tasks.find((t) => String(t.id) === card.dataset.id);
        if (task) openDrawer(task);
      }
    });

    $('#drawerClose').addEventListener('click', closeDrawer);
    $('#drawerMask').addEventListener('click', closeDrawer);
    $('#drawerDone').addEventListener('click', closeDrawer);
    $('#drawerSaveNote').addEventListener('click', saveNote);
    $('#drawerDelete').addEventListener('click', () => deleteTask(state.currentTask));

    $('#syncEntry').addEventListener('click', openSyncModal);
    $('#syncNowBtn').addEventListener('click', quickSync);
    $('#recheckBridge').addEventListener('click', () => checkBridge({ poll: true }));
    $('#copyInstall').addEventListener('click', async () => {
      const cmd = installCommand();
      try {
        await navigator.clipboard.writeText(cmd);
        toast('安装命令已复制，粘到终端执行');
      } catch {
        toast('复制失败，请手动选中命令复制', 'err');
      }
    });
    $('#downloadInstall').addEventListener('click', downloadInstaller);
    if ($('#fatalClose')) $('#fatalClose').addEventListener('click', () => $('#fatal').classList.add('hidden'));
    if ($('#fatalCopy')) {
      $('#fatalCopy').addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText($('#fatalMsg').textContent || '');
          toast('错误信息已复制');
        } catch {
          toast('复制失败，手动选中即可', 'err');
        }
      });
    }
    $('#syncClose').addEventListener('click', () => {
      stopBridgePoll();
      $('#syncModal').classList.add('hidden');
    });
    $('#syncLater').addEventListener('click', () => {
      stopBridgePoll();
      $('#syncModal').classList.add('hidden');
    });
    $('#pullLocal').addEventListener('click', () => pullFromBridge(false));
    $('#pickDir').addEventListener('click', pickLocalDir);
    $('#dropZone').addEventListener('click', () => $('#fileInput').click());
    $('#fileInput').addEventListener('change', (e) => importFile(e.target.files[0]));

    const drop = $('#dropZone');
    ['dragenter', 'dragover'].forEach((ev) =>
      drop.addEventListener(ev, (e) => {
        e.preventDefault();
        drop.classList.add('over');
      })
    );
    ['dragleave', 'drop'].forEach((ev) =>
      drop.addEventListener(ev, (e) => {
        e.preventDefault();
        drop.classList.remove('over');
      })
    );
    drop.addEventListener('drop', (e) => {
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) importFile(file);
    });

    $('#newBtn').addEventListener('click', openNewModal);
    $('#fabNew').addEventListener('click', openNewModal);
    $('#newClose').addEventListener('click', () => $('#newModal').classList.add('hidden'));
    $('#newCancel').addEventListener('click', () => $('#newModal').classList.add('hidden'));
    $('#newSubmit').addEventListener('click', createTask);
    $('#newSubject').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        createTask();
      }
    });

    $('#meBtn').addEventListener('click', async () => {
      if (!window.confirm('退出登录？任务数据保留在云端，下次登录还在。')) return;
      await cloud.auth.signOut();
      try {
        localStorage.removeItem('wb_login_source');
      } catch {
        /* ignore */
      }
      location.reload();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!$('#drawer').classList.contains('hidden')) closeDrawer();
        $('#syncModal').classList.add('hidden');
        $('#newModal').classList.add('hidden');
        $('#spaceModal').classList.add('hidden');
      }
      if (e.key === '/' && document.activeElement !== $('#searchInput')) {
        e.preventDefault();
        $('#searchInput').focus();
      }
    });
  }

  function openSyncModal() {
    $('#syncModal').classList.remove('hidden');
    state.pending = null;
    $('#scopeBox').classList.add('hidden');
    const cmd = installCommand();
    $('#cmdHint').textContent = cmd;
    const cmd2 = $('#installCmd2');
    if (cmd2) cmd2.textContent = cmd;
    const pickState = $('#pickState');
    if (pickState) pickState.textContent = '';
    checkBridge({ poll: true });
  }

  // 网页不能直接在你机器上执行程序，所以退一步：把安装脚本给你下载下来，双击运行
  async function downloadInstaller() {
    const isWin = navigator.userAgent.includes('Windows');
    const cmd = installCommand();
    let body;
    let name;
    if (isWin) {
      name = 'install-workbuddy-sync.ps1';
      body = `# 右键「使用 PowerShell 运行」\r\n${cmd}\r\nRead-Host "按回车关闭"\r\n`;
    } else {
      name = '安装任务同步.command';
      body =
        '#!/bin/bash\n' +
        '# 双击运行：安装 WorkBuddy 任务同步采集器（开机自启）\n' +
        'clear\n' +
        cmd +
        '\n\necho\necho "完成。回到网页点「立即同步」即可。"\n' +
        'read -n 1 -s -r -p "按任意键关闭…"\n';
    }
    try {
      downloadBlob(new Blob([body], { type: 'text/plain;charset=utf-8' }), name);
      toast(
        isWin
          ? '已下载到「下载」文件夹，右键 → 使用 PowerShell 运行'
          : '已下载到「下载」文件夹：双击运行；若提示无法打开，右键 → 打开'
      );
    } catch (err) {
      toast('下载失败：' + ((err && err.message) || '请手动复制命令'), 'err');
    }
  }

  function installCommand() {
    const site = location.origin;
    return navigator.userAgent.includes('Windows')
      ? `powershell -c "iwr ${site}/collector/install.ps1 -UseBasicParsing | iex"`
      : `curl -fsSL ${site}/collector/install.txt | bash`;
  }

  // 检测本机桥；找不到就把安装指引亮出来，并持续轮询等用户装好
  let bridgeTimer = null;
  let bridgeTries = 0;

  async function checkBridge(options) {
    const opts = options || {};
    const label = $('#bridgeState');
    if (label) {
      label.textContent = '正在检测…';
      label.classList.remove('ok');
    }
    const health = await detectBridge();
    if (health) {
      stopBridgePoll();
      if (label) {
        label.textContent = `已连接：${(health.device && health.device.name) || '本机'}`;
        label.classList.add('ok');
      }
      const help = $('#bridgeHelp');
      if (help) help.classList.add('hidden');
      const pull = $('#pullLocal');
      if (pull) pull.disabled = false;
      return health;
    }

    if (label) label.textContent = '未检测到本机采集器';
    const help = $('#bridgeHelp');
    if (help) help.classList.remove('hidden');
    if (opts.poll) startBridgePoll();
    return null;
  }

  function startBridgePoll() {
    if (bridgeTimer) return;
    bridgeTries = 0;
    bridgeTimer = setInterval(async () => {
      bridgeTries += 1;
      if (!$('#syncModal').classList.contains('hidden')) {
        const health = await detectBridge();
        if (health) {
          stopBridgePoll();
          const label = $('#bridgeState');
          if (label) {
            label.textContent = `已连接：${(health.device && health.device.name) || '本机'}`;
            label.classList.add('ok');
          }
          const help = $('#bridgeHelp');
          if (help) help.classList.add('hidden');
          toast('采集器已就绪，可以同步了');
        }
      }
      if (bridgeTries >= 40) stopBridgePoll();
    }, 3000);
  }

  function stopBridgePoll() {
    if (bridgeTimer) {
      clearInterval(bridgeTimer);
      bridgeTimer = null;
    }
  }

  // 顶栏那个「同步」按钮：一次点击完成 检测 → 读取 → 按记住的范围上传
  async function quickSync() {
    const btn = $('#syncNowBtn');
    if (state.busy) return;
    state.busy = true;
    if (btn) btn.disabled = true;
    try {
      const health = await detectBridge();
      if (!health) {
        openSyncModal();
        toast('本机采集器没在运行，弹窗里有安装命令', 'err');
        return;
      }
      const res = await fetch(`${BRIDGE}/tasks`);
      if (!res.ok) throw new Error('采集器返回异常');
      const payload = await res.json();
      const kept = applyScope(payload);
      if (!kept.tasks.length) {
        toast('没有落在同步范围内的任务');
        return;
      }
      const result = await pushSnapshot(kept, { silent: true });
      toast(`同步完成：新增 ${result.inserted}，更新 ${result.updated}`);
    } catch (err) {
      toast((err && err.message) || '同步失败', 'err');
    } finally {
      state.busy = false;
      if (btn) btn.disabled = false;
    }
  }

  function openNewModal() {
    $('#newModal').classList.remove('hidden');
    setTimeout(() => $('#newSubject').focus(), 40);
  }

  // ------------------------------------------------------------ 启动
  function initView() {
    $$('#viewSeg button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === state.view)));
    $('#sortSel').value = state.sort;
  }

  bindEvents();
  initView();
  boot();
})();
