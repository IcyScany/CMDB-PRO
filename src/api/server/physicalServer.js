import http from '@/utils/axios';

const urlPrefix = `server/physical-server/`;

export default {
    // 总览
    getOverview() {
        return http.get(`${urlPrefix}overview`);
    },
    // 获取列表
    getList(data) {
        return http.post(`${urlPrefix}list`, data);
    },
    // detail
    getDetail(sid) {
        return http.get(`${urlPrefix}list/${sid}`);
    },
    // 编辑
    putEdit(sid, data) {
        return http.put(`${urlPrefix}edit/${sid}`, data);
    },
};
