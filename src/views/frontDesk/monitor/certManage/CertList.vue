<script setup>
import certManageApi from '@/api/monitor/certManage';
import OpsTable from '@/components/OpsTable/index.vue';
import CertImport from './CertImport.vue';
import userOperate from "@/composables/form/opsUserOperate";
import CertStartUpdate from './CertStartUpdate.vue';
import { groupBy } from 'xe-utils';


const props = defineProps({
    columns: {
        type: Array,
        default: () => [],
    },
    service: {
        type: String,
        default: '',
    },
    action: {
        type: String,
        default: 'cdn_domain_list',
    },
    hostColumns: {
        type: Array,
        default: () => [],
    },
    certSid:{
        type: [String, Number],
    }
});

let certState = reactive({
    cert_list: [],
    host_list: [],
    loading: false,
    fullData: [],
    currentSearchParams: {},
    certFilter: 'valid',
    title_data:{},
});

let updateCertState = inject('updateCertState');
// 已停用的证书也不能更新
const isDisabledCert = (row) => {
    return row.d_status === 'offline' || row.status === 'offline'  ? '已停用的域名不能更新证书' : props?.service ==='ali_cert_update' && props?.action === 'waf_domain_list' && !row?.cert_name ? '没有证书名称的不能更新证书' : '';
};
/** 不能更新证书的条件及原因
 * 1、到期时间 < 维护的时间 并且有更新的证书
 * 2、到期时间 < 0
 * 3、证书没有验证域名
 * **/
// 全局当前域名的数据证书决定其是否可以更新
const canUpdateDomain = computed(() => {
    let result = {
        canUpdate: true,
        reason: ''
    };
    const { expire_days, latest_cert } = checkBoxCheckCert.value?.radio || {}; // latest_cert = 1 表示有更新的证书
    const { update_date } = updateCertState.timeLimit;
    if (!checkBoxCheckCert.value?.radio) {
        result.canUpdate = false;
        result.reason = '请先选择需更新的目标SCM证书才能进行证书的更新';
    } else{
        if (!expire_days) {
            result.canUpdate = false;
            result.reason = '证书没有到期时间';
        } else if (expire_days < 0) {
            result.canUpdate = false;
            result.reason = '证书已经到期';
        } else if (expire_days < update_date && latest_cert) {
            result.canUpdate = false;
            result.reason = `到期时间 < ${update_date} 天且有比它更新的证书`;
        }
    }
    
    return result;
});
//let validateDomain = inject('validateDomain');

/* let canUpdate = reactive({
    isDisabledCert,
    canUpdateDomain,

}); */
/* let canUpdateHwyCert = computed(
    () => (
        {
            status: certState.host_list.length > 0 && certState.host_list.find(item => item.host_name === validateDomain.value?.huawei_cert_update?.[props.action]) ? true : false, 
            reason: certState.host_list.length > 0 && certState.host_list.find(item => item.host_name === validateDomain.value?.huawei_cert_update?.[props.action]) ? '':`缺少检测域名${validateDomain.value?.huawei_cert_update?.[props.action]}`
        }
    )
); */

let isDisabledUpdateBtn = computed(() => {
    return {
        disabled: !canUpdateDomain.value?.canUpdate,
        tip: () => {
            
            if (!canUpdateDomain.value?.canUpdate) {
                return canUpdateDomain.value?.reason;
            }
            return '';
        }
    };
});


// 表格引用
const certTableRef = ref(null);
const hostTableRef = ref(null);

