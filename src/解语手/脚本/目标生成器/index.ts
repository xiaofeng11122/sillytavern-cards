import { mountDock } from '@util/dock';
import App from './App.vue';

/**
 * 目标生成器 · 酒馆助手脚本
 *
 * 两条来路：掷签生成陌生新客，或者从名册挑一位熟客让她带朋友来。
 * 界面注入 `#send_form` 之前，跟随输入栏；不注册原生按钮，开合只由签筒条自己负责。
 */
mountDock({
  dockId: 'jy-dock',
  label: '目标生成器',
  component: App,
});