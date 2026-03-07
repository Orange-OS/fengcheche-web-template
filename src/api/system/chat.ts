import request from '@/utils/request';

// 消息接口参数类型
export interface JsonWebSocketMessage {
  type: string
  content: string
}

// 接收消息接口参数类型
export interface SystemChatReceiveMessage {
  messageId: number
  fromUserId?: number
  text: string
}

// 发送消息接口参数类型
export interface SystemChatSendMessage {
  toUserId: number
  text: string
}


// 发送消息接口参数类型
export interface SystemChatSendMessageForm {
  toUserId: number
  content: string
  // 前端用于本地临时消息与服务端消息去重的临时ID
  tempId?: number
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
  // 可选的临时ID，前端用来消除本地临时消息和服务端回执的重复
  tempId?: number
}

export interface SystemChatGetChatHistoryVO {
  list: Array<SystemChatMessageVO>
  total: number
}

export interface SystemChatVO {
  // 对方用户ID
  peerUserId: number
  // 对方用户名
  peerUsername: string
  // 对方用户昵称
  peerNickname: string
  // 对方用户头像
  peerAvatar: string
  // 最后一条消息内容
  lastMessage: string
  // 最后一条消息时间
  lastMessageTime: string
  // 未读消息数量
  unreadCount: number
  online?: boolean
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
