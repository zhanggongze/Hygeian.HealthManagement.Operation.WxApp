<template>
  <div class="page-wrap">
    <div class="introduction">
      <div class="base-info">
        <div class="img-wrap">
          <img class="img" :src="doctorImg" alt />
          <img class="icon-special" src="/static/images/icon_specialist.png" alt />
        </div>
        <div class="info">
          <div class="name-level">
            <div class="name">{{name}}</div>
            <div class="level">{{professionalTitle}}</div>
          </div>
          <div class="hostipal">
            <div class="name">{{hospitalName}}</div>
            <div class="department">{{departmentName}}</div>
          </div>
        </div>
      </div>
      <div class="good-at">{{introduce}}</div>
    </div>
    <!-- <div class="member">
      <div class="title">专家组成员</div>
      <div class="member-list">
        <div class="member-item">
          <div class="base-info">
            <img class="img" src="/static/images/index_photo.png" alt />
            <div class="info">
              <div class="name-level">
                <div class="name">李强</div>
                <div class="level">副主任医师</div>
              </div>
              <div class="hostipal">
                <div class="name">南昌大学第一附属医院</div>
                <div class="department">心血管科</div>
              </div>
            </div>
          </div>
        </div>
        <div class="member-item">
          <div class="base-info">
            <img class="img" src="/static/images/index_photo.png" alt />
            <div class="info">
              <div class="name-level">
                <div class="name">李强</div>
                <div class="level">副主任医师</div>
              </div>
              <div class="hostipal">
                <div class="name">南昌大学第一附属医院</div>
                <div class="department">心血管科</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> -->
    <div class="service">
      <div class="title">咨询服务</div>
      <div class="service-card">
        <div class="tag">限时免费</div>
        <div class="top">
          <img class="img" src="/static/images/icon_contact.png" alt />
          <div>图文咨询</div>
        </div>
        <div class="content">通过图片、文字咨询医生，咨询有效时长24小时，咨询期间不限交流次数。</div>
        <div class="price">
          <div class="new-price">￥0.00元/天</div>
          <div class="old-price">15元/天</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      doctorImg: '/static/images/index_photo.png',
      name: '',
      hospitalName: '',
      professionalTitle: '',
      departmentName: '',
      introduce: '',
      teamId: ''
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
              name,
              headImageUrl,
              hospitalName,
              departmentName,
              introduce,
              professionalTitle
            }
          }
        }`
      }, '/medicalgroup/api/graphql', res => {
        if (res && res.data && res.data.myMedicalGroup && res.data.myMedicalGroup.doctor) {
          let myMedicalGroup = res.data.myMedicalGroup
          let doctorInfo = myMedicalGroup.doctor
          this.teamId = myMedicalGroup.id
          this.doctorImg = doctorInfo.headImageUrl
          this.name = doctorInfo.name
          this.hospitalName = doctorInfo.hospitalName
          this.introduce = doctorInfo.introduce
          this.departmentName = doctorInfo.departmentName
          this.professionalTitle = this.dict.professionalDict[doctorInfo.professionalTitle.toUpperCase()]
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap {
  background-color: #f5f5f5;
  min-height: 100%;
  .introduction {
    margin-bottom: 20rpx;
    padding: 24rpx 30rpx 30rpx;
    background-color: #fff;
    .base-info {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #999;
      .img-wrap {
        position: relative;
        .img {
          width: 140rpx;
          height: 140rpx;
          border-radius: 50%;
        }
        .icon-special {
          position: absolute;
          bottom: -8rpx;
          left: 9rpx;
          width: 122rpx;
          height: 31rpx;
        }
      }
      .info {
        flex: 1;
        margin-left: 20rpx;
        .name-level {
          display: flex;
          align-items: center;
          margin-top: 6rpx;
          .name {
            margin-right: 28rpx;
            font-size: 36rpx;
            color: #333;
          }
        }
        .hostipal {
          margin-top: 22rpx;
          display: flex;
          align-items: center;
          .name {
            margin-right: 40rpx;
          }
        }
      }
    }
    .good-at {
      margin-top: 30rpx;
      line-height: 40rpx;
      font-size: 26rpx;
      color: #999;
    }
  }
  .member {
    margin-bottom: 20rpx;
    padding: 26rpx 30rpx 0;
    background-color: #fff;
    .title {
      font-size: 36rpx;
      color: #000;
    }
    .member-list {
      .member-item {
        padding: 30rpx 0 20rpx;
        &:last-child {
          border-bottom: none;
        }
        .base-info {
          display: flex;
          align-items: center;
          font-size: 26rpx;
          color: #999;
          .img {
            width: 100rpx;
            height: 100rpx;
          }
          .info {
            flex: 1;
            margin-left: 20rpx;
            .name-level {
              display: flex;
              align-items: center;
              .name {
                margin-right: 28rpx;
                font-size: 32rpx;
                color: #333;
              }
            }
            .hostipal {
              margin-top: 6rpx;
              display: flex;
              align-items: center;
              .name {
                margin-right: 40rpx;
              }
            }
          }
        }
      }
    }
  }
  .service {
    padding: 10rpx 30rpx 60rpx;
    .title {
      line-height: 98rpx;
      font-size: 36rpx;
      color: #333;
    }
    .service-card {
      overflow: hidden;
      position: relative;
      padding: 30rpx;
      background-color: #fff;
      box-shadow: 0 0 15rpx 0 rgba(153, 153, 153, 0.35);
      border-radius: 10rpx;
      .tag {
        position: absolute;
        right: -54rpx;
        top: 26rpx;
        padding: 10rpx 0;
        width: 200rpx;
        transform: rotate(45deg);
        background: linear-gradient(
          -45deg,
          rgba(227, 28, 122, 1),
          rgba(251, 107, 57, 1)
        );
        box-shadow: 0 0 15rpx 0 rgba(255, 0, 0, 0.35);
        text-align: center;
        font-size: 22rpx;
        color: #fff;
      }
      .top {
        display: flex;
        align-items: center;
        font-size: 32rpx;
        color: #333;
        .img {
          margin-right: 30rpx;
          width: 54rpx;
          height: 54rpx;
        }
      }
      .content {
        margin-top: 26rpx;
        font-size: 26rpx;
        color: #999;
        line-height: 40rpx;
      }
      .price {
        display: flex;
        align-items: flex-end;
        margin-top: 26rpx;
        .new-price {
          font-size: 40rpx;
          color: #ff6900;
        }
        .old-price {
          margin-left: 16rpx;
          font-size: 26rpx;
          color: #999;
          text-decoration: line-through;
        }
      }
    }
  }
}
</style>