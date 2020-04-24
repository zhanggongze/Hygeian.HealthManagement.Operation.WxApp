<template>
  <section class="page-index">
    <!-- top -->
    <div class="headtop">
      <div class="d1"></div>
      <div class="d2"></div>
      <div class="d3">
        <img src="/static/images/work_team.png" />
        <div class="ft">
          <p class="p1">{{activeInfo.name}}</p>
          <p class="p2">{{activeInfo.partnerName}}</p>
          <p class="p3" @click="showModal()">[切换团队]</p>
        </div>
      </div>
    </div>
    <div class="line"></div>
    <!-- 九宫格 -->
    <div class="content">
      <div class="item">
        <div class="c1">
          <div class="imgft">
            <img src="/static/images/work_subscribe.png" />
            <p>预约管理</p>
          </div>
        </div>
        <div class="c1">
          <div class="imgft">
            <img src="/static/images/work_clue.png" />
            <p>检查结果</p>
          </div>
        </div>
        <div class="c1">
          <div class="imgft">
            <img src="/static/images/work_agent.png" />
            <p>客户建档</p>
          </div>
        </div>
      </div>
      <div class="item">
        <div class="c1">
          <div class="imgft">
            <img src="/static/images/work_agencyfee.png" />
            <p>套餐赠送</p>
          </div>
        </div>
        <div class="c1"></div>
        <div class="c1"></div>
      </div>
    </div>

    <!-- modal -->
    <section v-if="isShow" class="hjModal">
      <div class="content">
        <div class="rq">
          <div
            class="item"
            v-for="(data, index) in myInfo"
            :key="index"
            @click="activeInfoFn(data)"
          >
            <img src="/static/images/work_team.png" />
            <div class="ft">
              <p class="p1">{{data.name}}</p>
              <p class="p2">{{data.partnerName}}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="close" @click="hiddenModal()">
        <img src="/static/images/work_close.png" />
      </div>
    </section>
  </section>
</template>

<script>
export default {
  data() {
    return {
      time: "123",
      isShow: false,
      activeInfo: {},
      myInfo: []
    };
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data());
    this.myInfo = wx.getStorageSync("myInfo").servings;
    this.activeInfo = this.myInfo[0];
  },
  onShow() {},
  components: {},
  methods: {
    showModal() {
      this.isShow = true;
    },
    hiddenModal() {
      this.isShow = false;
    },
    activeInfoFn(item) {
      this.activeInfo = item;
      this.isShow = false;
    }
  },
  created() {}
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
