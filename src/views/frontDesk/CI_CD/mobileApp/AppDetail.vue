<script setup>

import { useRoute, useRouter } from 'vue-router';
import mobileAppApi from '@/api/ci_cd/mobileApp';
import AppBuildConfig from './AppBuildConfig.vue';
import AppReleaseRecord from './AppReleaseRecord.vue';

const route = useRoute();
const router = useRouter();

let emits = defineEmits(['click-edit', 'click-del']);

defineProps({
    app: {
        type: Object,
        default: () => {},
    },
});

// 响应式数据
const loading = ref(false);
const appDetail = ref({});
const buildConfigs = ref([]);
const state = inject('state');



// 获取应用详情
const fetchAppDetail = async () => {
    try {
        loading.value = true;
        const appId = route.query.appId;
        const response = await mobileAppApi.getAppList(appId);
        appDetail.value = response;
        buildConfigs.value = response?.build_configs || [];
    } catch (error) {
        console.error('获取应用详情失败:', error);
    } finally {
        loading.value = false;
    }
};





// 事件处理
const handleBack = () => {
    const nextQuery = { ...route.query };
    delete nextQuery.appId;
    router.replace({ query: nextQuery });
};


// 发布记录
const releaseRecordRef = ref(null);

const handleReleaseRecordDataRefresh = () => {
    if (releaseRecordRef.value && typeof releaseRecordRef.value.handleDataRefresh === 'function') {
        releaseRecordRef.value.handleDataRefresh();
    }
};








// 生命周期
onMounted(() => {
    fetchAppDetail();
});

provide('appDetail', appDetail); // 提供应用详情
</script>

<template>
    <div class="app-detail-container">
        <!-- 面包屑导航 -->
        <div class="mb-6">
            <a-breadcrumb>
                <a-breadcrumb-item>
                    <router-link to="/ci_cd/mobile_app/page">我的应用</router-link>
                </a-breadcrumb-item>
                <a-breadcrumb-item>
                    <span v-if="appDetail.name">{{ appDetail.name }}</span>
                    <span v-else>应用详情</span>
                </a-breadcrumb-item>
            </a-breadcrumb>
        </div>

        <!-- 应用基本信息 -->
        <div class="bg-white rounded-lg shadow-sm border p-6 mb-6">
           
                <div class="flex items-start justify-between">
                <div class="flex items-center space-x-4">
                    <a-button type="text" class="mr-2" @click="handleBack">
                        <template #icon><ArrowLeftOutlined /></template>
                    </a-button>
                    <template  v-if="appDetail"></template>
                    
                    <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        <SvgIcon :iconname="`icon-${appDetail?.platform}`" class="size-16" :class="{'text-[#007AFF]':appDetail.platform === 'ios'}"/>
                    </div>
                  
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ appDetail.name || '' }}</h1>
                        <p class="text-gray-600 mb-2">{{ appDetail.identifier || '' }}</p>
                        <div class="flex items-center space-x-3">
                            <a-tag color="blue" class="capitalize">
                                {{ state?.initTitleData?.platform?.find(item => item.value === appDetail.platform)?.label || '' }}
                            </a-tag>
                            <a-tag :color="appDetail.is_active ? 'success' : 'default'">
                                {{ appDetail.is_active ? '已激活' : '未激活' }}
                            </a-tag>
                        </div>
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <a-button @click="emits('click-edit')">
                        <template #icon><EditOutlined /></template>
                        编辑
                    </a-button>
                    <a-button danger @click="emits('click-del')">
                        <template #icon><DeleteOutlined /></template>
                        删除
                    </a-button>
                </div>
            </div>
            
            <div v-if="appDetail.description" class="mt-4">
                <p class="text-gray-700">{{ appDetail.description }}</p>
            </div>
        </div>

        <!-- 构建配置 -->
        <AppBuildConfig
            :build-configs-data="buildConfigs"
            @load-data="fetchAppDetail"
            @refresh-release-data="handleReleaseRecordDataRefresh"
        />

         <!-- 发布记录 -->
        <AppReleaseRecord ref="releaseRecordRef"/>

        
        
    </div>
</template>

<style scoped>
.app-detail-container {
    padding: .5rem 1.5rem;
    background-color: #f9fafb;
    min-height: 100vh;
}

/* 响应式调整 */
@media (max-width: 640px) {
    .app-detail-container {
        padding: 1rem;
    }
}

/* 表格样式优化 */
.overflow-hidden table {
    border-collapse: separate;
    border-spacing: 0;
}

.overflow-hidden table th:first-child {
    border-top-left-radius: 0.5rem;
}

.overflow-hidden table th:last-child {
    border-top-right-radius: 0.5rem;
}

/* 标签页内容区域 */
:deep(.ant-tabs-content-holder) {
    padding: 0;
}

:deep(.ant-tabs-tabpane) {
    padding: 0;
}

/* 卡片悬停效果 */
.bg-gray-50:hover {
    background-color: #f3f4f6;
    transition: background-color 0.2s ease;
}
</style>
