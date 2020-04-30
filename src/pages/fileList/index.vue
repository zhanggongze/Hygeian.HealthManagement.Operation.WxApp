<template>
  <div class="page-wrap">
    <div
      v-if="fileList.length === 0"
      class="empty-data"
    >
      <img class="img" src="/static/images/empty_message.png" alt="">
      <div class="p">暂无记录</div>
    </div>
    <div class="file-list">
      <div class="file-item" v-for="(data, index) in fileList" :key="index">
        <img class="file-img" :src="data.url" alt="" srcset="" @click="previewImg(data.url)">
        <div class="opt-wrap" @click="selectImg(data)">
          <img v-if="!data.selected" class="opt-btn" src="/static/images/photo_normal.png" alt="">
          <img v-else class="opt-btn" src="/static/images/photo_select.png" alt="">
        </div>
      </div>
    </div>
    <div class="confirm-btn" @click="confirm">确定上传({{count}}/{{maxLength}})</div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      fileList: [],
      isEmpty: false,
      maxLength: 0
    }
  },
  computed: {
    count() {
      return this.fileList.filter(obj => obj.selected).length
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.id = options.id
    if (options.maxlen) {
      this.maxLength = parseInt(options.maxlen)
    }
    this.queryAttachments()
  },
  methods: {
    /**
     * 查询附件列表
     */
    queryAttachments() {
      this.httpFly.post({
        healthRecordId: this.id
      }, 'healthrecord/api/v1/partner/queryAttachments', res => {
        this.fileList = this.fileList.concat(res.items.map(obj => {
          obj.time = this.utils.formatTime(obj.uploadDateTime)
          obj.url = obj.fileUrl.indexOf('http') > -1 ? obj.fileUrl : 'https://' + obj.fileUrl
          return obj;
        }))
        this.isEmpty = this.fileList.length === 0
      })
    },
    previewImg(url) {
      wx.previewImage({
        current: url,
        urls: this.fileList.map(obj => obj.url)
      })
    },
    selectImg(data) {
      if (data.selected) {
        this.$set(data, 'selected', false)
      } else {
        if (this.fileList.filter(obj => obj.selected).length < this.maxLength) {
          this.$set(data, 'selected', true)
        }
      }
    },
    confirm() {
      let urls = this.fileList.filter(obj => obj.selected).map(obj => obj.url)
      let pages = getCurrentPages()
      // 上一个页面
      let prevPage = pages[pages.length - 2]
      // 往上一个页面传递数据，用于刷新上一个页面数据
      prevPage.setData({
        urls: urls
      })
      wx.navigateBack({
        delta: 1
      })
    }
  }
};
</script>
<style lang="scss" scoped>
.page-wrap {
  height: 100%;
  background-color: #000;
  .empty-data {
    padding-top: 40%;
  }
  .file-list {
    padding-bottom: 128rpx;
    display: flex;
    flex-wrap: wrap;
    .file-item {
      box-sizing: border-box;
      position: relative;
      width: 25%;
      border: 1rpx solid #000;
      .file-img {
        display: block;
        width: 100%;
        height: 186rpx;
      }
      .opt-wrap {
        position: absolute;
        top: 0;
        right: 0;
        padding: 6rpx;
        .opt-btn {
          display: block;
          width: 54rpx;
          height: 54rpx;
        }
      }
    }
  }
  .confirm-btn {
    position: absolute;
    bottom: 20rpx;
    left: 30rpx;
    right: 30rpx;
    background-color: #00C35F;
    border-radius: 44rpx;
    line-height: 88rpx;
    text-align: center;
    font-size: 32rpx;
    color: #fff;
  }
}
</style>