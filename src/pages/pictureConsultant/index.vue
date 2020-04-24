<template>
  <div class="page-wrap">
    <div class="navs">
      <div
        class="nav-item"
        :class="{'selected': index === currentIndex}"
        v-for="(data, index) in status"
        :key="index"
        @click="navClick(data, index)"
      >{{data.key}}</div>
    </div>
    <swiper :current="currentIndex" duration="300" class="result" @change="swiperChange">
      <swiper-item>
        <scroll-view
          style="height: 100%"
          v-if="!isEmpty"
          scroll-y="true"
          @scrolltolower="scrolltolower"
        >
          <div class="list">
            <div class="item" v-for="(data, index) in list" :key="index" @click="toChat(data.consultation.consultationID)">
              <div class="header">
                <div class="name">{{data.consultation.patientName}}</div>
                <div class="gender">{{data.consultation.patientSex}}</div>
                <div class="age">{{data.consultation.patientAge}}岁</div>
              </div>
              <div class="content">病情描述：{{data.consultation.illnessDescribe}}</div>
              <div class="footer">
                <div class="time">{{data.consultation.creationDateTime}}</div>
                <div class="status">
                  <img class="icon-status" v-if="data.consultation.progress === 100" src="/static/images/consult_new.png" alt="">
                  <img class="icon-status" v-else-if="data.consultation.progress === 200" src="/static/images/consult_reply.png" alt="">
                  <img class="icon-status" v-else-if="data.consultation.progress === 300" src="/static/images/consult_wait.png" alt="">
                  <div>{{data.consultation.progressTxt}}</div>
                </div>
              </div>
            </div>
          </div>
        </scroll-view>
        <div class="empty-data" v-else>
          <img class="img" src="/static/images/empty_message.png" alt="" />
          <div class="p">暂无记录</div>
        </div>
      </swiper-item>
      <swiper-item>
        <scroll-view
          style="height: 100%"
          v-if="!isEmpty1"
          scroll-y="true"
          @scrolltolower="scrolltolower1"
        >
          <div class="list">
            <div class="item" v-for="(data, index) in list1" :key="index" @click="toChat(data.consultation.consultationID)">
              <div class="header">
                <div class="name">{{data.consultation.patientName}}</div>
                <div class="gender">{{data.consultation.patientSex}}</div>
                <div class="age">{{data.consultation.patientAge}}岁</div>
              </div>
              <div class="content">病情描述：{{data.consultation.illnessDescribe}}</div>
              <div class="footer">
                <div class="time">{{data.consultation.creationDateTime}}</div>
                <div class="status">
                  <div>已完成</div>
                </div>
              </div>
            </div>
          </div>
        </scroll-view>
        <div class="empty-data" v-else>
          <img class="img" src="/static/images/empty_message.png" alt="" />
          <div class="p">暂无记录</div>
        </div>
      </swiper-item>
      <swiper-item>
        <scroll-view
          style="height: 100%"
          v-if="!isEmpty2"
          scroll-y="true"
          @scrolltolower="scrolltolower2"
        >
          <div class="list">
            <div class="item" v-for="(data, index) in list2" :key="index" @click="toChat(data.consultation.consultationID)">
              <div class="header">
                <div class="name">{{data.consultation.patientName}}</div>
                <div class="gender">{{data.consultation.patientSex}}</div>
                <div class="age">{{data.consultation.patientAge}}岁</div>
              </div>
              <div class="content">病情描述：{{data.consultation.illnessDescribe}}</div>
              <div class="footer">
                <div class="time">{{data.consultation.creationDateTime}}</div>
                <div class="status">
                  <div>超时取消</div>
                </div>
              </div>
            </div>
          </div>
        </scroll-view>
        <div class="empty-data" v-else>
          <img class="img" src="/static/images/empty_message.png" alt="" />
          <div class="p">暂无记录</div>
        </div>
      </swiper-item>
    </swiper>
  </div>
