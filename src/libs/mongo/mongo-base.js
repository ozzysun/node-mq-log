/** 提供mongodb的CRUD與連線工具 */
const MongoClient = require('mongodb').MongoClient
// 建立連線 TODO: auth錯誤或是timeout都等很久 需要找參數
const getClient = async({ host = 'localhost', port = '27017', db, user, pwd }) => {
  const dbPath = `mongodb://${user}:${pwd}@${host}:${port}/${db}`
  const opt = {
    authSource: 'admin', // 儲存使用者資訊的db ,ex:就會在admin/system.user內儲存id:admin.root
    useUnifiedTopology: true,
    connectTimeoutMS: 1000,
    socketTimeoutMS: 1000
  }
  const client = new MongoClient(dbPath, opt)
  try {
    await client.connect()
    // await client.db('admin').command({ ping: 1 })
    this.client = client
    // trace(`Connected mongo successfully to ${dbPath}`)
    return client
  } catch (err) {
    trace('connect error')
    trace(err)
    await client.close()
    return null
  }
}
// --- 查詢 -----------------
const query = async({ client, db, collection, query, options, autoClose = true }) => {
  const dbase = client.db(db)
  const myCollection = dbase.collection(collection)
  if (query !== undefined && typeof query === 'string') query = JSON.parse(query)
  if (options !== undefined && typeof options === 'string') options = JSON.parse(options)
  if (options === undefined) options = { limit: 0 }
  // query={price:{$lt:100}}
  // options= { limit:0, sort, fields:[]} , 排序sort為:[[count,-1]] -1是由大到小, 1是由小到大
  const cursor = myCollection.find(query, options)
  const result = []
  await cursor.forEach(item => {
    result.push(item)
  })
  if (autoClose) client.close()
  return result
}
// 儲存資料 [{}] 或 {}
const create = async({ client, db, collection, data, autoClose = true }) => {
  const dbase = client.db(db)
  const myCollection = dbase.collection(collection)
  if (typeof data === 'string') data = JSON.parse(data)
  if (!Array.isArray(data)) data = [data]
  const res = await myCollection.insertMany(data)
  if (autoClose) client.close()
  return res // { ok:1, n:} ok=1 成功 n:影響row數量
}
// 更新
const update = async({ client, db, collection, filter, data, autoClose = true }) => {
  const dbase = client.db(db)
  const myCollection = dbase.collection(collection)
  if (filter !== undefined && typeof filter === 'string') filter = JSON.parse(filter)
  if (data !== undefined && typeof data === 'string') data = JSON.parse(data)
  data = { $set: data } // update需加上 atomic operator https://docs.mongodb.com/manual/reference/operator/update/
  const result = await myCollection.updateMany(filter, data) //
  if (autoClose) client.close()
  return result
}
// 移除資料
const remove = async({ client, db, collection, filter, options, autoClose = true}) => {
  const dbase = client.db(db)
  const myCollection = dbase.collection(collection)
  if (filter !== undefined && typeof filter === 'string') filter = JSON.parse(filter)
  if (options !== undefined && typeof options === 'string') options = JSON.parse(options)
  if (options === undefined) options = {}
  const result = await myCollection.deleteMany(filter, options)
  if (autoClose) client.close()
  return result
}
const trace = (str) => {
  if (typeof str === 'object') {
    console.log(`[Mongo]`)
    console.log(str)
  } else {
    console.log(`[Mongo] ${str}`)
  }
}
module.exports = { getClient, create, remove, query, update }
