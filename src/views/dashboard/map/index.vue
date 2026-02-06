<template>
  <div class="container">
    <div class="container-left">
      <!-- 地图控制面板 -->
      <div class="map-controls">
        <h3>地图控制</h3>
        <div class="control-item">
          <label>缩放级别: {{ zoom.toFixed(2) }}</label>
        </div>
        <div class="control-item">
          <label>中心点: {{ center.join(', ') }}</label>
        </div>
        <div class="control-item">
          <el-button size="small" type="" @click="goToHome">首页</el-button>
        </div>

        <!-- 基础地图切换 -->
        <div class="control-item">
          <div class="basemap-buttons">
            <el-button size="small" :type="currentBaseMap === 'default' ? 'primary' : ''"
              @click="switchBaseMap('default')">
              默认
            </el-button>
            <el-button size="small" :type="currentBaseMap === 'terrain' ? 'primary' : ''"
              @click="switchBaseMap('terrain')">
              地形
            </el-button>
            <el-button size="small" :type="currentBaseMap === 'satellite' ? 'primary' : ''"
              @click="switchBaseMap('satellite')">
              卫星
            </el-button>
          </div>
        </div>

        <div class="control-item">
          <el-button size="small" @click="resetView">重置视图</el-button>
        </div>
        <div class="control-item">
          <el-button size="small" :type="showLabels ? 'primary' : ''" @click="toggleLabels">
            {{ showLabels ? '隐藏地名' : '显示地名' }}
          </el-button>
        </div>
        <div class="control-item">
          <el-button size="small" :type="showHeatmap ? 'primary' : ''" @click="toggleHeatmap">
            {{ showHeatmap ? '隐藏温度图' : '显示温度图' }}
          </el-button>
        </div>

        <div class="control-item">
          <el-button size="small" :type="showCityBoundary ? 'primary' : ''" @click="toggleCityBoundary">
            {{ '市界' }}
          </el-button>
        </div>
        <div class="control-item">
          <el-button size="small" :type="showCountyBoundary ? 'primary' : ''" @click="toggleCountyBoundary">
            {{ '县界' }}
          </el-button>
        </div>
      </div>

      <!-- 温度色卡 -->
      <div v-if="showHeatmap" class="heatmap-legend">
        <h4>温度分布 (°C)</h4>
        <div class="legend-scale">
          <div class="legend-colors">
            <div class="color-stop" v-for="(stop, index) in heatmapStops" :key="index"
              :style="{ backgroundColor: stop.color }">
            </div>
          </div>
          <div class="legend-labels">
            <span>-10°C</span>
            <span>0°C</span>
            <span>10°C</span>
            <span>20°C</span>
            <span>30°C</span>
            <span>40°C</span>
          </div>
        </div>
      </div>

    </div>
    <div class="container-right">
      <!-- 地图容器 -->
      <div ref="mapContainer" class="map-container"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import 'element-plus/dist/index.css'


defineOptions({
  name: 'MapView'
})

const router = useRouter()
const mapContainer = ref<HTMLDivElement>()
const map = ref<maplibregl.Map>()
const zoom = ref(10.5)
const fixedZoom = ref(10.5)
const center = ref([114.43, 38.52]) // 默认中心点
const fixedCenter = ref([114.43, 38.52]) // 固定默认中心点
const showLabels = ref(false)
const showHeatmap = ref(false)
const showCityBoundary = ref(false)
const showCountyBoundary = ref(true)
const currentBaseMap = ref('default') // 'default', 'terrain', 'satellite'

// 温度色卡配置
const heatmapStops = ref([
  { temp: -10, color: '#0000ff' },
  { temp: 0, color: '#00ffff' },
  { temp: 10, color: '#00ff00' },
  { temp: 20, color: '#ffff00' },
  { temp: 30, color: '#ff8000' },
  { temp: 40, color: '#ff0000' }
])

const goToHome = () => {
  router.push('/')
}

const resetView = () => {
  if (map.value) {
    console.log(fixedZoom.value)
    map.value.setCenter(fixedCenter.value as [number, number])
    map.value.setZoom(fixedZoom.value)
  }
}

