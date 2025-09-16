/**
 *  服务器端模式与客户端模式使用表格方面的不同点
 *  客户端 GET： 后端将数据一次性的全返回，分页前端、搜索前端，通过修改其配置的data进行数据的渲染
 *  服务器端 POST：按照代理的配置进行获取返回的数据
 * ***/



const defaultConfig = { // 客户端模式与服务器端模式的表格给予的默认配置
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
    proxyConfig: {
        ajax: {
            opsSystemGetTableColumn: () => {
            },
        }
    },
    MENU_TITLE_BUTTON: {}
};



export default {
    gridOptions: {
        ...defaultConfig
    },

    serverVxeTable({condition, order, server_api, callback = null}) { // 服务器端表格处理
        let queryData = ref({});
        let currentOrder = isRef(order) ? computed(() => order.value) : computed(() => order);
        
        let config = {
            enabled: true,
            autoLoad: false,
            form: true,
            sort: true,
            response: {
                result: 'data',
                total: 'recordsFiltered',
                message: ({data}) => {
                    return data.msg;
                }
            },
            ajax: {
                query: ({ page, sorts }) => {
                    let query_condition = [];
                    // 处理响应式的查询条件
                    const currentCondition = isRef(condition) ? condition.value : condition;
                    
                    if (currentCondition && currentCondition.length > 0) {
                        query_condition = currentCondition.map(item => ({
                            field: item.field,
                            condition: item.condition,
                            value: item.value
                        }));
                    }

                    queryData.value = {
                        page_number: page.currentPage,
                        page_limit: page.pageSize,
                        query_condition,
                        sort_field: sorts?.[0]?.property || currentOrder?.value?.field || 'id',
                        sort_order: sorts?.[0]?.order && String(sorts?.[0]?.order).toUpperCase() || currentOrder?.value?.order && String(currentOrder?.value?.order).toUpperCase() || 'DESC',
                    };
                    
                    return server_api(queryData.value);
                },
                querySuccess: (data) => {
                    if (callback) { // 获取返回的所有的数据
                        callback(data);
                    }
                    return data;
                }
            },
        };
        
        return {
            config,
            queryData,
        };
    },
    VXE_PAGE_SIZES: [20, 50, 100, {label: '全部', value: -1}], // 分页选项
    VXE_PAGE_SIZES_SERVER: [20, 50, 100], // 分页选项-服务端表格
    VXE_PAGER_LAYOUTS: ['Home', 'PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'End', 'Sizes', 'FullJump', 'Total'], // vxe分页layout
};
