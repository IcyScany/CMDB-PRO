import { createApp } from 'vue';
import router from "./router";
import { createPinia } from 'pinia';
import piniaPersist from 'pinia-plugin-persist';
import App from './App.vue';
import eventBus from '@/utils/eventBus';
import opsCenter from './opsCenter';
import directives from "./directive";

import './tailwind.css';


const pinia = createPinia();
pinia.use(piniaPersist);
const app = createApp(App);
app.use(pinia);
app.use(router);

// 将 mitt 实例挂载到全局属性
app.config.globalProperties.$bus = eventBus;

app.use(opsCenter);
app.use(directives);
app.mount('#app');
