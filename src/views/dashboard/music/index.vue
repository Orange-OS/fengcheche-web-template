<template>
  <div class="music-player">
    <!-- 音乐播放器主体 -->
    <div class="player-container">
      <!-- 专辑封面区域 -->
      <div class="album-cover">
        <div class="cover-image" :class="{ 'playing': isPlaying }">
          <img v-if="currentSong.cover" :src="currentSong.cover" :alt="currentSong.title" />
          <div v-else class="default-cover">
            <i class="el-icon-headset"></i>
          </div>
        </div>
        <div class="vinyl-disc" :class="{ 'spinning': isPlaying }"></div>
      </div>

      <!-- 歌曲信息 -->
      <div class="song-info">
        <h2 class="song-title">{{ currentSong.title || '未选择歌曲' }}</h2>
        <p class="song-artist">{{ currentSong.artist || '未知艺术家' }}</p>
        <p class="song-album">{{ currentSong.album || '未知专辑' }}</p>
      </div>

      <!-- 进度条 -->
      <div class="progress-container">
        <span class="time current-time">{{ formatTime(currentTime) }}</span>
        <div class="progress-bar" @click="seekTo">
          <div class="progress-bg"></div>
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          <div class="progress-thumb" :style="{ left: progressPercentage + '%' }"></div>
        </div>
        <span class="time total-time">{{ formatTime(duration) }}</span>
      </div>

      <!-- 播放控制 -->
      <div class="controls">
        <button class="control-btn" @click="previousSong" :disabled="playlist.length === 0">
          <i class="el-icon-back"></i>
        </button>
        <button class="control-btn play-btn" @click="togglePlay" :disabled="playlist.length === 0">
          <i :class="isPlaying ? 'el-icon-video-pause' : 'el-icon-video-play'"></i>
        </button>
        <button class="control-btn" @click="nextSong" :disabled="playlist.length === 0">
          <i class="el-icon-right"></i>
        </button>
        <button class="control-btn" @click="toggleShuffle" :class="{ active: shuffleMode }">
          <i class="el-icon-refresh"></i>
        </button>
        <button class="control-btn" @click="toggleRepeat" :class="{ active: repeatMode }">
          <i class="el-icon-refresh-right"></i>
        </button>
      </div>

      <!-- 音量控制 -->
      <div class="volume-container">
        <i class="el-icon-mute" v-if="volume === 0"></i>
        <i class="el-icon-microphone" v-else-if="volume < 50"></i>
        <i class="el-icon-microphone" v-else></i>
        <div class="volume-bar" @click="setVolume">
          <div class="volume-bg"></div>
          <div class="volume-fill" :style="{ width: volume + '%' }"></div>
          <div class="volume-thumb" :style="{ left: volume + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 播放列表 -->
    <div class="playlist-container">
      <div class="playlist-header">
        <h3>播放列表</h3>
        <button class="add-music-btn" @click="showAddMusicDialog = true">
          <i class="el-icon-plus"></i>
          添加音乐
        </button>
      </div>
      <div class="playlist">
        <div v-for="(song, index) in playlist" :key="song.id" class="playlist-item"
          :class="{ active: currentSongIndex === index }" @click="playSong(index)">
          <div class="item-number">{{ index + 1 }}</div>
          <div class="item-info">
            <div class="item-title">{{ song.title }}</div>
            <div class="item-artist">{{ song.artist }}</div>
          </div>
          <div class="item-duration">{{ formatTime(song.duration) }}</div>
          <button class="remove-btn" @click.stop="removeSong(index)">
            <i class="el-icon-close"></i>
          </button>
        </div>
        <div v-if="playlist.length === 0" class="empty-playlist">
          <i class="el-icon-headset"></i>
          <p>播放列表为空</p>
          <p>点击"添加音乐"开始播放</p>
        </div>
      </div>
    </div>

    <!-- 添加音乐对话框 -->
    <el-dialog v-model="showAddMusicDialog" title="添加音乐" width="500px">
      <el-form :model="newSong" label-width="80px">
        <el-form-item label="歌曲名称">
          <el-input v-model="newSong.title" placeholder="请输入歌曲名称"></el-input>
        </el-form-item>
        <el-form-item label="艺术家">
          <el-input v-model="newSong.artist" placeholder="请输入艺术家"></el-input>
        </el-form-item>
        <el-form-item label="专辑">
          <el-input v-model="newSong.album" placeholder="请输入专辑名称"></el-input>
        </el-form-item>
        <el-form-item label="音频文件">
          <el-input v-model="newSong.url" placeholder="请输入音频文件URL"></el-input>
        </el-form-item>
        <el-form-item label="封面图片">
          <el-input v-model="newSong.cover" placeholder="请输入封面图片URL"></el-input>
        </el-form-item>
        <el-form-item label="时长(秒)">
          <el-input-number v-model="newSong.duration" :min="0" placeholder="请输入时长"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddMusicDialog = false">取消</el-button>
        <el-button type="primary" @click="addSong">添加</el-button>
      </template>
    </el-dialog>

    <!-- 音频元素 -->
    <audio ref="audioRef" @timeupdate="updateProgress" @ended="onSongEnded" @loadedmetadata="onLoadedMetadata"
      @error="onAudioError"></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

