const yaml = require('js-yaml')
const path = require('path')
const fs = require('fs')
const { argv } = require('yargs')
// yaml 讀取
const readYAML = async(sourceFile) => {
  const filePath = path.resolve(sourceFile)
  return new Promise((resolve, reject) => {
    try {
      const doc = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'))
      resolve(doc)
    } catch (e) {
      reject(e)
    }
  })
}
const getArgs = () => {
  const hostId = argv.host || argv.h || null
  const channelId = argv.cannel || argv.c || null
  const queueId = argv.queue || argv.q || null
  const result = { hostId, channelId, queueId }
  return result
}
module.exports = { readYAML, getArgs }