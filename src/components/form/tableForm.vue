<script setup>
import {toRefs, watch, ref} from "vue";
import FormItem from "@/components/form/formItem.vue";

const props = defineProps({
    formState: { // 表单值对象
        type: Array,
        default() {
            return [];
        },
    },
    initFormState: { // 每行表单初始值
        type: Object,
        required: true,
    },
    tableFormRules: { // 每行表单rules
        type: Object,
        default() {
            return {};
        },
    },
    tableFormColumns: { // 表格列配置
        type: Array,
        default() {
            return [];
        },
    },
    cusSlots: { // 表格列特殊处理的slot
        type: Array,
        default() {
            return [];
        },
    },
    minLine: { // 最少条数，默认可以0条
        type: Number,
        default: 0,
    },
    maxLine: { // 最大条数，默认无限制
        type: Number,
        default: null,
    },
    formNamePrefix: { // 表单名前缀（如果表格是表单中的一个字段）
        type: String,
        default: null,
    },
    rowAdd: { // 行内添加行
        type: Boolean,
        default: true,
    },
    footerAdd: { // 底部添加行的方式
        type: Boolean,
        default: false,
    },
    showToolbarAddbtn: { // 是否显示表格上方的添加按钮
        type: Boolean,
        default: true,
    },
});
const { formState, initFormState, tableFormColumns, cusSlots, minLine, maxLine ,rowAdd, footerAdd} = toRefs(props);
const emit = defineEmits(['update:formState']);

// 因为vxe会给每行数据加_X_ROW_KEY，所以加这个变量，否则会污染formState。但是该变量不能用来处理其他逻辑，他深层的值不一定是及时watch更新的
let gridData = ref([]); // 传给表格的data
watch(
    () => formState.value,
    () => {
        gridData.value = JSON.parse(JSON.stringify(formState.value));
    }
);

// 减少表单行
const removeLine = (index) => {
    if (formState.value.length > minLine.value) { // 未低于最小条数
        let tmp = JSON.parse(JSON.stringify(formState.value));
        tmp.splice(index, 1);
        emit('update:formState', tmp);
    }
};
// 增加表单行
const addLine = () => {
    if (!maxLine.value || formState.value.length < maxLine.value) { // 未限制最大条数，或未超过最大条数限制
        let tmp = JSON.parse(JSON.stringify(formState.value));
        tmp.push({...initFormState.value});
        emit('update:formState', tmp);
    }
};




</script>

<template>
        <vxe-grid border :data="gridData" :columns="tableFormColumns" :toolbar-config="(gridData.length || !showToolbarAddbtn || footerAdd) ? null : {slots: {buttons: 'toolbar_buttons'}}" class="table-form">
        <template #toolbar_buttons>
            <a-button ghost type="primary" size="small" @click="addLine">
                <i class="bi bi-plus-lg"></i>
            </a-button>
        </template>
        <template #operation="{rowIndex}">
            <a-button v-if="rowAdd"  ghost type="primary" size="small" @click="addLine">
                <i class="bi bi-plus-lg"></i>
            </a-button>
            <a-button ghost type="primary" size="small" @click="removeLine(rowIndex)">
                <i class="bi bi-dash-lg"></i>
            </a-button>
            <slot :row="formState[rowIndex]" name="operateSlot" ></slot>
        </template>
        <template #header="{column, columnIndex}">
            <span v-if="tableFormColumns[columnIndex].oriTitle.edit_required" class="text-error">*</span>
            {{ column.title }} <slot :name="`${column.field}_header`" :column="column" :column-index="columnIndex"></slot>
            <a-tooltip v-if="(tableFormColumns[columnIndex].oriTitle.page_data_source && tableFormColumns[columnIndex].oriTitle.page_data_source.form_tip_text) || (tableFormColumns[columnIndex].oriTitle.data_source && tableFormColumns[columnIndex].oriTitle.data_source.form_tip_text)">
                <template #title>
                    {{tableFormColumns[columnIndex].oriTitle.page_data_source.form_tip_text || tableFormColumns[columnIndex].oriTitle.data_source.form_tip_text}}
                </template>
                <i class="bi bi-question-circle-fill text-orange"></i>
            </a-tooltip>
        </template>
        <template #field="{rowIndex, column, columnIndex}">
            <form-item
                v-model:value="formState[rowIndex][column.field]"
                :title="tableFormColumns[columnIndex].oriTitle"
                :rules="tableFormRules[column.field]"
                :label="null"
                :name="formNamePrefix ? [formNamePrefix, rowIndex, column.field] : [rowIndex, column.field]"
                :from-table="true"
            />
        </template>
        <template v-for="c in cusSlots" #[c]="{rowIndex, column, columnIndex}">
            <slot :name="c" :row-index="rowIndex" :column="column" :column-index="columnIndex"></slot>
        </template>
    </vxe-grid>
    <slot name="footerAddLine">
        <a-button v-if="footerAdd" class="footer-add"  @click="addLine">
            <i class="bi bi-plus-circle"></i> 添加
        </a-button>
    </slot>

</template>

<style scoped lang="less">
.table-form {
    :deep(.ant-form-item) {
        margin-bottom: 0;
    }
}
.footer-add {
    margin-top: 1%;
}
</style>
