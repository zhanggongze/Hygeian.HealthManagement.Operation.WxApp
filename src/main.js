import Vue from 'mpvue'
import App from './App'
import * as TIM from '../static/js/tim-wx'
// import TIM from 'tim-wx-sdk'
import store from './store/index'
import COS from 'cos-wx-sdk-v5'
import TYPES from './utils/types'

import httpFly from '@/assets/js/httpFly'
import utils from '@/utils/index'
import dict from '@/utils/dict'
import '@/assets/css/common.css'
import { envConfig } from '@/env/index'

Vue.config.productionTip = false
App.mpType = 'app'
const tim = TIM.create({
  SDKAppID: envConfig.SDKAPPID
})
tim.setLogLevel(1)
wx.$app = tim
wx.$app.registerPlugin({ 'cos-wx-sdk': COS })

let $bus = new Vue()
Vue.prototype.TIM = TIM
Vue.prototype.$type = TYPES
Vue.prototype.$store = store
Vue.prototype.$bus = $bus
Vue.prototype.httpFly = httpFly
Vue.prototype.utils = utils
Vue.prototype.dict = dict

tim.on(TIM.EVENT.SDK_READY, onReadyStateUpdate, this)
tim.on(TIM.EVENT.SDK_NOT_READY, onReadyStateUpdate, this)

tim.on(TIM.EVENT.KICKED_OUT, kickedOut, this)

// 出错统一处理
tim.on(TIM.EVENT.ERROR, handleError, this)

tim.on(TIM.EVENT.MESSAGE_RECEIVED, messageReceived, this)
tim.on(TIM.EVENT.CONVERSATION_LIST_UPDATED, convListUpdate, this)
tim.on(TIM.EVENT.GROUP_LIST_UPDATED, updateGroupList, this)
tim.on(TIM.EVENT.BLACKLIST_UPDATED, updateBlacklist, this)

tim.on(TIM.EVENT.GROUP_SYSTEM_NOTICE_RECEIVED, groupSystemNoticeUpdate, this)

function kickedOut() {
  store.commit('resetGroup')
  store.commit('resetUser')
  store.commit('resetCurrentConversation')
  store.commit('resetAllConversation')
  wx.showToast({
    title: '你已被踢下线',
    icon: 'none',
    duration: 1500
  })
  setTimeout(() => {
    wx.showModal({
      title: '温馨提示',
      showCancel: false,
      confirmColor: '#3D5A8B',
      content: '您的账号在其他设备已登录，是否重新登录',
      success(res) {
        if (res.confirm) {
          wx.reLaunch({
            url: '/pages/start/main'
          })
        }
      }
    })
  }, 1500)
}

function handleError(event) {
  // 网络错误不弹toast && sdk未初始化完全报错
  if (event.data.code !== 2800 && event.data.code !== 2999) {
    store.commit('showToast', {
      title: event.data.message,
      duration: 2000
    })
  }
}

function messageReceived(event) {
  for (let i = 0; i < event.data.length; i++) {
    let item = event.data[i]
    if (item.type === TYPES.MSG_GRP_TIP) {
      if (item.payload.operationType) {
        $bus.$emit('groupNameUpdate', item.payload)
      }
    }
  }
  store.dispatch('onMessageEvent', event)
}

function convListUpdate(event) {
  store.commit('updateAllConversation', event.data)
}

function updateGroupList(event) {
  store.commit('updateGroupList', event.data)
}

function updateBlacklist(event) {
  store.commit('updateBlacklist', event.data)
}

function groupSystemNoticeUpdate(event) {
  console.log('system message', event)
}

function onReadyStateUpdate({ name }) {
  const isSDKReady = (name === TIM.EVENT.SDK_READY)
  if (isSDKReady) {
    wx.$app.getMyProfile().then(res => {
      store.commit('updateMyInfo', res.data)
    })
    wx.$app.getBlacklist().then(res => {
      store.commit('setBlacklist', res.data)
    })
    let pages = getCurrentPages()
    if (pages[pages.length - 1].route.indexOf('pages/start/main') > -1) {
      wx.hideLoading()
      let targetUrl = wx.getStorageSync('targetUrl')
      if (targetUrl) {
        wx.removeStorageSync('targetUrl')
        if (targetUrl.indexOf('pages/consultation/main') > -1) {
          wx.switchTab({
            url: targetUrl
          })
        } else if (targetUrl.indexOf('pages/chat/main') > -1) {
          let param = targetUrl.split('?')[1].split('&')
          let conversationID = param[0].split('=')[1]
          let healthRecordID = param[1].split('=')[1]
          store.commit('resetCurrentConversation')
          store.commit('resetGroup')
          wx.$app.setMessageRead({
            conversationID: conversationID
          })
          wx.$app.getConversationProfile(conversationID)
            .then((res) => {
              // 更新当前会话
              store.commit('updateCurrentConversation', res.data.conversation)
              // 获取内容列表
              store.dispatch('getMessageList')
              // 如果当前会话为群组会话
              let groupID = conversationID.substring(5)
              // 更新当前群组信息
              wx.$app.getGroupProfile({ groupID: groupID })
                .then(res => {
                  store.commit('updateCurrentGroupProfile', res.data.group)
                })
            })
          let url = `/pages/chat/main?id=${healthRecordID}`
          wx.reLaunch({ url })
        } else {
          wx.redirectTo({
            url: targetUrl
          })
        }
      } else {
        wx.reLaunch({
          url: '/pages/index/main'
        })
      }
    }
  }
  getApp().globalData.isImLogin = isSDKReady
  store.commit('setSdkReady', isSDKReady)
}

const app = new Vue(App)
app.$mount()
