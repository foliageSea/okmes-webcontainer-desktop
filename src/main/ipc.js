import { app, ipcMain } from 'electron'
import global from './global'
import axios from 'axios'

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

ipcMain.handle('exit', () => app.exit())
