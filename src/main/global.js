import { isNil } from 'lodash'
import { LocalStorage } from 'node-localstorage'

export default class GlobalController {
  static localStorage = new LocalStorage('./config')
  static mainWindow = null
  static config = {
    url: 'https://www.baidu.com'
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
