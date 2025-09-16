<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import scheduledTasksApi  from '@/api/opsCenter/scheduledTasksApi';
import { ADD_TYPE } from "@/config/globalOption";
import moment from 'moment';
import {clone} from "xe-utils";
import dayjs from "dayjs";

const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    sid: {
        type: [String, Number],
        default: '',
    },
    formType: {
        type: Number,
    },

});
const {open, sid, formType} = toRefs(props);
const emits = defineEmits(['update:open', 'editSuccess']);
let formRef = ref(null);
const editTitleLayer = 1;
const { postScheduledTasksAdd, putScheduledTasksEdit, getScheduledTasksList } = scheduledTasksApi;
const cronObject = { // 不同执行时间的表单类型
    interval: {"days": 0, "hours": 0, "weeks": 0, "minutes": 0, "seconds": 0, "end_date": null, "start_date": null},
    cron: {"year": '', "month": [], "day": [], "week": [], "day_of_week": [], "hour": [], "minute": [], "second": [], "start_date": null, 'end_date': null} ,
    date: {run_date: ''}
};
const intervalNum = ref(0);
const intervalUnit = ref('weeks');
const timeUnits = {
    'weeks': '周',
    'days': '天',
    'hours': '时',
    'minutes': '分',
    'seconds': '秒',
};
const changeInterval = () => {
    Object.keys(timeUnits).forEach(unit => {
        diffRunTimeForm.value[formRenderContent.value.formState.run_time_type][unit] = 0;
    });
};

const diffRunTimeForm = ref(clone(cronObject, true));
const dayOfWeek = [
    {
        "label": "星期一",
        "value": 1
    },
    {
        "label": "星期二",
        "value": 2
    },
    {
        "label": "星期三",
        "value": 3
    },
    {
        "label": "星期四",
        "value": 4
    },
    {
        "label": "星期五",
        "value": 5
    },
    {
        "label": "星期六",
        "value": 6
    },
    {
        "label": "星期日",
        "value": 0
    }
];
const tabList = [
    {
        key: 'other',
        tab: '其它',
    },
    {
        key: 'week',
        tab: '按周',
    },
]; // 执行时间类型为cron时
const disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < moment().endOf('day');
};
const key = ref('other');
const onTabChange = (value) => {
    key.value = value;
    diffRunTimeForm.value.cron = clone(cronObject.cron, true);
};


const formatDateStr = `YYYY-MM-DD HH:mm:ss`;
const customFormDate = (date) => {
    return dayjs(date).format(formatDateStr);
};
const customSubmitData = async (data) => {
    if (data.run_time_type) {
        data.run_time = clone(diffRunTimeForm.value[data.run_time_type], true);
        if(data.run_time_type === 'interval') {
            data.run_time[intervalUnit.value] = intervalNum.value;
        }
        for (let item in data.run_time) {
            if (item.indexOf(`_date`) > -1 && data.run_time[item]) {
                data.run_time[item] = customFormDate(data.run_time[item]);
            }
            if (Array.isArray(data.run_time[item])) {
                data.run_time[item] = data.run_time[item].length ? data.run_time[item].join(',') : null;
            }
            if (item === 'year') {
                data.run_time[item] = data.run_time[item] ? data.run_time[item].format(`YYYY`) : null;
            }
        }
    }
    for (let item in data) {
        if (!(data[item] === 0 || data[item] === false ||  data[item])) {
            data[item] = null;
        }
    }
    return data;
};

const customOneData = (editData) => {
    let deepCloneEditData = clone(editData.value, true);
    let runTimeType = deepCloneEditData.run_time_type;

    if (deepCloneEditData && runTimeType) {
        let currentRunTime = deepCloneEditData.run_time;
        key.value = currentRunTime?.run_time?.day_of_week ? 'week': 'other';
        if(currentRunTime) {
            let deepCloneRuntime = clone(currentRunTime, true);
            if(runTimeType === 'interval') {
                intervalUnit.value = Object.keys(deepCloneRuntime).find(unit => deepCloneRuntime[unit]);
                intervalNum.value = deepCloneRuntime[intervalUnit.value];
            }
            for (let item in deepCloneRuntime) {
                if(deepCloneRuntime[item]) {
                    diffRunTimeForm.value[runTimeType][item] = 
                        Array.isArray(diffRunTimeForm.value[runTimeType][item]) ? 
                            deepCloneRuntime[item].split(',').map(item => Number(item)) : 
                            item.indexOf(`_date`) > -1 && deepCloneRuntime[item] || item === 'year' ? dayjs(deepCloneRuntime[item]) : deepCloneRuntime[item];
                }
            }
        }
    }
};


