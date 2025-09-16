import http from '@/utils/axios';

const urlPrefix = `manage/business/`;
export default {
    // 读取所有的业态: 传参business_sid表示读取业态的某一条数据
    getBusinessList(business_sid) {
        return http.get(`${urlPrefix}list${business_sid ? `/${business_sid}` : ''}`);
    },

    // 新增业态
    postOneBusinessAdd(data) {
        return http.post(`${urlPrefix}add`, data);
    },

    // 编辑业态
    putOneBusinessEdit(business_sid,data) {
        return http.put(`${urlPrefix}edit/${business_sid}`, data);
    },

    // 读取业态的配置数据相关
    // 读取业态的配置数据
    /**business_sid必传
     * 只传business_sid时：读取业态的配置数据
     * business_sid && config_sid都传时表示获取某一条配置数据
     * **/
    getBusinessConfigList(business_sid, config_sid) {
        return http.get(`${urlPrefix}config-data${business_sid ? `/${business_sid}/list${config_sid ? `/${config_sid}`: ''}` : ''}`);
    },
    putOneBusinessConfigEdit(business_sid,config_sid, data) {
        return http.put(`${urlPrefix}config-data${business_sid ? `/${business_sid}/edit${config_sid ? `/${config_sid}`: ''}` : ''}`, data);
    },
    delOneBusinessConfig(business_sid,config_sid) {
        return http.delete(`${urlPrefix}config-data${business_sid ? `/${business_sid}/del${config_sid ? `/${config_sid}`: ''}` : ''}`);
    },
    postOneBusinessConfigAdd(business_sid, data) {
        console.log(business_sid, data, 99999, `${urlPrefix}config-data${business_sid ? `/${business_sid}/add`: '' }`);
        return http.post(`${urlPrefix}config-data${business_sid ? `/${business_sid}/add`: '' }`, data);
    },

};
