<template>
  <div class="page-wrap">
    <div class="count">
      支付金额：
      <span class="price">{{totalFee}}元</span>
    </div>
    <div class="content">
      <!-- <div class="info-item">
        <div class="label">订单类型：</div>
        <div class="value">{{orderType}}</div>
      </div> -->
      <div class="info-item">
        <div class="label">订单名称：</div>
        <div class="value">{{body}}</div>
      </div>
      <div class="info-item">
        <div class="label">订单号：</div>
        <div class="value">{{flowNo}}</div>
      </div>
      <div class="info-item">
        <div class="label">下单时间：</div>
        <div class="value">{{creationDateTime}}</div>
      </div>
    </div>
    <div class="primary-btn pay-btn" @click="payment">确认支付</div>
  </div>
</template>
<script>
import { envConfig } from '@/env/index'
export default {
  data() {
    return {
      // 订单id
      orderId: "",
      // 订单号
      flowNo: '',
      // 下单时间
      creationDateTime: '',
      // 订单名称
      body: '',
      // 订单类型
      orderType: '',
      // 订单金额
      totalFee: '',
      // 支付方式
      paymethod: '',
      // 参数ID
      param: '',
      queryFirstFail: false,
      userData: ''
    };
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data());
    this.orderId = options.orderId;
    this.param = options.param
    this.getOrder();
  },
  methods: {
    getOrder() {
      this.httpFly.post(
        {
          outTradeNo: this.orderId
        },
        "/order/api/v1/partner/getOrderCashier",
        res => {
          let orderInfo = res.order
          this.body = orderInfo.body
          this.orderType = orderInfo.title
          this.flowNo = orderInfo.flowNo;
          this.creationDateTime = this.utils.formatTime(orderInfo.creationDateTime);
          this.totalFee = orderInfo.totalFee;
          if(res.paymethods && res.paymethods.length) {
            this.paymethod = res.paymethods[0]
          }
          this.userData = orderInfo.userData
        }
      );
    },
    payment() {
      this.httpFly.post({
        outTradeNo: this.orderId,
        paymethod: this.paymethod,
        appId: envConfig.APPID
      }, '/order/api/v1/partner/getOrderPayInfo', res => {
        if (res && res.flowno) {
          let flowno = res.flowno
          if(res.payInfo) {
            let payInfo = JSON.parse(res.payInfo)
            if(this.paymethod === 'weixin') {
              this.wechatPay(payInfo, flowno)
            }
          } else {
            wx.redirectTo({
              url: '/pages/paySuccess/main?redirectUrl=' + encodeURIComponent(this.userData)
            })
          }
        }
      })
    },
    wechatPay(payInfo, flowno) {
      let _self = this
      wx.requestPayment({
        timeStamp: String(payInfo.timeStamp),
        nonceStr: payInfo.nonceStr,
        package: payInfo.package,
        signType: 'MD5',
        paySign: payInfo.paySign,
        success(res) {
          _self.orderQuery(flowno)
        },
        fail(res) {
          _self.utils.toast('支付失败')
        }
      })
    },
    orderQuery(flowno) {
      this.httpFly.post({
        flowno
      }, '/order/api/v1/payment/wechat/orderQuery', res => {
        if (res && res.isSucceed) {
          if (res.userData) {
            let userData = res.userData
            wx.redirectTo({
              url: '/pages/paySuccess/main?redirectUrl=' + encodeURIComponent(userData)
            })
          }
        } else {
          this.utils.toast('支付失败')
        }
      }, error => {
        if(error && error.status === 409 && !this.queryFirstFail) {
          this.queryFirstFail = true
          this.orderQuery(flowno)
        }
      })
    }
  }
};
</script>
<style lang="scss" scoped>
.page-wrap {
  background-color: #f5f5f5;
  border-top: 1rpx solid #e1e1e1;
  .count {
    padding: 0 30rpx;
    background-color: #fff;
    line-height: 100rpx;
    font-size: 32rpx;
    color: #333;
    .price {
      color: #ff6900;
    }
  }
  .content {
    margin-top: 30rpx;
    padding: 20rpx 30rpx;
    background-color: #fff;
    font-size: 28rpx;
    color: #333;
    .info-item {
      display: flex;
      line-height: 50rpx;
    }
  }
  .pay-btn {
    margin: 60rpx 30rpx 0;
  }
}
</style>