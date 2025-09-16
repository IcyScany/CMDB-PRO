<script setup>
/* 应用开始构建 */
import opsFormInit from "@/composables/form/opsFormInit";
import mobileAppApi from '@/api/ci_cd/mobileApp';
import { useRoute } from 'vue-router';

const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    row: {
        type: Object,
        default: () => {},
    },
    formType: {
        type: Number,
      
    },
    sid: {
        type: [String, Number],
        default: '',
    },
});
const route = useRoute();
const {open, row, formType, sid} = toRefs(props);
const emits = defineEmits(['update:open', 'editSuccess']);
const editTitleLayer = 5;
const {postAddRelease, getNextVersion, getDeploymentTargetList} = mobileAppApi;
let formRef = ref(null);
let appDetail = inject('appDetail', {});
let isStartGetNextVersion = ref(false); // 是否开始获取下一个版本号
const appPlatform = computed(() => { // 当前应用平台
    return appDetail.value?.platform || '';
});
let deploymentTargetOptions = ref([]);
const customSubmitData = async (data) => {
    if(!(data?.deployment_target_ids && data?.deployment_target_ids?.length)){
        data.deployment_target_ids = null;
       
    }
    data.config_id = row.value.id;
    return data;
};
const customEditData = () => {
    console.log(row.value);
};
let {
    formRenderContent,
    formDataLoading,
    confirmLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, editTitleLayer, formType, sid,emits,addApi: postAddRelease,customSubmitData, customEditData});
const handleDrawerClose = () => {
    emits('update:open', false);
};

const handleDrawerOpen = async (val) => {
    if (val) {
        await initForm();
        await formDataInit();
       
        deploymentTargetOptions.value = [];
        if (appPlatform.value) {
            getDeploymentTargetList({platform: appPlatform.value}).then(res => {
                deploymentTargetOptions.value = [];
                for(let item of res.data){
                    if(item?.is_active){
                        deploymentTargetOptions.value.push({
                            label: item.name,
                            value: item.id,
                            title: item.description,
                            ...item,
                        });
                    }
                }
            });
        }
        getNextInternalVersion({target: {value: row.value.version}});
        
        
    }
};
// 计算下一个内部版本号
async function getNextInternalVersion(e) {
    formRenderContent.value.formState.version = e?.target?.value || '';
    isStartGetNextVersion.value = true;

    if(route?.query?.appId && formRenderContent.value.formState.version ){
        // 计算下一个内部版本号
        const res = await getNextVersion(Number(route.query.appId), formRenderContent.value.formState.version);
        formRenderContent.value.formState.internal_version = res?.internal_version_code || null;
        setTimeout(() => {
            isStartGetNextVersion.value = false;
        }, 500);
    } 
}

watch(() => open.value, (val) => {
    if (val) {
        handleDrawerOpen(val);
    }
});
</script>

<template>
    <ops-form-container
        :open="open"
        form-style="modal"
        :centered="true"
        width="50%"
        min-height="300px"
        @after-open-change="handleDrawerOpen"
        @close="handleDrawerClose"
    >
       <template #title>
            <h3>发起新发布</h3>
       </template>
        <p>您将使用配置 <b class="text-red-500 text-[16px]">{{row?.name || ''}} </b> 发起一次新的构建。</p>

      
        <b class="font-bold">基础信息</b>
      
        <a-spin :spinning="formDataLoading">
            <a-form
                ref="formRef"
                :model="formRenderContent.formState"
                :rules="formRenderContent.rules"

            >
                <template v-for="t in $utils.filter(formRenderContent.title, item => item.edit_display)" :key="t.field">
                    <template v-if="t.field === 'deployment_target_ids'">
                        <b class="font-bold">选择部署目标</b>
                        
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                           
                        >
                        <a-checkbox-group
                            v-model:value="formRenderContent.formState[t.field]"
                            :options="deploymentTargetOptions"
                         
                        />
                      </ops-form-item>
                    </template>
                    <template v-else-if="t.field === 'version'">
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                            @blur="getNextInternalVersion"
                            @change="isStartGetNextVersion = true"
                        >
                      
                      </ops-form-item>
                    </template>
                    <template v-else>
                        <ops-form-item
                            v-model:value="formRenderContent.formState[t.field]"
                            :title="t"
                            :title-data="formRenderContent?.title_data?.[t.field]"
                        >
                    </ops-form-item>
                    </template>
                  
                </template>
            </a-form>
        </a-spin>


       <template #footer>
            <div>
                <a-button type="default" @click="handleDrawerClose">取消</a-button>
                <a-button type="primary" :loading="confirmLoading" :disabled="isStartGetNextVersion" @click="editSubmit">确认并开始</a-button>
            </div>
       </template>
    </ops-form-container>
</template>

<style scoped>


</style>