<script setup>
/** 组件用于新增编辑表单的模态框 ***/
import {toRefs} from "vue";

let props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    }
});
let { visible } = toRefs(props);



</script>

<template>
    <vxe-modal
        :model-value="visible"

    >


    </vxe-modal>
</template>



<style scoped>

</style>
