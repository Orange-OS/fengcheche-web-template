import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import storage from '@/utils/storage.ts'
import { ElMessage } from 'element-plus'
// 引入公共样式
import '@/assets/scss/index.scss'
import '@/assets/styles/global.css'   // 引入全局样式
// 引入中文语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const pinia = createPinia()
const app = createApp(App)

const appTitle = import.meta.env.VITE_APP_TITLE || 'fengcheche-app-template'
if (appTitle) {
  document.title = appTitle
}

// 开发环境下添加更多的调试信息
if (import.meta.env.DEV) {
  console.info('运行在开发环境')
  console.info('环境变量:', import.meta.env)

  // 添加全局错误处理
  window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error)
    if (
      event.error &&
      event.error.message &&
      event.error.message.includes('Failed to fetch dynamically imported module')
    ) {
      console.error('组件动态导入失败，请检查路由配置和网络连接')
      // 显示友好的错误提示
      ElMessage.error({
        message: '页面加载失败，请刷新页面或联系管理员',
        duration: 5000,
        showClose: true,
      })
    }
  })

  // 添加未处理的Promise拒绝处理
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason)
    // 防止控制台出现红色错误
    event.preventDefault()
  })
}

// 挂载全局属性或方法
// app.config.globalProperties.$request = request()
app.config.globalProperties.$storage = storage

app.use(pinia)
app.use(router)
app.use(ElementPlus, {locale:zhCn})
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
