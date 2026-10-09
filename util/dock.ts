import { createScriptIdDiv, teleportStyle } from '@util/script';
import type { App as VueApp, Component } from 'vue';

/**
 * 把一段界面挂到酒馆输入栏上方（注入到 `#send_form` 之前）。
 *
 * 为什么不用消息楼层界面：楼层界面要等输出完毕才渲染，而掷签与选项面板都需要
 * **随时能按**，所以放进 DOM 流里跟着输入框走。
 *
 * 两个脚本（目标生成器 / 对话选择器）共用这段逻辑，只靠 dockId 区分，避免各写一份。
 */
export interface DockHandle {
  destroy: () => void;
}

const RETRY_INTERVAL = 600;
const RETRY_LIMIT = 30;
const GUARD_INTERVAL = 3000;

export function mountDock(options: {
  dockId: string;
  label: string;
  component: Component;
  /** 每次重新挂载后调用，用于刷新数据 */
  onRemount?: () => void;
}): DockHandle {
  const { dockId, label, component, onRemount } = options;

  let $dock: JQuery<HTMLDivElement> | null = null;
  let app: VueApp | null = null;
  let style: { destroy: () => void } | null = null;
  let retryTimer: number | null = null;
  let guardTimer: number | null = null;

  /** 放不进去时返回 false，交给外层重试 */
  const place = ($element: JQuery<HTMLDivElement>): boolean => {
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
  };

  const mount = (): boolean => {
    if ($dock && document.contains($dock[0])) {
      return true;
    }

    const $element = createScriptIdDiv().attr('id', dockId) as JQuery<HTMLDivElement>;
    if (!place($element)) {
      $element.remove();
      return false;
    }

    $dock = $element;
    // 脚本的样式只作用于脚本 iframe，须传送到酒馆网页 head
    style = teleportStyle();
    app = createApp(component).use(createPinia());
    app.mount($dock[0]);
    onRemount?.();
    console.info(`[解语手] ${label}已挂载到输入栏上方`);
    return true;
  };

  const teardown = () => {
    app?.unmount();
    app = null;
    style?.destroy();
    style = null;
    $dock?.remove();
    $dock = null;
  };

  const ensureMounted = (attempt = 0) => {
    if (mount()) {
      return;
    }
    if (attempt < RETRY_LIMIT) {
      retryTimer = window.setTimeout(() => ensureMounted(attempt + 1), RETRY_INTERVAL);
    } else {
      console.warn(`[解语手] 找不到输入栏, ${label}注入失败`);
    }
  };

  /** 酒馆切换布局时可能整块替换输入区，此时把原元素重新放回去即可保住状态 */
  const startGuard = () => {
    guardTimer = window.setInterval(() => {
      if ($dock && document.contains($dock[0])) {
        return;
      }
      if ($dock && place($dock)) {
        return;
      }
      teardown();
      ensureMounted();
    }, GUARD_INTERVAL);
  };

  $(() => {
    ensureMounted();
    startGuard();
  });

  $(window).on('pagehide', () => {
    if (retryTimer !== null) {
      window.clearTimeout(retryTimer);
      retryTimer = null;
    }
    if (guardTimer !== null) {
      window.clearInterval(guardTimer);
      guardTimer = null;
    }
    teardown();
  });

  return { destroy: teardown };
}