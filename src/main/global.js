import { isNil } from 'lodash'
import { LocalStorage } from 'node-localstorage'

import { StateMessageState, MessageActions } from './message_handler'

import { machineIdSync } from 'node-machine-id'

export default class GlobalController {
  static localStorage = new LocalStorage('./config')
  static mainWindow = null
  static config = {
    id: 0,
    type: 'WebContainer',
    alias: '苹果',
    url: 'https://www.baidu.com'
  }
  static stateMessage = {
    event: 'register',
    deviceType: 'DeskTop',
    state: StateMessageState.online,
    properties: [
      {
        property: 'url',
        value: GlobalController.config.url,
        valueType: 'String',
        regex: ''
      }
    ]
  }
  static willStateMessage = {
    event: 'register',
    deviceType: 'DeskTop',
    state: StateMessageState.willOffline
  }
  static debugCallbackMessage = {
    event: '',
    debugId: '',
    debugColor: ''
  }
  static renameMessage = {
    event: 'rename',
    alias: null
  }

  static themes() {
    const { type, id } = GlobalController.config
    return {
      state: `${type}/${MessageActions.state}/${id}`,
      debug: `${type}/${MessageActions.debug}/${id}`,
      command: `${type}/${MessageActions.command}/${id}`,
      rename: `${type}/${MessageActions.rename}/${id}`
    }
  }

  static saveConfig() {
    GlobalController.localStorage.setItem('config', JSON.stringify(GlobalController.config))
  }

  static _initConfig(k, v) {
    if (!GlobalController.localStorage._keys.includes(k)) {
      v.id = uniqueId()

      GlobalController.localStorage.setItem(k, JSON.stringify(v))
      return
    }

    let data = GlobalController.localStorage.getItem(k)
    if (isNil(data)) return

    GlobalController.config = JSON.parse(data)
  }

  static ensureInitialized() {
    GlobalController._initConfig('config', GlobalController.config)

    console.log(machineIdSync())
  }
}
