<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import API from "@/api/network/extranetDomain";
import { ADD_TYPE, EDIT_TYPE } from "@/config/globalOption";
import CloudTypeIcon from "@/components/common/CloudTypeIcon.vue";

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
        default: ADD_TYPE
    },
});

const { open, sid, formType } = toRefs(props);
const emits = defineEmits(['update:open', 'editSuccess']);

const TITLE_LAYER = 1;
const formRef = ref(null);
const { putEdit, getDetail, postAdd } = API;

const state = reactive({
    typeOptions: [],
    zoneOptions: [],
    cloudAccountOptions: [],
});

const {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, TITLE_LAYER, formType, sid, emits, addApi: postAdd, editApi: putEdit, oneDataApi: getDetail, customSubmitData, customEditData});

// 自定义处理单条数据
function customEditData() {}

// 自定义处理提交数据
async function customSubmitData(data) {
    if(formType.value === EDIT_TYPE) {
        delete data.cloud_master_account_id;
    }
    return data;
}

// 关闭模态框
const handleDrawerClose = () => {
    emits('update:open', false);
};

// 打开模态框
const handleDrawerOpen = async (val) => {
    if (val) {
        await getCloudAccountList();
        await initForm();
        await formDataInit();
    }
};

const regionOptions = computed(() => {
    return Object.entries(formRenderContent.value?.title_data?.regions_id)?.map(([key, value]) => {
        return {
            label: value,
            value: key,
        };
    });
});

// 获取zone列表
const getZoneOptions = async (sid) => {
    const res = await API.getZoneList(sid);
    state.zoneOptions = res.map(item => {
        return {
            label: item,
            value: item,
        };
    });
};

// 获取云主账号列表
const getCloudAccountList = async () => {
    const res = await API.getCloudAccountList();
    state.cloudAccountOptions = res.map(item => {
        return {
            label: h('span', {}, [
                h(CloudTypeIcon, { type: item.cloud_type, style: { marginRight: '10px', width: 'none' } }),
                `${item.page_display}(${item.primary_username})`,
            ]),
            value: item.id,
            cloud_type: item.cloud_type,
        };
    });
};

// 监听云主账号ID，如果为华为云，则显示区域ID，否则隐藏
watch(() => formRenderContent.value?.formState?.cloud_master_account_id, async(newVal) => {
    if(!newVal) return;
    let cloud_type = state.cloudAccountOptions.find(item =>  item.value === newVal)?.cloud_type;

    let regionId = formRenderContent.value.title.find(item => item.field === 'regions_id');
    regionId.edit_display = cloud_type === '华为云';

    state.typeOptions = Object.entries(formRenderContent.value?.title_data?.type?.[cloud_type] || {}).map(([key, value]) => {
        return {
            label: `${key} - ${value}`,
            value: key,
            key: `${key} - ${value}`
        };
    });

    await getZoneOptions(newVal);
});

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
            >
                <template v-for="t in $utils.filter(formRenderContent.title, item => item.edit_display)" :key="t.field">
                    <template v-if="t.field === 'type'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :options="state.typeOptions"
                        >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'cloud_master_account_id'">
                        <ops-form-item
                            :title="t"
                         >
                            <ops-a-select
                                v-model:value="formRenderContent.formState[t.field]"
                                :options="state.cloudAccountOptions"
                                option-label-prop="label"
                                :disabled="formType === EDIT_TYPE"
                            >
                            </ops-a-select>
                       </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'regions_id'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :options="regionOptions"
                            :disabled="formType === EDIT_TYPE"
                        >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'domain_suffix'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :options="state.zoneOptions"
                            :disabled="formType === EDIT_TYPE"
                        >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'view'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :disabled="true"
                        >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'status'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :disabled="formType === ADD_TYPE"
                        >
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
        <template #footer>
            <vxe-button  content="取消" @click="handleDrawerClose"/>
            <vxe-button type="submit" :loading="confirmLoading"  status="primary" content="提交"  @click="editSubmit"/>
        </template>
    </ops-form-container>
</template>
