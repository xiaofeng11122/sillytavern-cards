import { defineStore } from 'pinia';
import { POOLS, type Guest, type Pool, type ReferralScene } from './data';
import { rosterLine } from './narrative';

/** 脚本 iframe 不在消息楼层的变量作用域链上，必须显式指定楼层 */
const MESSAGE_OPTION = { type: 'message', message_id: 'latest' } as const;

/** 名册存聊天变量：随聊天文件持久化，且**不会**被 MVU 的变量列表条目注入提示词 */
const ROSTER_PATH = '解语手.名册';

/** 一位已经来过的人 */
export interface RosterEntry {
  职业: string;
  圈层: Pool;
  年龄: number;
  形貌: string;
  关系状态: '熟客' | '情人' | '了结';
  好感度: number;
  性欲: number;
  来访次数: number;
  /** 她带来的朋友（姓名列表），用来在面板上看出关系网 */
  带过的人: string[];
}

export type Roster = Record<string, RosterEntry>;

/** 读取当前（最新楼层）的 MVU stat_data */
export function readStatData(): Record<string, any> {
  return _.get(getVariables(MESSAGE_OPTION), 'stat_data', {});
}

/** 响应式地跟随最新楼层的 stat_data */
export function useStatData() {
  const statData = ref<Record<string, any>>(readStatData());
  const reload = () => {
    statData.value = readStatData();
  };
  useIntervalFn(reload, 2000);
  return { statData, reload };
}

/** 响应式地名册（聊天变量） */
export function useRoster() {
  const roster = ref<Roster>(readRoster());
  const reload = () => {
    roster.value = readRoster();
  };
  useIntervalFn(reload, 2000);
  return { roster, reload };
}

export function readRoster(): Roster {
  const raw = _.get(getVariables({ type: 'chat' }), ROSTER_PATH, {});
  return (_.isPlainObject(raw) ? raw : {}) as Roster;
}

/**
 * 把当前客人收进名册。
 *
 * 名册**不进 MVU**：stat_data 会被「变量列表」条目整体注入提示词，名册越长每轮越贵；
 * 它只是给玩家翻看的记录，所以放聊天变量，想翻时打开面板即可。
 */
export function archiveCurrentGuest(statData: Record<string, any>): string | null {
  const name = String(_.get(statData, '当前客人.姓名', '') ?? '');
  const stage = String(_.get(statData, '当前客人.关系阶段', '初次来访'));

  // 只在她成云雨/情人、或者已经走人（换新客）时归档
  if (!name || stage === '初次来访') {
    return null;
  }

  const entry: RosterEntry = {
    职业: String(_.get(statData, '当前客人.职业', '') ?? ''),
    圈层: inferPool(String(_.get(statData, '当前客人.职业', '') ?? '')),
    年龄: Number(_.get(statData, '当前客人.年龄', 0) ?? 0),
    形貌: String(_.get(statData, '当前客人.形貌', '') ?? ''),
    关系状态: stage === '情人' || stage === '已成云雨' ? '情人' : '熟客',
    好感度: Number(_.get(statData, '当前客人.好感度', 0) ?? 0),
    性欲: Number(_.get(statData, '当前客人.性欲', 0) ?? 0),
    来访次数: Number(_.get(statData, '当前客人.来访次数', 0) ?? 0),
    带过的人: [],
  };

  updateVariablesWith(variables => {
    const current = _.get(variables, ROSTER_PATH, {}) as Roster;
    _.set(variables, ROSTER_PATH, { ...current, [name]: { ...entry, 带过的人: current[name]?.带过的人 ?? [] } });
    return variables;
  }, { type: 'chat' });

  return name;
}

/**
 * 熟人引荐：把新客人记进名册里的「带过的人」，让关系网看得见。
 * 由目标生成器在收下引荐签时调用。
 */
export function linkReferral(referrerName: string, guestName: string): void {
  if (!referrerName || !guestName) {
    return;
  }
  updateVariablesWith(variables => {
    const roster = (_.get(variables, ROSTER_PATH, {}) ?? {}) as Roster;
    const referrer = roster[referrerName];
    if (!referrer) {
      return variables;
    }
    const next = _.uniq([...(referrer.带过的人 ?? []), guestName]);
    _.set(variables, ROSTER_PATH, { ...roster, [referrerName]: { ...referrer, 带过的人: next } });
    return variables;
  }, { type: 'chat' });
}

/**
 * 从职业名反推圈层：名册按圈层分组用。
 * 生成器写入的是具体职业名（如「投行分析师」），判断不出时归入「服务」（最保守）。
 */
