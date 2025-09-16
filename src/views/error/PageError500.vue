<script setup>

</script>

<template>
  <div class="page-container">
    <a-result
      title="500"
      status="500"
      sub-title="抱歉，服务器反馈异常!"
    >
      <template #extra>
        <a-button
          type="primary"
          @click="$router.push({ path: '/' })"
        >
          返回首页
        </a-button>
      </template>
    </a-result>
  </div>
</template>



<style lang="less" scoped>
.page-container {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  position: absolute;
  margin-top: -38px;
  width: 100%;
  height: 100%;
}
</style>
