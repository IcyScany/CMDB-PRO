<script setup>
import mobileAppApi from '@/api/ci_cd/mobileApp';
import { useRouter } from 'vue-router';
import OpsTable from '@/components/OpsTable/index.vue';
import MyApp1 from './MyApp1.vue';


const router = useRouter();

// 响应式数据
const loading = ref(false);
const viewMode = ref('grid'); // 'grid' 或 'list'
const appData = ref({
    data: [],
    recordsTotal: 0,
    recordsFiltered: 0,
    page_number: 1
});

// 过滤和搜索
const filterState = reactive({
    searchText: '',
    platform: 'all',
    status: 'all'
});

// 分页配置
const pagination = reactive({
    currentPage: 1,
    pageSize: 12,
    total: 0
});

// 获取应用列表数据
const fetchAppList = async () => {
    try {
        loading.value = true;
        const response = await mobileAppApi.getAppList();
        appData.value = response;
        pagination.total = response.recordsTotal;
    } catch (error) {
        console.error('获取应用列表失败:', error);
    } finally {
        loading.value = false;
    }
};

// 过滤后的数据
const filteredApps = computed(() => {
    let filtered = appData.value.data || [];
    
    // 搜索过滤
    if (filterState.searchText) {
        const searchTerm = filterState.searchText.toLowerCase();
        filtered = filtered.filter(app => 
            app.name.toLowerCase().includes(searchTerm) ||
            app.description?.toLowerCase().includes(searchTerm) ||
            app.identifier.toLowerCase().includes(searchTerm)
        );
    }
    
    // 平台过滤
    if (filterState.platform !== 'all') {
        filtered = filtered.filter(app => app.platform === filterState.platform);
    }
    
    // 状态过滤
    if (filterState.status !== 'all') {
        const isActive = filterState.status === 'active';
        filtered = filtered.filter(app => app.is_active === isActive);
    }
    
    return filtered;
});

// 视图模式下分页后的数据
const paginatedApps = computed(() => {
    if (viewMode.value === 'list') return filteredApps.value;
    
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredApps.value.slice(start, end);
});

// 表格列配置
const tableColumns = [
    {
        field: 'name',
        title: '应用名称',
        minWidth: 180,
        slots: { default: 'name' }
    },
    {
        field: 'platform',
        title: '平台',
        width: 100,
        slots: { default: 'platform' }
    },
    {
        field: 'identifier',
        title: '标识符',
        minWidth: 150
    },
    {
        field: 'description',
        title: '描述',
        minWidth: 200,
        showOverflow: 'tooltip'
    },
    {
        field: 'is_active',
        title: '状态',
        width: 80,
        slots: { default: 'status' }
    },
    {
        field: 'create_time',
        title: '创建时间',
        width: 160,
        sortable: true,
        formatter: ({ cellValue }) => {
            if (!cellValue) return '-';
            return new Date(cellValue).toLocaleString('zh-CN');
        }
    },
    {
        field: 'operation',
        title: '操作',
        width: 120,
        slots: { default: 'operation' }
    }
];

// 表格权限配置
const authConfig = {
    add: { page_display: true },
    edit: { page_display: true },
    del: { page_display: true }
};

// 平台图标映射
const platformIcons = {
    ios: 'https://developer.apple.com/favicon.ico',
    android: 'https://developer.android.com/favicon.ico'
};

// 获取应用图标
const getAppIcon = (app) => {
    if (app.icon_url) return app.icon_url;
    return platformIcons[app.platform] || '/images/mobile-app.png';
};

// 获取平台标签颜色
const getPlatformColor = (platform) => {
    const colors = {
        ios: '#007AFF',
        android: '#3DDC84'
    };
    return colors[platform] || '#666';
};

// 页面切换
const handlePageChange = ({ currentPage, pageSize }) => {
    pagination.currentPage = currentPage;
    pagination.pageSize = pageSize;
};

// 清空搜索（预留功能）
// const clearSearch = () => {
//     filterState.searchText = '';
//     filterState.platform = 'all';
//     filterState.status = 'all';
// };

// 事件处理
const handleAddApp = () => {
    console.log('添加新应用');
};