const toggleLabels = () => {
  if (!map.value) return

  showLabels.value = !showLabels.value

  if (showLabels.value) {
    // 显示地名标签
    console.log('显示地名标签')
    // 检查是否已经添加了地名图层
    if (!map.value.getLayer('place-labels')) {

      // 添加地名标签图层
      map.value.addLayer({
        id: 'place-labels',
        type: 'symbol',
        source: 'province-boundary-tiles',
        'source-layer': 'province_boundary',
        layout: {
          'text-field': ['get', 'name'], // 使用 name 字段作为地名
          'text-size': 12,
          'text-anchor': 'center',
          'text-justify': 'center',
          'text-allow-overlap': false,
          'text-ignore-placement': false,
          'text-font': ['Open Sans', 'Arial', 'sans-serif'] // 设置字体
        },
        paint: {
          'text-color': '#333',
          'text-halo-color': '#fff',
          'text-halo-width': 1
        }
      })
    }
  } else {
    // 隐藏地名标签
    console.log('隐藏地名标签')
    if (map.value.getLayer('place-labels')) {
      map.value.removeLayer('place-labels')
    }
  }
}

const toggleHeatmap = () => {
  if (!map.value) return

  showHeatmap.value = !showHeatmap.value

  if (showHeatmap.value) {
    console.log('显示温度图')
    // 检查是否已经添加了温度数据源
    if (!map.value.getSource('temperature-data')) {
      // 数据源不存在，添加数据源和图层
      addTemperatureLayer()
    } else {
      // 数据源已存在，检查图层是否存在
      if (!map.value.getLayer('temperature-heatmap')) {
        // 只添加图层，不重新添加数据源
        addTemperatureLayerOnly()
      }
    }
  } else {
    console.log('隐藏温度图')
    if (map.value.getLayer('temperature-heatmap')) {
      map.value.removeLayer('temperature-heatmap')
    }
  }
}

const toggleCityBoundary = () => {
  if (!map.value) return

  showCityBoundary.value = !showCityBoundary.value

  if (showCityBoundary.value) {
    console.log('只显示市界')
    // 显示市界填充图层
    if (map.value.getLayer('city-boundary-fill')) {
      map.value.setLayoutProperty('city-boundary-fill', 'visibility', 'visible')
    }
  } else {
    console.log('隐藏市界填充图层')
    // 隐藏市界填充图层
    if (map.value.getLayer('city-boundary-fill')) {
      map.value.setLayoutProperty('city-boundary-fill', 'visibility', 'none')
    }
  }
}

const toggleCountyBoundary = () => {
  if (!map.value) return

  showCountyBoundary.value = !showCountyBoundary.value

  if (showCountyBoundary.value) {
    console.log('只显示县界')
    // 显示县界填充图层
    if (map.value.getLayer('county-boundary-fill')) {
      map.value.setLayoutProperty('county-boundary-fill', 'visibility', 'visible')
    }
  } else {
    console.log('隐藏县界')
    if (map.value.getLayer('county-boundary-fill')) {
      map.value.setLayoutProperty('county-boundary-fill', 'visibility', 'none')
    }
  }
}


