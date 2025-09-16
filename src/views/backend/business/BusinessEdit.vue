<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import businessApi from "@/api/backend/businessApi";
import businessTitle from '@/config/business/businessTitle';

/**
 * 注意：其权限url必须以"/"结尾
 * **/

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
    }
});
const {open, sid, formType} = toRefs(props);
const emits = defineEmits(['update:open', 'editSuccess']);
let formRef = ref(null);
const editTitleLayer = 1;
const {postOneBusinessAdd, getBusinessList, putOneBusinessEdit } = businessApi;





let {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, editTitleLayer, formType, sid, emits, editApi: putOneBusinessEdit, addApi: postOneBusinessAdd, oneDataApi: getBusinessList, customTitle: businessTitle[1]});


const handleDrawerClose = () => {
    emits('update:open', false);
};

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
                    <ops-form-item
                        v-model:value="formRenderContent.formState[t.field]"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                        :required="t?.edit_required? true : false"
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
:deep(.ant-space-item) {
    width: 100% !important;
}

.xy-url-input  {
    min-width: 100%;
}

</style>
