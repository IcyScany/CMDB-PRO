/** 模块用于新增编辑的弹窗**/
import cmdbFormInit  from "./cmdbFormInit";



const cmdbFormModal = ({
    urlPrefix,
    formRef, // 表单ref
    editTitleLayer, // 编辑title层级
    emits, // emit方法
    sid,
    formType, // 表单的类型
    customModalOpen, // 每一次弹窗打开的自定义的逻辑
    customInit, // 自定义打开弹窗时的处理方法
    customTitleInit, // 自定义处理title的方法
    customOneData, // 自定义处理单条数据
    customSubmitData, // 自定义处理提交数据
    addUrl, // 新增的提交url
    editUrl, // 编辑的提交url
    addParams, // 新增时url上附带的参数
    editParams, // 编辑时url上附带的参数
    oneDataUrl, // 获取单条数据的url
    oneDataSid, // 获取单条数据的sid的参数名
    submitSid, // 提交时的sid（通常是sid字段，特殊情况不用sid就传这个参数）
    oneDataParams, // 获取单条数据时url上附带的参数
    customAddSuccessCallback = (res) => {
        emits('editSuccess', res.param, res);
        emits('update:open', false);
    }, // 新增成功回调
    customEditSuccessCallback = (res) => {
        emits('editSuccess', res.param, res);
    }, // 编辑成功回调
    customSubmit, // 自定义提交的方法
    customEditData, // 自定义处理获取到单条数据
    isOpenApiRequest = false, // 获取数据时，是否用openapi请求
    hasEditData, // 编辑时，不从接口获取单条数据，直接有传入的数据
    customValidateFieldError, // 提交校验表单报错的回调

}) => {

    // 编辑的公共方法
    const {
        title,
        button,
        edit_data,
        formDataLoading,
        formState,
        initFormState,
        rules,
        confirmLoading,
        editSubmit,
        submit,
        initForm,
        formDataInit,
    } = cmdbFormInit({
        urlPrefix,
        formRef,
        editTitleLayer,
        formType,
        sid,
        customTitleInit,
        customOneData,
        customSubmitData,
        addUrl,
        editUrl,
        addParams,
        editParams,
        customAddSuccessCallback ,
        customEditSuccessCallback,
        oneDataUrl,
        oneDataSid,
        submitSid,
        oneDataParams,
        customSubmit,
        customEditData,
        isOpenApiRequest,
        hasEditData,
        customValidateFieldError,
    });

    // 表单部分是否正在加载中：结合了获取编辑title的loading和获取单条编辑数据的loading
    let formLoading = computed(() => {
        return formDataLoading.value;
    });


    /** 用于弹窗打开的时候 **/
    const handleFormShow = async () => {
        if (customInit) {
            customInit();
        } else {
            await initForm();
            // 初始化表单值（进入编辑状态时）
            await formDataInit();
            customModalOpen && customModalOpen();
        }
       
    };


    /** 用于弹窗关闭的时候处理 **/
    const handleFormHide = () => {
        emits('update:open', false);
    };

    return {
        title,
        button,
        handleFormShow,
        handleFormHide,
        edit_data,
        formDataLoading,
        formState,
        initFormState,
        rules,
        formLoading,
        confirmLoading,
        editSubmit,
        submit,
        formDataInit,
    };
};

export default cmdbFormModal;

