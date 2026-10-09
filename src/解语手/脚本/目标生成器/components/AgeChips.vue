<template>
  <div class="chips">
    <button
      v-for="(band, index) in AGE_BANDS"
      :key="band.label"
      type="button"
      class="chip"
      :class="{ 'is-on': model === index }"
      @click="model = index"
    >
      {{ band.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { AGE_BANDS } from '../data';

const model = defineModel<number>({ required: true });
</script>

<style lang="scss" scoped>
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.chip {
  font-family: inherit;
  font-size: 11px;
  padding: 2px 8px;
  border: 1px solid var(--c-primary-soft, #8fadb3);
  border-radius: 2px;
  background: transparent;
  color: var(--c-text-muted, #7c8a88);
  cursor: pointer;
  transition: all 160ms var(--ease-gentle, ease);
}

.chip:hover {
  border-color: var(--c-primary, #35606a);
}

.chip.is-on {
  color: var(--c-surface-raised, #fff);
  background: var(--c-primary, #35606a);
  border-color: var(--c-primary, #35606a);
}
</style>