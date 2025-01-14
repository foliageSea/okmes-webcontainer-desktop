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
  constructor() {
    if (MessageHandler.instance) {
      return MessageHandler.instance
    }
    MessageHandler.instance = this
  }

  handle(topic, message) {
    // console.log(topic, message.toString());
    const [softwareType, action, deviceId] = topic.split('/')
    if (isEmpty(softwareType)) return
    if (isEmpty(action)) return
    if (isEmpty(deviceId)) return
    const msg = JSON.parse(message.toString())
    switch (action) {
      case MessageActions.state:
        this.handleStateMessage(topic, msg)
        break
      case MessageActions.debug:
        this.handleDebugMessage(topic, msg)
        break
      case MessageActions.rename:
        this.handleRenameMessage(topic, msg)
        break
      case MessageActions.command:
        this.handleCommandMessage(topic, msg)
        break
    }
  }

  handleStateMessage(topic, msg) {
    const { state } = msg
    switch (state) {
      case StateMessageState.sync:
        // 同步状态消息
        this.handleStateMessageStateSync(topic, msg)
        break
    }
  }

  handleStateMessageStateSync(topic, msg) {
    global.stateMessage = cloneDeep(msg)
    const { properties } = global.stateMessage

    properties.forEach(async (a) => {
      switch (a.property) {
        case 'url':
          global.config.url = a.value
          global.saveConfig()
          this.message('同步配置成功')
          global.mainWindow.webContents.send('refreshConfig')
          break
      }
    })
  }

  handleDebugMessage(topic, msg) {
    global.mainWindow.webContents.send('debugMessage', msg)
  }

  handleRenameMessage(topic, msg) {
    const { alias } = msg
    if (isNil(alias)) return
    if (alias === global.config.alias) return
    global.config.alias = alias
    global.saveConfig()
  }

  handleCommandMessage(topic, msg) {
    console.log(topic, msg)

    const { command } = msg
    switch (command) {
      case 'reload':
        global.mainWindow.webContents.send('reload')
        this.message('刷新网页成功')
        break
    }
  }

  message(msg) {
    global.mainWindow.webContents.send('message', msg)
  }
}

export default new MessageHandler()
