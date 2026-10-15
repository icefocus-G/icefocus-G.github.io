# ThemedSkin · 首页皮肤

根目录的 `index.html` **不再是一个固定首页**，它只是一个「随机皮肤加载器」：

| 行为 | 说明 |
| --- | --- |
| 每次打开首页 | 从本目录随机抽一套皮肤全屏展示 |
| 文件名 | **任意**，多一个少一个都不用改代码 |
| 右下角胶囊 | `换一个` 手动轮下一套；`锁定` 之后这台设备一直用当前这套 |
| 指定皮肤 | `index.html?skin=xxx.html`（会自动锁定，方便分享 / 调试） |
| 默认皮肤 | `default.html`，永远保留，找不到任何皮肤时兜底用它 |

## 加一套新皮肤

1. 把做好的完整 HTML 页面丢进这个文件夹，**名字随便起**（如 `aurora.html` / `纸感白.html`）；
2. 双击 `script/rebuild-skins.command`（或 `node script/rebuild-skins.js`）刷新清单；
3. 打开根目录 `index.html` 刷新即可参与随机。

> 不跑第 2 步也行：在 http/https 下访问时，加载器会额外去读本目录的 `manifest.json`，
> 清单里没有的新皮肤在下一次访问时仍有可能被漏掉——建议还是顺手跑一次。

## 皮肤里要注意的两点

- 皮肤是**完整的独立 HTML 页面**，自己的 `<style>` / `<script>` 自给自足，互不影响；
- 皮肤运行在 `ThemedSkin/` 这个路径下，页面里的相对链接要往上退一级，例如
  课程中心写成 `../examination/`，不要写成 `examination/`。

## 可选择的显示名

不想用文件名做胶囊上的名字时，在皮肤 `<head>` 里加一行：

```html
<meta name="skin-name" content="极光">
```

没有这行就依次取 `<title>`、文件名。

## 皮肤自带的外部资源

单文件皮肤（CSS/JS 全部内联）直接丢进来就行。
如果皮肤还带着自己的 css / js / 图片，请把它们放进**专属子目录**，别直接放 `assets/`：

```
ThemedSkin/ThemedSkin01.html
ThemedSkin/assets/skin01/style.css     ← 专属子目录，避免和其它皮肤撞名
ThemedSkin/assets/skin01/app.js
```

页面里的引用也要跟着改，例如：

```html
<link rel="stylesheet" href="assets/skin01/style.css" />
<script src="assets/skin01/app.js"></script>
```

## 目录里的其它文件

- `manifest.json` —— 重建脚本自动生成的清单，别手改；
- `default.html` —— 默认皮肤（原首页，暗色粒子 + ICEFOCUS 逐字）；
- `ThemedSkin01.html` —— 游戏视觉（暗色宇宙 + 作品集画廊，依赖 `assets/skin01/`）；
- `ThemedSkin02.html` —— 设计印刷（明亮编辑风，单文件零依赖）；
- `assets/skin01/` —— ThemedSkin01 的 style.css / cosmos.js / app.js。

## 皮肤里的站内入口

两套新皮肤都只保留**一个**站内入口（导航栏 + 页脚各一份），新皮肤照抄即可：

```html
<a href="../examination/">Learning Course</a>
```

> 路径里的 `../` 不能省，皮肤是在 `ThemedSkin/` 下运行的。
> 课程中心下面已经有大纲精讲 / 历年真题库 / 教程，皮肤上不需要再单独挂「教程」入口。
>
> ⚠ 别给这个链接加自定义的圆角 / 描边 / 投影 —— 直接沿用皮肤自己的 `.nav-item`
> 之类样式，默认态和旁边的导航项长得一样，只在 hover 时才变色。
