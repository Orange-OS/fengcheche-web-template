import request from '@/utils/request'
import type { LoginResponse } from '@/types/auth'
import type { MenuItem } from '@/types/menu'

export const login = (params: any): Promise<LoginResponse> => {
  return request({
    url: '/system/auth/login',
    method: 'post',
    data: params,
  })
}

/**
 * 登出
 */
export function logout() {
  return request({
    url: `/system/auth/logout`,
    method: 'get',
  })
}

export const getMenuList = (): Promise<MenuItem[]> => {
  return request({
    url: '/system/auth/menu-list',
    method: 'get',
    data: {},
  })
}

export const getPermissionList = () => {
  return request({
    url: '/system/auth/permission-list',
    method: 'get',
    data: {},
  }).then((res) => res.data)
}
