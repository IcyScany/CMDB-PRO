<script setup>
import API from "@/api/network/hardWareApi";
import { ADD_TYPE } from "@/config/globalOption";
import opsFormInit from "@/composables/form/opsFormInit";
import { VAceEditor } from 'vue3-ace-editor';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github_dark';

let props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    sid: { // 网络设备的ID
        type: Number,
        default: 0
    },
    subRow: {
        type: Object,
        default: () => ({})
    },
    pageTitle: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: ''
    },
    formType: { 
        type: Number,
        default: ADD_TYPE
    },
});

let { formType, sid, subRow } = toRefs(props);

const emits = defineEmits(['update:open', 'editSuccess']);
let formRef = ref(null);
const editTitleLayer = 2;
const { postInterfaceRoutesParse, postAddInterface } = API;

let activeStep = ref(null);
const {
    formRenderContent,
    formDataLoading,
    initForm,
    formDataInit,
    editSubmit,
} = opsFormInit({formRef, editTitleLayer,sid, formType, emits, addApi: postAddInterface,customSubmitData});
// 数据分析时的一些状态
let dataAnalysisState = reactive({
    ip_mask: {
        loading: false,
        value: '',
        result: '',
        msg: '',
        status: 'wait',
    },
    interface_describe: {
        loading: false,
        value: '',
        result: '',
        msg: '',
        status: 'wait',
    },
    route_info: {
        loading: false,
        value: '',
        result: '',
        msg: '',
        status: 'wait',
    },
});


const handleSave = async ({analysis_type, analysis_value}) => {
    dataAnalysisState[analysis_type].loading = true;
    dataAnalysisState[analysis_type].msg = '';
    dataAnalysisState[analysis_type].result = '';
    activeStep.value = stepsContent[analysis_type].id;
    dataAnalysisState[analysis_type].status = 'wait';
    postInterfaceRoutesParse({
        analysis_type: analysis_type,
        analysis:analysis_value,
        brand: subRow.value.brand,
        interface: subRow.value.interface,
    }).then(res => {
        dataAnalysisState[analysis_type].loading = false;
        dataAnalysisState[analysis_type].result = res?.data || [];
        dataAnalysisState[analysis_type].status = 'finish';
    }).catch(err => {
        dataAnalysisState[analysis_type].loading = false;
        dataAnalysisState[analysis_type].msg = err?.response?.data?.msg + `(${err?.response?.status})` || '解析失败';
        dataAnalysisState[analysis_type].status = 'error';

    });
};
// 添加编辑器配置
const editorOptions = {
    fontSize: 13,
    showPrintMargin: false,
    showLineNumbers: true,
    tabSize: 4,
    highlightActiveLine: true,
   
};


const exampleText = `Interface         IP Address/Mask      Physical   Protocol  VPN
10GE0/0/8         unassigned           down       down      --
10GE0/0/9         10.200.4.225/30      up         up        --
`.trim();
const stepsContent = {
    ip_mask: {
        id: 0,
        desc: '终端登录路由器，输入命令（端口清单)',
        command: { // 不同的品牌对应不同的指令
            common: 'display ip interface brief | no-more',
            Cisco: 'show ip interface',
        },
        example: {
            common: exampleText,
            Cisco: `
            Embedded-Service-Engine0/0 is administratively down, line protocol is down
Internet protocol processing disabled
GigabitEthernet0/0 is up, line protocol is up
Internet address is 10.128.1.253/29
Broadcast address is 255.255.255.255
                `.trim(),
        },
        show_example: ref(false),
    },
    interface_describe: {
        id: 1,
        desc: '输入命令（出端口与描述）',
        command: {
            common: 'display interface description | no-more',
            Cisco: 'show interface description',
        },
        example: {
            common: `Interface   PHY   Protocol   Description
10GE0/0/8   down  down       --
10GE0/0/9   up    up         chuizhi-to-AR2`.trim(),
            Cisco: `
            Interface     Status       Protocol    Description
Em0/0         admin down   down        --
Gi0/0         up           up          --
Gi0/1         up           up          zhuanxian-to-BaoShan(CPSL00007152)
Gi0/2         up           up          --
            `.trim(),
        },
        show_example: ref(false),
    },
    route_info: {
        id: 2,
        desc: '输入命令（路由信息）',
        command: {
            common: 'display ip routing-table | no-more',
            Cisco: 'show ip route',
        },
        field: 'routingTable',
        example: {
            common: `
            Destination/Mask  Proto  Pre  Cost  Flags  NextHop        Interface
3.3.3.0/24        O_ASE  150  20    D      10.200.4.198   GE0/0/1

            `.trim(),
            Cisco: `
    O E2     10.0.0.0/16 [110/20] via 10.20.4.21, 7w0d, GigabitEthernet0/1
O E2     10.1.0.0/16 [110/20] via 10.20.4.23, 7w0d, GigabitEthernet0/1
O E2     10.2.2.0/24 [110/20] via 10.20.4.2, 7w0d, GigabitEthernet0/1
O E2     10.2.2.0/24 [110/20] via 10.20.4.2, 7w0d, GigabitEthernet0/1
O E2     10.2.2.0/24 [110/20] via 10.20.4.2, 7w0d, GigabitEthernet0/1
O E2     10.3.1.0/24 [110/20] via 10.20.4.2, 7w0d, GigabitEthernet0/1
O E2     10.4.1.0/24 [110/20] via 10.20.4.2, 7w0d, GigabitEthernet0/1
            `.trim()
        },
        show_example: ref(false),

    }
};

