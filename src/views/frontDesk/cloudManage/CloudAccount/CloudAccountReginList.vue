<script setup>
import cloudAccountApi from "@/api/cloudManage/cloudAccountApi";
import modalConfirm from "@/composables/diffModal/modalConfirm";

let props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    oneData: {
        type: Object,
        default: () => ({})
    },
    listType: {
        type: String,
        default: '',

    },
});
let { oneData, listType, open } = toRefs(props);
const emits = defineEmits(['update:open']);
const cloudRegionTableRef = ref(null);
let button = inject('button');

let canUserAction = computed(() => {
    let result = { // 编辑可用区的同步状态
        edit_region: false,
    };
    if (button.value) {
        for (let btn of button.value) {
            let { field } = btn;
            switch (field) {
                case 'edit-regions':
                    result.edit_region = btn;
                    break;
            }
        }
    }
    return result;
});

const handleDrawerOpen = (visible) => {
    if (visible) {
        cloudRegionTableRef.value && cloudRegionTableRef.value?.getDom().sort(listType.value === 'regions_list' ? 'sync_status' : 'status', 'desc');
        cloudRegionTableRef.value && cloudRegionTableRef.value?.commitRequest();
    }
};
const handleDrawerClose = () => {
    emits('update:open', false);
};
const regionTaleColumns = [
    {
        field: 'name',
        title: '名称',
        sortable: true,
    },
    {
        field: 'cn_name',
        title: '中文名',
        sortable: true,

    },
    {
        field: 'en_name',
        title: '英文名',
        sortable: true,

    },
    {
        field: 'sync_status',
        title: '数据同步状态',
        sortable: true,
        slots: {
            default: 'sync_status'
        }
    },
];
const enterpriseTaleColumns = [
    {
        field: 'name',
        title: '名称',
        sortable: true,
    },
    {
        field: 'projects_type',
        title: '类型',
        sortable: true,

    },
    {
        field: 'status',
        title: '状态',
        sortable: true,
        slots: {
            default: 'status'
        }

    }
];

let currentSwitchStatus = ref({});
const handleSwitchStatus = () => {
    cloudRegionTableRef.value.tableLoading = true;
    let putData = {
        [currentSwitchStatus.value.field]: currentSwitchStatus.value.checked
    };
    cloudAccountApi.putEditReginAccount(oneData.value?.id, currentSwitchStatus.value.row.id, putData)
        .then(() => {
            cloudRegionTableRef.value.tableLoading = false;
            handleDrawerOpen(true);
        })
        .catch(() => {
            cloudRegionTableRef.value.tableLoading = false;
        });
};



// 数据同步状态的按钮点击
const switchStatus = async (row, field, checked) => {
    currentSwitchStatus.value = {row, field, checked};

    if (checked) {
        modalConfirm({okCallBack: {api: handleSwitchStatus}, tip:`开启此同步后，为自动同步此区域的数据到CMDB系统,确认是否开启`});
    } else {
        modalConfirm({okCallBack: {api: handleSwitchStatus}, tip:`关闭此同步后，对应数据会全部清除,确认是否关闭`});
    }

};




</script>

<template>
    <ops-form-container
        :open="open"
        :title="`${$route.meta.title}的【${oneData.primary_username}】${listType === 'regions_list' ? '可用区' : '企业项目' }信息`"
        @after-open-change="handleDrawerOpen"
        @close="handleDrawerClose"
    >
        <ops-table
            ref="cloudRegionTableRef"
            :columns="listType === 'regions_list' ? regionTaleColumns : enterpriseTaleColumns"
            :request-config="{
                    api: oneData.id && listType === 'regions_list' ? cloudAccountApi.getAccountRegionsApi: cloudAccountApi.getAccountEnterpriseProjectApi,
                    params: oneData?.id,
                    immediate: false,
                }"
            :filter-config = "{
                remote: false,
                showIcon: true,
             }"
            :default-order="{
                field: listType === 'regions_list' ? 'sync_status' : 'status',
                order:'desc'
            }"
        >
            <template #sync_status="{ row }">
                <a-tooltip :title="row.sync_status ? '打开为自动同步此区域的数据到CMDB系统': '关闭表示对应数据会全部清除'">
                    <a-switch
                        :checked="row.sync_status"
                        :checked-value="1"
                        :un-checked-value="0"
                        checked-children="开"
                        un-checked-children="关"
                        :disabled="!canUserAction?.edit_region?.page_display"
                        @change="(checked) => switchStatus(row,'sync_status',checked)"
                    />
                </a-tooltip>
            </template>
            <template #status="{row}">
                <a-tag :color="row.status === 1 ? 'green': ''">{{row.status === 1 ? '正常': '禁用'}}</a-tag>
            </template>
        </ops-table>
    </ops-form-container>
</template>

<style scoped>

</style>
