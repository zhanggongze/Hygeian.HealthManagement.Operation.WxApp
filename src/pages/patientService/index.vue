<template>
  <div class="page-patient-service">
    <div class="empty-data" v-if="isEmpty">
      <img class="img" src="/static/images/empty_message.png" alt />
      <div class="p">暂无记录</div>
    </div>
    <div class="service-item" v-for="(data, index) in list" :key="index">
      <div class="left">
        <img class="service-icon" src="/static/images/service_doctor.png" alt />
        <div class="service-name">{{data.serviceName}}</div>
      </div>
      <div class="right">
        <div class="validity">剩余{{data.remainingUnits}}天</div>
        <div class="time">{{data.remainingDate}}到期</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      isEmpty: true,
      healthRecordId: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.healthRecordId = options.healthRecordId
    this.queryServiceContracts()
  },
  methods: {
    queryServiceContracts() {
      this.httpFly.post({
        healthRecordId: this.healthRecordId
      }, '/servicepackage/api/v1/doctor/queryServiceContracts', res => {
        this.isEmpty = !(res.items && res.items.length)
        this.list = res.items ? res.items.map(obj => {
          let date = new Date()
          obj.remainingDate = this.utils.formatTime(date.setDate(date.getDate() + parseInt(obj.remainingUnits)), true)
          return obj
        }) : []
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-patient-service {
  padding: 0 30rpx;
  .empty-data {
    padding-top: 200rpx;
  }
  .service-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 140rpx;
    border-bottom: 1rpx solid #e1e1e1;
    .left {
      display: flex;
      justify-items: center;
      .service-icon {
        margin-right: 12rpx;
        width: 48rpx;
        height: 48rpx;
      }
      .service-name {
        font-size: 36rpx;
        color: #303f60;
      }
    }
    .right {
      text-align: right;
      .validity {
        font-size: 32rpx;
        color: #303f60;
      }
      .time {
        color: #8b8fab;
        font-size: 24rpx;
      }
    }
  }
}
</style>