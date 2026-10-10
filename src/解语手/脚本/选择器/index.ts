/**
 * 对话选择器 · 酒馆助手脚本（不出界面，只接线 + 动态渲染选项）
 *
 * 数据流：
 *   AI 输出 <Choice1>…</Choice1> …  →  正则「选项面板」只把这一整段换成一个**面板外壳**，
 *   并把 AI 的原始选项文本塞进外壳里的 `<template data-jy-source>`（`$2` 反向引用）
 *   → 本脚本读那个 template、解析出这一轮真正的选项与增减，**动态建按钮**渲染出来。
 *
 * 为什么必须这样：正则替换是**静态**的。若把选项写死在 replaceString 里，
 * 每层楼都会渲染出同样的几条示例文字，AI 本轮真正的选项会被整段丢掉。
 * 外壳（结构＋样式）是静态的，数据（选项文本＋增减）必须从 AI 输出里带进来。
 *
 * 面板出现的位置就是它该在的位置：楼层正文的结尾。
 *
 * 两条正则的分工（配错会互相打架，见 tools/diagnose-choice-panel.mjs）：
 *   对AI隐藏选项块 → 只清提示词通道（promptOnly），把 <ChoiceN> 从发给 AI 的上下文剔除
 *   选项面板       → 只动显示通道（markdownOnly），把 <ChoiceN> 整段换成面板外壳
 */

/** 已选选项之间与输入栏对齐的分隔：两个换行 */
const JOINER = '\n\n';
const INPUT_SELECTOR = '#send_textarea';
const PANEL_SELECTOR = '.jy-panel';

/** 包装形式：<Choice1> 或 【选项1】，两种都认 */
type TagStyle = { open: RegExp; closeTag: (index: number) => string };

const TAG_STYLES: TagStyle[] = [
  { open: /<Choice(\d+)>/gi, closeTag: index => `</Choice${index}>` },
  { open: /【选项(\d+)】/g, closeTag: index => `【选项${index}结束】` },
];

interface RawChoice {
  index: number;
  /** 选项本身：玩家点它就会落进输入栏 */
  text: string;
  affection: number;
  desire: number;
}

const DELTA = /好感\s*([+-]?\d+)[\s，,、/]*性欲\s*([+-]?\d+)/;

/**
 * 把 AI 的一段选项原文解析成若干选项。
 *
 * 单个块内的行序（契约规定两行，但模型偶有波动，这里取宽容策略）：
 *   含「好感…性欲…」的行 → 增减
 *   其余第一行            → 选项本身
 */
