<script setup>
import { defaultConfig } from '@/components/OpsTable/opsTable.js';

const props = defineProps({
    data: {
        type: Object,
        default: () => ({}),
    },
    columns: {
        type: Array,
        default: () => [],
    },
    titleData: {
        type: Object,
        default: () => ({}),
    },
});

// 描述列表分块
const blockList = [
    { title: '基础信息', block: 1, columns: [] },
    { title: '规格配置', block: 2, columns: [] },
    { title: '连接信息', block: 3, columns: [] },
    { title: '网络信息', block: 4, columns: [] },
    { title: '付费信息', block: 5, columns: [] },
    { title: '节点信息', block: 6, columns: [] },
];

// 描述列表数据
const tabData = computed(() => {
    return {
        ...props.data,
        ...props.data?.cloud_specific,
    };
});

// 节点表格配置
const gridOptions = computed(() => ({
    id: `mongodbNodes`,
    ...defaultConfig,
    maxHeight: '500px',
    columns: props.columns.filter(col => {
        if(col?.oriTitle?.block === 10) {
            if(col.field === 'addresses') {
                col.slots = { default: col.field };
            }
            if(col.field === 'status') {
                col.slots = { default: col.field };
            }
            return col;
        }
    }),
}));

// 节点表格数据
const tableData = computed(() => {
    let data = tabData.value?.node_groups || [];

    // 节点组类型为Sharding时，节点按照[mongos、config、shard]顺序展示
    const nodeType = tabData.value?.deployment_mode;
    if(nodeType === 'Sharding') {
        let sortList = ['mongos', 'config', 'shard'];
        data = data.sort((a, b) => {
            return sortList.indexOf(a.type) - sortList.indexOf(b.type);
        });
    }

    return data;
});

// 设置描述列表字段
const setColumns = () => {
    blockList.forEach(item => {
        item.columns = props.columns.filter(col => {
            if (col?.oriTitle?.block !== 10) {
                // 只展示接口返回的对应字段
                let fields = Object.keys(tabData.value);
                return col?.oriTitle?.block === item.block && fields.includes(col?.field);
            }
        });
    });
};

watch(() => props.data, () => {
    setColumns();
});

</script>

<template>
    <div v-for="item in blockList" :key="item.title" class="mb-4">
        <a-typography-title :level="5">
            <span class="ml-4">{{ item.title }}</span>
        </a-typography-title>

        <a-card :style="{borderColor: '#cccccc'}">
            <a-skeleton v-if="item.columns.length === 0" />
            <ops-descriptions
                v-if="item.title !== '节点信息'"
                :data="tabData"
                :columns="item.columns"
                :column="2"
                :label-style="{
                    width: '200px',
                    marginRight: '10px',
                    color: '#868686'
                }"
                size="small"
            >
                <template #status="{ row }">
                    <vxe-tag :class="row.status == '运行中' ? 'theme--primary' : 'theme--error'" size="small">
                        {{ row.status }}
                    </vxe-tag>
                </template>

                <template #cloud_master_account_id="{row}">
                    {{ titleData?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
                </template>

                <template #node_groups="{row}">
                    <template v-for="(group, index) in row.node_groups" :key="index">
                        <template v-for="(node, index2) in group.nodes" :key="index2">
                            <div v-for="(address, index3) in node.addresses" :key="index3" class="mb-2">
                                <a-tooltip>
                                    <template #title>
                                        <div class="text-12">{{ address.address }}{{ address.port ? `:${address.port}` : '' }}</div>
                                    </template>
                                    <vxe-tag class="theme--primary" size="small">
                                        <span class="truncate inline-block">
                                            {{ address.address }}{{ address.port ? `:${address.port}` : '' }}
                                        </span>
                                    </vxe-tag>
                                </a-tooltip>
                            </div>
                        </template>
                    </template>
                </template>
                
                <template #expire_time="{row}">
                    <ops-expired-time :expired-time="row.expire_time" :sub-page="true"/>
                </template>
            </ops-descriptions>

            <!-- 节点信息表格 -->
            <div v-else>
                <div v-for="(group, index) in tableData" :key="index" class="nodes-table">
                    <div class="mb-2" style="color: #868686;">
                        <span v-if="tabData?.deployment_mode === 'Sharding'">
                            <span class="mx-4 text-15 font-[700]">{{ group.name || group.type }}</span>
                        </span>
    
                        <span v-if="group.volume_size" class="inline-flex items-center gap-1">
                            <span class="mx-2">磁盘大小：{{ group.volume_size }}GB</span>
                            <a-tooltip>
                                <template #title>
                                    <div class="text-12">磁盘使用量：{{ group.volume_used }}GB</div>
                                </template>
                                <ops-progress :percentage="group.volume_used / group.volume_size" />
                            </a-tooltip>
                        </span>
                    </div>

                    <vxe-grid
                        :data="group.nodes"
                        v-bind="gridOptions"
                    >
                    <template #addresses="{ row }">
                        <vxe-tag v-for="(address, index2) in row.addresses" :key="index2" class="theme--primary" size="small">
                            <span class="truncate inline-block">
                                {{ address.address }}{{ address.port ? `:${address.port}` : '' }}
                            </span>
                        </vxe-tag>
                    </template>

                    <template #status="{ row }">
                        <vxe-tag :class="row.status == '运行中' ? 'theme--primary' : 'theme--error'" size="small">
                            {{ row.status }}
                        </vxe-tag>
                        </template>
                    </vxe-grid>
                </div>
            </div>
        </a-card>
    </div>
</template>

<style scoped lang="less">
:deep(.vxe-tag--content) {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
}

.mb-2 {
    &:last-child {
        margin-bottom: 0;
    }
}

.nodes-table {
    margin-bottom: 20px;

    &:last-child {
        margin-bottom: 0;
    }
}
</style>
