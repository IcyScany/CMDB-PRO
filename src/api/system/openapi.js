import http from "@/utils/axios";

const urePrefix = 'system/open-api-user/';

export default {
    // 获取用户列表
    getUserList() {
        return http.get(`${urePrefix}list`);
    },
    getUserDetail(sid) {
        return http.get(`${urePrefix}detail/${sid}`);
    },
    // 新增用户
    postUserAdd(data) {
        return http.post(`${urePrefix}create`, data);
    },
    // 编辑用户
    putUserEdit(sid, data) {
        return http.put(`${urePrefix}update/${sid}`, data);
    },
    // 删除用户
    delUser(sid, data) {
        return http.delete(`${urePrefix}delete/${sid}`, data);
    },

    // 获取用户权限
    getUserPermission(sid) {
        return http.get(`${urePrefix}permissions/${sid}`);
    },
    // 用户授权
    postUserAuthorize(sid, data) {
        return http.post(`${urePrefix}authorize/${sid}`, data);
    },

    // 获取路由列表
    getRouteList() {
        return http.get(`system/open-api-route/list`);
    },
    // 获取路由列表
    postRouteAdd(data) {
        return http.post(`system/open-api-route/create`, data);
    },
};
