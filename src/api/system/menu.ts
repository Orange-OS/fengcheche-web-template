import request from '@/utils/request';

// 权限列表接口参数类型
export interface PermissionListQuery {
  name?: String
  code?: string
}

// 权限分页接口参数类型
export interface PermissionPageQuery {
  name?: String
  code?: string
  pageNum: number    // 当前页码
  pageSize: number   // 每页条数
}

// 权限数据类型
export interface SystemPermission {
  id?: string | number
  name: string
  code: string
  description?: string
  status: number
  sort: number
}

/**
 * 获取菜单列表
 */
export function getMenuList(params: PermissionListQuery) {
  return request({
    url: '/system/menu/list',
    method: 'get',
    params,
  })
}

/**
 * 获取权限分页
 */
export function getMenuPage(params: PermissionPageQuery) {
  return request({
    url: '/system/menu',
    method: 'get',
    params,
  })
}

// 根据用户ID查询菜单树
export function getMenuTreeByUserId(userId: string | number) {
  return request({
    url: `/system/menu/${userId}/menu-tree`,
    method: 'get',
  })
}


/**
 * 添加权限
 */
export function addMenu(data: SystemRole) {
  return request({
    url: '/system/menu',
    method: 'post',
    data,
  })
}

/**
 * 更新权限
 */
export function updateMenu(data: SystemRole) {
  return request({
    url: `/system/menu/${data.id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除权限
 */
export function deleteMenu(id: string | number) {
  return request({
    url: `/system/menu/${id}`,
    method: 'delete',
  })
}

/**
 * 更新权限状态
 */
export function updateMenuStatus(id: number, status: number) {
  return request<void>({
    url: `/system/menu/${id}/status`,
    method: 'put',
    data: { status },
  })
}

