# OpsInputTags 组件使用说明书

## 一、组件概述

OpsInputTags 是一个基于 Ant Design Vue 的标签输入组件，支持标签的添加、编辑和删除功能。主要特点包括：
- 可编辑的标签列表
- 支持动态添加新标签
- 支持标签内容编辑
- 支持标签删除
- 支持只读模式

## 二、基础配置

### 1. 基本用法
```vue
<template>
  <ops-input-tags
    v-model:tags="tags"
    :editable="true"
  />
</template>

<script setup>
import { ref } from 'vue';

const tags = ref(['标签1', '标签2', '标签3']);
</script>
```

## 三、属性说明

### 1. 组件属性
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| tags | Array | [] | 标签数组，支持v-model |
| editable | Boolean | false | 是否可编辑 |

### 2. 事件说明
| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| update:tags | 标签更新时触发 | 更新后的标签数组 |

## 四、功能说明

### 1. 标签操作
- **添加标签**：点击虚线框的"+"按钮添加新标签
- **编辑标签**：点击已有标签进入编辑模式
- **删除标签**：点击标签右侧的关闭图标删除标签
- **保存编辑**：按回车键或失去焦点时保存编辑内容

### 2. 使用示例
```vue
<template>
  <div>
    <!-- 可编辑模式 -->
    <ops-input-tags
      v-model:tags="editableTags"
      :editable="true"
    />
    
    <!-- 只读模式 -->
    <ops-input-tags
      v-model:tags="readonlyTags"
      :editable="false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 可编辑标签
const editableTags = ref(['开发', '测试', '部署']);

// 只读标签
const readonlyTags = ref(['标签A', '标签B', '标签C']);

// 监听标签变化
watch(editableTags, (newTags) => {
  console.log('标签已更新:', newTags);
});
</script>
```

## 五、最佳实践

### 1. 基础用法
```vue
<ops-input-tags v-model:tags="tags" :editable="true" />
```

### 2. 带验证的使用
```vue
<template>
  <ops-input-tags
    v-model:tags="tags"
    :editable="true"
    @update:tags="validateTags"
  />
</template>

<script setup>
const tags = ref(['标签1']);

const validateTags = (newTags) => {
  // 验证标签内容
  const validTags = newTags.filter(tag => tag.length <= 10);
  tags.value = validTags;
};
</script>
```

### 3. 在表单中使用
```vue
<template>
  <a-form>
    <a-form-item label="标签" name="tags">
      <ops-input-tags
        v-model:tags="formData.tags"
        :editable="true"
      />
    </a-form-item>
  </a-form>
</template>

<script setup>
const formData = ref({
  tags: ['标签1', '标签2']
});
</script>
```

## 六、注意事项

1. **数据处理**
   - 标签数组中的空值会被自动过滤
   - 编辑完成后会自动去除空白标签
   - 标签值为字符串类型

2. **交互说明**
   - 点击标签进入编辑模式
   - 回车键或失焦保存编辑
   - 删除时需点击关闭图标

3. **性能考虑**
   - 避免过多的标签数量
   - 合理控制标签内容长度
   - 注意标签更新的频率

4. **常见问题**
   - 标签不可编辑：检查 editable 属性
   - 标签未更新：检查数据绑定
   - 样式问题：确认 Ant Design Vue 样式引入 