# -*- coding: utf-8 -*-
"""模块内容源 A：m01 UI Toolkit / m02 NavMesh。
blocks 类型：p / h3 / list / table / code / note / kv
note kind: key(核心) / tip(建议) / warn(坑) / info(背景)
"""

M01 = {
    "id": "m01", "cat": "界面层", "icon": "🎨",
    "title": "UI Toolkit", "sub": "运行时 UI 新体系：UXML + USS + C#",
    "stack": "界面层 · UI 架构",
    "game": "HUD（血条 / 体力 / 弹药）、背包网格、主菜单与设置、技能栏、对话系统",
    "other": "编辑器扩展与工具窗口、数据密集的桌面应用、需要样式热重载的后台系统",
    "sections": [
        {
            "id": "why", "h": "1 先摆正位置：运行时官方仍推荐 UGUI",
            "blocks": [
                ("note", "warn", "**先说清楚一件事，免得学错方向。** 截至 Unity 6.3 / 6.5，官方 UI 系统对比文档里写的仍然是：**运行时推荐 uGUI，UI Toolkit 是「alternative（替代方案）」；编辑器推荐 UI Toolkit**。所以 UI Toolkit 不是「UGUI 的接班人」，现在也不是运行时的默认选择。学它是为了在数据密集的场景用对工具，不是为了全面替换 uGUI。"),
                ("p", "Unity 里同时存在三套 UI 方案。最容易犯的错，是**用 UGUI 的思维去写 UI Toolkit**——把每个元素都当 RectTransform，然后发现布局怎么都对不上。"),
                ("table", [
                    ["维度", "UGUI（Canvas）", "IMGUI（OnGUI）", "UI Toolkit"],
                    ["渲染", "场景内 Canvas，走 UI 合批", "立即模式，每帧重绘", "保留模式，独立渲染管线"],
                    ["布局", "RectTransform + 手动锚点", "代码里算坐标", "Flexbox（USS），像写网页"],
                    ["样式", "Inspector 逐项调", "GUIStyle", "USS 类 CSS，可热重载"],
                    ["列表", "自己写复用池", "自己算", "ListView 自带虚拟化"],
                    ["擅长", "游戏内 HUD、世界空间 UI", "编辑器工具、快速调试", "数据密集界面、复杂列表、编辑器扩展"],
                    ["运行时", "全版本", "全版本", "2021.2+"],
                ]),
                ("p", "**它现在还缺什么**，这张表比「它有什么」更能帮你做选型。以下是官方对比文档里明确标为不支持的："),
                ("table", [
                    ["能力", "UI Toolkit", "UGUI", "影响"],
                    ["与 Animation Clip / Timeline 集成", "不支持", "支持", "需要时间轴编排出场的 UI 动画，只能留在 UGUI"],
                    ["序列化事件（Inspector 里连回调）", "不支持", "支持", "只能在代码里注册，策划改不了"],
                    ["场景内可视化编辑（In-scene authoring）", "不支持", "支持", "必须在 UI Builder 里编辑资源文件"],
                ]),
                ("note", "key", "判断标准：界面元素超过 50 个、需要滚动列表、需要主题切换 → 选 UI Toolkit；**需要世界空间跟随 3D 物体、需要粒子/Shader 叠在 UI 上、需要 Timeline 编排 → 还是 UGUI**。两者可以在同一个项目里共存，实际项目里混合使用才是常态。"),
            ],
        },
        {
            "id": "tri", "h": "2 三件套：UXML / USS / C#",
            "blocks": [
                ("p", "UI Toolkit 的界面由三种文件协作，和网页的 HTML / CSS / JS 一一对应。理解这个映射关系，学习成本会立刻降一半。"),
                ("table", [
                    ["网页", "UI Toolkit", "职责"],
                    ["HTML", "UXML（.uxml）", "元素结构与层级"],
                    ["CSS", "USS（.uss）", "外观与布局"],
                    ["JavaScript", "C#", "行为、数据、事件"],
                ]),
                ("code", "xml", r"""<!-- HealthBar.uxml：容器 + 底槽 + 填充 + 文字 -->
<ui:UXML xmlns:ui="UnityEngine.UIElements">
  <ui:VisualElement name="hp-root" class="hp-root">
    <ui:VisualElement name="hp-fill" class="hp-fill"/>
    <ui:Label name="hp-text" text="100 / 100" class="hp-text"/>
  </ui:VisualElement>
</ui:UXML>"""),
                ("note", "tip", "UXML 是资源文件，运行时用 VisualTreeAsset 实例化。也可以纯 C# 建树（new VisualElement()），但结构一复杂就没法维护——除非是动态生成的格子，否则不要纯代码建树。"),
            ],
        },
        {
            "id": "uxml", "h": "3 UXML 结构与常用控件",
            "blocks": [
                ("p", "所有控件都继承自 **VisualElement**。容器本身也是 VisualElement，靠 flex 布局嵌套——没有「容器控件」这种特殊类型。"),
                ("table", [
                    ["控件", "用途", "关键点"],
                    ["VisualElement", "通用容器", "默认 display:flex，铺满父级"],
                    ["Label", "文本", "支持富文本标签"],
                    ["Button", "按钮", "clicked 事件"],
                    ["TextField", "输入框", "注意移动端软键盘遮挡"],
                    ["Toggle", "开关", "值变化用 ChangeEvent<bool>"],
                    ["Slider / SliderInt", "滑条", "ChangeEvent<float>"],
                    ["ScrollView", "滚动容器", "内容多时优于普通容器"],
                    ["ListView", "虚拟化列表", "只渲染可见行，背包必备"],
                    ["Foldout", "折叠组", "设置面板分组"],
                    ["ProgressBar", "进度条", "血条/经验条可直接用"],
                ]),
                ("note", "info", "UXML 里 name 属性是**唯一标识**，C# 靠它查找；class 属性是样式选择器，可以多个。和网页的 id / class 完全同构。"),
            ],
        },
        {
            "id": "uss", "h": "4 USS：背下这 8 个属性就够用",
            "blocks": [
                ("p", "游戏 UI 的布局有 95% 只用到 Flexbox 的少数属性。把这几个吃透，比拼凑各种偏方有用得多。"),
                ("table", [
                    ["属性", "作用", "常见值"],
                    ["flex-direction", "主轴方向", "row / column"],
                    ["justify-content", "主轴对齐", "flex-start / center / space-between"],
                    ["align-items", "交叉轴对齐", "center / flex-end / stretch"],
                    ["flex-grow", "剩余空间占比", "0 / 1"],
                    ["flex-shrink", "空间不足时收缩", "0（不收缩）/ 1"],
                    ["width / height", "尺寸", "px / % / auto"],
                    ["padding / margin", "内边距 / 外边距", "四向可单独设"],
                    ["gap", "子元素间距", "省掉一堆 margin"],
                ]),
                ("code", "css", r""".hp-root {
  position: absolute;      /* 绝对定位到屏幕上某个位置 */
  top: 24px; left: 24px;
  width: 240px; height: 28px;
  background-color: rgba(0, 0, 0, 0.55);
  border-radius: 14px;
  overflow: hidden;
  justify-content: center;
  align-items: center;
}

.hp-fill {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 70%;                       /* C# 里改这个值就是改血量 */
  background-color: rgb(220, 60, 60);
  transition: width 0.25s ease-out; /* 掉血带动画，不需要写协程 */
}

.hp-text {
  color: #fff;
  font-size: 13px;
  -unity-font-style: bold;
  -unity-text-align: middle-center;
}"""),
                ("note", "warn", "USS 不是完整 CSS：不支持 @media、对 ::before/::after 支持有限、calc() 在旧版本不可用、没有 float。写之前先确认当前 Unity 版本的 USS 支持范围，否则会白调半天。"),
            ],
        },
        {
            "id": "cs", "h": "5 C# 驱动：查询、事件、动态创建",
            "blocks": [
                ("code", "csharp", r"""using UnityEngine;
using UnityEngine.UIElements;

public class HudController : MonoBehaviour
{
    [SerializeField] UIDocument doc;
    [SerializeField] VisualTreeAsset slotTemplate;   // 拖一个 .uxml 进来

    VisualElement fill;
    Label text;

    void OnEnable()
    {
        var root = doc.rootVisualElement;

        // Q<T> 用 name 查；也可以 Q<Button>(className: "btn")
        fill = root.Q<VisualElement>("hp-fill");
        text = root.Q<Label>("hp-text");

        root.Q<Button>("btn-settings")?.RegisterCallback<ClickEvent>(_ => OpenSettings());

        // 动态创建：拿模板实例化，再塞进容器
        var slot = slotTemplate.Instantiate();
        slot.Q<Label>("slot-index").text = "1";
        root.Q<VisualElement>("bag-grid").Add(slot);
    }

    public void SetHp(int cur, int max)
    {
        float pct = max <= 0 ? 0f : (float)cur / max;
        fill.style.width = Length.Percent(pct * 100f);
        text.text = $"{cur} / {max}";
    }
}"""),
                ("table", [
                    ["事件类型", "触发时机"],
                    ["ClickEvent", "点击（含触摸）"],
                    ["ChangeEvent&lt;T&gt;", "值变化：Toggle / Slider / TextField"],
                    ["PointerEnterEvent / PointerLeaveEvent", "指针进入 / 离开"],
                    ["PointerDownEvent / PointerUpEvent", "按下 / 抬起"],
                    ["KeyDownEvent", "键盘按下"],
                    ["GeometryChangedEvent", "尺寸或位置变化（做自适应布局时用）"],
                ]),
                ("note", "tip", "元素还没布局完就读取 resolvedStyle.width 会拿到 0，因为布局发生在下一帧。要么等 GeometryChangedEvent，要么用 schedule.Execute(...).ExecuteLater(0) 推迟一帧。"),
            ],
        },
        {
            "id": "bind", "h": "6 数据绑定：两种，别混用",
            "blocks": [
                ("table", [
                    ["方式", "适用", "代价"],
                    ["序列化绑定（bind-path + SerializedObject）", "编辑器扩展、Inspector 替代品", "运行时性能差，且依赖 SerializedObject"],
                    ["运行时手动刷新（推荐）", "游戏内 HUD / 背包", "要自己写刷新方法，但完全可控"],
                ]),
                ("p", "游戏内界面几乎都应该用**手动刷新**：数据变了就调用一次 SetXxx()。它比绑定更啰嗦，但没有隐藏开销，也不会在你不想刷的时候刷。"),
                ("code", "csharp", r"""// 反例：每帧反射式刷新，帧率越高越亏
void Update() => label.text = player.hp.ToString();

// 正例：只在数据变化时推
public void OnHpChanged(int cur, int max) => SetHp(cur, max);

// 绑定事件而不是轮询
player.OnHpChanged += OnHpChanged;
void OnDisable() => player.OnHpChanged -= OnHpChanged;  // 别忘了退订"""),
            ],
        },
        {
            "id": "case1", "h": "7 实战一：血量条（三件套齐全）",
            "blocks": [
                ("p", "把第 2、4、5 节拼起来，就是一个能跑的 HUD 血条。关键在于**填充条用绝对定位 + width 百分比**，而不是改 scale——改 scale 会让圆角和描边变形。"),
                ("list", [
                    "结构：`hp-root`（底槽，overflow:hidden + 圆角）→ `hp-fill`（填充，绝对定位 left:0）→ `hp-text`（文字，居中）",
                    "数值：`fill.style.width = Length.Percent(pct * 100)`",
                    "动画：USS 的 `transition: width .25s` 直接生效，不需要协程",
                    "变色：低于 30% 时给 root 加 `class`，用 `.hp-root.low .hp-fill{ background-color: #ff3b30 }`",
                ]),
                ("note", "warn", "不要用 `style.width = pct * 240`（硬编码像素）。父容器尺寸一变就全错，而且高分屏下对不上。始终用百分比。"),
            ],
        },
        {
            "id": "case2", "h": "8 实战二：背包列表（ListView 虚拟化）",
            "blocks": [
                ("p", "背包有 200 格时，`for` 循环建 200 个元素会明显卡顿，而且滚动时全程占内存。**ListView 只创建可见的十几行**，滚动时复用。"),
                ("code", "csharp", r"""ListView bag;

void BuildBag(List<Item> items)
{
    bag = doc.rootVisualElement.Q<ListView>("bag-list");

    bag.makeItem = () => slotTemplate.Instantiate();      // 造一个空壳（只造可见数量）
    bag.bindItem = (el, i) =>                             // 把数据填进去（滚动时反复调用）
    {
        var it = items[i];
        el.Q<VisualElement>("icon").style.backgroundImage = new StyleBackground(it.icon);
        el.Q<Label>("count").text = it.count > 1 ? it.count.ToString() : "";
        el.Q<VisualElement>("sel").EnableInClassList("on", i == selectedIndex);
    };
    bag.itemsSource = items;       // 数据源
    bag.fixedItemHeight = 88;      // 固定行高是虚拟化的前提
    bag.selectionType = SelectionType.Single;
    bag.Rebuild();                 // 数据变了要 Rebuild
}"""),
                ("note", "key", "虚拟化的前提是**固定行高**。如果格子高度不一，ListView 会退化成全量渲染，性能优势消失——这种场景改用 ScrollView + 自己做池。"),
            ],
        },
        {
            "id": "case3", "h": "9 实战三：设置面板（Toggle + Slider）",
            "blocks": [
                ("code", "csharp", r"""void BindSettings()
{
    var root = doc.rootVisualElement;

    var music = root.Q<Toggle>("tg-music");
    music.value = PlayerPrefs.GetInt("opt.music", 1) == 1;
    music.RegisterValueChangedCallback(e =>
    {
        AudioListener.volume = e.newValue ? 1f : 0f;      // e.newValue 而不是 music.value
        PlayerPrefs.SetInt("opt.music", e.newValue ? 1 : 0);
    });

    var sens = root.Q<Slider>("sl-sens");
    sens.lowValue = 0.1f; sens.highValue = 5f;
    sens.value = PlayerPrefs.GetFloat("opt.sens", 1f);
    sens.RegisterValueChangedCallback(e => PlayerPrefs.SetFloat("opt.sens", e.newValue));
}"""),
                ("note", "tip", "回调里一律用 `e.newValue`，不要回读控件的 `.value`。滑块拖动时两者可能不一致，而且回读会让「程序改值」和「用户改值」纠缠在一起。"),
            ],
        },
        {
            "id": "landing", "h": "10 落地模式：什么场景配什么做法",
            "blocks": [
                ("table", [
                    ["游戏 UI", "UI Toolkit 做法", "要不要用"],
                    ["HUD 血条 / 弹药", "ProgressBar 或绝对定位填充条 + USS transition", "推荐"],
                    ["背包 / 商店网格", "ListView + 固定行高 + 选中态 class", "推荐"],
                    ["主菜单 / 设置", "UXML 分文件 + Foldout 分组", "推荐"],
                    ["技能栏", "ListView 横向模式 或 固定数量 Button", "可选（数量少用 Button 更简单）"],
                    ["对话系统", "ScrollView + 逐字机（定时追加 text）", "推荐"],
                    ["跟随 3D 物体的血条", "——", "用 UGUI + World Space，别硬套"],
                ]),
            ],
        },
        {
            "id": "pitfalls", "h": "11 坑与最佳实践",
            "blocks": [
                ("list", [
                    "**面板数量控制**：每个 UIDocument 是一次 Draw Call。把常驻 HUD 合成一个 UIDocument，弹窗各自独立。",
                    "**display 与 visibility**：`display:none` 不参与布局、不渲染；`visibility:hidden` 保留布局、不渲染。做显示隐藏动画时用后者。",
                    "**不要每帧改 style**：改 `style.width` 会触发布局重算。数值没变就别赋值，或加脏标记。",
                    "**资源释放**：动态 Instantiate 的 VisualTreeAsset 记得在关闭面板时 RemoveFromHierarchy，否则越积越多。",
                    "**移动端软键盘**：TextField 在 Android 上会顶起画面，需在 UIDocument 的 PanelSettings 里配好缩放模式。",
                    "**字体**：UI Toolkit 用的是 FontAsset，不是 Font。中文字体要先做子集，否则包体暴涨。",
                    "**PanelSettings 资产**：一个项目通常一个，负责缩放模式（Scale With Screen Size）和分辨率参考值——这是全局的，别每个界面各建一个。",
                ]),
            ],
        },
    ],
    "quiz": [
        {
            "q": "背包有 300 个格子，用 UI Toolkit 实现时最该选哪个控件？",
            "opts": ["for 循环 new 300 个 VisualElement", "ListView + 固定行高", "ScrollView 里铺 300 个 Button", "IMGUI 的 BeginScrollView"],
            "a": 1,
            "why": "ListView 做虚拟化，只实例化可见行并复用；但前提是行高固定，否则会退化成全量渲染。",
        },
        {
            "q": "血条的填充部分应该怎么控制长度？",
            "opts": ["改 transform.scale.x", "硬编码像素 width", "style.width = Length.Percent(pct*100)", "改 margin-left"],
            "a": 2,
            "why": "scale 会让圆角和描边变形；硬编码像素在父容器尺寸变化和高分屏下都会失真。百分比 + USS transition 是标准做法。",
        },
        {
            "q": "Slider 的 RegisterValueChangedCallback 里，为什么要用 e.newValue 而不是回读 slider.value？",
            "opts": ["性能更好", "避免「程序改值」与「用户改值」纠缠，且拖动瞬间两者可能不一致", "e.newValue 是只读的所以更快", "没有区别，习惯问题"],
            "a": 1,
            "why": "拖动过程中回读控件值可能拿到尚未同步的旧值，也会让「我用代码改了值」触发同一回调，形成循环。",
        },
        {
            "q": "下面哪种 UI 最不适合用 UI Toolkit？",
            "opts": ["200 行的设置列表", "跟随 3D 角色头顶的血条", "主菜单", "编辑器扩展工具窗口"],
            "a": 1,
            "why": "UI Toolkit 目前不擅长世界空间 UI（跟随 3D 物体、被遮挡关系影响）。这类需求仍应使用 UGUI 的 World Space Canvas。",
        },
    ],
}


