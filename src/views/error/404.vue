<template>
  <div class="not-found">
    <h1>404 - 页面不存在</h1>
    <p>抱歉，您访问的页面不存在或已被移除。</p>
    <el-button type="primary" @click="goBack">返回首页</el-button>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

defineOptions({
  name: 'NotFoundPage',
})

const router = useRouter()

// 返回首页
const goBack = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.not-found {
  text-align: center;
  padding: 50px 20px;

  h1 {
    font-size: 32px;
    color: #409eff;
    margin-bottom: 20px;
  }

  p {
    font-size: 16px;
    color: #606266;
    margin-bottom: 30px;
  }
}

.debug-section {
  margin-top: 50px;
  padding: 20px;
  border-top: 1px dashed #dcdfe6;
  text-align: left;

  h2 {
    font-size: 18px;
    margin-bottom: 15px;
    color: #606266;
  }
}

.path-tester {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.test-result {
  margin-top: 15px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;

  pre {
    white-space: pre-wrap;
    word-break: break-word;
  }
}
</style>
