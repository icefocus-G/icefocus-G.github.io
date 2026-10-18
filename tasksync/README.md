# 任务同步站

把 WorkBuddy 里的任务记录和会话产物，聚合成一个可以跨设备、跨账号使用的看板。

- **主账号看板**：一个账号登录，看到所有设备、所有 WorkBuddy 账号的任务
- **本机采集器**：读取 `~/.workbuddy` 里的任务清单与会话产物清单
- **选择性共享**：逐条决定哪条记录可以给别的账号用
- **移交包**：勾选后导出一个自包含文件，在另一台电脑上解包即可使用

```
task-sync/
├── index.html          看板页面（已部署到云端）
├── styles.css
├── app.js
├── config.js           云服务公开配置
├── vendor/
│   └── workbuddy-cloud-sdk.js   云端 SDK（自托管，避免公共 CDN 不通）
└── collector/
    ├── collect.js      采集器（零依赖，Node 18+）
    └── import.js       移交包导入器
```

## 一、它怎么工作

```
WorkBuddy 本机数据                  云端                      其他设备 / 其他账号
~/.workbuddy/tasks/**/*.json
~/.workbuddy/artifact-index/*.json  →  tasks / files 表  →    主账号登录即看全部
~/.workbuddy/workbuddy.db           →  spaces 表          →    勾选后导出移交包
   （会话标题、账号 ID）                 （账号与共享策略）
        ↑
   collector 采集
```

1. 采集器扫描任务 JSON、产物索引，并从 `workbuddy.db` 取会话标题和**会话所属的 WorkBuddy 账号**
2. 看板在本机浏览器里读取采集器（`127.0.0.1:8787`），合并写入云端
3. 任意设备、任意 WorkBuddy 账号登录同一个主账号，看到的是同一份汇总

任务按 `设备ID:会话ID:任务ID` 唯一，重复同步不产生重复记录。

## 二、第一次使用

1. 打开看板页面，点「**微信扫码登录**」授权（这是"主账号"）；也可以直接用手机号 / 邮箱验证码登录
   - 想让微信授权页直接弹出来：打开 `https://wb-task-sync.app.workbuddy.host/?auth=wechat`
   - 微信登录走微信开放平台扫码（`snsapi_login`），需要手机微信扫码并在手机上点「确认登录」
   - 换登录方式不会迁移数据：云库按登录账号（`owner_id`）隔离，两个登录方式就是两套数据
2. 在装了 WorkBuddy 的那台电脑上启动采集器：

```bash
cd task-sync
node collector/collect.js --serve
```

3. 回到看板，点左下角「同步本机任务」→「从本机同步」
4. 手机打开同一个链接、登录同一账号，任务就都在了

> 同一台电脑上切换过多个 WorkBuddy 账号也没关系：采集器会按会话所属账号自动分组，侧栏「账号」里能看到。

## 三、多账号与共享

### 账号识别

采集器读 `workbuddy.db` 的 `sessions.user_id`，把每个任务归到它所属的 WorkBuddy 账号下。侧栏「账号」区块列出所有出现过的账号，点一下即筛选，点右侧 ⚙ 可以：

- 起个名字（比如「工作号」「私人号」），显示名只存在云端，不会改动 WorkBuddy
- 设置**默认共享策略**：默认共享 / 默认私有 / 逐条决定，只影响之后新同步进来的任务

### 共享的含义

共享不是"把数据给别人账号"，而是给**同一个主账号下的自己**做标记：这条记录允许被挑进移交包。

- 任务详情里的开关：`允许其他账号取用`
- 批量：顶栏 ✓ 进入选择模式，勾选后「设为共享 / 设为私有」
- 统计卡「共享中」可以点击，只看共享记录

## 四、把记录拿到另一台电脑

1. 看板里进入选择模式，勾选要带走的任务
2. 点「导出移交包」，得到 `handoff-时间.json`（附件 ≤ 5MB 会内嵌，总量上限 40MB）
3. 拷到目标电脑，解包：

```bash
node collector/import.js handoff-20261018-1435.json
# 或指定目录
node collector/import.js handoff-xxx.json --out ~/WorkBuddy/shared-tasks
```

产出：

```
handoff-xxx/
├── 任务包.md     带任务、描述、备注、附件清单的 Markdown
├── tasks.json    机器可读的任务列表
└── files/        随包携带的原始文件
```

把 `任务包.md` 拖进 WorkBuddy 对话（或让它在那个目录下工作），内容就成了那次会话的上下文。

## 五、采集器用法

```bash
node collector/collect.js                # 扫描一次，生成 tasks-snapshot.json
node collector/collect.js --json         # 扫描结果打到标准输出
node collector/collect.js --serve        # 启动本机桥（默认 127.0.0.1:8787）
node collector/collect.js --serve --port 8788
node collector/collect.js --write-agent  # 生成 macOS 开机自启配置
```

选项：`--home <dir>` 指定数据目录（默认 `~/.workbuddy`），`--out <file>` 指定快照路径。

本机桥的端点：

| 路径 | 作用 |
| --- | --- |
| `/health` | 存活检查，返回设备信息 |
| `/tasks` | 完整扫描结果（任务 + 账号 + 产物清单） |
| `/file?uid=…` | 读取已登记产物的原始字节，只认扫描结果里的文件，不接受任意路径 |

### 一键安装（推荐，不用手动管进程）

