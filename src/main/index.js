import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createWindow } from './windows'
import './ipc'
import global from './global'
import Socket from './socket'

// 防止应用重复启动
// const lock = app.requestSingleInstanceLock({
//   key: 'OkMesWebContainer'
// })

// if (!lock) {
//   return
// }

global.ensureInitialized()

// Socket.init()

app.whenReady().then(() => {
  console.log('配置文件:', path.join(__dirname, 'config'))

  electronApp.setAppUserModelId('com.sunpn')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // 开机自启
  // if (import.meta.env.MODE !== 'development') {
  //   if (app.getLoginItemSettings().openAtLogin === false) {
  //     app.setLoginItemSettings({
  //       openAtLogin: true,
  //       openAsHidden: false
  //     })
  //   }
  // }

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
