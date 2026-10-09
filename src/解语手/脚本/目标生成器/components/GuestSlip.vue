<template>
  <article class="slip">
    <header class="head">
      <span class="seal">{{ guest.pool }}</span>
      <span class="name">{{ guest.姓名 }}</span>
      <span class="meta">{{ guest.职业 }} · {{ guest.形貌 }} · {{ guest.年龄 }}岁</span>
    </header>

    <p v-if="guest.来路 === '熟人引荐'" class="from">
      {{ guest.引荐人 }}介绍来的 —— {{ guest.引荐人的话 }}
    </p>

    <dl class="detail">
      <div>
        <dt>身份</dt>
        <dd>{{ guest.身份 }}</dd>
      </div>
      <div>
        <dt>婚配</dt>
        <dd>{{ guest.婚配 }}</dd>
      </div>
      <div>
        <dt>她来</dt>
        <dd>{{ guest.由头 }}</dd>
      </div>
      <div>
        <dt>敏感点</dt>
        <dd>{{ guest.敏感点.join('、') }}</dd>
      </div>
      <div>
        <dt>性癖</dt>
        <dd>{{ guest.性癖 }}</dd>
      </div>
      <div>
        <dt>性经历</dt>
        <dd>{{ guest.性经历 }}</dd>
      </div>
    </dl>

    <p class="seed">以上只写「底子」：给个方向，细处交给演绎当场长出来。</p>

    <p class="notes"><span class="note-label">她身边那位</span>{{ guest.partner }}</p>

    <div v-if="guest.来路 === '熟人引荐'" class="scene">
      <span class="scene-label">这一趟谁在店里</span>
      <div class="scene-chips">
        <button
          v-for="item in REFERRAL_SCENES"
          :key="item"
          type="button"
          class="scene-chip"
          :class="{ 'is-on': scene === item }"
          @click="emit('update:scene', item)"
        >
          {{ item }}
        </button>
      </div>
    </div>

    <div class="send">
      <button type="button" class="link" @click="showText = !showText">
        {{ showText ? '收起这段话' : '看看要放进输入栏的话' }}
      </button>
      <pre v-if="showText" class="text">{{ openingText }}</pre>
    </div>

    <footer class="actions">
      <button type="button" class="btn btn-primary" @click="emit('adopt')">收下，写话给我</button>
      <button type="button" class="btn" @click="emit('redraw')">另抽一位</button>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { REFERRAL_SCENES, type Guest, type ReferralScene } from '../data';
import { buildOpeningText } from '../narrative';

const props = defineProps<{
  guest: Guest;
  scene: ReferralScene;
}>();

const emit = defineEmits<{ adopt: []; redraw: []; 'update:scene': [ReferralScene] }>();

const showText = ref(false);

/** 收下此签后会落进输入栏的那段话（只含玩家该知道的信息） */
const openingText = computed(() => buildOpeningText(props.guest));
</script>

<style lang="scss" scoped>
.slip {
  border: 1px solid var(--c-border, #d5dddb);
  border-radius: 2px;
  background: var(--c-surface-raised, #fff);
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.head {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 7px;
}

.seal {
  font-size: 10px;
  color: var(--c-surface-raised, #fff);
  background: var(--c-primary, #35606a);
  padding: 0 5px;
  letter-spacing: 1px;
}

.name {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--c-primary, #35606a);
}

.meta {
  font-size: 11px;
  color: var(--c-text-muted, #7c8a88);
}

.from {
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--c-primary-soft, #8fadb3);
  border-left: 2px solid var(--c-primary-soft, #8fadb3);
  padding-left: 7px;
  overflow-wrap: anywhere;
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.detail > div {
  display: flex;
  gap: 8px;
  line-height: 1.6;
}

.detail dt {
  flex: 0 0 auto;
  width: 3.8em;
  font-size: 10.5px;
  color: var(--c-text-muted, #7c8a88);
  letter-spacing: 1px;
  padding-top: 1px;
}

.detail dd {
  flex: 1;
  min-width: 0;
  font-size: 11.5px;
  overflow-wrap: anywhere;
}

.seed {
  font-size: 10.5px;
  line-height: 1.5;
  color: var(--c-primary-soft, #8fadb3);
  border-left: 2px solid var(--c-primary-soft, #8fadb3);
  padding-left: 7px;
}

.notes {
  font-size: 11px;
  line-height: 1.55;
  color: var(--c-text-muted, #7c8a88);
  overflow-wrap: anywhere;
}

.note-label {
  color: var(--c-primary-soft, #8fadb3);
  margin-right: 5px;
  letter-spacing: 1px;
}

.scene {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.scene-label {
  font-size: 10.5px;
  letter-spacing: 1px;
  color: var(--c-text-muted, #7c8a88);
}

.scene-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.scene-chip {
  font-family: inherit;
  font-size: 11px;
  padding: 2px 8px;
  border: 1px solid var(--c-primary-soft, #8fadb3);
  border-radius: 2px;
  background: transparent;
  color: var(--c-text-muted, #7c8a88);
  cursor: pointer;
}

.scene-chip.is-on {
  color: var(--c-surface-raised, #fff);
  background: var(--c-primary, #35606a);
  border-color: var(--c-primary, #35606a);
}

.send {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.link {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 10.5px;
  color: var(--c-primary-soft, #8fadb3);
  border-bottom: 1px dashed var(--c-primary-soft, #8fadb3);
  cursor: pointer;
}

.text {
  margin: 0;
  padding: 7px 9px;
  font-family: inherit;
  font-size: 11.5px;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  color: var(--c-text, #23302f);
  background: var(--c-surface, #f4f6f5);
  border: 1px dashed var(--c-border, #d5dddb);
}

.actions {
  display: flex;
  gap: 6px;
}

.btn {
  font-family: inherit;
  font-size: 11.5px;
  padding: 3px 14px;
  letter-spacing: 1px;
  color: var(--c-primary, #35606a);
  background: var(--c-surface, #f4f6f5);
  border: 1px solid var(--c-primary-soft, #8fadb3);
  border-radius: 2px;
  cursor: pointer;
}

.btn:hover {
  border-color: var(--c-primary, #35606a);
}

.btn-primary {
  color: var(--c-surface-raised, #fff);
  background: var(--c-primary, #35606a);
  border-color: var(--c-primary, #35606a);
}
</style>