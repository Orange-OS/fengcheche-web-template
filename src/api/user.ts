import request from '@/utils/request'

export interface UserQuery {
  page: number
  pageSize: number
  query?: string
}

export interface UserForm {
  id?: number
  username: string
  nickname: string
  password?: string
  email: string
  mobile: string
  status: number
  roleIds?: (number | string)[]
  roleNames?: string | string[]
}

export interface SystemUserCreateForm {
  username: string
  password?: string
  nickname: string
  email: string
  mobile: string
  status: number
  roleIds?: (number | string)[]
}

/**
 * 新增用户
 */
export function createUser(data: SystemUserCreateForm) {
  return request<void>({
    url: '/system/user',
    method: 'post',
    data,
  })
}

export interface SystemUserUpdateForm extends SystemUserCreateForm {
  id: number
}

/**
 * 修改用户
 */
export function updateUser(id: number, data: SystemUserUpdateForm) {
  return request<void>({
    url: `/system/user/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除用户
 */
export function deleteUser(id: number) {
  return request<void>({
    url: `/system/user/${id}`,
    method: 'delete',
  })
}

/**
 * 获取用户列表
 */
export function getUserList(params?: { username?: string }) {
  return request<UserForm[]>({
    url: '/system/user/list',
    method: 'get',
    params,
  })
}

/**
 * 获取用户详情
 */
export function getUserInfo(id: number) {
  return request<UserForm>({
    url: `/system/user/${id}`,
    method: 'get',
  })
}

/**
 * 批量删除用户
 */
export function batchDeleteUsers(ids: number[]) {
  return request<void>({
    url: '/system/user/batch',
    method: 'delete',
    data: { ids },
  })
}

/**
 * 更新用户状态
 */
export function updateUserStatus(id: number, status: number) {
  return request<void>({
    url: `/system/user/${id}/status`,
    method: 'put',
    data: { status },
  })
}

/**
 * 重置密码
 */
export function resetPassword(id: number) {
  return request<void>({
    url: `/system/user/reset-password/${id}`,
    method: 'post'
  })
}
