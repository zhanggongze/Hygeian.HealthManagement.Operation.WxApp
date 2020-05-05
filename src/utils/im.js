function loginIM(self) {
  return new Promise((resolve, reject) => {
    self.httpFly.post({}, 'medicalgroup/api/v1/Doctor/GetIMUserSign', res => {
      if (res) {
        wx.$app.login({
          userID: res.userID,
          userSig: res.userSig
        }).then(() => {
          wx.showLoading({
            title: '登录成功'
          })
          resolve()
        }).catch(error => {
          self.utils.toast('咨询不可用')
          setTimeout(() => {
            toTargetUrl()
          }, 1000)
          reject(error)
        })
      }
    })
  })
}

function toTargetUrl() {
  let targetUrl = wx.getStorageSync('targetUrl')
  if (targetUrl) {
    wx.removeStorageSync('targetUrl')
    wx.navigateTo({
      url: targetUrl
    })
  } else {
    wx.reLaunch({
      url: '/pages/index/main'
    })
  }
}

export default {
  loginIM
}
