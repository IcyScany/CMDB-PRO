<script setup>
import useAlertManageApi from '@/api/alert/manageApi';
import ResourceChart from '@/views/frontDesk/dashboards/ResourceDisplay/components/ResourceChart.vue';

let { getOverview } = useAlertManageApi;
const state = reactive({
    overview: {
        top: [
            {
                label: '告警总数',
                value: 'alert_total_number',
                img: '/images/alert-info.png',
                border_color: 'primary',
                summary_color: '#4fb050',
                
            },
            {
                label: '告警分组',
                value: 'alert_group_number',
                img: '/images/alert-group.png',
                border_color: 'primary',
                summary_color: '#3c79bf',
            },
            {
                label: '告警等级',
                value: 'alert_level_number',
                img: '/images/alert-level.png',
                border_color: 'primary',
                summary_color: '#4fb050',
            },
        ],
        middle: [
            {
                label: 'P0',
                value: 'P0',
               
            },
            {
                label: 'P1',
                value: 'P1',
             
            },
            {
                label: 'P2',
                value: 'P2',
             
            },
            {
                label: 'P3',
                value: 'P3',
            
            },
        ],
    },
    overview_data: {},
});

onMounted(async () => {
    try {
        let res = await getOverview();
        state.overview_data = res;
    } catch (error) {
        console.log(error);
    }
});

let emit = defineEmits(['customChange']);

const trendChartOptions = computed(() => {
    const trend = state.overview_data?.alert_trend || {};
    const info = trend.info_trend || [];
    const source = trend.source_trend || [];

    // 生成最近30天日期
    const days = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
    }

    // 日期->数量映射
    const infoMap = Object.fromEntries(info.map(i => [i.date, i.count]));
    const sourceMap = Object.fromEntries(source.map(i => [i.date, i.count]));

    const infoData = days.map(day => infoMap[day] || 0);
    const sourceData = days.map(day => sourceMap[day] || 0);

    return {
        tooltip: { trigger: 'axis' },
        legend: { data: ['收到的告警', '发送的告警'] },
        xAxis: { type: 'category', data: days },
        yAxis: { type: 'value' },
        series: [
            { name: '收到的告警', type: 'line', data: sourceData, smooth: true },
            { name: '发送的告警', type: 'line', data: infoData, smooth: true }
        ]
    };
});

const hasTrendData = computed(() => {
    const trend = state?.overview_data?.alert_trend;
    if (!trend) return false;
    const info = trend.info_trend || [];
    const source = trend.source_trend || [];
    return info.length > 0 || source.length > 0;
});

</script>

<template>
    <div v-if="state.overview_data" class="overview-container">
        <!-- 统计卡片 -->
        <div class="summary-box">
                <div 
                    v-for="item in state.overview.top" 
                    :key="item.value" 
                    class="summary-item"
                    :style="{ '--summary-color': item.summary_color }"
                >
                        <div class="summary-data cursor-pointer" @click="emit('customChange', item)">
                            <div class="summary-value text-[26px]"> 
                                {{ state?.overview_data?.[item.value] || 0 }}
                            </div>
                            <div class="summary-title" >{{ item.label }}</div>
                        </div>
                        <div class="summary-icon">
                            <img 
                                style="width: 100%; height: 100%;"
                                :src="item.img"
                            >
                        </div>
                        <div class="summary-border"></div>
                </div>
                
        </div>
           <!-- 描述列表分布 -->
           <a-card title="等级信息">
                <a-row :gutter="16" class="mb-5">
                <template v-for="level in state.overview.middle" :key="level.value">
                    <a-col :span="Number(24 / state.overview.middle.length).toFixed(0)">
                    <div class="flex flex-col items-center shadow p-6 bg-white rounded-xl">
                        <a-progress
                        type="circle"
                        :percent="100"
                        :width="120"
                        :stroke-color="$CONFIG?.ALERT_LEVEL_COLOR?.[level.value]?.color"
                        :stroke-width="8"
                        >
                        <template #format>
                            <div class="flex flex-col items-center justify-center">
                            <span :style="{ color: `var(--alert-level-${level.value})`, fontWeight: 'bold', fontSize: '2rem' }">
                                {{ level.label }}
                            </span>
                            <span class="text-xl text-black" style="color: #000;">
                                {{ state?.overview_data?.alert_number && $utils.groupBy(state?.overview_data?.alert_number, 'alert_level')?.[level.value]?.[0]?.['count']  || 0}}
                            </span>
                            </div>
                        </template>
                        </a-progress>
                    </div>
                    </a-col>
                </template>
            </a-row>
        </a-card>
        <!-- 告警趋势 -->
        <a-card title="告警趋势">
          <template v-if="hasTrendData">
            <ResourceChart :id="'trendChart'" :options="trendChartOptions" style="width: 100%; height: 400px;" />
          </template>
          <template v-else>
            <a-empty description="暂无数据">
              <template #title>暂无数据</template>
            </a-empty>
          </template>
        </a-card>
    </div>

  <a-empty
       v-else
        description="暂无数据"
    >
        <template #title>
            暂无数据
        </template>
    </a-empty>

</template>

<style scoped lang="less">

.bg-primary-400 {
    background-color: var(--primary-4);
}

.overview-container {
    flex: auto;
    overflow: auto;
    padding: 0 4px;
    padding-bottom: 24px;

    .summary-box {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    margin: 20px 0;

    .summary-item {
        position: relative;
        flex: 1 1 160px;
        display: flex;
        align-items: center;
        justify-content: space-around;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        padding: 20px 10px;

        .summary-value {
            font-size: 32px;
            font-weight: 600;
            color: var(--summary-color);
            margin-bottom: 8px;
        }

        .summary-title {
            font-size: 14px;
            color: #666;
        }

        .summary-icon {
            width: 40px;
            height: 40px;
            background: var(--summary-color);
            opacity: 0.4;
            border-radius: 8px;
        }

        .summary-border {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 90%;
            transform: translateX(5%);
            height: 3px;
            border-radius: 2px;
            background: var(--summary-color);
        }
    }
}

:deep(.ant-card) {
    margin-top: 14px;
    box-shadow: 0 4px 4px rgba(0,0,0,0.08);

    .ant-card-body {
        padding: 0px 24px 24px 24px;
    }
}
}

</style>
