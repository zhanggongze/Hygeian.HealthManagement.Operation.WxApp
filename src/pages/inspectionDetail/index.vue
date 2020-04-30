<template>
  <div class="page-wrap">
    <div class="card-wrap">
      <div class="top">
        <div class="name">心脑血管一期检查</div>
        <div class="status">待预约</div>
        <div class="info">
          <div class="label">2020-05-30</div>
          <div class="label">南昌一脉影像中心</div>
        </div>
        <div class="package-info">
          <div class="item">
            <div class="label">套餐包</div>
            <div class="value">心血管风险评估包</div>
          </div>
          <div class="item">
            <div class="label">预约人</div>
            <div class="value">张三 男 56岁</div>
          </div>
        </div>
      </div>
      <div class="content">
        <div class="inspect-project">
          <div class="title">检查项目</div>
          <div class="list">
            <div class="item">
              <div class="name">脑血管MR成像</div>
              <div class="status-icon">
                <div class="status">未上传</div>
                <img class="icon" src="/static/images/icon_direct.png" alt="">
              </div>
            </div>
            <div class="item">
              <div class="name">血常规</div>
              <div class="status-icon">
                <div class="status selected">已上传</div>
                <img class="icon" src="/static/images/icon_direct.png" alt="">
              </div>
            </div>
            <div class="item">
              <div class="name">心电图</div>
              <div class="status-icon">
                <div class="status">未上传</div>
                <img class="icon" src="/static/images/icon_direct.png" alt="">
              </div>
            </div>
          </div>
        </div>
        <div class="primary-btn complete-btn">完成</div>
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
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.page-wrap {
  padding: 30rpx;
  min-height: 100%;
  background-color: #f5f5f5;
  box-sizing: border-box;
  .card-wrap {
    .top {
      position: relative;
      padding: 30rpx 30rpx 40rpx;
      font-size: 30rpx;
      color: #333;
      background-color: #fff;
      border-radius: 10rpx 10rpx 0 0;
      &::before {
        content: "";
        position: absolute;
        right: -15rpx;
        bottom: -15rpx;
        z-index: 1;
        width: 30rpx;
        height: 30rpx;
        background: #f5f5f5;
        border-radius: 50%;
      }
      &::after {
        content: "";
        position: absolute;
        left: -15rpx;
        bottom: -15rpx;
        z-index: 1;
        width: 30rpx;
        height: 30rpx;
        background: #f5f5f5;
        border-radius: 50%;
      }
      .name {
        padding-top: 4rpx;
        font-size: 40rpx;
      }
      .status {
        margin-top: 32rpx;
        text-align: center;
        font-size: 48rpx;
        color: #408BF1;
      }
      .info {
        margin-top: 14rpx;
        text-align: center;
        .label {
          color: #999;
        }
        .btn {
          margin: 70rpx auto 0;
          width: 400rpx;
          font-size: 36rpx;
          font-weight: 700;
        }
        .img-code {
          display: block;
          margin: 20rpx auto 0;
          width: 200px;
          height: 200px;
        }
      }
      .package-info {
        margin-top: 66rpx;
        .item {
          margin-top: 12rpx;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .label {
            color: #999;
          }
        }
      }
    }
    .content {
      position: relative;
      padding: 30rpx;
      background: #fff;
      border-radius: 0 0 10rpx 10rpx;
      &::after {
        content: "";
        position: absolute;
        left: 22rpx;
        right: 25rpx;
        top: -6rpx;
        height: 12rpx;
        background: radial-gradient(#f5f5f5 6rpx, transparent 6rpx);
        background-size: 24rpx 24rpx;
        background-repeat: repeat-x;
        background-position: 0;
      }
      .inspect-project {
        font-size: 32rpx;
        color: #333;
        .title {
          padding: 10rpx 0 20rpx;
          font-size: 36rpx;
        }
        .list {
          .item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 30rpx 0;
            .status-icon {
              display: flex;
              align-items: center;
              .status {
                margin-right: 20rpx;
                font-size: 28rpx;
                color: #408BF1;
                &.selected {
                  color: #00CE9E;
                }
              }
              .icon {
                display: block;
                width: 30rpx;
                height: 30rpx;
              }
            }
          }
        }
      }
      .complete-btn {
        margin: 50rpx auto 100rpx;
        width: 320rpx;
      }
    }
  }
}
</style>
