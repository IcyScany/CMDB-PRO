<script setup>
// 总览
import scheduledTasksApi from '@/api/opsCenter/scheduledTasksApi';
import { computed } from 'vue';

const state = ref({});

onMounted(async () => {
    try {
        const res = await scheduledTasksApi.getScheduledTasksOverview();
        state.value = res || {};
        console.log(res);
    } catch (error) {
        console.log(error);
    }
});

// 统计卡片颜色
const summaryColor = {
    0: '#4fb050', // 绿色
    1: '#e88250', // 橙色
    2: '#3c79bf', // 蓝色
    3: '#4fb050'  // 绿色
};

// 数据分组
const section1 = computed(() => state.value.section1 || []);
const topExecutionTasks = computed(() => state.value.top_execution_time_tasks || []);

// 格式化执行时间
function formatExecutionTime(seconds) {
    if (seconds === 0) return '0秒';
    if (seconds < 60) return `${seconds.toFixed(2)}秒`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(2)}分钟`;
    return `${(seconds / 3600).toFixed(2)}小时`;
}

// 统计卡片数据
const summaryList = computed(() => {
    if (!section1.value.length) return {};
    
    const result = {};
    section1.value.forEach((item, idx) => {
        if (typeof item.items === 'number') {
            result[`item_${idx}`] = {
                [item.label]: item.items
            };
        } else {
            result[`item_${idx}`] = item.items;
        }
    });
    return result;
});
</script>

<template>
    <div v-if="Object.keys(state).length > 0">
        <div v-if="section1.length > 0" class="overview-container">
            <!-- 统计卡片 -->
            <div class="summary-box">
                <div
                    v-for="(item, key) in summaryList"
                    :key="key"
                    class="summary-item"
                    :style="{ '--summary-color': summaryColor[parseInt(key.split('_')[1])] }"
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
                    <div v-if="key === 'item_0'" class="summary-icon" >
                        <img src="/images/kvstore.png" >
                    </div>
                </div>
            </div>

            <!-- 执行时间表格 -->
            <div v-if="topExecutionTasks.length > 0" class="execution-table-card">
                <h3 class="table-title">最近执行时间最长的任务 (Top 10)</h3>
                <table class="border-collapse border custom-table custom-table-bordered">
                    <thead>
                        <tr>
                            <th class="text-center">排名</th>
                            <th class="text-center">任务名称</th>
                            <th class="text-center">环境</th>
                            <th class="text-center">最后一次执行时长</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(task, index) in topExecutionTasks" :key="task.task_id">
                            <td class="text-center">
                                <span class="rank-badge" :class="`rank-${index + 1}`">{{ index + 1 }}</span>
                            </td>
                            <td class="text-center">{{ task.name }}</td>
                            <td class="text-center">
                                <vxe-tag 
                                    :class="task.environment === '生产环境' ? 'theme--warning' : 'theme--success'" 
                                    size="small" 
                                    class="m-1"
                                >
                                    {{ task.environment }}
                                </vxe-tag>
                            </td>
                            <td class="text-center execution-time">
                                {{ formatExecutionTime(task.avg_execution_time) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="summary-border" style="background: #3c79bf;"></div>
            </div>
        </div>
        <a-empty v-else></a-empty>
    </div>
    <a-empty v-else></a-empty>
</template>

<style scoped lang="less">
:deep(.ant-card) {
    margin-top: 14px;
    box-shadow: 0 4px 4px rgba(0,0,0,0.08);
    .ant-card-body {
        padding: 0px 24px 24px 24px;
    }
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
            background: #fff;
            
            .summary-data {
                text-align: center;
                
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
    
    .execution-table-card {
        margin-top: 32px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        padding: 24px;
        
        .table-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #333;
        }
        
        table {
            width: 100%;
            border: 1px solid #eee;
            
            th, td {
                border: 1px solid #eee;
                padding: 12px;
            }
            
            th {
                background: #fafafa;
                font-weight: 600;
            }
            
            .rank-badge {
                display: inline-block;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                text-align: center;
                line-height: 24px;
                font-size: 12px;
                font-weight: 600;
                color: #fff;
                
                &.rank-1 { background: #ffd700; }
                &.rank-2 { background: #c0c0c0; }
                &.rank-3 { background: #cd7f32; }
                &.rank-4, &.rank-5, &.rank-6, &.rank-7, &.rank-8, &.rank-9, &.rank-10 {
                    background: #666;
                }
            }
            
            .execution-time {
                font-weight: 600;
                color: #3c79bf;
            }
        }
        
        .summary-border {
            margin-top: 12px;
            height: 3px;
            border-radius: 2px;
        }
    }
}

.theme--success,
.theme--warning {
    background: none;
}
</style>