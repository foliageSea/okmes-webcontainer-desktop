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
import { ElMessage, ElMessageBox } from 'element-plus'
const props = defineProps(['dialog'])

const onBack = () => {
  webview.goBack()
}

const onReload = () => {
  webview.reload()
  ElMessage.success('刷新成功')
}

const onSetting = () => {
  props.dialog.open()
}

const onExit = async () => {
  await ElMessageBox.confirm('请问是否退出?', '提示')
  window.api.exit()
}
</script>

<style scoped></style>
