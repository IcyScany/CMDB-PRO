import http from './axios';
/*
* submitUrlPrefix： 提交的数据的url前缀，有时会出现不需要这个前缀的情况
* */
function openApiHttp(url, method= "GET", submitParam = {}, config, submitUrlPrefix= '/api/v2/') {
    let postData = {
        method: method,
        url: `${submitUrlPrefix ? submitUrlPrefix: ''}${url}`
    };
    if (!(method === "GET" || method === "DELETE")) {
        postData['param'] = submitParam;
    }

    return http.post('/api/v1', postData, config);
}
export default openApiHttp;
