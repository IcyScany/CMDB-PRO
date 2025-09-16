<script setup>
import tableRender from "@/composables/table/tableRender";
import cloudWafApi from "@/api/security/cloudWafApi";
import RuleHitCount from "./ruleHitCount/index.vue";
import SourceList from "./sourceList/index.vue";
import BasicInfo from "./basicInfo/index.vue";
import { policyMap } from "./config";
import { ADD_TYPE, EDIT_TYPE } from "@/config/globalOption";
import PolicyEdit from "./policyEdit.vue";

const props = defineProps({
    open: Boolean,
    rowColumns: Array,
    titleData: Object,
    policyRows: Array,
    searchPolicyId: String,
});
const emit = defineEmits(['update:open']);

const TITLE_LAYER = 2;
const widthMaps = [4, 50, 98];

const state = reactive({
    initColumn: [],
    initTitleData: [],
    activedTab: '',
    hitCountOpen: false,
    hitCountData: {},
    cardCollapse: true,
    searchQuery: '',
    expandWidth: 50,
    tableLoading: false,
    repeatRuleOpen: {
        '阿里云': false,
        '华为云': false,
    },
});

const editConfig = reactive({
    open: false,
    type: 0,
    editData: {},
    editCloud: '',
});

// 基础信息展示列
const baseInfoColumns = computed(() => {
    const columnsCopy = [...props.rowColumns];
    const cloudSourceIdx = columnsCopy.findIndex(col => col.field === 'cloud_source');
    if (cloudSourceIdx > 0) {
        const [cloudSourceCol] = columnsCopy.splice(cloudSourceIdx, 1);
        columnsCopy.unshift(cloudSourceCol);
    }
    return state.cardCollapse ? columnsCopy.slice(0, 2) : columnsCopy;
});

// tab选项
const policyTabs = computed(() => {
    const policyTitleMap = props.titleData['policy'] || {};

    const tabs = Object.entries(policyMap)
        .map(([key, map]) => ({
            label: policyTitleMap[map?.['华为云']?.key] || map.key,
            key: key
        }));

    tabs.push({ label: '源站配置信息', key: 'source' });
    return tabs;
});

onMounted(async () => {
    const { columns, title_data } = await tableRender.setColumn({ layer: TITLE_LAYER });
    state.initColumn = columns.value || [];
    state.initTitleData = title_data.value || [];
});

// 打开模态框
const handleAfterOpenChange = (val) => {
    if (val) {
        state.activedTab = policyTabs.value[0]?.key;
        if(props.searchPolicyId) {
            nextTick(() => {
                state.searchQuery = props.searchPolicyId;
                let policyDetail = props.policyRows[0]?.policy_detail;
                let tab = Object.keys(policyDetail).find(key => {
                    return JSON.stringify(policyDetail[key]).includes(props.searchPolicyId);
                });
                state.activedTab = tab;
            });
        }
    } else {
        state.activedTab = '';
        state.cardCollapse = true;
        state.searchQuery = '';
        state.expandWidth = 50;
    }
};

// 显示防护规则近30天触发次数
const showRule = (row) => {
    cloudWafApi.getRule(row, row.cloud_source).then(res => {
        state.hitCountOpen = true;
        state.hitCountData = res;
        state.hitCountData.modelTitle = row.name || row.ruleid || row.id;
    });
};

// 展开卡片
const handleExpandIconClick = () => {
    state.expandWidth = widthMaps[widthMaps.indexOf(state.expandWidth) + 1] || widthMaps[0];
};

// 获取卡片宽度
const getExpandStyle = () => {
    return [
        {
            width: props.policyRows[1] ? state.expandWidth + '%' : '100%',
            show: state.expandWidth !== widthMaps[0]
        },
        {
            width: (100 - state.expandWidth) + '%',
            show: state.expandWidth !== widthMaps[2]
        }
    ];
};

// 新增
const handleAdd = () => {
    editConfig.open = true;
    editConfig.type = ADD_TYPE;
};

// 编辑
const handleEdit = (rowData, editData) => {
    editConfig.open = true;
    editConfig.type = EDIT_TYPE;
    editConfig.editData = editData;
    editConfig.editCloud = rowData.cloud_source;
};

// 编辑成功
const handleEditSuccess = () => {
    editConfig.open = false;
};

// 刷新
const handleRefresh = async () => {
    state.tableLoading = true;

    props.policyRows.forEach(async (row) => {
        await cloudWafApi.getDetail(row.id);
    });

    state.tableLoading = false;
};

// 重复规则
const handleRepeatRule = (cloudSource) => {
    state.repeatRuleOpen[cloudSource] = true;
};

</script>

