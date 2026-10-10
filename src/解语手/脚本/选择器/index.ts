/**
 * 对话选择器 · 酒馆助手脚本（不出界面，只接线）
 *
 * 面板**不在这个脚本里渲染**：AI 输出的 <ChoiceN> 块由正则「选项面板」就地替换成
 * 面板 HTML（`正则/选项面板.html`），所以选项出现在它本来就该在的位置——**楼层正文的结尾**。
 *
 * 这个脚本只做三件事：
 *   1. 给面板上的每条选项补上「好感 ± / 性欲 ±」（从该楼层原文的 <ChoiceN> 块里读出来）
 *   2. 接管点击：可点多条，按顺序排进输入栏；再点一次取消
 *   3. 面板的视觉状态（是否选中、顺序号）由输入栏内容反推，所以重开页面也不会错
 *
 * 两条正则的分工（配错会互相打架，见 tools/diagnose-choice-panel.mjs）：
 *   对AI隐藏选项块 → 只清提示词通道（promptOnly），把 <ChoiceN> 从发给 AI 的上下文剔除
 *   选项面板       → 只动显示通道（markdownOnly），把 <ChoiceN> 换成面板
 * 若隐藏正则也开了 markdownOnly，它会先跑并把 <ChoiceN> 擦成空，面板就拿不到输入、不再渲染。
 *
 * 为什么不做成输入栏上方的独立面板：那样选项会跑到输入栏一带、与楼层正文分家；
 * 而且输入栏是常有重绘的区域，面板跟着抖。
 */

interface PanelChoice {
  button: HTMLElement;
  text: string;
  affection: number;
  desire: number;
}

/** 已选选项之间与输入栏对齐的分隔：两个换行 */
const JOINER = '\n\n';
const INPUT_SELECTOR = '#send_textarea';
const PANEL_SELECTOR = '.jy-panel';
const CHOICE_BLOCK = /<Choice(\d+)>([\s\S]*?)<\/Choice\1>/gi;
const DELTA = /好感\s*([+-]?\d+)\s*性欲\s*([+-]?\d+)/;

/** 楼层原文里的 <ChoiceN> 块 → 每个选项的增减（按出现顺序） */
function readDeltasFromRaw(message: string): { text: string; affection: number; desire: number }[] {
  const out: { text: string; affection: number; desire: number }[] = [];
  for (const match of message.matchAll(CHOICE_BLOCK)) {
    const body = match[2]
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
    if (!body.length) {
      continue;
    }
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
    out.push({ text: body[0], affection, desire });
  }
  return out;
}

const deltaText = (value: number) => (!value ? '±0' : value > 0 ? `+${value}` : `${value}`);

/** 取输入栏当前的段落（每条选项和玩家自己补的话都是独立一段） */
function readInputBlocks(): string[] {
  const value = String($(INPUT_SELECTOR).val() ?? '');
  if (!value.trim()) {
    return [];
  }
  return value
    .split(JOINER)
    .map(block => block.trim())
    .filter(Boolean);
}

function writeInputBlocks(blocks: string[]): boolean {
  const $input = $(INPUT_SELECTOR);
  if (!$input.length) {
    return false;
  }
  $input.val(blocks.join(JOINER)).trigger('input');
  return true;
}

/** 收集面板上的选项，并把增减补进去 */
function collectChoices(panel: HTMLElement, rawMessage: string): PanelChoice[] {
  const buttons = [...panel.querySelectorAll<HTMLElement>('.jy-choice')];
  const deltas = readDeltasFromRaw(rawMessage);

  return buttons.map((button, index) => {
    const text = button.dataset.text ?? button.querySelector('.jy-choice-text')?.textContent?.trim() ?? '';
    const fromRaw = deltas.find(item => item.text === text) ?? deltas[index];
    const affection = fromRaw?.affection ?? 0;
    const desire = fromRaw?.desire ?? 0;

    const meta = button.querySelector('.jy-choice-meta');
    if (meta && !meta.textContent?.trim()) {
      meta.innerHTML =
        `<span class="jy-aff">好感 ${deltaText(affection)}</span>` +
        `<span class="jy-des">性欲 ${deltaText(desire)}</span>`;
    }

    return { button, text, affection, desire };
  });
}

