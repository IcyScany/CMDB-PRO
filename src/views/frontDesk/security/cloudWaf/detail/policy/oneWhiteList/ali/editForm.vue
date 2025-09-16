<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import { ADD_TYPE } from "@/config/globalOption";
import ConditionsForm from "./conditionsForm.vue";
import { policyApi } from "@/api/security/cloudWafApi";
import { clone } from "xe-utils";
import AliTemplate from '../../components/aliTemplate.vue';

const props = defineProps({
    sid: { 
        type: [String, Number], 
        default: '', 
    },
    formType: { 
        type: Number,
        default: ADD_TYPE
    },
    editData: {
        type: Object,
        default: () => ({}),
    },
    rowData: {
        type: Object,
        default: () => ({}),
    },
    activeTab: {
        type: String,
        default: '',
    },
});

const { sid, formType } = toRefs(props);
const emits = defineEmits(['editSuccess', 'editError']);
const { add, edit } = policyApi.ignore;

const editTitleLayer = 7;
const formRef = ref(null);
const conditionsRef = ref(null);

const ruleTypes = [
    { value: 'sqli', label: 'SQL 注入' },
    { value: 'xss', label: '跨站脚本' },
    { value: 'code_exec', label: '代码执行' },
    { value: 'crlf', label: 'CRLF' },
    { value: 'lfilei', label: '本地文件包含' },
    { value: 'rfilei', label: '远程文件包含' },
    { value: 'webshell', label: 'WebShell' },
    { value: 'csrf', label: 'CSRF' },
    { value: 'other', label: '其他' },
];

const ruleData = reactive({
    checkAll: false,
    type: 'all',
    regularRules: '',
    regularTypes: [],
});

// 目标选项
const targetOptions = computed(() => {
    let options = Object.entries(formRenderContent.value?.title_data?.target)?.map(([key, value]) => ({
        label: value,
        value: key,
        disabled: formRenderContent.value?.formState?.['target']?.includes('all'),
    }));

    return [
        { 'label': '全部', 'value': 'all' },
        { 'label': 'Web核心防护规则', 'value': 'web_core', disabled: formRenderContent.value?.formState?.['target']?.includes('all') },
        ...options,
    ];
});

const ruleTypeOptions = computed(() => {
    let options = ruleTypes.map(item => ({
        label: item.label,
        value: item.value,
    }));

    return options;
});

const hasEditData = computed(() => {
    return clone(props.editData, true);
});

const {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
    formSubmit
} = opsFormInit({formRef, editTitleLayer, formType, sid, hasEditData, emits, customSubmit, addApi: add, editApi: edit, customSubmitData, customEditData});

const editTitle = computed(() => {
    if(!formRenderContent.value?.title) return [];

    let titles = formRenderContent.value?.title;
    let formState = formRenderContent.value?.formState;

    if(!formState?.['template_id']) {
        return titles.filter(item => item.field === 'template_id');
    }

    return titles.filter(item => item.edit_display && item.block === 1);
});

// 自定义处理单条数据
function customEditData(data) {
    let formData = data.value;

    if(formData.target.includes('web_core')) {
        ruleData.type = formData.regularRules ? 'ruleId' : formData.regularTypes ? 'ruleType' : 'all';
        ruleData.regularRules = formData.regularRules.join(',');
        ruleData.regularTypes = formData.regularTypes;
    }

    formData['template_id'] = String(formData.template_id);

    return formData;
}

// 自定义处理提交数据
async function customSubmitData(data) {
    // 固定字段
    data['cloud_type'] = 'aliyun';
    data['rule_id'] = String(props.editData.ruleid);
    data['cloud_master_account_id'] = props.rowData.cloud_master_account_id;
    data['sid'] = props.rowData.id;
    data['status'] = '1';
    data['template_id'] = String(data.template_id);

    data['tags'] = data['target'];
    delete data['target'];

    if(data['tags']?.includes('web_core')) {
        if(ruleData.type === 'ruleId') {
            data['regularRules'] = ruleData.regularRules.split(',');
        } else if(ruleData.type === 'ruleType') {
            data['regularTypes'] = ruleData.regularTypes;
        }
    }

    return data;
}

// 自定义处理提交
async function customSubmit(data) {
    try {
        await conditionsRef.value[0].validateForms();

        await formSubmit(data);
    } catch (error) {
        confirmLoading.value = false;
        emits('editError', error);
    }
}

// 监听目标
const handleTargetChange = (val) => {
    if(val.includes('all')) {
        formRenderContent.value.formState['target'] = ['all'];
    }
};

// 监听规则类型
const checkAllRuleType = () => {
    if(ruleData.checkAll) {
        ruleData.regularTypes = [...ruleTypes.map(item => item.value)];
    } else {
        ruleData.regularTypes = [];
    }
};

const handleRuleTypeChange = (val) => {
    ruleData.checkAll = val.length === ruleTypes.length;
};

onMounted(async () => {
    await initForm();
    await formDataInit();
});

defineExpose({
    editSubmit,
    loading: confirmLoading
});
</script>

<template>
    <a-spin :spinning="formDataLoading">
        <a-form
            ref="formRef"
            :model="formRenderContent.formState"
            :rules="formRenderContent.rules"
        >
            <template v-for="t in editTitle" :key="t.field">
                <template v-if="t.field === 'template_id'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <ali-template
                            v-model:template-id="formRenderContent.formState[t.field]"
                            :row-data="props.rowData"
                            :active-tab="props.activeTab"
                        />
                    </ops-form-item>
                </template>

                <template v-else-if="t.field === 'target'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <div class="web-core-checkbox">
                            <a-checkbox-group 
                                v-model:value="formRenderContent.formState[t.field]" 
                                :options="targetOptions"
                                @change="handleTargetChange"
                            />
                        </div>

                        <a-form-item-rest v-if="formRenderContent.formState[t.field].includes('web_core')">
                            <div class="mt-5 web-core-radio">
                                <div class="font-[600]">Web核心防护规则</div>
                                <a-radio-group v-model:value="ruleData.type">
                                    <a-radio value="all">全部规则</a-radio>
                                    <a-radio value="ruleId">特定规则ID</a-radio>
                                    <a-radio value="ruleType">特定规则类型</a-radio>
                                </a-radio-group>
                            </div>

                            <a-textarea 
                                v-if="ruleData.type === 'ruleId'" 
                                v-model:value="ruleData.regularRules"
                                :placeholder="`最多可以输入50个，以英文逗号分隔`"
                                :rows="4"
                            />

                            <div v-if="ruleData.type === 'ruleType'">
                                <a-checkbox v-model:checked="ruleData.checkAll" @change="checkAllRuleType">全部</a-checkbox>
                                <a-checkbox-group 
                                    v-model:value="ruleData.regularTypes" 
                                    :options="ruleTypeOptions" 
                                    @change="handleRuleTypeChange"
                                />
                            </div>
                        </a-form-item-rest>
                    </ops-form-item>
                </template>

                <template v-else-if="t.field === 'conditions'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <conditions-form 
                            ref="conditionsRef"
                            v-model:conditions="formRenderContent.formState[t.field]" 
                            :edit-title="formRenderContent.title" 
                            :title-data="formRenderContent?.title_data"
                            :rules="formRenderContent.rules"
                        />
                    </ops-form-item>
                </template>
                
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
</template>

<style lang="scss" scoped>
:deep(.web-core-checkbox .ant-checkbox-group-item) {
    width: 100%;
}

.web-core-radio {
    :deep(.ant-radio-wrapper) {
        width: 100%;
        margin-bottom: 10px;
    }
}
</style>
