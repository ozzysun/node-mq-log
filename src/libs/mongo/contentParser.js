// 將sortStr = count=desc|path=desc 轉成 [[count,1],[path,-1]]這樣的sort 格式
// ex: http://localhost/api/system/db/mongo/apicount/develop/simple?query=a=1|b%3E2|b%3C10|x=[5,11]|y=3,5,7|s=%hell%&sort=count=asc|path=desc
const parseSortStr = (sortStr) => {
  // options - sort
  const sort = []
  if (sortStr !== null) {
    const tmp = sortStr.split('|') // 分隔符號用|
    tmp.forEach(item => {
      const _tmp = item.split('=')
      // console.log(`prop=${_tmp[0]}`)
      const val = _tmp[1] === 'asc' ? 1 : -1 // asc(1)由小到大, desc由大到小
      sort.push([_tmp[0], val])
    })
  }
  return sort
}
// 將 queryStr=a=1|b>2
// > %3E < %3C
const parseQueryStr = (queryStr) => {
  const query = {}
  const patt = new RegExp('>=<') // 用來檢查是否包含操作符號
  // const likepatt = new RegExp('%')
  if (queryStr !== null && queryStr !== undefined) {
    const tmp = queryStr.split('|') // 分隔符號用|
    tmp.forEach(item => {
      if (item.indexOf('[') !== -1) { // x=[,] 區間
        const obj = parseBetween(item)
        for (const prop in obj) {
          query[prop] = obj[prop]
        }
      } else if (item.indexOf(',') !== -1) { // y=1,2,3 多個
        const obj = parseMulit(item)
        for (const prop in obj) {
          query[prop] = obj[prop]
        }
      } else if (item.indexOf('%') !== -1 && item.indexOf('%3') === -1) { // y=%hell% like 避免濾到> <
        const obj = parseLike(item)
        for (const prop in obj) {
          query[prop] = obj[prop]
        }
      } else if (patt.test(item)) { // 支援操作符號
        const obj = parseOperator(item)
        if (!query[obj.key]) query[obj.key] = {}
        query[obj.key][obj.op] = obj.value
      }
    })
  }
  return query
}
// 將操作符號與字串分開 a>0 轉為 {key:'a', op:'$gt', value: 0}
const parseOperator = (inputStr) => {
  const operator = ['<', '>', '=']
  const optKey = ['$lt', '$gt', '$eq']
  let obj = {}
  operator.forEach((op, index) => {
    if (inputStr.indexOf(op) !== -1) {
      const tmp = inputStr.split(op)
      obj = {
        key: tmp[0],
        value: tmp[1],
        op: optKey[index]
      }
      if (isFinite(obj.value)) obj.value = parseInt(obj.value)
    }
  })
  // console.log(`prop=${obj.key} op=${obj.op} val=${obj.value}`)
  return obj
}
// 將count=[1,5] 轉成 {count:{$gt:1,$lt:5}}
const parseBetween = (inputStr) => {
  const tmp = inputStr.split('=')
  const key = tmp[0]
  const str = tmp[1].substring(1, tmp[1].length - 1)
  const range = str.split(',')
  const start = isFinite(range[0]) ? parseInt(range[0]) : range[0]
  const end = isFinite(range[1]) ? parseInt(range[1]) : range[1]
  const obj = {}
  obj[key] = {
    '$gt': start,
    '$lt': end
  }
  return obj
}
// 將count=1,5 轉成 {count:{$in:[1,5]}}
const parseMulit = (inputStr) => {
  const tmp = inputStr.split('=')
  const key = tmp[0]
  const values = tmp[1].split(',')
  const obj = {}
  obj[key] = { '$in': values }
  return obj
}
// 將count=%hello% 轉成 {count: new RegExp('.*hello.*'}
const parseLike = (inputStr) => {
  const tmp = inputStr.split('=')
  const key = tmp[0]
  let value = tmp[1]
  let pre = ''
  let after = ''
  if (value.indexOf('%') === 0) pre = '.*'
  if (value.lastIndexOf('%') !== 0) after = '.*'
  value = value.replace(new RegExp('%', 'g'), '')
  value = `${pre}${value}${after}`
  const obj = {}
  obj[key] = new RegExp(value)
  return obj
}
module.exports = { parseSortStr, parseQueryStr }
