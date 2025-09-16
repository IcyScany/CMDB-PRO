<script setup name="commonFormContainer">
import {computed, useSlots} from 'vue';
const slots = useSlots();

defineProps({
    open: {
        type: Boolean,
        default: false,
        required: false
    },
    formStyle: {
        type: String,
        default: 'drawer'
    },
});


const slotKeys = computed(() => {
    return Object.keys(slots);
});

const emit = defineEmits(['close']);
const cancel = () => {
    emit('close');
};
</script>
<script>
// 声明额外的选项
export default {
    inheritAttrs: false
};
</script>

<template>
        <a-modal
            v-if="formStyle === 'modal'"
            :open="open"
            v-bind="$attrs"
            :footer="slotKeys.includes('footer') ? undefined : null"
            @cancel="cancel"
        >
            <template v-for="slotKey in slotKeys" #[slotKey]>
                <slot :name="slotKey" />
            </template>
        </a-modal>
        <a-drawer
            v-else-if="formStyle === 'drawer'"
            :open="open"
            :closable="true"
            width="60%"
            v-bind="$attrs"
            :footer-style="{ textAlign: 'right' }"
            :style="{ position: 'absolute' }"
            placement="right"
            @close="cancel"
        >
            <template v-for="slotKey in slotKeys" #[slotKey]>
                <slot :name="slotKey" />
            </template>
    </a-drawer>
</template>



