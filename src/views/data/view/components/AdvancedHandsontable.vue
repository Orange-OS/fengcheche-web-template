<template>
  <div>
    <HotTable ref="hotTableComponent" :settings="hotSettings" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { HotTable } from '@handsontable/vue3'
import { registerAllModules } from 'handsontable/registry'
import 'handsontable/dist/handsontable.full.min.css'
import type Handsontable from 'handsontable'

// 注册 Handsontable 所有模块
registerAllModules()

defineOptions({ name: 'AdvancedHandsontable' })

// 定义 Props：只接收 data
const props = defineProps<{
  data: Handsontable.RowObject[] // 数据格式为对象数组
}>()

// emit 类型声明（可选，如果需要在数据变化时通知父组件）
const emit = defineEmits<{
  (e: 'update', data: Handsontable.CellValue[][]): void
}>()

// ref + 类型指定
const hotTableComponent = ref<InstanceType<typeof HotTable> | null>(null)

// 表格配置
const hotSettings = ref<Handsontable.GridSettings>({
  data: props.data, // 使用父组件传入的 data
  colHeaders: ['ID', 'Name', 'Age', 'Active'],
  columns: [
    { data: 'id', type: 'numeric' },
    { data: 'name', type: 'text' },
    { data: 'age', type: 'numeric' },
    { data: 'active', type: 'checkbox' }
  ],
  rowHeaders: true,
  width: '100%',
  height: 300,
  stretchH: 'all', // 优化列宽布局
  licenseKey: 'non-commercial-and-evaluation',
  contextMenu: false,
  filters: true,
  dropdownMenu: false,
  columnSorting: true,
  afterChange: (changes, source) => {
    if (source === 'edit' && changes) {
      console.log('数据已更改:', changes)
      emitData()
    }
  }
})

// 监听父组件传入的 data，如果变化则更新表格
watch(
  () => props.data,
  (newData) => {
    const hot = hotTableComponent.value?.hotInstance
    if (hot) {
      hot.loadData(newData)
    }
  },
  { deep: true }
)

// 获取数据并 emit 给父组件（可选）
const emitData = () => {
  const hot = hotTableComponent.value?.hotInstance
  if (hot) {
    const data = hot.getData()
    emit('update', data)
  }
}
</script>
