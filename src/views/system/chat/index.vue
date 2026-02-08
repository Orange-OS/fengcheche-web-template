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
        <div class="messages-container" ref="messagesContainer">
          <el-scrollbar ref="scrollbarRef" height="calc(100vh - 200px)">
            <div class="messages-list">
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
              <div v-if="loadingHistory" class="loading-more">
                <el-icon class="is-loading">
                  <Loading />
                </el-icon>
                加载更多...
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
import { getChatHistory, getChatList, getUnReadCount, type SystemChatGetChatHistoryForm, type SystemChatGetChatHistoryVO, type SystemChatVO, type SystemChatMessageVO, type SystemChatSendMessageForm } from '@/api/system/chat'
import { getUserList } from '@/api/user'
import { useTokenStore } from '@/stores/token'
import { useUserInfoStore } from '@/stores/userInfo'
import { Loading, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'


// 响应式数据
const searchText = ref('')
const selectedChat = ref<SystemChatVO | null>(null)
const messages = ref<SystemChatMessageVO[]>([])
const newMessage = ref('')
const chats = ref<SystemChatVO[]>([])
const loadingHistory = ref(false)
const totalUnreadCount = ref(0)
const messagesContainer = ref<HTMLElement>()
const scrollbarRef = ref()

// 用户选择对话框相关
const showUserDialog = ref(false)
const userSearchText = ref('')
const allUsers = ref<User[]>([])
const loadingChatUsers = ref(false)

// 获取当前用户信息
const userStore = useUserInfoStore()
const tokenStore = useTokenStore()
const currentUserId = computed(() => {
  return userStore.userInfo?.id
})

// WebSocket 连接
let websocket: WebSocket | null = null

// 接口定义
interface User {
  id?: number
  username?: string
  nickname?: string
  avatar?: string
  email?: string
}

// 计算属性
const filteredChats = computed(() => {
  if (!searchText.value) return chats.value
  return chats.value.filter(chat =>
    chat.peerUsername.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

const filteredUsers = computed(() => {
  if (!userSearchText.value) return allUsers.value
  return allUsers.value.filter(user =>
    user.username.toLowerCase().includes(userSearchText.value.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(userSearchText.value.toLowerCase()))
  )
})

// 加载可聊天用户列表
const loadChatUsers = async () => {
  try {
    loadingChatUsers.value = true
    const response = await getUserList()
    console.log(currentUserId.value)
    console.log(response)
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

// 选择用户发起聊天
const selectUserToChat = async (user: User) => {
  try {
    // 检查是否已经在聊天列表中
    const existingChat = chats.value.find(chat => chat.peerUserId === user.id)
    if (existingChat) {
      // 如果已存在，直接选中
      await selectChat(existingChat)
    } else {
      // 如果不存在，创建新的聊天
      const newChat: SystemChatVO = {
        peerUserId: user.id,
        peerUsername: user.username,
        peerNickname: user.nickname,
        peerAvatar: user.avatar || '',
        lastMessage: '',
        lastMessageTime: '',
        unreadCount: 0,
        online: Math.random() > 0.5 // 暂时随机设置
      }
      chats.value.unshift(newChat) // 添加到列表开头
      await selectChat(newChat)
    }

    // 关闭对话框
    showUserDialog.value = false
    userSearchText.value = ''

    ElMessage.success(`已与 ${user.nickname} 发起聊天`)
  } catch (error) {
    console.error('发起聊天失败:', error)
    ElMessage.error('发起聊天失败')
  }
}

// 处理用户对话框关闭
const handleUserDialogClose = () => {
  showUserDialog.value = false
  userSearchText.value = ''
}

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}

// 选择用户
const selectChat = async (chat: SystemChatVO) => {
  selectedChat.value = chat
  // 重置未读消息数，从总未读消息数量中减去
  const previousUnreadCount = chat.unreadCount ?? 0
  chat.unreadCount = 0
  totalUnreadCount.value = Math.max(0, totalUnreadCount.value - previousUnreadCount)
  // 加载聊天历史
  await loadChatHistory(chat.peerUserId)
  // 滚动到底部
  await nextTick()
  scrollToBottom()
}

// 加载聊天历史
const loadChatHistory = async (peerUserId: number, page = 1) => {
  try {
    loadingHistory.value = true
    const params: SystemChatGetChatHistoryForm = {
      peerUserId,
      current: page,
      size: 20
    }
    const response = await getChatHistory(params) as SystemChatGetChatHistoryVO
    const newMessages = response.list.map((msg) => ({
      ...msg,
      isOwn: msg.fromUserId === currentUserId.value
    }))

    if (page === 1) {
      messages.value = newMessages.reverse()
    } else {
      messages.value = [...newMessages.reverse(), ...messages.value]
    }
  } catch (error) {
    console.error('加载聊天历史失败:', error)
    ElMessage.error('加载聊天历史失败')
  } finally {
    loadingHistory.value = false
  }
}

// 发送消息
const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedChat.value) return

  try {
    const messageData: SystemChatSendMessageForm = {
      toUserId: selectedChat.value?.peerUserId ?? 0,
      content: newMessage.value.trim()
    }

    console.log(messageData)
    newMessage.value = ''

    // 滚动到底部
    await nextTick()
    scrollToBottom()

    // 通过 WebSocket 发送消息
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify(messageData))
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败')
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (scrollbarRef.value) {
    scrollbarRef.value.setScrollTop(scrollbarRef.value.wrapRef.scrollHeight)
  }
}

// 初始化 WebSocket 连接
const initWebSocket = () => {
  // 这里需要根据你的后端 WebSocket 地址进行配置
  const userId = currentUserId.value || 1
  const token = tokenStore.token || ''
  const wsUrl = `ws://localhost:8080/fengcheche/ws/chat?userId=${userId}&token=${token}`

  websocket = new WebSocket(wsUrl)

  websocket.onopen = () => {
    console.log('WebSocket 连接成功')
  }

  websocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      console.log('接收到新消息：', data)
      handleWebSocketMessage(data)
    } catch (error) {
      console.error('解析 WebSocket 消息失败:', error)
    }
  }

  websocket.onerror = (error) => {
    console.error('WebSocket 连接错误:', error)
  }

  websocket.onclose = () => {
    console.log('WebSocket 连接关闭')
    // 可以在这里实现重连逻辑
  }
}

// 更新聊天用户在线状态
// const updateChatStatus = (userId: number, online: boolean) => {
//   const chat = chats.value.find(c => c.peerUserId === userId)
//   if (chat) {
//     chat.online = online
//   }
// }

// 处理 WebSocket 消息
const handleWebSocketMessage = (data: SystemChatMessageVO) => {
  // switch (data.type) {
  //   case 'newMessage':
  //     if (data.message) {
  //       handleNewMessage(data.message)
  //     }
  //     break
  //   case 'userStatus':
  //     if (data.userId !== undefined && data.online !== undefined) {
  //       updateChatStatus(data.userId, data.online)
  //     }
  //     break
  //   default:
  //     console.log('未知消息类型:', data)
  // }
  if (data) {
    handleNewMessage(data)
  }
}

// 处理新消息
const handleNewMessage = (message: Partial<SystemChatMessageVO>) => {
  const newMsg: SystemChatMessageVO = {
    id: message.id,
    fromUserId: message.fromUserId,
    fromNickname: message.fromNickname,
    fromAvatar: message.fromAvatar,
    toUserId: message.toUserId,
    toNickname: message.toNickname,
    toAvatar: message.toAvatar,
    content: message.content,
    sendTime: message.sendTime,
    isOwn: message.fromUserId === currentUserId.value
  }

  messages.value.push(newMsg)

  // 如果是当前聊天用户发送的消息，滚动到底部
  if (message.fromUserId === selectedChat.value?.peerUserId) {
    nextTick().then(scrollToBottom)
  }

  // 更新聊天用户列表中的最后消息
  const chat = chats.value.find(c => c.peerUserId === message.fromUserId)
  if (chat && message.content) {
    chat.lastMessage = message.content
    chat.lastMessageTime = message.sendTime || new Date().toISOString()
    if (message.fromUserId !== selectedChat.value?.peerUserId) {
      chat.unreadCount = (chat.unreadCount || 0) + 1
      // 更新总未读消息数量
      totalUnreadCount.value += 1
    }
  }
}


// 获取未读消息数量
const loadUnreadCount = async () => {
  try {
    const response = await getUnReadCount() as { data?: number; total?: number }
    totalUnreadCount.value = response.data || response.total || 0
  } catch (error) {
    console.error('获取未读消息数量失败:', error)
    // 不显示错误提示，因为这不是关键功能
  }
}


// 加载聊天用户列表
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
      online: chat.online ?? Math.random() > 0.5 // 暂时随机设置在线状态，后续可以从 WebSocket 或其他接口获取
    }))
  } catch (error) {
    console.error('加载聊天列表失败:', error)
    ElMessage.error('加载聊天列表失败')
  }
}

