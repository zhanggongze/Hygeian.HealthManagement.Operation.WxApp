<template>
  <div class="page-wrap">
    <div class="top">
      <div class="package-name">{{name}}</div>
      <div class="patient-info">
        <div class="base-info">
          <img class="img" v-if="patientGender==='女'" src="/static/images/photo_woman.png" alt="">
          <img class="img" v-else src="/static/images/photo_man.png" alt="">
          <div class="info">
            <div class="patient-name">{{patientName}}</div>
          </div>
        </div>
        <div class="gender-age">
          <div class="gender">{{patientGender}}</div>
          <div class="age">{{patientAge}}岁</div>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="title">服务项目</div>
      <div class="list">
        <div class="item" v-for="(data, index) in list" :key="index">
          <div class="item-name">{{data.name}}</div>
          <div class="value">
            <div class="provider" v-if="data.provider">
              <div class="count">{{data.count}}</div>
              <div class="provider-info" v-if="data.provider.info">
                <img class="img" :src="data.provider.info.headImageUrl" alt="" />
                <div class="name-professional">
                  <div class="provider-name">{{data.provider.info.name}}</div>
                  <div class="provider-professional">{{data.provider.info.professionalTitle}}</div>
                </div>
              </div>
            </div>
            <div v-else>{{data.count}}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer" @click="pay">确认赠送</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      contractParam: null,
      // 健康档案ID
      healthRecordId: '',
      // 套餐ID
      servicePackageId: '',
      // 套餐名称
      name: '',
      // 套餐价格
      price: '',
      patientName: '',
      patientGender: '',
      familyRelation: '',
      patientAge: '',
      // 项目列表
      list: []
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.contractParam = wx.getStorageSync('contractParam')
    wx.removeStorageSync('contractParam')
    this.healthRecordId = this.contractParam.healthRecordId
    this.servicePackageId = this.contractParam.servicePackageId
    this.getHeathRecord()
    this.getServicePackage()
  },
  methods: {
    getServicePackage() {
      this.httpFly.post({
        id: this.servicePackageId
      }, 'servicepackage/api/v1/partner/ServicePackages/GetServicePackage', res => {
        let unitDict = {
          '0': '日',
          "10": '次'
        }
        let list = res.items.map(obj => {
          obj.count = obj.totalRounds * obj.unitsInRound + unitDict[obj.unit]
          let provider = this.contractParam.designatedProviders.find(item => item.servicePackageItemId === obj.id)
          obj.provider = provider ? {
            type: provider.provider.type,
            identity: provider.provider.identity
          } : null
          return obj
        })
        let doctorIDs = list.filter(obj => obj.provider && obj.provider.type === 'Doctor').map(obj => obj.provider.identity)
        this.handleData(list, doctorIDs)
        this.name = res.name
        this.price = res.sellingFee
      })
    },
    getHeathRecord() {
      this.httpFly.post({
        id: this.healthRecordId
      }, 'healthrecord/api/v1/partner/getHealthRecord', res => {
        this.patientName = res.name;
        this.patientGender = res.gender;
        this.patientAge = new Date().getFullYear() - new Date(res.dob).getFullYear()
      })
    },
    handleData(list, doctorIDs) {
      if(doctorIDs.length) {
        this.httpFly.post({
        query: `query{
          doctors(doctorIDs:${JSON.stringify(doctorIDs)}) {
            id,
            name,
            headImageUrl,
            professionalTitle
          }
        }`
      }, '/medicalgroup/api/graphql', res => {
        if(res && res.data && res.data.doctors) {
          let doctorObj = res.data.doctors.reduce((a, b) => {
            if(!a[b['id']]) {
              b.professionalTitle = this.dict.professionalDict[b.professionalTitle.toUpperCase()]
              a[b['id']] = b
            }
            return a
          }, {})
          this.list = this.list.concat(list.map(obj => {
            obj.provider.info = doctorObj[obj.provider.identity]
            return obj
          }))
        } else {
          this.list = this.list.concat(list)
        }
      })
      } else {
        this.list = this.list.concat(list)
      }
    },
    pay() {
      this.httpFly.post(this.contractParam, '/servicepackage/api/v1/partner/CustomerContracts/GiftServicePackage', res => {
        wx.redirectTo({
          url: "/pages/orderPay/main?orderId=" + res.id
        });
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap {
  box-sizing: border-box;
  padding-bottom: 130rpx;
  height: 100%;
  background-color: #f5f5f5;
  .top {
    padding: 0 30rpx;
    background-color: #fff;
    .package-name {
      padding: 22rpx 0 30rpx;
      font-size: 40rpx;
      color: #333;
    }
    .patient-info {
      display: flex;
      align-items: flex-end;
      padding-bottom: 16rpx;
      .base-info {
        display: flex;
        align-items: center;
        color: #333;
        .img {
          width: 60rpx;
          height: 60rpx;
        }
        .info {
          display: flex;
          align-items: flex-end;
          font-size: 28rpx;
          .patient-name {
            margin: 0 0 0 10rpx;
            font-size: 36rpx;
          }
        }
      }
      .gender-age {
        display: flex;
        align-items: center;
        font-size: 28rpx;
        color: #999;
        .gender {
          margin: 0 28rpx;
        }        
      }
    }
  }
  .content {
    margin: 30rpx 0 150rpx;
    padding: 0 30rpx;
    background-color: #fff;
    .title {
      padding: 20rpx 0;
      border-bottom: 1rpx solid #e1e1e1;
      font-size: 36rpx;
      color: #333;
    }
    .list {
      .item {
        display: flex;
        justify-content: space-between;
        padding: 30rpx 0;
        border-bottom: 1rpx solid #e1e1e1;
        font-size: 32rpx;
        color: #999;
        .value {
          text-align: right;
          color: #333;
          .provider {
            .count {
              font-size: 32rpx;
            }
            .provider-info {
              margin-top: 20rpx;
              display: flex;
              align-items: center;
              .img {
                display: block;
                width: 40rpx;
                height: 40rpx;
                border-radius: 50%;
              }
              .name-professional {
                display: flex;
                align-items: flex-end;
                .provider-name {
                  margin: 0 10rpx;
                  font-size: 32rpx;
                }
                .provider-professional {
                  font-size: 28rpx;
                  color: #999;
                }
              }
            }
          }
        }
      }
    }
  }
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100rpx;
    background:linear-gradient(-45deg,rgba(34,172,251,1),rgba(64,139,241,1));
    text-align: center;
    line-height: 100rpx;
    font-size: 32rpx;
    color: #fff;
  }
}
</style>