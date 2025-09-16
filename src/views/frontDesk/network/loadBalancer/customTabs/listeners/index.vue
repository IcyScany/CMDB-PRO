<script setup>
import API from "@/api/network/loadBalancer";
import tableRender from "@/composables/table/tableRender";
import ipGroup from './ipGroup.vue';
import serverGroup from './serverGroup.vue';

const props = defineProps({
    sid: {
        type: [String, Number],
        default: '',
    },
    rowData: {
        type: Object,
        default: () => ({}),
    },
});

const TITLE_LAYER = 2;
const tableRef = ref(null);
const state = reactive({
    tableData: [],
    initColumn: [],
    initButton: [],
    initTitleData: [],
    ipgroupOpen: false,
    serverGroupOpen: false,
    serverGroupData: [],
    ipgroupData: [],
    serverGroupRowId: '',
}); 

// 表格的列
const initTableColumns = computed(() => {
    let columns = state.initColumn.filter(item => item.oriTitle.block === 1) || [];
    for (let col of columns) {
        let { field }  = col;
        switch (field) {
            case 'ipgroup':
            case 'server_group_id':
                col.slots = {
                    default: field
                };
                col.showOverflow = false;
                break;
        }
    }
    return columns;
});

const getListeners = async () => {
    const res = await API.getListeners(props.sid);
    state.tableData = res?.listeners || [];
    await tableRef.value.commitRequest();
};

const getServerGroup = async () => {
    const res = await API.getServerGroup(props.sid, props.rowData?.cloud_instance_id);
    state.serverGroupData = res?.server_groups || [];
};

const getIpgroup = async () => {
    let ipgroupIds = [];
    for (let item of state.tableData) {
        if(item?.source_data?.ipgroup?.ipgroup_id) {
            ipgroupIds.push(item?.source_data?.ipgroup?.ipgroup_id);
        }
    }
    const res = await API.getIpgroup(props.sid, ipgroupIds);
    state.ipgroupData = res?.ip_groups || [];
};

const handleIpgroup = () => {
    state.ipgroupOpen = true;
};

const handleServerGroup = (row) => {
    state.serverGroupRowId = row.server_group_id[0];
    state.serverGroupOpen = true;
};

onMounted(async () => {
    const { button, columns, title_data, order, title_field_search } = await tableRender.setColumn({ layer: TITLE_LAYER, tableType: 'client' });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || [];
    state.tableOrder = order.value || {};
    state.titleFieldSearch = title_field_search || {};
});

watch(() => props.sid, async () => {
    if(props.sid) {
        await getListeners();
        await getServerGroup();
        await getIpgroup();
    }
}, { immediate: true });
</script>

<template>
    <ops-table
        ref="tableRef"
        :data="state.tableData"
        :columns="initTableColumns"
    >
        <template #id="{row}">
            <div>{{ row.name }}</div>
            <div class="truncate">{{ row.id }}</div>
        </template>

        <template #ipgroup="{row}">
            <div v-if="!row?.source_data?.ipgroup">
                允许所有IP访问
            </div>
            <div v-else>
                <span>
                    <template v-if="row?.source_data?.ipgroup.type === 'white'">白名单-允许 </template>
                    <template v-else>黑名单-禁止 </template>
                </span>
                <span>
                    <span class="text-primary"> {{ state.ipgroupData.find(item => item.id === row?.source_data?.ipgroup?.ipgroup_id)?.name }} </span>
                    访问服务器
                </span>
                <span>
                    <template v-if="row?.source_data?.ipgroup.enable_ipgroup">(已生效)</template>
                    <template v-else>(未生效)</template>
                </span>
                <div class="text-primary cursor-pointer" @click="handleIpgroup(row)">
                    IP组列表
                </div>
            </div>
        </template>

        <template #server_group_id="{row}">
            {{ state.serverGroupData.find(item => item.id === row?.server_group_id[0])?.name }} 
            <div class="text-primary cursor-pointer" @click="handleServerGroup(row)">
                后端服务器
            </div>
        </template>
    </ops-table>

    <ip-group
        v-model:open="state.ipgroupOpen"
        :init-column="state.initColumn"
        :ipgroup-data="state.ipgroupData"
        :init-title-data="state.initTitleData"
    />

    <server-group
        v-model:open="state.serverGroupOpen"
        :init-column="state.initColumn"
        :group-data="state.serverGroupData.filter(item => item.id === state.serverGroupRowId)"
    />
</template>