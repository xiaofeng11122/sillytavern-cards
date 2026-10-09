<template>
  <section class="board">
    <header class="head">
      <span class="who">
        {{ guest.姓名 }}
        <em v-if="guest.职业">· {{ guest.职业 }}</em>
        <em v-if="guest.年龄">· {{ guest.年龄 }}岁</em>
      </span>
      <span v-if="tags.length" class="tags">
        <i v-for="tag in tags" :key="tag">{{ tag }}</i>
      </span>
    </header>

    <FieldRow label="形貌" :value="guest.形貌 || '—'" />
    <FieldRow label="身体" :value="guest.身体状态 || '—'" tone="body" />
    <FieldRow label="心理" :value="mind" tone="kai" />

    <TierRow label="好感" :value="guest.好感度" :tier="affectionTier" tone="affection" />
    <TierRow label="性欲" :value="guest.性欲" :tier="desireTier" tone="desire" />

    <p v-if="shop" class="shop">{{ shop }}</p>
  </section>
</template>

<script setup lang="ts">
import type { SchemaGuest } from '../../../schema';
import FieldRow from './FieldRow.vue';
import TierRow from './TierRow.vue';

const props = defineProps<{ guest: SchemaGuest; shop: string }>();

/** 档位边界与「阶段指导」「变量更新规则」严格一致 */
const affectionTier = computed(() => {
  const value = props.guest.好感度;
  if (value >= 85) return '死心塌地';
  if (value >= 60) return '依恋';
  if (value >= 35) return '心动';
  if (value >= 15) return '留意';
  return '冷淡';
});

const desireTier = computed(() => {
  const value = props.guest.性欲;
  if (value >= 85) return '溃堤';
  if (value >= 60) return '难耐';
  if (value >= 35) return '起意';
  if (value >= 15) return '微热';
  return '无感';
});

/** 来路与知情：不给数值，只在她进门这件事上给个说法 */
const tags = computed(() => {
  const list: string[] = [];
  if (props.guest.来路 === '熟人引荐') {
    list.push(props.guest.引荐人 ? `${props.guest.引荐人}介绍` : '熟人介绍');
  }
  if (props.guest.知情) {
    list.push('知情');
  }
  if (props.guest.已得手) {
    list.push('已得手');
  }
  return list;
});

/** 她此刻的念头：变量为空（AI 还没写过）时给一个占位，别让这一行空着 */
const mind = computed(() => (props.guest.心理 ? `「${props.guest.心理}」` : '—'));
</script>

<style lang="scss" scoped>
.board {
  padding: 9px 12px 10px;
  display: flex;
  flex-direction: column;
}

.head {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 6px;
  margin-bottom: 5px;
  border-bottom: 1px solid var(--c-border);
}

.who {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--c-primary);
  overflow-wrap: anywhere;
}

.who em {
  font-style: normal;
  font-weight: 400;
  font-size: 11px;
  letter-spacing: 0;
  color: var(--c-text-muted);
}

.tags {
  flex: 0 0 auto;
  display: inline-flex;
  gap: 4px;
}

.tags i {
  font-style: normal;
  font-size: 10px;
  letter-spacing: 0.5px;
  color: var(--c-primary);
  border: 1px solid var(--c-primary-soft);
  border-radius: 2px;
  padding: 0 5px;
}

.shop {
  margin-top: 7px;
  padding-top: 6px;
  border-top: 1px dashed var(--c-border);
  font-size: 10.5px;
  color: var(--c-text-muted);
}
</style>