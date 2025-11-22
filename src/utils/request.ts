import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import storage from '@/utils/storage'
import { useTokenStore } from '@/stores/token'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // 从环境变量获取基础URL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 排除登录接口
    if (config.url?.includes('/login')) {
      return config
    }

    const tokenStore = useTokenStore()

    if (tokenStore.isAuthenticated) {
      const token = storage.getItem('token')
      config.headers!['Authorization'] = `Bearer ${token}`
    } else {
      router.push('/login')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, msg, data } = response.data

    // 根据自己的业务逻辑修改这里的判断条件
    if (code === 200) {
      return Promise.resolve(data);
    } else if (code === 400) {
      ElMessage.warning(msg || '系统警告')
      return Promise.reject(new Error(msg || '系统警告'))
    } else if (code === 500) {
      ElMessage.error(msg || '系统错误')
      return Promise.reject(new Error(msg || '系统错误'))
    } else {
      ElMessage.info(msg || '未知编码')
      return Promise.reject(new Error(msg || '未知编码'))
    }
  },
  (error) => {
    let message = ''
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '未授权，请重新登录'
          // 可以在这里处理登录过期的逻辑
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求错误，未找到该资源'
          break
        case 500:
          message = '服务器错误'
          break
        default:
          message = error.response.data.msg || '系统错误'
      }
    } else {
      message = error.message || '网络错误'
    }
    ElMessage.error(message)
    return Promise.reject(error)
  },
)

// 封装请求方法
const request = <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return service(config) as unknown as Promise<T>
}

export default request
