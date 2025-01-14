import { isNil } from 'lodash'
import dgram from 'dgram'
import mitt from 'mitt'
import mqtt from 'mqtt'
import os from 'os'

import global from './global'
import { MessageHandler, StateMessageState } from './message_handler'

class Socket {
  constructor() {
    if (Socket.instance) {
      return Socket.instance
    }
    Socket.instance = this

    this.emitter = mitt()
    this.connected = false
    this.client = null
    this.multicast = null
  }

  static getInstance() {
    if (!Socket.instance) {
      Socket.instance = new Socket()
    }
    return Socket.instance
  }

  init() {
    this.emitter.on(
      'MqttServerInfoCollectedEvent',
      this.handleMqttServerInfoCollectedEvent.bind(this)
    )

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

      this.emitter.emit('MqttServerInfoCollectedEvent', mqttServerInfo)
    }
    const onError = (err) => {
      console.log(err)
    }

    this.multicast = new Multicast(multicastAddress, port, onMessage, onError)
    this.multicast.init()
  }

  handleMqttServerInfoCollectedEvent(e) {
    if (this.connected) return

    try {
      const options = {
        clientId: global.config.id,
        will: {
          topic: global.themes().state,
          payload: JSON.stringify(global.willStateMessage),
          qos: 1,
          retain: true
        }
      }
      this.client = mqtt.connect(`mqtt://${e.address}:${e.port}`, options)
    } catch (e) {
      console.log('连接 MQTTServer 失败', e)
      this.connected = false
      this.client = null
      return
    }

    this.client.on('connect', async () => {
      console.log(`连接 MQTTServer: ${e.address}:${e.port} 成功`)
      const themes = global.themes()
      for (const key in themes) {
        this.client.subscribe(themes[key])
      }

      await this.registerStateMessage()
    })

    this.client.on('message', (topic, message) => MessageHandler.handle(topic, message))

    this.client.on('close', () => {
      console.log(`MQTTServer(${e.address}:${e.port}) 连接断开...`)
      this.client.end()
      this.connected = false
      this.client = null
    })

    this.connected = true
  }

  registerStateMessage() {
    if (!this.connected) return
    const { state } = global.themes()

    global.stateMessage.state = StateMessageState.online
    const item = global.stateMessage.properties.find((a) => a.property === 'url')
    if (!isNil(item)) {
      item.value = global.config.url
    }

    const host = this.multicast.getLocalIP()
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

    global.stateMessage.alias = global.config.alias

    try {
      this.client.publish(state, JSON.stringify(global.stateMessage), true)
      console.log('[registerStateMessage]', global.stateMessage)
    } catch (e) {
      console.error(e)
    }
  }
}

export default Socket.getInstance()

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
