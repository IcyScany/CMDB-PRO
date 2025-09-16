<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import userApi from "@/api/system/userApi";
import systemConfig from "@/config/index";

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
const {putUserEdit, getUserList, postUserAdd } = userApi;

const customEditData = () => {

};

const customSubmitData = async (data) => {
    return data;

};


let {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, editTitleLayer, formType, sid,emits, editApi: putUserEdit,  addApi: postUserAdd, oneDataApi: getUserList, customSubmitData, customEditData});


const handleDrawerClose = () => {
    emits('update:open', false);
};

const handleDrawerOpen = async (val) => {
    if (val) {
        await initForm();
        await formDataInit();
        if (formType.value === systemConfig.FORM_TYPE.EDIT_TYPE) {
            for(let item in formRenderContent.value.rules) {
                if (formRenderContent.value?.rules?.[item]?.[0]?.required) {
                    formRenderContent.value.rules[item][0].required = false;
                }

            }

        }
    }
};



</script>

<template>
    <ops-form-container
        :title="`用户${formType === $CONFIG.FORM_TYPE.ADD_TYPE ? '新增': '编辑'}`"
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
                    <template v-if="t.field === 'mobile'">
                        <ops-form-item
                            v-if="formType === $CONFIG.FORM_TYPE.ADD_TYPE"
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        />
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



<style scoped>

</style>
