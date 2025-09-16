import http from '@/utils/axios';

const urlPrefix = `monitor/expire_remind/`;

export default {
    // 获取总览
    getOverview(data) {
        return http.post(`${urlPrefix}overview`, data);
    },
    // 获取列表
    getList() {
        return http.get(`${urlPrefix}list`);
    },
    // detail
    getDetail(sid) {
        return http.get(`${urlPrefix}list/${sid}`);
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
    deleteDel(sid) {
        return http.delete(`${urlPrefix}delete/${sid}`);
    },
    // 获取用户列表
    getUserList() {
        return http.get(`${urlPrefix}user_list`);
    }
};
