const yaml = require('js-yaml')
const path = require('path')
const fs = require('fs')
const { argv } = require('yargs')
const { isFileExist, readYAML, writeYAML } = require(('./file'))
const getArgs = () => {
  const hostId = argv.host || argv.h || null
  const channelId = argv.cannel || argv.c || null
  const queueId = argv.queue || argv.q || null
  const result = { hostId, channelId, queueId }
  return result
}
// 產生預設的conf 目錄
const createConfFolder = async(setting = null) => {
  if (setting === null) setting = defaultSetting
  try {
    for (let i = 0; i < setting.files.length; i++) {
      const isExist = await isFileExist(setting.files[i].path)
      if (!isExist) await writeYAML(setting.files[i].path, setting.files[i].default)
    }
    return true
  } catch (e) {
    return false
  }
}
module.exports = { createConfFolder, getArgs }