function parseChoices(raw: string): RawChoice[] {
  const normalized = raw.replace(/\r\n?/g, '\n').trim();
  if (!normalized) {
    return [];
  }

  for (const style of TAG_STYLES) {
    const marks = [...normalized.matchAll(new RegExp(style.open.source, 'gi'))];
    if (!marks.length) {
      continue;
    }

    const choices: RawChoice[] = [];
    for (let i = 0; i < marks.length; i++) {
      const start = marks[i].index + marks[i][0].length;
      const nextOpen = marks[i + 1]?.index ?? normalized.length;
      const closeAt = normalized.indexOf(style.closeTag(Number(marks[i][1])), start);
      const end = closeAt >= 0 ? closeAt : nextOpen;
      const body = normalized
        .slice(start, end)
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

      if (!body.length) {
        continue;
      }
      let affection = 0;
      let desire = 0;
      let text = '';
      for (const line of body) {
        const delta = line.match(DELTA);
        if (delta) {
          affection = Number(delta[1]);
          desire = Number(delta[2]);
        } else if (!text && !/^心理[:：]/.test(line)) {
          text = line;
        }
      }
      if (text) {
        choices.push({ index: Number(marks[i][1]) || i + 1, text, affection, desire });
      }
    }

    if (choices.length) {
      return choices;
    }
  }

  return [];
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

/** 面板属于哪一楼：优先用它自己的 data-mesid，兜底用最近的 .mes */
function mesIdOf(panel: HTMLElement): number | null {
  const own = panel.dataset.mesid;
  if (own !== undefined && own !== '') {
    const id = Number(own);
    if (Number.isFinite(id)) {
      return id;
    }
  }
  const fromDom = $(panel).closest('.mes').attr('mesid');
  return fromDom === undefined ? null : Number(fromDom);
}

/**
 * 取该楼「原文」里的选项，用来补增减。
 *
 * 楼层原文不受酒馆正则影响（正则只改发给 AI 的提示词与网页显示），
 * 所以 <ChoiceN> 块在原文里仍然完整。
 */
function rawChoicesOf(panel: HTMLElement): RawChoice[] {
  const mesId = mesIdOf(panel);
  if (mesId === null) {
    return [];
  }
  return parseChoices(getChatMessages(mesId)[0]?.message ?? '');
}

/** 面板外壳里内嵌的 AI 原文（正则 $1 带进来的） */
function embeddedRaw(panel: HTMLElement): string {
  // 用 <script type="text/plain"> 承载原文，而不是 <template>：
  // template 的内容不在 DOM 里（浏览器把它放进独立的 DocumentFragment），
  // jQuery 的 .text() 读不出来，会导致面板永远渲染不出选项。
  return $(panel).find('script[data-jy-source]').text() ?? '';
}

/** 建一条选项按钮 */
function buildChoice(choice: RawChoice): JQuery<HTMLElement> {
  const $button = $('<button>').attr({ type: 'button', class: 'jy-choice', 'data-picked': '0' });
  $button.append($('<span>').addClass('jy-choice-order'));
  $button.append($('<span>').addClass('jy-choice-text').text(choice.text));

  const $meta = $('<span>').addClass('jy-choice-meta');
  $meta.append($('<span>').addClass('jy-aff').text(`好感 ${deltaText(choice.affection)}`));
  $meta.append($('<span>').addClass('jy-des').text(`性欲 ${deltaText(choice.desire)}`));
  $button.append($meta);

  return $button;
}

/** 把一层楼的面板渲染出来（只做一次） */
function renderPanel(panel: HTMLElement): void {
  const $list = $(panel).find('[data-jy-list]');
  if (!$list.length) {
    return;
  }

  // 选项文本取自外壳内嵌的 AI 原文（保证与正则替换进来的内容一致）；
  // 增减优先用「该楼原文」的值，读不到就退用内嵌原文解析出的值。
  const embedded = parseChoices(embeddedRaw(panel));
  const fromMessage = rawChoicesOf(panel);

  const choices: RawChoice[] = embedded.map((item, index) => {
    const matched =
      fromMessage.find(candidate => candidate.text === item.text) ??
      // 文本被楼层显示改动过时，退化为按顺序配对
      (fromMessage.length === embedded.length ? fromMessage[index] : undefined);
    return matched ? { ...item, affection: matched.affection, desire: matched.desire } : item;
  });

  $list.empty();
  if (!choices.length) {
    $list.append($('<div>').addClass('jy-panel-empty').text('这一轮没有给出选项。编辑或重 roll 这一楼会重新套用面板。'));
    return;
  }

  for (const choice of choices) {
    const $button = buildChoice(choice);
    $button.attr('data-text', choice.text);
    $list.append($button);
  }
}

/** 扫描页面上尚未渲染的面板 */
function renderAllPanels(): void {
  for (const panel of document.querySelectorAll<HTMLElement>(PANEL_SELECTOR)) {
    const $list = $(panel).find('[data-jy-list]');
    if (!$list.children().length) {
      renderPanel(panel);
    }
  }
  refreshAllPanels();
}

/** 按输入栏内容刷新整页面板的选中状态、顺序号与「清空」按钮显隐 */
function refreshAllPanels(): void {
  const blocks = readInputBlocks();
  for (const panel of document.querySelectorAll<HTMLElement>(PANEL_SELECTOR)) {
    let pickedCount = 0;
    for (const button of panel.querySelectorAll<HTMLElement>('.jy-choice')) {
      const text = button.dataset.text ?? '';
      const order = blocks.indexOf(text);
      const picked = order >= 0;
      button.dataset.picked = picked ? '1' : '0';
      const $order = $(button).find('.jy-choice-order');
      $order.text(picked ? String(order + 1) : '');
      if (picked) {
        pickedCount++;
      }
    }
    $(panel).find('[data-jy-clear]').prop('hidden', pickedCount === 0);
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

/** 用事件委托接管点击：面板随时可能新增或重渲染，不必逐个绑定 */
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

/** 楼层渲染/更新/编辑后补一次扫描；配 MutationObserver 兜住节流渲染 */
function watchMessages(): void {
  const refresh = () => renderAllPanels();
  eventOn(tavern_events.CHARACTER_MESSAGE_RENDERED, refresh);
  eventOn(tavern_events.MESSAGE_UPDATED, refresh);
  eventOn(tavern_events.MESSAGE_EDITED, refresh);
  eventOn(tavern_events.CHAT_CHANGED, refresh);
}

$(() => {
  // 幂等：脚本热重载时不要叠出多份监听与多个 observer
  const flag = '__jieyushou_selector_ready__';
  if ((window as unknown as Record<string, boolean>)[flag]) {
    renderAllPanels();
    return;
  }
  (window as unknown as Record<string, boolean>)[flag] = true;

  delegateEvents();
  renderAllPanels();

  // 只在结构变化时扫一遍，不做轮询
  new MutationObserver(() => renderAllPanels()).observe(document.body, { childList: true, subtree: true });
  watchMessages();

  console.info('[解语手] 对话选择器已就绪：面板由「选项面板」正则渲染外壳，本脚本填入 AI 本轮的选项与增减');
});