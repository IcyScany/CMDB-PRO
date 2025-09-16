<script setup>
import hardWareApi from '@/api/network/hardWareApi';
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import InterfaceRoutesAdd from './InterfaceRoutesAdd.vue';

let props = defineProps({
    type: {
        type: String,
        default: ''
    },
    sid: {
        type: Number,
        default: 0
    },
    selectInterface: { // 在端口中选择的接口
        type: Object,
        default: () => ({})
    },
    activeTab: { type: String, default: '' },
    subRow: {
        type: Object,
        default: () => ({})
    }

});

let { type, sid, selectInterface, subRow } = toRefs(props);
let  tableRef = ref(null);
// 用户操作相关
const { userEdit, formOpen, formType } = userOperate({});

const hasAddBrand = ['华为', 'H3C', 'Cisco']; // 支持添加路由的品牌 


const diffType = {
    interfaces: {
        interface: 'GE0/6',
        title_layer: 2,
        title: '端口',
    },
    routes:{
        interface: 'GE0/0',
        title_layer: 3,
        title: '路由',
    }
};

let interfaceRouteState = reactive({
    tableColumns: [],
    initButton: [],
    tableData: [],
});

let emits = defineEmits(['tab-change', 'clear-select-interface']);

const handleCloseTab = async () => {
    await nextTick();
    tableRef.value && tableRef.value?.commitRequest?.();
};

onMounted(async () => {
    const { button, columns } = await tableRender.setColumn({ layer: diffType?.[type.value]?.title_layer });
    interfaceRouteState.tableColumns = columns.value || [];
    interfaceRouteState.initButton = button.value || [];
    if(type.value === 'interfaces') {
        emits('clear-select-interface', {});
       
    }  
    handleCloseTab();
});

// 用于获取用户的操作权限
const canUserAction = computed(() => {
    return interfaceRouteState.initButton.reduce((acc, btn) => {

        acc[btn.field] = btn.field === 'add' ?  hasAddBrand.includes(subRow.value?.brand) && btn : btn;
        return acc;
    }, {});
});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of interfaceRouteState.tableColumns) {
        let { field }  = col;
        switch (field) {
            case 'interface':
                if(type.value === 'interfaces') {
                    col.slots = {
                        default: field,
                    };
                }
                break;
        }
    }
    return interfaceRouteState.tableColumns;
});



// 查看接口路由详情
const handleViewInterfaceRoute = (row) => {
    // 这里val就是当前激活tab的key
    emits('tab-change', 'routes', row);
   
};


</script>

<template>   
    <ops-table
        ref="tableRef"
        :columns="initTableColumns"
        :request-config="{
            api: hardWareApi.getInterfaceRoutes,
            accept_field: type,
            params: {
                sid: sid, 
                ...(selectInterface?.interface && activeTab === 'routes' ? {type: selectInterface.interface} : {}),
            }
        }"
        
        :auth-btn="canUserAction"  
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"

    >

        <template #other_toolbar_buttons>
            <span v-if="type=== 'routes' && selectInterface?.interface">
                <FilterOutlined />    端口：<a-tag closable @close="emits('clear-select-interface', {});handleCloseTab();">{{ selectInterface?.interface }}</a-tag>
            </span>
           

        </template>
        <template #interface="{ row }">
            <a-tooltip title="查看端口路由信息">
                <span class="text-primary cursor-pointer" @click="handleViewInterfaceRoute(row)">{{ row.interface }}</span>
            </a-tooltip>
        </template>

    </ops-table>

    <!-- 接口路由新增组件 -->
    <interface-routes-add
        v-model:open="formOpen"
        :sid="sid"
        :form-type="formType"
        :sub-row="subRow"
        :page-title="diffType?.[type]?.title"
        @edit-success="handleCloseTab"
    />

   
    
</template>

<style scoped >
.custom-tabs {
    height: calc(100% - 220px);
}
</style>

