import type { DrawnGuest } from './data';

/**
 * 把一支签拼成**一段可以直接发进输入栏的话**（玩家视角、第一人称）。
 *
 * 隐私边界（硬规）：
 *   ✅ 可以出现：姓名、年龄、职业、身份、婚配、来由、由头
 *   ❌ 不许出现：形貌细节、性癖、敏感点、性经历、心事
 *      ——这些是私密信息，玩家不该凭空知道；它们只写进 MVU 变量，供 AI 演绎。
 */

/** 拼出发给说书人的那一段话（不含任何私密字段） */
export function buildOpeningText(guest: DrawnGuest): string {
  const lines: string[] = [];

  lines.push(`［约到的客人 · ${guest.姓名}］`);
  lines.push('');

  if (guest.来路 === '熟人引荐' && guest.引荐人) {
    lines.push(`是${guest.引荐人}让她来的。她说：${guest.引荐人的话}`);
  } else {
    lines.push(`预约是她自己打来的：${guest.由头}。`);
  }

  lines.push('');
  lines.push(`我大概知道的情况：${guest.年龄}岁上下，${guest.职业}，${guest.身份}。`);
  if (guest.婚配) {
    lines.push(`婚配：${guest.婚配}。`);
  }

  lines.push('');
  lines.push('（先请她进来，问一句哪里不舒服，再谈别的。）');

  return lines.join('\n');
}

/** 名册里的一行：只给玩家翻看，不进提示词 */
export function rosterLine(entry: { 职业: string; 年龄?: number; 来路?: string; 引荐人?: string }): string {
  const from = entry.来路 === '熟人引荐' && entry.引荐人 ? `${entry.引荐人}介绍` : '自己来的';
  return entry.年龄 ? `${entry.职业}·${entry.年龄}岁·${from}` : `${entry.职业}·${from}`;
}