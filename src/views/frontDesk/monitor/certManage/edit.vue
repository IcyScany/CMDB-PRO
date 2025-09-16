<script setup>
import opsFormInit from "@/composables/form/opsFormInit";
import certManageApi  from '@/api/monitor/certManage';
import noLoginApi from "@/api/noLoginApi";
import { ADD_TYPE, EDIT_TYPE } from "@/config/globalOption";
import moment from "moment";

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

const TITLE_LAYER = 1;
const formRef = ref(null);
const { putCertEdit, getCertOneList, postCertAddDataApi } = certManageApi;
const canUserAction = inject('canUserAction');
let isCheckCert = ref(false); // 是否进行了证书的验证
let isCheckCertAferData = ref({});  // 点击验证后获取到的数据

let certType = ref({ // 证书类型
    key: {
        type: 'text',
        list: []
    },
    cert: {
        type: 'text',
        list: []
    },
});

// 表单数据初始化
const {
    edit_data,
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, TITLE_LAYER, formType, sid, emits, addApi: postCertAddDataApi, editApi: putCertEdit, oneDataApi: getCertOneList, customSubmitData, customEditData});

// 自定义处理单条数据
function customEditData(data) {
    if (!data.value['virtual_team_v3_id']) {
        data.value['virtual_team_v3_id'] = formRenderContent.value?.initFormState['virtual_team_v3_id'];
    }
    return data;
}

// 自定义处理提交数据
async function customSubmitData(data) {
    // 编辑时，key和cert字段可以为空，表示不修改这两个字段，只提交其他字段
    if (formType.value === EDIT_TYPE && !formRenderContent?.value?.formState['key'] && !formRenderContent?.value?.formState['cert']) {
        delete data.key;
        delete data.cert;
        delete data.snis;
        delete data.expire_time;
        delete data.certificate_id;
    }
    return data;
}

// 关闭模态框
const handleDrawerClose = () => {
    emits('update:open', false);
};

// 证书类型切换
const handleCertType = () => {
    certType.value = {
        key: {
            type: 'text',
            list: []
        },
        cert: {
            type: 'text',
            list: []
        },
    };
};

// 不同的表单类型，表单的校验规则不同
const updateFormRules = () => {
    // 编辑时，key和cert字段可以为空
    if (formType.value === EDIT_TYPE) {
        delete formRenderContent.value.rules['key'];
        delete formRenderContent.value.rules['cert'];
    } else {
        if (!formRenderContent.value.rules['key'] || !formRenderContent.value.rules['key'].length) {
            formRenderContent.value.rules['key'] = [{ required: true, message: '此项不能为空' }];
        }
        if (!formRenderContent.value.rules['cert'] || !formRenderContent.value.rules['cert'].length) {
            formRenderContent.value.rules['cert'] = [{ required: true, message: '此项不能为空' }];
        }
    }
    resetCertMessage();
    formRenderContent.value.formState.key = ``;
    formRenderContent.value.formState.cert = ``;
    formRenderContent.value.formState.expire_time = '';
    formRenderContent.value.formState.snis = null;
};

// 打开模态框
const handleDrawerOpen = async (val) => {
    if (val) {
        await initForm();
        await formDataInit();
        handleCertType();
        updateFormRules();
    }
};

