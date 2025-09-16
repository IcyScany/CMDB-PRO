<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import { apiList } from "@/api/db/mongodb";
import { ADD_TYPE } from "@/config/globalOption";
import { encodePasswd } from "@/composables/encryptField";

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
    type: {
        type: String,
        default: 'account'
    }
});

const { open, sid, formType } = toRefs(props);
const emits = defineEmits(['update:open', 'editSuccess']);

const TITLE_LAYERS = {
    account: 2,
    database: 3,
    collection: 4
};

const formRef = ref(null);
const { putEdit, getDetail } = apiList[props.type];

const state = reactive({
    originPwd: '',
    errorMsg: ''
});

const {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, editTitleLayer: TITLE_LAYERS[props.type], formType, sid, emits, editApi: putEdit, oneDataApi: getDetail, customSubmitData, customEditData, handleEditError});

// 自定义处理单条数据
function customEditData(data) {
    data.value.password = data.value?.password || '';
    state.originPwd = data.value.password || '';
    return data;
}

// 自定义处理提交数据
async function customSubmitData(data) {
    if(props.type === 'account') {
        if (data.password !== state.originPwd) {
            data.password = await encodePasswd(data.password);
        } else {
            delete data.password;
        }
    }
    return data;
}

// 关闭模态框
const handleDrawerClose = () => {
    emits('update:open', false);
};

// 打开模态框
const handleDrawerOpen = async (val) => {
    state.errorMsg = '';

    if (val) {
        await initForm();
        await formDataInit();
    }
};

function handleEditError(error) {
    state.errorMsg = error?.response?.data?.msg;
}

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
                    <template v-if="t.field === ''">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
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
            <span class="text-error error-msg">{{ state.errorMsg }}</span>
            <vxe-button content="取消" @click="handleDrawerClose"/>
            <vxe-button type="submit" :loading="confirmLoading"  status="primary" content="提交"  @click="editSubmit"/>
        </template>
    </ops-form-container>
</template>

<style scoped>
.error-msg {
    float: left;
    text-align: left;
    max-width: calc(100% - 200px);
}
</style>