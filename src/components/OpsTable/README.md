# OpsTable 组件使用说明书

## 一、组件概述

OpsTable 是一个基于 vxe-table 封装的客户端表格组件，专注于前端数据处理场景。主要特点包括：
- 全表搜索功能
- 本地数据排序
- 自定义列配置
- 分页功能
- 权限控制
- 数据刷新机制

## 二、基础配置

### 1. 安装和引入
```javascript
// 在 main.js 中注册组件
import OpsTable from '@/components/OpsTable';
app.component('ops-table', OpsTable);
```

### 2. 基本用法
```vue
<template>
  <ops-table
    ref="tableRef"
    :data="tableData"
    :columns="columns"
    :auth-btn="authConfig"
    :default-order="{ field: 'create_time', order: 'desc' }"
    @user-edit="handleEdit"
  />
</template>

<script setup>
const tableRef = ref(null);
const tableData = ref([]);

// 列配置
const columns = [
  { field: 'name', title: '名称' },
  { field: 'status', title: '状态' },
  { 
    field: 'create_time', 
    title: '创建时间',
    sortable: true 
  }
];

// 权限配置
const authConfig = {
  add: { page_display: true },
  edit: { page_display: true },
  del: { page_display: true }
};
</script>
```

## 三、属性说明

### 1. 必需属性
| 属性名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| data | Array | 表格数据源 | `[{id: 1, name: 'test'}]` |
| columns | Array | 列配置 | `[{field: 'name', title: '名称'}]` |

### 2. 可选属性
| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| authBtn | Object | {} | 按钮权限配置 |
| loading | Boolean | false | 加载状态 |
| requestConfig | Object | {} | 请求配置 |
| defaultOrder | Object | {} | 默认排序配置 |
| isShowDoc | Boolean | false | 是否显示文档按钮 |

### 3. 高级配置
| 属性名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| columnsConfig | Object | 列批量配置 | `{width: 100}` |
| toolbarConfig | Object | 工具栏配置 | `{refresh: true}` |
| treeConfig | Object | 树结构配置 | `{children: 'items'}` |

## 四、事件说明

### 1. 数据操作事件
| 事件名 | 说明 | 回调参数 | 使用场景 |
|--------|------|----------|----------|
| select | 选择事件 | selection | 多选操作 |
| update:data | 数据更新 | newData | 数据变化监听 |
| update:fullData | 完整数据更新 | Array | 全量数据更新 |

### 2. 用户操作事件
| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| userEdit | 编辑按钮点击 | {type, row} |
| userAdd | 新增按钮点击 | - |
| userDel | 删除按钮点击 | row |

## 五、插槽使用

### 1. 工具栏插槽
```vue
<ops-table>
  <template #other_toolbar_buttons>
    <vxe-button content="自定义按钮" @click="handleCustom" />
  </template>
</ops-table>
```

### 2. 列内容插槽
```vue
<ops-table>
  <template #customColumn="{ row }">
    <span :class="row.status ? 'success' : 'error'">
      {{ row.statusText }}
    </span>
  </template>
</ops-table>
```

## 六、方法调用

### 1. 表格实例方法
```javascript
// 获取表格实例
const tableRef = ref(null);

// 刷新数据
const refreshData = () => {
  tableRef.value?.commitRequest();
};

// 获取选中行
const getSelection = () => {
  return tableRef.value?.getDom().getCheckboxRecords();
};
```

## 七、最佳实践

### 1. 性能优化
- 控制数据量在1000条以内
- 使用 computed 处理派生数据
- 合理使用 loading 状态

### 2. 代码示例
```vue
<template>
  <ops-table
    ref="tableRef"
    v-model:data="tableData"
    :columns="columns"
    :loading="loading"
    :auth-btn="authConfig"
    :default-order="defaultOrder"
    @user-edit="handleEdit"
    @select="handleSelect"
  >
    <!-- 自定义工具栏 -->
    <template #other_toolbar_buttons>
      <vxe-button 
        content="导出" 
        icon="vxe-icon-download" 
        @click="handleExport" 
      />
    </template>

    <!-- 自定义状态列 -->
    <template #status="{ row }">
      <a-tag :color="row.status ? 'success' : 'error'">
        {{ row.statusText }}
      </a-tag>
    </template>
  </ops-table>
</template>

<script setup>
import { ref, computed } from 'vue';

// 表格实例
const tableRef = ref(null);

// 表格数据
const tableData = ref([]);
const loading = ref(false);

// 列配置
const columns = [
  { field: 'name', title: '名称', sortable: true },
  { field: 'status', title: '状态', slots: { default: 'status' } },
  { field: 'create_time', title: '创建时间', sortable: true }
];

// 默认排序
const defaultOrder = {
  field: 'create_time',
  order: 'desc'
};

// 权限配置
const authConfig = {
  add: { page_display: true },
  edit: { page_display: true },
  del: { page_display: true }
};

// 处理编辑
const handleEdit = ({ type, row }) => {
  console.log('编辑行:', row);
};

// 处理选择
const handleSelect = (selection) => {
  console.log('选中:', selection);
};

// 导出数据
const handleExport = () => {
  const selection = tableRef.value?.getDom().getCheckboxRecords();
  // 处理导出逻辑
};
</script>
```

## 八、注意事项

1. **数据处理**
   - 所有数据处理在客户端完成
   - 保持数据源不被污染
   - 使用深拷贝处理复杂数据

2. **性能考虑**
   - 适用于小型数据集
   - 全表搜索已做防抖处理
   - 避免频繁更新数据源

3. **自定义配置**
   - 列配置支持本地存储
   - 可自定义工具栏按钮
   - 灵活的插槽系统

4. **常见问题**
   - 数据更新后视图未更新：检查数据引用
   - 排序不生效：确认 sortable 配置
   - 权限按钮不显示：检查 authBtn 配置 