<template>
  <div class="page-wrap">
    <div class="doctor-card">
      <img class="img" :src="doctorImgUrl" alt srcset />
      <div class="info">
        <div class="name-level">
          <div class="name">{{doctorName}}</div>
          <div class="level">{{doctorProfessionalTitle}}</div>
        </div>
        <div class="hospital-department">
          <div class="hospital">{{doctorHospital}}</div>
          <div class="department">{{doctorDepartment}}</div>
        </div>
      </div>
    </div>
    <div class="patient-content" @click="selectHealthRecord">
      <div class="label">咨询人</div>
      <div class="value">
        <div class="patient-info">
          <div class="name-relation">
            <div class="name">{{patientName}}</div>
          </div>
          <div class="gender-age">
            <div class="gender">性别：{{patientGender}}</div>
            <div class="age">年龄：{{patientAge}}岁</div>
          </div>
        </div>
      </div>
    </div>
    <div class="form-content">
      <div class="form-label">请描述您的病情</div>
      <textarea
        class="textarea"
        name
        id
        v-model="illnessDescribe"
        placeholder="为了更好获得专家帮助，请尽可能详细描述病情"
        maxlength=500
      ></textarea>
      <div class="file-content">
        <div class="label">上传检查报告或患处照片(最多9张)</div>
        <div class="tip">照片仅自己和专家可见</div>
        <div class="file-list">
          <div class="file-item" v-for="(file, index) in fileList" :key="index">
            <img class="file-img" :src="file.url" @click="previewFile(file.url, fileList)" alt />
            <img class="delete-btn" src="/static/images/icon-delete.png" alt="" srcset="" @click="deleteFile(index)">
          </div>
          <picker @change="fileChange" :range="optList" v-if="fileList.length !== 9">
            <div class="add-file-btn">
              <div>+</div>
            </div>
          </picker>
        </div>
      </div>
    </div>
    <div class="service-introduce">
      <img :src="serviceUrl" mode="widthFix" alt style="width: 100%" />
    </div>
    <div class="submit-wrap has-constract" v-if="!customerContractId">
      <!-- <div class="price-unit">
        <div class="price">{{sellingFee}}元</div>
        <div class="unit">原价:{{showingFee}}元</div>
      </div> -->
      <div class="pay-btn" @click="submitForm">确认发起</div>
    </div>
    <div class="submit-wrap has-constract" v-else>
      <div class="pay-btn" @click="submitForm">提交</div>
    </div>
  </div>