M02 = {
    "id": "m02", "cat": "AI 与导航", "icon": "🧭",
    "title": "NavMesh 进阶", "sub": "承接 Unity m09 第 8 章，只讲它没展开的部分",
    "stack": "AI 与空间导航（进阶）",
    "game": "敌人追击与巡逻、NPC 自动寻路、点击移动（RTS / MOBA）、程序化地图（肉鸽 / 塔防）的寻路重建",
    "other": "机器人路径规划、AGV 仓储调度、室内导航、无人机航线、地图服务的可达性分析",
    "sections": [
        {
            "id": "scope", "h": "1 先划清边界：哪些 Unity m09 已经讲了",
            "blocks": [
                ("note", "warn", "**本篇不是入门。** Unity 课程 m09 已有一个独立的「8- 导航寻路系统」章节，讲了概念、组件字段和面板操作。本篇只补它没展开的三件事：**烘焙参数怎么调、寻路代价怎么设、网格怎么在运行时重建**。没看过 m09 的话，先回去看那一章，否则这里会跟不上。"),
                ("table", [
                    ["主题", "去哪看", "本篇是否重讲"],
                    ["NavMesh 概念、与 A* 的关系、系统组成", "Unity m09 · 01 概述", "不重讲"],
                    ["Agent 各属性字段的含义（Speed / Stopping Distance 等）", "Unity m09 · 03 寻路组件", "不重讲，只讲字段的坑"],
                    ["OffMeshLink 的 Start / End / Cost Override 字段", "Unity m09 · 04 网格外连接", "不重讲，只讲跨越的控制权接管"],
                    ["动态障碍的 Shape / Carve 基本概念", "Unity m09 · 05 动态障碍", "不重讲，只讲什么场景该开"],
                    ["**烘焙参数的实际取值、Areas 代价、路径查询 API、运行时重建**", "**本篇**", "m09 基本空白"],
                ]),
                ("p", "为什么这些算「空白」：m09 的「02 导航网格生成」一节正文只有几十个字，Bake 页签的七八个参数基本靠截图带过；`NavMeshPath`、`NavMesh.CalculatePath`、`NavMeshSurface` 在那一章里一次都没出现。而这些恰恰是项目里真正会卡住你的地方。"),
                ("note", "key", "顺带把最容易被忽略的一层认知补上：**NavMesh 解决的是「在地形上怎么走」，不是「该往哪走」**。追击、撤退、巡逻这些决策仍要你自己写状态机；NavMesh 只负责把决策结果变成一个可达的位置。"),
                ("note", "warn", "**还有一个版本问题要知道。** m09 讲的是 `Window > AI > Navigation` 那个面板和它的 Bake 页签，但从 Unity 2022 起、到 Unity 6 已经明确移除：**旧的内置 Navigation 窗口不再存在**，烘焙改成组件式——装 `com.unity.ai.navigation` 包，给地形挂 `NavMeshSurface`，在组件的 Inspector 里点 Bake。所以如果你用的是 Unity 6，按 m09 去找那个窗口会找不到；本篇第 8 节讲的就是这套组件式工作流，包括它带来的运行时重建能力。"),
            ],
        },
        {
            "id": "bake", "h": "2 烘焙参数：m09 只给了截图，这里逐个讲",
            "blocks": [
                ("p", "Bake 页签里的每个参数，本质上都在回答同一个问题：**这块地面，一个多大的角色能走过去？** 关键是要意识到参数之间不独立——单独调对某一个，未必对。"),
                ("table", [
                    ["参数", "决定什么", "调错的后果"],
                    ["Agent Radius", "烘焙边缘精确度，决定可行走区域离墙留多远", "偏小 → 卡墙；偏大 → 窄门被封死，整条路断掉"],
                    ["Agent Height", "决定拱桥、门洞下方能否穿越", "偏大 → 洞被填成实心，通道消失"],
                    ["Max Slope", "斜坡超过此角度即视为不可走", "偏小 → 缓坡也走不上去；偏大 → 陡坡能爬，违反直觉"],
                    ["Step Height", "台阶小于此值可直接迈上", "偏小 → 一段楼梯被切成几十块不连通区域"],
                    ["Min Region Area", "小于此面积的孤立碎片被丢弃", "设 0 会留下大量走不出去的小岛"],
                    ["Height Mesh", "生成高度网格，让角色贴合起伏", "平坦地形开着纯属白烧性能"],
                    ["Generated Off Mesh Links", "Drop Height / Jump Distance 自动生成跳落连接", "开太大 → 角色从该断开的地方\"自动跳\"，像开了挂"],
                ]),
                ("note", "warn", "最常见的低级错误是 **Agent Radius 填 0**。这意味着可行走区域紧贴碰撞体边缘，一点余量都不留，实际跑起来角色会反复和边缘碰撞、卡在墙角。经验值取角色胶囊半径 × 0.9。"),
                ("note", "tip", "**Agent Radius 和 Step Height 是一对**：楼梯台阶的高度要小于 Step Height，同时楼梯宽度要大于 2 × Agent Radius，一段楼梯才可能被烘成连续可走面。只改其中一个，楼梯照样断。"),
            ],
        },
        {
            "id": "areas", "h": "3 Areas 与寻路代价",
            "blocks": [
                ("p", "Areas 让同一张地图上的地面具有**不同的通行代价**。A* 会优先走代价低的区域——这是做「敌人绕开泥地」「NPC 只走人行道」的正解。"),
                ("table", [
                    ["Area", "默认代价", "典型用途"],
                    ["Walkable", "1", "普通地面"],
                    ["Not Walkable", "—", "墙、水面、岩浆（永不通行）"],
                    ["Jump", "2", "跳跃连接（代价高，非必要不走）"],
                    ["自定义（如 Mud / Road）", "自定", "泥地代价调高 → 绕行；大路代价调低 → 优先"],
                ]),
                ("code", "csharp", r"""// 只允许走 Walkable + Road 两个区域
int mask = (1 << NavMesh.GetAreaFromName("Walkable"))
         | (1 << NavMesh.GetAreaFromName("Road"));
agent.areaMask = mask;

// 运行时临时禁行某个区域（比如桥塌了）
agent.areaMask &= ~(1 << NavMesh.GetAreaFromName("Bridge"));"""),
            ],
        },
        {
            "id": "agent", "h": "4 Agent 的四个坑（字段含义见 m09）",
            "blocks": [
                ("p", "Speed / Angular Speed / Acceleration / Stopping Distance 这些字段叫什么、干什么，m09 的 03 节已经逐个列过了，这里不重复。只说四个**字段名看起来正常、用起来会出错**的地方。"),
                ("p", "**坑一：用 `remainingDistance` 判断到没到。** 它看起来最直观，实际最不可靠——在 `pathPending == true` 期间返回 `Infinity`，路径不完整时也没有意义。"),
                ("code", "csharp", r"""// 错误写法：会「有时到了不触发、有时瞬间触发」
bool bad(NavMeshAgent a) => a.remainingDistance <= 0.5f;

// 正确写法：四个条件缺一不可
bool Arrived(NavMeshAgent a)
{
    if (a.pathPending) return false;                 // 路径还在算
    if (!a.hasPath) return true;                     // 无路可走
    if (a.pathStatus != NavMeshPathStatus.PathComplete) return true;
    return a.remainingDistance <= a.stoppingDistance + 0.05f;
}"""),
                ("p", "**坑二：改了 `areaMask` 不生效。** 掩码只在**下一次寻路**时被读取，当前已经算好的路径不会重算。改完必须重新 `SetDestination` 一次。"),
                ("p", "**坑三：`radius` 和烘焙时的 Agent Radius 不一致。** 运行时的 `agent.radius` 只影响代理之间的避障推挤，**不影响它实际能走哪**——能不能走是烘焙时定死的。把运行时 radius 调小，角色不会因此钻进更窄的缝，但会和别的代理挤得更近，表现为穿模。"),
                ("p", "**坑四：`avoidancePriority` 的方向是反的。** 数值 **0 是最高优先级**，越大越容易被推开。想做一个「不会被杂兵挤开」的 Boss，要把它调到接近 0，而不是 99。"),
            ],
        },
        {
            "id": "query", "h": "5 路径查询三件套（m09 完全没提）",
            "blocks": [
                ("p", "点击移动、可达性判断、视线预警，都靠这三个**静态方法**，而不是让 agent 真的跑一遍再观察结果。这是本篇最值得带走的一节——m09 里这三个 API 一次都没出现。"),
                ("code", "csharp", r"""// 1) SamplePosition：把任意点吸附到最近的 NavMesh 上
//    点击地面拿到的点常常不在 NavMesh 上（尤其在斜坡/边缘）
if (NavMesh.SamplePosition(clickPoint, out var hit, 2f, NavMesh.AllAreas))
    agent.SetDestination(hit.position);

// 2) Raycast：判断两点之间有没有被墙/断开阻隔（比物理射线便宜且贴 NavMesh）
NavMeshHit navHit;
bool blocked = NavMesh.Raycast(agent.position, target, out navHit, NavMesh.AllAreas);
if (blocked) Debug.DrawLine(agent.position, navHit.position, Color.red);

// 3) CalculatePath：只算路径不移动，用来做「能不能过去」的预判
var path = new NavMeshPath();
if (NavMesh.CalculatePath(agent.position, target, NavMesh.AllAreas, path)
    && path.status == NavMeshPathStatus.PathComplete)
{
    // path.corners 就是拐点数组，可以用来画路线、算真实路程
    float len = 0f;
    for (int i = 1; i < path.corners.Length; i++) len += Vector3.Distance(path.corners[i-1], path.corners[i]);
}"""),
                ("note", "tip", "**做点击移动一定要先 SamplePosition**。玩家点的是屏幕射线与地面的交点，边界处经常落在 NavMesh 之外，直接 SetDestination 会得到一个最近但很怪的贴合点，表现为「点这边，人跑那边」。"),
            ],
        },
        {
            "id": "offmesh", "h": "6 OffMeshLink：画不出跳跃的样子",
            "blocks": [
                ("p", "OffMeshLink 的 Start / End / Cost Override 字段含义在 m09 的 04 节已经讲了。这里解决它没覆盖的真问题：**默认行为是让 agent 匀速直线滑过去**，所以跳跃看着像平移、爬梯看着像飘。要改观感，必须自己接管这段位移。"),
                ("p", "接管的关键是三步：进入 link 时关掉 agent 的位姿驱动 → 自己插值或播动画 → 结束后调 `CompleteOffMeshLink()` 交还控制权。"),
                ("code", "csharp", r"""// 让角色在跨越时播跳跃动画：手动接管 OffMeshLink
void Update()
{
    if (agent.isOnOffMeshLink && !jumping)
    {
        jumping = true;
        var data = agent.currentOffMeshLinkData;
        StartCoroutine(JumpAcross(data.startPos, data.endPos));
    }
}

IEnumerator JumpAcross(Vector3 from, Vector3 to)
{
    agent.updatePosition = false;      // 松开控制权，自己插值
    agent.updateRotation = false;
    float t = 0f, dur = 0.4f;
    while (t < dur)
    {
        t += Time.deltaTime;
        float k = Mathf.Clamp01(t / dur);
        var p = Vector3.Lerp(from, to, k);
        p.y += Mathf.Sin(k * Mathf.PI) * 1.2f;   // 抛物线
        transform.position = p;
        yield return null;
    }
    agent.CompleteOffMeshLink();       // 交还控制权
    agent.updatePosition = true;
    agent.updateRotation = true;
    jumping = false;
}"""),
                ("note", "warn", "忘了调用 `CompleteOffMeshLink()`，agent 会永久卡在 link 上不动。这是 OffMeshLink 最常见的 bug。"),
            ],
        },
        {
            "id": "obstacle", "h": "7 动态障碍：carve 还是不 carve",
            "blocks": [
                ("p", "可移动的障碍（箱子、路障）有两种处理方式，选错会让性能或行为任一崩掉。"),
                ("table", [
                    ["策略", "做法", "开销", "效果"],
                    ["不 carve（默认）", "只靠 agent 的局部避障绕开", "低", "障碍物周围不会挖洞，agent 会贴着挤过去"],
                    ["carve = true", "在 NavMesh 上真实挖洞", "高（重新计算局部网格）", "路径真正绕开，像一堵墙"],
                ]),
                ("code", "csharp", r"""// 大而少（门、路障）：开 carve 才符合预期
var ob = box.GetComponent<NavMeshObstacle>();
ob.shape = NavMeshObstacleShape.Box;
ob.size = new Vector3(2f, 2f, 2f);
ob.carving = true;
ob.carveOnlyStationary = true;        // 只有静止时才挖洞，移动中不挖
ob.carvingTimeToStationary = 0.3f;   // 停下多久算「静止」

// 小而多（几十个滚来滚去的球）：别开 carve，交给避障
ob.carving = false;"""),
                ("note", "key", "判断口诀：**大而少 → carve；小而多 → 不 carve**。给几十个移动物体开 carve，每帧都在重建局部网格，帧率会断崖式下跌。"),
            ],
        },
        {
            "id": "runtime", "h": "8 运行时重建：解开 m09 那条局限",
            "blocks": [
                ("note", "info", "m09 的 01 节在讲概念时写过一句局限：**「只能在编辑模式下进行烘焙，游戏场景模式下不行」**。这句话在旧版 Navigation 面板下是对的，但用 `com.unity.ai.navigation` 包里的 **NavMeshSurface** 就可以在运行时重新构建——肉鸽、塔防、建造类这种程序化生成的地图，靠的就是它。"),
                ("p", "把 NavMeshSurface 挂到场景里，配好 agentType 与要收集的层，之后就能在代码里重建："),
                ("code", "csharp", r"""using Unity.AI.Navigation;

// 场景里挂 NavMeshSurface，配好 agentType 与收集的层
public void Rebuild()
{
    surface.BuildNavMesh();            // 同步构建，会卡一帧
}

// 更平滑的做法：异步更新，避免卡顿
public void RebuildAsync(NavMeshData data)
{
    var settings = NavMesh.GetSettingsByID(0);
    var src = new NavMeshBuildSource();
    var sources = new List<NavMeshBuildSource>();
    // ... 收集 sources ...
    NavMeshBuilder.UpdateNavMeshDataAsync(data, settings, sources, bounds);
}"""),
                ("table", [
                    ["时机", "做法", "注意"],
                    ["地图生成后一次", "BuildNavMesh()", "可接受一次卡顿"],
                    ["局部改动（放一个建筑）", "只更新该 bounds 内的数据", "bounds 要算准，否则边缘有洞"],
                    ["每帧变化", "不要重建，改用 NavMeshObstacle carve", "重建的开销是毫秒级"],
                ]),
                ("note", "warn", "不要在 `Update()` 里调 `BuildNavMesh()`。它的开销在毫秒量级，一帧调一次等于把帧率钉死。"),
            ],
        },
        {
            "id": "perf", "h": "9 性能与常见坑",
            "blocks": [
                ("list", [
                    "**别每帧 SetDestination**：目标没变就别调，否则每帧重算路径。给追击 AI 加个 0.2s 的节流。",
                    "**agent 数量**：几十个没问题；上百个要分帧更新（关 updatePosition/updateRotation，自己按帧分摊移动）。",
                    "**卡墙角**：90% 是 Agent Radius 与 collider 半径不匹配，或 stoppingDistance=0 导致贴脸推挤。",
                    "**穿墙**：agent 的 radius 小于烘焙时的 Agent Radius，会钻进本该不可走的缝隙。",
                    "**路径 Partial**：`pathStatus == PathPartial` 表示只能到最近可达点。UI 上要区分「到了」和「到不了」。",
                    "**多场景烘焙**：用 NavMeshSurface 的 Collect Objects 选择 Current Object / All / Volume，别漏了动态加载的场景。",
                    "**导航网格可视化**：Scene 视图开 Navigation 面板的 Show NavMesh，排查问题比读日志快十倍。",
                ]),
            ],
        },
        {
            "id": "beyond", "h": "10 跳出游戏：同一套思路还能用在哪",
            "blocks": [
                ("table", [
                    ["领域", "映射关系", "差异点"],
                    ["AGV / 仓储机器人", "NavMesh ≈ 可通行栅格地图", "要处理多机避障与死锁，比游戏严格"],
                    ["室内导航（商场/机场）", "导航网格 ≈ 楼层平面", "跨楼层要靠 OffMeshLink 式的连接（电梯/扶梯）"],
                    ["无人机航线", "3D 空间而非 2D 地面", "NavMesh 只有 2.5D，真 3D 要用体素/八叉树"],
                    ["地图服务可达性", "Areas ≈ 道路等级代价", "实时路况 = 动态代价，等价于运行时改 area cost"],
                ]),
                ("note", "info", "NavMesh 的本质是「**把连续空间离散成带权图 + 在其上跑 A***」。理解了这一层，换到任何寻路问题（包括非空间问题，如任务依赖排序）都能迁移。"),
            ],
        },
    ],
    "quiz": [
        {
            "q": "烘焙时 Agent Radius 填 0，最可能出现什么现象？",
            "opts": ["烘焙失败", "角色会一直卡墙角", "帧率下降", "路径变短"],
            "a": 1,
            "why": "Radius 为 0 意味着可行走区域紧贴碰撞体边缘，没有留出身位，实际跑动时反复与边缘碰撞而卡住。经验值约为角色胶囊半径 × 0.9。",
        },
        {
            "q": "点击移动时，为什么必须先 NavMesh.SamplePosition？",
            "opts": ["提升精度", "点击点常落在 NavMesh 之外，需要吸附到最近的可走点", "为了省性能", "避免射线穿透"],
            "a": 1,
            "why": "屏幕射线与地面的交点在地图边界、斜坡处经常不在 NavMesh 上。直接 SetDestination 会得到异常贴合点，表现为「点这边却跑那边」。",
        },
        {
            "q": "场景里有 50 个滚动的球需要绕开，NavMeshObstacle 该怎么配？",
            "opts": ["全部 carving=true", "全部 carving=false，交给避障", "一半开一半关", "改用 NavMeshSurface 每帧重建"],
            "a": 1,
            "why": "口诀是大而少用 carve、小而多用避障。carve 每帧都在重建局部网格，50 个同时开会直接拖垮帧率。",
        },
        {
            "q": "判断 agent 是否到达目标，正确做法是？",
            "opts": ["remainingDistance <= 0.5f 即可", "先看 pathPending，再看 hasPath 与 pathStatus，最后比 remainingDistance", "看 velocity 是否为 0", "看 destination 是否等于 position"],
            "a": 1,
            "why": "pathPending 期间 remainingDistance 返回 Infinity，路径不完整时也不可靠。必须组合判断，否则会出现「有时不触发、有时瞬触」的诡异现象。",
        },
    ],
}
