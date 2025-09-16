<script setup>
/** 组件用于 云账号清单**/

import tableRender from "@/composables/table/tableRender";
import CloudAccountReginList from './CloudAccountReginList.vue';
import cmdbEntityFormInit from "@/composables/cmdbEntityFormInit";
import cloudAccountApi from "@/api/cloudManage/cloudAccountApi";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from './Edit.vue';
import Add from './Add.vue';
import SubAccountList from './subAccountList/index.vue';
import SubAccountAk from './subAccountAk/index.vue';
import modalConfirm from "@/composables/diffModal/modalConfirm";
import CloudTypeIcon from '@/components/common/CloudTypeIcon.vue';

const urlPrefix = `cloud-manage/cloud-account/`;
const cloudTableRef = ref(null);
let initColumn = ref([]); // 表格的列
const titleLayer = 1;
let initButton = ref([]); // 表格的button
let initTitleData = ref({}); // 通过配置得到的titleData

const showSubAccount = ref(false);
const showAkPage = ref(false);
const subAccountSid = ref();
const subPageUserId = ref();

// 视图模式控制
const viewMode = ref('view'); // 'list' 或 'view'
const tableData = ref([]); // 存储表格数据

// 搜索和分页相关
const searchKeyword = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const totalCount = ref(0);

onMounted(async () => {
    let {
        title_data,
        button,
        columns,
    } = await tableRender.setColumn({layer: titleLayer});
    initColumn.value = columns.value || [];
    initButton.value = button.value || [];
    initTitleData.value = title_data.value || {};
});

// 用户的操作
const {
    userEdit,
    formOpen,
    formType,
    formSid,
} = userOperate({});
// 用户的操作
const {
    userEdit: userAddEdit,
    formOpen: addFormOpen,
    formType: addFormType,
    formSid:  addFormSid,
} = userOperate({});

// 用于获取用户的操作权限
let canUserAction = computed(() => {
    let result = {
        add: false,
        edit: false,
        del: false,
    };
    if (initButton.value) {
        for (let btn of initButton.value) {
            let { field } = btn;
            switch (field) {
                case 'add-account':
                    result.add = btn;
                    break;
                case 'edit-account':
                    result.edit = btn;
                    break;
                case 'del-account':
                    result.del = btn;
                    break;
            }
        }
    }
    return result;
});

// 加载表格的列
const initTableColumns = computed(() => {
    for (let col of initColumn.value) {
        let { field }  = col;
        switch (field) {
            case 'status':
                col.slots = {
                    default: field
                };
                break;
            case 'user_group':
                delete col.showOverflow;
                col.slots = {
                    default: field
                };
                break;
            case 'regions_list':
            case 'enterprise_projects':
            case 'sub_account_ak':
                col.slots = {
                    default: field
                };
                break;
            case 'virtual_team_v3_id':
                col.showOverflow = false;
                break;
        }
    }
    return initColumn.value;
});

onMounted(async () => {
    await handlePageGetData();
});

// 处理表格数据变化
const handleTableDataChange = (data) => {
    tableData.value = data;
};

/** 处理某一条数据的编辑 --Start**/
/*let editOpen = ref(false);
let editOneData = ref({});
const handleOneDataEdit = (row) => {
    editOpen.value = true;
    editOneData.value = row;
};*/

// 用户的新增编辑操作
const handleUserEdit = ({type, row}) => {
    userEdit({type: type, sid: row.id});
};
const handlePageGetData = async () => {
    await cloudTableRef?.value && cloudTableRef.value?.commitRequest();
};

const {
    userClickStatus,
} = cmdbEntityFormInit({urlPrefix, getData:handlePageGetData, editUrl: 'edit-account'});

/** 某条数据的可用区查看 --Start**/
let reginOpen = ref(false);
let reginListOneData = ref({});
let messageListType = ref(''); // 列表的类型
const handleReginListLook = (row, type) => {
    reginOpen.value = true;
    messageListType.value = type;
    reginListOneData.value = row || {};
};

