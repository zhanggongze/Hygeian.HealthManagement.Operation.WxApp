<template>
  <div class="page-wrap">
    <div class="top">
      <div class="title-status">
        <div class="title">{{name}}</div>
        <div class="status" v-if="progress == 400">收集完成</div>
        <div class="status" v-else>收集中</div>
      </div>
      <div class="info">
        <div class="item">
          <div class="label">检查人</div>
          <div class="value">
            {{patientName}}
            <span class="gender">{{patientGender}}</span>
            {{patientAge}}岁
          </div>
        </div>
        <div class="item">
          <div class="label">检查时间</div>
          <div class="value">{{occurrenceDateTime}}</div>
        </div>
        <div class="item">
          <div class="label">检查机构</div>
          <div class="value">{{institution}}</div>
        </div>
      </div>
    </div>
    <div class="content">
      <div class="add-btn" @click="showUpload=true">+添加检查结果</div>
      <div class="file-list">
        <div
          class="file-item"
          v-for="(data, index) in fileList"
          :key="index"
          @click="preivewFile(data)"
        >
          <img v-if="data.fileType === 'image'" src="/static/images/file_image.png" alt />
          <img v-if="data.fileType === 'pdf'" src="/static/images/file_pdf.png" alt />
          <img v-if="data.fileType === 'dicomurl'" src="/static/images/file_xray.png" alt />
        </div>
      </div>
      <div class="primary-btn complete-btn" v-if="progress !== 400 && type !== 'archive'" @click="complete">收集完成</div>
      <div class="primary-btn complete-btn" v-if="type ==='archive'" @click="sendMessage">推送通知</div>
    </div>
    <select-list
      :show="showUpload"
      :id="healthRecordId"
      @cancel="showUpload=false"
      @confirm="upload"
    ></select-list>
  </div>