</template>
<script>
export default {
  data() {
    return {
      status: this.dict.consultantStatus,
      currentIndex: 0,
      pageIndex: 0,
      totalCount: 0,
      pageIndex1: 0,
      totalCoun1: 0,
      pageIndex2: 0,
      totalCount2: 0,
      isEmpty: true,
      isEmpty1: true,
      isEmpty2: true,
      list: [],
      list1: [],
      list2: []
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.queryList()
    this.queryList(1)
    this.queryList(2)
  },
  onShow() {
    let pages = getCurrentPages()
    let curPage = pages[pages.length - 1]
    if (curPage.data.needRefresh) {
      delete curPage.data.needRefresh
      this.pageIndex = 0
      this.pageIndex1 = 0
      this.pageIndex2 = 0
      this.list = []
      this.list1 = []
      this.list2 = []
      this.queryList()
      this.queryList(1)
      this.queryList(2)
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
    /**
     * 上拉加载更多
     */
    scrolltolower1() {
      if (!this.isEmpty1 && this.list1.length < this.totalCount1) {
        this.pageIndex1++
        this.queryList()
      }
    },
    /**
     * 上拉加载更多
     */
    scrolltolower2() {
      if (!this.isEmpty2 && this.list2.length < this.totalCount2) {
        this.pageIndex2++
        this.queryList()
      }
    },
    queryList(type) {
      let pageList = [this.pageIndex, this.pageIndex1, this.pageIndex2]
      let statusList = [[100, 200, 300], [500], [600]]
      let processIndex = this.currentIndex
      if (type) {
        processIndex = type
      }
      this.httpFly.post({
        ConsultationProgresses: statusList[processIndex],
        skipCount: pageList[processIndex] * 10,
        maxResultCount: 10
      }, '/servicepackage/api/v1/doctor/Consult/Ask/QueryConsultations', res => {
        this.totalCount = res.totalCount
        if (res && res.totalCount) {
          let result = res.items.map(obj => {
            obj.consultation.creationDateTime = this.utils.formatTime(obj.consultation.creationDateTime)
            obj.consultation.progressTxt = this.dict.ConsultantProgress[String(obj.consultation.progress)]
            return obj
          })
          if (processIndex === 0) {
            this.totalCount = res.totalCount
            this.isEmpty = false
            this.list = this.list.concat(result)
          } else if (processIndex === 1) {
            this.totalCount1 = res.totalCount
            this.isEmpty1 = false
            this.list1 = this.list1.concat(result)
          } else if (processIndex === 2) {
            this.totalCount2 = res.totalCount
            this.isEmpty2 = false
            this.list2 = this.list2.concat(result)
          }
        } else {
          if (processIndex === 0) {
            this.isEmpty = true
          } else if (processIndex === 1) {
            this.totalCount1 = res.totalCount
          } else if (processIndex === 2) {
            this.isEmpty2 = true
          }
        }
      })
    },
    navClick(data, index) {
      this.currentIndex = index
    },
    swiperChange(e) {
      this.currentIndex = e.target.current
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
.page-wrap {
  min-height: 100%;
  background: #f5f5f5;
  .navs {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 30rpx;
    height: 84rpx;
    background-color: #fff;
    .nav-item {
      position: relative;
      padding: 0 12rpx;
      height: 84rpx;
      text-align: center;
      line-height: 84rpx;
      font-size: 32rpx;
      color: #8b8fab;
      &.selected {
        &::after {
          z-index: 2;
          content: "";
          position: absolute;
          width: 100%;
          left: 0;
          bottom: 0;
          height: 3rpx;
          background-color: #36507E;
        }
        color: #36507E;
      }
    }
  }
  .result {
    height: calc(100vh - 84rpx);
    .empty-data {
      padding-top: 40%;
    }
    .list {
      padding: 30rpx;
      .item {
        margin-bottom: 30rpx;
        padding: 0 20rpx;
        background-color: #fff;
        box-shadow: 0 0 10rpx 0 rgba(153, 153, 153, 0.35);
        border-radius: 10rpx;
        font-size: 26rpx;
        color: #8B8FAB;
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
}
</style>