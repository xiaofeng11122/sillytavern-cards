/**
 * 对话选择器 · 解析与展示逻辑。
 *
 * 数据来源：AI 每轮按「选择器」条目的契约，在正文末尾输出若干 <ChoiceN> 块。
 * 这些块由正则「对AI隐藏选项块」**从楼层显示与提示词两边都剔除**，
 * 脚本读的是楼层原文（getChatMessages 拿到的 message 不被正则改写），所以仍能解析。
 *
 * 契约格式（两行一个选项）：
 *   <Choice1>
 *   问一句「那个项目是不是最近在赶节点」
 *   好感+6 性欲+0
 *   </Choice1>
 *
 * 兼容旧写法：块内若多出第三行（早期版本的心理预告），解析时忽略、不展示。
 */

const CHOICE_BLOCK = /<Choice(\d+)>([\s\S]*?)<\/Choice\1>/gi;
const DELTA = /好感\s*([+-]?\d+)\s*性欲\s*([+-]?\d+)/;

export interface Choice {
  index: number;
  /** 选项本身：点选后落进输入栏的那句话 */
  text: string;
  /** 好感增减（预测值，由 AI 给） */
  affection: number;
  /** 性欲增减（预测值） */
  desire: number;
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

    // 第一行是选项本身；增减行在其后任意一行（旧格式的第三行心理已弃用，忽略）
    const text = body[0];
    let affection = 0;
    let desire = 0;

    for (const line of body.slice(1)) {
      const delta = line.match(DELTA);
      if (delta) {
        affection = Number(delta[1]);
        desire = Number(delta[2]);
        break;
      }
    }

    choices.push({ index, text, affection, desire });
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