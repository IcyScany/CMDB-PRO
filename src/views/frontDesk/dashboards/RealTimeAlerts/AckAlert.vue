<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import { ADD_TYPE } from "@/config/globalOption";
import realTimeAlertsApi from '@/api/dashboards/realTimeAlerts';
import opsNoticeModal from "@/composables/opsNoticeModal";



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
    checkAlertData: { // 批量选中的告警数据
        type: Array,
        default: () => []
    },
});

const { open, sid, formType, checkAlertData } = toRefs(props);
const emits = defineEmits(['update:open', 'editSuccess', 'clearChecked']);
let bachAckList = ref({});
const TITLE_LAYER = 1;
const formRef = ref(null);
let { ackAlert } = realTimeAlertsApi;



const {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, TITLE_LAYER, formType, sid, emits, editApi: ackAlert, customSubmit });

// 自定义提交
function customSubmit(formData) {
    if(checkAlertData?.value?.length > 0){
        for(let item in checkAlertData.value){
            let alertId = checkAlertData.value[item];
            if(alertId){
                ackAlert(alertId, formData)
                    .then(res => {
                        confirmLoading.value = false;
                        bachAckList.value[alertId] = {
                            success: true,
                            msg: res.msg
                        };
                    })
                    .catch(err => {
                        confirmLoading.value = false;
                        bachAckList.value[alertId] = {
                            success: false,
                            msg:  err?.response?.data?.message || err?.response?.data?.msg
                        };
                    });
               
            }
        }
    } else {
        ackAlert(sid.value, formData)
            .then(res => {
                confirmLoading.value = false;
                opsNoticeModal({type: 'success', message: res.msg });
            })
            .catch(err => {
                confirmLoading.value = false;
                opsNoticeModal({type: 'error', message: err?.response?.data?.message || err?.response?.data?.msg });
            });
    }
};



// 关闭模态框
const handleDrawerClose = () => {
    emits('clearChecked');
    bachAckList.value = {};
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
        :open="open"
        @after-open-change="handleDrawerOpen"
        @close="handleDrawerClose"
    >
    <template #title>
            {{checkAlertData && checkAlertData.length ? '告警批量ACK' : `告警NO.${sid}的ACK` }}
        </template>
        <template v-if="checkAlertData && checkAlertData.length">
            <a-tag  color="blue" style="width: 100%; text-align: center;">批量ACK的告警ID</a-tag>
            <div style="margin: 5px auto;">
                <a-tag v-for="alert in checkAlertData" :key="alert" color="pink">{{ alert }}</a-tag>
            </div>

        </template>
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
                    >
                    </ops-form-item>
                </template>
            </a-form>
            <template v-if="checkAlertData && checkAlertData.length && Object.keys(bachAckList).length ">
                <a-alert v-for="(result, alertId) in bachAckList" :key="alertId" :message="`告警【${alertId}】${result.msg}`" :type="result.success ?'success' : 'error' " show-icon />
            </template>
        </a-spin>
        <template #footer>
            <vxe-button  content="取消ACK" @click="handleDrawerClose"/>
            <vxe-button type="submit" :loading="confirmLoading"  status="primary" content="ACK"  @click="editSubmit"/>
        </template>
    </ops-form-container>
</template>