// 共用第一块的title
const diffActionTypeblock = {
    'huawei_cert_update': {
        'common': 1,
        'cdn_domain_list': {
            block: {
                cert_block: 2,
                host_block: 2,
            },
            hide: ['cert_type', 'region'],
            hostHide: [],
            certText:`SCM证书`,
            canCertImport: false,
            canCertUpdate: false,
            importAction: {
                action: 'scm_import_cert',
                title: 'SCM证书导入'
            },
            updateAction: {
                action: 'update_cdn_cert',
                title: '华为云CDN域名证书更新',
                service: 'CDN',
                type_domain:`hw_cdn_${updateCertState?.domain}`
            }
        },
        'waf_domain_list': {
            block: {
                cert_block: 3,
                host_block: 3,
            },
            hide: ['description'],
            hostHide: [],
            certText:`WAF证书`,
            canCertImport: false,
            canCertUpdate: false,
            importAction: {
                action: 'waf_or_elb_import_cert',
                title: 'WAF证书导入',
                service: 'WAF'
            },
            updateAction: {
                action: 'update_waf_cert',
                title: '华为云WAF域名证书更新',
                service: 'WAF',
                type_domain:`hw_waf_${updateCertState?.domain}`
            }
        },
        'elb_listener_list': {
            block: {
                cert_block: 4,
                host_block: 4,
            },
            hide: ['enterprise_project', 'exp_status'],
            hostHide: ['host_id', 'host_name'],
            certText:`ELB证书`,
            canCertImport: false,
            canCertUpdate: false,
            importAction: {
                action: 'waf_or_elb_import_cert',
                title: 'ELB证书导入',
                service: 'ELB'
            },
            updateAction: {
                action: 'update_elb_cert',
                title: '华为云ELB域名证书更新',
                service: 'ELB',
                type_domain:`hw_elb_${updateCertState?.domain}`
            }
        },
    },
    'ali_cert_update': {
        'common': 1,
        'cdn_domain_list': {
            block: {
                cert_block: 5,
                host_block: 2,
            },
            hide: ['cert_type', 'region', 'enterprise_project', 'exp_status', 'enterprise_project_id', 'description'],
            hostHide: [],
            certText:`SSL证书`,
            canCertImport: false,
            canCertUpdate: false,
            importAction: {
                action: 'ssl_import_cert',
                title: 'SSL证书导入'
            },
            updateAction: {
                action: 'update_cdn_cert',
                title: '阿里云CDN域名证书更新',
                service: 'CDN',
                type_domain:`ali_cdn_${updateCertState?.domain}` 
            }
        },
        'waf_domain_list': {
            block: {
                cert_block: 6,
                host_block: 3,
            },
            hide: ['description','cert_type','region','enterprise_project_id','enterprise_project', 'exp_status',],
            hostHide: ['name'],
            certText:`SSL证书`,
            canCertImport: false,
            canCertUpdate: false,
            importAction: {
                action: 'ssl_import_cert',
                title: 'SSL证书导入',
                service: 'WAF'
            },
            updateAction: {
                action: 'update_waf_cert',
                title: '阿里云WAF域名证书更新',
                service: 'WAF',
                type_domain:`ali_waf_${updateCertState?.domain}` 
            }
        },
      
    }
};

// 表格配置
const tableConfig = {
    showSearch: true,
    authBtn: { 
        add: { page_display: false }, 
        edit: { page_display: false }, 
        del: { page_display: false }
    },
    requestConfig: {
        immediate: true,
        autoLoad: true
    }
};

// 证书表格配置
const certTableConfig = {
    ...tableConfig,
    radioConfig: {
        highlight: true,
        reserve: true,
        visibleMethod ({ row }) {
            const expireTime = new Date(row.expire_time);
            return expireTime > new Date();
        }
    },
    rowConfig:{
        'keyField': 'cert_id'
    }
};

// 主机表格配置
const hostTableConfig = {
    ...tableConfig,
    checkboxConfig: {
        highlight: true,
        reserve: true,
        visibleMethod: ({row}) => {
            return !isDisabledCert(row); // 已停用的证书不能勾选
        }
    },
    rowConfig:{
        'keyField': 'host_id'
    }
};

// SCM证书列表
let certClumns = computed(() => {
    const columns = props.columns.filter(col => {
        let { field, title_data } = col;
       
        let dataSourceField = ['domain_status', 'certificate_type', 'https_status', 'region_id', 'enterprise_project_id', 'status','cloud_master_account_id', 'exp_status',];
        if (dataSourceField.includes(field)) {
            certState.title_data[field] = title_data?.[field];
            col.formatter = ({ cellValue }) => {
                return title_data?.[field]?.[cellValue] || cellValue;
            };
        }
        let slotsField = ['expire_time', 'subject_alternative_names','cloud_master_account_id'];
        if (slotsField.includes(field)) {
            col.slots = {
                default: field
            };
            col.showOverflow = false;
        }
        return (col.oriTitle.block === diffActionTypeblock?.[props.service].common && !diffActionTypeblock?.[props.service]?.[props.action]?.hide.includes(col.field)) || col.oriTitle.block === diffActionTypeblock?.[props.service]?.[props.action]?.block.cert_block;
    });
    return [{ type: 'radio', title: '证书选择',field:'custom_select_cert', width: 100},...columns];
});

