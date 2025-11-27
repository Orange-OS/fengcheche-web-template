import request from '@/utils/request';

// 角色列表接口参数类型
export interface RoleListQuery {
  name?: string
  code?: string
}

// 角色分页接口参数类型
export interface RolePageQuery {
  name?: string
  code?: string
  pageNum: number    // 当前页码
  pageSize: number   // 每页条数
}

// 分页响应类型
export interface PageResponse<T> {
  records: T[]
  total: number
}

// 角色数据类型
export interface SystemRole {
  id: number
  name: string
  code: string
  description: string
  status: number
  sort: number
}

// 创建角色参数类型
export interface SystemRoleCreate {
  name: string
  code: string
  description: string
  status: number
  sort: number
}

/**
 * 获取角色列表
 */
export function getRoleList(params: RoleListQuery) {
  return request({
    url: '/system/role/list',
    method: 'get',
    params,
  })
}

/**
 * 获取角色分页
 */
export function getRolePage(params: RolePageQuery) {
  return request<PageResponse<SystemRole>>({
    url: '/system/role',
    method: 'get',
    params,
  })
}

/**
 * 添加角色
 */
export function addRole(data: SystemRoleCreate) {
  return request({
    url: '/system/role',
    method: 'post',
    data,
  })
}

/**
 * 修改角色
 */
export function updateRole(data: SystemRole) {
  return request({
    url: `/system/role/${data.id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除角色
 */
export function deleteRole(id: string | number) {
  return request({
    url: `/system/role/${id}`,
    method: 'delete',
  })
}


