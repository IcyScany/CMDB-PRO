<script setup>
import { policyApi } from '@/api/security/cloudWafApi';
import cloudWafApi from '@/api/security/cloudWafApi';
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";

const props = defineProps({
    rowData: Object,
    tableData: Object,
    searchQuery: String,
});

const emit = defineEmits(['showRule', 'edit']);

const tableRef = ref(null);
const TITLE_LAYER = 3;

const state = reactive({
    data: [],
    initColumn: [],
    initTitleData: [],
    initButton: [],
});

// 用户操作相关
const { userDel } = userOperate({});

// 用于获取用户的操作权限
const canUserAction = computed(() => {
    return state.initButton.reduce((acc, btn) => {
        acc[btn.field] = btn;
        return acc;
    }, {});
});

const tableColumns = computed(() => {
    let columns = state.initColumn;
    for (let col of columns) {
        let { field }  = col;
        switch (field) {
            case 'rule':
            case 'update_time':
                col.slots = {
                    default: field
                };
                break;
            case 'conditions':
                col.slots = {
                    default: field
                };
                col.showOverflow = false;
                col.minWidth = 200;
                break;
            case 'id':
                col.slots = {
                    default: field
                };
                col.showOverflow = 'title';
                col.titlePrefix = {
                    content: '点击查看近一个月的规则触发数'
                };
                break;
            case 'interept_count':
                col.slots = {
                    default: field
                };
                break;
        }
    }
    return {
        columns: columns,
    };
});

onMounted(async () => {
    tableRef.value.tableLoading = true;
    const { columns, title_data, button } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initTitleData = title_data.value || [];
    state.initButton = button.value || [];

    if(tableRef.value) {
        tableRef.value.searchQuery = props.searchQuery;
        tableRef.value.commitRequest();
        tableRef.value.tableLoading = false;
    }
});

// ID点击
const handleIDClick = (row) => {
    emit('showRule', row);
};

// 表格数据刷新
const handleDataRefresh = () => {
    tableRef.value.commitRequest();
};

// 用户新增编辑操作
const handleUserEdit = ({row}) => {
    emit('edit', props.rowData, row);
};

// 用户删除操作
const handleUserDel = (row) => {
    let data = {
        cloud_type: 'huawei',
        cloud_master_account_id: props.rowData.cloud_master_account_id,
        sid: props.rowData.id,
        rule_id: row.id,
        policy_id: props.rowData.cc_policy_id,
    };
    userDel({ sid: row.id, body: data, delApi: policyApi.ignore.del, loadData: handleDataRefresh });
};

const to2DArray = (arr) => {
    if (!Array.isArray(arr)) return [[]];
    if (arr.length === 0) return [[]];
    if (Array.isArray(arr[0])) return arr;
    return [arr];
};

watch(() => props.searchQuery, (newVal) => {
    tableRef.value.searchQuery = newVal;
    tableRef.value.commitRequest();
});
</script>

<template>
    <ops-table
        ref="tableRef"
        :data="tableData || []"
        :columns="tableColumns.columns"
        :auth-btn="canUserAction"
        @refresh="cloudWafApi.getDetail(props.rowData.id);"
        @user-edit="handleUserEdit"
        @user-del="handleUserDel"
    >
        <!-- 表格插槽 -->
        <template #top></template>

        <template #id="{ row }">
            <ops-tooltip
                :content="row.id"
                placement="topLeft"
                @click="handleIDClick(row)"
            />
        </template>

        <template #update_time="{ row }">
            <!-- 时间戳转时间 -->
            {{ new Date(row.update_time).toLocaleString() }}
        </template>

        <template #rule="{ row }">
            {{ state.initTitleData?.rule?.[row.rule] }}
        </template>

        <template #conditions="{ row }">
            <div v-for="(condition, index) in to2DArray(row.conditions)" :key="index">                
                <div v-for="item in condition" :key="item.id" class="condition-item">
                    <span>
                        {{ state.initTitleData?.category?.[item.category] }}
                    </span>
                    <span v-if="item.index">
                        子字段 {{ item.index }}
                    </span>
                    <span>
                        {{ state.initTitleData?.logic_operation?.[item.category]?.[item.logic_operation] || item.logic_operation }}
                    </span>
                    <span>
                        {{ item.contents[0] }}
                    </span>
                </div>

                <div v-if="index !== to2DArray(row.conditions).length - 1">或者</div>
            </div>
        </template>

        <template #interept_count="{ row }">
            {{ row.interept_count }}/{{ row.all_count }}
        </template>
    </ops-table>
</template>

<style lang="scss" scoped>
.condition-item {
    span {
        margin-right: 4px;
    }
}
</style>
