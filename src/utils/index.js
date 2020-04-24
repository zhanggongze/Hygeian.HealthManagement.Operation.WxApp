function formatNumber(n) {
  const str = n.toString()
  return str[1] ? str : `0${str}`
}

export function formatTime(str, type) {
  let date = new Date(str)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  // const second = date.getSeconds()

  const t1 = [year, month, day].map(formatNumber).join('-')
  const t2 = [hour, minute].map(formatNumber).join(':')

  return type ? `${t1}` : `${t1} ${t2}`
}

/**
 * toast提示
 * @param {*} msg
 */
function toast(msg) {
  wx.showToast({
    title: msg,
    icon: 'none',
    duration: 1000
  })
}

export function throttle(func, wait) {
  let timeout
  return function () {
    let that = this
    let args = arguments

    if (!timeout) {
      timeout = setTimeout(function () {
        timeout = null
        func.apply(that, args)
      }, wait)
    }
  }
}

/**
 * 获取年龄
 * @param {String} str
 */
export function getAge(str) {
  let date = new Date(str)
  return new Date().getFullYear() - date.getFullYear()
}

export function timeHandle(date, flag) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  // 当前零点
  let curTime = new Date(new Date().toLocaleDateString()).getTime()
  let time = date.getTime()
  if (time > curTime) {
    return [hour, minute].map(formatNumber).join(':')
  } else {
    if (flag) {
      return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':')
    } else {
      return [year, month, day].map(formatNumber).join('-')
    }
  }
}

export function uuid(len, radix) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  let uuid = []
  let i = 0
  radix = radix || chars.length
  if (len) {
    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]
  } else {
    var r
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = '4'
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16
        uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r]
      }
    }
  }
  return uuid.join('')
}

export default {
  formatNumber,
  formatTime,
  throttle,
  toast,
  getAge,
  timeHandle,
  uuid
}
