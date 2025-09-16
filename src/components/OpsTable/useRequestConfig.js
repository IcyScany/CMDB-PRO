/**
 * 请求代理
 * dataKey:绑定数据的key，props:组件属性，emit:组件事件
 * 需要通过props转入的requestConfig进行配置
 * requestConfig对象属性：{ api:请求的方法; params:请求的参数; immediate:是否渲染时就请求}
 */

import { clone, orderBy } from "xe-utils";
import opsTableConfig from "@/components/OpsVxeGrid/util";

export function useRequestConfig({ tableRef, props, emit }) {
    // 状态初始化
    const state = reactive({
        tableAllData: [], // 原始数据
        showData: [], // 展示数据
        filteredData: [], // 过滤后的数据
        searchQuery: '', // 搜索关键词
        loading: false,
        pagination: {
            currentPage: 1,
            pageSize: opsTableConfig['VXE_PAGE_SIZES'][0],
            total: 0,
            pageSizes: opsTableConfig['VXE_PAGE_SIZES'],
            layout: opsTableConfig.VXE_PAGER_LAYOUTS,
        },
    });

    // 计算属性
    const defaultSort = computed(() => {
        return props?.defaultOrder && Object.keys(props?.defaultOrder).length 
            ? props.defaultOrder 
            : {
                field: props?.columns?.[0]?.field || 'id', 
                order: 'desc'
            };
    });

    // 核心方法：数据请求
    async function fetchTableData(params) {
        const response = {
            status: '',
            data: null,
        };

        if (state.loading || typeof props.requestConfig.api !== 'function') {
            response.data = props.data;
        }
        else {
            state.loading = true;
            try {
                const res = await props.requestConfig.api(params ?? props.requestConfig.params);
                let responseData = props?.requestConfig?.accept_field ? res?.[props?.requestConfig?.accept_field] || [] : res;
                response.status = 'success';
                response.data = responseData;
            } catch (e) {
                response.status = 'failed';
                response.data = e;
            } finally {
                state.loading = false;
            }
        }

        state.tableAllData = clone(response.data, true);
        emit('update:fullData', clone(response.data, true));
        updateShowData();

        return response;
    }

    // 核心方法：更新表格数据
    const updateShowData = (resetPage = false) => {
        // 手动出发筛选时需要重置页面
        if (resetPage) {
            state.pagination.currentPage = 1;
        }
        handleFilter(props.filterConditions, state.searchQuery);
        handleSort();
        handlePageChange();
        emit('update:data', state.showData);
    };

    // 数据处理方法：过滤
    const handleFilter = (filterConditions, searchValue = state.searchQuery) => {
        const searchKey = String(searchValue).trim().toLowerCase();
        state.filteredData = clone(state.tableAllData, true);

        // 应用搜索过滤
        if (searchKey) {
            state.filteredData = state.filteredData.filter(item => 
                Object.values(item).some(value => 
                    JSON.stringify(value).toLowerCase().includes(searchKey)
                )
            );
        }

        // 应用条件过滤
        const hasFilterConditions = Object.values(filterConditions).some(item => item);
        if (hasFilterConditions) {
            state.filteredData = state.filteredData.filter(item => 
                Object.entries(filterConditions).every(([key, condition]) => {
                    if (condition === null || condition === undefined || condition === '') {
                        return true;
                    }
                    return String(item[key]).toLowerCase().includes(String(condition).toLowerCase());
                })
            );
        }
       
        state.pagination.total = state.filteredData?.length || 0;
    };
    
    // 数据处理方法：排序
    const handleSort = () => {
        if (props.noSort) {
            return;
        }
        if (tableRef.value) {
            const sortColumns = tableRef.value.getSortColumns();
            if (sortColumns.length) {
                state.filteredData = orderBy(state.filteredData, sortColumns);
            } else {
                state.filteredData = orderBy(state.filteredData, [defaultSort.value]);
            }
        }
    };

    // 数据处理方法：分页
    const handlePageChange = () => {
        const { pageSize, currentPage } = state.pagination;
        state.showData = pageSize === -1 
            ? clone(state.filteredData, true) 
            : clone(state.filteredData, true).slice(
                (currentPage - 1) * pageSize, 
                currentPage * pageSize
            );
    };

    // 对外暴露的请求方法
    const commitRequest = async (params) => {
        await nextTick();
        return await fetchTableData(params);
    };

    return {
        ...toRefs(state),
        updateShowData,
        commitRequest,
    };
}
