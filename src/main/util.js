import { adjectives, nouns } from './alias'

export class Snowflake {
  constructor(workerId, datacenterId, sequence = 0n) {
    this.workerId = BigInt(workerId)
    this.datacenterId = BigInt(datacenterId)
    this.sequence = BigInt(sequence)
    this.timestampShift = 22n
    this.workerIdShift = 17n
    this.datacenterIdShift = 12n
    this.sequenceMask = 4095n // 0b111111111111
    this.twepoch = 1288834974657n // 初始时间戳（毫秒）
    this.lastTimestamp = -1n
  }

  generate() {
    let timestamp = BigInt(Date.now())

    if (timestamp < this.lastTimestamp) {
      throw new Error('Invalid timestamp')
    }

    if (this.lastTimestamp === timestamp) {
      this.sequence = (this.sequence + 1n) & this.sequenceMask
      if (this.sequence === 0n) {
        timestamp = this.waitNextMillis(timestamp)
      }
    } else {
      this.sequence = 0n
    }

    this.lastTimestamp = timestamp

    const id =
      ((timestamp - this.twepoch) << this.timestampShift) |
      (this.datacenterId << this.datacenterIdShift) |
      (this.workerId << this.workerIdShift) |
      this.sequence

    return id.toString()
  }

  waitNextMillis(timestamp) {
    let currentTimestamp = BigInt(Date.now())
    while (currentTimestamp <= timestamp) {
      currentTimestamp = BigInt(Date.now())
    }
    return currentTimestamp
  }
}

export function getRandomAlias() {
  const adjectiveIndex = Math.floor(Math.random() * adjectives.length)
  const nounIndex = Math.floor(Math.random() * nouns.length)
  return adjectives[adjectiveIndex] + nouns[nounIndex]
}
