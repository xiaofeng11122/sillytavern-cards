import type { DrawnTarget } from './data';

/**
 * 把一支签拼成**一段可以直接发进输入栏的话**（玩家视角、第一人称）。
 *
 * 隐私边界（用户明确要求，不可越界）：
 *   ✅ 可以出现：姓名、年龄、身份、住处、婚配、情报来源、混入身份、踩点，
 *      以及性格的**外面那一层**（坊间看得见的印象）
 *   ❌ 不许出现：内在性格、身材、性癖、敏感点、性经历
 *      ——这些是私密信息，玩家不该凭空知道；它们只写进 MVU 变量，供 AI 演绎。
 */

/** 性格字段是「外·…｜内·…」，只取外面那层 */
export function outerCharacter(target: DrawnTarget): string {
  const [outer] = target.性格.split('｜');
  return outer.replace(/^外·/, '').trim();
}

/** 混入身份去掉括号里的补充说明，短名留给 主角.当前伪装身份 用 */
export function coverTitle(target: DrawnTarget): string {
  return target.混入身份.split('（')[0].trim();
}

/** 拼出发给说书人的那一段话（不含任何私密字段） */
export function buildOpeningText(target: DrawnTarget): string {
  const lines: string[] = [];

  lines.push(`［择定目标 · ${target.姓名}］`);
  lines.push('');

  lines.push(`我是怎么听到她的：${target.情报来源}。`);

  const known: string[] = [`${target.住处}的${target.身份}`, `${target.年龄}岁上下`];
  if (target.婚配) {
    known.push(target.婚配);
  }
  lines.push(`我打听来的：${known.join('，')}。见过的人都说她${outerCharacter(target)}。别的都是传闻，做不得准。`);

  lines.push('');
  lines.push(`我打算怎么靠近她：${target.混入身份}。`);
  lines.push(`踩过的点：${target.踩点}。`);

  lines.push('');
  lines.push('（先去把身份站稳，摸清她的出入与住处，再谈别的。）');

  return lines.join('\n');
}
