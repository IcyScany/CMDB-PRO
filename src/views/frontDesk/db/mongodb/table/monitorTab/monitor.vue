<script setup>
import { apiList } from "@/api/db/mongodb";
import dayjs from 'dayjs';
import MetricChart from './metricChart.vue';
import { mongodbMetrics, rangePresets, periodOptions, timeRangeOptions } from './config';

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

const INSTANCE = {
    roles: ['全部', 'Primary', 'Secondary', 'Hidden'],
    groupType: {
        '实例级指标': '实例级指标',
        'mongos': 'mongos节点',
        'shard': 'shard节点',
        'config': 'config节点',
    },
    hiddenFields: {
        '实例级指标': ['mongosId', 'shardName', 'role'],
        'mongos': ['role', 'shardName'],
        'shard': ['mongosId'],
        'config': ['mongosId', 'shardName'],
    }
};

const state = reactive({
    refresh: false,
    autoRefresh: false,
    timer: null,
    nodeMetrics: {},
    searchParams: {
        metrics: [],
        date: [dayjs().add(-1, 'h'), dayjs()],
        filter: ['average', '1'],
    },
    selectedValue: {
        groupType: '实例级指标',
        mongosId: '全部',
        shardName: '',
        role: '全部',
    },
});

onMounted(async () => {
    gerMetrics();
});

// mongos节点选项
const mongosOptions = computed(() => {
    const options = [{ label: '全部', value: '全部' }];
    currentNodeInfo.value.nodeGroup?.nodes?.forEach(node => {
        options.push({
            label: node.name,
            value: node.cloud_node_id,
        });
    });
    return options;
});

// shard节点选项
const shardOptions = computed(() => 
    props.rowData.node_groups
        .filter(group => group.type === 'shard')
        .map(group => ({ label: group.name, value: group.name }))
);

// 指标选项
const metricsOpts = computed(() => {
    // 实例级指标
    if(props.rowData?.deployment_mode === 'Sharding' && state.selectedValue.groupType === '实例级指标') {
        return state.nodeMetrics['instance'];
    }

    // 节点级指标
    const nodeId = currentNodeInfo.value.node.cloud_node_id;
    if (nodeId) {
        return state.nodeMetrics[nodeId] || [];
    }

    let options = [];
    for(let node of currentNodeInfo.value.nodeGroup.nodes || []) {
        for(let metric of state.nodeMetrics[node.cloud_node_id] || []) {
            if(!options.find(item => item.value === metric.value)) {
                options.push(metric);
            }
        }
    }
    return options;
});

// 当前选择的节点组及节点
const currentNodeInfo = computed(() => {
    const { deployment_mode, node_groups } = props.rowData;
    let nodeGroup, node;

    if (deployment_mode === 'ReplicaSet') {
        nodeGroup = node_groups[0];
        node = nodeGroup?.nodes.find(n => n.role === state.selectedValue.role);
    } else if (deployment_mode === 'Sharding') {
        nodeGroup = node_groups.find(group => {
            if (state.selectedValue.groupType === 'shard') {
                return group.name === state.selectedValue.shardName;
            }
            return group.type === state.selectedValue.groupType;
        });

        if (state.selectedValue.groupType === 'mongos') {
            node = nodeGroup?.nodes.find(n => n.cloud_node_id === state.selectedValue.mongosId);
        } else {
            node = nodeGroup?.nodes.find(n => n.role === state.selectedValue.role);
        }
    }

    return { nodeGroup: nodeGroup || {}, node: node || {} };
});

// 获取指标数据
const gerMetrics = async () => {
    const allNodes = props.rowData.node_groups.reduce((acc, group) => [...acc, ...group.nodes], []);

    // 获取节点级指标
    for (const node of allNodes) {
        const { metrics } = await apiList.monitor.postMetric(props.sid, {
            cloud_node_id: node.cloud_node_id
        });
        
        state.nodeMetrics[node.cloud_node_id] = metrics.map(metric => ({
            label: mongodbMetrics[metric.metric_name]?.label || metric.metric_name,
            value: metric.metric_name
        }));
    }

    // 获取实例级指标
    const { metrics } = await apiList.monitor.postMetric(props.sid);
    state.nodeMetrics['instance'] = metrics.map(metric => ({
        label: mongodbMetrics[metric.metric_name]?.label || metric.metric_name,
        value: metric.metric_name
    }));
};

