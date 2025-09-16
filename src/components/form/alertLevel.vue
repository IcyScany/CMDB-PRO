<script setup>
import {toRefs, ref} from 'vue';
import { ALERT_LEVEL } from "@/config/globalOption";
import checkbox from '@/components/form/checkbox.vue';

const props = defineProps({
    value: {
        type: Object,
        default() {
            return {};
        },
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    itemProp: {
        type: Object,
        default() {
            return {};
        },
    },
    name: {
        type: String,
        default: '',
    },
    oriTitle: {
        type: Object,
        default() {
            return {};
        }
    },
});
const { value, name, oriTitle, itemProp } = toRefs(props);
const emit = defineEmits(['update:value']);

const contrastOptions = ['>', '<', '>=', '<='];
let subRules = ref({
    'error_number': [{ required: true, message: '此项不能为空' }],
    'contrast': [{ required: true, message: '此项不能为空' }],
    'value': [{ required: true, message: '此项不能为空' }],
});
// 切换是否选中某个告警级别
function toggleCheck(level) {
    let result = JSON.parse(JSON.stringify(value.value));
    if (result && result[level]) {
        delete result[level];
    } else {
        if (!result) { // 防止传入的value是null
            result = {};
        }
        result[level] = {
            error_number: itemProp?.value?.['error_number']?.['default_value'] === 0 || itemProp?.value?.['error_number']?.['default_value'] ? itemProp?.value?.['error_number']?.['default_value'] : null,
            contrast: itemProp?.value?.['contrast']?.['default_value'] ? itemProp?.value?.['contrast']?.['default_value'] : '',
            value: itemProp?.value?.['value']?.['default_value'] ? itemProp?.value?.['value']?.['default_value'] : null,
        };
    }
    emit('update:value', result);
}
</script>

<template>
    <div>
        <div>
            <checkbox v-for="level in ALERT_LEVEL" :key="level" :disabled="disabled" :checked="value && value.hasOwnProperty(level)" @click="toggleCheck(level)">{{ level }}</checkbox>
        </div>
        <div>
            <template v-for="level in ALERT_LEVEL" :key="level">
                <div v-if="value && value.hasOwnProperty(level)" style="margin-top: 10px;">
                    <a-row :gutter="16">
                        <a-col :span="3">{{ level }}</a-col>
                        <a-col :span="7">
                            <a-form-item
                                :name="[name, level, 'error_number']"
                                :rules="subRules['error_number']"
                                :label-col="{span:24}"
                            >
                                <template #label>
                                    异常连续次数
                                    <a-tooltip v-if="(oriTitle.page_data_source && oriTitle.page_data_source.form_tip_text && oriTitle.page_data_source.form_tip_text.error_number) || (oriTitle.data_source && oriTitle.data_source.form_tip_text && oriTitle.data_source.form_tip_text.error_number)">
                                        <template #title>
                                            {{oriTitle.page_data_source.form_tip_text.error_number || oriTitle.data_source.form_tip_text.error_number}}
                                        </template>
                                        <i class="bi bi-question-circle-fill text-orange"></i>
                                    </a-tooltip>
                                </template>
                                <a-input-number v-model:value="value[level].error_number" :disabled="disabled || itemProp?.error_number?.disabled" :min="1" />
                            </a-form-item>
                        </a-col>
                        <a-col :span="7">
                            <a-form-item
                                :name="[name, level, 'contrast']"
                                :rules="subRules['contrast']"
                                :label-col="{span:24}"
                            >
                                <template #label>
                                    对比类型
                                    <a-tooltip v-if="(oriTitle.page_data_source && oriTitle.page_data_source.form_tip_text && oriTitle.page_data_source.form_tip_text.contrast) || (oriTitle.data_source && oriTitle.data_source.form_tip_text && oriTitle.data_source.form_tip_text.contrast)">
                                        <template #title>
                                            {{oriTitle.page_data_source.form_tip_text.contrast || oriTitle.data_source.form_tip_text.contrast}}
                                        </template>
                                        <i class="bi bi-question-circle-fill text-orange"></i>
                                    </a-tooltip>
                                </template>
                                <a-select
                                    v-model:value="value[level].contrast"
                                    :disabled="disabled || itemProp?.contrast?.disabled"
                                >
                                    <a-select-option v-for="item in contrastOptions" :key="item" :value="item">{{ item }}</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                        <a-col :span="7">
                            <a-form-item
                                :name="[name, level, 'value']"
                                :rules="subRules['value']"
                                :label-col="{span:24}"
                            >
                                <template #label>
                                    对比值
                                    <a-tooltip v-if="(oriTitle.page_data_source && oriTitle.page_data_source.form_tip_text && oriTitle.page_data_source.form_tip_text.value) || (oriTitle.data_source && oriTitle.data_source.form_tip_text && oriTitle.data_source.form_tip_text.value)">
                                        <template #title>
                                            {{oriTitle.page_data_source.form_tip_text.value || oriTitle.data_source.form_tip_text.value}}
                                        </template>
                                        <i class="bi bi-question-circle-fill text-orange"></i>
                                    </a-tooltip>
                                </template>
                                <a-input-number v-model:value="value[level].value" :disabled="disabled || itemProp?.value?.disabled" />
                            </a-form-item>
                        </a-col>
                    </a-row>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped lang="less">
.ant-input-number {
    width: 100%;
}
</style>
