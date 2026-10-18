#!/usr/bin/env node
/**
 * 移交包导入器
 * ------------------------------------------------------------------
 * 把看板导出的 handoff-*.json 解成可以直接用的东西：
 *   - 任务包.md    一份带任务、备注、附件清单的 Markdown，可直接贴进 WorkBuddy 对话
 *   - tasks.json   机器可读的任务列表，便于再导入或二次处理
 *   - files/       包内附带的文件（base64 解出来的原始字节）
 *
 * 用法：
 *   node collector/import.js handoff-20261018-1435.json
 *   node collector/import.js handoff-xxx.json --out ~/WorkBuddy/handoff
 *   node collector/import.js handoff-xxx.json --no-files
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

function parseArgs(argv) {
  const opts = { input: null, out: null, noFiles: false };
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--out' || a === '-o') opts.out = argv[++i];
    else if (a === '--no-files') opts.noFiles = true;
    else if (a === '--help' || a === '-h') opts.help = true;
    else if (!opts.input && !a.startsWith('-')) opts.input = a;
  }
  return opts;
}

const HELP = `
移交包导入器

  node collector/import.js <handoff.json> [--out <目录>] [--no-files]

  --out <目录>   解包目标目录（默认当前目录下 handoff-<时间>）
  --no-files     只生成 Markdown 与任务清单，不落附件文件
`;

const STATUS_LABEL = {
  pending: '待开始',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
};

function fmtTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function fmtSize(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(1)} MB`;
}

function safeName(name, used) {
  const base = String(name || 'file')
    .replace(/[\/\\:*?"<>|\u0000-\u001f]/g, '_')
    .slice(0, 120);
  let candidate = base || 'file';
  let n = 1;
  while (used.has(candidate)) {
    const dot = base.lastIndexOf('.');
    const stem = dot > 0 ? base.slice(0, dot) : base;
    const ext = dot > 0 ? base.slice(dot) : '';
    candidate = `${stem}-${n}${ext}`;
    n += 1;
  }
  used.add(candidate);
  return candidate;
}

function buildMarkdown(pkg, fileMap) {
  const tasks = Array.isArray(pkg.tasks) ? pkg.tasks : [];
  const bySpace = new Map();
  for (const task of tasks) {
    const key = task.wb_user_label || (task.wb_user_id ? `账号 ${task.wb_user_id.slice(0, 6)}` : '未知账号');
    if (!bySpace.has(key)) bySpace.set(key, []);
    bySpace.get(key).push(task);
  }

  const lines = [];
  lines.push('# 任务移交包');
  lines.push('');
  lines.push(`- 导出时间：${fmtTime(pkg.exportedAt)}`);
  if (pkg.from && pkg.from.device) lines.push(`- 来源设备：${pkg.from.device}`);
  lines.push(`- 账号：${bySpace.size} 个 · 任务：${tasks.length} 个`);
  lines.push(`- 附件：${Object.keys(fileMap).length} 个（见 files/ 目录）`);
  lines.push('');
  lines.push('> 这份文件可以直接贴进 WorkBuddy 的对话里当上下文，或者放到项目目录里让它读。');
  lines.push('');

  for (const [spaceLabel, rows] of bySpace) {
    lines.push(`## ${spaceLabel}`);
    lines.push('');

    const bySession = new Map();
    for (const task of rows) {
      const key = task.session_title || '未命名会话';
      if (!bySession.has(key)) bySession.set(key, []);
      bySession.get(key).push(task);
    }

    for (const [sessionTitle, sessionTasks] of bySession) {
      lines.push(`### 会话：${sessionTitle}`);
      if (sessionTasks[0] && sessionTasks[0].project) {
        lines.push(`项目目录：\`${sessionTasks[0].project}\``);
      }
      lines.push('');

      sessionTasks.forEach((task, index) => {
        lines.push(`#### ${index + 1}. ${task.subject}`);
        lines.push('');
        lines.push(`- 状态：${STATUS_LABEL[task.status] || task.status || '未知'}`);
        lines.push(`- 创建：${fmtTime(task.created_at)} · 更新：${fmtTime(task.updated_at)}`);
        if (task.device_name) lines.push(`- 来源设备：${task.device_name}`);
        if (task.description) {
          lines.push('');
          lines.push(`**描述**`);
          lines.push('');
          lines.push(task.description.trim());
        }
        if (task.note) {
          lines.push('');
          lines.push(`**我的备注**`);
          lines.push('');
          lines.push(task.note.trim());
        }
        const attached = Object.entries(fileMap).filter(([, meta]) => meta.session_id === task.session_id);
        if (attached.length) {
          lines.push('');
          lines.push('**会话产物**');
          lines.push('');
          attached.forEach(([fileName, meta]) => {
            lines.push(`- \`files/${fileName}\`（${fmtSize(meta.size)}）`);
          });
        }
        lines.push('');
      });
    }
  }
  return lines.join('\n');
}

function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    process.stdout.write(HELP);
    return;
  }
  if (!opts.input) {
    process.stderr.write('用法：node collector/import.js <handoff.json> [--out <目录>]\n');
    process.exit(1);
  }

  const inputPath = path.resolve(opts.input);
  if (!fs.existsSync(inputPath)) {
    process.stderr.write(`找不到文件：${inputPath}\n`);
    process.exit(1);
  }

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  } catch (err) {
    process.stderr.write(`解析失败：${err.message}\n`);
    process.exit(1);
  }

  if (!pkg || pkg.kind !== 'wb-task-handoff') {
    process.stderr.write('这不是「任务同步站」导出的移交包（缺少 kind: wb-task-handoff）。\n');
    process.exit(1);
  }

  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '-')
    .slice(0, 13);
  const outDir = path.resolve(opts.out || path.join(process.cwd(), `handoff-${stamp}`));
  fs.mkdirSync(outDir, { recursive: true });

  const fileMap = {};
  const used = new Set();
  const files = Array.isArray(pkg.files) ? pkg.files : [];
  let written = 0;
  let missing = 0;

  if (!opts.noFiles && files.length) {
    const fileDir = path.join(outDir, 'files');
    fs.mkdirSync(fileDir, { recursive: true });
    for (const file of files) {
      const name = safeName(file.name, used);
      fileMap[name] = { size: file.size, session_id: file.session_id, mime: file.mime };
      if (!file.base64) {
        missing += 1;
        continue;
      }
      try {
        fs.writeFileSync(path.join(fileDir, name), Buffer.from(file.base64, 'base64'));
        written += 1;
      } catch (err) {
        process.stderr.write(`写入 ${name} 失败：${err.message}\n`);
      }
    }
  } else {
    for (const file of files) {
      fileMap[safeName(file.name, used)] = { size: file.size, session_id: file.session_id, mime: file.mime };
    }
  }

  const markdown = buildMarkdown(pkg, fileMap);
  fs.writeFileSync(path.join(outDir, '任务包.md'), markdown, 'utf8');
  fs.writeFileSync(
    path.join(outDir, 'tasks.json'),
    JSON.stringify({ importedAt: new Date().toISOString(), from: pkg.from, tasks: pkg.tasks }, null, 2),
    'utf8'
  );

  const lines = [
    '解包完成',
    `  目录      ${outDir}`,
    `  任务      ${(pkg.tasks || []).length} 个`,
    `  附件      ${written} 个已落盘${missing ? `，${missing} 个未随包携带（未上传或过大）` : ''}`,
    `  任务包    ${path.join(outDir, '任务包.md')}`,
    '',
    '把「任务包.md」拖进 WorkBuddy 对话，或让它在那个目录下工作即可。',
    '',
  ];
  process.stdout.write(lines.join('\n'));
}

if (require.main === module) main();
