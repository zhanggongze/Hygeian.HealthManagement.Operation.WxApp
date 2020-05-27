<template>
  <div class="page-wrap">
    <div class="card-wrap">
      <div class="top">
        <div class="name">{{name}}</div>
        <div class="status">{{isFinish ? '已完成' : '进行中'}}</div>
        <div class="info">
          <div class="label">{{signedDateTime}}</div>
          <div class="label">{{reservationLocationName}}</div>
        </div>
        <div class="package-info" v-if="healthRecordInfo">
          <div class="item">
            <div class="label">预约人</div>
            <div class="value">{{healthRecordInfo.name}} {{healthRecordInfo.gender}} {{healthRecordInfo.age}}岁</div>
          </div>
        </div>
      </div>
      <div class="content">
        <div class="inspect-project">
          <div class="title">检查项目</div>
          <div class="list">
            <div class="item" v-for="(data, index) in list" :key="index" @click="toDetail(data)">
              <div class="name">{{data.examinationName ? data.examinationName : ''}}</div>
              <div class="status-icon">
                <div v-if="data.progress == 400" class="status selected">收集完成</div>
                <div v-else class="status">收集中</div>
                <img class="icon" src="/static/images/icon_direct.png" alt="">
              </div>
            </div>
          </div>
        </div>
        <div v-if="!isFinish" class="primary-btn complete-btn" @click="complete">完成</div>
      </div>
    </div>
    <create-health-event :show="showDialog" @cancel="showDialog=false" @confirm="confirm"></create-health-event>
  </div>
</template>

