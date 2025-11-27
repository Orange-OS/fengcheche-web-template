<template>
  <div class="role-container">
    <div class="role-layout">
      <!-- 左侧角色列表 -->
      <div class="role-left-panel">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>角色列表</span>
              <el-button type="primary" size="small" @click="handleAdd">新增角色</el-button>
            </div>
          </template>

          <div class="role-list" v-loading="loading">
            <div v-for="role in roleList" :key="role.id"
              :class="['role-item', { 'role-item-active': selectedRoleId === role.id }]"
              @click="handleRoleSelect(role)">
              <div class="role-item-header">
                <div class="role-name">{{ role.name }}</div>
                <el-tag :type="role?.status === 1 ? 'success' : 'danger'" size="small">
                  {{ role?.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </div>
              <div class="role-code">{{ role.code }}</div>
              <div class="role-description" v-if="role.description">{{ role.description }}</div>
              <div class="role-actions">
                <el-button type="primary" link size="small" @click.stop="handleEdit(role)">编辑</el-button>
                <el-button type="danger" link size="small" @click.stop="handleDelete(role)">删除</el-button>
              </div>
            </div>
          </div>

          <!-- 分页组件 -->
          <div class="pagination-wrapper">
            <el-pagination v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize"
              :total="total" :page-sizes="[10, 20, 30, 50]" layout="total, sizes, prev, pager, next"
              @size-change="handleSizeChange" @current-change="handleCurrentChange" small />
          </div>
        </el-card>
      </div>

      <!-- 右侧权限信息 -->
      <div class="role-right-panel">
        <el-card class="box-card" v-if="selectedRole">
          <template #header>
            <div class="card-header">
              <span>角色权限 - {{ selectedRole.name }}</span>
              <el-button type="primary" @click="handleSavePermission">保存权限</el-button>
            </div>
          </template>

          <div v-loading="permissionLoading" class="permission-content">
            <el-tree ref="permissionTreeRef" :data="permissionTreeData" show-checkbox node-key="id" :props="treeProps"
              :default-expand-all="true" check-strictly @check="handleTreeCheck">
              <template #default="{ data }">
                <div class="tree-node" :data-menu-type="data.menuType">
                  <el-icon v-if="data.icon" class="tree-icon">
                    <component :is="data.icon" />
                  </el-icon>
                  <span class="tree-label">{{ data.name }}</span>
                  <el-tag v-if="data.menuType"
                    :type="data.menuType === 'M' ? 'primary' : data.menuType === 'C' ? 'success' : 'warning'"
                    size="small" style="margin-left: 8px">
                    {{ data.menuType === 'M' ? '目录' : data.menuType === 'C' ? '菜单' : '按钮' }}
                  </el-tag>
                  <span v-if="data.permission" class="tree-permission">{{ data.permission }}</span>
                </div>
              </template>
            </el-tree>
          </div>
        </el-card>
        <el-empty v-else description="请从左侧选择一个角色查看权限信息" />
      </div>
    </div>

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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  getRolePage,
  addRole,
  updateRole,
  deleteRole
} from '@/api/system/role'
import {
  getPermissionTree,
  updatePermissionTree
} from '@/api/system/permission'
import type { MenuItem } from '@/types/menu'

interface RoleItem {
  id: number
  name: string
  code: string
  description: string
  status: number
  sort: number
}

interface PermissionItem extends MenuItem {
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
const permissionLoading = ref(false)
const permissionTreeRef = ref()
const permissionTreeData = ref<PermissionItem[]>([])
const treeProps = {
  label: 'name',
  children: 'children'
}
const selectedRoleId = ref<number | undefined>()
const selectedRole = ref<RoleItem | null>(null)

// 隐藏目录类型节点的复选框（只显示菜单和按钮的复选框）
const hideNonButtonCheckboxes = () => {
  nextTick(() => {
    const treeEl = document.querySelector('.permission-content .el-tree')
    if (!treeEl) return

    // 查找所有树节点内容
    const treeNodes = treeEl.querySelectorAll('.el-tree-node__content')
    treeNodes.forEach((nodeEl) => {
      const treeNodeDiv = nodeEl.querySelector('.tree-node') as HTMLElement
      if (treeNodeDiv) {
        const menuType = treeNodeDiv.getAttribute('data-menu-type')
        const checkbox = nodeEl.querySelector('.el-checkbox') as HTMLElement
        if (checkbox) {
          if (menuType === 'M') {
            checkbox.style.display = 'none'
          } else if (menuType === 'C' || menuType === 'F') {
            checkbox.style.display = 'inline-block'
          }
        }
      }
    })
  })
}

// 处理树节点复选框点击：只有菜单和按钮类型可以选中
const handleTreeCheck = (data: PermissionItem) => {
  // 如果是目录类型，取消选中
  if (data.menuType === 'M') {
    const currentChecked = permissionTreeRef.value?.getCheckedKeys() || []
    const filteredChecked = currentChecked.filter((key: number) => {
      const findNode = (nodes: PermissionItem[]): PermissionItem | null => {
        for (const node of nodes) {
          if (node.id === key) return node
          if (node.children) {
            const found = findNode(node.children)
            if (found) return found
          }
        }
        return null
      }
      const node = findNode(permissionTreeData.value)
      return node?.menuType !== 'M'
    })
    permissionTreeRef.value?.setCheckedKeys(filteredChecked)
    // 重新隐藏复选框
    hideNonButtonCheckboxes()
  }
}

// 扁平化菜单树，将按钮放在菜单后面
const flattenMenuTree = (tree: PermissionItem[]): PermissionItem[] => {
  const processNode = (node: PermissionItem): PermissionItem => {
    if (!node.children || node.children.length === 0) {
      return { ...node }
    }

    // 分离按钮和非按钮子节点
    const buttons: PermissionItem[] = []
    const nonButtons: PermissionItem[] = []

    node.children.forEach(child => {
      if (child.menuType === 'F') {
        buttons.push(child)
      } else {
        nonButtons.push(processNode(child))
      }
    })

    // 构建新节点：先是非按钮子节点，然后是按钮
    const newNode: PermissionItem = {
      ...node,
      children: [...nonButtons, ...buttons]
    }

    return newNode
  }

  return tree.map(node => processNode(node))
}

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
  loading.value = true; // 1. 提前设置 loading 状态

  try {
    const isValid = await roleFormRef.value?.validate(); // 2. 直接 await 校验结果
    if (!isValid) return; // 校验失败直接退出

    const isEditMode = !!roleForm.id; // 3. 明确用布尔值标识当前模式
    const request = isEditMode
      ? await updateRole(roleForm)
      : await addRole(omit(roleForm, 'id')); // 4. 使用工具函数剔除 id

    await request; // 5. 统一处理请求

    ElMessage.success(isEditMode ? '修改成功' : '添加成功');
    dialogVisible.value = false;
    await fetchRolePage(); // 6. 确保刷新列表完成
    // 如果当前选中的角色被编辑，更新选中角色信息
    if (selectedRoleId.value === roleForm.id) {
      const updatedRole = roleList.value.find(r => r.id === roleForm.id)
      if (updatedRole) {
        selectedRole.value = updatedRole
      }
    }
  } catch (error) {
    console.error('操作失败:', error);
    // ElMessage.error(`角色${roleForm.id ? '修改' : '添加'}失败: ${error.message || '未知错误'}`); // 7. 明确错误反馈
  } finally {
    loading.value = false; // 8. 最终关闭 loading
  }
};

// 工具函数：剔除对象中的指定属性
function omit<T extends object, K extends keyof T>(obj: T, key: K): Omit<T, K> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [key]: _, ...rest } = obj;
  return rest;
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
      await deleteRole(row.id)
      ElMessage.success('删除成功')
      // 如果删除的是当前选中的角色，清空选中状态
      if (selectedRoleId.value === row.id) {
        selectedRoleId.value = undefined
        selectedRole.value = null
        permissionTreeData.value = []
      }
      await fetchRolePage()
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

