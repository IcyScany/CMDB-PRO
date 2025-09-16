import http from '@/utils/axios';
import systemConfig from "@/config";
const urlPrefix = `system/virtual-team/`;
let { HEADER_CONFIG  } = systemConfig;
export default {
    // 获取虚拟用户组列表
    async getVirtualTeamList() {
        return http.get(`${urlPrefix}list`);
    },

    // 获取虚拟组的明细
    getVirtualTeamOneData(virtual_team_sid) {
        return http.get(`${urlPrefix}list/${virtual_team_sid}`);
    },

    // 获取虚拟用户组加载的用户列表
    async getVirtualTeamUserList(param) {
        return http.get(`${urlPrefix}user/list${param}`);
    },

    // 获取一个虚拟组用户组的用户
    getVirtualTeamOneUserData(virtual_team_sid) {
        return http.get(`${urlPrefix}list/${virtual_team_sid}/user`);
    },

    // 新增虚拟用户组
    postAddVirtualTeam(data) {
        return http.post(`${urlPrefix}add`, data);
    },

    // 编辑虚拟用户组
    putEditVirtualTeam(virtual_team_sid, data) {
        return http.put(`${urlPrefix}edit/${virtual_team_sid}`, data);
    },

    // 编辑虚拟用户组中的用户
    putEditVirtualTeamUser(virtual_team_sid, data ) {
        return http.put(`${urlPrefix}user/edit/${virtual_team_sid}`, data, HEADER_CONFIG);
    },

};
