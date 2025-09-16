<script setup>
import tableRender from "@/composables/table/tableRender";
import userOperate from "@/composables/form/opsUserOperate";
import subPage from "@/composables/subPage";
import mobileAppApi from '@/api/ci_cd/mobileApp';
import AppBuildConfigEdit from './AppBuildConfigEdit.vue';
import AppStartBuild from './AppStartBuild.vue';

defineProps({
    buildConfigsData: { // 构建配置数据
        type: Array,
        default: () => [],
    }

});

const emits = defineEmits(['loadData', 'refreshReleaseData']);
const TITLE_LAYER = 2; // 标题层级
let buildConfigsState = reactive({
    initButton: [],
});
// 用于获取用户的操作权限
const canUserAction = computed(() => {
    return buildConfigsState.initButton.reduce((acc, btn) => {
        acc[btn.field] = btn;
        return acc;
    }, {});
});

onMounted(async () => {
    const { button, sub_page_columns } = await tableRender.setColumn({ layer: TITLE_LAYER });
    buildConfigsState.initButton = button.value;
    buildConfigsState.subPageColumns = sub_page_columns || [];

});
// 子页面
const {
    subPageOpen,
    subPageRow,
    handleSubPageOpen,
} = subPage();

// 用户操作相关
const { userEdit, userDel, formOpen, formType, formSid } = userOperate({});

// 用户新增编辑操作
const handleUserEdit = ({ type, row }) => {
    userEdit({ type: type, sid: row.id });
};

// 用户删除操作
const handleUserDel = (row) => {
    userDel({
        sid: row.id, delApi: mobileAppApi.delBuildConfig, loadData: () => {
            emits('loadData');
        }
    });
};

// 用户开始构建操作
const { userEdit: userEditStartBuild,  formOpen: formOpenStartBuild, formType: formTypeStartBuild, formSid: formSidStartBuild } = userOperate({});
let startBuildState = reactive({
    row: null,
});

// 开始构建成功
const handleStartBuildSuccess = () => {
    emits('loadData');
    emits('refreshReleaseData');
    formOpenStartBuild.value = false;
};



</script>

<template>
    <div>
        <!-- 标签页 -->
        <h3 class="text-lg font-semibold">构建配置</h3>
        <div class="bg-white rounded-lg shadow-sm border p-6">
            <div class="py-4">
                <template v-if="buildConfigsData.length > 0">
                    <div class="flex justify-between items-center mb-6">

                        <a-button v-if="canUserAction.add" type="primary"
                            @click="userEdit({ type: $CONFIG.FORM_TYPE.ADD_TYPE })">
                            <template #icon>
                                <PlusOutlined />
                            </template>
                            新增配置
                        </a-button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">



                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div v-for="config in buildConfigsData" :key="config.id"
                            class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <div class="flex justify-between items-start">
                                <div class="w-full">
                                    <h4 class="font-semibold text-primary cursor-pointer"
                                        @click="handleSubPageOpen(config)">{{ config.name
                                        }}</h4>
                                    <p class="text-sm text-gray-500 mt-1 flex ">
                                            <span class="w-[50%]">
                                                环境: <span class="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                                    {{config.build_env }}</span>
                                            </span>
                                            <span class="w-[50%]">
                                                版本号: 
                                                <span class="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                                    {{config.version }}
                                                </span>
                                            </span>
                                    </p>
                                    <p class="text-sm text-gray-500 mt-1 flex  ">
                                        <span class="w-[50%]">
                                                分支: <span
                                            class="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{{
                                            config.default_branch }}</span>
                                            </span>
                                      
                                        <span class="w-[50%]">
                                            构建号: <span
                                        class="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{{
                                        config.build_number }}</span>
                                        </span>
                                    </p>
                                </div>
                                <div class="flex flex-col items-end space-y-2">
                                    <vxe-button v-if="canUserAction?.start?.page_display" status="primary" @click="startBuildState.row = config;userEditStartBuild({ type: $CONFIG.FORM_TYPE.ADD_TYPE, sid: config.id })">
                                        <PlayCircleOutlined />{{ canUserAction?.start?.field_name || '开始构建' }}
                                    </vxe-button>
                                    <div class="flex space-x-1">
                                        <vxe-button v-if="canUserAction?.edit?.page_display" mode="text" status="primary"
                                            icon="vxe-icon-edit"
                                            @click="handleUserEdit({ type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: config })" />

                                        <vxe-button v-if="canUserAction?.del?.page_display" mode="text" status="danger"
                                            icon="vxe-icon-delete" @click="handleUserDel(config)" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </template>

                <div v-else class="text-center py-8">
                    <a-empty>

                        <template #description>
                            暂无构建配置<br />
                            <a-button v-if="canUserAction.add" type="primary"   @click="userEdit({ type: $CONFIG.FORM_TYPE.ADD_TYPE })">
                                <template #icon>
                                    <PlusOutlined />
                                </template>
                                新增配置
                            </a-button>
                        </template>
                    </a-empty>

                </div>
            </div>

        </div>
    </div>

    <ops-sub-page v-model:open="subPageOpen" :title="subPageRow?.name" :basic-config="{
        columns: buildConfigsState.subPageColumns,
        api: mobileAppApi.getBuildConfigList,
        sid: subPageRow?.id,
    }" @click-edit="handleUserEdit({ type: $CONFIG.FORM_TYPE.EDIT_TYPE, row: subPageRow })">

    </ops-sub-page>

    <!-- 构建配置新增编辑 -->
    <AppBuildConfigEdit v-model:open="formOpen" :sid="formSid" :form-type="formType" @edit-success="emits('loadData')" />

    <!-- 构建配置开始构建 -->
    <AppStartBuild v-model:open="formOpenStartBuild" :row="startBuildState.row" :form-type="formTypeStartBuild" :sid="formSidStartBuild" @edit-success="handleStartBuildSuccess" />
</template>

<style scoped></style>
