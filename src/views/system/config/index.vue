<script setup lang="ts" name="SystemConfig">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getConfigPage,
  addConfig,
  updateConfig,
  deleteConfig,
  type ConfigPageQuery,
  type SystemConfig,
} from '@/api/system/config'

const loading = ref(false)
const configList = ref<SystemConfig[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const configFormRef = ref<FormInstance>()
const selectedConfigs = ref<SystemConfig[]>([])

// 搜索表单
const searchForm = ref<ConfigPageQuery>({
  configName: '',
  configKey: '',
  pageNum: 1,
  pageSize: 10,
})

// 分页参数
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
})

// 配置表单
const configForm = ref<SystemConfig>({
  configName: '',
  configKey: '',
  configValue: '',
  remark: '',
})

// 表单验证规则
const configRules: FormRules = {
  configKey: [
    { required: true, message: '请输入配置键', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  configName: [
    { required: true, message: '请输入配置名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  configValue: [
    { required: true, message: '请输入配置值', trigger: 'blur' },
  ],
  remark: [
    { max: 200, message: '备注长度不能超过 200 个字符', trigger: 'blur' },
  ],
}

// 获取配置列表
const fetchConfigList = async () => {
  loading.value = true
  try {
    const params: ConfigPageQuery = {
      ...searchForm.value,
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
    }
    const response = await getConfigPage(params)
    // 假设返回的数据结构包含 records 和 total
    if (response && typeof response === 'object') {
      configList.value = response.records || response.data || []
      total.value = response.total || 0
    } else {
      configList.value = []
      total.value = 0
    }
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('获取配置列表失败')
    }
    configList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.pageNum = 1
  fetchConfigList()
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    configName: '',
    configKey: '',
    pageNum: 1,
    pageSize: 10,
  }
  pagination.value.pageNum = 1
  fetchConfigList()
}

// 新增配置
const handleAdd = () => {
  dialogType.value = 'add'
  configForm.value = {
    configName: '',
    configKey: '',
    configValue: '',
    remark: '',
  }
  dialogVisible.value = true
}

// 编辑配置
const handleEdit = (row: SystemConfig) => {
  dialogType.value = 'edit'
  configForm.value = { ...row }
  dialogVisible.value = true
}

// 删除配置
const handleDelete = (row: SystemConfig) => {
  if (!row.id) return

  ElMessageBox.confirm('确认删除该配置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await deleteConfig(row.id)
      ElMessage.success('删除成功')
      fetchConfigList()
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
// const handleBatchDelete = () => {
//   if (!selectedConfigs.value.length) return

//   ElMessageBox.confirm(`确认删除选中的 ${selectedConfigs.value.length} 个配置吗？`, '提示', {
//     confirmButtonText: '确定',
//     cancelButtonText: '取消',
//     type: 'warning',
//   }).then(async () => {
//     try {
//       const deletePromises = selectedConfigs.value
//         .map((config) => config.id)
//         .filter((id): id is number => id !== undefined)
//         .map((id) => deleteConfig(id))

//       await Promise.all(deletePromises)
//       ElMessage.success('批量删除成功')
//       selectedConfigs.value = []
//       fetchConfigList()
//     } catch (error) {
//       if (error instanceof Error) {
//         ElMessage.error(error.message)
//       } else {
//         ElMessage.error('批量删除失败')
//       }
//     }
//   })
// }

// 提交表单
const handleSubmit = async () => {
  if (!configFormRef.value) return

  await configFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === 'add') {
          await addConfig(configForm.value)
        } else if (configForm.value.id) {
          await updateConfig(configForm.value)
        }

        ElMessage.success(dialogType.value === 'add' ? '新增成功' : '更新成功')
        dialogVisible.value = false
        fetchConfigList()
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
const handleSelectionChange = (selection: SystemConfig[]) => {
  selectedConfigs.value = selection
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.pageNum = 1
  fetchConfigList()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.value.pageNum = page
  fetchConfigList()
}

onMounted(() => {
  fetchConfigList()
})
</script>

<template>
  <div class="config-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <div class="search-box">
            <el-input v-model="searchForm.configName" placeholder="请输入配置名称" style="width: 200px; margin-right: 10px"
              clearable />
            <el-input v-model="searchForm.configKey" placeholder="请输入配置键" style="width: 200px; margin-right: 10px"
              clearable />
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
          <div class="operation-box">
            <el-button type="primary" @click="handleAdd">新增配置</el-button>
            <!-- <el-button type="danger" :disabled="!selectedConfigs.length" @click="handleBatchDelete">批量删除</el-button> -->
          </div>
        </div>
      </template>

      <el-table :data="configList" style="width: 100%" v-loading="loading" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="55" /> -->
        <el-table-column prop="configName" label="配置名称" min-width="150" />
        <el-table-column prop="configKey" label="配置键" min-width="150" />
        <el-table-column prop="configValue" label="配置值" min-width="200" show-overflow-tooltip />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 配置表单对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增配置' : '编辑配置'" width="500px"
      :close-on-click-modal="false" :close-on-press-escape="false" destroy-on-close class="config-dialog">
      <el-form ref="configFormRef" :model="configForm" :rules="configRules" label-width="100px" class="config-form">
        <el-form-item label="配置名称" prop="configName">
          <el-input v-model="configForm.configName" placeholder="请输入配置名称" />
        </el-form-item>

        <el-form-item label="配置键" prop="configKey">
          <el-input v-model="configForm.configKey" :disabled="dialogType === 'edit'" placeholder="请输入配置键" />
        </el-form-item>

        <el-form-item label="配置值" prop="configValue">
          <el-input v-model="configForm.configValue" type="textarea" :rows="3" placeholder="请输入配置值" />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="configForm.remark" type="textarea" :rows="2" placeholder="请输入备注" />
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

<style lang="scss" scoped>
.config-container {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .search-box {
    display: flex;
    align-items: center;
  }

  .operation-box {
    display: flex;
    gap: 10px;
  }
}

.pagination-wrapper {
  display: flex;
  /* 靠右对齐 */
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.config-dialog) {
  .el-dialog__body {
    padding: 20px 30px;
  }

  .config-form {
    .el-form-item {
      margin-bottom: 22px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .el-input {
      width: 100%;
    }

    .el-textarea {
      width: 100%;
    }
  }
}
</style>
