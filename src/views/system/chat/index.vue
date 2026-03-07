<template>
  <div class="chat-container">
    <!-- 左侧聊天列表 -->
    <div class="chat-list">
      <h3>聊天列表
        <el-badge v-if="totalUnreadCount > 0" :value="totalUnreadCount" class="total-unread-badge" />
        <el-button type="primary" size="small" @click="showUserDialog = true" style="float: right; margin-left: 10px;">
          发起聊天
        </el-button>
      </h3>
      <el-input v-model="searchText" placeholder="搜索聊天" clearable class="search-input" />
      <el-scrollbar height="calc(100vh - 140px)">
        <div class="chat-item" v-for="chat in filteredChats" :key="chat.peerUserId" @click="selectChat(chat)"
          :class="{ active: selectedChat?.peerUserId === chat.peerUserId }">
          <el-avatar :size="32" :src="chat.peerAvatar">{{ chat.peerNickname?.charAt(0) }}</el-avatar>
          <div class="chat-info">
            <div class="name">{{ chat.peerNickname }}</div>
            <div class="last-message" v-if="chat.lastMessage">{{ chat.lastMessage }}</div>
            <div class="last-message-time" v-if="chat.lastMessageTime">{{ formatTime(chat.lastMessageTime) }}</div>
          </div>
          <div class="unread-count" v-if="chat.unreadCount > 0">{{ chat.unreadCount }}</div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 右侧聊天区域 -->
    <div class="chat-area">
      <template v-if="selectedChat">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <el-avatar :size="40" :src="selectedChat.peerAvatar">{{ selectedChat.peerUsername?.charAt(0) }}</el-avatar>
          <div class="user-info">
            <div class="name">{{ selectedChat.peerNickname }}</div>
            <div class="status" :class="{ online: selectedChat.online }">{{ selectedChat.online ? '在线' : '离线' }}</div>
          </div>
        </div>

        <!-- 消息列表 -->
        <div class="messages-container">
          <el-scrollbar ref="scrollbarRef" height="100%" @scroll="handleScroll">
            <div class="messages-list">
              <!-- 加载更多提示 -->
              <div v-if="loadingHistory && hasMoreHistory" class="loading-more">
                <el-icon class="is-loading">
                  <Loading />
                </el-icon>
                加载更多...
              </div>
              <!-- 没有更多历史记录提示 -->
              <div v-else-if="!hasMoreHistory && messages.length > 0" class="no-more">
                没有更多了
              </div>
              <div v-for="message in messages" :key="message.id" class="message-item"
                :class="{ 'message-own': message.fromUserId === currentUserId }">
                <el-avatar :src="message.fromAvatar" v-if="!message.isOwn" :size="32">{{
                  message.fromNickname?.charAt(0) }}</el-avatar>
                <div class="message-content">
                  <div class="message-bubble" :class="{ 'message-own-bubble': message.isOwn }">
                    <div class="message-text">{{ message.content }}</div>
                    <div class="message-time">{{ formatTime(message.sendTime) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>

        <!-- 输入框区域 -->
        <div class="input-area">
          <div class="input-wrapper">
            <el-input v-model="newMessage" type="textarea" :rows="3" placeholder="输入消息..." resize="none"
              @keydown.enter.exact.prevent="sendMessage" @keydown.enter.shift.exact="newMessage += '\n'" />
            <el-button type="primary" :disabled="!newMessage.trim()" @click="sendMessage" class="send-button">
              发送
            </el-button>
          </div>
        </div>
      </template>

      <!-- 未选择用户时的提示 -->
      <div v-else class="no-selection">
        <el-empty description="请选择一个用户开始聊天" />
      </div>
    </div>

    <!-- 发起聊天用户选择对话框 -->
    <el-dialog v-model="showUserDialog" title="选择聊天用户" width="600px" :before-close="handleUserDialogClose">
      <div class="user-select-dialog">
        <el-input v-model="userSearchText" placeholder="搜索用户" clearable class="user-search-input">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>

        <el-scrollbar height="400px" class="user-list-scroll">
          <div v-for="user in filteredUsers" :key="user.id" class="user-select-item" @click="selectUserToChat(user)">
            <el-avatar :size="40" :src="user.avatar">{{ user.nickname?.charAt(0) }}</el-avatar>
            <div class="user-select-info">
              <div class="user-name">{{ user.nickname }}</div>
              <div class="user-email" v-if="user.email">{{ user.email }}</div>
            </div>
            <el-button type="primary" size="small" @click.stop="selectUserToChat(user)">
              发起聊天
            </el-button>
          </div>
        </el-scrollbar>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// ========== 依赖导入 ==========
import {
  getChatHistory,
  getChatList,
  getUnReadCount,
  type SystemChatGetChatHistoryForm,
  type SystemChatGetChatHistoryVO,
  type SystemChatMessageVO,
  type SystemChatReceiveMessage,
  type SystemChatSendMessage,
  type JsonWebSocketMessage,
  type SystemChatVO
} from '@/api/system/chat'
import { getUserList } from '@/api/user'
import { useTokenStore } from '@/stores/token'
import { useUserInfoStore } from '@/stores/userInfo'
import { Loading, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

// ========== 类型定义 ==========
interface User {
  id?: number
  username?: string
  nickname?: string
  avatar?: string
  email?: string
}

// ========== Store ==========
const userStore = useUserInfoStore()
const tokenStore = useTokenStore()

// ========== 聊天列表状态 ==========
const chats = ref<SystemChatVO[]>([])
const selectedChat = ref<SystemChatVO | null>(null)
const searchText = ref('')
const totalUnreadCount = ref(0)

// ========== 消息区域状态 ==========
const messages = ref<SystemChatMessageVO[]>([])
const newMessage = ref('')
const scrollbarRef = ref()
const loadingHistory = ref(false)
const currentPage = ref(1)
const hasMoreHistory = ref(true)
const pageSize = 20

// ========== 用户选择对话框状态 ==========
const showUserDialog = ref(false)
const userSearchText = ref('')
const allUsers = ref<User[]>([])
const loadingChatUsers = ref(false)

// ========== WebSocket 状态 ==========
let websocket: WebSocket | null = null
const heartBeatTimer = ref<NodeJS.Timeout | null>(null)
const reconnectTimer = ref<NodeJS.Timeout | null>(null)
const timeoutTimer = ref<NodeJS.Timeout | null>(null)
const HEART_BEAT_INTERVAL = 5000
const RECONNECT_INTERVAL = 3000
const TIMEOUT_THRESHOLD = 10000

// ========== 计算属性 ==========
const currentUserId = computed(() => userStore.userInfo?.id)

const filteredChats = computed(() => {
  if (!searchText.value) return chats.value
  const keyword = searchText.value.toLowerCase()
  return chats.value.filter(chat => chat.peerUsername.toLowerCase().includes(keyword))
})

const filteredUsers = computed(() => {
  if (!userSearchText.value) return allUsers.value
  const keyword = userSearchText.value.toLowerCase()
  return allUsers.value.filter(user =>
    user.username?.toLowerCase().includes(keyword) ||
    user.email?.toLowerCase().includes(keyword)
  )
})

// ========== 工具函数 ==========
const formatTime = (time: string) => {
  const date = new Date(time)
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}

// ========== 用户选择对话框 ==========
const loadChatUsers = async () => {
  try {
    loadingChatUsers.value = true
    const response = await getUserList()
    allUsers.value = response
      .filter(user => user.id !== currentUserId.value)
      .map((user: User) => ({
        id: user.id,
        username: user.username,
        nickname: user.nickname || '未知用户',
        avatar: user.avatar,
        email: user.email
      }))
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    loadingChatUsers.value = false
  }
}

const selectUserToChat = async (user: User) => {
  try {
    const existingChat = chats.value.find(chat => chat.peerUserId === user.id)
    if (existingChat) {
      await selectChat(existingChat)
    } else {
      const newChat: SystemChatVO = {
        peerUserId: user.id,
        peerUsername: user.username,
        peerNickname: user.nickname,
        peerAvatar: user.avatar || '',
        lastMessage: '',
        lastMessageTime: '',
        unreadCount: 0,
        online: Math.random() > 0.5
      }
      chats.value.unshift(newChat)
      await selectChat(newChat)
    }

    showUserDialog.value = false
    userSearchText.value = ''
    ElMessage.success(`已与 ${user.nickname} 发起聊天`)
  } catch (error) {
    console.error('发起聊天失败:', error)
    ElMessage.error('发起聊天失败')
  }
}

const handleUserDialogClose = () => {
  showUserDialog.value = false
  userSearchText.value = ''
}

// ========== 聊天会话相关 ==========
const selectChat = async (chat: SystemChatVO) => {
  selectedChat.value = chat
  const previousUnreadCount = chat.unreadCount ?? 0
  chat.unreadCount = 0
  totalUnreadCount.value = Math.max(0, totalUnreadCount.value - previousUnreadCount)

  // 切换聊天时重置分页状态
  currentPage.value = 1
  hasMoreHistory.value = true

  // 加载聊天历史（加载完成后内部会调用scrollToBottom）
  await loadChatHistory(chat.peerUserId, currentPage.value)
}

const loadChatHistory = async (peerUserId: number, page = 1) => {
  if (loadingHistory.value || !hasMoreHistory.value) return

  try {
    loadingHistory.value = true
    const params: SystemChatGetChatHistoryForm = {
      peerUserId,
      current: page,
      size: pageSize
    }
    const response = await getChatHistory(params) as SystemChatGetChatHistoryVO
    const newMessages = response.list.map((msg) => ({
      ...msg,
      isOwn: msg.fromUserId === currentUserId.value
    }))

    let preScrollHeight = 0
    if (scrollbarRef.value && page > 1) {
      preScrollHeight = scrollbarRef.value.wrapRef.scrollHeight
    }

    if (page === 1) {
      messages.value = newMessages.reverse()
      hasMoreHistory.value = newMessages.length >= pageSize
      // 修复：第一页加载完成后强制滚到底
      scrollToBottom()
    } else {
      if (newMessages.length === 0) {
        hasMoreHistory.value = false
      } else {
        messages.value = [...newMessages.reverse(), ...messages.value]
        hasMoreHistory.value = newMessages.length >= pageSize
      }

      // 调整滚动位置
      nextTick(() => {
        if (scrollbarRef.value) {
          const wrapEl = scrollbarRef.value.wrapRef
          wrapEl.scrollTop = wrapEl.scrollHeight - preScrollHeight
        }
      })
    }
  } catch (error) {
    console.error('加载聊天历史失败:', error)
    ElMessage.error('加载聊天历史失败')
    if (page > 1) {
      currentPage.value--
    }
  } finally {
    loadingHistory.value = false
  }
}

// 消息滚动
const scrollToBottom = () => {
  if (!scrollbarRef.value) return
  nextTick(() => {
    nextTick(() => {
      setTimeout(() => {
        if (scrollbarRef.value) {
          const { wrapRef } = scrollbarRef.value
          scrollbarRef.value.setScrollTop(Math.max(0, wrapRef.scrollHeight + 20))
        }
      }, 50)
    })
  })
}

// 消息发送
const sendMessage = async () => {
  const messageContent = newMessage.value.trim()
  const chat = selectedChat.value
  if (!messageContent || !chat) return

  const tempId = Date.now()
  const sendTime = new Date().toISOString()

  const content = {
    toUserId: chat.peerUserId,
    text: messageContent,
    tempId
  }

  const messageData: JsonWebSocketMessage = {
    type: 'system-chat-send',
    content: JSON.stringify(content)
  }

  newMessage.value = ''

  const userId = currentUserId.value ?? 0
  const tempMessage: SystemChatMessageVO = {
    id: tempId,
    fromUserId: userId,
    fromNickname: userStore.userInfo?.username ?? '',
    fromAvatar: userStore.userInfo?.avatar ?? '',
    toUserId: chat.peerUserId,
    toNickname: chat.peerNickname,
    toAvatar: chat.peerAvatar,
    content: messageContent,
    sendTime,
    isOwn: true,
    tempId
  }
  messages.value.push(tempMessage)

  chat.lastMessage = messageContent
  chat.lastMessageTime = sendTime
  const chatItem = chats.value.find(c => c.peerUserId === chat.peerUserId)
  if (chatItem) {
    chatItem.lastMessage = messageContent
    chatItem.lastMessageTime = sendTime
  }

  scrollToBottom()

  try {
    if (websocket?.readyState === WebSocket.OPEN) {
      console.log('发送消息：', messageData)
      websocket.send(JSON.stringify(messageData))
    } else {
      ElMessage.warning('WebSocket未连接')
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败')
  }
}

const handleScroll = () => {
  if (!scrollbarRef.value || !selectedChat.value) return

  const wrapEl = scrollbarRef.value.wrapRef
  // 触顶判定（留10px缓冲，避免误触发）
  if (wrapEl.scrollTop <= 10 && hasMoreHistory.value && !loadingHistory.value) {
    currentPage.value++
    loadChatHistory(selectedChat.value.peerUserId, currentPage.value)
  }
}

// ========== WebSocket ==========
const sendHeartBeat = () => {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    console.log('发送心跳 ping')
    websocket.send('ping')
    timeoutTimer.value = setTimeout(() => {
      console.warn('心跳超时，断开WebSocket连接')
      if (websocket) {
        websocket.close()
      }
    }, TIMEOUT_THRESHOLD)
  }
}

const clearAllTimers = () => {
  if (heartBeatTimer.value) {
    clearInterval(heartBeatTimer.value)
    heartBeatTimer.value = null
  }
  if (timeoutTimer.value) {
    clearTimeout(timeoutTimer.value)
    timeoutTimer.value = null
  }
  if (reconnectTimer.value) {
    clearTimeout(reconnectTimer.value)
    reconnectTimer.value = null
  }
}

const reconnectWebSocket = () => {
  if (reconnectTimer.value) return

  console.log(`${RECONNECT_INTERVAL / 1000}秒后尝试重连WebSocket...`)
  reconnectTimer.value = setTimeout(() => {
    initWebSocket()
  }, RECONNECT_INTERVAL)
}

const initWebSocket = () => {
  clearAllTimers()

  if (websocket) {
    websocket.close()
    websocket = null
  }

  const userId = currentUserId.value || 1
  const token = tokenStore.token || ''
  const wsUrl = `ws://localhost:8080/fengcheche/ws/chat?userId=${userId}&token=${token}`

  try {
    websocket = new WebSocket(wsUrl)

    websocket.onopen = () => {
      console.log('WebSocket 连接成功')
      ElMessage.success('WebSocket 连接成功')
      heartBeatTimer.value = setInterval(sendHeartBeat, HEART_BEAT_INTERVAL)
      if (reconnectTimer.value) {
        clearTimeout(reconnectTimer.value)
        reconnectTimer.value = null
      }
    }

    websocket.onmessage = (event) => {
      try {
        const rawData = event.data.trim()
        if (rawData === 'pong') {
          console.log('收到心跳响应 pong')
          if (timeoutTimer.value) {
            clearTimeout(timeoutTimer.value)
            timeoutTimer.value = null
          }
          return
        }

        const data = JSON.parse(rawData)
        console.log('接收到新消息：', rawData)
        handleWebSocketMessage(data)
      } catch (error) {
        console.error('解析 WebSocket 消息失败:', error)
      }
    }

    websocket.onerror = (error) => {
      console.error('WebSocket 连接错误:', error)
      ElMessage.error('WebSocket 连接异常')
    }

    websocket.onclose = (event) => {
      console.log('WebSocket 连接关闭，状态码：', event.code, '原因：', event.reason)
      clearAllTimers()
      if (event.code !== 1000) {
        ElMessage.warning('WebSocket 连接已断开，将自动尝试重连')
        reconnectWebSocket()
      }
    }
  } catch (error) {
    console.error('创建WebSocket连接失败:', error)
    ElMessage.error('创建WebSocket连接失败')
    reconnectWebSocket()
  }
}

const handleWebSocketMessage = (message: JsonWebSocketMessage) => {
  if (!message) return

  const type = message.type as string

  if (type === 'system-chat-receive') {
    const systemChatReceiveMessage = JSON.parse(message.content) as SystemChatReceiveMessage
    handleReceiveMessage(systemChatReceiveMessage)
    if (websocket?.readyState === WebSocket.OPEN) {
      const ack: JsonWebSocketMessage = {
        type: 'system-chat-receive',
        content: message.content
      }
      console.log('发送消息确认消息：', ack)
      websocket.send(JSON.stringify(ack))
    }
    return
  }

  if (type === 'system-chat-send' || !type) {
    const systemChatSendMessage = JSON.parse(message.content) as SystemChatSendMessage
    handleSendMessage(systemChatSendMessage)
  }
}

const handleReceiveMessage = (message: SystemChatReceiveMessage) => {
  console.log('全部消息：', messages.value)
}

const handleSendMessage = (message: SystemChatSendMessage) => {
  if (!message.fromUserId || !message.toUserId || !message.content) {
    return
  }

  // 查找本地临时消息并替换（如果存在）
  const tempMsgIndex = messages.value.findIndex(m => {
    // 优先使用 tempId 精确匹配
    if (message.tempId && m.id === message.tempId) {
      return true
    }
    // 兜底：对自己发出的消息，按发件人 + 收件人 + 内容去重（忽略时间差）
    if (m.isOwn && message.fromUserId === currentUserId.value) {
      return (
        m.fromUserId === message.fromUserId &&
        m.toUserId === message.toUserId &&
        m.content === message.content
      )
    }
    return false
  })

  const sendTime = message.sendTime || new Date().toISOString()
  const isOwn = message.fromUserId === currentUserId.value

  const newMsg: SystemChatMessageVO = {
    id: message.id || message.tempId || Date.now(),
    fromUserId: message.fromUserId,
    fromNickname: message.fromNickname || '',
    fromAvatar: message.fromAvatar || '',
    toUserId: message.toUserId,
    toNickname: message.toNickname || '',
    toAvatar: message.toAvatar || '',
    content: message.content,
    sendTime,
    isOwn,
    tempId: message.tempId
  }

  if (tempMsgIndex !== -1) {
    // 替换之前的临时消息
    messages.value.splice(tempMsgIndex, 1, newMsg)
  } else {
    // 添加新消息
    messages.value.push(newMsg)
  }

  // 滚动到底部（当前聊天 && 收到的是对方消息时）
  const currentPeerId = selectedChat.value?.peerUserId
  const peerUserId = isOwn ? message.toUserId : message.fromUserId
  if (peerUserId === currentPeerId) {
    scrollToBottom()
  }

  // 更新聊天列表中的最后消息和未读数
  const chat = chats.value.find(c => c.peerUserId === peerUserId)
  if (chat && message.content) {
    chat.lastMessage = message.content
    chat.lastMessageTime = sendTime

    // 只有“别人发给我”的消息，并且当前没有打开该会话时才计入未读
    if (!isOwn && peerUserId !== currentPeerId) {
      chat.unreadCount = (chat.unreadCount || 0) + 1
      totalUnreadCount.value += 1
    }
  }
}

// ========== 数据加载 ==========
const loadUnreadCount = async () => {
  try {
    const response = await getUnReadCount() as { data?: number; total?: number }
    totalUnreadCount.value = response.data || response.total || 0
  } catch (error) {
    console.error('获取未读消息数量失败:', error)
  }
}

const loadChats = async () => {
  try {
    const response = await getChatList()
    chats.value = response || []
    chats.value = chats.value.map((chat: SystemChatVO) => ({
      peerUserId: chat.peerUserId || 0,
      peerUsername: chat.peerUsername || '未知',
      peerNickname: chat.peerNickname || '未知',
      peerAvatar: chat.peerAvatar || '',
      lastMessage: chat.lastMessage || '',
      lastMessageTime: chat.lastMessageTime || '',
      unreadCount: chat.unreadCount ?? 0,
      online: chat.online ?? Math.random() > 0.5
    }))
  } catch (error) {
    console.error('加载聊天列表失败:', error)
    ElMessage.error('加载聊天列表失败')
  }
}

// ========== 生命周期 ==========
onMounted(async () => {
  try {
    await Promise.all([loadChats(), loadUnreadCount(), loadChatUsers()])
  } catch (error) {
    console.error('onMounted 中发生错误:', error)
  }

  initWebSocket()
})

watch(showUserDialog, (newVal) => {
  if (newVal && allUsers.value.length === 0) {
    loadChatUsers()
  }
})

onUnmounted(() => {
  clearAllTimers()
  if (websocket) {
    websocket.close(1000, '组件卸载')
    websocket = null
  }
})
</script>

<style scoped lang="scss">
.chat-container {
  display: flex;
  height: 100%;
  background-color: #f5f5f5;
  overflow: hidden;

  .chat-list {
    width: 300px;
    background: white;
    border-right: 1px solid #e6e6e6;
    display: flex;
    flex-direction: column;

    h3 {
      padding: 16px;
      margin: 0;
      border-bottom: 1px solid #e6e6e6;
      font-size: 16px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .total-unread-badge {
        margin-left: auto;
      }
    }

    .search-input {
      width: 250px;
      margin: 12px 16px;
    }

    .chat-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid #f8f8f8;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f8f8f8;
      }

      &.active {
        background-color: #e3f2fd;
        border-right: 3px solid #1976d2;
      }

      .chat-info {
        flex: 1;
        margin-left: 12px;

        .name {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .last-message {
          font-size: 12px;
          color: #666;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 2px;
        }

        .last-message-time {
          font-size: 11px;
          color: #999;
        }
      }

      .unread-count {
        background: #f44336;
        color: white;
        border-radius: 10px;
        padding: 2px 6px;
        font-size: 12px;
        min-width: 20px;
        text-align: center;
      }
    }
  }

  .chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: white;

    .chat-header {
      display: flex;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e6e6e6;
      background: #fafafa;

      .user-info {
        margin-left: 12px;

        .name {
          font-weight: 500;
          font-size: 16px;
        }

        .status {
          font-size: 12px;
          color: #666;

          &.online {
            color: #4caf50;
          }
        }
      }
    }

    .messages-container {
      flex: 1;
      overflow: hidden;

      .messages-list {
        padding: 16px;
        // 给底部预留空间，避免最后一条消息被输入框遮住
        padding-bottom: 80px;

        .loading-more {
          text-align: center;
          padding: 8px 0;
          color: #666;
          margin-bottom: 16px;
        }

        .no-more {
          text-align: center;
          padding: 8px 0;
          color: #999;
          margin-bottom: 16px;
          font-size: 12px;
        }

        // 核心修复：自己消息显示不全的样式调整
        .message-item {
          display: flex;
          margin-bottom: 16px;
          align-items: flex-start;
          padding: 0 8px;
          // 确保消息不被容器截断
          overflow: visible;

          &.message-own {
            flex-direction: row-reverse;

            .message-content {
              align-items: flex-end;
              // 修复：自己消息容器增加底部留白，避免被输入框遮挡
              margin-bottom: 4px;
            }

            // 保留头像占位，避免布局偏移
            &:not(:has(el-avatar)) {
              margin-right: 40px; // 和头像size(32) + margin(8) 匹配
            }
          }

          .message-content {
            display: flex;
            flex-direction: column;
            max-width: 70%;
            margin: 0 8px;

            .message-bubble {
              padding: 8px 12px;
              background: #f0f0f0;
              border-radius: 18px;
              position: relative;
              // 修复：从70%改100%，避免自己消息文字换行截断（外层已限制70%）
              max-width: 100%;
              word-wrap: break-word;
              line-height: 1.4;

              &.message-own-bubble {
                background: #1976d2;
                color: white;
                margin-left: auto;
                // 修复：自己消息气泡增加底部内边距，避免文字贴底
                padding-bottom: 10px;
              }

              .message-text {
                word-wrap: break-word;
                white-space: pre-wrap;
                margin-bottom: 4px;
              }

              .message-time {
                font-size: 11px;
                color: #999;
                text-align: right;

                .message-own-bubble & {
                  color: rgba(255, 255, 255, 0.7);
                }
              }
            }
          }
        }
      }
    }

    .input-area {
      border-top: 1px solid #e6e6e6;
      padding: 16px;
      background: white;

      .input-wrapper {
        display: flex;
        gap: 12px;
        align-items: flex-end;

        .el-textarea {
          flex: 1;
        }

        .send-button {
          height: 40px;
          padding: 0 20px;
        }
      }
    }

    .no-selection {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;

    .chat-list {
      width: 100%;
      height: 180px;
      border-right: none;
      border-bottom: 1px solid #e6e6e6;

      .el-scrollbar {
        height: calc(100% - 80px) !important;
      }
    }

    .chat-area {
      height: calc(100vh - 180px);

      .messages-container .el-scrollbar {
        height: calc(100vh - 280px) !important;
      }
    }
  }
}

/* 用户选择对话框样式 */
.user-select-dialog {
  .user-search-input {
    margin-bottom: 16px;
  }

  .user-list-scroll {
    .user-select-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f5f5;
      }

      .user-select-info {
        flex: 1;
        margin-left: 12px;

        .user-name {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .user-email {
          font-size: 12px;
          color: #666;
        }
      }

      .el-button {
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:hover .el-button {
        opacity: 1;
      }
    }
  }
}
</style>
