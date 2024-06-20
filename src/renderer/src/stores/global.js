import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGlobalStore = defineStore('global', () => {
  const config = ref({
    id: 1,
    type: 'WebContainer',
    alias: '苹果',
    url: 'https://www.baidu.com'
  })

  const getConfig = async () => {
    config.value = await window.api.getConfig()
  }

  const creationTime = ref(0)

  const cpuUsage = ref(0)

  const processMemoryInfo = ref({
    private: 0,
    residentSet: 0,
    shared: 0
  })

  const systemMemoryInfo = ref({
    free: 0,
    swapFree: 0,
    swapTotal: 0,
    total: 0
  })

  const enableMonitorl = ref(false)

  /**
   * 容器刷新间隔 默认 60分钟
   * @type {Ref<UnwrapRef<number>>}
   */
  const refreshInterval = ref(60)

  return {
    config,
    getConfig,
    creationTime,
    cpuUsage,
    processMemoryInfo,
    systemMemoryInfo,
    enableMonitorl,
    refreshInterval
  }
}, {
  persist: true
})
