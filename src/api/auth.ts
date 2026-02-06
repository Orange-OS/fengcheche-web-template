import request from '@/utils/request'
import type { LoginResponse } from '@/types/auth'
import type { MenuItem } from '@/types/menu'

export interface LoginForm {
  username: string;     // 用户名
  password: string;     // 密码
  captcha?: string;     // 验证码
  captchaUuid?: string; // 验证码唯一标识
}

export interface CaptchaVO {
  captchaUuid: string;
  captchaBase64Image: string;
}

export const getCaptcha = (): Promise<CaptchaVO> => {
  return request({
    url: '/system-captcha/generate',
    method: 'get'
  })
}

export const login = (params: LoginForm): Promise<LoginResponse> => {
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
    method: 'get'
  })
}
