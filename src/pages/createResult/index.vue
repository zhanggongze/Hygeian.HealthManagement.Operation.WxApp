<template>
  <div class="page-wrap">
    <div class="info">
      <div class="info-item">
        <div class="label">患者姓名</div>
        <div class="value">{{ name }}</div>
      </div>
      <div class="info-item">
        <div class="label">出生日期</div>
        <div class="value">{{ dob }}</div>
      </div>
      <div class="info-item">
        <div class="label">性别</div>
        <div class="value">{{ gender }}</div>
      </div>
      <div class="info-item">
        <div class="label">常住地</div>
        <div class="value">{{ usualRegionText }}</div>
      </div>
    </div>
    <div class="tip">扫一扫获取健康档案</div>
    <img v-if="qrCodeUrl" class="qr-code" :src="qrCodeUrl" alt="" />
  </div>
</template>
<script>
import { envConfig } from "@/env/index"
export default {
  data() {
    return {
      qrCodeUrl: '',
      name: '',
      dob: '',
      gender: '',
      usualRegion: '',
      usualRegionText: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    let patientInfo = wx.getStorageSync('patientInfo')
    if (patientInfo) {
      this.name = patientInfo.name
      this.dob = patientInfo.dob
      this.gender = patientInfo.gender
      this.usualRegion = patientInfo.usualRegion
      this.usualRegionText = patientInfo.usualRegionText
      this.getQrCode()
    }
  },
  methods: {
    getQrCode() {
      this.httpFly.post({
        name: this.name,
        gender: this.gender,
        dob: new Date(this.dob.replace(/-/g, '/')).toISOString(),
        usualRegionCode: this.usualRegion,
        usualRegionName: this.usualRegionText,
        id: ''
      }, '/healthrecord/api/v1/public/getHealthRecordBindingQRCode', res => {
        if (res && res.scene) {
          this.qrCodeUrl = envConfig.FILEBASEURL + `qrcode/wxmp/wx164b87580d38c859/${res.scene}.png`
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.page-wrap {
  padding: 30rpx;
  .info {
    padding: 12rpx 24rpx;
    background: #fff;
    box-shadow: 0 0 20rpx 0 rgba(170, 170, 170, 0.3);
    border-radius: 10rpx;
    font-size: 32rpx;
    .info-item {
      display: flex;
      justify-content: space-between;
      line-height: 72rpx;
      .label {
        color: #8b8fab;
      }
      .value {
        color: #36507e;
      }
    }
  }
  .tip {
    margin: 120rpx 0 32rpx;
    text-align: center;
    font-size: 38rpx;
    color: #36507e;
  }
  .qr-code {
    display: block;
    margin: 0 auto;
    width: 440rpx;
    height: 440rpx;
  }
}
</style>