<script>
import createHealthEvent from '@/components/create-health-event'
export default {
  components: {
    createHealthEvent
  },
  data() {
    return {
      contractID: '',
      healthRecordId: '',
      // 检查名称
      name: '',
      // 签到时间
      signedDateTime: '',
      // 预约地址
      reservationLocationName: '',
      // 健康档案信息
      healthRecordInfo: null,
      // 预约ID
      reservationID: '',
      // 检查项目列表
      list: [],
      isFinish: false,
      showDialog: false,
      // 检查项ID
      id: '',
      progress: '',
      eventTypeCode: '',
      eventTypeName: '',
      institutionID: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.contractID = options.contractID
    this.reservationID = options.reservationID
    
    this.getDetail()
  },
  onShow() {
    let pages = getCurrentPages()
    let curPage = pages[pages.length - 1]
    if (curPage.data.needRefresh) {
      delete curPage.data.needRefresh
      this.getDetail()
    }
  },
  methods: {
    /**
     * 获取检查详情
     */
    getDetail() {
      this.list = []
      this.httpFly.post({
        contractID: this.contractID,
        reservationID: this.reservationID
      }, '/servicepackage/api/v1/partner/PhysicalExamination/ExaminationServiceContract/GetContract', res => {
        let contract = res.contract
        let reservation = res.reservation
        this.name = contract.contractName
        this.signedDateTime = this.utils.formatTime(reservation.signedDateTime, 'yyyy-MM-dd')
        this.reservationLocationName = reservation.reservationLocationName
        this.healthRecordId = contract.contractHealthRecordId
        this.list = this.list.concat(res.examinations)
        this.isFinish = res.contract.isFinish
        this.getHealthRecord()
      })
    },
    /**
     * 获取健康档案详情
     */
    getHealthRecord() {
      this.httpFly.post({
        id: this.healthRecordId
      }, 'healthrecord/api/v1/partner/getHealthRecord', res => {
        this.healthRecordInfo = {
          name: res.name,
          gender: res.gender,
          age: new Date().getFullYear() - new Date(res.dob).getFullYear()
        }
      })
    },
    /**
     * 完成检查
     */
    complete() {
      this.httpFly.post({
        contractID: this.contractID
      }, 'servicepackage/api/v1/partner/PhysicalExamination/ExaminationServiceContract/FinishContract', res => {
        this.isFinish = true
        this.getDetail()
        let pages = getCurrentPages()
        // 上一个页面
        let prevPage = pages[pages.length - 2]
        // 往上一个页面传递数据，用于刷新上一个页面数据
        prevPage.setData({
          needRefresh: true
        })
      })
    },
    /**
     * 检查项跳转
     */
    toDetail(data) {
      this.progress = data.progress
      this.id = data.id
      this.eventTypeCode = data.eventType.code
      this.eventTypeName = data.eventType.displayName
      this.institutionID = data.institutionID
      if (data.progress == 400) {
        wx.navigateTo({
          url: '/pages/inspectionItemDetail/main?id=' + this.id + '&contractID=' + this.contractID + '&progress=' + this.progress + '&hospitalID=' + this.institutionID
        })
      } else {
        this.getHealthEventBySource()
      }
    },
    /**
     * 判断卫生事件是否存在
     */
    getHealthEventBySource() {
      this.httpFly.post({
        source: {
          type: 'Exam',
          identity: this.id
        }
      }, '/healthrecord/api/v1/partner/getHealthEventBySource', res => {
        this.showDialog = false
        wx.navigateTo({
          url: '/pages/inspectionItemDetail/main?id=' + this.id + '&contractID=' + this.contractID + '&progress=' + this.progress + '&hospitalID=' + this.institutionID
        })
      }, error => {
        this.showDialog = true
      })
    },
    /**
     * 确认创建当前卫生事件
     */
    confirm(data) {
      this.httpFly.post({
        healthRecordId: this.healthRecordId,
        occurrenceDateTime: this.utils.formatGMTDate(data.date),
        institution: this.reservationLocationName,
        source: {
          type: 'Exam',
          identity: this.id
        },
        eventType: {
          code: this.eventTypeCode,
          displayName: this.eventTypeName
        }
      }, 'healthRecord/api/v1/partner/createHealthEvent', res => {
        this.showDialog = false
        this.getDetail()
        wx.navigateTo({
          url: '/pages/inspectionItemDetail/main?id=' + this.id + '&contractID=' + this.contractID + '&progress=' + this.progress
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap {
  padding: 30rpx;
  min-height: 100%;
  background-color: #f5f5f5;
  box-sizing: border-box;
  .card-wrap {
    .top {
      position: relative;
      padding: 30rpx 30rpx 40rpx;
      font-size: 30rpx;
      color: #333;
      background-color: #fff;
      border-radius: 10rpx 10rpx 0 0;
      &::before {
        content: "";
        position: absolute;
        right: -15rpx;
        bottom: -15rpx;
        z-index: 1;
        width: 30rpx;
        height: 30rpx;
        background: #f5f5f5;
        border-radius: 50%;
      }
      &::after {
        content: "";
        position: absolute;
        left: -15rpx;
        bottom: -15rpx;
        z-index: 1;
        width: 30rpx;
        height: 30rpx;
        background: #f5f5f5;
        border-radius: 50%;
      }
      .name {
        padding-top: 4rpx;
        font-size: 40rpx;
      }
      .status {
        margin-top: 32rpx;
        text-align: center;
        font-size: 48rpx;
        color: #408BF1;
      }
      .info {
        margin-top: 14rpx;
        text-align: center;
        .label {
          color: #999;
        }
        .btn {
          margin: 70rpx auto 0;
          width: 400rpx;
          font-size: 36rpx;
          font-weight: 700;
        }
        .img-code {
          display: block;
          margin: 20rpx auto 0;
          width: 200px;
          height: 200px;
        }
      }
      .package-info {
        margin-top: 66rpx;
        .item {
          margin-top: 12rpx;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .label {
            color: #999;
          }
        }
      }
    }
    .content {
      position: relative;
      padding: 30rpx;
      background: #fff;
      border-radius: 0 0 10rpx 10rpx;
      &::after {
        content: "";
        position: absolute;
        left: 22rpx;
        right: 25rpx;
        top: -6rpx;
        height: 12rpx;
        background: radial-gradient(#f5f5f5 6rpx, transparent 6rpx);
        background-size: 24rpx 24rpx;
        background-repeat: repeat-x;
        background-position: 0;
      }
      .inspect-project {
        font-size: 32rpx;
        color: #333;
        .title {
          padding: 10rpx 0 20rpx;
          font-size: 36rpx;
        }
        .list {
          .item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 30rpx 0;
            .status-icon {
              display: flex;
              align-items: center;
              .status {
                margin-right: 20rpx;
                font-size: 28rpx;
                color: #408BF1;
                &.selected {
                  color: #00CE9E;
                }
              }
              .icon {
                display: block;
                width: 30rpx;
                height: 30rpx;
              }
            }
          }
        }
      }
      .complete-btn {
        margin: 50rpx auto 100rpx;
        width: 320rpx;
      }
    }
  }
}
</style>
