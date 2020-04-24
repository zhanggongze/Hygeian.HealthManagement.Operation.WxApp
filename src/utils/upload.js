import COS from 'cos-wx-sdk-v5'
import { envConfig } from '@/env/index'
let cos = new COS({
  SecretId: envConfig.COSSECRETID,
  SecretKey: envConfig.COSSECRETKEY
})

export function upload(mkdir) {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        uploadFile(res.tempFilePaths[0], mkdir).then(filepath => {
          resolve(filepath)
        }).catch(error => {
          reject(error)
        })
      },
      fail: function (err) {
        console.log(err)
      }
    })
  })
}

function uploadFile(filePath, mkdir) {
  return new Promise((resolve, reject) => {
    var filename = filePath.substr(filePath.lastIndexOf('/') + 1)
    cos.postObject({
      Bucket: envConfig.COSBUCKET,
      Region: envConfig.COSREGION,
      Key: mkdir + filename,
      FilePath: filePath,
      onProgress: function (info) {
        // console.log(JSON.stringify(info));
      }
    }, function (err, data) {
      if (err) {
        reject(err)
        wx.showToast({
          title: '上传失败',
          icon: 'none',
          duration: 1000
        })
      } else {
        // resolve(data.Location)
        resolve(mkdir + filename)
      }
    })
  })
}

export default {
  upload,
  uploadFile
}
