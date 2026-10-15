# examination/ · 课程中心

一个**自动发现**的多课程目录。加一门课**不需要改任何公共文件** —— 丢个文件夹上去就行。

```
examination/
  index.html            课程中心（自动扫描 + 自动读课程名）
  courses.json          课程中心配置（课程位总数 / 兜底清单 / 自动发现开关）
  _shell/study.html     通用「学习助手」壳 —— 所有课程共用，读 course.json 自动装配
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

`_shell/study.html` 是一个壳，服务所有课程：

```
_shell/study.html?course=<目录名>
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

## 关于 `_shell` / `_template` / `_tools`

以下划线开头的目录会被自动发现**跳过**，不会出现在课程中心：

| 目录 | 作用 |
|---|---|
| `_shell/` | 通用学习助手壳 |
| `_template/` | 新课程模板 |
| `_tools/` | 工具脚本 |

### `_tools/scan.py`（可选）

本地体检 / 离线预览用：

```bash
cd examination
python _tools/scan.py --check   # 只体检：每个目录的 course.json 齐不齐、页面在不在
python _tools/scan.py           # 顺手回写 courses.json 的 fallback
```

平时不用跑 —— 课程中心靠 GitHub API 自动发现。

---

## 云同步

每个课程用 `sync.id` 区分，数据存在 `data/<sync.data>`。

- 打开课程 → 右上角「☁ 云同步」→ 粘贴一次 GitHub Token（Fine-grained，
  只授权这一个仓库，权限只勾 `Contents: Read and write`）
- 之后答题、判分、笔记全部自动上传，网页 / 手机 / App 三端互通
- Token 只存在浏览器 localStorage，**永远不要写进仓库**

新课程记得在 `data/` 下建一个空的 `<sync.data>`，例如：

```json
{ "app": "XX00000", "ver": 4, "device": "web", "data": {} }
```

（不建也能跑，首次同步会自动创建。）
