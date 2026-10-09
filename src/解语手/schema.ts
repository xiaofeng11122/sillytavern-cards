// 解语手 — MVU 变量类型定义（schema.ts）
// 约束：顶部禁止 import；z（Zod 4.x）与 _（lodash）为运行时全局注入。
// 硬性要求：幂等解析 Schema.parse(Schema.parse(x)) === Schema.parse(x)；
// 空输入 / 部分输入均可解析（每个分支均有 .prefault 兜底）。
// 哨兵约定：字符串 '' = 无/未设（当前客人.姓名 是阶段指导与选择器判断 hasGuest 的哨兵）；
// number 0 = 未设（当前客人.年龄 在无客人时为 0，一旦出现真实客人值强制收敛 18-45）；
// 布尔 false；枚举取首值；空对象 {} = 店里没有别人。

export const Schema = z.object({
  系统: z.object({
    // 街面上与朋友圈里对松间的评价；四档客源层级由它推出（0~29 / 30~59 / 60~84 / 85~100）
    口碑: z.coerce.number().prefault(0).transform(v => _.clamp(Number.isFinite(v) ? v : 0, 0, 100)),
    // 当前时间段与店里状态一句摘要（如「午后·店里没有别人」「里间两位，外间一位在等」）
    店内: z.string().prefault(''),
    // 除按摩房里的主客之外还在店的人：键=姓名，值=位置与状态（如「接待间·喝茶等着，隔一阵问一句好了没」）
    店内客人: z.record(z.string(), z.string()).prefault({}),
  }).prefault({}),
  主角: z.object({
    // 玩家的手艺定位与习惯；轻背景可留白，写法上只给方向
    手法: z.string().prefault(''),
  }).prefault({}),
  当前客人: z.object({ // 生成器写入的信息卡 + 攻略状态；状态栏前六行读这里
    姓名: z.string().prefault(''), // '' 表示尚无客人（hasGuest 哨兵）
    年龄: z.coerce.number().prefault(0).transform(v => (Number.isFinite(v) && v !== 0 ? _.clamp(v, 18, 45) : 0)), // 0=未设；真实客人年龄硬性 18-45
    职业: z.string().prefault(''), // 具体职业（如「投行分析师」「高中教师」「自由插画师」）
    身份: z.string().prefault(''), // 社会身份与处境一句话
    婚配: z.string().prefault(''), // 未婚/已婚/离异/有男友/丧偶等；驱动「苦主」条目显隐
    形貌: z.string().prefault(''), // 两个粗标签：身形 + 职业留下的痕；细节交给演绎
    身体状态: z.string().prefault(''), // 实时：此刻的姿势与服装，每轮重写
    心理: z.string().prefault(''), // 实时：她此刻心里说的那句话本身，每轮重写
    好感度: z.coerce.number().prefault(0).transform(v => _.clamp(Number.isFinite(v) ? v : 0, 0, 100)), // 五档：冷淡/留意/心动/依恋/死心塌地
    性欲: z.coerce.number().prefault(0).transform(v => _.clamp(Number.isFinite(v) ? v : 0, 0, 100)), // 五档：无感/微热/起意/难耐/溃堤
    信任度: z.coerce.number().prefault(0).transform(v => _.clamp(Number.isFinite(v) ? v : 0, 0, 100)), // 隐藏：她肯不肯说心事
    敏感点: z.record(z.string(), z.coerce.number().prefault(0)).prefault({}), // 隐藏：部位 → 0~100 热度
    性癖: z.string().prefault(''), // 2~3 个偏好短标签
    性经历: z.string().prefault(''), // 与职业年龄现实匹配的性经验状态，驱动寝取情态
    来路: z.enum(['自己预约', '熟人引荐']).prefault('自己预约'), // 她是怎么来的
    引荐人: z.string().prefault(''), // 带她来的那位熟客姓名；自己预约时 ''
    知情: z.boolean().prefault(false), // 她知不知道<user>和别的女客的事；跟着引荐人走
    来访次数: z.coerce.number().prefault(0).transform(v => _.clamp(Number.isFinite(v) ? v : 0, 0, 99)),
    关系阶段: z.enum(['初次来访', '熟客', '心事将开', '半推半就', '已成云雨', '情人']).prefault('初次来访'),
    已得手: z.boolean().prefault(false), // 第一次云雨后置 true
  }).prefault({}),
}).prefault({})

// 注：已接待名册**不进 MVU**。stat_data 会被「变量列表」条目整体注入提示词，名册越长每轮越贵；
// 它只是给玩家翻看的记录，改存聊天变量 解语手.名册（由目标生成器脚本维护，见 创作规划.yaml「名册」）。

// 类型导出：由 Schema 输出结构推导（不另立 schema 常量，遵守 zod-rule）
export type SchemaRoot = z.output<typeof Schema>
export type SchemaSystem = z.output<typeof Schema>['系统']
export type SchemaProtagonist = z.output<typeof Schema>['主角']
export type SchemaGuest = z.output<typeof Schema>['当前客人']