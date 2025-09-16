<script setup>
import { cookie } from 'xe-utils';
import { userCommonMessageStore } from '@/stores/user';


let userCommonStore = userCommonMessageStore();

let showPopup = ref(true);
let businessList = computed(() => userCommonStore?.loginSucceess?.business_list);
let currentUserBusiness = ref(null);

onMounted(() => {
    currentUserBusiness.value = null;
});

// 业态的切换选择时
function handleChangeBusiness(val) {
    currentUserBusiness.value = val;
    userCommonStore.handleSetCurrentBus(val);
    cookie('CMDB_CHECK_BUSINESS', val);
}

// 点击确定按钮选择业态的处理
function handleChooseBusiness() {
    if (!currentUserBusiness.value) return;
    window.history.replaceState(null, '', '/product');
    window.history.pushState(null, '', '/product');
    window.location.href = '/product';
}

</script>

<template>
    <vxe-modal
        :model-value="showPopup"
        width="80%"
        :show-close="false"
        show-footer
        lock-view
        :mask-closable="false"
        :confirm-closable="false"
        :show-minimize="false"
        :show-maximize="false"
        :show-header="false"
        resize
        class-name="business-select-modal"
    >

        <div class="business-select-header">
            <div class="select-title">
                <span class="icon">
                    <SelectOutlined />
                </span>
                <span class="text">请选择业态</span>
            </div>
            <div class="select-desc">选择一个业态以继续</div>
        </div>
        <div class="business-grid">

            <div
                v-for="(name, key) in businessList"
                :key="key"
                class="business-card"
                :class="{ active: currentUserBusiness === key }"
                @click="handleChangeBusiness(key)"
            >
                <div class="card-content">
                    <div class="business-icon">
                        <i class="vxe-icon-company" :style="{ color: name?.[1] }"></i>
                    </div>
                    <div class="business-name">{{ name[0] }}</div>
                </div>
                <div v-if="currentUserBusiness === key" class="selected-mark" >
                    <CheckOutlined />
                </div>
            </div>
        </div>

        <template #footer>
            <vxe-button
                :disabled="!currentUserBusiness"
                content="确认"
                status="primary"
                class="confirm-button"
                @click="handleChooseBusiness"
            />
        </template>
    </vxe-modal>
</template>

<style scoped lang="less">
.business-select-modal {
    :deep(.vxe-modal--box) {
        border-radius: 8px;
    }
}

.modal-header {
    text-align: center;
    padding: 20px 0;
    
    .welcome-text {
        font-size: 24px;
        color: #1f2329;
        margin-bottom: 8px;
    }
    
    .sub-text {
        color: #646a73;
        font-size: 14px;
    }
}

.business-select-header {
    padding: 24px 24px 0;
    
    .select-title {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
        
        .icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--primary-color);
            color: #fff;
            font-size: 16px;
        }
        
        .text {
            font-size: 18px;
            font-weight: 500;
            color: var(--text-color);
        }
    }
    
    .select-desc {
        color: var(--text-color-secondary);
        font-size: 14px;
        margin-left: 44px;
    }
}

.business-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    padding: 24px;
    margin-top: 16px;
}

.business-card {
    position: relative;
    height: 120px;
    border: 1px solid #e5e6eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        border-color: var(--primary-color);
        background: #f5f7fa;
    }
    
    &.active {
        border-color: var(--primary-color);
        background: #f0f7ff;
    }
}

.card-content {
    text-align: center;
    
    .business-icon {
        font-size: 32px;
        margin-bottom: 12px;
    }
    
    .business-name {
        color: #1f2329;
        font-size: 16px;
    }
}

.selected-mark {
    position: absolute;
    right: -1px;
    top: -1px;
    width: 24px;
    height: 24px;
    background: var(--primary-color);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0 8px 0 8px;
}

.confirm-button {
    min-width: 120px;
    height: 40px;
}
</style>
