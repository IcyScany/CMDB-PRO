<script setup>
import { reactive, ref } from 'vue';
import tableRender from "@/composables/table/tableRender";
import menusApi from "@/api/backend/menusApi";
import userOperate from "@/composables/form/opsUserOperate";
import Edit from "./Edit.vue";
import menu from '@/config/menu/menu';
import {clone, findKey, uniq} from "xe-utils";
import Title from './Title.vue';
import OpsTable from "@/components/OpsTable/index.vue";
import { syntaxHighlight } from "@/utils/json";
import opsMessageTip from "@/composables/opsMessageTip";

const indexTableRef = ref(null);
let initTime = null;

// 统一状态管理
const state = reactive({
    // 表格相关
    initColumn: [], // 表格的列
    tableData: [], // 表格的数据
    allData: [], // 所有数据
    tableLoading: false, // 右侧表格数据获取的load

    // 左侧菜单相关
    leftMenuLevel: [], // 左侧的一级菜单
    selectedLeftKeys: [], // 左侧选中的一级菜单
    leftMenuLoading: false, // 左侧菜单数据加载的loading
    collapsed: false, // 左侧的折叠收缩

    // Tab相关
    activeTab: null, // 当前激活的tab标签
    tabArr: [], // tab标签的

    // 拖拽相关
    sortable1: null,
    sortableMenuLevel: null,
    showHelpTip: false,
    initTime: null,

    // 数据源相关
    dataSourceVisible: false,
    dataSourceHighlight: '',
});

// 用于获取用户的操作权限
const canUserAction = {
    edit: {page_display: true},
    add: {page_display: true},
    del: {page_display: true},
};
let selectLevel1 = ref();

// 获取左侧的一级菜单列表
const getPrimaryMenu = async () => {
    state.leftMenuLoading = true;

    try {
        const requestData = await menusApi.getMenusList(0);
        state.leftMenuLevel = requestData.map(item => ({
            label: item.menu_name,
            value: item.id,
            ...item
        }));
        state.selectedLeftKeys = [requestData?.[0]?.id];
        state.activeTab = requestData?.[0]?.id;
        selectLevel1.value = requestData?.[0]?.id;
        state.tabArr = [requestData[0]];

        state.leftMenuLoading = false;
    }
    catch (e) {
        state.leftMenuLoading = false;
    }
};

// 获取二级菜单列表
const handleTableData = async (menu_sid, item) => {
    console.log('menu_sid', menu_sid, item);
    state.tableLoading = true;
    if (item) {
        state.activeTab = menu_sid;
        state.tabArr = item ? [item] : [];
    }
    try {
        nextTick(async () => {
            indexTableRef.value && await indexTableRef.value?.commitRequest();
            if (indexTableRef.value && indexTableRef.value?.getDom()) {
                indexTableRef.value?.getDom()?.recalculate?.(true);
            }

        });
      
        state.tableLoading = false;
    }
    catch (e) {
        state.tableLoading = false;
    }
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
    userDel({delApi: menusApi.delOneMenu, sid: row.id, loadData: handleTableData});
};

onMounted(async () => {
    let {
        table_columns,
    } = await tableRender.formatTitle({title: menu, isCustomTitle: true});
    const needSlots = ['title', 'level_1', 'permissions_url'];

    if (table_columns && Array.isArray(table_columns)) {
        for (let item of table_columns) {
            let { field, oriTitle } = item;

            if (needSlots.indexOf(field) > -1) {
                item.slots = {
                    default: field
                };
            }
            if(item.children) {
                for(let child of item.children) {
                    if(child.field === 'vue_url') {
                        child.showOverflow = false;
                    }
                }
            }
            switch (field) {
                case 'sorting':
                    item.dragSort = true;
                    break;
                case 'menu_describe':
                    item.showOverflow = false;
                    break;
                case 'permissions_url':
                case 'page_data_source':
                    item.showOverflow = false;
                    item.slots = {
                        default: field,
                    };
                    break;
                case 'level_2':
                    item.formatter = ({cellValue}) => {
                        let result = oriTitle?.title_data ? oriTitle.title_data?.[findKey(oriTitle.title_data, (i => i.id === cellValue))]?.menu_name || cellValue : cellValue;
                        return result;
                    };
                    break;
            }
        }
    }

    state.initColumn = table_columns || [];
    await getPrimaryMenu();
    await handleTableData();
   
});

// 查看title
const handleConfigMenuTitle = async (row) => {
    state.activeTab = row?.id;
    const menuTitle = clone(row, true);
    state.tabArr.push(menuTitle);
    state.tabArr = uniq(state.tabArr, 'id');
};


const showTitle = computed(() => {
    return state.tabArr.find(item => item.id === state.activeTab)?.level_2 !== 0;
});



// tab标签上不同的菜单title配置tab
const titleConfigTabChange = (activeKey) => {
    let currentActiveRow = state.tabArr[findKey(state.tabArr, item => item.id === activeKey)];
    if (currentActiveRow.level_1) {
        indexTableRef.value && indexTableRef.value?.commitRequest();
    } else  {
        state.activeTab = currentActiveRow.id;
    }

};


// tab的删除
const handleTabEdit = (targetKey, action) => {
    if (action === 'remove') {
        state.tabArr = state.tabArr.filter(item => item.id !== targetKey);
        if (state.tabArr.length === 0) {
            state.activeTab = null;
        } else {
            let currentActiveRow =  state.tabArr[state.tabArr.length - 1];
            state.activeTab = state.tabArr[state.tabArr.length - 1].id;
            if (currentActiveRow.level_1) {
                indexTableRef.value && indexTableRef.value?.commitRequest();
            }
        }
    }
};

