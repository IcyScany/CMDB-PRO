# Title分组功能实现

## 功能概述

Title分组功能允许管理员对系统中的title进行分组管理，包括创建、编辑、删除分组，以及将title添加到分组或从分组中移除。UI设计参考了BusinessAuthorization.vue的布局和交互效果。

## 实现的功能

### 1. 分组管理
- **获取所有分组**: `GET /v3/manage/title/group/list`
- **新增分组**: `POST /v3/manage/title/group/add`
- **编辑分组**: `PUT /v3/manage/title/group/edit/{group_id}`
- **删除分组**: `DELETE /v3/manage/title/group/del/{group_id}`

### 2. Title管理
- **获取所有title**: `GET /v3/manage/title/list`
- **获取分组中的title**: `GET /v3/manage/title/group/{group_id}/titles`
- **添加title到分组**: `POST /v3/manage/title/group/mapping`
- **从分组移除title**: `DELETE /v3/manage/title/group/mapping`

## UI界面特性

### 1. 分组选择区域
- 使用单选按钮组显示所有分组
- 分组名称和描述显示
- 分组管理按钮（新增、编辑、删除）
- 空状态提示

### 2. Title选择区域
- 全选复选框
- 网格布局显示所有title
- 每个title显示为卡片样式
- 支持多选
- 空状态提示

### 3. 提交功能
- 固定位置的提交按钮
- 加载状态显示
- 成功提示

### 4. 特别提醒
删除分组时会显示特别提醒：
> "确定要删除分组"xxx"吗？删除后，会同步删除所有权限关联数据，请谨慎操作！"

## 技术实现

### 文件结构
```
src/
├── api/backend/
│   ├── groupApi.js          # 分组相关API
│   └── titleApi.js          # Title相关API
├── views/backend/group/
│   └── TitleGroup.vue       # Title分组管理页面
└── router/backend/
    └── index.js             # 路由配置
```

### 主要组件
- **TitleGroup.vue**: 主要的UI组件，包含所有分组管理功能
- **groupApi.js**: 分组相关的API接口
- **titleApi.js**: Title相关的API接口

### 状态管理
- `groups`: 所有分组列表
- `selectedGroup`: 当前选中的分组
- `groupTitles`: 当前分组中的title列表
- `allTitles`: 所有可用的title列表
- `diffGroupPermission`: 当前选中的title权限
- `checkboxAllState`: 全选状态

### 交互逻辑
1. **分组切换**: 选择分组时自动加载该分组下的title
2. **权限勾选**: 支持单个和批量勾选title
3. **全选功能**: 支持全选/取消全选
4. **提交保存**: 将选中的title添加到当前分组

### 错误处理
- API调用失败时显示错误提示
- 表单验证（分组名称必填）
- 加载状态显示

## 路由配置

访问路径: `/backend/manage/title/group/page`

## 使用说明

1. **创建分组**: 点击"新增分组"按钮，填写分组名称和描述
2. **选择分组**: 从单选按钮组中选择要管理的分组
3. **选择title**: 在网格中选择要添加的title（支持多选）
4. **提交保存**: 点击右下角的"Submit"按钮保存更改
5. **编辑分组**: 选中分组后点击"编辑分组"按钮
6. **删除分组**: 选中分组后点击"删除分组"按钮（需要确认）

## 注意事项

1. 删除分组会同步删除所有权限关联数据，请谨慎操作
2. 所有操作都有相应的成功/失败提示
3. 如果后端API不存在，会使用模拟数据进行演示
4. UI设计参考了BusinessAuthorization.vue的布局风格

## API接口说明

### 分组相关接口
```javascript
// 获取所有分组
getGroupList() {
    return http.get(`${urlPrefix}list`);
}

// 新增分组
addGroup(data) {
    return http.post(`${urlPrefix}add`, data);
}

// 编辑分组
editGroup(group_id, data) {
    return http.put(`${urlPrefix}edit/${group_id}`, data);
}

// 删除分组
deleteGroup(group_id) {
    return http.delete(`${urlPrefix}del/${group_id}`);
}

// 获取分组下的title
getTitlesByGroupId(group_id) {
    return http.get(`${urlPrefix}${group_id}/titles`);
}

// 添加title到分组
addTitleToGroup(data) {
    return http.post(`${urlPrefix}mapping`, data);
}

// 从分组移除title
removeTitlesFromGroup(data) {
    return http.delete(`${urlPrefix}mapping`, { data });
}
```

### Title相关接口
```javascript
// 获取所有title
getAllTitles() {
    return http.get(`${urlPrefix}list`);
}
```

## UI设计特点

1. **参考BusinessAuthorization.vue**: 采用相同的布局结构和交互模式
2. **分组选择**: 使用单选按钮组，每个分组显示为卡片样式
3. **Title网格**: 使用CSS Grid布局，响应式显示
4. **交互反馈**: 悬停效果、选中状态、加载状态
5. **固定提交按钮**: 右下角固定位置的提交按钮
6. **空状态处理**: 当没有数据时显示友好的空状态提示 