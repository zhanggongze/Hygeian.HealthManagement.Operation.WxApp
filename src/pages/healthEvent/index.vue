<template>
  <div class="page-wrap">
    <div class="list">
      <div class="item" v-for="(data, index) in list" :key="index" @click="toDetail(data)">
        <div class="info">
          <div class="name">{{data.eventType.displayName}}</div>
          <div class="content">
            <div class="lavel">检查日期：{{data.occurrenceDateTime}}</div>
            <div class="lavel">检查机构：{{data.institution}}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="primary-btn add-btn" @click="createHealthEvent">创建新的归档事件</div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 健康档案ID
      healthRecordId: '',
      // 卫生事件列表
      list: []
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.healthRecordId = options.healthRecordId
    this.queryHealthEvents()
  },
  onShow() {
    let pages = getCurrentPages();
    // 上一个页面
    let curPage = pages[pages.length - 1]
    if(curPage.data.needRefresh) {
      delete curPage.data.needRefresh
      this.queryHealthEvents()
    }
  },
  methods: {
    /**
     * 获取卫生事件列表
     */
    queryHealthEvents() {
      this.list = []
      this.httpFly.post({
        healthRecordId: this.healthRecordId
      }, 'healthRecord/api/v1/partner/queryHealthEvents', res => {
        this.list = this.list.concat(res.items.map(obj => {
          obj.occurrenceDateTime = this.utils.formatTime(obj.occurrenceDateTime, 'yyyy-mm-dd')
          return obj
        }))
      })
    },
    createHealthEvent() {
      wx.navigateTo({
        url: '/pages/createArchived/main?healthRecordId=' + this.healthRecordId
      })
    },
    /**
     * 跳转到上传附件界面
     */
    toDetail(data) {
      wx.navigateTo({
        url: '/pages/inspectionItemDetail/main?id=' + data.id
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.page-wrap {
  box-sizing: border-box;
  padding-bottom: 130rpx;
  min-height: 100%;
  background-color: #f5f5f5;
  .list {
    padding: 30rpx 30rpx 0;
    .item {
      margin-bottom: 30rpx;
      padding: 0 30rpx;
      background-color: #fff;
      border-radius: 10rpx;
      font-size: 28rpx;
      color: #333;
      &:last-child {
        margin-bottom: 0;
      }
      .info {
        padding: 30rpx 0 10rpx;
        .name {
          font-size: 40rpx;
        }
        .content {
          padding: 20rpx 0 10rpx;
          color: #999;
          .label {
            line-height: 44rpx;
          }
        }
      }
    }
  }
  .add-btn {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    line-height: 100rpx;
    border-radius: 0;
  }
}
</style>