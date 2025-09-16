/**
 * 模块用于获取获取页面：配置的title、button
 * **/

import { userCommonMessageStore } from '@/stores';
import cmdbFormTitle from "./form/cmdbFormTitle";
import commonApi from "@/api/common";
import { useRoute } from "vue-router";


export default function pageInit({layer, customTitleButton}) {
    const routes = useRoute();
    let title = ref([]);
    let button = ref([]);
    let title_data = ref({});

    const {
        generateCmdbFormTitle,
        formState,
        initFormState,
        rules,
    } = cmdbFormTitle(title_data);

    const getPageTitleButton = async () => {
        let userCommonStore = userCommonMessageStore();
       
        const systemMenu = computed(() => userCommonStore?.menuList);
        let  formatMenu = computed(() => {
            let result = {};
            for (let menu_sid in systemMenu.value) {
                let menuItem = systemMenu.value[menu_sid];
                if (menuItem?.submenu) {
                    for (let item of menuItem.submenu) {
                        let { vue_url } = item;
                        if (vue_url) {
                            result[vue_url] = item;
                        }
                    }
                }
            }
            return result;
        });
 
        const currentMenuID = computed(() => routes?.matched && formatMenu.value[routes?.matched[routes?.matched.length -1]?.path]?.sid);
        
        if (currentMenuID.value) {
            if (!layer) {
                return;
            }
            title.value = [];
            button.value = [];
            try {
                let responseTitleButton =  await commonApi.getCurrentMenuTitleApi({layer, id: currentMenuID.value});
                let result = [];
                if (responseTitleButton?.title_data) {
                    for (let item in responseTitleButton.title_data) {
                        for (let title_button of responseTitleButton.title_data[item]) {
                            let { types } = title_button;
                            if (types === 1) {
                                title.value.push(title_button);
                                result.push(title_button);
                            }
                            if (types === 2) {
                                button.value.push(title_button);
                            }
                        }
                    }
                }
                await generateCmdbFormTitle(result);
                if (customTitleButton) {
                    customTitleButton(responseTitleButton);
                }
            } catch(error) {
                title.value = [];
                button.value = [];
            };
        }
    };


    return {
        title,
        button,
        formState,
        initFormState,
        rules,
        title_data,
        getPageTitleButton,
    };
}
