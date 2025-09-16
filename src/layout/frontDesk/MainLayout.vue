<script setup>
import { userCommonMessageStore } from '@/stores/user';
import UserInfo from '@/components/login/UserInfo.vue';
import UserImage from '@/components/common/UserImage.vue';
import DrawerMenu from "@/components/common/DrawerMenu.vue";
import LayoutFooter from '../LayoutFooter.vue';

let userCommonStore = userCommonMessageStore();
</script>

<template>
    <div class="app-viewport">
        <vxe-layout-container vertical>
            <vxe-layout-header fixed :style="{background: `${userCommonStore.loginCurrentBusTheme}bf`,}">
                <div style="height: 40px; margin: 10px">
                    <a-flex justify="space-between">
                        <div style="width: 50%">
                            <DrawerMenu/>
                            <div class="logo">
                                <img src="/src/assets/images/OpsCenter_logo.png"/>
                            </div>
                        </div>
                        <a-flex flex="50%" justify="flex-end" >
                            <UserInfo/>
                            <UserImage/>
                        </a-flex>
                    </a-flex>
                </div>
            </vxe-layout-header>

            <vxe-layout-body  id="page_components_container">
                <BreadcrumbRoutes style="padding-left: 24px" />
                <router-view></router-view>
                <a-back-top />

            </vxe-layout-body>
            <LayoutFooter/>
        </vxe-layout-container>
    </div>
</template>


<style scoped lang="less">
.app-viewport {
    position: relative;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #f6f6f8;
    .nav-bar {
        display: flex;
        color: #575d6c;
        background: #ffffff;
        box-shadow: 0 -1px #00000014 inset;
        box-sizing: content-box;
        height: 48px;
        flex-wrap: wrap;
        justify-content: space-between;
        position: sticky;
        width: 100%;
        top: 0;
        left: 0;
        z-index: 999;

    }
}


.logo {
    width: 200px;
    display: inline-block;
    img {
        max-width: 100%;
        max-height: 2rem;
        vertical-align: middle;
    }
}
</style>