</template>
<script>
import Upload from "@/utils/upload";
import { envConfig } from '@/env/index'
export default {
  data() {
    return {
      serviceUrl: envConfig.SERVIEASKURL + '?t=' + new Date().getTime(),
      // 医生姓名
      doctorName: "",
      // 医生职称
      doctorProfessionalTitle: "",
      // 医生所属医院
      doctorHospital: "",
      // 所属科室
      doctorDepartment: "",
      // 医生头像
      doctorImgUrl: "",
      // 显示金额
      sellingFee: '',
      // 售卖金额
      showingFee: '',
      // 医生ID
      doctorId: "",
      // 健康档案ID
      healthRecordId: "",
      // 患者姓名
      patientName: "",
      // 患者性别
      patientGender: "",
      // 患者年龄
      patientAge: "",
      // 患者关系
      familyRelation: "",
      // 病情描述
      illnessDescribe: "",
      customerId: '',
      // 附件列表
      fileList: [],
      optList: ['从相册中选择', '从附件中选择'],
      // 消费合同ID
      customerContractId: '',
      // 消费合同ItemID
      customerContractItemId: '',
      // 服务项名称
      name: ''
    };
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.doctorId = options.doctorID
    this.showingFee = options.showingFee
    this.sellingFee = options.sellingFee
    this.healthRecordId = options.healthRecordId
    this.customerContractId = options.customerContractId
    this.customerContractItemId = options.customerContractItemId
    this.name = options.name
    this.customerId = options.customerId
    this.queryDoctorInfo()
    this.getDetail()
  },
  onShow() {
    let pages = getCurrentPages();
    let curPage = pages[pages.length - 1];
    if (curPage.data.urls) {
      this.fileList = this.fileList.concat(curPage.data.urls.map(obj => {
        return {
          url: obj
        }
      }))
      delete curPage.data.urls;
    }
  },
  methods: {
    /**
     * 查询医生信息
     */
    queryDoctorInfo() {
      this.httpFly.post(
        {
          query: `query{
          doctor(doctorID:"${this.doctorId}") {
            name,
            headImageUrl,
            hospitalName,
            professionalTitle,
            departmentName,
            skilful
          }
        }`
        },
        "/medicalgroup/api/graphql",
        res => {
          // todo 若能查询到，则进入下一步获取服务契约，否则隐藏咨询按钮
          if (
            res &&
            res.data &&
            res.data.doctor
          ) {
            let doctorInfo = res.data.doctor;
            this.doctorProfessionalTitle = this.dict.professionalDict[
              doctorInfo.professionalTitle.toUpperCase()
            ];
            this.doctorName = doctorInfo.name;
            this.doctorDepartment = doctorInfo.departmentName;
            this.doctorHospital = doctorInfo.hospitalName;
            this.doctorImgUrl = doctorInfo.headImageUrl
          }
        }
      );
    },
    /**
     * 获取健康档案详情
     */
    getDetail() {
      this.httpFly.post({
        id: this.healthRecordId
      }, 'healthrecord/api/v1/partner/getHealthRecord', res => {
        this.patientName = res.name;
        this.patientGender = res.gender;
        this.patientAge = new Date().getFullYear() - new Date(res.dob).getFullYear()
      })
    },
    fileChange(e) {
      let index = parseInt(e.mp.detail.value)
      if (index === 0) {
        this.uploadFile()
      } else if (index === 1) {
        if (this.healthRecordId) {
          wx.navigateTo({
            url: '/pages/fileList/main?id=' + this.healthRecordId + '&maxlen=' + (9 - this.fileList.length)
          })
        } else {
          this.utils.toast("请选择为谁咨询")
        }
      }
    },
    uploadFile() {
      let mkdir = "service/consultant/ask/";
      let _self = this;
      wx.chooseImage({
        count: 9 - this.fileList.length, // 默认9
        sizeType: ["original", "compressed"], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
        success: function(res) {
          (async () => {
            let uploadTasks = [];
            for (let file of res.tempFilePaths) {
              uploadTasks.push(_self.createUploadTasks(file, mkdir));
            }
            Promise.all(uploadTasks)
              .then(res => {
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
    /**
     * 创建上传任务
     */
    createUploadTasks(filepath, mkdir) {
      let _self = this;
      return new Promise((resolve, reject) => {
        Upload.uploadFile(filepath, mkdir)
          .then(filepath => {
            _self.fileList.push({
              url: envConfig.FILEBASEURL + "/" + filepath
            });
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /**
     * 提交咨询
     */
    submitForm() {
      if (!this.healthRecordId) {
        this.utils.toast("请选择咨询人");
        return;
      }
      if (!this.illnessDescribe) {
        this.utils.toast("请填写病情描述");
        return;
      }
      this.httpFly.post(
        {
          healthRecordId: this.healthRecordId,
          patientName: this.patientName,
          patientGender: this.patientGender,
          patientAge: this.patientAge,
          doctorId: this.doctorId,
          illnessDescribe: this.illnessDescribe,
          imageUrls: this.fileList.map(obj => obj.url),
          customerId: this.customerId,
          name: this.name
        },
        "/servicepackage//api/v1/partner/Consult/Ask/Reserve",
        res => {
          let consultationID = res.consultationID
          if(this.customerContractId) {
            this.httpFly.post({
              customerContractId: this.customerContractId,
              customerContractItemId: this.customerContractItemId,
              provider: {
                type: 'Doctor',
                identity: this.doctorId
              },
              businessId: consultationID
            }, 'servicepackage/api/v1/partner/CustomerContracts/ConsumeCustomerContract', res => {
              wx.reLaunch({
                url: '/pages/startServiceList/main'
              })
            })
          } else {
            wx.redirectTo({
              url: '/pages/servicePackageLoading/main?businessServiceID=' + consultationID
            })
            // let pages = getCurrentPages()
            // // 上一个页面
            // let prevPage = pages[pages.length - 2]
            // // 往上一个页面传递数据，用于刷新上一个页面数据
            // prevPage.setData({
            //   businessServiceID: consultationID
            // })
            // // 返回上一级关闭当前页面
            // wx.navigateBack({
            //   delta: 1
            // })
          }
        }
      );
    },
    deleteFile(index) {
      this.fileList.splice(index, 1)
    },
    previewFile(url, list) {
      wx.previewImage({
        current: url,
        urls: list ? list.map(obj => obj.url) : [url]
      })
    }
  }
};
</script>
<style lang="scss" scoped>
.page-wrap {
  box-sizing: border-box;
  padding-bottom: 1rpx;
  background-color: #f5f5f5;
}
.doctor-card {
  margin-bottom: 30rpx;
  padding: 10rpx 30rpx 30rpx;
  display: flex;
  background-color: #fff;
  .img {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
  }
  .info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
    margin-left: 20rpx;
    .name-level {
      display: flex;
      align-items: flex-end;
      color: #333;
      .name {
        font-size: 36rpx;
      }
      .level {
        margin-left: 20rpx;
        font-size: 26rpx;
      }
    }
    .hospital-department {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #999;
      .hospital {
        margin-right: 20rpx;
      }
    }
  }
}
.form-content {
  padding: 0 30rpx 10rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #e1e1e1;
  .form-label {
    font-size: 36rpx;
    color: #333;
    line-height: 80rpx;
  }
  .textarea {
    padding: 0;
    height: 230rpx;
    background-color: #fff;
    border-bottom: 1rpx solid #e1e1e1;
    font-size: 30rpx;
  }
  .file-content {
    font-size: 26rpx;
    color: #333;
    .label {
      margin: 20rpx 0 10rpx;
    }
    .tip {
      color: #999;
    }
    .file-list {
      display: flex;
      flex-wrap: wrap;
      margin: 30rpx 0 0;
      .file-item {
        position: relative;
        margin: 0 16rpx 20rpx 0;
        .file-img {
          display: block;
          width: 120rpx;
          height: 120rpx;
        }
        .delete-btn {
          position: absolute;
          top: -12rpx;
          right: -12rpx;
          width: 40rpx;
          height: 40rpx;
        }
      }
      .add-file-btn {
        margin: 0 16rpx 20rpx 0;
        width: 120rpx;
        height: 120rpx;
        background-color: #eee;
        text-align: center;
        line-height: 104rpx;
        font-size: 80rpx;
        color: #ccc;
      }
    }
  }
}
.patient-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx;
  height: 136rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #e1e1e1;
  .label {
    font-size: 36rpx;
    color: #333;
  }
  .value {
    display: flex;
    align-items: center;
    .patient-info {
      font-size: 28rpx;
      color: #999;
      .name-relation {
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        color: #333;
        .name {
          margin-right: 20rpx;
          font-size: 36rpx;
        }
      }
      .gender-age {
        display: flex;
        align-items: center;
        margin-top: 6rpx;
        .gender {
          margin-right: 20rpx;
        }
      }
    }
    .direct-icon {
      width: 30rpx;
      height: 30rpx;
    }
  }
}
.service-introduce {
  margin-top: 30rpx;
  background-color: #fff;
}
.submit-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 30rpx;
  padding: 0 30rpx;
  height: 120rpx;
  background-color: #fff;
  border-top: 1rpx solid #e1e1e1;
  &.has-constract {
    justify-content: center;
  }
  .price-unit {
    display: flex;
    align-items: flex-end;
    font-size: 30rpx;
    color: #FF6900;
    .price {
      margin-right: 16rpx;
      font-size: 48rpx;
    }
    .unit {
      color: #999;
      text-decoration:line-through;
    }
  }
  .info {
    font-size: 26rpx;
    .name {
      font-size: 30rpx;
    }
  }
  .pay-btn {
    width: 180rpx;
    height: 60rpx;
    background:linear-gradient(-45deg,rgba(34,172,251,1),rgba(64,139,241,1));
    border-radius: 30rpx;
    text-align: center;
    line-height: 60rpx;
    font-size: 30rpx;
    color: #fff;
  }
}
</style>