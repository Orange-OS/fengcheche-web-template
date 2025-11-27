import request from '@/utils/request'

export interface SystemUserRoleVO {
  id?: number
  username: string
  nickname: string
  password?: string
  email: string
  mobile: string
  status: number
  roleIds?: (number | string)[]
}

/**
 * 获取用户角色列表
 */
export function getUserRoleList(params?: { username?: string }) {
  return request<SystemUserRoleVO[]>({
    url: '/system//user-role/list',
    method: 'get',
    params,
  })
}

export interface SystemUserRoleAddForm {
  username: string
  nickname: string
  password?: string
  email: string
  mobile: string
  status: number
  roleIds?: (number | string)[]
}

/**
 * 新增用户角色
 */
export function addUserRole(data: SystemUserRoleAddForm) {
  return request<void>({
    url: '/system/user-role',
    method: 'post',
    data,
  })
}

export interface SystemUserRoleUpdateForm extends SystemUserRoleAddForm {
  id?: number
}

/**
 * 修改用户角色
 */
export function updateUserRole(data: SystemUserRoleUpdateForm) {
  return request<void>({
    url: '/system/user-role',
    method: 'put',
    data,
  })
}
