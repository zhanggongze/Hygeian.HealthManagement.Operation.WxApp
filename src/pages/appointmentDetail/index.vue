<template>
  <div class="page-wrap">
    <div class="card-wrap">
      <div class="top">
        <div class="name">{{name}}</div>
        <div class="status" :class="{'grey': reservationProgress === 500}">{{reservationProgressTxt}}</div>
        <div class="info" v-if="reservationProgress === 0">
          <div class="label">有效期：{{contractStartDateTime}}至{{contractExpirationDateTime}}</div>
          <div class="btn primary-btn" @click="reserve">预约</div>
        </div>
        <div class="info" v-if="reservationProgress === 100">
          <div class="label">预约时间：{{reservationDateTime}}</div>
          <div class="label">预约地点：{{reservationLocationName ? reservationLocationName : ''}}</div>
          <div v-if="type && type === 'sign'" class="btn primary-btn" @click="sign">签到</div>
          <div v-else class="btn primary-btn" @click="reserve">修改预约</div>
        </div>
        <div class="info" v-if="reservationProgress === 200">
          <div class="label">签到时间：{{signedDateTime}}</div>
          <div class="label">签到地点：{{reservationLocationName ? reservationLocationName : ''}}</div>
        </div>
        <div class="info" v-if="reservationProgress === 500">
          <div class="label">过期时间：{{contractExpirationDateTime}}</div>
        </div>
        <div class="package-info">
          <!-- <div class="item">
            <div class="label">套餐包</div>
            <div class="value">{{servicePackageInfo ? servicePackageInfo.name : ''}}</div>
          </div> -->
          <div class="item" v-if="healthRecordInfo">
            <div class="label">预约人</div>
            <div class="value">{{healthRecordInfo.name}} {{healthRecordInfo.gender}} {{healthRecordInfo.age}}岁</div>
          </div>
        </div>
      </div>
      <div class="content">
        <div class="inspect-project">
          <div class="title">检查项目</div>
          <div class="list">
            <div class="item" v-for="(data, index) in list" :key="index">
              <div class="name">{{data.examinationName}}</div>
            </div>
          </div>
        </div>
        <div class="inspect-read">
          <div class="title">检查须知</div>
          <img class="introduce" src="" mode="widthFix" alt="" style="width: 100%">
        </div>
      </div>
    </div>
    <appointment :contractID="contractID" :institutation="reservationLocationID" :date="reservationDateTime" :phoneNumber="reservationPhoneNumber" :show="showAppointmentDialog" @close="showAppointmentDialog=false" @confirm="confirmAppointment"></appointment>
  </div>
</template>

<script>
import appointment from '@/components/appointment'
export default {
  components: {
    appointment
  },
  data() {
    return {
      contractID: '',
      healthRecordId: '',
      // 检查名称
      name: '',
      // 检查状态
      reservationProgress: '',
      // 检查状态对应的中文解释
      reservationProgressTxt: '',
      // 开始时间
      contractStartDateTime: '',
      // 结束时间
      contractExpirationDateTime: '',
      // 预约时间
      reservationDateTime: '',
      // 签到时间
      signedDateTime: '',
      // 预约地址
      reservationLocationName: '',
      // 预约机构ID
      reservationLocationID: '',
      // 电话号码
      reservationPhoneNumber: '',
      // 套餐包信息
      servicePackageInfo: null,
      // 健康档案信息
      healthRecordInfo: null,
      // 预约ID
      reservationID: '',
      // 检查项目列表
      list: [],
      // 是否显示弹框
      showAppointmentDialog: false,
      // 类型
      type: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.contractID = options.contractID
    this.reservationID = options.reservationID
    this.type = options.type ? options.type : ''
    this.getDetail()
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
        this.reservationProgress = reservation.reservationProgress
        this.reservationProgressTxt = this.dict.ApponitmentStatus.find(obj => obj.value === String(this.reservationProgress))['key']
        this.contractStartDateTime = this.utils.formatTime(contract.contractStartDateTime, 'yyyy-MM-dd')
        this.contractExpirationDateTime = contract.contractExpirationDateTime === '9999-12-31T23:59:59.9999999+00:00' ? '不限' : this.utils.formatTime(contract.contractExpirationDateTime, 'yyyy-MM-dd')
        this.reservationDateTime = this.utils.formatTime(reservation.reservationDateTime, 'yyyy-MM-dd')
        this.signedDateTime = this.utils.formatTime(reservation.signedDateTime, 'yyyy-MM-dd')
        this.reservationLocationName = reservation.reservationLocationName
        this.reservationLocationID = reservation.reservationLocationID
        let healthRecordId = contract.contractHealthRecordId
        let servicePackageId = contract.examinationServicePackageID
        let unitDict = this.dict.UnitDict
        this.list = this.list.concat(res.examinations)
        this.reservationPhoneNumber = reservation.reservationPhoneNumber
        this.getHealthRecord(healthRecordId)
      })
    },
    /**
     * 获取健康档案详情
     */
    getHealthRecord(id) {
      this.httpFly.post({
        id: id
      }, 'healthrecord/api/v1/partner/getHealthRecord', res => {
        this.healthRecordInfo = {
          name: res.name,
          gender: res.gender,
          age: new Date().getFullYear() - new Date(res.dob).getFullYear()
        }
      })
    },
    /**
     * 预约
     */
    reserve() {
      this.showAppointmentDialog = true
    },
    /**
     * 确认预约
     */
    confirmAppointment(data) {
      this.httpFly.post({
        contractID: this.contractID,
        reservationID: this.reservationID,
        reservationDateTime: new Date(data.date).toISOString(),
        reservationLocationID: data.institutation,
        phoneNumber: data.phoneNumber
      }, 'servicepackage/api/v1/partner/PhysicalExamination/ExaminationServiceContract/MakeReservation', res => {
        this.showAppointmentDialog = false
        this.getDetail()
      })
    },
    /**
     * 签到
     */
    sign() {
      this.httpFly.post({
        contractID: this.contractID,
        reservationID: this.reservationID
      }, 'servicepackage/api/v1/partner/PhysicalExamination/ExaminationServiceContract/SignReservation', res => {
        this.getDetail()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap {
  padding: 30rpx;
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
        font-weight: 700;
      }
      .status {
        margin-top: 32rpx;
        text-align: center;
        font-size: 48rpx;
        color: #408BF1;
        &.grey {
          color: #666;
        }
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
          padding: 30rpx 0;
          font-size: 36rpx;
          font-weight: 700;
        }
        .list {
          .item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30rpx;
          }
        }
      }
      .inspect-read {
        border-top: 1rpx solid #e1e1e1;
        .title {
          padding: 30rpx 0;
          font-size: 36rpx;
          font-weight: 700;
        }
      }
    }
  }
}
</style>
