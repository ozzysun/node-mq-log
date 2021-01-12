// 提供以queue控制程序依序執行
// TODO add後提供ticket供check 完成後可取得結果
class Queue {
  constructor(name, handler) {
    this.name = name
    this.handler = handler
    this.isRunning = false
    this.pool = []
    this.result = {}
  }
  async add(item) {
    const id = `t_${new Date().getTime()}`
    this.pool.push({ item, id })
    if (!this.isRunning) await this.checkPool()
    const result = await this.checkComplete(id)
    return result
  }
  async checkPool() {
    if (this.pool.length > 0) {
      this.isRunning = true
      const queueItem = this.pool.shift()
      await this.run(queueItem)
      await this.checkPool()
    } else {
      this.isRunning = false
      console.log(`queue[${this.name}] complete`)
    }
  }
  async run(queueItem) {
    const id = queueItem.id
    const result = await this.handler(queueItem.item)
    this.result[id] = result
    return result
  }
  // 檢查該id任務是否已經完成
  async checkComplete(id) {
    return new Promise((resolve,reject) => {
      let index = 0
      let limit = 100
      const _id = setInterval(() => {
        index++
        if (this.result[id]) {
          clearInterval(_id)
          resolve(this.result[id])
          delete this.result[id]
        } else {
          if(index >= limit) {
            clearInterval(_id)
            resolve()
          }
        }
      }, 50)
    })
  }
  clean() {
    this.pool = []
    this.result = {}
  }
}
module.exports = Queue
