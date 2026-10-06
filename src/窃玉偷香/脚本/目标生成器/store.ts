import { defineStore } from 'pinia';
import { POOLS, type DrawnTarget, type Pool } from './data';

/** 脚本 iframe 不在消息楼层的变量作用域链上，必须显式指定楼层（详见 tavern-helper-runtime.md） */
const MESSAGE_OPTION = { type: 'message', message_id: 'latest' } as const;

/** 固定角色，生成器必须避开这些姓名 */
const RESERVED_NAMES = ['文疏影', '萧月蘅', '贺晚晴'];

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

/** 已被占用的姓名：名册中的目标 + 固定角色 */
export function takenNames(statData: Record<string, any>): Set<string> {
  const annex = _.get(statData, '已攻略目标', {}) as Record<string, unknown>;
  return new Set([...Object.keys(annex), ...RESERVED_NAMES]);
}

/**
 * 采用一位目标：写入信息卡，并清空攻略进度与伪装身份。
 *
 * 只动这三处路径，其余变量（危险度、宫线进度、已攻略目标…）保持不变；
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

/**
 * 生成器自身的界面偏好与签筒状态。
 * 这些都不是剧情数据，不进 MVU，只存 localStorage。
 */
export const useUiStore = defineStore('目标生成器', () => {
  const expanded = useLocalStorage('窃玉偷香:生成器-展开', false);
  const pools = useLocalStorage<Pool[]>('窃玉偷香:生成器-身份池', [...POOLS]);
  const ageIndex = useLocalStorage('窃玉偷香:生成器-年龄段', 0);
  const slip = ref<DrawnTarget | null>(null);

  const toggleExpanded = () => {
    expanded.value = !expanded.value;
  };

  return { expanded, pools, ageIndex, slip, toggleExpanded };
});
