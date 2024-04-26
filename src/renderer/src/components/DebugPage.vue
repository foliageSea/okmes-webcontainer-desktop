<script setup>
import { reactive, onBeforeMount, toRef } from 'vue'
import { useGlobalStore } from '@renderer/stores/global.js'

const props = defineProps({
  bgColor: {
    type: String,
    default: '#ffffff'
  }
})

const global = useGlobalStore()
const config = toRef(global, 'config')

const versions = reactive({ ...window.electron.process.versions })

const calculateContrastColor = (hexColor) => {
  // 将十六进制颜色值转换为RGB值
  const red = parseInt(hexColor.substring(1, 3), 16)
  const green = parseInt(hexColor.substring(3, 5), 16)
  const blue = parseInt(hexColor.substring(5, 7), 16)

  // 计算反差色的RGB值
  const contrastRed = 255 - red
  const contrastGreen = 255 - green
  const contrastBlue = 255 - blue

  // 将计算得到的RGB值转换回十六进制颜色值
  const contrastHexColor =
    '#' +
    contrastRed.toString(16).padStart(2, '0') +
    contrastGreen.toString(16).padStart(2, '0') +
    contrastBlue.toString(16).padStart(2, '0')

  return contrastHexColor
}

onBeforeMount(async () => {
  await global.getConfig()
})
</script>

<template>
  <main class="p-6 rounded-lg" :style="{ 'background-color': props.bgColor }">
    <ul class="text-size-4xl" :style="{ color: calculateContrastColor(props.bgColor) }">
      <li>昵称 {{ config.alias }}</li>
      <li>设备ID {{ config.id }}</li>
      <li>服务器地址 {{ config.url }}</li>
      <li>Electron v{{ versions.electron }}</li>
      <li>Chromium v{{ versions.chrome }}</li>
      <li>Node v{{ versions.node }}</li>
    </ul>
  </main>
</template>

<style scoped>
li {
  list-style: none;
}
</style>