const toSubPage = (type, row) => {
    if (type === 'sub_account_ak') {
        showAkPage.value = true;
    } else {
        showSubAccount.value = true;
    }
    subAccountSid.value = row.id;
};

let confirmData = ref(null);
const handleSwitchCheck = (data) => {
    confirmData.value = data;
    if (data.checked) {
        userClickStatus(confirmData.value);
    } else {
        modalConfirm({okCallBack: {api: userClickStatus,data:confirmData.value}, tip:`禁用此同步后，对应数据会全部清除,确认是否禁用`});
    }
};

const handleSubAccoutOpen = (user_id) => {
    subPageUserId.value = user_id;
};



// 获取云类型显示名称
const getCloudTypeDisplayName = (cloudType) => {
    const typeMap = {
        'huawei': '华为云',
        'ali': '阿里云',
        'zdns': 'ZDNS'
    };
    return typeMap[cloudType?.toLowerCase()] || cloudType;
};

// 判断是否显示企业项目按钮
const showEnterpriseProject = (cloudType) => {
    return cloudType?.toLowerCase() !== 'ali' && cloudType?.toLowerCase() !== 'zdns';
};

// 判断是否显示按钮组
const showButtons = (cloudType) => {
    return cloudType?.toLowerCase() !== 'zdns';
};

// 过滤后的卡片数据
const filteredCardData = computed(() => {
    let data = [];
    
    // 确保数据存在
    if (cloudTableRef.value && cloudTableRef.value.tableAllData) {
        data = Array.isArray(cloudTableRef.value.tableAllData) ? cloudTableRef.value.tableAllData : [];
    }
    
    // 搜索过滤
    if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        data = data.filter(item => 
            item.primary_username?.toLowerCase().includes(keyword) ||
            item.page_display?.toLowerCase().includes(keyword) ||
            item.describe?.toLowerCase().includes(keyword) ||
            getCloudTypeDisplayName(item.cloud_type).toLowerCase().includes(keyword)
        );
    }
    
    // 分页
    const startIndex = (currentPage.value - 1) * pageSize.value;
    const endIndex = startIndex + pageSize.value;
    
    totalCount.value = data.length;
    return data.slice(startIndex, endIndex);
});

// 搜索处理
const handleSearch = () => {
    currentPage.value = 1; // 重置到第一页
};

// 分页处理
const handlePageChange = (page) => {
    currentPage.value = page;
};

// 页面大小改变处理
const handlePageSizeChange = (current, size) => {
    pageSize.value = size;
    currentPage.value = 1; // 重置到第一页
};

provide('urlPrefix', urlPrefix);
provide('button', initButton);
</script>

