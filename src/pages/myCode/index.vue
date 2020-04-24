<template>
  <div class="page-wrap">
    <div class="doctor-info">
      <img class="doctor-photo" :src="doctorImg" alt />
      <div class="info">
        <div class="name-level">
          <div class="name">{{name}}</div>
          <div class="level">{{professionalTitle}}</div>
        </div>
        <div class="hostipal ell">
            <div class="name">{{hospitalName}}</div>
            <div class="department">{{departmentName}}</div>
        </div>
      </div>
    </div>
    <div class="code-wrap">
      <div class="title">微信扫一扫，关注我吧</div>
      <img :src="imgcode" alt />
    </div>
  </div>
</template>

<script>
import { envConfig } from '@/env/index'
export default {
  data() {
    return {
      doctorImg: '/static/images/index_photo.png',
      name: '',
      hospitalName: '',
      professionalTitle: '',
      imgcode: '',
      departmentName: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.getInfo()
  },
  methods: {
    /**
         * 获取医生详情
         */
    getInfo() {
      this.httpFly.post({
        query: `query{
          myMedicalGroup{
            id,
            doctor{
              id,
              name,
              headImageUrl,
              hospitalName,
              professionalTitle,
              departmentName
            }
          }
        }`
      }, '/medicalgroup/api/graphql', res => {
        if (res && res.data && res.data.myMedicalGroup && res.data.myMedicalGroup.doctor) {
          let myMedicalGroup = res.data.myMedicalGroup
          let doctorInfo = myMedicalGroup.doctor
          this.doctorImg = doctorInfo.headImageUrl
          this.name = doctorInfo.name
          this.hospitalName = doctorInfo.hospitalName
          this.departmentName = doctorInfo.departmentName
          this.professionalTitle = this.dict.professionalDict[doctorInfo.professionalTitle.toUpperCase()]
          this.imgcode = envConfig.UPLOADURL + `qrcode/wxmp/wx164b87580d38c859/${myMedicalGroup.doctor.id}.png`
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap {
  padding: 50rpx;
  .doctor-info {
    display: flex;
    align-items: center;
    .doctor-photo {
      width: 140rpx;
      height: 140rpx;
      border-radius: 50%;
    }
    .info {
      overflow: hidden;
      flex: 1;
      margin-left: 18rpx;
      font-size: 26rpx;
      color: #8b8fab;
      .name-level {
        display: flex;
        align-items: flex-end;
        .name {
          margin-right: 20rpx;
          font-size: 36rpx;
          color: #36507e;
        }
      }
      .hostipal {
        margin-top: 16rpx;
        display: flex;
        align-items: center;
        .name {
          margin-right: 40rpx;
        }
      }
    }
  }
  .code-wrap {
    margin-top: 66rpx;
    padding: 0 0 40rpx;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 0 20rpx 0 rgba(170, 170, 170, 0.3);
    border-radius: 10rpx;
    text-align: center;
    .title {
      line-height: 116rpx;
      font-size: 36rpx;
      color: #36507e;
    }
    img {
      width: 500rpx;
      height: 500rpx;
    }
  }
}
</style>