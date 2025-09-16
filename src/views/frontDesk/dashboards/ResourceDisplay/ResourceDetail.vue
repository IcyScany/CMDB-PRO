<script setup>
import * as echarts from 'echarts';
import { debounce } from 'xe-utils';

let props = defineProps({
    resourceData: {
        type: Array,
        required: true
    }
});

let { resourceData } = toRefs(props);
let chartsInstance = { // 图表实例
    regionChartInstance: null, // 区域分布图表实例
    chargeTypeChartInstance: null, // 计费方式图表实例
    dbInstanceChartInstance: null, // 数据库实例数量柱状图表实例
    expiringChartInstance: null, // 资源到期提醒图表实例
};
const cloudRegionList = inject('cloudRegionList');

let selectedBusinesses = inject('selectedBusinesses');




// 添加显示模式状态
const regionDisplayMode = ref('chart'); // 'chart' 或 'table'

// 生成环形图的基础配置
const getDonutChartBaseOption = (data, {
    title = '',
    center = ['52%', '80%'],
    legendConfig = {},
    labelConfig = {},
    totalConfig = {
        left: 'center',
        top: '40%',
        textStyle: {
            fontSize: 14,
            fontWeight: 'bold'
        }
    }
} = {}) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    const baseOption = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'horizontal',
            left: 0,
            bottom: 0,
            itemWidth: 10,
            itemHeight: 10,
            textStyle: {
                fontSize: 12,
                color: '#666'
            },
            ...legendConfig
        },
        title: {
            text: title,
            left: 'center',
            bottom: 0,
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold',
                color: '#333',
            },
        },
        series: [
            {
                name: title,
                type: 'pie',
                radius: ['40%', '70%'],
                center: center,
                avoidLabelOverlap: true,
                top: 0,
                right: 20,
                bottom: 100,
                left: 0,
                itemStyle: {
                    borderRadius: 4,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'outside',
                    formatter: '{b}: {c}\n{d}%',
                    ...labelConfig
                },
                labelLine: {
                    show: true,
                    length: 15,
                    length2: 10,
                    smooth: true,
                    lineStyle: {
                        width: 1,
                        type: 'solid'
                    }
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 14,
                        fontWeight: 'bold'
                    }
                },
                data: data
            }
        ],
        graphic: {
            elements: [
                {
                    type: 'group',
                    left: totalConfig.left,
                    top: totalConfig.top,
                    children: [
                        {
                            type: 'text',
                            style: {
                                text: '总计',
                                textAlign: 'center',
                                fill: '#333',
                                fontSize: 14,
                                fontWeight: 'normal'
                            },
                            left: 'center',
                            top: -10
                        },
                        {
                            type: 'text',
                            style: {
                                text: total.toString(),
                                textAlign: 'center',
                                fill: '#333',
                                fontSize: 20,
                                fontWeight: 'bold'
                            },
                            left: 'center',
                            top: 10
                        }
                    ]
                }
            ]
        }
    };
    return baseOption;
};

// 格式化区域数据为图表所需格式
const formatRegionData = (regionData) => {
    if (!regionData) return { data: [], totalCount: 0 };
    
    let totalCount = 0;
    const data = [];

    // 将所有区域的数据合并到一个数组中
    Object.entries(regionData).forEach(([region, zones]) => {
        Object.entries(zones).forEach(([zone, count]) => {
            totalCount += count;
            // 获取区域的中文名称
            const regionName = cloudRegionList.value[region] || region + `-`;
         
            data.push({
                name: `${regionName}${zone.slice(zone.indexOf(region)-1).toUpperCase()}区`,
                value: count,
                itemStyle: {
                    opacity: 0.7
                }
            });
        });
    });

    return { data, totalCount };
};

// 单位转换函数
const formatStorageUnit = (value, threshold = 1024) => {
    if (value >= threshold) {
        return {
            value: (value / threshold).toFixed(2),
            unit: 'TB'
        };
    }
    return {
        value: value,
        unit: 'GB'
    };
};

let selectedBusiness = ref([]);

// 检查图表实例是否有效
const isChartValid = (chart) => {
    return chart && !chart.isDisposed();
};

// 刷新资源数据
const refreshResourceData = async () => {
    try {
    
        nextTick(() => {
            updateRegionCharts();
            updateChargeTypeCharts();
            updateDbInstanceCharts();
            updateExpiringCharts();
        });
    } catch (error) {
        console.error('Failed to fetch resource data:', error);
    }
};
const updateMainContentBg = (bg) => {
    const mainContent = document.querySelector('.main-content');
    if(mainContent){
        mainContent.style.setProperty('background-color', bg);
    }
};

