<script setup>
import cloudServerApi from '@/api/server/cloudServerApi';
import commonApi from '@/api/common';
import * as echarts from 'echarts';

const state = reactive({
    overviewData: {},
});

// 统计卡片颜色
const summaryColor = {
    '服务器总数': '#4fb050',
    'status': '#e88250',
    'expired': '#3c79bf',
    'charge_type': '#4fb050',
};

// 统计卡片数据
const summaryList = computed(() => {
    const s = state.overviewData?.server_number;
    if (!s) return [];

    const getCount = (arr, key, value) =>
        Array.isArray(arr) ? arr.find(i => i[key] === value)?.count || 0 : 0;

    return {
        status: {
            '运行中': getCount(s.server_status_data, 'server_cloud_status', '运行中'),
            '停止': getCount(s.server_status_data, 'server_cloud_status', '停止'),
        },
        expired: {
            '即将过期(大于30小于60天)': s.expired_data_30 ?? 0,
            '即将过期(小于15天)': s.expired_data_15 ?? 0,
        },
        charge_type: {
            '包年包月': getCount(s.charge_type_data, 'charge_type', '包年包月'),
            '按量付费': getCount(s.charge_type_data, 'charge_type', '按量付费'),
        },
    };
});

// 资源分布
const descList = {
    'zone_data': { name:'区域分布', key: 'zone_id'},
    'environment_data': { name:'环境分布', key: 'environment'},
    'physical_resources': { name:'资源统计', key: 'physical_resources'},
    'server_type_data': { name:'服务器规格', key: 'server_type'},
};

const sortData = (data) => {
    return data.sort((a, b) => b.count - a.count);
};

const formatSize = (gb) => {
    if(gb === 0) {
        return '0 GB';
    }
    const sizes = ['GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(gb) / Math.log(1024));
    return parseFloat((gb / Math.pow(1024, i)).toFixed(3)) + ' ' + sizes[i];
};

// 设置区域名称
const setRegionName = async () => {
    const cloudRegionList = await commonApi.getCloudRegionList();

    state.overviewData.server_number.zone_data.forEach(item => {
        const cloudRegion = cloudRegionList?.[item.region_id];
        let zoneId = '';

        if (item.cloud_source === '华为云') {
            zoneId = `${item.zone_id}`.replace(`${item.region_id}`, '').toUpperCase();
        } else if (item.cloud_source === '阿里云') {
            zoneId = `${item.zone_id}`.replace(`${item.region_id}-`, '').toUpperCase();
        }

        if (cloudRegion) {
            item.region_id = cloudRegion;
            item.zone_id = cloudRegion + (zoneId[0] || '');
        }
    });
};

const formatData = async () => {
    await setRegionName();

    const { physical_resources, server_type_data, zone_data } = state.overviewData.server_number;

    // 资源统计数据格式转换
    const labels = {
        total_cpu: 'CPU总数',
        total_memory: '内存总数',
        total_disk: '硬盘总数',
    };
    state.overviewData.server_number.physical_resources = Object.entries(physical_resources[0]).map(
        ([key, value]) => {
            let formatValue = value;
            if(key === 'total_cpu') {
                formatValue = `${value} 核`;
            } else if(['total_disk', 'total_memory'].includes(key)) {
                formatValue = formatSize(value);
            }
            return {
                physical_resources: labels[key],
                count: formatValue,
            };
        }
    );

    // 服务器规格数据格式转换
    const sortedServerTypes = sortData(server_type_data);
    let mainTypes, otherTypes;

    if(sortedServerTypes.length > 10) {
        mainTypes = sortedServerTypes.slice(0, 9);
        otherTypes = sortedServerTypes.slice(9);

        mainTypes.push({
            server_type: '其他',
            count: otherTypes.reduce((acc, item) => acc + item.count, 0),
        });
    } else {
        mainTypes = sortedServerTypes;
    }

    state.overviewData.server_number.server_type_data = mainTypes;
    state.overviewData.server_number.server_type_data_other = otherTypes;

    // 区域分布转中文
    const zoneData = sortData(zone_data);
    let mainZoneData, otherZoneData;
    if(zoneData.length > 5) {
        mainZoneData = zoneData.slice(0, 4);
        otherZoneData = zoneData.slice(4);

        mainZoneData.push({
            zone_id: '其他',  
            count: otherZoneData.reduce((acc, item) => acc + item.count, 0),
        });
    } else {
        mainZoneData = zoneData;
    }

    state.overviewData.server_number.zone_data = mainZoneData;
    state.overviewData.server_number.zone_data_other = otherZoneData;
};

// 获取数据
const getData = async () => {
    const res = await cloudServerApi.getOverview();
    state.overviewData = res;
    formatData();
};

// 初始化趋势图
const initTrendChart = () => {
    const chartDom = document.getElementById('trendChart');
    const myChart = echarts.init(chartDom);

    let trendData = state.overviewData?.server_number?.monthly_stats.reverse();
    
    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br/>{a}: {c}'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: trendData.map(item => item.year_month),
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: '数量'
        },
        series: [{
            name: '资源数量',
            type: 'line',
            smooth: true,
            data: trendData.map(item => item.count),
            itemStyle: {
                color: '#1890ff'
            },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgba(24,144,255,0.3)'
                }, {
                    offset: 1,
                    color: 'rgba(24,144,255,0.1)'
                }])
            }
        }]
    };

    myChart.setOption(option);
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
        myChart.resize();
    });
};

