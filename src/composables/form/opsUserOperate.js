import deleteProcess from "@/composables/deleteProcess";
import opsMessageTip from "@/composables/opsMessageTip";


/**
 * 模块用于新增、编辑、删除弹窗的打开
 * **/

const userOperate = () => {
    /** 新增/编辑
     *  @param
        type：ADD_TYPE-1-新增、EDIT_TYPE-2-编辑、INFO_TYPE-3-查看；sid：编辑、查看时需要、新增时为0
     * */
    let formOpen = ref(false); // 编辑弹窗是否显示
    let formType = ref(null); // 编辑弹窗的类型（新增/编辑）
    let formSid = ref(0); // 编辑的sid
    const userEdit = ({type, sid = 0, data, customEdit}) => {
        formOpen.value = true;
        formType.value = type;
        formSid.value = sid;
        if (customEdit) {
            customEdit(data);
        }
    };
    
    const userDel = ({delApi, sid, body, loadData, additionNode, delSuccessCallback}) => {
        deleteProcess(() => {
            if (delApi && sid) {
                delApi(sid, body).then((res) => {
                    opsMessageTip({content: res?.msg, closeCallback: () => {
                        if (loadData) {
                            loadData();
                        }
                    }});
                    if (delSuccessCallback) {
                        delSuccessCallback();
                    }
                }).catch(() => {
                });

            }
        }, additionNode);
    };

    return {
        userEdit,
        formOpen,
        formType,
        formSid,
        userDel,
    };
};

export default userOperate;
