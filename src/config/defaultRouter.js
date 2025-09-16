import BasicLayout from '@/layout/BasicLayout.vue';

/**
 * @rootRouter 菜单路由
 * @notFoundRouter 异常路由
 * 
 * **/
export default {
    rootRoute: {
        key: 'Basic',
        name: 'Basic',
        path: '/',
        redirect: '/index',
        component: BasicLayout,
        meta: { title: '首页' },
        children: [],
    },
    notFoundRoutes: [
        {
            name: 'PageError403',
            path: '/PageError403',
            component: () => import(`@/views/error/PageError403.vue`),
        },
        {
            name: 'PageError404',
            path: '/PageError404',
            component: () => import(`@/views/error/PageError404.vue`),
        },
        {
            name: 'PageError500',
            path: '/PageError500',
            component: () => import(`@/views/error/PageError500.vue`),
        },
        {
            path: '/:catchAll(.*)',
            redirect: '/PageError404',
        },
    ],
};
