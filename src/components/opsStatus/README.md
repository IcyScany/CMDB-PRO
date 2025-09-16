# OpsStatus 组件

这是一个通用的状态标签组件，用于展示不同状态的标签，支持状态值的自定义转换。

## 功能特点

-   支持多种数据类型的状态值（Boolean、String、Number）
-   可自定义激活状态的值
-   支持状态值的转换规则
-   自动根据状态切换主题样式（主题色/错误色）

## Props

| 参数名        | 类型                  | 默认值 | 说明           |
| ------------- | --------------------- | ------ | -------------- |
| value         | Boolean/String/Number | null   | 状态值         |
| activeValue   | Boolean/String/Number | true   | 激活状态的值   |
| transformRule | Object                | null   | 状态值转换规则 |

## 使用示例

```vue
<!-- 基础用法 -->
<ops-status :value="true" />

<!-- 自定义激活值 -->
<ops-status :value="1" :active-value="1" />

<!-- 使用转换规则 -->
<ops-status
    :value="status"
    :transform-rule="{
        '1': '正常',
        '0': '异常',
    }"
/>
```

## 转换规则说明

通过 `transformRule` 可以将状态值映射为更易读的文本：

```javascript
// 示例转换规则
const transformRule = {
    true: "启用",
    false: "禁用",
    1: "正常",
    0: "异常",
};
```

## 样式说明

-   当 `value` 等于 `activeValue` 时，显示主题色（theme--primary）
-   当 `value` 不等于 `activeValue` 时，显示错误色（theme--error）

## 注意事项

1. 转换规则对象的键需要是字符串类型
2. 如果状态值在转换规则中未找到对应的映射，将显示原始值
