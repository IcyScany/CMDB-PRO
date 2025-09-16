import http from '@/utils/axios';

const urlPrefix = `manage/title/`;
export default {
    // 读取一个菜单下的title
    getTitleList(menus_sid) {
        return http.get(`${urlPrefix}list/${menus_sid}`);
    },

   

    // 读取title的某一条数据
    getOneTitleList(title_sid) {
        return http.get(`${urlPrefix}get-one/${title_sid}`);
    },

    // 新增title
    postOneTitleAdd(data) {
        return http.post(`${urlPrefix}add`, data);
    },

    // 编辑Title
    putOneTitleEdit(title_sid,data) {
        return http.put(`${urlPrefix}edit/${title_sid}`, data);
    },

    // 排序Title
    putOneTitleSort(title_sid,idx) {
        return http.put(`${urlPrefix}sort/${title_sid}?title_sort=${idx}`);
    },

    // 删除Title
    delOneTitle(title_sid) {
        return http.delete(`${urlPrefix}del/${title_sid}`);
    },
};
