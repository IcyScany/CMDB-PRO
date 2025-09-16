<script setup>
import opsTableConfig from "./util/index";
import { useSlots } from "vue";
import ServerTableSearch from "./serverTableSearch.vue";
import { userCommonMessageStore } from '@/stores';

const slots = useSlots();
const renderSlots = Object.keys(slots);
const serverTableRef = ref(null);

let props = defineProps({
    tableColumn: { // 表格的列
        type: Array,
        default: () => [],
    },
    authBtn: { // 新增编辑授权的按钮的field
        type: Object,
        default: () => ({}),
    },
    data: { // 表格的数据
        type: Array,
        default: () => [],
    },
    order: {
        type: Object,
        default: () => ({}),
    },
    queryApi:{
        type: [Function, Promise],
        default: () => {},
    },
    switchClickStatusConfig: { // 表格中switch点击触发的请求
        type: Object,
        default: () => ({}),
    },
  
    titleFieldSearch: { // 表格的title字段搜索
        type: Array,
        default: () => [],
    },
    defaultSearchField: { // 默认搜索字段
        type: Object,
        default: () => ({}),
    },
    defaultQueryCondition: { // 默认的查询条件
        type: Array,
        default: () => [],
    },
    
});
const { data, authBtn, tableColumn, order, queryApi,  titleFieldSearch, defaultSearchField, defaultQueryCondition} = toRefs(props);

let emits = defineEmits(['userEdit', 'userAdd', 'userDel', 'getData', 'refreashData', 'proxyQueryAllResult', 'searchCondition']);


// 当前页的数据
let paginatedData = ref(data.value || []);
// 新增、编辑、删除按钮的权限
let needPermissionBtn = computed(() => authBtn.value);

let queryCondition = ref([]);

let serverTableTools = [
    { code: 'query', icon: 'vxe-icon-repeat',iconLoading: 'vxe-icon-refresh roll',circle: true},
    { code: 'myToolbarCustom', icon: 'vxe-icon-custom-column',circle: true},
];

let envSearchCondition = ref([]); // 环境搜索条件
let userCommonStore = userCommonMessageStore();
let currentMenu = computed(() => userCommonStore?.current_user_menu?.current_menu);
// 表格的配置
let gridOption = reactive({
    ...opsTableConfig.gridOptions,
    filterConfig: {
        showIcon: true,
    },
    proxyConfig: {
        ...opsTableConfig.serverVxeTable({
            condition: queryCondition,  // 传入响应式的 queryCondition
            order: order,
            server_api: queryApi.value,
            callback: (data) => {
                emits('proxyQueryAllResult', data);
            }
        }).config
    },
    sortConfig: {
        trigger: 'cell',
        remote: true,
        orders: ['desc', 'asc'],
        defaultSort: order.value
    },
});

