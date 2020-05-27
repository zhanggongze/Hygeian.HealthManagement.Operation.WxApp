<template>
  <div class="page-wrap">
    <div class="base-info">
      <div class="form-item">
        <div class="label">发卡渠道</div>
        <div class="value">南昌一脉影像中心</div>
      </div>
      <div class="form-item">
        <div class="label">套餐卡</div>
        <div class="value">南昌一脉影像中心</div>
      </div>
      <div class="form-item">
        <div class="label">服务包</div>
        <div class="value">南昌一脉影像中心</div>
      </div>
      <div class="form-item">
        <div class="label">付款方式</div>
        <div class="value">南昌一脉影像中心</div>
      </div>
      <div class="form-item">
        <div class="label">发卡日期</div>
        <div class="value">南昌一脉影像中心</div>
      </div>
    </div>
    <div class="hr"></div>
    <div class="num-info">
      <div class="form-item">
        <div class="label">发卡数量</div>
        <div class="value">南昌一脉影像中心</div>
      </div>
      <div class="detail-info">
        <div class="form-item">
          <div class="label">明细1</div>
          <div class="value">40张 (100029-100069)</div>
        </div>
        <div class="form-item">
          <div class="label">明细1</div>
          <div class="value">40张 (100029-100069)</div>
        </div>
      </div>
    </div>
    <div class="btn-wrap">
      <div class="back-btn" @click="back">返回</div>
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
  },
  methods: {
    back() {
      wx.navigateBack({
        delta: 1
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.page-wrap {
  .form-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 29rpx 30rpx;
    border-bottom: 1rpx solid #e1e1e1;
    font-size: 32rpx;
    .label {
      margin-right: 30rpx;
      color: #333;
    }
    .value {
      color: #999;
    }
  }
  .hr {
    height: 30rpx;
    background-color: #f5f5f5;
  }
  .base-info {
    border-top: 1rpx solid #e1e1e1;
  }
  .num-info {
    border-top: 1rpx solid #e1e1e1;
    .detail-info {
      padding: 0 30rpx;
      .form-item {
        padding: 29rpx 0;
      }
    }
  }
  .btn-wrap {
    margin: 200rpx 0 60rpx;
    .back-btn {
      margin: 0 auto;
      width: 320rpx;
      height: 88rpx;
      border: 1rpx solid $themeColor;
      border-radius: 44rpx;
      text-align: center;
      line-height: 88rpx;
      font-size: 32rpx;
      color: $themeColor;
    }
  }
}
</style>


