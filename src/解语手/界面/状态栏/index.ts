import { waitUntil } from 'async-wait-until';
import App from './App.vue';
import './global.css';

$(async () => {
  // 两道等待：MVU 框架就绪 → stat_data 落表
  await waitGlobalInitialized('Mvu');
  await waitUntil(() => _.has(getVariables({ type: 'message' }), 'stat_data'));
  createApp(App).use(createPinia()).mount('#app');
  console.info('[解语手] 状态栏已挂载');
});