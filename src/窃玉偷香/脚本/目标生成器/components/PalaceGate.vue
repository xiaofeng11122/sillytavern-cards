<template>
  <section class="qy-palace">
    <div class="qy-palace-row">
      <span class="qy-palace-label">宫线</span>
      <span class="qy-palace-count">{{ Math.min(palace, 2) }}/2</span>
      <span class="qy-palace-note">{{ palaceNote }}</span>
    </div>

    <button
      v-if="canOpen"
      type="button"
      class="qy-btn qy-btn-primary"
      @click="emit('open')"
    >
      开启女帝线
    </button>
    <p v-else-if="palace < 2" class="qy-palace-hint">
      先攻略两名宫中女子（尚仪局女官、尚服局司衣、废妃、女医、乐伎…），宫门才有人替你开。
    </p>
    <p v-else class="qy-palace-hint">女帝线已开，剩下的交给说书人。</p>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{ palace: number; stage: string }>();
const emit = defineEmits<{ open: [] }>();

const canOpen = computed(() => props.palace >= 2 && props.stage === '接触前');

const palaceNote = computed(() => {
  if (props.stage !== '接触前') return `女帝线 · ${props.stage}`;
  if (props.palace >= 2) return '宫门已开';
  return `尚缺 ${2 - props.palace} 名内应`;
});
</script>

<style lang="scss" scoped>
.qy-palace {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 7px;
  border-top: 1px dashed var(--c-border);
}

.qy-palace-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 11px;
}

.qy-palace-label {
  color: var(--c-secondary);
  letter-spacing: 2px;
}

.qy-palace-count {
  font-size: 13px;
  color: var(--c-text);
  font-variant-numeric: tabular-nums;
}

.qy-palace-note,
.qy-palace-hint {
  font-size: 10.5px;
  color: var(--c-text-muted);
  line-height: 1.5;
}

.qy-btn {
  align-self: flex-start;
  font-family: inherit;
  font-size: 11.5px;
  padding: 3px 14px;
  letter-spacing: 1px;
  color: var(--c-primary);
  background: var(--c-surface);
  border: 1px solid var(--c-primary-soft);
  cursor: pointer;
  transition: all 160ms var(--ease-gentle);
}

.qy-btn:hover {
  background: var(--c-surface-raised);
  border-color: var(--c-primary);
}

.qy-btn:active {
  transform: translateY(1px);
}

.qy-btn-primary {
  color: var(--c-surface-raised);
  background: var(--c-primary);
  border-color: var(--c-primary);
}

.qy-btn-primary:hover {
  color: var(--c-surface-raised);
  background: var(--c-seal);
  border-color: var(--c-seal);
}
</style>
