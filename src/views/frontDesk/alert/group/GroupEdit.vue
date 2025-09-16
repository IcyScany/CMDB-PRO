<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import manageApi from "@/api/alert/manageApi";

let {group} = manageApi;

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
const editTitleLayer = 2;
const {postAdd, getDetail, putEdit} = group;

const customEditData = () => {

};

const customSubmitData = async (data) => {
    for(let item in data) {
        data[item] = data[item] === '' ? null : data[item];
    }

    return data;

};


let {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, editTitleLayer, formType, sid, emits ,addApi: postAdd, editApi: putEdit, oneDataApi: getDetail, customSubmitData, customEditData});


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
        :title="`${$route.meta.title}- 告警分组 ${formType === $CONFIG.FORM_TYPE.ADD_TYPE ? '新增': '编辑'}`"
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
                        v-if="['classify_keyword', 'extra_notifier'].includes(t.field)"
                        :title="t"
                        :title-data="formRenderContent?.title_data?.[t.field]"
                    >
                        <ops-input-tags
                            v-model:tags="formRenderContent.formState[t.field]"
                            :editable="!!t.edit_change"
                        >
                        </ops-input-tags>
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



<style scoped>

</style>
