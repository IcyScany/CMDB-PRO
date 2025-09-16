<script setup lang="jsx">
/** 该组件用于点击查看所属的用户组的详细信息**/

defineProps({
    content: {
        type: [Number,String],
        default: ''
    },
    virtualId: {
        type: [Number,String],
        default: ''
    },
});
const showNotify = ref(false);
const openNotifyEvent = () => {
    showNotify.value = true;
};

</script>

<template>
    <vxe-modal v-model="showNotify" type="notification" :width="320" position="top-right" :mask="false" :lock-view="false" show-header>
        <template #default>
        <span>
          <vxe-icon name="question-circle-fill" />
          <a href="https://vxeui.com/" target="_blank">自定义一个链接</a>
        </span>
        </template>
    </vxe-modal>
    <vxe-button mode="text" status="primary" :content="String(content)"  @click="openNotifyEvent"></vxe-button>

</template>



<style scoped>

</style>
