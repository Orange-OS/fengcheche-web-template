<template>
  <div class="map-container">
    <div ref="mapContainer" class="map"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface TiandituSource {
  type: 'raster'
  tiles: string[]
  tileSize: number
  subdomains: string[]
}

interface Props {
  isRendered: boolean
}

const props = defineProps<Props>()
const mapContainer = ref(null)
const map = ref(null)

const renderXingtang = () => {
  const xingtangData = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [114.552, 38.437], // 中心点
        [114.602, 38.487], // 东北
        [114.602, 38.387], // 东南
        [114.502, 38.387], // 西南
        [114.502, 38.487], // 西北
        [114.552, 38.437]  // 回到中心点
      ]]
    }
  }

  map.value.addSource('xingtang', {
    type: 'geojson',
    data: xingtangData
  })

  // 添加填充图层
  map.value.addLayer({
    id: 'xingtang-fill',
    type: 'fill',
    source: 'xingtang',
    paint: {
      'fill-color': '#ff0000',
      'fill-opacity': 0.5,
      'fill-outline-color': '#ff0000'
    }
  })

  // 添加边框图层
  map.value.addLayer({
    id: 'xingtang-outline',
    type: 'line',
    source: 'xingtang',
    paint: {
      'line-color': '#ff0000',
      'line-width': 2
    }
  })
}

const clearXingtang = () => {
  if (map.value.getSource('xingtang')) {
    map.value.removeLayer('xingtang-outline')
    map.value.removeLayer('xingtang-fill')
    map.value.removeSource('xingtang')
  }
}

watch(() => props.isRendered, (newValue) => {
  if (newValue) {
    renderXingtang()
  } else {
    clearXingtang()
  }
})

onMounted(() => {
  // 创建地图实例
  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      sources: {
        'tianditu-vec': {
          type: 'raster',
          tiles: [
            'http://t1.tianditu.com/vec_w/wmts?tk=d28d70687994f4804bd2b9a031019ca0&layer=vec&style=default&tilematrixset=w&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}',
            'http://t2.tianditu.com/vec_w/wmts?tk=d28d70687994f4804bd2b9a031019ca0&layer=vec&style=default&tilematrixset=w&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}',
            'http://t3.tianditu.com/vec_w/wmts?tk=d28d70687994f4804bd2b9a031019ca0&layer=vec&style=default&tilematrixset=w&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}',
            'http://t4.tianditu.com/vec_w/wmts?tk=d28d70687994f4804bd2b9a031019ca0&layer=vec&style=default&tilematrixset=w&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}'
          ],
          tileSize: 256
        } as TiandituSource,
        'tianditu-cva': {
          type: 'raster',
          tiles: [
            'http://t1.tianditu.com/cva_w/wmts?tk=d28d70687994f4804bd2b9a031019ca0&layer=cva&style=default&tilematrixset=w&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}',
            'http://t2.tianditu.com/cva_w/wmts?tk=d28d70687994f4804bd2b9a031019ca0&layer=cva&style=default&tilematrixset=w&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}',
            'http://t3.tianditu.com/cva_w/wmts?tk=d28d70687994f4804bd2b9a031019ca0&layer=cva&style=default&tilematrixset=w&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}',
            'http://t4.tianditu.com/cva_w/wmts?tk=d28d70687994f4804bd2b9a031019ca0&layer=cva&style=default&tilematrixset=w&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}'
          ],
          tileSize: 256
        } as TiandituSource
      },
      layers: [
        {
          id: 'tianditu-vec',
          type: 'raster',
          source: 'tianditu-vec',
          minzoom: 0,
          maxzoom: 18
        },
        {
          id: 'tianditu-cva',
          type: 'raster',
          source: 'tianditu-cva',
          minzoom: 0,
          maxzoom: 18
        }
      ]
    },
    center: [114.552, 38.437], // 修改为中心点至行唐县
    zoom: 10 // 调整缩放级别以更好地显示行唐县
  })

  // 添加导航控件（缩放和旋转按钮）
  map.value.addControl(new maplibregl.NavigationControl())

  // 添加比例尺
  map.value.addControl(new maplibregl.ScaleControl())
})

onUnmounted(() => {
  map.value?.remove()
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
}
</style>