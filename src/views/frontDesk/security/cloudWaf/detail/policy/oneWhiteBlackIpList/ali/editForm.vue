<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import { ADD_TYPE } from "@/config/globalOption";
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
const { add, edit } = policyApi.whiteBlackIp;

const editTitleLayer = 6;
const formRef = ref(null);

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
} = opsFormInit({formRef, editTitleLayer, formType, sid, hasEditData, emits, addApi: add, editApi: edit, customSubmitData, customEditData});

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

    formData['remote_addr'] = formData['remote_addr'].join(',');
    
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
    data['template_id'] = String(data.template_id);

    data['remote_addr'] = data['remote_addr'].split(',').map(item => item.trim());
    
    return data;
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

                <template v-else-if="t.field === 'remote_addr'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-textarea v-model:value="formRenderContent.formState[t.field]" :rows="4" />
                        <span style="font-size: 13px; color: #999;">
                            多个IP以英文逗号分隔，最多添加200个
                        </span>
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
