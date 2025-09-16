<script setup>
/** 模块用于管理菜单的title模块 **/
import {menuTitle} from '@/config/menu/menuTitle';
import tableRender from "@/composables/table/tableRender";
import titleApi from "@/api/backend/titleApi";
import {findKey, groupBy, clone} from "xe-utils";
import opsMessageTip from "@/composables/opsMessageTip";
import userOperate from "@/composables/form/opsUserOperate";
import TitleEdit from "./TitleEdit.vue";
import { syntaxHighlight, validateJson } from "@/utils/json";

const props = defineProps({
    menuId: {
        type: [String, Number]
    },
    showTitle: {
        type: Boolean,
        default: false
    },
});

const { menuId } = toRefs(props);

// 统一状态管理
const state = reactive({
    initColumn: [],
    initTableData: {},
    filterConditions: {
        types: null,
        layer: 1,
    },
    showHelpTip: false,
    dataSourceHighlight: '',
    dataSourceVisible: false,
    fullData: [],
    // 用户操作权限
    canUserAction: {
        edit: {page_display: true},
        add: {page_display: true},
        del: {page_display: true},
    },
    copyTitle: computed(() => {
        let copyData = clone(state.fullData, true);
        let result = copyData.map(item => {
            delete item.id;
            delete item.create_time;
            delete item.menu_id;
            delete item.update_time;
            return item;
        });
        return result;

    })
});

// 表格引用
const titleTableRef = ref(null);

// 计算分层数据
const layerFormatData = computed(() => {
    return groupBy(state.fullData, 'layer');
});

const handleAllData = async () => {
    if (menuId.value) {
        nextTick(async () => {
            await titleTableRef.value?.commitRequest();
        });
    }
};

watch(menuId, () => {
    state.filterConditions = {
        types: null,
        layer: 1,
    };
    handleAllData();
});

onMounted(async () => {
    let {
        table_columns,
        table_title_data,
    } = await tableRender.formatTitle({title: menuTitle, isCustomTitle: true});
    let needSlots = [ 'title', 'operation', 'permissions_url'];
    state.initTableData = table_title_data.value || {};

    if (table_columns && Array.isArray(table_columns)) {
        for (let item of table_columns) {
            let { field, oriTitle } = item;
            if (needSlots.indexOf(field) > -1) {
                item.slots = {
                    default: field
                };
            }
            switch (field) {
                case 'sorting':
                    item.dragSort = true;
                    item.fixed = 'left';
                    break;
                case 'types':
                    item.formatter = ({cellValue}) => {
                        let result = oriTitle?.title_data ? oriTitle.title_data?.[cellValue] || cellValue : cellValue;
                        return result;
                    };
                    break;
                case 'permissions_url':
                case 'page_data_source':
                    item.showOverflow = false;
                    item.slots = {
                        default: field,
                    };
                    break;
                case 'layer':
                    item.showOverflow = false;
                    item.slots = {
                        default: field,
                        header: `${field}_header`,
                    };
                    break;
                case 'edit_display':
                case 'edit_required':
                case 'edit_change':
                case 'search_display':
                case 'page_sort':
                    item.visible = false;
                    item.sortable = true;
                    break;
            }
        }
    }
    state.initColumn = table_columns || [];
});

const rowDragendEvent = ({ newRow, oldRow }) => {
    nextTick(async () => {
        const currentLayerData = layerFormatData.value[oldRow.layer];
        let dataRowIndex = findKey(currentLayerData, item => {
            return item.id === newRow.id;
        });
        if (dataRowIndex > -1) {
            try {
                const res = await titleApi.putOneTitleSort(oldRow.id, dataRowIndex);
                opsMessageTip({
                    content: res?.msg,
                    closeCallback: async () => {
                        await handleAllData();
                        state.filterConditions.layer && handleSelectLayerChange(oldRow.layer);
                    }
                });
            } catch {
                handleAllData();
            }
        }
    });
};

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
    userDel({delApi: titleApi.delOneTitle, sid: row.id, loadData: handleAllData});
};


// 处理字段类型的过滤
const handleFilterTypes = (type) => {
    nextTick(() => {
        state.filterConditions.types = type === 'all' ? null : type;
    });
};

// 切换层号的处理
const handleSelectLayerChange = (layer) => {
    nextTick(() => {
        state.filterConditions.layer = layer;
    });
};



// 查看数据源
function viewDataSource(data) {
    state.dataSourceVisible = true;
    state.dataSourceHighlight = syntaxHighlight(data);
}

const handlePageInit =  () => {
    nextTick(() => {
        state.filterConditions = {
            types: null,
            layer: 1,
        };
        handleAllData();
    });
};
/******** 批量新增相关 *********/
let multiAddVisible = ref(false);
let formRef = ref(null);
let formState = reactive({
    multiAddValue: '',
}); // 表单值
let rules = reactive({
    multiAddValue: [
        {required: true, message: '此项不能为空'},
        {validator: validateJson, message: '请输入正确的json格式' }
    ]
}); // 表单校验规则
function multiAdd() {
    multiAddVisible.value = true;
    if (formRef.value) {
        formRef.value.clearValidate(); // 清空上一次的表单验证
    }
    formState.multiAddValue = '';
}
let confirmLoading = ref(false); // 确定按钮是否loading
function multiAddSubmit() {
    formRef.value.validateFields().then(async () => { // 校验通过
        confirmLoading.value = true;
        let submitData = JSON.parse(formState.multiAddValue);
        submitData.forEach(item => {
            item.menu_id = menuId.value;
        });
        titleApi.postOneTitleAdd(submitData).then(res => {
            confirmLoading.value = false;
            opsMessageTip({content: res?.msg, closeCallback: handleAllData});
        }).catch(() => {
            confirmLoading.value = false;
        });
    });
}
/******** 批量新增相关---end *********/


