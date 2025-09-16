<script setup>
import {computed, inject, useSlots} from "vue";
import {isArray} from "xe-utils";
import systemConfig  from "../../config/index";

import http from "@/utils/axios";

const props = defineProps({
    title: {
        type: Object,
        required: true,
        default: () => ({}),
    },
    value: {
        type: [String, Number, Array, Boolean, Object],
        default: null,
    },
    disabled: {
        type: Boolean,
        default: undefined,
    },
    options: {
        type: [Array, Object],
        default() {
            return null;
        },
    },
    titleData: { // 下拉选项
        type: [Array, Object],
        default() {
            return [];
        },
    },
    customFormLabel: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: ''
    }

});
const { title, value, disabled, options, titleData, placeholder} = toRefs(props);
const slots = useSlots();
const renderSlots = Object.keys(slots);


// 表单的名称
const formName = computed(() => title?.value?.field);
// 表单的标签
const formLabel = computed(() => title?.value?.field_name);
// 表单的标签
const formExplain = computed(() => placeholder.value || title?.value?.field_explain);
// 表单的数据源配置
const formDataSource = computed(() => title?.value?.page_data_source);
// 表单的数据源类型
const formDataSourceType = computed(() => title?.value?.page_data_source?.data_source);
// 表单的类型
const formType = computed(() => title?.value?.page_data_source?.form_type);


const emit = defineEmits(['update:value', 'change', 'blur']);
let currentTitleData = computed(() => titleData.value);
// 通过数据源配置的各种下拉选项目的内容
const configOption = ref(currentTitleData.value);

const generateOptions = computed(() => {    
    if(props.options) { return props.options; }
    
    let options = [];
    let {label, value, icon,info_tip, info_color, data } = formDataSource.value; // 数据源配置的label，value， icon 取的字段
    switch (formDataSourceType.value) {
        case 'url':
            for (let i in configOption.value) {
                if (configOption.value[i][value] || configOption.value[i][label]) { // 如果配置了value
                    // 数据源类型为公共数据的url的时，其value值作为注释，数据源需配置info_tip: 'info_tip' info_color: 颜色类名
                    // 因为<a-checkbox-group>组件label插槽会被options中的label覆盖，所以换成text
                    if (formType.value === 'checkbox') {
                        options.push({text: i, value: isNaN(i) ? i : Number(i), infoTip: configOption.value[i][value], color: info_color || 'text-warning', icon});
                    } else { // 其他普通配置：配置的label作为选项label，key作为值，如果没有key，就用索引
                        options.push({ label: configOption.value?.[i]?.[label] || configOption.value?.[i], value: configOption.value?.[i]?.[value] || (isNaN(i) ? i : Number(i)), icon, infoTip: configOption.value?.[i]?.[info_tip], color: info_color || 'text-warning' });
                    }
                  
                } else { // 没有配置value
                    let type = typeof configOption.value[i];
                    switch (type) {
                        case 'object':
                            if (!isNaN(configOption.value[i][0])) { // 获取应用清单的数据 数据类型格式[[number, string]]
                                options.push({ label: configOption.value[i][1], value: configOption.value[i][1] });
                            } else if (configOption.value[i]['app_level']) { // 获取公共数据的应用级别的数据
                                options.push({ label: `${configOption.value[i]['app_level']}【${configOption.value[i]['level_info']}】`, value: isNaN(i) ? i : Number(i) });
                            } else { // 云主账号选项
                                options.push({ label: configOption.value[i]?.page_display, value: i });
                            }
                            break;
                        case 'string': // 字符串
                            options.push({ label: configOption.value[i], value: i });
                            break;
                    }
                }
            }
            break;
        case 'user_custom': // 用户自定义的，用户会将input变为select的情形
            if(isArray(configOption.value)) {
                for (let item in configOption.value) {
                    let currentData = configOption.value[item];
                    if (isArray(currentData)) {
                        options.push({ label: currentData[0], value: currentData[0], describe: currentData[1],  name: currentData[0], sid: currentData[2]});
                    }
                }
            }
            break;
        case 'data': // 自定义配置
            if (isArray(data)) { // 配置的是数组
                for (let item in data) {
                    options.push(data[item]);
                }
            } else { // 配置的是对象 key: value , value: label
                for (let i in data) {
                    options.push({ value: isNaN(i) ? i : Number(i), label: data[i] });
                }
            }

            break;
    }
    return options;
});

