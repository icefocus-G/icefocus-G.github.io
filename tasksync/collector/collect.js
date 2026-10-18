#!/usr/bin/env node
/**
 * WorkBuddy 任务采集器
 * ------------------------------------------------------------------
 * 读取本机 ~/.workbuddy/tasks/<会话ID>/<任务ID>.json，并关联
 * ~/.workbuddy/workbuddy.db 里的会话标题，产出统一的「任务快照」。
 *
 * 三种用法：
 *   node collect.js                 # 扫描一次，写出 tasks-snapshot.json
 *   node collect.js --json          # 扫描一次，把 JSON 打到标准输出
 *   node collect.js --serve         # 启动本机桥（127.0.0.1:8787），网页可自动拉取
 *   node collect.js --write-agent   # 生成开机自启的 LaunchAgent 配置（macOS）
 *
 * 零依赖，Node 18+ 即可运行。
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

// 单个产物文件上限：超过就不进清单（避免把大视频等一起同步）
const MAX_FILE_BYTES = 25 * 1024 * 1024;

// ---------------------------------------------------------------- 参数
function parseArgs(argv) {
  const opts = {
    home: process.env.WB_HOME || path.join(os.homedir(), '.workbuddy'),
    port: Number(process.env.WB_SYNC_PORT || 8787),
    host: '127.0.0.1',
    out: null,
    json: false,
    serve: false,
    writeAgent: false,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--home') opts.home = argv[++i];
    else if (a === '--port') opts.port = Number(argv[++i]);
    else if (a === '--out') opts.out = argv[++i];
    else if (a === '--json') opts.json = true;
    else if (a === '--serve') opts.serve = true;
    else if (a === '--write-agent') opts.writeAgent = true;
    else if (a === '--help' || a === '-h') opts.help = true;
  }
  return opts;
}

const HELP = `
WorkBuddy 任务采集器

  node collect.js                 扫描一次，写出 tasks-snapshot.json
  node collect.js --json          扫描结果输出到标准输出
  node collect.js --serve         启动本机桥 http://127.0.0.1:8787
  node collect.js --write-agent   生成 macOS 开机自启配置

选项
  --home <dir>   WorkBuddy 数据目录（默认 ~/.workbuddy）
  --port <n>     本机桥端口（默认 8787）
  --out <file>   快照输出路径
`;

// ---------------------------------------------------------------- 工具
function safeReadJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function toIso(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  if (Number.isFinite(n) && n > 0) {
    // 兼容秒 / 毫秒 / 微秒时间戳
    const ms = n > 1e14 ? Math.round(n / 1000) : n > 1e11 ? n : n * 1000;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function normalizeStatus(raw, meta) {
  if (meta && meta.cancelled) return 'cancelled';
  const s = String(raw || '').toLowerCase().trim();
  if (['pending', 'todo', 'queued', 'waiting', 'not_started'].includes(s)) return 'pending';
  if (['in_progress', 'running', 'active', 'doing'].includes(s)) return 'in_progress';
  if (['completed', 'complete', 'done', 'finished'].includes(s)) return 'completed';
  if (['cancelled', 'canceled', 'deleted', 'skipped'].includes(s)) return 'cancelled';
  return 'pending';
}

// ---------------------------------------------------------------- 会话元信息
function loadSessionMeta(home) {
  const db = path.join(home, 'workbuddy.db');
  const map = new Map();
  if (!fs.existsSync(db)) return map;

  const query =
    "SELECT id, COALESCE(NULLIF(custom_title, ''), NULLIF(title, ''), ''), COALESCE(cwd, ''), COALESCE(user_id, '') FROM sessions";

  try {
    const raw = execFileSync('sqlite3', ['-readonly', '-separator', '\u001f', db, query], {
      encoding: 'utf8',
      timeout: 5000,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue;
      const [id, title, cwd, userId] = line.split('\u001f');
      if (!id) continue;
      map.set(id, {
        title: (title || '').trim(),
        project: cwd ? path.basename(cwd.replace(/\/+$/, '')) : '',
        userId: (userId || '').trim(),
      });
    }
  } catch {
    // 没有 sqlite3 或数据库被锁：静默降级，标题用会话 ID 代替
  }
  return map;
}

function loadDeviceId(home) {
  const file = path.join(home, 'device-id');
  if (fs.existsSync(file)) {
    const id = fs.readFileSync(file, 'utf8').trim();
    if (id) return id;
  }
  // 没有就生成一个稳定 ID，保证同一台机器多次采集一致
  const generated = crypto.randomUUID();
  try {
    fs.writeFileSync(file, generated, 'utf8');
  } catch {
    /* 只读目录时忽略 */
  }
  return generated;
}

