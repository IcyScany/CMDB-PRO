<script setup>
import API from "@/api/network/loadBalancer";
import dayjs from 'dayjs';
import MetricChart from './metricChart.vue';
import { rangePresets, periodOptions, timeRangeOptions, dimensionsOptions, loadBalancerMetrics } from './config';

const props = defineProps({
    row: {
        type: Object,
        default: () => {},
    },
});

const state = reactive({
    metricList: [],
    chartList: [],
    dimensionsType: 'lbaas_instance_id',
    dimensionsValue: '',
    searchParams: {
        metrics: [],
        date: [dayjs().add(-1, 'h'), dayjs()],
        filter: ['average', '1'],
    },
    refresh: false,
    autoRefresh: false,
    timer: null,
});

const dimensions = computed(() => {
    let metricsParams = [
        {
            name: 'lbaas_instance_id',
            value: props.row.cloud_instance_id,
        },
    ];
    if(state.dimensionsType !== 'lbaas_instance_id') {
        metricsParams.push({
            name: state.dimensionsType,
            value: state.dimensionsValue,
        });
    }
    return metricsParams;
});

const dimensionsValueOptions = computed(() => {
    if(state.dimensionsType === 'lbaas_listener_id') {
        return props.row.listeners.map(item => ({
            label: item.name,
            value: item.id,
        }));
    }
    if(state.dimensionsType === 'lbaas_pool_id') {
        return props.row.server_groups.map(item => ({
            label: item.id,
            value: item.id,
        }));
    }
});

onMounted(async () => {
    getMetric();
});

const getMetric = async () => {
    state.refresh = true;  
    const { metrics } = await API.getMetric(props.row.id, dimensions.value);
    state.metricList = metrics.map(item => ({
        label: loadBalancerMetrics[item.metric_name]?.label || item.metric_name,
        value: item.metric_name,
    }));
    
    state.refresh = false;
};

const changeDimensionsType = async () => {
    if(state.dimensionsType !== 'lbaas_instance_id') {
        state.dimensionsValue = dimensionsValueOptions.value[0].value;
    }
    state.searchParams.metrics = [];
    state.searchParams.filter = ['average', '1'];
    state.searchParams.date = [dayjs().add(-1, 'h'), dayjs()];
    
    await getMetric();
};

// 计算搜索参数
const computedSearchParams = (metrics) => {
    let params = {
        metrics: [{
            metric_name: metrics.value,
            dimensions: dimensions.value,
        }],
        start_time: state.searchParams.date[0],
        end_time: state.searchParams.date[1],
        filter: state.searchParams.filter[0],
        period: state.searchParams.filter[1],
    };
    return params;
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

    return perOptions.map(item => {
        return {
            ...item,
            children: item.label === '原始值' ?  null : timeOptions,
        };
    });
};

// 刷新
const handleRefresh = () => {
    state.refresh = true;
    nextTick(() => {
        state.refresh = false;
    });
};

// 监听指标名称和颗粒度
watch(() => [state.searchParams.metrics, state.searchParams.filter], () => {
    handleRefresh();
}, { deep: true });

// 监听时间范围, 默认选择第一个颗粒度
watch(() => state.searchParams.date, () => {
    if(computedPeriodOptions()[0].label === '原始值') {
        state.searchParams.filter = ['average', '1'];
    } else {
        state.searchParams.filter = ['average', computedPeriodOptions()[0].children[0].value];
    }
    handleRefresh();
}, { deep: true });

// 监听自动刷新
watch(() => state.autoRefresh, val => {
    if(val) {
        state.timer = setInterval(() => {
            handleRefresh();
        }, 30000);
    } else {
        clearInterval(state.timer);
    }
});

watch(() => props.row, async () => {
    if(props.row?.id) {
        await getMetric();
    }
});
</script>

<template>
    <div class="search-box mb-4">
        <span>监控粒度</span>
        <a-select 
            v-model:value="state.dimensionsType" 
            :options="dimensionsOptions"
            @change="changeDimensionsType"
        />
        <a-select
            v-if="state.dimensionsType !== 'lbaas_instance_id'"
            v-model:value="state.dimensionsValue"
            :options="dimensionsValueOptions"
            @change="getMetric"
        />
    </div>

    <div class="search-box">
        <!-- 指标名称 -->
        <a-select 
            v-model:value="state.searchParams.metrics" 
            placeholder="指标名称"
            :options="state.metricList" 
            :dropdown-match-select-width="false"
            mode="multiple"
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
        <template v-for="item in state.metricList" :key="item.value">
            <metric-chart
                v-if="!state.refresh && (state.searchParams.metrics.includes(item.value) || !state.searchParams.metrics.length)"
                :sid="props.row.id" 
                :metric-name="item.value"
                :param="computedSearchParams(item)"
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
</style>