<template>
  <div class="page-wrap">
    <div class="search-wrap">
      <img class="icon-search" src="/static/images/icon_search.png" alt />
      <input class="input" placeholder="搜索" v-model="searchValue" @input="searchDisease" />
    </div>
    <div class="disease-wrap">
      <div class="result" v-if="searchValue">
        <div class="empty-data" v-if="isEmpty">
          <img class="img" src="/static/images/empty_search.png" alt />
          <div class="p">无搜索结果</div>
        </div>
        <div class="list" v-else>
          <div
            class="item"
            v-for="(item, index) in list"
            :key="index"
            @click="selectDisease(item)"
          >{{item.value}}</div>
        </div>
      </div>
      <div class="history" v-else>
        <div class="label">常用诊断</div>

        <div class="history-list">
          <div
            class="item"
            v-for="(item, index) in historyList"
            :key="index"
            @click="selectDisease(item)"
          >{{item.value}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      searchValue: '',
      historyList: [],
      pageIndex: 1,
      totalCount: 0,
      isEmpty: true
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.historyList = wx.getStorageSync('historyList') ? wx.getStorageSync('historyList') : []
    this.list = this.doctorUses
  },
  methods: {
    /**
     * 查询
     */
    searchList() {
      this.httpFly.post({
        value: this.searchValue,
        skipCount: (this.pageIndex - 1) * 10,
        maxResultCount: 10
      }, 'healthrecord/api/v1/doctor/queryDiagnosises', res => {
        this.list = this.list.concat(res.items.map(obj => {
          return {
            key: obj.value,
            value: obj.value
          }
        }))
        this.totalCount = res.totalCount
        this.isEmpty = this.list.length === 0
      })
    },
    /**
     * 搜索输入回调
     */
    searchDisease(e) {
      let value = e.target.value
      if (value) {
        this.list = []
        this.searchList()
      }
    },
    /**
     * 选中疾病回调
     */
    selectDisease(data) {
      let disease = data.value
      if (!this.historyList.find(obj => obj.value === disease)) {
        this.historyList.push(data)
        wx.setStorageSync('historyList', this.historyList)
      }
      let pages = getCurrentPages()
      // 上一个页面
      let prevPage = pages[pages.length - 2]
      // 往上一个页面传递数据，用于刷新上一个页面数据
      prevPage.setData({
        newDisease: data
      })
      // 返回上一级关闭当前页面
      wx.navigateBack({
        delta: 1
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap {
  padding: 10rpx 0 0 0;
  .search-wrap {
    display: flex;
    align-items: center;
    margin: 0 30rpx;
    padding: 0 30rpx;
    height: 68rpx;
    background-color: #ebebf6;
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
  .disease-wrap {
    margin-top: 30rpx;
    .nav {
      display: flex;
      border-bottom: 1rpx solid #e1e1e1;
      .nav-item {
        position: relative;
        flex: 1;
        padding: 8rpx 0;
        text-align: center;
        font-size: 32rpx;
        color: #8b8fab;
        &.selected {
          color: #508fff;
        }
        &.selected::after {
          content: "";
          position: absolute;
          top: 57rpx;
          bottom: -1rpx;
          left: 92rpx;
          width: 200rpx;
          background-color: #508fff;
        }
      }
    }
    .result {
      .item {
        &:first-child {
          border-top: 1rpx solid #e1e1e1;
        }
        display: flex;
        align-items: center;
        padding: 0 30rpx;
        height: 100rpx;
        border-bottom: 1rpx solid #e1e1e1;
        font-size: 32rpx;
        color: #36507e;
      }
    }
    .history {
      padding: 6rpx 30rpx 0;
      color: #8b8fab;
      .label {
        font-size: 32rpx;
      }
      .history-list {
        display: flex;
        flex-wrap: wrap;
        margin-top: 20rpx;
        margin-right: -30rpx;
        .item {
          margin-right: 30rpx;
          margin-bottom: 20rpx;
          padding: 12rpx 24rpx;
          border: 1rpx solid #8b8fab;
          border-radius: 30rpx;
          font-size: 24rpx;
        }
      }
    }
  }
}
</style>