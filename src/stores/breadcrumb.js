// 在Pinia store中
import { defineStore } from 'pinia';

export const useBreadcrumbStore = defineStore('breadcrumb', {
    state: () => ({
        breadcrumbs: []
    }),
    actions: {
        updateBreadcrumbs(routes) {
            this.breadcrumbs = routes.map(route => ({
                ...route,
                path: route.path,
                breadcrumbName: route.meta.title,
            }));
        }
    }
});