// 歌曲接口定义
interface Song {
  id: string
  title: string
  artist: string
  album: string
  url: string
  cover?: string
  duration: number
}

// 响应式数据
const audioRef = ref<HTMLAudioElement>()
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(70)
const currentSongIndex = ref(-1)
const shuffleMode = ref(false)
const repeatMode = ref(false)
const showAddMusicDialog = ref(false)

// 播放列表
const playlist = ref<Song[]>([])

// 新歌曲表单
const newSong = ref<Partial<Song>>({
  title: '',
  artist: '',
  album: '',
  url: '',
  cover: '',
  duration: 0
})

// 计算属性
const currentSong = computed(() => {
  return playlist.value[currentSongIndex.value] || {
    id: '',
    title: '',
    artist: '',
    album: '',
    url: '',
    cover: '',
    duration: 0
  }
})

const progressPercentage = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

// 方法
const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const togglePlay = () => {
  if (!audioRef.value || playlist.value.length === 0) return

  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const playSong = (index: number) => {
  if (index < 0 || index >= playlist.value.length) return

  currentSongIndex.value = index
  const song = playlist.value[index]

  if (audioRef.value) {
    audioRef.value.src = song.url
    audioRef.value.load()
    audioRef.value.play()
    isPlaying.value = true
  }
}

const nextSong = () => {
  if (playlist.value.length === 0) return

  let nextIndex: number
  if (shuffleMode.value) {
    nextIndex = Math.floor(Math.random() * playlist.value.length)
  } else {
    nextIndex = (currentSongIndex.value + 1) % playlist.value.length
  }

  playSong(nextIndex)
}

const previousSong = () => {
  if (playlist.value.length === 0) return

  let prevIndex: number
  if (shuffleMode.value) {
    prevIndex = Math.floor(Math.random() * playlist.value.length)
  } else {
    prevIndex = currentSongIndex.value - 1
    if (prevIndex < 0) prevIndex = playlist.value.length - 1
  }

  playSong(prevIndex)
}

const toggleShuffle = () => {
  shuffleMode.value = !shuffleMode.value
  ElMessage.success(shuffleMode.value ? '随机播放已开启' : '随机播放已关闭')
}

const toggleRepeat = () => {
  repeatMode.value = !repeatMode.value
  ElMessage.success(repeatMode.value ? '循环播放已开启' : '循环播放已关闭')
}

const seekTo = (event: MouseEvent) => {
  if (!audioRef.value || duration.value === 0) return

  const progressBar = event.currentTarget as HTMLElement
  const rect = progressBar.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = clickX / rect.width
  const newTime = percentage * duration.value

  audioRef.value.currentTime = newTime
  currentTime.value = newTime
}

const setVolume = (event: MouseEvent) => {
  const volumeBar = event.currentTarget as HTMLElement
  const rect = volumeBar.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100))

  volume.value = percentage
  if (audioRef.value) {
    audioRef.value.volume = percentage / 100
  }
}

const addSong = () => {
  if (!newSong.value.title || !newSong.value.url) {
    ElMessage.error('请填写歌曲名称和音频文件URL')
    return
  }

  const song: Song = {
    id: Date.now().toString(),
    title: newSong.value.title,
    artist: newSong.value.artist || '未知艺术家',
    album: newSong.value.album || '未知专辑',
    url: newSong.value.url,
    cover: newSong.value.cover,
    duration: newSong.value.duration || 0
  }

  playlist.value.push(song)

  // 如果是第一首歌，自动播放
  if (playlist.value.length === 1) {
    playSong(0)
  }

  // 重置表单
  newSong.value = {
    title: '',
    artist: '',
    album: '',
    url: '',
    cover: '',
    duration: 0
  }

  showAddMusicDialog.value = false
  ElMessage.success('歌曲添加成功')
}

const removeSong = (index: number) => {
  if (index === currentSongIndex.value) {
    // 如果删除的是当前播放的歌曲
    if (isPlaying.value) {
      audioRef.value?.pause()
      isPlaying.value = false
    }
    currentSongIndex.value = -1
  } else if (index < currentSongIndex.value) {
    // 如果删除的歌曲在当前播放歌曲之前，需要调整索引
    currentSongIndex.value--
  }

  playlist.value.splice(index, 1)
  ElMessage.success('歌曲已删除')
}

// 音频事件处理
const updateProgress = () => {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
  }
}

const onSongEnded = () => {
  isPlaying.value = false

  if (repeatMode.value) {
    // 单曲循环
    playSong(currentSongIndex.value)
  } else {
    // 播放下一首
    nextSong()
  }
}

const onLoadedMetadata = () => {
  if (audioRef.value) {
    duration.value = audioRef.value.duration
  }
}

const onAudioError = () => {
  ElMessage.error('音频加载失败，请检查音频文件URL')
  isPlaying.value = false
}

