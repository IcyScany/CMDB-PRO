<script setup>
import html2canvas from "html2canvas";
import {message} from "ant-design-vue";


// 监控告警的微信视角
const props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    viewData: {
        type: Array,
        default: () => []
    },
    
    virtualteamLevel: {
        type: Array,
        default: () => []
    }
});
let {viewData} = toRefs(props);
let emits = defineEmits(['update:open', 'clearChecked', 'alertNotify']);
let picture = ref(null);
let alertState = inject('alertState');
// 配置项
const setup = {
    //useCORS: true, // 使用跨域
    backgroundColor: '#fff',
    color: '#000',
    imageTimeout: 0,
    zIndex: 9999999999999

};
//let link = ref(null)
let canvasDom = ref(null);

onMounted(() => {

});
// 导出图片
function exportPicture( ) {
    html2canvas(picture.value, setup).then(async (canvas) => {
        canvasDom.value = canvas;
        // 将canvas转换为blob类型
        await canvas.toBlob(blob => {
            // 创建一个图像剪贴板项
            const item =  new ClipboardItem({ 'image/png': blob });
            // 使用Clipboard API将图片写入剪贴板
            navigator.clipboard.write([item]).then(() => {
                message.success('微信视角复制成功', 2);
                emits('clearChecked');
            }).catch(error => {
                message.error('复制失败 ', error);
            });


        });
    });
}
function handleCancel() {
    emits('update:open', false);
}




</script>
<template>
    <a-modal
        :open="open"
        :mask="true"
        :closable="false"
        :mask-closable="true"
        :centered="true"
        width="auto"
        style="padding: 0px"
        :body-style="{padding: '0px', width: 'auto'}"
        wrap-class-name="weixin-modal-wrap"
        class="weixin-modal"
        @cancel="handleCancel"
    >
        <template #footer>
            <a-button style="width: 100%" type="primary"  @click="exportPicture">复制图片</a-button>
            

        </template>
        <div ref="picture">
            <template v-for="(item, idx) in viewData" :key="item.sid">
                <a-tag color="blue" style="width: 100%; text-align: center; margin-top: 2px">第<b>【{{idx + 1}}】</b>条</a-tag>

                <table  class="custom-table custom-table-bordered weixin-table darkblue" style="width: 300px;">
                    <thead class="thead-light">
                    <tr><th>告警ID</th><td>{{item.sid || item.id}}</td></tr>
                    <tr><th>级别</th><td :style="{backgroundColor: $CONFIG.ALERT_LEVEL_COLOR?.[item.alert_level || item.level]?.['color']}">{{item.alert_level || item.level}}</td></tr>
                    <tr><th>告警分类</th><td>
                        <a-tooltip>
                        <template #title>
                            {{ item?.bcm_alert_group_id ? alertState?.bcm_alert_group?.[item.bcm_alert_group_id]?.classify_name || item?.bcm_alert_group_id :'-' }} <br/>
                        </template>
                        <div class="ellipsis-1">
                            {{ item?.bcm_alert_group_id ? alertState?.bcm_alert_group?.[item.bcm_alert_group_id]?.classify_name || item?.bcm_alert_group_id :'-' }} 
                        </div> 
                    </a-tooltip>
                    </td></tr>
                    <tr><th>监控名称</th><td>
                        {{item?.item || (item?.business_uuid ? item?.business_name : '')}}
                    </td></tr>
                    <tr><th>告警时间</th><td>{{item?.alert_time?.time || item.start_time}}</td></tr>
                    <tr><th>投屏时间</th><td>{{item?.send_alert_time || item.screen_time}}</td></tr>
                    <tr><th>IP/应用</th><td rowspan="2">
                        <a-tooltip>
                        <template v-if="item.ip || item.alarm_name_describe" #title>
                            {{ item.ip }}<br/>
                            {{ item?.alarm_name_describe }} 
                        </template>
                        <div class="ellipsis-1" :class="{'cursor-pointer text-primary': item?.virtual_teams && Object.keys(item.virtual_teams).length > 0}" @click="emits('alertNotify', item)">
                            {{ item.ip }}<br/>
                            {{ item?.alarm_name_describe }}  
                            {{ item.ip && item.alarm_name_describe ? '' : '-' }}
                        </div>
                    </a-tooltip>
                    </td>
                    </tr>
                    <tr><th>描述</th>
                    </tr>
                    <tr>
                        <th>业态</th>
                        <td>
                            <a-tooltip  :overlay-style="{minWidth: '200px'}">
                                <template #title>
                                    {{item?.business_info?.[0] }}
                                </template>
                                <div class="info-content"> {{item?.business_info?.[0] ? item?.business_info?.[0].join(',') : item?.business_name}}</div>
                            </a-tooltip>
                        </td>
                    </tr>
                    <tr><th>当前值</th><td>  {{ item?.alert_time?.value === 0 || item?.alert_time?.value  ? Math.ceil(item.alert_time.value ) : item.curr_value === 0 || item.curr_value ? Math.ceil(item.curr_value) : ''}}</td></tr>
                  
                    <tr><th>告警类型</th><td>{{item?.alert_group?.item_type || item?.item_type}}</td></tr>
                    <tr><th>告警来源</th><td>{{item.source || item?.alarm_source}}</td></tr>
                    <template v-if="item.alert_info">
                        <tr>
                            <td colspan="2">
                                <div v-html="item.alert_info"></div>
                            </td>
                        </tr>
                    </template>
                    </thead>
                </table>
            </template>

        </div>

    </a-modal>
</template>



<style scoped lang="less">
:deep(.ant-modal.weixin-modal){
    width: 100% !important;
}
.weixin-table.darkblue {
    border-color: rgba(130, 157, 248, 0.705);
}
.alert_info {
    height: 100px;
    overflow-y: auto;
}

.weixin-table.custom-table {
    width: 500px;
    table-layout: fixed;
    word-break: break-all;
    th {
        width: 30%;
    }
    td {
        white-space: unset;
        overflow-wrap: break-word;
        .alert-info{
            max-height: 100px;
            overflow: auto;
        }
    }
}

.ellipsis-1 {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1; /*行数*/
}
.virteam-box {
    width: 100%;
    height: 100%;
}
:deep(.weixin-modal-wrap .ant-modal-content){
    padding: 0px !important;
}

</style>