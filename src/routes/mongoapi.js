const { getClient, create: mongoCreate, remove: mongoRemove, update: mongoUpdate, count: mongoCount, query: mongoQuery, pageQuery: mongoPageQuery } = require(`../libs/mongo`)
const addMongoAPI = (app, mongoConfig) => {
  app.get('/mongo/hello',(req, res, next) => {
    res.send('hello')
  })
  // 儲存到mongo
  app.post('/mongo/:db/:collection', async(req, res) => {
    const { db, collection } = req.params
    const { host, port, user, pwd } = mongoConfig
    const { data } = req.body
    // 建立連線 mongo client
    const opt = { host, port, db, user, pwd }
    const client = await getClient(opt)
    // -- save --
    const saveResult = await mongoCreate({ client, db, collection, data })
    console.log(`saveResult=`)
    console.log(saveResult)
    if (saveResult.result.ok === 1) {
      res.send(`add success row length=${saveResult.result.n}`)
    } else {
      res.send('add fail')
    }
  })
  // 統計連線數 ex: http://localhost:8899/mongo/mydb/mycollection/count?query=count>0|submoduleid=%Builder
  app.get('/mongo/:db/:collection/count', async(req, res) => {
    const { db, collection } = req.params
    const { host, port, user, pwd } = mongoConfig
    const { query, options } = req.query
    // 建立連線 mongo client
    const opt = { host, port, db, user, pwd }
    const client = await getClient(opt)
    // -- find --
    const countResult = await mongoCount({ client, db, collection, queryStr: query, options })
    res.json(countResult)
  })
  // 查詢
  // ex: http://localhost:8899/mongo/mydb/mycollection?query=count>0|submoduleid=%Builder&sort=count=desc&page=1&perPage=20
  // page有就會做分頁查詢
  app.get('/mongo/:db/:collection', async(req, res) => {
    const { db, collection } = req.params
    const { host, port, user, pwd } = mongoConfig
    let { query, limit, sort } = req.query
    let { page, perPage, currentPage, countPerPage } = req.query
    const limitRow = 2000 // 當超過這數量的內容 強迫使用分頁顯示
    // 判斷是否分頁 以currentPage與countPerPage為主 但還是會吃 page與perPage
    if (currentPage === undefined) currentPage = page
    if (countPerPage === undefined) countPerPage = perPage
    // 建立連線 mongo client
    const opt = { host, port, db, user, pwd }
    const client = await getClient(opt)
    // 先檢查總數 太大強迫改用page分頁
    const countResult = await mongoCount({ client, db, collection, queryStr: query })
    const tooManyRow = countResult > limitRow
    // 產生next與prev用的base 網址 即完整但去除 page perPage等
    const ignore = ['page', 'perPage', 'currentPage', 'countPerPage']
    const tmp = []
    for (const prop in req.query) {
      if (ignore.indexOf(prop) === -1) tmp.push(`${prop}=${req.query[prop]}`)
    }
    const baseUrl = `${req.protocol}://${req.get('host')}${req.path}?${tmp.join('&')}`
    // -- find --
    let findResult
    if (currentPage === undefined && !tooManyRow) {
      // 不分頁
      findResult = await mongoQuery({ client, db, collection, queryStr: query, limit, sortStr: sort, baseUrl })
    } else {
      // 分頁
      findResult = await mongoPageQuery({ client, db, collection, queryStr: query, limit, sortStr: sort, currentPage, countPerPage, baseUrl })
    }
    res.json(findResult)
  })
  // 更新
  app.put('/mongo/:db/:collection', async(req, res) => {
    const { db, collection } = req.params
    const { host, port, user, pwd } = mongoConfig
    const { filter, data } = req.body
    // 建立連線 mongo client
    const opt = { host, port, db, user, pwd }
    const client = await getClient(opt)
    // -- find --
    const updateResult = await mongoUpdate({ client, db, collection, filter, data })
    res.json(updateResult)
  })
  // 刪除
  app.delete('/mongo/:db/:collection', async(req, res) => {
    const { db, collection } = req.params
    const { host, port, user, pwd } = mongoConfig
    const { filter, options } = req.body
    // 建立連線 mongo client
    const opt = { host, port, db, user, pwd }
    const client = await getClient(opt)
    // -- remove --
    const result = await mongoRemove({ client, db, collection, filter, options })
    res.json(result)
  })
  app.post('/log/:db/:collection', async(req, res, next) => {
    const { db, collection} = req.params
    const { host, port, user, pwd } = mongoConfig
    const data = req.body
    if (!data.createdDate) data.createdDate = new Date()
    // 建立連線 mongo client
    const opt = { host, port, db, user, pwd }
    const client = await getClient(opt)
    // -- save --
    const saveResult = await mongoCreate({ client, db, collection, data })
    if (saveResult.result.ok === 1) {
      res.send(`add success row length=${saveResult.result.n}`)
    } else {
      res.send(res, 'add fail')
    }
  })
}
module.exports = { addMongoAPI }
