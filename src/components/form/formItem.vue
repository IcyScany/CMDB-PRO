<script setup>
import {computed, toRefs, inject} from 'vue';
import { ADD_TYPE, INFO_TYPE } from "@/config/globalOption";
import alertLevel from './alertLevel.vue';
import deviceZone  from './deviceZone.vue'; // 位置组件： 网络硬件清单新增编辑位置使用到
import inputSelect from '@/components/form/inputSelect.vue';
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import moment from 'moment';

const props = defineProps({
    title: {
        type: Object,
        required: true,
    },
    initValue: { // 初始值（接口返回的edit_data的字段值），某些表单项会用到
        type: String,
        default: '',
    },
    value: {
        type: [String, Number, Array, Boolean, Object],
        default: null,
    },
    options: {
        type: [Array, Object],
        default() {
            return [];
        },
    },
    disabled: {
        type: Boolean,
        default: undefined,
    },
    wrapperCol: {
        type: Object,
        default: undefined,
    },
    popupContainer: {
        type: Object,
        default: null,
    },
    fromTable: { // 是否表格表单里使用本组件
        type: Boolean,
        default: false,
    },
});
const { title, initValue, value, options, disabled, popupContainer} = toRefs(props);
const emit = defineEmits(['update:value', 'change', 'blur']);

const editType = inject('editType', undefined);

let field = computed(() => {
    return title.value.field;
});
let fieldName = computed(() => {
    return title.value.field_name;
});
/* let ifRequired = computed(() => {
    return title.value.edit_required;
}); */
let ifDisable = computed(() => {
    if (disabled.value === undefined) { // 如果没传入disabled，则根据默认逻辑判断
        if (editType && editType.value === ADD_TYPE) { // 新增默认可用
            return false;
        } else if (editType && editType.value === INFO_TYPE) { // 查看详情，默认不可用
            return true;
        } else { // 编辑根据配置的title
            return !title.value.edit_change;
        }
    } else { // 如果传入了disabled，则直接用传入的值
        return disabled.value;
    }
});
let dataSource = computed(() => {
    return title.value.page_data_source || title.value.data_source;
});
let itemDataSource = computed(() => {
    return dataSource.value && dataSource.value.data_source;
});
let formType = computed(() => {
    if (dataSource.value && Object.prototype.hasOwnProperty.call(dataSource.value, 'form_type') && dataSource.value.form_type) {
        return dataSource.value.form_type;
    } else {
        return '';
    }
});
let tip = computed(() => {
    return title.value.field_explain || '';
});
let tooltip = computed(() => {
    return (dataSource?.value && dataSource?.value?.tooltip_text) || '';
});

let switchCheckedVal = computed(() => {
    if (dataSource.value && ('checked' in dataSource.value)) {
        return dataSource.value.checked;
    } else  {
        return  1;
    }
});

let switchUnCheckedVal = computed(() => {
    if (dataSource.value && ('unchecked' in dataSource.value)) {
        return dataSource.value.unchecked;
    } else  {
        return  0;
    }
});

let title_data = inject('title_data');
// 从公共数据转成options（如果value是数字，就默认转成数字类型。比如值是'1' '2'转成1 2）
let generateOptions = computed(() => {
    let options = [];
    // if (Object.prototype.hasOwnProperty.call(title_data.value, field.value)) {
    let datas = title_data.value[field.value];
    switch (itemDataSource.value) {
        case 'url':
        case 'method':
            for (let i in datas) {
                if (datas[i][dataSource.value.value]) { // 如果配置了value
                    // 数据源类型为公共数据的url的时，其value值作为注释，数据源需配置info_tip: true info_color: 颜色类名
                    if (dataSource.value.info_tip) {
                        // 因为<a-checkbox-group>组件label插槽会被options中的label覆盖，所以换成text
                        if (formType.value === 'checkbox') {
                            options.push({text: i, value: isNaN(i) ? i : Number(i), infoTip: datas[i][dataSource.value.value], color: dataSource.value.info_color});
                        } else {
                            options.push({label: i, value: isNaN(i) ? i : Number(i), infoTip: datas[i][dataSource.value.value], color: dataSource.value.info_color});
                        }
                    } else { // 其他普通配置：配置的value作为选项label，key作为值，如果没有key，就用索引
                        options.push({ label: datas[i][dataSource.value.value], value: datas[i][dataSource.value.key] || (isNaN(i) ? i : Number(i)) });
                    }
                } else { // 没有配置value
                    let type = typeof datas[i];
                    switch (type) {
                        case 'object':
                            if (!isNaN(datas[i][0])) { // 获取应用清单的数据 数据类型格式[[number, string]]
                                options.push({ label: datas[i][1], value: datas[i][1] });
                            } else { // 获取公共数据的应用级别的数据
                                options.push({ label: `${datas[i]['app_level']}【${datas[i]['level_info']}】`, value: isNaN(i) ? i : Number(i) });
                            }
                            break;
                        case 'string': // datas是简单的一维数组
                            options.push({ label: datas[i], value: datas[i] });
                            break;
                    }
                }
            }
            break;
        case 'data':
            for (let i in dataSource.value.data) {
                options.push({ label: dataSource.value.data[i], value: isNaN(i) ? i : Number(i) });
            }
            break;
        case 'app_url':
            for (let i in datas) {
                options.push({ label: i, value: isNaN(i) ? i : Number(i) });
            }
            break;
    }
    // }
    return options;
});
// 日期选择器的showTime配置项
let generateShowTime = computed(() => {
    if (dataSource.value.showTime) {
        if (dataSource.value.showTime.defaultValue) { // defaultValue字段要转成moment对象
            return Object.assign(dataSource.value.showTime, {defaultValue: moment(dataSource.value.showTime.defaultValue, 'HH:mm:ss')});
        } else {
            return dataSource.value.showTime;
        }
    }
    return false;
});