const handlePageInit = async () => {
    dataAnalysisState = reactive({
        ip_mask: {
            loading: false,
            value: '',
            result: '',
            msg: '',
            status: 'wait',
        },
        interface_describe: {
            loading: false,
            value: '',
            result: '',
            msg: '',
            status: 'wait',
        },
        route_info: {
            loading: false,
            value: '',
            result: '',
            msg: '',
            status: 'wait',
        },
    });
};

// 弹窗show时，初始化表单
const handleModalShow = async () => {
    await handlePageInit();
    await initForm();
    await formDataInit();
};

// 处理数据的解析
const handleDataAnalysis = async (field) => {
    dataAnalysisState[field].loading = false;
    if(formRenderContent.value?.formState[field].trim()) {
        await handleSave({
            analysis_type: field,
            analysis_value: formRenderContent.value.formState[field].trim(),
        });
    } else {
        dataAnalysisState[field].status = 'wait';
        dataAnalysisState[field].result = '';
        dataAnalysisState[field].msg = '';
    }
    

};
const handleChange = (field, val) => {
    if(!val.trim()) {
        dataAnalysisState[field].status = 'wait';
        dataAnalysisState[field].result = '';
        dataAnalysisState[field].msg = '';

    }
};

// 示例的渲染
const openExample = (field) => {
    stepsContent[field].show_example.value = !stepsContent[field].show_example.value;
    for(let item in stepsContent) {
        if(!(item === field && stepsContent[item].show_example.value)) {
            stepsContent[item].show_example.value = false; // 其他的关闭
        }
    }
};

// 自定义处理提交数据
async function customSubmitData(data) {
    let postData = {
        hardware_sid: subRow.value?.id,
        analysis_type: subRow.value.brand,


    };
    for(let field in data) {
        console.log(field, data[field], dataAnalysisState);
        if(dataAnalysisState[field]?.result) {
            postData[field] = dataAnalysisState[field].result;
        }
    }
    return postData;
}

// 控制弹窗显示和内容
const resultModal = reactive({
    visible: false,
    field: '',
    data: [],
    title: '',
});

// 打开解析结果弹窗
const showResult = (field, t) => {
    resultModal.visible = true;
    resultModal.field = field;
    resultModal.data = dataAnalysisState[field]?.result || [];
    resultModal.title = t.field_name;
};

// 关闭弹窗
const closeResult = () => {
    resultModal.visible = false;
    resultModal.field = '';
    resultModal.data = [];
    resultModal.title = '';
};

const handleHide = () => {
    activeStep.value = null;
    emits('update:open', false);
};

</script>

