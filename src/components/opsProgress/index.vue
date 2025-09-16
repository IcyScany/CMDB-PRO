<script setup>
defineProps({
    percentage: {
        type: [Number, String],
        default: 0,
    },
    decimals: {
        type: Number,
        default: 2
    },
    style: {
        type: Object,
        default: () => ({})
    }
});
</script>

<template>
  <div class="progress-container" :style="style">
    <div class="progress-bar" :style="{ width: `${percentage * 100 || 0}%` }"></div>
    <div class="progress-text">{{ (percentage * 100 || 0).toFixed(decimals) }}%</div>
  </div>
</template>

<style scoped>
.progress-container {
  width: 80px;
  height: 20px;
  background-color: #e7e7e7;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: rgb(45, 206, 137);
  transition: width 0.3s ease;
  position: absolute;
  left: 0;
  top: 0;
}

.progress-text {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 12px;
  font-weight: 500;
  z-index: 1;
  /* 防止文字被选中 */
  user-select: none;
}
</style>