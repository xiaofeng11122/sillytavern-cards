<template>
  <div class="inner">
    <header class="bar" @click="ui.toggleExpanded()">
      <span class="tube" aria-hidden="true">签</span>
      <span class="title">客源</span>
      <span class="summary">{{ summary }}</span>
      <span v-if="rosterCount" class="badge">名册 {{ rosterCount }}</span>
      <span class="flip">{{ ui.expanded ? '收起' : '展开' }}</span>
    </header>

    <Transition name="unfold">
      <div v-if="ui.expanded" class="body">
        <div class="field">
          <span class="field-label">职业池</span>
          <PoolChips v-model="ui.pools" />
        </div>

        <div class="field">
          <span class="field-label">年龄段</span>
          <AgeChips v-model="ui.ageIndex" />
        </div>

        <div class="tabs">
          <button
            v-for="tab in TABS"
            :key="tab.value"
            type="button"
            class="tab"
            :class="{ 'is-on': mode === tab.value }"
            @click="mode = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>

        <template v-if="mode === '自约'">
          <div class="draw">
            <button type="button" class="btn btn-primary" @click="draw">掷一支签</button>
            <span v-if="!ui.slip" class="hint">签筒里装的是这座城里各式各样的女人。</span>
          </div>
        </template>

        <template v-else>
          <p v-if="!referrer" class="hint">先在下面的名册里挑一位熟客，让她带朋友来。</p>
          <p v-else class="picked">
            让 <b>{{ referrer }}</b> 带一位朋友来
            <button type="button" class="link" @click="referrer = ''">换一位</button>
          </p>
          <div class="draw">
            <button type="button" class="btn btn-primary" :disabled="!referrer" @click="draw">让她带朋友来</button>
          </div>
        </template>

        <GuestSlip
          v-if="ui.slip"
          :guest="ui.slip"
          :scene="ui.scene"
          @adopt="adopt"
          @redraw="draw"
          @update:scene="value => (ui.scene = value)"
        />

        <RosterPanel :roster="roster" @refer="pickReferrer" @hand-over="handOver" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import AgeChips from './components/AgeChips.vue';
import GuestSlip from './components/GuestSlip.vue';
import PoolChips from './components/PoolChips.vue';
import RosterPanel from './components/RosterPanel.vue';
import { AGE_BANDS, asSelfBooked, drawGuest, drawReferredGuest } from './data';
import { buildOpeningText } from './narrative';
import {
  adoptGuest,
  archiveCurrentGuest,
  handRosterToNarrator,
  linkReferral,
  putTextIntoInput,
  takenNames,
  useRoster,
  useStatData,
  useUiStore,
} from './store';

const TABS = [
  { value: '自约' as const, label: '掷签 · 新客自己预约' },
  { value: '引荐' as const, label: '熟人引荐 · 她带朋友来' },
];

const ui = useUiStore();
const { statData, reload } = useStatData();
const { roster, reload: reloadRoster } = useRoster();

const mode = ref<'自约' | '引荐'>('自约');
const referrer = ref('');
const shaking = ref(false);

const currentName = computed(() => String(_.get(statData.value, '当前客人.姓名', '') ?? ''));
const rosterCount = computed(() => Object.keys(roster.value).length);

const summary = computed(() => {
  if (currentName.value) {
    return `店里 · ${currentName.value}`;
  }
  return '还没有客人';
});

const pickReferrer = (name: string) => {
  referrer.value = name;
  mode.value = '引荐';
  ui.expanded = true;
};

/** 掷签或让熟人引荐，两位都由这里产生 */
const draw = () => {
  const taken = takenNames(statData.value, roster.value);
  const ageRange = AGE_BANDS[ui.ageIndex]?.range ?? null;

  let guest;
  if (mode.value === '引荐') {
    if (!referrer.value) {
      toastr.warning('先在名册里挑一位熟客', '客源');
      return;
    }
    const entry = roster.value[referrer.value];
    guest = drawReferredGuest({
      pools: ui.pools,
      ageRange,
      taken,
      referrer: { 姓名: referrer.value, pool: entry?.圈层, 知情: entry?.关系状态 === '情人' },
    });
  } else {
    const drawn = drawGuest({ pools: ui.pools, ageRange, taken });
    guest = drawn ? asSelfBooked(drawn) : null;
  }

  if (!guest) {
    toastr.warning('这一类里没有合年纪的人，放宽些再抽', '客源');
    return;
  }

  shaking.value = true;
  window.setTimeout(() => {
    ui.slip = guest;
    shaking.value = false;
  }, 420);
};

