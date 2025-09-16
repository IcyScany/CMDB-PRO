
import http from "@/utils/axios";

const urePrefix = 'system/user-group/';
export default {
    // 读取业态的用户组
    getUserGroupList() {
        return http.get(`${urePrefix}list`);
    },

    // 新增业态用户组
    postUserGroupAdd(data) {
        return http.post(`${urePrefix}add`, data);
    },

    // 编辑业态用户组
    putUserGroupEdit(user_group_sid, data) {
        return http.put(`${urePrefix}edit/${user_group_sid}`, data);
    },
};
