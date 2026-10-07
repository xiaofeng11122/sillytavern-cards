<template>
  <section class="board">
    <header class="head">
      <span class="fallen">
        <b>{{ Math.round(target.沦陷值) }}%</b>
        <i>{{ tier }}</i>
      </span>
      <span class="who">
        {{ target.姓名 }}
        <em v-if="target.身份">· {{ target.身份 }}</em>
        <em v-if="target.身材">· {{ target.身材 }}</em>
        <em v-if="target.年龄">· {{ target.年龄 }}岁</em>
      </span>
      <span class="palace">宫线 {{ Math.min(palace, 2) }}/2</span>
    </header>

    <FieldRow label="心理" :value="mind" kai />
    <FieldRow label="性格" :value="characterParts" />
    <FieldRow label="敏感" :value="target.敏感点 || '—'" accent />
    <FieldRow label="性癖" :value="target.性癖 || '—'" accent />
  </section>
</template>

<script setup lang="ts">
import type { SchemaTarget } from '../../../schema';
import FieldRow from './FieldRow.vue';

const props = defineProps<{ target: SchemaTarget; palace: number }>();

/** 档位边界与「阶段指导」「变量更新规则」严格一致 */
const tier = computed(() => {
  const value = props.target.沦陷值;
  if (value >= 85) return '死心塌地';
  if (value >= 60) return '依恋';
  if (value >= 35) return '心动';
  if (value >= 15) return '留意';
  return '冷淡';
});

/** 性格写成「外·…｜内·…」，拆成两行读着清楚 */
const characterParts = computed(() => (props.target.性格 || '—').split('｜'));

/** 她此刻的念头：变量为空（AI 还没写过）时给一个占位，别让这一行空着 */
const mind = computed(() => (props.target.心理 ? `「${props.target.心理}」` : '—'));
</script>

<style lang="scss" scoped>
.board {
  padding: 8px 10px 9px;
  display: flex;
  flex-direction: column;
}

.head {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 5px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--c-border);
}

.fallen {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}

.fallen b {
  font-family: var(--font-accent);
  font-size: 19px;
  line-height: 1.2;
  color: var(--c-accent);
  font-variant-numeric: tabular-nums;
}

.fallen i {
  font-style: normal;
  font-size: 10.5px;
  letter-spacing: 1px;
  color: var(--c-accent);
}

.who {
  flex: 1 1 auto;
  min-width: 0;
  font-family: var(--font-accent);
  font-size: 14px;
  letter-spacing: 2px;
  color: var(--c-primary);
  overflow-wrap: anywhere;
}

.who em {
  font-family: var(--font-body);
  font-style: normal;
  font-size: 11px;
  letter-spacing: 0;
  color: var(--c-text-muted);
}

.palace {
  flex: 0 0 auto;
  font-size: 10px;
  color: var(--c-secondary);
  font-variant-numeric: tabular-nums;
}
</style>
