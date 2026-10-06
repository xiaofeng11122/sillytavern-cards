<template>
  <section class="annex">
    <h3 class="head">
      已攻略名册
      <span class="count">{{ entries.length }} 人</span>
    </h3>

    <p v-if="!entries.length" class="none">名册尚空。</p>

    <template v-else>
      <div v-for="group in groups" :key="group.layer" class="group">
        <div class="group-head">
          <span class="layer">{{ group.layer }}</span>
          <span class="layer-count">{{ group.items.length }}</span>
        </div>
        <ul class="list">
          <li v-for="item in group.items" :key="item.name">
            <span class="name">{{ item.name }}</span>
            <span class="identity">{{ item.identity }}</span>
            <span class="token" :class="{ 'has-token': !!item.token }">
              {{ item.token || '未赠信物' }}
            </span>
            <span class="state" :class="`state-${item.state}`">{{ item.state }}</span>
          </li>
        </ul>
      </div>

      <p v-if="echoLayers.length" class="echo">
        风声：{{ echoLayers.join('、') }}圈层往来密切，衣饰暗记易被彼此认出。
      </p>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { SchemaConquered } from '../../../schema';

const props = defineProps<{ annex: SchemaConquered }>();

interface Entry {
  name: string;
  identity: string;
  token: string;
  state: string;
}

const entries = computed<Entry[]>(() =>
  Object.entries(props.annex).map(([name, value]) => ({
    name,
    identity: value.身份 || '身份不详',
    token: value.信物,
    state: value.关系状态,
  })),
);

const groups = computed(() => {
  const byLayer = new Map<string, Entry[]>();
  for (const [name, value] of Object.entries(props.annex)) {
    const layer = value.圈层 || '官宦';
    const list = byLayer.get(layer) ?? [];
    list.push({
      name,
      identity: value.身份 || '身份不详',
      token: value.信物,
      state: value.关系状态,
    });
    byLayer.set(layer, list);
  }
  return [...byLayer.entries()].map(([layer, items]) => ({ layer, items }));
});

/** 同圈层 ≥2 人：信物暗记互相撞破的风险（本卡独有机制） */
const echoLayers = computed(() =>
  groups.value.filter(group => group.items.filter(item => item.token).length >= 2).map(group => group.layer),
);
</script>

<style lang="scss" scoped>
.annex {
  padding: 10px;
  border-top: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.head {
  font-size: 12px;
  font-weight: normal;
  letter-spacing: 2px;
  color: var(--c-primary);
  border-bottom: 1px solid var(--c-border);
  padding-bottom: 4px;
}

.count {
  float: right;
  font-size: 10px;
  color: var(--c-text-muted);
  letter-spacing: 0;
}

.none {
  font-size: 11px;
  color: var(--c-text-muted);
}

.group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-head {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--c-secondary);
  letter-spacing: 1px;
}

.layer-count {
  font-size: 10px;
  color: var(--c-text-muted);
}

.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.list li {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11.5px;
  padding: 4px 7px;
  background: var(--c-surface-raised);
  border: 1px solid var(--c-border);
}

.name {
  font-family: var(--font-accent);
  letter-spacing: 2px;
  color: var(--c-primary);
}

.identity {
  color: var(--c-text-muted);
  font-size: 10.5px;
}

.token {
  margin-left: auto;
  font-size: 10px;
  color: var(--c-text-muted);
}

.token.has-token {
  color: var(--c-seal);
}

.state {
  font-size: 10px;
  padding: 0 5px;
  border: 1px solid var(--c-border);
}

.state-情人 {
  color: var(--c-accent);
  border-color: var(--c-accent);
}

.state-了结 {
  color: var(--c-text-muted);
}

.echo {
  font-size: 11px;
  color: var(--c-danger);
  border-left: 2px solid var(--c-danger);
  padding-left: 7px;
  line-height: 1.5;
}
</style>
