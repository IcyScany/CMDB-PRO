<script setup>
/** 系统的弹窗登录
 * 情形1：当前标签有cookie无选择租户
 * 情形2：当前标签无cookie有选择租户
 * * **/

import { userCommonMessageStore } from '@/stores';
import CmdbLoginForm  from './CmdbLoginForm.vue';

let userCommonStore = userCommonMessageStore();
const loginSuccess = () => {
    userCommonStore.handleUseModalLogin(false);
    window.location.reload();
};


</script>
<template>
    <a-modal
        v-if="userCommonStore.isUseModalLogin"
        :open="userCommonStore.isUseModalLogin"
        :mask="true"
        :mask-closable="false"
        :closable="false"
        :footer="null"
        :centered="true"
        :body-style="{'backgroundColor': 'rgba(255, 255, 255, 0.99)'}"
        :width="'850px'"
        class="modal-ops-login"

        @cancel="userCommonStore.handleUseModalLogin(false)"
    >
        <CmdbLoginForm login-type="modal"  @login-success="loginSuccess"/>
    </a-modal>
</template>

<style>
.modal-ops-login .ant-modal-content {
    padding: 0px !important;
    background-color: rgba(255, 255, 255, 0.99) !important;
    box-shadow: none !important;
}
</style>

<style scoped lang="less">
.login-form-box {
    position: unset;
    :deep(.login-form-box-item) {
        width: 100% !important;
        box-shadow: none;
    }
  
}

</style>
