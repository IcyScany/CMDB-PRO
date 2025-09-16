<script setup>
import { userCommonMessageStore } from '@/stores/user';
import {groupBy, sum} from "xe-utils";
import commonApi from '@/api/common';
import { useRouter } from 'vue-router';
const userCommonStore = userCommonMessageStore();
const currentMenuGroup = computed(() => userCommonStore.checkedMenuGroup );
let menuGroupList = computed(() => userCommonStore.menuGroupList || []); // 菜单组
let categoryProductList = computed(() => userCommonStore.categoryProductList || []); // 菜单组
let formatCategoryProductList = computed(() => userCommonStore.formatCategoryProductList || {}); // 菜单组
// 产品分类
const activeProduct = computed(() => currentMenuGroup ? groupBy(menuGroupList.value, 'name')?.[currentMenuGroup.value]?.[0]: {});
const router = useRouter();
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
let countProductList = ref({});
// 监听路由变化
onMounted(() => {
    if(currentMenuGroup.value) {
        anchorRef.value.scrollTo(`#${currentMenuGroup.value}`);
    }
    // 获取产品对应的数量   
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
});

const handleClick = (e, link) => {
    e.preventDefault();
    if(link?.href && link.href.split('#')[1]!== 'undefined') {
        userCommonStore.setCheckedMenuGroup(`${link.href.split('#')[1]}`);
    }
};
const handleChange = (link) => {
    if(link && link.split('#')[1]!== 'undefined') {
        userCommonStore.setCheckedMenuGroup(`${link.split('#')[1]}`);
    }
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
    let img = e.target;
    e.target.src = '/images/default.png';
    img.onerror = null; //防止闪图
    return true;
};






</script>

