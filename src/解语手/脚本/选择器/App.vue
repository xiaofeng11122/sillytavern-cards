<template>
  <div v-if="choices.length" class="jx-inner">
    <header class="jx-bar">
      <span class="jx-title">这一步怎么做</span>
      <span class="jx-hint">点一条落进输入栏，可以在后面补你想加的话</span>
    </header>

    <div class="jx-list">
      <button v-for="choice in choices" :key="choice.index" type="button" class="jx-choice" @click="pick(choice)">
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
import { deltaText, putChoiceIntoInput, readLatestChoices, type Choice } from './choices';

const choices = ref<Choice[]>([]);

const reload = () => {
  choices.value = readLatestChoices();
};

// 楼层可能在 streaming 结束后、重 roll、编辑时变化，轮询保持跟随（与状态栏同频）
useIntervalFn(reload, 2000);
reload();

const pick = (choice: Choice) => {
  if (putChoiceIntoInput(choice)) {
    toastr.info('已放进输入栏，补完再发', '对话选择器', { timeOut: 1500 });
    return;
  }
  toastr.warning('没找到输入栏，手动把这条抄进去吧', '对话选择器');
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
  font-size: 10.5px;
  color: var(--j-text-muted);
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
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 6px 9px;
  border: 1px solid var(--j-border);
  border-radius: 2px;
  background: var(--j-surface-raised);
  cursor: pointer;
  transition:
    border-color 160ms var(--j-ease),
    transform 120ms var(--j-ease);
}

.jx-choice:hover {
  border-color: var(--j-primary);
}

.jx-choice:active {
  transform: translateY(1px);
}

.jx-text {
  font-size: 12.5px;
  color: var(--j-text);
  overflow-wrap: anywhere;
}

.jx-meta {
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