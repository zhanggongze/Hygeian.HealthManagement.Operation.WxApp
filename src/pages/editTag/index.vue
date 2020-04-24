<template>
  <div class="page-edit-tag">
    <!-- 病情表单 -->
    <form class="condition-form">
      <div class="form-item">
        <div class="form-content">
          <div class="tag-list">
            <div
              class="tag-item ell"
              :class="{'selected': item.selected}"
              v-for="(item, index) in tags"
              :key="index"
              @click="selectTag(item)"
            >{{item.value}}</div>
            <input
              class="tag-item add-btn"
              confirm-type="done"
              placeholder-style="color:#8B8FAB"
              type="text"
              placeholder="新增标签"
              v-model="newTag"
              @confirm="addTag"
              @blur="addTag"
            />
          </div>
        </div>
      </div>
      <button class="save-btn primary-btn" hover-class="primary-btn-hover" @click="save">保存</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      id: '',
      tags: [],
      newTag: ''
    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
    this.id = options.id
    this.tags = wx.getStorageSync('tags') ? wx.getStorageSync('tags').split('、').map(obj => {
      return {
        key: obj,
        value: obj,
        selected: true
      }
    }) : []
    wx.removeStorageSync('tags')
  },
  methods: {
    /**
     * 选中疾病、标签
     */
    selectTag(data) {
      this.$set(data, 'selected', !data.selected)
    },
    /**
     * 新增标签
     */
    addTag() {
      if (this.newTag) {
        this.tags.push({
          key: this.newTag,
          value: this.newTag,
          selected: true
        })
        this.newTag = ''
      }
    },
    /**
     * 保存
     */
    save() {
      this.httpFly.post({
        grantId: this.id,
        tags: this.tags.filter(obj => obj.selected).map(obj => obj.value)
      }, 'healthrecord/api/v1/doctor/updateHealthRecordTags', res => {
        let pages = getCurrentPages()
        // 上一个页面
        let prevPage = pages[pages.length - 2]
        // 往上一个页面传递数据，用于刷新上一个页面数据
        prevPage.setData({
          needRefresh: true
        })
        // 返回上一级关闭当前页面
        wx.navigateBack({
          delta: 1
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.condition-form {
  display: block;
  padding: 0 30rpx 60rpx;
  .form-item {
    padding: 30rpx 0 0;
    .label {
      padding-bottom: 30rpx;
      font-size: 36rpx;
      color: $themeColor;
    }
    .tag-list {
      display: flex;
      flex-wrap: wrap;
      .tag-item {
        margin-bottom: 30rpx;
        margin-right: 30rpx;
        padding: 0 26rpx;
        height: 60rpx;
        border: 1rpx solid rgba(139, 143, 171, 1);
        border-radius: 30rpx;
        line-height: 60rpx;
        font-size: 24rpx;
        color: #8b8fab;
        &.selected {
          background-color: #508fff;
          border-color: #508fff;
          color: #fff;
        }
        &.add-btn {
          width: 96rpx;
          border-style: dashed;
        }
      }
    }
  }
  .save-btn {
    position: fixed;
    bottom: 60rpx;
    left: 30rpx;
    right: 30rpx;
  }
}
</style>
