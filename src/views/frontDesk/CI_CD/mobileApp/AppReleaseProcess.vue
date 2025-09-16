<script setup>
import mobileAppApi from '@/api/ci_cd/mobileApp';
import { Modal, message } from 'ant-design-vue';


let props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    row: {
        type: Object,
        default: () => {}
    }
});
let { open, row } = toRefs(props);
let emit = defineEmits(['update:open']);



const releaseDetail = ref({});
const deployments = computed(() => releaseDetail.value?.m2m_deployment_targets || []);
const targets = computed(() => releaseDetail.value?.deployment_targets || []);
const showLogId = ref(null);
// 当前激活的步骤，默认显示构建步骤
const activeStep = ref('build');
let appDetail = inject('appDetail', {});
let canUserAction = inject('canUserAction', {});
let statusColor = inject('statusColor', {});

// 刷新相关状态
const isAutoRefresh = ref(false); // 是否开启自动刷新
const refreshCountdown = ref(10); // 自动刷新倒计时（秒）
let refreshTimer = null; // 自动刷新定时器
let countdownTimer = null; // 倒计时定时器
// 清除所有定时器
const clearAllTimers = () => {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = null;
    }
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
};
// 获取发布流程详情
const fetchDetail = async () => {
    if (!row.value.id) return;
    try {
        const detail = await mobileAppApi.getReleaseList(row.value.id);
        releaseDetail.value = detail || {};
        // 构建成功时自动激活部署步骤
        if (releaseDetail.value.build_status === 'success' && activeStep.value !== 'deploy') {
            activeStep.value = 'deploy';
        }
    } catch (e) {
        console.error('获取发布流程失败', e);
        message.error('获取发布流程失败');
    } 
};

// 切换自动刷新状态
const toggleAutoRefresh = () => {
    if (isAutoRefresh.value) {
        // 停止自动刷新
        clearAllTimers();
        isAutoRefresh.value = false;
      
    } else {
        // 开启自动刷新
        isAutoRefresh.value = true;
        refreshCountdown.value = 10; // 重置倒计时
       
        
        // 立即执行一次刷新
        fetchDetail();
        
        // 启动倒计时定时器
        countdownTimer = setInterval(() => {
            if (refreshCountdown.value > 0) {
                refreshCountdown.value--;
            } else {
                // 倒计时结束，执行刷新并重置倒计时
                fetchDetail();
                refreshCountdown.value = 10;
            }
        }, 1000);
    }
};



const handleClose = () => {
    // 关闭弹窗时清除所有定时器
    clearAllTimers();
    emit('update:open', false);
};

const handleDrawerOpen = async (val) => {
    if (val) {
        toggleAutoRefresh();
        // 默认激活构建步骤
        activeStep.value = 'build';
    } else {
        isAutoRefresh.value = false;
        refreshCountdown.value = 10; // 重置倒计时
        // 关闭弹窗时清除所有定时器
        clearAllTimers();
    }
};

// 组件卸载时清除定时器
onUnmounted(() => {
    clearAllTimers();
});



// 格式化时间
const formatTime = (iso) => {
    if (!iso) return '-';
    try {
        const d = new Date(iso);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    } catch (e) {
        return iso;
    }
};

// 格式化秒数为时分秒
const formatSeconds = (sec) => {
    if (sec == null) return '-';
    const s = Number(sec);
    if (Number.isNaN(s)) return '-';
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const rs = s % 60;
    if (m < 60) return `${m}m ${rs}s`;
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return `${h}h ${rm}m ${rs}s`;
};







// 可部署状态
const deployStatus = [null, 'error', 'failed', 'cancelled'];

// 处理部署操作
const handleDeployment = async (dep) => {  
    const targetName = targets.value.find(t => t.id === dep.deployment_target_id)?.name || '未知目标';
    Modal.confirm({
        title: `确认部署应用 ${appDetail.value?.name || '未知应用'} 到 ${targetName} 吗？`,
        okText: '确认',
        okType: 'primary',
        onOk: async () => {
            try {
                await mobileAppApi.postDeployment({
                    release_id: row.value.id, // 发布记录ID
                    deployment_target_ids: [dep.deployment_target_id],
                });
                message.success('部署请求已提交');
                fetchDetail();
            } catch (e) {
                message.error('部署失败：' + (e.message || '未知错误'));
            }
        }
    });
};

