<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import manageApi from "@/api/alert/manageApi";

let {level} = manageApi;

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
    },
    tableAllData: {
        type: Array,
        default: () => [],
    }
});
const {open, sid, formType, tableAllData} = toRefs(props);
const emits = defineEmits(['update:open', 'editSuccess']);
let formRef = ref(null);
const editTitleLayer = 3;
const {postAdd, getList, putEdit} = level;

let levelEditState = reactive({
    noticeType: []

});

const diffAlertLevelType = {
    "P0":1,
    "P1":2,
    "P2":3,
    "P3":4,  
};

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
} = opsFormInit({formRef, editTitleLayer, formType, sid,emits ,addApi: postAdd, editApi: putEdit, oneDataApi: getList, customSubmitData, customEditData});


const handleDrawerClose = () => {
    emits('update:open', false);
};

const handleDrawerOpen = async (val) => {
    if (val) {
        await initForm();
        await formDataInit();
    }
};

const handleAlertLevelChange = (e) => {
    formRenderContent.value.formState.notice_type = diffAlertLevelType[e.target.value];
};




</script>

<template>
    <ops-form-container
        :title="`${$route.meta.title}-  告警等级 ${formType === $CONFIG.FORM_TYPE.ADD_TYPE ? '新增': `NO.${sid} 编辑`}`"
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

                    <template v-if="t.field === 'alert_source'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                       
                        <ops-a-select
                            v-model:value="formRenderContent.formState[t.field]"
                            :options="$utils.uniq(tableAllData, 'alert_source').map(item => ({value: item.alert_source, label: item.alert_source}))"

                        />
                        
                        </ops-form-item>
                       
                    </template>
                    <template v-else-if="t.field === 'notice_type'">
                       
                        <ops-form-item
                            v-if="formRenderContent.formState?.alert_level"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]" 
                        >
                        <a-radio-group
                                v-model:value="formRenderContent.formState[t.field]"
                                :disabled="!t.edit_change"
                                :name="t.field"
                               
                            >
                                <a-radio v-for="o in formRenderContent?.title_data?.[t.field].filter(item => item.value === diffAlertLevelType[formRenderContent.formState.alert_level]) " :key="o.value" :value="o.value">
                                    {{ o.label }}
                                  
                                </a-radio>
                            </a-radio-group>
                      
                        </ops-form-item>
                    </template>
                    <template v-else-if="t.field === 'alert_level'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="levelEditState.noticeType"
                            @change="handleAlertLevelChange"
                        />
                      
                        
                    </template>
                   
                    <template v-else>
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >

                        </ops-form-item>
                    </template>
                   
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
