import { mountDock } from '@util/dock';
import App from './App.vue';

/**
 * 对话选择器 · 酒馆助手脚本
 *
 * 读最新楼层里 AI 输出的 <ChoiceN> 块，渲染成可点面板。
 * 面板同样注入 `#send_form` 之前，跟随输入栏；不注册原生按钮。
 */
mountDock({
  dockId: 'jy-selector-dock',
  label: '对话选择器',
  component: App,
});