// 选择角色
const handleRoleSelect = async (role: RoleItem) => {
  selectedRoleId.value = role.id
  selectedRole.value = role

  try {
    permissionLoading.value = true
    const { permissionTree, selectedPermissionIdList } = await getPermissionTree(role.id)

    // 扁平化菜单树，将按钮放在菜单后面
    const flattenedTree = flattenMenuTree(permissionTree || [])
    permissionTreeData.value = flattenedTree

    // 等待 DOM 更新后设置选中状态（只选中菜单和按钮类型）
    await nextTick()

    // 隐藏目录类型节点的复选框
    hideNonButtonCheckboxes()

    if (selectedPermissionIdList && selectedPermissionIdList.length > 0) {
      // 设置菜单和按钮类型的选中状态
      const menuAndButtonIds = selectedPermissionIdList.filter((id: number) => {
        const findNode = (nodes: PermissionItem[]): PermissionItem | null => {
          for (const node of nodes) {
            if (node.id === id && (node.menuType === 'C' || node.menuType === 'F')) {
              return node
            }
            if (node.children) {
              const found = findNode(node.children)
              if (found) return found
            }
          }
          return null
        }
        return findNode(flattenedTree) !== null
      })
      permissionTreeRef.value?.setCheckedKeys(menuAndButtonIds)
    } else {
      permissionTreeRef.value?.setCheckedKeys([])
    }
  } catch (error) {
    console.error('获取角色菜单权限失败:', error)
    ElMessage.error('获取角色菜单权限失败')
    permissionTreeData.value = []
  } finally {
    permissionLoading.value = false
  }
}

