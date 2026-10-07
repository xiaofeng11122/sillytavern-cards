import { defineStore } from 'pinia';
import { POOLS, type DrawnTarget, type Pool } from './data';

/** 脚本 iframe 不在消息楼层的变量作用域链上，必须显式指定楼层（详见 tavern-helper-runtime.md） */
const MESSAGE_OPTION = { type: 'message', message_id: 'latest' } as const;

/** 名册存聊天变量：随聊天文件持久化，且**不会**被 MVU 的变量列表条目注入提示词 */
const ROSTER_PATH = '窃玉偷香.名册';

/** 固定角色，生成器必须避开这些姓名 */
const RESERVED_NAMES = ['文疏影', '萧月蘅', '贺晚晴'];

/** 一个已攻略的人 */
export interface RosterEntry {
  身份: string;
  圈层: Pool;
  年龄: number;
  身材: string;
  信物: string;
  关系状态: '情人' | '了结';
  沦陷值: number;
}

export type Roster = Record<string, RosterEntry>;

/** 读取当前（最新楼层）的 MVU stat_data */
export function readStatData(): Record<string, any> {
  return _.get(getVariables(MESSAGE_OPTION), 'stat_data', {});
}

/**
 * 响应式地跟随最新楼层的 stat_data。
 * MVU 变量由 AI 侧或本界面写入，这里用轮询保持展示同步（与 defineMvuDataStore 同频）。
 */
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
 * 把当前目标收进名册。
 *
 * 名册**不进 MVU**：stat_data 会被「变量列表」条目整体注入提示词，名册越长每轮越贵；
 * 它只是给玩家翻看的记录，所以放聊天变量，想翻时打开面板即可。
 */
export function archiveCurrentTarget(statData: Record<string, any>): string | null {
  const name = String(_.get(statData, '当前目标.姓名', '') ?? '');
  const stage = String(_.get(statData, '当前目标.关系阶段', '陌生'));

  if (!name || !['得手', '情人'].includes(stage)) {
    return null;
  }

  const entry: RosterEntry = {
    身份: String(_.get(statData, '当前目标.身份', '') ?? ''),
    圈层: (_.get(statData, '当前目标.身份圈层', '') || inferLayer(String(_.get(statData, '当前目标.身份', '')))) as Pool,
    年龄: Number(_.get(statData, '当前目标.年龄', 0) ?? 0),
    身材: String(_.get(statData, '当前目标.身材', '') ?? ''),
    信物: String(_.get(statData, '当前目标.信物', '') ?? ''),
    关系状态: '情人',
    沦陷值: Number(_.get(statData, '当前目标.沦陷值', 0) ?? 0),
  };

  updateVariablesWith(variables => {
    _.set(variables, ROSTER_PATH, { ..._.get(variables, ROSTER_PATH, {}), [name]: entry });
    return variables;
  }, { type: 'chat' });

  return name;
}

/**
 * 从身份词反推圈层。
 * 生成器写入的「身份」是原型名（如「女镖师」「醉月楼花魁」），不含圈层字样，
 * 因此这里按关键词兜底；判断不出时归入「良家」（最保守，不误判同圈层撞破）。
 */
export function inferLayer(identity: string): Pool {
  if (/宫|尚仪|尚服|妃|婕妤|美人|才人|宝林|御女|充仪|女官|女医|乐伎/.test(identity)) return '宫中';
  if (/花魁|歌姬|舞姬|琵琶|教坊|清倌|楼/.test(identity)) return '青楼';
  if (/镖|武馆|江湖|绿林|女医/.test(identity)) return '江湖';
  if (/绸缎|盐商|米行|珠宝|漕运|东家|掌柜|外室|行商|铺/.test(identity)) return '富商';
  if (/之妻|之女|之妾|夫人|主母|官|府/.test(identity)) return '官宦';
  return '良家';
}

/** 已被占用的姓名：名册中的目标 + 固定角色 */
export function takenNames(statData: Record<string, any>, roster: Roster): Set<string> {
  const current = String(_.get(statData, '当前目标.姓名', '') ?? '');
  return new Set([...Object.keys(roster), ...(current ? [current] : []), ...RESERVED_NAMES]);
}

/**
 * 采用一位目标：写入信息卡，并清空攻略进度与伪装身份。
 *
 * 只动这三处路径，其余变量（危险度、宫线进度…）保持不变；
 * 沦陷值/信物/关系阶段归零，是因为「这个人」的攻略才刚开始。
 */
export function adoptTarget(target: DrawnTarget): void {
  updateVariablesWith(variables => {
    _.set(variables, 'stat_data.当前目标', {
      姓名: target.姓名,
      年龄: target.年龄,
      身份: target.身份,
      性格: target.性格,
      身材: target.身材,
      性癖: target.性癖,
      敏感点: target.敏感点,
      性经历: target.性经历,
      沦陷值: 0,
      信物: '',
      关系阶段: '陌生',
    });
    // 换了人，先前那套入户身份不再成立
    _.set(variables, 'stat_data.主角.当前伪装身份', '');
    return variables;
  }, MESSAGE_OPTION);
}

/** 宫线准入：宫线进度 >= 2 才可开启女帝线（把 攻略阶段 由「接触前」推进到「亲近期」） */
export function startEmpressLine(): void {
  updateVariablesWith(variables => {
    _.set(variables, 'stat_data.女帝.攻略阶段', '亲近期');
    return variables;
  }, MESSAGE_OPTION);
}

/** 把名册压成一行塞进输入框（不发送）：只在玩家主动需要时花一次 token */
export function handRosterToNarrator(roster: Roster): boolean {
  const names = Object.keys(roster);
  if (!names.length) {
    return false;
  }
  const text = names
    .map(name => {
      const entry = roster[name];
      const token = entry.信物 ? `信物:${entry.信物}` : '未赠信物';
      return `${name}(${entry.圈层}·${entry.关系状态}·${entry.沦陷值}·${token})`;
    })
    .join('，');
  const line = `（名册：${text}）`;

  const $input = $('#send_textarea');
  if (!$input.length) {
    return false;
  }
  $input.val(line).trigger('input');
  return true;
}

/**
 * 生成器自身的界面偏好与签筒状态。
 * 这些都不是剧情数据，不进 MVU，只存 localStorage。
 */
export const useUiStore = defineStore('目标生成器', () => {
  const expanded = useLocalStorage('窃玉偷香:生成器-展开', false);
  const pools = useLocalStorage<Pool[]>('窃玉偷香:生成器-身份池', [...POOLS]);
  const ageIndex = useLocalStorage('窃玉偷香:生成器-年龄段', 0);
  const rosterOpen = useLocalStorage('窃玉偷香:生成器-名册展开', false);
  const slip = ref<DrawnTarget | null>(null);

  const toggleExpanded = () => {
    expanded.value = !expanded.value;
  };

  return { expanded, pools, ageIndex, rosterOpen, slip, toggleExpanded };
});
