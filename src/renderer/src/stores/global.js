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

  return { config, getConfig }
})