// 证书绑定的主机列表
let hostListClumns = computed(() => {
    const columns = props.hostColumns.filter(col => {
        let { field, title_data } = col;
        let dataSourceField = ['domain_status', 'certificate_type', 'https_status', 'region_id', 'status','enterprise_project_id','cloud_master_account_id'];
        let slotsField = ['expiration_time', 'cert_expire_tconsoleime','cloud_master_account_id', 'status', 'host_name','cert_name'];
        if (dataSourceField.includes(field)) {
            certState.title_data[field] = title_data?.[field];
            col.formatter = ({ cellValue, row }) => {
                if(field === 'region_id') {
                    if(props.action === 'waf_domain_list') {
                        row.region_name = title_data?.[field] && groupBy(title_data?.[field], 'projects_id')?.[cellValue]?.[0]?.name || cellValue;
                    };
                    return title_data?.[field] && groupBy(title_data?.[field], 'projects_id')?.[cellValue]?.[0]?.cn_name || cellValue;
                }
                return title_data?.[field]?.[cellValue] || cellValue;
            };
        }
        if (slotsField.includes(field)) {
            col.slots = {
                default: field
            };
           
        }
        return (col.oriTitle.block === diffActionTypeblock?.[props.service]?.common && !diffActionTypeblock?.[props.service]?.[props.action]?.hostHide.includes(col.field)) || col.oriTitle.block === diffActionTypeblock?.[props.service]?.[props.action]?.block.host_block;
    });
    return [diffActionTypeblock?.[props.service]?.[props.action].canCertUpdate &&  { type: 'checkbox', title: '选择更新证书',field:'custom_select_update_cert', width: 120} ,...columns];
});

// Add computed property for filtered certificates
const filteredCertList = computed(() => {
    if (certState.certFilter === 'valid') {
        return certState.cert_list.filter(cert => {
            const expireTime = new Date(cert.expire_time);
            return expireTime > new Date();
        });
    } else if (certState.certFilter === 'expired') {
        return certState.cert_list.filter(cert => {
            const expireTime = new Date(cert.expire_time);
            return expireTime <= new Date();
        });
    } else {
        return certState.cert_list;
    }
});

const handleDataLoad = async (params) => {
    certState.loading = true;
    certState.currentSearchParams = params;
    certState.certFilter = 'valid';
    certTableRef.value?.getDom?.()?.reloadData?.([]);
    hostTableRef.value?.getDom?.()?.reloadData?.([]);
    try {
        const response = await certManageApi.getHuaweiCertList(params);
        if (response) {
            const { cert_list = [], host_list = [] } = response;
            certState.cert_list = cert_list;
            certState.host_list = host_list.map(item => {
                if(props.action === 'waf_domain_list') {
                    item.region_name = certState.title_data?.['region_id'] && groupBy(certState.title_data?.['region_id'], 'projects_id')?.[item?.['region_id']]?.[0]?.name || '';
                };
                return item;
            });
            certState.fullData = [...cert_list, ...host_list];
            
            // 强制更新表格数据
            nextTick(() => {
                
                if (certTableRef.value?.commitRequest) {
                    certTableRef.value.commitRequest();
                }
                if (hostTableRef.value?.commitRequest) {
                    hostTableRef.value.commitRequest();
                }
            });

        }
    } catch (error) {
        nextTick(() => {
            certTableRef.value?.getDom?.()?.reloadData?.([]);
            hostTableRef.value?.getDom?.()?.reloadData?.([]);
        });
    } finally {
        certState.loading = false;
    }
};

