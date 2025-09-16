<script setup>
import {VxeUI } from "vxe-pc-ui";

const props = defineProps({
    initValue: {
        type: String,
        default: '',
    },
    value: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    name: {
        type: String,
        default: '',
    },
    options: {
        type: [Array, Object],
        default() {
            return [];
        },
    }
});

const {initValue, options, name, value} = toRefs(props);
const emit = defineEmits(['update:value']);

// 使用响应式对象存储各个部分的值
const formData = reactive({
    location: '',
    floor: '',
    layer: '',
    ulayer: ''
});

// 重置表单数据
const resetFormData = () => {
    formData.location = '';
    formData.floor = '';
    formData.layer = '';
    formData.ulayer = '';
};

// 解析初始值
const parseInitValue = (value) => {
    if (!value) {
        resetFormData();
        return;
    }
    const parts = value.split('-');
    formData.location = parts[0] || '';
    formData.floor = parts[1] ? parts[1].replace('F', '') : '';
    formData.layer = parts[2] || '';
    formData.ulayer = parts[3] ? parts[3].replace('U', '') : '';
};

// 监听初始值变化
watch(initValue, (newVal) => {
    parseInitValue(newVal);
}, { immediate: true });

// 监听value变化
watch(value, (newVal) => {
    parseInitValue(newVal);
});

// 格式化输出值
const formatOutput = () => {
    const parts = [];
    if (formData.location) {
        parts.push(formData.location);
        if (formData.floor) {
            parts.push(`${formData.floor}F`);
        }
        if (formData.layer) {
            parts.push(formData.layer);
        }
        if (formData.ulayer) {
            parts.push(`${formData.ulayer}U`);
        }
    }
    return parts.join('-');
};

// 更新值
const handleUpdate = () => {
    const result = formatOutput();
    emit('update:value', result);
};

// 处理选择框清空
const handleLocationClear = () => {
    resetFormData();
    handleUpdate();
};

// 复制功能
const handleCopy = () => {
    const text = formatOutput();
    if (text) {
        VxeUI.clipboard.copy(text);
        VxeUI.modal.message({
            status: 'success',
            content: '复制成功',
            duration: 2000
        });
    }
};
</script>
<template>
    <a-form-item-rest>
        <a-input-group compact>
            <a-select
                v-model:value="formData.location"
                :options="options"
                :allow-clear="true"
                :show-search="true"
                :name="name"
                option-filter-prop="label"
                :style="{ width: formatOutput() ? '40%' : '45%', borderLeft: 0 }"
                @change="handleUpdate"
                @clear="handleLocationClear"
            >
            </a-select>
            <a-input
                style="width: 5%; border-left: 0; pointer-events: none;"
                placeholder="-"
                disabled
            />
            <a-input-number
                v-model:value="formData.floor"
                :style="{ width: formatOutput() ? '10%' : '12%', borderLeft: 0 }"
                :name="name"
                :min="1"
                :max="99"
                @change="handleUpdate"
            />
            <a-input
                style="width: 6%; border-left: 0; pointer-events: none;"
                placeholder="F-"
                disabled
            />

            <a-input
                v-model:value="formData.layer"
                :style="{ width: formatOutput() ? '15%' : '18%', borderLeft: 0, backgroundColor: '#fff' }"
                :name="name"
                @change="handleUpdate"
            />
            <a-input
                style="width: 5%; border-left: 0;"
                placeholder="-"
                disabled
            />

            <a-input-number
                v-model:value="formData.ulayer"
                :style="{ width: formatOutput() ? '10%' : '12%', borderLeft: 0 }"
                :min="1"
                :max="99"
                @change="handleUpdate"
            />
            <a-input
                style="width: 6%; border-left: 0; pointer-events: none;"
                placeholder="U"
                disabled
            />
            <a-tooltip v-if="formatOutput()" title="点击复制" color="cyan" style="width: 1%" >
               <vxe-button icon="vxe-icon-copy" status="primary"  mode="text" @click="handleCopy" />
            </a-tooltip>
        </a-input-group>
    </a-form-item-rest>
</template>

<style scoped lang="less">
.ant-input-group {
    display: flex;
    align-items: center;
    
    :deep(.ant-input-number) {
        width: 100%;
    }
    &.ant-input-group-compact{
        display: flex !important;
        flex-wrap:nowrap !important;
    }
    
    :deep(.ant-input-number-input) {
        text-align: center;
    }
}
</style>