// 证书验证相关
/** 获取系统时间  --Start**/
let systemTime = ref(null); // 用于点击'证书验证按钮'按钮时
const getSystemTime = async () => {
    return noLoginApi.getServerTime()
        .then((res) => {
            systemTime.value = res.timestamp;
        });
};
/** 获取系统时间  --Start**/
const beforeUpload = (file, fileList, field) => {
    // 得到FileReader对象。
    let reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        // 替换 Windows 风格的换行符为 Unix 风格
        // const normalizedContent = content.replace(/\r/g, '');
        console.log(field, formRenderContent.value.formState[field]);
        formRenderContent.value.formState[field] = content;
        console.log('----------------------------');
        console.log(field, formRenderContent.value.formState[field]);
        
    };
    // 读取文件中的内容，执行读文件函数，设置编码格式。
    reader.readAsText(file);
    return false;
};
// 证书验证
const handleCheckCert = async () => {
    isCheckCert.value = false;
    if (formRenderContent.value.formState['cert'] && formRenderContent.value.formState['key']) {
        certManageApi.postCertVerifyApi({
            cert: formRenderContent.value.formState['cert'],
            key: formRenderContent.value.formState['key'],
        }).then(res => {
            let {certificate_id, labels, snis, key, cert, status, top_domain } = res;
            
            isCheckCert.value = true;
            isCheckCertAferData.value = res;
            getSystemTime();
        
            Object.assign(formRenderContent.value.formState, {
                certificate_id,
                expire_time: labels && labels?.validity_end? moment(labels?.validity_end * 1000).format(`YYYY-MM-DD HH:mm:ss`): ``,
                snis,
                key,
                cert,
                status,
                top_domain,
                labels,
            });
        }).catch(() => {
            isCheckCert.value = false;
            isCheckCertAferData.value = {};
        });
    }
};
// 证书验证类型切换
const handleCertChange = (info, field) => {
    let resFileList = [...info.fileList];
    resFileList = resFileList.slice(-1);
    resFileList = resFileList.map(file => {
        if (file.response) {
            // Component will show file.url as link
            file.url = file.response.url;
        }
        return file;
    });
    certType.value[field]['list'] = resFileList;
};

// 公/私钥类型切换
const handleChangeType = (field) => {
    let diffType = certType.value[field];
    diffType.list = [];
    console.log(formRenderContent.value, field);
    formRenderContent.value.formState[field] = null;
};

// 重置表单
const resetForm = () => {
    for (let i in formRenderContent.value.formState) {
        formRenderContent.value.formState[i] = formRenderContent.value.initFormState[i];
    }
    isCheckCert.value = false;
    isCheckCertAferData.value = {};
    handleCertType();
};

// 重新完善证书信息
const resetCertMessage = () => {
    isCheckCert.value = false;
    isCheckCertAferData.value = {};
};

const cloudMasterAccountOptions = computed(() => {
    let options = [];
    let data = formRenderContent.value?.title_data?.cloud_master_account_id;
    if (data) {
        options = data.map((item) => {
            // Get all selected items
            const selectedItems = formRenderContent.value.formState['cloud_master_account_id'] || [];
            // Get the cloud type of the current item
            const currentCloudType = item.cloud_type;
            // Check if any item of the same cloud type is already selected
            const hasSameTypeSelected = selectedItems.some(selectedId => {
                const selectedItem = data.find(option => option.id === selectedId);
                return selectedItem && selectedItem.cloud_type === currentCloudType;
            });
            // Disable if another item of the same type is already selected
            const shouldDisable = hasSameTypeSelected && !selectedItems.includes(item.id);
                                
            return {
                label: `${item.page_display} ${item.username}`,
                value: item.id,
                icon: item.cloud_type,
                disabled: shouldDisable
            };
        });
    }
    return options;
});



</script>

