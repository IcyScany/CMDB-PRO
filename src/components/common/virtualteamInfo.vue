<script setup>
import commonApi from "@/api/common";
import { groupBy } from "xe-utils";

const props = defineProps({
    teamId: {
        type: [String, Number],
        required: true,
    },
});
const { teamId } = toRefs(props);

let team = ref({}); // 接口组信息

// 添加计算属性来处理分组数据
const groupedUsers = computed(() => {
    const groups = groupBy(virtualTeamOneUser.value, 'user_tag');
    // 转换为数组格式，确保每个分组有唯一的 key
    return Object.entries(groups).map(([tag, users]) => ({
        id: tag || 'default',
        tag: tag && tag !== 'null' ? `组：${tag}` : '默认分组',
        users
    }));
});

onMounted(() => {
    handleOneVirtualteamUserMessage(teamId.value);
});

// 读取一个组的用户信息
const virtualTeamOneUser = ref([]);
const handleOneVirtualteamUserMessage = async (val) => {
    let result = await commonApi.getCommonVirtualTeamOneData(val) || [];
    team.value = result?.virtual_team || {};
    virtualTeamOneUser.value = result.users.map(item => {
        item.user_tag = item.user_tag && item.user_tag !== 'null' ? item.user_tag : '默认分组';
        return item;
    });
};
</script>

<template>
    <a-card class="virtualteam-box" :body-style="{padding: '10px'}">
        <template #title>
            <b>【{{ team.group_name }}】</b> 用户组信息
        </template>
<!--        <a-card class="virtualteam-item">
            <span>组名：</span>&nbsp;&nbsp;
            <span v-if="team.group_leader_id">组长：</span>
        </a-card>-->
        <template v-if="virtualTeamOneUser && virtualTeamOneUser.length">
            <a-card 
                v-for="group in groupedUsers" 
                :key="group.id"
                class="virtualteam-item"
            >
                <h3>{{ group.tag }}</h3>
                <a-row :gutter="[8,8]" class="user-box">
                    <a-col 
                        v-for="item in group.users" 
                        :key="item.cmdb_user_v3__id" 
                        :span="8"
                    >
                        <a-badge-ribbon :text="team.group_leader_id === item.cmdb_user_v3__id ? '组长': ''" :class="{'ribbon-corner-custom': team.group_leader_id !== item.cmdb_user_v3__id || !team.group_leader_id}">

                            <a-card class="virtualteam-item">
                                <a-row class="info-row"><span class="label">用户名</span> {{item.cmdb_user_v3__username}}</a-row>
                                <a-row class="info-row"><span class="label">手机号</span> <a-typography-paragraph v-if="item.cmdb_user_v3__mobile" copyable class="xy-mb0">{{item.cmdb_user_v3__mobile}}</a-typography-paragraph></a-row>
                                <a-row class="info-row"><span class="label">邮箱</span><a-typography-paragraph copyable class="xy-mb0">{{item.cmdb_user_v3__email}}</a-typography-paragraph></a-row>
                            </a-card>
                        </a-badge-ribbon>
                    </a-col>
                </a-row>
            </a-card>
        </template>
        <template v-else>
            <a-empty>
                <template #description>
                    该虚拟组无用户
                </template>
            </a-empty>
        </template>
    </a-card>
</template>

<style scoped lang="less">
:deep(.view-virtual-team-info-box .ant-modal-content){
    background-color: #f5f5f5 !important;
}
:deep(.ribbon-corner-custom .ant-ribbon-corner) {
    border: none !important;

}
.xy-mb0 {
    margin-bottom: unset !important;
}
.virtualteam-box {
    background-color: #f5f5f5;
    .virtualteam-item {
        margin-bottom: 2%;
        
        .info-row {
            display: flex;
            align-items: flex-start;
            
            .label {
                width: 60px;
                flex-shrink: 0;
            }
        }
    }
}
.sn-box {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 30px;
    .sn-item {
        padding: 1.5rem;
        width: 17rem;
        box-shadow: 0 0 2rem 0 rgb(136 152 170 / 15%);
        margin-right: 2%;
        margin-bottom: 1rem;
        position: relative;
        .usersource {
            position: absolute;
            top: 1%;
            right: 1.5rem;
            font-size: 10px;
            vertical-align: top;
            border-bottom-left-radius: 50%;
            border-bottom-right-radius: 50%;
            color: #fff;
            padding: .3rem .2rem;
            text-transform: uppercase;
            line-height: 1;
        }
    }
}
</style>
