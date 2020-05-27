<template>
  <div class="page-wrap">
    <div class="base-info">
      <picker @change="bindPickerChange" :range="array" range-key="key">
        <div class="form-item">
          <div class="label">发卡渠道</div>
          <div class="value">
            <div class="input">
              <span class="placeholder">请选择发卡渠道</span>
            </div>
            <div class="trangle"></div>
          </div>
        </div>
      </picker>
      <div class="form-item" @click="showCardList=true">
        <div class="label">套餐卡</div>
        <div class="value">
          <div class="input">
            <span class="placeholder">请选择套餐卡</span>
          </div>
          <div class="trangle"></div>
        </div>
      </div>
      <div class="form-item">
          <div class="label">付款方式</div>
          <div class="value">
            <div class="input">
              <span class="placeholder">请先选择套餐卡</span>
            </div>
          </div>
        </div>
      <picker @change="bindPickerChange" :range="array" range-key="key">
        <div class="form-item">
          <div class="label">服务包</div>
          <div class="value">
            <div class="input">
              <span class="placeholder">请选择服务包</span>
            </div>
            <div class="trangle"></div>
          </div>
        </div>
      </picker>
      <picker mode="date" :value="dob" @change="bindTimeChange">
        <div class="form-item">
          <div class="label">发卡日期</div>
          <div class="value">
            <div class="input">
              <span class="placeholder">请选择发卡日期</span>
            </div>
            <div class="trangle"></div>
          </div>
        </div>
      </picker>
    </div>
    <div class="hr"></div>
    <div class="num-info">
      <div class="form-item">
        <div class="label">发卡数量</div>
        <div class="value">{{totalNum}} 张</div>
      </div>
      <div class="detail-info">
        <div class="form-item">
          <div class="add-btn" @click="showDialog=true">+添加发卡明细</div>
        </div>
        <div class="form-item" v-for="(data, index) in list" :key="index">
          <div class="label">
            {{data.num}}张
            <span class="grey">({{data.start}}-{{data.end}})</span>
          </div>
          <div class="value" @click="deleteNum(index)">删除</div>
        </div>
      </div>
    </div>
    <div class="btn-wrap">
      <div class="primary-btn btn confirm-btn" @click="confirm">确定</div>
      <div class="btn cancel-btn" @click="back">取消</div>
    </div>
    <card-number-dialog :show="showDialog" @close="showDialog=false" @confirm="addNum"></card-number-dialog>
    <card-list :show="showCardList" @close="showCardList=false" @confirm="selectCard"></card-list>
  </div>
</template>
<script>
import cardNumberDialog from '@/components/card-number-dialog'
import cardList from '@/components/card-list'
export default {
  components: {
    cardNumberDialog,
    cardList
  },
  data() {
    return {
      showDialog: false,
      showCardList: false,
      // 卡明细列表
      list: []
    }
  },
  computed: {
    totalNum: function () {
      return this.list.map(obj => obj.num).reduce((a, b) => {
        return a + b
      }, 0)
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
  },
  methods: {
    /**
     * 取消
     */
    back() {
      wx.navigateBack({
        delta: 1
      })
    },
    /**
     * 添加卡数量
     */
    addNum(data) {
      this.list.push({
        start: data.start,
        end: data.end,
        num: data.end - data.start
      })
      this.showDialog = false
    },
    /**
     * 删除卡详细
     */
    deleteNum(index) {
      this.list.splice(index, 1)
    }
  }
}
</script>
<style lang="scss" scoped>
.page-wrap {
  .form-item {
    display: flex;
    align-items: center;
    padding: 29rpx 30rpx;
    border-bottom: 1rpx solid #e1e1e1;
    font-size: 32rpx;
    .label {
      width: 146rpx;
      color: #333;
    }
    .value {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #333;
      .input {
        flex: 1;
        margin-right: 20rpx;
        .placeholder {
          color: #999;
        }
      }
      .trangle {
        width: 0;
        height: 0;
        border-top: 12rpx solid #333;
        border-left: 12rpx solid transparent;
        border-right: 12rpx solid transparent;
      }
    }
  }
  .hr {
    height: 30rpx;
    background-color: #f5f5f5;
  }
  .base-info {
    border-top: 1rpx solid #e1e1e1;
  }
  .num-info {
    border-top: 1rpx solid #e1e1e1;
    .detail-info {
      padding: 0 30rpx;
      .form-item {
        padding: 29rpx 0;
        justify-content: space-between;
        .add-btn {
          width: 260rpx;
          line-height: 60rpx;
          border: 1rpx solid $themeColor;
          border-radius: 10rpx;
          text-align: center;
          font-size: 28rpx;
          color: $themeColor;
        }
        .label {
          flex: 1;
          .grey {
            color: #999;
          }
        }
        .value {
          flex: none;
          color: #ff4c4c;
        }
      }
    }
  }
  .btn-wrap {
    margin: 160rpx 30rpx 60rpx;
    display: flex;
    .btn {
      flex: 1;
      text-align: center;
      line-height: 88rpx;
      font-size: 32rpx;
      border-radius: 44rpx;
      &.cancel-btn {
        margin-left: 44rpx;
        border: 1rpx solid $themeColor;
        color: $themeColor;
      }
    }
  }
}
</style>
