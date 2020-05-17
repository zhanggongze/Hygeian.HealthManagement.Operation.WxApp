<template>
  <div class="page-wrap">
    <div class="empty-data" v-if="!list.length">
      <img class="img" src="/static/images/empty_message.png" alt="">
      <div class="p">暂无记录</div>
    </div>
    <div class="list" v-else>
      <scroll-view scroll-y="true" style="height: 100%;" @scrolltolower="scrolltolower">
        <div class="item" v-for="(data, index) in list" :key="index" @click="toDetail(data)">
          <img class="doctor-img" :src="data.doctorInfo.headImageUrl" alt="">
          <div class="info">
            <div class="name-time">
              <div class="name">{{data.doctorInfo.name}}</div>
              <div class="time">{{data.duration}}</div>
            </div>
            <div class="last-message ell" v-if="data.lastMessage && data.lastMessage.MsgType === 'TIMTextElem'">{{data.lastMessage.MsgContent.Text}}</div>
            <div class="last-message ell" v-if="data.lastMessage && data.lastMessage.MsgType === 'TIMImageElem'">[图片]</div>
            <div class="last-message ell" v-if="data.lastMessage && data.lastMessage.MsgType === 'TIMSoundElem'">[语音]</div>
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
      list: [],
      pageIndex: 1,
      totalCount: 0
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.queryDelaiedReplyIMGroups()
  },
  onShow() {
    let pages = getCurrentPages()
    let curPage = pages[pages.length - 1]
    if (curPage.data.needRefresh) {
      delete curPage.data.needRefresh
      this.list = []
      this.pageIndex = 1
      this.totalCount = 0
      this.queryDelaiedReplyIMGroups()
    }
  },
  methods: {
    /**
     * 查询医生回复的IM列表
     */
    queryDelaiedReplyIMGroups() {
      this.httpFly.post({
        locationCode: wx.getStorageSync('activeInfo')['region'],
        skipCount: (this.pageIndex - 1) * 10,
        maxResultCount: 10
      }, 'servicepackage/api/v1/partner/IM/QueryDelaiedReplyIMGroups', res => {
        let list = res.items.map(obj => {
          let delaiedDuration = obj.delaiedDuration
          let duration = ''
          let day = Math.floor(delaiedDuration / (24 * 60))
          let hour = Math.floor((delaiedDuration - (day * 24 * 60)) / 60) 
          let minutes = delaiedDuration - (day * 24 * 60) - (hour * 60)
          if (day) {
            duration += day + '天'
          }
          if (hour) {
            duration += hour + '小时'
          }
          if (minutes) {
            duration += minutes + '分钟'
          }
          obj.duration = duration
          obj.messageList = JSON.parse(obj.lastMessageContent)
          obj.lastMessage = obj.messageList.length ? obj.messageList[0] : null
          return obj
        })
        this.queryDoctors(list)
        this.totalCount = res.totalCount
      })
    },
    scrolltolower() {
      if (!this.list.length && this.list.length < this.totalCount) {
        this.pageIndex++
        this.queryDelaiedReplyIMGroups()
      }
    },
    /**
     * 查询医生信息
     */
    queryDoctors(list) {
      if (!list.length) {
        return
      }
      let ids = Array.from(new Set(list.filter(obj => obj.respondentType === 'Doctor').map(obj => obj.respondentSign)))
      this.httpFly.post({
        query: `query{
          doctors(doctorIDs:${JSON.stringify(ids)}) {
            id,
            name,
            headImageUrl
          }
        }`
      }, '/medicalgroup/api/graphql', res => {
         if (res && res.data && res.data.doctors) {
          let doctorsObj = res.data.doctors.reduce((a, b) => {
            if (!a[b['id']]) {
              a[b['id']] = b
            }
            return a
          }, {})
          this.list = this.list.concat(list.map(obj => {
            obj.doctorInfo = doctorsObj[obj.respondentSign]
            return obj
          }))
        }
      })
    },
    /**
     * 跳转详情
     */
    toDetail(data) {
      wx.setStorageSync('responseInfo', {
        doctorImageUrl: data.doctorInfo.headImageUrl
      })
      wx.navigateTo({
        url: '/pages/imResponseDetail/main?groupId=' + data.groupId + '&healthRecordId=' + data.healthRecordId
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.page-wrap {
  min-height: 100%;
  background-color: #f5f5f5;
  .empty-data {
    padding-top: 40%;
  }
  .list {
    padding: 30rpx;
    height: calc(100vh - 60rpx);
    .item {
      display: flex;
      align-items: center;
      margin-bottom: 30rpx;
      padding: 30rpx 30rpx 30rpx 20rpx;
      background: rgba(255, 255, 255, 1);
      border-radius: 20rpx;
      font-size: 28rpx;
      color: #999;
      &:last-child {
        margin-bottom: 0;
      }
      .doctor-img {
        display: block;
        width: 140rpx;
        height: 140rpx;
        border-radius: 50%;
      }
      .info {
        flex: 1;
        margin-left: 22rpx;
        .name-time {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #333;
          .name {
            font-size: 40rpx;
          }
        }
        .last-message {
          margin-top: 16rpx;
          max-width: 450rpx;
        }
      }
    }
  }
}
</style>
