<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import { policyApi } from "@/api/security/cloudWafApi";
import { ADD_TYPE } from "@/config/globalOption";
import ConditionsForm from "./conditionsForm.vue";
import RateLimitForm from "./rateLimitForm.vue";
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
const { edit, add } = policyApi.cc;

const editTitleLayer = 5;
const formRef = ref(null);
const conditionsRef = ref(null);
const rateLimitRef = ref(null);

const state = reactive({
    rateLimit: [{}],
});

const editTitle = computed(() => {
    if(!formRenderContent.value?.title) return [];

    let titles = formRenderContent.value?.title;
    let formState = formRenderContent.value?.formState;

    if(!formState?.['template_id']) {
        return titles.filter(item => item.field === 'template_id');
    }

    return titles.filter(item => item.edit_display && item.block === 1);
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
    formSubmit,
} = opsFormInit({formRef, editTitleLayer, formType, sid, hasEditData, emits, addApi: add, editApi: edit, customSubmit, customSubmitData, customEditData});

// 自定义处理单条数据
function customEditData(data) {
    let formData = data.value;

    // 限速字段
    if(formData.ttl || formData.threshold || formData.interval) {
        formData.cc_status = '1';

        let rateTitles = formRenderContent.value.title.filter(item => item.block === 3);
        rateTitles.forEach(item => {
            state.rateLimit[0][item.field] = formData?.[item.field];
        });
    }

    return formData;
}

// 自定义处理提交数据
async function customSubmitData(data) {
    // 固定字段
    data['cloud_type'] = 'aliyun';
    data['rule_id'] = String(props.editData.ruleid);
    data['cloud_master_account_id'] = props.rowData.cloud_master_account_id;
    data['sid'] = props.rowData.id;

    if(data.cc_status === '1') {
        let rateTitles = formRenderContent.value.title.filter(item => item.block === 3);
        
        rateTitles.forEach(item => {
            data[item.field] = state.rateLimit[0]?.[item.field];
        });
    } else {
        let rateTitles = formRenderContent.value.title.filter(item => item.block === 3);
        rateTitles.forEach(item => {
            delete data[item.field];
        });
    }

    return data;
}

// 自定义处理提交
async function customSubmit(data) {
    try {
        await conditionsRef.value?.[0]?.validateForms();
        await rateLimitRef.value?.[0]?.validateForms();

        await formSubmit(data);
    } catch (error) {
        confirmLoading.value = false;
        emits('editError', error);
    }
}

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

                <template v-else-if="t.field === 'cc_status'"> 
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-radio-group v-model:value="formRenderContent.formState[t.field]">
                            <a-radio-button 
                                v-for="(label, key) in formRenderContent.title_data[t.field]" 
                            :key="key" 
                            :value="key"
                        >
                            {{ label }}
                            </a-radio-button>
                        </a-radio-group>

                        <rate-limit-form
                            v-if="formRenderContent.formState[t.field] === '1'"
                            ref="rateLimitRef"
                            v-model:rate-limit="state.rateLimit"
                            :edit-title="formRenderContent.title"
                            :title-data="formRenderContent?.title_data"
                            :rules="formRenderContent.rules"
                        />
                    </ops-form-item>
                </template>

                <template v-else-if="t.field === 'timestamp'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-radio-group v-model:value="formRenderContent.formState[t.field]">
                            <a-radio-button value="立即生效">永久生效</a-radio-button>
                            <a-radio-button value="自定义" :disabled="true">自定义</a-radio-button>
                        </a-radio-group>
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