<template>
    <div class="aliyun-product-container">
        <!-- 顶部标题区域 -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="title">{{ activeProduct?.cn_name }}</h1>
                <p class="subtitle">{{ activeProduct?.describe }}</p>
            </div>
            <!-- 底部波浪 -->
            <div class="wave-container">
                <svg class="wave" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="#F5F7FA"
                        d="M0,160L34.3,165.3C68.6,171,137,181,206,170.7C274.3,160,343,128,411,128C480,128,549,160,617,170.7C685.7,181,754,171,823,154.7C891.4,139,960,117,1029,112C1097.1,107,1166,117,1234,122.7C1302.9,128,1371,128,1406,128L1440,128L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z">
                    </path>
                </svg>
            </div>
        </div>

        <!-- 主体内容 -->
        <div class="main-content">

            <div class="resource-details">
                <a-flex justify="space-between">
                    <!-- 左侧导航区域 -->
                    <div class="sidebar">
                        <div class="sidebar-content">
                            <h2 class="sidebar-title mb-3">产品类别</h2>
                            <div class="search-container mb-5">
                                <a-input v-model:value="searchQuery" placeholder="搜索产品" allow-clear
                                    @change="handleSearch">
                                    <template #prefix>
                                        <SearchOutlined />
                                    </template>
                                </a-input>
                            </div>
                            <a-anchor ref="anchorRef" :affix="false" :items="anchorList" show-ink-in-fixed
                                :get-container="productContainer" :get-current-anchor="() => `#${currentMenuGroup}`"
                                @click="handleClick" @change="handleChange">
                            </a-anchor>
                        </div>
                    </div>
                    <!-- 右侧内容区域 -->
                    <a-flex flex="1" vertical>
                        <a-typography-title :level="2" class="pl-5">
                            {{ searchQuery ? '搜索结果' : '' }}
                        </a-typography-title>
                        <a-flex id="product-area" vertical align="flex-start" class="content-area">
                            <div v-if="searchQuery" class="product-grid-list w-100%" wrap="wrap" gap="small"
                                style="width: 100%;">
                                <template v-for="{submenu, sid} in searchResults" :key="sid">
                                    <template v-for="(level_2_item, level_2_id) in submenu" :key="level_2_id">
                                        <router-link
                                            v-show="level_2_item?.menu_name.toLowerCase().indexOf(searchQuery.toLowerCase().trim()) > -1"
                                            :to="{ path: level_2_item?.vue_url }" class="card"
                                            @click="userCommonStore.setCheckedMenuGroup(level_2_item?.menu_group)">

                                            <a-badge-ribbon :text="countProductList[level_2_item?.vue_url]?.total_count"
                                                :class="{ 'ant-ribbon-no-text': !countProductList?.[level_2_item?.vue_url]?.total_count }">
                                                <div class="card-content">
                                                    <a-row :gutter="12" align="middle" justify="space-between">
                                                        <a-col>
                                                            <a-row align="middle">
                                                                <a-col>
                                                                    <img :src="`/images/${level_2_item?.icon}.png`"
                                                                        :alt="level_2_item?.menu_name"
                                                                        @error="handleImageError" />
                                                                </a-col>
                                                                <a-col>
                                                                    <div class="card-title h-8 mb-0 pl-2">{{
                                                                        level_2_item?.menu_name }}</div>
                                                                </a-col>
                                                            </a-row>

                                                        </a-col>

                                                    </a-row>
                                                    <div class="card-description">
                                                        {{ level_2_item?.menu_describe }}
                                                    </div>
                                                </div>
                                            </a-badge-ribbon>
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
                                <template v-for="({name, cn_name}) in menuGroupList" :key="name">
                                    <div :id="name" class="mt-4 w-full">
                                        <a-divider>
                                            <a-typography-title :level="3"
                                                style="color: rgba(0, 0, 0, 0.45); margin-bottom: 0px;">
                                                {{ cn_name }}
                                            </a-typography-title>
                                        </a-divider>

                                        <div v-for="(level_1_item, level_1_id) in formatCategoryProductList[name]" :key="level_1_id"
                                            class="mt-4 pl-5">
                                            <a-typography-title :level="4">
                                                {{ level_1_item?.menu_name }}
                                            </a-typography-title>
                                            <!-- 产品列表 -->
                                            <a-flex class="product-grid-list" wrap="wrap" gap="small">
                                                <template v-for="(level_2_item, level_2_id) in level_1_item?.submenu"
                                                    :key="level_2_id">
                                                    <router-link :to="{ path: level_2_item?.vue_url }" class="card pr-0"
                                                        @click="userCommonStore.setCheckedMenuGroup(level_2_item?.menu_group)">
                                                        <a-badge-ribbon
                                                            :text="countProductList?.[level_2_item?.vue_url]?.total_count"
                                                            :class="{'ant-ribbon-no-text': !countProductList?.[level_2_item?.vue_url]?.total_count}">
                                                            <div class="card-content">
                                                                <a-row :gutter="12" align="middle"
                                                                    justify="space-between">
                                                                    <a-col>
                                                                        <a-row align="middle">
                                                                            <a-col>
                                                                                <img :src="`/images/${level_2_item?.icon}.png`"
                                                                                    :alt="level_2_item?.menu_name"
                                                                                    @error="handleImageError" />
                                                                            </a-col>
                                                                            <a-col>
                                                                                <div class="card-title h-8 mb-0 pl-2">{{
                                                                                    level_2_item?.menu_name }}</div>
                                                                            </a-col>
                                                                        </a-row>

                                                                    </a-col>

                                                                </a-row>


                                                                <div class="card-description">{{
                                                                    level_2_item?.menu_describe }}</div>
                                                            </div>
                                                        </a-badge-ribbon>
                                                    </router-link>
                                                </template>
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


    </div>
</template>

