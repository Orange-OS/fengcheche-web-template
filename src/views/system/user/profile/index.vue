<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
              <el-button type="primary" link @click="handleEdit">编辑</el-button>
            </div>
          </template>
          <div class="profile-info">
            <div class="avatar-container">
              <el-avatar :size="100" :src="userInfo.avatar" />
            </div>
            <div class="info-list">
              <div class="info-item">
                <span class="label">用户名：</span>
                <span>{{ userInfo.username }}</span>
              </div>
              <div class="info-item">
                <span class="label">昵称：</span>
                <span>{{ userInfo.nickname }}</span>
              </div>
              <div class="info-item">
                <span class="label">邮箱：</span>
                <span>{{ userInfo.email }}</span>
              </div>
              <div class="info-item">
                <span class="label">手机：</span>
                <span>{{ userInfo.phone }}</span>
              </div>
              <div class="info-item">
                <span class="label">部门：</span>
                <span>{{ userInfo.department }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :timestamp="activity.timestamp"
              :type="activity.type"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface UserInfo {
  username: string
  nickname: string
  email: string
  phone: string
  department: string
  avatar: string
}

interface Activity {
  timestamp: string
  content: string
  type?: '' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const userInfo = ref<UserInfo>({
  username: 'admin',
  nickname: '管理员',
  email: 'admin@example.com',
  phone: '13800138000',
  department: '技术部',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
})

const activities = ref<Activity[]>([
  {
    timestamp: '2024-03-29 12:00:00',
    content: '登录系统',
    type: 'primary',
  },
  {
    timestamp: '2024-03-29 10:30:00',
    content: '更新个人信息',
    type: 'success',
  },
  {
    timestamp: '2024-03-29 09:00:00',
    content: '查看系统日志',
    type: 'info',
  },
])

const handleEdit = () => {
  // 实现编辑个人信息逻辑
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-info {
  text-align: center;
}

.avatar-container {
  margin-bottom: 20px;
}

.info-list {
  text-align: left;
}

.info-item {
  margin-bottom: 10px;
  line-height: 24px;
}

.info-item .label {
  color: #606266;
  margin-right: 10px;
}
</style>
