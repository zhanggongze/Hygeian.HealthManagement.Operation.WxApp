<template>
  <div class="page-wrap">
    <div class="search-box-wrap">
      <div class="search-wrap">
        <img class="icon-search" src="/static/images/icon_search.png" alt />
        <input class="input" placeholder="请输入套餐名称" confirm-type="search" v-model="name" @confirm="search" />
      </div>
    </div>
    <div class="empty-data" v-if="list.length === 0">
      <img class="img" src="/static/images/empty_message.png" alt="">
      <div class="p">暂无记录</div>
    </div>
    <scroll-view v-else class="list" scroll-y="true" @scrolltolower="scrolltolower">
      <div class="list-view">
        <div class="card" v-for="(data, index) in list" :key="index" @click="toServicePackage(data)">
          <div class="name">
            <img class="img" src="/static/images/work_gift_x.png" alt="" />
            <div>{{data.name}}</div>
          </div>
          <img class="direct-icon" src="/static/images/icon_direct.png" alt="">
        </div>
      </div>
    </scroll-view>
  </div>
</template>
<script>
export default {
  data() {
    return {
      healthRecordId: '',
      list: [],
      pageIndex: 1,
      totalCount: 0
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.healthRecordId = options.healthRecordId
    this.getList()
  },
  methods: {
    getList() {
      this.httpFly.post({
        skipCount: (this.pageIndex - 1) * 20,
        maxResultCount: 10,
        partnerId: wx.getStorageSync("activeInfo")['partnerId'],
        name: this.name,
        statuses: [10],
        minSellingFee: 0,
        maxSellingFee: 0
      }, 'servicepackage/api/v1/partner/ServicePackages/QueryServicePackages', res => {
        this.list = this.list.concat(res.items)
        this.totalCount = res.totalCount
      })
    },
    toServicePackage(data) {
      wx.navigateTo({
        url: `/pages/packageIntroduction/main?id=${data.id}&healthRecordId=${this.healthRecordId}`
      })
    },
    search() {
      this.pageIndex = 0
      this.list = []
      this.getList()
    }
  }
}
</script>
<style lang="scss" scoped>
.page-wrap {
  height: 100%;
  background-color: #f5f5f5;
  .empty-data {
    padding-top: 200rpx;
  }
  .search-box-wrap {
    padding: 10rpx 0;
    background-color: #fff;
    .search-wrap {
      display: flex;
      align-items: center;
      margin: 0 30rpx;
      padding: 0 30rpx;
      height: 68rpx;
      background-color: #f5f5f5;
      border-radius: 34rpx;
      .icon-search {
        margin-right: 12rpx;
        width: 28rpx;
        height: 28rpx;
      }
      .input {
        flex: 1;
        font-size: 26rpx;
      }
    }
  }
  .list {
    box-sizing: border-box;
    .list-view {
      padding-top: 30rpx;
      height: calc(100vh - 118rpx);
      .card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0 30rpx 30rpx 30rpx;
        padding: 36rpx 30rpx;
        background-color: #fff;
        border-radius: 10rpx;
        color: #333;
        font-size: 36rpx;
        .name {
          display: flex;
          align-items: center;
          .img {
            display: block;
            margin-right: 22rpx;
            width: 36rpx;
            height: 36rpx;
          }
        }
        .direct-icon {
          display: block;
          width: 30rpx;
          height: 30rpx;
        }
      }
    }
  }
}
</style>