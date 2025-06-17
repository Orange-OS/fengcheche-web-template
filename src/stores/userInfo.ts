import { defineStore } from 'pinia'
import storage from '@/utils/storage'

export const useUserInfoStore = defineStore('user', {
  state: () => ({
    userInfo: {
      username: '',
    },
    permissions: [] as string[],
  }),
  actions: {
    // 存储用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      storage.setItem('userInfo', userInfo)

      if (userInfo && userInfo.permissions) {
        this.permissions = userInfo.permissions
      }
    },
    // 清除用户信息
    clearUserInfo() {
      this.userInfo = { username: '' } // 重置为初始状态
      this.permissions = [] // 清空权限
      storage.clearItem('userInfo') // 移除本地存储中的用户信息
    }
  },
})
