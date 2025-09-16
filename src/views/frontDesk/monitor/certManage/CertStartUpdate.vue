<script setup>
import certManageApi from '@/api/monitor/certManage';
import { parseUrl} from 'xe-utils';

const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    data:{
        type: Object,
        default: () => {
            return {};
        }
    },
    checkData: {
        type: Object,
        default: () => {
            return {} ;
        }
    },
    ways: {
        type: String,
        default: '', // 点击的是批量更新还是单个更新
    },
    hostList: { // 批量更新时的域名列表
        type: Array,
        default: () => {
            return [];
        }
    },
    service: {
        type: String,
        default: '',
    },
    updateAction:{
        type: Object,
        default: () => {
            return {};
        }
    },
   

});
let {open, data, checkData, ways, hostList, service, updateAction} = toRefs(props);

let emits = defineEmits(['update:open', 'editSuccess']);
const statusColor = {
    "error":{
        icon: 'vxe-icon-error-circle-fill',
        status: 'error'
    },
    "finish": {
        icon: "vxe-icon-success-circle-fill",
        status: "finish"
    },
    "process": {

        status: "process"
    },
    'wait': {
        icon: 'vxe-icon-spinner roll',
        status: "wait"
    }

};

let {
    getCertUpdateTaskId,
    postCertUpdateDomainSaveToDb,
    postCertCheckDomain,
    putCertUpdate,
    getCertUpdateLogOne,
    getCertCheckDomain,
} = certManageApi;

const updateWay = {
    batch: '批量',
    single: '单个',
};
const handleModelClose = () => {
    emits('update:open', false);
    emits('editSuccess');
};

let needTestDomain = ref(null); // 是否选择测试域名进行证书验证？
let isStartUpdate = ref(false); // 是否开始证书更新？

// 证书验证的相关数据
let certVerifyState = reactive({
    steps: [],
    taskId: null, // 当前更新任务的ID
    test_domain:{
        method: 'GET',
        protocol: 'https://',
        domain: '',
        path: '/',
        uri: '',
    },
    // 测试域名的连通性
    test_domain_status: {
        msg: '',
        status: '',
    },
    // 当前步骤的日志
    current_step_log:[],
    getVerifyDomain:'', // 获取证书验证的域名
});
let currentCertVerifyStep = ref(null); // 当前证书验证的步骤

// 初始化数据
const handleClearInitData = () => {
    needTestDomain.value = null;
    isStartUpdate.value = false;
    certVerifyState.steps = [];
    certVerifyState.taskId = null;
    certVerifyState.test_domain_status = {
        msg: '',
        status: '',
    };
    certVerifyState.current_step_log = [];
    currentCertVerifyStep.value = null;
    certVerifyState.test_domain = {
        method: 'GET',
        protocol: 'https://',
        domain: '',
        path: '/',
        uri: '',
    };
};

// 打开弹窗
const handleModelOpen = () => {
    handleClearInitData();
    handleNeedTestDomain();
};

// 选择更新的证书
const checkUpdateCerts = computed(() => {
    let result = ways.value === 'batch'? checkData.value?.checkbox || [] : [data.value];
    return result?.map(item => {
        return {
            ...item,
            title: item?.[diffActionField?.[service.value]?.[props.updateAction.action]? diffActionField?.[service.value]?.[props.updateAction.action]?.domain_name : 'domain_name' ] || '',
            status: 'process',
        };
    });
});

// 选择是否选择测试域名进行证书验证
const handleNeedTestDomain = async () => {
   
    if (needTestDomain.value === true) {
        certVerifyState.steps = [ {
            title: '证书验证',
            status: 'process',
            domain_name:'demo'
        },
        ...checkUpdateCerts.value
        ]; 
        let response  = await getCertCheckDomain({
            type_domain: updateAction.value.type_domain
        });
        certVerifyState.getVerifyDomain = response?.param ? parseUrl(response?.param) : '';
        if(certVerifyState.getVerifyDomain && hostList.value.find(item => item?.[diffActionField?.[service.value]?.[props.updateAction.action]?.domain_name] === certVerifyState.getVerifyDomain?.hostname)) {
            certVerifyState.test_domain.domain = certVerifyState.getVerifyDomain?.hostname || '';
            certVerifyState.test_domain.uri = certVerifyState.getVerifyDomain?.pathname.split('/')[1] || '';
        }
        
    }
    if (needTestDomain.value === false) {
        certVerifyState.steps = [ ...checkUpdateCerts.value];
    }
    
};

