#!/usr/bin/env node
/**
 * 把 data/*.json 打包成同名 .js
 *
 * 为什么需要这一步：
 *   浏览器直接双击打开本地 html（file:// 协议）时，安全策略禁止 fetch 读取本地
 *   json 文件；但 <script src="..."> 是允许的。所以生成一份内容相同的 .js，
 *   页面在 fetch 失败时会自动改用这个文件。
 *
 * 用法：node tools/build-data.js
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");

function load(name) {
  const p = path.join(dataDir, name + ".json");
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    console.error(`data/${name}.json 不是合法 JSON：` + e.message);
    process.exit(1);
  }
}

function emit(name, globalName, data, summary) {
  const out =
`/* 本文件由 tools/build-data.js 从 data/${name}.json 自动生成，请勿手工编辑。
   改词库请改 ${name}.json，然后运行： node tools/build-data.js
   生成时间：${new Date().toISOString()}
   内容：${summary} */
window.${globalName} = ${JSON.stringify(data)};
`;
  fs.writeFileSync(path.join(dataDir, name + ".js"), out, "utf8");
  console.log(`已生成 data/${name}.js`);
  console.log("  " + summary);
  console.log("  体积：" + (Buffer.byteLength(out, "utf8") / 1024).toFixed(0) + " KB");
}

const dict = load("dict");
if (dict) {
  const n = [2, 3, 4].map(k => `${k}词短语 ${(dict.phrases && dict.phrases[k] || []).length}`).join(" · ");
  emit("dict", "__EN_DICT__", dict, `${n} · 默认词库 ${(dict.defaultWords || []).length} 词`);
}

const phon = load("phon");
if (phon) {
  emit("phon", "__EN_PHON__", phon,
    `单词 ${Object.keys(phon.words || {}).length} · 短语 ${Object.keys(phon.phrases || {}).length}`);
}

const levels = load("levels");
if (levels) {
  emit("levels", "__EN_LEVELS__", levels,
    (levels.levels || []).map(g => `${g.name} ${g.words.length}`).join(" · "));
}

const reading = load("reading");
if (reading) {
  emit("reading", "__EN_READING__", reading,
    (reading.grades || []).map(g => `${g.name} ${g.articles.length} 篇`).join(" · "));
}
