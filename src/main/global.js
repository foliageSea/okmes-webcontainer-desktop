import { app } from 'electron'
import { StateMessageState, MessageActions } from './message_handler'
import { Snowflake, getRandomAlias } from './util'
import settings from 'electron-settings'

export function getLocalStoragePath() {
  return app.getPath('userData')
}

class Global {
  constructor() {
    if (Global.instance) {
      return Global.instance
    }
    Global.instance = this

    this.mainWindow = null
    this.config = {
      id: 1,
      type: 'WebContainer',
      alias: '苹果',
      url: 'https://www.baidu.com'
    }
    this.stateMessage = {
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
      ],
      hardware: {
        networkInterface: []
      },
      alias: this.config.alias
    }
    this.willStateMessage = {
      event: 'register',
      deviceType: 'DeskTop',
      state: StateMessageState.willOffline
    }
  }

  themes() {
    const { type, id } = this.config
    return {
      state: `${type}/${MessageActions.state}/${id}`,
      debug: `${type}/${MessageActions.debug}/${id}`,
      command: `${type}/${MessageActions.command}/${id}`,
      rename: `${type}/${MessageActions.rename}/${id}`
    }
  }

  async saveConfig() {
    await settings.set('config', this.config)
  }

  async _initConfig() {
    const hasConfig = await settings.has('config')
    if (!hasConfig) {
      this.config.id = +new Snowflake(1, 1).generate()
      this.config.alias = getRandomAlias()
      await settings.set('config', this.config)
      return
    }

    try {
      this.config = await settings.get('config')
    } catch (e) {
      this.config.id = +new Snowflake(1, 1).generate()
      this.config.alias = getRandomAlias()
      await settings.set('config', this.config)
    }
  }

  async ensureInitialized() {
    await this._initConfig()
  }
}

export default new Global()
