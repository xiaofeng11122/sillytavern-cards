<template>
  <div class="qy-inner">
    <header class="qy-bar" @click="ui.toggleExpanded()">
      <span class="qy-tube" aria-hidden="true">签</span>
      <span class="qy-title">目标生成器</span>
      <span class="qy-summary">{{ summary }}</span>
      <span class="qy-flip">{{ ui.expanded ? '收起' : '展开' }}</span>
    </header>

    <Transition name="qy-unfold">
      <div v-if="ui.expanded" class="qy-body">
        <div class="qy-field">
          <span class="qy-field-label">身份池</span>
          <PoolChips v-model="ui.pools" />
        </div>

        <div class="qy-field">
          <span class="qy-field-label">年龄段</span>
          <AgeChips v-model="ui.ageIndex" />
        </div>

        <div class="qy-draw">
          <button type="button" class="qy-btn qy-btn-primary" @click="draw">掷一支签</button>
          <span v-if="!ui.slip" class="qy-draw-hint">签筒里装的是这京城里的女子。</span>
        </div>

        <TargetSlip
          v-if="ui.slip"
          :slip="ui.slip"
          :replacing="replacing"
          :shaking="shaking"
          @adopt="adopt"
          @redraw="draw"
        />

        <PalaceGate :palace="palace" :stage="stage" @open="openEmpress" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import AgeChips from './components/AgeChips.vue';
import PalaceGate from './components/PalaceGate.vue';
import PoolChips from './components/PoolChips.vue';
import TargetSlip from './components/TargetSlip.vue';
import { AGE_BANDS, drawTarget } from './data';
import { adoptTarget, startEmpressLine, takenNames, useStatData, useUiStore } from './store';

const ui = useUiStore();
const { statData, reload } = useStatData();

const shaking = ref(false);

const currentName = computed(() => String(_.get(statData.value, '当前目标.姓名', '') ?? ''));
const currentStage = computed(() => String(_.get(statData.value, '当前目标.关系阶段', '陌生')));
const palace = computed(() => Number(_.get(statData.value, '系统.宫线进度', 0) ?? 0));
const stage = computed(() => String(_.get(statData.value, '女帝.攻略阶段', '接触前')));

const summary = computed(() => {
  if (!currentName.value) {
    return '签筒未动';
  }
  return `当前目标 · ${currentName.value}（${currentStage.value}）`;
});

/** 已得手或已是情人时换人，会丢掉她的名册记录，需显式提醒 */
const replacing = computed(() =>
  currentName.value && ['得手', '情人'].includes(currentStage.value)
    ? `${currentName.value}（${currentStage.value}）`
    : '',
);

const draw = () => {
  const result = drawTarget({
    pools: ui.pools,
    ageRange: AGE_BANDS[ui.ageIndex]?.range ?? null,
    taken: takenNames(statData.value),
  });

  if (!result) {
    toastr.warning('这一类里没有合年纪的人，放宽些再掷', '目标生成器');
    return;
  }

  // 先摇筒，再落签
  shaking.value = true;
  window.setTimeout(() => {
    ui.slip = result;
    shaking.value = false;
  }, 420);
};

const adopt = () => {
  if (!ui.slip) {
    return;
  }
  const name = ui.slip.姓名;
  adoptTarget(ui.slip);
  ui.slip = null;
  reload();
  toastr.success(`已立 ${name} 为目标，伪装身份归零`, '目标生成器');
};

const openEmpress = () => {
  startEmpressLine();
  reload();
  toastr.success('宫门已开，女帝线自「亲近期」起', '目标生成器');
};
</script>

<!-- 变量定义与重置放在 #qy-dock 上：脚本的样式会被传送到酒馆网页 head，不能污染 :root -->
<style>
#qy-dock {
  --c-surface: #f7f1e6;
  --c-surface-raised: #fffcf6;
  --c-primary: #8a5a3b;
  --c-primary-soft: #c8a883;
  --c-accent: #b23a30;
  --c-secondary: #5f7d6a;
  --c-danger: #8c1f18;
  --c-text: #2b2118;
  --c-text-muted: #8a7d6b;
  --c-border: #cbb894;
  --c-seal: #a8322a;
  --font-body: 'Songti SC', 'Source Han Serif SC', 'Noto Serif CJK SC', 'SimSun', serif;
  --font-accent: 'Kaiti SC', 'STKaiti', 'KaiTi', 'Songti SC', serif;
  --ease-gentle: cubic-bezier(0.33, 0.9, 0.35, 1);

  width: 100%;
  max-width: 780px;
  margin: 0 auto 4px;
  font-family: var(--font-body);
  font-size: 12px;
  line-height: 1.5;
  color: var(--c-text);
  text-align: left;
}

#qy-dock *,
#qy-dock *::before,
#qy-dock *::after {
  box-sizing: border-box;
}
</style>

<style lang="scss" scoped>
.qy-inner {
  border: 1px solid var(--c-border);
  border-radius: 3px;
  background: var(--c-surface);
  box-shadow: 0 1px 3px rgba(43, 33, 24, 0.09);
  overflow: hidden;
}

.qy-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 9px;
  cursor: pointer;
  user-select: none;
  transition: background 200ms var(--ease-gentle);
}

.qy-bar:hover {
  background: rgba(138, 90, 59, 0.07);
}

.qy-tube {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  font-family: var(--font-accent);
  font-size: 11px;
  color: var(--c-surface-raised);
  background: var(--c-seal);
  border-radius: 2px;
}

.qy-title {
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--c-primary);
  white-space: nowrap;
}

.qy-summary {
  flex: 1;
  min-width: 0;
  font-size: 11px;
  color: var(--c-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qy-flip {
  flex: 0 0 auto;
  font-size: 11px;
  color: var(--c-primary-soft);
}

.qy-body {
  padding: 8px 9px 9px;
  border-top: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  gap: 7px;
  background: var(--c-surface);
}

.qy-field {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.qy-field-label {
  flex: 0 0 auto;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--c-text-muted);
}

.qy-draw {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.qy-draw-hint {
  font-size: 10.5px;
  color: var(--c-text-muted);
}

.qy-btn {
  font-family: inherit;
  font-size: 11.5px;
  padding: 3px 14px;
  letter-spacing: 1px;
  color: var(--c-primary);
  background: var(--c-surface-raised);
  border: 1px solid var(--c-primary-soft);
  border-radius: 2px;
  cursor: pointer;
  transition: all 160ms var(--ease-gentle);
}

.qy-btn:hover {
  border-color: var(--c-primary);
}

.qy-btn:active {
  transform: translateY(1px);
}

.qy-btn-primary {
  color: var(--c-surface-raised);
  background: var(--c-primary);
  border-color: var(--c-primary);
}

.qy-btn-primary:hover {
  background: var(--c-seal);
  border-color: var(--c-seal);
}

.qy-unfold-enter-active,
.qy-unfold-leave-active {
  transition:
    opacity 220ms var(--ease-gentle),
    transform 220ms var(--ease-gentle);
  overflow: hidden;
}

.qy-unfold-enter-from,
.qy-unfold-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@media (max-width: 560px) {
  .qy-summary {
    font-size: 10.5px;
  }

  .qy-flip {
    display: none;
  }
}
</style>
