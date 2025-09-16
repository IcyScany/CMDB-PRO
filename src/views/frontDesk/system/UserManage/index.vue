<script setup>
import GroupList from './GroupList.vue';

const userGroupRef = ref(null);




onMounted(async () => {
    await nextTick(async () => {
        userGroupRef.value && userGroupRef.value?.initUserGroupPage();
    });
});




</script>
<template>
    <group-list ref="userGroupRef" class="pt-[24px]" />
</template>

<style scoped lang="less">
:deep(.ant-tabs-content) {
    height: 100%;
}
</style>
