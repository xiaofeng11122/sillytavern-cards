<template>
  <div class="board">
    <GuestBoard v-if="hasGuest" :guest="store.data.当前客人" :shop="store.data.系统.店内" />
    <EmptyBoard v-else />
  </div>
</template>

<script setup lang="ts">
import EmptyBoard from './components/EmptyBoard.vue';
import GuestBoard from './components/GuestBoard.vue';
import { useDataStore } from './store';

const store = useDataStore();

/** '' = 尚无客人（schema 哨兵） */
const hasGuest = computed(() => store.data.当前客人.姓名 !== '');
</script>

<style lang="scss" scoped>
/* 不设固定高度、不 overflow:hidden：文字换行时容器必须跟着长高 */
.board {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 3px;
  display: flex;
  flex-direction: column;
}
</style>