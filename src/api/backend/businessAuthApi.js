import http from '@/utils/axios';

const urlPrefix = `manage/business/authorization/`;

export default {
    // 读取所有的业态: 传参business_sid表示读取某个业态的授权
    getBusinessAuthList(business_sid) {
        return http.get(`${urlPrefix}list${business_sid ? `/${business_sid}` : ''}`);
    },


    // 更新业态授权
    putOneBusinessEdit(business_sid,data) {
        return http.put(`${urlPrefix}${business_sid}`, data);
    },

};
