<script setup>
const props = defineProps({
    value: {
        type: [Boolean, String, Number],
        default: null
    },
    activeValue: {
        type: [Boolean, String, Number],
        default: true
    },
    transformRule: {
        type: Object,
        default: null
    }
});

const { value, activeValue, transformRule } = toRefs(props);

// 判断状态类名
const tagClass = computed(() => {
    return value.value?.toString() == activeValue.value?.toString() ? 'theme--primary' : 'theme--error';
});

// 计算状态值
const tagValue = computed(() => {
    if(!transformRule.value) {
        return value.value;
    }
    let transformValue = transformRule.value?.[value.value?.toString()] || value.value;
    return transformValue.value;
});
</script>

<template>
    <vxe-tag v-if="tagValue" :class="tagClass" size="small">
        {{ tagValue }}
    </vxe-tag>
</template>
