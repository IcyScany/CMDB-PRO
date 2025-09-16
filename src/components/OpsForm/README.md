# OpsFormItem 组件使用说明书

## 一、组件概述

OpsFormItem 是一个基于 Ant Design Vue 的高级表单项组件，支持多种输入类型和数据源配置。主要特点包括：
- 支持多种表单控件类型
- 灵活的数据源配置
- 自动的权限控制
- 丰富的提示信息
- 支持自定义验证

## 二、基础配置

### 1. 基本用法
```vue
<template>
  <ops-form-item
    :title="fieldConfig"
    v-model:value="formData.field"
    :disabled="false"
  />
</template>

<script setup>
const formData = ref({
  field: ''
});

const fieldConfig = {
  field: 'username',
  field_name: '用户名',
  field_explain: '请输入用户名',
  edit_change: true,
  page_data_source: {
    form_type: 'input'
  }
};
</script>
```

## 三、属性说明

### 1. 必需属性
| 属性名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| title | Object | 字段配置对象 | `{ field: 'name', field_name: '名称' }` |
| value | Any | 表单项的值 | `'test'` 或 `[]` |

### 2. 可选属性
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| disabled | Boolean | undefined | 是否禁用 |
| options | Array/Object | [] | 选项数据 |
| titleData | Array/Object | [] | 下拉选项数据 |

### 3. title 对象配置
| 字段名 | 说明 | 类型 | 示例 |
|--------|------|------|------|
| field | 字段名 | String | 'username' |
| field_name | 显示名称 | String | '用户名' |
| field_explain | 提示说明 | String | '请输入用户名' |
| edit_change | 是否可编辑 | Boolean | true |
| page_data_source | 数据源配置 | Object | 见下方说明 |

### 4. page_data_source 配置
```javascript
{
  form_type: 'select', // 表单类型
  data_source: 'url', // 数据源类型
  url: '/api/options', // 数据源地址
  multiple: true, // 是否多选
  tooltip_text: '提示信息', // 提示文本
  form_label: '自定义标签', // 自定义标签文本
  tooltip_level: { // 警告提示配置
    type: 'warning',
    message: '警告信息',
    description: '详细说明'
  }
}
```

## 四、支持的表单类型

### 1. 基础类型
- input: 文本输入框
- textarea: 多行文本框
- password: 密码输入框
- number: 数字输入框
- checkbox: 复选框组
- radio: 单选框组
- switch: 开关
- color: 颜色选择器

### 2. 高级类型
- select: 下拉选择框（支持单选/多选）
- custom-option: 自定义选项
- json: JSON编辑器
- two_dimensional_array: 二维数组编辑器

## 五、数据源类型

### 1. URL 数据源
```javascript
{
  data_source: 'url',
  url: '/api/options',
  label: 'name',
  value: 'id'
}
```

### 2. 自定义数据源
```javascript
{
  data_source: 'data',
  data: {
    '1': '选项1',
    '2': '选项2'
  }
}
```

### 3. 用户自定义数据源
```javascript
{
  data_source: 'user_custom',
  multiple: false
}
```

## 六、使用示例

### 1. 基础文本输入
```vue
<ops-form-item
  :title="{
    field: 'name',
    field_name: '名称',
    field_explain: '请输入名称',
    page_data_source: {
      form_type: 'input'
    }
  }"
  v-model:value="formData.name"
/>
```

### 2. 下拉选择框
```vue
<ops-form-item
  :title="{
    field: 'status',
    field_name: '状态',
    page_data_source: {
      form_type: 'select',
      data_source: 'data',
      data: {
        1: '启用',
        0: '禁用'
      }
    }
  }"
  v-model:value="formData.status"
/>
```

### 3. 带验证的密码输入
```vue
<ops-form-item
  :title="{
    field: 'password',
    field_name: '密码',
    field_explain: '请输入密码',
    page_data_source: {
      form_type: 'password',
      tooltip_text: '密码长度至少6位'
    }
  }"
  v-model:value="formData.password"
  @blur="validatePassword"
/>
```

## 七、注意事项

1. **数据源配置**
   - URL数据源需要正确配置接口地址
   - 自定义数据源需要符合指定格式
   - 注意处理数据加载状态

2. **表单验证**
   - 可以通过 Form 组件的 rules 配置验证规则
   - 支持自定义验证函数
   - 注意处理异步验证场景

3. **权限控制**
   - edit_change 属性控制编辑权限
   - disabled 属性优先级高于 edit_change
   - 注意表单不同状态下的权限控制

4. **常见问题**
   - 数据源未加载：检查 URL 配置
   - 值未更新：检查 v-model 绑定
   - 样式异常：检查样式引入
   - 提示不显示：检查 tooltip 配置 