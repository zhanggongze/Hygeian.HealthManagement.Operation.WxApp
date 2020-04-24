<template>
  <div class="page-wrap">
    <textarea class="textarea" placeholder="请输入备注" v-model="remark"></textarea>
    <button class="save-btn primary-btn" hover-class="primary-btn-hover" @click="save">保存</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id: '',
      remark: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.id = options.id
    this.remark = wx.getStorageSync('remark') ? wx.getStorageSync('remark') : ''
    wx.removeStorageSync('remark')
  },
  methods: {
    /**
     * 保存
     */
    save() {
      this.httpFly.post({
        grantId: this.id,
        remark: this.remark
      }, 'healthrecord/api/v1/doctor/updateHealthRecordRemark', res => {
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
.page-wrap {
  padding: 30rpx;
  .textarea {
  }
  .save-btn {
    position: fixed;
    bottom: 60rpx;
    left: 30rpx;
    right: 30rpx;
  }
}
</style>