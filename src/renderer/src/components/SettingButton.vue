<template>
  <div>
    <Button class="mr-[4px]" title="返回" :onClick="onBack" />
    <Button class="mr-[4px]" title="刷新" :onClick="onReload" />
    <Button class="mr-[4px]" title="设置" :onClick="onSetting" />
    <Button class="mr-[4px]" title="退出" :onClick="onExit" />
  </div>
</template>

<script setup>
import Button from './Button.vue'
const props = defineProps(['dialog'])

const onBack = () => {
  webview.goBack()
}

const onReload = () => {
  webview.reload()
}

const onSetting = () => {
  props.dialog.open()
}

const onExit = () => {
  if (confirm('是否退出')) {
    window.api.exit()
  }
}
</script>

<style scoped></style>
