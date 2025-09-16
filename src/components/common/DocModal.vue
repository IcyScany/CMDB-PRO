<script setup>
import { useRoute } from 'vue-router';
import { marked } from 'marked';

let  props = defineProps({
    renderType:{ // 显示在页面上的样式：字体图标(text)、button
        type: String,
        default: 'button',
    },
    customFileMd: {
        type: Object,
        default: () => ({}),
    },
    width: {
        type: String,
        default: '100%',
    },
    title: {
        type: String,
        default: '帮助文档',
    },
    trigger: {
        type: String,
        default: 'click', // 'click' | 'hover'
    }
});

const route = useRoute();
const showDocModal = ref(false);
const docContent = ref('');
//const isFixed = ref(true); // 默认固定在右侧
const modalRef = ref(null);

// 计算窗口高度
const windowHeight = ref(window.innerHeight);

// 控制滚动按钮的显示
const showScrollButtons = ref(false);
const showTopButton = ref(false);
const showBottomButton = ref(false);
const positionTop = ref(0); // 非置顶状态下的top位置
const ifTop = ref(false); // 文档弹窗是否置顶

// 监听窗口大小变化
const handleResize = () => {
    windowHeight.value = window.innerHeight;
};

onMounted(() => {
    window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
});

// 获取路由相关信息
const getRouteInfo = () => {
    const paths = route.path.split('/').filter(p => p && p !== 'page');
    const mainRoute = paths[0];
    const subRoute = paths.slice(1).join('/');
    return { mainRoute, subRoute };
};

// 生成文档相关URL
const getUrls = () => {
    const { mainRoute, subRoute } = getRouteInfo();
    const baseUrl = `${window.location.protocol}${import.meta.env.VITE_PAGE_API_URL}opscenter-cloud-manage-docs/${props?.customFileMd?.prefix ? props?.customFileMd?.prefix : mainRoute}/`;
    const docUrl = props?.customFileMd?.name ? `${baseUrl}${props?.customFileMd?.name}` : `${baseUrl}${subRoute}_docs.md`;
    return { baseUrl, docUrl };
};

// 处理markdown中的图片路径
const processImageUrls = (content) => {
    const { baseUrl } = getUrls();
    return content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
        if (src.startsWith('http://') || src.startsWith('https://')) {
            return match;
        }
        return `![${alt}](${baseUrl}${src})`;
    });
};

// 滚动控制
const scrollControl = {
    toTop: () => {
        const content = document.querySelector('.doc-content');
        content?.scrollTo({ top: 0, behavior: 'smooth' });
    },
    toBottom: () => {
        const content = document.querySelector('.doc-content');
        content?.scrollTo({ 
            top: content.scrollHeight, 
            behavior: 'smooth' 
        });
    },
    handleScroll: (e) => {
        const content = e.target;
        const { scrollTop, scrollHeight, clientHeight } = content;
        
        showScrollButtons.value = scrollHeight > clientHeight;
        showTopButton.value = scrollTop > 100;
        showBottomButton.value = scrollHeight - scrollTop - clientHeight > 100;
    }
};

// 文档内容加载与处理
const loadDocContent = async () => {
    try {
        const { docUrl } = getUrls();
        const response = await fetch(docUrl);
        if (!response.ok) throw new Error('文档加载失败');
        
        const text = await response.text();
        docContent.value = marked(processImageUrls(text));
    } catch (error) {
        console.error('文档加载失败:', error);
        docContent.value = '文档加载失败，请稍后重试';
    }
};

// 监听内容变化
watch(() => docContent.value, () => {
    nextTick(() => {
        const content = document.querySelector('.doc-content');
        content && scrollControl.handleScroll({ target: content });
    });
});

// 模态框控制
const modalControl = {
    handleShow: () => {
        loadDocContent();
        nextTick(scrollControl.toTop);
    },
    close: () => {
        showDocModal.value = false;
    },
    toggleTop: () => {
        if (ifTop.value) {
            modalRef.value.setPosition(positionTop.value);
        } else {
            positionTop.value = modalRef.value.getPosition().top;
            modalRef.value.setPosition(0);
        }
        ifTop.value = !ifTop.value;
    }
};

// 新增鼠标事件处理
const handleMouseEnter = () => {
    if (props.trigger === 'hover') {
        showDocModal.value = true;
    }
};


</script>