const switchBaseMap = (mapType: string) => {
  if (!map.value) return

  const oldMapType = currentBaseMap.value
  currentBaseMap.value = mapType

  // 如果切换到相同的地图类型，不做任何操作
  if (oldMapType === mapType) return

  // 移除旧的底图图层
  if (oldMapType !== 'default') {
    const oldLayerId = `${oldMapType}-basemap`
    if (map.value.getLayer(oldLayerId)) {
      map.value.removeLayer(oldLayerId)
    }
    const oldSourceId = `${oldMapType}-source`
    if (map.value.getSource(oldSourceId)) {
      map.value.removeSource(oldSourceId)
    }
  }

  // 添加新的底图
  if (mapType !== 'default') {
    const sourceId = `${mapType}-source`
    const layerId = `${mapType}-basemap`

    let sourceConfig: maplibregl.RasterSourceSpecification = {} as maplibregl.RasterSourceSpecification
    let layerConfig: maplibregl.RasterLayerSpecification = {} as maplibregl.RasterLayerSpecification

    switch (mapType) {
      case 'terrain':
        // 使用OpenStreetMap地形图
        sourceConfig = {
          type: 'raster',
          tiles: [
            'https://tile.opentopomap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
        }
        layerConfig = {
          id: layerId,
          type: 'raster',
          source: sourceId,
          minzoom: 0,
          maxzoom: 17,
          paint: {
            'raster-opacity': 0.7  // 设置透明度，让默认地图仍部分可见
          }
        }
        break

      case 'satellite':
        // 使用ESRI卫星图
        sourceConfig = {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: '© Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }
        layerConfig = {
          id: layerId,
          type: 'raster',
          source: sourceId,
          minzoom: 0,
          maxzoom: 18,
          paint: {
            'raster-opacity': 0.9  // 卫星图稍微透明，让部分默认地图可见
          }
        }
        break
    }

    // 添加数据源
    map.value.addSource(sourceId, sourceConfig)

    // 添加到底图下方（作为最底层）
    const firstSymbolLayer = map.value.getStyle().layers.find(layer => layer.type === 'symbol')
    const beforeLayer = firstSymbolLayer ? firstSymbolLayer.id : undefined

    map.value.addLayer(layerConfig, beforeLayer)

    console.log(`Switched to ${mapType} map`)
  } else {
    console.log('Switched to default map')
    // 不自动改变边界图层的可见性，保持用户之前的设置
  }
}

// // 隐藏所有图层的辅助函数
// const hideAllLayers = () => {
//   if (!map.value) return

//   const layersToHide = [
//     'country-boundary-fill',
//     'province-boundary-fill',
//     'city-boundary-fill',
//     'county-boundary-fill',
//     'place-labels',
//     'temperature-heatmap'
//   ]

//   layersToHide.forEach(layerId => {
//     if (map.value.getLayer(layerId)) {
//       map.value.setLayoutProperty(layerId, 'visibility', 'none')
//     }
//   })
// }

// // 显示所有图层的辅助函数
// const showAllLayers = () => {
//   if (!map.value) return

//   // 显示填充图层
//   const fillLayers = ['city-boundary-fill', 'county-boundary-fill']
//   fillLayers.forEach(layerId => {
//     if (map.value.getLayer(layerId)) {
//       map.value.setLayoutProperty(layerId, 'visibility', 'visible')
//     }
//   })

//   // 根据状态显示其他图层
//   if (showLabels.value && map.value.getLayer('place-labels')) {
//     map.value.setLayoutProperty('place-labels', 'visibility', 'visible')
//   }
//   if (showHeatmap.value && map.value.getLayer('temperature-heatmap')) {
//     map.value.setLayoutProperty('temperature-heatmap', 'visibility', 'visible')
//   }
// }

// 生成河北省范围内的模拟温度数据
const generateHebeiTemperatureData = (): GeoJSON.FeatureCollection => {
  const features: GeoJSON.Feature[] = []

  // 河北省大致边界坐标范围
  const bounds = {
    west: 113.0,
    east: 119.9,
    south: 36.0,
    north: 42.6
  }

  // 生成网格点数据
  const gridSize = 0.1 // 网格大小（度）
  for (let lng = bounds.west; lng <= bounds.east; lng += gridSize) {
    for (let lat = bounds.south; lat <= bounds.north; lat += gridSize) {
      // 模拟温度数据：纬度越高温度越低，经度影响较小
      const baseTemp = 25 - (lat - bounds.south) * 2 + Math.random() * 10 - 5
      const temperature = Math.max(-10, Math.min(40, baseTemp))

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        properties: {
          temperature: temperature
        }
      } as GeoJSON.Feature)
    }
  }

  return {
    type: 'FeatureCollection',
    features: features
  }
}

const addTemperatureSource = () => {
  if (!map.value) return

  // 添加温度数据源
  const temperatureData = generateHebeiTemperatureData()
  map.value.addSource('temperature-data', {
    type: 'geojson',
    data: temperatureData
  })
}

const addTemperatureLayerOnly = () => {
  if (!map.value) return

  // 添加温度热力图层
  map.value.addLayer({
    id: 'temperature-heatmap',
    type: 'circle',
    source: 'temperature-data',
    paint: {
      'circle-radius': 8,
      'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'temperature'],
        -10, '#0000ff',
        0, '#00ffff',
        10, '#00ff00',
        20, '#ffff00',
        30, '#ff8000',
        40, '#ff0000'
      ],
      'circle-opacity': 0.7,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-opacity': 0.5
    }
  })
}

const addTemperatureLayer = () => {
  if (!map.value) return

  addTemperatureSource()
  addTemperatureLayerOnly()
}

