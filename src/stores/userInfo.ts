import storage from '@/utils/storage'
import { defineStore } from 'pinia'

export interface UserInfo {
  id: number | null
  username: string
  avatar: string
}

// 创建store实例，用于在state初始化时使用
const createUserInfoStore = () => {
  const savedUserInfo = storage.getItem('userInfo')
  return {
    id: savedUserInfo?.id || null,
    username: savedUserInfo?.username || '',
    avatar: savedUserInfo?.avatar || ''
  }
}

export const useUserInfoStore = defineStore('user', {
  state: () => ({
    userInfo: createUserInfoStore() as UserInfo,  // 使用 localStorage 中的数据初始化
  }),
  actions: {
    // 存储用户信息
    setUserInfo(data: UserInfo) {
      this.userInfo = {
        ...data
      }
      storage.setItem('userInfo', data)
    },
    // 清除用户信息
    clearUserInfo() {
      // 重置为初始状态
      this.userInfo = {
        id: null,
        username: '',
        avatar: ''
      }
      storage.clearItem('userInfo') // 移除本地存储中的用户信息
    }
  },
})
