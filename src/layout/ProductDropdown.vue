<script setup>
import { userCommonMessageStore } from '@/stores/user';
import {groupBy, sum} from "xe-utils";
import commonApi from '@/api/common';
import { useRouter } from 'vue-router';

const userCommonStore = userCommonMessageStore();
let menuGroupList = computed(() => userCommonStore.menuGroupList || []); // 菜单组
let categoryProductList = computed(() => userCommonStore.categoryProductList || []); // 菜单组
let formatCategoryProductList = computed(() => userCommonStore.formatCategoryProductList || {}); // 菜单组
let isShowDropdown = ref(false); // 是否显示下拉菜单
let countProductList = ref({}); // 产品数量
const router = useRouter();
// 产品分类
const anchorList= computed(() => {
    return menuGroupList.value.map(({name, cn_name}) => {
        return {
            key: name,
            title: cn_name,
            href: `#${name}`,
        };
    });
});

const anchorRef = ref(null);


const handleClick = (e,) => {
    e.preventDefault();
   
};

// 获取产品的数量
const getProductCount = () => {
    isShowDropdown.value = true; 
    // 获取产品对应的数量   
    //if(!Object.keys(countProductList.value).length) return;
    commonApi.getProductCount().then(res => {
        if(!res) return;
        let urlData = groupBy(router.getRoutes(), 'path');
        for(let item in urlData) {
            let data = urlData[item][0];
            if(data?.meta?.product_count && res[data.meta.product_count]) {
                countProductList.value[data.path] = {
                    detail_count: res[data.meta.product_count],
                    total_count: sum(Object.values(res[data.meta.product_count])),
                };
            }
        }
        
    });
};


const productContainer = () => {
    return document.querySelector('.content-area');
};
// 搜索产品相关
let searchResults = ref([]);
let searchQuery = ref('');
const handleSearch = (e) => {
    let result = e.target.value.trim().toLowerCase();
    if(result) {
        searchResults.value = categoryProductList.value.filter(item => item.submenu.some(sub => sub.menu_name.toLowerCase().includes(result)));
    } else {
        searchResults.value = [];
    }
};

const handleImageError = (e) => {
    e.target.src = '/images/default.png';
};

const handleClickMenu = () => {
    isShowDropdown.value = false;
};
</script>

