<template>
  <div class="forbidden-container">
    <div class="forbidden-content">
      <h1 class="error-code">403</h1>
      <div class="error-desc">抱歉，您没有访问该页面的权限</div>
      <el-button type="primary" @click="goBack">返回上一页</el-button>
      <el-button @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.forbidden-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.forbidden-content {
  text-align: center;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.error-code {
  font-size: 120px;
  color: #f56c6c;
  margin: 0;
  line-height: 1.2;
}

.error-desc {
  font-size: 20px;
  color: #606266;
  margin: 20px 0 30px;
}

.el-button {
  margin: 0 10px;
}
</style>
