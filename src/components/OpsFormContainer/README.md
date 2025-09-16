# OpsFormContainer 组件使用说明书

## 一、组件概述

OpsFormContainer 是一个基于 Ant Design Vue 的表单容器组件，支持 Modal 和 Drawer 两种展示方式，用于承载表单内容的展示和编辑。

### 主要特点
- 支持 Modal 和 Drawer 两种展示模式
- 灵活的插槽系统
- 统一的关闭处理
- 自定义样式配置
- 响应式布局

## 二、基础配置

### 1. 基本用法
```vue
<template>
  <ops-form-container
    v-model:open="visible"
    title="编辑信息"
    @close="handleClose"
  >
    <template #default>
      <!-- 表单内容 -->
      <a-form :model="formData">
        <a-form-item label="名称">
          <a-input v-model:value="formData.name" />
        </a-form-item>
      </a-form>
    </template>
    
    <template #footer>
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" @click="handleSubmit">确定</a-button>
    </template>
  </ops-form-container>
</template>

<script setup>
import { ref } from 'vue';

const visible = ref(false);
const formData = ref({
  name: ''
});

const handleClose = () => {
  visible.value = false;
};
</script>
```

## 三、属性说明

### 1. 基础属性
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| open | Boolean | false | 是否显示容器 |
| formStyle | String | 'drawer' | 容器类型，可选值：'modal'/'drawer' |
| title | String | - | 标题文本 |
| width | [String, Number] | '60%' | 容器宽度（drawer 模式下） |

### 2. Modal 模式特有属性
所有 Ant Design Vue 的 Modal 组件属性都可以通过 v-bind="$attrs" 传入。

### 3. Drawer 模式特有属性
| 属性名 | 说明 | 类型 | 默认值 |
|--------|------|------|--------|
| placement | 抽屉方向 | String | 'right' |
| closable | 是否显示关闭按钮 | Boolean | true |
| footerStyle | 底部样式 | Object | { textAlign: 'right' } |

## 四、事件说明

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| close | 容器关闭时触发 | - |
| cancel | 点击取消按钮时触发 | - |

## 五、插槽说明

### 1. 默认插槽
用于放置主要内容，通常是表单组件。

### 2. 页脚插槽
```vue
<template #footer>
  <!-- 自定义页脚内容 -->
</template>
```

### 3. 标题插槽
```vue
<template #title>
  <!-- 自定义标题内容 -->
</template>
```

## 六、使用示例

### 1. Modal 模式
```vue
<template>
  <ops-form-container
    v-model:open="visible"
    form-style="modal"
    title="编辑用户"
    :width="500"
    @close="handleClose"
  >
    <a-form :model="formData">
      <!-- 表单内容 -->
    </a-form>
    
    <template #footer>
      <a-space>
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="primary" @click="handleSubmit">确定</a-button>
      </a-space>
    </template>
  </ops-form-container>
</template>
```

### 2. Drawer 模式
```vue
<template>
  <ops-form-container
    v-model:open="visible"
    form-style="drawer"
    title="详细信息"
    width="80%"
    @close="handleClose"
  >
    <a-descriptions bordered>
      <!-- 描述列表内容 -->
    </a-descriptions>
    
    <template #footer>
      <a-button type="primary" @click="handleClose">
        关闭
      </a-button>
    </template>
  </ops-form-container>
</template>
```

## 七、最佳实践

### 1. 表单编辑场景
```vue
<template>
  <ops-form-container
    v-model:open="visible"
    :form-style="isMobile ? 'drawer' : 'modal'"
    :title="isEdit ? '编辑' : '新增'"
    @close="handleClose"
  >
    <a-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      @finish="handleSubmit"
    >
      <!-- 表单内容 -->
    </a-form>

    <template #footer>
      <a-space>
        <a-button @click="handleClose">取消</a-button>
        <a-button type="primary" @click="formRef.submit()">
          提交
        </a-button>
      </a-space>
    </template>
  </ops-form-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useWindowSize } from '@vueuse/core';

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);
</script>
```

## 八、注意事项

1. **样式处理**
   - Drawer 模式下默认宽度为 60%
   - 可以通过 style 和 class 自定义样式
   - 注意端适配

2. **事件处理**
   - 统一使用 close 事件处理关闭逻辑
   - 自定义页脚时注意保持交互一致性

3. **性能优化**
   - 合理使用 v-if 控制内容渲染
   - 大型表单建议使用 Drawer 模式

4. **常见问题**
   - 弹窗未居中：检查父容器定位
   - 内容溢出：检查 height 和 overflow 配置
   - 关闭事件未触发：检查事件绑定 