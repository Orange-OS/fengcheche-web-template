<script setup lang="ts"></script>

<template>
  <div class="welcome-page">
    <div class="content">
      <div class="title">通用后台管理系统</div>
      <div class="sub-title">欢迎体验</div>
      <div class="desc">Vue3 + Vite + Element Plus + TypeScript + Pinia + Axios + Echarts</div>
    </div>
    <!-- <div class="image"></div> -->
  </div>
</template>

<style lang="scss">
.welcome-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #ffffff;
  .content {
    position: relative;
    bottom: 100px;
    .title {
      font-size: 40px;
      line-height: 62px;
      color: #409eff;
    }
    .sub-title {
      font-size: 30px;
      line-height: 40px;
      color: #333;
    }
    .desc {
      text-align: right;
      font-size: 16px;
      color: #999;
    }
  }
  .image {
    width: 1000px;
    height: 1000px;
    margin-left: 105px;
    background-image: url('@/assets/images/welcome.png');
  }
}
</style>
