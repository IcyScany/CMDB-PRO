<script setup>
/*import {computed} from 'vue';
import { useRoute } from 'vue-router';*/
import { HomeOutlined} from '@ant-design/icons-vue';
/*import { userCommonMessageStore } from '@/stores/user';


let userCommonStore = userCommonMessageStore();
const route = useRoute();
const breadcrumbList = computed(() => {
    let metaTitles = [];
    let matched = route.matched.filter((item) => item.meta && item.meta.title);
    matched.forEach((item) => {
        metaTitles.push({
            title: item.meta.title,
            path: item.path,
            name: item.name,
        });
    });

    return metaTitles;
});*/


</script>

<template>
    <a-breadcrumb v-if="$route.name !== 'homePage'">
        <template v-for="item in $route.matched" :key="item.name">
            <a-breadcrumb-item v-if="item.name === 'role-base'">
                <router-link :to="{name: 'homePage'}"> <home-outlined /></router-link>
            </a-breadcrumb-item>
            <a-breadcrumb-item v-else>
                <router-link :to="{name: item.name}"> {{item?.meta?.title}} </router-link>
            </a-breadcrumb-item>
        </template>
    </a-breadcrumb>

</template>

