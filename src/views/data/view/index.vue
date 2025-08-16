<template>
  <div>
    <AdvancedHandsontable :data="tableData" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdvancedHandsontable from './components/AdvancedHandsontable.vue'


const tableData = ref([
  { id: 1, name: 'John', age: 28, active: true },
  { id: 2, name: 'Alice', age: 32, active: false },
  { id: 3, name: 'Bob', age: 45, active: true }
])

</script>
