<template>
  <div class="medication-record">
    <!-- 搜索栏 - 卡片式设计 -->
    <el-card class="search-card" shadow="never">
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="药品名称" class="search-item">
            <el-input v-model="searchForm.medicineName" placeholder="请输入药品名称" clearable suffix-icon="Search" />
          </el-form-item>
          <el-form-item label="用药时间" class="search-item">
            <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" value-format="YYYY-MM-DD" class="date-picker" />
          </el-form-item>
          <el-form-item class="search-item">
            <el-button type="primary" @click="handleSearch" class="search-btn">
              <el-icon>
                <Search />
              </el-icon>
              <span>搜索</span>
            </el-button>
            <el-button @click="resetSearch" class="reset-btn">
              <el-icon>
                <Refresh />
              </el-icon>
              <span>重置</span>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 横向时间轴 - 卡片式设计 -->
    <el-card class="timeline-card" shadow="never">
      <div class="card-header">
        <span class="header-title">用药时间轴</span>
        <span class="header-date-range" v-if="timelineRange.start && timelineRange.end">
          {{ timelineRange.start }} 至 {{ timelineRange.end }}
        </span>
      </div>

      <div class="horizontal-timeline-container">
        <div class="timeline-wrapper">
          <div class="timeline-line"></div>
          <div class="timeline-item" v-for="(record, index) in timelineData" :key="index"
            :style="{ left: calculatePosition(record.medicationTime) + '%' }">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-date">{{ formatDate(record.medicationTime) }}</div>
              <el-popover placement="top" :width="220" trigger="hover">
                <template #reference>
                  <div class="timeline-title">
                    <el-tag :type="getTagType(index)" effect="light" round>
                      {{ record.medicineName }}
                    </el-tag>
                  </div>
                </template>
                <div class="popover-content">
                  <p><span class="popover-label">药品名称:</span> {{ record.medicineName }}</p>
                  <p><span class="popover-label">用药时间:</span> {{ record.medicationTime }}</p>
                  <p><span class="popover-label">备注:</span> {{ record.notes || '无备注' }}</p>
                </div>
              </el-popover>
            </div>
          </div>
        </div>
      </div>
      <div v-if="timelineData.length === 0" class="empty-timeline">
        <el-empty description="暂无用药记录" :image-size="80" />
      </div>
    </el-card>

    <!-- 操作栏 - 添加阴影和圆角 -->
    <el-card class="operation-card" shadow="never">
      <div class="operation-bar">
        <el-button type="primary" @click="handleAdd" class="add-btn" :icon="Plus">
          新增用药记录
        </el-button>
      </div>
    </el-card>

    <!-- 数据表格 - 优化样式 -->
    <el-card class="table-card" shadow="never">
      <el-table :data="tableData" border style="width: 100%" v-loading="loading" stripe
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }">
        <el-table-column prop="medicineName" label="药品名称" width="180" />
        <el-table-column prop="medicationTime" label="用药时间" width="150" align="center" />
        <el-table-column prop="notes" label="备注" show-overflow-tooltip />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)" :icon="Edit" class="action-btn">
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)" :icon="Delete" class="action-btn">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分页 - 居右显示 -->
    <div class="pagination-container">
      <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[10, 20, 50, 100]"
        :total="total" layout="total, sizes, prev, pager, next, jumper" background />
    </div>

    <!-- 新增/编辑对话框 - 优化样式 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" :close-on-click-modal="false"
      class="form-dialog">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="药品名称" prop="medicineName">
          <el-input v-model="form.medicineName" placeholder="请输入药品名称" clearable />
        </el-form-item>
        <el-form-item label="用药时间" prop="medicationTime">
          <el-date-picker v-model="form.medicationTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择用药时间"
            class="form-date-picker" />
        </el-form-item>
        <el-form-item label="备注" prop="notes">
          <el-input v-model="form.notes" type="textarea" placeholder="请输入备注信息" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" class="dialog-btn cancel-btn">取消</el-button>
          <el-button type="primary" @click="handleSubmit" class="dialog-btn confirm-btn">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import {
  getMedicationRecordPage,
  addMedicationRecord,
  updateMedicationRecord,
  deleteMedicationRecord,
  getMedicationRecordList
} from '@/api/life/medicationRecord'

