import Fly from 'flyio/dist/npm/wx'
import httpFlyConfig from '@/assets/js/httpFlyConfig'
import { envConfig } from '@/env/index'

let fly = new Fly()

class HttpFly {
  /**
   * @param {*} reqdata 请求参数
   * @param {*} url 请求地址
   * @param {*} callBack 成功回调
   * @param {*} errorback 失败回调
   */
  post(reqdata, url, callBack, errorBack, noMask) {
    if (!noMask) {
      wx.showLoading({
        title: '请求加载中',
        mask: true
      })
    }
    let _this = this
    this._post(reqdata, url)
      .then(function (response) {
        if (callBack) {
          callBack(response)
        }
      })
      .catch(function (error) {
        if (errorBack) {
          errorBack(error)
        } else {
          _this._error(error)
        }
      })
  }

  /**
   * @param {*} reqData 请求参数
   * @param {*} url URL地址
   * @param {*} headers 请求头
   */
  _post(reqData, url, headers) {
    if (headers) {
      this._headerSet(headers)
    }
    let _url = httpFlyConfig.baseURL + url
    return fly.post(_url, JSON.stringify(reqData), httpFlyConfig)
  }

  get(url, callBack, errorBack) {
    this._get(url)
      .then(function (response) {
        if (callBack) {
          callBack(response)
        }
      })
      .catch(function (error) {
        if (errorBack) {
          errorBack(error)
        } else {
          this._error(error)
        }
      })
  }

  /**
   * @param {请求参数} reqData
   * @param {请求地址} url
   * @param {请求头} headers
   */
  _get(url, headers) {
    if (headers) {
      this._headerSet(headers)
    }
    let _url = httpFlyConfig.baseURL + url
    return fly.get(_url)
  }

  _error(err) {
    if (err.status === 401) {
      return
    }
    let msg = '网络异常'
    if (err.status === 400) {
      let contentType = err.response && err.response.headers && err.response.headers['content-type'] ? err.response.headers['content-type'] : ''
      if (contentType && contentType.length && contentType[0].indexOf('text/html') > -1) {
        msg = '服务器内部错误'
      } else {
        msg = '参数请求错误'
      }
    } else if (err.message.match('timeout')) {
      msg = '请求超时,请稍后重试'
    } else if (err.response) {
      msg = err.response.data.title
    }

    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 1500,
      mask: false
    })
  }

  /**
   * @param {*} headers 请求头
   */
  _headerSet(headers) {
    // 原始请求头和准备添加的请求头
    let originHeaders = httpFlyConfig.headers
    let appendHeaders = headers
    // 请求头合并
    if (appendHeaders) {
      for (let key in appendHeaders) {
        originHeaders[key] = appendHeaders[key]
      }
    }
  }
}

function toLogin() {
  let pages = getCurrentPages()
  let currPage = pages[pages.length - 1]
  // 拼凑当前页面page+param
  let targetpage = (currPage.route).replace('pages/', '../')
  for (let name in currPage.options) {
    targetpage += '&' + name + '=' + currPage.options[name]
  }
  let targetUrl = targetpage.replace('&', '?')

  wx.setStorageSync('targetUrl', targetUrl)
  wx.redirectTo({
    url: '../start/main'
  })
}

class Interceptors {
  request() {
    // 添加请求拦截器
    fly.interceptors.request.use((request) => {
      // 打印出请求体
      let token = wx.getStorageSync('token')

      if (token) {
        request.headers['Authorization'] = token
      }

      let urlParam = 'TBB_Longitude=' + wx.getStorageSync('TBB_Longitude') +
                      '&TBB_Latitude=' + wx.getStorageSync('TBB_Latitude') +
                      '&TBB_Session=' + wx.getStorageSync('TBB_Session') +
                      '&TBB_ClientID=' + wx.getStorageSync('TBB_ClientID') +
                      '&TBB_APP_Version=' + wx.getStorageSync('TBB_APP_Version') +
                      '&TBB_Version=' + envConfig.VERSION
      request.url = request.url + (request.url.indexOf('?') > -1 ? '&' : '?') + urlParam

      return request
    })
  }

  response() {
    fly.interceptors.response.use(
      (response) => {
        wx.hideLoading()
        return response.data
      },
      (err) => {
        wx.hideLoading()
        if (err.status === 401) {
          if (!wx.getStorageSync('refreshToken')) {
            toLogin()
          } else {
            return new Fly().post(httpFlyConfig.baseURL + '/identities/api/v1/token/refresh', JSON.stringify({
              refreshToken: wx.getStorageSync('refreshToken')
            }), httpFlyConfig)
              .then(res => {
                if (res && res.data && res.data.accessToken) {
                  wx.setStorageSync('token', 'Bearer ' + res.data.accessToken)
                  wx.setStorageSync('refreshToken', res.data.refreshToken)
                  err.request.headers.Authorization = res.data.accessToken
                  return fly.request(err.request)
                } else {
                  wx.removeStorageSync('token')
                  wx.removeStorageSync('refreshToken')
                  wx.reLaunch({
                    url: '../start/main'
                  })
                }
              })
              .catch(() => {
                wx.removeStorageSync('token')
                wx.removeStorageSync('refreshToken')
                wx.reLaunch({
                  url: '../start/main'
                })
              })
          }
        } else {
          // 只将请求结果的data字段返回
          console.log(err)
        }
      }
    )
  }
}

let flyInterceptors = new Interceptors()

flyInterceptors.request()
flyInterceptors.response()

export default new HttpFly()