const editType = inject('formType', undefined);
let ifDisable = computed(() => {
    if (disabled.value === undefined) { // 如果没传入disabled，则根据默认逻辑判断
        if (editType && editType.value === systemConfig.FORM_TYPE.ADD_TYPE) { // 新增默认可用
            return false;
        } else if (editType && editType.value === systemConfig.FORM_TYPE.INFO_TYPE) { // 查看详情，默认不可用
            return true;
        } else { // 编辑根据配置的title
            return !title?.value?.edit_change;
        }
    } else { // 如果传入了disabled，则直接用传入的值
        return disabled.value;
    }
});

// 更新自定义的下拉框选项
const updateCustomOption = () => {
    handleRefreashOption(`/public/from-option/list/${title.value.sid}`);
};

let loading = ref(false);

const handleRefreashOption = (url, item_data_source= {}) => {
    let { received_key } = item_data_source;
    loading.value = true;
    http.get(url)
        .then(res => {
            loading.value = false;
            if (received_key) {
                configOption.value = res[received_key];
            } else {
                configOption.value = res;
            }
        });
};

// 切换为自定义选项
let currentChangeItem = ref(null);
const handleChangeSelect = (curr_field) => {
    currentChangeItem.value = curr_field;
};


const updateValue = (val) => {
    emit('update:value', val);
};

defineOptions({
    inheritAttrs: false
});
</script>


