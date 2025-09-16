<script  setup>
import topUserBar from "../topUserBar.vue";

</script>

<template>
    <a-layout>
        <a-layout class="layout">
            <div id="opsHeader" class="ops-header top-ops-header top-header-theme" :style="{'border-bottom': 'unset'}">
                <div class="ops-header-left xy-pl0">
                    <header id="opsHeaderLogo" class="ops-header-logo">
                        <div class="ops-header-left">
                            <div class="logo-bar">
                                <router-link v-if="$route.name !== 'productPage'" :to="{name: $route.name === 'homePage' ? 'productPage' : 'homePage'}">
                                    <img src="/src/assets/images/OpsCenter_logo.png" class="logo" />
                                </router-link>
                                <img v-else src="/src/assets/images/OpsCenter_logo.png" class="logo" />
                            </div>
                        </div>
                    </header>
                </div>
                <div class="ops-header-right">
                    <topUserBar/>
                </div>
            </div>
            <a-layout-content class="main-content-wrapper p-0" >
                <div id="admin-ui-main" class="admin-ui-main">
                    <router-view></router-view>
                    <a-back-top />
                </div>
            </a-layout-content>
        </a-layout>
    </a-layout>

</template>

<style scoped lang="less">
.xy-pl10 {
    padding-left: 10px;
}

</style>
