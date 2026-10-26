# -*- coding: utf-8 -*-
"""模块内容源 B：m03 广告与双区域 / m04 计费点与标签 / m05 C 语言底层。
本地两份商业化素材（dual_region_ad_sdk 70KB、标签计费点模板 353KB）在此合并去重：
广告抽象层与 Provider 实现归 m03，标签/点位/内购/回传归 m04，互不重复。
"""

M03 = {
    "id": "m03", "cat": "商业化与发行", "icon": "📢",
    "title": "广告接入与双区域适配", "sub": "一套代码出海 + 回国 + 上小游戏",
    "stack": "商业化与发行 · 工程架构",
    "game": "变现层（激励视频 / 插屏 / 开屏）、版本切分、打包管线、多平台发布",
    "other": "移动应用广告变现、海外与国内合规分流、多租户/多品牌的构建矩阵",
    "sections": [
        {
            "id": "dims", "h": "1 先分清三个版本维度",
            "blocks": [
                ("note", "info", "**和 Unity-Games 的分工**：Unity-Games 里已经有大量商业化讨论——广告聚合该选 MAX 还是 TopOn、哪些节点做成变现点、皮肤包怎么定价。那些回答的是「**该做什么**」。本篇回答的是「**怎么写**」：SDK 怎么初始化、回调来了怎么分发、两套区域配置怎么在一份代码里共存、打包时怎么切。两篇不重复，接着看。"),
                ("p", "「国际版 / 国内版」不是一个开关，而是**三个独立维度的叠加**。很多项目一开始只按「区域」分，做到后面发现小游戏和 App 的广告 SDK 根本不是一套 API，只能推倒重来。"),
                ("table", [
                    ["维度", "取值", "影响什么"],
                    ["平台形态", "App（iOS / Android）、小游戏（微信 / 抖音）", "广告 SDK 完全不同：App 用原生 SDK，小游戏只能用平台 JS API"],
                    ["发行区域", "海外、国内", "广告平台、支付通道、隐私合规、审核规则"],
                    ["内容合规", "GDPR / CCPA / ATT（海外）、版号 / 实名 / 防沉迷（国内）", "初始化顺序、权限弹窗、SDK 采集范围"],
                ]),
                ("note", "key", "推荐组合策略：**一个工程 + 多套 asmdef + 一套构建脚本**。不要维护两份工程副本——两份副本三个月后必然分叉，改一个 bug 要改两遍，还经常漏。"),
            ],
        },
        {
            "id": "asmdef", "h": "2 程序集切分：让不该编译的代码根本不参与编译",
            "blocks": [
                ("p", "这是整个方案的地基。用 asmdef 的 **Platform 过滤 + Define Constraints**，让国内版工程里根本不存在 AdMob 的代码——不是「运行时不用」，而是「编译时不存在」。"),
                ("table", [
                    ["程序集", "内容", "约束"],
                    ["Game.Ads.Core", "接口、数据模型、工厂", "无平台依赖，全平台编译"],
                    ["Game.Ads.AdMob", "Google Mobile Ads 实现", "仅 Android / iOS，且 `USE_ADMOB`"],
                    ["Game.Ads.Max", "AppLovin MAX 聚合实现", "仅 Android / iOS，且 `USE_MAX`"],
                    ["Game.Ads.Pangle", "穿山甲实现", "仅 Android，且 `USE_PANGLE`"],
                    ["Game.Ads.GDT", "优量汇实现", "仅 Android，且 `USE_GDT`"],
                    ["Game.Ads.MiniGame", "微信 / 抖音小游戏实现", "仅 WebGL，且 `WECHAT_MINI` / `DOUYIN_MINI`"],
                ]),
                ("code", "json", r"""// Game.Ads.AdMob.asmdef
{
  "name": "Game.Ads.AdMob",
  "references": ["Game.Ads.Core"],
  "includePlatforms": ["Android", "iOS"],
  "defineConstraints": ["USE_ADMOB"],
  "versionDefines": [
    { "name": "com.google.ads.mobile", "expression": "1.0.0", "define": "HAS_ADMOB" }
  ]
}"""),
                ("note", "warn", "`defineConstraints` 不满足时整个程序集**不参与编译**——这正是我们要的。但注意：如果 Core 里有代码直接 `new AdMobProvider()`，就会编译失败。所以 Core 只能依赖接口，实例化必须交给工厂。"),
            ],
        },
        {
            "id": "abstract", "h": "3 统一广告抽象层（整个方案的地基）",
            "blocks": [
                ("p", "三个角色，缺一不可：**接口**定义能力、**工厂**决定实例化谁、**门面**收敛调用入口。业务层永远只跟门面说话。"),
                ("code", "csharp", r"""// ---- 1) 接口：只暴露业务真正需要的能力 ----
public interface IAdsProvider
{
    void Init(AdsConfig cfg);
    bool IsReady(AdSlot slot);
    void Load(AdSlot slot);
    void Show(AdSlot slot, Action<AdResult> onResult);
    void SetConsent(bool personalized);
}

public enum AdResult { Shown, Reward, Closed, Failed, NotReady }

// ---- 2) 工厂：用宏决定实例化谁 ----
public static class AdsProviderFactory
{
    public static IAdsProvider Create()
    {
#if USE_MAX
        return new MaxProvider();
#elif USE_ADMOB
        return new AdMobProvider();
#elif USE_PANGLE
        return new PangleProvider();
#elif USE_GDT
        return new GdtProvider();
#elif WECHAT_MINI || DOUYIN_MINI
        return new MiniGameProvider();
#else
        return new NullAdsProvider();   // 编辑器 / 无广告构建：什么都不做
#endif
    }
}

// ---- 3) 门面：业务唯一的入口 ----
public static class Ads
{
    static IAdsProvider p;
    public static void Init(AdsConfig cfg) { p = AdsProviderFactory.Create(); p.Init(cfg); }

    // 激励视频：拿到 Reward 才发奖
    public static void ShowReward(string slotId, Action<bool> onRewarded)
        => p.Show(slotId, r => onRewarded(r == AdResult.Reward));
}"""),
                ("note", "key", "`NullAdsProvider` 不是凑数——它让「编辑器里没接 SDK」也能正常跑通全部业务流程。没有它，团队一半人会卡在「我本地跑不起来」。"),
            ],
        },
        {
            "id": "config", "h": "4 广告位配置：不要硬编码 ID",
            "blocks": [
                ("p", "广告位 ID 一定会变（换账号、换平台、A/B 测试）。硬编码在代码里，每次改都要重新出包审核。用配置表按区域分档。"),
                ("code", "json", r"""{
  "region": "overseas",
  "slots": {
    "reward_double_coin": {
      "type": "rewarded",
      "providers": {
        "max":    "a1b2c3d4e5",
        "admob":  "ca-app-pub-xxx/yyy"
      },
      "cooldownSec": 30,
      "dailyCap": 20
    },
    "inter_level_end": {
      "type": "interstitial",
      "providers": { "max": "f6g7h8i9j0" },
      "minIntervalSec": 60
    },
    "banner_menu": { "type": "banner", "providers": { "max": "k1l2m3n4" } }
  }
}"""),
                ("list", [
                    "**按 region 分文件**：`ads_overseas.json` / `ads_cn.json`，构建时按宏挑一份打进包",
                    "**slot 用业务语义命名**：`reward_double_coin` 比 `reward_01` 好维护一百倍",
                    "**频控参数也进配置**：冷却、每日上限都在表里，改策略不用发版",
                ]),
            ],
        },
        {
            "id": "overseas", "h": "5 国际版：AdMob + AppLovin MAX",
            "blocks": [
                ("p", "国际版通常用 **MAX 做聚合**、AdMob 做兜底。聚合的价值是自动比价——同一个广告位同时问几家，谁出价高给谁。"),
                ("note", "warn", "**两条选型级的硬事实，官方文档里写着但很容易漏。** ① **Unity Ads 明确不可用于中国大陆安卓流量**（官方帮助中心原话是「中国大陆安卓流量不要使用 UnityAds 进行广告创收」）——这正说明区域分流不是过度设计，而是必须做的事，同一套广告栈在两地根本不能通用。② **聚合主 SDK 与各家 Adapter 的版本必须同步升级**。比如 MAX 从 11.x 升到 12.x 而 Adapter 没跟着升，广告请求能发出去，回传却会静默失败：日志里没有 error、只有一堆 warn，后台表现是填充率莫名掉一半。这种问题排查极费时间，升级时把主 SDK 和全部 Adapter 一起升，别自己组合版本。"),
                ("table", [
                    ["平台", "定位", "特点"],
                    ["AppLovin MAX", "聚合（Mediation）", "接多家广告源，自动比价；内置 A/B 与远程配置"],
                    ["Google AdMob", "单一广告源 / 也可聚合", "填充率稳，eCPM 中等；与 Firebase 打通"],
                ]),
                ("code", "csharp", r"""// 合规顺序极重要：先拿同意，再初始化 SDK
public class MaxProvider : IAdsProvider
{
    public void Init(AdsConfig cfg)
    {
        // 1) GDPR：向用户征询（欧洲）
        MaxSdk.SetHasUserConsent(cfg.GdprConsent);
        // 2) CCPA：美国加州「不要出售我的信息」
        MaxSdk.SetDoNotSell(!cfg.CcpaOptIn);
        // 3) ATT（iOS 14.5+）：必须在 SDK 初始化之前弹
        //    App Tracking Transparency 授权，否则 IDFA 拿不到，eCPM 直接腰斩
        MaxSdk.SetConsentFlowEnabled(true);

        MaxSdkCallbacks.OnSdkInitializedEvent += _ =>
        {
            MaxSdkCallbacks.Rewarded.OnAdLoadedEvent += (id, info) => cache[id] = AdResult.Shown;
            foreach (var s in cfg.RewardedSlots) MaxSdk.LoadRewardedAd(s);
            foreach (var s in cfg.InterstitialSlots) MaxSdk.LoadInterstitial(s);
        };
        MaxSdk.InitializeSdk();
    }
}"""),
                ("note", "warn", "**ATT 顺序错了 eCPM 会腰斩**：iOS 上如果先初始化广告 SDK 再弹 ATT，SDK 会在无 IDFA 状态下完成初始化，后续即便用户同意也拿不到设备标识。这个顺序必须写进代码注释，否则新人重构时会调回来。"),
            ],
        },
        {
            "id": "domestic", "h": "6 国内版：穿山甲 / 优量汇 + 服务端校验",
            "blocks": [
                ("table", [
                    ["平台", "归属", "备注"],
                    ["穿山甲（Pangle）", "字节跳动", "国内 eCPM 较高，激励视频强"],
                    ["优量汇（GDT）", "腾讯", "填充稳定"],
                    ["GroMore", "穿山甲系聚合", "国内做聚合的主流选择"],
                ]),
                ("code", "csharp", r"""// 国内 Android 必须在初始化前完成隐私合规声明
public class PangleProvider : IAdsProvider
{
    public void Init(AdsConfig cfg)
    {
        var ctx = UnityPlayer.currentActivity;
        // 1) 用户是否同意隐私政策（不同意就不能初始化）
        TTAdSdk.Init(new TTAdConfig.Builder()
            .AppId(cfg.PangleAppId)
            .AppName(cfg.AppName)
            .UseMediation(true)
            .SetPrivacyCompliance(new TTAdPrivacyComplianceConfig.Builder()
                .SetLimitPersonalAd(!cfg.PersonalizedAds)   // 个性化广告开关
                .Build())
            .Build(), _ => { /* 初始化完成后再 Load */ });
    }
}"""),
                ("p", "国内做激励视频，**服务端校验（SSV）不是可选项**。客户端回调可以被篡改，发奖逻辑必须由自己的服务器向广告平台核验后再下发。"),
                ("code", "text", r"""客户端：Show 时带上透传参数（订单号 + 用户 ID）
   ↓
广告平台：用户看完 → 平台服务器回调你的 /ad/reward?token=...
   ↓
你的服务器：验签 → 幂等检查（同一 token 只发一次）→ 发货
   ↓
客户端：轮询 / 长连接拿到发货结果 → 刷新 UI"""),
                ("note", "key", "判断标准很简单：**奖励有真实价值（金币、复活、抽卡）就必须走 SSV**。纯展示类（插屏、Banner）不需要。"),
            ],
        },
        {
            "id": "minigame", "h": "7 小游戏版本：微信 / 抖音",
            "blocks": [
                ("p", "小游戏跑在 WebGL 上，**不能接入原生广告 SDK**。只能用平台提供的 JS API，通过 jslib 桥接进 Unity。"),
                ("table", [
                    ["平台", "广告 API", "特点"],
                    ["微信小游戏", "wx.createRewardedVideoAd / createInterstitialAd", "需在后台开通流量主，有资质门槛"],
                    ["抖音小游戏", "tt.createRewardedVideoAd", "同理，走抖音开放平台"],
                ]),
                ("code", "javascript", r"""// Plugins/WeChatAds.jslib —— Unity 侧调到这里
mergeInto(LibraryManager.library, {
  ShowRewardAd: function (slotPtr, cbPtr) {
    var slot = UTF8ToString(slotPtr);
    var ad = wx.createRewardedVideoAd({ adUnitId: slot });
    ad.onClose(function (res) {
      var ok = res && res.isEnded;         // isEnded 才是「看完」
      dynCall('vii', cbPtr, [ok ? 1 : 0]);
    });
    ad.show().catch(function () {
      ad.load().then(function () { ad.show(); }).catch(function () {
        dynCall('vii', cbPtr, [0]);
      });
    });
  }
});"""),
                ("note", "warn", "微信的 `res.isEnded` 才是有效观看的判据。很多实现只判断 `onClose` 被调用就发奖，导致用户点右上角关闭也能领奖——这是最常见的漏损点。"),
            ],
        },
        {
            "id": "pipeline", "h": "8 构建管线：一键切版",
            "blocks": [
                ("p", "手工切 define symbols 一定会出错。写成 Editor 脚本，让「切国际版 / 切国内版 / 切小游戏」变成菜单里的一次点击，也是 CI 的唯一入口。"),
                ("code", "csharp", r"""public enum BuildTarget2 { Overseas, Domestic, WeChat, Douyin }

public static class BuildSwitcher
{
    static readonly Dictionary<BuildTarget2, string[]> Defines = new()
    {
        [BuildTarget2.Overseas] = new[] { "USE_MAX", "USE_ADMOB" },
        [BuildTarget2.Domestic] = new[] { "USE_PANGLE", "USE_GDT" },
        [BuildTarget2.WeChat]   = new[] { "WECHAT_MINI" },
        [BuildTarget2.Douyin]   = new[] { "DOUYIN_MINI" },
    };

    [MenuItem("Build/切到国际版")]
    static void ToOverseas() => Apply(BuildTarget2.Overseas, "com.company.game", "ads_overseas");

    static void Apply(BuildTarget2 t, string bundleId, string cfgName)
    {
        var g = BuildTargetGroup.Android;
        // 清掉所有广告相关宏，再设当前这套——避免残留
        var all = Defines.Values.SelectMany(x => x).ToArray();
        var cur = PlayerSettings.GetScriptingDefineSymbolsForGroup(g)
                    .Split(';').Where(s => s.Length > 0 && !all.Contains(s)).ToList();
        cur.AddRange(Defines[t].SelectMany(x => x.Split(',')));
        PlayerSettings.SetScriptingDefineSymbolsForGroup(g, string.Join(";", cur));

        PlayerSettings.SetApplicationIdentifier(g, bundleId);
        // 再拷贝对应的 ads 配置到 Resources
        AssetDatabase.CopyAsset($"Assets/AdsConfig/{cfgName}.json", "Assets/Resources/ads.json");
    }
}"""),
                ("note", "tip", "CI 里可以直接走 `-executeMethod BuildSwitcher.ToOverseas`，配合 `-quit -batchmode`，一条命令出对应版本的包。"),
            ],
        },
        {
            "id": "gradle", "h": "9 Android 多渠道",
            "blocks": [
                ("p", "国内安卓要上多个应用商店，每个渠道的广告 ID、推送 SDK、统计都有差异。用 Gradle 的 productFlavors 而不是打多个包。"),
                ("code", "gradle", r"""android {
  flavorDimensions "channel"
  productFlavors {
    tencent { dimension "channel"; applicationIdSuffix "" }
    huawei  { dimension "channel"; applicationIdSuffix "" }
    xiaomi  { dimension "channel"; applicationIdSuffix "" }
  }
  sourceSets {
    tencent { res.srcDirs += 'src/tencent/res' }
    huawei  { res.srcDirs += 'src/huawei/res' }
  }
}"""),
                ("note", "warn", "渠道号不要从应用商店后台手填——容易填错且不可查。用 `applicationIdSuffix` 或构建时注入 manifestPlaceholders，让渠道号**从构建配置派生**。"),
            ],
        },
        {
            "id": "checklist", "h": "10 上线检查清单",
            "blocks": [
                ("table", [
                    ["项", "国际版", "国内版"],
                    ["隐私政策弹窗", "首次启动，拒绝则不初始化 SDK", "同上，且必须先于任何 SDK"],
                    ["ATT（iOS）", "初始化 SDK 前弹", "—"],
                    ["GDPR / CCPA", "按地区下发同意流", "—"],
                    ["广告位配置", "走 overseas 表", "走 cn 表"],
                    ["激励视频校验", "MAX 的 SSV", "穿山甲 SSV（必做）"],
                    ["包名 / 签名", "海外包名，正式签名", "每渠道独立包名"],
                    ["测试", "用测试设备 ID，别点自己的真实广告", "同左（防作弊封号）"],
                    ["合规材料", "隐私政策 URL、数据安全表", "版号、软著、隐私政策、实名与防沉迷"],
                ]),
                ("note", "warn", "最后一条最容易翻车：**开发期反复点自己的广告会被平台判定为无效流量**，轻则扣量，重则封号。所有测试必须用平台的测试设备白名单。"),
            ],
        },
    ],
    "quiz": [
        {
            "q": "为什么国内版工程里不应该存在 AdMob 的代码？",
            "opts": ["包体会变大", "避免合规风险与编译依赖，用 asmdef 的 defineConstraints 让它不参与编译", "AdMob 不支持 Android", "只是代码整洁问题"],
            "a": 1,
            "why": "国内上架不允许集成未经声明的海外采集类 SDK，且不参与编译能彻底避免遗漏调用与包体膨胀。这是 asmdef defineConstraints 的核心价值。",
        },
        {
            "q": "iOS 上 ATT 授权为什么必须在广告 SDK 初始化之前？",
            "opts": ["系统强制要求", "否则 SDK 会在无 IDFA 状态下完成初始化，后续即便同意也拿不到设备标识，eCPM 大幅下降", "为了加快启动速度", "ATT 与广告无关"],
            "a": 1,
            "why": "SDK 初始化时就会读取设备标识并缓存。顺序颠倒会导致后续无法补取，是新手最常踩的 eCPM 杀手。",
        },
        {
            "q": "微信小游戏激励视频，判断「用户真的看完了」的依据是？",
            "opts": ["onClose 被调用", "res.isEnded === true", "广告时长达到 30 秒", "onLoad 成功"],
            "a": 1,
            "why": "用户点右上角关闭也会触发 onClose，但不是有效观看。必须检查 res.isEnded，否则会出现大量未看完也发奖的漏损。",
        },
        {
            "q": "业务层拿到激励视频奖励的唯一可信来源是？",
            "opts": ["客户端 Show 回调返回 Reward", "服务端校验（SSV）通过后的发货通知", "广告 SDK 日志", "本地缓存的观看计数"],
            "a": 1,
            "why": "客户端回调可被篡改或伪造。只要奖励有真实价值，就必须由自己的服务端向广告平台验签并幂等发货。",
        },
    ],
}


