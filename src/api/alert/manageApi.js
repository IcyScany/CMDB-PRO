/* 告警管理Api */

import http from '@/utils/axios';
import systemConfig from '@/config/index';
let { HEADER_CONFIG  } = systemConfig;

const urlPrefix = `alert/`;

export default {
    // 告警总览
    getOverview() {
        return http.get(`${urlPrefix}show/overview`,  {showLoading: true});
    },
    // 告警清单
    info: { 
        // 告警清单列表
        postList(params) {
            return http.post(`${urlPrefix}info/list`, params);
        },
        // 告警ACK
        putAck(alert_sid, params) {
            return http.put(`${urlPrefix}info/edit/${alert_sid}`, params);
        },
        // 告警历史节段查询
        getHistorySegment({alert_sid}) {
            return http.get(`${urlPrefix}info/history-segment/${alert_sid}`,   {showLoading: true, ...HEADER_CONFIG});
        },
        // 告警原始数据查询
        getSourceData({log_sid}) {
            return http.get(`${urlPrefix}info/source-data/${log_sid}`, {showLoading: true, ...HEADER_CONFIG});
        }

    },
    // 告警分组
    group: {
        // 告警分组列表
        postList(params) {
            return http.post(`${urlPrefix}group/list`, params);
        },
        // 新增
        postAdd(params) {
            return http.post(`${urlPrefix}group/add`, params);
        },
        // 编辑
        putEdit(group_sid, params) {
            return http.put(`${urlPrefix}group/edit/${group_sid}`, params);
        },
        // 删除
        delete(group_sid) {
            return http.delete(`${urlPrefix}group/delete/${group_sid}`);
        },
        // 详情
        getDetail(group_id) {
            return http.get(`${urlPrefix}group/list/${group_id}`);
        },

    },
    // 告警级别
    level: {
        // 告警级别列表
        getList(level_id = null) {
            return http.get(`${urlPrefix}level/list${level_id ? `/${level_id}` : ''}`);
        },
        // 新增
        postAdd(params) {
            return http.post(`${urlPrefix}level/add`, params);
        },
        // 编辑
        putEdit(level_id, params) {
            return http.put(`${urlPrefix}level/edit/${level_id}`, params);
        },
        // 删除
        delete(level_id) {
            return http.delete(`${urlPrefix}level/delete/${level_id}`);
        },
    }
};  