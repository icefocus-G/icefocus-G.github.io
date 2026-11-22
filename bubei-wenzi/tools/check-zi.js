#!/usr/bin/env node
/* 校验生字表：单字、顺序、字段完整、不泄题、干扰项合法、字源全覆盖
 * 用法：node tools/check-zi.js
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const chars = JSON.parse(fs.readFileSync(path.join(root, 'data/chars.json'), 'utf8'));

let bad = 0, total = 0;
const seen = new Map();

function fail(g, i, c, msg) { console.log(`g${g}#${i} ${c || '?'} — ${msg}`); bad++; }

for (let g = 1; g <= 6; g++) {
  const f = path.join(root, `data/zi-${g}.json`);
  if (!fs.existsSync(f)) continue;
  let d;
  try { d = JSON.parse(fs.readFileSync(f, 'utf8')); }
  catch (e) { console.log(`g${g} JSON 解析失败：${e.message}`); bad++; continue; }

  d.list.forEach((it, i) => {
    total++;
    const c = it.c;

    if (!c || Array.from(String(c)).length !== 1) fail(g, i, c, 'c 必须是一个汉字');
    if (it.p == null || !/^[a-züǖǘǚǜāáǎàēéěèīíǐìōóǒòūúǔùńňǹ]/.test(String(it.p))) fail(g, i, c, `拼音可疑：${it.p}`);
    if (!it.d) fail(g, i, c, '缺释义 d');
    else if (String(it.d).includes(c)) fail(g, i, c, `释义里出现本字（会泄题）：${it.d}`);
    if (!it.e) fail(g, i, c, '缺例句 e');
    else if (!String(it.e).includes(c)) fail(g, i, c, `例句里没有本字，卡片挖不出空：${it.e}`);

    if (!Array.isArray(it.g) || !it.g.length) fail(g, i, c, '缺组词 g');
    else it.g.forEach(w => { if (!String(w).includes(c)) fail(g, i, c, `组词「${w}」不含本字`); });

    if (!Array.isArray(it.x) || it.x.length !== 3) fail(g, i, c, `干扰项必须是 3 个：${JSON.stringify(it.x)}`);
    else {
      const set = new Set();
      it.x.forEach(x => {
        if (Array.from(String(x)).length !== 1) fail(g, i, c, `干扰项不是单字：${x}`);
        if (x === c) fail(g, i, c, '干扰项里有本字');
        if (set.has(x)) fail(g, i, c, `干扰项重复：${x}`);
        set.add(x);
      });
    }

    if (!chars[c]) fail(g, i, c, '字源库没有这个字');

    if (seen.has(c)) fail(g, i, c, `与其他年级重复（g${seen.get(c)}）`);
    else seen.set(c, g);
  });

  console.log(`g${g} ${d.name}：${d.list.length} 字  ${d.ref}`);
}

console.log(`\n合计 ${total} 字，字源库 ${Object.keys(chars).length - 1} 字`);
console.log(bad ? `\n共 ${bad} 处问题` : '\n全部通过 ✅');
