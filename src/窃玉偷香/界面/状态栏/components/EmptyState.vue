<template>
  <section class="empty">
    <p class="line">签筒未动，尚无目标。</p>
    <p class="hint">在输入栏上方展开「目标生成器」，掷一支签。</p>
  </section>
</template>

<style lang="scss" scoped>
.empty {
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.line {
  font-family: var(--font-accent);
  font-size: 13px;
  letter-spacing: 1px;
  color: var(--c-text-muted);
}

.hint {
  font-size: 11px;
  color: var(--c-primary-soft);
}
</style>
