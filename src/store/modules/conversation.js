import { timeHandle } from '../../utils/index'
import { decodeElement } from '../../utils/decodeElement'
import { envConfig } from '@/env/index'

const conversationModules = {
  state: {
    allConversation: [], // 所有的conversation
    currentConversationID: '', // 当前聊天对话ID
    currentConversation: {}, // 当前聊天对话信息
    currentMessageList: [], // 当前聊天消息列表
    nextReqMessageID: '', // 下一条消息标志
    isCompleted: false, // 当前会话消息是否已经请求完毕
    isLoading: false // 是否正在请求
  },
  getters: {
    allConversation: state => state.allConversation,
    // 当前聊天对象的ID
    toAccount: state => {
      if (state.currentConversationID.indexOf('C2C') === 0) {
        return state.currentConversationID.substring(3)
      } else if (state.currentConversationID.indexOf('GROUP') === 0) {
        return state.currentConversationID.substring(5)
      }
    },
    // 当前聊天对象的昵称
    toName: state => {
      if (state.currentConversation.type === 'C2C') {
        return state.currentConversation.userProfile.userID
      } else if (state.currentConversation.type === 'GROUP') {
        return state.currentConversation.groupProfile.name
      }
    },
    // 当前聊天对话的Type
    currentConversationType: state => {
      if (state.currentConversationID.indexOf('C2C') === 0) {
        return 'C2C'
      }
      if (state.currentConversationID.indexOf('GROUP') === 0) {
        return 'GROUP'
      }
      return ''
    },
    currentConversation: state => state.currentConversation,
    currentMessageList: state => state.currentMessageList
  },
  mutations: {
    // 历史头插消息列表
    unshiftMessageList(state, messageList) {
      let list = [...messageList].filter(obj => obj.type !== 'TIMGroupTipElem')
      for (let i = 0; i < list.length; i++) {
        let message = list[i]
        if (message.from.indexOf('CSR.') > -1) {
          message.customAvatar = envConfig.FILEBASEURL + '/avatar/' + message.from.replace('CSR.', '') + '.png'
        }
        list[i].virtualDom = decodeElement(message)
        let date = new Date(message.time * 1000)
        list[i].newtime = timeHandle(date, true)
        if (message.type === 'TIMImageElem') {
          let file = message.payload.imageInfoArray.find(obj => obj.sizeType === 1)
          if (file) {
            let width = 0
            let height = 0
            if (file['width'] > 250) {
              width = 200
              height = file['height'] / (file['width'] / 200)
            } else {
              width = file['width']
              height = file['height']
            }
            message.imgW = width
            message.imgH = height
          }
        }
        if (date) {
          if (i === 0) {
            list[i].timeGroup = list[i].newtime
          } else {
            if (list[i].time - list[i - 1].time > 120) {
              list[i].timeGroup = list[i].newtime
            }
          }
        }
      }
      state.currentMessageList = [...list, ...state.currentMessageList]
    },
    // 收到
    receiveMessage(state, messageList) {
      let list = [...messageList].filter(obj => obj.type !== 'TIMGroupTipElem')
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        list[i].virtualDom = decodeElement(item)
        let date = new Date(item.time * 1000)
        list[i].newtime = timeHandle(date, true)
        if (item.type === 'TIMImageElem') {
          let file = item.payload.imageInfoArray.find(obj => obj.sizeType === 1)
          if (file) {
            let width = 0
            let height = 0
            if (file['width'] > 250) {
              width = 200
              height = file['height'] / (file['width'] / 200)
            } else {
              width = file['width']
              height = file['height']
            }
            item.imgW = width
            item.imgH = height
          }
        }
        if (date) {
          if (i === 0) {
            list[i].timeGroup = list[i].newtime
          } else {
            if (list[i].time - list[i - 1].time > 120) {
              list[i].timeGroup = list[i].newtime
            }
          }
        }
      }
      state.currentMessageList = [...state.currentMessageList, ...list]
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 99999
        })
      }, 800)
    },
    sendMessage(state, message) {
      message.virtualDom = decodeElement(message)
      let date = new Date(message.time * 1000)
      message.newtime = timeHandle(date)
      state.currentMessageList.push(message)
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 99999
        })
      }, 800)
    },
    // 更新当前的会话
    updateCurrentConversation(state, conversation) {
      state.currentConversation = conversation
      state.currentConversationID = conversation.conversationID
    },
    // 更新当前所有会话列表
    updateAllConversation(state, list) {
      for (let i = 0; i < list.length; i++) {
        if (list[i].lastMessage && (typeof list[i].lastMessage.lastTime === 'number')) {
          let date = new Date(list[i].lastMessage.lastTime * 1000)
          list[i].lastMessage._lastTime = timeHandle(date)
        }
      }
      state.allConversation = list
    },
    // 重置当前会话
    resetCurrentConversation(state) {
      state.currentConversationID = '' // 当前聊天对话ID
      state.currentConversation = {} // 当前聊天对话信息
      state.currentMessageList = [] // 当前聊天消息列表
      state.nextReqMessageID = '' // 下一条消息标志
      state.isCompleted = false // 当前会话消息是否已经请求完毕
      state.isLoading = false // 是否正在请求
    },
    resetAllConversation(state) {
      state.allConversation = []
    },
    removeMessage(state, message) {
      state.currentMessageList.splice(state.currentMessageList.findIndex(item => item.ID === message.ID), 1)
    },
    changeMessageStatus(state, index) {
      state.currentMessageList[index].status = 'fail'
    }
  },
  actions: {
    // 消息事件
    onMessageEvent(context, event) {
      if (event.name === 'onMessageReceived') {
        let id = context.state.currentConversationID
        if (!id) {
          return
        }
        let list = []
        event.data.forEach(item => {
          if (item.conversationID === id) {
            list.push(item)
          }
        })
        context.commit('receiveMessage', list)
      }
    },
    // 获取消息列表
    getMessageList(context) {
      const { currentConversationID, nextReqMessageID } = context.state
      // 判断是否拉完了
      if (!context.state.isCompleted) {
        if (!context.state.isLoading) {
          context.state.isLoading = true
          wx.$app.getMessageList({ conversationID: currentConversationID, nextReqMessageID: nextReqMessageID, count: 15 }).then(res => {
            context.state.nextReqMessageID = res.data.nextReqMessageID
            context.commit('unshiftMessageList', res.data.messageList)
            if (res.data.isCompleted) {
              context.state.isCompleted = true
              // wx.showToast({
              //   title: '更新成功',
              //   icon: 'none',
              //   duration: 1500
              // })
            }
            context.state.isLoading = false
          }).catch(err => {
            console.log(err)
          })
        } else {
          wx.showToast({
            title: '你拉的太快了',
            icon: 'none',
            duration: 500
          })
        }
      } else {
        wx.showToast({
          title: '没有更多啦',
          icon: 'none',
          duration: 1500
        })
      }
    }
  }
}

export default conversationModules