// 开始证书更新
const handleCertVerifyRequest = ({is_demo, body={}}) => {
    return putCertUpdate({ // 开始证书更新
        service: service.value,
        action: updateAction.value.action,
        data:{
            is_demo,
            ...body,
        }  
    });
};

// 获取某一步证书更新的日志
const handleOneStepLog = async (item = {}, index, is_demo = false) => {
    currentCertVerifyStep.value = index;
    getCertUpdateLogOne({task_id:item.task_id, domain_id: is_demo ? 'demo': item.domain_id})
        .then(res => {
            certVerifyState.current_step_log = res?.param || []; 
        })
        .catch(err => {
            console.log(err);
        });
};

// 不同action对应的不同的字段处理
const diffActionField = {
    'huawei_cert_update': {
        'update_waf_cert': {
            domain_id:'host_id',
            domain_name: 'host_name',
            commonField: ['domain_id', 'domain_name','waf_type', 'region_name', 'region_id','enterprise_project_id', 'cloud_master_account_id']
        },
        'update_elb_cert': {
            domain_id:'listener_id',
            domain_name: 'listener_name',
            commonField: ['domain_id', 'domain_name', 'region_name', 'region_id','enterprise_project_id', 'cloud_master_account_id']
        },
        'update_cdn_cert': {
            domain_id:'host_id',
            domain_name: 'host_name',
            commonField: ['domain_id', 'domain_name', 'cloud_master_account_id']
        }
    },
    'ali_cert_update': {
        'update_cdn_cert': {
            domain_id:'domain_id',
            domain_name: 'domain',
            commonField: ['domain_id', 'domain_name', 'cloud_master_account_id','ssl_protocol']
        },
        'update_waf_cert': {
            domain_name: 'domain',
            commonField: ['domain_name','instance_id',  'cloud_master_account_id']
        },
    }
};

const handleDiffActionField = (data) => {
    let otherData = {};
    if (diffActionField?.[service.value]?.[updateAction.value.action]) {
        diffActionField?.[service.value]?.[updateAction.value.action]?.commonField.forEach(item => {
            otherData[item] = diffActionField?.[service.value]?.[updateAction.value.action]?.[item] ? data[diffActionField?.[service.value]?.[updateAction.value.action]?.[item]] : data?.[item];
        });
    }
    return otherData;
};

// 处理证书更新
const handleUpdateCert = async (idx, item = {}) => {
    certVerifyState.steps[idx].taskId = certVerifyState.taskId;
    certVerifyState.steps[idx].status = `wait`;
    certVerifyState.steps[idx].msg = '证书更新中...';
    currentCertVerifyStep.value = idx;
    try {
        if(item.domain_id) {
            item.domain_id =  item.domain_id + '';
        }
         
        let response = await handleCertVerifyRequest({ // 开始证书更新, 这里是测试域名的连通成功才会进行证书更新。证书验证
            is_demo: 0, // demo为1证书验证，demo为0证书更新
            body: {
                task_id: certVerifyState.taskId,
                cert_id: checkData.value?.radio?.cert_id + '',
                cert_name: checkData.value?.radio?.cert_name,
                ...item,
            }
        });
        certVerifyState.steps[idx].status = 'finish';
        certVerifyState.steps[idx].msg = `${response.status_code}` || '证书验证成功';
        certVerifyState.steps[idx].log = response.msg;                     
    } catch(err) {
        let {data, status_code} = err?.response || {};
        certVerifyState.steps[idx].status = 'error';
        certVerifyState.steps[idx].msg = data?.msg || data?.message || '证书验证失败' + `(${status_code})`;  
        // 在此终止对剩余 URL 的请求
        return; // 直接退出函数
    } finally {
        handleOneStepLog({task_id: certVerifyState.taskId, domain_id: item.domain_name}, idx);
    }
    
};