const adopt = () => {
  if (!ui.slip) {
    return;
  }
  const guest = ui.slip;

  // 换人前先把上位客人归档
  const archived = archiveCurrentGuest(statData.value);
  adoptGuest(guest, ui.scene);

  // 引荐链：把新客人记进引荐人的「带过的人」
  if (guest.来路 === '熟人引荐' && guest.引荐人) {
    linkReferral(guest.引荐人, guest.姓名);
  }

  const ok = putTextIntoInput(buildOpeningText(guest));

  ui.slip = null;
  ui.expanded = false;
  referrer.value = '';
  reload();
  reloadRoster();

  const head = archived ? `已把 ${archived} 记进名册，${guest.姓名} 立为新客` : `已请 ${guest.姓名} 进来`;
  if (ok) {
    toastr.success(`${head}；话已放进输入栏，看过再发`, '客源');
  } else {
    toastr.warning(`${head}；但没找到输入栏，话没能自动填入`, '客源');
  }
};

const handOver = () => {
  if (handRosterToNarrator(roster.value)) {
    toastr.success('名册已放进输入框，按你的意思发出去', '客源');
    return;
  }
  toastr.warning('名册还空着', '客源');
};
</script>

<style>
#jy-dock {
  --c-surface: #f4f6f5;
  --c-surface-raised: #ffffff;
  --c-primary: #35606a;
  --c-primary-soft: #8fadb3;
  --c-accent: #b0645f;
  --c-secondary: #b8823c;
  --c-text: #23302f;
  --c-text-muted: #7c8a88;
  --c-border: #d5dddb;
  --font-body: 'PingFang SC', 'Hiragino Sans GB', 'Source Han Sans SC', 'Noto Sans CJK SC', 'Microsoft YaHei', sans-serif;
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

#jy-dock *,
#jy-dock *::before,
#jy-dock *::after {
  box-sizing: border-box;
}
</style>

<style lang="scss" scoped>
.inner {
  border: 1px solid var(--c-border);
  border-radius: 2px;
  background: var(--c-surface);
  overflow: hidden;
}

.bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 9px;
  cursor: pointer;
  user-select: none;
}

.bar:hover {
  background: rgba(53, 96, 106, 0.07);
}

.tube {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  font-size: 11px;
  color: var(--c-surface-raised);
  background: var(--c-primary);
  border-radius: 2px;
}

.title {
  font-size: 12px;
  letter-spacing: 2px;
  color: var(--c-primary);
  white-space: nowrap;
}

.summary {
  flex: 1;
  min-width: 0;
  font-size: 11px;
  color: var(--c-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge {
  flex: 0 0 auto;
  font-size: 10px;
  color: var(--c-primary);
  border: 1px solid var(--c-primary-soft);
  padding: 0 5px;
}

.flip {
  flex: 0 0 auto;
  font-size: 11px;
  color: var(--c-primary-soft);
}

.body {
  padding: 8px 9px 9px;
  border-top: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.field-label {
  flex: 0 0 auto;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--c-text-muted);
}

.tabs {
  display: flex;
  gap: 4px;
}

.tab {
  font-family: inherit;
  font-size: 11.5px;
  padding: 3px 12px;
  letter-spacing: 1px;
  color: var(--c-text-muted);
  background: transparent;
  border: 1px solid var(--c-border);
  border-radius: 2px;
  cursor: pointer;
}

.tab.is-on {
  color: var(--c-surface-raised);
  background: var(--c-primary);
  border-color: var(--c-primary);
}

.draw {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.hint {
  font-size: 10.5px;
  color: var(--c-text-muted);
}

.picked {
  font-size: 11.5px;
  color: var(--c-text);
}

.picked b {
  color: var(--c-primary);
}

.link {
  margin-left: 6px;
  padding: 0;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 10.5px;
  color: var(--c-primary-soft);
  border-bottom: 1px dashed var(--c-primary-soft);
  cursor: pointer;
}

.btn {
  font-family: inherit;
  font-size: 11.5px;
  padding: 3px 14px;
  letter-spacing: 1px;
  color: var(--c-primary);
  background: var(--c-surface-raised);
  border: 1px solid var(--c-primary-soft);
  border-radius: 2px;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  color: var(--c-surface-raised);
  background: var(--c-primary);
  border-color: var(--c-primary);
}

.unfold-enter-active,
.unfold-leave-active {
  transition: opacity 220ms var(--ease-gentle);
  overflow: hidden;
}

.unfold-enter-from,
.unfold-leave-to {
  opacity: 0;
}
</style>