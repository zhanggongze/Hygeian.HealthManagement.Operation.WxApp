<template>
  <div class="page-wrap">
    <div class="patient-card">
      <div
        class="surname"
        :style="{'backgroundColor': nameColors[colorIndex]}"
      >{{firstName}}</div>
      <div class="base-info">
        <div class="name">{{name}}</div>
        <div class="sex-age">
          <div class="sex">{{gender}}</div>
          <div class="age">{{age}}岁</div>
        </div>
      </div>
    </div>
    <div class="hr"></div>
    <div class="card questionnaire">
      <div class="title">出院随访问卷</div>
      <div class="content">
        <div class="item" v-for="(data, index) in list" :key="index">
          <div class="label">{{index + 1}}.{{data.name}}</div>
          <div class="value">{{data.value}}</div>
        </div>
      </div>
    </div>
    <div class="hr"></div>
    <div class="card assessment">
      <div class="title">随访评估</div>
      <div class="result">{{confirmedContent ? confirmedContent : '无'}}</div>
      <div class="box">
        <div>随访医生</div>
        <div class="value">{{doctorName}}</div>
      </div>
      <div class="box">
        <div>随访日期</div>
        <div class="value">{{nextScheduleDateTime}}</div>
      </div>
    </div>
    <button class="back-btn primary-btn" hover-class="primary-btn-hover" @click="back">返回</button>
  </div>
</template>
<script>
export default {
  data() {
    return {
      id: '',
      scheduleId: '',
      nameColors: [],
      colorIndex: 0,
      list: [],
      firstName: '',
      name: '',
      age: '',
      gender: '',
      nextScheduleDateTime: '',
      // 评估内容
      confirmedContent: '',
      doctorName: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.nameColors = this.dict.nameColors
    this.id = options.id
    this.scheduleId = options.scheduleId
    this.getSchedule()
  },
  methods: {
    /**
     * 获取随访记录
     */
    getSchedule() {
      this.httpFly.post({
        scheduleId: this.scheduleId
      }, '/followup/api/v1/doctor/getSchedule', res => {
        let schedule = res.schedule
        this.firstName = schedule.patientName.substr(0, 1)
        this.name = schedule.patientName
        this.gender = schedule.patientSex
        this.age = this.utils.getAge(schedule.patientDob)
        this.colorIndex = wx.getStorageSync('recordsColor')[schedule.targetSign]
        this.list = JSON.parse(schedule.repliedContent)
        this.confirmedContent = schedule.confirmedContent
        this.nextScheduleDateTime = this.utils.formatTime(schedule.confirmedDatetime, true)
        this.queryDoctorInfo(schedule.operatorSign)
      })
    },
    queryDoctorInfo(id) {
      this.httpFly.post({
        query: `query{
          medicalGroup(doctorID:"${id}") {
            id,
            doctor {
              name,
              headImageUrl,
              hospitalName,
              professionalTitle,
              departmentName,
              introduce
            }
          }
        }`
      }, '/medicalgroup/api/graphql', res => {
        if (res && res.data && res.data.medicalGroup && res.data.medicalGroup.doctor) {
          this.doctorName = res.data.medicalGroup.doctor.name
        }
      })
    },
    back() {
      wx.navigateBack({
        delta: 1
      })
    }
  }
}
</script>
<style lang="scss" scoped>
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
}
.card {
  padding: 0 30rpx;
  .title {
    padding: 26rpx 0;
    font-size: 40rpx;
    color: #508fff;
  }
}
.questionnaire {
  .content {
    padding-top: 10rpx;
    font-size: 28rpx;
    color: #36507e;
    .item {
      margin-bottom: 26rpx;
      .value {
        font-weight: bold;
      }
    }
  }
}
.assessment {
  padding: 0;
  .title {
    padding: 26rpx 30rpx;
  }
  .result {
    padding: 0 26rpx 48rpx;
    border-bottom: 1rpx solid #e1e1e1;
    font-size: 28rpx;
    color: #8b8fab;
  }
  .box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30rpx;
    border-bottom: 1rpx solid #e1e1e1;
    line-height: 98rpx;
    font-size: 32rpx;
    color: #36507e;
    .value {
      font-size: 24rpx;
      color: #8b8fab;
    }
  }
}
.hr {
  height: 20rpx;
  background-color: #eeeef8;
}
.back-btn {
  margin: 60rpx 30rpx 30rpx;
}
</style>


