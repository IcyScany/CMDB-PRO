# OpsASelect 组件使用说明书

## 一、组件概述

OpsASelect 是一个基于 Ant Design Vue 的增强型选择器组件，在原有 Select 组件的基础上增加了更多实用功能。主要用于需要搜索、多选、自动清理等场景。

### 主要特点
- 支持模糊搜索
- 自动清理搜索值
- 多种分隔符支持
- 自定义弹出容器
- 灵活的插槽系统

## 二、基础配置

### 1. 基本用法
```vue
<template>
  <ops-a-select
    v-model:value="selectedValue"
    :options="options"
    placeholder="请选择"
  >
    <template #option="{ value, label }">
      {{ label }}
    </template>
  </ops-a-select>
</template>

<script setup>
import { ref } from 'vue';

const selectedValue = ref('');
const options = [
  { value: '1', label: '选项1' },
  { value: '2', label: '选项2' }
];
</script>
```

## 三、属性说明

### 1. 组件属性
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| popupContainer | Object | null | 弹出层容器 |
| value/v-model | Any | - | 选中值 |
| options | Array | [] | 选项数据 |

### 2. 继承的 Select 属性
组件默认开启以下功能：
- allow-clear: 允许清除
- auto-clear-search-value: 自动清除搜索值
- show-search: 显示搜索框
- option-filter-prop: "label"

### 3. 分隔符配置
默认支持的分隔符：
- 英文逗号 (,)
- 中文逗号 (，)
- 空格 ( )

## 四、事件说明

组件继承了 Ant Design Vue Select 组件的所有事件，并对搜索功能进行了增强。

### 1. 搜索过滤
```javascript
// 内置的过滤函数
const filterData = (inputValue, option) => {
  return option.label
    ? option.label.toLowerCase().indexOf(inputValue.trim().toLowerCase()) >= 0
    : true;
};
```

## 五、插槽使用

### 1. 选项插槽
```vue
<template>
  <ops-a-select v-model:value="value">
    <template #option="{ value, label }">
      <span>{{ label }}</span>
      <a-tag>{{ value }}</a-tag>
    </template>
  </ops-a-select>
</template>
```

### 2. 自定义渲染
```vue
<template>
  <ops-a-select>
    <template #default="{ value, label }">
      <a-space>
        <a-icon type="user" />
        <span>{{ label }}</span>
      </a-space>
    </template>
  </ops-a-select>
</template>
```

## 六、使用示例

### 1. 基础单选
```vue
<template>
  <ops-a-select
    v-model:value="selected"
    :options="options"
    placeholder="请选择用户"
    style="width: 200px"
  />
</template>

<script setup>
const selected = ref('');
const options = [
  { value: 'user1', label: '用户1' },
  { value: 'user2', label: '用户2' }
];
</script>
```

### 2. 多选模式
```vue
<template>
  <ops-a-select
    v-model:value="selected"
    mode="multiple"
    :options="options"
    placeholder="请选择标签"
    style="width: 100%"
  />
</template>
```

### 3. 自定义弹出容器
```vue
<template>
  <div ref="containerRef">
    <ops-a-select
      v-model:value="value"
      :popup-container="containerRef"
      :options="options"
    />
  </div>
</template>

<script setup>
const containerRef = ref(null);
</script>
```

## 七、最佳实践

### 1. 搜索优化
```vue
<template>
  <ops-a-select
    v-model:value="value"
    :options="options"
    :filter-option="customFilter"
    placeholder="输入关键字搜索"
  />
</template>

<script setup>
const customFilter = (input, option) => {
  return option.label.toLowerCase().includes(input.toLowerCase().trim())
    || option.value.toLowerCase().includes(input.toLowerCase().trim());
};
</script>
```

### 2. 动态加载选项
```vue
<template>
  <ops-a-select
    v-model:value="value"
    :options="options"
    :loading="loading"
    @search="handleSearch"
  />
</template>

<script setup>
const loading = ref(false);
const options = ref([]);

const handleSearch = debounce(async (value) => {
  if (!value) return;
  loading.value = true;
  try {
    const res = await fetchOptions(value);
    options.value = res;
  } finally {
    loading.value = false;
  }
}, 300);
</script>
```

## 八、注意事项

1. **性能优化**
   - 合理使用 filter-option
   - 大数据量时考虑虚拟滚动
   - 避免频繁更新 options

2. **样式处理**
   - 可以通过 class 和 style 自定义样式
   - 注意弹出层的层级设置
   - 自定义容器时注意定位问题

3. **数据处理**
   - 确保 options 格式正确
   - 处理好空值情况
   - 注意数据同步问题

4. **常见问题**
   - 搜索不生效：检查 filter-option 配置
   - 弹出层位置异常：检查 popupContainer
   - 值未更新：检查 v-model 绑定 