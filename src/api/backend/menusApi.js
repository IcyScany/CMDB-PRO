import http from '@/utils/axios';

const urlPrefix = `manage/menus/`;

export default {
    /*获取1级菜单时传0,获取一级菜单下的二级菜单传{一级菜单的sid}*/
    getMenusList(menus_sid) {
        return http.get(`${urlPrefix}list/${menus_sid}`);
    },

    // 读取一个菜单
    getOneMenusList(menus_sid) {
        return http.get(`${urlPrefix}get-one/${menus_sid}`);
    },

    // 新增二级菜单
    postOneMenuAdd(data) {
        return http.post(`${urlPrefix}add`, data);
    },

    // 编辑二级菜单
    putOneMenuEdit(menus_sid,data) {
        return http.put(`${urlPrefix}edit/${menus_sid}`, data);
    },

    // 排序二级菜单
    putOneMenuSort(menus_sid,idx) {
        return http.put(`${urlPrefix}sort/${menus_sid}?menu_sort=${idx}`);
    },

    // 删除二级菜单
    delOneMenu(menus_sid) {
        return http.delete(`${urlPrefix}del/${menus_sid}`);
    },
};
