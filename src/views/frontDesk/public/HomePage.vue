<script setup>
import { userCommonMessageStore } from '@/stores/user';
import {groupBy, orderBy} from "xe-utils";
import MenuGroupCheck  from "./MenuGroupCheck.vue";
import ProductCategory from "@/layout/ProductCategory.vue";

const userCommonStore = userCommonMessageStore();
const currentMenus = computed(() => userCommonStore.menuList);
const currentMenuGroup = computed(() => userCommonStore.checkedMenuGroup );
let menuGroupList = computed(() => userCommonStore.menuGroupList || []); // 菜单组

// 产品分类
const activeProduct = computed(() => currentMenuGroup ? groupBy(menuGroupList.value, 'name')?.[currentMenuGroup.value]?.[0]: {});

// 当前选中的分类
const activeCategory = ref('');

// 根据分类筛选显示的内容
const filteredCategories = computed(() => {
    if (!activeCategory.value) {
        return Object.values(orderBy(Object.values(currentMenus.value), [['sorting', 'asc']]));
    }
    return Object.values(orderBy(Object.values(currentMenus.value), [['sorting', 'asc']])).filter(item => item.sid === activeCategory.value);
});


</script>

<template>
    <menu-group-check  v-if="!currentMenuGroup" />
    <div v-else class="aliyun-product-container">
    
        <!-- 顶部标题区域 -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="title">{{ activeProduct?.cn_name }}</h1>
                <p class="subtitle">{{ activeProduct?.describe }}</p>
            </div>
            <!-- 底部波浪 -->
            <div class="wave-container">
                <svg class="wave" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="#F5F7FA" d="M0,160L34.3,165.3C68.6,171,137,181,206,170.7C274.3,160,343,128,411,128C480,128,549,160,617,170.7C685.7,181,754,171,823,154.7C891.4,139,960,117,1029,112C1097.1,107,1166,117,1234,122.7C1302.9,128,1371,128,1406,128L1440,128L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path>
                </svg>
            </div>
        </div>

        <div class="main-content">

            <!-- 只保留一个资源类型详情区域 -->
            <div class="resource-details">
                 <!-- 主体内容区 -->
                <a-row type="flex" :wrap="false">
                      
                        <a-col flex="10%">
                            <!-- 产品分类 -->
                            <product-category mode="vertical"/>
                        </a-col>
                        <a-col flex="90%"> 
                <div class="details-container">
                   
                            <!-- 右侧内容区域 -->
                        <div class="details-content">
                            <h2 class="company-title">资源服务</h2>
                            <p class="company-desc">提供全面的资源管理服务，助力企业高效运维</p>
                            <div class="features-list">
                                {{ filteredCategories }}
                                <template v-for="menu in filteredCategories" :key="menu.sid" >
                                    <div v-if="menu.submenu.length" class="feature-item">
                                    
                                    <div class="feature-header">
                                        <h3>{{ menu.menu_name }}</h3>
                                    </div>
                                    <p>{{ menu.menu_describe  }}</p>
                                    <div class="submenu-list">
                                        <router-link
                                            v-for="sub in menu.submenu"
                                            :key="sub.sid"
                                            :to="{ path: sub.vue_url }"
                                            class="submenu-item"
                                        >
                                            {{ sub.menu_name }}
                                        </router-link>
                                    </div>
                                </div>
                                </template>
                                
                                <a-empty v-if="!filteredCategories.length">
                                    <template #description>
                                        所属业态无资源服务数据
                                    </template>
                                </a-empty>
                            </div>
                        </div>
                       
                   
                    
                </div>
            </a-col> </a-row>
            </div>
       
        </div>
    
    </div>
</template>

<style scoped lang="less">
:deep(.main-content-wrapper) {
    padding: 0px !important;
}
.aliyun-product-container {
    min-height: 100vh;
    background-color: #F5F7FA;

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

    .main-content {
        position: relative;
        z-index: 2;
        margin-top: -120px;
        background: transparent;
        padding: 60px 40px;
        background: #f8f9fa;

        .resource-details {
            margin-top: -40px;
            padding: 40px 0;
            background: #fff;
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
}

// 响应式设计
@media (max-width: 1200px) {
    .product-card {
        max-width: 100% !important;
        min-width: 300px !important;
    }
}

@media (max-width: 768px) {
    .main-content {
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
