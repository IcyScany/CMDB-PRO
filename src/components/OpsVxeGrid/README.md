# OpsVxeGrid 组件使用说明

## ServerTable（服务器端）表格组件

### 组件介绍
ServerTable 是一个基于 vxe-table 封装的服务器端表格组件，集成了分页、排序、搜索等功能。

### 属性说明
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| tableColumn | Array | [] | 表格列配置 |
| authBtn | Object | {} | 按钮权限配置 |
| data | Array | [] | 表格数据 |
| order | Object | {} | 排序配置 |
| queryApi | Function/Promise | - | 数据查询接口 |
| switchClickStatusConfig | Object | {} | 开关点击配置 |
| defaultSearchField | Object | {} | 默认搜索字段配置 |

### 事件说明
| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| userEdit | 编辑按钮点击事件 | {type, row} |
| userAdd | 新增按钮点击事件 | - |
| userDel | 删除按钮点击事件 | {row} |
| getData | 获取数据事件 | - |
| refreashData | 刷新数据事件 | - |

### 使用示例
vue
```vue
<server-table
ref="serverTableRef"
:table-column="initTableColumns"
:auth-btn="canUserAction"
:order="tableOrder"
:query-api="yourQueryApi"
:default-search-field="defaultSearchField"
@user-edit="handleUserEdit"
@user-add="handleUserAdd">
// 自定义列插槽
<template #customColumn="{row}">自定义内容</template>
</server-table>
```





## ServerTableSearch 搜索组件

### 组件介绍
ServerTableSearch 是一个高级搜索组件，支持字段选择、条件筛选、多值搜索等功能。具有智能匹配、标签管理、快捷操作等特性。

### 属性说明
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| columns | Array | [] | 可搜索的字段列表 |
| defaultSearchField | Object | {} | 默认搜索字段配置 |

### defaultSearchField 配置说明
javascript

```json
{
fields: [ // 默认搜索字段列表
{
field: 'fieldName', // 字段名
operator: 'vague', // 操作符
validate: (value) => boolean // 验证函数
}
],
placeholder: '自定义提示文本' // 搜索框提示文本
}
```

### 使用示例
javascript

```javascript
// 默认搜索字段配置示例
const defaultSearchField = computed(() => ({
fields: [
{
field: 'server_ip',
operator: 'vague',
validate: (value) => /^(\d{1,3}\.){0,3}\d{1,3}$/.test(value)
},
{
field: 'server_hostname',
operator: 'vague',
validate: (value) => !isServerIp(value)
}
],
placeholder: '直接输入支持IP、主机名'
}));
```



### 搜索功能说明
1. **基础搜索**
   - 选择字段 -> 选择操作符 -> 输入值 -> 回车或点击应用

2. **智能匹配搜索**
   - 直接输入内容，系统会根据 defaultSearchField 配置自动匹配相应字段
   - 支持多个搜索条件组合（使用 AND 连接）

3. **多值搜索**
   - 选择 "in(包含)" 操作符时，可输入多个值（用逗号分隔）

4. **搜索标签**
   - 可以点击标签中的操作符进行修改
   - 点击标签右侧的关闭图标可删除该条件

5. **快捷操作**
   - 支持键盘操作（回车确认，退格删除）
   - 提供清空按钮快速清除所有条件

### 注意事项
1. defaultSearchField 配置中的 validate 函数用于验证输入内容是否匹配该字段
2. 每个字段可以配置不同的操作符和验证规则
3. placeholder 支持自定义，用于提示用户可用的快捷搜索功能