<template>
    <ops-form-container
        :open="open"
        :title="policyRows?.[0]?.hostname || policyRows?.[0]?.domain"
        width="100%"
        @close="emit('update:open', false)"
        @after-open-change="handleAfterOpenChange"
    >
        <!-- 基础信息 -->
        <div class="flex gap-2 basic-info">
            <a-card                    
                v-for="(data, index) in policyRows"
                :key="index"
            >
                 <div 
                    v-if="index === policyRows.length - 1" 
                    class="card-collapse" 
                    @click="state.cardCollapse = !state.cardCollapse"
                >
                    <span v-if="state.cardCollapse">展开 <FullscreenOutlined/></span>
                    <span v-else>折叠 <FullscreenExitOutlined/></span>
                </div>

                <basic-info
                    :data="data"
                    :columns="baseInfoColumns"
                    :column="policyRows[1] ? 1 : 2"
                    :title-data="titleData"
                />
            </a-card>
        </div>

        <!-- TABs -->
        <a-tabs 
            v-model:activeKey="state.activedTab" 
            size="small" 
            style="margin-top: 10px;"
            type="card"
        >
            <a-tab-pane 
                v-for="(item) in policyTabs" 
                :key="item.key" 
                :tab="item.label"
            />
        </a-tabs>

        <!-- 功能区域 -->
        <div v-if="state.activedTab !== 'source'" class="tool-box">
            <vxe-button status="primary" icon="vxe-icon-add" size="small" @click="handleAdd">新增</vxe-button>
            <template v-if="state.activedTab === 'cc'">
                <vxe-button
                    v-for="cloudSource in policyRows.map(row => row.cloud_source)" 
                    :key="cloudSource"
                    size="small"
                    @click="handleRepeatRule(cloudSource)"
                >
                    <CloudTypeIcon
                        style="width: none; margin-right: 4px;"
                        :type="cloudSource"
                    />
                    重复规则
                </vxe-button>
            </template>

            <a-input 
                v-model:value="state.searchQuery" 
                class="search-input" 
                placeholder="搜索规则" 
                allow-clear
            />

            <vxe-button 
                :icon="`vxe-icon-repeat ${state.tableLoading ? 'roll': ''}`" 
                circle
                class="ml-2"
                @click="handleRefresh"
            />
        </div>

        <!-- 数据展示区域 -->
        <div 
            class="data-container gap-2"
            :style="{ 
                height: state.cardCollapse ? 'calc(100% - 140px)' : 'calc(100% - 320px)',
                width: state.cardCollapse ? '100%' : 'calc(100% - 10px)'
            }"
        >
            <div 
                v-for="(data, index) in policyRows" 
                :key="index"
                class="data-section" 
                :style="{ 
                    width: getExpandStyle()[index]?.width,
                }"
            >
                <div 
                    v-if="policyRows[1] && index === 0" 
                    class="expand-icon" 
                    @click="handleExpandIconClick"
                >
                    <span v-if="getExpandStyle()[1].show">
                        展开 <DoubleRightOutlined/>
                    </span>
                    <span v-else>
                        收起 <DoubleLeftOutlined/>
                    </span>
                </div>

                <div v-show="getExpandStyle()[index].show" class="h-full">
                    <!-- 策略表格 -->
                    <template v-if="state.activedTab !== 'source'">
                        <component
                            :is="policyMap?.[state.activedTab]?.[data?.cloud_source]?.component"
                            v-model:repeatRuleOpen="state.repeatRuleOpen[data?.cloud_source]"
                            :row-data="data"
                            :search-query="state.searchQuery"
                            :table-data="data?.policy_detail?.[state.activedTab] || []"
                            @show-rule="showRule"
                            @edit="handleEdit"
                        />
                    </template>
        
                    <!-- 源站配置信息 -->
                    <template v-else>
                        <source-list :row-data="data" />
                    </template>
                </div>
            </div>
        </div>
    </ops-form-container>

    <!-- 规则触发次数 -->
    <rule-hit-count
        v-model:open="state.hitCountOpen"
        :rule-data="state.hitCountData"
        :init-column="state.initColumn"
    />

    <!-- 编辑 -->
    <policy-edit
        v-model:open="editConfig.open"
        :policy-rows="policyRows"
        :form-type="editConfig.type"
        :edit-data="editConfig.editData"
        :active-tab="state.activedTab"
        :active-tab-title="policyTabs.find(item => item.key === state.activedTab)?.label"
        :edit-cloud="editConfig.editCloud"
        @edit-success="handleEditSuccess"
    />
</template>

<style lang="scss" scoped>
:deep(.ant-card-body) {
    padding: 10px 24px !important;
}

.basic-info {
    :deep(.ant-descriptions-item) {
        padding-bottom: 1px !important;
    }
}

.card-collapse {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 14px;
    color: var(--primary-color);
    cursor: pointer;
}

.data-container {
    display: flex;
    min-height: 200px;
    justify-content: space-between;
}

.data-section {
    position: relative;
    height: 100%;
    width: 50%;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    transition: width 0.2s ease-in-out;
    overflow: auto;
    padding-top: 10px;

    :deep(.vxe-toolbar) {
        padding: 10px 10px;
    }
}

.expand-icon {
    position: absolute;
    top: 4px;
    right: 2px;
    font-size: 14px;
    z-index: 100;
    color: var(--primary-color);
    cursor: pointer;
}

.tool-box {
    display: flex;
    width: 100%;
    margin-bottom: 10px;

    .search-input {
        width: 400px;
        margin-left: auto;
    }
}

</style>