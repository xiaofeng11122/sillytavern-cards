// 窃玉偷香 — MVU 变量类型定义（schema.ts）
// 约束：顶部禁止 import；z（Zod 4.x）与 _（lodash）为运行时全局注入。
// 硬性要求：幂等解析 Schema.parse(Schema.parse(x)) === Schema.parse(x)；
// 空输入 / 部分输入均可解析（每个分支均有 .prefault 兜底）。
// 哨兵约定：字符串 '' = 无/未设（当前目标.姓名 是阶段指导判断 hasTarget 的哨兵）；
// number 0 = 未设（当前目标.年龄 在无目标时为 0，一旦出现真实目标值强制收敛 18-45）；
// 布尔 false；枚举取首值。

export const Schema = z.object({
  系统: z.object({
    // 氛围型数值：张扬/被目击/苦主察觉上升，只制造心理压力，不会被真正抓捕
    危险度: z.coerce.number().prefault(0).transform(v => _.clamp(Number.isFinite(v) ? v : 0, 0, 100)),
    // 每攻略 1 名宫内目标 +1；>=2 时宫线解锁
    宫线进度: z.coerce.number().prefault(0).transform(v => _.clamp(Number.isFinite(v) ? v : 0, 0, 10)),
  }).prefault({}),
  主角: z.object({
    当前伪装身份: z.string().prefault(''), // 混入目标家中的身份：西席/账房/货郎/郎中/护院等
  }).prefault({}),
  当前目标: z.object({ // UI 目标选择器生成的信息卡 + 攻略状态
    姓名: z.string().prefault(''), // '' 表示尚无目标（hasTarget 哨兵）
    年龄: z.coerce.number().prefault(0).transform(v => (Number.isFinite(v) && v !== 0 ? _.clamp(v, 18, 45) : 0)), // 0=未设；真实目标年龄硬性 18-45
    身份: z.string().prefault(''), // 官宦权贵妻女/富商妻女妾室/青楼花魁歌姬/江湖女子/良家民女/宫中女子
    性格: z.string().prefault(''),
    身材: z.string().prefault(''),
    性癖: z.string().prefault(''),
    敏感点: z.string().prefault(''),
    性经历: z.string().prefault(''), // 与身份年龄现实匹配，驱动寝取情态
    沦陷值: z.coerce.number().prefault(0).transform(v => _.clamp(Number.isFinite(v) ? v : 0, 0, 100)), // 驱动日常态度分档；不设性行为门槛
    信物: z.string().prefault(''), // '' 未赠；得手后可记小物名
    关系阶段: z.enum(['陌生', '相识', '熟络', '暧昧', '沦陷', '得手', '情人']).prefault('陌生'),
  }).prefault({}),
  女帝: z.object({ // 宫线最终目标；女身秘密为全局剧透，由 EJS 门控
    攻略阶段: z.enum(['接触前', '亲近期', '沦陷期']).prefault('接触前'),
    真相已揭示: z.boolean().prefault(false), // 剧透开关：true 后女身/闺名段落方可渲染
  }).prefault({}),
}).prefault({})

// 注：已攻略名册**不进 MVU**。stat_data 会被「变量列表」条目整体注入提示词，名册越长每轮越贵；
// 它只是给玩家翻看的记录，改存聊天变量 窃玉偷香.名册（由目标生成器脚本维护，见 创作规划.yaml「名册」）。

// 类型导出：由 Schema 输出结构推导（不另立 schema 常量，遵守 zod-rule）
export type SchemaRoot = z.output<typeof Schema>
export type SchemaSystem = z.output<typeof Schema>['系统']
export type SchemaProtagonist = z.output<typeof Schema>['主角']
export type SchemaTarget = z.output<typeof Schema>['当前目标']
export type SchemaEmpress = z.output<typeof Schema>['女帝']