<template>
  <section class="qy-roster">
    <button type="button" class="qy-roster-bar" @click="ui.rosterOpen = !ui.rosterOpen">
      <span class="qy-roster-title">名册</span>
      <span class="qy-roster-count">{{ names.length }} 人</span>
      <span class="qy-roster-hint">（不进提示词，翻看才花心思）</span>
      <span class="qy-roster-flip">{{ ui.rosterOpen ? '收起' : '展开' }}</span>
    </button>

    <div v-if="ui.rosterOpen" class="qy-roster-body">
      <p v-if="!names.length" class="qy-roster-empty">名册还空着。得手或收作情人的目标，收新签时会自动记进来。</p>

      <template v-else>
        <div v-for="group in groups" :key="group.layer" class="qy-group">
          <div class="qy-group-head">
            <span class="qy-layer">{{ group.layer }}</span>
            <span class="qy-layer-count">{{ group.items.length }}</span>
          </div>
          <ul class="qy-list">
            <li v-for="item in group.items" :key="item.name">
              <span class="qy-name">{{ item.name }}</span>
              <span class="qy-identity">{{ item.identity }}</span>
              <span class="qy-token" :class="{ 'has-token': !!item.entry.信物 }">
                {{ item.entry.信物 || '未赠信物' }}
              </span>
              <span class="qy-state">{{ item.entry.关系状态 }}</span>
            </li>
          </ul>
        </div>

        <p v-if="echoLayers.length" class="qy-echo">
          风声：{{ echoLayers.join('、') }}这圈子里已有两人戴着你的暗记，往来照面迟早认出来。
        </p>
      </template>

      <div class="qy-roster-actions">
        <button type="button" class="qy-btn" @click="emit('hand-over')">递给说书人</button>
        <button type="button" class="qy-btn" @click="emit('archive')">收入当前目标</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Pool } from '../data';
import { useUiStore, type Roster, type RosterEntry } from '../store';

const props = defineProps<{ roster: Roster }>();
const emit = defineEmits<{ 'hand-over': []; archive: [] }>();

const ui = useUiStore();

const names = computed(() => Object.keys(props.roster));

const groups = computed(() => {
  const byLayer = new Map<Pool, { name: string; identity: string; entry: RosterEntry }[]>();
  for (const [name, entry] of Object.entries(props.roster)) {
    const layer = entry.圈层;
    const list = byLayer.get(layer) ?? [];
    list.push({ name, identity: entry.身份, entry });
    byLayer.set(layer, list);
  }
  return [...byLayer.entries()].map(([layer, items]) => ({ layer, items }));
});

/** 同圈层 ≥2 人已赠信物：暗记迟早被彼此认出 */
const echoLayers = computed(() =>
  groups.value
    .filter(group => group.items.filter(item => item.entry.信物).length >= 2)
    .map(group => group.layer),
);
</script>

<style lang="scss" scoped>
.qy-roster {
  border-top: 1px dashed var(--c-border);
  padding-top: 6px;
}

.qy-roster-bar {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.qy-roster-title {
  font-size: 11.5px;
  letter-spacing: 2px;
  color: var(--c-primary);
}

.qy-roster-count {
  font-size: 11px;
  color: var(--c-text);
  font-variant-numeric: tabular-nums;
}

.qy-roster-hint {
  flex: 1;
  min-width: 0;
  font-size: 10px;
  color: var(--c-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qy-roster-flip {
  flex: 0 0 auto;
  font-size: 10.5px;
  color: var(--c-primary-soft);
}

.qy-roster-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 6px;
}

.qy-roster-empty {
  font-size: 10.5px;
  line-height: 1.55;
  color: var(--c-text-muted);
}

.qy-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.qy-group-head {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.qy-layer {
  font-size: 10.5px;
  color: var(--c-secondary);
  letter-spacing: 1px;
}

.qy-layer-count {
  font-size: 10px;
  color: var(--c-text-muted);
}

.qy-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.qy-list li {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 7px;
  font-size: 11px;
  padding: 3px 7px;
  background: var(--c-surface-raised);
  border: 1px solid var(--c-border);
}

.qy-name {
  font-family: var(--font-accent);
  letter-spacing: 2px;
  color: var(--c-primary);
}

.qy-identity {
  font-size: 10.5px;
  color: var(--c-text-muted);
  overflow-wrap: anywhere;
}

.qy-token {
  margin-left: auto;
  font-size: 10px;
  color: var(--c-text-muted);
}

.qy-token.has-token {
  color: var(--c-seal);
}

.qy-state {
  font-size: 10px;
  padding: 0 5px;
  color: var(--c-accent);
  border: 1px solid var(--c-accent);
}

.qy-echo {
  font-size: 11px;
  line-height: 1.55;
  color: var(--c-danger);
  border-left: 2px solid var(--c-danger);
  padding-left: 7px;
}

.qy-roster-actions {
  display: flex;
  gap: 6px;
}

.qy-btn {
  font-family: inherit;
  font-size: 11.5px;
  padding: 3px 12px;
  letter-spacing: 1px;
  color: var(--c-primary);
  background: var(--c-surface-raised);
  border: 1px solid var(--c-primary-soft);
  cursor: pointer;
  transition: all 160ms var(--ease-gentle);
}

.qy-btn:hover {
  border-color: var(--c-primary);
}

.qy-btn:active {
  transform: translateY(1px);
}
</style>
