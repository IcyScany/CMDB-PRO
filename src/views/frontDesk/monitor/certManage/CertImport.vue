<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import certManageApi from '@/api/monitor/certManage';

import { ADD_TYPE } from "@/config/globalOption";

const props = defineProps({
    open: { 
        type: Boolean, 
        default: false, 
    },
    certSid: { 
        type: [String, Number], 
        default: '', 
    },
    formType: { 
        type: Number,
        default: ADD_TYPE
    },
    title: {
        type: String,
        default: ''
    },
    action: {
        type: String,
        default: ''
    },
    importAction: {
        type: Object,
        default: () => ({})
    },
    service: {
        type: String,
        default: ''
    },
  
}); 

const { open, certSid, formType, importAction, action, service } = toRefs(props);
const emits = defineEmits(['update:open', 'editSuccess']);
let updateCertState = inject('updateCertState');

const TITLE_LAYER = 3;
const formRef = ref(null);
const {postScmCertUpload, getScmCertList } = certManageApi;
let certState = reactive({
    scmLoading: false,
    scmListData: [],
});

const handleImport = (data) => {
    return postScmCertUpload({action: importAction.value.action,service: service.value,data});
};


const {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, editTitleLayer: TITLE_LAYER, formType, emits, addApi: handleImport,  customSubmitData});



// 自定义处理提交数据
async function customSubmitData(data) {
    if(service.value === 'huawei_cert_update'){
        if(importAction.value.service){
            data.target_service = importAction.value.service;
        }
        if(action.value === 'cdn_domain_list'){
            data.cert_sid = data.cert_id;
           
            delete data.scm_cert_sid;
        }
        if(action.value === 'waf_domain_list' || action.value === 'elb_listener_list'){
            if(importAction.value.action === 'waf_or_elb_import_cert'){
                data.scm_cert_name = certState.scmListData.find(item => item.cert_id === data.scm_cert_sid)?.cert_name;
                data.target_project = data.region_id;
            }
            delete data.cert_id;
            delete data.enterprise_project_id;
            delete data.region_id;
        }
       
    }
   
 
    if(service.value === 'ali_cert_update'){
        data.cert_sid = data.cert_id;
       
    }
   
    delete data.cert_id;


    return data;
}

// 关闭模态框
const handleDrawerClose = () => {
    emits('update:open', false);
};

// 获取华为云的SCM证书列表
const getHuaweiScmCertList = async (cert_sid) => {
    certState.scmLoading = true;
    certState.scmListData = [];
    try {
        certState.scmListData = await getScmCertList(cert_sid);
       
        certState.scmLoading = false;
    }
    catch (error) {
        console.error('Failed to load data:', error);
    }
    finally {
        certState.scmLoading = false;
    }
};


// 打开模态框
const handleDrawerOpen = async (val) => {
    if (val) {
        await initForm();
        await formDataInit();
        getHuaweiScmCertList(certSid.value);

    }
};
const cloudMasterAccountOptions = computed(() => {
    let options = [];
    let data = formRenderContent.value?.title_data?.cloud_master_account_id;
    if (data) {
        options = data.filter((item) => {
            let result = {
                label: `${item.page_display} ${item.username}`,
                value: item.id,
                icon: item.cloud_type,
            };
            Object.assign(item, result);
            return service.value === 'ali_cert_update' ? item.cloud_type === '阿里云' : item.cloud_type === '华为云';
              
        });
    }
    return options || [];
});

const certListOptions = computed(() => {
    let options = [];
    if(updateCertState?.currentDomainData){
        console.log(updateCertState.currentDomainData);

        for(let item of updateCertState.currentDomainData.cert_list){
            if(item.expire_days > 0){
                options.push({
                    label: `${item.cert_name} (${item?.is_post_cert?.reason ? item?.is_post_cert?.reason :  `${item.expire_days}天到期`} )`,
                    value: item.id,
                    ...item?.is_post_cert|| {},
                });
            }
        }
      
    }
    return options;
});





