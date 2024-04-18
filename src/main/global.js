import { isNil } from 'lodash'
import { LocalStorage } from 'node-localstorage'

import { StateMessageState, MessageActions } from './message_handler'

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
        value: this.config.url,
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
    const { type, id } = this.config
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
    if (!this.localStorage._keys.includes(k)) {
      this.localStorage.setItem(k, JSON.stringify(v))
      return
    }

    let data = this.localStorage.getItem(k)
    if (isNil(data)) return

    this.config = JSON.parse(data)
  }

  static ensureInitialized() {
    this._initConfig('config', this.config)
  }
}
