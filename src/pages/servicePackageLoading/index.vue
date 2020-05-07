<template>
  <div class="page-wrap">
    <div class="loadEffect">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
    <div class="tip">跳转中...</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      step: 0,
      configList: [],
      // 服务包ID
      servicePackageId: '',
      // 健康档案ID
      healthRecordId: '',
      // 跳转地址
      targetUrl: '',
      // config配置
      uiConfig: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.servicePackageId = options.servicePackageId
    this.healthRecordId = options.healthRecordId
    this.uiConfig = options.uiConfig ? JSON.parse(options.uiConfig) : ''
    if(this.servicePackageId) {
      wx.removeStorageSync('serviceLoadingConfig')
      this.getServiceableServicePackageItems()
    } else {
      if(options.businessServiceID) {
        this.addBusinessServiceInfo(options.businessServiceID)
      }
      if(options.providerIdentity && options.origian === 'provider') {
        this.addProvider(options.providerIdentity, options.providerType, options.providerName)
      }
      if(options.providerIdentity && options.origian === 'businessProvider') {
        this.addBusinessProvider(options.providerIdentity, options.providerType, options.providerName)
      }
    }
  },
  methods: {
    /**
     * 获取指定服务提供者能够提供的指定套餐包下的服务项目列表
     */
    getServiceableServicePackageItems() {
      let param
      if(this.uiConfig) {
        param = this.uiConfig
      } else {
        param = wx.getStorageSync('uiConfig')
        wx.removeStorageSync('uiConfig')
      }
      param.servicePackageId = this.servicePackageId
      this.httpFly.post(param, 'servicepackage/api/v1/partner/ServicePackages/GetServiceableServicePackageItems', res => {
        this.getServicePackage(res.items)
      }, null, true)
    },
    /**
     * 获取服务包详情
     */
    getServicePackage(list) {
      this.httpFly.post({
        id: this.servicePackageId
      }, 'servicepackage/api/v1/partner/ServicePackages/GetServicePackage', res => {
        this.configList = this.configList.concat(res.items.map(obj => {
          let providerInfo = list.find(item => item.servicePackageItemId === obj.id)
          return {
            ItemID: obj.id,
            ServiceID: obj.serviceId,
            ServiceType: obj.serviceType,
            ServiceTotalNumber: obj.totalRounds,
            ServiceUnit: obj.unit,
            ServiceName: obj.name,
            IsRequiredProvider: obj.isProviderMustDesignatedOnSelling,
            ProviderType: providerInfo && providerInfo.provider ? providerInfo.provider.type : '',
            ProviderIdentity: providerInfo && providerInfo.provider ? providerInfo.provider.identity : '',
            ProviderName: providerInfo && providerInfo.provider ? providerInfo.provider.name : '',
            IsRequiredBusinessService: obj.isBusinessIdMustDesignatedOnSelling,
            BusinessProviderType: providerInfo && providerInfo.provider ? providerInfo.provider.type : '',
            BusinessProviderIdentity: providerInfo && providerInfo.provider ? providerInfo.provider.identity : '',
            BusinessProviderName: providerInfo && providerInfo.provider ? providerInfo.provider.name : '',
            showingFee: obj.showingFee,
            sellingFee: obj.sellingFee,
            BusinessServiceID: ''
          }
        }))
        wx.setStorageSync('serviceLoadingConfig', {
          servicePackageId: this.servicePackageId,
          healthRecordId: this.healthRecordId,
          targetUrl: res.targetUrl,
          configList: this.configList,
          step: 0
        })
        if(this.configList.length) {
          this.handleProgress()
        }
      }, null, true)
    },
    /**
     * 进度处理
     */
    handleProgress() {
      let serviceLoadingConfig = wx.getStorageSync('serviceLoadingConfig')
      let configList = serviceLoadingConfig.configList
      let step = serviceLoadingConfig.step
      let targetUrl = serviceLoadingConfig.targetUrl
      let servicePackageId = serviceLoadingConfig.servicePackageId
      let healthRecordId = serviceLoadingConfig.healthRecordId
      if(configList.length === step) {
        let designatedProviders = configList.filter(obj => obj.ProviderIdentity).map(obj => {
          return {
            servicePackageItemId: obj.ItemID,
            provider: {
              type: obj.ProviderType,
              identity: obj.ProviderIdentity,
              name: obj.ProviderName
            }
          }
        })
        let reservedBusinesses = configList.filter(obj => obj.BusinessProviderIdentity).map(obj => {
          return {
            servicePackageItemId: obj.ItemID,
            business: {
              provider: {
                type: obj.BusinessProviderType,
                identity: obj.BusinessProviderIdentity,
                name: obj.BusinessProviderName
              },
              businessId: obj.BusinessServiceID
            }
          }
        })
        if (targetUrl) {
          let targetItemID = targetUrl.split('&').length > 1 ? targetUrl.split('&')[1].match(/{(\S*)\./)[1] : targetUrl.match(/{(\S*)\./)[1]
          if(configList && configList.find(obj => obj.ItemID === targetItemID)) {
            let info = configList.find(obj => obj.ItemID === targetItemID)
            targetUrl = targetUrl
                              .replace(`{${targetItemID}.consultationId}`, info.BusinessServiceID)
                              .replace(`{${targetItemID}.healthRecordId}`, healthRecordId)
                              .replace(`{${targetItemID}.recipientType}`, info.ProviderType)
                              .replace(`{${targetItemID}.recipientIdentity}`, info.ProviderIdentity)
          }
        }
        wx.removeStorageSync('serviceLoadingConfig')
        wx.setStorageSync('contractParam', {
          servicePackageId: servicePackageId,
          healthRecordId: healthRecordId,
          designatedProviders: designatedProviders,
          reservedBusinesses: reservedBusinesses,
          userData: targetUrl
        })
        // 购买下单页
        wx.redirectTo({
          url: '/pages/packagePay/main'
        })
      } else {
        let unitDict = {
          '0': '日',
          '10': '次'
        }
        let currentConfig = configList[step]
        let _self = this
        if (!currentConfig.ProviderIdentity) {
          if (currentConfig.IsRequiredProvider) {
            this.handlerProvider()
          } else {
            wx.showModal({
              content:  currentConfig.ServiceName + '没有提供者，是否进行选择?',
              success (res) {
                if (res.confirm) {
                  _self.handlerProvider()
                } else {
                  _self.handlerBusiness()
                }
              }
            })
          }
        } else {
          this.handlerBusiness()
        }
      }
    },
    handlerProvider() {
      let unitDict = {
        '0': '日',
        '10': '次'
      }
      let serviceLoadingConfig = wx.getStorageSync('serviceLoadingConfig')
      let configList = serviceLoadingConfig.configList
      let step = serviceLoadingConfig.step
      let servicePackageId = serviceLoadingConfig.servicePackageId
      let currentConfig = configList[step]
      wx.redirectTo({
        url: `/pages/selectProvider/main?serviceType=${currentConfig.ServiceType}&origian=provider&servicePackageProvider=${servicePackageId}&servicePackageItemProvider=${currentConfig.ItemID}&serviceName=${currentConfig.ServiceName}&serviceCount=${currentConfig.ServiceTotalNumber + unitDict[String(currentConfig.ServiceUnit)]}`
      })
    },
    handlerBusiness() {
      let unitDict = {
        '0': '日',
        '10': '次'
      }
      let serviceLoadingConfig = wx.getStorageSync('serviceLoadingConfig')
      let configList = serviceLoadingConfig.configList
      let step = serviceLoadingConfig.step
      let servicePackageId = serviceLoadingConfig.servicePackageId
      let healthRecordId = serviceLoadingConfig.healthRecordId
      let currentConfig = configList[step]
      // 要填写业务表单
      if(currentConfig.IsRequiredBusinessService && !currentConfig.BusinessServiceID) {
        if(!currentConfig.BusinessProviderIdentity) {
          // 跳转到选择服务提供者界面
          wx.redirectTo({
            url: `/pages/selectProvider/main?serviceType=${currentConfig.ServiceType}&origian=businessProvider&servicePackageProvider=${servicePackageId}&servicePackageItemProvider=${currentConfig.ItemID}&serviceName=${currentConfig.ServiceName}&serviceCount=${currentConfig.ServiceTotalNumber + unitDict[String(currentConfig.ServiceUnit)]}`
          })
          return
        }
        if(currentConfig.ServiceType === 'ConsultByAsk') {
          wx.redirectTo({
            url: `/pages/illnessDescription/main?doctorID=${currentConfig.BusinessProviderIdentity}&showingFee=${currentConfig.showingFee}&sellingFee=${currentConfig.sellingFee}&healthRecordId=${healthRecordId}&name=${currentConfig.ServiceName}`
          })
        }
        return
      }
      serviceLoadingConfig.step = serviceLoadingConfig.step + 1
      wx.setStorageSync('serviceLoadingConfig', serviceLoadingConfig)
      this.handleProgress()
    },
    /**
     * 填充业务表单信息
     */
    addBusinessServiceInfo(businessServiceID) {
      let serviceLoadingConfig = wx.getStorageSync('serviceLoadingConfig')
      serviceLoadingConfig.configList[serviceLoadingConfig.step]['BusinessServiceID'] = businessServiceID
      wx.setStorageSync('serviceLoadingConfig', serviceLoadingConfig)
      this.handleProgress()
    },
    /**
     * 添加provider
     */
    addProvider(providerIdentity, providerType, providerName) {
      let serviceLoadingConfig = wx.getStorageSync('serviceLoadingConfig')
      serviceLoadingConfig.configList[serviceLoadingConfig.step]['ProviderIdentity'] = providerIdentity
      serviceLoadingConfig.configList[serviceLoadingConfig.step]['ProviderType'] = providerType
      serviceLoadingConfig.configList[serviceLoadingConfig.step]['ProviderName'] = providerName
      serviceLoadingConfig.configList[serviceLoadingConfig.step]['BusinessProviderIdentity'] = providerIdentity
      serviceLoadingConfig.configList[serviceLoadingConfig.step]['BusinessProviderType'] = providerType
      serviceLoadingConfig.configList[serviceLoadingConfig.step]['BusinessProviderName'] = providerName
      wx.setStorageSync('serviceLoadingConfig', serviceLoadingConfig)
      this.handleProgress() 
    },
    /**
     * 添加业务表单provider
     */
    addBusinessProvider(providerIdentity, providerType, providerName) {
      let serviceLoadingConfig = wx.getStorageSync('serviceLoadingConfig')
      serviceLoadingConfig.configList[serviceLoadingConfig.step]['BusinessProviderIdentity'] = providerIdentity
      serviceLoadingConfig.configList[serviceLoadingConfig.step]['BusinessProviderType'] = providerType
      serviceLoadingConfig.configList[serviceLoadingConfig.step]['BusinessProviderName'] = providerName
      wx.setStorageSync('serviceLoadingConfig', serviceLoadingConfig)
      this.handleProgress() 
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap {
  .loadEffect {
    width: 100rpx;
    height: 100rpx;
    position: relative;
    margin: 0 auto;
    margin-top: 48%;
  }
  .loadEffect span {
    display: inline-block;
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background: #666;
    position: absolute;
    -webkit-animation: load 1.04s ease infinite;
  }
  @-webkit-keyframes load {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0.2;
    }
  }
  .loadEffect span:nth-child(1) {
    left: 0;
    top: 50%;
    margin-top: -8rpx;
    -webkit-animation-delay: 0.13s;
  }
  .loadEffect span:nth-child(2) {
    left: 14rpx;
    top: 14rpx;
    -webkit-animation-delay: 0.26s;
  }
  .loadEffect span:nth-child(3) {
    left: 50%;
    top: 0;
    margin-left: -8rpx;
    -webkit-animation-delay: 0.39s;
  }
  .loadEffect span:nth-child(4) {
    top: 14rpx;
    right: 14rpx;
    -webkit-animation-delay: 0.52s;
  }
  .loadEffect span:nth-child(5) {
    right: 0;
    top: 50%;
    margin-top: -8rpx;
    -webkit-animation-delay: 0.65s;
  }
  .loadEffect span:nth-child(6) {
    right: 14rpx;
    bottom: 14rpx;
    -webkit-animation-delay: 0.78s;
  }
  .loadEffect span:nth-child(7) {
    bottom: 0;
    left: 50%;
    margin-left: -8rpx;
    -webkit-animation-delay: 0.91s;
  }
  .loadEffect span:nth-child(8) {
    bottom: 14rpx;
    left: 14rpx;
    -webkit-animation-delay: 1.04s;
  }
  .tip {
    margin-top: 50rpx;
    text-align: center;
    color: #666;
  }
  .logo-img {
    position: absolute;
    bottom: 100rpx;
    left: 50%;
    margin-left: -136rpx;
    width: 272rpx;
    height: 84rpx;
  }
}
</style>