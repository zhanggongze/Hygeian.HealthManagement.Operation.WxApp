<template>
  <div class="page-wrap">
    <!-- <div class="top">
      <img class="logo" src="/static/images/login_small.png" alt="">
      <div>汉吉Dr申请使用</div>
    </div>
    <div class="middle">您的账号信息（昵称、头像、地区及性别）</div>
    <button class="auth-btn" open-type="getUserInfo" @getuserinfo="getUserInfo">微信授权</button> -->
    <img class="logo-img" src="/static/images/login.png" alt="">
    <swiper class="swiper" indicator-dots autoplay circular indicator-color="rgba(255, 255, 255, 0.3)" indicator-active-color="rgba(255, 255, 255, 1)">
      <swiper-item v-for="(item, index) in launchList" :key="index">
        <img class="img" mode="aspectFill" :src="item" />
      </swiper-item>
    </swiper>
    <button class="login-btn" open-type="getUserInfo" @getuserinfo="getUserInfo">登录</button>
    <div class="tip">本应用仅限汉吉注册用户登录，未注册用户请拨打4009969692咨询客服登记注册</div>
  </div>
</template>
<script>
import { envConfig } from '@/env/index'
export default {
  data() {
    return {
      launchList: [envConfig.FILEBASEURL + '/image/launch7.png', envConfig.FILEBASEURL + '/image/launch8.png', envConfig.FILEBASEURL + '/image/launch9.png']
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
  },
  methods: {
    getUserInfo(e) {
      wx.navigateTo({ url: '/pages/wxAuthPhone/main' })
    }
  }
}
</script>
<style lang="scss" scoped>
.page-wrap {
  .top {
    display: flex;
    align-items: center;
    padding: 30rpx 100rpx 0;
    font-size: 32rpx;
    color: #333;
    .logo {
      margin-right: 22rpx;
      width: 60rpx;
      height: 50rpx;
    }
  }
  .swiper {
    margin-top: 40rpx;
    width: 100%;
    height: 400rpx;
    .img {
      width: 100%;
      height: 400rpx;
    }
  }
  .middle {
    margin-top: 70rpx;
    font-size: 36rpx;
    color: #333;
  }
  .auth-btn {
    margin-top: 420rpx;
    height: 100rpx;
    background: rgba(0, 195, 95, 1);
    border-radius: 50rpx;
    text-align: center;
    line-height: 100rpx;
    font-size: 36rpx;
    color: #fff;
  }
  .logo-img {
    display: block;
    padding-top: 40rpx;
    margin: 0 auto;
    width: 200rpx;
    height: 220rpx;
  }
  .login-btn {
    margin: 100rpx 100rpx 0;
    height: 100rpx;
    background:linear-gradient(-45deg,rgba(34,172,251,1),rgba(64,139,241,1));
    border-radius: 50rpx;
    text-align: center;
    line-height: 100rpx;
    font-size: 32rpx;
    color: #fff;
  }
  .tip {
    margin-top: 76rpx;
    padding: 0 100rpx;
    text-align: center;
    font-size: 24rpx;
    color: #999;
  }
}
</style>

