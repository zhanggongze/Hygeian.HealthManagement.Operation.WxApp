<template>
  <div class="page-wrap">
    <div class="page-title">登录</div>
    <div class="tip">欢迎回来!</div>
    <form class="login-form">
      <div class="input-filed">
        <input type="number" placeholder="手机号" v-model="phone" @input="inputChange()" />
      </div>
      <button
        open-type="getUserInfo"
        :disabled="loginBtnDisable"
        class="login-btn primary-btn"
        hover-class="primary-btn-hover"
        :class="{'disable': loginBtnDisable}"
        @getuserinfo="getUserInfo"
      >下一步</button>
    </form>
  </div>
</template>

<script>
import { envConfig } from '@/env/index'
export default {
  data() {
    return {
      // 登录按钮是否禁用
      loginBtnDisable: true,
      // 电话号码
      phone: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.locaCity()
  },
  methods: {
    locaCity() {
      wx.getSetting({
        success(res) {
          // 如果未拒绝定位权限或第一次定位, 判定值{ 第一次定位：undefined 授权：true 拒绝：false }
          if (res.authSetting['scope.userLocation'] !== false) {
            wx.getLocation({
              type: 'wgs84',
              success(res) {
                wx.setStorageSync('TBB_Longitude', res.longitude)
                wx.setStorageSync('TBB_Latitude', res.latitude)
              }
            })
          }
        }
      })
    },
    /**
     * 输入框回调
     */
    inputChange() {
      this.loginBtnDisable = !this.phone
    },
    /**
     * 获取用户信息
     */
    getUserInfo() {
      this.httpFly.post({
        clientId: envConfig.CLIENTID,
        mobilePhone: this.phone
      }, '/identities/api/v1/user/find', res => {
        if (res && res.isExisted) {
          wx.navigateTo({
            url: '/pages/welcome/main?phone=' + this.phone
          })
        } else {
          this.utils.toast('该账号不存在')
        }
      }, error => {
        this.utils.toast(error['title'])
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap {
  padding: 0 30rpx;
  .page-title {
    margin: 94rpx 0 34rpx;
    font-size: 60rpx;
    color: $themeColor;
  }
  .tip {
    font-size: 40rpx;
    color: $themeColor;
  }
  .login-form {
    display: block;
    padding: 76rpx 70rpx 0;
    .input-filed {
      display: flex;
      align-items: center;
      margin-bottom: 30rpx;
      border-bottom: 1px solid #e1e1e1;
      .tip {
        font-size: 24rpx;
        color: #8b8fab;
      }
      input {
        flex: 1;
        height: 90rpx;
        line-height: 90rpx;
        font-size: 32rpx;
      }
      .getcode-btn {
        font-size: 24rpx;
        line-height: 90rpx;
        color: $themeColor;
      }
    }
    .login-btn {
      margin-top: 130rpx;
    }
  }
}
</style>
