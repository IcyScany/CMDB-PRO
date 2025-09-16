<script setup>
import tableRender from "@/composables/table/tableRender";
import { apiList } from "@/api/db/rdsApi";
import opsTableConfig from "@/components/OpsVxeGrid/util";
import dayjs from 'dayjs';
import { VAceEditor } from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

const props = defineProps({
    sid: {
        type: [String, Number],
        default: ''
    },
});

const tableRef = ref(null);
const TITLE_LAYER = 5;
const TAB_LIST = {
    slowLog: {
        title: '统计分析',
        block: 2,
        api: apiList.log.postLogStatisticsList
    },
    logDetail: {
        title: '日志明细',
        block: 1,
        api: apiList.log.postLogDetailList
    },
};

// 状态管理
const state = reactive({
    tableData: [],
    initColumn: [],
    initButton: [],
    initTitleData: [],
    activeKey: 'slowLog',
    searchParams: {
        database: '',
        type: '',
        date: [
            dayjs().subtract(1, 'days'),
            dayjs()
        ]
    },
    showSQL: false,
    sqlText: ''
});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'query_sample':
                col.slots = {
                    default: field
                };
                break;
            case 'rds_instance':
                col.slots = {
                    default: field
                };
                col.visible = !props.sid;
                break; 
        }
    }
    return state.initColumn.filter(col => {
        return col.oriTitle.block === TAB_LIST[state.activeKey].block;
    });
});

// 类型选项
const typeOptions = computed(() => {
    let options = Object.entries(state.initTitleData?.type || {}).map(([key, value]) => {
        return {
            label: value,
            value: key
        };
    });

    return [
        { label: '全部', value: '' },
        ...options
    ];
});

// 格式化时间
const formatCustomISO = (dateStr) => {
    const d = dayjs(dateStr).add(8, 'hour');
    return d.format('YYYY-MM-DDTHH:mm:ss+0800');
};

// 添加 SQL 格式化函数
const formatSQL = (sql) => {
    if (!sql) return '';
    
    // 将 SQL 按关键字分割并添加换行
    return sql
        .replace(/\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|UNION|INSERT INTO|UPDATE|DELETE FROM)\b/gi, '\n$1')
        .replace(/\b(AND|OR)\b/gi, '\n  $1')
        .replace(/,/g, ',\n  ')
        .trim();
};

onMounted(async () => {
    const { button, columns, title_data, order, title_field_search } = await tableRender.setColumn({ layer: TITLE_LAYER, tableType: 'server' });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || [];
    state.tableOrder = order.value || {};
    state.titleFieldSearch = title_field_search || {};
    
    await initData();
});

// 表格数据的获取
const handleDataRefresh = async (pageAction) => {
    if (!tableRef.value || !state.searchParams.date.length) { return; }
    tableRef.value.tableLoading = true;

    const { api } = TAB_LIST[state.activeKey];
    const pagination = tableRef.value.vxeGridRef.pagerConfig;
    const baseParams = {
        database: state.searchParams.database,
        type: state.searchParams.type,
        start_time: formatCustomISO(state.searchParams.date[0]),
        end_time: formatCustomISO(state.searchParams.date[1]),
        limit: pagination.pageSize,
    };

    try {
        const result = await fetchTableData(api, baseParams, pagination, pageAction);
        updateTableState(result, pagination);
    } finally {
        tableRef.value.tableLoading = false;
        tableRef.value.commitRequest();
    }
};

// 获取表格数据
const fetchTableData = async (api, baseParams, pagination, pageAction) => {
    const params = { ...baseParams };
    
    if (state.activeKey === 'logDetail') {
        if (pageAction) {
            params.line_num = pageAction === 'next' 
                ? state.tableData[state.tableData.length - 1]?.line_num 
                : state.tableData[0]?.line_num;
            pagination.currentPage += pageAction === 'next' ? 1 : -1;
        }
    } else {
        params.offset = (pagination.currentPage - 1) * pagination.pageSize;
    }

    return await api(props.sid, params);
};

// 更新表格状态
const updateTableState = (res, pagination) => {
    if (state.activeKey === 'logDetail') {
        state.tableData = [
            ...Array((pagination.currentPage - 1) * pagination.pageSize),
            ...res.data.slow_log_list
        ];
        pagination.total = res.data.slow_log_list.length;
        pagination.slots = { left: 'pagerLeft' };
        pagination.layouts = opsTableConfig.VXE_PAGER_LAYOUTS.slice(7,8);
    } else {
        const offset = (pagination.currentPage - 1) * pagination.pageSize;
        state.tableData = [
            ...Array(offset),
            ...res.data.slow_log_list,
            ...Array(res.data?.total_count - offset - res.data.slow_log_list.length)
        ];
        pagination.total = res.data?.total_count;
        pagination.layouts = opsTableConfig.VXE_PAGER_LAYOUTS;
        pagination.slots = null;
    }
};

