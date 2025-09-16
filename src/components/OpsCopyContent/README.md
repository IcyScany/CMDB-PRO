# OpsCopyContent 组件使用说明

## 组件介绍
OpsCopyContent 是一个用于内容复制的组件，支持普通文本和密码两种类型的复制功能。该组件基于 vxe-pc-ui 和 ant-design-vue 实现。

## 功能特点
- 支持普通文本复制
- 支持密码复制（带解密功能）
- 复制状态可视化反馈
- 支持自定义复制成功/失败提示
- 支持 API 方式复制密码

## 属性说明

### Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| type | String | 'text' | 复制内容类型，可选值：'text'（普通文本）或 'password'（密码） |
| content | String | '' | 需要复制的内容 |
| apiCopy | Object | {...} | API 复制配置对象，仅在 type 为 'password' 时生效 |

### apiCopy 配置项

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| copyApi | Function | '' | 复制密码时调用的 API 函数 |
| copyParams | Object | {} | 调用 API 时传递的参数 |
| copySuccessText | String | '复制成功' | 复制成功时的提示文本 |
| copySuccessDuration | Number | 2000 | 复制成功提示的显示时长（毫秒） |
| copyErrorText | String | '复制失败' | 复制失败时的提示文本 |
| copyErrorDuration | Number | 2000 | 复制失败提示的显示时长（毫秒） |

## 使用示例

### 1. 普通文本复制
```vue
<template>
  <OpsCopyContent
    type="text"
    content="这是需要复制的文本内容"
  />
</template>
```

### 2. 密码复制
```vue
<template>
  <OpsCopyContent
    type="password"
    :apiCopy="{
      copyApi: yourCopyApi,
      copyParams: { id: 1 },
      copySuccessText: '密码已复制',
      copyErrorText: '密码复制失败'
    }"
  />
</template>
```

## 注意事项
1. 密码复制功能需要提供 `copyApi` 函数，该函数应返回加密后的密码
2. 密码复制会自动进行解密处理
3. 复制操作有状态反馈，包括加载中、成功、失败等状态
4. 复制失败时会显示具体的错误信息
5. 组件会自动处理复制状态的恢复

## 依赖说明
- vxe-pc-ui
- ant-design-vue
- @/composables/encryptField（项目内部加密工具） 