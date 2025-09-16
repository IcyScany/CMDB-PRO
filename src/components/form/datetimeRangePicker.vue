<script setup>
import {toRefs} from "vue";
import moment from 'moment';
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';

const props = defineProps({
    value: {
        type: Array,
        default() {
            return [];
        },
    },
    defaultSlot: {
        type: Boolean,
        default: false,
    },
    format: {
        type: String,
        default: 'YYYY-MM-DD HH:mm:ss'
    },
    showTime: {
        type: Object,
        default: () => {
            return { format: 'HH:mm:ss' };
        }
    }
});
const { value, defaultSlot, format, showTime} = toRefs(props);
const emit = defineEmits(['update:value', 'change']);
// 通过prop传入的值转成moment对象，才能给<a-range-picker>
function convertToMoment(value) {
    let result = [];
    if (!value.length) {
        return result;
    }
    for (let i in value) {
        result[i] = value[i];
        if (typeof value[i] === 'string') { // 如果是字符串，就转成moment对象
            result[i] = moment(value[i]);
        }
    }
    return result;
}
// 为了页面使用方便，转成字符串再传出去
function convertToStr(value) {
    let result = [];
    if (!value.length) {
        return result;
    }
    for (let i in value) {
        result[i] = value[i].format('YYYY-MM-DD HH:mm:ss');
    }
    return result;
}

const ranges = {
    '今日': [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
    '昨日': [moment('00:00:00', 'HH:mm:ss').subtract(1, 'days'), moment('23:59:59', 'HH:mm:ss').subtract(1, 'days')],
    '最近30秒': [moment().subtract(29, 'seconds'), moment()],
    '最近15分钟': [moment().subtract(14, 'minutes'), moment()],
    '最近30分钟': [moment().subtract(29, 'minutes'), moment()],
    '最近1小时': [moment().subtract(1, 'hours'), moment()],
    '最近7日': [moment().subtract(6, 'days'), moment()],
    '最近30日': [moment().subtract(29, 'days'), moment()],
    '本月': [moment().startOf('month'), moment().endOf('month')],
    '上月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
    '最近1年': [moment().subtract(1, 'years'), moment()],
};

function handleChange(dates) {
    if (!dates.length) { // 为了clear动作，可以emit
        emit('change');
    }
}
function handleOk() {
    emit('change');
}
</script>

<template>
    <a-range-picker
        :locale="locale"
        :value="convertToMoment(value)"
        :show-time="showTime"
        :format="format"
        :placeholder="['开始时间', '结束时间']"
        :ranges="ranges"
        style="width: 400px"
        @update:value="val => emit('update:value', convertToStr(val))"
        @ok="handleOk"
        @change="handleChange"
    >
        <template v-if="defaultSlot" #default>
            <slot></slot>
        </template>
    </a-range-picker>
</template>

<style scoped lang="less">

</style>
