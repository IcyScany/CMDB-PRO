<script  setup>
/**
 * 组件用于系统所有的弹窗
 * **/
import {toRefs, ref} from "vue";

let props = defineProps({
    modalOptions: {
        type: Object,
        default: () => {
            return {};
        }
    },
    visible: {
        type: Boolean,
        default: false,
    },
});

let  { modalOptions } = toRefs(props);
let cmdbModalRef = ref(null);

let emits = defineEmits(['initModalShow', 'update:visible']);

function handleModalShow() {
    cmdbModalRef.value && cmdbModalRef.value.setPosition(0);
    cmdbModalRef.value.getBox().getElementsByClassName("vxe-modal--content")[0].scrollTo(0, 0);
    emits('initModalShow');
}

// 模态框关闭后的处理
function handleCancel() {
    emits('update:visible', false);
}


</script>

<template>
    <vxe-modal
        ref="cmdbModalRef"
        :model-value="visible"
        v-bind="{...modalOptions}"
        @show="handleModalShow"
        @hide="handleCancel"
        @close="handleCancel"
    >
        <slot name="content"></slot>
        <slot name="footer"></slot>
    </vxe-modal>

</template>



<style scoped>

</style>