export function inferPool(job: string): Pool {
  if (/考研|在读|插班|研究生|研三|法硕|大学|学生/.test(job)) return '学生';
  if (/空乘|教练|瑜伽|舞蹈|演员|泳将|运动员|模特/.test(job)) return '形体';
  if (/医生|护士|教师|律师|研究员|药师|医师|编辑|翻译/.test(job)) return '专业';
  if (/设计|插画|主播|摄影|音乐|策展|自由|写作/.test(job)) return '创意';
  if (/店主|店长|美甲|美容|理发|钟点|保洁|家政|店员|厨师|月嫂/.test(job)) return '服务';
  if (/全职|单亲|寡居|陪护|太太|主妇|宝妈/.test(job)) return '主妇';
  if (/经理|总监|主管|分析师|销售|文员|会计|公务员|律师|顾问|策划|运营/.test(job)) return '白领';
  return '服务';
}

/** 已被占用的姓名：名册里的 + 当前客人 */
export function takenNames(statData: Record<string, any>, roster: Roster): Set<string> {
  const current = String(_.get(statData, '当前客人.姓名', '') ?? '');
  return new Set([...Object.keys(roster), ...(current ? [current] : []), ...FIXED_NAMES]);
}

/**
 * 固定角色名：目前没有固定 NPC，留空占位。
 * 将来若加固定配角，把名字填进这里即可让生成器避开。
 */
const FIXED_NAMES: string[] = [];

/**
 * 采用一位客人：写入信息卡，并处理引荐链与店内同场。
 *
 * 引荐路径下还会把引荐人写进 系统.店内客人（她在外间等 / 她陪着进房做示范）。
 */
export function adoptGuest(guest: Guest, scene: ReferralScene = '朋友单独来'): void {
  updateVariablesWith(variables => {
    _.set(variables, 'stat_data.当前客人', {
      姓名: guest.姓名,
      年龄: guest.年龄,
      职业: guest.职业,
      身份: guest.身份,
      婚配: guest.婚配,
      形貌: guest.形貌,
      身体状态: '',
      心理: '',
      好感度: 0,
      性欲: 0,
      信任度: 0,
      敏感点: Object.fromEntries(guest.敏感点.map(part => [part, 0])),
      性癖: guest.性癖,
      性经历: guest.性经历,
      来路: guest.来路,
      引荐人: guest.引荐人 ?? '',
      知情: Boolean(guest.知情),
      来访次数: 0,
      关系阶段: '初次来访',
      已得手: false,
    });

    // 店内同场：引荐人跟着来了就记在店里
    const others: Record<string, string> = {};
    if (guest.来路 === '熟人引荐' && guest.引荐人 && scene !== '朋友单独来') {
      others[guest.引荐人] =
        scene === '她进房做示范' ? '按摩房·坐在床边看着，等轮到自己' : '接待间·喝茶等着，隔一阵问一句好了没';
    }
    _.set(variables, 'stat_data.系统.店内客人', others);
    _.set(
      variables,
      'stat_data.系统.店内',
      scene === '朋友单独来' || Object.keys(others).length === 0 ? '店里没有别人' : '里间一位在做，外间有人等着',
    );

    return variables;
  }, MESSAGE_OPTION);
}

/**
 * 把一段话放进酒馆输入栏（不发送）。
 *
 * 这是本脚本把「界面操作」交回给玩家的唯一出口：选完客人、或想把名册递给说书人时，
 * 文本落进输入栏，玩家可以改，也可以不发。
 */
export function putTextIntoInput(text: string): boolean {
  const $input = $('#send_textarea');
  if (!$input.length) {
    return false;
  }
  $input.val(text).trigger('input');
  return true;
}

/** 把名册压成一行塞进输入框：只在玩家主动需要时花一次 token */
export function handRosterToNarrator(roster: Roster): boolean {
  const names = Object.keys(roster);
  if (!names.length) {
    return false;
  }
  const text = names
    .map(name => {
      const entry = roster[name];
      const brought = entry.带过的人?.length ? `介绍过${entry.带过的人.join('、')}` : '';
      return `${name}(${entry.职业}·${entry.关系状态}·好感${entry.好感度}·性欲${entry.性欲}${brought ? '·' + brought : ''})`;
    })
    .join('，');
  return putTextIntoInput(`（名册：${text}）`);
}

/** 生成器自身的界面偏好与签筒状态：都不是剧情数据，不进 MVU，只存 localStorage */
export const useUiStore = defineStore('目标生成器', () => {
  const expanded = useLocalStorage('解语手:生成器-展开', true);
  const pools = useLocalStorage<Pool[]>('解语手:生成器-身份池', [...POOLS]);
  const ageIndex = useLocalStorage('解语手:生成器-年龄段', 0);
  const rosterOpen = useLocalStorage('解语手:生成器-名册展开', false);
  const slip = ref<Guest | null>(null);
  /** 引荐路径下选中的熟客与场面 */
  const referrer = ref<string>('');
  const scene = ref<ReferralScene>('朋友单独来');

  const toggleExpanded = () => {
    expanded.value = !expanded.value;
  };

  return { expanded, pools, ageIndex, rosterOpen, slip, referrer, scene, toggleExpanded };
});

/** 供界面展示的名册行 */
export function rosterSummary(name: string, entry: RosterEntry): string {
  return `${name}｜${rosterLine(entry)}｜好感 ${entry.好感度}｜性欲 ${entry.性欲}`;
}