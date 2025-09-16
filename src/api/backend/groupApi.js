import http from '@/utils/axios';
const urlPrefix = `manage/title/group/`;

export default {
    // 获取所有分组
    getGroupList() {
        return http.get(`${urlPrefix}list`);
    },
    // 读取title和菜单分层数据
    getTitleAndMenuTree() {
        return http.get(`${urlPrefix}menus-title`);
    },
    // 新增分组
    addGroup(data) {
        return http.post(`${urlPrefix}add`, data);
    },
    // 删除分组
    deleteGroup(group_id) {
        return http.delete(`${urlPrefix}del/${group_id}`);
    },
    // 编辑分组
    editGroup(group_id, data) {
        return http.put(`${urlPrefix}edit/${group_id}`, data);
    },
    // 获取分组下所有title
    getTitlesByGroupId(group_id) {
        return http.get(`${urlPrefix}${group_id}/titles`);
    },
    // title添加到分组
    addTitleToGroup(data) {
        return http.post(`${urlPrefix}mapping`, data);
    },
    
    // 从分组中移除title
    removeTitlesFromGroup(data) {
        return http.delete(`${urlPrefix}mapping`, { data });
    }
};