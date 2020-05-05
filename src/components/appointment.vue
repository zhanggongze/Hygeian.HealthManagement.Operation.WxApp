<template>
  <div class="dialog-wrap" v-if="show">
    <div class="content">
      <div class="header">预约</div>
      <div class="main">
        <div class="form">
          <picker mode="date" :value="date" @change="bindDateChange">
            <div class="form-item">
              <div class="left">
                <div class="label">预约日期</div>
                <div class="placeholder" v-if="!date">请选择</div>
                <div class="value">{{date}}</div>
              </div>
              <div class="icon"></div>
            </div>
          </picker>
          <picker mode="time" :value="time" @change="bindTimeChange" end="21:59">
            <div class="form-item">
              <div class="left">
                <div class="label">预约时间</div>
                <div class="placeholder" v-if="!time">请选择</div>
                <div class="value">{{time}}</div>
              </div>
              <div class="icon"></div>
            </div>
          </picker>
          <picker @change="bindPickerChange" :range="list" range-key="key">
            <div class="form-item">
              <div class="left">
                <div class="label">检查机构</div>
                <div class="placeholder" v-if="!institutation">请选择</div>
                <div class="value">{{institutationTxt}}</div>
              </div>
              <div class="icon"></div>
            </div>
          </picker>
          <div class="form-item">
            <div class="left">
              <div class="label">电话号码</div>
              <input class="input" placeholder="请输入电话号码" v-model="phoneNumber" type="text" />
            </div>
          </div>
        </div>
      </div>
      <div class="footer">
        <div class="btn cancel-btn" @click="cancel">取消</div>
        <div class="btn confirm-btn" @click="confirm">提交</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    date: {
      type: String
    },
    time: {
      type: String
    },
    institutation: {
      type: String
    },
    contractID: {
      type: String
    },
    phoneNumber: [String, Number],
    show: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    institutationTxt() {
      let institutation = this.institutation
      return (institutation && this.list.length) ? this.list.find(obj => obj.value === this.institutation).key : ''
    }
  },
  data() {
    return {
      list: []
    }
  },
  onLoad() {
    this.getList()
  },
  methods: {
    getList() {
      this.httpFly.post({
        contractID: this.contractID,
        LocationCode: wx.getStorageSync('activeInfo')['region']
      }, 'servicepackage/api/v1/partner/PhysicalExamination/ExaminationServiceContract/QueryReservationLocations', res => {
        this.list = []
        this.list = this.list.concat(res.items.map(obj => {
          return {
            key: obj.name,
            value: obj.id
          }
        }))
      })
    },
    bindDateChange(e) {
      this.date = e.mp.detail.value
    },
    bindTimeChange(e) {
      this.time = e.mp.detail.value
    },
    bindPickerChange(e) {
      let index = parseInt(e.mp.detail.value)
      this.institutation = this.list[index]['value']
    },
    cancel() {
      this.$emit('close')
    },
    confirm() {
      if(!this.date) {
        this.utils.toast('请选择预约日期')
        return
      }
      if(!this.time) {
        this.utils.toast('请选择预约时间')
        return
      }
      if(!this.institutation) {
        this.utils.toast('请选择预约机构')
        return
      }
      if(!this.phoneNumber) {
        this.utils.toast('请输入电活号码')
        return
      }
      this.$emit('confirm', {
        date: this.date,
        time: this.time,
        institutation: this.institutation,
        phoneNumber: this.phoneNumber
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-wrap {
  z-index: 4;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba($color: #000000, $alpha: 0.3);
  .content {
    margin: 22% 60rpx 0;
    background-color: #fff;
    border-radius: 20rpx;
    color: #333;
    .header {
      padding: 40rpx 0;
      text-align: center;
      font-size: 40rpx;
    }
    .main {
      padding: 20rpx 30rpx 100rpx;
      .form {
        .form-item {
          display: flex;
          align-items: center;
          height: 80rpx;
          border-bottom: 1rpx solid #e1e1e1;
          margin-bottom: 30rpx;
          line-height: 80rpx;
          &:last-child {
            margin-bottom: 0;
          }
          .left {
            flex: 1;
            display: flex;
            align-items: center;
            font-size: 32rpx;
            color: #333;
            .label {
              margin-right: 20rpx;
            }
            .placeholder {
              color: #999;
            }
            
          }
          .icon {
            margin-right: 6rpx;
            border-color: #fff #666666 #666666 #fff;
            border-style: solid;
            border-width: 2rpx 2rpx 2rpx 2rpx;
            transform: rotate(45deg);
            height: 16rpx;
            width: 16rpx;
          }
        }
      }
    }
    .footer {
      display: flex;
      border-top: 1rpx solid #e1e1e1;
      .btn {
        flex: 1;
        line-height: 100rpx;
        text-align: center;
        font-size: 32rpx;
        color: #999;
        &.confirm-btn {
          border-left: 1rpx solid #e1e1e1;
          color: #408BF1;
        }
      }
    }
  }
}
</style>