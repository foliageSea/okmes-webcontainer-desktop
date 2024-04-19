import { isNil } from 'lodash'
import { LocalStorage } from 'node-localstorage'

import { StateMessageState, MessageActions } from './message_handler'
import { Snowflake, getRandomAlias } from './util'

export default class $ {
  static localStorage = new LocalStorage('./config')
  static mainWindow = null
  static config = {
    id: 1,
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
        value: $.config.url,
        valueType: 'String',
        regex: ''
      }
    ],
    hardware: {
      networkInterface: []
    }
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
    const { type, id } = $.config
    return {
      state: `${type}/${MessageActions.state}/${id}`,
      debug: `${type}/${MessageActions.debug}/${id}`,
      command: `${type}/${MessageActions.command}/${id}`,
      rename: `${type}/${MessageActions.rename}/${id}`
    }
  }

  static saveConfig() {
    $.localStorage.setItem('config', JSON.stringify($.config))
  }

  static _initConfig(k, v) {
    if (!$.localStorage._keys.includes(k)) {
      $.config.id = +new Snowflake(1, 1).generate()
      $.config.alias = getRandomAlias()
      $.localStorage.setItem(k, JSON.stringify(v))
      return
    }

    let data = $.localStorage.getItem(k)
    if (isNil(data)) return

    try {
      $.config = JSON.parse(data)
    } catch (e) {
      $.config.id = +new Snowflake(1, 1).generate()

      $.config.alias = getRandomAlias()
      $.localStorage.setItem(k, JSON.stringify(v))
    }
  }

  static ensureInitialized() {
    $._initConfig('config', $.config)
  }
}
