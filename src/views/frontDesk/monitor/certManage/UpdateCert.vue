<script setup>
// 华为云、阿里云证书更新
import certManageApi  from '@/api/monitor/certManage';
import {useRouter} from 'vue-router';
import CertList from './CertList.vue';
import tableRender from "@/composables/table/tableRender";
import {useRoute} from 'vue-router';

import CertImportLog from './CertImportLog.vue';
import CertUpdateLog  from './CertUpdateLog.vue';


const router = useRouter();
const route = useRoute();

const {
    getCertTimeLimit,
    getCertAllDataList,
} = certManageApi;
const TITLE_LAYER = 2;
const HOST_TITLE_LAYER = 3;

let updateCertState = reactive({
    currentDomainData: {}, // 当前域名的数据
    loading: false,
    certDataList: [],
    domain: route.query?.domain || null,
    activeType: null,
    activeChildrenType: null,
    initButton: [],
    initClumns: [],
    hostList: {
        initButton: [],
        initClumns: [],
    },
    timeLimit: {},

});
let  canUserAction = inject('canUserAction');



let certListRef = ref(null); // 用于引用 CertList 组件

const certListLoad = () => {
    certListRef.value && certListRef.value?.commitRequest({action:updateCertState.activeChildrenType, domain: updateCertState.domain, service: updateCertState.activeType});
};

// 判断证书是否用于上传，判断根据证书是否过期以及其到期天数>=提供的天数
const isPostCert = (row) => {
    const { expire_days } = row;
    const { post_date } = updateCertState?.timeLimit || { post_date: 20, update_date: 10 };
    return {
        disabled: expire_days < post_date,
        reason: expire_days < post_date ? `当前证书剩余${expire_days}天 < 限制${post_date}天，不能用于上传` : '',
    };
    
};

const handleQueryData = async (domain) => {
    let timeLimit  = await getCertTimeLimit() || {};
    updateCertState.timeLimit = timeLimit?.custom_data || { post_date: 20, update_date: 10 };
    updateCertState.domain = domain;
    updateCertState.loading = true;
    let res = await getCertAllDataList();
    updateCertState.certDataList = res || [];
    let formatRes = res.map(item => {
        if(item?.cert_list){
            item.cert_list = item.cert_list.map(cert => {
                cert.is_post_cert = isPostCert(cert);
                return cert;
            });

        }
        return item;
    });
    updateCertState.currentDomainData = formatRes.find(item => item.top_domain === domain) || {};
    updateCertState.loading = false;
    certListLoad();
   


};





// 不同云厂商的证书更新类型
const diffCloudType = {
    huawei_cert_update: {
        label: '华为云',
        value: 'huawei_cert_update',
        children: [
            {
                label: 'CDN',
                value: 'cdn_domain_list',
            
            },
            {
                label: 'WAF',
                value: 'waf_domain_list',
            },
            {
                label: 'ELB',
                value: 'elb_listener_list',
            },
        ]
    },
    ali_cert_update:{
        label: '阿里云',
        value: 'ali_cert_update',
        children: [
            {
                label: 'CDN',
                value: 'cdn_domain_list',
            },
            {
                label: 'WAF',
                value: 'waf_domain_list',
            },
        ]
    }
};

// 获取弹出框的容器
const getPopupContainer = () => document.getElementById('update-cert-box');

// 更新页面背景色
const updateMainContentBg = (bg) => {
    const mainContent = document.querySelector('.main-content');
    if(mainContent){
        mainContent.style.setProperty('background-color', bg);
    }
};

const renderDomainListBtn  = async () => {
    updateCertState.hostList.initClumns = [];
    updateCertState.hostList.initButton = [];
    const { button: host_button, columns: host_col } = await tableRender.setColumn({ layer: updateCertState.activeType === 'huawei_cert_update' ? HOST_TITLE_LAYER : 6 }); // 用于不同类型的域名列表
    updateCertState.hostList.initClumns = host_col.value || [];
    updateCertState.hostList.initButton = host_button.value || [];
};



onMounted(async () => {
    const { button, columns } = await tableRender.setColumn({ layer: TITLE_LAYER }); // 用于不同类型的证书

    updateCertState.initClumns = columns.value || [];
    updateCertState.initButton = button.value || [];
   
    updateCertState.activeType = button.value?.[0]?.field;
    updateCertState.activeChildrenType = diffCloudType[updateCertState.activeType]?.children?.[0]?.value;
    await renderDomainListBtn();

               
    handleQueryData(route.query?.domain);
    // 更新页面背景色
    updateMainContentBg('rgb(246 247 250)');
});

// 证书的列
const certTableColumns = computed(() =>  updateCertState.initClumns);
// 域名的列
const hostTableColumns = computed(() =>  updateCertState.hostList.initClumns);

// 选择证书
const handleSelectCert = (value) => {
    if (value) {
        handleQueryData(value);
        router.push({name: 'certificateManagementPage', query: {domain: value}});
    }
};