M04 = {
    "id": "m04", "cat": "商业化与发行", "icon": "🎯",
    "title": "计费点与标签体系", "sub": "先定表再写码：IAA / IAP / 埋点 / 回传",
    "stack": "商业化设计 · 数据",
    "game": "付费点设计、埋点体系、远程调优、A/B 实验、收益归因",
    "other": "SaaS 订阅定价与分层、增长分析、产品埋点治理、用户分层运营",
    "sections": [
        {
            "id": "tables", "h": "1 先定表，再写码",
            "blocks": [
                ("p", "计费点做砸的项目，九成不是代码问题，而是**表没定清楚就开写**：点位散落在各个脚本里、埋点名一个页面一个写法、奖励数值硬编码。等到要调优时，没有任何一处可以集中改。"),
                ("table", [
                    ["表", "一行代表什么", "关键列"],
                    ["事件字典表", "一个埋点事件", "event_key、触发时机、参数、归属模块"],
                    ["计费点表", "一个可变现点位", "slot_id、类型（IAA/IAP）、触发条件、频控、奖励、开关"],
                    ["商品表", "一个可购买商品", "sku、区域、价格档、内容、是否首充/限时"],
                ]),
                ("note", "key", "顺序不能反：**表 → 埋点门面 → 点位实现 → 看板**。反过来做（先写代码再补表），必然出现同一个行为三个 event_key、同一个点位两套奖励配置。"),
            ],
        },
        {
            "id": "tags", "h": "2 标签分类总表",
            "blocks": [
                ("p", "标签是把「行为流水」压成「用户画像」的中间层。分四类就够，别一上来搞几十个维度。"),
                ("table", [
                    ["类别", "例子", "用途"],
                    ["属性标签", "设备档位、地区、渠道、安装天数", "分群基线，做冷启动优化"],
                    ["行为标签", "日均局数、平均单局时长、失败率、流失关卡", "找卡点，做难度调优"],
                    ["付费标签", "是否付费、首充有无、累计付费档、最近付费距今天数", "分层运营与召回"],
                    ["进度标签", "最高关卡、解锁系统数、收集完成度", "定位内容消耗速度"],
                ]),
                ("note", "tip", "标签要**可回溯计算**：能由原始事件重新算出来。如果某个标签是「当场算完就存」，一旦口径改了就永远修不回来。"),
            ],
        },
        {
            "id": "event", "h": "3 事件字典 + 埋点门面",
            "blocks": [
                ("p", "埋点最怕两件事：名字随性起、调用散落各处。解法是**一个门面 + 一份常量表**，业务代码只准通过门面打点。"),
                ("code", "csharp", r"""// 1) 事件常量：唯一真相，禁止在业务里写字符串
public static class Ev
{
    public const string LevelStart   = "level_start";
    public const string LevelEnd     = "level_end";     // props: result, level, duration, reviveUsed
    public const string AdShow       = "ad_show";       // props: slot, provider, result
    public const string AdRevenue    = "ad_revenue";    // props: slot, ecpm, currency
    public const string IapPurchase  = "iap_purchase";  // props: sku, price, currency, firstPay
    public const string ShopOpen     = "shop_open";     // props: from
}

// 2) 门面：所有打点唯一入口，统一补公共参数
public static class Track
{
    static ITracker impl = new NullTracker();

    public static void Init(ITracker t) => impl = t;

    public static void Send(string ev, Dictionary<string, object> props = null)
    {
        props ??= new Dictionary<string, object>();
        props["uid"]      = User.Id;
        props["level"]    = User.MaxLevel;      // 公共维度自动补齐
        props["channel"]  = BuildInfo.Channel;
        props["ts"]       = TimeUtil.NowMs();
        impl.Log(ev, props);
    }
}"""),
                ("p", "国内与海外的埋点后端不同（国内多为自建或神策/友盟，海外多为 Firebase / Adjust），差异全部收在 `ITracker` 的实现里，业务层无感知。"),
                ("code", "csharp", r"""public class FirebaseTracker : ITracker
{
    public void Log(string ev, Dictionary<string, object> p)
    {
        var prm = new Dictionary<string, object>();
        foreach (var kv in p)
        {
            // Firebase 参数值只接受 string / long / double
            prm[kv.Key] = kv.Value is int i ? (long)i
                        : kv.Value is float f ? (double)f
                        : kv.Value?.ToString() ?? "";
        }
        FirebaseAnalytics.LogEvent(ev, prm);
    }
}

public class DomesticTracker : ITracker   // 神策 / 友盟 / 自建
{
    public void Log(string ev, Dictionary<string, object> p)
    {
        SensorsDataAPI.Track(ev, p);          // 支持嵌套与数组
    }
}"""),
                ("note", "warn", "跨平台埋点最大的坑是**类型不一致**：Firebase 只收 string / long / double，把 `float` 直接塞进去会被静默丢弃或转成字符串，导致看板上全是 0。类型转换必须在适配器里做完。"),
            ],
        },
        {
            "id": "iaa", "h": "4 IAA 广告点位清单",
            "blocks": [
                ("p", "休闲游戏的广告收入结构通常是「激励视频为主、插屏为辅、Banner 保底」。点位不是越多越好——插屏太密会直接抬高流失率。"),
                ("table", [
                    ["点位", "类型", "触发时机", "频控建议", "注意"],
                    ["开屏", "Splash", "冷启动后首次进入主界面", "每会话 1 次", "要有跳过，别做成强插"],
                    ["关卡结束", "Interstitial", "结算页出现时", "≥60s 间隔，前 3 关不弹", "新手期必须保护"],
                    ["失败复活", "Rewarded", "失败结算页", "每关 1 次", "核心变现点，务必 SSV"],
                    ["双倍奖励", "Rewarded", "胜利结算页", "每关 1 次", "转化最高，按钮要显眼"],
                    ["离线收益翻倍", "Rewarded", "回归时离线收益弹窗", "每日 3 次", "与留存强相关"],
                    ["免费道具/抽奖", "Rewarded", "商店/抽奖页", "每日上限", "配合进度卡点"],
                    ["主界面 Banner", "Banner", "常驻底部", "—", "别遮挡操作区，iOS 需注意安全区"],
                ]),
                ("note", "key", "新手前 3 关**不弹任何非激励广告**。这是留存与变现的经典权衡点：前期多赚几分钱，换来的是次留下滑，长期 LTV 反而更低。"),
            ],
        },
        {
            "id": "iap", "h": "5 IAP 商品清单与定价对照",
            "blocks": [
                ("table", [
                    ["SKU", "类型", "国内档位", "海外档位", "设计要点"],
                    ["remove_ads", "一次性", "¥6", "$0.99", "最常见的首付费点，转化率高"],
                    ["starter_pack", "一次性", "¥6", "$0.99", "首充礼包，限购 1 次，价值感要强"],
                    ["coin_small", "消耗品", "¥6", "$0.99", "基础档，用于比价锚定"],
                    ["coin_mid", "消耗品", "¥30", "$4.99", "主力档，通常销量最高"],
                    ["coin_large", "消耗品", "¥68", "$9.99", "大 R 档"],
                    ["battle_pass", "订阅/赛季", "¥30/月", "$4.99/月", "长期留存与稳定收入"],
                ]),
                ("list", [
                    "**定价不要按汇率换算**：国内 ¥6 / ¥30 / ¥68 是习惯档位，海外 $0.99 / $4.99 / $9.99 是习惯档位，两者不是汇率关系",
                    "**必须有锚定**：大包单价要明显低于小包，否则没人买大包",
                    "**首充只在 1 次**：首充礼包的价值感一旦被稀释，后续付费转化会塌",
                    "**消耗品要能重复买**，一次性商品（去广告）买完就没有复购，别指望它撑收入",
                ]),
            ],
        },
        {
            "id": "remote", "h": "6 远程配置：改策略不发版",
            "blocks": [
                ("p", "频控参数、点位开关、奖励倍率、AB 分组，全都不该写死在包里。发一版审核要几天，而调优要按小时迭代。"),
                ("code", "json", r"""{
  "version": 12,
  "slots": {
    "inter_level_end": { "on": true, "minIntervalSec": 60, "skipFirstLevels": 3 },
    "reward_revive":   { "on": true, "maxPerLevel": 1, "rewardMul": 1.0 },
    "reward_double":   { "on": true, "maxPerLevel": 1, "rewardMul": 2.0 }
  },
  "experiments": {
    "exp_inter_freq": { "group": "A", "minIntervalSec": 45 }
  },
  "fallback": { "on": true }
}"""),
                ("note", "warn", "远程配置必须有**兜底**：拉取失败就用本地默认值，且默认值要保守（频控更严、开关更少）。否则某次配置服务挂掉，可能给用户连弹 10 个插屏。"),
            ],
        },
        {
            "id": "freq", "h": "7 频控与触发（核心逻辑）",
            "blocks": [
                ("p", "频控不是「加个计时器」那么简单，它要同时管住四个维度：**冷却、单局上限、每日上限、全局窗口**。少一个就会漏。"),
                ("code", "csharp", r"""public class SlotGate
{
    readonly SlotCfg cfg;
    DateTime lastShow;
    readonly Dictionary<string, int> perSession = new();
    int perDay; DateTime dayAnchor;

    public bool CanShow(string slotId, int currentLevel)
    {
        if (!cfg.On) return false;
        if (currentLevel <= cfg.SkipFirstLevels) return false;

        // 1) 冷却
        if ((DateTime.UtcNow - lastShow).TotalSeconds < cfg.MinIntervalSec) return false;

        // 2) 每日上限（跨天重置用锚点，不用 DateTime.Today 比较字符串）
        if (dayAnchor.Date != DateTime.UtcNow.Date) { perDay = 0; dayAnchor = DateTime.UtcNow; }
        if (perDay >= cfg.DailyCap) return false;

        // 3) 单局/单会话上限
        perSession.TryGetValue(slotId, out var n);
        if (n >= cfg.MaxPerSession) return false;

        return true;
    }

    public void MarkShown(string slotId)
    {
        lastShow = DateTime.UtcNow;
        perDay++;
        perSession[slotId] = perSession.GetValueOrDefault(slotId) + 1;
    }
}"""),
                ("note", "warn", "**`MarkShown` 必须在真正展示后调用，不能在「准备展示」时调用**。否则广告加载失败也会消耗频控额度，用户点了没反应又没奖励，体验极差。"),
            ],
        },
        {
            "id": "revenue", "h": "8 收益回传与归因",
            "blocks": [
                ("p", "想把 LTV 算准，光有「展示次数」不够，必须拿到**每次展示的收益（impression-level revenue）**。主流聚合平台都提供收益回调。"),
                ("table", [
                    ["数据", "来源", "用途"],
                    ["广告展示收益", "MAX 的 OnAdRevenuePaidEvent / AdMob 的 PaidEvent", "按点位算真实 eCPM，而不是估算"],
                    ["内购订单", "Apple / Google 服务端收据校验", "防漏单、防伪造"],
                    ["归因来源", "Adjust / AppsFlyer / 平台回调", "算渠道 ROI，决定投放预算"],
                ]),
                ("code", "csharp", r"""// MAX 的收益回调：每次展示后立即上报，别攒批
MaxSdkCallbacks.Interstitial.OnAdRevenuePaidEvent += (adUnitId, info) =>
{
    Track.Send(Ev.AdRevenue, new Dictionary<string, object>
    {
        ["slot"]     = SlotOf(adUnitId),
        ["network"]  = info.NetworkName,
        ["ecpm"]     = info.Revenue,          // 已经是美元
        ["currency"] = "USD"
    });
};"""),
                ("note", "key", "内购必须做**服务端校验 + 幂等发货**：客户端拿到收据后发给自己的服务器，服务器向 Apple/Google 校验，成功才发货，并以订单号去重。纯客户端校验等于没有校验。"),
            ],
        },
        {
            "id": "dashboard", "h": "9 指标看板：只看这 6 个",
            "blocks": [
                ("table", [
                    ["指标", "口径", "看什么"],
                    ["ARPDAU", "日广告收入 + 日内购收入 ÷ DAU", "整体变现效率"],
                    ["eCPM", "广告收入 ÷ 展示次数 × 1000", "广告价值，分点位看"],
                    ["填充率", "成功展示 ÷ 请求次数", "广告源是否够，低说明要加源"],
                    ["IVR（激励视频渗透）", "看激励视频的 DAU ÷ 总 DAU", "点位设计是否合理"],
                    ["次留 / 7 留", "次日回访 ÷ 新增", "变现调优有没有伤到留存"],
                    ["LTV / CAC", "生命周期价值 ÷ 获客成本", "能不能放量，<1 就是亏"],
                ]),
                ("note", "info", "变现调优永远看**成对指标**：单看 ARPDAU 上涨就加大插屏，很可能次留在跌、LTV 在降。只盯一个数的优化，基本都在透支未来。"),
            ],
        },
    ],
    "quiz": [
        {
            "q": "计费点设计的正确顺序是？",
            "opts": ["直接写代码，跑起来再补埋点", "先定三张表 → 埋点门面 → 点位实现 → 看板", "先做看板再补埋点", "边写代码边想点位"],
            "a": 1,
            "why": "表定清楚了，点位、奖励、频控才有唯一真相。反过来做必然出现同一点位两套配置、同一行为多个事件名，后期无法集中调优。",
        },
        {
            "q": "为什么新手前 3 关不该弹插屏？",
            "opts": ["技术实现复杂", "前期的广告收益换不来次留损失，长期 LTV 更低", "平台规定禁止", "插屏在低关卡填充率低"],
            "a": 1,
            "why": "这是留存与变现的经典权衡。新手期是流失最高的阶段，多赚几分钱却抬高流失，会让整体 LTV 下降。",
        },
        {
            "q": "频控额度应该在什么时机扣减？",
            "opts": ["决定要展示时", "广告真正成功展示之后", "广告加载完成时", "用户点击按钮时"],
            "a": 1,
            "why": "提前扣减会导致「加载失败也消耗额度」，用户点了没响应、也没奖励，体验最差。必须在真正展示后标记。",
        },
        {
            "q": "跨平台埋点最容易出的问题是？",
            "opts": ["网络延迟", "参数类型不统一，Firebase 只收 string/long/double，float 会被丢弃", "事件名太长", "打点太频繁"],
            "a": 1,
            "why": "类型不一致会导致参数静默丢失，看板上显示全 0。类型转换必须在 ITracker 适配器里统一处理。",
        },
    ],
}


