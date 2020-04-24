<template>
  <div class="page-wrap">
    <div class="title">欢迎回来</div>
    <div class="tip">请输入验证码</div>
    <form class="login-form">
      <div class="left-seconds" v-if="sendSuccess && totalSeconds !== 60">倒计时{{totalSeconds}}秒</div>
      <div class="get-code-tip" v-else @click="getVerificationCode">获取验证码</div>
      <div class="verification-input-box">
        <securityCode v-model="code" @input="handleInput"></securityCode>
      </div>
      <button
        class="primary-btn login-btn"
        hover-class="primary-btn-hover"
        open-type="getUserInfo"
        :disabled="loginBtnDisable"
        :class="{'disable': loginBtnDisable}"
        @getuserinfo="getUserInfo"
      >登录</button>
    </form>
    <verification-code :phone="phone" v-model="visible" @success="sendSuccessCallback"></verification-code>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import verificationCode from '@/components/verification-code'
import securityCode from '@/components/security-code'
import { envConfig } from '@/env/index'
export default {
  components: {
    verificationCode,
    securityCode
  },
  data() {
    return {
      maxLength: 4,
      // 验证码
      code: '',
      // 电话号码
      phone: '',
      // 验证码弹框是否显示
      visible: false,
      // 验证码是否发送成功
      sendSuccess: false,
      // 倒计时60秒
      totalSeconds: 60,
      // 定时器
      timer: null,
      // 登录按钮是否禁用
      loginBtnDisable: true,
      token: '',
      refreshToken: ''
    }
  },
  computed: {
    ...mapState({
      isSdkReady: state => {
        return state.global.isSdkReady
      }
    })
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.phone = options.phone
  },
  methods: {
    /**
     * 获取验证码
     */
    getVerificationCode() {
      this.sendSuccess = false
      this.visible = true
    },
    /**
     * 短信验证码发送成功回调
     */
    sendSuccessCallback() {
      let total = 60
      this.sendSuccess = true
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.totalSeconds = total
      this.timer = setInterval(() => {
        this.totalSeconds--
        if (this.totalSeconds === 0) {
          this.totalSeconds = total
          clearInterval(this.timer)
        }
      }, 1000)
    },
    /**
     * 验证码输入回调
     */
    handleInput() {
      this.loginBtnDisable = !(this.code && this.code.length === 4)
    },
    /**
     * 获取用户信息回调
     */
    getUserInfo(e) {
      console.log(e)
      this.httpFly.post({
        clientId: envConfig.CLIENTID,
        mobilePhone: this.phone,
        phoneCode: this.code
      }, '/identities/api/v1/user/loginByPhoneCode', res => {
        let token = 'Bearer ' + res.accessToken
        this.token = token
        this.refreshToken = res['refreshToken']
        wx.setStorageSync('phone', this.phone)
        wx.login({
          success: (respose) => {
            wx.getUserInfo({
              success: (res) => {
                // 绑定微信
                this.bindExternalLogin(respose.code, res.encryptedData, res.iv)
              }
            })
          }
        })
      }, error => {
        this.utils.toast(error['title'])
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
        setTimeout(() => {
          wx.reLaunch({
            url: '../login/main'
          })
        }, 1500)
        // im.loginIM(this)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  margin-top: 56rpx;
  margin-left: 32rpx;
  font-size: 48rpx;
  font-weight: bold;
}
.tip {
  margin-top: 24rpx;
  margin-left: 32rpx;
  font-size: 28rpx;
}
.login-form {
  display: block;
  padding: 140rpx 60rpx 0;
  .get-code-tip {
    text-align: right;
    font-size: 28rpx;
    color: $themeColor;
  }
  .left-seconds {
    font-size: 24rpx;
    color: #8b8fab;
  }
  .verification-input-box {
    margin-top: 36rpx;
  }
  .login-btn {
    margin-top: 208rpx;
  }
}
</style>
