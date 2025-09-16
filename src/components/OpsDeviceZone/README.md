# OpsDeviceZone 设备区域组件使用说明

## 组件介绍
OpsDeviceZone 是一个用于输入和管理设备区域信息的复合组件，支持设备位置、楼层、区域和机柜层的结构化输入。该组件基于 ant-design-vue 和 vxe-pc-ui 实现，提供直观的界面来构建设备区域标识符。

## 功能特点
- 支持设备区域信息的结构化输入
- 自动格式化输出（如：四川路-2F-弱电间-3U）
- 智能宽度分配（有/无复制按钮时自动调整）
- 一键复制完整区域信息
- 支持位置选择框的搜索和清空功能
- 数字输入框限制范围（1-99）
- 响应式数据同步

## 数据结构
组件处理的数据格式为：`位置-楼层F-区域-机柜层U`

### 示例
- `四川路-2F-弱电间-3U`
- `北京机房-1F-主控室-1U`
- `上海数据中心-5F-网络间-2U`

## 属性说明

### Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| initValue | String | '' | 初始值，用于初始化组件状态 |
| value | String | '' | 当前值，支持双向绑定 |
| disabled | Boolean | false | 是否禁用整个组件 |
| name | String | '' | 表单字段名称 |
| options | Array/Object | [] | 位置选择框的选项数据 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| update:value | (value: String) | 值变化时触发，用于双向绑定 |

## 使用示例

### 1. 基础使用
```vue
<template>
  <ops-device-zone
    :options="locationOptions"
    :name="'deviceZone'"
    :value="deviceZone"
    @update:value="handleZoneChange"
  />
</template>

<script setup>
import { ref } from 'vue';

const deviceZone = ref('四川路-2F-弱电间-3U');

const locationOptions = [
  { label: '四川路', value: '四川路' },
  { label: '北京机房', value: '北京机房' },
  { label: '上海数据中心', value: '上海数据中心' }
];

const handleZoneChange = (value) => {
  console.log('设备区域变化:', value);
  deviceZone.value = value;
};
</script>
```

### 2. 在表单中使用
```vue
<template>
  <a-form :model="formData">
    <a-form-item label="设备区域" name="deviceZone">
      <ops-device-zone
        :options="locationOptions"
        :name="'deviceZone'"
        :value="formData.deviceZone"
        @update:value="val => formData.deviceZone = val"
      />
    </a-form-item>
  </a-form>
</template>

<script setup>
import { reactive } from 'vue';

const formData = reactive({
  deviceZone: ''
});

const locationOptions = [
  { label: '四川路', value: '四川路' },
  { label: '北京机房', value: '北京机房' }
];
</script>
```

### 3. 只读模式
```vue
<template>
  <ops-device-zone
    :options="locationOptions"
    :value="deviceZone"
    :disabled="true"
  />
</template>
```

## 组件结构

### 输入字段说明
1. **位置选择框**：下拉选择设备所在位置
   - 支持搜索功能
   - 支持清空操作
   - 清空时会同时清空其他字段

2. **楼层输入框**：数字输入框，输入楼层号
   - 范围限制：1-99
   - 自动添加"F"后缀

3. **区域输入框**：文本输入框，输入具体区域名称
   - 如：弱电间、主控室、网络间等

4. **机柜层输入框**：数字输入框，输入机柜层号
   - 范围限制：1-99
   - 自动添加"U"后缀

5. **复制按钮**：一键复制完整区域信息
   - 仅在有内容时显示
   - 复制成功显示提示信息

## 样式特性

### 宽度分配
- **有复制按钮时**：
  - 位置选择框：40%
  - 楼层输入框：10%
  - 区域输入框：15%
  - 机柜层输入框：10%
  - 复制按钮：1%
  - 分隔符和标签：剩余空间

- **无复制按钮时**：
  - 位置选择框：45%
  - 楼层输入框：12%
  - 区域输入框：18%
  - 机柜层输入框：12%
  - 分隔符和标签：剩余空间

### 布局特性
- 使用 flex 布局确保各元素对齐
- 数字输入框内容居中对齐
- 紧凑型输入组样式

## 注意事项

1. **数据格式**：组件会自动处理数据格式，确保输出符合 `位置-楼层F-区域-机柜层U` 的格式
2. **必填字段**：只有位置字段是必填的，其他字段可以为空
3. **清空操作**：清空位置选择框会同时清空所有其他字段
4. **数字限制**：楼层和机柜层输入框限制在 1-99 范围内
5. **复制功能**：只有在有内容时才会显示复制按钮
6. **响应式更新**：组件会监听 `initValue` 和 `value` 的变化并自动更新

## 依赖说明
- ant-design-vue
- vxe-pc-ui
- Vue 3 Composition API

## 最佳实践

1. **选项数据格式**：确保 `options` 数据格式为 `{ label: '显示文本', value: '实际值' }`
2. **表单验证**：建议在父组件中添加表单验证逻辑
3. **数据同步**：使用 `v-model` 或 `@update:value` 确保数据双向绑定
4. **错误处理**：在复制功能失败时提供用户友好的错误提示 