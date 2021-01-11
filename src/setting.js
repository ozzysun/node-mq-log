const path = require('path')
const process = require('process')
module.exports = {
  files: [
    {
      id: 'config',
      path: path.resolve('./conf/index.yml'),
      default: {
        name: 'logserver',
        version: '0.0.1',
        port: 8899,
        mq: {
          enable: false,
          host: 'rabbitLocal',
          channel: 'main',
          queue: 'mylog'
        },
        mongo: {
          enable: true,
          host: '127.0.0.1',
          port: 27017,
          user: 'root',
          pwd: ''
        }
      }
    },
    {
      id: 'mqHost',
      path: path.resolve('./conf/mqHost.yml'),
      default: {
        rabbitLocal: {
          config: {
            protocol: 'amqp',
            hostname: '127.0.0.1',
            port: 5672,
            username: 'admin',
            password: '5578360',
            frameMax: 0,
            heartbeat: 0,
            vhost: '/'
          },
          channel: {
            main: {
              isConfirm: false,
              queue: [
                { id: 'mylog',
                  common: 'mq 執行log service',
                  option: { durable: false }
                }
              ],
              exchange: [
                { id: 'ex_hello',
                  common: '測試用',
                  type: 'direct',
                  option: { durable: false }
                }
              ]
            }
          }
        }
      }
    }
  ],
  dir: {
    root: process.cwd(), // 整個project根目錄 /node-mq-log
    bin: __dirname // 執行點的目錄 /node-mq-log/src 或 /node-mq-log/dist
  }
}
