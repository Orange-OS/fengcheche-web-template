/**
 * 环境配置封装
 */

const env = import.meta.env.MODE || 'production'
const EnvConfig = {
  development: {
    baseApi: '/api',
    mockApi: 'https://mock.presstime.cn/mock/677fd2eb690301591ff41add/example',
  },
  test: {
    baseApi: 'http://127.0.0.1:8090/',
    mockApi: 'https://mock.presstime.cn/mock/677fd2eb690301591ff41add/example',
  },
  production: {
    baseApi: 'http://127.0.0.1:8090/',
    mockApi: 'https://mock.presstime.cn/mock/677fd2eb690301591ff41add/example',
  },
}
export default {
  env,
  mock: false,
  namespace: 'FengCheChe', // storage 的命名空间
  ...EnvConfig[env],
}
