<template>
  <section class="hjPage">
    <div class="hjform">
      <div class="item">
        <div class="d1">
          <span>*</span>
          <p>附件时间</p>
        </div>
        <div class="d2">
          <picker
            mode="date"
            :value="pickDate"
            :start="pickerStart"
            end="2217-09-01"
            @change="bindDateChangeStart($event)"
          >
            <div class="index_picker">
              <div style="color:#999">{{ pickDate }}</div>
            </div>
          </picker>
        </div>
        <div class="d3">
          <div class="triangleDiv"></div>
        </div>
      </div>
      <div class="item" @click="navtoEventTypeList()">
        <div class="d1">
          <span>*</span>
          <p>事件类型</p>
        </div>
        <div class="d2">
          <p v-if="codeId">{{codeName}}</p>
          <p v-if="!codeId" style="color:#999">{{codeName}}</p>
          <!-- <input readonly type="text" placeholder="请选择事件类型" /> -->
        </div>
        <div class="d3">
          <div class="triangleDiv"></div>
        </div>
      </div>
      <div class="item">
        <div class="d1">
          <span>*</span>
          <p>机构</p>
        </div>
        <div class="d2">
          <input v-model="institution" type="text" placeholder="请填写机构名称" />
        </div>
      </div>
    </div>

    <button class="btn" @click="create()">创建</button>
  </section>
</template>

<script>
export default {
  data() {
    return {
      healthRecordId: "",
      pickDate: "请选择附件时间",
      institution: "",
      codeId: "",
      codeName: ""
    };
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data());
  },
  onShow() {
    let pages = getCurrentPages();
    // 上一个页面
    let prevPage = pages[pages.length - 1];
    console.log(prevPage.data.codeId);
    this.codeId = prevPage.data.codeId;
    this.codeName = prevPage.data.codeName || "请选择事件类型";
  },
  components: {},
  methods: {
    create() {
      // 校验
      if (this.pickDate === "请选择附件时间") {
        this.msg("附件时间不能为空！");
        return;
      } else if (!this.codeId) {
        this.msg("事件不能为空！");
        return;
      } else if (!this.institution) {
        this.msg("机构不能为空！");
        return;
      }

      // 创建卫生事件
      let reqData = {
        healthRecordId: this.healthRecordId,
        occurrenceDateTime: this.pickDate,
        eventType: { code: this.codeId, displayName: this.codeName },
        institution: this.institution
      };
      this.httpFly.post(
        reqData,
        "/healthrecord/api/v1/partner/createHealthEvent",
        res => {
          this.msg("创建成功！");
          wx.navigateBack({
            delta: 1
          });
        }
      );
    },
    msg(msg) {
      wx.showToast({
        title: msg,
        icon: "none",
        duration: 1500,
        mask: false
      });
    },
    bindDateChangeStart(e) {
      console.log(e);
      this.pickDate = e.target.value;
    },
    navtoEventTypeList() {
      wx.navigateTo({
        url: "/pages/eventTypeList/main"
      });
    }
  },
  created() {}
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
