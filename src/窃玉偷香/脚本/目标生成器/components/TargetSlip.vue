<template>
  <article class="qy-slip" :class="{ 'is-shaking': shaking }">
    <header class="qy-slip-head">
      <span class="qy-slip-seal">{{ slip.圈层 }}</span>
      <span class="qy-slip-name">{{ slip.姓名 }}</span>
      <span class="qy-slip-meta">{{ slip.身份 }} · {{ slip.身材 }} · {{ slip.年龄 }}岁</span>
    </header>

    <dl class="qy-slip-detail">
      <div>
        <dt>性格</dt>
        <dd>
          <span v-for="(part, index) in characterParts" :key="part" class="qy-part">
            <span v-if="index" class="qy-part-sep">｜</span>{{ part }}
          </span>
        </dd>
      </div>
      <div>
        <dt>敏感点</dt>
        <dd>{{ slip.敏感点 }}</dd>
      </div>
      <div>
        <dt>性癖</dt>
        <dd>{{ slip.性癖 }}</dd>
      </div>
      <div>
        <dt>性经历</dt>
        <dd>{{ slip.性经历 }}</dd>
      </div>
    </dl>

    <p class="qy-slip-notes">
      <span class="qy-note-label">苦主</span>{{ slip.苦主 }}
    </p>
    <p v-if="replacing" class="qy-slip-warn">
      现下的 {{ replacing }} 已到手，收下此签会先把她记进名册。
    </p>

    <div class="qy-slip-send">
      <button type="button" class="qy-link" @click="showText = !showText">
        {{ showText ? '收起这段话' : '看看要放进输入栏的话' }}
      </button>
      <pre v-if="showText" class="qy-slip-text">{{ openingText }}</pre>
    </div>

    <footer class="qy-slip-actions">
      <button type="button" class="qy-btn qy-btn-primary" @click="emit('adopt')">收下此签，写话给我</button>
      <button type="button" class="qy-btn" @click="emit('redraw')">另掷一支</button>
    </footer>
  </article>
</template>

<script setup lang="ts">
import type { DrawnTarget } from '../data';
import { buildOpeningText } from '../narrative';

const props = defineProps<{
  slip: DrawnTarget;
  /** 当前目标已得手/为情人时，收新签会先归档她 */
  replacing: string;
  shaking: boolean;
}>();

const emit = defineEmits<{ adopt: []; redraw: [] }>();

const showText = ref(false);

/** 性格写成「外·…｜内·…」，展示时拆开更清楚 */
const characterParts = computed(() => props.slip.性格.split('｜'));

/** 收下此签后会落进输入栏的那段话（只含玩家该知道的信息） */
const openingText = computed(() => buildOpeningText(props.slip));
</script>

<style lang="scss" scoped>
.qy-slip {
  border: 1px solid var(--c-border);
  background: var(--c-surface-raised);
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
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

.qy-slip-meta {
  font-size: 11px;
  color: var(--c-text-muted);
}

.qy-slip-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.qy-slip-detail > div {
  display: flex;
  gap: 8px;
  line-height: 1.6;
}

.qy-slip-detail dt {
  flex: 0 0 auto;
  width: 3.6em;
  font-size: 10.5px;
  color: var(--c-text-muted);
  letter-spacing: 1px;
  padding-top: 1px;
}

.qy-slip-detail dd {
  flex: 1;
  min-width: 0;
  font-size: 11.5px;
  overflow-wrap: anywhere;
}

.qy-part-sep {
  color: var(--c-primary-soft);
  margin: 0 2px;
}

.qy-slip-notes {
  font-size: 11px;
  line-height: 1.55;
  color: var(--c-text-muted);
  overflow-wrap: anywhere;
}

.qy-note-label {
  color: var(--c-primary-soft);
  margin-right: 5px;
  letter-spacing: 1px;
}

.qy-slip-warn {
  font-size: 11px;
  line-height: 1.55;
  color: var(--c-danger);
  border-left: 2px solid var(--c-danger);
  padding-left: 7px;
}

.qy-slip-actions {
  display: flex;
  gap: 6px;
}

.qy-slip-send {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.qy-link {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 10.5px;
  color: var(--c-primary-soft);
  border-bottom: 1px dashed var(--c-primary-soft);
  cursor: pointer;
}

.qy-slip-text {
  margin: 0;
  padding: 7px 9px;
  font-family: var(--font-body);
  font-size: 11.5px;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: var(--c-text);
  background: var(--c-surface);
  border: 1px dashed var(--c-border);
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
