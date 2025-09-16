/**
 初始化编辑操作相关信息：
 initForm()方法：
 1. 调用formTitle.js对title进行统一处理。可以传入customTitleInit进行单独的处理。
 2. 可以得到表单初始值、表单值对象、表单校验规则等
 formDataInit()方法：
 1. 进入编辑状态可执行：如果是编辑，从接口获取单条数据。可以传入customOneData对数据进行特殊处理
 editSubmit()方法：
 1. 对表单值进行统一处理，并请求提交接口。可以传入customSubmitData方法，对编辑提交的数据进行处理。必须是async或者promise形式
 可以传入addUrl、editUrl、oneDataUrl，提供单独的新增、编辑、获取单条数据的接口地址。默认是add、edit、one_data
 可以传入oneDataSid，提供单独的获取单条数据的参数名。默认是sid
 可以传入addParams、editParams，提供新增、编辑接口的额外param参数对象
 可以传入addSuccessCallback、editSuccessCallback，提供单独的新增、编辑成功后的回调方法
 可以传入customSubmit方法，提供自定义的提交逻辑
 **/
import {computed, isRef, ref} from "vue";
import http from '@/utils/axios';
import formTitle from "./formTitle";
import { ADD_TYPE } from "@/config/globalOption";
import successModal from '@/composables/successModal';
import geneEditData from "./geneEditData";
import {Modal} from "ant-design-vue";
import openApiHttp from "@/utils/openApiHttp";