<template>
    <ops-form-container
        :open="open"
        @after-open-change="handleDrawerOpen"
        @close="handleDrawerClose"
    >
        <template #title>
            {{$route.meta.title}}{{formType === $CONFIG.FORM_TYPE.ADD_TYPE  ? `新增证书` : `NO.[${edit_data.certificate_id}]编辑证书`}}
            <vxe-button v-if="isCheckCert" status="primary" content="重新完善证书信息" size="mini" @click="resetCertMessage"></vxe-button>
        </template>
        <a-spin :spinning="formDataLoading">
            <a-form
                ref="formRef"
                :model="formRenderContent.formState"
                :rules="formRenderContent.rules"
            >
                <template v-for="t in $utils.filter(formRenderContent.title, item => item.edit_display)" :key="t.field">
                    <template v-if="t.field === `certificate_id`">
                        <ops-form-item
                            v-if="isCheckCert"
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :disabled="isCheckCert ? Boolean(formRenderContent.formState[t.field]) : !t.edit_change"
                        >
                        </ops-form-item>
                    </template>
                    <template v-else-if="t.field === `cert` || t.field === 'key'">
                        <ops-form-item
                            :title="t"
                        >
                           <a-form-item-rest>
                                <a-radio-group v-model:value="certType[t.field]['type']" size="small" style="margin-bottom: 10px; display: block" @change="handleChangeType(t.field)">
                                    <a-radio value="text">文本</a-radio>
                                    <a-radio value="file">附件</a-radio>
                                </a-radio-group>
                                
                           </a-form-item-rest>
                           <a-form-item-rest  v-if="certType[t.field]['type'] === 'file'">
                                <a-upload
                                        v-model:file-list="certType[t.field]['list']"
                                        :name="`${t.field}_file`"
                                        :accept="`.${t.field === 'key' ? 'key' : 'crt'}`"
                                        :show-upload-list="true"
                                        :with-credentials="true"
                                        method="POST"
                                        :before-upload="(file, fileList) => beforeUpload(file, fileList, t.field)"
                                        @change="(info) => handleCertChange(info, t.field)"
                                    >
                                        <vxe-button  mode="text"  status="primary" content="上传" icon="vxe-icon-upload" style="margin-left: 2%; margin-bottom: 10px;"></vxe-button>
                                </a-upload>
                            </a-form-item-rest>
                           
                           
                          

                            <a-textarea
                                v-if="certType[t.field]['type'] === 'text'"
                                v-model:value="formRenderContent.formState[t.field]"
                                :disabled="isCheckCert ? isCheckCert : !t.edit_change"
                                :rows="10"
                            />
                        </ops-form-item>
                    </template>
                    <template v-else-if="t.field === `expire_time`">
                        <ops-form-item
                            v-if="isCheckCert"
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :disabled="isCheckCert ? isCheckCert : !t.edit_change"
                        >
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
                    <template v-else-if="t.field === `snis`">
                        <ops-form-item
                            v-if="isCheckCert"
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                        >
                            <span v-if="formRenderContent.formState[t.field]">
                                <template v-if="Array.isArray(formRenderContent.formState[t.field])">
                                    <a-tag v-for="i in formRenderContent.formState[t.field]" :key="i" color="green">{{i}}</a-tag>
                                </template>
                                <template v-else>
                                    {{formRenderContent.formState[t.field]}}
                                </template>
                            </span>
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
            <span v-if="Boolean((formType === $CONFIG.FORM_TYPE.ADD_TYPE && !isCheckCert) || (formType === $CONFIG.FORM_TYPE.EDIT_TYPE && (formRenderContent?.formState?.['key'] || formRenderContent?.formState?.['cert']) && !isCheckCert))" class="text-error" style="float: left">
               <span class="vxe-icon-warning-triangle-fill text-orange"></span> 请先进行证书验证再执行提交
            </span>
            <span v-if="isCheckCertAferData['labels'] && isCheckCertAferData['labels']['validity_end'] * 1000 <  systemTime" class="text-error">当前证书已过期, 过期时间为<b>({{formState['expire_time']}})</b></span>
            <vxe-button v-if="canUserAction?.check_cert" :disabled="!(formRenderContent?.formState?.['key'] && formRenderContent?.formState?.['cert'])" content="证书验证" status="primary" size="mini" @click="handleCheckCert"/>
            <vxe-button  content="取消" @click="handleDrawerClose"/>
            <vxe-button type="submit" :loading="confirmLoading" :disabled="Boolean((formType === $CONFIG.FORM_TYPE.ADD_TYPE && !isCheckCert) || (formType === $CONFIG.FORM_TYPE.EDIT_TYPE && (formRenderContent?.formState?.['key'] || formRenderContent?.formState?.['cert']) && !isCheckCert))"  content="提交" status="primary" size="mini" @click="editSubmit"/>
            <vxe-button  content="重置"  size="mini" @click="resetForm"/>


           
        </template>
    </ops-form-container>
</template>
