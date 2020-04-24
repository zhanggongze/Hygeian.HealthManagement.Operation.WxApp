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
            <div class="item" v-for="(data, index) in list" :key="index">
              <div class="header">
                <div class="name">{{data.patientName}}</div>
                <div class="btn-wrap">
                  <div class="btn" @click="toRecordDetail(data)">查看档案</div>
                  <div class="btn" @click="toAddAssessment(data)">随访评估</div>
                </div>
              </div>
              <div class="gender-age">
                <div class="gender">{{data.patientSex}}</div>
                <div class="age">{{data.age}}岁</div>
              </div>
              <div class="time">回执时间：{{data.repliedDatetime}}</div>
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
            <div class="item" v-for="(data, index) in list1" :key="index">
              <div class="header">
                <div class="name">{{data.patientName}}</div>
                <div class="btn-wrap">
                  <div class="btn" @click="toRecordDetail(data)">查看档案</div>
                </div>
              </div>
              <div class="gender-age">
                <div class="gender">{{data.patientSex}}</div>
                <div class="age">{{data.age}}岁</div>
              </div>
              <div class="time">执行时间：{{data.scheduleDateTime}}</div>
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
            <div class="item" v-for="(data, index) in list2" :key="index">
              <div class="header">
                <div class="name">{{data.patientName}}</div>
                <div class="btn-wrap">
                  <div class="btn" @click="toRecordDetail(data)">查看档案</div>
                </div>
              </div>
              <div class="gender-age">
                <div class="gender">{{data.patientSex}}</div>
                <div class="age">{{data.age}}岁</div>
              </div>
              <div class="time">计划随访日期：{{data.scheduleDate}}</div>
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
          v-if="!isEmpty3"
          scroll-y="true"
          @scrolltolower="scrolltolower3"
        >
          <div class="list">
            <div class="item" v-for="(data, index) in list3" :key="index">
              <div class="header">
                <div class="name">{{data.patientName}}</div>
                <div class="btn-wrap">
                  <div class="btn" @click="toRecordDetail(data)">查看档案</div>
                  <div class="btn" @click="toAssessmentDetail(data)">查看详细</div>
                </div>
              </div>
              <div class="gender-age">
                <div class="gender">{{data.patientSex}}</div>
                <div class="age">{{data.age}}岁</div>
              </div>
              <div class="time">完成时间：{{data.confirmedDatetime}}</div>
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
      status: this.dict.followStatus,
      currentIndex: 0,
      pageIndex: 0,
      totalCount: 0,
      pageIndex1: 0,
      totalCoun1: 0,
      pageIndex2: 0,
      totalCount2: 0,
      pageIndex3: 0,
      totalCount3: 0,
      isEmpty: true,
      isEmpty1: true,
      isEmpty2: true,
      isEmpty3: true,
      list: [],
      list1: [],
      list2: [],
      list3: []
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.queryList()
    this.queryList(1)
    this.queryList(2)
    this.queryList(3)
  },
  onShow() {
    let pages = getCurrentPages()
    let curPage = pages[pages.length - 1]
    if (curPage.data.needRefresh) {
      delete curPage.data.needRefresh
      this.pageIndex = 0
      this.pageIndex = 1
      this.pageIndex = 2
      this.pageIndex = 3
      this.list = []
      this.list1 = []
      this.list2 = []
      this.list3 = []
      this.queryList()
      this.queryList(1)
      this.queryList(2)
      this.queryList(3)
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
    /**
     * 上拉加载更多
     */
    scrolltolower3() {
      if (!this.isEmpty3 && this.list3.length < this.totalCount3) {
        this.pageIndex3++
        this.queryList()
      }
    },
    queryList(type) {
      let pageList = [this.pageIndex, this.pageIndex1, this.pageIndex2, this.pageIndex3]
      let statusList = [30, 20, 10, 40]
      let processIndex = this.currentIndex
      if (type) {
        processIndex = type
      }
      this.httpFly.post({
        scheduleProcess: statusList[processIndex],
        skipCount: pageList[processIndex] * 10,
        maxResultCount: 10
      }, '/followup/api/v1/doctor/querySchedule', res => {
        this.totalCount = res.totalCount
        if (res && res.totalCount) {
          let result = res.items.map(obj => {
            obj.age = this.utils.getAge(obj.patientDob)
            obj.repliedDatetime = this.utils.formatTime(obj.repliedDatetime)
            obj.scheduleDateTime = this.utils.formatTime(obj.scheduleDateTime)
            obj.scheduleDate = this.utils.formatTime(obj.scheduleDateTime, true)
            obj.confirmedDatetime = this.utils.formatTime(obj.confirmedDatetime)
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
          } else if (processIndex === 3) {
            this.totalCount3 = res.totalCount
            this.isEmpty3 = false
            this.list3 = this.list.concat(result)
          }
        } else {
          if (processIndex === 0) {
            this.isEmpty = true
          } else if (processIndex === 1) {
            this.totalCount1 = res.totalCount
          } else if (processIndex === 2) {
            this.isEmpty2 = true
          } else if (processIndex === 3) {
            this.isEmpty3 = true
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
    /**
     * 查看档案详情
     */
    toRecordDetail(data) {
      wx.navigateTo({
        url: '/pages/healthDetail/main?id=' + data.targetSign
      })
    },
    /**
     * 跳转到随访评估
     */
    toAddAssessment(data) {
      wx.navigateTo({
        url: '/pages/addAssessment/main?id=' + data.targetSign + '&scheduleId=' + data.scheduleid
      })
    },
    /**
     * 查看随访明细
     */
    toAssessmentDetail(data) {
      wx.navigateTo({
        url: '/pages/assessmentDetail/main?id=' + data.targetSign + '&scheduleId=' + data.scheduleid
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.navs {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 30rpx;
  height: 84rpx;
  border-bottom: 1rpx solid #e1e1e1;
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
        background-color: #508fff;
      }
      color: #508fff;
    }
  }
}
.result {
  height: calc(100vh - 84rpx);
  .empty-data {
    padding-top: 40%;
  }
  .list {
    .item {
      padding: 0 30rpx;
      border-bottom: 1rpx solid #e1e1e1;
      font-size: 28rpx;
      color: #8b8fab;
      .header {
        display: flex;
        justify-content: space-between;
        padding: 24rpx 0 10rpx;
        .name {
          font-size: 40rpx;
          color: #36507e;
        }
        .btn-wrap {
          display: flex;
          padding: 6rpx 0 0;
          .btn {
            margin-left: 22rpx;
            padding: 0 20rpx;
            background-color: #508fff;
            border-radius: 28rpx;
            line-height: 56rpx;
            font-size: 24rpx;
            color: #fff;
          }
        }
      }
      .gender-age {
        display: flex;
        align-items: center;
        .gender {
          margin-right: 30rpx;
        }
      }
      .time {
        padding: 16rpx 0 26rpx;
      }
    }
  }
}
</style>


