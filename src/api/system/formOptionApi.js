
import http from "@/utils/axios";

const urePrefix = 'public/from-option/';
export default {
    // 获取表单配置的维护数据
    getFormOptionList(menu_sid, layer) {
        return http.get(`${urePrefix}list/${menu_sid}/${layer}`);
    },

    // 表单配置维护数据的新增
    postFormOptionAdd(title_sid, data) {
        return http.post(`${urePrefix}add/${title_sid}`, data);
    },

    // 表单配置维护数据的编辑
    putFormOptionEdit(title_sid, data) {
        return http.put(`${urePrefix}edit/${title_sid}`, data);
    },

    // 表单配置维护数据的删除
    delFormOptionDel(options_sid) {
        return http.delete(`${urePrefix}del/${options_sid}`);
    },

};
