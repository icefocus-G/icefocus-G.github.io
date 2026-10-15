#!/usr/bin/env node
/* =========================================================================
 * 首页皮肤清单重建工具
 *
 *   作用：扫描 ThemedSkin/ 目录里的所有 .html / .htm 文件，
 *        按「文件名不分」的原则自动生成：
 *          · script/skins.js        —— 首页 loader 直接读的清单（file:// 也能用）
 *          · ThemedSkin/manifest.json —— 运行时可被 fetch 的动态清单
 *
 *   用法：
 *        node script/rebuild-skins.js
 *     或 双击 script/rebuild-skins.command
 *
 *   皮肤命名规则（可选）：不想用文件名做显示名时，在皮肤 HTML 的 <head> 里加一行
 *        <meta name="skin-name" content="极光">
 *     没有的话：先取 <title>，再退回到文件名（去掉扩展名）。
 * ========================================================================= */
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR  = path.join(ROOT, 'ThemedSkin');
const OUT_JS  = path.join(ROOT, 'script', 'skins.js');
const OUT_JSON= path.join(DIR, 'manifest.json');

function pickName(file) {
  const abs = path.join(DIR, file);
  let head = '';
  try {
    const txt = fs.readFileSync(abs, 'utf8');
    head = txt.slice(0, txt.search(/<\/head\s*>/i) > 0 ? txt.search(/<\/head\s*>/i) : 4096);
  } catch (e) { /* ignore */ }

  let m = /<meta[^>]+name\s*=\s*["']skin-name["'][^>]*content\s*=\s*["']([^"']*)["']/i.exec(head)
       || /<meta[^>]+content\s*=\s*["']([^"']*)["'][^>]*name\s*=\s*["']skin-name["']/i.exec(head);
  if (m && m[1].trim()) return m[1].trim();

  m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(head);
  if (m && m[1].trim()) return m[1].trim();

  return file.replace(/\.html?$/i, '');
}

function main() {
  if (!fs.existsSync(DIR)) {
    console.error('找不到目录：' + DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(DIR)
    .filter(f => /\.html?$/i.test(f))
    .filter(f => !/^\./.test(f))          // 排除 macOS 资源叉 ._xxx 与隐藏文件
    .filter(f => !/^manifest/i.test(f))
    .sort((a, b) => a.localeCompare(b, 'zh-CN'));

  if (!files.length) {
    console.error('ThemedSkin/ 里没有任何 .html 皮肤文件。');
    process.exit(1);
  }

  const skins = files.map(f => ({ file: f, name: pickName(f) }));

  // default 优先排第一，其余按文件名
  const ordered = skins.slice().sort((a, b) => {
    if (/^default/i.test(a.file)) return -1;
    if (/^default/i.test(b.file)) return 1;
    return 0;
  });

  const now = new Date().toISOString();

  const js = [
    '/* 本文件由 script/rebuild-skins.js 自动生成，请勿手工编辑。',
    ' * 新增 / 删除 ThemedSkin/ 里的皮肤后重新生成即可，文件名任意。',
    ' * 生成时间：' + now,
    ' */',
    'window.THEME_SKINS = ' + JSON.stringify(ordered, null, 2) + ';',
    ''
  ].join('\n');

  fs.mkdirSync(path.dirname(OUT_JS), { recursive: true });
  fs.writeFileSync(OUT_JS, js, 'utf8');
  fs.writeFileSync(OUT_JSON, JSON.stringify({ generatedAt: now, skins: ordered }, null, 2), 'utf8');

  console.log('已扫描 ThemedSkin/ ，共 ' + ordered.length + ' 套皮肤：');
  ordered.forEach((s, i) => console.log('  ' + (i + 1) + '. ' + s.name + '  (' + s.file + ')'));
  console.log('');
  console.log('已写入：' + path.relative(ROOT, OUT_JS));
  console.log('已写入：' + path.relative(ROOT, OUT_JSON));
}

main();