// 开始证书验证
const handleCertVerify = async () => {
    isStartUpdate.value = true;
    getCertUpdateTaskId()  // 获取证书更新任务的ID
        .then(async res => {
            certVerifyState.taskId = res?.param;
            currentCertVerifyStep.value = 0;
            
            if (needTestDomain.value === true) { // 如果选择了测试域名进行证书验证，需要进行证书验证
                let url = `${certVerifyState.test_domain.protocol}${certVerifyState.test_domain.domain}${certVerifyState.test_domain.uri ? `${certVerifyState.test_domain.path}${certVerifyState.test_domain.uri}`:''}`;
              
                postCertCheckDomain({  // 测试域名的是否连通
                    data: { 
                        url,
                    },
                    type_domain: updateAction.value.type_domain,
                })
                    .then(async (res_content) => { // 测试域名的连通成功才会进行证书更新
                        let {msg, status_code} = res_content;
                        certVerifyState.test_domain_status.msg = `${msg}${status_code}` || '测试域名连通性成功';
                        certVerifyState.test_domain_status.status = status_code;
                        certVerifyState.steps[0].taskId = certVerifyState.taskId;
                        certVerifyState.steps[0].status = `wait`;
                        certVerifyState.steps[0].msg = '证书验证中...';
                        currentCertVerifyStep.value = 0;
                        certVerifyState.steps[0].domain_name = 'demo';
                        postCertUpdateDomainSaveToDb({ // 保存证书更新任务的ID
                            task_id: certVerifyState.taskId,
                            domain: ['demo', ...checkUpdateCerts.value.map(item => item?.[diffActionField?.[service.value]?.[props.updateAction.action]?.domain_name])], 
                        });
                       
                        try {
                            let otherData = handleDiffActionField(hostList.value.find(item => item?.[diffActionField?.[service.value]?.[props.updateAction.action]?.domain_name] === certVerifyState.test_domain.domain));
                            if(otherData.domain_id) {
                                otherData.domain_id =  otherData.domain_id + '';
                            }
                            let response = await handleCertVerifyRequest({ // 开始证书更新, 这里是测试域名的连通成功才会进行证书更新。证书验证
                                is_demo: 1, // demo为1证书验证，demo为0证书更新
                                body: {
                                    task_id: certVerifyState.taskId,
                                    cert_id: checkData.value?.radio?.cert_id + '',
                                    cert_name: checkData.value?.radio?.cert_name,
                                    url,
                                    ...otherData,
                                }
                            });
                          
                            if(response?.status_code !== 200) {
                                certVerifyState.steps[0].status = 'error';
                                certVerifyState.steps[0].msg = response?.msg || '证书验证失败' + `(${response?.status_code})`;
                                handleOneStepLog({task_id: certVerifyState.taskId}, 0,true);
                              
                                return;
                            }
                            certVerifyState.steps[0].status = 'finish';
                            certVerifyState.steps[0].msg = `${response.status_code}` || '证书验证成功';
                            certVerifyState.steps[0].log = response.msg;
                            
                            handleOneStepLog({task_id: certVerifyState.taskId}, 0, true);
                            if(checkUpdateCerts.value.length) {
                                for(let i = 0; i < checkUpdateCerts.value.length; i++) {
                                    let otherItem =  handleDiffActionField(hostList.value.find(item => item?.[diffActionField?.[service.value]?.[props.updateAction.action]?.domain_name] === checkUpdateCerts.value[i]?.[diffActionField?.[service.value]?.[props.updateAction.action]?.domain_name]));
                                    await handleUpdateCert(i + 1, {
                                        ...otherItem,
                                    });
                                }
                            }
                        } catch(err) {
                            let {data, status} = err?.response || {};
                            certVerifyState.steps[0].status = 'error';
                            certVerifyState.steps[0].msg = data?.msg || data?.message || '证书验证失败' + `(${status})`; 
                            certVerifyState.steps[0].domain_name = certVerifyState.test_domain.domain; 
                            handleOneStepLog({task_id: certVerifyState.taskId}, 0, true);
                            // 在此终止对剩余 URL 的请求
                            return; // 直接退出函数
                        } 
                      
                    })
                    .catch(err => {
                        let {data, status} = err?.response || {};
                        certVerifyState.test_domain_status.msg = data?.msg || err?.message || '测试域名连通性失败' + `(${status})`;
                        certVerifyState.test_domain_status.status = status;
                        isStartUpdate.value = false; // 测试域名的连通性失败，不需要进行证书更新
                      
                    }); 
            } 
            if (needTestDomain.value === false) { // 如果没有选择测试域名进行证书验证，直接进行证书更新
                await postCertUpdateDomainSaveToDb({ // 保存证书更新任务的ID
                    task_id: certVerifyState.taskId,
                    domain: checkUpdateCerts.value.map(item => item?.[diffActionField?.[service.value]?.[props.updateAction.action]?.domain_name]), 
                });
                if(checkUpdateCerts.value.length) {
                    for(let i = 0; i < checkUpdateCerts.value.length; i++) {
                        let otherItem =  handleDiffActionField(hostList.value.find(item => item?.[diffActionField?.[service.value]?.[props.updateAction.action]?.domain_name] === checkUpdateCerts.value[i]?.[diffActionField?.[service.value]?.[props.updateAction.action]?.domain_name]));

                        await handleUpdateCert(i, {
                            ...otherItem
                        });
                    }
                }
            }
        });
};



