<template>
  <div class="page-wrap">
    <div class="search-box-wrap">
      <div class="search-wrap">
        <img class="icon-search" src="/static/images/icon_search.png" alt />
        <input class="input" placeholder="请输入客户姓名进行搜索" confirm-type="search" v-model="keyword" @confirm="search" />
      </div>
      <div class="sign-wrap" @click="sign">
        <img class="icon" src="/static/images/sys.png" alt="">
        <div>签到</div>
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
          v-if="!isEmpty"
          scroll-y="true"
          @scrolltolower="scrolltolower"
        >
          <div class="list">
            <div class="item" v-for="(data, index) in list" :key="index" @click="toDetail(data)">
              <div class="header">
                <div class="name">{{data.contract.contractName}}</div>
                <div class="content">
                  <!-- <div class="label">套餐包：{{data.servicePackageInfo ? data.servicePackageInfo.name : ''}}</div> -->
                  <div
                    class="label"
                  >有效期：{{data.contractStartDateTime}}至{{data.contractExpirationDateTime}}</div>
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
          <img class="img" src="/static/images/empty_message.png" alt />
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
            <div class="item" v-for="(data, index) in list1" :key="index" @click="toDetail(data)">
              <div class="header">
                <div class="name">{{data.contract.contractName}}</div>
                <div class="content">
                  <!-- <div class="label">套餐包：{{data.servicePackageInfo ? data.servicePackageInfo.name : ''}}</div> -->
                  <div class="label">预约时间：{{data.reservationDateTime}}</div>
                  <div class="label">预约地点：{{data.reservation.reservationLocationName}}</div>
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
          <img class="img" src="/static/images/empty_message.png" alt />
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
            <div class="item" v-for="(data, index) in list2" :key="index" @click="toDetail(data)">
              <div class="header">
                <div class="name">{{data.contract.contractName}}</div>
                <div class="content">
                  <!-- <div class="label">套餐包：{{data.servicePackageInfo ? data.servicePackageInfo.name : ''}}</div> -->
                  <div class="label">签到时间：{{data.signedDateTime}}</div>
                  <div class="label">签到地点：{{data.reservation.reservationLocationName}}</div>
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
          <img class="img" src="/static/images/empty_message.png" alt />
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
            <div class="item" v-for="(data, index) in list3" :key="index" @click="toDetail(data)">
              <div class="header">
                <div class="name">{{data.contract.contractName}}</div>
                <div class="content">
                  <!-- <div class="label">套餐包：{{data.servicePackageInfo ? data.servicePackageInfo.name : ''}}</div> -->
                  <div class="label">过期时间：{{data.contractExpirationDateTime}}</div>
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
          <img class="img" src="/static/images/empty_message.png" alt />
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
      healthRecordIDs: [],
      healthRecordsInfo: null,
      status: this.dict.ApponitmentStatus,
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
    this.init()
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
    init() {
      this.httpFly.post({
        skipCount: 0,
        maxResultCount: 999
      }, '/healthrecord/api/v1/partner/queryHealthRecords', res => {
        if(res && res.items && res.items.length) {
          this.healthRecordIDs = res.items.map(obj => obj.id)
          this.healthRecordsInfo = res.items.reduce((a, b) => {
            if(!a[b['id']]) {
              b.age = this.utils.getAge(b.dob)
              a[b['id']] = b
            }
            return a
          }, {})
          this.queryList()
          this.queryList(1)
          this.queryList(2)
          this.queryList(3)
        }
      })
    },
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
      let statusList = this.status.map(obj => parseInt(obj.value))
      let processIndex = this.currentIndex
      if (type) {
        processIndex = type
      }
      this.httpFly.post({
        reservationProgress: statusList[processIndex],
        healthRecordIDs: this.healthRecordIDs,
        skipCount: pageList[processIndex] * 10,
        maxResultCount: 10
      }, '/servicepackage/api/v1/partner/PhysicalExamination/ExaminationServiceContract/QueryContracts', res => {
        this.totalCount = res.totalCount
        if (res && res.totalCount) {
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
            this.list3 = this.list3.concat(result)
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
    toDetail(data) {
      wx.navigateTo({
        url: '/pages/appointmentDetail/main?contractID=' + data.contract.contractID + '&reservationID=' + data.reservation.reservationID
      })
    },
    /**
     * 签到
     */
    sign() {
      wx.scanCode({
        success (res) {
          try {
            let param = JSON.parse(res.result)
            wx.navigateTo({
              url: `/pages/appointmentDetail/main?contractID=${param.contractID}&reservationID=${param.reservationID}&type=sign`
            })
          } catch (error) {
            
          }
          
        }
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
    display: flex;
    align-items: center;;
    padding: 10rpx 30rpx 0;
    background-color: #fff;
    .search-wrap {
      flex: 1;
      display: flex;
      align-items: center;
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
    .sign-wrap {
      display: flex;
      align-items: center;
      font-size: 32rpx;
      color: #408BF1;
      .icon {
        display: block;
        margin: 0 10rpx 0 30rpx;
        width: 36rpx;
        height: 36rpx;
      }
    }
  }
  .navs {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 30rpx;
    background-color: #fff;
    height: 100rpx;
    .nav-item {
      position: relative;
      padding: 0 15rpx;
      height: 100rpx;
      text-align: center;
      line-height: 100rpx;
      font-size: 30rpx;
      color: #8b8fab;
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
    height: calc(100vh - 168rpx);
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

