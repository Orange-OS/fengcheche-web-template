// import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
// import config from '@/config/index.ts'
// import { ElMessage } from 'element-plus'
// import router from '@/router'
// import storage from '@/utils/storage'
// import { useTokenStore } from '@/stores/token'

// const NET_WORK_ERROR: string = '网络异常'

// // 创建 axios 实例
// const instance: AxiosInstance = axios.create({
//   baseURL: config.baseApi, // 后端接口基础地址
//   timeout: 15000, // 增加请求超时时间到15秒
//   // headers: {
//   //   'Content-Type': 'application/json',
//   // },
// })

// // 请求拦截器
// instance.interceptors.request.use(
//   (config: AxiosRequestConfig) => {
//     // 排除登录接口和公共接口
//     if (config.url?.includes('/login') || config.url?.includes('/public')) {
//       return config
//     }

//     const tokenStore = useTokenStore()

//     if (tokenStore.isAuthenticated) {
//       const token = storage.getItem('token')
//       config.headers!['Authorization'] = `Bearer ${token}`
//     } else {
//       router.push('/login')
//     }
//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   },
// )

// // 响应拦截器
// instance.interceptors.response.use(
//   (response: AxiosResponse) => {
//     // 可以在这里统一处理响应数据，如解析 data
//     const { code, data, msg } = response.data
//     if (code === 200) {
//       console.log('响应拦截器', data)
//       return data
//     } else if (code === 40001) {
//       ElMessage.error(msg)
//       setTimeout(() => {
//         router.push('/login')
//       }, 1500)
//       return Promise.reject(msg)
//     } else {
//       ElMessage.error(msg || NET_WORK_ERROR)
//       return Promise.reject(msg || NET_WORK_ERROR)
//     }
//   },
//   (error) => {
//     // 处理网络错误
//     console.error('网络请求错误:', error)
//     if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
//       ElMessage.error('请求超时，请检查网络连接')
//     } else if (error.response) {
//       // 服务器返回错误状态码
//       const status = error.response.status
//       if (status === 401) {
//         ElMessage.error('登录已过期，请重新登录')
//         setTimeout(() => {
//           router.push('/login')
//         }, 1500)
//       } else if (status === 404) {
//         ElMessage.error('请求的资源不存在')
//       } else {
//         ElMessage.error('服务器错误，请稍后再试')
//       }
//     } else {
//       // 其他错误
//       ElMessage.error(NET_WORK_ERROR)
//     }
//     return Promise.reject(error)
//   },
// )

// function request(options) {
//   options.method = options.method || 'get'
//   if (options.method.toLowerCase() === 'get') {
//     options.params = options.data
//   }
//   if (typeof options.mock != 'undefined') {
//     config.mock = options.mock
//   }
//   if (config.env === 'prod') {
//     instance.defaults.baseURL = config.baseApi
//   } else {
//     instance.defaults.baseURL = config.mock ? config.mockApi : config.baseApi
//   }
//   return instance(options)
// }

// // TODO
// ;['get', 'post', 'put', 'delete', 'patch'].forEach((item) => {
//   request[item] = (url, data, options) => {
//     return request({
//       url,
//       data,
//       method: item,
//       ...options,
//     })
//   }
// })

// // 导出封装好的实例
// export default request