// 步骤点击处理
const handleStepClick = (step) => {
   
    activeStep.value = step;
};
</script>

<template>
    <ops-form-container 
        :open="open" 
        width="100%"
        :body-style="{background: '#f9fafc'}"
        @close="handleClose"
        @after-open-change="handleDrawerOpen"
    >
        <template #title>
            <div class="flex justify-between items-center">
                <div>
                    应用 <b class="text-[18px]">{{ appDetail?.name || '未知应用' }}</b>
                    <span> 发布流程: v{{ releaseDetail.version || '未知' }} ({{ releaseDetail.build_number || '未知' }})</span>
                </div>
                <!-- 刷新按钮组 -->
                <div class="flex gap-2">
                    <!-- 手动刷新按钮 -->
                    <a-button 
                        type="primary" 
                        class="bg-white border-gray-300"
                        @click="fetchDetail"
                    >
                        手动刷新
                    </a-button>
                    <!-- 自动刷新按钮（带倒计时） -->
                    <vxe-button 
                        :status="isAutoRefresh ? 'danger' : 'primary'" 
                        size="small"
                        class="flex items-center gap-1"
                        @click="toggleAutoRefresh"
                    >
                        <template v-if="isAutoRefresh">
                            <PauseOutlined size="14" />
                            <span>停止自动刷新</span>
                            <span class="text-xs bg-white/20 px-1 rounded">({{ refreshCountdown }}s)</span>
                        </template>
                        <template v-else>
                            <PlayCircleOutlined size="14" />
                            <span>开启自动刷新</span>
                        </template>
                    </vxe-button>
                </div>
            </div>
        </template>

        <div id="page-release-pipeline" class="page active">
            <!-- 基本信息区域 -->
            <div class="bg-white p-6 rounded-lg shadow-md mb-8">
                <div class="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-900">Version {{ releaseDetail.version || '未知' }} ({{
                            releaseDetail.build_number || '未知' }})</h2>
                        <div class="mt-3 flex items-center flex-wrap gap-x-4 gap-y-2">
                            <span class="status-badge status-success">
                                <a-tag :color="statusColor(releaseDetail.build_status) || 'default'">
                                    构建状态：{{ releaseDetail.build_status || '未知' }}
                                </a-tag>
                            </span>
                            <div class="flex items-center text-sm text-gray-500" title="代码分支">
                                <BranchesOutlined class="w-4 h-4 mr-1"/> 
                                <span class="font-mono">{{ releaseDetail.branch || '-' }}</span>
                            </div>
                            <div class="flex items-center text-sm text-gray-500" title="代码提交哈希">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" data-lucide="git-commit"
                                    class="lucide lucide-git-commit h-4 w-4 mr-1.5">
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <line x1="3" x2="9" y1="12" y2="12"></line>
                                    <line x1="15" x2="21" y1="12" y2="12"></line>
                                </svg>
                                <span class="font-mono">{{ releaseDetail.commit_hash || '-' }}</span>
                            </div>
                            <div class="flex items-center text-sm text-gray-500" title="代码提交者">
                                <UserOutlined class="w-4 h-4 mr-1"/>
                                <span>{{ releaseDetail.triggered_by || '-' }}</span>
                            </div>
                        </div>
                        <p v-show="releaseDetail.release_notes" class="mt-2 text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded-md">
                            {{ releaseDetail.release_notes }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- 步骤条区域 -->
            <div class="mb-4">
            
                <!-- 使用flex容器包裹整个步骤流程 -->
                <div class="flex items-center">
                    <!-- 构建步骤 -->
                    <div class="flex flex-col items-center w-1/3 cursor-pointer" @click="handleStepClick('build')">
                        <div class="stage-icon build-stage" :class="[
                            `stage-${releaseDetail.build_status || 'pending'}`,
                            { 'ring-2 ring-blue-500 ring-offset-2': activeStep === 'build' }
                        ]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" 
                                stroke-linejoin="round" data-lucide="wrench" class="lucide lucide-wrench">
                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"></path>
                            </svg>
                        </div>
                        <h4 class="mt-2 font-semibold text-gray-800">构建</h4>
                        <p class="text-xs text-gray-500 mt-1">
                            {{ formatTime(releaseDetail.build_finished_time) || '处理中' }}
                        </p>
                    </div>

                        <!-- 连接器 -->
                <div class="flex-1 w-1/3 h-1 mx-6 relative " 
                    :class="{ 
                    'bg-green-500': releaseDetail.build_status === 'success', 
                    'bg-gray-300': releaseDetail.build_status !== 'success',
                    'opacity-50': releaseDetail.build_status === 'pending' || releaseDetail.build_status === 'in_progress'
                    }">
                <!-- 连接线中间的圆点，增强视觉效果 -->
                <div v-if="releaseDetail.build_status === 'success'" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  w-full  bg-green-500 border-2 border-white "></div>
                
                <!-- 构建中动画效果 -->
                <div v-if="releaseDetail.build_status === 'in_progress'" class="absolute inset-0 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse"></div>
                </div>      

                    <!-- 部署步骤 -->
                    <div class="flex flex-col items-center w-1/3 cursor-pointer" @click="handleStepClick('deploy')">
                        <div class="stage-icon" :class="[
                            releaseDetail.build_status === 'success' ? 'stage-success' : 'stage-pending opacity-50',
                            { 'ring-2 ring-blue-500 ring-offset-2': activeStep === 'deploy' }
                        ]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" 
                                stroke-linejoin="round" data-lucide="send" class="lucide lucide-send">
                                <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path>
                                <path d="m21.854 2.147-10.94 10.939"></path>
                            </svg>
                        </div>
                        <h4 class="mt-2 font-semibold text-gray-800">部署</h4>
                        <p v-show="deployments.length" class="text-xs text-gray-500 mt-1">
                            {{ deployments.length ? formatTime(deployments[0].deployment_finished_time) : '未开始' }}
                        </p>
                    </div>
                </div>
            </div>

            <!-- 内容区域：根据激活步骤显示对应内容 -->
            <div class="grid grid-cols-1 gap-8">
                <!-- 部署流程区域（激活部署步骤时显示） -->
                <div v-if="activeStep === 'deploy'" class="bg-white rounded-lg shadow-md">
                    <div class="p-5 border-b">
                        <h3 class="text-lg font-semibold text-gray-900">部署流程</h3>
                    </div>
                    
                    <div class="space-y-2 p-4">
                        <template v-if="deployments.length">
                            <div v-for="(dep, idx) in deployments" :key="dep.id || idx" class="rounded-md border px-4 py-3 transition-all hover:shadow-sm">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <span class="text-sm font-medium">
                                        {{ targets.find(item => item.id === dep.deployment_target_id)?.name || `目标 #${dep.id || idx + 1}` }}
                                    </span>
                                   
                                    <a-button 
                                        type="link" 
                                        size="small" 
                                        class="ml-2"
                                        @click="showLogId = showLogId === dep.id ? null : dep.id"
                                    >
                                        {{ showLogId === dep.id ? '隐藏日志' : '查看日志' }}
                                    </a-button>
                                    
                                    <a-tag 
                                        v-if="dep.deployment_status" 
                                        :color="statusColor(dep.deployment_status) || 'default'" 
                                        class="ml-auto"
                                    >
                                        {{ dep.deployment_status || 'pending' }}
                                    </a-tag>
                                    
                                    <a-tooltip 
                                        class="text-xs text-gray-500 ml-auto"
                                        placement="top"
                                    >
                                        <template #title>
                                            <span v-if="releaseDetail.build_status === 'success'">
                                                <span v-if="!deployStatus.includes(dep.deployment_status)">
                                                    不满足部署条件，可部署状态：{{ deployStatus.map(s => s || '未部署').join('、') }}
                                                </span>
                                                <span v-else>
                                                    满足部署条件，可点击部署
                                                </span>
                                            </span>
                                            <span v-else>
                                                不满足部署条件，需先完成构建且状态为success
                                            </span>
                                        </template>
                                        <a-button 
                                            v-show="canUserAction.deployment?.page_display && dep.deployment_status !== 'success'" 
                                            :disabled="!(releaseDetail.build_status === 'success' && deployStatus.includes(dep.deployment_status))" 
                                            type="primary" 
                                            size="small"
                                            @click="handleDeployment(dep)"
                                        >
                                            <SendOutlined size="14" /> 部署
                                        </a-button>
                                    </a-tooltip>
                                </div>
                                <div class="text-xs text-gray-500 mt-1">
                                    完成：{{ formatTime(dep.deployment_finished_time) }} 
                                    · 耗时：{{ formatSeconds(dep.deployment_duration) }}
                                </div>
                                <a-progress 
                                    v-if="dep.deployment_progress != null"
                                    :percent="Number(dep.deployment_progress)" 
                                    size="small" 
                                    class="mt-2" 
                                />
                                <div 
                                    v-show="showLogId === dep.id"
                                    class=" text-xs text-gray-700 whitespace-pre-wrap mt-2   overflow-auto bg-gray-900 text-white text-xs p-3 rounded-md overflow-x-auto min-h-[300px]"
                                >
                                    {{ dep.deployment_log || '无日志信息' }}
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <a-empty description="暂无部署目标配置" class="p-6" />
                        </template>
                    </div>
                </div>  

                <!-- 构建日志区域（默认显示，激活构建步骤时也显示） -->
                <div v-if="activeStep === 'build'" class="bg-white rounded-lg shadow-md">
                    <div class="p-5 border-b">
                        <h3 class="text-lg font-semibold text-gray-900">构建日志</h3>
                        <p class="text-xs text-gray-500 mt-1">
                            构建开始：{{ formatTime(releaseDetail.build_started_time) }} 
                            · 完成：{{ formatTime(releaseDetail.build_finished_time) }}
                            · 耗时：{{ formatSeconds(releaseDetail.build_duration) }}
                        </p>
                    </div>
                    <div class="p-5">
                        <pre class="bg-gray-900 text-white text-xs p-3 rounded-md overflow-x-auto min-h-[300px]">{{ releaseDetail.build_log || '暂无构建日志信息...' }}</pre>
                    </div>
                </div>
            </div>
        </div>
    </ops-form-container>
