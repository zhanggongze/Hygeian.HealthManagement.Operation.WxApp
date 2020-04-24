<template>
  <div class="page-patient-archiving">
    <div class="patient-card" v-if="patientInfo">
      <div
        class="surname"
        :style="{'backgroundColor': nameColors[colorIndex]}"
      >{{patientInfo.firstName ? patientInfo.firstName : ''}}</div>
      <div class="base-info">
        <div class="name">{{patientInfo.name}}</div>
        <div class="sex-age">
          <div class="sex">{{patientInfo.gender}}</div>
          <div class="age">{{patientInfo.age}}岁</div>
        </div>
      </div>
    </div>
    <div class="hr"></div>
    <!-- 病情描述 -->
    <div class="condition-wrap">
      <div class="item" @click="editDisease">
        <div class="label">诊断</div>
        <div class="content">
          <div class="value ell">{{disease}}</div>
          <img class="direct-icon" src="/static/images/icon_index.png" alt />
        </div>
      </div>
      <div class="item" @click="editTag">
        <div class="label">标签</div>
        <div class="content">
          <div class="value ell">{{tags}}</div>
          <img class="direct-icon" src="/static/images/icon_index.png" alt />
        </div>
      </div>
      <div class="remark" @click="editRemark" v-if="patientInfo">
        <div class="label">备注</div>
        <div class="content">{{patientInfo.remark ? patientInfo.remark : ''}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id: '',
      nameColors: [],
      colorIndex: 0,
      patientInfo: null,
      tags: '',
      disease: '',
      // 授权id
      grantId: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.nameColors = this.dict.nameColors
    this.id = options.id
    this.colorIndex = wx.getStorageSync('recordsColor')[this.id]
    this.getDetail()
  },
  onShow() {
    let pages = getCurrentPages()
    let curPage = pages[pages.length - 1]
    let prevPage = pages[pages.length - 2]
    if (curPage.data.needRefresh) {
      delete curPage.data.needRefresh
      prevPage.setData({
        needRefresh: true
      })
      this.getDetail()
    }
  },
  methods: {
    /**
     * 获取档案详情
     */
    getDetail() {
      this.httpFly.post({
        id: this.id
      }, 'healthrecord/api/v1/doctor/getHealthRecord', res => {
        this.patientInfo = res
        this.patientInfo.firstName = res.name.substr(0, 1)
        this.patientInfo.age = this.utils.getAge(res.dob)
        this.tags = res.tags.filter(obj => obj.type === 'Custom').map(obj => obj.value).join('、')
        this.disease = res.tags.filter(obj => obj.type === 'Diagnosis').map(obj => obj.value).join('、')
        this.grantId = res.grantId
      })
    },
    /**
     * 编辑标签
     */
    editTag() {
      wx.setStorageSync('tags', this.tags)
      wx.navigateTo({
        url: '/pages/editTag/main?id=' + this.grantId
      })
    },
    /**
     * 编辑备注
     */
    editRemark() {
      wx.setStorageSync('remark', this.patientInfo.remark)
      wx.navigateTo({
        url: '/pages/editRemark/main?id=' + this.grantId
      })
    },
    /**
     * 编辑诊断
     */
    editDisease() {
      wx.setStorageSync('disease', this.disease)
      wx.navigateTo({
        url: '/pages/updateDiagnosis/main?id=' + this.grantId
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
.hr {
  height: 20rpx;
  background-color: #eeeef8;
}
.condition-wrap {
  .item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30rpx;
    height: 100rpx;
    border-bottom: 1rpx solid #e1e1e1;
    .label {
      font-size: 32rpx;
      color: $themeColor;
    }
    .content {
      display: flex;
      justify-content: flex-end;
      flex: 1;
      .value {
        max-width: 400rpx;
        font-size: 24rpx;
        color: #8b8fab;
      }
      .direct-icon {
        margin-left: 10rpx;
        width: 16rpx;
        height: 30rpx;
      }
    }
  }
  .remark {
    padding: 26rpx 30rpx;
    .label {
      font-size: 32rpx;
      color: $themeColor;
    }
    .content {
      padding: 30rpx;
      margin-top: 20rpx;
      height: 300rpx;
      background: rgba(235, 235, 246, 1);
      border-radius: 10rpx;
    }
  }
}
</style>
