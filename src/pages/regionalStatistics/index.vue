<template>
  <div class="page-wrap">
    <div class="list">
      <div class="item" @click="toDetail('line', 'ask')">
        <div>按医生统计图文咨询人数</div>
        <img class="icon" src="/static/images/icon_direct.png" alt="">
      </div>
      <div class="item" @click="toDetail('line', 'im')">
        <div>按医生统计健康顾问活跃人数</div>
        <img class="icon" src="/static/images/icon_direct.png" alt="">
      </div>
      <div class="item" @click="toDetail('bar', 'ask')">
        <div>日图文咨询人数分析</div>
        <img class="icon" src="/static/images/icon_direct.png" alt="">
      </div>
      <div class="item" @click="toDetail('bar', 'im')">
        <div>日健康顾问活跃人数分析</div>
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
    toDetail(chatType, serviceType) {
      let url = ''
      if (chatType === 'line') {
        url = `/pages/lineStatisticsDetail/main?serviceType=${serviceType}`
      } else if (chatType === 'bar') {
        url = `/pages/barStatisticsDetail/main?serviceType=${serviceType}`
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