<script setup>
import { VxeUI } from 'vxe-pc-ui';
import {decodePasswd} from '@/composables/encryptField';

let props = defineProps({    
    type: { // 类型 text | password
        type: String,
        default: 'text'
    },
    content: { // 内容
        type: String,
        default: ''
    },
    // api的方式复制
    apiCopy: {
        type: Object,
        default: () => ({
            copyApi: '',
            copyParams: {},
            copySuccessText: '复制成功',
            copySuccessDuration: 2000,
            copyErrorText: '复制失败',
            copyErrorDuration: 2000
        })
    },     
});
const { type, content, apiCopy } = toRefs(props);

let copyState = reactive({
    copyLoading: false,
    copyStatus: 'primary',
    copyIcon: 'vxe-icon-copy',
});

onMounted(() => {
    copyState.copyLoading = false;
    copyState.copyStatus = 'primary';
    copyState.copyIcon = 'vxe-icon-copy';
});
// 恢复原始复制状态
const resetCopyStatus = () => {
    copyState.copyStatus = 'primary';
    copyState.copyIcon = 'vxe-icon-copy';
};
const handleCopy = async () => {
    if (type.value === 'password') {
        copyState.copyLoading = true;
        const { copyApi, copyParams, copySuccessText, copySuccessDuration, copyErrorText, copyErrorDuration } = apiCopy.value;
        try {
            const res = await copyApi(copyParams);
            if(VxeUI?.clipboard?.copy(decodePasswd(res))) {
                copyState.copyStatus = 'success';
                copyState.copyIcon = 'vxe-icon-success-circle-fill';
                VxeUI.modal.message({
                    status: 'success',
                    content: copySuccessText || '复制成功',
                    duration: copySuccessDuration || 2000,
                });
                setTimeout(() => {
                    resetCopyStatus();
                }, copySuccessDuration || 300);
            } else {
                VxeUI.modal.message({
                    status: 'error',
                    content: copyErrorText || '复制失败',
                    duration: copyErrorDuration || 2000,
                });
            }
            
        } catch (error) {
            copyState.copyStatus = 'error';
            copyState.copyIcon = 'vxe-icon-error-circle-fill';
            VxeUI.modal.message({
                status: 'error',
                content: error?.response?.data?.msg + `${error?.response?.status}` || error.message || copyErrorText || '复制失败',
                duration: copyErrorDuration || 2000,
            });
            setTimeout(() => {
                resetCopyStatus();
            }, copyErrorDuration || 300);
        } finally {
            copyState.copyLoading = false;  
        }
    } 
};




</script>

<template>
    <vxe-button v-if="type === 'password'"  mode="text" :disabled="copyState.copyLoading" :icon="copyState.copyIcon" :status="copyState.copyStatus" :loading="copyState.copyLoading" @click="handleCopy"></vxe-button>
    <a-typography-paragraph v-if="type === 'text'" :copyable="{ text: content }"  v-bind="$attrs"><slot name="custom_title">{{ content }}</slot></a-typography-paragraph>

</template>
