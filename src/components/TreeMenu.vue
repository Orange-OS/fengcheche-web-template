<template>
  <template v-for="menu in menuList" :key="menu.id">
    <!-- 目录渲染 -->
    <el-sub-menu
      v-if="menu.visible === 1 && menu.status === 1 && (menu.menuType === 'M' || (menu.children && menu.children.length > 0))"
      :index="menu.path">
      <template #title>
        <el-icon v-if="menu.icon">
          <component :is="menu.icon" />
        </el-icon>
        <span>{{ menu.name }}</span>
      </template>
      <!-- 递归渲染子菜单 -->
      <tree-menu :menuList="menu.children" />
    </el-sub-menu>

    <!-- 菜单项渲染 -->
    <el-menu-item v-else-if="menu.visible === 1 && menu.status === 1" :index="menu.path" @click="handleMenuClick(menu)">
      <el-icon v-if="menu.icon">
        <component :is="menu.icon" />
      </el-icon>
      <span>{{ menu.name }}</span>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/types/menu'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleMenuClick = (item) => {
  console.log('所有路由:', router.getRoutes())
  console.log('点击菜单项:', item)
  // 确保路径以 / 开头
  const path = item.path.startsWith('/') ? item.path : `/${item.path}`
  console.log('跳转路径:', path)

  // 检查路由是否存在
  const route = router.getRoutes().find((r) => r.path === path)

  console.log('找到的路由:', route)

  router.push(path)
}

// 定义 props
defineProps<{
  menuList: MenuItem[]
}>()
</script>
