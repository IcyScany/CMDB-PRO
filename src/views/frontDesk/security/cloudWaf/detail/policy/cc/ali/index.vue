<script setup>
import cloudWafApi from '@/api/security/cloudWafApi';
import { policyApi } from '@/api/security/cloudWafApi';
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";

const props = defineProps({
    rowData: Object,
    tableData: Object,
    searchQuery: String,
    repeatRuleOpen: Boolean,
});

const emit = defineEmits(['showRule', 'edit', 'update:repeatRuleOpen']);

const tableRef = ref(null);
const TITLE_LAYER = 5;

const state = reactive({
    data: [],
    initColumn: [],
    initTitleData: [],
    initButton: [],
    repeatData: [],
});

// 用户操作相关
const { userEdit, userDel } = userOperate({});

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
            case 'conditions':
                col.slots = {
                    default: field
                };
                col.minWidth = 220;
                col.showOverflow = false;
                break;
            case 'action':
                col.slots = {
                    default: field
                };
                col.showOverflow = false;
                break;
            case 'name':
            case 'tag_type':
                col.slots = {
                    default: field
                };
                break;
            case 'ruleid':
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
        template_rule: columns,
        repeat_data: columns.filter(item => {
            return ['ruleid', 'domain', 'name', 'status', 'conditions', 'action'].includes(item.field);
        }),
    };
});


onMounted(async () => {
    tableRef.value.tableLoading = true;
    const { columns, title_data, button } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initTitleData = title_data.value || [];
    state.initButton = button.value || [];

    let res = props.tableData;
    state.data = res?.template_rule;
    
    // 相同规则的放在一起，底色一致
    let flag = false;
    let result = [];
    let repeatIds = res?.repeat_domain_ids;
    for (let i in repeatIds) {
        for (let j in repeatIds[i]) {
            let ruleid = repeatIds[i][j];
            result.push({...res.repeat_data[ruleid], 'rowClassName': flag ? 'row--stripe' : ''});
        }
        flag = !flag;
    }
    state.repeatData = result;

    if(tableRef.value) {
        tableRef.value.searchQuery = props.searchQuery;
        tableRef.value.commitRequest();
        tableRef.value.tableLoading = false;
    }
});

// 行样式
const rowClassName = ({ row }) => {
    return row.rowClassName;
};

// ID点击
const handleIDClick = (row) => {
    emit('showRule', row);
};

// 表格数据刷新
const handleDataRefresh = () => {
    tableRef.value.commitRequest();
};

// 用户新增编辑操作
const handleUserEdit = ({ row }) => {
    emit('edit', props.rowData, row);
};

// 用户删除操作
const handleUserDel = (row) => {
    let data = {
        cloud_type: 'aliyun',
        cloud_master_account_id: props.rowData.cloud_master_account_id,
        sid: props.rowData.id,
        rule_id: row.ruleid,
        policy_id: props.rowData.cc_policy_id,
    };
    userDel({ sid: row.ruleid, body: data, delApi: policyApi.cc.del, loadData: handleDataRefresh });
};

watch(() => props.searchQuery, (newVal) => {
    tableRef.value.searchQuery = newVal;
    tableRef.value.commitRequest();
});
</script>

<template>
    <ops-table
        ref="tableRef"
        :data="state.data || []"
        :columns="tableColumns.template_rule"
        :auth-btn="canUserAction"
        @refresh="cloudWafApi.getDetail(props.rowData.id);"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
        @user-del="handleUserDel"
    >
        <!-- 表格插槽 -->
        <template #top></template>

        <template #ruleid="{ row }">
            <ops-tooltip
                :content="row.ruleid"
                placement="topLeft"
                @click="handleIDClick(row)"
            />
        </template>

        <template #name="{ row }">
            <a-tooltip :title="row.id">
                {{ row.name }}
            </a-tooltip>
        </template>

        <template #conditions="{ row }">
            <template v-for="(item, index) in row.conditions" :key="index">
                <div>
                    请求<span class="text-info">{{ item.key }}</span>
                    {{ state.initTitleData?.['opValue']?.[item.opValue] || item.opValue }}
                </div>
                <div>{{ item.values }}</div>
            </template>
        </template>

        <template #action="{ row }">
            {{ state.initTitleData?.action?.[row.action] || row.action }}
        </template>

        <template #tag_type="{ row }">
            {{ state.initTitleData?.tag_type?.[row.tag_type] }}
        </template>

        <template #interept_count="{ row }">
            {{ row.interept_count }}/{{ row.all_count }}
        </template>
    </ops-table>

    <!-- 重复规则 -->
    <ops-form-container
        :open="props.repeatRuleOpen"
        :title="`阿里云重复规则`"
        width="70%"
        :z-index="10000"
        @close="emit('update:repeatRuleOpen', false)"
    >
        <ops-table
            :data="state.repeatData"
            :columns="tableColumns.repeat_data"
            :stripe="null"
            :row-class-name="rowClassName"
            :default-order="{ prop: 'conditions', order: 'desc' }"
        >
            <template #ruleid="{ row }">
                <ops-tooltip
                    :content="row.ruleid"
                    placement="topLeft"
                    @click="handleIDClick(row)"
                />
            </template>

            <template #name="{ row }">
                <a-tooltip :title="row.id">
                    {{ row.name }}
                </a-tooltip>
            </template>

            <template #conditions="{ row }">
                {{ row.conditions }}
            </template>

            <template #action="{ row }">
                {{ state.initTitleData?.action?.[row.action] || row.action }}
            </template>
        </ops-table>
    </ops-form-container>
</template>