// 监听数据变化
watch(() => certState.cert_list, (newVal) => {
    if (newVal?.length && certTableRef.value?.commitRequest) {
        nextTick(() => {
            certTableRef.value.commitRequest();
        });
    }
}, { deep: true });

// 监听过滤条件变化
watch(() => certState.certFilter, () => {
    nextTick(() => {
        if (certTableRef.value?.commitRequest) {
            certTableRef.value.commitRequest();
        }
    });
});

watch(() => certState.host_list, (newVal) => {
    if (newVal?.length && hostTableRef.value?.commitRequest) {
        nextTick(() => {
            hostTableRef.value.commitRequest();
        });
    }
}, { deep: true });

watch(() => updateCertState?.hostList?.initButton, (newVal) => {
    if (newVal?.length ) {
        for (let btn of newVal) {
            let { field } = btn;
            switch (field) {
                case 'scm_import_cert': // 证书导入
                    diffActionTypeblock[props.service].cdn_domain_list.canCertImport = btn;
                    break;
                case 'ssl_import_cert': // SSL证书导入
                    diffActionTypeblock[props.service].cdn_domain_list.canCertImport = btn;
                    diffActionTypeblock[props.service].waf_domain_list.canCertImport = btn;
                    break;
                case 'waf_or_elb_import_cert':// 证书导入
                    diffActionTypeblock[props.service].waf_domain_list.canCertImport = btn;
                    diffActionTypeblock[props.service].elb_listener_list.canCertImport = btn;
                    break;
                case 'update_cdn_cert': //
                    diffActionTypeblock[props.service].cdn_domain_list.canCertUpdate = btn;
                    break;
                case 'update_waf_cert':
                    diffActionTypeblock[props.service].waf_domain_list.canCertUpdate = btn;
                    break;
                case 'update_elb_cert':
                    diffActionTypeblock[props.service].elb_listener_list.canCertUpdate = btn;
                    break;
    
              
            }
        }
        
    }
}, { deep: true,immediate: true });


// 用户操作相关
const { userEdit, formOpen, formType } = userOperate({});

let radioSelectData = ref(null);
// 处理证书选择
const handleCertSelect = () => {
    radioSelectData.value = certTableRef.value?.tableRadioCheckedAll?.();
    // 这里可以添加证书选择后的处理逻辑
};

let checkboxCertData = ref([]);
// 处理主机选择
const handleHostSelect = () => {
    checkboxCertData.value = hostTableRef.value?.tableCheckboxCheckedAll?.();
};

const checkBoxCheckCert = computed(() => {
    return {
        checkbox: checkboxCertData.value || [],
        radio: radioSelectData.value || null,
    };
});

watch(() => props.action, () => {
    certTableRef.value?.clearRadioCheck?.();
    radioSelectData.value = null;
    checkboxCertData.value = [];

    hostTableRef.value?.clearCheckBox?.();
});

// 处理证书更新
let startCertUpdateOpen = ref(false);
let startCertUpdateData = ref({});
let startCertUpdateWay = ref(''); // 更新证书的类型
//let isSelectTestDomain = ref(false); // 是否选择测试域名
const handleCertUpdate = (row, way) => {
    startCertUpdateOpen.value = true;
    startCertUpdateWay.value = way;

    if (way === 'single') {
        startCertUpdateData.value = row;
        hostTableRef.value?.clearCheckBox?.();
    }
    if (way === 'batch') {
        startCertUpdateData.value = {};
    }
    /* Modal.confirm({
            title: '证书更新',
            icon: createVNode(ExclamationCircleOutlined),
            content: '是否选择测试域名进行证书更新？',
            okText: '是',
            cancelText: '否',
            onOk() {
                startCertUpdateOpen.value = true;
                isSelectTestDomain.value = true;
            },
            onCancel() {
                startCertUpdateOpen.value = true;
                isSelectTestDomain.value = false;
            },
        }); */
  
};


defineExpose({
    commitRequest: (params) => {
        handleDataLoad(params); // 调用 handleDataLoad 来加载数据
    }
});


</script>

