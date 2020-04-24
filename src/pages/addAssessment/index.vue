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
      <div class="content">
        <textarea v-model="confirmedContent" placeholder="请填写随访评估"></textarea>
      </div>
      <picker
        mode="date"
        :value="nextScheduleDateTime"
        @change="dateChange"
        range-key="key"
      >
        <div class="box">
          <div>下次随访日期</div>
          <div class="value">
            <div v-if="nextScheduleDateTime">{{nextScheduleDateTime}}</div>
            <div class="placeholder" v-else>请选择日期</div>
            <img class="direct-icon" src="/static/images/icon_index.png" alt />
          </div>
        </div>
      </picker>
    </div>
    <button class="submit-btn primary-btn" hover-class="primary-btn-hover" @click="submit">提交</button>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 健康档案id
      id: '',
      nameColors: [],
      colorIndex: 0,
      firstName: '',
      name: '',
      age: '',
      gender: '',
      // 随访id
      scheduleId: '',
      // 下次随访时间
      nextScheduleDateTime: '',
      // 评估内容
      confirmedContent: '',
      // 问题列表
      list: []
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.nameColors = this.dict.nameColors
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
        if (res && res.schedule) {
          let schedule = res.schedule
          this.firstName = schedule.patientName.substr(0, 1)
          this.name = schedule.patientName
          this.gender = schedule.patientSex
          this.age = this.utils.getAge(schedule.patientDob)
          this.colorIndex = wx.getStorageSync('recordsColor')[schedule.targetSign]
          this.list = JSON.parse(schedule.repliedContent)
        }
      })
    },
    dateChange(e) {
      this.nextScheduleDateTime = e.target.value
    },
    /**
     * 提交随访
     */
    submit() {
      if (!this.confirmedContent) {
        this.utils.toast('请填写随访评估')
        return
      }
      if (!this.nextScheduleDateTime) {
        this.utils.toast('请选择下次随访日期')
        return
      }
      this.httpFly.post({
        scheduleID: this.scheduleId,
        confirmedContent: this.confirmedContent,
        nextScheduleDateTime: new Date(this.nextScheduleDateTime + 'T00:00')
      }, '/followup/api/v1/doctor/comfirmSchedule', res => {
        let pages = getCurrentPages()
        // 上一个页面
        let prevPage = pages[pages.length - 2]
        // 往上一个页面传递数据，用于刷新上一个页面数据
        prevPage.setData({
          needRefresh: true
        })
        // 返回上一级关闭当前页面
        wx.navigateBack({
          delta: 1
        })
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
    color: #508FFF;
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
  .content {
    padding: 0 30rpx 30rpx;
    border-bottom: 1rpx solid #e1e1e1;
  }
  .box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30rpx;
    border-bottom: 1rpx solid #e1e1e1;
    line-height: 98rpx;
    font-size: 32rpx;
    color: #36507E;
    .value {
      display: flex;
      align-items: center;
      font-size: 24rpx;
      color: #8B8FAB;
      .direct-icon {
        margin-left: 10rpx;
        width: 16rpx;
        height: 30rpx;
      }
      .placeholder {
        color: #999;
      }
    }
  }
}
.hr {
  height: 20rpx;
  background-color: #eeeef8;
}
.submit-btn {
  margin: 60rpx 30rpx 30rpx;
}
</style>


