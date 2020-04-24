<template>
  <div class="chatting" v-if="list && list.length">
    <div class="chat" v-for="item in list" :key="item.conversationID">
      <div class="chat-item" @longpress="longTimePress(item)">
        <div
          class="msg-card"
          v-if="item.type === 'GROUP'"
          @click="checkoutConversation(item, item.groupProfile.name || item.groupProfile.ID)"
          slot="content"
        >
          <div class="base-info">
            <div class="remain" v-if="item.unreadCount > 0">{{item.unreadCount}}</div>
            <div class="img">{{item.healthRecord.firstName}}</div>
            <div class="info">
              <div class="name-level-time">
                <div class="name-level">
                  <div class="name">{{item.healthRecord.name}}</div>
                  <img class="icon-vip" src="/static/images/icon_vip.png" alt />
                </div>
                <div class="time">{{item.lastMessage._lastTime}}</div>
              </div>
              <div class="tag" v-if="item.healthRecord.tags">
                <div
                  v-for="(data, jndex) in item.healthRecord.tags"
                  :key="jndex"
                  class="tag-item"
                  :class="tagColors[jndex % 4]"
                >{{data.value}}</div>
                <!-- <div class="tag-item green">冠心病</div>
                <div class="tag-item orange">心脏病</div>-->
              </div>
            </div>
          </div>
          <div class="content ell" v-if="item.lastMessage.fromAccount === '@TIM#SYSTEM'">[群系统消息]</div>
          <div class="content ell" v-else-if="item.lastMessage.at && item.unreadCount > 0">[有人@你了]</div>
          <div class="content ell" v-else>{{item.lastMessage.messageForShow}}</div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="empty-data">
    <img class="img" src="/static/images/empty_message.png" alt />
    <div class="p">暂无记录</div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      modalVisible: false,
      conversation: {},
      list: [],
      tagColors: ['blue', 'green', 'orange', 'purple'],
      isGetList: true
    }
  },
  computed: {
    ...mapState({
      allConversation: state => {
        return state.conversation.allConversation
      }
    })
  },
  watch: {
    allConversation(value, oldValue) {
      let GrantIds = value.filter(obj => obj.type === 'GROUP').map(obj => obj.groupProfile && obj.groupProfile.groupID)
      if (this.isGetList && GrantIds && GrantIds.length) {
        this.isGetList = false
        this.getList(GrantIds)
      }
    }
  },
  // 消息列表下拉
  onPullDownRefresh() {
    this.utils.throttle(wx.$app.getConversationList(), 1000)
    wx.stopPullDownRefresh()
  },
  methods: {
    longTimePress(item) {
      this.conversation = item
      this.handleModalShow()
    },
    handleModalShow() {
      this.modalVisible = !this.modalVisible
    },
    handleConfirm() {
      this.handleModalShow()
      this.deleteConversation(this.conversation)
    },
    // 将某会话设为已读
    setMessageRead(item) {
      if (item.unreadCount === 0) {
        return
      }
      wx.$app.setMessageRead({
        conversationID: item.conversationID
      })
    },
    // 点击某会话
    checkoutConversation(item, name) {
      if (item.lastMessage.at) {
        this.$store.commit('offAtRemind', item)
      }
      this.$store.commit('resetCurrentConversation')
      this.$store.commit('resetGroup')
      // 重置未读消息数
      this.setMessageRead(item)
      // 获取会话资料
      wx.$app.getConversationProfile(item.conversationID)
        .then((res) => {
          // 更新当前会话
          this.$store.commit('updateCurrentConversation', res.data.conversation)
          // 获取内容列表
          this.$store.dispatch('getMessageList')
          // 如果当前会话为群组会话
          if (item.type === this.TIM.TYPES.CONV_GROUP) {
            let groupID = item.conversationID.substring(5)
            // 更新当前群组信息
            wx.$app.getGroupProfile({ groupID: groupID })
              .then(res => {
                this.$store.commit('updateCurrentGroupProfile', res.data.group)
              })
          }
        })
      let url = `../chat/main?toAccount=${item.healthRecord.name}&id=${item.healthRecord.id}&gender=${item.healthRecord.gender}&age=${item.healthRecord.age}`
      wx.navigateTo({ url })
    },
    // 点击系统通知时，处理notification
    checkoutNotification(item) {
      this.$store.commit('resetCurrentConversation')
      this.$store.commit('resetGroup')
      this.setMessageRead(item)
      wx.$app.getConversationProfile(item.conversationID)
        .then((res) => {
          this.$store.commit('updateCurrentConversation', res.data.conversation)
          this.$store.dispatch('getMessageList')
        })
      let url = '../system/main'
      wx.navigateTo({ url })
    },
    // 删除会话
    deleteConversation(item) {
      wx.$app.deleteConversation(item.conversationID).then((res) => {
        // console.log('delete success', res)
      })
    },
    getList(ids) {
      this.httpFly.post({
        groupIDs: ids
      }, 'servicepackage/api/v1/doctor/IM/QueryGroups', res => {
        this.queryHealthRecordsWithoutGrant(res.items.map(obj => {
          return {
            healthRecordID: obj.healthRecordID,
            groupID: obj.groupID
          }
        }))
      }, null, true)
    },
    queryHealthRecordsWithoutGrant(recordList) {
      this.httpFly.post({
        healthRecordIds: recordList.map(obj => obj.healthRecordID)
      }, 'healthRecord/api/v1/doctor/queryHealthRecordsWithoutGrant', res => {
        let list = res.items.map(obj => {
          obj.firstName = obj.name.substr(0, 1)
          obj.groupID = recordList.find(item => item.healthRecordID === obj.id).groupID
          return obj
        })
        this.list = this.allConversation.map(obj => {
          if (obj.type === 'GROUP') {
            let info = list.find(item => item.groupID === obj.groupProfile.groupID)
            if (info && info.tags && info.tags.length) {
              info.tags = info.tags.filter(obj => obj.type === 'Custom')
            }
            info.age = info.dob ? this.utils.getAge(info.dob) : ''
            obj.healthRecord = info
          }
          return obj
        })
        // 避免频繁请求用户档案接口
        setTimeout(() => {
          this.isGetList = true
        }, 1000)
      })
    }
  },
  onShow() {
    if (getApp().globalData.isImLogin) {
      wx.$app.getConversationList().then(res => {
        this.$store.commit('updateAllConversation', res.data.conversationList)
      })
    }
  },
  // 初始化加载userProfile并且存入store
  onLoad() {
    wx.$app.getMyProfile().then(res => {
      this.$store.commit('updateMyInfo', res.data)
    })
    wx.$app.getBlacklist().then(res => {
      this.$store.commit('setBlacklist', res.data)
    })
    // wx.$app.getConversationList().then(res => {
    //   this.$store.commit('updateAllConversation', res.data.conversationList)
    // })
  }
}
</script>