let {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, editTitleLayer, formType, sid, addApi: postScheduledTasksAdd, editApi: putScheduledTasksEdit, oneDataApi: getScheduledTasksList, customSubmitData, customOneData, emits});


const handleDrawerClose = () => {
    emits('update:open', false);
};

const handleDrawerOpen = async (val) => {
    if (val) {
        diffRunTimeForm.value = clone(cronObject, true);
        await initForm();
        await formDataInit();
        if (formType.value === ADD_TYPE) {
            formRenderContent.value.formState.run_time = {};
            intervalNum.value = 0;
            intervalUnit.value = 'weeks';
        }
    }
};


</script>

<template>
    <ops-form-container
        :title="`${$route.meta.title}${formType === $CONFIG.FORM_TYPE.ADD_TYPE ? '新增': '编辑'}`"
        :open="open"
        @after-open-change="handleDrawerOpen"
        @close="handleDrawerClose"
    >

        <a-spin :spinning="formDataLoading">
            <a-form
                ref="formRef"
                :model="formRenderContent.formState"
                :rules="formRenderContent.rules"
                :label-col="{ span: 4 }"
                label-align="left"

                :colon="false"
            >
                <template v-for="t in $utils.filter(formRenderContent.title, item => item.edit_display)" :key="t.field">
                    <template v-if="t.field === 'run_time'">
                        <ops-form-item
                            v-if="formRenderContent.formState.run_time_type"
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            class="run-time-form"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                            <a-card  v-if="formRenderContent.formState.run_time_type === 'interval'">
                                <a-form-item-rest >
                                    <a-space  align="start" style="width: 100%;" class="border-2 border-b-blue-300 bottom-1">
                                        <a-space-compact block>
                                            <a-input-number v-model:value="intervalNum" :min="0" :style="{ width: '70%' }"></a-input-number>
                                            <a-select v-model:value="intervalUnit" :style="{ width: '30%' }" @change="changeInterval">
                                                <a-select-option v-for="(name, unit) in timeUnits" :key="unit" :label="name" :value="unit">{{ name }}</a-select-option>
                                            </a-select>
                                        </a-space-compact>
                                    </a-space>
                                    <a-space style="width: 100%; margin: 5px 0;">
                                        <a-space-compact block>
                                            <a-input :style="{ width: '30%' }" disabled placeholder="开始日期" />
                                            <a-date-picker v-model:value="diffRunTimeForm[formRenderContent.formState.run_time_type].start_date" format="YYYY-MM-DD HH:mm:ss" :show-time="{ defaultValue: moment('00:00:00', 'HH:mm:ss') }" :style="{ width: '70%' }" />
                                        </a-space-compact>
                                    </a-space>
                                    <a-space style="width: 100%;">
                                        <a-space-compact block>
                                            <a-input :style="{ width: '30%' }" disabled placeholder="结束日期" />
                                            <a-date-picker v-model:value="diffRunTimeForm[formRenderContent.formState.run_time_type].end_date" format="YYYY-MM-DD HH:mm:ss" :show-time="{ defaultValue: moment('00:00:00', 'HH:mm:ss') }" :style="{ width: '70%' }" />
                                        </a-space-compact>
                                    </a-space>
                                    <span class="text-warning">选择开始和结束时间后，任务会在此时间段执行，不选择为一直执行</span>
                                </a-form-item-rest>
                            </a-card>
                            <a-card
                                v-if="formRenderContent.formState.run_time_type === 'cron'"
                                :tab-list="tabList"
                                :active-tab-key="key"
                                @tab-change="onTabChange"
                            >
                                <a-form-item-rest >
                                <a-space  align="start" style="flex-direction: column; width: 100%" class="border-2 border-b-blue-300">
                                    <template v-if="key==='other'">
                                        <a-space-compact block >
                                            <a-input :style="{ width: '10%' }" disabled placeholder="年" />
                                            <a-date-picker v-model:value="diffRunTimeForm[formRenderContent.formState.run_time_type].year" :disabled-date="disabledDate"  :style="{ width: '90%' }"  format="YYYY" picker="year" />
                                        </a-space-compact>
                                        <a-space-compact block>
                                            <a-input :style="{ width: '10%' }" disabled placeholder="月" />
                                            <a-select v-model:value="diffRunTimeForm[formRenderContent.formState.run_time_type].month" allow-clear auto-clear-search-value :style="{ width: '90%' }"  mode="multiple"  >
                                                <a-select-option v-for="item in 12" :key="item" :label="item" :value="item"> {{item}}</a-select-option>
                                            </a-select>
                                        </a-space-compact>
                                        <a-space-compact block>
                                            <a-input :style="{ width: '10%' }" disabled placeholder="日" />
                                            <a-select v-model:value="diffRunTimeForm[formRenderContent.formState.run_time_type].day"  mode="multiple" :style="{ width: '90%' }">
                                                <a-select-option v-for="item in 31" :key="item" :label="item" :value="item"> {{item}}</a-select-option>
                                            </a-select>
                                        </a-space-compact>
                                        <a-space-compact block>
                                            <a-input :style="{ width: '10%' }" disabled placeholder="周" />
                                            <a-select v-model:value="diffRunTimeForm[formRenderContent.formState.run_time_type].week"  mode="multiple" :style="{ width: '90%' }">
                                                <a-select-option v-for="item in 53" :key="item" :label="item" :value="item"> {{item}}</a-select-option>
                                            </a-select>
                                        </a-space-compact>
                                    </template>
                                    <a-space-compact v-if="key==='week'" block>
                                        <a-checkbox-group v-model:value="diffRunTimeForm[formRenderContent.formState.run_time_type].day_of_week" :options="dayOfWeek" />
                                    </a-space-compact>
                                    <a-space-compact block>
                                        <a-input :style="{ width: '10%' }" disabled placeholder="时" />
                                        <a-select v-model:value="diffRunTimeForm[formRenderContent.formState.run_time_type].hour"  mode="multiple" :style="{ width: '90%' }">
                                            <a-select-option v-for="(item, idx) in 24" :key="item" :label="idx" :value="idx"> {{idx}}</a-select-option>
                                        </a-select>
                                    </a-space-compact>
                                    <a-space-compact block>
                                        <a-input :style="{ width: '10%' }" disabled placeholder="分" />
                                        <a-select v-model:value="diffRunTimeForm[formRenderContent.formState.run_time_type].minute"  mode="multiple" :style="{ width: '90%' }">
                                            <a-select-option v-for="item in [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]" :key="item" :label="item" :value="item"> {{item}}</a-select-option>
                                        </a-select>
                                    </a-space-compact>
                                    <a-space-compact block>
                                        <a-input :style="{ width: '10%' }" disabled placeholder="秒" />
                                        <a-select v-model:value="diffRunTimeForm[formRenderContent.formState.run_time_type].second"  mode="multiple" :style="{ width: '90%' }">
                                            <a-select-option v-for="(item, idx) in 60" :key="item" :label="idx" :value="idx"> {{idx}}</a-select-option>
                                        </a-select>
                                    </a-space-compact>
                                    <a-space-compact block>
                                        <a-input :style="{ width: '15%' }" disabled placeholder="开始日期" />
                                        <a-date-picker v-model:value="diffRunTimeForm[formRenderContent.formState.run_time_type].start_date" format="YYYY-MM-DD HH:mm:ss" :show-time="{ defaultValue: moment('00:00:00', 'HH:mm:ss') }" :style="{ width: '35%' }" />
                                        <a-input :style="{ width: '15%' }" disabled placeholder="结束日期" />
                                        <a-date-picker v-model:value="diffRunTimeForm[formRenderContent.formState.run_time_type].end_date" format="YYYY-MM-DD HH:mm:ss" :show-time="{ defaultValue: moment('00:00:00', 'HH:mm:ss') }" :style="{ width: '35%' }" />
                                    </a-space-compact>
                                    <span class="text-warning">选择开始和结束时间后，任务会在此时间段执行，不选择为一直执行</span>
                                </a-space>
                                </a-form-item-rest>
                            </a-card>
                            <a-date-picker v-if="formRenderContent.formState.run_time_type === 'date'" v-model:value="diffRunTimeForm[formRenderContent.formState.run_time_type].run_date" format="YYYY-MM-DD HH:mm:ss" :show-time="{ defaultValue: moment('00:00:00', 'HH:mm:ss') }"  />

                        </ops-form-item>
                    </template>

                    <ops-form-item
                        v-else-if="t.field === 'output_keyword'"
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <ops-input-tags
                            v-model:tags="formRenderContent.formState[t.field]"
                            :editable="true"
                        >
                        </ops-input-tags>
                    </ops-form-item>

                    <ops-form-item
                        v-else
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                    </ops-form-item>
                </template>
            </a-form>
        </a-spin>
        <template #footer>
            <vxe-button  content="取消" @click="handleDrawerClose"/>
            <vxe-button type="submit" :loading="confirmLoading"  status="primary" content="提交"  @click="editSubmit"/>
        </template>
    </ops-form-container>

</template>



<style scoped lang="less">
.xy-select-w {
    width: 190px !important;
}

:deep(.run-time-form .ant-space-item) {
    width: 100% !important;
}
</style>
