<template>
  <div class="page-wrap">
    <div class="empty-data" v-if="!list.length">
      <img class="img" src="/static/images/empty_message.png" alt="">
      <div class="p">暂无记录</div>
    </div>
    <div v-else class="list">
      <div class="item" v-for="(data, index) in list" :key="index">
        <div class="doctor-info">
          <img class="doctor-img" :src="data.headImageUrl" alt="">
          <div class="info">
            <div class="name-professional">
              <div class="name">{{data.name}}</div>
              <div class="professional">{{data.professionalTitle}}</div>
            </div>
            <div class="hospital-depart">
              <div class="hospital">{{data.hospitalName}}</div>
              <div class="depart">{{data.departmentName}}</div>
            </div>
          </div>
        </div>
        <div class="statistic-info">
          <div class="statistic-item">
            <div class="num">{{data.over8HoursDelayedCount}}</div>
            <div>超过8小时</div>
          </div>
          <div class="statistic-item">
            <div class="num">{{data.over16HoursDelayedCount}}</div>
            <div>超过16小时</div>
          </div>
          <div class="statistic-item">
            <div class="num">{{data.over24HoursDelayedCount}}</div>
            <div>超过24小时</div>
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
      list: []
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.getResult()
  },
  methods: {
    /**
     * 获取统计结果
     */
    getResult() {
      this.httpFly.post({
        region: wx.getStorageSync('activeInfo')['region'],
        hospitalName: ''
      }, 'report/api/v1/partner/consultationServiceReplyStatusReport', res => {
        this.list = this.list.concat(res.providerSummaries.map(obj => {
          obj.professionalTitle = this.dict.professionalDict[
            obj.professionalTitle.toUpperCase()
          ]
          return obj
        }))
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
    .item {
      margin-bottom: 30rpx;
      padding: 30rpx 0;
      background: rgba(255, 255, 255, 1);
      border-radius: 20rpx;
      font-size: 28rpx;
      color: #999;
      &:last-child {
        margin-bottom: 0;
      }
      .doctor-info {
        display: flex;
        align-items: center;
        padding: 0 20rpx;
        .doctor-img {
          display: block;
          width: 140rpx;
          height: 140rpx;
          border-radius: 50%;
        }
        .info {
          margin-left: 24rpx;
          .name-professional {
            display: flex;
            align-items: flex-end;
            .name {
              margin-right: 20rpx;
              font-size: 40rpx;
              color: #333;
            }
          }
          .hospital-depart {
            display: flex;
            align-items: center;
            margin-top: 10rpx;
            .depart {
              margin-left: 20rpx;
            }
          }
        }
      }
      .statistic-info {
        display: flex;
        margin-top: 14rpx;
        .statistic-item {
          flex: 1;
          text-align: center;
          .num {
            font-size: 40rpx;
            color: #408BF1;
          }
        }
      }
    }
  }
}
</style>
