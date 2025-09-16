export const tableProps = {
    /** 数据 */
    data: {
        type: Array,
        default: undefined
    },
    /** 列配置 */
    columns: {
        type: Array,
        default: () => []
    },
    /** 新增编辑授权的按钮的field **/
    authBtn: {
        type: Object,
        default: () => ({}),
    },
    /** 加载 */
    loading: {
        type: Boolean,
        default: false
    },
    /** api请求配置 */
    requestConfig: {
        type: Object,
        default: () => ({})
    },
    /** 列批量配置 */
    columnsConfig: {
        type: Object,
        default: () => ({})
    },
    /** 工具栏配置 */
    toolbarConfig: {
        type: Object,
        default: () => ({})
    },
    /** 树结构配置 */
    treeConfig: {
        type: Object,
        default: undefined
    },
    /** 滑块按钮请求的api配置**/
    switchClickStatusConfig: {
        type: Object,
        default: () => ({})
    },
    /** 表格的默认排序**/
    defaultOrder: {
        type: Object,
        default: () => ({})
    },
    isShowDoc: { // 是否显示文档说明
        type: Boolean,
        default: false,
    },
    showEnvSearch: { // 是否显示环境过滤搜索
        type: Object,
        default: () => ({}),
    },
    isShowSync: { // 数据同步按钮
        type: Object,
        default: () => ({}),
    },
    /** 全局筛选方法 */
    filterConditions: {
        type: Object,
        default: () => ({}),
    },
    showSearch: { // 是否显示搜索
        type: Boolean,
        default: true,
    },
    noSort: { // 是否不排序
        type: Boolean,
        default: false,
    },
};

// 表格事件
export const tableEmits = [
    'select',
    'refresh',
    'update:data',
    'userEdit',
    'userAdd',
    'userDel',
    'update:fullData',
    'update:filterConditions',
];

export const defaultConfig = {
    size: 'small',
    border: 'inner',
    maxHeight: '100%',
    width: 'auto',
    autoResize: true,
    round: true,
    stripe: true, // 斑马条纹样式
    showHeaderOverflow: 'tooltip',
    cellConfig: {
        height: 'auto',
    },
    headerCellConfig:{
        height:'30px',
    },
    rowConfig: {
        isHover: true,
        isCurrent: true,
        useKey: true,
    }, // hover高亮、选中高亮
    columnConfig: {
        resizable: true,
        useKey: true,
    }, // 拖动列宽
    customConfig: { // 自定义列保存到localstorage
        immediate: true,
        storage: {
            visible: true,
            sort: true,
            fixed: true,
        },
    },
};