</script>

<template>
    
     <vxe-modal 
        :model-value="open" 
        width="80%" 
        height="80%" 
        :mask-closable="false"
        :esc-closable="false"
        show-zoom
        show-footer
        resize
        @close="handleModelClose"
        @hide="handleModelClose"
        @show="handleModelOpen"
      >
      <template #title>
        
        {{ `${updateWay[ways]} - ${updateAction.title}` }}  目标更新证书：【{{ checkData?.radio?.cert_id }}：{{checkData?.radio?.cert_name }}】 

      </template>
        <template #default>
            <template  v-if="!isStartUpdate">
                <a-divider>
                    <div>
                        <h3>
                            <b>是否选择测试域名进行证书验证？</b>
                        </h3>
                    </div>
                    <a-radio-group v-model:value="needTestDomain" @change="handleNeedTestDomain">
                        <a-radio :value="true">是</a-radio>
                        <a-radio :value="false">否</a-radio>
                    </a-radio-group>
                </a-divider>
                <a-space-compact v-if="needTestDomain" block>
                    <a-input
                        class="site-input-split"
                        :style="{
                            width: '100px',
                            borderLef: 0,
                            borderRight: 0,
                            pointerEvents: 'none',
                        }"
                        :placeholder="certVerifyState.test_domain.method"
                        disabled
                    />
                    <a-input
                        class="site-input-split"
                        :style="{
                        width: '10%',
                        borderLef: 0,
                        borderRight: 0,
                        pointerEvents: 'none',
                        }"
                        :placeholder="certVerifyState.test_domain.protocol"
                        disabled
                    />
                    <a-select 
                        v-model:value="certVerifyState.test_domain.domain"
                        :style="{
                            width: '80%',
                            borderLef: 0,
                            borderRight: 0,
                        
                        }"
                        show-search
                        allow-clear
                        option-filter-prop="label"
                        placeholder="选择检测域名"
                        >
                        <a-select-option
                            v-for="item in hostList"
                            :key="item?.[diffActionField?.[service]?.[props.updateAction.action]? diffActionField?.[service]?.[props.updateAction.action]?.domain_id : 'domain_id']"
                            :value="item?.[diffActionField?.[service]?.[props.updateAction.action]? diffActionField?.[service]?.[props.updateAction.action]?.domain_name : 'domain_name']"
                        >
                            {{ item?.[diffActionField?.[service]?.[props.updateAction.action]? diffActionField?.[service]?.[props.updateAction.action]?.domain_name : 'domain_name'] }}      
                        </a-select-option>
                    
                    </a-select>
                    <a-input
                        class="site-input-split"
                        :style="{
                        width: '50px',
                        borderLef: 0,
                        borderRight: 0,
                        pointerEvents: 'none',
                        }"
                        :placeholder="certVerifyState.test_domain.path"
                        disabled
                    />
                    
                    <a-input
                        v-model:value="certVerifyState.test_domain.uri"
                        class="site-input-right"
                        :style="{
                        width: '50%',
                        textAlig: 'center',
                        }"
                        placeholder=""
                    />
                
                </a-space-compact>
                <vxe-tip v-if="needTestDomain && !certVerifyState.test_domain.domain" status="warning">选择了测试域名验证，需要选择/填写检测域名！</vxe-tip>            
                <vxe-tip v-if="needTestDomain && certVerifyState.test_domain_status.status" status="error">测试域名连通性失败：{{ certVerifyState.test_domain_status.msg }}({{certVerifyState.test_domain_status.status}})</vxe-tip>
            </template>

            <div v-if="certVerifyState?.taskId" class="mt-5 pl-5">
                    <a-timeline mode="left">
                        <a-timeline-item v-for="item in certVerifyState.current_step_log" :key="item.id" :color="item.status ? 'green' : 'red'">
                            <template #dot>
                                <CheckCircleOutlined v-if="item.status" class="text-base"/>
                                <CloseCircleOutlined v-else class="text-base"/>
                            </template>
                             <span :style="{color: item.status ? 'var(--success-color)' : 'var(--error-color)'}">【{{item.create_time}}】{{item.run_action}}</span> <br/>

                            &nbsp;&nbsp;{{item.msg}}<br/>
                            &nbsp;&nbsp;{{item.describe}}
                        </a-timeline-item>
                    </a-timeline>
            </div>
          
            
           
        </template>
        <template v-if="needTestDomain !== null" #left>
            
            <div style="height:100%; width: 250px; border-right: 1px solid #f0f0f0;" class="pl-2 pt-2"> 
                <a-steps
                    v-model:current="currentCertVerifyStep"
                    direction="vertical"
                    size="small"
                    @change="(val) => handleOneStepLog({task_id: certVerifyState?.taskId, domain_id: certVerifyState.steps[val]?.[diffActionField?.[service]?.[props.updateAction.action]?.domain_name] || certVerifyState.steps[val]?.domain_name}, val)"
                    
                >

                <template v-for="(item, idx ) in certVerifyState.steps"  :key="idx" >
                        <a-step
                            :status="!item?.taskId ? 'wait':item.status"
                            :description="item.msg"  
                            :disabled="!item?.taskId"
                        >
                            <template v-if="statusColor?.[item.status]?.['icon']" #icon>
                                
                                <span  :class="statusColor?.[item.status]?.['icon']" ></span>
                            </template>
                            <template #title>
                                {{item.title}}
                            </template>
                        </a-step>
                    </template>
                </a-steps>
                
            </div>
           
            
        </template>
       
        <template #footer>
            <a-button v-if="!isStartUpdate" :disabled="needTestDomain === null || (needTestDomain && !certVerifyState.test_domain.domain)" type="primary" @click="handleCertVerify">开始更新</a-button>

        </template>
        
        </vxe-modal>

