<template>
  <div class="page-wrap">
    <div class="header">
      <div class="name">{{serviceName}}</div>
      <div class="count">{{serviceCount}}</div>
    </div>
    <div class="doctor-list" v-if="list && list.length">
      <scroll-view class="list" scroll-y="true" @scrolltolower="scrolltolower">
        <div class="item" v-for="(data, index) in list" :key="index" @click="selectProvider(data)">
          <div class="doctor-info">
            <img class="doctor-img" :src="data.headImageUrl" />
            <div class="base-info">
              <div class="name-prefessional">
                <div class="name">{{data.name}}</div>
                <div class="prefessional">{{data.professionalTitle}}</div>
              </div>
              <div class="hospital-depart">
                <div class="hospital">{{data.hospitalName}}</div>
                <div class="depart">{{data.departmentName}}</div>
              </div>
            </div>            
          </div>
          <div class="good-at line-clamp2">擅长：{{data.skilful}}</div>
        </div>
      </scroll-view>
    </div>    
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 来源类型（businessProvider表示业务表单中的provider）
      origian: '',
      // 套餐类型
      serviceType: '',
      // 套餐ID
      servicePackageProvider: '',
      // 套餐itemid
      servicePackageItemProvider: '',
      // 套餐项名称
      serviceName: '',
      // 套餐项次数
      serviceCount: 0,
      // 列表数据
      list: [],
      // 当前页码
      pageIndex: 0,
      // 总记录数
      totalCount: 0,
      // 服务提供者类型
      providerType: '',
      // 是否是消费
      isConsume: false,
      // 健康档案ID
      healthRecordId: '',
      customerContractId: '',
      customerContractItemId: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.origian = options.origian
    this.serviceType = options.serviceType
    this.servicePackageProvider = options.servicePackageProvider
    this.servicePackageItemProvider = options.servicePackageItemProvider
    this.serviceName = options.serviceName
    this.serviceCount = options.serviceCount
    this.isConsume = options.isConsume && options.isConsume == 1 ? true : false
    this.customerContractItemId = options.customerContractItemId
    this.customerContractId = options.customerContractId
    this.healthRecordId = options.healthRecordId
    if(this.serviceType === 'ConsultByAsk' || this.serviceType === 'IM') {
      this.providerType = 'Doctor'
      this.getDoctorList()
    } else {
      this.serviceType = 'Institution'
      this.getInstitutionsList()
    }
  },
  methods: {
    getDoctorList() {
      let queryString = `servicePackageProvider:"${this.servicePackageProvider}",servicePackageItemProvider:"${this.servicePackageItemProvider}"`
      let queryStringPage = queryString + `,offset:${this.pageIndex*10},limit:10`
      this.httpFly.post({
        query: `query{
          doctors(${queryStringPage}) {
            id,
            name,
            headImageUrl,
            hospitalName,
            professionalTitle,
            departmentName,
            skilful
          }
          doctorsCount(${queryString})
        }`
      }, '/medicalgroup/api/graphql', res => {
        if(res && res.data && res.data.doctors) {
          let list = res.data.doctors.map(obj => {
            obj.professionalTitle = this.dict.professionalDict[obj.professionalTitle.toUpperCase()]
            return obj
          })
          this.list = this.list.concat(list)
          this.totalCount = res.data.doctorsCount
        }
      })
    },
    getInstitutionsList() {
      let queryString = `servicePackageProvider:"${this.servicePackageProvider}",servicePackageItemProvider:"${this.servicePackageItemProvider}"`
      let queryStringPage = queryString + `,offset:${this.pageIndex*10},limit:10`
      this.httpFly.post({
        query: `query{
          institutions(${queryStringPage}) {
            id,
            fullName,
            address
          }
          institutionsCount(${queryString})
        }`
      }, '/medicalgroup/api/graphql', res => {
        if(res && res.data && res.data.institutions) {
          let list = res.data.institutions.map(obj => {
            obj.name = obj.fullName
            return obj
          })
          this.list = this.list.concat(list)
          this.totalCount = res.data.institutionsCount
        }
      })
    },
    /**
     * 下拉加载更多
     */
    scrolltolower() {
      if (this.list.length && this.list.length < this.totalCount) {
        this.pageIndex++
        if(this.providerType === 'Doctor') {
          this.getDoctorList()
        } else if (his.providerType === 'Institution') {
          this.getInstitutionsList()
        }
      }
    },
    /**
     * 选provider
     */
    selectProvider(data) {
      if(this.isConsume && this.serviceType === 'ConsultByAsk') {
        wx.redirectTo({
          url: `/pages/illnessDescription/main?doctorID=${data.id}&healthRecordId=${this.healthRecordId}&customerContractId=${this.customerContractId}&customerContractItemId=${this.customerContractItemId}&name=${this.serviceName}`
        })
      } else {
        wx.redirectTo({
          url: `/pages/servicePackageLoading/main?origian=${this.origian}&providerType=${this.providerType}&providerIdentity=${data.id}&providerName=${data.name}`
        })
      }
      
      // let pages = getCurrentPages()
      // // 上一个页面
      // let prevPage = pages[pages.length - 2]
      // // 往上一个页面传递数据，用于刷新上一个页面数据
      // prevPage.setData({
      //   origian: this.origian,
      //   providerType: this.providerType,
      //   providerIdentity: data.id,
      //   providerName: data.name
      // })
      // // 返回上一级关闭当前页面
      // wx.navigateBack({
      //   delta: 1
      // })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-wrap {
  background-color: #f5f5f5;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30rpx;
    height: 120rpx;
    background-color: #fff;
    font-size: 40rpx;
    color: #333;
    .count {
      font-size: 48rpx;
      color: #408BF1;
    }
  }
  .doctor-list {
    padding: 30rpx;
    height: calc(100vh - 180rpx);
    .list {
      height: 100%;
      .item {
        margin-bottom: 30rpx;
        padding: 30rpx 20rpx;
        background:rgba(255,255,255,1);
        border-radius:20rpx;
        font-size: 28rpx;
        color: #999;
        &:last-child {
          margin-bottom: 0;
        }
        .doctor-info {
          display: flex;
          align-items: center;
          .doctor-img {
            display: block;
            width: 140rpx;
            height: 140rpx;
            border-radius: 50%;
          }
          .base-info {
            flex: 1;
            margin-left: 24rpx;
            .name-prefessional{
              display: flex;
              align-items: flex-end;
              .name {
                margin-right: 20rpx;
                font-size: 40rpx;
                color: #333;
              }
            }
            .hospital-depart {
              display: flex;
              margin-top: 10rpx;
              .hospital {
                margin-right: 20rpx;
              }
            }
          }
        }
        .good-at {
          margin-top: 24rpx;
        }
      }
    }
  }
}
</style>