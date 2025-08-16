<script setup lang="ts">
import { ref, computed } from 'vue'
import { getCurrentInstance } from 'vue'
import { logout } from '@/api/auth'
import TreeMenu from '@/components/TreeMenu.vue'
import BreadCrumb from '@/components/BreadCrumb.vue'
// 导入折叠图标
import { Fold, User } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useTokenStore } from '@/stores/token'
import { useMenuStore } from '@/stores/menu'
import { useUserInfoStore } from '@/stores/userInfo'

const router = useRouter()

const instance = getCurrentInstance()
const storage = instance.appContext.config.globalProperties.$storage

const isCollapse = ref(false)

// 用户信息
const userInfo = ref(storage.getItem('userInfo'))

const userInfoStore = useUserInfoStore()
const tokenStore = useTokenStore()
const menuStore = useMenuStore()

// 从 store 获取菜单列表
const menuList = computed(() => menuStore.menuList)
const activeMenu = ref(instance?.proxy?.$route.path)

// 添加折叠切换函数
const toggle = () => {
  isCollapse.value = !isCollapse.value
}

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 调用退出登录接口
    await logout()

    // 清除本地 Token
    tokenStore.clearToken()

    // 清除菜单
    menuStore.clearMenuList()

    // 清除用户信息
    userInfoStore.clearUserInfo()

    // 跳转到登录页
    router.push('/login')

    ElMessage.success('退出成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('退出失败')
      console.error('退出登录失败:', error)
    }
  }
}
</script>

<template>
  <div class="basic-layout">
    <div class="nav-side" :style="{ width: isCollapse ? '64px' : '200px' }">
      <!-- 系统 Logo -->
      <div class="logo">
        <!-- TODO -->
        <!-- <img src="@/assets/images/logo.png" alt="logo" /> -->
        <span v-show="!isCollapse">通用后台管理系统</span>
      </div>
      <!-- 系统菜单 -->
      <el-menu :default-active="activeMenu" background-color="#001529" text-color="#fff" class="nav-menu">
        <tree-menu :menuList="menuList"></tree-menu>
      </el-menu>
    </div>
    <div :class="['content-right', isCollapse ? 'fold' : 'unfold']">
      <div class="nav-top">
        <div class="nav-left">
          <div class="menu-fold" @click="toggle">
            <el-icon>
              <Fold />
            </el-icon>
          </div>
          <div class="bread">
            <BreadCrumb />
          </div>
        </div>
        <div class="nav-right">
          <el-dropdown>
            <div class="user-avatar">
              <el-avatar :src="userInfo.avatar" :icon="User" size="small" />
              <span class="username">{{ userInfo.nickname }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="wrapper">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.basic-layout {
  position: relative; // 绝对定位

  .nav-side {
    position: fixed; // 固定定位
    width: 200px;
    height: 100vh; // 计算属性
    background-color: #001529;
    color: #fff;
    overflow-y: auto; // 滚动条
    transition: width 0.5s; // 过渡

    .logo {
      display: flex;
      align-items: center;
      padding: 10px;

      span {
        transition: opacity 0.3s; // 添加文字过渡效果
      }
    }
  }

  .content-right {
    margin-left: 200px;
    transition: margin-left 0.3s; // 添加过渡效果

    &.fold {
      margin-left: 64px;
    }

    .nav-top {
      height: 50px;
      line-height: 50px;
      display: flex;
      justify-content: space-between; // 两端对齐
      border-bottom: 1px solid #ddd;
      padding: 0 20px;

      .nav-left {
        .menu-fold {
          width: 10px;
          height: 10px;
          display: inline-block;
          cursor: pointer;

          &:hover {
            color: #409eff;
          }
        }

        .bread {
          display: inline-block;
          padding-left: 10px;
        }
      }

      .nav-right {
        display: flex;
        align-items: center;

        .user-avatar {
          display: flex;
          align-items: center;
          cursor: pointer;

          .username {
            margin-left: 8px;
          }
        }
      }
    }

    .wrapper {
      background-color: #eef0f3;
      padding: 20px;
      height: calc(100vh - 2px - 90px);
    }
  }
}
</style>
