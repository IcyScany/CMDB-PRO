<script setup>
import { onMounted, ref} from 'vue';
import { useRouter } from 'vue-router';

let router = useRouter();


const selectedKeys = ref([]);


onMounted(() => {
    selectedKeys.value = [router.currentRoute.value.name];
});



</script>

<template>
    <a-layout>
        <a-layout-header :style="{ position: 'fixed', zIndex: 1, width: '100%', padding: '0 15px' }">
           <a-row justify="space-between" type="flex" :wrap="false">
              <a-col flex="auto">
                  <logo/>
                  <a-menu
                      v-model:selectedKeys="selectedKeys"
                      theme="dark"
                      mode="horizontal"
                      :style="{ lineHeight: '64px' }"
                  >
                      <template v-if="$route?.meta?.pageType === 'backend' && $route?.matched[0]?.children">
                          <a-menu-item v-for="route in  $utils.filter($route.matched[0].children, item => !item.props )" :key="route.name">
                              <router-link :to="{name: route.name}">{{route.meta?.title}}</router-link>
                          </a-menu-item>
                      </template>
                  </a-menu>
              </a-col>

              <a-col>
                 <a-row justify="space-between"  type="flex" :wrap="false">
                     <user-info></user-info>
                     <UserImage/>
                 </a-row>
              </a-col>
           </a-row>

        </a-layout-header>
        <a-layout-content :style="{ padding: '0 15px', marginTop: '64px' }">

            <div :style="{ background: '#fff', padding: '24px', height: '100%', margin: '16px 0' }">
                <router-view/>
            </div>
        </a-layout-content>

    </a-layout>
</template>




<style scoped lang="less">


</style>
