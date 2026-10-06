<template>
  <div class="scroll">
    <HeaderBar
      :disguise="store.data.主角.当前伪装身份"
      :danger="store.data.系统.危险度"
      :palace="store.data.系统.宫线进度"
      :fallen="store.data.当前目标.沦陷值"
      :has-target="hasTarget"
      :expanded="expanded"
      @toggle="expanded = !expanded"
    />

    <TargetCard v-if="hasTarget" :target="store.data.当前目标" />
    <EmptyState v-else />

    <Transition name="unfold">
      <div v-if="expanded" class="annex-wrap">
        <AnnexList :annex="store.data.已攻略目标" />
        <PalaceSection
          v-if="palaceVisible"
          :palace="store.data.系统.宫线进度"
          :empress="store.data.女帝"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import AnnexList from './components/AnnexList.vue';
import EmptyState from './components/EmptyState.vue';
import HeaderBar from './components/HeaderBar.vue';
import PalaceSection from './components/PalaceSection.vue';
import TargetCard from './components/TargetCard.vue';
import { useDataStore } from './store';

const store = useDataStore();

/** 折叠状态是纯前端偏好，存 localStorage，不进 MVU 变量 */
const expanded = useLocalStorage('窃玉偷香:状态栏展开', false);

/** '' = 尚无目标（schema 哨兵） */
const hasTarget = computed(() => store.data.当前目标.姓名 !== '');

/** 宫线段仅在宫线已开或女帝线已启动时出现 */
const palaceVisible = computed(
  () => store.data.系统.宫线进度 >= 2 || store.data.女帝.攻略阶段 !== '接触前',
);
</script>

<style lang="scss" scoped>
.scroll {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  box-shadow: 0 1px 0 rgba(43, 33, 24, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.unfold-enter-active,
.unfold-leave-active {
  transition:
    opacity 260ms var(--ease-gentle),
    transform 260ms var(--ease-gentle);
}

.unfold-enter-from,
.unfold-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
