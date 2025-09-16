<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import { ADD_TYPE } from "@/config/globalOption";
import { policyApi } from "@/api/security/cloudWafApi";
import { clone } from "xe-utils";
import HwTemplate from "../../components/hwTemplate.vue";

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
const { add, edit, getAddrList } = policyApi.whiteBlackIp;

const editTitleLayer = 4;
const formRef = ref(null);

const state = reactive({
    addrOptions: [],
    timeRange: [],
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
} = opsFormInit({formRef, editTitleLayer, formType, sid, hasEditData, emits, addApi: add, editApi: edit, customSubmitData, customEditData});

// 处理编辑title
const editTitle = computed(() => {
    if(!formRenderContent.value?.title) return [];

    let titles = formRenderContent.value?.title;
    let formState = formRenderContent.value?.formState;
    
    titles.forEach(item => {
        if(item.field === 'ip_group_id') {
            item.edit_display = formState['ip_group'] === 'ip_group_id';
        }
        if(item.field === 'addr') {
            item.edit_display = formState['ip_group'] === 'addr';
        }
    });

    titles = titles.filter(item => item.edit_display && item.block === 1);

    return titles;
});

// 自定义处理单条数据
function customEditData(data) {
    let formData = data.value;
    
    if(formData['ip_group']) {
        formData['ip_group_id'] = formData['ip_group']?.id;
        formData['ip_group'] = 'ip_group_id';
    }
    if(formData['addr']) {
        formData['ip_group'] = 'addr';
    }
    
    return formData;
}

// 自定义处理提交数据
async function customSubmitData(data) {
    // 固定字段
    data['cloud_type'] = 'huawei';
    data['cloud_master_account_id'] = props.rowData.cloud_master_account_id;
    data['sid'] = props.rowData.id;
    data['policy_id'] = props.rowData.cc_policy_id;
    data['rule_id'] = props.editData.id;

    if(data['ip_group'] === 'ip_group_id') {
        delete data['addr'];
    }
    if(data['ip_group'] === 'addr') {
        delete data['ip_group_id'];
    }
    delete data['ip_group'];

    if(data['time_mode'] === 'custom') {
        data['start'] = state.timeRange[0] ? new Date(state.timeRange[0]).getTime() : undefined;
        data['terminal'] = state.timeRange[1] ? new Date(state.timeRange[1]).getTime() : undefined;
    }

    return data;
}

const getAddrOptions = async () => {
    const res = await getAddrList(props.rowData.cloud_master_account_id, props.rowData.id);
    state.addrOptions = res.data.map(item => ({
        label: item.name,
        value: item.ip_group_id,
    }));
};

onMounted(async () => {
    await initForm();
    await formDataInit();
    await getAddrOptions();
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
            <hw-template :row-data="rowData" />

            <template v-for="t in editTitle" :key="t.field">
                <template v-if="t.field === 'ip_group'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-radio-group v-model:value="formRenderContent.formState[t.field]">
                            <a-radio-button 
                                v-for="(option, key) in {ip_group_id: 'IP/IP段', addr: '地址组'}"
                                :key="key"
                                :value="key"
                            >
                                {{ option }}
                            </a-radio-button>
                        </a-radio-group>
                    </ops-form-item>
                </template>

                <template v-else-if="t.field === 'addr'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-select v-model:value="formRenderContent.formState[t.field]" :options="state.addrOptions" />
                    </ops-form-item>
                </template>

                <template v-else-if="t.field === 'time_mode'">
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-radio-group v-model:value="formRenderContent.formState[t.field]">
                            <a-radio-button value="permanent">立即生效</a-radio-button>
                            <a-radio-button value="custom">自定义</a-radio-button>
                        </a-radio-group>

                        <a-form-item-rest v-if="formRenderContent.formState[t.field] === 'custom'">
                            <div class="mt-2">
                                <a-range-picker
                                    v-model:value="state.timeRange"
                                    :show-time="{ format: 'HH:mm:ss' }"
                                    format="YYYY-MM-DD HH:mm:ss"
                                />
                            </div>
                        </a-form-item-rest>
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
