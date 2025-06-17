<template>
  <div class="container">
    <div class="container-header">
      <el-button type="primary" @click="goToHome">首页</el-button>
      <el-button :type="isRendered ? 'success' : ''" @click="toggleXingtang">
        渲染
      </el-button>
    </div>
    <div class="container-left">
      <el-collapse>
        <el-collapse-item>
          <template #title>
            <el-icon>
              <Location />
            </el-icon>
            <span style="margin-left: 8px">区域信息</span>
          </template>
          <div class="collapse-content">
            <p>行唐县基本信息：</p>
            <ul>
              <li>面积：1025平方公里</li>
              <li>人口：约45万</li>
              <li>位置：河北省石家庄市</li>
            </ul>
          </div>
        </el-collapse-item>
        <el-collapse-item>
          <template #title>
            <el-icon>
              <InfoFilled />
            </el-icon>
            <span style="margin-left: 8px">区域信息2</span>
          </template>
          <div class="collapse-content">
            <p>行唐县基本信息：</p>
            <ul>
              <li>面积：1025平方公里</li>
              <li>人口：约45万</li>
              <li>位置：河北省石家庄市</li>
            </ul>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <div class="container-right">

    </div>
    <div>
      <MapComponent :is-rendered="isRendered" />
    </div>
  </div>
</template>

<script setup lang="ts">
import MapComponent from '@/components/MapComponent.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { ElCollapse, ElCollapseItem, ElIcon } from 'element-plus'
import { Location, InfoFilled } from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'

defineOptions({
  name: 'MapView'
})

const router = useRouter()
const isRendered = ref(false)

const goToHome = () => {
  router.push('/')
}

const toggleXingtang = () => {
  isRendered.value = !isRendered.value
}
</script>

<style lang="scss">
.container {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;

  .container-header {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1000;
    padding: 8px 16px;
    display: flex;
    gap: 10px;
  }

  .container-left {
    width: 300px;
    position: absolute;
    top: 100px;
    left: 20px;
    z-index: 1000;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .collapse-content {
      text-align: left;
      padding: 10px;

      ul {
        list-style: none;
        padding-left: 10px;

        li {
          margin: 8px 0;
        }
      }
    }
  }

  .container-right {
    width: 200px;
    height: 200px;
    position: absolute;
    top: 100px;
    right: 20px;
    z-index: 1000;
    padding: 8px 16px;
    display: flex;
    gap: 10px;
    border: 1px solid black;
  }
}
</style>
