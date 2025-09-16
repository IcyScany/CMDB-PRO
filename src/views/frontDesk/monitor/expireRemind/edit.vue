<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import API from "@/api/monitor/expireRemind";
import { ADD_TYPE } from "@/config/globalOption";

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
    options: {
        type: Object,
        default: () => ({}),
    },
}); 

const { open, sid, formType, options } = toRefs(props);
const emits = defineEmits(['update:open', 'editSuccess']);

const TITLE_LAYER = 1;
const formRef = ref(null);
const { putEdit, getDetail, postAdd } = API;

const {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, TITLE_LAYER, formType, sid, emits, addApi: postAdd, editApi: putEdit, oneDataApi: getDetail, customSubmitData, customOneData});

// 自定义处理单条数据
function customOneData(data) {
    data.warn_mobile = data.warn_mobile || [];
    data.warn_email = data.warn_email || [];
}

// 自定义处理提交数据
async function customSubmitData(data) {
    if(!data.end_time) {
        data.end_time = null;
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
        const { warn_mobile, warn_email } = formRenderContent.value.formState;
        formRenderContent.value.formState.warn_mobile = warn_mobile || [];
        formRenderContent.value.formState.warn_email = warn_email || [];
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
                    <ops-form-item
                        v-if="t.field === 'start_time'"
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-date-picker 
                            v-model:value="formRenderContent.formState[t.field]" 
                            format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD"
                            :style="{ width: '100%' }" 
                        />
                    </ops-form-item>

                    <ops-form-item
                        v-else-if="t.field === 'end_time'"
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <a-date-picker 
                            v-model:value="formRenderContent.formState[t.field]" 
                            format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD"
                            :style="{ width: '100%' }" 
                        />
                    </ops-form-item>

                    <template v-else-if="t.field === 'applicant_user'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :options="options.username"
                        >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'employ_user'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :options="options.username"
                        >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'email'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :options="options.email"
                            >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'relevance_mobile'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :options="options.mobile"
                        >
                        </ops-form-item>
                    </template>

                    <template v-else-if="t.field === 'warn_mobile'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            :options="options.mobile"
                        >
                        </ops-form-item>
                    </template>

                    <ops-form-item
                        v-else-if="t.field === 'warn_email'"
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                        :options="options.email"
                    >
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