onMounted(async () => {
    regionDisplayMode.value = 'chart';
   
    updateMainContentBg('rgb(246 247 250)');
  
    selectedBusiness.value = [];
    await refreshResourceData();
    window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
   
    updateMainContentBg('white');
});

// 处理窗口大小变化
const handleResize = debounce(() => {
    try {
        if (isChartValid(chartsInstance.regionChartInstance)) {
            chartsInstance.regionChartInstance.resize();
        }
        if (isChartValid(chartsInstance.chargeTypeChartInstance)) {
            chartsInstance.chargeTypeChartInstance.resize();
        }
        if (isChartValid(chartsInstance.dbInstanceChartInstance)) {
            chartsInstance.dbInstanceChartInstance.resize();
        }
        if (isChartValid(chartsInstance.expiringChartInstance)) {
            chartsInstance.expiringChartInstance.resize();
        }
    } catch (error) {
        console.error('Error during resize:', error);
    }
}, 300);



// 图表渲染方法
const updateRegionCharts = () => {
    resourceData.value.forEach((item, idx) => {
        const chartId = `regionChart_${idx}`;
        let chartInstance = echarts.getInstanceByDom(document.getElementById(chartId));
        if (!chartInstance) {
            chartInstance = echarts.init(document.getElementById(chartId));
        }
        const regionData = formatRegionData(item.server?.region);
        const option = getDonutChartBaseOption(regionData.data, { title: '' });
      
        chartInstance && chartInstance.setOption(option, true);
    });
};
const updateChargeTypeCharts = () => {
    resourceData.value.forEach((item, idx) => {
        const chartId = `chargeTypeChart_${idx}`;
        let chartInstance = echarts.getInstanceByDom(document.getElementById(chartId));
        if (!chartInstance) {
            chartInstance = echarts.init(document.getElementById(chartId));
        }
        const chargeTypeData = item.server?.charge_type || {};
        const formattedData = Object.entries(chargeTypeData).map(([type, count]) => ({ name: type, value: count }));
        const option = getDonutChartBaseOption(formattedData, { title: '' });
        chartInstance && chartInstance.setOption(option, true);
    });
};
const updateDbInstanceCharts = () => {
    resourceData.value.forEach((item, idx) => {
        const chartId = `dbInstanceChart_${idx}`;
        let chartInstance = echarts.getInstanceByDom(document.getElementById(chartId));
        if (!chartInstance) {
            chartInstance = echarts.init(document.getElementById(chartId));
        }
        // 构造数据库实例数据
        const mysqlCount = item.mysql['cn-east-3'] || 0;
        const redisCount = item.redis['cn-east-3'] || 0;
        const mongoCount = item.mongoDB['cn-east-3'] || 0;
        const option = {
            title: { text: '', left: 'center', bottom: 0 },
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: { left: '3%', right: '4%', bottom: '15%', top: '3%', containLabel: true },
            xAxis: { type: 'category', data: ['MySQL', 'Redis', 'MongoDB'], axisLabel: { interval: 0 } },
            yAxis: { type: 'value', name: '实例数量', position: 'left' },
            series: [{
                name: '实例数量',
                type: 'bar',
                data: [mysqlCount, redisCount, mongoCount],
                itemStyle: { color: params => ['#1890ff', '#52c41a', '#722ed1'][params.dataIndex] },
                barWidth: '20%',
                label: { 
                    show: true, 
                    position: 'insideTop',
                    formatter: params => params.value,
                    distance: 0,
                    
                },
                
            }]
        };
        chartInstance.setOption(option, true);
    });
};
const updateExpiringCharts = () => {
    resourceData.value.forEach((item, idx) => {
        const chartId = `expiringChart_${idx}`;
        let chartInstance = echarts.getInstanceByDom(document.getElementById(chartId));
        if (!chartInstance) {
            chartInstance = echarts.init(document.getElementById(chartId));
        }
        const option = {
            title: { text: '', left: 'center', top: 0 },
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
            xAxis: { type: 'category', data: ['服务器', 'MySQL', 'Redis', 'MongoDB'], axisLabel: { interval: 0 } },
            yAxis: { type: 'value', name: '数量' },
            series: [{
                name: '即将到期数量',
                type: 'bar',
                data: [item.server?.expiring_soon_number || 0, item.mysql?.expiring_soon_number || 0, item.redis?.expiring_soon_number || 0, item.mongoDB?.expiring_soon_number || 0],
                itemStyle: { color: params => ['#ff4d4f', '#ff7a45', '#ffa940', '#ffec3d'][params.dataIndex] },
                barWidth: '40%',
                label: { show: true, position: 'top' }
            }]
        };
        chartInstance.setOption(option, true);
    });
};
const reloadChart = () => {
    nextTick(() => {
        updateRegionCharts();
        updateChargeTypeCharts();
        updateDbInstanceCharts();
        updateExpiringCharts();
    });
};
onMounted(() => {
    reloadChart();
});

