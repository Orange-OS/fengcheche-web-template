import { defineStore } from 'pinia'
import type { MenuItem } from '@/types/menu'
import { getMenuList } from '@/api/auth'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menuList: [] as MenuItem[],
    hasFetched: false
  }),
  actions: {
    async fetchMenuList() {
      if (this.hasFetched) return
      try {
        const data = await getMenuList()
        this.menuList = data
        this.hasFetched = true
      } catch (error) {
        console.error('获取菜单数据失败:', error)
        // 在这里可以添加一些错误处理逻辑
        // 例如，重置状态或显示错误消息
        this.menuList = []
        this.hasFetched = false
        // 重新抛出错误，以便路由守卫可以捕获它
        throw error
      }
    },
    clearMenuList() {
      this.menuList = []
      this.hasFetched = false
    }
  }
})
