<template>
  <main class="bg-black opacity-80 color-white text-size-sm w-75">
    <div class="pos-relative p-2">
      <ul>
        <li>程序运行时长: {{ runningTime }} 秒</li>
        <li class="flex gap-1">
          CPU占用:
          <el-progress class="flex-1" :percentage="calCpuUsage"></el-progress>
        </li>
        <li>当前进程内存使用: {{ calProcessMemoryUsage }} MB</li>
        <li class="flex gap-1">
          系统内存占用:
          <el-progress
            class="flex-1 custom-progress"
            :percentage="calSystemMemoryUsage"
          ></el-progress>
        </li>
        <li>(数据刷新频率: 2s)</li>
      </ul>
      <el-icon
        @click="() => (enableMonitorl = false)"
        :size="16"
        class="right-1 top-1 hover:text-blue"
        style="position: absolute"
        ><Close
      /></el-icon>
    </div>
  </main>
</template>

<script setup>
import { ref, toRef, onMounted, computed, onBeforeUnmount } from 'vue'
import { useGlobalStore } from '@renderer/stores/global.js'
import { isNil } from 'lodash'

import { Close } from '@element-plus/icons-vue'

const global = useGlobalStore()
const enableMonitorl = toRef(global, 'enableMonitorl')

const creationTime = toRef(global, 'creationTime')
const cpuUsage = toRef(global, 'cpuUsage')
const processMemoryInfo = toRef(global, 'processMemoryInfo')
const systemMemoryInfo = toRef(global, 'systemMemoryInfo')

const runningTime = ref(0)

let timer = null

const calSystemMemoryUsage = computed(() => {
  const { total, free } = systemMemoryInfo.value
  return Number.parseInt(((total - free) / total) * 100)
})

const calCpuUsage = computed(() => {
  return Number.parseInt(cpuUsage.value)
})

const calProcessMemoryUsage = computed(() => {
  return (processMemoryInfo.value.residentSet / 1000).toFixed(2)
})

const initRunningTime = async () => {
  creationTime.value = await window.api.getCreationTime()
  setInterval(() => {
    if (!isNil(creationTime.value)) {
      runningTime.value = Number.parseInt((Date.now() - creationTime.value) / 1000)
    }
  }, 1 * 1000)
}

const initProcessInfo = () => {
  timer = setInterval(async () => {
    cpuUsage.value = await window.api.getCPUUsage()
    processMemoryInfo.value = await window.api.getProcessMemoryInfo()
    systemMemoryInfo.value = await window.api.getSystemMemoryInfo()
  }, 2 * 1000)
}

onMounted(async () => {
  initRunningTime()
  initProcessInfo()
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<style scoped>
:deep(.el-progress__text) {
  color: white;
}
</style>
