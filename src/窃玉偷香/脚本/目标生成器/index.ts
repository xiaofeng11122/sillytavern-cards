import { createScriptIdDiv, teleportStyle } from '@util/script';
import App from './App.vue';
import { useUiStore } from './store';

/**
 * 目标生成器 · 酒馆助手脚本
 *
 * 界面**跟随输入栏**：注入到 `#send_form` 之前，处在 DOM 流里随输入框一起被推动，
 * 而不是做成消息楼层界面（楼层界面要等输出完毕才渲染，掷签却需要随时能按）。
 */

const DOCK_ID = 'qy-dock';
const RETRY_INTERVAL = 600;
const RETRY_LIMIT = 30;
const GUARD_INTERVAL = 3000;

let $dock: JQuery<HTMLDivElement> | null = null;
let app: ReturnType<typeof createApp> | null = null;
let pinia: ReturnType<typeof createPinia> | null = null;
let style: { destroy: () => void } | null = null;
let retry_timer: number | null = null;
let guard_timer: number | null = null;

/** 放不进去时返回 false，交给外层重试 */
function placeDock($element: JQuery<HTMLDivElement>): boolean {
  const $send_form = $('#send_form');
  if ($send_form.length) {
    $element.insertBefore($send_form);
    return true;
  }
  // 兜底：塞进输入区外壳末尾
  const $form_sheld = $('#form_sheld');
  if ($form_sheld.length) {
    $element.appendTo($form_sheld);
    return true;
  }
  return false;
}

function mount(): boolean {
  if ($dock && document.contains($dock[0])) {
    return true;
  }

  const $element = createScriptIdDiv().attr('id', DOCK_ID) as JQuery<HTMLDivElement>;
  if (!placeDock($element)) {
    $element.remove();
    return false;
  }

  $dock = $element;
  // 脚本的样式只作用于脚本 iframe，须传送到酒馆网页 head
  style = teleportStyle();
  pinia = createPinia();
  app = createApp(App).use(pinia);
  app.mount($dock[0]);
  console.info('[窃玉偷香] 目标生成器已挂载到输入栏上方');
  return true;
}

function teardown() {
  app?.unmount();
  app = null;
  style?.destroy();
  style = null;
  $dock?.remove();
  $dock = null;
  pinia = null;
}

function ensureMounted(attempt = 0) {
  if (mount()) {
    return;
  }
  if (attempt < RETRY_LIMIT) {
    retry_timer = window.setTimeout(() => ensureMounted(attempt + 1), RETRY_INTERVAL);
  } else {
    console.warn('[窃玉偷香] 找不到输入栏, 目标生成器注入失败');
  }
}

/** 酒馆切换布局时可能整块替换输入区，此时把原元素重新放回去即可保住状态 */
function startGuard() {
  if (guard_timer !== null) {
    return;
  }
  guard_timer = window.setInterval(() => {
    if ($dock && document.contains($dock[0])) {
      return;
    }
    if ($dock && placeDock($dock)) {
      return;
    }
    teardown();
    ensureMounted();
  }, GUARD_INTERVAL);
}

$(() => {
  ensureMounted();
  startGuard();

  // 酒馆助手原生按钮：即使注入失败也还能从这里开合面板
  appendInexistentScriptButtons([{ name: '目标生成器', visible: true }]);
  eventOn(getButtonEvent('目标生成器'), () => {
    if (!pinia) {
      ensureMounted();
      return;
    }
    const ui = useUiStore(pinia);
    ui.toggleExpanded();
  });

  $(window).on('pagehide', () => {
    if (retry_timer !== null) {
      window.clearTimeout(retry_timer);
      retry_timer = null;
    }
    if (guard_timer !== null) {
      window.clearInterval(guard_timer);
      guard_timer = null;
    }
    teardown();
  });
});
