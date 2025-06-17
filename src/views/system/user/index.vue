<template>
  <div class="user-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="请输入用户名"
              style="width: 300px"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button @click="handleSearch">搜索</el-button>
              </template>
            </el-input>
          </div>
          <div class="operation-box">
            <el-button type="primary" @click="handleAdd">新增用户</el-button>
            <el-button type="danger" :disabled="!selectedUsers.length" @click="handleBatchDelete"
              >批量删除</el-button
            >
          </div>
        </div>
      </template>

      <el-table
        :data="userList"
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="mobile" label="手机号" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="(val) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 用户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="480px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      destroy-on-close
      class="user-dialog"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="80px"
        class="user-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="userForm.username"
            :disabled="dialogType === 'edit'"
            placeholder="请输入用户名"
          />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="userForm.nickname" placeholder="请输入昵称" />
        </el-form-item>

        <el-form-item label="密码" prop="password" v-if="dialogType === 'add'">
          <el-input
            v-model="userForm.password"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="userForm.mobile" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <div class="switch-wrapper">
            <el-switch
              v-model="userForm.status"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="禁用"
            />
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="SystemUser">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getUserList,
  addUser,
  updateUser,
  deleteUser,
  batchDeleteUsers,
  updateUserStatus,
  type UserForm,
} from '@/api/user'

const loading = ref(false)
const userList = ref<UserForm[]>([])
const searchQuery = ref('')
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const userFormRef = ref<FormInstance>()
const selectedUsers = ref<UserForm[]>([])

const userForm = ref<UserForm>({
  username: '',
  nickname: '',
  password: '',
  email: '',
  mobile: '',
  status: 1,
})

const userRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
  mobile: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
}

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true
  try {
    const data = await getUserList({
      username: searchQuery.value,
    })
    userList.value = Array.isArray(data) ? data : []
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('获取用户列表失败')
    }
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  fetchUserList()
}

// 新增用户
const handleAdd = () => {
  dialogType.value = 'add'
  userForm.value = {
    username: '',
    nickname: '',
    password: '',
    email: '',
    mobile: '',
    status: 1,
  }
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: UserForm) => {
  dialogType.value = 'edit'
  userForm.value = { ...row }
  dialogVisible.value = true
}

// 删除用户
const handleDelete = (row: UserForm) => {
  if (!row.id) return

  ElMessageBox.confirm('确认删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      fetchUserList()
    } catch (error) {
      if (error instanceof Error) {
        ElMessage.error(error.message)
      } else {
        ElMessage.error('删除失败')
      }
    }
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (!selectedUsers.value.length) return

  ElMessageBox.confirm(`确认删除选中的 ${selectedUsers.value.length} 个用户吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const userIds = selectedUsers.value
        .map((user) => user.id)
        .filter((id): id is number => id !== undefined)
      await batchDeleteUsers(userIds)
      ElMessage.success('批量删除成功')
      selectedUsers.value = []
      fetchUserList()
    } catch (error) {
      if (error instanceof Error) {
        ElMessage.error(error.message)
      } else {
        ElMessage.error('批量删除失败')
      }
    }
  })
}

// 处理状态变更
const handleStatusChange = async (row: UserForm, status: number) => {
  if (!row.id) return

  try {
    await updateUserStatus(row.id, status)
    ElMessage.success('更新状态成功')
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('更新状态失败')
    }
    row.status = status === 1 ? 0 : 1 // 恢复原状态
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!userFormRef.value) return

  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === 'add') {
          await addUser(userForm.value)
        } else if (userForm.value.id) {
          await updateUser(userForm.value.id, userForm.value)
        }

        ElMessage.success(dialogType.value === 'add' ? '新增成功' : '更新成功')
        dialogVisible.value = false
        fetchUserList()
      } catch (error) {
        if (error instanceof Error) {
          ElMessage.error(error.message)
        } else {
          ElMessage.error(dialogType.value === 'add' ? '新增失败' : '更新失败')
        }
      }
    }
  })
}

// 表格选择变化
const handleSelectionChange = (selection: UserForm[]) => {
  selectedUsers.value = selection
}

onMounted(() => {
  fetchUserList()
})
</script>

<style lang="scss" scoped>
.user-container {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .operation-box {
    display: flex;
    gap: 10px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.user-dialog) {
  .el-dialog__body {
    padding: 20px 30px;
  }

  .user-form {
    .el-form-item {
      margin-bottom: 22px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .el-input {
      width: 100%;
    }

    .switch-wrapper {
      height: 32px;
      display: flex;
      align-items: center;
    }
  }
}
</style>
