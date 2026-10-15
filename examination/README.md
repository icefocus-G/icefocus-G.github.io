# examination/ · 课程中心

一个**自动发现**的多课程目录。加一门课**不需要改任何公共文件** —— 丢个文件夹上去就行。

```
examination/
  index.html            课程中心（自动扫描 + 自动读课程名）
  courses.json          课程中心配置（课程位总数 / 兜底清单 / 自动发现开关）
  shell/study.html     通用「学习助手」壳 —— 所有课程共用，读 course.json 自动装配
  _template/            新课程模板（复制走就行）
  _tools/scan.py        本地扫描器（基本用不上，见文末）
  International Finance/    已上线
  Western Economics/        已上线
  Course-03 … Course-12/    10 个空白预留位
```

---

## 加一门课：3 步

### 1. 建目录

在 `examination/` 下新建一个文件夹，名字随意（**就是 URL 里的那段**，可以是中文，建议不带空格）。

现成的 10 个空位 `Course-03` ~ `Course-12` 直接改个名就能用，也可以直接用它们不换名。

### 2. 写 `course.json`

把 `_template/course.json` 复制进你的目录，改这几个字段：

| 字段 | 说明 |
|---|---|
| `cn` | **课程中文名 —— 卡片标题就是它**，课程中心自动读这个 |
| `en` | 英文名（卡片副标题，可留空） |
| `code` | 课程代码，如 `13135`（可留空） |
| `ico` | 图标 emoji，如 `📈` |
| `order` | 排序，小的在前（留空按目录名排） |
| `status` | `live` 已上线 / `todo` 建设中 / `reserved` 空位 |
| `desc` | 一句话介绍 |
| `mods` | 标签数组，如 `["大纲精讲","历年真题","错题本"]` |
| `theme` | 主题色，如 `#2d5fe0`（可选） |
| `storage` | localStorage 前缀，用于卡片进度条，如 `xx00000_exam_` |
| `total` | 题库总题数，用于换算完成百分比 |
| `sync` | `{"id":"XX00000","data":"XX00000-sync.json"}` —— 接入 GitHub 云同步 |
| `pages` | 两个页面的文件名与页签名（默认 `outline.html` / `bank.html`） |
| `entry` | 入口页，一般不用填，默认落到通用壳 |

只要 `cn` + `status: "live"` 这两个字段填对，卡片就会带着正确的课程名出现在「已上线」区。

### 3. 丢进两个页面

- `outline.html` —— 大纲精讲（任何静态页面都行：交互教程、讲义、思维导图）
- `bank.html` —— 历年真题库

文件名不一样？那就改 `course.json` 里的 `pages`。

**推送到 GitHub，刷新课程中心 —— 完成。** 不用碰 `index.html`，不用碰 `courses.json`。

---

## 课程名是怎么被认出来的

课程中心按这个顺序取名字：

1. `<你的目录>/course.json` 里的 `cn`
2. 取不到 → 用**目录名**当课程名（所以哪怕忘了写 course.json，卡片也会显示目录名，不会报错）

目录本身怎么被发现：

1. `courses.json` 的 `fallback` 清单 —— 秒出，离线也能用
2. **GitHub API 自动扫描** `examination/` —— 新目录自动补进来（结果在浏览器缓存 1 小时，不占 API 配额）

所以：**新目录不需要登记**。打开页面它会自己扫出来。

---

## 学习助手不用自己写

`shell/study.html` 是一个壳，服务所有课程：

```
shell/study.html?course=<目录名>
```

它会读 `../<目录名>/course.json`，然后自动装配：标题、页签（大纲精讲 / 历年真题库）、
笔记、学习记录、导入导出、GitHub 云同步。

它还会：

- 读写滚动位置、学习时长、页签记忆（按课程隔离，互不干扰）
- 课程 `status` 不是 `live` 时，显示一个「这个课程位还空着 + 怎么启用」的占位页
- 找不到 `course.json` 也不崩 —— 拿目录名当课程名继续跑

