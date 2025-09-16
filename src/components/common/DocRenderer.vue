<script setup>
import { useRoute } from 'vue-router';
import { marked } from 'marked';

let props = defineProps({
    customFileMd: {
        type: Object,
        default: () => ({}),
    },
    title: {
        type: String,
        default: '帮助文档',
    }
});

const route = useRoute();
const docContent = ref('');
const loading = ref(true);
const error = ref(false);

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

// 文档内容加载与处理
const loadDocContent = async () => {
    try {
        loading.value = true;
        error.value = false;
        const { docUrl } = getUrls();
        const response = await fetch(docUrl);
        if (!response.ok) throw new Error('文档加载失败');
        
        const text = await response.text();
        docContent.value = marked(processImageUrls(text));
    } catch (err) {
        console.error('文档加载失败:', err);
        docContent.value = '文档加载失败，请稍后重试';
        error.value = true;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    loadDocContent();
});
</script>

<template>
    <div class="doc-renderer">
        
        
        <div class="doc-body">
            <div v-if="loading" class="loading-container">
                <a-spin size="large" />
                <p class="loading-text">正在加载文档...</p>
            </div>
            
            <div v-else-if="error" class="error-container">
                <a-result status="error" title="文档加载失败" sub-title="请检查网络连接或稍后重试">
                    <template #extra>
                        <a-button type="primary" @click="loadDocContent">重新加载</a-button>
                    </template>
                </a-result>
            </div>
            
            <div v-else class="doc-content markdown-body" v-html="docContent"></div>
        </div>
    </div>
</template>

<style scoped lang="less">
.doc-renderer {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 8px;
   
    overflow: hidden;
}

.doc-header {
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;
    background: #fafafa;
    
    .doc-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
    }
}

.doc-body {
    flex: 1;
    overflow: hidden;
    position: relative;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 40px;
    
    .loading-text {
        margin-top: 16px;
        color: #666;
        font-size: 14px;
    }
}

.error-container {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
}

.doc-content {
    height: 100%;
    overflow-y: auto;
    padding: 24px;
    line-height: 1.6;
    
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

        h1 {
            font-size: 2em;
            border-bottom: 1px solid #eaecef;
            padding-bottom: 0.3em;
        }

        h2 {
            font-size: 1.5em;
            border-bottom: 1px solid #eaecef;
            padding-bottom: 0.3em;
        }

        h3 {
            font-size: 1.25em;
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
            font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        }

        pre {
            padding: 16px;
            overflow: auto;
            font-size: 85%;
            line-height: 1.45;
            background-color: #f6f8fa;
            border-radius: 6px;
            border: 1px solid #e1e4e8;
            
            code {
                background-color: transparent;
                padding: 0;
                border-radius: 0;
            }
        }

        blockquote {
            padding: 0 1em;
            color: #6a737d;
            border-left: 0.25em solid #dfe2e5;
            margin: 0 0 16px 0;
        }

        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 16px;
            
            th, td {
                padding: 6px 13px;
                border: 1px solid #dfe2e5;
            }
            
            th {
                background-color: #f6f8fa;
                font-weight: 600;
            }
        }

        ul, ol {
            padding-left: 2em;
            margin-bottom: 16px;
        }

        li {
            margin-bottom: 4px;
        }

        img {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            margin: 8px 0;
        }

        a {
            color: #0366d6;
            text-decoration: none;
            
            &:hover {
                text-decoration: underline;
            }
        }

        hr {
            height: 0.25em;
            padding: 0;
            margin: 24px 0;
            background-color: #e1e4e8;
            border: 0;
        }
    }
}
</style> 