// 分页的配置
let pagination = ref({
    currentPage: 1,
    pageSize: opsTableConfig['VXE_PAGE_SIZES_SERVER'][0],
    total: 0,
    pageSizes: opsTableConfig['VXE_PAGE_SIZES_SERVER'],
    layout: ['Home', 'PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'End', 'Sizes', 'FullJump', 'Total'],
});

// 分页事件的触发
const gridEvents = {
    pageChange ({ currentPage, pageSize }) {
        pagination.value.currentPage = currentPage;
        pagination.value.pageSize = pageSize;
    }
};

onMounted(async () => {
    await nextTick( async () => {
        emits('getData');
    });
});

// 对表格的操作列进行处理以及其规范
const tableColumns = computed(() => {
    for (let col of tableColumn.value) {
        let { field, page_data_source, title_data }  = col;

        switch (field) {
            case 'operation':
                col.slots = {
                    default: field
                };
                col.fixed = 'right';
                delete col.showOverflow;
                break;
            default:
                if (page_data_source) {
                    switch (page_data_source.form_type) {
                        case 'boole':
                            col.cellRender = {
                                name: 'VxeSwitch',
                                props: {
                                    openValue: page_data_source?.checked ? page_data_source.checked : 1,
                                    closeValue: page_data_source?.unchecked === false || page_data_source?.unchecked ? page_data_source?.unchecked : 0,
                                    openLabel: (page_data_source && page_data_source?.checkedChildren) || '打开',
                                    closeLabel: (page_data_source && page_data_source?.unCheckedChildren) || '关闭',
                                    disabled: !props?.authBtn?.edit?.page_display,
                                },
                                events: {
                                    change: ({row, column}, e) => {
                                        if (props?.switchClickStatusConfig?.api) {
                                            let requestParam = props?.switchClickStatusConfig?.params || [];
                                            let otherParam = {};
                                            for(let item in requestParam) {
                                                otherParam[requestParam[item]] = row[requestParam[item]];
                                            }
                                            let result = {
                                                [column.field]: e.value,
                                                ...otherParam
                                            };
                                            props.switchClickStatusConfig.api(row.id, result)
                                                .then(() => {
                                                    emits('getData');
                                                });
                                        }
                                    }
                                }
                            };
                            break;
                    }
                    let templateRender = page_data_source?.template_render;
                    if (templateRender) {
                        col.cellRender = {
                            name: templateRender?.name,
                            props: {
                                data_source: title_data,
                                ...templateRender,
                            }
                        };

                    }
                }
                break;
        }
    }
    return tableColumn.value;
});


const loadData = () => {
    serverTableRef.value.commitProxy('query');
};

// 表格上方的搜索
let tableTopSearch = ref([]);
const handleConditionSearch = (searchModel) => {
    if (!searchModel) {
        // 清空搜索条件
        queryCondition.value = [...envSearchCondition.value];
        serverTableRef.value.commitProxy('query');
        return;
    }

    // 更新查询条件
    queryCondition.value = [...searchModel.tags, ...envSearchCondition.value];
    tableTopSearch.value = searchModel.tags;
    
    // 触发表格重新加载
    serverTableRef.value.commitProxy('query');
    emits('searchCondition', queryCondition.value);
};

// 环境的过滤搜索
const handleEnvSearch = (val) => {
    envSearchCondition.value = val.length ? [{'field':'environment', 'condition': 'in', value: val}] : [];
    queryCondition.value = [...tableTopSearch.value, ...envSearchCondition.value];
    serverTableRef.value.commitProxy('query');
};


defineExpose({
    serverTableRef,
    needPermissionBtn,
    pagination,
    gridOption,
    queryCondition,
    loadData,
});

/* *
格式一： 共用
   {
     allow_layer:[1,2], // 允许的层级
     env_search:{
        app_name:'', // 环境搜索的app_name
     
     }, // 是否显示环境搜索
     data_sync:{
        uri:'' // 数据同步的uri
     }, // 是否显示数据同步
     show_doc:{
       
     }, // 是否显示文档
    }

格式二：每一层是单独的
{
   1:{
      data_sync:{
         uri:'' // 数据同步的uri
      }, // 是否显示数据同步
      show_doc:{}, // 是否显示文档
       env_search:{
        app_name:'', // 环境搜索的app_name
     
     }, // 是否显示环境搜索
   }  

}
* */


</script>

<template>
    <vxe-grid
        :id="`server_table_${new Date().getTime()}`"
        ref="serverTableRef"
        v-bind="gridOption"
        :attr="$attrs"
        :data="paginatedData"
        :pager-config="pagination"
        :columns="tableColumns"
        v-on="gridEvents"
    >
        <template #top>
            <slot name="topPrefix">
                <ops-env-search
                    v-if="currentMenu?.[tableColumns?.[0]?.oriTitle?.layer]?.page_data_source?.env_search
                        || (
                            (!currentMenu?.[tableColumns?.[0]?.oriTitle?.layer])
                            && (currentMenu?.page_data_source?.allow_layer?.includes(tableColumns?.[0]?.oriTitle?.layer) || tableColumns?.[0]?.oriTitle?.layer === 1)
                            && currentMenu?.page_data_source?.env_search
                        )"
                        :page-app-name="
                        currentMenu?.[tableColumns?.[0]?.oriTitle?.layer]?.page_data_source?.env_search?.app_name
                        || currentMenu?.page_data_source?.env_search?.app_name
                    "
                    @env-search="handleEnvSearch"
                />
                <slot name="envSuffix"></slot>
            </slot>
            <vxe-toolbar :tools="serverTableTools">
                <template #buttonPrefix>
                    <!-- 根据授权的按钮是否有新增的按钮 -->
                    <vxe-button v-if="needPermissionBtn?.add?.page_display"  content="新增" icon="vxe-icon-add" status="primary"  @click="emits('userAdd')"/>
                    <slot name="other_toolbar_buttons"></slot>
                </template>
                <template #toolSuffix>
                        <data-sync v-if="(
                            currentMenu?.[tableColumns?.[0]?.oriTitle?.layer]?.page_data_source?.data_sync
                            || (
                                (!currentMenu?.[tableColumns?.[0]?.oriTitle?.layer])
                                && (currentMenu?.page_data_source?.allow_layer?.includes(tableColumns?.[0]?.oriTitle?.layer) || tableColumns?.[0]?.oriTitle?.layer === 1)
                                && currentMenu?.page_data_source?.data_sync
                            )
                            )" 
                            :uri="currentMenu?.[tableColumns?.[0]?.oriTitle?.layer]?.page_data_source?.data_sync?.uri || currentMenu?.page_data_source?.data_sync?.uri"
                        />

                        <doc-modal v-if="(
                            currentMenu?.[tableColumns?.[0]?.oriTitle?.layer]?.page_data_source?.show_doc
                            || (
                                (!currentMenu?.[tableColumns?.[0]?.oriTitle?.layer])
                                && (currentMenu?.page_data_source?.allow_layer?.includes(tableColumns?.[0]?.oriTitle?.layer) || tableColumns?.[0]?.oriTitle?.layer === 1)
                                && currentMenu?.page_data_source?.show_doc
                            )
                            )" 
                            v-bind="currentMenu?.[tableColumns?.[0]?.oriTitle?.layer]?.page_data_source?.show_doc"
                            />
                </template>
            </vxe-toolbar>
            <server-table-search
                :default-search-field="defaultSearchField"
                :title-field-search="titleFieldSearch"
                :default-query-condition="defaultQueryCondition"
                class="mb-0.5"
                @search="handleConditionSearch"
            />
            <slot name="topSuffix"></slot>
        </template>

        <template #operation="{row}">
            <span class="inline-flex items-center">
                <vxe-button v-if="needPermissionBtn?.edit?.page_display" mode="text" status="primary" icon="vxe-icon-edit" @click="emits('userEdit', {type: $CONFIG.FORM_TYPE.EDIT_TYPE, row})"></vxe-button>
                <slot name="other_operation" v-bind="{row}"></slot>
            </span>
            <template v-if="needPermissionBtn?.del?.page_display">
                <a-divider type="vertical" /><vxe-button   mode="text" status="error" icon="vxe-icon-delete" @click="emits('userDel', {row})"></vxe-button>
            </template>
        </template>

        <template v-for="item in renderSlots" #[item]="scope" >
            <slot
                v-if="item && tableColumn && tableColumn.length > 0"
                :name="item"
                :scope="scope"
                v-bind="scope || {}"
            />
        </template>
    </vxe-grid>
</template>


<style scoped lang="less">
.vxe-table {
    overflow: visible !important;
}

.vxe-table--header-wrapper {
    position: sticky !important;
    top: 0 !important;
}


/** vxe-table的样式**/
// 用于head头的合并其高度的处理，有两行的时候的高度控制
:deep(.vxe-table--header thead:has(.vxe-header--row:nth-child(2):last-child)) {
    // 假设 .vxe-table--render-default 类在更外层，这里直接从表头列开始选择
    .vxe-header--column.col--ellipsis {
        height: max-content !important;
        padding: 2px;
    }
}

// 去除外层滚动条
:deep(.vxe-grid--layout-body-content-wrapper) {
    overflow: hidden;
}
</style>
