<template>
  <div class="dialog-wrap" v-if="show">
    <div class="content">
      <div class="header">添加发卡卡号范围</div>
      <div class="main">
        <div class="form">
          <input class="input" type="number" v-model="start" placeholder="起始卡号">
          <span class="split">-</span>
          <input class="input" type="number" v-model="end" placeholder="终止卡号">
        </div>
      </div>
      <div class="footer">
        <div class="btn cancel-btn" @click="cancel">取消</div>
        <div class="btn confirm-btn" @click="confirm">确定</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean
    }
  },
  watch: {
    show(value) {
      if(value) {
        this.start = ''
        this.end = ''
      }
    }
  },
  data() {
    return {
      start: '',
      end: ''
    }
  },
  onLoad() {
  },
  methods: {
    cancel() {
      this.$emit('close')
    },
    confirm() {
      if(!this.start) {
        this.utils.toast('请填写起始卡号')
        return
      }
      if(!this.end) {
        this.utils.toast('请填写终止卡号')
        return
      }
      if(parseInt(this.start) >= parseInt(this.end)) {
        this.utils.toast('终止卡号必须大于起始卡号')
        return
      }
      this.$emit('confirm', {
        start: parseInt(this.start),
        end: parseInt(this.end)
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
      padding: 50rpx 30rpx 100rpx;
      .form {
        display: flex;
        align-items: center;
        .split {
          margin: 0 28rpx;
        }
        .input {
          flex: 1;
          height: 70rpx;
          background-color: #f5f5f5;
          border-radius: 35rpx;
          text-align: center;
          line-height: 70rpx;
          font-size: 28rpx;
          color: #333;
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