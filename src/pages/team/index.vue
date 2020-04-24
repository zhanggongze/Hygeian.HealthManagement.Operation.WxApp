<template>
  <div class="page-wrap">
    <div class="empty-wrap">
      <div class="empty">
        <img src="/static/images/empty_team.png" alt />
        <div class="tip">暂无团队成员</div>
      </div>
    </div>

    <!-- <div class="team-list">
      <div class="team-item">
        <img class="doctor-photo" src="/static/images/index_photo.png" alt />
        <div class="info">
          <div class="name-level">
            <div class="name">李强</div>
            <div class="level">主任医师</div>
          </div>
          <div class="hospital-depart">
            <div class="hospital">南昌大学第一附属医院</div>
            <div class="depart">心血管科</div>
          </div>
        </div>
      </div>
      <div class="team-item">
        <img class="doctor-photo" src="/static/images/index_photo.png" alt />
        <div class="info">
          <div class="name-level">
            <div class="name">李强</div>
            <div class="level">主任医师</div>
          </div>
          <div class="hospital-depart">
            <div class="hospital">南昌大学第一附属医院</div>
            <div class="depart">心血管科</div>
          </div>
        </div>
      </div>
      <div class="team-item">
        <img class="doctor-photo" src="/static/images/index_photo.png" alt />
        <div class="info">
          <div class="name-level">
            <div class="name">李强</div>
            <div class="level">主任医师</div>
          </div>
          <div class="hospital-depart">
            <div class="hospital">南昌大学第一附属医院</div>
            <div class="depart">心血管科</div>
          </div>
        </div>
      </div>
      <div class="team-item">
        <img class="doctor-photo" src="/static/images/index_photo.png" alt />
        <div class="info">
          <div class="name-level">
            <div class="name">李强</div>
            <div class="level">主任医师</div>
          </div>
          <div class="hospital-depart">
            <div class="hospital">南昌大学第一附属医院</div>
            <div class="depart">心血管科</div>
          </div>
        </div>
      </div>
      <div class="team-item">
        <img class="doctor-photo" src="/static/images/index_photo.png" alt />
        <div class="info">
          <div class="name-level">
            <div class="name">李强</div>
            <div class="level">主任医师</div>
          </div>
          <div class="hospital-depart">
            <div class="hospital">南昌大学第一附属医院</div>
            <div class="depart">心血管科</div>
          </div>
        </div>
      </div>
      <div class="team-item">
        <img class="doctor-photo" src="/static/images/index_photo.png" alt />
        <div class="info">
          <div class="name-level">
            <div class="name">李强</div>
            <div class="level">主任医师</div>
          </div>
          <div class="hospital-depart">
            <div class="hospital">南昌大学第一附属医院</div>
            <div class="depart">心血管科</div>
          </div>
        </div>
      </div>
    </div>-->
    <!-- <div class="primary-btn add-btn" hover-class="primary-btn-hover">邀请加入</div> -->
  </div>
</template>

<script>
export default {
  data() {
    return {

    }
  },
  onLoad(options) {
    Object.assign(this.$data, this.$options.data())
  },
  methods: {

  }
}
</script>

<style lang="scss" scoped>
.page-wrap {
  padding-bottom: 100rpx;
  .empty-wrap {
    display: flex;
    justify-content: center;
    .empty {
      padding-top: 200rpx;
      img {
        width: 280rpx;
        height: 210rpx;
      }
      .tip {
        font-size: 36rpx;
        color: #999;
        text-align: center;
      }
    }
  }
  .team-list {
    .team-item {
      display: flex;
      align-items: center;
      padding: 30rpx;
      .doctor-photo {
        width: 100rpx;
        height: 100rpx;
      }
      .info {
        flex: 1;
        margin-left: 12rpx;
        font-size: 24rpx;
        color: #999;
        .name-level {
          display: flex;
          align-items: center;
          .name {
            margin-right: 30rpx;
            font-size: 32rpx;
            color: #333;
          }
        }
        .hospital-depart {
          display: flex;
          align-items: center;
          margin-top: 10rpx;
          .hospital {
            margin-right: 40rpx;
          }
        }
      }
    }
  }
  .add-btn {
    position: fixed;
    bottom: 0;
    width: 100%;
    border-radius: 0;
  }
}
</style>