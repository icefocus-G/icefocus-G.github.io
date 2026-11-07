/* data/*.json → data/*.js
   本地双击打开（file://）时浏览器禁止 fetch 读文件，页面改用这些 .js 兜底。
   改了任何 json 都要跑一次：  node tools/build-data.js                       */
const fs = require("fs");
const path = require("path");

const DATA = path.join(__dirname, "..", "data");

const MAP = [
  ["books",  "__MATH_BOOKS__"],
  ["types",  "__MATH_TYPES__"],
  ["know",   "__MATH_KNOW__"],
  ["apply",  "__MATH_APPLY__"],
  ["tables", "__MATH_TABLES__"],
];

let ok = 0;
for (const [name, global] of MAP) {
  const src = path.join(DATA, name + ".json");
  if (!fs.existsSync(src)) {
    console.log("  跳过 " + name + ".json（不存在）");
    continue;
  }
  const raw = fs.readFileSync(src, "utf8");
  const json = JSON.parse(raw);
  const out = path.join(DATA, name + ".js");
  fs.writeFileSync(
    out,
    "/* 由 tools/build-data.js 生成，不要手改；改 data/" + name + ".json 后重跑 */\n" +
    "window." + global + " = " + JSON.stringify(json) + ";\n",
    "utf8"
  );
  ok++;
  console.log("  " + name + ".js  " + (fs.statSync(out).size / 1024).toFixed(1) + " KB");
}
console.log("完成 " + ok + " 份");
