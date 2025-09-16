<script setup>
import CmdbLoginModal from '@/components/login/CmdbLoginModal.vue';
import { legacyLogicalPropertiesTransformer } from 'ant-design-vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import { primaryColor }  from '@/assets/less/variable.module.less';
import { userCommonMessageStore } from '@/stores/user';
import {useRoute} from "vue-router";
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');
const routes = useRoute();

let userCommonStore = userCommonMessageStore();
let checkBusData = computed(() => userCommonStore?.loginCurrentBus || userCommonStore?.globalShareCheckBus);

let loginSucceess = computed(() => userCommonStore.loginSucceess);

let systemThemColor = computed(() => checkBusData.value && loginSucceess.value?.business_list?.[checkBusData.value] ?  loginSucceess.value.business_list?.[checkBusData.value][1] : primaryColor);
let antdvTheme = computed(() => {
    return {
        token: {
            colorPrimary: systemThemColor.value,
        }
    };
});

onMounted(() => {
    userCommonStore.handleToggleBusTheme(systemThemColor.value);
});

watch(() => systemThemColor.value, (val) => {
    userCommonStore.handleToggleBusTheme(val);
});

const isRefreshFlag = ref(true);
const reloadPage = () => {
    isRefreshFlag.value = false;
    nextTick(() => {
        isRefreshFlag.value = true;
    });
};


onUnmounted(() => {
    userCommonStore.handleClearUserMessage();
});

provide("reloadPage", reloadPage);
provide("systemCurrentMenu", routes.matched[routes.matched.length - 1 ]);

</script>

<template>

  <a-config-provider
    :theme="antdvTheme"
    :locale="zhCN"
  >
      <a-style-provider :transformers="[legacyLogicalPropertiesTransformer]" hash-priority="high">
          <a-watermark
			class="admin-ui-main"
		>
            <router-view v-if="isRefreshFlag"/>
		</a-watermark>
      </a-style-provider >
  </a-config-provider>

 <CmdbLoginModal/>
</template>

<style lang="less">
@import 'ant-design-vue/dist/reset.css';
@import "@/assets/iconfont/iconfont.css";
@import "@/assets/style/index.less";


.ant-modal div[aria-hidden="true"] {
    display: none !important
}
.vxe-grid--toolbar-wrapper {
    margin: 0rem;
}
.vxe-modal--wrapper.type--modal .vxe-modal--box  {
    width: 80%;
    height: 80%;
}

</style>

