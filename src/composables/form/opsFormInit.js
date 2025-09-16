import tableRender from "@/composables/table/tableRender";
import {ADD_TYPE, EDIT_TYPE} from "@/config/globalOption";
import opsNoticeModal from "@/composables/opsNoticeModal";
import geneEditData from "@/composables/form/geneEditData";
import opsMessageTip from "@/composables/opsMessageTip";

const opsFormInit = ({
    formRef, // 表单ref
    editTitleLayer,
    formType, // 表单的类型
    sid,
    customTitleInit, // 自定义处理title的方法
    customOneData, // 自定义处理单条数据
    customSubmitData, // 自定义处理提交数据
    addApi, // 新增提交的API
    editApi, // 编辑提交的API
    oneDataApi, // 获取单条数据的api
    hasEditData,
    customEditData,
    customSubmit,
    customValidateFieldError, // 提交校验表单报错的回调
    emits,
    customTitle=[],
    handleEditError,
}) => {
    let operateSid = computed(() => sid.value);

    let edit_data = ref({}); // 单条数据
    let formDataLoading = ref(false); // 表单是否正在加载
    let confirmLoading = ref(false); // 确定按钮是否loading
    let formRenderContent = ref({}); // 表单渲染的内容


    const initForm = async () => {
        // 获取表单的title
        formRenderContent.value = await tableRender.getTitle({layer:editTitleLayer, isEdit: true, customTitle});
        // 业务模块单独处理字段（比如需要特殊显示规则的、rules的，表单初始值特殊的、或者其他特殊处理的）
        if (customTitleInit) {
            await customTitleInit();
        }
        confirmLoading.value = false;
    };

    /** 
     * 提交数据 
     * **/
    const formSubmit = async (data) => {
        confirmLoading.value = true;
        switch (formType.value) {
            case ADD_TYPE:
                try {
                    let addSuccess = await addApi(data);
                    opsMessageTip({content: addSuccess?.msg || '新增成功', closeCallback:() => {
                        emits('editSuccess');
                      
                    }});
                    confirmLoading.value = false;
                }
                catch (error) {
                    confirmLoading.value = false;
                    if (handleEditError) {
                        handleEditError(error);
                    }
                }
                break;
            case  EDIT_TYPE:
                try {
                    let editSuccess = await editApi(operateSid.value, data);
                    opsMessageTip({content: editSuccess?.msg || '编辑成功', closeCallback:() => {
                        emits('editSuccess');
                        emits('update:open', false);
                    }});
                }
                catch (error) {
                    if(error?.response?.status !== 500) {
                        opsNoticeModal({type: 'error', message: error?.response?.msg });
                    }
                    if (handleEditError) {
                        handleEditError(error);
                    }
                }
                confirmLoading.value = false;
                break;
        }
    };

    /**
     * 编辑情况时，初始化表单值
     */
    const formDataEditInit = async () => {
        let {title} = formRenderContent.value;
        // 业务模块单独处理获取到单条数据（比如对edit_data某些字段特殊处理）
        if (customEditData) {
            customEditData(edit_data);
        }
        // 填充edit_data的值到formState
        await geneEditData({edit_title: title, edit_data: edit_data.value, formState: formRenderContent.value.formState});
        // 业务模块单独处理单条数据（比如对formState某些字段特殊处理）
        if (customOneData) {
            customOneData(edit_data);
        }
        formDataLoading.value = false;
        confirmLoading.value = false;
    };

    /**
     * 初始化表单值（进入编辑状态时）
     * @function 可以传入customOneData方法，提供单独的数据处理逻辑
     * **/
    const formDataInit = async () => {
        formDataLoading.value = true;
        formRef.value.clearValidate(); // 清空上一次的表单验证
        // 清空表单数据
        edit_data.value = {};
        let {formState, initFormState} = formRenderContent.value;
       
       
        if (formType.value === ADD_TYPE) { // 新增时
            for (let f in formState) {
                formState[f] = initFormState[f];
            }
        } else { 
            // 编辑数据不从接口获取的情况
            if (hasEditData) {
                edit_data.value = hasEditData.value;
                await formDataEditInit();
            } else {
                if (operateSid.value) {
                    try {
                        edit_data.value = await oneDataApi(operateSid.value);
                        await formDataEditInit();
                        formDataLoading.value = false;
                    } catch (error) {
                        formDataLoading.value = false;
                    }
                }
            };
        }
        formDataLoading.value = false;
    };


    /**
     * 表单的提交 --- Start
     * **/

    const editSubmit = () => {
        formRef.value.validateFields().then(async () => { // 校验通过
            let {formState} = formRenderContent.value;
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
                        formSubmit(data);
                    }
                }).catch(msg => { // 取消提交
                    // 如果有msg则提示
                    if (msg) {
                        opsNoticeModal({type: 'error', message: msg });
                    }
                    // 按钮loading恢复
                    confirmLoading.value = false;
                });
            } else {
                if (customSubmit) {
                    customSubmit(data);
                } else {
                    await formSubmit(data);
                }
            }
        }).catch(err => {
            document.querySelector('.ant-form-item-has-error')?.scrollIntoView({behavior: 'smooth', block: 'center'});
            if (customValidateFieldError) {
                customValidateFieldError(err);
            }
        });
    };
    /**
     * 表单的提交 --- End
     * **/
    provide('formType', formType);

    return {
        edit_data,
        formRenderContent,
        formDataLoading,
        confirmLoading,
        initForm,
        formDataInit,
        formSubmit,
        editSubmit,
    };

};

export default opsFormInit;
