<script setup lang="ts">
import { User, Lock } from '@element-plus/icons-vue'
import { ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { login, getCaptcha } from '@/api/auth'
import router from '@/router'
import { useUserInfoStore } from '@/stores/userInfo'
import { useTokenStore } from '@/stores/token'
import { ElMessage } from 'element-plus'

const tokenStore = useTokenStore()
const userInfoStore = useUserInfoStore()

const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = ref({
  username: '',
  password: '',
  captcha: '',
  captchaUuid: ''
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ],
}

const captchaSrc = ref()
const fetchCaptcha = async () => {
  try {
    const res = await getCaptcha()
    captchaSrc.value = res.captchaBase64Image
    formData.value.captchaUuid = res.captchaUuid
  } catch (error: Error | unknown) {
    console.log('error', error)
  } finally {

  }
}
fetchCaptcha()

const handleLogin = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    // 1. 登录获取 token
    const { token, userInfo } = await login(formData.value)

    // 2. 保存用户信息
    tokenStore.setToken(token)
    userInfoStore.setUserInfo(userInfo)

    // 3. 跳转到首页
    ElMessage.success('登录成功')
    await router.push('/')
  } catch (error: Error | unknown) {
    console.log('error', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-div">
      <div class="login-div-header">
        <h2 class="login-title">登录</h2>
      </div>
      <el-form ref="formRef" :model="formData" :rules="rules" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" :prefix-icon="User" size="large" />
        </el-form-item>

        <el-form-item prop="password">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" show-password :prefix-icon="Lock"
            size="large" />
        </el-form-item>

        <el-form-item prop="captcha">
          <div class="captcha-wrapper">
            <el-input v-model="formData.captcha" placeholder="请输入验证码" size="large" />
            <img :src="captchaSrc" alt="验证码" class="captcha-img" @click="fetchCaptcha" />
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-button" @click="handleLogin">
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss">
.login-container {
  display: flex;
  justify-content: center; // 水平居中
  align-items: center; // 垂直居中
  height: 100vh;
  background-image: url('@/assets/images/login.png');
  background-size: cover; // 背景图片覆盖整个容器
  background-position: center; // 背景图片居中
  background-repeat: no-repeat; // 不重复

  .login-div {
    width: 450px;
    // height: auto; // 高度自适应内容
    background-color: #ffffff;
    border-radius: 8px; // 添加圆角
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); // 添加阴影
    padding: 40px; // 增加内边距
    box-sizing: border-box;

    .login-div-header {
      margin-bottom: 24px; // 增加标题和表单之间的间距

      .login-title {
        text-align: center; // 确保文本水平居中
        font-size: 24px; // 调整字体大小
        color: #333;
      }
    }

    .login-form {
      .el-form-item {
        margin-bottom: 20px; // 调整表单项之间的间距
      }

      .el-input {
        width: 100%; // 让输入框宽度充满父容器
      }

      .captcha-wrapper {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;

        .el-input {
          flex: 1;
        }

        .captcha-img {
          width: 120px;
          height: 40px;
          cursor: pointer;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
        }
      }

      .login-button {
        width: 100%; // 让按钮宽度充满父容器
        height: 40px; // 调整按钮高度
        font-size: 16px; // 调整按钮文字大小
      }
    }
  }
}
</style>
