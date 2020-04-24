<template>
  <div class="page-wrap">
    <div class="empty-data" v-if="isEmpty">
      <img class="img" src="/static/images/empty_message.png" alt />
      <div class="p">暂无记录</div>
    </div>
    <scroll-view v-else class="result" scroll-y="true" @scrolltolower="scrolltolower">
      <div class="list">
        <div
          class="item"
          v-for="(data, index) in list"
          :key="index"
          @click="toChat(data.consultation.consultationID)"
        >
          <div class="header">
            <div class="name">{{data.consultation.patientName}}</div>
            <div class="gender">{{data.consultation.patientSex}}</div>
            <div class="age">{{data.consultation.patientAge}}岁</div>
          </div>
          <div class="content">病情描述：{{data.consultation.illnessDescribe}}</div>
          <div class="footer">
            <div class="time">{{data.consultation.creationDateTime}}</div>
            <div class="status" :class="data.color">{{data.progressTxt}}</div>
          </div>
        </div>
      </div>
    </scroll-view>
  </div>
</template>

<script>
export default {
  data() {
    return {
      healthRecordId: '',
      status: this.dict.consultantStatus,
      pageIndex: 0,
      totalCount: 0,
      isEmpty: true,
      list: []
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.healthRecordId = options.healthRecordId
    this.queryList()
  },
  onShow() {
    let pages = getCurrentPages()
    let curPage = pages[pages.length - 1]
    if (curPage.data.needRefresh) {
      delete curPage.data.needRefresh
      this.pageIndex = 0
      this.list = []
      this.queryList()
    }
  },
  methods: {
    /**
     * 上拉加载更多
     */
    scrolltolower() {
      if (!this.isEmpty && this.list.length < this.totalCount) {
        this.pageIndex++
        this.queryList()
      }
    },
    queryList(type) {
      this.httpFly.post({
        healthRecordId: this.healthRecordId,
        ConsultationProgresses: [100, 200, 300, 500, 600],
        skipCount: this.pageIndex * 10,
        maxResultCount: 10
      }, '/servicepackage/api/v1/doctor/Consult/Ask/QueryConsultations', res => {
        this.totalCount = res.totalCount
        if (res && res.totalCount) {
          let result = res.items.map(obj => {
            obj.consultation.creationDateTime = this.utils.formatTime(obj.consultation.creationDateTime)
            let progress = String(obj.consultation.progress)
            obj.progressTxt = this.dict.AskProgress[progress]
            obj.color = progress === '500' ? 'black' : progress === '600' ? 'grey' : ''
            return obj
          })
          this.totalCount = res.totalCount
          this.isEmpty = false
          this.list = this.list.concat(result)
        } else {
          this.isEmpty = true
        }
      })
    },
    toChat(consultationID) {
      wx.navigateTo({
        url: '/pages/pictureChat/main?consultationID=' + consultationID
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.empty-data {
  padding-top: 40%;
}
.result {
  height: 100vh;
  .list {
    padding: 30rpx;
    .item {
      margin-bottom: 30rpx;
      padding: 0 20rpx;
      background-color: #fff;
      box-shadow: 0 0 10rpx 0 rgba(153, 153, 153, 0.35);
      border-radius: 10rpx;
      font-size: 26rpx;
      color: #8b8fab;
      &:last-child {
        margin-bottom: 0;
      }
      .header {
        display: flex;
        align-items: flex-end;
        line-height: 90rpx;
        .name {
          font-size: 36rpx;
          color: #333;
        }
        .gender {
          margin: 0 20rpx;
        }
      }
      .content {
        padding-bottom: 26rpx;
        overflow: hidden; //将超出的部分隐藏
        text-overflow: ellipsis; //超出部分用省略号显示
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
      .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1rpx solid #e1e1e1;
        line-height: 80rpx;
        .time {
          font-size: 24rpx;
        }
        .status {
          display: flex;
          align-items: center;
          font-size: 30rpx;
          color: #00CE9E;
          &.grey {
            color: #999;
          }
          &.black {
            color: #333;
          }
          .icon-status {
            margin-right: 10rpx;
            width: 36rpx;
            height: 36rpx;
          }
        }
      }
    }
  }
}
</style>