<template>
    <a-row type="flex">
        <a-col flex="80%">
            <a-form-item
                :name="formName"
                :label="customFormLabel ? customFormLabel : formDataSource?.form_label ? formDataSource?.form_label : formLabel"
                v-bind="$attrs"
                :colon="false"
                :label-col=" { xs: {span: 8}, sm: {span: 4}, md: {span: 3}, lg: {span: 4} }"
                label-align="left"
            >
                <template #tooltip>
                    <a-tooltip v-if="formDataSource?.tooltip_text"  :title="formDataSource?.tooltip_text">&nbsp;&nbsp;&nbsp;&nbsp;<QuestionCircleOutlined class="ml-2"/></a-tooltip>
                </template>
                <template v-if="formDataSource?.default_extra_tip || formDataSource?.tooltip_level" #extra>
                    <span v-if="formDataSource?.default_extra_tip" v-html="formDataSource?.default_extra_tip"></span>

                    <!-- 警告提示 -->
                    <a-alert
                        v-if="formDataSource?.tooltip_level"
                        :type="formDataSource?.tooltip_level?.type"
                        show-icon
                        class="alert-message"
                    >
                        <template #icon>
                            <vxe-icon name="warning-triangle-fill"  class-name="alert-message-icon"></vxe-icon>
                        </template>
                        <template v-if="formDataSource?.tooltip_level?.message" #message>
                            <span v-html="formDataSource?.tooltip_level?.message"></span>
                        </template>
                        <template v-if="formDataSource?.tooltip_level?.description" #description>
                            <span v-html="formDataSource?.tooltip_level?.description"></span>
                        </template>
                    </a-alert>

                </template>
                <slot>
                    <template v-if="formDataSource">
                        <template v-if="formDataSourceType">
                            <template v-if="['url', 'data'].indexOf(formDataSourceType) > -1" >
                                <a-checkbox-group
                                    v-if="formType === 'checkbox'"
                                    :value="value"
                                    :disabled="ifDisable"
                                    :options="generateOptions"
                                    :name="formName"
                                    @update:value="val => emit('update:value', val)"
                                >
                                    <template #label="{text, infoTip, color}">
                                        {{ text }}
                                        <span v-if="infoTip" :class="color">{{ infoTip }}</span>
                                    </template>
                                </a-checkbox-group>
                                <a-switch
                                    v-else-if="formType === 'boole'"
                                    :checked="value"
                                    :disabled="ifDisable"
                                    :checked-value="formDataSource?.checked ? formDataSource.checked : 1"
                                    :un-checked-value="formDataSource?.unchecked === false || formDataSource?.unchecked ? formDataSource?.unchecked : 0"
                                    :checked-children="(formDataSource && formDataSource?.checkedChildren) || '打开'"
                                    :un-checked-children="(formDataSource && formDataSource?.unCheckedChildren) || '关闭'"
                                    @update:checked="val => emit('update:value', val)"
                                    @change="(e) => emit('change', e)"
                                />
                                <a-radio-group
                                    v-else-if="formType === 'radio'"
                                    :value="value"
                                    :disabled="ifDisable"
                                    :name="formName"
                                    @update:value="val => emit('update:value', val)"
                                    @change="(e) => emit('change', e)"
                                >
                                    <a-radio v-for="o in generateOptions" :key="o.value" :value="o.value">
                                        {{ o.label }}
                                        <span v-if="o.infoTip" :class="o.color">{{ o.infoTip }}</span>
                                    </a-radio>
                                </a-radio-group>
                                <ops-device-zone 
                                     v-else-if="formType === 'device_zone'"
                                     :options="generateOptions"
                                     :name="formName"
                                     :value="value"
                                     :disabled="ifDisable"
                                    @update:value="val => emit('update:value', val)"
                                 />
                                
                                
                                <template v-else>
                                    <a-input-group v-if="formDataSourceType === 'url' && title.page_data_source.url" compact>
                                        <ops-a-select
                                            :value="value"
                                            :disabled="ifDisable"
                                            :placeholder="formExplain"
                                            :options="generateOptions"
                                            :mode="formDataSource.multiple"
                                            style="width: calc(100% - 50px)"
                                            @update:value="val => emit('update:value', val)"
                                            @change="(val, option) => emit('change', val, option)"
                                        >
                                           <template #option="{label, infoTip, color}">
                                                {{ label }}
                                                <span v-if="infoTip" :class="color">{{ infoTip }}</span>
                                           </template>
                                            
                                            <template #notFoundContent>
                                                <a-empty>
                                                    <template #description>
                                                        {{formDataSource?.not_found_content ? formDataSource.not_found_content : 'No Data'}}
                                                    </template>
                                                </a-empty>
                                            </template>
                                        </ops-a-select>
                                        <a-button :loading="loading" class="vxe-table-icon-repeat" @click="handleRefreashOption(title.page_data_source.url, title.page_data_source)"></a-button>
                                    </a-input-group>
                                    <ops-a-select
                                        v-else
                                        :value="value"
                                        :disabled="ifDisable"
                                        :placeholder="formExplain"
                                        :options="generateOptions"
                                        :mode="formDataSource.multiple"
                                        option-label-prop="label"
                                        @update:value="val => emit('update:value', val)"
                                        @change="(val, option) => emit('change', val, option)"
                                    >
                                        <template #option="{label: optionLabel, tip_text, tip_color}">
                                            {{ optionLabel }}
                                            <span v-if="tip_text" :class="tip_color">【{{ tip_text }}】</span>
                                        </template>
                                        <template #notFoundContent>
                                            <a-empty>
                                                <template #description>
                                                    {{formDataSource?.not_found_content ? formDataSource.not_found_content : 'No Data'}}
                                                </template>
                                            </a-empty>
                                        </template>
                                    </ops-a-select>
                                </template>

                            </template>
                            <template v-if="['user_custom'].indexOf(formDataSourceType) > -1">
                                <template v-if="generateOptions.length || currentChangeItem === formName">
                                    <a-input-group compact>
                                        <ops-custom-option
                                            :title="title"
                                            :value="value"
                                            :disabled="ifDisable"
                                            :placeholder="formExplain"
                                            :options="generateOptions"
                                            :mode="formDataSource.multiple"
                                            @update:value="val => emit('update:value', val)"
                                            @change="(val, option) => emit('change', val, option)"
                                            @update-custom-option="updateCustomOption"
                                        />
                                        <a-button  class="vxe-table-icon-repeat" @click="handleRefreashOption(`/public/from-option/list/${title.sid}`)"></a-button>
                                    </a-input-group>
                                </template>
                                <template v-else>
                                    <a-input
                                        :value="value"
                                        :disabled="ifDisable"
                                        :placeholder="formExplain"
                                        @update:value="val => emit('update:value', val)"
                                    />
                                </template>
                            </template>
                        </template>
                        <template v-else>
                            <a-textarea
                                v-if="formType === 'textarea' || formType === 'json' || formType === 'two_dimensional_array'"
                                :value="value"
                                :disabled="ifDisable"
                                :placeholder="formExplain"
                                :auto-size="false"
                                @update:value="val => emit('update:value', val)"
                                @blur="(e) => emit('blur', e)"
                                @change="(e) => emit('change', e)"
                            />
                            <a-input-password
                                v-else-if="formType === 'password'"
                                :value="value"
                                :disabled="ifDisable"
                                :placeholder="formExplain"
                                autocomplete="current-password"
                                @update:value="val => emit('update:value', val)"
                                @blur="(e) => emit('blur', e)"

                            />
                            <a-input-number
                                v-else-if="formType === 'number'"
                                :value="value"
                                :disabled="ifDisable"
                                :placeholder="formExplain"
                                :min="formDataSource.minNum"
                                :max="formDataSource.maxNum"
                                :step="formDataSource.numStep"
                                style="width: 100%"
                                @update:value="val => emit('update:value', val)"
                                @blur="(e) => emit('blur', e)"
                            />
                            <a-checkbox-group
                                v-else-if="formType === 'checkbox'"
                                :value="value"
                                :disabled="ifDisable"
                                :options="options"
                                :name="formName"
                                @update:value="val => emit('update:value', val)"
                            >
                            </a-checkbox-group>
                            <a-switch
                               v-else-if="formType === 'boole'"
                                    :checked="value"
                                    :disabled="ifDisable"
                                    :checked-value="formDataSource?.checked ? formDataSource.checked : 1"
                                    :un-checked-value="formDataSource?.unchecked === false || formDataSource?.unchecked ? formDataSource?.unchecked : 0"
                                    :checked-children="(formDataSource && formDataSource?.checkedChildren) || 'ON'"
                                    :un-checked-children="(formDataSource && formDataSource?.unCheckedChildren) || 'OFF'"
                                    @update:checked="updateValue"
                                    @change="(e) => emit('change', e)"
                                />
                            <a-input
                                v-else-if="formType === 'color'"
                                :value="value"
                                :disabled="ifDisable"
                                :placeholder="formExplain"
                                type="color"
                                @update:value="val => emit('update:value', val)"
                            />
                            <a-select
                                v-else-if="formType === 'select'"
                                :value="value"
                                :disabled="ifDisable"
                                :placeholder="formExplain"
                                :options="options"
                                @update:value="val => emit('update:value', val)"
                            />
                            <ops-input-select
                                v-else-if="formType === 'input_select'"
                                :value="value"
                                :mode="formDataSource.multiple"
                                :placeholder="formExplain"
                                :options="options"
                                allow-clear
                                show-search
                                @update:value="val => emit('update:value', val)"
                            />
                          
                            <a-input
                                v-else
                                :value="value"
                                :disabled="ifDisable"
                                :placeholder="formExplain"
                                @update:value="val => emit('update:value', val)"
                                @blur="(e) => emit('blur', e)"
                            />
                        </template>
                    </template>

                    <a-input
                        v-else
                        :value="value"
                        :disabled="ifDisable"
                        :placeholder="formExplain"
                        @update:value="val => emit('update:value', val)"
                        @blur="(e) => emit('blur', e)"
                        @change="(e) => emit('change', e)"
                    />

                </slot>

                <template v-for="item in renderSlots" #[item]="scope" >
                    <slot
                        :name="item"
                        :scope="scope"
                        v-bind="scope || {}"
                    />
                </template>
            </a-form-item>
        </a-col>
        <a-col flex="20%">
            <a-tooltip v-if="formDataSource?.input_tooltip_text"  :title="formDataSource?.input_tooltip_text">&nbsp;&nbsp;&nbsp;&nbsp;
                <template #title>
                    <div v-html="formDataSource.input_tooltip_text"></div>
                </template>
                <QuestionCircleOutlined class="ml-2"/>
            </a-tooltip>
            <span v-if="formDataSource && formDataSourceType === 'user_custom' && generateOptions.length === 0" class="text-primary cursor-pointer" @click="handleChangeSelect(formName)"> &nbsp;&nbsp;切为select</span>
        </a-col>
    </a-row>
</template>

<style scoped lang="less">
.alert-message {
    padding: 4px 16px;
    margin-top: 2px;
    width: fit-content;  // 宽度自适应内容
    min-width: 200px;    // 最小宽度
    max-width: 100%;     // 最大不超过容器
    color:#616266;
    border: none;
    
    :deep(.ant-alert-message),
    :deep(.ant-alert-description) {
        white-space: pre-wrap; // 允许文本换行
        word-break: break-word; // 长单词换行
    }
    .alert-message-icon {
        font-size: 20px;
        line-height: 1;
    }
}

:deep(.ant-form-item .ant-form-item-label >label) {
    flex-wrap: wrap !important;
    height: auto !important;
    margin-right: 10px !important;
}

:deep(.ant-form-item .ant-form-item-label) {
    margin-right: 10px  !important;
    white-space: pre-wrap   !important;
}



</style>
