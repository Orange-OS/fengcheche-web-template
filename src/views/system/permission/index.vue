<template>
  <div class="permission-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>权限管理</span>
          <el-button type="primary" @click="showAddDialog">新增权限</el-button>
        </div>
      </template>

      <el-table :data="permissionList" style="width: 100%" max-height="940px" v-loading="loading">
        <el-table-column prop="name" label="权限名称" />
        <el-table-column prop="code" label="权限标识" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="type" label="类型">
          <template #default="{ row }">
            <el-tag :type="row.type === 1 ? 'primary' : 'success'">
              {{ row.type === 1 ? '菜单权限' : '按钮权限' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
          :total="pagination.total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchPermissionPage" @current-change="fetchPermissionPage" />
      </div>
    </el-card>

    <!-- 新增/编辑权限对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑权限' : '新增权限'" width="600px" @closed="resetForm">
      <el-form ref="permissionFormRef" :model="permissionForm" :rules="permissionRules" label-width="100px">
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permissionForm.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限标识" prop="code">
          <el-input v-model="permissionForm.code" placeholder="请输入权限标识" />
        </el-form-item>
        <el-form-item label="权限类型" prop="type">
          <el-radio-group v-model="permissionForm.type">
            <el-radio :label="1">菜单权限</el-radio>
            <el-radio :label="2">按钮权限</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="permissionForm.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="permissionForm.description" type="textarea" :rows="3" placeholder="请输入权限描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getPermissionPage,
  addPermission,
  updatePermission,
  deletePermission,
  updatePermissionStatus
} from '@/api/system/permission'

interface PermissionItem {
  id: number
  name: string
  code: string
  description: string
  type: number // 1: 菜单权限, 2: 按钮权限
  status: number // 0: 禁用, 1: 启用
}

// 数据状态
const loading = ref(false)
const permissionList = ref<PermissionItem[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)

// 分页配置
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 表单引用和表单数据
const permissionFormRef = ref<FormInstance>()
const permissionForm = reactive({
  name: '',
  code: '',
  description: '',
  type: 1,
  status: 1,
})

// 表单验证规则
const permissionRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入权限标识', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: '只能包含字母、数字和下划线',
      trigger: 'blur',
    },
  ],
  type: [{ required: true, message: '请选择权限类型', trigger: 'change' }],
})

// 生命周期钩子
onMounted(() => {
  fetchPermissionPage()
})

// 获取权限分页
const fetchPermissionPage = async () => {
  try {
    loading.value = true
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
    }
    const response: any = await getPermissionPage(params)
    permissionList.value = response.records
    pagination.total = response.total
  } catch (error) {
    console.error('获取权限分页失败:', error)
    ElMessage.error('获取权限分页失败')
  } finally {
    loading.value = false
  }
}

// 显示新增对话框
const showAddDialog = () => {
  isEdit.value = false
  currentId.value = null
  dialogVisible.value = true
}

// 显示编辑对话框
const handleEdit = (row: PermissionItem) => {
  isEdit.value = true
  currentId.value = row.id
  Object.assign(permissionForm, row)
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  try {
    await permissionFormRef.value?.validate()
    loading.value = true

    if (isEdit.value && currentId.value) {
      // 编辑权限
      await updatePermission({
        id: currentId.value,
        ...permissionForm,
      })
      ElMessage.success('权限更新成功')
    } else {
      // 新增权限
      await addPermission(permissionForm)
      ElMessage.success('权限添加成功')
    }

    dialogVisible.value = false
    fetchPermissionPage()
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    loading.value = false
  }
}

// 删除权限
const handleDelete = (row: PermissionItem) => {
  ElMessageBox.confirm(`确认删除权限 "${row.name}" 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        loading.value = true
        await deletePermission(row.id)
        ElMessage.success('删除成功')
        fetchPermissionPage()
      } catch (error) {
        console.error('删除失败:', error)
        ElMessage.error('删除失败')
      } finally {
        loading.value = false
      }
    })
    .catch(() => { })
}

// 修改权限状态
const handleStatusChange = async (row: PermissionItem) => {
  try {
    await updatePermissionStatus(row.id, row.status)
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('状态更新失败:', error)
    // 回滚状态
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('状态更新失败')
  }
}

// 重置表单
const resetForm = () => {
  permissionFormRef.value?.resetFields()
  Object.assign(permissionForm, {
    name: '',
    code: '',
    description: '',
    type: 1,
    status: 1,
  })
}
</script>

<style scoped>
.permission-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
