<template>
  <div class="page-service-order">
    <div class="order-item">
      <div class="name-tag">
        <div class="name">王二小</div>
        <div class="tag">私人医生</div>
      </div>
      <div class="gender-age">
        <div class="gender">男</div>
        <div class="age">56岁</div>
      </div>
      <div class="service-time">
        <div class="cycle">
          服务周期：
          <span class="day">7天</span>
        </div>
        <div class="time">2019-10-28 13:30</div>
      </div>
    </div>
    <div class="order-item">
      <div class="name-tag">
        <div class="name">王二小</div>
        <div class="tag">私人医生</div>
      </div>
      <div class="gender-age">
        <div class="gender">男</div>
        <div class="age">56岁</div>
      </div>
      <div class="service-time">
        <div class="cycle">
          服务周期：
          <span class="day">7天</span>
        </div>
        <div class="time">2019-10-28 13:30</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
  }
}
</script>

<style lang="scss" scoped>
.page-service-order {
  padding: 30rpx 30rpx 0;
  .order-item {
    margin-bottom: 40rpx;
    padding: 24rpx 20rpx;
    background-color: #fff;
    box-shadow: 0 5rpx 20rpx 0 rgba(0, 0, 0, 0.15);
    border-radius: 10rpx;
    color: #36507e;
    .name-tag {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .name {
        font-size: 36rpx;
      }
      .tag {
        width: 120rpx;
        height: 48rpx;
        background: linear-gradient(
          90deg,
          rgba(124, 168, 249, 1),
          rgba(147, 208, 249, 1)
        );
        border-radius: 10rpx;
        line-height: 48rpx;
        font-size: 24rpx;
        color: #fff;
        text-align: center;
      }
    }
    .gender-age {
      display: flex;
      margin: 20rpx 0 30rpx;
      font-size: 28rpx;
      color: #8b8fab;
      .age {
        margin-left: 30rpx;
      }
    }
    .service-time {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 20rpx;
      border-top: 1rpx solid #e1e1e1;
      .cycle {
        font-size: 24rpx;
        .day {
          font-size: 32rpx;
        }
      }
      .time {
        font-size: 24rpx;
        color: #8b8fab;
      }
    }
  }
}
</style>