/** 搜索的时候输入框有前后空格的过滤 --Start**/
const fliterData = (inputVal, option) => {
    return option.label ? option.label.toLowerCase().indexOf(inputVal.trim().toLowerCase()) >= 0 : true;
};
/** 搜索的时候输入框有前后空格的过滤 --END**/

</script>

<template>
    <a-form-item :label="dataSource && dataSource.col_merg ? dataSource.col_merg : fieldName" :name="field" :wrapper-col="wrapperCol" >
        <template #label>
            <slot name="label">
                <a-tooltip v-if="!fromTable && dataSource && dataSource?.form_tip_text">
                    <template #title>
                        {{dataSource?.form_tip_text}}
                    </template>
                    <i class="bi bi-question-circle-fill text-orange"></i>
                </a-tooltip>
            </slot>
        </template>
        <template v-if="dataSource && dataSource.form_tip"  #extra>
            <slot name="extra"><span class="text-orange">{{dataSource.form_tip}}</span></slot>
        </template>

        <a-tooltip :title="tooltip">
            <slot>
                <template v-if="dataSource">
                    <template v-if="itemDataSource">
                        <template v-if="['url', 'data',  'app_url', 'method'].indexOf(itemDataSource) > -1" >
                            <a-checkbox-group
                                v-if="formType === 'checkbox'"
                                :value="value"
                                :disabled="ifDisable"
                                :options="generateOptions"
                                :name="fieldName"
                                @update:value="val => emit('update:value', val)"
                            >
                                <template #label="{text, infoTip, color}">
                                    {{ text }}
                                    <span v-if="infoTip" :class="color">{{ infoTip }}</span>
                                </template>
                            </a-checkbox-group>
                            <a-radio-group
                                v-else-if="formType === 'radio'"
                                :value="value"
                                :disabled="ifDisable"
                                :name="fieldName"
                                @update:value="val => emit('update:value', val)"
                                @change="(e) => emit('change', e)"
                            >
                                <a-radio v-for="o in generateOptions" :key="o.value" :value="o.value">
                                    {{ o.label }}
                                    <span v-if="o.infoTip" :class="o.color">{{ o.infoTip }}</span>
                                </a-radio>
                            </a-radio-group>
                            <input-select
                                v-else-if="formType === 'input_select'"
                                :value="value"
                                :disabled="ifDisable"
                                :placeholder="tip"
                                :options="generateOptions"
                                :type="dataSource.input_type"
                                @update:value="val => emit('update:value', val)"
                            />
                            <device-zone
                                v-else-if="formType === 'device_zone'"
                                :name="fieldName"
                                :init-value="initValue"
                                :value="value"
                                :options="generateOptions"
                                @update:value="val => emit('update:value', val)
                            "></device-zone>
                            <a-select
                                v-else
                                :value="value"
                                :disabled="ifDisable"
                                :placeholder="tip"
                                :options="generateOptions"
                                :mode="dataSource.multiple"
                                :token-separators="[',', '，', ' ']"
                                :allow-clear="true"
                                :show-search="true"
                                :get-popup-container="(triggerNode) => popupContainer ? popupContainer : triggerNode.parentNode"
                                option-filter-prop="label"
                                @update:value="val => emit('update:value', val)"
                                @change="(val, option) => emit('change', val, option)"
                            >

                                <template #option="{label: optionLabel, infoTip, color}">
                                    {{ optionLabel }}
                                    <span v-if="infoTip" :class="color">{{ infoTip }}</span>
                                </template>
                            </a-select>
                        </template>
                        <a-input
                            v-else
                            :value="value"
                            :disabled="ifDisable"
                            :placeholder="tip"
                            @update:value="val => emit('update:value', val)"
                        />
                    </template>
                    <template v-else>
                        <a-textarea
                            v-if="formType === 'textarea' || formType === 'json' || formType === 'two_dimensional_array'"
                            :value="value"
                            :disabled="ifDisable"
                            :placeholder="tip"
                            :auto-size="false"
                            @update:value="val => emit('update:value', val)"
                        />
                        <a-input-password
                            v-else-if="formType === 'password'"
                            :value="value"
                            :disabled="ifDisable"
                            :placeholder="tip"
                            @update:value="val => emit('update:value', val)"
                            @blur="(e) => emit('blur', e)"

                        />
                        <a-input-number
                            v-else-if="formType === 'number'"
                            :value="value"
                            :disabled="ifDisable"
                            :placeholder="tip"
                            :min="dataSource.minNum"
                            :max="dataSource.maxNum"
                            :step="dataSource.numStep"
                            style="width: 100%"
                            @update:value="val => emit('update:value', val)"
                            @blur="(e) => emit('blur', e)"
                        />
                        <a-checkbox-group
                            v-else-if="formType === 'checkbox'"
                            :value="value"
                            :disabled="ifDisable"
                            :options="options"
                            :name="fieldName"
                            @update:value="val => emit('update:value', val)"
                        >
                        </a-checkbox-group>
                        <a-radio-group
                            v-else-if="formType === 'radio'"
                            :value="value"
                            :disabled="ifDisable"
                            :options="options"
                            :name="fieldName"
                            @update:value="val => emit('update:value', val)"
                        >
                        </a-radio-group>
                        <a-select
                            v-else-if="formType === 'select'"
                            v-bind="{disabled: ifDisable, placeholder: tip, options, mode: dataSource.multiple}"
                            :value="value"
                            :disabled="ifDisable"
                            :placeholder="tip"
                            :options="options"
                            :mode="dataSource.multiple"
                            :token-separators="[',', '，', ' ']"
                            :allow-clear="true"
                            :show-search="true"
                            option-filter-prop="label"
                            :filter-option="fliterData"
                            @update:value="val => emit('update:value', val)"
                            @change="(val, option) => emit('change', val, option)"
                        >
                            <template #notFoundContent>
                                <a-empty>
                                    <template #description>
                                        {{dataSource?.not_found_content ? dataSource.not_found_content : 'No Data'}}
                                    </template>
                                </a-empty>
                            </template>
                        </a-select>
                        <input-select
                            v-else-if="formType === 'input_select'"
                            :value="value"
                            :disabled="ifDisable"
                            :placeholder="tip"
                            :options="options"
                            :type="dataSource.input_type"
                            style="width: 100%;"
                            @update:value="val => emit('update:value', val)"
                        />
                        <a-select
                            v-else-if="formType === 'input_tag'"
                            :value="value"
                            :disabled="ifDisable"
                            :placeholder="tip"
                            :open="false"
                            :token-separators="[',', '，', ' ']"
                            mode="tags"
                            @update:value="val => emit('update:value', val)"
                        ></a-select>
                        <a-switch
                            v-else-if="formType === 'boole'"
                            :checked="value"
                            :disabled="ifDisable"
                            :checked-value="switchCheckedVal"
                            :un-checked-value="switchUnCheckedVal"
                            checked-children="ON"
                            un-checked-children="OFF"
                            @update:checked="val => emit('update:value', val)"
                            @change="(e) => emit('change', e)"
                        />
                        <a-date-picker
                            v-else-if="formType === 'date'"
                            :value="value ? moment(value) : ''"
                            :disabled="ifDisable"
                            :show-time="generateShowTime"
                            :placeholder="tip"
                            :locale="locale"
                            :format="dataSource.date_format || 'YYYY-MM-DD HH:mm:ss'"
                            style="width: 100%"
                            @update:value="val => emit('update:value', val ? val.format(dataSource.date_format || 'YYYY-MM-DD HH:mm:ss') : null)"
                        />
                        <alertLevel
                            v-else-if="formType === 'alert_level'"
                            :value="value"
                            :disabled="ifDisable"
                            :name="field"
                            :ori-title="title"
                            :item-prop="dataSource.alert_item_prop ? dataSource.alert_item_prop : null"
                            @update:value="val => emit('update:value', val)"
                        />
                        <a-input
                          v-else-if="formType === 'color'"
                          :value="value"
                          :disabled="ifDisable"
                          :placeholder="tip"
                          type="color"
                          @update:value="val => emit('update:value', val)"
                        />
                        <a-input
                            v-else
                            :value="value"
                            :disabled="ifDisable"
                            :placeholder="tip"
                            @update:value="val => emit('update:value', val)"
                        />

                    </template>
                </template>

                <a-input
                    v-else
                    :value="value"
                    :disabled="ifDisable"
                    :placeholder="tip"
                    @update:value="val => emit('update:value', val)"
                    @blur="(e) => emit('blur', e)"
                />
            </slot>
        </a-tooltip>
    </a-form-item>
</template>

<style scoped lang="less">

</style>
