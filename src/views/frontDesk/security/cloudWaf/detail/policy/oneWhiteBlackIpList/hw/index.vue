<script setup>
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
const TITLE_LAYER = 4;

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
            case 'timestamp':
            case 'ip_group':
            case 'white':
            case 'time_mode':
                col.slots = {
                    default: field
                };
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
    userDel({ sid: row.id, body: data, delApi: cloudWafApi.del, loadData: handleDataRefresh });
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

        <template #timestamp="{ row }">
            <!-- 时间戳转时间 -->
            {{ new Date(row.timestamp).toLocaleString() }}
        </template>

        <template #ip_group="{ row }">
            <a-tooltip v-if="row.ip_group?.ips">
                <template #title>
                    <div v-for="item in row.ip_group.ips.split(',')" :key="item">
                        {{ item }}
                    </div>
                </template>
                <span class="text-primary">
                    {{ row.ip_group?.name }}
                </span>
            </a-tooltip>

            <a-tooltip v-else>
                <template #title>
                    <div v-for="item in row.addr.split(',')" :key="item">
                        {{ item }}
                    </div>
                </template>
                <span class="text-primary">
                    {{ row.addr }}
                </span>
            </a-tooltip>
        </template>

        <template #white="{ row }">
            {{ state.initTitleData?.white?.[row.white] || row.white }}
        </template>

        <template #time_mode="{ row }">
            {{ state.initTitleData?.time_mode?.[row.time_mode] || row.time_mode }}
        </template>

        <template #interept_count="{ row }">
            {{ row.interept_count }}/{{ row.all_count }}
        </template>
    </ops-table>
</template>
