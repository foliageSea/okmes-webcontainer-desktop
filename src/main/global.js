import { isNil } from 'lodash'
import { LocalStorage } from 'node-localstorage'
import path from 'path'
import os from 'os'
import { app } from 'electron'

import { StateMessageState, MessageActions } from './message_handler'
import { Snowflake, getRandomAlias } from './util'

export function getLocalStoragePath() {
  return app.getPath('userData')
}

export default class controller {
  static localStorage
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
        value: controller.config.url,
        valueType: 'String',
        regex: ''
      }
    ],
    hardware: {
      networkInterface: []
    },
    alias: controller.config.alias
  }

  static willStateMessage = {
    event: 'register',
    deviceType: 'DeskTop',
    state: StateMessageState.willOffline
  }

  static themes() {
    const { type, id } = controller.config
    return {
      state: `${type}/${MessageActions.state}/${id}`,
      debug: `${type}/${MessageActions.debug}/${id}`,
      command: `${type}/${MessageActions.command}/${id}`,
      rename: `${type}/${MessageActions.rename}/${id}`
    }
  }

  static saveConfig() {
    controller.localStorage.setItem('config', JSON.stringify(controller.config))
  }

  static _initConfig(k, v) {
    if (!controller.localStorage._keys.includes(k)) {
      controller.config.id = +new Snowflake(1, 1).generate()
      controller.config.alias = getRandomAlias()
      controller.localStorage.setItem(k, JSON.stringify(v))
      return
    }

    let data = controller.localStorage.getItem(k)
    if (isNil(data)) return

    try {
      controller.config = JSON.parse(data)
    } catch (e) {
      controller.config.id = +new Snowflake(1, 1).generate()
      controller.config.alias = getRandomAlias()
      controller.localStorage.setItem(k, JSON.stringify(v))
    }
  }

  static ensureInitialized() {
    // const dir = path.join(getLocalStoragePath(), 'config')
    controller.localStorage = new LocalStorage('./config')
    console.log('配置文件:', controller.localStorage._location)
    controller._initConfig('config', controller.config)
  }
}
