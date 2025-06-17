<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item
      v-for="(item, index) in breadCrumbList"
      :key="item.path"
      :to="{ path: '/' }"
    >
      <router-link to="/welcome" v-if="index === 0">{{ item.meta.title }}</router-link>
      <span v-else>{{ item.meta.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const breadCrumbList = computed(() => route.matched)
</script>