</script>

<template>
    <ops-form-container
        :title="title"
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
                    <template  v-if="t.field === 'scm_cert_sid'">
                        <ops-form-item
                            v-if="['waf_domain_list', 'elb_listener_list'].includes(action) && service === 'huawei_cert_update'"
                            :title="t"
                    >
                        <div >
                            <a-space-compact block>
                          <!--   <a-select v-model:value="formRenderContent.formState[t.field]"  :style="{width: '100%'}" placeholder="请先选择SCM证书">
                                <a-select-option v-for="scm in certState.scmListData" :key="scm.cert_id" :value="scm.cert_id" >
                                    {{scm.enterprise_project}} : {{ scm.cert_id }} {{ scm.cert_name }}  ( {{ scm.expire_time }})   
                                </a-select-option>
                                
                            </a-select> -->
                            <a-space direction="vertical">
                            <a-radio-group v-model:value="formRenderContent.formState[t.field]" :options="certState.scmListData.map(item => ({value: item.cert_id, label: `${ item.cert_id }：${ item.cert_name} ( ${ item.expire_time })  ` }))" />
                        </a-space>

                        
                            <vxe-button :loading="certState.scmLoading" mode="text" status="primary" icon="vxe-icon-repeat" class="cursor-pointer" @click="getHuaweiScmCertList(props.certSid)"/>
                           <!--  <a-button type="primary" @click="handleScmCert">导入</a-button> -->
                            
                        </a-space-compact>
                       

                        
                        </div>
                    </ops-form-item>

                    </template>
                    <template v-else-if="t.field === 'cloud_master_account_id'">
                        <ops-form-item
                            :title="t"
                         >
                         <ops-a-select
                            v-model:value="formRenderContent.formState[t.field]"
                            :options="cloudMasterAccountOptions"
                            :mode="t?.page_data_source?.multiple ? t?.page_data_source?.multiple : 'default'"
                             option-label-prop="label"
                         >
                           <template #option="{value, label, icon}">
                            <span role="img" :aria-label="value"> <cloud-type-icon :type="icon" class="xy-w-2"></cloud-type-icon></span>
                           
                            {{ label }}
                           </template>
                           <template #tagRender="{ value: val, label, closable, onClose, option }">
                            <a-tag :closable="closable" style="margin-right: 3px" @close="onClose">
                                <span role="img" :aria-label="val">
                                <cloud-type-icon :type="option.icon" class="xy-w-2"></cloud-type-icon>
                            </span>
                                {{ label }}&nbsp;&nbsp;
                            
                            </a-tag>
                        </template>

                         </ops-a-select>
                       </ops-form-item>
                    </template>
                    <template v-else-if="t.field === 'cert_id'">
                        <ops-form-item
                            v-if="['cdn_domain_list', 'waf_domain_list'].includes(action) && importAction.action !== 'waf_or_elb_import_cert'"
                            :title="t"
                            :label="null"
                         >
                         <template #label>上传证书</template>
                        
                         <ops-a-select
                            v-model:value="formRenderContent.formState[t.field]"
                            :options="certListOptions"
                            :mode="t?.page_data_source?.multiple ? t?.page_data_source?.multiple : 'default'"
                            option-label-prop="label"
                         >
                        
                        
  
                         </ops-a-select>

                         </ops-form-item>

                    </template>
                    <template v-else-if="t.field === 'enterprise_project_id'">
                        <ops-form-item
                            v-if="service !== 'ali_cert_update' && importAction.action !== 'waf_or_elb_import_cert'"
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"       
                        >
                      
                        </ops-form-item>
                    </template>
                    <template v-else-if="t.field === 'region_id'">
                        <ops-form-item
                            v-if="service !== 'ali_cert_update' && importAction.action === 'waf_or_elb_import_cert'"
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
