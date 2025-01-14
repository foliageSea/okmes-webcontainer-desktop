import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { basename } from 'path'
import { createWindow } from './windows'
import './ipc'
import global from './global'

process.on('uncaughtException', (err) => {
  console.error('全局错误捕获', err)
})

const isFirstInstance = app.requestSingleInstanceLock()
if (!isFirstInstance) {
  app.quit()
}


global.ensureInitialized()

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.sunpn.okmes-webcontainer-desktop')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  createWindow()

  if (app.isPackaged) {
    const loginSettings = app.getLoginItemSettings()
    if (!loginSettings.openAtLogin) {
      app.setLoginItemSettings({
        openAtLogin: true,
      })
    }
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
