<template>
  <div class="row" :class="`is-${tone}`">
    <span class="label">{{ label }}</span>
    <span class="number">{{ Math.round(value) }}%</span>
    <span class="bar" aria-hidden="true">
      <i :style="{ width: `${clamped}%` }" />
    </span>
    <span class="tier">{{ tier }}</span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string;
    /** 0~100；schema 已 clamp，这里再兜一次避免脏数据把条撑破 */
    value: number;
    tier: string;
    tone: 'affection' | 'desire';
  }>(),
  {},
);

const clamped = computed(() => Math.min(100, Math.max(0, Number(props.value) || 0)));
</script>

<style lang="scss" scoped>
.row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
}

.label {
  flex: 0 0 auto;
  width: 3.4em;
  font-size: 10.5px;
  letter-spacing: 1px;
  color: var(--c-text-muted);
}

.number {
  flex: 0 0 auto;
  width: 3.2em;
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.is-affection .number,
.is-affection .tier {
  color: var(--c-affection);
}

.is-desire .number,
.is-desire .tier {
  color: var(--c-desire);
}

.bar {
  flex: 1 1 auto;
  min-width: 0;
  height: 5px;
  border-radius: 3px;
  background: var(--c-border);
  overflow: hidden;
}

.bar i {
  display: block;
  height: 100%;
  border-radius: 3px;
  transition: width 420ms var(--ease-gentle);
}

.is-affection .bar i {
  background: var(--c-affection);
}

.is-desire .bar i {
  background: var(--c-desire);
}

.tier {
  flex: 0 0 auto;
  font-size: 10.5px;
  letter-spacing: 1px;
}
</style>