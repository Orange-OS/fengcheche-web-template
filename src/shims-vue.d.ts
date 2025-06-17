/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 声明empty component
declare module '@/components/EmptyComponent.vue' {
  import type { DefineComponent } from 'vue'
  const EmptyComponent: DefineComponent<{}, {}, any>
  export default EmptyComponent
}

// 声明系统管理组件
declare module '@/views/system/user/index.vue' {
  import type { DefineComponent } from 'vue'
  const UserManagement: DefineComponent<{}, {}, any>
  export default UserManagement
}

declare module '@/views/system/role/index.vue' {
  import type { DefineComponent } from 'vue'
  const RoleManagement: DefineComponent<{}, {}, any>
  export default RoleManagement
}