function deviceName() {
  const candidates = [];

  if (os.platform() === 'darwin') {
    try {
      const name = execFileSync('scutil', ['--get', 'ComputerName'], {
        encoding: 'utf8',
        timeout: 2000,
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
      if (name) candidates.push(name);
    } catch {
      /* 忽略：继续用主机名 */
    }
  }
  candidates.push(os.hostname().replace(/\.local$/i, ''));

  const pick = candidates.find((n) => n && !/^\d+\.\d+\.\d+\.\d+$/.test(n));
  if (pick) return pick;
  return os.platform() === 'darwin' ? 'Mac' : '本机';
}

function deviceInfo(home) {
  return {
    id: loadDeviceId(home),
    name: deviceName(),
    platform: `${os.platform()} ${os.release()}`,
  };
}

// ---------------------------------------------------------------- 扫描
function scanTasks(home) {
  const tasksRoot = path.join(home, 'tasks');
  const device = deviceInfo(home);
  const sessions = loadSessionMeta(home);
  const tasks = [];
  const problems = [];

  if (!fs.existsSync(tasksRoot)) {
    return {
      version: 2,
      device,
      accounts: [],
      tasks,
      files: [],
      problems: ['未找到任务目录：' + tasksRoot],
      generatedAt: new Date().toISOString(),
    };
  }

  let sessionDirs = [];
  try {
    sessionDirs = fs
      .readdirSync(tasksRoot, { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
      .map((d) => d.name);
  } catch (err) {
    problems.push('读取任务目录失败：' + err.message);
  }

  for (const sessionId of sessionDirs) {
    const dir = path.join(tasksRoot, sessionId);
    let files = [];
    try {
      files = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !f.startsWith('.'));
    } catch {
      continue;
    }
    const meta = sessions.get(sessionId) || {};
    for (const file of files) {
      const record = safeReadJson(path.join(dir, file));
      if (!record || !record.subject) {
        problems.push('跳过无法解析的任务文件：' + path.join(sessionId, file));
        continue;
      }
      const taskId = String(record.id || path.basename(file, '.json'));
      const extra = record.metadata && typeof record.metadata === 'object' ? record.metadata : {};
      tasks.push({
        task_uid: `${device.id}:${sessionId}:${taskId}`,
        session_id: sessionId,
        session_title: meta.title || `会话 ${sessionId.slice(0, 8)}`,
        project: meta.project || null,
        wb_user_id: meta.userId || null,
        device_id: device.id,
        device_name: device.name,
        source: 'workbuddy',
        subject: String(record.subject),
        description: record.description || null,
        active_form: record.activeForm || null,
        status: normalizeStatus(record.status, extra),
        cancelled: Boolean(extra.cancelled),
        cancel_reason: extra.cancelReason || null,
        task_created_at: toIso(record.createdAt),
        task_updated_at: toIso(record.updatedAt),
      });
    }
  }

  tasks.sort((a, b) => {
    const ta = Date.parse(a.task_updated_at || a.task_created_at || 0) || 0;
    const tb = Date.parse(b.task_updated_at || b.task_created_at || 0) || 0;
    return tb - ta;
  });

  const artifacts = scanArtifacts(home, sessions);
  const accounts = buildAccounts(tasks, artifacts);

  return {
    version: 2,
    device,
    accounts,
    tasks,
    files: artifacts,
    problems,
    generatedAt: new Date().toISOString(),
  };
}

// 读取 artifact-index：每个会话生成过的文件清单
function scanArtifacts(home, sessions) {
  const idxDir = path.join(home, 'artifact-index');
  const out = [];
  if (!fs.existsSync(idxDir)) return out;

  let entries = [];
  try {
    entries = fs.readdirSync(idxDir).filter((f) => f.endsWith('.json') && !f.startsWith('.'));
  } catch {
    return out;
  }

  for (const entry of entries) {
    const sessionId = path.basename(entry, '.json');
    const index = safeReadJson(path.join(idxDir, entry));
    if (!index || !Array.isArray(index.artifacts)) continue;
    const meta = sessions.get(sessionId) || {};

    for (const art of index.artifacts) {
      if (!art || typeof art.uri !== 'string') continue;
      if (!art.uri.startsWith('file://')) continue;
      let localPath = art.uri.slice(7);
      try {
        localPath = decodeURIComponent(localPath);
      } catch {
        /* 保留原样 */
      }
      let stat = null;
      try {
        stat = fs.statSync(localPath);
      } catch {
        continue;
      }
      if (!stat.isFile()) continue;

      const name = art.name || path.basename(localPath);
      if (name.startsWith('.')) continue;
      if (localPath.includes('/node_modules/') || localPath.includes('/.git/')) continue;
      if (stat.size === 0 || stat.size > MAX_FILE_BYTES) continue;
      out.push({
        file_uid: `${sessionId}:${name}`,
        session_id: sessionId,
        session_title: meta.title || `会话 ${sessionId.slice(0, 8)}`,
        wb_user_id: meta.userId || null,
        name,
        title: art.title || name,
        mime: art.mimeType || guessMime(name),
        size: stat.size,
        local_path: localPath,
        modified_at: new Date(stat.mtimeMs).toISOString(),
      });
    }
  }
  return out;
}

function guessMime(name) {
  const ext = path.extname(name).toLowerCase();
  const table = {
    '.html': 'text/html',
    '.htm': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.md': 'text/markdown',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.zip': 'application/zip',
  };
  return table[ext] || 'application/octet-stream';
}

function buildAccounts(tasks, artifacts) {
  const map = new Map();
  const touch = (uid) => {
    if (!map.has(uid)) map.set(uid, { wb_user_id: uid, task_count: 0, file_count: 0 });
    return map.get(uid);
  };
  for (const task of tasks) {
    if (task.wb_user_id) touch(task.wb_user_id).task_count += 1;
  }
  for (const file of artifacts) {
    if (file.wb_user_id) touch(file.wb_user_id).file_count += 1;
  }
  return Array.from(map.values());
}

// ---------------------------------------------------------------- 输出
function writeSnapshot(opts, payload) {
  // 默认写到用户目录，避免快照落在项目里被当作静态资源公开
  const dir = path.join(os.homedir(), '.workbuddy-task-sync');
  const target = opts.out || path.join(dir, 'tasks-snapshot.json');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(payload, null, 2), 'utf8');
  return target;
}

function summarize(payload, target) {
  const { tasks, device } = payload;
  const by = (s) => tasks.filter((t) => t.status === s).length;
  const lines = [
    `设备：${device.name}（${device.id.slice(0, 8)}…）`,
    `任务：共 ${tasks.length} 个 · 待开始 ${by('pending')} · 进行中 ${by('in_progress')} · 已完成 ${by('completed')} · 已取消 ${by('cancelled')}`,
  ];
  if (payload.accounts && payload.accounts.length) {
    lines.push(
      `账号：${payload.accounts
        .map((a) => `${a.wb_user_id.slice(0, 8)}…（任务 ${a.task_count} / 文件 ${a.file_count}）`)
        .join('，')}`
    );
  }
  if (payload.files) lines.push(`产物文件：${payload.files.length} 个`);
  if (target) lines.push(`快照：${target}`);
  if (payload.problems.length) lines.push(`提示：${payload.problems.length} 个文件未能解析`);
  process.stderr.write(lines.join('\n') + '\n');
}

// ---------------------------------------------------------------- 本机桥
function startServer(opts) {
  let cache = null;
  let cachedAt = 0;

  const current = () => {
    const now = Date.now();
    if (!cache || now - cachedAt > 1500) {
      cache = scanTasks(opts.home);
      cachedAt = now;
    }
    return { ...cache, tasks: cache.tasks };
  };

  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Private-Network': 'true',
    'Cache-Control': 'no-store',
  };

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);

    if (req.method === 'OPTIONS') {
      res.writeHead(204, cors);
      res.end();
      return;
    }
    if (req.method !== 'GET') {
      res.writeHead(405, { ...cors, 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'method_not_allowed' }));
      return;
    }

    if (url.pathname === '/health') {
      res.writeHead(200, { ...cors, 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, device: deviceInfo(opts.home) }));
      return;
    }

    // 只允许读取本次扫描结果里登记过的产物文件，不接受任意路径
    if (url.pathname === '/file') {
      const uid = url.searchParams.get('uid') || '';
      const payload = current();
      const target = payload.files.find((f) => f.file_uid === uid);
      if (!target) {
        res.writeHead(404, { ...cors, 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'file_not_found' }));
        return;
      }
      let stat = null;
      try {
        stat = fs.statSync(target.local_path);
      } catch {
        stat = null;
      }
      if (!stat || !stat.isFile()) {
        res.writeHead(410, { ...cors, 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'file_moved' }));
        return;
      }
      res.writeHead(200, {
        ...cors,
        'Content-Type': guessMime(target.name),
        'Content-Length': stat.size,
        'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(target.name)}`,
      });
      fs.createReadStream(target.local_path)
        .on('error', () => res.destroy())
        .pipe(res);
      return;
    }

    if (url.pathname === '/tasks' || url.pathname === '/snapshot.json') {
      try {
        const payload = current();
        res.writeHead(200, { ...cors, 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(payload));
      } catch (err) {
        res.writeHead(500, { ...cors, 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'scan_failed', message: err.message }));
      }
      return;
    }

    res.writeHead(404, { ...cors, 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'not_found' }));
  });

  server.listen(opts.port, opts.host, () => {
    const payload = scanTasks(opts.home);
    process.stdout.write(
      [
        '任务采集器已启动',
        `  本机桥地址  http://${opts.host}:${opts.port}/tasks`,
        `  设备        ${payload.device.name}`,
        `  已发现任务  ${payload.tasks.length} 个`,
        '',
        '保持这个窗口开着，网页端就能一键同步。按 Ctrl+C 停止。',
        '',
      ].join('\n')
    );
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      process.stderr.write(`端口 ${opts.port} 已被占用，换一个端口：node collect.js --serve --port 8788\n`);
    } else {
      process.stderr.write('启动失败：' + err.message + '\n');
    }
    process.exit(1);
  });
}

