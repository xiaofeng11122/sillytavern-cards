<template>
  <div class="board">
    <TargetBoard v-if="hasTarget" :target="store.data.当前目标" :palace="store.data.系统.宫线进度" />
    <EmptyBoard v-else />
  </div>
</template>

<script setup lang="ts">
import EmptyBoard from './components/EmptyBoard.vue';
import TargetBoard from './components/TargetBoard.vue';
import { useDataStore } from './store';

const store = useDataStore();

/** '' = 尚无目标（schema 哨兵） */
const hasTarget = computed(() => store.data.当前目标.姓名 !== '');
</script>

<style lang="scss" scoped>
/* 不设固定高度、不 overflow:hidden：文字换行时容器必须跟着长高 */
.board {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
}
</style>
