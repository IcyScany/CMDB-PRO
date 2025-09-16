import http from '@/utils/axios';
import systemConfig from "@/config";
const urlPrefix = `dashboards/real-time-alerts/`;
let { HEADER_CONFIG  } = systemConfig;

export default {
    // 获取源数据
    getSourceData(alert_log_sid) {
        return http.get(`${urlPrefix}alert-log/${alert_log_sid}`, HEADER_CONFIG);
    },
    // 获取历史阶段
    getHistoryStage(alert_sid) {
        return http.get(`${urlPrefix}history-segment/${alert_sid}`);
    },
    // 获取告警阶段、告警分类的描述
    getDataConversion() {
        return http.get(`${urlPrefix}data-conversion`);
    },

    // 确认告警
    ackAlert(alert_sid, data) {
        return http.put(`${urlPrefix}ack/${alert_sid}`, data);
    },
};