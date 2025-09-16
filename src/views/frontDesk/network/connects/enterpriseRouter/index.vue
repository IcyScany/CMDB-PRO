<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./edit.vue";
import API from "@/api/network/enterpriseRouter";

const TITLE_LAYER = 1;

// 状态管理
const state = reactive({
    initColumn: [],
    initButton: [],
    initTitleData: [],
    subPageColumns: [],
    viewData: [],
});

// 用户操作相关
const { userEdit, formOpen, formType, formSid } = userOperate({});

// 表格的列
const initTableColumns = computed(() => {
    for (let col of state.initColumn) {
        let { field }  = col;
        switch (field) {
            case 'id':
            case 'region_id':
            case 'enterprise_router_id':
                col.slots = {
                    default: field
                };
                col.showOverflow = 'ellipsis';
                break;  
            case 'virtual_team_v3_id':
                col.showOverflow = false;
                break;
        }
    }
    return state.initColumn;
});

// 用于获取用户的操作权限
const canUserAction = computed(() => {
    return state.initButton.reduce((acc, btn) => {
        acc[btn.field] = btn;
        return acc;
    }, {});
});

const getViewData = async () => {
    const res = await API.postList({
        page_limit: 20,
        page_number: 1,
        query_condition: [],
        sort_field: 'id',
        sort_order: 'DESC',
    });

    state.viewData = res.data;
};

onMounted(async () => {
    const { button, columns, title_data, sub_page_columns } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initButton = button.value || [];
    state.initTitleData = title_data.value || [];
    state.subPageColumns = sub_page_columns || [];

    await getViewData();
});

// 用户新增编辑操作
const handleUserEdit = ({type, row}) => {
    userEdit({type: type, sid: row.id});
};

const getAttachData = (data) => {
    let attachmentsData = {};
    attachmentsData.count = data.length;

    // 统计每种 resource_type 的数量
    attachmentsData.typeCount = {};
    data.forEach(item => {
        const type = item.resource_type;
        if (attachmentsData.typeCount[type]) {
            attachmentsData.typeCount[type]++;
        } else {
            attachmentsData.typeCount[type] = 1;
        }
    });
    return attachmentsData;
};

const zoneName = (zoneId, row) => {
    if(!zoneId) return '';

    let zone = '';
    let region = row.region_id;

    if(row.cloud_source === '华为云') {
        zone = `${zoneId}`.replace(`${region}`, '').toUpperCase();
    } 
    else if(row.cloud_source === '阿里云') {
        zone = `${zoneId}`.replace(`${region}-`, '').toUpperCase();
    }

    return zone ? zone + '区' : '';
};

</script>

<template>
    <div v-if="state.viewData.length > 0" class="view-card-container">
        <a-card v-for="item in state.viewData" :key="item.id" class="view-card">
            <template #title>
                <div class="view-title">
                    {{ item.name }}
                    <EditOutlined v-if="canUserAction.edit" class="view-title-edit" @click="handleUserEdit({type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: item})" />
                </div>
            </template>

            <ops-descriptions
                :data="item"
                :columns="initTableColumns"
                :column="1"
                size="small"
                style="flex: 3;"
            >
                <template #region_id="{ row }">
                    {{ state.initTitleData?.region_id?.[row.region_id] || row.region_id }}
                </template>
                
                <template #availability_zone_ids="{ row }">
                    <span
                        v-for="(zone, index) in row.availability_zone_ids"
                        :key="index"
                    >
                        {{ zoneName(zone, row) }}
                        <span v-if="index !== row.availability_zone_ids.length - 1">, </span>
                    </span>
                </template>

                <template #enterprise_project_id="{ row }">
                    {{ state.initTitleData?.enterprise_project_id?.[row.enterprise_project_id] || row.enterprise_project_id }}
                </template>

                <template #status="{ row }">
                    {{ row }}
                </template>
            </ops-descriptions>

            <div style="flex: 2;">
                <div>
                    连接数量（已创建）：
                    <span class="text-primary">{{ getAttachData(item.attachments).count }}</span>
                </div>
                <div class="flex mt-2">
                    <div 
                        v-for="(count, type) in getAttachData(item.attachments).typeCount" 
                        :key="type"
                         class="view-count"
                    >
                        <div class="view-count-title">{{ type.toLocaleUpperCase() }}</div>
                        <div class="view-count-number">{{ count }}</div>
                    </div>
                </div>
            </div>
        </a-card>
    </div>

    <div v-else>
        <a-empty class="mt-20" />
    </div>

    <!-- 编辑组件 -->
    <edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="getViewData"
    />
</template>

<style scoped lang="less">
.view-card-container {
    max-height: 100%;
    width: 100%;
    overflow-y: auto;
}

.view-title {
    font-size: 20px;
    color: var(--primary-color);
    padding-bottom: 10px;
    border-bottom: 1px solid rgb(241, 241, 241);
}

.view-title-edit {
    font-size: 16px;
    color: gray;
    margin-left: 10px;
    cursor: pointer;
}

.view-card {
    margin-top: 10px;
    border-left: 4px solid var(--primary-color);

    :deep(.ant-card-body) {
        display: flex;
    }

    .view-count {
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #f7f7f7;
        border-radius: 4px;
        padding: 12px 30px;
        margin-right: 10px;

        .view-count-title {
            font-size: 12px;
            color: #999;
        }

        .view-count-number {
            font-size: 20px;
        }
    }
}
</style>
