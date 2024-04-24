import { isNil } from 'lodash'
import dgram from 'dgram'
import mitt from 'mitt'
import mqtt from 'mqtt'
import os from 'os'

import global from './global'
import { MessageHandler, StateMessageState } from './message_handler'

export default class $ {
  static emitter = mitt()
  static connected = false
  static client = null
  static multicast = null

  static init() {
    $.emitter.on('MqttServerInfoCollectedEvent', $.handleMqttServerInfoCollectedEvent)

    // 组播地址和端口
    const multicastAddress = '224.0.0.167'
    const port = 53318

    const onMessage = (msg, rinfo) => {
      let mqttServerInfo = null
      try {
        const message = JSON.parse(msg.toString())
        if (message.appName !== 'iReady') return
        mqttServerInfo = {
          address: rinfo.address,
          port: message.mqttServerPort
        }
      } catch (e) {
        console.log('message反序列化失败')
        return
      }

      $.emitter.emit('MqttServerInfoCollectedEvent', mqttServerInfo)
    }
    const onError = (err) => {
      console.log(err)
    }

    $.multicast = new Multicast(multicastAddress, port, onMessage, onError)
    $.multicast.init()
  }

  static handleMqttServerInfoCollectedEvent(e) {
    if ($.connected) return

    try {
      const options = {
        clientId: global.config.id, // 客户端 ID
        will: {
          topic: global.themes().state,
          payload: JSON.stringify(global.willStateMessage), // 遗嘱消息内容
          qos: 1,
          retain: true
        }
      }
      $.client = mqtt.connect(`mqtt://${e.address}:${e.port}`, options)
    } catch (e) {
      console.log('连接 MQTTServer 失败', e)
      $.connected = false
      $.client = null
      return
    }

    $.client.on('connect', async () => {
      console.log(`连接 MQTTServer: ${e.address}:${e.port} 成功`)
      // 订阅主题
      const themes = global.themes()
      for (const key in themes) {
        $.client.subscribe(themes[key])
      }

      await $.registerStateMessage()
      await $.registerAliasMessage()
    })

    $.client.on('message', (topic, message) => MessageHandler.handle(topic, message))

    $.client.on('close', function () {
      console.log(`MQTTServer(${e.address}:${e.port}) 连接断开...`)
      $.client.end()
      $.connected = false
      $.client = null
    })

    $.connected = true
  }

  /**
   * 注册设备
   * @returns void
   */
  static registerStateMessage() {
    if (!$.connected) return
    const { state } = global.themes()

    global.stateMessage.state = StateMessageState.online
    const item = global.stateMessage.properties.find((a) => a.property === 'url')
    if (!isNil(item)) {
      item.value = global.config.url
    }

    const host = $.multicast.getLocalIP()
    console.log('本机IP', host)
    if (!isNil(host)) {
      global.stateMessage.hardware.networkInterface = []
      global.stateMessage.hardware.networkInterface.push({
        name: 'eth0',
        ip: host,
        mac: '',
        type: 'wlan',
        state: 'enable',
        upflow: 1024,
        downflow: 2048
      })
    }

    try {
      $.client.publish(state, JSON.stringify(global.stateMessage), true)
      console.log('[registerStateMessage]', global.stateMessage)
    } catch (e) {
      console.error(e)
    }
  }

  static registerAliasMessage() {
    if (!$.connected) return
    const { rename } = global.themes()
    global.renameMessage.alias = global.config.alias
    try {
      $.client.publish(rename, JSON.stringify(global.renameMessage), true)
      console.log('[registerAliasMessage]', global.renameMessage)
    } catch (e) {
      console.error(e)
    }
  }
}

class Multicast {
  constructor(multicastAddress, port, onMessage, onError) {
    this.multicastAddress = multicastAddress
    this.port = port
    this.onMessage = onMessage
    this.onError = onError
    this.interfaces = os.networkInterfaces()
  }

  init() {
    // 创建 UDP 套接字
    const socket = dgram.createSocket({
      type: 'udp4',
      reuseAddr: true
    })

    // 绑定端口并开始接收消息
    socket.bind(this.port, () => {
      socket.setBroadcast(true)
      // 绑定到所有网卡上的组播地址
      Object.keys(this.interfaces).forEach((ifname) => {
        this.interfaces[ifname].forEach((iface) => {
          if (iface.family === 'IPv4' && !iface.internal) {
            socket.addMembership(this.multicastAddress, iface.address)
            console.log('网卡:', iface.address, '加入组播', this.multicastAddress)
          }
        })
      })
    })

    // 监听消息
    socket.on('message', (message, rinfo) => {
      this.onMessage(message, rinfo)
    })

    socket.on('error', (err) => {
      this.onError(err)
    })
  }

  getLocalIP() {
    const list = []
    const interfaces = this.interfaces

    for (const ifname in interfaces) {
      if (Object.prototype.hasOwnProperty.call(interfaces, ifname)) {
        const ifaceList = interfaces[ifname]
        for (let i = 0; i < ifaceList.length; i++) {
          const iface = ifaceList[i]
          if (iface.family === 'IPv4' && !iface.internal) {
            if (!iface.address.endsWith('.1')) {
              list.push(iface.address)
            }
          }
        }
      }
    }
    return list.length > 0 ? list[0] : null
  }
}