// 搜索表单
const searchForm = reactive({
  medicineName: '',
  dateRange: [],
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 时间轴数据
const timelineData = ref([])

// 时间轴范围
const timelineRange = reactive({
  start: '',
  end: ''
})

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增用药记录')
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive({
  id: '',
  medicineName: '',
  medicationTime: '',
  notes: '',
})

// 表单校验规则
const rules = reactive<FormRules>({
  medicineName: [{ required: true, message: '请输入药品名称', trigger: 'blur' }],
  medicationTime: [{ required: true, message: '请选择用药时间', trigger: 'change' }],
})

// 初始化数据
onMounted(() => {
  fetchData()
})

// 获取表格数据
const fetchData = async () => {
  loading.value = true
  try {
    // 获取分页表格数据
    const response = await getMedicationRecordPage({
      medicineName: searchForm.medicineName,
      startDate: searchForm.dateRange[0],
      endDate: searchForm.dateRange[1],
      pageNum: pageNum.value,
      pageSize: pageSize.value
    });

    if (response != null) {
      tableData.value = response.records;
      total.value = response.total;
      pageNum.value = response.current;
      pageSize.value = response.size;

      // 获取全部数据用于时间轴
      const listResponse = await getMedicationRecordList({
        medicineName: searchForm.medicineName,
        startDate: searchForm.dateRange[0],
        endDate: searchForm.dateRange[1]
      });

      timelineData.value = listResponse;

      // 计算时间轴范围
      calculateTimelineRange();

    } else {
      console.log('response', response)
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    ElMessage.error('获取数据失败，请重试');
  } finally {
    loading.value = false;
  }
}

// 计算时间轴范围
const calculateTimelineRange = () => {
  if (timelineData.value.length === 0) {
    timelineRange.start = '';
    timelineRange.end = '';
    return;
  }

  // 按日期排序
  const sortedData = [...timelineData.value].sort((a, b) =>
    new Date(a.medicationTime).getTime() - new Date(b.medicationTime).getTime()
  );

  timelineRange.start = sortedData[0].medicationTime;
  timelineRange.end = sortedData[sortedData.length - 1].medicationTime;
}

// 计算时间点在时间轴上的位置百分比
const calculatePosition = (date: string) => {
  if (timelineData.value.length === 0 || !timelineRange.start || !timelineRange.end) return 0;

  const startTime = new Date(timelineRange.start).getTime();
  const endTime = new Date(timelineRange.end).getTime();
  const currentTime = new Date(date).getTime();

  // 计算在时间范围内的位置百分比
  const percentage = ((currentTime - startTime) / (endTime - startTime)) * 100;
  return Math.min(Math.max(percentage, 0), 100); // 限制在0-100之间
}

// 格式化日期显示
const formatDate = (date: string) => {
  return date.split('-').slice(1).join('-') // 只显示月-日
}

// 获取标签类型（循环使用不同颜色）
const getTagType = (index: number) => {
  const types = ['', 'success', 'info', 'warning', 'danger']
  return types[index % types.length]
}

// 搜索
const handleSearch = () => {
  pageNum.value = 1
  fetchData()
}

// 重置搜索
const resetSearch = () => {
  searchForm.medicineName = ''
  searchForm.dateRange = []
  handleSearch()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增用药记录'
  form.id = ''
  form.medicineName = ''
  form.medicationTime = ''
  form.notes = ''
  dialogVisible.value = true
}

// 编辑
interface MedicationRecord {
  id: string | number
  medicineName: string
  medicationTime: string
  notes: string
  status: string
}

const handleEdit = (row: MedicationRecord) => {
  dialogTitle.value = '编辑用药记录'
  Object.assign(form, row)
  form.medicationTime = row.medicationTime
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: MedicationRecord) => {
  ElMessageBox.confirm('确认删除该用药记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    customClass: 'delete-confirm'
  }).then(async () => {
    // 调用删除 API
    const response = await deleteMedicationRecord(row.id)
    ElMessage.success('删除成功')
    fetchData()
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      let response;
      if (form.id) {
        // 编辑：调用更新 API，传递 id
        response = await updateMedicationRecord(form);
      } else {
        // 创建：不传递 id，后端自动生成
        const { id, ...createData } = form; // 剔除 id
        response = await addMedicationRecord(createData);
      }
      ElMessage.success(form.id ? '修改成功' : '添加成功')
      dialogVisible.value = false
      fetchData()
    }
  })
}

// 分页相关
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchData()
}