// 计算搜索参数
// 计算搜索参数
const computedSearchParams = (metrics) => {
    const { deployment_mode, cloud_instance_id } = props.rowData;
    const metricsParams = [];

    if (deployment_mode === 'ReplicaSet') {
        currentNodeInfo.value.nodeGroup.nodes.forEach(node => {
            if (state.selectedValue.role !== '全部' && currentNodeInfo.value.node.role !== node.role) {
                return;
            }
            metricsParams.push({
                metric_name: metrics,
                dimensions: [
                    { name: "mongodb_instance_id", value: cloud_instance_id },
                    { name: "mongodb_node_id", value: node.cloud_node_id }
                ]
            });
        });
    } else if (deployment_mode === 'Sharding') {
        if (state.selectedValue.groupType === '实例级指标') {
            metricsParams.push({
                metric_name: metrics,
                dimensions: [{ name: "mongodb_instance_id", value: cloud_instance_id }]
            });
        } else {
            currentNodeInfo.value.nodeGroup?.nodes?.forEach(node => {
                if (state.selectedValue.mongosId !== '全部' && 
                    currentNodeInfo.value.node.cloud_node_id !== node.cloud_node_id) {
                    return;
                }
                if (state.selectedValue.role !== '全部' && 
                    currentNodeInfo.value.node.role !== node.role) {
                    return;
                }
                metricsParams.push({
                    metric_name: metrics,
                    dimensions: [
                        { name: "mongodb_instance_id", value: cloud_instance_id },
                        { name: "mongodb_node_id", value: node.cloud_node_id }
                    ]
                });
            });
        }
    }

    return {
        start_time: state.searchParams.date[0],
        end_time: state.searchParams.date[1],
        filter: state.searchParams.filter[0],
        period: state.searchParams.filter[1],
        metrics: metricsParams
    };
};

// 计算颗粒度选项
const computedPeriodOptions = () => {
    const dateRange = state.searchParams.date[1].diff(state.searchParams.date[0], 'day');
    let timeOptions = [...timeRangeOptions];
    let perOptions = [...periodOptions];

    // 大于10天，去除5分钟选项及原始值选项
    if(dateRange > 10) {
        timeOptions = timeOptions.filter(item => item.value !== '300');
        perOptions = perOptions.filter(item => item.label !== '原始值');
    }
    // 大于20天，去除20分钟选项
    if(dateRange > 20) {
        timeOptions = timeOptions.filter(item => item.value !== '1200');
    }
    // 大于155天，去除1小时选项
    if(dateRange > 155) {
        timeOptions = timeOptions.filter(item => item.value !== '3600');
    }

    // 去除大于时间范围的颗粒度
    timeOptions = timeOptions.filter(item => 
        item.value <= state.searchParams.date[1].diff(state.searchParams.date[0], 'seconds')
    );

    return perOptions.map(item => ({
        ...item,
        children: item.label === '原始值' ? null : timeOptions
    }));
};

// 刷新
const handleRefresh = () => {
    state.refresh = true;
    nextTick(() => {
        state.refresh = false;
    });
};

// 选项切换
const changeSelect = (type, item) => {
    state.selectedValue[type] = item;

    if (type === 'groupType') {
        state.selectedValue.mongosId = '全部';
        state.selectedValue.role = '全部';
        state.selectedValue.shardName = props.rowData.node_groups
            .find(group => group.type === 'shard')?.name || '';
    } else if (type === 'mongosId') {
        state.selectedValue.role = '全部';
    }

    state.searchParams.metrics = [];
    state.searchParams.date = [dayjs().add(-1, 'h'), dayjs()];
    state.searchParams.filter = ['average', '1'];

    handleRefresh();
};

// 根据节点分组类别，判断是否展示选择项
const selectVisible = (type) => {
    return !INSTANCE.hiddenFields[state.selectedValue.groupType]?.includes(type);
};

// 监听时间范围, 默认选择第一个颗粒度
watch(
    () => state.searchParams.date,
    () => {
        const options = computedPeriodOptions();
        state.searchParams.filter = options[0].label === '原始值' 
            ? ['average', '1']
            : ['average', options[0].children[0].value];
        handleRefresh();
    },
    { deep: true }
);

// 监听自动刷新
watch(
    () => state.autoRefresh,
    val => {
        if (val) {
            state.timer = setInterval(handleRefresh, 30000);
        } else {
            clearInterval(state.timer);
        }
    }
);
</script>

