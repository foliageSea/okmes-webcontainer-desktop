import { isNil } from 'lodash'
import dgram from 'dgram'
import mitt from 'mitt'
import mqtt from 'mqtt'
import os from 'os'

import global from './global'
import { MessageHandler, StateMessageState } from './message_handler'

export default class Socket {
  static emitter = mitt()
  static connected = false
  static client = null

  static init() {
    Socket.emitter.on('MqttServerInfoCollectedEvent', Socket.handleMqttServerInfoCollectedEvent)

    // 组播地址和端口
    const multicastAddress = '224.0.0.167'
    const port = 53318

    const onMessage = (msg, rinfo) => {
      // console.log(`Received message from ${rinfo.address}:${rinfo.port}: ${msg}`)
      try {
        const message = JSON.parse(msg.toString())
        if (message.appName !== 'iReady') return
        const mqttServerInfo = {
          address: rinfo.address,
          port: message.mqttServerPort
        }

        console.log(mqttServerInfo)

        Socket.emitter.emit('MqttServerInfoCollectedEvent', mqttServerInfo)
      } catch (e) {
        console.error('message反序列化失败 \n', e, '\n')
      }
    }
    const onError = (err) => {
      console.log(err)
    }

    new Multicast(multicastAddress, port, onMessage, onError).init()
  }

  static handleMqttServerInfoCollectedEvent(e) {
    if (Socket.connected) return

    console.log('MqttServerInfoCollectedEvent', e)

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
      Socket.client = mqtt.connect(`mqtt://${e.address}:${e.port}`, options)
    } catch (e) {
      console.log('连接 MQTTServer 失败', e)
      Socket.connected = false
      Socket.client = null
      return
    }

    Socket.client.on('connect', async () => {
      // 订阅主题
      const themes = global.themes()
      for (const key in themes) {
        Socket.client.subscribe(themes[key])
      }
      // 设置设备
      await Socket.registerStateMessage()
    })

    Socket.client.on('message', (topic, message) => MessageHandler.handle(topic, message))

    Socket.client.on('close', function () {
      console.log('Connection closed')
      Socket.client.end()
      Socket.connected = false
      Socket.client = null
    })

    Socket.connected = true
  }

  static registerStateMessage() {
    if (!Socket.connected) return
    const { state } = global.themes()

    global.stateMessage.state = StateMessageState.online
    const item = global.stateMessage.properties.find((a) => a.property === 'url')
    if (!isNil(item)) {
      item.value = global.config.url
    }

    try {
      Socket.client.publish(state, JSON.stringify(global.stateMessage), true)
    } catch (e) {
      console.error(e)
    }
  }

  static registerAliasMessage() {
    if (!Socket.connected) return
    const { rename } = global.themes()
    global.renameMessage.alias = global.config.alias
    try {
      Socket.client.publish(rename, JSON.stringify(global.renameMessage), true)
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
  }

  init() {
    const interfaces = os.networkInterfaces()

    // 创建 UDP 套接字
    const socket = dgram.createSocket({
      type: 'udp4',
      reuseAddr: true
    })

    // 绑定端口并开始接收消息
    socket.bind(this.port, () => {
      socket.setBroadcast(true)
      // 绑定到所有网卡上的组播地址
      Object.keys(interfaces).forEach((ifname) => {
        interfaces[ifname].forEach((iface) => {
          if (iface.family === 'IPv4' && !iface.internal) {
            socket.addMembership(this.multicastAddress, iface.address)
            console.log(this.multicastAddress, iface.address)
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
}

// Socket.init()
