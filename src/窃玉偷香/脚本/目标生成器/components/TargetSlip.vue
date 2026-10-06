<template>
  <article class="qy-slip" :class="{ 'is-shaking': shaking }">
    <header class="qy-slip-head">
      <span class="qy-slip-seal">{{ slip.圈层 }}</span>
      <span class="qy-slip-name">{{ slip.姓名 }}</span>
      <span class="qy-slip-age">{{ slip.年龄 }} 岁</span>
      <span class="qy-slip-identity">{{ slip.身份 }}</span>
    </header>

    <dl class="qy-slip-detail">
      <div>
        <dt>性格</dt>
        <dd>{{ slip.性格 }}</dd>
      </div>
      <div>
        <dt>身材</dt>
        <dd>{{ slip.身材 }}</dd>
      </div>
      <div>
        <dt>性癖</dt>
        <dd>{{ slip.性癖 }}</dd>
      </div>
      <div>
        <dt>敏感点</dt>
        <dd>{{ slip.敏感点 }}</dd>
      </div>
      <div class="qy-wide">
        <dt>性经历</dt>
        <dd>{{ slip.性经历 }}</dd>
      </div>
    </dl>

    <p class="qy-slip-notes">
      <span class="qy-note-label">苦主</span>{{ slip.苦主 }}
    </p>
    <p v-if="replacing" class="qy-slip-warn">
      现下的目标已是「{{ replacing }}」。换人之后，她的记录需由叙事并入名册（AI 依条目处理）。
    </p>

    <footer class="qy-slip-actions">
      <button type="button" class="qy-btn qy-btn-primary" @click="emit('adopt')">收下此签</button>
      <button type="button" class="qy-btn" @click="emit('redraw')">另掷一支</button>
    </footer>
  </article>
</template>

<script setup lang="ts">
import type { DrawnTarget } from '../data';

defineProps<{
  slip: DrawnTarget;
  /** 当前目标已得手/为情人时，换人会丢掉她的记录，这里显式提醒 */
  replacing: string;
  shaking: boolean;
}>();

const emit = defineEmits<{ adopt: []; redraw: [] }>();
</script>

<style lang="scss" scoped>
.qy-slip {
  border: 1px solid var(--c-border);
  background: var(--c-surface-raised);
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

/* 摇筒：不是「加载中」，是签条落定前的两下轻晃 */
.qy-slip.is-shaking {
  animation: qy-shake 420ms var(--ease-gentle);
}

@keyframes qy-shake {
  0%,
  100% {
    transform: translateX(0);
  }

  22% {
    transform: translateX(-4px) rotate(-0.4deg);
  }

  55% {
    transform: translateX(4px) rotate(0.4deg);
  }

  78% {
    transform: translateX(-2px);
  }
}

.qy-slip-head {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 7px;
}

.qy-slip-seal {
  font-size: 10px;
  color: var(--c-surface-raised);
  background: var(--c-seal);
  padding: 0 5px;
  letter-spacing: 1px;
}

.qy-slip-name {
  font-family: var(--font-accent);
  font-size: 16px;
  letter-spacing: 3px;
  color: var(--c-primary);
}

.qy-slip-age {
  font-size: 11px;
  color: var(--c-text-muted);
}

.qy-slip-identity {
  font-size: 11px;
  color: var(--c-text);
}

.qy-slip-detail {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 5px;
}

.qy-slip-detail > div {
  border: 1px solid var(--c-border);
  padding: 4px 6px;
  background: var(--c-surface);
}

.qy-slip-detail .qy-wide {
  grid-column: 1 / -1;
}

.qy-slip-detail dt {
  font-size: 10px;
  color: var(--c-text-muted);
  letter-spacing: 1px;
}

.qy-slip-detail dd {
  font-size: 11.5px;
  line-height: 1.45;
}

.qy-slip-notes {
  font-size: 11px;
  line-height: 1.5;
  color: var(--c-text-muted);
}

.qy-note-label {
  color: var(--c-primary-soft);
  margin-right: 5px;
  letter-spacing: 1px;
}

.qy-slip-warn {
  font-size: 11px;
  line-height: 1.5;
  color: var(--c-danger);
  border-left: 2px solid var(--c-danger);
  padding-left: 7px;
}

.qy-slip-actions {
  display: flex;
  gap: 6px;
}

.qy-btn {
  font-family: inherit;
  font-size: 11.5px;
  padding: 3px 14px;
  letter-spacing: 1px;
  color: var(--c-primary);
  background: var(--c-surface);
  border: 1px solid var(--c-primary-soft);
  cursor: pointer;
  transition: all 160ms var(--ease-gentle);
}

.qy-btn:hover {
  background: var(--c-surface-raised);
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
  color: var(--c-surface-raised);
  background: var(--c-seal);
  border-color: var(--c-seal);
}
</style>