/** 行拖动的排序的逻辑 --Start**/
let sortable1 = null;
let sortableMenuLevel = null;


// 表格的rowgrag
const rowDragendEvent = ({ newRow, oldRow }) => {
    console.log('newRow', newRow, 'oldRow', oldRow);
    
    let dataRowIndex = state.tableData.findIndex(item => item.id === newRow.id) > -1 ? state.tableData.findIndex(item => item.id === newRow.id) : state.leftMenuLevel.findIndex(item => item.id === newRow.id); // 目标行所在数据的位置
    
    if (dataRowIndex > -1) {
        menusApi.putOneMenuSort(oldRow.id, dataRowIndex + 1).then((res) => {
            opsMessageTip({content: res?.msg, closeCallback: () => {
                handleTableData(state.selectedLeftKeys);
            }});
        }).catch(() => {
            nextTick(() => {
                handleTableData(state.selectedLeftKeys);
            });
        });
    }
};


onUnmounted(() => {
    clearTimeout(initTime);
    sortable1 && sortable1.destroy();
    sortableMenuLevel && sortableMenuLevel.destroy();

});
/** 行拖动的排序的逻辑 --End**/
// 查看数据源
function viewDataSource(data) {
    state.dataSourceVisible = true;
    state.dataSourceHighlight = syntaxHighlight(data);
}






</script>

<template>
   <div class="w-full mb-4">
    <a-space-compact block>
       <a-input placeholder="一级菜单"  :style="{
          width: '100px',
          borderLef: 0,
          borderRight: 0,
          pointerEvents: 'none',
        }" disabled/>
        <ops-a-select 
            v-model:value="selectLevel1" 
            :style="{ width: '50%' }"
            placeholder="请选择一级菜单"
            :options="state.leftMenuLevel"
            @change="handleTableData"
        
        />
          
     
    </a-space-compact>

   
  </div>
    <a-layout style="height: 100%">
      

        <a-layout style="background: #fff; height: 100%;">
            <a-tabs v-model:activeKey="state.activeTab" type="editable-card" hide-add @change="titleConfigTabChange" @edit="handleTabEdit">
                <a-tab-pane v-for="menu2 in state.tabArr" :key="menu2.id" :tab="menu2.level_2 !== 0 ? `【${menu2.menu_name}】Title配置` : `【${menu2.menu_name}】二级菜单`" :closable="menu2.level_2 !== 0" :force-render="true">
                </a-tab-pane>
            </a-tabs>
            
            <a-layout-content>
                <Title :show-title="showTitle" :menu-id="state.activeTab"/>

                <ops-table
                    v-show="!showTitle"
                    ref="indexTableRef"
                    v-model:data="state.allData"
                    v-model:fullData="state.tableData"
                    :columns="state.initColumn"
                    :auth-btn="canUserAction"
                    :row-config="{
                        isHover: true,
                        isCurrent: true,
                        drag: true,
                    }"
                    :default-order="{
                        field: 'sorting',
                        order: 'asc',
                    }"
                    :request-config="{
                        api: menusApi.getMenusList,
                        params: selectLevel1,
                        immediate: false,
                    }"
                     :switch-click-status-config="{
                        api: menusApi.putOneMenuEdit,   
                    }"
                    @user-edit="handleUserEdit"
                    @user-add="userEdit({type:$CONFIG.FORM_TYPE.ADD_TYPE})"
                    @user-del="handleUserDel"
                    @row-dragend="rowDragendEvent"
                >


                    <template #level_1="{ row }">
                        <a-tag :color="row.level_1 ? 'green': 'red'">{{ row.level_1 ? '是': '否' }}</a-tag>
                    </template>
                    <template #vue_url="{ row }">
                        <div class="overflow-hidden">
                            <a-tooltip >
                                <template #title>
                                    {{ row.icon }}<br/>
                                    {{ row.vue_url }}
                                </template>
                                {{ row.icon }}<br/>
                                <a-tag color="purple" >{{ row.vue_url }}</a-tag>
                            </a-tooltip>
                        </div>
                    </template>
                    <template #menu_name="{ row }">
                        {{ state.leftMenuLevel.find(item => item.id === row.level_2)?.menu_name }} <br/>
                        {{ row?.menu_name }}

                    </template>
                    <template #permissions_url="{ row }">
                        <div v-if="row?.permissions_url" style="overflow: hidden">
                            <template v-for="url in row.permissions_url" :key="url">
                                <a-tag color="purple">{{url}}</a-tag> <br/>
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
                    <template #title="{ row }">
                        <a-tooltip
                            v-if="row.level_1 !== 1"
                            title="页面title入口"
                            placement="left"
                            :get-popup-container="(triggerNode) => triggerNode.parentNode"
                        >
                            <vxe-button 
                                mode="text" 
                                status="primary" 
                                content="查看标题"  
                                @click="handleConfigMenuTitle(row)"
                            ></vxe-button>
                        </a-tooltip>
                    </template>
                </ops-table>
            </a-layout-content>
        </a-layout>
    </a-layout>

    <edit
        v-model:open="formOpen"
        :sid="formSid"
        :form-type="formType"
        @edit-success="handleTableData"
    />
    <a-modal
        v-model:open="state.dataSourceVisible"
        title=""
        :centered="true"
        :closable="false"
        :footer="null"
    >
        <pre v-html="state.dataSourceHighlight"></pre>
    </a-modal>
</template>

<style scoped>
</style>
