/* 图形数据：由原图结构还原 / 截图文字还原，供 diagram.js 渲染 */
window.DIAGRAMS = {
"01b3ef60933f": {
"type": "mind",
"title": "附加设置 Additional Settings",
"opt": {
"h": 400,
"maxW": 160
},
"data": {
"t": "Additional Settings 附加设置",
"c": [
{
"t": "Motion Vectors 运动矢量",
"c": [
{
"t": "Camera Motion Only 使用相机运动来跟踪运动"
},
{
"t": "Per Object Motion 按特定对象来跟踪运动"
},
{
"t": "Force No Motion 不跟踪"
}
]
},
{
"t": "Dynamic Occludee 动态遮挡剔除"
},
{
"t": "Sorting Layer 排序图层"
},
{
"t": "Order in Layer 此线段在排序图层中的顺序"
}
]
}
},
"04263e2db387": {
"type": "tbl",
"title": "碰撞检测模式组合结果矩阵",
"data": {
"cols": [
"无刚体碰撞盒",
"Discrete",
"Continuous",
"Continuous Dynamic",
"Continuous Speculative"
],
"rowHead": true,
"rows": [
[
"无刚体碰撞盒",
"不检测碰撞",
"Discrete",
"Continuous",
"Continuous",
"Continuous Speculative"
],
[
"Discrete（离散检测）",
"Discrete",
"Discrete",
"Discrete",
"Discrete",
"Continuous Speculative"
],
[
"Continuous（连续检测）",
"Continuous",
"Discrete",
"Discrete",
"Continuous",
"Continuous Speculative"
],
[
"Continuous Dynamic（连续动态检测）",
"Continuous",
"Discrete",
"Continuous",
"Continuous",
"Continuous Speculative"
],
[
"Continuous Speculative（连续推测检测）",
"Continuous Speculative",
"Continuous Speculative",
"Continuous Speculative",
"Continuous Speculative",
"Continuous Speculative"
]
],
"note": "横轴与纵轴分别是两个碰撞体各自的检测模式，交叉点即该组合下的实际检测方式。性能消耗：Continuous Dynamic > Continuous Speculative > Continuous > Discrete"
}
},
"08fe68d53758": {
"type": "vec",
"title": "点乘的几何意义",
"opt": {
"h": 420
},
"data": {
"items": [
{
"k": "vec",
"n": "A",
"x": 4,
"y": 0,
"c": "#2b6cf6"
},
{
"k": "vec",
"n": "B",
"x": 2,
"y": 2.6,
"c": "#e8663d"
},
{
"k": "seg",
"n": "B 在 A 上的投影",
"from": [
2,
2.6
],
"to": [
2,
0
],
"c": "#8b98ad",
"dash": true
}
],
"note": "A·B = |A||B|cosθ：结果 > 0 锐角、= 0 直角、< 0 钝角。拖动 B 看数值怎么变 —— 这就是「判断敌人在身前还是身后」的原理。"
}
},
"0932a5350641": {
"type": "mind",
"title": "碰撞器知识点",
"opt": {
"h": 470,
"maxW": 170
},
"data": {
"t": "碰撞器 知识点",
"c": [
{
"t": "知识回顾",
"c": [
{
"t": "碰撞产生的必要条件：两个物体都有碰撞器，至少一个物体有刚体"
},
{
"t": "碰撞器表示物体的体积（形状）"
},
{
"t": "刚体会利用体积进行碰撞计算，模拟真实碰撞效果，产生力的作用"
}
]
},
{
"t": "3D 碰撞器种类",
"c": [
{
"t": "1. 盒状　2. 球状　3. 胶囊"
},
{
"t": "4. 网格　5. 轮胎　6. 地形"
}
]
},
{
"t": "共同参数",
"c": [
{
"t": "Is Trigger 是否是触发器",
"n": "启用后用于触发事件，被物理引擎忽略",
"c": [
{
"t": "主要用于进行没有物理效果的碰撞检测"
}
]
},
{
"t": "Material 物理材质",
"c": [
{
"t": "确定碰撞体和其它对象碰撞时的交互（表现）方式"
}
]
},
{
"t": "Center 碰撞体在对象局部空间中的中心点位置"
}
]
}
]
}
},
"0a9b5e10cf02": {
"type": "tbl",
"title": "常用角度 sin / cos 值表",
"data": {
"cols": [
"0°",
"30°",
"45°",
"60°",
"90°",
"180°",
"270°",
"360°"
],
"rowHead": true,
"rows": [
[
"Sin",
"0",
"1/2",
"√2/2",
"√3/2",
"1",
"0",
"−1",
"0"
],
[
"Cos",
"1",
"√3/2",
"√2/2",
"1/2",
"0",
"−1",
"0",
"1"
]
],
"note": "√2/2 ≈ 0.707，√3/2 ≈ 0.866。Unity 里 Mathf.Sin / Mathf.Cos 接收的是弧度，角度要先乘 Mathf.Deg2Rad。"
}
},
"0c9b4492d1ea": {
"type": "mind",
"title": "OtherSettings 其它设置",
"opt": {
"h": 470,
"maxW": 150
},
"data": {
"t": "OtherSettings",
"c": [
{
"t": "Fog 雾开关",
"c": [
{
"t": "Color 雾颜色"
},
{
"t": "Mode 雾计算模式",
"c": [
{
"t": "Linear 随距离线性增加",
"c": [
{
"t": "Start 离摄像机多远开始有雾"
},
{
"t": "End 离摄像机多远完全遮挡"
}
]
},
{
"t": "Exponential 随距离指数增加",
"c": [
{
"t": "Density 强度"
}
]
},
{
"t": "Exponential Squared 随距离比指数更快的增加",
"c": [
{
"t": "Density 强度"
}
]
}
]
}
]
},
{
"t": "Halo Texture 光源周围挥着光环的纹理"
},
{
"t": "Halo Strength 光环可见性"
},
{
"t": "Flare Fade Speed 耀斑淡出时间",
"n": "最初出现之后淡出的时间"
},
{
"t": "Flare Strength 耀斑可见性"
},
{
"t": "Spot Cookie 聚光灯剪影纹理"
}
]
}
},
"155ad5910e2d": {
"type": "calc",
"title": "叉乘计算公式（可代入数值）",
"data": {
"a": [
2,
1,
0
],
"b": [
1,
3,
1
]
}
},
"211f3bbb1e6f": {
"type": "vec",
"title": "位置 − 位置 = 向量",
"opt": {
"h": 420
},
"data": {
"items": [
{
"k": "pt",
"n": "a",
"x": -2.5,
"y": -2,
"c": "#8b98ad"
},
{
"k": "pt",
"n": "b",
"x": 2.5,
"y": 2,
"c": "#8b98ad"
},
{
"k": "seg",
"n": "b − a",
"from": [
-2.5,
-2
],
"to": [
2.5,
2
],
"c": "#e8663d"
}
],
"note": "两个位置相减得到向量：方向由 a 指向 b，长度就是两点距离。口诀「终点减起点」。"
}
},
"29577b97c58f": {
"type": "mind",
"title": "摄像机 Camera 参数结构",
"opt": {
"h": 540,
"maxW": 168
},
"data": {
"t": "Camera 摄像机",
"c": [
{
"t": "Clear Flags 如何清除背景",
"c": [
{
"t": "skybox 天空盒"
},
{
"t": "Solid Color 颜色填充"
},
{
"t": "Depth only 只画该层，背景透明"
},
{
"t": "Don't Clear 不移除，覆盖渲染"
}
]
},
{
"t": "Culling Mask 选择性渲染部分层级",
"c": [
{
"t": "可以指定只渲染对应层级的对象"
}
]
},
{
"t": "Projection 投影",
"c": [
{
"t": "Perspective 透视模式",
"c": [
{
"t": "FOV Axis 视场角轴",
"c": [
{
"t": "决定了光学仪器的视野范围"
}
]
},
{
"t": "Field of view 视口大小"
},
{
"t": "Physical Camera 物理摄像机",
"n": "勾选后可模拟真实世界摄像机",
"c": [
{
"t": "Focal Length 焦距"
},
{
"t": "Sensor Type 传感器类型"
},
{
"t": "Sensor Size 传感器尺寸"
},
{
"t": "Lens Shift 透镜移位"
},
{
"t": "Gate Fit 闸门配合"
}
]
},
{
"t": "orthographic 正交摄像机（一般用于 2D 游戏）",
"c": [
{
"t": "Size 摄制范围"
}
]
}
]
}
]
},
{
"t": "Clipping Planes 裁剪平面距离"
},
{
"t": "Viewport Rect 视口范围",
"c": [
{
"t": "屏幕上将绘制该摄像机视图的位置"
},
{
"t": "主要用于双摄像机游戏"
},
{
"t": "0~1 相当于宽高百分比"
}
]
},
{
"t": "Depth 渲染顺序上的深度"
},
{
"t": "Rendering Path 渲染路径"
}
]
}
},
"2ce14a62e347": {
"type": "mind",
"title": "Camera 渲染相关（续）",
"opt": {
"h": 420,
"maxW": 150
},
"data": {
"t": "Camera（续）",
"c": [
{
"t": "Target Texture 渲染纹理",
"c": [
{
"t": "可以把握像机画面渲染到一张图上",
"c": [
{
"t": "主要用于制作小地图"
}
]
},
{
"t": "在 Project 右键创建 Render Texture"
}
]
},
{
"t": "Occlusion Culling 是否启用剔除遮挡"
},
{
"t": "Allow HDR 是否允许高动态范围渲染"
},
{
"t": "Allow MSAA 是否允许抗锯齿"
},
{
"t": "Allow Dynamic Resolution 是否允许动态分辨率呈现"
},
{
"t": "Target Display 用于哪个显示器",
"n": "主要用来开发有多个屏幕的平台游戏"
}
]
}
},
"3105dff7b60d": {
"type": "mind",
"title": "Rigidbody 刚体参数",
"opt": {
"h": 470,
"maxW": 148
},
"data": {
"t": "RigidBody 组件信息",
"n": "碰撞产生必要条件：两个物体都有碰撞器，至少一个物体有刚体",
"c": [
{
"t": "Mass 质量（默认千克）",
"c": [
{
"t": "质量越大惯性越大"
}
]
},
{
"t": "Drag 空气阻力",
"c": [
{
"t": "根据力移动对象时影响对象的空气阻力大小"
},
{
"t": "0 表示没有空气阻力"
}
]
},
{
"t": "Angular Drag 角阻力",
"c": [
{
"t": "根据扭矩旋转对象时影响对象的空气阻力大小"
},
{
"t": "0 表示没有空气阻力"
}
]
},
{
"t": "Use Gravity 是否受重力影响"
},
{
"t": "Is Kinematic 是否运动学",
"c": [
{
"t": "启用后对象不被物理引擎驱动，只能通过 Transform 操作"
},
{
"t": "移动平台、或动画化附加 HingeJoint 的刚体时非常有用"
}
]
}
]
}
},
"3d85d02dd0cb": {
"type": "mind",
"title": "3D Sound Settings",
"opt": {
"h": 440,
"maxW": 150
},
"data": {
"t": "3D Sound Settings",
"n": "与 Spatial Blend 参数成正比应用",
"c": [
{
"t": "Doppler Level 多普勒效果等级"
},
{
"t": "Spread 扩散角度",
"n": "设置为 3D 立体声还是多声道"
},
{
"t": "Volume Rolloff 声音衰减速度",
"c": [
{
"t": "Logarithmic Rolloff 靠近音频源时声音很大，离开对象时降低得非常快"
},
{
"t": "Linear Rolloff 与音频源的距离越远，听到的声音越小"
},
{
"t": "Custom Rolloff 音频效果根据曲线图的设置变化"
}
]
},
{
"t": "Min / Max Distance 最小距离内保持最大响度，最大距离外声音开始减弱"
}
]
}
},
"3e282d361a15": {
"type": "vec",
"title": "位置 − 向量 = 反向平移",
"opt": {
"h": 420
},
"data": {
"items": [
{
"k": "pt",
"n": "a",
"x": 0.5,
"y": 0.5,
"c": "#8b98ad"
},
{
"k": "seg",
"n": "A",
"from": [
0.5,
0.5
],
"to": [
3.5,
3.5
],
"c": "#e8663d"
},
{
"k": "seg",
"n": "a − A",
"from": [
0.5,
0.5
],
"to": [
-2.5,
-2.5
],
"c": "#8b98ad"
}
],
"note": "位置减向量相当于加负向量：沿 A 的反方向平移，结果仍然是位置。"
}
},
"43394e019cb3": {
"type": "mind",
"title": "AudioSource 音频源",
"opt": {
"h": 620,
"maxW": 160
},
"data": {
"t": "AudioSource 音频源",
"c": [
{
"t": "AudioClip 声音剪辑文件（音频文件）"
},
{
"t": "Output 输出",
"n": "默认输出到场景中的音频监听器，可改为输出到混音器"
},
{
"t": "Mute 静音开关"
},
{
"t": "Bypass Effect 开关滤波器效果"
},
{
"t": "Bypass Listener Effects 快速开关所有监听器"
},
{
"t": "Bypass Reverb Zones 快速开关所有混响区"
},
{
"t": "Play On Awake 对象创建时就播放音乐",
"n": "也就是开关启动游戏就播放"
},
{
"t": "Loop 循环"
},
{
"t": "Priority 优先级"
},
{
"t": "Volume 音量大小"
},
{
"t": "Pitch 音高"
},
{
"t": "Stereo Pan 2D 声音立体声位置",
"n": "相当于左右声道"
},
{
"t": "Spatial Blend 音频受 3D 空间的影响程度"
},
{
"t": "Reverb Zone Mix 到混响区的输出信号量"
}
]
}
},
"522c415ccdb8": {
"type": "mind",
"title": "音频文件属性设置",
"opt": {
"h": 560,
"maxW": 160
},
"data": {
"t": "音频文件属性设置",
"c": [
{
"t": "常用格式",
"c": [
{
"t": "wav　mp3　ogg　aiff"
}
]
},
{
"t": "Force To Mono 多声道转单声道",
"c": [
{
"t": "Normalize 强制为单声道时，混合过程中被标准化"
}
]
},
{
"t": "Load In Background 在后台加载，不阻塞主线程"
},
{
"t": "Ambisonic 立体混响声",
"n": "非常适合 360 度视频和 XR 应用程序"
},
{
"t": "LoadType 加载类型",
"c": [
{
"t": "Decompress On Load 不压缩存内存，加载快但内存占用高",
"n": "适用于小音效"
},
{
"t": "Compress in Memory 压缩存内存，加载慢、内存小",
"n": "仅适用于较大音效文件"
},
{
"t": "Streaming 以流形式存在，使用时解码；内存最小、CPU 消耗高",
"n": "性能换内存"
}
]
},
{
"t": "Preload Audio Data 预加载音频",
"n": "勾选后进入场景就加载，不勾选第一次使用时才加载"
},
{
"t": "Compression Format 压缩方式",
"c": [
{
"t": "PCM 音频以最高质量存储"
},
{
"t": "Vorbis 相对 PCM 压缩得更小，根据质量决定"
},
{
"t": "ADPCM 包含噪音，适合会被多次播放的声音，如碰撞声"
}
]
}
]
}
},
"5615bfd03fe2": {
"type": "mind",
"title": "TextMeshPro 知识结构",
"opt": {
"h": 620,
"maxW": 150
},
"data": {
"t": "Unity 进阶之 TextMeshPro",
"c": [
{
"t": "基础知识点",
"c": [
{
"t": "导入 TMP"
},
{
"t": "UI 文本",
"c": [
{
"t": "参数相关",
"c": [
{
"t": "初始 TMP UI 文本控件"
},
{
"t": "输入、字体相关"
},
{
"t": "颜色、间距、对齐相关"
},
{
"t": "包裹溢出、UV 映射相关"
},
{
"t": "额外设置相关"
}
]
},
{
"t": "脚本控制"
}
]
},
{
"t": "3D 文本相关"
},
{
"t": "字体资源相关",
"c": [
{
"t": "字体资源创建基本流程"
},
{
"t": "字体配置信息",
"c": [
{
"t": "基本信息设置"
},
{
"t": "生成设置 和 图集纹理"
},
{
"t": "字体粗细"
},
{
"t": "其他相关设置"
}
]
}
]
}
]
},
{
"t": "进阶知识点",
"c": [
{
"t": "富文本标签"
},
{
"t": "样式表"
},
{
"t": "颜色渐变预设"
},
{
"t": "精灵图片资源（图文混排）"
},
{
"t": "TMP 基本设置"
},
{
"t": "材质球相关",
"c": [
{
"t": "SDF 材质球和基础设置（Face）"
},
{
"t": "边缘线（Outline）和阴影（Underlay）"
},
{
"t": "照明（Lighting）"
},
{
"t": "发光（Glow）和调试设置（Debug Settings）"
}
]
},
{
"t": "工具类相关",
"c": [
{
"t": "TMP_TextUtilities 类"
},
{
"t": "其它工具类"
}
]
}
]
}
]
}
},
"621e3cecadbe": {
"type": "vec",
"title": "叉乘方向：判断左右",
"opt": {
"h": 420
},
"data": {
"items": [
{
"k": "vec",
"n": "A",
"x": 4,
"y": 0,
"c": "#2b6cf6"
},
{
"k": "vec",
"n": "B",
"x": 2.2,
"y": 2.4,
"c": "#e8663d"
}
],
"note": "A×B 得到同时垂直于 A、B 的法向量，大小 = |A||B|sinθ。左手坐标系：z 分量为正 → B 在 A 左侧，为负 → 在右侧（看下方读数）。"
}
},
"6c602b6a8262": {
"type": "curve",
"title": "Lerp 缓动趋近曲线",
"opt": {
"h": 360
},
"data": {
"fn": "approach",
"yRange": [
0,
1
],
"guides": [
1
],
"params": [
{
"t": "趋近系数 k",
"k": "k",
"v": 3,
"min": 0.5,
"max": 10,
"step": 0.1
}
],
"xLabel": "时间 t",
"yLabel": "数值 result",
"tags": [
[
"目标 b",
0.72,
1,
6,
-8,
"#e8663d"
],
[
"起点 a",
0.02,
0,
4,
-8,
"#5c687c"
]
],
"note": "每帧用 Lerp(a, b, k·dt) 只走剩下距离的一部分，越接近 b 走得越慢，永远到不了 b —— 这就是「缓动趋近」。"
}
},
"7161b5bbc66f": {
"type": "mind",
"title": "Environment 环境光照",
"opt": {
"h": 420,
"maxW": 170
},
"data": {
"t": "Environment 环境",
"c": [
{
"t": "Skybox Material 天空盒材质",
"c": [
{
"t": "可以改变天空和反射"
}
]
},
{
"t": "Sun Source 太阳来源",
"c": [
{
"t": "不设置会默认使用场景中最亮的方向光代表太阳"
}
]
},
{
"t": "Environment Lighting 环境光设置",
"c": [
{
"t": "Source 环境光光源颜色",
"c": [
{
"t": "Skybox 天空和材质作为环境光颜色"
},
{
"t": "Gradient 可以为天空、地平线、地面单独选择颜色和他们之间混合"
}
]
},
{
"t": "Intensity Multiplier 环境光亮度"
},
{
"t": "Ambient Mode 全局光照模式",
"n": "只有启用了实时全局和全局烘焙时才有用",
"c": [
{
"t": "Realtime（已弃用）"
},
{
"t": "Baked"
}
]
}
]
}
]
}
},
"779b06391709": {
"type": "vec",
"title": "向量加法：首尾相连",
"opt": {
"h": 420
},
"data": {
"items": [
{
"k": "vec",
"n": "A",
"x": 2.5,
"y": 0.5,
"c": "#e8663d"
},
{
"k": "vec",
"n": "B",
"x": 1.5,
"y": 3,
"c": "#e8663d",
"dash": true
},
{
"k": "seg",
"n": "B 平移过来",
"from": [
2.5,
0.5
],
"to": [
4,
3.5
],
"c": "#2b6cf6"
},
{
"k": "seg",
"n": "A + B",
"from": [
0,
0
],
"to": [
4,
3.5
],
"c": "#a855f7",
"dash": true
}
],
"note": "把 B 的起点挪到 A 的终点，从原点连到 B 的新终点就是 A+B（虚线是平行四边形法则的另一种看法）"
}
},
"77f7c9451192": {
"type": "mind",
"title": "Interpolate 与 Constraints",
"opt": {
"h": 420,
"maxW": 148
},
"data": {
"t": "RigidBody",
"c": [
{
"t": "Interpolate 插值运算",
"n": "让刚体物体移动更平滑",
"c": [
{
"t": "None 不应用插值运算"
},
{
"t": "Interpolate 根据前一帧的变换来平滑变换"
},
{
"t": "Extrapolate 差值运算",
"c": [
{
"t": "根据下一帧的估计变换来平滑变换"
}
]
}
]
},
{
"t": "Constraints 约束",
"n": "对刚体运动的限制",
"c": [
{
"t": "Freeze Position 有选择地停止刚体沿世界 X、Y、Z 轴的移动"
},
{
"t": "Freeze Rotation 有选择地停止刚体围绕局部 X、Y、Z 轴旋转"
}
]
}
]
}
},
"80825ddbf97a": {
"type": "curve",
"title": "匀速 Lerp 直线插值",
"opt": {
"h": 360
},
"data": {
"fn": "lerp",
"yRange": [
0,
1
],
"params": [
{
"t": "插值系数 t",
"k": "k",
"v": 0.5,
"min": 0,
"max": 1,
"step": 0.01
}
],
"xLabel": "时间 t",
"yLabel": "数值 result",
"tags": [
[
"t = 1 时到达 b",
0.55,
0.55,
8,
-10,
"#5c687c"
],
[
"start",
0.06,
0.06,
4,
-8,
"#5c687c"
]
],
"note": "Lerp(start, b, t) 里 t 从 0 线性涨到 1，结果沿直线匀速从 start 走到 b；t 超过 1 会越过 b。"
}
},
"87d5f6cc0ca0": {
"type": "mind",
"title": "常用碰撞器与组合",
"opt": {
"h": 420,
"maxW": 150
},
"data": {
"t": "碰撞器（续）",
"c": [
{
"t": "常用碰撞器",
"c": [
{
"t": "BoxCollider 盒状碰撞器",
"c": [
{
"t": "Size 碰撞体在 X、Y、Z 方向上的大小"
}
]
},
{
"t": "SphereCollider 球状碰撞器",
"c": [
{
"t": "Radius 球形碰撞体的半径大小"
}
]
},
{
"t": "CapsuleCollider 胶囊碰撞器",
"c": [
{
"t": "Radius 胶囊体的半径"
},
{
"t": "Height 胶囊体的高度"
},
{
"t": "Direction 胶囊体在对象局部空间中的轴向"
}
]
}
]
},
{
"t": "异形物体使用多种碰撞器组合",
"c": [
{
"t": "刚体对象的子对象碰撞器信息"
},
{
"t": "参与碰撞检测"
}
]
}
]
}
},
"89b547ff3960": {
"type": "mind",
"title": "纹理导入：MipMap 相关",
"opt": {
"h": 660,
"maxW": 170
},
"data": {
"t": "纹理导入设置（MipMap）",
"c": [
{
"t": "Non-Power of 2 尺寸非 2 的幂时如何处理",
"c": [
{
"t": "为什么纹理要设置为 2 的 N 次方？",
"n": "图形学规则要求纹理必须是 2 的幂尺寸"
},
{
"t": "None 纹理尺寸大小保持不变"
},
{
"t": "To nearest 缩放到最接近的 2 的幂大小",
"n": "PVRTC 格式要求纹理为正方形"
},
{
"t": "To larger 缩放到不小于原尺寸的 2 的幂"
},
{
"t": "To smaller 缩放到不大于原尺寸的 2 的幂"
}
]
},
{
"t": "Read/Write Enabled 允许用代码读取纹理数据",
"n": "一般需要获取图片像素时才开启"
},
{
"t": "Streaming Mipmaps 启用纹理串流",
"n": "控制加载进内存的 Mipmap 级别，用性能换内存",
"c": [
{
"t": "Mip Map Priority 优先级，决定分配资源时优先考虑哪些 Mipmap"
}
]
},
{
"t": "Generate Mip Maps 允许生成 Mipmap",
"c": [
{
"t": "Border Mip Maps 避免颜色向外渗透到较低 MIP 级别的边缘"
},
{
"t": "Mip Map Filtering 优化图像质量的过滤方法",
"c": [
{
"t": "Box 随着尺寸减小，级别更加平滑"
},
{
"t": "Kaiser 尺寸下降时使用锐化算法",
"n": "远处纹理太模糊时可以用该算法"
}
]
},
{
"t": "Mips Preserve Coverage Mipmap 的 Alpha 通道在 Alpha 测试期间保留覆盖率",
"c": [
{
"t": "Alpha Cutoff Value 覆盖率参考值"
}
]
},
{
"t": "Fadeout Mip Maps 级别递减时使 Mipmap 淡化为灰色"
}
]
}
]
}
},
"9d506c3f39eb": {
"type": "mind",
"title": "Quality 与采样率",
"opt": {
"h": 400,
"maxW": 170
},
"data": {
"t": "Quality 音频质量",
"n": "不适用于 PCM / ADPCM / HEVAG 格式",
"c": [
{
"t": "Sample Rate Setting",
"n": "PCM 和 ADPCM 压缩格式允许自动优化或手动降低采样率",
"c": [
{
"t": "Preserve Sample Rate 保持采样率不变（默认值）"
},
{
"t": "Optimize Sample Rate 根据分析的最高频率内容自动优化采样率"
},
{
"t": "Override Sample Rate 允许手动覆盖采样率，可用于丢弃频率内容"
}
]
}
]
}
},
"9e634a085ef0": {
"type": "vec",
"title": "位置 + 向量 = 新位置",
"opt": {
"h": 420
},
"data": {
"items": [
{
"k": "pt",
"n": "a",
"x": -3,
"y": -2,
"c": "#8b98ad"
},
{
"k": "seg",
"n": "A",
"from": [
-3,
-2
],
"to": [
1,
1.5
],
"c": "#e8663d"
},
{
"k": "pt",
"n": "a + A",
"x": 1,
"y": 1.5,
"c": "#2b6cf6"
}
],
"note": "位置 + 向量 = 位置：向量不带位置，把它加到一个位置上就是平移。顺序可交换，结果还是位置。"
}
},
"a4d793ea4f3f": {
"type": "mind",
"title": "纹理 Wrap / Filter Mode",
"opt": {
"h": 520,
"maxW": 170
},
"data": {
"t": "纹理采样设置",
"c": [
{
"t": "Wrap Mode 平铺纹理时的方式",
"c": [
{
"t": "Repeat 在区块中重复纹理"
},
{
"t": "Clamp 拉伸纹理的边缘"
},
{
"t": "Mirror 在每个整数边界上镜像纹理以创建重复图案"
},
{
"t": "Mirror Once 镜像纹理一次，然后将拉伸边缘纹理"
},
{
"t": "Per-axis 单独控制如何在 U 轴和 V 轴上包裹纹理"
}
]
},
{
"t": "Filter Mode 纹理在通过 3D 变化拉伸时如何进行过度",
"c": [
{
"t": "Point 纹理在靠近时变为块状"
},
{
"t": "Bilinear 纹理在靠近时变得模糊"
},
{
"t": "Trilinear 与 Bilinear 类似，但在不同的 Mip 级别之间模糊"
}
]
},
{
"t": "Aniso Level 以大角度查看纹理时提高纹理质量",
"n": "性能消耗高"
}
]
}
},
"afb6967bea53": {
"type": "trig",
"title": "余弦函数曲线",
"opt": {
"h": 380
},
"data": {
"fn": "cos",
"yLabel": "y",
"note": "y = A·cos(ωx + φ)，x ∈ ℝ；拖动滑杆看振幅、周期、相位怎么变。"
}
},
"b083c4ca1dc3": {
"type": "flow",
"title": "MonoBehaviour 生命周期",
"opt": {
"h": 470
},
"data": {
"nodes": [
{
"id": "born",
"t": "对象出生",
"lv": 0,
"k": "start"
},
{
"id": "awake",
"t": "Awake",
"lv": 1
},
{
"id": "enable",
"t": "OnEnable",
"lv": 2
},
{
"id": "start",
"t": "Start",
"lv": 3
},
{
"id": "fixed",
"t": "FixedUpdate",
"lv": 4
},
{
"id": "update",
"t": "Update",
"lv": 5
},
{
"id": "late",
"t": "LateUpdate",
"lv": 6
},
{
"id": "disable",
"t": "OnDisable",
"lv": 7
},
{
"id": "destroy",
"t": "OnDestroy",
"lv": 8
},
{
"id": "dead",
"t": "对象死亡",
"lv": 9,
"k": "end"
}
],
"edges": [
[
"born",
"awake"
],
[
"awake",
"enable"
],
[
"enable",
"start"
],
[
"start",
"fixed"
],
[
"fixed",
"update"
],
[
"update",
"late"
],
[
"late",
"fixed",
"循环，每帧执行"
],
[
"late",
"disable"
],
[
"disable",
"destroy"
],
[
"destroy",
"dead"
],
[
"disable",
"enable",
"重新激活时再次调用",
true
]
]
}
},
"b10166b4f7c1": {
"type": "mind",
"title": "LineRenderer 光照与探针",
"opt": {
"h": 560,
"maxW": 160
},
"data": {
"t": "LineRenderer（续）",
"c": [
{
"t": "Shadow Bias 阴影偏移"
},
{
"t": "Generate Lighting Data 生成光源数据"
},
{
"t": "Use World Space 是否使用世界坐标系"
},
{
"t": "Materials 线使用的材质球"
},
{
"t": "Lighting 光照影响",
"c": [
{
"t": "Cast Shadows 是否开启阴影"
},
{
"t": "Receive Shadows 接收阴影"
}
]
},
{
"t": "Probes 光照探针",
"c": [
{
"t": "Light Probes 光探测器模式",
"c": [
{
"t": "Off 不使用光探针"
},
{
"t": "Blend Probes 使用内插光探针"
},
{
"t": "Use Proxy Volume 使用三维网格内插光探针"
},
{
"t": "Custom Provided 自定义，从材质决定"
}
]
},
{
"t": "Reflection Probes 反射探测器模式",
"c": [
{
"t": "Off 不使用反射探针"
},
{
"t": "Blend Probes 启用混合反射探针"
},
{
"t": "Blend Probes And Skybox 启用混合反射探针并且和天空盒混合"
},
{
"t": "Simple 启用普通探针，重叠式不混合"
}
]
}
]
}
]
}
},
"b984d5bb3182": {
"type": "mind",
"title": "LineRenderer 编辑模式",
"opt": {
"h": 470,
"maxW": 160
},
"data": {
"t": "LineRenderer 编辑模式",
"n": "新版本才有的编辑模式",
"c": [
{
"t": "场景编辑模式",
"c": [
{
"t": "左侧编点"
},
{
"t": "右侧添加点"
}
]
},
{
"t": "偏顶点模式",
"c": [
{
"t": "Show Wireframe 显示线框"
},
{
"t": "Subdivide Selected 细分选中点",
"n": "选择两个或多个相邻点时可用，会在相邻点之间插入一个新点"
}
]
},
{
"t": "添加点模式",
"c": [
{
"t": "Input 输入模式",
"c": [
{
"t": "Mouse Position 鼠标位置"
},
{
"t": "Physics Raycast 物理射线检测",
"c": [
{
"t": "LayerMask 哪些层能被射线检测"
}
]
},
{
"t": "Min Vertex Distance 最小顶点距离",
"n": "光标移动超出该距离时才新建一个点"
},
{
"t": "Offset 偏移量"
}
]
}
]
},
{
"t": "无编辑操作（简化预览）",
"c": [
{
"t": "Simplify Preview 简化预览"
},
{
"t": "Tolerance 偏值，越大偏差越大"
},
{
"t": "Simplify 简化按钮"
}
]
}
]
}
},
"c613e8730e27": {
"type": "axes3d",
"title": "Unity 左手坐标系三轴",
"opt": {
"h": 430
},
"data": {
"cube": true
}
},
"d59417b0b1b3": {
"type": "vec",
"title": "两点决定一向量",
"opt": {
"h": 420
},
"data": {
"items": [
{
"k": "pt",
"n": "A",
"x": -2.5,
"y": -1.5,
"c": "#8b98ad"
},
{
"k": "pt",
"n": "B",
"x": 3,
"y": 2.5,
"c": "#8b98ad"
},
{
"k": "seg",
"n": "B − A",
"from": [
-2.5,
-1.5
],
"to": [
3,
2.5
],
"c": "#2b6cf6"
}
],
"note": "拖 A、B 两点：向量 = 终点减起点，B−A = (Xb−Xa, Yb−Ya, Zb−Za)"
}
},
"e088c14ad243": {
"type": "mind",
"title": "WheelCollider 车轮碰撞器",
"opt": {
"h": 620,
"maxW": 150
},
"data": {
"t": "WheelCollider 环状碰撞器",
"c": [
{
"t": "Mass 车轮的质量"
},
{
"t": "Radius 车轮的半径"
},
{
"t": "Wheel Damping Rate 应用于车轮的阻尼值"
},
{
"t": "Suspension Distance 车轮悬架的最大限度延伸距离",
"n": "在局部空间中测量，悬架始终向下延伸穿过局部 Y 轴"
},
{
"t": "Force App Point Distance 此参数定义车轮上的受力点",
"n": "当该值为 0 时受力点位于静止的车轮底部"
},
{
"t": "Suspension Spring 悬架弹簧",
"n": "通过增加弹簧力和阻尼力来达到目标位置",
"c": [
{
"t": "Spring 弹簧力尝试到达目标位置，值越大越快"
},
{
"t": "Damper 抑制悬架速度，值越大弹簧移动越慢"
},
{
"t": "Target Position 悬架静止距离，1 完全展开、0 完全压缩，默认 0.5"
}
]
},
{
"t": "Forward / Sideways Friction 轮胎向前 / 侧向滚动时摩擦的特性",
"c": [
{
"t": "Extremum Slip 曲线的极值点"
},
{
"t": "Extremum Value 曲线的极值点"
},
{
"t": "Asymptote Slip 曲线的渐近点"
},
{
"t": "Asymptote Value 曲线的渐近点"
},
{
"t": "Stiffness 摩擦力的乘数（默认 1）",
"n": "设为 0 将完全禁用该车轮所有摩擦力"
}
]
},
{
"t": "注意：不必通过转动或滚动 WheelCollider 控制汽车",
"n": "附加了 WheelCollider 的对象应始终相对于汽车本身固定"
}
]
}
},
"ef73eaa4b926": {
"type": "mind",
"title": "光源 Light 参数结构",
"opt": {
"h": 580,
"maxW": 150
},
"data": {
"t": "光源 Light",
"c": [
{
"t": "Type 光源类型",
"c": [
{
"t": "Spot 聚光灯",
"c": [
{
"t": "Range 发光范围距离"
},
{
"t": "Spot Angle 光锥角度"
}
]
},
{
"t": "Directional 方向光（环境光）"
},
{
"t": "Point 点光源"
},
{
"t": "Area 面光源"
}
]
},
{
"t": "Color 颜色"
},
{
"t": "Mode 光源模式",
"c": [
{
"t": "Realtime 实时光源",
"c": [
{
"t": "每帧实时计算，效果好，性能消耗大"
}
]
},
{
"t": "Baked 烘焙光源",
"c": [
{
"t": "事先计算好，无法动态变化"
}
]
},
{
"t": "Mixed 混合光源",
"c": [
{
"t": "预先计算 + 实时运算"
}
]
}
]
},
{
"t": "Intensity 光源亮度"
},
{
"t": "Indirect Multiplier 间接光倍数",
"c": [
{
"t": "改变间接光的强度"
},
{
"t": "低于 1，每次反弹会使光更暗"
},
{
"t": "大于 1，每次反弹会使光更亮"
}
]
},
{
"t": "Shadow Type 阴影类型",
"c": [
{
"t": "No Shadows 关闭阴影"
},
{
"t": "Hard Shadows 生硬阴影"
},
{
"t": "Soft Shadows 柔和阴影"
}
]
},
{
"t": "Realtime Shadows 实时阴影",
"c": [
{
"t": "Strength 阴影暗度 0~1，越大越黑"
},
{
"t": "Resolution 阴影贴图渲染分辨率，越高越逼真，消耗越高"
},
{
"t": "Bias 阴影推离光源的距离"
},
{
"t": "Normal Bias 阴影投射面沿法线收缩距离"
},
{
"t": "Near Panel 渲染阴影的近裁剪面"
}
]
},
{
"t": "Cookie 投影遮罩"
},
{
"t": "Cookie Size 遮罩尺寸"
},
{
"t": "Draw Halo 球形光环开关"
},
{
"t": "Flare 耀斑"
},
{
"t": "Render Mode 渲染模式",
"c": [
{
"t": "Auto 运行时确定"
},
{
"t": "Important 以像素质量为单元渲染，效果逼真，消耗大"
},
{
"t": "Not Important 以快速模式渲染"
}
]
},
{
"t": "Culling Mask 剔除遮罩层，决定哪些层的对象受该光源影响"
}
]
}
},
"f599b10e6546": {
"type": "mind",
"title": "Unity 进阶能力路线图",
"opt": {
"h": 560,
"maxW": 150
},
"data": {
"t": "Unity 进阶",
"c": [
{
"t": "核心系统",
"c": [
{
"t": "Input System 输入系统"
},
{
"t": "Addressable 资源寻址系统"
},
{
"t": "物理系统：铰链与布料"
},
{
"t": "粒子系统"
},
{
"t": "光照系统"
},
{
"t": "DOTS"
},
{
"t": "TimeLine"
},
{
"t": "地形系统"
}
]
},
{
"t": "功能相关",
"c": [
{
"t": "ScriptableObject"
},
{
"t": "AnimationCurve"
},
{
"t": "WWW / UnityWebRequest"
},
{
"t": "C# 相关"
}
]
},
{
"t": "优化相关",
"c": [
{
"t": "优化指什么"
},
{
"t": "性能检测窗口"
},
{
"t": "静态批处理"
},
{
"t": "动态批处理"
},
{
"t": "网格合并"
}
]
},
{
"t": "插件相关",
"c": [
{
"t": "TextMeshPro"
},
{
"t": "DOTween"
}
]
}
]
}
},
"1c8d626c6942": {
"type": "fx",
"title": "弧度的定义",
"data": {
"note": "数学层面：弧度是「自然单位」—— 弧长等于半径时，圆心角就是 1 弧度",
"lines": [
"\\theta = \\frac{弧长}{半径}"
]
}
},
"91f443c902dc": {
"type": "fx",
"title": "向量的模长（两点间距离）",
"data": {
"note": "向量由两个点算出，所以模长就是这两个点之间的距离",
"lines": [
"模长 = \\sqrt{x^2 + y^2 + z^2}"
]
}
},
"a1ffdcfcc7ff": {
"type": "fx",
"title": "单位四元数的约束条件",
"data": {
"note": "四元数用来表示三维旋转；「单位」指它的长度为 1",
"lines": [
"\\sqrt{w^2 + x^2 + y^2 + z^2} = 1"
]
}
},
"467002524610": {
"type": "fx",
"title": "没有旋转的四元数（0° / 360°）",
"data": {
"note": "绕坐标轴转 180° 时 w = 0；转 0° 或 360° 时 w = ±1，两者等价",
"lines": [
"q = (1, 0, 0, 0)",
"或",
"q = (−1, 0, 0, 0)"
]
}
},
"82b6fd5d46e6": {
"type": "fx",
"title": "绕 X 轴旋转 90°",
"data": {
"note": "半角 45°：w = cos45°，x = sin45°",
"lines": [
"q = (\\cos 45^{\\circ}, \\sin 45^{\\circ}, 0, 0) = (\\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{2}}{2}, 0, 0)"
]
}
},
"8c9c9d93c28a": {
"type": "fx",
"title": "绕 X 轴旋转 270°",
"data": {
"note": "等价于绕 X 轴 −90°：sin(−45°) 取负，x 分量为 −√2/2",
"lines": [
"q = (\\frac{\\sqrt{2}}{2}, −\\frac{\\sqrt{2}}{2}, 0, 0)"
]
}
},
"fa16b07232af": {
"type": "fx",
"title": "绕 Y 轴旋转 90°",
"data": {
"note": "半角 45°：w = cos45°，y = sin45°",
"lines": [
"q = (\\frac{\\sqrt{2}}{2}, 0, \\frac{\\sqrt{2}}{2}, 0)"
]
}
},
"bd80cf929fef": {
"type": "fx",
"title": "绕 Y 轴旋转 270°",
"data": {
"note": "等价于绕 Y 轴 −90°：y 分量取负",
"lines": [
"q = (\\frac{\\sqrt{2}}{2}, 0, −\\frac{\\sqrt{2}}{2}, 0)"
]
}
},
"ffd6fed1dadc": {
"type": "fx",
"title": "绕 Z 轴旋转 90°",
"data": {
"note": "半角 45°：w = cos45°，z = sin45°",
"lines": [
"q = (\\frac{\\sqrt{2}}{2}, 0, 0, \\frac{\\sqrt{2}}{2})"
]
}
},
"226d9581f5ba": {
"type": "fx",
"title": "绕 Z 轴旋转 270°",
"data": {
"note": "等价于绕 Z 轴 −90°：z 分量取负",
"lines": [
"q = (\\frac{\\sqrt{2}}{2}, 0, 0, −\\frac{\\sqrt{2}}{2})"
]
}
},
"ba08d58fc830": {
"type": "fx",
"title": "矩形相交判定（四个点全部落在对方范围内）",
"data": {
"note": "x₁,y₁,w₁,h₁ 是矩形 1 的左下角与宽高；x,y,w,h 是矩形 2。四条析取分别对应矩形 1 的四个角点",
"lines": [
"矩形碰撞判定 =",
"\\quad (x_1 > x \\wedge x_1 < x + w \\wedge y_1 > y \\wedge y_1 < y + h)",
"\\vee (x_1 + w_1 > x \\wedge x_1 + w_1 < x + w \\wedge y_1 > y \\wedge y_1 < y + h)",
"\\vee (x_1 > x \\wedge x_1 < x + w \\wedge y_1 + h_1 > y \\wedge y_1 + h_1 < y + h)",
"\\vee (x_1 + w_1 > x \\wedge x_1 + w_1 < x + w \\wedge y_1 + h_1 > y \\wedge y_1 + h_1 < y + h)"
]
}
},
"bf94e81bb334": {
"type": "ocr",
"title": "Inspector 里的四条属性（Atk / Def / Miss / Crit）",
"data": {
"kind": "rows",
"w": 239,
"h": 105,
"groups": [
{
"h": "",
"rows": [
[
"Atk",
"0"
],
[
"Def",
"0"
],
[
"Miss",
"0"
],
[
"Crit",
"0"
]
]
},
{
"h": "面板底部",
"rows": [
[
"Add Component",
""
]
]
}
]
}
},
"13a92157fd2c": {
"type": "pic",
"title": "GUILayout 滑条：Luck 当前 5.51",
"data": {
"w": 660,
"h": 104,
"items": [
{
"k": "text",
"x": 6,
"y": 58,
"t": "Luck",
"size": 15,
"fill": "#243447",
"weight": 600
},
{
"k": "line",
"pts": [
[
96,
52
],
[
500,
52
]
],
"stroke": "#d3dae5",
"sw": 4
},
{
"k": "line",
"pts": [
[
96,
52
],
[
318.60400000000004,
52
]
],
"stroke": "#2b6cf6",
"sw": 4
},
{
"k": "circle",
"cx": 318.60400000000004,
"cy": 52,
"r": 10,
"fill": "#fff",
"stroke": "#2b6cf6",
"sw": 2.4
},
{
"k": "rect",
"x": 520,
"y": 34,
"w": 96,
"h": 36,
"r": 5,
"fill": "#fff",
"stroke": "#c8d2e0"
},
{
"k": "text",
"x": 568,
"y": 58,
"t": "5.51",
"size": 15,
"fill": "#243447",
"anchor": "middle"
},
{
"k": "text",
"x": 96,
"y": 92,
"t": "0",
"size": 11,
"fill": "#8b98ad"
},
{
"k": "text",
"x": 500,
"y": 92,
"t": "10",
"size": 11,
"fill": "#8b98ad",
"anchor": "end"
},
{
"k": "text",
"x": 330,
"y": 22,
"t": "GUILayout.HorizontalSlider(luck, 0, 10)",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle",
"mono": true
}
]
}
},
"708c3c775d63": {
"type": "ocr",
"title": "Tips 标签 + 多行文本框（框内可多行输入）",
"data": {
"kind": "cols",
"w": 334,
"h": 78,
"cols": [
{
"kind": "lines",
"title": "标签",
"lines": [
{
"t": "Tips",
"i": 0
}
]
},
{
"kind": "lines",
"title": "多行文本框（GUILayout.TextArea）",
"lines": [
{
"t": "1",
"i": 1
},
{
"t": "2",
"i": 1
},
{
"t": "3",
"i": 1
},
{
"t": "4",
"i": 1
},
{
"t": "5",
"i": 1
}
]
}
]
}
},
"920617afa2ce": {
"type": "ocr",
"title": "Instantiate 出来的克隆体在层级里带 (Clone)",
"data": {
"kind": "lines",
"w": 345,
"h": 42,
"lines": [
{
"t": "Sphere(Clone)",
"i": 0
},
{
"t": "即 Instantiate(Sphere) 生成的对象，名字自动加 (Clone) 后缀；此时正在重命名",
"i": 1
}
]
}
},
"ee42b70e89ce": {
"type": "vec",
"title": "点乘判断前后：A·B > 0 在前，< 0 在后",
"data": {
"items": [
{
"k": "vec",
"n": "A",
"x": 0,
"y": 3,
"c": "#2b6cf6"
},
{
"k": "vec",
"n": "B",
"x": 2,
"y": 3,
"c": "#17a673"
},
{
"k": "pt",
"n": "后方目标",
"x": 1,
"y": -2.5,
"c": "#e14b3c"
}
],
"note": "A 是朝向；B 与 A 同向一侧 → A·B > 0 在前。把 B 换成后方目标（A·B < 0 即在后）。点乘只看「前后」这一维，左右它分不出来。"
},
"opt": {
"h": 380
}
},
"19a5fb355565": {
"type": "vec",
"title": "点乘 = 0 时垂直：分不清左还是右",
"data": {
"items": [
{
"k": "vec",
"n": "A",
"x": 0,
"y": 3,
"c": "#2b6cf6"
},
{
"k": "vec",
"n": "B",
"x": 3,
"y": 0,
"c": "#17a673"
}
],
"note": "A·B = 0 → 夹角 90°，目标既不在前也不在后。左右要另判：看叉乘 A×B 的正负（见下方）。"
},
"opt": {
"h": 380
}
},
"1581238e64b9": {
"type": "vec",
"title": "两个点算出的向量 AB → 转成朝向",
"data": {
"items": [
{
"k": "pt",
"n": "A",
"x": -3,
"y": -1.5,
"c": "#8b98ad"
},
{
"k": "pt",
"n": "B",
"x": 2,
"y": 2,
"c": "#e8663d"
},
{
"k": "seg",
"n": "AB",
"from": [
-3,
-1.5
],
"to": [
2,
2
],
"c": "#e14b3c"
}
],
"note": "B − A 得到方向向量，Quaternion.LookRotation(B − A) 得到对应四元数；把人物的 rotation 改成它，人物就转向 B。"
},
"opt": {
"h": 400
}
},
"c4673284aa02": {
"type": "pic",
"title": "范围检测 OverlapSphere：只在内部计算，不生成物体",
"data": {
"w": 640,
"h": 320,
"items": [
{
"k": "rect",
"x": 40,
"y": 200,
"w": 560,
"h": 8,
"fill": "#e6ebf3"
},
{
"k": "circle",
"cx": 320,
"cy": 150,
"r": 108,
"fill": "rgba(43,108,246,.07)",
"stroke": "#2b6cf6",
"sw": 2,
"dash": "7 5"
},
{
"k": "circle",
"cx": 320,
"cy": 150,
"r": 4.5,
"fill": "#2b6cf6"
},
{
"k": "text",
"x": 306,
"y": 155,
"t": "中心点",
"size": 11,
"fill": "#2b6cf6",
"anchor": "end"
},
{
"k": "rect",
"x": 250,
"y": 166,
"w": 34,
"h": 34,
"fill": "#17a673",
"stroke": "#0d8a5f",
"r": 3,
"op": 0.85
},
{
"k": "circle",
"cx": 404,
"cy": 168,
"r": 17,
"fill": "#17a673",
"stroke": "#0d8a5f",
"op": 0.85
},
{
"k": "text",
"x": 320,
"y": 292,
"t": "范围内 → 返回该物体",
"size": 11.5,
"fill": "#17a673",
"anchor": "middle",
"weight": 600
},
{
"k": "rect",
"x": 500,
"y": 166,
"w": 34,
"h": 34,
"fill": "#c3ccda",
"stroke": "#9aa7b8",
"r": 3
},
{
"k": "circle",
"cx": 120,
"cy": 168,
"r": 17,
"fill": "#c3ccda",
"stroke": "#9aa7b8"
},
{
"k": "text",
"x": 517,
"y": 292,
"t": "范围外 → 忽略",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
},
{
"k": "arrow",
"x1": 320,
"y1": 150,
"x2": 398,
"y2": 104,
"stroke": "#2b6cf6",
"sw": 1.6
},
{
"k": "text",
"x": 406,
"y": 100,
"t": "radius",
"size": 11.5,
"fill": "#2b6cf6",
"weight": 600
}
]
}
},
"335c28c0de92": {
"type": "pic",
"title": "射线检测 Raycast：从一点射出，返回第一个命中的碰撞体",
"data": {
"w": 640,
"h": 320,
"items": [
{
"k": "rect",
"x": 40,
"y": 222,
"w": 560,
"h": 8,
"fill": "#e6ebf3"
},
{
"k": "circle",
"cx": 96,
"cy": 92,
"r": 7,
"fill": "#e8663d"
},
{
"k": "text",
"x": 96,
"y": 74,
"t": "发射点 origin",
"size": 11,
"fill": "#e8663d",
"anchor": "middle",
"weight": 600
},
{
"k": "arrow",
"x1": 104,
"y1": 96,
"x2": 300,
"y2": 186,
"stroke": "#e14b3c",
"sw": 2.6
},
{
"k": "text",
"x": 206,
"y": 172,
"t": "direction",
"size": 11.5,
"fill": "#e14b3c",
"weight": 600,
"anchor": "middle"
},
{
"k": "circle",
"cx": 332,
"cy": 196,
"r": 30,
"fill": "rgba(23,166,115,.16)",
"stroke": "#17a673",
"sw": 2
},
{
"k": "circle",
"cx": 302,
"cy": 186,
"r": 5,
"fill": "#e14b3c"
},
{
"k": "text",
"x": 276,
"y": 210,
"t": "hit point",
"size": 11,
"fill": "#e14b3c",
"anchor": "end",
"weight": 600
},
{
"k": "rect",
"x": 430,
"y": 140,
"w": 56,
"h": 82,
"fill": "#c3ccda",
"stroke": "#9aa7b8",
"r": 3
},
{
"k": "text",
"x": 458,
"y": 244,
"t": "被它挡住 → 不再继续",
"size": 11,
"fill": "#8b98ad",
"anchor": "middle"
},
{
"k": "text",
"x": 320,
"y": 292,
"t": "能走多远由 maxDistance 限制；返回 RaycastHit 里有命中点和法线",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
}
]
}
},
"04061fccb8f4": {
"type": "pic",
"title": "Sprite Creator 内置图形：Circle / Triangle / Diamond / Hexagon / Polygon",
"data": {
"w": 700,
"h": 206,
"fg": "#ffffff",
"items": [
{
"k": "rect",
"x": 0,
"y": 16,
"w": 700,
"h": 190,
"fill": "#3c3c3c"
},
{
"k": "poly",
"pts": [
[
70,
92
],
[
54,
110
],
[
58,
134
],
[
80,
148
],
[
106,
142
],
[
116,
116
],
[
100,
94
]
],
"fill": "#ffffff"
},
{
"k": "poly",
"pts": [
[
196,
74
],
[
246,
148
],
[
146,
148
]
],
"fill": "#ffffff"
},
{
"k": "poly",
"pts": [
[
330,
76
],
[
382,
112
],
[
330,
148
],
[
278,
112
]
],
"fill": "#ffffff"
},
{
"k": "hex",
"cx": 468,
"cy": 112,
"r": 38,
"flat": true,
"fill": "#ffffff"
},
{
"k": "circle",
"cx": 600,
"cy": 112,
"r": 36,
"fill": "#ffffff"
},
{
"k": "text",
"x": 86,
"y": 182,
"t": "Polygon",
"size": 12,
"fill": "#c9d2de",
"anchor": "middle"
},
{
"k": "text",
"x": 196,
"y": 182,
"t": "Triangle",
"size": 12,
"fill": "#c9d2de",
"anchor": "middle"
},
{
"k": "text",
"x": 330,
"y": 182,
"t": "Diamond",
"size": 12,
"fill": "#c9d2de",
"anchor": "middle"
},
{
"k": "text",
"x": 468,
"y": 182,
"t": "Hexagon",
"size": 12,
"fill": "#c9d2de",
"anchor": "middle"
},
{
"k": "text",
"x": 600,
"y": 182,
"t": "Circle",
"size": 12,
"fill": "#c9d2de",
"anchor": "middle"
}
]
}
},
"09e022fdeda8": {
"type": "pic",
"title": "三张图叠放、图集交错 → 3 次 DrawCall",
"data": {
"w": 660,
"h": 230,
"items": [
{
"k": "rect",
"x": 30,
"y": 40,
"w": 120,
"h": 88,
"r": 6,
"fill": "rgba(43,108,246,.16)",
"stroke": "#2b6cf6",
"sw": 1.8
},
{
"k": "rect",
"x": 136,
"y": 66,
"w": 120,
"h": 88,
"r": 6,
"fill": "rgba(232,102,61,.24)",
"stroke": "#e8663d",
"sw": 1.8
},
{
"k": "rect",
"x": 242,
"y": 40,
"w": 120,
"h": 88,
"r": 6,
"fill": "rgba(43,108,246,.16)",
"stroke": "#2b6cf6",
"sw": 1.8
},
{
"k": "text",
"x": 90,
"y": 148,
"t": "图集 A（底）",
"size": 11.5,
"fill": "#2b6cf6",
"anchor": "middle",
"weight": 600
},
{
"k": "text",
"x": 196,
"y": 184,
"t": "图集 B（中）",
"size": 11.5,
"fill": "#e8663d",
"anchor": "middle",
"weight": 600
},
{
"k": "text",
"x": 302,
"y": 148,
"t": "图集 A（顶）",
"size": 11.5,
"fill": "#2b6cf6",
"anchor": "middle",
"weight": 600
},
{
"k": "arrow",
"x1": 376,
"y1": 88,
"x2": 428,
"y2": 88,
"stroke": "#8b98ad",
"sw": 2
},
{
"k": "text",
"x": 486,
"y": 86,
"t": "3",
"size": 32,
"fill": "#e14b3c",
"anchor": "middle",
"weight": 700
},
{
"k": "text",
"x": 486,
"y": 110,
"t": "次 DrawCall",
"size": 12,
"fill": "#e14b3c",
"anchor": "middle",
"weight": 600
},
{
"k": "text",
"x": 330,
"y": 216,
"t": "渲染顺序 A → B → A：同图集的两张被中间那张隔开，合批被打断，于是提交 3 次",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
}
]
}
},
"bd1a16e1b0f6": {
"type": "pic",
"title": "同图集相邻排布 → 1 次 DrawCall",
"data": {
"w": 660,
"h": 220,
"items": [
{
"k": "rect",
"x": 60,
"y": 54,
"w": 128,
"h": 96,
"r": 6,
"fill": "rgba(43,108,246,.16)",
"stroke": "#2b6cf6",
"sw": 1.8
},
{
"k": "rect",
"x": 196,
"y": 54,
"w": 128,
"h": 96,
"r": 6,
"fill": "rgba(43,108,246,.16)",
"stroke": "#2b6cf6",
"sw": 1.8
},
{
"k": "text",
"x": 124,
"y": 172,
"t": "图集 A",
"size": 11.5,
"fill": "#2b6cf6",
"anchor": "middle",
"weight": 600
},
{
"k": "text",
"x": 260,
"y": 172,
"t": "图集 A",
"size": 11.5,
"fill": "#2b6cf6",
"anchor": "middle",
"weight": 600
},
{
"k": "arrow",
"x1": 348,
"y1": 102,
"x2": 400,
"y2": 102,
"stroke": "#8b98ad",
"sw": 2
},
{
"k": "text",
"x": 374,
"y": 88,
"t": "同一图集",
"size": 11,
"fill": "#8b98ad",
"anchor": "middle"
},
{
"k": "text",
"x": 454,
"y": 92,
"t": "1",
"size": 34,
"fill": "#17a673",
"anchor": "middle",
"weight": 700
},
{
"k": "text",
"x": 454,
"y": 116,
"t": "次 DrawCall",
"size": 12,
"fill": "#17a673",
"anchor": "middle",
"weight": 600
},
{
"k": "text",
"x": 330,
"y": 208,
"t": "相邻且同图集 → 一次合批提交完，DrawCall 最少",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
}
]
}
},
"dedd2d804594": {
"type": "pic",
"title": "PolygonCollider2D：拖顶点就能改碰撞范围",
"data": {
"w": 560,
"h": 340,
"items": [
{
"k": "poly",
"pts": [
[
394.9707979662816,
206.45121758357308
],
[
328.45065993266996,
274.1426018281026
],
[
233.5487824164269,
274.9707979662816
],
[
165.8573981718974,
208.45065993266996
],
[
165.02920203371838,
113.54878241642692
],
[
231.54934006733004,
45.8573981718974
],
[
326.4512175835731,
45.02920203371836
],
[
394.1426018281026,
111.54934006733004
]
],
"fill": "rgba(23,166,115,.10)",
"stroke": "#17a673",
"sw": 2.6
},
{
"k": "circle",
"cx": 394.9707979662816,
"cy": 206.45121758357308,
"r": 5.5,
"fill": "#fff",
"stroke": "#17a673",
"sw": 2
},
{
"k": "circle",
"cx": 328.45065993266996,
"cy": 274.1426018281026,
"r": 5.5,
"fill": "#fff",
"stroke": "#17a673",
"sw": 2
},
{
"k": "circle",
"cx": 233.5487824164269,
"cy": 274.9707979662816,
"r": 5.5,
"fill": "#fff",
"stroke": "#17a673",
"sw": 2
},
{
"k": "circle",
"cx": 165.8573981718974,
"cy": 208.45065993266996,
"r": 5.5,
"fill": "#fff",
"stroke": "#17a673",
"sw": 2
},
{
"k": "circle",
"cx": 165.02920203371838,
"cy": 113.54878241642692,
"r": 5.5,
"fill": "#fff",
"stroke": "#17a673",
"sw": 2
},
{
"k": "circle",
"cx": 231.54934006733004,
"cy": 45.8573981718974,
"r": 5.5,
"fill": "#fff",
"stroke": "#17a673",
"sw": 2
},
{
"k": "circle",
"cx": 326.4512175835731,
"cy": 45.02920203371836,
"r": 5.5,
"fill": "#fff",
"stroke": "#17a673",
"sw": 2
},
{
"k": "circle",
"cx": 394.1426018281026,
"cy": 111.54934006733004,
"r": 5.5,
"fill": "#fff",
"stroke": "#17a673",
"sw": 2
},
{
"k": "text",
"x": 280,
"y": 316,
"t": "绿色是实际参与检测的形状，白色圆点是可拖拽的顶点",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
}
]
}
},
"51afb8a388ea": {
"type": "pic",
"title": "异形碰撞范围：几个 BoxCollider2D 拼出十字，角色按形状被挡",
"data": {
"w": 560,
"h": 320,
"items": [
{
"k": "rect",
"x": 230,
"y": 60,
"w": 100,
"h": 200,
"fill": "rgba(43,108,246,.14)",
"stroke": "#2b6cf6",
"sw": 1.8,
"dash": "5 4"
},
{
"k": "rect",
"x": 180,
"y": 110,
"w": 200,
"h": 100,
"fill": "rgba(43,108,246,.14)",
"stroke": "#2b6cf6",
"sw": 1.8,
"dash": "5 4"
},
{
"k": "circle",
"cx": 280,
"cy": 160,
"r": 26,
"fill": "#e14b3c",
"op": 0.9
},
{
"k": "text",
"x": 280,
"y": 296,
"t": "红球（角色）走到哪一块上都会被挡 —— 碰撞范围由若干盒子拼成",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
},
{
"k": "arrow",
"x1": 392,
"y1": 118,
"x2": 452,
"y2": 88,
"stroke": "#8b98ad",
"sw": 1.6
},
{
"k": "text",
"x": 456,
"y": 84,
"t": "BoxCollider2D ×2",
"size": 11,
"fill": "#8b98ad"
}
]
}
},
"fb9f5a42e85e": {
"type": "pic",
"title": "BuoyancyEffector2D：进入水域后受浮力和阻力，看起来像在水里",
"data": {
"w": 560,
"h": 330,
"items": [
{
"k": "rect",
"x": 60,
"y": 70,
"w": 440,
"h": 130,
"fill": "rgba(43,108,246,.13)",
"stroke": "#2b6cf6",
"sw": 1.6
},
{
"k": "line",
"pts": [
[
60,
70
],
[
500,
70
]
],
"stroke": "#2b6cf6",
"sw": 2.4
},
{
"k": "text",
"x": 72,
"y": 62,
"t": "水面 surfaceLevel",
"size": 11,
"fill": "#2b6cf6",
"weight": 600
},
{
"k": "rect",
"x": 240,
"y": 104,
"w": 76,
"h": 76,
"r": 4,
"fill": "#cbd4e2",
"stroke": "#9aa7b8",
"op": 0.9
},
{
"k": "arrow",
"x1": 252,
"y1": 142,
"x2": 252,
"y2": 88,
"stroke": "#17a673",
"sw": 2.4
},
{
"k": "text",
"x": 240,
"y": 84,
"t": "浮力 F↑",
"size": 11.5,
"fill": "#17a673",
"weight": 600,
"anchor": "end"
},
{
"k": "arrow",
"x1": 304,
"y1": 150,
"x2": 304,
"y2": 208,
"stroke": "#e14b3c",
"sw": 2.2
},
{
"k": "text",
"x": 318,
"y": 192,
"t": "重力 G↓",
"size": 11.5,
"fill": "#e14b3c",
"weight": 600
},
{
"k": "text",
"x": 60,
"y": 250,
"t": "density 决定浮力大小，linearDrag / angularDrag 决定水里的阻力",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "start"
},
{
"k": "text",
"x": 60,
"y": 272,
"t": "两者平衡时物体悬停，浮力偏大就上浮、偏小就下沉",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "start"
}
]
}
},
"0cbcdc82f659": {
"type": "pic",
"title": "PlatformEffector2D：从下面能穿上去，站上去不会掉下来",
"data": {
"w": 580,
"h": 340,
"items": [
{
"k": "rect",
"x": 150,
"y": 120,
"w": 280,
"h": 18,
"r": 4,
"fill": "#a855f7",
"stroke": "#7c3aed"
},
{
"k": "text",
"x": 442,
"y": 134,
"t": "单向平台",
"size": 11.5,
"fill": "#7c3aed",
"weight": 600
},
{
"k": "rect",
"x": 196,
"y": 236,
"w": 34,
"h": 46,
"r": 4,
"fill": "#cbd4e2",
"stroke": "#9aa7b8"
},
{
"k": "arrow",
"x1": 213,
"y1": 232,
"x2": 213,
"y2": 176,
"stroke": "#17a673",
"sw": 2.4,
"dash": "6 3"
},
{
"k": "text",
"x": 232,
"y": 210,
"t": "① 从下往上：不拦",
"size": 11.5,
"fill": "#17a673",
"weight": 600
},
{
"k": "rect",
"x": 352,
"y": 74,
"w": 34,
"h": 46,
"r": 4,
"fill": "#cbd4e2",
"stroke": "#9aa7b8"
},
{
"k": "arrow",
"x1": 369,
"y1": 124,
"x2": 369,
"y2": 112,
"stroke": "#e14b3c",
"sw": 2.2
},
{
"k": "text",
"x": 378,
"y": 100,
"t": "② 站上去：不落",
"size": 11.5,
"fill": "#e14b3c",
"weight": 600
},
{
"k": "text",
"x": 290,
"y": 310,
"t": "useOneWay 打开后只挡「从上面来」的物体，侧面和下方一律穿过",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
}
]
}
},
"54f8a935d001": {
"type": "pic",
"title": "PlatformEffector2D 的 surfaceArc：决定「算作表面」的角度范围",
"data": {
"w": 560,
"h": 340,
"items": [
{
"k": "arc",
"cx": 280,
"cy": 150,
"r": 108,
"a0": 0,
"a1": 180,
"fill": "rgba(168,85,247,.13)",
"stroke": "#a855f7",
"sw": 1.4,
"dash": "5 4"
},
{
"k": "rect",
"x": 196,
"y": 142,
"w": 168,
"h": 16,
"r": 3,
"fill": "#a855f7",
"stroke": "#7c3aed"
},
{
"k": "circle",
"cx": 280,
"cy": 150,
"r": 4,
"fill": "#7c3aed"
},
{
"k": "line",
"pts": [
[
280,
150
],
[
388,
150
]
],
"stroke": "#a855f7",
"sw": 1.4
},
{
"k": "text",
"x": 340,
"y": 142,
"t": "surfaceArc / 2",
"size": 11,
"fill": "#7c3aed",
"anchor": "middle"
},
{
"k": "circle",
"cx": 280,
"cy": 268,
"r": 16,
"fill": "#cbd4e2",
"stroke": "#9aa7b8"
},
{
"k": "arrow",
"x1": 280,
"y1": 250,
"x2": 280,
"y2": 176,
"stroke": "#17a673",
"sw": 2,
"dash": "5 3"
},
{
"k": "text",
"x": 292,
"y": 232,
"t": "这段角度内落下 = 踩在表面上",
"size": 11.5,
"fill": "#17a673",
"weight": 600
},
{
"k": "text",
"x": 280,
"y": 320,
"t": "默认 180°；调小后只有正上方一小段算表面，斜着落会被弹开",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
}
]
}
},
"4036229e9e25": {
"type": "pic",
"title": "SurfaceEffector2D：贴着表面就自动被推着走（传送带）",
"data": {
"w": 600,
"h": 320,
"items": [
{
"k": "rect",
"x": 80,
"y": 170,
"w": 400,
"h": 18,
"r": 4,
"fill": "#17a673",
"stroke": "#0d8a5f"
},
{
"k": "rect",
"x": 210,
"y": 120,
"w": 56,
"h": 50,
"r": 5,
"fill": "#cbd4e2",
"stroke": "#9aa7b8"
},
{
"k": "arrow",
"x1": 120,
"y1": 152,
"x2": 190,
"y2": 152,
"stroke": "#17a673",
"sw": 2.4
},
{
"k": "text",
"x": 155,
"y": 142,
"t": "speed",
"size": 11.5,
"fill": "#17a673",
"anchor": "middle",
"weight": 600
},
{
"k": "text",
"x": 330,
"y": 152,
"t": "forceScale 越大",
"size": 11,
"fill": "#8b98ad",
"anchor": "middle"
},
{
"k": "text",
"x": 330,
"y": 166,
"t": "越难逆着走",
"size": 11,
"fill": "#8b98ad",
"anchor": "middle"
},
{
"k": "text",
"x": 280,
"y": 268,
"t": "不需要勾 isTrigger：物体贴在表面上就持续受力，类似传送带",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
},
{
"k": "text",
"x": 280,
"y": 292,
"t": "配合 friction 调摩擦，物体不会打滑",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
}
]
}
},
"557397b318f1": {
"type": "ocr",
"title": "菜单：Assets → Create → 2D → Sprite Shape Profile",
"data": {
"kind": "lines",
"w": 307,
"h": 18,
"lines": [
{
"t": "New SpriteShapeProfile",
"i": 0
},
{
"t": "在 Project 窗口右键 → Create → 2D → Sprite Shape Profile 创建配置文件",
"i": 1
}
]
}
},
"0e7115dcbe44": {
"type": "pic",
"title": "Open Shape：开放折线，所有角度复用同一张图块",
"data": {
"w": 640,
"h": 260,
"items": [
{
"k": "line",
"pts": [
[
40,
96
],
[
150,
150
],
[
256,
104
],
[
368,
168
],
[
470,
122
],
[
600,
150
]
],
"stroke": "#7c50d9",
"sw": 30,
"dash": null,
"cap": "butt",
"join": "round"
},
{
"k": "line",
"pts": [
[
150.5551749076482,
135.0102774934985
],
[
149.4448250923518,
164.9897225065015
]
],
"stroke": "#ffffff",
"sw": 1.3,
"op": 0.8
},
{
"k": "line",
"pts": [
[
257.2343316625073,
89.05087208741152
],
[
254.76566833749268,
118.94912791258848
]
],
"stroke": "#ffffff",
"sw": 1.3,
"op": 0.8
},
{
"k": "line",
"pts": [
[
369.2572426774666,
153.05278150123053
],
[
366.7427573225334,
182.94721849876947
]
],
"stroke": "#ffffff",
"sw": 1.3,
"op": 0.8
},
{
"k": "line",
"pts": [
[
468.83969395717185,
107.04494433688137
],
[
471.16030604282815,
136.95505566311863
]
],
"stroke": "#ffffff",
"sw": 1.3,
"op": 0.8
},
{
"k": "line",
"pts": [
[
46.61009785959122,
82.53498584157344
],
[
33.38990214040878,
109.46501415842656
]
],
"stroke": "#ffffff",
"sw": 1.3,
"op": 0.8
},
{
"k": "line",
"pts": [
[
596.8416588608237,
164.66372671760445
],
[
603.1583411391763,
135.33627328239555
]
],
"stroke": "#ffffff",
"sw": 1.3,
"op": 0.8
},
{
"k": "circle",
"cx": 40,
"cy": 96,
"r": 5,
"fill": "#fff",
"stroke": "#7c3aed",
"sw": 2
},
{
"k": "circle",
"cx": 150,
"cy": 150,
"r": 5,
"fill": "#fff",
"stroke": "#7c3aed",
"sw": 2
},
{
"k": "circle",
"cx": 256,
"cy": 104,
"r": 5,
"fill": "#ffd21e",
"stroke": "#a88600",
"sw": 2
},
{
"k": "circle",
"cx": 368,
"cy": 168,
"r": 5,
"fill": "#fff",
"stroke": "#7c3aed",
"sw": 2
},
{
"k": "circle",
"cx": 470,
"cy": 122,
"r": 5,
"fill": "#fff",
"stroke": "#7c3aed",
"sw": 2
},
{
"k": "circle",
"cx": 600,
"cy": 150,
"r": 5,
"fill": "#fff",
"stroke": "#7c3aed",
"sw": 2
},
{
"k": "text",
"x": 320,
"y": 232,
"t": "白点是可拖的控制点（黄点是被选中的）；整条带上每一段都是同一张图，转角也不换图",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
}
]
}
},
"e37414a79c62": {
"type": "pic",
"title": "Closed Shape：闭合后内部可填充，四条边分别指定不同图块",
"data": {
"w": 640,
"h": 330,
"items": [
{
"k": "poly",
"pts": [
[
120,
60
],
[
420,
70
],
[
500,
250
],
[
150,
280
]
],
"fill": "#a9b0bb",
"stroke": "none",
"op": 0.55
},
{
"k": "line",
"pts": [
[
120,
60
],
[
420,
70
]
],
"stroke": "#7c50d9",
"sw": 26,
"dash": null,
"cap": "butt",
"join": "round"
},
{
"k": "line",
"pts": [
[
120.4330927930243,
47.00721620927099
],
[
119.5669072069757,
72.992783790729
]
],
"stroke": "#ffffff",
"sw": 1.3,
"op": 0.8
},
{
"k": "line",
"pts": [
[
419.5669072069757,
82.992783790729
],
[
420.4330927930243,
57.00721620927099
]
],
"stroke": "#ffffff",
"sw": 1.3,
"op": 0.8
},
{
"k": "line",
"pts": [
[
420,
70
],
[
500,
250
]
],
"stroke": "#c9d6e6",
"sw": 26,
"dash": null,
"cap": "butt",
"join": "round"
},
{
"k": "line",
"pts": [
[
431.87955013206334,
64.72019994130518
],
[
408.12044986793666,
75.27980005869482
]
],
"stroke": "#ffffff",
"sw": 1.3,
"op": 0.8
},
{
"k": "line",
"pts": [
[
488.12044986793666,
255.27980005869483
],
[
511.87955013206334,
244.72019994130517
]
],
"stroke": "#ffffff",
"sw": 1.3,
"op": 0.8
},
{
"k": "line",
"pts": [
[
500,
250
],
[
150,
280
]
],
"stroke": "#8fd06a",
"sw": 26,
"dash": null,
"cap": "butt",
"join": "round"
},
{
"k": "line",
"pts": [
[
501.1102148375037,
262.95250643754275
],
[
498.8897851624963,
237.04749356245725
]
],
"stroke": "#ffffff",
"sw": 1.3,
"op": 0.8
},
{
"k": "line",
"pts": [
[
148.88978516249634,
267.04749356245725
],
[
151.11021483750366,
292.95250643754275
]
],
"stroke": "#ffffff",
"sw": 1.3,
"op": 0.8
},
{
"k": "line",
"pts": [
[
150,
280
],
[
120,
60
]
],
"stroke": "#4fae3a",
"sw": 26,
"dash": null,
"cap": "butt",
"join": "round"
},
{
"k": "line",
"pts": [
[
137.11920781542412,
281.75647166153306
],
[
162.88079218457588,
278.24352833846694
]
],
"stroke": "#ffffff",
"sw": 1.3,
"op": 0.8
},
{
"k": "line",
"pts": [
[
132.88079218457588,
58.24352833846692
],
[
107.11920781542412,
61.75647166153308
]
],
"stroke": "#ffffff",
"sw": 1.3,
"op": 0.8
},
{
"k": "text",
"x": 250,
"y": 44,
"t": "平台图块",
"size": 11,
"fill": "#7c3aed",
"anchor": "middle",
"weight": 600
},
{
"k": "line",
"pts": [
[
462,
168
],
[
496,
160
]
],
"stroke": "#9aa7b8",
"sw": 1.2
},
{
"k": "text",
"x": 500,
"y": 158,
"t": "冰面 / 石板",
"size": 11,
"fill": "#7a879c",
"anchor": "start"
},
{
"k": "text",
"x": 330,
"y": 312,
"t": "草地（曲线段）",
"size": 11,
"fill": "#3f8b26",
"anchor": "middle",
"weight": 600
},
{
"k": "text",
"x": 96,
"y": 190,
"t": "草墙",
"size": 11,
"fill": "#3f8b26",
"anchor": "end",
"weight": 600
}
]
}
},
"b069989233db": {
"type": "pic",
"title": "尖顶朝上（Pointed Top）的六边形排布",
"data": {
"w": 520,
"h": 300,
"items": [
{
"k": "hex",
"cx": 150,
"cy": 74,
"r": 48,
"flat": false,
"fill": "#efe6cd",
"stroke": "#c9a26a",
"sw": 1.2
},
{
"k": "hex",
"cx": 234,
"cy": 74,
"r": 48,
"flat": false,
"fill": "#e8c98a",
"stroke": "#c9a26a",
"sw": 1.2
},
{
"k": "hex",
"cx": 318,
"cy": 74,
"r": 48,
"flat": false,
"fill": "#f3ecd8",
"stroke": "#c9a26a",
"sw": 1.2
},
{
"k": "hex",
"cx": 192,
"cy": 146,
"r": 48,
"flat": false,
"fill": "#e6d3a6",
"stroke": "#c9a26a",
"sw": 1.2
},
{
"k": "hex",
"cx": 276,
"cy": 146,
"r": 48,
"flat": false,
"fill": "#efe6cd",
"stroke": "#c9a26a",
"sw": 1.2
},
{
"k": "hex",
"cx": 360,
"cy": 146,
"r": 48,
"flat": false,
"fill": "#f5efdd",
"stroke": "#c9a26a",
"sw": 1.2
},
{
"k": "hex",
"cx": 150,
"cy": 218,
"r": 48,
"flat": false,
"fill": "#e8c98a",
"stroke": "#c9a26a",
"sw": 1.2
},
{
"k": "hex",
"cx": 234,
"cy": 218,
"r": 48,
"flat": false,
"fill": "#efe6cd",
"stroke": "#c9a26a",
"sw": 1.2
},
{
"k": "hex",
"cx": 318,
"cy": 218,
"r": 48,
"flat": false,
"fill": "#e6d3a6",
"stroke": "#c9a26a",
"sw": 1.2
},
{
"k": "text",
"x": 260,
"y": 288,
"t": "上下是尖角、左右是竖边：同一行左右相邻，行与行之间错半格",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
}
]
}
},
"641a74fcaeec": {
"type": "pic",
"title": "平顶朝上（Flat Top）的六边形排布",
"data": {
"w": 520,
"h": 348,
"items": [
{
"k": "hex",
"cx": 155,
"cy": 50,
"r": 46,
"flat": true,
"fill": "#7fa8cc",
"stroke": "#aab4c2",
"sw": 1.2
},
{
"k": "hex",
"cx": 224,
"cy": 90,
"r": 46,
"flat": true,
"fill": "#c8d2de",
"stroke": "#aab4c2",
"sw": 1.2
},
{
"k": "hex",
"cx": 293,
"cy": 50,
"r": 46,
"flat": true,
"fill": "#e0cb8b",
"stroke": "#aab4c2",
"sw": 1.2
},
{
"k": "hex",
"cx": 362,
"cy": 90,
"r": 46,
"flat": true,
"fill": "#7fae6a",
"stroke": "#aab4c2",
"sw": 1.2
},
{
"k": "hex",
"cx": 155,
"cy": 130,
"r": 46,
"flat": true,
"fill": "#efd9b4",
"stroke": "#aab4c2",
"sw": 1.2
},
{
"k": "hex",
"cx": 224,
"cy": 170,
"r": 46,
"flat": true,
"fill": "#a9bdd4",
"stroke": "#aab4c2",
"sw": 1.2
},
{
"k": "hex",
"cx": 293,
"cy": 130,
"r": 46,
"flat": true,
"fill": "#d3b98c",
"stroke": "#aab4c2",
"sw": 1.2
},
{
"k": "hex",
"cx": 362,
"cy": 170,
"r": 46,
"flat": true,
"fill": "#8fb6a3",
"stroke": "#aab4c2",
"sw": 1.2
},
{
"k": "hex",
"cx": 155,
"cy": 210,
"r": 46,
"flat": true,
"fill": "#b7c9dd",
"stroke": "#aab4c2",
"sw": 1.2
},
{
"k": "hex",
"cx": 224,
"cy": 250,
"r": 46,
"flat": true,
"fill": "#e8d3ac",
"stroke": "#aab4c2",
"sw": 1.2
},
{
"k": "hex",
"cx": 293,
"cy": 210,
"r": 46,
"flat": true,
"fill": "#9db6cf",
"stroke": "#aab4c2",
"sw": 1.2
},
{
"k": "hex",
"cx": 362,
"cy": 250,
"r": 46,
"flat": true,
"fill": "#c9b78e",
"stroke": "#aab4c2",
"sw": 1.2
},
{
"k": "text",
"x": 260,
"y": 330,
"t": "上下是水平边、左右是尖角：同一列上下相邻，列与列之间错半列",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
}
]
}
},
"a2cb2349b8cf": {
"type": "mind",
"title": "Rig 操纵（骨骼）页签：Animation Type 的四种模型类型",
"data": {
"t": "Rig 操纵（骨骼）页签",
"c": [
{
"t": "骨骼基础信息",
"c": [
{
"t": "Name：不可修改，用于标识这个动画模型"
}
]
},
{
"t": "Animation Type 动画类型",
"c": [
{
"t": "None"
},
{
"t": "Humanoid 人形模型",
"c": [
{
"t": "Avatar Definition 选择 Avatar 定义的位置",
"c": [
{
"t": "No Avatar：没有化身系统信息"
},
{
"t": "Create From This Model：根据此模型创建"
},
{
"t": "Copy From Other Avatar：指定另一个模型上的 Avatar"
}
]
},
{
"t": "Configure：打开 Avatar 配置界面"
},
{
"t": "Skin Weights 蒙皮权重",
"c": [
{
"t": "Standard (4 Bones)：每个顶点最多 4 根骨骼"
},
{
"t": "Custom：自定义最大骨骼数"
},
{
"t": "Max Bones / Vertex：顶点骨骼数上限"
}
]
},
{
"t": "Optimize Game Objects：优化层级，省略骨骼节点"
},
{
"t": "Extra Transforms to Expose：要暴露的骨骼节点"
},
{
"t": "Generation 动画导入方法",
"c": [
{
"t": "Don't Import：不导入动画"
},
{
"t": "Import：导入（第二个入口）"
},
{
"t": "Copy From Other Avatar：从别的模型复制"
},
{
"t": "Store in Root：存进根节点的动画"
}
]
}
]
},
{
"t": "Generic 通用模型",
"c": [
{
"t": "Root Node：指定播放动画的根节点"
},
{
"t": "Avatar Definition 同 Humanoid"
}
]
},
{
"t": "Legacy 旧版动画类型：一般不用"
},
{
"t": "Mapping 骨骼映射 / Muscles & Settings 肌肉设置"
}
]
}
]
},
"opt": {
"h": 500,
"w": 1000
}
},
"9ca976eb7c4d": {
"type": "ocr",
"title": "菜单里的 Script / BulletInfo：类名决定菜单路径",
"data": {
"kind": "lines",
"w": 200,
"h": 34,
"lines": [
{
"t": "Script",
"i": 0
},
{
"t": "BulletInfo",
"i": 1
},
{
"t": "用 [CreateAssetMenu] 不取名时，按类名生成菜单：一级 Script、二级类名",
"i": 0
}
]
}
},
"25d43847e559": {
"type": "pic",
"title": "Slider 滑动条：滑块位置 = 当前值在 Min~Max 里的比例",
"data": {
"w": 620,
"h": 130,
"items": [
{
"k": "line",
"pts": [
[
40,
62
],
[
580,
62
]
],
"stroke": "#d3dae5",
"sw": 6
},
{
"k": "line",
"pts": [
[
40,
62
],
[
94.0,
62
]
],
"stroke": "#2b6cf6",
"sw": 6
},
{
"k": "circle",
"cx": 94.0,
"cy": 62,
"r": 13,
"fill": "#fff",
"stroke": "#8fa0ba",
"sw": 1.8
},
{
"k": "text",
"x": 40,
"y": 104,
"t": "Min 0",
"size": 11,
"fill": "#8b98ad"
},
{
"k": "text",
"x": 580,
"y": 104,
"t": "Max 1",
"size": 11,
"fill": "#8b98ad",
"anchor": "end"
},
{
"k": "text",
"x": 310,
"y": 22,
"t": "Handle 的锚点压在 Fill 上，位置由 value 决定",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
},
{
"k": "text",
"x": 94.0,
"y": 40,
"t": "value ≈ 0.1",
"size": 11.5,
"fill": "#2b6cf6",
"weight": 600,
"anchor": "middle"
}
]
}
},
"bee0ed6c7988": {
"type": "pic",
"title": "ScrollBar 滚动条：手柄长度表示可见比例，位置表示当前偏移",
"data": {
"w": 640,
"h": 168,
"items": [
{
"k": "rect",
"x": 40,
"y": 40,
"w": 540,
"h": 38,
"r": 6,
"fill": "#eef1f7",
"stroke": "#d3dae5"
},
{
"k": "rect",
"x": 46,
"y": 46,
"w": 97.2,
"h": 26,
"r": 5,
"fill": "#c9d3e2",
"stroke": "#a8b6c9"
},
{
"k": "arrow",
"x1": 96,
"y1": 112,
"x2": 96,
"y2": 80,
"stroke": "#8b98ad",
"sw": 1.4,
"dash": "4 3"
},
{
"k": "text",
"x": 40,
"y": 132,
"t": "size = 0.18 → 手柄长度只占 18%，即内容有 18% 露在外面",
"size": 11.5,
"fill": "#8b98ad"
},
{
"k": "arrow",
"x1": 460,
"y1": 112,
"x2": 460,
"y2": 84,
"stroke": "#8b98ad",
"sw": 1.4,
"dash": "4 3"
},
{
"k": "text",
"x": 390,
"y": 132,
"t": "value 变大 → 手柄往右移（当前偏移）",
"size": 11.5,
"fill": "#8b98ad"
}
]
}
},
"7f993419d319": {
"type": "pic",
"title": "ScrollView 滚动视图：Viewport 用 Mask 裁切，Content 比它高就能滚",
"data": {
"w": 620,
"h": 300,
"items": [
{
"k": "rect",
"x": 40,
"y": 40,
"w": 460,
"h": 220,
"r": 8,
"fill": "#f7f9fd",
"stroke": "#c9d3e2",
"sw": 1.8
},
{
"k": "text",
"x": 270,
"y": 30,
"t": "Viewport（Mask / RectMask2D 负责裁切）",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
},
{
"k": "rect",
"x": 52,
"y": 52,
"w": 436,
"h": 300,
"r": 6,
"fill": "none",
"stroke": "#2b6cf6",
"sw": 1.4,
"dash": "6 4"
},
{
"k": "text",
"x": 58,
"y": 76,
"t": "Content（比 Viewport 高 → 可以上下滚）",
"size": 11.5,
"fill": "#2b6cf6",
"weight": 600
},
{
"k": "rect",
"x": 512,
"y": 46,
"w": 26,
"h": 208,
"r": 10,
"fill": "#eef1f7",
"stroke": "#d3dae5"
},
{
"k": "rect",
"x": 516,
"y": 52,
"w": 18,
"h": 66,
"r": 8,
"fill": "#b9c5d6"
},
{
"k": "text",
"x": 546,
"y": 260,
"t": "Scrollbar（可选）",
"size": 11,
"fill": "#8b98ad"
},
{
"k": "text",
"x": 40,
"y": 284,
"t": "拖动时改的是 Content 的 anchoredPosition，超出 Viewport 的部分被裁掉",
"size": 11.5,
"fill": "#8b98ad"
}
]
}
},
"9de803be0f92": {
"type": "pic",
"title": "屏幕坐标转 UI 相对坐标：屏幕点 → UI 矩形内的局部点",
"data": {
"w": 640,
"h": 320,
"items": [
{
"k": "rect",
"x": 20,
"y": 30,
"w": 600,
"h": 260,
"r": 6,
"fill": "rgba(43,108,246,.05)",
"stroke": "#b9c5d6",
"sw": 1.6
},
{
"k": "text",
"x": 32,
"y": 22,
"t": "屏幕（Screen）",
"size": 12,
"fill": "#8b98ad",
"weight": 600
},
{
"k": "rect",
"x": 330,
"y": 110,
"w": 170,
"h": 110,
"r": 4,
"fill": "#ffffff",
"stroke": "#2b6cf6",
"sw": 1.8
},
{
"k": "text",
"x": 415,
"y": 102,
"t": "UI 矩形",
"size": 12,
"fill": "#2b6cf6",
"anchor": "middle",
"weight": 600
},
{
"k": "circle",
"cx": 330,
"cy": 220,
"r": 5,
"fill": "#e8663d"
},
{
"k": "text",
"x": 322,
"y": 238,
"t": "矩形原点 (0,0)",
"size": 11,
"fill": "#e8663d",
"anchor": "end"
},
{
"k": "circle",
"cx": 430,
"cy": 150,
"r": 7,
"fill": "#e14b3c"
},
{
"k": "text",
"x": 437,
"y": 140,
"t": "屏幕点击点",
"size": 11,
"fill": "#e14b3c",
"weight": 600
},
{
"k": "line",
"pts": [
[
330,
220
],
[
430,
220
]
],
"stroke": "#8b98ad",
"sw": 1.2,
"dash": "4 3"
},
{
"k": "line",
"pts": [
[
430,
220
],
[
430,
150
]
],
"stroke": "#8b98ad",
"sw": 1.2,
"dash": "4 3"
},
{
"k": "text",
"x": 380,
"y": 236,
"t": "x",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
},
{
"k": "text",
"x": 438,
"y": 190,
"t": "y",
"size": 11.5,
"fill": "#8b98ad"
},
{
"k": "text",
"x": 320,
"y": 306,
"t": "RectTransformUtility.ScreenPointToLocalPointInRectangle 得到的 (x, y) 以矩形左下角为原点",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
}
]
}
},
"d13ce13a512a": {
"type": "pic",
"title": "异形按钮：按钮外观是图片，但点击范围由 Raycast 判定",
"data": {
"w": 640,
"h": 320,
"items": [
{
"k": "rect",
"x": 60,
"y": 50,
"w": 300,
"h": 220,
"r": 6,
"fill": "#eef2f8",
"stroke": "#c9d3e2"
},
{
"k": "text",
"x": 210,
"y": 40,
"t": "Image（整张图都是点击区域）",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
},
{
"k": "poly",
"pts": [
[
110,
220
],
[
130,
120
],
[
190,
88
],
[
250,
120
],
[
272,
220
]
],
"fill": "#cfe0f7",
"stroke": "#2b6cf6",
"sw": 2
},
{
"k": "circle",
"cx": 300,
"cy": 88,
"r": 6,
"fill": "#8b98ad"
},
{
"k": "text",
"x": 300,
"y": 74,
"t": "点在透明处：仍算命中",
"size": 11,
"fill": "#8b98ad",
"anchor": "middle"
},
{
"k": "circle",
"cx": 190,
"cy": 160,
"r": 6,
"fill": "#e14b3c"
},
{
"k": "text",
"x": 190,
"y": 200,
"t": "点在图形上：命中",
"size": 11.5,
"fill": "#e14b3c",
"anchor": "middle",
"weight": 600
},
{
"k": "arrow",
"x1": 420,
"y1": 160,
"x2": 500,
"y2": 160,
"stroke": "#8b98ad",
"sw": 1.6
},
{
"k": "text",
"x": 560,
"y": 140,
"t": "想让透明处",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
},
{
"k": "text",
"x": 560,
"y": 158,
"t": "也响应点击时，",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
},
{
"k": "text",
"x": 560,
"y": 176,
"t": "调 alphaHitTest",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle",
"mono": true
},
{
"k": "text",
"x": 560,
"y": 194,
"t": "MinimumThreshold",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle",
"mono": true
},
{
"k": "text",
"x": 560,
"y": 212,
"t": "（0~1 的透明度阈值）",
"size": 11,
"fill": "#8b98ad",
"anchor": "middle"
},
{
"k": "text",
"x": 320,
"y": 304,
"t": "默认按矩形判定命中；改 alpha 阈值后，透明像素不再响应点击",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
}
]
}
},
"58b581235446": {
"type": "pic",
"title": "两个圆：圆心距 d 与半径 R、r 决定是否相交",
"data": {
"w": 640,
"h": 330,
"items": [
{
"k": "circle",
"cx": 228,
"cy": 178,
"r": 104,
"fill": "none",
"stroke": "#243447",
"sw": 2.2
},
{
"k": "circle",
"cx": 462,
"cy": 116,
"r": 64,
"fill": "none",
"stroke": "#243447",
"sw": 2.2
},
{
"k": "circle",
"cx": 228,
"cy": 178,
"r": 4.5,
"fill": "#243447"
},
{
"k": "circle",
"cx": 462,
"cy": 116,
"r": 4.5,
"fill": "#243447"
},
{
"k": "line",
"pts": [
[
228,
178
],
[
154,
110
]
],
"stroke": "#e14b3c",
"sw": 1.8
},
{
"k": "text",
"x": 176,
"y": 138,
"t": "R",
"size": 15,
"fill": "#e14b3c",
"anchor": "middle",
"weight": 600
},
{
"k": "line",
"pts": [
[
462,
116
],
[
506,
64
]
],
"stroke": "#2b6cf6",
"sw": 1.8
},
{
"k": "text",
"x": 492,
"y": 100,
"t": "r",
"size": 14,
"fill": "#2b6cf6",
"anchor": "middle",
"weight": 600
},
{
"k": "line",
"pts": [
[
228,
178
],
[
462,
116
]
],
"stroke": "#17a673",
"sw": 2.4,
"dash": "7 4"
},
{
"k": "text",
"x": 338,
"y": 130,
"t": "d",
"size": 15,
"fill": "#17a673",
"anchor": "middle",
"weight": 600
},
{
"k": "text",
"x": 242,
"y": 200,
"t": "A",
"size": 15,
"fill": "#243447",
"weight": 700
},
{
"k": "text",
"x": 474,
"y": 140,
"t": "B",
"size": 15,
"fill": "#243447",
"weight": 700
},
{
"k": "text",
"x": 320,
"y": 316,
"t": "d = |AB| = √((x_B − x_A)² + (y_B − y_A)²)；d 与 R + r、|R − r| 比较就能判断相离 / 相切 / 相交",
"size": 11.5,
"fill": "#8b98ad",
"anchor": "middle"
}
]
}
},
"2fccfacf606e": {
"type": "ocr",
"title": "三个选项（正确选项 1 / 2 / 3）的列表",
"data": {
"kind": "lines",
"w": 255,
"h": 183,
"lines": [
{
"t": "正确选项1",
"i": 1
},
{
"t": "正确选项2",
"i": 1
},
{
"t": "正确选项3",
"i": 1
},
{
"t": "每行左侧是选中标记，选项之间互斥（单选）",
"i": 0
}
]
}
},
"0077f5b57da0": {
"type": "ocr",
"title": "Materlal",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Materlal",
"i": 0
},
{
"t": "None （Materlal）",
"i": 2
},
{
"t": "Raycast Target",
"i": 0
},
{
"t": "• Raycast Padding",
"i": 0
},
{
"t": "Maskable",
"i": 0
},
{
"t": "TH V Layout Element",
"i": 0
},
{
"t": "Ianore Lavout",
"i": 0
},
{
"t": "Min Width",
"i": 0
},
{
"t": "100",
"i": 3
},
{
"t": "Min Height",
"i": 0
},
{
"t": "100",
"i": 3
},
{
"t": "Preferred Width",
"i": 0
},
{
"t": "Preferred Height",
"i": 0
},
{
"t": "Flexible Width",
"i": 0
},
{
"t": "Flexible Height",
"i": 0
},
{
"t": "Layout Priority",
"i": 0
},
{
"t": "Default Ul Material （Material）",
"i": 1
},
{
"t": "Shader UI/Default",
"i": 1
},
{
"t": "Edit...",
"i": 4
},
{
"t": "Sprite Texture",
"i": 0
},
{
"t": "Tiling",
"i": 1
},
{
"t": "X",
"i": 2
},
{
"t": "Offset",
"i": 1
},
{
"t": "X",
"i": 2
},
{
"t": "Tint",
"i": 0
}
],
"cols": null,
"w": 1809,
"h": 674
}
},
"00ada4934655": {
"type": "ocr",
"title": "7GSampleScene* / Font Features",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "7GSampleScene*",
"i": 0
},
{
"t": "Y Main Camera",
"i": 3
},
{
"t": "Y Directional Light",
"i": 3
},
{
"t": "Y Global Volume",
"i": 3
},
{
"t": "VGGrid",
"i": 2
},
{
"t": "G Tilemap",
"i": 4
},
{
"t": "G Cube",
"i": 3
},
{
"t": "V G Canvas",
"i": 2
},
{
"t": "• G Text （TMP）",
"i": 3
},
{
"t": "G EventSystem",
"i": 3
},
{
"t": "G GameObject",
"i": 3
}
],
"title": "7GSampleScene*"
},
{
"kind": "lines",
"lines": [
{
"t": "Font Features",
"i": 0
},
{
"t": "kern",
"i": 4
},
{
"t": "Extra Padding",
"i": 0
},
{
"t": "TMP_Text Event Handler （Script）",
"i": 1
},
{
"t": "Script",
"i": 0
},
{
"t": "由 TMP_TextEventHandler",
"i": 4
},
{
"t": "On Character Selection （Char, Int32）",
"i": 0
},
{
"t": "No Function",
"i": 4
},
{
"t": "Runtime Only",
"i": 0
},
{
"t": "（U TEAt（TMP）",
"i": 0
},
{
"t": "On Sprite Selection （Char, Int32）",
"i": 0
}
],
"title": "Font Features"
}
],
"w": 1816,
"h": 353
}
},
"0163dd41f6eb": {
"type": "ocr",
"title": "Extrude Edges",
"data": {
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"1 Import Settings",
"② 女"
],
[
"Open",
""
],
[
"Texture Type",
"Sprite （2D and Ul）"
],
[
"Texture Shape",
"2D"
],
[
"Sprite Mode",
"Single"
],
[
"Pixels Per Unit",
"100"
],
[
"Mesh Type",
"Full Rect"
]
]
},
{
"h": "Extrude Edges",
"rows": [
[
"Pivot",
"Center"
]
]
},
{
"h": "Generate Physics Shape <",
"rows": [
[
"Sprite Editor",
""
]
]
}
],
"lines": null,
"cols": null,
"w": 659,
"h": 408
}
},
"01b7e81b815a": {
"type": "ocr",
"title": "练习题",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "练习题",
"i": 0
},
{
"t": "当一个物体B在物体A前方45度角范围内，并且离A只有5米距离",
"i": 0
},
{
"t": "时，在控制台打印“发现入侵者\"",
"i": 0
},
{
"t": "45度",
"i": 4
},
{
"t": "5米",
"i": 4
}
],
"cols": null,
"w": 1400,
"h": 665
}
},
"01cf0a7e8e7d": {
"type": "ocr",
"title": "Box Collider 2D",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Box Collider 2D",
"i": 4
},
{
"t": "Edit Collider",
"i": 0
},
{
"t": "Material",
"i": 0
},
{
"t": "Is Trigger",
"i": 0
},
{
"t": "Used By Effector",
"i": 0
},
{
"t": "Used By Composite",
"i": 0
},
{
"t": "Auto Tiling",
"i": 0
},
{
"t": "Offset",
"i": 0
},
{
"t": "Size",
"i": 0
},
{
"t": "Edge Radius",
"i": 0
}
],
"cols": null,
"w": 710,
"h": 357
}
},
"01fc13f22884": {
"type": "ocr",
"title": "= Hierarchy",
"data": {
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"= Hierarchy",
"M Proiect"
],
[
"e SampleScene：",
"GAsSeS"
],
[
"t Main Camera",
"• 面 Prefabs"
],
[
"r Directional Light",
"• Scenes"
],
[
"t Gameoblect",
"VC Scripts"
],
[
"• Test",
""
],
[
"口Test2",
""
],
[
"E Test3",
""
],
[
"Packages",
""
]
]
}
],
"lines": null,
"cols": null,
"w": 321,
"h": 139
}
},
"030129f9d6cf": {
"type": "ocr",
"title": "Use Collider Mask",
"data": {
"kind": "rows",
"groups": [
{
"h": "Use Collider Mask",
"rows": [
[
"Collider Mask",
"Everything"
]
]
},
{
"h": "Force Angle",
"rows": [
[
"Force Magnitude",
"10"
],
[
"Force Variation",
"5"
],
[
"Force Target",
"Rigidbody"
]
]
},
{
"h": "Damping",
"rows": [
[
"Drag",
"0"
],
[
"Angular Drag",
"0"
]
]
}
],
"lines": null,
"cols": null,
"w": 708,
"h": 425
}
},
"039314223d91": {
"type": "ocr",
"title": "Any State",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Any State",
"i": 0
},
{
"t": "Create State",
"i": 2
},
{
"t": "Empty",
"i": 3
},
{
"t": "Create Sub-State Machine",
"i": 2
},
{
"t": "From Selected Clio",
"i": 3
},
{
"t": "Paste",
"i": 2
},
{
"t": "From New Blend Tree",
"i": 3
},
{
"t": "Entry",
"i": 0
},
{
"t": "Copy current StateMachine",
"i": 2
},
{
"t": "Exit",
"i": 4
}
],
"cols": null,
"w": 1433,
"h": 464
}
},
"048b1ea7307f": {
"type": "ocr",
"title": "A（x,Y）",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "A（x,Y）",
"i": 0
},
{
"t": "w",
"i": 2
},
{
"t": "B（x1,Y1）",
"i": 4
},
{
"t": "h",
"i": 3
},
{
"t": "W1",
"i": 4
},
{
"t": "h1",
"i": 4
}
],
"cols": null,
"w": 408,
"h": 352
}
},
"05a1fe0c2f6e": {
"type": "ocr",
"title": "56 Addressables Profiles",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "X",
"i": 4
},
{
"t": "56 Addressables Profiles",
"i": 0
},
{
"t": "Addressables Profiles",
"i": 0
},
{
"t": "Creater",
"i": 0
},
{
"t": "v Default",
"i": 0
},
{
"t": "VLocal",
"i": 2
},
{
"t": "Built-In",
"i": 3
},
{
"t": "Local.BuildPath",
"i": 2
},
{
"t": "［UnityEngine.AddressableAssets.Addressables. BuildPath］/［Build",
"i": 3
},
{
"t": "Local.LoadPath",
"i": 2
},
{
"t": "｛UnityEngine.AddressableAssets.Addressables.RuntimePath｝/［BL",
"i": 3
},
{
"t": "VRemote",
"i": 2
},
{
"t": "Custom",
"i": 3
},
{
"t": "Remote.BuildPath",
"i": 2
},
{
"t": "ServerData/lBuildTarget］",
"i": 3
},
{
"t": "Remote.LoadPath",
"i": 2
},
{
"t": "<undefined>",
"i": 3
},
{
"t": "BuildTarget",
"i": 2
},
{
"t": "IUnityEditor. EditorUserBuildSettings.activeBuildTarget］",
"i": 3
}
],
"cols": null,
"w": 1242,
"h": 425
}
},
"065f32c28742": {
"type": "ocr",
"title": "Text Input",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Text Input",
"i": 0
},
{
"t": "Enable RTL Editor",
"i": 4
},
{
"t": "2324<sprite name=\"EmojiOne_3\">23425",
"i": 0
},
{
"t": "2314<sprite index=\"2\">2342",
"i": 0
}
],
"cols": null,
"w": 541,
"h": 121
}
},
"0800144c5318": {
"type": "ocr",
"title": "UI / Image",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "UI",
"i": 0
},
{
"t": "Al",
"i": 0
},
{
"t": "Ul Toolkit",
"i": 0
},
{
"t": "Rendering",
"i": 0
},
{
"t": "Volume",
"i": 0
},
{
"t": "Camera",
"i": 0
},
{
"t": "Visual Scripting Scene Variables",
"i": 0
}
],
"title": "UI"
},
{
"kind": "lines",
"lines": [
{
"t": "Image",
"i": 0
},
{
"t": "Text -TextMeshPro",
"i": 0
},
{
"t": "Raw Image",
"i": 0
},
{
"t": "Panel",
"i": 0
},
{
"t": "Toggle",
"i": 0
},
{
"t": "Slider",
"i": 0
},
{
"t": "Scrollbar",
"i": 0
},
{
"t": "Scroll View",
"i": 0
},
{
"t": "Button - TextMeshPro",
"i": 0
},
{
"t": "Dropdown - TextMeshPro",
"i": 0
},
{
"t": "Input Field- TextMeshPro",
"i": 0
}
],
"title": "Image"
}
],
"w": 865,
"h": 400
}
},
"08df04538038": {
"type": "ocr",
"title": "Hierarchy / i Insnector",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "Hierarchy",
"i": 0
},
{
"t": "L Project",
"i": 4
},
{
"t": "Q、 All",
"i": 4
},
{
"t": "example*",
"i": 2
},
{
"t": "Main Camera",
"i": 2
},
{
"t": "S Directional Light",
"i": 2
},
{
"t": "1 GameObject",
"i": 2
},
{
"t": "1 Cube",
"i": 2
},
{
"t": "v cube （1）",
"i": 1
},
{
"t": "y cube （2）",
"i": 3
},
{
"t": "Cube （3）",
"i": 4
},
{
"t": "Cube （4）",
"i": 4
}
],
"title": "Hierarchy"
},
{
"kind": "lines",
"lines": [
{
"t": "i Insnector",
"i": 0
},
{
"t": "Cube（1）",
"i": 4
},
{
"t": "Tag",
"i": 2
},
{
"t": "Untagged",
"i": 4
},
{
"t": "Transform",
"i": 4
},
{
"t": "Position",
"i": 1
},
{
"t": "Rotation",
"i": 1
},
{
"t": "Scale",
"i": 1
},
{
"t": "Cube （Mesh Filter）",
"i": 4
},
{
"t": "Mesh",
"i": 1
},
{
"t": "Mesh Renderer",
"i": 4
},
{
"t": "Materials",
"i": 1
}
],
"title": "i Insnector"
}
],
"w": 906,
"h": 417
}
},
"0987e6c778a1": {
"type": "ocr",
"title": "基础冒性",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "基础冒性",
"i": 0
},
{
"t": "Age",
"i": 0
},
{
"t": "Sex",
"i": 0
},
{
"t": "故斗厲性",
"i": 0
},
{
"t": "Atk",
"i": 0
},
{
"t": "Def",
"i": 0
}
],
"cols": null,
"w": 392,
"h": 134
}
},
"0cece2bbc520": {
"type": "ocr",
"title": "Effector",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "#＜ Limb Solver 2D（Script）",
"i": 0
},
{
"t": "Effector",
"i": 0
},
{
"t": "None （lransiomm）",
"i": 2
},
{
"t": "Target",
"i": 0
},
{
"t": "None （Transform）",
"i": 2
},
{
"t": "Flip",
"i": 0
},
{
"t": "Constrain Rotation",
"i": 0
},
{
"t": "Solve from Default Pose",
"i": 0
},
{
"t": "•日",
"i": 4
},
{
"t": "Weight",
"i": 0
},
{
"t": "Create Target",
"i": 1
},
{
"t": "Restore Default Pose",
"i": 3
},
{
"t": "Effector：默认的IK点位置",
"i": 0
},
{
"t": "Target：会根据IK点位置生成真正的IK点对象",
"i": 0
},
{
"t": "Flip：反向",
"i": 0
},
{
"t": "Constrain Rotation：约束旋转程度",
"i": 0
},
{
"t": "Solve from Default Pose：从默认姿势进行求解计算",
"i": 0
},
{
"t": "Weiaht： 权重",
"i": 0
}
],
"cols": null,
"w": 407,
"h": 274
}
},
"107a5135eebc": {
"type": "ocr",
"title": "Scrat / Folder",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "Scrat",
"i": 0
},
{
"t": "Create",
"i": 1
},
{
"t": "Show in Explorer",
"i": 1
},
{
"t": "Open",
"i": 1
},
{
"t": "Delete",
"i": 1
},
{
"t": "Cul",
"i": 0
},
{
"t": "Rename",
"i": 1
},
{
"t": "Mrl",
"i": 0
},
{
"t": "My",
"i": 0
},
{
"t": "Copy Path",
"i": 1
},
{
"t": "Custom Build",
"i": 4
},
{
"t": "Ne",
"i": 0
},
{
"t": "Sci",
"i": 0
},
{
"t": "Open Scene Additi",
"i": 1
},
{
"t": "Content Builders",
"i": 4
},
{
"t": "ren",
"i": 0
},
{
"t": "Initialization",
"i": 4
},
{
"t": "View in Package M",
"i": 1
},
{
"t": "eS",
"i": 0
},
{
"t": "Group Templates",
"i": 4
},
{
"t": "19S",
"i": 0
},
{
"t": "1es",
"i": 0
},
{
"t": "Import New Asset..",
"i": 1
}
],
"title": "Scrat"
},
{
"kind": "lines",
"lines": [
{
"t": "Folder",
"i": 0
},
{
"t": "Material",
"i": 0
},
{
"t": "MonoBehaviour Script",
"i": 0
},
{
"t": "Prefab Variant",
"i": 0
},
{
"t": "2D",
"i": 0
},
{
"t": "Addressables",
"i": 0
},
{
"t": "Animation",
"i": 0
},
{
"t": "Audio",
"i": 0
},
{
"t": "Rendering",
"i": 0
},
{
"t": "Scene",
"i": 0
}
],
"title": "Folder"
}
],
"w": 880,
"h": 371
}
},
"10a99899c41e": {
"type": "ocr",
"title": "Script.",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "V TMP_Text Event Handler （Script）",
"i": 0
},
{
"t": "Script.",
"i": 0
},
{
"t": "# TMP_TextEventHandler",
"i": 4
},
{
"t": "On Character Selection （Char, Int32）",
"i": 0
},
{
"t": "List is empty",
"i": 0
},
{
"t": "On Sprite Selection （Char, Int32）",
"i": 0
},
{
"t": "List is empty",
"i": 0
},
{
"t": "On Word Selection （String, Int32, Int32）",
"i": 0
},
{
"t": "List is empty",
"i": 0
},
{
"t": "On Line Selection （String, Int32, Int32）",
"i": 0
},
{
"t": "List is empty",
"i": 0
},
{
"t": "On Link Selection （String, String, Int32）",
"i": 0
},
{
"t": "List is empty",
"i": 0
}
],
"cols": null,
"w": 1085,
"h": 634
}
},
"10be74dc394f": {
"type": "ocr",
"title": "Loop Time",
"data": {
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"HumanoidMidAirRight",
""
],
[
"Length 0.067",
"30 FPS"
],
[
"11:201 |2:00， 12:10， 12:20， 13:00， 13:10， 13:20， 1:00， 14:10，",
"14:20，"
],
[
"Start 118 End",
"120."
]
]
},
{
"h": "Loop Time",
"rows": [
[
"Loop Pose",
"loop match"
]
]
},
{
"h": "Root Transform Rotation",
"rows": [
[
"Bake Into Pose",
"loop match"
],
[
"Based Upon （at Start）",
"Body Onientation"
]
]
},
{
"h": "Root Transform Position （Y）",
"rows": [
[
"Bake Into Pose",
"loop match"
],
[
"Based Upon （at Start）",
"Feet"
],
[
"Offset",
"0"
]
]
},
{
"h": "Root Transform Position （XZ）",
"rows": [
[
"Bake Into Pose",
"loop match"
],
[
"Based Upon",
"Center of Mass"
]
]
},
{
"h": "Additive Reference Pose",
"rows": [
[
"Pose Frame",
"0"
]
]
},
{
"h": "Average Velocity： （0.101, 0.000, 3.039）",
"rows": [
[
"Average Angular Y Speed: 10.1 deg/s",
""
]
]
}
],
"lines": null,
"cols": null,
"w": 569,
"h": 635
}
},
"1146ce48d7f2": {
"type": "ocr",
"title": "Hierarchy / oIZe",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "Hierarchy",
"i": 0
},
{
"t": "Q, AIl",
"i": 3
},
{
"t": "Gexample*",
"i": 0
},
{
"t": "G Main Camera",
"i": 3
},
{
"t": "Y Directional Light",
"i": 4
},
{
"t": "亿 GameObject",
"i": 4
},
{
"t": "S Cube",
"i": 4
},
{
"t": "7M Cube （1）",
"i": 2
},
{
"t": "M Cube （2）",
"i": 4
},
{
"t": "G Cube （3）",
"i": 4
},
{
"t": "1 Cube（4）",
"i": 4
}
],
"title": "Hierarchy"
},
{
"kind": "lines",
"lines": [
{
"t": "oIZe",
"i": 4
},
{
"t": "Layer Overrides",
"i": 3
},
{
"t": "P：",
"i": 0
},
{
"t": "V Test （Script）",
"i": 4
},
{
"t": "Player （Script）",
"i": 4
},
{
"t": "cnpu",
"i": 4
},
{
"t": "M Character Controller",
"i": 4
},
{
"t": "M Move Speed",
"i": 4
},
{
"t": "Default-Material （Material）",
"i": 4
},
{
"t": "Shader Standard",
"i": 4
}
],
"title": "oIZe"
}
],
"w": 927,
"h": 352
}
},
"1191ccf9ecf9": {
"type": "ocr",
"title": "视口坐标系",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "视口坐标系",
"i": 0
},
{
"t": "∞0 Game",
"i": 4
},
{
"t": "原点：屏幕左下角",
"i": 0
},
{
"t": "Display 1",
"i": 4
},
{
"t": "•16:9",
"i": 4
},
{
"t": "Y",
"i": 4
},
{
"t": "轴向：",
"i": 0
},
{
"t": "向右为x轴正方向",
"i": 0
},
{
"t": "向上为y轴正方向",
"i": 0
},
{
"t": "特点：",
"i": 0
},
{
"t": "左下角为（0,0）",
"i": 0
},
{
"t": "右上角为（1,1）",
"i": 0
},
{
"t": "0.0",
"i": 4
},
{
"t": "和屏幕坐标类似，将坐标单位化",
"i": 0
}
],
"cols": null,
"w": 1400,
"h": 628
}
},
"12a235697fe2": {
"type": "ocr",
"title": "Addressables Groups / Play Mode Scriptv ",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "Addressables Groups",
"i": 0
},
{
"t": "New ~ Profile: Default",
"i": 0
},
{
"t": "Tools、",
"i": 4
},
{
"t": "Group Name \\ Addressa",
"i": 1
},
{
"t": "Inspect System Settings",
"i": 4
},
{
"t": "V Default Local Group （I",
"i": 1
},
{
"t": "Check for Content Update Restrictions",
"i": 4
},
{
"t": "Sphere Variant",
"i": 2
},
{
"t": "Window",
"i": 4
},
{
"t": "Packed Assets",
"i": 1
},
{
"t": "Packed Assets1",
"i": 1
},
{
"t": "Groups View",
"i": 4
},
{
"t": "＞ Built In Data",
"i": 1
}
],
"title": "Addressables Groups"
},
{
"kind": "lines",
"lines": [
{
"t": "Play Mode Scriptv Buildv",
"i": 0
},
{
"t": "c",
"i": 4
},
{
"t": "Path",
"i": 0
},
{
"t": "/Sphere Va",
"i": 3
},
{
"t": "Profiles",
"i": 0
},
{
"t": "Labels",
"i": 0
},
{
"t": "Analyze",
"i": 0
},
{
"t": "Hosting Services",
"i": 0
},
{
"t": "Event Viewer",
"i": 0
},
{
"t": "Addressables Report",
"i": 0
}
],
"title": "Play Mode Scriptv Buildv"
}
],
"w": 1232,
"h": 484
}
},
"15ac84f51b00": {
"type": "ocr",
"title": "Text Wrapping Mode",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Text Wrapping Mode",
"i": 0
},
{
"t": "Normal",
"i": 4
},
{
"t": "Overflow",
"i": 0
},
{
"t": "Overflow",
"i": 4
},
{
"t": "Horizontal Mapping",
"i": 0
},
{
"t": "Character",
"i": 4
},
{
"t": "Vertical Mapping",
"i": 0
},
{
"t": "Character",
"i": 4
}
],
"cols": null,
"w": 704,
"h": 171
}
},
"171192e07495": {
"type": "ocr",
"title": "Go Sprite Editor*",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Go Sprite Editor*",
"i": 0
},
{
"t": "区Sprite Editor*",
"i": 0
},
{
"t": "Sprite Editor",
"i": 0
},
{
"t": "Slicew",
"i": 0
},
{
"t": "Trim",
"i": 1
},
{
"t": "Revert",
"i": 4
},
{
"t": "Apply",
"i": 4
},
{
"t": "：DSD？",
"i": 1
},
{
"t": "：D",
"i": 4
}
],
"cols": null,
"w": 1400,
"h": 855
}
},
"1761971f791a": {
"type": "ocr",
"title": "Material Creation Mode",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Material Creation Mode",
"i": 2
},
{
"t": "Standard",
"i": 3
},
{
"t": "None",
"i": 2
},
{
"t": "Standard",
"i": 2
},
{
"t": "None：不使用此模型中嵌入的任何材质，改用Unity的默认漫反射材质",
"i": 4
},
{
"t": "Import via MaterialDescription （Experimental）",
"i": 2
},
{
"t": "Standard：导入时，Unity使用默认规则来生成材质",
"i": 4
},
{
"t": "Material Creation Mode：",
"i": 2
},
{
"t": "定义希望Unity如何为模型生成或导入材质",
"i": 2
},
{
"t": "6 Inspector",
"i": 0
},
{
"t": "Import via MaterialDescription （Experimental）：导入时，Unity使",
"i": 4
},
{
"t": "Ethan Import Settings",
"i": 0
},
{
"t": "③半章",
"i": 2
},
{
"t": "用FBX文件中嵌入的材质描述来生成材质。",
"i": 4
},
{
"t": "Open",
"i": 2
},
{
"t": "与Standard相比，该方法结果更准确，并且支持更广泛的材质类型。",
"i": 4
},
{
"t": "Model",
"i": 0
},
{
"t": "Rig",
"i": 1
},
{
"t": "Animation",
"i": 1
},
{
"t": "Materials",
"i": 1
},
{
"t": "SRGB Albedo Colors：是否在伽马空间中使用反射率颜色",
"i": 2
},
{
"t": "对于使用线性颜色控件的项目，禁用此选项",
"i": 2
},
{
"t": "Material Creation Mode Standard",
"i": 0
},
{
"t": "如果上面的选项选择的是",
"i": 2
},
{
"t": "SRGB Albedo Colors",
"i": 0
},
{
"t": "Import via MaterialDescription（Experimental）该属性不可用",
"i": 2
},
{
"t": "Location",
"i": 0
},
{
"t": "Use Embedded Materials",
"i": 1
},
{
"t": "Textures",
"i": 0
},
{
"t": "Extract Textures...",
"i": 1
},
{
"t": "Use External Materials （Legacy）",
"i": 3
},
{
"t": "Location",
"i": 2
},
{
"t": "Materials",
"i": 0
},
{
"t": "Extract Materials..",
"i": 1
},
{
"t": "Naming",
"i": 2
},
{
"t": "Use External Materials （Legacy）",
"i": 3
},
{
"t": "Searcn",
"i": 2
},
{
"t": "Use Embedded Materials",
"i": 3
},
{
"t": "Use Embedded Materials：将导入的材质保持在导入的资源中",
"i": 4
},
{
"t": "Material assignments can be remapped babow.",
"i": 0
},
{
"t": "Location：定义如何访问材质和纹埋",
"i": 2
},
{
"t": "Use External Materials （Legacy）：将导入的材质提取为外部资源。",
"i": 4
},
{
"t": "Remapped Materials",
"i": 0
},
{
"t": "旧版材质处理方式，适用于2017.1或更早的Unity版本创建的项目",
"i": 4
},
{
"t": "V On Demand Remap",
"i": 0
},
{
"t": "From Model's Material",
"i": 1
},
{
"t": "Naming",
"i": 0
},
{
"t": "Search",
"i": 0
},
{
"t": "Protect-Wide",
"i": 1
},
{
"t": "Textures",
"i": 3
},
{
"t": "Extract Textures..",
"i": 4
},
{
"t": "For each imported material, Unity first looks for an existing",
"i": 0
},
{
"t": "Matenials",
"i": 3
},
{
"t": "Extract Matenals..",
"i": 4
},
{
"t": "materlal named ［MateriaiName］.",
"i": 0
},
{
"t": "Material asskgnments can be remapped below.",
"i": 3
},
{
"t": "Search and Remap",
"i": 1
},
{
"t": "Extract Textures/Materials： 当选择Use Embedded Materials后会出",
"i": 2
},
{
"t": "EthanWhite",
"i": 0
},
{
"t": "• EthanWhite",
"i": 1
},
{
"t": "现的内容。这两个按钮可以提取导入的资源中嵌入的所有材质和纹理。",
"i": 2
},
{
"t": "如果没有需要提取的子资源，这两个接纽会显示为灰色",
"i": 2
},
{
"t": "Revert",
"i": 2
},
{
"t": "Apply",
"i": 2
},
{
"t": "Naming",
"i": 2
},
{
"t": "From Model's Material",
"i": 3
},
{
"t": "Search",
"i": 2
},
{
"t": "By Base Texture Name",
"i": 3
},
{
"t": "By Base Texture Name： 使用导入材质的漫反射纹埋名称来命名材",
"i": 4
},
{
"t": "For each",
"i": 2
},
{
"t": "From Model's Material",
"i": 3
},
{
"t": "质。如果未将漫反射纹理分配给材质，Unity将使用导入材质的名称",
"i": 4
},
{
"t": "materialr",
"i": 2
},
{
"t": "Model Name + Model's Material",
"i": 3
},
{
"t": "From Model's Material：使用导入材质的名称来命名材质",
"i": 4
},
{
"t": "Naming：定义材质的命名规则",
"i": 3
},
{
"t": "Model Name + Model's Material： 使用模型文件的名称与导入材质",
"i": 4
},
{
"t": "的名称相结合来命名材质",
"i": 4
},
{
"t": "Search",
"i": 3
},
{
"t": "Project-Wide",
"i": 3
}
],
"cols": null,
"w": 1232,
"h": 882
}
},
"17bb966b6afd": {
"type": "ocr",
"title": "Q• AI",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Q• AI",
"i": 0
},
{
"t": "Lessan11*",
"i": 4
},
{
"t": "Y Main Camera",
"i": 3
},
{
"t": "M Square",
"i": 3
},
{
"t": "G Tniangle",
"i": 3
},
{
"t": "Y Diamond",
"i": 3
},
{
"t": "⑦ Hexagon",
"i": 3
},
{
"t": "M Circle",
"i": 3
},
{
"t": "⑦ Polygon",
"i": 3
}
],
"cols": null,
"w": 368,
"h": 299
}
},
"1b8ea1afd87f": {
"type": "ocr",
"title": "Addressables Profiles",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Addressables Profiles",
"i": 4
},
{
"t": "Addressables Profiles",
"i": 0
},
{
"t": "Create v",
"i": 0
},
{
"t": "Defaul",
"i": 1
},
{
"t": "V Remote",
"i": 2
},
{
"t": "Editor Hosted",
"i": 4
},
{
"t": "Remote.BuildP ath",
"i": 2
},
{
"t": "ServerData/［BuildT arget］",
"i": 4
},
{
"t": "Remote.LoadPath",
"i": 2
},
{
"t": "http://［PrivatelpAddress｝：［HostingServicePort」",
"i": 4
},
{
"t": "VLocal",
"i": 2
},
{
"t": "Built-In",
"i": 4
},
{
"t": "Local.BuildPath",
"i": 2
},
{
"t": "［UnityEngine.AddressableAssets.Addressables.BuildPath］/［BuildTarget］",
"i": 4
},
{
"t": "Local.LoadPath",
"i": 2
},
{
"t": "｛Unity Engine.AddressableAssets.Addressables.RuntimePath//［BuildTarget」",
"i": 4
},
{
"t": "BuildTarget",
"i": 2
},
{
"t": "［UnityEditor.EditorUserBuildSettings.activeBuildT arget］",
"i": 4
}
],
"cols": null,
"w": 1428,
"h": 486
}
},
"1c51468fc619": {
"type": "ocr",
"title": "Profile",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Sprite Shape Controller （Script）",
"i": 1
},
{
"t": "Profile",
"i": 0
},
{
"t": "Open （SpriteShape）",
"i": 2
},
{
"t": "Edit Spline",
"i": 3
},
{
"t": "Tangent Mode",
"i": 0
},
{
"t": "7",
"i": 3
},
{
"t": "X 2.977398",
"i": 2
},
{
"t": "Position",
"i": 0
},
{
"t": "Y",
"i": 3
},
{
"t": "-1.305109",
"i": 4
},
{
"t": "Height",
"i": 0
},
{
"t": "1",
"i": 4
},
{
"t": "Automatic",
"i": 2
},
{
"t": "Corner",
"i": 0
},
{
"t": "Sprite Variant",
"i": 0
},
{
"t": "O",
"i": 2
},
{
"t": "D-",
"i": 2
},
{
"t": "Snapping",
"i": 0
},
{
"t": "Spline",
"i": 0
},
{
"t": "Detail",
"i": 0
},
{
"t": "High Quality",
"i": 2
},
{
"t": "Is Open Ended",
"i": 0
},
{
"t": "Adaptive UV",
"i": 0
},
{
"t": "Enable Tangents",
"i": 0
},
{
"t": "Cache Geometry",
"i": 0
},
{
"t": "Corner Threshold",
"i": 0
},
{
"t": "30",
"i": 4
},
{
"t": "Fill",
"i": 0
},
{
"t": "Stretch UV",
"i": 0
},
{
"t": "Pixel Per Unit",
"i": 0
},
{
"t": "100",
"i": 2
}
],
"cols": null,
"w": 1313,
"h": 1400
}
},
"1f1f92b963c7": {
"type": "ocr",
"title": "0 Inspector",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "0 Inspector",
"i": 2
},
{
"t": "ect",
"i": 0
},
{
"t": "Q",
"i": 0
},
{
"t": "◎27",
"i": 1
},
{
"t": "Mr Tang Data （New Mono Behaviour Script 1）",
"i": 2
},
{
"t": "Assets",
"i": 0
},
{
"t": "Open",
"i": 4
},
{
"t": "Resources",
"i": 0
},
{
"t": "已添加",
"i": 2
},
{
"t": "签入",
"i": 4
},
{
"t": "撤销",
"i": 4
},
{
"t": "Font&Materials",
"i": 0
},
{
"t": "Cube",
"i": 0
},
{
"t": "MrTangData",
"i": 0
},
{
"t": "Script",
"i": 2
},
{
"t": "# ScriptableObject",
"i": 3
},
{
"t": "New Material",
"i": 0
},
{
"t": "0",
"i": 3
},
{
"t": "ScriptableObject",
"i": 0
},
{
"t": "Scenes",
"i": 0
},
{
"t": "F",
"i": 2
},
{
"t": "0",
"i": 3
},
{
"t": "Settings",
"i": 0
},
{
"t": "B",
"i": 2
},
{
"t": "TextMesh Pro",
"i": 0
},
{
"t": "h Cube",
"i": 3
},
{
"t": "Obj",
"i": 2
},
{
"t": "Examples & Extras",
"i": 0
},
{
"t": "Fonts",
"i": 0
},
{
"t": "M",
"i": 2
},
{
"t": "◎ New Material",
"i": 3
},
{
"t": "Resources",
"i": 0
},
{
"t": "Audio Clip",
"i": 2
},
{
"t": "None （Audio Clip）",
"i": 3
},
{
"t": "Fonts & Materials",
"i": 1
},
{
"t": "Video Clip",
"i": 2
},
{
"t": "None （Video Clip）",
"i": 3
},
{
"t": "Sprite Assets",
"i": 1
},
{
"t": "Style Sheets",
"i": 1
},
{
"t": "Default Style Sheet",
"i": 1
}
],
"cols": null,
"w": 1236,
"h": 485
}
},
"20a77bb753d6": {
"type": "ocr",
"title": "Snaders",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Snaders",
"i": 0
},
{
"t": "Create",
"i": 1
},
{
"t": "Folder",
"i": 3
},
{
"t": "Sprites",
"i": 0
},
{
"t": "Show in Explorer",
"i": 1
},
{
"t": "Material",
"i": 3
},
{
"t": "a EmojiOne Attribution",
"i": 0
},
{
"t": "MonoBehaviour Script",
"i": 3
},
{
"t": "EmoiiOne",
"i": 0
},
{
"t": "Open",
"i": 1
},
{
"t": "發 EmojiOne",
"i": 0
},
{
"t": "Delete",
"i": 1
},
{
"t": "Pretab Variant",
"i": 3
},
{
"t": "3 Textures",
"i": 0
},
{
"t": "Rename",
"i": 1
},
{
"t": "oriallnfo",
"i": 0
},
{
"t": "2D",
"i": 3
},
{
"t": "Alt+Ctrl+C",
"i": 3
},
{
"t": "rtsystem_Actions",
"i": 0
},
{
"t": "Copy Path",
"i": 1
},
{
"t": "Animation",
"i": 3
},
{
"t": "V Animator Controller",
"i": 0
},
{
"t": "V Animator Override Contr",
"i": 0
},
{
"t": "Open Scene Additive",
"i": 1
},
{
"t": "Audio",
"i": 3
},
{
"t": "vMonoBehaviourScript",
"i": 0
},
{
"t": "Rendering",
"i": 3
},
{
"t": "dme",
"i": 0
},
{
"t": "View in Package Manager",
"i": 1
},
{
"t": "Scene",
"i": 3
},
{
"t": "Import New Asset...",
"i": 1
},
{
"t": "Revert",
"i": 4
},
{
"t": "es",
"i": 0
},
{
"t": "Scripting",
"i": 3
},
{
"t": "Apply",
"i": 4
},
{
"t": "Import Package",
"i": 1
},
{
"t": "Search",
"i": 3
},
{
"t": "Export Package...",
"i": 1
},
{
"t": "Shader",
"i": 3
},
{
"t": "irocess",
"i": 4
},
{
"t": "Find References In Scene",
"i": 1
},
{
"t": "Shader Graph",
"i": 3
},
{
"t": "ostProcessor",
"i": 4
},
{
"t": "Testing",
"i": 3
},
{
"t": "Find References In Project",
"i": 1
},
{
"t": "Terrain",
"i": 3
},
{
"t": "Select Dependencies",
"i": 1
},
{
"t": "Text Core",
"i": 3
},
{
"t": "Refresh",
"i": 1
},
{
"t": "Ctrl+R",
"i": 3
},
{
"t": "TextMeshPro",
"i": 3
},
{
"t": "Font Asset",
"i": 4
},
{
"t": "Reimport",
"i": 1
},
{
"t": "Timeline",
"i": 3
},
{
"t": "Sprite Asset",
"i": 4
},
{
"t": "Reimport All",
"i": 1
},
{
"t": "UI Toolkit",
"i": 3
},
{
"t": "Style Sheet",
"i": 4
},
{
"t": "Visual Scripting",
"i": 3
},
{
"t": "Extract From Prefab",
"i": 1
},
{
"t": "Color Gradient",
"i": 4
},
{
"t": "Physics Material",
"i": 3
},
{
"t": "Init Weraian Contm",
"i": 1
}
],
"cols": null,
"w": 846,
"h": 486
}
},
"213160a5156b": {
"type": "ocr",
"title": "Test",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Test",
"i": 2
},
{
"t": "Teat",
"i": 3
},
{
"t": "create New Clip-",
"i": 3
},
{
"t": "多出一个可以选择当前动画的下拉列表",
"i": 2
},
{
"t": "可以在这里创建新动画和切换动画",
"i": 2
},
{
"t": "左侧面板",
"i": 1
},
{
"t": "多出一个可以添加变化居性的按钮",
"i": 2
},
{
"t": "在这里你可以任意添加你想要在动画中变化的脚本变量",
"i": 2
},
{
"t": "时间轴可以拖动",
"i": 2
},
{
"t": "注意：",
"i": 2
},
{
"t": "时间轴上的单位为n秒n帧",
"i": 2
},
{
"t": "面板变化",
"i": 0
},
{
"t": "一格代表一帧（并不是秒）",
"i": 2
},
{
"t": "Add Key：添加关健帧",
"i": 4
},
{
"t": "Delete Key：删除关键帧",
"i": 4
},
{
"t": "AUd KEY",
"i": 3
},
{
"t": "Clamped Auto：切线模式，自动设置切线",
"i": 4
},
{
"t": "Auto：旧日版切线模式，和Clamped Auto基本类似，主",
"i": 4
},
{
"t": "要用于老动画系统，建议不使用除非是老动画",
"i": 4
},
{
"t": "右侧面板",
"i": 1
},
{
"t": "Free Smooth：自由设置切线",
"i": 4
},
{
"t": "Flat：切线设置为水平",
"i": 4
},
{
"t": "Broken：单独控制左右曲线切线",
"i": 4
},
{
"t": "bt. Tangamt",
"i": 3
},
{
"t": "Frue",
"i": 4
},
{
"t": "Rigrk Tangemt",
"i": 3
},
{
"t": "Linear",
"i": 4
},
{
"t": "Both Ts-gente",
"i": 3
},
{
"t": "Constomt",
"i": 4
},
{
"t": "Free：自由设置",
"i": 4
},
{
"t": "Wnigted",
"i": 4
},
{
"t": "Linear：直线",
"i": 4
},
{
"t": "Constant：常最切换",
"i": 4
},
{
"t": "选择关鍵帧右鍵",
"i": 2
},
{
"t": "Weighted：权重切换",
"i": 4
}
],
"cols": null,
"w": 848,
"h": 581
}
},
"22a87ae9346a": {
"type": "ocr",
"title": "Timeline",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Timeline",
"i": 0
},
{
"t": "Signal",
"i": 0
},
{
"t": "Phusic Material",
"i": 0
},
{
"t": "Physics Material 2D",
"i": 0
},
{
"t": "GUl Skin",
"i": 0
},
{
"t": "Custom Font",
"i": 0
}
],
"cols": null,
"w": 462,
"h": 245
}
},
"2495a6391c54": {
"type": "ocr",
"title": "Character Controller / 坡度度数限制，大于该值的斜坡上不去",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"Character Controller",
""
],
[
"Slope Limit",
"45"
],
[
"Step Offset",
"0.3"
],
[
"Skin Width",
"0.08"
],
[
"Min Move Distance",
"0.001"
],
[
"Center",
"X"
],
[
"Radius",
"0.5"
],
[
"Height",
"2"
]
]
}
],
"title": "Character Controller"
},
{
"kind": "lines",
"lines": [
{
"t": "坡度度数限制，大于该值的斜坡上不去",
"i": 1
},
{
"t": "台阶偏移值，单位为米，低于这个值的台阶才能上去，",
"i": 1
},
{
"t": "该值不能大于角色控制器的高度",
"i": 1
},
{
"t": "皮肤的宽度，两个碰撞体可以穿透彼此最大的皮肤宽度，",
"i": 1
},
{
"t": "较大的值可以减少抖动，较小的值可能导致角色卡住，",
"i": 1
},
{
"t": "建议设置为半径的10%",
"i": 1
},
{
"t": "最小移动距离，大多数情况下为0，可以用来减少抖动",
"i": 1
},
{
"t": "Y",
"i": 0
},
{
"t": "Z",
"i": 3
},
{
"t": "角色控制器的中心点位置（相对于物体原点）",
"i": 4
},
{
"t": "角色控制器的半径（胶囊体的半径）",
"i": 2
},
{
"t": "角色控制器的高度（胶囊体的高度）",
"i": 2
}
],
"title": "坡度度数限制，大于该值的斜坡上不去"
}
],
"w": 1400,
"h": 787
}
},
"249ed7f9f014": {
"type": "ocr",
"title": "U Inspector",
"data": {
"kind": "rows",
"groups": [
{
"h": "U Inspector",
"rows": [
[
"Packed Assets （Addressable Asset Group Template）",
"记："
],
[
"Open.",
""
],
[
"已添加 签入",
"撤销"
]
]
},
{
"h": "V Content Packing & Loading",
"rows": [
[
"Build & Load Paths",
"<custom>"
],
[
"Build Path",
"<custom>"
],
[
"Load Path",
"<custom>"
]
]
},
{
"h": "V Advanced Options",
"rows": [
[
"Asset Bundle Compression",
"LZ4"
]
]
},
{
"h": "Use Asset Bundle Cache",
"rows": [
[
"Cache Clear Behavior",
"Clear When Space Is Needed In Cache"
],
[
"Asset Bundle CRC",
"Enabled, Including Cached"
],
[
"Bundle Naming Mode",
"Append Hash"
]
]
},
{
"h": "Include Labels in Catalog",
"rows": [
[
"Bundle Mode",
"Pack Together"
]
]
},
{
"h": "Prevent Updates",
"rows": [
[
"Add Schema",
""
]
]
}
],
"lines": null,
"cols": null,
"w": 838,
"h": 996
}
},
"25b99dd23064": {
"type": "ocr",
"title": "Ascent Line",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Ascent Line",
"i": 1
},
{
"t": "Cap Line|",
"i": 0
},
{
"t": "ABcdqhHgy",
"i": 1
},
{
"t": "Mean Line-",
"i": 0
},
{
"t": "Line Heig ht|",
"i": 4
},
{
"t": "Base Line",
"i": 0
},
{
"t": "Descent Line",
"i": 0
}
],
"cols": null,
"w": 655,
"h": 117
}
},
"27ca743a649d": {
"type": "ocr",
"title": "Generate Physics Shaps",
"data": {
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"Oper",
""
],
[
"Texture Type",
"Sprite （2D and Ul）"
],
[
"Texture Shape",
"2D"
],
[
"Sprite Mode",
"Multiple"
],
[
"Pixels Per Unit",
"Single"
],
[
"Mesh Type",
"Multiple"
],
[
"Extrude Edges Polygon",
"1"
]
]
},
{
"h": "Generate Physics Shaps",
"rows": [
[
"Sprite Edito",
""
]
]
}
],
"lines": null,
"cols": null,
"w": 646,
"h": 360
}
},
"27d8bfeb420c": {
"type": "ocr",
"title": "RectangleMap",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "RectangleMap",
"i": 0
},
{
"t": "•Edit",
"i": 4
},
{
"t": "Create New Palette",
"i": 0
},
{
"t": "Name",
"i": 0
},
{
"t": "New Palette",
"i": 2
},
{
"t": "Grid",
"i": 0
},
{
"t": "Hexagon",
"i": 2
},
{
"t": "Hexagon Type",
"i": 0
},
{
"t": "Point Top",
"i": 2
},
{
"t": "Cell Size",
"i": 0
},
{
"t": "Automatic",
"i": 2
},
{
"t": "Z0",
"i": 4
},
{
"t": "X1",
"i": 2
},
{
"t": "Y1",
"i": 4
},
{
"t": "Cancel",
"i": 1
},
{
"t": "Create",
"i": 4
}
],
"cols": null,
"w": 314,
"h": 163
}
},
"292eafea989a": {
"type": "ocr",
"title": "IMPACT SDF",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Assets > Resources > Font&Materials",
"i": 0
},
{
"t": "F",
"i": 3
},
{
"t": "IMPACT SDF",
"i": 2
}
],
"cols": null,
"w": 400,
"h": 194
}
},
"2959676dae74": {
"type": "ocr",
"title": "Project",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Project",
"i": 0
},
{
"t": "Navigation",
"i": 3
},
{
"t": "Inspector",
"i": 2
},
{
"t": "914",
"i": 2
},
{
"t": "MyAltas",
"i": 2
},
{
"t": "Assets",
"i": 0
},
{
"t": "Ope",
"i": 4
},
{
"t": "Resources",
"i": 0
},
{
"t": "BulletObj",
"i": 0
},
{
"t": "Type",
"i": 2
},
{
"t": "Master",
"i": 3
},
{
"t": "deadl",
"i": 0
},
{
"t": "Include in Build",
"i": 2
},
{
"t": "MyAltas",
"i": 0
},
{
"t": "RobotBoyldleSprite",
"i": 0
},
{
"t": "Packing",
"i": 2
},
{
"t": "Top",
"i": 0
},
{
"t": "Allow Rotation",
"i": 2
},
{
"t": "Scenes",
"i": 0
},
{
"t": "Tight Packing",
"i": 2
},
{
"t": "Scripts",
"i": 0
},
{
"t": "Padding",
"i": 2
},
{
"t": "4",
"i": 3
},
{
"t": "Standard Assets",
"i": 0
},
{
"t": "Packages",
"i": 0
},
{
"t": "Texture",
"i": 2
},
{
"t": "Read/Write Enabled",
"i": 2
},
{
"t": "Generate Mip Maps",
"i": 2
},
{
"t": "SRGB",
"i": 2
},
{
"t": "Filter Mode",
"i": 2
},
{
"t": "Bilinear",
"i": 3
},
{
"t": "Default",
"i": 2
},
{
"t": "iOS",
"i": 4
},
{
"t": "Max Texture Size",
"i": 2
},
{
"t": "2048",
"i": 3
},
{
"t": "Format",
"i": 2
},
{
"t": "Automatic",
"i": 3
},
{
"t": "Normal Quality",
"i": 3
},
{
"t": "Compression",
"i": 2
},
{
"t": "Use Crunch Compression",
"i": 2
},
{
"t": "V Objects for Packing",
"i": 2
},
{
"t": "List is Empty",
"i": 2
},
{
"t": "1",
"i": 4
},
{
"t": "Pack Preview",
"i": 2
}
],
"cols": null,
"w": 1400,
"h": 1058
}
},
"29dd3d805b5f": {
"type": "ocr",
"title": "00 Game / Till",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "00 Game",
"i": 0
},
{
"t": "Tile Palette",
"i": 2
},
{
"t": "Isometric Z as Y",
"i": 0
},
{
"t": "Edit*",
"i": 4
},
{
"t": "Default Brush",
"i": 0
},
{
"t": "Script",
"i": 0
},
{
"t": "日 GridBrush",
"i": 4
},
{
"t": "Can Change Z Position",
"i": 0
},
{
"t": "Z Position",
"i": 0
},
{
"t": "-2",
"i": 4
}
],
"title": "00 Game"
},
{
"kind": "lines",
"lines": [
{
"t": "2",
"i": 3
},
{
"t": "Till",
"i": 4
},
{
"t": "Focus On",
"i": 4
},
{
"t": "Tilemap",
"i": 1
},
{
"t": "Active Tilemap",
"i": 0
},
{
"t": "www.yxtown.com Icefo",
"i": 3
},
{
"t": "Reset",
"i": 4
}
],
"title": "Till"
}
],
"w": 1400,
"h": 1183
}
},
"2a0e6a214225": {
"type": "ocr",
"title": "④ Lesson14",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "④ Lesson14",
"i": 3
},
{
"t": "口 Assets",
"i": 3
},
{
"t": "Type",
"i": 4
},
{
"t": "Master",
"i": 4
},
{
"t": "⑦ Main Camera",
"i": 3
},
{
"t": "G Resources",
"i": 3
},
{
"t": "$ Bulletoby",
"i": 4
},
{
"t": "Include in Build",
"i": 4
},
{
"t": "意 ProjectSettings",
"i": 0
},
{
"t": "：口X",
"i": 3
},
{
"t": "s deadl",
"i": 4
},
{
"t": "Packing",
"i": 4
},
{
"t": "四 MyAltas",
"i": 4
},
{
"t": "RobotBoyldleSprite",
"i": 4
},
{
"t": "Allow Rotation",
"i": 4
},
{
"t": "Audio",
"i": 0
},
{
"t": "Editor",
"i": 1
},
{
"t": "Tight Packing",
"i": 4
},
{
"t": "$ Top",
"i": 4
},
{
"t": "Editor",
"i": 0
},
{
"t": "Version Control",
"i": 1
},
{
"t": "自 Scenes",
"i": 3
},
{
"t": "Padding",
"i": 4
},
{
"t": "Graphics",
"i": 0
},
{
"t": "Visible Meta Files",
"i": 2
},
{
"t": "Mode",
"i": 1
},
{
"t": "Scripts",
"i": 3
},
{
"t": "InputManaqer",
"i": 0
},
{
"t": "自 Standard Assets",
"i": 3
},
{
"t": "Texture",
"i": 4
},
{
"t": "Packaqe Manaaer",
"i": 0
},
{
"t": "Asset Serialization",
"i": 1
},
{
"t": "• Packages",
"i": 3
},
{
"t": "Read/Wite Enabled",
"i": 4
},
{
"t": "Physics",
"i": 0
},
{
"t": "Force Text",
"i": 2
},
{
"t": "Mode",
"i": 1
},
{
"t": "Phvsics 2D",
"i": 0
},
{
"t": "Generate Mip Maps",
"i": 4
},
{
"t": "Plaver",
"i": 0
},
{
"t": "Default Behaviour Mode",
"i": 1
},
{
"t": "$RGB",
"i": 4
},
{
"t": "Preset Manacer",
"i": 0
},
{
"t": "20",
"i": 2
},
{
"t": "Mode",
"i": 1
},
{
"t": "Filter Mode",
"i": 4
},
{
"t": "Bilinear",
"i": 4
},
{
"t": "Quality",
"i": 0
},
{
"t": "Script Execution Order",
"i": 0
},
{
"t": "AssetPipeline",
"i": 1
},
{
"t": "Default",
"i": 4
},
{
"t": "ICS",
"i": 4
},
{
"t": "Taas and Lavers",
"i": 0
},
{
"t": "Version2",
"i": 2
},
{
"t": "Mode",
"i": 1
},
{
"t": "Max Texture Size",
"i": 4
},
{
"t": "2048",
"i": 4
},
{
"t": "TextMesh Pro",
"i": 0
},
{
"t": "Active version",
"i": 1
},
{
"t": "Time",
"i": 0
},
{
"t": "Format",
"i": 4
},
{
"t": "Automatic",
"i": 4
},
{
"t": "VFX",
"i": 0
},
{
"t": "Cache Server （prolect specific）",
"i": 1
},
{
"t": "Compression",
"i": 4
},
{
"t": "Normal Quality",
"i": 4
},
{
"t": "ni",
"i": 0
},
{
"t": "XR Pluain Manaaement",
"i": 0
},
{
"t": "Use global settings （stored in preferences）",
"i": 2
},
{
"t": "Mode",
"i": 1
},
{
"t": "Use Crunch Compression",
"i": 4
},
{
"t": "Diabked",
"i": 2
},
{
"t": "v Objects for Packing",
"i": 4
},
{
"t": "Prefab Editing Environments",
"i": 1
},
{
"t": "Reqular Environment",
"i": 1
},
{
"t": "4 None （Scene Asset）",
"i": 2
},
{
"t": "21",
"i": 4
},
{
"t": "02",
"i": 4
},
{
"t": "UiEnvironment",
"i": 1
},
{
"t": "4 None （Scene Asset）",
"i": 2
}
],
"cols": null,
"w": 1400,
"h": 526
}
},
"2a36fcd1841f": {
"type": "ocr",
"title": "Staticr",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Staticr",
"i": 4
},
{
"t": "1",
"i": 1
},
{
"t": "Tag Untagged",
"i": 0
},
{
"t": "Layer Default",
"i": 3
},
{
"t": "Transform",
"i": 1
},
{
"t": "X-0.17",
"i": 2
},
{
"t": "Position",
"i": 0
},
{
"t": "Y",
"i": 3
},
{
"t": "0",
"i": 4
},
{
"t": "Z0",
"i": 4
},
{
"t": "Rotation",
"i": 0
},
{
"t": "X",
"i": 2
},
{
"t": "0",
"i": 2
},
{
"t": "Y",
"i": 3
},
{
"t": "0",
"i": 4
},
{
"t": "Z0",
"i": 4
},
{
"t": "Scale",
"i": 0
},
{
"t": "X",
"i": 2
},
{
"t": "Y",
"i": 3
},
{
"t": "1",
"i": 4
},
{
"t": "Z1",
"i": 4
},
{
"t": "Sprite Renderer",
"i": 1
},
{
"t": "Sprite",
"i": 0
},
{
"t": "口1",
"i": 2
},
{
"t": "Color",
"i": 0
},
{
"t": "Flip",
"i": 0
},
{
"t": "X",
"i": 2
},
{
"t": "Draw Mode",
"i": 0
},
{
"t": "Sliced",
"i": 2
},
{
"t": "Width",
"i": 2
},
{
"t": "Height",
"i": 4
},
{
"t": "Size",
"i": 0
},
{
"t": "0.8",
"i": 2
},
{
"t": "0.7",
"i": 4
},
{
"t": "Mask Interaction",
"i": 0
},
{
"t": "None",
"i": 2
},
{
"t": "Sprite Sort Point",
"i": 0
},
{
"t": "Center",
"i": 2
},
{
"t": "Material",
"i": 0
},
{
"t": "Sprites-Default",
"i": 2
},
{
"t": "V Additional Settings",
"i": 0
},
{
"t": "Default",
"i": 2
},
{
"t": "Sorting Layer",
"i": 0
},
{
"t": "Order in Layer",
"i": 0
},
{
"t": "Sprites-Default",
"i": 1
},
{
"t": "Shader",
"i": 1
},
{
"t": "Sprites/Default",
"i": 1
}
],
"cols": null,
"w": 1206,
"h": 1400
}
},
"2a9b020b5b15": {
"type": "ocr",
"title": "Create / Blend Tree",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "Create",
"i": 1
},
{
"t": "Folder",
"i": 4
},
{
"t": "Show in Explorer",
"i": 1
},
{
"t": "Material",
"i": 4
},
{
"t": "Open",
"i": 1
},
{
"t": "MonoBehaviour Script",
"i": 4
},
{
"t": "Delete",
"i": 1
},
{
"t": "Prefab Variant",
"i": 4
},
{
"t": "Sce",
"i": 0
},
{
"t": "Rename",
"i": 1
},
{
"t": "'ers",
"i": 0
},
{
"t": "2D",
"i": 4
},
{
"t": "Copy Path",
"i": 1
},
{
"t": "Alt+Ctrl+C",
"i": 3
},
{
"t": "Animation",
"i": 4
},
{
"t": "Sasl",
"i": 0
},
{
"t": "Open Scene Additive",
"i": 1
},
{
"t": "Audio",
"i": 4
},
{
"t": "Rendering",
"i": 4
},
{
"t": "View in Package Manager",
"i": 1
},
{
"t": "Scene",
"i": 4
},
{
"t": "Import New Asset...",
"i": 1
},
{
"t": "Scripting",
"i": 4
},
{
"t": "Import Package",
"i": 1
},
{
"t": "Search",
"i": 4
},
{
"t": "Export Package..",
"i": 1
},
{
"t": "Shader",
"i": 4
},
{
"t": "Find References In Scene",
"i": 1
},
{
"t": "Shader Graph",
"i": 4
},
{
"t": "Find References In Project",
"i": 1
},
{
"t": "Testing",
"i": 4
},
{
"t": "Select Dependencies",
"i": 1
},
{
"t": "Terrain",
"i": 4
},
{
"t": "Text Core",
"i": 4
},
{
"t": "Refresh",
"i": 1
},
{
"t": "Ctrl+R",
"i": 4
},
{
"t": "TextMeshPro",
"i": 4
},
{
"t": "Reimport",
"i": 1
},
{
"t": "Timeline",
"i": 4
},
{
"t": "Reimport AIl",
"i": 1
},
{
"t": "Ul Toolkit",
"i": 4
},
{
"t": "Extract From Prefab",
"i": 1
},
{
"t": "Visual Scripting",
"i": 4
},
{
"t": "Unity Version Control",
"i": 1
},
{
"t": "Physics Material",
"i": 4
},
{
"t": "GUISkin",
"i": 4
},
{
"t": "Update UXML Schema",
"i": 1
},
{
"t": "rity",
"i": 0
},
{
"t": "Custom Font",
"i": 4
},
{
"t": "Open C# Project",
"i": 1
},
{
"t": "ets",
"i": 0
},
{
"t": "Input Actions",
"i": 4
},
{
"t": "View in Import Activity Window",
"i": 1
},
{
"t": "Properties..",
"i": 1
},
{
"t": "Alt+P",
"i": 4
}
],
"title": "Create"
},
{
"kind": "lines",
"lines": [
{
"t": "Blend Tree",
"i": 1
},
{
"t": "SDF",
"i": 3
},
{
"t": "Font Asset",
"i": 0
},
{
"t": "Shift+Ctrl+F12",
"i": 4
},
{
"t": "Bitmap",
"i": 3
},
{
"t": "Sprite Asset",
"i": 0
},
{
"t": "Color",
"i": 3
},
{
"t": "Style Sheet",
"i": 0
},
{
"t": "Color Gradient",
"i": 0
},
{
"t": "Font Asset Variant",
"i": 3
}
],
"title": "Blend Tree"
}
],
"w": 1531,
"h": 973
}
},
"2bb957306d16": {
"type": "ocr",
"title": "Addressables Groups",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Addressables Groups",
"i": 0
},
{
"t": "Profile: Default",
"i": 1
},
{
"t": "Tools",
"i": 4
},
{
"t": "NewT",
"i": 0
},
{
"t": "Grc",
"i": 1
},
{
"t": "V Default",
"i": 2
},
{
"t": "e Name",
"i": 4
},
{
"t": "efault）",
"i": 4
},
{
"t": "VD",
"i": 1
},
{
"t": "Manage Profiles",
"i": 2
},
{
"t": "Pacneu FOsEts",
"i": 1
}
],
"cols": null,
"w": 602,
"h": 254
}
},
"2bc27fb685f4": {
"type": "ocr",
"title": "公式推导",
"data": {
"kind": "code",
"groups": null,
"lines": [
{
"t": "公式推导",
"i": 0
},
{
"t": "1. Cosp = 直角边/单位向量B模长",
"i": 0
},
{
"t": "直角边=CosB* 单位向量B模长",
"i": 0
},
{
"t": "1",
"i": 4
},
{
"t": "2. 直角边=单位向量A•单位向量B",
"i": 0
},
{
"t": "Cosp*单位向量B模长=单位向量A•单位向量B",
"i": 0
},
{
"t": "CosB = 单位向量A•单位向量B",
"i": 0
},
{
"t": "推出结果：B = Acos（单位向量A•单位向量B）",
"i": 0
},
{
"t": "SP",
"i": 4
}
],
"cols": null,
"w": 1400,
"h": 729
}
},
"2d242e098a10": {
"type": "ocr",
"title": "Sprite：遮罩图片",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Sprite：遮罩图片",
"i": 0
},
{
"t": "Alpha Cutoff：如果Alpha包含透明区域和不透明区域之间的混合（半",
"i": 0
},
{
"t": "透明），则可以手动确定所显示区域的分界点（0~1）",
"i": 0
},
{
"t": "Custom Range：自定义遮罩范围",
"i": 0
},
{
"t": "开启后可以设置遮罩的范围，按照排序层来划分",
"i": 0
}
],
"cols": null,
"w": 1400,
"h": 441
}
},
"305278459cd9": {
"type": "ocr",
"title": "Addressables Groups",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Addressables Groups",
"i": 3
},
{
"t": "Addressables Groups",
"i": 0
},
{
"t": "New ~ Profile: Default",
"i": 0
},
{
"t": "Tools",
"i": 1
},
{
"t": "Play Mode Script Buildv",
"i": 3
},
{
"t": "Labels",
"i": 4
},
{
"t": "Group Name \\ Addressable Name",
"i": 0
},
{
"t": "Path",
"i": 3
},
{
"t": "V Default Local Group （Default）",
"i": 0
},
{
"t": "Sphere Variant",
"i": 0
},
{
"t": "Assets/New Folder/Sphere Variant.p",
"i": 3
},
{
"t": "Packed Assets",
"i": 0
}
],
"cols": null,
"w": 1810,
"h": 298
}
},
"31600bd3987f": {
"type": "ocr",
"title": "S6 Addressables Profiles",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "S6 Addressables Profiles",
"i": 0
},
{
"t": "Addressables Profiles",
"i": 0
},
{
"t": "Create ~",
"i": 0
},
{
"t": "Profile",
"i": 0
},
{
"t": "-ocal",
"i": 4
},
{
"t": "Variable （All Profiles）",
"i": 1
},
{
"t": "Local",
"i": 4
},
{
"t": "Build and Load Path Variables （All Profiles）",
"i": 1
},
{
"t": "Loca",
"i": 4
},
{
"t": "VRemo",
"i": 4
}
],
"cols": null,
"w": 505,
"h": 278
}
},
"322cff0fd3c7": {
"type": "ocr",
"title": "Package Manager / Advanced、a2D",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "Package Manager",
"i": 1
},
{
"t": "十、Unity Registry、",
"i": 0
},
{
"t": "• 2D Animation",
"i": 0
},
{
"t": "2D Common",
"i": 4
},
{
"t": "2D Path",
"i": 4
},
{
"t": "2D Pixel Perfect",
"i": 4
},
{
"t": "2D PSD Importer",
"i": 4
},
{
"t": "2D Sprite",
"i": 4
},
{
"t": "2D SpriteShape",
"i": 4
},
{
"t": "2D Tilemap Editor",
"i": 4
}
],
"title": "Package Manager"
},
{
"kind": "lines",
"lines": [
{
"t": "Advanced、a2D",
"i": 2
},
{
"t": "3.2.5由",
"i": 0
},
{
"t": "Version 3.0.16 - May 26, 2021",
"i": 1
},
{
"t": "2019.4 verilled",
"i": 4
},
{
"t": "2.1.0",
"i": 0
},
{
"t": "Name",
"i": 1
},
{
"t": "2.1.0",
"i": 0
},
{
"t": "com.unity.2d.spriteshape",
"i": 1
},
{
"t": "2.1.0",
"i": 0
},
{
"t": "Links",
"i": 1
},
{
"t": "2.1.6",
"i": 0
},
{
"t": "View documentation",
"i": 1
},
{
"t": "View changelog",
"i": 1
},
{
"t": "1.0.0",
"i": 0
},
{
"t": "View licenses",
"i": 1
},
{
"t": "3.0.16",
"i": 0
},
{
"t": "Author",
"i": 1
},
{
"t": "1.0.0",
"i": 0
},
{
"t": "Unity Technologies",
"i": 1
}
],
"title": "Advanced、a2D"
}
],
"w": 1400,
"h": 563
}
},
"339edafc6c25": {
"type": "ocr",
"title": "Addressables Labels",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Addressables Labels",
"i": 0
},
{
"t": "Remove Unused Labels",
"i": 4
},
{
"t": "default",
"i": 0
},
{
"t": "HD",
"i": 1
},
{
"t": "= SD",
"i": 0
},
{
"t": "FHD",
"i": 3
},
{
"t": "Label Name",
"i": 0
},
{
"t": "Save",
"i": 4
}
],
"cols": null,
"w": 524,
"h": 328
}
},
"33a9d0b16739": {
"type": "ocr",
"title": "Keep Empty Rects / Pivot：单张图片轴心点位置",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"Slice一",
"Trim"
],
[
"Type",
"Automatic"
],
[
"Pivot",
"Center"
],
[
"Custom Pivot XO",
"YO"
],
[
"Method",
"Delete Existing"
],
[
"Slice",
""
],
[
"自动分割",
""
],
[
"Type",
"Grid By Cell Size"
],
[
"Pixel Size X 64",
"64"
],
[
"Offset",
"XO"
],
[
"Padding XO",
"Y"
]
]
},
{
"h": "Keep Empty Rects",
"rows": [
[
"Pivot.",
"Center"
],
[
"Custom Pivot X 0.5.",
"Y 0.5."
],
[
"Method",
"Delete Existing"
],
[
"Slice",
""
],
[
"按单元格大小分割",
""
],
[
"Slice",
"Trim"
],
[
"Type",
"Grid By Cell Count"
],
[
"Column & Row",
"C1"
],
[
"Offset XO",
"YO"
],
[
"Padding XO",
"YO"
]
]
},
{
"h": "Keep Empty Rects",
"rows": [
[
"Pivot",
"Center"
],
[
"Custom Pivot × 0.5",
"Y0.5."
],
[
"Method",
"Delete Existing"
],
[
"Slice",
""
]
]
}
],
"title": "Keep Empty Rects"
},
{
"kind": "lines",
"lines": [
{
"t": "Pivot：单张图片轴心点位置",
"i": 0
},
{
"t": "Custom Pivot： 自定义轴心点",
"i": 0
},
{
"t": "Method",
"i": 1
},
{
"t": "Delete Existing",
"i": 4
},
{
"t": "Delete Existing",
"i": 4
},
{
"t": "Smart",
"i": 4
},
{
"t": "Safe",
"i": 4
},
{
"t": "Method：如何处理现有对象",
"i": 0
},
{
"t": "Delete Existing：替换掉已经选择的任何矩形",
"i": 0
},
{
"t": "Smart：尝试创建新矩形同时保留或调整现有矩形",
"i": 0
},
{
"t": "Safe：添加新矩形而不更改任何已经存在的矩形",
"i": 0
},
{
"t": "Pixel Size：单元格宽高",
"i": 0
},
{
"t": "Offset：偏移位置",
"i": 0
},
{
"t": "Padding：和边緣的偏移位置",
"i": 0
},
{
"t": "Keep Empty Rects：是否保留空矩形",
"i": 0
},
{
"t": "Column & Row： 行列数",
"i": 0
}
],
"title": "Pivot：单张图片轴心点位置"
}
],
"w": 670,
"h": 816
}
},
"33bf6619d258": {
"type": "ocr",
"title": "Aa Aa",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Assets > TextMesh Pro > Fonts",
"i": 0
},
{
"t": "Aa Aa",
"i": 0
},
{
"t": "LiberationS...",
"i": 3
},
{
"t": "IMPACT",
"i": 1
},
{
"t": "LiberationS...",
"i": 4
}
],
"cols": null,
"w": 447,
"h": 217
}
},
"33e95fa655a5": {
"type": "ocr",
"title": "Q event",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Q event",
"i": 1
},
{
"t": "Search",
"i": 4
},
{
"t": "0Event System",
"i": 1
},
{
"t": "米 Event Trigger",
"i": 1
},
{
"t": "Base Input （UnityEngine.EventSystem",
"i": 2
},
{
"t": "nput System Event System （UI Toc",
"i": 2
},
{
"t": "Multiplayer Event System （UnityEngin",
"i": 2
},
{
"t": "IrC",
"i": 0
},
{
"t": "Panel Event Handler （Ul Toolkit）",
"i": 2
},
{
"t": "tM",
"i": 0
},
{
"t": "TMP_Scrollbar Event Handler （TMPro",
"i": 2
},
{
"t": "tM",
"i": 0
},
{
"t": "TMP_Text Event Check （TMPro.Exam",
"i": 2
},
{
"t": "tM",
"i": 0
},
{
"t": "TMP_Text Event Handler （TMPro）",
"i": 2
},
{
"t": "tM",
"i": 0
},
{
"t": "Ne TMP_Text Event Handler （TMPro）",
"i": 2
},
{
"t": "e",
"i": 0
}
],
"cols": null,
"w": 388,
"h": 435
}
},
"34322305e10f": {
"type": "ocr",
"title": "h Project",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "h Project",
"i": 0
},
{
"t": "0 Inspector",
"i": 2
},
{
"t": "©27",
"i": 2
},
{
"t": "Default Style Sheet （TMP_Style Sheet）",
"i": 2
},
{
"t": "Assets",
"i": 0
},
{
"t": "open",
"i": 4
},
{
"t": "Resources",
"i": 0
},
{
"t": "已添加.",
"i": 2
},
{
"t": "签入",
"i": 4
},
{
"t": "撤销",
"i": 4
},
{
"t": "Scenes",
"i": 0
},
{
"t": "团，",
"i": 0
},
{
"t": "Settings",
"i": 0
},
{
"t": "TextMesh Pro",
"i": 0
},
{
"t": "Name",
"i": 2
},
{
"t": "Normal",
"i": 3
},
{
"t": "HashCode",
"i": 4
},
{
"t": "-1183493901",
"i": 4
},
{
"t": "EXamples & Extras",
"i": 1
},
{
"t": "Fonts",
"i": 1
},
{
"t": "Opening Tags",
"i": 2
},
{
"t": "Resources",
"i": 1
},
{
"t": "Fonts & Materials",
"i": 1
},
{
"t": "Closing Tags",
"i": 2
},
{
"t": "Sprite Assets",
"i": 1
},
{
"t": "Style Sheets",
"i": 1
},
{
"t": "Default Style Sheet",
"i": 1
},
{
"t": "Name",
"i": 2
},
{
"t": "H1",
"i": 3
},
{
"t": "HashCode 2425",
"i": 4
},
{
"t": "Line Breaking Following Characters",
"i": 1
},
{
"t": "Opening Tags",
"i": 2
},
{
"t": "＜size=2em>＜b>＜#40ff80>*",
"i": 3
},
{
"t": "LineBreaking Leading Characters",
"i": 1
},
{
"t": "TMP Settings",
"i": 1
},
{
"t": "Shaders",
"i": 1
},
{
"t": "*</size></b></color>",
"i": 3
},
{
"t": "Closing Tags",
"i": 2
},
{
"t": "Sprites",
"i": 1
},
{
"t": "Tree_Textures",
"i": 0
},
{
"t": "Tutoriallnfo",
"i": 0
},
{
"t": "Name",
"i": 2
},
{
"t": "Quote",
"i": 3
},
{
"t": "HashCode",
"i": 4
},
{
"t": "93368250",
"i": 4
},
{
"t": "InputSystem_Actions",
"i": 0
},
{
"t": "<i> <size=75%><margin=10%>",
"i": 3
},
{
"t": "Opening Tags",
"i": 2
},
{
"t": "New Animator Controller",
"i": 0
},
{
"t": "New Animator Override Controller",
"i": 0
},
{
"t": "Closing Tags",
"i": 2
},
{
"t": "</i></size></width></margin>",
"i": 3
},
{
"t": "NewMonoBehaviourScript",
"i": 0
},
{
"t": "Readme",
"i": 0
},
{
"t": "Tree",
"i": 0
},
{
"t": "Name",
"i": 2
},
{
"t": "HashCode 65",
"i": 4
},
{
"t": "Packages",
"i": 0
},
{
"t": "Opening Tags",
"i": 2
},
{
"t": "<color=#40a0ff><u>",
"i": 3
},
{
"t": "Closing Tags",
"i": 2
},
{
"t": "</u></color>",
"i": 3
},
{
"t": "Name",
"i": 2
},
{
"t": "Link",
"i": 3
},
{
"t": "HashCode 2656128",
"i": 4
},
{
"t": "Opening Tags",
"i": 2
},
{
"t": "＜ >＜#40a0ff><link=\"ID_01\">",
"i": 3
},
{
"t": "Closing Tags",
"i": 2
},
{
"t": "</u></color></link>",
"i": 3
},
{
"t": "Name",
"i": 2
},
{
"t": "Title",
"i": 3
},
{
"t": "97690656",
"i": 4
},
{
"t": "HashCode",
"i": 4
},
{
"t": "<size=125%><b><align=center>",
"i": 3
},
{
"t": "Opening Tags",
"i": 2
},
{
"t": "Closing Tags",
"i": 2
},
{
"t": "</SIZe></b></align>",
"i": 3
},
{
"t": "Name.",
"i": 2
},
{
"t": "H2",
"i": 3
},
{
"t": "HashCode",
"i": 4
}
],
"cols": null,
"w": 1034,
"h": 1400
}
},
"34c19d06dbef": {
"type": "ocr",
"title": "Tags",
"data": {
"kind": "rows",
"groups": [
{
"h": "Tags",
"rows": [
[
"共有32层可设置",
""
]
]
},
{
"h": "Layers",
"rows": [
[
"Builtin Layer O",
"Delault"
],
[
"Builtin Layer 1|",
"TransparentFX"
],
[
"Builtin Layer 2|",
"Ignore Raycast"
]
]
},
{
"h": "User Layer 3",
"rows": [
[
"Builtin Layer 4",
"Water"
],
[
"Builtin Layer 5",
"UI"
]
]
},
{
"h": "User Layer7",
"rows": [
[
"User Layer 8",
"Player"
]
]
}
],
"lines": null,
"cols": null,
"w": 273,
"h": 353
}
},
"35eae3cbea22": {
"type": "ocr",
"title": "图内文字",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "A",
"i": 0
},
{
"t": "B",
"i": 1
},
{
"t": "C",
"i": 2
},
{
"t": "D",
"i": 3
},
{
"t": "E",
"i": 4
},
{
"t": "hp",
"i": 0
},
{
"t": "speed",
"i": 1
},
{
"t": "volume",
"i": 2
},
{
"t": "resName",
"i": 2
},
{
"t": "scale",
"i": 4
},
{
"t": "5 Airplane/Airplanel",
"i": 2
},
{
"t": "4",
"i": 1
},
{
"t": "6",
"i": 2
},
{
"t": "15",
"i": 4
},
{
"t": "3",
"i": 1
},
{
"t": "4 Airplane/Airplane2",
"i": 2
},
{
"t": "15",
"i": 4
},
{
"t": "2",
"i": 1
},
{
"t": "8",
"i": 2
},
{
"t": "3 Airplane/Airplane3",
"i": 2
},
{
"t": "15",
"i": 4
},
{
"t": "10",
"i": 1
},
{
"t": "3",
"i": 2
},
{
"t": "10 Airplane/Airplane4",
"i": 2
},
{
"t": "6",
"i": 4
},
{
"t": "6",
"i": 1
},
{
"t": "7Airplane/Airplane5",
"i": 2
},
{
"t": "5",
"i": 1
},
{
"t": "10",
"i": 4
}
],
"cols": null,
"w": 739,
"h": 224
}
},
"3733f0f5b5f5": {
"type": "ocr",
"title": "Fonts",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Fonts",
"i": 0
},
{
"t": "Honizontal Mapping",
"i": 2
},
{
"t": "Characle！",
"i": 3
},
{
"t": "Resources",
"i": 0
},
{
"t": "Vertical Mapping",
"i": 2
},
{
"t": "Character",
"i": 3
},
{
"t": "Fonts & Materials",
"i": 1
},
{
"t": "Sprite Assets",
"i": 1
},
{
"t": "Extra Settings",
"i": 2
},
{
"t": "（Click to collapse）",
"i": 4
},
{
"t": "Style Sheets",
"i": 1
},
{
"t": "Margins",
"i": 2
},
{
"t": "Left",
"i": 3
},
{
"t": "Top",
"i": 4
},
{
"t": "Right",
"i": 4
},
{
"t": "So Default Style Shee",
"i": 1
},
{
"t": "Bottom",
"i": 4
},
{
"t": "LineBreaking Following",
"i": 1
},
{
"t": "LineBreaking Leading C",
"i": 1
},
{
"t": "Geometry Sorting",
"i": 2
},
{
"t": "Normal",
"i": 3
},
{
"t": "50",
"i": 0
},
{
"t": "TMP Settings",
"i": 1
},
{
"t": "Shaders",
"i": 0
},
{
"t": "Is Scale Static",
"i": 2
},
{
"t": "Sprites",
"i": 0
},
{
"t": "EmoiiOne Attribution",
"i": 1
},
{
"t": "Rich Text",
"i": 2
},
{
"t": "EmojiOne",
"i": 1
},
{
"t": "Raycast Target",
"i": 2
},
{
"t": "EmojiOne",
"i": 1
},
{
"t": "Maskable",
"i": 2
},
{
"t": "EmojiOne",
"i": 1
},
{
"t": "Pais：",
"i": 2
},
{
"t": "Escape Characters",
"i": 2
},
{
"t": "TreeTextures",
"i": 0
},
{
"t": "Tutoriallnfo",
"i": 0
},
{
"t": "Visible Descen：",
"i": 2
},
{
"t": "Inputsystem_Actions",
"i": 0
},
{
"t": "Emoji Fallback Support",
"i": 2
},
{
"t": "New Animator Controller",
"i": 0
},
{
"t": "New Animator Override Controller",
"i": 0
},
{
"t": "Sprite Asset",
"i": 2
},
{
"t": "one （TMP._Sprite Asset）",
"i": 3
},
{
"t": "NewMonoBehaviourScript",
"i": 0
},
{
"t": "Style Sheet Asset",
"i": 2
},
{
"t": "None （TMP_Style Sheet）",
"i": 3
},
{
"t": "Readme",
"i": 0
},
{
"t": "Tree",
"i": 0
},
{
"t": "Font Features",
"i": 2
},
{
"t": "kemn",
"i": 3
},
{
"t": "Packages",
"i": 0
},
{
"t": "Extra Padding",
"i": 2
},
{
"t": "LiberationSans SDF Material （Material）",
"i": 2
},
{
"t": "② 出",
"i": 4
},
{
"t": "Shader",
"i": 2
},
{
"t": "TextMeshPro/Mobile/Distance Field",
"i": 2
},
{
"t": "Edit...",
"i": 4
}
],
"cols": null,
"w": 769,
"h": 452
}
},
"39554d3a53b3": {
"type": "ocr",
"title": "∞ Game",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "∞ Game",
"i": 0
},
{
"t": "Display 1",
"i": 0
},
{
"t": "16:9",
"i": 0
},
{
"t": "Scale",
"i": 1
},
{
"t": "Maximize On Play Mute Audio Stats",
"i": 4
},
{
"t": "Gizmos",
"i": 4
},
{
"t": "X",
"i": 4
},
{
"t": "0.0",
"i": 0
}
],
"cols": null,
"w": 1400,
"h": 803
}
},
"3a0a171c3d09": {
"type": "ocr",
"title": "AddressableAssetsData",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "AddressableAssetsData",
"i": 0
},
{
"t": "AssetGroups",
"i": 3
},
{
"t": "Schemas",
"i": 4
},
{
"t": "Atlas",
"i": 4
},
{
"t": "Controller",
"i": 4
},
{
"t": "Data.",
"i": 4
},
{
"t": "Default Local Group",
"i": 4
},
{
"t": "GameObject",
"i": 4
},
{
"t": "Lua",
"i": 4
},
{
"t": "Material",
"i": 4
},
{
"t": "Music",
"i": 4
},
{
"t": "Scenes",
"i": 4
},
{
"t": "Sprite",
"i": 4
},
{
"t": "Texture",
"i": 4
},
{
"t": "AssetGroupTemplates",
"i": 2
},
{
"t": "Eo Packed Assets",
"i": 3
},
{
"t": "DataBuilders",
"i": 2
},
{
"t": "BuildScriptFastMode",
"i": 4
},
{
"t": "BuildScriptPackedMode",
"i": 4
},
{
"t": "BuildScriptPackedPlayMode",
"i": 4
},
{
"t": "AddressableAssetSettings",
"i": 2
},
{
"t": "DefaultObject",
"i": 2
},
{
"t": "ProfileDataSourceSettings",
"i": 2
}
],
"cols": null,
"w": 428,
"h": 555
}
},
"3b0cf8db4781": {
"type": "ocr",
"title": "0 Inspector",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "0 Inspector",
"i": 0
},
{
"t": "Scriptable Object （Mono Script） Import Settings",
"i": 1
},
{
"t": "已添加",
"i": 0
},
{
"t": "Obj",
"i": 0
},
{
"t": "None （Game Object）",
"i": 4
},
{
"t": "M",
"i": 0
},
{
"t": "None （Material）",
"i": 4
},
{
"t": "Audio Clip",
"i": 0
},
{
"t": "None （Audio Clip）",
"i": 4
},
{
"t": "Video Clip",
"i": 0
},
{
"t": "None （Video Clip）",
"i": 4
},
{
"t": "Default references will only be applied in edit mode.",
"i": 1
},
{
"t": "nported Object",
"i": 0
},
{
"t": "Scriptable Object （Mono Script）",
"i": 1
},
{
"t": "已添加.",
"i": 0
}
],
"cols": null,
"w": 1102,
"h": 599
}
},
"3bcfb5946f9c": {
"type": "ocr",
"title": "Color Mode",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Color Mode",
"i": 0
},
{
"t": "Four Corners Gradient",
"i": 4
}
],
"cols": null,
"w": 310,
"h": 49
}
},
"3cc992b8e144": {
"type": "ocr",
"title": "Mooe Bis Anedtion Mae",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Mooe Bis Anedtion Mae",
"i": 3
},
{
"t": "IrpotConrert",
"i": 2
},
{
"t": "不包含动画剪辑的模型",
"i": 2
},
{
"t": "Import Constraints：从此资源导入约束",
"i": 4
},
{
"t": "启用后，Unity会自动添加相应的约束组件将其关联到正",
"i": 4
},
{
"t": "确的游戏对象",
"i": 4
},
{
"t": "Import Animation：从此资源导入动画",
"i": 4
},
{
"t": "如果禁用，下面的都没有，并且不会导入任何动画",
"i": 4
},
{
"t": "Bake Animations：通过反向动力学（IK）或模拟创建的",
"i": 4
},
{
"t": "动画以便推进运动关键帧，仅用于Maya、3Dmax和",
"i": 4
},
{
"t": "Cinema4D文件",
"i": 4
},
{
"t": "nncngeno",
"i": 4
},
{
"t": "Anim.Compression：导入动画时使用的压缩类型",
"i": 4
},
{
"t": "，Off：禁用动画压缩，在导入时Unity不会减少关键帧数",
"i": 4
},
{
"t": "量，效果最好性能较低，文件较大，运行时内存占用也",
"i": 4
},
{
"t": "大。通常不建议使用",
"i": 4
},
{
"t": "Keyframe Reduction：减少冗余关键帧，仅适用于",
"i": 4
},
{
"t": "Generic通用动画类型",
"i": 4
},
{
"t": "包含动画剪辑的模型",
"i": 2
},
{
"t": "Keyframe Reduction and Compression：减少关键帧",
"i": 4
},
{
"t": "并在文件中存储动画时压缩关键帧，会影响文件大小，但",
"i": 4
},
{
"t": "是内存大小和Keyframe Reduction相同，仅适用于",
"i": 4
},
{
"t": "Legacyl日版动画类型",
"i": 4
},
{
"t": "基础信息设置",
"i": 0
},
{
"t": "Optimal：让Unity决定如何压缩，仅适用Generic通用",
"i": 4
},
{
"t": "和Humanoid人形动画类型",
"i": 4
},
{
"t": "Rotation Error：设置旋转曲线压缩容错度（百分比），",
"i": 4
},
{
"t": "原始旋转值和减小值之间的最小角度",
"i": 4
},
{
"t": "Position Error：设置位置曲线压缩容错度（百分比）",
"i": 4
},
{
"t": "Scale Error：设置缩放曲线压缩容错度（百分比）",
"i": 4
},
{
"t": "如果原始值和消减值之间的差小于原始值乘以容错百分",
"i": 4
},
{
"t": "比，会删除关键帧",
"i": 4
},
{
"t": "这些内容仅在Keyframe Reduction或Optimal压缩时可",
"i": 4
},
{
"t": "Animated Custom Properties：导入你指定为自定义用",
"i": 4
},
{
"t": "户属性的任何FBX属性",
"i": 4
},
{
"t": "动画剪辑选择列表",
"i": 2
},
{
"t": "在这里我们可以看到所有的动画剪辑",
"i": 2
},
{
"t": "可以通过+或-来新增剪辑或者删除所选的剪辑",
"i": 2
},
{
"t": "在这里选择一个动画剪辑后",
"i": 2
},
{
"t": "我们可以在下方编辑具体的相关属性信息",
"i": 2
}
],
"cols": null,
"w": 1224,
"h": 1400
}
},
"3d43607b0de0": {
"type": "ocr",
"title": "MrTangData",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "MrTangData",
"i": 0
},
{
"t": "Rolelnfo",
"i": 0
},
{
"t": "Script",
"i": 3
},
{
"t": "进 Rolelnfo",
"i": 4
},
{
"t": "ScriptableObjectTool",
"i": 0
},
{
"t": "v Role List",
"i": 3
},
{
"t": "Font&Materials",
"i": 0
},
{
"t": "Script",
"i": 0
},
{
"t": "：V Element O",
"i": 3
},
{
"t": "Rolelnfo",
"i": 0
},
{
"t": "Id",
"i": 3
},
{
"t": "0",
"i": 4
},
{
"t": "Cube",
"i": 0
},
{
"t": "MrTangData",
"i": 0
},
{
"t": "Res",
"i": 4
},
{
"t": "MyDatalest",
"i": 0
},
{
"t": "Atk",
"i": 4
},
{
"t": "0",
"i": 4
},
{
"t": "New Material",
"i": 0
},
{
"t": "Tips",
"i": 3
},
{
"t": "ScriptableObject",
"i": 0
},
{
"t": "Temp",
"i": 0
},
{
"t": "Lock Money",
"i": 4
},
{
"t": "0",
"i": 4
},
{
"t": "1eS",
"i": 0
},
{
"t": "Type",
"i": 4
},
{
"t": "0",
"i": 4
},
{
"t": "Ings",
"i": 0
},
{
"t": "Hit Eff",
"i": 4
},
{
"t": "Mesh Pro",
"i": 0
},
{
"t": "LTextures",
"i": 0
},
{
"t": "• Element 1",
"i": 3
},
{
"t": "rlallnfo",
"i": 0
},
{
"t": "=> Element 2",
"i": 3
},
{
"t": "tSystem_Actions",
"i": 0
},
{
"t": "Animator Controller",
"i": 0
},
{
"t": "• Element 3",
"i": 3
},
{
"t": "Animator Override Controller",
"i": 0
},
{
"t": "• Element 4",
"i": 3
},
{
"t": "MonoBehaviourScript",
"i": 0
},
{
"t": "• Element 5",
"i": 3
},
{
"t": "dme",
"i": 0
}
],
"cols": null,
"w": 1059,
"h": 536
}
},
"3e75925af98a": {
"type": "ocr",
"title": "# Scene / 三 Hierarchy",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "# Scene",
"i": 0
},
{
"t": "C Profller",
"i": 2
},
{
"t": "前 Asset Store",
"i": 3
},
{
"t": "Shaded",
"i": 0
},
{
"t": "20",
"i": 3
},
{
"t": "90E•",
"i": 4
},
{
"t": "∞ Game",
"i": 0
},
{
"t": "Display 1",
"i": 0
},
{
"t": "• 16:9",
"i": 1
},
{
"t": "•Scale •",
"i": 4
}
],
"title": "# Scene"
},
{
"kind": "lines",
"lines": [
{
"t": "三 Hierarchy",
"i": 1
},
{
"t": "A Proyect",
"i": 3
},
{
"t": "Inspector",
"i": 4
},
{
"t": "火•Gizmos",
"i": 0
},
{
"t": "Q AI",
"i": 0
},
{
"t": "Q Nl",
"i": 2
},
{
"t": "＋、",
"i": 3
},
{
"t": "$8",
"i": 4
},
{
"t": "Main Camera",
"i": 4
},
{
"t": "Static-",
"i": 4
},
{
"t": "4 Lesson3\"",
"i": 1
},
{
"t": "G Main Camera",
"i": 1
},
{
"t": "Tag Maincame、",
"i": 4
},
{
"t": "Layer",
"i": 4
},
{
"t": "自 Scenes",
"i": 3
},
{
"t": "G Directional Light",
"i": 1
},
{
"t": "Scripts",
"i": 3
},
{
"t": "vG GameObject",
"i": 1
},
{
"t": "Lessonl_Mathf",
"i": 3
},
{
"t": "Transform",
"i": 4
},
{
"t": "G Cube",
"i": 2
},
{
"t": "Lesson2_三角商效",
"i": 3
},
{
"t": "X0",
"i": 4
},
{
"t": "Y1",
"i": 4
},
{
"t": "Z -10",
"i": 4
},
{
"t": "口Lesson3.坐标系",
"i": 3
},
{
"t": "Rotation",
"i": 4
},
{
"t": "X。",
"i": 4
},
{
"t": "YO",
"i": 4
},
{
"t": "Z0",
"i": 4
},
{
"t": "日Lesson3",
"i": 3
},
{
"t": "Scale.",
"i": 4
},
{
"t": "X1",
"i": 4
},
{
"t": "Y1",
"i": 4
},
{
"t": "Z1",
"i": 4
},
{
"t": "④ Lesson3",
"i": 3
},
{
"t": "Packages",
"i": 3
},
{
"t": "vmIY Camera",
"i": 4
},
{
"t": "Clear Flags",
"i": 4
},
{
"t": "Skybox",
"i": 4
},
{
"t": "Background",
"i": 4
},
{
"t": "Culling Mask",
"i": 4
},
{
"t": "Everything",
"i": 4
},
{
"t": "Projection",
"i": 4
},
{
"t": "Perspectlve",
"i": 4
},
{
"t": "FOV AXiS",
"i": 4
},
{
"t": "Vertical",
"i": 4
},
{
"t": "Field of View",
"i": 4
},
{
"t": "60",
"i": 4
},
{
"t": "Camera Preview",
"i": 1
},
{
"t": "PhysicalCamera",
"i": 4
},
{
"t": "0.3",
"i": 4
},
{
"t": "clipping Pianes",
"i": 4
},
{
"t": "Noar",
"i": 4
},
{
"t": "Viewport Rect",
"i": 4
},
{
"t": "X0.5",
"i": 4
},
{
"t": "YOE|",
"i": 4
},
{
"t": "WO.6.",
"i": 4
},
{
"t": "H O.6",
"i": 4
},
{
"t": "3 Consote",
"i": 1
},
{
"t": "Maximize On Play Mute Audio Stats Gizmos•",
"i": 0
},
{
"t": "Depth",
"i": 4
},
{
"t": "Clear Collapse Clear on Play Clear on Bulld Error Pause EditoryQ",
"i": 1
},
{
"t": "Rendering Path",
"i": 4
},
{
"t": "Use Graphics Settin•",
"i": 4
},
{
"t": "Target Toxture",
"i": 4
},
{
"t": "None （Render TextG",
"i": 4
},
{
"t": "Occlusion Culing",
"i": 4
},
{
"t": "HDR",
"i": 4
},
{
"t": "Use Graphics Settin•",
"i": 4
},
{
"t": "MSAA",
"i": 4
},
{
"t": "Use Graphics Settin•",
"i": 4
},
{
"t": "Allow Dynamic Resol",
"i": 4
},
{
"t": "Display 1",
"i": 4
},
{
"t": "Target Dispkay",
"i": 4
},
{
"t": "TargetEye",
"i": 4
},
{
"t": "Audio Listener",
"i": 4
},
{
"t": "Add Component",
"i": 4
},
{
"t": "www.yxtown.com Icefocus",
"i": 3
}
],
"title": "三 Hierarchy"
}
],
"w": 1400,
"h": 680
}
},
"3f3dcbf36cf2": {
"type": "ocr",
"title": "default",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "choose existing label or type to create a new on",
"i": 4
},
{
"t": "default",
"i": 4
},
{
"t": "Play Mode Script Build",
"i": 1
},
{
"t": "HD",
"i": 4
},
{
"t": "Q",
"i": 4
},
{
"t": "SD",
"i": 4
},
{
"t": "Path",
"i": 0
},
{
"t": "Manage Labels..",
"i": 4
},
{
"t": "Assets/addressable_lesson3.prefab",
"i": 0
}
],
"cols": null,
"w": 797,
"h": 230
}
},
"3fefc211e728": {
"type": "ocr",
"title": "E Hierarchy / Static",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "E Hierarchy",
"i": 0
},
{
"t": "L Project",
"i": 2
},
{
"t": "O Inspector",
"i": 4
},
{
"t": "＋、",
"i": 0
},
{
"t": "©27",
"i": 4
},
{
"t": "Q•All",
"i": 0
},
{
"t": "Q",
"i": 2
},
{
"t": "Temp",
"i": 4
},
{
"t": "S SampleScene*",
"i": 0
},
{
"t": "Assets",
"i": 2
},
{
"t": "G Main Camera",
"i": 0
},
{
"t": "Tag",
"i": 4
},
{
"t": "Untagged",
"i": 4
},
{
"t": "Resources",
"i": 3
},
{
"t": "G Directional Light",
"i": 1
},
{
"t": "Font&Materials",
"i": 3
},
{
"t": "G Global Volume",
"i": 1
},
{
"t": "Transform",
"i": 4
},
{
"t": "Cube",
"i": 3
},
{
"t": "Grid",
"i": 1
},
{
"t": "MrTangData",
"i": 3
},
{
"t": "Position",
"i": 4
},
{
"t": "Y Cube",
"i": 1
},
{
"t": "MyDataTest",
"i": 3
},
{
"t": "Rotation",
"i": 4
},
{
"t": "• 了 Canvas",
"i": 0
},
{
"t": "New Material",
"i": 3
},
{
"t": "G EventSystem",
"i": 1
},
{
"t": "Scale",
"i": 4
},
{
"t": "ScriptableObject",
"i": 3
},
{
"t": "G GameObject",
"i": 1
},
{
"t": "ScriptableObjectTwo",
"i": 3
},
{
"t": "v Temp",
"i": 4
},
{
"t": "（Scripu；",
"i": 4
},
{
"t": "GameObject （1）",
"i": 1
},
{
"t": "Temp",
"i": 3
},
{
"t": "G Temp",
"i": 0
},
{
"t": "Scenes",
"i": 3
},
{
"t": "Script",
"i": 4
},
{
"t": "Settings",
"i": 3
},
{
"t": "Mydata",
"i": 4
},
{
"t": "TextMesh Pro",
"i": 3
},
{
"t": "Examples & Extras",
"i": 3
},
{
"t": "Fonts",
"i": 3
},
{
"t": "Resources",
"i": 3
}
],
"title": "E Hierarchy"
},
{
"kind": "lines",
"lines": [
{
"t": "Static",
"i": 4
},
{
"t": "Layer",
"i": 1
},
{
"t": "Default",
"i": 2
},
{
"t": "X",
"i": 0
},
{
"t": "Y",
"i": 2
},
{
"t": "0",
"i": 2
},
{
"t": "Z",
"i": 4
},
{
"t": "X",
"i": 0
},
{
"t": "Y",
"i": 2
},
{
"t": "Z",
"i": 4
},
{
"t": "X",
"i": 0
},
{
"t": "1",
"i": 0
},
{
"t": "Y",
"i": 2
},
{
"t": "1",
"i": 2
},
{
"t": "Z",
"i": 4
},
{
"t": "1",
"i": 4
},
{
"t": "# Temp",
"i": 0
},
{
"t": "G.MyDataTest （My Data）",
"i": 0
},
{
"t": "Add Component",
"i": 0
}
],
"title": "Static"
}
],
"w": 1541,
"h": 473
}
},
"41598227ccac": {
"type": "ocr",
"title": "A1",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "A1",
"i": 0
},
{
"t": "id",
"i": 0
},
{
"t": "B",
"i": 1
},
{
"t": "C",
"i": 2
},
{
"t": "D",
"i": 3
},
{
"t": "E",
"i": 4
},
{
"t": "F",
"i": 4
},
{
"t": "G",
"i": 4
},
{
"t": "A",
"i": 1
},
{
"t": "1",
"i": 0
},
{
"t": "id",
"i": 0
},
{
"t": "res",
"i": 1
},
{
"t": "atk",
"i": 2
},
{
"t": "tips",
"i": 2
},
{
"t": "lockMoney",
"i": 3
},
{
"t": "tye",
"i": 4
},
{
"t": "hitEff",
"i": 4
},
{
"t": "2",
"i": 0
},
{
"t": "1 Role/1",
"i": 1
},
{
"t": "2 最师的男人",
"i": 2
},
{
"t": "0",
"i": 4
},
{
"t": "1 eff/1",
"i": 4
},
{
"t": "3",
"i": 0
},
{
"t": "2 Role/2",
"i": 1
},
{
"t": "3 最温柔的男人",
"i": 2
},
{
"t": "0",
"i": 4
},
{
"t": "2 eff/1",
"i": 4
},
{
"t": "4",
"i": 0
},
{
"t": "3 Role/3",
"i": 1
},
{
"t": "4 最凶猛的男人",
"i": 2
},
{
"t": "200",
"i": 4
},
{
"t": "2 eff/1",
"i": 4
},
{
"t": "5 最可爱的男人",
"i": 2
},
{
"t": "5",
"i": 0
},
{
"t": "4 Role/4",
"i": 1
},
{
"t": "300",
"i": 4
},
{
"t": "2 eff/1",
"i": 4
},
{
"t": "6",
"i": 0
},
{
"t": "5 Role/5",
"i": 1
},
{
"t": "6 最小的男人",
"i": 2
},
{
"t": "400",
"i": 4
},
{
"t": "2 eff/1",
"i": 4
},
{
"t": "500",
"i": 4
},
{
"t": "7",
"i": 0
},
{
"t": "6 Role/6",
"i": 1
},
{
"t": "7 最大的男人",
"i": 2
},
{
"t": "2 eff/1",
"i": 4
},
{
"t": "8",
"i": 0
}
],
"cols": null,
"w": 774,
"h": 264
}
},
"437c543917f0": {
"type": "ocr",
"title": "Sprite Shape Renderer",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Sprite Shape Renderer",
"i": 1
},
{
"t": "Color",
"i": 0
},
{
"t": "Mask Interaction",
"i": 0
},
{
"t": "None",
"i": 4
},
{
"t": "Fill Material",
"i": 0
},
{
"t": "• Sprites-Default",
"i": 4
},
{
"t": "Edge Material",
"i": 0
},
{
"t": "• Sprites-Default",
"i": 4
},
{
"t": "v Additional Settings",
"i": 0
},
{
"t": "Sorting Layer",
"i": 1
},
{
"t": "Default",
"i": 4
},
{
"t": "Order in Layer",
"i": 1
}
],
"cols": null,
"w": 801,
"h": 282
}
},
"4581e84d1756": {
"type": "ocr",
"title": "E iManager zD （ocript）",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "E iManager zD （ocript）",
"i": 0
},
{
"t": "IK Solvers",
"i": 0
},
{
"t": "List Is Empty",
"i": 0
},
{
"t": "Chain （CCD）",
"i": 4
},
{
"t": "1|",
"i": 3
},
{
"t": "Chain（FABRIK）",
"i": 4
},
{
"t": "•1",
"i": 3
},
{
"t": "weight",
"i": 0
},
{
"t": "Limb",
"i": 4
},
{
"t": "Restore Default Pose",
"i": 1
},
{
"t": "IK Solvers：IK解算器，在这里添加IK",
"i": 0
},
{
"t": "Chain（CCD）：可以自定义影响N个关节点，不能反向",
"i": 4
},
{
"t": "Weight：权重，当有多个IK控制同一点时权重会影响控制的百分比",
"i": 0
},
{
"t": "Chain（FABRIK）：可以自定义影响N个关节点，可以反问",
"i": 4
},
{
"t": "Restore Default Pose：回复默认位置",
"i": 0
},
{
"t": "Limb：只会影响3个关节点",
"i": 4
}
],
"cols": null,
"w": 976,
"h": 214
}
},
"4583c6e4ec34": {
"type": "ocr",
"title": "向量-向量 几何意义",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "向量-向量 几何意义",
"i": 0
},
{
"t": "两个向量相减得到一个新向量",
"i": 0
},
{
"t": "向量 - 向量= 向量",
"i": 0
},
{
"t": "A-B",
"i": 4
},
{
"t": "口诀：",
"i": 0
},
{
"t": "向量相减，头连头，尾指尾",
"i": 0
},
{
"t": "A- B= B头指A头",
"i": 0
}
],
"cols": null,
"w": 2647,
"h": 1215
}
},
"47080c9d84ec": {
"type": "ocr",
"title": "（Up",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "（Up",
"i": 4
},
{
"t": "States",
"i": 4
},
{
"t": "Blend Tree",
"i": 4
},
{
"t": "New State",
"i": 0
},
{
"t": "StateMachine",
"i": 4
},
{
"t": "New State",
"i": 4
},
{
"t": "New State O",
"i": 0
},
{
"t": "Exit",
"i": 4
},
{
"t": "执行完后 返回 到指定的状态机",
"i": 3
},
{
"t": "New State 1",
"i": 0
}
],
"cols": null,
"w": 1721,
"h": 504
}
},
"4aa7ee96e308": {
"type": "ocr",
"title": "Constant Force 2D",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Constant Force 2D",
"i": 1
},
{
"t": "Force",
"i": 0
},
{
"t": "XO",
"i": 3
},
{
"t": "Y",
"i": 4
},
{
"t": "0",
"i": 4
},
{
"t": "Relative Force",
"i": 0
},
{
"t": "X0",
"i": 3
},
{
"t": "Y",
"i": 4
},
{
"t": "0",
"i": 4
},
{
"t": "Torque",
"i": 0
},
{
"t": "0",
"i": 3
}
],
"cols": null,
"w": 720,
"h": 164
}
},
"4cda72feeb82": {
"type": "ocr",
"title": "Umage",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Umage",
"i": 3
},
{
"t": "7G Panel",
"i": 3
},
{
"t": "> Anchors",
"i": 4
},
{
"t": "⑦ Image",
"i": 3
},
{
"t": "X 0.5",
"i": 4
},
{
"t": "Y 0.5",
"i": 4
},
{
"t": "Pivot",
"i": 4
},
{
"t": "S Image （1）",
"i": 3
},
{
"t": "G Image （2）",
"i": 3
},
{
"t": "Rotation",
"i": 4
},
{
"t": "X",
"i": 4
},
{
"t": "Y",
"i": 4
},
{
"t": "G EventSystem",
"i": 3
},
{
"t": "Y1",
"i": 4
},
{
"t": "Scale",
"i": 4
},
{
"t": "X",
"i": 4
},
{
"t": "1",
"i": 4
},
{
"t": "Z",
"i": 4
},
{
"t": "1",
"i": 4
},
{
"t": "G player",
"i": 3
},
{
"t": "夕camera",
"i": 3
},
{
"t": "Canvas Renderer",
"i": 4
},
{
"t": "VImage",
"i": 4
},
{
"t": "Source Image",
"i": 4
},
{
"t": "口Background",
"i": 4
},
{
"t": "Color",
"i": 4
},
{
"t": "Material",
"i": 4
},
{
"t": "None （Material）",
"i": 4
},
{
"t": "Raycast Target",
"i": 4
},
{
"t": "• Raycast Padding",
"i": 4
},
{
"t": "Maskable",
"i": 4
},
{
"t": "Sliced",
"i": 4
},
{
"t": "Image Type",
"i": 4
},
{
"t": "Fill Center",
"i": 4
},
{
"t": "Pixels Per Unit Multip 1",
"i": 4
},
{
"t": "< Horizontal Layout Group",
"i": 4
},
{
"t": "V Padding",
"i": 4
},
{
"t": "Left",
"i": 4
},
{
"t": "0-",
"i": 0
},
{
"t": "Right",
"i": 4
},
{
"t": "Top",
"i": 4
},
{
"t": "Bottom",
"i": 4
},
{
"t": "Spacing",
"i": 4
},
{
"t": "Middle Center",
"i": 4
},
{
"t": "Child Alignment",
"i": 4
},
{
"t": "Reverse Arrangement",
"i": 4
},
{
"t": "Control Child Size",
"i": 4
},
{
"t": "Width",
"i": 4
},
{
"t": "Height",
"i": 4
},
{
"t": "Use Child Scale",
"i": 4
},
{
"t": "Width",
"i": 4
},
{
"t": "Height",
"i": 4
},
{
"t": "Child Force Expand",
"i": 4
},
{
"t": "Width",
"i": 4
},
{
"t": "< Height",
"i": 4
},
{
"t": "Default UI Material （Material）",
"i": 4
}
],
"cols": null,
"w": 1996,
"h": 931
}
},
"4cfc2c12ecf3": {
"type": "ocr",
"title": "# Scene",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "# Scene",
"i": 0
},
{
"t": "~ Animator",
"i": 1
},
{
"t": "Layers",
"i": 0
},
{
"t": "Parameters",
"i": 1
},
{
"t": "Base Layer",
"i": 2
},
{
"t": "IK女",
"i": 1
},
{
"t": "Base Layer",
"i": 0
},
{
"t": "Weight",
"i": 2
},
{
"t": "1",
"i": 4
},
{
"t": "Mask",
"i": 2
},
{
"t": "None （Avatar Mask）",
"i": 3
},
{
"t": "Blending",
"i": 2
},
{
"t": "Override",
"i": 3
},
{
"t": "Sync",
"i": 2
},
{
"t": "Timing",
"i": 4
},
{
"t": "IK Pass",
"i": 2
}
],
"cols": null,
"w": 661,
"h": 307
}
},
"4d25a807fd7b": {
"type": "ocr",
"title": "Emoji Fallback Support",
"data": {
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"Margins Left Top Right",
"Bottom"
],
[
"0 0 0",
"0"
],
[
"Geometry Sorting",
"Normal"
]
]
},
{
"h": "Emoji Fallback Support",
"rows": [
[
"Sprite Asset",
"None （TMP_Sprite Asset）"
],
[
"Style Sheet Asset",
"None （TMP._Style Sheet）"
],
[
"Font Features",
"kern"
]
]
}
],
"lines": null,
"cols": null,
"w": 699,
"h": 503
}
},
"4db09eaae47e": {
"type": "ocr",
"title": "Window Help",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Window Help",
"i": 0
},
{
"t": "Panels",
"i": 0
},
{
"t": "Next Window",
"i": 0
},
{
"t": "Ctrl+Tab",
"i": 3
},
{
"t": "Previous Window",
"i": 0
},
{
"t": "Ctrl+Shift+Tab",
"i": 3
},
{
"t": "1.5×",
"i": 4
},
{
"t": "Layouts",
"i": 0
},
{
"t": "Multiplayer",
"i": 0
},
{
"t": "Search",
"i": 0
},
{
"t": "Unity Version Control",
"i": 0
},
{
"t": "Asset Store",
"i": 0
},
{
"t": "My Assets",
"i": 0
},
{
"t": "Package Manager",
"i": 0
},
{
"t": "Text",
"i": 0
},
{
"t": "TextMeshPro",
"i": 0
},
{
"t": "Font Asset Creator",
"i": 4
},
{
"t": "Sprite Importer",
"i": 4
},
{
"t": "General",
"i": 0
}
],
"cols": null,
"w": 878,
"h": 575
}
},
"5212f5e48611": {
"type": "ocr",
"title": "2026/",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "2026/",
"i": 4
},
{
"t": "ScriptableObject.cs",
"i": 0
},
{
"t": "2026/",
"i": 4
},
{
"t": "| ScriptableObject.cs.meta",
"i": 0
}
],
"cols": null,
"w": 521,
"h": 94
}
},
"536a0fe8ae47": {
"type": "ocr",
"title": "Window Help",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Window Help",
"i": 0
},
{
"t": "Panels",
"i": 0
},
{
"t": "Next Window",
"i": 0
},
{
"t": "Ctrl+Tab",
"i": 2
},
{
"t": "Previous Window",
"i": 0
},
{
"t": "Ctrl+Shift+Tab",
"i": 2
},
{
"t": "- 1.5X",
"i": 3
},
{
"t": "Layouts",
"i": 0
},
{
"t": "Multiplayer",
"i": 0
},
{
"t": "Search",
"i": 0
},
{
"t": "Unity Version Control",
"i": 0
},
{
"t": "Asset Store",
"i": 0
},
{
"t": "My Assets",
"i": 0
},
{
"t": "Package Manager",
"i": 0
},
{
"t": "Text",
"i": 0
},
{
"t": "TextMeshPro",
"i": 0
},
{
"t": "Font Asset Creator",
"i": 3
},
{
"t": "Sprite Importer",
"i": 3
},
{
"t": "General",
"i": 0
},
{
"t": "Rendering",
"i": 0
},
{
"t": "Import TMP Essential Resources",
"i": 3
},
{
"t": "3",
"i": 4
},
{
"t": "Animation",
"i": 0
},
{
"t": "Import TMP Examples and Extras",
"i": 3
},
{
"t": "Audio",
"i": 0
},
{
"t": "Project Files GUID Remapping Tool",
"i": 3
},
{
"t": "Sequencing",
"i": 0
},
{
"t": "Project Text Spacing Conversion Tool",
"i": 3
},
{
"t": "Analysis",
"i": 0
}
],
"cols": null,
"w": 911,
"h": 762
}
},
"5475b6f7998a": {
"type": "ocr",
"title": "左横向",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "左横向",
"i": 4
},
{
"t": "竖屏",
"i": 2
},
{
"t": "竖屏",
"i": 0
},
{
"t": "倒放",
"i": 2
},
{
"t": "右横向",
"i": 4
}
],
"cols": null,
"w": 1400,
"h": 677
}
},
"559c43ceb040": {
"type": "ocr",
"title": "€30",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Q",
"i": 0
},
{
"t": "€30",
"i": 4
},
{
"t": "Resources_moved （De",
"i": 4
},
{
"t": "Assets",
"i": 0
},
{
"t": "AddressableAssetsData",
"i": 1
},
{
"t": "Addressable",
"i": 4
},
{
"t": "Resources",
"i": 1
},
{
"t": "已添加",
"i": 4
},
{
"t": "Resources moved",
"i": 1
},
{
"t": "t MyDataTest",
"i": 1
},
{
"t": "V",
"i": 0
},
{
"t": "Scenes",
"i": 1
}
],
"cols": null,
"w": 794,
"h": 174
}
},
"55a975480abb": {
"type": "ocr",
"title": "Dei",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Dei",
"i": 0
},
{
"t": "闪邃",
"i": 2
},
{
"t": "Add Component",
"i": 4
}
],
"cols": null,
"w": 283,
"h": 100
}
},
"577cb013bd44": {
"type": "ocr",
"title": ">litjson-0.17.0>src>",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": ">litjson-0.17.0>src>",
"i": 0
},
{
"t": "名称",
"i": 2
},
{
"t": "修改日期",
"i": 4
},
{
"t": "Litson",
"i": 2
},
{
"t": "2021/1/21 17:59",
"i": 4
}
],
"cols": null,
"w": 830,
"h": 206
}
},
"5ac8849a98ee": {
"type": "ocr",
"title": "Blend Tree",
"data": {
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"0 Inspector",
"& Navigation"
]
]
},
{
"h": "Blend Tree",
"rows": [
[
"Blend Type",
"1D"
],
[
"Parameter",
"Speed"
],
[
"Motion",
"Threshold"
],
[
"• HumanoldRun -1",
"-1"
],
[
"* HumanoidWalk -0.5",
"-1"
],
[
"• Humanoidldle 0",
"1"
],
[
"• HumanoldWalk",
"0.5"
],
[
"• HumanoidRun 1",
"1"
]
]
}
],
"lines": null,
"cols": null,
"w": 834,
"h": 522
}
},
"5aebaaa4f3a8": {
"type": "ocr",
"title": "6 Inspector / Statid",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "6 Inspector",
"i": 0
},
{
"t": "Player",
"i": 4
},
{
"t": "Tag",
"i": 3
},
{
"t": "Player",
"i": 4
},
{
"t": "Prefab",
"i": 1
},
{
"t": "Open",
"i": 4
},
{
"t": "Transfo",
"i": 4
},
{
"t": "（Script」",
"i": 4
},
{
"t": "SpriteR",
"i": 4
},
{
"t": "Animatd",
"i": 4
},
{
"t": "Rigidbo",
"i": 4
},
{
"t": "< Audio S",
"i": 3
},
{
"t": "7W司",
"i": 0
}
],
"title": "6 Inspector"
},
{
"kind": "lines",
"lines": [
{
"t": "Statid",
"i": 4
},
{
"t": "Layer",
"i": 1
},
{
"t": "0: Default",
"i": 0
},
{
"t": "1:TransparentFX",
"i": 0
},
{
"t": "2: Ignore Raycast",
"i": 0
},
{
"t": "4: Water",
"i": 0
},
{
"t": "5: UI",
"i": 0
},
{
"t": "8:Player",
"i": 0
},
{
"t": "Add Layer..",
"i": 0
}
],
"title": "Statid"
}
],
"w": 264,
"h": 240
}
},
"5bfb5fb1f106": {
"type": "ocr",
"title": "K Off Mesh Link",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "K Off Mesh Link",
"i": 0
},
{
"t": "A Start 2 （Transform）",
"i": 4
},
{
"t": "Start",
"i": 0
},
{
"t": "End",
"i": 0
},
{
"t": "- End2 （uransform）",
"i": 4
},
{
"t": "Cost Override",
"i": 0
},
{
"t": "BI Directional",
"i": 0
},
{
"t": "Activated",
"i": 0
},
{
"t": "Auto Update Positions",
"i": 0
},
{
"t": "Walkable",
"i": 4
},
{
"t": "Navigation Area",
"i": 0
}
],
"cols": null,
"w": 393,
"h": 168
}
},
"5d45bd2215a5": {
"type": "ocr",
"title": "a Sprite Assets",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "a Sprite Assets",
"i": 0
},
{
"t": "印 Style Shee",
"i": 0
},
{
"t": "Create",
"i": 1
},
{
"t": "Folder",
"i": 4
},
{
"t": "8 Defal",
"i": 1
},
{
"t": "LineBreaki",
"i": 1
},
{
"t": "Show in Explorer",
"i": 1
},
{
"t": "Material",
"i": 4
},
{
"t": "LineBreaki",
"i": 1
},
{
"t": "Open",
"i": 1
},
{
"t": "MonoBehaviour Script",
"i": 4
},
{
"t": "S TMP Setti",
"i": 0
},
{
"t": "Delete",
"i": 1
},
{
"t": "Prefab Variant",
"i": 4
},
{
"t": "Shaders",
"i": 0
},
{
"t": "4 Sprites",
"i": 0
},
{
"t": "Rename",
"i": 1
},
{
"t": "2D",
"i": 4
},
{
"t": "Tree_Textures",
"i": 0
},
{
"t": "Copy Path",
"i": 1
},
{
"t": "Alt+Ctrl+C",
"i": 3
},
{
"t": "Tutoriallnfo",
"i": 0
},
{
"t": "Animation",
"i": 4
},
{
"t": "InputSystem_Action：",
"i": 0
},
{
"t": "Open Scene Additive",
"i": 1
},
{
"t": "Audio",
"i": 4
},
{
"t": "New Animator Contr",
"i": 0
},
{
"t": "New Animator Overn",
"i": 0
},
{
"t": "Rendering",
"i": 4
},
{
"t": "View in Package Manager",
"i": 1
},
{
"t": "NewMonoBehaviour",
"i": 0
},
{
"t": "Scene",
"i": 4
},
{
"t": "G0",
"i": 0
},
{
"t": "Readme",
"i": 0
},
{
"t": "Import New Asset...",
"i": 1
},
{
"t": "Tree",
"i": 0
},
{
"t": "Scripting",
"i": 4
},
{
"t": "Packages",
"i": 0
},
{
"t": "Import Package",
"i": 1
},
{
"t": "Search",
"i": 4
},
{
"t": "Export Package.",
"i": 1
},
{
"t": "Shader",
"i": 4
},
{
"t": "Find References In Scene",
"i": 1
},
{
"t": "Shader Graph",
"i": 4
},
{
"t": "Find References In Project",
"i": 1
},
{
"t": "Testing",
"i": 4
},
{
"t": "Select Dependencies",
"i": 1
},
{
"t": "Terrain",
"i": 4
},
{
"t": "Text Core",
"i": 4
},
{
"t": "Refresh",
"i": 1
},
{
"t": "Ctrl+R",
"i": 3
},
{
"t": "TextMeshPro",
"i": 4
},
{
"t": "Font Asset",
"i": 4
},
{
"t": "Reimport",
"i": 1
},
{
"t": "Timeline",
"i": 4
},
{
"t": "Sprite Asset",
"i": 4
},
{
"t": "Reimport All",
"i": 1
},
{
"t": "UI Toolkit",
"i": 4
},
{
"t": "Style Sheet",
"i": 4
},
{
"t": "Extract From Prefab",
"i": 1
},
{
"t": "Visual Scripting",
"i": 4
},
{
"t": "Color Gradient",
"i": 4
},
{
"t": "Unity Version Control",
"i": 1
},
{
"t": "Physics Material",
"i": 4
},
{
"t": "GUl Skin",
"i": 4
},
{
"t": "Update UXML Schema",
"i": 1
},
{
"t": "Custom Font",
"i": 4
},
{
"t": "Open C# Project",
"i": 1
},
{
"t": "Input Actions",
"i": 4
},
{
"t": "View in Import Activity Window",
"i": 1
},
{
"t": "Properties..",
"i": 1
},
{
"t": "Alt+P",
"i": 3
}
],
"cols": null,
"w": 1366,
"h": 1001
}
},
"5e9eb92f227b": {
"type": "ocr",
"title": "N6 Addressables Groups",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "N6 Addressables Groups",
"i": 0
},
{
"t": "Addressables Groups",
"i": 0
},
{
"t": "Create Addressables Settings",
"i": 4
},
{
"t": "Click the \"Create\" button above or simply drag an asset",
"i": 2
},
{
"t": "into this window to start using Addressables. Once you",
"i": 2
},
{
"t": "begin, the Addressables system will save some assets",
"i": 2
},
{
"t": "to your project to keep up with its data",
"i": 2
}
],
"cols": null,
"w": 626,
"h": 589
}
},
"5f847c1fb973": {
"type": "ocr",
"title": "Rigidbody 2D",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Rigidbody 2D",
"i": 1
},
{
"t": "Body Type",
"i": 0
},
{
"t": "Dynamic",
"i": 4
},
{
"t": "None （Physics Material 2D）",
"i": 4
},
{
"t": "Material",
"i": 0
},
{
"t": "Simulated",
"i": 0
},
{
"t": "Use Auto Mass",
"i": 0
},
{
"t": "Mass",
"i": 0
},
{
"t": "1",
"i": 4
}
],
"cols": null,
"w": 704,
"h": 208
}
},
"602841de3bae": {
"type": "ocr",
"title": "②芷女",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "②芷女",
"i": 4
},
{
"t": "MyCustom1",
"i": 0
},
{
"t": "Open",
"i": 4
},
{
"t": "Friction",
"i": 0
},
{
"t": "Bounciness",
"i": 0
},
{
"t": "0.5",
"i": 2
}
],
"cols": null,
"w": 734,
"h": 152
}
},
"60aef664ce0e": {
"type": "ocr",
"title": "九宫格（UI）适配示意图",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "九宫格（UI）适配示意图",
"i": 2
},
{
"t": "屏幕九宫格（整体区域）",
"i": 0
},
{
"t": "按钮区域九宫格（控件空间）",
"i": 3
},
{
"t": "九官格就是将屏幕分成 9个部分",
"i": 0
},
{
"t": "左、右、上、下、中",
"i": 0
},
{
"t": "控件",
"i": 3
},
{
"t": "控件",
"i": 4
},
{
"t": "控件",
"i": 4
},
{
"t": "左上、右上、左下、右下",
"i": 0
},
{
"t": "-CW/2,0",
"i": 4
},
{
"t": "-cW,O",
"i": 4
},
{
"t": "0,0",
"i": 3
},
{
"t": "毎一个部分都有一个相对UI屏幕原点的原点—是通过屏幕宽w和高h计算出来的",
"i": 0
},
{
"t": "控件",
"i": 3
},
{
"t": "控件",
"i": 4
},
{
"t": "控件",
"i": 4
},
{
"t": "0,0",
"i": 0
},
{
"t": "0，-ch/2",
"i": 3
},
{
"t": "-CW/2，-ch/2",
"i": 4
},
{
"t": "-cw，-ch/2",
"i": 4
},
{
"t": "左上",
"i": 1
},
{
"t": "右上",
"i": 2
},
{
"t": "0,0",
"i": 1
},
{
"t": "w/2,0",
"i": 1
},
{
"t": "w,O",
"i": 2
},
{
"t": "控件",
"i": 3
},
{
"t": "控件",
"i": 4
},
{
"t": "控件",
"i": 4
},
{
"t": "0，-ch",
"i": 3
},
{
"t": "-cw/2，-ch",
"i": 4
},
{
"t": "-cW，-Ch",
"i": 4
},
{
"t": "h",
"i": 3
},
{
"t": "w/2,h/2",
"i": 1
},
{
"t": "w.h/2",
"i": 2
},
{
"t": "0,h/2",
"i": 1
},
{
"t": "3",
"i": 3
},
{
"t": "按钮区域九宫格实际布局示例",
"i": 3
},
{
"t": "×：0,y:0",
"i": 3
},
{
"t": "左下",
"i": 1
},
{
"t": "右下",
"i": 2
},
{
"t": "0,h",
"i": 1
},
{
"t": "w/2,h",
"i": 1
},
{
"t": "w,h",
"i": 2
},
{
"t": "控件件",
"i": 4
},
{
"t": "-cw，-ch2，-ch",
"i": 4
},
{
"t": "-cw，-ch/2，-ch/2",
"i": 4
},
{
"t": "分辨率自适应就是当分辨率改变时重新计算UI控件的位置",
"i": 1
},
{
"t": "控件坐标计算公式：相对屏幕位置＋中心点偏移位置＋偏移位置",
"i": 0
},
{
"t": "偏移位置",
"i": 3
},
{
"t": "控件坐标计算公式",
"i": 0
},
{
"t": "相对屏幕位置",
"i": 1
},
{
"t": "中心点偏移位置",
"i": 2
},
{
"t": "图例说明：",
"i": 0
},
{
"t": "四角区域（不缩放）",
"i": 1
},
{
"t": "边缘区域（单向拉伸）",
"i": 1
},
{
"t": "中心区域（双向拉伸）",
"i": 2
},
{
"t": "• 九宫格分割点/原点",
"i": 3
},
{
"t": "w： 屏幕宽度 h：屏幕高度",
"i": 3
},
{
"t": "ch：控件高度",
"i": 4
},
{
"t": "cw：控件宽度",
"i": 4
}
],
"cols": null,
"w": 1400,
"h": 788
}
},
"60d9eb204bb2": {
"type": "ocr",
"title": "archy",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "archy",
"i": 0
},
{
"t": "口 Project",
"i": 1
},
{
"t": "0 Inspector",
"i": 2
},
{
"t": "©27",
"i": 2
},
{
"t": "My Data Test （My Data）",
"i": 2
},
{
"t": "SampleScene*",
"i": 0
},
{
"t": "Assets",
"i": 1
},
{
"t": "Op",
"i": 4
},
{
"t": "了 Main Camera",
"i": 0
},
{
"t": "Resources",
"i": 1
},
{
"t": "已添加",
"i": 2
},
{
"t": "G Directional Light",
"i": 0
},
{
"t": "签入",
"i": 4
},
{
"t": "Font&Materials",
"i": 1
},
{
"t": "Y Global Volume",
"i": 0
},
{
"t": "Cube",
"i": 1
},
{
"t": "G Grid",
"i": 0
},
{
"t": "MnanaData",
"i": 1
},
{
"t": "Script",
"i": 2
},
{
"t": "Cube",
"i": 0
},
{
"t": "MyDataTest",
"i": 1
},
{
"t": "M Canvas",
"i": 0
},
{
"t": "I",
"i": 2
},
{
"t": "3",
"i": 3
},
{
"t": "New Materlal",
"i": 1
},
{
"t": "G EventSystem",
"i": 0
},
{
"t": "ScriptableObject",
"i": 1
},
{
"t": "F",
"i": 2
},
{
"t": "Y GameObject",
"i": 0
},
{
"t": "ScriptableObjectTwo",
"i": 1
},
{
"t": "B",
"i": 2
},
{
"t": "y GameObject （1）",
"i": 0
},
{
"t": "Temp",
"i": 1
},
{
"t": "Obj",
"i": 2
},
{
"t": "Cube",
"i": 3
},
{
"t": "G Temp",
"i": 0
},
{
"t": "Scenes",
"i": 1
},
{
"t": "M",
"i": 2
},
{
"t": "Settings",
"i": 1
},
{
"t": "New Material",
"i": 4
},
{
"t": "TextMesh Pro",
"i": 1
},
{
"t": "Audio Clip",
"i": 2
},
{
"t": "None （Audio Clip）",
"i": 3
},
{
"t": "Examples & Extras",
"i": 1
},
{
"t": "Video Clip",
"i": 2
},
{
"t": "None （Video Clip）",
"i": 3
},
{
"t": "Fonts",
"i": 1
},
{
"t": "Resources",
"i": 1
},
{
"t": "Fonte &. Matariac",
"i": 2
}
],
"cols": null,
"w": 1430,
"h": 474
}
},
"610b3aa678fd": {
"type": "ocr",
"title": "权重决定叠加的比例",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Weight： 权重，当动画同时播放时，如果选择的是叠加状态，会根据",
"i": 3
},
{
"t": "权重决定叠加的比例",
"i": 3
},
{
"t": "Mask：动画遮罩，该层动画全部都会受该遮罩的影响",
"i": 3
},
{
"t": "Blending",
"i": 3
},
{
"t": "Overnide",
"i": 4
},
{
"t": "Sync",
"i": 3
},
{
"t": "Override",
"i": 4
},
{
"t": "K Pass",
"i": 4
},
{
"t": "Additive",
"i": 4
},
{
"t": "Weight",
"i": 0
},
{
"t": "0",
"i": 2
},
{
"t": "Blending：混合方式",
"i": 3
},
{
"t": "Mask",
"i": 0
},
{
"t": "*None （AvatarMask）",
"i": 1
},
{
"t": "Blending",
"i": 0
},
{
"t": "Override",
"i": 1
},
{
"t": "Override：覆盖方式，播放该层动画时忽略其他层信息",
"i": 3
},
{
"t": "Additive：叠加方式，会和其它层动画叠加播放",
"i": 3
},
{
"t": "Sync",
"i": 0
},
{
"t": "Timing",
"i": 1
},
{
"t": "IK Pass",
"i": 0
},
{
"t": "Timing",
"i": 4
},
{
"t": "Sync",
"i": 3
},
{
"t": "Base Layer",
"i": 4
},
{
"t": "Source Layer",
"i": 3
},
{
"t": "Sync： 是否同步其它层",
"i": 3
},
{
"t": "主要用于直接从另一个层复制状态过来，在该层中进行修改",
"i": 3
},
{
"t": "适用于比如正常状态下有待机走路跑步等等动作，但是受伤状态下动作",
"i": 3
},
{
"t": "会改变，可以利用同步层方便我们进行编辑",
"i": 3
},
{
"t": "选择后会多一个Source Layer表示你要复制哪一层的状态",
"i": 3
},
{
"t": "Timing：当选中Sync同步其它层时，该参数激活",
"i": 3
},
{
"t": "选中，会采用折中方案调整同步层上的动画时长（基于权重计算）",
"i": 3
},
{
"t": "不选中，动画时长将使用原始层做为母版",
"i": 3
},
{
"t": "IK Pass：反向动力学，之后讲解IK的时候再讲解",
"i": 3
}
],
"cols": null,
"w": 1171,
"h": 715
}
},
"6373625ddb0d": {
"type": "ocr",
"title": "Imagev",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Imagev",
"i": 0
},
{
"t": "Image",
"i": 4
},
{
"t": "Default UI Material",
"i": 4
},
{
"t": "Layout Properties",
"i": 3
}
],
"cols": null,
"w": 381,
"h": 226
}
},
"6398fb2df721": {
"type": "ocr",
"title": "HumanoidRun / 30FPS",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "HumanoidRun",
"i": 1
},
{
"t": "动画剪辑名称",
"i": 0
},
{
"t": "可编辑修改",
"i": 0
},
{
"t": "Length",
"i": 0
},
{
"t": "0.593",
"i": 1
},
{
"t": "•一.110:00月.网",
"i": 4
},
{
"t": "Start",
"i": 0
},
{
"t": "335.",
"i": 2
},
{
"t": "时间轴",
"i": 0
},
{
"t": "Start动画剪辑的开始帧",
"i": 0
},
{
"t": "End动画剪辑的结束帧",
"i": 0
},
{
"t": "我们可以在时间轴中定义每个动画剪辑的帧范围",
"i": 0
},
{
"t": "Loop Time",
"i": 0
},
{
"t": "Loop Pose",
"i": 1
},
{
"t": "Cycle Oliset",
"i": 1
},
{
"t": "Root Transform Rotation",
"i": 0
},
{
"t": "Bake Into Pose",
"i": 1
},
{
"t": "Body Orientation",
"i": 4
},
{
"t": "Based Upon",
"i": 1
},
{
"t": "Offset",
"i": 1
},
{
"t": "-1.2",
"i": 4
},
{
"t": "Root Transform Position （Y）",
"i": 0
},
{
"t": "Bake Into Pose",
"i": 1
},
{
"t": "Based Upon （at Start）",
"i": 1
},
{
"t": "Feet",
"i": 4
},
{
"t": "Offset",
"i": 1
},
{
"t": "Root Transform Position （XZ）",
"i": 0
},
{
"t": "Bake Into Pose",
"i": 1
},
{
"t": "Based Upon",
"i": 1
},
{
"t": "Center of Mass",
"i": 4
},
{
"t": "Mirror",
"i": 0
},
{
"t": "Additive Reference Pose",
"i": 0
},
{
"t": "Pose Frame",
"i": 1
},
{
"t": "88",
"i": 4
},
{
"t": "Average Velocity： （0,000, 0,000, 5.662）",
"i": 0
},
{
"t": "Average Angular Y Speed: 0.0 deg/s",
"i": 0
}
],
"title": "HumanoidRun"
},
{
"kind": "lines",
"lines": [
{
"t": "30FPS",
"i": 0
},
{
"t": "End|",
"i": 0
},
{
"t": "353.",
"i": 0
},
{
"t": "Loop Pose：无缝循环运动",
"i": 4
},
{
"t": "Loop Match：循环匹配",
"i": 4
},
{
"t": "Loop Time：播放动画剪辑时是否循环播放，到结尾时",
"i": 1
},
{
"t": "重新开始",
"i": 1
},
{
"t": "Cycle Offset：循环动画在其他时间开始时的周期偏移",
"i": 4
},
{
"t": "Bake Into Pose：将根旋转烘焙到骨骼移动，禁用此选",
"i": 3
},
{
"t": "项将存储为根运动",
"i": 3
},
{
"t": "loop match",
"i": 0
},
{
"t": "Based Upon：根旋转的基础",
"i": 3
},
{
"t": "loop match C",
"i": 0
},
{
"t": "Original：保持源文件中的原始旋转",
"i": 3
},
{
"t": "Root Transform Rotation：根位置的角度相关",
"i": 1
},
{
"t": "Root Node Rotation： 使用根节点的旋转（仅适用",
"i": 3
},
{
"t": "Generic通用动画类型）",
"i": 3
},
{
"t": "Body Orientation：保持上半身潮前（仅适用于",
"i": 3
},
{
"t": "Humanoid人形动画状型）",
"i": 3
},
{
"t": "loop match",
"i": 0
},
{
"t": "Offset：根旋转编移（单位：度）",
"i": 3
},
{
"t": "Bake Into Pose：将垂直根运动烘焙到骨骼移动。禁用",
"i": 4
},
{
"t": "此选项将会存储为根运动",
"i": 4
},
{
"t": "loop match C",
"i": 0
},
{
"t": "Based Upon （at Start） ：垂直方向根位置的基础",
"i": 4
},
{
"t": "Original：保持源文件中的垂直位置",
"i": 4
},
{
"t": "Root Transform Position （Y）：根垂直位置（Y轴方",
"i": 1
},
{
"t": "Root Node Position：使用垂直根位置（仅适用Generic",
"i": 4
},
{
"t": "向）",
"i": 1
},
{
"t": "通用动画类型）",
"i": 3
},
{
"t": "Center Of Mass：保持质心与根位置对其（仅适用",
"i": 4
},
{
"t": "Humanoid人形动画类型）",
"i": 4
},
{
"t": "Feet：保持双脚与根变换位置对齐（仅适用Humanoid",
"i": 4
},
{
"t": "人形动画类型）",
"i": 4
},
{
"t": "Offset：垂直根位置偏移",
"i": 4
},
{
"t": "Bake Into Pose：将水平根运动烘焙到骨骼移动。禁用",
"i": 4
},
{
"t": "此选项将会存储为根运动",
"i": 4
},
{
"t": "Based Upon：水平根位置的基础",
"i": 4
},
{
"t": "Root Transform Position （XZ）：根水平位置（XZ平",
"i": 1
},
{
"t": "面）",
"i": 1
},
{
"t": "Original：保持源文件中的水平位置",
"i": 4
},
{
"t": "Root Node Position：使用水平根位置（仅适用Generic",
"i": 4
},
{
"t": "通用动画类型）",
"i": 4
},
{
"t": "Center Of Mass：保持与根位置对其（仅适用",
"i": 4
},
{
"t": "Humanoid人形动画类型）",
"i": 4
},
{
"t": "Mirror： 在此剪辑中进行左右镜像（仅Humanoid人形",
"i": 1
},
{
"t": "动画类型才显示）",
"i": 1
},
{
"t": "Additive Reference Pose：启用后可以设置附加动画层",
"i": 1
},
{
"t": "基础参考姿势的帧。在时间轴中可以看到蓝色标记",
"i": 1
},
{
"t": "附加动画层：在动画控制器（状态机）中可以添加新的动",
"i": 1
},
{
"t": "画层",
"i": 1
},
{
"t": "Pose Frame：当启用参考姿势帧时，该项就是选择的具",
"i": 1
},
{
"t": "体是哪一帧",
"i": 1
}
],
"title": "30FPS"
}
],
"w": 1400,
"h": 1317
}
},
"6649ad1a8ef7": {
"type": "ocr",
"title": "Character Controller",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Unity Character Controller Parameter Visual Guide",
"i": 0
},
{
"t": "Character Controller",
"i": 0
},
{
"t": "Slope > 45°；",
"i": 4
},
{
"t": "Slope < 45%：",
"i": 3
},
{
"t": "Step Offset",
"i": 4
},
{
"t": "Can Climb",
"i": 3
},
{
"t": "Blocked",
"i": 4
},
{
"t": "Slope Limit",
"i": 0
},
{
"t": "45",
"i": 1
},
{
"t": "坡度度数限制，大于该值的斜坡上不去",
"i": 2
},
{
"t": "台阶偏移值，单位为米，低于这才上去，",
"i": 2
},
{
"t": "0.3",
"i": 1
},
{
"t": "1oam",
"i": 4
},
{
"t": "Step Offset",
"i": 0
},
{
"t": "该值不能大于角色控制器的高度",
"i": 2
},
{
"t": "30°",
"i": 3
},
{
"t": "60°",
"i": 4
},
{
"t": "Slope <45°：",
"i": 3
},
{
"t": "Slope > 45%：",
"i": 4
},
{
"t": "皮肤偏宽度，两个碰撞体可以穿透彼",
"i": 2
},
{
"t": "Can Climb",
"i": 3
},
{
"t": "Blocked",
"i": 4
},
{
"t": "Step < 0.3mB",
"i": 4
},
{
"t": "此最大的皮肤宽度，较大的值可以减少",
"i": 2
},
{
"t": "Skin Width",
"i": 0
},
{
"t": "0.08",
"i": 1
},
{
"t": "少料动，较小的值可能导致角色十佳，",
"i": 2
},
{
"t": "Can Step Up",
"i": 4
},
{
"t": "Skin Width -",
"i": 3
},
{
"t": "建议设置为半径的10%",
"i": 1
},
{
"t": "0.08",
"i": 3
},
{
"t": "Min Move Distance",
"i": 4
},
{
"t": "最小移动距离，大多数情況下为0。",
"i": 2
},
{
"t": "Allows Slight",
"i": 3
},
{
"t": "0.001",
"i": 1
},
{
"t": "Min Move Distance",
"i": 0
},
{
"t": "可以用減少抖动",
"i": 2
},
{
"t": "Penetration to",
"i": 3
},
{
"t": "｛/",
"i": 3
},
{
"t": "Prevent Jitter",
"i": 3
},
{
"t": "Side",
"i": 4
},
{
"t": "Front",
"i": 4
},
{
"t": "角色控制器的中心点",
"i": 2
},
{
"t": "Center",
"i": 0
},
{
"t": "X",
"i": 1
},
{
"t": "Z0",
"i": 2
},
{
"t": "0",
"i": 1
},
{
"t": "Y",
"i": 1
},
{
"t": "O",
"i": 1
},
{
"t": "位置（狙对于物侍原点）",
"i": 2
},
{
"t": "Radius",
"i": 0
},
{
"t": "0.5",
"i": 1
},
{
"t": "角色按制器的半径（胶裹体的半径）",
"i": 2
},
{
"t": "Height",
"i": 4
},
{
"t": "Height",
"i": 0
},
{
"t": "2",
"i": 1
},
{
"t": "角色控制器的高度（胶裹体的高废）",
"i": 2
},
{
"t": "Min Move",
"i": 3
},
{
"t": "Distance",
"i": 3
},
{
"t": "Center",
"i": 4
},
{
"t": "0.5（X=0,Y=0,Z=0）",
"i": 4
}
],
"cols": null,
"w": 1400,
"h": 787
}
},
"66763c9fe044": {
"type": "ocr",
"title": "G6 Project Settings / Settings",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "G6 Project Settings",
"i": 1
},
{
"t": "中 Project Settings",
"i": 1
},
{
"t": "Adaptive Performance",
"i": 2
},
{
"t": "Audio",
"i": 2
},
{
"t": "Burst AOT Settings",
"i": 2
},
{
"t": "Editor",
"i": 2
},
{
"t": "Graphics",
"i": 2
},
{
"t": "Input Manager",
"i": 2
},
{
"t": "v Input System Package",
"i": 0
},
{
"t": "Settings",
"i": 4
},
{
"t": "Memory Settings",
"i": 2
},
{
"t": "Package Manager",
"i": 2
},
{
"t": "v Physics",
"i": 0
},
{
"t": "Settings",
"i": 3
},
{
"t": "Physics 2D",
"i": 2
},
{
"t": "Player",
"i": 2
},
{
"t": "Preset Manager",
"i": 2
},
{
"t": "Quality",
"i": 2
},
{
"t": "Scene Template",
"i": 2
},
{
"t": "Script Execution Order",
"i": 2
},
{
"t": "Services",
"i": 2
},
{
"t": "ShaderGraph",
"i": 2
},
{
"t": "Tags and Layers",
"i": 2
},
{
"t": "v TextMesh Pro",
"i": 0
},
{
"t": "Settings",
"i": 3
},
{
"t": "Time",
"i": 2
},
{
"t": "Timeline",
"i": 2
},
{
"t": "UI Toolkit",
"i": 2
},
{
"t": "Version Control",
"i": 2
},
{
"t": "Visual Scripting",
"i": 2
},
{
"t": "XR Plugin Management",
"i": 2
}
],
"title": "G6 Project Settings"
},
{
"kind": "lines",
"lines": [
{
"t": "Settings",
"i": 0
},
{
"t": "Default Font Asset",
"i": 0
},
{
"t": "Default Font Asset",
"i": 0
},
{
"t": "ELiberationSans SDF （TMP_Font Asset）",
"i": 3
},
{
"t": "Resources/",
"i": 1
},
{
"t": "Path：",
"i": 0
},
{
"t": "Fonts & Materials/",
"i": 3
},
{
"t": "Fallback Font Assets",
"i": 0
},
{
"t": "Font Asset List",
"i": 0
},
{
"t": "List is Empty",
"i": 0
},
{
"t": "Fallback Material Settings",
"i": 0
},
{
"t": "Match Material Presets",
"i": 0
},
{
"t": "Hide Sub Text Objects",
"i": 0
},
{
"t": "Dynamic Font System Settings",
"i": 0
},
{
"t": "Missing Character Unicode",
"i": 0
},
{
"t": "Disable warnings",
"i": 0
},
{
"t": "Get Font Features at Runtime",
"i": 0
},
{
"t": "Clear Dynamic Data On Build",
"i": 0
},
{
"t": "Text Container Default Settings",
"i": 0
},
{
"t": "TextMeshPro",
"i": 0
},
{
"t": "X",
"i": 3
},
{
"t": "20",
"i": 3
},
{
"t": "5",
"i": 4
},
{
"t": "TextMeshPro UI",
"i": 0
},
{
"t": "X",
"i": 3
},
{
"t": "200",
"i": 3
},
{
"t": "Y",
"i": 4
},
{
"t": "50",
"i": 4
},
{
"t": "Enable Raycast Target",
"i": 0
},
{
"t": "Auto Size Text Container",
"i": 0
},
{
"t": "Is Object Scale Static",
"i": 0
},
{
"t": "Text Component Default Settings",
"i": 0
},
{
"t": "Default Font Size",
"i": 0
},
{
"t": "36",
"i": 3
},
{
"t": "Text Auto Size Ratios",
"i": 0
},
{
"t": "Max",
"i": 4
},
{
"t": "Min",
"i": 3
},
{
"t": "0.5",
"i": 3
},
{
"t": "2",
"i": 4
},
{
"t": "Text Wrapping Mode",
"i": 0
},
{
"t": "Normal",
"i": 3
},
{
"t": "Font Features",
"i": 0
},
{
"t": "kern.",
"i": 3
},
{
"t": "Extra Padding",
"i": 0
},
{
"t": "Tint All Sprites",
"i": 0
},
{
"t": "Parse Escape Sequence",
"i": 0
},
{
"t": "Default Sprite Asset",
"i": 0
},
{
"t": "Default Sprite Asset",
"i": 0
},
{
"t": "SEmojiOne （TMP_Sprite Asset）",
"i": 3
},
{
"t": "Missing Sprite Unicode",
"i": 0
},
{
"t": "iOS Emoji Support",
"i": 0
},
{
"t": "Path：",
"i": 0
},
{
"t": "Resources/",
"i": 1
},
{
"t": "Sprite Assets/",
"i": 3
},
{
"t": "Fallback Emoji Text Assets",
"i": 0
},
{
"t": "Text Asset List",
"i": 0
},
{
"t": "List is Empty",
"i": 0
},
{
"t": "十-",
"i": 4
},
{
"t": "Default Style Sheet",
"i": 0
},
{
"t": "Default Style Sheet",
"i": 0
},
{
"t": "S Default Style Sheet （TMP_Style Sheet）",
"i": 3
},
{
"t": "Path：",
"i": 0
},
{
"t": "Resources/",
"i": 1
},
{
"t": "Color Gradient Presets",
"i": 0
},
{
"t": "Path：",
"i": 0
},
{
"t": "Resources/",
"i": 1
},
{
"t": "Color Gradient Presets/",
"i": 3
},
{
"t": "Line Breaking for Asian languages",
"i": 0
},
{
"t": "Leading Characters",
"i": 0
},
{
"t": "日LineBreaking Leading Characters",
"i": 3
},
{
"t": "Following Characters",
"i": 0
},
{
"t": "DLineBreaking Following Characters",
"i": 3
},
{
"t": "Korean Language Options",
"i": 0
},
{
"t": "Use Modern Line Breaking",
"i": 0
}
],
"title": "Settings"
}
],
"w": 861,
"h": 1400
}
},
"6736ef5e3251": {
"type": "ocr",
"title": "Vertical Mapping / Character",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "Vertical Mapping",
"i": 0
},
{
"t": "Extra Settings",
"i": 0
},
{
"t": "Margins",
"i": 0
},
{
"t": "Geometry Sorting",
"i": 0
},
{
"t": "Is Scale Static",
"i": 0
},
{
"t": "Rich Text",
"i": 0
},
{
"t": "Raycast Target",
"i": 0
},
{
"t": "Maskable",
"i": 0
},
{
"t": "Parse Escape Characters",
"i": 0
},
{
"t": "Visible Descender",
"i": 0
},
{
"t": "Emoji Fallback Support",
"i": 0
},
{
"t": "Sprite Asset",
"i": 0
},
{
"t": "Style Sheet Asset",
"i": 0
},
{
"t": "Font Features",
"i": 0
},
{
"t": "Extra Padding",
"i": 0
}
],
"title": "Vertical Mapping"
},
{
"kind": "lines",
"lines": [
{
"t": "Character",
"i": 0
},
{
"t": "（Click to collapse）",
"i": 4
},
{
"t": "Left",
"i": 0
},
{
"t": "Top",
"i": 2
},
{
"t": "Right",
"i": 3
},
{
"t": "Bottom",
"i": 4
},
{
"t": "0",
"i": 2
},
{
"t": "0",
"i": 3
},
{
"t": "Normal",
"i": 0
},
{
"t": "None （TMP_Sprite Asset）",
"i": 0
},
{
"t": "None （TMP_Style Sheet）",
"i": 0
},
{
"t": "kern",
"i": 0
}
],
"title": "Character"
}
],
"w": 872,
"h": 602
}
},
"6777d82d1063": {
"type": "ocr",
"title": "Curve",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Curve",
"i": 3
},
{
"t": "-997,1.0316",
"i": 4
},
{
"t": "Curves",
"i": 0
},
{
"t": "⑦ Curve",
"i": 0
},
{
"t": "KM 1,000",
"i": 0
},
{
"t": "© Curve",
"i": 0
},
{
"t": "KM",
"i": 0
},
{
"t": "0.000",
"i": 0
},
{
"t": "曲线可以配合Animator作为参数，",
"i": 0
},
{
"t": "通过加入曲线佳可以利用他标记重要的点",
"i": 1
},
{
"t": "曲线中的X轴代表标准化时间（0~1）代表动画的开始和结尾",
"i": 3
},
{
"t": "可以修政田线的名字，名字就类似参没名",
"i": 0
},
{
"t": "Y轴的佳可以根据需求自己设置",
"i": 3
},
{
"t": "可以通过加减来添加或删除曲线信息",
"i": 0
},
{
"t": "也可以使用下方提供的预设曲线",
"i": 3
},
{
"t": "TEvents",
"i": 0
},
{
"t": "1o:go-",
"i": 0
},
{
"t": "10.17.1",
"i": 1
},
{
"t": "10331.19501.019:82.1",
"i": 1
},
{
"t": "10:83",
"i": 2
},
{
"t": "11:00",
"i": 2
},
{
"t": "Function",
"i": 0
},
{
"t": "Float",
"i": 0
},
{
"t": "String",
"i": 0
},
{
"t": "Object",
"i": 0
},
{
"t": "n None （Object）",
"i": 1
},
{
"t": "动画事件",
"i": 0
},
{
"t": "类似之前我们学习的Animation窗口中的动画事件",
"i": 0
},
{
"t": "可以在这里为动画剪辑添加一个事件，当动画播放到事件处时会自动找对象脚本中的同名函数",
"i": 0
},
{
"t": "当我们希望在动画某一时刻进行逻辑处理时非常常用",
"i": 0
},
{
"t": "比如某一时刻进行伤害判断",
"i": 0
},
{
"t": "Mask",
"i": 0
},
{
"t": "Definition",
"i": 0
},
{
"t": "Create FromThis Model",
"i": 1
},
{
"t": "v Humanoid",
"i": 0
},
{
"t": "•IK",
"i": 1
},
{
"t": "v Transform",
"i": 0
},
{
"t": "Use | Node Name",
"i": 0
},
{
"t": "THips",
"i": 0
},
{
"t": "•RightUpLeg",
"i": 0
},
{
"t": "•Spine",
"i": 0
},
{
"t": "Toqgle All",
"i": 0
},
{
"t": "Expand All",
"i": 2
},
{
"t": "动画遮罩",
"i": 0
},
{
"t": "主要作用是当播放该动画时，可以指定哪一部分或者哪些骨骼排除在外不受动作影响",
"i": 0
},
{
"t": "Humanoid（人形动画的快捷设置）",
"i": 0
},
{
"t": "我们分别可以控制",
"i": 0
},
{
"t": "头、左右酱、左右手、左右腿、根等",
"i": 0
},
{
"t": "点击他们让他们变成红色，就代表做该动作时不影响该部位",
"i": 0
},
{
"t": "Transform（明确指定哪些骨关节点不受影响）",
"i": 0
},
{
"t": "7Motion",
"i": 0
},
{
"t": "<None>",
"i": 1
},
{
"t": "PeothotionNoas",
"i": 0
},
{
"t": "当导入的动画剪辑包含根运动时",
"i": 0
},
{
"t": "我们可以在这里手动设置特定骨路关节点作为我们的根运动节点",
"i": 0
},
{
"t": "展开后看到的都是骨骼关节节点",
"i": 0
},
{
"t": "7 Import Messages",
"i": 0
},
{
"t": "Generate Retargeting Quality Report",
"i": 0
},
{
"t": "Relargetng Qualty compares felargeted with orinal anmmaton. lt repotts average and maximum",
"i": 0
},
{
"t": "position/orientation difference for body parts. lt may slow down import time of this fie.",
"i": 0
},
{
"t": "当我们导入动画出现问题，看到黄色的警告符号时",
"i": 0
},
{
"t": "你可以将 Generate Retargeting Quality Report 选中",
"i": 0
},
{
"t": "Unity会帮我们生成更多的有关重定向问题的具体信息",
"i": 0
},
{
"t": "我们便可以看到具体的一些问题",
"i": 0
},
{
"t": "只有看到警告动画不正确时才启用，可以帮助我们排查问题",
"i": 0
}
],
"cols": null,
"w": 1826,
"h": 1982
}
},
"68a00f7b8903": {
"type": "ocr",
"title": "Terrain Data",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Terrain Data",
"i": 4
},
{
"t": "地形数据",
"i": 4
},
{
"t": "Terrain Collider",
"i": 0
},
{
"t": "Enable Tree Colliders",
"i": 4
},
{
"t": "地形碰瑾器",
"i": 0
},
{
"t": "选中此属性时，将启用树碰撞体",
"i": 4
}
],
"cols": null,
"w": 402,
"h": 126
}
},
"6a703a5c9743": {
"type": "ocr",
"title": "0 Inspector",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "0 Inspector",
"i": 0
},
{
"t": "& Navigation",
"i": 1
},
{
"t": "Bot",
"i": 1
},
{
"t": "Static",
"i": 4
},
{
"t": "Tag",
"i": 1
},
{
"t": "Untagged",
"i": 1
},
{
"t": "Layer Default",
"i": 3
},
{
"t": "Transform",
"i": 1
},
{
"t": "Position",
"i": 0
},
{
"t": "XO",
"i": 2
},
{
"t": "YO",
"i": 3
},
{
"t": "Z0",
"i": 4
},
{
"t": "Rotation",
"i": 0
},
{
"t": "XO",
"i": 2
},
{
"t": "YO",
"i": 3
},
{
"t": "Z0",
"i": 4
},
{
"t": "Scale",
"i": 0
},
{
"t": "× 1",
"i": 2
},
{
"t": "Y1",
"i": 3
},
{
"t": "Z1",
"i": 4
},
{
"t": "Sorting Group",
"i": 1
},
{
"t": "Sorting Layer",
"i": 0
},
{
"t": "Default",
"i": 2
},
{
"t": "Order in Layer",
"i": 0
},
{
"t": "改变层级",
"i": 3
},
{
"t": "0",
"i": 2
},
{
"t": "Add CompolAsht",
"i": 2
}
],
"cols": null,
"w": 664,
"h": 501
}
},
"6af2e27d6aba": {
"type": "ocr",
"title": "Window Help",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Window Help",
"i": 0
},
{
"t": "Panels",
"i": 0
},
{
"t": "Next Window",
"i": 0
},
{
"t": "Ctrl+Tab",
"i": 2
},
{
"t": "Previous Window",
"i": 0
},
{
"t": "Ctrl+Shift+Tab",
"i": 2
},
{
"t": "Layouts",
"i": 0
},
{
"t": "Multiplayer",
"i": 0
},
{
"t": "Search",
"i": 0
},
{
"t": "Unity Version Control",
"i": 0
},
{
"t": "Asset Store",
"i": 0
},
{
"t": "My Assets",
"i": 0
},
{
"t": "Package Manager",
"i": 0
},
{
"t": "Text",
"i": 0
},
{
"t": "TextMeshPro",
"i": 0
},
{
"t": "Asset Management",
"i": 0
},
{
"t": "Version Control",
"i": 3
},
{
"t": "General",
"i": 0
},
{
"t": "Adaressables",
"i": 3
},
{
"t": "Groups",
"i": 4
},
{
"t": "Rendering",
"i": 0
},
{
"t": "Addressables Report",
"i": 4
},
{
"t": "Animation",
"i": 0
},
{
"t": "Profiles",
"i": 4
},
{
"t": "Audio",
"i": 0
},
{
"t": "Settings",
"i": 4
}
],
"cols": null,
"w": 1075,
"h": 740
}
},
"6b19f683331e": {
"type": "ocr",
"title": "Font Weights",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Font Weights",
"i": 0
},
{
"t": "Regular Typeface",
"i": 2
},
{
"t": "Italic Typeface",
"i": 4
},
{
"t": "100- Thin",
"i": 0
},
{
"t": "None （TMP_Font Asset） O",
"i": 2
},
{
"t": "None （TMP_Font Asset） O",
"i": 4
},
{
"t": "200- Extra-Light",
"i": 0
},
{
"t": "None （TMP_Font Asset） O",
"i": 2
},
{
"t": "None （TMP_Font Asset） ◎",
"i": 4
},
{
"t": "300- Light",
"i": 0
},
{
"t": "None （TMP_Font Asset） O",
"i": 2
},
{
"t": "None （TMP_Font Asset） ◎",
"i": 4
},
{
"t": "400 - Regular",
"i": 0
},
{
"t": "None （TMP_Font Asset） ◎",
"i": 2
},
{
"t": "None （TMP_Font Asset） O",
"i": 4
},
{
"t": "500- Medium",
"i": 0
},
{
"t": "None （TMP_Font Asset） O",
"i": 2
},
{
"t": "None （TMP_Font Asset）",
"i": 4
},
{
"t": "600 - Semi-Bold",
"i": 0
},
{
"t": "None （TMP_Font Asset） O",
"i": 2
},
{
"t": "None （TMP_Font Asset）",
"i": 4
},
{
"t": "700- Bold",
"i": 0
},
{
"t": "None （TMP_Font Asset） O",
"i": 2
},
{
"t": "None （TMP_Font Asset）",
"i": 4
},
{
"t": "800 - Heavy",
"i": 0
},
{
"t": "None （TMP_Font Asset） O",
"i": 2
},
{
"t": "None （TMP_Font Asset） ◎",
"i": 4
},
{
"t": "900 - Black",
"i": 0
},
{
"t": "None （TMP_Font Asset） O",
"i": 2
},
{
"t": "None （TMP_Font Asset） O",
"i": 4
},
{
"t": "Normal Weight",
"i": 0
},
{
"t": "0",
"i": 2
},
{
"t": "Bold Weight",
"i": 3
},
{
"t": "0.75",
"i": 4
},
{
"t": "Spacing Offset",
"i": 0
},
{
"t": "0",
"i": 2
},
{
"t": "Bold Spacing",
"i": 3
},
{
"t": "7",
"i": 4
},
{
"t": "Italic Style",
"i": 0
},
{
"t": "35",
"i": 2
},
{
"t": "Tab Multiple",
"i": 3
},
{
"t": "10",
"i": 4
}
],
"cols": null,
"w": 700,
"h": 469
}
},
"6d9cbed1b20f": {
"type": "ocr",
"title": "Resources / Sprite Character Table",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "Resources",
"i": 2
},
{
"t": "Fonts & Materials",
"i": 4
},
{
"t": "Sprite Assets",
"i": 4
},
{
"t": "Style Sheets",
"i": 4
},
{
"t": "50",
"i": 4
},
{
"t": "Default Style Sheet",
"i": 4
},
{
"t": "LineBreaking Following Characters",
"i": 4
},
{
"t": "LineBreaking Leading Characters",
"i": 4
},
{
"t": "50",
"i": 2
},
{
"t": "TMP Settings",
"i": 4
},
{
"t": "Shaders",
"i": 2
},
{
"t": "5",
"i": 1
},
{
"t": "Sprites",
"i": 2
},
{
"t": "EmojiOne Attribution",
"i": 4
},
{
"t": "Emojone",
"i": 4
},
{
"t": "EmojiOne",
"i": 4
},
{
"t": "EmojOne",
"i": 4
},
{
"t": "Tree_Textures",
"i": 1
},
{
"t": "Tutoriallnfo",
"i": 1
},
{
"t": "Inputsystem_Actions",
"i": 1
},
{
"t": "New Animator Controller",
"i": 1
},
{
"t": "New Animator Override Controller",
"i": 1
},
{
"t": "NewMonoBehaviourScript",
"i": 1
},
{
"t": "Readme",
"i": 1
},
{
"t": "Tree",
"i": 1
},
{
"t": "ackages",
"i": 0
}
],
"title": "Resources"
},
{
"kind": "lines",
"lines": [
{
"t": "Sprite Character Table",
"i": 0
},
{
"t": "Sprite Search",
"i": 0
},
{
"t": "Previous Page",
"i": 0
},
{
"t": "Page1/2",
"i": 2
},
{
"t": "Next Page",
"i": 4
},
{
"t": "ndex:0",
"i": 1
},
{
"t": "Unicode: OxFFFE",
"i": 3
},
{
"t": "Nam",
"i": 4
},
{
"t": "Glyph ID: 0",
"i": 1
},
{
"t": "Scale:1",
"i": 1
},
{
"t": "ndex:1",
"i": 1
},
{
"t": "Unicode: OxFFFE",
"i": 3
},
{
"t": "Nam",
"i": 4
},
{
"t": "Glyph ID:1",
"i": 1
},
{
"t": "Scale:1",
"i": 1
},
{
"t": "ndex:2",
"i": 1
},
{
"t": "Unicode: OxFFFE",
"i": 3
},
{
"t": "Nam",
"i": 4
},
{
"t": "Glyph ID: 2",
"i": 1
},
{
"t": "Scale:1",
"i": 1
},
{
"t": "Index:3",
"i": 1
},
{
"t": "Unicode: OxFFFE",
"i": 3
},
{
"t": "Nam",
"i": 4
},
{
"t": "Glyph ID:3",
"i": 1
},
{
"t": "Scale:1",
"i": 1
},
{
"t": "ndex:4",
"i": 1
},
{
"t": "Unicode: OxFFFE",
"i": 3
},
{
"t": "Nam",
"i": 4
},
{
"t": "Clyph ID: 4",
"i": 1
},
{
"t": "Scale:1",
"i": 1
},
{
"t": "ndex:5",
"i": 1
},
{
"t": "Unicode: OxFFFE",
"i": 3
},
{
"t": "Nam",
"i": 4
},
{
"t": "Glyph ID:5",
"i": 1
},
{
"t": "Scale:1",
"i": 1
},
{
"t": "ndex:6",
"i": 1
},
{
"t": "Unicode: OxFFFE",
"i": 3
},
{
"t": "Nam",
"i": 4
},
{
"t": "Glyph ID: 6",
"i": 1
},
{
"t": "Scale:1",
"i": 1
},
{
"t": "Index:7",
"i": 1
},
{
"t": "Unicode: OxFFFE",
"i": 3
},
{
"t": "Nam",
"i": 4
},
{
"t": "Glyph ID:7",
"i": 1
},
{
"t": "Scale:1",
"i": 1
},
{
"t": "Index:8",
"i": 1
},
{
"t": "Unicode: OxFFFE",
"i": 3
},
{
"t": "Nam.",
"i": 4
}
],
"title": "Sprite Character Table"
}
],
"w": 632,
"h": 661
}
},
"6e0c5694a00f": {
"type": "ocr",
"title": "导航数据烘焙页签 教学图",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "导航数据烘焙页签 教学图",
"i": 1
},
{
"t": "理解每个参数的作用，轻松配置导航烘焙",
"i": 1
},
{
"t": "界面总览",
"i": 2
},
{
"t": "Agents",
"i": 2
},
{
"t": "Areas",
"i": 2
},
{
"t": "Bake",
"i": 3
},
{
"t": "Object",
"i": 3
},
{
"t": "Learn instead about the component workflow.",
"i": 1
},
{
"t": "Baked Agent Size",
"i": 1
},
{
"t": "Agent Radius",
"i": 0
},
{
"t": "R=0.5",
"i": 3
},
{
"t": "代理半径",
"i": 0
},
{
"t": "Agent Height",
"i": 0
},
{
"t": "H=2",
"i": 3
},
{
"t": "代理高度",
"i": 0
},
{
"t": "0.4",
"i": 1
},
{
"t": "45°",
"i": 3
},
{
"t": "3",
"i": 0
},
{
"t": "Max Slope",
"i": 0
},
{
"t": "最大坡度",
"i": 0
},
{
"t": "Agent Radius",
"i": 1
},
{
"t": "0.5",
"i": 2
},
{
"t": "2",
"i": 2
},
{
"t": "Agent Heignt",
"i": 1
},
{
"t": "Step Height",
"i": 0
},
{
"t": "Max Slope",
"i": 1
},
{
"t": "45",
"i": 4
},
{
"t": "最小樱梯高度",
"i": 0
},
{
"t": "Step Height",
"i": 1
},
{
"t": "0.4",
"i": 2
},
{
"t": "Generated Off Mesh Links",
"i": 1
},
{
"t": "Drop Height",
"i": 1
},
{
"t": "Drop Height",
"i": 4
},
{
"t": "掉𦹃高度",
"i": 4
},
{
"t": "Jump Distance",
"i": 1
},
{
"t": "Generated off",
"i": 0
},
{
"t": "Advanced.",
"i": 1
},
{
"t": "Jump Distance",
"i": 4
},
{
"t": "mesh links",
"i": 0
},
{
"t": "Manual Voxel Size",
"i": 1
},
{
"t": "跳跃距离",
"i": 4
},
{
"t": "生成非网格连授",
"i": 0
},
{
"t": "Voxel Size",
"i": 1
},
{
"t": "0.1666667",
"i": 2
},
{
"t": "3.00 voxels per agent radius",
"i": 2
},
{
"t": "2",
"i": 2
},
{
"t": "Min Region Area",
"i": 1
},
{
"t": "Advanced",
"i": 4
},
{
"t": "高级设置",
"i": 4
},
{
"t": "Height Mesh",
"i": 1
},
{
"t": "Clear",
"i": 3
},
{
"t": "Bake",
"i": 4
},
{
"t": "参数详解",
"i": 2
},
{
"t": "Agent Radius",
"i": 0
},
{
"t": "• 决定了烘焙边缘精确度",
"i": 2
},
{
"t": "代理半径",
"i": 0
},
{
"t": "•控制平台可行走区域和边缘可行走区域",
"i": 2
},
{
"t": "Agent Height",
"i": 0
},
{
"t": "• 决定了烘焙高度精确度",
"i": 2
},
{
"t": "代理高度",
"i": 0
},
{
"t": "• 控制拱桥是否可以穿越",
"i": 2
},
{
"t": "Max Slope",
"i": 0
},
{
"t": "•斜波度数",
"i": 2
},
{
"t": "最大坡度",
"i": 0
},
{
"t": "45°",
"i": 2
},
{
"t": "• 决定了斜坡是否可以行走",
"i": 2
},
{
"t": "Step Height",
"i": 0
},
{
"t": "• 最小楼梯高度",
"i": 2
},
{
"t": "最小楼梯高度",
"i": 0
},
{
"t": "0.4",
"i": 2
},
{
"t": "• 决定了台阶是否可以行走",
"i": 2
},
{
"t": "Drop Height",
"i": 3
},
{
"t": "Generated off mesh",
"i": 0
},
{
"t": "• 可以从这个高度掉下来",
"i": 4
},
{
"t": "掉𦹃高度",
"i": 3
},
{
"t": "links",
"i": 0
},
{
"t": "•生成非网格连接",
"i": 2
},
{
"t": "生成非网格连接",
"i": 0
},
{
"t": "两个分开网格之间连接",
"i": 2
},
{
"t": "Jump Distance",
"i": 3
}
],
"cols": null,
"w": 788,
"h": 1400
}
},
"6e980c6e8390": {
"type": "ocr",
"title": "余弦函数（cos）",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "余弦函数（cos）",
"i": 0
},
{
"t": "Cos B = 角的临边/斜边",
"i": 0
},
{
"t": "Cos B= B/C",
"i": 0
},
{
"t": "C",
"i": 4
},
{
"t": "A",
"i": 2
},
{
"t": "B",
"i": 4
},
{
"t": "B",
"i": 4
}
],
"cols": null,
"w": 1400,
"h": 895
}
},
"71c17ee2b928": {
"type": "ocr",
"title": "2D Object",
"data": {
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"Create Empty",
"Ctrl+Shift+N"
]
]
},
{
"h": "2D Object",
"rows": [
[
"3D Object",
"Cube"
],
[
"Effects",
"Sphere"
],
[
"Light",
"Capsule"
],
[
"Audio",
"Cylinder"
],
[
"Video",
"Plane"
],
[
"UI",
"Quad"
]
]
},
{
"h": "Al",
"rows": [
[
"Text - TextMeshPro",
""
]
]
},
{
"h": "UI Toolkit",
"rows": [
[
"Legacy",
""
]
]
},
{
"h": "Rendering",
"rows": [
[
"Ragdoll..",
""
]
]
},
{
"h": "Volume",
"rows": [
[
"Camera",
"Terrain"
],
[
"Visual Scripting Scene Variables",
"Tree"
],
[
"Wind Zone",
""
]
]
}
],
"lines": null,
"cols": null,
"w": 885,
"h": 519
}
},
"71c61079a0e1": {
"type": "ocr",
"title": "Font Asset Creator",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Font Asset Creator",
"i": 0
},
{
"t": "Source Font",
"i": 0
},
{
"t": "AalMPACT",
"i": 1
},
{
"t": "Font Face",
"i": 0
},
{
"t": "Impact - Regular",
"i": 1
},
{
"t": "Sampling Point Size",
"i": 0
},
{
"t": "Auto Sizing",
"i": 1
},
{
"t": "Padding",
"i": 0
},
{
"t": "10",
"i": 1
},
{
"t": "pX",
"i": 4
},
{
"t": "Packing Method",
"i": 0
},
{
"t": "Fast",
"i": 1
},
{
"t": "Atlas Resolution",
"i": 0
},
{
"t": "512",
"i": 1
},
{
"t": "- 512",
"i": 3
},
{
"t": "Character Set",
"i": 0
},
{
"t": "ASCIl",
"i": 1
},
{
"t": "Render Mode",
"i": 0
},
{
"t": "SDFAA",
"i": 1
},
{
"t": "Get Font Features",
"i": 0
},
{
"t": "Generate Font Atlas",
"i": 2
},
{
"t": "Generation completed in: 11.96 ms",
"i": 1
},
{
"t": "X",
"i": 4
},
{
"t": "Font: Impact Style: Regular",
"i": 0
},
{
"t": "Point Size: 66 Padding: 6 SP/PD Ratio: 9.1%",
"i": 0
},
{
"t": "Characters included: 98/99",
"i": 0
},
{
"t": "Missing characters: 1",
"i": 0
},
{
"t": "Excluded characters: 0",
"i": 0
},
{
"t": "Characters missing from font file：",
"i": 0
},
{
"t": "ID:8203",
"i": 0
},
{
"t": "Hex: 200B Char I",
"i": 1
},
{
"t": "Save",
"i": 1
},
{
"t": "Save as...",
"i": 4
},
{
"t": "0098",
"i": 0
},
{
"t": "@36",
"i": 0
},
{
"t": "0P09",
"i": 0
},
{
"t": "S124Y1",
"i": 0
},
{
"t": "｛GUdBHI",
"i": 0
},
{
"t": "SO/WDN",
"i": 0
}
],
"cols": null,
"w": 795,
"h": 867
}
},
"7254ca3a5bcd": {
"type": "ocr",
"title": "Assembly Definition / Create",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "Assembly Definition",
"i": 4
},
{
"t": "Assembly Definition Reference",
"i": 4
},
{
"t": "TextMeshPro",
"i": 4
},
{
"t": "Scene",
"i": 4
},
{
"t": "Prefab Variant",
"i": 4
},
{
"t": "Audio Mixer",
"i": 4
},
{
"t": "Material",
"i": 4
},
{
"t": "Lens Flare",
"i": 4
},
{
"t": "Render Texture",
"i": 4
},
{
"t": "se",
"i": 0
},
{
"t": "Lightmap Parameters",
"i": 4
},
{
"t": "Custom Render Texture",
"i": 4
},
{
"t": "Sprite Atlas",
"i": 4
},
{
"t": "Sprite Library Asset （Experimental）",
"i": 4
},
{
"t": "Sprites",
"i": 4
},
{
"t": "Animator Controller",
"i": 4
},
{
"t": "Animation",
"i": 4
},
{
"t": "Animator Override Controller",
"i": 4
},
{
"t": "Avatar Mask",
"i": 4
}
],
"title": "Assembly Definition"
},
{
"kind": "lines",
"lines": [
{
"t": "Create",
"i": 0
},
{
"t": "Show in Explorer",
"i": 0
},
{
"t": "Open",
"i": 0
},
{
"t": "Delete",
"i": 0
},
{
"t": "Rename",
"i": 0
},
{
"t": "Copy Path",
"i": 0
},
{
"t": "Alt+Ctrl+C",
"i": 4
},
{
"t": "Open Scene Additive",
"i": 0
},
{
"t": "View in Package Manager",
"i": 0
},
{
"t": "Import New Asset...",
"i": 0
},
{
"t": "Import Package",
"i": 0
},
{
"t": "Export Package..",
"i": 0
},
{
"t": "Find References In Scene",
"i": 0
},
{
"t": "Select Dependencies",
"i": 0
},
{
"t": "Ctrl+R",
"i": 4
},
{
"t": "Square",
"i": 0
},
{
"t": "Triangle",
"i": 0
},
{
"t": "Diamond",
"i": 0
},
{
"t": "Hexagon",
"i": 0
},
{
"t": "b",
"i": 2
},
{
"t": "Circle",
"i": 0
},
{
"t": "Polygon",
"i": 0
}
],
"title": "Create"
}
],
"w": 1400,
"h": 1053
}
},
"726fff50827d": {
"type": "ocr",
"title": "Public Bool",
"data": {
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"• Lesson 2（Script）",
""
],
[
"Script",
"Reset"
],
[
"Private Int",
"Remove Component"
],
[
"Protected Str",
"Move Up"
]
]
},
{
"h": "Public Bool",
"rows": [
[
"Move Down",
""
]
]
},
{
"h": "Array",
"rows": [
[
"Copy Component",
""
]
]
},
{
"h": "List",
"rows": [
[
"Type",
"Paste Component As New"
],
[
"Came Obi",
"Paste Component Values"
],
[
"My Struct",
"Find References In Scene"
],
[
"I My Class",
"Edit Script"
]
]
},
{
"h": "菖础冒性",
"rows": [
[
"哈哈哈哈",
""
]
]
}
],
"lines": null,
"cols": null,
"w": 340,
"h": 303
}
},
"73b45fbac48f": {
"type": "ocr",
"title": "Source Image",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Source Image",
"i": 0
},
{
"t": "Q Background",
"i": 2
},
{
"t": "Color",
"i": 0
},
{
"t": "Material",
"i": 0
},
{
"t": "None （Material）",
"i": 2
},
{
"t": "Raycast Target",
"i": 0
},
{
"t": "• Raycast Padding",
"i": 0
},
{
"t": "Maskable",
"i": 0
},
{
"t": "Sliced",
"i": 2
},
{
"t": "Image Type",
"i": 0
},
{
"t": "Fill Center",
"i": 0
},
{
"t": "Pixels Per Unit Multip 1",
"i": 0
},
{
"t": "V Vertical Layout Group",
"i": 1
},
{
"t": "②社：",
"i": 4
},
{
"t": "• Padding",
"i": 0
},
{
"t": "Spacing",
"i": 0
},
{
"t": "0",
"i": 2
},
{
"t": "Child Alignment",
"i": 0
},
{
"t": "Upper Left",
"i": 2
},
{
"t": "Reverse Arrangement",
"i": 0
},
{
"t": "Control Child Size",
"i": 0
},
{
"t": "Width",
"i": 2
},
{
"t": "Height",
"i": 3
},
{
"t": "Use Child Scale",
"i": 0
},
{
"t": "Width",
"i": 2
},
{
"t": "Height",
"i": 3
},
{
"t": "Child Force Expand",
"i": 0
},
{
"t": "Width",
"i": 2
},
{
"t": "Height",
"i": 3
},
{
"t": "Default Ul Material （Material）",
"i": 1
},
{
"t": "②：",
"i": 4
},
{
"t": "Shader UI/Default",
"i": 1
},
{
"t": "Edit...",
"i": 4
},
{
"t": "Sprite Texture",
"i": 0
},
{
"t": "Tiling",
"i": 1
},
{
"t": "X",
"i": 2
},
{
"t": "1",
"i": 2
},
{
"t": "Y",
"i": 3
},
{
"t": "1",
"i": 3
},
{
"t": "Offset",
"i": 1
},
{
"t": "X",
"i": 2
},
{
"t": "Y",
"i": 3
}
],
"cols": null,
"w": 1280,
"h": 765
}
},
"7488b4fc25ff": {
"type": "ocr",
"title": "Monew",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Monew",
"i": 0
},
{
"t": "置钱",
"i": 3
},
{
"t": "Add component",
"i": 4
}
],
"cols": null,
"w": 307,
"h": 55
}
},
"7703c365ab1c": {
"type": "ocr",
"title": "txeT weN",
"data": {
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"TextMeshPro - Text （Ul）",
""
],
[
"Text Input",
"Enable RTL Editor"
]
]
},
{
"h": "txeT weN",
"rows": [
[
"Text Style",
"Normal"
]
]
},
{
"h": "Main Settings",
"rows": [
[
"Font Asset",
"ELiberationSans SDF （TMP_Font Asset）"
],
[
"Material Preset",
"LiberationSans SDF Material"
],
[
"Font Style B U S ab AB",
"SC"
],
[
"Font Size",
"44.75"
]
]
},
{
"h": "Auto Size",
"rows": [
[
"Auto Size Options Min 18 Max 72 WD% Line",
"0"
]
]
}
],
"lines": null,
"cols": null,
"w": 723,
"h": 647
}
},
"7a106259344f": {
"type": "ocr",
"title": "CubeTest",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "CubeTest",
"i": 2
},
{
"t": "Open.",
"i": 4
},
{
"t": "Length 1.000",
"i": 2
},
{
"t": "60 FPS",
"i": 4
},
{
"t": "Loop Time",
"i": 2
},
{
"t": "Loop Pose",
"i": 2
},
{
"t": "Cycle Offset",
"i": 2
},
{
"t": "Root contans position and rotation curves",
"i": 2
},
{
"t": "Curves Pos: 1 Quaternion: 0 Euler: 1 Scale: 1 Muscles: O Ceneric: 1 PPlr：",
"i": 2
},
{
"t": "Curves Totat 10, Constant: 0（0.0%） Dense: 0 （0.0%） Stream: 10",
"i": 2
},
{
"t": "（100.0%）",
"i": 2
},
{
"t": "5.3 KB",
"i": 2
},
{
"t": "Loop Time：是否是循环动画（在动画结尾时重新开始）",
"i": 2
},
{
"t": "Loop Pose：无缝循环运动",
"i": 2
},
{
"t": "动画文件界面参数",
"i": 0
},
{
"t": "Cycle Offset：循环动画在其他时间开始时的周期偏移",
"i": 2
}
],
"cols": null,
"w": 645,
"h": 361
}
},
"7bcb47dcfe53": {
"type": "ocr",
"title": "File",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "$ UGUI - SampleScene -Windows, Mac, Linux - Unity 6 （6000.0.39f1）*<DX11>",
"i": 0
},
{
"t": "Assets GameObject Component Services Jobs （ScriptableObiect Window Help",
"i": 1
},
{
"t": "File",
"i": 0
},
{
"t": "CreateMyData",
"i": 4
},
{
"t": "Unity 6||",
"i": 0
},
{
"t": "Q11",
"i": 1
},
{
"t": "Asset Store •",
"i": 2
},
{
"t": "# Scene",
"i": 0
}
],
"cols": null,
"w": 1045,
"h": 166
}
},
"7d0b74277384": {
"type": "ocr",
"title": "0 Inspector",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "0 Inspector",
"i": 0
},
{
"t": "Blend Tree",
"i": 0
},
{
"t": "②：",
"i": 4
},
{
"t": "Blend Type",
"i": 0
},
{
"t": "1D",
"i": 1
},
{
"t": "+ 已添加",
"i": 0
},
{
"t": "1D",
"i": 2
},
{
"t": "签入",
"i": 4
},
{
"t": "撒销",
"i": 4
},
{
"t": "2D Simple Directional",
"i": 2
},
{
"t": "Parameter",
"i": 0
},
{
"t": "2D Freeform Directional",
"i": 2
},
{
"t": "2D Freeform Cartesian",
"i": 2
},
{
"t": "Direct",
"i": 2
},
{
"t": "1",
"i": 4
}
],
"cols": null,
"w": 701,
"h": 324
}
},
"7dbe9242b020": {
"type": "ocr",
"title": "0 Inspector",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "0 Inspector",
"i": 0
},
{
"t": "IMPACT Atlas Material （Material）",
"i": 0
},
{
"t": "TextMeshPro/Distance Field",
"i": 1
},
{
"t": "Shader",
"i": 0
},
{
"t": "已添加",
"i": 0
},
{
"t": "Face",
"i": 1
},
{
"t": "Color",
"i": 1
},
{
"t": "Texture",
"i": 1
},
{
"t": "× 1",
"i": 4
},
{
"t": "Tiling",
"i": 4
},
{
"t": "Offset XO",
"i": 4
},
{
"t": "Select Speed X O",
"i": 4
},
{
"t": "Softness",
"i": 1
},
{
"t": "Dilate",
"i": 1
}
],
"cols": null,
"w": 1098,
"h": 417
}
},
"81b7454ce025": {
"type": "ocr",
"title": "V Local",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "V Local",
"i": 0
},
{
"t": "Built-In",
"i": 4
},
{
"t": "Local.BuildPath",
"i": 1
},
{
"t": "［UnityEngine.AddressableAssets.Addressables. BuildPath］/［Build",
"i": 4
},
{
"t": "Local.LoadPath",
"i": 1
},
{
"t": "｛UnityEngine.AddressableAssets.Addressables. RuntimePath//［BL",
"i": 4
},
{
"t": "V Remote",
"i": 0
},
{
"t": "Custom",
"i": 4
},
{
"t": "Remote.BuildPath",
"i": 1
},
{
"t": "ServerData/［BuildTarget］",
"i": 4
},
{
"t": "Remote.LoadPath",
"i": 1
},
{
"t": "<undefined>",
"i": 4
},
{
"t": "BuildTarget",
"i": 0
},
{
"t": "［UnityEditor.EditorUserBuildSettings.activeBuildTarget］",
"i": 4
}
],
"cols": null,
"w": 809,
"h": 287
}
},
"8203fe94a2ed": {
"type": "ocr",
"title": "Platform Effector 2D",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Platform Effector 2D",
"i": 1
},
{
"t": "②识：",
"i": 4
},
{
"t": "Use Collider Mask",
"i": 0
},
{
"t": "Everything",
"i": 2
},
{
"t": "Collider Mask",
"i": 0
},
{
"t": "Rotational Offset",
"i": 0
},
{
"t": "0",
"i": 2
},
{
"t": "V One Way",
"i": 0
},
{
"t": "Use One Way",
"i": 0
},
{
"t": "Use One Way Grouping",
"i": 0
},
{
"t": "Surface Arc",
"i": 0
},
{
"t": "180",
"i": 2
}
],
"cols": null,
"w": 745,
"h": 295
}
},
"8262d1385019": {
"type": "ocr",
"title": "导航（Navigation）面板功能详解",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "导航（Navigation）面板功能详解",
"i": 1
},
{
"t": "•设置场景导航的烘焙、生成和区域选项。",
"i": 3
},
{
"t": "1 Inspector",
"i": 0
},
{
"t": "% Navigation",
"i": 1
},
{
"t": "Scene Filter 场景过滤器",
"i": 4
},
{
"t": "Agents",
"i": 2
},
{
"t": "Areas",
"i": 2
},
{
"t": "Bake",
"i": 3
},
{
"t": "Object",
"i": 3
},
{
"t": "配置Hierarchy窗口使用",
"i": 4
},
{
"t": "•All：显示场景上所有对象",
"i": 4
},
{
"t": "Scene Filter：",
"i": 0
},
{
"t": "Bake settings for the currently selected object.",
"i": 2
},
{
"t": "• Mesh Renderers： 显示挂载的网格渲染器的对象",
"i": 4
},
{
"t": "P Mesh Renderers",
"i": 1
},
{
"t": "Terrains",
"i": 2
},
{
"t": "• Terrains： 显示挂载了地形脚本的对象",
"i": 4
},
{
"t": "All",
"i": 0
},
{
"t": "Learn instead about the component workflow",
"i": 0
},
{
"t": "2",
"i": 4
},
{
"t": "Navigation Static 导航静态物体开关",
"i": 4
},
{
"t": "Plane （3） （Mesh Renderer）",
"i": 0
},
{
"t": "勾选后，该物体会被视为静态导航几何体",
"i": 4
},
{
"t": "Navigation Static",
"i": 0
},
{
"t": "• 参与烘焙导航网格",
"i": 4
},
{
"t": "•适用于不会移动的物体（如地形、建筑等）",
"i": 4
},
{
"t": "3",
"i": 0
},
{
"t": "Generate OffMeshLinks",
"i": 0
},
{
"t": "Walkable",
"i": 2
},
{
"t": "Navigation Area",
"i": 0
},
{
"t": "3",
"i": 4
},
{
"t": "Generate OffMeshLinks 生成网格连接点开关",
"i": 4
},
{
"t": "Faifanboefmi.ssn",
"i": 0
},
{
"t": "勾选后，自动检测并生成OffMeshLink",
"i": 4
},
{
"t": "•用于连接不同高度或区域的导航点",
"i": 4
},
{
"t": "•例如：跳跃、攀爬、跨越等特殊连接",
"i": 4
},
{
"t": "Navigation Area 导航区域选择",
"i": 4
},
{
"t": "4",
"i": 4
},
{
"t": "为物体指定导航区域类型",
"i": 4
},
{
"t": "• 决定该区域的可行走性和代价",
"i": 4
},
{
"t": "•可选择Walkable、Not Walkable 等区域类型",
"i": 4
},
{
"t": "功能总结",
"i": 1
},
{
"t": "通过Navigation面板的Object选项卡，可以精细控制场景中物体如何参与导航系统的烘焙和生成，",
"i": 2
},
{
"t": "从而实现更智能、更高效的AI寻路效果。",
"i": 2
}
],
"cols": null,
"w": 1400,
"h": 1120
}
},
"8286d5acba9d": {
"type": "ocr",
"title": "Shape",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Shape",
"i": 0
},
{
"t": "Box",
"i": 4
},
{
"t": "Center",
"i": 0
},
{
"t": "Capsule",
"i": 4
},
{
"t": "Size",
"i": 0
},
{
"t": "Box",
"i": 4
}
],
"cols": null,
"w": 338,
"h": 78
}
},
"8455a23734d4": {
"type": "ocr",
"title": "Tilemap",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "2",
"i": 3
},
{
"t": "Tilemap",
"i": 4
},
{
"t": "Focus On",
"i": 4
},
{
"t": "Non",
"i": 4
},
{
"t": "eite",
"i": 0
},
{
"t": "Tilemar",
"i": 2
},
{
"t": "Active Tilemap",
"i": 2
},
{
"t": "Edit",
"i": 1
}
],
"cols": null,
"w": 1400,
"h": 1273
}
},
"867260a774fb": {
"type": "ocr",
"title": "IMPACT SDF",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Assets > Resources >Font&Materials",
"i": 0
},
{
"t": "F",
"i": 3
},
{
"t": "IMPACT SDF",
"i": 2
}
],
"cols": null,
"w": 398,
"h": 231
}
},
"869c955b5477": {
"type": "ocr",
"title": "Copy / RobotBoyldleSprite",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "Copy",
"i": 1
},
{
"t": "Paste",
"i": 0
},
{
"t": "Rename",
"i": 1
},
{
"t": "Duplicate",
"i": 0
},
{
"t": "Delete",
"i": 1
},
{
"t": "Select Children",
"i": 1
},
{
"t": "Select Prefab Root",
"i": 0
},
{
"t": "Create Empty",
"i": 1
},
{
"t": "3D Object",
"i": 0
},
{
"t": "2D Object",
"i": 0
},
{
"t": "Effects",
"i": 1
},
{
"t": "Light",
"i": 0
},
{
"t": "Audio",
"i": 0
},
{
"t": "Video",
"i": 0
},
{
"t": "UI",
"i": 1
},
{
"t": "Camera",
"i": 0
}
],
"title": "Copy"
},
{
"kind": "lines",
"lines": [
{
"t": "RobotBoyldleSprite",
"i": 4
},
{
"t": "Scenes",
"i": 0
},
{
"t": "Scripts",
"i": 0
},
{
"t": "• Lesson1_图片导入概述",
"i": 1
},
{
"t": "Lesson2_图片导入_纹理设置",
"i": 4
},
{
"t": "Lesson3_图片导入_纹理形状设置",
"i": 4
},
{
"t": "Lesson4_图片导入_纹理高级设置",
"i": 4
},
{
"t": "Lesson5_图片导入_纹理平铺拉伸规则设留",
"i": 4
},
{
"t": "Lesson6.图片导入_平台设置",
"i": 4
},
{
"t": "Lesson7_SpriteEditor_Single图片编辑",
"i": 4
},
{
"t": "• Lesson8_SpriteEditor_Multiple图集编辑",
"i": 1
},
{
"t": "Lesson9_SpriteEditor_Polygon多边形编$",
"i": 4
},
{
"t": "• Lesson10_SpriteRenderer",
"i": 1
},
{
"t": "• Lesson11_SpriteCreator",
"i": 1
},
{
"t": "Sprite",
"i": 4
},
{
"t": "Sprite MasA",
"i": 3
},
{
"t": "Tilemap",
"i": 4
},
{
"t": "Hexagonal Point Top Tilemap",
"i": 4
},
{
"t": "Hexagonal Flat Top Tilemap",
"i": 4
},
{
"t": "Isometric Tilemap",
"i": 4
},
{
"t": "Isometric Z As Y Tilemap",
"i": 4
}
],
"title": "RobotBoyldleSprite"
}
],
"w": 1400,
"h": 1136
}
},
"86dc277e1911": {
"type": "ocr",
"title": "56 Addressables Groups / Font&Materials",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "56 Addressables Groups",
"i": 0
},
{
"t": "Addressables Groups",
"i": 0
},
{
"t": "New ~ Profile: Default",
"i": 0
},
{
"t": "Tools ~",
"i": 4
},
{
"t": "Group Name \\ Addressable Name",
"i": 1
},
{
"t": "7 Default Local Group （Default）",
"i": 1
},
{
"t": "Assets/Scenes/SampleScene.unity",
"i": 2
},
{
"t": "MyDataTest",
"i": 1
},
{
"t": "New Material",
"i": 2
}
],
"title": "56 Addressables Groups"
},
{
"kind": "lines",
"lines": [
{
"t": "X",
"i": 4
},
{
"t": "Font&Materials",
"i": 4
},
{
"t": "Script",
"i": 4
},
{
"t": "Cube",
"i": 4
},
{
"t": "MrTangData",
"i": 4
},
{
"t": "Play Mode Script",
"i": 0
},
{
"t": "Build r",
"i": 1
},
{
"t": "Q",
"i": 1
},
{
"t": "ScriptableObject",
"i": 4
},
{
"t": "尽 Path",
"i": 0
},
{
"t": "Labels",
"i": 2
},
{
"t": "Temp",
"i": 4
},
{
"t": "Resources_moved",
"i": 4
},
{
"t": "Assets/Scenes/SampleScene.！",
"i": 1
},
{
"t": "MyDatalest",
"i": 4
},
{
"t": "Assets/Resources_moved/Mv［",
"i": 1
},
{
"t": "New Material",
"i": 4
},
{
"t": "Scenes",
"i": 4
},
{
"t": "Assets/Resources_mcrea/Nev",
"i": 1
},
{
"t": "SampleScene",
"i": 4
},
{
"t": "fettings",
"i": 4
},
{
"t": "Move From Resources",
"i": 1
},
{
"t": "fextMesh Pro",
"i": 4
},
{
"t": "ree_Textures",
"i": 4
},
{
"t": "Any assets in Resources that you wish to mark as",
"i": 2
},
{
"t": "utoriallnfo",
"i": 4
},
{
"t": "Addressable must be moved within the project. We will",
"i": 2
},
{
"t": "hputSystem_Actions",
"i": 4
},
{
"t": "move the files to：",
"i": 2
},
{
"t": "Jew Animator Controller",
"i": 4
},
{
"t": "Assets/Resources_moved/MrTangData.asset",
"i": 2
},
{
"t": "Jew Animator Override Ca",
"i": 4
},
{
"t": "JewMonoBehaviourScript",
"i": 4
},
{
"t": "Are you sure you want to proceed",
"i": 2
},
{
"t": "eadme",
"i": 4
},
{
"t": "ree",
"i": 4
},
{
"t": "Yes",
"i": 4
},
{
"t": "No",
"i": 4
},
{
"t": "ages",
"i": 4
}
],
"title": "Font&Materials"
}
],
"w": 1593,
"h": 566
}
},
"86e05bc14a98": {
"type": "ocr",
"title": "JFo",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Assets 》 TextMesh Pro > Fonts",
"i": 0
},
{
"t": "JFo",
"i": 2
},
{
"t": "Aao",
"i": 3
},
{
"t": "Aa",
"i": 0
},
{
"t": "IMPACT",
"i": 0
},
{
"t": "IMPACT SDF",
"i": 2
},
{
"t": "LiberationS...",
"i": 3
},
{
"t": "LiberationS..",
"i": 4
}
],
"cols": null,
"w": 539,
"h": 230
}
},
"889b74c9f458": {
"type": "ocr",
"title": "Max Texture Size",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Max Texture Size",
"i": 0
},
{
"t": "2048",
"i": 4
},
{
"t": "Format",
"i": 0
},
{
"t": "Automatic",
"i": 4
},
{
"t": "Compression",
"i": 0
},
{
"t": "Normal Quality",
"i": 4
},
{
"t": "Use Crunch Compression",
"i": 0
},
{
"t": "Objects for Packing",
"i": 0
},
{
"t": "bk",
"i": 1
},
{
"t": "quanlity-O",
"i": 1
},
{
"t": "quanlity_1",
"i": 1
},
{
"t": "Pack Preview",
"i": 0
},
{
"t": "MyAlas",
"i": 0
},
{
"t": "MyAlas",
"i": 4
},
{
"t": "256x256 RGBA Compressed DXT5 UNorm 64.0 KB",
"i": 1
}
],
"cols": null,
"w": 1013,
"h": 1400
}
},
"896cdc385e06": {
"type": "ocr",
"title": "AxB",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "AxB",
"i": 0
},
{
"t": "A",
"i": 4
},
{
"t": "B",
"i": 2
},
{
"t": "B",
"i": 4
},
{
"t": "X",
"i": 3
}
],
"cols": null,
"w": 1400,
"h": 1147
}
},
"8a7bb6993577": {
"type": "ocr",
"title": "fileFormatVersion: 2",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "fileFormatVersion: 2",
"i": 0
},
{
"t": "guid： 4396bb99cf09f324e83445067b976126",
"i": 0
},
{
"t": "Monolmporter：",
"i": 0
},
{
"t": "externalObjects：竹",
"i": 3
},
{
"t": "serializedVersion: 2",
"i": 3
},
{
"t": "defaultReferences：",
"i": 3
},
{
"t": "- obj：｛fileID:3793504292452996160，guid:ebedf407bdc35ad4985f131e0ecc63c5，type: 3｝",
"i": 3
},
{
"t": "- m：｛fiLeID:2100000，guid:387d28f772f81c14dbc0a6e956ca0ff6，type: 2｝",
"i": 3
},
{
"t": "- audioClip：｛instanceID:0｝",
"i": 3
},
{
"t": "- VideoClip：｛instanceID: 0｝",
"i": 3
},
{
"t": "executionOrder: 0",
"i": 3
},
{
"t": "icon：｛instanceID:0｝",
"i": 3
},
{
"t": "userData：",
"i": 3
},
{
"t": "assetBundleName：",
"i": 3
},
{
"t": "assetBundleVariant：",
"i": 3
}
],
"cols": null,
"w": 1125,
"h": 458
}
},
"8a854f0075fe": {
"type": "ocr",
"title": "Discrete（离散检测）",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Discrete（离散检测）",
"i": 4
},
{
"t": "对场景中的所有其他碰撞体使用离散碰撞检测。",
"i": 4
},
{
"t": "其他碰撞体在测试碰撞时会使用离散碰撞检测。",
"i": 4
},
{
"t": "用于正常碰撞（这是默认值）",
"i": 4
},
{
"t": "Continuous（连续检测）",
"i": 4
},
{
"t": "对动态碰撞体（具有刚体）使用离散碰撞检测",
"i": 4
},
{
"t": "并对静态碰撞体（没有刚体）使用连续碰撞检测。",
"i": 4
},
{
"t": "设置为连续动态（Continuous Dynamic）的刚体将在",
"i": 4
},
{
"t": "测试与该刚体的碰撞时使用连续碰撞检测。（此属性",
"i": 4
},
{
"t": "对物理性能有很大影响，如果没有快速对象的碰撞",
"i": 4
},
{
"t": "问题，请将其保留为 Discrete 设置）",
"i": 4
},
{
"t": "其他刚体使用离散碰撞检测。",
"i": 4
},
{
"t": "Continuous Dynamic（连续动态检测）性能消耗高",
"i": 4
},
{
"t": "Collision Detection",
"i": 0
},
{
"t": "（碰撞检测模式）",
"i": 1
},
{
"t": "对设置为动态（Continuous）和连续动态（Continuous",
"i": 4
},
{
"t": "Dynamic）碰撞的游戏对象使用连续碰撞检测。还将对",
"i": 4
},
{
"t": "用于防止快速移动的对象",
"i": 0
},
{
"t": "穿过其它对象而不检测碰撞",
"i": 0
},
{
"t": "静态碰撞体（没有刚体）使用连续碰撞检测。",
"i": 4
},
{
"t": "对于所有其他碰撞体，使用离散碰撞检测。",
"i": 4
},
{
"t": "用于快速移动的对象。",
"i": 4
},
{
"t": "Continuous Speculative（连续预测检测）",
"i": 4
},
{
"t": "对刚体和碰撞体使用预测性连续碰撞检测。",
"i": 4
},
{
"t": "该方法通常比连续碰撞检测的成本更低。",
"i": 4
}
],
"cols": null,
"w": 1347,
"h": 1400
}
},
"8b1a354a53ad": {
"type": "ocr",
"title": "Vertex Color / Four Corners Gradient",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "Vertex Color",
"i": 0
},
{
"t": "Color Gradient",
"i": 0
},
{
"t": "Color Preset",
"i": 3
},
{
"t": "Color Mode",
"i": 3
},
{
"t": "Colors",
"i": 3
},
{
"t": "Override Tags",
"i": 0
},
{
"t": "Spacing Options （em）",
"i": 0
},
{
"t": "Alignment",
"i": 0
}
],
"title": "Vertex Color"
},
{
"kind": "lines",
"lines": [
{
"t": "None （TMP-Color Gradient）",
"i": 0
},
{
"t": "Four Corners Gradient",
"i": 0
},
{
"t": "#FFFFFFFF",
"i": 1
},
{
"t": "#FFFFFFFF",
"i": 4
},
{
"t": "#FFFFFFFF",
"i": 1
},
{
"t": "#FFFFFFFF",
"i": 4
},
{
"t": "Character",
"i": 0
},
{
"t": "Word",
"i": 4
},
{
"t": "Paragraph",
"i": 4
},
{
"t": "Line",
"i": 0
},
{
"t": "Aj",
"i": 2
},
{
"t": "AIA",
"i": 3
}
],
"title": "Four Corners Gradient"
}
],
"w": 708,
"h": 391
}
},
"8bc35f6b4581": {
"type": "ocr",
"title": "图内文字",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "A",
"i": 1
},
{
"t": "B",
"i": 2
},
{
"t": "C",
"i": 4
},
{
"t": "D",
"i": 4
},
{
"t": "1",
"i": 0
},
{
"t": "id",
"i": 0
},
{
"t": "name",
"i": 1
},
{
"t": "atk",
"i": 3
},
{
"t": "def",
"i": 4
},
{
"t": "2",
"i": 0
},
{
"t": "int",
"i": 0
},
{
"t": "string",
"i": 1
},
{
"t": "int",
"i": 3
},
{
"t": "int",
"i": 4
},
{
"t": "3",
"i": 0
},
{
"t": "key",
"i": 0
},
{
"t": "4",
"i": 0
},
{
"t": "唯一ID",
"i": 0
},
{
"t": "名字",
"i": 1
},
{
"t": "攻击力",
"i": 3
},
{
"t": "防御力",
"i": 4
},
{
"t": "5",
"i": 0
},
{
"t": "1 hahah",
"i": 1
},
{
"t": "5",
"i": 4
},
{
"t": "1",
"i": 4
},
{
"t": "6",
"i": 0
},
{
"t": "2喀暿喀",
"i": 1
},
{
"t": "6",
"i": 4
},
{
"t": "2",
"i": 4
},
{
"t": "7",
"i": 0
},
{
"t": "3",
"i": 1
},
{
"t": "123",
"i": 3
},
{
"t": "4",
"i": 4
},
{
"t": "3",
"i": 4
},
{
"t": "8",
"i": 0
},
{
"t": "4 呵呵呵",
"i": 1
},
{
"t": "8",
"i": 4
},
{
"t": "4",
"i": 4
},
{
"t": "9",
"i": 0
},
{
"t": "5 奥施康定今飞凯达",
"i": 1
},
{
"t": "9",
"i": 4
},
{
"t": "56",
"i": 4
}
],
"cols": null,
"w": 333,
"h": 197
}
},
"8bc8c29c1d4b": {
"type": "ocr",
"title": "Project",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Project",
"i": 0
},
{
"t": "Unity Version Control",
"i": 1
},
{
"t": "E Hierarchy",
"i": 2
},
{
"t": "0 Inspector",
"i": 3
},
{
"t": "+、",
"i": 2
},
{
"t": "〇30",
"i": 1
},
{
"t": "Q All",
"i": 2
},
{
"t": "Addressable Asset Settings （Addressable Asset Settings 记：",
"i": 3
},
{
"t": "SSampleScene",
"i": 2
},
{
"t": "Assets",
"i": 0
},
{
"t": "Open",
"i": 4
},
{
"t": "G Main Camera",
"i": 2
},
{
"t": "AddressableAssetsData",
"i": 0
},
{
"t": "已添加",
"i": 3
},
{
"t": "签入",
"i": 4
},
{
"t": "撤销",
"i": 4
},
{
"t": "Directional Light",
"i": 2
},
{
"t": "AssetGroups",
"i": 0
},
{
"t": "G Global Volume",
"i": 2
},
{
"t": "Schemas",
"i": 1
},
{
"t": "G Grid",
"i": 2
},
{
"t": "Atlas",
"i": 1
},
{
"t": "Controller",
"i": 1
},
{
"t": "Cube",
"i": 2
},
{
"t": "Manage Groups",
"i": 4
},
{
"t": ">Y Canvas",
"i": 2
},
{
"t": "Data",
"i": 1
},
{
"t": "G EventSystem",
"i": 2
},
{
"t": "Default Local Group",
"i": 1
},
{
"t": "V Profiles",
"i": 3
},
{
"t": "G GameObject",
"i": 2
},
{
"t": "GameObject",
"i": 1
},
{
"t": "Profile In Use",
"i": 3
},
{
"t": "Default",
"i": 4
},
{
"t": "GameObject （1）",
"i": 2
},
{
"t": "Lua",
"i": 1
},
{
"t": "1 Temp",
"i": 2
},
{
"t": "Manage Profiles",
"i": 4
},
{
"t": "Material",
"i": 1
},
{
"t": "PlayAudio",
"i": 2
},
{
"t": "Music",
"i": 1
},
{
"t": "V Diagnostics",
"i": 3
},
{
"t": "Scenes",
"i": 1
},
{
"t": "M addressable_lesson3",
"i": 2
},
{
"t": "Sprite",
"i": 1
},
{
"t": "Log Runtime Exceptions",
"i": 3
},
{
"t": "Texture",
"i": 1
},
{
"t": "AssetGroupTemplates",
"i": 0
},
{
"t": "VCatalog",
"i": 3
},
{
"t": "DataBuilders",
"i": 0
},
{
"t": "Player Version Override",
"i": 3
},
{
"t": "［UnityEditor.PlayerSettings.bundleVersion］",
"i": 4
},
{
"t": "F AddressableAssetSettings",
"i": 0
},
{
"t": "f DefaultObject",
"i": 0
},
{
"t": "Build Remote Catalog",
"i": 3
},
{
"t": "Resources",
"i": 0
},
{
"t": "Enable Json Catalog",
"i": 3
},
{
"t": "Editor",
"i": 0
},
{
"t": "Only update catalogs manue",
"i": 3
},
{
"t": "Font&Materials",
"i": 0
}
],
"cols": null,
"w": 1461,
"h": 600
}
},
"8cdef268c602": {
"type": "ocr",
"title": "Scenes",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Scenes",
"i": 1
},
{
"t": "Settings",
"i": 2
},
{
"t": "TextMesh P...",
"i": 3
},
{
"t": "Tree_Textur..",
"i": 4
},
{
"t": "•Assets/TextMesh Pro",
"i": 0
}
],
"cols": null,
"w": 485,
"h": 285
}
},
"8d3648d833dc": {
"type": "ocr",
"title": "Audio Source",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Audio Source",
"i": 2
},
{
"t": "Audioclip",
"i": 0
},
{
"t": "None （Audio Clip）",
"i": 4
},
{
"t": "Output",
"i": 0
},
{
"t": "None （Audio Mixer（",
"i": 4
},
{
"t": "Mute",
"i": 0
}
],
"cols": null,
"w": 477,
"h": 166
}
},
"8d9e0231b2d1": {
"type": "ocr",
"title": "Create Empty",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Create Empty",
"i": 0
},
{
"t": "Ctrl+Shift+N",
"i": 3
},
{
"t": "2D Object",
"i": 0
},
{
"t": "3D Object",
"i": 0
},
{
"t": "Effects",
"i": 0
},
{
"t": "Light",
"i": 0
},
{
"t": "Audio",
"i": 0
},
{
"t": "Video",
"i": 0
},
{
"t": "UI",
"i": 0
},
{
"t": "Image",
"i": 4
},
{
"t": "AI",
"i": 0
},
{
"t": "Text- TextMeshPro",
"i": 4
},
{
"t": "UI Toolkit",
"i": 0
},
{
"t": "Raw Image",
"i": 4
},
{
"t": "Rendering",
"i": 0
},
{
"t": "Panel",
"i": 4
},
{
"t": "Volume",
"i": 0
},
{
"t": "Toggle",
"i": 4
},
{
"t": "Camera",
"i": 0
},
{
"t": "Slider",
"i": 4
},
{
"t": "Visual Scripting Scene Variables",
"i": 0
},
{
"t": "Scrollbar",
"i": 4
}
],
"cols": null,
"w": 810,
"h": 486
}
},
"8dea44562193": {
"type": "ocr",
"title": "导航地区（Areas）详解",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "导航地区（Areas）详解",
"i": 0
},
{
"t": "合理配置导航地区，让AI行为更智能！个",
"i": 1
},
{
"t": "d Inspector",
"i": 2
},
{
"t": "2 Navigation",
"i": 3
},
{
"t": "1. 面板位置",
"i": 0
},
{
"t": "Agents",
"i": 3
},
{
"t": "Areas",
"i": 3
},
{
"t": "Bake",
"i": 4
},
{
"t": "0bject",
"i": 4
},
{
"t": "在 Unity 中打开",
"i": 0
},
{
"t": "Name",
"i": 3
},
{
"t": "Cost",
"i": 4
},
{
"t": "［Window］>［AI］>［Navigation］",
"i": 0
},
{
"t": "Built-in O",
"i": 2
},
{
"t": "Walkable",
"i": 3
},
{
"t": "切换到 Areas 标签页",
"i": 0
},
{
"t": "Built-in 1",
"i": 2
},
{
"t": "Not Walkable",
"i": 3
},
{
"t": "Built-in 2",
"i": 2
},
{
"t": "Jump",
"i": 3
},
{
"t": "User 3",
"i": 2
},
{
"t": "2.列说明",
"i": 0
},
{
"t": "User 4",
"i": 2
},
{
"t": "User 5",
"i": 2
},
{
"t": "User 6",
"i": 2
},
{
"t": "Name（区域名字）",
"i": 0
},
{
"t": "User7",
"i": 2
},
{
"t": "导航地区的名称，",
"i": 0
},
{
"t": "User 8",
"i": 2
},
{
"t": "用于标识不同区域类型",
"i": 0
},
{
"t": "User 9",
"i": 2
},
{
"t": "User 10",
"i": 2
},
{
"t": "Cost（寻路消耗）",
"i": 0
},
{
"t": "User 10",
"i": 2
},
{
"t": "Al通过该区域的消耗值，",
"i": 0
},
{
"t": "User 11",
"i": 2
},
{
"t": "数值越大，越不愿意选择",
"i": 0
},
{
"t": "User12",
"i": 2
},
{
"t": "（1为默认最小消耗）",
"i": 0
},
{
"t": "3. 默认区域说明",
"i": 0
},
{
"t": "Built-in O",
"i": 0
},
{
"t": "Walkable",
"i": 1
},
{
"t": "Built-in 1",
"i": 2
},
{
"t": "Not Walkable",
"i": 3
},
{
"t": "Built-in 2",
"i": 4
},
{
"t": "Jump",
"i": 4
},
{
"t": "不可行走区域",
"i": 2
},
{
"t": "可行走区域",
"i": 0
},
{
"t": "跳跃区域",
"i": 4
},
{
"t": "Al会优先选择的区域",
"i": 0
},
{
"t": "AI无法通过，通常用于",
"i": 2
},
{
"t": "AI可通过跳跃到达的区域",
"i": 4
},
{
"t": "Cost 通常为1",
"i": 0
},
{
"t": "障碣物、愈险区域等",
"i": 2
},
{
"t": "Cost 建议设置为2或更高",
"i": 4
},
{
"t": "Cost 通常为1（不可走）",
"i": 2
},
{
"t": "4.自定义区域",
"i": 0
},
{
"t": "（User 3~User 12）",
"i": 1
},
{
"t": "示例应用：",
"i": 3
},
{
"t": "可自定义更多区域类型和消耗，",
"i": 0
},
{
"t": "满足不同游戏场景需求",
"i": 0
},
{
"t": "淣泞区域",
"i": 3
},
{
"t": "愈脸区域",
"i": 3
},
{
"t": "浅水区域",
"i": 4
},
{
"t": "草地区域",
"i": 4
},
{
"t": "Cost=3",
"i": 3
},
{
"t": "Cost=5",
"i": 3
},
{
"t": "Cost = 1.5",
"i": 4
},
{
"t": "Cost=2",
"i": 4
},
{
"t": "5.使用建议",
"i": 0
},
{
"t": "⑦ 根据地形特点设置不同的 Cost",
"i": 0
},
{
"t": "高消耗区域不是不能走，而是尽量不走",
"i": 0
},
{
"t": "合理搭配可让 AI 行为更自然智能",
"i": 0
},
{
"t": "⑦ 修改后需重新 Bake 导航网格生效",
"i": 0
},
{
"t": "合理配置导航地区，让你的AI 更聪明！",
"i": 1
}
],
"cols": null,
"w": 788,
"h": 1400
}
},
"8e1849a8d54a": {
"type": "ocr",
"title": "Close",
"data": {
"kind": "rows",
"groups": [
{
"h": "Close",
"rows": [
[
"Open",
""
]
]
},
{
"h": "Fill",
"rows": [
[
"Texture",
"None （Texture 2D）"
]
]
},
{
"h": "Angle Range （90）",
"rows": [
[
"Start 135 End 45 Order",
"3"
]
]
},
{
"h": "Corners",
"rows": [
[
"Outer Top Left",
"None （Sprite）"
],
[
"Outer Top Right",
"None （Sprite）"
],
[
"Outer Bottom Left",
"None （Sprite）"
],
[
"Outer Bottom Right",
"None （Sprite）"
],
[
"Inner Top Left",
"None （Sprite）"
],
[
"Inner Top Right",
"None （Sprite）"
],
[
"Inner Bottom Left None （Sprite）",
"C"
],
[
"Inner Bottom Right",
"None （Sprite）"
]
]
}
],
"lines": null,
"cols": null,
"w": 819,
"h": 1400
}
},
"8e55c15c9104": {
"type": "ocr",
"title": "S6 TMP Importer",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "S6 TMP Importer",
"i": 0
},
{
"t": "X",
"i": 4
},
{
"t": "TMP Importer",
"i": 0
},
{
"t": "TMP Essentials",
"i": 0
},
{
"t": "This appears to be the first time you access TextMesh Pro, as such we need to add resources to your project",
"i": 0
},
{
"t": "that are essential for using TextMesh Pro. These new resources will be placed at the root of your project in",
"i": 0
},
{
"t": "the \"TextMesh Pro\" folder.",
"i": 0
},
{
"t": "Import TMP Essentials",
"i": 2
},
{
"t": "TMP Examples & Extras",
"i": 0
},
{
"t": "The Examples & Extras package contains addition resources and examples that will make discovering and",
"i": 0
},
{
"t": "learning about TextMesh Pro's powerful features easier. These additional resources will be placed in the",
"i": 0
},
{
"t": "same folder as the TMP essential resources.",
"i": 0
},
{
"t": "Import TMP Examples & Extras",
"i": 2
}
],
"cols": null,
"w": 964,
"h": 401
}
},
"91e848c9a04f": {
"type": "ocr",
"title": "Rename",
"data": {
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"Create",
"Folder"
],
[
"Show in Explorer",
"Material"
],
[
"Open",
"MonoBehaviour Script"
],
[
"Delete",
"Prefab Variant"
]
]
},
{
"h": "Rename",
"rows": [
[
"2D",
"Sprites"
],
[
"Copy Path",
"Alt+Ctrl+C"
],
[
"Animation",
""
],
[
"Physics Material 2D",
""
],
[
"Open Scene Additive",
"Audio"
],
[
"Sprite Atlas",
""
],
[
"Rendering",
""
],
[
"View in Package Manager",
""
],
[
"Scene",
""
]
]
},
{
"h": "Import New Asset..",
"rows": [
[
"Scripting",
""
]
]
},
{
"h": "Import Package",
"rows": [
[
"Search",
""
]
]
},
{
"h": "Export Package..",
"rows": [
[
"Shader",
""
],
[
"Find References In Scene",
"Shader Graph"
],
[
"Find References In Project",
"Testing"
],
[
"Select Dependencies",
"Terrain"
],
[
"Text Core",
""
],
[
"Refresh",
"Ctrl+R"
],
[
"TextMeshPro",
""
]
]
},
{
"h": "Reimport",
"rows": [
[
"Timeline",
""
]
]
},
{
"h": "Reimport All",
"rows": [
[
"UIToolkit",
""
],
[
"Extract From Prefab",
"Visual Scripting"
],
[
"Unity Version Control",
"Physics Material"
],
[
"Update UXML Schema",
"GUl Skin"
],
[
"Custom Font",
""
]
]
},
{
"h": "Open C# Project",
"rows": [
[
"Input Actions",
""
],
[
"View in Import Activity Window",
""
],
[
"Properties..",
"Alt+P"
]
]
}
],
"lines": null,
"cols": null,
"w": 1224,
"h": 1012
}
},
"9347da533c1c": {
"type": "ocr",
"title": "Generation Settings",
"data": {
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"Generation Settings",
""
],
[
"Source Font File",
"AalMPACT"
],
[
"Font Face",
"Impact-Regular"
],
[
"Atlas Population Mode",
"Dynamic"
],
[
"Atlas Render Mode",
"SDFAA"
],
[
"Sampling Point Size",
"90"
],
[
"Padding",
"9"
],
[
"Atlas Width",
"1024"
],
[
"Atlas Height",
"1024"
]
]
}
],
"lines": null,
"cols": null,
"w": 689,
"h": 376
}
},
"93bb6f300214": {
"type": "ocr",
"title": "Outline / - Click to collapse -",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "Outline",
"i": 0
},
{
"t": "Color",
"i": 2
},
{
"t": "Texture",
"i": 2
},
{
"t": "Thickness",
"i": 2
},
{
"t": "Underlay",
"i": 0
},
{
"t": "Underlay Type",
"i": 2
},
{
"t": "Color",
"i": 2
},
{
"t": "OffsetX",
"i": 2
},
{
"t": "Offset Y",
"i": 2
},
{
"t": "Dilate",
"i": 2
},
{
"t": "Softness",
"i": 2
}
],
"title": "Outline"
},
{
"kind": "lines",
"lines": [
{
"t": "- Click to collapse -",
"i": 4
},
{
"t": "None",
"i": 0
},
{
"t": "1",
"i": 2
},
{
"t": "Y",
"i": 4
},
{
"t": "1",
"i": 4
},
{
"t": "Tiling X",
"i": 1
},
{
"t": "（Texture",
"i": 0
},
{
"t": "Offset X",
"i": 1
},
{
"t": "Y",
"i": 4
},
{
"t": "0",
"i": 4
},
{
"t": "2D）",
"i": 0
},
{
"t": "Select Speed X O",
"i": 0
},
{
"t": "YO",
"i": 4
},
{
"t": "- Click to collapse-",
"i": 4
},
{
"t": "None",
"i": 0
}
],
"title": "- Click to collapse -"
}
],
"w": 1048,
"h": 442
}
},
"9456cab43963": {
"type": "ocr",
"title": "Surface Effector 2D",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Surface Effector 2D",
"i": 1
},
{
"t": "Use Collider Mask",
"i": 0
},
{
"t": "Collider Mask",
"i": 0
},
{
"t": "Everything",
"i": 4
},
{
"t": "V Force",
"i": 0
},
{
"t": "Speed",
"i": 0
},
{
"t": "1",
"i": 4
},
{
"t": "Speed Variation",
"i": 0
},
{
"t": "0",
"i": 4
},
{
"t": "Force Scale",
"i": 0
},
{
"t": "0.1",
"i": 4
},
{
"t": "Dneinna",
"i": 0
}
],
"cols": null,
"w": 719,
"h": 272
}
},
"94611776de4d": {
"type": "ocr",
"title": "clolone Audilou",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "clolone Audilou",
"i": 0
},
{
"t": "EmoiiOne",
"i": 0
},
{
"t": "Emojtone",
"i": 0
}
],
"cols": null,
"w": 151,
"h": 44
}
},
"9592486ae10a": {
"type": "ocr",
"title": "Sprite",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Sprite",
"i": 3
},
{
"t": "Name",
"i": 0
},
{
"t": "Position",
"i": 0
},
{
"t": "XO",
"i": 3
},
{
"t": "YO",
"i": 4
},
{
"t": "W80",
"i": 3
},
{
"t": "H70",
"i": 4
},
{
"t": "Border",
"i": 0
},
{
"t": "L 20",
"i": 3
},
{
"t": "T 22",
"i": 4
},
{
"t": "R 23",
"i": 3
},
{
"t": "B 26",
"i": 4
},
{
"t": "Pivot",
"i": 0
},
{
"t": "Center",
"i": 3
},
{
"t": "Pivot Unit Mode",
"i": 0
},
{
"t": "Normalized",
"i": 3
},
{
"t": "Custom Pivot",
"i": 0
},
{
"t": "X0.5",
"i": 3
},
{
"t": "Y0.5",
"i": 4
}
],
"cols": null,
"w": 1400,
"h": 907
}
},
"95b8e04f7f4f": {
"type": "ocr",
"title": "• Info",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "• Info",
"i": 3
},
{
"t": "TI Content Size Fitter",
"i": 3
},
{
"t": "Horizontal Fit",
"i": 3
},
{
"t": "Preferred Size",
"i": 4
},
{
"t": "Vertical Fit",
"i": 3
},
{
"t": "Preferred Size",
"i": 4
},
{
"t": "34234r234233423432C424234",
"i": 0
},
{
"t": "LiberationSans SDF Material （Material）",
"i": 3
},
{
"t": "②让",
"i": 4
},
{
"t": "Shader|TextMeshPro/Mobile/Dista~ || Edit...",
"i": 3
},
{
"t": "Shader",
"i": 3
},
{
"t": "Edit...",
"i": 4
},
{
"t": "已添加",
"i": 3
},
{
"t": "签入",
"i": 4
},
{
"t": "撤销",
"i": 4
}
],
"cols": null,
"w": 1400,
"h": 307
}
},
"9696c76d9a79": {
"type": "ocr",
"title": "Option A",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Option A",
"i": 1
},
{
"t": "< Option A",
"i": 0
},
{
"t": "Option B",
"i": 2
},
{
"t": "Option C",
"i": 2
}
],
"cols": null,
"w": 254,
"h": 152
}
},
"98d482cd4ae6": {
"type": "ocr",
"title": "• Project / 0 Inspector",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "• Project",
"i": 0
},
{
"t": "份 Unity Version Control",
"i": 4
},
{
"t": "Q",
"i": 2
},
{
"t": "Assets",
"i": 2
},
{
"t": "AddressableAssetsData",
"i": 4
},
{
"t": "①.",
"i": 2
},
{
"t": "Resources",
"i": 4
},
{
"t": "Editor",
"i": 4
},
{
"t": "Font&Materials",
"i": 4
},
{
"t": "Script",
"i": 4
},
{
"t": "Cube",
"i": 4
},
{
"t": "MrTangData",
"i": 4
},
{
"t": "MyDatalest",
"i": 4
},
{
"t": "New Material",
"i": 4
},
{
"t": "ScriptableObject",
"i": 4
},
{
"t": "$］",
"i": 4
},
{
"t": "Temp",
"i": 4
},
{
"t": "Secnce",
"i": 3
},
{
"t": "分 SampleScene",
"i": 4
},
{
"t": "Settings",
"i": 3
}
],
"title": "• Project"
},
{
"kind": "lines",
"lines": [
{
"t": "0 Inspector",
"i": 1
},
{
"t": "◎30",
"i": 0
},
{
"t": "Sample Scene （Scene Asset）",
"i": 2
},
{
"t": "Addressable",
"i": 1
},
{
"t": "Assets/Scenes/SampleS",
"i": 3
},
{
"t": "Group",
"i": 1
},
{
"t": "Defe",
"i": 4
},
{
"t": "a Checked out",
"i": 1
}
],
"title": "0 Inspector"
}
],
"w": 895,
"h": 459
}
},
"9960b07c05f9": {
"type": "ocr",
"title": "Box Collider 2D",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Box Collider 2D",
"i": 1
},
{
"t": "Edit Collider",
"i": 0
},
{
"t": "Material",
"i": 0
},
{
"t": "None （Physics Material 2D）",
"i": 3
},
{
"t": "Is Trigger",
"i": 0
},
{
"t": "需要打开这2个",
"i": 4
},
{
"t": "Used By Effector",
"i": 0
},
{
"t": "Used By Composite",
"i": 0
},
{
"t": "Auto Tiling",
"i": 0
},
{
"t": "Offset",
"i": 0
},
{
"t": "XO",
"i": 3
},
{
"t": "Y",
"i": 4
},
{
"t": "0",
"i": 4
},
{
"t": "Size",
"i": 0
},
{
"t": "× 1",
"i": 3
},
{
"t": "Y1",
"i": 4
},
{
"t": "Edge Radius",
"i": 0
},
{
"t": "0",
"i": 3
}
],
"cols": null,
"w": 719,
"h": 355
}
},
"9b0708b281de": {
"type": "ocr",
"title": "Audio：",
"data": {
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"Maximize On Play Mute Audio Stats",
"Gizmos"
],
[
"Statistics",
""
]
]
},
{
"h": "Audio：",
"rows": [
[
"Level： -74.8dB",
"DSP load: 0.3%"
],
[
"Clipping:0.0%",
"Stream load: 0.0%"
],
[
"Graphics：",
"2931.7 FPS （0.3ms）"
],
[
"目 Cons",
""
],
[
"CPU: main 0.3ms render thread 0.2ms",
""
],
[
"Batrhes:3 Saved by batching: 0",
"Clear"
],
[
"Trisk15",
"Verts: 116"
]
]
},
{
"h": "Screen: 946x532- 5.8 MB",
"rows": [
[
"SetPass calls: 3",
"Shadow casters: 0"
]
]
}
],
"lines": null,
"cols": null,
"w": 709,
"h": 434
}
},
"9b6ee3826817": {
"type": "ocr",
"title": "可 Package Manager",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "可 Package Manager",
"i": 0
},
{
"t": "Clear Filters",
"i": 3
},
{
"t": "Sort: Name （asc）",
"i": 1
},
{
"t": "Filters ~",
"i": 2
},
{
"t": "Addressables",
"i": 3
},
{
"t": "address",
"i": 1
},
{
"t": "Q",
"i": 1
},
{
"t": "2.2.2•July 03, 2024",
"i": 3
},
{
"t": "Packages",
"i": 1
},
{
"t": "From Unity Registry by Unity Technc",
"i": 3
},
{
"t": "Addressables",
"i": 1
},
{
"t": "2.2.2",
"i": 2
},
{
"t": "com.unity.addressables",
"i": 3
},
{
"t": "Addressables for….",
"i": 1
},
{
"t": "1.0..•",
"i": 2
},
{
"t": "Documentation",
"i": 3
},
{
"t": "Changelog",
"i": 4
},
{
"t": "Licen",
"i": 4
},
{
"t": "Unity Registry",
"i": 0
},
{
"t": "Install",
"i": 3
},
{
"t": "Description",
"i": 3
},
{
"t": "Version History",
"i": 4
},
{
"t": "Depe",
"i": 4
}
],
"cols": null,
"w": 718,
"h": 387
}
},
"9ba9b886aef0": {
"type": "ocr",
"title": "Assets",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Assets",
"i": 0
},
{
"t": "Settings",
"i": 2
},
{
"t": "Tutoriallnfo",
"i": 3
},
{
"t": "New Sprite...",
"i": 4
},
{
"t": "Audio",
"i": 0
},
{
"t": "Resources",
"i": 1
},
{
"t": "Scenes",
"i": 1
},
{
"t": "Script",
"i": 2
},
{
"t": "TextMesh P...",
"i": 3
},
{
"t": "InputSyste..",
"i": 4
},
{
"t": "Readme",
"i": 4
}
],
"cols": null,
"w": 1300,
"h": 307
}
},
"9bed31873f2c": {
"type": "ocr",
"title": "B：",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "B：",
"i": 4
},
{
"t": "0 Inspector",
"i": 0
},
{
"t": "New Animator Override Controller （Animator Override Controller） ：",
"i": 0
},
{
"t": "Open",
"i": 4
},
{
"t": "已添加.",
"i": 0
},
{
"t": "撒销",
"i": 4
},
{
"t": "签入",
"i": 4
},
{
"t": "关联复用的状态机",
"i": 2
},
{
"t": "Controller",
"i": 0
},
{
"t": "品 New Animator Controller",
"i": 2
},
{
"t": "Original",
"i": 0
},
{
"t": "Override",
"i": 3
},
{
"t": "Tict io Emntu",
"i": 0
}
],
"cols": null,
"w": 726,
"h": 288
}
},
"9cda0fc0de76": {
"type": "ocr",
"title": "Addressables Groups / 图内文字",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "Addressables Groups",
"i": 1
},
{
"t": "Addressables Groups",
"i": 0
},
{
"t": "New ~ Profile: Default",
"i": 0
},
{
"t": "~|Tools v",
"i": 4
},
{
"t": "Group Name \\ Addressable Name",
"i": 1
},
{
"t": "Texture",
"i": 1
},
{
"t": "V GameObject",
"i": 1
},
{
"t": "Assets/addressable_lesson3.prefab",
"i": 2
},
{
"t": "Sprite",
"i": 1
},
{
"t": "Atlas",
"i": 1
},
{
"t": "Material",
"i": 1
}
],
"title": "Addressables Groups"
},
{
"kind": "lines",
"lines": [
{
"t": "X",
"i": 4
},
{
"t": "Q",
"i": 3
},
{
"t": "choose existing label or type to create a new on",
"i": 3
},
{
"t": "Play Mode Script Build-",
"i": 0
},
{
"t": "Q",
"i": 2
},
{
"t": "default",
"i": 3
},
{
"t": "Path",
"i": 0
},
{
"t": "Manage Labels...",
"i": 3
},
{
"t": "Assets/addressable_lesso Opens the Labels window for managing adding",
"i": 0
},
{
"t": "and removing labels",
"i": 2
}
],
"title": "图内文字"
}
],
"w": 1398,
"h": 307
}
},
"9d1e2d66fefa": {
"type": "ocr",
"title": "# Project Settings / Editor",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "# Project Settings",
"i": 0
},
{
"t": "Adaptive Performance",
"i": 2
},
{
"t": "Audio",
"i": 2
},
{
"t": "Burst AOT Settings",
"i": 2
},
{
"t": "Editor",
"i": 2
},
{
"t": "Graphics",
"i": 2
},
{
"t": "Input Manager",
"i": 2
},
{
"t": "v Input System Package",
"i": 0
},
{
"t": "Settings",
"i": 4
},
{
"t": "Memory Settings",
"i": 2
},
{
"t": "Package Manager",
"i": 2
},
{
"t": "V Physics",
"i": 0
},
{
"t": "settings",
"i": 4
},
{
"t": "Physics 2D",
"i": 2
},
{
"t": "Player",
"i": 2
},
{
"t": "Preset Manager",
"i": 2
},
{
"t": "Quality",
"i": 2
},
{
"t": "Scene Template",
"i": 2
},
{
"t": "Script Execution Order",
"i": 2
},
{
"t": "Services",
"i": 2
},
{
"t": "ShaderGraph",
"i": 2
},
{
"t": "Tags and Layers",
"i": 2
},
{
"t": "V TextMesh Pro",
"i": 0
},
{
"t": "Settings",
"i": 4
},
{
"t": "Time",
"i": 2
},
{
"t": "Timeline",
"i": 2
},
{
"t": "Ul Toolkit",
"i": 2
},
{
"t": "Version Control",
"i": 2
},
{
"t": "Visual Scripting",
"i": 2
},
{
"t": "XR Plugin Management",
"i": 2
}
],
"title": "# Project Settings"
},
{
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"Q",
""
]
]
},
{
"h": "Editor",
"rows": [
[
"Standby Import Worker Count",
"2"
],
[
"Idlle Import Worker Shutdown Delay",
"60"
]
]
},
{
"h": "Exactly Match Referenced Clip Names",
"rows": [
[
"Cache Server （project specific）",
"Learn more.."
],
[
"Mode",
"Use global settings （stored in preferences）"
],
[
"Disabled",
""
]
]
},
{
"h": "Editing Environments",
"rows": [
[
"Regular Environment",
"None （Scene Asset）"
],
[
"Ul Environment",
"None （Scene Asset）"
]
]
},
{
"h": "Sprite Atlas",
"rows": [
[
"Mode",
"Sprite Atlas V1 - Always Enabled"
],
[
"Max SpriteAtlas Cache Size （GB）",
"Disabled"
],
[
"C# Project Generation",
"Sprite Atlas V1 - Enabled For Builds"
],
[
"Additional extensions to include",
"< Sprite Atlas V1 - Always Enabled"
],
[
"Root namespace",
"Sprite Atlas V2 - Enabled"
],
[
"Texture Compressors",
"Sprite Atlas V2 - Enabled for Builds"
],
[
"BC7 Compressor",
"Detault"
],
[
"ETC Compressor",
"Default"
],
[
"Fast",
"etcpak"
],
[
"Normal",
"ETCPACK Fast"
],
[
"Best",
"Etc2Comp Best"
]
]
},
{
"h": "Line Endings For New Scripts",
"rows": [
[
"Mode",
"OS Native"
]
]
}
],
"title": "Editor"
}
],
"w": 1215,
"h": 1011
}
},
"9ee0f53c4919": {
"type": "ocr",
"title": "SRGB （Color Texture）",
"data": {
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"Texture Type",
"Default"
],
[
"Texture Shape",
"20"
]
]
},
{
"h": "SRGB （Color Texture）",
"rows": [
[
"Alpha Source",
"None"
]
]
},
{
"h": "Advanced",
"rows": [
[
"Non-Power of 2",
"None"
]
]
},
{
"h": "Streaming Mipmaps",
"rows": [
[
"3",
""
]
]
},
{
"h": "Border MipMaps",
"rows": [
[
"Mip Map Filtering",
"BOX"
]
]
},
{
"h": "Mip Maps Preserve Coverage",
"rows": [
[
"Alpha Cutoff Value",
"0.5"
]
]
},
{
"h": "Fade Range",
"rows": [
[
"Wrap Mode",
"Repeat"
],
[
"Filter Mode 4",
"Trilinear"
]
]
},
{
"h": "Default",
"rows": [
[
"Max Size",
"2048"
],
[
"Resize Algorithm 5",
"Mitchell"
],
[
"Format",
"Automatic"
],
[
"Compression",
"Normal Quality"
]
]
},
{
"h": "Use Crunch Compression",
"rows": [
[
"Revert",
"Apply"
]
]
}
],
"lines": null,
"cols": null,
"w": 579,
"h": 619
}
},
"9f1bcf543a9b": {
"type": "ocr",
"title": "Nav Mesh Agent 参数详解",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Nav Mesh Agent 参数详解",
"i": 0
},
{
"t": "掌握核心参数，让AI移动更智能！",
"i": 1
},
{
"t": "Agent Type 代理类型",
"i": 4
},
{
"t": "K Nav Mesh Agent",
"i": 0
},
{
"t": "②$：",
"i": 2
},
{
"t": "配合Agents页签使用",
"i": 4
},
{
"t": "Agent Type",
"i": 0
},
{
"t": "Humanoid",
"i": 2
},
{
"t": "Base Offset",
"i": 0
},
{
"t": "Base Offset 基础偏移",
"i": 4
},
{
"t": "Steering",
"i": 0
},
{
"t": "基础偏移值，相对对象轴心点的高度偏移",
"i": 4
},
{
"t": "Speed",
"i": 0
},
{
"t": "3.5",
"i": 2
},
{
"t": "Angular Speed",
"i": 0
},
{
"t": "120",
"i": 2
},
{
"t": "Steering 移动设置",
"i": 4
},
{
"t": "Acceleration",
"i": 0
},
{
"t": "8",
"i": 2
},
{
"t": "移动速度",
"i": 4
},
{
"t": "Speed",
"i": 4
},
{
"t": "角速度",
"i": 4
},
{
"t": "Stopping Distance",
"i": 0
},
{
"t": "0",
"i": 2
},
{
"t": "Angular Speed",
"i": 4
},
{
"t": "Acceleration",
"i": 4
},
{
"t": "加速度",
"i": 4
},
{
"t": "Auto Braking",
"i": 0
},
{
"t": "Stopping Distance",
"i": 4
},
{
"t": "停止距离",
"i": 4
},
{
"t": "Auto Braking",
"i": 4
},
{
"t": "自动刹车",
"i": 4
},
{
"t": "Obstacle Avoidance",
"i": 0
},
{
"t": "Obstacle Avoidance 避障设置",
"i": 4
},
{
"t": "Radius",
"i": 0
},
{
"t": "0.5",
"i": 2
},
{
"t": "Radius 半径",
"i": 4
},
{
"t": "Height",
"i": 0
},
{
"t": "2",
"i": 2
},
{
"t": "半径，用于计算障碍物和其它寻路",
"i": 4
},
{
"t": "Quality",
"i": 0
},
{
"t": "High Quality",
"i": 2
},
{
"t": "对象之间的碰撞",
"i": 4
},
{
"t": "Priority",
"i": 0
},
{
"t": "50",
"i": 2
},
{
"t": "Height 高度",
"i": 4
},
{
"t": "高度，通过头顶障碍物的用于计算",
"i": 4
},
{
"t": "高度间隈使用",
"i": 4
},
{
"t": "Path Finding",
"i": 0
},
{
"t": "Quality 质量",
"i": 4
},
{
"t": "Auto Traverse Off Mesh Link",
"i": 0
},
{
"t": "障碍躲避品质，越高躲避隙碍越准确，",
"i": 4
},
{
"t": "Auto Repath",
"i": 0
},
{
"t": "但是性能消耗较大，如果不想主动避开",
"i": 4
},
{
"t": "其它动态障碍母，可以设置为无，则",
"i": 4
},
{
"t": "只会解析碰揸",
"i": 4
},
{
"t": "Area Mask",
"i": 0
},
{
"t": "Mixed...",
"i": 2
},
{
"t": "Priority 优先级",
"i": 4
},
{
"t": "优先级，0~99，避障时，数字较小的",
"i": 4
},
{
"t": "障碍物表示较高的优先级",
"i": 4
},
{
"t": "优先级低的会忽略避障",
"i": 4
},
{
"t": "小贴士",
"i": 0
},
{
"t": "Path Finding 路径寻找规则",
"i": 3
},
{
"t": "合理调整这些参数，可以让你的AI：",
"i": 0
},
{
"t": "v 移动更自然流畅",
"i": 0
},
{
"t": "Auto Traverse OffMesh Link",
"i": 3
},
{
"t": "避障更智能高效",
"i": 0
},
{
"t": "是否开启自动遍历网格外的其它网格连接",
"i": 3
},
{
"t": "如果要自定义判断，则关闭此功能",
"i": 3
},
{
"t": "性能优化更出色",
"i": 0
},
{
"t": "适应各种复杂场景",
"i": 0
},
{
"t": "Auto Repath",
"i": 3
},
{
"t": "是否开启自动重新设路点",
"i": 3
},
{
"t": "如果开启，当到达路径后段时会再次尝试",
"i": 3
},
{
"t": "寻路，当没有到达目标的路径时，会生成",
"i": 3
},
{
"t": "一条到达与目标位置最近的可达点",
"i": 3
},
{
"t": "Area Mask 寻路的区域",
"i": 3
},
{
"t": "寻路时，考虑的区域",
"i": 3
},
{
"t": "如果寻路时不想考虑某些区域，则取消选中",
"i": 3
}
],
"cols": null,
"w": 788,
"h": 1400
}
},
"a10dd7f0f556": {
"type": "ocr",
"title": "线性和球形插值的区别",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "线性和球形插值的区别",
"i": 0
},
{
"t": "向量A（10,0,0）",
"i": 2
},
{
"t": "向量B（0,10,0）",
"i": 2
},
{
"t": "球性：直接旋转，弧形轨迹",
"i": 4
},
{
"t": "线性：直接平移，直线轨迹",
"i": 1
}
],
"cols": null,
"w": 799,
"h": 358
}
},
"a313d220421b": {
"type": "ocr",
"title": "Speed：动通的就认速度",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Speed：动通的就认速度",
"i": 2
},
{
"t": "Muitiplier：控制速度的风数，如果優使用共要勾进的",
"i": 2
},
{
"t": "Motien Timne：运动的时间，如果要使用带费公鸡的",
"i": 2
},
{
"t": "Parameter這中配合的參数fogt处型",
"i": 2
},
{
"t": "果要配合参数快用造中旁边的Parameier关联也数，伊我",
"i": 2
},
{
"t": "拭态参数",
"i": 1
},
{
"t": "旁边的Parameter关联參欺，参我题fout别型",
"i": 2
},
{
"t": "Foot KK：是西没涌Foot以，遇用于人形人考动酒",
"i": 2
},
{
"t": "动画化的属性写笆默认值，",
"i": 2
},
{
"t": "Solo：仅通饮试过控",
"i": 2
},
{
"t": "1 AnimaterTransitionB.Jse",
"i": 2
},
{
"t": "Soto Me",
"i": 3
},
{
"t": "Humanciadle-> Humincickun",
"i": 2
},
{
"t": "可以在这里为动雨过溃改名，如果不改",
"i": 4
},
{
"t": "“黑一状态名’->“果一状态名",
"i": 4
},
{
"t": "Settings",
"i": 2
},
{
"t": "Bit Time",
"i": 2
},
{
"t": "08958334",
"i": 2
},
{
"t": "Has Evit Time：是否有過出时间，如果勾选，些切没助",
"i": 4
},
{
"t": "Fted Duration",
"i": 2
},
{
"t": "西时，动西一定是精软到下方的Eit Time（百分比）的",
"i": 4
},
{
"t": "Teansition Duration ts",
"i": 2
},
{
"t": "025",
"i": 2
},
{
"t": "时间时才过凌到下一个动画",
"i": 4
},
{
"t": "Transition Oftset",
"i": 2
},
{
"t": "Exit Time：過出时间，当选择上方的Has Evt Timed",
"i": 4
},
{
"t": "诚值决定了过遗生效的我坊时间。诚值可以大于1，如果",
"i": 4
},
{
"t": "就会过澧。如果大于1。此如045，那么动画疼酒环4,5次",
"i": 4
},
{
"t": "Faed Duration：退中后，下为的Traition Durationid",
"i": 4
},
{
"t": "Cendtons",
"i": 2
},
{
"t": "个蓝色躺头包事区城",
"i": 4
},
{
"t": "Transition Offset：过波到目标找老的呢她權我的时间窗",
"i": 4
},
{
"t": "动作和动作之闪達线",
"i": 1
},
{
"t": "你可以建解为切入下一个狄态的切入点",
"i": 4
},
{
"t": "None：不在必加0任何过控",
"i": 4
},
{
"t": "Currenn State：特当前状态议室推队",
"i": 4
},
{
"t": "Nexn State：使下一个执态的过演进行排队",
"i": 4
},
{
"t": "3d动画的使用",
"i": 0
},
{
"t": "Currenn State Then Nexn State：格当前块态的沙溶和",
"i": 4
},
{
"t": "下一个状态的过演都依次款",
"i": 4
},
{
"t": "Next State Thne Current State：将下一状态的过演和",
"i": 4
},
{
"t": "Ordered Interruption：当粉过浪是否可在不考忠顺来",
"i": 4
},
{
"t": "的溫又下被具已淡中啊",
"i": 4
},
{
"t": "选中时，我形谢戏过没戏当前过谈討，会中断",
"i": 4
},
{
"t": "Conditions：过该条件",
"i": 4
},
{
"t": "妇單没有动凌条件，只公多虑Eot Time",
"i": 4
},
{
"t": "Any State •> Humanoididtle",
"i": 2
},
{
"t": "+0",
"i": 3
},
{
"t": "AnyState -> Humsnoids",
"i": 2
},
{
"t": "Has Eut Time",
"i": 2
},
{
"t": "Evt Time",
"i": 2
},
{
"t": "02",
"i": 3
},
{
"t": "Transition Offiset",
"i": 2
},
{
"t": "Can Transition ToSell",
"i": 2
},
{
"t": "Preview source state",
"i": 2
},
{
"t": "Condticns",
"i": 2
},
{
"t": "Can Transinion To self：是否可以过没到自己",
"i": 4
},
{
"t": "List is Empsy",
"i": 2
},
{
"t": "Preew source shae： 长五名过生：",
"i": 4
},
{
"t": "珂以煦羁从任典状态切婆到当前状孝的副凌欢黑",
"i": 4
},
{
"t": "请使用歲料区的模坚，没買它的状态示，我中对以通过",
"i": 1
},
{
"t": "w键控制其前远，S键控制其后選，空格键控制其終跃，",
"i": 1
},
{
"t": "拣习盟",
"i": 1
}
],
"cols": null,
"w": 1071,
"h": 1400
}
},
"a60cb1aa1934": {
"type": "ocr",
"title": "语法规则 / 键值对表示：",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "语法规则",
"i": 0
},
{
"t": "符号含义：",
"i": 2
},
{
"t": "大括号｛｝—— 对象",
"i": 2
},
{
"t": "中括号［］一一 数组",
"i": 2
},
{
"t": "冒号： —— 键值对对应关系",
"i": 2
},
{
"t": "逗号， —— 数据分割",
"i": 2
},
{
"t": "双引号“—键名/字符串",
"i": 2
}
],
"title": "语法规则"
},
{
"kind": "lines",
"lines": [
{
"t": "键值对表示：",
"i": 0
},
{
"t": "\"键名”：值内容",
"i": 0
},
{
"t": "值类型：",
"i": 0
},
{
"t": "数字（整数或浮点）",
"i": 0
},
{
"t": "字符串 true或false",
"i": 0
},
{
"t": "数组 对象",
"i": 0
},
{
"t": "null",
"i": 4
}
],
"title": "键值对表示："
}
],
"w": 604,
"h": 248
}
},
"a856182baab7": {
"type": "ocr",
"title": "sets / Main Settings",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "sets",
"i": 0
},
{
"t": "Resources",
"i": 0
},
{
"t": "Font&Materials",
"i": 3
},
{
"t": "IMPACT SDF",
"i": 4
},
{
"t": "New TMP Color Gradient",
"i": 4
},
{
"t": "Scenes",
"i": 0
},
{
"t": "Settings",
"i": 0
},
{
"t": "TextMesh Pro",
"i": 0
},
{
"t": "Tree_Textures",
"i": 0
},
{
"t": "Tutoriallnto",
"i": 0
},
{
"t": "mputsystem_Actions",
"i": 1
},
{
"t": "New Animator Controller",
"i": 0
},
{
"t": "New Animator Override Controller",
"i": 0
},
{
"t": "NewMonoBehaviourScript",
"i": 0
},
{
"t": "Readme",
"i": 0
},
{
"t": "Tree",
"i": 0
},
{
"t": "kages",
"i": 0
}
],
"title": "sets"
},
{
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"Text Input",
"Enable RTL Editor"
]
]
},
{
"h": "<style=\"name\"> 232425</style>",
"rows": [
[
"Text Style",
"Normal"
]
]
},
{
"h": "Main Settings",
"rows": [
[
"Font Asset",
"JLiberationSans SDF （TNO"
],
[
"Material Preset",
"LiberationSans SDF Material、"
],
[
"ront Style U",
"S"
],
[
"ab AB",
"SC"
],
[
"Fonts",
"36"
]
]
},
{
"h": "Color Gradient",
"rows": [
[
"Color Preset",
"None （TMP_Color Gradien O"
],
[
"Color Mode.",
"Four Corners Gradlent"
]
]
},
{
"h": "Colors",
"rows": [
[
"#FFFFFFFF",
""
]
]
}
],
"title": "Main Settings"
}
],
"w": 625,
"h": 441
}
},
"a8b2ca07d310": {
"type": "ocr",
"title": "Freeze Rotatic",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Freeze Rotatic",
"i": 0
},
{
"t": "Q Collider 2d|",
"i": 3
},
{
"t": "Info",
"i": 0
},
{
"t": "Search",
"i": 4
},
{
"t": "Sprites-D",
"i": 1
},
{
"t": "Box Collider 2D",
"i": 3
},
{
"t": "Capsule Collider 2D",
"i": 3
},
{
"t": "Shader",
"i": 1
},
{
"t": "Circle Collider 2D",
"i": 3
},
{
"t": "P Composite ColiderP",
"i": 3
},
{
"t": "ZEdge Collider 2D",
"i": 3
},
{
"t": "Polygon Collider 2D",
"i": 3
},
{
"t": "由 Tilemap Collider 2D",
"i": 3
},
{
"t": "New script",
"i": 3
}
],
"cols": null,
"w": 695,
"h": 354
}
},
"a9399900b7f2": {
"type": "ocr",
"title": "Addressables Groups / Addressables Group",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "Addressables Groups",
"i": 0
},
{
"t": "New ~ Profile: Default",
"i": 0
},
{
"t": "vTools",
"i": 4
},
{
"t": "Group Name \\ Addressable Name",
"i": 1
},
{
"t": "V Default Local Group （Default）",
"i": 1
},
{
"t": "Sphere Variant",
"i": 2
},
{
"t": "Packed Assets",
"i": 1
},
{
"t": "Packed Assets1",
"i": 1
},
{
"t": "> Built In Data",
"i": 1
}
],
"title": "Addressables Groups"
},
{
"kind": "lines",
"lines": [
{
"t": "Addressables Groups",
"i": 0
},
{
"t": "Play Mode Script 、",
"i": 1
},
{
"t": "Build",
"i": 3
},
{
"t": "Q",
"i": 4
},
{
"t": "F",
"i": 1
},
{
"t": "V Use Asset Database （fastest）",
"i": 1
},
{
"t": "Labels",
"i": 4
},
{
"t": "Simulate Groups （advanced）",
"i": 1
},
{
"t": "nt.p",
"i": 4
},
{
"t": "Use Existing Build （OSX）",
"i": 1
}
],
"title": "Addressables Groups"
}
],
"w": 1394,
"h": 348
}
},
"a95403da6fdf": {
"type": "ocr",
"title": "Lesson10_Exercised*",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Lesson10_Exercised*",
"i": 0
},
{
"t": "Main Camera",
"i": 2
},
{
"t": "Player",
"i": 2
},
{
"t": "GameObject",
"i": 4
}
],
"cols": null,
"w": 399,
"h": 127
}
},
"a9844800fe97": {
"type": "ocr",
"title": "中 Project Settings",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "中 Project Settings",
"i": 0
},
{
"t": "：口X",
"i": 4
},
{
"t": "Audio",
"i": 0
},
{
"t": "Editor",
"i": 1
},
{
"t": "Editor",
"i": 0
},
{
"t": "Force Text",
"i": 3
},
{
"t": "Mode",
"i": 1
},
{
"t": "Graphics",
"i": 0
},
{
"t": "Input Manaqer",
"i": 0
},
{
"t": "Default Behaviour Mode",
"i": 1
},
{
"t": "Packaae Manaaer",
"i": 0
},
{
"t": "2D",
"i": 3
},
{
"t": "Mode",
"i": 1
},
{
"t": "Physics",
"i": 0
},
{
"t": "Phvsics 2D",
"i": 0
},
{
"t": "Asset Pipeline",
"i": 1
},
{
"t": "Plaver",
"i": 0
},
{
"t": "Version 2",
"i": 3
},
{
"t": "Mode",
"i": 1
},
{
"t": "Preset Manaqer",
"i": 0
},
{
"t": "Active version",
"i": 1
},
{
"t": "2",
"i": 3
},
{
"t": "Qualitv",
"i": 0
},
{
"t": "Script Execution Order",
"i": 0
},
{
"t": "Cache Server （project specific）",
"i": 1
},
{
"t": "Taas and Lavers",
"i": 0
},
{
"t": "Mode",
"i": 1
},
{
"t": "Use global settings （stored in preferences）",
"i": 3
},
{
"t": "TextMesh Pro",
"i": 0
},
{
"t": "Disabled",
"i": 3
},
{
"t": "Time",
"i": 0
},
{
"t": "VFX",
"i": 0
},
{
"t": "Prefab Editing Environments",
"i": 1
},
{
"t": "XR Pluain Manaaement",
"i": 0
},
{
"t": "Regular Environment",
"i": 1
},
{
"t": "4 None （Scene Asset）",
"i": 3
},
{
"t": "Ul Environment",
"i": 1
},
{
"t": "4 None （Scene Asset）",
"i": 3
},
{
"t": "Graphics",
"i": 1
},
{
"t": "Show Lightmap Resolution Overlay",
"i": 1
},
{
"t": "Use legacy Light Probe sample counts",
"i": 1
},
{
"t": "Sprite Packer",
"i": 1
},
{
"t": "Enabled For Builds（Legacy Sprite Packer）",
"i": 3
},
{
"t": "Mode",
"i": 1
},
{
"t": "Padding Power （Legacy Sprite Packer）",
"i": 1
},
{
"t": "Disabled",
"i": 3
},
{
"t": "Enabled For Builds（Legacy Sprite Packer）",
"i": 3
},
{
"t": "C#f Project Generation",
"i": 1
},
{
"t": "Additional extensions to include",
"i": 1
},
{
"t": "Always Enabled（Legacy Sprite Packer）",
"i": 3
},
{
"t": "Root namespace",
"i": 1
},
{
"t": "Enabled For Builds",
"i": 3
},
{
"t": "Always Enabled",
"i": 3
},
{
"t": "ETC Texture Compressor",
"i": 1
},
{
"t": "Behaviour",
"i": 1
},
{
"t": "Default",
"i": 3
},
{
"t": "Fast",
"i": 1
},
{
"t": "etcpak",
"i": 3
},
{
"t": "Normal",
"i": 1
},
{
"t": "ETCPACK Fast",
"i": 3
},
{
"t": "Etc2Comp Best",
"i": 3
},
{
"t": "Best",
"i": 1
}
],
"cols": null,
"w": 1400,
"h": 861
}
},
"a9a13e2f2aef": {
"type": "ocr",
"title": "口 Project",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "口 Project",
"i": 0
},
{
"t": "0 Inspector",
"i": 2
},
{
"t": "©27",
"i": 2
},
{
"t": "Canvas Renderer",
"i": 2
},
{
"t": "Assets",
"i": 0
},
{
"t": "Cull Transparent Mesh",
"i": 2
},
{
"t": "Resources",
"i": 0
},
{
"t": "Scenes",
"i": 0
},
{
"t": "TextMeshPro - Text （Ul）",
"i": 2
},
{
"t": "Settings",
"i": 0
},
{
"t": "TextMesh Pro",
"i": 0
},
{
"t": "Enable RTL Editor",
"i": 4
},
{
"t": "Text Input",
"i": 2
},
{
"t": "Examples & Extras",
"i": 1
},
{
"t": "Fonts",
"i": 1
},
{
"t": "Resources",
"i": 1
},
{
"t": "New Text",
"i": 2
},
{
"t": "Fonts & Materials",
"i": 1
},
{
"t": "Sprite Assets",
"i": 1
},
{
"t": "Style Sheets",
"i": 1
},
{
"t": "Default Style Sheet",
"i": 1
},
{
"t": "LineBreaking Following Characters",
"i": 1
},
{
"t": "Text Style",
"i": 2
},
{
"t": "Normal",
"i": 3
},
{
"t": "Line Breaking Leading Characters",
"i": 1
},
{
"t": "Main Settings",
"i": 2
},
{
"t": "< Normal",
"i": 3
},
{
"t": "TMP Settings",
"i": 1
},
{
"t": "Font Asset",
"i": 2
},
{
"t": "H1",
"i": 4
},
{
"t": "TMP_Font Asset）",
"i": 4
},
{
"t": "a Shaders",
"i": 0
},
{
"t": "$ Sprites",
"i": 0
},
{
"t": "Material Preset",
"i": 2
},
{
"t": "erial",
"i": 4
},
{
"t": "Quote",
"i": 4
},
{
"t": "Tree_Textures",
"i": 0
},
{
"t": "Font Style",
"i": 2
},
{
"t": "AB",
"i": 4
},
{
"t": "SC",
"i": 4
},
{
"t": "S",
"i": 4
},
{
"t": "ab",
"i": 4
},
{
"t": "A",
"i": 4
},
{
"t": "Tutoriallnfo",
"i": 0
},
{
"t": "Font Size",
"i": 2
},
{
"t": "InputSystem_Actions",
"i": 0
},
{
"t": "Link",
"i": 4
},
{
"t": "Auto Size",
"i": 2
},
{
"t": "New Animator Controller",
"i": 0
},
{
"t": "Title",
"i": 4
},
{
"t": "New Animator Override Controller",
"i": 0
},
{
"t": "Vertex Color",
"i": 2
},
{
"t": "NewMonoBehaviourScript",
"i": 0
},
{
"t": "H2",
"i": 4
},
{
"t": "Color Gradient",
"i": 2
},
{
"t": "Go",
"i": 0
},
{
"t": "Readme",
"i": 0
},
{
"t": "H3",
"i": 4
},
{
"t": "Tree",
"i": 0
},
{
"t": "Color Preset",
"i": 2
},
{
"t": "ient）",
"i": 4
},
{
"t": "Packages",
"i": 0
},
{
"t": "C1",
"i": 4
},
{
"t": "Color Mode",
"i": 2
},
{
"t": "Colors",
"i": 2
},
{
"t": "C2",
"i": 4
},
{
"t": "#FFFFFFFF",
"i": 4
},
{
"t": "#FFFFFFFF",
"i": 4
},
{
"t": "C3",
"i": 4
},
{
"t": "Override Tags",
"i": 2
},
{
"t": "Spacing Options （em）",
"i": 2
},
{
"t": "Character",
"i": 3
},
{
"t": "Word",
"i": 4
},
{
"t": "Line",
"i": 3
},
{
"t": "0",
"i": 4
},
{
"t": "Paragraph",
"i": 4
},
{
"t": "0",
"i": 4
},
{
"t": "Alignment",
"i": 2
},
{
"t": "Ai",
"i": 4
}
],
"cols": null,
"w": 1412,
"h": 907
}
},
"a9fa64c68e33": {
"type": "ocr",
"title": "Convex",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Convex",
"i": 1
},
{
"t": "勾选此复选框可启用 Convex。如果启用此属性，该 Mesh Collider 将",
"i": 1
},
{
"t": "与其他 Mesh Collider 发生碰撞。Convex Mesh Collider 最多 255个",
"i": 1
},
{
"t": "三角形。",
"i": 1
},
{
"t": "-None",
"i": 4
},
{
"t": "禁用下方列出的所有 Cooking Options",
"i": 4
},
{
"t": "-Everything",
"i": 4
},
{
"t": "启用下方列出的所有 Cooking Options。",
"i": 4
},
{
"t": "-Cook for Faster Simulation",
"i": 4
},
{
"t": "使物理引擎烹制网格以加快模拟速度。启用此设置后，这会运行一些额",
"i": 4
},
{
"t": "外步骤，以保证生成的网格对于运行时性能是最佳的。这会影响物理查",
"i": 4
},
{
"t": "询和接触生成的性能。禁用此设置后，物理引擎会使用更快的烹制速",
"i": 4
},
{
"t": "Mesh Collider",
"i": 0
},
{
"t": "Cooking Options",
"i": 1
},
{
"t": "度，并尽可能快速生成结果。因此，烹制的 Mesh Collider 可能不是最",
"i": 4
},
{
"t": "网格碰撞器",
"i": 0
},
{
"t": "启用或禁用影响物理引擎对网格处理方式的网格烹制选项。",
"i": 1
},
{
"t": "佳的。",
"i": 4
},
{
"t": "-Enable Mesh Cleaning",
"i": 4
},
{
"t": "使物理引擎清理网格。启用此设置后，烹制过程会尝试消除网格的退化",
"i": 4
},
{
"t": "三角形以及其他几何瑕疵。此过程生成的网格更适合于在碰撞检测中使",
"i": 4
},
{
"t": "用，往往可生成更准确的击中点。",
"i": 4
},
{
"t": "-Weld Colocated Vertices",
"i": 4
},
{
"t": "使物理引/擎在网格中删除相等的顶点。启用此设置后，物理引擎将合并",
"i": 4
},
{
"t": "具有相同位置的顶点。这对于运行时发生的碰撞反馈十分重要。",
"i": 4
},
{
"t": "Mesh",
"i": 1
},
{
"t": "引用需要用于碰撞的网格。",
"i": 1
}
],
"cols": null,
"w": 1182,
"h": 608
}
},
"aa6a8ae456bd": {
"type": "ocr",
"title": "Agents",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Agents",
"i": 2
},
{
"t": "Areas",
"i": 2
},
{
"t": "Bake",
"i": 3
},
{
"t": "Object",
"i": 3
},
{
"t": "Agent Types",
"i": 0
},
{
"t": "Humanoid",
"i": 0
},
{
"t": "R=0.5",
"i": 3
},
{
"t": "H=2",
"i": 3
},
{
"t": "0.75 -",
"i": 1
},
{
"t": "145°",
"i": 4
},
{
"t": "Name",
"i": 0
},
{
"t": "Humanoid",
"i": 2
},
{
"t": "Radius",
"i": 0
},
{
"t": "0.5",
"i": 2
},
{
"t": "Height",
"i": 0
},
{
"t": "2",
"i": 2
},
{
"t": "Step Height",
"i": 0
},
{
"t": "0.75",
"i": 2
},
{
"t": "Max Slope",
"i": 0
},
{
"t": "45",
"i": 4
},
{
"t": "Agents",
"i": 0
},
{
"t": "Agents（代理页签）",
"i": 2
},
{
"t": "代理页签",
"i": 0
},
{
"t": "用于配置寻路代理信息",
"i": 2
},
{
"t": "用于配置寻路代理信息",
"i": 0
}
],
"cols": null,
"w": 1400,
"h": 1159
}
},
"acab3a5f569a": {
"type": "ocr",
"title": "台 Lesson13*",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "台 Lesson13*",
"i": 0
},
{
"t": "G Main Camera",
"i": 2
},
{
"t": "0 Top",
"i": 2
},
{
"t": "1 Down1",
"i": 3
},
{
"t": "S Mid",
"i": 2
},
{
"t": "Y dead2",
"i": 3
},
{
"t": "⑦ Bot",
"i": 2
},
{
"t": "11",
"i": 4
},
{
"t": "ISO_Tle_Dirt01",
"i": 4
}
],
"cols": null,
"w": 418,
"h": 271
}
},
"adddb451d4cb": {
"type": "ocr",
"title": "Order In Layer",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Order In Layer",
"i": 2
},
{
"t": "Polygon Collider 2D",
"i": 4
},
{
"t": "Edit Collider",
"i": 0
}
],
"cols": null,
"w": 406,
"h": 117
}
},
"ae06d64c00fb": {
"type": "ocr",
"title": "Box Collider 2D",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Box Collider 2D",
"i": 4
},
{
"t": "Edit Collider",
"i": 0
},
{
"t": "Material",
"i": 0
},
{
"t": "Is Trigger",
"i": 0
},
{
"t": "Used By Effector",
"i": 0
},
{
"t": "Used By Composite",
"i": 0
},
{
"t": "Auto Tiling",
"i": 0
},
{
"t": "Offset",
"i": 0
},
{
"t": "Size",
"i": 0
},
{
"t": "Edge Radius",
"i": 0
}
],
"cols": null,
"w": 719,
"h": 355
}
},
"af3e2ee1f2c0": {
"type": "ocr",
"title": "各类型数据转字节数据",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "各类型数据转字节数据",
"i": 3
},
{
"t": "文件相关",
"i": 4
},
{
"t": "文件流相关",
"i": 4
},
{
"t": "文件夹相关",
"i": 4
},
{
"t": "文件操作相关",
"i": 3
},
{
"t": "public cLass Student",
"i": 4
},
{
"t": "public int age；",
"i": 4
},
{
"t": "基础知识",
"i": 2
},
{
"t": "public string name；",
"i": 4
},
{
"t": "public int number；",
"i": 4
},
{
"t": "public bool sex；",
"i": 4
},
{
"t": "为上图的Student类实现保存和读取2进制文件的方法",
"i": 4
},
{
"t": "练习题",
"i": 4
},
{
"t": "序列化",
"i": 4
},
{
"t": "反序列化",
"i": 4
},
{
"t": "C#类对象的序列化和反序列化",
"i": 3
},
{
"t": "加密",
"i": 4
},
{
"t": "请实现一个管理类，用于快捷读写自定义类对象数据",
"i": 4
},
{
"t": "数据持久化之2进制文",
"i": 0
},
{
"t": "练习题",
"i": 4
},
{
"t": "知识补充",
"i": 3
},
{
"t": "导入Excel相关dll包",
"i": 4
},
{
"t": "Excel数据读取",
"i": 4
},
{
"t": "需求分析",
"i": 3
},
{
"t": "制定配表规则",
"i": 4
},
{
"t": "读取Excel目录下所有excel文件",
"i": 4
},
{
"t": "实践小项目",
"i": 2
},
{
"t": "Excel配置表数据功能",
"i": 3
},
{
"t": "生成数据结构类",
"i": 4
},
{
"t": "生成Excel2进制数据",
"i": 4
},
{
"t": "表加载使用功能",
"i": 3
},
{
"t": "导出通用工具包",
"i": 3
}
],
"cols": null,
"w": 1470,
"h": 1216
}
},
"b0a9d5d1ff5b": {
"type": "ocr",
"title": "S6 Addressables Groups",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "S6 Addressables Groups",
"i": 0
},
{
"t": "X",
"i": 4
},
{
"t": "Addressables Groups",
"i": 0
},
{
"t": "New ~ Profile: Default",
"i": 0
},
{
"t": "v Tools",
"i": 1
},
{
"t": "Play Mode Script Build ~",
"i": 2
},
{
"t": "Q",
"i": 3
},
{
"t": "Labels",
"i": 4
},
{
"t": "Group Name \\ Addressable Name",
"i": 0
},
{
"t": "Path",
"i": 2
},
{
"t": "＞ Default Local Group （Default）",
"i": 0
},
{
"t": "GameObject",
"i": 0
},
{
"t": "Sprite",
"i": 0
},
{
"t": "Atlas",
"i": 0
},
{
"t": "Texture",
"i": 0
},
{
"t": "Material",
"i": 0
},
{
"t": "Data",
"i": 0
},
{
"t": "Lua",
"i": 0
},
{
"t": "Music",
"i": 0
},
{
"t": "Controller",
"i": 0
},
{
"t": "Scenes",
"i": 0
}
],
"cols": null,
"w": 1214,
"h": 548
}
},
"b0ed496842dc": {
"type": "ocr",
"title": "1D.S",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "1D.S",
"i": 0
},
{
"t": "ocale.",
"i": 1
},
{
"t": "Alas |oce",
"i": 2
},
{
"t": "Previous Page",
"i": 1
},
{
"t": "Page1/2",
"i": 3
},
{
"t": "Next Page",
"i": 4
},
{
"t": "Global Offsets & Scale",
"i": 0
},
{
"t": "0X：",
"i": 0
},
{
"t": "OY：",
"i": 2
},
{
"t": "ADV.",
"i": 3
},
{
"t": "SF.",
"i": 4
}
],
"cols": null,
"w": 557,
"h": 94
}
},
"b2fb5b47a493": {
"type": "ocr",
"title": "Audio Mixer",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Audio Mixer",
"i": 4
},
{
"t": "Create",
"i": 0
},
{
"t": "Material",
"i": 4
},
{
"t": "Show in Explorer",
"i": 0
},
{
"t": "Lens Flare",
"i": 4
},
{
"t": "Open",
"i": 0
},
{
"t": "Render Texture",
"i": 4
},
{
"t": "Delete",
"i": 0
},
{
"t": "Lightmap Parameters",
"i": 4
},
{
"t": "Rename",
"i": 0
},
{
"t": "Custom Render Texture",
"i": 4
},
{
"t": "Copy Path",
"i": 0
},
{
"t": "Alt+Ctrl+C",
"i": 3
},
{
"t": "Sprite Atlas",
"i": 4
},
{
"t": "Open Scene Additive",
"i": 0
},
{
"t": "Sprite Library Asset （Experimental）",
"i": 4
},
{
"t": "View in Package Manager",
"i": 0
},
{
"t": "Sprites",
"i": 4
},
{
"t": "Open Shape",
"i": 2
},
{
"t": "Sprite Shape Profile",
"i": 4
},
{
"t": "Import New Asset",
"i": 0
},
{
"t": "Closed Shape",
"i": 2
},
{
"t": "Import Package",
"i": 0
},
{
"t": "Animator Controller",
"i": 4
},
{
"t": "Export Package...",
"i": 0
},
{
"t": "Animation",
"i": 4
},
{
"t": "Find References In Scene",
"i": 0
},
{
"t": "Animator Override Controller",
"i": 4
}
],
"cols": null,
"w": 1400,
"h": 713
}
},
"b2fbafd4cf3a": {
"type": "ocr",
"title": "Canvas Renderer",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Canvas Renderer",
"i": 0
},
{
"t": "②让：",
"i": 4
},
{
"t": "Cull Transparent Mesh",
"i": 0
},
{
"t": "V TextMeshPro - Text （UI）",
"i": 0
},
{
"t": "Text Input",
"i": 0
},
{
"t": "Enable RTL Editor",
"i": 4
},
{
"t": "<style=\"name\"> 232425</stylex",
"i": 0
},
{
"t": "Text Style",
"i": 0
},
{
"t": "Normal",
"i": 2
},
{
"t": "Main Settings",
"i": 0
}
],
"cols": null,
"w": 880,
"h": 373
}
},
"b3ffd59ab18b": {
"type": "ocr",
"title": "Packed Assets",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Packed Assets",
"i": 1
},
{
"t": "Packed Assetsl",
"i": 1
},
{
"t": "Remove Group（s）",
"i": 4
},
{
"t": "> Built In Data",
"i": 0
},
{
"t": "Simplify Addressable Names",
"i": 4
},
{
"t": "Set as Default",
"i": 4
},
{
"t": "Inspect Group Settings",
"i": 4
},
{
"t": "Rename",
"i": 4
},
{
"t": "Create New Group",
"i": 4
},
{
"t": "Clear Content Update Warnings",
"i": 4
}
],
"cols": null,
"w": 938,
"h": 400
}
},
"b440e5e6e277": {
"type": "ocr",
"title": "# Scene / E Hierarchy",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "# Scene",
"i": 0
},
{
"t": "> Animator",
"i": 1
},
{
"t": "A Asset Store",
"i": 2
},
{
"t": "Shaded",
"i": 0
},
{
"t": "Sprite Editor",
"i": 1
},
{
"t": "Custom Outine•",
"i": 1
},
{
"t": "Outine Tokrance",
"i": 3
},
{
"t": "Snap",
"i": 2
},
{
"t": "Generate",
"i": 4
},
{
"t": "Snap：将控制点贴近在最近的像素",
"i": 0
},
{
"t": "Outline Tolerance：轮廓点的复杂性和准确性，0~1",
"i": 0
},
{
"t": "值越大轮廓点越多，越准确",
"i": 0
},
{
"t": "Generate：生成网格轮廓",
"i": 0
},
{
"t": "00 Game",
"i": 0
},
{
"t": "© Ani",
"i": 1
},
{
"t": "Display 1",
"i": 0
},
{
"t": "￥ 16:9",
"i": 1
}
],
"title": "# Scene"
},
{
"kind": "lines",
"lines": [
{
"t": "E Hierarchy",
"i": 0
},
{
"t": "Project",
"i": 2
},
{
"t": "6 Inspector",
"i": 4
},
{
"t": "& Navigation",
"i": 4
},
{
"t": "：口）",
"i": 4
},
{
"t": "Revert",
"i": 3
},
{
"t": "Apply",
"i": 4
}
],
"title": "E Hierarchy"
}
],
"w": 1400,
"h": 697
}
},
"b6495b8c1c44": {
"type": "ocr",
"title": "ID: 0",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "ID: 0",
"i": 0
},
{
"t": "Scale：",
"i": 1
},
{
"t": "Atlas Index：",
"i": 2
},
{
"t": "Glyph Rect",
"i": 1
},
{
"t": "#1",
"i": 0
},
{
"t": "X:128",
"i": 1
},
{
"t": "384",
"i": 2
},
{
"t": "W:128",
"i": 3
},
{
"t": "H：",
"i": 4
},
{
"t": "128",
"i": 4
},
{
"t": "Glyph Metrics",
"i": 1
},
{
"t": "W:128",
"i": 1
},
{
"t": "H：",
"i": 3
},
{
"t": "128",
"i": 4
},
{
"t": "BX：-64",
"i": 1
},
{
"t": "BY:64",
"i": 3
},
{
"t": "AD:128",
"i": 4
},
{
"t": "ID:1",
"i": 0
},
{
"t": "Scale：",
"i": 1
},
{
"t": "Atlas Index：",
"i": 2
},
{
"t": "Up",
"i": 0
},
{
"t": "Down",
"i": 1
},
{
"t": "Goto",
"i": 2
}
],
"cols": null,
"w": 544,
"h": 185
}
},
"b6aadc1d6654": {
"type": "ocr",
"title": "Create New Group",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Create New Group",
"i": 0
},
{
"t": "Packed Assets",
"i": 4
},
{
"t": "Clear Content Update Warnings",
"i": 0
}
],
"cols": null,
"w": 948,
"h": 250
}
},
"b6d3622be0eb": {
"type": "ocr",
"title": "MyDataTest",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Assets/Scenes/SampleScene.unity",
"i": 0
},
{
"t": "Assets/Scenes/SampleScene.I",
"i": 4
},
{
"t": "MyDataTest",
"i": 0
},
{
"t": "AccAte/PAcAIIAAsmAVAdUNMI",
"i": 4
},
{
"t": "Move Addressables to Group...",
"i": 2
},
{
"t": "New Material",
"i": 0
},
{
"t": "MrTangData",
"i": 0
},
{
"t": "Move Addressables to New Group with settings from..",
"i": 2
},
{
"t": "Remove Addressables",
"i": 2
},
{
"t": "Simplify Addressable Names",
"i": 2
},
{
"t": "Copy Address to Clipboard",
"i": 2
},
{
"t": "Change Address",
"i": 2
},
{
"t": "Create New Group",
"i": 2
},
{
"t": "Clear Content Update Warnings",
"i": 2
}
],
"cols": null,
"w": 937,
"h": 356
}
},
"b7788b456f8f": {
"type": "ocr",
"title": "Profile",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Sprite Shape Controller （Script）",
"i": 0
},
{
"t": "Profile",
"i": 0
},
{
"t": ".esson21Close （SpriteShape）",
"i": 2
},
{
"t": "Edit Spline.",
"i": 3
},
{
"t": "Spline",
"i": 0
},
{
"t": "Detail",
"i": 0
},
{
"t": "High Quality",
"i": 2
},
{
"t": "Is Open Ended",
"i": 0
},
{
"t": "Adaptive UV",
"i": 0
},
{
"t": "Optimize Geometry",
"i": 0
},
{
"t": "Enable Tangents",
"i": 0
},
{
"t": "Corner Threshold",
"i": 0
},
{
"t": "30",
"i": 4
},
{
"t": "Fill",
"i": 0
},
{
"t": "Stretch UV",
"i": 0
},
{
"t": "Pixel Per Unit",
"i": 0
},
{
"t": "100",
"i": 2
},
{
"t": "Worldspace UV",
"i": 0
},
{
"t": "Sprites-Default",
"i": 0
},
{
"t": "Sprites/Default",
"i": 1
},
{
"t": "Shader",
"i": 0
}
],
"cols": null,
"w": 1400,
"h": 1047
}
},
"b80e0ea8c07f": {
"type": "ocr",
"title": "点乘>0物体在我前面",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "点乘>0物体在我前面",
"i": 1
},
{
"t": "点乘三0物体在我左右",
"i": 1
},
{
"t": "点乘 0物体在我后面",
"i": 1
},
{
"t": "B",
"i": 4
},
{
"t": "点乘",
"i": 0
},
{
"t": "向量AB",
"i": 3
}
],
"cols": null,
"w": 1202,
"h": 1158
}
},
"b867023af38b": {
"type": "ocr",
"title": "正弦函数（sin）",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "正弦函数（sin）",
"i": 0
},
{
"t": "Sin B = 角的对边/斜边",
"i": 0
},
{
"t": "Sin B= A/C",
"i": 0
},
{
"t": "C",
"i": 4
},
{
"t": "A",
"i": 3
},
{
"t": "B",
"i": 4
},
{
"t": "B",
"i": 4
}
],
"cols": null,
"w": 1276,
"h": 795
}
},
"ba830180de91": {
"type": "ocr",
"title": "：口",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "：口",
"i": 4
},
{
"t": "Revert Apply",
"i": 4
},
{
"t": "问g",
"i": 0
},
{
"t": "Sprite",
"i": 4
},
{
"t": "Name",
"i": 3
},
{
"t": "PlunkahGreen",
"i": 4
},
{
"t": "Position",
"i": 3
},
{
"t": "XO",
"i": 4
},
{
"t": "YO",
"i": 4
},
{
"t": "H 512.",
"i": 4
},
{
"t": "W 512",
"i": 4
},
{
"t": "Border",
"i": 3
},
{
"t": "LO",
"i": 4
},
{
"t": "TO",
"i": 4
},
{
"t": "RO",
"i": 4
},
{
"t": "BO",
"i": 4
},
{
"t": "Pivot",
"i": 3
},
{
"t": "Center",
"i": 4
},
{
"t": "Pivot Unit Mode",
"i": 3
},
{
"t": "Normalized",
"i": 4
},
{
"t": "Custom Pivot",
"i": 3
},
{
"t": "X 0.5",
"i": 4
},
{
"t": "Y 0.5",
"i": 4
}
],
"cols": null,
"w": 2469,
"h": 1299
}
},
"bb7628e55f64": {
"type": "ocr",
"title": "时 Hierarchy",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "时 Hierarchy",
"i": 0
},
{
"t": "已：",
"i": 4
},
{
"t": "0 Inspector",
"i": 2
},
{
"t": "Q• All",
"i": 0
},
{
"t": "J口",
"i": 4
},
{
"t": "addressable_lesson3",
"i": 2
},
{
"t": "Static",
"i": 4
},
{
"t": "弱SampleScene*",
"i": 0
},
{
"t": "S Main Camera",
"i": 0
},
{
"t": "Tag",
"i": 2
},
{
"t": "Untagged",
"i": 2
},
{
"t": "Layer",
"i": 4
},
{
"t": "Default",
"i": 4
},
{
"t": "G Directional Light",
"i": 0
},
{
"t": "G Global Volume",
"i": 0
},
{
"t": "Transform",
"i": 2
},
{
"t": "了 Grid",
"i": 0
},
{
"t": "X0",
"i": 3
},
{
"t": "Position",
"i": 2
},
{
"t": "Y",
"i": 4
},
{
"t": "0",
"i": 4
},
{
"t": "Z",
"i": 4
},
{
"t": "Cube",
"i": 1
},
{
"t": "Rotation",
"i": 2
},
{
"t": "XO",
"i": 3
},
{
"t": "Y",
"i": 4
},
{
"t": "0",
"i": 4
},
{
"t": "Z",
"i": 4
},
{
"t": "S Canvas",
"i": 0
},
{
"t": "G EventSystem",
"i": 0
},
{
"t": "Scale",
"i": 2
},
{
"t": "×1",
"i": 3
},
{
"t": "Y",
"i": 4
},
{
"t": "1",
"i": 4
},
{
"t": "Z 1",
"i": 4
},
{
"t": "Gameobject",
"i": 0
},
{
"t": "Y Addressable_lesson 3 （Script）",
"i": 2
},
{
"t": "Y GameObject （1）",
"i": 0
},
{
"t": "⑦ Temp",
"i": 0
},
{
"t": "Script",
"i": 2
},
{
"t": "addressable_lesson3",
"i": 3
},
{
"t": "G PlayAudio",
"i": 0
},
{
"t": "Asset Reference",
"i": 2
},
{
"t": "None （Addressable Asset）",
"i": 3
},
{
"t": "S addressable_lesson3",
"i": 0
},
{
"t": "As Reference",
"i": 2
},
{
"t": "None （Addressable Sprite）",
"i": 3
},
{
"t": "Gameobjcet Reference",
"i": 2
},
{
"t": "None （Addressable GameObject）",
"i": 3
},
{
"t": "Sprite Reference",
"i": 2
},
{
"t": "None （Addressable Sprite）",
"i": 3
},
{
"t": "Texture Reference",
"i": 2
},
{
"t": "None （Addressable Texture）",
"i": 3
},
{
"t": "Audio Reference",
"i": 2
},
{
"t": "None （Addressable AudioClip）",
"i": 3
},
{
"t": "Controller",
"i": 2
},
{
"t": "None （Addressable RuntimeAnimatorCont O",
"i": 3
},
{
"t": "Text Reference",
"i": 2
},
{
"t": "None （Addressable TextAsset）",
"i": 3
},
{
"t": "Add Component",
"i": 3
}
],
"cols": null,
"w": 1017,
"h": 711
}
},
"bb89fc0f10f0": {
"type": "ocr",
"title": "Use Collider Mask",
"data": {
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"Point Effector 2D",
""
]
]
},
{
"h": "Use Collider Mask",
"rows": [
[
"Collider Mask",
"Everything"
]
]
},
{
"h": "Force",
"rows": [
[
"Force Magnitude",
"-10"
],
[
"Force Variation",
"0"
],
[
"Distance Scale",
"1"
],
[
"Force Source",
"Rigidbody"
],
[
"Force Target",
"Rigidbody"
],
[
"Force Mode",
"Constant"
]
]
},
{
"h": "T Damping",
"rows": [
[
"Drag",
"O"
]
]
}
],
"lines": null,
"cols": null,
"w": 1400,
"h": 969
}
},
"beb23ae2a9c1": {
"type": "ocr",
"title": "public class Student",
"data": {
"kind": "code",
"groups": null,
"lines": [
{
"t": "public class Student",
"i": 0
},
{
"t": "public int age；",
"i": 4
},
{
"t": "public string name；",
"i": 4
},
{
"t": "public int number；",
"i": 4
},
{
"t": "public bool sex；",
"i": 4
}
],
"cols": null,
"w": 291,
"h": 168
}
},
"bee889f98fbf": {
"type": "ocr",
"title": "My Life",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "My Life",
"i": 0
},
{
"t": "32",
"i": 0
},
{
"t": "42",
"i": 0
},
{
"t": "34",
"i": 0
},
{
"t": "2",
"i": 0
}
],
"cols": null,
"w": 338,
"h": 103
}
},
"bf091e572381": {
"type": "ocr",
"title": "角度和弧度的转换关系",
"data": {
"kind": "code",
"groups": null,
"lines": [
{
"t": "角度和弧度的转换关系",
"i": 0
},
{
"t": "T rad = 180°",
"i": 0
},
{
"t": "1 rad = （180/ m）。=> 1 rad = 180 / 3.14~ 57.3°",
"i": 0
},
{
"t": "1°= （T/180） rad",
"i": 0
},
{
"t": "• 1° = 3.14 / 180 2 0.01745 rad",
"i": 4
},
{
"t": "由此可以得出",
"i": 0
},
{
"t": "弧度*57.3 = 对应角度",
"i": 0
},
{
"t": "角度*0.01745 = 对应弧度",
"i": 0
}
],
"cols": null,
"w": 1400,
"h": 683
}
},
"bf4ec43192be": {
"type": "ocr",
"title": "Package Manager",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Package Manager",
"i": 0
},
{
"t": "可 Package Manager",
"i": 0
},
{
"t": "+、",
"i": 0
},
{
"t": "Sort: Name （asc）",
"i": 1
},
{
"t": "Filters",
"i": 2
},
{
"t": "Clear Filters",
"i": 3
},
{
"t": "2D Sprite",
"i": 3
},
{
"t": "Q 2D",
"i": 1
},
{
"t": "1.0.0 • February 11, 2025",
"i": 3
},
{
"t": "Features",
"i": 1
},
{
"t": "From Unity Registry by Unity Technologies Inc.",
"i": 3
},
{
"t": "2D",
"i": 1
},
{
"t": "com.unity.2d.sprite",
"i": 3
},
{
"t": "8 packages",
"i": 1
},
{
"t": "Documentation Changelog",
"i": 3
},
{
"t": "Licenses",
"i": 4
},
{
"t": "Packages",
"i": 1
},
{
"t": "Install",
"i": 3
},
{
"t": "2D Animation",
"i": 1
},
{
"t": "10.1.4",
"i": 2
},
{
"t": "2D Aseprite Impor...",
"i": 1
},
{
"t": "1.1.11",
"i": 2
},
{
"t": "Description",
"i": 3
},
{
"t": "Version History",
"i": 4
},
{
"t": "Dependencies",
"i": 4
},
{
"t": "2D Pixel Perfect",
"i": 1
},
{
"t": "5.0.3",
"i": 2
},
{
"t": "Use Unity Sprite Editor Window to create and edit Sprite asset properties like pivot，",
"i": 3
},
{
"t": "2D PSD Importer",
"i": 1
},
{
"t": "9.0.3",
"i": 2
},
{
"t": "borders and Physics shape",
"i": 3
},
{
"t": "2D Sprite",
"i": 1
},
{
"t": "1.0.0",
"i": 2
},
{
"t": "2D SpriteShape",
"i": 1
},
{
"t": "10.0.7",
"i": 2
},
{
"t": "2D Tilemap Editor",
"i": 1
},
{
"t": "1.0.0",
"i": 2
},
{
"t": "2D Tilemap Extras",
"i": 1
},
{
"t": "4.11",
"i": 2
}
],
"cols": null,
"w": 1123,
"h": 658
}
},
"bfeb5891fc30": {
"type": "ocr",
"title": "0 Inspector",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "0 Inspector",
"i": 0
},
{
"t": "Blend Tree",
"i": 0
},
{
"t": "Blend Type",
"i": 0
},
{
"t": "2D Freeform Cartesian",
"i": 1
},
{
"t": "已添加.",
"i": 0
},
{
"t": "签入",
"i": 4
},
{
"t": "撒销",
"i": 4
},
{
"t": "Parameters",
"i": 0
},
{
"t": "X",
"i": 2
},
{
"t": "The selected child has no Motion assigned.",
"i": 1
},
{
"t": "3",
"i": 3
},
{
"t": "1",
"i": 1
},
{
"t": "2",
"i": 4
},
{
"t": "Motion",
"i": 0
},
{
"t": "Pos X",
"i": 2
},
{
"t": "Pos Y",
"i": 3
},
{
"t": "None （Motion）",
"i": 0
},
{
"t": "None （Motion）",
"i": 0
},
{
"t": "1",
"i": 4
},
{
"t": "None （Motion）",
"i": 0
},
{
"t": "None （Motion）",
"i": 0
},
{
"t": "0",
"i": 3
},
{
"t": "十，一",
"i": 4
},
{
"t": "Compute Positions",
"i": 0
},
{
"t": "Select",
"i": 2
}
],
"cols": null,
"w": 706,
"h": 823
}
},
"c1eb04ddc0eb": {
"type": "ocr",
"title": "IK",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "IK",
"i": 2
},
{
"t": "HumanoidRun",
"i": 0
},
{
"t": "20",
"i": 2
},
{
"t": "1.00x",
"i": 2
},
{
"t": "HumanoidMidAirRight",
"i": 3
},
{
"t": "动画剪辑名称",
"i": 3
},
{
"t": "20",
"i": 3
},
{
"t": "IK：是否开启脚步反向动力学预览",
"i": 3
},
{
"t": "2D:2D模式预览",
"i": 3
},
{
"t": "箭头：是否显示轴心和质心辅助图标",
"i": 3
},
{
"t": "切换预览操作的游戏对象",
"i": 3
},
{
"t": "0:04 （022.8%） Frame 339",
"i": 1
},
{
"t": "Player",
"i": 0
},
{
"t": "播放暂停键",
"i": 3
},
{
"t": "AssetBundle",
"i": 0
},
{
"t": "None",
"i": 0
},
{
"t": "None",
"i": 2
},
{
"t": "时间轴（可拖动预览）",
"i": 3
},
{
"t": "动画预览",
"i": 1
},
{
"t": "1.00）",
"i": 3
},
{
"t": "播放速度",
"i": 3
},
{
"t": "0:04 （022.8%） Frame 339",
"i": 3
},
{
"t": "播放状态标记",
"i": 3
},
{
"t": "秒、百分比、帧编号显示当前播放到的位置",
"i": 3
},
{
"t": "Player",
"i": 3
},
{
"t": "可以为资源添加标签Tag",
"i": 4
},
{
"t": "AssetBundle",
"i": 3
},
{
"t": "None",
"i": 3
},
{
"t": "None",
"i": 4
},
{
"t": "AB包相关设置，AB包知识时会讲解",
"i": 4
}
],
"cols": null,
"w": 1407,
"h": 797
}
},
"c2dbc02df5f6": {
"type": "ocr",
"title": "Version Control",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Version Control",
"i": 0
},
{
"t": "Addressables",
"i": 0
},
{
"t": "Groups",
"i": 4
},
{
"t": "Addressables Report",
"i": 4
},
{
"t": "Profiles",
"i": 4
},
{
"t": "Settings",
"i": 4
}
],
"cols": null,
"w": 911,
"h": 221
}
},
"c564231cd4f5": {
"type": "ocr",
"title": "Glow / - Click to collapse -",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "Glow",
"i": 0
},
{
"t": "Color",
"i": 2
},
{
"t": "Offset",
"i": 2
},
{
"t": "Inner",
"i": 2
},
{
"t": "Outer",
"i": 2
},
{
"t": "Power",
"i": 2
},
{
"t": "Debug Settings",
"i": 0
},
{
"t": "Font Atlas",
"i": 2
},
{
"t": "Gradient Scale",
"i": 2
},
{
"t": "Texture Width",
"i": 2
},
{
"t": "Texture Height",
"i": 2
},
{
"t": "Scale X",
"i": 2
},
{
"t": "Scale Y",
"i": 2
},
{
"t": "Sharpness",
"i": 2
},
{
"t": "Perspective Filter",
"i": 2
},
{
"t": "Offset X",
"i": 2
},
{
"t": "Offset Y",
"i": 2
},
{
"t": "Mask",
"i": 2
},
{
"t": "Clip Rect",
"i": 2
},
{
"t": "Stencil ID",
"i": 2
},
{
"t": "Stencil Comp",
"i": 2
},
{
"t": "Use Ratios",
"i": 2
},
{
"t": "Cull Mode",
"i": 2
},
{
"t": "Scale Ratio A",
"i": 2
},
{
"t": "Scale Ratio B",
"i": 2
},
{
"t": "Scale Ratio C",
"i": 2
}
],
"title": "Glow"
},
{
"kind": "lines",
"lines": [
{
"t": "- Click to collapse -",
"i": 4
},
{
"t": "0.05",
"i": 4
},
{
"t": "0.05",
"i": 4
},
{
"t": "0.75",
"i": 4
},
{
"t": "- Click to collapse -",
"i": 4
},
{
"t": "Select",
"i": 0
},
{
"t": "10",
"i": 0
},
{
"t": "1024",
"i": 0
},
{
"t": "1024",
"i": 0
},
{
"t": "1",
"i": 0
},
{
"t": "0",
"i": 4
},
{
"t": "0.875",
"i": 4
},
{
"t": "Mask Off",
"i": 0
},
{
"t": "-32767",
"i": 0
},
{
"t": "-32767",
"i": 2
},
{
"t": "32767",
"i": 3
},
{
"t": "L",
"i": 0
},
{
"t": "B",
"i": 1
},
{
"t": "R",
"i": 3
},
{
"t": "T",
"i": 4
},
{
"t": "32767",
"i": 4
},
{
"t": "8",
"i": 0
},
{
"t": "Off",
"i": 0
},
{
"t": "1",
"i": 0
}
],
"title": "- Click to collapse -"
}
],
"w": 1058,
"h": 1007
}
},
"c59a49a2f1b4": {
"type": "ocr",
"title": "◎27",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "◎27",
"i": 1
},
{
"t": "My Data Test （New Mono Behaviour Script 1）",
"i": 2
},
{
"t": "Assets",
"i": 0
},
{
"t": "Open.",
"i": 4
},
{
"t": "Resources",
"i": 0
},
{
"t": "已添加",
"i": 2
},
{
"t": "签入",
"i": 4
},
{
"t": "撤销",
"i": 4
},
{
"t": "Font&Materials",
"i": 0
},
{
"t": "Cube",
"i": 0
},
{
"t": "MnlanaData",
"i": 0
},
{
"t": "Script",
"i": 2
},
{
"t": "进 ScriptableObject",
"i": 3
},
{
"t": "MyDatalest",
"i": 0
},
{
"t": "I",
"i": 2
},
{
"t": "New Materla",
"i": 0
},
{
"t": "ScriptableObject",
"i": 0
},
{
"t": "F",
"i": 2
},
{
"t": "0",
"i": 3
},
{
"t": "ScriptableObjectiwo",
"i": 0
},
{
"t": "B",
"i": 2
},
{
"t": "Scenes",
"i": 0
},
{
"t": "Cube",
"i": 3
},
{
"t": "00j",
"i": 2
},
{
"t": "Settings",
"i": 0
},
{
"t": "TextMesh Pro",
"i": 0
},
{
"t": "M",
"i": 2
},
{
"t": "New Material",
"i": 3
},
{
"t": "Examples & Extras",
"i": 0
},
{
"t": "Audio Clip",
"i": 2
},
{
"t": "None （Audio Clip）",
"i": 3
},
{
"t": "Fonts",
"i": 0
},
{
"t": "Video Clip",
"i": 2
},
{
"t": "None （Video Clip）",
"i": 3
},
{
"t": "Resources",
"i": 0
},
{
"t": "Fonts & Materias",
"i": 1
}
],
"cols": null,
"w": 1297,
"h": 423
}
},
"c62f4c8dde30": {
"type": "ocr",
"title": "232",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "232",
"i": 0
},
{
"t": "2342",
"i": 4
},
{
"t": "5",
"i": 0
},
{
"t": "231",
"i": 0
},
{
"t": "2342",
"i": 4
}
],
"cols": null,
"w": 293,
"h": 187
}
},
"c6c360432cb7": {
"type": "ocr",
"title": "世界坐标系",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "世界坐标系",
"i": 0
},
{
"t": "原点：世界的中心点",
"i": 0
},
{
"t": "轴向：世界坐标系的三个轴向是固定的",
"i": 0
},
{
"t": "-FaTEC",
"i": 4
}
],
"cols": null,
"w": 1400,
"h": 1183
}
},
"c6d50c7b6dc8": {
"type": "ocr",
"title": "914",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "914",
"i": 1
},
{
"t": "RobotBoyDeathSprite Import Settings",
"i": 2
},
{
"t": "③芒章",
"i": 4
},
{
"t": "：口X",
"i": 3
},
{
"t": "Open",
"i": 4
},
{
"t": "Revert Apply",
"i": 1
},
{
"t": "*2D and Ul］",
"i": 3
},
{
"t": "Spnte Editor",
"i": 4
},
{
"t": "atic",
"i": 3
},
{
"t": "1@uality",
"i": 3
},
{
"t": "Revert",
"i": 4
},
{
"t": "Apply",
"i": 4
},
{
"t": "RGB",
"i": 4
},
{
"t": "Sprite",
"i": 1
},
{
"t": "Name",
"i": 0
},
{
"t": "RobotBovDeath00",
"i": 1
},
{
"t": "Position",
"i": 0
},
{
"t": "Y. 1773",
"i": 2
},
{
"t": "H275",
"i": 2
},
{
"t": "w275",
"i": 1
},
{
"t": "Rorder",
"i": 0
},
{
"t": "To",
"i": 2
},
{
"t": "LO",
"i": 1
},
{
"t": "RO",
"i": 1
},
{
"t": "B6",
"i": 2
},
{
"t": "pivor",
"i": 0
},
{
"t": "Center",
"i": 1
},
{
"t": "pivot Unit Mode",
"i": 0
},
{
"t": "Normalized",
"i": 1
},
{
"t": "Custom Pivot",
"i": 0
},
{
"t": "X 0.5",
"i": 1
},
{
"t": "YO.5.",
"i": 2
}
],
"cols": null,
"w": 1400,
"h": 661
}
},
"c9cb4d9adf68": {
"type": "ocr",
"title": "Audio",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Audio",
"i": 0
},
{
"t": "Graphics",
"i": 1
},
{
"t": "Editor",
"i": 0
},
{
"t": "Graphics",
"i": 0
},
{
"t": "Scriptable Render Pipeline Settings",
"i": 1
},
{
"t": "Input Manaqer",
"i": 0
},
{
"t": "• None （Render Pipeline Asset）",
"i": 1
},
{
"t": "Packace Manaaer",
"i": 0
},
{
"t": "Camera Settings",
"i": 1
},
{
"t": "Physics",
"i": 0
},
{
"t": "Custom Axis",
"i": 3
},
{
"t": "Physics 2D",
"i": 0
},
{
"t": "Transparency Sort Mode",
"i": 1
},
{
"t": "Plaver",
"i": 0
},
{
"t": "Transparency Sort Axis",
"i": 1
},
{
"t": "XO",
"i": 3
},
{
"t": "IY1",
"i": 4
},
{
"t": "0.26",
"i": 4
},
{
"t": "Preset Manager",
"i": 0
},
{
"t": "Qualitv",
"i": 0
},
{
"t": "7 Tier Settings",
"i": 1
},
{
"t": "Open Editor..",
"i": 4
},
{
"t": "Script Execution Order",
"i": 0
}
],
"cols": null,
"w": 1400,
"h": 259
}
},
"ce5b727e142d": {
"type": "ocr",
"title": "◎27",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "2",
"i": 1
},
{
"t": "Q",
"i": 0
},
{
"t": "◎27",
"i": 1
},
{
"t": "Scriptable Object （Mono Script） Import Settings",
"i": 2
},
{
"t": "Assets",
"i": 0
},
{
"t": "Open",
"i": 4
},
{
"t": "Execution Order...",
"i": 4
},
{
"t": "Resources",
"i": 0
},
{
"t": "已添加.",
"i": 2
},
{
"t": "签入",
"i": 4
},
{
"t": "撤销",
"i": 4
},
{
"t": "Font&Materials",
"i": 0
},
{
"t": "Cube",
"i": 0
},
{
"t": "New Material",
"i": 0
},
{
"t": "Obj",
"i": 2
},
{
"t": "Cube",
"i": 3
},
{
"t": "ScriptableObject",
"i": 0
},
{
"t": "M",
"i": 2
},
{
"t": "◎ New Material",
"i": 3
},
{
"t": "Scenes",
"i": 0
},
{
"t": "Audio Clip",
"i": 2
},
{
"t": "None （Audio Clip）",
"i": 3
},
{
"t": "Settings",
"i": 0
},
{
"t": "TextMesh Pro",
"i": 0
},
{
"t": "Video Clip",
"i": 2
},
{
"t": "None （Video Clip）",
"i": 3
},
{
"t": "Examples & Extras",
"i": 0
}
],
"cols": null,
"w": 1294,
"h": 305
}
},
"cfa3d6c84307": {
"type": "ocr",
"title": "w PayS",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "w PayS",
"i": 0
},
{
"t": "Pixels Per Unit Multip 1",
"i": 2
},
{
"t": "GCamera",
"i": 0
},
{
"t": "< Grid Layout Group",
"i": 2
},
{
"t": "②千：",
"i": 4
},
{
"t": "•Padding",
"i": 2
},
{
"t": "Cell Size",
"i": 2
},
{
"t": "X 100",
"i": 3
},
{
"t": "Y",
"i": 4
},
{
"t": "100",
"i": 4
},
{
"t": "Spacing",
"i": 2
},
{
"t": "X 50",
"i": 3
},
{
"t": "Y",
"i": 4
},
{
"t": "50",
"i": 4
},
{
"t": "Start Corner",
"i": 2
},
{
"t": "Upper Left",
"i": 3
},
{
"t": "Start Axis",
"i": 2
},
{
"t": "Horizontal",
"i": 3
},
{
"t": "Child Alignment",
"i": 2
},
{
"t": "Upper Left",
"i": 3
},
{
"t": "Constraint",
"i": 2
},
{
"t": "Flexible",
"i": 3
},
{
"t": "Default Ul Material （Material）",
"i": 2
},
{
"t": "Shader Ul/Default",
"i": 2
},
{
"t": "Edit..",
"i": 4
}
],
"cols": null,
"w": 1249,
"h": 371
}
},
"cfd0c467e0b6": {
"type": "ocr",
"title": "LoOp",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "LoOp",
"i": 0
},
{
"t": "是否终点起始自动相连",
"i": 0
},
{
"t": "Positions",
"i": 0
},
{
"t": "线段的点",
"i": 0
},
{
"t": "线段宽度曲线调整",
"i": 0
},
{
"t": "Color",
"i": 0
},
{
"t": "颜色变化",
"i": 0
},
{
"t": "Corner Vertices（角顶点，圆角）",
"i": 0
},
{
"t": "此属性指示在一条线中绘制角时使用了多少额外的顶点。",
"i": 0
},
{
"t": "增加此值，使线角看起来更圆。",
"i": 0
},
{
"t": "End Cap Vertices（終端顶点，圆角）",
"i": 0
},
{
"t": "终点圆角",
"i": 0
},
{
"t": "View",
"i": 4
},
{
"t": "视点",
"i": 4
},
{
"t": "线段对着摄像机",
"i": 4
},
{
"t": "Alignment",
"i": 0
},
{
"t": "对其方式",
"i": 0
},
{
"t": "Transform Z",
"i": 4
},
{
"t": "线段面向其Z轴",
"i": 4
},
{
"t": "Stretch",
"i": 4
},
{
"t": "拉伸",
"i": 4
},
{
"t": "沿整条线映射纹理一次",
"i": 4
},
{
"t": "Tile",
"i": 4
},
{
"t": "瓷砖平铺",
"i": 4
},
{
"t": "Texture Mode",
"i": 0
},
{
"t": "不停的重复纹理",
"i": 4
},
{
"t": "纹理模式",
"i": 0
},
{
"t": "Distribute Per Segment",
"i": 4
},
{
"t": "分配执行",
"i": 4
},
{
"t": "Repeat Per Segment",
"i": 4
},
{
"t": "重复显示",
"i": 4
}
],
"cols": null,
"w": 558,
"h": 893
}
},
"d0177fe83bf8": {
"type": "ocr",
"title": "T Material",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "T Material",
"i": 0
},
{
"t": "Hat",
"i": 0
},
{
"t": "Assets/ArtRes/Material/Blue.mat",
"i": 3
},
{
"t": "Blue",
"i": 4
},
{
"t": "Hat",
"i": 0
},
{
"t": "Assets/ArtRes/Material/Red.mat",
"i": 3
},
{
"t": "Red",
"i": 4
},
{
"t": "Hat",
"i": 0
},
{
"t": "Assets/ArtRes/Material/White.mat",
"i": 3
},
{
"t": "White",
"i": 4
}
],
"cols": null,
"w": 936,
"h": 64
}
},
"d17801e41263": {
"type": "ocr",
"title": "（Up）",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "（Up）",
"i": 3
},
{
"t": "New State",
"i": 0
},
{
"t": "States",
"i": 4
},
{
"t": "StateMachine",
"i": 4
},
{
"t": "Base Layer",
"i": 4
},
{
"t": "New State O",
"i": 0
},
{
"t": "Exit",
"i": 3
},
{
"t": "执行完子状态机后返回 到父层",
"i": 4
},
{
"t": "New State 1",
"i": 0
}
],
"cols": null,
"w": 1368,
"h": 475
}
},
"d3694cec2517": {
"type": "ocr",
"title": "Rename",
"data": {
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"Create",
"Folder"
],
[
"Show in Explorer",
"Material"
],
[
"Open",
"MonoBehaviour Script"
],
[
"Delete",
"Prefab Variant"
]
]
},
{
"h": "Rename",
"rows": [
[
"2D",
""
],
[
"Copy Path|",
"Alt+Ctrl+C"
],
[
"Animation",
""
],
[
"Open Scene Additive",
"Audio"
],
[
"Rendering",
""
],
[
"View in Package Manager",
""
],
[
"Scene",
""
],
[
"Import New Asset...",
"Scripting"
],
[
"Import Package",
"Search"
],
[
"Export Package..",
"Shader"
],
[
"Find References In Scene",
"Shader Graph"
],
[
"Find References In Project",
"Testing"
],
[
"Select Dependencies",
"Terrain"
],
[
"Text Core",
""
],
[
"Refresh Font Asset",
"TextMeshPro"
],
[
"Reimport",
"Timeline"
],
[
"Sprite Asset",
""
],
[
"Reimport All",
"UI Toolkit"
],
[
"Style Sheet",
""
],
[
"Visual Scripting",
""
],
[
"Extract From Prefab",
"Color Gradient"
]
]
}
],
"lines": null,
"cols": null,
"w": 573,
"h": 455
}
},
"d62b8d8d8d51": {
"type": "ocr",
"title": "Composite Collider 2D",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Composite Collider 2D",
"i": 1
},
{
"t": "让：",
"i": 4
},
{
"t": "Material",
"i": 0
},
{
"t": "None （Physics Material 2D）",
"i": 2
},
{
"t": "Is Trigger",
"i": 0
},
{
"t": "Used By Effector",
"i": 0
},
{
"t": "Offset",
"i": 0
},
{
"t": "XO",
"i": 2
},
{
"t": "YO",
"i": 3
},
{
"t": "Geometry Type",
"i": 0
},
{
"t": "Outlines",
"i": 2
},
{
"t": "Generation Type",
"i": 0
},
{
"t": "Synchronous",
"i": 2
},
{
"t": "Vertex Distance",
"i": 0
},
{
"t": "0.0005",
"i": 2
},
{
"t": "Offset Distance",
"i": 0
},
{
"t": "5e-05",
"i": 2
},
{
"t": "Edge Radius",
"i": 0
},
{
"t": "0",
"i": 2
}
],
"cols": null,
"w": 728,
"h": 338
}
},
"d6301e8899be": {
"type": "ocr",
"title": "Unity 1D 混合树&关键参数详解指南",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Unity 1D 混合树&关键参数详解指南",
"i": 0
},
{
"t": "动画混合核心：1D Blend Tree",
"i": 1
},
{
"t": "B Mspector",
"i": 0
},
{
"t": "Blend Tree",
"i": 0
},
{
"t": "Parameter",
"i": 3
},
{
"t": "Blend Type",
"i": 0
},
{
"t": "T0",
"i": 1
},
{
"t": "Threshold",
"i": 4
},
{
"t": "Matian",
"i": 0
},
{
"t": "hnahok",
"i": 1
},
{
"t": "Humanaid cld",
"i": 0
},
{
"t": "• HumanalWakk",
"i": 0
},
{
"t": "• Humana dkun",
"i": 0
},
{
"t": "Automate Thesholdsv",
"i": 0
},
{
"t": "Idle",
"i": 3
},
{
"t": "Walk",
"i": 4
},
{
"t": "Run",
"i": 4
},
{
"t": "Adjust Time Seale",
"i": 0
},
{
"t": "Select",
"i": 1
},
{
"t": "Motion 列表与阅值分配",
"i": 3
},
{
"t": "Matian",
"i": 3
},
{
"t": "Threshald",
"i": 4
},
{
"t": "• Humanoidldle",
"i": 3
},
{
"t": "• Humanoidwalk",
"i": 3
},
{
"t": "• HumancidRun",
"i": 3
},
{
"t": "核心参数深挖",
"i": 2
},
{
"t": "1. 是否镜像动作（Mirror）",
"i": 0
},
{
"t": "控制该动画放啟时是否进行撓像翻转，需用于左右对新动",
"i": 3
},
{
"t": "作的复用。例如：",
"i": 3
},
{
"t": "Mirror",
"i": 1
},
{
"t": "•把「左手拌榮」动函像像后变成「右手拌拳」，无需额",
"i": 3
},
{
"t": "外制作麦源。",
"i": 3
},
{
"t": "Left Hand Punch",
"i": 0
},
{
"t": "Right Hand Punch",
"i": 1
},
{
"t": "• 在 Blend Tree 节点或动画剪捐上句选 Mirror 即可生",
"i": 3
},
{
"t": "效。",
"i": 3
},
{
"t": "无需教外资涼即可生成",
"i": 1
},
{
"t": "2.计算阈值的方式（Compute Thresholds）",
"i": 0
},
{
"t": "指定从动画勢鞙的程运勐",
"i": 3
},
{
"t": "（Root Motion）中提取耶种数",
"i": 4
},
{
"t": "掘来自动计算骑值：",
"i": 3
},
{
"t": "• Speed：速度",
"i": 3
},
{
"t": "•Velocity X/Y/ Z: xyz三个方向上的分速度",
"i": 3
},
{
"t": "1.5m/s",
"i": 0
},
{
"t": "2.3 m/s",
"i": 1
},
{
"t": "4.0 m/s",
"i": 2
},
{
"t": "• Angular Speed （Rad / Deg）：以规度或角度表示的角",
"i": 3
},
{
"t": "連度",
"i": 3
},
{
"t": "举例：走路1.5单位/秒、馒距 2.3单位/秒、快距4单",
"i": 3
},
{
"t": "位/秒时，间值会技这些实际連度自动设定，从而驱动混",
"i": 3
},
{
"t": "从 Root Motion 提取实际数报自动设定",
"i": 0
},
{
"t": "合。",
"i": 3
},
{
"t": "3.调整时间刻度 （Adjust Time Scale）",
"i": 0
},
{
"t": "调整混合时各动画的时间播放比度，第见选项：",
"i": 3
},
{
"t": "A",
"i": 0
},
{
"t": "•Homogeneous Speed：均勻速度，各动画保持自身原",
"i": 3
},
{
"t": "有播放廈。",
"i": 3
},
{
"t": "各动画保持自身原速",
"i": 1
},
{
"t": "•Reset Time Scale：重置归间刻度，将时间刻度归一化",
"i": 3
},
{
"t": "处理。",
"i": 3
},
{
"t": "B",
"i": 0
},
{
"t": "遇过该设置可以统一不同动画勇稱的节奏，避免混合活动",
"i": 3
},
{
"t": "重置归一化时间刻度，节美统一",
"i": 0
},
{
"t": "作忽快忽很。",
"i": 3
}
],
"cols": null,
"w": 782,
"h": 1400
}
},
"d6b2406a5248": {
"type": "ocr",
"title": "Assets",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Assets",
"i": 0
},
{
"t": "AddressableAssetsData",
"i": 4
}
],
"cols": null,
"w": 454,
"h": 58
}
},
"d751744d13df": {
"type": "ocr",
"title": "Off Mesh Link",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Off Mesh Link",
"i": 0
},
{
"t": "网格外连接组件",
"i": 4
},
{
"t": "连接网格外的两个点，实现跨越、跳跃等特殊路径",
"i": 0
},
{
"t": "Off Mesh Link",
"i": 1
},
{
"t": "Start",
"i": 0
},
{
"t": "人 Start 2 （Transform）",
"i": 2
},
{
"t": "End",
"i": 0
},
{
"t": "人 Endd2 （Transform）",
"i": 2
},
{
"t": "Cost Override",
"i": 0
},
{
"t": "-1",
"i": 2
},
{
"t": "Bi Directional",
"i": 0
},
{
"t": "Activated",
"i": 0
},
{
"t": "Auto Update Positions",
"i": 0
},
{
"t": "Navigation Area",
"i": 0
},
{
"t": "Walkable",
"i": 2
},
{
"t": "Start 起始点",
"i": 0
},
{
"t": "Start",
"i": 2
},
{
"t": "End",
"i": 4
},
{
"t": "起始点",
"i": 2
},
{
"t": "结束点",
"i": 4
},
{
"t": "连接的起始位置，",
"i": 0
},
{
"t": "寻路时从该点出发。",
"i": 0
},
{
"t": "02",
"i": 0
},
{
"t": "End 结束点",
"i": 0
},
{
"t": "连接的结束位置，",
"i": 0
},
{
"t": "寻路时到达该点。",
"i": 0
},
{
"t": "设置 Cost Override",
"i": 4
},
{
"t": "03 Cost Override 覆盖消耗值",
"i": 0
},
{
"t": "默认（不设置）",
"i": 3
},
{
"t": "（增大连 点消耗）",
"i": 4
},
{
"t": "优先选择步行路径",
"i": 4
},
{
"t": "• 负数或O：使用所属Area区域中的消耗值",
"i": 0
},
{
"t": "可能选择连接点（距离更短）",
"i": 3
},
{
"t": "（虽然距离更远）",
"i": 4
},
{
"t": "• 正数：使用 Area 区域寻路消耗值 ×该值",
"i": 0
},
{
"t": "连授点",
"i": 4
},
{
"t": "连疫点（消耗低）",
"i": 3
},
{
"t": "（正数代表该连接点的寻路消耗）",
"i": 0
},
{
"t": "（消秏窩）",
"i": 4
},
{
"t": "一-〇-",
"i": 3
},
{
"t": "-◎",
"i": 4
},
{
"t": "• 主要用来解决：当有“步行”和连接点都可以",
"i": 0
},
{
"t": "到达某个目标时，希望优先选择步行区域，",
"i": 0
},
{
"t": "但步行路径明显更远时修改该值。",
"i": 0
},
{
"t": "步行路径",
"i": 3
},
{
"t": "步行路径",
"i": 4
},
{
"t": "（距离远）",
"i": 3
},
{
"t": "（距窩远）",
"i": 4
},
{
"t": "04",
"i": 0
},
{
"t": "Bi Directional 双向连接",
"i": 0
},
{
"t": "开启（双向）",
"i": 3
},
{
"t": "关闲（单向）",
"i": 4
},
{
"t": "是否开启双向连接点。",
"i": 0
},
{
"t": "•开启：可以从 Start 到 End，",
"i": 0
},
{
"t": "反之也可以。",
"i": 0
},
{
"t": "可从 Start - End",
"i": 3
},
{
"t": "•关闭：只能从 Start 到 End。",
"i": 0
},
{
"t": "也可从 End - Start",
"i": 3
},
{
"t": "只能从 Start End",
"i": 4
},
{
"t": "Activated 启用状态",
"i": 0
},
{
"t": "启用（生效）",
"i": 3
},
{
"t": "关闭（失效）",
"i": 4
},
{
"t": "05",
"i": 0
},
{
"t": "是否启用该连接点。",
"i": 0
},
{
"t": "•开启：连接点生效，参与自动寻路。",
"i": 0
},
{
"t": "•关闭：连接点失效，不参与寻路。",
"i": 0
},
{
"t": "参与自动寻路",
"i": 3
},
{
"t": "相当于失效，不参与寻路",
"i": 4
},
{
"t": "Auto Update Positions 自动更新位置",
"i": 0
},
{
"t": "启用（自动更新）",
"i": 3
},
{
"t": "不启用（不更新）",
"i": 4
},
{
"t": "是否自动更新位置。",
"i": 0
},
{
"t": "•启用：当开始和结束位置改变时，",
"i": 0
},
{
"t": "导航网格也将更新。",
"i": 0
},
{
"t": "•不启用：即使改变了开始或结束位置，",
"i": 0
},
{
"t": "移动后，连接位置自动更新",
"i": 2
},
{
"t": "也会按照刚开始的位置进行计算。",
"i": 0
},
{
"t": "移动后，仍按原位置计算",
"i": 4
},
{
"t": "合理设置 Off Mesh Link，可以让AI在复杂地形中实现跨越、跳跃、攀爬等智能路径！",
"i": 1
},
{
"t": "小贴士",
"i": 0
}
],
"cols": null,
"w": 788,
"h": 1400
}
},
"d85b53c7f057": {
"type": "ocr",
"title": "向量叉乘（Cross Product）",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "向量叉乘（Cross Product）",
"i": 0
},
{
"t": "几何意义",
"i": 4
},
{
"t": "AxB 的大小等于以A、B",
"i": 4
},
{
"t": "A xB：向量A与B的又乘结果",
"i": 2
},
{
"t": "为邻边的平行四边形的面积：",
"i": 4
},
{
"t": "方向垂直于A、B所在平面，",
"i": 2
},
{
"t": "避循右手定则",
"i": 2
},
{
"t": "AXB=AB sinB",
"i": 4
},
{
"t": "AxB",
"i": 1
},
{
"t": "其中：",
"i": 4
},
{
"t": "IAl：向量A的长度（模长）",
"i": 4
},
{
"t": "|B：向量B的长度（模长）",
"i": 4
},
{
"t": "B：向量A与B的夹角（0°~180°）",
"i": 4
},
{
"t": "A、B所在的平面",
"i": 3
},
{
"t": "（此处为XZ平面）",
"i": 3
},
{
"t": "A",
"i": 2
},
{
"t": "右手定则",
"i": 4
},
{
"t": "AAXB",
"i": 4
},
{
"t": "B",
"i": 2
},
{
"t": "A",
"i": 4
},
{
"t": "B",
"i": 4
},
{
"t": "伸开右手：",
"i": 4
},
{
"t": "食指指向 A的方向",
"i": 4
},
{
"t": "中指指向 B的方向",
"i": 4
},
{
"t": "X",
"i": 0
},
{
"t": "大拇指指向 A ×B 的方向",
"i": 4
},
{
"t": "要点总结",
"i": 0
},
{
"t": "注意事项",
"i": 3
},
{
"t": "• AxB的方向 垂直于A与B所在的平面",
"i": 0
},
{
"t": "• 不满足交换律：A× B= （B×A）",
"i": 3
},
{
"t": "A xB 的方向 由右手定则确定",
"i": 0
},
{
"t": "• 不满足结合律：（A ×B） ×C A×（B×C）",
"i": 3
},
{
"t": "A xB 的大小 等于 IAl|B sin B",
"i": 0
},
{
"t": "• A× A=0（任何向量与自身又乘结果为零向量）",
"i": 3
},
{
"t": "若AII B（B=0°或180°），则A×B=0",
"i": 0
}
],
"cols": null,
"w": 1400,
"h": 1196
}
},
"d91155276a4e": {
"type": "ocr",
"title": "Blend Tree",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Blend Tree",
"i": 2
},
{
"t": "New StateMachine",
"i": 0
}
],
"cols": null,
"w": 641,
"h": 452
}
},
"db793b681fd4": {
"type": "ocr",
"title": "Physics Material",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Physics Material",
"i": 0
},
{
"t": "GUI Skin",
"i": 0
},
{
"t": "Custom Font",
"i": 0
},
{
"t": "主菜单",
"i": 1
},
{
"t": "主菜单",
"i": 0
},
{
"t": "Bullet Info",
"i": 0
},
{
"t": "Input Actions",
"i": 0
}
],
"cols": null,
"w": 297,
"h": 297
}
},
"dc47541f98f8": {
"type": "ocr",
"title": "Folder / Hlas Material",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "Q",
"i": 2
},
{
"t": "Folder",
"i": 0
},
{
"t": "Material",
"i": 0
},
{
"t": "MonoBehaviour Script",
"i": 0
},
{
"t": "Prefab Variant",
"i": 0
},
{
"t": "2D",
"i": 0
},
{
"t": "Animation",
"i": 0
},
{
"t": "Audio",
"i": 0
},
{
"t": "Rendering",
"i": 0
},
{
"t": "Scene",
"i": 0
},
{
"t": "Scripting",
"i": 0
},
{
"t": "Search",
"i": 0
},
{
"t": "Shader",
"i": 0
},
{
"t": "Shader Graph",
"i": 0
},
{
"t": "Testing",
"i": 0
},
{
"t": "Terrain",
"i": 0
},
{
"t": "TextCore",
"i": 0
},
{
"t": "TextMeshPro",
"i": 0
},
{
"t": "Timeline",
"i": 0
},
{
"t": "UI Toolkit",
"i": 0
},
{
"t": "Visual Scripting",
"i": 0
},
{
"t": "Physics Material",
"i": 0
},
{
"t": "GUl Skin",
"i": 0
},
{
"t": "Custom Font",
"i": 0
},
{
"t": "主菜单",
"i": 1
},
{
"t": "Input Actions",
"i": 0
}
],
"title": "Folder"
},
{
"kind": "lines",
"lines": [
{
"t": "Hlas Material",
"i": 0
},
{
"t": "Hlas",
"i": 0
},
{
"t": "Gradient",
"i": 0
},
{
"t": "als",
"i": 0
},
{
"t": "Vle Sheet",
"i": 0
},
{
"t": "Dllowing Characters",
"i": 0
},
{
"t": "eading Characters",
"i": 0
},
{
"t": "pution",
"i": 0
},
{
"t": "Fontroller",
"i": 0
},
{
"t": "我的数据",
"i": 4
}
],
"title": "Hlas Material"
}
],
"w": 557,
"h": 977
}
},
"dd8887daac2b": {
"type": "ocr",
"title": "Un22022及以上販本",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Un22022及以上販本",
"i": 0
},
{
"t": "Code Coverage",
"i": 4
},
{
"t": "a Voul Stco Codr Lotcr",
"i": 0
},
{
"t": "289：",
"i": 3
},
{
"t": "Al Navigation",
"i": 0
},
{
"t": "Baked Agent Siaze",
"i": 0
},
{
"t": "o.s",
"i": 2
},
{
"t": "Agent Heig",
"i": 0
},
{
"t": "MaxSiope",
"i": 0
},
{
"t": "Step Heignt",
"i": 0
},
{
"t": "Generated Oft Mesh Link",
"i": 0
},
{
"t": "Droo Heictk",
"i": 0
},
{
"t": "Jup Distnce",
"i": 0
},
{
"t": "•Advanced",
"i": 0
},
{
"t": "Boke",
"i": 4
},
{
"t": "G.",
"i": 0
},
{
"t": "＜Plane",
"i": 1
},
{
"t": "Tog Untagond",
"i": 1
},
{
"t": "就果地了谢影领來的功超。可以先把還得中出把真选中门发平近。我道看里片大料",
"i": 0
}
],
"cols": null,
"w": 399,
"h": 1400
}
},
"dfd9d230f4f7": {
"type": "ocr",
"title": "UI",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "UI",
"i": 0
},
{
"t": "Image",
"i": 4
},
{
"t": "UI Toolkit",
"i": 0
},
{
"t": "Text-TextMeshPro",
"i": 4
},
{
"t": "Camera",
"i": 0
},
{
"t": "Raw Image",
"i": 4
},
{
"t": "Visual Scrpting Scene Variables",
"i": 0
},
{
"t": "Pane！",
"i": 4
},
{
"t": "Toggle",
"i": 4
},
{
"t": "Slider",
"i": 4
},
{
"t": "Scrollbar",
"i": 4
},
{
"t": "Scroll View",
"i": 4
},
{
"t": "Button - TextMeshPro",
"i": 4
},
{
"t": "Dropdown•TextMeshPro",
"i": 4
},
{
"t": "Input Field - TextMeshPro",
"i": 4
}
],
"cols": null,
"w": 537,
"h": 270
}
},
"e3253d4c4056": {
"type": "ocr",
"title": "A B C D E F G J",
"data": {
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"A B C D E F G J",
"K"
],
[
"1 id name money atk atkRange offsetTime nextlev imgRes res atkType",
"eff"
],
[
"2 int string int int int float int string string int",
"string"
],
[
"3",
"key"
],
[
"攻击类",
""
],
[
"1代表单",
""
],
[
"4 唯一ID 塔的名字 塔的价值 攻击力 攻击范围 攻击间隔时间 下一等级的塔ID 塔图片路径 塔顶设体路径",
"特效路径"
],
[
"体攻击",
""
],
[
"2代表群",
""
],
[
"体攻击",
""
],
[
"5 1 加农炮1 200 5 4 1 2 Towerlmg/1_1 Tower/1_1",
"1 eff/Fire1"
],
[
"6 2 加农炮2 300 10 4 1 3 Towerimg/1._2 Tower/1.2",
"1 ef/Firea"
],
[
"7 3 加农炮3 400 20 1 0 Towerlmg/1._3 Tower/1_3",
"1 eff/Firea"
],
[
"8 4 机枪炮1 200 2 0.2 5 Towerlmg/2_1 Tower/2.1",
"1eff/Fire1"
],
[
"9 5 机枪炮2 300 4 0.2 6 Towerlmg/2.2 Tower/2_2",
"1 eff/Fire1"
],
[
"10 6 机枪炮3 400 6 0.2 0 Towerlmg/2.3 Towe:/2.3",
"1 eff/Firel"
],
[
"11 7 魔法炮1 200 3 0.5 8 Towerlmg/3.1 Tower/3_1",
"2 eff/Fire2"
],
[
"12 8 魔法炮2 300 6 0.5 9 TowerImg/3_2 Towe:/3.2",
"2 eff/Fire2"
],
[
"13 9魔法炮3 400 9 0.5 0 Towerimg/3 3 Tower3 3",
"2 eff/Fire2"
]
]
}
],
"lines": null,
"cols": null,
"w": 908,
"h": 382
}
},
"e4fa7247fad6": {
"type": "ocr",
"title": "Fill",
"data": {
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"0 Inspector",
"Navigation"
],
[
"Open",
"② 女"
],
[
"Open",
""
]
]
},
{
"h": "Fill",
"rows": [
[
"Texture",
"None （Texture 2D）"
],
[
"Offset",
"0"
]
]
},
{
"h": "Angle Range （360）",
"rows": [
[
"Start 180 End -180 Order",
"0"
]
]
},
{
"h": "Corners",
"rows": [
[
"Outer Top Left",
"None （Sprite）"
],
[
"Outer Top Right",
"None （Sprite）"
],
[
"Outer Bottom Left",
"None （Sprite）"
],
[
"Outer Bottom Right",
"None （Sprite）"
],
[
"Inner Top Left",
"None （Sprite）"
],
[
"Inner Top Right",
"None （Sprite）"
],
[
"Inner Bottom Left",
"None （Sprite）"
],
[
"Inner Bottom Right",
"None （Sprite）"
]
]
}
],
"lines": null,
"cols": null,
"w": 744,
"h": 1400
}
},
"e54a2a0f1f4b": {
"type": "ocr",
"title": "什么是数据持久化",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "什么是数据持久化",
"i": 1
},
{
"t": "让数据在游戏结束后依然存在",
"i": 2
},
{
"t": "数据持久化是指将游戏运行时产生或变化的数据，",
"i": 1
},
{
"t": "从内存保存到硬盘等存储设备中，以便下次游戏时可以重新加载和使用。",
"i": 0
},
{
"t": "工作原理",
"i": 0
},
{
"t": "游戏运行时",
"i": 1
},
{
"t": "内存（RAM）",
"i": 4
},
{
"t": "变量数据",
"i": 3
},
{
"t": "临时存储数据",
"i": 4
},
{
"t": "游戏进行中产生",
"i": 1
},
{
"t": "速度快，断电丢失",
"i": 4
},
{
"t": "或变化的数据",
"i": 1
},
{
"t": "持久化的本质：",
"i": 0
},
{
"t": "将内存中的数据序列化（二进制）",
"i": 0
},
{
"t": "硬盘（存储设备）",
"i": 4
},
{
"t": "后保存到硬盘，需要时再反序列化",
"i": 0
},
{
"t": "长期存储数据",
"i": 4
},
{
"t": "加载回内存使用。",
"i": 0
},
{
"t": "速度较慢，安全可靠",
"i": 4
},
{
"t": "二进制是什么？",
"i": 0
},
{
"t": "优点",
"i": 3
},
{
"t": "缺点",
"i": 4
},
{
"t": "二进制是计算机中数据的最小表示单位，",
"i": 0
},
{
"t": "⑦ 跨平台：二进制格式通用性强，",
"i": 2
},
{
"t": "x 不可读：无法直接查看和",
"i": 4
},
{
"t": "只有0和1两种状态。",
"i": 0
},
{
"t": "不同平台间兼容性好",
"i": 2
},
{
"t": "编辑，需要专用工具解析",
"i": 4
},
{
"t": "示例：数字5的二进制表示",
"i": 0
},
{
"t": "节省空间：二进制体积小，",
"i": 2
},
{
"t": "x 开发成本高：需要设计数据",
"i": 4
},
{
"t": "存储效率高",
"i": 3
},
{
"t": "结构和序列化/反序列化逻辑",
"i": 4
},
{
"t": "0000",
"i": 0
},
{
"t": "0101",
"i": 1
},
{
"t": "读写高效：二进制解析速度快，",
"i": 3
},
{
"t": "× 版本辣容性：数据结构变更时，",
"i": 4
},
{
"t": "性能更优",
"i": 3
},
{
"t": "可能导致旧数据无法读取",
"i": 4
},
{
"t": "计算机中所有数据（数字、文字、盥片、",
"i": 0
},
{
"t": "＜ 安全性好：不易被直接算改或",
"i": 2
},
{
"t": "音频等）最终都会转换为二进制进行存储。",
"i": 0
},
{
"t": "× 调试困难：排查问题时不直观",
"i": 4
},
{
"t": "人类直接读取",
"i": 3
},
{
"t": "使用场景",
"i": 0
},
{
"t": "存档系统",
"i": 1
},
{
"t": "本地缓存",
"i": 4
},
{
"t": "保存玩家进度、等级、装备、任务等",
"i": 1
},
{
"t": "缓存资源、临时数据，减少重复",
"i": 4
},
{
"t": "信息，下次继续游戏",
"i": 1
},
{
"t": "计算或下載",
"i": 4
},
{
"t": "配置保存",
"i": 1
},
{
"t": "日志记录",
"i": 4
},
{
"t": "游戏设置、音量、画质、按键映射",
"i": 1
},
{
"t": "记录游戏运行日志、错误信息，",
"i": 4
},
{
"t": "等用户偏好配置",
"i": 1
},
{
"t": "便于分析和优化",
"i": 4
},
{
"t": "排行榜/成就",
"i": 1
},
{
"t": "云存档同步",
"i": 4
},
{
"t": "保存玩家成绩、成就、排名等数据，",
"i": 1
},
{
"t": "结合云存储、实现多设备间数据",
"i": 4
},
{
"t": "买现长期追踪",
"i": 1
},
{
"t": "同步和备份",
"i": 4
},
{
"t": "数据持久化是游戏开发中非常重要的一环，它让玩家的努力和成果得以保存，",
"i": 1
},
{
"t": "总结",
"i": 0
},
{
"t": "提升游戏体验和留存率。合理使用二进制持久化方案，可以让你的游戏更加",
"i": 1
},
{
"t": "稳定、高效和专业！",
"i": 1
},
{
"t": "常用的二进制序列化工具：Protocol Buffers、FlatBuffers、",
"i": 1
},
{
"t": "小贴士",
"i": 0
},
{
"t": "自定义二进制格式、JSON（文本格式，便于调试但体积较大）",
"i": 1
}
],
"cols": null,
"w": 788,
"h": 1400
}
},
"e5e1e401390e": {
"type": "ocr",
"title": "Sprite Editor",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Sprite Editor",
"i": 0
},
{
"t": "Secondary Textures•",
"i": 0
},
{
"t": "Revert Apply",
"i": 4
},
{
"t": "Secondary Textures",
"i": 4
},
{
"t": "Name",
"i": 4
},
{
"t": "123",
"i": 4
},
{
"t": "Texture",
"i": 4
},
{
"t": "今ISO_LowTile_Stone_03",
"i": 4
},
{
"t": "Name",
"i": 4
},
{
"t": "34234",
"i": 4
},
{
"t": "Texture",
"i": 4
},
{
"t": "今ISO LowTile_DirtToStoneTra ◎",
"i": 4
}
],
"cols": null,
"w": 1400,
"h": 740
}
},
"e6494f22ac01": {
"type": "ocr",
"title": "= Hierarchy / Static",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "= Hierarchy",
"i": 0
},
{
"t": "Project",
"i": 2
},
{
"t": "0 Inspector",
"i": 4
},
{
"t": "2",
"i": 3
},
{
"t": "日29！•2",
"i": 3
},
{
"t": "©27",
"i": 4
},
{
"t": "Temp",
"i": 4
},
{
"t": "SampleScene*",
"i": 0
},
{
"t": "Assets",
"i": 2
},
{
"t": "Untagged",
"i": 4
},
{
"t": "G Main Camera",
"i": 0
},
{
"t": "Tag",
"i": 4
},
{
"t": "Resources",
"i": 3
},
{
"t": "Directional Light",
"i": 0
},
{
"t": "Font&Materials",
"i": 3
},
{
"t": "Global Volume",
"i": 1
},
{
"t": "Transform",
"i": 4
},
{
"t": "Cube",
"i": 3
},
{
"t": "Y Grid",
"i": 0
},
{
"t": "MrTangData",
"i": 3
},
{
"t": "Position",
"i": 4
},
{
"t": "Cube",
"i": 1
},
{
"t": "MyDatalest",
"i": 3
},
{
"t": "Rotation",
"i": 4
},
{
"t": "Y Canvas",
"i": 0
},
{
"t": "New Material",
"i": 3
},
{
"t": "Scale",
"i": 4
},
{
"t": "Eventsystem",
"i": 0
},
{
"t": "ScriptableObject",
"i": 3
},
{
"t": "M GameObject",
"i": 0
},
{
"t": "ScriptableObjectTwo",
"i": 3
},
{
"t": "Temp （Script）",
"i": 4
},
{
"t": "Y GameObject （1）",
"i": 0
},
{
"t": "Temp",
"i": 3
},
{
"t": "G Temp",
"i": 0
},
{
"t": "Scenes",
"i": 3
},
{
"t": "Script",
"i": 4
},
{
"t": "Settings",
"i": 3
},
{
"t": "Mydata",
"i": 4
},
{
"t": "TextMesh Pro",
"i": 3
},
{
"t": "Examples & Extras",
"i": 3
},
{
"t": "Fonts",
"i": 3
}
],
"title": "= Hierarchy"
},
{
"kind": "lines",
"lines": [
{
"t": "Static",
"i": 4
},
{
"t": "Default",
"i": 2
},
{
"t": "Layer",
"i": 1
},
{
"t": "X",
"i": 0
},
{
"t": "Y",
"i": 2
},
{
"t": "Z",
"i": 4
},
{
"t": "Y",
"i": 2
},
{
"t": "X",
"i": 0
},
{
"t": "Z",
"i": 4
},
{
"t": "1",
"i": 0
},
{
"t": "Y",
"i": 2
},
{
"t": "1",
"i": 2
},
{
"t": "Z",
"i": 4
},
{
"t": "1",
"i": 4
},
{
"t": "# Temp",
"i": 0
},
{
"t": "None （My Data）",
"i": 0
},
{
"t": "Add Component",
"i": 0
}
],
"title": "Static"
}
],
"w": 1518,
"h": 426
}
},
"ebcaa5faa259": {
"type": "ocr",
"title": "IMPACT SDF",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "IMPACT SDF",
"i": 1
},
{
"t": "New TMP Color Gradient",
"i": 1
},
{
"t": "Scenes",
"i": 0
},
{
"t": "Texture Type",
"i": 3
},
{
"t": "|Sprite （2D and UI）",
"i": 4
},
{
"t": "Settings",
"i": 0
},
{
"t": "Texture Shape",
"i": 3
},
{
"t": "2D",
"i": 4
},
{
"t": "TextMesh Pro",
"i": 0
},
{
"t": "Examples & Extras",
"i": 0
},
{
"t": "Sprite Mode",
"i": 3
},
{
"t": "Multiple",
"i": 4
},
{
"t": "Fonts",
"i": 0
},
{
"t": "Pixels Per Unit",
"i": 3
},
{
"t": "1007",
"i": 4
},
{
"t": "Resources",
"i": 0
},
{
"t": "Mesh Type",
"i": 3
},
{
"t": "Tight",
"i": 4
},
{
"t": "Fonts & Materials",
"i": 1
},
{
"t": "Extrude Edges",
"i": 3
},
{
"t": "Sprite Assets",
"i": 1
},
{
"t": "Style Sheets",
"i": 1
},
{
"t": "Generate Physics：",
"i": 3
},
{
"t": "50",
"i": 1
},
{
"t": "Default Style Sheet",
"i": 1
},
{
"t": "Open Sprite Editor",
"i": 4
},
{
"t": "LineBreaking Following Characters",
"i": 1
},
{
"t": "LineBreaking Leading Characters",
"i": 1
},
{
"t": "• Advanced",
"i": 3
},
{
"t": "TMP Settings",
"i": 1
},
{
"t": "Wrap Mode",
"i": 3
},
{
"t": "Clamp",
"i": 4
},
{
"t": "Shaders",
"i": 0
},
{
"t": "Sprites",
"i": 0
},
{
"t": "Filter Mode",
"i": 3
},
{
"t": "Bllinear",
"i": 4
},
{
"t": "EmojiOne Attribution",
"i": 1
},
{
"t": "Aniso Level",
"i": 3
},
{
"t": "EmoiiOne",
"i": 1
},
{
"t": "EmojiOne",
"i": 1
},
{
"t": "Default",
"i": 3
},
{
"t": "Tree_Textures",
"i": 0
},
{
"t": "Max Size",
"i": 3
},
{
"t": "512",
"i": 4
},
{
"t": "Tutoriallnfo",
"i": 0
},
{
"t": "InputSystem_Actions",
"i": 0
},
{
"t": "Resize Algorithm",
"i": 3
},
{
"t": "Mitchell",
"i": 4
},
{
"t": "New Animator Controller",
"i": 0
},
{
"t": "Automatic",
"i": 4
},
{
"t": "Format",
"i": 3
},
{
"t": "New Animator Override Controller",
"i": 0
},
{
"t": "compression",
"i": 3
},
{
"t": "Normal Quality",
"i": 4
},
{
"t": "NewMonoBehaviourScript",
"i": 0
},
{
"t": "Readme",
"i": 0
},
{
"t": "Use Crunch Compres",
"i": 3
},
{
"t": "Tree",
"i": 0
},
{
"t": "Packages",
"i": 0
},
{
"t": "Revert",
"i": 4
},
{
"t": "Apply",
"i": 4
},
{
"t": "V Asset PostProcessors",
"i": 3
},
{
"t": "> UnityEditor.ShaderGraph.ShaderGraphAssetPos",
"i": 3
},
{
"t": "Emo",
"i": 3
},
{
"t": "RGB",
"i": 3
},
{
"t": "R",
"i": 4
},
{
"t": "①0③",
"i": 4
},
{
"t": "2x512 RGBA Corje",
"i": 3
},
{
"t": "DXIISIBC3 SRGB",
"i": 4
},
{
"t": "341.",
"i": 4
}
],
"cols": null,
"w": 667,
"h": 803
}
},
"edd56498eb1c": {
"type": "ocr",
"title": "kesourceS",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "kesourceS",
"i": 2
},
{
"t": "Assets",
"i": 0
},
{
"t": "Open",
"i": 4
},
{
"t": "ResO",
"i": 0
},
{
"t": "Create",
"i": 1
},
{
"t": "Folder",
"i": 3
},
{
"t": "Scen",
"i": 0
},
{
"t": "Scrip",
"i": 0
},
{
"t": "Show in Explorer",
"i": 1
},
{
"t": "C# Script",
"i": 3
},
{
"t": "Stand",
"i": 0
},
{
"t": "Open",
"i": 1
},
{
"t": "Shader",
"i": 3
},
{
"t": "Packag",
"i": 0
},
{
"t": "Delete",
"i": 1
},
{
"t": "Testing",
"i": 3
},
{
"t": "Rename",
"i": 1
},
{
"t": "Playables",
"i": 3
},
{
"t": "Copy Path",
"i": 1
},
{
"t": "Alt+Ctrl+C",
"i": 2
},
{
"t": "Assembly Definition",
"i": 3
},
{
"t": "Open Scene Additive",
"i": 1
},
{
"t": "Assembly Definition Reference",
"i": 3
},
{
"t": "TextMeshPro",
"i": 3
},
{
"t": "View in Package Manager",
"i": 1
},
{
"t": "Scene",
"i": 3
},
{
"t": "Import New Asset...",
"i": 1
},
{
"t": "Prefab Variant",
"i": 3
},
{
"t": "Import Package",
"i": 1
},
{
"t": "Export Package..",
"i": 1
},
{
"t": "Audio Mixer",
"i": 3
},
{
"t": "Find References In Scene",
"i": 1
},
{
"t": "Material",
"i": 3
},
{
"t": "Select Dependencies",
"i": 1
},
{
"t": "Lens Flare",
"i": 3
},
{
"t": "Refresh",
"i": 1
},
{
"t": "Ctrl+R",
"i": 2
},
{
"t": "Render Texture",
"i": 3
},
{
"t": "Reimport",
"i": 1
},
{
"t": "Lightmap Parameters",
"i": 3
},
{
"t": "Custom Render Texture",
"i": 3
},
{
"t": "Reimport All",
"i": 1
},
{
"t": "Sprite Atlas",
"i": 3
},
{
"t": "Extract From Prefab",
"i": 1
},
{
"t": "Sprite Library Asset （Experimenta）",
"i": 3
},
{
"t": "Run API Updater...",
"i": 1
},
{
"t": "Sprites",
"i": 3
},
{
"t": "Update UIElements Schema",
"i": 1
},
{
"t": "Animator Controller",
"i": 3
},
{
"t": "Open C# Project",
"i": 1
},
{
"t": "Animation",
"i": 3
}
],
"cols": null,
"w": 1400,
"h": 1123
}
},
"eef0c0459066": {
"type": "ocr",
"title": "PosX",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "PosX",
"i": 3
},
{
"t": "PosY",
"i": 4
},
{
"t": "• HumancidRunLeft",
"i": 0
},
{
"t": "• Humanoidkunkight",
"i": 0
}
],
"cols": null,
"w": 354,
"h": 330
}
},
"efada7e6a692": {
"type": "ocr",
"title": "②社：",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "v TextMeshPro - Text （UI）",
"i": 0
},
{
"t": "②社：",
"i": 4
},
{
"t": "Text Input",
"i": 0
},
{
"t": "Enable RTL Editor",
"i": 4
},
{
"t": "New Text",
"i": 0
}
],
"cols": null,
"w": 690,
"h": 250
}
},
"efc05dfc3145": {
"type": "ocr",
"title": "Window Help",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Window Help",
"i": 0
},
{
"t": "Panels",
"i": 1
},
{
"t": "Next Window",
"i": 1
},
{
"t": "Ctrl+Tab",
"i": 4
},
{
"t": "Previous Window",
"i": 1
},
{
"t": "Ctrl+Shift+Tab",
"i": 4
},
{
"t": "Layouts",
"i": 1
},
{
"t": "Multiplayer",
"i": 1
},
{
"t": "Search",
"i": 1
},
{
"t": "Unity Version Control",
"i": 1
},
{
"t": "Asset Store",
"i": 1
},
{
"t": "My Assets",
"i": 1
},
{
"t": "Package Manager",
"i": 1
}
],
"cols": null,
"w": 455,
"h": 450
}
},
"f1fb62e50030": {
"type": "ocr",
"title": "Editor",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Editor",
"i": 0
},
{
"t": "ScriotableObiectTool",
"i": 4
}
],
"cols": null,
"w": 443,
"h": 45
}
},
"f58173053cc3": {
"type": "ocr",
"title": "Lighting / - Click to collapse -",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "Lighting",
"i": 0
},
{
"t": "Bevel",
"i": 1
},
{
"t": "Type",
"i": 3
},
{
"t": "Amount",
"i": 3
},
{
"t": "Offset",
"i": 3
},
{
"t": "Width",
"i": 2
},
{
"t": "Roundness",
"i": 3
},
{
"t": "Clamp",
"i": 3
},
{
"t": "Local Lighting",
"i": 1
},
{
"t": "Light Angle",
"i": 3
},
{
"t": "Specular Color",
"i": 3
},
{
"t": "Specular Power",
"i": 3
},
{
"t": "Reflectivity Power",
"i": 3
},
{
"t": "Diffuse Shadow",
"i": 3
},
{
"t": "Ambient Shadow",
"i": 2
},
{
"t": "Bump Map",
"i": 1
},
{
"t": "Texture",
"i": 3
},
{
"t": "Face",
"i": 3
},
{
"t": "Outline",
"i": 3
},
{
"t": "Environment Map",
"i": 1
},
{
"t": "Face Color",
"i": 3
},
{
"t": "Outline Color",
"i": 3
},
{
"t": "Texture",
"i": 3
},
{
"t": "Rotation",
"i": 3
}
],
"title": "Lighting"
},
{
"kind": "lines",
"lines": [
{
"t": "- Click to collapse -",
"i": 4
},
{
"t": "- Click to collapse -",
"i": 4
},
{
"t": "Outer Bevel",
"i": 0
},
{
"t": "0.5",
"i": 4
},
{
"t": "0",
"i": 4
},
{
"t": "- Click to collapse -",
"i": 4
},
{
"t": "3.1416",
"i": 4
},
{
"t": "2",
"i": 4
},
{
"t": "10",
"i": 4
},
{
"t": "0.5",
"i": 4
},
{
"t": "0.5",
"i": 4
},
{
"t": "- Click to collapse -",
"i": 4
},
{
"t": "None",
"i": 0
},
{
"t": "（Texture",
"i": 0
},
{
"t": "2D）",
"i": 0
},
{
"t": "Select",
"i": 0
},
{
"t": "0",
"i": 4
},
{
"t": "- Click to collapse-",
"i": 4
},
{
"t": "None",
"i": 0
},
{
"t": "（Cubemap）",
"i": 0
},
{
"t": "Select",
"i": 0
},
{
"t": "X",
"i": 0
},
{
"t": "IYo",
"i": 2
}
],
"title": "- Click to collapse -"
}
],
"w": 1077,
"h": 954
}
},
"f6d85badf947": {
"type": "ocr",
"title": "V Edge Collider 2D",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "V Edge Collider 2D",
"i": 0
},
{
"t": "Edit Collider",
"i": 0
},
{
"t": "Material",
"i": 0
},
{
"t": "None （Physics Material 2D）",
"i": 2
},
{
"t": "Is Trigger",
"i": 0
},
{
"t": "Used By Effector",
"i": 0
},
{
"t": "XO",
"i": 2
},
{
"t": "Offset",
"i": 0
},
{
"t": "0",
"i": 3
},
{
"t": "Edge Radius",
"i": 0
},
{
"t": "0",
"i": 2
},
{
"t": "Points",
"i": 0
},
{
"t": "Info",
"i": 0
},
{
"t": "Sprites-Default",
"i": 0
},
{
"t": "②8",
"i": 4
}
],
"cols": null,
"w": 765,
"h": 365
}
},
"f6f6aaacd1f5": {
"type": "ocr",
"title": "0 Inspector",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "0 Inspector",
"i": 0
},
{
"t": "New Sprite Atlas （Sprite Atlas）",
"i": 1
},
{
"t": "记：",
"i": 4
},
{
"t": "Open",
"i": 4
},
{
"t": "已添加",
"i": 0
},
{
"t": "撤销",
"i": 4
},
{
"t": "签入",
"i": 4
},
{
"t": "Type",
"i": 0
},
{
"t": "Master",
"i": 2
},
{
"t": "Include in Build",
"i": 0
},
{
"t": "Packing",
"i": 0
},
{
"t": "Allow Rotation",
"i": 0
},
{
"t": "Tight Packing",
"i": 0
},
{
"t": "Alpha Dilation",
"i": 0
},
{
"t": "Padding",
"i": 0
},
{
"t": "4",
"i": 2
},
{
"t": "Texture",
"i": 0
},
{
"t": "Read/Write",
"i": 0
},
{
"t": "Generate Mip Maps",
"i": 0
},
{
"t": "SRGB",
"i": 0
},
{
"t": "Bilinear",
"i": 2
},
{
"t": "Filter Mode",
"i": 0
},
{
"t": "Show Platform Settings",
"i": 0
},
{
"t": "Main Texture",
"i": 2
},
{
"t": "Default",
"i": 1
},
{
"t": "001。",
"i": 2
}
],
"cols": null,
"w": 579,
"h": 653
}
},
"f7e58bb6ca2e": {
"type": "ocr",
"title": "Buoyancy Effector 2D",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Buoyancy Effector 2D",
"i": 1
},
{
"t": "Use Collider Mask",
"i": 0
},
{
"t": "Collider Mask",
"i": 0
},
{
"t": "Everything",
"i": 4
},
{
"t": "Density",
"i": 0
},
{
"t": "2",
"i": 4
},
{
"t": "Surface Level",
"i": 0
},
{
"t": "Damping",
"i": 0
},
{
"t": "Flow",
"i": 0
},
{
"t": "Flow Angle",
"i": 0
},
{
"t": "Flow Magnitude",
"i": 0
},
{
"t": "Flow Variation",
"i": 0
},
{
"t": "0",
"i": 4
}
],
"cols": null,
"w": 707,
"h": 338
}
},
"f8847bc8fcab": {
"type": "ocr",
"title": "Addressables Groups / Addressables Group",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "Addressables Groups",
"i": 0
},
{
"t": "New v Profile: Default",
"i": 0
},
{
"t": "Tools",
"i": 4
},
{
"t": "Group Name \\ Addressable Name",
"i": 1
},
{
"t": "V Default Local Group （Default）",
"i": 1
},
{
"t": "Sphere Variant",
"i": 2
},
{
"t": "Packed Assets",
"i": 1
},
{
"t": "Packed Assets1",
"i": 1
},
{
"t": "＞ Built In Data",
"i": 1
}
],
"title": "Addressables Groups"
},
{
"kind": "lines",
"lines": [
{
"t": "Addressables Groups",
"i": 0
},
{
"t": "Play Mode Script、",
"i": 1
},
{
"t": "Build",
"i": 4
},
{
"t": "Q",
"i": 4
},
{
"t": "Path",
"i": 1
},
{
"t": "New Build",
"i": 4
},
{
"t": "Update a Previous Build",
"i": 4
},
{
"t": "Assets/New Folder",
"i": 2
},
{
"t": "Clear Build Cache",
"i": 4
}
],
"title": "Addressables Groups"
}
],
"w": 1570,
"h": 360
}
},
"f89adbed7d27": {
"type": "ocr",
"title": "Revert",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Revert",
"i": 2
},
{
"t": "Apply",
"i": 3
},
{
"t": "Sprite",
"i": 3
},
{
"t": "Name",
"i": 0
},
{
"t": "3",
"i": 3
},
{
"t": "Position",
"i": 0
},
{
"t": "XO",
"i": 3
},
{
"t": "YO",
"i": 4
},
{
"t": "H 70",
"i": 4
},
{
"t": "W 80",
"i": 3
},
{
"t": "Border",
"i": 0
},
{
"t": "To",
"i": 4
},
{
"t": "LO",
"i": 3
},
{
"t": "RO",
"i": 3
},
{
"t": "30",
"i": 4
},
{
"t": "Pivot",
"i": 0
},
{
"t": "Custom",
"i": 3
},
{
"t": "Pivot Unit Mode",
"i": 0
},
{
"t": "Normalized",
"i": 3
},
{
"t": "Custom Pivot",
"i": 0
},
{
"t": "X 0.5",
"i": 3
},
{
"t": "Y0.5",
"i": 4
}
],
"cols": null,
"w": 1400,
"h": 964
}
},
"f906291fddc1": {
"type": "ocr",
"title": "SSampleScene* / ©27",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "SSampleScene*",
"i": 0
},
{
"t": "Y Main Camera",
"i": 3
},
{
"t": "G Directional Light",
"i": 2
},
{
"t": "G Global Volume",
"i": 2
},
{
"t": "G Grid",
"i": 2
},
{
"t": "Cube",
"i": 4
},
{
"t": "M Canvas",
"i": 3
},
{
"t": "G EventSystem",
"i": 2
},
{
"t": "G GameObject",
"i": 2
},
{
"t": "G GameObiect （1）",
"i": 2
},
{
"t": "G Temp",
"i": 2
},
{
"t": "G PlayAudio",
"i": 2
}
],
"title": "SSampleScene*"
},
{
"kind": "lines",
"lines": [
{
"t": "U",
"i": 2
},
{
"t": "©27",
"i": 2
},
{
"t": "Q",
"i": 0
},
{
"t": "PlayAudio",
"i": 3
},
{
"t": "Static",
"i": 4
},
{
"t": "Assets",
"i": 0
},
{
"t": "Tag",
"i": 2
},
{
"t": "Untagged",
"i": 3
},
{
"t": "Layer",
"i": 4
},
{
"t": "Default",
"i": 4
},
{
"t": "Resources",
"i": 0
},
{
"t": "Editor",
"i": 0
},
{
"t": "Transform",
"i": 3
},
{
"t": "MrTangData",
"i": 1
},
{
"t": "New Random Play Audio",
"i": 1
},
{
"t": "Position",
"i": 2
},
{
"t": "XO",
"i": 3
},
{
"t": "Y",
"i": 4
},
{
"t": "Z",
"i": 4
},
{
"t": "Rolelnto",
"i": 1
},
{
"t": "Rotation",
"i": 2
},
{
"t": "X0",
"i": 3
},
{
"t": "Y",
"i": 4
},
{
"t": "Z",
"i": 4
},
{
"t": "ScriptableObjectTool",
"i": 1
},
{
"t": "Scale",
"i": 2
},
{
"t": "X",
"i": 3
},
{
"t": "1",
"i": 4
},
{
"t": "Y",
"i": 4
},
{
"t": "1",
"i": 4
},
{
"t": "Z",
"i": 4
},
{
"t": "1",
"i": 4
},
{
"t": "Font&Materials",
"i": 0
},
{
"t": "Script",
"i": 0
},
{
"t": "V Play",
"i": 2
},
{
"t": "Audio （Script）",
"i": 3
},
{
"t": "AudioPlayBase",
"i": 1
},
{
"t": "Script",
"i": 2
},
{
"t": "BulletInfo",
"i": 1
},
{
"t": "PlayAudio",
"i": 4
},
{
"t": "PlayAudio",
"i": 1
},
{
"t": "G New Random Play Audio （Random Play Au O",
"i": 3
},
{
"t": "Audio Source",
"i": 2
},
{
"t": "RandomPlayAudio",
"i": 1
},
{
"t": "Rolelnfo",
"i": 1
},
{
"t": "Add Component",
"i": 3
},
{
"t": "cube",
"i": 0
}
],
"title": "©27"
}
],
"w": 1496,
"h": 405
}
},
"fbb96406a041": {
"type": "ocr",
"title": "Layout Properties",
"data": {
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"Layout Properties",
""
],
[
"Property Value",
"Source"
],
[
"Min Width",
"Image"
],
[
"Min Height",
"Image"
],
[
"Preferred Width",
"Image"
],
[
"Preferred Height",
"Image"
],
[
"Flexible Width disabled",
"none"
],
[
"Flexible Height disabled",
"none"
]
]
}
],
"lines": null,
"cols": null,
"w": 585,
"h": 264
}
},
"fce6e7146ba7": {
"type": "ocr",
"title": "a Prolect / o Inspector",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "a Prolect",
"i": 0
},
{
"t": "Unity Version Contro！",
"i": 4
},
{
"t": "Assets",
"i": 2
},
{
"t": "Resources",
"i": 3
},
{
"t": "Font&Materials",
"i": 4
},
{
"t": "IMPACT SDF",
"i": 4
},
{
"t": "New TMP Color Gradient",
"i": 4
},
{
"t": "Scenes",
"i": 3
},
{
"t": "Settings",
"i": 3
},
{
"t": "TextMesh Pro",
"i": 3
},
{
"t": "Tree_Textures",
"i": 3
},
{
"t": "Tutoriallnfo",
"i": 3
},
{
"t": "InputSystem_Actions",
"i": 2
}
],
"title": "a Prolect"
},
{
"kind": "lines",
"lines": [
{
"t": "o Inspector",
"i": 1
},
{
"t": "27",
"i": 0
},
{
"t": "New TMP Color Gradient （TMP_Color G",
"i": 1
},
{
"t": "Open",
"i": 4
},
{
"t": "+ 已添加",
"i": 0
},
{
"t": "签入",
"i": 4
},
{
"t": "撤销",
"i": 4
},
{
"t": "Color Mode",
"i": 1
},
{
"t": "Four Corners Gradient",
"i": 3
},
{
"t": "Colors",
"i": 1
},
{
"t": "#FFFFFFFF",
"i": 3
},
{
"t": "#FFFFFFFF",
"i": 4
},
{
"t": "#FFFFFFFF",
"i": 3
},
{
"t": "#FFFFFFFF",
"i": 4
}
],
"title": "o Inspector"
}
],
"w": 690,
"h": 224
}
},
"fd7b6f43a14b": {
"type": "ocr",
"title": "CCD Solver 2D （Script）",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "CCD Solver 2D （Script）",
"i": 1
},
{
"t": "Effector",
"i": 0
},
{
"t": "None （Transform）",
"i": 2
},
{
"t": "Target",
"i": 0
},
{
"t": "None （Transform）",
"i": 2
},
{
"t": "Chain Length",
"i": 0
},
{
"t": "Iterations",
"i": 0
},
{
"t": "10",
"i": 4
},
{
"t": "Tolerance",
"i": 0
},
{
"t": "0.01",
"i": 4
},
{
"t": "Velocity",
"i": 0
},
{
"t": "0.5",
"i": 4
},
{
"t": "Constrain Rotation",
"i": 0
},
{
"t": "Solve from Default Pose",
"i": 0
},
{
"t": "Weight",
"i": 0
},
{
"t": "• 1",
"i": 4
},
{
"t": "Create Target",
"i": 1
},
{
"t": "Restore Default Pose",
"i": 3
},
{
"t": "Chain Length:IK影响的骨骼数量",
"i": 1
},
{
"t": "Iterations：算法运行的次数",
"i": 1
},
{
"t": "Tolerance：容错程度",
"i": 1
},
{
"t": "Velocitv：速度",
"i": 1
}
],
"cols": null,
"w": 500,
"h": 378
}
},
"fdcb1dc2b0cb": {
"type": "ocr",
"title": "Rename",
"data": {
"kind": "rows",
"groups": [
{
"h": "",
"rows": [
[
"Create",
"Folder"
],
[
"Show in Explorer",
"Material"
],
[
"Open",
"MonoBehaviour Script"
],
[
"Delete",
"Prefab Variant"
]
]
},
{
"h": "Rename",
"rows": [
[
"2D",
""
],
[
"Copy Path",
"Alt+Ctrl+C"
],
[
"Animation",
"Animator Controller"
],
[
"Open Scene Additive Audio",
"Animator Override Controller"
],
[
"Rendering",
"Avatar Mask"
],
[
"View in Package Manager",
""
],
[
"Scene",
"Animation Clip"
]
]
}
],
"lines": null,
"cols": null,
"w": 1239,
"h": 348
}
},
"fdf86a192950": {
"type": "ocr",
"title": "# Scene",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "# Scene",
"i": 0
},
{
"t": "> Animator",
"i": 3
},
{
"t": "Layers Parameters",
"i": 0
},
{
"t": "Base La",
"i": 4
},
{
"t": "Q Name",
"i": 0
},
{
"t": "X",
"i": 0
},
{
"t": "Y",
"i": 0
}
],
"cols": null,
"w": 303,
"h": 251
}
},
"fe450b0f85fa": {
"type": "ocr",
"title": "Assets",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "Assets",
"i": 0
},
{
"t": "AddressableAssetsData",
"i": 0
},
{
"t": "V Addressable",
"i": 3
},
{
"t": "Resources",
"i": 0
},
{
"t": "+ 已添加",
"i": 3
},
{
"t": "Editor",
"i": 1
},
{
"t": "Font&Materials",
"i": 1
},
{
"t": "Script",
"i": 1
},
{
"t": "Script",
"i": 3
},
{
"t": "Cube",
"i": 1
},
{
"t": "3",
"i": 4
},
{
"t": "MrlangData",
"i": 1
},
{
"t": "MyDatalest",
"i": 1
},
{
"t": "F",
"i": 3
},
{
"t": "0",
"i": 4
},
{
"t": "Move From Resources",
"i": 0
},
{
"t": "Any assets in Resources that you wish to mark as",
"i": 1
},
{
"t": "Addressable must be moved within the project. We will",
"i": 1
},
{
"t": "move the files to：",
"i": 1
},
{
"t": "N",
"i": 4
},
{
"t": "Assets/Resources_moved/MyDataTest.asset",
"i": 1
},
{
"t": "N",
"i": 4
},
{
"t": "Are you sure you want to proceed？",
"i": 1
},
{
"t": "Yes",
"i": 3
},
{
"t": "No",
"i": 4
},
{
"t": "NewMonoBehaviourScript",
"i": 0
}
],
"cols": null,
"w": 779,
"h": 533
}
},
"fe6fbcaaa2d5": {
"type": "ocr",
"title": "0 Inspector",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "0 Inspector",
"i": 0
},
{
"t": "Open",
"i": 4
},
{
"t": "Preview",
"i": 0
},
{
"t": "Sprite",
"i": 0
},
{
"t": "PISO_Tile_Brick.Brick.01",
"i": 2
},
{
"t": "Sprite Editor",
"i": 4
},
{
"t": "Color",
"i": 0
},
{
"t": "Collider Type",
"i": 0
},
{
"t": "Sprite",
"i": 2
}
],
"cols": null,
"w": 423,
"h": 239
}
},
"fe70253f5b06": {
"type": "ocr",
"title": "File",
"data": {
"kind": "lines",
"groups": null,
"lines": [
{
"t": "File",
"i": 0
},
{
"t": "Edit",
"i": 0
},
{
"t": "GameObject",
"i": 1
},
{
"t": "Window Help",
"i": 1
},
{
"t": "Assets",
"i": 0
},
{
"t": "Component",
"i": 1
},
{
"t": "W",
"i": 0
},
{
"t": "（5",
"i": 0
},
{
"t": "Center GLocal",
"i": 1
},
{
"t": "II",
"i": 4
},
{
"t": "#Scene",
"i": 0
},
{
"t": "目 Console",
"i": 0
},
{
"t": "Addressables Profiles",
"i": 2
},
{
"t": "~ Animator",
"i": 3
},
{
"t": "Addressables Event Viewer",
"i": 4
},
{
"t": "Addressables Groups",
"i": 1
},
{
"t": "Addressables Hosting",
"i": 2
},
{
"t": "Create、",
"i": 0
},
{
"t": "Test",
"i": 0
},
{
"t": "Service Name",
"i": 2
},
{
"t": "Test",
"i": 3
},
{
"t": "Service Type （ID）",
"i": 2
},
{
"t": "HttpHostir",
"i": 3
},
{
"t": "Service （0）",
"i": 3
},
{
"t": "Port",
"i": 2
},
{
"t": "Reset",
"i": 4
},
{
"t": "Upload Speed （Kb/s）",
"i": 2
},
{
"t": "0",
"i": 3
},
{
"t": "Enable",
"i": 2
},
{
"t": "Hosting Service Variables",
"i": 2
},
{
"t": "Refresh",
"i": 4
},
{
"t": "Variable Name",
"i": 2
},
{
"t": "|Value",
"i": 3
},
{
"t": "PrivatelpAddress",
"i": 2
},
{
"t": "192.168.50.109",
"i": 3
},
{
"t": "HostingServicePort",
"i": 2
},
{
"t": "HostingServicePort.ID_O",
"i": 2
},
{
"t": "0",
"i": 3
}
],
"cols": null,
"w": 1703,
"h": 634
}
},
"ff7b99fecbe8": {
"type": "ocr",
"title": "sources / Open",
"data": {
"kind": "cols",
"groups": null,
"lines": null,
"cols": [
{
"kind": "lines",
"lines": [
{
"t": "sources",
"i": 0
},
{
"t": "Editor",
"i": 1
},
{
"t": "MrTanaData",
"i": 4
},
{
"t": "New Random Play Audio",
"i": 4
},
{
"t": "RoleInTO",
"i": 4
},
{
"t": "ScriptableObjectTool",
"i": 4
},
{
"t": "Font&Materials",
"i": 1
},
{
"t": "Script",
"i": 1
},
{
"t": "AudioPlayBase",
"i": 4
},
{
"t": "Bulletlnfo",
"i": 4
},
{
"t": "RandomPlayAudio",
"i": 4
},
{
"t": "Rolelnfo",
"i": 4
}
],
"title": "sources"
},
{
"kind": "lines",
"lines": [
{
"t": "New Random Play Audio （Random Play Audio）",
"i": 0
},
{
"t": "Open",
"i": 4
},
{
"t": "已添加",
"i": 0
},
{
"t": "撤销",
"i": 4
},
{
"t": "签入",
"i": 4
},
{
"t": "Script",
"i": 0
},
{
"t": "＃ RandomPlayAudio",
"i": 2
},
{
"t": "Y Clips",
"i": 0
},
{
"t": "3",
"i": 4
},
{
"t": "Element O",
"i": 0
},
{
"t": "None （Audio Clip）",
"i": 2
},
{
"t": "Element 1",
"i": 0
},
{
"t": "None （Audio Clip）",
"i": 2
},
{
"t": "Element 2",
"i": 0
},
{
"t": "None （Audio Clip）",
"i": 2
}
],
"title": "Open"
}
],
"w": 1084,
"h": 342
}
}
};
