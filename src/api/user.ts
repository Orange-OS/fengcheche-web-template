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
 * 新增用户
 */
export function addUser(data: UserForm) {
  return request<void>({
    url: '/system/user',
    method: 'post',
    data,
  })
}

/**
 * 更新用户
 */
export function updateUser(id: number, data: UserForm) {
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
