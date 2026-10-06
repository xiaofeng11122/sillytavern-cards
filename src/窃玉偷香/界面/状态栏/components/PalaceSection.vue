<template>
  <section class="palace">
    <h3 class="head">宫线</h3>

    <div class="row">
      <span class="row-label">进度</span>
      <MeterBar :value="palace" :max="2" tone="secondary" show-max />
      <span class="row-note">{{ palace >= 2 ? '宫门已开' : '尚缺内应' }}</span>
    </div>

    <div class="empress">
      <div class="empress-name">
        <span class="label">今上</span>
        <span class="value">景和帝</span>
      </div>
      <p v-if="!empress.真相已揭示" class="public">
        临朝三年，少年天子，雷霆手段。宫中上下只知其威严。
      </p>
      <template v-else>
        <p class="truth">
          真身：女子 · 闺名 <span class="gift">贺晚晴</span>（仅心腹知晓）
        </p>
        <p class="public">
          朝堂上是少年天子的算计，私下里是要人真正认得「她」的疲惫。
        </p>
      </template>
    </div>

    <ol class="ladder">
      <li
        v-for="(stage, index) in stages"
        :key="stage"
        :class="{ 'is-done': index <= stageIndex, 'is-now': index === stageIndex }"
      >
        {{ stage }}
      </li>
    </ol>
  </section>
</template>

<script setup lang="ts">
import type { SchemaEmpress } from '../../../schema';
import MeterBar from './MeterBar.vue';

const props = defineProps<{ palace: number; empress: SchemaEmpress }>();

const stages = ['接触前', '亲近期', '沦陷期'] as const;

const stageIndex = computed(() => {
  const index = stages.indexOf(props.empress.攻略阶段 as (typeof stages)[number]);
  return index < 0 ? 0 : index;
});
</script>

<style lang="scss" scoped>
.palace {
  padding: 10px;
  border-top: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.head {
  font-size: 12px;
  font-weight: normal;
  letter-spacing: 2px;
  color: var(--c-secondary);
  border-bottom: 1px solid var(--c-border);
  padding-bottom: 4px;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.row-label {
  color: var(--c-text-muted);
  letter-spacing: 1px;
}

.row-note {
  font-size: 10px;
  color: var(--c-text-muted);
  white-space: nowrap;
}

.empress {
  background: var(--c-surface-raised);
  border: 1px solid var(--c-border);
  padding: 7px 9px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.empress-name {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.label {
  font-size: 10px;
  color: var(--c-text-muted);
  letter-spacing: 1px;
}

.value {
  font-family: var(--font-accent);
  font-size: 14px;
  letter-spacing: 3px;
  color: var(--c-primary);
}

.public,
.truth {
  font-size: 11px;
  line-height: 1.5;
  color: var(--c-text-muted);
}

.truth {
  color: var(--c-seal);
}

.gift {
  font-family: var(--font-accent);
  letter-spacing: 2px;
}

.ladder {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  list-style: none;
}

.ladder li {
  text-align: center;
  font-size: 10.5px;
  padding: 2px 0;
  color: var(--c-text-muted);
  border-top: 2px solid var(--c-border);
  transition: all 260ms var(--ease-gentle);
}

.ladder li.is-done {
  color: var(--c-secondary);
  border-top-color: var(--c-secondary);
}

.ladder li.is-now {
  font-weight: bold;
}
</style>
