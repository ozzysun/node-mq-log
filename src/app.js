// app 初始化需要執行的工作
const appInit = () => {
}
// 接收到mq呼叫要執行的部份
const appRun = (content, msg) => {
  console.log('content ===')
  console.log(content)
  console.log('msg==')
  console.log(msg)
}
module.exports = { appInit, appRun }