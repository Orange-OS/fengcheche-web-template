export interface LoginResponse {
  token: string
  userInfo: {
    username: string
    // 添加权限字段
    permissions?: string[]
    // 其他用户信息字段
  }
}
