<template>
  <section class="empty">
    <p class="line">店里还没有客人。</p>
    <p class="hint">在输入栏上方的「目标生成器」里掷一支签，或者挑一位熟客让她带朋友来。</p>
  </section>
</template>

<style lang="scss" scoped>
.empty {
  padding: 9px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.line {
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--c-text-muted);
}

.hint {
  font-size: 10.5px;
  line-height: 1.5;
  color: var(--c-primary-soft);
}
</style>