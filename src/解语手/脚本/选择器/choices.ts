/**
 * 对话选择器 · 解析与展示逻辑。
 *
 * 数据来源：AI 每轮按「选择器」条目的契约，在正文末尾输出若干 <ChoiceN> 块。
 * 这些块由正则「对AI隐藏选项块」从发给 AI 的上下文里剔除（避免它照着历史选项写），
 * 但 **楼层原文里仍在**，所以这里直接读楼层原文解析。
 *
 * 契约格式（三行一个选项）：
 *   <Choice1>
 *   问一句「那个项目是不是最近在赶节点」
 *   好感+6 性欲+0
 *   心理：他怎么会知道我们组在赶这个
 *   </Choice1>
 */

const CHOICE_BLOCK = /<Choice(\d+)>([\s\S]*?)<\/Choice\1>/gi;
const DELTA = /好感\s*([+-]\d+)\s*性欲\s*([+-]\d+)/;

export interface Choice {
  index: number;
  /** 选项本身：点选后落进输入栏的那句话 */
  text: string;
  /** 好感增减（预测值，由 AI 给） */
  affection: number;
  /** 性欲增减（预测值） */
  desire: number;
  /** 心理预告：她心里会冒出来的那一念 */
  mind: string;
}

/** 解析一段文本里的全部选项块，按出现顺序返回 */
export function parseChoices(message: string): Choice[] {
  if (!message || !message.includes('<Choice')) {
    return [];
  }

  const choices: Choice[] = [];
  for (const match of message.matchAll(CHOICE_BLOCK)) {
    const index = Number(match[1]);
    const body = match[2]
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    if (!body.length) {
      continue;
    }

    const text = body[0];
    let affection = 0;
    let desire = 0;
    let mind = '';

    for (const line of body.slice(1)) {
      const delta = line.match(DELTA);
      if (delta) {
        affection = Number(delta[1]);
        desire = Number(delta[2]);
        continue;
      }
      const mindLine = line.replace(/^心理[:：]\s*/, '');
      if (mindLine !== line) {
        mind = mindLine;
      }
    }

    choices.push({ index, text, affection, desire, mind });
  }

  return choices;
}

/** 取最新楼层里的选项；没有则返回空数组 */
export function readLatestChoices(): Choice[] {
  const latest = getChatMessages(-1)[0];
  if (!latest?.message) {
    return [];
  }
  return parseChoices(latest.message);
}

/** 增减的显示文案：0 显示 ±0，正数带 +，负数自带 − */
export function deltaText(value: number): string {
  if (!value) {
    return '±0';
  }
  return value > 0 ? `+${value}` : `${value}`;
}

/**
 * 把选项放进输入栏（不发送），玩家可以在后面补充自己想加的内容再发。
 * 返回是否找到了输入栏。
 */
export function putChoiceIntoInput(choice: Choice): boolean {
  const $input = $('#send_textarea');
  if (!$input.length) {
    return false;
  }
  $input.val(choice.text).trigger('input');
  return true;
}