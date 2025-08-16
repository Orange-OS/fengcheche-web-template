<template>
  <div class="menu-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>菜单管理</span>
          <el-button type="primary" @click="handleAdd">新增菜单</el-button>
        </div>
      </template>

      <el-table :data="menuList" style="width: 100%" max-height="940px" v-loading="loading" row-key="id"
        :tree-props="{ children: 'children' }">
        <el-table-column prop="name" label="菜单名称" />
        <el-table-column prop="path" label="路由路径" />
        <el-table-column prop="component" label="组件路径" />
        <el-table-column prop="permission" label="权限标识" />
        <el-table-column prop="menuType" label="类型">
          <template #default="{ row }">
            <el-tag :type="row?.menuType === 'M' ? 'primary' : row?.menuType === 'C' ? 'success' : 'info'">
              {{ row?.menuType === 'M' ? '目录' : row?.menuType === 'C' ? '菜单' : '按钮' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="菜单图标">
          <template #default="{ row }">
            <el-icon v-if="row.icon">
              <component :is="row.icon" />
            </el-icon>
            <span v-else>无图标</span>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="显示顺序" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
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

    <!-- 新增/编辑菜单对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="50%" @close="resetForm">
      <el-form ref="menuFormRef" :model="menuForm" :rules="menuRules" label-width="100px">
        <el-form-item label="上级菜单" prop="parentId">
          <el-tree-select
            v-model="menuForm.parentId"
            :data="menuTreeOptions"
            :props="{ label: 'name', value: 'id' }"
            check-strictly
            placeholder="选择上级菜单"
            clearable
            default-expand-all
          />
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-radio-group v-model="menuForm.menuType">
            <el-radio-button label="M">目录</el-radio-button>
            <el-radio-button label="C">菜单</el-radio-button>
            <el-radio-button label="F">按钮</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="menuForm.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item v-if="menuForm.menuType !== 'F'" label="路由路径" prop="path">
          <el-input v-model="menuForm.path" placeholder="请输入路由路径" />
        </el-form-item>
        <el-form-item v-if="menuForm.menuType === 'C'" label="组件路径" prop="component">
          <el-input v-model="menuForm.component" placeholder="请输入组件路径" />
        </el-form-item>
        <el-form-item v-if="menuForm.menuType == 'F'" label="权限标识" prop="permissions">
          <el-input v-model="menuForm.permissions" placeholder="请输入权限标识" />
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon">
          <el-select
            v-model="menuForm.icon"
            filterable
            placeholder="搜索或选择图标"
            clearable
          >
            <el-option
              v-for="(icon, name) in icons"
              :key="name"
              :label="name"
              :value="name"
            >
              <div style="display: flex; align-items: center; gap: 8px">
                <el-icon><component :is="icon" /></el-icon>
                <span>{{ name }}</span>
              </div>
            </el-option>
          </el-select>

        </el-form-item>
        <el-form-item label="备注信息" prop="remark">
          <el-input v-model="menuForm.remark" placeholder="请输入备注信息" />
        </el-form-item>
        <el-form-item label="显示顺序" prop="sort">
          <el-input-number v-model="menuForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="menuForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { MenuItem } from '@/types/menu'
import {
  getMenuTreeByUserId,
  addMenu,
  updateMenu,
  deleteMenu,
  updateMenuStatus
} from '@/api/system/menu'
import storage from '@/utils/storage'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const icons = ElementPlusIconsVue

const userInfo = storage.getItem('userInfo')
console.log('userInfo', userInfo)

const loading = ref(false)
const menuList = ref<MenuItem[]>([])
const menuTreeOptions = ref<MenuItem[]>([]) // 用于树形选择器的数据

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增菜单')
const menuFormRef = ref<FormInstance>()
const menuForm = reactive<MenuItem>({
  id: undefined,
  parentId: 0,
  name: '',
  path: '',
  component: '',
  permissions: [],
  menuType: 'M',
  icon: '',
  remark: '',
  sort: 0,
  status: 1
})

// 表单验证规则
const menuRules = reactive<FormRules>({
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
  component: [{ required: true, message: '请输入组件路径', trigger: 'blur' }],
  // permissions: [{ required: true, message: '请输入权限标识', trigger: 'blur' }],
  menuType: [{ required: true, message: '请选择菜单类型', trigger: 'change' }]
})

// 获取菜单列表
const fetchMenuList = async () => {
  try {
    loading.value = true
    const res = await getMenuTreeByUserId(userInfo.id)
    console.log('res', res)
    menuList.value = res
    // 准备树形选择器数据，添加一个根节点
    menuTreeOptions.value = [{ id: 0, name: '根目录', children: res }]
    console.log('menuTreeOptions', menuTreeOptions.value)
  } catch (error) {
    console.error('获取菜单列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 新增菜单
const handleAdd = () => {
  dialogTitle.value = '新增菜单'
  dialogVisible.value = true
}

// 编辑菜单
const handleEdit = (row: MenuItem) => {
  dialogTitle.value = '编辑菜单'
  Object.assign(menuForm, row)
  dialogVisible.value = true
}

// 删除菜单
const handleDelete = async (row: MenuItem) => {
  try {
    await ElMessageBox.confirm(`确认删除菜单 "${row.name}" 吗?`, '提示', {
      type: 'warning'
    })
    await deleteMenu(row.id)
    ElMessage.success('删除成功')
    fetchMenuList()
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 状态切换
const handleStatusChange = async (row: MenuItem) => {
  try {
    await updateMenuStatus(row.id, row.status)
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('状态更新失败:', error)
    // 恢复原来的状态
    row.status = row.status === 1 ? 0 : 1
  }
}

// 提交表单
const submitForm = async () => {
  try {
    await menuFormRef.value?.validate()

    if (menuForm.id) {
      // 更新
      await updateMenu(menuForm)
      ElMessage.success('更新成功')
    } else {
      // 新增
      await addMenu(menuForm)
      ElMessage.success('新增成功')
    }

    dialogVisible.value = false
    fetchMenuList()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  menuFormRef.value?.resetFields()
  Object.assign(menuForm, {
    id: undefined,
    parentId: 0,
    name: '',
    path: '',
    component: '',
    permissions: '',
    menuType: 'M',
    sort: 0,
    status: 1
  })
}

onMounted(() => {
  fetchMenuList()
})
</script>

<style scoped>
.menu-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