// 初始化数据
const initData = async () => {
    let pagination = tableRef.value.vxeGridRef.pagerConfig;
    pagination.pageSizes = [10, ...opsTableConfig.VXE_PAGE_SIZES_SERVER];
    pagination.currentPage = 1;
    pagination.pageSize = 10;
    pagination.total = 0;

    await handleDataRefresh();
};

// 分页处理
const pageChange = ({ pageSize, currentPage }) => {
    let pagination = tableRef.value.vxeGridRef.pagerConfig;
    pagination.pageSize = pageSize;
    pagination.currentPage = currentPage;

    handleDataRefresh();
};

// 监听sid, activeKey
watch(() => props.sid, () => {
    initData();
});
watch(() => state.activeKey, () => {
    state.searchParams = {
        database: '',
        type: '',
        date: [
            dayjs().subtract(1, 'days'),
            dayjs()
        ]
    };
    initData();
});

// 修改复制处理函数
const handleCopy = (text) => {
    state.showSQL = true;
    state.sqlText = formatSQL(text);
};

// 添加编辑器配置
const editorOptions = {
    fontSize: 13,
    showPrintMargin: false,
    showLineNumbers: true,
    tabSize: 4,
    highlightActiveLine: false,
    readOnly: true
};

</script>

<template>
    <vxe-button v-for="(item, key) in TAB_LIST" :key="key" size="small" @click="state.activeKey = key">
        <span class="ml-1" :class="{ 'text-primary': state.activeKey === key }">{{ item.title }}</span>
    </vxe-button>

    <ops-table
        ref="tableRef"
        :data="state.tableData"
        :columns="initTableColumns"
        :show-search="false"
        :no-sort="true"
        @page-change="pageChange"
        @page-size-change="pageChange"
    >
        <!-- 工具栏搜索 -->
        <template #toolSearchPrefix>
            <div class="search-box">
                <a-input 
                    v-model:value="state.searchParams.database" 
                    placeholder="请输入数据库名称"
                    @blur="initData(null)"
                    @keyup.enter="initData(null)"
                />
                <a-select 
                    v-model:value="state.searchParams.type" 
                    placeholder="请选择类型"
                    :options="typeOptions"
                    @change="initData(null)"
                />
                <a-range-picker
                    v-model:value="state.searchParams.date"
                    show-time
                    :allow-clear="false"
                    format="YYYY/MM/DD HH:mm:ss"
                    @change="initData(null)"
                />
            </div>
        </template>

        <template #query_sample="{row}">
            <span style="max-width: calc(100% - 20px);" class="truncate inline-block">
                {{ row?.query_sample }}
            </span>
            <a-typography-paragraph 
                class="inline absolute top-1/2 -translate-y-1/2" 
                :copyable="{ tooltip: false, text: row?.query_sample, onCopy: () => handleCopy(row?.query_sample) }"
            >
                <template #copyableIcon>
                    <SearchOutlined />
                </template>
            </a-typography-paragraph>
        </template>

        <!-- 分页 -->
        <template #pagerLeft>
            <div class="flex items-center gap-2 cursor-pointer">
                <span 
                    v-if="tableRef.vxeGridRef.pagerConfig.currentPage > 1" 
                    @click="handleDataRefresh('prev')"
                >
                    上一页
                </span>
                <span class="text-primary">
                    {{ tableRef.vxeGridRef.pagerConfig.currentPage }}
                </span>
                <span @click="handleDataRefresh('next')">
                    下一页
                </span>
            </div>
        </template>
    </ops-table>

    <a-modal
        v-model:open="state.showSQL"
        width="50%"
        centered
        :footer="null"
    >
        <template #title>
            <span> SQL 预览 </span>
            <a-typography-paragraph 
                class="inline" 
                :copyable="{ tooltip: false, text: state.sqlText }"
            />
        </template>
        <a-divider />
        <v-ace-editor
            v-model:value="state.sqlText"
            lang="sql"
            theme="github"
            style="height: 500px"
            :options="editorOptions"
        />
    </a-modal>
</template>

<style scoped lang="less">
.search-box {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-right: 10px;

    .ant-input {
        width: 200px;
    }

    .ant-select {
        width:200px;
    }

    .ant-range-picker {
        width: 250px;
    }
}

.sql-text {
    color: #606266;
    display: inline-block;
    max-width: calc(100% - 30px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
