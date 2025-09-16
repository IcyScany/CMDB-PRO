<script setup>
import { ref, onMounted } from 'vue';
import advancedAuthApi from '@/api/backend/advancedAuthApi';
import successModal from '@/composables/successModal';
import MenuTitleButtonTree from '@/components/MenuTitleButtonTree.vue';
import TitleGroup from "@/views/backend/group/TitleGroup.vue";

// 标签页相关
const activeTab = ref('1');

// 第一个标签页：高级授权
const menuTitleList = ref([]);
const checkedMenus = ref([]);
const checkedTitles = ref([]);
const submitLoading1 = ref(false);

// 第二个标签页：业态高级授权配置
const businessList = ref([]);
const currentBusiness = ref(null);
const businessMenuTitleList = ref([]);
const businessCheckedMenus = ref([]);
const businessCheckedTitles = ref([]);
const loading2 = ref(false);
const submitLoading2 = ref(false);

// 初始化
onMounted(async () => {
    await Promise.all([
        fetchMenuTitleList(),
    ]);
});

// 第一个标签页：获取菜单和title列表
async function fetchMenuTitleList() {
    try {
        const res = await advancedAuthApi.getMenuAndTitleList();
        menuTitleList.value = res?.menus || [];
        businessList.value = res?.business || [];
        // 初始化选中状态
        checkedMenus.value = res?.menu_auth || [];
        checkedTitles.value = res?.title_auth || [];
    } catch (error) {
        console.error('获取菜单和title列表失败:', error);
    } 
}


// 第二个标签页：切换业态
async function handleBusinessChange(e) {
    if (!e.target.value) return;
    
    currentBusiness.value = e?.target?.value;
    loading2.value = true;
    fetchMenuTitleList();
    try {
        // 并行获取菜单title列表和已授权id
        const [menuRes, authRes] = await Promise.all([
            advancedAuthApi.getBusinessMenuAndTitleList(e.target.value),
            advancedAuthApi.getBusinessMenuAndTitleAuthorizationId(e.target.value)
        ]);
        
        businessMenuTitleList.value = menuRes?.data?.menus || [];
        businessCheckedMenus.value = authRes?.menu_auth || [];
        businessCheckedTitles.value = authRes?.title_auth || [];
        
      
    } catch (error) {
        console.error('获取业态数据失败:', error);
    } finally {
        loading2.value = false;
    }
}

// 第一个标签页：处理菜单勾选
function handleMenuCheck1({ menuId, checked }) {
    if (checked) {
        if (!checkedMenus.value.includes(menuId)) {
            checkedMenus.value.push(menuId);
        }
    } else {
        const index = checkedMenus.value.indexOf(menuId);
        if (index > -1) {
            checkedMenus.value.splice(index, 1);
        }
    }
}

// 第一个标签页：处理title勾选
function handleTitleCheck1({ titleId, checked }) {
    if (checked) {
        if (!checkedTitles.value.includes(titleId)) {
            checkedTitles.value.push(titleId);
        }
    } else {
        const index = checkedTitles.value.indexOf(titleId);
        if (index > -1) {
            checkedTitles.value.splice(index, 1);
        }
    }
}

// 第二个标签页：处理菜单勾选
function handleMenuCheck2({ menuId, checked }) {
    if (checked) {
        if (!businessCheckedMenus.value.includes(menuId)) {
            businessCheckedMenus.value.push(menuId);
        }
    } else {
        const index = businessCheckedMenus.value.indexOf(menuId);
        if (index > -1) {
            businessCheckedMenus.value.splice(index, 1);
        }
    }
}

// 第二个标签页：处理title勾选
function handleTitleCheck2({ titleId, checked }) {
    if (checked) {
        if (!businessCheckedTitles.value.includes(titleId)) {
            businessCheckedTitles.value.push(titleId);
        }
    } else {
        const index = businessCheckedTitles.value.indexOf(titleId);
        if (index > -1) {
            businessCheckedTitles.value.splice(index, 1);
        }
    }
}


// 第一个标签页：提交
async function handleSubmit1() {
    submitLoading1.value = true;
    try {
        let res = await advancedAuthApi.syncAndUpdateAdvancedAuth({
            menu_ids: checkedMenus.value,
            title_ids:checkedTitles.value
        });
        successModal({ title: res?.msg || '高级授权更新成功' , callback: fetchMenuTitleList});
    } catch (error) {
        console.error('提交失败:', error);
    } finally {
        submitLoading1.value = false;
    }
}

