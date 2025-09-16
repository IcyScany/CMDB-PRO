import http from '@/utils/axios';
const urlPrefix = `manage/advanced-authorization/`;

export default {
    // 读取菜单和title列表
    getMenuAndTitleList() {
        return http.get(`${urlPrefix}menu-title/list`, {showLoading: true});
    },
    // 读取业态菜单和title列表
    getBusinessMenuAndTitleList(business_sid) {
        return http.get(`${urlPrefix}business/menu-title/list/${business_sid}`);
    },
    // 读取业态菜单和title授权id
    getBusinessMenuAndTitleAuthorizationId(business_sid) {
        return http.get(`${urlPrefix}business/menu-title/authorization/${business_sid}`);
    },
    // 同步并更新高级功能授权
    syncAndUpdateAdvancedAuth(data) {
        return http.put(`${urlPrefix}menu-title/authorization`, data);
    },
    // 同步业态功能授权
    syncBusinessMenuAndTitleAuth(business_sid, data) {
        return http.put(`${urlPrefix}business/menu-title/authorization/${business_sid}`, data);
    },
};