import request from '@/utils/request';

// 权限列表接口参数类型
export interface PermissionListQuery {
  name?: string
  code?: string
}

// 权限分页接口参数类型
export interface PermissionPageQuery {
  name?: string
  code?: string
  pageNum: number    // 当前页码
  pageSize: number   // 每页条数
}

// 权限数据类型
export interface SystemPermission{
  id?: string | number
  name: string
  code: string
  description?: string
  status: number
  sort: number
}

/**
 * 获取权限列表
 */
export function getPermissionList(params: PermissionListQuery) {
  return request({
    url: '/system/permission/list',
    method: 'get',
    params,
  })
}

/**
 * 获取权限分页
 */
export function getPermissionPage(params: PermissionPageQuery) {
  return request({
    url: '/system/permission',
    method: 'get',
    params,
  })
}

/**
 * 添加权限
 */
export function addPermission(data: SystemRole) {
  return request({
    url: '/system/permission',
    method: 'post',
    data,
  })
}

/**
 * 更新权限
 */
export function updatePermission(data: SystemRole) {
  return request({
    url: `/system/permission/${data.id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除权限
 */
export function deletePermission(id: string | number) {
  return request({
    url: `/system/permission/${id}`,
    method: 'delete',
  })
}

/**
 * 更新权限状态
 */
export function updatePermissionStatus(id: number, status: number) {
  return request<void>({
    url: `/system/permission/${id}/status`,
    method: 'put',
    data: { status },
  })
}

