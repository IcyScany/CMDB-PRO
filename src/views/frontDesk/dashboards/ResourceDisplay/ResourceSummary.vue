<script setup>
import ResourceChart from './components/ResourceChart.vue';
import ResourceCard from './components/ResourceCard.vue';
import { formatRegionData, formatRegionTableData, getRegionTotal, getCapacityPercent } from './utils/formatters';

/* * 资源汇总模块* */
let props = defineProps({
    resourceData: {
        type: Object,
        required: true
    },
    type: {
        type: String,
        default: ''
    }
});

let { resourceData} = toRefs(props);

const selectedBusinesses = inject('selectedBusinesses');

const cloudRegionList = inject('cloudRegionList');
const pageResourceData = inject('pageResourceData');
// 添加显示模式状态
const regionDisplayMode = ref('chart'); // 'chart' 或 'table'

// 添加计费方式显示模式状态
const chargeTypeDisplayMode = ref('chart'); // 'chart' 或 'table'

// 生成环形图的基础配置
const getDonutChartBaseOption = (data, {
    title = '',
    center = ['50%', '50%'],
    legendConfig = {},
    labelConfig = {},
    totalConfig = {
        left: 'center',
        top: 'center',
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
            position: function (point, params, dom, rect, size) {
                const x = point[0];
                const viewWidth = size.viewSize[0];
                
                if (x > viewWidth / 2) {
                    return [x - size.contentSize[0] - 10, point[1]];
                }
                return [x + 10, point[1]];
            },
            /*    formatter: function(params) {
                if (selectedBusinesses.value.includes('all')) {
                    const businessData = pageResourceData.value.map(business => {
                        const businessItem = business.server?.region || {};
                       
                        let count = 0;
                        Object.entries(businessItem).forEach(([region, zones]) => {
                            console.log('region', region, 'zones', zones, 'params', params);
                            Object.entries(zones).forEach(([zone, zoneCount]) => {
                                if (zone === params?.data?.real_value) {
                                    count = zoneCount;
                                }
                            });
                        });
                        return `${business.business}: ${count}`;
                    }).join('<br/>');
                   
                    
                    return `${params.name}<br/>总计: ${params.value} (${params.percent}%)<br/><br/>各业态数据:<br/>${businessData}`;
                } else {
                    return `${params.name}<br/>数量: ${params.value} (${params.percent}%)`;
                }
            }, */
            formatter: '{b}: {c} ({d}%)',
            axisPointer: {
                show: true,
                type: 'shadow',
                z: 100
            }
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
            text: title?.text || title,
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
                name: title?.text || title,
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
                    top: '40%',
                    
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

const businessList = ref([]); // 业态列表

// 更新区域分布图表
const updateRegionChart = (send_data) => {
    // 更新区域分布图表
    const regionData = formatRegionData(send_data?.server?.region,cloudRegionList.value);
    let data = regionData.data;
 
    const option = getDonutChartBaseOption(data, {
        title: {
            text: '资源分布',
            subtext: selectedBusinesses.value.includes('all') ? '' : selectedBusinesses.value,
            subtextStyle: {
                fontSize: 12,
                color: '#666'
            }
        },
        center: ['50%', '50%'],
        legendConfig: {
            orient: 'horizontal',
            left: 0,
            bottom: '10%',
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
       
    });
    return option;
};

// 更新计费方式图表
const updateChargeTypeChart = (send_data) => {
    // 更新计费方式图表
    const chargeTypeData = send_data?.server?.charge_type || {};
    const data = Object.entries(chargeTypeData).map(([type, count]) => ({
        name: type,
        value: count
    }));
    
    
    const option = getDonutChartBaseOption(data, {
        title: {
            text: '计费方式',
            subtext: selectedBusinesses.value.includes('all') ? '' : selectedBusinesses.value,
            subtextStyle: {
                fontSize: 12,
                color: '#666'
            }
        },
        legendConfig: {
            orient: 'horizontal',
            left: 0,
            bottom: '10%',
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
            formatter: '{b}: {c}\n{d}%',
            fontSize: 12,
            lineHeight: 15,
            align: 'center'
        }
    });

    /*  // 修改计费方式图表的tooltip
    option.tooltip.formatter = function(params) {
        if (selectedBusinesses.value.includes('all')) {
            const businessData = pageResourceData.value.map(business => {
                const count = business.server?.charge_type?.[params.name] || 0;
                return `${business.business}: ${count}`;
            }).join('<br/>');
            
            return `${params.name}<br/>总计: ${params.value} (${params.percent}%)<br/><br/>各业态数据:<br/>${businessData}`;
        } else {
            return `${params.name}<br/>数量: ${params.value} (${params.percent}%)`;
        }
    }; */
    
    
    return option;
};

// 更新数据库实例数量柱状图
const updateDbInstanceChart = () => {
    // 获取所有业态数据
    const businesses = pageResourceData.value;
    
    // 准备系列数据
    const series = businesses.map(business => {
        const mysqlCount = business.mysql?.['cn-east-3'] || 0;
        const redisCount = business.redis?.['cn-east-3'] || 0;
        const mongoCount = business.mongoDB?.['cn-east-3'] || 0;

        return {
            name: business.business,
            type: 'bar',
            stack: 'total',
            data: [
                { 
                    value: mysqlCount,
                    expiring_soon: business.mysql?.expiring_soon_number || 0
                },
                { 
                    value: redisCount,
                    expiring_soon: business.redis?.expiring_soon_number || 0
                },
                { 
                    value: mongoCount,
                    expiring_soon: business.mongoDB?.expiring_soon_number || 0
                }
            ],
            emphasis: {
                focus: 'series'
            }
        };
    });

    const option = {
        title: {
            text: '实例数',
            subtext: selectedBusinesses.value.includes('all') ? '' : selectedBusinesses.value,
            subtextStyle: {
                fontSize: 12,
                color: '#666'
            },
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
            position: function (point, params, dom, rect, size) {
                const x = point[0];
                const viewWidth = size.viewSize[0];
                    
                if (x > viewWidth / 2) {
                    return [x - size.contentSize[0] - 10, point[1]];
                }
                return [x + 10, point[1]];
            },
            formatter: function(params) {
                const param = params[0];
                let result = `${param.name}<br/>`;
                
                // 计算总数
                const total = params.reduce((sum, item) => sum + item.value, 0);
                result += `总计: ${total}<br/><br/>`;
                
                // 添加每个业态的数据
                params.forEach(item => {
                    result += `${item.seriesName}: ${item.value}<br/>`;
                });
                
                return result;
            }
        },
        legend: {
            data: businesses.map(b => b.business),
            type: 'scroll',
            orient: 'vertical',
            right: 10,
            top: 20,
            bottom: 20
        },
        label: {
            show: true, 
            position: 'insideTop',
            formatter: params => params.value? params.value : '',
            distance: 0,
        },
        grid: { 
            left: '3%', 
            right: '15%', 
            bottom: '15%', 
            top: '15%',
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
        series: series,
        color: [
            '#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#f5222d',
            '#13c2c2', '#eb2f96', '#faad14', '#a0d911', '#2f54eb'
        ]
    };

    return option;
};

// 更新资源到期提醒图表
const updateExpiringChart = (data) => {
    return  {
        title: {
            text: '即将到期资源数(小于14天)',
            subtext: selectedBusinesses.value.includes('all') ? '' : selectedBusinesses.value.join(','),
            subtextStyle: {
                fontSize: 12,
                color: '#666'
            },
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
            axisPointer: { type: 'shadow' },
            position: function (point, params, dom, rect, size) {
                const x = point[0];
                const viewWidth = size.viewSize[0];
                    
                if (x > viewWidth / 2) {
                    return [x - size.contentSize[0] - 10, point[1]];
                }
                return [x + 10, point[1]];
            },
            formatter: function(params) {
                const param = params[0];
                if (selectedBusinesses.value.includes('all')) {
                    const businessData = businessList.value.map(business => {
                        let count = 0;
                        if (param.name === '服务器') {
                            count = business.server?.expiring_soon_number || 0;
                        } else if (param.name === 'MySQL') {
                            count = business.mysql?.expiring_soon_number || 0;
                        } else if (param.name === 'Redis') {
                            count = business.redis?.expiring_soon_number || 0;
                        } else if (param.name === 'MongoDB') {
                            count = business.mongoDB?.expiring_soon_number || 0;
                        }
                        return `${business.business}: ${count}`;
                    }).join('<br/>');
                        
                    return `${param.name}<br/>总计: ${param.value}<br/><br/>各业态数据:<br/>${businessData}`;
                } else {
                    return `${param.name}<br/>数量: ${param.value}`;
                }
            }
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
   
});

onBeforeUnmount(() => {
    updateMainContentBg('white');
});


// 计算最大容量值
const maxCapacity = computed(() => {
    if (!resourceData.value) return 0;
    const mysqlGB = resourceData.value.mysql?.total_disk || 0;
    const redisGB = (resourceData.value.redis?.total_mem || 0) / 1024;
    const mongoGB = resourceData.value.mongoDB?.total_disk || 0;
    return Math.max(mysqlGB, redisGB, mongoGB);
});



// 处理显示模式切换
const handleRegionDisplayModeChange = (e) => {
    console.log(e.target.value);
    regionDisplayMode.value = e.target.value;
};

// 添加获取业态颜色的函数
const getBusinessColor = (index) => {
    const colors = [
        '#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#f5222d',
        '#13c2c2', '#eb2f96', '#faad14', '#a0d911', '#2f54eb'
    ];
    return colors[index % colors.length];
};

// 处理计费方式显示模式切换
const handleChargeTypeDisplayModeChange = (e) => {
    chargeTypeDisplayMode.value = e.target.value;
};

// 格式化计费方式表格数据
const formatChargeTypeTableData = (data) => {
    if (!data) return [];
    
    const businesses = pageResourceData.value;
    const chargeTypes = new Set();
    
    // 收集所有计费方式
    businesses.forEach(business => {
        Object.keys(business.server?.charge_type || {}).forEach(type => {
            chargeTypes.add(type);
        });
    });
    // 生成表格数据
    return Array.from(chargeTypes).map((type) => { // 根据计费方式产生行
        const row = {
            charge_type: type,
            business: '',
            number: '',
            total: 0
        };
        
        // 添加每个业态的数据
        businesses.forEach(business => {
            const count = business.server?.charge_type?.[type] || 0;
            row[business.business] = count;
            row.business += `${business.business} \n`;
            row.number += `${count}\n`;
            row.total += count;
        });
        
        return row;
    });
};

// 获取计费方式表格列配置
const getChargeTypeTableColumns = () => {
    const columns = [
        {
            title: '计费方式',
            field: 'charge_type',
            key: 'charge_type',
            fixed: 'left',
           
        },
        {
            title: '业态',
            field: 'business',
            key: 'business',
            fixed: 'left',
          
        },
        {
            title: '数量',
            field: 'number',
            key: 'number',
            align: 'center',
            sorter: (a, b) => a.total - b.total
        }
    ];
    
    
    
    // 添加总计列
    columns.push({
        title: '总计',
        field: 'total',
        key: 'total',
        fixed: 'right',
        width: 120,
        align: 'center',
        sorter: (a, b) => a.total - b.total
    });
    
    return columns;
};
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
                <ResourceChart v-if="regionDisplayMode === 'chart'" id="regionChart" :options="updateRegionChart(resourceData)" />
                <div v-if="regionDisplayMode === 'table'" class="region-table mt-10">
                    <vxe-grid
                        :data="formatRegionTableData(resourceData?.server?.region, cloudRegionList)"
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
            <div class="chart-header">
                <div class="display-mode-switch">
                    <a-radio-group v-model:value="chargeTypeDisplayMode" button-style="solid" @change="handleChargeTypeDisplayModeChange">
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
                <ResourceChart v-if="chargeTypeDisplayMode === 'chart'" id="chargeTypeChart" :options="updateChargeTypeChart(resourceData)" />
                <div v-if="chargeTypeDisplayMode === 'table'" class="charge-type-table mt-10">
                    <vxe-grid
                        :data="formatChargeTypeTableData(resourceData)"
                        :columns="getChargeTypeTableColumns()"
                        width="100%"
                        
                        :pagination="false"
                        size="small"
                       
                        :scroll-y="{ enabled: true }"
                    >
                    </vxe-grid>
                </div>
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
                    <ResourceChart id="dbInstanceChart111" :options="updateDbInstanceChart(resourceData)" />
                </div>
            </div>
            <div class="chart-box capacity-box">
                <div class="capacity-wrapper">
                    <div class="capacity-items">
                        <div class="capacity-item">
                            <div class="capacity-content">
                                <span class="capacity-label">MySQL</span>
                                <a-tooltip>
                                    <template #title>
                                        <div>
                                            <div>总计: {{ formatStorageUnit(resourceData?.mysql?.total_disk || 0).value }}{{ formatStorageUnit(resourceData?.mysql?.total_disk || 0).unit }}</div>
                                            <div v-for="business in pageResourceData" :key="business.business">
                                                {{ business.business }}: {{ formatStorageUnit(business.mysql?.total_disk || 0).value }}{{ formatStorageUnit(business.mysql?.total_disk || 0).unit }}
                                            </div>
                                        </div>
                                    </template>
                                    <div class="stacked-progress">
                                        <div v-for="(business, index) in pageResourceData" :key="business.business"
                                            class="progress-segment"
                                            :style="{
                                                width: `${getCapacityPercent(business.mysql?.total_disk || 0, maxCapacity)}%`,
                                                backgroundColor: getBusinessColor(index)
                                            }"
                                            :title="`${business.business}: ${formatStorageUnit(business.mysql?.total_disk || 0).value}${formatStorageUnit(business.mysql?.total_disk || 0).unit}`"
                                        ></div>
                                    </div>
                                </a-tooltip>
                                <span class="capacity-value">{{ formatStorageUnit(resourceData?.mysql?.total_disk || 0).value }}{{ formatStorageUnit(resourceData?.mysql?.total_disk || 0).unit }}</span>
                            </div>
                        </div>
                        <div class="capacity-item">
                            <div class="capacity-content">
                                <span class="capacity-label">Redis</span>
                                <a-tooltip>
                                    <template #title>
                                        <div>
                                            <div>总计: {{ ((resourceData?.redis?.total_mem || 0) / 1024).toFixed(2) }}GB</div>
                                            <div v-for="business in pageResourceData" :key="business.business">
                                                {{ business.business }}: {{ ((business.redis?.total_mem || 0) / 1024).toFixed(2) }}GB
                                            </div>
                                        </div>
                                    </template>
                                    <div class="stacked-progress">
                                        <div v-for="(business, index) in pageResourceData" :key="business.business"
                                            class="progress-segment"
                                            :style="{
                                                width: `${getCapacityPercent((business.redis?.total_mem || 0) / 1024, maxCapacity)}%`,
                                                backgroundColor: getBusinessColor(index)
                                            }"
                                            :title="`${business.business}: ${((business.redis?.total_mem || 0) / 1024).toFixed(2)}GB`"
                                        ></div>
                                    </div>
                                </a-tooltip>
                                <span class="capacity-value">{{ ((resourceData?.redis?.total_mem || 0) / 1024).toFixed(2) }}GB</span>
                            </div>
                        </div>
                        <div class="capacity-item">
                            <div class="capacity-content">
                                <span class="capacity-label">MongoDB</span>
                                <a-tooltip>
                                    <template #title>
                                        <div>
                                            <div>总计: {{ formatStorageUnit(resourceData?.mongoDB?.total_disk || 0).value }}{{ formatStorageUnit(resourceData?.mongoDB?.total_disk || 0).unit }}</div>
                                            <div v-for="business in pageResourceData" :key="business.business">
                                                {{ business.business }}: {{ formatStorageUnit(business.mongoDB?.total_disk || 0).value }}{{ formatStorageUnit(business.mongoDB?.total_disk || 0).unit }}
                                            </div>
                                        </div>
                                    </template>
                                    <div class="stacked-progress">
                                        <div v-for="(business, index) in pageResourceData" :key="business.business"
                                            class="progress-segment"
                                            :style="{
                                                width: `${getCapacityPercent(business.mongoDB?.total_disk || 0, maxCapacity)}%`,
                                                backgroundColor: getBusinessColor(index)
                                            }"
                                            :title="`${business.business}: ${formatStorageUnit(business.mongoDB?.total_disk || 0).value}${formatStorageUnit(business.mongoDB?.total_disk || 0).unit}`"
                                        ></div>
                                    </div>
                                </a-tooltip>
                                <span class="capacity-value">{{ formatStorageUnit(resourceData?.mongoDB?.total_disk || 0).value }}{{ formatStorageUnit(resourceData?.mongoDB?.total_disk || 0).unit }}</span>
                            </div>
                        </div>
                    </div>
                    <h4 class="capacity-title">总容量统计</h4>
                </div>
            </div>
        </div>
    </div>

    <div v-show="pageResourceData.length < 2" class="resource-remind mt-4">
        <h3 class="page-title">资源即将到期提醒</h3>
        <div class="chart-box">
            <div class="chart-wrapper">
                <ResourceChart id="expiringChart" :options="updateExpiringChart(resourceData)" />
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

                        .stacked-progress {
                            flex: 1;
                            height: 25px;
                            background-color: #f5f5f5;
                            border-radius: 4px;
                            overflow: hidden;
                            display: flex;
                            position: relative;

                            .progress-segment {
                                height: 100%;
                                transition: width 0.3s ease;
                                position: relative;
                                cursor: pointer;

                                &:hover {
                                    filter: brightness(1.1);
                                }
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

.business-selector {
    display: flex;
    justify-content: flex-end;
    padding: 0 24px;
    
    :deep(.ant-select) {
        .ant-select-selector {
            border-radius: 6px;
            border-color: #d9d9d9;
            
            &:hover {
                border-color: #40a9ff;
            }
        }
    }
}

.charge-type-table {
    height: 100%;
    width: 100%;
    :deep(.vxe-table) {
        .vxe-body--row {
            &:hover {
                background-color: #f5f7fa;
            }
        }
        .vxe-footer--row {
            background-color: #fafafa;
            font-weight: bold;
        }
        .vxe-table--body {
            width: 100%;
        }
    }
}
</style>