const handleCurrentChange = (val: number) => {
  pageNum.value = val
  fetchData()
}
</script>

<style scoped lang="scss">
.medication-record {
  padding: 20px;
  background-color: #f5f7fa;
}

/* 卡片通用样式 */
.search-card,
.timeline-card,
.operation-card,
.table-card {
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #ebeef5;

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}

/* 搜索栏样式 */
.search-bar {
  padding: 16px 0;

  .demo-form-inline {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;

    .search-item {
      margin-right: 0;
      margin-bottom: 0;
    }
  }

  .search-btn,
  .reset-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .date-picker {
    width: 240px;
  }
}

/* 时间轴卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;

  .header-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .header-date-range {
    font-size: 14px;
    color: #909399;
  }
}

/* 横向时间轴样式 */
.horizontal-timeline-container {
  padding: 16px 0;

  .timeline-wrapper {
    position: relative;
    height: 120px;
    margin: 20px 0 40px;

    .timeline-line {
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 3px;
      background-color: #409EFF;
      transform: translateY(-50%);
      border-radius: 3px;
    }

    .timeline-item {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: translate(-50%, -50%) scale(1.05);

        .timeline-dot {
          transform: scale(1.2);
        }
      }

      .timeline-dot {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background-color: #409EFF;
        border: 2px solid white;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
        transition: all 0.3s;
        z-index: 1;
      }

      .timeline-content {
        margin-top: 16px;
        text-align: center;
        min-width: 80px;

        .timeline-date {
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;
        }

        .timeline-title {
          font-weight: 500;
          white-space: nowrap;
        }
      }
    }
  }

  .empty-timeline {
    padding: 40px 0;
  }
}

/* 操作栏样式 */
.operation-bar {
  padding: 8px 0;

  .add-btn {
    padding: 10px 20px;
    font-weight: 500;
  }
}

/* 表格样式 */
:deep(.el-table) {
  font-size: 14px;

  .el-table__row {
    &:hover {
      .action-btn {
        opacity: 1;
      }
    }
  }

  .action-btn {
    opacity: 0.8;
    transition: opacity 0.3s;

    &:hover {
      opacity: 1;
    }
  }
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding: 16px 0;
}

/* 对话框样式 */
.form-dialog {
  :deep(.el-dialog__header) {
    padding: 16px 20px;
    margin-right: 0;
    border-bottom: 1px solid #f0f0f0;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
    }
  }

  :deep(.el-dialog__body) {
    padding: 20px;
  }

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  .form-date-picker {
    width: 100%;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;

    .dialog-btn {
      padding: 10px 20px;

      &.confirm-btn {
        background-color: #409EFF;
        border-color: #409EFF;
      }
    }
  }
}

/* 弹出框样式 */
.popover-content {
  p {
    margin: 6px 0;
    line-height: 1.5;

    .popover-label {
      display: inline-block;
      width: 60px;
      color: #909399;
    }
  }
}

/* 删除确认框样式 */
:deep(.delete-confirm) {
  .el-message-box__header {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
  }

  .el-message-box__content {
    padding: 20px;
  }

  .el-message-box__btns {
    padding: 12px 20px;
    border-top: 1px solid #f0f0f0;
  }
}
</style>