<style lang="scss" scoped>
.chat {
  .chat-item {
    padding: 0 30rpx;
    .msg-card {
      padding: 30rpx 0;
      border-bottom: 1rpx solid #e1e1e1;
      font-size: 26rpx;
      color: #8b8fab;
      .base-info {
        position: relative;
        display: flex;
        align-items: center;
        .remain {
          position: absolute;
          top: 0;
          left: 56rpx;
          padding: 2rpx 10rpx;
          background-color: #f14a4a;
          border-radius: 50%;
          font-size: 22rpx;
          color: #fff;
        }
        .img {
          margin-right: 20rpx;
          width: 88rpx;
          height: 88rpx;
          background-color: #8b8fab;
          border-radius: 50%;
          line-height: 88rpx;
          text-align: center;
          font-size: 48rpx;
          color: #fff;
        }
        .info {
          flex: 1;
          .name-level-time {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .name-level {
              display: flex;
              align-items: center;
              .name {
                font-size: 36rpx;
                color: #36507e;
              }
              .icon-vip {
                margin-left: 24rpx;
                width: 60rpx;
                height: 28rpx;
              }
            }
          }
          .tag {
            display: flex;
            margin-top: 10rpx;
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
      .content {
        margin-top: 18rpx;
      }
    }
  }
}
.empty-data {
  padding-top: 40%;
}
</style>