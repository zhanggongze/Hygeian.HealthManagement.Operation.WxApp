<template>
  <div class="page-new-patient">
    <div class="list" v-if="!isEmpty">
      <navigator
        :url="'/pages/patientArchiving/main?id=' + patientInfo.id"
        class="patient-card"
        v-for="(patientInfo, index) in list"
        :key="index"
      >
        <div
          class="surname"
          :style="{'backgroundColor': nameColors[patientInfo.colorIndex]}"
        >{{patientInfo.firstName}}</div>
        <div class="base-info">
          <div class="name">{{patientInfo.name}}</div>
          <div class="sex-age">
            <div class="sex">{{patientInfo.gender}}</div>
            <div class="age">{{patientInfo.age}}岁</div>
          </div>
        </div>
        <div class="date">{{patientInfo.date}}</div>
      </navigator>
    </div>
    <div v-else class="empty-data">
      <img class="img" src="/static/images/empty_message.png" alt />
      <div class="p">暂无记录</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      nameColors: [],
      list: [],
      recordColor: null,
      isEmpty: true
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.nameColors = this.dict.nameColors
    this.recordColor = wx.getStorageSync('recordsColor')
    this.getList()
  },
  onShow() {
    let pages = getCurrentPages()
    let curPage = pages[pages.length - 1]
    let prevPage = pages[pages.length - 2]
    if (curPage.data.needRefresh) {
      delete curPage.data.needRefresh
      prevPage.setData({
        needRefresh: true
      })
      this.getList()
    }
  },
  methods: {
    /**
     * 获取患者列表
     */
    getList() {
      this.httpFly.post({
        IsOnlyWithoutTag: true
      }, 'healthrecord/api/v1/doctor/queryHealthRecords', res => {
        this.withoutTagsCount = res.withoutTagsCount
        let resList = res.items.map(obj => {
          obj.firstName = obj.name.substr(0, 1)
          obj.age = this.utils.getAge(obj.dob)
          obj.date = this.utils.formatTime(obj.creationDateTime)
          obj.colorIndex = this.recordColor[obj.id]
          return obj
        })
        this.list = resList
        this.isEmpty = this.list.length === 0
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.empty-data {
  padding-top: 40%;
}
.patient-card {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  .surname {
    margin-right: 30rpx;
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    line-height: 88rpx;
    text-align: center;
    font-size: 48rpx;
    color: #fff;
  }
  .base-info {
    .name {
      font-size: 36rpx;
      color: $themeColor;
    }
    .sex-age {
      display: flex;
      margin-top: 2rpx;
      font-size: 26rpx;
      color: #8b8fab;
      .sex {
        margin-right: 38rpx;
      }
    }
  }
  .date {
    flex: 1;
    text-align: right;
    font-size: 24rpx;
    color: #8b8fab;
  }
}
</style>
