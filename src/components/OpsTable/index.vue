<script setup>
// 导入外部依赖
import { useAttrs, useSlots } from 'vue';
import { debounce } from "xe-utils";
import { tableProps, tableEmits, defaultConfig } from './opsTable';
import { useColumns } from './useColumns';
import { useRequestConfig } from './useRequestConfig';
import { userCommonMessageStore } from '@/stores';

let userCommonStore = userCommonMessageStore();
let currentMenu = computed(() => userCommonStore?.current_user_menu?.current_menu);


const props = defineProps(tableProps);
const emit = defineEmits(tableEmits);

const slots = useSlots();
const attrs = useAttrs();


const vxeGridRef = ref(null);
const toolBarRef = ref(null);
const renderSlots = Object.keys(slots);

// 表格工具栏配置
const clientTableTools = [
    { 
        code: 'myToolbarCustom', 
        icon: 'vxe-icon-custom-column',
        circle: true
    }
];

const tableAttrs = computed(() => ({
    ...defaultConfig,
    ...attrs,
    toolbarConfig: {
        ...props.toolbarConfig,
        slots: {
            ...props.toolbarConfig?.slots
        },
    },
    sortConfig: {
        trigger: 'cell',
        remote: true,
        orders: ['desc', 'asc'],
    },
}));

// 使用组合式API
const {
    loading: tableLoading,
    pagination,
    showData,
    tableAllData,
    searchQuery,
    updateShowData,
    commitRequest,
} = useRequestConfig({
    tableRef: vxeGridRef,
    props,
    emit
});

useColumns(props, commitRequest);

// 事件处理方法
const handleToolClick = (tool) => {
    console.log(tool);
};

const handleRefreash = () => {
    commitRequest();
    emit('refresh');
};

const handleEnvSearch = (val) => {
    if (val.length) {
        showData.value = tableAllData.value.filter(item => val.indexOf(item.environment) > -1);
        updateShowData();
    }
};

// 表格事件
const gridEvents = {
    pageChange: ({ pageSize, currentPage }) => {
        pagination.value.currentPage = currentPage;
        pagination.value.pageSize = pageSize;
        updateShowData();
    },
    sortChange: () => {
        updateShowData();
    }
};

// 工具方法
const getDom = () => vxeGridRef.value;

// 搜索相关
const searchEvent = debounce(updateShowData, 100);

// 生命周期钩子
onMounted(() => {
    if (vxeGridRef.value?.connect && toolBarRef.value) {
        vxeGridRef.value?.connect(toolBarRef.value);
    }
    
    if (props.requestConfig.immediate !== false) {
        commitRequest();
    }
});

// 全局筛选数据
watch(() => props.filterConditions, () => {
    updateShowData(true);
}, { deep: true });

// 表格复选框选中的数据汇总
const tableCheckboxCheckedAll = () => {
    let getCheckedData = [];
    if (vxeGridRef.value) {
        let getPreCheckedData = vxeGridRef.value.getCheckboxRecords(true);
        let getAfterCheckData = vxeGridRef.value.getCheckboxReserveRecords();
        getCheckedData = getPreCheckedData.concat(getAfterCheckData);
    }
    return getCheckedData;
};

// 清空表格的复选框
const clearCheckBox = () => {
    if (vxeGridRef.value) {
        vxeGridRef.value.clearCheckboxRow(); // 手动清空用户的选择
        vxeGridRef.value.clearCheckboxReserve(); //手动清空用户保留选中的行数据
    }
};

// 清空表格的单选框
const clearRadioCheck = () => {
    if (vxeGridRef.value) {
        vxeGridRef.value.clearRadioRow();
        vxeGridRef.value.clearRadioReserve();
    }
};

// 表格中单选框选中的数据
const tableRadioCheckedAll = () => {
    let result = null;
    if (vxeGridRef.value) {
        let checkedRow = vxeGridRef.value.getRadioRecord(); // 当前选中的行
        let checkedReverseRow = vxeGridRef.value.getRadioReserveRecord();
        result = checkedRow || checkedReverseRow;
    }
    return result;

};


// 暴露方法
defineExpose({
    getDom,
    commitRequest,
    tableLoading,
    tableAllData,
    updateShowData,
    vxeGridRef,
    searchQuery,
    
    tableCheckboxCheckedAll,
    clearCheckBox,
   
    tableRadioCheckedAll,
    clearRadioCheck,
});

</script>

<script>
export default {
    name: 'OpsTable',
};
</script>

