import http from '@/utils/axios';
import systemConfig from '@/config/index';

/* 网络硬件清单 */
const urlPrefix = `network/network-device/`;
let { HEADER_CONFIG  } = systemConfig;
export default {
    // 获取列表
    postList(data) {
        return http.post(`${urlPrefix}list`, data);
    },
    // detail
    getDetail(sid) {
        return http.get(`${urlPrefix}list/${sid}`);
    },
    getCopyPwd({sid}) {
        return http.get(`${urlPrefix}copy_pwd/${sid}`, HEADER_CONFIG);
    },
    // 新增
    postAdd(data) {
        return http.post(`${urlPrefix}add`, data);
    },
    // 编辑
    putEdit(sid, data) {
        return http.put(`${urlPrefix}edit/${sid}`, data);
    },
    // 删除
    del(sid) {
        return http.delete(`${urlPrefix}del/${sid}`);
    },
    //获取单个网络硬件的路由与端口
    getInterfaceRoutes({sid, type}) {
        return http.get(`${urlPrefix}list/${sid}/interface-routes${type ? `?interface=${type}` : ''}`);
    },
    // 数据解析
    postInterfaceRoutesParse(data) {
        return http.post(`${urlPrefix}add/analysis-data`, data, HEADER_CONFIG);
    },
    // 路由与端口
    postAddInterface(data) {
        return http.post(`${urlPrefix}add/interfaces-route`, data);
    },
    // 总览
    getOverview(data) {
        return http.post(`${urlPrefix}overview`, data);
    },
};
