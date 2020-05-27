<template>
  <div class="dialog-wrap" v-if="show">
    <div class="content">
      <div class="header">选择套餐卡及付款方式</div>
      <div class="main">
        <div class="table">
          <div class="tr">
            <div class="th">套餐卡名称</div>
            <div class="th">付款方式</div>
          </div>
          <div class="tr selected">
            <div class="td">基础健康管理卡</div>
            <div class="td select-wrap">
              <div class="pay">预付款</div>
              <img class="icon" src="/static/images/card_gou.png" alt="">
            </div>
          </div>
          <div class="tr">
            <div class="td">基础健康管理卡</div>
            <div class="td select-wrap">
              <div class="pay">预付款</div>
            </div>
          </div>
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
  },
  data() {
    return {
      list: []
    }
  },
  onLoad() {
  },
  methods: {
    cancel() {
      this.$emit('close')
    },
    confirm() {
      this.$emit('confirm')
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
      padding: 0 30rpx 64rpx;
      .table {
        .tr {
          display: flex;
          align-items: center;
          .th {
            flex: 1;
            background-color: #f5f5f5;
            line-height: 68rpx;
            text-align: center;
            font-size: 28rpx;
            color: #999;
          }
          .td {
            flex: 1;
            position: relative;
            padding: 24rpx 0;
            border-bottom: 1rpx solid #e1e1e1;
            text-align: center;
            font-size: 28rpx;
            color: #333;
            .icon {
              position: absolute;
              right: 30rpx;
              top: 50%;
              margin-top: -14rpx;
              width: 28rpx;
              height: 28rpx;
            }
          }
          &.selected .td {
            color: $themeColor;
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