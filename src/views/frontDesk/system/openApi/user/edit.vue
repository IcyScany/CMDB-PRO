<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import API from "@/api/system/openapi";
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
});

const { open, sid, formType } = toRefs(props);
const emits = defineEmits(['update:open', 'editSuccess']);

const editTitleLayer = 1;
const formRef = ref(null);
const { putUserEdit, getUserDetail, postUserAdd } = API;

const state = reactive({
    originSecretKey: null,
    originAccessKey: null,
});

const {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, editTitleLayer, formType, sid, emits, addApi: postUserAdd, editApi: putUserEdit, oneDataApi: getUserDetail, customSubmitData, customEditData});

// 自定义处理单条数据
function customEditData(data) {
    state.originSecretKey = data.value.secret_key;
    state.originAccessKey = data.value.access_key;
}

// 自定义处理提交数据
async function customSubmitData(data) {
    if (data.secret_key !== state.originSecretKey) {
        data.secret_key = await encodePasswd(data.secret_key);
    }
    if (data.access_key !== state.originAccessKey) {
        data.access_key = await encodePasswd(data.access_key);
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
        await initForm();
        await formDataInit();
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
            <vxe-button  content="取消" @click="handleDrawerClose"/>
            <vxe-button type="submit" :loading="confirmLoading"  status="primary" content="提交"  @click="editSubmit"/>
        </template>
    </ops-form-container>
</template>
