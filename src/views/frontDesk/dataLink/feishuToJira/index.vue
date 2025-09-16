<script setup>
import tableRender from "@/composables/table/tableRender";
import feishuToJiraApi from "@/api/dataLink/feishuToJira";
import subPage from "@/composables/subPage";


let {postList, getDetail} = feishuToJiraApi;


const TITLE_LAYER = 1;
// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    subPageColumns: [],
    initButton: [],
    initTitleData: [],
    tableOrder: {},
    titleFieldSearch: [],
    jiraUrl: ''
});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'id':
            case 'feishu_status':
            case 'status':
            case 'description':
            case 'jira_issue_id':
                col.slots = {
                    default: field
                };
                break; 
        }
    }
    return state.initColumn;
});

// 用于获取用户的操作权限
const canUserAction = computed(() => {
    return state.initButton.reduce((acc, btn) => {
        acc[btn.field] = btn;
        return acc;
    }, {});
});

onMounted(async () => {
    const { button, columns, title_data, order, title_field_search, sub_page_columns } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || [];
    state.tableOrder = order.value || {};
    state.titleFieldSearch = title_field_search.value || [];
    state.subPageColumns = sub_page_columns || [];
    state.jiraUrl = '';

    await handleDataRefresh();
});

// 表格数据的获取
const handleDataRefresh = async () => {
    if (tableRef.value) {
        await tableRef.value.serverTableRef.commitProxy('query');
      
        // 切换后等待 DOM 更新再触发表格自适应
        nextTick(() => {
            if (tableRef.value?.serverTableRef) {
                tableRef.value?.serverTableRef?.recalculate?.(true);
            }
        });
    }
};

const defaultSearchField = {
    fields: [
        {
            field: 'feishu_serial_number',
            field_name: '飞书审批单编号',
            operator: '=',
            validate: (value) => {
                // 先将值转换为字符串
                const str = String(value).trim();
                // 匹配整数或小数（包括正数和负数）
                const reg = /^[-+]?(\d+(\.\d*)?|\.\d+)$/;
                return reg.test(str);
            }
        },
        {
            field: 'feishu_approval_name',
            field_name: '飞书审批单名称',
            operator: 'vague',
        },
    ],
    placeholder: '支持飞书审批单编号、飞书审批单名称搜索'
};



// 子页面
const {
    subPageOpen,
    subPageRow,
    handleSubPageOpen,
} = subPage();

// 获取返回的所有数据
const onProxyQuery = ({response})  =>{
    state.jiraUrl = response?.jira_url || '';
};

</script>

<template>
     <div style="flex: auto; min-height: 0;">       
        <server-table
            ref="tableRef"
            :table-column="initTableColumns"
            :auth-btn="canUserAction"
            :order="state.tableOrder"
            :query-api="postList"
            :default-search-field="defaultSearchField"
            :title-field-search="state.titleFieldSearch"
            @proxy-query-all-result="onProxyQuery"
        >
        <!-- 表格插槽 -->
        <template #id="{row}">
            <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.id }}</span>
        </template>
        <template #feishu_status="{row}">
            <vxe-tag v-if="row.feishu_status" :class="row.feishu_status == '通过' ? 'theme--success' : 'theme--warning'" size="small">
                {{ row.feishu_status }}
            </vxe-tag>
        </template>
        <template #status="{row}">
            <vxe-tag v-if="row.status" :class="row.status == '同步成功' ? 'theme--success' : 'theme--warning'" size="small">
                {{ row.status }}
            </vxe-tag>
        </template>
        <template #jira_issue_id="{row}">
            <a v-if="state.jiraUrl && row.jira_issue_id" :href="state.jiraUrl + row.jira_issue_id"  target="_blank">
                <span class="text-primary">{{ row.jira_issue_id }}</span>
                
            </a>
            <span v-else>{{ row.jira_issue_id }}</span>
        </template>
        <template #description="{row}">
            <a-popover v-if="row.description" placement="left">
                <template #content>
                {{ row.description }}
            </template>
            <template #title>
                错误信息
            </template>
            <vxe-button status="error" size="small">错误信息</vxe-button>
            
        </a-popover>
        </template>

       
       

    </server-table>

    <!-- 子页面 -->
    <ops-sub-page
        v-model:open="subPageOpen"
        :row-data="subPageRow"
        :title="`${subPageRow?.feishu_serial_number}-飞书审批单信息`"
        :basic-config="{
            api: getDetail,
            sid: subPageRow?.id,
            columns: state.subPageColumns,
        }"
    >
        <template #feishu_status="{row}">
            <vxe-tag v-if="row.feishu_status" :class="row.feishu_status == '通过' ? 'theme--success' : 'theme--warning'" size="small">
                {{ row.feishu_status }}
            </vxe-tag>
        </template>
        <template #status="{row}">
            <vxe-tag v-if="row.status" :class="row.status == '同步成功' ? 'theme--success' : 'theme--warning'" size="small">
                {{ row.status }}
            </vxe-tag>
        </template>
        <template #jira_issue_id="{row}">
            <a v-if="state.jiraUrl && row.jira_issue_id" :href="state.jiraUrl + row.jira_issue_id" target="_blank" class="text-primary">  <span class="text-primary">{{ row.jira_issue_id }}</span></a>
            <span v-else>{{ row.jira_issue_id }}</span>
        </template> 
    </ops-sub-page>

    
</div>
<!-- 主表格部分 -->

   
</template>

<style scoped lang="less">

</style>
