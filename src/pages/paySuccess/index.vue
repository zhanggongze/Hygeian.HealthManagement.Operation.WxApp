<template>
  <div class="page-wrap">
    <div class="success">
      <img src="/static/images/icon_Success.png" alt />
      <div class="tip">购买成功！</div>
    </div>
    <div class="primary-btn confirm-btn" @click="toChat">确定</div>
  </div>
</template>
 
<script>
export default {
  data() {
    return {
      // 支付成功回调地址
      redirectUrl: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.redirectUrl = options.redirectUrl
  },
  methods: {
    /**
     * 去聊天
     */
    toChat() {
      let url = decodeURIComponent(this.redirectUrl)
      //  wx.redirectTo({
      //   url: url
      // })
      wx.reLaunch({
        url: '/pages/start/main'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap {
  padding: 0 30rpx;
  .success {
    padding: 74rpx 0 136rpx;
    text-align: center;
    img {
      width: 180rpx;
      height: 180rpx;
    }
    .tip {
      margin-top: 40rpx;
      font-size: 40rpx;
      color: #333;
    }
  }
  .introduction {
    padding: 24rpx 30rpx 30rpx;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 5rpx 20rpx 0 rgba(0, 0, 0, 0.15);
    border-radius: 10rpx;
    .base-info {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #999;
      .img-wrap {
        position: relative;
        .img {
          width: 140rpx;
          height: 140rpx;
          border-radius: 50%;
        }
      }
      .info {
        flex: 1;
        margin-left: 20rpx;
        .name-level {
          display: flex;
          align-items: center;
          margin-top: 6rpx;
          .name {
            margin-right: 28rpx;
            font-size: 36rpx;
            color: #333;
          }
        }
        .hostipal {
          margin-top: 22rpx;
          display: flex;
          align-items: center;
          .name {
            margin-right: 40rpx;
          }
        }
      }
    }
    .to-chat {
      margin: 40rpx auto 0;
      width: 300rpx;
      height: 68rpx;
      background: linear-gradient(
        -45deg,
        rgba(82, 204, 234, 1),
        rgba(69, 187, 192, 1)
      );
      box-shadow: 0 5rpx 16rpx 0 rgba(26, 161, 156, 0.35);
      border-radius: 34rpx;
      line-height: 68rpx;
      text-align: center;
      font-size: 24rpx;
      color: #fff;
    }
  }
  .confirm-btn {
    margin: 100rpx 30rpx 0;
  }
}
</style>