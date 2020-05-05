<template>
  <div class="page-wrap">
    <div class="search-box-wrap">
      <div class="search-wrap">
        <img class="icon-search" src="/static/images/icon_search.png" alt />
        <input class="input" placeholder="请输入客户姓名或关联手机号进行搜索" confirm-type="search" v-model="keyword" @confirm="search" />
      </div>
    </div>
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
          v-if="list.length"
          scroll-y="true"
          @scrolltolower="scrolltolower"
        >
          <div class="list">
            <div class="item" v-for="(data, index) in list" :key="index" @click="toDetail(data)">
              <div class="header">
                <div class="name">{{data.contract.contractName}}</div>
                <div class="content">
                  <!-- <div class="label">套餐包：心脑血管风险评估包</div> -->
                  <div class="label">检查日期：{{data.reservationDateTime}}</div>
                  <div class="label">检查机构：{{data.reservation.reservationLocationName}}</div>
                </div>
              </div>
              <div class="footer" v-if="data.healthRecordInfo">
                <div class="patient-info">
                  <div class="patient-name">{{data.healthRecordInfo.name}}</div>
                </div>
                <div class="gender-age">
                  <span class="gender">{{data.healthRecordInfo.gender}}</span>
                  <span class="age">{{data.healthRecordInfo.age}}岁</span>
                </div>
              </div>
            </div>
          </div>
        </scroll-view>
        <div class="empty-data" v-else>
          <img class="img" src="/static/images/empty_message.png" alt="">
          <div class="p">暂无记录</div>
        </div>
      </swiper-item>
      <swiper-item>
        <scroll-view
          style="height: 100%"
          v-if="list1.length"
          scroll-y="true"
          @scrolltolower="scrolltolower1"
        >
          <div class="list">
            <div class="item" v-for="(data, index) in list1" :key="index" @click="toDetail(data)">
              <div class="header">
                <div class="name">{{data.contract.contractName}}</div>
                <div class="content">
                  <!-- <div class="label">套餐包：心脑血管风险评估包</div> -->
                  <div class="label">检查日期：{{data.reservationDateTime}}</div>
                  <div class="label">检查机构：{{data.reservation.reservationLocationName}}</div>
                </div>
              </div>
              <div class="footer">
                <div class="patient-info">
                  <div class="patient-name">{{data.healthRecordInfo.name}}</div>
                </div>
                <div class="gender-age">
                  <span class="gender">{{data.healthRecordInfo.gender}}</span>
                  <span class="age">{{data.healthRecordInfo.age}}岁</span>
                </div>
              </div>
            </div>
          </div>
        </scroll-view>
        <div class="empty-data" v-else>
          <img class="img" src="/static/images/empty_message.png" alt="">
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
      status: [{
        key: '进行中',
        value: 0
      }, {
        key: '已完成',
        value: 1
      }],
      currentIndex: 0,
      pageIndex: 0,
      totalCount: 0,
      pageIndex1: 0,
      totalCoun1: 0,
      list: [],
      list1: [],
      keyword: '',
      healthRecordsInfo: null,
      healthRecordIDs: []
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.init(() => {
      this.queryList(0)
      this.queryList(1)
    })
  },
  onShow() {
    let pages = getCurrentPages()
    let curPage = pages[pages.length - 1]
    if (curPage.data.needRefresh) {
      delete curPage.data.needRefresh
      this.init(() => {
        this.pageIndex = 0
        this.totalCount = 0
        this.list = []
        this.pageIndex1 = 0
        this.totalCount1 = 0
        this.list1 = []
        this.queryList(0)
        this.queryList(1)
      })
    }
  },
  methods: {
    init(callback) {
      let index = this.currentIndex
      if (index === 0) {
        this.pageIndex = 0
        this.totalCount = 0
        this.list = []
      } else if (index === 1) {
        this.pageIndex1 = 0
        this.totalCount1 = 0
        this.list1 = []
      }
      this.httpFly.post({
        keyword: this.keyword,
        // name: this.keyword,
        skipCount: 0,
        maxResultCount: 999
      }, '/healthrecord/api/v1/partner/queryHealthRecordsWithCustomer', res => {
        if(res && res.items && res.items.length) {
          this.healthRecordIDs = res.items.map(obj => obj.healthRecordId)
          this.healthRecordsInfo = res.items.reduce((a, b) => {
            if(!a[b['healthRecordId']]) {
              b.age = this.utils.getAge(b.dob)
              a[b['healthRecordId']] = b
            }
            return a
          }, {})
          callback && callback()
        }
      })
    },
    /**
     * 上拉加载更多
     */
    scrolltolower() {
      if (this.list.length && this.list.length < this.totalCount) {
        this.pageIndex++
        this.queryList()
      }
    },
    /**
     * 上拉加载更多
     */
    scrolltolower1() {
      if (this.list1.length && this.list1.length < this.totalCount1) {
        this.pageIndex1++
        this.queryList()
      }
    },
    queryList(type) {
      let pageList = [this.pageIndex, this.pageIndex1]
      let processIndex = this.currentIndex
      if (type) {
        processIndex = type
      }
      this.httpFly.post({
        reservationProgress: 200,
        healthRecordIDs: this.healthRecordIDs,
        skipCount: pageList[processIndex] * 10,
        maxResultCount: 10,
        locationCode: wx.getStorageSync("activeInfo")['region'],
        isFinished: processIndex === 1 ? true : false
      }, '/servicepackage/api/v1/partner/PhysicalExamination/ExaminationServiceContract/QueryContracts', res => {
        this.totalCount = res.totalCount
        let result = res.items.map(obj => {
          obj.healthRecordInfo = this.healthRecordsInfo[obj.contract.contractHealthRecordId]
          obj.contractStartDateTime = this.utils.formatTime(obj.contract.contractStartDateTime, 'yyyy-MM-dd')
          obj.contractExpirationDateTime = obj.contract.contractExpirationDateTime === '9999-12-31T23:59:59.9999999+00:00' ? '不限' : this.utils.formatTime(obj.contract.contractExpirationDateTime, 'yyyy-MM-dd')
          obj.reservationDateTime = this.utils.formatTime(obj.reservation.reservationDateTime, 'yyyy-MM-dd')
          obj.signedDateTime = this.utils.formatTime(obj.reservation.signedDateTime, 'yyyy-MM-dd')
          return obj
        })
        if (processIndex === 0) {
          this.totalCount = res.totalCount
          this.list = this.list.concat(result)
        } else if (processIndex === 1) {
          this.totalCount1 = res.totalCount
          this.list1 = this.list1.concat(result)
        }
      })
    },
    navClick(data, index) {
      this.currentIndex = index
    },
    search() {
      this.init(() => {
        this.queryList(this.currentIndex)
      })
    },
    swiperChange(e) {
      this.currentIndex = e.target.current
    },
    toDetail(data) {
      wx.navigateTo({
        url: '/pages/inspectionDetail/main?contractID=' + data.contract.contractID + '&reservationID=' + data.reservation.reservationID + '&isFinish=' + this.currentIndex
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.page-wrap {
  height: 100%;
  background-color: #f5f5f5;
  .search-box-wrap {
    padding: 10rpx 0 0;
    background-color: #fff;
    .search-wrap {
      display: flex;
      align-items: center;
      margin: 0 30rpx;
      padding: 0 30rpx;
      height: 68rpx;
      background-color: #f5f5f5;
      border-radius: 34rpx;
      .icon-search {
        margin-right: 12rpx;
        width: 28rpx;
        height: 28rpx;
      }
      .input {
        flex: 1;
        font-size: 26rpx;
      }
    }
  }
  .navs {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 100rpx;
    background-color: #fff;
    .nav-item {
      position: relative;
      padding: 0 15rpx;
      height: 100rpx;
      text-align: center;
      line-height: 100rpx;
      font-size: 30rpx;
      color: #999;
      &.selected {
        &::after {
          z-index: 2;
          content: "";
          position: absolute;
          width: 100%;
          left: 0;
          bottom: 0;
          height: 4rpx;
          background-color: #408BF1;
        }
        font-weight: 700;
        color: #408BF1;
      }
    }
  }
  .result {
    height: calc(100vh - 188rpx);
    background-color: #f5f5f5;
    .empty-data {
      padding-top: 40%;
    }
    .list {
      padding-top: 30rpx;
      .item {
        margin: 0 30rpx 30rpx;
        padding: 0 30rpx;
        background-color: #fff;
        border-radius: 10rpx;
        font-size: 28rpx;
        color: #333;
        .header {
          padding: 30rpx 0 10rpx;
          .name {
            font-size: 40rpx;
          }
          .content {
            padding: 20rpx 0 10rpx;
            color: #999;
            font-size: 28rpx;
            .label {
              line-height: 44rpx;
            }
          }
        }
        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 92rpx;
          border-top: 1rpx solid #e1e1e1;
          .patient-info {
            display: flex;
            align-items: center;
            .patient-name {
              font-size: 36rpx;
            }
          }
          .gender-age {
            color: #999;
            .gender {
              margin-right: 20rpx;
            }
          }
        }
      }
    }
  }
}
</style>