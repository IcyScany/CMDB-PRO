import http from '@/utils/axios';

const urlPrefix = `network/route-link/`;

export default {
    getData(dir, uuid) {
        return http.get(`${urlPrefix}${dir}/${uuid}`, { 
            showLoading: true 
        });
    },
};
