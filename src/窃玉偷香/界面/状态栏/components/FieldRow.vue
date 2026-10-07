<template>
  <div class="row">
    <span class="label">{{ label }}</span>
    <div class="value">
      <p v-for="part in parts" :key="part" class="part" :class="{ 'is-accent': accent, 'is-kai': kai }">
        {{ part }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string;
    /** 传数组则逐行显示（性格的「外·…｜内·…」就是这样拆开的） */
    value: string | string[];
    accent?: boolean;
    /** 楷体：用于「心理」这类她的心声，与陈述性字段区分开 */
    kai?: boolean;
  }>(),
  { accent: false, kai: false },
);

const parts = computed(() => (Array.isArray(props.value) ? props.value : [props.value]).filter(Boolean));
</script>

<style lang="scss" scoped>
.row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 3px 0;
}

.label {
  flex: 0 0 auto;
  width: 3.2em;
  font-size: 10.5px;
  letter-spacing: 1px;
  color: var(--c-text-muted);
  padding-top: 1px;
}

.value {
  flex: 1 1 auto;
  min-width: 0;
}

.part {
  font-size: 12px;
  line-height: 1.65;
  overflow-wrap: anywhere;
}

.part.is-accent {
  color: var(--c-accent);
}

.part.is-kai {
  font-family: var(--font-accent);
  font-size: 12.5px;
  color: var(--c-primary);
}
</style>
