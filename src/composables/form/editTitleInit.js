/**
 * editTitleInit模块用于新增、编辑的表单(获取编辑的title、button等)
 * @returns
 * getEditTitle(获取编辑title的回调)
   edit_title(编辑的title)
   edit_button(编辑的权限button)
   editTitleLoading(获取title的loading)
 **/
import {ref} from "vue";
import http from '@/utils/axios';

const editTitleInit = (
    {
        urlPrefix, // 菜单管理中配置的权限url前缀
        titleUrl = 'edit_title', // action
    }
) => {
    let edit_title = ref({});
    let edit_button = ref({});
    let editTitleLoading = ref(false); // 表单title是否正在加载

    async function getEditTitle() {
        editTitleLoading.value = true;
        // 获取配置的title、button
        await http.get(`${urlPrefix}${titleUrl}`).then(res => {
            let { title, button } = res?.menus_data ? res.menus_data: {};
            edit_title.value = title;
            edit_button.value = button;
            editTitleLoading.value = false;
        }).catch(() => {
            editTitleLoading.value = false;
        });
    }

    return {
        edit_title,
        edit_button,
        editTitleLoading,
        getEditTitle,
    };
};


export default  editTitleInit;