<template>
    <div class="cloud-account-container">
        <!-- 分段控制器 -->
        <div v-show="!showSubAccount && !showAkPage" class="mb-6 flex justify-end pt-4">
            <a-segmented
                v-model:value="viewMode"
                :options="[
                    { label: '视图', value: 'view', icon: 'AppstoreOutlined' },
                    { label: '列表', value: 'list', icon: 'BarsOutlined' }
                ]"
                size="large"
            />
        </div>

        <!-- 列表视图 -->
        <ops-table
            v-show="viewMode === 'list' && !showSubAccount && !showAkPage"
            ref="cloudTableRef"
            :columns="initTableColumns"
            :auth-btn="canUserAction"
            :request-config="{
                    api: cloudAccountApi.getAccountListApi,
                    immediate: false,
                }"
            :filter-config = "{
                remote: false,
                showIcon: true,
                }"
            :is-show-doc="true"
            @user-edit="handleUserEdit"
            @user-add="userAddEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE});"
            @data-change="handleTableDataChange"
        >
            <template #status="{ row, rowIndex }">
                <a-switch
                    :checked="row.status"
                    :checked-value="1"
                    :un-checked-value="0"
                    :checked-children="initTitleData?.status?.['1'] || '启动'"
                    :un-checked-children="initTitleData?.status?.['0']  || '禁用'"
                    :disabled="!canUserAction?.['edit']?.page_display"
                    @click="(checked) => handleSwitchCheck({checked,  sid: row.id, rowIndex, field: 'status'})"
                />
            </template>
            <template #regions_list="{row}">
                <vxe-button v-show="row.cloud_type.toLowerCase() !== 'zdns'" mode="text" content="可用区" status="primary" @click="handleReginListLook(row, 'regions_list')"/>
            </template>
            <template #enterprise_projects="{row}">
                <vxe-button v-show="row.cloud_type.toLowerCase() !== 'zdns'"  mode="text" content="企业项目" status="primary" @click="handleReginListLook(row, 'enterprise_projects')"/>
            </template>
            <template #sub_account_ak="{row}">
                <vxe-button v-show="row.cloud_type.toLowerCase() !== 'zdns'" mode="text" content="子账号清单" status="primary" @click="toSubPage('sub_account_list', row)"/>
                <vxe-button v-show="row.cloud_type.toLowerCase() !== 'zdns'" mode="text" content="子账号AK" status="primary" @click="toSubPage('sub_account_ak', row)"/>
            </template>
            <template #virtual_team_v3_id="{row}">
                {{ row.page_display }}<br/>
                <VirtualTeamCell
                    :field-value="row.virtual_team_v3_id"
                    :data-source="initTitleData.virtual_team_v3_id"
                />
            </template>
        </ops-table>

        <!-- 卡片视图 -->
        <div v-show="viewMode === 'view' && !showSubAccount && !showAkPage" class="card-view">
            <!-- 搜索和分页组件 -->
            <div class="flex justify-between items-center mb-6 px-1">
                <!-- 搜索框 -->
                <div class="flex-1 max-w-xs">
                    <a-input-search
                        v-model:value="searchKeyword"
                        placeholder="搜索云账号..."
                        style="width: 300px;"
                        @search="handleSearch"
                        @change="handleSearch"
                    />
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4 py-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                <div 
                    v-for="(item, rowIndex) in filteredCardData" 
                    :key="item.id" 
                    class="bg-white rounded-xl shadow-md border-2 border-gray-200 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-300"
                    :class="{ 'opacity-60 bg-gray-50': !item.status }"
                >
                    <div class="flex justify-between items-center mb-4">
                        <div class="flex items-center gap-2">
                            <CloudTypeIcon :type="item.cloud_type" class="w-16" />
                            <span class="font-semibold text-base text-gray-800">{{ getCloudTypeDisplayName(item.cloud_type) }}</span>
                        </div>
                        <div 
                            class="px-3 py-1 rounded-full text-xs font-medium shadow-sm transform hover:scale-105 transition-transform duration-200"
                            :class="item.status ? 'bg-green-50 text-green-600 border-2 border-green-300 shadow-green-100' : 'bg-red-50 text-red-500 border-2 border-red-300 shadow-red-100'"
                        >
                            <a-switch
                                :checked="item.status"
                                :checked-value="1"
                                :un-checked-value="0"
                                :checked-children="initTitleData?.status?.['1'] || '启动'"
                                :un-checked-children="initTitleData?.status?.['0']  || '禁用'"
                                :disabled="!canUserAction?.['edit']?.page_display"
                                @click="(checked) => handleSwitchCheck({checked,  sid: item.id, rowIndex, field: 'status'})"
                            />
                        </div>
                    </div>
                    
                    <div class="mb-5">
                        <div class="flex mb-2">
                            <span class="text-gray-600 text-sm min-w-20">主账户：</span>
                            <span class="text-gray-800 text-sm font-medium break-all w-full truncate" :title="item.primary_username">{{ item.primary_username }}</span>
                        </div>
                        <div class="flex mb-2">
                            <span class="text-gray-600 text-sm min-w-20">子账户：</span>
                            <span class="text-gray-800 text-sm font-medium break-all w-full truncate" :title="item.username">{{ item.username }}</span>
                        </div>  
                        <div class="flex mb-2">
                            <span class="text-gray-600 text-sm min-w-20">页面展示：</span>
                            <span class="text-gray-800 text-sm font-medium break-all w-full truncate" :title="item.page_display">{{ item.page_display }}</span>
                        </div>
                        <div class="flex mb-2">
                            <span class="text-gray-600 text-sm min-w-20">描述：</span>
                            <span class="text-gray-800 text-sm font-medium break-all w-full truncate" :title="item.describe">{{ item.describe }}</span>
                        </div>
                    </div>
                    
                    <div v-if="showButtons(item.cloud_type)" class="flex flex-wrap gap-2 opacity-100 transition-opacity duration-300 relative z-10">
                        <a-button 
                            type="primary" 
                            size="small"
                            class="w-24 rounded-md text-xs h-7 px-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 relative z-10"
                            @click="handleReginListLook(item, 'regions_list')"
                        >
                            可用区
                        </a-button>
                        <a-button 
                            v-if="showEnterpriseProject(item.cloud_type)"
                            type="primary" 
                            size="small"
                            class="w-24 rounded-md text-xs h-7 px-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 relative z-10"
                            @click="handleReginListLook(item, 'enterprise_projects')"
                        >
                            企业项目
                        </a-button>
                        <a-button 
                            type="primary" 
                            size="small"
                            class="w-24 rounded-md text-xs h-7 px-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 relative z-10"
                            @click="toSubPage('sub_account_list', item)"
                        >
                            子账号清单
                        </a-button>
                        <a-button 
                            type="primary" 
                            size="small"
                            class="w-24 rounded-md text-xs h-7 px-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 relative z-10"
                            @click="toSubPage('sub_account_ak', item)"
                        >
                            子账号AK
                        </a-button>
                    </div>
                </div>
            </div>
            
            <!-- 空状态 -->
            <div v-if="!cloudTableRef?.tableAllData || filteredCardData.length === 0" class="text-center py-15">
                <a-empty description="暂无数据" />
            </div>
               <!-- 分页 -->
               <div class="float-right pt-4">
                    <a-pagination
                        v-model:current="currentPage"
                        v-model:page-size="pageSize"
                        :total="totalCount"
                        :show-size-changer="true"
                        :show-quick-jumper="true"
                        :show-total="(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`"
                        @change="handlePageChange"
                        @show-size-change="handlePageSizeChange"
                    />
                </div>
        </div>
    </div>

    <!-- 子账号清单 -->
    <SubAccountList
        v-model:showSubAccount="showSubAccount"
        v-model:subPageUserId="subPageUserId"
        :sid="subAccountSid"
    />

    <!-- 子账号AK -->
    <SubAccountAk
        v-model:showAkPage="showAkPage"
        :sid="subAccountSid"
        @account-sub-page-open="handleSubAccoutOpen"
    />

   <!-- 云账号的可用区  -->
    <CloudAccountReginList
        v-model:open="reginOpen"
        :one-data="reginListOneData"
        :list-type="messageListType"
    />

    <edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handlePageGetData"
    />
    <add
        v-model:open="addFormOpen"
        :sid="addFormSid"
        :form-type="addFormType"
        @edit-success="handlePageGetData"
    />
</template>

<style scoped lang="less">
// 卡片3D效果增强
.bg-white {
    position: relative;
    transform-style: preserve-3d;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
        border-radius: inherit;
        pointer-events: none;
        z-index: 0;
    }
    
    // 确保按钮在伪元素之上且可点击
    .ant-btn {
        position: relative;
        z-index: 20;
        pointer-events: auto;
    }
    
    // 确保按钮容器可点击
    .flex.flex-wrap.gap-2 {
        position: relative;
        z-index: 15;
        pointer-events: auto;
    }
    
    &:hover {
        transform: translateY(-4px) rotateX(2deg);
        box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1);
    }
}

// 响应式设计
@media (max-width: 768px) {
    .cloud-account-container {
        .card-view {
            .grid {
                grid-template-columns: 1fr;
                gap: 1rem;
                
                .bg-white {
                    padding: 1rem;
                    
                    .flex.flex-wrap.gap-2 {
                        flex-direction: column;
                        
                        .ant-btn {
                            width: 100%;
                        }
                    }
                }
            }
        }
    }
}
</style>

