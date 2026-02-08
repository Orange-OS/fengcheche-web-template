import request from '@/utils/request';

// 发送消息接口参数类型
export interface SystemChatSendMessageForm {
  toUserId: number
  content: string
}

export interface SystemChatMessageVO {
  id: number
  fromUserId: number
  fromNickname: string
  fromAvatar: string
  toUserId: number
  toNickname: string
  toAvatar: string
  content: string
  sendTime: string
  isOwn?: boolean
}

export interface SystemChatGetChatHistoryVO {
  list: Array<SystemChatMessageVO>
  total: number
}

export interface SystemChatVO {
  peerUserId: number
  peerUsername: string
  peerNickname: string
  peerAvatar: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  online?: boolean
}

/**
 * 发送消息（当前登录用户 -> 指定用户）
 */
export function sendMessage(data: SystemChatSendMessageForm) {
  return request({
    url: '/system/chat/send',
    method: 'post',
    data,
  })
}

// 分页获取与某个用户的聊天记录接口参数类型
export interface SystemChatGetChatHistoryForm {
  peerUserId: number
  current: number
  size: number
}

/**
 * 分页获取与某个用户的聊天记录
 */
export function getChatHistory(params: SystemChatGetChatHistoryForm): Promise<SystemChatGetChatHistoryVO> {
  return request<SystemChatGetChatHistoryVO>({
    url: '/system/chat/history',
    method: 'get',
    params,
  })
}

/**
 * 获取当前用户的聊天列表
 */
export function getChatList(): Promise<SystemChatVO[]> {
  return request<SystemChatVO[]>({
    url: '/system/chat/list',
    method: 'get',
  })
}

/**
 * 获取当前用户未读消息数量
 */
export function getUnReadCount() {
  return request({
    url: '/system/chat/unread-count',
    method: 'get',
  })
}

export interface SystemUserVO {
  id: number
  username: string
  nickname: string
  acatar: string
  email: string
}
