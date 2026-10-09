<template>
  <div class="panel">
    <button type="button" class="head" @click="open = !open">
      <span class="title">名册</span>
      <span class="count">{{ names.length }} 位</span>
      <span class="flip">{{ open ? '收起' : '展开' }}</span>
    </button>

    <div v-if="open" class="body">
      <p v-if="!names.length" class="empty">还没有可引荐的熟客。她来过两回以上、或者已经到过云雨，就会被记在这里。</p>

      <template v-else>
        <div v-for="group in grouped" :key="group.pool" class="group">
          <p class="group-name">{{ POOL_LABEL[group.pool] }}</p>
          <div v-for="item in group.items" :key="item.name" class="item">
            <div class="line">
              <span class="who">{{ item.name }}</span>
              <span class="meta">{{ item.entry.职业 }} · {{ item.entry.年龄 }}岁 · 好感 {{ item.entry.好感度 }} · 性欲 {{ item.entry.性欲 }}</span>
            </div>
            <p v-if="item.entry.带过的人?.length" class="brought">介绍过：{{ item.entry.带过的人.join('、') }}</p>
            <button type="button" class="refer" @click="emit('refer', item.name)">让她带朋友来</button>
          </div>
        </div>

        <button type="button" class="hand" @click="emit('hand-over')">把名册递给说书人</button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { POOL_LABEL, type Pool } from '../data';
import type { Roster, RosterEntry } from '../store';

const props = defineProps<{ roster: Roster }>();
const emit = defineEmits<{ refer: [string]; 'hand-over': [] }>();

const open = ref(false);

const names = computed(() => Object.keys(props.roster));

/** 按圈层分组，行内保持稳定顺序 */
const grouped = computed(() => {
  const buckets = new Map<Pool, { name: string; entry: RosterEntry }[]>();
  for (const name of names.value) {
    const entry = props.roster[name];
    const pool = (entry.圈层 ?? '服务') as Pool;
    if (!buckets.has(pool)) {
      buckets.set(pool, []);
    }
    buckets.get(pool)!.push({ name, entry });
  }
  return [...buckets.entries()].map(([pool, items]) => ({ pool, items }));
});
</script>

<style lang="scss" scoped>
.panel {
  border-top: 1px solid var(--c-border, #d5dddb);
  padding-top: 5px;
}

.head {
  width: 100%;
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  cursor: pointer;
}

.title {
  font-size: 11.5px;
  letter-spacing: 1px;
  color: var(--c-primary, #35606a);
}

.count {
  font-size: 10.5px;
  color: var(--c-text-muted, #7c8a88);
}

.flip {
  flex: 1;
  text-align: right;
  font-size: 10.5px;
  color: var(--c-primary-soft, #8fadb3);
}

.body {
  padding-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty {
  font-size: 11px;
  line-height: 1.55;
  color: var(--c-text-muted, #7c8a88);
}

.group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-name {
  font-size: 10.5px;
  letter-spacing: 1px;
  color: var(--c-primary-soft, #8fadb3);
}

.item {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  padding: 4px 7px;
  border: 1px solid var(--c-border, #d5dddb);
  border-radius: 2px;
  background: var(--c-surface-raised, #fff);
}

.line {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
}

.who {
  font-size: 12px;
  color: var(--c-text, #23302f);
}

.meta {
  font-size: 10.5px;
  color: var(--c-text-muted, #7c8a88);
}

.brought {
  flex: 1 0 100%;
  font-size: 10.5px;
  color: var(--c-primary-soft, #8fadb3);
}

.refer {
  font-family: inherit;
  font-size: 10.5px;
  padding: 1px 7px;
  border: 1px solid var(--c-primary-soft, #8fadb3);
  border-radius: 2px;
  background: transparent;
  color: var(--c-primary, #35606a);
  cursor: pointer;
}

.hand {
  align-self: flex-start;
  font-family: inherit;
  font-size: 10.5px;
  padding: 2px 9px;
  border: 1px solid var(--c-primary-soft, #8fadb3);
  border-radius: 2px;
  background: transparent;
  color: var(--c-text-muted, #7c8a88);
  cursor: pointer;
}
</style>