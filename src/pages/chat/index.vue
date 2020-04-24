<template>
  <div
    class="chat"
    id="chat"
    @longpress="handleLongPress"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
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
      <div class="patient-info">
        <div class="left">
          <div class="name">{{name}}</div>
          <div class="gender">{{gender}}</div>
          <div class="age">{{age}}岁</div>
        </div>
        <div class="right" @click="toDetail">
          <div>查看详细资料</div>
          <img class="icon-direct" src="/static/images/icon_index.png" alt />
        </div>
      </div>
    </div>
    <div
      id="list"
      :style="{ paddingBottom: isIpx ? (safeBottom + 50) + 'px': '50px' }"
      class="mes-list"
      @click="loseFocus"
    >
      <li
        class="mes-item"
        v-for="(message, index) in currentMessageList"
        :key="message.ID"
        :id="message.ID"
        :index="index"
      >
        <div class="time-group" v-if="message.timeGroup">{{message.timeGroup}}</div>
        <!--        系统消息-->
        <div
          class="notice"
          v-if="message.type === 'TIMGroupTipElem' || message.type === 'TIMGroupSystemNoticeElem'"
        >
          <div class="content">
            <span v-for="(div, index1) in message.virtualDom" :key="message.ID + index1">
              <span v-if="div.name === 'groupTip' || 'system'">{{div.text}}</span>
            </span>
          </div>
        </div>
        <!--        非系统消息-->
        <div v-else class="mes" :class="(message.flow === 'out') ? 'item-right' : 'item-left'">
          <div class="load" @click="handleResend(message)" v-if="message.from === myInfo.userID">
            <div :class="message.status"></div>
          </div>
          <div class="content">
            <div class="name" v-if="message.flow !== 'out'">{{message.nick || message.from}}</div>
            <div class="message" v-if="message.type === 'TIMTextElem'">
              <div class="text-message">
                <span v-for="(div, index2) in message.virtualDom" :key="message.ID + index2">
                  <span v-if="div.name === 'span'">{{div.text}}</span>
                  <image v-if="div.name === 'img'" :src="div.src" style="width:20px;height:20px;" />
                </span>
              </div>
            </div>
            <div
              class="message"
              :class="{'img-message': message.type === 'TIMImageElem'}"
              v-else-if="message.type === 'TIMImageElem'"
              @click="previewImage(message.payload.imageInfoArray[1].url)"
            >
              <image
                v-if="message.imgW && message.imgH"
                class="img"
                :src="message.payload.imageInfoArray[1].url"
                mode="aspectFit"
                :style="{'width': message.imgW + 'rpx', 'height': message.imgH + 'rpx', 'border-radius': '10rpx'}"
              />
              <image
                v-else
                class="img"
                :src="message.payload.imageInfoArray[1].url"
                mode="aspectFit"
                style="max-width:200px;height:150px"
              />
            </div>
            <div class="message" v-else-if="message.type === 'TIMFileElem'">
              <div class="file" @click="handleDownload(message.payload)">
                <i-avatar src="../../../static/images/file.png" size="large" shape="square" />
                <div>{{message.payload.fileName}}</div>
              </div>
            </div>
            <div class="message" v-else-if="message.type === 'TIMCustomElem'">
              <div v-if="message.payload.data === 'dice'">
                <image
                  :src="'/static/images/dice' + message.payload.description + '.png'"
                  style="height:40px;width:40px"
                />
              </div>
              <div v-else class="custom-elem">这是自定义消息</div>
            </div>
            <div
              class="message"
              v-else-if="message.type === 'TIMSoundElem'"
              :url="message.payload.url"
            >
              <div class="box" @click="openAudio(message.payload, message)">
                <div class="box-sound" :class="{active: playRecord && audioId === message.ID}">
                  <div class="sound-symbol">
                    <div class="sound-circle first"></div>
                    <div class="sound-circle second"></div>
                    <div class="sound-circle third"></div>
                  </div>
                </div>
                <div style="padding-left: 10px">{{message.payload.second}}s</div>
              </div>
            </div>
            <div class="message" v-else-if="message.type === 'TIMFaceElem'">
              <div class="custom-elem">
                <image
                  :src="'https://imgcache.qq.com/open/qcloud/tim/assets/face-elem/' + message.payload.data + '.png'"
                  style="height:90px; width:90px"
                />
              </div>
            </div>
          </div>
          <div class="avatar">
            <img
              v-if="message.flow !== 'out' && message.customAvatar"
              :src="message.customAvatar"
              @error="imgError(message)"
              shape="square"
            />
            <img v-else-if="message.flow !== 'out' && !message.customAvatar" :src="message.avatar || '/static/images/patient_default.png'" alt="">
            <img v-else :src="message.avatar || '/static/images/header.png'" shape="square" />
          </div>
        </div>
      </li>
    </div>
    <!--    输入框及选择框部分-->
    <div class="bottom" :style="{ paddingBottom: isIpx ? safeBottom + 'px': '' }">
      <div class="bottom-div">
        <img class="voice" src="/static/images/IM_voice.png" alt @click="chooseRecord" />
        <input
          v-if="!isRecord"
          type="text"
          class="input"
          v-model.lazy:value="messageContent"
          confirm-type="send"
          cursor-spacing="10"
          :focus="isFocus"
          @confirm="sendMessage"
        />
        <div id="record" class="input record" v-else>
          <template v-if="!isRecording">长按进行录音</template>
          <template v-if="isRecording">抬起停止录音</template>
        </div>
        <img class="add-btn email-btn" src="/static/images/icon_look.png" alt @click="openEmoji" />
        <img v-if="messageContent == ''" class="add-btn" src="/static/images/IM_add.png" alt @click="openMore" />
        <div v-if="messageContent != ''" class="send-btn" @click="sendMessage">发送</div>
      </div>
      <div class="choose-div" v-if="isMoreOpen">
        <img
          class="choose-item"
          src="/static/images/im_camera.png"
          alt
          @click="sendPhoto('camera')"
        />
        <img class="choose-item" src="/static/images/im_pic.png" alt @click="sendPhoto('album')" />
      </div>
      <div class="bottom-emoji" v-if="isEmojiOpen">
        <div class="emojis">
          <div
            v-for="emojiItem in emojiName"
            class="emoji"
            :key="emojiItem"
            @click="chooseEmoji(emojiItem)"
          >
            <image :src="emojiUrl + emojiMap[emojiItem]" style="width:25px;height:25px" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { emojiName, emojiMap, emojiUrl } from '@/utils/emojiMap'
