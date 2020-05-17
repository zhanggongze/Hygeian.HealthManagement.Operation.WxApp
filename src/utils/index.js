function formatNumber(n) {
  const str = n.toString()
  return str[1] ? str : `0${str}`
}

export function formatTime(str, type) {
  if(!str) {
    return ''
  }
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

function formateCity(cityAll) {
  // 省市区
  let province = [], city = [], area = []
  // 格式化后 省市区
  let fmCity = []
  for (const key in cityAll) {
    const element = cityAll[key]
    // 省
    if (key == '86') {
      // 省
      province.push(element)
      for (const key in element) {
        const _element = element[key]
        let o = {
          value: key,
          label: _element,
          number: key
        }
        fmCity.push(o)
      }
    } else {
      // 市
      fmCity.forEach((item) => {
        if (key === item.number) {
          let o
          item.children = []
          for (const _city in element) {
            const _cityName = element[_city]
            // 市
            city.push(element)
            o = {
              value: _city,
              label: _cityName,
              number: _city,
              isLeaf: true
            }
            item.children.push(o)
          }
        }
      })
    }
  }
  return fmCity
}

export function formatDate (v, format) {
  if (!v) return "";
  var d = v;
  if (typeof v === 'string') {
    if (v.indexOf("/Date(") > -1)
      d = new Date(parseInt(v.replace("/Date(", "").replace(")/", ""), 10));
    else
      d = new Date(Date.parse(v.replace(/-/g, "/").replace("T", " ").split(".")[0]));//.split(".")[0] 用来处理出现毫秒的情况，截取掉.xxx，否则会出错
  }
  var o = {
    "M+": d.getMonth() + 1,  //month
    "d+": d.getDate(),       //day
    "h+": d.getHours(),      //hour
    "m+": d.getMinutes(),    //minute
    "s+": d.getSeconds(),    //second
    "q+": Math.floor((d.getMonth() + 3) / 3),  //quarter
    "S": d.getMilliseconds() //millisecond
  };
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
    }
  }
  return format;
}

export function formatGMTDate(str) {
  if(!str) {
    return ''
  }
  let date = new Date(str.replace(/-/g, '/'))
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const t1 = [year, month, day].map(formatNumber).join('-')
  const t2 = [hour, minute, second].map(formatNumber).join(':')

  return `${t1}T${t2}+08:00`
}

export default {
  formatNumber,
  formatTime,
  throttle,
  toast,
  getAge,
  timeHandle,
  uuid,
  formateCity,
  formatDate,
  formatGMTDate
}
