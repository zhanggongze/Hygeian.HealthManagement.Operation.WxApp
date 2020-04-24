<template>
  <div class="page-wrap">
    <form class="condition-form">
      <div class="form-item">
        <div class="form-content">
          <div class="tag-list">
            <div
              class="tag-item ell"
              v-for="(item, index) in disease"
              :key="index"
            >
              <div>{{item.value}}</div>
              <img
                class="icon-delete"
                @click="selectTag(index)"
                src="/static/images/icon_cancel.png"
                alt
              />
            </div>
            <div class="add-btn" @click="addDiagnosis">+ 新增诊断</div>
          </div>
        </div>
      </div>
      <button class="save-btn primary-btn" hover-class="primary-btn-hover" @click="save">保存</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id: '',
      disease: []
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.id = options.id
    this.disease = wx.getStorageSync('disease') ? wx.getStorageSync('disease').split('、').map(obj => {
      return {
        key: obj,
        value: obj
      }
    }) : []
    wx.removeStorageSync('disease')
  },
  onShow() {
    let pages = getCurrentPages()
    let curPage = pages[pages.length - 1]
    let newDisease = curPage.data.newDisease
    if (newDisease) {
      if (!this.disease.find(obj => obj.value === newDisease.value)) {
        this.disease.push(newDisease)
      }
      delete curPage.data.newDisease
    }
  },
  methods: {
    /**
     * 选中疾病、标签
     */
    selectTag(index) {
      this.disease.splice(index, 1)
    },
    /**
     * 添加诊断
     */
    addDiagnosis() {
      wx.navigateTo({
        url: '/pages/diagnosis/main'
      })
    },
    /**
     * 保存
     */
    save() {
      this.httpFly.post({
        grantId: this.id,
        diagnosises: this.disease.map(obj => obj.value)
      }, 'healthrecord/api/v1/doctor/updateHealthRecordDiagnosises', res => {
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
.condition-form {
  display: block;
  padding: 0 30rpx 60rpx;
  .form-item {
    padding: 30rpx 0 0;
    .label {
      padding-bottom: 30rpx;
      font-size: 36rpx;
      color: $themeColor;
    }
    .tag-list {
      display: flex;
      flex-wrap: wrap;
      .tag-item {
        display: flex;
        align-items: center;
        margin-bottom: 30rpx;
        margin-right: 30rpx;
        padding: 0 0 0 20rpx;
        height: 60rpx;
        background-color: #508fff;
        border-radius: 30rpx;
        font-size: 24rpx;
        color: #fff;
        line-height: 60rpx;
        .icon-delete {
          width: 40rpx;
          height: 40rpx;
        }
      }
      .add-btn {
        margin-bottom: 30rpx;
        margin-right: 30rpx;
        padding: 0 20rpx;
        border: 1rpx dotted rgba(139, 143, 171, 1);
        border-radius: 30rpx;
        line-height: 60rpx;
        font-size: 24rpx;
        color: #8b8fab;
      }
    }
  }
  .save-btn {
    position: absolute;
    bottom: 60rpx;
    left: 30rpx;
    right: 30rpx;
  }
}
</style>