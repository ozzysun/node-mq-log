// app 初始化需要執行的工作
const express = require('express')
const bodyParser = require('body-parser') // 用來接收 post req.body x-www-form-urlencoded
const compress = require('compression')
const cors = require('cors')
const { addMongoAPI } = require('./routes/mongoapi')
// 啟動server { router, app, server }
const appInit = (config, port) => {
  const result = getLogServer(config, port)
  return result
}
// 接收到mq呼叫要執行的部份
const appRun = (content, msg) => {
  console.log('content ===')
  console.log(content)
}
const getLogServer = (port, config) => {
  const app = express()
  const router = express.Router()
  // -- app setting ------
  app.use(compress())
  app.use(cors())
  app.use(bodyParser.urlencoded({ // 接收 post www-form-urlencoded與檔案
    limit: '10mb',
    extended: true
  }))
  app.use(bodyParser.json({
    limit: '10mb'
  }))
  app.use(bodyParser.raw())
  app.use('/', router)
  if(config.mongo) addMongoAPI(app, config.mongo)
  const server = app.listen(port, () => {
    console.log(`logserver Start :${port} ...ctr+c to stop service`)
  })
  return { server, app, router}
}
module.exports = { appInit, appRun }