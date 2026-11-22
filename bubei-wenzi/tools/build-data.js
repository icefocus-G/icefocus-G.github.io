#!/usr/bin/env node
/* 把 data/*.json 编译成 data/*.js（file:// 下 fetch 被禁，只能用 <script> 兜底）
 * 用法：node tools/build-data.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');
const read = f => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));

// 字源库
const chars = read('chars.json');
delete chars._note;
fs.writeFileSync(path.join(dataDir, 'chars.js'), 'window.__CHARS__=' + JSON.stringify(chars) + ';\n');
console.log(`chars.js  ${Object.keys(chars).length} 字`);

// 各年级生字表
const books = [];
let total = 0;
for (let g = 1; g <= 6; g++) {
  const f = `zi-${g}.json`;
  if (!fs.existsSync(path.join(dataDir, f))) continue;
  const d = read(f);
  total += d.list.length;
  fs.writeFileSync(path.join(dataDir, `zi-${g}.js`), 'window.__ZI_' + g + '__=' + JSON.stringify(d) + ';\n');
  books.push({ id: g, name: d.name, ref: d.ref, count: d.list.length });
  console.log(`zi-${g}.js  ${d.list.length} 字  ${d.name}`);
}
fs.writeFileSync(path.join(dataDir, 'books.js'), 'window.__ZI_BOOKS__=' + JSON.stringify(books) + ';\n');
console.log(`books.js  ${books.length} 册，共 ${total} 字`);