<style scoped lang="less">
.main-content {
    background-color: #f5f5f5 !important;
    position: relative;
    min-height: calc(100vh - 200px);
    
    .sidebar {
        position: relative;
        width: 200px;
       // background-color: #fff;
        padding: 20px;
        //box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        border-radius: 4px;
        height: calc(100vh - 200px);
        overflow-y: auto;
    }
    
    .content-area {
       // margin-left: 220px; // 200px + 20px margin
        padding: 20px;
        height: calc(100vh - 200px);
        overflow-y: auto;
    }
    
    :deep(.ant-anchor-link) {
        font-size: 16px;
        margin-bottom: 12px;
        
        .ant-anchor-link-title {
            color: #595959;
            transition: color 0.3s;
            
            &:hover {
                color: #1890ff;
            }
        }
    }
    .product-detail-popover {
    .ant-popover-inner-content {
        padding: 8px 12px;
        font-size: 14px;
        color: #2c3e50;
    }
    }
    .product-grid-list {
        display: flex;
        flex-wrap: wrap;
        gap: 24px;
        
        .card {
            background-color: #fff;
            border-radius: 12px;
           
            width: 500px;
            position: relative;
            text-decoration: none;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(0, 0, 0, 0.08);
            :deep(.ant-ribbon) {
                background-color: #3213c280;
                top: 8.5px; 
                text-align: center; 
                font-size: 16px; 
                width: 50px;
               .ant-ribbon-text {
                line-height: 28px;
               }
               .ant-ribbon-corner {
                color: #fff;
               }
               &.ant-ribbon-no-text .ant-ribbon-corner {
                    color: #ffffff00;
               }
            }
           
           
           
            .card-content {
                padding: 15px;
            }
            
            &::before {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: 12px;
                padding: 1px;
                background: linear-gradient(
                    135deg,
                    rgba(255, 255, 255, 0.4),
                    rgba(255, 255, 255, 0.1)
                );
                -webkit-mask: linear-gradient(#fff 0 0) content-box,
                             linear-gradient(#fff 0 0);
                mask: linear-gradient(#fff 0 0) content-box,
                      linear-gradient(#fff 0 0);
                -webkit-mask-composite: xor;
                mask-composite: exclude;
                pointer-events: none;
            }
            
            &:hover {
               /*  transform: translateY(-6px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); */

                &::after {
                    content: '';
                    position: absolute;
                    inset: -1px;
                    border-radius: 12px;
                    padding: 1px;
                    background: linear-gradient(
                        135deg,
                        var(--primary-color),
                        rgba(24, 144, 255, 0.5)
                    );
                    -webkit-mask: linear-gradient(#fff 0 0) content-box,
                                 linear-gradient(#fff 0 0);
                    mask: linear-gradient(#fff 0 0) content-box,
                          linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    pointer-events: none;
                }

                .card-title,
                .product-num {
                    color: var(--primary-color) !important;
                }
                .product-num {
                    text-decoration: underline;
                }

                img {
                    transform: scale(1.05);
                }
            }
            
            img {
                height: 48px;
                width: 48px;
                margin-bottom: 12px;
                transition: transform 0.3s ease;
                filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
            }
            
            .card-title {
                font-size: 16px;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 5px;
                transition: color 0.3s ease;
            }
            
            .card-description {
                color: #64748b;
                font-size: 13px;
                line-height: 1.6;
                margin: 0;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            &:active {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            }
        }
    }

    .features-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
        margin-top: 32px;
        
        .feature-item {
            background: #fff;
            border-radius: 8px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            transition: transform 0.3s;
            
            &:hover {
                transform: translateY(-4px);
            }
            
            .feature-header {
                margin-bottom: 16px;
                
                h3 {
                    font-size: 18px;
                    color: #262626;
                    margin: 0;
                }
            }
            
            p {
                color: #595959;
                font-size: 14px;
                line-height: 22px;
                margin-bottom: 16px;
            }
            
            .submenu-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                
                .submenu-item {
                    color: #1890ff;
                    text-decoration: none;
                    padding: 4px 12px;
                    border-radius: 4px;
                    background: rgba(24, 144, 255, 0.1);
                    transition: all 0.3s;
                    
                    &:hover {
                        background: rgba(24, 144, 255, 0.2);
                    }
                }
            }
        }
    }
}

:deep(.main-content-wrapper) {
    padding: 24px !important;
    max-width: 1200px;
    margin: 0 auto;
}

.aliyun-product-container {
    min-height: 100vh;
    background-color: #f5f5f5;
    
    .page-header {
        position: relative;
        padding: 48px 0 180px;
       
        color: #fff;
        overflow: hidden;
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color) 100%);

        .header-content {
            position: relative;
            z-index: 2;
            text-align: center;
            padding: 0 20px;
            margin-bottom: 40px;

            .title {
                font-size: 48px;
                font-weight: 700;
                margin-bottom: 20px;
                background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .subtitle {
                font-size: 18px;
                line-height: 1.6;
                
                margin: 0 auto;
                opacity: 0.9;
            }
        }

        .wave-container {
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            line-height: 0;
            z-index: 1;
            transform: scale(1.2, 1.4);
            transform-origin: bottom;

            .wave {
                width: 100%;
                height: 200px;
                display: block;
                filter: blur(0.5px);
                
                path {
                    fill: #F5F7FA;
                    transition: d 0.3s ease;
                }
            }
        }
    }
}



.main-content {
    position: relative;
    z-index: 2;
    margin-top: -120px;
    background: transparent;
    padding: 60px 40px;
    background: #f5f5f5;

    .resource-details {
        margin-top: -40px;
        padding: 40px 0;
        background: #ffffff66;
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);

        .details-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 40px;

            .details-content {
                width: 100%;

                .company-title {
                    font-size: 36px;
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 16px;
                }

                .company-desc {
                    font-size: 16px;
                    color: #666;
                    margin-bottom: 40px;
                    line-height: 1.6;
                }

                .features-list {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;

                    .feature-item {
                        padding: 24px;
                        background: #f8f9fa;
                        border-radius: 12px;
                        transition: all 0.3s;

                        &:hover {
                            background: #fff;
                            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
                        }

                        .feature-header {
        margin-bottom: 12px;

                            h3 {
                                font-size: 18px;
                                font-weight: 600;
                                color: #333;
                                margin: 0;
                            }
                        }

                        p {
                            font-size: 14px;
                            color: #666;
                            margin-bottom: 16px;
                            line-height: 1.5;
                        }

                        .submenu-list {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 8px;

                            .submenu-item {
                                padding: 6px 12px;
                                background: #fff;
                                border-radius: 20px;
                                font-size: 13px;
                                color: #1890ff;
                                text-decoration: none;
                                border: 1px solid #e6f7ff;
                                transition: all 0.3s;

                                &:hover {
                                    background: #1890ff;
                                    color: #fff;
                                    border-color: #1890ff;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// 响应式设计
@media (max-width: 1200px) {
    .product-grid-list .card {
        width: calc(50% - 12px);
    }
}

@media (max-width: 768px) {
    .main-content {
        .sidebar {
            position: static;
            width: 100%;
            height: auto;
            margin-bottom: 20px;
        }
        
        .content-area {
            margin-left: 0;
            height: auto;
        }

        padding: 40px 20px;
        margin-top: -60px !important;

        .tours-section {
            .section-title {
                font-size: 28px;
                margin-bottom: 32px;
            }

            .carousel-slide {
                padding: 0 8px;

                .tour-card {
                    padding: 20px;
                    height: 180px;

                    .tour-name {
                        font-size: 16px;
                    }

                    .tour-desc {
                        font-size: 13px;
                    }
                }
            }
        }
    }



    .product-grid {
        grid-template-columns: 1fr;
        gap: 32px;
    }

    .product-card {
        padding: 40px 20px 20px !important;

        .icon-wrapper {
            top: -24px !important;
            width: 48px !important;
            height: 48px !important;

            .icon {
                font-size: 20px !important;
            }
        }

        .product-name {
            font-size: 18px !important;
        }
    }

    .resource-details {
        margin-top: 40px;
        padding: 20px;

        .details-container {
            padding: 0 20px;

            .details-content {
                .features-list {
                    grid-template-columns: 1fr;
                }

                .company-title {
                    font-size: 28px;
                }
            }
        }
    }
}

@media (max-width: 1024px) {
    .details-container {
        flex-direction: column;
        
        .details-content {
            max-width: 600px;
            margin: 0 auto;
        }
    }
}
</style>
