import request from '@/utils/request';

// 气象数据接口参数类型
export interface OpenMeteorologyDataQueryForm {
  latitude?: number
  longitude?: number
  models?: string
  forecastDays?: number
}

// 气象数据类型
export interface OpenMeteorologyData {
  latitude: number
  longitude: number
  // 实际API返回的数据字段
  elevation?: number
  timezone?: string
  timezone_abbreviation?: string
  utc_offset_seconds?: number
  generationtime_ms?: number
  hourly?: {
    time: string[]
    temperature_2m: number[]
    wind_speed_10m: number[]
    visibility: number[]
    rain: number[]
    snow_depth: number[]
    precipitation: number[]
    apparent_temperature: number[]
    dew_point_2m: number[]
    relative_humidity_2m: number[]
    cloud_cover: number[]
    cloud_cover_low: number[]
    cloud_cover_mid: number[]
    cloud_cover_high: number[]
    wind_direction_10m: number[]
    wind_gusts_10m: number[]
    snowfall: number[]
    weather_code: number[]
  }
  hourly_units?: {
    [key: string]: string
  }
}

/**
 * 获取气象数据
 */
export function getOpenMeteorologyData(data: OpenMeteorologyDataQueryForm): Promise<OpenMeteorologyData> {
  return request({
    url: '/open/meteorology/data',
    method: 'post',
    data,
  })
}
