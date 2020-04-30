<template>
  <div class="page-wrap">
    <div class="page-wrap">
      <div class="top">
        <div class="package-name">{{name}}</div>
        <div class="patient-info">
          <div class="base-info">
            <img class="img" v-if="patientGender==='女'" src="/static/images/photo_woman.png" alt />
            <img class="img" v-else src="/static/images/photo_man.png" alt />
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
                  <img class="img" :src="data.provider.info.headImageUrl" alt />
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
      <div class="footer" @click="toServiceUrl">下一步</div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 套餐ID
      id: '',
      // 健康档案ID
      healthRecordId: '',
      // 套餐名称
      name: '',
      price: '',
      patientName: '',
      patientGender: '',
      patientAge: '',
      // 项目列表
      list: [],
      // 是否是消费
      isConsume: false,
      // 服务类型
      serviceType: '',
      // 提供者ID
      identity: '',
      // 服务项名称
      serviceName: '',
      // 服务次数
      serviceCount: '',
      // 套餐合同ID
      customerContractId: '',
      // 套餐项合同ID
      customerContractItemId: '',
      // 套餐项ID
      servicePackageItemId: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.id = options.id
    this.healthRecordId = options.healthRecordId
    this.isConsume = options.isConsume && options.isConsume == 1 ? true : false
    this.serviceType = options.serviceType
    this.identity = options.identity
    this.customerContractId = options.customerContractId
    this.customerContractItemId = options.customerContractItemId
    this.serviceName = options.serviceName
    this.serviceCount = options.serviceCount
    this.servicePackageItemId = options.servicePackageItemId
    this.getServicePackage()
    this.getHeathRecord()
  },
  methods: {
    getServicePackage() {
      this.httpFly.post({
        id: this.id
      }, 'servicepackage/api/v1/partner/ServicePackages/GetServicePackage', res => {
        let unitDict = {
          '0': '日',
          "10": '次'
        }
        let list = res.items.map(obj => {
          obj.count = obj.totalRounds * obj.unitsInRound + unitDict[obj.unit]
          return obj
        })
        this.name = res.name
        this.price = res.sellingFee
        this.list = this.list.concat(list)
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
    /**
     * 跳转到loading界面
     */
    toServiceUrl() {
      if(this.isConsume) {
        if(this.identity) {
          wx.redirectTo({
            url: `/pages/illnessDescription/main?doctorID=${this.identity}&healthRecordId=${this.healthRecordId}&customerContractId=${this.customerContractId}&customerContractItemId=${this.customerContractItemId}`
          })
        } else {
          wx.redirectTo({
            url: `/pages/selectProvider/main?isConsume=1&serviceType=${this.serviceType}&serviceName=${this.serviceName}&serviceCount=${this.serviceCount}&healthRecordId=${this.healthRecordId}&servicePackageProvider=${this.id}&servicePackageItemProvider=${this.servicePackageItemId}&customerContractId=${this.customerContractId}&customerContractItemId=${this.customerContractItemId}`
          })
        }
      } else {
        wx.setStorageSync('uiConfig', {
          designatedProviders: []
        })
        wx.redirectTo({
          url: `/pages/servicePackageLoading/main?servicePackageId=${this.id}&healthRecordId=${this.healthRecordId}`
        })
      }
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
    background: linear-gradient(
      -45deg,
      rgba(34, 172, 251, 1),
      rgba(64, 139, 241, 1)
    );
    text-align: center;
    line-height: 100rpx;
    font-size: 32rpx;
    color: #fff;
  }
}
</style>