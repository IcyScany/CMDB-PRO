
const SYSTEM_CONFIG = {
    OPS_SYSTEM_LOGO: '/src/assets/images/OpsCenter_logo.png',

    NEXT_URL: (next) => { // 无权限页
        return encodeURIComponent(next ? next : window.location.href);
    },
    NO_AUTH_URL: `${import.meta.env.VITE_BASE_URL}error403`,
    NO_NEED_V3_CONFIG:
        {
            baseURL: import.meta.env.VITE_BASE_LOGIN_API
        },
    HEADER_CONFIG: {
        noErrorTip: true
    },// 请求里面无需提示

    TABLE_MODE: { // 表格的模式
        SERVER: 'server', // 服务器端
        CLIENT: 'client', // 客户端
    },

    FORM_TYPE: { // 表单类型
        ADD_TYPE: 1, // 新增
        EDIT_TYPE: 2, // 编辑
        INFO_TYPE: 3, // 查看
    },
    SYSTEM_SET:{
        LAYOUT_ENUM: { // 系统的布局
            BASIC: 'basic',
            TOP: 'top',
            MIXED: 'mixed',
        },
        GLOBAL_SET: {
            LAYOUT: 'top',
            // 菜单是否折叠
            MENU_COLLAPSE: false,
            // 是否开启展示面包屑
            BREADCRUMB_OPEN: true,
            // 顶栏主题色通栏
            TOP_HEADER_THEME_COLOR_SPREAD: true,

        }
    },
    LAYER_ZINDEX_TOP: 20000,
    LAYER_ZINDEX_MIDDLE: 10000,

    VIEW_CHART: 'view_chart',
    VIEW_TABLE: 'view_table',
    DIFF_TYPE_VIEW: [ // 不同类型的渲染页面
        {
            value: 'view_chart',
            payload: {
                title: '视图',
                icon: 'vxe-icon-row-col',
            }
        },
        {
            value: 'view_table',
            payload: {
                title: '列表',
                icon: 'vxe-icon-table',
            }
        }
    ],
    CONDITION_TYPE:[
        {
            "label": "等于",
            "value": "="
        },
        {
            "label": "in(包含)",
            "value": "in"
        },
        {
            "label": "大于等于",
            "value": ">="
        },
        {
            "label": "小于等于",
            "value": "<="
        },
        {
            "label": "什么开始",
            "value": "start"
        },
        {
            "label": "什么结束",
            "value": "end"
        },
        {
            "label": "模糊查询",
            "value": "vague"
        }
    ],
    MENU_GROUP: [
        {
            "label": "仪表盘",
            "value": "dashboards",
            "subtitle": "数据展示大屏",
            "imgUrl": "https://gw.alipayobjects.com/zos/alicdn/f-SbcX2Lx/Table.svg",
            tag: {
                label: '热门',
                type: 'blue'
            }
        },
        {
            "label": "云管平台",
            "value": "cloud_manage",
            "subtitle": "提供统一的云资源管理解决方案，支持阿里云、华为云以及自建私有云。平台不仅能够自动同步云上的数据到系统，还集成了自动化运维、监控等功能，实现高效的云资源管理和运维",
            "imgUrl": "https://gw.alipayobjects.com/zos/alicdn/f-SbcX2Lx/Table.svg",
            tag: {
                label: '热门',
                type: 'blue'
            }
        },
        {
            "label": "监控|告警",
            "value": "monitoring_alert",
            "subtitle": "实时监控系统状态，及时发现异常",
            "imgUrl":"https://mdn.alipayobjects.com/huamei_7uahnr/afts/img/A*SMzgSJZE_AwAAAAAAAAAAAAADrJ8AQ/original",
            tag: {
                label: '推荐',
                type: 'green'
            }
        },
        {
            "label": "安全",
            "value": "security",
            "subtitle": "保护您的业务安全，确保数据安全",
            "imgUrl": "https://img.alicdn.com/imgextra/i4/O1CN01vaYfo71rY5MJapzCh_!!6000000005642-1-tps-3840-740.gif",
            tag: {
                label: '新上线',
                type: 'orange'
            }
        },
        {
            "label": "数据桥接",
            "value": "data_linking",
            "subtitle": "精细化管理用户权限，确保操作合规",
            "imgUrl": "https://gw.alipayobjects.com/zos/alicdn/f-SbcX2Lx/Table.svg",
            tag: {
                label: '基础版',
                type: 'pink'
            }
        },
        {
            "label": "用户|权限",
            "value": "user_per",
            "subtitle": "精细化管理用户权限，确保操作合规",
            "imgUrl": "https://gw.alipayobjects.com/zos/alicdn/f-SbcX2Lx/Table.svg",
            tag: {
                label: '基础版',
                type: 'pink'
            }
        },
        {
            "label": "物理设备",
            "value": "physical_device",
            "subtitle": "精细化管理用户权限，确保操作合规",
            "imgUrl": "https://gw.alipayobjects.com/zos/alicdn/f-SbcX2Lx/Table.svg",
            tag: {
                label: '基础版',
                type: 'pink'
            }
        }

    ],
    MENU_GROUP_TYPE: {
        dashboards: {
            "imgUrl": "/images/product-dashboards.png",
            tag: {
                label: '热门',
                type: 'blue'
            }
        },
        cloud_manage: {
            "imgUrl": "/images/product-cloud-manage.png",
            tag: {
                label: '热门',
                type: 'blue'
            }
        },
        monitoring_alert: {
            "imgUrl":"/images/product-monitoring-alert.png",
            tag: {
                label: '推荐',
                type: 'green'
            }
        },
        security: {
            "imgUrl": "/images/product-security.png",
            tag: {
                label: '新上线',
                type: 'orange'
            }
        },
        user_per: {
            "imgUrl": "/images/product-user-per.png",
            tag: {
                label: '基础版',
                type: 'pink'
            }
        },
        physical_device: {
            "imgUrl": "/images/physical_device.png",
            tag: {
                label: '基础版',
                type: 'pink'
            }
        },
        data_linking: {
            "imgUrl": "/images/data_linking.png",
            tag: {
                label: '基础版',
                type: 'pink'
            }
        }
    },
    ALERT_LEVEL_COLOR: {
        P0: {
            color: '#f58181',
            textColor: '#fff',
        },
        P1: {
            color: '#f89278',
            textColor: '#fff',
        },
        P2: {
            color: '#f8b480',
            textColor: '#fff',
        },
        P3: {
            color: '#f8da99',
            textColor: '#fff',
        },
    },
    ALERT_LEVEL: ['P0', 'P1', 'P2', 'P3'],
    WEBSOCKET_STATE: {
        0: {
            name: 'CONNECTING',
            desc: '正在连接中...',
            color: '#108ee9',
        },
        1: {
            name: 'OPEN',
            desc: '已连接',
            color: '#2dce89',
        },
        2: {
            name: 'OPEN',
            desc: '连接正在关闭...',
            color: '#f50',
        },
        3: {
            name: 'CLOSED',
            desc: '连接已关闭或连接失败',
            color:'#f00',
        }
    }
};

export default SYSTEM_CONFIG;
