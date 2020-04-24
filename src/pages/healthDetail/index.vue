<template>
  <div class="chat">
    <div class="patient-record" v-show="currentIndex === 0">
      <scroll-view style="height: 100%" scroll-y>
        <div class="base-wrap">
          <div class="base-card" v-if="patientInfo">
            <div class="base-info">
              <div
                class="img"
                :style="{'backgroundColor': nameColors[colorIndex]}"
              >{{patientInfo.firstName}}</div>
              <div class="info">
                <div class="name-vip">
                  <div class="name">{{patientInfo.name}}</div>
                  <img
                    class="vip"
                    v-if="patientInfo && patientInfo.receiveType === 'VIP'"
                    src="/static/images/icon_vip.png"
                    alt
                  />
                </div>
                <div class="sex-age">
                  <div class="sex">{{patientInfo.gender}}</div>
                  <div class="age">{{patientInfo.age}}岁</div>
                </div>
              </div>
            </div>
            <!-- <div class="remark">
              <div class="content ell">备注：{{patientInfo.remark ? patientInfo.remark : ''}}</div>
            </div>
            <div class="tag-list" v-if="tags.length">
              <div
                class="tag-item blue"
                :class="tagColors[kndex % 4]"
                v-for="(tag, kndex) in tags"
                :key="kndex"
              >{{tag}}</div>
            </div>
            <div class="patient-disease">
              <div>患者诊断</div>
            </div>
            <div class="disease">{{disease ? disease : '暂无'}}</div> -->
          </div>
          <div class="disease-history">
            <div class="title">
              <div class="label">病程</div>
              <div class="update-time">更新时间：{{maintainDateTime}}</div>
            </div>
            <div class="record-list">
              <ul>
                <li v-for="(data, index) in list" :key="index">
                  <div class="time-hospital">
                    <div class="time">{{data.time}}</div>
                    <div>{{data.institution}}</div>
                  </div>
                  <div v-for="(item, jndex) in data.children" :key="jndex">
                    <div class="content">
                      <span>{{item.archiveTypeDisplayName}}</span>
                    </div>
                    <div class="file-list">
                      <img
                        class="file-item"
                        v-for="(file, kndex) in item.fileList"
                        :key="kndex"
                        :src="file.url"
                        @click="previewFile(file.url, item.fileList)"
                        alt
                      />
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </scroll-view>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentIndex: 0,
      // 健康档案id
      id: '',
      // 患者档案信息
      patientInfo: null,
      tags: [],
      tagColors: ['blue', 'green', 'orange', 'purple'],
      disease: '',
      // 颜色
      nameColors: this.dict.nameColors,
      // 姓氏颜色索引
      colorIndex: 0,
      // 更新时间
      maintainDateTime: '',
      // 病程列表
      list: [],
      groupId: '',
      serviceList: [],
      isEmpty: true
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.id = options.id
    this.groupId = options.grantId
    this.colorIndex = wx.getStorageSync('recordsColor')[this.id]
    this.getDetail()
    this.queryArchives()
  },
  methods: {
    /**
     * 获取档案详情
     */
    getDetail() {
      this.httpFly.post({
        id: this.id
      }, 'healthrecord/api/v1/doctor/getHealthRecordWithoutGrant', res => {
        this.patientInfo = res
        this.patientInfo.firstName = res.name.substr(0, 1)
        this.patientInfo.age = this.utils.getAge(res.dob)
        this.tags = res.tags ? res.tags.filter(obj => obj.type === 'Custom').map(obj => obj.value) : []
        this.disease = res.tags ? res.tags.filter(obj => obj.type === 'Diagnosis').map(obj => obj.value).join('、') : ''
        let time = res.maintainDateTime ? res.maintainDateTime : res.creationDateTime
        this.maintainDateTime = time ? this.utils.formatTime(time) : ''
        this.groupId = res.grantId
        // 设置header——聊天对象昵称或群名
        wx.setNavigationBarTitle({
          title: res.name
        })
      })
    },
    /**
     * 获取病程列表
     */
    queryArchives() {
      this.httpFly.post({
        healthRecordId: this.id
      }, 'healthrecord/api/v1/doctor/queryArchives', res => {
        let result = res.items.map(obj => {
          obj.time = this.utils.formatTime(obj.archiveDateTime, true)
          obj.url = obj.fileUrl.indexOf('http') > -1 ? obj.fileUrl : 'https://' + obj.fileUrl
          return obj
        })
        let timeList = Array.from(new Set(result.map(obj => obj.time + '' + (obj.institution ? obj.institution : ''))))
        this.list = timeList.map(obj => {
          let children = result.filter(item => (item.time + '' + (item.institution ? item.institution : '')) === obj)
          // 汇总标签去重处理
          let archiveTypeDisplayNames = Array.from(new Set(children.map(obj => obj.archiveTypeDisplayName)))
          let newChild = archiveTypeDisplayNames.map(item => {
            return {
              archiveTypeDisplayName: item,
              fileList: children.filter(data => data.archiveTypeDisplayName === item)
            }
          })
          return {
            time: obj.substr(0, 10),
            institution: obj.substr(10),
            children: newChild
          }
        })
      })
    },
    /**
     * 附件查看
     */
    previewFile(data, fileList) {
      wx.previewImage({
        current: data,
        urls: fileList.map(obj => obj.url)
      })
    },
    /**
     * 选中顶部导航
     */
    selectNav(index) {
      this.currentIndex = index
    },
    /**
     * 跳转到患者详情页面
     */
    editInfo() {
      wx.navigateTo({
        url: '/pages/patientArchiving/main?id=' + this.id
      })
    },
    /**
     * 跳转到修改标签备注界面
     */
    toUpdateTag() {
      wx.navigateTo({
        url: '/pages/editTag/main'
      })
    },
    /**
     * 跳转到修改诊断界面
     */
    toUpdateDiagnosis() {
      wx.navigateTo({
        url: '/pages/updateDiagnosis/main'
      })
    },
    /**
     * 去聊天
     */
    toChat(data) {
      if (!data.isProcessing) {
        return
      }
      this.$store.commit('resetCurrentConversation')
      this.$store.commit('resetGroup')
      let conversationID = this.TIM.TYPES.CONV_GROUP + this.groupId
      wx.$app.getConversationProfile(conversationID)
        .then((res) => {
          this.$store.commit('updateCurrentConversation', res.data.conversation)
          this.$store.dispatch('getMessageList', res.data.conversation.conversationID)
          let url = `/pages/chat/main?id=${this.id}&toAccount=${this.patientInfo.name}&gender=${this.patientInfo.gender}&age=${this.patientInfo.age}`
          wx.navigateTo({ url })
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.chat {
  box-sizing: border-box;
  padding-top: 30rpx;
  height: 100%;
  background-color: #f5f5f5;
  .header {
    position: fixed;
    z-index: 99;
    top: 0;
    height: 108rpx;
    width: 100%;
    background-color: #f5f5f5;
  }
  .nav {
    margin: 20rpx 80rpx 0;
    display: flex;
    height: 68rpx;
    background-color: #fff;
    border-radius: 34rpx;
    .nav-item {
      flex: 1;
      line-height: 68rpx;
      text-align: center;
      font-size: 28rpx;
      color: #36507e;
      &.selected {
        background: linear-gradient(
          -20deg,
          rgba(55, 81, 125, 1),
          rgba(86, 116, 159, 1)
        );
        border-radius: 34rpx;
        color: #fff;
      }
    }
  }
  .patient-record {
    box-sizing: border-box;
    height: calc(100vh - 30rpx);
    .base-wrap {
      padding: 10rpx 30rpx 0;
      .base-card {
        position: relative;
        padding: 30rpx 30rpx 26rpx 30rpx;
        background: rgba(255, 255, 255, 1);
        box-shadow: 0 0 20rpx 0 rgba(170, 170, 170, 0.3);
        border-radius: 20rpx;
        .edit-btn {
          position: absolute;
          top: 40rpx;
          right: 20rpx;
          width: 36rpx;
          height: 36rpx;
        }
        .base-info {
          display: flex;
          align-items: center;
          .img {
            width: 88rpx;
            height: 88rpx;
            background-color: #8b8fab;
            border-radius: 50%;
            line-height: 88rpx;
            text-align: center;
            color: #fff;
            font-size: 48rpx;
          }
          .info {
            flex: 1;
            margin-left: 30rpx;
            .name-vip {
              display: flex;
              align-items: center;
              .name {
                font-size: 36rpx;
                color: #36507e;
              }
              .vip {
                margin-left: 26rpx;
                width: 60rpx;
                height: 28rpx;
              }
            }
            .sex-age {
              display: flex;
              margin-top: 6rpx;
              color: #8b8fab;
              font-size: 26rpx;
              .sex {
                margin-right: 36rpx;
              }
            }
          }
        }
        .remark {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 84rpx;
          .content {
            flex: 1;
            font-size: 26rpx;
            color: #36507e;
          }
          .icon-direct {
            margin-left: 30rpx;
            width: 16rpx;
            height: 30rpx;
          }
        }
        .tag-list {
          display: flex;
          padding-bottom: 30rpx;
          .tag-item {
            padding: 0 20rpx;
            margin-right: 26rpx;
            border-radius: 20rpx;
            line-height: 40rpx;
            font-size: 24rpx;
            &.blue {
              background-color: rgba(80, 143, 255, 0.2);
              color: #508fff;
            }
            &.green {
              background-color: rgba(0, 169, 92, 0.2);
              color: #00a95c;
            }
            &.orange {
              background-color: rgba(255, 105, 0, 0.2);
              color: #ff6900;
            }
            &.purple {
              background-color: rgba(184, 97, 234, 0.2);
              color: #b861ea;
            }
          }
        }
        .patient-disease {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 88rpx;
          border-top: 1rpx solid #e1e1e1;
          font-size: 32rpx;
          color: #36507e;
          .icon-direct {
            width: 16rpx;
            height: 30rpx;
          }
        }
        .disease {
          font-size: 26rpx;
          color: #8b8fab;
        }
      }
      .disease-history {
        margin-top: 58rpx;
        color: #36507e;
        font-size: 28rpx;
        .title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          .label {
            font-size: 36rpx;
            font-weight: bold;
          }
          .update-time {
            font-size: 26rpx;
            color: #8b8fab;
          }
        }
        .record-list {
          margin-top: 34rpx;
          padding-left: 36rpx;
          ul {
            position: relative;
            &::after {
              z-index: 2;
              content: "";
              position: absolute;
              top: 16rpx;
              left: -27rpx;
              bottom: 0;
              width: 2rpx;
              background-color: #ccc;
            }
            li {
              position: relative;
              margin-bottom: 30rpx;
              &::after {
                z-index: 9;
                content: "";
                position: absolute;
                top: 8rpx;
                left: -36rpx;
                bottom: 0;
                width: 20rpx;
                height: 20rpx;
                background-color: #508fff;
                border-radius: 50%;
              }
              .time-hospital {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 26rpx;
                color: #8b8fab;
              }
              .content {
                margin-top: 30rpx;
                span {
                  padding: 6rpx 10rpx;
                  background-color: #eee;
                  border-radius: 4rpx;
                }
              }
              .file-list {
                display: flex;
                flex-wrap: wrap;
                margin-top: 20rpx;
                margin-right: -10rpx;
                .file-item {
                  margin-right: 10rpx;
                  margin-bottom: 10rpx;
                  width: 140rpx;
                  height: 140rpx;
                }
              }
            }
          }
        }
      }
    }
  }
  .patient-service {
    box-sizing: border-box;
    height: calc(100vh - 108rpx);
    .base-wrap {
      box-sizing: border-box;
      margin: 0 30rpx;
      padding: 1rpx 0 30rpx;
      height: 100%;
      .service-list {
        margin: 9rpx 0;
        padding: 0 30rpx;
        height: 100%;
        background-color: #fff;
        box-shadow: 0 0 20rpx 0 rgba(170, 170, 170, 0.3);
        border-radius: 20rpx;
        .empty-data {
          padding-top: 200rpx;
        }
        .service-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 140rpx;
          border-bottom: 1rpx solid #e1e1e1;
          .left {
            display: flex;
            justify-items: center;
            .service-icon {
              margin-right: 12rpx;
              width: 48rpx;
              height: 48rpx;
            }
            .service-name {
              font-size: 36rpx;
              color: #303f60;
            }
          }
          .right {
            display: flex;
            align-items: center;
            .part-one {
              text-align: right;
              .validity {
                font-size: 32rpx;
                color: #303f60;
                &.grey {
                  color: #ddd;
                }
              }
              .time {
                color: #8b8fab;
                font-size: 24rpx;
              }
            }
            .icon {
              margin-left: 20rpx;
              width: 16rpx;
              height: 30rpx;
            }
          }
        }
      }
    }
  }
}
</style>