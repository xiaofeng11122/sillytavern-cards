<template>
  <div class="chips">
    <button
      v-for="pool in POOLS"
      :key="pool"
      type="button"
      class="chip"
      :class="{ 'is-on': model.includes(pool) }"
      :title="POOL_LABEL[pool]"
      @click="toggle(pool)"
    >
      {{ pool }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { POOLS, POOL_LABEL, type Pool } from '../data';

const model = defineModel<Pool[]>({ required: true });

/** 至少留一类：全点掉时把刚点的那类放回去 */
const toggle = (pool: Pool) => {
  const next = model.value.includes(pool) ? model.value.filter(item => item !== pool) : [...model.value, pool];
  model.value = next.length ? next : [pool];
};
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