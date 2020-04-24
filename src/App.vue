<script>
export default {
  onLaunch (data) {
    wx.setStorageSync('TBB_Session', this.utils.uuid(32, 16))
    if (!wx.getStorageSync('TBB_ClientID')) {
      wx.setStorageSync('TBB_ClientID', this.utils.uuid(32, 16))
    }
    // 微信版本
    wx.getSystemInfo({
      success (res) {
        wx.setStorageSync('TBB_APP_Version', res.version)
      }
    })
  },
  globalData: {
    isImLogin: false
  }
}
</script>

<style>

</style>
