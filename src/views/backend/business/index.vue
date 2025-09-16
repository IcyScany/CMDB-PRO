<script setup>
import businessTitle from '@/config/business/businessTitle';
import tableRender from "@/composables/table/tableRender";
import businessApi from "@/api/backend/businessApi";
import userOperate from "@/composables/form/opsUserOperate";
import BusinessEdit from "./BusinessEdit.vue";
import ConfigList from "./ConfigList.vue";

const initColumn = ref([]);
const clientTableMenuTitleRef = ref(null);
const handleAllData = async () => {
    await clientTableMenuTitleRef.value?.commitRequest();
};
let aboutConfigState = reactive({
    show: false,
    businessRow: {}, // 当前点击的业态id
});

onMounted(async () => {
    let {
        table_columns,
    } = await tableRender.formatTitle({title: businessTitle[1]});
    let needSlots = [ 'theme', 'business_config'];


    if (table_columns && Array.isArray(table_columns)) {
        for (let item of table_columns) {
            let { field } = item;
            if (needSlots.indexOf(field) > -1) {
                item.slots = {
                    default: field
                };
            }
        }

    }
    initColumn.value = table_columns || [];
    handleAllData();

});
watch(() => aboutConfigState.show, async (newVal) => {
    if (!newVal) {
        await handleAllData();
    }
});

// 用于获取用户的操作权限
let canUserAction = {
    edit: {page_display: true},
    add: {page_display: true},
};

// 用户的操作
const {
    userEdit,
    formOpen,
    formType,
    formSid,
} = userOperate({});

// 用户的新增编辑操作
const handleUserEdit = ({type, row}) => {
    userEdit({type: type, sid: row.id});
};

//配置详情按钮的点击
const handleBusinessConfig = (row) => {
    aboutConfigState.businessRow = row;
    aboutConfigState.show = true;

};


</script>

<template>
    <ops-table
        v-show="!aboutConfigState.show"
        ref="clientTableMenuTitleRef"
        :columns="initColumn"
        :auth-btn="canUserAction"
        :row-config="{
            isHover: true,
            isCurrent: true,
            useKey: true,
        }"
        :request-config="{
            api: businessApi.getBusinessList,
            immediate: false,
        }"

        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
    >
        <template #theme="{ row }">
            <a-badge :color="row.theme" :text="row.theme" />
        </template>
        <template #business_config="{row}">
            <vxe-button content="配置详情" status="primary" mode="text"  @click="handleBusinessConfig(row)"/>
        </template>
    </ops-table>
    <ConfigList
        v-if="aboutConfigState.show"
        v-model:show="aboutConfigState.show"
        :row="aboutConfigState.businessRow"
    />

    <BusinessEdit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handleAllData"
    />


</template>
