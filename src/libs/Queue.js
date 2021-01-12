// 提供以queue控制程序依序執行
class Queue {
  constructor(name, handler) {
    this.name = name
    this.handler = handler
    this.isRunning = false
    this.pool = []
  }
  async add(item) {
    this.pool.push(item)
    if (!this.isRunning) await this.check()
  }
  async check() {
    if (this.pool.length > 0) {
      this.isRunning = true
      const item = this.pool.shift()
      await this.run(item)
      await this.check()
    } else {
      this.isRunning = false
      console.log(`queue[${this.name}] complete`)
    }
  }
  async run(item) {
    return this.handler(item)
  }
  clean() {
    this.pool = []
  }
}
module.exports = Queue