// 生命周期
onMounted(async () => {
  try {
    await Promise.all([loadChats(), loadUnreadCount(), loadChatUsers()])
  } catch (error) {
    console.error('onMounted 中发生错误:', error)
  }

  initWebSocket()
})

// 监听对话框打开事件
watch(showUserDialog, (newVal) => {
  if (newVal && allUsers.value.length === 0) {
    loadChatUsers()
  }
})

onUnmounted(() => {
  if (websocket) {
    websocket.close()
  }
})

// 监听消息变化，自动滚动到底部
watch(() => messages.value.length, () => {
  nextTick().then(() => {
    if (scrollbarRef.value) {
      const scrollbar = scrollbarRef.value
      const scrollTop = scrollbar.wrapRef.scrollTop
      const scrollHeight = scrollbar.wrapRef.scrollHeight
      const clientHeight = scrollbar.wrapRef.clientHeight

      // 如果用户已经在底部附近，则自动滚动到底部
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        scrollToBottom()
      }
    }
  })
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

        .message-item {
          display: flex;
          margin-bottom: 16px;
          align-items: flex-start;
          padding: 0 8px;

          &.message-own {
            flex-direction: row-reverse;

            .message-content {
              align-items: flex-end;
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
              max-width: 70%;
              word-wrap: break-word;
              line-height: 1.4;

              &.message-own-bubble {
                background: #1976d2;
                color: white;
                margin-left: auto;
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

        .loading-more {
          text-align: center;
          padding: 16px;
          color: #666;
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

    .user-list {
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
