<template>
  <div></div>
</template>
<!-- <template>
  <div class="statistics-container">
    <el-row :gutter="20">
      <el-col :span="6" v-for="card in statisticsCards" :key="card.title">
        <el-card class="statistics-card" :body-style="{ padding: '20px' }">
          <div class="card-content">
            <el-icon :size="40" :class="card.iconClass">
              <component :is="card.icon" />
            </el-icon>
            <div class="card-info">
              <div class="card-value">{{ card.value }}</div>
              <div class="card-title">{{ card.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>访问趋势</span>
            </div>
          </template>
          <div class="chart-container" ref="visitChartRef"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户分布</span>
            </div>
          </template>
          <div class="chart-container" ref="userChartRef"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { User, View, Document, Operation } from '@element-plus/icons-vue'

interface StatisticsCard {
  title: string
  value: number | string
  icon: string
  iconClass: string
}

const statisticsCards = ref<StatisticsCard[]>([
  {
    title: '总用户数',
    value: '1,234',
    icon: 'User',
    iconClass: 'icon-user',
  },
  {
    title: '今日访问',
    value: '423',
    icon: 'View',
    iconClass: 'icon-view',
  },
  {
    title: '文档数量',
    value: '56',
    icon: 'Document',
    iconClass: 'icon-document',
  },
  {
    title: '操作次数',
    value: '1,024',
    icon: 'Operation',
    iconClass: 'icon-operation',
  },
])

const visitChartRef = ref<HTMLElement>()
const userChartRef = ref<HTMLElement>()

onMounted(() => {
  if (visitChartRef.value) {
    const visitChart = echarts.init(visitChartRef.value)
    visitChart.setOption({
      title: {
        text: '近7天访问趋势',
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: [150, 230, 224, 218, 135, 147, 260],
          type: 'line',
          smooth: true,
        },
      ],
    })
  }

  if (userChartRef.value) {
    const userChart = echarts.init(userChartRef.value)
    userChart.setOption({
      title: {
        text: '用户分布',
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: [
            { value: 735, name: '普通用户' },
            { value: 580, name: '会员用户' },
            { value: 484, name: '企业用户' },
            { value: 300, name: '管理员' },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    })
  }
})
</script>

<style scoped>
.statistics-container {
  padding: 20px;
}

.statistics-card {
  margin-bottom: 20px;
}

.card-content {
  display: flex;
  align-items: center;
}

.card-info {
  margin-left: 20px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.card-title {
  color: #909399;
}

.chart-row {
  margin-top: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
}

.icon-user {
  color: #409eff;
}

.icon-view {
  color: #67c23a;
}

.icon-document {
  color: #e6a23c;
}

.icon-operation {
  color: #f56c6c;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> -->
