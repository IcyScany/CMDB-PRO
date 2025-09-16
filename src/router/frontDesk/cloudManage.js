/* 云管理菜单 */
export const cloudManageRoutes = [
    {
        path: "/cloud-manage", // 父路由定义了名为role的动态参数
        name: "cloudManage",
        meta: {
            title:'云管理',
        },
        props: true,
        // 有子路由的一定要重定向，第一个system/user/为上面的ptah，第二个为下面的children的某个path，不一定要是第一个。
        redirect: '/cloud-manage/cloud-account/page',
        children: [
            {
                path: 'cloud-account/page',
                name: 'cloudAccount',
                meta: {
                    title:'云账号管理',
                    product_count: 'account',
                },
                component: () => import("@/views/frontDesk/cloudManage/CloudAccount/index.vue"),
            },
        ],
    }
];
