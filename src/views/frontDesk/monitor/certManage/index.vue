<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import certManageApi  from '@/api/monitor/certManage';
import subPage from "@/composables/subPage";
import moment from "moment";
import UpdateCert from "./UpdateCert.vue";
import {useRouter} from 'vue-router';

const props = defineProps({
    domain: { // 证书的顶级域名
        type: String,
        default: ''
    },
});

const router = useRouter();

const {
    getCertAllDataList,
    getCertOneList,
    getCertUserList,
} = certManageApi;

const TITLE_LAYER = 1;
const CERT_STATUS_COLOR = [
    {
        value: 1,
        label: '有效证书',
        color: '#67c23a', 
    },   
    {
        value: 'all',
        label: '全部证书',
        color: '#666666',
    }, 
    {
        value: 0,
        label: '过期证书',
        color: '#fb6340',
    }, 
];

// 状态管理
const tableRef = ref(null);
const state = reactive({
    initColumn: [],
    initButton: [],
    initTitleData: [],
    fullData: [],
    filterConditions: {
        status: null,
    },
  
    userList: [],
    subPageColumns: [],
});

// 用户操作相关
const { userEdit, userDel, formOpen, formType, formSid } = userOperate({});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'virtual_team_v3_id':
                col.showOverflow = false;
                break;
            case 'labels':
                col['minWidth'] = '180';
                delete col.showOverflow;
                col.slots = {default: field};
                break;
            case 'cloud_master_account_id':
                col.slots =  {
                    default: field,
                };
                col.minWidth = 180;
                col.showOverflow = false;
                break;
            case 'expire_days':
                col['minWidth'] = '150';
                break;
            case 'certificate_id':
                col.slots =  {
                    default: field,
                };
                break;
            case 'id':
            case 'snis':
            case 'status':
            case 'cert_list': // 域名相关的证书列表
                col.showOverflow = false;
                col.slots = {
                    default: field
                };
                break;
            case 'top_domain':
                col.slots = {
                    default: field
                };
                break;

            case 'expire_time':
            case 'update_time':
                
                col.showOverflow = 'ellipsis';
                break;
        }
    }
    return state.initColumn;
});


// 用于获取用户的操作权限
const canUserAction = computed(() => {
    let result = {};
    if (state.initButton) {
       
        for (let btn of state.initButton) {
            let { field } = btn;
            switch (field) {
                case 'edit':
                case 'add':
                case 'check_cert': // 证书验证
                case 'update_cert_log': // 证书更新日志
                case 'import_cert_log': // 证书上传日志
                    result[field] = btn;
                    break;
                case 'delete':
                    result['del'] = btn;
                    break;
    
              
            }
        }
    }
    return result;
});

onMounted(async () => {
    const { button, columns, title_data, sub_page_columns } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || [];
    state.subPageColumns = sub_page_columns || [];

    // 获取用户列表
    state.userList = await getCertUserList();
    handleStatusFilter('all');
});

// 表格数据的获取
const handleDataRefresh = async () => {
    if (tableRef.value) {
        await tableRef.value.commitRequest();
    }
};

// 用户新增编辑操作
const handleUserEdit = ({type, row}) => {
    userEdit({type: type, sid: row.id});
};

// 用户删除操作
const handleUserDel = (row) => {
    userDel({ delApi: certManageApi.deleteCert, sid: row.id,  loadData: handleDataRefresh });
};



// 状态统计
const statusCount = (key) => {
    return key !== 'all' ? state.fullData.reduce((sum, item) => sum + item.cert_list.filter(item => item.status === key).length, 0) : state.fullData.reduce((sum, item) => sum + item.cert_list.length, 0);
};

// 状态过滤
const handleStatusFilter = (key) => {
    if(key === 'all') {
        state.filterConditions.status = null;
    } else {
        state.filterConditions.status = key;
    }
    // 切换后等待 DOM 更新再触发表格自适应
    nextTick(() => {
        if (tableRef.value && tableRef.value?.getDom()) {
            tableRef.value?.getDom()?.recalculate?.(true);
        }
    });
};

