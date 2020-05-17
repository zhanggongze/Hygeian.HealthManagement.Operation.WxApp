<template>
  <div class="page-wrap">
    <div class="list">
      <div class="item" @click="toDetail('ask')">
        <div>图文咨询响应查询</div>
        <img class="icon" src="/static/images/icon_direct.png" alt="">
      </div>
      <div class="item" @click="toDetail('im')">
        <div>健康顾问响应查询</div>
        <img class="icon" src="/static/images/icon_direct.png" alt="">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {

    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
  },
  methods: {
    /**
     * 跳转统计详情
     * @param chatType 统计类型
     * @param serviceType 服务类型
     */
    toDetail(serviceType) {
      let url = ''
      if (serviceType === 'ask') {
        url = `/pages/askResponse/main`
      } else if (serviceType === 'im') {
        url = `/pages/imResponse/main`
      }
      if (url) {
        wx.navigateTo({
          url: url
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap {
  min-height: 100%;
  background-color: #f5f5f5;
  .list {
    padding: 30rpx;
    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 30rpx;
      padding: 0 24rpx 0 30rpx;
      height: 160rpx;
      background: rgba(255, 255, 255, 1);
      box-shadow: 4rpx 4rpx 20rpx 0 rgba(174, 178, 182, 0.2);
      border-radius: 10rpx;
      font-size: 36rpx;
      color: #333;
      &:last-child {
        margin-bottom: 0;
      }
      .icon {
        display: block;
        width: 30rpx;
        height: 30rpx;
      }
    }
  }
}
</style>