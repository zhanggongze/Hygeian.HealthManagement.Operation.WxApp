<template>
  <div class="page-wrap">
    <div class="empty-data" v-if="!list.length">
      <img class="img" src="/static/images/empty_message.png" alt="">
      <div class="p">暂无记录</div>
    </div>
    <scroll-view v-else class="record-list" scroll-y="true" @scrolltolower="scrolltolower">
      <div class="list-view">
        <div class="item" v-for="(data, index) in list" :key="index" @click="toDetail(data)">
          <div class="header">
            <div class="name">{{data.name}}</div>
            <div class="content">
              <div class="label">套餐包：{{data.customerContract.name}}</div>
              <div class="label">时间：{{data.activedDateTime}}</div>
            </div>
          </div>
          <div class="footer">
            <div class="patient-info">
              <div class="patient-name">张三</div>
            </div>
            <div class="gender-age">
              <span class="gender">男</span>
              <span class="age">6岁</span>
            </div>
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
      list: [],
      // 当前页码
      pageIndex: 1,
      // 总记录数
      totalCount: 0,
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    if (wx.getStorageSync('healthRecordsInfo')) {
      this.getList()
    } else {
      this.getHealthRecords()
    }
  },
  methods: {
    getList() {
      this.httpFly.post({
        statuses: [20],
        startupModes: [20],
        skipCount: (this.pageIndex - 1) * 10,
        maxResultCount: 10,
        isRemaining: true
      }, '/servicepackage/api/v1/partner/CustomerContracts/QueryCustomerContractItems', res => {
        let healthRecordsInfo = wx.getStorageSync('healthRecordsInfo')
        this.totalCount = res.totalCount
        this.list = this.list.concat(res.items.map(obj => {
          obj.healthRecordInfo = healthRecordsInfo ? healthRecordsInfo[obj.customerContract.healthRecordId] : null
          obj.activedDateTime = this.utils.formatTime(obj.activedDateTime)
          return obj
        }))
      })
    },
    getHealthRecords() {
      this.httpFly.post({
        skipCount: 0,
        maxResultCount: 99999
      }, '/healthRecord/api/v1/partner/queryHealthRecords', res => {
        if (res && res.items && res.items.length) {
          wx.setStorageSync('healthRecordsInfo', res.items.reduce((a, b) => {
            if (!a[b['id']]) {
              b.age = this.utils.getAge(b['dob'])
              a[b['id']] = b
            }
            return a
          }, {}))
        }
        this.getList()
      })
    },
    toDetail(data) {
      let unitDict = {
        '0': '日',
        '10': '次'
      }
      wx.navigateTo({
        url: `/pages/packageIntroduction/main?isConsume=1&serviceType=${data.serviceType}&id=${data.customerContract.servicePackageId}&servicePackageItemId=${data.servicePackageItemId}&healthRecordId=${data.customerContract.healthRecordId}&identity=${data.provider.identity ? data.provider.identity : ''}&customerContractId=${data.customerContract.id}&customerContractItemId=${data.id}&serviceName=${data.name}&serviceCount=${data.totalUnits + unitDict[String(data.unit)]}`
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.page-wrap {
  height: 100%;
  background-color: #f5f5f5;
  .empty-data {
    padding-top: 40%;
  }
  .record-list {
    box-sizing: border-box;
    .list-view {
      padding-top: 30rpx;
      height: calc(100vh - 30rpx);
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