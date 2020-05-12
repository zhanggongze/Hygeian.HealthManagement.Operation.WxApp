<template>
  <section class="container">
    <!-- 创建 -->
    <form>
      <!-- UI -->
      <div class="nameRelation">
        <div class="name">
          <input type="text" placeholder="姓名" v-model="name" />
        </div>
      </div>
      <div class="nameRelation">
        <div class="name" style="flex:2;">
          <!-- <input type="text" placeholder="患者姓名" /> -->

          <picker mode="date" :value="dob" :end="endTime" @change="bindTimeChange">
            <p class="D1" v-if="!dob">出生日期</p>
            <p class="D2" v-if="dob">{{dob}}</p>
          </picker>
          <p class="triangleDiv"></p>
        </div>
        <div class="relation radiocontent" style=" text-align: right;">
          <p
            class="r1"
            :class="{active: item.key === gender}"
            v-for="(item, index) in genders"
            :key="index"
            @click="genderChange(item.key)"
          >
            {{item.key}}
            <span></span>
            <img src="/static/images/icon_select.png" alt />
          </p>
        </div>
      </div>

      <div class="nameRelation">
        <div class="name">
          <!-- <input type="text" @click="showMulLinkageTwoPicker" :value="pickerText" readonly placeholder="常驻地址" /> -->
          <p class="D1" @click="showMulLinkageTwoPicker" v-if="!isChangeAddress">常住地址</p>
          <p class="D2" @click="showMulLinkageTwoPicker" v-if="isChangeAddress">{{pickerText}}</p>
          <mpvue-picker
            ref="mpvuePicker"
            :mode="mode"
            :deepLength="deepLength"
            :pickerValueDefault="pickerValueDefault"
            :themeColor="themeColor"
            @onChange="onChange"
            @onConfirm="onConfirm"
            @onCancel="onCancel"
            :pickerValueArray="pickerValueArray"
          ></mpvue-picker>

          <p class="triangleDiv"></p>
        </div>
      </div>
      <!-- BTN -->
      <div class="createRecord">
        <button @click="goSuccess">查询</button>
      </div>
    </form>
    <div class="result" v-if="showResult">
      <div class="base-info">
        <div class="first-name">{{ firstName }}</div>
        <div class="info">
          <div class="name">{{ name }}</div>
          <div class="gender-age">
            <div class="gender">{{ gender }}</div>
            <div class="age">{{ age }}岁</div>
          </div>
        </div>
      </div>
      <div class="look-btn" @click="lookQrCode">查看二维码</div>
    </div>
    <div class="code-mask" v-if="showQrCode">
      <div class="qr-wrap">
        <img class="qr-img" :src="qrCodeUrl" alt="">
        <div class="back-btn" @click="showQrCode=false">返回</div>
      </div>
    </div>
    <!-- 成功 -->
  </section>
</template>

