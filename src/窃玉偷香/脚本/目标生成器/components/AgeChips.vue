<template>
  <div class="qy-chips">
    <button
      v-for="(band, index) in AGE_BANDS"
      :key="band.label"
      type="button"
      class="qy-chip"
      :class="{ 'is-on': index === modelValue }"
      @click="emit('update:modelValue', index)"
    >
      {{ band.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { AGE_BANDS } from '../data';

defineProps<{ modelValue: number }>();
const emit = defineEmits<{ 'update:modelValue': [number] }>();
</script>

<style lang="scss" scoped>
.qy-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.qy-chip {
  font-family: inherit;
  font-size: 11.5px;
  line-height: 1.6;
  padding: 1px 9px;
  color: var(--c-text-muted);
  background: var(--c-surface-raised);
  border: 1px solid var(--c-border);
  cursor: pointer;
  transition: all 180ms var(--ease-gentle);
}

.qy-chip:hover {
  border-color: var(--c-primary-soft);
  color: var(--c-primary);
}

.qy-chip.is-on {
  color: var(--c-surface-raised);
  background: var(--c-primary);
  border-color: var(--c-primary);
}
</style>
