<template>
  <div>
    <Button class="mr-[4px]" title="返回" @click="onBack" />
    <Button class="mr-[4px]" title="刷新" @click="onReload" />
    <Button class="mr-[4px]" title="设置" @click="onSetting" />
    <Button class="mr-[4px]" title="退出" @click="onExit" />
  </div>
</template>

<script setup>
import Button from './Button.vue'
import { onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps(['dialog'])

let el = null

const onBack = () => {
  el.goBack()
}

const onReload = () => {
  el.reload()
  ElMessage.success('刷新成功')
}

const onSetting = () => {
  props.dialog.open()
}

const onExit = async () => {
  await ElMessageBox.confirm('请问是否退出?', '提示')
  window.api.exit()
}

const onTest = async () => {
  const info = await window.api.getSystemVersion()
  console.log(info)
}

onMounted(() => {
  el = document.querySelector('.inner-web')
})
</script>

<style scoped></style>
