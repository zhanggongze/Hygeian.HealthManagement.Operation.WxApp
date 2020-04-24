<template>
  <div class="wrap" v-show="visible">
    <div class="mask"></div>
    <div class="verification-code-wrap">
      <div class="verification-code-box">
        <img src="/static/images/icon_close.png" class="close-btn" alt @click="close" />
        <div class="title">图形验证码</div>
        <form class="verification-code-form">
          <div class="input-field">
            <input type="text" v-model="code" placeholder="请输入验证码" />
            <img class="img" :src="imgcode" alt="图形验证码" @click="refreshCode" />
          </div>
          <button
            class="primary-btn submit-btn"
            hover-class="primary-btn-hover"
            @click="submitForm"
          >提交</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: true
    },
    phone: {
      default: ''
    }
  },
  data() {
    return {
      visible: this.value,
      // 验证码
      code: '',
      imgcode: '/static/images/icon_imagecode.png',
      // sessionId
      SessionID: ''
    }
  },
  watch: {
    value(val) {
      if (val) {
        this.code = ''
        this.refreshCode()
      }
      this.visible = val
    }
  },
  methods: {
    close() {
      this.visible = false
      this.$emit('input', false)
      this.$emit('close')
    },
    submitForm() {
      if (!this.code) {
        this.utils.toast('请输入图形验证码')
        return
      }
      // 发送短信，校验验证码
      this.httpFly.post(
        {
          captcha: this.code,
          mobilePhone: this.phone,
          sessionId: this.SessionID
        },
        '/identities/api/v1/user/sendSmsCode',
        res => {
          this.visible = false
          this.$emit('input', false)
          this.$emit('success')
        },
        error => {
          this.utils.toast(error.response.data.title)
          setTimeout(() => {
            this.code = ''
            this.refreshCode()
          }, 1000)
        }
      )
    },
    refreshCode() {
      this.httpFly.get('identities/api/v1/user/getCaptcha', res => {
        this.SessionID = res['sessionId']
        this.imgcode = 'data:image/png;base64,' + res['base64Code']
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.mask {
  z-index: 200;
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0.5;
  background: #000;
}
.verification-code-wrap {
  z-index: 200;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  .verification-code-box {
    position: relative;
    display: inline-block;
    width: 73%;
    padding-bottom: 60rpx;
    vertical-align: middle;
    background-color: #fff;
    border-radius: 20rpx;
    text-align: left;
    .close-btn {
      position: absolute;
      top: -100rpx;
      right: 0;
      width: 60rpx;
      height: 100rpx;
    }
    .title {
      padding: 56rpx 0 80rpx;
      text-align: center;
      font-size: 40rpx;
      color: $themeColor;
    }
    .verification-code-form {
      display: block;
      padding: 0 60rpx;
      .input-field {
        padding: 20rpx 0;
        display: flex;
        align-items: center;
        border-bottom: 1rpx solid #e1e1e1;
        input {
          flex: 1;
          height: 60rpx;
          line-height: 60rpx;
          font-size: 30rpx;
        }
        .img {
          width: 160rpx;
          height: 60rpx;
        }
      }
      .submit-btn {
        margin-top: 100rpx;
        border-radius: 40rpx;
        line-height: 80rpx;
      }
    }
  }
}
.verification-code-wrap::after {
  content: "";
  display: inline-block;
  height: 90%;
  width: 0;
  vertical-align: middle;
}
</style>
