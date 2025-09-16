
import { defineStore } from 'pinia';
import systemConfig from '@/config/index';


export const useGlobalStore = defineStore('global', () => {
    let initConfig = systemConfig.SYSTEM_SET.GLOBAL_SET;
    // 布局
    const layout = ref(initConfig.LAYOUT);
    // 菜单是否折叠 toggle
    const menuIsCollapse = ref(initConfig.MENU_COLLAPSE);
    // 是否展示面包屑
    const breadcrumbOpen = ref(initConfig.BREADCRUMB_OPEN);
    // 顶栏主题色通栏
    const topHeaderThemeColorSpread = ref(initConfig.TOP_HEADER_THEME_COLOR_SPREAD);
   
  
    const setLayout = (key) => {
        layout.value = key;
    };
  
 
    const toggleConfig = (key) => {
        switch (key) {
            case 'menuIsCollapse':
                menuIsCollapse.value = !menuIsCollapse.value;
                break;
            case 'topHeaderThemeColorSpread':
                topHeaderThemeColorSpread.value = !topHeaderThemeColorSpread.value;
                break;
	
            case 'breadcrumbOpen':
                breadcrumbOpen.value = !breadcrumbOpen.value;
                break;

        }
    };
 
 
    return {
        layout,
        menuIsCollapse,
        breadcrumbOpen,
        topHeaderThemeColorSpread,
        setLayout,
        toggleConfig,
    

    };
}, {
    persist: {
        enabled: true,
        strategies:[
            {
                key: 'SYSTEM_GLOBAL_SET',
                paths: ['layout', 'menuIsCollapse', 'breadcrumbOpen', 'topHeaderThemeColorSpread'],
                storage: localStorage,
            }
        ]
   
    },
});


