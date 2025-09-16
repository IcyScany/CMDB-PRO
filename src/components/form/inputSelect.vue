<script setup>
import {ref, toRefs} from "vue";

const props = defineProps({
    value: {
        type: [String, Number],
        default: null,
    },
    options: {
        type: Array,
        default() {
            return [];
        },
    },
    placeholder: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    type: { // 输入框类型：input/textarea
        type: String,
        default: 'input',
    },
});
const { value, options, type } = toRefs(props);
const emit = defineEmits(['update:value', 'keyup', 'clear', 'blur']);

let visible = ref(false); // 下拉框是否可见
// focus时，展示下拉框
function focusEvent() {
    visible.value = true;
}
// 输入时，搜索列表
function keyupEvent(e) {
    emit('keyup', e);
}
// 选中列表项
function selectEvent(item) {
    emit('update:value', item.value);
    visible.value = false;
}
// blur事件
function handleBlur(e) {
    emit('blur', e);
}
</script>

<template>
    <vxe-pulldown v-model="visible">
        <template #default>
            <vxe-textarea
                v-if="type === 'textarea'"
                :model-value="value"
                :placeholder="placeholder"
                :disabled="disabled"
                clearable
                style="width: 100%;"
                @update:model-value="val => emit('update:value', val)"
                @focus="focusEvent"
                @keyup="keyupEvent"
                @clear="e => emit('clear', e)"
                @blur="handleBlur"
            ></vxe-textarea>
            <vxe-input
                v-else
                :model-value="value"
                :placeholder="placeholder"
                :disabled="disabled"
                clearable
                style="width: 100%;"
                @update:model-value="val => emit('update:value', val)"
                @focus="focusEvent"
                @keyup="keyupEvent"
                @clear="e => emit('clear', e)"
                @blur="handleBlur"
            ></vxe-input>
        </template>
        <template #dropdown>
            <div class="dropdown-list">
                <template v-for="item in options" :key="item.value">
                    <div
                        v-show="!value || item.label.toLowerCase().indexOf(value.toLowerCase()) > -1"
                        class="ant-select-item"
                        @mousedown="selectEvent(item)"
                    >
                        <span>{{ item.label }}</span>
                    </div>
                </template>
            </div>
        </template>
    </vxe-pulldown>
</template>

<style scoped lang="less">
.dropdown-list {
    min-height: 50px;
    max-height: 200px;
    overflow: auto;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    .ant-select-item {
        &:hover {
            background-color: #f0f5ff;
        }
    }
}
</style>
<style>
/* 在表单中的样式，结合antd的表单校验样式 */
.ant-form-item .vxe-input--inner {
    border-radius: 2px;
}
.ant-form-item-has-error .vxe-input--inner, .ant-form-item-has-error .ant-input-affix-wrapper, .ant-form-item-has-error .vxe-input--inner:hover, .ant-form-item-has-error .ant-input-affix-wrapper:hover {
    background-color: #fff;
    border-color: #ff4d4f;
}
</style>
