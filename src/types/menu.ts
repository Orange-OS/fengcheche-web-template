export interface MenuItem {
  id: number
  name: string
  path: string
  component: string
  menuType?: string // M: 目录, C: 菜单, F: 按钮
  visible?: number // 1: 显示, 0: 隐藏
  status?: number // 1: 启用, 0: 禁用
  icon?: string
  remark?: string
  children?: MenuItem[]
  permission?: string
  parentId?: number
  sort: number
}