// 生命周期
onMounted(() => {
  // 设置初始音量
  if (audioRef.value) {
    audioRef.value.volume = volume.value / 100
  }

  // 添加一些示例歌曲
  const sampleSongs: Song[] = [
    {
      id: '1',
      title: '示例歌曲 1',
      artist: '示例艺术家',
      album: '示例专辑',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      cover: 'https://via.placeholder.com/300x300/4A90E2/FFFFFF?text=Music',
      duration: 180
    },
    {
      id: '2',
      title: '示例歌曲 2',
      artist: '示例艺术家',
      album: '示例专辑',
      url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      cover: 'https://via.placeholder.com/300x300/E74C3C/FFFFFF?text=Music',
      duration: 200
    }
  ]

  playlist.value = sampleSongs
})

onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause()
  }
})
</script>

<style scoped lang="scss">
.music-player {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.player-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  max-width: 600px;
  margin: 0 auto;
}

.album-cover {
  position: relative;
  width: 250px;
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-image {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

  &.playing {
    animation: pulse 2s infinite;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.default-cover {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 60px;
}

.vinyl-disc {
  position: absolute;
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: linear-gradient(45deg, #2c3e50, #34495e);
  border: 3px solid #ecf0f1;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background: #ecf0f1;
    border-radius: 50%;
  }

  &.spinning {
    animation: spin 3s linear infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.song-info {
  text-align: center;

  .song-title {
    font-size: 28px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 10px 0;
    line-height: 1.2;
  }

  .song-artist {
    font-size: 18px;
    color: #7f8c8d;
    margin: 0 0 5px 0;
  }

  .song-album {
    font-size: 16px;
    color: #95a5a6;
    margin: 0;
  }
}

.progress-container {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 15px;

  .time {
    font-size: 14px;
    color: #7f8c8d;
    min-width: 40px;
    text-align: center;
  }
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #ecf0f1;
  border-radius: 3px;
  position: relative;
  cursor: pointer;
  transition: height 0.2s ease;

  &:hover {
    height: 8px;
  }
}

.progress-bg {
  width: 100%;
  height: 100%;
  background: #ecf0f1;
  border-radius: 3px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  transition: width 0.1s ease;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: white;
  border: 2px solid #667eea;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.progress-bar:hover .progress-thumb {
  opacity: 1;
}

.controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.control-btn {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: scale(1.1);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.play-btn {
    width: 70px;
    height: 70px;
    font-size: 24px;
  }

  &.active {
    background: linear-gradient(45deg, #e74c3c, #c0392b);
  }
}

.volume-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 200px;

  i {
    font-size: 18px;
    color: #7f8c8d;
    min-width: 20px;
  }
}

.volume-bar {
  flex: 1;
  height: 4px;
  background: #ecf0f1;
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.volume-bg {
  width: 100%;
  height: 100%;
  background: #ecf0f1;
  border-radius: 2px;
}

.volume-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 2px;
  transition: width 0.1s ease;
}

.volume-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: white;
  border: 2px solid #667eea;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.volume-bar:hover .volume-thumb {
  opacity: 1;
}

.playlist-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h3 {
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
  }
}

.add-music-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }
}

.playlist {
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 5px;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    transform: translateX(5px);
  }

  &.active {
    background: linear-gradient(45deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
    border-left: 4px solid #667eea;
  }
}

.item-number {
  width: 30px;
  text-align: center;
  font-weight: 600;
  color: #7f8c8d;
  margin-right: 15px;
}

.item-info {
  flex: 1;
  margin-right: 15px;

  .item-title {
    font-size: 16px;
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 4px;
  }

  .item-artist {
    font-size: 14px;
    color: #7f8c8d;
  }
}

.item-duration {
  font-size: 14px;
  color: #7f8c8d;
  margin-right: 15px;
  min-width: 50px;
  text-align: right;
}

.remove-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: 0;

  &:hover {
    background: rgba(231, 76, 60, 0.2);
    transform: scale(1.1);
  }
}

.playlist-item:hover .remove-btn {
  opacity: 1;
}

.empty-playlist {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;

  i {
    font-size: 48px;
    margin-bottom: 20px;
    display: block;
  }

  p {
    margin: 10px 0;
    font-size: 16px;

    &:first-of-type {
      font-size: 18px;
      font-weight: 500;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .music-player {
    padding: 10px;
  }

  .player-container {
    padding: 20px;
  }

  .album-cover {
    width: 200px;
    height: 200px;
  }

  .cover-image {
    width: 150px;
    height: 150px;
  }

  .vinyl-disc {
    width: 200px;
    height: 200px;
  }

  .song-title {
    font-size: 24px;
  }

  .controls {
    gap: 15px;
  }

  .control-btn {
    width: 45px;
    height: 45px;
    font-size: 16px;

    &.play-btn {
      width: 60px;
      height: 60px;
      font-size: 20px;
    }
  }

  .playlist-container {
    padding: 20px;
  }

  .playlist-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;

    h3 {
      text-align: center;
    }
  }
}
</style>