const audioContext = wx.createInnerAudioContext()
const recorderManager = wx.getRecorderManager()
const recordOptions = {
  duration: 60000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'aac' // 音频格式，选择此格式创建的音频消息，可以在即时通信 IM 全平台（Android、iOS、微信小程序和Web）互通
}
export default {
  data() {
    return {
      messageContent: '',
      conversation: {},
      messageKey: '',
      lastMsgTime: '',
      count: 15,
      isEmojiOpen: false,
      isMoreOpen: false,
      isFocus: false,
      emojiName: emojiName,
      emojiMap: emojiMap,
      emojiUrl: emojiUrl,
      isGroup: false,
      messageList: [],
      height: 0,
      modalVisible: false,
      downloadInfo: {},
      percent: 0,
      sysInfo: {},
      customData: '',
      customDescription: '',
      customExtension: '',
      safeBottom: 34,
      isIpx: false,
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
      // 健康档案id
      id: '',
      name: '',
      gender: '',
      age: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.id = options.id
    this.getDetail()
    let sysInfo = wx.getSystemInfoSync()
    this.sysInfo = sysInfo
    this.height = sysInfo.windowHeight
    this.isIpx = (sysInfo.model.indexOf('iPhone X') > -1)
    let query = wx.createSelectorQuery()
    let that = this
    wx.$app.on(this.TIM.EVENT.MESSAGE_RECEIVED, () => {
      query.select('#chat').boundingClientRect(function (res) {
        if (res.bottom - that.height < 150) {
          that.scrollToBottom()
        }
      }).exec()
    })
    let interval = setInterval(() => {
      if (this.currentMessageList.length !== 0) {
        this.scrollToBottom()
        clearInterval(interval)
      }
    }, 600)
    this.$bus.$off('atUser')
    this.$bus.$on('atUser', (user) => {
      this.messageContent += user.userID
      this.messageContent += ' '
    })
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
          this.$store.commit('showToast', {
            title: '录音时间太短'
          })
        } else {
          const message = wx.$app.createAudioMessage({
            to: this.$store.getters.toAccount,
            conversationType: this.$store.getters.currentConversationType,
            payload: {
              file: res
            }
          })
          message.avatar = this.myInfo.avatar
          message.nick = this.myInfo.nick
          this.$store.commit('sendMessage', message)
          wx.$app.sendMessage(message)
        }
      }
    })
  },
  // 退出聊天页面的时候所有状态清空
  onUnload() {
    wx.$app.setMessageRead({ conversationID: this.$store.state.conversation.currentConversationID })
    this.isEmojiOpen = false
    this.isMoreOpen = false
    this.messageContent = ''
  },
  onPullDownRefresh() {
    wx.showNavigationBarLoading()
    this.utils.throttle(this.getMessageList, 1000)()
  },
  onShow() {
    // let pages = getCurrentPages()
    // let curPage = pages[pages.length - 1]
    // let prevPage = pages[pages.length - 2]
    // if (curPage.data.needRefresh) {
    //   delete curPage.data.needRefresh
    //   prevPage.setData({
    //     needRefresh: true
    //   })
    //   this.getDetail()
    // }
  },
  computed: {
    ...mapState({
      currentMessageList: state => {
        return state.conversation.currentMessageList
      },
      myInfo: state => {
        return state.user.myInfo
      }
    })
  },
  methods: {
    getDetail() {
      this.httpFly.post({
        id: this.id
      }, 'healthrecord/api/v1/doctor/getHealthRecordWithoutGrant', res => {
        this.name = res.name
        this.age = this.utils.getAge(res.dob)
        this.gender = res.gender
        // 设置header——聊天对象昵称或群名
        wx.setNavigationBarTitle({
          title: this.name
        })
      })
    },
    // 滚动到列表bottom
    scrollToBottom() {
      wx.pageScrollTo({
        scrollTop: 99999
      })
    },
    // 失去焦点
    loseFocus() {
      this.handleClose()
    },
    // 获取消息
    getMessageList() {
      wx.hideNavigationBarLoading()
      this.$store.dispatch('getMessageList')
      wx.stopPullDownRefresh()
    },
    // 处理emoji选项卡
    handleEmoji() {
      if (this.isFocus) {
        this.isFocus = false
        this.isEmojiOpen = true
      } else {
        this.isEmojiOpen = !this.isEmojiOpen
        this.isMoreOpen = false
      }
    },
    // 处理更多选项卡
    handleMore() {
      if (this.isFocus) {
        this.isFocus = false
        this.isMoreOpen = true
      } else {
        this.isMoreOpen = !this.isMoreOpen
        this.isEmojiOpen = false
      }
    },
    // 选项卡关闭
    handleClose() {
      this.isFocus = false
      this.isMoreOpen = false
      this.isEmojiOpen = false
    },
    isnull(content) {
      if (content === '') {
        return true
      }
      const reg = '^[ ]+$'
      const re = new RegExp(reg)
      return re.test(content)
    },
    /**
     * 展开更多选项
     */
    openMore() {
      if (this.isFocus) {
        this.isFocus = false
        this.isMoreOpen = true
      } else {
        this.isMoreOpen = !this.isMoreOpen
        this.isEmojiOpen = false
      }
    },
    /**
     * 展开表情
     */
    openEmoji() {
      if (this.isFocus) {
        this.isFocus = false
        this.isEmojiOpen = true
      } else {
        this.isEmojiOpen = !this.isEmojiOpen
        this.isMoreOpen = false
      }
    },
    // 发送text message 包含 emoji
    sendMessage() {
      if (!this.isnull(this.messageContent)) {
        const message = wx.$app.createTextMessage({
          to: this.$store.getters.toAccount,
          conversationType: this.$store.getters.currentConversationType,
          payload: { text: this.messageContent }
        })
        let index = this.$store.state.conversation.currentMessageList.length
        this.$store.commit('sendMessage', message)
        message.avatar = this.myInfo.avatar
        message.nick = this.myInfo.nick
        wx.$app.sendMessage(message).catch(() => {
          this.$store.commit('changeMessageStatus', index)
        })
        this.messageContent = ''
      } else {
        this.$store.commit('showToast', { title: '消息不能为空' })
      }
      this.isFocus = false
      this.isEmojiOpen = false
      this.isMoreOpen = false
    },
    sendPhoto(name) {
      let self = this
      if (name === 'album') {
        this.chooseImage(name)
      } else if (name === 'camera') {
        wx.getSetting({
          success: function (res) {
            if (!res.authSetting['scope.camera']) { // 无权限，跳转设置权限页面
              wx.authorize({
                scope: 'scope.camera',
                success: function () {
                  self.chooseImage(name)
                }
              })
            } else {
              self.chooseImage(name)
            }
          }
        })
      }
    },
    videoError(e) {
      console.log(e)
      this.$store.commit('showToast', {
        title: `视频出现错误，错误信息${e.mp.detail.errMsg}`,
        duration: 1500
      })
    },
    chooseImage(name) {
      let self = this
      let message = {}
      wx.chooseImage({
        sourceType: [name],
        count: 1,
        success: function (res) {
          message = wx.$app.createImageMessage({
            to: self.$store.getters.toAccount,
            conversationType: self.$store.getters.currentConversationType,
            payload: {
              file: res
            },
            onProgress: percent => {
              self.percent = percent
            }
          })
          self.$store.commit('sendMessage', message)
          wx.$app.sendMessage(message).then(() => {
            self.percent = 0
          }).catch((err) => {
            console.log(err)
          })
        }
      })
      this.handleClose()
    },
    previewImage(src) {
      wx.previewImage({
        current: src, // 当前显示图片的http链接
        urls: [src]
      })
    },
    // 发消息选中emoji
    chooseEmoji(item) {
      this.messageContent += item
    },
    // 重发消息
    handleResend(message) {
      if (message.status === 'fail') {
        wx.$app.resendMessage(message)
      }
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
     * 播放音频
     */
    openAudio(audio, data) {
      this.audioId = data.ID
      let that = this
      audioContext.src = audio.url
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
        that.$store.commit('showToast', {
          title: '小程序暂不支持播放该音频格式',
          icon: 'none',
          duration: 2000
        })
      })
    },
    toDetail() {
      let currentConversation = this.$store.state.conversation.currentConversation
      wx.navigateTo({
        url: '/pages/patientDetail/main?id=' + this.id + '&toAccount=' + this.name + '&grantId=' + currentConversation.conversationID.substring(5)
      })
    },
    imgError(message) {
      this.$set(message, 'customAvatar', '/static/images/patient_default.png')
    }
  },
  mounted() {
    this.$watch('messageContent', function (e) {
      if (this.$store.state.conversation.currentConversation.type === this.TIM.TYPES.CONV_GROUP) {
        if (e.slice(-1) === '@') {
          let url = '../mention/main'
          wx.navigateTo({ url })
        }
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.chat {
  box-sizing: border-box;
  padding-top: 120rpx;
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
    position: fixed;
    z-index: 99;
    top: 0;
    height: 100rpx;
    width: 100%;
    background-color: #fff;
    box-shadow: 0 10rpx 10rpx 0 rgba(153, 153, 153, 0.15);
    .patient-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 30rpx;
      height: 100rpx;
      .left {
        display: flex;
        align-items: center;
        font-size: 26rpx;
        color: #8b8fab;
        .name {
          font-size: 36rpx;
          color: #36507e;
        }
        .gender {
          margin: 0 30rpx;
        }
      }
      .right {
        display: flex;
        align-items: center;
        font-size: 26rpx;
        color: #36507e;
        .icon-direct {
          margin-left: 10rpx;
          width: 16rpx;
          height: 30rpx;
        }
      }
    }
  }
  .mes-list {
    background-color: #f5f5f5;
    .mes-item {
      .time-group {
        color: #999;
        font-size: 26rpx;
        text-align: center;
      }
      .mes {
        display: flex;
        justify-content: flex-end;
        padding: 0 20rpx;
        margin-bottom: 50rpx;
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
          img {
            border-radius: 50%;
            width: 80rpx;
            height: 80rpx;
          }
        }
      }
    }
  }
  .bottom {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
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
        width: 90rpx;
        height: 48rpx;
        background-color: rgba(80, 143, 255, 1);
        border-radius: 10rpx;
        text-align: center;
        font-size: 26rpx;
        color: #fff;
        line-height: 48rpx;
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
}
</style>