<script>
import mpvuePicker from 'mpvue-picker'
import areaDict from '@/assets/js/area'
import { envConfig } from "@/env/index"
export default {
  data() {
    return {
      // 患者姓名
      name: '',
      // 出生日期
      dob: '1980-01-01',
      // 性别
      gender: '男',
      // 常驻地址
      usualRegion: '',
      // 健康档案ID
      id: '',
      firstName: '',
      age: '',
      qrCodeUrl: '',

      mode: 'selector',
      deepLength: 0, // 几级联动
      pickerValueDefault: [], // 初始化值
      pickerValueArray: [], // picker 数组值
      pickerText: '',
      themeColor: '', // 颜色主题
      mulLinkageTwoPicker: [],
      // 性别字典列表
      genders: [],
      isChangeAddress: false,
      endTime: '',
      // 是否显示查看成功
      showResult: false,
      // 是否显示二维码
      showQrCode: false
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    wx.removeStorageSync('patientInfo')
    this.genders = [{
      key: '男',
      value: '男'
    }, {
      key: '女',
      value: '女'
    }]
    this.mulLinkageTwoPicker = this.utils.formateCity(areaDict.areas)
    this.endTime = this.utils.formatTime(new Date(), true)
  },
  components: { mpvuePicker },
  methods: {
    /**
     * 出生日期选择回调
     */
    bindTimeChange(e) {
      this.dob = e.mp.detail.value
    },
    /**
     * 性别选择回调
     */
    genderChange(data) {
      this.gender = data;
    },

    goSuccess() {
      if (!this.name) {
        this.utils.toast('请输入姓名')
        return;
      }
      if (!this.dob) {
        this.utils.toast('请选择出生日期')
        return;
      }
      if (!this.usualRegion) {
        this.utils.toast('请选择常住地址')
        return;
      }
      this.qrCodeUrl = ''
      this.httpFly.post({
        name: this.name,
        gender: this.gender,
        dob: new Date(this.dob.replace(/-/g, '/')).toISOString(),
        skipCount: 0,
        maxResultCount: 100
      }, 'healthrecord/api/v1/public/queryHealthRecords', res => {
        if (res && res.items && res.items.length) {
          this.showResult = true
          this.id = res.items[0]['id']
          this.firstName = this.name.substr(0, 1)
          this.age = this.utils.getAge(new Date(this.dob).toISOString())
        } else {
          this.showResult = false
          let _self = this
          wx.showModal({
            content: `未搜索到“${ this.name }”患者,是否为该患者创建健康档案?`,
            confirmText: '创建档案',
            confirmColor: '#408BF1',
            success (res) {
              if (res.confirm) {
                wx.setStorageSync('patientInfo', {
                  name: _self.name,
                  firstName: _self.name.substr(0, 1),
                  gender: _self.gender,
                  dob: _self.dob,
                  usualRegion: _self.usualRegion,
                  usualRegionText: _self.pickerText
                })
                wx.navigateTo({
                  url: '/pages/createResult/main'
                })
              }
            }
          })
        }
      })
    },
    lookQrCode() {
      this.qrCodeUrl = ''
      this.httpFly.post({
        name: this.name,
        gender: this.gender,
        dob: new Date(this.dob.replace(/-/g, '/')).toISOString(),
        usualRegionCode: this.usualRegion,
        usualRegionName: this.pickerText,
        id: this.id
      }, '/healthrecord/api/v1/partner/getHealthRecordBindingQRCode', res => {
        if (res && res.scene) {
          this.qrCodeUrl = envConfig.FILEBASEURL + `qrcode/wxmp/wx164b87580d38c859/${res.scene}.png`
          this.showQrCode = true
        } else {
          this.showQrCode = false
        }
      })
    },
    onChange(e) {
    },
    onCancel(e) {
    },

    // 二级联动选择
    showMulLinkageTwoPicker() {
      this.pickerValueArray = this.mulLinkageTwoPicker;
      this.mode = 'multiLinkageSelector';
      this.deepLength = 2;
      this.pickerValueDefault = [];
      this.themeColor = '';
      this.$refs.mpvuePicker.show();
    },

    showPickerView() {
      this.$refs.mpvuePicker.show();
    },
    onConfirm(e) {
      this.pickerText = e.label;
      this.isChangeAddress = true;
      this.usualRegion = e.value[1]
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 0 30rpx 30rpx 30rpx;
  .nameRelation {
    display: flex;
    border-bottom: 1px solid #e1e1e1;
    padding: 56rpx 0 26rpx 0;
    .name {
      flex: 1;
      position: relative;
      input {
        color: #666;
      }
      .D1 {
        color: #999999;
      }
      .D2 {
        color: #666;
      }
      .triangleDiv {
        border-color: #fff #666666 #666666 #fff;
        border-style: solid;
        border-width: 1px 1px 1px 1px;
        transform: rotate(45deg);
        height: 16rpx;
        width: 16rpx;
        position: absolute;
        right: 6rpx;
        top: 6rpx;
      }
    }
    .relation {
      flex: 1;
      width: 100%;
      // background-color: #57af1a;
      position: relative;
      .p1 {
        color: #666;
        text-align: left;
      }

      .p2 {
        color: #666;
        text-align: left;
      }
      .triangleDiv {
        border-color: #fff #666666 #666666 #fff;
        border-style: solid;
        border-width: 1rpx 1rpx 1rpx 1rpx;
        transform: rotate(45deg);
        height: 16rpx;
        width: 16rpx;
        position: absolute;
        right: 6rpx;
        top: 6rpx;
      }
    }
    .radiocontent {
      display: flex;
      justify-content: center;
      .r1 {
        width: 80rpx;
        height: 60rpx;
        text-align: center;
        line-height: 60rpx;
        background-color: #fff;
        border: 1px solid #cccccc;
        margin-left: 30rpx;
        border-radius: 10rpx;
        color: #999999;
        span {
          display: none;
        }
        img {
          display: none;
        }
      }
      .active {
        border-color: #408BF1;
        color: #408BF1;
        position: relative;
        span {
          width: 0rpx;
          height: 0rpx;
          border-color: transparent #408BF1 #408BF1 transparent;
          border-style: solid;
          border-width: 16rpx;
          // transform: rotate(45deg);
          display: block;
          position: absolute;
          bottom: 0;
          right: 0;
        }

        img {
          display: block;
          width: 18rpx;
          height: 13rpx;
          position: absolute;
          bottom: 2rpx;
          right: 0;
        }
      }
    }
  }
  // 创建
  .createRecord {
    padding-top: 100rpx;
    button {
      width: 688rpx;
      height: 100rpx;
      background:linear-gradient(-45deg,rgba(34,172,251,1),rgba(64,139,241,1));
      box-shadow:0px 5px 16px 0px rgba(34, 153, 84, 0.35);
      border-radius: 50rpx;

      line-height: 100rpx;
      font-size: 32rpx;
      color: rgba(255, 255, 255, 1);
    }
  }
  .result {
    display: flex;
    align-items: center;
    margin: 100rpx auto;
    padding: 0 20rpx;
    height: 180rpx;
    background: #ffffff;
    box-shadow: 0 0 18rpx 0 rgba(170, 170, 170, 0.3);
    border-radius: 10rpx;
    .base-info {
      display: flex;
      align-items: center;
      flex: 1;
      .first-name {
        width: 96rpx;
        height: 96rpx;
        line-height: 96rpx;
        background-color: #8b8fab;
        border-radius: 50%;
        text-align: center;
        font-size: 48rpx;
        color: #fff;
      }
      .info {
        margin-left: 32rpx;
        .name {
          font-size: 40rpx;
          color: #36507e;
        }
        .gender-age {
          display: flex;
          align-items: center;
          font-size: 28rpx;
          .gender {
            color: #8b8fab;
          }
          .age {
            margin-left: 40rpx;
            color: #8b8fab;
          }
        }
      }
    }
    .look-btn {
      width: 192rpx;
      height: 64rpx;
      border: 1rpx solid #508fff;
      border-radius: 32rpx;
      text-align: center;
      line-height: 64rpx;
      font-size: 28rpx;
      color: #508fff;
    }
  }
  .code-mask {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba($color: #000000, $alpha: 0.5);
    .qr-wrap {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #fff;
      .qr-img {
        display: block;
        margin: 52rpx auto;
        width: 440rpx;
        height: 440rpx;
      }
      .back-btn {
        border-top: 1rpx solid #e1e1e1;
        text-align: center;
        line-height: 100rpx;
        font-size: 32rpx;
        color: #408BF1;
      }
    }
  }
}
</style>
