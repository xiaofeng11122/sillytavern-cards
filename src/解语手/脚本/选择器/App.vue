<template>
  <div v-if="choices.length" class="jx-inner">
    <header class="jx-bar">
      <span class="jx-title">这一步怎么做</span>
      <span class="jx-hint">可以点多条，按顺序排进输入栏；再点一次取消</span>
      <button v-if="selected.length" type="button" class="jx-clear" @click="clear">清空</button>
    </header>

    <div class="jx-list">
      <button
        v-for="choice in choices"
        :key="choice.index"
        type="button"
        class="jx-choice"
        :class="{ 'is-picked': selected.includes(choice.index) }"
        @click="toggle(choice)"
      >
        <span class="jx-order" aria-hidden="true">{{ selected.includes(choice.index) ? selected.indexOf(choice.index) + 1 : '' }}</span>
        <span class="jx-text">{{ choice.text }}</span>
        <span class="jx-meta">
          <em class="jx-aff">好感 {{ deltaText(choice.affection) }}</em>
          <em class="jx-des">性欲 {{ deltaText(choice.desire) }}</em>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { deltaText, readLatestChoices, syncChoicesToInput, type Choice } from './choices';

const choices = ref<Choice[]>([]);
/** 已选中的选项编号，按点击顺序排列 */
const selected = ref<number[]>([]);

const reload = () => {
  const next = readLatestChoices();
  // 楼层换了一轮就把选择清掉：那些编号已经属于上一轮的选项了
  if (next.map(item => item.text).join('|') !== choices.value.map(item => item.text).join('|')) {
    selected.value = [];
  }
  choices.value = next;
};

// 楼层可能在 streaming 结束后、重 roll、编辑时变化，轮询保持跟随（与状态栏同频）
useIntervalFn(reload, 2000);
reload();

/** 点一条：未选就加入（排在末尾），已选就移除；输入栏按当前选择重排 */
const toggle = (choice: Choice) => {
  const next = selected.value.includes(choice.index)
    ? selected.value.filter(index => index !== choice.index)
    : [...selected.value, choice.index];
  selected.value = next;

  if (!syncChoicesToInput(choices.value, next)) {
    toastr.warning('没找到输入栏，手动把这条抄进去吧', '对话选择器');
  }
};

const clear = () => {
  selected.value = [];
  syncChoicesToInput(choices.value, []);
};
</script>

<style>
#jy-selector-dock {
  --j-surface: #f4f6f5;
  --j-surface-raised: #ffffff;
  --j-primary: #35606a;
  --j-primary-soft: #8fadb3;
  --j-affection: #b0645f;
  --j-desire: #b8823c;
  --j-text: #23302f;
  --j-text-muted: #7c8a88;
  --j-border: #d5dddb;
  --j-font: 'PingFang SC', 'Hiragino Sans GB', 'Source Han Sans SC', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif;
  --j-ease: cubic-bezier(0.33, 0.9, 0.35, 1);

  width: 100%;
  max-width: 780px;
  margin: 0 auto 4px;
  font-family: var(--j-font);
  font-size: 12px;
  line-height: 1.5;
  color: var(--j-text);
  text-align: left;
}

#jy-selector-dock *,
#jy-selector-dock *::before,
#jy-selector-dock *::after {
  box-sizing: border-box;
}
</style>

<style lang="scss" scoped>
.jx-inner {
  border: 1px solid var(--j-border);
  border-radius: 3px;
  background: var(--j-surface);
  overflow: hidden;
}

.jx-bar {
  display: flex;
  align-items: baseline;
  gap: 9px;
  padding: 5px 10px;
  border-bottom: 1px solid var(--j-border);
}

.jx-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--j-primary);
}

.jx-hint {
  flex: 1;
  min-width: 0;
  font-size: 10.5px;
  color: var(--j-text-muted);
}

.jx-clear {
  flex: 0 0 auto;
  font-family: inherit;
  font-size: 10.5px;
  padding: 1px 8px;
  border: 1px solid var(--j-border);
  border-radius: 2px;
  background: transparent;
  color: var(--j-text-muted);
  cursor: pointer;
}

.jx-clear:hover {
  border-color: var(--j-primary);
  color: var(--j-primary);
}

.jx-list {
  padding: 7px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.jx-choice {
  font-family: inherit;
  text-align: left;
  display: grid;
  grid-template-columns: 1.2em 1fr;
  grid-template-areas:
    'order text'
    'order meta';
  align-items: center;
  column-gap: 6px;
  row-gap: 3px;
  padding: 6px 9px;
  border: 1px solid var(--j-border);
  border-radius: 2px;
  background: var(--j-surface-raised);
  cursor: pointer;
  transition:
    border-color 160ms var(--j-ease),
    background 160ms var(--j-ease),
    transform 120ms var(--j-ease);
}

.jx-choice:hover {
  border-color: var(--j-primary);
}

.jx-choice:active {
  transform: translateY(1px);
}

/* 已选：左边显示它在输入栏里的顺序号，整条换个底色 */
.jx-choice.is-picked {
  border-color: var(--j-primary);
  background: rgba(53, 96, 106, 0.08);
}

.jx-order {
  grid-area: order;
  width: 1.2em;
  height: 1.2em;
  line-height: 1.2em;
  text-align: center;
  font-size: 10px;
  color: var(--j-surface-raised);
  background: var(--j-primary);
  border-radius: 50%;
}

.jx-choice:not(.is-picked) .jx-order {
  background: transparent;
}

.jx-text {
  grid-area: text;
  font-size: 12.5px;
  color: var(--j-text);
  overflow-wrap: anywhere;
}

.jx-meta {
  grid-area: meta;
  display: flex;
  gap: 10px;
}

.jx-meta em {
  font-style: normal;
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
}

.jx-aff {
  color: var(--j-affection);
}

.jx-des {
  color: var(--j-desire);
}

@media (max-width: 560px) {
  .jx-hint {
    display: none;
  }
}
</style>