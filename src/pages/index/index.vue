<template>
  <div class="page-index">
    <div class="welcome">{{time}}好！</div>
    <!-- doctor info -->
    <div class="doctor-card">
      <div class="base-info">
        <img class="doctor-img" :src="doctorImg" alt />
        <div class="info-content">
          <div class="name-code">
            <div class="name-level">
              <div class="name">{{name}}</div>
              <div class="level">{{professionalTitle}}</div>
            </div>
            <!-- <img class="code-img" src="/static/images/icon_QRcode.png" alt /> -->
          </div>
          <div class="hospital">{{hospitalName}}</div>
          <!-- <div class="good-at">擅长：先天性心脏手术治疗、冠状动脉搭桥 术及支架术</div> -->
        </div>
      </div>
      <!-- <div class="count-info">
        <div class="count-item">
          <div class="num">{{totalCount}}</div>
          <div class="desc">关注用户</div>
        </div>
        <div class="count-item">
          <div class="num">{{vipCount}}</div>
          <div class="desc">VIP用户</div>
        </div>
      </div> -->
    </div>
    <!-- banner -->
    <!-- <div class="banner">
      <img src="/static/images/index_banner.png" alt />
    </div> -->

    <!-- doctor navigation  -->
    <div class="my-nav">
      <!-- <navigator class="nav-item" url="/pages/my/main">
        <img src="/static/images/icon_task.png" alt />
        <div class="nav-item-box">
          <div>我的主页</div>
          <img src="/static/images/icon_index.png" alt />
        </div>
      </navigator> -->
      <navigator class="nav-item" url="/pages/servingCustomers/main">
        <img src="/static/images/index_medicalrecord.png" alt />
        <div class="nav-item-box">
          <div class="message" v-if="isNew"></div>
          <div>我服务的客户</div>
          <img src="/static/images/icon_index.png" alt />
        </div>
      </navigator>
      <navigator class="nav-item" url="/pages/myCode/main">
        <img src="/static/images/icon_QRcode.png" alt />
        <div class="nav-item-box">
          <div>我的二维码</div>
          <img src="/static/images/icon_index.png" alt />
        </div>
      </navigator>
      <navigator class="nav-item" url="/pages/followUpManager/main">
        <img src="/static/images/index_visit.png" alt />
        <div class="nav-item-box">
          <div>随访管理</div>
          <img src="/static/images/icon_index.png" alt />
        </div>
      </navigator>
      <!-- <navigator class="nav-item" url="/pages/team/main">
        <img src="/static/images/index_team.png" alt />
        <div class="nav-item-box">
          <div>我的团队</div>
          <img src="/static/images/icon_index.png" alt />
        </div>
      </navigator> -->
      <!-- <navigator class="nav-item" url="/pages/serviceOrder/main">
        <img src="/static/images/index_order.png" alt />
        <div class="nav-item-box">
          <div>服务订单</div>
          <img src="/static/images/icon_index.png" alt />
        </div>
      </navigator> -->
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      time: '',
      doctorImg: '/static/images/index_photo.png',
      name: '',
      hospitalName: '',
      professionalTitle: '',
      teamId: '',
      // 患者总数
      totalCount: 0,
      // VIP患者总数
      vipCount: 0,
      isNew: false
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.getTime()
    this.getInfo()
    wx.$app.getMyProfile().then(res => {
      this.$store.commit('updateMyInfo', res.data)
    })
  },
  onShow() {
    // this.getNew()
    // this.getHealthRecordSummary()
  },
  components: {},

  methods: {
    /**
     * 获取患者统计
     */
    getHealthRecordSummary() {
      this.httpFly.post({}, 'healthrecord/api/v1/doctor/getHealthRecordSummary', res => {
        this.totalCount = res.totalGrantedCount
        let vipInfo = res.receiveTypes ? res.receiveTypes.find(obj => obj.receiveType === 'VIP') : {}
        this.vipCount = vipInfo && vipInfo.count ? vipInfo.count : 0
      }, null, true)
    },
    /**
     * 获取医生详情
     */
    getInfo() {
      let myInfo = wx.getStorageSync('myInfo')
      if (myInfo) {
        this.handlerInfo(myInfo)
      } else {
        this.httpFly.post({
          query: `query{
            myMedicalGroup{
              id,
              doctor{
                name,
                headImageUrl,
                hospitalName,
                professionalTitle
              }
            }
          }`
        }, '/medicalgroup/api/graphql', res => {
          if (res && res.data && res.data.myMedicalGroup && res.data.myMedicalGroup.doctor) {
            let myMedicalGroup = res.data.myMedicalGroup
            wx.setStorageSync('myInfo', myMedicalGroup)
            this.handlerInfo(myMedicalGroup)
          }
        })
      }
    },
    handlerInfo(myMedicalGroup) {
      let doctorInfo = myMedicalGroup.doctor
      this.teamId = myMedicalGroup.id
      this.doctorImg = doctorInfo.headImageUrl
      this.name = doctorInfo.name
      this.hospitalName = doctorInfo.hospitalName
      this.professionalTitle = this.dict.professionalDict[doctorInfo.professionalTitle.toUpperCase()]
    },
    /**
     * 获取当前时间
     */
    getTime() {
      let hour = new Date().getHours()
      if (hour < 6) {
        this.time = '凌晨'
      } else if (hour < 9) {
        this.time = '早上'
      } else if (hour < 12) {
        this.time = '上午'
      } else if (hour < 14) {
        this.time = '中午'
      } else if (hour < 17) {
        this.time = '下午'
      } else if (hour < 19) {
        this.time = '傍晚'
      } else if (hour < 22) {
        this.time = '晚上'
      } else {
        this.time = '夜里'
      }
    },
    /**
     * 跳转到我的二维码
     */
    toMyCode() {
      wx.navigateTo({
        url: '/pages/myCode/main'
      })
    }
    // getNew() {
    //   this.httpFly.post({}, 'healthrecord/api/v1/doctor/queryHealthRecords', res => {
    //     this.isNew = res && res.withoutTagsCount && res.withoutTagsCount > 0
    //   }, null, true)
    // }
  },

  created() {
    // let app = getApp()
  }
}
</script>