// 更新表格数据
const updateFullData = (data) => {
    console.log(data, 888);
    state.fullData = data;
};
// 返回表格行样式
const rowStyle = ({row}) => {
    let allDay = moment(row.expire_time).diff(row.start_time, 'days');
    let percent = row.expire_days / allDay * 100; // 计算过期百分比
    return {
        percent
    };
};


// 子页面相关
const {
    subPageOpen,
    subPageRow,
    handleSubPageOpen,
} = subPage();

let startCertUpdate = ref(null); // 开启证书更新的模式
let updateCertRef = ref(null); // 证书更新组件的引用
// 处理不同类型的证书进行更新
const handleUpdateDiffType = (row) => {
    startCertUpdate.value = row;
    router.push({ name: 'certificateManagementPage', query: { domain: row.top_domain } });
};





const getProgressColor = (expireDays) => {
    if (expireDays <= 30) {
        return '#f56c6c'; // 红色 - 30天内过期
    } else if (expireDays <= 90) {
        return '#e6a23c'; // 黄色 - 90天内过期
    }
    return '#67c23a'; // 绿色 - 正常
};

provide('canUserAction', canUserAction);
provide('domain', props.domain);
</script>

<template>
    
   
    <update-cert v-if="$route.query.domain" ref="updateCertRef"/>

    <!-- 主表格部分 -->
    <ops-table
        v-else
        ref="tableRef"
        :columns="initTableColumns"
        :auth-btn="canUserAction"
        :request-config="{
            api: getCertAllDataList,
            immediate: true
        }"
       
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
        @update:full-data="updateFullData"
    >
        <!-- 表格插槽 -->
        <template #topPrefix>
           <div class="w-full mb-1">
                <a-badge 
                    v-for="({value: key, color,label}, idx) in CERT_STATUS_COLOR" 
                    :key="key" 
                    :count="statusCount(key)" 
                    :overflow-count="Infinity" 
                    :number-style="{backgroundColor: key !=='all'? color : `var(--primary-color)`}" 
                    size="small"
                >
                    <a-button 
                        :class="{'ml-3': idx !== 0}"
                        class="xy-13"
                        type="primary"
                        :ghost="!(state.filterConditions.status === key || (key === 'all' && state.filterConditions.status === null))"
                        :disabled="!statusCount(key) && key !== 'all'"
                        @click="handleStatusFilter(key)"
                    >
                        {{ label }}
                    </a-button>
                </a-badge>
              <a-divider/>
           </div>
           
           
        </template>

        <template #id="{ row }">
            <a-tooltip placement="topLeft">
                <template #title>
                    <a-typography-paragraph :copyable="{ tooltip: false}" class="copy-text">{{ row.certificate_id
                        }}</a-typography-paragraph>
                </template>
                <span class="cursor-pointer text-primary" @click="handleSubPageOpen(row)">{{ row.id }}</span>
            </a-tooltip>
        </template>

        <template #snis="{ row }">
            <span v-if="row.snis">
                <template v-if="Array.isArray(row.snis)">
                    <template v-for="i in row.snis" :key="i">
                        <a-tag color="green">{{i}}</a-tag><br />
                    </template>
                </template>
                <template v-else>
                    {{row.snis}}
                </template>
            </span>
        </template>

        <template #labels="{ row }">
            <template v-if="row.labels">
                <template v-for="(val, key) in row.labels" :key="key">
                    <a-tag v-if="key !== `validity_end` && key !== `validity_start`" class="block">
                        <b class="text-primary">{{key}}</b>: <span class="text-error">{{val}}</span>
                    </a-tag>
                </template>
            </template>
        </template>
        <template #cloud_master_account_id="{ row }">
            <template v-if="Array.isArray(row.cloud_master_account_id)">
                <template v-for="item in row.cloud_master_account_id" :key="item">
                    <a-tooltip v-if="state.initTitleData?.cloud_master_account_id && $utils.groupBy(state.initTitleData?.cloud_master_account_id, 'id')?.[item]" placement="topLeft" class="mb-2">
                    <template #title>
                        <a-typography-paragraph :copyable="{ tooltip: false}" class="copy-text">{{ $utils.groupBy(state.initTitleData?.cloud_master_account_id, 'id')?.[item]?.[0]?.access_key || ''
                            }}</a-typography-paragraph>
                    </template>
                    <a-tag class="xy-tag-2">
                        <cloud-type-icon :type="$utils.groupBy(state.initTitleData?.cloud_master_account_id, 'id')?.[item]?.[0]?.cloud_type" class="xy-w-2"></cloud-type-icon>
                        {{ $utils.groupBy(state.initTitleData?.cloud_master_account_id, 'id')?.[item]?.[0]?.page_display || ''  }} 
                        {{ $utils.groupBy(state.initTitleData?.cloud_master_account_id, 'id')?.[item]?.[0]?.username || ''  }}
                    </a-tag>
                </a-tooltip> 
                </template>
            </template>
            <template v-else>
                {{ row.cloud_master_account_id }}
            </template>
        </template>

        <template #status="{ row}">
            <vxe-tag :status="row.status ? 'success': 'error'" size="small">
                {{ (state.initTitleData.status && state.initTitleData.status[row.status]) ?
                state.initTitleData.status[row.status] : row.status}}
            </vxe-tag>
        </template>
        <template #update_name_id="{ row }">
           {{ $utils.groupBy(state.userList, 'id')?.[row.create_name_id]?.[0]?.username || row.create_name_id }}<br/>
           {{ $utils.groupBy(state.userList, 'id')?.[row.update_name_id]?.[0]?.username || row.update_name_id }}
        </template>
        <template #certificate_id="{ row }">
           <span class="cursor-pointer text-primary" @click="handleUpdateDiffType(row)"> {{ row.certificate_id }}</span>
        </template>
        <template #top_domain="{ row }">
           <span class="cursor-pointer text-primary" @click="handleUpdateDiffType(row)"> {{ row.top_domain }}</span>
        </template>

        <template #cert_list="{row}">
            <template v-if="row.cert_list">
                <template v-for="(cert) in row.cert_list" :key="cert.id">
                    <div v-if="cert.status === state.filterConditions.status || state.filterConditions.status === null " class="cert-item">
                        <div class="progress-wrapper cursor-pointer"  :title="`${cert.cert_name}\n 证书有效期：${cert.start_time} 至 ${cert.expire_time}`"  @click="handleSubPageOpen(cert)">
                          <span class="cert-name">{{cert.cert_name}}</span>
                          <a-progress 
                                :percent="rowStyle({row: cert}).percent"
                                :trail-color="'#c6c2c2'"
                                :stroke-color="getProgressColor(cert.expire_days)"
                                :show-info="false"
                                :size="[20, 30]"
                                stroke-linecap="square" 
                            >
                                <template #default>
                                    <span class="cert-name">{{ cert.cert_name }}</span>
                                </template>
                            </a-progress>
                            <span class="expire-days" :style="{ color: getProgressColor(cert.expire_days) }">
                                <span v-if="cert.expire_days >= 0 ">
                                    剩余 <span class="w-5 inline-block text-center">{{cert.expire_days}}</span> 天
                                </span>
                                <span v-else>
                                    已过期 {{ String(cert.expire_days).indexOf('-') > -1 ? String(cert.expire_days).split('-')[1] : cert.expire_days }} 天
                                </span>

                               
                            </span>
                            <span>
                              <vxe-button  v-if="canUserAction?.edit?.page_display"  icon="vxe-icon-edit" status="primary" mode="text" @click.stop="handleUserEdit({row: cert, type:$CONFIG.FORM_TYPE.EDIT_TYPE})"/>
                                <template v-if="canUserAction?.del?.page_display">
                                    <a-divider type="vertical" /> <vxe-button   mode="text" status="error" icon="vxe-icon-delete" @click.stop="handleUserDel(cert)"/>
                                </template>
                            </span>
                        </div>
                    </div>
                </template>
            </template>
        </template>

    </ops-table>

    <!-- 编辑组件 -->
    <edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handleDataRefresh"
    />
    <!-- 子页面组件 -->
    <ops-sub-page v-model:open="subPageOpen" :title="`证书编码：${subPageRow?.cert_name}`" :basic-config="{
            columns: state.subPageColumns,
            api: getCertOneList,
            sid: subPageRow?.id
        }" @click-edit="handleUserEdit({type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: subPageRow})">
        <template #status="{ row}">
           
            <vxe-tag :status="row.status ? 'success': 'error'" size="small">
                {{ (state.initTitleData.status && state.initTitleData.status[row.status]) ?
                state.initTitleData.status[row.status] : row.status}}
            </vxe-tag>

        </template>
        <template #labels="{ row }">
            <template v-if="row.labels">
                <template v-for="(val, key) in row.labels" :key="key">
                    <a-tag v-if="key !== `validity_end` && key !== `validity_start`" class="block">
                        <b class="text-primary">{{key}}</b>: <span class="text-error">{{val}}</span>
                    </a-tag>
                </template>
            </template>
        </template>
        <template #update_name_id="{ row }">
           {{ $utils.groupBy(state.userList, 'id')?.[row.update_name_id]?.[0]?.username || row.update_name_id }}
        </template>
        <template #create_name_id="{ row }">
           {{ $utils.groupBy(state.userList, 'id')?.[row.create_name_id]?.[0]?.username || row.create_name_id }}
        </template>
        <template #cloud_master_account_id="{ row }">
            <template v-if="Array.isArray(row.cloud_master_account_id)">
                <template v-for="item in row.cloud_master_account_id" :key="item">
                    <a-tooltip v-if="state.initTitleData?.cloud_master_account_id && $utils.groupBy(state.initTitleData?.cloud_master_account_id, 'id')?.[item]" placement="topLeft">
                    <template #title>
                        <a-typography-paragraph :copyable="{ tooltip: false}" class="copy-text">
                            {{ $utils.groupBy(state.initTitleData?.cloud_master_account_id, 'id')?.[item]?.[0]?.access_key || ''}}
                        </a-typography-paragraph>
                    </template>
                    <a-tag>
                        <cloud-type-icon :type="$utils.groupBy(state.initTitleData?.cloud_master_account_id, 'id')?.[item]?.[0]?.cloud_type" class="xy-w-2"></cloud-type-icon>
                        {{ $utils.groupBy(state.initTitleData?.cloud_master_account_id, 'id')?.[item]?.[0]?.page_display || ''  }} 
                        {{ $utils.groupBy(state.initTitleData?.cloud_master_account_id, 'id')?.[item]?.[0]?.username || ''  }}
                    </a-tag>
                </a-tooltip> 
                </template>
            </template>
            <template v-else>
                {{ row.cloud_master_account_id }}
            </template>
        </template>
    </ops-sub-page>
</template>

<style>
    .xy-w-2 {
        width: 2em !important;
    }
    .copy-text {
        color:white !important; 
        font-size: 12px !important;
        margin-bottom: 0 !important;
}
</style>

<style scoped lang="less">
.xy-13 {
    font-size: 13px !important;
}

.xy-tag-2 {
    margin-bottom: 2px;
}

.cert-item {
    margin-bottom: 8px;
    
    &:last-child {
        margin-bottom: 0;
    }
}

.progress-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;

    :deep(.ant-progress) {
        flex: 1;
        margin-right: 0;
    }

    .cert-name {
        position: absolute;
        left: 8px;
        color: var(--primary-color-9);
        font-size: 12px;
        //text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: calc(100% - 80px);
        z-index: 1;
        top: 5px;
    }

    .expire-days {
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        width: 80px;
    }
}
</style>
