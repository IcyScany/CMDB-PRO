<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import API from "@/api/middleware/elasticSearch";
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
    rowData: {
        type: Object,
        required: true
    }
});

const { open, sid, formType } = toRefs(props);
const emits = defineEmits(['update:open', 'editSuccess']);

const editTitleLayer = 3;
const formRef = ref(null);
const { putSubUserEdit, getSubUserDetail, postSubUserAdd } = API;

const {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
    formSubmit
} = opsFormInit({formRef, editTitleLayer, formType, sid, emits, customSubmit, addApi: postSubUserAdd(props.rowData.id), editApi: putSubUserEdit, oneDataApi: getSubUserDetail, customSubmitData, customEditData});

const editTitle = computed(() => {
    let titles = formRenderContent.value.title || [];
    return titles.filter(item => item.edit_display);
});

// 自定义处理单条数据
function customEditData(data) {
    return data;
}

// 自定义处理提交数据
async function customSubmitData(data) {
    data.password = await encodePasswd(data.password);
    return data;
}

async function customSubmit(data) {
    try {
        await API.verifySubUser(props.rowData.id, {
            username: data.username,
            password: data.password
        });
        formSubmit(data);
    } catch (error) {
        confirmLoading.value = false;
    }
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
                <template v-for="t in editTitle" :key="t.field">
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
