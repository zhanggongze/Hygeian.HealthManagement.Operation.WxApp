<template>
  <div class="page-wrap">
    <div class="title">
      <div class="name">{{title}}</div>
    </div>
    <div class="nav">
      <div class="item" @click="selectNav(1)">
        <div class="name ell">{{selectTimeIndex === 3 ? '自定义' : timeRange[selectTimeIndex]}}</div>
        <img class="direct-icon" src="/static/images/icon_direct.png" alt="">
      </div>
      <div class="item" @click="selectNav(2)">
        <div class="name ell">{{hospitalName ? hospitalName : '全部医院'}}</div>
        <img class="direct-icon" src="/static/images/icon_direct.png" alt="">
      </div>
    </div>
    <div class="hr"></div>
    <div class="empty-data" v-if="totalCount === 0">
      <img class="img" src="/static/images/empty_message.png" alt="">
      <div class="p">暂无记录</div>
    </div>
    <div class="result-wrap" v-else>
      <div class="total">
        <div class="label">
          <div v-if="serviceType === 'ask'">总咨询人数：</div>
          <div v-if="serviceType === 'im'">总活跃人数：</div>
        </div>
        <div class="count">{{totalCount}}人</div>
      </div>
      <div class="list">
        <div class="item" v-for="(data, index) in list" :key="index">
          <div class="label-title">{{data.providerName}}</div>
          <div class="bar-wrap">
            <div class="bar" :style="{'width': data.percent + '%'}"></div>
            <div class="label">{{data.totalCount}}</div>
          </div>
        </div>
      </div>
    </div>
    <div :class="{'mask': showSearchIndex && showSearchIndex !== -1}" @click="hideMask()">
      <div @click.stop>
        <div class="hospital-list" v-if="showSearchIndex === 1">
          <div
            class="item"
            :class="{'selected': selectTimeIndex === index}"
            v-for="(data, index) in timeRange"
            :key="index"
            @click="selectTime(index)"
          >
            <div class="label">{{data}}</div>
          </div>
          <div class="footer">
            <picker mode="date" :value="startDateTime" @change="startTimeChange">
              <div class="time-input start-time">
                <span v-if="startDateTime" class="value">{{startDateTime}}</span>
                <span v-else>开始时间</span>
              </div>
            </picker>
            <div class="split">-</div>
            <picker mode="date" :value="endDateTime" @change="endTimeChange">
              <div class="time-input end-time">
                <span v-if="endDateTime" class="value">{{endDateTime}}</span>
                <span v-else>结束时间</span>
              </div>
            </picker>
            <div class="primary-btn confirm-btn" @click="confirmTime">确定</div>
          </div>
        </div>
        <div class="hospital-list" v-if="showSearchIndex === 2">
          <div class="item" :class="{'selected': hospitalName === ''}" @click="selectHospital('')">
            <div class="label">全部医院</div>
          </div>
          <div
            class="item"
            :class="{'selected': hospitalName === data}"
            v-for="(data, index) in hospitalList"
            :key="index"
            @click="selectHospital(data)"
          >
            <div class="label">{{data}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 接口地址
      url: '',
      // 标题
      title: '',
      // 服务类型
      serviceType: '',
      // 医院列表
      hospitalList: [],
      // 勾选医院名称
      hospitalName: '',
      // 显示搜索条件
      showSearchIndex: -1,
      // 时间范围选择
      timeRange: ['昨日', '最近7天', '最近30天'],
      // 选择时间回调
      selectTimeIndex: 0,
      // 开始时间
      startDateTime: '',
      // 结束时间
      endDateTime: '',
      // 结果列表
      list: [],
      // 总数
      totalCount: 0
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.serviceType = options.serviceType
    if (this.serviceType === 'ask') {
      this.title = '按医生统计图文咨询人数'
      this.url = '/api/v1/partner/consultationServiceAnalysisReport'
    } else if (this.serviceType === 'im') {
      this.title = '按医生统计健康顾问活跃人数'
      this.url = '/api/v1/partner/imServiceAnalysisReport'
    }
    this.queryInstitutions()
    this.queryReport()
  },
  methods: {
    /**
     * 查询报表
     */
    queryReport() {
      let startDateTime = ''
      let endDateTime = ''
      switch (this.selectTimeIndex) {
        case 0:
          startDateTime = this.utils.formatDate(new Date(new Date().setDate(new Date().getDate() - 1)), 'yyyy/MM/dd 00:00:00')
          endDateTime = this.utils.formatDate(new Date(new Date().setDate(new Date().getDate() - 1)), 'yyyy/MM/dd 23:59:59')
          break;
        case 1:
          startDateTime = this.utils.formatDate(new Date(new Date().setDate(new Date().getDate() - 7)), 'yyyy/MM/dd 00:00:00')
          endDateTime = this.utils.formatDate(new Date(new Date().setDate(new Date().getDate() - 1)), 'yyyy/MM/dd 23:59:59')
          break;
        case 2:
          startDateTime = this.utils.formatDate(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy/MM/dd 00:00:00')
          endDateTime = this.utils.formatDate(new Date(new Date().setDate(new Date().getDate() - 1)), 'yyyy/MM/dd 23:59:59')
          break;
        case 3:
          startDateTime = String(this.startDateTime + ' 00:00:00').replace(/-/g, '/')
          endDateTime = String(this.endDateTime + ' 00:00:00').replace(/-/g, '/')
          break;
      }
      this.list = []
      this.totalCount = 0
      this.httpFly.post({
        region: wx.getStorageSync('activeInfo')['region'],
        startDateTime: this.utils.formatGMTDate(startDateTime),
        endDateTime: this.utils.formatGMTDate(endDateTime),
        hospitalName: this.hospitalName
      }, `report${this.url}`, res => {
        this.list = this.list.concat(res.providerSummaries.map(obj => {
          obj.percent = (obj.totalCount / res.totalCount) * 100
          return obj
        }))
        this.totalCount = res.totalCount
      })
    },
    /**
     * 查询区域医院列表
     */
    queryInstitutions() {
      this.httpFly.post({
        region: wx.getStorageSync('activeInfo')['region']
      }, 'report/api/v1/partner/queryInstitutions', res => {
        this.hospitalList = this.hospitalList.concat(res.items.map(obj => obj.fullName))
      })
    },
    /**
     * 选择搜索条件
     */
    selectNav(index) {
      if (this.showSearchIndex === index) {
        this.showSearchIndex = -1
      } else {
        this.showSearchIndex = index
      }
    },
    /**
     * 隐藏搜索条件
     */
    hideMask() {
      this.showSearchIndex = -1
    },
    /**
     * 医院选择回调
     */
    selectHospital(value) {
      this.hospitalName = value
      this.hideMask()
      this.queryReport()
    },
    /**
     * 时间范围选择回调
     */
    selectTime(index) {
      this.selectTimeIndex = index
      this.startDateTime = ''
      this.endDateTime = ''
      this.hideMask()
      this.queryReport()
    },
    /**
     * 开始时间回调
     */
    startTimeChange(e) {
      this.startDateTime = e.mp.detail.value
    },
    /**
     * 结束时间回调
     */
    endTimeChange(e) {
      this.endDateTime = e.mp.detail.value
    },
    /**
     * 确定时间范围
     */
    confirmTime() {
      if (!this.startDateTime) {
        this.utils.toast('请选择开始时间')
        return
      }
      if (!this.endDateTime) {
        this.utils.toast('请选择结束时间')
        return
      }
      this.selectTimeIndex = 3
      this.hideMask()
      this.queryReport()
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  position: relative;
  z-index: 4;
  padding: 40rpx 20rpx 30rpx;
  background-color: #fff;
  .name {
    padding-left: 10rpx;
    border-left: 6rpx solid #408bf1;
    line-height: 36rpx;
    font-size: 36rpx;
    color: #333;
  }
}
.nav {
  position: relative;
  z-index: 4;
  display: flex;
  align-items: center;
  height: 90rpx;
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
.hr {
  height: 20rpx;
  background-color: #f5f5f5;
}
.empty-data {
  padding-top: 30%;
}
.result-wrap {
  padding: 0 30rpx;
  .total {
    display: flex;
    align-items: center;
    padding: 30rpx 0;
    .label {
      font-size: 28rpx;
      color: #999;
    }
    .count {
      margin-left: 6rpx;
      font-size: 40rpx;
      color: #408bf1;
    }
  }
  .list {
    padding-top: 10rpx;
    .item {
      position: relative;
      padding-top: 30rpx;
      .label-title {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        font-size: 28rpx;
        color: #999;
        .doctor-name {
          margin-left: 30rpx;
        }
      }
      .bar-wrap {
        display: flex;
        align-items: center;
        margin-bottom: 36rpx;
        .bar {
          height: 16rpx;
          background: linear-gradient(
            90deg,
            rgba(64, 139, 241, 1),
            rgba(34, 172, 251, 1)
          );
        }
        .label {
          margin-left: 10rpx;
          font-size: 36rpx;
          color: #333;
        }
      }
    }
  }
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
    .footer {
      display: flex;
      align-items: center;
      padding: 15rpx 30rpx;
      .time-input {
        width: 220rpx;
        height: 70rpx;
        background: rgba(238, 238, 238, 1);
        border-radius: 35rpx;
        line-height: 70rpx;
        text-align: center;
        color: #999;
        font-size: 28rpx;
        .value {
          color: #333;
        }
      }
      .split {
        margin: 0 20rpx;
        line-height: 70rpx;
        color: 999;
      }
      .confirm-btn {
        margin-left: 30rpx;
        width: 165rpx;
        border-radius: 10rpx;
        line-height: 70rpx;
        font-size: 28rpx;
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
</style>
