/**
 初始获取编辑弹窗信息：
 调用editTitleInit.js获取编辑title（只执行一次）
 调用editInit.js生成编辑相关的公共方法和数据
 可以传入customInit方法，提供打开弹窗时的处理函数，默认是getEditTitle()、initForm()、formDataInit()方法的组合（来自editTitleInit.js、editInit.js）
 可以传入customOnceVisible方法，提供第一次打开弹窗时额外执行的处理逻辑，在默认的initForm()方法之后执行
 可以传入customVisible方法，提供每次打开弹窗都额外执行的处理逻辑，在默认的initForm()方法之后formDataInit()方法之前执行
 可以传入customVisibleAfter方法，提供每次打开弹窗都额外执行的处理逻辑，在默认的formDataInit()方法之后执行
 可以传入customEditData方法，提供在编辑前处理数据再填充表单
 其余可传入的参数，参考editInit.js。都会透传过去
 公共的关闭弹窗方法
 **/
import {computed, watch} from "vue";
import editTitleInit from './editTitleInit';
import editInit from './editInit';

export default function editModalInit({
    urlPrefix, // 路由前缀，通常是该模块的统一路由前缀
    formRef, // 表单ref
    emit, // emit方法
    editTitleLayer, // 编辑title层级
    visible, // 弹窗是否可见
    editType, // 编辑类型
    sid,
    customInit, // 自定义打开弹窗时的处理方法
    customTitleInit, // 自定义处理title的方法
    customOneData, // 自定义处理单条数据
    customSubmitData, // 自定义处理提交数据
    addUrl, // 新增的提交url
    editUrl, // 编辑的提交url
    addParams, // 新增时url上附带的参数
    editParams, // 编辑时url上附带的参数
    oneDataUrl, // 获取单条数据的url
    titleUrl, // 获取编辑title的url
    customVisible, // 自定义每次打开弹窗都执行的处理逻辑
    customOnceVisible, // 自定义第一次打开弹窗执行的处理逻辑
    customVisibleAfter, // 自定义每次打开弹窗都执行的处理逻辑
    oneDataSid, // 获取单条数据的sid的参数名
    submitSid, // 提交时的sid（通常是sid字段，特殊情况不用sid就传这个参数）
    oneDataParams, // 获取单条数据时url上附带的参数
    customAddSuccessCallback = (res) => {
        emit('editSuccess', res.param, res);
        emit('update:visible', false);
    }, // 新增成功回调
    customEditSuccessCallback = (res) => {
        emit('editSuccess', res.param, res);
    }, // 编辑成功回调
    customSubmit, // 自定义提交的方法
    customEditData, // 自定义处理获取到单条数据
    isOpenApiRequest = false, // 获取数据时，是否用openapi请求
    hasEditData, // 编辑时，不从接口获取单条数据，直接有传入的数据
    customValidateFieldError, // 提交校验表单报错的回调
}) {
    watch(
        () => visible.value,
        async () => {
            if (visible.value) { // 打开弹窗时
                if (customInit) { // 可以传入customInit方法，提供单独的处理逻辑
                    customInit();
                } else {
                    // 获取title、button（只有第一次打开需要处理）
                    if (!Object.keys(edit_title.value).length) {
                        // 获取配置的title、button
                        await getEditTitle();
                        // 初始化表单、处理title
                        await initForm();
                        if (customOnceVisible) { // 可以传入customOnceVisible方法，提供第一次打开弹窗执行的处理逻辑
                            customOnceVisible();
                        }
                    }
                    if (customVisible) { // 可以传入customVisible方法，提供每次打开弹窗都执行的处理逻辑
                        customVisible();
                    }
                    // 初始化表单值（进入编辑状态时）
                    await formDataInit();
                    if (customVisibleAfter) { // 可以传入customVisibleAfter方法，提供每次打开弹窗都执行的处理逻辑
                        customVisibleAfter();
                    }
                }
            }
        },
    );

    // 关闭弹窗/取消
    function handleCancel() {
        emit('update:visible', false);
    }

    // 获取编辑title的公共方法
    const {
        edit_title,
        edit_button,
        editTitleLoading,
        getEditTitle,
    } = editTitleInit({urlPrefix, titleUrl});

    // 编辑的公共方法
    const {
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
    } = editInit({
        urlPrefix,
        edit_title,
        formRef,
        editTitleLayer,
        editType,
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
        return editTitleLoading.value || formDataLoading.value;
    });

    return {
        edit_title,
        edit_button,
        editTitleLoading,
        edit_data,
        formDataLoading,
        formState,
        initFormState,
        rules,
        formLoading,
        handleCancel,
        confirmLoading,
        editSubmit,
        submit,
        formDataInit,
    };
}