onMounted(async () => {
    await getData();
    initTrendChart();
});
</script>

<template>
    <a-empty v-if="state.overviewData?.server_number?.total === 0" class="mt-10"/>

    <div v-else class="overview-container">
        <!-- 统计卡片 -->
        <div class="summary-box">
            <div 
                class="summary-item"
                :style="{ '--summary-color': summaryColor['服务器总数'], cursor: 'pointer' }"
                @click="$router.push({ name: 'cloudServerPage' })"
            >
                <div class="summary-data">
                    <div class="summary-value">{{ state.overviewData?.server_number?.total }}</div>
                    <div class="summary-title">服务器总数</div>
                </div>
                <div class="summary-icon">
                    <img :src="`/images/kvstore.png`" >
                </div>
                <div class="summary-border"></div>
            </div>

            <div 
                v-for="(item, key) in summaryList" 
                :key="key" 
                class="summary-item"
                :style="{ '--summary-color': summaryColor[key] }"
            >
                <div 
                    v-for="(count, label) in item" 
                    :key="label"
                >
                    <div class="summary-data">
                        <div class="summary-value" style="font-size: 26px;">{{ count }}</div>
                        <div class="summary-title">{{ label }}</div>
                    </div>
                    <div class="summary-border"></div>
                </div>
            </div>
        </div>
    
        <!-- 描述列表分布 -->
        <a-card title="资源分布">
            <div class="desc-box">
                <div v-for="(info, key) in descList" :key="key" class="desc-card">
                    <div class="desc-title">{{ info.name }}</div>
                    <div class="desc-list">
                        <div 
                            v-for="item in state.overviewData?.server_number?.[key]" 
                            :key="item.label"
                            :class="{ 'two-col': key === 'server_type_data' }"
                        >
                            <a-tooltip :title="item[info.key]">
                                <span 
                                    class="desc-label truncate"
                                    :style="{ minWidth: key === 'zone_data' ? '150px' : '100px' }"
                                >
                                    <CloudTypeIcon 
                                        v-if="key === 'zone_data'" 
                                        :type="item.cloud_source"
                                        style="width: 22px;"
                                    />
                                    {{ item[info.key] }}：
                                </span>
                            </a-tooltip>
                            <span class="desc-value">
                                <!-- 服务器规格数据其他项 -->
                                <span v-if="['server_type_data', 'zone_data'].includes(key) && item[info.key] === '其他'">
                                    <a-popover placement="right">
                                        <template #content>
                                            <div v-for="(otherItem, index) in state.overviewData?.server_number?.[`${key}_other`]" :key="index">
                                                <span style="color: #888;">
                                                    <CloudTypeIcon 
                                                        v-if="key === 'zone_data'" 
                                                        :type="otherItem.cloud_source"
                                                        style="width: 22px;"
                                                    />
                                                    {{ otherItem[info.key] }}:
                                                </span>
                                                {{ otherItem.count }}
                                            </div>
                                        </template>
                                        <span>{{ item.count }}</span>
                                    </a-popover>
                                </span>

                                <span v-else>{{ item.count }}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </a-card>

        <!-- 资源数量趋势 -->
        <a-card title="资源数量趋势">
            <div id="trendChart" style="width: 100%; height: 400px;"></div>
        </a-card>
    
        <!-- 告警信息 -->
        <a-card class="overview-section" title="告警">
            <div v-if="state.overviewData?.alert_number?.length === 0">暂无告警</div>
            <div v-else>告警数量：{{ state.overviewData?.alert_number?.length }}</div>
        </a-card>
    </div>
</template>

<style scoped lang="less">
.overview-container {
    flex: auto;
    overflow: auto;
    padding: 0 4px;
    padding-bottom: 24px;
}

:deep(.ant-card) {
    margin-top: 14px;
    box-shadow: 0 4px 4px rgba(0,0,0,0.08);

    .ant-card-body {
        padding: 0px 24px 24px 24px;
    }
}

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

            img {
                width: 100%;
                height: 100%;
            }
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

.desc-box {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    justify-content: flex-start;

    .desc-card {
        flex: 1 1 220px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        padding: 16px 18px 12px 18px;
    }
    .desc-title {
        font-weight: 600;
        font-size: 17px;
        margin-bottom: 12px;
        text-align: center;
        color: var(--primary-color);
    }
    .desc-list {
        min-width: 250px;

        div {
            display: flex;
            margin-bottom: 8px;
        }
        .two-col {
            display: inline-flex;
            width: 50%;
        }
        .desc-label {
            color: #888;
            font-size: 14px;
            display: inline-block;
            min-width: 100px;
            max-width: 150px;
        }
        .desc-value {
            font-weight: 500;
            color: #333;
            font-size: 15px;
        }
    }
}
</style>