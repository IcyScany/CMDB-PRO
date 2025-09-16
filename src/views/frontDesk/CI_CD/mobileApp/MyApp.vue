<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import MyAppEdit from "./MyAppEdit.vue";
import mobileAppApi from '@/api/ci_cd/mobileApp';
import subPage from "@/composables/subPage";
import { useRouter, useRoute } from 'vue-router';
import AppDetail from './AppDetail.vue';

defineProps({
    type: { // 页面类型
        type: String,
        default: () => 'mobile_app',
    },
});


const TITLE_LAYER = 1;

// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    initButton: [],
    initTitleData: [],
    subPageColumns: [],
    tableOrder: {},
    titleFieldSearch: [],
    proxyQueryAllResult: [],
});
const viewMode = ref('grid'); // 'grid' 或 'list'
const router = useRouter();
const route = useRoute();
const showDetail = computed(() => !!route.query.appId);

// 用户操作相关
const { userEdit, userDel, formOpen, formType, formSid } = userOperate({});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'id':
            case 'name':
                col.slots = {
                    default: field
                };
                break; 
        }
    }
    return state.initColumn;
});

// 用于获取用户的操作权限
const canUserAction = computed(() => {
    return state.initButton.reduce((acc, btn) => {
        acc[btn.field] = btn;
        return acc;
    }, {});
});

onMounted(async () => {
    const { button, columns, title_data, sub_page_columns, order, title_field_search } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || [];
    state.subPageColumns = sub_page_columns || [];
    state.tableOrder = order.value || {};
    state.titleFieldSearch = title_field_search.value || [];
    viewMode.value = 'grid';
    await handleDataRefresh();
});

// 表格数据的获取
const handleDataRefresh = async () => {
    if (tableRef.value) {
        await tableRef.value.serverTableRef.commitProxy('query');
    }
};

// 用户新增编辑操作
const handleUserEdit = ({type, row}) => {
    userEdit({type: type, sid: row.id});
};

// 用户删除操作
const handleUserDel = ({row}) => {
    userDel({ sid: row.id, delApi: mobileAppApi.del, loadData: handleDataRefresh });
};

// 子页面
const {
    subPageOpen,
    subPageRow,
    handleSubPageOpen,
} = subPage();



const handleViewApp = (app) => {
    const nextQuery = { ...route.query, appId: String(app.id) };
    router.replace({ query: nextQuery });
};


// 处理查询所有结果
const handleProxyQueryAllResult = (result) => {
    let { response } = result;
    state.proxyQueryAllResult = response?.data || [];
};

provide('state', state);
</script>

