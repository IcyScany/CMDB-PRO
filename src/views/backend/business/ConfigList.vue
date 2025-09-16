<script setup>
import businessApi from "@/api/backend/businessApi";
import tableRender from "@/composables/table/tableRender";
import businessTitle from '@/config/business/businessTitle';
import userOperate from "@/composables/form/opsUserOperate";
import ConfigListEdit from "./ConfigListEdit.vue";
import { syntaxHighlight} from "@/utils/json";

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    row: {
        type: Object,
        default: () => ({})
    }
});

let { row: businessRow, show } = toRefs(props);

const emit = defineEmits(['update:show']);
const TITLE_LAYER = 2;
const initState = reactive({
    initTableColumns: [],
    customVisible: false,
    customData: '',
});
let configTableRef = ref(null);
const handleBack = () => {
    emit('update:show', false);
};
const handleAllData = async () => {
    await configTableRef.value?.commitRequest();
};
// 用于获取用户的操作权限
let canUserAction = {
    edit: {page_display: true},
    add: {page_display: true},
    del: {page_display: true},
};
let needSlots = [ 'custom_data'];
// 表格的列
const initTableColumns = computed(() => {
    for (let col of initState.initTableColumns) {
        let { field }  = col;
        if (needSlots.indexOf(field) > -1) {
            col.slots = {
                default: field
            };
        }
    }
    return initState.initTableColumns;
});

onMounted(async () => {
    let {
        table_columns,
    } = await tableRender.formatTitle({title: businessTitle[TITLE_LAYER]});
    initState.initTableColumns = table_columns || [];
});

watch(() => show.value, (newVal) => {
    if (newVal) {
        handleAllData();
    }
});

// 用户的操作
const {
    userDel,
    userEdit,
    formOpen,
    formType,
    formSid,
} = userOperate({});

// 用户的新增编辑操作
const handleUserEdit = ({type, row}) => {
    userEdit({type: type, sid: row.id});
};
// 用户的删除操作
const handleUserDel = (row) => {
    userDel({delApi: (config_sid) => businessApi.delOneBusinessConfig(businessRow?.value?.id,config_sid), sid: row.id, loadData: handleAllData});
};

const viewCustomData = (data) => {
    initState.customData = syntaxHighlight(data);
    initState.customVisible = true;
    
};

provide('businessRow', businessRow);
</script>

<template>
      <!-- 主表格部分 -->
      <ops-table
        ref="configTableRef"
        :columns="initTableColumns"
        :request-config="{
            api: businessApi.getBusinessConfigList,
            params: row.id,
            immediate: true,
        }"
        :filter-config="{
            remote: false,
            showIcon: true
        }"
        :auth-btn="canUserAction"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
        @user-del="handleUserDel"
    >
        <!-- 表格插槽 -->
        <template #topPrefix>
            <h2> {{ row?.business }} 配置详情</h2>
        </template>
        <template #other_toolbar_buttons_left>
            <vxe-button status="primary" content="返回上一页" icon="vxe-icon-arrow-left" @click="handleBack"/>
        </template>
    
        <template #custom_data="{ row: item }">
            <vxe-button
                v-if="item.custom_data"
                status="primary"
                content="点击查看"
                @click="viewCustomData(item.custom_data)"
            />
        </template>
    </ops-table>
    <a-modal
        v-model:open="initState.customVisible"
        title=""
        :centered="true"
        :closable="false"
        :footer="null"
    >
        <pre v-html="initState.customData"></pre>
    </a-modal>
    <ConfigListEdit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handleAllData"
    />
</template>

<style>
</style>
