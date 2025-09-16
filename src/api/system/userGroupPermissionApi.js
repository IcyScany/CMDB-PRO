
import http from "@/utils/axios";

const urePrefix = 'system/user-group/';
export default {
    // 读取用户组授权列表: 传了user_group_sid参数表示: 获取一个用户组权限
    getUserGroupPermissionsList(user_group_sid) {
        return http.get(`${urePrefix}permissions${user_group_sid ? `/${user_group_sid}`: '' }`);
    },
    /* 
    读取用户组中用户列表: params表示传递的参数
    如果params为空，则表示获取所有用户组中的所有用户
    如果params传的是id，则表示获取一个用户组中的所有用户
    如果params传的是search，则表示根据邮箱、手机号精确搜索
    */
    getUserGroupUserList(params, args) {
        return http.get(`${urePrefix}user/list${params ? params: '' }`, args);
    },
    // 编辑用户组权限
    putUserGroupPermissionEdit(user_group_sid, data) {
        return http.put(`${urePrefix}permissions/${user_group_sid}`, data);
    },
    // 编辑用户组的用户
    patchUserGroupUserPermissionEdit(user_group_sid, data) {
        return http.patch(`${urePrefix}permissions/user/edit/${user_group_sid}`, data);
    },
};