<template>
    <div v-show="!showDetail" class="mobile-app-container">
        <!-- 搜索和过滤栏 -->
        <div class="bg-white rounded-lg shadow-sm border p-2 mb-6">
            <a-flex gap="middle" align="center" wrap="wrap" justify="flex-end">
                <a-flex gap="middle" align="center" >
                   
                      <!-- 视图切换 -->
                      <a-radio-group v-model:value="viewMode" button-style="solid" >
                        <a-radio-button value="grid">
                            <AppstoreOutlined />
                        </a-radio-button>
                        <a-radio-button value="list">
                            <UnorderedListOutlined />
                        </a-radio-button>
                    </a-radio-group>

                </a-flex>


            </a-flex>
        </div>
    </div>

   
   
    
     <div  v-show="!showDetail" class=" min-h-[300px] bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col p-4 ">
         <!-- 主表格部分 -->
         <server-table
            ref="tableRef"
            :table-column="initTableColumns.map(item => ({...item, visible: viewMode === 'list'}))"
            :auth-btn="canUserAction"
            :order="state.tableOrder"
            :query-api="mobileAppApi.postAppList"
            :title-field-search="state.titleFieldSearch"
            :switch-click-status-config="{
                 api: mobileAppApi.putMobileAppEdit,
                 params:['is_active'],
            }"
            @user-edit="handleUserEdit"
            @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
            @user-del="handleUserDel"
            @proxy-query-all-result="handleProxyQueryAllResult"
            @get-data="handleDataRefresh"
        >
           <template #topSuffix>
            <div  v-show="viewMode === 'grid'">
            <!-- 页面头部 -->
            <!-- <div class="flex items-end justify-end mb-6">

                <a-button type="primary" @click="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    创建新应用
                </a-button>
            </div> -->
                <div v-if="state.proxyQueryAllResult && state.proxyQueryAllResult.length > 0" id="app-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    <div
                        v-for="app in state.proxyQueryAllResult" :key="app.id"
                        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col mb-2">
                        <div class="p-6 flex-grow">
                            <div class="flex items-start justify-between">
                                <div class="flex items-center space-x-4">
                              
                                    <div class="w-16 h-16  flex items-center justify-center bg-[#d9ebff] rounded-full">
                                        <svg-icon :iconname="`icon-${app?.platform || 'ios'}`" class="h-12 w-12  rounded-full" :class="{'text-[#007AFF]':app.platform === 'ios'}"/>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900">{{ app.name }}</h3>
                                        <p class="text-sm text-gray-500">{{ app.identifier }}</p>
                                    </div>
                                </div>

                                <svg-icon :iconname="`icon-${app?.platform || 'ios'}`" class=" text-[#d9ebff] rounded-full" />
                               
                            </div>
                            <p class="mt-4 text-sm text-gray-600">{{ app.description }}</p>
                        </div>
                        <div class="bg-gray-50 px-6 py-3 flex justify-between items-center">
                            <span class="text-sm font-medium text-indigo-600 hover:text-indigo-800 text-primary cursor-pointer" @click="handleViewApp(app)">查看详情
                                →</span>
                            <div class="flex space-x-2">
                                <template v-if="canUserAction?.edit?.page_display">
                                    <vxe-button  icon="vxe-icon-edit"   status="primary" mode="text"  style="margin-left: 10px; cursor: pointer" size="mini" @click.stop="handleUserEdit({type:$CONFIG.FORM_TYPE.EDIT_TYPE,row:app})"/>
                                    <a-divider type="vertical" />
                                </template>
                                
                                <vxe-button v-if="canUserAction?.del?.page_display" icon="vxe-icon-delete" status="error" mode="text"  style="margin-left: 10px; cursor: pointer"  size="mini" @click.stop="handleUserDel({row:app})" />
                            </div>
                        </div>
                    </div>
                    <!-- 空状态 -->
                    <div v-show="state.proxyQueryAllResult.length === 0" class="text-center py-20">
                        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">暂无应用</h3>
                        <p class="text-gray-500 mb-6">您还没有创建任何移动应用</p>
                        <a-button type="primary" @click="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})">
                            <template #icon>
                                <PlusOutlined />
                            </template>
                            创建第一个应用
                        </a-button>
                    </div>


            </div>
           </div>
           </template>
            <!-- 表格插槽 -->
            <template #id="{row}">
                <ops-tooltip 
                    :title="row.name" 
                    :content="row.id" 
                    placement="topLeft"
                    @click="handleSubPageOpen(row)"
                />
            </template>
            <template #name="{row}">
                <div class="flex items-center">
                    <span class="text-sm font-medium text-indigo-600 hover:text-indigo-800 text-primary cursor-pointer" @click="handleViewApp(row)">{{ row.name }}
                                </span>
                </div>
            </template>
        </server-table>
     </div>

    <!-- 编辑组件 -->
    <MyAppEdit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handleDataRefresh"
    />

    <ops-sub-page
        v-model:open="subPageOpen"
        :title="subPageRow?.name"
        :basic-config="{
            columns: state.subPageColumns,
            api: mobileAppApi.getAppList,
            sid: subPageRow?.id,
        }"
        @click-edit="handleUserEdit({type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: subPageRow})"
    >
       
    </ops-sub-page>

    <!-- 显示应用详情（基于查询参数 appId） -->
    <template v-if="showDetail">
        <app-detail  @click-edit="handleUserEdit({type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: {id: route.query.appId}})" @click-del="handleUserDel({id: route.query.appId})"/>
    </template>

</template>

<style scoped lang="less">
:deep(.ant-typography) {
    margin-bottom: 0 !important;
}


</style>
