import { isNil } from 'lodash'
import dgram from 'dgram'
import mitt from 'mitt'
import mqtt from 'mqtt'

import global from './global'
import { MessageHandler } from './message_handler'

export default class Socket {
  static emitter = mitt()
  static connected = false
  static client = null

  static init() {
    // this.emitter.on('MqttServerInfoCollectedEvent', Socket.handleMqttServerInfoCollectedEvent)
    const udpSocket = dgram.createSocket({ type: 'udp4', reuseAddr: true })

    udpSocket.on('message', (msg, rinfo) => {
      console.log(msg.toString())

      // try {
      //   const message = JSON.parse(msg.toString())
      //   if (message.appName !== 'iReady') return
      //   const mqttServerInfo = {
      //     address: rinfo.address,
      //     port: message.mqttServerPort
      //   }
      //
      //   console.log(mqttServerInfo)
      //
      //   // this.emitter.emit('MqttServerInfoCollectedEvent', mqttServerInfo)
      // } catch (e) {
      //   console.error('message反序列化失败 \n', e, '\n')
      // }
    })


    udpSocket.bind(53318,() => {
      udpSocket.addMembership('224.0.0.167')
      console.log(udpSocket.address())
      console.log('UDP socket is listening on 53318...')
    })


    udpSocket.on('error', (err) => {
      console.error('UDP socket error:', err)
    })
  }

  static handleMqttServerInfoCollectedEvent(e) {
    if (this.connected) return

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
      this.client = mqtt.connect(`mqtt://${e.address}:${e.port}`, options)
    } catch (e) {
      console.log('连接 MQTTServer 失败', e)
      this.connected = false
      this.client = null
      return
    }

    this.client.on('connect', async () => {
      // 订阅主题
      const themes = global.themes()
      for (const key in themes) {
        this.client.subscribe(themes[key])
      }
      // 设置设备
      await this.registerStateMessage()
    })

    this.client.on('message', (topic, message) => MessageHandler.handle(topic, message))

    this.client.on('close', function () {
      console.log('Connection closed')
      Socket.client.end()
      Socket.connected = false
      Socket.client = null
    })

    this.connected = true
  }

  static registerStateMessage() {
    if (!this.connected) return
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
