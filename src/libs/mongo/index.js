/** 將mongo 工具包裝可更簡易使用的版本 以這裡功能對外使用 */
const { parseSortStr, parseQueryStr } = require('./contentParser')
const { getClient, create, remove, query, update } = require('./mongo-base')
const Queue = require(`../Queue`)
// 統計數量
const count = async({ client, db, collection, queryStr, limit, autoClose = true }) => {
  const dbase = client.db(db)
  const myCollection = dbase.collection(collection)
  // queryStr
  const queryObj = parseQueryStr(queryStr)
  const options = {}
  if (limit !== undefined) options.limit = parseInt(limit)
  const result = myCollection.countDocuments(queryObj, options)
  if (autoClose) {
    setTimeout(() => {
      client.close()
    }, 500)
  }
  return result
}
// queryStr= a>1|b!=2|c=%x%|
// sortStr = count=desc|path=desc
const simpleQuery = async({ client, db, collection, queryStr, fields = [], sortStr = null, limit = 0, autoClose = true, skip = 0, baseUrl }) => {
  // options - limit and fields and sort
  const options = { limit }
  if (fields.length > 0) options.fields = fields
  if (skip > 0) options.skip = parseInt(skip)
  const sort = parseSortStr(sortStr)
  if (sort.length > 0) options.sort = sort
  // queryStr
  const queryObj = parseQueryStr(queryStr)
  // console.log({ query: queryObj, options })
  const data = await query({ client, db, collection, query: queryObj, options })
  // 取得meta資訊
  const meta = {
    currentPage: 1,
    totalPage: 1,
    countPerPage: data.length,
    count: data.length,
    total: data.length
  }
  if (autoClose) client.close()
  return { data, meta }
}
const pageQuery = async({ client, db, collection, queryStr, fields = [], sortStr = null, currentPage = 1, countPerPage = 50, total, baseUrl }) => {
  // 沒有總筆數就去查詢
  if (total === undefined) {
    total = await count({ client, db, collection, queryStr, autoClose: false })
  }
  currentPage = parseInt(currentPage)
  countPerPage = parseInt(countPerPage)
  const skip = countPerPage * (currentPage - 1)
  const queryResult = await simpleQuery({ client, db, collection, queryStr, fields, limit: countPerPage, sortStr, skip })
  // 取得meta資訊
  const meta = {
    currentPage,
    totalPage: Math.ceil(total / countPerPage),
    countPerPage,
    count: queryResult.data.length,
    total
  }
  const next = currentPage < meta.totalPage ? currentPage + 1 : meta.totalPage
  const prev = currentPage > 1 ? currentPage - 1 : 0
  meta.next = `${baseUrl}&currentPage=${next}&countPerPage=${countPerPage}`
  meta.prev = `${baseUrl}&currentPage=${prev}&countPerPage=${countPerPage}`
  return { meta, data: queryResult.data }
}
// create update and delete use queue
const createByQueue = async(item) => {
  if (!global.queue.createQ) {
    global.queue.createQ = new Queue('createQ', async(item) => {
      // 寫入mongo
      return await create(item)
    })
  }
  await global.queue.createQ.add(item)
}
const updateByQueue = async (item) => {
  if (!global.queue.updateQ) {
    global.queue.updateQ = new Queue('updateQ', async(item) => {
      // 寫入mongo
      return await update(item)
    })
  }
  await global.queue.updateQ.add(item)
}
const removeByQueue = async (item) => {
  if (!global.queue.removeQ) {
    global.queue.removeQ = new Queue('removeQ', async(item) => {
      // 寫入mongo
      return await remove(item)
    })
  }
  await global.queue.removeQ.add(item)
}
module.exports = {
  getClient,
  count,
  pageQuery,
  query: simpleQuery,
  create: createByQueue,
  update: updateByQueue,
  remove: removeByQueue
}
