<script setup>
import tableRender from "@/composables/table/tableRender";
import userApi from "@/api/system/userApi";
import userOperate from "@/composables/form/opsUserOperate";
import UserEdit from "./UserEdit.vue";


let initColumn = ref([]); // 表格的列
const titleLayer = 1;
let initButton = ref([]); // 表格的button
let initTitleData = ref({});

onMounted(async () => {
    let {
        title_data,
        button,
        columns,
    } = await tableRender.setColumn({layer: titleLayer});
    initColumn.value = columns.value || [];
    initButton.value = button.value || [];
    initTitleData.value = title_data.value || {};
    await initUserList();
});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of initColumn.value) {
        let { field }  = col;
        switch (field) {
            case 'user_group':
                delete col.showOverflow;
                col.slots = {
                    default: field
                };
                break;
            case 'images':
            case 'password':
                col.slots = {
                    default: field
                };
                break;
        }
    }
    return initColumn.value;
});

// 用于获取用户的操作权限
let canUserAction = computed(() => {
    let result = {};
    if (initButton.value) {
        for (let btn of initButton.value) {
            let { field } = btn;
            switch (field) {
                case 'add':
                case 'edit':
                case 'del':
                    result[field] = btn;
                    break;
            }
        }
    }
    return result;
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
// 用户列表格
const userListTableRef = ref(null);

// 表格数据的获取
const initUserList = async () => {
    userListTableRef.value && await userListTableRef.value?.commitRequest();
};
// 用户del操作
const handleUserDel = (row) => {
    userDel({sid: row.id, delApi: userApi.delUser, loadData: initUserList});
};


defineExpose({
    initUserList
});

</script>

<template>
    <ops-table
        ref="userListTableRef"
        :columns="initTableColumns"
        :auth-btn="canUserAction"
        :request-config="{
                    api: userApi.getUserList,
                    immediate: false,
                }"
        :switch-click-status-config="{
                 api: userApi.putUserEdit,
                 params:['email'],
         }"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE});"
        @user-del="handleUserDel"
    >

        <template #user_group="{ row }">
            <template v-if="row.user_group">
                <template v-if="initTitleData.user_group">
                    <template v-for="team in initTitleData.user_group" :key="team.id">
                        <template v-if="row.user_group.indexOf(team.id) > -1">
                            <router-link :to="{name: 'systemUserGroupPermissionPage', query: {sid: team.id}}" class="mr-2">
                                <a-tag color="blue">
                                   {{team.group_name}}
                                </a-tag>
                            </router-link>
                            <br/>
                        </template>
                    </template>
                </template>
                <template v-else>
                    {{row.user_group}}
                </template>


            </template>
        </template>
        <template #images="{row}">
            <template v-if="row.images">
                <a-avatar v-if="row.images.startsWith('http')" :src="row.images"/>
                 <span v-else>{{row.images}}</span>
            </template>
        </template>
        <template #password="{ row }">
            <a-typography-paragraph :copyable="{text: row.password }"></a-typography-paragraph>
        </template>
    </ops-table>

    <UserEdit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="initUserList"
    />

</template>