<template>
    <div>
        <vxe-button :destroy-on-close="false"  status="primary" transfer trigger="hover" @mouseenter="getProductCount" >
            <template #default>产品清单</template>
            <template v-if="isShowDropdown" #dropdowns>
                <div class="main-content">
                <div class="resource-details">
                    <a-flex justify="space-between">
                        <!-- 左侧导航区域 -->
                        <div class="sidebar">
                            <div class="sidebar-content"> 
                                <h2 class="sidebar-title mb-3">产品类别</h2>
                                    <div class="search-container mb-5">  
                                    <a-input v-model:value="searchQuery" placeholder="搜索产品" allow-clear  @change="handleSearch">
                                    <template #prefix><SearchOutlined /></template>
                                    </a-input>
                                </div>
                                    <a-anchor
                                        ref="anchorRef"
                                        :affix="false"
                                        :items="anchorList"
                                        :get-container="productContainer"
                                        @click="handleClick"
                                      
                                    >
                                    </a-anchor> 
                            </div>
                        </div>
                        <!-- 右侧内容区域 -->
                        <a-flex flex="1" vertical>
                            <a-typography-title :level="2" class="pl-5">
                                {{ searchQuery ? '搜索结果' : '' }}
                            </a-typography-title>
                            <a-flex id="product-area" vertical align="flex-start" class="content-area">
                                <div v-if="searchQuery" class="product-grid-list w-100%" wrap="wrap" gap="small"  style="width: 100%;">
                                    <template v-for="{submenu, sid} in searchResults" :key="sid">
                                        <template v-for="(level_2_item, level_2_id) in submenu" :key="level_2_id">
                                            <router-link v-show="level_2_item?.menu_name.toLowerCase().indexOf(searchQuery.toLowerCase().trim()) > -1"  :to="{ path: level_2_item?.vue_url }" class="card" @click="userCommonStore.setCheckedMenuGroup(level_2_item?.menu_group);isShowDropdown = false;">
                                                <a-badge :count="countProductList[level_2_item?.vue_url]?.total_count"
                                                :class="{ 'ant-ribbon-no-text': !countProductList?.[level_2_item?.vue_url]?.total_count }"
                                                :overflow-count="9999"
                                                >
                                                    <div class="card-content">
                                                    <div class="card-header">
                                                        <img 
                                                            :src="`/images/${level_2_item?.icon}.png`"
                                                            :alt="level_2_item?.menu_name"
                                                            @error="handleImageError"
                                                        >
                                                        <div class="card-title">{{ level_2_item?.menu_name }}</div>
                                                    </div>
                                                    <div class="card-description" :title="level_2_item?.menu_describe">{{ level_2_item?.menu_describe }}</div>
                                                    </div>
                                                    </a-badge>
                                            </router-link>
                                        </template>
                                    </template>
                                    <a-empty v-if="!searchResults.length">
                                        <template #description>
                                            没有找到相关产品
                                        </template>
                                    </a-empty>
                                </div>
                                <template v-else>   
                                    <template v-for="({name, cn_name}) in menuGroupList"  :key="name">
                                        <div  :id="name" class="mt-8 w-full">
                                            <a-divider>
                                                <a-typography-title :level="3" style="color: rgba(0, 0, 0, 0.45); margin-bottom: 0px;">
                                                    {{  cn_name }}
                                                </a-typography-title>
                                            </a-divider>
                                        <div v-for="(level_1_item, level_1_id) in formatCategoryProductList[name]" :key="level_1_id" class="mt-5 pl-5">
                                            <a-typography-title  :level="4" style="color: rgb(0 0 0 / 65%);">
                                                {{ level_1_item?.menu_name }}
                                            </a-typography-title>
                                            <!-- 产品列表 -->
                                            <a-flex class="product-grid-list" wrap="wrap" gap="small">
                                              
                                            <router-link v-for="(level_2_item, level_2_id) in level_1_item?.submenu" :key="level_2_id" class="card"  :to="{ path: level_2_item?.vue_url }"  @click="handleClickMenu(level_2_item)">
                                                <a-badge :count="countProductList[level_2_item?.vue_url]?.total_count || 0"
                                                :class="{ 'ant-ribbon-no-text': !countProductList?.[level_2_item?.vue_url]?.total_count }"
                                               
                                                :overflow-count="9999"
                                                >
                                                    <div class="card-content">
                                                        <div class="card-header">
                                                            <img 
                                                                :src="`/images/${level_2_item?.icon}.png`"
                                                                :alt="level_2_item?.menu_name"
                                                                @error="handleImageError"
                                                            >
                                                            <div class="card-title">{{ level_2_item?.menu_name }}</div>
                                                        </div>
                                                        <div class="card-description" :title="level_2_item?.menu_describe">{{ level_2_item?.menu_describe }}</div>
                                                    </div>
                                                </a-badge>   
                                            </router-link>
                                        
                                                
                                            </a-flex>
                                            
                                        </div>
                                        

                                    </div>
                                    </template>
                                </template>
                                
                                
                            </a-flex>
                        </a-flex>
                    </a-flex>
                </div>
            </div>
            </template>
    </vxe-button>
      
    </div>
</template>

