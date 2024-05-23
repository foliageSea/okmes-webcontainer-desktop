import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getConfig() {
    return ipcRenderer.invoke('getConfig')
  },
  updateConfig(config) {
    ipcRenderer.invoke('updateConfig', config)
  },
  minimize() {
    return ipcRenderer.invoke('minimize')
  },
  exit() {
    return ipcRenderer.invoke('exit')
  },
  async testUrl(url) {
    return await ipcRenderer.invoke('testUrl', url)
  },
  async getCreationTime() {
    return await ipcRenderer.invoke('getCreationTime')
  },
  async getCPUUsage() {
    return await ipcRenderer.invoke('getCPUUsage')
  },
  async getProcessMemoryInfo() {
    return await ipcRenderer.invoke('getProcessMemoryInfo')
  },
  async getSystemMemoryInfo() {
    return await ipcRenderer.invoke('getSystemMemoryInfo')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