```bash
# macOS / Linux（脚本以 .txt 发布：站点 WAF 会拦 .sh 下载，内容仍是 bash）
curl -fsSL https://wb-task-sync.app.workbuddy.host/collector/install.txt | bash

# Windows（PowerShell）
powershell -c "iwr https://wb-task-sync.app.workbuddy.host/collector/install.ps1 -UseBasicParsing | iex"
```

装到 `~/.wb-task-sync`，注册开机自启（macOS LaunchAgent / Linux systemd user unit / Windows 计划任务），
装完会自己跑一次自检并验证 `/health`。换端口 `--port 8790`，卸载 `--uninstall`（Windows 用 `-Port` / `-Uninstall`），
只想下载不注册自启加 `--no-service`。

### 手动方式（macOS，可选）

```bash
node collector/collect.js --write-agent
launchctl load -w ~/Library/LaunchAgents/dev.workbuddy.tasksync.plist
```

## 六、同步规则

| 情况 | 行为 |
| --- | --- |
| 新任务 | 新增，共享状态按该账号的默认策略 |
| 已存在、你没改过状态 | 标题、描述、状态跟随本机最新值 |
| 已存在、你在看板改过状态 | 保留你改的状态，只更新标题/描述等 |
| 你手动改过共享开关 | 永远保留，不被默认策略覆盖 |
| 完全没变化的任务 | 跳过写入 |
| 手动新建的任务 | 不会被本机采集覆盖 |

## 六点五、同步范围（传什么由你定）

点「从本机读取」后不会立刻上传，而是先出「同步范围」：

| 维度 | 说明 |
| --- | --- |
| WorkBuddy 账号 | 多选，默认全选；新出现的账号默认也包含 |
| 时间范围 | 全部 / 近 7 / 30 / 90 天（按任务最后更新时间；没有时间的任务在限定范围时被排除） |
| 会话产物 | 关掉就完全不上传文件 |
| 文件类型 | 图片 / 文档 / 数据 / 代码 / 其他，按后缀和 MIME 判定 |

选择存在 `localStorage`，**静默自动同步也按同一套规则走**，不存在"手动选了、自动又全传"。

## 七、能不能搬到 GitHub Pages？

不能直接搬，会卡在登录。这个应用的云服务按「注册来源」放行，实测：

| 请求来源 | 结果 |
| --- | --- |
| `https://wb-task-sync.app.workbuddy.host` | `200 []` |
| `https://你的名字.github.io` | `403 access_denied` |
| 任意其他域名 | `403 access_denied` |

（CORS 层其实会回显任意 `Origin`，拦住它的是应用级白名单，不是浏览器跨域。）

想搬到别的域名，只有一条路：在「设置—数据管理—应用」把该域名加入允许来源。加不了就只能留在这个域名。
如果只是想给代码做版本管理，推到 GitHub **私有仓库**即可——托管仓库和托管站点是两件事。

另外一条硬边界：**网页无法下载并自动执行本地程序**。任何站点（含 GitHub Pages）都不能静默往你磁盘写文件再运行。
所以"自动"落在本机常驻服务上：装一次采集器 → 开机自启 → 打开看板就静默同步。

## 八、数据与隐私

- 任务、账号名、产物文件都在云数据库 / 对象存储里，按登录账号做行级隔离（`owner_id`），别人登录看不到
- 采集器只在本机回环地址提供服务，不监听外网
- 任务描述与备注会原文同步；移交包里的附件是原始字节，会落地到解包目录
- 单个产物超过 25MB 不进清单，超过 5MB 不进移交包（只留清单条目）

## 八、常见问题

**任务数比 WorkBuddy 里少？** 只采集 `tasks` 目录下的任务清单文件；没建过任务列表的会话不会有记录。

**侧栏没出现某个账号？** 那个账号在当前机器上还没有产生过任务清单，或者读不到 `user_id`（此时任务会归到「未知账号」）。

**换了电脑？** 在新电脑也跑一次采集器、点一次同步，设备不同、任务会合并；侧栏可按设备或账号筛选。

**采集器连不上？** 看板是 https，浏览器访问 `http://127.0.0.1` 通常放行；被拦就用快照文件方式（`node collector/collect.js` 后把 `tasks-snapshot.json` 拖进同步弹窗）。

**页面提示「登录组件加载失败」？** `vendor/workbuddy-cloud-sdk.js` 没加载成功。升级 SDK：
`npm install --registry=https://registry.npmmirror.com @tencent-ai/workbuddy-cloud-sdk@dev`，
再把 `node_modules/@tencent-ai/workbuddy-cloud-sdk/lib/index.global.js` 覆盖过去。

---

## 附：为什么放在 GitHub Pages 上打不开？

这份源码同步到仓库是为了**备份和自行部署**，但直接访问
`https://icefocus-g.github.io/tasksync/` **用不了**：

| 请求来源 Origin | 云端接口返回 |
|---|---|
| `https://wb-task-sync.app.workbuddy.host` | `200` |
| `https://icefocus-g.github.io` | `403 access_denied` |

WorkBuddy 云服务对每个应用做了**应用级来源白名单**（不是 CORS —— CORS 层会原样回显
任意 Origin，是应用自己按 Origin 拒绝的）。浏览器改不了自己发出的 `Origin`，
所以在 GitHub Pages 上登录、读写任务一律被拒。页面打开时会自己弹出这条提示，
并给出可用站点的链接。

想让它真正跑在 GitHub 上，只能把 `config.js` 里的 `endpoint` / `publishableKey`
换成自己开通的应用配置（来源填你的 GitHub Pages 域名），本目录下的代码不用改。
