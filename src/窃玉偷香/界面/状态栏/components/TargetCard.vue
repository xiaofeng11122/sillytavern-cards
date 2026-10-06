<template>
  <section class="card">
    <header class="card-head">
      <span class="name">{{ target.姓名 }}</span>
      <span class="age">{{ target.年龄 }} 岁</span>
      <span class="identity">{{ target.身份 }}</span>
    </header>

    <div class="row">
      <span class="row-label">沦陷</span>
      <MeterBar
        :value="target.沦陷值"
        :tone="target.沦陷值 >= 60 ? 'accent' : 'primary'"
      />
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

    <div class="row token">
      <span class="row-label">信物</span>
      <span class="row-text">{{ target.信物 || '未赠' }}</span>
      <span v-if="target.信物" class="token-hint">暗记已随物出手</span>
    </div>

    <dl class="detail">
      <div>
        <dt>性格</dt>
        <dd>{{ target.性格 || '—' }}</dd>
      </div>
      <div>
        <dt>身材</dt>
        <dd>{{ target.身材 || '—' }}</dd>
      </div>
      <div>
        <dt>性癖</dt>
        <dd>{{ target.性癖 || '—' }}</dd>
      </div>
      <div>
        <dt>敏感点</dt>
        <dd>{{ target.敏感点 || '—' }}</dd>
      </div>
      <div class="wide">
        <dt>性经历</dt>
        <dd>{{ target.性经历 || '—' }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import type { SchemaTarget } from '../../../schema';
import MeterBar from './MeterBar.vue';

const props = defineProps<{ target: SchemaTarget }>();

const stages = ['陌生', '相识', '熟络', '暧昧', '沦陷', '得手', '情人'] as const;

const stageIndex = computed(() => {
  const index = stages.indexOf(props.target.关系阶段 as (typeof stages)[number]);
  return index < 0 ? 0 : index;
});
</script>

<style lang="scss" scoped>
.card {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-head {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
}

.name {
  font-family: var(--font-accent);
  font-size: 17px;
  letter-spacing: 3px;
  color: var(--c-primary);
}

.age {
  font-size: 11px;
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
}

.identity {
  font-size: 11px;
  color: var(--c-text);
  padding: 1px 6px;
  border: 1px solid var(--c-border);
  background: var(--c-surface-raised);
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.row-label {
  flex: 0 0 auto;
  color: var(--c-text-muted);
  letter-spacing: 1px;
}

.row-text {
  color: var(--c-text);
}

.token-hint {
  margin-left: auto;
  color: var(--c-seal);
  font-size: 10px;
}

.ladder {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  list-style: none;
}

.ladder li {
  text-align: center;
  font-size: 10px;
  padding: 2px 0;
  color: var(--c-text-muted);
  border-top: 2px solid var(--c-border);
  transition: all 260ms var(--ease-gentle);
}

.ladder li.is-done {
  color: var(--c-primary);
  border-top-color: var(--c-primary-soft);
}

.ladder li.is-now {
  color: var(--c-accent);
  border-top-color: var(--c-accent);
  font-weight: bold;
}

.detail {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 6px;
}

.detail > div {
  background: var(--c-surface-raised);
  border: 1px solid var(--c-border);
  padding: 5px 7px;
}

.detail .wide {
  grid-column: 1 / -1;
}

.detail dt {
  font-size: 10px;
  color: var(--c-text-muted);
  letter-spacing: 1px;
}

.detail dd {
  font-size: 12px;
  line-height: 1.45;
}
</style>
