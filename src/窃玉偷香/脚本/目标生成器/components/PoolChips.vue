<template>
  <div class="qy-chips">
    <button
      v-for="pool in POOLS"
      :key="pool"
      type="button"
      class="qy-chip"
      :class="{ 'is-on': modelValue.includes(pool) }"
      :title="POOL_LABEL[pool]"
      @click="toggle(pool)"
    >
      {{ pool }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { POOLS, POOL_LABEL, type Pool } from '../data';

const props = defineProps<{ modelValue: Pool[] }>();
const emit = defineEmits<{ 'update:modelValue': [Pool[]] }>();

const toggle = (pool: Pool) => {
  const has = props.modelValue.includes(pool);
  // 至少保留一类，否则掷签必然空手
  if (has && props.modelValue.length <= 1) {
    toastr.info('至少留一类身份池', '目标生成器');
    return;
  }
  emit('update:modelValue', has ? props.modelValue.filter(item => item !== pool) : [...props.modelValue, pool]);
};
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
