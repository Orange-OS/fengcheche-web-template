import { createRouter, createWebHistory, type Router, type RouteRecordRaw } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { useTokenStore } from '@/stores/token'
import type { MenuItem } from '@/types/menu'

// 动态导入所有视图组件
const modules = import.meta.glob('@/views/**/*.vue')

// 添加错误页面路由
const errorRoutes = [
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: '403 禁止访问',
      hidden: true,
    },
  },
  // 添加 404 页面路由
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '404 页面不存在',
      hidden: true,
    },
  },
]

// 初始路由配置
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/homePage/HomePage.vue'),
      meta: {
        title: '首页',
      },
      redirect: '/welcome',
      children: [
        {
          path: '/welcome',
          name: 'welcome',
          component: () => import('@/views/WelcomePage.vue'),
          meta: {
            title: '欢迎页',
          },
        },
        // {
        //   path: '/system/role',
        //   name: 'role',
        //   component: () => import('@/views/system/role/index.vue'),
        //   meta: {
        //     title: '角色管理',
        //   },
        // },
        // {
        //   path: '/system/permission',
        //   name: 'permission',
        //   component: () => import('@/views/system/permission/index.vue'),
        //   meta: {
        //     title: '权限管理',
        //   },
        // },
        // {
        //   path: '/system/user',
        //   name: 'user',
        //   component: () => import('@/views/system/user/index.vue'),
        //   meta: {
        //     title: '用户管理',
        //   },
        // },
        // {
        //   path: '/system/menu',
        //   name: 'menu',
        //   component: () => import('@/views/system/menu/index.vue'),
        //   meta: {
        //     title: '菜单管理',
        //   },
        // },
        // {
        //   path: '/life/medicationRecord',
        //   name: 'medicationRecord',
        //   component: () => import('@/views/life/medicationRecord/index.vue'),
        //   meta: {
        //     title: '用药记录',
        //   },
        // },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginPage.vue'),
      meta: {
        title: '登录',
      },
    },
    // {
    //   path: '/map/test',
    //   name: 'test',
    //   component: () => import('@/views/dashboard/map/index.vue'),
    //   meta: {
    //     title: '地图测试',
    //   },
    // },
    // {
    //   path: '/music',
    //   name: 'music',
    //   component: () => import('@/views/dashboard/music/index.vue'),
    //   meta: {
    //     title: '音乐',
    //   },
    // },
    ...errorRoutes, // 添加错误页面路由
    // 通配符路由，必须放在最后 (This will be added dynamically later)
    // {
    //   path: '/:pathMatch(.*)*',
    //   redirect: '/404',
    // },
  ],
})

// 递归生成路由
function generateRoutes(menuList: MenuItem[]): RouteRecordRaw[] {
  const routes: RouteRecordRaw[] = []
  menuList.forEach((item) => {
    if (item.menuType === 'C' && item.path && item.status === 1) {
      console.log('可用的模块：', Object.keys(modules))
      console.log('组件地址：', item.component)

      // 确保路径以 / 开头
      const path = item.path.startsWith('/') ? item.path : `/${item.path}`

      const route = {
        path: path,
        name: item.name,
        component: modules[`/src/views/${item.component}.vue`],
        meta: {
          title: item.name
        }
      }
      console.log('生成的路由配置:', route)
      routes.push(route)
    }
    if (item.children && item.children.length > 0) {
      routes.push(...generateRoutes(item.children))
    }
  })
  return routes
}

let hasAddedWildcardRoute = false

// 加载动态路由
async function loadDynamicRoutes(routerInstance: Router) {
  const menuStore = useMenuStore()
  try {
    await menuStore.fetchMenuList()
    const dynamicRoutes = generateRoutes(menuStore.menuList)
    const homeRoute = routerInstance.getRoutes().find((route: RouteRecordRaw) => route.name === 'home')
    if (homeRoute) {
      dynamicRoutes.forEach((route) => {
        if (route.path.startsWith('/dashboard')) {
          // 直接添加为顶级路由，与 home 同级
          routerInstance.addRoute(route)
        } else {
          // 添加为 home 的子路由
          routerInstance.addRoute('home', route)
        }
      })
    }

    // Add the wildcard route only after dynamic routes have been added
    if (!hasAddedWildcardRoute) {
      routerInstance.addRoute({
        path: '/:pathMatch(.*)*',
        redirect: '/404',
      })
      hasAddedWildcardRoute = true
    }
  } catch (error) {
    console.error('加载动态路由失败:', error)
    // 如果加载失败，可以考虑重定向到登录页或错误页
    const tokenStore = useTokenStore()
    tokenStore.clearToken()
    await routerInstance.push('/login')
  }
}

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const tokenStore = useTokenStore()
  const menuStore = useMenuStore()

  if (tokenStore.isAuthenticated) {
    if (to.path === '/login') {
      next('/') // 如果已认证，访问登录页则重定向到首页
    } else {
      if (!menuStore.hasFetched) {
        try {
          await loadDynamicRoutes(router)
          // 确保动态路由添加完毕后，重新导航
          next({ ...to, replace: true })
        } catch (error) {
          console.error('路由守卫中加载动态路由失败:', error)
          next('/login') // 加载失败，重定向到登录页
        }
      } else {
        next()
      }
    }
  } else {
    if (to.path !== '/login') {
      next('/login') // 未认证且访问非登录页，重定向到登录页
    } else {
      next() // 未认证，访问登录页，放行
    }
  }
})

export default router
