<template>
  <div class="loading">
    <img src="/static/images/start_logo.png" />
  </div>
</template>

<script>
import im from "@/utils/im";
import { envConfig } from "@/env/index";
export default {
  data() {
    return {
      phone: ""
    };
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data());
    if (options.targetUrl) {
      wx.setStorageSync("targetUrl", decodeURIComponent(options.targetUrl));
    }
    this.init();
  },
  methods: {
    /**
     * 初始化
     */
    init() {
      if (wx.getStorageSync("token")) {
        this.getCurrentEmployee();
      } else {
        let _self = this;
        wx.login({
          success(res) {
            if (res && res.code) {
              _self.httpFly.post(
                {
                  clientId: envConfig.CLIENTID,
                  appId: envConfig.APPID,
                  code: res.code,
                  state: ""
                },
                "/identities/api/v1/oauth/loginByWxOAuth",
                res => {
                  wx.setStorageSync("token", "Bearer " + res["accessToken"]);
                  wx.setStorageSync("refreshToken", res["refreshToken"]);
                  _self.getUserInfo();
                  _self.loginIm(_self);
                },
                () => {
                  _self.goLogin();
                }
              );
            } else {
              _self.goLogin();
            }
          },
          fail() {
            _self.goLogin();
          }
        });
      }
    },

    /**
     * 跳转首页
     */
    goIndex() {
      wx.navigateTo({
        url: "/pages/index/main"
      });
    },
    /**
     * 跳转登录页
     */
    goLogin() {
      wx.redirectTo({
        url: "/pages/wxAuth/main"
      });
    },
    getCurrentEmployee() {
      this.httpFly.post(
        {},
        "/organization/api/v1/partner/getCurrentEmployee",
        res => {
          wx.setStorageSync("myInfo", res);
          this.goIndex();
        }
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.loading {
  position: absolute;
  z-index: 1000;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  background: #fff;
  img {
    position: absolute;
    bottom: 100rpx;
    width: 238rpx;
    height: 84rpx;
  }
}
</style>