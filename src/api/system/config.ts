import request from '@/utils/request';

// 配置分页接口参数类型
export interface ConfigPageQuery {
  configKey?: string
  configName?: string
  pageNum: number    // 当前页码
  pageSize: number   // 每页条数
}

// 权限数据类型
export interface SystemConfig {
  id?: number
  configKey: string
  configName: string
  configValue?: string
  remark: string
  createTime: string
  updateTime: string
}

/**
 * 获取配置分页
 */
export function getConfigPage(data: ConfigPageQuery) {
  return request({
    url: '/system/config/page',
    method: 'post',
    data,
  })
}

/**
 * 添加配置
 */
export function addConfig(data: SystemConfig) {
  return request({
    url: '/system/config',
    method: 'post',
    data,
  })
}

/**
 * 更新配置
 */
export function updateConfig(data: SystemConfig) {
  return request({
    url: `/system/config`,
    method: 'put',
    data,
  })
}

/**
 * 删除配置
 */
export function deleteConfig(id: string | number) {
  return request({
    url: `/system/config/${id}`,
    method: 'delete',
  })
}
