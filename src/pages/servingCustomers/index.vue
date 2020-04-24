<template>
  <div class="page-new-patient">
    <div class="list" v-if="!isEmpty">
      <div class="patient-card"
        v-for="(patientInfo, index) in list"
        :key="index"
         @click="toChat(patientInfo)"
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
      </div>
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
      list: [],
      nameColors: this.dict.nameColors,
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
      }, 'servicepackage/api/v1/doctor/CustomerContracts/QueryServicedHealthRecords', res => {
        let recordsColor = wx.getStorageSync('recordsColor')
        if (!recordsColor) {
          recordsColor = res.items.reduce((a, b) => {
            if (!a[b.id]) {
              a[b.id] = Math.floor(Math.random() * 4)
            }
            return a
          }, {})
        } else {
          res.items.forEach(obj => {
            if (!recordsColor[obj.id]) {
              recordsColor[obj.id] = Math.floor(Math.random() * 4)
            }
          })
        }
        wx.setStorageSync('recordsColor', recordsColor)
        let healthRecordIDs = res.items.map(obj => obj.id)
        this.isEmpty = healthRecordIDs.length === 0
        this.queryHealthRecordsWithoutGrant(healthRecordIDs, recordsColor)
      })
    },
    queryHealthRecordsWithoutGrant(ids, recordsColor) {
      this.httpFly.post({
        healthRecordIds: ids
      }, 'healthRecord/api/v1/doctor/queryHealthRecordsWithoutGrant', res => {
        let resultobj = res.items.reduce((a, b) => {
          if (!a[b['id']]) {
            a[b['id']] = b
          }
          return a
        }, {})
        this.list = this.list.concat(ids.map(id => {
          let obj = resultobj[id]
          obj.firstName = obj.name.substr(0, 1)
          obj.age = this.utils.getAge(obj.dob)
          obj.date = this.utils.formatTime(obj.creationDateTime)
          obj.colorIndex = recordsColor[obj.id]
          return obj
        }))
      })
    },
    toChat(data) {
      wx.navigateTo({
        url: '/pages/patientDetail/main?id=' + data.id + '&toAccount=' + data.name + '&grantId=' + data.grantId
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