watch(() => selectedBusinesses.value, () => {
   
    reloadChart();
});



</script>

<template>
    
    <div class="resource-display">
        <h3 class="page-title">服务器</h3>
        <!-- 区域分布模块 -->
        <div class="charts-container">
            <h3 class="multi-chart-title ml-2">资源分布</h3>
            <div class="multi-chart-row resource-part-box">
               
                <div v-for="(item, idx) in resourceData" :key="item.business" class="multi-chart-item">
                    <div :id="`regionChart_${idx}`" class="chart"></div>
                    <div class="chart-title">{{ item.business }}</div>
                </div>
            </div>
        </div>
        <!-- 计费方式模块 -->
        <div class="charts-container">
            <h3 class="multi-chart-title ml-2">计费方式</h3>
            <div class="multi-chart-row">
                <div v-for="(item, idx) in resourceData" :key="item.business" class="multi-chart-item">
                    <div :id="`chargeTypeChart_${idx}`" class="chart"></div>
                    <div class="chart-title">{{ item.business }}</div>
                </div>
            </div>
        </div>
        <!-- 资源汇总卡片：每个业态一组卡片 -->
        <div class="charts-container">
            <h3 class="multi-chart-title ml-2">资源汇总</h3>
            <div class="multi-chart-row">
                <div v-for="item in resourceData" :key="item.business" class="multi-chart-item">
                    
                    <div class="resource-cards">
                        <div v-for="card in [
                            { title: 'CPU', value: item.server?.physical_resources?.total_cpu, unit: '核', icon: 'cpu', color: '#1890ff' },
                            { title: '内存', icon: 'memory', color: '#52c41a', ...formatStorageUnit(item.server?.physical_resources?.total_ram) },
                            { title: '硬盘', icon: 'disk', color: '#722ed1', ...formatStorageUnit(item.server?.physical_resources?.total_disk) }
                        ]" :key="card.title" class="resource-card" :style="{ borderColor: card.color }">
                            <div class="card-icon" :style="{ backgroundColor: card.color }">
                                <i :class="'icon-' + card.icon"></i>
                            </div>
                            <div class="card-content">
                                <div class="card-title">{{ card.title }}</div>
                                <div class="card-value">{{ card.value }}<span class="card-unit">{{ card.unit }}</span></div>
                            </div>
                        </div>
                    </div>
                    <div class="chart-title">{{ item.business }}</div>
                </div>
            </div>
        </div>
    </div>
    <div class="database-section">
        <h3 class="page-title">数据库</h3>
        <div class="db-charts-container">
            <h3 class="multi-chart-title ml-2">实例数</h3>
            <div class="multi-chart-row">
                <div v-for="(item, idx) in resourceData" :key="item.business" class="multi-chart-item">
                    <div :id="`dbInstanceChart_${idx}`" class="chart"></div>
                    <div class="chart-title">{{ item.business }}</div>
                </div>
            </div>
        </div>
        <!-- 容量统计进度条：每个业态一组进度条 -->
        <div class="charts-container">
            <h3 class="multi-chart-title ml-2">容量统计</h3>
            <div class="multi-chart-row">
                <div v-for="item in resourceData" :key="item.business" class="multi-chart-item">
                    
                    <div class="capacity-items">
                        <div class="capacity-item">
                            <span class="capacity-label">MySQL</span>
                            <a-progress :percent="item.mysql?.total_disk ? Math.round(item.mysql.total_disk / 100 * 100) : 0" :stroke-color="'#1890ff'" :show-info="false" size="small" class="capacity-progress" />
                            <span class="capacity-value">{{ item.mysql?.total_disk || 0 }}GB</span>
                        </div>
                        <div class="capacity-item">
                            <span class="capacity-label">Redis</span>
                            <a-progress :percent="item.redis?.total_mem ? Math.round((item.redis.total_mem / 1024) / 100 * 100) : 0" :stroke-color="'#52c41a'" :show-info="false" size="small" class="capacity-progress" />
                            <span class="capacity-value">{{ (item.redis?.total_mem || 0) / 1024 }}GB</span>
                        </div>
                        <div class="capacity-item">
                            <span class="capacity-label">MongoDB</span>
                            <a-progress :percent="item.mongoDB?.total_disk ? Math.round(item.mongoDB.total_disk / 100 * 100) : 0" :stroke-color="'#722ed1'" :show-info="false" size="small" class="capacity-progress" />
                            <span class="capacity-value">{{ item.mongoDB?.total_disk || 0 }}GB</span>
                        </div>
                    </div>
                    <div class="chart-title">{{ item.business }}</div>
                </div>
            </div>
        </div>
    </div>
    <div v-show="resourceData.length < 2" class="resource-remind mt-4">
        <h3 class="page-title">资源即将到期提醒</h3>
        <div class="multi-chart-row">
            <div v-for="(item, idx) in resourceData" :key="item.business" class="multi-chart-item">
                <div :id="`expiringChart_${idx}`" class="chart"></div>
                <div class="chart-title">{{ item.business }}</div>
            </div>
        </div>
    </div>