// 切换服务类型
const handleServiceChange = async (value) => {
    updateCertState.activeType = value;
    updateCertState.activeChildrenType = diffCloudType[value]?.children?.[0]?.value;
    await renderDomainListBtn();

    certListLoad();
};
// 不同云厂商的证书更新类型
/* const validateDomain = computed(() => {
    if (updateCertState.domain) {
        let domain = updateCertState.domain;
        return {
            huawei_cert_update:{
                cdn_domain_list: `sslcheck-cdn-hwy.${domain}`,
                waf_domain_list: `sslcheck-waf-hwy.${domain}`,
                elb_listener_list: `sslcheck-elb.${domain}`,
            },
            ali_cert_update:{
                cdn_domain_list: `sslcheck-cdn-ali.${domain}`,
                waf_domain_list: `sslcheck-waf-ali.${domain}`,
            }
        };
    }
    return '';
});
 */

onBeforeUnmount(() => {
    updateMainContentBg('white');
});




defineExpose({
    handleQueryData,
});


provide('updateCertState', updateCertState);
/* provide('validateDomain', validateDomain); */


</script>

<template>
    <div id="update-cert-box" >

        <a-page-header  @back="() => $router.push({name:'certificateManagementPage'})">
            <template #title>
              
                <a-flex style="font-size: inherit;">
                    证书更新&nbsp;&nbsp;
                    域名：
                    <a-select
                    v-model:value="updateCertState.domain"
                  
                    :style="{width: '500px', marginRight: '16px'}"
                    :get-popup-container="getPopupContainer"
                    placeholder="请选择证书"
                    @change="handleSelectCert"
                >
                <a-select-option v-for="cert in updateCertState.certDataList" :key="cert.top_domain" :value="cert.top_domain">
                 <!--    <template v-if="cert?.cert_list">
                        <span :class="{'text-error': cert?.cert_list[0]?.expire_days <= 0, 'text-warning': cert?.cert_list[0]?.expire_days < 20 && cert?.cert_list[0]?.expire_days > 0}">{{ top_domain }}</span>
                        <span v-show="cert?.cert_list[0]?.expire_days < 20 && cert?.cert_list[0]?.expire_days > 0" class="text-warning">【剩余{{expire_days}}天到期】</span>
                        <span v-show="cert?.cert_list[0]?.expire_days <= 0" class="text-error">【已过期 <b>{{cert?.cert_list[0]?.expire_days.toString().indexOf('-') > -1 ? cert?.cert_list[0]?.expire_days.toString().split('-')[1] : cert?.cert_list[0]?.expire_days }}</b> 天】</span>
                    </template>
                    <template v-else>
                       

                    </template> -->
                   <a-row justify="space-between">
                        <a-flex>{{ cert.top_domain }}</a-flex>
                        <a-flex v-if="cert?.cert_list?.length">（相关证书共 <b> {{ cert?.cert_list?.length }} </b> 条）</a-flex>
                   </a-row>
                    

                </a-select-option>
               
                </a-select>

                <!-- <span v-if="updateCertState.currentDomainData && Object.keys(updateCertState.currentDomainData).length && !canUpdateDomain.canUpdate" class="text-error"> &nbsp;&nbsp;<i class="vxe-icon-warning-triangle-fill "></i> 不能更新证书({{canUpdateDomain.reason}}) </span> -->
                </a-flex>
                

            </template>
            
            <template #footer>
                
                <template v-if="updateCertState.initButton.length">
                        <a-tabs v-model:activeKey="updateCertState.activeType" type="card" @change="handleServiceChange">
                            <a-tab-pane  v-for="{ field } in updateCertState.initButton" :key="field" >
                                    <template #tab>
                                        <cloud-type-icon :type="diffCloudType?.[field]?.label" class="xy-w-2 xy-font-size-20"></cloud-type-icon>{{ diffCloudType?.[field]?.label }}
                                    </template>
                                    <a-tabs v-model:activeKey="updateCertState.activeChildrenType"  style="margin-top: 10px;"  @change="certListLoad" >
                                        <a-tab-pane v-for="{value: val, label:item} in diffCloudType?.[field].children" :key="val"  :tab="item" >
                                        </a-tab-pane>
                                        <template #rightExtra>
                                            <CertImportLog v-if="canUserAction?.import_cert_log" :service="field"/>
                                           
                                            <CertUpdateLog v-if="canUserAction?.update_cert_log" :service="field"/>
                                          
                                        </template>
                                    </a-tabs>

                                </a-tab-pane>
                        </a-tabs>
                    <cert-list ref="certListRef" :columns="certTableColumns" :service="updateCertState.activeType" :action="updateCertState.activeChildrenType" :host-columns="hostTableColumns" :cert-sid="$route.query.domain"></cert-list>
                </template>
                <a-empty v-else>
                    <template #description>
                        <span>暂无权限更新相关云类型证书，请联系相关人员开启其权限~~</span>
                    </template>
                </a-empty>
                
            </template>
        </a-page-header>
        <a-divider/>
  </div>
</template>

<style scoped lang="less">
#update-cert-box {
    .xy-font-size-20 {
        font-size: 20px;
    }
    .xy-font-size-40 {
        font-size: 30px;
    }
    
}
</style>