<style lang="scss" scoped>
.page-index {
  padding: 0 30rpx;
  min-height: 100%;
  background-color: #fafafa;
  .welcome {
    padding: 26rpx 0 0;
    font-size: 44rpx;
    color: $themeColor;
  }
  .doctor-card {
    margin-top: 34rpx;
    padding: 20rpx;
    background-color: #fff;
    box-shadow: 0 0 20rpx 0 rgba(170, 170, 170, 0.3);
    border-radius: 10rpx;
    .base-info {
      display: flex;
      .doctor-img {
        width: 140rpx;
        height: 140rpx;
        border-radius: 50%;
      }
      .info-content {
        flex: 1;
        margin-left: 20rpx;
        font-size: 26rpx;
        color: #8b8fab;
        .name-code {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20rpx 0 16rpx;
          .name-level {
            display: flex;
            align-items: flex-end;
            .name {
              font-size: 36rpx;
              color: $themeColor;
            }
            .level {
              margin-left: 20rpx;
              font-size: 24rpx;
              color: #999;
            }
          }
          .code-img {
            width: 50rpx;
            height: 50rpx;
          }
        }
        .hospital {
          margin-bottom: 10rpx;
        }
        .good-at {
          line-height: 40rpx;
        }
      }
    }
    .count-info {
      display: flex;
      // margin-top: 50rpx;
      padding: 40rpx 0 30rpx;
      font-size: 24rpx;
      color: #8b8fab;
      .count-item {
        flex: 1;
        text-align: center;
        .num {
          margin-bottom: 6rpx;
          font-size: 40rpx;
          color: $themeColor;
        }
      }
    }
  }

  .banner {
    margin-top: 36rpx;
    height: 200rpx;
    border-radius: 10rpx;
    img {
      width: 100%;
      height: 100%;
    }
  }

  .my-nav {
    margin-top: 20rpx;
    .nav-item {
      display: flex;
      align-items: center;
      height: 120rpx;
      img {
        width: 60rpx;
        height: 60rpx;
      }
      .nav-item-box {
        position: relative;
        display: flex;
        flex: 1;
        justify-content: space-between;
        align-items: center;
        margin-left: 30rpx;
        height: 119rpx;
        border-bottom: 1rpx solid #e1e1e1;
        font-size: 32rpx;
        color: $themeColor;
        img {
          width: 16rpx;
          height: 30rpx;
        }
        .message {
          position: absolute;
          top: 34rpx;
          left: 124rpx;
          width: 16rpx;
          height: 16rpx;
          background-color: #ff4c4c;
          border-radius: 50%;
        }
      }
    }
  }
}
</style>
