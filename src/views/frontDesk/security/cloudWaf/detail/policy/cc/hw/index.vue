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
const TITLE_LAYER = 2;

const state = reactive({
    data: [],
    initColumn: [],
    initButton: [],
    initTitleData: [],
    repeatData: [],
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

    let repeat_columns = columns.filter(item => {
        return item.oriTitle.block === 1 && ['domain', 'name', 'status', 'conditions', 'action'].includes(item.field);
    });
    repeat_columns = [
        { field: 'ruleid', title: 'ID', slots: { default: 'ruleid' }, showOverflow: 'title', titlePrefix: { content: '点击查看近一个月的规则触发数' } },
        ...repeat_columns
    ];

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
            case 'tag_type':
            case 'interept_count':
                col.slots = {
                    default: field
                };
                break;
            case 'id':
            case 'ruleid':
                col.slots = {
                    default: field
                };
                col.showOverflow = 'title';
                col.titlePrefix = {
                    content: '点击查看近一个月的规则触发数'
                };
                break;
        }
    }

    return {
        columns: columns.filter(item => item.oriTitle.block === 1),
        conditions: state.initColumn.filter(item => item.oriTitle.block === 3),
        repeat_columns: repeat_columns,
    };
});

onMounted(async () => {
    tableRef.value.tableLoading = true;
    const { columns, title_data, button } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initTitleData = title_data.value || [];
    state.initButton = button.value || [];

    // 相同规则的放在一起，底色一致
    let res = props.tableData;
    state.data = res?.template_rule;

    let flag = false;
    let result = [];
    let repeatIds = Object.values(res?.repeat_domain_ids || {})?.[0];
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
        cloud_type: 'huawei',
        cloud_master_account_id: props.rowData.cloud_master_account_id,
        sid: props.rowData.id,
        rule_id: row.id,
        policy_id: props.rowData.cc_policy_id,
    };
    userDel({ sid: row.id, body: data, delApi: policyApi.cc.del, loadData: handleDataRefresh });
};

watch(() => props.searchQuery, (newVal) => {
    tableRef.value.searchQuery = newVal;
    tableRef.value.commitRequest();
});
</script>

<template>
    <ops-table
        ref="tableRef"
        :data="state.data"
        :columns="tableColumns.columns"
        :auth-btn="canUserAction"
        @refresh="cloudWafApi.getDetail(props.rowData.id);"
        @user-edit="handleUserEdit"
        @user-del="handleUserDel"
    >
        <template #top></template>
        
        <!-- 表格插槽 -->
        <template #id="{ row }">
            <ops-tooltip
                :content="row.id"
                placement="topLeft"
                @click="handleIDClick(row)"
            />
        </template>

        <template #conditions="{ row }">
            <template v-for="(item, index) in row.conditions" :key="index">
                <div>
                    请求<span class="text-info">{{ state.initTitleData?.['category']?.[item.category] }}</span>
                    {{ state.initTitleData?.['logic_operation']?.[item.category]?.[item.logic_operation] || item.logic_operation }}
                </div>
                <div>{{ item.contents[0] }}</div>
            </template>
        </template>

        <template #action="{ row }">
            {{ state.initTitleData?.action?.find(item => item.value === row.action?.category)?.label }}
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
        :title="`华为云重复规则`"
        width="70%"
        :z-index="10000"
        @close="emit('update:repeatRuleOpen', false)"
    >
        <ops-table
            :data="state.repeatData"
            :columns="tableColumns.repeat_columns"
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
                {{ row.name }}
            </template>

            <template #conditions="{ row }">
                {{ row.conditions }}
            </template>

            <template #action="{ row }">
                {{ state.initTitleData?.action?.find(item => item.value === row.action)?.label }}
            </template>
        </ops-table>
    </ops-form-container>
</template>
