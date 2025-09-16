/**
 * 系统无需登录的Api
 * **/
import http from "@/utils/axios";

const noLoginUrlPrefix = `bcm-public/`;

export default {
    // 获取系统服务器时间
    getServerTime() {
        return  http.get(`${noLoginUrlPrefix}server-time`);
    },
};