// 保存权限
const handleSavePermission = async () => {
  if (!selectedRoleId.value) {
    ElMessage.warning('请先选择角色')
    return
  }

  try {
    const checkedKeys = permissionTreeRef.value?.getCheckedKeys() || []
    const halfCheckedKeys = permissionTreeRef.value?.getHalfCheckedKeys() || []
    const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys]

    // 过滤出菜单和按钮类型的ID
    const menuAndButtonIds = allCheckedKeys.filter((id: number) => {
      const findNode = (nodes: PermissionItem[]): PermissionItem | null => {
        for (const node of nodes) {
          if (node.id === id) return node
          if (node.children) {
            const found = findNode(node.children)
            if (found) return found
          }
        }
        return null
      }
      const node = findNode(permissionTreeData.value)
      return node?.menuType === 'C' || node?.menuType === 'F'
    })

    const permissionTreeUpdateForm = {
      permissionIdList: menuAndButtonIds
    }

    // 这里替换为实际的API调用
    await updatePermissionTree(selectedRoleId.value, permissionTreeUpdateForm)
    console.log('保存权限，选中的菜单和按钮ID:', menuAndButtonIds)
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('权限设置成功')
  } catch (error) {
    console.error('权限设置失败:', error)
    // ElMessage.error('权限设置失败')
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
  height: calc(100vh - 80px);
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.role-layout {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.role-left-panel {
  width: 400px;
  flex-shrink: 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.role-left-panel .box-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.role-left-panel .box-card :deep(.el-card__header) {
  flex-shrink: 0;
  padding: 18px 20px;
}

.role-left-panel .box-card :deep(.el-card__body) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.role-right-panel {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.role-right-panel .box-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.role-right-panel .box-card :deep(.el-card__header) {
  flex-shrink: 0;
  padding: 18px 20px;
}

.role-right-panel .box-card :deep(.el-card__body) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 10px 0;
  margin: -10px 0;
}

.role-item {
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fff;
  flex-shrink: 0;
}

.role-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.role-item-active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.role-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.role-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.role-code {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.role-description {
  font-size: 13px;
  color: #606266;
  margin-bottom: 10px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
}

.role-actions {
  display: flex;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.pagination-wrapper {
  flex-shrink: 0;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
}

.permission-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.tree-node {
  display: flex;
  align-items: center;
  flex: 1;
  font-size: 14px;
}

.tree-icon {
  margin-right: 6px;
  color: #606266;
}

.tree-label {
  margin-right: 8px;
}

.tree-permission {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
  font-family: 'Courier New', monospace;
}

/* 树节点样式 */
.permission-content :deep(.el-tree-node__content) {
  position: relative;
}
</style>