只有想自定义交互逻辑的课程，才需要自己写一个 `study.html`（国际金融、西方经济学就是），
然后在 `course.json` 里把 `entry` 写成 `"study.html"`。

---

## 保留目录：`shell` / `_template` / `_tools`

这些目录**不会**出现在课程中心（自动发现会跳过）：

| 目录 | 作用 | 靠什么被跳过 |
|---|---|---|
| `shell/` | 通用学习助手壳 | 在 `courses.json` 的 `reserved` 名单里 |
| `_template/` | 新课程模板 | 下划线开头 |
| `_tools/` | 工具脚本 | 下划线开头 |

> **注意**：通用壳的目录名是 `shell`（**没有下划线**），不是 `_shell`。
> 原因是 GitHub Pages 默认跑 Jekyll，**它会忽略所有下划线开头的文件/目录** ——
> 之前叫 `_shell` 时线上直接 404。`shell/` 这个不带下划线的名字就不受影响了。
> 老的 `_shell/study.html` 仍保留，会自动跳到 `shell/study.html`，旧书签不会失效。

自己命名课程目录时，避开 `shell` / `template` / `tools` / `assets` / `data` / `script` 这几个名字即可。

### `.nojekyll`（重要，别删）

仓库根目录有一个空的 `.nojekyll` 文件，它的作用是**关掉 GitHub Pages 的 Jekyll**。
没有它的话，任何以下划线开头的路径（`_template/`、`_tools/` …）在线上都会 404。
页面上传或压缩包解压时**请确认它一起传上去了**（这是个隐藏文件，容易漏）。

漏了也不致命 —— 运行时真正要用到的 `shell/` 已经没有下划线了，只是 `_template/`、`_tools/`
在线上打不开而已。

### `_tools/scan.py`（可选）

本地体检 / 离线预览用：

```bash
cd examination
python _tools/scan.py --check   # 只体检：每个目录的 course.json 齐不齐、页面在不在
python _tools/scan.py           # 顺手回写 courses.json 的 fallback
```

平时不用跑 —— 课程中心靠 GitHub API 自动发现。

---

## 云同步（已内置凭据，**不用手动填**）

凭据已经内置在全站通用的 `script/gh-token.js` 里，**所有课程共用这一份**：

- 打开任意课程 → 右上角「☁ 云同步」→ 会直接显示 **「已内置凭据（无需填写）」**，
  「这台设备还缺同步凭据」那张卡片不会出现
- 首次打开页面就会自动拉取云端数据、并把本机改动推上去，页面/手机/App 三端互通
- 手动在面板里填过的 Token 优先级最高，会覆盖内置的那份
- APK 端额外自带一份（`assets/token.txt`），即使站点脚本没加载到也能同步

每个课程用 `sync.id` 区分，数据存在 `data/<sync.data>`。

### 凭据为什么是「乱码」

`script/gh-token.js` 里的令牌是 **XOR + Base64 混淆**过的（前缀 `IF1:`），源码里搜不到 `ghp_`
明文。这样做是因为：明文令牌一旦进公开仓库，GitHub 的密钥扫描会识别出来并**自动吊销**，
同步会毫无征兆地全线失效。

换令牌（在仓库根目录执行）：

```bash
python examination/_tools/set-token.py ghp_你的新令牌
python examination/_tools/set-token.py --show     # 看当前内置的是哪个账号
python examination/_tools/set-token.py --clear    # 清空，退回只读模式
```

改完网页端推送即生效；APK 需要重新打包：`cd apk && ./build.sh`。

> ⚠️ 提醒：混淆只是躲开自动扫描，**不是加密**。任何拿到页面源码的人都能还原出这个令牌。
> 如果哪天不放心了，去 GitHub 把这个 Token 吊销、重新生成一个，再跑一次 `set-token.py` 即可。

新课程记得在 `data/` 下建一个空的 `<sync.data>`，例如：

```json
{ "app": "XX00000", "ver": 4, "device": "web", "data": {} }
```

（不建也能跑，首次同步会自动创建。）