<style scoped lang="less">
.main-content {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    max-height: 80vh;
    overflow: hidden;
    width: 1400px;
    
    .sidebar {
        width: 200px;
        padding: 20px;
        border-right: 1px solid #f0f0f0;
        background: #fafafa;
        
        .sidebar-title {
            color: #1f1f1f;
            font-size: 16px;
            font-weight: 600;
        }
        
        :deep(.ant-anchor-wrapper) {
            padding-right: 0;
            
            .ant-anchor {
                padding-left: 0;
            }
            
            .ant-anchor-ink {
                display: none;
            }
            
            .ant-anchor-link {
                padding: 8px 12px;
                margin: 4px 0;
                border-radius: 6px;
                transition: all 0.3s ease;
                
                &:hover {
                    background: rgba(0, 0, 0, 0.04);
                }
                
                &.ant-anchor-link-active {
                    background: var(--primary-color-1);
                    
                    .ant-anchor-link-title {
                        color: var(--primary-color);
                    }
                }
            }
        }
    }
    
    .content-area {
        padding: 20px;
        overflow-y: auto;
        max-height: 80vh;
        
        &::-webkit-scrollbar {
            width: 6px;
        }
        
        &::-webkit-scrollbar-thumb {
            background: #e6e6e6;
            border-radius: 3px;
        }
        
        &::-webkit-scrollbar-track {
            background: transparent;
        }
    }
    
    .product-grid-list {
        display: flex;
        flex-wrap: wrap;
        gap: 12px 60px;
       
        
        .card {
            position: relative;
            background: #fff;
            border: 1px solid #cccccca1;
            border-radius: 8px;
            text-decoration: none;
            width: 300px;
            
            display: flex;
            flex-direction: column;
            min-height: 56px;
            cursor: pointer;
            .card-content {
                padding: 5px;
                
            }
            :deep(.ant-badge) {
               width: 100%;
               .ant-ribbon-text {
                line-height: 26px;
               }
               .ant-badge-count {
                 font-size: 16px;
                 border-radius: unset;
                 right: 0px !important;
                 background-color: #ffffff00; /*  */
                 transform: none;
                 color: #1677ff;
                 width: 50px;
                 box-shadow: none;
                
                 top: 7px;
                 right: 0px;
               }
               .ant-ribbon-corner {
                color: #fff;
               }
               &.ant-ribbon-no-text .ant-ribbon-corner {
                    color: #ffffff00;
               }
            }
           
            
            &::before {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg, 
                    rgba(var(--primary-color-rgb), 0.08) 0%,
                    rgba(var(--primary-color-rgb), 0.02) 100%);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            &::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: var(--primary-color);
                transform: scaleX(0);
                transition: transform 0.3s ease;
                transform-origin: left;
            }
            
            &:hover {
                transform: translateY(-2px);
                border-color: rgba(var(--primary-color-rgb), 0.2);
                box-shadow: 
                    0 4px 12px rgba(0, 0, 0, 0.08),
                    0 0 0 1px rgba(var(--primary-color-rgb), 0.1);
                
                &::before {
                    opacity: 1;
                }
                
                &::after {
                    transform: scaleX(1);
                }
                
                img {
                    transform: scale(1.05) rotate(-5deg);
                }
                
                .card-title {
                    color: var(--primary-color);
                }

                .card-description {
                    opacity: 1;
                }
            }

            .card-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 8px;
                position: relative;
                z-index: 1;
                
                img {
                    width: 32px;
                    height: 32px;
                    transition: all 0.3s ease;
                    object-fit: contain;
                    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
                    flex-shrink: 0;
                    background: #fff;
                    padding: 4px;
                    border-radius: 6px;
                }
                
                .card-title {
                    font-size: 14px;
                    font-weight: 500;
                    color: rgb(0 0 0 / 60%);
                    transition: color 0.3s ease;
                    line-height: 1.4;
                    margin: 0;
                    flex: 1;
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            }
            
            .card-description {
                color: #64748b;
                font-size: 13px;
                line-height: 1.6;
                margin: 0;
                display: -webkit-box;
                -webkit-line-clamp: 1;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                opacity: 0.85;
            }

            &:focus-within {
                outline: none;
                border-color: var(--primary-color);
                box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
            }
        }
    }
    
    :deep(.ant-typography) {
        &.ant-typography-h3 {
            font-size: 18px;
            margin-bottom: 16px;
            color: #1f1f1f;
            font-weight: 600;
        }
        
        &.ant-typography-h4 {
            font-size: 15px;
            color: #666;
            margin: 12px 0;
            font-weight: 500;
        }
    }
    
    .search-container {
        :deep(.ant-input-affix-wrapper) {
            border-radius: 6px;
            
            &:hover, &:focus {
                border-color: var(--primary-color);
            }
            
            .ant-input {
                font-size: 14px;
                
                &::placeholder {
                    color: #999;
                }
            }
        }
    }

    // 优化搜索结果的显示
    :deep(.ant-empty) {
        margin: 32px 0;
        
        .ant-empty-description {
            color: #666;
            font-size: 14px;
        }
    }
}


@media (max-width: 1200px) {
    .main-content {
        width: 800px;
    }
}

@media (max-width: 992px) {
    .main-content {
        width: 700px;
        
        .product-grid-list {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        }
    }
}

@media (max-width: 768px) {
    .main-content {
        width: 90vw;
        
        .sidebar {
            width: 180px;
        }
        
        .product-grid-list {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        }
    }
}
</style>
