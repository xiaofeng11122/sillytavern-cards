<template>
  <div class="meter">
    <div class="meter-track">
      <div class="meter-fill" :class="`tone-${tone}`" :style="{ width: percent + '%' }"></div>
    </div>
    <span class="meter-value">{{ display }}</span>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: number;
    /** 满值；用于「宫线进度 x/2」这类分档显示 */
    max?: number;
    tone?: 'primary' | 'accent' | 'secondary' | 'danger';
    /** 是否显示「值/满值」形式，否则只显示值 */
    showMax?: boolean;
  }>(),
  { max: 100, tone: 'primary', showMax: false },
);

const percent = computed(() => {
  const max = props.max || 100;
  return Math.max(0, Math.min(100, (props.value / max) * 100));
});

const display = computed(() =>
  props.showMax ? `${Math.round(props.value)}/${props.max}` : String(Math.round(props.value)),
);
</script>

<style lang="scss" scoped>
.meter {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.meter-track {
  position: relative;
  flex: 1;
  height: 6px;
  background: rgba(138, 90, 59, 0.14);
  border: 1px solid var(--c-border);
  overflow: hidden;
}

.meter-fill {
  height: 100%;
  transition: width 320ms var(--ease-gentle);
}

.tone-primary {
  background: var(--c-primary);
}

.tone-accent {
  background: var(--c-accent);
}

.tone-secondary {
  background: var(--c-secondary);
}

.tone-danger {
  background: var(--c-danger);
}

.meter-value {
  font-size: 11px;
  min-width: 30px;
  text-align: right;
  color: var(--c-text-muted);
  font-variant-numeric: tabular-nums;
}
</style>
