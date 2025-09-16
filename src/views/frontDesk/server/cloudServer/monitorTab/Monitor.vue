<script setup>
import cloudServerApi from '@/api/server/cloudServerApi';
import dayjs from 'dayjs';
import MetricChart from './metricChart.vue';
import { ecsMetrics, rangePresets, periodOptions, timeRangeOptions } from './config';

const props = defineProps({
    sid: { // 服务器id
        type: [String, Number],
        default: '',
        required: true,
    },
});

const state = reactive({
    metricList: [],
    chartList: [],
    searchParams: {
        metrics: [],
        date: [dayjs().add(-1, 'h'), dayjs()],
        filter: ['max', '60'],
    },
    refresh: false,
    autoRefresh: false,
    timer: null,
    failMetrics: '', // 获取监控指标列表失败时候
});

onMounted(async () => {
    try {
        state.failMetrics = '';
        const { data: metrics } = await cloudServerApi.monitorTabApi.getMonitorTabList(props.sid);
        state.metricList = metrics.map(item => ({
            label: ecsMetrics[item.metric_name]?.label || item.metric_name,
            value: item.metric_name,
        }));
    } catch (error) {
        state.failMetrics = error?.response;
    }
});

// 计算搜索参数
const computedSearchParams = (metrics) => {
    let params = {
        metrics: [metrics],
        start_time: state.searchParams.date[0].valueOf(),
        end_time: state.searchParams.date[1].valueOf(),
        data_filter: state.searchParams.filter[0],
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
    console.log(timeOptions, timeOptions, perOptions);

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

// 组件卸载时清理定时器
onUnmounted(() => {
    if (state.timer) {
        clearInterval(state.timer);
    }
});
</script>

<template>
    <div v-if="!state.failMetrics" class="search-box">
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

    <div v-if="!state.failMetrics" class="metric-chart-box">
        <template v-for="item in state.metricList" :key="item.value">
            <metric-chart
                v-if="!state.refresh && (state.searchParams.metrics.includes(item.value) || !state.searchParams.metrics.length)"
                :sid="props.sid" 
                :metric-name="item.value"
                :param="computedSearchParams(item.value)"
            />
        </template>
    </div>
    <a-empty v-else>

        <template #description>
           <span class="text-error">
            {{ state?.failMetrics?.data?.status_code ||state?.failMetrics?.status }}<br/>
            {{ state?.failMetrics?.data?.msg || state?.failMetrics?.statusText || `该服务器NO.${props.sid}监控指标列表获取失败`}}
           </span>
        </template>
    </a-empty>
     
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