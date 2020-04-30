<template>
  <div class="select-wrap" v-if="show">
    <div class="main">
      <div class="label">选择检查结果类型</div>
      <div class="list">
        <div class="item" v-for="(item, index) in list" :key="index" @click="select(item)">{{item.key}}</div>
      </div>
      <div class="cancel-btn" @click="cancel">取消</div>
    </div>
  </div>
</template>

<script>
import Upload from "@/utils/upload"
import { envConfig } from '@/env/index'
export default {
  props: {
    id: {
      type: String
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      list: [{
        key: '图片',
        value: 'image'
      }, {
        key: 'PDF',
        value: 'pdf'
      }, {
        key: '影像',
        value: 'dicomurl'
      }],
      fileList: []
    }
  },
  methods: {
    select(data) {
      let type = data.value
      this.fileList = []
      let mkdir = 'ehr/' + this.id + '/'
      if(type === 'image') {
        this.uploadImage(mkdir)
      } else if(type === 'pdf') {
        this.uploadPdf(mkdir)
      }
    },
    cancel() {
      this.$emit('cancel')
    },
    uploadImage(mkdir) {
      let _self = this;
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
        success: function(res) {
          (async () => {
            let uploadTasks = [];
            for (let file of res.tempFilePaths) {
              uploadTasks.push(_self.createUploadTasks(file, mkdir, 'image'));
            }
            Promise.all(uploadTasks)
              .then(res => {
                _self.$emit('confirm', _self.fileList[0])
                // _self.queryAttachments()
                _self.utils.toast("上传成功");
              })
              .catch(error => {
                _self.utils.toast("网络超时，请重新再试");
              });
          })();
        },
        fail: function(err) {}
      });
    },
    uploadPdf(mkdir) {
      let _self = this;
      wx.chooseMessageFile({
        count: 1,
        type: 'file',
        success (res) {
          if(res.tempFiles && res.tempFiles.length) {
            let file = res.tempFiles[0]
            let filename = file.name
            if(/.pdf$/.test(String(filename).toLowerCase())) {
              let uploadTasks = [];
              uploadTasks.push(_self.createUploadTasks(file.path, mkdir, 'pdf'));
              Promise.all(uploadTasks)
                .then(res => {
                  _self.$emit('confirm', _self.fileList[0])
                  // _self.queryAttachments()
                  _self.utils.toast("上传成功");
                })
                .catch(error => {
                  _self.utils.toast("网络超时，请重新再试");
                });
            } else {
              _self.utils.toast('请上传pdf类型的文件')
            }
          }
        }
      })
    },
    /**
     * 创建上传任务
     */
    createUploadTasks(filepath, mkdir, type) {
      let _self = this;
      return new Promise((resolve, reject) => {
        Upload.uploadFile(filepath, mkdir)
          .then(filepath => {
            resolve()
            _self.fileList.push({
              type: type,
              url: envConfig.FILEBASEURL + "/" + filepath
            });
          })
          .catch(error => {
            reject(error)
          });
      });
    },
  }
}
</script>

<style lang="scss" scoped>
.select-wrap {
  z-index: 999;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba($color: #000000, $alpha: 0.3);
  .main {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    font-size: 32rpx;
    .label {
      border-bottom: 1rpx solid #e1e1e1;
      text-align: center;
      line-height: 116rpx;
      font-size: 40rpx;
      color: #333;
    }
    .list {
      .item {
        border-bottom: 1rpx solid #e1e1e1;
        line-height: 100rpx;
        text-align: center;
        color: #408BF1;
      }
    }
    .cancel-btn {
      line-height: 100rpx;
      text-align: center;
      color: #999;;
    }
  }
}
</style>