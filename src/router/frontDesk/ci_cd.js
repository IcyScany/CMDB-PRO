export const ciCdRoutes = [
    {
        path: "/ci_cd",
        name: "ci_cd",
        meta: {
            title:'CI/CD',
        },
        redirect: '/ci_cd/mobile_app/page',
        children: [
            { // 移动app
                path: "mobile_app/page",
                name: "mobile_app",
                meta: {
                    title:'移动 APP 发布管理',
                    main_content_bg: 'unset',
                },
                props: (route) => ({sid: route.query.sid}),
                component: () => import("@/views/frontDesk/CI_CD/mobileApp/index.vue"),
            },
         
        ],
    }
    
];
