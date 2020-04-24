<template>
  <div id="chat" class="page-wrap" 
    @longpress="handleLongPress"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd">
    <div :class="isRecording ? '' : 'modal-display'" class="record-modal">
      <div class="wrapper">
        <img class="voice-icon" src="/static/images/im_voice_voice.png" />
        <div class="modal-loading">
          <div class="loading-item first"></div>
          <div class="loading-item second"></div>
          <div class="loading-item thrid"></div>
          <div class="loading-item four"></div>
          <div class="loading-item five"></div>
        </div>
      </div>
      <div class="modal-title">{{title}}</div>
    </div>
    <div class="header">
      <div class="status-wrap">
        <div class="icon"></div>
        <div v-if="consultationInfo" class="status" :class="consultationInfo.progress === 500 ? 'blue' : (consultationInfo.progress === 600 ? 'grey' : '')">{{progressTxt}}</div>
      </div>
      <div class="finsh-btn" @click="finshConsultation" v-if="consultationInfo && (consultationInfo.progress === 100 || consultationInfo.progress === 200 || consultationInfo.progress === 300)">结束咨询</div>
    </div>
    <div id="list" :style="{ height: bodyHeight + 'px' }" class="mes-list" @click="loseFocus">
      <scroll-view scroll-y style="height: 100%" :scroll-into-view="lastId">
        <li
          :id="'message-' + index"
          class="mes-item"
          v-for="(message, index) in list"
          :key="index"
          :index="index"
        >
          <div class="time-group" v-if="message.timeGroup">{{message.timeGroup}}</div>
          <div class="notice-mes-wrap" v-if="message.type === 3">
            <div class="notice-mes" v-if="message.data && message.data.length">
              <div class="tip" v-for="(data, jndex) in message.data" :key="jndex">{{data}}</div>
            </div>
          </div>
          <div  v-else class="mes" :class="customerID === message.fromMemberID ? 'item-right' : 'item-left'"
          >
            <div class="load">
              <div :class="message.status"></div>
            </div>
            <div class="content">
              <div class="name" v-if="customerID !== message.fromMemberID">{{customerInfo.patientName}}</div>
              <div class="message patient-message" v-if="message.type === 5">
                <div class="patient-info">
                  <div class="top">
                    <div class="patient-name">{{message.data.patientName}}</div>
                    <div class="patient-sex">{{message.data.patientSex}}</div>
                    <div class="patient-age">{{message.data.patientAge}}岁</div>
                  </div>
                  <div class="describe">{{message.data.illnessDescribe}}</div>
                  <div class="file-list" v-if="message.data.fileList">
                    <img class="file-item" :src="fileUrl" @click="priviewImage(fileUrl, message.data.fileList)" v-for="(fileUrl, jndex) in message.data.fileList" :key="jndex" />
                  </div>
                  <div class="look-btn" @click="toHealthDetail">查看患者健康档案</div>
                </div>
              </div>
              <div class="message" v-else-if="message.type === 0">
                <div class="text-message">{{message.data}}</div>
              </div>
              <div class="message" v-else-if="message.type === 1">
                <img :src="message.data.url" @click="priviewImage(message.data.url)" style="width: 100rpx; height: 100rpx;" alt="" srcset="">
              </div>
              <div class="message" v-else-if="message.type === 2">
                <div class="box" @click="openAudio(message)">
                  <div class="box-sound" :class="{active: playRecord && audioId === message.id}">
                    <div class="sound-symbol">
                      <div class="sound-circle first"></div>
                      <div class="sound-circle second"></div>
                      <div class="sound-circle third"></div>
                    </div>
                  </div>
                  <div style="padding-left: 10px">{{message.data.second}}s</div>
                </div>
              </div>
            </div>
            <div class="avatar">
              <div class="first-name" v-if="customerID !== message.fromMemberID">{{customerInfo.patientFirstName}}</div>
              <img v-if="customerID === message.fromMemberID" :src="doctorInfo.doctor.headImageUrl || '/static/images/header.png'" shape="square" />
            </div>
          </div>
        </li>
      </scroll-view>
    </div>
    <!--    输入框及选择框部分-->
    <div v-if="!isForbiddenSpeak" id="bottom" class="bottom" :style="{ paddingBottom: isIpx ? safeBottom + 'px': '' }">
      <div class="bottom-div">
        <img class="voice" src="/static/images/IM_voice.png" alt @click="chooseRecord" />
        <input
          v-if="!isRecord"
          type="text"
          class="input"
          v-model.lazy:value="messageContent"
          confirm-type="send"
          cursor-spacing="10"
          confirm-hold=true
          hold-keyboard=true
          :focus="isFocus"
          @focus="isFocus = true"
          @confirm="sendTxtMessage"
        />
        <div id="record" class="input record" v-else>
          <template v-if="!isRecording">长按进行录音</template>
          <template v-if="isRecording">抬起停止录音</template>
        </div>
        <img
          v-if="messageContent == '' || isRecord"
          class="add-btn"
          src="/static/images/IM_add.png"
          alt
          @click="openMore"
        />
        <div v-if="messageContent != '' && !isRecord" class="send-btn" @click="sendTxtMessage">发送</div>
      </div>
      <div class="choose-div" v-if="isMoreOpen">
        <img class="choose-item" src="/static/images/im_pic.png" alt @click="sendPhoto('album')" />
      </div>
    </div>
  </div>