</template>
<script>
import selectList from '@/components/selectList'
export default {
  components: {
    selectList
  },
  data() {
    return {
      // 项目名称
      name: '',
      // 检查ID
      id: '',
      // 卫生事件ID
      healthEventId: '',
      // 检查机构
      institution: '',
      // 健康档案ID
      healthRecordId: '',
      // 患者姓名
      patientName: '',
      // 患者性别
      patientGender: '',
      // 患者年龄
      patientAge: '',
      // 检查时间
      occurrenceDateTime: '',
      // 检查附件
      fileList: [],
      contractID: '',
      progress: '',
      showUpload: false,
      // 事件ID
      healthEventId: '',
      type: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.id = options.id
    this.contractID = options.contractID
    this.progress = parseInt(options.progress)
    this.type = options.type
    this.healthEventId = options.healthEventId
    if(this.healthEventId) {
      this.getHealthEvent()
    } else {
      this.getDetail()
    }
  },
  onShow() {
    let pages = getCurrentPages();
    // 上一个页面
    let curPage = pages[pages.length - 1]
    if(curPage.data.dicomUrl) {
      let dicomUrl = curPage.data.dicomUrl
      delete curPage.data.dicomUrl
      this.upload({
        type: 'dicomurl',
        url: dicomUrl
      })
    }
  },
  methods: {
    getHealthEvent() {
      this.httpFly.post({
        id: this.healthEventId
      }, '/healthrecord/api/v1/partner/getHealthEvent', res => {
        this.healthRecordId = res.healthRecordId
        this.healthEventId = res.id
        this.getRecordDetail()
        this.name = res.eventType.displayName
        this.institution = res.institution
        this.occurrenceDateTime = res.occurrenceDateTime ? this.utils.formatTime(res.occurrenceDateTime, 'yyyy-mm-dd') : ''
        this.fileList = res.evidences
      })
    },
    getDetail() {
      this.httpFly.post({
        source: {
          type: 'Exam',
          identity: this.id
        }
      }, '/healthrecord/api/v1/partner/getHealthEventBySource', res => {
        this.healthRecordId = res.healthRecordId
        this.healthEventId = res.id
        this.getRecordDetail()
        this.name = res.eventType.displayName
        this.institution = res.institution
        this.occurrenceDateTime = res.occurrenceDateTime ? this.utils.formatTime(res.occurrenceDateTime, 'yyyy-mm-dd') : ''
        this.fileList = res.evidences
      })
    },
    /**
     * 获取健康档案详情
     */
    getRecordDetail() {
      this.httpFly.post({
        id: this.healthRecordId
      }, 'healthrecord/api/v1/partner/getHealthRecord', res => {
        this.patientName = res.name
        this.patientGender = res.gender
        this.patientAge = this.utils.getAge(res.dob)
      })
    },
    /**
     * 文件预览
     */
    preivewFile(file) {
      let fileType = file.fileType
      let fileUrl = file.fileUrl
      if (fileType === 'image') {
        wx.previewImage({
          current: fileUrl, // 当前显示图片的http链接
          urls: [fileUrl]
        });
      } else if (fileType === 'pdf') {
        wx.showLoading({
          title: '正在打开...',
          mask: true
        })
        wx.downloadFile({
          url: fileUrl,
          success: function (res) {
            var filePath = res.tempFilePath
            wx.openDocument({
              filePath: filePath,
              success: function (res) {
                console.log('打开文档成功')
              },
              complete: function (res) {
                wx.hideLoading()
              }
            })
          },
          fail: function () {
            wx.hideLoading()
          }
        })
      } else if (fileType === 'dicomurl') {
        wx.navigateTo({
          url: '/pages/pageview/main?url=' + encodeURIComponent(fileUrl)
        })
      }
    },
    /**
     * 收集完成
     */
    complete() {
      if(!this.fileList.length) {
        this.utils.toast('请上传检查结果')
        return
      } else {
        let _self = this
        wx.showModal({
          content: '确定已收集完成该检查的所有结果？',
          success (res) {
            if (res.confirm) {
              _self.httpFly.post({
                contractID: _self.contractID,
                examinationID: _self.id
              }, 'servicepackage/api/v1/partner/PhysicalExamination/ExaminationServiceContract/FinishExamination', res => {
                _self.progress = 400
                let pages = getCurrentPages();
                // 上一个页面
                let prevPage = pages[pages.length - 2];
                // 往上一个页面传递数据，用于刷新上一个页面数据
                prevPage.setData({
                  needRefresh: true
                })
              })
            } 
          }
        })
      }
      
    },
    /**
     * 文件上传
     */
    upload(file) {
      let param = {
        healthEventId: this.healthEventId,
        fileType: file.type,
        fileUrl: file.url
      }
      if(this.id) {
        param.source = {
          type: 'Exam',
          identity: this.id
        }
      }
      this.httpFly.post(param, 'healthRecord/api/v1/partner/createEvidence', res => {
        this.showUpload = false
        if(this.healthEventId) {
          this.getHealthEvent()
        } else {
          this.getDetail()
        }
      })
    },
    /**
     * 推送通知
     */
    sendMessage() {
      this.httpFly.post({
        healthEventId: this.healthEventId
      }, 'healthRecord/api/v1/partner/pushHealthEventMaintainedMessage', res => {
        this.utils.toast('推送成功')
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.page-wrap {
  padding: 30rpx;
  background-color: #f5f5f5;
  box-sizing: border-box;
  min-height: 100%;
  .top {
    position: relative;
    padding: 30rpx 30rpx 40rpx;
    font-size: 30rpx;
    color: #333;
    background-color: #fff;
    border-radius: 10rpx 10rpx 0 0;
    &::before {
      content: "";
      position: absolute;
      right: -15rpx;
      bottom: -15rpx;
      z-index: 1;
      width: 30rpx;
      height: 30rpx;
      background: #f5f5f5;
      border-radius: 50%;
    }
    &::after {
      content: "";
      position: absolute;
      left: -15rpx;
      bottom: -15rpx;
      z-index: 1;
      width: 30rpx;
      height: 30rpx;
      background: #f5f5f5;
      border-radius: 50%;
    }
    .title-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 10rpx;
      .title {
        font-size: 40rpx;
        font-weight: 700;
      }
      .status {
        font-size: 28rpx;
        color: #408bf1;
      }
    }

    .info {
      padding: 30rpx 0 10rpx;
      .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        line-height: 50rpx;
        font-size: 30rpx;
        color: #333;
        .label {
          color: #999;
        }
        .value {
          .gender {
            margin: 0 20rpx;
          }
        }
      }
    }
  }
  .content {
    position: relative;
    padding: 30rpx;
    background: #fff;
    border-radius: 0 0 10rpx 10rpx;
    &::after {
      content: "";
      position: absolute;
      left: 24rpx;
      right: 24rpx;
      top: -5rpx;
      height: 10rpx;
      background: radial-gradient(#f5f5f5 5rpx, transparent 5rpx);
      background-size: 20rpx 20rpx;
      background-repeat: repeat-x;
      background-position: 0;
    }
    .add-btn {
      margin: 10rpx 0 30rpx;
      width: 240rpx;
      border: 1rpx solid #408bf1;
      border-radius: 10rpx;
      line-height: 68rpx;
      text-align: center;
      font-size: 28rpx;
      color: #408bf1;
    }
    .file-list {
      display: flex;
      flex-wrap: wrap;
      margin-right: -50rpx;
      .file-item {
        margin: 0 50rpx 30rpx 0;
        width: 120rpx;
        height: 120rpx;
        img {
          display: block;
          width: 120rpx;
          height: 120rpx;
        }
      }
    }
    .complete-btn {
      margin: 150rpx auto 100rpx;
      width: 320rpx;
    }
  }
}
</style>

