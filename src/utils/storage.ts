/**
 * Storage 二次封装
 */
import config from '@/config/index'

export default {
  getStorage() {
    return JSON.parse(window.localStorage.getItem(config.namespace) || '{}')
  },
  setItem(key, value) {
    console.info('key', key)
    console.info('value', value)
    const storage = this.getStorage()
    console.info('storage', storage)
    storage[key] = value
    window.localStorage.setItem(config.namespace, JSON.stringify(storage))
  },
  getItem(key) {
    return this.getStorage()[key]
  },
  clearItem(key) {
    const storage = this.getStorage()
    delete storage[key]
    window.localStorage.setItem(config.namespace, JSON.stringify(storage))
  },
  clearAll() {
    window.localStorage.clear()
  },
}
