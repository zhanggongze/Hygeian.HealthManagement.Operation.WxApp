<template>
  <div class="page-wrap">
    <div class="top">
      <div class="title-status">
        <div class="title">{{name}}</div>
        <div class="status">收集中</div>
      </div>
      <div class="info">
        <div class="item">
          <div class="label">检查人</div>
          <div class="value">
            {{patientName}}
            <span class="gender">{{patientGender}}</span>
            {{patientAge}}
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
      <div class="add-btn">+添加检查结果</div>
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
      <div class="primary-btn complete-btn">收集完成</div>
    </div>
    <select-list></select-list>
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
      name: 'xxx',
      // 检查ID
      id: '',
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
      // 患者关系
      familyRelation: '',
      // 检查时间
      occurrenceDateTime: '',
      // 检查附件
      fileList: [{
        fileType: 'image'
      }, {
        fileType: 'pdf'
      }, {
        fileType: 'dicomurl'
      }]
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.id = options.id
    // this.getDetail()
  },
  methods: {
    getDetail() {
      this.httpFly.post({id: this.id}, '/healthrecord/api/v1/customer/getHealthEvent', res => {
        this.healthRecordId = res.healthRecordId
        this.getRecordDetail()
        this.name = res.eventType.displayName
        this.institution = res.institution
        this.occurrenceDateTime = res.occurrenceDateTime ? this.utils.formatTime(res.occurrenceDateTime, 'yyyy-mm-dd') : ''
        this.fileList = this.fileList.concat(res.evidences)
      })
    },
    /**
     * 获取健康档案详情
     */
    getRecordDetail() {
      this.httpFly.post({
        id: this.healthRecordId
      }, 'healthrecord/api/v1/customer/getHealthRecord', res => {
        this.patientName = res.name
        this.patientGender = res.gender
        this.patientAge = this.utils.getAge(res.dob)
        let familyRelationObj = this.dicts.FamilyRelationsDict.find(item => item.value === res.familyRelation)
        this.familyRelation = familyRelationObj ? familyRelationObj['key'] : ''
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
        wx.downloadFile({
          url: fileUrl,
          success: function (res) {
            var filePath = res.tempFilePath
            wx.openDocument({
              filePath: filePath,
              success: function (res) {
                console.log('打开文档成功')
              }
            })
          }
        })
      } else if (fileType === 'dicomurl') {
        wx.navigateTo({
          url: '/pages/pageview/main?url=' + encodeURIComponent(fileUrl)
        })
      }
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
        color: #408BF1;
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
      border: 1rpx solid #408BF1;
      border-radius: 10rpx;
      line-height: 68rpx;
      text-align: center;
      font-size: 28rpx;
      color: #408BF1;
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