</template>

<style scoped lang="less">
.status-other-color {
    color: var(--warning-color);
}
:deep(.ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-description) {
    color: #606266 !important;
}

:deep(.ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon) {
    color:  var(--success-color) !important;
}
:deep(.ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title) {
    color: var(--success-color) !important;
}

:deep(.ant-steps-item-error > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-description) {
    color: #606266 !important;
}
:deep(.ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-description) {
    color: #606266 !important;
}

:deep(.ant-steps-item-submit .ant-steps-item-icon > .ant-steps-icon) {
    color: var(--warning-color) !important;
}
:deep(.ant-steps-item-submit > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title) {
    color: var(--success-color) !important;
}
:deep(.ant-steps-item-stop > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-description) {
    color: #606266 !important;
}
:deep(.ant-steps-item-stop .ant-steps-item-icon > .ant-steps-icon) {
    color: #ccc !important;
}
:deep(.ant-steps-item-stop > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title) {
    color: #ccc !important;
}
:deep(.ant-steps-item-custom.ant-steps-item-active) {
    background-color: #46cccf5c;

}
:deep(.ant-steps-item-custom.ant-steps-item-active .ant-steps-item-icon > .ant-steps-icon) {
    color: @info-color !important;
}
:deep(.ant-steps-item-custom.ant-steps-item-active  .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title) {
    color: @info-color !important;
}
:deep(.ant-steps-item-custom.ant-steps-item-active  .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-description) {
    color: #606266 !important;
}
:deep(.ant-progress-circle) {
    position: relative !important;
}
:deep(.ant-progress-circle .ant-progress-inner) {
    width: 26.5px !important;
    height: 26.5px !important;
}

</style>