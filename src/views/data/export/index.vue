<template>
  <div class="export-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>数据导出</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="export-form"
      >
        <el-form-item label="导出类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择导出类型">
            <el-option
              v-for="item in exportTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="时间范围" prop="dateRange">
          <el-date-picker
            v-model="formData.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="dateShortcuts"
          />
        </el-form-item>

        <el-form-item label="文件格式" prop="format">
          <el-radio-group v-model="formData.format">
            <el-radio label="excel">Excel</el-radio>
            <el-radio label="csv">CSV</el-radio>
            <el-radio label="pdf">PDF</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleExport" :loading="exporting">
            {{ exporting ? '导出中...' : '开始导出' }}
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="export-history">
        <div class="history-header">
          <h3>导出历史</h3>
        </div>
        <el-table :data="exportHistory" style="width: 100%">
          <el-table-column prop="fileName" label="文件名称" />
          <el-table-column prop="type" label="导出类型" />
          <el-table-column prop="format" label="文件格式" />
          <el-table-column prop="createTime" label="创建时间" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleDownload(row)"> 下载 </el-button>
              <el-button type="danger" link @click="handleDelete(row)"> 删除 </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface ExportForm {
  type: string
  dateRange: [Date, Date] | null
  format: string
}

interface ExportRecord {
  id: number
  fileName: string
  type: string
  format: string
  createTime: string
}

const formRef = ref<FormInstance>()
const exporting = ref(false)

const formData = ref<ExportForm>({
  type: '',
  dateRange: null,
  format: 'excel',
})

const exportTypes = [
  { label: '用户数据', value: 'user' },
  { label: '订单数据', value: 'order' },
  { label: '产品数据', value: 'product' },
  { label: '日志数据', value: 'log' },
]

const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    },
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    },
  },
]

const rules = ref<FormRules>({
  type: [{ required: true, message: '请选择导出类型', trigger: 'change' }],
  dateRange: [{ required: true, message: '请选择时间范围', trigger: 'change' }],
  format: [{ required: true, message: '请选择文件格式', trigger: 'change' }],
})

const exportHistory = ref<ExportRecord[]>([
  {
    id: 1,
    fileName: '用户数据_20240329.xlsx',
    type: '用户数据',
    format: 'Excel',
    createTime: '2024-03-29 10:00:00',
  },
  {
    id: 2,
    fileName: '订单数据_20240328.csv',
    type: '订单数据',
    format: 'CSV',
    createTime: '2024-03-28 15:30:00',
  },
])

const handleExport = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      exporting.value = true
      // 实现导出逻辑
      setTimeout(() => {
        exporting.value = false
        // 模拟导出完成
        console.log('导出数据:', formData.value)
      }, 2000)
    }
  })
}

const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}

const handleDownload = (row: ExportRecord) => {
  console.log('下载文件:', row)
}

const handleDelete = (row: ExportRecord) => {
  console.log('删除记录:', row)
}
</script>

<style scoped>
.export-container {
  padding: 20px;
}

.export-form {
  max-width: 600px;
  margin-bottom: 30px;
}

.history-header {
  margin-bottom: 20px;
}

.history-header h3 {
  margin: 0;
  padding: 0;
  font-size: 16px;
  font-weight: 500;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
