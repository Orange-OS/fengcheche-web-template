<template>
  <div class="role-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleAdd">新增角色</el-button>
        </div>
      </template>

      <el-table :data="roleList" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="code" label="角色编码" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" />
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handlePermission(row)">权限</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize" :total="total"
          :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 新增/编辑角色对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @closed="handleDialogClosed">
      <el-form ref="roleFormRef" :model="roleForm" :rules="roleRules" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="角色状态" prop="status">
          <el-radio-group v-model="roleForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="roleForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="roleForm.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权限设置对话框 -->
    <el-dialog v-model="permissionDialogVisible" title="权限设置" width="700px">
      <el-tree ref="permissionTreeRef" :data="permissionTreeData" show-checkbox node-key="id" :props="treeProps"
        :default-expand-all="true" />
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePermission">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
import {
  getRoleList,
  getRolePage,
  addRole,
  updateRole,
  deleteRole
} from '@/api/system/role'

interface RoleItem {
  id: number
  name: string
  code: string
  description: string
  status: number
  sort: number
}

interface PermissionItem {
  id: number
  name: string
  code: string
  parentId: number
  children?: PermissionItem[]
}

// 表格数据
const loading = ref(false)
const roleList = ref<RoleItem[]>([])
const total = ref(0)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
})

// 表单相关
const dialogVisible = ref(false)
const dialogTitle = ref('')
const roleFormRef = ref<FormInstance>()
const roleForm = reactive({
  id: undefined as number | undefined,
  name: '',
  code: '',
  description: '',
  status: 1,
  sort: 0,
})

const roleRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 权限相关
const permissionDialogVisible = ref(false)
const permissionTreeRef = ref()
const permissionTreeData = ref<PermissionItem[]>([])
const treeProps = {
  label: 'name',
  children: 'children'
}
const currentRoleId = ref<number>()

// 获取角色分页
const fetchRolePage = async () => {
  try {
    loading.value = true
    // API 调用
    const response = await getRolePage(queryParams)
    roleList.value = response.records
    total.value = response.total
  } catch (error) {
    console.error('获取角色分页失败:', error)
    ElMessage.error('获取角色分页失败')
  } finally {
    loading.value = false
  }
}

// 获取权限树
const getPermissionTree = async () => {
  try {
    // 这里替换为实际的API调用
    // const res = await getPermissionTreeApi()
    // 模拟数据
    const mockData = [
      {
        id: 1,
        name: '系统管理',
        code: 'system',
        parentId: 0,
        children: [
          {
            id: 11,
            name: '用户管理',
            code: 'system:user',
            parentId: 1
          },
          {
            id: 12,
            name: '角色管理',
            code: 'system:role',
            parentId: 1
          }
        ]
      },
      {
        id: 2,
        name: '业务管理',
        code: 'business',
        parentId: 0,
        children: [
          {
            id: 21,
            name: '订单管理',
            code: 'business:order',
            parentId: 2
          }
        ]
      }
    ]
    permissionTreeData.value = mockData
  } catch (error) {
    console.error('获取权限树失败:', error)
    ElMessage.error('获取权限树失败')
  }
}

// 分页相关
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  fetchRolePage()
}

const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val
  fetchRolePage()
}

// 新增角色
const handleAdd = () => {
  dialogTitle.value = '新增角色'
  dialogVisible.value = true
}

// 编辑角色
const handleEdit = (row: RoleItem) => {
  dialogTitle.value = '编辑角色'
  Object.assign(roleForm, row)
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  try {
    await roleFormRef.value?.validate(async (valid) => {
      if (valid) {
        loading.value = true
        let response;
        if (roleForm.id) {
          // 编辑：调用更新 API，传递 id
          response = await updateRole(roleForm);
        } else {
          // 创建：不传递 id，后端自动生成
          const { id, ...createData } = roleForm; // 剔除 id
          response = await addRole(createData);
        }
        ElMessage.success(roleForm.id ? '修改成功' : '添加成功')
        dialogVisible.value = false
        fetchRolePage()
      }
    })
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    loading.value = false
  }
}

// 删除角色
const handleDelete = (row: RoleItem) => {
  ElMessageBox.confirm('确认删除该角色吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      loading.value = true
      // 调用删除 API
      const response = await deleteRole(row.id)
      ElMessage.success('删除成功')
      fetchRolePage()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 设置权限
const handlePermission = async (row: RoleItem) => {
  currentRoleId.value = row.id
  await getPermissionTree()

  // 这里应该获取角色已有的权限并设置选中状态
  // 模拟已选中的权限
  const checkedKeys = [11, 21] // 模拟已选中的权限ID
  permissionTreeRef.value?.setCheckedKeys(checkedKeys)

  permissionDialogVisible.value = true
}

// 保存权限
const savePermission = async () => {
  try {
    const checkedKeys = permissionTreeRef.value?.getCheckedKeys()
    const halfCheckedKeys = permissionTreeRef.value?.getHalfCheckedKeys()
    const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys]

    // 这里替换为实际的API调用
    // await updateRolePermissionApi(currentRoleId.value, allCheckedKeys)
    await new Promise(resolve => setTimeout(resolve, 500))

    ElMessage.success('权限设置成功')
    permissionDialogVisible.value = false
  } catch (error) {
    console.error('权限设置失败:', error)
    ElMessage.error('权限设置失败')
  }
}

// 对话框关闭时重置表单
const handleDialogClosed = () => {
  roleFormRef.value?.resetFields()
  Object.assign(roleForm, {
    id: undefined,
    name: '',
    code: '',
    description: '',
    status: 1,
    sort: 0,
  })
}

// 初始化
onMounted(() => {
  fetchRolePage()
})
</script>

<style scoped>
.role-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>