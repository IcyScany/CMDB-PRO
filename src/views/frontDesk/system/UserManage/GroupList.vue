<script setup>
import UserGroupListEdit from './UserGroupListEdit.vue';
import userGroupManageApi from "@/api/system/userGroupManageApi";
import userOperate from "@/composables/form/opsUserOperate";
import tableRender from "@/composables/table/tableRender";
import cmdbEntityFormInit from "@/composables/cmdbEntityFormInit";
import opsMessageTip from "@/composables/opsMessageTip";


/** 用户组权限相关 --Start**/
// 获取用户组权限列表的数据
let userGroupLists = ref([]);
let userGroupLoading = ref(false);
const titleLayer = 2;
let initButton = ref([]); // 表格的button
let initTitleData = ref({});
const urlPrefix = 'system/user-group/';



const handleGetUserGroupData = async () => {
    userGroupLoading.value = true;
    userGroupLists.value = [];
    handleCancelEdit();
    userGroupManageApi.getUserGroupList()
        .then(res => {
            userGroupLists.value = res;
            userGroupLoading.value = false;
        })
        .catch(() => {
            userGroupLoading.value = false;
        })
    ;
};
/** 用户组权限相关 --End**/
// 用于获取用户的操作权限
let canUserAction = computed(() => {
    let result = {};
    if (initButton.value) {
        for (let btn of initButton.value) {
            let { field } = btn;
            switch (field) {
                case 'add':
                case 'del':
                case 'edit':
                    result[field] = btn;
                    break;
            }
        }
    }
    return result;
});

/** 用户组编辑时的处理 ***/

let currentClickUserGroup = ref(null);
const handleUserGroupEdit = (row) => {
    currentClickUserGroup.value = row;
};
const handleCancelEdit = () => {
    currentClickUserGroup.value = null;
};
const handleSubimtEdit = () => {
    currentClickUserGroup.value.loading = true;
    userGroupManageApi.putUserGroupEdit(currentClickUserGroup.value.id, currentClickUserGroup.value)
        .then(res => {
            currentClickUserGroup.value.loading = false;
            opsMessageTip({content: res.msg, closeCallback:handleGetUserGroupData});
        })
        .catch(() => {
            currentClickUserGroup.value.loading = false;
        });
};


const initUserGroupPage = async () => { // 用户组页面的数据
    let {
        title_data,
        button,
    } = await tableRender.setColumn({layer: titleLayer});

    initButton.value = button.value || [];
    initTitleData.value = title_data.value || {};
    await handleGetUserGroupData();
};




/*userDel,*/
// 用户的操作
const {
    userEdit,
    formOpen,
    formType,
    formSid,
} = userOperate({});

const {
    userClickStatus,
} = cmdbEntityFormInit({urlPrefix, getData:handleGetUserGroupData});

// 用户的新增编辑操作
const handleUserEdit = ({type}) => {
    userEdit({type: type});
};

defineExpose({
    initUserGroupPage,
    userGroupLoading,
    handleGetUserGroupData,
});


</script>


<template>
    <div>

        <div class="user-group-action">
            <vxe-button v-if="canUserAction?.add?.page_display"  content="新增" icon="vxe-icon-add" status="primary" @click="handleUserEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"/>
            <vxe-button :loading="userGroupLoading" content="刷新" class-name="refreash-user-group"  icon="vxe-icon-refresh" status="primary" @click="initUserGroupPage"/>
        </div>
        <a-spin :spinning="userGroupLoading">
            <a-row v-if="userGroupLists.length > 0" :gutter="[16, 8]">
                <template v-for="{group_name, id, describe, note, virtual_team_status} in userGroupLists" :key="id">
                    <a-col :span="4" style="height: 100%">
                        <a-card :title="group_name" :bordered="true"  :body-style="{padding: '5px', height: '60%' }" style="box-shadow: 0px 2px 8px rgba(0,0,0,0.13);">
                            <p>描述：
                                <span v-if="!currentClickUserGroup">{{describe}}</span>
                                <a-input v-if="currentClickUserGroup?.id === id" v-model:value="currentClickUserGroup.describe" name="describe"/>
                            </p>
                            <p>备注：
                                <span v-if="!currentClickUserGroup">{{note}}</span>
                                <a-input v-if="currentClickUserGroup?.id === id" v-model:value="currentClickUserGroup.note" name="note"/>
                            </p>
                            <template #extra>
                                <a-tooltip title="接口组过滤状态，修改请联系管理员">
                                    <a-switch :checked="virtual_team_status" :checked-value="1" :un-checked-value="0" :disabled="canUserAction?.edit?.page_display ? false : true" checked-children="开" un-checked-children="关" size="small" @click="(checked) => userClickStatus({sid:id, type:EDIT_TYPE, field: 'virtual_team_status', checked, otherBody: {group_name, describe,note}})"/>
                                </a-tooltip>
                            </template>
                            <template #actions>
                                <template v-if="currentClickUserGroup?.id === id">
                                    <vxe-button icon="vxe-icon-success-circle-fill" mode="text" status="success" @click="handleSubimtEdit"> 提交 </vxe-button>
                                    <vxe-button icon="vxe-icon-error-circle-fill" mode="text" status="error" @click="handleCancelEdit"> 取消 </vxe-button>
                                </template>

                                <vxe-button v-if="canUserAction?.edit?.page_display && !currentClickUserGroup || currentClickUserGroup?.id !== id" mode="text" status="primary" icon="vxe-icon-edit" @click="handleUserGroupEdit({group_name, id, describe, note, virtual_team_status})">编辑</vxe-button>
                                <!--                                <vxe-button v-if="canUserAction?.del?.page_display"  mode="text" status="error" icon="vxe-icon-delete" @click="userDel({sid:id})"> 删除</vxe-button>-->
                                <a-tooltip title="用户组权限">
                                    <router-link :to="{name: 'systemUserGroupPermissionPage', query: {sid: id}}">
                                        <setting-outlined key="delete" class="text-primary"/>
                                    </router-link>
                                </a-tooltip>
                            </template>
                        </a-card>
                    </a-col>
                </template>
            </a-row>
            <a-empty v-else></a-empty>
        </a-spin>
        <user-group-list-edit
            v-model:open="formOpen"
            :sid="formSid"
            :form-type="formType"
            @edit-success="initUserGroupPage"
        />
    </div>
</template>


<style scoped lang="less">
.user-group-action {
    margin-bottom: .5rem;
    .refreash-user-group {
        float: right;

    }
}
</style>
