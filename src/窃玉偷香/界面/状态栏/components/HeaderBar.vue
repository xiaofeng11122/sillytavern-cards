<template>
  <button class="header" type="button" @click="emit('toggle')">
    <span class="seal">窃玉<br />偷香</span>

    <span class="main">
      <span class="title">
        洛京风闻
        <span class="disguise">{{ disguise || '未入户' }}</span>
      </span>
      <span class="stats">
        <span class="stat" :class="dangerClass">
          <span class="stat-label">危险</span>
          <span class="stat-value">{{ Math.round(danger) }}</span>
          <span class="stat-note">{{ dangerNote }}</span>
        </span>
        <span class="stat">
          <span class="stat-label">宫线</span>
          <span class="stat-value">{{ Math.round(palace) }}<i>/2</i></span>
          <span class="stat-note">{{ palace >= 2 ? '已开' : '未开' }}</span>
        </span>
        <span class="stat">
          <span class="stat-label">沦陷</span>
          <span class="stat-value">{{ hasTarget ? Math.round(fallen) : '—' }}</span>
          <span class="stat-note">{{ hasTarget ? fallenNote : '无目标' }}</span>
        </span>
      </span>
    </span>

    <span class="flip">{{ expanded ? '收起' : '展开' }}</span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  disguise: string;
  danger: number;
  palace: number;
  fallen: number;
  hasTarget: boolean;
  expanded: boolean;
}>();

const emit = defineEmits<{ toggle: [] }>();

/** 三档印痕：檀褐 → 朱砂 → 血色（详见 design-spec.md 双线叙事体现） */
const dangerClass = computed(() => {
  if (props.danger >= 85) return 'lv-3';
  if (props.danger >= 60) return 'lv-2';
  return 'lv-1';
});

const dangerNote = computed(() => {
  if (props.danger >= 85) return '风声';
  if (props.danger >= 60) return '留意';
  if (props.danger >= 20) return '微澜';
  return '风平';
});

const fallenNote = computed(() => {
  const v = props.fallen;
  if (v >= 85) return '死心塌地';
  if (v >= 60) return '依恋';
  if (v >= 35) return '心动';
  if (v >= 15) return '留意';
  return '冷淡';
});
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: stretch;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border: none;
  border-bottom: 1px solid var(--c-border);
  background: linear-gradient(180deg, rgba(138, 90, 59, 0.09), rgba(138, 90, 59, 0.02));
  font-family: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 260ms var(--ease-gentle);
}

.header:hover {
  background: linear-gradient(180deg, rgba(138, 90, 59, 0.14), rgba(138, 90, 59, 0.04));
}

.seal {
  flex: 0 0 auto;
  align-self: center;
  width: 34px;
  padding: 3px 0;
  border: 1px solid var(--c-seal);
  color: var(--c-seal);
  font-family: var(--font-accent);
  font-size: 11px;
  line-height: 1.15;
  text-align: center;
  letter-spacing: 1px;
}

.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13.5px;
  letter-spacing: 2px;
  color: var(--c-primary);
}

.disguise {
  font-size: 11px;
  letter-spacing: 0;
  color: var(--c-text-muted);
  border-bottom: 1px dashed var(--c-border);
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(88px, 1fr));
  gap: 8px;
}

.stat {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 11px;
  color: var(--c-text-muted);
  white-space: nowrap;
}

.stat-value {
  font-size: 14px;
  color: var(--c-text);
  font-variant-numeric: tabular-nums;
}

.stat-value i {
  font-size: 10px;
  font-style: normal;
  color: var(--c-text-muted);
}

.stat-note {
  font-size: 10px;
}

.lv-1 .stat-value {
  color: var(--c-primary);
}

.lv-2 .stat-value {
  color: var(--c-accent);
  transition: color 120ms linear;
}

.lv-3 .stat-value {
  color: var(--c-danger);
  transition: color 120ms linear;
}

.flip {
  align-self: center;
  flex: 0 0 auto;
  font-size: 11px;
  color: var(--c-primary-soft);
  border-bottom: 1px solid var(--c-primary-soft);
}

@media (max-width: 420px) {
  .flip {
    display: none;
  }
}
</style>
