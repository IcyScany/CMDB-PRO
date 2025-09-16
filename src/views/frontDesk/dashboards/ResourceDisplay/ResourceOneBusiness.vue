<script setup>
import * as echarts from 'echarts';
import { debounce } from 'xe-utils';
import { formatRegionData, formatRegionTableData, getRegionTotal, getCapacityPercent } from './utils/formatters';
import ResourceCard from './components/ResourceCard.vue';

let props = defineProps({
    resourceData: {
        type: Object,
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


// 添加显示模式状态
const regionDisplayMode = ref('chart'); // 'chart' 或 'table'

let cloudRegionList = inject('cloudRegionList'); // 云区域列表


// 生成环形图的基础配置
const getDonutChartBaseOption = (data, {
    title = '',
    center = ['50%', '50%'],
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
                right: 0,
                bottom: '10%',
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

// 资源卡片数据
const resourceCards = computed(() => {
    if (!resourceData.value?.server?.physical_resources) return [];
    
    const { total_cpu, total_ram, total_disk } = resourceData.value.server.physical_resources;
    const ramFormatted = formatStorageUnit(total_ram);
    const diskFormatted = formatStorageUnit(total_disk);

    return [
        {
            title: 'CPU',
            value: total_cpu,
            unit: '核',
            icon: 'cpu',
            color: '#1890ff'
        },
        {
            title: '内存',
            value: ramFormatted.value,
            unit: ramFormatted.unit,
            icon: 'memory',
            color: '#52c41a'
        },
        {
            title: '硬盘',
            value: diskFormatted.value,
            unit: diskFormatted.unit,
            icon: 'disk',
            color: '#722ed1'
        }
    ];
});


// 检查图表实例是否有效
const isChartValid = (chart) => {
    return chart && !chart.isDisposed();
};

// 初始化图表
const initCharts = () => {
    try {
        if (chartsInstance.regionChartInstance) {
            chartsInstance.regionChartInstance.dispose();
        }
        if (chartsInstance.chargeTypeChartInstance) {
            chartsInstance.chargeTypeChartInstance.dispose();
        }
        if (chartsInstance.dbInstanceChartInstance) {
            chartsInstance.dbInstanceChartInstance.dispose();
        }
        if (chartsInstance.expiringChartInstance) {
            chartsInstance.expiringChartInstance.dispose();
        }

        chartsInstance.regionChartInstance = echarts.init(document.getElementById('regionChart'));
        chartsInstance.chargeTypeChartInstance = echarts.init(document.getElementById('chargeTypeChart'));
        chartsInstance.dbInstanceChartInstance = echarts.init(document.getElementById('dbInstanceChart'));
        chartsInstance.expiringChartInstance = echarts.init(document.getElementById('expiringChart'));
        
    } catch (error) {
        console.error('Failed to initialize charts:', error);
    }
};

// 更新区域分布图表
const updateRegionChart = (data) => {
    if (!chartsInstance.regionChartInstance) {
        chartsInstance.regionChartInstance = echarts.init(document.getElementById('regionChart'));
    }
    
    const option = getDonutChartBaseOption(data, {
        title: '资源分布',
        center: ['65%', '50%'],
        legendConfig: {
            orient: 'horizontal',
            left: 0,
            bottom: 0,
            itemWidth: 10,
            itemHeight: 10,
            textStyle: {
                fontSize: 12,
                color: '#666'
            },
            
            pageButtonPosition: 'end',
            pageButtonGap: 5,
            pageButtonItemGap: 5,
            pageTextStyle: {
                color: '#666'
            },
            rich: {
                name: {
                    width: 100,
                    overflow: 'truncate'
                }
            },
            formatter: function(name) {
                return name;
            }
        },
        labelConfig: {
            position: 'outside',
            formatter: '{b}: {d}%',
            fontSize: 12,
            lineHeight: 15,
            align: 'center'
        },
        totalConfig:{
            left: '62%',
            top: '40%'
        }
    });
    
    chartsInstance.regionChartInstance.setOption(option, true);
};

// 更新计费方式图表
const updateChargeTypeChart = (data = []) => {
    if (!chartsInstance.chargeTypeChartInstance) {
        chartsInstance.chargeTypeChartInstance = echarts.init(document.getElementById('chargeTypeChart'));
    }
    
    const option = getDonutChartBaseOption(data, {
        title: '计费方式',
        legendConfig: {
            type: 'scroll',
            orient: 'vertical',
            left: 0,
            top: 0,
        },
        
        labelConfig: {
            position: 'outside',
            formatter: '{b}: {c}\n{d}%',
            fontSize: 12,
            lineHeight: 15,
            align: 'center'
        }
    });
    
    chartsInstance.chargeTypeChartInstance.setOption(option);
};

// 更新数据库实例数量柱状图
const updateDbInstanceChart = (data) => {
    console.log('data', data);
    if (!isChartValid(chartsInstance.dbInstanceChartInstance)) {
        return;
    }

    try {
        const mysqlCount = data.mysql?.['cn-east-3'] || 0;
        const redisCount = data.redis?.['cn-east-3'] || 0;
        const mongoCount = data.mongoDB?.['cn-east-3'] || 0;

        const option = {
            title: {
                text: '实例数',
                left: 'center',
                bottom: 0,
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#333'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: function(params) {
                    const data = params[0];
                    const expiringCount = data.data.expiring_soon || 0;
                    return `${data.name}<br/>总实例数: ${data.value}<br/>即将到期: ${expiringCount}`;
                }
            },
            grid: { 
                left: '3%', 
                right: '4%', 
                bottom: '15%', 
                top: '3%',
                containLabel: true 
            },
            xAxis: {
                type: 'category',
                data: ['MySQL', 'Redis', 'MongoDB'],
                axisLabel: { interval: 0 }
            },
            yAxis: {
                type: 'value',
                name: '实例数量',
                position: 'left'
            },
            series: [{
                name: '实例数量',
                type: 'bar',
                data: [
                    { 
                        value: mysqlCount,
                        expiring_soon: data.mysql?.expiring_soon_number || 0
                    },
                    { 
                        value: redisCount,
                        expiring_soon: data.redis?.expiring_soon_number || 0
                    },
                    { 
                        value: mongoCount,
                        expiring_soon: data.mongoDB?.expiring_soon_number || 0
                    }
                ],
                itemStyle: {
                    color: function(params) {
                        const colors = ['#1890ff', '#52c41a', '#722ed1'];
                        return colors[params.dataIndex];
                    }
                },
                barWidth: '20%',
                label: {
                    show: true,
                    position: 'top',
                    formatter: function(params) {
                        return params.value;
                    }
                }
            }]
        };

        chartsInstance.dbInstanceChartInstance.setOption(option, true);
    } catch (error) {
        console.error('Error updating db instance chart:', error);
    }
};

// 更新资源到期提醒图表
const updateExpiringChart = (data) => {
    if (!isChartValid(chartsInstance.expiringChartInstance)) {
        return;
    }

    try {
        const option = {
            title: {
                text: '即将到期资源数(小于14天)',
                left: 'center',
                top: 0,
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#333'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['服务器', 'MySQL', 'Redis', 'MongoDB'],
                axisLabel: {
                    interval: 0
                }
            },
            yAxis: {
                type: 'value',
                name: '数量'
            },
            series: [{
                name: '即将到期数量',
                type: 'bar',
                data: [
                    data?.server?.expiring_soon_number || 0,
                    data?.mysql?.expiring_soon_number || 0,
                    data?.redis?.expiring_soon_number || 0,
                    data?.mongoDB?.expiring_soon_number || 0
                ],
                itemStyle: {
                    color: function(params) {
                        const colors = ['#ff4d4f', '#ff7a45', '#ffa940', '#ffec3d'];
                        return colors[params.dataIndex];
                    }
                },
                barWidth: '40%',
                label: {
                    show: true,
                    position: 'top'
                }
            }]
        };

        chartsInstance.expiringChartInstance.setOption(option, true);
    } catch (error) {
        console.error('Error updating expiring chart:', error);
    }
};

// 刷新资源数据
const refreshResourceData = async () => {
    try {
        const response = resourceData.value;        
        // 使用 formatRegionData 处理区域数据
        const regionData = formatRegionData(response?.server?.region, cloudRegionList.value);
       
        // 处理计费方式数据
        const chargeTypeData = response?.server?.charge_type || [];
        const formattedChargeTypeData = Object.entries(chargeTypeData).map(([type, count]) => ({
            name: type,
            value: count
        }));
        nextTick(() => {
            updateRegionChart(regionData.data);
            updateChargeTypeChart(formattedChargeTypeData);
            updateDbInstanceChart(response);
            updateExpiringChart(response);
        });
    } catch (error) {
        console.error('Failed to fetch resource data:', error, resourceData.value);
    }
};
const updateMainContentBg = (bg) => {
    const mainContent = document.querySelector('.main-content');
    if(mainContent){
        mainContent.style.setProperty('background-color', bg);
    }
};


function pageInit(){
    regionDisplayMode.value = 'chart';
    initCharts();
    updateMainContentBg('rgb(246 247 250)');
  
    refreshResourceData();
    window.addEventListener('resize', handleResize);
}



onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    if (isChartValid(chartsInstance.regionChartInstance)) {
        chartsInstance.regionChartInstance.dispose();
    }
    if (isChartValid(chartsInstance.chargeTypeChartInstance)) {
        chartsInstance.chargeTypeChartInstance.dispose();
    }
    if (isChartValid(chartsInstance.dbInstanceChartInstance)) {
        chartsInstance.dbInstanceChartInstance.dispose();
    }
    if (isChartValid(chartsInstance.expiringChartInstance)) {
        chartsInstance.expiringChartInstance.dispose();
    }
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



// 计算最大容量值
const maxCapacity = computed(() => {
    if (!resourceData.value) return 0;
    const mysqlGB = resourceData.value.mysql?.total_disk || 0;
    const redisGB = (resourceData.value.redis?.total_mem || 0) / 1024;
    const mongoGB = resourceData.value.mongoDB?.total_disk || 0;
    return Math.max(mysqlGB, redisGB, mongoGB);
});


// 处理显示模式切换
const handleRegionDisplayModeChange = ({target}) => {
    if(target.value === 'chart'){
        // 使用 formatRegionData 处理区域数据
        const regionData = formatRegionData(resourceData.value?.server?.region, cloudRegionList.value);
        nextTick(async () => {
            // 重新初始化图表实例
            if (chartsInstance.regionChartInstance) {
                chartsInstance.regionChartInstance.dispose();
            }
            chartsInstance.regionChartInstance = echarts.init(document.getElementById('regionChart'));
            await updateRegionChart(regionData.data);
        });
    }
};

defineExpose({
    init: pageInit
});
</script>

<template>
    
        <div class="resource-display">
            <h3 class="page-title">
                服务器
            </h3>
            <div class="charts-container">
            <!-- 区域分布图表 -->
            <div class="chart-box">
                <div class="chart-header">
                    <div class="display-mode-switch">
                        <a-radio-group v-model:value="regionDisplayMode" button-style="solid" @change="handleRegionDisplayModeChange">
                            <a-radio-button value="chart">
                                <template #icon><i class="icon-chart"></i></template>
                                图表
                            </a-radio-button>
                            <a-radio-button value="table">
                                <template #icon><i class="icon-table"></i></template>
                                表格
                            </a-radio-button>
                        </a-radio-group>
                    </div>
                </div>
                <div class="chart-wrapper">
                    <div v-if="regionDisplayMode === 'chart'" id="regionChart" class="chart"></div>
                    <div v-else class="region-table mt-10">
                       
                        <vxe-grid
                            :data="formatRegionTableData(resourceData?.server?.region)"
                            :columns="[
                                { title: '区域', field: 'region', key: 'region' },
                                { title: '可用区', field: 'zone', key: 'zone' },
                                { 
                                    title: '数量', 
                                    field: 'count', 
                                    key: 'count',
                                    sorter: (a, b) => a.count - b.count
                                }
                            ]"
                            show-footer
                            :pagination="false"
                            :footer-data="[{ region: '总计', count: getRegionTotal(resourceData?.server?.region) }]"   
                            size="small"
                        >
                        </vxe-grid>
                    </div>
                </div>
            </div>
            
            <!-- 计费方式图表 -->
            <div class="chart-box">
                <div class="chart-wrapper">
                    <div id="chargeTypeChart" class="chart"></div>
                </div>
            </div>
            
            <!-- 资源汇总卡片 -->
            <div class="chart-box resource-summary">
                <div class="resource-cards">
                    <template v-for="card in resourceCards" :key="card.title">
                        <ResourceCard  :title="card.title" :value="card.value" :unit="card.unit" :color="card.color" :icon="card.icon" />
                    </template>
                
                </div>
            </div>
        </div>
        <div class="database-section">
            <h3 class="page-title">
                数据库
            </h3>
            
            <div class="db-charts-container">
                <div class="chart-box">
                    <div class="chart-wrapper">
                        <div id="dbInstanceChart" class="chart"></div>
                        
                    </div>
                </div>
                <div class="chart-box capacity-box">
                    <div class="capacity-wrapper">
                        <div class="capacity-items">
                            <div class="capacity-item">
                                <div class="capacity-content">
                                    <span class="capacity-label">MySQL</span>
                                    <a-progress
                                        :percent="getCapacityPercent(resourceData?.mysql?.total_disk || 0, maxCapacity)"
                                        :stroke-color="'#1890ff'"
                                        :show-info="false"
                                        size="small"
                                        class="capacity-progress"
                                    />
                                    <span class="capacity-value">{{ formatStorageUnit(resourceData?.mysql?.total_disk || 0).value }}{{ formatStorageUnit(resourceData?.mysql?.total_disk || 0).unit }}</span>
                                </div>
                            </div>
                            <div class="capacity-item">
                                <div class="capacity-content">
                                    <span class="capacity-label">Redis</span>
                                    <a-progress
                                        :percent="getCapacityPercent((resourceData?.redis?.total_mem || 0) / 1024, maxCapacity)"
                                        :stroke-color="'#52c41a'"
                                        :show-info="false"
                                        size="small"
                                        class="capacity-progress"
                                    />
                                    <span class="capacity-value">{{ ((resourceData?.redis?.total_mem || 0) / 1024).toFixed(2) }}GB</span>
                                </div>
                            </div>
                            <div class="capacity-item">
                                <div class="capacity-content">
                                    <span class="capacity-label">MongoDB</span>
                                    <a-progress
                                        :percent="getCapacityPercent(resourceData?.mongoDB?.total_disk || 0, maxCapacity)"
                                        :stroke-color="'#722ed1'"
                                        :show-info="false"
                                        size="small"
                                        class="capacity-progress"
                                    />
                                    <span class="capacity-value">{{ formatStorageUnit(resourceData?.mongoDB?.total_disk || 0).value }}{{ formatStorageUnit(resourceData?.mongoDB?.total_disk || 0).unit }}</span>
                                </div>
                            </div>
                        </div>
                        <h4 class="capacity-title">总容量统计</h4>
                    </div>
                </div>
            </div>
        </div>

        <div class="resource-remind mt-4">
            <h3 class="page-title">资源即将到期提醒</h3>
            <div class="chart-box">
                <div class="chart-wrapper">
                    <div id="expiringChart" class="chart"></div>
                </div>
            </div>
        </div>
       
    </div>
</template>


<style scoped lang="less">
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
        grid-template-columns: 40% 40% 20%;
        gap: 24px;
        min-height: 400px;
        height: 400px;

        .chart-box {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
            transition: all 0.3s ease;
            overflow: hidden;
            position: relative;
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
                padding: 20px 16px 30px;

                .chart {
                    height: 100%;
                    width: 100%;
                    margin-top: 20px;
                }
            }

            .chart-header {
                position: absolute;
                top: 16px;
                right: 16px;
                z-index: 1;
               
                .display-mode-switch {
                    :deep(.ant-radio-group) {
                        .ant-radio-button-wrapper {
                            padding: 4px 12px;
                            height: 28px;
                            line-height: 20px;
                            
                            i {
                                margin-right: 4px;
                            }
                        }
                    }
                }
            }

            .region-table {
                height: 100%;
            }
        }

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
    margin-top: 24px;
    
    .db-charts-container {
        display: grid;
        grid-template-columns: 50% 50%;
        gap: 16px;
        height: 400px;
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
</style>

