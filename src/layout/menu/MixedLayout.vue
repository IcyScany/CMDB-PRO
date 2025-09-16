<script setup>
import { userCommonMessageStore } from '@/stores/user';
import topUserBar from "../topUserBar.vue";
import Breadcrumb from '@/layout/components/breadcrumb.vue';
import { useRoute } from 'vue-router';

const route = useRoute();
let userCommonStore = userCommonMessageStore();
let currentMenus = computed(() => userCommonStore.menuList);

defineProps({
    layout: { type: String }, // 布局信息
    menuIsCollapse: { type: Boolean }, // 菜单是否折叠
    openKeys: { type: Array },
    selectedKeys: { type: Array },
    breadcrumbOpen: { type: Boolean }, //面包屑
    theme: { type: String },
    doublerowSelectedKey: { type: Array },
});

const emit = defineEmits(['onSelect', 'showMenu', 'menuIsCollapseClick']);

// 当前选中的一级菜单
const currentLevel1Menu = computed(() => {
    const currentPath = route.path;
    // 遍历菜单找到当前路由对应的一级菜单
    for (const key in currentMenus.value) {
        const menu = currentMenus.value[key];
        if (menu.submenu) {
            const found = menu.submenu.find(sub => sub.vue_url === currentPath);
            if (found) {
                return menu;
            }
        }
    }
    return null;
});

const onSelect = (obj) => {
    emit('onSelect', obj);
};

const showMenu = (menu_1) => {
    emit('showMenu', menu_1);
};

// 监听路由变化，自动选中对应的一级菜单
watch(
    () => route.path,
    () => {
        if (currentLevel1Menu.value) {
            showMenu(currentLevel1Menu.value);
        }
    },
    { immediate: true }
);


</script>

<template >
  <a-layout>
		<a-layout-sider  width="80" theme="dark"  :trigger="null" collapsible >
        <header id="opsHeaderLogo" class="ops-header-logo">
          <div class="ops-header-left">
            <div class="logo-bar">
              <router-link to="/">
                CM
              </router-link>
            </div>
          </div>
        </header>
      <a-menu
            v-for="menu_1 in $utils.orderBy(Object.values(currentMenus), [['sorting', 'asc']])"
            :key="menu_1?.sid"
            :selected-keys="doublerowSelectedKey"
            theme="dark"
            mode="horizontal"
            class="ops-doublerow-layout-menu"
           	@click="showMenu(menu_1)"
        >
            <template v-if="currentMenus">
                <a-menu-item 
                    :key="menu_1?.sid" 
                    class="menu-item-vertical"
                >
                    <template #icon>
                        <svg-icon :iconname="menu_1?.icon" class="menu-icon"/>
                    </template>
                    <div class="menu-text">
                        {{menu_1?.menu_name}}
                    </div>
                </a-menu-item>
            </template>
        </a-menu>
      </a-layout-sider>
      <a-layout>
        <div id="opsHeader" class="ops-header top-header-theme">
          <div></div>
          <div class="ops-header-right">
            <top-user-bar/>
          </div>
        </div>
      <a-layout>
        <a-layout-sider 	
           :collapsed="menuIsCollapse"
           :trigger="null"
           width="170"
           theme="light"
           collapsible
           >
            <a-menu
             	:open-keys="openKeys"
                :selected-keys="selectedKeys"
                mode="inline"
                theme="light"
            	@select="onSelect"
            >
              <a-menu-item 
                v-for="leve2 in currentMenus?.[doublerowSelectedKey[0]]?.submenu || []" 
                :key="leve2.sid || leve2?.vue_url"
              >
                <router-link :to="leve2?.vue_url" class="menu-link">
                  <svg-icon :iconname="leve2.icon" class="menu-icon"/>
                  <span>{{ leve2.menu_name }}</span>
                </router-link>
              </a-menu-item>
                
            </a-menu>
				</a-layout-sider>
				<a-layout-content>
					<breadcrumb v-if="breadcrumbOpen" />
				
					<div class="main-content-wrapper">
						<div id="admin-ui-main" class="admin-ui-main">
							<router-view key=""/>
						
						</div>
					</div>
			</a-layout-content>
		</a-layout>
  </a-layout>
</a-layout>


</template>

<style lang="less" scoped>
.ant-menu-overflow {
   display: block !important;
}
 .xy-color-fff {
		color: #fff;
	}
	.xy-pdl25 {
		padding-left: 11px;
	}
	.xy-menu-line {
		text-align: center;
		height: auto;
		line-height: 20px;
		flex: none;
		display: block;
		padding: 12px 0 !important;
	}
	.xy-navmenu-line {
		min-width: 0;
		flex: 1 1 0%;
		overflow: hidden;
	}
	.xy-bb0 {
		border-bottom: none;
		position: relative;
	}
	.ant-layout-content {
		display: flex;
		flex-direction: column;
	}
	.xy-pd1180 {
		padding: 10px 150px 0 150px;
	}
	.xy-pd050 {
		padding: 0 50px;
	}
	.xy-pl10 {
		padding-left: 10px;
	}
	.xy-mg050 {
		margin: 0px 150px;
	}

	.menu-item-vertical {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 64px;
		padding: 8px 0;
		
		.menu-icon {

			margin-bottom: 4px;
		}
		
		.menu-text {
			font-size: 12px;
			line-height: 1.2;
		}
	}

	.menu-link {
		display: flex;
		align-items: center;
		
		.menu-icon {
			font-size: 16px;
			margin-right: 8px;
		}
	}

	.ops-doublerow-layout-menu {
		&:deep(.ant-menu-item) {
			&.ant-menu-item-selected {
				background-color: var(--primary-color);
				
				&::after {
					display: none;
				}
			}
		}
	}

	.xy-menu-line,
	.ops-doublerow-layout-menu-item-fort-div,
	.ops-doublerow-layout-menu-item-fort-div-span {
		display: none;
	}
</style>