<template>
    <div 
        class="doc-trigger"
        @mouseenter="handleMouseEnter"
        @click.stop="props.trigger === 'click' && (showDocModal = true)"
    >
        <VxeButton 
            :mode="renderType"  
            status="primary"  
            icon="vxe-icon-question-circle-fill"
        >
            <span v-show="renderType ==='button'">文档</span>
        </VxeButton>
    </div>
    <vxe-modal
        ref="modalRef"
        v-model="showDocModal"
        :width="width"
        :height="windowHeight - 80"
        :show-zoom="true"
        :show-footer="false"
        :show-minimize="false"
        :mask="false"
        :mask-closable="false"
        :resize="true"
        lock-scroll
        :position="{top: 'center', left: `calc(100% - ${width})`}"
        class-name="doc-modal"
        :lock-view="false"
        transfer
        @close="modalControl.close"
        @show="modalControl.handleShow"
    >
        <template #title>
            <div class="modal-title">
                <span>{{title}}</span>
                <div class="title-actions">
                    <a-tooltip :title="ifTop ? '取消置顶' : '置顶'">
                        <BookOutlined :style="{float: 'right', 'margin-right': '10px', 'cursor': 'pointer'}" @click="modalControl.toggleTop"/>
                    </a-tooltip>
                </div>
            </div>
        </template>
        
        <div class="doc-container">
            <div 
                class="doc-content markdown-body"
                @scroll="scrollControl.handleScroll"
                v-html="docContent"
            ></div>

            <!-- 右下角滚动按钮组 -->
            <div v-show="showScrollButtons" class="scroll-actions">
                <a-tooltip title="回到顶部" placement="left">
                    <vxe-button
                        v-show="showTopButton"
                        circle
                        icon="vxe-icon-arrow-up"
                        class="scroll-button fade-in"
                        @click="scrollControl.toTop"
                    />
                </a-tooltip>
                <a-tooltip title="回到底部" placement="left">
                    <vxe-button
                        v-show="showBottomButton"
                        circle
                        icon="vxe-icon-arrow-down"
                        class="scroll-button fade-in"
                        @click="scrollControl.toBottom"
                    />
                </a-tooltip>
            </div>
        </div>
    </vxe-modal>
</template>

<style scoped lang="less">
.modal-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .title-actions {
        display: flex;
        gap: 8px;
    }
}

.doc-container {
    position: relative;
    height: 100%;
}

.doc-content {
    height: 100%;
    overflow-y: auto;
    padding: 16px;
    padding-right: 50px; // 为右侧按钮留出空间
}

:deep(.doc-modal) {
    position: fixed !important;
    margin: 0 !important;
    
    .vxe-modal--wrapper {
        position: fixed !important;
        top: 80px !important;
        right: 0 !important;
        bottom: 0 !important;
        margin: 0 !important;
        width: 800px !important;
        box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
        
        .vxe-modal--content {
            height: calc(100% - 52px) !important;
            overflow: hidden;
        }
    }
    
    // 优化动画效果
    &.vxe-modal--animation-enter-active,
    &.vxe-modal--animation-leave-active {
        transition: transform 0.3s ease-out;
    }
    
    &.vxe-modal--animation-enter-from,
    &.vxe-modal--animation-leave-to {
        transform: translateX(100%);
    }
}

// 隐藏遮罩层
:deep(.vxe-modal--mask) {
    display: none;
}

// Markdown样式
:deep(.markdown-body) {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-color);

    h1, h2, h3, h4, h5, h6 {
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
    }

    p {
        margin-bottom: 16px;
    }

    code {
        padding: 0.2em 0.4em;
        margin: 0;
        font-size: 85%;
        background-color: rgba(27,31,35,0.05);
        border-radius: 3px;
    }

    pre {
        padding: 16px;
        overflow: auto;
        font-size: 85%;
        line-height: 1.45;
        background-color: #f6f8fa;
        border-radius: 3px;
    }
}

// 右下角滚动按钮组样式
.scroll-actions {
    position: absolute;
    right: 32px;
    bottom: 32px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 100;

    .scroll-button {
        width: 32px;
        height: 32px;
        padding: 0;
        background: #fff;
        border: 1px solid #dcdfe6;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
        transition: all 0.3s, opacity 0.3s;
        margin-left: 0px;
        opacity: 0.6;

        &:hover {
            background: var(--primary-color);
            border-color: var(--primary-color);
            color: #fff;
            opacity: 1;
        }
    }
}

// 淡入动画
.fade-in {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 0.6;
        transform: translateY(0);
    }
}

.doc-trigger {
    display: inline-block;
    cursor: pointer;
    margin-left: 2px;
}
</style> 
