<template>
  <div class="page-wrap">
    <div class="top">
      <img class="login-img" src="/static/images/login.png" alt="">
    </div>
    <button
      class="auth-phone-btn"
      open-type="getPhoneNumber"
      @getphonenumber="getPhoneNumber"
    >授权微信手机号</button>
    <button class="login-btn" @click="loginByOther">手机号登录/注册</button>
  </div>
</template>
<script>
import { envConfig } from '@/env/index'
export default {
  data() {
    return {
      code: '',
      token: '',
      refreshToken: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    let _self = this
    wx.login({
      success: function (res) {
        _self.code = res.code
      }
    })
  },
  methods: {
    getPhoneNumber(e) {
      let _self = this
      if (e.mp.detail && e.mp.detail.encryptedData && e.mp.detail.iv) {
        this.encryptedData = e.mp.detail.encryptedData
        this.iv = e.mp.detail.iv
        wx.checkSession({
          success: function () {
            _self.loginByWxMobilePhone()
          },
          fail: function () {
            wx.login({
              success: function (res) {
                _self.code = res.code
                wx.showModal({
                  title: '温馨提示',
                  content: '登录超时，请重新授权',
                  showCancel: false,
                  confirmColor: '#3D5A8B',
                  success(res) {
                    if (res.confirm) {
                    }
                  }
                })
              }
            })
          }
        })
      }
    },
    loginByWxMobilePhone() {
      this.httpFly.post({
        code: this.code,
        encryptedData: this.encryptedData,
        iv: this.iv,
        clientID: envConfig.CLIENTID,
        appId: envConfig.APPID
      }, '/identities/api/v1/oauth/loginByWxMobilePhone', res => {
        let token = 'Bearer ' + res.accessToken
        this.token = token
        this.refreshToken = res.refreshToken
        wx.getUserInfo({
          success: (res) => {
            // 绑定微信
            this.bindExternalLogin(this.code, res.encryptedData, res.iv)
          }
        })
      }, () => {
        this.utils.toast('该账号不存在')
      })
    },
    /**
     * 绑定微信
     */
    bindExternalLogin(code, encryptedData, iv) {
      wx.setStorageSync('token', this.token)
      wx.setStorageSync('refreshToken', this.refreshToken)
      this.httpFly.post({
        code,
        encryptedData,
        iv,
        state: '',
        appId: envConfig.APPID
      }, '/identities/api/v1/oauth/bindWxAppOpenId', res => {
        wx.navigateTo({
          url: '/pages/start/main'
        })
      }, (res) => {
        this.utils.toast('绑定微信失败')
        wx.removeStorageSync('token')
        wx.removeStorageSync('refreshToken')
      })
    },
    loginByOther() {
      wx.navigateTo({
        url: '/pages/login/main'
      })
    },
    toUrl(type) {
      wx.navigateTo({
        url: '/pages/pageview/main?type=' + type
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.page-wrap {
  padding: 0 100rpx;
  .top {
    padding-top: 42rpx;
    text-align: center;
    .login-img {
      width: 200rpx;
      height: 220rpx;
    }
  }
  .auth-phone-btn {
    margin-top: 208rpx;
    height: 100rpx;
    background: rgba(0, 195, 95, 1);
    border-radius: 50rpx;
    text-align: center;
    line-height: 100rpx;
    font-size: 32rpx;
    color: #fff;
  }
  .login-btn {
    margin-top: 40rpx;
    height: 100rpx;
    border: 1px solid #408BF1;
    border-radius: 50rpx;
    text-align: center;
    line-height: 100rpx;
    font-size: 32rpx;
    color: #408BF1;
  }
  .tip {
    margin-top: 76rpx;
    text-align: center;
    font-size: 26rpx;
    color: #333;
  }
  .protocol {
    margin-top: 26rpx;
    text-align: center;
    font-size: 26rpx;
    color: #3699ff;
  }
}
</style>
