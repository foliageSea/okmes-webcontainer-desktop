import { isEmpty, isNil } from 'lodash'
import global from './global'
import Socket from './socket'

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
      case MessageActions.debugCallback:
        MessageHandler.handleDebugCallBackMessage()
        break
      case MessageActions.rename:
        MessageHandler.handleRenameMessage(topic, msg)
        break
    }
  }

  static handleStateMessage(topic, msg) {
    const { state } = msg
    switch (state) {
      case StateMessageState.sync:
        // 同步状态消息
        global.handleStateMessageStateSync(topic, msg)
        break
    }
  }

  static handleDebugCallBackMessage() {}

  static handleRenameMessage(topic, msg) {
    const { alias } = msg
    if (isNil(alias)) return
    if (alias === global.globalConfig.alias) return
    global.globalConfig.alias = alias
    global.saveGlobalConfig()
    Socket.registerAliasMessage()
  }
}
