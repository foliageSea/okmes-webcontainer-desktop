import { app, ipcMain } from 'electron'
import axios from 'axios'
import si from 'systeminformation'

import global from './global'

ipcMain.on('ping', () => console.log('pong'))

ipcMain.handle('getConfig', () => global.config)

ipcMain.handle('updateConfig', (_, config) => {
  global.config = config
  global.saveConfig()
})

ipcMain.handle('testUrl', async (_, url) => {
  try {
    const response = await axios.get(url)
    if (response.status === 200) {
      return true
    } else {
      return false
    }
  } catch (error) {
    return false
  }
})

/** 最小化 */
ipcMain.handle('minimize', () => {
  global.mainWindow.minimize()
})

ipcMain.handle('exit', () => app.exit())

/** 获取应用程序的创建时间 */
ipcMain.handle('getCreationTime', () => {
  return process.getCreationTime()
})

ipcMain.handle('getCPUUsage', async () => {
  const data = await si.currentLoad()
  let totalUsage = 0
  data.cpus.forEach((cpu) => {
    totalUsage += cpu.load
  })
  const averageUsage = totalUsage / data.cpus.length
  return averageUsage
})

ipcMain.handle('getProcessMemoryInfo', () => {
  return process.getProcessMemoryInfo()
})

ipcMain.handle('getSystemMemoryInfo', () => {
  return process.getSystemMemoryInfo()
})
