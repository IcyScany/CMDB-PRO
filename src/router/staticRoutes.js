export  const staticRoutes = [
    {
        path: "/login",
        name: "Login",
        props: route => ({ next: route.query.next }),
        component: () => import('../views/Login.vue'),
        meta: {
            title: '登录',
            noPermission: true,
        },
    },
    {
        path: "/check/business/page",
        name: "checkBusiness",
        component: () => import('@/components/login/CmdbCheckBusiness.vue'),
        meta:{
            title: '选择所属业态',
            noPermission: true,
        },
    },
    {
        path: '/error404',
        name: 'error404',
        meta: {
            title: '404 Error',
            noPermission: true,
        },
        component: () => import("@/views/error/PageError404.vue"),
    },
    {
        path: '/error403',
        name: 'error403',
        meta: {
            title: '403 Error',
            noPermission: true,
        },
        component: () => import("@/views/error/PageError403.vue"),
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: 'error404',
    },
];