<template>
    <a-spin :spinning="certState.loading">
        <a-divider><b>{{diffActionTypeblock?.[props.service]?.[props.action].certText}}</b></a-divider>
        
        <div class="mb-4">
            <a-radio-group v-model:value="certState.certFilter" button-style="solid">
                <a-radio-button value="valid">有效证书</a-radio-button>
                <a-radio-button value="all">全部证书</a-radio-button>
                <a-radio-button value="expired">过期证书</a-radio-button>
                
            </a-radio-group>
        </div>
        

        <ops-table
            ref="certTableRef"
            v-model:columns="certClumns"
            :data="filteredCertList"
            v-bind="certTableConfig"
            @refresh="() => handleDataLoad({ action: props.action,domain: $route.query.domain, service: props.service})"
            @radio-change="({ row }) => handleCertSelect(row)"
        >
           <template #other_toolbar_buttons_left>
                 <vxe-button v-if="diffActionTypeblock?.[props.service]?.[props.action].canCertImport" status="primary"  :content="`${diffActionTypeblock?.[props.service]?.[props.action].certText}导入`" @click="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"/>
           </template>
            <template #expire_time="{ row }">
               <a-tooltip placement="top">
                    <template #title>
                        证书过期时间：{{ row.expire_time }}
                    </template>
                    <span v-if="row.expire_days > 0">剩余{{ row.expire_days }}天到期</span>
                    <span v-else class="text-error" >已过期</span>
                </a-tooltip>
            </template>
            <template #subject_alternative_names="{ row }">
                <span v-if="row.subject_alternative_names">
                <template v-if="Array.isArray(row.subject_alternative_names)">
                    <template v-for="i in row.subject_alternative_names" :key="i">
                        <a-tag color="green">{{i}}</a-tag><br />
                    </template>
                </template>
                <template v-else>
                    {{row.subject_alternative_names}}
                </template>
            </span>
            </template>
            <template #cloud_master_account_id="{row}">
                {{ certState.title_data?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
             </template>
           
        </ops-table>

        <a-divider>域名列表</a-divider>
     
        <ops-table
            ref="hostTableRef"
            v-model:columns="hostListClumns"
            :data="certState.host_list"
            v-bind="hostTableConfig"
            @refresh="() => handleDataLoad({ action: props.action,domain: $route.query.domain, service: props.service})"
            @checkbox-change="handleHostSelect"
            @checkbox-all="handleHostSelect"
        >
            <template #other_toolbar_buttons_left>
                <a-tooltip v-if="diffActionTypeblock?.[props.service]?.[props.action].canCertUpdate" > 
                    <template v-if="isDisabledUpdateBtn.tip() || checkBoxCheckCert.checkbox.length === 0 || !checkBoxCheckCert.radio" #title>  
                        <i class="vxe-icon-warning-triangle-fill "></i> 
                            <template v-if="isDisabledUpdateBtn.tip()">{{ isDisabledUpdateBtn.tip() }}</template>
                            <template v-else-if="!checkBoxCheckCert.radio">请先选择需更新的目标{{diffActionTypeblock?.[props.service]?.[props.action]?.certText}}才能进行证书的更新</template>

                            <template v-else-if="checkBoxCheckCert.checkbox.length === 0">请选择需更新的证书</template>
                    </template>
                    
                    <vxe-button  :disabled="isDisabledUpdateBtn.disabled || checkBoxCheckCert.checkbox.length === 0 || !checkBoxCheckCert.radio"  status="primary"  content="批量更新" @click="handleCertUpdate(row, 'batch')"/>
                </a-tooltip>
                <span v-if="!checkBoxCheckCert.radio && diffActionTypeblock?.[props.service]?.[props.action].canCertUpdate"  class="text-error ml-2">    <i class="vxe-icon-warning-triangle-fill "></i>  * 请先选择需更新的目标{{diffActionTypeblock?.[props.service]?.[props.action]?.certText}}才能进行证书的更新</span>
   
           </template>
           <template #other_operation="{row}">
            <a-tooltip v-if="diffActionTypeblock?.[props.service]?.[props.action].canCertUpdate" >
                <template v-if="isDisabledUpdateBtn.tip() || !checkBoxCheckCert.radio || isDisabledCert(row)" #title>  
                    <i class="vxe-icon-warning-triangle-fill "></i> 
                        <template v-if="isDisabledUpdateBtn.tip()">{{ isDisabledUpdateBtn.tip() }}</template>
                        <template v-else-if="!checkBoxCheckCert.radio">请先选择需更新的目标{{diffActionTypeblock?.[props.service]?.[props.action]?.certText}}才能进行证书的更新</template> 
                        <template v-if="isDisabledCert(row)">
                            {{ isDisabledCert(row) }}

                        </template> 
                </template>
                <vxe-button  :disabled="isDisabledUpdateBtn.disabled ||  !checkBoxCheckCert.radio || isDisabledCert(row) ? true : false"  status="primary"  content="重新更新" @click="handleCertUpdate(row, 'single')"/>

            </a-tooltip>
            

           </template>
            <template #expiration_time="{ row }">
                <ops-expired-time :expired-time="String(row.expiration_time)" />
            </template>
            <template #cloud_master_account_id="{row}">
                {{ certState.title_data?.cloud_master_account_id?.[row.cloud_master_account_id]?.page_display || '' }}
            </template>
            <template #status="{row}">
               <span :class="{'text-error': row.status === 'offline'}"> {{ certState.title_data?.status?.[row.status] || row.status }}</span>

            </template>
            <template #host_name="{ row }">
                <a-tooltip placement="topLeft">
                    <template #title>
                        <ops-copy-content :content="row.host_id" type="text" style="color: #fff;" >{{ row.host_id }}</ops-copy-content>           
                    </template>
                    <span >{{ row.host_name }}</span>
                </a-tooltip>
            </template>
            <template #cert_name="{ row }">
                <a-tooltip placement="topLeft">
                    <template #title>
                        <ops-copy-content :content="row.cert_id" type="text" style="color: #fff;" ></ops-copy-content>           
                    </template>
                    <span>{{ row.cert_name }}</span>
                </a-tooltip>
            </template>

            <template #cert_expire_time="{ row }">
                
                <ops-expired-time :expired-time="String(row.cert_expire_time)" />
            </template>
          
        </ops-table>
    </a-spin>
    <CertImport  
        v-model:open="formOpen"
        :cert-sid="props.certSid" 
        :form-type="formType"
        :title="`${diffActionTypeblock?.[props.service]?.[props.action].certText}导入`"
        :action="props.action"
        :service="props.service"
        :import-action="diffActionTypeblock?.[props.service]?.[props.action].importAction"
        @edit-success="() => handleDataLoad({ action: props.action,domain: $route.query.domain, service: props.service})"
    />
    <CertStartUpdate
        v-model:open="startCertUpdateOpen"
        :data="startCertUpdateData"
        :check-data="checkBoxCheckCert"
        :host-list="certState.host_list"
        :ways="startCertUpdateWay"
        :service="props.service"
        :update-action="diffActionTypeblock?.[props.service]?.[props.action].updateAction"
        @edit-success="() => handleDataLoad({ action: props.action,domain: $route.query.domain, service: props.service})"
    >
    </CertStartUpdate>
</template>

<style scoped>
.vxe-grid {
    margin: 20px 0;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background: #fff;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.vxe-grid:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

:deep(.vxe-table) {
    border-radius: 8px;
    overflow: hidden;
}

:deep(.vxe-table--header-wrapper) {
    background: linear-gradient(to right, #f8f9fa, #ffffff);
    border-bottom: 2px solid #e9ecef;
}

:deep(.vxe-table--body-wrapper) {
    background: #ffffff;
}

:deep(.vxe-table--row) {
    transition: background-color 0.3s ease;
}

:deep(.vxe-table--row:hover) {
    background-color: #f8f9fa;
}

:deep(.ant-divider) {
    margin: 24px 0;
    font-size: 16px;
    font-weight: 500;
    color: #2c3e50;
}

:deep(.ant-spin-nested-loading) {
    padding: 20px;
    background: #f8f9fa;
    border-radius: 12px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.vxe-table--header) {
    font-weight: 600;
    color: #2c3e50;
}

:deep(.vxe-table--body) {
    color: #4a5568;
}

:deep(.vxe-table--row-striped) {
    background-color: #f8f9fa;
}
</style>


