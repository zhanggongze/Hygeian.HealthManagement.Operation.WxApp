<template>
  <div class="page-wrap">
    <div class="list" v-if="list.length">
      <div class="item" v-for="(data, index) in list" :key="index" @click="toDetail(data)">
        <div class="info">
          <div class="name-tag">
            <div class="name">{{data.examinationName}}</div>
            <div class="tag">{{data.category}}</div>
          </div>
          <div class="content">
            <div class="label">检查人：{{data.patientName + '(' + (data.patientGender ? data.patientGender : '') + ' ' + (data.patientAge ? data.patientAge + '岁' : '') + ')'}}</div>
            <div class="lavel">检查编码：{{data.examinationNo}}</div>
            <div class="lavel">检查日期：{{data.examinationDateTime}}</div>
            <div class="lavel">检查机构：{{data.institutionName}}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="empty-data" v-else>
      <img class="img" src="/static/images/empty_message.png" alt />
      <div class="p">暂无记录</div>
    </div>
    <!-- <div class="primary-btn add-btn" @click="addDicom">手动添加</div> -->
    <textarea-dialog label="手动添加" placeholder="请输入影像地址" v-model="dicomUrl" :show="showUpload" @close="showUpload=false" @confirm="upload"></textarea-dialog>
  </div>
</template>
<script>
import textareaDialog from '@/components/textarea-dialog'
export default {
  components: {
    textareaDialog
  },
  data() {
    return {
      // 卫生事件列表
      list: [],
      showUpload: false,
      dicomUrl: '',
      hospitalID: '',
      name: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.hospitalID = options.hospitalID
    this.name = options.name
    this.getList()
  },
  methods: {
    /**
     * 搜索一脉影像报告
     */
    getList() {
      this.list = []
      this.httpFly.post({
        name: this.name,
        locationCode: wx.getStorageSync('activeInfo')['region'],
        hospitalID: this.hospitalID
      }, 'servicepackage/api/v1/partner/RimagExaminationResults/QueryExaminationResults', res => {
        this.list = this.list.concat(res.items.map(obj => {
          obj.examinationDateTime = this.utils.formatTime(obj.examinationDateTime, 'yyyy-mm-dd')
          return obj
        }))
      })
    },
    addDicom() {
      this.showUpload = true
    },
    /**
     * 跳转到上传附件界面
     */
    toDetail(data) {
      this.httpFly.post({
        examinationResultID: data.id
      }, 'servicepackage/api/v1/partner/RimagExaminationResults/ArchiveExaminationResult', res => {
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2]
        prevPage.setData({
          file: {
            type: data.category === '影像' ? 'dicomurl' : 'pdf',
            url: data.url
          }
        })
        wx.navigateBack({
          delta: 1
        });
      })
    },
    upload() {
      if(!this.dicomUrl) {
        this.utils.toast('请输入影像地址')
        return
      }
      this.showUpload = false
      let pages = getCurrentPages();
      let prePage = pages[pages.length - 2]
      prePage.setData({
        dicomUrl: this.dicomUrl
      })
      wx.navigateBack({
        delta: 1
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.page-wrap {
  box-sizing: border-box;
  padding-bottom: 30rpx;
  min-height: 100%;
  background-color: #f5f5f5;
  .list {
    padding: 30rpx 30rpx 0;
    .item {
      margin-bottom: 30rpx;
      padding: 0 30rpx;
      background-color: #fff;
      border-radius: 10rpx;
      font-size: 28rpx;
      color: #333;
      &:last-child {
        margin-bottom: 0;
      }
      .info {
        padding: 30rpx 0 10rpx;
        .name-tag {
          display: flex;
          justify-content: space-between;
          .name {
            flex: 1;
            font-size: 40rpx;
          }
          .tag {
            margin-left: 30rpx;
            line-height: 56rpx;
            font-size: 30rpx;
            color: #408BF1;
          }
        }
        .content {
          padding: 20rpx 0 10rpx;
          color: #999;
          .label {
            line-height: 44rpx;
          }
        }
      }
    }
  }
  .empty-data {
    padding-top: 40%;
  }
  .add-btn {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    line-height: 100rpx;
    border-radius: 0;
  }
}
</style>