</template>


<style scoped lang="less">
.charts-container, .db-charts-container, .resource-remind {
  width: 100%;
  .multi-chart-row {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    width: 100%;
    overflow-x: auto;
    padding-bottom: 24px;

    background: #fff;
        border-radius: 12px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        overflow: hidden;
        position: relative;
        min-height: 200px;
        border: 1px solid rgba(22, 119, 255, 0.1);
        backdrop-filter: blur(10px);
        flex: 1;
        

    &:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
            border-color: rgba(22, 119, 255, 0.2);
        }

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #1890ff, #52c41a);
            opacity: 0.8;
        }
    .multi-chart-item {
      flex: 0 0 350px;
      display: flex;
      flex-direction: column;
      align-items: center;
      .chart {
        width: 100%;
        height: 260px;
      }
      .chart-title {
        margin-top: 8px;
        text-align: center;
        font-weight: bold;
      }
      .resource-cards {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
        .resource-card {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background: #fff;
          border-radius: 8px;
          border: 1px solid;
          transition: all 0.3s;
          .card-icon {
            width: 36px;
            height: 36px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            i {
              font-size: 20px;
              color: #fff;
            }
          }
          .card-content {
            .card-title {
              font-size: 14px;
              color: rgba(0, 0, 0, 0.65);
              margin-bottom: 2px;
            }
            .card-value {
              font-size: 20px;
              font-weight: 600;
              color: #1f1f1f;
              .card-unit {
                font-size: 12px;
                margin-left: 4px;
                color: rgba(0, 0, 0, 0.45);
              }
            }
          }
        }
      }
      .capacity-items {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
        .capacity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          .capacity-label {
            min-width: 80px;
            color: #666;
            font-size: 14px;
          }
          .capacity-progress {
            flex: 1;
          }
          .capacity-value {
            min-width: 80px;
            text-align: right;
            color: #333;
            font-weight: 500;
            font-size: 14px;
          }
        }
      }
    }
  }
}
.resource-part-box {
    min-height: 400px;
}
.resource-display {
    padding: 24px;

    .page-title {
        margin-bottom: 24px;
        color: #1f1f1f;
        font-size: 20px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 12px;

        .expiring-info {
            font-size: 14px;
            color: #666;
            font-weight: normal;
            display: flex;
            align-items: center;
            gap: 8px;
        }
    }

    .charts-container {
        display: grid;
        grid-template-columns: 100%;
        gap: 24px;
        min-height: 200px;
    
        .resource-summary {
            padding: 16px;
            width: 90%; // 修改为100%，因为已经通过grid控制了宽度
            margin: 0; // 移除自动边距
           

            &::after {
                content: '资源汇总';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                text-align: center;
                padding: 6px 0;
                font-size: 16px;
                font-weight: bold;
                color: #333;
                background: linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0.9));
            }

            .resource-cards {
                display: flex;
                flex-direction: column;
                gap: 12px;
                height: 100%;
                padding-bottom: 32px;

                .resource-card {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    background: #fff;
                    border-radius: 8px;
                    border: 1px solid;
                    transition: all 0.3s;

                    &:hover {
                        transform: translateX(-2px);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    }

                    .card-icon {
                        width: 36px;
                        height: 36px;
                        border-radius: 6px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 12px;

                        i {
                            font-size: 20px;
                            color: #fff;
                        }
                    }

                    .card-content {
                        .card-title {
                            font-size: 14px;
                            color: rgba(0, 0, 0, 0.65);
                            margin-bottom: 2px;
                        }

                        .card-value {
                            font-size: 20px;
                            font-weight: 600;
                            color: #1f1f1f;

                            .card-unit {
                                font-size: 12px;
                                margin-left: 4px;
                                color: rgba(0, 0, 0, 0.45);
                            }
                        }
                    }
                }
            }
        }
    }
}

