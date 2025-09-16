import http from "@/utils/axios";

const urePrefix = 'system/user/';

export default {
    // 获取用户列表: 传user_sid表示读取一个用户
    getUserList(user_sid) {
        return http.get(`${urePrefix}list${user_sid ? `/${user_sid}` : ''}`);
    },
    // 新增用户
    postUserAdd(data) {
        return http.post(`${urePrefix}add`, data);
    },
    // 编辑用户
    putUserEdit(user_sid, data) {
        return http.put(`${urePrefix}edit/${user_sid}`, data);
    },
    // 删除用户
    delUser(user_sid, data) {
        return http.delete(`${urePrefix}del/${user_sid}`, data);
    },

};