</template>
<script>
import Upload from '@/utils/upload'
import { envConfig } from '@/env/index'
const audioContext = wx.createInnerAudioContext()
const recorderManager = wx.getRecorderManager()
const recordOptions = {
  duration: 60000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'aac' // 音频格式，选择此格式创建的音频消息，可以在即时通信 IM 全平台（Android、iOS、微信小程序和Web）互通
}
let interval = null
export default {
  data() {
    return {
      // 会话ID
      consultationID: '',
      // 医生信息
      doctorInfo: null,
      // 患者信息
      customerInfo: null,
      // 咨询信息
      consultationInfo: null,
      // 当前customerID
      customerID: '',
      // 消息列表
      list: [],
      // 是否点击录音
      isRecord: false,
      // 是否正在录音
      isRecording: false,
      // 手指触摸位置
      startPoint: 0,
      // title提示
      title: '正在录音',
      // 是否可以发送
      canSend: true,
      // 语音消息是否播放
      playRecord: false,
      // 当前播放音频消息id
      audioId: '',
      // 文本消息内容
      messageContent: '',
      // 是否禁言
      isForbiddenSpeak: false,
      // 消息输入框是否聚焦
      isFocus: false,
      isIpx: false,
      safeBottom: 34,
      bodyHeight: 0,
      // 是否显示更多
      isMoreOpen: false,
      // 最后一条消息的ID
      lastId: '',
      // 咨询状态
      progressTxt: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.doctorInfo = wx.getStorageSync('myInfo')
    this.consultationID = options.consultationID
    this.getConsultation()
    let sysInfo = wx.getSystemInfoSync()
    this.isIpx = sysInfo.model.indexOf('iPhone X') > -1
    let query = wx.createSelectorQuery()
    let that = this
    query
      .select('#list')
      .boundingClientRect(function(res) {
        that.bodyHeight = that.isIpx ? res.height - 34 : res.height
      })
      .exec()
    recorderManager.onStart(() => {
      console.log('recorder start')
    })
    recorderManager.onPause(() => {
      console.log('recorder pause')
    })
    recorderManager.onStop((res) => {
      wx.hideLoading()
      if (this.canSend) {
        if (res.duration < 1000) {
          this.utils.toast('录音时间太短')
        } else {
          this.isFocus = false
          this.isMoreOpen = false
          let mkdir = `service/consultant/ask/${this.consultationID}/`
          Upload.uploadFile(res.tempFilePath, mkdir).then(filepath => {
            let url = envConfig.FILEBASEURL + '/' + filepath
            let duration = res.duration
            let uid = new Date().getTime()
            this.list.push({
              uid: uid,
              type: 2,
              id: '',
              fromMemberID: this.customerID,
              data: {
                url: url,
                second: Math.ceil(duration / 1000)
              },
              status: 'unSend'
            })
            this.lastId = 'message-' + (this.list.length ? this.list.length - 1 : 0)
            this.sendMessage({
              consultationID: this.consultationID,
              url: url,
              size: res.fileSize,
              second: duration
            }, 2, uid)
            this.getConsultationMessages()
          })
        }
      }
    })
  },
  onShow() {
    this.lastId = ''
  },
  onUnload() {
    clearInterval(interval)
  },
  methods: {
    /**
     * 获取咨询详情
     */
    getConsultation() {
      this.httpFly.post({
        consultationID: this.consultationID
      }, '/servicepackage/api/v1/doctor/Consult/Ask/GetConsultation', res => {
        let consultation = res.consultation
        this.consultationInfo = consultation
        let progress = String(consultation.progress)
        this.isForbiddenSpeak = (progress === '500' || progress === '600')
        this.progressTxt = progress === '500' ? '已完成' : progress === '600' ? '超时取消' : '咨询中'
        let customerInfo = res.members.find(obj => obj.sourceType === 'Doctor')
        this.customerID = customerInfo ? customerInfo.id : ''
        let messageList = res.messages
        this.list = this.list.concat(this.messageHandle(messageList))
        this.lastId = 'message-' + (this.list.length ? this.list.length - 1 : 0)
        wx.setNavigationBarTitle({
          title: consultation.patientName
        })
        interval = setInterval(() => {
          this.getConsultationMessages()
        }, 10000)
      })
    },
    /**
     * 结束咨询
     */
    finshConsultation() {
      let self = this
      wx.showModal({
        title: '温馨提示',
        confirmColor: '#3D5A8B',
        content: '问题已解决，确定结束本次咨询？',
        success(res) {
          if (res.confirm) {
            self.httpFly.post({
              consultationID: self.consultationID
            }, '/servicepackage/api/v1/doctor/Consult/Ask/ComplateConsultation', res => {
              self.isForbiddenSpeak = true
              self.progressTxt = '已完成'
              self.consultationInfo.progress = 500
            })
          }
        }
      })
    },
    /**
     * 发送文本消息
     */
    sendTxtMessage() {
      if (this.messageContent === '') {
        return
      }
      let uid = new Date().getTime()
      this.list.push({
        type: 0,
        fromMemberID: this.customerID,
        data: this.messageContent,
        id: '',
        uid: uid,
        status: 'unSend'
      })
      this.lastId = 'message-' + (this.list.length ? this.list.length - 1 : 0)
      this.sendMessage({
        consultationID: this.consultationID,
        text: this.messageContent
      }, 0, uid)
      this.messageContent = ''
      this.getConsultationMessages()
      this.isFocus = true
      this.isMoreOpen = false
    },
    sendMessage(param, type, uid) {
      let url = ''
      if (type === 0) {
        url = '/servicepackage/api/v1/doctor/Consult/Ask/SendTextMessage'
      } else if (type === 1) {
        url = '/servicepackage/api/v1/doctor/Consult/Ask/SendImageMessage'
      } else if (type === 2) {
        url = '/servicepackage/api/v1/doctor/Consult/Ask/SendAudioMessage'
      }
      return new Promise((resolve, reject) => {
        this.httpFly.post(param, url, res => {
          let curMessage = this.list.find(obj => obj.uid && obj.uid === uid)
          if (curMessage) {
            curMessage.status = 'success'
            curMessage.id = res.messageID
          }
          resolve(res)
        }, error => {
          let curMessage = this.list.find(obj => obj.uid && obj.uid === uid)
          if (curMessage) {
            curMessage.status = 'fail'
          }
          reject(error)
        }, true)
      })
    },
    /**
     * 发送图片消息
     */
    sendPhoto() {
      let mkdir = `service/consultant/ask/${this.consultationID}/`
      let _self = this
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          let filepath = ''
          let size = 0
          if (res && res.tempFiles && res.tempFiles.length) {
            filepath = res.tempFiles[0].path
            size = res.tempFiles[0].size
          }
          _self.isFocus = false
          _self.isMoreOpen = false
          Upload.uploadFile(filepath, mkdir).then(filepath => {
            let url = envConfig.FILEBASEURL + '/' + filepath
            let uid = new Date().getTime()
            _self.list.push({
              uid: uid,
              type: 1,
              id: '',
              fromMemberID: _self.customerID,
              data: {url: url},
              status: 'unSend'
            })
            _self.lastId = 'message-' + (_self.list.length ? _self.list.length - 1 : 0)
            _self.sendMessage({
              consultationID: _self.consultationID,
              url: url,
              size: size
            }, 1, uid)
            _self.getConsultationMessages()
          })
        }
      })
    },
    handleLongPress(e) {
      this.startPoint = e.touches[0]
      if (e.target.id === 'record') {
        this.title = '正在录音'
        this.isRecording = true
        this.startRecording()
        this.canSend = true
      }
    },
    handleTouchMove(e) {
      if (this.isRecording) {
        if (this.startPoint.clientY - e.touches[e.touches.length - 1].clientY > 100) {
          this.title = '松开手指，取消发送'
          this.canSend = false
        } else if (this.startPoint.clientY - e.touches[e.touches.length - 1].clientY > 20) {
          this.title = '上划可取消'
          this.canSend = true
        } else {
          this.title = '正在录音'
          this.canSend = true
        }
      }
    },
    handleTouchEnd() {
      this.isRecording = false
      wx.hideLoading()
      recorderManager.stop()
    },
    /**
     * 选择录音
     */
    chooseRecord() {
      this.isRecord = !this.isRecord
      this.isMoreOpen = false
    },
    /**
     * 开始录音
     */
    startRecording() {
      let _self = this
      wx.getSetting({
        success: (res) => {
          let auth = res.authSetting['scope.record']
          if (auth === false) { // 已申请过授权，但是用户拒绝
            wx.openSetting({
              success: function (res) {
                let auth = res.authSetting['scope.record']
                if (auth === true) {
                  _self.utils.toast('授权成功')
                } else {
                  _self.utils.toast('授权失败')
                }
              }
            })
          } else if (auth === true) { // 用户已经同意授权
            this.isRecording = true
            recorderManager.start(recordOptions)
          } else { // 第一次进来，未发起授权
            wx.authorize({
              scope: 'scope.record',
              success: () => {
                _self.utils.toast('授权成功')
              }
            })
          }
        },
        fail: function () {
          _self.utils.toast('授权失败')
        }
      })
    },
    /**
     * 查询消息列表记录
     */
    getConsultationMessages() {
      this.httpFly.post({
        consultationID: this.consultationID
      }, '/servicepackage/api/v1/doctor/Consult/Ask/GetConsultationMessages', res => {
        let messages = res.messages
        let messageIDs = this.list.map(obj => obj.id).filter(obj => obj !== '')
        if (messages.length !== messageIDs.length) {
          let addList = messages.filter(obj => !messageIDs.includes(obj.id))
          this.list = this.list.concat(this.messageHandle(addList))
          this.lastId = 'message-' + (this.list.length ? this.list.length - 1 : 0)
        }
      }, null, true)
    },
    /**
     * 消息体处理
     */
    messageHandle(messageList) {
      let list = []
      list = messageList.map((obj, i) => {
        obj.time = new Date(obj.creationDateTime).getTime()
        obj.newTime = this.utils.timeHandle(new Date(obj.creationDateTime), true)
        obj.status = 'success'
        if (i === 0) {
          obj.timeGroup = obj.newTime
        } else {
          if (obj.time - messageList[i - 1].time > 120000) {
            obj.timeGroup = obj.newTime
          }
        }
        let type = obj.type
        if (type === 5) {
          let fileList = obj.data ? JSON.parse(obj.data).imageUrls : []
          obj.data = {
            patientName: this.consultationInfo.patientName,
            patientSex: this.consultationInfo.patientSex,
            patientAge: this.consultationInfo.patientAge,
            illnessDescribe: this.consultationInfo.illnessDescribe,
            patientFirstName: this.consultationInfo.patientName.substr(0, 1),
            fileList: fileList.filter(obj => obj !== '')
          }
          this.customerInfo = {
            patientName: this.consultationInfo.patientName,
            patientSex: this.consultationInfo.patientSex,
            patientAge: this.consultationInfo.patientAge,
            patientFirstName: this.consultationInfo.patientName.substr(0, 1)
          }
        } else if (type === 3) {
          let data = JSON.parse(obj.data)
          if (data.event) {
            obj.data = this.dict.MessageEventDict[data.event]
          }
        } else if (type === 1 || type === 2) {
          obj.data = JSON.parse(obj.data)
          if (obj.data.second) {
            obj.data.second = Math.ceil(obj.data.second / 1000)
          }
        }
        return obj
      })
      return list
    },
    /**
     * 查看图片
     */
    priviewImage(url, list) {
      wx.previewImage({
        current: url,
        urls: list && list.length ? list : [url]
      })
    },
    /**
     * 失去焦点
     */
    loseFocus() {
      this.isFocus = false
      this.isMoreOpen = false
    },
    /**
     * 展开更多选项
     */
    openMore() {
      this.isMoreOpen = !this.isMoreOpen
    },
    /**
     * 播放音频
     */
    openAudio(data) {
      if (!data.data.url) {
        return
      }
      this.audioId = data.id
      audioContext.src = data.data.url
      audioContext.play()
      audioContext.onPlay(() => {
        this.playRecord = true
      })
      audioContext.onEnded(() => {
        this.playRecord = false
        this.audioId = ''
        wx.hideToast()
      })
      audioContext.onError(() => {
        this.playRecord = false
        this.audioId = ''
        wx.showToast({
          title: '小程序暂不支持播放该音频格式',
          icon: 'none',
          duration: 2000
        })
      })
    },
    toHealthDetail() {
      wx.navigateTo({
        url: '/pages/healthDetail/main?id=' + this.consultationInfo.healthRecordID
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.page-wrap {
  position: relative;
  height: 100%;
  background-color: #f5f5f5;
   .record-modal {
    height: 400rpx;
    width: 400rpx;
    background: rgba(0, 0, 0, 0.7);
    position: fixed;
    top: 200px;
    z-index: 9999;
    left: 20vw;
    border-radius: 10rpx;
    &.modal-display {
      display: none;
    }
    .wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: 100rpx;
      .voice-icon {
        width: 98rpx;
        height: 140rpx;
      }
      .modal-loading {
        position: relative;
        margin-left: 62rpx;
        width: 120rpx;
        height: 140rpx;
        .loading-item {
          position: absolute;
          left: 0;
          height: 8rpx;
          background-color: #fff;
          border-radius: 4rpx;
          @keyframes fadeInOut {
            0% {
              opacity: 0.4; /*初始状态 透明度为0*/
            }
            100% {
              opacity: 1; /*结尾状态 透明度为1*/
            }
          }
          &.first {
            width: 120rpx;
            top: 0;
            animation: fadeInOut 1s infinite 0.5s;
          }
          &.second {
            width: 80rpx;
            top: 33rpx;
            animation: fadeInOut 1s infinite 0.4s;
          }
          &.thrid {
            width: 60rpx;
            top: 66rpx;
            animation: fadeInOut 1s infinite 0.3s;
          }
          &.four {
            width: 40rpx;
            bottom: 33rpx;
            animation: fadeInOut 1s infinite 0.2s;
          }
          &.five {
            width: 20rpx;
            bottom: 0;
            animation: fadeInOut 1s infinite 0.1s;
          }
        }
      }
    }
    .modal-title {
      margin-top: 75rpx;
      color: #fff;
      text-align: center;
      font-size: 28rpx;
    }
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30rpx;
    height: 100rpx;
    background-color: #fff;
    box-shadow: 0 10rpx 10rpx 0 rgba(153, 153, 153, 0.15);
    font-size: 36rpx;
    .status-wrap {
      display: flex;
      align-items: center;
      .icon {
        margin-right: 10rpx;
        width: 24rpx;
        height: 24rpx;
        border-radius: 50%;
        background-color: #17C877;
      }
      .status {
        color: #17C877;
        &.blue {
          color: rgba(78,145,254,1); 
        }
        &.grey {
          color: #999;
        }
      }
    }
    .finsh-btn {
      width: 150rpx;
      height: 60rpx;
      background: rgba(78,145,254,1);
      border-radius: 30rpx;
      line-height: 60rpx;
      text-align: center;
      font-size: 26rpx;
      color: #fff;
    }
  }
  .mes-list {
    height: calc(100vh - 100rpx - 98rpx);
    background-color: #f5f5f5;
    .mes-item {
      &:first-child {
        .time-group {
          padding-top: 20rpx;
        }
      }
      .time-group {
        color: #999;
        font-size: 26rpx;
        text-align: center;
      }
      .notice-mes-wrap {
        text-align: center;
        .notice-mes {
          display: inline-block;
          margin: 0 auto 30rpx;
          padding: 10rpx 30rpx;
          max-width: 80%;
          background: rgba(221,225,230,1);
          border-radius: 10rpx;
          font-size: 24rpx;
          text-align: center;
          line-height: 40rpx;
          color: #333;
        }
      }
      .mes {
        display: flex;
        justify-content: flex-end;
        padding: 0 30rpx;
        margin-bottom: 40rpx;
        &.item-left {
          flex-direction: row-reverse;
          .content {
            margin-left: 16rpx;
            .message {
              margin-top: 8rpx;
              background-color: #fff;
              box-shadow: 0 10rpx 10rpx 0 rgba(102, 102, 102, 0.15);
              &::after {
                transform: rotate(45deg);
                left: 0;
                border-color: transparent transparent #fff transparent;
              }
              .box {
                .box-sound {
                  .sound-symbol {
                    .sound-circle {
                      border-color: #ccc;
                    }
                  }
                }
              }
            }
          }
        }
        &.item-right {
          flex-direction: row;
          .load {
            margin-top: 54rpx;
            height: 100%;
            width: 30px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            @-webkit-keyframes load {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
            .fail::before {
              padding: 4rpx 16rpx;
              background-color: #fb5250;
              color: #fff;
              content: '!';
              font-size: 24rpx;
              border-radius: 50%;
              cursor: pointer;
            }
            .unSend {
              width: 24rpx;
              height: 24rpx;
              border: 8rpx solid #98c6fd;
              border-bottom: #dbdbdb 8rpx solid;
              border-radius: 50%;
              -webkit-animation: load 1.1s infinite linear;
            }
          }
          .content {
            margin-right: 16rpx;
            .message {
              background: rgba(80, 143, 255, 1);
              box-shadow: 0 10rpx 10rpx 0 rgba(80, 143, 255, 0.15);
              color: #fff;
              &::after {
                right: 0px;
                border-color: transparent transparent #508fff transparent;
                border-bottom-right-radius: 13rpx;
                border-bottom-left-radius: 12rpx;
                transform: rotate(-45deg);
              }
            }
          }
        }
        .content {
          .name {
            font-size: 24rpx;
            color: #8b8fab;
          }
          .message {
            position: relative;
            margin-top: 30rpx;
            padding: 24rpx 20rpx;
            width: fit-content;
            background-color: #fff;
            border-radius: 20rpx;
            word-break: break-all;
            font-size: 28rpx;
            text-align: left;
            &::after {
              content: "";
              position: absolute;
              top: -19rpx;
              border-style: solid;
              border-width: 21rpx;
            }
            &.img-message {
              padding: 0;
              background: transparent;
              box-shadow: none;
              border-radius: 0;
              &::after {
                display: none;
              }
            }
            &.patient-message {
              padding-bottom: 16rpx;
            }
            .patient-info {
              max-width: 500rpx;
              .top {
                display: flex;
                align-items: flex-end;
                font-size: 26rpx;
                color: #999;
                .patient-name {
                  font-size: 32rpx;
                  color: #333;
                }
                .patient-sex {
                  margin: 0 20rpx;
                }
              }
              .describe {
                margin: 10rpx 0;
                font-size: 26rpx;
                color: #999;
              }
              .file-list {
                display: flex;
                flex-wrap: wrap;
                .file-item {
                  margin: 0 10rpx 10rpx 0;
                  width: 100rpx;
                  height: 100rpx;
                }
              }
              .look-btn {
                margin-top: 10rpx;
                padding-top: 16rpx;
                border-top: 1rpx solid #e1e1e1;
                text-align: center;
                font-size: 24rpx;
                color: #4E91FC;
              }
            }
            .text-message {
              display: flex;
              flex-direction: row;
              flex-wrap: wrap;
            }
            .box {
              display: flex;
              align-items: center;
              .box-sound {
                box-sizing: border-box;
                position: relative;
                .sound-symbol {
                  margin-left: 10rpx;
                  margin-right: -40rpx;
                  width: 50rpx;
                  height: 50rpx;
                  box-sizing: border-box;
                  overflow: hidden;
                  transform: rotate(135deg);
                  .sound-circle {
                    border: 5rpx solid #fff;
                    border-radius: 50%;
                    position: absolute;
                    &.first {
                      width: 5rpx;
                      height: 5rpx;
                      background: #cccccc;
                      top: 45rpx;
                      left: 45rpx;
                    }
                    &.second {
                      width: 25rpx;
                      height: 25rpx;
                      top: 35rpx;
                      left: 35rpx;
                    }
                    &.third {
                      width: 40rpx;
                      height: 40rpx;
                      top: 25rpx;
                      left: 25rpx;
                    }
                  }
                }
                &.active {
                  @keyframes fadeInOut {
                    0% {
                      opacity: 0; /*初始状态 透明度为0*/
                    }
                    100% {
                      opacity: 1; /*结尾状态 透明度为1*/
                    }
                  }
                  .second {
                    animation: fadeInOut 1s infinite 0.2s;
                  }
                  .third {
                    animation: fadeInOut 1s infinite 0.4s;
                  }
                }
              }
            }
          }
        }
        .avatar {
          .first-name {
            width: 80rpx;
            height: 80rpx;
            background-color: #8b8fab;
            border-radius: 50%;
            line-height: 80rpx;
            text-align: center;
            font-size: 36rpx;
            color: #fff;
          }
          img {
            width: 80rpx;
            height: 80rpx;
            border-radius: 50%;
          }
        }
      }
    }
  }
  .bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    box-shadow: 0 -2rpx 10rpx 0 rgba(153, 153, 153, 0.26);
    border-radius: 20rpx 20rpx 0 0;
    .bottom-div {
      display: flex;
      align-items: center;
      padding: 0 30rpx;
      height: 98rpx;
      .voice {
        margin: 0 32rpx 0 0;
        width: 44rpx;
        height: 44rpx;
      }
      .input {
        flex: 1;
        margin-right: 28rpx;
        padding: 0 20rpx;
        height: 72rpx;
        background-color: #eee;
        border-radius: 10rpx;
        line-height: 72rpx;
        &.record {
          text-align: center;
        }
      }
      .add-btn {
        width: 44rpx;
        height: 44rpx;
        &.email-btn {
          margin: 0 28rpx;
        }
      }
      .send-btn {
        // margin: 0 0 0 28rpx;
        width: 90rpx;
        height: 48rpx;
        background-color: rgba(80, 143, 255, 1);
        border-radius: 10rpx;
        text-align: center;
        font-size: 26rpx;
        color: #fff;
        line-height: 48rpx;
        transition: width 10s;
      }
    }
    .choose-div {
      padding: 30rpx 40rpx 40rpx;
      display: flex;
      margin-right: -60rpx;
      .choose-item {
        margin-right: 60rpx;
        width: 48rpx;
        height: 48rpx;
      }
    }
    .bottom-emoji {
      padding: 20rpx;
      .emojis {
        height: 300rpx;
        border-bottom: 2rpx solid #dddee1;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        overflow-x: scroll;
        .emoji {
          height: 60rpx;
          width: 60rpx;
          padding: 4rpx 6rpx 6rpx 4rpx;
          box-sizing: border-box;
        }
      }
    }
  }
  .forbidden-wrap {
    z-index: 10;
    position: fixed;
    bottom: 0;
    left: 0;
    padding: 30rpx 0;
    width: 100%;
    background-color: #fff;
    box-shadow: 0 -2rpx 10rpx 0 rgba(153, 153, 153, 0.26);
    border-radius: 20rpx 20rpx 0 0;
    text-align: center;
    font-size: 32rpx;
    color: #333;
    .pay-btn {
      margin: 24rpx auto 0;
      width: 400rpx;
      height: 68rpx;
      background: rgba(0, 206, 158, 1);
      border-radius: 34rpx;
      text-align: center;
      line-height: 68rpx;
      color: #fff;
      font-size: 26rpx;
    }
  }
}
</style>