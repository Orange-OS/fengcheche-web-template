<template>
  <div class="heart-beat-container">
    <!-- 搜索表单 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" :inline="true" @submit.prevent="handleSearch">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keywords" placeholder="请输入关键词搜索" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            <el-icon>
              <Search />
            </el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon>
              <Refresh />
            </el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>心跳监控列表</span>
          <el-button type="primary" @click="handleRefresh" :loading="loading">
            <el-icon>
              <Refresh />
            </el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" stripe border style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="heartbeatRecordId" label="ID" width="80" align="center" />
        <el-table-column prop="projectPath" label="项目路径" min-width="120" />
        <el-table-column prop="serverIp" label="服务器IP" min-width="120" />
        <el-table-column prop="processNo" label="进程号" min-width="120" />
        <el-table-column prop="heartBeatTime" label="最后心跳时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.heartbeatTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="processStartTime" label="进程开启时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.processStartTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleView(row)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getHeartBeatPage, type HeartbeatPageQuery } from '@/api/system/heartbeat.ts'

// 搜索表单
const searchForm = reactive({
  keywords: ''
})

// 分页参数
const pagination = reactive({
  pageNum: 1,
  pageSize: 10
})

// 表格数据
const tableData = ref([])
const total = ref(0)
const loading = ref(false)

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params: HeartbeatPageQuery = {
      keywords: searchForm.keywords || undefined,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }

    const response = await getHeartBeatPage(params)
    tableData.value = response.records || []
    total.value = response.total || 0
  } catch (error) {
    console.error('获取心跳数据失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.keywords = ''
  pagination.pageNum = 1
  fetchData()
}

// 刷新
const handleRefresh = () => {
  fetchData()
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.pageNum = 1
  fetchData()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  pagination.pageNum = page
  fetchData()
}

// 查看详情
const handleView = (row: Record<string, unknown>) => {
  ElMessage.info(`查看服务: ${row.serviceName}`)
  // 这里可以添加查看详情的逻辑，比如打开对话框或跳转页面
}

// 格式化日期时间
const formatDateTime = (dateTime: string | number) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 组件挂载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.heart-beat-container {
  padding: 20px;

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
