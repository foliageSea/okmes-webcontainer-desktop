<template>
  <el-dialog v-model="visible" title="OkMes容器配置" width="500">
    <el-form :model="form">
      <el-form-item label="网址">
        <el-input v-model="form.url" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onDevTool">DevTool</el-button>
        <el-button @click="onMonitorl">性能监控</el-button>
        <el-button @click="onTestUrl">测试网址</el-button>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, toRef } from 'vue'
import { ElMessage } from 'element-plus'
import { useGlobalStore } from '@renderer/stores/global.js'

const global = useGlobalStore()

const enableMonitorl = toRef(global, 'enableMonitorl')

const visible = ref(false)
const form = ref({
  url: ''
})

let el = null

const emit = defineEmits(['reload'])

defineExpose({
  async open() {
    const config = await window.api.getConfig()
    form.value = config
    visible.value = true
  }
})

const onSubmit = async () => {
  await window.api.updateConfig({ ...form.value })

  el.reload()

  visible.value = false
}

const onTestUrl = async () => {
  const flag = await window.api.testUrl(form.value.url)

  if (flag) {
    ElMessage.success('通过')
  } else {
    ElMessage.error('未通过')
  }
}

const onDevTool = () => {
  el.openDevTools()
}

const onMonitorl = () => {
  enableMonitorl.value = !enableMonitorl.value
}

onMounted(() => {
  el = document.querySelector('.inner-web')
})
</script>

<style scoped></style>