export default function editInit({
    urlPrefix, // 路由前缀，通常是该模块的统一路由前缀
    edit_title, // 配置的编辑title列表
    formRef, // 表单ref
    editTitleLayer, // 编辑title层级
    title_data,
    editType, // 编辑类型
    sid,
    customTitleInit, // 自定义处理title的方法
    customOneData, // 自定义处理单条数据
    customSubmitData, // 自定义处理提交数据
    addUrl = 'add', // 新增的提交url
    editUrl = 'edit', // 编辑的提交url
    addParams = null, // 新增时url上附带的参数
    editParams = null, // 编辑时url上附带的参数
    addSuccessCallback, // 新增成功回调
    editSuccessCallback, // 编辑成功回调
    oneDataUrl = '' , // 获取单条数据的url
    submitSid, // 提交时的sid（通常是sid字段，特殊情况不用sid就传这个参数）
    oneDataParams, // 获取单条数据时url上附带的参数
    customSubmit, // 自定义提交的方法
    customEditData, // 自定义处理获取到单条数据
    isOpenApiRequest = false, // 获取数据时，是否用openapi请求
    hasEditData = null, // 编辑时，不从接口获取单条数据，直接有传入的数据
    customValidateFieldError, // 提交校验表单报错的回调
}) {
    let edit_data = ref({}); // 单条数据
    let formDataLoading = ref(false); // 表单是否正在加载
    // 统一处理字段、表单、校验规则
    const { generateFormTitle, formState, initFormState, rules } = formTitle(title_data);
    // 处理title（公共处理，得到formState, rules等）
    let currentEditTitle = isRef(edit_title) ? computed(() => edit_title.value) : computed(() => edit_title);
    // 初始化表单，对title进行统一处理，得到表单相关值(表单初始值、表单值对象、表单校验规则等)
    // 可以传入customTitleInit方法，提供单独的字段处理逻辑
    async function initForm() {
        if (currentEditTitle) {
            generateFormTitle(currentEditTitle.value[editTitleLayer]);
        }
        // 业务模块单独处理字段（比如需要特殊显示规则的、rules的，表单初始值特殊的、或者其他特殊处理的）
        if (customTitleInit) {
            await customTitleInit();
        }
    }

    // 初始化表单值（进入编辑状态时）
    // 可以传入customOneData方法，提供单独的数据处理逻辑
    async function formDataInit() {
        formDataLoading.value = true;
        formRef.value.clearValidate(); // 清空上一次的表单验证
        // 清空表单数据
        edit_data.value = {};
        if (editType.value === ADD_TYPE) { // 新增时

            for (let f in formState) {
                formState[f] = initFormState[f];
            }
        } else { // 编辑时(修改以下逻辑，必须检查tableFormInit.js中对应部分是否也要一起修改)
            // 清空表单数据（防止接口返回太慢，导致之前的数据显示造成误解）todo 暂时去除该逻辑，对已有模块影响较大
            // edit_data.value = {};
            // for (let f in formState) {
            //     formState[f] = initFormState[f];
            // }
            // 编辑数据不从接口获取的情况
            if (hasEditData) {
                edit_data.value = hasEditData.value;
                formDataEditInit();
            } else {
                // 获取单条数据
                let params = '';
                if (oneDataParams) {
                    for (let key in oneDataParams) {
                        params += `/${oneDataParams[key]}`;
                    }
                }
                if (sid && !Array.isArray(sid.value)) {
                    let requestType = isOpenApiRequest ? openApiHttp(`${urlPrefix}${oneDataUrl}/${sid.value}${params}`) : http.get(`${urlPrefix}${oneDataUrl}/${sid.value}${params}`);
                    await requestType.then(res => {
                        edit_data.value = res;
                        formDataEditInit();
                    });
                }
            }
        }
        formDataLoading.value = false;
    }
    // 编辑情况时，初始化表单值
    function formDataEditInit() {
    // 业务模块单独处理获取到单条数据（比如对edit_data某些字段特殊处理）
        if (customEditData) {
            customEditData(edit_data);
        }
        // 填充edit_data的值到formState
        geneEditData({edit_title: currentEditTitle.value[editTitleLayer], edit_data: edit_data.value, formState});
        // 业务模块单独处理单条数据（比如对formState某些字段特殊处理）
        if (customOneData) {
            customOneData();
        }
    }

    let confirmLoading = ref(false); // 确定按钮是否loading
    // 提交表单
    function editSubmit() {
        formRef.value.validateFields().then(async () => { // 校验通过
            confirmLoading.value = true;
            let data = {};
            for (let key in formState) { // 字符串类型，去掉前后空格
                if (typeof formState[key] === 'string') {
                    data[key] = formState[key].trim();
                } else {
                    data[key] = formState[key];
                }
            }
            // 业务模块单独处理提交数据
            if (customSubmitData) {
                await customSubmitData(data).then(res => {
                    data = res;
                    if (customSubmit) {
                        customSubmit(data);
                    } else {
                        submit(data);
                    }
                }).catch(msg => { // 取消提交
                    // 如果有msg则提示
                    if (msg) {
                        Modal.error({
                            title: msg,
                            maskClosable: true,
                        });
                    }
                    // 按钮loading恢复
                    confirmLoading.value = false;
                });
            } else {
                if (customSubmit) {
                    customSubmit(data);
                } else {
                    submit(data);
                }
            }
        }).catch(err => {
            document.querySelector('.ant-form-item-has-error')?.scrollIntoView({behavior: 'smooth', block: 'center'});
            if (customValidateFieldError) {
                customValidateFieldError(err);
            }
        });
    }
    // 提交编辑接口
    // isConfigHeader 提交接口需要传递请求头的配置
    function submit(data, isConfigHeader) {
        if (editType.value === ADD_TYPE) { // 新增时
            let params = [];
            if (addParams) {
                for (let key in addParams) {
                    params.push(`${key}=${addParams[key]}`);
                }
            }
            http.post(`${urlPrefix}${addUrl}${params.length ? `?${params.join('&')}` : ''}`, data, isConfigHeader).then(res => {
                confirmLoading.value = false;
                successModal({content: res?.msg});
                if (addSuccessCallback) {
                    addSuccessCallback(res);
                }
            }).catch(() => {
                confirmLoading.value = false;
            });
        } else { // 编辑时
            let params = '';
            if (editParams) {
                for (let key in editParams) {
                    params += `/${editParams[key]}`;
                }
            }
            if (Array.isArray(sid.value)) {
                for (let i in sid.value) {
                    http.put(`${urlPrefix}${editUrl}/${sid.value[i]}${params}`, data, { noErrorTip: true }).then(res => {
                        confirmLoading.value = false;
                        if (editSuccessCallback) {
                            editSuccessCallback(res);
                        } else {
                            if(sid.value[sid.value.length - 1] === sid.value[i]) {
                                successModal({content: res?.msg});

                            }
                        }
                    }).catch(() => {
                        confirmLoading.value = false;
                    });
                }
            } else {
                http.put(`${urlPrefix}${editUrl}/${submitSid ? submitSid.value : sid.value}${params}`, data).then(res => {
                    confirmLoading.value = false;
                    if (editSuccessCallback) {
                        editSuccessCallback(res);
                    }
                    successModal({content: res?.msg});
                }).catch(() => {
                    confirmLoading.value = false;
                });
            }

        }
    }

    return {
        edit_data,
        generateFormTitle,
        formDataLoading,
        formState,
        initFormState,
        rules,
        confirmLoading,
        submit,
        editSubmit,
        initForm,
        formDataInit,
        formDataEditInit,
    };
}