M05 = {
    "id": "m05", "cat": "语言底层", "icon": "⚙️",
    "title": "C 语言与内存认知", "sub": "看懂 IL2CPP 与 Native 插件的底层语言",
    "stack": "语言底层 · 内存模型",
    "game": "阅读 IL2CPP 生成代码、写 Native 插件、控制 struct 内存布局、unsafe 互操作、性能热点分析",
    "other": "嵌入式与固件、操作系统与驱动、高性能中间件、跨语言 ABI 设计",
    "sections": [
        {
            "id": "why", "h": "1 为什么 Unity 程序员要懂 C",
            "blocks": [
                ("p", "你不需要用 C 写游戏逻辑，但你会不断遇到**只有懂 C 才能解释的现象**：为什么 struct 传给 Native 插件后数据全乱、为什么 IL2CPP 下某个反射调用失败、为什么多线程里一个 bool 读写会导致崩溃。"),
                ("table", [
                    ["场景", "为什么需要 C 的认知"],
                    ["IL2CPP 打包", "C# 的 IL 会被转成 C++ 再编译，泛型与反射会受裁剪影响"],
                    ["Native 插件", "P/Invoke 传 struct 时，字段顺序与对齐必须与 C 侧完全一致"],
                    ["unsafe / fixed", "直接操作内存，需要理解指针与 GC 句柄固定"],
                    ["GC 与分配", "理解堆、栈、值类型的分配位置，才能减少 GC 峰值"],
                ]),
                ("note", "info", "一个反直觉的事实：**C# 的值类型也走栈（或内联在对象里），引用类型走托管堆**。这条规则和 C 的栈/堆划分是同源的——理解 C 的模型，C# 的行为就不再是「魔法」。"),
            ],
        },
        {
            "id": "ptr", "h": "2 指针：地址、解引用、算术",
            "blocks": [
                ("p", "指针就是一个存地址的整数。所有「指针很危险」的说法，本质都是「你手动算错了地址」。"),
                ("code", "c", r"""#include <stdio.h>

int main(void) {
    int a = 42;
    int *p = &a;          // p 存的是 a 的地址

    printf("%d\n", *p);   // 解引用：顺着地址取值 → 42
    *p = 100;             // 顺着地址写值 → a 也变成 100

    int arr[5] = {10, 20, 30, 40, 50};
    int *q = arr;         // 数组名退化为首元素地址
    printf("%d\n", *(q + 2));   // 指针算术：跳 2 个 int（不是 2 字节）→ 30
    printf("%d\n", q[2]);       // 等价写法
    return 0;
}"""),
                ("list", [
                    "**指针算术按类型宽度走**：`int* + 1` 前进 4 字节，`char* + 1` 前进 1 字节。这解释了为什么「跨类型强转指针再算术」会错位。",
                    "**`arr` 与 `&arr` 不同**：前者退化为 `int*`，后者是 `int(*)[5]`。两者数值相同，加 1 后差 20 字节。",
                    "**NULL 解引用是崩溃第一原因**，且往往在很远的地方才炸——所以崩溃栈经常指向无辜代码。",
                ]),
            ],
        },
        {
            "id": "mem", "h": "3 内存四区与生命周期",
            "blocks": [
                ("table", [
                    ["区域", "存放", "生命周期", "谁管"],
                    ["栈 Stack", "局部变量、函数参数、返回地址", "函数进入/退出自动伸缩", "编译器"],
                    ["堆 Heap", "malloc / new 出来的对象", "手动 free / delete", "程序员"],
                    ["全局/静态区 .data/.bss", "全局变量、static 变量", "整个进程", "编译器初始化"],
                    ["常量区 .rodata", "字符串字面量、const 全局", "整个进程", "只读"],
                    ["代码区 .text", "机器指令", "整个进程", "只读"],
                ]),
                ("code", "c", r"""void bad(void) {
    int *p = (int *)malloc(10 * sizeof(int));
    // 忘记 free：每次调用泄漏 40 字节，跑久了就 OOM
}

void also_bad(void) {
    int *p;
    { int local = 5; p = &local; }   // local 已随作用域销毁
    *p = 7;                           // 悬垂指针：写到了别人的栈帧上
}

void good(void) {
    int *p = (int *)malloc(10 * sizeof(int));
    if (!p) return;                   // 一定要判空
    for (int i = 0; i < 10; i++) p[i] = i;
    free(p);
    p = NULL;                         // 置空，防止后续误用
}"""),
                ("note", "warn", "C 的两大经典崩溃：**内存泄漏**（malloc 没 free）和**悬垂指针**（free 后继续用）。前者表现为越跑越卡最终被杀，后者表现为随机位置崩溃——两者都极难定位，所以「谁分配谁释放」必须成为铁律。"),
            ],
        },
        {
            "id": "struct", "h": "4 结构体与内存对齐",
            "blocks": [
                ("p", "这是 C# 与 C 交互最容易翻车的知识点。编译器为了保证 CPU 访问效率，会在成员之间**自动插入填充字节（padding）**。"),
                ("code", "c", r"""#include <stdio.h>

struct A { char c; int i; };          // char(1) + padding(3) + int(4)
struct B { int i; char c; };          // int(4) + char(1) + padding(3)
struct C { char a; char b; int i; };  // char+char + padding(2) + int

#pragma pack(push, 1)                 // 强制 1 字节对齐，取消填充
struct Packed { char c; int i; };     // 恰好 5 字节
#pragma pack(pop)

int main(void) {
    printf("%zu %zu %zu %zu\n",
        sizeof(struct A),   // 8，不是 5
        sizeof(struct B),   // 8
        sizeof(struct C),   // 8
        sizeof(struct Packed)); // 5
    return 0;
}"""),
                ("list", [
                    "**对齐规则**：每个成员相对起始地址的偏移，必须是该成员自身大小的整数倍；结构体总大小必须是最大成员大小的整数倍。",
                    "**因此 sizeof 永远 ≥ 成员大小之和**，不能用它来估算「字段加起来多少字节」。",
                    "**字段顺序影响大小**：`{char, int}` 和 `{int, char}` 都是 8；但 `{char, char, int}` 是 8，`{char, int, char}` 却是 12。",
                ]),
                ("note", "key", "结论：**跨语言传 struct 时，字段顺序、类型宽度、对齐方式三者必须逐字节一致**。少对一项，数据就会错位——而且不会报错，只会安静地算出垃圾值。"),
            ],
        },
        {
            "id": "gcvsc", "h": "5 malloc/free 与 GC 的本质差别",
            "blocks": [
                ("table", [
                    ["维度", "C（malloc/free）", "C#（GC）"],
                    ["谁释放", "程序员显式 free", "垃圾回收器自动"],
                    ["释放时机", "确定，立即归还", "不确定，等 GC 触发"],
                    ["碎片", "容易产生外部碎片", "会压缩（部分 GC 实现）"],
                    ["开销分布", "分配/释放各自付出", "分配便宜，回收时集中停顿"],
                    ["典型问题", "泄漏、悬垂指针、重复 free", "GC 峰值卡顿、非托管泄漏"],
                ]),
                ("p", "Unity 里你其实同时面对两套：**托管堆由 GC 管，Native 侧（纹理、Mesh、NativeArray）要自己 Release**。所以「Unity 内存泄漏」通常是非托管资源没释放，而不是 GC 没跑。"),
                ("note", "tip", "优化 Unity GC 的核心不是「少 new」这种笼统建议，而是：**消除每帧的堆分配**。用对象池、避免闭包捕获、避免 `string +` 拼接、用 `StringBuilder` 或 `TMP_Text.SetText`。"),
            ],
        },
        {
            "id": "map", "h": "6 C 与 C# 逐项对照",
            "blocks": [
                ("table", [
                    ["概念", "C", "C#"],
                    ["字符串", "`char*` / `char[]`，以 `\\0` 结尾", "`string`，不可变，长度独立存储"],
                    ["数组", "裸指针 + 长度自己记", "带长度与边界检查"],
                    ["结构体", "`struct`，值语义", "`struct`，值语义（但可含方法）"],
                    ["对象", "无原生对象，靠 struct 组合", "`class`，引用语义，堆分配"],
                    ["内存释放", "`free` / `delete`", "GC"],
                    ["指针", "`int*`", "`int*` 仅在 `unsafe` 上下文"],
                    ["函数指针", "`int (*fp)(int)`", "`delegate` / `Action` / `Func`"],
                    ["可变参数", "`va_list`", "`params object[]`"],
                    ["编译期计算", "`#define` 宏", "`const` / `static readonly` / 源生成器"],
                ]),
                ("note", "info", "最值得注意的差异是**数组**：C 的数组不知道自己的长度（`sizeof` 只在同作用域内有效），而 C# 数组自带 Length。这也解释了为什么 C 的 API 几乎都要额外传一个 length 参数。"),
            ],
        },
        {
            "id": "unity", "h": "7 和 Unity 的连接点",
            "blocks": [
                ("p", "四个最实际的连接点。每一个都是「不懂 C 就会踩坑」的地方。"),
                ("h3", "① P/Invoke 传 struct"),
                ("code", "csharp", r"""[StructLayout(LayoutKind.Sequential, Pack = 1)]  // 必须与 C 侧 #pragma pack 一致
public struct Payload
{
    public byte  type;
    public int   value;
    public float weight;
}

[DllImport("mylib")]
static extern void SendPayload(ref Payload p);

// C 侧必须完全对应：
// #pragma pack(push,1)
// typedef struct { uint8_t type; int32_t value; float weight; } Payload;
// #pragma pack(pop)"""),
                ("h3", "② unsafe + fixed：把托管数组钉住"),
                ("code", "csharp", r"""unsafe void Process(byte[] data)
{
    // fixed：告诉 GC 这批内存我要直接操作，别搬走
    fixed (byte* p = data)
    {
        Native.Process(p, data.Length);
    }
    // 离开 fixed 作用域后，GC 才能移动这块内存
}"""),
                ("h3", "③ IL2CPP 的影响"),
                ("list", [
                    "C# 的 IL 被转成 C++ 再编译为原生码，**不是解释执行**",
                    "泛型会为每个值类型实例生成独立代码 → 包体增大，需注意 link.xml 保留",
                    "反射受裁剪影响，`Assembly.GetTypes()` 可能拿不到被裁掉的类型",
                    "`unsafe` 代码在 IL2CPP 下正常运行，Mono 下需开启 Allow 'unsafe' Code",
                ]),
                ("h3", "④ 值类型的内存位置"),
                ("table", [
                    ["情况", "分配位置"],
                    ["局部值类型变量", "线程栈"],
                    ["class 的字段（值类型）", "内联在托管堆对象里，不额外分配"],
                    ["数组元素（值类型）", "托管堆上的连续内存"],
                    ["装箱后", "托管堆上新建对象（热点！避免）"],
                ]),
            ],
        },
        {
            "id": "crash", "h": "8 常见崩溃与排查",
            "blocks": [
                ("table", [
                    ["现象", "常见原因", "排查"],
                    ["随机位置崩溃、栈无意义", "悬垂指针 / 缓冲区越界写", "ASan、Valgrind；Unity 里开 Addressables 的泄漏检测"],
                    ["跑久了越来越卡、最终被杀", "内存泄漏", "Profiler 抓 Native 内存曲线，看是否单调上升"],
                    ["传 struct 后数据全乱", "对齐 / Pack 不一致", "两侧打印 sizeof，逐字段比对偏移"],
                    ["多线程偶发崩溃", "无锁共享变量", "用原子操作；加锁范围要小"],
                    ["free 时报 invalid pointer", "重复 free / free 非堆指针", "free 后置 NULL；只释放 malloc 的指针"],
                ]),
                ("note", "warn", "一个隐蔽陷阱：**越界写通常不立即崩溃**。它悄悄破坏了相邻内存，等到那块内存被使用时才炸，而崩溃栈指向的往往是无辜代码。这就是为什么「加一行日志就好了」的现象真实存在——日志改变了内存布局。"),
            ],
        },
    ],
    "quiz": [
        {
            "q": "struct A { char c; int i; }; 在默认对齐下 sizeof 是多少？",
            "opts": ["5", "8", "4", "12"],
            "a": 1,
            "why": "char 占 1 字节，后面补 3 字节 padding 使 int 对齐到 4 的倍数，int 占 4 字节，总计 8。且总大小必须是最大成员（4）的整数倍，正好满足。",
        },
        {
            "q": "C# 与 C 交互传 struct 时，最关键的三项一致性是？",
            "opts": ["变量名、注释、命名空间", "字段顺序、类型宽度、对齐方式", "文件路径、编码、换行符", "方法名、返回类型、访问修饰符"],
            "a": 1,
            "why": "内存是逐字节映射的。顺序错、宽度错、对齐错，任一不符都会让字段错位，且不会报错，只会算出垃圾值。",
        },
        {
            "q": "C 里 int* p 执行 p + 2，实际前进多少字节（假设 32 位 int）？",
            "opts": ["2", "4", "8", "取决于编译器"],
            "a": 2,
            "why": "指针算术按所指类型宽度走，每次前进 sizeof(int)=4 字节，加 2 即前进 8 字节。这是与 char* 最典型的差异。",
        },
        {
            "q": "Unity 中「内存泄漏」最常见于？",
            "opts": ["C# 托管堆对象没被 GC", "非托管资源（纹理 / NativeArray / 原生插件内存）未释放", "字符串太多", "委托没退订"],
            "a": 1,
            "why": "托管堆由 GC 管理，通常不会真正泄漏（除非有长期强引用）。真正单调上涨的是非托管侧资源——需要显式 Release/Dispose。",
        },
    ],
}
