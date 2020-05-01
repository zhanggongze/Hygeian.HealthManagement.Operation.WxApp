<template>
  <div class="page-wrap">
    <div class="search-box-wrap">
      <div class="search-wrap">
        <img class="icon-search" src="/static/images/icon_search.png" alt />
        <input
          class="input"
          placeholder="请输入事件名称"
          confirm-type="search"
          v-model="keyword"
          @confirm="search"
        />
      </div>
    </div>
    <div class="empty-data" v-if="isEmpty">
      <img class="img" src="/static/images/empty_message.png" alt />
      <div class="p">暂无记录</div>
    </div>
    <scroll-view v-else class="record-list" scroll-y="true" @scrolltolower="scrolltolower">
      <div class="list-view">
        <div class="record-card" v-for="(item, index) in list" :key="index" @click="toDetail(item)">
          <div class="message" v-if="item.isNew"></div>
          <div class="card-wrap">
            <p>{{item.meaning}}</p>
          </div>
          <img class="icon" src="/static/images/icon_direct.png" alt />
        </div>
      </div>
    </scroll-view>
  </div>
</template>
<script>
import areaDict from "@/assets/js/area";
export default {
  data() {
    return {
      pageIndex: 1,
      list: [],
      isEmpty: true,
      totalCount: 0,
      // 当前选择的健康档案ID
      healthRecordId: "",
      keyword: "",
      areas: [],
      // 使用类型
      useType: ""
    };
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data());
    this.areas = this.utils.formateCity(areaDict.areas);
    this.useType = options.useType;
    this.init();
  },
  methods: {
    init() {
      this.getList();
    },
    /**
     * 查询健康档案列表
     */
    getList() {
      // if (!this.keyword) {
      //   this.isEmpty = true
      //   this.list = []
      //   this.totalCount = 0
      //   return
      // }
      this.httpFly.post(
        {
          skipCount: (this.pageIndex - 1) * 20,
          maxResultCount: 20,
          valueDomain: "VD000000001"
        },
        "/healthrecord/api/v1/partner/queryCodedValues",
        res => {
          this.totalCount = res.totalCount;
          if (res && res.totalCount !== 0) {
            this.isEmpty = false;
            this.list = this.list.concat(res.items);
            this.totalCount = res.totalCount;
          } else {
            this.isEmpty = true;
          }
        }
      );
    },
    /**
     * 上拉加载更多
     */
    scrolltolower() {
      if (!this.isEmpty && this.list.length < this.totalCount) {
        this.pageIndex++;
        this.getList();
      }
    },
    search() {
      this.pageIndex = 1;
      this.list = [];
      this.getList();
    },
    toDetail(data) {
      // this.codeId = data.id;
      // let url = "/pages/createArchived/main?codeId=" + this.codeId;
      // wx.navigateTo({
      //   url
      // });

      let pages = getCurrentPages();
      // 上一个页面
      let prevPage = pages[pages.length - 2];

      console.log(prevPage);
      
      
      // 往上一个页面传递数据，用于刷新上一个页面数据
      prevPage.setData({
        codeId: data.id,
        codeName: data.meaning,
      });

      wx.navigateBack({
        delta: 1
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.page-wrap {
  height: 100%;
  background-color: #f5f5f5;
  .empty-data {
    padding-top: 200rpx;
    .btn-wrap {
      padding: 30rpx 0 60rpx;
      .add-btn {
        box-sizing: border-box;
        margin: 0 auto;
        width: 240rpx;
        background-color: #fff;
        border: 2rpx solid #4ac2d1;
        border-radius: 10rpx;
        line-height: 60rpx;
        text-align: center;
        font-size: 26rpx;
        color: #4ac2d1;
      }
    }
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
  .record-list {
    box-sizing: border-box;
    .list-view {
      padding-top: 30rpx;
      height: calc(100vh - 118rpx);
      .record-card {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(225, 225, 225, 1);
        padding: 36rpx 30rpx;
        background-color: #fff;
        border-radius: 10rpx;
        color: #666;
        font-size: 26rpx;
        .message {
          position: absolute;
          top: 30rpx;
          right: 30rpx;
          width: 18rpx;
          height: 18rpx;
          background-color: #ff4c4c;
          border-radius: 50%;
        }
        .card-wrap {
          flex: 1;
          .name-relation {
            display: flex;
            align-items: center;
            .name {
              font-size: 36rpx;
              color: #333;
            }
            .gender-age {
              margin-left: 30rpx;
              .age {
                margin-left: 30rpx;
              }
            }
          }
          .update-time {
            margin-top: 20rpx;
          }
        }
        .icon {
          width: 30rpx;
          height: 30rpx;
        }
      }
      .btn-wrap {
        padding: 30rpx 0 60rpx;
        .add-btn {
          box-sizing: border-box;
          margin: 0 auto;
          width: 240rpx;
          background-color: #fff;
          border: 2rpx solid #4ac2d1;
          border-radius: 10rpx;
          line-height: 60rpx;
          text-align: center;
          font-size: 26rpx;
          color: #4ac2d1;
        }
      }
    }
  }
  .mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba($color: #000000, $alpha: 0.5);
    .dialog-wrap {
      margin: 40% auto 0;
      width: 550rpx;
      background-color: #fff;
      border-radius: 20rpx;
      .content {
        padding: 80rpx 40rpx;
        text-align: center;
        font-size: 36rpx;
        color: #333;
      }
      .btn-wrap {
        display: flex;
        border-top: 1rpx solid #e1e1e1;
        .btn {
          flex: 1;
          line-height: 100rpx;
          text-align: center;
          font-size: 32rpx;
          color: #999;
          &.confirm-btn {
            border-right: 1rpx solid #e1e1e1;
            color: #30c9cf;
          }
        }
      }
    }
  }
}
</style>