// 第二个标签页：提交
async function handleSubmit2() {
    if (!currentBusiness.value) return;
    
    submitLoading2.value = true;
    try {
        await advancedAuthApi.syncBusinessMenuAndTitleAuth(currentBusiness.value, {
            menu_ids: businessCheckedMenus.value,
            title_ids: businessCheckedTitles.value
        });
        successModal({ title: '业态高级授权更新成功' });
    } catch (error) {
        console.error('提交失败:', error);
    } finally {
        submitLoading2.value = false;
    }
}

// 计算属性：判断是否为普通功能
function isNormalFunction(item) {
    return item.auth_type === 0;
}
</script>

<template>
    <div class="advanced-auth-container">
        <a-tabs v-model:activeKey="activeTab">
            <!-- 第一个标签页：高级授权 -->
            <a-tab-pane key="1" tab="高级授权">
                <a-card >
                    <div class="auth-section">
                       <a-alert
                        message="注意：选中的为非高级功能"
                        type="warning"
                        show-icon
                        closable
                        style="margin-bottom: 16px;"
                      />
                        <MenuTitleButtonTree
                            v-model:checked-menus="checkedMenus"
                            v-model:checked-titles="checkedTitles"
                            :menus="menuTitleList"
                            :show-select-all="true"
                            :default-expand-all="true"
                            :show-level1-menu-checkbox="false"
                            :show-level1-menu="false"
                            @menu-check="handleMenuCheck1"
                            @title-check="handleTitleCheck1"
                           
                        />
                    </div>
                    
                    <div class="submit-section">
                        <a-button 
                            type="primary" 
                            :loading="submitLoading1"
                            @click="handleSubmit1"
                        >
                            提交高级授权
                        </a-button>
                    </div>
                </a-card>
            </a-tab-pane>
            <a-tab-pane key="3" tab="Title分组">
                <TitleGroup />
            </a-tab-pane>
            

            <!-- 第二个标签页：业态高级授权配置 -->
            <a-tab-pane key="2" tab="业态高级授权配置">
                <a-card >
                    <!-- 业态选择 -->
                    <div class="business-section">
                        <h3>选择业态 <vxe-button v-if="currentBusiness" content="刷新" size="mini" status="primary" @click=" handleBusinessChange({ target: { value: currentBusiness } })" /></h3>
                        

                        <a-radio-group 
                            v-model:value="currentBusiness" 
                            @change="handleBusinessChange"
                        >
                            <a-radio 
                                v-for="(business,id) in businessList" 
                                :key="id" 
                                :value="id"
                            >
                                {{ business.business }}
                            </a-radio>
                        </a-radio-group>
                    </div>

                    <!-- 菜单和功能配置 -->
                    <div class="auth-section">
                        <a-spin :spinning="loading2">
                           <a-divider>业态高级授权配置</a-divider>
                            <MenuTitleButtonTree
                                v-if="currentBusiness"
                                v-model:checked-menus="businessCheckedMenus"
                                v-model:checked-titles="businessCheckedTitles"
                                :menus="businessMenuTitleList"
                                :default-expand-all="true"
                                :disabled-layer-selection="true"
                                :disabled-check="isNormalFunction"
                                :disabled-level1-menu-selection="true"
                               
                                @menu-check="handleMenuCheck2"
                                @title-check="handleTitleCheck2"
                               
                            />
                            <a-empty v-if="!currentBusiness">
                                <template #description>
                                    <a-alert
                                        message="请先选择业态"
                                        type="warning"
                                        show-icon
                                        closeable
                                        style="margin-bottom: 16px;"
                                    />
                                </template>
                            </a-empty>
                        </a-spin>
                    </div>
                    
                    <div v-if="currentBusiness" class="submit-section">
                        <a-button 
                            type="primary" 
                            :loading="submitLoading2"
                            @click="handleSubmit2"
                        >
                            提交业态高级授权
                        </a-button>
                    </div>
                </a-card>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<style scoped lang="less">
.advanced-auth-container {
    padding: 20px;
}

.auth-section {
    margin-bottom: 20px;
    
    h3 {
        margin-bottom: 16px;
        color: #333;
    }
}

.business-section {
    margin-bottom: 20px;
    
    h3 {
        margin-bottom: 16px;
        color: #333;
    }
}

.submit-section {
    margin-top: 20px;
    text-align: center;
    position: fixed;
    bottom: 20px;
    right: 20px;
}

.ant-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}
</style>