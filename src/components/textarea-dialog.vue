<template>
  <div class="dialog-wrap" v-if="show">
    <div class="content">
      <div class="header">{{label}}</div>
      <div class="main">
        <div class="form">
          <div class="form-item">
            <textarea class="textarea" v-model="value" :placeholder="placeholder"></textarea>
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
    label: {
      type: String
    },
    placeholder: {
      type: String
    },
    value: {
      type: String
    },
    show: {
      type: Boolean
    }
  },
  data() {
    return {
    }
  },
  onLoad() {
  },
  methods: {
    cancel() {
      this.$emit('close')
    },
    confirm() {
      this.$emit('input', this.value)
      this.$emit('confirm', this.value)
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
      padding: 0 30rpx 38rpx;
      .form {
        .textarea {
          height: 280rpx;
          background-color: #f5f5f5;
          font-size: 32rpx;
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