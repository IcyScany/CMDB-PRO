<script setup>
import commonApi from '@/api/common';

const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    data: {
        type: Object,
        default: () => ({}),
    },
});

const { open, data } = toRefs(props);
const emits = defineEmits(['update:open']);
const virtualTeamList = ref({});
const handleDrawerOpen = () => {
    console.log(data.value);
    virtualTeamList.value = {};
    if(open.value) {
        commonApi.getVirtualTeamList().then(res => {
            virtualTeamList.value = res;
        });
    }
};

const handleDrawerClose = () => {
    emits('update:open', false);
};
</script>

<template>
   <ops-form-container
        :title="`NO.${data.id} 告警通知`"
        :open="open"
        width="80%"
        @after-open-change="handleDrawerOpen"
        @close="handleDrawerClose"
    >
       
        <a-card bordered style="margin: 16px 0">
            <a-descriptions v-if="data.virtual_teams && data.virtual_teams.group_source && data.virtual_teams.group_source.length"  title="通知组" bordered size="small" >
                <a-descriptions-item v-for="gid in data.virtual_teams.group_source" :key="gid" label="通知组" >
                    <VxeButton 
                        v-view-virtualteam="String(gid)" 
                        style="padding: 0" 
                        :content="virtualTeamList[gid]?.group_name || String(gid)" 
                        mode="text" 
                        status="primary"
                    />
                </a-descriptions-item>
            </a-descriptions>
            <a-empty v-else>
                <template #description>无通知组</template>
            </a-empty>
        </a-card>
        <a-card bordered style="margin: 16px 0">
            <template #title>额外通知人</template>
            <a-row v-if="data.virtual_teams && data.virtual_teams.alert_notice && data.virtual_teams.alert_notice.length" :gutter="16">
                <a-col
                    v-for="(person, idx) in data.virtual_teams.alert_notice"
                    :key="idx"
                    :xs="24"
                    :sm="12"
                    :md="8"
                    :lg="6"
                    :xl="4"
                >
                    <a-card class="user-card" :hoverable="true" style="margin-bottom: 16px; min-width: 400px;">
                        <div class="user-info">
                        <div class="info-item">
                            <span class="label">用户名：</span>
                            <span class="value">{{ person.username || '-' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">手机号：</span>
                            <span class="value">{{ person.mobile || '-' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">邮箱：</span>
                            <span class="value">{{ person.mail || '-' }}</span>
                        </div>
                        <div v-if="person.group" class="info-item" >
                            <span class="label">分组：</span>
                            <span class="value">{{ person.group }}</span>
                        </div>
                        </div>
                    </a-card>
                </a-col>
            </a-row>
            <a-empty v-else>
                <template #description>无额外通知人</template>
            </a-empty>
        </a-card>
    </ops-form-container>
</template>

<style scoped lang="less">
.user-card {
  position: relative;
  min-height: 100px;
  min-width: 400px;
  box-shadow: rgba(0, 0, 0, 0.13) 0px 2px 8px;
}
.user-info {
  .info-item {
    margin-bottom: 8px;
    line-height: 1.5;
    display: flex;
    white-space: nowrap;
    .label {
      color: #666;
      width: 70px;
      flex-shrink: 0;
    }
    .value {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      position: relative;
    }
  }
}
</style>