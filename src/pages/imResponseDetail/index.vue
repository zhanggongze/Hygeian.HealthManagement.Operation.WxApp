<template>
  <div class="page-wrap">
    <div class="main">
      <scroll-view scroll-y="true" style="height: 100%;">
        <div class="mes-list">
          <div class="mes-item" v-for="(message, index) in list" :key="index">
            <div class="time-group" v-if="message.timeGroup">{{message.timeGroup}}</div>
            <div class="mes"  :class="(message.flow === 'out') ? 'item-right' : 'item-left'">
                <div class="content">
                  <div class="name" v-if="message.flow !== 'out'">{{patientName}}</div>
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
                    @click="previewImage(message.payload.imageInfoArray[1].URL)"
                  >
                    <image
                      v-if="message.imgW && message.imgH"
                      class="img"
                      :src="message.payload.imageInfoArray[1].URL"
                      mode="aspectFit"
                      :style="{'width': message.imgW + 'rpx', 'height': message.imgH + 'rpx', 'border-radius': '10rpx'}"
                    />
                    <image
                      v-else
                      class="img"
                      :src="message.payload.imageInfoArray[1].URL"
                      mode="aspectFit"
                      style="max-width:200px;height:150px"
                    />
                  </div>
                  <div
                    class="message"
                    v-else-if="message.type === 'TIMSoundElem'"
                    :url="message.payload.url"
                  >
                    <div class="box" @click="openAudio(message.payload, message)">
                      <div class="box-sound" :class="{active: playRecord && audioId === message.id}">
                        <div class="sound-symbol">
                          <div class="sound-circle first"></div>
                          <div class="sound-circle second"></div>
                          <div class="sound-circle third"></div>
                        </div>
                      </div>
                      <div style="padding-left: 10px">{{message.payload.second}}s</div>
                    </div>
                  </div>
              </div>
              <div class="avatar">
                <div v-if="message.flow !== 'out'" class="firstName">{{firstName}}</div>
                <img v-else :src="doctorImageUrl" shape="square" />
              </div>
            </div>
          </div>
        </div>
      </scroll-view>
    </div>
    <div class="bottom">
      <div class="primary-btn btn" @click="complateIMGroup">不再跟进</div>
    </div>
  </div>
