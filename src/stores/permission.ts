import { defineStore } from 'pinia'
import storage from '@/utils/storage'
import type { PermissionItem } from '@/types/permission'

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    permissionList: storage.getItem('permissionList') || []
  }),
  actions: {
    setPermissionList(permissionList: PermissionItem[]): void {
      this.permissionList = permissionList
      storage.setItem('permissionList', permissionList) // 保存到 localStorage
    },
  },
})