<template>
    <vxe-grid
        :id="`ops_client_table_${new Date().getTime()}`"
        ref="vxeGridRef"
        class="z-0"
        v-bind="tableAttrs"
        :attr="$attrs"
        :data="showData"
        :pager-config="pagination"
        :columns="props.columns"
        :loading="tableLoading"

        @checkbox-change="(data) => emit('select', data)"
        @checkbox-all="(data) => emit('select', data)"
        v-on="gridEvents"
    >
        <template #top>
         
            <slot name="topPrefix">
                <ops-env-search
                    v-if="currentMenu?.[props.columns?.[0]?.oriTitle?.layer]?.page_data_source?.env_search
                    || (
                        (!currentMenu?.[props.columns?.[0]?.oriTitle?.layer])
                        && (currentMenu?.page_data_source?.allow_layer?.includes(props.columns?.[0]?.oriTitle?.layer) || props.columns?.[0]?.oriTitle?.layer === 1)
                        && currentMenu?.page_data_source?.env_search
                    )"
                    :page-app-name="
                    currentMenu?.[props.columns?.[0]?.oriTitle?.layer]?.page_data_source?.env_search?.app_name
                    || currentMenu?.page_data_source?.env_search?.app_name
                    "
                    @env-search="handleEnvSearch"
                />
            </slot>
            <vxe-toolbar ref="toolBarRef"  :tools="clientTableTools" @tool-click="handleToolClick">
                <template #buttonPrefix>
                    <!-- 表头按钮栏 -->
                    <slot name="other_toolbar_buttons_left"></slot>
                    <!-- 根据授权的按钮是否有新增的按钮 -->
                    <vxe-button v-if="props.authBtn?.add?.page_display"  content="新增" icon="vxe-icon-add" status="primary"  @click="emit('userAdd')"/>
                    <slot name="other_toolbar_buttons"></slot>
                </template>
                <template #toolPrefix>
                    <slot name="toolSearchPrefix"></slot>
                    <!--  右侧全局搜索 -->
                    <template v-if="props.showSearch">
                        <a-input v-model:value="searchQuery" type="search" allow-clear placeholder="全表搜索" style="padding-right: .5rem; margin-right: 12px; width: 400px" clearable @keyup="searchEvent" @change="searchEvent"></a-input>
                    </template>
                    <vxe-button :icon="`vxe-icon-repeat ${tableLoading ? 'roll': ''}`" circle @click="handleRefreash"></vxe-button>
                </template>
                <template #toolSuffix>
                    <data-sync v-if="(
                            currentMenu?.[props.columns?.[0]?.oriTitle?.layer]?.page_data_source?.data_sync
                            || (
                                (!currentMenu?.[props.columns?.[0]?.oriTitle?.layer])
                                && (currentMenu?.page_data_source?.allow_layer?.includes(props.columns?.[0]?.oriTitle?.layer) || props.columns?.[0]?.oriTitle?.layer === 1)
                                && currentMenu?.page_data_source?.data_sync
                            )
                            )" 
                            :uri="currentMenu?.[props.columns?.[0]?.oriTitle?.layer]?.page_data_source?.data_sync?.uri || currentMenu?.page_data_source?.data_sync?.uri"
                        />

                        <doc-modal v-if="(
                            currentMenu?.[props.columns?.[0]?.oriTitle?.layer]?.page_data_source?.show_doc
                            || (
                                (!currentMenu?.[props.columns?.[0]?.oriTitle?.layer])
                                && (currentMenu?.page_data_source?.allow_layer?.includes(props.columns?.[0]?.oriTitle?.layer) || props.columns?.[0]?.oriTitle?.layer === 1)
                                && currentMenu?.page_data_source?.show_doc
                            )
                            )" 
                            v-bind="currentMenu?.[props.columns?.[0]?.oriTitle?.layer]?.page_data_source?.show_doc "
                            />
                </template>
            </vxe-toolbar>
            <slot name="topSuffix"></slot>

        </template>

        <template #operation="{row}">
            <span class="inline-flex items-center">
                <vxe-button v-if="props.authBtn?.edit?.page_display" mode="text" status="primary" icon="vxe-icon-edit" @click="emit('userEdit',{type: $CONFIG.FORM_TYPE.EDIT_TYPE, row})"/>
                <slot name="other_operation" v-bind="{row}"></slot>
            </span>
            <template v-if="props.authBtn?.del?.page_display">
                <a-divider type="vertical" /> <vxe-button   mode="text" status="error" icon="vxe-icon-delete" @click="emit('userDel', row)"/>
            </template>
        </template>

        <!--  自定义的插槽 -->
        <template v-for="item in renderSlots" #[item]="scope" >
            <slot
                v-if="item && props.columns && props.columns.length > 0"
                :name="item"
                :scope="scope"
                v-bind="scope || {}"
            />
        </template>
    </vxe-grid>
</template>

<style scoped lange="less">
.vxe-table {
    overflow: visible !important;
}

.vxe-table--header-wrapper {
    position: sticky !important;
    top: 0 !important;
}

/** vxe-table的样式**/
/*用于head头的合并其高度的处理，有两行的时候的高度控制*/
:deep(.vxe-table--header thead:has(.vxe-header--row:nth-child(2):last-child)) {
/*假设 .vxe-table--render-default 类在更外层，这里直接从表头列开始选择*/
   .vxe-header--column.col--ellipsis {
       height: max-content !important;
       padding: 2px;
   }
}

:deep(.vxe-grid--layout-body-content-wrapper) {
    overflow: hidden;
}
</style>