const initMap = () => {
  if (!mapContainer.value) return

  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {},
      layers: []
    },
    center: center.value as [number, number],
    zoom: zoom.value,
    pitch: 0,
    bearing: 0,
    doubleClickZoom: false // 禁用双击放大功能
  })

  // 监听地图事件
  map.value.on('load', () => {
    console.log('Map loaded successfully')

    // 添加省界边界数据图层
    map.value.addSource('province-boundary-tiles', {
      type: 'vector',
      url: 'http://192.168.176.7:3000/province_boundary'
    })

    // 添加市界边界数据图层
    map.value.addSource('city-boundary-tiles', {
      type: 'vector',
      url: 'http://192.168.176.7:3000/city_boundary'
    })

    // 添加县界边界数据图层
    map.value.addSource('county-boundary-tiles', {
      type: 'vector',
      url: 'http://192.168.176.7:3000/county_boundary'
    })

    // 添加市界边界填充图层（默认隐藏，只显示石家庄市）
    map.value.addLayer({
      id: 'city-boundary-fill',
      type: 'fill',
      source: 'city-boundary-tiles',
      'source-layer': 'city_boundary',
      filter: ['==', ['get', 'name'], '石家庄市'],  // 只显示石家庄市
      layout: {
        'visibility': 'none'  // 默认隐藏填充，只显示边界线条
      },
      paint: {
        'fill-color': 'rgba(100, 149, 237, 0.2)',  // 淡蓝色填充
        'fill-outline-color': 'rgba(70, 130, 180, 0.8)'  // 钢蓝色边框
      }
    })

    // 添加县界边界填充图层（默认隐藏）
    map.value.addLayer({
      id: 'county-boundary-fill',
      type: 'fill',
      source: 'county-boundary-tiles',
      'source-layer': 'county_boundary',
      layout: {
        'visibility': 'none'  // 默认隐藏填充，只显示边界线条
      },
      paint: {
        'fill-color': 'rgba(100, 149, 237, 0.2)',  // 淡蓝色填充
        'fill-outline-color': 'rgba(70, 130, 180, 0.8)'  // 钢蓝色边框
      }
    })

    // // 添加边界线条图层（默认只显示河北省）
    // map.value.addLayer({
    //   id: 'boundary-line',
    //   type: 'line',
    //   source: 'boundary-tiles',
    //   'source-layer': 'boundary',
    //   filter: ['==', ['get', 'name'], '河北省'],  // 只显示河北省边界
    //   paint: {
    //     'line-color': 'rgba(25, 25, 112, 0.9)',  // 深蓝色线条
    //     'line-width': 0.5
    //   }
    // })

    // 地图加载完成后初始化图层可见性
    initLayer()

  })

  map.value.on('move', () => {
    if (map.value) {
      zoom.value = map.value.getZoom()
      const mapCenter = map.value.getCenter()
      center.value = [mapCenter.lng, mapCenter.lat]
    }
  })

  map.value.on('error', (e) => {
    console.error('Map error:', e)
  })
}

const initLayer = () => {
  console.log('Initializing layer visibility...')

  if (!map.value) {
    console.log('Map not ready')
    return
  }

  const allLayers = [
    { 'layer': 'city-boundary-fill', visibility: false },
    { 'layer': 'county-boundary-fill', visibility: true },
    { 'layer': 'place-labels', visibility: false },
    { 'layer': 'temperature-heatmap', visibility: false },
  ]

  allLayers.forEach(item => {
    if (map.value.getLayer(item.layer)) {
      try {
        // 设置图层可见性
        map.value.setLayoutProperty(
          item.layer,
          'visibility',
          item.visibility ? 'visible' : 'none'
        )
        console.log(`Set ${item.layer} visibility: ${item.visibility ? 'visible' : 'none'}`)
      } catch (error) {
        console.error(`Error setting layer ${item.layer}:`, error)
      }
    } else {
      console.warn(`Layer ${item.layer} not found`)
    }
  })
}

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
})
</script>

<style lang="scss" scoped>
.container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;


  .container-left {
    position: absolute;
    left: 10px;
    top: 10px;
    width: 280px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;

    .map-controls {
      h3 {
        margin: 0 0 10px 0;
        color: #333;
        font-size: 14px;
        font-weight: 600;
      }

      .control-item {
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }

        label {
          display: block;
          font-size: 12px;
          color: #666;
          margin-bottom: 3px;
          line-height: 1.3;
        }

        .el-button {
          width: 100%;
          font-size: 12px;
          padding: 6px 12px;
        }

        .basemap-buttons {
          display: flex;
          gap: 4px;
          width: 100%;

          .el-button {
            flex: 1;
            width: auto;
            min-width: 0;
            font-size: 11px;
            padding: 4px 8px;
          }
        }
      }
    }

    .heatmap-legend {
      margin-top: 15px;
      padding: 10px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 6px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);

      h4 {
        margin: 0 0 8px 0;
        font-size: 12px;
        font-weight: 600;
        color: #333;
        text-align: center;
      }

      .legend-scale {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .legend-colors {
          display: flex;
          height: 12px;
          border-radius: 2px;
          overflow: hidden;

          .color-stop {
            flex: 1;
            height: 100%;
          }
        }

        .legend-labels {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #666;

          span {
            flex: 1;
            text-align: center;
          }
        }
      }
    }

    // 气象面板样式已被移除，改为弹窗显示
  }

  .container-right {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;

    .map-container {
      width: 100%;
      height: 100%;
    }
  }
}

// MapLibre 样式覆盖
:deep(.maplibregl-map) {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
}

:deep(.maplibregl-ctrl-bottom-left),
:deep(.maplibregl-ctrl-bottom-right) {
  display: none;
}


// 防止全局滚动条
:global(body) {
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

:global(html) {
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100%;
}
</style>
