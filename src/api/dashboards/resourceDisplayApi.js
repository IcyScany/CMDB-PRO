import http from '@/utils/axios';

const urlPrefix = `dashboards/resource/display`;

export default {
   
    postMessage(data) {
        return http.post(`${urlPrefix}`, data, {showLoading: true});
    },
   
};
