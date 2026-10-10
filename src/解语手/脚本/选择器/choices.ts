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

/** 已选选项之间的分隔：两个换行，玩家自己补的话接在后面就是独立一段 */
const JOINER = '\n\n';

const INPUT_SELECTOR = '#send_textarea';

/** 读当前输入栏内容；找不到输入栏时返回 null */
function readInput(): string | null {
  const $input = $(INPUT_SELECTOR);
  if (!$input.length) {
    return null;
  }
  return String($input.val() ?? '');
}

/**
 * 把「已选中的选项」同步进输入栏（不发送）。
 *
 * 做法：先看输入栏里已经包含哪些选项文本（用户在选项之间补写的话都保留），
 * 再把这批选项按面板顺序拼起来，未选中的从输入栏里剔掉。
 * 于是「点一条加入、再点一次移除」都能成立，而玩家自己补的文字不会被抹掉。
 */
export function syncChoicesToInput(choices: Choice[], selected: number[]): boolean {
  const current = readInput();
  if (current === null) {
    return false;
  }

  // 保留玩家补写的内容：输入栏里出现过、但本批选项都没匹配上的文字
  let extra = current;
  for (const choice of choices) {
    const index = extra.indexOf(choice.text);
    if (index >= 0) {
      extra = extra.slice(0, index) + extra.slice(index + choice.text.length);
    }
  }
  extra = extra.split(JOINER).join('\n').trim();

  const picked = choices.filter(choice => selected.includes(choice.index)).map(choice => choice.text);
  if (extra) {
    picked.push(extra);
  }

  $(INPUT_SELECTOR).val(picked.join(JOINER)).trigger('input');
  return true;
}

/** 输入栏里此刻是否没有任何内容（用于「清空」按钮的可用状态） */
export function inputIsEmpty(): boolean {
  const current = readInput();
  return current !== null && current.trim() === '';
}