const handleEditApp = (app) => {
    console.log('编辑应用:', app);
};

const handleDeleteApp = (app) => {
    console.log('删除应用:', app);
};

const handleViewApp = (app) => {
    console.log('查看应用详情:', app);
    router.push(`/ci_cd/mobile_app/${app.id}`);
};

// 生命周期
onMounted(() => {
    fetchAppList();
});
</script>

<template>
    <div class="mobile-app-container">
        <!-- 搜索和过滤栏 -->
        <div class="bg-white rounded-lg shadow-sm border p-2 mb-6">
            <div class="flex flex-wrap gap-4 items-center justify-between">
                <!-- 搜索框 -->
                <div class="flex-1 min-w-80">
                    <a-input-search v-model:value="filterState.searchText" placeholder="搜索应用名称、描述或标识符..." size="large"
                        allow-clear class="w-full">
                        <template #prefix>
                            <SearchOutlined class="text-gray-400" />
                        </template>
                    </a-input-search>
                </div>

                <!-- 过滤器 -->
                <div class="flex gap-4 items-center">
                    <div class="flex items-center gap-2">
                        <span class="text-gray-600 text-sm">平台:</span>
                        <a-select v-model:value="filterState.platform" style="width: 120px">
                            <a-select-option value="all">全部</a-select-option>
                            <a-select-option value="ios">iOS</a-select-option>
                            <a-select-option value="android">Android</a-select-option>
                        </a-select>
                    </div>

                    <div class="flex items-center gap-2">
                        <span class="text-gray-600 text-sm">状态:</span>
                        <a-select v-model:value="filterState.status" style="width: 120px">
                            <a-select-option value="all">全部</a-select-option>
                            <a-select-option value="active">活跃</a-select-option>
                            <a-select-option value="inactive">非活跃</a-select-option>
                        </a-select>
                    </div>

                    <!-- 视图切换 -->
                    <a-radio-group v-model:value="viewMode" button-style="solid" size="large">
                        <a-radio-button value="grid">
                            <AppstoreOutlined />
                        </a-radio-button>
                        <a-radio-button value="list">
                            <UnorderedListOutlined />
                        </a-radio-button>
                    </a-radio-group>
                </div>
            </div>
        </div>
        <MyApp1 />

        


        <!-- 视图模式 -->
        <div v-if="viewMode === 'grid'" class="grid-view">
            <!-- 页面头部 -->
            <div class="flex items-end justify-end mb-6">

                <a-button type="primary" @click="handleAddApp">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    创建新应用
                </a-button>
            </div>

            <div v-if="!loading && paginatedApps.length > 0" id="app-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                    v-for="app in paginatedApps" :key="app.id"
                    class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col mb-2">
                    <div class="p-6 flex-grow">
                        <div class="flex items-start justify-between">
                            <div class="flex items-center space-x-4">
                               <!--  <img src="https://placehold.co/64x64/a5b4fc/1e293b?text=App"
                                    onerror="this.src='https://placehold.co/64x64/e2e8f0/64748b?text=Icon'"
                                    class="h-16 w-16 rounded-lg" alt="应用图标"> -->
                                    <img :src="getAppIcon(app)" :alt="app.name" class="h-16 w-16 rounded-lg"
                                        @error="$event.target.src='/images/mobile-app.png'" />
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-900">{{ app.name }}</h3>
                                    <p class="text-sm text-gray-500">{{ app.repo_url }}</p>
                                </div>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" data-lucide="apple"
                                class="lucide lucide-apple h-6 w-6 text-gray-400" title="iOS">
                                <path d="M12 6.528V3a1 1 0 0 1 1-1h0"></path>
                                <path
                                    d="M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21">
                                </path>
                            </svg>
                        </div>
                        <p class="mt-4 text-sm text-gray-600">{{ app.description }}</p>
                    </div>
                    <div class="bg-gray-50 px-6 py-3 flex justify-between items-center">
                        <span class="text-sm font-medium text-indigo-600 hover:text-indigo-800 text-primary cursor-pointer" @click="handleViewApp(app)">查看详情
                            →</span>
                        <div class="flex space-x-2">
                            <span class="text-sm font-medium text-indigo-600 hover:text-indigo-800 text-primary"
                                title="设置"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" data-lucide="settings-2"
                                    class="lucide lucide-settings-2 h-4 w-4">
                                    <path d="M14 17H5"></path>
                                    <path d="M19 7h-9"></path>
                                    <circle cx="17" cy="17" r="3"></circle>
                                    <circle cx="7" cy="7" r="3"></circle>
                                </svg></span>
                            <span class="text-sm font-medium text-indigo-600 hover:text-indigo-800 text-primary"
                                title="删除"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" data-lucide="trash-2"
                                    class="lucide lucide-trash-2 h-4 w-4">
                                    <path d="M10 11v6"></path>
                                    <path d="M14 11v6"></path>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                    <path d="M3 6h18"></path>
                                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg></span>
                        </div>
                    </div>
                </div>



            </div>
            <!-- 网格视图 -->
            

            <!-- 网格视图分页 -->
            <div v-if="!loading && paginatedApps.length > 0" class="mt-8 flex ">
                <vxe-pager v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
                    :total="filteredApps.length" :page-sizes="[12, 24, 48, 96]"
                    :layouts="['PrevJump', 'PrevPage', 'Number', 'NextPage', 'NextJump', 'Sizes', 'FullJump', 'Total']"
                    class="w-full" @page-change="handlePageChange" />
            </div>
        </div>

        <!-- 列表视图 -->
        <ops-table v-show="viewMode === 'list'" :data="filteredApps" :columns="tableColumns" :loading="loading"
            :auth-btn="authConfig" :show-search="false" class="p-2" @user-add="handleAddApp" @user-edit="handleEditApp"
            @user-del="handleDeleteApp">
            <!-- 应用名称列 -->
            <template #name="{ row }">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                        <img :src="getAppIcon(row)" :alt="row.name" class="w-full h-full object-cover"
                            @error="$event.target.src='/images/mobile-app.png'" />
                    </div>
                    <div>
                        <div class="font-medium text-gray-900">{{ row.name }}</div>
                        <div class="text-sm text-gray-500">{{ row.identifier }}</div>
                    </div>
                </div>
            </template>

            <!-- 平台列 -->
            <template #platform="{ row }">
                <a-tag :color="getPlatformColor(row.platform)" class="capitalize">
                    {{ row.platform }}
                </a-tag>
            </template>

            <!-- 状态列 -->
            <template #status="{ row }">
                <a-tag :color="row.is_active ? 'success' : 'default'">
                    {{ row.is_active ? '活跃' : '非活跃' }}
                </a-tag>
            </template>

            <!-- 操作列 -->
            <template #operation="{ row }">
                <div class="flex space-x-2">
                    <a-button type="link" size="small" @click="handleViewApp(row)">查看</a-button>
                    <a-button type="link" size="small" @click="handleEditApp(row)">编辑</a-button>
                    <a-button type="link" size="small" danger @click="handleDeleteApp(row)">删除</a-button>
                </div>
            </template>
        </ops-table>

        <!-- 加载状态 -->
        <div v-if="loading" class="flex justify-center items-center py-20">
            <a-spin size="large" />
        </div>

        <!-- 空状态 -->
        <div v-if="!loading && paginatedApps.length === 0" class="text-center py-20">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">暂无应用</h3>
            <p class="text-gray-500 mb-6">您还没有创建任何移动应用</p>
            <a-button type="primary" @click="handleAddApp">
                <template #icon>
                    <PlusOutlined />
                </template>
                创建第一个应用
            </a-button>
        </div>
    </div>
</template>

<style scoped>
.mobile-app-container {
    background-color: #f9fafb;
    min-height: 100vh;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* 网格视图响应式调整 */
@media (max-width: 640px) {
    .mobile-app-container {
        padding: 1rem;
    }
    
    .grid {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }
}

@media (min-width: 641px) and (max-width: 1024px) {
    .grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

/* 卡片悬停效果 */
.bg-white:hover {
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    transform: translateY(-1px);
    transition: all 0.2s ease-in-out;
}

/* 自定义滚动条 */
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
}
</style>