<template>
    <vxe-modal
        :model-value="open"
        :loading="formDataLoading"
        show-footer
        resize
        :mask-closable="false"
        @close="handleHide"
        @hide="handleHide"
        @show="handleModalShow"
  >
        <template #title>
         NO.{{subRow.id}} 【网络设备：{{ subRow.hostname }} &nbsp;&nbsp;品牌 ：{{ subRow.brand }}】 {{ pageTitle }} 新增
        </template>


            <a-form
                ref="formRef"
                :model="formRenderContent.formState"
                :rules="formRenderContent.rules"
                layout="vertical"
            >
            <a-steps
                v-model:current="activeStep"
                direction="vertical"
                size="small"
                status="wait"
            >
                <template v-for="t in $utils.filter(formRenderContent.title, item => item.edit_display)" :key="t.field"> 
                    <a-step  :status="dataAnalysisState?.[t.field]?.status" disabled>
                        <template #title>
                           <b class="flex font-bold items-center"> {{ stepsContent?.[t.field]?.desc || t.field }}：
                            <template v-if="subRow?.brand === 'Cisco'">
                                <span class="flex items-center">
                                    <span class="border border-solid   rounded-md px-1 circle">1</span>
                                    <ops-copy-content  type="text" content="terminal length 0" style="margin-bottom: 0px;"/>
                                    <span class="border border-solid   rounded-md px-1 circle ml-2">2</span>
                                    <ops-copy-content type="text" :content="stepsContent?.[t.field]?.command?.[subRow.brand] || stepsContent?.[t.field]?.command?.common" style="margin-bottom: 0px;"></ops-copy-content>

                                </span>

                            </template>
                            <template v-else>
                                <ops-copy-content type="text" :content="stepsContent?.[t.field]?.command?.[subRow.brand] || stepsContent?.[t.field]?.command?.common"></ops-copy-content>
                            </template>
                            
                        </b>
                           
                        </template>
                        <template #description>
                            将得到的数据 <span class="no-underline hover:underline text-primary cursor-pointer" @click="openExample(t.field)">（格式示例）</span> 粘贴至下方输入框
                            <pre v-if="stepsContent?.[t.field]?.show_example.value" class="m-0" ><code>{{ stepsContent?.[t.field]?.example?.[subRow.brand] || stepsContent?.[t.field]?.example?.common }}</code></pre>
                            <ops-form-item
                                :title="t"
                                :title-data="formRenderContent?.title_data?.[t.field]"
                                :label="null"
                              
                            >
                            <template #label>
                                {{ t.field_name }}
                                <template v-if="formRenderContent?.formState?.[t.field]?.trim()">
                                    <vxe-button v-if="dataAnalysisState?.[t.field]?.result" status="primary" style="line-height: 0%;" content="解析结果" size="mini" @click="showResult(t.field, t)"/>
                                </template>

                            </template>
                            <a-spin :spinning="dataAnalysisState?.[t.field]?.loading">
                               
                                <v-ace-editor
                                    v-model:value="formRenderContent.formState[t.field]"
                                    lang="javascript"
                                    theme="github_dark"
                                    style="height: 100px"
                                    :options="editorOptions"
                                    @blur="(val) => handleDataAnalysis(t.field, val)"
                                    @change="handleChange(t.field, formRenderContent.formState[t.field])"
                                
                                />
                                <template v-if="formRenderContent?.formState?.[t.field]?.trim()">
                                    <span v-if="dataAnalysisState?.[t.field]?.msg" class="text-error">{{dataAnalysisState?.[t.field]?.msg}}</span>
                                </template>
                               
                            </a-spin>
                            </ops-form-item>

                            
                        </template>
                        <template v-if="dataAnalysisState?.[t.field]?.loading" #icon>
                            <i class="vxe-icon-spinner roll"></i>

                        </template>


                        

                      
                    </a-step>
                   
                </template>
            </a-steps>
           
        </a-form>
    
    <template #footer>
      <a-button class="mr-2" @click="handleHide" >取消</a-button>
      <vxe-button :disabled="!(dataAnalysisState?.ip_mask?.result && dataAnalysisState?.interface_describe?.result && dataAnalysisState?.route_info?.result)" status="primary" @click="editSubmit">提交</vxe-button>
      
    </template>
  </vxe-modal>
  <a-modal
    v-model:visible="resultModal.visible"
    :title="resultModal.title + '解析结果'"
    width="600px"
    :footer="null"
    @cancel="closeResult"
>
  <template v-if="Array.isArray(resultModal.data) && resultModal.data.length">
    <a-table
      :data-source="resultModal.data"
      :columns="Object.keys(resultModal.data[0] || {}).map(key => ({ title: key, dataIndex: key, key }))"
      :pagination="false"
      bordered
      size="small"
      row-key="interface"
    />
  </template>
  <template v-else>
    <a-empty description="暂无解析结果" />
  </template>
</a-modal>
</template>

<style scoped>
.circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;         /* 你可以根据实际需要调整 */
  height: 16px;
  border-radius: 50%;
  background: #f5f5f5; /* 浅灰色背景 */
  border-color: #d9d9d9 !important; /* 灰色边框 */
  color: #888;         /* 字体颜色可选 */
  font-size: 8px;
  margin-right: 4px;   /* 可选，和后面内容留点间距 */
}
</style>