<template>
    <!-- 分片集群模式(Sharding)选择项 -->
    <template v-if="rowData?.deployment_mode === 'Sharding'">
        <!-- 节点分组类别 -->
        <div class="select-box">
            <span
                v-for="(label, key) in INSTANCE.groupType" 
                :key="key" 
                :class="{ 'box-item-selected': state.selectedValue.groupType === key }"
                @click="changeSelect('groupType', key)"
            >
                {{ label }}
            </span>
        </div>
    
        <!-- mongos节点选择 -->
        <div v-if="selectVisible('mongosId')" class="select-box">
            dds mongos节点
            <a-select
                v-model:value="state.selectedValue.mongosId"
                :options="mongosOptions"
                @change="changeSelect('mongosId', $event)"
            />
        </div>
    
        <!-- shard节点选择 -->
        <div v-if="selectVisible('shardName')" class="select-box">
            shard节点
            <a-select
                v-model:value="state.selectedValue.shardName"
                :options="shardOptions"
                :default-active-first-option="true"
                @change="changeSelect('shardName', $event)"
            />
        </div>
    </template>

    <!-- 角色 -->
    <div v-if="selectVisible('role') || rowData?.deployment_mode === 'ReplicaSet'" class="select-box">
        <span
            v-for="item in INSTANCE.roles" 
            :key="item" 
            :class="{ 'box-item-selected': state.selectedValue.role === item }"
            @click="changeSelect('role', item)"
        >
            {{ item }}
        </span>
    </div>

    <!-- 节点信息 -->
    <div class="node-info">
        节点名称 <span>{{ currentNodeInfo.node.name || '--' }}</span>
        节点ID  <span>{{ currentNodeInfo.node.cloud_node_id || '--' }}</span>
        运行状态 <span :class="{ 'text-primary': currentNodeInfo.node.status === '运行中' }">{{ currentNodeInfo.node.status || '--' }}</span>
    </div>

    <div class="search-box">
        <!-- 指标名称 -->
        <a-select 
            v-model:value="state.searchParams.metrics" 
            placeholder="指标名称"
            :options="metricsOpts" 
            :dropdown-match-select-width="false"
            mode="multiple"
            @change="handleRefresh"
        />
        <!-- 时间范围 -->
        <a-range-picker
            v-model:value="state.searchParams.date"
            show-time
            :allow-clear="false"
            :presets="rangePresets"
            format="YYYY/MM/DD HH:mm:ss"
        />
        <!-- 颗粒度 -->
        <a-cascader 
            v-model:value="state.searchParams.filter" 
            :options="computedPeriodOptions()"
            :allow-clear="false"
            @change="handleRefresh"
        >
            <template #displayRender="{ labels}">
                {{ labels[1] === '1' ? '原始值' :`${labels[0]} / ${labels[1]}` }}
            </template>
        </a-cascader>
        <!-- 刷新 -->
        <a-tooltip title="刷新">
            <a-button @click="handleRefresh">
                <RedoOutlined />
            </a-button>
        </a-tooltip>
        <!-- 自动刷新 -->
        <div class="ml-4">
            自动刷新：
            <a-tooltip title="每30秒自动刷新">
                <a-switch v-model:checked="state.autoRefresh" />
            </a-tooltip>
        </div>
    </div>

    <div class="metric-chart-box">
        <template 
            v-for="item in metricsOpts" 
            :key="item.value"
        >
            <metric-chart
                v-if="!state.refresh && 
                    (state.searchParams.metrics.includes(item.value) ||
                    !state.searchParams.metrics.length)"
                :param="computedSearchParams(item.value)"
                :node-group="currentNodeInfo.nodeGroup"
            />
        </template>
    </div>
</template>

<style lang="scss" scoped>
.search-box {
    display: flex;
    align-items: center;
    gap: 10px;

    .ant-select {
        width: 250px;
    }
}

.metric-chart-box {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 10px;
}

.select-box {
    margin-bottom: 15px;

    span {
        padding-right: 15px;
        margin-right: 15px;
        line-height: 1;
        color: #797979;
        cursor: pointer;

        &:not(:last-child) {
            border-right: 1px solid #b9b9b9;
        }
    }

    .box-item-selected {
        color: #323232;
        text-shadow: 0 0 0.4px #000000;
    }

    .ant-select {
        width: 300px;
        margin-left: 20px;
    }
}

.node-info {
    margin-bottom: 15px;
    color:rgb(66, 66, 66);

    span {
        margin-left: 20px;
        margin-right: 50px;
    }
}
</style>