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
          <div class="label">{{reservationDateTime}}</div>
          <div class="label">{{reservationLocationName ? reservationLocationName : ''}}</div>
          <div v-if="type && type === 'sign'" class="btn primary-btn" @click="sign">签到</div>
          <div v-else class="btn primary-btn" @click="reserve">修改预约</div>
        </div>
        <div class="info" v-if="reservationProgress === 200">
          <div class="label">{{signedDateTime}}</div>
          <div class="label">{{reservationLocationName ? reservationLocationName : ''}}</div>
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
          <div class="remark" v-if="showRemark || showAppointmentDialog">{{remark}}</div>
          <textarea class="remark" v-else v-model="remark" disabled @click="showRemark=true"></textarea>
        </div>
      </div>
      <div class="content">
        <div class="inspect-project">
          <div class="title">检查项目</div>
          <div class="list">
            <div class="item" v-for="(data, index) in list" :key="index">
              <div class="name">{{data.examinationName ? data.examinationName : ''}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <appointment :contractID="contractID" :institutation="reservationLocationID" :date="date" :time="time" :phoneNumber="reservationPhoneNumber" :show="showAppointmentDialog" @close="showAppointmentDialog=false" @confirm="confirmAppointment"></appointment>
    <textarea-dialog label="预约" placeholder="请输入备注" :show="showRemark" v-model="newRemark" @close="showRemark=false" @confirm="updateRemark"></textarea-dialog>
  </div>
</template>

<script>
import appointment from '@/components/appointment'
import textareaDialog from '@/components/textarea-dialog'
export default {
  components: {
    appointment,
    textareaDialog
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
      type: '',
      // 预约日期
      date: '',
      // 预约时间
      time: '',
      remark: '备注：',
      newRemark: '',
      showRemark: false
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
        this.date = this.utils.formatTime(reservation.reservationDateTime, 'yyyy-MM-dd')
        this.time = this.utils.formatTime(reservation.reservationDateTime).substr(11, 5)
        let hour = parseInt(this.time.substr(0, 2)) + 2
        hour = hour < 10 ? '0' + hour : hour
        let newDateTime = this.utils.formatTime(reservation.reservationDateTime)
        this.reservationDateTime = newDateTime.substr(0, 16) + '至' + hour + this.time.substr(2)
        this.signedDateTime = this.utils.formatTime(reservation.signedDateTime, 'yyyy-MM-dd')
        this.reservationLocationName = reservation.reservationLocationName
        this.reservationLocationID = reservation.reservationLocationID
        let healthRecordId = contract.contractHealthRecordId
        let servicePackageId = contract.examinationServicePackageID
        let unitDict = this.dict.UnitDict
        this.list = this.list.concat(res.examinations)
        this.reservationPhoneNumber = reservation.reservationPhoneNumber
        this.getHealthRecord(healthRecordId)
        if(reservation.remark) {
          this.remark = '备注：' + reservation.remark
          this.newRemark = reservation.remark
        }
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
        reservationDateTime: this.utils.formatGMTDate(data.date + ' ' + data.time + ':00'),
        reservationLocationID: data.institutation,
        phoneNumber: data.phoneNumber
      }, 'servicepackage/api/v1/partner/PhysicalExamination/ExaminationServiceContract/MakeReservation', res => {
        this.showAppointmentDialog = false
        this.getDetail()
        this.refreshPrePage()
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
        this.refreshPrePage()
      })
    },
    /**
     * 修改备注
     */
    updateRemark() {
      this.httpFly.post({
        contractID: this.contractID,
        reservationID: this.reservationID,
        reservationRemark: this.newRemark
      }, 'servicepackage/api/v1/partner/PhysicalExamination/ExaminationServiceContract/UpdateReservationRemark', res => {
        this.utils.toast('修改成功')
        this.remark = '备注：' + this.newRemark
        this.showRemark = false
      }, error => {
        this.utils.toast('修改失败a')
        this.newRemark = this.remark
      })
    },
    /**
     * 刷新上一个页面数据
     */
    refreshPrePage() {
      let pages = getCurrentPages();
      // 上一个页面
      let prevPage = pages[pages.length - 2];
      // 往上一个页面传递数据，用于刷新上一个页面数据
      prevPage.setData({
        needRefresh: true
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
        .remark {
          box-sizing: border-box;
          margin-top: 30rpx;
          padding: 20rpx;
          height: 180rpx;
          background: rgba(245,245,245,1);
          border: 1rpx solid rgba(225, 225, 225, 1);
          border-radius: 10rpx;
          font-size: 30rpx;
          color: #333;
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
