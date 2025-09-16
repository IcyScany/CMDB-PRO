import http from '@/utils/axios';

const urlPrefix = `network/virtual-interfaces/`;

export default {
    // 获取列表
    postList(data) {
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

    // 获取总览
    getOverview() {
        return http.get(`network/connection/show/overview`);
    },
};
