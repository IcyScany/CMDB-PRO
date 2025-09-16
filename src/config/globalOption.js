// 一些全局常量
const ADD_TYPE = 1; // 新增
const EDIT_TYPE = 2; // 编辑
const INFO_TYPE = 3; // 查看详情

const VXE_PAGE_SIZES = [20, 50, 100, {label: '全部', value: -1}]; // 分页选项

const LAYER_ZINDEX_TOP = 20000; // 顶层弹窗zIndex
const LAYER_ZINDEX_MIDDLE = 10000; // 中层弹窗zIndex

const WEBSOCKET_CONNECTING = 0; // websocket状态码
const WEBSOCKET_OPEN = 1;
const WEBSOCKET_CLOSING = 2;
const WEBSOCKET_CLOSED = 3;
const WEBSOCKET_STATE = {
    [WEBSOCKET_CONNECTING]: {
        name: 'CONNECTING',
        desc: '正在连接中...',
        color: '#108ee9',
    },
    [WEBSOCKET_OPEN]: {
        name: 'OPEN',
        desc: '已连接',
        color: '#2dce89',
    },
    [WEBSOCKET_CLOSING]: {
        name: 'CLOSING',
        desc: '连接正在关闭...',
        color: '#f50',
    },
    [WEBSOCKET_CLOSED]: {
        name: 'CLOSED',
        desc: '连接已关闭或连接失败',
        color:'#f00',
    }
};
const ALERT_LEVEL = ['P0', 'P1', 'P2', 'P3']; // 告警级别
const VIEW_CHART = 1; // 视图模式
const VIEW_TABLE = 2; // 列表模式
const CHART_PAGE_SIZES = 12; // 视图模式的分页规格



export {
    ADD_TYPE,
    EDIT_TYPE,
    VXE_PAGE_SIZES,
    LAYER_ZINDEX_TOP,
    LAYER_ZINDEX_MIDDLE,
    WEBSOCKET_CONNECTING,
    WEBSOCKET_OPEN,
    WEBSOCKET_CLOSING,
    WEBSOCKET_CLOSED,
    WEBSOCKET_STATE,
    ALERT_LEVEL,
    INFO_TYPE,
    VIEW_CHART,
    VIEW_TABLE,
    CHART_PAGE_SIZES,
};
