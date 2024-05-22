import { isEmpty, isNil, cloneDeep } from 'lodash'
import global from './global'
import socket from './socket'
import { ipcMain } from 'electron'

/**
 * 状态消息的状态
 */
export class StateMessageState {
  static online = 'online'
  static offline = 'offline'
  static willOffline = 'will-offline'
  static sync = 'sync'
}

/**
 * 消息的操作
 */
export class MessageActions {
  static state = 'state'
  static debugCallback = 'debug-callback'
  static pushLog = 'push-log'
  static command = 'command'
  static rename = 'rename'
  static debug = 'debug'
}

export class MessageHandler {
  static handle(topic, message) {
    // console.log(topic, message.toString());
    const [softwareType, action, deviceId] = topic.split('/')
    if (isEmpty(softwareType)) return
    if (isEmpty(action)) return
    if (isEmpty(deviceId)) return
    const msg = JSON.parse(message.toString())
    switch (action) {
      case MessageActions.state:
        MessageHandler.handleStateMessage(topic, msg)
        break
      case MessageActions.debug:
        MessageHandler.handleDebugMessage(topic, msg)
        break
      case MessageActions.rename:
        MessageHandler.handleRenameMessage(topic, msg)
        break
      case MessageActions.command:
        MessageHandler.handleCommandMessage(topic, msg)
        break
    }
  }

  static handleStateMessage(topic, msg) {
    const { state } = msg
    switch (state) {
      case StateMessageState.sync:
        // 同步状态消息
        MessageHandler.handleStateMessageStateSync(topic, msg)
        break
    }
  }

  static handleStateMessageStateSync(topic, msg) {
    global.stateMessage = cloneDeep(msg)
    const { properties } = global.stateMessage

    properties.forEach(async (a) => {
      switch (a.property) {
        case 'url':
          global.config.url = a.value
          global.saveConfig()
          MessageHandler.message('同步配置成功')
          global.mainWindow.webContents.send('refreshConfig')
          break
      }
    })
  }

  static handleDebugMessage(topic, msg) {
    global.mainWindow.webContents.send('debugMessage', msg)
  }

  static handleRenameMessage(topic, msg) {
    const { alias } = msg
    if (isNil(alias)) return
    if (alias === global.config.alias) return
    global.config.alias = alias
    global.saveConfig()
  }

  static handleCommandMessage(topic, msg) {
    console.log(topic, msg)

    const { command } = msg
    switch (command) {
      case 'reload':
        global.mainWindow.webContents.send('reload')
        MessageHandler.message('刷新网页成功')
        break
    }
  }

  static message(msg) {
    global.mainWindow.webContents.send('message', msg)
  }
}
