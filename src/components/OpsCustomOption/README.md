# OpsCustomOption 组件使用说明书

## 一、组件概述

OpsCustomOption 是一个基于 Ant Design Vue 的自定义选项组件，支持选项的动态添加、编辑和删除功能。主要用于需要用户自定义选项内容的场景。

### 主要特点
- 支持选项的动态添加
- 支持选项的实时编辑
- 支持选项的删除
- 带有描述信息
- 实时保存到服务器

## 二、基础配置

### 1. 基本用法
```vue
<template>
  <ops-custom-option
    v-model:value="selectedValue"
    :title="fieldConfig"
    :options="optionList"
    @updateCustomOption="handleOptionUpdate"
  />
</template>

<script setup>
import { ref } from 'vue';

const selectedValue = ref('');
const fieldConfig = {
  sid: 'field_001', // 字段标识
  field_name: '自定义选项' // 字段名称
};

const optionList = ref([
  { 
    value: '1',
    label: '选项1',
    describe: '选项1的描述'
  }
]);

const handleOptionUpdate = (newOptions) => {
  // 处理选项更新
  optionList.value = newOptions;
};
</script>
```

## 三、属性说明

### 1. 必需属性
| 属性名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| title | Object | 字段配置对象 | `{ sid: 'field_001' }` |
| options | Array | 选项列表 | `[{ value: '1', label: '选项1' }]` |

### 2. 选项对象结构
```javascript
{
  value: String,     // 选项值
  label: String,     // 选项显示文本
  describe: String,  // 选项描述
  editing: Boolean   // 是否处于编辑状态
}
```

### 3. 继承属性
组件继承了 Ant Design Vue 的 Select 组件的所有属性。

## 四、事件说明

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| updateCustomOption | 选项更新时触发 | newOptions: Array |
| dropdown-visible-change | 下拉框显示状态改变时触发 | visible: Boolean |

## 五、功能说明

### 1. 选项管理
- **添加选项**：在下拉框底部填写名称和描述，点击"新建选项"
- **编辑选项**：点击选项右侧的编辑图标
- **删除选项**：点击选项右侧的删除图标
- **保存编辑**：点击编辑状态下的确认图标
- **取消编辑**：点击编辑状态下的取消图标

### 2. 使用示例
```vue
<template>
  <a-form-item label="自定义选项">
    <ops-custom-option
      v-model:value="formData.option"
      :title="{
        sid: 'custom_field',
        field_name: '自定义选项'
      }"
      :options="optionList"
      placeholder="请选择或创建选项"
      @updateCustomOption="handleOptionUpdate"
    />
  </a-form-item>
</template>

<script setup>
import { ref } from 'vue';

const formData = ref({
  option: ''
});

const optionList = ref([
  {
    value: 'opt1',
    label: '选项1',
    describe: '这是选项1的描述'
  }
]);

const handleOptionUpdate = (newOptions) => {
  optionList.value = newOptions;
};
</script>
```

## 六、最佳实践

### 1. 表单中使用
```vue
<template>
  <a-form :model="formData">
    <ops-custom-option
      v-model:value="formData.category"
      :title="fieldConfig"
      :options="categoryOptions"
      :disabled="readonly"
      @updateCustomOption="updateCategories"
    />
  </a-form>
</template>

<script setup>
const fieldConfig = {
  sid: 'category_field',
  field_name: '分类',
  field_explain: '请选择或创建新分类'
};

// 处理选项更新
const updateCategories = async (newOptions) => {
  await saveOptionsToServer(newOptions);
  await refreshOptionList();
};
</script>
```

## 七、注意事项

1. **数据处理**
   - 选项的唯一标识使用 value 字段
   - 编辑状态下注意数据同步
   - 及时处理服务器响应

2. **交互说明**
   - 新增选项需要填写名称
   - 编辑时支持修改名称和描述
   - 删除操作需要后端配合

3. **性能优化**
   - 避免过多的选项数量
   - 合理使用防抖处理
   - 控制请求频率

4. **常见问题**
   - 选项未更新：检查事件绑定
   - 编辑未生效：检查 sid 配置
   - 样式异常：检查 CSS 引入
   - 保存失败：检查网络请求 