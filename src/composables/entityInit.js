/**
  一种数据实体的增删改相关的操作的公共方法
  可以传入editUrl、delUrl提供单独的编辑、删除的接口地址。默认是edit、del
  可以传入customEdit方法，提供额外的编辑处理逻辑
  可以传入customClickStatusError方法，提供额外的clickStatus方法请求失败的处理逻辑
  可以传入customClickStatusSuccess方法，提供额外的clickStatus方法请求成功的处理逻辑，并获取成功响应的数据
 **/

import {ref, provide} from "vue";
import http from '@/utils/axios';
import deleteProcess from "@/composables/deleteProcess";
import successModal from '@/composables/successModal';
import OpenApiHttp from "@/utils/openApiHttp";

export default function entityInit({
    urlPrefix, // 路由前缀，通常是该模块的统一路由前缀
    gridOptions, // 表格配置对象
    getData, // 获取数据的方法
    editUrl = 'edit', // 编辑的提交url
    delUrl = 'del', // 删除的提交url
    customEdit, // 自定义编辑处理逻辑
    tableType = 'client', // 表格类型
    customClickStatusError, // 自定义clickStatus方法请求失败的处理逻辑
    customClickStatusSuccess, // 自定义clickStatus方法请求成功的处理逻辑
}) {
    // 表格内修改状态（针对clientTable）
    function clickStatus(checked, e, sid, index, field) {
        gridOptions.loading = true;
        let postData = null;
        if (field) {
            postData = {};
            postData[field] = checked;
        }
        http.put(`${urlPrefix}${editUrl}/${sid}`, postData).then((res) => {
            gridOptions.loading = false;
            successModal({content: res.msg});
            if (tableType === 'client') {
                gridOptions.data[index][field] = checked;
            } else {
                if (getData) {
                    getData();
                }
            }
            if (customClickStatusSuccess) {
                customClickStatusSuccess(res);
            }
        }).catch(() => {
            gridOptions.loading = false;
            if (customClickStatusError) {
                customClickStatusError();
            }
        });
    }
    // 删除  delOpenApiRequestConfig 表示是否使用openapi接口进行删除，可以传入一个对象里面包含method eg:{method: 'DELETE'}
    function del(sid, delParams, additionNode, delSuccessCallback, customPutData, delOpenApiRequestConfig) {
        deleteProcess(() => {
            if (gridOptions) {
                gridOptions.loading = true;
            }
            let params = '';
            if (delParams) {
                for (let key in delParams) {
                    params += `/${delParams[key]}`;
                }
            }
            let putData = { sid: sid};
            if (customPutData) {
                putData = customPutData(putData);
            }
            let urlConnect = `${urlPrefix}${delUrl}/${sid}${params}`;
            let requestType = delOpenApiRequestConfig
                ? OpenApiHttp(
                    urlConnect,
                    delOpenApiRequestConfig.method ? delOpenApiRequestConfig.method : `PUT`,
                    putData
                ) : http.delete(urlConnect, putData);
            requestType.then((res) => {
                if (gridOptions) {
                    gridOptions.loading = false;
                }
                successModal({content: res.msg});
                if (getData) {
                    getData(true);
                }
                if (delSuccessCallback) {
                    delSuccessCallback();
                }
            }).catch(() => {
                if (gridOptions) {
                    gridOptions.loading = false;
                }
            });
        }, additionNode);
    }
    // 新增/编辑
    // type：ADD_TYPE-1-新增、EDIT_TYPE-2-编辑、INFO_TYPE-3-查看；sid：编辑、查看时需要、新增时为0
    let editVisible = ref(false); // 编辑弹窗是否显示
    let editType = ref(null); // 编辑弹窗的类型（新增/编辑）
    let editSid = ref(0); // 编辑的sid
    function edit(type, sid = 0, data) {
        editVisible.value = true;
        editType.value = type;
        editSid.value = sid;
        if (customEdit) {
            customEdit(data);
        }
    }
    provide('editType', editType);

    return {
        clickStatus,
        del,
        edit,
        editVisible,
        editType,
        editSid,
    };
}
