<script setup>
import API from '@/api/security/securityGroup';
import tableRender from '@/composables/table/tableRender';

const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    rowData: {
        type: Object,
        default: () => ({}),
    },
    cloudSource: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['update:open']);

const TITLE_LAYER = 2;
const tableRef = ref(null);

const state = reactive({
    columns: [],
    data: [],
    direction: 'ingress',
});

const tableColumns = computed(() => {
    let columns = state.columns.filter(item => {
        return !(state.direction === 'ingress' && item.field === 'dest_address' ||
        state.direction === 'egress' && item.field === 'source_address');
    });

    for (let col of columns) {
        let { field }  = col;
        switch (field) {
            case 'dest_address':
            case 'source_address':
                col.slots = {
                    default: field,
                    header: `${field}_header`
                };
                break; 
            case 'protocol':
                col.slots = {
                    default: field,
                    header: `${field}_header`
                };
                break; 
            case 'status':
            case 'type':
                col.slots = {
                    default: field,
                };
                break;
            case 'action':
                col.slots = {
                    default: field,
                };           
                break;
        }
    }
    return columns;
});

const tableData = computed(() => {
    return state.data.filter(item => {
        return item.direction === state.direction;
    });
});

onMounted(async () => {
    const { columns } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.columns = columns.value || [];
});

// 获取安全组规则
const getSecurityGroupRule = async () => {
    tableRef.value.tableLoading = true;

    const res = await API.getSecurityGroupRule(props.rowData.id);
    state.data = res;
    if (tableRef.value) {
        await tableRef.value.commitRequest();
    }

    tableRef.value.tableLoading = false;
};

// 打开抽屉
const handleDrawerOpen = () => {
    if (props.open) {
        getSecurityGroupRule();
    } else {
        state.data = [];
        state.direction = 'ingress';
        tableRef.value.commitRequest();
    }
};

// 切换方向
const handleDirection = (direction) => {
    state.direction = direction;
    tableRef.value.commitRequest();
};

const computedAddress = (row) => {
    if (props.rowData.cloud_source === '华为云') {
        return row.cloud_specific?.remote_address_group_id || row.cloud_specific?.remote_group_id || row.cloud_specific?.remote_ip_prefix;
    }
    return Object.entries(row.cloud_specific).find(([key, value]) => {
        return (key.includes('source') || key.includes('dest')) && value;
    })?.[1];
};

</script>

<template>
    <ops-form-container
        :title="`安全组规则详情 - ${rowData.name}`"
        :open="open"
        width="80%"
        @update:open="emit('update:open', $event)"
        @after-open-change="handleDrawerOpen"
    >
        <ops-table
            ref="tableRef"
            :columns="tableColumns"
            :data="tableData"
            @refresh="getSecurityGroupRule"
        >
            <template #other_toolbar_buttons_left>
                <div>
                    <vxe-button 
                        v-for="item in [{ label: '入方向规则', value: 'ingress' }, { label: '出方向规则', value: 'egress' }]" 
                        :key="item.value" 
                        size="small" 
                        :status="state.direction === item.value ? 'primary' : 'default'" 
                        @click="handleDirection(item.value)"
                    >
                        {{ item.label }}
                    </vxe-button>
                </div>
            </template>

            <template #protocol_header>
                <a-tooltip :overlay-style="{ maxWidth: '400px' }" placement="leftBottom">
                    <template #title>
                        安全组规则作用的协议和端口：<br/>
                        · 选择全部协议，表示全部协议端口。<br/>
                        · 单个端口：例如22<br/>
                        · 连续端口：例如22-30<br/>
                        · 多个端口：例如22,23-30<br/>
                        · 全部端口：为空或1-65535<br/>
                        某些端口被部分运营商判断为高危端口，无法访问。
                    </template>
                    <span class="header-title">{{ tableColumns.find(item => item.field === 'protocol')?.title }}</span>
                </a-tooltip>
            </template>
            <template #protocol="{ row }">
                <span v-if="row.protocol">{{ String(row.protocol).toUpperCase() }}</span>
                <span v-if="row.port_range">:{{ row.port_range }}</span>
            </template>

            <template #dest_address_header>
                <a-tooltip>
                    <template #title>
                        目的地址可以是单个IP地址、IP地址段或安全组。<br/>
                        · 单个IP地址：例如192.168.10.10/32<br/>
                        · IP地址段：例如192.168.52.0/24<br/>
                        · 所有IP地址：0.0.0.0/0<br/>
                        · 安全组：例如sg-abc
                    </template>
                    <span class="header-title">{{ tableColumns.find(item => item.field === 'dest_address')?.title }}</span>
                </a-tooltip>
            </template>

            <template #source_address_header>
                <a-tooltip>
                    <template #title>
                        源地址可以是单个IP地址、IP地址段或安全组。<br/>
                        · 单个IP地址：例如192.168.10.10/32<br/>
                        · IP地址段：例如192.168.52.0/24<br/>
                        · 所有IP地址：0.0.0.0/0<br/>
                        · 安全组：例如sg-abc
                    </template>
                    <span class="header-title">{{ tableColumns.find(item => item.field === 'source_address')?.title }}</span>
                </a-tooltip>
            </template>
            <template #dest_address="{ row }">
                {{ computedAddress(row) }}
            </template>

            <template #source_address="{ row }">
                {{ computedAddress(row) }}
            </template>

            <template #status="{ row }">
                <ops-status
                    v-if="row.cloud_specific?.enabled"
                    :value="row.cloud_specific?.enabled" 
                    :active-value="true" 
                    :transform-rule="{
                        true: '已启用',
                        false: '已禁用'
                    }" 
                />
            </template>

            <template #action="{ row }">
                <ops-status
                    v-if="props.cloudSource === '阿里云'"
                    :value="row.action" 
                    active-value="Accept" 
                    :transform-rule="{
                        Accept: '接受',
                        Drop: '拒绝'
                    }" 
                />
                <ops-status
                    v-else
                    :value="row.action" 
                    active-value="allow" 
                    :transform-rule="{
                        allow: '接受',
                        deny: '拒绝'
                    }" 
                />
            </template>

            <template #type="{ row }">
                {{ row?.cloud_specific?.nic_type || row?.cloud_specific?.ethertype }}
            </template>
        </ops-table>
    </ops-form-container>
</template>

<style lang="scss" scoped>
.header-title {
    text-decoration: underline;
    text-decoration-style: dashed;
    padding-bottom: 2px;
    text-underline-offset: 3px;
    cursor: pointer;
}
</style>
