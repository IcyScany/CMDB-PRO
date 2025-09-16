/**
 * 创建 mitt 事件总线：eventBus.js 文件来初始化 mitt，并作为全局事件总线。
 * **/

import mitt from 'mitt';

const eventBus = mitt();

eventBus.on('getTableColumn', () => {
});

export default eventBus;