/** 按输入栏内容刷新整页面板的选中状态与顺序号 */
function refreshAllPanels(): void {
  const blocks = readInputBlocks();
  for (const panel of document.querySelectorAll<HTMLElement>(PANEL_SELECTOR)) {
    let pickedCount = 0;
    for (const button of panel.querySelectorAll<HTMLElement>('.jy-choice')) {
      const text = button.dataset.text ?? '';
      const order = blocks.indexOf(text);
      const picked = order >= 0;
      button.dataset.picked = picked ? '1' : '0';
      const orderLabel = button.querySelector('.jy-choice-order');
      if (orderLabel) {
        orderLabel.textContent = picked ? String(order + 1) : '';
      }
      if (picked) {
        pickedCount++;
      }
    }
    panel.dataset.picked = pickedCount ? '1' : '0';
  }
}

/** 点一条：未选就按顺序加进输入栏，已选就移除 */
function toggle(button: HTMLElement): void {
  const text = button.dataset.text ?? '';
  if (!text) {
    return;
  }
  const blocks = readInputBlocks();
  const next = blocks.includes(text) ? blocks.filter(block => block !== text) : [...blocks, text];
  if (!writeInputBlocks(next)) {
    toastr.warning('没找到输入栏，手动把这条抄进去吧', '对话选择器');
    return;
  }
  refreshAllPanels();
}

function clearPanel(panel: HTMLElement): void {
  const texts = [...panel.querySelectorAll<HTMLElement>('.jy-choice')].map(button => button.dataset.text ?? '');
  const next = readInputBlocks().filter(block => !texts.includes(block));
  if (!writeInputBlocks(next)) {
    toastr.warning('没找到输入栏', '对话选择器');
    return;
  }
  refreshAllPanels();
}

/** 面板属于哪一楼：用它去读该楼的原文（正则只改显示，原文里 <ChoiceN> 还在） */
function rawMessageOf(panel: HTMLElement): string {
  const mesId = $(panel).closest('.mes').attr('mesid');
  if (mesId === undefined) {
    return '';
  }
  return getChatMessages(Number(mesId))[0]?.message ?? '';
}

/** 扫描页面上所有尚未接线的面板 */
function wirePanels(): void {
  for (const panel of document.querySelectorAll<HTMLElement>(PANEL_SELECTOR)) {
    if (panel.dataset.wired === '1') {
      continue;
    }
    panel.dataset.wired = '1';
    collectChoices(panel, rawMessageOf(panel));
  }
  refreshAllPanels();
}

/**
 * 用事件委托接管点击：面板是楼层里渲染出来的，随时可能新增或被重新渲染，
 * 委托挂在 document 上就不必逐个重新绑定。
 */
function delegateEvents(): void {
  $(document)
    .off('click.jieyushou-choice')
    .on('click.jieyushou-choice', '.jy-panel .jy-choice', function () {
      toggle(this as HTMLElement);
    })
    .on('click.jieyushou-choice', '.jy-panel [data-jy-clear]', function () {
      const panel = $(this).closest(PANEL_SELECTOR)[0];
      if (panel) {
        clearPanel(panel as HTMLElement);
      }
    })
    // 玩家自己改了输入栏，顺序号也要跟着变
    .on('input.jieyushou-choice', INPUT_SELECTOR, () => {
      refreshAllPanels();
    });
}

$(() => {
  // 幂等：脚本热重载时不要叠出多份监听与多个 observer
  const flag = '__jieyushou_selector_ready__';
  if ((window as unknown as Record<string, boolean>)[flag]) {
    wirePanels();
    return;
  }
  (window as unknown as Record<string, boolean>)[flag] = true;

  delegateEvents();
  wirePanels();

  // 楼层渲染、切换聊天、重 roll 都会改 DOM；这里只在结构变化时扫一遍，不做轮询
  const observer = new MutationObserver(() => wirePanels());
  observer.observe(document.body, { childList: true, subtree: true });

  console.info('[解语手] 对话选择器已接线（面板由楼层内的「选项面板」正则渲染）');
});