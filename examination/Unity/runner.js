#!/usr/bin/env node
/**
 * Unity 交互课件 · 本地运行器
 * 1) 静态托管课程站点
 * 2) POST /api/run  -> 用本机 dotnet 真实编译执行 C# 片段，返回控制台输出
 *
 * 用法：node runner.js [port]
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, execFileSync } = require('child_process');

const PORT = Number(process.argv[2] || process.env.PORT || 7788);
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

/* ---------------- C# 工程准备 ---------------- */
const PROJ_DIR = path.join(os.tmpdir(), 'wb-unity-cs-runner');
const PROJ_FILE = path.join(PROJ_DIR, 'Run.csproj');
const CODE_FILE = path.join(PROJ_DIR, 'Program.cs');

function ensureProject() {
  fs.mkdirSync(PROJ_DIR, { recursive: true });
  const csproj = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net9.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>disable</Nullable>
    <AssemblyName>Run</AssemblyName>
    <RootNamespace>Run</RootNamespace>
    <InvariantGlobalization>true</InvariantGlobalization>
    <RunWorkingDirectory>$(MSBuildProjectDirectory)</RunWorkingDirectory>
    <NoWarn>CS0168;CS0219;CS8321;CS7022;CS0649</NoWarn>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
    <PackageReference Include="MessagePack" Version="2.5.187" />
  </ItemGroup>
</Project>`;
  if (!fs.existsSync(PROJ_FILE) || fs.readFileSync(PROJ_FILE, 'utf8') !== csproj) {
    fs.writeFileSync(PROJ_FILE, csproj, 'utf8');
  }
}

let dotnetPath = null;
function resolveDotnet() {
  if (dotnetPath) return dotnetPath;
  const cands = ['/usr/local/share/dotnet/dotnet', '/opt/homebrew/bin/dotnet', '/usr/bin/dotnet'];
  for (const c of cands) if (fs.existsSync(c)) { dotnetPath = c; return c; }
  try {
    dotnetPath = execFileSync('which', ['dotnet']).toString().trim();
  } catch (e) {
    dotnetPath = 'dotnet';
  }
  return dotnetPath;
}

/** 若用户片段没有 Main，则包一层；支持 using 指令置顶 */
function wrap(code) {
  if (/static\s+(async\s+)?(void|int|Task)\s+Main\s*\(/.test(code)) return code;
  const usings = [];
  let body = code;
  const lines = code.split('\n');
  const rest = [];
  for (const ln of lines) {
    if (/^\s*using\s+[\w\.]+\s*;\s*$/.test(ln)) usings.push(ln.trim());
    else rest.push(ln);
  }
  body = rest.join('\n');
  return `${usings.join('\n')}
using System;
using System.IO;
using System.Text;
using System.Collections.Generic;
using System.Linq;

public static class Program
{
    public static void Main()
    {
${body}
    }
}
`;
}

let busy = false;
function runCs(code, timeoutMs) {
  return new Promise((resolve) => {
    if (busy) return resolve({ ok: false, stderr: '运行器正忙，请稍后重试。' });
    busy = true;
    const t0 = Date.now();
    try {
      ensureProject();
      fs.writeFileSync(CODE_FILE, wrap(code), 'utf8');
      const child = spawn(resolveDotnet(), ['run', '--project', PROJ_FILE, '-c', 'Release', '--nologo', '-v', 'q'], {
        cwd: PROJ_DIR,
        env: { ...process.env, DOTNET_CLI_TELEMETRY_OPTOUT: '1', DOTNET_NOLOGO: '1', DOTNET_SKIP_FIRST_TIME_EXPERIENCE: '1' },
        stdio: ['ignore', 'pipe', 'pipe']
      });
      let out = '', err = '';
      const killer = setTimeout(() => { try { child.kill('SIGKILL'); } catch (e) {} }, timeoutMs || 25000);
      child.stdout.on('data', (d) => { out += d.toString(); });
      child.stderr.on('data', (d) => { err += d.toString(); });
      child.on('close', (code) => {
        clearTimeout(killer);
        busy = false;
        resolve({ ok: code === 0, stdout: out, stderr: err, ms: Date.now() - t0, exit: code });
      });
      child.on('error', (e) => {
        clearTimeout(killer);
        busy = false;
        resolve({ ok: false, stderr: '无法启动 dotnet：' + e.message });
      });
    } catch (e) {
      busy = false;
      resolve({ ok: false, stderr: String(e && e.message || e) });
    }
  });
}

/* ---------------- HTTP ---------------- */
const server = http.createServer((req, res) => {
  const u = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // 允许课件从 file:// 或其他本地端口跨源调用运行接口
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (u.pathname === '/api/ping') {
    let ver = '';
    try { ver = execFileSync(resolveDotnet(), ['--version']).toString().trim(); } catch (e) { ver = 'not-found'; }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ ok: true, dotnet: ver, port: PORT }));
  }

  if (u.pathname === '/api/run' && req.method === 'POST') {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 2e6) req.destroy(); });
    req.on('end', async () => {
      let code = '';
      try { code = JSON.parse(body).code || ''; } catch (e) {}
      if (!code.trim()) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ ok: false, stderr: '没有收到代码。' }));
      }
      const r = await runCs(code, 25000);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(r));
    });
    return;
  }

  let p = decodeURIComponent(u.pathname);
  if (p === '/' || p === '') p = '/index.html';
  const file = path.join(ROOT, path.normalize(p).replace(/^([\/\\])+/, ''));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403); return res.end('forbidden');
  }
  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 ' + p);
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  Unity 交互课件已启动`);
  console.log(`  站点： http://localhost:${PORT}/`);
  console.log(`  C#  真实运行接口： POST http://localhost:${PORT}/api/run`);
  console.log(`  退出： Ctrl+C\n`);
});