// ---------------------------------------------------------------- LaunchAgent
function writeAgent(opts) {
  if (os.platform() !== 'darwin') {
    process.stderr.write('--write-agent 仅支持 macOS\n');
    return;
  }
  const label = 'dev.workbuddy.tasksync';
  const dir = path.join(os.homedir(), 'Library', 'LaunchAgents');
  const target = path.join(dir, `${label}.plist`);
  const logFile = path.join(os.homedir(), '.workbuddy', 'tasksync-agent.log');
  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${label}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${process.execPath}</string>
    <string>${path.resolve(__filename)}</string>
    <string>--serve</string>
    <string>--port</string>
    <string>${opts.port}</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>${logFile}</string>
  <key>StandardErrorPath</key><string>${logFile}</string>
</dict>
</plist>
`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(target, plist, 'utf8');
  process.stdout.write(
    [
      `已生成 ${target}`,
      '',
      '启用开机自启：',
      `  launchctl load -w ${target}`,
      '停用：',
      `  launchctl unload -w ${target}`,
      '',
    ].join('\n')
  );
}

// ---------------------------------------------------------------- 入口
function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    process.stdout.write(HELP);
    return;
  }
  if (opts.writeAgent) {
    writeAgent(opts);
    return;
  }
  if (opts.serve) {
    startServer(opts);
    return;
  }
  const payload = scanTasks(opts.home);
  if (opts.json) {
    process.stdout.write(JSON.stringify(payload, null, 2));
    return;
  }
  const target = writeSnapshot(opts, payload);
  summarize(payload, target);
}

if (require.main === module) main();
module.exports = { scanTasks };
