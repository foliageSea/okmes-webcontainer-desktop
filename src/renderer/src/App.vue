<template>
  <div
    v-loading="loading"
    :element-loading-text="loadingText"
    class="w-full h-full pos-relative overflow-hidden"
  >
    <SettingButton
      :dialog="dialog"
      class="pos-absolute w-auto right-1 bottom-1 opacity-0 hover:opacity-100 z-9999"
    />

    <webview class="w-full h-full inner-web" />
    <SettingDialog ref="dialog" @reload="onReload" />
    <DebugPage
      v-if="showDebugPage"
      :bg-color="debugPageColor"
      class="pos-absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]"
    ></DebugPage>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'

import SettingDialog from './components/SettingDialog.vue'
import SettingButton from './components/SettingButton.vue'
import DebugPage from './components/DebugPage.vue'
import { useGlobalStore } from '@renderer/stores/global.js'
import { isNil } from 'lodash'

const loading = ref(false)
const loadingText = ref('')

const showDebugPage = ref(false)
const debugPageColor = ref('#ffffff')

const dialog = ref(null)

let el = null

const { getConfig } = useGlobalStore()

const onReload = async () => {
  await testAndRunUrl()
}

const handleFailLoadEvent = (event) => {
  if (event.errorDescription === 'ERR_CONNECTION_REFUSED') {
    loading.value = true
    loadingText.value = '加载失败(5秒后重试) 错误码:' + event.errorDescription
    setTimeout(async () => {
      const config = await window.api.getConfig()
      el.src = config.url
      loading.value = false
    }, 5 * 1000)
  }
}

const testAndRunUrl = async () => {
  const config = await window.api.getConfig()

  const url = config.url
  const flag = await window.api.testUrl(url)

  if (flag) {
    loading.value = false
    el.src = url
  } else {
    loading.value = true
    loadingText.value = '加载失败'
  }
}

const initWebview = () => {
  el.addEventListener('did-fail-load', (event) => {
    console.log('did-fail-load', event)
    handleFailLoadEvent(event)
  })
}

const initIpcRender = () => {
  window.electron.ipcRenderer.on('message', (event, text) => {
    ElMessage.success(text)
  })

  window.electron.ipcRenderer.on('debugMessage', (event, data) => {
    const { openDebugPage, debugColor } = data

    if (openDebugPage) {
      showDebugPage.value = true
      debugPageColor.value = debugColor
    } else {
      showDebugPage.value = false
    }
  })

  window.electron.ipcRenderer.on('reload', async () => {
    await testAndRunUrl()
  })
  window.electron.ipcRenderer.on('refreshConfig', async () => {
    await getConfig()
  })
}

onMounted(async () => {
  el = document.querySelector('.inner-web')
  console.log(el)
  if (isNil(el)) {
    loading.value = true
    loadingText.value = 'WebView 加载失败, 3秒后重试'

    setTimeout(() => {
      location.reload()
    }, 3 * 1000)

    return
  }

  initWebview()
  await testAndRunUrl()
  initIpcRender()
})
</script>

<style scoped></style>
