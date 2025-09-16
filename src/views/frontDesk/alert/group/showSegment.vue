<script setup>
import manageApi from "@/api/alert/manageApi";
import { VAceEditor } from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';


let {info} = manageApi;


const props = defineProps({
    open: {
        type: Boolean,
        default: false,
    },
    row: {
        type: Object,
        default: () => ({}),
    },
    type: {
        type: String,
        default: '',
    },
    titleData: {
        type: Object,
        default: () => ({}),
    },
});
const { open, row, type, titleData } = toRefs(props);
const emits = defineEmits(['update:open']);
// 添加编辑器配置
const editorOptions = {
    fontSize: 13,
    showPrintMargin: false,
    showLineNumbers: true,
    tabSize: 4,
    highlightActiveLine: true,
    readOnly: true
};



let segmentState = reactive({
    data: null,
    msg: '',
});


const handleDrawerOpen = async (val) => {
    if (val) {
        segmentState.data = null;
        segmentState.msg = '';
        // 获取节段与源数据
        let requestApi = type.value === 'segment' ?  info.getHistorySegment({alert_sid: row.value.id}) : info.getSourceData({log_sid: row.value.log_sid});
        
        requestApi.then(res => {
            console.log('获取节段与源数据', res);
            segmentState.data = type.value === 'source' ? JSON.stringify(res?.data, null, 2) : res;
        }).catch(err => {
            segmentState.msg = err?.response?.data?.msg || '获取日志失败';
        });
    } else {
        segmentState.data = null;
        segmentState.msg = '';
    }
};

// 关闭弹窗/取消
const handleDrawerClose = () => {
    emits('update:open', false);
};


</script>

<template>
    <ops-form-container
        :open="open"
        @after-open-change="handleDrawerOpen"
        @close="handleDrawerClose"
    >
        <template #title>
        <div class="flex">
            {{ `${$route.meta.title} - 告警清单NO.${ row?.id } -`}}
            <ops-copy-content v-if="type === 'source'" :content="segmentState.data">
                        <template #custom_title>
                            <span class="text-[16px]">源数据</span>
                        </template>
            </ops-copy-content>
            <span v-if="type === 'segment'">历史节段信息</span>
        </div>

        </template>
   
       
        <a-timeline v-if="segmentState?.data && type === 'segment'" :reverse="true">
          
            <a-timeline-item v-for="item in segmentState.data?.data" :key="item['id']">
                <p>{{item.create_time}} ({{item.id}}) </p>
                <p>当前状态: {{item.status ? `(${item.status})${titleData?.['curr_segment']?.[item.status] || ''}` : ''}}</p>
                <p>动作：{{item.msg}}</p>
                <p>告警时间： {{item.alert_time}}</p>
            </a-timeline-item>
        </a-timeline>
        <template v-else-if="type === 'source' && segmentState.data">
            
            <v-ace-editor
                v-model:value="segmentState.data"
                lang="json"
                theme="github"
                style="height: 100%"
                :options="editorOptions"
               
            />
        </template>
        
        <a-empty v-else  >
            <template #description>
                <a-alert v-if="segmentState.msg" type="error" :show-icon="true" :message="segmentState.msg"></a-alert>
                <span v-else>暂无数据</span>

            </template>
        </a-empty>
    </ops-form-container>
</template>

<style scoped lang="less">

</style>
