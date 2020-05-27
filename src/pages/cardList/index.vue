<template>
  <div class="page-wrap">
    <div class="nav">
      <div class="item" @click="selectNav(1)">
        <div class="name ell">{{type ? type : '全部渠道'}}</div>
        <img class="direct-icon" src="/static/images/icon_direct.png" alt="">
      </div>
      <div class="item" @click="selectNav(2)">
        <div class="name ell">{{cardId ? cardId : '全部套餐卡'}}</div>
        <img class="direct-icon" src="/static/images/icon_direct.png" alt="">
      </div>
    </div>
    <div class="main">
      <scroll-view
        class="list"
        v-if="list.length"
        scroll-y="true"
        @scrolltolower="scrolltolower"
      >
        <div class="item" v-for="(data, index) in list" :key="index" @click="toDetail(data)">
          <div class="name-count">
            <div class="name">基础套餐卡</div>
            <div class="count">20 张</div>
          </div>
          <div class="content">
            <div class="label">发卡渠道：南昌一脉影像</div>
            <div class="label">付款方式：预付款</div>
            <div class="label">发卡日期：2020-05-14</div>
          </div>
        </div>
      </scroll-view>
      <div class="empty-data" v-else>
        <img class="img" src="/static/images/empty_message.png" alt />
        <div class="p">暂无记录</div>
      </div>
    </div>
    <div class="primary-btn add-btn" @click="addCard">新增发卡记录</div>
    <div :class="{'mask': showSearchIndex && showSearchIndex !== -1}" @click="hideMask()">
      <div @click.stop>
        <div class="hospital-list" v-if="showSearchIndex === 1">
          <div class="item" :class="{'selected': hospitalName === ''}" @click="selectHospital('')">
            <div class="label">全部渠道</div>
          </div>
          <div
            class="item"
            :class="{'selected': typeId === data.id}"
            v-for="(data, index) in typeList"
            :key="index"
            @click="selectType(data)"
          >
            <div class="label">{{data.name}}</div>
          </div>
        </div>
        <div class="hospital-list" v-if="showSearchIndex === 2">
          <div class="item" :class="{'selected': hospitalName === ''}" @click="selectHospital('')">
            <div class="label">全部套餐卡</div>
          </div>
          <div
            class="item"
            :class="{'selected': cardId === data.id}"
            v-for="(data, index) in cardList"
            :key="index"
            @click="selectCard(data)"
          >
            <div class="label">{{data.name}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return  {
      typeList: [],
      cardList: [],
      list: [1, 2, 3, 4, 5],
      showSearchIndex: -1
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
  },
  methods: {
    /**
     * 新增发卡记录
     */
    addCard() {
      wx.navigateTo({
        url: '/pages/addCard/main'
      })
    },
    /**
     * 跳转到卡详情
     */
    toDetail(data) {
      wx.navigateTo({
        url: '/pages/cardDetail/main'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.page-wrap {
  height: 100%;
  background-color: #f5f5f5;
  .nav {
    position: relative;
    z-index: 4;
    display: flex;
    align-items: center;
    height: 100rpx;
    background-color: #fff;
    .item {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      font-size: 32rpx;
      color: #333;
      .name {
        max-width: 320rpx;
      }
      .direct-icon {
        display: block;
        margin: 6rpx 0 0 10rpx;
        width: 30rpx;
        height: 30rpx;
        transform: rotate(90deg);
      }
    }
  }
  .main {
    box-sizing: border-box;
    padding: 30rpx;
    height: calc(100vh - 200rpx);
    .list {
      height: 100%;
      .item {
        margin-bottom: 30rpx;
        padding: 0 30rpx;
        background-color: #fff;
        border-radius: 10rpx;
        &:last-child {
          margin-bottom: 0;
        }
        .name-count {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 32rpx 0;
          border-bottom: 1rpx solid #e1e1e1;
          .name {
            font-size: 40rpx;
            color: #333;
          }
          .count {
            font-size: 36rpx;
            color: $themeColor;
          }
        }
        .content {
          padding: 20rpx 0;
          font-size: 28rpx;
          color: #999;
          .label {
            line-height: 48rpx;
          }
        }
      }
    }
    .empty-data {
      padding-top: 30%;
    }
  }
  .add-btn {
    border-radius: 0;
    line-height: 100rpx;
    font-size: 36rpx;
  }
  .mask {
    position: fixed;
    top: 196rpx;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: stretch;
    justify-content: flex-start;
    background: rgba(0, 0, 0, 0.4);
    z-index: 3;
    .hospital-list {
      width: 100%;
      background-color: #fff;
      border-top: 1rpx solid #e1e1e1;
      max-height: 624rpx;
      position: absolute;
      animation: fade 0.5s linear;
      -webkit-animation: fade 0.5s linear;
      overflow-x: hidden;
      .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 30rpx;
        height: 88rpx;
        border-bottom: 1rpx solid #e1e1e1;
        font-size: 30rpx;
        color: #333;
        &.selected {
          color: #408bf1;
        }
        .select-icon {
          display: block;
          width: 28rpx;
          height: 20rpx;
        }
      }
    }
    @keyframes fade {
      from {
        top: -600rpx;
      }
      to {
        top: 0;
      }
    }
  }
}
</style>