</template>

<style scoped lang="less">
/* 流水线样式 */
.pipeline-stage {
   
    transition: all 0.3s ease;
}


.stage-icon {
    height: 40px;
    width: 40px;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    border: 2px solid;
    transition: all 0.3s ease;
}

/* 保持其他状态样式不变 */
.stage-success {
    border-color: var(--success-color, #52c41a);
    color: var(--success-color, #52c41a);
    background-color: rgba(82, 196, 26, 0.1);
}

.stage-error {
    border-color: var(--error-color, #f5222d);
    color: var(--error-color, #f5222d);
    background-color: rgba(245, 34, 45, 0.1);
}

.stage-pending {
    border-color: var(--pending-color, #faad14);
    color: var(--pending-color, #faad14);
    background-color: rgba(250, 173, 20, 0.1);
}

.stage-in-progress {
    border-color: var(--in-progress-color, #1890ff);
    color: var(--in-progress-color, #1890ff);
    background-color: rgba(24, 144, 255, 0.1);
}

.stage-canceled {
    border-color: var(--canceled-color, #94a3b8);
    color: var(--canceled-color, #94a3b8);
    background-color: rgba(148, 163, 184, 0.1);
}

/* 步骤激活状态 */
.ring-2 {
    box-shadow: 0 0 0 4px var(--tw-ring-color);
}

.ring-blue-500 {
    --tw-ring-color: var(--primary-color);
}

.ring-offset-2 {
    --tw-ring-offset-width: 2px;
}

/* 刷新按钮样式优化 */
.ant-btn.bg-white.border-gray-300 {
    border-color: #d9d9d9;
    &:hover {
        border-color: #1890ff;
        color: #1890ff;
    }
}

.ant-btn .text-xs.bg-white\/20 {
    border-radius: 2px;
    color: inherit;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .stage-icon {
        height: 32px;
        width: 32px;
    }
    
   
}
/* 添加动画效果 */
@keyframes pulse {
  0% { transform: translateX(-100%); }
  50%, 100% { transform: translateX(100%); }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
