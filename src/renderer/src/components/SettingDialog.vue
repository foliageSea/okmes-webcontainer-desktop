<template>
  <el-dialog v-model="visible" title="OkMes容器配置" width="500">
    <el-form :model="form">
      <el-form-item label="网址">
        <el-input v-model="form.url" />
      </el-form-item>
      <el-form-item label="刷新">
        <el-select v-model="form.refreshInterval" style="width: 240px">
          <el-option
            v-for="item in refreshIntervalOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
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
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import { useGlobalStore } from '@renderer/stores/global.js'

const global = useGlobalStore()

const { refreshInterval } = storeToRefs(global)

const enableMonitorl = toRef(global, 'enableMonitorl')

const visible = ref(false)
const form = ref({
  url: '',
  refreshInterval: 0
})

let el = null

const emits = defineEmits(['reload'])

defineExpose({
  async open() {
    const config = await window.api.getConfig()
    form.value.url = config.url
    form.value.refreshInterval = refreshInterval
    visible.value = true
  }
})

const refreshIntervalOptions = ref([
  {
    value: 1,
    label: '1分钟'
  },
  {
    value: 15,
    label: '15分钟'
  },
  {
    value: 30,
    label: '30分钟'
  },
  {
    value: 60,
    label: '1小时'
  },
  {
    value: 120,
    label: '2小时'
  },
  {
    value: 720,
    label: '12小时'
  }
])

const onSubmit = async () => {
  const config = await window.api.getConfig()

  await window.api.updateConfig({ ...config, ...form.value })
  refreshInterval.value = form.value.refreshInterval
  emits('reload')
  visible.value = false
}

const onTestUrl = async () => {
  const flag = await window.api.testUrl(form.value.url)

  if (flag) {
    ElMessage.success({ message: '通过', grouping: true })
  } else {
    ElMessage.error({ message: '未通过', grouping: true })
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
