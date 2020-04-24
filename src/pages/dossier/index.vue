<template>
  <div class="page-dossier">
    <!-- 新的患者 -->
    <div class="new-patient">
      <div>新的患者</div>
      <navigator url="/pages/newPatient/main" class="info">
        <div class="new" v-if="withoutTagsCount > 0">NEW</div>
        <div>{{withoutTagsCount}}人</div>
        <img class="icon-direct" src="/static/images/icon_index.png" alt />
      </navigator>
    </div>
    <div class="hr"></div>
    <div class="user-info">
      <div
        class="user-type"
        :class="{'open' : data.open}"
        v-for="(data, index) in group"
        :key="index"
      >
        <div class="user-menu" @click="toggleMenu(data)">
          <div class="label">
            <img class="icon-direct" src="/static/images/icon_arrow_down.png" alt />
            <div>{{data.name}}</div>
          </div>
          <div class="num">{{data.items.length}}人</div>
        </div>
        <div class="patient-list" v-show="data.open">
          <div class="patient-item" v-for="(patientInfo, jndex) in data.items" :key="jndex" @click="toChat(patientInfo)">
            <div class="patient-box">
              <!-- 病人基本信息 -->
              <div class="patient-info">
                <div
                  class="surname"
                  :style="{'backgroundColor': nameColors[patientInfo.colorIndex]}"
                >{{patientInfo.firstName}}</div>
                <div class="base-info">
                  <div class="name">{{patientInfo.name}}</div>
                  <div class="sex-age">
                    <div class="sex">{{patientInfo.gender}}</div>
                    <div class="age">{{patientInfo.age}}岁</div>
                  </div>
                </div>
                <div class="date">{{patientInfo.date}}</div>
              </div>
              <!-- 疾病 -->
              <div class="disease">疾病：{{patientInfo.disease}}</div>
              <!-- 标签 -->
              <div class="tag-list" v-if="patientInfo.tagList.length">
                <div
                  class="tag-item"
                  :class="tagColors[kndex % 4]"
                  v-for="(tag, kndex) in patientInfo.tagList"
                  :key="kndex"
                >{{tag.value}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      group: [],
      tagColors: ['blue', 'green', 'orange', 'purple'],
      nameColors: this.dict.nameColors,
      withoutTagsCount: 0
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.getList()
  },
  onShow() {
    let pages = getCurrentPages()
    let curPage = pages[pages.length - 1]
    if (curPage.data.needRefresh) {
      delete curPage.data.needRefresh
      this.getList()
    }
  },
  methods: {
    /**
     * 获取患者列表
     */
    getList() {
      this.httpFly.post({}, 'healthrecord/api/v1/doctor/queryHealthRecords', res => {
        let recordsColor = wx.getStorageSync('recordsColor')
        if (!recordsColor) {
          recordsColor = res.items.reduce((a, b) => {
            if (!a[b.id]) {
              a[b.id] = Math.floor(Math.random() * 4)
            }
            return a
          }, {})
        } else {
          res.items.forEach(obj => {
            if (!recordsColor[obj.id]) {
              recordsColor[obj.id] = Math.floor(Math.random() * 4)
            }
          })
        }
        console.log(recordsColor)
        wx.setStorageSync('recordsColor', recordsColor)
        this.withoutTagsCount = res.withoutTagsCount
        let resList = res.items.map(obj => {
          obj.firstName = obj.name.substr(0, 1)
          obj.age = this.utils.getAge(obj.dob)
          obj.tagList = obj.tags.filter(obj => obj.type === 'Custom')
          obj.disease = obj.tags.filter(obj => obj.type === 'Diagnosis').map(obj => obj.value).join('、')
          obj.colorIndex = recordsColor[obj.id]
          obj.date = this.utils.formatTime(obj.creationDateTime)
          return obj
        })
        this.group = [
          {
            type: 'VIP',
            name: 'VIP用户',
            items: resList.filter(obj => obj.receiveType === 'VIP'),
            open: this.group.length > 0 ? this.group.find(obj => obj.type === 'VIP')['open'] : false
          }, {
            type: 'Default',
            name: '普通用户',
            items: resList.filter(obj => obj.receiveType === 'Default'),
            open: this.group.length > 0 ? this.group.find(obj => obj.type === 'Default')['open'] : false
          }
        ]
      })
    },
    /**
     * 用户组菜单展开折叠切换
     */
    toggleMenu(data) {
      this.$set(data, 'open', !data.open)
    },
    /**
     * 跳转到聊天室
     */
    toChat(data) {
      // let conversationID = this.TIM.TYPES.CONV_GROUP + data.grantId
      // wx.$app.getConversationProfile(conversationID)
      //   .then((res) => {
      //     this.$store.commit('updateCurrentConversation', res.data.conversation)
      //     this.$store.dispatch('getMessageList', res.data.conversation.conversationID)
      //   })
      // wx.navigateTo({
      //   url: '/pages/patientDetail/main?id=' + data.id + '&toAccount=' + data.name
      // })
      wx.navigateTo({
        url: '/pages/patientDetail/main?id=' + data.id + '&toAccount=' + data.name + '&grantId=' + data.grantId
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.new-patient {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx;
  line-height: 100rpx;
  font-size: 32rpx;
  color: $themeColor;
  .info {
    display: flex;
    align-items: center;
    font-size: 26rpx;
    color: #8b8fab;
    .new {
      margin-right: 18rpx;
      width: 80rpx;
      background-color: #ff4c4c;
      border-radius: 18rpx;
      line-height: 36rpx;
      text-align: center;
      color: #fff;
      font-size: 24rpx;
    }
    .icon-direct {
      margin-left: 20rpx;
      width: 16rpx;
      height: 30rpx;
    }
  }
}
.hr {
  height: 20rpx;
  background-color: #eeeef8;
}
.user-info {
  .user-type {
    .user-menu {
      padding: 38rpx 30rpx 10rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .label {
        display: flex;
        align-items: center;
        font-size: 32rpx;
        color: $themeColor;
        .icon-direct {
          transition: All 0.2s ease-in-out;
          margin-right: 12rpx;
          transform: rotate(-90deg);
          width: 24rpx;
          height: 24rpx;
        }
      }
      .num {
        font-size: 26rpx;
        color: #8b8fab;
      }
    }
    .patient-list {
      .patient-item {
        padding: 0 30rpx;
        .patient-box {
          padding: 40rpx 0 30rpx;
          border-bottom: 1rpx solid #e1e1e1;
          .patient-info {
            display: flex;
            align-items: center;
            .surname {
              margin-right: 30rpx;
              width: 88rpx;
              height: 88rpx;
              border-radius: 50%;
              line-height: 88rpx;
              text-align: center;
              font-size: 48rpx;
              color: #fff;
            }
            .base-info {
              .name {
                font-size: 36rpx;
                color: $themeColor;
              }
              .sex-age {
                display: flex;
                margin-top: 2rpx;
                font-size: 26rpx;
                color: #8b8fab;
                .sex {
                  margin-right: 38rpx;
                }
              }
            }
          }
          .date {
            flex: 1;
            text-align: right;
            font-size: 24rpx;
            color: #8b8fab;
          }
          .disease {
            margin-top: 26rpx;
            font-size: 26rpx;
            color: $themeColor;
          }
          .tag-list {
            display: flex;
            margin-top: 28rpx;
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
        }
      }
    }
  }
  .user-type.open {
    .icon-direct {
      transform: rotate(0) !important;
    }
  }
}
</style>
