import XEUtils from 'xe-utils';
import { defineStore } from 'pinia';


export const useUserTabViewStore = defineStore('tabView', {
    state: () => (
        {
            activeUserTab: '',
            userTabs: [] ,
            userInfo: null,
        }
    ),
    actions: {
    /**
         * 清除所有页签
         */
        clearUserTabs () {
            this.activeUserTab = '';
            this.userTabs = [];
        },
        /**
         * 更新页签
         * @param tab
         */
        updateUserTabs (tab = {}) {
            if (!this.userTabs.some(item => item.name === tab.name)) {
                this.userTabs.push({
                    name: tab.name,
                    routeName: tab.routeName,
                    path: tab.path,
                    query: tab.query,
                    params: tab.params,
                    title: tab.title
                });
            }
            this.activeUserTab = tab.name;
        },
        /**
         * 关闭页签
         * @param tab
         * @returns
         */
        removeUserTab (tab) {
            const index = XEUtils.findIndexOf(this.userTabs, item => item.name === tab.name);
            if (index > -1) {
                if (tab.name === this.activeUserTab) {
                    const nextItem = this.userTabs[index + 1] || this.userTabs[index - 1];
                    if (nextItem) {
                        this.activeUserTab = nextItem.name;
                        this.userTabs.splice(index, 1);
                        return nextItem;
                    }
                }
                this.userTabs.splice(index, 1);
            }
            return null;
        },
        /**
         * 清除页签
         * @param type
         */
        clearUserTab (type) {
            const index = XEUtils.findIndexOf(this.userTabs, item => item.name === this.activeUserTab);
            switch (type) {
                case 'closeOther':
                    this.userTabs = this.userTabs.filter(item => item.name === this.activeUserTab);
                    break;
                case 'closeLeft':
                    this.userTabs = this.userTabs.slice(index);
                    break;
                case 'closeRight':
                    this.userTabs = this.userTabs.slice(0, index + 1);
                    break;
            }
        }
    }
});