</template>
<script>
const audioContext = wx.createInnerAudioContext()
const recorderManager = wx.getRecorderManager()
const recordOptions = {
  duration: 60000,
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'aac' // 音频格式，选择此格式创建的音频消息，可以在即时通信 IM 全平台（Android、iOS、微信小程序和Web）互通
}
import { emojiName, emojiMap, emojiUrl } from "@/utils/emojiMap"
export default {
  data() {
    return {
      emojiName: emojiName,
      emojiMap: emojiMap,
      emojiUrl: emojiUrl,
      groupId: '',
      list: [],
      healthRecordId: '',
      audioId: '',
      playRecord: false,
      doctorImageUrl: '',
      patientName: '',
      firstName: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.groupId = options.groupId
    let responseInfo = wx.getStorageSync('responseInfo')
    if (responseInfo) {
      this.doctorImageUrl = responseInfo.doctorImageUrl
      wx.removeStorageSync('responseInfo')
    }
    this.getList()
    this.healthRecordId = options.healthRecordId
    if(this.healthRecordId) {
      this.getHealthRecordInfo()
    }
  },
  methods: {
    getList() {
      this.httpFly.post({
        groupId: this.groupId,
        skipCount: 0,
        maxResultCount: 10
      }, 'servicepackage/api/v1/partner/IM/QueryLastIMMessages', res => {
        let list = res.items.map((obj, i) => {
          let message = JSON.parse(obj.msgBody)[0]
          obj.message = message
          obj.flow = obj.fromAccount.indexOf('DOC') > -1 ? 'out' : 'in'
          obj.type = message.MsgType
          if(obj.type === 'TIMTextElem') {
            let content = message.MsgContent.Text
            let imoList = content.match(/[^[]+(?=])/g)
            if (imoList) {
              imoList = imoList.filter(obj => this.emojiName.indexOf('[' + obj + ']') > -1)
            } else {
              imoList = []
            }
            imoList = imoList.map(obj => '[' + obj + ']')
            obj.virtualDom = []
            if(imoList.length) {
              for(let j = 0, jen = imoList.length; j < jen; j++) {
                if (content.indexOf(imoList[j]) === 0) {
                  obj.virtualDom.push({
                    name: 'img',
                    src: this.emojiUrl +this.emojiMap[imoList[j]]
                  })
                  content = content.replace(imoList[j], '')
                } else {
                  let text = content.substr(0, content.indexOf(imoList[j]))
                  obj.virtualDom.push({
                    name: 'span',
                    text: text
                  })
                  content = content.replace(text, '')
                  obj.virtualDom.push({
                    name: 'img',
                    src: this.emojiUrl +this.emojiMap[imoList[j]]
                  })
                  content = content.replace(imoList[j], '')
                }
                if (imoList[j + 1]) {
                  let text = content.substr(0, content.indexOf(imoList[j + 1]))
                  obj.virtualDom.push({
                    name: 'span',
                    text: text
                  })
                  content = content.replace(text + imoList[j + 1], '')
                } else {
                  obj.virtualDom.push({
                    name: 'span',
                    text: content
                  })
                }
              }
            } else {
              obj.virtualDom.push({
                name: 'span',
                text: content
              })
            }
          } else if(obj.type === 'TIMImageElem') {
            let file = message.MsgContent.ImageInfoArray.find(obj => obj.sizeType == 1)
            if(file) {
              let width = 0
              let height = 0
              if (file['width'] > 250) {
                width = 200
                height = file['height'] / (file['width'] / 200)
              } else {
                width = file['width']
                height = file['height']
              }
              obj.imgW = width
              obj.imgH = height
            }
            obj.payload = {
              imageInfoArray: message.MsgContent.ImageInfoArray
            }
          } else if(obj.type === 'TIMSoundElem') {
            obj.payload = {
              url: message.MsgContent.Url,
              second: message.MsgContent.Second
            }
          }
          return obj
        })
        for (let i = 0; i < list.length; i++) {
          let message = list[i]
          let date = new Date(message.msgTimeStamp * 1000)
          list[i].newtime = this.utils.timeHandle(date, true)
          if (date) {
            if (i === 0) {
              list[i].timeGroup = list[i].newtime
            } else {
              if (list[i].msgTimeStamp - list[i - 1].msgTimeStamp > 120) {
                list[i].timeGroup = list[i].newtime
              }
            }
          }
        }
        this.list = this.list.concat(list)
      })
    },
    getHealthRecordInfo() {
      this.httpFly.post({
        id: this.healthRecordId
      }, 'healthrecord/api/v1/partner/getHealthRecord', res => {
        this.patientName = res.name
        this.firstName = res.name.substr(0, 1)
      })
    },
    /**
     * 播放音频
     */
    openAudio(audio, data) {
      this.audioId = data.id
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
        this.audioId = '小程序暂不支持播放该音频格式'
        this.utils.toast()
      })
    },
    /**
     * 图片预览
     */
    previewImage(src) {
      wx.previewImage({
        current: src, // 当前显示图片的http链接
        urls: [src]
      });
    },
    complateIMGroup() {
      let _self = this
      wx.showModal({
        confirmColor: '#408BF1',
        content: '确定不再跟进该条医生响应记录？',
        success(res) {
          if (res.confirm) {
            _self.httpFly.post({
              groupId: _self.groupId
            }, 'servicepackage/api/v1/partner/IM/ComplateIMGroup', res => {
              let pages = getCurrentPages();
              let prevPage = pages[pages.length - 2]
              prevPage.setData({
                needRefresh: true
              })
              wx.navigateBack({
                delta: 1
              })
            })
          }
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.page-wrap {
  min-height: 100%;
  background-color: #f5f5f5;
  .main {
    height: calc(100vh - 132rpx);
    .mes-list {
      padding-top: 30rpx;
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
            .firstName {
              background-color: #8B8FAB;
              border-radius: 50%;
              width: 80rpx;
              height: 80rpx;
              line-height: 80rpx;
              text-align: center;
              font-size: 36rpx;
              color: #fff;
            }
          }
        }
      }
    }
  }
  .bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 132rpx;
    background-color: #fff;
    box-shadow: 0 -2rpx 10rpx 0 rgba(153, 153, 153, 0.26);
    border-radius: 20rpx 20rpx 0 0;
    .btn {
      width: 400rpx;
      background: linear-gradient(
        -45deg,
        rgba(34, 172, 251, 1),
        rgba(64, 139, 241, 1)
      );
      border-radius: 34rpx;
      line-height: 68rpx;
      font-size: 26rpx;
    }
  }
}
</style>
