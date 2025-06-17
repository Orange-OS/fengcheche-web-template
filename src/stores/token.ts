import { defineStore } from 'pinia'
import storage from '@/utils/storage'

export const useTokenStore = defineStore('token', {
  state: () => ({
    token: storage.getItem('token') || '', // 从 localStorage 初始化 token
  }),
  actions: {
    setToken(token: string) {
      this.token = token
      storage.setItem('token', token) // 保存到 localStorage
    },
    clearToken() {
      this.token = ''
      storage.clearItem('token') // 清除 localStorage 中的 token
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token, // 判断是否已认证
  },
})