@media (max-width: 1400px) {
    .resource-display {
        .charts-container {
            grid-template-columns: 1fr 1fr; // 修改为两列布局

            .chart-box {
                &:last-child {
                    grid-column: span 2;
                    width: 30%; // 保持30%的宽度
                    margin: 0 auto;

                    .resource-cards {
                        flex-direction: column; // 改为纵向排列
                        gap: 12px;
                    }
                }
            }
        }
    }
}

@media (max-width: 768px) {
    .resource-display {
        .charts-container {
            grid-template-columns: 1fr;
            gap: 16px;

            .chart-box {
                &:last-child {
                    grid-column: span 1;
                    width: 100%;

                    .resource-cards {
                        flex-direction: column;
                        gap: 12px;
                    }
                }
            }
        }
    }
}

.database-section {
    padding: 24px;
    .page-title {
        margin-bottom: 16px;
        font-size: 20px;
        font-weight: bold;
        color: #333;
    }
    
    .db-charts-container {
        display: grid;
        grid-template-columns: 100%;
        gap: 16px;
        min-height: 400px;
    }

    .chart-box {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        overflow: hidden;
        position: relative;
        height: 400px;
        border: 1px solid rgba(22, 119, 255, 0.1);
        backdrop-filter: blur(10px);
        flex: 1;
        
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
            border-color: rgba(22, 119, 255, 0.2);
        }

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #1890ff, #52c41a);
            opacity: 0.8;
        }

        .chart-wrapper {
            height: 100%;
            padding: 20px 16px;

            .chart {
                height: 100%;
                width: 100%;
            }
        }
    }

    .capacity-box {
        .capacity-wrapper {
            padding: 20px;
            height: 100%;
            display: flex;
            flex-direction: column;

            .capacity-title {
                text-align: center;
                font-size: 16px;
                font-weight: bold;
                color: #333;
                
            }

            .capacity-items {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 0 16px;

                .capacity-item {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    min-height: 0;

                    .capacity-content {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        width: 100%;
                        height: 100%;

                        .capacity-label {
                            min-width: 80px;
                            color: #666;
                            line-height: 1.5;
                            font-size: 14px;
                        }

                        .capacity-progress {
                            flex: 1;
                            :deep(.ant-progress-inner) {
                                height: 25px;
                                
                            }
                            :deep(.ant-progress-bg) {
                                    height: 100% !important;
                                }
                        }

                        .capacity-value {
                            min-width: 80px;
                            text-align: right;
                            color: #333;
                            font-weight: 500;
                            line-height: 1.5;
                            font-size: 14px;
                        }
                    }
                }
            }
        }
    }
}

.resource-remind {
    padding: 24px;

    .chart-box {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        overflow: hidden;
        position: relative;
        height: 300px;
        border: 1px solid rgba(22, 119, 255, 0.1);
        backdrop-filter: blur(10px);
        
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
            border-color: rgba(22, 119, 255, 0.2);
        }

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #1890ff, #52c41a);
            opacity: 0.8;
        }

        .chart-wrapper {
            height: 100%;
            padding: 20px 16px;

            .chart {
                height: 100%;
                width: 100%;
            }
        }
    }
}

.charts-container, .db-charts-container, .resource-remind {
  width: 100%;
  .multi-chart-row {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    width: 100%;
    overflow-x: auto;
    margin-bottom: 24px;
    padding: 24px;
    .multi-chart-item {
      flex: 0 0 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
      .chart {
        width: 100%;
        height: 260px;
      }
      .chart-title {
        margin-top: 8px;
        text-align: center;
        font-weight: bold;
      }
    }
  }
}
</style>


