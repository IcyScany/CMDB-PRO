<script setup>
import {toRefs} from "vue";

const props = defineProps({
    checked: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    value: {
        type: [String, Number],
        default: null,
    },
});
const { checked, disabled } = toRefs(props);
const emit = defineEmits(['click']);
</script>

<template>
    <label :class="['ant-checkbox-wrapper', checked ? 'ant-checkbox-wrapper-checked' : '']">
        <span :class="['ant-checkbox', checked ? 'ant-checkbox-checked' : '']">
            <input type="checkbox" :disabled="disabled" :checked="checked" :value="value" class="ant-checkbox-input" @click="emit('click')">
            <span class="ant-checkbox-inner"></span>
        </span>
        <span>
            <slot></slot>
        </span>
    </label>
</template>

<style scoped lang="less">

</style>
