# opsSubPage 组件使用文档

## 功能概述

-   提供带标签页的表单容器
-   支持基础信息展示和自定义标签页
-   内置编辑按钮和显隐控制
-   支持异步数据加载
-   支持描述列表和自定义内容展示

## Props 配置

| 属性名      | 类型    | 默认值       | 说明                                |
| ----------- | ------- | ------------ | ----------------------------------- |
| open        | Boolean | false        | 控制组件显示/隐藏                   |
| sid         | Number  | 0            | 数据 ID，用于调用 API 时传入        |
| title       | String  | ''           | 弹窗标题                            |
| basicConfig | Object  | {show: true} | 基础信息配置，包含 show/columns/api |
| customTabs  | Array   | []           | 自定义标签页配置                    |
| showEdit    | Boolean | true         | 是否显示底部编辑按钮                |

### basicConfig 配置项

| 属性名  | 类型     | 默认值     | 说明                                               |
| ------- | -------- | ---------- | -------------------------------------------------- |
| show    | Boolean  | true       | 是否显示基础信息标签页                             |
| columns | Array    | []         | 列配置（格式：[{title: '列名', field: '字段名'}]） |
| api     | Function | () => {}   | 获取基础数据的异步方法（需返回 Promise）           |
| key     | String   | 'basic'    | 标签页的唯一标识（可选）                           |
| title   | String   | '基础信息' | 标签页标题（可选）                                 |

### customTabs 配置项

| 属性名      | 类型    | 说明                                           |
| ----------- | ------- | ---------------------------------------------- |
| key         | String  | 标签页的唯一标识                               |
| title       | String  | 标签页标题                                     |
| isCustomTab | Boolean | 是否使用自定义内容而不是描述列表（默认 false） |
| columns     | Array   | 使用描述列表时的列配置                         |
| data        | Object  | 使用描述列表时的数据对象                       |

## 插槽使用

### 基础信息插槽

```vue
<template #[field]="{ row }">
    <!-- 自定义字段渲染 -->
    <!-- row: 当前行数据 -->
</template>
```

### 自定义标签页插槽

```vue
<!-- 使用描述列表时 -->
<template #[`${tabKey}-${field}`]="{ row }">
    <!-- 自定义字段渲染 -->
    <!-- row: 当前行数据 -->
</template>

<!-- 完全自定义内容时 -->
<template #[tabKey]>
    <!-- 自定义标签页内容 -->
</template>
```

## 事件说明

-   `update:open`: 弹窗状态变更事件
-   `clickEdit`: 点击编辑按钮时触发

## 使用示例

```vue
<ops-sub-page
    v-model:open="showDetail"
    :sid="currentId"
    title="设备详情"
    :basic-config="{
        columns: columns,
        api: fetchDeviceDetail,
    }"
    :custom-tabs="[
        {
            key: 'history',
            title: '维护记录',
            isCustomTab: true,
        },
        {
            key: 'logs',
            title: '操作日志',
            columns: logColumns,
            data: logData,
        },
    ]"
    @click-edit="handleEdit"
>
    <!-- 基础信息自定义字段 -->
    <template #status="{ row }">
        <status-tag :status="row.status" />
    </template>

    <!-- 完全自定义的标签页 -->
    <template #history>
        <maintenance-history />
    </template>

    <!-- 使用描述列表的标签页自定义字段 -->
    <template #logs-operator="{ row }">
        <user-avatar :user="row.operator" />
    </template>
</ops-sub-page>
```

## 注意事项

1. `basicConfig.api` 需要返回 Promise 对象
2. 所有标签页默认使用描述列表展示，如需自定义内容，设置 `isCustomTab: true`
3. 基础信息的插槽名为字段名，其他标签页的插槽名需要加上 `${tabKey}-` 前缀
4. 描述列表会自动过滤掉 field 为 'operation' 的列
5. 弹窗打开时会自动切换到第一个可用的标签页