// 更新表格数据
const updateFullData = (data) => {
    state.fullData = data;
};

defineExpose({
    handlePageInit
});
</script>

<template>
    <ops-table
        v-if="showTitle"
        ref="titleTableRef"
        :columns="state.initColumn"
        :auth-btn="state.canUserAction"
        :scroll-y="{ enabled: true, gt: 100 }"
        :request-config="{
            api: titleApi.getTitleList,
            params: menuId,
            immediate: false,
        }"
        :switch-click-status-config="{
            api: titleApi.putOneTitleEdit,
        }"
        :row-config="{
            isHover: true,
            isCurrent: true,
            drag: true
        }"
        :default-order="{
            field: 'sorting',
            order: 'asc',
        }"
        :filter-conditions="state.filterConditions"
        @user-edit="handleUserEdit"
        @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
        @user-del="handleUserDel"
        @row-dragend="rowDragendEvent"
        @update:full-data="updateFullData"
    >

        <template #other_toolbar_buttons>
            <vxe-button status="primary" content="批量新增" @click="multiAdd"></vxe-button>
            <a-typography-paragraph :copyable="{text: JSON.stringify(state.copyTitle)}" class="copy-all-title">
                <template #copyableIcon>
                    复制

                </template>
            </a-typography-paragraph>
        </template>

        <template #toolSearchPrefix>
            <div class="flex items-center space-x-4">
                <!-- 类型筛选 -->
                <div class="flex items-center">
                    <span class="mr-2">类型</span>
                    <i class="vxe-icon-funnel mr-2"></i>
                    <a-space-compact>
                        <a-button 
                            type="primary" 
                            :ghost="state.filterConditions.types !== null" 
                            @click="handleFilterTypes('all')"
                        >
                            全部
                        </a-button>
                        <a-button 
                            v-for="(type, key) in state.initTableData.types" 
                            :key="key" 
                            type="primary" 
                            :ghost="state.filterConditions.types !== key" 
                            @click="handleFilterTypes(key)"
                        >
                            {{ type }}
                        </a-button>
                    </a-space-compact>
                </div>

                <!-- 层号筛选 -->
                <div 
                    v-if="state.initTableData?.layer"
                    class="flex items-center"
                >
                    <span class="mr-2">层号</span>
                    <i class="vxe-icon-funnel mr-2"></i>
                    <a-select 
                        v-model:value="state.filterConditions.layer" 
                        class="w-[100px]"
                        show-search 
                        @change="handleSelectLayerChange"
                    >
                        <a-select-option value="">全部</a-select-option>
                        <a-select-option 
                            v-for="item in state.initTableData.layer" 
                            :key="item" 
                            :label="item"
                        >
                            {{ item }}层
                        </a-select-option>
                    </a-select>
                </div>
            </div>
        </template>

        <template #permissions_url="{ row }">
            <div 
                v-if="row?.permissions_url" 
                class="overflow-hidden"
            >
                <template 
                    v-for="url in row.permissions_url" 
                    :key="url"
                >
                    <a-tag 
                        color="purple"
                        class="mb-1"
                    >
                        {{ url }}
                    </a-tag>
                </template>
            </div>
        </template>

        <template #page_data_source="{ row }">
            <vxe-button 
                v-if="row.page_data_source" 
                status="primary" 
                content="点击查看" 
                @click="viewDataSource(row.page_data_source)"
            />
        </template>

        <template #layer_header>
            <span>层号 / 块号</span>
        </template>

        <template #layer="{ row }">
            {{ row.layer }} / {{ row.block }}
        </template>
    </ops-table>

    <a-modal
        v-model:open="state.dataSourceVisible"
        title=""
        :centered="true"
        :closable="false"
        :footer="null"
    >
        <pre v-html="state.dataSourceHighlight"></pre>
    </a-modal>

    <title-edit
        v-model:open="formOpen"
        :sid="formSid"
        :menu-id="menuId"
        :form-type="formType"
        @edit-success="handleAllData"
    />

    <a-modal
        v-model:open="multiAddVisible"
        title="批量新增Title"
        :confirm-loading="confirmLoading"
        :centered="true"
        :width="800"
        @ok="multiAddSubmit"
    >
        <a-form
            ref="formRef"
            :model="formState"
            :rules="rules"
            :label-col="{ span: 4 }"
            label-align="left"
            :colon="false"
        >
            <a-form-item name="multiAddValue">
                <a-textarea
                    v-model:value="formState.multiAddValue"
                    :auto-size="{minRows: 6}"
                />
            </a-form-item>
        </a-form>
    </a-modal>

</template>

<style lang="less" scoped>
:deep(.ant-typography.copy-all-title){
    p {
        margin-bottom: 0 !important;
    }
}
</style>

